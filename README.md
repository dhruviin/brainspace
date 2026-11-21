# BrainSpace — Mobile Client (React Native & Expo)

<div align="center">
  <h3>Minimalist, Privacy-First Digital Wellness, Focus & Recovery App</h3>
  <p>Reclaim attention, quiet compulsive feeds, and build deep focus without shame.</p>
</div>

---

## 🌟 Key Features

- **Daily Compass Dashboard:** Real-time attention distribution (Productive vs. Neutral vs. Distracting), screen time baseline comparisons, and the animated **Momentum Orb**.
- **Native Android UsageStats Integration:** Direct integration with Android's `UsageStatsManager` for real on-device foreground duration queries.
- **Focus Engine (Pomodoro):** Deterministic monotonic countdown and stopwatch timers with 15m, 25m, 45m, and 60m presets.
- **Urge SOS Assistant:** 1-tap offline modal with 4-second box-breathing rhythm guide and healthy replacement actions (Walk, Hydrate, Stretch, Reach out).
- **Private Habit Recovery Ledger:** Local-first habit tracking (up to 2 goals in Free tier) with non-punitive daily check-ins. Historical progress is never erased on setbacks.
- **Midnight Dark & Arctic Light Themes:** Built on semantic tokens with pure OLED `#000000` dark mode and high-contrast `#FFFFFF` light mode.

---

## 🏗️ Architecture

```text
brainspace/
├── android/                         # Prebuilt native Android project with Gradle
│   └── app/src/main/java/com/brainspace/app/
│       ├── MainActivity.kt
│       ├── MainApplication.kt
│       └── usagestats/              # Native Kotlin bridge for UsageStatsManager
├── src/
│   ├── components/                  # MomentumOrb, UrgeModal, LaunchSplash
│   ├── screens/                     # HomeScreen, InsightsScreen, FocusScreen, RecoverScreen, ProfileScreen
│   ├── services/                    # UsageStatsService (Native module bridge)
│   ├── theme/                       # Design tokens (MidnightDark & ArcticLight)
│   └── types/                       # TypeScript data contracts
├── app.json                         # Expo configuration (com.brainspace.app)
└── App.tsx                          # Root container & 5-tab navigation
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (tested on Node 24)
- npm or yarn
- Android SDK & Java 17+ (for native APK builds)

### Installation
```bash
# Install dependencies
npm install

# Start Expo development server
npm run start

# Launch on Android device / emulator
npm run android
```

### Building the Android APK
```bash
cd android
./gradlew assembleDebug

# Output APK:
# android/app/build/outputs/apk/debug/app-debug.apk
```

---

## 🔒 Privacy & Local-First Philosophy
- **100% On-Device:** Usage statistics and habit records remain strictly on your device.
- **Zero Cloud Telemetry:** No raw screen text, accessibility hierarchies, or private journals are uploaded without explicit user consent.

---

## 📄 License
UNLICENSED — All rights reserved.
