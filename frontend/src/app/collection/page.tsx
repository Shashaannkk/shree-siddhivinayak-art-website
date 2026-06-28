'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { api, Murti } from '@/utils/api';
import { Filter, Search, RotateCcw, X, Camera, Upload, Image as ImageIcon, Loader2 } from 'lucide-react';

// Helper to convert a file to a Data URL
function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read file.'));
    reader.readAsDataURL(file);
  });
}

// Helper to compute a color signature vector of 48 values (4x4 grid of RGB colors)
async function getImageColorProfile(url: string): Promise<number[]> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 4;
        canvas.height = 4;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context could not be created.'));
          return;
        }
        ctx.drawImage(img, 0, 0, 4, 4);
        const imgData = ctx.getImageData(0, 0, 4, 4);
        const data = imgData.data;
        const vector: number[] = [];
        for (let i = 0; i < data.length; i += 4) {
          vector.push(data[i]);     // R
          vector.push(data[i + 1]); // G
          vector.push(data[i + 2]); // B
        }
        resolve(vector);
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = () => reject(new Error('Image failed to load: ' + url));
    img.src = url;
  });
}

function CollectionContent() {
  const searchParams = useSearchParams();
  
  const [murtis, setMurtis] = useState<(Murti & { matchScore?: number })[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters State
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [size, setSize] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [search, setSearch] = useState('');

  // Mobile Filters toggle
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Search by Image State
  const [searchImage, setSearchImage] = useState<string | null>(null);
  const [searchImageFile, setSearchImageFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [isMatchingActive, setIsMatchingActive] = useState(false);

  useEffect(() => {
    async function loadMurtis() {
      setLoading(true);
      try {
        const filters: Record<string, string> = {};
        if (category) filters.category = category;
        if (status) filters.status = status;
        if (size) filters.size = size;
        if (search) filters.search = search;
        
        if (priceRange) {
          const [min, max] = priceRange.split('-');
          if (min) filters.minPrice = min;
          if (max) filters.maxPrice = max;
        }

        const data = await api.getMurtis(filters);
        
        if (isMatchingActive && searchImage) {
          try {
            const queryProfile = await getImageColorProfile(searchImage);
            const scoredList = await Promise.all(
              data.map(async (murti) => {
                const photoUrl = murti.photos[0];
                if (!photoUrl) return { ...murti, matchScore: 0 };
                try {
                  const murtiProfile = await getImageColorProfile(photoUrl);
                  let sumSqDiff = 0;
                  for (let i = 0; i < queryProfile.length; i++) {
                    const diff = queryProfile[i] - murtiProfile[i];
                    sumSqDiff += diff * diff;
                  }
                  const mse = sumSqDiff / queryProfile.length;
                  const rmse = Math.sqrt(mse);
                  const score = Math.max(0, 100 - (rmse / 255) * 100);
                  return { ...murti, matchScore: Math.round(score) };
                } catch {
                  return { ...murti, matchScore: 0 };
                }
              })
            );
            const sorted = scoredList.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
            setMurtis(sorted);
          } catch (err) {
            console.error("Visual search error during filter updates:", err);
            setMurtis(data);
          }
        } else {
          setMurtis(data);
        }
      } catch (err) {
        console.error('Error fetching filtered murtis:', err);
      } finally {
        setLoading(false);
      }
    }
    
    loadMurtis();
  }, [category, status, size, priceRange, search, isMatchingActive, searchImage]);

  const categories = [
    'Ganpati',
    'Navratri',
    'Krishna Theme',
    'Mavla Theme',
    'Royal Theme',
    'Narasimha Theme'
  ];

  const sizes = ['2.5 Ft', '3.0 Ft', '3.5 Ft', '4.0 Ft', '4.5 Ft', '5.0 Ft'];

  const priceRanges = [
    { label: 'Under ₹15,000', value: '0-15000' },
    { label: '₹15,000 - ₹20,000', value: '15000-20000' },
    { label: '₹20,000 - ₹25,000', value: '20000-25000' },
    { label: 'Above ₹25,000', value: '25000-999999' }
  ];

  const resetFilters = () => {
    setCategory('');
    setStatus('');
    setSize('');
    setPriceRange('');
    setSearch('');
    setSearchImage(null);
    setSearchImageFile(null);
    setIsMatchingActive(false);
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        setSearchImageFile(file);
        const dataUrl = await fileToDataURL(file);
        setSearchImage(dataUrl);
      } catch (err) {
        alert("Failed to read the file.");
      }
    }
  };

  const runImageSearch = async () => {
    if (!searchImage) return;
    setIsAnalyzing(true);
    try {
      const queryProfile = await getImageColorProfile(searchImage);
      const scoredList = await Promise.all(
        murtis.map(async (murti) => {
          const photoUrl = murti.photos[0];
          if (!photoUrl) return { ...murti, matchScore: 0 };
          try {
            const murtiProfile = await getImageColorProfile(photoUrl);
            let sumSqDiff = 0;
            for (let i = 0; i < queryProfile.length; i++) {
              const diff = queryProfile[i] - murtiProfile[i];
              sumSqDiff += diff * diff;
            }
            const mse = sumSqDiff / queryProfile.length;
            const rmse = Math.sqrt(mse);
            const score = Math.max(0, 100 - (rmse / 255) * 100);
            return { ...murti, matchScore: Math.round(score) };
          } catch (e) {
            console.warn(`Could not compute color profile for ${murti.code}:`, e);
            return { ...murti, matchScore: 0 };
          }
        })
      );
      const sorted = scoredList.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
      setMurtis(sorted);
      setIsMatchingActive(true);
      setShowImageModal(false);
    } catch (err) {
      console.error('Error running image match search:', err);
      alert('Visual analysis failed. Please verify the image file format.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 bg-festive-red-gradient">
      {/* Page Title */}
      <div className="mb-10 text-center md:text-left">
        <h1 className="text-3xl sm:text-5xl font-serif font-black tracking-tight text-gold-gradient">
          The Divine Collection
        </h1>
        <p className="text-red-200 font-light mt-2">
          Reserve your handcrafted idol from our exclusive collection. One Murti, One Booking.
        </p>
      </div>

      {/* Search and Filters Toggle */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-grow">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by Murti Name or Code (e.g. GAN-001)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-[#2C0001]/80 border border-festive-yellow-500/20 focus:border-festive-yellow-500/50 rounded-2xl text-sm outline-none text-white placeholder-gray-400 transition-colors"
          />
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowImageModal(true)}
            className="flex items-center justify-center gap-2 px-6 py-4 bg-[#2C0001] border border-festive-yellow-500/20 rounded-2xl text-sm font-bold text-gray-200 hover:border-festive-yellow-500/40 cursor-pointer"
          >
            <Camera className="w-4 h-4 text-logo-blue-500" /> <span>Search by Image</span>
          </button>
          <button
            onClick={() => setShowMobileFilters(true)}
            className="md:hidden flex items-center justify-center gap-2 px-6 py-4 bg-[#2C0001] border border-festive-yellow-500/20 rounded-2xl text-sm font-semibold hover:border-festive-yellow-500/40"
          >
            <Filter className="w-4 h-4 text-logo-blue-500" /> Filters
          </button>
        </div>
      </div>

      {/* Active Image Search Banner */}
      {isMatchingActive && searchImage && (
        <div className="mb-8 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-4 text-sm text-emerald-200">
          <div className="flex items-center gap-3">
            <img src={searchImage} className="w-12 h-12 object-cover rounded-lg border border-emerald-500/30 shrink-0" alt="Query reference" />
            <div>
              <p className="font-bold">Visual Image Matching Search Active</p>
              <p className="text-xs text-gray-300">Catalog currently sorted by visual similarity to your uploaded photo.</p>
            </div>
          </div>
          <button 
            onClick={() => {
              setIsMatchingActive(false);
              setSearchImage(null);
              setSearchImageFile(null);
              resetFilters();
            }}
            className="px-4 py-2 border border-emerald-500/30 hover:bg-emerald-500/20 text-xs font-bold rounded-full transition-colors uppercase tracking-wider cursor-pointer shrink-0"
          >
            Clear Image Search
          </button>
        </div>
      )}

      <div className="flex gap-8 items-start">
        {/* LEFT COLUMN: FILTERS (DESKTOP) */}
        <aside className="hidden md:block w-72 shrink-0 blinkit-card p-6 sticky top-28 border border-festive-yellow-500/10">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-festive-yellow-500/15">
            <h3 className="text-sm font-serif font-bold text-festive-yellow-500 tracking-wide uppercase flex items-center gap-2">
              <Filter className="w-4 h-4 text-logo-blue-500" /> Filter Options
            </h3>
            <button 
              onClick={resetFilters}
              className="text-xs text-gray-400 hover:text-festive-yellow-500 flex items-center gap-1 transition-colors font-bold"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>
          </div>

          {/* Category Filter */}
          <div className="mb-6">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-3">Theme Category</label>
            <div className="flex flex-col gap-1.5">
              <button
                onClick={() => setCategory('')}
                className={`text-left text-sm px-3.5 py-2 rounded-xl transition-all ${
                  category === '' ? 'bg-[#FFC107]/10 text-festive-yellow-500 font-bold border-l-4 border-festive-yellow-500' : 'text-gray-300 hover:text-white hover:bg-red-950/40'
                }`}
              >
                All Themes
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`text-left text-sm px-3.5 py-2 rounded-xl transition-all ${
                    category === cat ? 'bg-[#FFC107]/10 text-festive-yellow-500 font-bold border-l-4 border-festive-yellow-500' : 'text-gray-300 hover:text-white hover:bg-red-950/40'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Status Filter */}
          <div className="mb-6 border-t border-festive-yellow-500/10 pt-4">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-3">Availability</label>
            <div className="flex flex-col gap-1.5">
              {[
                { label: 'All States', val: '' },
                { label: 'Available', val: 'Available' },
                { label: 'Reserved', val: 'Reserved' },
                { label: 'Sold Out', val: 'Sold' }
              ].map((s) => (
                <button
                  key={s.val}
                  onClick={() => setStatus(s.val)}
                  className={`text-left text-sm px-3.5 py-2 rounded-xl transition-all ${
                    status === s.val 
                      ? 'bg-[#FFC107]/10 text-festive-yellow-500 font-bold border-l-4 border-festive-yellow-500' 
                      : 'text-gray-300 hover:text-white hover:bg-red-950/40'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Size Filter */}
          <div className="mb-6 border-t border-festive-yellow-500/10 pt-4">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-3">Murti Size</label>
            <div className="grid grid-cols-2 gap-2">
              {sizes.map((sz) => (
                <button
                  key={sz}
                  onClick={() => setSize(size === sz ? '' : sz)}
                  className={`text-xs py-2 rounded-xl border text-center transition-all ${
                    size === sz 
                      ? 'border-festive-yellow-500 bg-[#FFC107]/10 text-festive-yellow-500 font-bold' 
                      : 'border-festive-yellow-500/20 text-gray-300 hover:border-festive-yellow-500/40'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          {/* Price Filter */}
          <div className="border-t border-festive-yellow-500/10 pt-4">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-3">Price Range</label>
            <div className="flex flex-col gap-1.5">
              {priceRanges.map((pr) => (
                <button
                  key={pr.value}
                  onClick={() => setPriceRange(priceRange === pr.value ? '' : pr.value)}
                  className={`text-left text-xs px-3.5 py-2.5 rounded-xl border transition-all ${
                    priceRange === pr.value 
                      ? 'border-festive-yellow-500 bg-[#FFC107]/10 text-festive-yellow-500 font-bold' 
                      : 'border-festive-yellow-500/20 text-gray-300 hover:border-festive-yellow-500/40'
                  }`}
                >
                  {pr.label}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* RIGHT COLUMN: MURTI GRID */}
        <div className="flex-grow">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="h-96 rounded-[28px] bg-gray-900/50 border border-festive-yellow-500/10 animate-pulse" />
              ))}
            </div>
          ) : murtis.length === 0 ? (
            <div className="blinkit-card p-12 text-center max-w-lg mx-auto mt-8 border border-festive-yellow-500/20">
              <span className="text-4xl block mb-4">🙏</span>
              <h3 className="text-xl font-bold font-serif text-festive-yellow-500 mb-2">No Murtis Found</h3>
              <p className="text-sm text-gray-300 mb-6 font-light">We couldn't find any murtis matching your filters. Try resetting the choices.</p>
              <button 
                onClick={resetFilters} 
                className="px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider text-black bg-gradient-to-r from-[#FFC107] to-[#FFB300]"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {murtis.map((murti) => (
                <div key={murti.code} className="blinkit-card overflow-hidden group flex flex-col h-full">
                  {/* Photo with Overlay Badge */}
                  <div className="relative h-64 w-full overflow-hidden bg-black/40">
                    <img 
                      src={murti.photos[0] || 'https://images.unsplash.com/photo-1609252509102-ee7026b2161f?w=800&auto=format&fit=crop'} 
                      alt={murti.name} 
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                    />
                    
                    {/* Card Watermark Logo */}
                    <div className="absolute top-4 left-4 z-10 opacity-60 pointer-events-none">
                      <img 
                        src={`${api.basePath || ''}/images/logo-white.png`} 
                        alt="" 
                        className="w-10 h-10 object-contain"
                      />
                    </div>

                    {/* Visual match badge */}
                    {murti.matchScore !== undefined && (
                      <div className="absolute top-4 left-16 z-10 bg-emerald-500 border border-emerald-400 text-white font-extrabold text-[10px] px-2.5 py-1.5 rounded-full shadow-md animate-pulse">
                        🎯 {murti.matchScore}% Match
                      </div>
                    )}

                    {/* Status Badge */}
                    <div className="absolute top-4 right-4">
                      <span className={`px-3 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider ${
                        murti.status === 'Available' ? 'status-available' : 
                        murti.status === 'Reserved' ? 'status-reserved' : 'status-sold'
                      }`}>
                        {murti.status === 'Available' ? 'Available' : 
                         murti.status === 'Reserved' ? 'Reserved' : 'Sold Out'}
                      </span>
                    </div>

                    {/* Category Label */}
                    <div className="absolute bottom-4 left-4 bg-[#1C0102]/85 backdrop-blur-sm border border-festive-yellow-500/20 px-3 py-1 rounded-full text-xs font-bold text-festive-yellow-500">
                      {murti.category}
                    </div>
                  </div>

                  {/* Details Card */}
                  <div className="p-5 flex-grow flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <h3 className="text-lg font-bold font-serif tracking-wide group-hover:text-festive-yellow-500 transition-colors">
                          {murti.name}
                        </h3>
                        <span className="text-xs text-gray-400 font-mono tracking-wider">{murti.code}</span>
                      </div>
                      <p className="text-xs text-gray-300 font-light line-clamp-2 mb-4">
                        {murti.description}
                      </p>
                    </div>

                    <div className="border-t border-festive-yellow-500/10 pt-4 mt-auto">
                      <div className="flex justify-between items-center mb-4 text-xs">
                        <div>
                          <span className="text-[10px] text-gray-400 block font-bold uppercase tracking-wider">Price</span>
                          <span className="text-base font-black text-festive-yellow-500 font-serif">₹{murti.price.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="text-center">
                          <span className="text-[10px] text-gray-400 block font-bold uppercase tracking-wider">Stock</span>
                          <span className={`font-bold ${(murti.quantity || 0) > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {murti.quantity !== undefined ? `${murti.quantity} Left` : '1 Left'}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-gray-400 block font-bold uppercase tracking-wider">Height</span>
                          <span className="text-sm font-bold text-gray-100">{murti.size}</span>
                        </div>
                      </div>

                      <Link 
                        href={`/murti/?code=${murti.code}`} 
                        className={`w-full py-3 rounded-full text-center text-xs font-bold uppercase tracking-wider transition-all block ${
                          murti.status === 'Available' && (murti.quantity !== undefined ? murti.quantity : 1) > 0
                            ? 'bg-gradient-to-r from-logo-blue-500 to-logo-blue-600 text-white hover:scale-102 active:scale-98 shadow-md' 
                            : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {murti.status === 'Available' && (murti.quantity !== undefined ? murti.quantity : 1) > 0 ? '🔵 Book This Murti' : 'Details / Sold Out'}
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* MOBILE FILTERS SIDE SHEET */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 flex justify-end md:hidden bg-black/85 backdrop-blur-md">
          <div className="w-80 h-full bg-[#1C0102] border-l border-festive-yellow-500/20 p-6 overflow-y-auto flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-festive-yellow-500/10">
                <h3 className="text-base font-serif font-bold text-festive-yellow-500 tracking-wide uppercase">Filters</h3>
                <button onClick={() => setShowMobileFilters(false)}>
                  <X className="w-5 h-5 text-gray-300" />
                </button>
              </div>

              {/* Mobile Category */}
              <div className="mb-6">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-3">Theme Category</label>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => { setCategory(''); setShowMobileFilters(false); }}
                    className={`text-left text-sm px-3 py-2.5 rounded-xl ${
                      category === '' ? 'bg-[#FFC107]/10 text-festive-yellow-500' : 'text-gray-300'
                    }`}
                  >
                    All Themes
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => { setCategory(cat); setShowMobileFilters(false); }}
                      className={`text-left text-sm px-3 py-2.5 rounded-xl ${
                        category === cat ? 'bg-[#FFC107]/10 text-festive-yellow-500' : 'text-gray-300'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mobile Status */}
              <div className="mb-6 border-t border-festive-yellow-500/10 pt-4">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-3">Availability</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: 'All', val: '' },
                    { label: 'Available', val: 'Available' },
                    { label: 'Reserved', val: 'Reserved' },
                    { label: 'Sold Out', val: 'Sold' }
                  ].map((s) => (
                    <button
                      key={s.val}
                      onClick={() => { setStatus(s.val); setShowMobileFilters(false); }}
                      className={`text-xs px-3 py-2 rounded-full border ${
                        status === s.val ? 'border-festive-yellow-500 bg-[#FFC107]/10 text-festive-yellow-500' : 'border-festive-yellow-500/20 text-gray-300'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mobile Size */}
              <div className="mb-6 border-t border-festive-yellow-500/10 pt-4">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-3">Size</label>
                <div className="grid grid-cols-2 gap-2">
                  {sizes.map((sz) => (
                    <button
                      key={sz}
                      onClick={() => { setSize(size === sz ? '' : sz); setShowMobileFilters(false); }}
                      className={`text-xs py-2 rounded-xl border text-center ${
                        size === sz ? 'border-festive-yellow-500 bg-[#FFC107]/10 text-festive-yellow-500' : 'border-festive-yellow-500/20 text-gray-300'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="border-t border-festive-yellow-500/10 pt-6 mt-6 flex justify-between gap-4">
              <button 
                onClick={() => { resetFilters(); setShowMobileFilters(false); }}
                className="w-1/2 py-2.5 border border-festive-yellow-500/20 text-gray-300 rounded-full text-xs uppercase tracking-wider font-bold"
              >
                Clear All
              </button>
              <button 
                onClick={() => setShowMobileFilters(false)}
                className="w-1/2 py-2.5 bg-gradient-to-r from-logo-blue-500 to-logo-blue-600 text-white rounded-full text-xs uppercase tracking-wider font-bold"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SEARCH BY IMAGE MODAL */}
      {showImageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
          <div className="blinkit-card w-full max-w-xl rounded-[32px] p-6 sm:p-8 border border-festive-yellow-500/20 relative animate-in fade-in zoom-in duration-200">
            
            {/* Header */}
            <div className="flex justify-between items-start border-b border-festive-yellow-500/15 pb-4 mb-6">
              <div>
                <h3 className="text-xl font-serif font-black text-festive-yellow-500">Visual Image Search</h3>
                <p className="text-xs text-gray-300 mt-1">Match murtis in our catalog by color profile and layout</p>
              </div>
              <button 
                onClick={() => { setShowImageModal(false); if (!isMatchingActive) { setSearchImage(null); setSearchImageFile(null); } }}
                className="text-gray-400 hover:text-white text-lg font-bold cursor-pointer"
                disabled={isAnalyzing}
              >
                ✕
              </button>
            </div>

            {/* Content */}
            {isAnalyzing ? (
              <div className="text-center py-12 flex flex-col items-center justify-center">
                <Loader2 className="w-12 h-12 text-festive-yellow-500 animate-spin mb-4" />
                <h4 className="text-lg font-serif font-black text-festive-yellow-500 mb-2">Analyzing Image Patterns</h4>
                <p className="text-sm text-gray-300 max-w-xs mx-auto">Running color signature matching across all database creations. Please wait...</p>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                {!searchImage ? (
                  <label className="border-2 border-dashed border-festive-yellow-500/20 hover:border-festive-yellow-500/50 rounded-2xl p-10 text-center flex flex-col items-center gap-4 cursor-pointer transition-colors bg-[#2C0001]/20">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageFileChange} 
                      className="hidden" 
                    />
                    <Upload className="w-12 h-12 text-logo-blue-500 animate-bounce" />
                    <div>
                      <span className="text-sm font-bold text-gray-200 block mb-1">Click to Upload Image</span>
                      <span className="text-xs text-gray-400">Supports JPG, PNG, WEBP formats</span>
                    </div>
                  </label>
                ) : (
                  <div className="flex flex-col gap-4">
                    <div className="relative h-64 w-full rounded-2xl overflow-hidden border border-festive-yellow-500/25 bg-black/40 flex items-center justify-center">
                      <img src={searchImage} className="object-contain w-full h-full" alt="Selected search" />
                    </div>
                    <div className="flex justify-between items-center text-xs text-gray-300 bg-[#1C0102] p-3 rounded-xl border border-festive-yellow-500/10">
                      <div className="truncate pr-4">
                        <span className="block text-gray-400">File Name:</span>
                        <strong className="text-gray-200 font-mono">{searchImageFile?.name || 'Uploaded File'}</strong>
                      </div>
                      <button 
                        onClick={() => { setSearchImage(null); setSearchImageFile(null); }}
                        className="px-3.5 py-1.5 border border-festive-red-500 text-red-300 rounded-full hover:bg-festive-red-500/10 transition-colors cursor-pointer shrink-0 uppercase font-black tracking-wider text-[10px]"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex gap-4 border-t border-festive-yellow-500/15 pt-6 mt-2">
                  <button
                    onClick={() => { setShowImageModal(false); if (!isMatchingActive) { setSearchImage(null); setSearchImageFile(null); } }}
                    className="w-1/2 py-3 border border-festive-yellow-500/20 text-gray-300 rounded-full text-xs uppercase tracking-wider font-bold hover:bg-[#1C0102]/60 transition-colors cursor-pointer"
                    disabled={isAnalyzing}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={runImageSearch}
                    disabled={isAnalyzing || !searchImage}
                    className="w-1/2 py-3 bg-gradient-to-r from-[#FFC107] to-[#FFB300] text-black rounded-full text-xs uppercase tracking-wider font-extrabold shadow-md hover:scale-102 active:scale-98 transition-transform disabled:opacity-50 cursor-pointer"
                  >
                    Start Matching Search
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function CollectionPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-gray-400 bg-festive-red-gradient">
        Loading collection details...
      </div>
    }>
      <CollectionContent />
    </Suspense>
  );
}
