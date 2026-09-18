'use client';

import React from 'react';
import { X, ShieldAlert, CheckCircle, Clock, Cpu, Award } from 'lucide-react';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#F7F4ED] w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-3xl brutal-border brutal-shadow-2xl text-[#171717] p-6 sm:p-8 space-y-6 relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-[#171717]/10 pb-4">
          <div className="space-y-1">
            <span className="text-xs font-mono font-black uppercase text-[#3155FF]">Code-a-thon &apos;26</span>
            <h3 className="text-2xl sm:text-3xl font-black font-display text-[#171717]">
              COMPETITION RULES &amp; INTEGRITY
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white hover:bg-gray-100 brutal-border flex items-center justify-center cursor-pointer transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6 text-sm text-gray-700 leading-relaxed font-medium">
          {/* Rule 1: Structure */}
          <div className="p-4 bg-white rounded-2xl brutal-border space-y-2">
            <div className="flex items-center gap-2 text-base font-black text-[#171717]">
              <Clock className="w-4 h-4 text-[#FF6B35]" /> 1. Sequential 3-Round Format
            </div>
            <p className="text-xs sm:text-sm text-gray-600">
              The competition consists of Round 01 (C), Round 02 (Python), and Round 03 (Java). Rounds must be completed sequentially within the authoritatively enforced clock window.
            </p>
          </div>

          {/* Rule 2: Scoring */}
          <div className="p-4 bg-white rounded-2xl brutal-border space-y-2">
            <div className="flex items-center gap-2 text-base font-black text-[#171717]">
              <Award className="w-4 h-4 text-[#3155FF]" /> 2. Automated Scoring &amp; Tie-Breakers
            </div>
            <p className="text-xs sm:text-sm text-gray-600">
              Submissions are judged against visible and hidden test cases. Score is awarded proportionally. Ties in total points are broken by aggregate execution time and earlier submission timestamps.
            </p>
          </div>

          {/* Rule 3: Execution Sandbox */}
          <div className="p-4 bg-white rounded-2xl brutal-border space-y-2">
            <div className="flex items-center gap-2 text-base font-black text-[#171717]">
              <Cpu className="w-4 h-4 text-[#B8E63E]" /> 3. Containerized Sandbox Constraints
            </div>
            <p className="text-xs sm:text-sm text-gray-600">
              All code runs in ephemeral sandbox containers without external network access. Execution CPU time limit is 5.0 seconds. Memory caps are enforced per language (64MB for C, 128MB for Python, 256MB for Java).
            </p>
          </div>

          {/* Rule 4: Integrity */}
          <div className="p-4 bg-[#FF6B35]/10 rounded-2xl border-2 border-[#FF6B35] space-y-2">
            <div className="flex items-center gap-2 text-base font-black text-[#171717]">
              <ShieldAlert className="w-4 h-4 text-[#FF6B35]" /> 4. Academic Integrity &amp; Audit Logs
            </div>
            <p className="text-xs sm:text-sm text-gray-800">
              All browser focus switches, tab changes, and submission activities are logged into the append-only event ledger. Collusion, plagiarism, or unauthorized tools result in immediate disqualification by the panel of judges.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t-2 border-[#171717]/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-[#171717] text-white font-mono text-xs font-black uppercase rounded-xl hover:bg-gray-800 transition cursor-pointer"
          >
            I Understand the Rules
          </button>
        </div>
      </div>
    </div>
  );
};
