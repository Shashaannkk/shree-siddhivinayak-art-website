import React from 'react';
import MurtiDetailClient from './MurtiDetailClient';
import { api } from '@/utils/api';

export async function generateStaticParams() {
  const murtis = await api.getMurtis();
  return murtis.map((m) => ({
    code: m.code,
  }));
}

export default function MurtiDetailPage() {
  return <MurtiDetailClient />;
}
