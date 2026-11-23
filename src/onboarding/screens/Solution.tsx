import React from 'react';
import { ParticleField } from '../components/ParticleField';
import { TypewriterCaption } from '../components/Caption';
import { Scene, useArtSize } from '../components/Stage';
import { shape } from '../shapes';
import { useStory } from '../store/story';
import { projection } from '../store/model';
import { copy } from '../strings';
export function Solution() {
  const { answers, limit, beat, next } = useStory(),
    size = useArtSize(),
    p = projection(answers, limit);
  const lines = copy.solution(Math.round(p.regained), p.saved);
  return (
    <Scene advance={next} footnote={copy.estimate}>
      <TypewriterCaption
        text={lines[beat]}
        previous={beat === 2 ? lines[1] : undefined}
      />
      <ParticleField
        size={size}
        targetShape={
          beat === 0 ? shape('calendar', p.regained / 365) : shape('calm')
        }
        mode={beat === 1 ? 'swirl' : 'pulse'}
      />
    </Scene>
  );
}
