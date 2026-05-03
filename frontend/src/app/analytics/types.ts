export interface AnalyticsEvent {
  sessionId: string;
  participantId: number;
  interfaceVersion: string;
  contentPack: string;
  eventType: 'click' | 'hover_enter' | 'hover_exit';
  element: string;
  timestamp: number;
  url?: string;
  confidence?: string;
  durationMs?: number;
  optionText?: string;
}

export type TrackFn = (
  eventType: AnalyticsEvent['eventType'],
  element: string,
  metadata?: Partial<Pick<AnalyticsEvent, 'url' | 'confidence' | 'durationMs' | 'optionText'>>
) => void;
