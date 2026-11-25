# Guided access and reel detection: internal pilot

Owner scope: the owner explicitly requested both the reference-style permission guide and reel detection on 25 November 2026. This authorizes local integration and internal testing. It does not establish Google Play approval or production accuracy. The existing workspace feasibility report remains applicable.

## Scope and platform

Android only: native UsageStats, optional floating counter, explicitly selected Instagram and YouTube Accessibility events, and device-specific setup help. iOS and old native builds show an honest unavailable state. No blocking, automatic permission changes, device administrator, VPN, screenshot capture, gestures, notifications, or boot receiver are added.

The last onboarding access step has an offline video illustration, numbered instructions, a separate explanation, and settings return checks. PiP is optional for non-Accessibility guides. Accessibility warnings are reviewed in Android without a floating guide. Xiaomi popup, battery and autostart settings are best-effort intent routes with app-info fallback; they are labelled user-confirmed, never Android-verified. Removing battery restrictions is optional troubleshooting after trying the default.

## Privacy and threat model

Consent is versioned and saved before opening Accessibility settings. Users explicitly choose each supported app. The disabled filter is BrainSpace itself, never an empty package list that could observe all apps. The service rejects other packages before walking nodes, excludes editable/password nodes, bounds scans, and reads only resource IDs, visibility, bounds and scroll positions. No text, captions, descriptions, messages, media, screenshots, raw nodes or event histories are collected, logged or transmitted. Daily per-app counts, consent and controls stay in private preferences, excluded from Android cloud backup and device transfer. Counts are retained for one local week. Pause, withdraw consent, change apps, and erase counts are available in Profile. Disabling the service remains available in Android settings.

## Detector and limitations

Rule `metadata-pager-v1` recognises a small allowlist of feed view IDs. It counts a recognised feed entry and distinct page-index or page-offset changes from the recognised pager, debounced by 450 ms. Reopening a feed or revisiting a page is another estimated view, not a unique-video identity or completed-watch measurement. Ordinary feed scrolls, unknown layouts, nested scrolling and recognised comment sheets do not count. Unknown IDs fail closed. Partial swipes near a page boundary, unrecognised sheets, ads and new app layouts can cause misses or misclassification. A service connection alone does not prove compatibility with the installed Instagram/YouTube version.

Known identifier research, independently implemented (no third-party code copied): [ReelBlock](https://github.com/SuzalShrestha/reelblock), [ScrollLess](https://github.com/ChandraChaan/scroll-less). These are implementation reports, not guarantees from Instagram or YouTube.

## Policy review and release gate

The service declares `isAccessibilityTool=false` and has prominent, separate in-app disclosure and affirmative consent. It never taps, blocks disabling, or changes security settings. The owner must complete the Accessibility declaration and obtain any required approval before a consumer Play release. See [Google Play policy](https://support.google.com/googleplay/android-developer/answer/10964491) and [Android service documentation](https://developer.android.com/guide/topics/ui/accessibility/views/service). Android grants and system restricted-settings warnings must always be handled by the user.

Keep this labelled experimental in internal/pilot builds. Production promotion requires physical Pixel, Samsung and Xiaomi tests, labelled real transitions and counterexamples, app/OS versions, precision/recall results (target 95%/85% from the master plan), background/reboot/revocation checks, and battery measurements. No numerical accuracy claim is justified by synthetic tests. Fall back to app-duration tracking when permission is declined, the service is disconnected, or feed identifiers are unsupported.

## Validation record

The current implementation has pure Kotlin counter tests for known feed entry, distinct/repeated page positions, event bursts, reverse navigation, unknown apps, ordinary/nested scrolls, comment sheets, partial drags and app switches. Build, emulator and visual QA results are recorded after execution. The debug and release Android builds succeed; all 7 Kotlin counter tests, 5 permission-state tests and 19 onboarding tests pass. Type checking and lint for changed files pass. Whole-repository lint still has the same 45 pre-existing errors and 2 warnings.

On an Android 16 emulator, the real bound Accessibility service counted synthetic distinct page changes and rejected duplicate, comment and ordinary-feed scrolls (9 saved views after the scripted fixture sequence; these are test data only). The initial test harness was corrected to cache coordinates: default `uiautomator dump` suppresses other Accessibility services and reconnecting them can create a fresh observed visit; repeated dumps must not be interleaved with count assertions. Fixture comments preserve their layout space so cached coordinates remain valid.

On the owner's Redmi K50i (22041216I, Android 14), the release APK updated successfully without clearing data, the Spotify permission UI rendered, and all three Xiaomi settings routes resolved. Static resource checks confirmed `clips_viewer_view_pager` in Instagram 456.1.0.56.78 and `reel_recycler`, `reel_watch_player`, `reel_player_page_container` in YouTube 21.46.522. This does not establish real-feed precision/recall. Physical social-app counting, battery/reboot behavior, and the complete Xiaomi grant sequence remain to be measured; OS permissions on the owner's device are left for the owner to confirm.

Additional emulator UI checks passed: pause is saved; counts remain unchanged with the paused service; withdrawing consent clears selected apps; count erasure remains available after withdrawal and removes saved aggregates; revocation shows an unavailable Home metric rather than zero. The original video guide plays in a real Android PiP window over Settings. Redmi release APK signature/16 KB alignment checks passed and the final update installed without clearing app data.
