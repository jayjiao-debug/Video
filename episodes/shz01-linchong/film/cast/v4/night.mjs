// 差拨 and 富安: night silhouettes only (fire behind them). draw({who:'chabo'|'fuan', pose:'stand'|'run'|'fall'|'cower', x, y,
// height, flip, rim (colour of the rim light, e.g. '#FF8A3D'), fill})
import { silFigure } from './base.mjs';
export function draw(o = {}) {
  const who = o.who || 'chabo';
  const base = who === 'chabo' ? { cap: 'official', fat: 0.18 } : { cap: 'scarf', fat: 0 };
  return silFigure({ name: who, id: who + (o.id || ''), ...base, ...o });
}
