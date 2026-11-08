// T08 · 59.870–73.600 · S16 brand → S17 cangue → S18 road → S19 the promise (one take: the world changes around him).
// Builder D. Retimed windows: film/timing.md. Storyboard_v3 §5 TAKE 8, colour script C5–C6.
//  A (S16+S17) 59.870–64.45  one continuous pull-back on the front figure in the 白虎节堂 cold light: ECU of the cheek,
//                            the 文笔匠's tool, marks bloom 59.870 / 60.291 / 60.708, the cangue swings in and clamps
//                            61.125, head drops, pull-back to a high-angle MS, shoulders sag 61.95.
//  A→B world slide 63.60–64.45: the cold shaft widens into white summer glare; the road comes out of it.
//  B (S18) 64.45–67.80        side-tracking WS on the summer road between two guards; he stops and looks back at the
//                            city gate 65.70; the guard tugs 66.538; eye-line pan left into memory 66.955–67.80 (sepia).
//  C (S19) 67.80–73.60        sepia memory OTS at the tavern table: 张教头's hand lands on his shoulder 68.592,
//                            squeeze 69.0, nod 71.5, the film's first snow 71.51 (more 71.92), the hand fades and snow
//                            settles where it was 72.95–73.60 (T09 owns the dissolve to the depot).
// Exported SHOULDER: screen point of 林冲's snow-covered left shoulder top at 73.6 (for T09's position match).
import { L, kf, ramp, E, bake, snow, f2, clamp, lerp, rng, noise1, camAt, toScreen, shake, lg, rg, smooth, FPS } from '../lib.mjs';
import { lin } from '../../chars/rig/linchong.mjs';
import { xiushu } from '../cast/xiushu.mjs';
import { zhang, ZH } from '../cast/zhang.mjs';
import { guard } from '../cast/guard.mjs';

const T = { a: 59.87, m2: 60.291, m3: 60.708, clamp: 61.125, sag: 61.951, slide: 63.6, b: 64.45, look: 65.701, tug: 66.537, pan: 66.955, c: 67.8, hand: 68.592, sq: 69.01, nod: 71.506, s1: 71.506, s2: 71.924, dis: 72.95, end: 73.6 };
export const SHOULDER = { x: 650, y: 650 };   // screen, at 73.6 (camera push 1.10 included)

// ------------------------------------------------------------------ rig utilities
function cut(str, name) {
  const i = str.indexOf(`<g data-part="${name}"`);
  if (i < 0) return [null, str];
  const re = /<g\b|<\/g>/g;
  re.lastIndex = i;
  let depth = 0, m;
  while ((m = re.exec(str))) {
    if (m[0] === '</g>') { depth--; if (depth === 0) { const j = m.index + 4; return [str.slice(i, j), str.slice(0, i) + str.slice(j)]; } }
    else depth++;
  }
  return [null, str];
}
const rootOf = (s) => s.match(/^<g data-rig[^>]*transform="([^"]+)"/)[1];
const CONV = { col: { robe: '#3B4356' }, headCloth: 'plain' };

// ================================================================== A · S16 + S17 (hall)
const FA = { x: 960, y: 1740, height: 1600 };
const KA = FA.height / 7.5 / ((1468 - 331) / 6.5);                      // rig data px -> world px
const dA = (p) => [FA.x + KA * (p[0] - 428), FA.y + KA * (p[1] - 1468)];
const TAT = [458, 293];                                                   // tattoo centre, rig data (front, left cheek)
const TATW = dA(TAT);
const ZA = 2.5;                                                           // ECU zoom

function zoomA(t) {
  if (t < 60.75) return lerp(ZA, ZA * 0.97, ramp(t, T.a, 60.75, E.lin));
  // constant-ratio pull-back with 8-frame eased ends, then a slow settle
  const z0 = ZA * 0.97, a = 60.75, b = 63.35;
  const u = clamp((t - a) / (b - a)), e = 8 / FPS / (b - a);
  let k;
  if (u < e) k = (u * u) / (2 * e * (1 - e));
  else if (u > 1 - e) k = 1 - ((1 - u) * (1 - u)) / (2 * e * (1 - e));
  else k = (u - e / 2) / (1 - e);
  return z0 * Math.pow(1 / z0, k) * (t > b ? lerp(1, 0.99, ramp(t, b, T.b, E.inOut)) : 1);
}
// zoom about the screen centre; the world point under the centre drifts from the face (CU) to the figure (MS)
// in proportion to 1/zoom, so its screen speed stays constant.
const EYEW = dA([428, 253.5]);
const W_ECU = [960, EYEW[1] + (540 - 385) / ZA];                       // eyes at y ≈ 385 at the CU
const W_MS = [960, 480];
function camA(t) {
  const z = zoomA(t);
  const m = clamp((1 / z - 1) / (1 / ZA - 1));
  return camAt([lerp(W_MS[0], W_ECU[0], m), lerp(W_MS[1], W_ECU[1], m)], [960, 540], z);
}

// abstract tattoo marks (rig data coords around TAT), three groups bloom in turn
// two short columns of small, irregular, squarish dabs (data px around TAT); [x, y, w, h, angle, group]
const DABS = [
  [-4.2, -6.0, 2.6, 2.3, 8, 0], [-4.6, -2.6, 2.2, 2.5, -6, 0], [-4.0, 0.9, 2.7, 2.1, 12, 1], [-4.5, 4.2, 2.1, 2.4, -3, 1],
  [0.8, -5.2, 2.3, 2.6, -10, 1], [1.2, -1.7, 2.6, 2.2, 5, 2], [0.7, 1.8, 2.2, 2.4, -14, 2], [1.0, 5.0, 2.5, 2.0, 7, 2],
];
function marks(t) {
  const times = [T.a, T.m2, T.m3];
  let s = '';
  for (const [x, y, w, h, ang, g] of DABS) {
    const k = ramp(t, times[g], times[g] + 0.42, E.out);
    if (k <= 0) continue;
    const cx = TAT[0] + x * 1.25, cy = TAT[1] + y * 1.25, sw = 1.35 * w * (0.4 + 0.6 * k), sh = 1.35 * h * (0.4 + 0.6 * k);
    const j = (v) => f2(v);
    // irregular quad (a squarish dab), soaked edge via the feather filter
    s += `<path d="M${j(cx - sw / 2)},${j(cy - sh / 2 + 0.2)} L${j(cx + sw / 2 - 0.2)},${j(cy - sh / 2)} L${j(cx + sw / 2)},${j(cy + sh / 2 - 0.3)} L${j(cx - sw / 2 + 0.3)},${j(cy + sh / 2)}Z" transform="rotate(${ang} ${j(cx)} ${j(cy)})" fill="#2A3A55" opacity="${f2(0.85 * k)}"/>`;
  }
  return `<g filter="url(#t08ink)">${s}</g>`;
}

// the 文笔匠's hand and slim tool, in rig data coords; tip at the active mark
function tattooHand(t) {
  if (t > 61.1) return '';
  const tips = [[TAT[0] - 4.4, TAT[1] - 4.3], [TAT[0] - 1.6, TAT[1] + 1.2], [TAT[0] + 1.0, TAT[1] + 2.4]];
  const times = [T.a, T.m2, T.m3];
  let gi = 0;
  for (let i = 0; i < 3; i++) if (t >= times[i] - 0.18) gi = i;
  // position: between touches the tip lifts and travels to the next mark
  const tPrev = times[gi];
  let tip = tips[gi];
  if (gi < 2 && t > times[gi + 1] - 0.18) tip = tips[gi + 1];
  const nextT = gi < 2 ? times[gi + 1] : 99;
  const lift = t < tPrev ? 1 - ramp(t, tPrev - 0.18, tPrev, E.in) : ramp(t, tPrev + 0.12, tPrev + 0.26, E.out) * (1 - ramp(t, nextT - 0.18, nextT, E.in));
  const u = [0.6, -0.8];
  let off = 5 * lift;
  if (t > 60.84) off += 160 * ramp(t, 60.84, 61.08, E.in);               // exits to the upper right
  const tx = tip[0] + u[0] * off, ty = tip[1] + u[1] * off;
  const ang = (Math.atan2(u[1], u[0]) * 180) / Math.PI;
  const LN = '#2A1C17', sk = '#D8A27E', skS = '#B98463';
  let s = `<g transform="translate(${f2(tx)} ${f2(ty)}) rotate(${f2(ang)}) scale(0.62)">`;
  // the tool: slim dark wood with a dull metal tip, passing between thumb and index finger
  s += `<path d="M0,0 L9,-1.6 L150,-2.8 L150,2.8 L9,1.6Z" fill="#4A3A2C" stroke="${LN}" stroke-width="0.7"/>`;
  s += `<path d="M0,0 L9,-1.6 L9,1.6Z" fill="#A3A9AE"/>`;
  // middle finger (behind, supporting from below)
  s += `<path d="M52,6 C60,8 70,14 82,20 C96,26 120,30 160,30 L160,56 C120,54 92,46 74,36 C62,30 54,22 50,14 C48,10 49,7 52,6Z" fill="${skS}" stroke="${LN}" stroke-width="1.3"/>`;
  // thumb (underside, pressing up), rounded tip, no nail
  s += `<path d="M38,4 C46,2 58,4 70,8 C90,14 116,26 150,40 L140,64 C108,52 84,40 64,28 C52,22 42,16 37,11 C34,8 35,5 38,4Z" fill="${sk}" stroke="${LN}" stroke-width="1.4"/>`;
  s += `<path d="M62,24 C78,32 96,40 118,48" fill="none" stroke="${skS}" stroke-width="2.2" opacity="0.7"/>`;
  // index finger (on top), rounded tip, two crease lines
  s += `<path d="M30,-3 C34,-8 44,-10 56,-11 C84,-13 120,-16 170,-26 L176,4 C130,6 90,6 60,6 C46,6 36,5 31,2 C28,0 28,-2 30,-3Z" fill="${sk}" stroke="${LN}" stroke-width="1.4"/>`;
  s += `<path d="M62,-11 C64,-6 64,0 62,5 M98,-14 C101,-8 101,0 99,6" fill="none" stroke="${skS}" stroke-width="1.6" stroke-linecap="round"/>`;
  s += `<path d="M40,-8 C60,-10 90,-12 130,-18" fill="none" stroke="#E9BC98" stroke-width="2.2" opacity="0.8"/>`;
  // back of the hand and the wrist/sleeve, running off frame to the upper right (over the finger bases)
  s += `<path d="M120,-40 C170,-52 230,-50 270,-36 L620,-70 L640,90 L280,74 C240,84 180,82 140,66 C110,50 104,-20 120,-40Z" fill="${skS}" stroke="${LN}" stroke-width="1.4"/>`;
  s += `<path d="M270,-36 L620,-70 L640,90 L280,74 C292,40 292,-4 270,-36Z" fill="#5E4E3E" stroke="${LN}" stroke-width="1.4"/>`;
  s += `<path d="M140,-34 C180,-42 220,-42 256,-32" fill="none" stroke="${sk}" stroke-width="8" stroke-linecap="round" opacity="0.7"/>`;
  // a faint motion trail on the first landing (continues T07's downward sweep)
  if (t < T.a + 0.1) s += `<path d="M14,0 L150,0" stroke="#fff" stroke-width="12" opacity="${f2(0.16 * (1 - (t - T.a) / 0.1))}"/>`;
  s += '</g>';
  return s;
}

function exprA(t) {
  // 隐忍 (wet, held) during the brand; one blink at the second mark; after the clamp 低眉 (eyes down)
  if (t < T.clamp) {
    const blink = t > T.m2 - 0.02 && t < T.m2 + 0.11;
    return { brow: -0.75, eye: blink ? 0 : 0.72, look: [0.15, 0.35], mouth: -0.35, jaw: 1, open: 0, tear: 0 };
  }
  const k = ramp(t, T.clamp, T.clamp + 0.35, E.out);
  return { brow: lerp(-0.75, 0.2, k), eye: lerp(0.72, 0.58, k), look: [lerp(0.15, 0, k), lerp(0.35, 0.85, k)], mouth: lerp(-0.35, -0.3, k), jaw: lerp(1, 0.4, k), open: 0, tear: 0 };
}

function figA(t) {
  const s = lin({ view: 'front', costume: 'A', ...CONV, cangue: true, tattoo: 0, expr: exprA(t), x: FA.x, y: FA.y, height: FA.height });
  const root = rootOf(s);
  const [head, r1] = cut(s, 'head');
  const [cang, body] = cut(r1, 'cangue');
  // cangue swings in from the lower right and clamps on 61.125 (impact: 3-frame shake on the board only)
  const sw = 1 - ramp(t, 60.62, T.clamp, (x) => x * x);
  const [shx, shy] = shake(t, T.clamp, 3, 0.9, 3);
  const bounce = Math.sin(clamp((t - T.clamp) / 0.2) * Math.PI) * 3 * (t > T.clamp ? 1 : 0);
  const cTf = `translate(${f2(40 * sw + shx)} ${f2(250 * sw + shy + bounce)}) rotate(${f2(12 * sw)} 428 372)`;
  // head drops with the clamp (chin toward the chest; 10 frames), then a small settle
  const hd = ramp(t, T.clamp + 0.02, T.clamp + 0.36, E.out);
  const hTf = `translate(0 ${f2(2.5 * hd)})`;
  // shoulders sag on 61.95 (whole figure settles)
  const sag = 9 * ramp(t, T.sag, T.sag + 0.5, E.inOut);
  let out = `<g transform="translate(0 ${f2(sag * KA)})">` + body;
  out += `<g transform="${root}">`;
  // hide the 东京 sleeve roundels that peek out beside the board (status gone: convict robe)
  out += `<circle cx="278" cy="478" r="33" fill="#3B4356"/><circle cx="596" cy="474" r="33" fill="#3B4356"/>`;
  if (sw < 1) out += `<g transform="${cTf}">${cang}</g>`;
  out += `<defs><filter id="t08ink" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="0.45"/></filter></defs>`;
  out += `<g transform="${hTf}">${head}<g>${marks(t)}</g></g>`;
  out += tattooHand(t);
  out += '</g></g>';
  return out;
}

function hallBG() {
  // white-tiger hall floor from a high angle: tiles converge to a vanishing point above the frame
  const w = 3000, h = 1900, ox = -540, oy = -380;
  const vp = [960 - ox, -2400 - oy];
  let g = `<rect width="${w}" height="${h}" fill="#2A3240"/>`;
  g += `<rect width="${w}" height="${h}" fill="url(#t08hp)"/>`;
  for (let i = -16; i <= 16; i++) {
    const x = 960 - ox + i * 210;
    g += `<line x1="${f2(vp[0])}" y1="${f2(vp[1])}" x2="${f2(vp[0] + (x - vp[0]) * 1.6)}" y2="${f2(vp[1] + (h + 200 - vp[1]) * 1.6)}" stroke="#3D4A5C" stroke-width="3" opacity="0.8"/>`;
  }
  for (let j = 0; j < 14; j++) {
    const y = 120 + Math.pow(j / 13, 1.25) * (h - 120);
    g += `<line x1="0" y1="${f2(y)}" x2="${w}" y2="${f2(y)}" stroke="#3D4A5C" stroke-width="3" opacity="0.7"/>`;
  }
  g += `<rect width="${w}" height="${h}" fill="url(#t08hv)"/>`;
  const defs = rg('t08hp', [[0, '#5F7592', 0.7], [0.5, '#3D4A5C', 0.35], [1, '#2A3240', 0]], 0.5, 0.62, 0.42) +
    rg('t08hv', [[0.55, '#0E1219', 0], [1, '#0E1219', 0.55]], 0.5, 0.5, 0.75);
  return `<g transform="translate(${ox} ${oy})">${bake('t08hall', w, h, g, { defs })}</g>`;
}

function sceneA(t) {
  const c = camA(t);
  let s = `<rect width="1920" height="1080" fill="#1D232D"/>`;
  s += L(c, 0.94, hallBG(), { id: 't08hall', bleed: 'all' });
  // the 白虎 screen's pale edge far behind (only seen at MS)
  s += L(c, 1, `<g data-allowcut="1">${figA(t)}</g>`, { id: 't08lin' });
  // cold grade: multiply blue; one cold shaft from above (screen)
  const sh = ramp(t, 61.3, 62.6, E.inOut);
  s += `<g data-layer="fx-grade" data-z="700" data-bleed="all"><rect x="-10" y="-10" width="1940" height="1100" fill="#8C9DB5" style="mix-blend-mode:multiply" opacity="0.62"/>`;
  // S16: a cold key from the top left; S17: one cold shaft from above (soft-edged)
  s += `<rect x="-10" y="-10" width="1940" height="1100" fill="url(#t08key)" style="mix-blend-mode:screen" opacity="${f2(0.5 * (1 - sh))}"/>`;
  if (sh > 0) s += `<path d="M${f2(760 - 40 * sh)},-20 L${f2(1160 + 40 * sh)},-20 L${f2(1400 + 80 * sh)},1100 L${f2(520 - 80 * sh)},1100Z" fill="url(#t08sh)" mask="url(#t08shm)" style="mix-blend-mode:screen" opacity="${f2(0.55 * sh)}"/>`;
  s += `<rect x="-10" y="-10" width="1940" height="1100" fill="url(#t08vg)"/></g>`;
  // world slide: the shaft widens into white summer glare
  const wk = ramp(t, T.slide, 64.15, E.in);
  if (wk > 0) s += `<g data-layer="fx-glare" data-z="760" data-bleed="all"><path d="M${f2(780 - 900 * wk)},-20 L${f2(1140 + 900 * wk)},-20 L${f2(1360 + 1400 * wk)},1100 L${f2(560 - 1400 * wk)},1100Z" fill="#FAF6EC" opacity="${f2(Math.min(1, wk * 1.15))}"/></g>`;
  const defs = lg('t08sh', [[0, '#C7D6E4', 0], [0.3, '#C7D6E4', 0.8], [0.5, '#C7D6E4', 0.95], [0.7, '#C7D6E4', 0.8], [1, '#C7D6E4', 0]], 0, 0, 1, 0) +
    lg('t08shv', [[0, '#fff', 1], [0.6, '#fff', 0.45], [1, '#fff', 0.1]]) +
    `<mask id="t08shm" maskUnits="userSpaceOnUse" x="-20" y="-20" width="1960" height="1120"><rect x="-20" y="-20" width="1960" height="1120" fill="url(#t08shv)"/></mask>` +
    lg('t08key', [[0, '#9FB4CC', 0.9], [0.5, '#9FB4CC', 0.2], [1, '#9FB4CC', 0]], 0, 0, 1, 1) + rg('t08vg', [[0.5, '#06080C', 0], [1, '#06080C', 0.6]], 0.5, 0.45, 0.78);
  return `<defs>${defs}</defs>` + s;
}

// ================================================================== B · S18 (summer road)
const WS = 300;                    // 林冲 1.80 m = 300 px
const FEET = 770;
// camera x (world px at d 1): walk 4.6 px/frame, stop for the look back, resume, then the eye-line pan left
function walkCam(t) {
  // distance walked (world px at d 1): 4.6 px/frame, stop for the look back, resume
  const v = 4.6 * FPS;
  const seg = (a, b, ea) => {
    if (t <= a) return 0;
    const tt = Math.min(t, b), D = b - a, x = (tt - a) / D, e = ea / D;
    const sm = x < e ? (x * x) / (2 * e) : x > 1 - e ? 1 - e - ((1 - x) * (1 - x)) / (2 * e) + e / 2 - e / 2 : x - e / 2;
    return v * D * Math.max(0, sm);
  };
  return seg(63.9, 65.52, 0.22) + seg(66.56, 69.0, 0.2);
}
function camBx(t) {
  // the camera tracks the walk, then pans left along his eye-line (accelerating to ≈ 18 px/frame)
  let x = walkCam(t);
  if (t > T.pan) { const u = Math.min(t - T.pan, 0.85); x -= 0.5 * 640 * u * u + walkCam(t) - walkCam(T.pan); }
  return x;
}
function walkPhase(t) {
  // one step every 2 beats (0.836 s); cycle = 2 steps. Stops 65.52–66.56 (planted).
  const walking = (t < 65.52) || (t > 66.56);
  const tt = t < 65.52 ? t : t > 66.56 ? t - (66.56 - 65.52) : 65.52;
  return { ph: ((tt - 64.45) / 1.672) % 1, walking };
}
function linWalk(t, x, y) {
  const { ph, walking } = walkPhase(t);
  const a = walking ? Math.sin(ph * Math.PI * 2) * 13 : 0;
  const bob = walking ? -Math.abs(Math.cos(ph * Math.PI * 2)) * 4 + 2 : 0;
  const s = lin({ view: 'side', costume: 'A', ...CONV, cangue: true, tattoo: 1, expr: { brow: 0.1, eye: 0.7, look: [0.2, 0.3], mouth: -0.3, jaw: 0.3 }, x, y: y + bob, height: WS, flip: true, pose: { shoulderR: 4, elbowR: 6 } });
  // legs: rotate the rig's legs about the hip to fake the stride
  const root = rootOf(s);
  const [ln, r1] = cut(s, 'legNear');
  const [lf, r2] = cut(r1, 'legFar');
  if (!ln || !lf) return s;
  const legs = `<g transform="${root}"><g transform="rotate(${f2(-a)} 428 842)">${lf}</g><g transform="rotate(${f2(a)} 436 842)">${ln}</g></g>`;
  // legs must sit behind the robe: insert them before the rest of the body; hide the 东京 sleeve roundel
  return legs + r2 + `<g transform="${root}"><circle cx="532" cy="485" r="26" fill="#3B4356"/></g>`;
}
function linLookBack(t, x, y) {
  // front view, head turned to screen-left (toward the gate), body turned 20°: reads as a look over the shoulder
  return lin({ view: 'front', costume: 'A', ...CONV, cangue: true, tattoo: 1, expr: { brow: 0.35, eye: 0.85, look: [-0.9, -0.1], mouth: -0.2, jaw: 0 }, x, y, height: WS, pose: { headTurn: -0.75, shoulderR: -7, shoulderL: -7 } });
}

function roadLayers() {
  // baked once: far city gate + wall (d 0.3), tree line (d 0.45), willows (d 0.8), road (d 1), foreground (d 1.3)
  const gate = (() => {
    let g = '';
    g += `<path d="M0,420 L1300,420 L1300,560 L0,560Z" fill="#B9B2A6"/>`;           // wall
    g += `<path d="M0,420 L1300,420" stroke="#A39B8F" stroke-width="6"/>`;
    for (let x = 10; x < 1300; x += 34) g += `<rect x="${x}" y="402" width="20" height="20" fill="#B9B2A6"/>`;   // crenels
    // gate tower (two tiers) over an arch
    g += `<rect x="420" y="300" width="380" height="130" fill="#ADA597"/>`;
    g += `<path d="M380,306 C470,290 750,290 840,306 L800,270 L420,270Z" fill="#7F7A74"/>`;
    g += `<path d="M360,312 C460,300 760,300 860,312 L848,300 C760,286 460,286 372,300Z" fill="#6E6A66"/>`;
    g += `<rect x="450" y="200" width="320" height="76" fill="#A39B8E"/>`;
    g += `<path d="M410,206 C490,190 730,190 810,206 L770,168 L450,168Z" fill="#77726D"/>`;
    g += `<path d="M396,210 C480,198 740,198 824,210 L812,198 C730,184 490,184 408,198Z" fill="#66625E"/>`;
    g += `<path d="M560,560 L560,470 C560,440 660,440 660,470 L660,560Z" fill="#6E675E"/>`;
    for (let i = 0; i < 6; i++) g += `<rect x="${470 + i * 52}" y="${222}" width="22" height="34" fill="#827B70"/>`;
    return g;
  })();
  const trees = (() => {
    const R = rng(21);
    let g = '';
    for (let i = 0; i < 26; i++) {
      const x = i * 120 + R() * 60, r = 50 + R() * 50;
      g += `<ellipse cx="${f2(x)}" cy="${f2(560 - r * 0.5)}" rx="${f2(r * 1.2)}" ry="${f2(r)}" fill="#BDBC9A"/>`;
    }
    g += `<rect x="0" y="555" width="3200" height="40" fill="#C9C1A2"/>`;
    return g;
  })();
  const willow = (x, h, seed) => {
    // trunk with forks, arching branches, curtains of hanging strands with leaf dashes (no flat crown)
    const R = rng(seed);
    const base = 700, top = base - h;
    let g = `<path d="M${x - 22},${base} C${x - 14},${base - h * 0.35} ${x - 30},${base - h * 0.55} ${x - 12},${base - h * 0.66} L${x + 14},${base - h * 0.66} C${x + 24},${base - h * 0.5} ${x + 10},${base - h * 0.3} ${x + 22},${base}Z" fill="#6A5A44"/>`;
    const arcs = [];
    for (let i = 0; i < 7; i++) {
      const dir = i % 2 ? 1 : -1, reach = 120 + R() * 170, up = h * (0.24 + R() * 0.14);
      const sx = x + (R() - 0.5) * 16, sy = base - h * (0.6 + R() * 0.06);
      const ex = sx + dir * reach, ey = sy - up * 0.35;
      const cx1 = sx + dir * reach * 0.3, cy1 = sy - up * 1.1;
      arcs.push([sx, sy, cx1, cy1, ex, ey]);
      g += `<path d="M${f2(sx)},${f2(sy)} Q${f2(cx1)},${f2(cy1)} ${f2(ex)},${f2(ey)}" fill="none" stroke="#6A5A44" stroke-width="${f2(5 + R() * 4)}" stroke-linecap="round"/>`;
    }
    // strands hang from points along each arc
    for (const [sx, sy, cx1, cy1, ex, ey] of arcs) {
      for (let j = 0; j < 22; j++) {
        const u = 0.15 + R() * 0.85, q = (a, b, c) => (1 - u) * (1 - u) * a + 2 * (1 - u) * u * b + u * u * c;
        const px = q(sx, cx1, ex), py = q(sy, cy1, ey);
        const len = h * (0.22 + R() * 0.42) * (0.6 + 0.4 * u);
        const col = R() < 0.45 ? '#8E9A6C' : R() < 0.5 ? '#7A8A5A' : '#A3AD7E';
        const sw = 1 + R() * 2.5;
        g += `<path d="M${f2(px)},${f2(py)} C${f2(px + sw * 3)},${f2(py + len * 0.35)} ${f2(px - sw * 2)},${f2(py + len * 0.7)} ${f2(px + sw)},${f2(py + len)}" fill="none" stroke="${col}" stroke-width="${f2(3 + R() * 3)}" stroke-linecap="round" stroke-dasharray="${f2(6 + R() * 6)} ${f2(2 + R() * 2)}"/>`;
      }
    }
    // a few soft leaf masses near the top for volume
    for (let i = 0; i < 9; i++) {
      const cx = x + (R() - 0.5) * 320, cy = top + h * (0.08 + R() * 0.16);
      g += `<ellipse cx="${f2(cx)}" cy="${f2(cy)}" rx="${f2(50 + R() * 50)}" ry="${f2(22 + R() * 18)}" fill="${R() < 0.5 ? '#94A06F' : '#86935F'}" opacity="0.85" transform="rotate(${f2((R() - 0.5) * 30)} ${f2(cx)} ${f2(cy)})"/>`;
    }
    return g;
  };
  const willows = willow(260, 560, 3) + willow(1600, 600, 5) + willow(2500, 540, 7) + willow(3200, 580, 9);
  const road = (() => {
    const R = rng(33);
    let g = `<rect x="0" y="0" width="3600" height="560" fill="#D8C7A0"/>`;
    g += `<rect x="0" y="0" width="3600" height="46" fill="#BDB07A"/>`;          // back verge (grass)
    g += `<path d="M0,40 L3600,40" stroke="#A8957A" stroke-width="3"/>`;
    g += `<rect x="0" y="110" width="3600" height="230" fill="#E2D3B0"/>`;        // the road bed
    for (let i = 0; i < 70; i++) { const x = R() * 3600, y = 120 + R() * 210, w = 60 + R() * 200; g += `<path d="M${f2(x)},${f2(y)} l${f2(w)},${f2((R() - 0.5) * 6)}" stroke="#C8B48C" stroke-width="${f2(2 + R() * 3)}" stroke-linecap="round" opacity="0.7"/>`; }
    for (let i = 0; i < 90; i++) { const x = R() * 3600, y = 6 + R() * 34; g += `<path d="M${f2(x)},${f2(y + 10)} l-4,-14 M${f2(x + 5)},${f2(y + 10)} l2,-16 M${f2(x + 9)},${f2(y + 10)} l6,-12" stroke="#93975E" stroke-width="2.4" stroke-linecap="round"/>`; }
    g += `<rect x="0" y="340" width="3600" height="220" fill="#CDBB92"/>`;
    for (let i = 0; i < 40; i++) { const x = R() * 3600, y = 360 + R() * 180; g += `<ellipse cx="${f2(x)}" cy="${f2(y)}" rx="${f2(6 + R() * 14)}" ry="${f2(3 + R() * 5)}" fill="#A8957A" opacity="0.6"/>`; }
    return g;
  })();
  const fore = (() => {
    const R = rng(44);
    let g = '';
    for (let i = 0; i < 22; i++) {
      const x = i * 170 + R() * 80, h = 40 + R() * 60;
      for (let j = 0; j < 7; j++) { const a = -40 + j * 13 + (R() - 0.5) * 10; g += `<path d="M${f2(x)},120 q${f2(Math.sin(a * Math.PI / 180) * h * 0.4)},${f2(-h * 0.6)} ${f2(Math.sin(a * Math.PI / 180) * h)},${f2(-h)}" fill="none" stroke="${R() < 0.5 ? '#8F8A55' : '#A3A06A'}" stroke-width="4" stroke-linecap="round"/>`; }
    }
    for (let i = 0; i < 12; i++) { const x = R() * 3600; g += `<ellipse cx="${f2(x)}" cy="${f2(110 + R() * 30)}" rx="${f2(16 + R() * 20)}" ry="${f2(9 + R() * 8)}" fill="#9C8B70"/>`; }
    return g;
  })();
  return {
    gate: bake('t08gate', 1300, 600, gate),
    trees: bake('t08trees', 3200, 600, trees),
    willows: bake('t08willows', 3500, 720, willows),
    road: bake('t08road', 3600, 560, road),
    fore: bake('t08fore', 3600, 160, fore),
  };
}
let RL = null;

function dustPuffs(t, xw, steps) {
  let s = '';
  for (const st of steps) {
    const u = (t - st) / 0.6;
    if (u < 0 || u > 1) continue;
    s += `<ellipse cx="${f2(xw)}" cy="${FEET - 4}" rx="${f2(10 + 26 * u)}" ry="${f2(4 + 8 * u)}" fill="#E9DCBC" opacity="${f2(0.55 * (1 - u))}"/>`;
  }
  return s;
}

function sceneB(t) {
  if (!RL) RL = roadLayers();
  const cx = camBx(t);
  const c = { x: cx, y: 0, zoom: 1 };
  let s = `<defs>${lg('t08sky', [[0, '#F1EBDC'], [0.65, '#F7F2E6'], [1, '#FBF8EF']])}${lg('t08haze', [[0, '#FFF8E8', 0], [0.5, '#FFF8E8', 0.45], [1, '#FFF8E8', 0]])}</defs>`;
  s += `<rect width="1920" height="1080" fill="url(#t08sky)"/>`;
  s += L(c, 0.3, `<g transform="translate(-260 160)" opacity="0.72">${RL.gate}</g>`, { id: 't08gate' });
  s += L(c, 0.45, `<g transform="translate(-600 120)" opacity="0.85">${RL.trees}</g>`, { id: 't08trees', bleed: 'lr' });
  s += `<g data-layer="fx-heat" data-z="45" data-bleed="lr"><rect x="-10" y="540" width="1940" height="110" fill="url(#t08haze)"/></g>`;
  s += L(c, 0.8, `<g transform="translate(-700 -20)">${RL.willows}</g>`, { id: 't08willow', bleed: 'lr' });
  s += L(c, 1, `<g transform="translate(-800 640)">${RL.road}</g>`, { id: 't08road', bleed: 'lrb' });
  // figures walk with the camera (world x = screen x + camera at d 1 while walking)
  const walkX = (x0) => x0 + walkCam(t);
  const xl = walkX(840), xg1 = walkX(1150), xg2 = walkX(520);
  const { ph, walking } = walkPhase(t);
  let fig = '';
  // short hard shadows under everyone
  for (const x of [xg2, xl, xg1]) fig += `<ellipse cx="${f2(x)}" cy="${FEET + 4}" rx="70" ry="12" fill="#B39F78" opacity="0.55"/>`;
  const steps = [64.45, 65.28, 66.98, 67.82].filter((x) => x <= t);
  fig += dustPuffs(t, xl, steps) + dustPuffs(t, xg1 + 8, steps.map((x) => x + 0.1)) + dustPuffs(t, xg2 - 6, steps.map((x) => x + 0.2));
  // rear guard (董超), staff on the shoulder
  const gph = walking ? (ph + 0.25) % 1 : null;
  fig += guard({ view: 'side', x: xg2, y: FEET, height: 287, phase: gph, staff: 'shoulder', tone: 0, id: 't08g2' });
  // 林冲: walking side view, or the look back (front view, head to the gate), 4-frame cross-fade each way
  const lb = ramp(t, T.look - 0.14, T.look, E.inOut) * (1 - ramp(t, T.tug + 0.04, T.tug + 0.18, E.inOut));
  if (lb < 1) fig += `<g opacity="${f2(1 - lb)}">${linWalk(t, xl, FEET)}</g>`;
  if (lb > 0) fig += `<g opacity="${f2(lb)}">${linLookBack(t, xl, FEET)}</g>`;
  // front guard (薛霸): turns his head back at the stop and tugs with his staff hand on 66.537
  const tug = Math.sin(clamp((t - T.tug) / 0.45) * Math.PI) * (t > T.tug ? 1 : 0);
  fig += guard({ view: 'side', x: xg1, y: FEET, height: 287, phase: walking ? (ph + 0.5) % 1 : null, staff: 'hand', staffAng: 10 - 30 * tug, tone: 1, id: 't08g1', armR: -10 - 50 * tug });
  s += L(c, 1, fig, { id: 't08figs' });
  s += L(c, 1.3, `<g transform="translate(-900 930)">${RL.fore}</g>`, { id: 't08fore', bleed: 'lrb' });
  // heat haze on the far road, brightness
  // glare from the world slide fades out
  const gl = 1 - ramp(t, 64.1, 64.75, E.out);
  if (gl > 0) s += `<g data-layer="fx-glare" data-z="760" data-bleed="all"><rect x="-10" y="-10" width="1940" height="1100" fill="#FAF6EC" opacity="${f2(gl)}"/></g>`;
  // eye-line pan into memory: sepia multiply rises
  const sp = ramp(t, T.pan, 67.65, E.inOut);
  if (sp > 0) s += `<g data-layer="fx-sepia" data-z="770" data-bleed="all"><rect x="-10" y="-10" width="1940" height="1100" fill="#C9A27A" style="mix-blend-mode:multiply" opacity="${f2(0.45 * sp)}"/></g>`;
  return s;
}

// ================================================================== C · S19 (sepia memory at the tavern table)
function tavernBG() {
  const w = 2400, h = 1400;
  let g = `<rect width="${w}" height="${h}" fill="#5A3E2B"/>`;
  // plank wall
  for (let x = 0; x < w; x += 92) g += `<rect x="${x}" y="0" width="90" height="${h}" fill="${x % 184 ? '#5E422E' : '#563B29'}"/><line x1="${x}" y1="0" x2="${x}" y2="${h}" stroke="#3F2B1D" stroke-width="3"/>`;
  // lattice window (light source), upper left
  g += `<rect x="250" y="150" width="620" height="520" fill="#F6D9A6"/>`;
  for (let i = 1; i < 8; i++) g += `<line x1="${250 + i * 77.5}" y1="150" x2="${250 + i * 77.5}" y2="670" stroke="#6B4A30" stroke-width="10"/>`;
  for (let j = 1; j < 7; j++) g += `<line x1="250" y1="${150 + j * 74}" x2="870" y2="${150 + j * 74}" stroke="#6B4A30" stroke-width="10"/>`;
  g += `<rect x="250" y="150" width="620" height="520" fill="none" stroke="#3F2B1D" stroke-width="26"/>`;
  // posts and a beam
  g += `<rect x="0" y="60" width="${w}" height="54" fill="#3F2B1D"/>`;
  g += `<rect x="1040" y="0" width="70" height="${h}" fill="#43301F"/><rect x="2080" y="0" width="70" height="${h}" fill="#43301F"/>`;
  // shelf with jars on the right
  g += `<rect x="1500" y="420" width="520" height="22" fill="#3F2B1D"/>`;
  for (let i = 0; i < 5; i++) { const x = 1540 + i * 96; g += `<path d="M${x},420 C${x - 30},400 ${x - 34},340 ${x - 10},320 L${x + 30},320 C${x + 54},340 ${x + 50},400 ${x + 20},420Z" fill="${i % 2 ? '#7A5A3A' : '#6A4C30'}"/><rect x="${x - 6}" y="306" width="32" height="16" fill="#4A3424"/>`; }
  // light beams from the window across the room
  g += `<path d="M250,150 L870,150 L1500,1400 L400,1400Z" fill="#F6D9A6" opacity="0.12"/>`;
  return bake('t08tavern', w, h, g);
}

// 林冲's near shoulder contour (d 1.4 layer coords): top edge passes under (620–700, 580)
const SH_TOP = 'M-200,760 C-100,690 80,650 280,630 C400,618 500,598 600,588 C680,580 760,588 840,620 C920,660 960,740 985,860';
const shY = (x) => {
  // approximate contour height at x (for placing the hand and the snow)
  const k = [[-200, 760], [80, 662], [280, 630], [400, 615], [500, 600], [600, 588], [680, 582], [720, 583], [760, 588], [840, 620], [920, 670], [960, 740], [985, 860]];
  for (let i = 1; i < k.length; i++) if (x <= k[i][0]) return lerp(k[i - 1][1], k[i][1], (x - k[i - 1][0]) / (k[i][0] - k[i - 1][0]));
  return 900;
};
function zhangArm(w, sh, lift) {
  // his right forearm across the table in the brown wide sleeve, tapering to a soft, loose cuff at the wrist
  const LN = '#2A1C17';
  const [x0, y0] = sh, [x1, y1] = w;
  const p = (x, y) => `${f2(x)},${f2(y)}`;
  const dx = x1 - x0, dy = y1 - y0, L0 = Math.hypot(dx, dy), ux = dx / L0, uy = dy / L0, nx = -uy, ny = ux;
  const at = (k, off) => [x0 + dx * k + nx * off, y0 + dy * k + ny * off];
  const sag = 24 - 10 * lift;
  // a smooth tapered sleeve: straight upper edge, gentle sag below the forearm, rounded soft opening at the wrist
  const pts = [at(0.02, -58), at(0.35, -50), at(0.7, -40), at(0.93, -32), at(0.985, -16), at(0.99, 8), at(0.965, 28), at(0.8, 36 + sag), at(0.5, 46 + sag), at(0.2, 56 + sag * 0.5), at(0.02, 62)];
  let s = `<path d="${smooth(pts, true, 0.6)}" fill="#6B5240" stroke="${LN}" stroke-width="2.4" stroke-linejoin="round"/>`;
  s += `<path d="${smooth([at(0.2, 34 + sag * 0.4), at(0.5, 30 + sag * 0.8), at(0.8, 24 + sag * 0.6), at(0.94, 18)], false, 0.6)}" fill="none" stroke="#54402F" stroke-width="20" stroke-linecap="round" opacity="0.55"/>`;
  s += `<path d="${smooth([at(0.2, -40), at(0.5, -36), at(0.8, -28)], false, 0.6)}" fill="none" stroke="#86694F" stroke-width="6" stroke-linecap="round" opacity="0.55"/>`;
  // soft cuff: the white inner sleeve shows as a thin curved band inside the opening, no cut cylinder
  s += `<path d="${smooth([at(0.95, -24), at(0.968, -6), at(0.968, 12), at(0.95, 24)], false, 0.6)}" fill="none" stroke="#D9D0BF" stroke-width="6" stroke-linecap="round" opacity="0.85"/>`;
  return s;
}
function zhangHand(x, y, sc, squeeze, curl) {
  // An old man's right hand resting ON 林冲's shoulder, back of the hand toward the camera. Origin = wrist (x, y); the
  // hand points left along the shoulder top (tilted with its slope). The fingers bend over the front of the shoulder:
  // we see the finger bases and the bent middle knuckles, the rest goes behind the shoulder's top contour (clipped).
  // The thumb hangs on our side, on the shoulder blade. ≈ 0.78 H long at 张教头's head size.
  const LN = '#2A1C17', sk = '#E3AE88', skS = '#C38D69', skD = '#A9754F', skL = '#F0C7A5';
  const press = 2.5 * squeeze, c = clamp(curl);
  let clip = `M-400,-400 L1600,-400 L1600,${f2(shY(1600))} `;
  for (let xx = 1000; xx >= -200; xx -= 20) clip += `L${xx},${f2(shY(xx) + 3)} `;
  clip += 'L-400,900Z';
  const g = (inner) => `<g transform="translate(${f2(x)} ${f2(y)}) rotate(-8) scale(${f2(sc)})">${inner}</g>`;
  let fing = '';
  // fingers: [y at the knuckle, width, length of the visible base]
  const F = [[-15, 16, 30], [-1, 16.5, 32], [13, 15.5, 30], [25, 13.5, 26]];
  F.forEach(([fy, w, len], i) => {
    const kx = -96 + i * 2;
    const ex = kx - len * (1 - 0.3 * c), ey = fy + press + len * 0.75 * c + (1 - c) * 2;
    const l = `M${f2(kx)},${f2(fy + press * 0.6)} Q${f2(kx - len * 0.6)},${f2(fy + press)} ${f2(ex)},${f2(ey)}`;
    fing += `<path d="${l}" fill="none" stroke="${LN}" stroke-width="${f2(w + 3.4)}" stroke-linecap="round"/>`;
    fing += `<path d="${l}" fill="none" stroke="${sk}" stroke-width="${f2(w)}" stroke-linecap="round"/>`;
    fing += `<path d="M${f2(kx - len * 0.55)},${f2(fy + press - w * 0.38)} q-2,${f2(w * 0.38)} 0,${f2(w * 0.76)}" fill="none" stroke="${skD}" stroke-width="1.3"/>`;
  });
  let s = `<clipPath id="t08shc"><path d="${clip}"/></clipPath>`;
  s += `<g clip-path="url(#t08shc)">${g(fing)}</g>`;
  let h = '';
  // back of the hand: tapers from the knuckles (≈ 62 tall) to the wrist (≈ 44), convex top, cel shadow below
  h += `<path d="M6,-20 C-20,-26 -60,-28 -92,-24 C-102,-20 -106,-8 -105,6 C-104,20 -100,30 -92,36 C-60,40 -24,34 6,24 C12,10 12,-8 6,-20Z" fill="${sk}" stroke="${LN}" stroke-width="2" stroke-linejoin="round"/>`;
  h += `<path d="M-92,34 C-60,38 -24,32 6,23 C-8,18 -50,22 -96,24Z" fill="${skS}"/>`;
  h += `<path d="M-10,-17 C-40,-22 -70,-22 -90,-18" fill="none" stroke="${skL}" stroke-width="3" stroke-linecap="round" opacity="0.8"/>`;
  // knuckle bumps along the end of the back of the hand
  h += `<path d="M-96,-22 C-100,-18 -100,-12 -96,-8 M-97,-6 C-101,-2 -101,4 -97,8 M-96,10 C-100,14 -100,20 -96,24" fill="none" stroke="${skD}" stroke-width="1.6" stroke-linecap="round"/>`;
  // tendons fanning from the wrist to the knuckles, and one vein (an old man's hand)
  h += `<path d="M0,-4 C-30,-10 -60,-14 -88,-15 M0,2 C-30,0 -60,-1 -88,1 M2,8 C-28,10 -58,14 -86,17" fill="none" stroke="${skD}" stroke-width="1.1" opacity="0.5"/>`;
  h += `<path d="M-14,-12 C-26,-6 -34,4 -48,8" fill="none" stroke="#B37C66" stroke-width="1.5" opacity="0.55"/>`;
  // thumb on our side, hanging over the shoulder blade
  h += `<path d="M-12,22 C-18,36 -28,52 -42,62 C-50,66 -56,60 -50,53 C-42,45 -36,34 -34,24Z" fill="${sk}" stroke="${LN}" stroke-width="1.8" stroke-linejoin="round"/>`;
  h += `<path d="M-38,48 C-42,52 -44,56 -44,60" fill="none" stroke="${skD}" stroke-width="1.2"/>`;
  s += g(h);
  // the sleeve's soft opening lip falls over the wrist (no cut cylinder)
  s += g(`<path d="M10,-30 C2,-18 -2,0 2,14 C4,22 8,30 14,34 L40,40 L40,-36Z" fill="#6B5240"/><path d="M10,-30 C2,-18 -2,0 2,14 C4,22 8,30 14,34" fill="none" stroke="${LN}" stroke-width="2"/><path d="M14,-26 C8,-14 6,2 9,14 C11,22 14,27 18,30" fill="none" stroke="#D9D0BF" stroke-width="4" stroke-linecap="round" opacity="0.8"/>`);
  return s;
}
function linBack(t) {
  // 林冲 from behind (soft foreground, d 1.4): back of the head (plain dark head cloth, bun), the near shoulder reaching
  // into the frame (top edge under (620–700, 580)), the cangue board's short end behind the neck; window rim light.
  const LN = '#1E1714';
  let s = '';
  s += `<path d="${SH_TOP} L1010,1180 L-200,1180Z" fill="#3B4356" stroke="${LN}" stroke-width="4"/>`;
  s += `<path d="M700,584 C790,596 870,640 920,700 C955,760 975,860 990,1180 L840,1180 C830,960 800,820 740,720 C700,660 650,620 600,600Z" fill="#2E3445"/>`;
  s += `<path d="M640,610 C700,630 740,660 770,700" fill="none" stroke="#4E5870" stroke-width="12" opacity="0.6"/>`;
  // the cangue board's short end behind the neck (rounded end, iron plate, 封皮 strip)
  s += `<path d="M30,690 C30,646 100,630 220,632 L440,636 C500,638 520,690 500,724 L470,760 C360,754 180,762 70,754 C42,744 30,716 30,690Z" fill="#8A6440" stroke="${LN}" stroke-width="4"/>`;
  s += `<path d="M50,698 C60,662 106,650 176,650 L184,756 C120,758 80,754 62,746Z" fill="#4B4F55"/>`;
  s += `<path d="M380,638 L440,640 C490,642 506,682 496,714 L470,746 L388,748Z" fill="#4B4F55" opacity="0.9"/>`;
  s += `<rect x="210" y="666" width="150" height="36" fill="#EFE9DC" opacity="0.9"/><path d="M228,680 h56 M228,690 h36" stroke="#B3302A" stroke-width="4"/>`;
  // neck and the back of the head
  s += `<path d="M190,654 C186,570 196,510 220,480 L370,480 C390,530 394,590 386,654Z" fill="#B98063" stroke="${LN}" stroke-width="4"/>`;
  const head = 'M150,430 C140,300 220,210 304,208 C404,206 462,290 452,420 C446,490 414,530 374,550 C326,570 248,566 210,540 C172,514 156,480 150,430Z';
  s += `<path d="${head}" fill="#22272F" stroke="${LN}" stroke-width="4"/>`;
  s += `<path d="M248,250 C238,190 278,150 316,152 C358,154 378,196 366,248 C336,236 288,236 248,250Z" fill="#1A1E25" stroke="${LN}" stroke-width="4"/>`;
  s += `<path d="M186,340 C236,312 372,312 432,342" fill="none" stroke="#353C4A" stroke-width="9"/>`;
  s += `<path d="M200,290 C230,276 270,270 300,272 M190,400 C240,382 360,384 440,404" fill="none" stroke="#2E3440" stroke-width="5"/>`;
  s += `<clipPath id="t08rim"><rect x="-200" y="0" width="420" height="1200"/></clipPath><g clip-path="url(#t08rim)"><path d="${head}" fill="none" stroke="#B89A78" stroke-width="12" opacity="0.75"/><path d="M-200,760 C-100,690 80,650 280,630" fill="none" stroke="#B89A78" stroke-width="10" opacity="0.5"/></g>`;
  // the shoulder top catches the window light
  s += `<path d="M420,616 C500,598 600,586 680,582 C740,582 790,592 830,612" fill="none" stroke="#6A7590" stroke-width="8" opacity="0.7"/>`;
  s += `<path d="M444,390 C468,384 480,410 472,438 C466,456 454,462 444,458" fill="#B98063" stroke="${LN}" stroke-width="3"/>`;
  return s;
}
function shoulderSnow(k) {
  // a soft mound of snow on the shoulder top where the hand was (72.55 →), growing; tapered ends
  const h = 6 + 30 * k;
  let d = `M460,${f2(shY(460) + 4)}`;
  for (let x = 460; x <= 860; x += 20) d += ` L${f2(x)},${f2(shY(x) - h * Math.pow(Math.sin(Math.PI * clamp((x - 460) / 400)), 0.6) * (0.8 + 0.2 * Math.sin(x * 0.05)))}`;
  d += ` L860,${f2(shY(860) + 8)} L460,${f2(shY(460) + 8)}Z`;
  return `<path d="${d}" fill="#FFFFFF" stroke="#DCE6EF" stroke-width="3" stroke-linejoin="round" opacity="${f2(Math.min(1, k * 1.4))}"/>`;
}

function camC(t) {
  // drift in from the right (continuing the pan) and push 1.00 -> 1.10 toward the hand
  const k = ramp(t, 67.3, 68.3, E.out);
  const z = lerp(1.0, 1.1, ramp(t, 67.8, 73.6, E.inOut));
  const c = camAt([700, 600], [700, 600], z);
  return { x: c.x + lerp(180, 0, k), y: c.y, zoom: z };
}

function sceneC(t) {
  const c = camC(t);
  let s = `<rect width="1920" height="1080" fill="#4A3424"/>`;
  s += L(c, 0.4, `<g transform="translate(-260 -200)">${tavernBG()}</g>`, { id: 't08tav', bleed: 'all', blur: 3 });
  // 张教头 behind the table
  const nod = Math.sin(clamp((t - T.nod) / 0.8) * Math.PI) * (t > T.nod ? 1 : 0);
  const zo = { x: 1236, y: 500, H: 250 };
  const smile = 0.15 + 0.2 * ramp(t, 70.3, 71.3, E.inOut);
  const blink = (t > 69.9 && t < 70.02) || (t > 72.6 && t < 72.72);
  const ze = { brow: 0.35 + 0.15 * nod, eye: blink ? 0.05 : 0.82 - 0.25 * nod, smile, nod, look: [-0.6, 0.15] };
  let z = zhang({ ...zo, e: ze });
  // his arm reaches to 林冲's shoulder: lands 68.592
  const sh = ZH.anchor('shoulderR', zo);
  const land = ramp(t, 67.95, T.hand, E.inOut);
  const handRest = [818, 574];       // wrist; the back of the hand lies across the shoulder top, fingers curl over its front
  const handFrom = [1040, 610];      // his hand rests on the table edge before he reaches
  const sqz = Math.sin(clamp((t - T.sq) / 0.3) * Math.PI) * (t > T.sq ? 1 : 0);
  const hp = [lerp(handFrom[0], handRest[0], land), lerp(handFrom[1], handRest[1], land) - 26 * Math.sin(land * Math.PI)];
  const handOp = 1 - ramp(t, T.dis, 73.4, E.inOut);
  // table (top surface in perspective), the 休书 lying between them, cups
  let tab = `<path d="M-200,690 L2200,690 L2200,1300 L-200,1300Z" fill="#7A5536"/>`;
  tab += `<path d="M-200,690 L2200,690" stroke="#9A7048" stroke-width="6"/>`;
  tab += `<path d="M-200,700 L2200,700 L2200,760 L-200,760Z" fill="#8C6440" opacity="0.5"/>`;
  tab += `<g transform="translate(1340 704) skewX(-12) scale(1 0.3)">${xiushu({ w: 420, h: 470, id: 't08xs', sign: 1, print: 1, printOp: 0.9 })}</g>`;
  const cup = (x, y, r) => `<path d="M${x - r},${y} C${x - r * 0.9},${y + r * 0.55} ${x - r * 0.35},${y + r * 0.72} ${x},${y + r * 0.72} C${x + r * 0.35},${y + r * 0.72} ${x + r * 0.9},${y + r * 0.55} ${x + r},${y}Z" fill="#8FA58F" stroke="#2A1C17" stroke-width="2.5"/>` +
    `<path d="M${x - r * 0.3},${y + r * 0.7} L${x - r * 0.36},${y + r * 0.95} L${x + r * 0.36},${y + r * 0.95} L${x + r * 0.3},${y + r * 0.7}Z" fill="#7A8F7A" stroke="#2A1C17" stroke-width="2"/>` +
    `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 0.28}" fill="#5A3E2B" stroke="#2A1C17" stroke-width="2.5"/><ellipse cx="${x}" cy="${y + 2}" rx="${r * 0.8}" ry="${r * 0.2}" fill="#9A6A3A"/>` +
    `<path d="M${x - r * 0.75},${y + r * 0.2} C${x - r * 0.6},${y + r * 0.45} ${x - r * 0.4},${y + r * 0.55} ${x - r * 0.2},${y + r * 0.58}" fill="none" stroke="#C8D8C4" stroke-width="3" opacity="0.7"/>`;
  tab += cup(940, 748, 44) + cup(1080, 742, 38);
  s += L(c, 0.9, z, { id: 't08zhang' });
  s += L(c, 0.95, tab, { id: 't08table', bleed: 'lrb' });
  // light pool on the hand
  s += L(c, 1.4, `<ellipse cx="720" cy="575" rx="260" ry="170" fill="url(#t08pool)" style="mix-blend-mode:screen"/>`, { id: 'fx-pool' });
  // 林冲's back in the foreground (soft), then the arm and hand on his shoulder (sharp)
  const snowK = ramp(t, 72.55, 73.6, E.inOut);
  s += L(c, 1.4, linBack(t), { id: 't08linback', blur: 6, bleed: 'lb' });
  if (handOp > 0) s += L(c, 1.4, `<g opacity="${f2(handOp)}">${zhangArm(hp, toFore(c, sh), 1 - land)}${zhangHand(hp[0], hp[1], 1.15, sqz, ramp(t, 68.35, T.hand, E.out))}</g>`, { id: 't08hand', bleed: 'r' });
  if (snowK > 0) s += L(c, 1.4, shoulderSnow(snowK), { id: 't08shsnow', blur: 1.5 });
  // sepia memory grade + vignette
  s += `<g data-layer="fx-sepia" data-z="770" data-bleed="all"><rect x="-10" y="-10" width="1940" height="1100" fill="#C9A27A" style="mix-blend-mode:multiply" opacity="0.4"/><rect x="-10" y="-10" width="1940" height="1100" fill="url(#t08cv)"/></g>`;
  // the first snow falls into the summer memory (white, ungraded)
  const n = Math.round(lerp(0, 10, ramp(t, T.s1, T.s1 + 0.2, E.lin)) + lerp(0, 46, ramp(t, T.s2, 73.6, E.in)));
  if (n > 0) {
    s += snow(t, { seed: 81, n: Math.min(n, 12), r: [5, 8], fall: 55, sway: 18, op: 0.95, cam: c, d: 1, area: [200, -40, 1800, 1100] });
    if (n > 12) s += snow(t, { seed: 82, n: n - 12, r: [2, 4], fall: 45, sway: 12, op: 0.85, cam: c, d: 0.7, area: [-40, -40, 1960, 1100] });
  }
  const defs = rg('t08pool', [[0, '#F6D9A6', 0.55], [1, '#F6D9A6', 0]]) + rg('t08cv', [[0.5, '#1A0F08', 0], [1, '#1A0F08', 0.55]], 0.52, 0.48, 0.8);
  return `<defs>${defs}</defs>` + s;
}
// the shoulder anchor of 张教头 is in the d 0.9 layer; the arm is drawn in the d 1.4 layer: convert
function toFore(c, p) {
  const sp = toScreen(c, 0.9, p);
  const s = 1 + ((c.zoom || 1) - 1) * 1.4;
  return [(sp[0] - 960) / s + 960 + c.x * 1.4, (sp[1] - 540) / s + 540 + c.y * 1.4];
}

// ================================================================== the take
export default {
  frame(t) {
    if (t < T.b - 0.4) return sceneA(t);
    if (t < T.b) {
      // world slide: A fully glared out by 64.15, B emerges under the glare
      return t < 64.15 ? sceneA(t) : sceneB(t);
    }
    if (t < 67.35) return sceneB(t);
    if (t < T.c) {
      const k = ramp(t, 67.35, T.c, E.inOut);
      return sceneB(t) + `<g opacity="${f2(k)}">${sceneC(t)}</g>`;
    }
    return sceneC(t);
  },
};
// for speed checks (tools only)
export const __cams = { camA, camBx, camC };
