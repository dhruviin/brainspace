import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { face, ink } from '../theme';
import { tick } from './Controls';
import { indian } from '../store/model';
const ROW = 45;
export function WheelPicker({
  value,
  max,
  onChange,
  label,
}: {
  value: number;
  max: number;
  onChange: (v: number) => void;
  label: string;
}) {
  const start = useSharedValue(value),
    last = useSharedValue(value),
    offset = useSharedValue(0);
  const change = (n: number) => {
    tick();
    onChange(n);
  };
  const pan = usePanGesture({
    onBegin: () => {
      'worklet';
      start.value = value;
      last.value = value;
      offset.value = 0;
    },
    onUpdate: (e) => {
      'worklet';
      const raw = Math.max(
        0,
        Math.min(max, start.value - (e.translationY / ROW) * 10),
      );
      const n = Math.round(raw / 10) * 10;
      offset.value = ((n - raw) / 10) * ROW;
      if (last.value !== n) {
        last.value = n;
        scheduleOnRN(change, n);
      }
    },
    onFinalize: () => {
      'worklet';
      offset.value = withTiming(0, { duration: 150 });
    },
  });
  const motion = useAnimatedStyle(() => ({
    transform: [{ translateY: offset.value }],
  }));
  return (
    <GestureDetector gesture={pan}>
      <View
        accessible
        accessibilityRole="adjustable"
        accessibilityLabel={label}
        accessibilityValue={{ min: 0, max, now: value }}
        accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
        onAccessibilityAction={(e) =>
          change(
            Math.min(
              max,
              Math.max(
                0,
                value + (e.nativeEvent.actionName === 'increment' ? 10 : -10),
              ),
            ),
          )
        }
        style={{
          height: ROW * 3,
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            position: 'absolute',
            height: ROW,
            left: '18%',
            right: '18%',
            top: ROW,
            borderRadius: 16,
            backgroundColor: ink.selected,
          }}
        />
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            { alignItems: 'center', justifyContent: 'center' },
            motion,
          ]}
        >
          {[-1, 0, 1].map((delta) => {
            const n = value + delta * 10;
            return (
              <Text
                key={delta}
                allowFontScaling={false}
                style={{
                  height: ROW,
                  lineHeight: ROW,
                  fontSize: delta ? 20 : 30,
                  fontFamily: face.bold,
                  color: delta ? ink.faint : ink.textPrimary,
                  opacity: delta ? 0.64 : 1,
                }}
              >
                {n >= 0 && n <= max ? indian(n) : ' '}
              </Text>
            );
          })}
        </Animated.View>
      </View>
    </GestureDetector>
  );
}
