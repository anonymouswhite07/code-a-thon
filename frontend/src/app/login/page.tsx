'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Terminal, ArrowRight, Loader2, KeyRound, Mail, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { Mascot } from '@/components/mascot/Mascot';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = await api.auth.login({ email, password });
      if (data.role === 'ROLE_ADMIN' || data.role === 'ROLE_SUPER_ADMIN') {
        router.push('/admin');
      } else if (data.role === 'ROLE_JUDGE') {
        router.push('/judge');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (em: string, pw: string) => {
    setEmail(em);
    setPassword(pw);
  };

  return (
    <div className="min-h-screen bg-[#F7F4ED] flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-dot-pattern">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <Link href="/" className="inline-flex items-center gap-3">
          <div className="w-10 h-10 bg-[#3155FF] text-white rounded-lg brutal-border flex items-center justify-center font-black">
            <Terminal className="w-5 h-5" />
          </div>
          <span className="font-display text-2xl font-black tracking-tight text-[#171717]">
            CODE A-THON &apos;26
          </span>
        </Link>
        <h2 className="text-3xl font-black font-display text-[#171717]">
          SIGN IN TO ARENA
        </h2>
        <p className="text-xs font-bold text-[#FF6B35] uppercase tracking-wider">
          Gnanamani College of Technology
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-2xl brutal-border brutal-shadow-lg space-y-6">
          {error && (
            <div className="p-3.5 bg-red-50 border-2 border-red-400 rounded-xl flex items-start gap-2.5 text-xs text-red-800 font-bold">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono font-bold text-[#171717] uppercase mb-1">
                College / Registered Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@gct.ac.in"
                  className="w-full pl-9 pr-3 py-2.5 bg-white brutal-border rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#3155FF]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-[#171717] uppercase mb-1">
                Password
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 bg-white brutal-border rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#3155FF]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#FF6B35] text-white font-black text-sm uppercase tracking-wider rounded-xl brutal-border brutal-shadow-sm brutal-shadow-hover flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Verifying Credentials...
                </>
              ) : (
                <>
                  Enter Competition Arena <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Logins for Fast Review */}
          <div className="pt-4 border-t-2 border-[#171717]/10 space-y-2">
            <div className="text-[11px] font-mono font-bold text-gray-500 uppercase text-center">
              Quick One-Click Demo Logins:
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('karthik@gct.ac.in', 'Karthik@2026')}
                className="py-1.5 px-2 bg-[#F7F4ED] text-[#171717] rounded brutal-border text-[11px] font-mono font-bold hover:bg-[#3155FF] hover:text-white transition-colors"
              >
                Participant
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@gct.ac.in', 'Admin@2026')}
                className="py-1.5 px-2 bg-[#171717] text-white rounded brutal-border text-[11px] font-mono font-bold hover:bg-[#FF6B35] transition-colors"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('judge@gct.ac.in', 'Judge@2026')}
                className="py-1.5 px-2 bg-[#B8E63E] text-[#171717] rounded brutal-border text-[11px] font-mono font-bold hover:bg-[#FFD84D] transition-colors"
              >
                Judge
              </button>
            </div>
          </div>

          <div className="text-center text-xs text-gray-600 font-medium pt-2">
            Not registered yet?{' '}
            <Link href="/register" className="font-bold text-[#3155FF] underline">
              Register here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
