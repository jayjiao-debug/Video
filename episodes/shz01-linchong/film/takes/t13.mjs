// T13 · 125.620–148.500 · 六和寺, the peak, the question, the end card (storyboard_v3 TAKE 13 + END, film/timing.md)
//   S31 125.620–128.534  monk's room in 六和寺: the hat on the empty bed, the spear (gourd tied) on the door frame,
//                        六和塔 far off through the door, a morning light pool sliding; light bloom into the 休书
//   S32 128.534–136.870  overhead 休书 (S01's position and tilt) in an ink night; five memories drift in and are
//                        absorbed; 「依旧夫妻完聚」 brushed with the voice; release at 136.030 (ink lifts as motes/snow)
//   S33 136.870–141.862  the blank paper with the red palm print (left third) vs the fist rising (right third)
//   END 141.862–148.500  the print contracts into the J seal; title, question, follow pill, 下回, sources
// Entry from T12: window-frame dissolve 124.78–125.62 (the window holds its screen position).
import fs from 'fs';
import {
  L, kf, ramp, zexp, E, bake, rg, lg, f2, clamp, lerp, mix, rng, noise1, fbm1, motes, snow, camAt, toScreen,
  palmPrint, jseal, ASSET, furl, SEAL, smooth, ridge, pulse, shake,
} from '../lib.mjs';
import { xiushu, XS } from '../cast/xiushu.mjs';

const has = (p) => fs.existsSync(new URL(p, import.meta.url));
const FISTM = has('../cast/fist.mjs') ? await import('../cast/fist.mjs') : null;
const WINM = has('../cast/window.mjs') ? await import('../cast/window.mjs') : null;
const PALMM = has('../cast/palm.mjs') ? await import('../cast/palm.mjs') : null;
const printSVG = (cx, cy, h, rot, op) => (PALMM ? PALMM.palm(cx, cy, h, rot, op) : palmPrint(cx, cy, h, rot, op, SEAL));
const GLYPHS = JSON.parse(fs.readFileSync(new URL('../cast/t13_glyphs.json', import.meta.url), 'utf8'));

const T31 = 125.62, T32 = 128.534, T33 = 136.87, TEND = 141.862, REL = 136.03;
const PROMISE = '依旧夫妻完聚';
const PT = [134.21, 134.49, 134.77, 135.05, 135.33, 135.61];

// ======================================================================= S31 · the monk's room (FS scale 3.78 px/cm)
const FLOOR = 860;
const DOOR = { x0: 170, x1: 510, y0: 104 };            // opening 0.9 × 2.0 m
const WIN = { x0: 1030, y0: 66, w: 378, h: 454 };     // 1.0 × 1.2 m, sill 0.9 m
const BED = { x0: 601, x1: 1319, top: 690 };          // 1.9 m, top 45 cm
const HAT = { cx: 712, y: 683 };
const SPEAR = { foot: [640, 908], top: [546, 40] };
const WC = [WIN.x0 + WIN.w / 2, WIN.y0 + WIN.h / 2];  // window centre (world)

function latticeWindow(x, y, w, h, glow = '#F6EBD2', id = 't13w') {
  if (WINM && typeof WINM.latticeWindow === 'function') return `<g transform="translate(${x} ${y})">${WINM.latticeWindow({ w, h, id, glow: 0, light: 0.8, sill: true })}</g>`;
  const fr = 20, bar = 7, cols = 4, rows = 5;
  let s = `<rect x="${x - 6}" y="${y - 6}" width="${w + 12}" height="${h + 12}" fill="#3a2c22"/>`;
  s += `<rect x="${x + fr}" y="${y + fr}" width="${w - 2 * fr}" height="${h - 2 * fr}" fill="${glow}"/>`;
  s += `<rect x="${x + fr}" y="${y + fr}" width="${w - 2 * fr}" height="${h - 2 * fr}" fill="url(#${id}gl)" opacity="0.8"/>`;
  const iw = w - 2 * fr, ih = h - 2 * fr;
  for (let i = 1; i < cols; i++) s += `<rect x="${f2(x + fr + (iw * i) / cols - bar / 2)}" y="${y + fr}" width="${bar}" height="${ih}" fill="#4a3a2e"/>`;
  for (let j = 1; j < rows; j++) s += `<rect x="${x + fr}" y="${f2(y + fr + (ih * j) / rows - bar / 2)}" width="${iw}" height="${bar}" fill="#4a3a2e"/>`;
  // a small diamond motif in the centre cell row (the home window's rhyme)
  s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="#2A1C17" stroke-width="${fr}" />`;
  s += `<rect x="${x - 10}" y="${y + h - 4}" width="${w + 20}" height="16" fill="#3a2c22"/>`;
  return `<defs>${rg(id + 'gl', [[0, '#FFFFFF', 0.9], [0.7, '#FFF4DC', 0.2], [1, '#E9D7B0', 0]], 0.55, 0.45, 0.65)}</defs>` + s;
}

function hatRest(cx, y, k = 1) {
  // 毡笠 resting crown-up, seen from the front and a little above (brim Ø 40 cm = 151 px at FS)
  const bw = 75.5 * k, bh = 15 * k, cw = 32 * k, ch = 36 * k;
  const LN = `stroke="#2A1C17" stroke-width="${f2(2.2 * k)}" stroke-linejoin="round"`;
  let s = `<ellipse cx="${cx}" cy="${f2(y + 3 * k)}" rx="${f2(bw * 1.02)}" ry="${f2(bh * 0.9)}" fill="#2a2420" opacity="0.35"/>`; // contact shadow
  s += `<ellipse cx="${cx}" cy="${y}" rx="${f2(bw)}" ry="${f2(bh)}" fill="#c9c0b0" ${LN}/>`;
  s += `<path d="M${f2(cx - bw)},${y} A${f2(bw)},${f2(bh)} 0 0 0 ${f2(cx + bw)},${y} L${f2(cx + bw)},${f2(y + 3 * k)} A${f2(bw)},${f2(bh)} 0 0 1 ${f2(cx - bw)},${f2(y + 3 * k)}Z" fill="#9c917f" ${LN}/>`;
  s += `<ellipse cx="${f2(cx - bw * 0.25)}" cy="${f2(y - bh * 0.25)}" rx="${f2(bw * 0.55)}" ry="${f2(bh * 0.5)}" fill="#e4dccd" opacity="0.6"/>`;
  const cb = y - 2 * k;
  s += `<path d="M${f2(cx - cw)},${f2(cb)} C${f2(cx - cw)},${f2(cb - ch * 0.8)} ${f2(cx - cw * 0.55)},${f2(cb - ch)} ${cx},${f2(cb - ch)} C${f2(cx + cw * 0.55)},${f2(cb - ch)} ${f2(cx + cw)},${f2(cb - ch * 0.8)} ${f2(cx + cw)},${f2(cb)} C${f2(cx + cw * 0.5)},${f2(cb + 6 * k)} ${f2(cx - cw * 0.5)},${f2(cb + 6 * k)} ${f2(cx - cw)},${f2(cb)}Z" fill="#d9d1c3" ${LN}/>`;
  s += `<path d="M${f2(cx + cw * 0.3)},${f2(cb - ch * 0.97)} C${f2(cx + cw * 0.85)},${f2(cb - ch * 0.8)} ${f2(cx + cw)},${f2(cb - ch * 0.4)} ${f2(cx + cw)},${f2(cb)} C${f2(cx + cw * 0.8)},${f2(cb + 3 * k)} ${f2(cx + cw * 0.6)},${f2(cb + 4 * k)} ${f2(cx + cw * 0.5)},${f2(cb + 4.5 * k)} C${f2(cx + cw * 0.62)},${f2(cb - ch * 0.4)} ${f2(cx + cw * 0.56)},${f2(cb - ch * 0.75)} ${f2(cx + cw * 0.3)},${f2(cb - ch * 0.97)}Z" fill="#b3a998"/>`;
  s += `<path d="M${f2(cx - cw * 0.99)},${f2(cb - 7 * k)} C${f2(cx - cw * 0.5)},${f2(cb - 2 * k)} ${f2(cx + cw * 0.5)},${f2(cb - 2 * k)} ${f2(cx + cw * 0.99)},${f2(cb - 7 * k)} L${f2(cx + cw)},${f2(cb)} C${f2(cx + cw * 0.5)},${f2(cb + 6 * k)} ${f2(cx - cw * 0.5)},${f2(cb + 6 * k)} ${f2(cx - cw)},${f2(cb)}Z" fill="#857a69" ${LN}/>`;
  // the red chin cord, slack, draped over the bed's front edge
  s += `<path d="M${f2(cx - cw * 0.9)},${f2(cb + 2 * k)} C${f2(cx - cw * 1.2)},${f2(y + 18 * k)} ${f2(cx - cw * 0.6)},${f2(y + 34 * k)} ${f2(cx - cw * 0.1)},${f2(y + 40 * k)} C${f2(cx + cw * 0.4)},${f2(y + 44 * k)} ${f2(cx + cw * 0.8)},${f2(y + 26 * k)} ${f2(cx + cw * 0.95)},${f2(cb + 3 * k)}" fill="none" stroke="#b8322a" stroke-width="${f2(2.6 * k)}" stroke-linecap="round"/>`;
  return s;
}

function spearProp(foot, top, k = 1) {
  // 花枪 2.30 m (869 px at FS): shaft Ø 3 cm, head 25 cm, red tassel, the gourd hanging plumb from near the tip
  const dx = top[0] - foot[0], dy = top[1] - foot[1], len = Math.hypot(dx, dy), ang = (Math.atan2(dx, -dy) * 180) / Math.PI;
  const cm = len / 230, d = 3 * cm, head = 25 * cm, blade = 20 * cm, bw = 2.2 * cm;
  const LN = `stroke="#2A1C17" stroke-width="${f2(1.8 * k)}" stroke-linejoin="round"`;
  const yb = -(len - head);
  let s = `<g transform="translate(${foot[0]} ${foot[1]}) rotate(${f2(ang)})">`;
  s += `<path d="M${f2(-d / 2)},0 L${f2(-d / 2)},${f2(yb)} L${f2(d / 2)},${f2(yb)} L${f2(d / 2)},0Z" fill="#7a5232" ${LN}/>`;
  s += `<path d="M${f2(d * 0.15)},${f2(-6)} L${f2(d * 0.15)},${f2(yb + 4)}" stroke="#553722" stroke-width="${f2(d * 0.35)}"/>`;
  s += `<path d="M${f2(-d * 0.62)},2 L${f2(-d * 0.55)},${f2(-4 * cm)} L${f2(d * 0.55)},${f2(-4 * cm)} L${f2(d * 0.62)},2Z" fill="#8d969c" ${LN}/>`;
  // tassel
  s += `<path d="M${f2(-d * 0.7)},${f2(yb + 2)} C${f2(-4 * cm)},${f2(yb + 8 * cm)} ${f2(-5 * cm)},${f2(yb + 16 * cm)} ${f2(-3.6 * cm)},${f2(yb + 22 * cm)} C${f2(-1.5 * cm)},${f2(yb + 24 * cm)} ${f2(1.5 * cm)},${f2(yb + 24 * cm)} ${f2(3.4 * cm)},${f2(yb + 21 * cm)} C${f2(4.6 * cm)},${f2(yb + 15 * cm)} ${f2(3.6 * cm)},${f2(yb + 8 * cm)} ${f2(d * 0.7)},${f2(yb + 2)}Z" fill="#c8322a" ${LN}/>`;
  for (let i = 0; i < 7; i++) { const a = -1 + i / 3; s += `<path d="M${f2(a * d * 0.4)},${f2(yb + 3)} C${f2(a * 2.6 * cm)},${f2(yb + 9 * cm)} ${f2(a * 3.6 * cm)},${f2(yb + 15 * cm)} ${f2(a * 3 * cm)},${f2(yb + 21 * cm)}" fill="none" stroke="#8f1f1a" stroke-width="${f2(1.1 * k)}" opacity="0.8"/>`; }
  const ys = yb - 5 * cm;
  s += `<path d="M${f2(-d * 0.75)},${f2(yb + 1.5 * cm)} L${f2(-d * 0.6)},${f2(ys)} L${f2(d * 0.6)},${f2(ys)} L${f2(d * 0.75)},${f2(yb + 1.5 * cm)}Z" fill="#8d969c" ${LN}/>`;
  s += `<path d="M${f2(-d * 0.45)},${f2(ys)} C${f2(-bw * 1.1)},${f2(ys - blade * 0.18)} ${f2(-bw)},${f2(ys - blade * 0.55)} 0,${f2(-len)} C${f2(bw)},${f2(ys - blade * 0.55)} ${f2(bw * 1.1)},${f2(ys - blade * 0.18)} ${f2(d * 0.45)},${f2(ys)}Z" fill="#d9dde0" ${LN}/>`;
  s += `<path d="M0,${f2(ys - 2)} L0,${f2(-len + 6)}" stroke="#6c7378" stroke-width="${f2(1.6 * k)}"/>`;
  s += '</g>';
  // gourd: tied at 0.79 of the length, hanging plumb (world vertical)
  const r = (ang * Math.PI) / 180, tl = len * 0.79, tie = [foot[0] + Math.sin(r) * tl, foot[1] - Math.cos(r) * tl];
  const cord = 12 * cm, r1 = 5.5 * cm, r2 = 8 * cm, top0 = tie[1] + cord, y1 = top0 + 1.5 * cm + r1, y2 = top0 + 28 * cm - r2, nk = 2.2 * cm, x = tie[0];
  s += `<path d="M${f2(x - d * 0.6)},${f2(tie[1] - 2)} L${f2(x + d * 0.6)},${f2(tie[1] + 2)}" stroke="#5a3a22" stroke-width="${f2(3 * k)}"/>`;
  s += `<path d="M${f2(x)},${f2(tie[1])} C${f2(x + 2)},${f2(tie[1] + cord * 0.4)} ${f2(x - 2)},${f2(tie[1] + cord * 0.7)} ${f2(x)},${f2(top0)}" fill="none" stroke="#5a3a22" stroke-width="${f2(2 * k)}"/>`;
  const body = `M${f2(x - nk)},${f2(top0 + 1.6 * cm)} C${f2(x - r1 * 1.25)},${f2(y1 - r1 * 0.6)} ${f2(x - r1 * 1.15)},${f2(y1 + r1 * 0.8)} ${f2(x - nk * 1.1)},${f2(y1 + r1 * 1.05)} C${f2(x - r2 * 1.35)},${f2(y2 - r2 * 0.75)} ${f2(x - r2 * 1.2)},${f2(y2 + r2 * 1.05)} ${f2(x)},${f2(y2 + r2)} C${f2(x + r2 * 1.2)},${f2(y2 + r2 * 1.05)} ${f2(x + r2 * 1.35)},${f2(y2 - r2 * 0.75)} ${f2(x + nk * 1.1)},${f2(y1 + r1 * 1.05)} C${f2(x + r1 * 1.15)},${f2(y1 + r1 * 0.8)} ${f2(x + r1 * 1.25)},${f2(y1 - r1 * 0.6)} ${f2(x + nk)},${f2(top0 + 1.6 * cm)}Z`;
  s += `<path d="${body}" fill="#c99a55" ${LN}/>`;
  s += `<path d="M${f2(x + nk * 0.4)},${f2(top0 + 2 * cm)} C${f2(x + r1)},${f2(y1)} ${f2(x + nk)},${f2(y1 + r1)} ${f2(x + nk * 0.6)},${f2(y1 + r1 * 1.05)} C${f2(x + r2 * 1.15)},${f2(y2 - r2 * 0.6)} ${f2(x + r2)},${f2(y2 + r2 * 0.9)} ${f2(x + r2 * 0.1)},${f2(y2 + r2 * 0.98)} C${f2(x + r2 * 0.7)},${f2(y2 + r2 * 0.4)} ${f2(x + r2 * 0.7)},${f2(y2 - r2 * 0.4)} ${f2(x + nk * 0.3)},${f2(y1 + r1 * 1.1)}Z" fill="#9a6f36"/>`;
  s += `<path d="M${f2(x - nk * 1.15)},${f2(y1 + r1)} Q${f2(x)},${f2(y1 + r1 * 1.2)} ${f2(x + nk * 1.15)},${f2(y1 + r1)}" fill="none" stroke="#5a3a22" stroke-width="${f2(2.4 * k)}"/>`;
  s += `<ellipse cx="${f2(x - r2 * 0.45)}" cy="${f2(y2 - r2 * 0.2)}" rx="${f2(r2 * 0.18)}" ry="${f2(r2 * 0.3)}" fill="#e6c48c" opacity="0.7"/>`;
  return s;
}

function pagoda(cx, base, h) {
  // 六和塔 far away: octagonal, thirteen eaves outside, tapering; ink grey in morning haze
  let s = '';
  const n = 13, w0 = h * 0.24, w1 = h * 0.13;
  for (let i = 0; i < n; i++) {
    const y = base - (h * 0.92 * i) / n, w = lerp(w0, w1, i / (n - 1)), seg = (h * 0.92) / n;
    s += `<rect x="${f2(cx - w * 0.38)}" y="${f2(y - seg)}" width="${f2(w * 0.76)}" height="${f2(seg)}" fill="#6a6866"/>`;
    s += `<path d="M${f2(cx - w * 0.62)},${f2(y - seg * 0.12)} Q${f2(cx)},${f2(y - seg * 0.55)} ${f2(cx + w * 0.62)},${f2(y - seg * 0.12)} L${f2(cx + w * 0.5)},${f2(y - seg * 0.3)} Q${f2(cx)},${f2(y - seg * 0.7)} ${f2(cx - w * 0.5)},${f2(y - seg * 0.3)}Z" fill="#4e4c4c"/>`;
  }
  s += `<path d="M${f2(cx)},${f2(base - h)} L${f2(cx)},${f2(base - h * 0.9)}" stroke="#4e4c4c" stroke-width="${f2(h * 0.012)}"/>`;
  return s;
}

const OUTSIDE = (() => {
  // seen through the door (d 0.35): morning sky, 钱塘江, hills, the pagoda on its hill
  let s = `<defs>${lg('t13os', [[0, '#EDE5D2'], [0.55, '#E8E0CF'], [1, '#DCD6C8']])}${lg('t13or', [[0, '#C9CFCB'], [1, '#B9C0BC']])}</defs>`;
  s += `<rect x="-200" y="-100" width="1300" height="1100" fill="url(#t13os)"/>`;
  s += `<circle cx="760" cy="300" r="120" fill="#FFF8E8" opacity="0.5"/>`;
  s += `<path d="${ridge(21, -200, 1100, 580, 120, 1000, 20)}" fill="#B9B6AC" opacity="0.8"/>`;
  s += `<path d="${ridge(22, -200, 1100, 610, 70, 1000, 20)}" fill="#9E9C94" opacity="0.85"/>`;
  s += `<rect x="-200" y="618" width="1300" height="46" fill="url(#t13or)"/>`;
  s += `<path d="M-200,664 L1100,664 L1100,1000 L-200,1000Z" fill="#CBC3AE"/>`;
  s += `<path d="M120,612 C160,560 250,540 330,548 C400,556 440,590 470,612Z" fill="#8f8d86"/>`;
  s += pagoda(305, 556, 230);
  s += `<path d="M-200,720 C100,700 400,710 1100,690 L1100,1000 L-200,1000Z" fill="#b8ad94"/>`;
  // a pine branch silhouette in front
  s += `<path d="M560,180 C500,210 450,250 420,300 M470,240 C440,236 410,246 390,262 M500,214 C520,236 528,262 526,290" stroke="#3c3a36" stroke-width="7" fill="none" stroke-linecap="round" opacity="0.75"/>`;
  return bake('t13_outside', 1950, 1650, `<g transform="translate(300 150) scale(1.5)">${s}</g>`, { vb: '0 0 1950 1650' });
})();

const ROOM = (() => {
  // wall, floor, door frame, window, branch shadow (d 1). Baked at 1.5x for the 1.27 start zoom.
  const X0 = -160, Y0 = -120, WW = 2280, HH = 1340;
  let s = `<defs>${lg('t13wall', [[0, '#7E7464'], [0.35, '#A39784'], [0.8, '#A89C88'], [1, '#8E8372']])}` +
    `${lg('t13floor', [[0, '#5F564B'], [0.4, '#6E6458'], [1, '#4B433A']])}` +
    `${rg('t13wl', [[0, '#E9DCC0', 0.55], [1, '#E9DCC0', 0]], 0.5, 0.5, 0.5)}` +
    `<filter id="t13bs" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="6"/></filter>` +
    `<mask id="t13door"><rect x="${X0}" y="${Y0}" width="${WW}" height="${HH}" fill="#fff"/><rect x="${DOOR.x0}" y="${DOOR.y0}" width="${DOOR.x1 - DOOR.x0}" height="${FLOOR - DOOR.y0}" fill="#000"/></mask></defs>`;
  let wall = `<rect x="${X0}" y="${Y0}" width="${WW}" height="${FLOOR - Y0}" fill="url(#t13wall)"/>`;
  wall += `<ellipse cx="${WC[0] - 120}" cy="${WC[1] + 120}" rx="620" ry="460" fill="url(#t13wl)"/>`;
  wall += `<image href="${furl(ASSET + '/paper.png')}" x="${X0}" y="${Y0}" width="${WW}" height="${FLOOR - Y0}" preserveAspectRatio="none" opacity="0.35" style="mix-blend-mode:multiply"/>`;
  // plaster stains, cracks
  const R = rng(13);
  for (let i = 0; i < 14; i++) wall += `<ellipse cx="${f2(X0 + R() * WW)}" cy="${f2(Y0 + R() * (FLOOR - Y0))}" rx="${f2(40 + R() * 120)}" ry="${f2(20 + R() * 60)}" fill="#6f6556" opacity="${f2(0.05 + R() * 0.06)}"/>`;
  wall += `<path d="M1520,320 l14,40 l-8,36 l18,52 M1534,360 l26,12" stroke="#5e5446" stroke-width="2" fill="none" opacity="0.4"/>`;
  // branch shadow on the right wall (soft)
  wall += `<g filter="url(#t13bs)" opacity="0.32" fill="none" stroke="#3A332C" stroke-linecap="round">` +
    `<path d="M2050,90 C1900,140 1760,170 1640,260 C1580,300 1540,360 1500,420" stroke-width="16"/>` +
    `<path d="M1760,180 C1720,120 1680,90 1620,70 M1660,250 C1700,300 1720,360 1716,420 M1580,320 C1540,300 1500,300 1470,310" stroke-width="9"/>` +
    `<g fill="#3A332C" stroke="none">${[[1630, 72], [1700, 112], [1720, 410], [1470, 310], [1560, 250], [1800, 160], [1505, 420]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="22" ry="12"/>`).join('')}</g></g>`;
  // ceiling beam + skirting
  wall += `<rect x="${X0}" y="${Y0}" width="${WW}" height="${-Y0 + 26}" fill="#3f342a"/><rect x="${X0}" y="20" width="${WW}" height="8" fill="#2c241d"/>`;
  wall += `<rect x="${X0}" y="${FLOOR - 16}" width="${WW}" height="16" fill="#4a3e33"/>`;
  s += `<g mask="url(#t13door)">${wall}</g>`;
  // door frame
  s += `<rect x="${DOOR.x0 - 26}" y="${DOOR.y0 - 26}" width="${DOOR.x1 - DOOR.x0 + 52}" height="26" fill="#4a3c30"/>`;
  s += `<rect x="${DOOR.x0 - 26}" y="${DOOR.y0 - 26}" width="26" height="${FLOOR - DOOR.y0 + 26}" fill="#4a3c30"/><rect x="${DOOR.x1}" y="${DOOR.y0 - 26}" width="26" height="${FLOOR - DOOR.y0 + 26}" fill="#56463a"/>`;
  s += `<rect x="${DOOR.x1 + 18}" y="${DOOR.y0 - 26}" width="8" height="${FLOOR - DOOR.y0 + 26}" fill="#3a2e25"/>`;
  // open door leaf, swung inward against the left wall (seen nearly edge-on)
  s += `<path d="M${DOOR.x0 - 26},${DOOR.y0 - 4} L${DOOR.x0 - 120},${DOOR.y0 - 60} L${DOOR.x0 - 120},${FLOOR + 40} L${DOOR.x0 - 26},${FLOOR}Z" fill="#3d3128"/>`;
  s += `<path d="M${DOOR.x0 - 108},${DOOR.y0 - 40} L${DOOR.x0 - 108},${FLOOR + 30}" stroke="#2c231c" stroke-width="5"/>`;
  // threshold + floor
  s += `<rect x="${X0}" y="${FLOOR}" width="${WW}" height="${HH + Y0 - FLOOR}" fill="url(#t13floor)"/>`;
  let pl = '';
  for (let i = -14; i <= 14; i++) { const xb = 960 + i * 150; pl += `<path d="M${f2(960 + (xb - 960) * 0.3)},${FLOOR} L${f2(960 + (xb - 960) * 1.9)},${HH + Y0}" stroke="#3c342c" stroke-width="2" opacity="0.5"/>`; }
  for (const y of [905, 968, 1050, 1150]) pl += `<path d="M${X0},${y} L${X0 + WW},${y}" stroke="#3c342c" stroke-width="1.5" opacity="0.25"/>`;
  s += pl;
  s += `<rect x="${DOOR.x0 - 10}" y="${FLOOR - 6}" width="${DOOR.x1 - DOOR.x0 + 20}" height="18" fill="#5a4a3c"/>`;
  // window (morning)
  s += latticeWindow(WIN.x0, WIN.y0, WIN.w, WIN.h, '#F4E8CE', 't13rw');
  return bake('t13_room', WW * 1.5, HH * 1.5, `<g transform="scale(1.5) translate(${-X0} ${-Y0})">${s}</g>`, { vb: `0 0 ${WW * 1.5} ${HH * 1.5}`, x: 0, y: 0 }).replace('<image ', `<image transform="translate(${X0} ${Y0}) scale(${f2(1 / 1.5 * 1000) / 1000})" `);
})();

const FURN = (() => {
  // bed with a mat, the folded blanket, the hat on the bed foot (d 1)
  const { x0, x1, top } = BED;
  let s = '';
  s += `<ellipse cx="${(x0 + x1) / 2}" cy="${FLOOR + 22}" rx="${(x1 - x0) / 2 + 30}" ry="20" fill="#2a2420" opacity="0.45"/>`;
  // legs
  for (const x of [x0 + 18, x1 - 40]) s += `<rect x="${x}" y="${top + 40}" width="22" height="${FLOOR + 22 - top - 40}" fill="#4a3a2c" stroke="#2A1C17" stroke-width="2"/>`;
  for (const x of [x0 + 50, x1 - 70]) s += `<rect x="${x}" y="${top + 30}" width="16" height="${FLOOR - top - 30}" fill="#3a2d22"/>`;
  // top surface (seen slightly from above) + front apron
  s += `<path d="M${x0 + 14},${top - 22} L${x1 - 14},${top - 22} L${x1},${top} L${x0},${top}Z" fill="#7a6248" stroke="#2A1C17" stroke-width="2"/>`;
  s += `<path d="M${x0 + 24},${top - 20} L${x1 - 24},${top - 20} L${x1 - 12},${top - 4} L${x0 + 12},${top - 4}Z" fill="#b9a982" opacity="0.9"/>`; // straw mat
  for (let i = 0; i < 26; i++) s += `<path d="M${f2(x0 + 30 + i * 26.5)},${top - 19} L${f2(x0 + 18 + i * 27)},${top - 5}" stroke="#9b8a63" stroke-width="1.5"/>`;
  s += `<rect x="${x0}" y="${top}" width="${x1 - x0}" height="40" fill="#5e4a36" stroke="#2A1C17" stroke-width="2"/>`;
  s += `<rect x="${x0}" y="${top + 30}" width="${x1 - x0}" height="10" fill="#4a3a2c"/>`;
  // folded blanket (right end)
  s += `<path d="M1150,${top - 14} L1290,${top - 14} C1300,${top - 30} 1296,${top - 54} 1282,${top - 58} L1158,${top - 58} C1144,${top - 54} 1140,${top - 30} 1150,${top - 14}Z" fill="#6a707a" stroke="#2A1C17" stroke-width="2"/>`;
  s += `<path d="M1156,${top - 38} L1288,${top - 38}" stroke="#555a63" stroke-width="3"/><path d="M1160,${top - 50} L1280,${top - 50}" stroke="#7d838c" stroke-width="2"/>`;
  s += hatRest(HAT.cx, HAT.y, 1);
  return s;
})();

const SPEARSVG = spearProp(SPEAR.foot, SPEAR.top);

function s31Cam(t) {
  // start: window exactly where T12 leaves it (≈ 982–1500 × 168–791 at 125.2) so the frame holds through the dissolve;
  // pull to the WS, then a slow dolly + push
  const p = WC;
  const k = ramp(t, T31, 127.3, E.inOut);
  const z1 = zexp(t, T31, 127.3, 1.37, 1.0);
  const qa = [1241, 480], qb = [WC[0] + 40, WC[1]];
  let q = mix(qa, qb, k), z = z1;
  if (t > 127.3) {
    const k2 = ramp(t, 127.3, 128.8, E.sine);
    q = [qb[0] - 70 * k2, qb[1] + 10 * k2];
    z = 1 + 0.04 * k2;
  }
  return camAt(p, q, z);
}

function poolScreen(t) {
  const slide = 30 * ramp(t, T31, T32, E.lin);
  return toScreen(s31Cam(t), 1, [665 + slide, 945]);
}

function s31(t) {
  const c = s31Cam(t);
  let s = `<defs>${lg('t13sh', [[0, '#FFF2D6', 0], [0.5, '#FFF2D6', 1], [1, '#FFF2D6', 0]], 0, 0, 1, 0)}` +
    `${rg('t13pool', [[0, '#FFF0CF', 0.95], [0.6, '#F3DFB4', 0.55], [1, '#E8D9B8', 0]])}` +
    `${rg('t13bloom', [[0, '#FFF6E0', 1], [0.5, '#FFE9C0', 0.6], [1, '#FFE9C0', 0]])}</defs>`;
  s += L(c, 0.35, OUTSIDE.replace('<image ', '<image transform="translate(-200 -100) scale(0.6667)" '), { id: 't13out', bleed: 'all', z: 5 });
  s += L(c, 1, ROOM, { id: 't13room', bleed: 'all', z: 10 });
  // light: shaft from the window down-left to the bed foot and the floor near the spear's foot
  const slide = 30 * ramp(t, T31, T32, E.lin);
  const glowUp = ramp(t, 127.9, T32, E.in);
  const P1 = [[WIN.x0 + 30, WIN.y0 + 60], [WIN.x0 + WIN.w - 30, WIN.y0 + 30], [870 + slide, 975], [470 + slide, 1000]];
  const shaft = `<path d="M${P1.map((p) => p.map(f2).join(',')).join(' L')}Z" fill="url(#t13shg)" opacity="${f2(0.34 + 0.16 * glowUp)}"/>` +
    `<linearGradient id="t13shg" gradientUnits="userSpaceOnUse" x1="${f2(WIN.x0 - 280 + slide)}" y1="${f2(560)}" x2="${f2(WIN.x0 + 170 + slide)}" y2="${f2(420)}"><stop offset="0" stop-color="#FFF2D6" stop-opacity="0"/><stop offset="0.5" stop-color="#FFF2D6" stop-opacity="1"/><stop offset="1" stop-color="#FFF2D6" stop-opacity="0"/></linearGradient>`;
  let light = shaft;
  // floor pool with lattice shadows
  const pc = [665 + slide, 945];
  light += `<g opacity="${f2(0.75 + 0.25 * glowUp)}"><ellipse cx="${f2(pc[0])}" cy="${pc[1]}" rx="${f2(230 + 60 * glowUp)}" ry="${f2(62 + 14 * glowUp)}" fill="url(#t13pool)"/>` +
    [0, 1, 2].map((i) => `<path d="M${f2(pc[0] - 150 + i * 105)},${pc[1] - 50} L${f2(pc[0] - 190 + i * 105)},${pc[1] + 50}" stroke="#6E6458" stroke-width="7" opacity="0.35"/>`).join('') +
    `<path d="M${f2(pc[0] - 210)},${pc[1] - 6} L${f2(pc[0] + 200)},${pc[1] - 14}" stroke="#6E6458" stroke-width="6" opacity="0.3"/></g>`;
  // bed-foot patch on the mat around the hat
  light += `<ellipse cx="${f2(HAT.cx + 10 + slide * 0.6)}" cy="${BED.top - 12}" rx="150" ry="24" fill="url(#t13pool)" opacity="${f2(0.9 + 0.1 * glowUp)}"/>`;
  // light map: the room falls off into shadow away from the beam (pool, hat and spear foot stay the brightest)
  const lcx = 760 + slide, lcy = 760;
  const lm = `<defs><radialGradient id="t13lm" gradientUnits="userSpaceOnUse" cx="${f2(lcx)}" cy="${lcy}" r="1100" gradientTransform="translate(${f2(lcx)} ${lcy}) scale(1.25 0.85) translate(${f2(-lcx)} ${-lcy})"><stop offset="0" stop-color="#2a241e" stop-opacity="0"/><stop offset="0.45" stop-color="#2a241e" stop-opacity="0.18"/><stop offset="1" stop-color="#1f1a16" stop-opacity="0.6"/></radialGradient></defs>` +
    `<rect x="-600" y="-500" width="3200" height="2200" fill="url(#t13lm)"/>`;
  s += L(c, 1, lm, { id: 't13lmap', bleed: 'all', z: 11 });
  s += L(c, 1, light, { id: 't13light', bleed: 'all', z: 12 });
  s += L(c, 1, FURN, { id: 't13bed', z: 20 });
  s += L(c, 1, SPEARSVG, { id: 't13spear', z: 22, op: ramp(t, 125.4, 125.75, E.inOut) });
  // hat highlight in the light (on top of the bed layer)
  s += L(c, 1, `<ellipse cx="${HAT.cx - 8}" cy="${HAT.y - 24}" rx="34" ry="16" fill="#FFF4DC" opacity="${f2(0.18 + 0.2 * glowUp)}"/>`, { id: 't13hl', z: 23 });
  // dust motes in the beam (screen space, clipped to the shaft)
  const sp = P1.map((p) => toScreen(c, 1, p));
  s += `<defs><clipPath id="t13shc"><path d="M${sp.map((p) => p.map(f2).join(',')).join(' L')}Z"/></clipPath></defs>`;
  s += `<g clip-path="url(#t13shc)">${motes(t, { seed: 31, n: 46, area: [300, 0, 1700, 1080], color: '#FFF4DC', op: 0.8, vx: -6, vy: 2 })}</g>`;
  // light bloom into the 休书 (T21): the room falls to blue-grey while the pool brightens (the morph is in frame())
  if (t > 127.9) {
    const dk = ramp(t, 127.9, T32 + 0.3, E.inOut);
    const ps = toScreen(c, 1, pc);
    s += `<rect x="-10" y="-10" width="1940" height="1100" fill="#2A2E38" opacity="${f2(0.72 * dk)}" data-layer="t13dim" data-z="40"/>`;
    const b = ramp(t, 128.0, 128.5, E.in);
    s += `<ellipse cx="${f2(ps[0])}" cy="${f2(ps[1])}" rx="${f2(240 + 120 * b)}" ry="${f2(70 + 40 * b)}" fill="url(#t13bloom)" opacity="${f2(0.45 * dk + 0.5 * b)}"/>`;
  }
  return s;
}

// ======================================================================= S32 / S33 · the 休书 overhead
// S01's position and tilt (storyboard: sheet x 760–1440, tilted −4°, ≈ 70 % of the frame height).
const SH = { x: 760, y: 70, w: 680, h: 760, rot: -4 };   // S01's x and tilt; lifted 86 px so the print clears the subtitle band
const SHC = [SH.x + SH.w / 2, SH.y + SH.h / 2];
const sheetTf = `rotate(${SH.rot} ${SHC[0]} ${SHC[1]}) translate(${SH.x} ${SH.y})`;
const rotP = (p) => { // sheet-local -> world
  const a = (SH.rot * Math.PI) / 180, x = SH.x + p[0] - SHC[0], y = SH.y + p[1] - SHC[1];
  return [SHC[0] + x * Math.cos(a) - y * Math.sin(a), SHC[1] + x * Math.sin(a) + y * Math.cos(a)];
};
const PRINT_L = XS.anchor('print', SH.w, SH.h);   // palm-print centre (cast/xiushu.mjs draws it 330 px high, rot −6°)
const PRINT_W = rotP(PRINT_L);
// promise row (sheet-local): ≈ 150 px glyphs, advance 172, centred on the sheet, screen y ≈ 430
const PFS = 168, PADV = 184, PROW_Y = 322;
const PX = (i) => SH.w / 2 + (i - 2.5) * PADV;

// L8 text glyph boxes, mirroring cast/xiushu.mjs (used only to seed the release particles)
function l8Glyphs() {
  const w = SH.w, h = SH.h, k = w / 680;
  const TEXT = ['东京八十万禁军教头林冲', '为因身犯重罪断配沧州', '去后存亡不保有妻张氏', '年少情愿立此休书任从', '改嫁永无争执委是自行', '情愿即非相逼'];
  const xH = 632 * k, dx = 62 * k, fsH = 62 * k, fs = 45 * k;
  const out = [];
  ['休', '书'].forEach((ch, i) => out.push({ ch, x: xH - fsH / 2, y: 80 * k + i * fsH * 1.14, fs: fsH }));
  TEXT.forEach((col, c) => [...col].forEach((ch, i) => out.push({ ch, x: xH - (c + 1) * dx - fs / 2, y: 74 * k + i * fs * 1.2, fs })));
  return out;
}
const L8 = l8Glyphs();
const PARTS = (() => {
  const R = rng(77), out = [];
  for (const g of L8) for (const [u, v] of (GLYPHS[g.ch] || []).slice(0, 9)) out.push({ x: g.x + u * g.fs, y: g.y + v * g.fs, r: 1.0 + R() * 1.5, d: R() * 0.35, life: 1.2 + R() * 1.2, vy: 110 + R() * 300, ph: R() * 9, big: 0, sx: (R() - 0.5) * 2 });
  [...PROMISE].forEach((ch, i) => { for (const [u, v] of GLYPHS[ch] || []) out.push({ x: PX(i) - PFS / 2 + u * PFS, y: PROW_Y - PFS / 2 + v * PFS * 0.95, r: 1.6 + R() * 2.2, d: R() * 0.25, life: 1.4 + R() * 1.2, vy: 150 + R() * 330, ph: R() * 9, big: 1, sx: (R() - 0.5) * 2 }); });
  return out;
})();

function promiseGlyph(i) {
  // ink with a gold edge and a light dry-brush texture, baked once per glyph (box 220 × 220, drawn at 1.5x)
  const ch = PROMISE[i];
  const T = (extra) => `<text x="110" y="112" text-anchor="middle" dominant-baseline="central" font-family="Ma Shan Zheng" font-size="${PFS}" ${extra}>${ch}</text>`;
  const inner = `<defs><filter id="t13dry${i}" x="-10%" y="-10%" width="120%" height="120%">` +
    `<feTurbulence type="fractalNoise" baseFrequency="0.55 0.035" numOctaves="2" seed="${3 + i}" result="n"/>` +
    `<feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -3.2 2.75" result="holes"/>` +
    `<feComposite in="SourceGraphic" in2="holes" operator="in" result="dry"/>` +
    `<feTurbulence type="fractalNoise" baseFrequency="0.07" numOctaves="2" seed="${9 + i}" result="w"/>` +
    `<feDisplacementMap in="dry" in2="w" scale="4"/></filter>` +
    `<filter id="t13gg${i}" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="2.2"/></filter></defs>` +
    `<g filter="url(#t13gg${i})" opacity="0.55">${T('fill="none" stroke="#F0C870" stroke-width="12" stroke-linejoin="round"')}</g>` +
    T('fill="#D9B262" stroke="#D9B262" stroke-width="6.5" stroke-linejoin="round"') +
    `<g filter="url(#t13dry${i})">${T('fill="#15100C"')}</g>`;
  return bake(`t13p${i}`, 330, 330, inner, { vb: '0 0 220 220' });
}
const PGLYPH = [...PROMISE].map((_, i) => promiseGlyph(i));

function brushReveal(i, t) {
  // diagonal sweep (top-left -> bottom-right) over 0.30 s, soft edge; glyph box in sheet-local coords
  const p = ramp(t, PT[i], PT[i] + 0.3, E.out);
  if (p <= 0) return '';
  const x = PX(i) - 110, y = PROW_Y - 110, id = `t13pm${i}`;
  const a = clamp(p * 1.25) - 0.25, b = a + 0.25;
  const sc = 1 + 0.05 * (1 - ramp(t, PT[i], PT[i] + 0.4, E.out));
  const mask = `<linearGradient id="${id}g" gradientUnits="userSpaceOnUse" x1="${x}" y1="${y}" x2="${x + 220}" y2="${y + 260}"><stop offset="${f2(clamp(a))}" stop-color="#fff"/><stop offset="${f2(clamp(b))}" stop-color="#000"/></linearGradient>` +
    `<mask id="${id}" maskUnits="userSpaceOnUse" x="${x - 20}" y="${y - 20}" width="260" height="260"><rect x="${x - 20}" y="${y - 20}" width="260" height="260" fill="url(#${id}g)"/></mask>`;
  return `<defs>${mask}</defs><g mask="url(#${id})"><g transform="translate(${f2(PX(i))} ${PROW_Y}) scale(${f2(sc * 1000) / 1000}) translate(-110 -110)"><g transform="scale(0.6667)">${PGLYPH[i]}</g></g></g>`;
}

// ---- the five memories that drift in during the gather (ink-wash vignettes, desaturated)
function vigWindow() {
  let s = `<rect x="-130" y="-150" width="260" height="300" fill="#3b3833"/><rect x="-115" y="-135" width="230" height="270" fill="#c9bfa8"/>`;
  for (let i = 1; i < 4; i++) s += `<rect x="${-115 + i * 57.5 - 3}" y="-135" width="6" height="270" fill="#3b3833"/>`;
  for (let j = 1; j < 5; j++) s += `<rect x="-115" y="${-135 + j * 54 - 3}" width="230" height="6" fill="#3b3833"/>`;
  s += `<g fill="#2a2622" opacity="0.8"><path d="M-70,135 C-75,60 -60,10 -40,-5 C-52,-20 -54,-46 -38,-58 C-22,-70 -2,-60 -2,-40 C0,-22 -10,-8 -20,-4 C0,10 10,70 6,135Z"/><circle cx="-34" cy="-70" r="14"/>` +
    `<path d="M30,135 C26,60 30,0 52,-14 C38,-26 36,-52 52,-64 C70,-76 92,-62 90,-42 C88,-24 78,-14 70,-12 C96,0 100,70 96,135Z"/><path d="M50,-66 L44,-90 L60,-76 M86,-60 L100,-82 L96,-62"/><path d="M40,-10 C20,-14 6,-14 -6,-20" stroke="#2a2622" stroke-width="12" fill="none" stroke-linecap="round"/></g>`;
  return s;
}
function vigBowls(t) {
  // two black-glazed bowls on the table edge; two steam ribbons rising and twining into one
  let s = `<path d="M-190,62 L190,62 L190,120 L-190,120Z" fill="#3b3833"/>`;
  for (const x of [-62, 62]) s += `<path d="M${x - 48},14 C${x - 46},48 ${x - 24},62 ${x},62 C${x + 24},62 ${x + 46},48 ${x + 48},14Z" fill="#1f1c19"/><ellipse cx="${x}" cy="14" rx="48" ry="11" fill="#4a453e"/><ellipse cx="${x}" cy="14" rx="40" ry="7" fill="#6b645a"/>`;
  const rib = (x0, dir, ph) => {
    const pts = [];
    for (let i = 0; i <= 12; i++) {
      const v = i / 12, y = 4 - v * 200;
      const twist = Math.sin(v * 9 + t * 2.2 + ph) * (10 + 26 * v);
      const k = clamp((v - 0.25) / 0.45), sm = k * k * (3 - 2 * k);
      pts.push([lerp(x0, 0, sm) + twist * dir, y]);
    }
    return smooth(pts, false);
  };
  for (const [x0, dir, col] of [[-62, 1, '#d6ccb8'], [62, -1, '#c4baa6']]) {
    const d = rib(x0, dir, 0);
    s += `<path d="${d}" stroke="${col}" stroke-width="22" fill="none" opacity="0.18" stroke-linecap="round"/><path d="${d}" stroke="${col}" stroke-width="7" fill="none" opacity="0.7" stroke-linecap="round"/>`;
  }
  return s;
}
function fistDraw(x, y, size, open = 0, rot = 0, opts = {}) {
  if (FISTM && typeof FISTM.fist === 'function') return FISTM.fist(x, y, size, { open, rot, ...opts });
  // stand-in: a 3/4 side clenched fist, knuckles up, thumb across the middle phalanges, sleeve below
  const k = size / 360, sk = opts.ink ? '#4a453e' : '#efb58e', sks = opts.ink ? '#2a2622' : '#d29a76', ln = opts.ink ? '#1a1714' : '#8a5238';
  const LN = `stroke="${ln}" stroke-width="${f2(5)}" stroke-linejoin="round" stroke-linecap="round"`;
  let s = `<g transform="translate(${f2(x)} ${f2(y)}) rotate(${rot}) scale(${f2(k)})">`;
  if (!opts.noSleeve) s += `<path d="M-120,120 L-110,420 L170,440 L150,110Z" fill="${opts.ink ? '#2a2622' : '#2F6B52'}" ${LN}/><path d="M-70,90 L-80,160 L110,160 L100,90Z" fill="${sk}" ${LN}/>`;
  s += `<path d="M-150,-60 C-160,-120 -110,-170 -40,-172 L90,-170 C150,-168 178,-120 176,-60 L170,40 C166,100 120,130 60,130 L-60,130 C-120,128 -148,80 -150,20Z" fill="${sk}" ${LN}/>`;
  const sq = open;
  for (let i = 0; i < 4; i++) {
    const fx = -120 + i * 72;
    s += `<path d="M${fx},-150 C${fx - 4},-${190 - sq * 30} ${fx + 64},-${190 - sq * 30} ${fx + 62},-150 L${fx + 62},-70 C${fx + 60},-50 ${fx + 2},-50 ${fx},-70Z" fill="${sk}" ${LN}/>`;
    s += `<path d="M${fx + 10},-120 Q${fx + 31},-108 ${fx + 52},-120" fill="none" stroke="${ln}" stroke-width="3" opacity="0.6"/>`;
  }
  s += `<path d="M-160,-40 C-176,10 -150,60 -90,70 L40,58 C80,52 84,10 50,4 L-80,-6 C-110,-14 -128,-40 -160,-40Z" fill="${sk}" ${LN}/>`;
  s += `<path d="M-130,40 C-90,60 -40,62 10,52" stroke="${sks}" stroke-width="10" fill="none" opacity="0.6"/>`;
  return s + '</g>';
}
function vigFist() { return `<g filter="url(#t13inkf)">${fistDraw(0, 30, 150, 0, -10, { ink: true, id: 't13vf' })}</g>`; }
function vigDoor() {
  let s = `<rect x="-120" y="-150" width="240" height="300" fill="#2a2622"/><rect x="-108" y="-140" width="104" height="290" fill="#4a453e"/><rect x="4" y="-140" width="104" height="290" fill="#433e38"/>`;
  for (const y of [-90, 0, 90]) s += `<rect x="-104" y="${y}" width="208" height="8" fill="#2a2622"/>`;
  s += `<rect x="-3" y="-140" width="6" height="290" fill="#E07A3A" opacity="0.85"/><rect x="-12" y="-140" width="24" height="290" fill="#E07A3A" opacity="0.18"/>`;
  return s;
}
const VIGS = [
  { t: 128.534, from: [-520, -420], draw: () => vigWindow(), size: 1 },
  { t: 129.37, from: [-760, 40], draw: (t) => vigBowls(t), size: 1 },
  { t: 130.19, from: [760, -80], draw: () => vigFist(), size: 1 },
  { t: 131.03, from: [600, 420], draw: () => vigDoor(), size: 1 },
];
function vignette(v, t, id) {
  const a = v.t, life = 1.5;
  if (t < a || t > a + life + 0.6) return '';
  const k = ramp(t, a, a + life, E.inOut);
  const pos = [SHC[0] + v.from[0] * (1 - k), SHC[1] + v.from[1] * (1 - k)];
  const sc = lerp(1.45, 0.5, k);
  const op = Math.min(ramp(t, a, a + 0.35, E.out), 1 - ramp(t, a + life * 0.72, a + life, E.in));
  if (op <= 0.01) return '';
  return `<defs>${rg(id + 'm', [[0, '#fff'], [0.62, '#fff'], [1, '#000']], 0.5, 0.5, 0.5)}<mask id="${id}" maskUnits="userSpaceOnUse" x="-200" y="-200" width="400" height="400"><ellipse cx="0" cy="0" rx="190" ry="190" fill="url(#${id}m)"/></mask></defs>` +
    `<g transform="translate(${f2(pos[0])} ${f2(pos[1])}) scale(${f2(sc)})" opacity="${f2(op * 0.95)}"><g mask="url(#${id})"><rect x="-200" y="-200" width="400" height="400" fill="#b3aa98" opacity="0.42"/>${v.draw(t)}</g></g>`;
}
function absorbStain(t) {
  // each arriving memory soaks into the paper: a soft ink stain that blooms and fades (sheet-local)
  let s = '';
  VIGS.forEach((v, i) => {
    const a = v.t + 1.05, k = ramp(t, a, a + 0.5, E.out), f = 1 - ramp(t, a + 0.4, a + 1.4, E.inOut);
    if (k <= 0 || f <= 0) return;
    const dir = [v.from[0], v.from[1]], n = Math.hypot(dir[0], dir[1]);
    const p = [SH.w / 2 + (dir[0] / n) * 200, SH.h / 2 + (dir[1] / n) * 230];
    s += `<circle cx="${f2(p[0])}" cy="${f2(p[1])}" r="${f2(30 + 110 * k)}" fill="url(#t13stain)" opacity="${f2(0.5 * f)}"/>`;
  });
  return s;
}

function inkNight(t) {
  return `<defs>${rg('t13night', [[0, '#343946'], [0.55, '#2A2E38'], [1, '#14161C']], 0.55, 0.48, 0.75)}${rg('t13halo', [[0, '#E8D6AE', 0.32], [1, '#E8D6AE', 0]])}${rg('t13stain', [[0, '#2a2018', 0.6], [0.6, '#2a2018', 0.25], [1, '#2a2018', 0]])}${rg('t13pb', [[0, '#E0503E', 0.55], [0.5, '#E0503E', 0.22], [1, '#E0503E', 0]])}` +
    `<filter id="t13inkf" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="0.25 0.35 0.1 0 0.02  0.24 0.34 0.1 0 0.02  0.22 0.3 0.1 0 0.02  0 0 0 1 0"/></filter></defs>` +
    `<rect x="-200" y="-200" width="2320" height="1480" fill="url(#t13night)"/>` + CLOUDS.replace('<image ', `<image transform="translate(${f2(-160 + (t - T32) * 6)} -60)" `);
}
const CLOUDS = (() => {
  // faint ink-wash clouds drifting in the night around the paper (baked; radial fades, no hard edges)
  const R = rng(41);
  let s = `<defs>${rg('t13cd', [[0, '#0d0f14', 0.55], [0.55, '#0d0f14', 0.25], [1, '#0d0f14', 0]])}${rg('t13cl2', [[0, '#4a5163', 0.4], [0.55, '#4a5163', 0.16], [1, '#4a5163', 0]])}</defs>`;
  for (let i = 0; i < 18; i++) s += `<ellipse cx="${f2(R() * 2200)}" cy="${f2(R() * 1200)}" rx="${f2(220 + R() * 320)}" ry="${f2(90 + R() * 150)}" fill="url(#${R() < 0.55 ? 't13cd' : 't13cl2'})"/>`;
  return bake('t13_clouds', 2200, 1200, s);
})();
function hazeBg(op) {
  if (op <= 0) return '';
  return `<defs>${lg('t13hz', [[0, '#CDBB9A'], [0.45, '#B8A684'], [1, '#7E6F58']])}${rg('t13hzs', [[0, '#F3E4C6', 0.75], [0.6, '#E3D3B5', 0.3], [1, '#E3D3B5', 0]])}` +
    `${rg('t13hzv', [[0.55, '#2a2118', 0], [1, '#2a2118', 0.55]], 0.5, 0.45, 0.75)}</defs><g opacity="${f2(op)}"><rect x="-200" y="-200" width="2320" height="1480" fill="url(#t13hz)"/>` +
    `<ellipse cx="1290" cy="380" rx="620" ry="460" fill="url(#t13hzs)"/>` +
    `<rect x="-200" y="-200" width="2320" height="1480" fill="url(#t13hzv)"/></g>`;
}

function s32cam(t) {
  // push toward the handprint during the gather (the print drifts toward the centre so the sheet stays in frame),
  // pull back for the promise, hold for the release; S33: the paper shrinks to the left third, print at (640, 440)
  const ps0 = PRINT_W;
  const z = kf(t, [[T32, 0.94], [129.2, 1.0, E.out], [132.8, 1.06, E.inOut], [133.3, 1.06], [135.6, 1.0, E.inOut]]);
  const kp = Math.min(ramp(t, 129.2, 132.8, E.inOut), 1 - ramp(t, 133.3, 135.6, E.inOut));
  let q = mix(ps0, [ps0[0] + 30, ps0[1] - 10], kp);
  let zz = z;
  if (t > T33 - 0.01) {
    const k = ramp(t, T33, 138.4, E.sine);
    q = mix(ps0, [640, 470], k);
    zz = lerp(1.0, 0.7, k) * (1 + 0.03 * ramp(t, 138.4, TEND, E.sine));
  }
  return camAt(PRINT_W, q, zz);
}

function paperLayer(t, c, opts = {}) {
  // ink of the L8 text: dims while the promise is written, lifts off at the release
  const inkL8 = t < REL ? lerp(1, 0.2, ramp(t, 133.55, 134.15)) : 0.2 * (1 - ramp(t, REL, REL + 0.3, E.in));
  const glow = 0.55 + 0.45 * ramp(t, T32, 129.0) + 0.2 * ramp(t, REL, REL + 0.5);
  let s = `<g transform="${sheetTf}">`;
  s += `<rect x="-60" y="-60" width="${SH.w + 120}" height="${SH.h + 120}" rx="60" fill="url(#t13halo)"/>`;
  s += xiushu({ w: SH.w, h: SH.h, id: 't13xs', ink: opts.blank ? 0 : inkL8, sign: opts.blank ? 0 : 1, print: 1, printOp: opts.printOp ?? 1, glow: Math.min(1, glow) });
  if (!opts.blank) s += absorbStain(t);
  // a clean band of paper under the promise row: the old columns are washed back where the promise is written
  const cb = opts.blank ? 0 : (t < REL ? ramp(t, 133.55, 134.15) : 1 - ramp(t, REL, REL + 0.3));
  if (cb > 0) s += `<defs>${lg('t13cb', [[0, '#EFE2C4', 0], [0.3, '#EFE2C4', 0.85], [0.7, '#EFE2C4', 0.85], [1, '#EFE2C4', 0]])}</defs><rect x="238" y="${PROW_Y - 118}" width="${SH.w - 244}" height="236" fill="url(#t13cb)" opacity="${f2(cb)}"/>`;
  // print bloom after the release
  const pb = ramp(t, REL, REL + 0.6, E.out) * (opts.printOp ?? 1);
  if (pb > 0) s += `<ellipse cx="${f2(PRINT_L[0])}" cy="${f2(PRINT_L[1])}" rx="200" ry="230" fill="url(#t13pb)" opacity="${f2(pb * (0.85 + 0.15 * Math.sin(t * 2.4)))}"/>`;
  // the promise row
  if (!opts.blank && t >= PT[0]) {
    const pop = t < REL ? 1 : 1 - ramp(t, REL, REL + 0.3, E.in);
    if (pop > 0) s += `<g opacity="${f2(pop)}">${[...PROMISE].map((_, i) => brushReveal(i, t)).join('')}</g>`;
  }
  // release particles: ink motes that turn to snow as they rise
  if (!opts.blank && t >= REL && t < REL + 3.2) {
    let ps = '';
    for (const p of PARTS) {
      const a = (t - REL - p.d) / p.life;
      if (a < 0 || a > 1) continue;
      const tt = t - REL - p.d;
      const rise = 150 * Math.min(tt, 0.28) + p.vy * Math.max(0, tt - 0.14) * (1 - a * 0.3);
      const dsp = ramp(tt, 0.12, 0.6, E.in);
      const x = p.x + (noise1(p.ph + tt * 1.6, 3) * 34 * a + p.sx * 60 * a + (p.x - SH.w / 2) * 0.22 * a) * dsp;
      const y = p.y - rise;
      const w = ramp(a, 0.06, 0.42, E.inOut);
      const col = w < 0.33 ? '#1A1410' : w < 0.66 ? '#77716a' : '#F1F3F5';
      const op = (a < 0.08 ? a / 0.08 : 1) * (1 - ramp(a, 0.65, 1, E.in)) * (w < 0.33 ? 0.85 : 1) * (1 - ramp(t, T33, 137.9));
      ps += `<circle cx="${f2(x)}" cy="${f2(y)}" r="${f2(p.r * (0.8 + a * 1.1))}" fill="${col}" opacity="${f2(op)}"/>`;
    }
    s += `<g data-layer="fx-release" data-z="70">${ps}</g>`;
  }
  return s + '</g>';
}

function s32(t) {
  const c = s32cam(t);
  let s = L(c, 0, inkNight(t), { id: 't13night', bleed: 'all', z: 1 });
  // S33: the warm haze of the 岳庙 sky fills the dark around the paper
  const hz = ramp(t, T33, 138.0, E.inOut);
  if (hz > 0) s += L(c, 0, hazeBg(hz), { id: 't13haze', bleed: 'all', z: 2 });
  // memories drifting in (behind the paper's edge, they fade into it)
  if (t < 133.2) s += L(c, 1, VIGS.map((v, i) => vignette(v, t, `t13v${i}`)).join(''), { id: 't13vig', bleed: 'all', z: 8 });
  const printOp = t < 140.95 ? 1 : 0;
  s += L(c, 1, paperLayer(t, c, { printOp }), { id: 't13paper', bleed: 'all', z: 10 });
  // snow, the fifth memory: falls from the top onto the paper and melts (131.87)
  if (t > 131.6 && t < 133.9) {
    const k = Math.min(ramp(t, 131.87, 132.3, E.out), 1 - ramp(t, 133.2, 133.9));
    s += `<g opacity="${f2(k)}">${snow(t, { seed: 132, n: 70, r: [2, 5], fall: 120, sway: 18, area: [700, -60, 1500, 760], color: '#E8ECEF', op: 0.85, cam: c, d: 1 })}</g>`;
  }
  // after the release, a few flakes keep drifting upward into the dark
  if (t > REL + 1.2 && t < T33 + 1.4) {
    const k = 1 - ramp(t, T33, T33 + 1.4);
    s += `<g opacity="${f2(k * 0.6)}">${snow(t, { seed: 133, n: 26, r: [1.5, 3.5], fall: -60, sway: 20, area: [700, -60, 1600, 900], color: '#F1F3F5', op: 0.8, cam: c, d: 1 })}</g>`;
  }
  // S33: the fist rises into the right third (slow, then holds; trembles; tightens at 141.03)
  // (owner 2026-11-08: no fist — the ending is carried by the print alone)
  return s;
}

const FISTC = [1470, 384], FISTS = 330, FISTR = -14;   // right of the subtitle block: forearm and sleeve angle to the lower right
function fistLayer(t, still = false) {
  const k = ramp(t, 137.2, 138.45, (x) => 1 - Math.pow(1 - x, 2.4));
  const y = lerp(1560, FISTC[1], k);
  const tr = still ? [0, 0] : [noise1(t * 8, 4) * 1.5, noise1(t * 8 + 11, 5) * 1.5];
  const tight = ramp(t, 141.03, 141.3, E.out);
  const sc = 1 - 0.025 * tight;
  // warm backlight behind the fist so it reads as one strong shape against the haze
  const bl = `<defs>${rg('t13fbl', [[0, '#FFF1D2', 0.8], [0.45, '#F6DFB4', 0.42], [1, '#E3D3B5', 0]])}</defs><ellipse cx="${FISTC[0] - 10}" cy="${f2(y + 10)}" rx="430" ry="400" fill="url(#t13fbl)" opacity="${f2(k)}"/>`;
  return `<g data-layer="t13fist" data-z="30">${bl}<g transform="translate(${f2(tr[0])} ${f2(tr[1])})">${fistDraw(FISTC[0], y, FISTS * sc, 0, FISTR, { id: 't13fs', light: 0.6 })}</g></g>`;
}

// ======================================================================= END card
const ENDBG = (() => {
  // the S33 frame (paper blank, fist) dimmed to 35 % and blurred 12 px, on ink with the paper texture
  const t = TEND;
  const c = s32cam(t);
  const inner = `<defs><filter id="t13eb" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="12"/></filter></defs>` +
    `<rect width="1920" height="1080" fill="#14110E"/>` +
    `<g filter="url(#t13eb)" opacity="0.24">${L(c, 0, hazeBg(1), { id: 'eb1' })}${L(c, 1, paperLayer(t, c, { blank: true, printOp: 0 }), { id: 'eb2' })}</g>` +
    `<image href="${furl(ASSET + '/paper.png')}" x="0" y="0" width="1920" height="1080" preserveAspectRatio="xMidYMid slice" opacity="0.06" style="mix-blend-mode:screen"/>` +
    `<radialGradient id="t13ev" cx="0.5" cy="0.45" r="0.75"><stop offset="0.5" stop-color="#0c0a08" stop-opacity="0"/><stop offset="1" stop-color="#0c0a08" stop-opacity="0.6"/></radialGradient><rect width="1920" height="1080" fill="url(#t13ev)"/>`;
  return bake('t13_endbg', 1920, 1080, inner);
})();

const SEALC = [960, 222], SEALS = 150;
function endCard(t) {
  let s = `<g data-layer="t13endbg" data-z="80">${ENDBG}</g>`;
  const fin = (a, d = 0.4) => ramp(t, a, a + d, E.out);
  const txt = (a, y, str, fs, fill, font, extra = '', dx = 0) => {
    const k = fin(a);
    if (k <= 0) return '';
    return `<text x="${f2(960 + dx)}" y="${f2(y + 14 * (1 - k))}" text-anchor="middle" dominant-baseline="central" font-family="${font}" font-weight="700" font-size="${fs}" fill="${fill}" opacity="${f2(k)}" ${extra}>${str}</text>`;
  };
  s += `<g data-layer="text-end" data-z="90">`;
  s += txt(142.27, 430, '《林冲为什么要休妻？》', 74, '#E2B865', 'LXGW WenKai', 'letter-spacing="3"');   // v4 title (the searched question)
  // owner 2026-11-08: no closing question on the end card
  // follow pill
  const kp = fin(143.523);
  if (kp > 0) {
    const pw = 600, ph = 76;
    s += `<g opacity="${f2(kp)}" transform="translate(0 ${f2(12 * (1 - kp))})"><rect x="${960 - pw / 2}" y="${600 - ph / 2}" width="${pw}" height="${ph}" rx="${ph / 2}" fill="#E2B865" fill-opacity="0.12" stroke="#E2B865" stroke-width="2.5"/>` +
      `<text x="960" y="600" text-anchor="middle" dominant-baseline="central" font-family="Noto Sans CJK SC" font-weight="700" font-size="38" fill="#F2DDA6" letter-spacing="2">关注 Juno · 一起看懂世界</text></g>`;
  }
  s += txt(144.35, 735, '下回：鲁智深', 40, '#E9E1D0', 'LXGW WenKai', 'letter-spacing="4"');
  s += txt(144.76, 940, '资料：《水浒传》一百二十回本 第七—十一、二十回', 28, '#A99F8E', 'Noto Sans CJK SC', 'font-weight="400" letter-spacing="1"');
  s += '</g>';
  return s;
}

function sealStamp(t) {
  // the red palm print contracts into the J seal and stamps on 141.862
  let s = '';
  if (t >= 140.95 && t < TEND + 0.05) {
    const k = ramp(t, 140.95, 141.8, E.sine);
    const c = s32cam(t);
    const p0 = toScreen(c, 1, PRINT_W);
    const p = mix(p0, SEALC, k);
    const h = lerp(330 * (c.zoom || 1), 150, k);
    s += `<g opacity="${f2(1 - ramp(t, 141.72, 141.85))}">${printSVG(p[0], p[1], h, SH.rot - 6 + 6 * k, 1)}</g>`;
  }
  if (t >= 141.78) {
    const k = ramp(t, 141.78, TEND, E.in);
    const land = ramp(t, TEND, TEND + 4 / 30, E.out);
    const sc = t < TEND ? lerp(1.6, 1.25, k) : lerp(1.25, 1.0, land);
    const [jx, jy] = shake(t, TEND, 3, 3, 2);
    const op = t < TEND ? k : 1;
    const spread = ramp(t, TEND, TEND + 0.3, E.out);
    s += `<g data-layer="t13seal" data-z="95" opacity="${f2(op)}">`;
    if (spread > 0) s += `<circle cx="${SEALC[0]}" cy="${SEALC[1]}" r="${f2(SEALS * 0.5 + 2 * spread)}" fill="#B3302A" opacity="${f2(0.08 * spread)}"/>`;
    s += jseal(SEALC[0] + jx, SEALC[1] + jy, SEALS * sc, -6, 1);
    s += '</g>';
  }
  return s;
}

export default {
  // window-frame dissolve from T12: the window rectangle (≈ 982–1500 × 168–791, T12 at 124.8) changes first and
  // holds its place; the rest of the room follows, the left side (his profile) last, so nothing crosses his face.
  enter: {
    a: 124.78, b: 125.62, type: 'mask',
    mask(t) {
      const p = E.inOut(clamp((t - 124.78) / 0.84));
      const g = (v) => { const c = Math.round(255 * clamp(v)); return `rgb(${c},${c},${c})`; };
      const pw = clamp(p * 1.8), pr = p, pl = clamp((p - 0.72) / 0.28);
      return `<linearGradient id="t13dm" gradientUnits="userSpaceOnUse" x1="300" y1="0" x2="1150" y2="0"><stop offset="0" stop-color="${g(pl)}"/><stop offset="1" stop-color="${g(pr)}"/></linearGradient>` +
        `<rect x="-10" y="-10" width="1940" height="1100" fill="url(#t13dm)"/><rect x="976" y="162" width="530" height="636" fill="${g(pw)}"/>`;
    },
  },
  noBrand: (t) => t >= 141.8,
  frame(t) {
    if (t < 128.3) return s31(t);
    let s = '';
    if (t < 128.95) {
      // light bloom (T21): the floor light pool grows into the glowing 休书 over 15 frames (128.40–128.90)
      const r = ramp(t, 128.36, 128.92, E.sine);
      const p0 = poolScreen(Math.min(t, 128.9));
      const cc = mix(p0, [1080, 470], r);
      const rx = lerp(180, 1750, Math.pow(r, 1.15)), ry = lerp(55, 1300, Math.pow(r, 1.15));
      s += s31(t);
      const op32 = ramp(t, 128.32, 128.52, E.inOut);
      s += `<defs><radialGradient id="t13mg" gradientUnits="userSpaceOnUse" cx="${f2(cc[0])}" cy="${f2(cc[1])}" r="${f2(rx)}" gradientTransform="translate(${f2(cc[0])} ${f2(cc[1])}) scale(1 ${f2(ry / rx)}) translate(${f2(-cc[0])} ${f2(-cc[1])})">` +
        `<stop offset="0" stop-color="#fff"/><stop offset="0.62" stop-color="#fff"/><stop offset="1" stop-color="#000"/></radialGradient>` +
        `<mask id="t13morph" maskUnits="userSpaceOnUse" x="-10" y="-10" width="1940" height="1100"><rect x="-10" y="-10" width="1940" height="1100" fill="url(#t13mg)"/></mask></defs>`;
      s += `<g mask="url(#t13morph)" opacity="${f2(op32)}">${s32(t)}</g>`;
      const g = Math.sin(Math.PI * clamp((t - 128.3) / 0.65));
      s += `<defs>${rg('t13bl2', [[0, '#FFF6E2', 0.9], [0.5, '#FFEFD0', 0.45], [1, '#F2DDB4', 0]])}</defs><ellipse cx="${f2(cc[0])}" cy="${f2(cc[1])}" rx="${f2(rx * 0.9 + 120)}" ry="${f2(ry * 0.9 + 60)}" fill="url(#t13bl2)" opacity="${f2(0.6 * g)}"/>`;
      return s;
    }
    if (t < 141.45) return s32(t) + (t >= 140.95 ? sealStamp(t) : '');
    // into the end card: live S33 crossfades to the dimmed, blurred card ground; the print becomes the seal
    if (t < TEND + 0.4) s += s32(Math.min(t, TEND + 0.4));
    const kb = ramp(t, 141.5, TEND + 0.25, E.inOut);
    if (kb > 0) s += `<g opacity="${f2(kb)}">${endCard(t)}</g>`;
    s += sealStamp(t);
    // fade to black over the last 0.6 s
    const fb = ramp(t, 147.9, 148.5, E.in);
    if (fb > 0) s += `<rect x="-10" y="-10" width="1940" height="1100" fill="#000" opacity="${f2(fb)}"/>`;
    return s;
  },
};
