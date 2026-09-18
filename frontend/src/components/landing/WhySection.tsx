import React from 'react';
import { Check, Sparkles, Brain, Flame, Rocket, Trophy } from 'lucide-react';
import { Mascot } from '../mascot/Mascot';

export const WhySection: React.FC = () => {
  const points = [
    {
      title: 'Real Compiler Arena',
      desc: 'No theoretical quizzes or bubble sheets. Run and debug code against real standard input and test cases.'
    },
    {
      title: 'Strictly Non-Cyberpunk',
      desc: 'Clean editorial design built for focus. No dizzying neon lights, purple blobs, or generic chatbot clones.'
    },
    {
      title: 'Automated Evaluation',
      desc: 'Submissions are compiled in isolated sandboxes with strict CPU, memory, and timeout governance.'
    },
    {
      title: 'Recognition & Tech Honors',
      desc: 'Cash prizes, certificates from Gnanamani College of Technology, and direct recruitment fast-tracks.'
    }
  ];

  return (
    <section className="py-20 px-4 bg-[#F7F4ED] border-b-2 border-[#171717]">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Editorial Headline & Pillars */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-block px-3 py-1 bg-[#B8E63E] text-[#171717] font-mono text-xs font-black brutal-border brutal-shadow-sm uppercase">
              Festival Ethos
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black font-display tracking-tight text-[#171717] leading-none">
              WHY <br />
              <span className="text-[#FF6B35]">CODE-A-THON?</span>
            </h2>
            <p className="text-base sm:text-lg text-gray-700 font-medium">
              We built this platform for students who want to test their genuine programming endurance. No fluff. Just logic, algorithmic grit, and clean syntax.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              {points.map((p, idx) => (
                <div key={idx} className="bg-white p-4 rounded-xl brutal-border brutal-shadow-sm space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 bg-[#3155FF] text-white rounded-full flex items-center justify-center text-xs font-bold">
                      ✓
                    </span>
                    <h4 className="font-bold text-sm text-[#171717]">{p.title}</h4>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Illustrated scene with mascot & annotations */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="relative bg-white p-8 rounded-3xl brutal-border brutal-shadow-lg max-w-md w-full text-center space-y-6">
              {/* Hand-drawn tape doodle on top */}
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-28 h-6 bg-[#FFD84D]/70 brutal-border rotate-1"></div>

              <div className="flex justify-center pt-2">
                <Mascot state="thinking" size={200} showQuote={true} customQuote="Think before you code." />
              </div>

              <div className="bg-[#F7F4ED] p-4 rounded-xl brutal-border text-left space-y-2">
                <div className="text-xs font-mono font-bold text-[#FF6B35] uppercase">
                  Participant Manifesto:
                </div>
                <div className="text-sm font-bold text-[#171717] space-y-1">
                  <div>1. Read constraints before typing.</div>
                  <div>2. Beware of $O(N^2)$ in 100K inputs.</div>
                  <div>3. Celebrate the clean green checkmark.</div>
                </div>
              </div>

              {/* Stamp */}
              <div className="inline-block px-4 py-1.5 bg-[#FF6B35] text-white font-mono text-xs font-black uppercase tracking-wider rounded brutal-border transform -rotate-2">
                OFFICIALLY SANCTIONED BY GCT
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
