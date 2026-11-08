// 陆谦 (1.70 m) — traced like 林冲 (seeds 7301 front / 7303 3/4, art_log.md). Purple-grey robe, black cap.
// Face: 林冲's construction with a thin moustache and smiling eyes (the friendly face of the betrayer).
// draw({ view: 'front' | 'side' (3/4), x, y, height (px for 1.70 m), flip, expr, pose, col: { robe } })
import { render, headBox } from './traced.mjs';
export const P = {
  stature: 1.70, heads: 7.5,
  fam: { robe: (h, s, l) => h >= 265 && h <= 335 && s > 0.1 && s < 0.4 && l > 0.15 && l < 0.45 },
  face: { hair: 'thin', smile: 0.8 },
  expr: { brow: 0.2, eye: 0.92, look: [0, 0.05], mouth: 0.35 },
};
const V = { front: 'lu_front', side: 'lu_tq', tq: 'lu_tq' };
export const draw = (o = {}) => render(V[o.view || 'front'], P, o);
export const head = (o = {}) => headBox(V[o.view || 'front'], P, o);
