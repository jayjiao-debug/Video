// 林冲's wife 张氏 (1.58 m): NEVER her face — back view and 3/4 rear only. 高髻 with a hairpin, muted pink 褙子 over a long skirt.
// draw({view:'back'|'back34', x, y, height (px for 1.58 m), flip}) — 'front'/'side' fall back to 'back34'.
import { figure, blob } from './base.mjs';
export const SPEC = {
  name: 'wife', heads: 7.0,
  robe: { base: '#cba7ab', shade: '#b08d92', fold: '#9c7c81' }, inner: '#eee6dc', hair: '#1c1918',
  sash: { col: '#9c7c81', tails: false }, sleeve: 'wide', hands: 'hidden',
  head(view) {
    const h = '#1c1918', pin = '#b39a62';
    const bun = `<path d="${blob([[-0.26, -7.12], [-0.2, -7.52], [0, -7.66], [0.2, -7.52], [0.26, -7.12], [0, -7.04]], 0.45)}" fill="${h}"/>`;
    const pinS = `<path d="M-0.34,-7.38 L0.36,-7.5" stroke="${pin}" stroke-width="0.04" stroke-linecap="round"/><circle cx="0.37" cy="-7.5" r="0.05" fill="${pin}"/>`;
    const side = view === 'back34' ? `<path d="${blob([[-0.4, -6.95], [-0.44, -6.62], [-0.38, -6.4], [-0.32, -6.7]], 0.5)}" fill="${h}"/>` : '';
    return bun + pinS + side;
  },
};
export const draw = (o = {}) => figure(SPEC, { id: 'wf', ...o, view: o.view === 'back' ? 'back' : 'back34' });
