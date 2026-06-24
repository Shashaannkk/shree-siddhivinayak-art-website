import type { Metadata } from "next";
import { Cinzel, Outfit } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import React from "react";

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
  return (
    <html lang="en" className={`${cinzel.variable} ${outfit.variable}`}>
      <body className="antialiased min-h-screen bg-[#1C0102] text-[#FFF9F5]">
        {/* Navigation Bar - Apple Style Rounded Glassmorphism */}
        <header className="sticky top-4 z-50 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="w-full border border-festive-yellow-500/20 bg-[#2C0001]/90 backdrop-blur-lg h-20 rounded-full px-6 flex items-center justify-between shadow-[0_10px_30px_rgba(0,0,0,0.6)]">
            <Link href="/" className="flex items-center gap-3 group">
              <span className="text-xl sm:text-2xl font-black tracking-wider font-serif group-hover:scale-102 transition-transform flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-[#0088FF] flex items-center justify-center text-sm font-bold text-white shadow-md border border-[#FFC107]/30">
                  श्री
                </span>
                <span className="text-gold-gradient">SIDDHIVINAYAK ARTS</span>
              </span>
            </Link>
            
            <nav className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-wider">
              <Link href="/" className="text-gray-300 hover:text-festive-yellow-500 transition-colors">Home</Link>
              <Link href="/collection" className="text-gray-300 hover:text-festive-yellow-500 transition-colors">Collection</Link>
              <Link href="/admin/dashboard" className="text-gray-300 hover:text-festive-yellow-500 transition-colors">Admin Portal</Link>
            </nav>

            <div className="flex items-center gap-4">
              <Link 
                href="/collection" 
                className="px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider text-black bg-gradient-to-r from-[#FFC107] to-[#FFB300] hover:scale-105 active:scale-95 transition-transform duration-200 shadow-md shadow-festive-yellow-500/20"
              >
                View Collection
              </Link>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="relative min-h-[calc(100vh-22rem)] pt-6">
          {children}
        </main>

        {/* Footer */}
        <footer className="w-full bg-[#0F0001] border-t border-festive-yellow-500/10 py-12 relative overflow-hidden mt-12">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(255,193,7,0.04),transparent_70%)] pointer-events-none" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
            <div className="text-center md:text-left">
              <h3 className="text-lg font-serif font-black text-gold-gradient tracking-wider flex items-center gap-2 justify-center md:justify-start">
                <span className="w-6 h-6 rounded-full bg-[#0088FF] flex items-center justify-center text-[10px] font-bold text-white border border-[#FFC107]/20">
                  श्री
                </span>
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
          className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-600 shadow-xl border border-white/10 transition-transform duration-300 hover:scale-110 active:scale-95 animate-bounce group"
          aria-label="Contact on WhatsApp"
        >
          <svg className="w-8 h-8 text-white fill-current" viewBox="0 0 24 24">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.517 2.266 2.27 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.625 1.45 5.507.003 9.985-4.474 9.988-9.983.001-2.67-1.036-5.18-2.92-7.065C16.456 1.67 13.945.635 11.277.635c-5.51 0-9.99 4.476-9.993 9.986-.001 1.514.4 2.99 1.157 4.26l-.415 1.516.485.467zm12.39-7.393c-.301-.15-1.785-.88-2.062-.98-.277-.1-.478-.15-.677.15-.199.3-.77.98-.945 1.177-.175.2-.35.22-.651.07-1.127-.565-1.93-1.01-2.695-2.327-.2-.34.2-.315.571-1.054.062-.12.03-.23-.015-.33-.045-.1-.478-1.15-.654-1.58-.172-.41-.36-.35-.478-.36l-.41-.01c-.198 0-.52.074-.792.373-.272.3-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.2 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.785-.73 2.037-1.435.252-.705.252-1.31.176-1.436-.076-.12-.277-.198-.578-.348z" />
          </svg>
          <span className="absolute right-16 scale-0 group-hover:scale-100 bg-[#2C0001] text-[#FFF9F5] border border-festive-yellow-500/20 text-xs px-3 py-1.5 rounded-lg whitespace-nowrap shadow-lg transition-transform duration-200 origin-right">
            Chat with us
          </span>
        </a>
      </body>
    </html>
  );
}
