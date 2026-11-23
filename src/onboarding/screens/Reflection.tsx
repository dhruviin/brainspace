import React, { useMemo } from 'react';
import { TypewriterCaption } from '../components/Caption';
import { ParticleField } from '../components/ParticleField';
import { Scene, useArtSize } from '../components/Stage';
import { useStory } from '../store/story';
import { symptoms } from '../store/model';
import { copy } from '../strings';
import { shape, type Dot, type ShapeName } from '../shapes';
import { ink } from '../theme';
const cache = new Map<string, Dot[]>();
function portrait(icon: ShapeName) {
  const previous = cache.get(icon);
  if (previous) return previous;
  const head = shape('head').map((p) => ({
    ...p,
    x: 128 + (p.x - 128) * 0.83,
    y: 40 + p.y * 0.83,
    color: p.x > 145 ? ink.textPrimary : '#727A75',
  }));
  const glyph = shape(icon).map((p) => ({
    ...p,
    x: 127 + (p.x - 128) * 0.56,
    y: 43 + (p.y - 128) * 0.56,
    color: ink.danger,
  }));
  const dots = [
    ...head.slice(0, 1550),
    ...glyph.filter(
      (_, i) => i % Math.max(1, Math.ceil(glyph.length / 120)) === 0,
    ),
  ];
  cache.set(icon, dots);
  return dots;
}
export function Reflection() {
  const { answers, beat, next } = useStory(),
    size = useArtSize();
  const chosen = symptoms(answers),
    keys = [...(chosen.length ? chosen : ['skip']), 'last'];
  const key = keys[
    Math.min(beat, keys.length - 1)
  ] as keyof typeof copy.symptoms;
  const [caption, icon] = copy.symptoms[key] ?? copy.symptoms.skip;
  const target = useMemo(() => portrait(icon as ShapeName), [icon]);
  return (
    <Scene advance={next} button={key === 'last'}>
      <TypewriterCaption text={caption} />
      <ParticleField
        size={size}
        targetShape={target}
        mode={key === 'last' ? 'dissolve' : 'pulse'}
      />
    </Scene>
  );
}
