'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Terminal, Menu, X, ArrowRight, User as UserIcon, ShieldAlert, Award } from 'lucide-react';
import { getUser, logout, UserSession, subscribeToEvents } from '@/lib/api';

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

    const unsubscribe = subscribeToEvents((event, data) => {
      if (event === 'PARTICIPANT_SUSPENDED') {
        const curUser = getUser();
        if (curUser && (curUser.email === data?.email || curUser.id === data?.userId || curUser.participantId === data?.participantId)) {
          logout();
          window.location.href = '/login?suspended=true';
        }
      }
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      unsubscribe();
    };
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
          ? 'bg-[#F7F4ED]/95 backdrop-blur-md border-b-2 border-[#171717] shadow-sm'
          : 'bg-[#F7F4ED] border-b border-[#171717]/10'
      }`}
    >
      {/* Prominent Organizer Top Banner */}
      <div className="bg-[#171717] text-[#FFD84D] text-[10px] sm:text-[11px] font-mono font-bold py-1 px-4 text-center border-b border-white/10 flex items-center justify-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping shrink-0" />
        <span className="uppercase tracking-wider">
          Organized by Department of Information Technology by Coding Club
        </span>
        <span className="hidden md:inline text-gray-400 font-normal">• Gnanamani College of Technology</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0">
          <div className="w-8 h-8 bg-[#3155FF] text-white rounded-md brutal-border brutal-shadow-sm flex items-center justify-center font-black transition-transform group-hover:-rotate-3 flex-shrink-0">
            <Terminal className="w-4 h-4" />
          </div>
          <div className="flex flex-col flex-shrink-0 justify-center">
            <div className="text-[9px] font-mono font-black tracking-wider text-[#FF6B35] leading-none whitespace-nowrap">
              DEPT OF IT • CODING CLUB
            </div>
            <div className="text-base sm:text-lg font-black tracking-tight text-[#171717] font-display whitespace-nowrap flex items-center gap-1.5 leading-snug mt-0.5">
              <span>CODE-A-THON</span>
              <span className="text-[10px] px-1.5 py-0.5 bg-[#B8E63E] rounded brutal-border font-mono font-bold leading-none">
                2026
              </span>
            </div>
          </div>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-5 text-xs font-bold text-[#171717] flex-shrink-0">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="hover:text-[#3155FF] transition-colors relative py-1 hover:after:w-full after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-[#3155FF] after:transition-all whitespace-nowrap"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Action Button / Auth State */}
        <div className="hidden md:flex items-center gap-2.5 flex-shrink-0">
          <Link
            href="/compete/1"
            className="px-3 py-1.5 bg-[#FF6B35] hover:bg-[#ff5517] text-white font-black text-xs uppercase tracking-wider rounded-lg brutal-border brutal-shadow-sm flex items-center gap-1.5 hover:scale-102 transition-all whitespace-nowrap flex-shrink-0"
            title="Start Competition Round"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#B8E63E] animate-ping flex-shrink-0" />
            <span className="whitespace-nowrap">Start Your Round</span>
            <ArrowRight className="w-3.5 h-3.5 flex-shrink-0" />
          </Link>

          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-gray-300 flex-shrink-0">
              {user.role === 'ROLE_ADMIN' || user.role === 'ROLE_SUPER_ADMIN' ? (
                <Link
                  href="/admin"
                  className="px-3 py-1.5 bg-[#171717] text-white font-bold text-xs rounded-md brutal-border flex items-center gap-1.5 hover:bg-[#3155FF] transition-colors whitespace-nowrap"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-[#FFD84D] flex-shrink-0" />
                  Admin Console
                </Link>
              ) : user.role === 'ROLE_JUDGE' ? (
                <Link
                  href="/judge"
                  className="px-3 py-1.5 bg-[#171717] text-white font-bold text-xs rounded-md brutal-border flex items-center gap-1.5 hover:bg-[#3155FF] transition-colors whitespace-nowrap"
                >
                  <Award className="w-3.5 h-3.5 text-[#B8E63E] flex-shrink-0" />
                  Judge Panel
                </Link>
              ) : (
                <Link
                  href="/dashboard"
                  className="px-3 py-1.5 bg-[#B8E63E] text-[#171717] font-bold text-xs rounded-md brutal-border brutal-shadow-sm flex items-center gap-1.5 hover:bg-[#a6d82e] transition-colors whitespace-nowrap"
                >
                  <UserIcon className="w-3.5 h-3.5 flex-shrink-0" />
                  My Dashboard
                </Link>
              )}
              <button
                onClick={() => logout()}
                className="text-xs font-bold text-gray-600 hover:text-red-600 underline whitespace-nowrap"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 pl-2 border-l border-gray-300 flex-shrink-0">
              <Link
                href="/login"
                className="px-2.5 py-1.5 text-xs font-bold text-[#171717] hover:text-[#3155FF] whitespace-nowrap"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="px-3 py-1.5 bg-white hover:bg-gray-100 text-[#171717] text-xs font-mono font-bold rounded-lg brutal-border transition-colors whitespace-nowrap"
              >
                Register Now
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
            <Link
              href="/compete/1"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 bg-[#FF6B35] text-white font-black text-xs uppercase tracking-wider brutal-border rounded-lg flex items-center justify-center gap-2 shadow-sm"
            >
              <span className="w-2 h-2 rounded-full bg-[#B8E63E] animate-ping" />
              <span>Start Your Round</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
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
