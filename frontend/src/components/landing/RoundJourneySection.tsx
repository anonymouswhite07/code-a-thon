'use client';

import React from 'react';
import Link from 'next/link';
import { Terminal, Cpu, Coffee, Award, ChevronRight, CheckCircle2 } from 'lucide-react';

export const RoundJourneySection: React.FC = () => {
  const rounds = [
    {
      num: '01',
      lang: 'C',
      subtitle: 'THE FOUNDATION',
      color: '#3155FF',
      bgLight: '#EFF2FF',
      desc: 'Master the basics. Pointers, memory allocation, and bitwise puzzles. Build raw logic without guardrails.',
      icon: <Terminal className="w-8 h-8 text-[#3155FF]" />,
      snippet: '#include <stdio.h>\nint main() {\n  printf("Hello C!\\n");\n  return 0;\n}',
      status: 'LIVE NOW',
      statusColor: '#B8E63E',
      stats: '45 Mins • 100-200 Pts'
    },
    {
      num: '02',
      lang: 'PYTHON',
      subtitle: 'THE LOGIC',
      color: '#FF6B35',
      bgLight: '#FFF2EC',
      desc: 'Think smarter, solve faster. Dynamic arrays, dictionaries, greedy heuristics, and algorithmic efficiency.',
      icon: <Cpu className="w-8 h-8 text-[#FF6B35]" />,
      snippet: 'def solve(nums):\n    return [x**2 for x in nums]\nprint(solve([1,2,3]))',
      status: 'SCHEDULED',
      statusColor: '#FFD84D',
      stats: '45 Mins • 100-200 Pts'
    },
    {
      num: '03',
      lang: 'JAVA',
      subtitle: 'THE MASTER',
      color: '#171717',
      bgLight: '#F3F4F6',
      desc: 'Apply. Build. Conquer. OOP structures, robust exception handling, and enterprise algorithmic design.',
      icon: <Coffee className="w-8 h-8 text-[#FF6B35]" />,
      snippet: 'public class Main {\n  public static void main(String[] args){\n    System.out.println("Champion");\n  }\n}',
      status: 'LOCKED',
      statusColor: '#9CA3AF',
      stats: '60 Mins • 150-250 Pts'
    }
  ];

  return (
    <section id="rounds" className="py-24 px-4 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
        <div className="inline-block px-3 py-1 bg-[#FFD84D] text-[#171717] font-mono text-xs font-black brutal-border brutal-shadow-sm uppercase">
          Structured Eliminator Tournament
        </div>
        <h2 className="text-4xl sm:text-5xl md:text-6xl font-black font-display tracking-tight text-[#171717]">
          THREE ROUNDS. ONE CHAMPION.
        </h2>
        <p className="text-base sm:text-lg text-gray-700 font-medium">
          Progress sequentially through the pillars of computer science. Solve test cases, rack up points, and survive the elimination cuts.
        </p>

        {/* Progress Roadmap Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white brutal-border brutal-shadow-sm rounded-full text-xs font-mono font-bold mt-2">
          <span className="text-[#3155FF]">01 C</span>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-[#FF6B35]">02 PYTHON</span>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-[#171717]">03 JAVA</span>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-yellow-600 font-black">🏆 PODIUM</span>
        </div>
      </div>

      {/* The 3 Round Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {rounds.map((round) => (
          <div
            key={round.num}
            className="bg-white rounded-2xl brutal-border brutal-shadow brutal-shadow-hover flex flex-col justify-between overflow-hidden relative group"
          >
            {/* Top language banner */}
            <div
              className="p-6 border-b-2 border-[#171717]"
              style={{ backgroundColor: round.bgLight }}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono font-black px-2.5 py-1 bg-white brutal-border rounded">
                  ROUND {round.num}
                </span>
                <span
                  className="text-[11px] font-mono font-black px-2.5 py-1 rounded brutal-border"
                  style={{ backgroundColor: round.statusColor }}
                >
                  {round.status}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-3 bg-white rounded-xl brutal-border brutal-shadow-sm">
                  {round.icon}
                </div>
                <div>
                  <h3 className="text-3xl font-black font-display text-[#171717] tracking-tight">
                    {round.lang}
                  </h3>
                  <div className="text-xs font-bold text-[#FF6B35] uppercase tracking-wider">
                    {round.subtitle}
                  </div>
                </div>
              </div>
            </div>

            {/* Description & Code Snippet */}
            <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
              <p className="text-sm text-gray-700 font-medium leading-relaxed">
                {round.desc}
              </p>

              <div className="bg-[#171717] text-[#B8E63E] p-3 rounded-lg font-mono text-xs overflow-x-auto brutal-border">
                <pre>{round.snippet}</pre>
              </div>

              <div className="pt-2 flex items-center justify-between text-xs font-mono font-bold text-gray-600 border-t border-gray-200">
                <span>{round.stats}</span>
                <span className="text-[#3155FF]">Automated Tests</span>
              </div>
            </div>

            {/* Card CTA Footer */}
            <div className="p-4 bg-gray-50 border-t-2 border-[#171717]">
              <Link
                href="/register"
                className="w-full py-2.5 px-4 bg-white text-[#171717] font-black text-xs uppercase tracking-wider rounded-lg brutal-border brutal-shadow-sm flex items-center justify-center gap-2 hover:bg-[#171717] hover:text-white transition-colors"
              >
                Enter Round {round.num} <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
