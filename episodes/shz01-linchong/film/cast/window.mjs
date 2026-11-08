// The house window (paper lattice, 1.0 × 1.2 m): S07 home (T04) and its deliberate rhymes S30 梁山 (T12), S31 六和寺 (T13).
// Owner: builder B. Stable API:
//
//   latticeWindow({ w = 480, h = 576, id = 'win', glow = 1, cold = 0, dark = 0, paperCol, frameCol,
//                   shadows = '', shadowBlur = 4, shadowCol = '#5A2E14', shadowOp = 0.62, light = 0, sill = true })
//     -> SVG in local coords (0,0)–(w,h): outer wood frame, the paper panes, a lattice grid.
//        glow 0..1   warm lamp behind the paper (S07 #FFC56E). cold 0..1 blends the paper to night blue (#3A4250, S30a).
//        dark 0..1   unlit paper in shadow. light 0..1 pale morning light through the paper (S31).
//        shadows     raw SVG shapes in window-local coords, drawn ON the paper (shadow play), clipped to the
//                    panes, softened by shadowBlur, under the lattice.
//        sill        a small sill under the window.
//   WIN = { w: 480, h: 576, frame: 26 } default geometry (480 px = 1 m at FS scale).
//   winGlow(cx, cy, r, op) -> a soft warm halo you can put behind/around the window on the wall.
import { f2, clamp, lerp } from '../lib.mjs';

export const WIN = { w: 480, h: 576, frame: 26 };

const hex = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
const toHex = (a) => '#' + a.map((v) => Math.round(clamp(v, 0, 255)).toString(16).padStart(2, '0')).join('');
const cmix = (a, b, k) => toHex(hex(a).map((v, i) => lerp(v, hex(b)[i], k)));

export function latticeWindow(o = {}) {
  const w = o.w || WIN.w, h = o.h || WIN.h, id = o.id || 'win';
  const k = w / WIN.w, fr = WIN.frame * k;
  const glow = o.glow ?? 1, cold = o.cold || 0, dark = o.dark || 0, light = o.light || 0;
  // paper colour: unlit warm grey -> lamp glow; night blue; morning pale
  let paper = cmix('#8E7F6A', '#FFD48A', glow);
  paper = cmix(paper, '#3A4250', cold);
  paper = cmix(paper, '#E8E0CE', light);
  paper = cmix(paper, '#2C2622', dark);
  if (o.paperCol) paper = o.paperCol;
  const hot = cmix(cmix('#FFE7B0', '#56607A', cold), '#F6F1E4', light);
  const wood = o.frameCol || cmix('#3A2416', '#1E2230', cold * 0.7);
  const woodHi = cmix(wood, '#9A6A44', 0.35 * (1 - cold));
  const px = fr, py = fr, pw = w - 2 * fr, ph = h - 2 * fr;
  let s = `<defs>` +
    `<radialGradient id="${id}pg" cx="0.5" cy="0.55" r="0.7"><stop offset="0" stop-color="${hot}" stop-opacity="${f2(0.95 * Math.max(glow, light, cold * 0.4))}"/><stop offset="0.75" stop-color="${paper}" stop-opacity="1"/><stop offset="1" stop-color="${cmix(paper, '#000000', 0.18)}"/></radialGradient>` +
    `<clipPath id="${id}cp"><rect x="${f2(px)}" y="${f2(py)}" width="${f2(pw)}" height="${f2(ph)}"/></clipPath>` +
    `<filter id="${id}sb" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="${f2((o.shadowBlur ?? 4) * k)}"/></filter></defs>`;
  // paper
  s += `<rect x="${f2(px)}" y="${f2(py)}" width="${f2(pw)}" height="${f2(ph)}" fill="${paper}"/>`;
  s += `<rect x="${f2(px)}" y="${f2(py)}" width="${f2(pw)}" height="${f2(ph)}" fill="url(#${id}pg)"/>`;
  // paper fibre streaks (subtle)
  let fib = '';
  for (let i = 0; i < 14; i++) {
    const yy = py + ((i * 37.3) % ph), xx = px + ((i * 91.7) % pw);
    fib += `<path d="M${f2(xx)},${f2(yy)} q${f2(30 * k)},${f2(6 * k)} ${f2(70 * k)},${f2(2 * k)}" stroke="#fff" stroke-width="${f2(1.2 * k)}" opacity="0.10" fill="none"/>`;
  }
  s += `<g clip-path="url(#${id}cp)">${fib}`;
  if (o.shadows) s += `<g filter="url(#${id}sb)" fill="${o.shadowCol || '#5A2E14'}" opacity="${f2(o.shadowOp ?? 0.62)}">${o.shadows}</g>`;
  s += `</g>`;
  // lattice grid: 4 columns x 5 rows of panes, thin mullions, a double rail in the middle
  const nx = 4, ny = 5, mw = 7 * k;
  let lat = '';
  for (let i = 1; i < nx; i++) {
    const x = px + (pw * i) / nx;
    lat += `<rect x="${f2(x - mw / 2)}" y="${f2(py)}" width="${f2(mw)}" height="${f2(ph)}"/>`;
  }
  for (let j = 1; j < ny; j++) {
    const y = py + (ph * j) / ny;
    lat += `<rect x="${f2(px)}" y="${f2(y - mw / 2)}" width="${f2(pw)}" height="${f2(mw)}"/>`;
  }
  s += `<g fill="${wood}">${lat}</g>`;
  // mullion highlights on the lit side
  s += `<g fill="${woodHi}" opacity="0.5">${lat.replace(/width="([\d.]+)"/g, (m, v) => `width="${f2(Math.min(+v, 2 * k))}"`)}</g>`;
  // outer frame (with a darker inner bevel)
  s += `<path fill-rule="evenodd" fill="${wood}" d="M0,0H${w}V${h}H0Z M${f2(px)},${f2(py)}V${f2(py + ph)}H${f2(px + pw)}V${f2(py)}Z"/>`;
  s += `<rect x="${f2(px - 3 * k)}" y="${f2(py - 3 * k)}" width="${f2(pw + 6 * k)}" height="${f2(ph + 6 * k)}" fill="none" stroke="${cmix(wood, '#000000', 0.4)}" stroke-width="${f2(4 * k)}"/>`;
  s += `<rect x="${f2(2 * k)}" y="${f2(2 * k)}" width="${f2(w - 4 * k)}" height="${f2(h - 4 * k)}" fill="none" stroke="${woodHi}" stroke-width="${f2(2 * k)}" opacity="0.55"/>`;
  if (o.sill !== false) s += `<rect x="${f2(-18 * k)}" y="${f2(h - 2 * k)}" width="${f2(w + 36 * k)}" height="${f2(16 * k)}" fill="${wood}"/><rect x="${f2(-18 * k)}" y="${f2(h - 2 * k)}" width="${f2(w + 36 * k)}" height="${f2(3 * k)}" fill="${woodHi}" opacity="0.6"/>`;
  return s;
}

/** Soft halo around a lit window on the wall. */
export function winGlow(cx, cy, r, op = 0.6, col = '#FFC56E', id = 'wglow') {
  return `<defs><radialGradient id="${id}"><stop offset="0" stop-color="${col}" stop-opacity="${f2(op)}"/><stop offset="1" stop-color="${col}" stop-opacity="0"/></radialGradient></defs>` +
    `<ellipse cx="${f2(cx)}" cy="${f2(cy)}" rx="${f2(r)}" ry="${f2(r * 0.9)}" fill="url(#${id})"/>`;
}
