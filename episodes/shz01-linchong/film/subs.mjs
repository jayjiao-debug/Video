// Subtitles from vo_timeline.json (measured narration clips). Engine standard (storyboard_v3 §1):
// Noto Sans CJK SC Bold 64 px, white, soft dark edge + feathered shade, gold key words, ≤ 16 字 per row,
// band y 820–960, trailing full-width punctuation pulled back ½ em for optical centring.
import fs from 'fs';
import { clamp, f2 } from './lib.mjs';

const TL = JSON.parse(fs.readFileSync(new URL('../vo_timeline.json', import.meta.url), 'utf8'));
// Lines whose last words are written on screen as brush calligraphy in sync with the voice: the subtitle
// carries only the first phrases (measured pauses inside the clips; see film/timing.md).
const OVERRIDE = {
  V32: { text: '娘子被逼，自缢身死，', end: 112.0 },
  V37: { text: '你这一辈子，都在等那句：', end: 134.05 },
};
const GOLD = { V01: ['休书'], V05: ['林冲'], V13: ['忍'], V15: ['忍'], V17: ['忍'], V18: ['忍'], V19: ['依旧夫妻完聚'], V27: ['忍'] };
const PUNCT = '，。？！：；、—';

export const LINES = TL.lines.map((l, i, a) => {
  const o = OVERRIDE[l.id] || {};
  const next = a[i + 1];
  const end = o.end ?? Math.min(l.end + 0.4, next ? next.start - 0.12 : l.end + 1.2);
  return { id: l.id, text: o.text || l.text, a: l.start - 0.03, b: end };
});

/** Split a line into rows of ≤ max characters, breaking after punctuation when possible. */
export function rows(text, max = 16) {
  if ([...text].length <= max) return [text];
  const ch = [...text];
  let best = -1;
  for (let i = 1; i < ch.length - 1; i++) {
    if (PUNCT.includes(ch[i]) && i + 1 <= max && ch.length - (i + 1) <= max) {
      if (best < 0 || Math.abs(i + 1 - ch.length / 2) < Math.abs(best - ch.length / 2)) best = i + 1;
    }
  }
  if (best < 0) best = Math.ceil(ch.length / 2);
  // keep a dash pair together
  if (ch[best - 1] === '—' && ch[best] === '—') best++;
  return [ch.slice(0, best).join(''), ...rows(ch.slice(best).join(''), max)];
}

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
function rowSVG(row, y, gold, fs = 64) {
  // gold key words as tspans
  let parts = [[row, false]];
  for (const g of gold) {
    parts = parts.flatMap(([s, isG]) => {
      if (isG || !s.includes(g)) return [[s, isG]];
      const out = [];
      s.split(g).forEach((seg, i, arr) => { if (seg) out.push([seg, false]); if (i < arr.length - 1) out.push([g, true]); });
      return out;
    });
  }
  const last = [...row].pop();
  const dx = PUNCT.includes(last) ? fs * 0.25 : 0;
  const body = parts.map(([s, g]) => (g ? `<tspan fill="#F3C969">${esc(s)}</tspan>` : esc(s))).join('');
  return `<text x="${f2(960 + dx)}" y="${f2(y)}" text-anchor="middle" dominant-baseline="central" font-family="Noto Sans CJK SC" font-weight="700" font-size="${fs}" fill="#FFFDF6" stroke="#140E0A" stroke-opacity="0.55" stroke-width="7" stroke-linejoin="round" paint-order="stroke" letter-spacing="2">${body}</text>`;
}

export const SUB_DEFS = `<radialGradient id="subshade" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#0B0806" stop-opacity="0.42"/><stop offset="0.6" stop-color="#0B0806" stop-opacity="0.22"/><stop offset="1" stop-color="#0B0806" stop-opacity="0"/></radialGradient>` +
  `<filter id="subsoft" x="-10%" y="-40%" width="120%" height="180%"><feDropShadow dx="0" dy="2" stdDeviation="5" flood-color="#000" flood-opacity="0.55"/></filter>`;

/** Subtitle overlay for global time t ('' when none). opts.yc moves the band centre (default 890). */
export function subtitle(t, opts = {}) {
  const l = LINES.find((x) => t >= x.a && t < x.b);
  if (!l) return '';
  const fin = clamp((t - l.a) / (4 / 30)), fout = clamp((l.b - t) / (5 / 30));
  const op = Math.min(fin, fout);
  const R = rows(l.text);
  const yc = opts.yc ?? 890, lh = 80;
  const y0 = yc - ((R.length - 1) * lh) / 2;
  const wmax = Math.max(...R.map((r) => [...r].length)) * 66 + 120;
  let s = `<ellipse cx="960" cy="${yc}" rx="${f2(wmax / 2 + 60)}" ry="${f2(R.length * 52 + 34)}" fill="url(#subshade)"/>`;
  s += `<g filter="url(#subsoft)">${R.map((r, i) => rowSVG(r, y0 + i * lh, GOLD[l.id] || [])).join('')}</g>`;
  return `<g data-layer="text-sub" data-z="900" data-sub="${l.id}" opacity="${f2(op)}">${s}</g>`;
}
