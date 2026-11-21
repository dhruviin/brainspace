<div align="center">

# 🧠 BrainSpace

### *Understand your habits. Regain your time. Build your best self.*

A private, beautifully designed cross-platform daily companion that helps people reclaim attention, reduce mindless scrolling, build deep focus, and make progress on unwanted habits without guilt or shame.

[![React Native](https://img.shields.io/badge/React_Native-0.88-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactnative.dev)
[![Expo](https://img.shields.io/badge/Expo_SDK-58-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Android](https://img.shields.io/badge/Android-SDK_24+-3DDC84?style=for-the-badge&logo=android&logoColor=white)](https://developer.android.com)
[![iOS](https://img.shields.io/badge/iOS-15+-000000?style=for-the-badge&logo=apple&logoColor=white)](https://developer.apple.com)
[![License](https://img.shields.io/badge/License-UNLICENSED-grey?style=for-the-badge)](LICENSE)

[Features](#-key-features) • [Architecture](#-architecture) • [Getting Started](#-getting-started) • [Android APK](#-building-the-android-apk) • [iOS Setup](#-running-on-ios) • [Privacy Guarantees](#-privacy--security-first)

</div>

---

## 🌟 Key Features

### 1. 🧭 Daily Compass Dashboard
- **Attention Distribution Bar:** Visual breakdown of your day into **Productive**, **Neutral**, and **Distracting** categories.
- **Living Momentum Orb:** An interactive, animated 0–100 score engine calculated transparently:
  $$\text{Score} = 40\% \times \text{Attention} + 35\% \times \text{Focus} + 25\% \times \text{Recovery}$$
- **Screen Time vs. Baseline:** Compares today's usage against your self-defined target without misleading statistics.

### 2. ⚡ Native Android UsageStats Integration
- Directly queries Android's `UsageStatsManager` through a custom native Kotlin bridge (`UsageStatsModule.kt`).
- Resolves human-readable app titles and packages from `PackageManager`.
- Classifies apps automatically with full support for user overrides.
- 1-tap deep link into Android Settings (`Settings.ACTION_USAGE_ACCESS_SETTINGS`).

### 3. ⏱️ Focus Engine (Pomodoro & Interval Timer)
- Deterministic, monotonic clock mechanism resistant to background throttling and process reboots.
- 15-min, 25-min, 45-min, and 60-min presets.
- Real-time countdown (MM:SS), pause, resume, and session ledger history.

### 4. 🛡️ 1-Tap Urge SOS Assistant
- Always available offline in one tap.
- **4-Second Box Breathing Pacer:** Guided Inhale $\to$ Hold $\to$ Exhale rhythm to down-regulate impulse spikes.
- **Friction-Free Replacements:** Instant alternative actions (Drink water, 2-min walk, stretch, reach out).

### 5. 🌿 Private Habit Recovery Ledger
- Supports up to 2 private habit goals in the Free tier.
- Non-punitive daily check-ins: *Held Strong*, *Tough Moment*, or *Skip*.
- **Ethical progress tracking:** Setbacks reset the active streak, but **never erase historical total clean days**.

### 6. 🎨 Midnight Dark & Arctic Light Design System
- **Midnight Dark:** Pure `#000000` OLED black background, `#1D9BF0` electric accent, and `#101216` card surfaces.
- **Arctic Light:** Crisp `#FFFFFF` and `#F7F8FA` surfaces with high-contrast accessibility.
- Strict 48dp minimum touch targets and tabular monospaced numbers.

---

## 🏗️ Architecture

```
                    ┌──────────────────────────────────────────┐
                    │      React Native UI Layer (Expo)        │
                    │  HomeScreen • Insights • Focus • Recover │
                    └─────────────────────┬────────────────────┘
                                          │
                        ┌─────────────────┴─────────────────┐
                        ▼                                   ▼
          ┌───────────────────────────┐       ┌───────────────────────────┐
          │   Android Native Bridge   │       │     iOS Native Workspace  │
          │    UsageStatsModule.kt    │       │     BrainSpace.xcworkspace│
          │    UsageStatsPackage.kt   │       │     CocoaPods Integration │
          └─────────────┬─────────────┘       └─────────────┬─────────────┘
                        │                                   │
                        ▼                                   ▼
             Android Usage Access API               iOS Foundation / UIKit
```

### Directory Tree

```text
brainspace/
├── android/                         # Native Android Gradle project
│   ├── app/src/main/
│   │   ├── AndroidManifest.xml      # PACKAGE_USAGE_STATS permission
│   │   └── java/com/brainspace/app/
│   │       ├── MainActivity.kt
│   │       ├── MainApplication.kt   # Native package registration
│   │       └── usagestats/          # Custom Kotlin UsageStats bridge
│   └── build.gradle
├── ios/                             # Native iOS Xcode workspace
│   ├── BrainSpace.xcworkspace       # CocoaPods workspace
│   ├── BrainSpace.xcodeproj
│   └── Podfile
├── src/
│   ├── components/
│   │   ├── MomentumOrb.tsx          # Animated Living Momentum Visual
│   │   └── UrgeModal.tsx            # Offline Box-Breathing & Replacements
│   ├── screens/
│   │   ├── HomeScreen.tsx           # Daily Compass & Attention Distribution
│   │   ├── InsightsScreen.tsx       # Live App Breakdown & Category Tags
│   │   ├── FocusScreen.tsx          # Pomodoro Countdown Engine
│   │   ├── RecoverScreen.tsx        # Habit Streak Ledger
│   │   └── ProfileScreen.tsx        # System Health & Theme Toggles
│   ├── services/
│   │   └── UsageStatsService.ts     # Type-safe native module interface
│   ├── theme/
│   │   └── tokens.ts                # Midnight Dark & Arctic Light semantic tokens
│   └── types/
│       └── index.ts                 # Canonical data contracts
├── app.json                         # Expo configuration (com.brainspace.app)
└── App.tsx                          # Root container with 5-tab navigation
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org) (v18 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Java 17](https://www.oracle.com/java/technologies/javase/jdk17-archive-downloads.html) & [Android SDK](https://developer.android.com/studio) (for Android builds)
- [Xcode](https://developer.apple.com/xcode/) & [CocoaPods](https://cocoapods.org/) (for iOS builds on macOS)

### Installation

```bash
# Clone the repository
git clone https://github.com/dhruviin/brainspace.git
cd brainspace

# Install dependencies
npm install
```

---

## 📱 Running on Devices

### Development Mode

```bash
# Start Expo bundler
npm run start

# Launch directly on Android emulator / connected USB device
npm run android

# Launch directly on iOS Simulator
npm run ios
```

### Testing on a Physical Phone via Expo Go
1. Install **Expo Go** from Google Play or Apple App Store.
2. Run `npx expo start` in your terminal.
3. Scan the QR code with your phone camera or Expo Go.

---

## 📦 Building the Android APK

You can build a standalone, installable `.apk` locally using Gradle:

```bash
cd android
./gradlew assembleDebug
```

The compiled APK will be generated at:
```text
android/app/build/outputs/apk/debug/app-debug.apk
```

Install directly to an Android phone:
```bash
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

---

## 🔒 Privacy & Security First

1. **Local-First Storage:** All screen time statistics, focus logs, and habit records remain strictly on your device.
2. **Zero Unconsented Telemetry:** We never upload raw screen content, accessibility hierarchies, or personal journals.
3. **No Coercive Shaming:** Relapses or tough days do not erase historical progress.
4. **Data Ownership:** Export all data in machine-readable JSON format or delete everything with 1 tap from Settings.

---

## 🔗 Related Repositories

- **Backend API:** [BrainSpace_BE](https://github.com/dhruviin/BrainSpace_BE) — Scalable Node.js + TypeScript Express microservices for opt-in sync and entitlements.

---

## 📄 License

UNLICENSED — All rights reserved. Built with ❤️ by **[Dhruvin](https://github.com/dhruviin)**.
