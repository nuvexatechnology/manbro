"use client";

import React, { useState } from "react";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-[#111a11] border border-[#1a2a1a] rounded-2xl p-8 sm:p-10">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-[#0d1a0d] rounded-xl border border-[#1a2a1a]">
          <svg className="w-6 h-6 text-[#c8a960]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <div>
          <h3 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider">STAY IN THE LOOP</h3>
          <p className="text-xs text-neutral-400">New drops, exclusive offers, and more.</p>
        </div>
      </div>
      {subscribed ? (
        <div className="text-xs text-[#c8a960] bg-[#0d1a0d] border border-[#1a2a1a] px-6 py-3 rounded-lg font-semibold">
          Thank you for subscribing!
        </div>
      ) : (
        <form className="flex w-full md:w-auto gap-2" onSubmit={handleSubmit}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            className="flex-1 md:w-72 bg-[#0d1a0d] border border-[#1a2a1a] text-white text-xs rounded-lg px-4 py-3 focus:outline-none focus:border-[#c8a960] transition"
            required
          />
          <button
            type="submit"
            className="px-6 py-3 bg-[#c8a960] text-black font-bold text-xs uppercase tracking-wider rounded-lg hover:bg-[#d4b870] transition"
          >
            SUBSCRIBE
          </button>
        </form>
      )}
    </div>
  );
}
