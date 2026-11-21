import React, { useEffect, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, Image, Platform, StyleSheet } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';

const DURATION_MS = 3000;
// Keep this square the same size as the native imageWidth in app.json.
const MARK_SIZE = 64;
const MIDNIGHT = '#090A12';
const WORD_SCALE = 0.24;
// The approved wordmark is 716 × 142 px. Its lowercase r starts at x = 90.
const WORD_WIDTH = 716 * WORD_SCALE;
const WORD_HEIGHT = 142 * WORD_SCALE;
const SUFFIX_WIDTH = (716 - 90) * WORD_SCALE;
const FEATHER = 14;
const STAGE_WIDTH = 384;
const STAGE_HEIGHT = 80;
const SETTLED = 0.75;
const unfoldEase = Easing.bezier(0.48, 0.04, 0.16, 1);
const fadeEase = Easing.inOut(Easing.sin);

// A single native-driven clock gives the letters time to settle before the exit.
function launchEasing(t: number) {
  const ms = t * DURATION_MS;
  if (ms < 1810) return SETTLED * unfoldEase(ms / 1810);
  if (ms < 2480) return SETTLED;
  return SETTLED + (1 - SETTLED) * fadeEase((ms - 2480) / (DURATION_MS - 2480));
}

export function LaunchSplash({ onFinish }: { onFinish: () => void }) {
  const [progress] = useState(() => new Animated.Value(0));

  useEffect(() => {
    let cancelled = false;
    let handoff: ReturnType<typeof setTimeout> | undefined;
    let safety: ReturnType<typeof setTimeout> | undefined;
    let animation: Animated.CompositeAnimation | undefined;

    // Release native OS splash immediately so animated splash continues smoothly
    void SplashScreen.hideAsync().catch(() => undefined);

    const startTimeline = () => {
      animation = Animated.timing(progress, {
        toValue: 1,
        duration: DURATION_MS,
        easing: launchEasing,
        useNativeDriver: true,
        isInteraction: false,
      });
      animation.start(({ finished }) => {
        if (finished && !cancelled) onFinish();
      });
    };

    if (Platform.OS === 'android') {
      handoff = setTimeout(startTimeline, 150);
    } else {
      startTimeline();
    }

    safety = setTimeout(() => {
      if (!cancelled) onFinish();
    }, DURATION_MS + 400);

    return () => {
      cancelled = true;
      if (handoff !== undefined) clearTimeout(handoff);
      if (safety !== undefined) clearTimeout(safety);
      animation?.stop();
    };
  }, [onFinish, progress]);

  const closed = progress.interpolate({
    inputRange: [0, SETTLED],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });
  const size = Animated.multiply(closed, closed);
  const markScale = size.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] });
  const markY = size.interpolate({ inputRange: [0, 1], outputRange: [-3.8, 0] });
  // Follow the B's ink edge and baseline as it contracts to the wordmark's cap height.
  const suffixX = size.interpolate({ inputRange: [0, 1], outputRange: [14.7, 32.2] });
  const suffixY = size.interpolate({ inputRange: [0, 1], outputRange: [0, 22.4] });
  const groupX = closed.interpolate({ inputRange: [0, 1], outputRange: [-78.2, 0] });
  const maskX = closed.interpolate({
    inputRange: [0, 1],
    outputRange: [SUFFIX_WIDTH + 1, -FEATHER],
  });
  const exitOpacity = progress.interpolate({
    inputRange: [SETTLED, 1],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View
      style={[styles.splash, { opacity: exitOpacity }]}
      pointerEvents="none"
      accessible
      accessibilityRole="image"
      accessibilityLabel="BrainSpace"
    >
      <Animated.View style={[styles.stage, { transform: [{ translateX: groupX }] }]}>
        <Animated.View
          style={[styles.suffixClip, { transform: [{ translateX: suffixX }, { translateY: suffixY }] }]}
        >
          <Image
            source={require('../../assets/splash-wordmark.png')}
            style={styles.word}
            resizeMode="stretch"
            fadeDuration={0}
          />
          <Animated.View style={[styles.matte, { transform: [{ translateX: maskX }] }]} />
        </Animated.View>
        <Animated.Image
          source={require('../../assets/splash-icon.png')}
          style={[styles.mark, { transform: [{ translateY: markY }, { scale: markScale }] }]}
          fadeDuration={0}
        />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  splash: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    backgroundColor: MIDNIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999999,
    elevation: 999999,
  },
  stage: {
    width: STAGE_WIDTH,
    height: STAGE_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mark: {
    width: MARK_SIZE,
    height: MARK_SIZE,
  },
  suffixClip: {
    position: 'absolute',
    left: STAGE_WIDTH / 2,
    top: (STAGE_HEIGHT - WORD_HEIGHT) / 2,
    width: SUFFIX_WIDTH,
    height: WORD_HEIGHT,
    overflow: 'hidden',
  },
  word: {
    position: 'absolute',
    right: 0,
    width: WORD_WIDTH,
    height: WORD_HEIGHT,
  },
  matte: {
    position: 'absolute',
    left: 0,
    top: -2,
    bottom: -2,
    width: SUFFIX_WIDTH + FEATHER + 4,
    backgroundColor: MIDNIGHT,
  },
});
