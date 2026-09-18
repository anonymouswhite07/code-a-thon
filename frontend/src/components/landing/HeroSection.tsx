'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Play, Sparkles, Terminal, Code2, Award, Users } from 'lucide-react';
import { Mascot } from '../mascot/Mascot';

export const HeroSection: React.FC = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      setMousePos({
        x: (e.clientX / innerWidth - 0.5) * 15,
        y: (e.clientY / innerHeight - 0.5) * 15
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden bg-dot-pattern">
      {/* Hand-drawn decorative badges floating */}
      <div className="absolute top-28 left-6 md:left-16 rotate-[-6deg] hidden sm:block pointer-events-none">
        <span className="px-3 py-1 bg-[#FFD84D] text-[#171717] font-mono text-xs font-black brutal-border brutal-shadow-sm uppercase">
          ★ March 2026 Edition
        </span>
      </div>

      <div className="absolute top-36 right-8 md:right-24 rotate-[8deg] hidden sm:block pointer-events-none">
        <span className="px-3 py-1 bg-[#B8E63E] text-[#171717] font-mono text-xs font-black brutal-border brutal-shadow-sm uppercase">
          ⚡ 3 Rounds • 1 Champion
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Bold Editorial Typography */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white brutal-border brutal-shadow-sm rounded-full">
              <span className="w-2.5 h-2.5 bg-[#FF6B35] rounded-full animate-ping"></span>
              <span className="text-xs font-black uppercase tracking-widest text-[#171717]">
                Gnanamani College of Technology Presents
              </span>
            </div>

            <div className="space-y-1">
              <h1 className="text-6xl sm:text-7xl md:text-8xl font-black tracking-tighter text-[#171717] font-display leading-[0.92]">
                CODE
              </h1>
              <h1 className="text-6xl sm:text-7xl md:text-8xl font-black tracking-tighter text-[#3155FF] font-display leading-[0.92] flex items-center gap-4">
                A-THON
                <span className="text-2xl sm:text-3xl font-mono px-3 py-1 bg-[#FF6B35] text-white rounded-lg brutal-border brutal-shadow-sm transform -rotate-6">
                  &apos;26
                </span>
              </h1>
            </div>

            <div className="pt-2">
              <p className="text-xl sm:text-2xl font-black text-[#171717] uppercase tracking-wide">
                <span className="sketch-underline">THINK.</span>{' '}
                <span className="sketch-underline-orange">CODE.</span>{' '}
                <span className="sketch-underline-lime">CONQUER.</span>
              </p>
              <p className="text-base sm:text-lg text-gray-700 font-medium max-w-xl mt-3 leading-relaxed">
                A 3-round collegiate coding festival engineered for curious minds, sharp algorithmic thinkers, and future builders. Three distinct languages. One supreme trophy.
              </p>
            </div>

            {/* CTAs */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Link
                href="/register"
                className="px-8 py-4 bg-[#FF6B35] text-white font-black text-base uppercase tracking-wider rounded-xl brutal-border brutal-shadow brutal-shadow-hover flex items-center gap-3 transition-transform"
              >
                Register Now <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="#playground"
                className="px-6 py-4 bg-white text-[#171717] font-black text-base rounded-xl brutal-border brutal-shadow brutal-shadow-hover flex items-center gap-2 hover:bg-[#F7F4ED] transition-colors"
              >
                <Play className="w-4 h-4 fill-current text-[#3155FF]" /> Try Playground
              </Link>
            </div>

            {/* Statistics */}
            <div className="pt-6 grid grid-cols-3 gap-4 border-t-2 border-[#171717]/15 max-w-lg">
              <div>
                <div className="text-3xl sm:text-4xl font-black text-[#171717] font-display">03</div>
                <div className="text-xs font-bold text-gray-600 uppercase">Coding Rounds</div>
              </div>
              <div>
                <div className="text-3xl sm:text-4xl font-black text-[#3155FF] font-display">03</div>
                <div className="text-xs font-bold text-gray-600 uppercase">Languages (C, Py, Java)</div>
              </div>
              <div>
                <div className="text-3xl sm:text-4xl font-black text-[#FF6B35] font-display">01</div>
                <div className="text-xs font-bold text-gray-600 uppercase">Grand Champion</div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Mascot & Poster Scene */}
          <div className="lg:col-span-5 relative flex justify-center items-center">
            {/* Background card framing the poster */}
            <div
              className="relative w-full max-w-md bg-white p-6 rounded-2xl brutal-border brutal-shadow-lg transform transition-transform duration-200"
              style={{
                transform: `perspective(1000px) rotateX(${-mousePos.y * 0.5}deg) rotateY(${mousePos.x * 0.5}deg)`
              }}
            >
              {/* Top header bar of card */}
              <div className="flex items-center justify-between pb-4 mb-4 border-b-2 border-[#171717]">
                <div className="flex items-center gap-1.5">
                  <div className="w-3.5 h-3.5 rounded-full bg-[#FF6B35] brutal-border"></div>
                  <div className="w-3.5 h-3.5 rounded-full bg-[#FFD84D] brutal-border"></div>
                  <div className="w-3.5 h-3.5 rounded-full bg-[#B8E63E] brutal-border"></div>
                </div>
                <div className="text-xs font-mono font-bold text-gray-500 uppercase">
                  contestant_arena.sh
                </div>
              </div>

              {/* Main Mascot Illustration */}
              <div className="py-2 flex justify-center">
                <Mascot state="coding" size={220} showQuote={true} customQuote="One more test case..." />
              </div>

              {/* Stack of books & Language chips */}
              <div className="mt-4 pt-4 border-t-2 border-[#171717]/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 bg-[#F7F4ED] text-[#171717] rounded brutal-border text-xs font-mono font-black">
                    01. C
                  </span>
                  <span className="px-2.5 py-1 bg-[#3155FF] text-white rounded brutal-border text-xs font-mono font-black">
                    02. PYTHON
                  </span>
                  <span className="px-2.5 py-1 bg-[#FF6B35] text-white rounded brutal-border text-xs font-mono font-black">
                    03. JAVA
                  </span>
                </div>
                <span className="text-xs font-bold text-gray-500 font-mono">100% LIVE</span>
              </div>

              {/* Sticky handwritten note */}
              <div className="absolute -bottom-5 -left-6 bg-[#FFD84D] p-3 rounded-md brutal-border brutal-shadow-sm transform -rotate-6 hidden sm:block">
                <p className="text-xs font-black text-[#171717] font-mono leading-tight">
                  &quot;It works on my machine&quot; <br />
                  <span className="text-[10px] text-gray-700 font-normal">— Every coder ever</span>
                </p>
              </div>

              {/* Trophy icon tag */}
              <div className="absolute -top-4 -right-4 bg-[#B8E63E] p-2.5 rounded-xl brutal-border brutal-shadow-sm transform rotate-12">
                <Award className="w-6 h-6 text-[#171717]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
