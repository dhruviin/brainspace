import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { ThemeColors, Fonts } from '../theme/tokens';

interface MomentumOrbProps {
  score: number;
  theme: ThemeColors;
}

export const MomentumOrb: React.FC<MomentumOrbProps> = ({ score, theme }) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.04,
          duration: 2400,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2400,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  // Score status label
  const getLabel = (s: number) => {
    if (s >= 80) return 'Optimal Flow';
    if (s >= 60) return 'Steady Focus';
    if (s >= 40) return 'Gaining Ground';
    return 'Building Pace';
  };

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.outerRing,
          {
            borderColor: theme.accent,
            backgroundColor: theme.surface2,
            transform: [{ scale: pulseAnim }],
            shadowColor: theme.accent,
          },
        ]}
      >
        <View style={[styles.innerCore, { backgroundColor: theme.bg }]}>
          <Text style={[styles.scoreNumber, { color: theme.textPrimary }]}>{score}</Text>
          <Text style={[styles.scoreUnit, { color: theme.accent }]}>MOMENTUM</Text>
        </View>
      </Animated.View>
      <Text style={[styles.statusText, { color: theme.textSecondary }]}>{getLabel(score)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 14,
  },
  outerRing: {
    width: 136,
    height: 136,
    borderRadius: 68,
    borderWidth: 3.5,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
  },
  innerCore: {
    width: 112,
    height: 112,
    borderRadius: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreNumber: {
    fontFamily: Fonts.extraBold,
    fontSize: 40,
    letterSpacing: -1,
  },
  scoreUnit: {
    fontFamily: Fonts.bold,
    fontSize: 9.5,
    letterSpacing: 2,
    marginTop: 1,
  },
  statusText: {
    fontFamily: Fonts.medium,
    fontSize: 13,
    marginTop: 10,
    letterSpacing: 0.2,
  },
});
