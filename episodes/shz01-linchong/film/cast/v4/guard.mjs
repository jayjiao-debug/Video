// Convoy guard / 公人 (1.72 m): black-grey short tunic, dull red sash, trousers and boots, black cap with a red knob,
// the red-black 水火棍 (the identifier). Walks: pose.step (-1..1) in side view.
import { figure, blob } from './base.mjs';
export const SPEC = {
  name: 'guard', heads: 7.3,
  robe: { base: '#45403d', shade: '#36322f', fold: '#2c2826' }, inner: '#d9d3c8',
  sash: { col: '#8a3d33', tails: true }, sleeve: 'narrow', hands: 'fist', hemY: -2.35,
  trousers: '#2c2927', boots: '#1f1c1b',
  expr: { eye: 0.5, mouth: -0.2, brow: -0.3 },
  head(view) {
    const cap = '#1d1b1a', knob = '#8a3d33';
    if (view === 'side') return `<path d="${blob([[-0.37, -6.82], [-0.26, -7.12], [0.08, -7.24], [0.4, -7.04], [0.42, -6.8], [0.0, -6.82]], 0.4)}" fill="${cap}"/><circle cx="0.06" cy="-7.28" r="0.07" fill="${knob}"/>`;
    return `<path d="${blob([[-0.4, -6.8], [-0.34, -7.1], [0, -7.24], [0.34, -7.1], [0.4, -6.8], [0, -6.88]], 0.4)}" fill="${cap}"/><circle cx="0" cy="-7.28" r="0.07" fill="${knob}"/>`;
  },
};
export const draw = (o = {}) => figure(SPEC, { id: 'gd', pose: { staff: { col1: '#8a3d33', col2: '#1d1b1a' }, ...(o.pose || {}) }, ...o, pose: { staff: { col1: '#8a3d33', col2: '#1d1b1a' }, ...(o.pose || {}) } });
