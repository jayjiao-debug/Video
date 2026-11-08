// 陆谦 (builder C): traced from the front reference (cast/data/lu_front.json), dark violet robe.
//   luqian({ x, y, k, smile 0..1, id }) -> <g>; (x, y) = screen point of his face centre, k = scale (source px -> px).
//   LU_FACE_SRC: face centre in source px; luPt(o, p) maps a source point to the screen.
//   Arms of the trace hang down behind the table line; hands with cup / ewer are drawn by the take.
import { f2, clamp } from '../lib.mjs';
import { traced } from './c_util.mjs';

export const LU_FACE_SRC = [457, 370];
export const LU_COL = { robe: '#4E3A56', robeS: '#3E2D46', robeD: '#2E2236', skin: '#F2C29E', skinS: '#D9A07C', line: '#2A1C17' };

export function luPt(o, p) { return [o.x + (p[0] - LU_FACE_SRC[0]) * o.k, o.y + (p[1] - LU_FACE_SRC[1]) * o.k]; }

export function luqian(o = {}) {
  const D = traced('lu_front'), k = o.k || 2;
  const sm = clamp(o.smile ?? 0);
  let inner = D.paths.map(([c, d]) => `<path d="${d}" fill="${c}"/>`).join('');
  if (sm > 0) {
    // 笑里藏刀: corners of the mouth lift under the moustache, the lower lids narrow (source px)
    inner += `<path d="M438,${f2(431 - 3 * sm)} C446,${f2(436 + 2 * sm)} 468,${f2(436 + 2 * sm)} 478,${f2(429 - 4 * sm)}" fill="none" stroke="#7a3a2c" stroke-width="2.4" stroke-linecap="round" opacity="${f2(0.9 * sm)}"/>`;
    inner += `<path d="M418,${f2(357)} C426,${f2(352 - 2 * sm)} 436,${f2(352 - 2 * sm)} 444,357 M462,357 C470,${f2(352 - 2 * sm)} 480,${f2(352 - 2 * sm)} 488,357" fill="none" stroke="#C88E6C" stroke-width="2.6" stroke-linecap="round" opacity="${f2(0.8 * sm)}"/>`;
  }
  inner += `<rect data-face="1" x="400" y="300" width="125" height="150" fill="none"/>`;
  return `<g data-char="luqian" transform="translate(${f2(o.x)} ${f2(o.y)}) scale(${f2(k)}) translate(${-LU_FACE_SRC[0]} ${-LU_FACE_SRC[1]})">${inner}</g>`;
}
