'use client';

import React, { useState, useEffect } from 'react';
import { X, Trophy, RefreshCw } from 'lucide-react';
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

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ isOpen, onClose }) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isFrozen, setIsFrozen] = useState<boolean>(false);

  const fetchLeaderboard = () => {
    setLoading(true);
    fetch(`${API_BASE}/leaderboard/status`)
      .then((res) => res.json())
      .then((data) => {
        const s = data.data || data;
        setIsFrozen(!!s.frozen);
      })
      .catch(() => {});

    fetch(`${API_BASE}/leaderboard/live`)
      .then((res) => res.json())
      .then((data) => {
        setEntries(data.data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (isOpen) {
      fetchLeaderboard();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#F7F4ED] w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-3xl brutal-border brutal-shadow-2xl text-[#171717] p-6 sm:p-8 space-y-6 relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-[#171717]/10 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-black uppercase text-[#3155FF]">Live Standing</span>
              {isFrozen && (
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-mono font-black rounded-full uppercase">
                  Frozen
                </span>
              )}
            </div>
            <h3 className="text-2xl sm:text-3xl font-black font-display text-[#171717]">
              COMPETITION LEADERBOARD
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchLeaderboard}
              className="p-2 rounded-full bg-white hover:bg-gray-100 brutal-border cursor-pointer transition text-gray-700"
              title="Refresh Leaderboard"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white hover:bg-gray-100 brutal-border flex items-center justify-center cursor-pointer transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Table / List of Leaders */}
        {entries.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl brutal-border space-y-2">
            <Trophy className="w-10 h-10 text-gray-400 mx-auto" />
            <h4 className="text-base font-black text-gray-700">No Submissions Recorded Yet</h4>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              As participants solve challenges across rounds, live point totals and rankings will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b-2 border-[#171717]/20 text-gray-500 uppercase text-[10px]">
                    <th className="py-2.5 px-3">Rank</th>
                    <th className="py-2.5 px-3">Participant</th>
                    <th className="py-2.5 px-3">College</th>
                    <th className="py-2.5 px-3 text-right">Solved</th>
                    <th className="py-2.5 px-3 text-right">Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {entries.map((entry, idx) => (
                    <tr
                      key={entry.participantId || idx}
                      className={idx === 0 ? 'bg-[#FFD84D]/20 font-bold' : idx < 3 ? 'bg-white font-bold' : 'hover:bg-gray-50'}
                    >
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5">
                          {idx === 0 ? (
                            <span className="w-6 h-6 rounded-full bg-[#171717] text-[#FFD84D] flex items-center justify-center font-black text-[11px]">
                              1
                            </span>
                          ) : idx === 1 ? (
                            <span className="w-6 h-6 rounded-full bg-gray-300 text-[#171717] flex items-center justify-center font-black text-[11px]">
                              2
                            </span>
                          ) : idx === 2 ? (
                            <span className="w-6 h-6 rounded-full bg-[#FF6B35]/30 text-[#FF6B35] flex items-center justify-center font-black text-[11px]">
                              3
                            </span>
                          ) : (
                            <span className="text-gray-500 pl-2">#{entry.rank || idx + 1}</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-3 font-sans font-bold text-gray-900">{entry.fullName}</td>
                      <td className="py-3 px-3 text-gray-600 text-[11px] truncate max-w-[150px]">{entry.collegeName}</td>
                      <td className="py-3 px-3 text-right">{entry.solvedCount || 0}</td>
                      <td className="py-3 px-3 text-right text-[#3155FF] font-black">{entry.totalScore} pts</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-4 border-t-2 border-[#171717]/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-[#171717] text-white font-mono text-xs font-black uppercase rounded-xl hover:bg-gray-800 transition cursor-pointer"
          >
            Close Leaderboard
          </button>
        </div>
      </div>
    </div>
  );
};
