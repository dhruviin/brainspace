import React, { useEffect } from 'react';
import {
  Image,
  Pressable,
  Text,
  View,
  StyleSheet,
  type ImageSourcePropType,
} from 'react-native';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { face, ink } from '../theme';
import { TypewriterCaption } from './Caption';
import { useMotion } from '../hooks/useMotion';
import { MASCOT_DATA_URIS } from './mascotData';
export const tick = () => {
  void Haptics.selectionAsync().catch(() => {});
};
export type Expression = 'neutral' | 'wave' | 'tired' | 'shocked' | 'happy';

const defaultMascotSources: Record<Expression, ImageSourcePropType> = {
  neutral: { uri: MASCOT_DATA_URIS.neutral },
  happy: { uri: MASCOT_DATA_URIS.happy },
  wave: { uri: MASCOT_DATA_URIS.wave },
  tired: { uri: MASCOT_DATA_URIS.tired },
  shocked: { uri: MASCOT_DATA_URIS.shocked },
};

export function Mascot({
  expression = 'neutral',
  size = 52,
  sources,
}: {
  expression?: Expression;
  size?: number;
  sources?: Partial<Record<Expression, ImageSourcePropType>>;
}) {
  const source =
    sources?.[expression] ?? defaultMascotSources[expression] ?? defaultMascotSources.neutral;

  return (
    <View
      accessible={false}
      style={{
        width: size,
        height: size,
        alignItems: 'center',
        justifyContent: 'center',
        transform: [{ rotate: expression === 'wave' ? '-8deg' : '0deg' }],
      }}
    >
      <Image
        resizeMode="contain"
        source={source}
        style={{ width: size, height: size }}
      />
    </View>
  );
}
export function MascotBubble({
  text,
  expression,
  sources,
}: {
  text: string;
  expression?: Expression;
  sources?: Partial<Record<Expression, ImageSourcePropType>>;
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
        marginBottom: 22,
      }}
    >
      <Mascot expression={expression} sources={sources} />
      <View
        style={{
          flex: 1,
          backgroundColor: ink.surface2,
          paddingVertical: 14,
          paddingHorizontal: 16,
          borderRadius: 20,
          borderTopLeftRadius: 5,
        }}
      >
        <TypewriterCaption text={text} small align="left" />
      </View>
    </View>
  );
}
export function Action({
  label,
  onPress,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  const enabled = useSharedValue(disabled ? 0 : 1);
  useEffect(() => {
    enabled.value = withTiming(disabled ? 0 : 1, { duration: 200 });
  }, [disabled, enabled]);
  const style = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      enabled.value,
      [0, 1],
      [ink.surface2, ink.accent],
    ),
  }));
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={() => {
        tick();
        onPress();
      }}
    >
      <Animated.View style={[styles.button, style]}>
        <Text
          style={{
            fontFamily: face.bold,
            fontSize: 16,
            color: disabled ? ink.faint : ink.bg,
          }}
        >
          {label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}
function Option({
  item,
  selected,
  multi,
  index,
  onSelect,
}: {
  item: string;
  selected: boolean;
  multi: boolean;
  index: number;
  onSelect: () => void;
}) {
  const motion = useMotion(),
    level = useSharedValue(selected ? 1 : 0),
    scale = useSharedValue(1);
  useEffect(() => {
    level.value = withTiming(selected ? 1 : 0, { duration: motion ? 180 : 0 });
  }, [selected, level, motion]);
  const style = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      level.value,
      [0, 1],
      [ink.surface, ink.selected],
    ),
    transform: [{ scale: scale.value }],
  }));
  return (
    <Animated.View
      entering={FadeInDown.duration(motion ? 250 : 0).delay(
        motion ? index * 50 : 0,
      )}
    >
      <Pressable
        accessibilityRole={multi ? 'checkbox' : 'radio'}
        accessibilityState={{ checked: selected }}
        accessibilityLabel={item}
        onPress={() => {
          if (!multi && selected) return;
          tick();
          if (motion)
            scale.set(
              withSequence(withTiming(0.98, { duration: 65 }), withSpring(1)),
            );
          onSelect();
        }}
      >
        <Animated.View
          style={[
            styles.row,
            style,
            { borderColor: selected ? ink.accent : ink.surface3 },
          ]}
        >
          <Text style={styles.option}>{item}</Text>
          <View
            style={{
              width: 21,
              height: 21,
              borderRadius: multi ? 6 : 11,
              borderWidth: 1,
              borderColor: selected ? ink.accent : ink.faint,
              backgroundColor: selected ? ink.accent : 'transparent',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {selected && (
              <Text
                allowFontScaling={false}
                style={{ color: ink.bg, fontWeight: 'bold', fontSize: 13 }}
              >
                ✓
              </Text>
            )}
          </View>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}
export function OptionList({
  labels,
  values,
  selected,
  multi = false,
  onChange,
}: {
  labels: string[];
  values: string[];
  selected: string[];
  multi?: boolean;
  onChange: (values: string[]) => void;
}) {
  return (
    <View style={{ gap: 8 }}>
      {labels.map((label, i) => (
        <Option
          key={values[i]}
          item={label}
          selected={selected.includes(values[i])}
          multi={multi}
          index={i}
          onSelect={() => {
            const value = values[i];
            if (!multi || value === 'skip') onChange([value]);
            else if (selected.includes(value))
              onChange(selected.filter((v) => v !== value));
            else onChange([...selected.filter((v) => v !== 'skip'), value]);
          }}
        />
      ))}
    </View>
  );
}
const styles = StyleSheet.create({
  button: {
    minHeight: 54,
    padding: 12,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    minHeight: 56,
    paddingVertical: 12,
    paddingHorizontal: 17,
    borderWidth: 1,
    borderRadius: 17,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  option: {
    fontFamily: face.medium,
    color: ink.textPrimary,
    fontSize: 15,
    flex: 1,
  },
});
