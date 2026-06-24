'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api, Murti } from '@/utils/api';
import { Star, Shield, HelpCircle, Award, ArrowRight } from 'lucide-react';

export default function HomePage() {
  const [featuredMurtis, setFeaturedMurtis] = useState<Murti[]>([]);
  const [stats, setStats] = useState({ totalBookings: 127 });
  const [loading, setLoading] = useState(true);
  const [activeReviewIndex, setActiveReviewIndex] = useState(0);

  useEffect(() => {
    async function loadData() {
      try {
        const murtis = await api.getMurtis();
        setFeaturedMurtis(murtis.slice(0, 3));
        
        const analytics = await api.getAnalytics();
        if (analytics && analytics.stats) {
          setStats({ totalBookings: 125 + analytics.stats.totalBookings });
        }
      } catch (err) {
        console.error('Error loading home page data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const reviews = [
    {
      name: "Aditya Kulkarni",
      location: "Mumbai, Maharashtra",
      rating: 5,
      comment: "The Royal Blue Ganpati was the highlight of our Ganeshotsav. The details were incredibly precise, and the booking code model gave us complete peace of mind that we got the exact Murti we booked online!",
      tag: "GAN-001 Customer"
    },
    {
      name: "Sneha Patil",
      location: "Pune, Maharashtra",
      rating: 5,
      comment: "Absolutely stunning handcraft. The transport packaging was extremely secure, and it arrived in Pune without a single scratch. Booking process was flawless.",
      tag: "GAN-003 Customer"
    },
    {
      name: "Vikram Raje",
      location: "Bengaluru, Karnataka",
      rating: 5,
      comment: "Loved the Peshwa Style Ganpati! The booking management made it so easy to book. Highly recommend Shree Siddhivinayak Arts for their professional service.",
      tag: "ROY-001 Customer"
    }
  ];

  const galleryImages = [
    { url: "https://images.unsplash.com/photo-1609252509102-ee7026b2161f?w=600&auto=format&fit=crop", caption: "Bappa at Home" },
    { url: "https://images.unsplash.com/photo-1567591905632-9a595a86e374?w=600&auto=format&fit=crop", caption: "Siddhivinayak Decor" },
    { url: "https://images.unsplash.com/photo-1628134710188-79b88cf466fb?w=600&auto=format&fit=crop", caption: "Society Celebration" },
    { url: "https://images.unsplash.com/photo-1602167098485-618779b5c3ff?w=600&auto=format&fit=crop", caption: "Durga Aagman" }
  ];

  return (
    <div className="relative overflow-hidden min-h-screen bg-festive-red-gradient">
      {/* Background Ornaments / Glowing Gradients - Logo Colors */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-logo-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-festive-yellow-500/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-festive-red-500/15 rounded-full blur-[100px] pointer-events-none" />

      {/* Hero Section */}
      <section className="relative pt-16 pb-12 md:pt-28 md:pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Divine Sub-header */}
        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-festive-yellow-500/25 bg-[#2C0001] text-festive-yellow-500 text-xs font-bold uppercase tracking-wider mb-8 shadow-md">
          🌸 PRESERVING DEVOTION SINCE 2012
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif font-black tracking-tight mb-6 leading-tight">
          Bring Home Your Bappa <br />
          <span className="text-gold-gradient">With Confidence</span>
        </h1>

        {/* Hero Description */}
        <p className="max-w-3xl mx-auto text-base sm:text-lg text-red-100 font-light leading-relaxed mb-12">
          Exquisite, individually numbered handmade murtis. Our exclusive <strong className="text-festive-yellow-500">One Murti = One Code</strong> system guarantees that the exact masterpiece you choose is reserved solely for your family.
        </p>

        {/* Hero Video Showcase */}
        <div className="mt-10 max-w-4xl mx-auto rounded-[32px] overflow-hidden border border-festive-yellow-500/25 bg-[#2C0001]/90 shadow-2xl relative group">
          {/* Subtle Glow behind the video */}
          <div className="absolute inset-0 bg-gradient-to-r from-logo-blue-500/10 via-festive-yellow-500/10 to-festive-red-500/10 opacity-70 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-[32px]" />
          
          <video 
            src={`${api.basePath || ''}/videos/0705(1).mp4`} 
            controls 
            autoPlay 
            loop 
            muted 
            playsInline
            className="w-full h-auto aspect-video object-cover rounded-[30px] border border-black/40 shadow-inner relative z-10"
          />
        </div>
      </section>

      {/* Live Booking Counter Banner */}
      <section className="bg-[#2C0001] border-y border-festive-yellow-500/20 py-5 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex h-3.5 w-3.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-logo-blue-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-logo-blue-500"></span>
            </span>
            <p className="text-gray-200 font-semibold tracking-wide">
              Live Status: <span className="text-festive-yellow-500 font-black font-mono">{stats.totalBookings} Murtis Booked</span> This Season
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-festive-yellow-500 font-bold uppercase tracking-widest">
            <span>Anti-Duplicate Security Verified</span>
            <Shield className="w-4 h-4 text-logo-blue-500" />
          </div>
        </div>
      </section>

      {/* Live Stats grid - Rounded Blinkit/Apple style Cards */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { label: "Happy Families", value: "500+", icon: "🙏", desc: "Joyous celebrations" },
            { label: "Murtis Dispatched", value: "Pan-India", icon: "🚚", desc: "Safely delivered cargo" },
            { label: "Customer Satisfaction", value: "4.9 ⭐", icon: "⭐", desc: "Top-rated craftsmanship" },
            { label: "Handmade Art", value: "100% Clay", icon: "🎨", desc: "Eco-friendly materials" }
          ].map((stat, idx) => (
            <div key={idx} className="blinkit-card p-8 text-center relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-festive-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="text-4xl mb-4">{stat.icon}</div>
              <h3 className="text-3xl font-black font-serif text-festive-yellow-500 tracking-tight">{stat.value}</h3>
              <p className="text-sm font-bold text-gray-200 mt-2">{stat.label}</p>
              <p className="text-xs text-gray-400 mt-1">{stat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Murtis Section */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-festive-yellow-500/10">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12">
          <div>
            <h2 className="text-3xl md:text-5xl font-serif font-black text-gold-gradient mb-3">Featured Creations</h2>
            <p className="text-gray-300 font-light">Explore a few handpicked masterpieces available for direct booking.</p>
          </div>
          <Link href="/collection" className="group flex items-center gap-2 text-logo-blue-500 hover:text-logo-blue-400 transition-colors font-bold mt-4 md:mt-0 text-sm tracking-wider uppercase">
            Browse Full Collection <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-96 rounded-[28px] bg-gray-900/50 animate-pulse border border-festive-yellow-500/10" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredMurtis.map((murti) => (
              <div key={murti.code} className="blinkit-card overflow-hidden group flex flex-col h-full">
                {/* Photo container */}
                <div className="relative h-72 w-full overflow-hidden bg-black/40">
                  <img 
                    src={murti.photos[0] || 'https://images.unsplash.com/photo-1609252509102-ee7026b2161f?w=800&auto=format&fit=crop'} 
                    alt={murti.name} 
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Status Badge - Blue/Yellow/Red */}
                  <div className="absolute top-4 right-4">
                    <span className={`px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider ${
                      murti.status === 'Available' ? 'status-available' : 
                      murti.status === 'Reserved' ? 'status-reserved' : 'status-sold'
                    }`}>
                      {murti.status === 'Available' ? '🔵 Available' : 
                       murti.status === 'Reserved' ? '🟡 Reserved' : '🔴 Sold Out'}
                    </span>
                  </div>
                  {/* Category overlay */}
                  <div className="absolute bottom-4 left-4 bg-[#1C0102]/85 backdrop-blur-sm border border-festive-yellow-500/20 px-3 py-1 rounded-full text-xs font-bold text-festive-yellow-500">
                    {murti.category}
                  </div>
                </div>

                {/* Details */}
                <div className="p-6 flex-grow flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <h3 className="text-xl font-bold font-serif tracking-wide group-hover:text-festive-yellow-500 transition-colors">
                        {murti.name}
                      </h3>
                      <span className="text-xs text-gray-400 font-mono tracking-wider">{murti.code}</span>
                    </div>
                    <p className="text-sm text-gray-300 font-light line-clamp-2 mb-4">
                      {murti.description}
                    </p>
                  </div>

                  <div className="border-t border-festive-yellow-500/10 pt-4 mt-auto">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <span className="text-xs text-gray-400 block font-bold uppercase tracking-wider">Price</span>
                        <span className="text-2xl font-black text-festive-yellow-500 font-serif">₹{murti.price.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-gray-400 block font-bold uppercase tracking-wider">Height</span>
                        <span className="text-sm font-bold text-gray-100">{murti.size}</span>
                      </div>
                    </div>

                    <Link 
                      href={`/murti/${murti.code}`} 
                      className={`w-full py-3.5 rounded-full text-center text-xs font-extrabold uppercase tracking-wider transition-all block ${
                        murti.status === 'Available' 
                          ? 'bg-gradient-to-r from-logo-blue-500 to-logo-blue-600 text-white hover:scale-102 active:scale-98 shadow-md glow-blue' 
                          : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {murti.status === 'Available' ? '🔵 View & Book' : '🔴 Locked'}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Customer Gallery (Photos from Customers) - Rounded Grid */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-festive-yellow-500/10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-serif font-black text-gold-gradient mb-3">Customer Gallery</h2>
          <p className="text-gray-300 font-light max-w-xl mx-auto">Real photos shared by happy families showcasing Bappa in their home decorations.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {galleryImages.map((img, i) => (
            <div key={i} className="relative h-60 md:h-72 rounded-[28px] overflow-hidden group border-2 border-festive-yellow-500/15 bg-black">
              <img 
                src={img.url} 
                alt={img.caption} 
                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-5">
                <span className="text-sm font-serif font-bold text-festive-yellow-500 tracking-wide">{img.caption}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Customer Reviews Slider */}
      <section className="py-20 bg-[#2C0001]/40 border-t border-festive-yellow-500/10 relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif font-black text-gold-gradient">Devotional Testimonials</h2>
            <p className="text-gray-300 font-light mt-2">What families say about their Shree Siddhivinayak Arts experience.</p>
          </div>

          <div className="blinkit-card p-8 md:p-12 rounded-[28px] relative overflow-hidden">
            <div className="absolute top-6 left-6 text-7xl font-serif text-festive-yellow-500/10 pointer-events-none">“</div>
            <div className="min-h-[150px] flex flex-col justify-between">
              <p className="text-lg md:text-xl font-light italic leading-relaxed text-gray-200 mb-6">
                {reviews[activeReviewIndex].comment}
              </p>
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-t border-festive-yellow-500/10 pt-6 gap-4">
                <div>
                  <h4 className="font-bold text-festive-yellow-500 text-base">{reviews[activeReviewIndex].name}</h4>
                  <p className="text-xs text-gray-400">{reviews[activeReviewIndex].location}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs px-3 py-1.5 rounded-full border border-logo-blue-500/25 bg-logo-blue-500/10 text-logo-blue-100 font-mono">
                    {reviews[activeReviewIndex].tag}
                  </span>
                  <div className="flex gap-0.5 text-festive-yellow-500">
                    {[...Array(reviews[activeReviewIndex].rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Slider Indicators */}
          <div className="flex justify-center gap-2.5 mt-6">
            {reviews.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveReviewIndex(idx)}
                className={`w-3.5 h-3.5 rounded-full transition-all duration-300 ${
                  activeReviewIndex === idx ? 'bg-festive-yellow-500 scale-120 glow-yellow' : 'bg-gray-700 hover:bg-gray-600'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Safety Guarantee Section */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-festive-yellow-500/10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="blinkit-card p-8 rounded-[28px]">
            <Shield className="w-10 h-10 text-logo-blue-500 mb-4" />
            <h3 className="text-xl font-bold font-serif mb-2 text-festive-yellow-500">Strict Status Locking</h3>
            <p className="text-sm text-gray-300 font-light">
              Once you initiate a booking, the Murti is locked immediately. No duplicate bookings or double-sales, ensuring your festival starts with joy.
            </p>
          </div>
          <div className="blinkit-card p-8 rounded-[28px]">
            <Award className="w-10 h-10 text-festive-yellow-500 mb-4" />
            <h3 className="text-xl font-bold font-serif mb-2 text-festive-yellow-500">Premium Handcrafting</h3>
            <p className="text-sm text-gray-300 font-light">
              Every idol is crafted from 100% organic clay, individually hand-painted by master artisans with eco-friendly natural pigments.
            </p>
          </div>
          <div className="blinkit-card p-8 rounded-[28px]">
            <HelpCircle className="w-10 h-10 text-logo-blue-500 mb-4" />
            <h3 className="text-xl font-bold font-serif mb-2 text-festive-yellow-500">Endless Creation</h3>
            <p className="text-sm text-gray-300 font-light">
              Have questions about dimensions, transport logistics, or special themes? Hit the floating WhatsApp button to chat directly with us.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
