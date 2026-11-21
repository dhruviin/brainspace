import { useEffect, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, Image, Platform, StyleSheet } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';

const DURATION_MS = 3000;
// Android removes its system starting window asynchronously after hide().
const ANDROID_HANDOFF_MS = 650;
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
  const [hasLayout, setHasLayout] = useState(false);
  const [hasMark, setHasMark] = useState(false);
  const [hasWordmark, setHasWordmark] = useState(false);
  const [progress] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (!hasLayout || !hasMark || !hasWordmark) return;

    let cancelled = false;
    let frame: number | undefined;
    let handoff: ReturnType<typeof setTimeout> | undefined;
    let hold: ReturnType<typeof setTimeout> | undefined;
    let animation: Animated.CompositeAnimation | undefined;

    void AccessibilityInfo.isReduceMotionEnabled().catch(() => true).then((reduced) => {
      if (cancelled) return;
      // Native launch art stays up until the matching first frame is ready.
      SplashScreen.setOptions({ duration: 0, fade: false });
      SplashScreen.hide();

      const startTimeline = () => {
        if (reduced) {
          progress.setValue(SETTLED);
          hold = setTimeout(onFinish, DURATION_MS);
          return;
        }
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

      frame = requestAnimationFrame(() => {
        if (Platform.OS === 'android') {
          handoff = setTimeout(startTimeline, ANDROID_HANDOFF_MS);
        } else {
          startTimeline();
        }
      });
    });

    return () => {
      cancelled = true;
      if (frame !== undefined) cancelAnimationFrame(frame);
      if (handoff !== undefined) clearTimeout(handoff);
      if (hold !== undefined) clearTimeout(hold);
      animation?.stop();
    };
  }, [hasLayout, hasMark, hasWordmark, onFinish, progress]);

  const closed = progress.interpolate({
    inputRange: [0, SETTLED], outputRange: [1, 0], extrapolate: 'clamp',
  });
  const size = Animated.multiply(closed, closed);
  const markScale = size.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] });
  const markY = size.interpolate({ inputRange: [0, 1], outputRange: [-3.8, 0] });
  // Follow the B's ink edge and baseline as it contracts to the wordmark's cap height.
  const suffixX = size.interpolate({ inputRange: [0, 1], outputRange: [14.7, 32.2] });
  const suffixY = size.interpolate({ inputRange: [0, 1], outputRange: [0, 22.4] });
  const groupX = closed.interpolate({ inputRange: [0, 1], outputRange: [-78.2, 0] });
  const maskX = closed.interpolate({ inputRange: [0, 1], outputRange: [SUFFIX_WIDTH + 1, -FEATHER] });
  const exitOpacity = progress.interpolate({
    inputRange: [SETTLED, 1], outputRange: [1, 0], extrapolate: 'clamp',
  });

  return (
    <Animated.View
      style={[styles.splash, { opacity: exitOpacity }]}
      onLayout={() => setHasLayout(true)}
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
            onLoadEnd={() => setHasWordmark(true)}
          />
          <Animated.View style={[styles.matte, { transform: [{ translateX: maskX }] }]} />
        </Animated.View>
        <Animated.Image
          source={require('../../assets/splash-icon.png')}
          style={[styles.mark, { transform: [{ translateY: markY }, { scale: markScale }] }]}
          fadeDuration={0}
          onLoadEnd={() => setHasMark(true)}
        />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  splash: {
    ...StyleSheet.absoluteFill,
    backgroundColor: MIDNIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stage: {
    width: STAGE_WIDTH,
    height: STAGE_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mark: { width: MARK_SIZE, height: MARK_SIZE },
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
    top: -1,
    bottom: -1,
    width: SUFFIX_WIDTH + FEATHER + 2,
    backgroundImage: `linear-gradient(90deg, rgba(9, 10, 18, 0) 0%, ${MIDNIGHT} 8%, ${MIDNIGHT} 100%)`,
  },
});
