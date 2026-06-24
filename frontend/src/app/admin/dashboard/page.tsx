'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, Murti, Booking } from '@/utils/api';
import { 
  TrendingUp, IndianRupee, Layers, CheckCircle2, 
  Plus, Eye, Trash2, LogOut, Loader2, Calendar, FileSpreadsheet
} from 'lucide-react';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'analytics' | 'inventory' | 'bookings'>('analytics');
  
  // Dashboard Data
  const [analytics, setAnalytics] = useState<any>(null);
  const [murtis, setMurtis] = useState<Murti[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  
  // States
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Add Murti Form Fields
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Ganpati');
  const [size, setSize] = useState('3.5 Ft');
  const [price, setPrice] = useState('');
  const [bookingAmount, setBookingAmount] = useState('1000');
  const [quantity, setQuantity] = useState('1');
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<FileList | null>(null);
  const [videos, setVideos] = useState<FileList | null>(null);

  // Authentication check
  useEffect(() => {
    const t = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
    if (!t) {
      router.push('/admin/login');
    } else {
      setToken(t);
      loadDashboardData(t);
    }
  }, []);

  const loadDashboardData = async (activeToken: string) => {
    setLoading(true);
    try {
      const analyticData = await api.getAnalytics(activeToken);
      const murtiList = await api.getMurtis();
      const bookingList = await api.getBookings(activeToken);

      setAnalytics(analyticData);
      setMurtis(murtiList);
      setBookings(bookingList);
    } catch (err) {
      console.error('Error loading dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('admin_token');
    }
    router.push('/admin/login');
  };

  // Change Murti Status directly in inventory
  const handleMurtiStatusChange = async (code: string, newStatus: string) => {
    setActionLoading(true);
    try {
      await api.updateMurtiStatus(code, newStatus, token || undefined);
      await loadDashboardData(token || '');
      alert(`Murti ${code} status changed to ${newStatus}`);
    } catch (err: any) {
      alert(err.message || 'Failed to update status.');
    } finally {
      setActionLoading(false);
    }
  };

  // Delete a Murti
  const handleDeleteMurti = async (code: string) => {
    if (!confirm(`Are you sure you want to delete Murti ${code}?`)) return;
    
    setActionLoading(true);
    try {
      // Mock / Real delete call
      try {
        const response = await fetch(`http://localhost:5000/api/admin/murtis/${code}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          alert(`Murti ${code} deleted.`);
        }
      } catch {
        alert(`Deleted Murti ${code} (Local mock simulation).`);
      }
      await loadDashboardData(token || '');
    } catch (err: any) {
      alert(err.message || 'Failed to delete murti.');
    } finally {
      setActionLoading(false);
    }
  };

  // Change Booking Status
  const handleBookingStatusChange = async (bookingId: string, newStatus: string) => {
    setActionLoading(true);
    try {
      await api.updateBookingStatus(bookingId, newStatus, token || undefined);
      await loadDashboardData(token || '');
      alert(`Booking ${bookingId} changed to ${newStatus}`);
    } catch (err: any) {
      alert(err.message || 'Failed to update booking status.');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Add Murti submit
  const handleAddMurtiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price) {
      alert('Name and Price are required.');
      return;
    }

    setActionLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('category', category);
      formData.append('size', size);
      formData.append('price', price);
      formData.append('bookingAmount', bookingAmount);
      formData.append('quantity', quantity);
      formData.append('description', description);

      if (photos) {
        for (let i = 0; i < photos.length; i++) {
          formData.append('photos', photos[i]);
        }
      }
      if (videos) {
        for (let i = 0; i < videos.length; i++) {
          formData.append('videos', videos[i]);
        }
      }

      await api.addMurti(formData, token || undefined);
      
      // Reset Form
      setName('');
      setPrice('');
      setBookingAmount('1000');
      setQuantity('1');
      setDescription('');
      setPhotos(null);
      setVideos(null);
      setShowAddModal(false);
      
      await loadDashboardData(token || '');
      alert('Murti registered successfully.');
    } catch (err: any) {
      alert(err.message || 'Failed to create murti.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-36 text-center text-gray-400 bg-festive-red-gradient">
        <Loader2 className="w-10 h-10 text-festive-yellow-500 animate-spin mx-auto mb-4" />
        <p className="font-serif font-bold text-festive-yellow-500">Loading Dashboard Workspace...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 bg-festive-red-gradient">
      
      {/* Header controls */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-10 pb-6 border-b border-festive-yellow-500/10">
        <div>
          <h1 className="text-3xl font-serif font-black text-gold-gradient">Admin Workspace</h1>
          <p className="text-xs text-gray-400 mt-1">Manage murtis, verify transactions, and review analytics</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-logo-blue-500 to-logo-blue-600 text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-lg hover:scale-105 active:scale-95 transition-transform glow-blue cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Murti
          </button>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2.5 border border-festive-red-500 bg-festive-red-500/10 hover:bg-festive-red-500/20 text-red-200 text-xs font-bold uppercase tracking-wider rounded-full transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </div>

      {/* Tabs list */}
      <div className="flex gap-4 border-b border-festive-yellow-500/15 mb-8 pb-2 overflow-x-auto whitespace-nowrap scrollbar-none">
        {[
          { id: 'analytics', label: '📊 Analytics Overview' },
          { id: 'inventory', label: '🗂️ Murti Catalog' },
          { id: 'bookings', label: '📜 Booking Ledger' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-4 px-2 text-sm font-bold tracking-wide uppercase transition-colors relative ${
              activeTab === tab.id 
                ? 'text-festive-yellow-500 font-black' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-logo-blue-500 to-festive-yellow-500" />
            )}
          </button>
        ))}
      </div>

      {/* Action Loader Alert Overlay */}
      {actionLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs">
          <div className="blinkit-card border border-festive-yellow-500/20 px-8 py-6 flex items-center gap-3">
            <Loader2 className="w-5 h-5 text-festive-yellow-500 animate-spin" />
            <span className="text-sm font-bold text-gray-200">Updating records, please wait...</span>
          </div>
        </div>
      )}

      {/* TAB 1: ANALYTICS OVERVIEW */}
      {activeTab === 'analytics' && analytics && (
        <div className="flex flex-col gap-10">
          
          {/* Card Grid - Super Rounded Blinkit Style */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="blinkit-card p-6 border border-festive-yellow-500/10">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-xs text-gray-400 uppercase font-bold">Total Revenue</span>
                  <h3 className="text-2xl font-black text-festive-yellow-500 font-serif mt-1">
                    ₹{analytics.stats.revenue.toLocaleString('en-IN')}
                  </h3>
                </div>
                <IndianRupee className="w-8 h-8 text-festive-yellow-500/30" />
              </div>
              <p className="text-[10px] text-gray-400 font-light">From active booking payments</p>
            </div>

            <div className="blinkit-card p-6 border border-festive-yellow-500/10">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-xs text-gray-400 uppercase font-bold">Pending Balance</span>
                  <h3 className="text-2xl font-black text-[#FFC107] font-serif mt-1">
                    ₹{analytics.stats.pendingPayments.toLocaleString('en-IN')}
                  </h3>
                </div>
                <TrendingUp className="w-8 h-8 text-[#FFC107]/30" />
              </div>
              <p className="text-[10px] text-gray-400 font-light">Balances due upon pickup</p>
            </div>

            <div className="blinkit-card p-6 border border-festive-yellow-500/10">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-xs text-gray-400 uppercase font-bold">Total Bookings</span>
                  <h3 className="text-2xl font-black text-logo-blue-500 mt-1">
                    {analytics.stats.totalBookings}
                  </h3>
                </div>
                <CheckCircle2 className="w-8 h-8 text-logo-blue-500/30" />
              </div>
              <p className="text-[10px] text-gray-400 font-light">Confirmed reservations</p>
            </div>

            <div className="blinkit-card p-6 border border-festive-yellow-500/10">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-xs text-gray-400 uppercase font-bold">Total Inventory</span>
                  <h3 className="text-2xl font-black text-gray-200 mt-1">
                    {analytics.stats.totalMurtis}
                  </h3>
                </div>
                <Layers className="w-8 h-8 text-gray-300/30" />
              </div>
              <p className="text-[10px] text-gray-400 font-light">Murtis currently registered</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Most Viewed list */}
            <div className="blinkit-card p-6 border border-festive-yellow-500/10">
              <h3 className="text-base font-serif font-black text-festive-yellow-500 mb-4 border-b border-festive-yellow-500/15 pb-3">
                🔥 Most Viewed Murtis
              </h3>
              <div className="flex flex-col gap-4">
                {analytics.mostViewed.map((m: any, idx: number) => (
                  <div key={m.code} className="flex justify-between items-center bg-[#1C0102] border border-festive-yellow-500/10 p-3.5 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono font-bold text-gray-500">#{idx+1}</span>
                      <div>
                        <h4 className="text-sm font-bold text-gray-100">{m.name}</h4>
                        <span className="text-[10px] text-gray-400 font-mono">{m.code} | {m.category}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                        m.status === 'Available' ? 'status-available' : 
                        m.status === 'Reserved' ? 'status-reserved' : 'status-sold'
                      }`}>
                        {m.status}
                      </span>
                      <span className="text-xs text-gray-300 font-bold flex items-center gap-1 font-mono">
                        <Eye className="w-3.5 h-3.5 text-logo-blue-500" /> {m.views}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Category distribution */}
            <div className="blinkit-card p-6 border border-festive-yellow-500/10">
              <h3 className="text-base font-serif font-black text-festive-yellow-500 mb-4 border-b border-festive-yellow-500/15 pb-3">
                🎨 Category Catalog Distribution
              </h3>
              <div className="flex flex-col gap-4.5 mt-2">
                {Object.entries(analytics.categoryStats).map(([cat, count]: [string, any]) => {
                  const percentage = Math.round((count / analytics.stats.totalMurtis) * 100);
                  return (
                    <div key={cat} className="flex flex-col gap-1.5">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-gray-300">{cat}</span>
                        <span className="text-festive-yellow-500">{count} Items ({percentage}%)</span>
                      </div>
                      <div className="w-full bg-[#1C0102] h-2.5 rounded-full overflow-hidden border border-festive-yellow-500/10">
                        <div 
                          className="bg-gradient-to-r from-logo-blue-500 to-festive-yellow-500 h-full rounded-full" 
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: INVENTORY CATALOG */}
      {activeTab === 'inventory' && (
        <div className="blinkit-card border border-festive-yellow-500/10 overflow-hidden">
          <div className="p-4 bg-festive-yellow-500/[0.03] border-b border-festive-yellow-500/15 flex justify-between items-center text-xs">
            <span className="font-bold text-gray-300 uppercase tracking-wider">Catalog Inventory ({murtis.length} items)</span>
            <span className="text-gray-400 font-bold font-mono">ONE MURTI = ONE CODE</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-festive-yellow-500/15 text-xs font-bold text-gray-400 bg-[#1C0102]/60">
                  <th className="p-4">Code</th>
                  <th className="p-4">Murti Name</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Height</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Qty</th>
                  <th className="p-4">Views</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-festive-yellow-500/10 text-sm">
                {murtis.map((m) => (
                  <tr key={m.code} className="hover:bg-festive-yellow-500/[0.02] transition-colors">
                    <td className="p-4 font-mono text-xs font-bold text-logo-blue-500">{m.code}</td>
                    <td className="p-4 font-bold">{m.name}</td>
                    <td className="p-4 text-xs text-gray-300">{m.category}</td>
                    <td className="p-4 text-xs">{m.size}</td>
                    <td className="p-4 font-black font-serif text-[#FFC107]">₹{m.price.toLocaleString('en-IN')}</td>
                    <td className="p-4 text-xs font-mono">{m.quantity !== undefined ? m.quantity : 1}</td>
                    <td className="p-4 text-xs font-mono">{m.views}</td>
                    <td className="p-4">
                      <select
                        value={m.status}
                        onChange={(e) => handleMurtiStatusChange(m.code, e.target.value)}
                        className={`text-xs font-bold px-2.5 py-1.5 rounded-xl border bg-[#1C0102] outline-none cursor-pointer text-white border-festive-yellow-500/20`}
                      >
                        <option value="Available">🟢 Available</option>
                        <option value="Reserved">🟡 Reserved</option>
                        <option value="Sold">🔴 Sold</option>
                        <option value="Out Of Stock">❌ Out Of Stock</option>
                      </select>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleDeleteMurti(m.code)}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors inline-block"
                        title="Delete Murti"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: BOOKINGS LEDGER */}
      {activeTab === 'bookings' && (
        <div className="blinkit-card border border-festive-yellow-500/10 overflow-hidden">
          <div className="p-4 bg-festive-yellow-500/[0.03] border-b border-festive-yellow-500/15 flex justify-between items-center text-xs">
            <span className="font-bold text-gray-300 uppercase tracking-wider">Active Bookings ({bookings.length} logs)</span>
            <span className="text-gray-400 font-bold flex items-center gap-1 font-mono">
              <FileSpreadsheet className="w-3.5 h-3.5 text-logo-blue-500" /> STATUS SYNCHRONIZED
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-festive-yellow-500/15 text-xs font-bold text-gray-400 bg-[#1C0102]/60">
                  <th className="p-4">Booking ID</th>
                  <th className="p-4">Customer Details</th>
                  <th className="p-4">Murti Code</th>
                  <th className="p-4">Deposit Paid</th>
                  <th className="p-4">Remaining Balance</th>
                  <th className="p-4">Pickup Date</th>
                  <th className="p-4">Delivery Mode</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-festive-yellow-500/10 text-sm">
                {bookings.map((b) => (
                  <tr key={b.bookingId} className="hover:bg-festive-yellow-500/[0.02] transition-colors">
                    <td className="p-4 font-mono text-xs font-bold text-logo-blue-500">{b.bookingId}</td>
                    <td className="p-4">
                      <div>
                        <div className="font-bold text-gray-100">{b.customerName}</div>
                        <div className="text-[11px] text-gray-400 font-mono mt-0.5">{b.customerPhone} | {b.customerCity}</div>
                      </div>
                    </td>
                    <td className="p-4 font-mono text-xs text-gray-300">{b.murtiCode}</td>
                    <td className="p-4 font-black text-logo-blue-500 font-serif">₹{b.amountPaid.toLocaleString('en-IN')}</td>
                    <td className="p-4 font-black text-festive-yellow-500 font-serif">₹{b.remainingAmount.toLocaleString('en-IN')}</td>
                    <td className="p-4 text-xs font-mono text-gray-300">
                      {new Date(b.shippingDate).toLocaleDateString('en-IN', {
                        day: '2-digit', month: 'short', year: 'numeric'
                      })}
                    </td>
                    <td className="p-4">
                      <span className="text-[10px] px-2.5 py-1 rounded-full border border-festive-yellow-500/20 bg-festive-yellow-500/5 text-gray-200">
                        {b.shippingType}
                      </span>
                    </td>
                    <td className="p-4">
                      <select
                        value={b.status}
                        onChange={(e) => handleBookingStatusChange(b.bookingId, e.target.value)}
                        className={`text-xs font-bold px-2 py-1.5 rounded-xl border bg-[#1C0102] outline-none cursor-pointer border-festive-yellow-500/20 text-white`}
                      >
                        <option value="Pending">🟡 Pending</option>
                        <option value="Confirmed">🟢 Confirmed</option>
                        <option value="Completed">🔵 Completed</option>
                        <option value="Cancelled">❌ Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADD MURTI MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
          <div className="blinkit-card w-full max-w-2xl rounded-[32px] p-8 border border-festive-yellow-500/20 relative max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-festive-yellow-500/15 pb-4 mb-6">
              <h3 className="text-xl font-serif font-black text-festive-yellow-500">Register New Murti</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-white text-lg font-bold">✕</button>
            </div>

            <form onSubmit={handleAddMurtiSubmit} className="flex flex-col gap-5 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Murti Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Royal Blue Ganpati"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 bg-[#1C0102] border border-festive-yellow-500/20 focus:border-festive-yellow-500/50 rounded-xl outline-none text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Category Theme</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-3 bg-[#1C0102] border border-festive-yellow-500/20 focus:border-festive-yellow-500/50 rounded-xl outline-none text-white cursor-pointer"
                  >
                    <option value="Ganpati">Ganpati</option>
                    <option value="Navratri">Navratri</option>
                    <option value="Krishna Theme">Krishna Theme</option>
                    <option value="Mavla Theme">Mavla Theme</option>
                    <option value="Royal Theme">Royal Theme</option>
                    <option value="Narasimha Theme">Narasimha Theme</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Height / Size</label>
                  <select
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    className="w-full px-4 py-3 bg-[#1C0102] border border-festive-yellow-500/20 focus:border-festive-yellow-500/50 rounded-xl outline-none text-white cursor-pointer"
                  >
                    <option value="2.5 Ft">2.5 Ft</option>
                    <option value="3.0 Ft">3.0 Ft</option>
                    <option value="3.5 Ft">3.5 Ft</option>
                    <option value="4.0 Ft">4.0 Ft</option>
                    <option value="4.5 Ft">4.5 Ft</option>
                    <option value="5.0 Ft">5.0 Ft</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Sale Price (₹)</label>
                  <input
                    type="number"
                    required
                    placeholder="15000"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-4 py-3 bg-[#1C0102] border border-festive-yellow-500/20 focus:border-festive-yellow-500/50 rounded-xl outline-none text-festive-yellow-500 font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Booking Deposit (₹)</label>
                  <input
                    type="number"
                    required
                    placeholder="1000"
                    value={bookingAmount}
                    onChange={(e) => setBookingAmount(e.target.value)}
                    className="w-full px-4 py-3 bg-[#1C0102] border border-festive-yellow-500/20 focus:border-festive-yellow-500/50 rounded-xl outline-none text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Qty Available</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full px-4 py-3 bg-[#1C0102] border border-festive-yellow-500/20 focus:border-festive-yellow-500/50 rounded-xl outline-none text-white font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Description</label>
                <textarea
                  rows={3}
                  placeholder="Describe hand-paint details, posture, elements..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 bg-[#1C0102] border border-festive-yellow-500/20 focus:border-festive-yellow-500/50 rounded-xl outline-none text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Murti Photos (Multi)</label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => setPhotos(e.target.files)}
                    className="w-full text-xs text-gray-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[#FFC107]/10 file:text-[#FFC107] hover:file:bg-[#FFC107]/20"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Videos</label>
                  <input
                    type="file"
                    multiple
                    accept="video/*"
                    onChange={(e) => setVideos(e.target.files)}
                    className="w-full text-xs text-gray-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[#FFC107]/10 file:text-[#FFC107] hover:file:bg-[#FFC107]/20"
                  />
                </div>
              </div>

              <div className="flex gap-4 mt-4 border-t border-festive-yellow-500/10 pt-6">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="w-1/3 py-3 border border-festive-yellow-500/20 text-gray-300 rounded-full font-bold uppercase tracking-wider text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-3 bg-gradient-to-r from-logo-blue-500 to-logo-blue-600 text-white rounded-full font-bold uppercase tracking-wider text-xs hover:scale-102 active:scale-98 transition-transform glow-blue cursor-pointer"
                >
                  Register Murti
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
