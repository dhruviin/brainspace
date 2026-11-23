import React from 'react';
import { ScrollView, Text } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import {
  MascotBubble,
  OptionList,
  type Expression,
} from '../components/Controls';
import { ParticleField } from '../components/ParticleField';
import { Footer, styles } from '../components/Stage';
import { useMotion } from '../hooks/useMotion';
import { shape } from '../shapes';
import { useStory } from '../store/story';
import { copy, questions } from '../strings';

export function Question() {
  const { step, answers, answer, next } = useStory(),
    motion = useMotion();
  const q = questions[step];
  if (!q) return null;
  const selected = answers[step] ?? [],
    time = answers.screen?.[0];
  const expression: Expression =
    step === 'screen' && time !== undefined
      ? (['happy', 'neutral', 'tired', 'shocked'] as const)[Number(time)]
      : step === 'dream'
        ? 'happy'
        : 'neutral';
  const annual = copy.annual(Number(answers.daily?.[0] ?? 300));
  return (
    <>
      <ScrollView
        key={step}
        contentContainerStyle={{
          paddingHorizontal: 23,
          paddingTop: 17,
          paddingBottom: 18,
        }}
      >
        {step === 'recall' && (
          <Animated.View entering={FadeInUp.duration(motion ? 360 : 0)}>
            <ParticleField
              size={103}
              targetShape={shape('disc')}
              mode="pulse"
            />
          </Animated.View>
        )}
        <MascotBubble
          text={step === 'recall' ? copy.recall(annual) : q.prompt}
          expression={expression}
        />
        {q.multi && (
          <Text style={[styles.note, { marginBottom: 11 }]}>{copy.multi}</Text>
        )}
        <OptionList
          labels={q.labels}
          values={q.values ?? q.labels.map((_, i) => String(i))}
          selected={selected}
          multi={q.multi}
          onChange={(v) => answer(step, v)}
        />
        {q.multi && (
          <Text style={[styles.note, { marginTop: 11 }]}>{copy.private}</Text>
        )}
      </ScrollView>
      <Footer disabled={!selected.length} onPress={next} />
    </>
  );
}
