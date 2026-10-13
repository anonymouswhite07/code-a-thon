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
  Edit3,
  Bell,
  History,
  CheckCircle2,
  XCircle,
  Clock,
  Layers,
  Award,
  RefreshCw,
  LogOut,
  Search,
  Download,
  Trophy,
  Filter
} from 'lucide-react';
import { api, getUser, logout, subscribeToEvents } from '@/lib/api';
import CustomModal, { ModalConfig } from '@/components/shared/CustomModal';

export default function AdminConsolePage() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'leaderboard' | 'rounds' | 'questions' | 'participants' | 'announcements' | 'audit' | 'integrity'>('overview');

  // Leaderboard states
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
  const [lbSearch, setLbSearch] = useState('');
  const [lbDeptFilter, setLbDeptFilter] = useState('ALL');

  // Data states
  const [rounds, setRounds] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [participants, setParticipants] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [integritySessions, setIntegritySessions] = useState<any[]>([]);
  const [integrityEvents, setIntegrityEvents] = useState<any[]>([]);
  const [searchPart, setSearchPart] = useState('');
  const [roundDurations, setRoundDurations] = useState<Record<number, number>>({});
  const [editingQ, setEditingQ] = useState<any | null>(null);

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
    api.admin.getIntegritySessions().then(setIntegritySessions).catch(() => {});
    api.admin.getIntegrityEvents().then(setIntegrityEvents).catch(() => {});
    api.admin.getLeaderboard().then((res: any) => {
      if (res && res.leaderboard) {
        setLeaderboardData(res.leaderboard);
      } else if (Array.isArray(res)) {
        setLeaderboardData(res);
      }
    }).catch(() => {});
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

  const [modalConfig, setModalConfig] = useState<ModalConfig | null>(null);

  const showCustomAlert = (
    title: string,
    message: string,
    type: 'alert' | 'warning' | 'danger' | 'success' | 'info' = 'alert'
  ) => {
    setModalConfig({
      isOpen: true,
      title,
      message,
      type,
      confirmText: 'Understood',
      onConfirm: () => setModalConfig(null)
    });
  };

  const showCustomConfirm = (
    title: string,
    message: string,
    onConfirm: () => void,
    confirmText: string = 'Confirm & Proceed',
    cancelText: string = 'Cancel',
    type: 'confirm' | 'danger' | 'warning' = 'confirm'
  ) => {
    setModalConfig({
      isOpen: true,
      title,
      message,
      type,
      confirmText,
      cancelText,
      onConfirm: () => {
        setModalConfig(null);
        onConfirm();
      },
      onCancel: () => setModalConfig(null)
    });
  };

  const handleRoundControl = async (id: number, action: string, durationMinutes?: number) => {
    try {
      await api.admin.controlRound(id, action, durationMinutes);
      loadData();
    } catch (err: any) {
      showCustomAlert('Action Failed', err.message, 'danger');
    }
  };

  const handleRoundDurationChange = async (id: number, durationMinutes: number) => {
    if (!durationMinutes || durationMinutes <= 0) {
      showCustomAlert('Invalid Duration', 'Duration must be greater than 0 minutes.', 'warning');
      return;
    }
    try {
      await api.admin.controlRound(id, 'SET_DURATION', durationMinutes);
      showCustomAlert('Duration Updated', `Round #${id} duration updated to ${durationMinutes} minutes.`, 'success');
      loadData();
    } catch (err: any) {
      showCustomAlert('Update Failed', err.message, 'danger');
    }
  };

  const handleStartEditQuestion = (q: any) => {
    setEditingQ({
      id: q.id,
      title: q.title || '',
      slug: q.slug || '',
      description: q.description || '',
      points: q.points || 100,
      difficulty: q.difficulty || 'MEDIUM',
      inputFormat: q.inputFormat || '',
      outputFormat: q.outputFormat || '',
      constraints: q.constraints || '',
      starterCode: q.starterCode || '',
      timeLimitMs: q.timeLimitMs || 2000,
      memoryLimitMb: q.memoryLimitMb || 128
    });
  };

  const handleSaveEditQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQ) return;
    try {
      await api.admin.updateQuestion(editingQ.id, editingQ);
      showCustomAlert('Question Updated', `Question #${editingQ.id} ("${editingQ.title}") was successfully updated.`, 'success');
      setEditingQ(null);
      loadData();
    } catch (err: any) {
      showCustomAlert('Update Failed', `Could not update question: ${err.message}`, 'danger');
    }
  };

  const handleToggleSuspend = async (id: number) => {
    try {
      await api.admin.toggleSuspend(id);
      loadData();
    } catch (err: any) {
      showCustomAlert('Toggle Failed', `Failed to toggle suspension: ${err.message}`, 'danger');
    }
  };

  const handleToggleFreeze = async () => {
    if (!stats) return;
    try {
      await api.admin.toggleFreeze(!stats.leaderboardFrozen);
      loadData();
    } catch (err: any) {
      showCustomAlert('Freeze Error', `Freeze toggle failed: ${err.message}`, 'danger');
    }
  };

  const handlePublishFinal = async () => {
    if (!stats) return;
    try {
      await api.admin.publishFinal(!stats.finalResultsPublished);
      loadData();
    } catch (err: any) {
      showCustomAlert('Publish Error', `Publish failed: ${err.message}`, 'danger');
    }
  };

  const handleExportLeaderboardCsv = () => {
    if (!leaderboardData || leaderboardData.length === 0) {
      showCustomAlert('No Records', 'No leaderboard data available to export.', 'warning');
      return;
    }
    const headers = ['Rank', 'Participant Name', 'College', 'Department', 'Round 1 (C)', 'Round 2 (Java)', 'Round 3 (Python)', 'Total Score', 'Problems Solved', 'Execution Time (ms)'];
    const rows = leaderboardData.map((row: any, idx: number) => [
      row.rank || (idx + 1),
      `"${(row.fullName || '').replace(/"/g, '""')}"`,
      `"${(row.college || '').replace(/"/g, '""')}"`,
      `"${(row.department || '').replace(/"/g, '""')}"`,
      row.round1Score ?? 0,
      row.round2Score ?? 0,
      row.round3Score ?? 0,
      row.totalScore ?? 0,
      row.solvedCount ?? 0,
      row.totalExecutionTimeMs ?? 0
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `codeathon_leaderboard_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleResetParticipantSession = async (sessionId: number, participantName: string, roundTitle: string) => {
    showCustomConfirm(
      `Restart Round for ${participantName}`,
      `Are you sure you want to restart ${roundTitle} for ${participantName}?\n\nThis will clear all question locks, reinstate their competition session to ACTIVE, and allow them to re-enter the fullscreen arena cleanly.`,
      async () => {
        try {
          const res: any = await api.admin.resetIntegritySession(sessionId);
          showCustomAlert('Round Restarted', res?.message || `Round successfully restarted for ${participantName}!`, 'success');
          loadData();
        } catch (err: any) {
          showCustomAlert('Restart Failed', `Failed to restart round: ${err.message}`, 'danger');
        }
      },
      'Restart & Unlock Session',
      'Cancel',
      'warning'
    );
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.admin.createAnnouncement(newAnn);
      setNewAnn({ title: '', content: '', type: 'GENERAL' });
      loadData();
      showCustomAlert('Announcement Published', 'Announcement broadcasted in real-time!', 'success');
    } catch (err: any) {
      showCustomAlert('Announcement Failed', `Failed to create announcement: ${err.message}`, 'danger');
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
      showCustomAlert('Question Created', 'Question and test cases added successfully!', 'success');
      loadData();
    } catch (err: any) {
      showCustomAlert('Creation Error', `Failed to create question: ${err.message}`, 'danger');
    }
  };

  const handleDeleteQuestion = async (id: number) => {
    showCustomConfirm(
      'Delete Question',
      'Are you sure you want to permanently delete this question and all its test cases?',
      async () => {
        try {
          await api.admin.deleteQuestion(id);
          loadData();
          showCustomAlert('Deleted', 'Question removed successfully.', 'success');
        } catch (err: any) {
          showCustomAlert('Delete Failed', `Delete failed: ${err.message}`, 'danger');
        }
      },
      'Delete Question',
      'Cancel',
      'danger'
    );
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
              { id: 'leaderboard', label: 'Live Leaderboard', icon: <Trophy className="w-4 h-4 text-amber-400" /> },
              { id: 'rounds', label: 'Round Controls', icon: <Play className="w-4 h-4" /> },
              { id: 'questions', label: 'Question Bank', icon: <Terminal className="w-4 h-4" /> },
              { id: 'participants', label: 'Participants', icon: <Users className="w-4 h-4" /> },
              { id: 'announcements', label: 'Announcements', icon: <Bell className="w-4 h-4" /> },
              { id: 'integrity', label: 'Integrity Monitor', icon: <ShieldAlert className="w-4 h-4 text-red-400" /> },
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
                    <div className="text-xs text-gray-400 font-mono">Language: {r.language} • Current: {r.durationMinutes} Mins</div>
                  </div>

                  {/* Duration Selection */}
                  <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                    <span className="text-xs font-mono text-gray-400">Duration:</span>
                    <input
                      type="number"
                      min="1"
                      max="300"
                      value={roundDurations[r.id] ?? r.durationMinutes ?? 45}
                      onChange={(e) => setRoundDurations({ ...roundDurations, [r.id]: Number(e.target.value) })}
                      className="w-16 px-2 py-1 bg-[#171717] rounded border border-white/10 text-xs text-white font-mono"
                    />
                    <span className="text-xs font-mono text-gray-400">mins</span>
                    <button
                      onClick={() => handleRoundDurationChange(r.id, roundDurations[r.id] ?? r.durationMinutes ?? 45)}
                      className="px-2.5 py-1 bg-[#3155FF] hover:bg-blue-600 text-white rounded text-xs font-mono font-bold"
                    >
                      Set Time
                    </button>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    {r.status !== 'LIVE' ? (
                      <button
                        onClick={() => handleRoundControl(r.id, 'START', roundDurations[r.id] ?? r.durationMinutes)}
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
                      <td className="p-3 text-right flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleStartEditQuestion(q)}
                          className="p-1 text-blue-400 hover:text-blue-300"
                          title="Edit Question"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteQuestion(q.id)}
                          className="p-1 text-red-400 hover:text-red-300"
                          title="Delete Question"
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
        {/* TAB 7: INTEGRITY MONITOR */}
        {activeTab === 'integrity' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black font-display text-white">Competition Integrity Command Center</h3>
                <p className="text-xs font-mono text-gray-400">
                  Real-time monitoring of tab switching, fullscreen exits, and clipboard violations.
                </p>
              </div>
              <button
                onClick={() => {
                  api.admin.getIntegritySessions().then(setIntegritySessions);
                  api.admin.getIntegrityEvents().then(setIntegrityEvents);
                }}
                className="px-3 py-1.5 bg-[#3155FF] text-white rounded-lg text-xs font-mono font-bold flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Refresh Live Feed
              </button>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-[#242424] p-4 rounded-xl border border-white/10 space-y-1">
                <div className="text-[10px] font-mono text-gray-400 uppercase">Active Sessions</div>
                <div className="text-2xl font-black font-mono text-[#B8E63E]">{integritySessions.length}</div>
              </div>
              <div className="bg-[#242424] p-4 rounded-xl border border-red-500/30 space-y-1">
                <div className="text-[10px] font-mono text-red-400 uppercase">Tab Switch Violations</div>
                <div className="text-2xl font-black font-mono text-red-400">
                  {integritySessions.reduce((acc, s) => acc + (s.tabSwitchCount || 0), 0)}
                </div>
              </div>
              <div className="bg-[#242424] p-4 rounded-xl border border-amber-500/30 space-y-1">
                <div className="text-[10px] font-mono text-amber-400 uppercase">Fullscreen Exits</div>
                <div className="text-2xl font-black font-mono text-amber-400">
                  {integritySessions.reduce((acc, s) => acc + (s.fullscreenExitCount || 0), 0)}
                </div>
              </div>
              <div className="bg-[#242424] p-4 rounded-xl border border-white/10 space-y-1">
                <div className="text-[10px] font-mono text-gray-400 uppercase">Clipboard Attempts</div>
                <div className="text-2xl font-black font-mono text-white">
                  {integritySessions.reduce((acc, s) => acc + (s.clipboardAttemptCount || 0), 0)}
                </div>
              </div>
            </div>

            {/* Active Sessions Table */}
            <div className="bg-[#242424] rounded-2xl border border-white/10 overflow-hidden space-y-3 p-4">
              <h4 className="font-bold text-sm text-white font-mono uppercase">Live Participant Sessions</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="bg-[#171717] text-gray-400 uppercase border-b border-white/10">
                      <th className="p-2.5">Participant</th>
                      <th className="p-2.5">College</th>
                      <th className="p-2.5">Round</th>
                      <th className="p-2.5">Tab Switches</th>
                      <th className="p-2.5">Fullscreen Exits</th>
                      <th className="p-2.5">Clipboard Attempts</th>
                      <th className="p-2.5">Session Status</th>
                      <th className="p-2.5 text-right">Admin Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {integritySessions.map((s) => (
                      <tr key={s.sessionId} className="hover:bg-white/5">
                        <td className="p-2.5">
                          <div className="font-bold text-white">{s.participantName}</div>
                          <div className="text-[10px] text-gray-400">{s.participantEmail}</div>
                        </td>
                        <td className="p-2.5 text-gray-300">{s.college}</td>
                        <td className="p-2.5 text-[#FFD84D] font-bold">{s.roundTitle}</td>
                        <td className="p-2.5">
                          <span className={`px-2 py-0.5 rounded font-black ${s.tabSwitchCount > 0 ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'text-gray-400'}`}>
                            {s.tabSwitchCount} {s.tabSwitchCount > 0 && '🚨'}
                          </span>
                        </td>
                        <td className="p-2.5">
                          <span className={`px-2 py-0.5 rounded font-bold ${s.fullscreenExitCount > 0 ? 'bg-amber-500/20 text-amber-400' : 'text-gray-400'}`}>
                            {s.fullscreenExitCount}
                          </span>
                        </td>
                        <td className="p-2.5 text-gray-300">{s.clipboardAttemptCount}</td>
                        <td className="p-2.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                            s.status === 'TERMINATED_FULLSCREEN'
                              ? 'bg-red-600 text-white animate-pulse'
                              : s.status === 'ACTIVE'
                              ? 'bg-[#B8E63E] text-[#171717]'
                              : 'bg-white/10 text-gray-300'
                          }`}>
                            {s.status === 'TERMINATED_FULLSCREEN' ? 'TERMINATED (FULLSCREEN)' : s.status}
                          </span>
                        </td>
                        <td className="p-2.5 text-right">
                          <button
                            onClick={() => handleResetParticipantSession(s.sessionId, s.participantName, s.roundTitle)}
                            className="px-2.5 py-1 bg-[#10B981] hover:bg-[#059669] text-white rounded font-mono font-bold text-[11px] uppercase tracking-wider inline-flex items-center gap-1 transition-transform hover:scale-105 shadow-sm"
                            title="Restart Round & unlock questions for this participant"
                          >
                            <RefreshCw className="w-3 h-3" /> Restart Round
                          </button>
                        </td>
                      </tr>
                    ))}
                    {integritySessions.length === 0 && (
                      <tr>
                        <td colSpan={8} className="p-4 text-center text-gray-500">
                          No active competition sessions recorded yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Live Integrity Event Trail */}
            <div className="bg-[#242424] rounded-2xl border border-white/10 overflow-hidden space-y-3 p-4">
              <h4 className="font-bold text-sm text-white font-mono uppercase">Live Integrity Violation &amp; Event Stream</h4>
              <div className="overflow-x-auto max-h-96 overflow-y-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="bg-[#171717] text-gray-400 uppercase border-b border-white/10 sticky top-0">
                      <th className="p-2.5">Timestamp</th>
                      <th className="p-2.5">Participant</th>
                      <th className="p-2.5">Event Type</th>
                      <th className="p-2.5">Context</th>
                      <th className="p-2.5">IP Address</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {integrityEvents.map((e) => (
                      <tr key={e.id} className="hover:bg-white/5">
                        <td className="p-2.5 text-gray-400 whitespace-nowrap">
                          {new Date(e.serverTimestamp).toLocaleTimeString()}
                        </td>
                        <td className="p-2.5">
                          <span className="font-bold text-white">{e.participantName}</span>
                        </td>
                        <td className="p-2.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                            e.eventType === 'FULLSCREEN_EXIT_TERMINATION'
                              ? 'bg-red-600 text-white font-black animate-pulse'
                              : e.eventType === 'ADMIN_ROUND_RESET'
                              ? 'bg-emerald-500 text-black font-black'
                              : e.eventType === 'TAB_HIDDEN' || e.eventType === 'QUESTION_LOCKED'
                              ? 'bg-red-500 text-white'
                              : e.eventType === 'AUTO_SUBMISSION_CONFIRMED'
                              ? 'bg-[#FF6B35] text-white'
                              : e.eventType === 'FULLSCREEN_EXITED'
                              ? 'bg-amber-400 text-[#171717]'
                              : 'bg-white/10 text-[#B8E63E]'
                          }`}>
                            {e.eventType}
                          </span>
                        </td>
                        <td className="p-2.5 text-gray-300 max-w-md truncate">{e.eventContext}</td>
                        <td className="p-2.5 text-gray-500">{e.ipAddress}</td>
                      </tr>
                    ))}
                    {integrityEvents.length === 0 && (
                      <tr>
                        <td colSpan={5} className="p-4 text-center text-gray-500">
                          No integrity events recorded yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 8: LIVE LEADERBOARD */}
        {activeTab === 'leaderboard' && (
          <div className="space-y-6">
            {/* Top Score & Status Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#242424] p-5 rounded-xl border border-white/10">
                <div className="text-xs font-mono text-gray-400 uppercase">Ranked Contestants</div>
                <div className="text-3xl font-black font-display text-white mt-1">
                  {leaderboardData.length}
                </div>
              </div>
              <div className="bg-[#242424] p-5 rounded-xl border border-white/10">
                <div className="text-xs font-mono text-gray-400 uppercase">Current Leader (#1)</div>
                <div className="text-xl font-black font-display text-[#FFD84D] truncate mt-1">
                  {leaderboardData[0]?.fullName || '—'}
                </div>
                <div className="text-[10px] font-mono text-gray-400">
                  {leaderboardData[0] ? `${leaderboardData[0].totalScore} pts (${leaderboardData[0].solvedCount} solved)` : 'Awaiting submissions'}
                </div>
              </div>
              <div className="bg-[#242424] p-5 rounded-xl border border-white/10">
                <div className="text-xs font-mono text-gray-400 uppercase">Public Scoreboard</div>
                <div className="mt-1">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-black ${
                    stats?.leaderboardFrozen
                      ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                      : 'bg-emerald-400/20 text-[#B8E63E] border border-emerald-400/30'
                  }`}>
                    {stats?.leaderboardFrozen ? '❄ FROZEN' : '● LIVE UPDATES'}
                  </span>
                </div>
              </div>
              <div className="bg-[#242424] p-5 rounded-xl border border-white/10">
                <div className="text-xs font-mono text-gray-400 uppercase">Winner Publication</div>
                <div className="mt-1">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-black ${
                    stats?.finalResultsPublished
                      ? 'bg-[#B8E63E]/20 text-[#B8E63E] border border-[#B8E63E]/30'
                      : 'bg-white/10 text-gray-400 border border-white/10'
                  }`}>
                    {stats?.finalResultsPublished ? '✓ FINAL PUBLISHED' : 'DRAFT / IN-PROGRESS'}
                  </span>
                </div>
              </div>
            </div>

            {/* Filter and Control Bar */}
            <div className="bg-[#242424] p-4 rounded-xl border border-white/10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              <div className="flex flex-1 flex-col sm:flex-row items-center gap-3">
                <div className="relative flex-1 w-full sm:w-auto">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search candidate name, college..."
                    value={lbSearch}
                    onChange={(e) => setLbSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-[#171717] rounded-lg border border-white/10 text-xs font-mono text-white placeholder-gray-500 focus:outline-none focus:border-[#3155FF]"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Filter className="w-4 h-4 text-gray-400 shrink-0" />
                  <select
                    value={lbDeptFilter}
                    onChange={(e) => setLbDeptFilter(e.target.value)}
                    className="w-full sm:w-auto px-3 py-2 bg-[#171717] rounded-lg border border-white/10 text-xs font-mono text-white focus:outline-none focus:border-[#3155FF]"
                  >
                    <option value="ALL">All Departments</option>
                    {Array.from(new Set(leaderboardData.map((d: any) => d.department).filter(Boolean))).map((dept: any) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleExportLeaderboardCsv}
                  className="flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-mono font-bold transition-colors"
                  title="Export complete leaderboard to CSV"
                >
                  <Download className="w-3.5 h-3.5 text-[#B8E63E]" /> Export CSV
                </button>
                <button
                  onClick={() => loadData()}
                  className="flex items-center gap-1.5 px-3 py-2 bg-[#3155FF] hover:bg-blue-600 text-white rounded-lg text-xs font-mono font-bold transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Refresh
                </button>
              </div>
            </div>

            {/* Standings Table */}
            <div className="bg-[#242424] rounded-2xl border border-white/10 overflow-hidden shadow-xl">
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black font-display text-white uppercase tracking-wider flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-[#FFD84D]" /> Real-Time Competition Standings
                  </h3>
                  <p className="text-[11px] font-mono text-gray-400 mt-0.5">
                    Live scores calculated across Round 1 (C), Round 2 (Java), and Round 3 (Python)
                  </p>
                </div>
                <div className="text-xs font-mono text-gray-400">
                  Showing {
                    leaderboardData
                      .filter((row: any) => {
                        const matchesSearch = !lbSearch || 
                          row.fullName?.toLowerCase().includes(lbSearch.toLowerCase()) ||
                          row.college?.toLowerCase().includes(lbSearch.toLowerCase());
                        const matchesDept = lbDeptFilter === 'ALL' || row.department === lbDeptFilter;
                        return matchesSearch && matchesDept;
                      }).length
                  } contestants
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-[#171717] text-gray-400 uppercase border-b border-white/10">
                    <tr>
                      <th className="p-3 w-16 text-center">Rank</th>
                      <th className="p-3">Participant</th>
                      <th className="p-3">Department</th>
                      <th className="p-3 text-center text-[#FF6B35]">R1 (C)</th>
                      <th className="p-3 text-center text-[#3155FF]">R2 (Java)</th>
                      <th className="p-3 text-center text-[#B8E63E]">R3 (Python)</th>
                      <th className="p-3 text-center">Solved</th>
                      <th className="p-3 text-right">Exec Time</th>
                      <th className="p-3 text-right text-[#FFD84D]">Total Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {leaderboardData
                      .filter((row: any) => {
                        const matchesSearch = !lbSearch || 
                          row.fullName?.toLowerCase().includes(lbSearch.toLowerCase()) ||
                          row.college?.toLowerCase().includes(lbSearch.toLowerCase());
                        const matchesDept = lbDeptFilter === 'ALL' || row.department === lbDeptFilter;
                        return matchesSearch && matchesDept;
                      })
                      .map((row: any, idx: number) => {
                        const displayRank = row.rank || idx + 1;
                        return (
                          <tr key={row.participantId || idx} className="hover:bg-white/5 transition-colors">
                            <td className="p-3 text-center font-black">
                              {displayRank === 1 ? (
                                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 text-xs shadow">
                                  🥇 1
                                </span>
                              ) : displayRank === 2 ? (
                                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-300/20 text-slate-200 border border-slate-300/40 text-xs shadow">
                                  🥈 2
                                </span>
                              ) : displayRank === 3 ? (
                                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-700/20 text-amber-500 border border-amber-600/40 text-xs shadow">
                                  🥉 3
                                </span>
                              ) : (
                                <span className="text-gray-400 font-bold">#{displayRank}</span>
                              )}
                            </td>
                            <td className="p-3">
                              <div className="font-bold text-white text-sm">{row.fullName || 'Anonymous'}</div>
                              <div className="text-[10px] text-gray-400 truncate max-w-xs">{row.college || '—'}</div>
                            </td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 bg-white/5 rounded text-[11px] text-gray-300 border border-white/5">
                                {row.department || 'General'}
                              </span>
                            </td>
                            <td className="p-3 text-center font-bold text-white">
                              {row.round1Score ?? 0}
                            </td>
                            <td className="p-3 text-center font-bold text-white">
                              {row.round2Score ?? 0}
                            </td>
                            <td className="p-3 text-center font-bold text-white">
                              {row.round3Score ?? 0}
                            </td>
                            <td className="p-3 text-center">
                              <span className="px-2 py-0.5 rounded-full bg-white/10 text-gray-200 text-[10px] font-bold">
                                {row.solvedCount ?? 0}
                              </span>
                            </td>
                            <td className="p-3 text-right text-gray-400">
                              {(row.totalExecutionTimeMs || 0)}ms
                            </td>
                            <td className="p-3 text-right">
                              <span className="text-base font-black font-display text-[#FFD84D]">
                                {row.totalScore ?? 0}
                              </span>
                              <span className="text-[10px] text-gray-400 ml-1">pts</span>
                            </td>
                          </tr>
                        );
                      })}
                    {leaderboardData.length === 0 && (
                      <tr>
                        <td colSpan={9} className="p-8 text-center text-gray-500 font-mono">
                          No submissions recorded yet. The leaderboard will populate as contestants solve problems.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Edit Question Modal */}
      {editingQ && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#242424] max-w-2xl w-full rounded-2xl brutal-border border-white/20 p-6 space-y-4 text-white max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-lg font-black font-display text-white flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-[#3155FF]" /> Edit Question #{editingQ.id}
              </h3>
              <button
                onClick={() => setEditingQ(null)}
                className="text-gray-400 hover:text-white text-xs font-mono px-2 py-1 bg-white/5 rounded"
              >
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleSaveEditQuestion} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div className="md:col-span-2">
                <label className="block text-gray-400 uppercase mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={editingQ.title}
                  onChange={(e) => setEditingQ({ ...editingQ, title: e.target.value })}
                  className="w-full p-2 bg-[#171717] rounded border border-white/10 text-white"
                />
              </div>

              <div>
                <label className="block text-gray-400 uppercase mb-1">Points</label>
                <input
                  type="number"
                  required
                  value={editingQ.points}
                  onChange={(e) => setEditingQ({ ...editingQ, points: Number(e.target.value) })}
                  className="w-full p-2 bg-[#171717] rounded border border-white/10 text-white"
                />
              </div>

              <div>
                <label className="block text-gray-400 uppercase mb-1">Difficulty</label>
                <select
                  value={editingQ.difficulty}
                  onChange={(e) => setEditingQ({ ...editingQ, difficulty: e.target.value })}
                  className="w-full p-2 bg-[#171717] rounded border border-white/10 text-white"
                >
                  <option value="EASY">EASY</option>
                  <option value="MEDIUM">MEDIUM</option>
                  <option value="HARD">HARD</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-gray-400 uppercase mb-1">Description (Markdown)</label>
                <textarea
                  rows={4}
                  required
                  value={editingQ.description}
                  onChange={(e) => setEditingQ({ ...editingQ, description: e.target.value })}
                  className="w-full p-2 bg-[#171717] rounded border border-white/10 text-white"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-gray-400 uppercase mb-1">Starter Code</label>
                <textarea
                  rows={4}
                  value={editingQ.starterCode}
                  onChange={(e) => setEditingQ({ ...editingQ, starterCode: e.target.value })}
                  className="w-full p-2 bg-[#171717] rounded border border-white/10 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-gray-400 uppercase mb-1">Input Format</label>
                <input
                  type="text"
                  value={editingQ.inputFormat || ''}
                  onChange={(e) => setEditingQ({ ...editingQ, inputFormat: e.target.value })}
                  className="w-full p-2 bg-[#171717] rounded border border-white/10 text-white"
                />
              </div>

              <div>
                <label className="block text-gray-400 uppercase mb-1">Output Format</label>
                <input
                  type="text"
                  value={editingQ.outputFormat || ''}
                  onChange={(e) => setEditingQ({ ...editingQ, outputFormat: e.target.value })}
                  className="w-full p-2 bg-[#171717] rounded border border-white/10 text-white"
                />
              </div>

              <div className="md:col-span-2 flex justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingQ(null)}
                  className="px-4 py-2 bg-white/10 text-white font-mono rounded hover:bg-white/20"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#3155FF] hover:bg-blue-600 text-white font-mono font-bold uppercase rounded"
                >
                  Save Question Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* In-App Custom Modal Dialog */}
      <CustomModal config={modalConfig} onClose={() => setModalConfig(null)} />
    </div>
  );
}
