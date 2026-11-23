export const steps = [
  'intro',
  'role',
  'when',
  'screen',
  'symptoms',
  'dream',
  'time',
  'helps',
  'daily',
  'numbers',
  'recall',
  'cost',
  'head',
  'social',
  'solution',
  'limit',
  'reward',
  'offer',
] as const;
export type Step = (typeof steps)[number];
export type Answers = Partial<Record<Step, string[]>>;
export const SECONDS_PER_REEL = 30;
export function indian(n: number) {
  'worklet';
  const s = String(Math.round(n)),
    last = s.slice(-3);
  let leading = s.slice(0, -3),
    out = '';
  while (leading.length > 2) {
    out = ',' + leading.slice(-2) + out;
    leading = leading.slice(0, -2);
  }
  return leading ? leading + out + ',' + last : last;
}
export function projection(answers: Answers, chosen: number | null) {
  const daily = Number(answers.daily?.[0] ?? 300),
    ceiling = [180, 360, 540, 1440][Number(answers.screen?.[0] ?? 3)];
  const limit = Math.max(
    0,
    Math.min(daily, chosen ?? Math.round(daily * 0.07) * 10),
  );
  const minutes = (n: number) => Math.min((n * SECONDS_PER_REEL) / 60, ceiling);
  const saved = minutes(daily) - minutes(limit);
  return {
    daily,
    limit,
    saved,
    days: (minutes(daily) * 365) / 1440,
    regained: (saved * 365) / 1440,
    atLeast: daily === 1000,
  };
}
export const symptoms = (a: Answers) =>
  (a.symptoms ?? []).filter((x) => x !== 'skip');
export function beats(step: Step, a: Answers) {
  switch (step) {
    case 'numbers':
      return 5;
    case 'cost':
      return 2;
    case 'head':
      return Math.max(1, symptoms(a).length) + 1;
    case 'social':
      return 7;
    case 'solution':
      return 3;
    default:
      return 1;
  }
}
