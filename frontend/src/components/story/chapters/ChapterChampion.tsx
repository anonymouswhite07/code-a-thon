'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Trophy, ArrowDown, Sparkles } from 'lucide-react';
import { CodeMascot } from '@/components/mascot/CodeMascot';
import { API_BASE } from '@/lib/api';

interface LeaderboardEntry {
  participantId: number;
  fullName: string;
  collegeName: string;
  totalScore: number;
  rank: number;
  solvedCount: number;
  totalTimeSeconds: number;
}

export const ChapterChampion: React.FC = () => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isPublished, setIsPublished] = useState<boolean>(false);
  const [isFrozen, setIsFrozen] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch status
        const statusRes = await fetch(`${API_BASE}/leaderboard/status`);
        if (statusRes.ok) {
          const statusJson = await statusRes.json();
          const s = statusJson.data || statusJson;
          setIsPublished(!!s.finalResultsPublished);
          setIsFrozen(!!s.frozen);
        }

        // Fetch live leaderboard
        const lbRes = await fetch(`${API_BASE}/leaderboard/live`);
        if (lbRes.ok) {
          const lbJson = await lbRes.json();
          const list: LeaderboardEntry[] = lbJson.data || [];
          setEntries(list);
        }
      } catch {
        // Silent catch for resilience if backend is unreachable
      }
    };

    fetchData();
  }, []);

  const firstPlace = entries[0];
  const secondPlace = entries[1];
  const thirdPlace = entries[2];

  return (
    <section id="champion" className="min-h-screen py-32 px-4 flex flex-col justify-center relative bg-[#F7F4ED] border-t-2 border-[#171717]/10">
      <div className="max-w-5xl mx-auto w-full space-y-16 text-center">
        {/* Dramatic Poetic Pause */}
        <div className="space-y-6 max-w-3xl mx-auto">
          <p className="font-mono text-sm uppercase tracking-widest text-gray-500 font-bold">
            Chapter 06 &bull; The Culmination
          </p>

          <div className="space-y-3 text-lg sm:text-2xl font-black text-gray-400 uppercase tracking-widest font-mono">
            <p className="hover:text-[#171717] transition-colors">Three languages.</p>
            <p className="hover:text-[#171717] transition-colors">Three rounds.</p>
            <p className="hover:text-[#171717] transition-colors">Hundreds of minds.</p>
          </div>

          <div className="pt-6">
            <h2 className="text-6xl sm:text-8xl md:text-9xl font-black text-[#171717] font-display tracking-tight leading-none">
              ONE <span className="text-[#3155FF]">CHAMPION.</span>
            </h2>
          </div>
        </div>

        {/* Generous dramatic breathing space before trophy reveal */}
        <div className="py-6 flex flex-col items-center justify-center">
          {/* Trophy & Mascot Duo */}
          <div className="relative inline-block">
            <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-[#FFD84D]/30 flex items-center justify-center mx-auto brutal-border brutal-shadow-lg animate-pulse">
              <Trophy className="w-16 h-16 sm:w-20 sm:h-20 text-[#171717] fill-[#FFD84D]" />
            </div>
            <div className="absolute -bottom-4 -right-10 hidden sm:block">
              <CodeMascot state="winner" size={100} showSpeechBubble={false} />
            </div>
          </div>
        </div>

        {/* Live Podium or Revelation Notice */}
        {isPublished && entries.length > 0 ? (
          /* Official Published Podium */
          <div className="space-y-6">
            <div className="inline-block px-4 py-1 bg-[#10B981] text-white font-mono text-xs font-black uppercase rounded-full">
              Official Results Published
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end max-w-4xl mx-auto pt-6">
              {/* 2nd Place */}
              {secondPlace && (
                <div className="order-2 md:order-1 p-6 bg-white brutal-border brutal-shadow-md rounded-2xl space-y-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 text-[#171717] font-black text-sm flex items-center justify-center mx-auto">
                    2
                  </div>
                  <h4 className="text-xl font-black text-[#171717] truncate">{secondPlace.fullName}</h4>
                  <p className="text-xs font-mono text-gray-500 truncate">{secondPlace.collegeName}</p>
                  <div className="pt-2 border-t font-mono text-sm font-black text-[#3155FF]">
                    {secondPlace.totalScore} PTS
                  </div>
                </div>
              )}

              {/* 1st Place Champion */}
              {firstPlace && (
                <div className="order-1 md:order-2 p-8 bg-[#FFD84D] brutal-border brutal-shadow-xl rounded-2xl space-y-4 transform md:-translate-y-4">
                  <div className="w-12 h-12 rounded-full bg-[#171717] text-[#FFD84D] font-black text-lg flex items-center justify-center mx-auto">
                    1
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-mono font-black uppercase tracking-widest text-[#171717]">Grand Champion</span>
                    <h3 className="text-2xl sm:text-3xl font-black text-[#171717] truncate">{firstPlace.fullName}</h3>
                  </div>
                  <p className="text-xs font-mono text-gray-800 font-bold truncate">{firstPlace.collegeName}</p>
                  <div className="pt-3 border-t-2 border-[#171717] font-mono text-lg font-black text-[#171717]">
                    {firstPlace.totalScore} POINTS
                  </div>
                </div>
              )}

              {/* 3rd Place */}
              {thirdPlace && (
                <div className="order-3 p-6 bg-white brutal-border brutal-shadow-md rounded-2xl space-y-3">
                  <div className="w-10 h-10 rounded-full bg-[#FF6B35]/20 text-[#FF6B35] font-black text-sm flex items-center justify-center mx-auto">
                    3
                  </div>
                  <h4 className="text-xl font-black text-[#171717] truncate">{thirdPlace.fullName}</h4>
                  <p className="text-xs font-mono text-gray-500 truncate">{thirdPlace.collegeName}</p>
                  <div className="pt-2 border-t font-mono text-sm font-black text-[#FF6B35]">
                    {thirdPlace.totalScore} PTS
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Before / During Competition Placeholder */
          <div className="max-w-xl mx-auto p-8 bg-white brutal-border brutal-shadow-lg rounded-3xl space-y-4 text-center">
            <div className="flex items-center justify-center gap-2 text-xs font-mono font-bold text-gray-500 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-[#FFD84D]" />
              {isFrozen ? 'Leaderboard Frozen for Final Review' : 'Battle In Progress'}
            </div>

            <h3 className="text-2xl sm:text-3xl font-black text-[#171717] tracking-tight">
              THE CHAMPION WILL BE REVEALED HERE.
            </h3>

            <p className="text-sm text-gray-600 font-medium leading-relaxed">
              When the final round ends and the judges sign off on the automated test suite, the official winners will appear on this live podium.
            </p>

            <div className="pt-3">
              <Link
                href="/login"
                className="inline-block text-xs font-mono font-black text-[#3155FF] uppercase tracking-wider underline hover:text-[#FF6B35] transition-colors"
              >
                View Live Event Stream &rarr;
              </Link>
            </div>
          </div>
        )}

        {/* Link to next chapter */}
        <div className="pt-10">
          <a
            href="#story"
            className="inline-flex items-center gap-2 text-xs font-mono font-black text-gray-600 uppercase tracking-wider hover:text-[#171717]"
          >
            The Journey Continues &bull; Every Coder Has a Story <ArrowDown className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </section>
  );
};
