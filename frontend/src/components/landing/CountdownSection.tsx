'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Clock, Zap } from 'lucide-react';

export const CountdownSection: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 8,
    hours: 14,
    minutes: 32,
    seconds: 45
  });
  const [activeRoundTitle, setActiveRoundTitle] = useState<string>('Round 01 — C');
  const [remainingSeconds, setRemainingSeconds] = useState<number>(2700);

  useEffect(() => {
    // Fetch active round or schedule from backend
    api.rounds.getAll()
      .then((rounds: any[]) => {
        const live = rounds.find(r => r.status === 'LIVE');
        if (live && live.remainingSeconds > 0) {
          setActiveRoundTitle(live.title);
          setRemainingSeconds(live.remainingSeconds);
        }
      })
      .catch(() => {});

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else if (prev.days > 0) {
          return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        }
        return prev;
      });

      setRemainingSeconds(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatSec = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <section className="bg-[#171717] text-white py-16 px-4 border-y-4 border-[#171717]">
      <div className="max-w-6xl mx-auto text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-mono font-bold tracking-wider text-[#FFD84D]">
          <Zap className="w-3.5 h-3.5" /> LIVE COMPETITION ENGINE SYNCHRONIZED
        </div>

        <div className="space-y-2">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black font-display tracking-tight text-[#F7F4ED]">
            THE COUNTDOWN BEGINS
          </h2>
          <p className="text-gray-400 font-medium text-sm sm:text-base max-w-xl mx-auto">
            Server-authoritative timing. When zero strikes, compilers lock and the submission window closes.
          </p>
        </div>

        {/* Big Digit Blocks */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 max-w-3xl mx-auto">
          <div className="bg-[#242424] p-6 rounded-2xl border-2 border-white/10 brutal-shadow">
            <div className="text-5xl sm:text-6xl font-black font-display text-[#B8E63E]">
              {timeLeft.days.toString().padStart(2, '0')}
            </div>
            <div className="text-xs font-mono uppercase tracking-widest text-gray-400 mt-2">
              DAYS
            </div>
          </div>

          <div className="bg-[#242424] p-6 rounded-2xl border-2 border-white/10 brutal-shadow">
            <div className="text-5xl sm:text-6xl font-black font-display text-[#3155FF]">
              {timeLeft.hours.toString().padStart(2, '0')}
            </div>
            <div className="text-xs font-mono uppercase tracking-widest text-gray-400 mt-2">
              HOURS
            </div>
          </div>

          <div className="bg-[#242424] p-6 rounded-2xl border-2 border-white/10 brutal-shadow">
            <div className="text-5xl sm:text-6xl font-black font-display text-[#FF6B35]">
              {timeLeft.minutes.toString().padStart(2, '0')}
            </div>
            <div className="text-xs font-mono uppercase tracking-widest text-gray-400 mt-2">
              MINUTES
            </div>
          </div>

          <div className="bg-[#242424] p-6 rounded-2xl border-2 border-white/10 brutal-shadow">
            <div className="text-5xl sm:text-6xl font-black font-display text-[#FFD84D] animate-pulse">
              {timeLeft.seconds.toString().padStart(2, '0')}
            </div>
            <div className="text-xs font-mono uppercase tracking-widest text-gray-400 mt-2">
              SECONDS
            </div>
          </div>
        </div>

        {/* Live Round Banner */}
        <div className="pt-4 flex items-center justify-center gap-3 text-xs sm:text-sm font-mono text-gray-300">
          <Clock className="w-4 h-4 text-[#FF6B35]" />
          <span>ACTIVE ARENA: <strong className="text-white">{activeRoundTitle}</strong></span>
          <span className="text-gray-500">•</span>
          <span>REMAINING: <strong className="text-[#B8E63E]">{formatSec(remainingSeconds)}</strong></span>
        </div>
      </div>
    </section>
  );
};
