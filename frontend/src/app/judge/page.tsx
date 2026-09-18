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
  FileText
} from 'lucide-react';
import { api, getUser, logout } from '@/lib/api';

export default function JudgeDeskPage() {
  const router = useRouter();
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [selectedSub, setSelectedSub] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filterRound, setFilterRound] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');

  const loadSubmissions = () => {
    setLoading(true);
    api.judge.getSubmissions(filterRound ? Number(filterRound) : undefined, filterStatus || undefined)
      .then((data: any[]) => setSubmissions(data || []))
      .catch(() => {})
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
      .catch((err: any) => alert(err.message));
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
              <div className="border-b pb-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-gray-500">
                    Submission #{selectedSub.id}
                  </span>
                  <span className="px-2 py-0.5 bg-[#B8E63E] text-[#171717] font-mono text-xs font-bold rounded">
                    Score: {selectedSub.score} PTS
                  </span>
                </div>
                <h3 className="font-bold text-base text-[#171717]">
                  {selectedSub.questionTitle} ({selectedSub.language})
                </h3>
                <div className="text-xs text-gray-500 font-mono">
                  Contestant: {selectedSub.participantName} • Execution: {selectedSub.executionTimeMs}ms
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
    </div>
  );
}
