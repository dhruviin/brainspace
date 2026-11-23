import React, { useCallback, useEffect, useState } from 'react';
import { Alert, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header, Transition } from '../components/Stage';
import { useStory } from '../store/story';
import { type Step } from '../store/model';
import { copy, questions } from '../strings';
import { ink } from '../theme';
import { Playground, qaBuild } from './Playground';
import { Intro } from './Intro';
import { Question } from './Question';
import { Numbers } from './Numbers';
import { Cost } from './Cost';

const scenes: Partial<Record<Step, React.ComponentType>> = {
  intro: Intro,
  numbers: Numbers,
  cost: Cost,
};
const order: Step[] = [
  'role',
  'when',
  'screen',
  'symptoms',
  'dream',
  'time',
  'helps',
  'daily',
  'recall',
  'limit',
];
export default function Onboarding() {
  const step = useStory((s) => s.step),
    back = useStory((s) => s.back),
    view = useStory((s) => s.view),
    go = useStory((s) => s.go);
  const [play, setPlay] = useState(qaBuild);
  const handleBack = useCallback(() => {
    if (play) {
      setPlay(false);
      return true;
    }
    return back();
  }, [back, play]);
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', handleBack);
    return () => sub.remove();
  }, [handleBack]);
  useEffect(() => {
    if (!play) view();
  }, [step, view, play]);
  if (play)
    return (
      <Playground
        jump={(s) => {
          go(s);
          setPlay(false);
        }}
      />
    );
  const Body = questions[step] ? Question : (scenes[step] ?? Intro),
    index = order.indexOf(step);
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: ink.bg }}>
      <Header
        intro={step === 'intro'}
        back={handleBack}
        question={index < 0 ? undefined : index + 1}
        menu={__DEV__ || qaBuild ? () => setPlay(true) : undefined}
        language={() =>
          Alert.alert(copy.languageTitle, copy.languageDetail, [
            { text: copy.close },
          ])
        }
      />
      <Transition key={step}>
        <Body />
      </Transition>
    </SafeAreaView>
  );
}
