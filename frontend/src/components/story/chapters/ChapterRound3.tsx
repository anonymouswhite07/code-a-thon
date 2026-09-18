'use client';

import React from 'react';
import Link from 'next/link';
import { Coffee, CheckCircle, ArrowRight, Laptop } from 'lucide-react';
import { CodeMascot } from '@/components/mascot/CodeMascot';

interface ChapterRound3Props {
  roundData?: {
    id: number;
    title: string;
    subtitle?: string;
    durationMinutes: number;
    questionCount: number;
    status: string;
    isLocked?: boolean;
  };
}

export const ChapterRound3: React.FC<ChapterRound3Props> = ({ roundData }) => {
  const duration = roundData?.durationMinutes || 60;
  const questions = roundData?.questionCount || 5;
  const isLive = roundData?.status === 'LIVE';

  return (
    <section id="final" className="py-28 px-4 bg-[#111318] text-[#F7F4ED] relative overflow-hidden">
      {/* Subtle warm amber ambient glow (not neon, not cyberpunk) */}
      <div className="absolute -top-40 right-10 w-96 h-96 bg-[#FF6B35]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 left-10 w-96 h-96 bg-[#FFD84D]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto w-full space-y-12 relative z-10">
        {/* Chapter Header */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="px-3.5 py-1 bg-[#FF6B35] text-white font-mono text-xs font-black uppercase rounded-md">
                Chapter 05 — Final Battle
              </span>
              <span className="font-mono text-xs font-bold text-[#FFD84D] uppercase tracking-wider">
                Round 03 — Java: The Master
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-gray-400">
              <Coffee className="w-4 h-4 text-[#FF6B35]" />
              <span>Midnight Grind &bull; Final Sprint</span>
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-6xl sm:text-8xl md:text-9xl font-black text-white font-display tracking-tighter leading-none">
              JAVA
            </h2>
            <p className="text-2xl sm:text-3xl font-black text-[#FFD84D] uppercase tracking-tight">
              THE MASTER. CONQUER THE FINAL TEST CASE.
            </p>
            <p className="text-sm sm:text-base text-gray-300 max-w-2xl font-medium leading-relaxed">
              Enterprise architecture, multithreading synchronization, and industrial-strength algorithms. The arena narrows down to the finalists. One more test case stands between you and the podium.
            </p>
          </div>
        </div>

        {/* Cinematic Late Night Desk Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Desk Scene & Mascot Card */}
          <div className="lg:col-span-6 bg-[#1A1D24] p-6 sm:p-8 rounded-3xl border border-white/10 flex flex-col justify-between relative">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Laptop className="w-4 h-4 text-[#B8E63E]" /> Candidate Workspace
                </span>
                <span className="text-xs font-mono text-[#FF6B35] font-bold">23:59:12 IST</span>
              </div>

              {/* Humorous Sticky Note */}
              <div className="p-4 bg-[#FFD84D] text-[#171717] rounded-xl font-mono text-xs transform -rotate-1 shadow-md font-bold space-y-1">
                <div className="flex items-center justify-between border-b border-[#171717]/20 pb-1">
                  <span>STICKY NOTE #42</span>
                  <Coffee className="w-3.5 h-3.5" />
                </div>
                <p className="italic pt-1">&ldquo;One more test case... just check null pointers and edge cases at n = 10^5.&rdquo;</p>
              </div>

              {/* Live Backend Specs */}
              <div className="grid grid-cols-3 gap-3 pt-2 text-center font-mono">
                <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                  <span className="text-[10px] text-gray-400 uppercase block">Grand Tasks</span>
                  <span className="text-lg font-black text-white">{questions} Hard Problems</span>
                </div>
                <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                  <span className="text-[10px] text-gray-400 uppercase block">Battle Window</span>
                  <span className="text-lg font-black text-[#FF6B35]">{duration} Mins</span>
                </div>
                <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                  <span className="text-[10px] text-gray-400 block uppercase">JVM Memory</span>
                  <span className="text-lg font-black text-[#B8E63E]">256 MB</span>
                </div>
              </div>
            </div>

            {/* Mascot in coffee / tired state */}
            <div className="pt-6 mt-6 border-t border-white/10 flex items-center justify-between">
              <div>
                <CodeMascot state="coffee" size={110} showSpeechBubble={false} />
              </div>
              <div className="text-right font-mono text-xs text-gray-400 space-y-1">
                <span className="text-white font-bold block">Fatigued but Unstoppable</span>
                <span>Third cup of coffee</span>
                <span className="text-[#B8E63E] block">Adrenaline: 100%</span>
              </div>
            </div>
          </div>

          {/* Stepper: COMPILE ✓ TEST ✓ SUBMIT ✓ */}
          <div className="lg:col-span-6 bg-[#1A1D24] p-6 sm:p-8 rounded-3xl border border-white/10 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <span className="text-xs font-mono text-gray-400 uppercase tracking-wider block">
                Verification Pipeline
              </span>

              <h3 className="text-2xl sm:text-3xl font-black text-white">
                The Final Verification
              </h3>

              <p className="text-sm text-gray-300 leading-relaxed">
                When milliseconds decide between silver and gold, the automated judge validates algorithmic correctness against hidden test cases.
              </p>

              {/* Animated 3-step pipeline */}
              <div className="space-y-3 pt-2 font-mono text-xs">
                <div className="p-3.5 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#B8E63E] text-[#171717] font-black text-[10px] flex items-center justify-center">
                      1
                    </span>
                    <span className="font-bold text-white uppercase tracking-wider">COMPILE</span>
                  </div>
                  <span className="text-[#B8E63E] font-bold flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> javac 17 Clean
                  </span>
                </div>

                <div className="p-3.5 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#FFD84D] text-[#171717] font-black text-[10px] flex items-center justify-center">
                      2
                    </span>
                    <span className="font-bold text-white uppercase tracking-wider">TEST</span>
                  </div>
                  <span className="text-[#FFD84D] font-bold flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> 25/25 All Invariants
                  </span>
                </div>

                <div className="p-3.5 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-[#FF6B35] text-white font-black text-[10px] flex items-center justify-center">
                      3
                    </span>
                    <span className="font-bold text-white uppercase tracking-wider">SUBMIT</span>
                  </div>
                  <span className="text-[#FF6B35] font-bold flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> Recorded in Ledger
                  </span>
                </div>
              </div>
            </div>

            {/* Enter Final Round Action */}
            <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-xs font-mono text-gray-400">
                Are you ready for the final sprint?
              </span>

              <Link
                href={roundData ? `/compete/${roundData.id}` : '/register'}
                className="w-full sm:w-auto px-7 py-3.5 bg-[#FF6B35] hover:bg-[#ff5517] text-white font-black text-xs uppercase tracking-wider rounded-xl brutal-shadow-hover transition flex items-center justify-center gap-2"
              >
                {isLive ? 'Enter Java Finale' : 'Register for Competition'} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Transition prompt leading into Chapter 06: ONE CHAMPION */}
        <div className="text-center pt-8">
          <a
            href="#champion"
            className="inline-flex items-center gap-2 text-xs font-mono font-black text-[#FFD84D] uppercase tracking-widest hover:underline"
          >
            The smoke clears. Witness the revelation &darr;
          </a>
        </div>
      </div>
    </section>
  );
};
