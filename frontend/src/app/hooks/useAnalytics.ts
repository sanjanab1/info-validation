import { useRef, useCallback, useEffect } from 'react';
import { sendEvent, appendCursorPoints } from '../analytics/analyticsClient';
import type { AnalyticsEvent, TrackFn, CursorPoint } from '../analytics/types';

const CURSOR_THROTTLE_MS = 100;  // capture at 10 samples/sec
const CURSOR_FLUSH_MS    = 5000; // write buffer to localStorage every 5s

export function useAnalytics(participantId: number, interfaceVersion: string, contentPack: string): { track: TrackFn } {
  const sessionId = useRef(crypto.randomUUID());

  // ── Event tracking ─────────────────────────────────────────────────────────
  const track: TrackFn = useCallback(
    (eventType, element, metadata) => {
      sendEvent({
        sessionId: sessionId.current,
        participantId,
        interfaceVersion,
        contentPack,
        eventType,
        element,
        timestamp: Date.now(),
        ...metadata,
      } as AnalyticsEvent);
    },
    [participantId, interfaceVersion, contentPack]
  );

  // ── Cursor tracking ────────────────────────────────────────────────────────
  const cursorBuffer = useRef<CursorPoint[]>([]);
  const lastCapture  = useRef<number>(0);

  const flushCursor = useCallback(() => {
    if (cursorBuffer.current.length === 0) return;
    appendCursorPoints(
      sessionId.current,
      participantId,
      interfaceVersion,
      contentPack,
      [...cursorBuffer.current]
    );
    cursorBuffer.current = [];
  }, [participantId, interfaceVersion, contentPack]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      if (now - lastCapture.current < CURSOR_THROTTLE_MS) return;
      lastCapture.current = now;
      const xPct = e.clientX / window.innerWidth;
      const yPct = e.clientY / window.innerHeight;
      cursorBuffer.current.push([now, e.clientX, e.clientY, xPct, yPct]);
    };

    const flushInterval = setInterval(flushCursor, CURSOR_FLUSH_MS);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('beforeunload', flushCursor);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('beforeunload', flushCursor);
      clearInterval(flushInterval);
      flushCursor();
    };
  }, [flushCursor]);

  return { track };
}
