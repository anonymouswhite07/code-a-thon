'use client';

import React, { useEffect, useState } from 'react';

export interface Chapter {
  id: string;
  label: string;
  icon?: string;
}

const CHAPTERS: Chapter[] = [
  { id: 'begin', label: 'BEGIN' },
  { id: 'think', label: 'THINK' },
  { id: 'code', label: 'CODE' },
  { id: 'round1', label: 'ROUND 01' },
  { id: 'round2', label: 'ROUND 02' },
  { id: 'final', label: 'FINAL BATTLE' },
  { id: 'champion', label: 'CHAMPION', icon: '🏆' },
  { id: 'story', label: 'YOUR STORY' }
];

export const StoryProgressIndicator: React.FC = () => {
  const [activeChapter, setActiveChapter] = useState<string>('begin');

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY + 250;
      for (const ch of CHAPTERS) {
        const el = document.getElementById(ch.id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollY >= top && scrollY < top + height) {
            setActiveChapter(ch.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* Desktop Vertical Ribbon (Left Side) */}
      <div className="hidden xl:flex fixed left-6 top-1/2 -translate-y-1/2 z-40 flex-col items-start gap-3 select-none">
        <div className="bg-white/95 backdrop-blur-sm p-3.5 rounded-2xl brutal-border brutal-shadow-sm space-y-2.5">
          <div className="text-[10px] font-mono font-black text-gray-400 uppercase tracking-widest px-1">
            STORY PROGRESS
          </div>
          <div className="relative flex flex-col gap-1.5">
            {CHAPTERS.map((ch) => {
              const isActive = activeChapter === ch.id;
              return (
                <button
                  key={ch.id}
                  onClick={() => scrollTo(ch.id)}
                  className={`flex items-center gap-2.5 text-left text-[11px] font-mono font-bold transition-all px-2.5 py-1 rounded-md cursor-pointer ${
                    isActive
                      ? 'bg-[#171717] text-white brutal-border translate-x-1'
                      : 'text-gray-600 hover:text-[#3155FF] hover:bg-gray-100'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full transition-colors ${
                      isActive ? 'bg-[#FF6B35]' : 'bg-gray-300'
                    }`}
                  />
                  <span>
                    {ch.icon && <span className="mr-1">{ch.icon}</span>}
                    {ch.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile Top Progress Bar */}
      <div className="xl:hidden fixed top-14 left-0 right-0 z-40 bg-[#F7F4ED]/95 backdrop-blur-sm border-b border-[#171717]/20 px-4 py-1.5 flex items-center justify-between text-[11px] font-mono font-bold">
        <span className="text-[#FF6B35] uppercase">CHAPTER:</span>
        <span className="px-2.5 py-0.5 bg-[#171717] text-white rounded brutal-border">
          {CHAPTERS.find((c) => c.id === activeChapter)?.label || 'BEGIN'}
        </span>
      </div>
    </>
  );
};
