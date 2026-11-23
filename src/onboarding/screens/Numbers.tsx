import React, { useCallback } from 'react';
import { View, Text } from 'react-native';
import { ParticleField } from '../components/ParticleField';
import { CountUpNumber } from '../components/Caption';
import { Scene, styles, useArtSize } from '../components/Stage';
import { useStoryTimer } from '../hooks/useStoryTimer';
import { shape, type ShapeName } from '../shapes';
import { useStory } from '../store/story';
import { projection } from '../store/model';
import { copy } from '../strings';
import { ink, timing } from '../theme';

const forms: ShapeName[] = ['spinner', 'ring', 'week', 'month', 'disc'];
export function Numbers() {
  const { answers, limit, beat, next } = useStory(),
    p = projection(answers, limit),
    size = useArtSize();
  const advance = useCallback(() => {
    const state = useStory.getState();
    if (state.step === 'numbers' && state.beat === beat) state.next();
  }, [beat]);
  useStoryTimer(beat < 4, beat === 0 ? 850 : timing.reveal, advance);
  return (
    <Scene
      advance={advance}
      button
      disabled={beat < 4}
      footnote={copy.estimate}
    >
      <View
        style={{
          width: size,
          height: size,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <ParticleField
          size={size}
          targetShape={shape(forms[beat])}
          mode={beat === 0 ? 'rotate' : 'pulse'}
        />
        {beat > 0 && (
          <View style={styles.overlay}>
            <View
              style={{
                borderRadius: 65,
                backgroundColor: ink.bg,
                paddingHorizontal: 8,
                paddingVertical: 8,
              }}
            >
              <CountUpNumber
                value={p.daily * [0, 1, 7, 30, 365][beat]}
                suffix={p.atLeast ? '+' : ''}
                unit={copy.units[beat]}
                color={beat >= 3 ? ink.dangerText : ink.textPrimary}
              />
            </View>
          </View>
        )}
      </View>
      {beat === 0 && <Text style={styles.note}>{copy.calculating}</Text>}
    </Scene>
  );
}
