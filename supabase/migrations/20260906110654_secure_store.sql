create table public.manbro_categories (
  id text primary key,
  name text not null unique,
  slug text not null unique,
  description text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.manbro_products (
  id text primary key,
  slug text not null unique,
  category text not null references public.manbro_categories(name),
  data jsonb not null,
  version integer not null default 1,
  constraint product_identity check (data->>'id' = id and data->>'slug' = slug and data->>'category' = category),
  constraint product_price check ((data->>'price')::numeric >= 0),
  constraint product_variants check (jsonb_typeof(data->'variants') = 'array')
);
create index manbro_products_category_idx on public.manbro_products(category);
create table public.manbro_orders (
  id text primary key,
  request_id uuid not null unique,
  request_data jsonb not null,
  phone text not null check (phone ~ '^[0-9]{8,15}$'),
  data jsonb not null,
  created_at timestamptz not null default now()
);
create index manbro_orders_created_idx on public.manbro_orders(created_at desc);

alter table public.manbro_categories enable row level security;
alter table public.manbro_products enable row level security;
alter table public.manbro_orders enable row level security;
revoke all on public.manbro_categories, public.manbro_products, public.manbro_orders from public, anon, authenticated;
grant select, insert, update, delete on public.manbro_categories, public.manbro_products, public.manbro_orders to service_role;

create function public.manbro_product_version() returns trigger language plpgsql set search_path = '' as $$
begin
  new.version := old.version + 1;
  return new;
end;
$$;
create trigger manbro_product_version before update on public.manbro_products for each row execute function public.manbro_product_version();
revoke all on function public.manbro_product_version() from public, anon, authenticated;

-- Only the server service role may invoke these transactions. Never grant them to browser roles.
create function public.manbro_create_order(p_address jsonb, p_items jsonb, p_request_id uuid)
returns jsonb language plpgsql security invoker set search_path = '' as $$
declare
  saved public.manbro_orders%rowtype;
  product public.manbro_products%rowtype;
  item jsonb; variant jsonb; variants jsonb; lines jsonb := '[]';
  qty integer; unit_price numeric; subtotal numeric := 0; shipping numeric; tax numeric;
  order_id text := 'ORD-' || upper(gen_random_uuid()::text);
  result jsonb; phone text := p_address->>'phone';
  payload jsonb := jsonb_build_object('address', p_address, 'items', p_items);
begin
  if p_request_id is null or jsonb_typeof(p_items) is distinct from 'array' then raise exception 'Invalid request'; end if;
  if jsonb_array_length(p_items) not between 1 and 100 or phone is null or phone !~ '^[0-9]{8,15}$' then raise exception 'Invalid request'; end if;
  if exists(select 1 from jsonb_array_elements(p_items) v group by v->>'productId', v->>'size', v->>'color' having count(*) > 1) then raise exception 'Duplicate variant'; end if;
  -- Serialize retries before stock locks so one request can only reserve once.
  perform pg_advisory_xact_lock(hashtextextended(p_request_id::text, 0));
  select * into saved from public.manbro_orders where request_id = p_request_id;
  if found then
    if saved.request_data <> payload then raise exception 'Request changed'; end if;
    return saved.data - 'adminNotes';
  end if;
  perform id from public.manbro_products where id in (select value->>'productId' from jsonb_array_elements(p_items)) order by id for update;
  for item in select value from jsonb_array_elements(p_items) loop
    if jsonb_typeof(item->'quantity') is distinct from 'number' or (item->>'quantity') !~ '^[0-9]+$' then raise exception 'Invalid quantity'; end if;
    qty := (item->>'quantity')::integer;
    if qty not between 1 and 100 then raise exception 'Invalid quantity'; end if;
    select * into product from public.manbro_products where id = item->>'productId';
    if not found then raise exception 'Product unavailable'; end if;
    select value into variant from jsonb_array_elements(product.data->'variants') where value->>'size' = item->>'size' and value->'color'->>'name' = item->>'color';
    if variant is null or (variant->>'stock')::integer < qty then raise exception 'Insufficient stock'; end if;
    unit_price := coalesce((variant->>'price')::numeric, (product.data->>'price')::numeric);
    if unit_price is null or unit_price < 0 then raise exception 'Invalid price'; end if;
    subtotal := subtotal + unit_price * qty;
    lines := lines || jsonb_build_array(jsonb_build_object(
      'id', product.id || '-' || (variant->>'id'),
      'product', product.data || jsonb_build_object('price', unit_price),
      'selectedSize', variant->>'size', 'selectedColor', variant->'color', 'quantity', qty
    ));
    select jsonb_agg(case when value->>'id' = variant->>'id' then jsonb_set(value, '{stock}', to_jsonb((value->>'stock')::integer - qty)) else value end order by ord)
      into variants from jsonb_array_elements(product.data->'variants') with ordinality as v(value,ord);
    update public.manbro_products set data = data || jsonb_build_object('variants', variants, 'inStock', exists(select 1 from jsonb_array_elements(variants) v where (v->>'stock')::integer > 0)) where id = product.id;
  end loop;
  subtotal := round(subtotal, 2);
  shipping := case when subtotal >= 150 then 0 else 15 end;
  tax := round(subtotal * 0.08);
  result := jsonb_build_object('id', order_id, 'createdAt', now(), 'items', lines, 'shippingAddress', p_address,
    'subtotal', subtotal, 'discount', 0, 'shipping', shipping, 'tax', tax, 'total', subtotal + shipping + tax, 'status', 'NEW');
  insert into public.manbro_orders(id, request_id, request_data, phone, data) values(order_id, p_request_id, payload, phone, result);
  return result;
end;
$$;
revoke all on function public.manbro_create_order(jsonb,jsonb,uuid) from public, anon, authenticated;
grant execute on function public.manbro_create_order(jsonb,jsonb,uuid) to service_role;

create function public.manbro_update_order(p_id text, p_patch jsonb)
returns boolean language plpgsql security invoker set search_path = '' as $$
declare
  old_data jsonb; new_status text; item jsonb; product public.manbro_products%rowtype; variants jsonb;
begin
  select data into old_data from public.manbro_orders where id = p_id for update;
  if not found then return false; end if;
  if p_patch - array['status','trackingInfo','adminNotes'] <> '{}'::jsonb then raise exception 'Invalid order update'; end if;
  new_status := coalesce(p_patch->>'status', old_data->>'status');
  if p_patch ? 'trackingInfo' and new_status in ('NEW','CONFIRMED','PROCESSING') then new_status := 'SHIPPED'; end if;
  if new_status not in ('NEW','CONFIRMED','PROCESSING','SHIPPED','DELIVERED','CANCELLED') then raise exception 'Invalid status'; end if;
  if old_data->>'status' = 'CANCELLED' and (new_status <> 'CANCELLED' or p_patch ? 'trackingInfo') then raise exception 'Cancelled orders cannot be reopened'; end if;
  if new_status = 'CANCELLED' and old_data->>'status' <> 'CANCELLED' then
    if old_data->>'status' in ('SHIPPED','DELIVERED') then raise exception 'Shipped orders require a manual return'; end if;
    perform id from public.manbro_products where id in (select value->'product'->>'id' from jsonb_array_elements(old_data->'items')) order by id for update;
    for item in select value from jsonb_array_elements(old_data->'items') loop
      select * into product from public.manbro_products where id = item->'product'->>'id';
      if found then
        select jsonb_agg(case when value->>'size' = item->>'selectedSize' and value->'color'->>'name' = item->'selectedColor'->>'name'
          then jsonb_set(value, '{stock}', to_jsonb((value->>'stock')::integer + (item->>'quantity')::integer)) else value end order by ord)
          into variants from jsonb_array_elements(product.data->'variants') with ordinality as v(value,ord);
        update public.manbro_products set data = data || jsonb_build_object('variants', variants, 'inStock', exists(select 1 from jsonb_array_elements(variants) v where (v->>'stock')::integer > 0)) where id = product.id;
      end if;
    end loop;
  end if;
  update public.manbro_orders set data = old_data || p_patch || jsonb_build_object('status', new_status) where id = p_id;
  return true;
end;
$$;
revoke all on function public.manbro_update_order(text,jsonb) from public, anon, authenticated;
grant execute on function public.manbro_update_order(text,jsonb) to service_role;
