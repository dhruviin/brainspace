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
          toValue: 1.06,
          duration: 2200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2200,
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
        <View style={[styles.innerCore, { backgroundColor: theme.surface }]}>
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
    marginVertical: 12,
  },
  outerRing: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  innerCore: {
    width: 104,
    height: 104,
    borderRadius: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreNumber: {
    fontFamily: Fonts.extraBold,
    fontSize: 34,
    letterSpacing: -0.5,
  },
  scoreUnit: {
    fontFamily: Fonts.bold,
    fontSize: 9,
    letterSpacing: 1.5,
    marginTop: 2,
  },
  statusText: {
    fontFamily: Fonts.medium,
    fontSize: 13,
    marginTop: 8,
  },
});
