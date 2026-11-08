// 代笔先生 the hired letter-writer (1.68 m) — traced like 林冲 (seeds 7501 front / 7502 3/4, art_log.md).
// Plain grey robe, small black cap. Face: 林冲's construction with a small neat moustache, calm.
// draw({ view: 'front' | 'side' (3/4), x, y, height (px for 1.68 m), flip, expr, pose })
import { render, headBox } from './traced.mjs';
export const P = {
  stature: 1.68, heads: 7.5,
  fam: { robe: (h, s, l) => s < 0.06 && l > 0.45 && l < 0.7 },
  face: { hair: 'neat' },
  expr: { brow: 0.05, eye: 0.85, look: [0, 0.15], mouth: 0 },
};
const V = { front: 'scribe_front', side: 'scribe_tq', tq: 'scribe_tq' };
export const draw = (o = {}) => render(V[o.view || 'front'], P, o);
export const head = (o = {}) => headBox(V[o.view || 'front'], P, o);
