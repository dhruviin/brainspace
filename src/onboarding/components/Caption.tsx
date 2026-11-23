import React, { useEffect, useMemo } from 'react';
import {
  Text,
  TextInput,
  View,
  StyleSheet,
  type TextStyle,
} from 'react-native';
import Animated, {
  Easing,
  FadeInUp,
  useAnimatedProps,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { useMotion } from '../hooks/useMotion';
import { face, ink, timing } from '../theme';
import { indian } from '../store/model';

const Input = Animated.createAnimatedComponent(TextInput);
const colors = {
  accent: ink.accent,
  success: ink.success,
  danger: ink.dangerText,
};
function tokens(text: string) {
  let offset = 0;
  return text.split(/(\{[^}]+\})/).flatMap((piece) => {
    const marked = piece.startsWith('{');
    const [value, tone = 'accent'] = marked
      ? piece.slice(1, -1).split('|')
      : [piece, ''];
    return value
      .split(/(\s+)/)
      .filter(Boolean)
      .map((word) => {
        const start = offset;
        offset += word.length;
        return {
          word,
          start,
          color: colors[tone as keyof typeof colors] ?? ink.textPrimary,
        };
      });
  });
}
export const plain = (text: string) =>
  text.replace(/\{([^}|]+)(?:\|[^}]+)?\}/g, '$1');
function Word({
  word,
  start,
  clock,
  style,
}: {
  word: string;
  start: number;
  clock: SharedValue<number>;
  style: TextStyle;
}) {
  const props = useAnimatedProps(() => ({
    text: word.slice(0, Math.max(0, Math.floor(clock.value) - start)),
    defaultValue: '',
  }));
  return (
    <View pointerEvents="none">
      <Text style={[style, { opacity: 0 }]}>{word}</Text>
      <Input
        editable={false}
        underlineColorAndroid="transparent"
        importantForAccessibility="no"
        animatedProps={props}
        style={[StyleSheet.absoluteFill, style, { padding: 0, margin: 0 }]}
      />
    </View>
  );
}
export function TypewriterCaption({
  text,
  previous,
  small = false,
  align = 'center',
}: {
  text: string;
  previous?: string;
  small?: boolean;
  align?: 'left' | 'center';
}) {
  const motion = useMotion(),
    clock = useSharedValue(0);
  const words = useMemo(() => {
    const all = tokens(text);
    return all
      .map((w, i) => ({ ...w, space: !!all[i + 1] && !all[i + 1].word.trim() }))
      .filter((w) => w.word.trim());
  }, [text]);
  const length = plain(text).length;
  useEffect(() => {
    clock.value = motion ? 0 : length;
    if (motion)
      clock.value = withTiming(length, {
        duration: Math.min(1400, length * timing.letter),
        easing: Easing.linear,
      });
  }, [clock, text, length, motion]);
  const style: TextStyle = {
    fontFamily: small ? face.semiBold : face.bold,
    fontSize: small ? 18 : 25,
    lineHeight: small ? 27 : 35,
    includeFontPadding: false,
  };
  return (
    <View
      accessible
      accessibilityLabel={plain(text)}
      style={{ alignSelf: 'stretch' }}
    >
      {previous && (
        <Animated.Text
          key={previous}
          entering={FadeInUp.duration(motion ? 300 : 0)}
          style={{
            color: ink.textPrimary,
            opacity: 0.24,
            textAlign: align,
            fontFamily: face.medium,
            fontSize: 15,
            marginBottom: 12,
          }}
        >
          {plain(previous)}
        </Animated.Text>
      )}
      <View
        importantForAccessibility="no-hide-descendants"
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          justifyContent: align === 'center' ? 'center' : 'flex-start',
        }}
      >
        {words.map((w, i) => (
          <View key={text + i} style={{ marginRight: w.space ? 4 : 0 }}>
            {motion ? (
              <Word {...w} clock={clock} style={{ ...style, color: w.color }} />
            ) : (
              <Text style={[style, { color: w.color }]}>{w.word}</Text>
            )}
          </View>
        ))}
      </View>
    </View>
  );
}
export function CountUpNumber({
  value,
  unit,
  color = ink.textPrimary,
  suffix = '',
}: {
  value: number;
  unit: string;
  color?: string;
  suffix?: string;
}) {
  const clock = useSharedValue(0),
    motion = useMotion();
  useEffect(() => {
    clock.value = withTiming(value, {
      duration: motion ? 850 : 0,
      easing: Easing.out(Easing.cubic),
    });
  }, [clock, motion, value]);
  const props = useAnimatedProps(() => ({
    text: indian(clock.value) + suffix,
    defaultValue: '',
  }));
  return (
    <View
      accessible
      accessibilityLabel={indian(value) + suffix + ' ' + unit}
      pointerEvents="none"
      style={{ alignItems: 'center' }}
    >
      <Input
        accessible={false}
        editable={false}
        underlineColorAndroid="transparent"
        animatedProps={props}
        style={{
          fontFamily: face.extraBold,
          fontSize: 39,
          color,
          letterSpacing: -1.5,
          padding: 0,
          textAlign: 'center',
          minWidth: 190,
          includeFontPadding: false,
        }}
      />
      <Text
        style={{
          fontFamily: face.medium,
          color: ink.textSecondary,
          fontSize: 14,
        }}
      >
        {unit}
      </Text>
    </View>
  );
}
