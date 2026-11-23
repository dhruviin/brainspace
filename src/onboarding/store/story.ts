import { storyStorage } from './storage';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type Answers, beats, type Step, steps } from './model';

type EventName =
  'onboarding_step_view' | 'onboarding_answer' | 'onboarding_complete';
type Event = { name: EventName; step: Step; at: number };
type State = {
  step: Step;
  beat: number;
  answers: Answers;
  limit: number | null;
  completed: boolean;
  prompted: boolean;
  gifts: number[];
  gift: number | null;
  events: Event[];
  go: (step: Step, beat?: number) => void;
  next: () => void;
  back: () => boolean;
  answer: (id: Step, values: string[]) => void;
  setLimit: (v: number) => void;
  markPrompt: () => void;
  deal: () => void;
  claim: (slot: number) => void;
  finish: () => void;
  view: () => void;
};
const event = (s: State, name: EventName, step = s.step): Event[] => [
  ...s.events.slice(-95),
  { name, step, at: Date.now() },
];
export const useStory = create<State>()(
  persist(
    (set, get) => ({
      step: 'intro',
      beat: 0,
      answers: {},
      limit: null,
      completed: false,
      prompted: false,
      gifts: [],
      gift: null,
      events: [],
      go: (step, beat = 0) => set({ step, beat }),
      next: () => {
        const s = get();
        if (s.beat + 1 < beats(s.step, s.answers)) set({ beat: s.beat + 1 });
        else if (s.step !== 'offer')
          set({ step: steps[steps.indexOf(s.step) + 1], beat: 0 });
      },
      back: () => {
        const s = get();
        if (s.beat > 0) {
          set({ beat: s.beat - 1 });
          return true;
        }
        const prev = steps[steps.indexOf(s.step) - 1];
        if (!prev) return false;
        set({ step: prev, beat: beats(prev, s.answers) - 1 });
        return true;
      },
      answer: (id, values) =>
        set((s) => ({
          answers: { ...s.answers, [id]: values },
          limit: id === 'daily' ? null : s.limit,
          events: event(s, 'onboarding_answer', id),
        })),
      setLimit: (limit) =>
        set((s) => ({ limit, events: event(s, 'onboarding_answer', 'limit') })),
      markPrompt: () => set({ prompted: true }),
      deal: () => {
        if (get().gifts.length) return;
        const a = [10, 40, 70];
        for (let i = 2; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [a[i], a[j]] = [a[j], a[i]];
        }
        // Every shuffle actually moves a box.
        if (a[0] === 10 && a[1] === 40) a.push(a.shift()!);
        set({ gifts: a });
      },
      claim: (slot) =>
        set((s) =>
          s.gift === null && s.gifts[slot] ? { gift: s.gifts[slot] } : {},
        ),
      view: () => set((s) => ({ events: event(s, 'onboarding_step_view') })),
      finish: () =>
        set((s) =>
          s.completed
            ? {}
            : { completed: true, events: event(s, 'onboarding_complete') },
        ),
    }),
    { name: 'brainspace-story-v1', storage: storyStorage<State>() },
  ),
);
