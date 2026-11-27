import type { QuestionId, SetupAnswers, SetupStep } from './content';

export const SETUP_VERSION = 2;
export const SETUP_KEY = 'brainspace-setup-v2';
export const PRIVATE_KEY = 'brainspace-setup-private-v2';
export type SavedSetup = {
  version: number;
  step: SetupStep;
  answers: SetupAnswers;
  customHabit: string;
  completed: boolean;
  skipped: boolean;
  timezone: string;
};
export const defaults: SavedSetup = {
  version: SETUP_VERSION,
  step: 'intro',
  answers: {},
  customHabit: '',
  completed: false,
  skipped: false,
  timezone: '',
};

export function setupSteps(answers: SetupAnswers): SetupStep[] {
  return [
    'intro',
    'goals',
    'distractions',
    'screen',
    ...(answers.distractions?.includes('shorts') ? ['reels' as const] : []),
    'triggers',
    'protect',
    ...(answers.goals?.includes('habits') ? ['habits' as const] : []),
    'focus',
    'access',
    'plan',
  ];
}

export function selectOption(
  selected: string[],
  value: string,
  multi = false,
  max?: number,
) {
  if (!multi || value === 'general') return [value];
  if (selected.includes(value))
    return selected.filter((item) => item !== value);
  const remaining = selected.filter((item) => item !== 'general');
  return max && remaining.length >= max ? selected : [...remaining, value];
}

export function updateAnswers(
  answers: SetupAnswers,
  id: QuestionId,
  values: string[],
): SetupAnswers {
  const next = { ...answers, [id]: values };
  if (id === 'distractions' && !values.includes('shorts')) delete next.reels;
  if (id === 'goals' && !values.includes('habits')) delete next.habits;
  return next;
}

export function focusMinutes(answers: SetupAnswers) {
  const chosen = Number(answers.focus?.[0]);
  return [15, 25, 45, 60].includes(chosen) ? chosen : 15;
}

export function hasPrivatePreferences(
  value: Pick<SavedSetup, 'answers' | 'customHabit'>,
) {
  return Boolean(
    value.answers.habits?.some((v) => v !== 'general') || value.customHabit,
  );
}

// Persisted input can be stale or malformed. Never let it strand the launch route.
export function restoreSetup(value: unknown): SavedSetup {
  if (!value || typeof value !== 'object') return { ...defaults, answers: {} };
  const raw = value as Partial<SavedSetup>;
  const answers: SetupAnswers = {};
  const allowed: QuestionId[] = [
    'goals',
    'distractions',
    'screen',
    'reels',
    'triggers',
    'protect',
    'habits',
    'focus',
  ];
  for (const id of allowed) {
    const selection = raw.answers?.[id];
    if (
      Array.isArray(selection) &&
      selection.every((v) => typeof v === 'string')
    )
      answers[id] = selection;
  }
  if (!answers.distractions?.includes('shorts')) delete answers.reels;
  if (!answers.goals?.includes('habits')) delete answers.habits;
  const path = setupSteps(answers);
  return {
    ...defaults,
    answers,
    step: path.includes(raw.step as SetupStep) ? raw.step! : 'intro',
    customHabit:
      answers.habits?.includes('custom') && typeof raw.customHabit === 'string'
        ? raw.customHabit.slice(0, 60)
        : '',
    completed: raw.completed === true,
    skipped: raw.skipped === true,
    timezone: typeof raw.timezone === 'string' ? raw.timezone : '',
  };
}
