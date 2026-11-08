// T03 · S06 the training ground · 26.970–31.974
// Opens through a paper tear (match cut from the title's spear): the real spear tip lands where the emblem's tip
// pierced the paper. The thrust, a 花枪 flourish overhead, the ranks stamp, the spear planted; noon slides to dusk;
// tilt up to the nearest red flag, which T04 dissolves into the red lantern.
import { L, kf, ramp, E, bake, f2, clamp, lerp, rng, noise1, camAt, toScreen, ridge } from '../lib.mjs';
import { lin, EX } from '../../chars/rig/linchong.mjs';
import { ranks } from '../cast/ranks.mjs';
import { TIP, tearPath } from './t02.mjs';

const ID = 't03';
const T0 = 26.97;
const FEET = [1330, 905], HGT = 680;
const TIP_THRUST = [358, 424]; // measured: spear tip at the thrust pose (lean 7°, angle 97, grip 0.2)
const CAM_END = { x: -200, y: -90 };
const easeOutQuad = (x) => 1 - (1 - x) * (1 - x);

function cam(t) {
  const c0 = camAt(TIP_THRUST, TIP, 1.25);
  const k = ramp(t, T0, 28.65, easeOutQuad);
  const z = lerp(1.25, 1.0, k);
  let x = lerp(c0.x, CAM_END.x, k), y = lerp(c0.y, CAM_END.y, k);
  // truck right 3 px/frame from 28.24 (8-frame ease-in), tilt up 120 px with the spear 31.14 → 31.97
  const tr = Math.max(0, t - 28.24);
  x += tr * 90 - (tr < 0.27 ? 90 * 0.27 * (1 - tr / 0.27) ** 2 / 2 : 90 * 0.27 / 2);
  y -= 120 * ramp(t, 31.14, 31.97, E.inOut);
  // keep the tip exactly on the tear at the cut (zoom pivot)
  if (t <= T0) { x = c0.x; y = c0.y; }
  return { x, y, zoom: z };
}

// ------------------------------------------------------------------ his timeline
function pose(t) {
  // keys: thrust (26.97) → guard (28.24) → wind-up (28.65) → spin (28.653–29.49) → guard (29.95) → plant (31.138)
  const thrust = { sh: 82, el: 2, ang: 97, grip: 0.2, lean: 7 };
  const guard = { sh: 55, el: 55, ang: 92, grip: 0.25, lean: 0 };
  const up = { sh: 150, el: 25, ang: 90, grip: 0.5, lean: -2 };
  const guard2 = { sh: 50, el: 60, ang: 74, grip: 0.28, lean: 1 };
  const plant = { sh: 35, el: 75, ang: 0, grip: 0.55, lean: -1 };
  const mixp = (a, b, k) => Object.fromEntries(Object.keys(a).map((n) => [n, lerp(a[n], b[n], k)]));
  let p;
  if (t < 27.4) p = thrust;
  else if (t < 28.24) p = mixp(thrust, guard, ramp(t, 27.4, 28.24, E.inOut));
  else if (t < 28.653) p = mixp(guard, up, ramp(t, 28.36, 28.653, E.in));
  else if (t < 29.49) { p = { ...up }; p.ang = 90 + 360 * ramp(t, 28.653, 29.49, E.inOut); }
  else if (t < 30.0) p = mixp(up, guard2, ramp(t, 29.49, 30.0, E.inOut));
  else if (t < 31.138) p = mixp(guard2, plant, ramp(t, 30.72, 31.138, E.in));
  else p = plant;
  // stamp bounce at 30.314
  p.lean += 2 * Math.sin(clamp((t - 30.314) / 0.25) * Math.PI);
  return p;
}

function hero(t) {
  const p = pose(t);
  const fig = lin({
    view: 'side', costume: 'A', expr: t < 28.3 ? { ...EX.怒, open: 0.35 } : EX.平静, x: FEET[0], y: FEET[1], height: HGT,
    pose: { shoulderL: p.sh, elbowL: p.el, spear: { hand: 'L', angle: p.ang, grip: p.grip, gourd: false } },
  });
  // tassel trail during the spin: the tip's arc, fading
  let trail = '';
  if (t > 28.7 && t < 29.6) {
    const hand = [FEET[0] - 40, FEET[1] - HGT * 1.02];
    const r = 0.5 * 869;
    const a1 = 90 + 360 * ramp(t, 28.653, 29.49, E.inOut), a0 = Math.max(90, a1 - 120);
    let d = '';
    for (let a = a0; a <= a1; a += 6) {
      const rr = (a * Math.PI) / 180;
      d += `${d ? 'L' : 'M'}${f2(hand[0] - Math.sin(rr) * r)},${f2(hand[1] - Math.cos(rr) * r)} `;
    }
    const op = 0.35 * (1 - ramp(t, 29.4, 29.6));
    trail = `<path d="${d}" stroke="#C8372D" stroke-width="16" fill="none" stroke-linecap="round" opacity="${f2(op)}"/><path d="${d}" stroke="#F6E7D0" stroke-width="4" fill="none" opacity="${f2(op * 1.4)}"/>`;
  }
  return `<g transform="rotate(${f2(-p.lean)} ${FEET[0]} ${FEET[1]})">${fig}</g>` + trail;
}

// ranks mirror his moves (soldier spear angle: + toward the front, 90 = horizontal forward)
function rankMotion(t) {
  let spear = 70, arm = 0.45, lean = 0, step = 0;
  if (t < 27.4) { spear = 90; arm = 1; lean = 6; }
  else if (t < 28.24) { const k = ramp(t, 27.4, 28.24); spear = 90; arm = lerp(1, 0.45, k); lean = lerp(6, 0, k); }
  else if (t < 29.49) { spear = 90 + 360 * ramp(t, 28.653, 29.49, E.inOut); arm = lerp(0.45, 0.2, ramp(t, 28.36, 28.65)); }
  else if (t < 30.72) { spear = lerp(90, 70, ramp(t, 29.49, 30.0)); arm = 0.45; }
  else { spear = lerp(70, 0, ramp(t, 30.72, 31.138, E.in)); arm = lerp(0.45, 0.25, ramp(t, 30.72, 31.138)); }
  step = Math.sin(clamp((t - 30.05) / 0.3) * Math.PI); // the stamp lands on 30.314 (lag included)
  return { spear, arm, lean, step };
}

// ------------------------------------------------------------------ sets
const PALACE = bake(`${ID}_palace`, 2800, 520, (() => {
  // halls beyond the vermilion wall (d 0.2); world x -500..2300, the wall base at local y 470
  let s = `<defs><linearGradient id="${ID}rf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5E6A72"/><stop offset="1" stop-color="#46525A"/></linearGradient></defs>`;
  const hall = (x, y, w, h) => {
    let g = `<rect x="${x + w * 0.08}" y="${y + h * 0.42}" width="${w * 0.84}" height="${h * 0.6}" fill="#9C3A2C"/>`;
    for (let i = 0; i <= 8; i++) g += `<rect x="${x + w * 0.1 + (w * 0.8 * i) / 8 - 5}" y="${y + h * 0.42}" width="10" height="${h * 0.6}" fill="#7A2A20"/>`;
    g += `<rect x="${x + w * 0.08}" y="${y + h * 0.42}" width="${w * 0.84}" height="${h * 0.08}" fill="#3E6B66" opacity="0.8"/>`;
    g += `<path d="M${x - w * 0.06},${y + h * 0.46} Q${x + w * 0.04},${y + h * 0.36} ${x + w * 0.14},${y + h * 0.2} L${x + w * 0.86},${y + h * 0.2} Q${x + w * 0.96},${y + h * 0.36} ${x + w * 1.06},${y + h * 0.46} Q${x + w * 0.5},${y + h * 0.4} ${x - w * 0.06},${y + h * 0.46}Z" fill="url(#${ID}rf)"/>`;
    g += `<path d="M${x + w * 0.22},${y + h * 0.2} L${x + w * 0.3},${y} L${x + w * 0.7},${y} L${x + w * 0.78},${y + h * 0.2}Z" fill="#56626A"/>`;
    g += `<rect x="${x + w * 0.28}" y="${y - 6}" width="${w * 0.44}" height="10" fill="#3A444B"/>`;
    return g;
  };
  s += `<g opacity="0.55">${hall(-200, 150, 700, 330)}${hall(1500, 170, 820, 320)}</g>`;
  s += hall(420, 120, 1000, 360);
  s += `<g opacity="0.7">${hall(2050, 210, 640, 270)}</g>`;
  // the wall
  s += `<rect x="0" y="388" width="2800" height="132" fill="#B2402E"/><rect x="0" y="388" width="2800" height="12" fill="#C9553F"/>`;
  s += `<path d="M0,388 L2800,388 L2800,370 L0,370Z" fill="#4F5A63"/><path d="M-10,372 L2810,372 L2810,362 L-10,362Z" fill="#5E6A72"/>`;
  for (let x = 0; x < 2800; x += 36) s += `<rect x="${x}" y="362" width="18" height="10" fill="#3F4950"/>`;
  s += `<rect x="0" y="500" width="2800" height="20" fill="#8E3224" opacity="0.6"/>`;
  return s;
})());

const RACK = bake(`${ID}_rack`, 520, 1300, (() => {
  // weapon rack at the left edge (d 1.4), pre-blurred
  let s = `<defs><filter id="${ID}rb" x="-20%" y="-10%" width="140%" height="120%"><feGaussianBlur stdDeviation="9"/></filter></defs><g filter="url(#${ID}rb)">`;
  s += `<rect x="40" y="380" width="420" height="34" fill="#5A3A22"/><rect x="40" y="900" width="420" height="34" fill="#5A3A22"/>`;
  s += `<rect x="60" y="360" width="34" height="900" fill="#4A2E1A"/><rect x="400" y="360" width="34" height="900" fill="#4A2E1A"/>`;
  for (let i = 0; i < 6; i++) {
    const x = 120 + i * 50;
    s += `<rect x="${x}" y="${120 + (i % 2) * 40}" width="12" height="1100" fill="#6B4A2E"/>`;
    s += `<path d="M${x + 6},${80 + (i % 2) * 40} l-12,50 l24,0Z" fill="#B9BEC2"/>`;
    if (i % 2 === 0) s += `<path d="M${x + 6},${140 + (i % 2) * 40} l-16,24 l32,0Z" fill="#C8372D"/>`;
  }
  return s + '</g>';
})());

function flag(x, y, w, h, t, seed, col = '#C8372D') {
  // a flag on a pole top at (x, y): the cloth flies to the left (wind from the right), rippling
  const pts = [], pts2 = [];
  for (let i = 0; i <= 10; i++) {
    const u = i / 10, xx = x - u * w;
    const wv = Math.sin(u * 5.5 - t * 7.5 + seed) * 12 * u + noise1(t * 2 + seed, seed) * 6 * u;
    pts.push([xx, y + wv]); pts2.push([xx, y + h * (1 - 0.15 * u) + wv * 1.15]);
  }
  const d = 'M' + pts.map((p) => `${f2(p[0])},${f2(p[1])}`).join(' L') + ' L' + pts2.reverse().map((p) => `${f2(p[0])},${f2(p[1])}`).join(' L') + 'Z';
  return `<path d="${d}" fill="${col}"/><path d="${d}" fill="#000" opacity="0.12" transform="translate(0 ${f2(h * 0.55)}) scale(1 0.45)" transform-origin="${x} ${y}"/>` +
    `<line x1="${x}" y1="${y - 14}" x2="${x}" y2="${y + 900}" stroke="#4A2E1A" stroke-width="7"/><circle cx="${x}" cy="${y - 16}" r="7" fill="#C9A45C"/>`;
}

function dust(t, x, y, at, size = 1) {
  const q = (t - at) / 0.9;
  if (q < 0 || q > 1) return '';
  let s = '';
  for (let i = 0; i < 5; i++) {
    const dx = (i - 2) * 26 * size * (0.4 + q), r = (18 + q * 46) * size * (0.7 + (i % 2) * 0.4);
    s += `<ellipse cx="${f2(x + dx)}" cy="${f2(y - r * 0.35 - q * 10)}" rx="${f2(r)}" ry="${f2(r * 0.55)}" fill="#E8D2A2" opacity="${f2(0.5 * (1 - q))}"/>`;
  }
  return s;
}

export default {
  enter: { a: T0, b: T0 + 0.2, type: 'mask', mask: (t) => `<path d="${tearPath(clamp((t - T0) / 0.2))}" fill="#fff"/>` },
  frame(t) {
    const c = cam(t);
    // noon → dusk from 30.31
    const dusk = ramp(t, 30.31, 31.97, E.inOut);
    let s = `<defs><linearGradient id="${ID}sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E4DCC6"/><stop offset="0.7" stop-color="#F3E2BE"/><stop offset="1" stop-color="#F6E6C4"/></linearGradient>` +
      `<linearGradient id="${ID}dusk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6B5A7E"/><stop offset="0.6" stop-color="#C98A6A"/><stop offset="1" stop-color="#E9B07A"/></linearGradient>` +
      `<linearGradient id="${ID}sand" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E2C690"/><stop offset="0.35" stop-color="#DDBE88"/><stop offset="1" stop-color="#B8925E"/></linearGradient>` +
      `<radialGradient id="${ID}sh"><stop offset="0" stop-color="#6B4A28" stop-opacity="0.42"/><stop offset="1" stop-color="#6B4A28" stop-opacity="0"/></radialGradient>` +
      `<linearGradient id="${ID}haze" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F6E8CC" stop-opacity="0"/><stop offset="1" stop-color="#F6E8CC" stop-opacity="0.55"/></linearGradient></defs>`;
    s += L(c, 0, `<rect x="-200" y="-300" width="2320" height="1700" fill="url(#${ID}sky)"/><rect x="-200" y="-300" width="2320" height="1700" fill="url(#${ID}dusk)" opacity="${f2(dusk * 0.75)}"/>`, { id: `${ID}sky`, bleed: 'all' });
    s += L(c, 0.2, `<g transform="translate(-500 120)">${PALACE}</g><rect x="-600" y="560" width="3000" height="80" fill="url(#${ID}haze)"/>`, { id: `${ID}palace`, bleed: 'lr' });
    // banners along the wall (d 0.35)
    let ban = '';
    for (let i = 0; i < 7; i++) ban += flag(-60 + i * 330, 250 + (i % 2) * 24, 120, 70, t, i * 1.7);
    s += L(c, 0.35, ban, { id: `${ID}banners`, bleed: 'all' });
    // sand (d 0.8)
    let sand = `<rect x="-800" y="600" width="3600" height="1200" fill="url(#${ID}sand)"/>`;
    const R = rng(8);
    for (let i = 0; i < 70; i++) {
      const yy = 640 + Math.pow(R(), 1.6) * 560, xx = -700 + R() * 3400;
      sand += `<ellipse cx="${f2(xx)}" cy="${f2(yy)}" rx="${f2(10 + (yy - 600) * 0.12)}" ry="${f2(2 + (yy - 600) * 0.01)}" fill="#A88552" opacity="0.25"/>`;
    }
    s += L(c, 0.8, sand, { id: `${ID}sand`, bleed: 'all' });
    // ranks (d 0.6) with their shadows
    s += L(c, 0.6, ranks(t, { motion: rankMotion }) + (t > 30.0 && t < 31.2 ? Array.from({ length: 10 }, (_, i) => dust(t, 40 + i * 186, 706, 30.314 + 0.13, 0.7)).join('') : ''), { id: `${ID}ranks`, bleed: 'lr' });
    // the nearest flag (d 0.8): lands at screen (520, 260) when the tilt ends (T04 dissolves it into the lantern)
    const cE = cam(31.974), d8 = 0.8;
    const fw = [520 + cE.x * d8, 260 + cE.y * d8 - 30];
    s += L(c, d8, flag(fw[0] + 60, fw[1], 150, 86, t, 5.3), { id: `${ID}nearflag`, bleed: 'b' });
    // his shadow (sun from the right, cast to the left) + him (d 1.0)
    s += L(c, 1, `<ellipse cx="${FEET[0] - 150}" cy="${FEET[1] + 6}" rx="260" ry="26" fill="url(#${ID}sh)"/>` + hero(t) +
      dust(t, FEET[0] - 30, FEET[1], T0, 1.1) + dust(t, FEET[0] - 200, FEET[1] + 4, 31.138, 1.0), { id: `${ID}hero` });
    // weapon rack, blurred foreground at the left edge (d 1.4)
    s += L(c, 1.4, `<g transform="translate(-420 -220)">${RACK}</g>`, { id: `${ID}rack`, bleed: 'lb' });
    // warm dusk grade over everything at the end
    if (dusk > 0) s += `<rect width="1920" height="1080" fill="#E9A060" opacity="${f2(dusk * 0.18)}" style="mix-blend-mode:multiply"/>`;
    return s;
  },
};
