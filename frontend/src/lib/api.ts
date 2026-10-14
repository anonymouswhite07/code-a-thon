// Code-a-thon 2026 API Client

export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

export interface UserSession {
  id: number;
  email: string;
  fullName: string;
  role: string;
  participantId?: number;
  token?: string;
  college?: string;
  department?: string;
  year?: string;
  totalScore?: number;
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('codeathon_token');
}

export function setToken(token: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('codeathon_token', token);
  }
}

export function getUser(): UserSession | null {
  if (typeof window === 'undefined') return null;
  const user = localStorage.getItem('codeathon_user');
  return user ? JSON.parse(user) : null;
}

export function setUser(user: UserSession) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('codeathon_user', JSON.stringify(user));
  }
}

export function logout() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('codeathon_token');
    localStorage.removeItem('codeathon_user');
    window.location.href = '/login';
  }
}

async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const text = await res.text();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let json: any = null;
  if (text && text.trim().length > 0) {
    try {
      json = JSON.parse(text);
    } catch {
      json = null;
    }
  }

  if (!res.ok) {
    if (res.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('codeathon_token');
        localStorage.removeItem('codeathon_user');
      }
      throw new Error(json?.error?.message || 'Your session has expired. Please log in again.');
    }
    if (res.status === 403) {
      const errMsg = json?.error?.message || json?.message || '';
      if (json?.error?.code === 'ACCOUNT_SUSPENDED' || errMsg.toLowerCase().includes('suspended')) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('codeathon_token');
          localStorage.removeItem('codeathon_user');
          window.location.href = '/login?suspended=true';
        }
        throw new Error(errMsg || 'Your account has been suspended. Please contact the administrator to make your account active.');
      }
      throw new Error(errMsg || 'Access denied. You do not have permission for this action.');
    }
    throw new Error(json?.error?.message || json?.message || `Request failed with status ${res.status}`);
  }

  if (json && json.success === false) {
    throw new Error(json.error?.message || 'Operation failed');
  }

  return json ? json.data : null;
}

export const api = {
  auth: {
    login: async (credentials: Record<string, unknown>) => {
      const data = await fetchWithAuth('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials)
      });
      setToken(data.token);
      setUser(data);
      return data;
    },
    register: async (payload: Record<string, unknown>) => {
      const data = await fetchWithAuth('/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      setToken(data.token);
      setUser(data);
      return data;
    },
    me: async () => {
      const user = await fetchWithAuth('/auth/me');
      setUser(user);
      return user;
    }
  },

  rounds: {
    getAll: () => fetchWithAuth('/rounds'),
    getActive: () => fetchWithAuth('/rounds/active'),
    getById: (id: number | string) => fetchWithAuth(`/rounds/${id}`)
  },

  questions: {
    getByRound: (roundId: number | string) => fetchWithAuth(`/questions/round/${roundId}`),
    getDetail: (id: number | string) => fetchWithAuth(`/questions/${id}`)
  },

  submissions: {
    submit: (payload: { questionId: number; language: string; sourceCode: string }) =>
      fetchWithAuth('/submissions/submit', { method: 'POST', body: JSON.stringify(payload) }),
    getMySubmissions: () => fetchWithAuth('/submissions/my'),
    getMySubmissionsForQuestion: (questionId: number) => fetchWithAuth(`/submissions/question/${questionId}/my`),
    getDetail: (id: number) => fetchWithAuth(`/submissions/${id}`),
    runPlayground: (payload: { language: string; sourceCode: string; customInput?: string }) =>
      fetchWithAuth('/submissions/playground/run', { method: 'POST', body: JSON.stringify(payload) })
  },

  leaderboard: {
    getLive: () => fetchWithAuth('/leaderboard/live'),
    getStatus: () => fetchWithAuth('/leaderboard/status')
  },

  announcements: {
    getAll: () => fetchWithAuth('/announcements'),
    getByRound: (roundId: number | string) => fetchWithAuth(`/announcements/round/${roundId}`)
  },

  integrity: {
    startSession: (payload: { roundId: number; agreementAccepted: boolean }) =>
      fetchWithAuth('/integrity/session/start', { method: 'POST', body: JSON.stringify(payload) }),
    getSessionStatus: (roundId: number | string) =>
      fetchWithAuth(`/integrity/session/status?roundId=${roundId}`),
    recordEvent: (payload: { sessionToken: string; roundId: number; questionId?: number; eventType: string; eventContext?: string }) =>
      fetchWithAuth('/integrity/event', { method: 'POST', body: JSON.stringify(payload) }),
    tabSwitchSubmit: (payload: { sessionToken: string; roundId: number; questionId: number; language: string; sourceCode: string; idempotencyKey: string }) =>
      fetchWithAuth('/integrity/tab-switch-submit', { method: 'POST', body: JSON.stringify(payload) }),
    fullscreenExitTerminate: (payload: { sessionToken: string; roundId: number; questionId: number; language: string; sourceCode: string }) =>
      fetchWithAuth('/integrity/session/fullscreen-exit-terminate', { method: 'POST', body: JSON.stringify(payload) }),
    advanceQuestion: (payload: { roundId: number; currentQuestionId: number; nextQuestionId: number }) =>
      fetchWithAuth('/integrity/question/advance', { method: 'POST', body: JSON.stringify(payload) })
  },

  admin: {
    getStats: () => fetchWithAuth('/admin/stats'),
    controlRound: (id: number, action: string, durationMinutes?: number) =>
      fetchWithAuth(`/admin/rounds/${id}/control`, { method: 'POST', body: JSON.stringify({ action, durationMinutes }) }),
    toggleRoundLock: (id: number, locked: boolean) =>
      fetchWithAuth(`/admin/rounds/${id}/lock?locked=${locked}`, { method: 'POST' }),
    getAllQuestions: () => fetchWithAuth('/admin/questions'),
    createQuestion: (data: Record<string, unknown>) => fetchWithAuth('/admin/questions', { method: 'POST', body: JSON.stringify(data) }),
    updateQuestion: (id: number, data: Record<string, unknown>) => fetchWithAuth(`/admin/questions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteQuestion: (id: number) => fetchWithAuth(`/admin/questions/${id}`, { method: 'DELETE' }),
    getParticipants: (search?: string) => fetchWithAuth(`/admin/participants${search ? `?search=${encodeURIComponent(search)}` : ''}`),
    toggleSuspend: (id: number) => fetchWithAuth(`/admin/participants/${id}/suspend`, { method: 'POST' }),
    createAnnouncement: (data: Record<string, unknown>) => fetchWithAuth('/admin/announcements', { method: 'POST', body: JSON.stringify(data) }),
    getLeaderboard: () => fetchWithAuth('/admin/leaderboard'),
    toggleFreeze: (freeze: boolean) => fetchWithAuth(`/admin/leaderboard/freeze?freeze=${freeze}`, { method: 'POST' }),
    publishFinal: (publish: boolean) => fetchWithAuth(`/admin/leaderboard/publish-final?publish=${publish}`, { method: 'POST' }),
    getAuditLogs: () => fetchWithAuth('/admin/audit-logs'),
    getIntegritySessions: (roundId?: number) =>
      fetchWithAuth(`/admin/integrity/sessions${roundId ? `?roundId=${roundId}` : ''}`),
    resetIntegritySession: (sessionId: number) =>
      fetchWithAuth(`/admin/integrity/sessions/${sessionId}/reset`, { method: 'POST' }),
    resetParticipantRound: (participantId: number, roundId: number) =>
      fetchWithAuth(`/admin/integrity/participants/${participantId}/rounds/${roundId}/reset`, { method: 'POST' }),
    getIntegrityEvents: (roundId?: number, participantId?: number) => {
      let query = '';
      if (roundId) query += `roundId=${roundId}&`;
      if (participantId) query += `participantId=${participantId}`;
      return fetchWithAuth(`/admin/integrity/events${query ? `?${query}` : ''}`);
    },
    getParticipantReports: () => fetchWithAuth('/admin/reports/participants'),
    getDetailedParticipantReport: (id: number) => fetchWithAuth(`/admin/reports/participants/${id}`),
    downloadCsvReport: async () => {
      const token = getToken();
      const res = await fetch(`${API_BASE}/admin/reports/export/csv`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (!res.ok) throw new Error('Failed to download report');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `GCT_CodeAThon_2026_Student_Report_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }
  },

  judge: {
    getSubmissions: (roundId?: number, status?: string) => {
      let query = '';
      if (roundId) query += `roundId=${roundId}&`;
      if (status) query += `status=${encodeURIComponent(status)}`;
      return fetchWithAuth(`/judge/submissions${query ? `?${query}` : ''}`);
    },
    getDetail: (id: number) => fetchWithAuth(`/judge/submissions/${id}`),
    updateScore: (id: number, score: number, status?: string, remarks?: string) =>
      fetchWithAuth(`/judge/submissions/${id}/score`, {
        method: 'PUT',
        body: JSON.stringify({ score, status, remarks }),
      }),
    updateParticipantScore: (id: number, score: number, remarks?: string) =>
      fetchWithAuth(`/judge/participants/${id}/score`, {
        method: 'PUT',
        body: JSON.stringify({ score, remarks }),
      }),
    getParticipants: () => fetchWithAuth('/judge/participants'),
    getIntegrityEvents: (roundId?: number, participantId?: number) => {
      let query = '';
      if (roundId) query += `roundId=${roundId}&`;
      if (participantId) query += `participantId=${participantId}`;
      return fetchWithAuth(`/judge/integrity/events${query ? `?${query}` : ''}`);
    }
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function subscribeToEvents(onEvent: (event: string, data: any) => void) {
  if (typeof window === 'undefined') return () => {};

  const es = new EventSource(`${API_BASE}/events`);

  const eventTypes = [
    'ROUND_STARTED',
    'ROUND_PAUSED',
    'ROUND_RESUMED',
    'ROUND_ENDED',
    'LEADERBOARD_UPDATED',
    'ANNOUNCEMENT_CREATED',
    'SUBMISSION_COMPLETED',
    'COMPETITION_STATUS_CHANGED',
    'LEADERBOARD_STATUS_CHANGED',
    'PARTICIPANT_SUSPENDED'
  ];

  eventTypes.forEach(type => {
    es.addEventListener(type, (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data);
        onEvent(type, data);
      } catch {
        onEvent(type, e.data);
      }
    });
  });

  return () => {
    es.close();
  };
}
