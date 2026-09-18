'use client';

import React, { useState, useEffect } from 'react';
import { X, Clock } from 'lucide-react';
import { API_BASE } from '@/lib/api';

interface RoundDto {
  id: number;
  roundNumber: number;
  title: string;
  subtitle: string;
  language: string;
  durationMinutes: number;
  status: string;
}

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ScheduleModal: React.FC<ScheduleModalProps> = ({ isOpen, onClose }) => {
  const [rounds, setRounds] = useState<RoundDto[]>([]);

  useEffect(() => {
    if (!isOpen) return;

    fetch(`${API_BASE}/rounds`)
      .then((res) => res.json())
      .then((data) => {
        setRounds(data.data || []);
      })
      .catch(() => {});
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#F7F4ED] w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-3xl brutal-border brutal-shadow-2xl text-[#171717] p-6 sm:p-8 space-y-6 relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-[#171717]/10 pb-4">
          <div className="space-y-1">
            <span className="text-xs font-mono font-black uppercase text-[#FF6B35]">Event Timeline</span>
            <h3 className="text-2xl sm:text-3xl font-black font-display text-[#171717]">
              COMPETITION SCHEDULE
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white hover:bg-gray-100 brutal-border flex items-center justify-center cursor-pointer transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dynamic Rounds Schedule */}
        <div className="space-y-4">
          {/* Phase 0 */}
          <div className="p-4 bg-white rounded-2xl brutal-border flex items-start justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[11px] font-mono font-black text-gray-400 uppercase">Phase 01</span>
              <h4 className="text-base font-black text-[#171717]">Registration &amp; Practice Arena</h4>
              <p className="text-xs text-gray-600">
                Online registration, environment validation, and live sandbox practice.
              </p>
            </div>
            <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded text-xs font-mono font-bold">
              OPEN NOW
            </span>
          </div>

          {/* Rounds from Backend */}
          {rounds.map((r) => (
            <div key={r.id} className="p-4 bg-white rounded-2xl brutal-border flex items-start justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[11px] font-mono font-black text-[#3155FF] uppercase">
                  Round 0{r.roundNumber} &bull; {r.language.toUpperCase()}
                </span>
                <h4 className="text-base font-black text-[#171717]">{r.title}</h4>
                <p className="text-xs text-gray-600">{r.subtitle}</p>
                <div className="flex items-center gap-3 pt-1 text-xs font-mono text-gray-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-gray-400" /> {r.durationMinutes} Minutes
                  </span>
                </div>
              </div>
              <span className={`px-2.5 py-1 rounded text-xs font-mono font-black uppercase ${
                r.status === 'LIVE'
                  ? 'bg-red-500 text-white animate-pulse'
                  : r.status === 'COMPLETED'
                  ? 'bg-gray-200 text-gray-700'
                  : 'bg-blue-100 text-[#3155FF]'
              }`}>
                {r.status}
              </span>
            </div>
          ))}

          {/* Phase Final */}
          <div className="p-4 bg-[#FFD84D]/20 rounded-2xl border-2 border-[#171717] flex items-start justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[11px] font-mono font-black text-[#171717] uppercase">Final Ceremony</span>
              <h4 className="text-base font-black text-[#171717]">Awards &amp; Champion Revelation</h4>
              <p className="text-xs text-gray-700">
                Judge verification of submissions and presentation of trophies to the winners.
              </p>
            </div>
            <span className="px-2.5 py-1 bg-[#171717] text-[#FFD84D] rounded text-xs font-mono font-black uppercase">
              PODIUM
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t-2 border-[#171717]/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-[#171717] text-white font-mono text-xs font-black uppercase rounded-xl hover:bg-gray-800 transition cursor-pointer"
          >
            Close Schedule
          </button>
        </div>
      </div>
    </div>
  );
};
