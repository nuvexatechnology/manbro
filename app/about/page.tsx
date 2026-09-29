import React from "react";
import Link from "next/link";

export const metadata = {
  title: "About Us | MANBRO Luxury Apparel",
  description: "Discover MANBRO - Crafting premium luxury menswear with timeless aesthetics, exceptional fabrics, and uncompromising attention to detail.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#091D12] text-white">
      {/* Hero Header */}
      <section className="relative border-b border-[#284234] bg-gradient-to-b from-[#091D12] via-[#11301F]/40 to-[#091D12] py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-block px-3.5 py-1 text-xs font-semibold tracking-widest text-[#d4af37] uppercase bg-[#11301F] border border-[#d4af37]/30 rounded-full mb-4">
            Our Heritage & Vision
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-6">
            Crafting Elegance for the Modern Gentleman
          </h1>
          <p className="text-base sm:text-lg text-emerald-100/80 leading-relaxed max-w-2xl mx-auto">
            MANBRO was established on the principle that true luxury lies in simplicity, perfection of cut, and unyielding fabric integrity.
          </p>
        </div>
      </section>

      {/* Story & Pillar Section */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              Designed with Precision, Worn with Distinction
            </h2>
            <p className="text-emerald-100/80 leading-relaxed mb-4">
              Every garment in the MANBRO catalog is engineered from meticulously chosen long-staple cottons, premium fleeces, and fine blends. We bridge the world between modern streetwear silhouettes and classic bespoke tailoring.
            </p>
            <p className="text-emerald-100/80 leading-relaxed mb-6">
              Our iconic forest green and champagne gold aesthetic symbolizes vitality, nobility, and timeless confidence.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#d4af37] text-[#091D12] font-bold text-sm tracking-wider uppercase rounded-md shadow-lg shadow-[#d4af37]/20 hover:bg-[#c49f2e] transition"
            >
              <span>Explore the Collection</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>

          {/* Luxury Highlights Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#11301F]/80 border border-[#284234] rounded-xl p-6 text-center">
              <svg className="w-8 h-8 text-[#d4af37] mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
              </svg>
              <div className="text-2xl sm:text-3xl font-extrabold text-white mb-1">100%</div>
              <div className="text-xs text-emerald-100/70 uppercase tracking-wider">Premium Fabrics</div>
            </div>

            <div className="bg-[#11301F]/80 border border-[#284234] rounded-xl p-6 text-center">
              <svg className="w-8 h-8 text-[#d4af37] mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.004 0H9.496m5.004 0a3 3 0 002.996-3V7.5a3 3 0 00-3-3H9.496a3 3 0 00-3 3v5.25a3 3 0 002.996 3z" />
              </svg>
              <div className="text-2xl sm:text-3xl font-extrabold text-white mb-1">Bespoke</div>
              <div className="text-xs text-emerald-100/70 uppercase tracking-wider">Craftsmanship</div>
            </div>

            <div className="bg-[#11301F]/80 border border-[#284234] rounded-xl p-6 text-center">
              <svg className="w-8 h-8 text-[#d4af37] mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
              <div className="text-2xl sm:text-3xl font-extrabold text-white mb-1">Quality</div>
              <div className="text-xs text-emerald-100/70 uppercase tracking-wider">Guaranteed</div>
            </div>

            <div className="bg-[#11301F]/80 border border-[#284234] rounded-xl p-6 text-center">
              <svg className="w-8 h-8 text-[#d4af37] mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.999-3.199a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
              </svg>
              <div className="text-2xl sm:text-3xl font-extrabold text-white mb-1">Global</div>
              <div className="text-xs text-emerald-100/70 uppercase tracking-wider">Brotherhood</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
