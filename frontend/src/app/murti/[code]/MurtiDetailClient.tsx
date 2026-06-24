'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api, Murti } from '@/utils/api';
import { ArrowLeft, Shield, Truck, Calendar, Sparkles, MessageCircle, AlertTriangle, Printer, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function MurtiDetailPage() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;

  const [murti, setMurti] = useState<Murti | null>(null);
  const [loading, setLoading] = useState(true);
  const [activePhoto, setActivePhoto] = useState(0);
  const [rotationAngle, setRotationAngle] = useState(0); // For 360 simulator
  
  // Booking Modal State
  const [showModal, setShowModal] = useState(false);
  const [bookingStep, setBookingStep] = useState(1); // 1 = Details, 2 = Payment Simulation
  const [submittingBooking, setSubmittingBooking] = useState(false);
  
  // Form Fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [shippingType, setShippingType] = useState<'Self Pickup' | 'Transport Booking'>('Self Pickup');
  const [shippingDate, setShippingDate] = useState('');
  
  // Booking response
  const [initiatedBooking, setInitiatedBooking] = useState<any>(null);
  
  // Confirmed booking receipt
  const [confirmedBookingReceipt, setConfirmedBookingReceipt] = useState<any>(null);

  useEffect(() => {
    async function loadMurti() {
      setLoading(true);
      try {
        const data = await api.getMurti(code);
        setMurti(data);
      } catch (err) {
        console.error('Error fetching murti details:', err);
      } finally {
        setLoading(false);
      }
    }
    if (code) {
      loadMurti();
    }
  }, [code]);

  // Lock body scroll when modal or receipt is open
  useEffect(() => {
    if (showModal || confirmedBookingReceipt) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showModal, confirmedBookingReceipt]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-gray-400 bg-festive-red-gradient">
        <span className="text-xl block mb-4 animate-spin font-serif text-festive-yellow-500">🕉️</span>
        Loading details for Murti {code}...
      </div>
    );
  }

  if (!murti) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center bg-festive-red-gradient">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-serif font-bold text-festive-yellow-500">Murti Not Found</h2>
        <p className="text-gray-300 mt-2 mb-6">The requested Murti code could not be resolved.</p>
        <Link href="/collection" className="px-6 py-3 rounded-full text-xs font-semibold uppercase tracking-wider text-black bg-gradient-to-r from-[#FFC107] to-[#FFB300]">
          Return to Collection
        </Link>
      </div>
    );
  }

  const whatsappUrl = `https://wa.me/919876543210?text=Hi%20Shree%20Siddhivinayak%20Arts,%20I'm%20interested%20in%20inquiring%20about%20your%20Murti%20${encodeURIComponent(murti.name)}%20(Code:%20${murti.code}).%20Is%20it%20available%20for%20booking?`;

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !city || !shippingDate) {
      alert('Please fill out all fields.');
      return;
    }
    
    setSubmittingBooking(true);
    try {
      const res = await api.createBooking({
        customerName: name,
        customerPhone: phone,
        customerCity: city,
        shippingType,
        shippingDate,
        murtiCode: murti.code
      });

      setInitiatedBooking(res);
      
      if (res.useMock) {
        setBookingStep(2);
      } else {
        const rpayKey = res.razorpayKeyId;
        const options = {
          key: rpayKey,
          amount: res.amount,
          currency: res.currency,
          name: "Shree Siddhivinayak Arts",
          description: `Booking for ${murti.name} (${murti.code})`,
          order_id: res.orderId,
          handler: async function (response: any) {
            setSubmittingBooking(true);
            try {
              const verifyRes = await api.verifyPayment({
                bookingId: res.bookingId,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              });
              if (verifyRes.success) {
                const receipt = {
                  bookingId: res.bookingId,
                  customerName: name,
                  customerPhone: phone,
                  customerCity: city,
                  shippingType,
                  shippingDate,
                  murtiCode: murti.code,
                  murtiName: murti.name,
                  murtiSize: murti.size,
                  price: murti.price,
                  amountPaid: murti.bookingAmount,
                  remainingAmount: murti.price - murti.bookingAmount,
                  date: new Date().toLocaleString('en-IN')
                };
                setConfirmedBookingReceipt(receipt);
                setShowModal(false);
              } else {
                alert('Payment verification failed.');
              }
            } catch (err: any) {
              alert(err.message || 'Payment verification error.');
            } finally {
              setSubmittingBooking(false);
            }
          },
          prefill: {
            name: name,
            contact: phone
          },
          theme: {
            color: "#FFC107"
          }
        };

        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => {
          const rzp = new (window as any).Razorpay(options);
          rzp.open();
        };
        document.body.appendChild(script);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to initiate booking.');
    } finally {
      setSubmittingBooking(false);
    }
  };

  const handleSimulatedPayment = async (success: boolean) => {
    setSubmittingBooking(true);
    try {
      const verifyRes = await api.verifyPayment({
        bookingId: initiatedBooking.bookingId,
        simulatedSuccess: success
      });

      if (verifyRes.success && success) {
        const receipt = {
          bookingId: initiatedBooking.bookingId,
          customerName: name,
          customerPhone: phone,
          customerCity: city,
          shippingType,
          shippingDate,
          murtiCode: murti.code,
          murtiName: murti.name,
          murtiSize: murti.size,
          price: murti.price,
          amountPaid: murti.bookingAmount,
          remainingAmount: murti.price - murti.bookingAmount,
          date: new Date().toLocaleString('en-IN')
        };
        setConfirmedBookingReceipt(receipt);
        setShowModal(false);
      } else {
        alert('Payment verification cancelled.');
      }
    } catch (err: any) {
      alert(err.message || 'Payment processing error.');
    } finally {
      setSubmittingBooking(false);
      setBookingStep(1);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-festive-red-gradient">
      {/* Back Button */}
      <Link href="/collection" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-festive-yellow-500 mb-8 transition-colors font-bold uppercase tracking-wider">
        <ArrowLeft className="w-4 h-4" /> Back to Collection
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* LEFT COLUMN: INTERACTIVE VISUALS */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Main Photo Viewport */}
          <div className="relative h-[480px] w-full rounded-[32px] overflow-hidden bg-black/30 border border-festive-yellow-500/15 flex items-center justify-center perspective-container shadow-2xl">
            <img 
              src={murti.photos[activePhoto] || 'https://images.unsplash.com/photo-1609252509102-ee7026b2161f?w=800&auto=format&fit=crop'} 
              alt={murti.name} 
              style={{ transform: `rotateY(${rotationAngle}deg) scale(1.05)` }}
              className="object-contain w-full h-full transition-transform duration-100 ease-out"
            />
            {/* Watermark Logo */}
            <div className="absolute top-4 left-4 z-10 opacity-70 pointer-events-none">
              <img 
                src={`${api.basePath || ''}/images/logo-white.png`} 
                alt="Watermark Logo" 
                className="w-16 h-16 object-contain"
              />
            </div>
            {/* Status Overlays */}
            <div className="absolute top-4 right-4 z-10">
              <span className={`px-4 py-2 rounded-full text-xs font-extrabold uppercase tracking-wider ${
                murti.status === 'Available' ? 'status-available shadow-md' : 
                murti.status === 'Reserved' ? 'status-reserved shadow-md' : 'status-sold shadow-md'
              }`}>
                {murti.status === 'Available' ? 'Available' : 
                 murti.status === 'Reserved' ? 'Reserved' : 'Sold Out'}
              </span>
            </div>
            
            {/* 360 Indicator */}
            <div className="absolute bottom-4 left-4 bg-[#1C0102]/85 border border-festive-yellow-500/25 px-4 py-2 rounded-full text-xs text-festive-yellow-500 font-bold tracking-wider uppercase">
              360° Profile View
            </div>
          </div>

          {/* 360 Degree Perspective Simulator Slider */}
          <div className="blinkit-card p-5 rounded-[24px] border border-festive-yellow-500/10">
            <div className="flex justify-between text-xs text-gray-300 mb-3 font-bold uppercase tracking-wider">
              <span>◄ Left Angle</span>
              <span className="text-festive-yellow-500">Rotate View Slider</span>
              <span>Right Angle ►</span>
            </div>
            <input 
              type="range" 
              min="-45" 
              max="45" 
              value={rotationAngle}
              onChange={(e) => setRotationAngle(Number(e.target.value))}
              className="w-full h-1.5 bg-red-950/60 rounded-full appearance-none cursor-pointer accent-logo-blue-500"
            />
          </div>

          {/* Photo Carousel Thumbnails */}
          <div className="flex gap-4 overflow-x-auto pb-2">
            {murti.photos.map((p, idx) => (
              <button
                key={idx}
                onClick={() => { setActivePhoto(idx); setRotationAngle(0); }}
                className={`w-24 h-20 rounded-[18px] overflow-hidden border-2 shrink-0 transition-all ${
                  activePhoto === idx ? 'border-logo-blue-500 shadow-lg scale-95' : 'border-festive-yellow-500/10 hover:border-festive-yellow-500/30'
                }`}
              >
                <img src={p} alt="" className="object-cover w-full h-full" />
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN: SPECS & BUYING FLOW */}
        <div className="lg:col-span-5 flex flex-col gap-6 justify-between">
          <div className="blinkit-card p-8 rounded-[32px]">
            {/* Header Details */}
            <div className="border-b border-festive-yellow-500/10 pb-6 mb-6">
              <span className="text-xs font-black text-logo-blue-500 uppercase tracking-widest block mb-1">
                {murti.category} Theme
              </span>
              <h1 className="text-3xl font-bold font-serif tracking-wide mb-2 text-white">{murti.name}</h1>
              <p className="text-xs font-mono text-gray-400 tracking-wider">CODE: {murti.code}</p>
            </div>

            {/* Price Cards & Heights */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-[#1C0102]/60 p-4 rounded-2xl border border-festive-yellow-500/10">
                <span className="text-xs text-gray-400 block mb-1 font-bold uppercase tracking-wider">Height</span>
                <span className="text-lg font-bold text-gray-100">{murti.size}</span>
              </div>
              <div className="bg-[#1C0102]/60 p-4 rounded-2xl border border-festive-yellow-500/10">
                <span className="text-xs text-gray-400 block mb-1 font-bold uppercase tracking-wider">Price</span>
                <span className="text-xl font-black text-festive-yellow-500 font-serif">₹{murti.price.toLocaleString('en-IN')}</span>
              </div>
              <div className="bg-[#1C0102]/60 p-4 rounded-2xl border border-festive-yellow-500/10 col-span-2 sm:col-span-1">
                <span className="text-xs text-gray-400 block mb-1 font-bold uppercase tracking-wider">Available Qty</span>
                <span className={`text-lg font-extrabold ${(murti.quantity || 0) > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {murti.quantity !== undefined ? murti.quantity : 1}
                </span>
              </div>
            </div>

            {/* Booking Payment Indicator */}
            <div className="bg-[#FFC107]/5 border border-festive-yellow-500/20 p-5 rounded-2xl mb-6 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-festive-yellow-500 shrink-0 mt-0.5 animate-pulse" />
              <div>
                <h4 className="text-sm font-black text-festive-yellow-500">Booking Amount: ₹{murti.bookingAmount.toLocaleString('en-IN')}</h4>
                <p className="text-xs text-gray-300 mt-1">Pay only the booking amount now to lock your order. Pay the remaining ₹{(murti.price - murti.bookingAmount).toLocaleString('en-IN')} at pickup or before delivery.</p>
              </div>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h3 className="text-xs font-bold uppercase text-gray-400 tracking-wider block mb-2">Artisan Description</h3>
              <p className="text-sm text-gray-300 font-light leading-relaxed">
                {murti.description || 'Fully hand-sculpted using traditional eco-friendly Shaddoo clay. Intricately colored with natural dyes. Crafted with attention to detail by veteran artisans.'}
              </p>
            </div>

            {/* Buttons Flow */}
            <div className="flex flex-col gap-4">
              {murti.status === 'Available' && (murti.quantity !== undefined ? murti.quantity : 1) > 0 ? (
                <button
                  onClick={() => setShowModal(true)}
                  className="w-full py-4 rounded-full text-sm font-extrabold uppercase tracking-wider text-black bg-gradient-to-r from-[#FFC107] to-[#FFB300] hover:scale-102 active:scale-98 transition-transform duration-200 shadow-lg shadow-festive-yellow-500/20 text-center cursor-pointer"
                >
                  Book This Murti (Pay ₹{murti.bookingAmount})
                </button>
              ) : (
                <div className="w-full py-4 bg-gray-800 border border-gray-700/50 rounded-full text-center text-sm font-bold text-gray-500 uppercase tracking-wider cursor-not-allowed">
                  {murti.status === 'Reserved' ? 'Reserved' : 'Sold Out'}
                </div>
              )}

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 rounded-full text-sm font-bold uppercase tracking-wider text-white border border-logo-blue-500 bg-logo-blue-500/10 hover:bg-logo-blue-500/20 hover:scale-102 active:scale-98 transition-transform duration-200 flex items-center justify-center gap-2.5"
              >
                <MessageCircle className="w-5 h-5 text-logo-blue-500" /> WhatsApp Enquiry
              </a>
            </div>
          </div>

          {/* Quick trust metrics */}
          <div className="grid grid-cols-2 gap-4 text-xs text-gray-400">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-festive-yellow-500 shrink-0" />
              <span>Anti-Duplicate Locked</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-logo-blue-500 shrink-0" />
              <span>India-Wide Transport</span>
            </div>
          </div>
        </div>
      </div>

      {/* BOOKING FLOW MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
          <div className="blinkit-card w-full max-w-xl rounded-[32px] p-6 sm:p-8 border border-festive-yellow-500/20 relative animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
            
            {/* Header */}
            <div className="flex justify-between items-start border-b border-festive-yellow-500/15 pb-4 mb-6">
              <div>
                <h3 className="text-xl font-serif font-black text-festive-yellow-500">Booking Portal</h3>
                <p className="text-xs text-gray-300 mt-1">Securing Code: {murti.code}</p>
              </div>
              <button 
                onClick={() => { setShowModal(false); setBookingStep(1); }}
                className="text-gray-400 hover:text-white text-lg font-bold"
                disabled={submittingBooking}
              >
                ✕
              </button>
            </div>

            {/* STEP 1: CUSTOMER DETAILS FORM */}
            {bookingStep === 1 && (
              <form onSubmit={handleBookingSubmit} className="flex flex-col gap-5 text-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Customer Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Enter Full Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 bg-[#1C0102] border border-festive-yellow-500/20 focus:border-festive-yellow-500/50 rounded-xl text-sm outline-none text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Phone Number</label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 9876543210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-3 bg-[#1C0102] border border-festive-yellow-500/20 focus:border-festive-yellow-500/50 rounded-xl text-sm outline-none text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">City</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter City name"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-4 py-3 bg-[#1C0102] border border-festive-yellow-500/20 focus:border-festive-yellow-500/50 rounded-xl text-sm outline-none text-white"
                  />
                </div>

                {/* Pickup / Shipping Options */}
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Pickup / Delivery Mode</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { type: 'Self Pickup', desc: 'Workshop collection' },
                      { type: 'Transport Booking', desc: 'Transit agency booking' }
                    ].map((mode) => (
                      <label 
                        key={mode.type} 
                        className={`flex flex-col p-3.5 rounded-xl border cursor-pointer select-none text-left transition-colors ${
                          shippingType === mode.type 
                            ? 'border-festive-yellow-500 bg-[#FFC107]/5' 
                            : 'border-festive-yellow-500/10 bg-transparent hover:border-festive-yellow-500/20'
                        }`}
                      >
                        <input
                          type="radio"
                          name="shipping"
                          checked={shippingType === mode.type}
                          onChange={() => setShippingType(mode.type as any)}
                          className="sr-only"
                        />
                        <span className="text-xs font-extrabold text-gray-200">{mode.type}</span>
                        <span className="text-[10px] text-gray-400 mt-0.5">{mode.desc}</span>
                      </label>
                    ))}
                  </div>
                  
                  {shippingType === 'Transport Booking' && (
                    <div className="mt-3 text-xs bg-[#FFC107]/5 border border-[#FFC107]/20 text-[#FFC107] p-3 rounded-xl flex items-center gap-2">
                      <Truck className="w-4 h-4 shrink-0 text-logo-blue-500" />
                      <span>Transport charges calculated separately & paid directly to transport.</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-[#FFC107]" />
                    Delivery / Pickup Date
                  </label>
                  <input
                    type="date"
                    required
                    value={shippingDate}
                    onChange={(e) => setShippingDate(e.target.value)}
                    className="w-full px-4 py-3 bg-[#1C0102] border border-festive-yellow-500/20 focus:border-festive-yellow-500/50 rounded-xl text-sm outline-none text-gray-300"
                  />
                </div>

                {/* Total breakdown */}
                <div className="bg-[#1C0102] border border-festive-yellow-500/15 p-4 rounded-xl text-xs flex justify-between items-center mt-3">
                  <div>
                    <span className="text-gray-400 block font-bold">Total Balance Due Later</span>
                    <span className="text-sm font-bold text-gray-100">₹{(murti.price - murti.bookingAmount).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-gray-400 block font-bold">Payable Deposit Now</span>
                    <span className="text-base font-black text-festive-yellow-500 font-serif">₹{murti.bookingAmount.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submittingBooking}
                  className="w-full py-3.5 bg-gradient-to-r from-logo-blue-500 to-logo-blue-600 text-white rounded-full font-bold uppercase tracking-wider text-xs hover:scale-102 active:scale-98 transition-transform disabled:opacity-50 mt-4 shadow-md glow-blue"
                >
                  {submittingBooking ? 'Connecting Gateway...' : 'Book & Checkout'}
                </button>
              </form>
            )}

            {/* STEP 2: PAYMENT GATEWAY SIMULATION */}
            {bookingStep === 2 && initiatedBooking && (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-[#FFC107]/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-[#FFC107]/30">
                  <Shield className="w-8 h-8 text-logo-blue-500" />
                </div>
                <h4 className="text-lg font-serif font-black text-festive-yellow-500 mb-2">Simulated Razorpay Sandbox</h4>
                <p className="text-sm text-gray-300 max-w-sm mx-auto mb-8 font-light">
                  A visual transaction mockup is running for <strong className="text-[#FFC107]">₹{initiatedBooking.amount.toLocaleString('en-IN')}</strong>.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => handleSimulatedPayment(false)}
                    disabled={submittingBooking}
                    className="px-6 py-3 border border-festive-red-500 bg-festive-red-500/10 hover:bg-festive-red-500/20 text-red-200 text-xs font-bold uppercase tracking-wider rounded-full transition-colors disabled:opacity-50"
                  >
                    Cancel Booking
                  </button>
                  <button
                    onClick={() => handleSimulatedPayment(true)}
                    disabled={submittingBooking}
                    className="px-8 py-3 bg-gradient-to-r from-[#FFC107] to-[#FFB300] text-black text-xs font-extrabold uppercase tracking-wider rounded-full hover:scale-105 active:scale-95 transition-transform disabled:opacity-50 shadow-md glow-yellow"
                  >
                    {submittingBooking ? 'Confirming...' : 'Simulate Success Payment'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CONFIRMED BOOKING RECEIPT MODAL */}
      {confirmedBookingReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 overflow-y-auto">
          <style>{`
            @media print {
              body * {
                visibility: hidden !important;
              }
              .print-receipt-modal, .print-receipt-modal * {
                visibility: visible !important;
              }
              .print-receipt-modal {
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                width: 100% !important;
                background: white !important;
                color: black !important;
                box-shadow: none !important;
                border: none !important;
                padding: 10px !important;
                margin: 0 !important;
              }
              .no-print {
                display: none !important;
              }
            }
          `}</style>
          
          <div className="print-receipt-modal bg-[#1C0102] border border-festive-yellow-500/20 w-full max-w-2xl rounded-[32px] p-6 sm:p-8 relative text-white shadow-2xl">
            {/* Header / Brand */}
            <div className="text-center pb-6 border-b border-festive-yellow-500/20 mb-6">
              <div className="flex justify-center items-center gap-2.5 mb-2">
                <img 
                  src={`${api.basePath || ''}/images/logo-red.png`} 
                  alt="Logo" 
                  className="w-12 h-12 object-contain"
                />
                <div>
                  <h2 className="text-xl sm:text-2xl font-serif font-black text-festive-yellow-500 tracking-wide uppercase">Shree Siddhivinayak Arts</h2>
                  <p className="text-[10px] sm:text-xs text-gray-400 font-bold tracking-widest uppercase">Premium Eco-Friendly Ganpati Murtis</p>
                </div>
              </div>
              <p className="text-xs text-gray-400">Workshop: Pen-Chinchoti Highway, Maharashtra | Contact: +91 98765 43210</p>
            </div>

            {/* Success Notification - Screen only */}
            <div className="no-print bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-2xl p-4 mb-6 flex items-center gap-3">
              <CheckCircle className="w-6 h-6 shrink-0" />
              <div>
                <h4 className="text-sm font-bold">Booking Confirmed Successfully!</h4>
                <p className="text-xs text-gray-300">Your deposit has been verified. The Murti has been reserved for you.</p>
              </div>
            </div>

            {/* Receipt Summary Grid */}
            <div className="bg-[#2C0001] border border-festive-yellow-500/15 rounded-2xl p-4 sm:p-6 mb-6">
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-festive-yellow-500/10">
                <h3 className="text-sm font-serif font-bold text-festive-yellow-500 uppercase tracking-wider">Transaction Invoice</h3>
                <span className="text-xs font-mono bg-festive-yellow-500/10 text-festive-yellow-500 px-3 py-1 rounded-full border border-festive-yellow-500/20">
                  ID: {confirmedBookingReceipt.bookingId}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-gray-300">
                {/* Left Column: Buyer Details */}
                <div className="flex flex-col gap-2.5">
                  <h4 className="font-extrabold uppercase text-gray-400 tracking-wider">Buyer Identification</h4>
                  <div>
                    <span className="text-gray-400 block">Name:</span>
                    <strong className="text-gray-100 text-sm">{confirmedBookingReceipt.customerName}</strong>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Phone:</span>
                    <strong className="text-gray-100 text-sm font-mono">{confirmedBookingReceipt.customerPhone}</strong>
                  </div>
                  <div>
                    <span className="text-gray-400 block">City / Address:</span>
                    <strong className="text-gray-100">{confirmedBookingReceipt.customerCity}</strong>
                  </div>
                </div>

                {/* Right Column: Order Details */}
                <div className="flex flex-col gap-2.5">
                  <h4 className="font-extrabold uppercase text-gray-400 tracking-wider">Order & Date</h4>
                  <div>
                    <span className="text-gray-400 block">Booking Date:</span>
                    <strong>{confirmedBookingReceipt.date}</strong>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Delivery / Pickup Mode:</span>
                    <strong className="bg-[#FFC107]/5 border border-festive-yellow-500/25 px-2 py-0.5 rounded text-[10px] text-gray-200 font-bold">
                      {confirmedBookingReceipt.shippingType}
                    </strong>
                  </div>
                  <div>
                    <span className="text-gray-400 block">Scheduled Date:</span>
                    <strong className="font-mono text-festive-yellow-500">
                      {new Date(confirmedBookingReceipt.shippingDate).toLocaleDateString('en-IN', {
                        day: '2-digit', month: 'short', year: 'numeric'
                      })}
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Itemized Table */}
            <div className="border border-festive-yellow-500/15 rounded-2xl overflow-hidden mb-6 text-xs">
              <div className="grid grid-cols-3 bg-[#2C0001] p-3 font-bold border-b border-festive-yellow-500/15 text-gray-400 uppercase tracking-wider">
                <span>Murti Details</span>
                <span className="text-center">Height</span>
                <span className="text-right">Price</span>
              </div>
              <div className="grid grid-cols-3 p-3.5 border-b border-festive-yellow-500/10">
                <div>
                  <strong className="text-gray-100 block">{confirmedBookingReceipt.murtiName}</strong>
                  <span className="text-[10px] text-gray-400 font-mono">Code: {confirmedBookingReceipt.murtiCode}</span>
                </div>
                <div className="text-center self-center text-gray-300">{confirmedBookingReceipt.murtiSize}</div>
                <div className="text-right self-center font-bold text-gray-100">₹{confirmedBookingReceipt.price.toLocaleString('en-IN')}</div>
              </div>
              <div className="bg-[#2C0001]/40 p-3.5 flex flex-col gap-2">
                <div className="flex justify-between">
                  <span className="text-gray-400 font-bold">Total Price</span>
                  <span className="text-gray-200 font-bold">₹{confirmedBookingReceipt.price.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-emerald-400 font-bold">Deposit Paid (Advance)</span>
                  <span className="text-emerald-400 font-bold">₹{confirmedBookingReceipt.amountPaid.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-festive-yellow-500/10 text-sm font-serif">
                  <span className="text-festive-yellow-500 font-black uppercase">Balance Due at Pickup</span>
                  <span className="text-festive-yellow-500 font-black">₹{confirmedBookingReceipt.remainingAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Terms and conditions */}
            <div className="text-[10px] text-gray-400 font-light leading-relaxed mb-8 flex flex-col gap-1 border-t border-festive-yellow-500/10 pt-4">
              <p>• Please display this digital/printed receipt or quote your Booking ID when collecting your Murti.</p>
              <p>• The booking deposit is non-refundable as it locks the artisan's calendar for this specific design.</p>
              <p>• Remaining balance must be cleared prior to delivery or at the time of workshop collection.</p>
            </div>

            {/* Action Buttons - Screen Only */}
            <div className="no-print flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => window.print()}
                className="w-full sm:w-1/2 py-3 bg-gradient-to-r from-logo-blue-500 to-logo-blue-600 text-white rounded-full font-bold uppercase tracking-wider text-xs hover:scale-102 active:scale-98 transition-transform flex items-center justify-center gap-2 shadow-md glow-blue cursor-pointer"
              >
                <Printer className="w-4 h-4" /> Print Booking Receipt
              </button>
              <button
                onClick={() => {
                  setConfirmedBookingReceipt(null);
                  router.push('/collection');
                }}
                className="w-full sm:w-1/2 py-3 bg-gradient-to-r from-[#FFC107] to-[#FFB300] text-black rounded-full font-black uppercase tracking-wider text-xs hover:scale-102 active:scale-98 transition-transform text-center cursor-pointer"
              >
                Continue to Catalog
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
