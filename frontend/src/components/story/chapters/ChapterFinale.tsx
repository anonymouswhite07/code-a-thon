'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, Heart, Compass } from 'lucide-react';
import { CodeMascot } from '@/components/mascot/CodeMascot';

export const ChapterFinale: React.FC = () => {
  return (
    <section id="story" className="py-28 px-4 bg-[#FDFBF7] border-t-2 border-[#171717]/10 relative overflow-hidden">
      <div className="max-w-5xl mx-auto w-full space-y-24">
        {/* Part 1: Emotional Reflection */}
        <div className="space-y-12 text-center max-w-4xl mx-auto">
          <div className="inline-block px-3.5 py-1 bg-white brutal-border rounded-full text-xs font-mono font-black uppercase text-gray-700">
            Chapter 07 &bull; The Ethos
          </div>

          <div className="space-y-4">
            <h2 className="text-6xl sm:text-8xl md:text-9xl font-black text-[#171717] font-display tracking-tight leading-none">
              EVERY CODER <br />
              <span className="text-[#FF6B35]">HAS A STORY.</span>
            </h2>
          </div>

          {/* 3 Staggered Editorial Quotes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 text-left">
            <div className="p-6 bg-white brutal-border brutal-shadow-sm rounded-2xl space-y-2">
              <div className="w-8 h-8 rounded-lg bg-[#3155FF]/10 text-[#3155FF] flex items-center justify-center font-black">
                <Compass className="w-4 h-4" />
              </div>
              <h4 className="text-lg font-black text-[#171717]">Some came to compete.</h4>
              <p className="text-xs sm:text-sm text-gray-600 font-medium leading-relaxed">
                Aiming for the highest podium, chasing the leaderboards, benchmarking their velocity against peers across colleges.
              </p>
            </div>

            <div className="p-6 bg-white brutal-border brutal-shadow-sm rounded-2xl space-y-2">
              <div className="w-8 h-8 rounded-lg bg-[#FFD84D]/30 text-[#171717] flex items-center justify-center font-black">
                <Sparkles className="w-4 h-4 text-[#171717]" />
              </div>
              <h4 className="text-lg font-black text-[#171717]">Some came to learn.</h4>
              <p className="text-xs sm:text-sm text-gray-600 font-medium leading-relaxed">
                Facing dynamic programming and memory bounds for the very first time. Discovering how much they could build in 45 minutes.
              </p>
            </div>

            <div className="p-6 bg-white brutal-border brutal-shadow-sm rounded-2xl space-y-2">
              <div className="w-8 h-8 rounded-lg bg-[#B8E63E]/30 text-[#171717] flex items-center justify-center font-black">
                <Heart className="w-4 h-4 text-[#171717]" />
              </div>
              <h4 className="text-lg font-black text-[#171717]">Some came to prove themselves.</h4>
              <p className="text-xs sm:text-sm text-gray-600 font-medium leading-relaxed">
                Overcoming self-doubt. Pushing through compiler errors and late-night test cases to see their code turn green.
              </p>
            </div>
          </div>

          {/* Unifying Climax Statement */}
          <div className="pt-8">
            <p className="text-3xl sm:text-5xl font-black text-[#171717] font-display uppercase tracking-tight">
              AND IN THE END &mdash; <span className="sketch-underline">EVERYONE CODED.</span>
            </p>
            <p className="text-sm sm:text-base text-gray-600 max-w-xl mx-auto mt-4 font-medium">
              Conducted by the Department of Computer Science &amp; Engineering, Gnanamani College of Technology.
            </p>
          </div>
        </div>

        {/* Part 2: Final Monumental CTA with Portal Gateway */}
        <div className="p-8 sm:p-14 bg-[#171717] text-[#F7F4ED] rounded-3xl brutal-border brutal-shadow-2xl relative overflow-hidden">
          {/* Subtle warm accent lines */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#3155FF]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#FF6B35]/20 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
            <div className="lg:col-span-8 space-y-6">
              <div className="inline-block px-3 py-1 bg-white/10 rounded-full text-xs font-mono font-bold text-[#FFD84D]">
                Chapter 08 &bull; The Doorway
              </div>

              <div className="space-y-2">
                <h3 className="text-5xl sm:text-7xl font-black text-white font-display tracking-tight leading-none">
                  YOUR STORY <br />
                  <span className="text-[#FF6B35]">STARTS HERE.</span>
                </h3>
                <p className="text-lg sm:text-xl text-gray-300 font-medium">
                  Ready to write your first line of code?
                </p>
              </div>

              <p className="text-sm text-gray-400 max-w-xl leading-relaxed">
                Registration is open for students across accredited engineering colleges. One account unlocks access to the real-time competition portal, sandbox practice, and live leaderboards.
              </p>

              <div className="pt-4 flex flex-wrap items-center gap-4">
                <Link
                  href="/register"
                  className="px-8 py-4 bg-[#FF6B35] hover:bg-[#ff5517] text-white font-black text-sm uppercase tracking-wider rounded-xl brutal-shadow-hover flex items-center gap-3 transition cursor-pointer"
                >
                  ENTER CODE-A-THON &rarr;
                </Link>

                <Link
                  href="/login"
                  className="px-6 py-4 bg-white/10 hover:bg-white/20 text-white font-black text-sm uppercase tracking-wider rounded-xl transition cursor-pointer"
                >
                  Sign In to Account
                </Link>
              </div>
            </div>

            {/* Mascot standing at the portal doorway */}
            <div className="lg:col-span-4 flex flex-col items-center justify-center p-6 bg-white/5 rounded-2xl border border-white/10">
              <div className="relative">
                {/* Visual archway / doorway SVG */}
                <div className="w-36 h-48 border-4 border-dashed border-[#FFD84D] rounded-t-full flex items-end justify-center pb-2 bg-gradient-to-b from-transparent to-[#FFD84D]/10">
                  <CodeMascot state="idle" size={110} showSpeechBubble={false} />
                </div>
              </div>
              <span className="text-xs font-mono text-[#FFD84D] font-bold mt-4">
                The gateway is open
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
