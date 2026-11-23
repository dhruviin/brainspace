import React, { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { copy } from '../strings';
import { face, ink, timing } from '../theme';
import { useMotion } from '../hooks/useMotion';

const ribbon = '#CAD5CF',
  edge = '#91A49A';
export function GiftBox({
  index,
  slot,
  amount,
  phase,
  claimed,
  onPick,
  width,
}: {
  index: number;
  slot: number;
  amount: number;
  phase: number;
  claimed: number | null;
  onPick: (v: number) => void;
  width: number;
}) {
  const motion = useMotion(),
    w = Math.min(94, width * 0.28),
    h = w * 1.05;
  const open = useSharedValue(0),
    bob = useSharedValue(0),
    slide = useSharedValue(0),
    arrival = useSharedValue(0);
  const picked = claimed === amount,
    available = phase >= 8 && claimed === null;
  useEffect(() => {
    arrival.value = motion ? withSpring(1, { mass: 0.8, damping: 13 }) : 1;
  }, [arrival, motion]);
  useEffect(() => {
    bob.value = 0;
    if (motion)
      bob.value = withRepeat(
        withTiming(1, {
          duration: 1300 + index * 140,
          easing: Easing.inOut(Easing.sin),
        }),
        -1,
        true,
      );
    return () => cancelAnimation(bob);
  }, [bob, index, motion]);
  useEffect(() => {
    open.value = withTiming(
      picked || (phase >= 3 + index && phase < 6) ? 1 : 0,
      { duration: motion ? 350 : 100 },
    );
  }, [open, phase, index, picked, motion]);
  useEffect(() => {
    slide.value = withTiming(phase >= 7 ? 1 : 0, {
      duration: motion ? timing.shuffle : 100,
      easing: Easing.inOut(Easing.cubic),
    });
  }, [slide, phase, motion]);
  const gap = width * 0.25;
  const xs = [0, -gap, gap],
    ys = [0, h * 0.96, h * 0.96];
  const place = useAnimatedStyle(() => {
    const t = slide.value;
    return {
      opacity: claimed !== null && !picked ? 0.35 : arrival.value,
      transform: [
        { translateX: xs[index] + (xs[slot] - xs[index]) * t },
        {
          translateY:
            ys[index] +
            (ys[slot] - ys[index]) * t -
            5 * bob.value -
            Math.sin(t * Math.PI) * (index === 1 ? 24 : 9),
        },
        { scale: (0.76 + 0.24 * arrival.value) * (picked ? 1.06 : 1) },
      ],
    };
  });
  const lid = useAnimatedStyle(() => ({
    transform: [
      { translateY: -w * 0.31 * open.value },
      { translateX: -w * 0.28 * open.value },
      { rotate: -28 * open.value + 'deg' },
    ],
  }));
  const card = useAnimatedStyle(() => ({
    opacity: open.value,
    transform: [{ translateY: -w * 0.28 * open.value }],
  }));
  // TODO(art): replace the three-part box, ribbon and lid with approved image layers.
  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          width: w,
          height: h,
          left: (width - w) / 2,
          top: 24,
        },
        place,
      ]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={copy.giftLabel(slot + 1)}
        accessibilityState={{ disabled: !available, selected: picked }}
        disabled={!available}
        onPress={() => onPick(slot)}
        style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end' }}
      >
        <Animated.View
          style={[
            {
              position: 'absolute',
              bottom: h * 0.36,
              width: w * 0.73,
              height: h * 0.56,
              backgroundColor: '#E9F3EC',
              borderRadius: 9,
              alignItems: 'center',
              justifyContent: 'center',
            },
            card,
          ]}
        >
          <Text
            allowFontScaling={false}
            style={{
              fontFamily: face.extraBold,
              color: '#183923',
              fontSize: w * 0.22,
            }}
          >
            {amount}%
          </Text>
        </Animated.View>
        <View
          style={{
            width: w * 0.8,
            height: h * 0.47,
            borderBottomLeftRadius: 7,
            borderBottomRightRadius: 7,
            backgroundColor: '#2B7049',
            borderWidth: 1,
            borderColor: '#438660',
            alignItems: 'center',
          }}
        >
          <View
            style={{
              width: w * 0.16,
              height: '100%',
              backgroundColor: ribbon,
              borderRightColor: edge,
              borderRightWidth: 2,
            }}
          />
        </View>
        <Animated.View
          style={[
            {
              position: 'absolute',
              bottom: h * 0.41,
              width: w * 0.9,
              height: h * 0.19,
              borderRadius: 4,
              backgroundColor: '#38965D',
              alignItems: 'center',
              borderTopWidth: 1,
              borderTopColor: '#6FC98C',
            },
            lid,
          ]}
        >
          {[-1, 1].map((side) => (
            <View
              key={side}
              style={{
                position: 'absolute',
                width: w * 0.29,
                height: w * 0.17,
                borderWidth: 3,
                borderColor: ribbon,
                borderRadius: w * 0.12,
                top: -w * 0.16,
                left: side < 0 ? w * 0.19 : w * 0.43,
                transform: [{ rotate: side * 27 + 'deg' }],
              }}
            />
          ))}
          <View
            style={{ width: w * 0.17, height: '100%', backgroundColor: ribbon }}
          />
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}
