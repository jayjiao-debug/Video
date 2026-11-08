// 陆谦 (1.70 m): purple-grey robe, low dark cap with short hanging tails, thin moustache, thin smile (笑里藏刀).
import { figure, blob, LINE } from './base.mjs';
export const SPEC = {
  name: 'luqian', heads: 7.2,
  robe: { base: '#6d6876', shade: '#575363', fold: '#4a4655' }, inner: '#e2ded6',
  sash: { col: '#3e3a45', tails: true }, sleeve: 'wide', hands: 'hidden',
  expr: { mouth: 0.45, eye: 0.35 },
  head(view) {
    const cap = '#22201f';
    if (view === 'side') return `<path d="${blob([[-0.37, -6.8], [-0.28, -7.14], [0.06, -7.34], [0.38, -7.1], [0.42, -6.8], [0.1, -6.76]], 0.4)}" fill="${cap}"/>` +
      `<path d="M0.36,-6.85 Q0.5,-6.55 0.46,-6.2 L0.54,-6.2 Q0.6,-6.6 0.44,-6.9 Z" fill="${cap}"/>`;
    return `<path d="${blob([[-0.39, -6.76], [-0.34, -7.1], [0, -7.34], [0.34, -7.1], [0.39, -6.76], [0, -6.86]], 0.4)}" fill="${cap}"/>` +
      `<path d="M-0.4,-6.8 Q-0.5,-6.5 -0.47,-6.2 L-0.41,-6.2 Q-0.44,-6.5 -0.36,-6.78 Z" fill="${cap}"/><path d="M0.4,-6.8 Q0.5,-6.5 0.47,-6.2 L0.41,-6.2 Q0.44,-6.5 0.36,-6.78 Z" fill="${cap}"/>`;
  },
  beard(view, sw) {
    if (view === 'side') return `<path d="M-0.41,-6.37 Q-0.36,-6.38 -0.3,-6.34" fill="none" stroke="${LINE}" stroke-width="${sw * 1.1}" stroke-linecap="round"/>`;
    return `<path d="M-0.02,-6.37 Q-0.08,-6.39 -0.13,-6.33 M0.02,-6.37 Q0.08,-6.39 0.13,-6.33" fill="none" stroke="${LINE}" stroke-width="${sw * 1.1}" stroke-linecap="round"/>`;
  },
};
export const draw = (o = {}) => figure(SPEC, { id: 'lu', ...o });
