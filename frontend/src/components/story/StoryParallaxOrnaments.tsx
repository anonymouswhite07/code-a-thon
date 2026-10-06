'use client';

import React, { useEffect, useRef } from 'react';

export const StoryParallaxOrnaments: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let mouseX = 0;
    let mouseY = 0;
    let currentX = 0;
    let currentY = 0;
    let animId: number;

    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      mouseX = (e.clientX / innerWidth - 0.5) * 30; // Max 30px drift
      mouseY = (e.clientY / innerHeight - 0.5) * 30;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Smooth lerp loop for mouse parallax
    const loop = () => {
      currentX += (mouseX - currentX) * 0.08;
      currentY += (mouseY - currentY) * 0.08;

      const mouseLayers = container.querySelectorAll<HTMLElement>('[data-mouse-parallax]');
      mouseLayers.forEach((el) => {
        const factor = parseFloat(el.getAttribute('data-mouse-parallax') || '1');
        el.style.transform = `translate3d(${currentX * factor}px, ${currentY * factor}px, 0)`;
      });

      animId = requestAnimationFrame(loop);
    };

    loop();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none overflow-hidden select-none z-10"
      aria-hidden="true"
    >
      {/* --- CHAPTER 01: BEGINNING ORNAMENTS --- */}
      {/* Floating Memory Address Chip (Top Right) */}
      <div
        data-speed="0.25"
        data-mouse-parallax="1.2"
        className="parallax-layer absolute top-36 right-[8%] hidden xl:block animate-float-slow"
      >
        <div className="px-3.5 py-1.5 bg-white/90 backdrop-blur-sm brutal-border brutal-shadow-sm rounded-xl font-mono text-[11px] font-black text-[#3155FF] flex items-center gap-2 rotate-6">
          <span className="w-2 h-2 rounded-full bg-[#10B981]" />
          <span>0x7FFE_GENESIS</span>
        </div>
      </div>

      {/* Floating Syntax Token (Top Left) */}
      <div
        data-speed="0.35"
        data-mouse-parallax="-0.8"
        className="parallax-layer absolute top-56 left-[4%] hidden xl:block animate-float-reverse"
      >
        <div className="px-3 py-1 bg-[#FFD84D] brutal-border brutal-shadow-sm rounded-lg font-mono text-[10px] font-black text-[#171717] -rotate-3">
          &lt;stdio.h&gt; &bull; GCC 11
        </div>
      </div>

      {/* Floating Code Snippet (Hero Center Left) */}
      <div
        data-speed="0.85"
        data-mouse-parallax="0.6"
        className="parallax-layer absolute top-[520px] left-[7%] hidden 2xl:block animate-float-slow"
      >
        <div className="p-2.5 bg-[#171717]/90 text-[#B8E63E] brutal-border brutal-shadow-sm rounded-xl font-mono text-[10px] space-y-0.5">
          <span className="text-gray-400 block">{'// entry point'}</span>
          <span>int main(int argc, char** argv)</span>
        </div>
      </div>

      {/* --- CHAPTER 02: THINK ORNAMENTS --- */}
      {/* Complexity Badge (Middle Right) */}
      <div
        data-speed="0.3"
        data-mouse-parallax="1.4"
        className="parallax-layer absolute top-[1100px] right-[5%] hidden lg:block animate-float-slow"
      >
        <div className="px-4 py-2 bg-[#FF6B35] text-white brutal-border brutal-shadow-sm rounded-2xl font-mono text-xs font-black rotate-3 space-y-0.5">
          <span className="block text-[9px] uppercase tracking-wider text-white/80">Target Invariant</span>
          <span>O(N) Time &bull; O(1) Aux</span>
        </div>
      </div>

      {/* Invariant Bitwise Chip (Middle Left) */}
      <div
        data-speed="0.5"
        data-mouse-parallax="-1.0"
        className="parallax-layer absolute top-[1250px] left-[6%] hidden xl:block animate-float-reverse"
      >
        <div className="px-3 py-1.5 bg-white brutal-border brutal-shadow-sm rounded-xl font-mono text-[11px] font-bold text-[#171717] -rotate-6">
          <span>xor ^= i ^ nums[i];</span>
        </div>
      </div>

      {/* --- CHAPTER 03: CODE SANDBOX ORNAMENTS --- */}
      <div
        data-speed="0.2"
        data-mouse-parallax="0.9"
        className="parallax-layer absolute top-[1900px] right-[7%] hidden xl:block animate-float-slow"
      >
        <div className="px-3 py-1.5 bg-[#B8E63E] text-[#171717] brutal-border brutal-shadow-sm rounded-xl font-mono text-[11px] font-black rotate-2 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#171717] animate-ping" />
          <span>SANDBOX ISOLATION: ACTIVE</span>
        </div>
      </div>

      {/* --- CHAPTER 04: ROUNDS ORNAMENTS --- */}
      {/* Python Lambda Token */}
      <div
        data-speed="0.4"
        data-mouse-parallax="-1.2"
        className="parallax-layer absolute top-[2700px] left-[5%] hidden xl:block animate-float-reverse"
      >
        <div className="px-3.5 py-1.5 bg-white brutal-border brutal-shadow-sm rounded-xl font-mono text-[11px] font-bold text-[#FF6B35] rotate-3">
          <span>def bfs(start, graph):</span>
        </div>
      </div>

      {/* C Pointer Invariant Token */}
      <div
        data-speed="0.3"
        data-mouse-parallax="1.1"
        className="parallax-layer absolute top-[3050px] right-[6%] hidden xl:block animate-float-slow"
      >
        <div className="px-3 py-1.5 bg-[#3155FF] text-white brutal-border brutal-shadow-sm rounded-xl font-mono text-[11px] font-black -rotate-3">
          <span>*curr-&gt;next = prev;</span>
        </div>
      </div>

      {/* --- CHAPTER 05: JAVA FINALE ORNAMENTS --- */}
      <div
        data-speed="0.25"
        data-mouse-parallax="-0.8"
        className="parallax-layer absolute top-[3750px] left-[8%] hidden xl:block animate-float-slow"
      >
        <div className="px-3 py-1.5 bg-[#171717] text-[#FFD84D] border border-white/20 rounded-xl font-mono text-[10px] font-black rotate-2">
          <span>JVM_HEAP = 256MB // GC SERIAL</span>
        </div>
      </div>

      {/* --- CHAPTER 06: CHAMPION ORNAMENTS --- */}
      <div
        data-speed="0.18"
        data-mouse-parallax="1.5"
        className="parallax-layer absolute top-[4450px] right-[8%] hidden xl:block animate-float-reverse"
      >
        <div className="px-4 py-2 bg-[#FFD84D] text-[#171717] brutal-border brutal-shadow-md rounded-2xl font-mono text-xs font-black -rotate-6 flex items-center gap-2">
          <span>🏆</span>
          <span>PODIUM RANK 01</span>
        </div>
      </div>

      <div
        data-speed="0.35"
        data-mouse-parallax="-1.3"
        className="parallax-layer absolute top-[4550px] left-[7%] hidden xl:block animate-float-slow"
      >
        <div className="px-3 py-1.5 bg-white brutal-border brutal-shadow-sm rounded-xl font-mono text-[11px] font-bold text-[#10B981] rotate-6">
          <span>✓ 100/100 ALL TESTCASES PASSED</span>
        </div>
      </div>
    </div>
  );
};
