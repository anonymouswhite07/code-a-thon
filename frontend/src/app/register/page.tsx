'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Terminal, ArrowRight, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { api } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    college: 'Gnanamani College of Technology',
    department: 'Computer Science & Engineering',
    year: '3rd Year',
    programmingExp: 'Intermediate'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await api.auth.register(formData);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F4ED] flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-dot-pattern">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center space-y-3">
        <Link href="/" className="inline-flex items-center gap-3">
          <div className="w-10 h-10 bg-[#FF6B35] text-white rounded-lg brutal-border flex items-center justify-center font-black">
            <Terminal className="w-5 h-5" />
          </div>
          <span className="font-display text-2xl font-black tracking-tight text-[#171717]">
            CODE A-THON &apos;26
          </span>
        </Link>
        <h2 className="text-3xl font-black font-display text-[#171717]">
          PARTICIPANT REGISTRATION
        </h2>
        <p className="text-xs font-bold text-[#3155FF] uppercase tracking-wider">
          Gnanamani College of Technology
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl px-4">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-2xl brutal-border brutal-shadow-lg space-y-6">
          {error && (
            <div className="p-3.5 bg-red-50 border-2 border-red-400 rounded-xl flex items-start gap-2.5 text-xs text-red-800 font-bold">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono font-bold text-[#171717] uppercase mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="e.g. Karthikeyan S"
                  className="w-full px-3 py-2.5 bg-white brutal-border rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#3155FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-[#171717] uppercase mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="student@gct.ac.in"
                  className="w-full px-3 py-2.5 bg-white brutal-border rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#3155FF]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono font-bold text-[#171717] uppercase mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="At least 6 characters"
                  className="w-full px-3 py-2.5 bg-white brutal-border rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#3155FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-[#171717] uppercase mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="9876543210"
                  className="w-full px-3 py-2.5 bg-white brutal-border rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#3155FF]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-[#171717] uppercase mb-1">
                College / Institution *
              </label>
              <input
                type="text"
                required
                name="college"
                value={formData.college}
                onChange={handleChange}
                className="w-full px-3 py-2.5 bg-white brutal-border rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#3155FF]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-mono font-bold text-[#171717] uppercase mb-1">
                  Department *
                </label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 bg-white brutal-border rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#3155FF]"
                >
                  <option>Computer Science & Engineering</option>
                  <option>Information Technology</option>
                  <option>Artificial Intelligence & Data Science</option>
                  <option>Electronics & Communication</option>
                  <option>Mechanical Engineering</option>
                  <option>Other Department</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-[#171717] uppercase mb-1">
                  Academic Year *
                </label>
                <select
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 bg-white brutal-border rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#3155FF]"
                >
                  <option>1st Year</option>
                  <option>2nd Year</option>
                  <option>3rd Year</option>
                  <option>Final Year</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono font-bold text-[#171717] uppercase mb-1">
                  Skill Level *
                </label>
                <select
                  name="programmingExp"
                  value={formData.programmingExp}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 bg-white brutal-border rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#3155FF]"
                >
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#3155FF] text-white font-black text-sm uppercase tracking-wider rounded-xl brutal-border brutal-shadow-sm brutal-shadow-hover flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Registering Participant...
                </>
              ) : (
                <>
                  Complete Registration & Enter Arena <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center text-xs text-gray-600 font-medium pt-2">
            Already have an account?{' '}
            <Link href="/login" className="font-bold text-[#FF6B35] underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
