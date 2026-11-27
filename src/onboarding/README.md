# BrainSpace first-run setup

The active flow lives in `setup/`. Both platform entry points use Expo Router, with the existing launch splash followed by the saved setup cursor or Home. Returning users who completed the previous story retain access to Home.

The journey is welcome → goals → distracting activities → overall phone-time baseline → optional Reels/Shorts estimate → triggers → a moment to protect → optional private habit interests → focus duration → live appearance preview → optional guided Android access → personal starting plan. Reels only appears for people who select short-form video; private habit interests only appear when requested. Make room for me starts setup directly, with no age-confirmation checkbox or account requirement. Questions require a selection before Continue; there is no Skip action. Private habit interests include a general preference.

`setup/content.ts` owns the questions and copy. `setup/model.ts` owns branching, selection rules, defaults and input recovery. `setup/store.ts` saves progress after each change and waits for a successful durable save before completing. `setup/persistence.ts` serializes writes and keeps sensitive categories and custom habit labels out of AsyncStorage: they use SecureStore when available. A build without private storage offers a general preference. No answers go to analytics or a server.

Appearance, selected focus duration and the personal plan carry into the app. Profile → Your starting plan reopens setup with existing answers. Device time zone is captured on completion. Android Usage Access checks the actual native permission again after returning from settings; it never infers permission from opening settings. The access step in `permissions/` includes original offline video guides, separate Accessibility disclosure and per-app opt-in, Android-verified grants, and explicitly user-confirmed Xiaomi settings. The experimental native detector estimates recognised Instagram/YouTube feed visits and page changes; it never promises complete coverage. Profile → Device access & reel estimates provides the same guides, pause/resume, consent withdrawal and count erasure. See `docs/REEL_DETECTION_PILOT.md` for privacy boundaries and validation limits. Home uses real or unavailable usage states, with no sample statistics.

The layout follows the app’s Spotify-inspired styling: shared Midnight/Arctic tokens, green actions and selection states, charcoal surfaces, centered bold headings, compact choice rows and tiles, and pill buttons. `setupPalette` references the app palettes directly, so onboarding and Home stay consistent.

Animations use native-driven fades, slides, selection feedback, a gentle companion float and brief eye blinks. Reduced motion disables travel and continuous animation. Every setup header centers the BrainSpace name without a logo. The welcome footer offers only Make room for me. Screens scroll at smaller sizes and larger font scales; actions remain in the safe-area footer.

The older particle-story components remain in `screens/`, `components/` and `store/` as design references. They are not part of the active first-run route.

Validation:

```sh
npm run test:onboarding
node --test src/onboarding/permissions/permissions.test.cjs
npx tsc --noEmit
npx eslint src/onboarding/setup src/app src/bootstrap.ts App.tsx src/screens/HomeScreen.tsx src/screens/FocusScreen.tsx src/screens/ProfileScreen.tsx src/services/UsageStatsService.ts
npm run lint
```

For Android device preview, rebuild the debug app with `npm run android` when the installed APK predates the current native dependencies. Start Metro on a free port and point the app’s development server setting to that host and port. An emulator uses `10.0.2.2` to reach the host; a connected physical device can use `adb reverse`. Use a fresh emulator profile for first-launch testing; do not clear a user's existing app data to replay onboarding. Existing users can review it from Profile.
