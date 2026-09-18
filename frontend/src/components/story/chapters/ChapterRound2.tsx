'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Zap, RefreshCw } from 'lucide-react';
import { CodeMascot } from '@/components/mascot/CodeMascot';

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
  const [showPythonTransformation, setShowPythonTransformation] = useState<boolean>(true);

  const duration = roundData?.durationMinutes || 45;
  const questions = roundData?.questionCount || 10;
  const isLive = roundData?.status === 'LIVE';

  return (
    <div className="py-20 border-t-2 border-[#171717]/10 relative bg-[#F7F4ED]">
      <div className="space-y-10">
        {/* Chapter Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="px-3.5 py-1 bg-[#FF6B35] text-white font-mono text-xs font-black uppercase rounded-md brutal-border brutal-shadow-sm">
              Round 02
            </span>
            <span className="font-mono text-xs font-bold text-[#FF6B35] uppercase tracking-wider">
              The Logic
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#FFD84D]"></span>
            <span className="font-mono text-xs font-bold text-gray-600">Language: Python 3.11</span>
          </div>
        </div>

        {/* Big Editorial Headline */}
        <div className="space-y-2">
          <div className="text-6xl sm:text-8xl md:text-9xl font-black text-[#171717] font-display tracking-tighter leading-none">
            PYTHON
          </div>
          <p className="text-2xl sm:text-3xl font-black text-[#171717] uppercase tracking-tight">
            THINK SMARTER. SOLVE FASTER.
          </p>
          <p className="text-sm sm:text-base text-gray-700 max-w-2xl font-medium leading-relaxed">
            Where brute force fails, elegant algorithms conquer. Rapid list comprehension, dictionary hashes, graph traversals, and dynamic programming under the pressure of the clock.
          </p>
        </div>

        {/* C -> Python Metamorphosis and Editorial Snake Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Metamorphosis Interactive Code Comparison */}
          <div className="lg:col-span-7 bg-[#171717] text-white p-6 sm:p-8 rounded-3xl brutal-border brutal-shadow-xl font-mono text-xs sm:text-sm flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <span className="text-xs font-bold text-[#FFD84D] uppercase flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#FFD84D]" />
                Metamorphosis: C &rarr; Python
              </span>
              <button
                onClick={() => setShowPythonTransformation(!showPythonTransformation)}
                className="px-2.5 py-1 text-[11px] bg-white/10 hover:bg-white/20 rounded font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                {showPythonTransformation ? 'View in C' : 'Morph to Python'}
              </button>
            </div>

            <div className="min-h-[160px] flex flex-col justify-center">
              {showPythonTransformation ? (
                <div className="space-y-2 text-[#B8E63E] transition-all">
                  <p className="text-gray-400 font-sans text-xs">{'// Python 3 — 3 lines of pure algorithmic intuition'}</p>
                  <p className="text-white font-bold">def shortest_path(graph, start, end):</p>
                  <p className="pl-4 text-[#FFD84D]">q, seen = deque([(start, 0)]), &#123;start&#125;</p>
                  <p className="pl-4 text-[#B8E63E]">return bfs_search(q, seen, target=end)</p>
                </div>
              ) : (
                <div className="space-y-1 text-gray-400 transition-all">
                  <p className="text-gray-500 font-sans text-xs">{'// Equivalent low-level pointer traversal in C'}</p>
                  <p className="text-gray-300">Queue* q = createQueue(MAX_VERTICES);</p>
                  <p className="text-gray-300">bool visited[MAX_VERTICES] = &#123;false&#125;;</p>
                  <p className="text-gray-300">enqueue(q, startNode);</p>
                  <p className="text-gray-300">while (!isEmpty(q)) &#123; ... &#125;</p>
                </div>
              )}
            </div>

            {/* Dynamic round stats */}
            <div className="pt-6 mt-6 border-t border-white/10 grid grid-cols-3 gap-2 text-center">
              <div className="p-2 bg-white/5 rounded-xl">
                <span className="text-[10px] text-gray-400 block uppercase">Questions</span>
                <span className="text-base font-black text-[#FF6B35]">{questions} Questions</span>
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

          {/* Editorial Snake Illustration & Round Action */}
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

              {/* Refined Vector Editorial Snake (minimalist geometric art) */}
              <div className="py-2 flex items-center justify-center">
                <svg width="180" height="70" viewBox="0 0 180 70" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M10 45 C 30 10, 50 10, 70 45 C 90 80, 110 80, 130 45 C 145 20, 160 25, 170 35"
                    stroke="#FF6B35"
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Eyes & Tongue */}
                  <circle cx="168" cy="32" r="2.5" fill="#171717" />
                  <path d="M174 37 L182 37 M182 37 L185 34 M182 37 L185 40" stroke="#FF6B35" strokeWidth="2" strokeLinecap="round" />
                  {/* Geometric accents */}
                  <circle cx="70" cy="45" r="3" fill="#B8E63E" />
                  <circle cx="130" cy="45" r="3" fill="#3155FF" />
                </svg>
              </div>

              <h4 className="text-2xl font-black text-[#171717]">
                The Logic Accelerates
              </h4>

              <p className="text-sm text-gray-600 leading-relaxed font-medium">
                Speed matters, but correctness is king. In Python, test cases test boundary anomalies, empty arrays, and astronomical integer limits.
              </p>
            </div>

            {/* Mascot State & Enter Round Action */}
            <div className="flex items-end justify-between pt-4 border-t-2 border-gray-100">
              <div>
                <CodeMascot state="running" size={100} showSpeechBubble={false} />
              </div>

              <Link
                href={roundData ? `/compete/${roundData.id}` : '/register'}
                className="px-6 py-3.5 bg-[#FF6B35] text-white font-black text-xs uppercase tracking-wider rounded-xl brutal-border brutal-shadow brutal-shadow-hover flex items-center gap-2 transition"
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
