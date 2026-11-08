// The hired scribe (代笔先生, ~1.68 m): plain grey robe, small round black cap. pose.brush shows a brush from the sleeve (side view).
import { figure, blob } from './base.mjs';
export const SPEC = {
  name: 'scribe', heads: 7.1,
  robe: { base: '#8a8780', shade: '#73706a', fold: '#64615b' }, inner: '#e4e0d8',
  sash: { col: '#55524d', tails: false }, sleeve: 'wide', hands: 'hidden',
  expr: { eye: 0.7, mouth: 0 },
  head(view) {
    const cap = '#1f1d1c';
    if (view === 'side') return `<path d="${blob([[-0.36, -6.86], [-0.25, -7.16], [0.08, -7.3], [0.38, -7.1], [0.4, -6.84], [0.0, -6.82]], 0.45)}" fill="${cap}"/>`;
    return `<path d="${blob([[-0.38, -6.82], [-0.32, -7.12], [0, -7.3], [0.32, -7.12], [0.38, -6.82], [0, -6.9]], 0.45)}" fill="${cap}"/>`;
  },
};
export const draw = (o = {}) => figure(SPEC, { id: 'sc', ...o });
