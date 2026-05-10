import type { AnalyticsEvent, CursorPoint, CursorSession } from './types';

const STORAGE_KEY = 'iv_analytics';

export function sendEvent(event: AnalyticsEvent): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const log: AnalyticsEvent[] = raw ? JSON.parse(raw) : [];
    log.push(event);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(log));
  } catch {
    // localStorage unavailable or quota exceeded — silently skip
  }
}

export function exportAnalytics(): AnalyticsEvent[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function clearAnalytics(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export interface SourceInteraction {
  url: string;
  label: string;
  confidence: string;
  durationMs: number;
}

export interface ConfidenceTextHover {
  confidence: string;
  durationMs: number;
}

export interface SessionSummary {
  sessionId: string;
  participantId: number;
  interfaceVersion: string;
  contentPack: string;
  startTime: number;
  durationMs: number;
  sends: number;
  sourceHovers: SourceInteraction[];
  sourceClicks: SourceInteraction[];
  followUpClicks: string[];
  confidenceTextHovers: ConfidenceTextHover[];
}

function labelFromUrl(url: string): string {
  try {
    const { hostname, pathname } = new URL(url);
    const host = hostname.replace(/^www\./, '');
    const slug = pathname.split('/').filter(Boolean).pop() ?? '';
    return slug ? `${host}/${slug}` : host;
  } catch {
    return url;
  }
}

export function getSessionSummaries(): SessionSummary[] {
  const events = exportAnalytics();
  const sessions = new Map<string, SessionSummary>();
  const hoverStarts = new Map<string, number>(); // `${sessionId}:${url}` → timestamp
  const confTextStarts = new Map<string, { time: number; confidence: string }>(); // sessionId → start info

  for (const event of events) {
    if (!sessions.has(event.sessionId)) {
      sessions.set(event.sessionId, {
        sessionId: event.sessionId,
        participantId: event.participantId,
        interfaceVersion: event.interfaceVersion,
        contentPack: event.contentPack,
        startTime: event.timestamp,
        durationMs: 0,
        sends: 0,
        sourceHovers: [],
        sourceClicks: [],
        followUpClicks: [],
        confidenceTextHovers: [],
      });
    }

    const s = sessions.get(event.sessionId)!;
    s.durationMs = event.timestamp - s.startTime;

    if (event.element === 'send_message' && event.eventType === 'click') {
      s.sends++;
    } else if (event.element === 'source_capsule') {
      const url = event.url ?? '';
      const label = labelFromUrl(url);
      const confidence = event.confidence ?? '';
      if (event.eventType === 'hover_enter') {
        hoverStarts.set(`${event.sessionId}:${url}`, event.timestamp);
      } else if (event.eventType === 'hover_exit') {
        const started = hoverStarts.get(`${event.sessionId}:${url}`) ?? event.timestamp;
        s.sourceHovers.push({ url, label, confidence, durationMs: event.timestamp - started });
      } else if (event.eventType === 'click') {
        s.sourceClicks.push({ url, label, confidence, durationMs: 0 });
      }
    } else if (event.element === 'confidence_text') {
      if (event.eventType === 'hover_enter') {
        confTextStarts.set(event.sessionId, { time: event.timestamp, confidence: event.confidence ?? '' });
      } else if (event.eventType === 'hover_exit') {
        const started = confTextStarts.get(event.sessionId);
        if (started) {
          s.confidenceTextHovers.push({ confidence: started.confidence, durationMs: event.timestamp - started.time });
          confTextStarts.delete(event.sessionId);
        }
      }
    } else if (event.element === 'follow_up_option' && event.eventType === 'click' && event.optionText) {
      s.followUpClicks.push(event.optionText);
    }
  }

  return Array.from(sessions.values()).sort((a, b) => b.startTime - a.startTime);
}

// ── Cursor movement storage ──────────────────────────────────────────────────

const CURSOR_KEY = 'iv_cursor';

export function appendCursorPoints(
  sessionId: string,
  participantId: number,
  interfaceVersion: string,
  contentPack: string,
  points: CursorPoint[]
): void {
  if (points.length === 0) return;
  try {
    const raw = localStorage.getItem(CURSOR_KEY);
    const sessions: CursorSession[] = raw ? JSON.parse(raw) : [];
    const existing = sessions.find(s => s.sessionId === sessionId);
    if (existing) {
      existing.points.push(...points);
    } else {
      sessions.push({ sessionId, participantId, interfaceVersion, contentPack, points });
    }
    localStorage.setItem(CURSOR_KEY, JSON.stringify(sessions));
  } catch {
    // quota exceeded — silently skip
  }
}

export function exportCursorSessions(): CursorSession[] {
  try {
    const raw = localStorage.getItem(CURSOR_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function clearCursor(): void {
  localStorage.removeItem(CURSOR_KEY);
}

export function exportCursorAsCsv(): string {
  const sessions = exportCursorSessions();
  const headers = ['Session ID', 'PID', 'Interface', 'Content Pack', 'Timestamp', 'X', 'Y', 'X%', 'Y%'];
  const rows: (string | number)[][] = [];
  for (const session of sessions) {
    for (const [ts, x, y, xPct, yPct] of session.points) {
      rows.push([
        session.sessionId, session.participantId,
        session.interfaceVersion, session.contentPack,
        ts, x, y,
        xPct.toFixed(4), yPct.toFixed(4),
      ]);
    }
  }
  return [headers, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');
}

// ── Event analytics CSV export ───────────────────────────────────────────────

export function exportAsCsv(): string {
  const summaries = getSessionSummaries();
  const headers = [
    'Session ID', 'PID', 'Interface', 'Content Pack', 'Date', 'Duration (s)',
    'Sends', 'Source Hovers', 'Avg Source Hover (ms)', 'Source Clicks', 'Follow-up Clicks',
    'Conf Text Hovers (high)', 'Conf Text Hovers (medium)', 'Conf Text Hovers (low)',
  ];
  const rows = summaries.map(s => {
    const avgHover = s.sourceHovers.length > 0
      ? Math.round(s.sourceHovers.reduce((sum, h) => sum + h.durationMs, 0) / s.sourceHovers.length)
      : 0;
    const confCount = (level: string) => s.confidenceTextHovers.filter(h => h.confidence === level).length;
    return [
      s.sessionId,
      s.participantId,
      s.interfaceVersion,
      s.contentPack,
      new Date(s.startTime).toLocaleString(),
      Math.round(s.durationMs / 1000),
      s.sends,
      s.sourceHovers.length,
      avgHover,
      s.sourceClicks.length,
      s.followUpClicks.join('; '),
      confCount('high'),
      confCount('medium'),
      confCount('low'),
    ];
  });
  return [headers, ...rows]
    .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');
}
