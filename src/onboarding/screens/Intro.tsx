import React, { useCallback, useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import {
  AndroidImportance,
  getPermissionsAsync,
  setNotificationChannelAsync,
  requestPermissionsAsync,
} from 'expo-notifications';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import { ParticleField } from '../components/ParticleField';
import { Mascot } from '../components/Controls';
import { Scene, styles, useArtSize } from '../components/Stage';
import { TypewriterCaption } from '../components/Caption';
import { useStoryTimer } from '../hooks/useStoryTimer';
import { useMotion } from '../hooks/useMotion';
import { shape } from '../shapes';
import { useStory } from '../store/story';
import { copy } from '../strings';
import { ink, face, timing } from '../theme';

export function Intro() {
  const [phase, setPhase] = useState(0),
    size = useArtSize(),
    motion = useMotion();
  const next = useStory((s) => s.next);
  useEffect(() => {
    let live = true;
    const timer = setTimeout(async () => {
      const s = useStory.getState();
      if (!s.prompted) {
        s.markPrompt();
        try {
          const existing = await getPermissionsAsync();
          if (!existing.granted && existing.canAskAgain) {
            await setNotificationChannelAsync('focus-reminders', {
              name: copy.channel,
              importance: AndroidImportance.DEFAULT,
            });
            await requestPermissionsAsync();
          }
        } catch {
          /* Android without notification support can still complete the story. */
        }
      }
      if (live) setPhase(1);
    }, 1200);
    return () => {
      live = false;
      clearTimeout(timer);
    };
  }, []);
  const advance = useCallback(() => setPhase(Math.min(4, phase + 1)), [phase]);
  useStoryTimer(
    phase > 0 && phase < 4,
    phase === 1 ? 900 : timing.line,
    advance,
  );
  const text =
    phase === 0 ? copy.introPreview : copy.intro[Math.max(0, phase - 2)];
  return (
    <Scene advance={next} button disabled={phase < 4} label={copy.okay}>
      <View
        style={{
          width: size,
          height: size,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ParticleField
          size={size}
          targetShape={shape(
            phase === 0 ? 'phone' : phase === 1 ? 'mascot' : 'rings',
          )}
          mode={phase === 0 ? 'morph' : phase === 1 ? 'swirl' : 'rotate'}
        />
        {phase === 0 && (
          <View
            style={[
              styles.overlay,
              { justifyContent: 'flex-start', paddingTop: size * 0.23 },
            ]}
          >
            <View
              style={{
                borderWidth: 1,
                borderColor: ink.accent,
                borderRadius: 15,
                paddingHorizontal: 13,
                paddingVertical: 2,
                backgroundColor: ink.bg,
              }}
            >
              <Text style={{ color: ink.textPrimary, fontFamily: face.bold }}>
                {copy.previewNumber}
              </Text>
            </View>
          </View>
        )}
        {phase >= 2 && (
          <Animated.View
            entering={
              motion ? ZoomIn.springify().damping(17) : FadeIn.duration(150)
            }
            style={styles.overlay}
          >
            <Mascot size={size * 0.41} expression="wave" />
          </Animated.View>
        )}
      </View>
      <View
        style={{
          alignSelf: 'stretch',
          minHeight: 105,
          justifyContent: 'center',
        }}
      >
        <TypewriterCaption
          text={text}
          previous={phase > 2 ? copy.intro[phase - 3] : undefined}
        />
      </View>
    </Scene>
  );
}
