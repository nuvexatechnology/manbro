"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { useUserAuth } from "./user-auth-context";

export function AuthModal() {
  const pathname = usePathname();
  const {
    isAuthModalOpen,
    authModalMode,
    closeAuthModal,
    switchAuthMode,
    login,
    register,
  } = useUserAuth();

  // Login form state
  const [loginPhone, setLoginPhone] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Register form state
  const [registerName, setRegisterName] = useState("");
  const [registerPhone, setRegisterPhone] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState("");
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showRegisterConfirmPassword, setShowRegisterConfirmPassword] = useState(false);
  const [registerError, setRegisterError] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  if (pathname.startsWith("/admin") || !isAuthModalOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    const cleanPhone = loginPhone.replace(/\D/g, "");
    if (cleanPhone.length < 10 || cleanPhone.length > 15) {
      setLoginError("Please enter a valid 10 to 15-digit mobile number");
      return;
    }
    if (!loginPassword) {
      setLoginError("Password is required");
      return;
    }

    setIsLoggingIn(true);
    const result = await login({
      mobileNumber: cleanPhone,
      password: loginPassword,
    });
    setIsLoggingIn(false);

    if (!result.success) {
      setLoginError(result.error || "Login failed");
    } else {
      setLoginPhone("");
      setLoginPassword("");
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError("");

    if (!registerName.trim()) {
      setRegisterError("Please enter your full name");
      return;
    }

    const cleanPhone = registerPhone.replace(/\D/g, "");
    if (cleanPhone.length < 10 || cleanPhone.length > 15) {
      setRegisterError("Please enter a valid 10 to 15-digit mobile number");
      return;
    }

    if (registerPassword.length < 6 || registerPassword.length > 15) {
      setRegisterError("Password must be between 6 and 15 characters");
      return;
    }

    if (!/[A-Z]/.test(registerPassword)) {
      setRegisterError("Password must contain at least one uppercase letter (A-Z)");
      return;
    }

    if (!/[0-9]/.test(registerPassword)) {
      setRegisterError("Password must contain at least one number (0-9)");
      return;
    }

    if (!/[^A-Za-z0-9]/.test(registerPassword)) {
      setRegisterError("Password must contain at least one special character (!@#$%^&*...)");
      return;
    }

    if (registerPassword !== registerConfirmPassword) {
      setRegisterError("Passwords do not match");
      return;
    }

    setIsRegistering(true);
    const result = await register({
      name: registerName.trim(),
      mobileNumber: cleanPhone,
      password: registerPassword,
      confirmPassword: registerConfirmPassword,
    });
    setIsRegistering(false);

    if (!result.success) {
      setRegisterError(result.error || "Registration failed");
    } else {
      setRegisterName("");
      setRegisterPhone("");
      setRegisterPassword("");
      setRegisterConfirmPassword("");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md bg-[#0D2417] border border-[#284234] rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 text-neutral-400 hover:text-white p-2 rounded-lg hover:bg-[#153422] transition"
          aria-label="Close modal"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-1">
          <div className="inline-block px-3 py-1 bg-[#1a402c] border border-[#284234] rounded-full text-[10px] uppercase font-bold tracking-widest text-[#d4af37] mb-1">
            MANBRO ACCOUNT
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white font-serif">
            {authModalMode === "login" ? "Welcome Back" : "Create Account"}
          </h2>
          <p className="text-xs text-neutral-400">
            {authModalMode === "login"
              ? "Sign in with your mobile number to manage orders"
              : "Register with your mobile number and details"}
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex bg-[#091D12] p-1 rounded-xl border border-[#284234]">
          <button
            type="button"
            onClick={() => switchAuthMode("login")}
            className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition ${
              authModalMode === "login"
                ? "bg-[#d4af37] text-black shadow"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => switchAuthMode("register")}
            className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition ${
              authModalMode === "register"
                ? "bg-[#d4af37] text-black shadow"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            Register
          </button>
        </div>

        {/* LOGIN FORM */}
        {authModalMode === "login" && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {loginError && (
              <div role="alert" className="p-3 bg-red-950/60 border border-red-800/50 rounded-xl text-xs text-red-300 text-center">
                {loginError}
              </div>
            )}

            <div>
              <label htmlFor="login-mobile" className="text-xs font-bold uppercase tracking-wider text-neutral-300 block mb-1.5">
                Mobile Number
              </label>
              <div className="relative">
                <input
                  id="login-mobile"
                  type="tel"
                  autoComplete="tel"
                  placeholder="e.g. 9876543210"
                  value={loginPhone}
                  onChange={(e) => setLoginPhone(e.target.value)}
                  className="w-full bg-[#091D12] border border-[#284234] rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#d4af37] transition placeholder-neutral-500"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="login-password" className="text-xs font-bold uppercase tracking-wider text-neutral-300 block mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showLoginPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full bg-[#091D12] border border-[#284234] rounded-xl px-4 py-3 pr-11 text-xs text-white focus:outline-none focus:border-[#d4af37] transition placeholder-neutral-500"
                  required
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowLoginPassword((prev) => !prev)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-[#d4af37] transition cursor-pointer p-1"
                  aria-label={showLoginPassword ? "Hide password" : "Show password"}
                >
                  {showLoginPassword ? (
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
              disabled={isLoggingIn}
              className="w-full py-3.5 bg-[#d4af37] text-black font-black text-xs uppercase tracking-wider rounded-xl hover:bg-[#c29e2e] transition disabled:opacity-50 cursor-pointer shadow-lg shadow-[#d4af37]/10 active:scale-[0.99] mt-2"
            >
              {isLoggingIn ? "Signing In..." : "Sign In with Mobile"}
            </button>
          </form>
        )}

        {/* REGISTER FORM */}
        {authModalMode === "register" && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
            {registerError && (
              <div role="alert" className="p-3 bg-red-950/60 border border-red-800/50 rounded-xl text-xs text-red-300 text-center">
                {registerError}
              </div>
            )}

            <div>
              <label htmlFor="register-name" className="text-xs font-bold uppercase tracking-wider text-neutral-300 block mb-1">
                Full Name
              </label>
              <input
                id="register-name"
                type="text"
                autoComplete="name"
                placeholder="e.g. John Doe"
                value={registerName}
                onChange={(e) => setRegisterName(e.target.value)}
                className="w-full bg-[#091D12] border border-[#284234] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#d4af37] transition placeholder-neutral-500"
                required
              />
            </div>

            <div>
              <label htmlFor="register-mobile" className="text-xs font-bold uppercase tracking-wider text-neutral-300 block mb-1">
                Mobile Number
              </label>
              <input
                id="register-mobile"
                type="tel"
                autoComplete="tel"
                placeholder="e.g. 9876543210"
                value={registerPhone}
                onChange={(e) => setRegisterPhone(e.target.value)}
                className="w-full bg-[#091D12] border border-[#284234] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#d4af37] transition placeholder-neutral-500"
                required
              />
            </div>

            <div>
              <label htmlFor="register-password" className="text-xs font-bold uppercase tracking-wider text-neutral-300 block mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  id="register-password"
                  type={showRegisterPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="6-15 chars (e.g. Pass@123)"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  className="w-full bg-[#091D12] border border-[#284234] rounded-xl px-4 py-2.5 pr-11 text-xs text-white focus:outline-none focus:border-[#d4af37] transition placeholder-neutral-500"
                  required
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowRegisterPassword((prev) => !prev)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-[#d4af37] transition cursor-pointer p-1"
                  aria-label={showRegisterPassword ? "Hide password" : "Show password"}
                >
                  {showRegisterPassword ? (
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
              <p className="text-[10px] text-neutral-400 mt-1">
                6-15 chars, 1 uppercase (A-Z), 1 number (0-9), 1 special symbol (!@#$...)
              </p>
            </div>

            <div>
              <label htmlFor="register-confirm-password" className="text-xs font-bold uppercase tracking-wider text-neutral-300 block mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="register-confirm-password"
                  type={showRegisterConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Re-enter your password"
                  value={registerConfirmPassword}
                  onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                  className="w-full bg-[#091D12] border border-[#284234] rounded-xl px-4 py-2.5 pr-11 text-xs text-white focus:outline-none focus:border-[#d4af37] transition placeholder-neutral-500"
                  required
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowRegisterConfirmPassword((prev) => !prev)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-[#d4af37] transition cursor-pointer p-1"
                  aria-label={showRegisterConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                >
                  {showRegisterConfirmPassword ? (
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
              disabled={isRegistering}
              className="w-full py-3.5 bg-[#d4af37] text-black font-black text-xs uppercase tracking-wider rounded-xl hover:bg-[#c29e2e] transition disabled:opacity-50 cursor-pointer shadow-lg shadow-[#d4af37]/10 active:scale-[0.99] mt-2"
            >
              {isRegistering ? "Creating Account..." : "Create Account"}
            </button>
          </form>
        )}

        {/* Footer switch prompt */}
        <div className="pt-2 text-center text-xs text-neutral-400">
          {authModalMode === "login" ? (
            <p>
              Don&apos;t have an account?{" "}
              <button
                type="button"
                onClick={() => switchAuthMode("register")}
                className="text-[#d4af37] hover:underline font-bold"
              >
                Register here
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => switchAuthMode("login")}
                className="text-[#d4af37] hover:underline font-bold"
              >
                Sign in here
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
