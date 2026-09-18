'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Play,
  Send,
  RotateCcw,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileCode2,
  Terminal,
  Loader2,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  History,
  Copy,
  Check
} from 'lucide-react';
import { api, getUser, subscribeToEvents } from '@/lib/api';

const Editor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

export default function CompeteArenaPage() {
  const params = useParams();
  const router = useRouter();
  const roundId = params.roundId as string;

  const [round, setRound] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [activeQuestion, setActiveQuestion] = useState<any>(null);
  const [code, setCode] = useState<string>('');
  const [customInput, setCustomInput] = useState<string>('');
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);

  const [running, setRunning] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'console' | 'submissions'>('console');
  const [consoleOutput, setConsoleOutput] = useState<string>('');
  const [testResults, setTestResults] = useState<any[]>([]);
  const [overallStatus, setOverallStatus] = useState<string | null>(null);
  const [questionSubmissions, setQuestionSubmissions] = useState<any[]>([]);
  const [copied, setCopied] = useState<boolean>(false);
  const [isMobileQuestionOpen, setIsMobileQuestionOpen] = useState<boolean>(false);

  // Load round & questions
  useEffect(() => {
    const user = getUser();
    if (!user) {
      router.push('/login');
      return;
    }

    api.rounds.getById(roundId)
      .then((r: any) => {
        setRound(r);
        setRemainingSeconds(r.remainingSeconds || 0);
      })
      .catch(() => {});

    api.questions.getByRound(roundId)
      .then((qs: any[]) => {
        setQuestions(qs);
        if (qs.length > 0) {
          loadQuestionDetail(qs[0].id);
        }
      })
      .catch(() => {});

    // Subscribe to SSE updates
    const unsubscribe = subscribeToEvents((event, data) => {
      if (event === 'ROUND_PAUSED' && String(data.roundId) === String(roundId)) {
        alert('Notice: The round has been paused by the administrator.');
      }
      if (event === 'ROUND_ENDED' && String(data.roundId) === String(roundId)) {
        alert('Notice: The round has ended. Submissions are now closed.');
        router.push('/dashboard');
      }
    });

    const timer = setInterval(() => {
      setRemainingSeconds(prev => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      unsubscribe();
      clearInterval(timer);
    };
  }, [roundId, router]);

  const loadQuestionDetail = (qId: number) => {
    api.questions.getDetail(qId)
      .then((detail: any) => {
        setActiveQuestion(detail);
        setCode(detail.starterCode || '');
        if (detail.sampleTestCases?.length > 0) {
          setCustomInput(detail.sampleTestCases[0].inputData || '');
        }
        fetchSubmissionsForQuestion(qId);
      })
      .catch(() => {});
  };

  const fetchSubmissionsForQuestion = (qId: number) => {
    api.submissions.getMySubmissionsForQuestion(qId)
      .then((subs: any[]) => setQuestionSubmissions(subs || []))
      .catch(() => {});
  };

  const formatSec = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Run against sample / custom input
  const handleRunCustom = async () => {
    if (!activeQuestion) return;
    setRunning(true);
    setActiveTab('console');
    setConsoleOutput('Compiling and running against standard input...');
    setOverallStatus('RUNNING');

    try {
      const res = await api.submissions.runPlayground({
        language: round?.language || 'python',
        sourceCode: code,
        customInput
      });

      const actualOut = res.results?.[0]?.actualOutput || res.compileOutput || 'No output';
      setConsoleOutput(actualOut);
      setOverallStatus(res.overallStatus || 'PASSED');
      setTestResults(res.results || []);
    } catch (err: any) {
      setConsoleOutput(`Error: ${err.message}`);
      setOverallStatus('ERROR');
    } finally {
      setRunning(false);
    }
  };

  // Submit against authoritative test suite
  const handleSubmit = async () => {
    if (!activeQuestion) return;
    setSubmitting(true);
    setActiveTab('console');
    setConsoleOutput('Submitting to competition engine and evaluating test cases...');
    setOverallStatus('RUNNING');

    try {
      const res = await api.submissions.submit({
        questionId: activeQuestion.id,
        language: round?.language || 'python',
        sourceCode: code
      });

      setOverallStatus(res.status);
      setConsoleOutput(
        `Evaluation Completed:\nStatus: ${res.status}\nScore: +${res.score} points\nPassed: ${res.passedTestCases}/${res.totalTestCases} test cases\nExecution Time: ${res.executionTimeMs}ms\n${res.compileOutput ? `\nCompiler Logs:\n${res.compileOutput}` : ''}`
      );
      fetchSubmissionsForQuestion(activeQuestion.id);
    } catch (err: any) {
      setConsoleOutput(`Submission Rejected: ${err.message}`);
      setOverallStatus('FAILED');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-screen flex flex-col bg-[#F7F4ED] overflow-hidden">
      {/* Top Competition Header Bar */}
      <header className="bg-[#171717] text-white px-4 py-2.5 flex items-center justify-between border-b-2 border-[#171717] shrink-0 z-20">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="p-1.5 bg-white/10 hover:bg-white/20 rounded brutal-border text-xs flex items-center gap-1 font-mono font-bold"
          >
            <ArrowLeft className="w-4 h-4" /> Exit
          </Link>
          <div className="flex items-center gap-2">
            <span className="font-display font-black text-base tracking-tight text-[#FFD84D]">
              CODE A-THON &apos;26
            </span>
            <span className="text-gray-500 font-mono text-xs">•</span>
            <span className="font-mono text-xs font-bold text-gray-300">
              {round?.title || 'Competition Round'}
            </span>
          </div>
        </div>

        {/* Center Clock */}
        <div className="flex items-center gap-2 px-3 py-1 bg-[#242424] rounded-lg border border-white/10 font-mono text-sm font-black text-[#B8E63E]">
          <Clock className="w-4 h-4 text-[#FF6B35]" />
          <span>{formatSec(remainingSeconds)}</span>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleRunCustom}
            disabled={running || submitting}
            className="px-3.5 py-1.5 bg-white text-[#171717] text-xs font-mono font-black uppercase rounded-lg brutal-border brutal-shadow-sm brutal-shadow-hover flex items-center gap-1.5 disabled:opacity-50"
          >
            {running ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current text-[#3155FF]" />}
            Run
          </button>
          <button
            onClick={handleSubmit}
            disabled={running || submitting || remainingSeconds <= 0}
            className="px-4 py-1.5 bg-[#FF6B35] text-white text-xs font-mono font-black uppercase tracking-wider rounded-lg brutal-border brutal-shadow-sm brutal-shadow-hover flex items-center gap-1.5 disabled:opacity-50"
          >
            {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            Submit
          </button>
        </div>
      </header>

      {/* Main Split Interface */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* Left Column: Question Selector & Statement (lg:col-span-5) */}
        <div className="lg:col-span-5 flex flex-col bg-white border-r-2 border-[#171717] overflow-hidden">
          {/* Question Tabs Bar */}
          <div className="bg-[#F7F4ED] px-4 py-2 border-b-2 border-[#171717] flex items-center gap-2 overflow-x-auto shrink-0">
            {questions.map((q, idx) => (
              <button
                key={q.id}
                onClick={() => loadQuestionDetail(q.id)}
                className={`px-3 py-1.5 rounded text-xs font-mono font-bold whitespace-nowrap transition-all ${
                  activeQuestion?.id === q.id
                    ? 'bg-[#171717] text-white brutal-border brutal-shadow-sm'
                    : 'bg-white text-gray-700 hover:bg-gray-100 brutal-border'
                }`}
              >
                Q{idx + 1}. {q.title.slice(0, 16)}... ({q.points}p)
              </button>
            ))}
          </div>

          {/* Question Markdown & Problem Statement Scrollable Area */}
          {activeQuestion ? (
            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm font-sans">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-[#FF6B35] uppercase tracking-wider">
                    Problem #{activeQuestion.id} • {activeQuestion.difficulty}
                  </span>
                  <span className="px-2 py-0.5 bg-[#FFD84D] text-[#171717] rounded brutal-border text-xs font-mono font-black">
                    {activeQuestion.points} Points
                  </span>
                </div>
                <h2 className="text-2xl font-black font-display text-[#171717]">
                  {activeQuestion.title}
                </h2>
              </div>

              {/* Problem Description */}
              <div className="space-y-2 text-gray-800 leading-relaxed font-medium whitespace-pre-line bg-gray-50 p-4 rounded-xl border border-gray-200">
                {activeQuestion.description}
              </div>

              {/* Input / Output Formats */}
              {activeQuestion.inputFormat && (
                <div className="space-y-1.5">
                  <h4 className="font-mono text-xs font-bold uppercase text-gray-500">
                    Input Format
                  </h4>
                  <div className="p-3 bg-gray-50 rounded-lg text-xs font-mono text-gray-800 border">
                    {activeQuestion.inputFormat}
                  </div>
                </div>
              )}

              {activeQuestion.outputFormat && (
                <div className="space-y-1.5">
                  <h4 className="font-mono text-xs font-bold uppercase text-gray-500">
                    Output Format
                  </h4>
                  <div className="p-3 bg-gray-50 rounded-lg text-xs font-mono text-gray-800 border">
                    {activeQuestion.outputFormat}
                  </div>
                </div>
              )}

              {/* Constraints */}
              {activeQuestion.constraints && (
                <div className="space-y-1.5">
                  <h4 className="font-mono text-xs font-bold uppercase text-gray-500">
                    Constraints
                  </h4>
                  <div className="p-3 bg-[#F7F4ED] rounded-lg text-xs font-mono text-gray-800 border">
                    {activeQuestion.constraints}
                  </div>
                </div>
              )}

              {/* Sample Cases */}
              {activeQuestion.sampleTestCases?.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-mono text-xs font-bold uppercase text-gray-500">
                    Sample Test Cases
                  </h4>
                  {activeQuestion.sampleTestCases.map((tc: any, i: number) => (
                    <div key={tc.id || i} className="p-3 bg-gray-50 rounded-xl border space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-mono font-bold text-gray-500">
                        <span>Sample {i + 1}</span>
                        <button
                          onClick={() => handleCopy(tc.inputData)}
                          className="flex items-center gap-1 text-[#3155FF] hover:underline"
                        >
                          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          Copy Input
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                        <div>
                          <div className="text-[10px] text-gray-400 uppercase">Input</div>
                          <pre className="p-2 bg-white rounded border overflow-x-auto">{tc.inputData || '(empty)'}</pre>
                        </div>
                        <div>
                          <div className="text-[10px] text-gray-400 uppercase">Expected Output</div>
                          <pre className="p-2 bg-white rounded border overflow-x-auto">{tc.expectedOutput}</pre>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8 text-gray-400 font-mono text-xs">
              Loading question details...
            </div>
          )}
        </div>

        {/* Right Column: Code Editor & Console Runner (lg:col-span-7) */}
        <div className="lg:col-span-7 flex flex-col bg-[#1e1e1e] overflow-hidden">
          {/* Editor Header Bar */}
          <div className="bg-[#171717] px-4 py-2 border-b border-white/10 flex items-center justify-between text-xs text-gray-400 font-mono shrink-0">
            <div className="flex items-center gap-2">
              <FileCode2 className="w-4 h-4 text-[#B8E63E]" />
              <span className="text-white font-bold uppercase">
                {round?.language || 'Code'} Workspace
              </span>
            </div>
            <button
              onClick={() => setCode(activeQuestion?.starterCode || '')}
              className="hover:text-white flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3 h-3" /> Reset Template
            </button>
          </div>

          {/* Monaco Editor Container */}
          <div className="flex-1 relative overflow-hidden">
            <Editor
              height="100%"
              language={
                round?.language === 'C' ? 'c' : round?.language === 'PYTHON' ? 'python' : 'java'
              }
              value={code}
              onChange={(val) => setCode(val || '')}
              theme="vs-dark"
              options={{
                fontSize: 14,
                minimap: { enabled: false },
                automaticLayout: true,
                tabSize: 4,
                scrollBeyondLastLine: false,
                padding: { top: 12 }
              }}
            />
          </div>

          {/* Bottom Console Drawer */}
          <div className="h-56 bg-[#171717] border-t-2 border-[#171717] flex flex-col text-white shrink-0">
            {/* Console Tab Header */}
            <div className="bg-[#242424] px-4 py-1.5 flex items-center justify-between border-b border-white/10 text-xs font-mono font-bold">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setActiveTab('console')}
                  className={`py-1 px-2.5 rounded transition-colors ${
                    activeTab === 'console' ? 'bg-[#3155FF] text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Terminal / Test Console
                </button>
                <button
                  onClick={() => setActiveTab('submissions')}
                  className={`py-1 px-2.5 rounded transition-colors ${
                    activeTab === 'submissions' ? 'bg-[#FF6B35] text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  My Submissions ({questionSubmissions.length})
                </button>
              </div>

              {overallStatus && (
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded font-black ${
                    overallStatus === 'PASSED'
                      ? 'bg-[#B8E63E] text-[#171717]'
                      : overallStatus === 'RUNNING'
                      ? 'bg-[#FFD84D] text-[#171717]'
                      : 'bg-red-500 text-white'
                  }`}
                >
                  {overallStatus}
                </span>
              )}
            </div>

            {/* Tab Content */}
            {activeTab === 'console' ? (
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 divide-x divide-white/10 overflow-hidden">
                {/* Standard Input */}
                <div className="p-3 flex flex-col overflow-hidden">
                  <div className="text-[10px] font-mono font-bold text-gray-400 uppercase mb-1">
                    Custom Standard Input:
                  </div>
                  <textarea
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    className="flex-1 bg-[#1e1e1e] p-2 text-xs font-mono text-gray-200 rounded border border-white/10 focus:outline-none focus:border-[#3155FF] resize-none"
                    placeholder="Provide test input here..."
                  />
                </div>

                {/* Standard Output */}
                <div className="p-3 flex flex-col overflow-hidden">
                  <div className="text-[10px] font-mono font-bold text-gray-400 uppercase mb-1">
                    Standard Output / Result Logs:
                  </div>
                  <div className="flex-1 bg-[#1e1e1e] p-2 text-xs font-mono text-[#B8E63E] rounded border border-white/10 overflow-y-auto whitespace-pre-wrap">
                    {consoleOutput || <span className="text-gray-500 italic">Click Run to test against input or Submit to evaluate score.</span>}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 p-3 overflow-y-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="text-gray-400 border-b border-white/10 pb-1">
                      <th className="py-1">Time</th>
                      <th className="py-1">Status</th>
                      <th className="py-1">Passed Tests</th>
                      <th className="py-1">Score</th>
                      <th className="py-1 text-right">Execution</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {questionSubmissions.map((s) => (
                      <tr key={s.id} className="hover:bg-white/5">
                        <td className="py-1.5 text-gray-400">
                          {new Date(s.submissionTime).toLocaleTimeString()}
                        </td>
                        <td className="py-1.5">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-black ${
                              s.status === 'PASSED'
                                ? 'bg-[#B8E63E] text-[#171717]'
                                : s.status === 'PARTIAL'
                                ? 'bg-[#FFD84D] text-[#171717]'
                                : 'bg-red-400 text-white'
                            }`}
                          >
                            {s.status}
                          </span>
                        </td>
                        <td className="py-1.5 text-gray-300">
                          {s.passedTestCases}/{s.totalTestCases}
                        </td>
                        <td className="py-1.5 font-bold text-[#FFD84D]">+{s.score}</td>
                        <td className="py-1.5 text-right text-gray-400">{s.executionTimeMs}ms</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
