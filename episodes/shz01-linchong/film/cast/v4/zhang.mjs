// 张教头 (1.66 m): 林冲's father-in-law. Brown robe, plain head cloth with a topknot, grey beard, crow's feet, a slight stoop. 慈.
import { figure, blob } from './base.mjs';
export const SPEC = {
  name: 'zhang', heads: 7.0, stoop: 0.05,
  robe: { base: '#7a6552', shade: '#645241', fold: '#564636' }, inner: '#e3ddd2',
  sash: { col: '#4a3d31', tails: false }, sleeve: 'wide', hands: 'hidden',
  expr: { eye: 0.55, mouth: 0.3, brow: 0.35, lines: true },
  head(view) {
    const cl = '#5e574e';
    if (view === 'side') return `<path d="${blob([[-0.37, -6.82], [-0.25, -7.14], [0.1, -7.24], [0.4, -7.02], [0.42, -6.78], [0.1, -6.8]], 0.4)}" fill="${cl}"/><ellipse cx="0.12" cy="-7.32" rx="0.13" ry="0.11" fill="${cl}"/>`;
    return `<path d="${blob([[-0.39, -6.78], [-0.34, -7.08], [0, -7.24], [0.34, -7.08], [0.39, -6.78], [0, -6.88]], 0.4)}" fill="${cl}"/><ellipse cx="0" cy="-7.32" rx="0.14" ry="0.11" fill="${cl}"/>`;
  },
  beard(view) {
    const g = '#bab4aa', gs = '#9d978d';
    if (view === 'side') return `<path d="${blob([[-0.41, -6.36], [-0.3, -6.36], [-0.24, -6.22], [-0.3, -5.85], [-0.38, -5.88], [-0.4, -6.18]], 0.4)}" fill="${g}"/><path d="M-0.42,-6.37 Q-0.36,-6.42 -0.28,-6.34 Q-0.34,-6.33 -0.42,-6.33Z" fill="${gs}"/>`;
    return `<path d="${blob([[-0.16, -6.34], [0.16, -6.34], [0.13, -6.1], [0.04, -5.82], [-0.04, -5.82], [-0.13, -6.1]], 0.4)}" fill="${g}"/>` +
      `<path d="M0,-6.39 Q-0.1,-6.42 -0.18,-6.3 Q-0.1,-6.35 0,-6.35 Q0.1,-6.35 0.18,-6.3 Q0.1,-6.42 0,-6.39Z" fill="${gs}"/>`;
  },
};
export const draw = (o = {}) => figure(SPEC, { id: 'zh', ...o });
