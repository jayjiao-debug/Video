// 高衙内 (1.70 m) — traced like 林冲 (references seeds 7201 front / 7202 3/4, art_log.md). Mauve-magenta robe,
// black soft cap with a pink peony. Face: 林冲's construction, no facial hair, thin arched brows, smirk.
// draw({ view: 'front' | 'side' (3/4), x, y, height (px for 1.70 m), flip, expr, pose, col: { robe } })
import { render, headBox } from './traced.mjs';
export const P = {
  stature: 1.70, heads: 7.5,
  fam: { robe: (h, s, l) => h >= 295 && h <= 350 && s > 0.2 && l > 0.18 && l < 0.6 },
  face: { hair: 'none', smirk: 0.9, smirkSide: 1, browTh: 0.72, browArch: 1.7 },
  expr: { brow: 0.15, eye: 0.88, look: [0.15, 0.05], mouth: 0.25 },
};
const V = { front: 'gao_front', side: 'gao_tq', tq: 'gao_tq' };
// the 3/4 plate came out pinker: its main robe tone is mapped onto the front plate's mid tone (one mauve-magenta)
const PV = (v) => (V[v] === 'gao_tq' ? { ...P, fam: { ...P.fam, base: { robe: '#a15783' } }, col: { robe: '#7a3569' } } : P);
export const draw = (o = {}) => render(V[o.view || 'front'], PV(o.view || 'front'), o);
export const head = (o = {}) => headBox(V[o.view || 'front'], PV(o.view || 'front'), o);
