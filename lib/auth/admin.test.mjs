import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";
import { runInNewContext } from "node:vm";

const require = createRequire(import.meta.url);
const ts = require("typescript");
const { NextRequest, NextResponse } = require("next/server");

function setup() {
  const env = {
    NODE_ENV: "production",
    SUPABASE_URL: "https://example.supabase.co",
    SUPABASE_ANON_KEY: "test-anon",
    SUPABASE_SERVICE_ROLE_KEY: "test-service",
  };
  const state = {
    token: "access-token",
    role: "admin",
    error: null,
    throws: false,
    expiresAt: Math.floor(Date.now() / 1000) + 120,
    calls: [],
  };
  const auth = {
    getUser: async (token) => {
      state.calls.push(["getUser", token]);
      if (state.throws) throw new Error("backend-secret");
      return { data: { user: { app_metadata: { role: state.role }, user_metadata: { role: "admin" } } }, error: state.error };
    },
    signInWithPassword: async (credentials) => {
      state.calls.push(["signIn", credentials]);
      if (state.throws) throw new Error("backend-secret");
      return {
        data: { user: { app_metadata: { role: state.role } }, session: { access_token: "access-token", expires_at: state.expiresAt } },
        error: state.error,
      };
    },
    signOut: async (...args) => {
      state.calls.push(["signOut", ...args]);
      if (state.throws) throw new Error("backend-secret");
    },
  };
  const mocks = {
    "server-only": {},
    "next/server": { NextRequest, NextResponse },
    "next/headers": { cookies: async () => ({ get: () => state.token ? { value: state.token } : undefined }) },
    "@/lib/db/client": { getDb: () => ({ auth: { getUser: auth.getUser, admin: { signOut: auth.signOut } } }) },
    "@supabase/supabase-js": {
      createClient: (...args) => { state.calls.push(["createClient", ...args]); return { auth }; },
    },
  };
  function load(relative) {
    const source = readFileSync(new URL(relative, import.meta.url), "utf8");
    const { outputText } = ts.transpileModule(source, {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    });
    const exports = {};
    runInNewContext(outputText, {
      exports, process: { env }, URL, Date,
      require: (name) => {
        assert.ok(name in mocks, `Unexpected dependency: ${name}`);
        return mocks[name];
      },
    });
    return exports;
  }
  const admin = load("./admin.ts");
  mocks["@/lib/auth/admin"] = admin;
  return { admin, env, state, load };
}

function request(path, origin = "http://localhost:3002", body = { email: "admin@example.com", password: "test-password" }) {
  return new NextRequest(`http://localhost:3002/api/admin/auth/${path}`, {
    method: "POST",
    headers: { Origin: origin, "Content-Type": "application/json", Cookie: "manbro_admin_session=access-token" },
    body: JSON.stringify(body),
  });
}

test("admin authorization validates token remotely, trusts only app_metadata, and fails closed", async () => {
  const { admin, state } = setup();
  assert.equal(await admin.isAdmin(), true);
  assert.deepEqual(state.calls[0], ["getUser", "access-token"]);
  await admin.requireAdmin();
  state.role = "customer";
  assert.equal(await admin.isAdmin(), false);
  await assert.rejects(admin.requireAdmin(), /Unauthorized/);
  state.role = "admin";
  state.error = { message: "expired" };
  assert.equal(await admin.isAdmin(), false);
  state.error = null;
  state.throws = true;
  assert.equal(await admin.isAdmin(), false);
  state.token = "";
  state.calls = [];
  assert.equal(await admin.isAdmin(), false);
  assert.equal(state.calls.length, 0);
});

test("origin guard preserves local ports and allows only exact request/configured origins", () => {
  const { admin, env } = setup();
  assert.equal(admin.isSameOrigin(request("login")), true);
  for (const origin of ["http://localhost:3000", "https://evil.example", "null", ""]) {
    assert.equal(admin.isSameOrigin(request("login", origin)), false);
  }
  env.NEXT_PUBLIC_APP_URL = "https://shop.example/";
  assert.equal(admin.isSameOrigin(request("login", "https://shop.example")), true);
  assert.equal(admin.isSameOrigin(request("login", "https://shop.example.evil")), false);
});

test("login uses isolated anon client and sets only a short-lived strict HttpOnly cookie", async () => {
  const { load, state } = setup();
  const response = await load("../../app/api/admin/auth/login/route.ts").POST(request("login"));
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { success: true });
  const options = state.calls.find(([name]) => name === "createClient");
  assert.equal(options[2], "test-anon");
  assert.equal(options[3].auth.persistSession, false);
  assert.equal(options[3].auth.autoRefreshToken, false);
  assert.equal(options[3].auth.detectSessionInUrl, false);
  const cookie = response.cookies.get("manbro_admin_session");
  assert.equal(cookie.httpOnly, true);
  assert.equal(cookie.sameSite, "strict");
  assert.equal(cookie.secure, true);
  assert.ok(cookie.maxAge > 0 && cookie.maxAge <= 120);
  assert.ok(cookie.expires.getTime() <= state.expiresAt * 1000);
});

test("login rejects cross-origin, missing config, invalid input, non-admin and backend errors", async () => {
  const { load, state, env } = setup();
  const { POST } = load("../../app/api/admin/auth/login/route.ts");
  assert.equal((await POST(request("login", "https://evil.example"))).status, 403);
  assert.equal(state.calls.length, 0);
  env.SUPABASE_ANON_KEY = "";
  assert.equal((await POST(request("login"))).status, 503);
  env.SUPABASE_ANON_KEY = env.SUPABASE_SERVICE_ROLE_KEY;
  assert.equal((await POST(request("login"))).status, 503);
  env.SUPABASE_ANON_KEY = "test-anon";
  assert.equal((await POST(request("login", undefined, null))).status, 400);
  state.role = "customer";
  const denied = await POST(request("login"));
  assert.equal(denied.status, 401);
  assert.equal(denied.cookies.get("manbro_admin_session"), undefined);
  state.throws = true;
  const unavailable = await POST(request("login"));
  assert.equal(unavailable.status, 503);
  assert.doesNotMatch(await unavailable.text(), /backend-secret/);
});

test("cookie lifetime is capped at one hour and expired sessions are rejected", async () => {
  const { load, state, env } = setup();
  env.NODE_ENV = "development";
  const admin = load("./admin.ts");
  assert.equal(admin.ADMIN_COOKIE_OPTIONS.secure, false);
  const { POST } = load("../../app/api/admin/auth/login/route.ts");
  state.expiresAt = Math.floor(Date.now() / 1000) + 7200;
  const response = await POST(request("login"));
  assert.ok(response.cookies.get("manbro_admin_session").maxAge <= 3600);
  state.expiresAt = Math.floor(Date.now() / 1000) - 1;
  const expired = await POST(request("login"));
  assert.equal(expired.status, 503);
  assert.equal(expired.cookies.get("manbro_admin_session"), undefined);
});

test("session endpoint is uncached and rejects an invalid session", async () => {
  const { load, state } = setup();
  const { GET } = load("../../app/api/admin/auth/session/route.ts");
  assert.equal((await GET()).status, 200);
  state.role = "customer";
  const response = await GET();
  assert.equal(response.status, 401);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.equal((await response.json()).authenticated, false);
});

test("logout enforces origin, revokes the local Supabase session and clears the cookie", async () => {
  const { load, state } = setup();
  const { POST } = load("../../app/api/admin/auth/logout/route.ts");
  assert.equal((await POST(request("logout", "https://evil.example"))).status, 403);
  assert.equal(state.calls.length, 0);
  const response = await POST(request("logout"));
  assert.equal(response.status, 200);
  assert.deepEqual(state.calls[0], ["signOut", "access-token", "local"]);
  assert.equal(response.cookies.get("manbro_admin_session").maxAge, 0);
  state.throws = true;
  const unavailable = await POST(request("logout"));
  assert.equal(unavailable.status, 200);
  assert.equal(unavailable.cookies.get("manbro_admin_session").maxAge, 0);
});
