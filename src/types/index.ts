export type TabType = 'home' | 'insights' | 'focus' | 'recover' | 'profile';

export type AppCategory = 'Productive' | 'Neutral' | 'Distracting';

export interface AppUsageItem {
  id: string;
  name: string;
  packageName: string;
  minutes: number;
  category: AppCategory;
  reelsCount?: number;
  icon: string;
}

export interface HabitItem {
  id: string;
  title: string;
  category: 'reduce' | 'abstain' | 'build';
  currentStreakDays: number;
  bestStreakDays: number;
  totalDays: number;
  lastCheckIn?: string;
}

export interface FocusSessionLog {
  id: string;
  mode: 'pomodoro' | 'stopwatch' | 'countdown';
  durationMinutes: number;
  completedAt: string;
  tag: string;
}
