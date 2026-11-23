import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFrameCallback, useSharedValue } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { ParticleField, type Effect } from '../components/ParticleField';
import { type ShapeName, shape } from '../shapes';
import { MascotBubble, OptionList } from '../components/Controls';
import { CountUpNumber, TypewriterCaption } from '../components/Caption';
import { WheelPicker } from '../components/WheelPicker';
import { steps, type Step } from '../store/model';
import { ink } from '../theme';
export const qaBuild = process.env.EXPO_PUBLIC_STORY_QA === '1';
const samples: [ShapeName, Effect][] = [
  ['phone', 'swirl'],
  ['rings', 'rotate'],
  ['disc', 'pulse'],
  ['trophy', 'fall'],
  ['head', 'dissolve'],
  ['confetti', 'scatter'],
];
export function Playground({ jump }: { jump: (s: Step) => void }) {
  const [stage, setStage] = useState(0),
    [value, setValue] = useState(210),
    [choice, setChoice] = useState<string[]>([]),
    [fps, setFps] = useState('');
  const samplesRun = useSharedValue(0),
    elapsed = useSharedValue(0),
    slow = useSharedValue(0);
  useFrameCallback((frame) => {
    'worklet';
    const dt = frame.timeSincePreviousFrame;
    if (!dt) return;
    samplesRun.value++;
    elapsed.value += dt;
    if (dt > 20) slow.value++;
    if (elapsed.value >= 2000) {
      const message =
        Math.round((samplesRun.value * 1000) / elapsed.value) +
        ' fps · ' +
        slow.value +
        '/' +
        samplesRun.value +
        ' frames >20ms';
      scheduleOnRN(setFps, message);
      elapsed.value = 0;
      slow.value = 0;
      samplesRun.value = 0;
    }
  });
  useEffect(() => {
    const timer = setInterval(
      () => setStage((x) => (x + 1) % samples.length),
      2200,
    );
    return () => clearInterval(timer);
  }, []);
  const [name, mode] = samples[stage];
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: ink.bg }}>
      <ScrollView contentContainerStyle={{ padding: 18, gap: 9 }}>
        <Text style={{ color: ink.accent }}>
          Motion playground · {name} · {fps}
        </Text>
        <ParticleField size={145} targetShape={shape(name)} mode={mode} />
        <CountUpNumber value={(stage + 1) * 2100} unit="reels" />
        <TypewriterCaption
          text={name + ' {particles}'}
          previous="Previous line"
        />
        <MascotBubble
          text="Choose a {sample}"
          expression={stage % 2 ? 'happy' : 'tired'}
        />
        <OptionList
          labels={['Single tick', 'Multiple ticks']}
          values={['a', 'b']}
          selected={choice}
          multi
          onChange={setChoice}
        />
        <WheelPicker
          value={value}
          max={300}
          onChange={setValue}
          label="Sample limit"
        />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {steps.map((s) => (
            <Pressable
              key={s}
              accessibilityRole="button"
              onPress={() => jump(s)}
              style={{ padding: 12, backgroundColor: ink.surface2 }}
            >
              <Text style={{ color: ink.textPrimary }}>{s}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
