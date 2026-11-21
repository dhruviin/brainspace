import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Image, StyleSheet, View } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';

const DURATION_MS = 2100;
const MIDNIGHT = '#090A12';

// The wordmark is 716 × 142.
// 'B' (with natural kerning gap) is 90 × 142.
// 'rainSpace' is 626 × 142.
const SCALE = 0.28;
const H_BASE = 142 * SCALE; // ~39.8 px
const W_B = 90 * SCALE;     // ~25.2 px
const W_SUFFIX = 626 * SCALE; // ~175.3 px

// Initial scale for 'B' to match the 64px native OS splash icon (glyph is ~104px tall)
const INITIAL_B_SCALE = 2.0;

export function LaunchSplash({ onFinish }: { onFinish: () => void }) {
  // progress goes 0 -> 1
  // 0.0 - 0.65 (0 - 1365ms): Unfold animation: B scales down, moves left, rainSpace emerges from right edge
  // 0.65 - 0.85 (1365 - 1785ms): Hold settled state (BrainSpace fully formed)
  // 0.85 - 1.0 (1785 - 2100ms): Smooth fade out into main app
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Release native OS splash immediately so this animated component takes over seamlessly
    void SplashScreen.hideAsync().catch(() => undefined);

    const safetyTimer = setTimeout(() => {
      onFinish();
    }, DURATION_MS + 300);

    const animation = Animated.timing(progress, {
      toValue: 1,
      duration: DURATION_MS,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      useNativeDriver: false, // width animation requires false, opacity/transform can also run smoothly
    });

    animation.start(({ finished }) => {
      if (finished) {
        clearTimeout(safetyTimer);
        onFinish();
      }
    });

    return () => {
      clearTimeout(safetyTimer);
      animation.stop();
    };
  }, [onFinish, progress]);

  // Scale of B: starts at INITIAL_B_SCALE (big logo icon) and settles down to 1.0 (letter size)
  const bScale = progress.interpolate({
    inputRange: [0, 0.65, 1],
    outputRange: [INITIAL_B_SCALE, 1.0, 1.0],
    extrapolate: 'clamp',
  });

  // Width of rainSpace: expands from 0 to full width as B settles
  const suffixWidth = progress.interpolate({
    inputRange: [0, 0.15, 0.65, 1],
    outputRange: [0, 10, W_SUFFIX, W_SUFFIX],
    extrapolate: 'clamp',
  });

  // Opacity of rainSpace
  const suffixOpacity = progress.interpolate({
    inputRange: [0, 0.15, 0.5, 1],
    outputRange: [0, 0.2, 1, 1],
    extrapolate: 'clamp',
  });

  // Entire splash fade out at the end
  const screenOpacity = progress.interpolate({
    inputRange: [0, 0.82, 1],
    outputRange: [1, 1, 0],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View
      style={[styles.splash, { opacity: screenOpacity }]}
      pointerEvents="none"
    >
      <View style={styles.centerStage}>
        {/* Unified row: Flexbox naturally shifts B left as suffix expands right, keeping word centered */}
        <View style={styles.wordmarkRow}>
          {/* Logo B (The ONLY B) */}
          <Animated.View
            style={[
              styles.bBox,
              {
                transform: [{ scale: bScale }],
              },
            ]}
          >
            <Image
              source={require('../../assets/splash-b.png')}
              style={styles.bImage}
              resizeMode="stretch"
            />
          </Animated.View>

          {/* Suffix: ONLY 'rainSpace' emerges from right edge of B on same baseline */}
          <Animated.View
            style={[
              styles.suffixClip,
              {
                width: suffixWidth,
                opacity: suffixOpacity,
              },
            ]}
          >
            <Image
              source={require('../../assets/splash-rainspace.png')}
              style={styles.suffixImage}
              resizeMode="stretch"
            />
          </Animated.View>
        </View>
      </View>
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
  centerStage: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 120,
    width: '100%',
  },
  wordmarkRow: {
    flexDirection: 'row',
    alignItems: 'flex-end', // Aligns both B and rainSpace on the exact baseline
    justifyContent: 'center',
    height: H_BASE,
  },
  bBox: {
    width: W_B,
    height: H_BASE,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bImage: {
    width: W_B,
    height: H_BASE,
  },
  suffixClip: {
    height: H_BASE,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  suffixImage: {
    width: W_SUFFIX,
    height: H_BASE,
  },
});
