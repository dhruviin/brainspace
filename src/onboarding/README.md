# BrainSpace Android onboarding

From the mobile package, install the locked dependencies with `npm ci`, then run `npx expo run:android --device`. This flow needs a native build for Skia, notifications, Worklets, and the existing Android usage module. For a subsequent JS edit, use `npx expo start` with the development build installed. SDK 58 pairs React Native 0.88 with Reanimated 4.7 and Worklets 0.13.

### Working on the story

Long-press the BrainSpace wordmark in a development build for the motion playground and step picker. A release built with `EXPO_PUBLIC_STORY_QA=1` also exposes the playground for profiling. Keep that variable unset for distribution. Use a fresh Android emulator profile to replay first launch. The production route resumes saved progress and opens Home after completion.

- **Timing and type** — Edit `theme.ts` for motion durations. The onboarding palette and Poppins weights inherit `../theme/tokens.ts`. The UI respects the Android reduced-motion setting.
- **Artwork** — `shapes/index.ts` builds and caches targets in a 256-unit artboard. `samplePath` accepts a filled SVG path. `sampleMask` accepts a decoded Skia image with transparent padding. The field draws round stamps in a single atlas. TODO(art): supply final head, person, phone and trophy masks, expression PNGs for the chrome companion, and gift-box artwork if desired. TODO(type): a replacement font family needs Medium, Bold, and ExtraBold files registered in the Android layout.
- **New steps** — Add a stable ID to `store/model.ts`, English copy to `strings.ts`, and the screen in `screens/`. Set its beat count for in-screen reveals. Use the store’s navigation methods so Android Back and cold-start resume agree.
- **Estimates** — The daily selection drives the week, 30-day month, and year. `SECONDS_PER_REEL` and the reported screen-time range determine the time projection. The default target is 70%, rounded to tens. The lower target changes the daily savings and highlighted calendar days.
- **Persistence** — AsyncStorage holds the cursor, answers, limit, and gift. Android SecureStore holds optional symptom selections. The local event buffer records the step ID and time for `onboarding_step_view`, `onboarding_answer`, and `onboarding_complete`. It can be connected to a consented analytics service later. The offer screen is a preview and does not process payments.

Run `npx tsc --noEmit`, `npx eslint src/onboarding src/app`, and `node --test src/onboarding/store/model.test.cjs` (Node 24). To build an APK locally, run `./gradlew :app:assembleRelease` inside `android/`. The current Android project uses its development signing key for local release builds.
