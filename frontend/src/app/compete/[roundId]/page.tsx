'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Play,
  Send,
  Save,
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
  Check,
  ShieldAlert,
  Maximize2,
  Lock,
  Unlock,
  AlertOctagon,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { api, getUser, subscribeToEvents } from '@/lib/api';
import CustomModal, { ModalConfig } from '@/components/shared/CustomModal';

const Editor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

const MAX_RUNS_PER_CHALLENGE = 3;
const MAX_SUBMISSIONS_PER_CHALLENGE = 4;
const RETRY_PENALTY_POINTS = 25;

const enterFullscreen = () => {
  if (typeof document === 'undefined') return Promise.resolve(false);
  const elem: any = document.documentElement;
  const req =
    elem.requestFullscreen ||
    elem.webkitRequestFullscreen ||
    elem.mozRequestFullScreen ||
    elem.msRequestFullscreen;
  if (req) {
    try {
      const p = req.call(elem);
      if (p && typeof p.then === 'function') {
        return p.then(() => {
          if (typeof navigator !== 'undefined' && 'keyboard' in navigator && (navigator as any).keyboard?.lock) {
            (navigator as any).keyboard.lock(['MetaLeft', 'MetaRight', 'Tab', 'Escape', 'AltLeft', 'AltRight', 'ControlLeft', 'ControlRight']).catch(() => {});
          }
          return true;
        }).catch((err: any) => {
          console.warn('requestFullscreen call rejected:', err);
          return false;
        });
      }
      if (typeof navigator !== 'undefined' && 'keyboard' in navigator && (navigator as any).keyboard?.lock) {
        (navigator as any).keyboard.lock(['MetaLeft', 'MetaRight', 'Tab', 'Escape', 'AltLeft', 'AltRight', 'ControlLeft', 'ControlRight']).catch(() => {});
      }
      return Promise.resolve(true);
    } catch (err: any) {
      console.warn('requestFullscreen synchronous exception:', err);
      return Promise.resolve(false);
    }
  }
  return Promise.resolve(false);
};

const checkIsFullscreen = () => {
  if (typeof document === 'undefined') return false;
  return Boolean(
    document.fullscreenElement ||
    (document as any).webkitFullscreenElement ||
    (document as any).mozFullScreenElement ||
    (document as any).msFullscreenElement
  );
};

export default function CompeteArenaPage() {
  const params = useParams();
  const router = useRouter();
  const roundId = params.roundId as string;

  const [round, setRound] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [activeQuestion, setActiveQuestion] = useState<any>(null);
  const [code, setCode] = useState<string>('');
  const [codeDrafts, setCodeDrafts] = useState<Record<number, string>>({});
  const [runCounts, setRunCounts] = useState<Record<number, number>>({});
  const [submissionCounts, setSubmissionCounts] = useState<Record<number, number>>({});
  const [lockedQuestionsMap, setLockedQuestionsMap] = useState<Record<number, boolean>>({});
  const [customInput, setCustomInput] = useState<string>('');
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);

  // Integrity & Session state
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [agreementAccepted, setAgreementAccepted] = useState<boolean>(false);
  const [agreementChecked, setAgreementChecked] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isStartingSession, setIsStartingSession] = useState<boolean>(false);
  const [autoSubmitNotification, setAutoSubmitNotification] = useState<string | null>(null);
  const [clipboardWarning, setClipboardWarning] = useState<string | null>(null);

  // Fullscreen exit termination & Admin restart states
  const [isTerminatedFullscreen, setIsTerminatedFullscreen] = useState<boolean>(false);
  const [terminationMessage, setTerminationMessage] = useState<string | null>(null);
  const [isRoundRestartedByAdmin, setIsRoundRestartedByAdmin] = useState<boolean>(false);
  const [isCheckingReset, setIsCheckingReset] = useState<boolean>(false);

  const [justSaved, setJustSaved] = useState<boolean>(false);
  const [saveNotification, setSaveNotification] = useState<string | null>(null);

  const activeQuestionRef = useRef<any>(null);
  const codeRef = useRef<string>('');
  const codeDraftsRef = useRef<Record<number, string>>({});
  const inputDraftsRef = useRef<Record<number, string>>({});
  const roundRef = useRef<any>(null);
  const sessionTokenRef = useRef<string | null>(null);
  const lockedQuestionsRef = useRef<Record<number, boolean>>({});
  const isAutoSubmittingRef = useRef<boolean>(false);
  const isTerminatedFullscreenRef = useRef<boolean>(false);
  const hasEnteredFullscreenRef = useRef<boolean>(false);
  const questionsListRef = useRef<any[]>([]);

  const [running, setRunning] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'console' | 'submissions'>('console');
  const [consoleOutput, setConsoleOutput] = useState<string>('');
  const [testResults, setTestResults] = useState<any[]>([]);
  const [overallStatus, setOverallStatus] = useState<string | null>(null);
  const [questionSubmissions, setQuestionSubmissions] = useState<any[]>([]);
  const [copied, setCopied] = useState<boolean>(false);
  const [isMobileQuestionOpen, setIsMobileQuestionOpen] = useState<boolean>(false);
  const [modalConfig, setModalConfig] = useState<ModalConfig | null>(null);

  const showCustomAlert = useCallback((
    title: string,
    message: string | React.ReactNode,
    type: 'alert' | 'warning' | 'danger' | 'success' | 'info' = 'warning',
    confirmText: string = 'Understood'
  ) => {
    setModalConfig({
      isOpen: true,
      title,
      message,
      type,
      confirmText,
      onConfirm: () => setModalConfig(null)
    });
  }, []);

  const showCustomConfirm = useCallback((
    title: string,
    message: string | React.ReactNode,
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
  }, []);

  // Sync refs
  useEffect(() => {
    activeQuestionRef.current = activeQuestion;
  }, [activeQuestion]);

  useEffect(() => {
    codeRef.current = code;
  }, [code]);

  useEffect(() => {
    roundRef.current = round;
  }, [round]);

  useEffect(() => {
    sessionTokenRef.current = sessionToken;
  }, [sessionToken]);

  useEffect(() => {
    lockedQuestionsRef.current = lockedQuestionsMap;
  }, [lockedQuestionsMap]);

  useEffect(() => {
    questionsListRef.current = questions;
  }, [questions]);

  const getDraftKey = useCallback(
    (qId: number | string) => `codeathon_draft_${roundId}_${qId}`,
    [roundId]
  );
  const getInputKey = useCallback(
    (qId: number | string) => `codeathon_input_${roundId}_${qId}`,
    [roundId]
  );
  const getRunsKey = useCallback(
    (qId: number | string) => `codeathon_runs_${roundId}_${qId}`,
    [roundId]
  );
  const getLockedKey = useCallback(
    (qId: number | string) => `codeathon_locked_${roundId}_${qId}`,
    [roundId]
  );

  const saveCurrentDraft = useCallback(() => {
    if (activeQuestionRef.current?.id) {
      const curId = activeQuestionRef.current.id;
      const curCode = codeRef.current;
      codeDraftsRef.current[curId] = curCode;
      try {
        localStorage.setItem(getDraftKey(curId), curCode);
      } catch (e) {}
    }
  }, [getDraftKey]);

  const handleManualSave = useCallback(() => {
    if (!activeQuestionRef.current?.id) return;
    const curId = activeQuestionRef.current.id;
    const curCode = codeRef.current;
    const curInput = inputDraftsRef.current[curId] ?? customInput;

    codeDraftsRef.current[curId] = curCode;
    setCodeDrafts(prev => ({ ...prev, [curId]: curCode }));
    try {
      localStorage.setItem(getDraftKey(curId), curCode);
      localStorage.setItem(getInputKey(curId), curInput);
    } catch (e) {}

    setJustSaved(true);
    setSaveNotification(`Draft saved for Question #${curId}`);
    setTimeout(() => setJustSaved(false), 2000);
    setTimeout(() => setSaveNotification(null), 3000);
  }, [customInput, getDraftKey, getInputKey]);

  // Keyboard shortcut Ctrl+S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleManualSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleManualSave]);

  const fetchSubmissionsForQuestion = useCallback(
    async (qId: number) => {
      try {
        const subs = await api.submissions.getMySubmissionsForQuestion(qId);
        setQuestionSubmissions(subs);
        if (subs && subs.length > 0) {
          setSubmissionCounts(prev => ({ ...prev, [qId]: subs.length }));
        }
      } catch (e) {
        setQuestionSubmissions([]);
      }
    },
    []
  );

  const loadQuestionDetail = useCallback(
    async (qId: number) => {
      saveCurrentDraft();

      try {
        const detail = await api.questions.getDetail(qId);
        setActiveQuestion(detail);
        activeQuestionRef.current = detail;

        // Restore custom input
        let savedInput = inputDraftsRef.current[qId];
        if (savedInput === undefined) {
          savedInput = localStorage.getItem(getInputKey(qId)) || '';
        }
        if (!savedInput || savedInput.trim().length === 0) {
          savedInput = detail.sampleTestCases?.[0]?.inputData || '';
        }
        inputDraftsRef.current[qId] = savedInput;
        setCustomInput(savedInput);

        // Restore run counts
        const savedRuns = parseInt(localStorage.getItem(getRunsKey(qId)) || '0', 10);
        setRunCounts(prev => ({ ...prev, [qId]: savedRuns }));

        // Restore code draft
        let resolvedCode = codeDraftsRef.current[qId];
        if (resolvedCode === undefined) {
          const storedDraft = localStorage.getItem(getDraftKey(qId));
          if (storedDraft !== null) {
            resolvedCode = storedDraft;
          } else {
            resolvedCode = detail.starterCode || '';
          }
          codeDraftsRef.current[qId] = resolvedCode;
        }

        setCode(resolvedCode);
        codeRef.current = resolvedCode;
        setCodeDrafts(prev => ({ ...prev, [qId]: resolvedCode }));

        // Fetch submissions for this question
        fetchSubmissionsForQuestion(qId);
        setConsoleOutput('');
        setTestResults([]);
        setOverallStatus(null);
      } catch (err: any) {
        console.error('Failed to load question detail', err);
        showCustomAlert('Access Restricted', err.message || 'Cannot view this question.', 'warning');
      }
    },
    [getDraftKey, getInputKey, getRunsKey, saveCurrentDraft, fetchSubmissionsForQuestion, showCustomAlert]
  );

  // Tab switch automatic submission trigger
  const triggerTabSwitchAutoSubmit = useCallback(async () => {
    const curToken = sessionTokenRef.current;
    const curQ = activeQuestionRef.current;
    if (!curToken || !curQ) return;

    const qId = curQ.id;
    if (lockedQuestionsRef.current[qId] || isAutoSubmittingRef.current) return;

    isAutoSubmittingRef.current = true;
    const latestCode = codeRef.current || codeDraftsRef.current[qId] || curQ.starterCode || '';
    const idempotencyKey = `auto_${roundId}_${qId}_${Date.now()}`;

    try {
      const res = await api.integrity.tabSwitchSubmit({
        sessionToken: curToken,
        roundId: Number(roundId),
        questionId: qId,
        language: roundRef.current?.language || 'python',
        sourceCode: latestCode,
        idempotencyKey
      });

      // Update locked map
      setLockedQuestionsMap(prev => ({ ...prev, [qId]: true }));
      lockedQuestionsRef.current[qId] = true;
      try {
        localStorage.setItem(getLockedKey(qId), 'true');
      } catch (e) {}

      setAutoSubmitNotification(
        `🚨 ZERO-TOLERANCE INTEGRITY TRIGGERED: Tab switch detected! Your code for "${curQ.title}" was automatically evaluated and the question is permanently locked.`
      );

      // Advance question
      if (res.nextQuestionId) {
        loadQuestionDetail(res.nextQuestionId);
      } else if (res.isRoundCompleted) {
        showCustomAlert('Round Completed', 'Notice: All questions in this competition round are now completed and locked. Submissions closed.', 'success');
        setTimeout(() => router.push('/dashboard'), 2500);
      }
    } catch (err: any) {
      console.error('Tab switch auto-submission error:', err);
    } finally {
      isAutoSubmittingRef.current = false;
    }
  }, [roundId, getLockedKey, loadQuestionDetail, router]);

  // Page Visibility API detection: Trigger auto-submit when document becomes hidden
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        triggerTabSwitchAutoSubmit();
      } else if (document.visibilityState === 'visible') {
        if (sessionTokenRef.current) {
          api.integrity.recordEvent({
            sessionToken: sessionTokenRef.current,
            roundId: Number(roundId),
            questionId: activeQuestionRef.current?.id,
            eventType: 'TAB_VISIBLE',
            eventContext: 'Tab visibility restored by participant.'
          }).catch(() => {});
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [triggerTabSwitchAutoSubmit, roundId]);

  // Clipboard & Context Menu Restrictions
  useEffect(() => {
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      setClipboardWarning('⚠️ Copying code is disabled during the competition!');
      setTimeout(() => setClipboardWarning(null), 3000);
      if (sessionTokenRef.current) {
        api.integrity.recordEvent({
          sessionToken: sessionTokenRef.current,
          roundId: Number(roundId),
          questionId: activeQuestionRef.current?.id,
          eventType: 'COPY_ATTEMPT',
          eventContext: 'Intercepted and blocked copy event.'
        }).catch(() => {});
      }
    };

    const handleCut = (e: ClipboardEvent) => {
      e.preventDefault();
      setClipboardWarning('⚠️ Cutting code is disabled during the competition!');
      setTimeout(() => setClipboardWarning(null), 3000);
      if (sessionTokenRef.current) {
        api.integrity.recordEvent({
          sessionToken: sessionTokenRef.current,
          roundId: Number(roundId),
          questionId: activeQuestionRef.current?.id,
          eventType: 'CUT_ATTEMPT',
          eventContext: 'Intercepted and blocked cut event.'
        }).catch(() => {});
      }
    };

    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();
      setClipboardWarning('⚠️ Pasting code is strictly prohibited! Please type your solution.');
      setTimeout(() => setClipboardWarning(null), 3500);
      if (sessionTokenRef.current) {
        api.integrity.recordEvent({
          sessionToken: sessionTokenRef.current,
          roundId: Number(roundId),
          questionId: activeQuestionRef.current?.id,
          eventType: 'PASTE_ATTEMPT',
          eventContext: 'Intercepted and blocked paste event.'
        }).catch(() => {});
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      if (sessionTokenRef.current) {
        api.integrity.recordEvent({
          sessionToken: sessionTokenRef.current,
          roundId: Number(roundId),
          questionId: activeQuestionRef.current?.id,
          eventType: 'CONTEXT_MENU_ATTEMPT',
          eventContext: 'Intercepted and blocked right-click context menu.'
        }).catch(() => {});
      }
    };

    const handleKeyDownDeterrents = (e: KeyboardEvent) => {
      // 1. Windows Key / Meta Key press interception
      if (e.key === 'Meta' || e.code === 'MetaLeft' || e.code === 'MetaRight') {
        e.preventDefault();
        e.stopPropagation();
        setClipboardWarning('⚠️ Windows / System Key is locked during the competition!');
        setTimeout(() => setClipboardWarning(null), 3000);
        if (sessionTokenRef.current) {
          api.integrity.recordEvent({
            sessionToken: sessionTokenRef.current,
            roundId: Number(roundId),
            questionId: activeQuestionRef.current?.id,
            eventType: 'SUSPICIOUS_SHORTCUT',
            eventContext: 'Intercepted and blocked Windows/Meta key tap.'
          }).catch(() => {});
        }
        return;
      }

      // 2. Control / Meta Key combinations
      if (e.ctrlKey || e.metaKey) {
        const key = e.key.toLowerCase();
        // Allow undo (Ctrl+Z), redo (Ctrl+Y), and manual draft save (Ctrl+S) inside the code editor
        const isPermittedInEditor = key === 'z' || key === 'y' || key === 's';

        if (!isPermittedInEditor) {
          e.preventDefault();
          e.stopPropagation();
          setClipboardWarning(`⚠️ Shortcut (Ctrl+${key.toUpperCase()}) is disabled!`);
          setTimeout(() => setClipboardWarning(null), 3000);
          if (sessionTokenRef.current) {
            api.integrity.recordEvent({
              sessionToken: sessionTokenRef.current,
              roundId: Number(roundId),
              questionId: activeQuestionRef.current?.id,
              eventType: 'SUSPICIOUS_SHORTCUT',
              eventContext: `Intercepted and blocked Ctrl+${key.toUpperCase()} shortcut.`
            }).catch(() => {});
          }
          return;
        }
      }

      // 3. DevTools / Function Keys (F12, F5, etc.)
      const isDevTools =
        e.key === 'F12' ||
        e.key === 'F5' ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key.toLowerCase() === 'i' || e.key.toLowerCase() === 'j' || e.key.toLowerCase() === 'c')) ||
        ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'u');

      if (isDevTools) {
        e.preventDefault();
        e.stopPropagation();
        setClipboardWarning('⚠️ Developer inspection and reload shortcuts are restricted!');
        setTimeout(() => setClipboardWarning(null), 3000);
        if (sessionTokenRef.current) {
          api.integrity.recordEvent({
            sessionToken: sessionTokenRef.current,
            roundId: Number(roundId),
            questionId: activeQuestionRef.current?.id,
            eventType: 'SUSPICIOUS_SHORTCUT',
            eventContext: `Intercepted DevTools/Inspection attempt: ${e.key}`
          }).catch(() => {});
        }
        return;
      }
    };

    window.addEventListener('copy', handleCopy);
    window.addEventListener('cut', handleCut);
    window.addEventListener('paste', handlePaste);
    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDownDeterrents, true);

    return () => {
      window.removeEventListener('copy', handleCopy);
      window.removeEventListener('cut', handleCut);
      window.removeEventListener('paste', handlePaste);
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDownDeterrents, true);
    };
  }, [roundId]);

  // Fullscreen state listener: auto-submit and terminate round on exit
  useEffect(() => {
    const handleFullscreenChange = async () => {
      const inFs = checkIsFullscreen();
      setIsFullscreen(inFs);

      if (sessionTokenRef.current) {
        api.integrity.recordEvent({
          sessionToken: sessionTokenRef.current,
          roundId: Number(roundId),
          questionId: activeQuestionRef.current?.id,
          eventType: inFs ? 'FULLSCREEN_ENTERED' : 'FULLSCREEN_EXITED',
          eventContext: inFs ? 'Participant entered fullscreen mode.' : 'Participant exited fullscreen mode.'
        }).catch(() => {});
      }

      if (inFs) {
        hasEnteredFullscreenRef.current = true;
      } else {
        // Zero-Tolerance Fullscreen Rule: If user exits fullscreen during active session, auto-submit and terminate round
        if (hasEnteredFullscreenRef.current && agreementAccepted && sessionTokenRef.current && !isTerminatedFullscreenRef.current) {
          hasEnteredFullscreenRef.current = false;
          isTerminatedFullscreenRef.current = true;
          setIsTerminatedFullscreen(true);
          saveCurrentDraft();

          const curQ = activeQuestionRef.current;
          const curCode = codeRef.current || (curQ ? codeDraftsRef.current[curQ.id] : '') || '';
          const lang = roundRef.current?.language?.toLowerCase() || 'c';

          try {
            const res: any = await api.integrity.fullscreenExitTerminate({
              sessionToken: sessionTokenRef.current,
              roundId: Number(roundId),
              questionId: curQ?.id || 1,
              language: lang,
              sourceCode: curCode
            });

            setTerminationMessage(res?.message || 'Fullscreen mode was exited. Your latest saved code was automatically submitted and your round has been terminated. The administrator has been notified.');
            if (curQ?.id) {
              setLockedQuestionsMap(prev => ({ ...prev, [curQ.id]: true }));
            }
          } catch {
            setTerminationMessage('Fullscreen mode was exited. In accordance with competition integrity rules, your latest saved code has been submitted and your round has been locked. The administrator panel has been notified.');
          }
        }
      }
    };

    setIsFullscreen(checkIsFullscreen());

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, [roundId, agreementAccepted, saveCurrentDraft]);

  // Polling for Admin round restart when participant is terminated
  useEffect(() => {
    if (!isTerminatedFullscreen) return;

    const checkAdminReset = async () => {
      try {
        const res: any = await api.integrity.getSessionStatus(roundId);
        if (res && res.status === 'ACTIVE') {
          setIsRoundRestartedByAdmin(true);
          const locks: Record<number, boolean> = {};
          (res.lockedQuestionIds || []).forEach((id: number) => {
            locks[id] = true;
          });
          setLockedQuestionsMap(locks);
          if (res.currentQuestionId) {
            loadQuestionDetail(res.currentQuestionId);
          }
        }
      } catch {}
    };

    const interval = setInterval(checkAdminReset, 3000);
    return () => clearInterval(interval);
  }, [isTerminatedFullscreen, roundId, loadQuestionDetail]);

  const handleCheckAdminRestart = async () => {
    setIsCheckingReset(true);
    try {
      const res: any = await api.integrity.getSessionStatus(roundId);
      if (res && res.status === 'ACTIVE') {
        setIsRoundRestartedByAdmin(true);
        const locks: Record<number, boolean> = {};
        (res.lockedQuestionIds || []).forEach((id: number) => {
          locks[id] = true;
        });
        setLockedQuestionsMap(locks);
        if (res.currentQuestionId) {
          loadQuestionDetail(res.currentQuestionId);
        }
      } else {
        showCustomAlert('Round Not Restarted', 'The administrator has not restarted your round yet. Please wait or notify your invigilator.', 'warning');
      }
    } catch (err: any) {
      showCustomAlert('Verification Error', `Could not verify reset status: ${err.message}`, 'danger');
    } finally {
      setIsCheckingReset(false);
    }
  };

  const handleReEnterAfterAdminRestart = async () => {
    // 1. Immediately request fullscreen synchronously within click event gesture
    enterFullscreen();
    hasEnteredFullscreenRef.current = true;

    setIsCheckingReset(true);
    try {
      const res: any = await api.integrity.getSessionStatus(roundId);
      if (res && res.status === 'ACTIVE') {
        setIsTerminatedFullscreen(false);
        isTerminatedFullscreenRef.current = false;
        setIsRoundRestartedByAdmin(false);
        setIsFullscreen(checkIsFullscreen());

        const locks: Record<number, boolean> = {};
        (res.lockedQuestionIds || []).forEach((id: number) => {
          locks[id] = true;
        });
        setLockedQuestionsMap(locks);

        if (res.currentQuestionId) {
          loadQuestionDetail(res.currentQuestionId);
        }
      } else {
        hasEnteredFullscreenRef.current = false;
        showCustomAlert('Round Not Restarted', 'The administrator has not restarted your round yet. Please notify your invigilator/admin.', 'warning');
      }
    } catch (err: any) {
      hasEnteredFullscreenRef.current = false;
      showCustomAlert('Verification Error', `Could not verify reset status: ${err.message}`, 'danger');
    } finally {
      setIsCheckingReset(false);
    }
  };

  // Window blur & focus listeners
  useEffect(() => {
    const handleBlur = () => {
      if (sessionTokenRef.current) {
        api.integrity.recordEvent({
          sessionToken: sessionTokenRef.current,
          roundId: Number(roundId),
          questionId: activeQuestionRef.current?.id,
          eventType: 'WINDOW_BLUR',
          eventContext: 'Browser window lost focus.'
        }).catch(() => {});
      }
    };

    const handleFocus = () => {
      if (sessionTokenRef.current) {
        api.integrity.recordEvent({
          sessionToken: sessionTokenRef.current,
          roundId: Number(roundId),
          questionId: activeQuestionRef.current?.id,
          eventType: 'WINDOW_FOCUS',
          eventContext: 'Browser window regained focus.'
        }).catch(() => {});
      }
    };

    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
    };
  }, [roundId]);

  // Load round & check existing session
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
        questionsListRef.current = qs;
      })
      .catch(() => {});

    // Check existing integrity session
    api.integrity.getSessionStatus(roundId)
      .then((status: any) => {
        if (status && status.sessionToken) {
          setSessionToken(status.sessionToken);
          setAgreementAccepted(true);
          const locks: Record<number, boolean> = {};
          (status.lockedQuestionIds || []).forEach((id: number) => {
            locks[id] = true;
          });
          setLockedQuestionsMap(locks);

          if (status.status === 'TERMINATED_FULLSCREEN') {
            setIsTerminatedFullscreen(true);
            isTerminatedFullscreenRef.current = true;
            hasEnteredFullscreenRef.current = false;
            setTerminationMessage('Your session was terminated due to exiting fullscreen mode. Your latest saved code was automatically submitted. Please request the administrator to restart your round from the Admin Panel.');
          } else {
            setIsTerminatedFullscreen(false);
            isTerminatedFullscreenRef.current = false;
          }

          if (status.currentQuestionId) {
            loadQuestionDetail(status.currentQuestionId);
          }
        }
      })
      .catch(() => {});

    // Preload user's prior submissions across all questions
    api.submissions.getMySubmissions()
      .then((subs: any[]) => {
        const counts: Record<number, number> = {};
        (subs || []).forEach((s: any) => {
          if (s.questionId) {
            counts[s.questionId] = (counts[s.questionId] || 0) + 1;
          }
        });
        setSubmissionCounts(prev => ({ ...prev, ...counts }));
      })
      .catch(() => {});

    // Subscribe to SSE updates
    const unsubscribe = subscribeToEvents((event, data) => {
      if (event === 'ROUND_PAUSED' && String(data.roundId) === String(roundId)) {
        showCustomAlert('Round Paused', 'Notice: The round has been paused by the administrator.', 'warning');
      }
      if (event === 'ROUND_ENDED' && String(data.roundId) === String(roundId)) {
        showCustomAlert('Round Ended', 'Notice: The round has ended. Submissions are now closed.', 'info');
        setTimeout(() => router.push('/dashboard'), 2500);
      }
      if (event === 'PARTICIPANT_SUSPENDED') {
        const curUser = getUser();
        if (curUser && (curUser.email === data?.email || curUser.id === data?.userId || curUser.participantId === data?.participantId)) {
          localStorage.removeItem('codeathon_token');
          localStorage.removeItem('codeathon_user');
          window.location.href = '/login?suspended=true';
        }
      }
    });

    const timer = setInterval(() => {
      setRemainingSeconds(prev => {
        if (prev <= 1) return 0;
        return prev - 1;
      });
    }, 1000);

    return () => {
      unsubscribe();
      clearInterval(timer);
    };
  }, [roundId, router, loadQuestionDetail, showCustomAlert]);

  // Handle entering fullscreen & starting official session
  const handleStartCompetition = async () => {
    if (!agreementChecked) {
      showCustomAlert('Agreement Required', 'You must read and check the zero-tolerance integrity agreement to proceed.', 'warning');
      return;
    }

    const token = typeof window !== 'undefined' ? localStorage.getItem('codeathon_token') : null;
    const user = getUser();
    if (!token || !user) {
      showCustomAlert('Authentication Required', 'You must be logged in to enter this competition round. Redirecting to login...', 'warning');
      setTimeout(() => router.push('/login'), 2000);
      return;
    }

    // Enter fullscreen directly from user gesture synchronously
    enterFullscreen();
    hasEnteredFullscreenRef.current = true;

    setIsStartingSession(true);
    try {
      const res = await api.integrity.startSession({
        roundId: Number(roundId),
        agreementAccepted: true
      });

      setSessionToken(res.sessionToken);
      setAgreementAccepted(true);
      setIsFullscreen(checkIsFullscreen());

      const locks: Record<number, boolean> = {};
      (res.lockedQuestionIds || []).forEach((id: number) => {
        locks[id] = true;
      });
      setLockedQuestionsMap(locks);

      if (res.currentQuestionId) {
        loadQuestionDetail(res.currentQuestionId);
      } else if (questions.length > 0) {
        loadQuestionDetail(questions[0].id);
      }
    } catch (err: any) {
      if (err.message?.includes('expired') || err.message?.includes('log in') || err.message?.includes('Authentication')) {
        showCustomAlert('Authentication Error', `${err.message} Redirecting to login...`, 'danger');
        setTimeout(() => router.push('/login'), 2000);
      } else {
        showCustomAlert('Session Start Error', `Could not start competition session: ${err.message}`, 'danger');
      }
    } finally {
      setIsStartingSession(false);
    }
  };

  const requestFullscreenAgain = () => {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {});
    }
  };

  const handleCustomInputChange = (val: string) => {
    setCustomInput(val);
    if (activeQuestion?.id) {
      inputDraftsRef.current[activeQuestion.id] = val;
      try {
        localStorage.setItem(getInputKey(activeQuestion.id), val);
      } catch (e) {}
    }
  };

  const handleCodeChange = (newCode: string | undefined) => {
    const val = newCode ?? '';
    setCode(val);
    codeRef.current = val;
    if (activeQuestion?.id) {
      codeDraftsRef.current[activeQuestion.id] = val;
      setCodeDrafts(prev => ({ ...prev, [activeQuestion.id]: val }));
      try {
        localStorage.setItem(getDraftKey(activeQuestion.id), val);
      } catch (e) {}
    }
  };

  const handleResetCode = () => {
    if (!activeQuestion) return;
    const starter = activeQuestion.starterCode || '';
    setCode(starter);
    codeRef.current = starter;
    codeDraftsRef.current[activeQuestion.id] = starter;
    setCodeDrafts(prev => ({ ...prev, [activeQuestion.id]: starter }));
    try {
      localStorage.setItem(getDraftKey(activeQuestion.id), starter);
    } catch (e) {}
  };

  // Run test limits
  const activeQuestionRunsUsed = activeQuestion ? runCounts[activeQuestion.id] || 0 : 0;
  const activeQuestionRunsRemaining = Math.max(0, MAX_RUNS_PER_CHALLENGE - activeQuestionRunsUsed);

  // Submission limits & question lock state
  const currentQSubsUsed = activeQuestion ? (submissionCounts[activeQuestion.id] || questionSubmissions.length || 0) : 0;
  const isCurrentQuestionLocked = activeQuestion
    ? Boolean(lockedQuestionsMap[activeQuestion.id] || currentQSubsUsed >= MAX_SUBMISSIONS_PER_CHALLENGE)
    : false;

  const wrongSubsCount = questionSubmissions.filter((s: any) => s.status !== 'PASSED').length;
  const currentAttemptNumber = Math.min(MAX_SUBMISSIONS_PER_CHALLENGE, currentQSubsUsed + 1);
  const currentPenalty = wrongSubsCount * RETRY_PENALTY_POINTS;

  // Question navigation handler: allows free navigation between all questions in the round
  const handleSelectOrAdvanceQuestion = async (targetQuestionId: number) => {
    if (!activeQuestion) return;
    if (activeQuestion.id === targetQuestionId) return;

    // Save current code draft first
    saveCurrentDraft();

    // Optionally notify backend session of active question switch
    if (sessionTokenRef.current) {
      api.integrity.advanceQuestion({
        roundId: Number(roundId),
        currentQuestionId: activeQuestion.id,
        nextQuestionId: targetQuestionId
      }).catch(() => {});
    }

    loadQuestionDetail(targetQuestionId);
  };

  // Run against sample input (Max 3 runs)
  const handleRun = async () => {
    if (!activeQuestion) return;

    if (activeQuestionRunsRemaining <= 0) {
      setActiveTab('console');
      setOverallStatus('RUN_LIMIT');
      setConsoleOutput(
        `[TEST RUN LIMIT REACHED]\nYou have used all ${MAX_RUNS_PER_CHALLENGE} allowed test runs for this challenge (${activeQuestion.title}).\nPlayground testing is locked. Review your code and click Submit when ready.`
      );
      return;
    }

    setRunning(true);
    setActiveTab('console');
    setConsoleOutput('Executing your code against custom input in sandbox runner...');
    setOverallStatus('RUNNING');

    try {
      // Find sample test case from sampleTestCases
      const sampleCase = activeQuestion?.sampleTestCases?.[0];
      const sampleInput = sampleCase?.inputData || '';
      const sampleExpected = sampleCase?.expectedOutput || '';
      const inputToUse = (customInput && customInput.trim().length > 0) ? customInput : sampleInput;

      const res = await api.submissions.runPlayground({
        language: round?.language || 'c',
        sourceCode: code,
        customInput: inputToUse
      });

      const nextCount = activeQuestionRunsUsed + 1;
      setRunCounts(prev => ({ ...prev, [activeQuestion.id]: nextCount }));
      try {
        localStorage.setItem(getRunsKey(activeQuestion.id), String(nextCount));
      } catch (e) {}

      const remaining = Math.max(0, MAX_RUNS_PER_CHALLENGE - nextCount);
      const firstResult = res.results?.[0];
      const stdout = (res.stdout !== undefined && res.stdout !== null)
        ? res.stdout
        : (firstResult?.actualOutput ?? '');
      const stderr = res.stderr || firstResult?.error || res.compileOutput || '';
      const status = res.status || res.overallStatus || firstResult?.status || 'COMPLETED';
      const execTime = res.executionTimeMs || firstResult?.executionTimeMs || 0;
      const exitCode = res.exitCode !== undefined ? res.exitCode : (status === 'PASSED' ? 0 : 1);

      let outputMsg = `Execution Status: ${status}\nExit Code: ${exitCode}\nExecution Time: ${execTime}ms\n\n`;

      if (status === 'COMPILE_ERROR') {
        outputMsg += `--- Compilation / Build Error ---\n${stderr || 'Compilation failed with non-zero exit code.'}\n\n`;
      } else {
        if (inputToUse && inputToUse.trim().length > 0) {
          outputMsg += `--- Standard Input Provided ---\n${inputToUse.trimEnd()}\n\n`;
        }
        if (stdout && stdout.trim().length > 0) {
          outputMsg += `--- Standard Output (stdout) ---\n${stdout.trimEnd()}\n\n`;
        } else {
          outputMsg += `--- Standard Output (stdout) ---\n(No output produced. Ensure your code prints to stdout using printf() and reads input correctly.)\n\n`;
        }
        if (sampleExpected && sampleExpected.trim().length > 0 && (!customInput || customInput.trim() === sampleInput.trim())) {
          outputMsg += `--- Sample 1 Expected Output ---\n${sampleExpected.trimEnd()}\n\n`;
        }
        if (stderr && stderr.trim().length > 0) {
          outputMsg += `--- Standard Error / Warnings ---\n${stderr.trimEnd()}\n\n`;
        }
      }

      outputMsg += `Notice: ${remaining} of ${MAX_RUNS_PER_CHALLENGE} test runs remaining for this challenge.`;

      setConsoleOutput(outputMsg);
      setOverallStatus(res.overallStatus || (exitCode === 0 ? 'PASSED' : 'FAILED'));
    } catch (err: any) {
      setConsoleOutput(`Execution Error: ${err.message}`);
      setOverallStatus('ERROR');
    } finally {
      setRunning(false);
    }
  };

  // Submit solution (Max 4 submissions, -25 pts for each wrong submission)
  const handleSubmit = async () => {
    if (!activeQuestion) return;

    if (isCurrentQuestionLocked) {
      showCustomAlert(
        'Question Locked',
        'This question is permanently locked. Submissions are no longer permitted for this challenge.',
        'danger'
      );
      return;
    }

    const nextAttempt = currentQSubsUsed + 1;
    const penaltyWarning =
      wrongSubsCount === 0
        ? 'First / Clean Attempt: Full score (100% points awarded with 0 penalty if passed).'
        : `Penalty Warning: You have ${wrongSubsCount} prior wrong attempt(s). A penalty of -${currentPenalty} points (-25 per wrong attempt) will be deducted if passed.`;

    showCustomConfirm(
      `Submit Evaluation (Attempt ${nextAttempt} of 4)`,
      `Challenge: "${activeQuestion.title}"\n\n${penaltyWarning}\n\nRemaining submission attempts after this: ${MAX_SUBMISSIONS_PER_CHALLENGE - nextAttempt}\n\nAre you sure you want to submit your code for authoritative scoring?`,
      async () => {
        setSubmitting(true);
        setActiveTab('console');
        setConsoleOutput(`Submitting Attempt #${nextAttempt} to competition engine...`);
        setOverallStatus('RUNNING');

        try {
          const res = await api.submissions.submit({
            questionId: activeQuestion.id,
            language: round?.language || 'python',
            sourceCode: code
          });

          const newSubsCount = currentQSubsUsed + 1;
          setSubmissionCounts(prev => ({ ...prev, [activeQuestion.id]: newSubsCount }));

          if (newSubsCount >= MAX_SUBMISSIONS_PER_CHALLENGE) {
            setLockedQuestionsMap(prev => ({ ...prev, [activeQuestion.id]: true }));
            try {
              localStorage.setItem(getLockedKey(activeQuestion.id), 'true');
            } catch (e) {}
          }

          setOverallStatus(res.status);
          const penaltyApplied = (res.penalty !== undefined && res.penalty !== null) ? res.penalty : currentPenalty;
          setConsoleOutput(
            `Submission #${newSubsCount} Evaluated:\nStatus: ${res.status}\nScore: +${res.score} points ${penaltyApplied > 0 ? `(includes -${penaltyApplied} penalty for wrong attempts)` : ''}\nPassed: ${res.passedTestCases}/${res.totalTestCases} test cases\nExecution Time: ${res.executionTimeMs}ms\n${res.compileOutput ? `\nCompiler Logs:\n${res.compileOutput}` : ''}\n\nNotice: Submission recorded for this challenge. You can submit another attempt (max 4) or switch to any other challenge anytime.`
          );
          fetchSubmissionsForQuestion(activeQuestion.id);
        } catch (err: any) {
          setConsoleOutput(`Submission Rejected: ${err.message}`);
          setOverallStatus('FAILED');
          showCustomAlert('Submission Rejected', `Submission Rejected: ${err.message}`, 'danger');
        } finally {
          setSubmitting(false);
        }
      },
      'Submit for Evaluation',
      'Cancel',
      'confirm'
    );
  };

  const handleCopyInput = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTimer = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Find next question
  const currentQuestionIndex = questions.findIndex(q => q.id === activeQuestion?.id);
  const nextQuestion = currentQuestionIndex >= 0 && currentQuestionIndex + 1 < questions.length
    ? questions[currentQuestionIndex + 1]
    : null;

  return (
    <div className="h-screen flex flex-col bg-[#F7F4ED] overflow-hidden select-none">
      {/* 1. Mandatory Zero-Tolerance Integrity Agreement Modal */}
      {!agreementAccepted && (
        <div className="fixed inset-0 z-50 bg-[#171717]/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white max-w-2xl w-full rounded-2xl brutal-border brutal-shadow-xl p-6 sm:p-8 space-y-6 text-[#171717]">
            <div className="flex items-center gap-3 border-b-2 border-[#171717] pb-4">
              <div className="w-12 h-12 bg-[#FF6B35] rounded-xl brutal-border flex items-center justify-center text-white shrink-0">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-black uppercase text-[#FF6B35] tracking-widest block">
                  Gnanamani College of Technology • Coding Club
                </span>
                <h2 className="text-xl sm:text-2xl font-black font-display tracking-tight text-[#171717]">
                  ZERO-TOLERANCE COMPETITION INTEGRITY
                </h2>
              </div>
            </div>

            <div className="space-y-4 text-xs font-mono text-gray-800 leading-relaxed max-h-80 overflow-y-auto pr-2">
              <div className="p-3.5 bg-red-50 border-2 border-red-500 rounded-xl space-y-1">
                <div className="font-black text-red-800 flex items-center gap-1.5 uppercase">
                  <AlertOctagon className="w-4 h-4 text-red-600" />
                  Primary Rule: Immediate Auto-Submission on Tab Switch
                </div>
                <p className="text-red-700 font-medium">
                  If you switch away from this tab, minimize the browser, or switch applications, the platform will <strong>IMMEDIATELY submit your latest saved code</strong>, <strong>permanently lock this challenge</strong>, and advance you to the next question. There are no warnings or second chances.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-[#F7F4ED] rounded-xl border border-[#171717]/20 space-y-1">
                  <div className="font-black text-[#171717] flex items-center gap-1.5">
                    <Maximize2 className="w-3.5 h-3.5 text-[#3155FF]" /> Fullscreen Monitoring
                  </div>
                  <p className="text-gray-600">
                    The competition is conducted in fullscreen. Exits and blur events are continuously audited by server monitors.
                  </p>
                </div>

                <div className="p-3 bg-[#F7F4ED] rounded-xl border border-[#171717]/20 space-y-1">
                  <div className="font-black text-[#171717] flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-[#FF6B35]" /> Clipboard Disabled
                  </div>
                  <p className="text-gray-600">
                    Copying, cutting, pasting, context menus, and developer shortcuts are strictly blocked and logged as violations.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-[#FFD84D]/20 rounded-xl border border-[#FFD84D] space-y-1">
                <div className="font-black text-[#171717] flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#171717]" /> 4 Submissions & Retry Penalty
                </div>
                <p className="text-gray-700 font-medium">
                  Each challenge permits up to 4 submissions. Attempt 1 receives 100% of score. Attempts 2, 3, and 4 incur a -25 point penalty per retry.
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-gray-200 space-y-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreementChecked}
                  onChange={(e) => setAgreementChecked(e.target.checked)}
                  className="w-4 h-4 mt-0.5 accent-[#FF6B35] rounded"
                />
                <span className="text-xs font-mono font-bold text-gray-800">
                  I acknowledge and accept the zero-tolerance rules. I understand that leaving this competition tab will auto-submit and lock my active challenge immediately.
                </span>
              </label>

              <button
                onClick={handleStartCompetition}
                disabled={!agreementChecked || isStartingSession}
                className="w-full py-3.5 bg-[#FF6B35] hover:bg-[#ff5517] disabled:opacity-50 text-white font-mono font-black text-sm uppercase tracking-wider rounded-xl brutal-border brutal-shadow-sm brutal-shadow-hover flex items-center justify-center gap-2 cursor-pointer transition-transform"
              >
                {isStartingSession ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Starting Official Session...
                  </>
                ) : (
                  <>
                    <Maximize2 className="w-4 h-4" /> Enter Fullscreen Arena & Begin
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Fullscreen Termination Overlay Modal */}
      {isTerminatedFullscreen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-[#171717] text-white rounded-2xl brutal-border border-red-600 shadow-2xl p-6 space-y-6 text-center animate-in fade-in zoom-in-95">
            <div className="w-16 h-16 bg-red-600/20 text-red-500 rounded-full flex items-center justify-center mx-auto border-2 border-red-600 animate-pulse">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="px-3 py-1 bg-red-600 text-white font-mono text-xs font-black uppercase rounded-full">
                Zero-Tolerance Violation
              </span>
              <h2 className="text-xl font-display font-black uppercase text-red-500">
                Round Terminated — Fullscreen Exited
              </h2>
              <p className="text-sm font-mono text-gray-300 leading-relaxed">
                {terminationMessage || 'You exited fullscreen mode. In accordance with zero-tolerance rules, your latest saved code was automatically submitted and your round has been locked.'}
              </p>
            </div>

            <div className="bg-[#242424] p-4 rounded-xl border border-white/10 text-left space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between text-gray-400">
                <span>Incident Status:</span>
                <span className="text-red-400 font-bold">Reported to Admin Panel</span>
              </div>
              <div className="flex items-center justify-between text-gray-400">
                <span>Admin Re-admission:</span>
                <span className={isRoundRestartedByAdmin ? "text-emerald-400 font-black" : "text-amber-400 font-bold"}>
                  {isRoundRestartedByAdmin ? "✓ Round Restarted by Admin!" : "Awaiting Admin Reset..."}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              {isRoundRestartedByAdmin ? (
                <button
                  onClick={handleReEnterAfterAdminRestart}
                  disabled={isCheckingReset}
                  className="w-full py-3.5 bg-[#10B981] hover:bg-[#059669] text-white font-mono font-black text-sm uppercase tracking-wider rounded-xl brutal-border shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-transform hover:scale-102"
                >
                  <Maximize2 className="w-4 h-4" /> Re-enter Fullscreen Arena &amp; Continue
                </button>
              ) : (
                <button
                  onClick={handleCheckAdminRestart}
                  disabled={isCheckingReset}
                  className="w-full py-3 bg-white/10 hover:bg-white/20 text-white font-mono font-bold text-xs uppercase tracking-wider rounded-xl border border-white/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isCheckingReset ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                  Check if Admin Restarted Round
                </button>
              )}

              <Link
                href="/dashboard"
                className="block text-xs font-mono text-gray-400 hover:text-white underline pt-2"
              >
                Return to Participant Dashboard
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 2.5. Fullscreen Required Enforcement Overlay (Active round but not in fullscreen) */}
      {agreementAccepted && !isFullscreen && !isTerminatedFullscreen && (
        <div className="fixed inset-0 z-50 bg-[#171717]/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white max-w-lg w-full rounded-2xl brutal-border brutal-shadow-xl p-6 sm:p-8 space-y-6 text-[#171717] text-center animate-in fade-in zoom-in-95">
            <div className="w-16 h-16 bg-[#FF6B35]/20 text-[#FF6B35] rounded-2xl brutal-border flex items-center justify-center mx-auto">
              <Maximize2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="px-3 py-1 bg-[#171717] text-[#B8E63E] font-mono text-[11px] font-black uppercase tracking-wider rounded-full">
                Workspace Inaccessible • Fullscreen Required
              </span>
              <h2 className="text-xl sm:text-2xl font-black font-display uppercase tracking-tight text-[#171717]">
                SCREEN NOT IN FULLSCREEN
              </h2>
              <p className="text-xs sm:text-sm font-mono text-gray-700 leading-relaxed">
                The coding workspace is <strong>blurred and inaccessible</strong>. Zero-tolerance integrity rules prohibit viewing or editing challenges in windowed mode.
              </p>
            </div>

            <div className="p-3.5 bg-red-50 border-2 border-red-500 rounded-xl text-left space-y-1">
              <div className="font-black text-red-900 font-mono text-xs flex items-center gap-1.5 uppercase">
                <AlertOctagon className="w-4 h-4 text-red-600" />
                Zero-Tolerance Protection Enforced
              </div>
              <p className="text-red-800 font-mono text-[11px] font-medium leading-relaxed">
                Click below to enter Fullscreen Mode. Once in full screen, your workspace will instantly unlock and unblur.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <button
                onClick={() => {
                  enterFullscreen();
                  hasEnteredFullscreenRef.current = true;
                  setIsFullscreen(checkIsFullscreen());
                }}
                className="w-full py-3.5 bg-[#FF6B35] hover:bg-[#ff5517] text-white font-mono font-black text-sm uppercase tracking-wider rounded-xl brutal-border brutal-shadow-sm brutal-shadow-hover flex items-center justify-center gap-2 cursor-pointer transition-transform hover:scale-102"
              >
                <Maximize2 className="w-4 h-4" /> Enter Fullscreen &amp; Unlock Workspace
              </button>

              <Link
                href="/dashboard"
                className="block text-xs font-mono text-gray-500 hover:text-black underline pt-1"
              >
                Return to Dashboard
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Workspace Area: blurred and completely inaccessible whenever not in fullscreen */}
      <div
        className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${
          !isFullscreen
            ? 'filter blur-xl pointer-events-none select-none opacity-20 grayscale'
            : ''
        }`}
        aria-hidden={!isFullscreen}
      >
        {/* 3. Top Competition Header Bar */}
        <header className="bg-[#171717] text-white px-4 py-2.5 flex items-center justify-between border-b-2 border-[#171717] shrink-0 z-20">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="p-1.5 bg-white/10 hover:bg-white/20 rounded brutal-border text-xs flex items-center gap-1 font-mono font-bold text-gray-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Dashboard
            </Link>

            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-ping" />
              <h1 className="text-sm font-black font-display uppercase tracking-wide">
                CODE A-THON &apos;26 • {round?.title || 'Competition Arena'}
              </h1>
            </div>
          </div>

          {/* Center: Authoritative Competition Timer */}
          <div className="flex items-center gap-2 px-3 py-1 bg-[#242424] rounded-lg border border-white/10 font-mono text-xs font-black text-[#B8E63E]">
            <Clock className="w-3.5 h-3.5 text-[#B8E63E] animate-pulse" />
            <span>{formatTimer(remainingSeconds)}</span>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2.5">
            {/* Explicit Save Button */}
            <button
              onClick={handleManualSave}
              title="Save code draft (Ctrl+S)"
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-mono font-bold rounded-lg brutal-border flex items-center gap-1.5 transition-all"
            >
              {justSaved ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#B8E63E]" />
                  <span className="text-[#B8E63E]">Saved</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5 text-gray-300" />
                  <span>Save (Ctrl+S)</span>
                </>
              )}
            </button>

            {/* Test Run Button (Max 3) */}
            <button
              onClick={handleRun}
              disabled={running || submitting || remainingSeconds <= 0 || activeQuestionRunsRemaining <= 0 || isCurrentQuestionLocked}
              title={`${activeQuestionRunsRemaining} test runs remaining`}
              className={`px-3 py-1.5 text-xs font-mono font-black uppercase rounded-lg brutal-border brutal-shadow-sm flex items-center gap-1.5 transition-all ${
                activeQuestionRunsRemaining <= 0 || isCurrentQuestionLocked
                  ? 'bg-gray-700 text-gray-400 border-gray-600 cursor-not-allowed opacity-60'
                  : 'bg-white text-[#171717] hover:bg-gray-100 brutal-shadow-hover'
              }`}
            >
              {running ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              {running
                ? 'Running'
                : activeQuestionRunsRemaining > 0
                ? `Run (${activeQuestionRunsRemaining}/3)`
                : 'Runs: 0/3'}
            </button>

            {/* Submit Button (Max 4 with -25 Penalty for each wrong attempt) */}
            <button
              onClick={handleSubmit}
              disabled={running || submitting || remainingSeconds <= 0 || isCurrentQuestionLocked}
              title={
                isCurrentQuestionLocked
                  ? 'Challenge locked'
                  : `Submit solution (Attempt ${currentAttemptNumber}/4, penalty: -${currentPenalty} pts for ${wrongSubsCount} wrong attempts)`
              }
              className={`px-4 py-1.5 text-xs font-mono font-black uppercase tracking-wider rounded-lg brutal-border brutal-shadow-sm flex items-center gap-1.5 transition-all ${
                isCurrentQuestionLocked
                  ? 'bg-[#171717] text-[#B8E63E] border-[#B8E63E] cursor-not-allowed opacity-90'
                  : 'bg-[#FF6B35] text-white brutal-shadow-hover hover:brightness-105 disabled:opacity-50'
              }`}
            >
              {submitting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : isCurrentQuestionLocked ? (
                <Lock className="w-3.5 h-3.5 text-[#B8E63E]" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              {submitting
                ? 'Evaluating'
                : isCurrentQuestionLocked
                ? 'Locked'
                : currentPenalty > 0
                ? `Submit (${currentAttemptNumber}/4 • -${currentPenalty}p)`
                : `Submit (${currentAttemptNumber}/4)`}
            </button>

            {/* Prev Challenge Button */}
            {currentQuestionIndex > 0 && (
              <button
                onClick={() => handleSelectOrAdvanceQuestion(questions[currentQuestionIndex - 1].id)}
                title={`Go to Question #${currentQuestionIndex}: ${questions[currentQuestionIndex - 1].title}`}
                className="px-3 py-1.5 text-xs font-mono font-black uppercase tracking-wider rounded-lg brutal-border brutal-shadow-sm flex items-center gap-1.5 transition-all bg-gray-800 hover:bg-gray-700 text-white brutal-shadow-hover cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Prev Question</span>
              </button>
            )}

            {/* Advance to Next Challenge Button */}
            {nextQuestion && (
              <button
                onClick={() => handleSelectOrAdvanceQuestion(nextQuestion.id)}
                title={`Go to Question #${currentQuestionIndex + 2}: ${nextQuestion.title}`}
                className="px-3 py-1.5 text-xs font-mono font-black uppercase tracking-wider rounded-lg brutal-border brutal-shadow-sm flex items-center gap-1.5 transition-all bg-[#10B981] hover:bg-[#059669] text-white brutal-shadow-hover cursor-pointer"
              >
                <span>Next Question</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </header>

        {/* Main Split Interface */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          {/* Left Column: Question Selector & Statement (lg:col-span-5) */}
          <div className="lg:col-span-5 flex flex-col bg-white border-r-2 border-[#171717] overflow-hidden">
            {/* Question Tabs Bar */}
            <div className="bg-[#F7F4ED] px-4 py-2 border-b-2 border-[#171717] flex items-center gap-2 overflow-x-auto shrink-0">
              {questions.map((q, idx) => {
                const isCurrent = activeQuestion?.id === q.id;
                const draft = codeDrafts[q.id];
                const hasDraft = Boolean(draft && draft !== q.starterCode && draft.trim().length > 0);
                const qRunsUsed = runCounts[q.id] || 0;
                const qRunsLeft = Math.max(0, MAX_RUNS_PER_CHALLENGE - qRunsUsed);
                const qSubs = submissionCounts[q.id] || 0;

                return (
                  <button
                    key={q.id}
                    onClick={() => handleSelectOrAdvanceQuestion(q.id)}
                    title={`Question ${idx + 1}: ${q.title} (${q.points}p) - Click to view and solve`}
                    className={`px-3 py-1.5 rounded text-xs font-mono font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                      isCurrent
                        ? 'bg-[#171717] text-white brutal-border brutal-shadow-sm ring-2 ring-[#B8E63E]'
                        : 'bg-white hover:bg-gray-100 text-[#171717] border border-gray-300'
                    }`}
                  >
                    {isCurrent ? (
                      <span className="w-2 h-2 rounded-full bg-[#B8E63E] animate-pulse" title="Active Question In Use" />
                    ) : hasDraft ? (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#3155FF]" title="Draft saved" />
                    ) : null}
                    <span>Q{idx + 1}. {q.title.slice(0, 16)}... ({q.points}p)</span>
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-black ${
                        isCurrent
                          ? 'bg-[#B8E63E] text-[#171717]'
                          : qSubs > 0
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {isCurrent ? 'IN USE' : qSubs > 0 ? `${qSubs}/4 SUBS` : `${qRunsLeft}/3`}
                    </span>
                  </button>
                );
              })}
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
                            onClick={() => handleCopyInput(tc.inputData)}
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
          <div className="lg:col-span-7 flex flex-col bg-[#1e1e1e] overflow-hidden relative">
            {/* Locked Question Banner Overlay */}
            {isCurrentQuestionLocked && (
              <div className="bg-red-500/20 border-b-2 border-red-500 px-4 py-2 flex items-center justify-between text-xs font-mono text-red-300">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-red-400" />
                  <span className="font-bold">QUESTION LOCKED: Submissions closed for this challenge. Code is read-only.</span>
                </div>
                {nextQuestion && (
                  <button
                    onClick={() => handleSelectOrAdvanceQuestion(nextQuestion.id)}
                    className="px-3 py-1 bg-[#B8E63E] text-[#171717] rounded brutal-border font-bold text-[11px] flex items-center gap-1 hover:brightness-105"
                  >
                    Next Challenge <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}

            {/* Editor Header Bar */}
            <div className="bg-[#171717] px-4 py-2 border-b border-white/10 flex items-center justify-between text-xs text-gray-400 font-mono shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <FileCode2 className="w-4 h-4 text-[#B8E63E]" />
                  <span className="text-white font-bold uppercase">
                    {round?.language || 'Code'} Workspace
                  </span>
                </div>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                    activeQuestionRunsRemaining === 0
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                      : 'bg-white/5 text-gray-400 border border-white/10'
                  }`}
                >
                  Runs: {activeQuestionRunsRemaining}/3 left
                </span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                    isCurrentQuestionLocked
                      ? 'bg-[#B8E63E]/20 text-[#B8E63E] border border-[#B8E63E]/40'
                      : 'bg-white/5 text-gray-400 border border-white/10'
                  }`}
                >
                  {isCurrentQuestionLocked
                    ? '🔒 Locked'
                    : `Attempts: ${currentQSubsUsed}/4 used`}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleManualSave}
                  className="hover:text-[#B8E63E] flex items-center gap-1 transition-colors"
                  title="Save current code draft (Ctrl+S)"
                >
                  {justSaved ? (
                    <>
                      <Check className="w-3 h-3 text-[#B8E63E]" />
                      <span className="text-[#B8E63E] font-bold">Saved</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3 h-3" />
                      <span>Save Draft</span>
                    </>
                  )}
                </button>
                <button
                  onClick={handleResetCode}
                  disabled={isCurrentQuestionLocked}
                  className="hover:text-white flex items-center gap-1 transition-colors disabled:opacity-40"
                  title="Reset to starter template"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              </div>
            </div>

            {/* Monaco Editor Container */}
            <div className="flex-1 relative overflow-hidden">
              <Editor
                height="100%"
                language={round?.language === 'C' ? 'c' : round?.language === 'PYTHON' ? 'python' : 'java'}
                theme="vs-dark"
                value={code}
                onChange={handleCodeChange}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  fontFamily: 'JetBrains Mono, monospace',
                  scrollBeyondLastLine: false,
                  lineNumbers: 'on',
                  roundedSelection: false,
                  contextmenu: false,
                  readOnly: isCurrentQuestionLocked,
                  automaticLayout: true
                }}
              />
            </div>

            {/* Console / Output Bottom Panel */}
            <div className="h-48 bg-[#171717] border-t-2 border-[#171717] flex flex-col shrink-0">
              {/* Console Tabs */}
              <div className="bg-[#242424] px-4 py-1.5 flex items-center justify-between border-b border-white/10 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab('console')}
                    className={`py-1 px-2.5 rounded transition-colors ${
                      activeTab === 'console'
                        ? 'bg-white/10 text-white font-bold'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Terminal Output
                  </button>
                  <button
                    onClick={() => setActiveTab('submissions')}
                    className={`py-1 px-2.5 rounded transition-colors ${
                      activeTab === 'submissions'
                        ? 'bg-white/10 text-white font-bold'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    History ({questionSubmissions.length})
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {overallStatus && (
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
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
              </div>

              {/* Tab Content */}
              {activeTab === 'console' ? (
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 divide-x divide-white/10 overflow-hidden">
                  {/* Standard Input */}
                  <div className="p-3 flex flex-col overflow-hidden">
                    <div className="flex items-center justify-between text-[10px] font-mono font-bold text-gray-400 uppercase mb-1">
                      <span>Custom Standard Input:</span>
                      {activeQuestion?.sampleTestCases?.[0]?.inputData && (
                        <button
                          type="button"
                          onClick={() => handleCustomInputChange(activeQuestion.sampleTestCases[0].inputData)}
                          className="text-[#B8E63E] hover:underline normal-case text-[10px]"
                        >
                          Use Sample 1 Input
                        </button>
                      )}
                    </div>
                    <textarea
                      value={customInput}
                      onChange={(e) => handleCustomInputChange(e.target.value)}
                      className="flex-1 bg-[#1e1e1e] p-2 text-xs font-mono text-gray-200 rounded border border-white/10 focus:outline-none focus:border-[#3155FF] resize-none"
                      placeholder="Provide test input here..."
                    />
                  </div>

                  {/* Standard Output */}
                  <div className="p-3 flex flex-col overflow-hidden">
                    <div className="flex items-center justify-between text-[10px] font-mono font-bold text-gray-400 uppercase mb-1">
                      <span>Standard Output / Result Logs:</span>
                      {consoleOutput && (
                        <button
                          type="button"
                          onClick={() => setConsoleOutput('')}
                          className="text-gray-400 hover:text-white normal-case text-[10px]"
                        >
                          Clear
                        </button>
                      )}
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

      {/* Floating Save Notification Banner */}
      {saveNotification && (
        <div className="fixed top-14 right-6 z-50 bg-[#171717] text-[#B8E63E] px-4 py-2.5 rounded-lg brutal-border brutal-shadow-sm font-mono text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#B8E63E]" />
          <span>{saveNotification}</span>
        </div>
      )}

      {/* Floating Clipboard Warning Toast */}
      {clipboardWarning && (
        <div className="fixed bottom-6 right-6 z-50 bg-red-600 text-white px-4 py-3 rounded-xl brutal-border brutal-shadow-lg font-mono text-xs font-black flex items-center gap-2 animate-bounce">
          <AlertOctagon className="w-5 h-5 text-white" />
          <span>{clipboardWarning}</span>
        </div>
      )}

      {/* Floating Tab-Switch Auto-Submit Notification Toast */}
      {autoSubmitNotification && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 max-w-xl bg-[#171717] text-white p-4 rounded-xl brutal-border brutal-shadow-xl border-l-8 border-red-500 font-mono text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-black text-red-400 uppercase flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-red-500" /> Automatic Submission Confirmed
            </span>
            <button
              onClick={() => setAutoSubmitNotification(null)}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>
          <p className="text-gray-200">{autoSubmitNotification}</p>
        </div>
      )}

      {/* Custom In-App Modal Dialog (Prevents Chrome popup and fullscreen drop) */}
      <CustomModal config={modalConfig} onClose={() => setModalConfig(null)} />
    </div>
  );
}
