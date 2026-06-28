'use client';

import React, { Suspense } from 'react';
import MurtiDetailClient from './MurtiDetailClient';
import { Loader2 } from 'lucide-react';

export default function MurtiDetailPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 py-36 text-center text-gray-400 bg-festive-red-gradient">
        <Loader2 className="w-10 h-10 text-festive-yellow-500 animate-spin mx-auto mb-4" />
        <p className="font-serif font-bold text-festive-yellow-500">Loading Murti Detail Page...</p>
      </div>
    }>
      <MurtiDetailClient />
    </Suspense>
  );
}
