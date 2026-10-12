'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Terminal,
  Award,
  Search,
  Code2,
  CheckCircle2,
  XCircle,
  Eye,
  LogOut,
  RefreshCw,
  FileText,
  ShieldAlert,
  AlertTriangle,
  Clock
} from 'lucide-react';
import { api, getUser, logout } from '@/lib/api';
import CustomModal, { ModalConfig } from '@/components/shared/CustomModal';

export default function JudgeDeskPage() {
  const router = useRouter();
  const [modalConfig, setModalConfig] = useState<ModalConfig | null>(null);

  const showCustomAlert = (
    title: string,
    message: string,
    type: 'alert' | 'warning' | 'danger' | 'success' = 'danger'
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

  const [submissions, setSubmissions] = useState<any[]>([]);
  const [selectedSub, setSelectedSub] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filterRound, setFilterRound] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [integrityTimeline, setIntegrityTimeline] = useState<any[]>([]);
  const [showTimelineModal, setShowTimelineModal] = useState<boolean>(false);
  const [loadingTimeline, setLoadingTimeline] = useState<boolean>(false);

  const loadSubmissions = () => {
    setLoading(true);
    api.judge.getSubmissions(filterRound ? Number(filterRound) : undefined, filterStatus || undefined)
      .then((data: any[]) => setSubmissions(data || []))
      .catch((err: any) => showCustomAlert('Load Error', err?.message || 'Failed to load submissions', 'danger'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const user = getUser();
    if (!user || (user.role !== 'ROLE_JUDGE' && user.role !== 'ROLE_ADMIN' && user.role !== 'ROLE_SUPER_ADMIN')) {
      router.push('/login');
      return;
    }

    loadSubmissions();
  }, [filterRound, filterStatus, router]);

  const inspectSubmission = (id: number) => {
    api.judge.getDetail(id)
      .then(setSelectedSub)
      .catch((err: any) => showCustomAlert('Detail Error', err?.message || 'Failed to load submission details', 'danger'));
  };

  const inspectTimeline = (participantId: number, roundId: number) => {
    setLoadingTimeline(true);
    setShowTimelineModal(true);
    api.judge.getIntegrityEvents(roundId, participantId)
      .then(setIntegrityTimeline)
      .catch((err: any) => showCustomAlert('Timeline Error', err?.message || 'Failed to load timeline events', 'danger'))
      .finally(() => setLoadingTimeline(false));
  };

  return (
    <div className="min-h-screen bg-[#F7F4ED] flex flex-col font-sans">
      {/* Judge Top Header */}
      <header className="bg-[#171717] text-white px-6 py-3 flex items-center justify-between border-b-2 border-[#171717] shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#B8E63E] text-[#171717] rounded-lg brutal-border flex items-center justify-center font-black">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold text-[#FFD84D] uppercase">
              GNANAMANI COLLEGE OF TECHNOLOGY
            </span>
            <div className="font-display font-black text-sm tracking-tight text-white">
              JUDGE EVALUATION DESK
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="text-xs font-mono font-bold text-gray-300 hover:text-white"
          >
            Public Site
          </Link>
          <button
            onClick={() => logout()}
            className="text-xs font-mono font-bold text-red-400 hover:text-red-300"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Split Layout */}
      <div className="flex-1 p-6 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-hidden">
        {/* Left: Submissions Table (lg:col-span-7) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl brutal-border brutal-shadow space-y-4 flex flex-col">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black font-display text-[#171717]">
              SUBMISSION LOGS FOR VERIFICATION
            </h2>
            <button
              onClick={loadSubmissions}
              className="p-1.5 hover:bg-gray-100 rounded"
              title="Refresh submissions"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2 text-xs font-mono">
            <select
              value={filterRound}
              onChange={(e) => setFilterRound(e.target.value)}
              className="p-2 bg-gray-50 rounded border border-gray-300"
            >
              <option value="">All Rounds</option>
              <option value="1">Round 01 (C)</option>
              <option value="2">Round 02 (Python)</option>
              <option value="3">Round 03 (Java)</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="p-2 bg-gray-50 rounded border border-gray-300"
            >
              <option value="">All Statuses</option>
              <option value="PASSED">Passed</option>
              <option value="PARTIAL">Partial</option>
              <option value="FAILED">Failed</option>
              <option value="COMPILE_ERROR">Compile Error</option>
            </select>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b font-mono uppercase text-gray-400">
                  <th className="py-2">ID</th>
                  <th className="py-2">Participant</th>
                  <th className="py-2">Question</th>
                  <th className="py-2">Status</th>
                  <th className="py-2">Score</th>
                  <th className="py-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y font-medium">
                {submissions.map((s) => (
                  <tr
                    key={s.id}
                    className={`hover:bg-gray-50 cursor-pointer ${
                      selectedSub?.id === s.id ? 'bg-blue-50/70' : ''
                    }`}
                    onClick={() => inspectSubmission(s.id)}
                  >
                    <td className="py-2.5 font-mono">#{s.id}</td>
                    <td className="py-2.5 font-bold text-[#171717]">{s.participantName}</td>
                    <td className="py-2.5">{s.questionTitle}</td>
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
                    <td className="py-2.5 font-bold text-[#3155FF]">+{s.score}</td>
                    <td className="py-2.5 text-right">
                      <button className="px-2 py-1 bg-[#171717] text-white rounded text-[10px] font-mono">
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Submission Inspection Detail (lg:col-span-5) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl brutal-border brutal-shadow space-y-4 flex flex-col">
          {selectedSub ? (
            <div className="space-y-4 flex-1 flex flex-col overflow-hidden">
              <div className="border-b pb-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-gray-500">
                    Submission #{selectedSub.id}
                  </span>
                  <div className="flex items-center gap-2">
                    {selectedSub.isAutoSubmission && (
                      <span className="px-2 py-0.5 bg-red-100 text-red-700 font-mono text-[10px] font-black rounded border border-red-300 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-red-600" /> TAB SWITCH AUTO
                      </span>
                    )}
                    <span className="px-2 py-0.5 bg-[#B8E63E] text-[#171717] font-mono text-xs font-bold rounded">
                      Score: {selectedSub.score} PTS
                    </span>
                  </div>
                </div>
                <h3 className="font-bold text-base text-[#171717]">
                  {selectedSub.questionTitle} ({selectedSub.language})
                </h3>
                <div className="flex items-center justify-between text-xs text-gray-500 font-mono">
                  <span>Contestant: {selectedSub.participantName} • Time: {selectedSub.executionTimeMs}ms</span>
                  <button
                    onClick={() => inspectTimeline(selectedSub.participantId, selectedSub.roundId)}
                    className="px-2.5 py-1 bg-[#3155FF] text-white rounded text-[11px] font-mono font-bold flex items-center gap-1 hover:brightness-105"
                  >
                    <ShieldAlert className="w-3 h-3" /> Audit Timeline
                  </button>
                </div>
              </div>

              {/* Source Code Box */}
              <div className="flex-1 flex flex-col overflow-hidden space-y-1">
                <div className="text-xs font-mono font-bold text-gray-500 uppercase flex items-center justify-between">
                  <span>Source Code</span>
                  <span className="text-[10px] text-gray-400">Read-Only</span>
                </div>
                <div className="flex-1 bg-[#171717] text-white p-3 rounded-xl font-mono text-xs overflow-y-auto brutal-border">
                  <pre>{selectedSub.sourceCode}</pre>
                </div>
              </div>

              {/* Test Case Inspection */}
              <div className="space-y-2 pt-2 border-t">
                <div className="text-xs font-mono font-bold text-gray-500 uppercase">
                  Judge Test Case Diagnostics (Visible + Hidden)
                </div>
                <div className="space-y-1 max-h-36 overflow-y-auto">
                  {selectedSub.results?.map((res: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-2 bg-gray-50 rounded text-xs font-mono flex items-center justify-between border"
                    >
                      <div className="flex items-center gap-2">
                        {res.status === 'PASSED' ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5 text-red-600" />
                        )}
                        <span>Test #{res.testCaseId} {res.isHidden && '(HIDDEN)'}</span>
                      </div>
                      <span className="font-bold">{res.status} ({res.executionTimeMs}ms)</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-gray-400 space-y-2">
              <FileText className="w-12 h-12 text-gray-300" />
              <div className="text-sm font-bold text-[#171717]">Select a submission to inspect</div>
              <div className="text-xs">Examine source code, compiler output, and hidden test case diagnostics.</div>
            </div>
          )}
        </div>
      </div>

      {/* Integrity Audit Timeline Modal */}
      {showTimelineModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-2xl w-full rounded-2xl brutal-border brutal-shadow-xl p-6 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-red-500" />
                <h3 className="font-bold text-base text-[#171717] font-mono uppercase">
                  Contestant Integrity Timeline
                </h3>
              </div>
              <button
                onClick={() => setShowTimelineModal(false)}
                className="text-gray-400 hover:text-black font-mono font-bold text-sm"
              >
                ✕ Close
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2">
              {loadingTimeline ? (
                <div className="text-center py-8 text-gray-400 font-mono text-xs">
                  Loading integrity events...
                </div>
              ) : integrityTimeline.length > 0 ? (
                <div className="relative border-l-2 border-gray-200 ml-4 space-y-4 py-2">
                  {integrityTimeline.map((ev, i) => (
                    <div key={ev.id || i} className="relative pl-6">
                      <span className={`absolute -left-2 top-1 w-4 h-4 rounded-full border-2 border-white ${
                        ev.eventType === 'TAB_HIDDEN' || ev.eventType === 'QUESTION_LOCKED'
                          ? 'bg-red-500'
                          : ev.eventType === 'AUTO_SUBMISSION_CONFIRMED'
                          ? 'bg-[#FF6B35]'
                          : ev.eventType === 'FULLSCREEN_EXITED'
                          ? 'bg-amber-400'
                          : 'bg-[#B8E63E]'
                      }`} />
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2 text-xs font-mono">
                          <span className="font-bold text-[#171717]">{ev.eventType}</span>
                          <span className="text-gray-400">{new Date(ev.serverTimestamp).toLocaleTimeString()}</span>
                        </div>
                        <p className="text-xs text-gray-600">{ev.eventContext}</p>
                        {ev.questionTitle && (
                          <span className="text-[10px] font-mono text-gray-400 block">Question: {ev.questionTitle}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 font-mono text-xs">
                  No integrity violation events recorded for this contestant.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* In-App Custom Modal Dialog */}
      <CustomModal config={modalConfig} onClose={() => setModalConfig(null)} />
    </div>
  );
}
