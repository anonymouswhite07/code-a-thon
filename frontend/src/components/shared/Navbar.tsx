'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Terminal, Menu, X, ArrowRight, User as UserIcon, ShieldAlert, Award } from 'lucide-react';
import { getUser, logout, UserSession } from '@/lib/api';

export const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<UserSession | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    setUser(getUser());
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [pathname]);

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Rounds', href: '/#rounds' },
    { label: 'Playground', href: '/#playground' },
    { label: 'Schedule', href: '/#schedule' },
    { label: 'Leaderboard', href: '/#leaderboard' },
    { label: 'Rules', href: '/#rules' },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        scrolled
          ? 'py-2.5 bg-[#F7F4ED]/95 backdrop-blur-md border-b-2 border-[#171717] shadow-sm'
          : 'py-4 bg-[#F7F4ED]'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand / Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-[#3155FF] text-white rounded-lg brutal-border brutal-shadow-sm flex items-center justify-center font-black transition-transform group-hover:-rotate-3">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#FF6B35]">
              GNANAMANI COLLEGE OF TECHNOLOGY
            </div>
            <div className="text-xl font-black tracking-tight text-[#171717] font-display flex items-center gap-1.5">
              CODE A-THON <span className="text-xs px-1.5 py-0.5 bg-[#B8E63E] rounded brutal-border font-mono">2026</span>
            </div>
          </div>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-6 text-sm font-bold text-[#171717]">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="hover:text-[#3155FF] transition-colors relative py-1 hover:after:w-full after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-[#3155FF] after:transition-all"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Action Button / Auth State */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              {user.role === 'ROLE_ADMIN' || user.role === 'ROLE_SUPER_ADMIN' ? (
                <Link
                  href="/admin"
                  className="px-3.5 py-1.5 bg-[#171717] text-white font-bold text-xs rounded-md brutal-border flex items-center gap-1.5 hover:bg-[#3155FF] transition-colors"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-[#FFD84D]" />
                  Admin Console
                </Link>
              ) : user.role === 'ROLE_JUDGE' ? (
                <Link
                  href="/judge"
                  className="px-3.5 py-1.5 bg-[#171717] text-white font-bold text-xs rounded-md brutal-border flex items-center gap-1.5 hover:bg-[#3155FF] transition-colors"
                >
                  <Award className="w-3.5 h-3.5 text-[#B8E63E]" />
                  Judge Panel
                </Link>
              ) : (
                <Link
                  href="/dashboard"
                  className="px-3.5 py-1.5 bg-[#B8E63E] text-[#171717] font-bold text-xs rounded-md brutal-border brutal-shadow-sm flex items-center gap-1.5 hover:bg-[#a6d82e] transition-colors"
                >
                  <UserIcon className="w-3.5 h-3.5" />
                  My Dashboard
                </Link>
              )}
              <button
                onClick={() => logout()}
                className="text-xs font-bold text-gray-600 hover:text-red-600 underline"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <Link
                href="/login"
                className="px-3.5 py-1.5 text-xs font-bold text-[#171717] hover:text-[#3155FF]"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 bg-[#FF6B35] text-white text-xs font-black uppercase tracking-wider rounded-lg brutal-border brutal-shadow-sm brutal-shadow-hover flex items-center gap-1.5"
              >
                Register Now <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden flex items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 bg-white brutal-border brutal-shadow-sm rounded-lg"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#F7F4ED] border-b-2 border-[#171717] px-4 pt-3 pb-6 space-y-3">
          <div className="flex flex-col space-y-2 font-bold">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-md hover:bg-black/5"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="pt-3 border-t border-[#171717]/20 flex flex-col gap-2">
            {user ? (
              <>
                <Link
                  href={user.role.includes('ADMIN') ? '/admin' : user.role.includes('JUDGE') ? '/judge' : '/dashboard'}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 bg-[#B8E63E] font-bold text-sm rounded-lg brutal-border"
                >
                  Enter Portal
                </Link>
                <button
                  onClick={() => logout()}
                  className="w-full text-center py-2 text-xs font-bold text-red-600"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 text-sm font-bold bg-white brutal-border rounded-lg"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 bg-[#FF6B35] text-white text-sm font-black uppercase tracking-wider brutal-border brutal-shadow-sm rounded-lg"
                >
                  Register Now →
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
