import React from 'react';
import { Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { TypewriterCaption, CountUpNumber } from '../components/Caption';
import { Scene, styles, useArtSize } from '../components/Stage';
import { ParticleField } from '../components/ParticleField';
import { useStory } from '../store/story';
import { projection } from '../store/model';
import { copy } from '../strings';
import { shape } from '../shapes';
import { ink } from '../theme';
export function Cost() {
  const { beat, answers, limit, next } = useStory(),
    p = projection(answers, limit),
    size = useArtSize();
  return (
    <Scene advance={next} footnote={beat ? copy.costNote : copy.estimate}>
      <TypewriterCaption text={copy.cost(copy.annual(p.daily))} />
      <View style={{ width: size, height: size, justifyContent: 'center' }}>
        <ParticleField
          size={size}
          targetShape={shape('disc')}
          mode={beat ? 'dissolve' : 'pulse'}
        />
        {!!beat && (
          <Animated.View entering={FadeIn.duration(500)} style={styles.overlay}>
            <View
              style={{ backgroundColor: ink.bg, borderRadius: 30, padding: 10 }}
            >
              <CountUpNumber
                value={Math.round(p.days)}
                unit={copy.yearly}
                color={ink.dangerText}
              />
            </View>
            <Text style={styles.note}>{copy.months(p.days)}</Text>
          </Animated.View>
        )}
      </View>
    </Scene>
  );
}
