// 张教头 (1.66 m, about 60) — traced like 林冲 (seeds 7401 front / 7402 3/4, art_log.md). Brown robe, dark brown
// head wrap; the traced grey hair, brow tails, moustache and long beard are kept. Face: 林冲's construction with
// grey brows, crow's feet and an under-eye fold.
// draw({ view: 'front' | 'side' (3/4), x, y, height (px for 1.66 m), flip, expr, pose, col: { robe } })
import { render, headBox } from './traced.mjs';
export const P = {
  stature: 1.66, heads: 7.0,
  fam: { robe: (h, s, l) => h >= 10 && h <= 35 && s > 0.18 && s < 0.5 && l > 0.3 && l < 0.55 },
  face: { hair: 'none', crow: true, browTh: 1.1 },
  faceCol: { brow: '#8e8d8a' },
  expr: { brow: 0.3, eye: 0.82, look: [0, 0.1], mouth: 0.15 },
};
const V = { front: 'zhang_front', side: 'zhang_tq', tq: 'zhang_tq' };
export const draw = (o = {}) => render(V[o.view || 'front'], P, o);
export const head = (o = {}) => headBox(V[o.view || 'front'], P, o);
