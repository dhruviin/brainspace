This fixture generates only view IDs and accessibility events, with an explicit QA label and no media or network access. `python3 scripts/reel-fixture/build.py` builds `/tmp/brainspace-reel-fixture/fixture.apk` using local Android SDK tools. It does not install or enable any service.

Install **only on a disposable emulator** after checking `adb -s emulator-5554 shell getprop ro.kernel.qemu` returns `1` and no real Instagram is installed. Its package intentionally matches the detector's Instagram filter. Never install on a personal device or distribute as an app. Uninstall after testing.

Use the BrainSpace disclosure to opt into Instagram, enable the service on the emulator, then open this fixture. Feed entry and Next reel should increment; Repeat event and comment scrolling should not. Toggle ordinary feed and confirm scrolling no longer increments. Pause, revoke consent and disable system access in turn; each should stop counting. These checks establish service integration, not compatibility or accuracy with Instagram or YouTube.

Do not run `uiautomator dump` between count assertions: its default UiAutomation flags suppress other Accessibility services. Cache button positions once, wait for the BrainSpace service to reconnect, then use plain input taps. Use `FLAG_DONT_SUPPRESS_ACCESSIBILITY_SERVICES` if writing an instrumented driver.
