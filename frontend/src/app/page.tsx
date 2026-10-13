'use client';

import React, { useState, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { StoryNav } from '@/components/story/StoryNav';
import { ChapterBeginning } from '@/components/story/chapters/ChapterBeginning';
import { ChapterQuestion } from '@/components/story/chapters/ChapterQuestion';
import { ChapterCode } from '@/components/story/chapters/ChapterCode';
import { ChapterRound1 } from '@/components/story/chapters/ChapterRound1';
import { ChapterRound2 } from '@/components/story/chapters/ChapterRound2';
import { ChapterRound3 } from '@/components/story/chapters/ChapterRound3';
import { ChapterChampion } from '@/components/story/chapters/ChapterChampion';
import { ChapterFinale } from '@/components/story/chapters/ChapterFinale';
import { StoryParallaxOrnaments } from '@/components/story/StoryParallaxOrnaments';
import { InteractivePlaygroundDrawer } from '@/components/story/InteractivePlaygroundDrawer';
import { RulesModal } from '@/components/story/RulesModal';
import { ScheduleModal } from '@/components/story/ScheduleModal';
import { LeaderboardModal } from '@/components/story/LeaderboardModal';
import { Footer } from '@/components/shared/Footer';
import { API_BASE } from '@/lib/api';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface RoundDto {
  id: number;
  roundNumber: number;
  title: string;
  subtitle: string;
  language: string;
  durationMinutes: number;
  questionCount: number;
  status: string;
  isLocked?: boolean;
}

export default function Home() {
  const [rounds, setRounds] = useState<RoundDto[]>([]);
  const [isPlaygroundOpen, setIsPlaygroundOpen] = useState(false);
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);

  useEffect(() => {
    // Fetch authoritative round information from Spring Boot
    fetch(`${API_BASE}/rounds`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.data) {
          setRounds(data.data);
        }
      })
      .catch(() => {
        // Fallback gracefully if backend is temporarily offline
      });

    // GSAP ScrollTrigger Multi-Tier Parallax Integration
    const ctx = gsap.context(() => {
      // Check prefers-reduced-motion
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReducedMotion) return;

      const layers = document.querySelectorAll<HTMLElement>('.parallax-layer[data-speed]');
      layers.forEach((layer) => {
        const speed = parseFloat(layer.getAttribute('data-speed') || '1');
        // Calculate multi-directional movement based on speed factor
        const yMovement = (1 - speed) * 140;
        const rotateMovement = (1 - speed) * 4;

        gsap.to(layer, {
          y: yMovement,
          rotation: rotateMovement,
          ease: 'power1.out',
          scrollTrigger: {
            trigger: layer.closest('section') || layer,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.5,
          }
        });
      });
    });

    return () => ctx.revert();
  }, []);

  const round1Data = rounds.find((r) => r.roundNumber === 1 || r.language?.toUpperCase() === 'C');
  const round2Data = rounds.find((r) => r.roundNumber === 2 || r.language?.toUpperCase() === 'JAVA');
  const round3Data = rounds.find((r) => r.roundNumber === 3 || r.language?.toUpperCase() === 'PYTHON');

  const liveRound = rounds.find((r) => r.status === 'LIVE' || r.status === 'IN_PROGRESS');
  const targetRound = liveRound || round1Data || rounds[0];
  const activeRoundId = targetRound?.id || 1;
  const activeRoundTitle = targetRound?.title || 'Round 01';

  return (
    <main className="min-h-screen bg-[#F7F4ED] text-[#171717] flex flex-col selection:bg-[#FFD84D] selection:text-[#171717] relative">
      {/* 0. Ambient Story Parallax Floating Ornaments & Mouse Drift */}
      <StoryParallaxOrnaments />

      {/* 1. Sticky Storytelling Navigation with Animated Progress Bar */}
      <StoryNav
        onOpenPlayground={() => setIsPlaygroundOpen(true)}
        onOpenRules={() => setIsRulesOpen(true)}
        onOpenSchedule={() => setIsScheduleOpen(true)}
        onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
        activeRoundId={activeRoundId}
      />

      {/* 2. Chapter 01: BEGIN — The Beginning */}
      <ChapterBeginning
        activeRoundId={activeRoundId}
        activeRoundTitle={activeRoundTitle}
      />

      {/* 4. Chapter 02: THINK — The Question & First Failure/Success */}
      <ChapterQuestion />

      {/* 5. Chapter 03: CODE — Try Before You Compete Sandbox Practice */}
      <ChapterCode />

      {/* 6. Chapter 04: ROUNDS — The Three Arenas */}
      <section id="round1" className="bg-[#F7F4ED] px-4">
        <div className="max-w-5xl mx-auto w-full">
          {/* Round 01: C — The Foundation */}
          <ChapterRound1 roundData={round1Data} />
        </div>
      </section>

      <section id="round2" className="bg-[#F7F4ED] px-4">
        <div className="max-w-5xl mx-auto w-full">
          {/* Round 02: Python — The Logic */}
          <ChapterRound2 roundData={round2Data} />
        </div>
      </section>

      {/* 7. Chapter 05: FINAL BATTLE — Round 03: Java: The Master */}
      <ChapterRound3 roundData={round3Data} />

      {/* 8. Chapter 06: CHAMPION — The Culmination & Live Podium */}
      <ChapterChampion />

      {/* 9. Chapter 07: YOUR STORY — Every Coder Has a Story & Gateway */}
      <ChapterFinale />

      {/* 10. Footer */}
      <Footer />

      {/* Slide-over Drawers & Utility Modals */}
      <InteractivePlaygroundDrawer
        isOpen={isPlaygroundOpen}
        onClose={() => setIsPlaygroundOpen(false)}
      />
      <RulesModal
        isOpen={isRulesOpen}
        onClose={() => setIsRulesOpen(false)}
      />
      <ScheduleModal
        isOpen={isScheduleOpen}
        onClose={() => setIsScheduleOpen(false)}
      />
      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
      />
    </main>
  );
}
