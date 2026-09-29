"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useUserAuth } from "@/components/auth/user-auth-context";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#091D12] flex items-center justify-center text-white">Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/";

  const { user, login } = useUserAuth();
  const [mobileNumber, setMobileNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // If already logged in, redirect
  React.useEffect(() => {
    if (user) {
      router.replace(redirectUrl);
    }
  }, [user, router, redirectUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const cleanPhone = mobileNumber.replace(/\D/g, "");
    if (cleanPhone.length < 10 || cleanPhone.length > 15) {
      setError("Please enter a valid 10 to 15-digit mobile number");
      return;
    }
    if (!password) {
      setError("Password is required");
      return;
    }

    setIsLoading(true);
    const result = await login({
      mobileNumber: cleanPhone,
      password,
    });
    setIsLoading(false);

    if (result.success) {
      router.replace(redirectUrl);
    } else {
      setError(result.error || "Invalid mobile number or password");
    }
  };

  return (
    <div className="min-h-[85vh] bg-[#091D12] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#0D2417] border border-[#284234] rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl text-white">
        {/* Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-block transition-transform duration-200 hover:scale-105">
            <div className="relative h-8 w-[200px] mx-auto">
              <Image
                src="/images/logo-full.png"
                alt="MANBRO"
                fill
                sizes="200px"
                className="object-contain"
                priority
              />
            </div>
          </Link>
          <h1 className="text-2xl font-black text-white tracking-tight font-serif pt-2">
            Sign In to MANBRO
          </h1>
          <p className="text-xs text-neutral-400">
            Enter your registered mobile number and password
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div role="alert" className="p-3 bg-red-950/60 border border-red-800/50 rounded-xl text-xs text-red-300 text-center">
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="login-page-mobile"
              className="text-xs font-bold uppercase tracking-wider text-neutral-300 block mb-1.5"
            >
              Mobile Number
            </label>
            <input
              id="login-page-mobile"
              type="tel"
              autoComplete="tel"
              disabled={isLoading}
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              placeholder="e.g. 9876543210"
              className="w-full bg-[#091D12] border border-[#284234] rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#d4af37] transition placeholder-neutral-500"
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="login-page-password"
                className="text-xs font-bold uppercase tracking-wider text-neutral-300 block"
              >
                Password
              </label>
            </div>
            <div className="relative">
              <input
                id="login-page-password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                disabled={isLoading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#091D12] border border-[#284234] rounded-xl px-4 py-3 pr-11 text-xs text-white focus:outline-none focus:border-[#d4af37] transition placeholder-neutral-500"
                required
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-[#d4af37] transition cursor-pointer p-1"
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
            disabled={isLoading}
            className="w-full py-3.5 bg-[#d4af37] text-black font-black text-xs uppercase tracking-wider rounded-xl hover:bg-[#c29e2e] transition disabled:opacity-50 cursor-pointer shadow-lg shadow-[#d4af37]/10 active:scale-[0.98] mt-2"
          >
            {isLoading ? "Signing In..." : "Sign In with Mobile"}
          </button>
        </form>

        {/* Switch to Register */}
        <div className="pt-4 border-t border-[#284234] text-center space-y-3">
          <p className="text-xs text-neutral-400">
            Don&apos;t have an account?{" "}
            <Link
              href={`/register${redirectUrl !== "/" ? `?redirect=${encodeURIComponent(redirectUrl)}` : ""}`}
              className="text-[#d4af37] font-bold hover:underline"
            >
              Register now
            </Link>
          </p>
          <div>
            <Link href="/" className="text-xs text-neutral-500 hover:text-neutral-300 transition">
              ← Return to Store
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
