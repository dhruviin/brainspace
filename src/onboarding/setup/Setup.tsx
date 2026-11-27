import React, { useEffect, useMemo, useRef, useState } from 'react';
import { router } from 'expo-router';
import {
  ActivityIndicator,
  Animated,
  BackHandler,
  Easing,
  Image,
  KeyboardAvoidingView,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import {
  setupPalette,
  Typography as face,
  type ThemeColors,
} from '../../theme/tokens';
import { PermissionSetup } from '../permissions/PermissionSetup';
import { useMotion } from '../hooks/useMotion';
import { MASCOT_DATA_URIS } from '../components/mascotData';
import {
  setupCopy as copy,
  setupQuestions,
  type Option,
  type QuestionId,
} from './content';
import { focusMinutes, selectOption, setupSteps } from './model';
import { useSetup } from './store';

type IconName = React.ComponentProps<typeof Ionicons>['name'];
const icon = (name: string, size: number, color: string) => (
  <Ionicons
    name={name as IconName}
    size={size}
    color={color}
    accessible={false}
  />
);
const tick = () => {
  void Haptics.selectionAsync().catch(() => undefined);
};

function Button({
  label,
  onPress,
  theme,
  disabled = false,
  busy = false,
  secondary = false,
}: {
  label: string;
  onPress: () => void;
  theme: ThemeColors;
  disabled?: boolean;
  busy?: boolean;
  secondary?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: disabled || busy, busy }}
      disabled={disabled || busy}
      onPress={() => {
        tick();
        onPress();
      }}
      style={({ pressed }) => [
        s.button,
        {
          backgroundColor: secondary ? 'transparent' : theme.accent,
          borderWidth: secondary ? 1 : 0,
          borderColor: theme.textSecondary,
          opacity: disabled ? 0.4 : pressed ? 0.8 : 1,
          transform: [{ scale: pressed ? 0.985 : 1 }],
        },
      ]}
    >
      {busy ? (
        <ActivityIndicator color={secondary ? theme.accent : theme.bg} />
      ) : (
        <>
          <Text
            style={[
              s.buttonText,
              { color: secondary ? theme.textPrimary : theme.bg },
            ]}
          >
            {label}
          </Text>
        </>
      )}
    </Pressable>
  );
}

function OptionCard({
  item,
  selected,
  multi,
  onPress,
  theme,
  compact = false,
  disabled = false,
}: {
  item: Option;
  selected: boolean;
  multi: boolean;
  onPress: () => void;
  theme: ThemeColors;
  compact?: boolean;
  disabled?: boolean;
}) {
  const motion = useMotion(),
    [scale] = useState(() => new Animated.Value(1));
  return (
    <Animated.View style={[compact && s.gridItem, { transform: [{ scale }] }]}>
      <Pressable
        accessibilityRole={multi ? 'checkbox' : 'radio'}
        accessibilityLabel={[item.title, item.detail]
          .filter(Boolean)
          .join('. ')}
        accessibilityState={{ checked: selected, disabled }}
        disabled={disabled}
        onPress={() => {
          tick();
          if (motion)
            Animated.sequence([
              Animated.timing(scale, {
                toValue: 0.98,
                duration: 70,
                useNativeDriver: true,
              }),
              Animated.spring(scale, {
                toValue: 1,
                speed: 24,
                bounciness: 3,
                useNativeDriver: true,
              }),
            ]).start();
          onPress();
        }}
        style={[
          s.option,
          compact && s.compactOption,
          {
            backgroundColor: selected ? theme.surface2 : theme.surface,
            borderColor: selected ? theme.accent : 'transparent',
            opacity: disabled ? 0.4 : 1,
          },
        ]}
      >
        <View style={s.optionIcon}>
          {icon(item.icon, 21, selected ? theme.accent : theme.textSecondary)}
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[s.optionTitle, { color: theme.textPrimary }]}>
            {item.title}
          </Text>
          {item.detail && (
            <Text style={[s.optionDetail, { color: theme.textSecondary }]}>
              {item.detail}
            </Text>
          )}
        </View>
        <View
          style={[
            s.check,
            compact && s.compactCheck,
            {
              borderRadius: multi ? 4 : 12,
              borderColor: selected ? theme.accent : theme.textSecondary,
              backgroundColor: selected ? theme.accent : 'transparent',
            },
          ]}
        >
          {selected && icon('checkmark', 14, theme.bg)}
        </View>
      </Pressable>
    </Animated.View>
  );
}

function Heading({
  title,
  detail,
  theme,
  large = false,
}: {
  title: string;
  detail: string;
  theme: ThemeColors;
  large?: boolean;
}) {
  return (
    <View style={s.heading}>
      <Text
        accessibilityRole="header"
        style={[s.title, large && s.welcomeTitle, { color: theme.textPrimary }]}
      >
        {title}
      </Text>
      <Text style={[s.detail, { color: theme.textSecondary }]}>{detail}</Text>
    </View>
  );
}

function Welcome({ theme }: { theme: ThemeColors }) {
  const motion = useMotion(),
    { height } = useWindowDimensions(),
    [clock] = useState(() => new Animated.Value(0)),
    [eyesOpen] = useState(() => new Animated.Value(1));
  useEffect(() => {
    clock.setValue(0);
    eyesOpen.setValue(1);
    if (!motion) return;
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(clock, {
          toValue: 1,
          duration: 2600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
          isInteraction: false,
        }),
        Animated.timing(clock, {
          toValue: 0,
          duration: 2600,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
          isInteraction: false,
        }),
      ]),
    );
    const blink = Animated.loop(
      Animated.sequence([
        Animated.delay(3400),
        Animated.timing(eyesOpen, {
          toValue: 0,
          duration: 90,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
          isInteraction: false,
        }),
        Animated.delay(60),
        Animated.timing(eyesOpen, {
          toValue: 1,
          duration: 140,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
          isInteraction: false,
        }),
      ]),
    );
    animation.start();
    blink.start();
    return () => {
      animation.stop();
      blink.stop();
    };
  }, [clock, eyesOpen, motion]);
  return (
    <>
      <View
        style={[s.hero, { height: Math.min(240, height * 0.28) }]}
        accessible
        accessibilityRole="image"
        accessibilityLabel={copy.companionAccessibility}
      >
        <Animated.View
          style={{
            transform: [
              {
                translateY: clock.interpolate({
                  inputRange: [0, 1],
                  outputRange: [3, -5],
                }),
              },
            ],
          }}
        >
          <Image
            source={{ uri: MASCOT_DATA_URIS.neutral }}
            style={{ width: 240, height: 240 }}
            resizeMode="contain"
          />
          {/* Match the eye positions and fill of the bundled 240-point mascot. */}
          {[101, 129].map((left) => (
            <View
              key={left}
              pointerEvents="none"
              accessible={false}
              style={[s.blinkEye, { left }]}
            >
              <Animated.View
                style={[
                  s.eyelid,
                  {
                    top: 0,
                    transform: [
                      {
                        translateY: eyesOpen.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, -8],
                        }),
                      },
                    ],
                  },
                ]}
              />
              <Animated.View
                style={[
                  s.eyelid,
                  {
                    bottom: 0,
                    transform: [
                      {
                        translateY: eyesOpen.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, 8],
                        }),
                      },
                    ],
                  },
                ]}
              />
            </View>
          ))}
        </Animated.View>
      </View>
      <Heading
        large
        title={copy.welcomeTitle}
        detail={copy.welcomeDetail}
        theme={theme}
      />
      <Text style={[s.pillars, { color: theme.textSecondary }]}>
        {copy.pillars.join(' · ')}
      </Text>
    </>
  );
}

function ThemePreview({ theme }: { theme: ThemeColors }) {
  return (
    <View
      style={[
        s.preview,
        { backgroundColor: theme.surface, borderColor: theme.border },
      ]}
      accessible
      accessibilityLabel={copy.themeAccessibility}
    >
      <View style={s.spread}>
        <Text style={[s.eyebrow, { color: theme.textSecondary }]}>
          {copy.preview}
        </Text>
        {icon('sparkles-outline', 17, theme.accent)}
      </View>
      <Text style={[s.previewTitle, { color: theme.textPrimary }]}>
        {copy.previewFocus}
      </Text>
      <View style={[s.previewTrack, { backgroundColor: theme.surface2 }]}>
        <View
          style={{
            width: '38%',
            height: 5,
            backgroundColor: theme.accent,
            borderRadius: 3,
          }}
        />
      </View>
      <View style={s.inline}>
        {icon('play-circle', 28, theme.accent)}
        <Text style={[s.small, { color: theme.textSecondary }]}>
          {copy.previewAction}
        </Text>
      </View>
    </View>
  );
}

function QuestionBody({ id, theme }: { id: QuestionId; theme: ThemeColors }) {
  const { answers, answer, customHabit, setCustomHabit, privateAvailable } =
    useSetup();
  const q = setupQuestions[id],
    selected = answers[id] ?? [],
    unavailable = id === 'habits' && !privateAvailable;
  return (
    <>
      <Heading title={q.title} detail={q.detail} theme={theme} />
      <View style={s.spread}>
        <Text style={[s.selectionLabel, { color: theme.textSecondary }]}>
          {q.max ? copy.chooseTwo : q.multi ? copy.chooseMany : copy.chooseOne}
        </Text>
        {q.multi && selected.length > 0 && (
          <Text style={[s.selectionLabel, { color: theme.accent }]}>
            {copy.selectedCount(selected.length)}
          </Text>
        )}
      </View>
      <View
        accessibilityRole={q.multi ? undefined : 'radiogroup'}
        style={id === 'distractions' ? s.grid : s.options}
      >
        {q.options.map((item) => (
          <OptionCard
            key={item.value}
            item={item}
            multi={!!q.multi}
            selected={selected.includes(item.value)}
            theme={theme}
            compact={id === 'distractions'}
            disabled={unavailable && item.value !== 'general'}
            onPress={() =>
              answer(id, selectOption(selected, item.value, q.multi, q.max))
            }
          />
        ))}
      </View>
      {id === 'habits' && selected.includes('custom') && (
        <View style={{ marginTop: 18 }}>
          <Text
            style={[s.small, { color: theme.textSecondary, marginBottom: 8 }]}
          >
            {copy.customLabel}
          </Text>
          <TextInput
            accessibilityLabel={copy.customLabel}
            placeholder={copy.customPlaceholder}
            placeholderTextColor={theme.textSecondary}
            value={customHabit}
            onChangeText={setCustomHabit}
            maxLength={60}
            autoCorrect={false}
            style={[
              s.input,
              {
                borderColor: theme.border,
                backgroundColor: theme.surface,
                color: theme.textPrimary,
              },
            ]}
          />
          <Text style={[s.note, { color: theme.textSecondary, marginTop: 8 }]}>
            {copy.customHint}
          </Text>
        </View>
      )}
      {(id === 'habits' || id === 'reels') && (
        <View style={s.privacyNote}>
          {icon(
            id === 'habits'
              ? 'lock-closed-outline'
              : 'information-circle-outline',
            16,
            theme.textSecondary,
          )}
          <Text style={[s.note, { color: theme.textSecondary, flex: 1 }]}>
            {id === 'reels'
              ? copy.reelsDisclosure
              : unavailable
              ? copy.privateUnavailable
              : copy.private}
          </Text>
        </View>
      )}
    </>
  );
}

export function PlanSummary({ theme }: { theme: ThemeColors }) {
  const answers = useSetup((state) => state.answers);
  const moment = setupQuestions.protect.options.find(
    (item) => item.value === answers.protect?.[0],
  );
  const rows = [
    {
      icon: 'timer-outline',
      title: copy.focusTitle(focusMinutes(answers)),
      detail: copy.planFocus,
    },
    {
      icon: moment?.icon ?? 'sunny-outline',
      title: moment?.title ?? copy.defaultMoment,
      detail: copy.planMoment,
    },
    ...(answers.habits?.length
      ? [
          {
            icon: 'leaf-outline',
            title: copy.planHabit,
            detail: copy.planHabitDetail,
          },
        ]
      : []),
  ];
  return (
    <View
      style={[
        s.planCard,
        { borderColor: theme.border, backgroundColor: theme.surface },
      ]}
    >
      {rows.map((row, i) => (
        <View
          key={row.title}
          style={[
            s.planRow,
            i > 0 && { borderTopWidth: 1, borderTopColor: theme.border },
          ]}
        >
          <View style={s.optionIcon}>{icon(row.icon, 22, theme.accent)}</View>
          <View style={{ flex: 1 }}>
            <Text style={[s.optionTitle, { color: theme.textPrimary }]}>
              {row.title}
            </Text>
            <Text style={[s.optionDetail, { color: theme.textSecondary }]}>
              {row.detail}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

function SlideToEnter({
  theme,
  busy,
  label = 'Slide to commit & enter →',
  onSlideComplete,
}: {
  theme: ThemeColors;
  busy?: boolean;
  label?: string;
  onSlideComplete: () => void;
}) {
  const [trackWidth, setTrackWidth] = useState(0);
  const dragX = useRef(new Animated.Value(0)).current;
  const completedRef = useRef(false);
  const maxSlideRef = useRef(0);
  const busyRef = useRef(busy);
  busyRef.current = busy;

  const thumbSize = 48;
  const padding = 5;
  const maxSlide = Math.max(0, trackWidth - thumbSize - padding * 2);
  maxSlideRef.current = maxSlide;

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () =>
          !busyRef.current && !completedRef.current,
        onMoveShouldSetPanResponder: (_, gesture) =>
          !busyRef.current &&
          !completedRef.current &&
          Math.abs(gesture.dx) > 1,
        onPanResponderGrant: () => {
          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
            () => undefined,
          );
        },
        onPanResponderTerminationRequest: () => false,
        onPanResponderMove: (_, gesture) => {
          if (completedRef.current) return;
          const limit = maxSlideRef.current;
          if (limit <= 0) return;
          const bounded = Math.max(0, Math.min(gesture.dx, limit));
          dragX.setValue(bounded);
        },
        onPanResponderRelease: (evt, gesture) => {
          if (completedRef.current) return;
          const limit = maxSlideRef.current;
          if (limit <= 0) return;

          const isSlideSuccess =
            gesture.dx >= limit * 0.45 ||
            (gesture.dx > limit * 0.2 && gesture.vx > 0.4);
          const isTapNearEnd =
            Math.abs(gesture.dx) < 8 &&
            evt.nativeEvent.locationX >= limit * 0.55;

          if (isSlideSuccess || isTapNearEnd) {
            completedRef.current = true;
            void Haptics.notificationAsync(
              Haptics.NotificationFeedbackType.Success,
            ).catch(() => undefined);
            Animated.timing(dragX, {
              toValue: limit,
              duration: 150,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: false,
            }).start(() => {
              onSlideComplete();
            });
          } else {
            void Haptics.selectionAsync().catch(() => undefined);
            Animated.spring(dragX, {
              toValue: 0,
              bounciness: 6,
              speed: 16,
              useNativeDriver: false,
            }).start();
          }
        },
        onPanResponderTerminate: () => {
          if (!completedRef.current) {
            Animated.spring(dragX, {
              toValue: 0,
              bounciness: 6,
              speed: 16,
              useNativeDriver: false,
            }).start();
          }
        },
      }),
    [dragX, onSlideComplete],
  );

  const textOpacity = dragX.interpolate({
    inputRange: [0, maxSlide > 0 ? maxSlide * 0.45 : 1],
    outputRange: [1, 0.05],
    extrapolate: 'clamp',
  });

  const fillWidth = dragX.interpolate({
    inputRange: [0, maxSlide > 0 ? maxSlide : 1],
    outputRange: [
      thumbSize + padding * 2,
      trackWidth || thumbSize + padding * 2,
    ],
    extrapolate: 'clamp',
  });

  return (
    <View
      onLayout={(e) => {
        const w = e.nativeEvent.layout.width;
        if (w > 0) setTrackWidth(w);
      }}
      {...panResponder.panHandlers}
      style={[
        s.sliderTrack,
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
        },
      ]}
    >
      <Animated.View
        style={[
          s.sliderFill,
          {
            width: fillWidth,
            backgroundColor: `${theme.accent}25`,
          },
        ]}
      />
      <Animated.Text
        style={[
          s.sliderText,
          {
            color: theme.textSecondary,
            opacity: textOpacity,
          },
        ]}
      >
        {busy ? 'Entering BrainSpace…' : label}
      </Animated.Text>
      <Animated.View
        style={[
          s.sliderThumb,
          {
            backgroundColor: theme.accent,
            transform: [{ translateX: dragX }],
          },
        ]}
      >
        <Ionicons name="arrow-forward" size={24} color={theme.bg} />
      </Animated.View>
    </View>
  );
}

function PlanMascot({ theme }: { theme: ThemeColors }) {
  const motion = useMotion();
  const [floatAnim] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (!motion) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 1600,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1600,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [floatAnim, motion]);

  const translateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [2, -6],
  });

  const scale = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.04],
  });

  return (
    <View style={s.planMascotWrap}>
      <View
        style={[
          s.planMascotGlow,
          {
            backgroundColor: `${theme.accent}14`,
            borderColor: `${theme.accent}30`,
          },
        ]}
      />
      <Animated.View
        style={{
          transform: [{ translateY }, { scale }],
        }}
      >
        <Image
          source={{ uri: MASCOT_DATA_URIS.happy }}
          style={{ width: 104, height: 104 }}
          resizeMode="contain"
        />
      </Animated.View>
    </View>
  );
}

function Plan({ theme }: { theme: ThemeColors }) {
  return (
    <>
      <PlanMascot theme={theme} />
      <Heading title={copy.planTitle} detail={copy.planDetail} theme={theme} />
      <PlanSummary theme={theme} />

      {/* Promise to Stay on Track (Commitment Contract) */}
      <View
        style={[
          s.promiseCard,
          {
            backgroundColor: theme.surface,
            borderColor: `${theme.accent}30`,
          },
        ]}
      >
        <View style={s.promiseHeader}>
          <Ionicons name="ribbon-outline" size={18} color={theme.accent} />
          <Text style={[s.promiseHeaderTitle, { color: theme.accent }]}>
            MY COMMITMENT
          </Text>
        </View>

        <Text style={[s.promisePrompt, { color: theme.textPrimary }]}>
          A daily promise to protect my focus:
        </Text>

        <View style={s.promiseItem}>
          <Ionicons
            name="checkmark-circle"
            size={18}
            color={theme.accent}
            style={{ marginTop: 2 }}
          />
          <Text style={[s.promiseText, { color: theme.textPrimary }]}>
            Protect my daily focus session without multitasking.
          </Text>
        </View>

        <View style={s.promiseItem}>
          <Ionicons
            name="checkmark-circle"
            size={18}
            color={theme.accent}
            style={{ marginTop: 2 }}
          />
          <Text style={[s.promiseText, { color: theme.textPrimary }]}>
            Pause and take a breath before endless scrolling.
          </Text>
        </View>

        <View style={s.promiseItem}>
          <Ionicons
            name="checkmark-circle"
            size={18}
            color={theme.accent}
            style={{ marginTop: 2 }}
          />
          <Text style={[s.promiseText, { color: theme.textPrimary }]}>
            Build small, consistent habits, one day at a time.
          </Text>
        </View>

        <View style={[s.promiseFooter, { borderTopColor: theme.border }]}>
          <Ionicons name="shield-checkmark" size={15} color={theme.accent} />
          <Text style={[s.promiseSigned, { color: theme.textSecondary }]}>
            Pledged by you • Starting today
          </Text>
        </View>
      </View>

      <View style={s.privacyNote}>
        {icon('globe-outline', 16, theme.textSecondary)}
        <Text style={[s.note, { color: theme.textSecondary }]}>
          {copy.timezone} ·{' '}
          {Intl.DateTimeFormat().resolvedOptions().timeZone.replace(/_/g, ' ')}
        </Text>
      </View>
      <Text style={[s.note, { color: theme.textSecondary, marginTop: 6 }]}>
        {copy.planNote}
      </Text>
    </>
  );
}

export default function Setup() {
  const {
    step,
    answers,
    saving,
    saveError,
    next,
    back,
    finish,
    go,
    customHabit,
  } = useSetup();
  const theme = setupPalette.night,
    dark = true;
  const motion = useMotion(),
    [appear] = useState(() => new Animated.Value(0)),
    [progress] = useState(() => new Animated.Value(0));
  const scroll = useRef<React.ComponentRef<typeof ScrollView>>(null),
    path = setupSteps(answers),
    index = path.indexOf(step);
  const intro = step === 'intro',
    plan = step === 'plan',
    access = step === 'access';
  const q = setupQuestions[step as QuestionId],
    selected = answers[step as QuestionId] ?? [];
  const invalidCustom =
    step === 'habits' && selected.includes('custom') && !customHabit.trim();
  useEffect(() => {
    appear.setValue(0);
    Animated.timing(appear, {
      toValue: 1,
      duration: motion ? 330 : 0,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
    scroll.current?.scrollTo({ y: 0, animated: false });
  }, [step, appear, motion]);
  useEffect(() => {
    Animated.timing(progress, {
      toValue: index / Math.max(1, path.length - 1),
      duration: motion ? 300 : 0,
      useNativeDriver: false,
    }).start();
  }, [index, path.length, progress, motion]);
  useEffect(() => {
    const listener = BackHandler.addEventListener(
      'hardwareBackPress',
      () => saving || back(),
    );
    return () => listener.remove();
  }, [back, saving]);
  return (
    <SafeAreaView style={[s.root, { backgroundColor: theme.bg }]}>
      <StatusBar style={dark ? 'light' : 'dark'} />
      <View style={s.shell}>
        <View style={s.header}>
          <View style={s.headerSide}>
            {!intro && (
              <Pressable
                disabled={saving}
                accessibilityLabel={copy.back}
                accessibilityRole="button"
                onPress={back}
                style={s.back}
              >
                {icon('arrow-back', 22, theme.textPrimary)}
              </Pressable>
            )}
          </View>
          <View style={s.inline}>
            <Text style={[s.brand, { color: theme.textPrimary }]}>
              {copy.brand}
            </Text>
          </View>
          <View style={[s.headerSide, { alignItems: 'flex-end' }]}>
            {!intro && !plan && (
              <Text style={[s.small, { color: theme.textSecondary }]}>
                {index} / {path.length - 2}
              </Text>
            )}
          </View>
        </View>
        {!intro && (
          <View
            accessibilityRole="progressbar"
            accessibilityLabel={copy.progressAccessibility}
            accessibilityValue={{ min: 0, max: path.length - 1, now: index }}
            style={[s.progressTrack, { backgroundColor: theme.surface2 }]}
          >
            <Animated.View
              style={{
                height: 2,
                borderRadius: 2,
                backgroundColor: theme.accent,
                width: progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              }}
            />
          </View>
        )}
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            ref={scroll}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={[s.content, intro && { paddingTop: 0 }]}
          >
            <Animated.View
              style={{
                opacity: appear,
                transform: [
                  {
                    translateY: appear.interpolate({
                      inputRange: [0, 1],
                      outputRange: [motion ? 16 : 0, 0],
                    }),
                  },
                ],
              }}
            >
              {intro ? (
                <Welcome theme={theme} />
              ) : plan ? (
                <Plan theme={theme} />
              ) : access ? (
                <PermissionSetup theme={theme} />
              ) : q ? (
                <QuestionBody id={step as QuestionId} theme={theme} />
              ) : null}
            </Animated.View>
          </ScrollView>
          <View
            style={[
              s.footer,
              { borderTopColor: theme.border, backgroundColor: theme.bg },
            ]}
          >
            {saveError && (
              <Text
                accessibilityRole="alert"
                style={[
                  s.note,
                  { color: dark ? '#FFADAE' : theme.danger, marginBottom: 10 },
                ]}
              >
                {copy.saveError}
              </Text>
            )}
            {plan ? (
              <SlideToEnter
                theme={theme}
                busy={saving}
                label="Slide to commit & enter →"
                onSlideComplete={() => void finish()}
              />
            ) : (
              <Button
                theme={theme}
                busy={saving}
                disabled={!!q && (!selected.length || invalidCustom)}
                label={
                  saving
                    ? copy.saving
                    : intro
                    ? copy.start
                    : copy.continue
                }
                onPress={() => {
                  next();
                }}
              />
            )}
            {plan && (
              <Pressable
                accessibilityRole="button"
                disabled={saving}
                onPress={() => go('goals')}
                style={s.textButton}
              >
                <Text style={[s.small, { color: theme.textSecondary }]}>
                  {copy.edit}
                </Text>
              </Pressable>
            )}
            {intro && (
              <Text
                style={[
                  s.note,
                  {
                    color: theme.textSecondary,
                    textAlign: 'center',
                    marginTop: 12,
                  },
                ]}
              >
                {copy.free}
              </Text>
            )}
            {access && (
              <Text
                style={[
                  s.note,
                  {
                    color: theme.textSecondary,
                    marginTop: 12,
                    textAlign: 'center',
                  },
                ]}
              >
                {copy.accessFooter}
              </Text>
            )}
          </View>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  shell: { flex: 1, width: '100%', maxWidth: 500, alignSelf: 'center' },
  header: {
    minHeight: 56,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  headerSide: { width: 48, minHeight: 48, justifyContent: 'center' },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  blinkEye: {
    position: 'absolute',
    top: 106,
    width: 10,
    height: 16.5,
    overflow: 'hidden',
  },
  eyelid: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 7.75,
    backgroundColor: '#212121',
  },
  spread: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  brand: { fontFamily: face.bold, fontSize: 16, letterSpacing: -0.5 },
  back: { width: 48, minHeight: 48, justifyContent: 'center' },
  progressTrack: {
    height: 2,
    marginHorizontal: 24,
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 4,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
    flexGrow: 1,
  },
  heading: { marginBottom: 28 },
  eyebrow: {
    fontFamily: face.medium,
    fontSize: 10,
    letterSpacing: 0.6,
    marginBottom: 10,
  },
  title: {
    fontFamily: face.bold,
    fontSize: 28,
    lineHeight: 36,
    letterSpacing: -0.8,
    textAlign: 'center',
  },
  welcomeTitle: { fontSize: 34, lineHeight: 41, letterSpacing: -1.2 },
  detail: {
    fontFamily: face.regular,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 14,
    textAlign: 'center',
  },
  stepIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 20,
  },
  selectionLabel: {
    fontFamily: face.medium,
    fontSize: 11,
    lineHeight: 17,
    marginBottom: 14,
  },
  options: { gap: 8 },
  option: {
    minHeight: 68,
    borderWidth: 1,
    borderRadius: 6,
    paddingVertical: 14,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  optionIcon: {
    width: 30,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  optionTitle: { fontFamily: face.semiBold, fontSize: 13, lineHeight: 20 },
  optionDetail: {
    fontFamily: face.regular,
    fontSize: 11,
    lineHeight: 17,
    marginTop: 3,
  },
  check: {
    width: 21,
    height: 21,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  gridItem: { width: '48%', flexGrow: 1 },
  compactOption: {
    minHeight: 98,
    alignItems: 'flex-start',
    flexDirection: 'column',
    gap: 10,
  },
  compactCheck: { position: 'absolute', top: 15, right: 14 },
  footer: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 10 },
  button: {
    minHeight: 56,
    borderRadius: 30,
    paddingHorizontal: 24,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: { fontFamily: face.bold, fontSize: 15 },
  textButton: { minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  small: { fontFamily: face.medium, fontSize: 11, lineHeight: 17 },
  note: { fontFamily: face.regular, fontSize: 11, lineHeight: 17 },
  hero: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    marginBottom: 16,
  },
  pillars: {
    fontFamily: face.medium,
    fontSize: 11,
    lineHeight: 18,
    textAlign: 'center',
    marginTop: 2,
  },
  privacyNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 9,
    marginTop: 20,
  },
  input: {
    minHeight: 54,
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 15,
    fontFamily: face.regular,
    fontSize: 13,
  },
  preview: { borderRadius: 8, padding: 20, marginBottom: 24 },
  previewTitle: { fontFamily: face.bold, fontSize: 18, letterSpacing: -0.5 },
  previewTrack: { height: 4, borderRadius: 2, marginTop: 16, marginBottom: 17 },
  accessCard: {
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginBottom: 24,
  },
  accessRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    paddingVertical: 16,
  },
  finishMark: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
    marginBottom: 24,
  },
  planMascotWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
    marginBottom: 12,
    position: 'relative',
  },
  planMascotGlow: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 1,
  },
  planCard: { paddingHorizontal: 16, borderRadius: 8 },
  planRow: {
    flexDirection: 'row',
    gap: 14,
    paddingVertical: 18,
    alignItems: 'center',
  },
  sliderTrack: {
    height: 58,
    borderRadius: 29,
    borderWidth: 1,
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  sliderFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 29,
  },
  sliderText: {
    position: 'absolute',
    width: '100%',
    textAlign: 'center',
    fontFamily: face.semiBold,
    fontSize: 14,
    letterSpacing: 0.2,
  },
  sliderThumb: {
    width: 48,
    height: 48,
    borderRadius: 24,
    position: 'absolute',
    left: 4,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  promiseCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginTop: 18,
    marginBottom: 4,
  },
  promiseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  promiseHeaderTitle: {
    fontFamily: face.bold,
    fontSize: 12,
    letterSpacing: 1.2,
  },
  promisePrompt: {
    fontFamily: face.semiBold,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  promiseItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 10,
  },
  promiseText: {
    flex: 1,
    fontFamily: face.regular,
    fontSize: 13,
    lineHeight: 19,
  },
  promiseFooter: {
    borderTopWidth: 1,
    paddingTop: 12,
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  promiseSigned: {
    fontFamily: face.medium,
    fontSize: 11,
  },
});
