'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, RefreshCw } from 'lucide-react';
import { CodeMascot } from '@/components/mascot/CodeMascot';
import { SteamingMugIcon, LogicBoltIcon } from '@/components/icons/CustomIcons';

interface ChapterRound2Props {
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

export const ChapterRound2: React.FC<ChapterRound2Props> = ({ roundData }) => {
  const [showJavaTransformation, setShowJavaTransformation] = useState<boolean>(true);

  const duration = roundData?.durationMinutes || 45;
  const questions = roundData?.questionCount || 5;
  const isLive = roundData?.status === 'LIVE';

  return (
    <div className="py-20 border-t-2 border-[#171717]/10 relative bg-[#F7F4ED]">
      <div className="space-y-10">
        {/* Chapter Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="px-3.5 py-1 bg-[#8B5CF6] text-white font-mono text-xs font-black uppercase rounded-md brutal-border brutal-shadow-sm">
              Round 02
            </span>
            <span className="font-mono text-xs font-bold text-[#8B5CF6] uppercase tracking-wider">
              The Logic
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#FFD84D]"></span>
            <span className="font-mono text-xs font-bold text-gray-600">Language: Java 17</span>
          </div>
        </div>

        {/* Big Editorial Headline */}
        <div className="space-y-2">
          <div className="text-6xl sm:text-8xl md:text-9xl font-black text-[#171717] font-display tracking-tighter leading-none">
            JAVA
          </div>
          <p className="text-2xl sm:text-3xl font-black text-[#171717] uppercase tracking-tight">
            THINK STRUCTURED. SOLVE POWERFUL.
          </p>
          <p className="text-sm sm:text-base text-gray-700 max-w-2xl font-medium leading-relaxed">
            Where raw pointers evolve into robust object-oriented architecture. Conquer LRU caches, array algorithms, 3Sum two-pointer sweeps, and breadth-first search with industrial precision.
          </p>
        </div>

        {/* C -> Java Metamorphosis and Editorial Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Metamorphosis Interactive Code Comparison */}
          <div className="lg:col-span-7 bg-[#171717] text-white p-6 sm:p-8 rounded-3xl brutal-border brutal-shadow-xl font-mono text-xs sm:text-sm flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <span className="text-xs font-bold text-[#FFD84D] uppercase flex items-center gap-2">
                <LogicBoltIcon size={18} />
                Metamorphosis: C &rarr; Java
              </span>
              <button
                onClick={() => setShowJavaTransformation(!showJavaTransformation)}
                className="px-2.5 py-1 text-[11px] bg-white/10 hover:bg-white/20 rounded font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                {showJavaTransformation ? 'View in C' : 'Morph to Java'}
              </button>
            </div>

            {/* Code Body Preview */}
            <div className="py-2">
              {showJavaTransformation ? (
                <div className="space-y-2 text-[#B8E63E] transition-all">
                  <p className="text-gray-400 font-sans text-xs">{'// Java 17 — Clean object-oriented collections & graph logic'}</p>
                  <p className="text-white font-bold">public static int[] productExceptSelf(int[] nums) &#123;</p>
                  <p className="pl-4 text-[#FFD84D]">int[] ans = new int[nums.length];</p>
                  <p className="pl-4 text-[#B8E63E]">for (int i = 0, p = 1; i &lt; nums.length; p *= nums[i++]) ans[i] = p;</p>
                  <p className="text-white font-bold">&#125;</p>
                </div>
              ) : (
                <div className="space-y-1 text-gray-400 transition-all">
                  <p className="text-gray-500 font-sans text-xs">{'// Equivalent low-level pointer management in C'}</p>
                  <p className="text-gray-300">int* ans = (int*)malloc(n * sizeof(int));</p>
                  <p className="text-gray-300">if (!ans) return NULL;</p>
                  <p className="text-gray-300">for (int i = 0; i &lt; n; i++) &#123; ... &#125;</p>
                </div>
              )}
            </div>

            {/* Dynamic round stats */}
            <div className="pt-6 mt-6 border-t border-white/10 grid grid-cols-3 gap-2 text-center">
              <div className="p-2 bg-white/5 rounded-xl">
                <span className="text-[10px] text-gray-400 block uppercase">Questions</span>
                <span className="text-base font-black text-[#8B5CF6]">{questions} Questions</span>
              </div>
              <div className="p-2 bg-white/5 rounded-xl">
                <span className="text-[10px] text-gray-400 block uppercase">Duration</span>
                <span className="text-base font-black text-[#FFD84D]">{duration} Minutes</span>
              </div>
              <div className="p-2 bg-white/5 rounded-xl">
                <span className="text-[10px] text-gray-400 block uppercase">Attempts</span>
                <span className="text-base font-black text-white">1 Final Chance</span>
              </div>
            </div>
          </div>

          {/* Editorial Java Card & Round Action */}
          <div className="lg:col-span-5 flex flex-col justify-between p-6 sm:p-8 bg-white brutal-border brutal-shadow-xl rounded-3xl space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-black uppercase text-gray-400">Round 02 State</span>
                {isLive ? (
                  <span className="px-2.5 py-1 bg-green-500 text-white font-mono text-[10px] font-black uppercase rounded-full animate-pulse">
                    ROUND IS LIVE
                  </span>
                ) : (
                  <span className="px-2.5 py-1 bg-gray-100 text-gray-700 font-mono text-[10px] font-black uppercase rounded-full">
                    UPCOMING
                  </span>
                )}
              </div>

              {/* Bespoke Java Badge */}
              <div className="py-3 flex items-center justify-center">
                <div className="p-4 bg-[#8B5CF6]/10 rounded-2xl brutal-border brutal-shadow-sm flex items-center gap-3">
                  <SteamingMugIcon size={44} />
                  <div className="text-left font-mono">
                    <span className="text-xs font-black text-[#171717] block">JAVA ARCHITECTURE</span>
                    <span className="text-[10px] text-gray-600">Enterprise OOP &amp; Robust Algorithms</span>
                  </div>
                </div>
              </div>

              <h4 className="text-2xl font-black text-[#171717]">
                The Logic Accelerates
              </h4>

              <p className="text-sm text-gray-600 leading-relaxed font-medium">
                Speed matters, but correctness is king. In Java, test cases test boundary anomalies, null safety, and time complexity bounds.
              </p>
            </div>

            {/* Mascot State & Enter Round Action */}
            <div className="flex items-end justify-between pt-4 border-t-2 border-gray-100">
              <div>
                <CodeMascot state="running" size={100} showSpeechBubble={false} />
              </div>

              <Link
                href={roundData ? `/compete/${roundData.id}` : '/register'}
                className="px-6 py-3.5 bg-[#8B5CF6] text-white font-black text-xs uppercase tracking-wider rounded-xl brutal-border brutal-shadow brutal-shadow-hover flex items-center gap-2 transition"
              >
                {isLive ? 'Enter Round 02' : 'Register for Round 02'} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
