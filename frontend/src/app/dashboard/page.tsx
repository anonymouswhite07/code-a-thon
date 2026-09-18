'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/shared/Navbar';
import { Footer } from '@/components/shared/Footer';
import { Mascot } from '@/components/mascot/Mascot';
import { api, getUser, UserSession, subscribeToEvents } from '@/lib/api';
import {
  Clock,
  Play,
  CheckCircle2,
  Lock,
  Trophy,
  History,
  Bell,
  Terminal,
  ChevronRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserSession | null>(null);
  const [rounds, setRounds] = useState<any[]>([]);
  const [activeRound, setActiveRound] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [remainingTime, setRemainingTime] = useState<number>(0);

  useEffect(() => {
    const currentUser = getUser();
    if (!currentUser) {
      router.push('/login');
      return;
    }
    setUser(currentUser);

    // Refresh me profile from backend
    api.auth.me().then(setUser).catch(() => {});

    // Fetch rounds
    api.rounds.getAll().then((data: any[]) => {
      setRounds(data);
      const live = data.find(r => r.status === 'LIVE');
      if (live) {
        setActiveRound(live);
        setRemainingTime(live.remainingSeconds || 0);
      }
    }).catch(() => {});

    // Fetch participant submissions
    api.submissions.getMySubmissions().then((data: any[]) => {
      setSubmissions(data || []);
    }).catch(() => {});

    // Fetch announcements
    api.announcements.getAll().then((data: any[]) => {
      setAnnouncements(data || []);
    }).catch(() => {});

    // Realtime SSE sync
    const unsubscribe = subscribeToEvents((event, data) => {
      if (event === 'ROUND_STARTED' || event === 'ROUND_ENDED' || event === 'ROUND_PAUSED' || event === 'ROUND_RESUMED') {
        api.rounds.getAll().then((allRounds: any[]) => {
          setRounds(allRounds);
          const live = allRounds.find(r => r.status === 'LIVE');
          setActiveRound(live || null);
          if (live) setRemainingTime(live.remainingSeconds || 0);
        });
      }
      if (event === 'ANNOUNCEMENT_CREATED') {
        api.announcements.getAll().then(setAnnouncements);
      }
      if (event === 'SUBMISSION_COMPLETED' || event === 'LEADERBOARD_UPDATED') {
        api.submissions.getMySubmissions().then(setSubmissions);
        api.auth.me().then(setUser);
      }
    });

    // Local countdown ticker
    const timer = setInterval(() => {
      setRemainingTime(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => {
      unsubscribe();
      clearInterval(timer);
    };
  }, [router]);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#F7F4ED] flex flex-col">
      <Navbar />

      <main className="flex-1 pt-28 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-8">
        {/* Welcome Header */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl brutal-border brutal-shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="inline-block px-2.5 py-0.5 bg-[#B8E63E] text-[#171717] font-mono text-xs font-black uppercase rounded brutal-border mb-2">
              Participant Verified
            </div>
            <h1 className="text-3xl sm:text-4xl font-black font-display text-[#171717]">
              HELLO, {user.fullName.toUpperCase()} 👋
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 font-medium">
              {user.college} • {user.department} ({user.year})
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="p-4 bg-[#F7F4ED] rounded-xl brutal-border text-center min-w-[110px]">
              <div className="text-xs font-mono font-bold text-gray-500 uppercase">Your Score</div>
              <div className="text-3xl font-black font-display text-[#3155FF]">
                {user.totalScore || 0}
              </div>
            </div>
            <div className="p-4 bg-[#F7F4ED] rounded-xl brutal-border text-center min-w-[110px]">
              <div className="text-xs font-mono font-bold text-gray-500 uppercase">Submissions</div>
              <div className="text-3xl font-black font-display text-[#FF6B35]">
                {submissions.length}
              </div>
            </div>
          </div>
        </div>

        {/* 3-Round Journey Roadmap */}
        <div className="bg-white p-6 rounded-2xl brutal-border brutal-shadow space-y-4">
          <div className="text-xs font-mono font-bold text-gray-500 uppercase flex items-center justify-between">
            <span>YOUR CODE-A-THON PROGRESSION:</span>
            <span className="text-[#3155FF]">Sequential Qualifier</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {rounds.map((round) => {
              const isLive = round.status === 'LIVE';
              const isEnded = round.status === 'ENDED';
              const isLocked = round.isLocked || round.status === 'SCHEDULED';

              return (
                <div
                  key={round.id}
                  className={`p-4 rounded-xl brutal-border flex items-center justify-between transition-all ${
                    isLive
                      ? 'bg-blue-50 border-[#3155FF] ring-2 ring-[#3155FF]/30'
                      : isEnded
                      ? 'bg-green-50/50'
                      : 'bg-gray-50 opacity-80'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm brutal-border ${
                        isEnded
                          ? 'bg-[#B8E63E] text-[#171717]'
                          : isLive
                          ? 'bg-[#3155FF] text-white animate-pulse'
                          : 'bg-gray-300 text-gray-600'
                      }`}
                    >
                      {isEnded ? <CheckCircle2 className="w-4 h-4" /> : round.roundNumber}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-[#171717]">{round.title}</div>
                      <div className="text-[11px] font-mono text-gray-500 uppercase">
                        {round.language} • {round.status}
                      </div>
                    </div>
                  </div>

                  {isLive ? (
                    <span className="px-2 py-0.5 bg-[#3155FF] text-white text-[10px] font-mono font-bold rounded">
                      ACTIVE
                    </span>
                  ) : isLocked ? (
                    <Lock className="w-4 h-4 text-gray-400" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Active Round Arena Banner */}
        {activeRound ? (
          <div className="bg-[#171717] text-white p-6 sm:p-8 rounded-2xl brutal-border brutal-shadow-lg flex flex-col md:flex-row items-center justify-between gap-6 border-l-8 border-[#B8E63E]">
            <div className="space-y-2 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-[#B8E63E] text-[#171717] font-mono text-xs font-black uppercase rounded">
                <span className="w-2 h-2 rounded-full bg-[#171717] animate-ping"></span> Live Round Open
              </div>
              <h2 className="text-3xl font-black font-display text-white">
                {activeRound.title} ({activeRound.language})
              </h2>
              <p className="text-xs sm:text-sm text-gray-300 max-w-xl font-medium">
                {activeRound.description}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
              <div className="bg-[#242424] px-5 py-3 rounded-xl border border-white/10 text-center w-full sm:w-auto">
                <div className="text-[10px] font-mono text-gray-400 uppercase">Time Remaining</div>
                <div className="text-2xl font-mono font-black text-[#FFD84D]">
                  {formatTimer(remainingTime)}
                </div>
              </div>

              <Link
                href={`/compete/${activeRound.id}`}
                className="px-6 py-3.5 bg-[#FF6B35] text-white font-black text-sm uppercase tracking-wider rounded-xl brutal-border brutal-shadow-sm brutal-shadow-hover flex items-center justify-center gap-2 w-full sm:w-auto whitespace-nowrap"
              >
                <Play className="w-4 h-4 fill-current" /> Enter Live Arena
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white p-8 rounded-2xl brutal-border brutal-shadow text-center space-y-3">
            <Mascot state="waiting" size={140} showQuote={true} customQuote="Waiting for admin to start round..." />
            <h3 className="text-xl font-black font-display text-[#171717]">
              No Active Competition Round at this Moment
            </h3>
            <p className="text-xs text-gray-500 font-medium max-w-md mx-auto">
              Keep your terminal and coffee ready! The admin will broadcast when the next round starts.
            </p>
          </div>
        )}

        {/* Submissions & Announcements Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Recent Submissions */}
          <div className="lg:col-span-8 bg-white p-6 rounded-2xl brutal-border brutal-shadow space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-[#3155FF]" />
                <h3 className="font-bold text-base text-[#171717]">Your Submission History</h3>
              </div>
              <span className="text-xs font-mono text-gray-500">{submissions.length} Total</span>
            </div>

            {submissions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b font-mono uppercase text-gray-500">
                      <th className="py-2">Question</th>
                      <th className="py-2">Lang</th>
                      <th className="py-2">Status</th>
                      <th className="py-2">Tests</th>
                      <th className="py-2">Score</th>
                      <th className="py-2 text-right">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y font-medium">
                    {submissions.map((s) => (
                      <tr key={s.id} className="hover:bg-gray-50">
                        <td className="py-2.5 font-bold text-[#171717]">{s.questionTitle}</td>
                        <td className="py-2.5 font-mono">{s.language}</td>
                        <td className="py-2.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                              s.status === 'PASSED'
                                ? 'bg-[#B8E63E] text-[#171717]'
                                : s.status === 'PARTIAL'
                                ? 'bg-[#FFD84D] text-[#171717]'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {s.status}
                          </span>
                        </td>
                        <td className="py-2.5 font-mono">{s.passedTestCases}/{s.totalTestCases}</td>
                        <td className="py-2.5 font-bold text-[#3155FF]">+{s.score}</td>
                        <td className="py-2.5 text-right font-mono text-gray-400">{s.executionTimeMs}ms</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-gray-500 font-mono">
                You have not submitted code yet. Enter the active arena to start!
              </div>
            )}
          </div>

          {/* Right: Announcements Feed */}
          <div className="lg:col-span-4 bg-white p-6 rounded-2xl brutal-border brutal-shadow space-y-4">
            <div className="flex items-center gap-2 border-b pb-3">
              <Bell className="w-4 h-4 text-[#FF6B35]" />
              <h3 className="font-bold text-base text-[#171717]">Arena Announcements</h3>
            </div>

            <div className="space-y-3">
              {announcements.map((a) => (
                <div key={a.id} className="p-3.5 bg-[#F7F4ED] rounded-xl brutal-border space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase text-[#FF6B35]">
                      {a.type}
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono">
                      {new Date(a.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-[#171717]">{a.title}</h4>
                  <p className="text-xs text-gray-600 leading-relaxed font-medium">
                    {a.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
