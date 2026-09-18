'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Terminal,
  ShieldAlert,
  Users,
  Play,
  Pause,
  StopCircle,
  Lock,
  Unlock,
  Plus,
  Trash2,
  Bell,
  History,
  CheckCircle2,
  XCircle,
  Clock,
  Layers,
  Award,
  RefreshCw,
  LogOut,
  Search
} from 'lucide-react';
import { api, getUser, logout, subscribeToEvents } from '@/lib/api';

export default function AdminConsolePage() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'rounds' | 'questions' | 'participants' | 'announcements' | 'audit'>('overview');

  // Data states
  const [rounds, setRounds] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [participants, setParticipants] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [searchPart, setSearchPart] = useState('');

  // Forms
  const [newAnn, setNewAnn] = useState({ title: '', content: '', type: 'GENERAL' });
  const [newQ, setNewQ] = useState({
    roundId: 1,
    title: '',
    slug: '',
    description: '',
    inputFormat: '',
    outputFormat: '',
    constraints: '',
    starterCode: '',
    difficulty: 'MEDIUM',
    points: 100,
    timeLimitMs: 2000,
    memoryLimitMb: 128
  });

  const loadData = () => {
    api.admin.getStats().then(setStats).catch(() => {});
    api.rounds.getAll().then(setRounds).catch(() => {});
    api.admin.getAllQuestions().then(setQuestions).catch(() => {});
    api.admin.getParticipants().then(setParticipants).catch(() => {});
    api.admin.getAuditLogs().then(setAuditLogs).catch(() => {});
  };

  useEffect(() => {
    const user = getUser();
    if (!user || (user.role !== 'ROLE_ADMIN' && user.role !== 'ROLE_SUPER_ADMIN')) {
      router.push('/login');
      return;
    }

    loadData();

    const unsubscribe = subscribeToEvents(() => {
      loadData();
    });

    return () => unsubscribe();
  }, [router]);

  const handleRoundControl = async (id: number, action: string) => {
    try {
      await api.admin.controlRound(id, action);
      loadData();
    } catch (err: any) {
      alert(`Action failed: ${err.message}`);
    }
  };

  const handleToggleSuspend = async (id: number) => {
    try {
      await api.admin.toggleSuspend(id);
      loadData();
    } catch (err: any) {
      alert(`Failed to toggle suspension: ${err.message}`);
    }
  };

  const handleToggleFreeze = async () => {
    if (!stats) return;
    try {
      await api.admin.toggleFreeze(!stats.leaderboardFrozen);
      loadData();
    } catch (err: any) {
      alert(`Freeze toggle failed: ${err.message}`);
    }
  };

  const handlePublishFinal = async () => {
    if (!stats) return;
    try {
      await api.admin.publishFinal(!stats.finalResultsPublished);
      loadData();
    } catch (err: any) {
      alert(`Publish failed: ${err.message}`);
    }
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.admin.createAnnouncement(newAnn);
      setNewAnn({ title: '', content: '', type: 'GENERAL' });
      loadData();
      alert('Announcement broadcasted in real-time!');
    } catch (err: any) {
      alert(`Failed to create announcement: ${err.message}`);
    }
  };

  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.admin.createQuestion({
        ...newQ,
        testCases: [
          { inputData: '10\n', expectedOutput: 'YES', isHidden: false },
          { inputData: '5\n', expectedOutput: 'NO', isHidden: true }
        ]
      });
      alert('Question and test cases added successfully!');
      loadData();
    } catch (err: any) {
      alert(`Failed to create question: ${err.message}`);
    }
  };

  const handleDeleteQuestion = async (id: number) => {
    if (!confirm('Are you sure you want to delete this question?')) return;
    try {
      await api.admin.deleteQuestion(id);
      loadData();
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#171717] text-white flex flex-col md:flex-row font-sans">
      {/* Dark Command Sidebar */}
      <aside className="w-full md:w-64 bg-[#121212] border-r border-white/10 p-4 flex flex-col justify-between shrink-0">
        <div className="space-y-6">
          <Link href="/" className="flex items-center gap-2.5 px-2">
            <div className="w-8 h-8 bg-[#FF6B35] text-white rounded-lg brutal-border flex items-center justify-center font-black">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-mono font-bold text-[#B8E63E] uppercase tracking-wider">
                GCT COMMAND CENTER
              </div>
              <div className="font-display font-black text-sm tracking-tight">
                ADMIN CONSOLE
              </div>
            </div>
          </Link>

          {/* Navigation Items */}
          <nav className="space-y-1 text-xs font-mono font-bold">
            {[
              { id: 'overview', label: 'Overview Metrics', icon: <Layers className="w-4 h-4" /> },
              { id: 'rounds', label: 'Round Controls', icon: <Play className="w-4 h-4" /> },
              { id: 'questions', label: 'Question Bank', icon: <Terminal className="w-4 h-4" /> },
              { id: 'participants', label: 'Participants', icon: <Users className="w-4 h-4" /> },
              { id: 'announcements', label: 'Announcements', icon: <Bell className="w-4 h-4" /> },
              { id: 'audit', label: 'Audit Trail', icon: <History className="w-4 h-4" /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                  activeTab === tab.id
                    ? 'bg-[#3155FF] text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="pt-4 border-t border-white/10 flex items-center justify-between">
          <button
            onClick={() => loadData()}
            className="flex items-center gap-1 text-xs font-mono text-gray-400 hover:text-white"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
          <button
            onClick={() => logout()}
            className="flex items-center gap-1 text-xs font-mono text-red-400 hover:text-red-300"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Command Workspace */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto space-y-8 bg-[#1a1a1a]">
        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <div className="text-xs font-mono text-[#FFD84D] uppercase">Live Controller</div>
            <h1 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-white uppercase">
              {activeTab} Management
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleToggleFreeze}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold brutal-border ${
                stats?.leaderboardFrozen
                  ? 'bg-amber-400 text-[#171717]'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              {stats?.leaderboardFrozen ? '❄ Leaderboard Frozen' : 'Freeze Leaderboard'}
            </button>

            <button
              onClick={handlePublishFinal}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold brutal-border ${
                stats?.finalResultsPublished
                  ? 'bg-[#B8E63E] text-[#171717]'
                  : 'bg-[#FF6B35] text-white hover:opacity-90'
              }`}
            >
              {stats?.finalResultsPublished ? '✓ Results Published' : 'Publish Final Winners'}
            </button>
          </div>
        </div>

        {/* TAB 1: OVERVIEW METRICS */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#242424] p-5 rounded-xl border border-white/10">
                <div className="text-xs font-mono text-gray-400 uppercase">Total Participants</div>
                <div className="text-3xl font-black font-display text-white mt-1">
                  {stats?.totalParticipants || 0}
                </div>
              </div>
              <div className="bg-[#242424] p-5 rounded-xl border border-white/10">
                <div className="text-xs font-mono text-gray-400 uppercase">Active Contestants</div>
                <div className="text-3xl font-black font-display text-[#B8E63E] mt-1">
                  {stats?.activeParticipants || 0}
                </div>
              </div>
              <div className="bg-[#242424] p-5 rounded-xl border border-white/10">
                <div className="text-xs font-mono text-gray-400 uppercase">Total Submissions</div>
                <div className="text-3xl font-black font-display text-[#3155FF] mt-1">
                  {stats?.totalSubmissions || 0}
                </div>
              </div>
              <div className="bg-[#242424] p-5 rounded-xl border border-white/10">
                <div className="text-xs font-mono text-gray-400 uppercase">Passed Runs</div>
                <div className="text-3xl font-black font-display text-[#FFD84D] mt-1">
                  {stats?.passedSubmissions || 0}
                </div>
              </div>
            </div>

            {/* Current Round Status Card */}
            <div className="bg-[#242424] p-6 rounded-2xl border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="text-xs font-mono text-[#FF6B35] uppercase font-bold">
                  Current Competition State
                </div>
                <div className="text-2xl font-black font-display text-white">
                  {stats?.currentRoundTitle}
                </div>
                <div className="text-xs text-gray-400 font-mono">
                  Remaining Clock: {Math.floor((stats?.currentRoundRemainingSeconds || 0) / 60)}m {(stats?.currentRoundRemainingSeconds || 0) % 60}s
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('rounds')}
                  className="px-4 py-2 bg-[#3155FF] text-white text-xs font-mono font-bold uppercase rounded-lg brutal-border"
                >
                  Manage Arena Lifecycle →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ROUND CONTROLS */}
        {activeTab === 'rounds' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {rounds.map((r) => (
                <div key={r.id} className="bg-[#242424] p-6 rounded-2xl border border-white/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 bg-white/10 rounded">
                      ROUND {r.roundNumber}
                    </span>
                    <span
                      className={`text-xs font-mono font-black px-2 py-0.5 rounded ${
                        r.status === 'LIVE'
                          ? 'bg-[#B8E63E] text-[#171717] animate-pulse'
                          : r.status === 'PAUSED'
                          ? 'bg-amber-400 text-[#171717]'
                          : 'bg-white/10 text-gray-400'
                      }`}
                    >
                      {r.status}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-black font-display text-white">{r.title}</h3>
                    <div className="text-xs text-gray-400 font-mono">Language: {r.language} • {r.durationMinutes} Mins</div>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    {r.status !== 'LIVE' ? (
                      <button
                        onClick={() => handleRoundControl(r.id, 'START')}
                        className="py-2 px-3 bg-[#B8E63E] text-[#171717] text-xs font-mono font-black uppercase rounded flex items-center justify-center gap-1"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" /> Start
                      </button>
                    ) : (
                      <button
                        onClick={() => handleRoundControl(r.id, 'PAUSE')}
                        className="py-2 px-3 bg-amber-400 text-[#171717] text-xs font-mono font-black uppercase rounded flex items-center justify-center gap-1"
                      >
                        <Pause className="w-3.5 h-3.5" /> Pause
                      </button>
                    )}

                    <button
                      onClick={() => handleRoundControl(r.id, 'END')}
                      className="py-2 px-3 bg-red-600 text-white text-xs font-mono font-black uppercase rounded flex items-center justify-center gap-1 hover:bg-red-700"
                    >
                      <StopCircle className="w-3.5 h-3.5" /> End Round
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: QUESTION BANK */}
        {activeTab === 'questions' && (
          <div className="space-y-6">
            {/* Create Question Form Accordion */}
            <div className="bg-[#242424] p-6 rounded-2xl border border-white/10 space-y-4">
              <h3 className="text-lg font-black font-display text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#B8E63E]" /> Add Competition Question
              </h3>
              <form onSubmit={handleCreateQuestion} className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
                <div>
                  <label className="block text-gray-400 uppercase mb-1">Target Round</label>
                  <select
                    value={newQ.roundId}
                    onChange={(e) => setNewQ({ ...newQ, roundId: Number(e.target.value) })}
                    className="w-full p-2 bg-[#171717] rounded border border-white/10"
                  >
                    <option value={1}>Round 01 (C)</option>
                    <option value={2}>Round 02 (Python)</option>
                    <option value={3}>Round 03 (Java)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 uppercase mb-1">Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Substring Anagram Finder"
                    value={newQ.title}
                    onChange={(e) => setNewQ({ ...newQ, title: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                    className="w-full p-2 bg-[#171717] rounded border border-white/10"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 uppercase mb-1">Points</label>
                  <input
                    type="number"
                    value={newQ.points}
                    onChange={(e) => setNewQ({ ...newQ, points: Number(e.target.value) })}
                    className="w-full p-2 bg-[#171717] rounded border border-white/10"
                  />
                </div>
                <div className="md:col-span-3">
                  <label className="block text-gray-400 uppercase mb-1">Problem Description (Markdown)</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="State problem specifications clearly..."
                    value={newQ.description}
                    onChange={(e) => setNewQ({ ...newQ, description: e.target.value })}
                    className="w-full p-2 bg-[#171717] rounded border border-white/10"
                  />
                </div>
                <div className="md:col-span-3">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-[#B8E63E] text-[#171717] font-mono font-black uppercase rounded-lg"
                  >
                    Save Question & Configure Test Cases
                  </button>
                </div>
              </form>
            </div>

            {/* Questions Table */}
            <div className="bg-[#242424] rounded-2xl border border-white/10 overflow-hidden">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="bg-[#171717] text-gray-400 uppercase border-b border-white/10">
                    <th className="p-3">ID</th>
                    <th className="p-3">Title</th>
                    <th className="p-3">Round</th>
                    <th className="p-3">Points</th>
                    <th className="p-3">Test Cases</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {questions.map((q) => (
                    <tr key={q.id} className="hover:bg-white/5">
                      <td className="p-3 font-bold text-[#FFD84D]">#{q.id}</td>
                      <td className="p-3 font-bold text-white">{q.title}</td>
                      <td className="p-3 text-gray-300">R{q.roundNumber} ({q.language})</td>
                      <td className="p-3 text-[#B8E63E]">{q.points} PTS</td>
                      <td className="p-3 text-gray-400">{q.sampleTestCases?.length || 0} Configured</td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleDeleteQuestion(q.id)}
                          className="p-1 text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: PARTICIPANTS */}
        {activeTab === 'participants' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="relative max-w-sm w-full">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search participant name, email..."
                  value={searchPart}
                  onChange={(e) => setSearchPart(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-[#242424] rounded-lg border border-white/10 text-xs font-mono text-white focus:outline-none focus:border-[#3155FF]"
                />
              </div>
              <span className="text-xs font-mono text-gray-400">
                {participants.length} Registered
              </span>
            </div>

            <div className="bg-[#242424] rounded-2xl border border-white/10 overflow-hidden">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="bg-[#171717] text-gray-400 uppercase border-b border-white/10">
                    <th className="p-3">ID</th>
                    <th className="p-3">Name</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">Dept & Year</th>
                    <th className="p-3">Score</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {participants
                    .filter(p => p.fullName.toLowerCase().includes(searchPart.toLowerCase()) || p.email.toLowerCase().includes(searchPart.toLowerCase()))
                    .map((p) => (
                      <tr key={p.id} className="hover:bg-white/5">
                        <td className="p-3">#{p.id}</td>
                        <td className="p-3 font-bold text-white">{p.fullName}</td>
                        <td className="p-3 text-gray-400">{p.email}</td>
                        <td className="p-3 text-gray-300">{p.department} ({p.year})</td>
                        <td className="p-3 font-bold text-[#B8E63E]">{p.totalScore}</td>
                        <td className="p-3">
                          {p.isSuspended ? (
                            <span className="text-red-400 font-bold">SUSPENDED</span>
                          ) : (
                            <span className="text-green-400">ACTIVE</span>
                          )}
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleToggleSuspend(p.id)}
                            className={`px-2.5 py-1 rounded text-[11px] font-bold ${
                              p.isSuspended ? 'bg-green-600 text-white' : 'bg-red-900/60 text-red-300'
                            }`}
                          >
                            {p.isSuspended ? 'Restore' : 'Suspend'}
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: ANNOUNCEMENTS */}
        {activeTab === 'announcements' && (
          <div className="space-y-6">
            <div className="bg-[#242424] p-6 rounded-2xl border border-white/10 space-y-4">
              <h3 className="text-lg font-black font-display text-white flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#FF6B35]" /> Broadcast Live Announcement
              </h3>
              <form onSubmit={handleCreateAnnouncement} className="space-y-3 text-xs font-mono">
                <div>
                  <label className="block text-gray-400 uppercase mb-1">Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 15 Minutes Remaining in Round 01!"
                    value={newAnn.title}
                    onChange={(e) => setNewAnn({ ...newAnn, title: e.target.value })}
                    className="w-full p-2 bg-[#171717] rounded border border-white/10"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 uppercase mb-1">Announcement Message</label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Content pushed live to all participants via SSE..."
                    value={newAnn.content}
                    onChange={(e) => setNewAnn({ ...newAnn, content: e.target.value })}
                    className="w-full p-2 bg-[#171717] rounded border border-white/10"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#FF6B35] text-white font-black uppercase rounded-lg"
                >
                  Push Live Announcement 📢
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 6: AUDIT TRAIL */}
        {activeTab === 'audit' && (
          <div className="space-y-4">
            <div className="text-xs font-mono text-gray-400">
              Immutable chronological record of administrative actions.
            </div>

            <div className="bg-[#242424] rounded-2xl border border-white/10 overflow-hidden">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="bg-[#171717] text-gray-400 uppercase border-b border-white/10">
                    <th className="p-3">Timestamp</th>
                    <th className="p-3">Admin Email</th>
                    <th className="p-3">Action</th>
                    <th className="p-3">Target Entity</th>
                    <th className="p-3">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-white/5">
                      <td className="p-3 text-gray-400">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="p-3 font-bold text-white">{log.userEmail}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 bg-white/10 rounded font-bold text-[#FFD84D]">
                          {log.action}
                        </span>
                      </td>
                      <td className="p-3 text-gray-300">{log.targetEntity}</td>
                      <td className="p-3 text-gray-400">{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
