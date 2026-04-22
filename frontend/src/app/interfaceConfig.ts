export const FOLLOW_UP_PROMPTS: Record<number, string> = {
  3: 'Would you like to ask your question in a different way?',
  4: 'Would you like some opposite opinions?',
  5: 'Would you like to ask this in another way?',
  6: 'Would you like some different opinions?',
};

export const FOLLOW_UP_OPTIONS: Record<number, string[]> = {
  5: [
    'Yes, I\'d like to rephrase',
    'No, I\'m satisfied with the answer',
    'Let me ask a new question'
  ],
  6: [
    'Yes, show me different perspectives',
    'No, this is helpful',
    'Maybe, what else can you tell me?'
  ],
};

export function getFollowUpPrompt(pid: number) {
  return FOLLOW_UP_PROMPTS[pid] ?? '';
}

export function getFollowUpOptions(pid: number) {
  return FOLLOW_UP_OPTIONS[pid] ?? [];
}
