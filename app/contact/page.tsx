"use client";

import React, { useState } from "react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.message) {
      setSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#091D12] text-white">
      {/* Hero Header */}
      <section className="relative border-b border-[#284234] bg-gradient-to-b from-[#091D12] via-[#11301F]/40 to-[#091D12] py-14 sm:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-block px-3.5 py-1 text-xs font-semibold tracking-widest text-[#d4af37] uppercase bg-[#11301F] border border-[#d4af37]/30 rounded-full mb-4">
            Concierge & Support
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4">
            Get in Touch with MANBRO
          </h1>
          <p className="text-base sm:text-lg text-emerald-100/80 leading-relaxed max-w-xl mx-auto">
            Have a question regarding sizing, shipping, or an existing order? Our concierge team is available to assist you.
          </p>
        </div>
      </section>

      {/* Main Contact Content */}
      <section className="py-14 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Contact Information & Channels */}
          <div className="lg:col-span-5 space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-white mb-3">Customer Support</h2>
              <p className="text-emerald-100/70 text-sm leading-relaxed">
                We take pride in our prompt response. Inquiries are generally addressed within 12 business hours.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4 p-4 bg-[#11301F]/70 border border-[#284234] rounded-xl">
                <div className="p-2.5 bg-[#091D12] border border-[#d4af37]/30 rounded-lg text-[#d4af37] shrink-0">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                </div>
                <div>
                  <div className="text-xs text-emerald-100/60 uppercase font-bold tracking-wider">Email Concierge</div>
                  <a href="mailto:support@manbro.com" className="text-white hover:text-[#d4af37] transition font-medium text-sm">
                    support@manbro.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-[#11301F]/70 border border-[#284234] rounded-xl">
                <div className="p-2.5 bg-[#091D12] border border-[#d4af37]/30 rounded-lg text-[#d4af37] shrink-0">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                  </svg>
                </div>
                <div>
                  <div className="text-xs text-emerald-100/60 uppercase font-bold tracking-wider">WhatsApp Concierge</div>
                  <a
                    href="https://wa.me/919999999999?text=Hello%20MANBRO%20Support"
                    target="_blank"
                    rel="noreferrer"
                    className="text-white hover:text-[#d4af37] transition font-medium text-sm"
                  >
                    +91 (Direct WhatsApp Chat)
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-[#11301F]/70 border border-[#284234] rounded-xl">
                <div className="p-2.5 bg-[#091D12] border border-[#d4af37]/30 rounded-lg text-[#d4af37] shrink-0">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                </div>
                <div>
                  <div className="text-xs text-emerald-100/60 uppercase font-bold tracking-wider">Headquarters</div>
                  <p className="text-white font-medium text-sm">
                    MANBRO Studios & Atelier, India
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Direct Message Form */}
          <div className="lg:col-span-7 bg-[#11301F]/80 border border-[#284234] rounded-2xl p-6 sm:p-10">
            {submitted ? (
              <div className="py-12 text-center">
                <svg className="w-16 h-16 text-[#d4af37] mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-2xl font-bold text-white mb-2">Message Sent</h3>
                <p className="text-emerald-100/80 text-sm max-w-md mx-auto mb-6">
                  Thank you for contacting MANBRO. A concierge specialist has received your inquiry and will follow up shortly.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({ name: "", email: "", subject: "", message: "" });
                  }}
                  className="px-6 py-2.5 bg-[#d4af37] text-[#091D12] font-bold text-xs uppercase tracking-wider rounded-md hover:bg-[#c49f2e] transition cursor-pointer"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <h3 className="text-xl font-bold text-white mb-2">Send an Inquiry</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-emerald-100/80 font-semibold mb-2">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. John Doe"
                      className="w-full bg-[#091D12] border border-[#284234] rounded-lg px-4 py-3 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#d4af37] transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-emerald-100/80 font-semibold mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. john@example.com"
                      className="w-full bg-[#091D12] border border-[#284234] rounded-lg px-4 py-3 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#d4af37] transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-emerald-100/80 font-semibold mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Order query, product question, or sizing advice"
                    className="w-full bg-[#091D12] border border-[#284234] rounded-lg px-4 py-3 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#d4af37] transition"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-emerald-100/80 font-semibold mb-2">
                    Message *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="How can we assist you today?"
                    className="w-full bg-[#091D12] border border-[#284234] rounded-lg px-4 py-3 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#d4af37] transition resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-[#d4af37] text-[#091D12] font-black text-xs uppercase tracking-widest rounded-lg hover:bg-[#c49f2e] transition shadow-lg shadow-[#d4af37]/20 cursor-pointer"
                >
                  <span>Submit Inquiry</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                  </svg>
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
