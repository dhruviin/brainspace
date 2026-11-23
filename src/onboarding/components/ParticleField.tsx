import React, { useEffect, useMemo } from 'react';
import { View } from 'react-native';
import {
  Atlas,
  Canvas,
  Group,
  Skia,
  useRectBuffer,
  useRSXformBuffer,
  vec,
} from '@shopify/react-native-skia';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnUI } from 'react-native-worklets';
import { BUDGET, type Dot, palette, SIDE } from '../shapes';
import { useMotion } from '../hooks/useMotion';
import { timing } from '../theme';

export type Effect =
  'morph' | 'swirl' | 'pulse' | 'rotate' | 'fall' | 'dissolve' | 'scatter';
const stride = 4,
  cell = 8,
  shades = 9;
function stampTexture() {
  const surface = Skia.Surface.MakeOffscreen(
    cell * shades,
    cell * palette.length ** 2,
  );
  if (!surface) return null;
  const canvas = surface.getCanvas(),
    paint = Skia.Paint();
  paint.setAntiAlias(true);
  palette.forEach((a, i) =>
    palette.forEach((b, j) => {
      const start = Skia.Color(a),
        end = Skia.Color(b);
      for (let k = 0; k < shades; k++) {
        paint.setColor(
          new Float32Array(
            start.map((v, c) => v + ((end[c] - v) * k) / (shades - 1)),
          ),
        );
        canvas.drawCircle(
          k * cell + 4,
          (i * palette.length + j) * cell + 4,
          3.2,
          paint,
        );
      }
    }),
  );
  surface.flush();
  return surface.makeImageSnapshot();
}
let atlas: ReturnType<typeof stampTexture> | undefined;
function getAtlas() {
  return atlas ?? (atlas = stampTexture());
}
function packed(dots: Dot[], count: number, mode: Effect, origin = false) {
  const buf = new Float32Array(count * stride);
  for (let i = 0; i < count; i++) {
    const a = i * 2.3999632,
      star = i >= count - 28;
    const p = dots[i % Math.max(1, dots.length)],
      k = i * stride;
    let x = p?.x ?? 128,
      y = p?.y ?? 128,
      size = i < dots.length ? (p?.size ?? 0) : 0;
    if (origin) {
      x = 128 + Math.cos(a) * 162;
      y = 128 + Math.sin(a) * 162;
      size = 0.1;
    } else if (mode === 'fall') {
      x += (x < 128 ? -1 : 1) * (13 + (i % 13));
      y += 45 + (i % 19) * 2;
    } else if (mode === 'dissolve') {
      x += Math.sin(a) * 34;
      y -= 54 + (i % 95);
      size *= i % 5 === 0 ? 0.5 : 0.08;
    } else if (mode === 'scatter') {
      x = 128 + (x - 128) * 1.24;
      y = 128 + (y - 128) * 1.24;
    }
    if (star) {
      x = (i * 73) % 251;
      y = (i * 101) % 249;
      size = 0.43 + (i % 3) * 0.16;
    }
    buf[k] = x;
    buf[k + 1] = y;
    buf[k + 2] = size;
    buf[k + 3] = star
      ? 4
      : Math.max(0, palette.indexOf(p?.color ?? palette[0]));
  }
  return buf;
}
export function ParticleField({
  targetShape,
  particleCount = BUDGET,
  mode = 'morph',
  size,
}: {
  targetShape: Dot[];
  particleCount?: number;
  mode?: Effect;
  size: number;
}) {
  const motion = useMotion(),
    count = Math.min(BUDGET, Math.max(32, particleCount));
  const initial = useMemo(() => packed([], count, 'swirl', true), [count]);
  const from = useSharedValue(initial),
    to = useSharedValue(initial),
    t = useSharedValue(1),
    cycle = useSharedValue(0);
  const dest = useMemo(
    () => packed(targetShape, count, mode),
    [targetShape, count, mode],
  );
  const texture = useMemo(() => getAtlas(), []);
  useEffect(() => {
    scheduleOnUI(() => {
      'worklet';
      const v = t.value,
        prev = from.value,
        last = to.value,
        snapshot = new Float32Array(last.length);
      for (let k = 0; k < last.length; k++)
        snapshot[k] = k % 4 === 3 ? last[k] : prev[k] + (last[k] - prev[k]) * v;
      from.value = motion ? snapshot : dest;
      to.value = dest;
      t.value = 0;
      t.value = withTiming(1, {
        duration: motion ? timing.morph : 180,
        easing: Easing.inOut(Easing.cubic),
      });
    });
  }, [dest, motion, from, t, to]);
  useEffect(() => {
    cycle.value = 0;
    if (motion && (mode === 'pulse' || mode === 'rotate'))
      cycle.value = withRepeat(
        withTiming(1, {
          duration: mode === 'rotate' ? 15000 : 2400,
          easing: mode === 'rotate' ? Easing.linear : Easing.inOut(Easing.sin),
        }),
        -1,
        mode === 'pulse',
      );
    return () => cancelAnimation(cycle);
  }, [cycle, mode, motion]);
  const shade = useDerivedValue(() => Math.round(t.value * (shades - 1)));
  const sprites = useRectBuffer(count, (r, i) => {
    'worklet';
    const k = i * stride + 3;
    r.setXYWH(
      shade.value * cell,
      (from.value[k] * palette.length + to.value[k]) * cell,
      cell,
      cell,
    );
  });
  const transforms = useRSXformBuffer(count, (out, i) => {
    'worklet';
    const k = i * stride,
      p = t.value,
      a = from.value,
      b = to.value;
    const z = (a[k + 2] + (b[k + 2] - a[k + 2]) * p) / 3.2;
    let x = a[k] + (b[k] - a[k]) * p,
      y = a[k + 1] + (b[k + 1] - a[k + 1]) * p;
    if (mode === 'swirl' && motion) {
      const arc = 4 * p * (1 - p) * 0.55;
      x -= (a[k + 1] - 128) * arc;
      y += (a[k] - 128) * arc;
    }
    if (mode === 'fall' && motion) y = a[k + 1] + (b[k + 1] - a[k + 1]) * p * p;
    out.set(z, 0, x - 4 * z, y - 4 * z);
  });
  const animated = useAnimatedStyle(() => ({
    opacity: motion ? 1 : 0.38 + 0.62 * t.value,
    transform: [
      { rotate: (mode === 'rotate' ? cycle.value * 360 : 0) + 'deg' },
      { scale: mode === 'pulse' ? 1 + cycle.value * 0.025 : 1 },
    ],
  }));
  return (
    <View
      pointerEvents="none"
      accessible={false}
      style={{ width: size, height: size, alignSelf: 'center' }}
    >
      <Animated.View style={[{ flex: 1 }, animated]}>
        <Canvas style={{ flex: 1 }}>
          <Group origin={vec(0, 0)} transform={[{ scale: size / SIDE }]}>
            <Atlas image={texture} sprites={sprites} transforms={transforms} />
          </Group>
        </Canvas>
      </Animated.View>
    </View>
  );
}
