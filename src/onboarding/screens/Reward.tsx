import React, { useCallback, useEffect } from 'react';
import { Text, useWindowDimensions, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { GiftBox } from '../components/GiftBox';
import { ParticleField } from '../components/ParticleField';
import { TypewriterCaption } from '../components/Caption';
import { Scene, styles } from '../components/Stage';
import { useStoryTimer } from '../hooks/useStoryTimer';
import { shape } from '../shapes';
import { useStory } from '../store/story';
import { copy } from '../strings';
import { timing } from '../theme';
const amounts = [10, 40, 70];
export function Reward() {
  const {
      gifts,
      gift,
      deal,
      claim,
      next,
      rewardPhase: phase,
      setRewardPhase,
    } = useStory(),
    width = Math.min(350, useWindowDimensions().width - 50);
  useEffect(() => {
    deal();
  }, [deal]);
  const advance = useCallback(
    () => setRewardPhase(phase + 1),
    [phase, setRewardPhase],
  );
  useStoryTimer(
    gift === null && phase < 8,
    phase < 3
      ? timing.line
      : phase === 5
        ? 1300
        : phase === 7
          ? timing.shuffle + 100
          : 580,
    advance,
  );
  const pick = (slot: number) => {
    if (useStory.getState().gift !== null) return;
    claim(slot);
    void Haptics.notificationAsync(
      Haptics.NotificationFeedbackType.Success,
    ).catch(() => {});
  };
  const title =
    gift !== null
      ? copy.claimed(gift)
      : phase < 3
        ? copy.reward[phase]
        : phase < 6
          ? copy.giftsOpen
          : phase < 8
            ? copy.giftsMove
            : copy.giftsPick;
  return (
    <Scene
      advance={next}
      label={copy.openOffer}
      button
      disabled={gift === null}
    >
      <TypewriterCaption
        text={title}
        previous={phase > 0 && phase < 3 ? copy.reward[phase - 1] : undefined}
      />
      <View style={{ width, height: width * 0.73, minHeight: 215 }}>
        {gift !== null && (
          <View style={styles.overlay}>
            <ParticleField
              targetShape={shape('confetti')}
              size={width * 0.85}
              mode="scatter"
            />
          </View>
        )}
        {phase >= 3 &&
          gifts.length === 3 &&
          amounts.map((amount, i) => (
            <GiftBox
              key={amount}
              index={i}
              slot={gifts.indexOf(amount)}
              amount={amount}
              phase={phase}
              claimed={gift}
              onPick={pick}
              width={width}
            />
          ))}
      </View>
    </Scene>
  );
}
export function Offer() {
  const { gift, finish } = useStory();
  return (
    <Scene advance={finish} button label={copy.home}>
      <TypewriterCaption text={copy.offerTitle} />
      {gift !== null && (
        <View
          style={{
            alignItems: 'center',
            gap: 5,
            padding: 24,
            borderRadius: 21,
            backgroundColor: '#193526',
          }}
        >
          <Text style={styles.note}>{copy.giftSaved}</Text>
          <TypewriterCaption text={'{' + copy.off(gift) + '}'} />
        </View>
      )}
      <Text
        style={[
          styles.note,
          { fontSize: 15, lineHeight: 24, textAlign: 'center', maxWidth: 330 },
        ]}
      >
        {copy.offerBody}
      </Text>
    </Scene>
  );
}
