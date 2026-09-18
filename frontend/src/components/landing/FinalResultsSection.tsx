'use client';

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Sparkles, Award, Star, ArrowDown } from 'lucide-react';
import { api } from '@/lib/api';

export const FinalResultsSection: React.FC = () => {
  const [step, setStep] = useState<number>(0);
  const [revealed, setRevealed] = useState<boolean>(false);
  const [winners, setWinners] = useState<any[]>([]);

  useEffect(() => {
    api.leaderboard.getLive()
      .then((data: any[]) => {
        setWinners(data.slice(0, 3));
      })
      .catch(() => {});
  }, []);

  const triggerReveal = () => {
    setStep(1);
    setTimeout(() => {
      setStep(2);
      setTimeout(() => {
        setStep(3);
        setRevealed(true);
        // Trigger restrained confetti
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      }, 1500);
    }, 1500);
  };

  return (
    <section className="py-24 px-4 bg-[#171717] text-white border-b-2 border-[#171717] relative overflow-hidden">
      {/* Background subtle glow */}
      <div className="max-w-5xl mx-auto text-center space-y-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FF6B35] text-white font-mono text-xs font-black brutal-border uppercase">
          <Sparkles className="w-3.5 h-3.5" /> Grand Finale Protocol
        </div>

        {!revealed ? (
          <div className="py-12 space-y-8 min-h-[320px] flex flex-col items-center justify-center">
            {step === 0 && (
              <div className="space-y-6">
                <h3 className="text-4xl sm:text-6xl font-black font-display tracking-tight text-[#F7F4ED]">
                  THE CODE HAS BEEN WRITTEN.
                </h3>
                <p className="text-gray-400 max-w-md mx-auto text-sm">
                  Three rounds concluded. All test suites verified. The judges have signed off on the results.
                </p>
                <button
                  onClick={triggerReveal}
                  className="px-8 py-3.5 bg-[#FFD84D] text-[#171717] font-black text-sm uppercase tracking-wider rounded-xl brutal-border brutal-shadow brutal-shadow-hover transition-transform"
                >
                  Unveil The 2026 Champions 🏆
                </button>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4 animate-fade-in">
                <div className="text-2xl sm:text-3xl font-mono text-[#FFD84D]">
                  PROCESSING SUBMISSION LOGS...
                </div>
                <h3 className="text-5xl sm:text-7xl font-black font-display text-white">
                  THE CODE <br /> HAS BEEN WRITTEN.
                </h3>
                <ArrowDown className="w-8 h-8 text-[#FF6B35] mx-auto animate-bounce" />
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4 animate-fade-in">
                <div className="text-2xl sm:text-3xl font-mono text-[#B8E63E]">
                  VERIFYING MAXIMUM SCORES...
                </div>
                <h3 className="text-5xl sm:text-7xl font-black font-display text-[#B8E63E]">
                  THE CHAMPIONS <br /> HAVE ARRIVED.
                </h3>
                <div className="text-4xl">👑</div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-12 animate-fade-in">
            <div className="space-y-2">
              <span className="text-4xl">🏆</span>
              <h2 className="text-4xl sm:text-6xl font-black font-display text-[#FFD84D]">
                CODE A-THON 2026 WINNERS
              </h2>
              <p className="text-gray-400 font-medium text-sm">
                Conducted with pride by Gnanamani College of Technology
              </p>
            </div>

            {/* Podium Display */}
            {winners.length >= 3 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pt-4">
                {/* 2nd Place */}
                <div className="bg-[#242424] p-6 rounded-2xl border-2 border-gray-400 brutal-shadow space-y-3 order-2 md:order-1 text-center">
                  <div className="text-4xl">🥈</div>
                  <span className="text-xs font-mono font-black uppercase tracking-wider bg-gray-600 text-white px-3 py-0.5 rounded-full">
                    2ND PLACE
                  </span>
                  <h4 className="text-xl font-black text-white">{winners[1]?.fullName}</h4>
                  <div className="text-xs text-gray-400">{winners[1]?.college}</div>
                  <div className="text-2xl font-mono font-black text-[#3155FF]">
                    {winners[1]?.totalScore} PTS
                  </div>
                  <div className="text-xs text-gray-500 font-mono">
                    Solved: {winners[1]?.solvedCount} Challenges
                  </div>
                </div>

                {/* 1st Place */}
                <div className="bg-[#FFD84D] text-[#171717] p-8 rounded-2xl brutal-border brutal-shadow-lg space-y-4 order-1 md:order-2 text-center transform md:-translate-y-6">
                  <div className="text-6xl animate-bounce">👑</div>
                  <span className="text-xs font-mono font-black uppercase tracking-wider bg-[#171717] text-white px-4 py-1 rounded-full">
                    ★ GRAND CHAMPION ★
                  </span>
                  <h3 className="text-3xl font-black font-display">{winners[0]?.fullName}</h3>
                  <div className="text-xs font-bold text-gray-800">{winners[0]?.college}</div>
                  <div className="text-xs font-mono text-gray-700">{winners[0]?.department}</div>
                  <div className="text-4xl font-mono font-black text-[#171717] pt-2">
                    {winners[0]?.totalScore} PTS
                  </div>
                  <div className="text-xs font-bold font-mono bg-white/50 py-1 px-3 rounded brutal-border inline-block">
                    Full Clear: C, Python, Java
                  </div>
                </div>

                {/* 3rd Place */}
                <div className="bg-[#242424] p-6 rounded-2xl border-2 border-amber-700 brutal-shadow space-y-3 order-3 text-center">
                  <div className="text-4xl">🥉</div>
                  <span className="text-xs font-mono font-black uppercase tracking-wider bg-amber-800 text-white px-3 py-0.5 rounded-full">
                    3RD PLACE
                  </span>
                  <h4 className="text-xl font-black text-white">{winners[2]?.fullName}</h4>
                  <div className="text-xs text-gray-400">{winners[2]?.college}</div>
                  <div className="text-2xl font-mono font-black text-[#FF6B35]">
                    {winners[2]?.totalScore} PTS
                  </div>
                  <div className="text-xs text-gray-500 font-mono">
                    Solved: {winners[2]?.solvedCount} Challenges
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
