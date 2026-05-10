import { useState } from 'react';
import {
  getSessionSummaries, clearAnalytics, exportAsCsv, type SessionSummary, type ConfidenceTextHover,
  exportCursorSessions, clearCursor, exportCursorAsCsv,
} from '../analytics/analyticsClient';
import type { CursorSession } from '../analytics/types';

// ── Shared helpers ────────────────────────────────────────────────────────────

const CONFIDENCE_COLORS: Record<string, string> = {
  high:   'bg-[#4A90E2]/15 text-[#1F5EA8] border-[#4A90E2]/40',
  medium: 'bg-[#F5A623]/15 text-[#A96B11] border-[#F5A623]/45',
  low:    'bg-[#EA4C89]/15 text-[#A61E57] border-[#EA4C89]/40',
};

function ConfidenceBadge({ level }: { level: string }) {
  const cls = CONFIDENCE_COLORS[level] ?? 'bg-gray-100 text-gray-600 border-gray-300';
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${cls}`}>
      {level || '—'}
    </span>
  );
}

function formatMs(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function formatDuration(ms: number): string {
  const secs = Math.round(ms / 1000);
  if (secs < 60) return `${secs}s`;
  const mins = Math.floor(secs / 60);
  const rem  = secs % 60;
  return rem > 0 ? `${mins}m ${rem}s` : `${mins}m`;
}

function downloadCsv(csv: string, filename: string) {
  const blob = new Blob([csv], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Events tab ────────────────────────────────────────────────────────────────

function ConfTextHoverRow({ hover }: { hover: ConfidenceTextHover }) {
  return (
    <div className="flex items-center gap-2 text-xs text-gray-700">
      <ConfidenceBadge level={hover.confidence} />
      <span className="text-gray-400">{formatMs(hover.durationMs)}</span>
    </div>
  );
}

function ExpandedEventRow({ summary }: { summary: SessionSummary }) {
  const avgHover = summary.sourceHovers.length > 0
    ? Math.round(summary.sourceHovers.reduce((sum, h) => sum + h.durationMs, 0) / summary.sourceHovers.length)
    : null;

  const isEmpty = summary.sourceHovers.length === 0 && summary.sourceClicks.length === 0
    && summary.followUpClicks.length === 0 && summary.confidenceTextHovers.length === 0;

  if (isEmpty) {
    return (
      <tr>
        <td colSpan={10} className="px-4 pb-4 pt-0">
          <p className="ml-4 text-xs text-gray-400 italic">No interactions recorded.</p>
        </td>
      </tr>
    );
  }

  return (
    <tr>
      <td colSpan={10} className="px-4 pb-4 pt-0">
        <div className="ml-4 space-y-3">
          {summary.confidenceTextHovers.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1.5">
                Confidence text hovers <span className="font-normal">({summary.confidenceTextHovers.length} total)</span>
              </p>
              <div className="space-y-1">
                {summary.confidenceTextHovers.map((h, i) => (
                  <ConfTextHoverRow key={i} hover={h} />
                ))}
              </div>
            </div>
          )}
          {summary.sourceHovers.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1.5">
                Source hovers {avgHover !== null && <span className="font-normal">(avg {formatMs(avgHover)})</span>}
              </p>
              <div className="space-y-1">
                {summary.sourceHovers.map((h, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-gray-700">
                    <ConfidenceBadge level={h.confidence} />
                    <span className="font-mono text-gray-500">{h.label}</span>
                    <span className="text-gray-400">{formatMs(h.durationMs)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {summary.sourceClicks.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1.5">Source clicks</p>
              <div className="space-y-1">
                {summary.sourceClicks.map((c, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-gray-700">
                    <ConfidenceBadge level={c.confidence} />
                    <span className="font-mono text-gray-500">{c.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {summary.followUpClicks.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1.5">Follow-up selections</p>
              <div className="flex flex-wrap gap-1.5">
                {summary.followUpClicks.map((opt, i) => (
                  <span key={i} className="inline-flex items-center rounded-full border border-gray-300 bg-gray-50 px-2.5 py-0.5 text-xs text-gray-700">
                    {opt}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
}

function EventSessionRow({ summary }: { summary: SessionSummary }) {
  const [expanded, setExpanded] = useState(false);
  const avgHover = summary.sourceHovers.length > 0
    ? Math.round(summary.sourceHovers.reduce((sum, h) => sum + h.durationMs, 0) / summary.sourceHovers.length)
    : null;
  const hasDetails = summary.confidenceTextHovers.length > 0 || summary.sourceHovers.length > 0 || summary.sourceClicks.length > 0 || summary.followUpClicks.length > 0;

  return (
    <>
      <tr
        className={`border-b border-gray-100 text-sm transition-colors ${hasDetails ? 'cursor-pointer hover:bg-gray-50' : ''}`}
        onClick={() => hasDetails && setExpanded(e => !e)}
      >
        <td className="px-4 py-3 font-medium text-gray-800">{summary.participantId}</td>
        <td className="px-4 py-3">
          <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">{summary.interfaceVersion}</span>
        </td>
        <td className="px-4 py-3 text-gray-600 text-xs">{summary.contentPack}</td>
        <td className="px-4 py-3 text-gray-600 text-xs">
          <div>{new Date(summary.startTime).toLocaleDateString()}</div>
          <div className="text-gray-400">{new Date(summary.startTime).toLocaleTimeString()}</div>
        </td>
        <td className="px-4 py-3 text-gray-500 text-xs">{formatDuration(summary.durationMs)}</td>
        <td className="px-4 py-3 text-center text-gray-800">{summary.sends}</td>
        <td className="px-4 py-3 text-center text-gray-800">
          {summary.sourceHovers.length > 0
            ? <>{summary.sourceHovers.length} <span className="text-xs text-gray-400">({avgHover !== null ? formatMs(avgHover) : '—'} avg)</span></>
            : <span className="text-gray-300">—</span>}
        </td>
        <td className="px-4 py-3 text-center text-gray-800">
          {summary.sourceClicks.length > 0 ? summary.sourceClicks.length : <span className="text-gray-300">—</span>}
        </td>
        <td className="px-4 py-3 text-center text-gray-800">
          {summary.followUpClicks.length > 0 ? summary.followUpClicks.length : <span className="text-gray-300">—</span>}
        </td>
        <td className="px-4 py-3 text-gray-400 text-xs">
          {hasDetails && <span>{expanded ? '▲' : '▶'}</span>}
        </td>
      </tr>
      {expanded && <ExpandedEventRow summary={summary} />}
    </>
  );
}

function EventsTab() {
  const [summaries, setSummaries] = useState<SessionSummary[]>(() => getSessionSummaries());
  const totalInteractions = summaries.reduce((sum, s) =>
    sum + s.sends + s.sourceHovers.length + s.sourceClicks.length + s.followUpClicks.length + s.confidenceTextHovers.length, 0);

  const handleClear = () => {
    if (!window.confirm('Delete all event analytics data?')) return;
    clearAnalytics();
    setSummaries([]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {summaries.length} session{summaries.length !== 1 ? 's' : ''} · {totalInteractions} interactions
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => downloadCsv(exportAsCsv(), `iv-events-${new Date().toISOString().slice(0, 10)}.csv`)}
            disabled={summaries.length === 0}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Export CSV
          </button>
          <button
            onClick={handleClear}
            disabled={summaries.length === 0}
            className="rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Clear Data
          </button>
        </div>
      </div>

      {summaries.length > 0 && (
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Sessions',            value: summaries.length },
            { label: 'Total Sends',         value: summaries.reduce((s, r) => s + r.sends, 0) },
            { label: 'Conf Text Hovers',    value: summaries.reduce((s, r) => s + r.confidenceTextHovers.length, 0) },
            { label: 'Source Hovers',       value: summaries.reduce((s, r) => s + r.sourceHovers.length, 0) },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-xl border border-gray-200 bg-white px-5 py-4">
              <p className="text-xs text-gray-500">{label}</p>
              <p className="mt-1 text-2xl font-semibold text-gray-800">{value}</p>
            </div>
          ))}
        </div>
      )}

      {summaries.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white px-8 py-16 text-center">
          <p className="text-gray-400">No event data yet.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                <th className="px-4 py-3">PID</th>
                <th className="px-4 py-3">Interface</th>
                <th className="px-4 py-3">Content Pack</th>
                <th className="px-4 py-3">Date / Time</th>
                <th className="px-4 py-3">Duration</th>
                <th className="px-4 py-3 text-center">Sends</th>
                <th className="px-4 py-3 text-center">Hovers</th>
                <th className="px-4 py-3 text-center">Clicks</th>
                <th className="px-4 py-3 text-center">Follow-ups</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {summaries.map(s => <EventSessionRow key={s.sessionId} summary={s} />)}
            </tbody>
          </table>
          <p className="px-4 py-2 text-xs text-gray-400 border-t border-gray-100">
            Click a row to expand source interaction details.
          </p>
        </div>
      )}
    </div>
  );
}

// ── Cursor tab ────────────────────────────────────────────────────────────────

function CursorTab() {
  const [sessions, setSessions] = useState<CursorSession[]>(() => exportCursorSessions());
  const totalPoints = sessions.reduce((sum, s) => sum + s.points.length, 0);

  const handleClear = () => {
    if (!window.confirm('Delete all cursor movement data?')) return;
    clearCursor();
    setSessions([]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {sessions.length} session{sessions.length !== 1 ? 's' : ''} · {totalPoints.toLocaleString()} cursor samples
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => downloadCsv(exportCursorAsCsv(), `iv-cursor-${new Date().toISOString().slice(0, 10)}.csv`)}
            disabled={sessions.length === 0}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Export CSV
          </button>
          <button
            onClick={handleClear}
            disabled={sessions.length === 0}
            className="rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Clear Data
          </button>
        </div>
      </div>

      {sessions.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Sessions',        value: sessions.length },
            { label: 'Total Samples',   value: totalPoints.toLocaleString() },
            { label: 'Avg per Session', value: Math.round(totalPoints / sessions.length).toLocaleString() },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-xl border border-gray-200 bg-white px-5 py-4">
              <p className="text-xs text-gray-500">{label}</p>
              <p className="mt-1 text-2xl font-semibold text-gray-800">{value}</p>
            </div>
          ))}
        </div>
      )}

      {sessions.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white px-8 py-16 text-center">
          <p className="text-gray-400">No cursor data yet.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                <th className="px-4 py-3">PID</th>
                <th className="px-4 py-3">Interface</th>
                <th className="px-4 py-3">Content Pack</th>
                <th className="px-4 py-3">Date / Time</th>
                <th className="px-4 py-3 text-center">Samples</th>
                <th className="px-4 py-3 text-center">Duration covered</th>
                <th className="px-4 py-3 text-center">Sample rate</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map(s => {
                const first = s.points[0]?.[0] ?? 0;
                const last  = s.points[s.points.length - 1]?.[0] ?? 0;
                const spanMs = last - first;
                const rate  = spanMs > 0 ? ((s.points.length / spanMs) * 1000).toFixed(1) : '—';
                return (
                  <tr key={s.sessionId} className="border-b border-gray-100 text-sm">
                    <td className="px-4 py-3 font-medium text-gray-800">{s.participantId}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">{s.interfaceVersion}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{s.contentPack}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs">
                      <div>{new Date(first).toLocaleDateString()}</div>
                      <div className="text-gray-400">{new Date(first).toLocaleTimeString()}</div>
                    </td>
                    <td className="px-4 py-3 text-center text-gray-800">{s.points.length.toLocaleString()}</td>
                    <td className="px-4 py-3 text-center text-gray-500 text-xs">{formatDuration(spanMs)}</td>
                    <td className="px-4 py-3 text-center text-gray-500 text-xs">{rate}/s</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="px-4 py-2 text-xs text-gray-400 border-t border-gray-100">
            CSV columns: Session ID, PID, Interface, Content Pack, Timestamp, X, Y, X%, Y%
          </p>
        </div>
      )}
    </div>
  );
}

// ── Root viewer ───────────────────────────────────────────────────────────────

type Tab = 'events' | 'cursor';

export default function AnalyticsViewer() {
  const [tab, setTab] = useState<Tab>('events');

  return (
    <div className="min-h-screen bg-gray-50 px-8 py-10">
      <div className="max-w-6xl mx-auto space-y-6">

        <h1 className="text-2xl font-semibold text-gray-800">Study Analytics</h1>

        {/* Tab switcher */}
        <div className="flex gap-1 rounded-lg border border-gray-200 bg-white p-1 w-fit">
          {(['events', 'cursor'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-md px-5 py-1.5 text-sm font-medium transition-colors ${
                tab === t
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              {t === 'events' ? 'Events' : 'Cursor Movements'}
            </button>
          ))}
        </div>

        {tab === 'events' ? <EventsTab /> : <CursorTab />}
      </div>
    </div>
  );
}
