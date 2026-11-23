import {
  AlphaType,
  ColorType,
  Skia,
  type SkImage,
} from '@shopify/react-native-skia';
import { ink } from '../theme';

export type Dot = { x: number; y: number; color: string; size: number };
export const SIDE = 256;
export const BUDGET = 1700;
const paper = '#DBDFDC';
export const palette = [
  paper,
  ink.accent,
  ink.warning,
  ink.danger,
  '#727A75',
  '#467C58',
  '#FFFFFF',
  '#ED655D',
];
const cache = new Map<string, Dot[]>();
const tau = Math.PI * 2;
function noise(i: number) {
  const raw = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return raw - Math.floor(raw);
}
const dot = (x: number, y: number, color: string, i: number): Dot => ({
  x,
  y,
  color,
  size: 0.62 + noise(i + 9) * 0.84,
});
function grid(test: (x: number, y: number) => string | false, pitch = 3.3) {
  const result: Dot[] = [];
  for (let y = 7; y < 250; y += pitch)
    for (let x = 7; x < 250; x += pitch) {
      const tint = test(x, y);
      if (tint) result.push(dot(x, y, tint, result.length));
    }
  return result;
}
export function samplePath(pathData: string, color = paper, pitch = 3.3) {
  const path = Skia.Path.MakeFromSVGString(pathData);
  return path ? grid((x, y) => path.contains(x, y) && color, pitch) : [];
}
export function sampleMask(image: SkImage, color = paper, pitch = 3.3) {
  const w = image.width(),
    h = image.height();
  const data = image.readPixels(0, 0, {
    width: w,
    height: h,
    colorType: ColorType.RGBA_8888,
    alphaType: AlphaType.Unpremul,
  });
  if (!data) return [];
  const scale = 224 / Math.max(w, h);
  return grid((x, y) => {
    const u = Math.floor((x - 128) / scale + w / 2),
      v = Math.floor((y - 128) / scale + h / 2);
    return (
      u >= 0 &&
      v >= 0 &&
      u < w &&
      v < h &&
      data[(v * w + u) * 4 + 3] > 96 &&
      color
    );
  }, pitch);
}
// TODO(art): replace these 256-unit fallback silhouettes with approved transparent PNG masks via sampleMask.
const paths = {
  head: 'M75 226 Q85 195 71 171 C18 97 67 42 124 40 Q176 36 193 84 L196 105 L214 134 Q216 140 199 143 L200 155 L193 159 L198 165 L192 174 Q194 190 172 189 L149 187 L148 223 Z',
  trophy:
    'M78 52 H178 V68 H207 Q213 121 167 133 Q157 151 138 157 V182 Q138 193 155 195 L166 201 V212 H90 V201 L101 195 Q118 193 118 182 V157 Q97 151 89 133 Q43 122 49 68 H78 Z M78 80 H61 Q62 107 82 116 Z M177 80 L173 116 Q194 105 195 80 Z',
  mascot:
    'M39 131 C39 73 76 39 128 39 C182 39 216 80 217 134 C218 184 184 216 129 218 C77 216 39 179 39 131 Z',
  bolt: 'M143 80 L99 135 H124 L115 177 L161 117 H135 Z',
  thought:
    'M84 118 Q84 89 128 89 Q171 89 171 118 Q170 145 132 147 L109 161 L114 146 Q84 142 84 118 Z',
  moon: 'M155 91 A38 38 0 1 0 161 155 A43 43 0 0 1 155 91 Z',
  heart: 'M128 165 L93 134 C68 102 108 79 128 107 C147 79 188 102 163 134 Z',
  time: 'M100 88 H156 V98 Q156 115 137 127 Q156 141 156 158 V168 H100 V158 Q100 141 119 127 Q100 115 100 98 Z',
  usd: 'M122 52 H134 V69 Q155 71 171 82 L163 98 Q141 83 123 88 Q95 94 113 111 L150 125 Q179 138 167 165 Q159 180 135 185 V204 H122 V186 Q98 185 79 170 L90 154 Q114 173 135 166 Q159 158 143 144 L106 129 Q78 116 88 90 Q95 73 122 69 Z',
  inr: 'M78 65 H179 L169 80 H148 Q153 87 154 93 H173 L163 108 H153 Q147 139 113 144 L164 195 H136 L79 137 V128 H100 Q127 128 131 108 H76 L86 93 H130 Q123 80 104 80 H68 Z',
  eur: 'M176 70 L169 90 Q126 65 105 114 H153 L148 126 H101 V136 H144 L139 148 H105 Q122 184 169 163 L175 183 Q103 214 82 148 H65 L70 136 H80 V126 H66 L72 114 H82 Q100 47 176 70 Z',
};
const outline = (x: number, y: number, w: number, h: number, r: number) => {
  const u = Math.abs(x - 128) - (w / 2 - r),
    v = Math.abs(y - 128) - (h / 2 - r);
  return (
    Math.abs(
      Math.hypot(Math.max(u, 0), Math.max(v, 0)) +
        Math.min(Math.max(u, v), 0) -
        r,
    ) < 1.95
  );
};
function crowd(x: number, y: number) {
  if (x < 71 || x > 185 || y < 59 || y > 196) return false;
  const col = Math.floor((x - 71) / 16),
    row = Math.floor((y - 59) / 20);
  const u = ((x - 71) % 16) - 7.5,
    v = (y - 59) % 20;
  return (
    (Math.hypot(u, v - 4) < 3 ||
      (v > 8 && v < 16 && Math.abs(u) < 5 - (v - 8) * 0.14)) &&
    (col === 3 && row === 3 ? ink.accent : paper)
  );
}
export type ShapeName =
  | keyof typeof paths
  | 'phone'
  | 'rings'
  | 'ring'
  | 'week'
  | 'month'
  | 'disc'
  | 'spinner'
  | 'people'
  | 'phonePeople'
  | 'calendar'
  | 'calm'
  | 'focus'
  | 'confetti'
  | 'chart';
export function shape(name: ShapeName, fraction = 0.7): Dot[] {
  const key = name + ':' + fraction;
  const cached = cache.get(key);
  if (cached) return cached;
  let points: Dot[];
  if (name in paths)
    points = samplePath(
      paths[name as keyof typeof paths],
      ['usd', 'eur', 'inr'].includes(name) ? ink.danger : paper,
    );
  else if (name === 'phone' || name === 'phonePeople' || name === 'people') {
    points = grid((x, y) => {
      if (
        name !== 'people' &&
        (outline(x, y, 132, 216, 20) ||
          (y > 29 && y < 33 && Math.abs(x - 128) < 17))
      )
        return paper;
      if (name !== 'phone') return crowd(x, y);
      const wave = 120 + 28 * Math.sin((x - 128) / 23) + 10 * Math.cos(y / 12);
      return (
        x > 68 &&
        x < 188 &&
        y > 48 &&
        y < 218 &&
        Math.abs(y - wave) < 28 &&
        Math.floor((y - wave + 50) / 5) % 2 === 0 &&
        ink.accent
      );
    }, 2.15);
  } else if (name === 'calendar') {
    points = grid((x, y) => {
      const u = x - 19,
        v = y - 58;
      if (
        u < 0 ||
        v < 0 ||
        u >= 220 ||
        v >= 138 ||
        u % 55 >= 44 ||
        v % 46 >= 34
      )
        return false;
      const m = Math.floor(v / 46) * 4 + Math.floor(u / 55);
      const day = Math.floor((v % 46) / 7) * 7 + Math.floor((u % 55) / 6.6);
      return m * 30 + day < Math.round(fraction * 365) ? ink.accent : '#727A75';
    }, 6.3);
  } else if (name === 'calm') {
    points = samplePath(paths.head).map((p) => ({
      ...p,
      color: Math.hypot(p.x - 157, p.y - 93) < 25 ? ink.accent : p.color,
    }));
  } else if (name === 'chart') {
    points = grid((x, y) => {
      if (x < 21 || x > 235) return false;
      const t = (x - 21) / 214,
        line = 72 + (1 - fraction) * 145 * t * t * (3 - 2 * t);
      return Math.abs(y - line) < 2.4
        ? ink.accent
        : y > line + 6 && y < 191 && Math.round(y) % 3 === 0 && '#467C58';
    }, 3.3);
  } else if (name === 'focus') {
    points = Array.from({ length: 225 }, (_, i) => {
      const a = (i / 225) * tau * 3,
        r = (i / 225) * 37;
      return dot(128 + Math.cos(a) * r, 128 + Math.sin(a) * r, ink.danger, i);
    });
  } else {
    const bands = name === 'rings',
      loose = name === 'confetti',
      spin = name === 'spinner';
    const idx = ['ring', 'week', 'month', 'disc'].indexOf(name);
    const n = loose
      ? 360
      : spin
        ? 22
        : bands
          ? 490
          : [420, 790, 1190, 1640][Math.max(0, idx)];
    points = Array.from({ length: n }, (_, i) => {
      const a = bands ? (i * tau) / 97 : spin ? (i * tau) / n : i * 2.3999632;
      const r = bands
        ? 62 + 12 * Math.floor(i / 97)
        : spin
          ? 24
          : loose
            ? 124 * Math.sqrt(noise(i))
            : Math.sqrt(
                1 -
                  (1 - [0.78, 0.61, 0.39, 0.12][Math.max(idx, 0)] ** 2) *
                    noise(i),
              ) * [83, 94, 105, 113][Math.max(idx, 0)];
      const color = loose
        ? palette[i % palette.length]
        : bands
          ? i % 97 < 14
            ? ink.accent
            : '#727A75'
          : idx <= 0
            ? ink.accent
            : idx === 1
              ? '#467C58'
              : idx === 2
                ? '#ED655D'
                : ink.danger;
      return dot(128 + Math.cos(a) * r, 128 + Math.sin(a) * r, color, i);
    });
  }
  // Evenly thin dense masks. Keep the same stable atlas size through a morph.
  if (points.length > BUDGET - 28)
    points = Array.from(
      { length: BUDGET - 28 },
      (_, i) => points[Math.floor((i * points.length) / (BUDGET - 28))],
    );
  cache.set(key, points);
  return points;
}
