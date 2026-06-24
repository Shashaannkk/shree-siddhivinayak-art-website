'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';

interface HeaderProps {
  basePath: string;
}

export default function Header({ basePath }: HeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('admin_token');
      setIsLoggedIn(!!token);
    }
  }, [pathname]);

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Collection', href: '/collection' },
    { label: 'About', href: '/about' },
    { label: isLoggedIn ? 'Dashboard' : 'Login', href: isLoggedIn ? '/admin/dashboard' : '/admin/login' }
  ];

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  return (
    <header className="sticky top-4 z-50 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header Bar */}
      <div className="w-full border border-festive-yellow-500/20 bg-[#2C0001]/95 backdrop-blur-lg h-16 sm:h-20 rounded-full px-5 sm:px-6 flex items-center justify-between shadow-[0_10px_30px_rgba(0,0,0,0.6)] transition-all">
        {/* Logo and Brand */}
        <Link href="/" className="flex items-center gap-2 group shrink-0">
          <img 
            src={`${basePath}/images/logo-red.png`} 
            alt="Shree Siddhivinayak Arts Logo" 
            className="w-9 h-9 sm:w-11 sm:h-11 object-contain rounded-full border border-festive-yellow-500/20 bg-red-950/60 shadow-md group-hover:scale-105 transition-transform"
          />
          <span className="text-base sm:text-xl lg:text-2xl font-black tracking-wider font-serif group-hover:scale-102 transition-transform text-gold-gradient select-none">
            SIDDHIVINAYAK ARTS
          </span>
        </Link>
        
        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-wider">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link 
                key={link.href} 
                href={link.href}
                className={`transition-colors relative py-1 hover:text-festive-yellow-500 ${
                  isActive ? 'text-festive-yellow-500 font-extrabold' : 'text-gray-300'
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-festive-yellow-500 rounded-full animate-in fade-in slide-in-from-bottom-1 duration-200" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right side: desktop CTA / mobile toggle */}
        <div className="flex items-center gap-3">
          <Link 
            href="/collection" 
            className="hidden md:inline-block px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider text-black bg-gradient-to-r from-[#FFC107] to-[#FFB300] hover:scale-105 active:scale-95 transition-transform duration-200 shadow-md shadow-festive-yellow-500/20 whitespace-nowrap"
          >
            Explore Catalog
          </Link>

          {/* Mobile Menu Hamburger Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-full border border-festive-yellow-500/20 bg-red-950/40 text-festive-yellow-500 hover:bg-[#2C0001] transition-colors focus:outline-none"
            aria-label="Toggle Navigation Menu"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu Drawer */}
      {isOpen && (
        <div className="absolute top-20 left-4 right-4 md:hidden border border-festive-yellow-500/25 bg-[#2C0001]/98 backdrop-blur-xl rounded-[28px] p-6 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300">
          <nav className="flex flex-col gap-4 text-sm font-bold uppercase tracking-wider text-center">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={handleLinkClick}
                  className={`py-2 rounded-xl transition-all ${
                    isActive 
                      ? 'bg-[#FFC107]/10 text-festive-yellow-500 border border-festive-yellow-500/15' 
                      : 'text-gray-300 hover:text-white hover:bg-red-950/40'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            
            <Link 
              href="/collection" 
              onClick={handleLinkClick}
              className="mt-2 py-3 rounded-full text-xs font-bold uppercase tracking-wider text-black bg-gradient-to-r from-[#FFC107] to-[#FFB300]"
            >
              Explore Catalog
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
