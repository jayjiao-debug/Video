// 高衙内 (1.70 m): muted mauve robe with extra-wide sleeves, black soft cap with a small dusty-pink flower. Smirk.
// draw({view:'front'|'side', x, y, height (px for 1.70 m), flip, expr, pose}) — expr {smirk, eye, brow, mouth}
import { figure, blob } from './base.mjs';
export const SPEC = {
  name: 'gao', heads: 7.2,
  robe: { base: '#8a7280', shade: '#6f5a67', fold: '#5f4c58' }, inner: '#e6dfd6',
  sash: { col: '#4e3f47', tails: true }, sleeve: 'wide', sleeveW: 1.18, hands: 'hidden',
  expr: { smirk: 0.7, eye: 0.6, mouth: 0.15 },
  head(view) {
    const cap = '#2a2426', fl = '#c09aa4', flc = '#8a6f7a';
    if (view === 'side') return `<path d="${blob([[-0.38, -6.8], [-0.3, -7.12], [0.05, -7.36], [0.38, -7.12], [0.44, -6.78], [0.3, -6.7], [-0.1, -6.74]], 0.4)}" fill="${cap}"/>` +
      `<circle cx="0.47" cy="-6.86" r="0.08" fill="${cap}"/>` + flower(0.18, -7.12, fl, flc);
    return `<path d="${blob([[-0.4, -6.74], [-0.36, -7.08], [0, -7.38], [0.36, -7.08], [0.4, -6.74], [0, -6.84]], 0.4)}" fill="${cap}"/>` + flower(-0.3, -7.02, fl, flc);
  },
};
function flower(x, y, c, cc) {
  let s = '';
  for (let i = 0; i < 5; i++) { const a = (i / 5) * Math.PI * 2; s += `<circle cx="${(x + Math.cos(a) * 0.065).toFixed(3)}" cy="${(y + Math.sin(a) * 0.065).toFixed(3)}" r="0.05" fill="${c}"/>`; }
  return s + `<circle cx="${x}" cy="${y}" r="0.035" fill="${cc}"/>`;
}
export const draw = (o = {}) => figure(SPEC, { id: 'gao', ...o });
