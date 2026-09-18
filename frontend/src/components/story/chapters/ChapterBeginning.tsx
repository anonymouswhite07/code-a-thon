'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowDown, ArrowRight } from 'lucide-react';
import { CodeMascot } from '@/components/mascot/CodeMascot';

const TYPED_SNIPPET = `#include <stdio.h>

int main() {
    printf("Hello, Code-a-thon!\\n");
    return 0;
}`;

export const ChapterBeginning: React.FC = () => {
  const [typedText, setTypedText] = useState<string>('');

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index < TYPED_SNIPPET.length) {
        setTypedText(TYPED_SNIPPET.slice(0, index + 1));
        index++;
      } else {
        clearInterval(interval);
      }
    }, 38);

    return () => clearInterval(interval);
  }, []);

  return (
    <section id="begin" className="min-h-screen pt-28 pb-20 px-4 flex flex-col justify-center relative bg-dot-pattern">
      <div className="max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Editorial Headline & Story Origin */}
          <div className="lg:col-span-7 space-y-6 text-center sm:text-left">
            {/* Poetic Opening Line */}
            <div className="space-y-2">
              <p className="font-mono text-xs sm:text-sm font-bold text-gray-500 uppercase tracking-widest flex items-center justify-center sm:justify-start gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF6B35]"></span>
                Every great solution starts with a single line of code.
              </p>
            </div>

            {/* Dramatic Headline Reveal */}
            <div className="space-y-4">
              <div className="inline-block px-3.5 py-1 bg-white brutal-border brutal-shadow-sm rounded-full text-xs font-mono font-black uppercase text-[#171717]">
                Gnanamani College of Technology Presents
              </div>

              <div className="space-y-1">
                <h1 className="text-7xl sm:text-8xl md:text-9xl font-black tracking-tighter text-[#171717] font-display leading-[0.88]">
                  CODE
                </h1>
                <h1 className="text-7xl sm:text-8xl md:text-9xl font-black tracking-tighter text-[#3155FF] font-display leading-[0.88] flex items-center justify-center sm:justify-start gap-4">
                  A-THON
                  <span className="text-2xl sm:text-4xl font-mono px-3.5 py-1 bg-[#FF6B35] text-white rounded-xl brutal-border brutal-shadow-sm rotate-3">
                    &apos;26
                  </span>
                </h1>
              </div>

              <div className="pt-2">
                <p className="text-xl sm:text-2xl font-black text-[#171717] uppercase tracking-wide">
                  <span className="sketch-underline">THINK.</span>{' '}
                  <span className="sketch-underline-orange">CODE.</span>{' '}
                  <span className="sketch-underline-lime">CONQUER.</span>
                </p>
                <p className="text-base sm:text-lg text-gray-700 font-medium max-w-xl mt-2 leading-relaxed">
                  Three languages. Three rounds. One champion. An interactive collegiate festival where algorithms meet competitive grit.
                </p>
              </div>
            </div>

            {/* CTAs */}
            <div className="pt-4 flex flex-col sm:flex-row items-center gap-4">
              <a
                href="#think"
                className="w-full sm:w-auto px-8 py-4 bg-[#FF6B35] hover:bg-[#ff5517] text-white font-black text-sm uppercase tracking-wider rounded-xl brutal-border brutal-shadow brutal-shadow-hover flex items-center justify-center gap-3 transition-transform"
              >
                Start The Journey <ArrowDown className="w-4 h-4 animate-bounce" />
              </a>

              <Link
                href="/register"
                className="w-full sm:w-auto px-6 py-4 bg-white hover:bg-[#F7F4ED] text-[#171717] font-black text-sm uppercase tracking-wider rounded-xl brutal-border brutal-shadow brutal-shadow-hover flex items-center justify-center gap-2 transition-colors"
              >
                Direct Register <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Right Column: Genesis.c Terminal Box & Mascot Companion */}
          <div className="lg:col-span-5 flex flex-col items-center lg:items-end space-y-4">
            {/* Mascot Companion Preview */}
            <div className="flex items-center gap-3 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-2xl brutal-border brutal-shadow-sm self-center lg:self-end">
              <CodeMascot state="typing" size={80} showSpeechBubble={false} />
              <div className="text-xs font-mono font-bold text-gray-600 text-left">
                Meet your companion <br />
                <span className="text-[#3155FF]">Student Coder &apos;26</span>
              </div>
            </div>

            {/* genesis.c Live Typewriter Terminal */}
            <div className="w-full max-w-md bg-[#171717] text-white p-6 rounded-3xl brutal-border brutal-shadow-xl font-mono text-xs sm:text-sm leading-relaxed relative overflow-hidden text-left">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#EF4444]"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-[#10B981]"></div>
                  <span className="text-[11px] text-gray-400 ml-2 font-bold">genesis.c</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 bg-white/10 rounded font-mono text-gray-400">
                  GCC 11
                </span>
              </div>
              <pre className="text-[#B8E63E] whitespace-pre font-mono min-h-[120px]">
                {typedText}
                <span className="inline-block w-2.5 h-4 bg-[#FFD84D] ml-1 animate-pulse align-middle" />
              </pre>
              <div className="pt-3 mt-3 border-t border-white/10 flex items-center justify-between text-[10px] text-gray-400">
                <span>0 Errors &bull; 0 Warnings</span>
                <span className="text-[#B8E63E] font-bold">READY</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
