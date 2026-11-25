import { indian, SECONDS_PER_REEL, type Step } from './store/model';

export const copy = {
  brand: 'BrainSpace',
  language: 'English',
  languageTitle: 'App language',
  languageDetail: 'English is the available language.',
  close: 'Close',
  back: 'Back',
  next: 'Continue',
  okay: 'Okay',
  tap: 'Tap to continue',
  reels: 'reels',
  channel: 'Focus reminders',
  intro: [
    'Hi, I’m {BrainSpace}.',
    'I help you make {room for focus}.',
    'Let’s start with {a few quick questions}.',
  ],
  introPreview: 'Your reel counter preview',
  previewNumber: '211',
  welcome: 'Meet your focus companion',
  permission: 'Focus reminders',
  progress: (q: number) => 'Question ' + q + ' of 10',
  multi: 'Choose all that apply.',
  private: 'Your answers stay on this device.',
  units: ['', 'reels a day', 'reels a week', 'reels a month', 'reels a year'],
  calculating: 'Putting your estimate in perspective…',
  annual: (daily: number) => indian(daily * 365) + (daily === 1000 ? '+' : ''),
  recall: (annual: string) => annual + ' reels. How many do you {remember}?',
  cost: (annual: string) =>
    'What could {' + annual + ' reels|danger} cost in time?',
  yearly: 'days every year',
  months: (days: number) => 'About ' + (days / 30.4).toFixed(1) + ' months',
  costNote:
    'Estimate at ' +
    SECONDS_PER_REEL +
    ' seconds per reel, capped by your screen-time range.',
  estimate: 'Based on your daily estimate',
  estimated: 'Estimated time',
  storyLabel: 'Your attention',
  limitLabel: 'Your daily reel limit',
  symptoms: {
    sleep: ['You mentioned {losing sleep}.', 'moon'],
    pain: ['You mentioned {headaches}.', 'bolt'],
    focus: ['It can feel {hard to focus}.', 'focus'],
    memory: ['You mentioned {forgetting things}.', 'thought'],
    low: ['You mentioned {feeling low}.', 'heart'],
    depressed: ['You mentioned {feeling depressed}.', 'heart'],
    skip: ['Your attention {deserves a break}.', 'focus'],
    last: ['That can leave {less room for your interests}.', 'time'],
  },
  social: [
    'You’re {not alone}.',
    'Other people feel {pulled into feeds}, too.',
    'That feeling is {no accident}.',
    'Your goals compete with a feed designed to {hold your attention}.',
    'One more scroll can {interrupt your focus|danger}.',
    'Your attention has {value|danger} to advertisers.',
    'BrainSpace helps you {pause} and choose what comes next.',
  ],
  solution: (days: number, saved: number) => [
    'A gentler limit could give you {' + days + ' days} back each year.',
    'A little more {headspace} for the things you care about.',
    'You could save {' + saved + ' minutes|success} a day.',
  ],
  target: 'What’s your {daily reel limit}?',
  today: (n: number) => indian(n) + ' today',
  goal: (n: number) => indian(n) + ' in 30 days',
  saving: (n: number) =>
    'You could save ' + n + ' min a day for your interests.',
  chartLabel: 'Daily reels from today to your target',
  reward: [
    'You chose to {scroll less}.',
    'That’s {a great start}.',
    'We have something {special for you}.',
  ],
  giftsOpen: 'A look inside',
  giftsMove: 'Watch the shuffle',
  giftsPick: 'Pick one gift',
  giftLabel: (n: number) => 'Choose gift ' + n,
  off: (n: number) => n + '% OFF',
  claimed: (n: number) => 'Your gift is {' + n + '% off}.',
  openOffer: 'View my offer',
  offerTitle: 'A little more room.',
  offerBody:
    'Your introductory offer is saved on this device. Paid plans are coming later. Start free with usage insights, focus sessions and an urge reset.',
  home: 'Open BrainSpace',
  giftSaved: 'Your saved offer',
};
type Question = {
  prompt: string;
  labels: string[];
  values?: string[];
  multi?: boolean;
};
export const questions: Partial<Record<Step, Question>> = {
  role: {
    prompt: 'What do you {do}?',
    labels: [
      'Studying',
      'Working',
      'Homemaker',
      'Not working right now',
      'Other',
    ],
  },
  when: {
    prompt: 'When do you {usually} watch reels?',
    labels: [
      'All day',
      'When I’m bored',
      'During study or work',
      'After dinner',
      'Late at night',
    ],
  },
  screen: {
    prompt: 'What’s your average daily {screen time}?',
    labels: ['Under 3 hours', '3–6 hours', '6–9 hours', '9+ hours'],
  },
  symptoms: {
    prompt: 'After scrolling, which of these have you {noticed}?',
    labels: [
      'Lack of sleep',
      'Headaches',
      'Trouble focusing',
      'Forgetfulness',
      'Feeling low',
      'Feeling depressed',
      'None / prefer to skip',
    ],
    values: ['sleep', 'pain', 'focus', 'memory', 'low', 'depressed', 'skip'],
    multi: true,
  },
  dream: {
    prompt: 'Do you have a {dream or interest} you want to grow?',
    labels: ['Yes, I have a dream', 'Yes, I have an interest'],
  },
  time: {
    prompt: 'Do you get enough time to {grow your interest}?',
    labels: [
      'No, not at all',
      'I don’t know where my time goes',
      'Yes, but very little',
    ],
  },
  helps: {
    prompt: 'Does watching reels help {your interest grow}?',
    labels: ['Not at all', 'Yes, a little'],
  },
  daily: {
    prompt: 'About how many {reels} do you watch in a day?',
    labels: ['300', '400', '600', '800', '1,000+'],
    values: ['300', '400', '600', '800', '1000'],
  },
  recall: {
    prompt: '',
    labels: [
      'I don’t remember any',
      'Only a few',
      'Quite a few',
      'Most of them',
    ],
  },
};
