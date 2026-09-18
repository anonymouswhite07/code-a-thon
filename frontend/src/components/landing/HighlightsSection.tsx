import React from 'react';
import { Trophy, Award, ShieldCheck, Zap, Users2, Laptop } from 'lucide-react';

export const HighlightsSection: React.FC = () => {
  const highlights = [
    {
      icon: <Trophy className="w-8 h-8 text-[#FF6B35]" />,
      title: 'Grand Cash & Tech Prizes',
      desc: 'Top podium finishers receive cash rewards, official trophies, and sponsored tech peripherals.'
    },
    {
      icon: <Zap className="w-8 h-8 text-[#3155FF]" />,
      title: 'Live Real-Time Leaderboard',
      desc: 'Instant scoring as your test cases compile and run. Watch the ranks shuffle in real time.'
    },
    {
      icon: <Award className="w-8 h-8 text-[#171717]" />,
      title: 'Certified Credentials',
      desc: 'Official Certificate of Excellence from Gnanamani College of Technology for all qualifying coders.'
    },
    {
      icon: <ShieldCheck className="w-8 h-8 text-[#10B981]" />,
      title: 'Isolated Execution Sandboxes',
      desc: 'Fair and uncheatable evaluation in secure sandboxed containers with strict CPU & memory thresholds.'
    },
    {
      icon: <Users2 className="w-8 h-8 text-[#8B5CF6]" />,
      title: 'Campus Peer Networking',
      desc: 'Connect with the sharpest collegiate programmers, professors, and industry judges.'
    },
    {
      icon: <Laptop className="w-8 h-8 text-[#EC4899]" />,
      title: 'True Competition Experience',
      desc: 'A full-featured coding workstation with Monaco editor, standard I/O test runner, and authoritative clock.'
    }
  ];

  return (
    <section className="py-24 px-4 max-w-7xl mx-auto">
      <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
        <div className="inline-block px-3 py-1 bg-[#FF6B35] text-white font-mono text-xs font-black brutal-border brutal-shadow-sm uppercase">
          Event Highlights
        </div>
        <h2 className="text-4xl sm:text-5xl font-black font-display tracking-tight text-[#171717]">
          BUILT FOR PURE CODING EXCELLENCE
        </h2>
        <p className="text-base text-gray-700 font-medium">
          Every detail is engineered to provide an authentic, high-stakes competition atmosphere.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {highlights.map((h, i) => (
          <div
            key={i}
            className="bg-white p-6 rounded-2xl brutal-border brutal-shadow brutal-shadow-hover space-y-4 flex flex-col justify-between"
          >
            <div className="p-3 bg-[#F7F4ED] rounded-xl brutal-border inline-block w-fit">
              {h.icon}
            </div>
            <div className="space-y-2">
              <h3 className="font-display font-black text-xl text-[#171717]">
                {h.title}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed font-medium">
                {h.desc}
              </p>
            </div>
            <div className="pt-2 border-t border-gray-100 flex items-center text-xs font-mono font-bold text-gray-400 uppercase">
              Feature 0{i + 1}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
