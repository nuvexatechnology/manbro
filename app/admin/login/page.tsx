"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loginEnabled, setLoginEnabled] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    const checkSession = async () => {
      try {
        const response = await fetch("/api/admin/auth/session", {
          credentials: "same-origin",
          cache: "no-store",
          signal: controller.signal,
        });
        const data = await response.json();
        if (controller.signal.aborted) return;
        if (response.ok && data.authenticated === true) {
          router.replace("/admin/dashboard");
          return;
        }
        const enabled = response.status === 401 && data.loginEnabled === true;
        setLoginEnabled(enabled);
        if (!enabled) setError("Admin login is currently unavailable.");
      } catch {
        if (!controller.signal.aborted) setError("Admin login is currently unavailable. Please reload to retry.");
      } finally {
        if (!controller.signal.aborted) setIsCheckingSession(false);
      }
    };
    void checkSession();
    return () => controller.abort();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEnabled || isLoading) return;
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/auth/login", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        router.replace("/admin/dashboard");
      } else {
        if (response.status === 503) setLoginEnabled(false);
        setError(data.error || "Invalid credentials");
      }
    } catch {
      setError("Login failed. Please try again.");
    } finally {
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
            <input
              id="admin-password"
              autoComplete="current-password"
              disabled={!loginEnabled || isLoading}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#091D12] border border-[#284234] rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#d4af37] transition placeholder-neutral-500"
              required
            />
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
