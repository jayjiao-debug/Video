// T09 · S20+S21 · 沧州 snow · 73.600–77.748 (retimed, film/timing.md)
// Opens on his snow-dusted shoulder (position-match dissolve from T08's shoulder), cranes back over the snowed
// 草料场: the 草厅 sags (74.84) and caves in under the snow (75.256, 「雪压塌了草屋」). He stops dead, turns from the
// ruin (76.077) and trudges to the 山神庙 door, pulls it (77.33); the door leaf swings to the lens (door-leaf wipe
// into T10). Colour script C7: dusk #5C6B80, snow #DDE6EE / #EEF2F5, no fire. Top-right kept calm (engine stamp).
import { L, kf, E, ramp, zexp, snow, blurId, ridge, lg, rg, f2, clamp, rng, noise1, fbm1, lerp, toScreen, shake } from '../lib.mjs';
import { lin, EX } from '../../chars/rig/linchong.mjs';

const T0 = 73.6, COLLAPSE = 75.256, SAG = 74.84, TURN = 76.077, PULL = 77.33;
const HFIG = 430;           // FS scale: 1.80 m = 430 px at zoom 1
const GY = 905;             // his ground line (world, d 1)

// ------------------------------------------------------------------ static plates (inline; cheap paths)
const bake = (name, w, h, inner, o = {}) => `<g transform="translate(${o.x || 0} ${o.y || 0})"><defs>${o.defs || ''}</defs>${inner}</g>`;
const SKY = (() => {
  const defs = lg('t09sk', [[0, '#4A586C'], [0.55, '#6C7A8E'], [1, '#A3AEBB']]);
  let s = `<rect width="2400" height="1500" fill="url(#t09sk)"/>`;
  // soft cloud banks
  const R = rng(91);
  for (let i = 0; i < 14; i++) {
    const x = R() * 2400, y = 120 + R() * 380, w = 300 + R() * 500, h = 40 + R() * 60;
    s += `<ellipse cx="${f2(x)}" cy="${f2(y)}" rx="${f2(w)}" ry="${f2(h)}" fill="#8A97A8" opacity="${f2(0.18 + R() * 0.15)}"/>`;
  }
  return bake('t09_sky', 2400, 1500, s, { defs });
})();

const MOUNT_FAR = (() => {
  const defs = lg('t09mf', [[0, '#3E4A5A'], [1, '#7E8B9C']]) + lg('t09fog', [[0, '#A3AEBB', 0], [1, '#A3AEBB', 0.95]]);
  let s = `<path d="${ridge(17, -100, 2700, 620, 330, 1100, 20)}" fill="url(#t09mf)"/>`;
  // snow on the peaks: a lighter ridge clipped high
  s += `<path d="${ridge(17, -100, 2700, 620, 330, 1100, 20)}" fill="#DDE4EC" opacity="0.35" transform="translate(0 6)"/>`;
  s += `<rect x="-100" y="430" width="2800" height="260" fill="url(#t09fog)"/>`;
  return bake('t09_mtnfar', 2600, 1100, s, { defs });
})();

const MOUNT_MID = (() => {
  const defs = lg('t09mm', [[0, '#34404E'], [1, '#5E6B7C']]) + lg('t09fog2', [[0, '#9AA6B2', 0], [1, '#9AA6B2', 0.9]]);
  let s = `<path d="${ridge(29, -100, 2700, 680, 230, 1100, 18)}" fill="url(#t09mm)"/>`;
  // snowy slopes: pale strokes following the ridge
  const R = rng(5);
  for (let i = 0; i < 40; i++) {
    const x = -100 + R() * 2800, y = 520 + R() * 160, w = 30 + R() * 90;
    s += `<path d="M${f2(x)},${f2(y)} q${f2(w * 0.5)},${f2(-8 - R() * 10)} ${f2(w)},${f2(4)}" stroke="#E6ECF2" stroke-width="${f2(3 + R() * 4)}" fill="none" opacity="${f2(0.25 + R() * 0.3)}" stroke-linecap="round"/>`;
  }
  s += `<rect x="-100" y="600" width="2800" height="200" fill="url(#t09fog2)"/>`;
  return bake('t09_mtnmid', 2600, 1100, s, { defs });
})();

const HILLS = (() => {
  // snowy hills meeting the plain (horizon ~ 640)
  const defs = lg('t09h', [[0, '#C9D3DD'], [1, '#E9EEF3']]);
  let s = `<path d="${ridge(41, -200, 2800, 700, 130, 1300, 20)}" fill="url(#t09h)"/>`;
  s += `<path d="${ridge(41, -200, 2800, 700, 130, 1300, 20)}" fill="none" stroke="#7F8C9C" stroke-width="2" opacity="0.5"/>`;
  // a line of bare trees (ink)
  const R = rng(8);
  for (let i = 0; i < 26; i++) {
    const x = -150 + R() * 2900, base = 600 + R() * 70, hh = 40 + R() * 50;
    s += `<path d="M${f2(x)},${f2(base)} l0,${f2(-hh)} M${f2(x)},${f2(base - hh * 0.6)} l${f2(-hh * 0.35)},${f2(-hh * 0.35)} M${f2(x)},${f2(base - hh * 0.75)} l${f2(hh * 0.3)},${f2(-hh * 0.3)}" stroke="#4E5A68" stroke-width="2.4" fill="none" opacity="0.55" stroke-linecap="round"/>`;
  }
  return bake('t09_hills', 2600, 1300, s, { defs });
})();

const PLAIN = (() => {
  // the snow plain from the horizon down (world d 0.9 band), soft blue shadows, wheel ruts and footprints
  const defs = lg('t09pl', [[0, '#C7D1DC'], [0.35, '#DDE6EE'], [1, '#EEF2F5']]);
  let s = `<rect x="0" y="0" width="2800" height="900" fill="url(#t09pl)"/>`;
  const R = rng(12);
  for (let i = 0; i < 30; i++) {
    const x = R() * 2800, y = 40 + R() * 800, w = 120 + R() * 380;
    s += `<ellipse cx="${f2(x)}" cy="${f2(y)}" rx="${f2(w)}" ry="${f2(6 + R() * 14)}" fill="#AEBBCB" opacity="${f2(0.12 + R() * 0.15)}"/>`;
  }
  return bake('t09_plain', 2800, 900, s, { defs });
})();

// The 山神庙 exterior, front facade facing the camera (world d 1, left side). Door: single plank leaf x 232–440.
const TEMPLE = (() => {
  const defs = lg('t09tw', [[0, '#6E6157'], [1, '#54473E']]) + lg('t09tr', [[0, '#3A3432'], [1, '#2A2522']]);
  const ox = 200, oy = 0; // drawn with +200 offset so the plate starts at world x -200
  const X = (x) => x + ox;
  let s = '';
  // platform / step
  s += `<path d="M${X(-180)},905 L${X(600)},905 L${X(612)},940 L${X(-180)},940Z" fill="#7C7266"/>`;
  // walls
  s += `<rect x="${X(-160)}" y="330" width="740" height="578" fill="url(#t09tw)"/>`;
  // corner post and lintel beams
  s += `<rect x="${X(540)}" y="330" width="38" height="578" fill="#4A3A30"/><rect x="${X(-160)}" y="330" width="740" height="34" fill="#4A3A30"/>`;
  // plaster cracks
  s += `<path d="M${X(40)},520 l18,40 l-10,30 l22,44 M${X(500)},640 l-14,36 l10,28" stroke="#3D332C" stroke-width="2" fill="none" opacity="0.6"/>`;
  // door frame (dark opening is drawn under the leaf)
  s += `<rect x="${X(214)}" y="398" width="244" height="510" fill="#3A2E26"/><rect x="${X(226)}" y="410" width="220" height="498" fill="#15100D"/>`;
  // a small window lattice on the left bay
  s += `<rect x="${X(-60)}" y="520" width="170" height="150" fill="#2A2420"/>`;
  for (let i = 1; i < 5; i++) s += `<rect x="${X(-60 + i * 34)}" y="520" width="4" height="150" fill="#6B5E54"/>`;
  s += `<rect x="${X(-60)}" y="594" width="170" height="4" fill="#6B5E54"/>`;
  // roof: tiled, snow-laden, upturned eaves
  s += `<path d="M${X(-230)},346 Q${X(180)},300 ${X(640)},330 L${X(690)},300 Q${X(560)},286 ${X(470)},200 L${X(-90)},200 Q${X(-170)},280 ${X(-260)},318Z" fill="url(#t09tr)"/>`;
  for (let i = 0; i < 18; i++) s += `<path d="M${X(-200 + i * 48)},${f2(330 - (i > 12 ? (i - 12) * 2 : 0))} l18,-120" stroke="#1E1A18" stroke-width="3" opacity="0.6"/>`;
  // snow on the roof
  s += `<path d="M${X(-270)},322 Q${X(-170)},276 ${X(-96)},196 L${X(476)},196 Q${X(560)},276 ${X(700)},298 Q${X(640)},318 ${X(560)},312 Q${X(420)},300 ${X(300)},318 Q${X(150)},300 ${X(20)},322 Q${X(-120)},314 ${X(-270)},322Z" fill="#EEF2F5"/>`;
  s += `<path d="M${X(-96)},196 L${X(476)},196 L${X(470)},212 L${X(-90)},212Z" fill="#C9D3DD"/>`;
  // ridge ornament
  s += `<path d="M${X(-110)},198 q-20,-36 -4,-56 q6,22 24,30Z M${X(490)},198 q20,-36 4,-56 q-6,22 -24,30Z" fill="#2A2522"/>`;
  // icicles under the eave
  const R = rng(4);
  for (let i = 0; i < 16; i++) { const x = X(-200 + i * 52 + R() * 20), l = 8 + R() * 22; s += `<path d="M${f2(x)},330 l4,${f2(l)} l4,${f2(-l)}Z" fill="#E7EEF5" opacity="0.8"/>`; }
  // snow drift against the wall
  s += `<path d="M${X(-180)},910 Q${X(-60)},860 ${X(120)},880 Q${X(200)},894 ${X(226)},900 L${X(226)},912 L${X(-180)},912Z" fill="#E6ECF2"/>`;
  return bake('t09_temple', 960, 960, s, { defs, x: -200, y: 0 });
})();

// ------------------------------------------------------------------ the 草料场 (world d 0.85)
function haystack(cx, base, r, seed) {
  const R = rng(seed);
  let s = `<path d="M${f2(cx - r)},${base} Q${f2(cx - r * 1.05)},${f2(base - r * 1.3)} ${f2(cx)},${f2(base - r * 1.45)} Q${f2(cx + r * 1.05)},${f2(base - r * 1.3)} ${f2(cx + r)},${base}Z" fill="#8F7A55"/>`;
  s += `<path d="M${f2(cx + r * 0.2)},${f2(base - r * 1.4)} Q${f2(cx + r * 1.05)},${f2(base - r * 1.2)} ${f2(cx + r)},${base} L${f2(cx + r * 0.35)},${base}Z" fill="#6E5D41" opacity="0.7"/>`;
  for (let i = 0; i < 10; i++) { const a = -2.6 + R() * 2.2; s += `<path d="M${f2(cx + Math.cos(a) * r * 0.6)},${f2(base - r * 0.5 + Math.sin(a) * r * 0.6)} l${f2(6 + R() * 8)},${f2(10 + R() * 6)}" stroke="#5E4E36" stroke-width="2" opacity="0.6"/>`; }
  // snow cap
  s += `<path d="M${f2(cx - r * 0.92)},${f2(base - r * 0.7)} Q${f2(cx - r * 0.9)},${f2(base - r * 1.42)} ${f2(cx)},${f2(base - r * 1.56)} Q${f2(cx + r * 0.9)},${f2(base - r * 1.42)} ${f2(cx + r * 0.92)},${f2(base - r * 0.7)} Q${f2(cx + r * 0.5)},${f2(base - r * 0.86)} ${f2(cx + r * 0.1)},${f2(base - r * 0.74)} Q${f2(cx - r * 0.4)},${f2(base - r * 0.9)} ${f2(cx - r * 0.92)},${f2(base - r * 0.7)}Z" fill="#EEF2F5"/>`;
  s += `<path d="M${f2(cx - r)},${base} Q${f2(cx)},${f2(base - 16)} ${f2(cx + r)},${base} L${f2(cx + r + 20)},${base + 8} L${f2(cx - r - 20)},${base + 8}Z" fill="#E3E9EF"/>`;
  return s;
}
const FENCE = (() => {
  let s = '';
  for (let i = 0; i < 16; i++) {
    const x = 880 + i * 70, top = 708 + (i % 3) * 4;
    s += `<rect x="${x}" y="${top}" width="12" height="${812 - top}" fill="#4F4234"/><path d="M${x - 3},${top + 2} q9,-12 18,0Z" fill="#EEF2F5"/>`;
  }
  s += `<rect x="880" y="735" width="1060" height="7" fill="#5A4B3B"/><rect x="880" y="770" width="1060" height="7" fill="#5A4B3B"/>`;
  s += `<rect x="880" y="731" width="1060" height="5" fill="#EEF2F5" opacity="0.9"/>`;
  return s;
})();
const STACKS = haystack(1790, 812, 92, 3) + haystack(1905, 822, 70, 6);

/** The two-bay thatched 草厅: sag s 0..1, collapse c 0..1. */
function hut(sag, c) {
  const X0 = 1080, X1 = 1640, B = 812, WT = 650; // walls from WT to B
  let s = '';
  const lean = c * 9;
  // walls (two bays), posts lean outward when it caves in
  const wallH = (B - WT) * (1 - c * 0.45);
  s += `<g transform="translate(0 ${f2(c * (B - WT) * 0.45)})">`;
  s += `<path d="M${X0},${f2(WT)} L${X1},${f2(WT)} L${X1},${B - c * (B - WT) * 0.45} L${X0},${B - c * (B - WT) * 0.45}Z" fill="#7A6A52" transform="scale(1 ${f2(1)})"/>`;
  s += '</g>';
  // redraw walls with proper compression
  s = '';
  const top = B - wallH;
  s += `<path d="M${f2(X0 - lean * 2)},${f2(top)} L${f2(X1 + lean * 2)},${f2(top)} L${X1},${B} L${X0},${B}Z" fill="#7A6A52"/>`;
  s += `<path d="M${f2(X0 - lean * 2)},${f2(top)} L${f2(X0 + 40)},${f2(top)} L${f2(X0 + 40)},${B} L${X0},${B}Z" fill="#5E503D"/>`;
  // posts
  for (const x of [X0, (X0 + X1) / 2, X1]) s += `<path d="M${f2(x - 10 + (x < 1300 ? -lean : x > 1500 ? lean : 0) * 2)},${f2(top)} L${f2(x + 10 + (x < 1300 ? -lean : x > 1500 ? lean : 0) * 2)},${f2(top)} L${x + 10},${B} L${x - 10},${B}Z" fill="#4A3B2C"/>`;
  // door (left bay) and window (right bay)
  const dh = (B - top) * 0.8;
  s += `<rect x="${X0 + 90}" y="${f2(B - dh)}" width="110" height="${f2(dh)}" fill="#2A2420"/>`;
  s += `<rect x="${X0 + 360}" y="${f2(top + (B - top) * 0.25)}" width="120" height="${f2((B - top) * 0.35)}" fill="#2A2420"/>`;
  // roof: two halves meeting at the ridge; sag lowers the middle, collapse drops and folds it into a V
  const ridgeY = 470 + sag * 46 + c * 300, midX = (X0 + X1) / 2;
  const eY = WT + c * 110, eL = X0 - 50 - c * 30, eR = X1 + 50 + c * 30;
  const rL = 1185 + c * 60, rR = 1535 - c * 60;
  const sagMid = ridgeY + sag * 24 + c * 40;
  const roof = (thick) => `M${f2(eL)},${f2(eY)} L${f2(rL)},${f2(ridgeY - thick)} Q${f2(midX)},${f2(sagMid - thick)} ${f2(rR)},${f2(ridgeY - thick)} L${f2(eR)},${f2(eY)} Q${f2(midX)},${f2(eY + 20 + c * 40)} ${f2(eL)},${f2(eY)}Z`;
  s += `<path d="${roof(0)}" fill="#A08A64"/>`;
  // thatch strokes
  const R = rng(22);
  for (let i = 0; i < 46; i++) {
    const u = R(), x = lerp(eL + 30, eR - 30, u), yTop = lerp(ridgeY + 10, eY - 10, Math.abs(u - 0.5) * 2) ;
    s += `<path d="M${f2(x)},${f2(yTop + R() * 30)} l${f2((u - 0.5) * 30)},${f2(26 + R() * 26)}" stroke="#6E5D41" stroke-width="2.2" opacity="0.55"/>`;
  }
  s += `<path d="M${f2(eL)},${f2(eY)} Q${f2(midX)},${f2(eY + 20 + c * 40)} ${f2(eR)},${f2(eY)} L${f2(eR - 12)},${f2(eY - 14)} Q${f2(midX)},${f2(eY + 4 + c * 40)} ${f2(eL + 12)},${f2(eY - 14)}Z" fill="#6E5D41"/>`;
  // heavy snow on the roof: a thick cap on the upper slope with a wavy lower edge, and a band on the eaves
  if (c < 0.98) {
    const sn = 46 * (1 - c * 0.7);
    const capY = (u) => lerp(ridgeY, eY, u);           // u = 0 ridge .. 1 eave along the slope
    const lx = (u) => lerp(rL, eL, u), rx = (u) => lerp(rR, eR, u);
    const u1 = 0.48;
    let cap = `M${f2(rL - 8)},${f2(ridgeY - sn)} Q${f2(midX)},${f2(sagMid - sn - 4)} ${f2(rR + 8)},${f2(ridgeY - sn)} L${f2(rx(u1) + 8)},${f2(capY(u1))}`;
    const nW = 9;
    for (let i = nW; i >= 0; i--) {
      const u = i / nW, x = lerp(lx(u1), rx(u1), u), yb = capY(u1) + (u > 0.15 && u < 0.85 ? sag * 22 + c * 30 : 0) + (i % 2 ? 14 : -2);
      cap += ` L${f2(x)},${f2(yb)}`;
    }
    cap += ` L${f2(lx(u1) - 8)},${f2(capY(u1))}Z`;
    s += `<path d="${cap}" fill="#EEF2F5"/>`;
    s += `<path d="M${f2(rL - 8)},${f2(ridgeY - sn)} Q${f2(midX)},${f2(sagMid - sn - 4)} ${f2(rR + 8)},${f2(ridgeY - sn)} L${f2(rR + 2)},${f2(ridgeY - sn + 12)} Q${f2(midX)},${f2(sagMid - sn + 8)} ${f2(rL - 2)},${f2(ridgeY - sn + 12)}Z" fill="#FFFFFF" opacity="0.8"/>`;
    // shadowed underside of the cap
    s += `<path d="M${f2(lx(u1))},${f2(capY(u1) + 8)} Q${f2(midX)},${f2(capY(u1) + 26 + sag * 22)} ${f2(rx(u1))},${f2(capY(u1) + 8)}" stroke="#AEBBCB" stroke-width="6" fill="none" opacity="0.6"/>`;
    // snow on the eave edge
    s += `<path d="M${f2(eL - 14)},${f2(eY - 10)} Q${f2(midX)},${f2(eY + 6 + c * 40)} ${f2(eR + 14)},${f2(eY - 10)} L${f2(eR + 6)},${f2(eY + 2)} Q${f2(midX)},${f2(eY + 18 + c * 40)} ${f2(eL - 6)},${f2(eY + 2)}Z" fill="#E6ECF2"/>`;
  }
  if (c > 0.3) {
    // broken beams poking out and a snow heap over the wreck
    const k = clamp((c - 0.3) / 0.7);
    s += `<path d="M${f2(X0 - 90)},${B + 6} Q${f2(X0 + 40)},${f2(B - 120 * k)} ${f2(midX)},${f2(B - 150 * k)} Q${f2(X1 - 40)},${f2(B - 120 * k)} ${f2(X1 + 90)},${B + 6}Z" fill="#EEF2F5" opacity="${f2(k)}"/>`;
    s += `<path d="M${f2(midX - 40)},${f2(B - 140 * k)} Q${f2(X1 - 40)},${f2(B - 110 * k)} ${f2(X1 + 90)},${B + 6} L${f2(X1 - 20)},${B + 6}Z" fill="#C9D3DD" opacity="${f2(k * 0.8)}"/>`;
    s += `<path d="M${f2(midX - 160)},${f2(B - 40)} L${f2(midX - 40)},${f2(B - 230 * k)} L${f2(midX - 28)},${f2(B - 226 * k)} L${f2(midX - 146)},${f2(B - 36)}Z" fill="#4A3B2C"/>`;
    s += `<path d="M${f2(midX + 190)},${f2(B - 30)} L${f2(midX + 60)},${f2(B - 200 * k)} L${f2(midX + 72)},${f2(B - 194 * k)} L${f2(midX + 202)},${f2(B - 26)}Z" fill="#4A3B2C"/>`;
    for (let i = 0; i < 9; i++) { const R2 = rng(70 + i); const x = X0 + 30 + i * 60 + R2() * 20, y = B - 60 * k - R2() * 50 * k; s += `<path d="M${f2(x)},${f2(y)} l${f2(-20 + R2() * 40)},${f2(-26 - R2() * 20)} l${f2(8)},${f2(4)}Z" fill="#8F7A55" opacity="${f2(k)}"/>`; }
    s += `<path d="M${f2(X1 - 10)},${B} L${f2(X1 + 40 * k)},${f2(B - 150)} L${f2(X1 + 54 * k)},${f2(B - 146)} L${f2(X1 + 10)},${B}Z" fill="#4A3B2C"/>`;
  }
  // snow drift along the base
  s += `<path d="M${X0 - 120},${B + 8} Q${X0 - 30},${B - 24} ${X0 + 60},${B - 6} Q${(X0 + X1) / 2},${B - 18} ${X1 - 40},${B - 8} Q${X1 + 40},${B - 26} ${X1 + 140},${B + 8}Z" fill="#E3E9EF"/>`;
  return s;
}

/** Snow puff + clumps after the collapse (world d 0.85 coords). */
function puff(t) {
  const a = (t - COLLAPSE) / 1.6;
  if (a <= 0 || a >= 1) return '';
  const R = rng(57);
  let s = '';
  for (let i = 0; i < 26; i++) {
    const ang = -Math.PI * (0.05 + R() * 0.9), sp = 90 + R() * 240, r0 = 26 + R() * 46;
    const e = 1 - Math.pow(1 - a, 2.4);
    const x = 1360 + (R() - 0.5) * 380 + Math.cos(ang) * sp * e, y = 610 + R() * 120 + Math.sin(ang) * sp * e * 0.7 + a * a * 40;
    const r = r0 * (0.6 + e * 2.2);
    s += `<circle cx="${f2(x)}" cy="${f2(y)}" r="${f2(r)}" fill="${i % 3 ? '#F2F5F8' : '#D9E1E9'}" opacity="${f2(Math.pow(1 - a, 1.5) * 0.85)}"/>`;
  }
  // flying clumps
  for (let i = 0; i < 18; i++) {
    const vx = (R() - 0.5) * 520, vy = -200 - R() * 260, r = 5 + R() * 8, tt = a * 1.6;
    const x = 1360 + (R() - 0.5) * 300 + vx * tt, y = 600 + vy * tt + 520 * tt * tt;
    if (y > 820) continue;
    s += `<circle cx="${f2(x)}" cy="${f2(y)}" r="${f2(r)}" fill="#EEF2F5"/>`;
  }
  return s;
}

// ------------------------------------------------------------------ 林冲 blocking
// x(t): walks right toward the hut, stops dead at the collapse, turns at 76.077 and trudges to the temple door.
const xAt = (t) => (t < COLLAPSE ? lerp(700, 790, ramp(t, T0 - 0.65, COLLAPSE, E.lin)) : t < TURN + 0.12 ? 790 : lerp(790, 548, ramp(t, TURN + 0.12, PULL - 0.08, E.inOut)));
function walking(t) { return (t > T0 - 0.65 && t < COLLAPSE - 0.05) || (t > TURN + 0.15 && t < PULL - 0.12); }
function lc(t) {
  const x = xAt(t);
  const facingRight = t < TURN + 0.04;
  // the turn: a quick squash through the profile (4 frames)
  const tk = (t - TURN) / 0.13;
  const sx = tk > 0 && tk < 1 ? Math.max(0.32, Math.abs(Math.cos(tk * Math.PI))) : 1;
  const dist = Math.abs(x - 700) + (t > TURN ? 200 : 0);
  const bob = walking(t) ? -Math.abs(Math.sin((dist / 120) * Math.PI)) * 5 : 0;
  // stop dead: a small recoil at the collapse; gourd swing comes from the spear angle wobble
  const recoil = t > COLLAPSE && t < COLLAPSE + 0.5 ? -Math.sin(((t - COLLAPSE) / 0.5) * Math.PI) * 6 : 0;
  const swing = t > COLLAPSE ? Math.sin((t - COLLAPSE) * 9) * 6 * Math.exp(-(t - COLLAPSE) * 2.4) : 0;
  const reach = ramp(t, PULL - 0.32, PULL, E.out);
  const expr = t < COLLAPSE ? { ...EX.隐忍, jaw: 0.4, eye: 0.85, brow: -0.4 } : t < TURN ? { ...EX.隐忍, eye: 1.12, brow: 0.1, jaw: 0, mouth: -0.2 } : { ...EX.隐忍 };
  const pose = { headTilt: t < COLLAPSE ? 4 : 0, shoulderR: lerp(0, 58, reach), elbowR: lerp(0, 6, reach) };
  const spearHand = reach > 0.05 ? 'L' : 'R';
  const body = lin({ view: 'side', costume: 'C', expr, pose, flip: facingRight, height: HFIG, x: 0, y: 0, tattoo: 1,
    props: { spear: { hand: spearHand, angle: -42 + swing, gourd: true, grip: 0.3 } } });
  // snow dust on the hat brim and shoulders (local coords, facing right; mirrored with the figure)
  const h = HFIG;
  const dust = `<path d="M${f2(-0.115 * h)},${f2(-0.835 * h)} Q${f2(-0.09 * h)},${f2(-0.872 * h)} ${f2(-0.03 * h)},${f2(-0.868 * h)} Q${f2(0.0 * h)},${f2(-0.866 * h)} ${f2(0.02 * h)},${f2(-0.858 * h)} Q${f2(-0.03 * h)},${f2(-0.85 * h)} ${f2(-0.115 * h)},${f2(-0.835 * h)}Z" fill="#F4F7FA" opacity="0.9"/>`;
  const flipS = facingRight ? 1 : -1;
  return `<g transform="translate(${f2(x)} ${f2(GY + bob + recoil * 0)}) scale(${f2(sx)} 1)">${body}<g transform="scale(${-flipS * -1} 1)">${dust}</g></g>`;
}

// ------------------------------------------------------------------ camera
const SHOULDER = () => [xAt(72.95) + 0.02 * HFIG, GY - 0.9 * HFIG];
function cam(t) {
  const z0 = 3.0, PA = 72.95;
  const z = t < PA ? z0 : t < 75.25 ? zexp(t, PA, 75.25, z0, 1, E.sine) : t < 76.0 ? 1 : 1 + 0.05 * ramp(t, 76.0, PULL, E.inOut);
  const [sx, sy] = SHOULDER();
  const q = [380, 400];
  const startX = sx - 960 - (q[0] - 960) / z0, startY = sy - 540 - (q[1] - 540) / z0;
  const endX = -10, endY = -18;
  const k = t < PA ? 0 : Math.log(z0 / Math.min(z0, Math.max(1, t < 75.25 ? z : 1))) / Math.log(z0);
  let x = lerp(startX, endX, k), y = lerp(startY, endY, k);
  if (t > 75.25) x = lerp(endX, -40, ramp(t, 75.25, 76.0, E.inOut));
  if (t > 76.0) x = lerp(-40, -150, ramp(t, 76.0, PULL + 0.1, E.inOut));
  return { x, y, zoom: z };
}

function closedLeaf(t) {
  if (t >= PULL) return '';
  let s = `<rect x="228" y="410" width="214" height="498" fill="#4A3B31"/>`;
  for (let i = 1; i < 5; i++) s += `<rect x="${228 + i * 43}" y="410" width="4" height="498" fill="#2A211B" opacity="0.8"/>`;
  s += `<rect x="228" y="470" width="214" height="12" fill="#3A2E26"/><rect x="228" y="820" width="214" height="12" fill="#3A2E26"/>`;
  s += `<circle cx="420" cy="660" r="9" fill="#2A211B"/><path d="M228,410 L442,410 L442,420 L228,420Z" fill="#E6ECF2" opacity="0.7"/>`;
  return s;
}

// ------------------------------------------------------------------ the door leaf swinging to the lens (screen space)
function leaf(t, c) {
  const p = ramp(t, PULL, PULL + 0.29, E.in);
  if (p <= 0) return '';
  const h0 = toScreen(c, 1, [232, 410]), h1 = toScreen(c, 1, [232, 908]);
  const f0 = toScreen(c, 1, [440, 410]), f1 = toScreen(c, 1, [440, 908]);
  const fx = lerp(f0[0], 2900, Math.pow(p, 1.25)), ft = lerp(f0[1], -900, Math.pow(p, 1.6)), fb = lerp(f1[1], 2100, Math.pow(p, 1.6));
  const hx0 = lerp(h0[0], -300, Math.pow(p, 2.2)), ht = lerp(h0[1], -200, Math.pow(p, 2)), hb = lerp(h1[1], 1300, Math.pow(p, 2));
  const pts = `${f2(hx0)},${f2(ht)} ${f2(fx)},${f2(ft)} ${f2(fx)},${f2(fb)} ${f2(hx0)},${f2(hb)}`;
  // planks
  let pl = '';
  for (let i = 1; i < 6; i++) {
    const u = i / 6;
    pl += `<line x1="${f2(lerp(hx0, fx, u))}" y1="${f2(lerp(ht, ft, u))}" x2="${f2(lerp(hx0, fx, u))}" y2="${f2(lerp(hb, fb, u))}" stroke="#2A211B" stroke-width="${f2(3 + p * 14)}" opacity="0.7"/>`;
  }
  const lit = `<polygon points="${f2(fx - 8 - p * 40)},${f2(ft)} ${f2(fx)},${f2(ft)} ${f2(fx)},${f2(fb)} ${f2(fx - 8 - p * 40)},${f2(fb)}" fill="#8C7A6A" opacity="0.6"/>`;
  return `<g data-layer="t09leaf" data-z="700" data-bleed="all"><polygon points="${pts}" fill="#4A3B31"/>${pl}${lit}<polygon points="${pts}" fill="#1C1612" opacity="${f2(p * 0.55)}"/></g>`;
}

export default {
  enter: { a: 72.95, b: 73.6, type: 'dissolve', ease: E.inOut },
  frame(t) {
    const c = cam(t);
    const sag = ramp(t, SAG, COLLAPSE, E.in);
    const col = ramp(t, COLLAPSE - 0.04, COLLAPSE + 0.24, E.in);
    const sk = shake(t, COLLAPSE, 4, 3, 2);
    let s = '';
    s += L(c, 0, `<g transform="translate(-240 -200)">${SKY}</g>`, { id: 't09sky', bleed: 'all' });
    s += L(c, 0.1, `<g transform="translate(-340 0)">${MOUNT_FAR}</g>`, { id: 't09mtnfar', bleed: 'all' });
    s += L(c, 0.16, `<g transform="translate(-340 20)">${MOUNT_MID}</g>`, { id: 't09mtnmid', bleed: 'all' });
    s += L(c, 0.35, `<g transform="translate(-340 -20)">${HILLS}</g>`, { id: 't09hills', bleed: 'all' });
    s += L(c, 0.85, `<g transform="translate(-440 700)">${PLAIN}</g>` + FENCE + STACKS + `<g transform="translate(${f2(sk[0])} ${f2(sk[1])})">${hut(sag, col)}</g>` + `<g filter="url(#${blurId(7)})">${puff(t)}</g>`, { id: 't09depot', bleed: 'all' });
    // near ground at his depth
    s += L(c, 1, `<path d="M-400,880 Q400,860 900,872 Q1500,884 2400,866 L2400,1500 L-400,1500Z" fill="#E7EDF3"/>` + TEMPLE + closedLeaf(t) + lc(t) +
      // snow bank in front of his boots
      `<path d="M-400,${GY - 8} Q-100,${GY - 20} 300,${GY - 10} Q700,${GY - 2} 1000,${GY - 14} Q1500,${GY - 22} 2400,${GY - 6} L2400,1500 L-400,1500Z" fill="#EEF2F5"/>` +
      `<path d="M-400,${GY - 8} Q-100,${GY - 20} 300,${GY - 10} Q700,${GY - 2} 1000,${GY - 14} Q1500,${GY - 22} 2400,${GY - 6}" stroke="#C3CEDA" stroke-width="6" fill="none" opacity="0.7"/>` +
      // footprints trail (stay)
      [...Array(9)].map((_, i) => `<ellipse cx="${640 - i * 70}" cy="${GY + 14 + (i % 2) * 8}" rx="16" ry="5" fill="#B9C5D2" opacity="0.6"/>`).join(''),
      { id: 't09ground', bleed: 'all' });
    // snow: three bands, heavy, slanting with the wind (own clock)
    s += snow(t, { seed: 31, n: 150, d: 0.5, r: [1.2, 2.6], fall: 120, slant: 25, sway: 10, cam: c, op: 0.85, z: 480 });
    s += snow(t, { seed: 32, n: 110, d: 1.0, r: [2.6, 4.6], fall: 170, slant: 25, sway: 16, cam: c, op: 0.9, z: 650 });
    s += snow(t, { seed: 33, n: 22, d: 1.6, r: [8, 13], fall: 260, slant: 25, sway: 24, cam: c, op: 0.75, blur: 4, z: 760 });
    s += leaf(t, c);
    return s;
  },
};
