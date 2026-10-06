'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Menu, X, Sparkles, ChevronRight } from 'lucide-react';
import { BrandTerminalIcon, CodePlayIcon } from '@/components/icons/CustomIcons';
import { getUser } from '@/lib/api';

interface StoryNavProps {
  onOpenPlayground: () => void;
  onOpenRules: () => void;
  onOpenSchedule: () => void;
  onOpenLeaderboard: () => void;
}

const STORY_CHAPTERS = [
  { id: 'begin', label: 'BEGIN', href: '#begin' },
  { id: 'think', label: 'THINK', href: '#think' },
  { id: 'code', label: 'CODE', href: '#code' },
  { id: 'round1', label: 'ROUNDS', href: '#round1' },
  { id: 'final', label: 'FINAL', href: '#final' },
  { id: 'champion', label: 'CHAMPION', href: '#champion' },
  { id: 'story', label: 'YOUR STORY', href: '#story' }
];

export const StoryNav: React.FC<StoryNavProps> = ({
  onOpenPlayground,
  onOpenRules,
  onOpenSchedule,
  onOpenLeaderboard
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('begin');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const handleScroll = () => {
      const currentScroll = window.scrollY;
      setScrolled(currentScroll > 20);

      // Active chapter spy
      const scrollPos = currentScroll + 260;
      for (let i = STORY_CHAPTERS.length - 1; i >= 0; i--) {
        const item = STORY_CHAPTERS[i];
        const el = document.getElementById(item.id);
        if (el && el.offsetTop <= scrollPos) {
          setActiveSection(item.id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const user = mounted ? getUser() : null;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'py-2 bg-[#F7F4ED]/90 backdrop-blur-lg border-b-2 border-[#171717] shadow-lg'
          : 'py-3.5 bg-[#F7F4ED]/95 backdrop-blur-sm border-b border-[#171717]/10'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand with hover micro-rotation */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="transition-all duration-300 group-hover:rotate-6 group-hover:scale-110">
            <BrandTerminalIcon size={34} />
          </div>
          <div>
            <div className="text-[9px] font-mono font-black uppercase tracking-widest text-[#FF6B35] flex items-center gap-1.5">
              <span>GNANAMANI CSE</span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#10B981] animate-ping" />
            </div>
            <div className="text-lg font-black tracking-tight text-[#171717] font-display flex items-center gap-1.5">
              CODE A-THON
              <span className="text-[10px] px-1.5 py-0.2 bg-[#FFD84D] text-[#171717] rounded-md brutal-border font-mono font-bold group-hover:bg-[#B8E63E] transition-colors">
                &apos;26
              </span>
            </div>
          </div>
        </Link>

        {/* Story Chapter Navigation with Animated Active Pill */}
        <div className="hidden lg:flex items-center p-1 bg-black/5 rounded-full border border-black/10">
          {STORY_CHAPTERS.map((ch) => {
            const isActive = activeSection === ch.id;
            return (
              <a
                key={ch.label}
                href={ch.href}
                className={`relative px-3.5 py-1 text-xs font-mono font-black tracking-wider transition-all duration-200 rounded-full cursor-pointer select-none ${
                  isActive
                    ? 'bg-[#171717] text-white brutal-shadow-sm scale-105'
                    : 'text-gray-600 hover:text-[#171717] hover:bg-black/5'
                }`}
              >
                {ch.label}
                {isActive && (
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#FF6B35] ml-1.5 animate-pulse align-middle" />
                )}
              </a>
            );
          })}
        </div>

        {/* Right Actions with Interactive Animated Buttons */}
        <div className="hidden md:flex items-center gap-2.5">
          {/* Interactive Sandbox Button */}
          <button
            onClick={onOpenPlayground}
            className="group px-3 py-1.5 bg-white hover:bg-[#3155FF] text-[#171717] hover:text-white text-xs font-mono font-bold rounded-lg brutal-border brutal-shadow-sm brutal-shadow-hover flex items-center gap-2 cursor-pointer transition-all duration-200"
            title="Open Interactive Code Playground"
          >
            <CodePlayIcon size={16} className="transition-transform group-hover:scale-125" />
            <span>Sandbox</span>
          </button>

          <button
            onClick={onOpenLeaderboard}
            className="px-2.5 py-1.5 text-xs font-mono font-bold text-gray-700 hover:text-[#171717] hover:bg-black/5 rounded-md transition-colors cursor-pointer"
          >
            Leaderboard
          </button>

          <button
            onClick={onOpenRules}
            className="px-2.5 py-1.5 text-xs font-mono font-bold text-gray-700 hover:text-[#171717] hover:bg-black/5 rounded-md transition-colors cursor-pointer"
          >
            Rules
          </button>

          <button
            onClick={onOpenSchedule}
            className="px-2.5 py-1.5 text-xs font-mono font-bold text-gray-700 hover:text-[#171717] hover:bg-black/5 rounded-md transition-colors cursor-pointer"
          >
            Schedule
          </button>

          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-gray-300">
              <Link
                href={user.role.includes('ADMIN') ? '/admin' : user.role.includes('JUDGE') ? '/judge' : '/dashboard'}
                className="px-3.5 py-1.5 bg-[#B8E63E] text-[#171717] font-mono text-xs font-black rounded-lg brutal-border hover:scale-105 transition-transform"
              >
                Dashboard
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-2 pl-2 border-l border-gray-300">
              <Link
                href="/login"
                className="px-3 py-1.5 text-xs font-mono font-bold text-[#171717] hover:text-[#3155FF] transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="group relative overflow-hidden px-4 py-2 bg-[#FF6B35] hover:bg-[#ff5517] text-white text-xs font-black uppercase tracking-wider rounded-lg brutal-border brutal-shadow-sm brutal-shadow-hover flex items-center gap-1.5 transition-all duration-200 hover:scale-105"
              >
                {/* Shimmer sweep effect */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />
                <span>Enter Code-a-thon</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden flex items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 bg-white brutal-border rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>



      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#F7F4ED] border-b-2 border-[#171717] px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top duration-200">
          <div className="flex flex-col space-y-2 font-mono text-xs font-bold">
            {STORY_CHAPTERS.map((ch) => (
              <a
                key={ch.label}
                href={ch.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2 rounded-lg flex items-center justify-between ${
                  activeSection === ch.id
                    ? 'bg-[#171717] text-white font-black'
                    : 'hover:bg-black/5 text-gray-700'
                }`}
              >
                <span>{ch.label}</span>
                <ChevronRight className="w-3.5 h-3.5 opacity-50" />
              </a>
            ))}
          </div>

          <div className="pt-3 border-t border-[#171717]/20 flex flex-col gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenPlayground();
              }}
              className="w-full text-center py-2 bg-white font-mono text-xs font-bold brutal-border rounded-lg cursor-pointer hover:bg-gray-50 flex items-center justify-center gap-2"
            >
              <CodePlayIcon size={14} /> Interactive Sandbox
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenLeaderboard();
              }}
              className="w-full text-center py-2 bg-white font-mono text-xs font-bold brutal-border rounded-lg cursor-pointer hover:bg-gray-50"
            >
              View Leaderboard
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenRules();
              }}
              className="w-full text-center py-2 bg-white font-mono text-xs font-bold brutal-border rounded-lg cursor-pointer hover:bg-gray-50"
            >
              Competition Rules
            </button>
            <Link
              href="/register"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 bg-[#FF6B35] text-white font-black text-xs uppercase tracking-wider brutal-border rounded-lg cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Enter Code-a-thon</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};
