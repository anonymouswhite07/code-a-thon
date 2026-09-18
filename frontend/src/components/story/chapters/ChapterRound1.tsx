'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Terminal, ArrowRight, Lock, Unlock } from 'lucide-react';
import { CodeMascot } from '@/components/mascot/CodeMascot';

interface ChapterRound1Props {
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

export const ChapterRound1: React.FC<ChapterRound1Props> = ({ roundData }) => {
  const [isGateOpen, setIsGateOpen] = useState<boolean>(false);

  const duration = roundData?.durationMinutes || 45;
  const questions = roundData?.questionCount || 10;
  const isLive = roundData?.status === 'LIVE';

  return (
    <div className="py-20 border-t-2 border-[#171717]/10 relative">
      <div className="space-y-10">
        {/* Chapter Subtitle & Badge */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="px-3.5 py-1 bg-[#171717] text-[#F7F4ED] font-mono text-xs font-black uppercase rounded-md brutal-border brutal-shadow-sm">
              Round 01
            </span>
            <span className="font-mono text-xs font-bold text-[#3155FF] uppercase tracking-wider">
              The Foundation
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#3155FF]"></span>
            <span className="font-mono text-xs font-bold text-gray-600">Language: C (GCC 11)</span>
          </div>
        </div>

        {/* Big Editorial Headline */}
        <div className="space-y-2">
          <div className="text-6xl sm:text-8xl md:text-9xl font-black text-[#171717] font-display tracking-tighter leading-none">
            C
          </div>
          <p className="text-2xl sm:text-3xl font-black text-[#171717] uppercase tracking-tight">
            MASTER THE BASICS. BUILD YOUR LOGIC.
          </p>
          <p className="text-sm sm:text-base text-gray-700 max-w-2xl font-medium leading-relaxed">
            The foundation of modern computing. Strip away high-level abstractions to master algorithms, pointer arithmetic, memory bounds, and algorithmic efficiency.
          </p>
        </div>

        {/* Vintage Terminal & Round Card Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Retro Terminal Display */}
          <div className="lg:col-span-7 bg-[#171717] text-[#F7F4ED] p-6 sm:p-8 rounded-3xl brutal-border brutal-shadow-xl font-mono text-xs sm:text-sm flex flex-col justify-between relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-[#B8E63E]" />
                <span className="text-xs font-bold text-gray-300">tty01 // c_core_engine.c</span>
              </div>
              <span className="text-[11px] px-2 py-0.5 bg-white/10 rounded text-gray-300">UNIX ENV</span>
            </div>

            <div className="space-y-2 text-gray-300">
              <p className="text-[#B8E63E] font-bold">{'// Step 1: Memory & Logic Verification'}</p>
              <p>struct ListNode* reverse(struct ListNode* head) &#123;</p>
              <p className="pl-4">struct ListNode *prev = NULL, *curr = head;</p>
              <p className="pl-4">while (curr) &#123;</p>
              <p className="pl-8">struct ListNode* next = curr-&gt;next;</p>
              <p className="pl-8">curr-&gt;next = prev;</p>
              <p className="pl-8">prev = curr;</p>
              <p className="pl-8">curr = next;</p>
              <p className="pl-4">&#125;</p>
              <p className="pl-4">return prev;</p>
              <p>&#125;</p>
            </div>

            {/* Terminal Specs Footer */}
            <div className="pt-6 mt-6 border-t border-white/10 grid grid-cols-3 gap-2 text-center">
              <div className="p-2 bg-white/5 rounded-xl">
                <span className="text-[10px] text-gray-400 block uppercase">Questions</span>
                <span className="text-base font-black text-[#FFD84D]">{questions}</span>
              </div>
              <div className="p-2 bg-white/5 rounded-xl">
                <span className="text-[10px] text-gray-400 block uppercase">Time Limit</span>
                <span className="text-base font-black text-[#B8E63E]">{duration} Mins</span>
              </div>
              <div className="p-2 bg-white/5 rounded-xl">
                <span className="text-[10px] text-gray-400 block uppercase">Memory Cap</span>
                <span className="text-base font-black text-white">64 MB</span>
              </div>
            </div>
          </div>

          {/* Interactive Gate & Mascot Card */}
          <div className="lg:col-span-5 flex flex-col justify-between p-6 sm:p-8 bg-white brutal-border brutal-shadow-xl rounded-3xl space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-black uppercase text-gray-400">Progression State</span>
                {isLive ? (
                  <span className="px-2.5 py-1 bg-green-500 text-white font-mono text-[10px] font-black uppercase rounded-full animate-pulse">
                    ROUND IS LIVE
                  </span>
                ) : (
                  <span className="px-2.5 py-1 bg-gray-100 text-gray-700 font-mono text-[10px] font-black uppercase rounded-full">
                    STANDBY
                  </span>
                )}
              </div>

              <h4 className="text-2xl font-black text-[#171717]">
                The Gate to Logic
              </h4>

              <p className="text-sm text-gray-600 leading-relaxed font-medium">
                Every coder must prove their foundational grasp before advancing. Passing Round 01 unlocks Round 02: Python.
              </p>

              {/* Visual gate toggle animation */}
              <div className="p-4 bg-[#F7F4ED] rounded-2xl brutal-border space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-gray-700">Gate Status:</span>
                  <span className={`text-xs font-mono font-black uppercase flex items-center gap-1.5 ${isGateOpen ? 'text-green-600' : 'text-[#FF6B35]'}`}>
                    {isGateOpen ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                    {isGateOpen ? 'GATE UNLOCKED' : 'QUALIFICATION REQUIRED'}
                  </span>
                </div>

                <button
                  onClick={() => setIsGateOpen(!isGateOpen)}
                  className="w-full py-2 bg-white hover:bg-gray-50 text-[#171717] font-mono text-xs font-black uppercase rounded-xl border-2 border-[#171717] brutal-shadow-sm transition cursor-pointer"
                >
                  {isGateOpen ? 'Reset Gate Simulation' : 'Simulate Round 01 Completion'}
                </button>
              </div>
            </div>

            {/* Mascot State & Enter Round Action */}
            <div className="flex items-end justify-between pt-4 border-t-2 border-gray-100">
              <div>
                <CodeMascot state={isGateOpen ? 'celebrating' : 'typing'} size={100} showSpeechBubble={false} />
              </div>

              <Link
                href={roundData ? `/compete/${roundData.id}` : '/register'}
                className="px-6 py-3.5 bg-[#3155FF] text-white font-black text-xs uppercase tracking-wider rounded-xl brutal-border brutal-shadow brutal-shadow-hover flex items-center gap-2 transition"
              >
                {isLive ? 'Enter Round 01' : 'Register for Round 01'} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
