'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/utils/api';
import { Lock, Mail, ShieldAlert, KeyRound } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();

  const [step, setStep] = useState(1); // 1 = Credentials, 2 = OTP
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [devOtpMsg, setDevOtpMsg] = useState(''); // helper to show OTP on screen in dev/sandbox mode

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setError('');
    setDevOtpMsg('');
    
    try {
      const res = await api.adminLogin(email, password);
      setStep(2);
      if (res.devOtp) {
        setDevOtpMsg(res.devOtp);
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) return;

    setLoading(true);
    setError('');

    try {
      const res = await api.verifyAdminOtp(email, otp);
      if (res.token) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('admin_token', res.token);
        }
        router.push('/admin/dashboard');
      } else {
        setError('Verification failed. No token returned.');
      }
    } catch (err: any) {
      setError(err.message || 'Incorrect OTP code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-24 flex flex-col justify-center min-h-[calc(100vh-20rem)] bg-festive-red-gradient">
      {/* Decorative Brand */}
      <div className="text-center mb-8">
        <div className="inline-flex w-16 h-16 items-center justify-center bg-[#FFC107]/10 border border-[#FFC107]/35 rounded-full mb-4 shadow-lg text-[#FFC107] text-2xl">
          🔒
        </div>
        <h1 className="text-2xl font-serif font-black text-gold-gradient tracking-wider">ADMIN PORTAL</h1>
        <p className="text-xs text-gray-400 mt-1">Shree Siddhivinayak Arts Inventory Workspace</p>
      </div>

      <div className="blinkit-card p-8 relative overflow-hidden">
        {/* Glow behind */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-logo-blue-500/10 rounded-full blur-xl pointer-events-none" />

        {error && (
          <div className="mb-6 p-4 bg-festive-red-500/15 border border-festive-red-500/25 rounded-xl text-red-200 text-xs flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-logo-blue-500" />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: CREDENTIALS */}
        {step === 1 && (
          <form onSubmit={handleCredentialsSubmit} className="flex flex-col gap-5">
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Admin Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="email"
                  required
                  placeholder="admin@siddhivinayak.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-[#1C0102] border border-festive-yellow-500/20 focus:border-festive-yellow-500/50 rounded-xl text-sm outline-none text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-[#1C0102] border border-festive-yellow-500/20 focus:border-festive-yellow-500/50 rounded-xl text-sm outline-none text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-logo-blue-500 to-logo-blue-600 text-white rounded-full font-bold uppercase tracking-wider text-xs hover:scale-102 active:scale-98 transition-transform disabled:opacity-50 mt-4 shadow-md glow-blue"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>
        )}

        {/* STEP 2: OTP VERIFICATION */}
        {step === 2 && (
          <form onSubmit={handleOtpSubmit} className="flex flex-col gap-5">
            <div className="text-center mb-2">
              <p className="text-xs text-gray-300 font-light">
                We've generated a 6-digit verification code. Please inspect the backend console or use the helper box.
              </p>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2 text-center">Enter 6-Digit OTP</label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  maxLength={6}
                  required
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-[#1C0102] border border-festive-yellow-500/25 focus:border-festive-yellow-500/50 rounded-xl text-center text-lg tracking-[0.4em] font-mono outline-none text-white font-bold"
                />
              </div>
            </div>

            {/* Development Mode Visual Helper */}
            {devOtpMsg && (
              <div className="p-3.5 bg-logo-blue-500/10 border border-logo-blue-500/30 rounded-xl text-center text-xs text-logo-blue-100 font-semibold uppercase tracking-wider">
                🔑 Sandboxed OTP Helper: <span className="font-mono underline text-sm text-[#FFC107] font-bold">{devOtpMsg}</span>
              </div>
            )}

            <div className="flex gap-4 mt-4">
              <button
                type="button"
                onClick={() => { setStep(1); setOtp(''); }}
                className="w-1/3 py-3 border border-festive-yellow-500/20 text-gray-300 hover:text-white rounded-full text-xs font-bold uppercase tracking-wide"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-2/3 py-3 bg-gradient-to-r from-[#FFC107] to-[#FFB300] text-black rounded-full font-bold uppercase tracking-wider text-xs hover:scale-102 active:scale-98 transition-transform disabled:opacity-50 shadow-md glow-yellow"
              >
                {loading ? 'Verifying...' : 'Verify Admin'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-8 text-center text-xs text-gray-400 blinkit-card p-5 border border-festive-yellow-500/5">
        <p className="font-bold text-festive-yellow-500">💡 Local Sandbox Mode Access</p>
        <p className="mt-1 font-mono text-gray-300 text-[11px]">User ID: admin@siddhivinayak.com | Password: admin123</p>
        <p className="mt-1 text-[10px] text-gray-500">(OTP code is visual helper or prints to backend terminal console)</p>
      </div>
    </div>
  );
}
