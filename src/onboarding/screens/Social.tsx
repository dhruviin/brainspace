import React from 'react';
import { View } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import { Mascot } from '../components/Controls';
import { TypewriterCaption } from '../components/Caption';
import { ParticleField, type Effect } from '../components/ParticleField';
import { Scene, styles, useArtSize } from '../components/Stage';
import { shape, type ShapeName } from '../shapes';
import { useStory } from '../store/story';
import { copy } from '../strings';
import { useMotion } from '../hooks/useMotion';

function currency(): ShapeName {
  const region = Intl.DateTimeFormat()
    .resolvedOptions()
    .locale.split('-')
    .find((x) => /^[A-Z]{2}$/.test(x));
  if (region === 'IN') return 'inr';
  if (
    region &&
    [
      'AT',
      'BE',
      'CY',
      'DE',
      'EE',
      'ES',
      'FI',
      'FR',
      'GR',
      'HR',
      'IE',
      'IT',
      'LT',
      'LU',
      'LV',
      'MT',
      'NL',
      'PT',
      'SI',
      'SK',
      'BG',
    ].includes(region)
  )
    return 'eur';
  return 'usd';
}
export function Social() {
  const { beat, next } = useStory(),
    size = useArtSize(),
    motion = useMotion();
  const forms: ShapeName[] = [
    'people',
    'phonePeople',
    'phone',
    'trophy',
    'trophy',
    currency(),
    'rings',
  ];
  const effects: Effect[] = [
    'pulse',
    'morph',
    'pulse',
    'swirl',
    'fall',
    'swirl',
    'rotate',
  ];
  return (
    <Scene advance={next}>
      <TypewriterCaption text={copy.social[beat]} />
      <View style={{ width: size, height: size }}>
        <ParticleField
          size={size}
          mode={effects[beat]}
          targetShape={shape(forms[beat])}
        />
        {beat === 6 && (
          <Animated.View
            entering={
              motion ? ZoomIn.springify().damping(14) : FadeIn.duration(180)
            }
            style={styles.overlay}
          >
            <Mascot size={size * 0.44} expression="happy" />
          </Animated.View>
        )}
      </View>
    </Scene>
  );
}
