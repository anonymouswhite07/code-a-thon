'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Terminal, ArrowRight, Menu, X, Play, Trophy, Calendar, BookOpen } from 'lucide-react';
import { getUser, logout, UserSession } from '@/lib/api';

interface StoryNavProps {
  onOpenPlayground: () => void;
  onOpenRules: () => void;
  onOpenSchedule: () => void;
  onOpenLeaderboard: () => void;
}

export const StoryNav: React.FC<StoryNavProps> = ({
  onOpenPlayground,
  onOpenRules,
  onOpenSchedule,
  onOpenLeaderboard
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const user = mounted ? getUser() : null;

  const storyChapters = [
    { label: 'BEGIN', href: '#begin' },
    { label: 'THINK', href: '#think' },
    { label: 'CODE', href: '#code' },
    { label: 'ROUNDS', href: '#round1' },
    { label: 'FINAL', href: '#final' },
    { label: 'CHAMPION', href: '#champion' },
    { label: 'YOUR STORY', href: '#story' }
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        scrolled
          ? 'py-2.5 bg-[#F7F4ED]/95 backdrop-blur-md border-b-2 border-[#171717] shadow-sm'
          : 'py-3.5 bg-[#F7F4ED]'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 bg-[#3155FF] text-white rounded-lg brutal-border flex items-center justify-center font-black transition-transform group-hover:-rotate-3">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#FF6B35]">
              GNANAMANI COLLEGE OF TECHNOLOGY
            </div>
            <div className="text-lg font-black tracking-tight text-[#171717] font-display flex items-center gap-1">
              CODE A-THON <span className="text-[10px] px-1.5 py-0.2 bg-[#B8E63E] rounded brutal-border font-mono">2026</span>
            </div>
          </div>
        </Link>

        {/* Story Chapter Navigation (Desktop) */}
        <div className="hidden lg:flex items-center gap-5 text-xs font-mono font-black text-[#171717]">
          {storyChapters.map((ch) => (
            <a
              key={ch.label}
              href={ch.href}
              className="hover:text-[#3155FF] transition-colors relative py-1 hover:after:w-full after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-[#3155FF] after:transition-all"
            >
              {ch.label}
            </a>
          ))}
        </div>

        {/* Right Actions & Utilities */}
        <div className="hidden md:flex items-center gap-2.5">
          <button
            onClick={onOpenPlayground}
            className="px-3 py-1.5 bg-white text-[#171717] text-xs font-mono font-bold rounded-lg brutal-border hover:bg-gray-100 flex items-center gap-1.5 cursor-pointer"
            title="Open Interactive Code Playground"
          >
            <Play className="w-3 h-3 fill-current text-[#3155FF]" /> Sandbox
          </button>

          <button
            onClick={onOpenLeaderboard}
            className="px-2.5 py-1.5 text-xs font-mono font-bold text-gray-700 hover:text-[#171717] cursor-pointer"
          >
            Leaderboard
          </button>

          <button
            onClick={onOpenRules}
            className="px-2.5 py-1.5 text-xs font-mono font-bold text-gray-700 hover:text-[#171717] cursor-pointer"
          >
            Rules
          </button>

          <button
            onClick={onOpenSchedule}
            className="px-2.5 py-1.5 text-xs font-mono font-bold text-gray-700 hover:text-[#171717] cursor-pointer"
          >
            Schedule
          </button>

          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-gray-300">
              <Link
                href={user.role.includes('ADMIN') ? '/admin' : user.role.includes('JUDGE') ? '/judge' : '/dashboard'}
                className="px-3.5 py-1.5 bg-[#B8E63E] text-[#171717] font-mono text-xs font-bold rounded-lg brutal-border"
              >
                Dashboard
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-2 pl-2 border-l border-gray-300">
              <Link
                href="/login"
                className="px-3 py-1.5 text-xs font-mono font-bold text-[#171717] hover:text-[#3155FF]"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 bg-[#FF6B35] text-white text-xs font-black uppercase tracking-wider rounded-lg brutal-border brutal-shadow-sm brutal-shadow-hover flex items-center gap-1.5"
              >
                Enter Code-a-thon <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden flex items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 bg-white brutal-border rounded-lg cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#F7F4ED] border-b-2 border-[#171717] px-4 pt-3 pb-6 space-y-3">
          <div className="flex flex-col space-y-2 font-mono text-xs font-bold">
            {storyChapters.map((ch) => (
              <a
                key={ch.label}
                href={ch.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded hover:bg-black/5"
              >
                {ch.label}
              </a>
            ))}
          </div>

          <div className="pt-3 border-t border-[#171717]/20 flex flex-col gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenPlayground();
              }}
              className="w-full text-center py-2 bg-white font-mono text-xs font-bold brutal-border rounded-lg cursor-pointer"
            >
              Interactive Sandbox
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenLeaderboard();
              }}
              className="w-full text-center py-2 bg-white font-mono text-xs font-bold brutal-border rounded-lg cursor-pointer"
            >
              View Leaderboard
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenRules();
              }}
              className="w-full text-center py-2 bg-white font-mono text-xs font-bold brutal-border rounded-lg cursor-pointer"
            >
              Competition Rules
            </button>
            <Link
              href="/register"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 bg-[#FF6B35] text-white font-black text-xs uppercase tracking-wider brutal-border rounded-lg cursor-pointer"
            >
              Enter Code-a-thon &rarr;
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};
