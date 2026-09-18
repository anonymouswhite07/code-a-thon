import React from 'react';
import { Calendar, CheckCircle, Clock } from 'lucide-react';

export const ScheduleSection: React.FC = () => {
  const steps = [
    {
      time: '08:30 AM – 09:30 AM',
      title: 'Check-in & Registration Desk',
      desc: 'Participant briefing, arena credentials issuance, and environment sanity test.',
      status: 'COMPLETED',
      badge: '#B8E63E'
    },
    {
      time: '09:45 AM – 10:30 AM',
      title: 'ROUND 01 — C: THE FOUNDATION',
      desc: 'Bitwise algorithms, pointers, memory limits, and logic testing. Top 60% qualify.',
      status: 'LIVE NOW',
      badge: '#3155FF',
      active: true
    },
    {
      time: '11:00 AM – 11:45 AM',
      title: 'ROUND 02 — PYTHON: THE LOGIC',
      desc: 'Algorithmic efficiency, string parsing, sorting, and graph search. Top 25% qualify.',
      status: 'UPCOMING',
      badge: '#FF6B35'
    },
    {
      time: '01:30 PM – 02:30 PM',
      title: 'ROUND 03 — JAVA: THE MASTER',
      desc: 'Enterprise structures, OOP architecture, and dynamic programming.',
      status: 'UPCOMING',
      badge: '#FFD84D'
    },
    {
      time: '03:15 PM – 04:30 PM',
      title: 'Final Results Reveal & Felicitation Ceremony',
      desc: 'Cinematic leaderboard unfreeze, trophy presentation by college principal, and cash rewards.',
      status: 'UPCOMING',
      badge: '#9CA3AF'
    }
  ];

  return (
    <section id="schedule" className="py-24 px-4 bg-[#F7F4ED] border-b-2 border-[#171717]">
      <div className="max-w-5xl mx-auto space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-block px-3 py-1 bg-[#B8E63E] text-[#171717] font-mono text-xs font-black brutal-border brutal-shadow-sm uppercase">
            Tournament Timeline
          </div>
          <h2 className="text-4xl sm:text-5xl font-black font-display tracking-tight text-[#171717]">
            THE BATTLE SCHEDULE
          </h2>
          <p className="text-base text-gray-700 font-medium">
            Strict adherence to timeline. Server clocks dictate round starts and automatic submission lockouts.
          </p>
        </div>

        {/* Timeline Stack */}
        <div className="space-y-4">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className={`p-6 rounded-2xl brutal-border brutal-shadow brutal-shadow-hover flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all ${
                step.active ? 'bg-white ring-4 ring-[#3155FF]/20' : 'bg-white'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#171717] text-white flex items-center justify-center font-black font-mono text-base brutal-border shrink-0">
                  0{idx + 1}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-gray-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {step.time}
                    </span>
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-mono font-black brutal-border"
                      style={{
                        backgroundColor: step.badge,
                        color: step.badge === '#3155FF' ? '#FFFFFF' : '#171717'
                      }}
                    >
                      {step.status}
                    </span>
                  </div>
                  <h4 className="font-display font-black text-xl text-[#171717]">
                    {step.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-gray-600 font-medium">
                    {step.desc}
                  </p>
                </div>
              </div>

              {step.active ? (
                <span className="px-3 py-1.5 bg-[#3155FF] text-white font-mono text-xs font-black uppercase tracking-wider rounded-lg brutal-border whitespace-nowrap animate-pulse">
                  ● ARENA IN PROGRESS
                </span>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
