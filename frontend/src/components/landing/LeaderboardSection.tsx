'use client';

import React, { useState, useEffect } from 'react';
import { api, subscribeToEvents } from '@/lib/api';
import { Trophy, Search, RefreshCw, Sparkles, Award } from 'lucide-react';

interface Entry {
  rank: number;
  participantId: number;
  fullName: string;
  college: string;
  department: string;
  totalScore: number;
  round1Score: number;
  round2Score: number;
  round3Score: number;
  solvedCount: number;
  totalExecutionTimeMs: number;
}

export const LeaderboardSection: React.FC = () => {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [viewMode, setViewMode] = useState<'LIVE' | 'FINAL'>('LIVE');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [isFrozen, setIsFrozen] = useState(false);

  const fetchLeaderboard = () => {
    setLoading(true);
    api.leaderboard.getLive()
      .then((data: Entry[]) => {
        setEntries(data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    api.leaderboard.getStatus()
      .then((st: any) => {
        setIsFrozen(st?.frozen || false);
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchLeaderboard();

    // Subscribe to SSE updates
    const unsubscribe = subscribeToEvents((event, data) => {
      if (event === 'LEADERBOARD_UPDATED' || event === 'SUBMISSION_COMPLETED') {
        fetchLeaderboard();
      }
      if (event === 'LEADERBOARD_STATUS_CHANGED') {
        setIsFrozen(data.frozen);
      }
    });

    return () => unsubscribe();
  }, []);

  const filtered = entries.filter((e) =>
    e.fullName.toLowerCase().includes(search.toLowerCase()) ||
    e.college.toLowerCase().includes(search.toLowerCase()) ||
    e.department.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <section id="leaderboard" className="py-24 px-4 max-w-7xl mx-auto">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FFD84D] text-[#171717] font-mono text-xs font-black brutal-border brutal-shadow-sm uppercase">
              <Trophy className="w-3.5 h-3.5" /> Official Ranks
            </div>
            <h2 className="text-4xl sm:text-5xl font-black font-display tracking-tight text-[#171717]">
              LIVE LEADERBOARD
            </h2>
            <p className="text-base text-gray-700 font-medium">
              Rankings calculated server-side based on test cases passed and execution time.
            </p>
          </div>

          {/* Toggle & Refresh controls */}
          <div className="flex flex-wrap items-center gap-3">
            {isFrozen && (
              <span className="px-3 py-1 bg-amber-100 text-amber-900 border-2 border-amber-600 font-mono text-xs font-black uppercase rounded-lg animate-pulse">
                ❄ LEADERBOARD FROZEN FOR FINAL ROUND
              </span>
            )}

            <div className="inline-flex p-1 bg-white brutal-border rounded-xl">
              <button
                onClick={() => setViewMode('LIVE')}
                className={`px-4 py-1.5 rounded-lg text-xs font-black font-mono transition-colors ${
                  viewMode === 'LIVE' ? 'bg-[#3155FF] text-white' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                LIVE FEED
              </button>
              <button
                onClick={() => setViewMode('FINAL')}
                className={`px-4 py-1.5 rounded-lg text-xs font-black font-mono transition-colors ${
                  viewMode === 'FINAL' ? 'bg-[#FF6B35] text-white' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                FINAL STANDINGS
              </button>
            </div>

            <button
              onClick={fetchLeaderboard}
              className="p-2.5 bg-white brutal-border brutal-shadow-sm rounded-xl hover:bg-gray-50"
              title="Refresh Leaderboard"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Search bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search coder name, department, or college..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white brutal-border rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#3155FF]"
          />
        </div>

        {/* Podium Top 3 Cards for Final Mode */}
        {viewMode === 'FINAL' && entries.length >= 3 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 pb-6">
            {/* 2nd place */}
            <div className="bg-white p-6 rounded-2xl brutal-border brutal-shadow order-2 md:order-1 text-center space-y-2 border-t-8 border-gray-300">
              <span className="text-3xl font-display font-black text-gray-400">#2</span>
              <div className="text-lg font-black text-[#171717]">{entries[1]?.fullName}</div>
              <div className="text-xs text-gray-500 font-mono">{entries[1]?.department}</div>
              <div className="text-2xl font-black font-mono text-[#3155FF] pt-2">{entries[1]?.totalScore} PTS</div>
            </div>

            {/* 1st place */}
            <div className="bg-[#FFD84D] p-8 rounded-2xl brutal-border brutal-shadow-lg order-1 md:order-2 text-center space-y-3 transform md:-translate-y-4">
              <span className="text-5xl">👑</span>
              <div className="text-xs font-mono font-black uppercase tracking-wider bg-[#171717] text-white px-3 py-0.5 rounded-full inline-block">
                GRAND CHAMPION
              </div>
              <div className="text-2xl font-black text-[#171717]">{entries[0]?.fullName}</div>
              <div className="text-xs text-gray-800 font-mono font-bold">{entries[0]?.college}</div>
              <div className="text-4xl font-black font-mono text-[#171717] pt-2">{entries[0]?.totalScore} PTS</div>
            </div>

            {/* 3rd place */}
            <div className="bg-white p-6 rounded-2xl brutal-border brutal-shadow order-3 text-center space-y-2 border-t-8 border-amber-600">
              <span className="text-3xl font-display font-black text-amber-700">#3</span>
              <div className="text-lg font-black text-[#171717]">{entries[2]?.fullName}</div>
              <div className="text-xs text-gray-500 font-mono">{entries[2]?.department}</div>
              <div className="text-2xl font-black font-mono text-[#FF6B35] pt-2">{entries[2]?.totalScore} PTS</div>
            </div>
          </div>
        )}

        {/* Leaderboard Table */}
        <div className="bg-white rounded-2xl brutal-border brutal-shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#171717] text-white font-mono text-xs uppercase tracking-wider border-b-2 border-[#171717]">
                  <th className="p-4 w-16 text-center">Rank</th>
                  <th className="p-4">Participant</th>
                  <th className="p-4">College & Dept</th>
                  <th className="p-4 text-center">R1 (C)</th>
                  <th className="p-4 text-center">R2 (Py)</th>
                  <th className="p-4 text-center">R3 (Java)</th>
                  <th className="p-4 text-right pr-6">Total Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm font-medium">
                {filtered.length > 0 ? (
                  filtered.map((row) => (
                    <tr key={row.participantId} className="hover:bg-amber-50/40 transition-colors">
                      <td className="p-4 text-center font-display font-black">
                        {row.rank === 1 ? (
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#FFD84D] text-[#171717] brutal-border">
                            1
                          </span>
                        ) : row.rank === 2 ? (
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 text-[#171717] brutal-border">
                            2
                          </span>
                        ) : row.rank === 3 ? (
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#FF6B35] text-white brutal-border">
                            3
                          </span>
                        ) : (
                          <span className="font-mono text-gray-600">#{row.rank}</span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-[#171717]">{row.fullName}</div>
                        <div className="text-xs text-gray-400 font-mono">ID: #{row.participantId}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-xs font-bold text-gray-800">{row.college}</div>
                        <div className="text-xs text-gray-500">{row.department}</div>
                      </td>
                      <td className="p-4 text-center font-mono font-bold text-[#3155FF]">
                        {row.round1Score}
                      </td>
                      <td className="p-4 text-center font-mono font-bold text-[#FF6B35]">
                        {row.round2Score}
                      </td>
                      <td className="p-4 text-center font-mono font-bold text-[#171717]">
                        {row.round3Score}
                      </td>
                      <td className="p-4 text-right pr-6">
                        <div className="font-display font-black text-xl text-[#171717]">
                          {row.totalScore}
                        </div>
                        <div className="text-[11px] font-mono text-gray-400">
                          {row.totalExecutionTimeMs}ms
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-gray-500 font-mono">
                      No participants matching query.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
};
