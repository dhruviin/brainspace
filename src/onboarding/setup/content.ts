// Stable values are persisted; all first-run copy lives here for localization.
export const questionIds = [
  'goals',
  'distractions',
  'screen',
  'reels',
  'triggers',
  'protect',
  'habits',
  'focus',
] as const;
export type QuestionId = (typeof questionIds)[number];
export type SetupStep = 'intro' | QuestionId | 'access' | 'plan';
export type SetupAnswers = Partial<Record<QuestionId, string[]>>;
export type Option = {
  value: string;
  title: string;
  detail?: string;
  icon: string;
};
export type Question = {
  eyebrow: string;
  title: string;
  detail: string;
  icon: string;
  multi?: boolean;
  max?: number;
  options: Option[];
};

export const setupCopy = {
  brand: 'BrainSpace',
  back: 'Go back',
  continue: 'Continue',
  start: 'Make room for me',
  welcomeEyebrow: 'LESS AUTOPILOT. MORE YOU.',
  welcomeTitle: 'A little less phone.\nA lot more life.',
  welcomeDetail:
    'Understand your screen time, find your focus, and change the habits you choose.',
  welcomePill: 'Your pace. Your space.',
  pillars: ['Phone time', 'Deep focus', 'Better habits'],
  free: 'Free to begin · No account needed',
  private: 'Your answers stay on this device.',
  chooseOne: 'Choose one',
  chooseMany: 'Choose all that fit',
  chooseTwo: 'Choose up to two',
  saving: 'Saving your space…',
  finish: 'Let’s begin',
  edit: 'Review my answers',
  saveError: 'Your changes couldn’t be saved. Please try again.',
  privateUnavailable:
    'Private saving isn’t available on this device. Choose a general preference to continue.',
  customPlaceholder: 'Name it in your own words',
  customLabel: 'Your private habit',
  customHint: 'A short label is enough. No personal details needed.',
  accessEyebrow: 'YOU’RE IN CONTROL',
  accessTitle: 'A clearer picture.\nOnly with your okay.',
  accessDetail:
    'Usage Access helps BrainSpace show how much time you spend in each app on Android.',
  accessButton: 'Open Usage Access settings',
  accessGranted: 'Usage Access is connected',
  accessWaiting: 'Open settings again',
  accessLater: 'Continue without access',
  accessFooter: 'You can manage access anytime in Profile.',
  accessOpenError:
    'Settings couldn’t be opened. You can enable access later in Profile.',
  accessRows: [
    [
      'time-outline',
      'App names & time spent',
      'Read from Android’s usage history, when you allow it.',
    ],
    [
      'lock-closed-outline',
      'Your content stays private',
      'Usage Access does not read messages, passwords, or what you watch.',
    ],
    [
      'options-outline',
      'Optional, always',
      'Focus and habit tools work without it. Change access in Android settings.',
    ],
  ],
  accessUnsupported:
    'Live app usage isn’t available on this device yet. You can still use focus sessions and habit tools.',
  reelsDisclosure:
    'This answer is your own estimate. Optional Android reel tracking is experimental and can be connected in the access step.',
  planEyebrow: 'YOUR COMMITMENT',
  planTitle: 'You’re Ready to Begin.',
  planDetail:
    'Most people never change their screen time. Today, you took the first real step to reclaim your focus.',
  planNote: 'A starting intention, not a prediction. Every fresh start counts.',
  planFocus: 'One protected focus session',
  planMoment: 'One moment to make your own',
  planHabit: 'Private habit support',
  planHabitDetail: 'A small check-in, with space for fresh starts.',
  timezone: 'Your local time',
  preview: 'YOUR DAILY COMPASS',
  previewFocus: 'A little room for focus',
  previewAction: 'One small step today',
  preferences: 'Your starting plan',
  preferencesDetail: 'Review your goals, focus time, and private preferences.',
  skipped: 'Make BrainSpace yours',
  skippedDetail: 'Choose what you’d like to work on whenever you’re ready.',
  freshStart: 'YOUR FRESH START',
  ready: 'READY WHEN YOU ARE',
  selectedCount: (count: number) => `${count} selected`,
  focusTitle: (minutes: number) => `${minutes} minutes, just for you`,
  defaultMoment: 'A pause before the next scroll',
  companionAccessibility: 'Your BrainSpace companion',
  themeAccessibility: 'Preview of your selected app appearance',
  progressAccessibility: 'Setup progress',
};

export const setupQuestions: Record<QuestionId, Question> = {
  goals: {
    eyebrow: 'START WITH WHAT MATTERS',
    title: 'What would you like\nmore room for?',
    detail:
      'Your goals can be a mix. We’ll shape your starting plan around them.',
    icon: 'compass-outline',
    multi: true,
    options: [
      {
        value: 'phone',
        title: 'Less time on my phone',
        detail: 'Make checking a choice, not a reflex.',
        icon: 'phone-portrait-outline',
      },
      {
        value: 'focus',
        title: 'Focus that lasts',
        detail: 'Protect time for study, work, or creating.',
        icon: 'scan-outline',
      },
      {
        value: 'presence',
        title: 'More life beyond the screen',
        detail: 'Be present for people and things I love.',
        icon: 'sunny-outline',
      },
      {
        value: 'habits',
        title: 'A healthier relationship with a habit',
        detail: 'Private support, without judgment.',
        icon: 'leaf-outline',
      },
    ],
  },
  distractions: {
    eyebrow: 'NOTICE YOUR PATTERNS',
    title: 'What pulls you in\nlonger than you’d like?',
    detail: 'Think about what feels automatic, rather than every app you use.',
    icon: 'magnet-outline',
    multi: true,
    options: [
      { value: 'shorts', title: 'Reels & Shorts', icon: 'play-outline' },
      { value: 'social', title: 'Social feeds', icon: 'chatbubbles-outline' },
      {
        value: 'checking',
        title: 'Constant checking',
        icon: 'phone-portrait-outline',
      },
      { value: 'gaming', title: 'Gaming', icon: 'game-controller-outline' },
      { value: 'streaming', title: 'Videos & streaming', icon: 'tv-outline' },
      {
        value: 'shopping',
        title: 'Online shopping',
        icon: 'bag-handle-outline',
      },
      { value: 'news', title: 'News & browsing', icon: 'newspaper-outline' },
      { value: 'other', title: 'Something else', icon: 'ellipsis-horizontal' },
    ],
  },
  screen: {
    eyebrow: 'YOUR EVERYDAY BASELINE',
    title: 'On a typical day,\nhow much phone time?',
    detail:
      'Include all apps, even work and messaging. A rough guess is enough.',
    icon: 'time-outline',
    options: [
      { value: 'under2', title: 'Less than 2 hours', icon: 'time-outline' },
      { value: '2to4', title: '2–4 hours', icon: 'time-outline' },
      { value: '4to6', title: '4–6 hours', icon: 'time-outline' },
      { value: 'over6', title: 'More than 6 hours', icon: 'time-outline' },
      {
        value: 'unknown',
        title: 'I’m not sure yet',
        icon: 'help-circle-outline',
      },
    ],
  },
  reels: {
    eyebrow: 'JUST FOR YOUR SHORT-FORM HABIT',
    title: 'How many Reels or\nShorts in a usual day?',
    detail:
      'Only a personal estimate. We won’t turn a guess into a measured count.',
    icon: 'play-circle-outline',
    options: [
      { value: 'under25', title: 'Fewer than 25', icon: 'play-outline' },
      { value: '25to75', title: '25–75', icon: 'play-outline' },
      { value: '75to150', title: '75–150', icon: 'play-outline' },
      { value: 'over150', title: 'More than 150', icon: 'play-outline' },
      {
        value: 'unknown',
        title: 'I lose count / I’m not sure',
        icon: 'help-circle-outline',
      },
    ],
  },
  triggers: {
    eyebrow: 'UNDERSTAND THE MOMENT',
    title: 'What’s usually happening\nwhen you reach for it?',
    detail: 'Spotting the moment gives you a chance to choose what comes next.',
    icon: 'sparkles-outline',
    multi: true,
    options: [
      {
        value: 'bored',
        title: 'I have a quiet or boring moment',
        icon: 'hourglass-outline',
      },
      {
        value: 'stress',
        title: 'I want a break from stress',
        icon: 'cloud-outline',
      },
      {
        value: 'avoid',
        title: 'I’m putting something off',
        icon: 'pause-outline',
      },
      {
        value: 'connection',
        title: 'I’m looking for connection',
        icon: 'people-outline',
      },
      {
        value: 'automatic',
        title: 'I open it without thinking',
        icon: 'repeat-outline',
      },
    ],
  },
  protect: {
    eyebrow: 'MAKE SPACE FOR REAL LIFE',
    title: 'Which moment would\nyou love to take back?',
    detail:
      'Start with one part of your day. There’s no need to change everything.',
    icon: 'sunny-outline',
    options: [
      {
        value: 'morning',
        title: 'A slower, phone-free morning',
        icon: 'sunny-outline',
      },
      {
        value: 'work',
        title: 'Uninterrupted study or work',
        icon: 'book-outline',
      },
      {
        value: 'people',
        title: 'Time with people I care about',
        icon: 'people-outline',
      },
      {
        value: 'interests',
        title: 'Space for a hobby or movement',
        icon: 'bicycle-outline',
      },
      {
        value: 'bedtime',
        title: 'A calmer wind-down at night',
        icon: 'moon-outline',
      },
    ],
  },
  habits: {
    eyebrow: 'A SPACE THAT’S JUST YOURS',
    title: 'Any habit you’d like\nprivate support with?',
    detail: 'Choose up to two, or keep it general.',
    icon: 'leaf-outline',
    multi: true,
    max: 2,
    options: [
      { value: 'smoking', title: 'Smoking or vaping', icon: 'leaf-outline' },
      { value: 'gambling', title: 'Gambling', icon: 'dice-outline' },
      { value: 'adult', title: 'Adult content', icon: 'lock-closed-outline' },
      { value: 'shopping', title: 'Compulsive spending', icon: 'bag-outline' },
      { value: 'custom', title: 'A habit of my own', icon: 'create-outline' },
      {
        value: 'general',
        title: 'I’d rather keep it general',
        icon: 'shield-checkmark-outline',
      },
    ],
  },
  focus: {
    eyebrow: 'DAILY FOCUS TIMER',
    title: 'How long can you focus\nwithout checking your phone?',
    detail:
      'Choose a comfortable timer for studying or working. You can adjust this anytime.',
    icon: 'timer-outline',
    options: [
      {
        value: '15',
        title: '15 minutes',
        detail: 'A quick and easy start.',
        icon: 'leaf-outline',
      },
      {
        value: '25',
        title: '25 minutes',
        detail: 'Standard focus timer (Recommended).',
        icon: 'timer-outline',
      },
      {
        value: '45',
        title: '45 minutes',
        detail: 'Deep study or uninterrupted work.',
        icon: 'scan-outline',
      },
      {
        value: '60',
        title: '60 minutes',
        detail: 'Long stretch of full focus.',
        icon: 'sunny-outline',
      },
    ],
  },
};
