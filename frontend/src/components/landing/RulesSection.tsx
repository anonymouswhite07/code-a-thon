import React from 'react';
import { ShieldCheck, AlertTriangle, FileCode, CheckCircle2 } from 'lucide-react';

export const RulesSection: React.FC = () => {
  const rules = [
    {
      title: 'Independent Coding Only',
      desc: 'All solutions must be written individually during the active round window. Automated code similarity scanners inspect all ASTs.'
    },
    {
      title: 'Standard I/O Formats',
      desc: 'Programs must read strictly from standard input (stdin) and print strictly to standard output (stdout). Do not print extra prompt text.'
    },
    {
      title: 'Time & Memory Limits',
      desc: 'Each problem enforces strict thresholds (typically 2.0 seconds execution and 128 MB RAM). Exceeding limits results in TIME_LIMIT or MEMORY_LIMIT.'
    },
    {
      title: 'Round Sequential Unlocking',
      desc: 'Participants must participate in Round 01 (C) to qualify for Round 02 (Python) and Round 03 (Java). Scores accumulate toward the grand championship.'
    }
  ];

  return (
    <section id="rules" className="py-20 px-4 max-w-7xl mx-auto">
      <div className="bg-white rounded-3xl brutal-border brutal-shadow-lg p-8 sm:p-12 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 border-[#171717] pb-6">
          <div>
            <div className="text-xs font-mono font-black text-[#FF6B35] uppercase tracking-wider">
              Code of Conduct & Evaluation
            </div>
            <h3 className="text-3xl sm:text-4xl font-black font-display text-[#171717]">
              COMPETITION RULES & POLICIES
            </h3>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#B8E63E] text-[#171717] rounded-lg brutal-border text-xs font-mono font-black uppercase">
            <ShieldCheck className="w-4 h-4" /> Integrity Enforced
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {rules.map((r, i) => (
            <div key={i} className="p-5 bg-[#F7F4ED] rounded-xl brutal-border space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#171717] text-white flex items-center justify-center font-mono text-xs font-bold">
                  0{i + 1}
                </span>
                <h4 className="font-bold text-base text-[#171717]">{r.title}</h4>
              </div>
              <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-medium pl-8">
                {r.desc}
              </p>
            </div>
          ))}
        </div>

        <div className="p-4 bg-amber-50 rounded-xl border-2 border-amber-300 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 font-medium leading-relaxed">
            <strong>Server Source of Truth:</strong> The backend server maintains the authoritative timer and evaluates test cases. Client clock manipulation or local DOM adjustments will have zero effect on official results.
          </div>
        </div>
      </div>
    </section>
  );
};
