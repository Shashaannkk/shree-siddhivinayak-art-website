import type { Metadata } from "next";
import { Cinzel, Outfit } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import React from "react";
import Header from "@/components/Header";

const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["400", "600", "700", "800"],
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Shree Siddhivinayak Arts | Premium Handmade Murti Bookings",
  description: "Book authentic handmade murtis (Ganpati, Navratri, Krishna, Royal, Mavla, Narasimha) directly from Shree Siddhivinayak Arts. One Murti, One Code, One Status.",
  keywords: "Ganpati booking, Ganesh Murti booking, Durga idol, handcrafted Murti, Shree Siddhivinayak Arts, Ganeshotsav",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
  return (
    <html lang="en" className={`${cinzel.variable} ${outfit.variable}`}>
      <body className="antialiased min-h-screen bg-[#1C0102] text-[#FFF9F5]">
        {/* Navigation Bar - Client Component Header with Hamburger Menu */}
        <Header basePath={basePath} />

        {/* Main Content */}
        <main className="relative min-h-[calc(100vh-22rem)] pt-6">
          {children}
        </main>

        {/* Footer */}
        <footer className="w-full bg-[#0F0001] border-t border-festive-yellow-500/10 py-12 relative overflow-hidden mt-12">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(255,193,7,0.04),transparent_70%)] pointer-events-none" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
            <div className="text-center md:text-left">
              <h3 className="text-lg font-serif font-black text-gold-gradient tracking-wider flex items-center gap-2.5 justify-center md:justify-start">
                <img 
                  src={`${basePath}/images/logo-red.png`} 
                  alt="" 
                  className="w-8 h-8 object-contain rounded-full border border-festive-yellow-500/15"
                />
                SHREE SIDDHIVINAYAK ARTS
              </h3>
              <p className="text-xs text-gray-500 mt-2">Premium Handcrafted Murtis. Endless Creation...</p>
            </div>
            
            <div className="flex gap-6 text-xs uppercase font-bold tracking-wider text-gray-400">
              <Link href="/" className="hover:text-festive-yellow-500 transition-colors">Home</Link>
              <Link href="/collection" className="hover:text-festive-yellow-500 transition-colors">Collection</Link>
              <Link href="/admin/dashboard" className="hover:text-festive-yellow-500 transition-colors">Admin Panel</Link>
            </div>

            <div className="text-center md:text-right text-xs text-gray-600">
              <p>© {new Date().getFullYear()} Shree Siddhivinayak Arts. All rights reserved.</p>
              <p className="mt-1">Crafted with devotion & premium standards.</p>
            </div>
          </div>
        </footer>

        {/* Floating WhatsApp Widget */}
        <a 
          href="https://wa.me/919876543210?text=Hi%20Shree%20Siddhivinayak%20Arts,%20I'm%20interested%20in%20inquiring%20about%20your%20murtis." 
          target="_blank" 
          rel="noopener noreferrer"
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-emerald-500 hover:bg-emerald-600 shadow-xl border border-white/10 transition-transform duration-300 hover:scale-110 active:scale-95 animate-bounce group"
          aria-label="Contact on WhatsApp"
        >
          <svg className="w-7 h-7 text-white fill-current" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.389 1.694.525.717.227 1.367.194 1.884.118.577-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.705 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          <span className="absolute right-16 scale-0 group-hover:scale-100 bg-[#2C0001] text-[#FFF9F5] border border-festive-yellow-500/20 text-xs px-3 py-1.5 rounded-lg whitespace-nowrap shadow-lg transition-transform duration-200 origin-right">
            Chat with us
          </span>
        </a>
      </body>
    </html>
  );
}
