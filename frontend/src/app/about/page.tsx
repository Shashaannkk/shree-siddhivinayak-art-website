'use client';

import React from 'react';
import Link from 'next/link';
import { Award, Shield, Heart, Users } from 'lucide-react';
import { api } from '@/utils/api';

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 bg-festive-red-gradient text-[#FFF9F5]">
      {/* Title Header */}
      <div className="text-center mb-12">
        <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-festive-yellow-500/25 bg-[#2C0001] text-festive-yellow-500 text-xs font-bold uppercase tracking-wider mb-4 shadow-md">
          🌸 OUR DEVOTIONAL MISSION
        </span>
        <h1 className="text-3xl sm:text-5xl font-serif font-black tracking-tight text-gold-gradient">
          Shree Siddhivinayak Arts
        </h1>
        <p className="text-red-200 font-light mt-2 max-w-xl mx-auto text-sm sm:text-base">
          Crafting premium, eco-friendly clay Murtis since 2012 with veteran artisans in Pen-Chinchoti.
        </p>
      </div>

      {/* Main Content Card */}
      <div className="blinkit-card p-6 sm:p-10 rounded-[32px] border border-festive-yellow-500/10 mb-8 flex flex-col gap-6 font-light leading-relaxed text-sm sm:text-base text-gray-300">
        <h2 className="text-xl sm:text-2xl font-serif font-bold text-festive-yellow-500 border-b border-festive-yellow-500/10 pb-3">
          Our Heritage & Craftsmanship
        </h2>
        <p>
          Founded in the heart of Maharashtra's sculpting hub, Shree Siddhivinayak Arts is dedicated to preserving the absolute purity of Ganeshotsav and other sacred festivals. Every single idol is hand-sculpted by veteran artisans using pure, natural <strong>Shaddoo Clay (eco-friendly soil)</strong> and colored using organic, non-toxic water-soluble paints.
        </p>
        <p>
          We strictly avoid the use of Plaster of Paris (PoP) or chemical dyes to protect our environment and maintain the traditional spiritual essence of the ritual immersion (Visarjan).
        </p>
        
        {/* Core Values Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
          <div className="bg-[#1C0102]/60 p-5 rounded-2xl border border-festive-yellow-500/5 flex gap-3">
            <Shield className="w-6 h-6 text-logo-blue-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-festive-yellow-500 text-sm mb-1">Authentic & Unique</h4>
              <p className="text-xs text-gray-400">Our 'One Murti = One Code' system guarantees you get the exact hand-carved piece you reserve online.</p>
            </div>
          </div>
          
          <div className="bg-[#1C0102]/60 p-5 rounded-2xl border border-festive-yellow-500/5 flex gap-3">
            <Heart className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-festive-yellow-500 text-sm mb-1">100% Eco-Friendly</h4>
              <p className="text-xs text-gray-400">Pure clay compositions dissolve fully in water within hours, returning safely back to Mother Earth.</p>
            </div>
          </div>

          <div className="bg-[#1C0102]/60 p-5 rounded-2xl border border-festive-yellow-500/5 flex gap-3">
            <Users className="w-6 h-6 text-[#FFC107] shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-festive-yellow-500 text-sm mb-1">Veteran Artisans</h4>
              <p className="text-xs text-gray-400">Supporting traditional sculpting families with fair-trade models and clean workshop environments.</p>
            </div>
          </div>

          <div className="bg-[#1C0102]/60 p-5 rounded-2xl border border-festive-yellow-500/5 flex gap-3">
            <Award className="w-6 h-6 text-logo-blue-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-festive-yellow-500 text-sm mb-1">Secure Transport</h4>
              <p className="text-xs text-gray-400">Wooden crate cushioning and protective bubble layering ensure crack-free delivery across India.</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Button */}
      <div className="text-center mt-10">
        <Link 
          href="/collection" 
          className="inline-block px-8 py-3.5 rounded-full text-xs font-black uppercase tracking-wider text-black bg-gradient-to-r from-[#FFC107] to-[#FFB300] hover:scale-105 active:scale-95 transition-transform duration-200 shadow-lg shadow-festive-yellow-500/20"
        >
          View Live Collection Catalog
        </Link>
      </div>
    </div>
  );
}
