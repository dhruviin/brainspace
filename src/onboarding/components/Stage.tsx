import React, { useEffect } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { GestureDetector, useTapGesture } from 'react-native-gesture-handler';
import { scheduleOnRN } from 'react-native-worklets';
import Animated, {
  cancelAnimation,
  Easing,
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useMotion } from '../hooks/useMotion';
import { copy } from '../strings';
import { face, ink, timing } from '../theme';
import { Action } from './Controls';

export function useArtSize() {
  const { width, height } = useWindowDimensions();
  return Math.min(354, width - 52, Math.max(168, height * 0.41));
}
export function Header({
  intro = false,
  question,
  back,
  menu,
  language,
}: {
  intro?: boolean;
  question?: number;
  back: () => void;
  menu?: () => void;
  language: () => void;
}) {
  const fill = useSharedValue((question ?? 0) / 10);
  useEffect(() => {
    fill.value = withTiming((question ?? 0) / 10, { duration: timing.step });
  }, [question, fill]);
  const track = useAnimatedStyle(() => ({
    width: (fill.value * 100 + '%') as `${number}%`,
  }));
  return (
    <View style={{ paddingHorizontal: 23, paddingTop: 4 }}>
      <View
        style={{
          minHeight: 47,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          {!intro && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={copy.back}
              hitSlop={7}
              onPress={back}
              style={{ minWidth: 38, minHeight: 42, justifyContent: 'center' }}
            >
              <Ionicons name="arrow-back" size={21} color={ink.textPrimary} />
            </Pressable>
          )}
          <Pressable
            onLongPress={menu}
            delayLongPress={650}
            accessible
            accessibilityLabel={copy.brand}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              minHeight: 42,
              gap: 6,
            }}
          >
            <Image
              source={require('../../../assets/splash-icon.png')}
              style={{ width: 21, height: 21 }}
            />
            <Text
              style={{
                color: ink.textPrimary,
                fontFamily: face.bold,
                fontSize: 15,
                letterSpacing: -0.6,
              }}
            >
              {copy.brand}
            </Text>
          </Pressable>
        </View>
        {intro ? (
          <Pressable
            onPress={language}
            accessibilityRole="button"
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              borderRadius: 18,
              paddingVertical: 8,
              paddingHorizontal: 12,
              backgroundColor: ink.surface2,
            }}
          >
            <Ionicons
              name="globe-outline"
              size={14}
              color={ink.textSecondary}
            />
            <Text style={styles.note}>{copy.language}</Text>
          </Pressable>
        ) : question ? (
          <Text
            accessibilityLabel={copy.progress(question)}
            style={styles.note}
          >
            {String(question).padStart(2, '0')} / 10
          </Text>
        ) : null}
      </View>
      {question !== undefined && (
        <View
          style={{
            height: 3,
            backgroundColor: ink.surface3,
            borderRadius: 4,
            marginVertical: 7,
            overflow: 'hidden',
          }}
        >
          <Animated.View
            style={[{ height: 3, backgroundColor: ink.textPrimary }, track]}
          />
        </View>
      )}
    </View>
  );
}
export function Footer({
  label = copy.next,
  onPress,
  disabled,
}: {
  label?: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <View style={{ paddingHorizontal: 23, paddingTop: 10, paddingBottom: 13 }}>
      <Action label={label} onPress={onPress} disabled={disabled} />
    </View>
  );
}
function TapHint() {
  const opacity = useSharedValue(0.7),
    motion = useMotion();
  useEffect(() => {
    if (motion)
      opacity.value = withRepeat(
        withTiming(1, { duration: 1050, easing: Easing.inOut(Easing.sin) }),
        -1,
        true,
      );
    return () => cancelAnimation(opacity);
  }, [motion, opacity]);
  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return (
    <Animated.Text
      style={[styles.note, { alignSelf: 'center', marginVertical: 19 }, style]}
    >
      {copy.tap}
    </Animated.Text>
  );
}
export function Scene({
  children,
  advance,
  button,
  footnote,
  disabled = false,
  label,
}: {
  children: React.ReactNode;
  advance: () => void;
  button?: boolean;
  footnote?: string;
  disabled?: boolean;
  label?: string;
}) {
  const gesture = useTapGesture({
    enabled: !button && !disabled,
    onActivate: () => {
      'worklet';
      scheduleOnRN(advance);
    },
  });
  return (
    <GestureDetector gesture={gesture}>
      <View style={{ flex: 1 }}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 23,
            gap: 16,
            paddingVertical: 10,
          }}
        >
          {children}
        </ScrollView>
        {!!footnote && (
          <Text
            style={[
              styles.note,
              { textAlign: 'center', paddingHorizontal: 30 },
            ]}
          >
            {footnote}
          </Text>
        )}
        {button ? (
          <Footer onPress={advance} disabled={disabled} label={label} />
        ) : (
          <View
            accessible
            accessibilityRole="button"
            accessibilityLabel={copy.tap}
            onAccessibilityTap={advance}
            accessibilityActions={[{ name: 'activate' }]}
            onAccessibilityAction={advance}
          >
            <TapHint />
          </View>
        )}
      </View>
    </GestureDetector>
  );
}
export function Transition({ children }: { children: React.ReactNode }) {
  const motion = useMotion();
  return (
    <Animated.View
      style={{ flex: 1 }}
      entering={
        motion ? FadeInDown.duration(timing.step) : FadeIn.duration(150)
      }
    >
      {children}
    </Animated.View>
  );
}
export const styles = StyleSheet.create({
  note: { fontFamily: face.medium, fontSize: 12, color: ink.textSecondary },
  overlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
