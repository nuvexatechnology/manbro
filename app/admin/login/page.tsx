"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loginEnabled, setLoginEnabled] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const checkSession = async () => {
      try {
        const response = await fetch("/api/admin/auth/session", {
          credentials: "same-origin",
          cache: "no-store",
        });
        const data = await response.json().catch(() => ({}));
        if (!isMounted) return;
        if (response.ok && data.authenticated === true) {
          router.replace("/admin/dashboard");
          return;
        }
        const enabled = response.status === 401 && data.loginEnabled === true;
        setLoginEnabled(enabled);
        if (!enabled) setError("Admin login is currently unavailable.");
      } catch {
        if (isMounted) setError("Admin login is currently unavailable. Please reload to retry.");
      } finally {
        if (isMounted) setIsCheckingSession(false);
      }
    };
    void checkSession();
    return () => {
      isMounted = false;
    };
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/auth/login", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok && data.success) {
        window.location.href = "/admin/dashboard";
      } else {
        if (response.status === 503) setLoginEnabled(false);
        setError(data.error || "Invalid credentials");
        setIsLoading(false);
      }
    } catch {
      setError("Login failed. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#091D12] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#11301F] border border-[#284234] rounded-2xl p-8 space-y-6 shadow-2xl">
        {/* Header with Logo */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center">
            <div className="relative h-10 w-[256px] shrink-0">
              <Image
                src="/images/logo-full.png"
                alt="MANBRO"
                width={256}
                height={40}
                className="object-contain"
                priority
              />
            </div>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">Admin Portal</h1>
          <p className="text-xs text-neutral-300">Sign in to manage catalog, orders, and store settings</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div role="alert" className="p-3 bg-red-950/60 border border-red-800/50 rounded-xl text-xs text-red-300 text-center">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="admin-email" className="text-xs font-bold uppercase tracking-wider text-neutral-300 block mb-1.5">
              Email Address
            </label>
            <input
              id="admin-email"
              autoComplete="username"
              disabled={!loginEnabled || isLoading}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@manbro.com"
              className="w-full bg-[#091D12] border border-[#284234] rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#d4af37] transition placeholder-neutral-500"
              required
            />
          </div>

          <div>
            <label htmlFor="admin-password" className="text-xs font-bold uppercase tracking-wider text-neutral-300 block mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                id="admin-password"
                autoComplete="current-password"
                disabled={!loginEnabled || isLoading}
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#091D12] border border-[#284234] rounded-xl px-4 py-3 pr-11 text-xs text-white focus:outline-none focus:border-[#d4af37] transition placeholder-neutral-500"
                required
              />
              <button
                type="button"
                tabIndex={-1}
                disabled={!loginEnabled || isLoading}
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-[#d4af37] transition cursor-pointer p-1 disabled:opacity-50"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={!loginEnabled || isLoading}
            className="w-full py-3.5 bg-[#d4af37] text-black font-black text-xs uppercase tracking-wider rounded-xl hover:bg-[#c29e2e] transition disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-[#d4af37] focus-visible:ring-offset-2 focus-visible:ring-offset-[#091D12] active:scale-[0.98] cursor-pointer shadow-lg shadow-[#d4af37]/10"
          >
            {isCheckingSession ? "Checking session..." : isLoading ? "Authenticating..." : "Sign In to Admin"}
          </button>
        </form>

        {/* Footer */}
        <div className="pt-4 border-t border-[#284234] text-center">
          <Link href="/" className="text-xs text-neutral-400 hover:text-[#d4af37] transition">
            ← Back to Storefront
          </Link>
        </div>
      </div>
    </div>
  );
}
