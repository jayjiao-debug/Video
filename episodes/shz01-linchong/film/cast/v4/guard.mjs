// 公人 convoy guard (1.72 m) — traced like 林冲 (seeds 7601 front / 7602 3/4 walking, art_log.md). Black-grey
// tunic, red belt, black cap with a red knob, 水火棍 (the traced staff is recoloured half red / half black).
// Face: 林冲's construction with jaw stubble and a short moustache, suspicious knitted brows.
// draw({ view: 'front' | 'side' (3/4, walking), x, y, height (px for 1.72 m), flip, expr, pose })
import { render, headBox } from './traced.mjs';
const red = (h, s, l) => (h < 15 || h > 345) && s > 0.4 && l < 0.4;
export const P = {
  stature: 1.72, heads: 7.5,
  fam: { coat: (h, s, l) => s < 0.16 && l > 0.15 && l < 0.3 },
  face: { hair: 'stubble' },
  expr: { brow: -0.55, eye: 0.85, look: [0.1, 0], mouth: -0.2 },
};
const SPLIT = { front: { test: red, xMax: 205, yMid: 760, col: '#2a2322', ref: '#620c0b' }, side: { test: red, xMax: 205, yMid: 770, col: '#2a2322', ref: '#7b0a0f' } };
const V = { front: 'guard_front', side: 'guard_tq', tq: 'guard_tq' };
const PV = (v) => ({ ...P, split: SPLIT[v === 'tq' ? 'side' : v] });
export const draw = (o = {}) => render(V[o.view || 'front'], PV(o.view || 'front'), o);
export const head = (o = {}) => headBox(V[o.view || 'front'], PV(o.view || 'front'), o);
