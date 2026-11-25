/* global __dirname */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

// Compile the real dependency-free modules using the project's TS compiler.
// No native bridge or second test framework is required.
function load(name, mocks = {}, cache = new Map()) {
  const filename = path.resolve(__dirname, name + '.ts');
  if (cache.has(filename)) return cache.get(filename);
  const compiled = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText;
  const module = { exports: {} };
  cache.set(filename, module.exports);
  new Function('require', 'module', 'exports', compiled)(
    (id) =>
      mocks[id] ?? (id.startsWith('.') ? load(id, mocks, cache) : require(id)),
    module,
    module.exports,
  );
  return module.exports;
}
const {
  setupSteps,
  updateAnswers,
  selectOption,
  restoreSetup,
  focusMinutes,
  defaults,
  SETUP_KEY,
  PRIVATE_KEY,
} = load('model');
const { createSetupPersistence } = load('persistence');

function memory() {
  const data = new Map();
  return {
    data,
    getItem: async (key) => data.get(key) ?? null,
    setItem: async (key, value) => {
      data.set(key, value);
    },
  };
}
function storage() {
  const local = memory(),
    secure = { ...memory(), available: async () => true };
  return { local, secure, persistence: createSetupPersistence(local, secure) };
}

test('a focus-only journey does not ask about reels or sensitive habits', () => {
  const journey = setupSteps({ goals: ['focus'], distractions: ['gaming'] });
  assert.equal(journey.includes('reels'), false);
  assert.equal(journey.includes('habits'), false);
  assert.deepEqual(journey.slice(-3), ['theme', 'access', 'plan']);
  assert.equal(new Set(journey).size, journey.length);
});

test('reels and recovery branches are independent and reversible', () => {
  const answers = {
    goals: ['phone', 'habits'],
    distractions: ['shorts'],
    reels: ['25to75'],
    habits: ['custom'],
  };
  assert.ok(setupSteps(answers).includes('reels'));
  assert.ok(setupSteps(answers).includes('habits'));
  const noReels = updateAnswers(answers, 'distractions', ['social']);
  assert.equal(noReels.reels, undefined);
  assert.ok(setupSteps(noReels).includes('habits'));
  const noHabits = updateAnswers(noReels, 'goals', ['focus']);
  assert.equal(noHabits.habits, undefined);
  assert.equal(setupSteps(noHabits).includes('habits'), false);
});

test('private selections enforce two goals and an exclusive general option', () => {
  assert.deepEqual(selectOption(['smoking', 'gambling'], 'custom', true, 2), [
    'smoking',
    'gambling',
  ]);
  assert.deepEqual(selectOption(['smoking'], 'smoking', true, 2), []);
  assert.deepEqual(selectOption(['smoking'], 'general', true, 2), ['general']);
  assert.deepEqual(selectOption(['general'], 'custom', true, 2), ['custom']);
});

test('skipped or unknown estimates never fabricate reel counts or focus targets', () => {
  assert.equal(focusMinutes({}), 15);
  assert.equal(focusMinutes({ focus: ['45'] }), 45);
  assert.equal(focusMinutes({ focus: ['999'] }), 15);
  assert.equal(
    restoreSetup({ answers: { reels: ['unknown'] } }).answers.reels,
    undefined,
  );
});

test('invalid and stale cursors recover to a valid first-run step', () => {
  assert.equal(restoreSetup({ step: 'old-offer', answers: [] }).step, 'intro');
  assert.equal(
    restoreSetup({ step: 'habits', answers: { goals: ['focus'] } }).step,
    'intro',
  );
  assert.equal(restoreSetup(null).completed, false);
  assert.deepEqual(restoreSetup({ answers: { goals: [false] } }).answers, {});
});

test('sensitive choices and custom labels never enter AsyncStorage', async () => {
  const { local, secure, persistence } = storage();
  const value = {
    ...defaults,
    step: 'habits',
    adultConfirmed: true,
    answers: { goals: ['habits'], habits: ['adult', 'custom'] },
    customHabit: 'My private label',
  };
  await persistence.save(value);
  const raw = local.data.get(SETUP_KEY);
  assert.ok(!raw.includes('My private label'));
  assert.ok(!raw.includes('"adult"'));
  assert.ok(!raw.includes('"habits":['));
  assert.ok(secure.data.get(PRIVATE_KEY).includes('My private label'));
  assert.deepEqual((await persistence.load()).answers.habits, [
    'adult',
    'custom',
  ]);
  assert.equal((await persistence.load()).customHabit, 'My private label');
});

test('draft writes are ordered before completion and resume includes the latest answer', async () => {
  const { persistence } = storage();
  const first = persistence.save({
    ...defaults,
    adultConfirmed: true,
    step: 'screen',
  });
  const final = persistence.save({
    ...defaults,
    adultConfirmed: true,
    step: 'plan',
    completed: true,
    answers: { focus: ['45'] },
  });
  await Promise.all([first, final]);
  const saved = await persistence.load();
  assert.equal(saved.completed, true);
  assert.equal(focusMinutes(saved.answers), 45);
});

test('secure storage failure rejects sensitive saves and can recover with a skipped answer', async () => {
  const local = memory(),
    secure = { ...memory(), available: async () => false };
  const persistence = createSetupPersistence(local, secure);
  await assert.rejects(
    persistence.save({ ...defaults, answers: { habits: ['adult'] } }),
  );
  assert.equal(local.data.has(SETUP_KEY), false);
  await persistence.save({ ...defaults, completed: true, answers: {} });
  assert.equal((await persistence.load()).completed, true);
});

test('cleared private choices cannot return from an old secure record', async () => {
  const { local, secure, persistence } = storage();
  await persistence.save({
    ...defaults,
    answers: { goals: ['habits'], habits: ['adult'] },
  });
  await persistence.save({ ...defaults, answers: { goals: ['focus'] } });
  secure.data.set(PRIVATE_KEY, JSON.stringify({ habits: ['adult'] }));
  assert.equal((await persistence.load()).answers.habits, undefined);
  assert.equal(JSON.parse(local.data.get(SETUP_KEY)).privatePreferences, false);
});

test('completion write failures are reported instead of marking onboarding complete', async () => {
  const local = memory(),
    secure = { ...memory(), available: async () => true };
  const persistence = createSetupPersistence(
    {
      ...local,
      setItem: async () => {
        throw new Error('disk full');
      },
    },
    secure,
  );
  await assert.rejects(
    persistence.save({ ...defaults, completed: true }),
    /disk full/,
  );
  assert.equal(local.data.has(SETUP_KEY), false);
});

test('existing completion migrates without forcing returning users through setup', async () => {
  const { local, persistence } = storage();
  local.data.set(
    'brainspace-story-v1',
    JSON.stringify({ state: { completed: true } }),
  );
  assert.equal((await persistence.load()).completed, true);
});

test('malformed public data and unavailable private data do not trap launch', async () => {
  const { local, secure, persistence } = storage();
  local.data.set(SETUP_KEY, 'null');
  assert.equal((await persistence.load()).step, 'intro');
  local.data.set(
    SETUP_KEY,
    JSON.stringify({ ...defaults, completed: true, privatePreferences: true }),
  );
  secure.getItem = async () => {
    throw new Error('unavailable');
  };
  assert.equal((await persistence.load()).completed, true);
});

function setupStore() {
  const local = memory(),
    secure = memory();
  const { useSetup } = load('store', {
    '@react-native-async-storage/async-storage': local,
    './secure': {
      securePreferences: { ...secure, available: async () => true },
    },
  });
  return { useSetup, local, secure };
}

test('the actual store completes an adaptive journey, resumes, and supports editing', async () => {
  const { useSetup, local } = setupStore();
  await useSetup.getState().hydrate();
  useSetup.getState().next();
  assert.equal(
    useSetup.getState().step,
    'intro',
    'age confirmation precedes collecting answers',
  );
  useSetup.getState().confirmAdult();
  useSetup.getState().next();
  useSetup.getState().answer('goals', ['habits', 'focus']);
  useSetup.getState().next();
  useSetup.getState().answer('distractions', ['shorts']);
  useSetup.getState().next();
  useSetup.getState().answer('screen', ['unknown']);
  useSetup.getState().next();
  assert.equal(useSetup.getState().step, 'reels');
  useSetup.getState().back();
  assert.equal(useSetup.getState().step, 'screen');
  useSetup.getState().answer('focus', ['45']);
  useSetup.getState().go('plan');
  await useSetup.getState().finish();
  assert.equal(useSetup.getState().completed, true);
  assert.equal(JSON.parse(local.data.get(SETUP_KEY)).completed, true);
  useSetup.getState().edit();
  assert.equal(useSetup.getState().completed, false);
  assert.equal(useSetup.getState().step, 'goals');
  assert.equal(focusMinutes(useSetup.getState().answers), 45);
});

test('store finish waits for durable storage and exposes failure for retry', async () => {
  const { useSetup, local } = setupStore();
  await useSetup.getState().hydrate();
  useSetup.getState().confirmAdult();
  local.setItem = async () => {
    throw new Error('disk full');
  };
  await useSetup.getState().finish(true);
  assert.equal(useSetup.getState().completed, false);
  assert.equal(useSetup.getState().saveError, true);
  assert.equal(useSetup.getState().saving, false);
});

test('late taps cannot overwrite the completed snapshot while it is saving', async () => {
  const { useSetup, local } = setupStore();
  await useSetup.getState().hydrate();
  useSetup.getState().confirmAdult();
  useSetup.getState().answer('focus', ['45']);
  const finishing = useSetup.getState().finish();
  useSetup.getState().go('goals');
  useSetup.getState().answer('focus', ['60']);
  useSetup.getState().confirmAdult();
  await finishing;
  assert.equal(useSetup.getState().completed, true);
  assert.equal(focusMinutes(useSetup.getState().answers), 45);
  assert.equal(JSON.parse(local.data.get(SETUP_KEY)).completed, true);
  assert.equal(JSON.parse(local.data.get(SETUP_KEY)).adultConfirmed, true);
});

test('a build without the secure native module can load setup safely', async () => {
  const { securePreferences } = load('secure', {
    expo: { requireOptionalNativeModule: () => null },
  });
  assert.equal(await securePreferences.available(), false);
  await assert.rejects(
    securePreferences.setItem('key', 'sensitive'),
    /unavailable/,
  );
});
