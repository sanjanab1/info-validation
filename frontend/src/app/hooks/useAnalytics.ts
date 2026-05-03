import { useRef, useCallback } from 'react';
import { sendEvent } from '../analytics/analyticsClient';
import type { AnalyticsEvent, TrackFn } from '../analytics/types';

export function useAnalytics(participantId: number, interfaceVersion: string, contentPack: string): { track: TrackFn } {
  const sessionId = useRef(crypto.randomUUID());

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
      });
    },
    [participantId, interfaceVersion, contentPack]
  );

  return { track };
}
