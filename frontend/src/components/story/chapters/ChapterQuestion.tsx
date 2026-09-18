'use client';

import React, { useState, useEffect } from 'react';
import { ArrowDown, CheckCircle, XCircle, RefreshCw, Sparkles, Terminal } from 'lucide-react';
import { CodeMascot } from '@/components/mascot/CodeMascot';

type SimState = 'idle' | 'running_1' | 'wrong' | 'thinking' | 'running_2' | 'accepted';

export const ChapterQuestion: React.FC = () => {
  const [simState, setSimState] = useState<SimState>('idle');
  const [hasStarted, setHasStarted] = useState<boolean>(false);

  const startSimulation = () => {
    setSimState('running_1');
    setTimeout(() => {
      setSimState('wrong');
      setTimeout(() => {
        setSimState('thinking');
        setTimeout(() => {
          setSimState('running_2');
          setTimeout(() => {
            setSimState('accepted');
          }, 1400);
        }, 1800);
      }, 2000);
    }, 1500);
  };

  useEffect(() => {
    // Auto-trigger simulation when scrolled into view or after mount
    const timer = setTimeout(() => {
      if (!hasStarted) {
        setHasStarted(true);
        startSimulation();
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [hasStarted]);

  const getMascotState = () => {
    switch (simState) {
      case 'running_1':
      case 'running_2':
        return 'typing';
      case 'wrong':
        return 'failure';
      case 'thinking':
        return 'thinking';
      case 'accepted':
        return 'success';
      default:
        return 'idle';
    }
  };

  return (
    <section id="think" className="min-h-screen py-24 px-4 flex flex-col justify-center border-t-2 border-[#171717]/10 bg-[#FDFBF7]">
      <div className="max-w-5xl mx-auto w-full space-y-12">
        {/* Chapter Header */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-[#FFD84D] text-[#171717] font-mono text-xs font-black uppercase rounded-md brutal-border brutal-shadow-sm">
              Chapter 02 — Think
            </span>
            <span className="text-xs font-mono font-bold text-gray-400">THE QUESTION</span>
          </div>

          <h2 className="text-5xl sm:text-7xl md:text-8xl font-black text-[#171717] tracking-tight font-display leading-tight">
            CAN YOU <br className="hidden sm:inline" />
            <span className="text-[#FF6B35]">SOLVE IT?</span>
          </h2>
        </div>

        {/* Problem Card & Interactive Test Box */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Problem Statement Editorial Note */}
          <div className="lg:col-span-6 space-y-6">
            <div className="p-6 sm:p-8 bg-white brutal-border brutal-shadow-lg rounded-2xl space-y-4 relative">
              <div className="flex items-center justify-between border-b-2 border-gray-100 pb-3">
                <span className="font-mono text-xs font-black text-[#3155FF] uppercase">Problem 01 // Sample Logic</span>
                <span className="text-xs font-mono px-2 py-0.5 bg-gray-100 rounded text-gray-600">Difficulty: Initial</span>
              </div>

              <h3 className="text-2xl font-black text-[#171717]">Find the Missing Invariant</h3>
              <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                Given an array of integers <code className="bg-[#F7F4ED] px-1.5 py-0.5 rounded font-mono text-xs font-bold text-[#171717]">nums</code> of size <code className="bg-[#F7F4ED] px-1.5 py-0.5 rounded font-mono text-xs font-bold text-[#171717]">n</code> containing numbers from <code className="bg-[#F7F4ED] px-1.5 py-0.5 rounded font-mono text-xs font-bold text-[#171717]">0..n</code>, return the unique number that is missing from the range without extra space.
              </p>

              <div className="bg-[#F7F4ED] p-4 rounded-xl border border-gray-200 font-mono text-xs space-y-2">
                <div><strong className="text-gray-900">Input:</strong> nums = [3, 0, 1]</div>
                <div><strong className="text-gray-900">Expected:</strong> 2</div>
              </div>
            </div>

            {/* Emotional Story Quote */}
            <div className="p-6 bg-[#3155FF]/5 border-l-4 border-[#3155FF] rounded-r-2xl space-y-2">
              <p className="text-lg sm:text-xl font-black text-[#171717] font-display italic">
                &ldquo;Not every solution works the first time.&rdquo;
              </p>
              <p className="text-sm text-gray-600 font-medium">
                That is how programmers learn. Every red test case is just logic waiting to be refined.
              </p>
            </div>
          </div>

          {/* Right: Simulated Interactive Execution & Mascot Reaction */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-[#171717] text-white p-6 rounded-2xl brutal-border brutal-shadow-lg relative overflow-hidden font-mono">
              <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-[#B8E63E]" />
                  <span className="text-xs font-bold text-gray-300">Live Test Simulation</span>
                </div>
                <button
                  onClick={() => startSimulation()}
                  disabled={simState === 'running_1' || simState === 'running_2'}
                  className="px-2.5 py-1 text-[11px] bg-white/10 hover:bg-white/20 rounded font-bold transition flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" /> Re-run Sim
                </button>
              </div>

              {/* Code snippet showing first try vs fix */}
              <div className="text-xs sm:text-sm space-y-1 text-gray-400">
                {simState === 'wrong' || simState === 'running_1' ? (
                  <>
                    <p className="text-gray-500">{'// Attempt 1: Naive summation'}</p>
                    <p className="text-white">int sum = 0;</p>
                    <p className="text-white">for (int i = 0; i &lt; n - 1; i++) sum += nums[i];</p>
                    <p className="text-[#FF6B35]">return total - sum; <span className="text-red-400">{'// Off-by-one bug'}</span></p>
                  </>
                ) : (
                  <>
                    <p className="text-gray-500">{'// Attempt 2: XOR bitwise invariant'}</p>
                    <p className="text-white">int xor = n;</p>
                    <p className="text-white">for (int i = 0; i &lt; n; i++) xor ^= i ^ nums[i];</p>
                    <p className="text-[#B8E63E]">return xor; <span className="text-green-400">{'// O(N) Time, O(1) Space'}</span></p>
                  </>
                )}
              </div>

              {/* Status Output Box */}
              <div className="mt-6 pt-4 border-t border-white/10 min-h-[72px] flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-gray-400 uppercase tracking-wider block">Execution Status</span>
                  {simState === 'running_1' || simState === 'running_2' ? (
                    <div className="text-[#FFD84D] font-bold text-sm flex items-center gap-2 mt-1">
                      <span className="w-2 h-2 rounded-full bg-[#FFD84D] animate-ping" />
                      RUNNING TEST CASES...
                    </div>
                  ) : simState === 'wrong' ? (
                    <div className="text-[#EF4444] font-bold text-sm flex items-center gap-2 mt-1">
                      <XCircle className="w-4 h-4" />
                      ✕ WRONG ANSWER (Test Case 4 Failed)
                    </div>
                  ) : simState === 'thinking' ? (
                    <div className="text-[#3155FF] font-bold text-sm flex items-center gap-2 mt-1">
                      <Sparkles className="w-4 h-4 text-[#FFD84D]" />
                      ANALYZING OFF-BY-ONE INVARIANT...
                    </div>
                  ) : simState === 'accepted' ? (
                    <div className="text-[#B8E63E] font-bold text-sm flex items-center gap-2 mt-1">
                      <CheckCircle className="w-4 h-4 text-[#B8E63E]" />
                      ✓ ACCEPTED (Runtime: 1ms, Beats 99.4%)
                    </div>
                  ) : (
                    <div className="text-gray-500 text-sm mt-1">Ready for compilation</div>
                  )}
                </div>

                {/* Live reaction mascot badge */}
                <div className="hidden sm:block">
                  <CodeMascot state={getMascotState()} size={90} showSpeechBubble={false} />
                </div>
              </div>
            </div>

            {/* Mobile Mascot Display */}
            <div className="sm:hidden flex items-center justify-center p-4 bg-white rounded-2xl brutal-border">
              <CodeMascot state={getMascotState()} size={110} />
            </div>

            <div className="flex items-center justify-between pt-2">
              <a
                href="#code"
                className="text-xs font-mono font-black text-[#3155FF] uppercase tracking-wider flex items-center gap-2 hover:underline"
              >
                Proceed to the Sandbox <ArrowDown className="w-3.5 h-3.5" />
              </a>
              <span className="text-xs font-mono text-gray-500">
                Resilience &gt; Perfection
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
