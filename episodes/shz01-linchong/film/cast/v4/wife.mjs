// 林娘子 (1.58 m) — traced like 林冲 (seeds 7103 back / 7105 3/4 back, art_log.md). Pink jacket, white skirt,
// high bun with a gold pin. Her face is never shown: only the back and the 3/4 back (face turned away) exist.
// draw({ view: 'back' | 'back34', x, y, height (px for 1.58 m), flip, pose, col: { jacket } })
import { render, headBox } from './traced.mjs';
export const P = {
  stature: 1.58, heads: 7.0, noFace: true,
  fam: { jacket: (h, s, l) => (h > 340 || h < 10) && s > 0.4 && l > 0.6 && l < 0.95 },
};
const GEO = { back: { chin: 320, head: 192, skull: 128, px: 390, s: 1 }, back34: { chin: 325, head: 193, skull: 132, px: 395, s: 1 } };
const V = { back: 'wife_back', back34: 'wife_back34' };
const PV = (v) => ({ ...P, geo: GEO[v] });
export const draw = (o = {}) => { const v = V[o.view] ? o.view : 'back'; return render(V[v], PV(v), o); };
export const head = (o = {}) => { const v = V[o.view] ? o.view : 'back'; return headBox(V[v], PV(v), o); };
