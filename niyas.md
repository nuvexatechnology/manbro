# MANBRO Project - What I Fixed

## Date: 06 Sep 2026

---

## Security Fixes (Critical)

### 1. Hardcoded Admin Credentials in Source Code
**Files:** `app/api/admin/auth/login/route.ts`, `components/auth/admin-auth-provider.tsx`

The admin login endpoint had `admin@manbro.store` / `1998niyas01!@#` hardcoded directly in the source code. Anyone reading the code could log in as admin.

**Fix:** Replaced with Supabase Auth. Login now authenticates via `supabase.auth.signInWithPassword()`, and admin access is gated by `app_metadata.role === "admin"`. Credentials are never in source code.

### 2. No Rate Limiting on Login Endpoint
**File:** `app/api/admin/auth/login/route.ts`

The login endpoint accepted unlimited attempts — an attacker could brute-force the password.

**Fix:** Added in-memory rate limiter: max 5 failed attempts per email per 15-minute window. Returns `429 Too Many Requests` with a clear retry message. Rate limit resets on successful login.

### 3. No Server-Side Session Verification
**Files:** `app/admin/page.tsx`, `app/admin/dashboard/page.tsx`

Admin pages trusted a `localStorage` token set by the client. Anyone could forge it.

**Fix:** Removed all `localStorage` token checks. Admin pages now call `GET /api/admin/auth/session` on mount — a server endpoint that verifies the HttpOnly cookie against Supabase and checks `app_metadata.role`. Pages show "unauthorized" and redirect if the session is invalid.

### 4. Missing Origin Check on Login (CSRF)