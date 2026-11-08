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
import { L, kf, ramp, E, bake, snow, f2, clamp, lerp, rng, noise1, camAt, toScreen, shake, lg, rg, FPS } from '../lib.mjs';
import { lin } from '../../chars/rig/linchong.mjs';
import { xiushu } from '../cast/xiushu.mjs';
import { zhang, ZH } from '../cast/zhang.mjs';
import { guard } from '../cast/guard.mjs';

const T = { a: 59.87, m2: 60.291, m3: 60.708, clamp: 61.125, sag: 61.951, slide: 63.6, b: 64.45, look: 65.701, tug: 66.537, pan: 66.955, c: 67.8, hand: 68.592, sq: 69.01, nod: 71.506, s1: 71.506, s2: 71.924, dis: 72.95, end: 73.6 };
export const SHOULDER = { x: 640, y: 655 };

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
const TAT = [462, 279];                                                   // tattoo centre, rig data (front, left cheek)
const TATW = dA(TAT);
const ZA = 4.5;                                                           // ECU zoom

function zoomA(t) {
  if (t < 60.5) return lerp(ZA, ZA * 0.97, ramp(t, T.a, 60.5, E.lin));
  // constant-ratio pull-back with 8-frame eased ends (≈ 2.2 %/frame)
  const z0 = ZA * 0.97, a = 60.5, b = 63.05;
  const u = clamp((t - a) / (b - a)), e = 8 / FPS / (b - a);
  // smoothstep-ish ends on a linear core
  let k;
  if (u < e) k = (u * u) / (2 * e * (1 - e));
  else if (u > 1 - e) k = 1 - ((1 - u) * (1 - u)) / (2 * e * (1 - e));
  else k = (u - e / 2) / (1 - e);
  return z0 * Math.pow(1 / z0, k) * (t > b ? lerp(1, 0.985, ramp(t, b, T.b, E.inOut)) : 1);
}
function camA(t) {
  const z = zoomA(t);
  const m = clamp(Math.log(Math.max(z, 1)) / Math.log(ZA));
  const p = [lerp(960, TATW[0], m), lerp(560, TATW[1], m)];
  const q = [lerp(960, 1280, m), lerp(540, 600, m)];
  return camAt(p, q, z);
}

// abstract tattoo marks (rig data coords around TAT), three groups bloom in turn
const MARKS = [
  [[-13, -9, 5, 5], [-6, -10, 4, 6], [-12, -2, 6, 3]],
  [[1, -9, 5, 4], [2, -3, 4, 5], [8, -7, 3, 7]],
  [[-10, 4, 7, 3], [-1, 4, 5, 4], [6, 3, 4, 5]],
];
function marks(t) {
  const times = [T.a, T.m2, T.m3];
  let s = '';
  MARKS.forEach((g, gi) => {
    const k = ramp(t, times[gi], times[gi] + 0.42, E.out);
    if (k <= 0) return;
    for (const [x, y, w, h] of g) {
      const cx = TAT[0] + x + w / 2, cy = TAT[1] + y + h / 2;
      const hw = (w / 2) * (0.35 + 0.65 * k), hh = (h / 2) * (0.35 + 0.65 * k);
      s += `<rect x="${f2(cx - hw * 1.7)}" y="${f2(cy - hh * 1.7)}" width="${f2(hw * 3.4)}" height="${f2(hh * 3.4)}" rx="${f2(hw)}" fill="#2A3A55" opacity="${f2(0.16 * k)}"/>`;
      s += `<rect x="${f2(cx - hw)}" y="${f2(cy - hh)}" width="${f2(hw * 2)}" height="${f2(hh * 2)}" rx="0.6" fill="#2A3A55" opacity="${f2(0.88 * k)}"/>`;
    }
  });
  return s;
}

// the 文笔匠's hand and slim tool, in rig data coords; tip at the active mark
function tattooHand(t) {
  if (t > 61.1) return '';
  const tips = [[TAT[0] - 8, TAT[1] - 6], [TAT[0] + 4, TAT[1] - 4], [TAT[0] - 2, TAT[1] + 6]];
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
  let off = 7 * lift;
  if (t > 60.84) off += 260 * ramp(t, 60.84, 61.08, E.in);               // exits to the upper right
  const tx = tip[0] + u[0] * off, ty = tip[1] + u[1] * off;
  const ang = (Math.atan2(u[1], u[0]) * 180) / Math.PI;
  const LN = '#2A1C17', sk = '#D8A27E', skS = '#B98463';
  let s = `<g transform="translate(${f2(tx)} ${f2(ty)}) rotate(${f2(ang)})">`;
  // sleeve and back of the hand (off frame to the upper right at ECU)
  s += `<path d="M150,-60 L330,-80 L340,70 L160,64Z" fill="#5E4E3E" stroke="${LN}" stroke-width="1.6"/>`;
  s += `<path d="M78,-34 C104,-50 140,-56 168,-50 C176,-16 176,30 164,56 C136,58 106,50 86,30 C76,12 72,-14 78,-34Z" fill="${sk}" stroke="${LN}" stroke-width="1.5"/>`;
  s += `<path d="M150,-46 C160,-14 160,24 150,52 L166,54 C176,26 176,-16 168,-50Z" fill="${skS}"/>`;
  // curled fingers under the tool
  s += `<path d="M70,10 C78,24 96,34 116,32 C120,24 114,16 104,14 C94,12 84,8 76,2Z" fill="${sk}" stroke="${LN}" stroke-width="1.3"/>`;
  s += `<path d="M84,24 C94,38 112,46 132,42 C134,34 126,28 116,28" fill="${sk}" stroke="${LN}" stroke-width="1.3"/>`;
  // the tool: slim dark wood with a dull metal tip
  s += `<path d="M0,0 L10,-1.3 L104,-2.6 L104,2.6 L10,1.3Z" fill="#4A3A2C" stroke="${LN}" stroke-width="0.8"/>`;
  s += `<path d="M0,0 L10,-1.3 L10,1.3Z" fill="#9AA0A6"/>`;
  // index finger along the top of the tool, thumb from below (pinch)
  s += `<path d="M36,-5 C50,-11 74,-14 96,-16 C104,-22 112,-30 120,-34 C128,-24 122,-12 108,-6 C88,0 62,0 40,2 C34,0 32,-3 36,-5Z" fill="${sk}" stroke="${LN}" stroke-width="1.4"/>`;
  s += `<path d="M40,-4 C44,-7 48,-7 50,-4" fill="none" stroke="${skS}" stroke-width="1"/>`;
  s += `<path d="M44,5 C58,6 74,10 90,18 C98,22 104,30 102,38 C92,40 82,34 72,28 C60,22 50,16 42,10 C40,8 41,6 44,5Z" fill="${sk}" stroke="${LN}" stroke-width="1.4"/>`;
  s += `<path d="M47,6 C49,8 49,10 47,11" fill="none" stroke="${skS}" stroke-width="1"/>`;
  // a faint motion trail on the first landing (continues T07's downward sweep)
  if (t < T.a + 0.1) s += `<path d="M10,0 L120,0" stroke="#fff" stroke-width="10" opacity="${f2(0.18 * (1 - (t - T.a) / 0.1))}"/>`;
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
  const sw = 1 - ramp(t, 60.79, T.clamp, E.in);
  const [shx, shy] = shake(t, T.clamp, 3, 0.9, 3);
  const bounce = Math.sin(clamp((t - T.clamp) / 0.2) * Math.PI) * 3 * (t > T.clamp ? 1 : 0);
  const cTf = `translate(${f2(300 * sw + shx)} ${f2(560 * sw + shy + bounce)}) rotate(${f2(40 * sw)} 428 372)`;
  // head drops with the clamp (chin toward the chest; 10 frames), then a small settle
  const hd = ramp(t, T.clamp + 0.02, T.clamp + 0.36, E.out);
  const hTf = `translate(${f2(1.5 * hd)} ${f2(13 * hd)}) rotate(${f2(4 * hd)} 428 332)`;
  // shoulders sag on 61.95 (whole figure settles)
  const sag = 9 * ramp(t, T.sag, T.sag + 0.5, E.inOut);
  let out = `<g transform="translate(0 ${f2(sag * KA)})">` + body;
  out += `<g transform="${root}">`;
  if (sw < 1) out += `<g transform="${cTf}">${cang}</g>`;
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
  s += L(c, 1, figA(t), { id: 't08lin' });
  // cold grade: multiply blue; one cold shaft from above (screen)
  const sh = ramp(t, 61.4, 62.6, E.inOut);
  s += `<g data-layer="fx-grade" data-z="700" data-bleed="all"><rect x="-10" y="-10" width="1940" height="1100" fill="#8C9DB5" style="mix-blend-mode:multiply" opacity="0.62"/>`;
  s += `<path d="M${f2(780 - 60 * sh)},-20 L${f2(1140 + 60 * sh)},-20 L${f2(1360 + 120 * sh)},1100 L${f2(560 - 120 * sh)},1100Z" fill="url(#t08sh)" style="mix-blend-mode:screen" opacity="${f2(0.55 + 0.3 * sh)}"/>`;
  s += `<rect x="-10" y="-10" width="1940" height="1100" fill="url(#t08vg)"/></g>`;
  // world slide: the shaft widens into white summer glare
  const wk = ramp(t, T.slide, 64.15, E.in);
  if (wk > 0) s += `<g data-layer="fx-glare" data-z="760" data-bleed="all"><path d="M${f2(780 - 900 * wk)},-20 L${f2(1140 + 900 * wk)},-20 L${f2(1360 + 1400 * wk)},1100 L${f2(560 - 1400 * wk)},1100Z" fill="#FAF6EC" opacity="${f2(Math.min(1, wk * 1.15))}"/></g>`;
  const defs = lg('t08sh', [[0, '#C7D6E4', 0.95], [0.55, '#C7D6E4', 0.35], [1, '#C7D6E4', 0]]) + rg('t08vg', [[0.5, '#06080C', 0], [1, '#06080C', 0.6]], 0.5, 0.45, 0.78);
  return `<defs>${defs}</defs>` + s;
}

// ================================================================== B · S18 (summer road)
const WS = 300;                    // 林冲 1.80 m = 300 px
const FEET = 770;
// camera x (world px at d 1): walk 4.6 px/frame, stop for the look back, resume, then the eye-line pan left
function camBx(t) {
  const v = 4.6 * FPS;              // px/s
  const seg = (a, b, ea = 0.15, eb = 0.15) => {
    // distance travelled at speed v between a and b with eased ends, evaluated at t
    if (t <= a) return 0;
    const tt = Math.min(t, b), D = b - a;
    const x = (tt - a) / D;
    const sm = x < ea / D ? (x * x) / (2 * (ea / D)) : x > 1 - eb / D ? 1 - eb / D / 2 - ((1 - x) * (1 - x)) / (2 * (eb / D)) - (1 - eb / D - ea / D / 2) * 0 : x - ea / D / 2;
    return v * D * Math.max(0, sm);
  };
  let x = seg(63.9, 65.52, 0.01, 0.22) + seg(66.56, 67.3, 0.2, 0.01);
  // pan left along his eye-line (accelerates to ~22 px/frame)
  if (t > T.pan) { const u = t - T.pan; x -= 0.5 * 760 * Math.min(u, 0.85) ** 2 + (u > 0.85 ? 0 : 0); }
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
  // legs must sit behind the robe: insert them before the rest of the body
  return legs + r2;
}
function linLookBack(t, x, y) {
  // front view, head turned to screen-left (toward the gate), body turned 20°: reads as a look over the shoulder
  return lin({ view: 'front', costume: 'A', ...CONV, cangue: true, tattoo: 1, expr: { brow: 0.35, eye: 0.85, look: [-0.9, -0.1], mouth: -0.2, jaw: 0 }, x, y, height: WS, pose: { headTurn: -0.75, shoulderR: 3, shoulderL: 3 } });
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
    const R = rng(seed);
    let g = `<path d="M${x - 16},700 C${x - 10},${700 - h * 0.4} ${x - 26},${700 - h * 0.7} ${x - 6},${700 - h * 0.86} L${x + 10},${700 - h * 0.86} C${x + 18},${700 - h * 0.7} ${x + 6},${700 - h * 0.4} ${x + 16},700Z" fill="#6A5A44"/>`;
    g += `<path d="M${x},${700 - h * 0.82} C${x - 60},${700 - h * 0.98} ${x - 140},${700 - h * 1.0} ${x - 190},${700 - h * 0.92} M${x},${700 - h * 0.84} C${x + 70},${700 - h * 1.02} ${x + 160},${700 - h * 1.0} ${x + 200},${700 - h * 0.9}" fill="none" stroke="#6A5A44" stroke-width="9"/>`;
    // crown
    g += `<ellipse cx="${x}" cy="${f2(700 - h * 0.92)}" rx="230" ry="${f2(h * 0.17)}" fill="#7E8C5A"/>`;
    // hanging strands
    for (let i = 0; i < 46; i++) {
      const sx = x - 230 + R() * 460, sy = 700 - h * (0.9 + R() * 0.12), len = h * (0.3 + R() * 0.38);
      const col = R() < 0.5 ? '#8E9A6C' : '#7A8A5A';
      g += `<path d="M${f2(sx)},${f2(sy)} C${f2(sx + 6)},${f2(sy + len * 0.4)} ${f2(sx - 4)},${f2(sy + len * 0.7)} ${f2(sx + 3)},${f2(sy + len)}" fill="none" stroke="${col}" stroke-width="${f2(4 + R() * 4)}" stroke-linecap="round"/>`;
    }
    return g;
  };
  const willows = willow(260, 560, 3) + willow(1180, 600, 5) + willow(1980, 540, 7) + willow(2860, 580, 9);
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
    willows: bake('t08willows', 3200, 720, willows),
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
  let s = `<defs>${lg('t08sky', [[0, '#F1EBDC'], [0.65, '#F7F2E6'], [1, '#FBF8EF']])}</defs>`;
  s += `<rect width="1920" height="1080" fill="url(#t08sky)"/>`;
  s += L(c, 0.3, `<g transform="translate(-260 160)" opacity="0.72">${RL.gate}</g>`, { id: 't08gate' });
  s += L(c, 0.45, `<g transform="translate(-600 120)" opacity="0.85">${RL.trees}</g>`, { id: 't08trees', bleed: 'lr' });
  s += L(c, 0.8, `<g transform="translate(-700 -20)">${RL.willows}</g>`, { id: 't08willow', bleed: 'lr' });
  s += L(c, 1, `<g transform="translate(-800 640)">${RL.road}</g>`, { id: 't08road', bleed: 'lrb' });
  // figures walk with the camera (world x = screen x + camera at d 1 while walking)
  const walkX = (x0) => x0 + Math.min(cx, camBx(Math.min(t, T.pan)));
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
  s += `<g data-layer="fx-heat" data-z="700" data-bleed="all"><rect x="-10" y="560" width="1940" height="90" fill="#FFF8E8" opacity="0.35"/></g>`;
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

function zhangArm(handPt, sh, k) {
  // his right sleeve from the shoulder across the table to the hand (foreshortened toward the camera)
  const [x0, y0] = sh, [x1, y1] = handPt;
  const w0 = 70 * k, w1 = 92 * k;
  const nx = (y1 - y0), ny = -(x1 - x0), nl = Math.hypot(nx, ny);
  const ux = nx / nl, uy = ny / nl;
  const LN = '#2A1C17';
  const p = (x, y) => `${f2(x)},${f2(y)}`;
  let s = `<path d="M${p(x0 + ux * w0, y0 + uy * w0)} C${p(lerp(x0, x1, 0.4) + ux * w0 * 1.1, lerp(y0, y1, 0.4) + uy * w0 * 1.1 - 10)} ${p(lerp(x0, x1, 0.8) + ux * w1, lerp(y0, y1, 0.8) + uy * w1)} ${p(x1 + ux * w1 * 0.7 + 30, y1 + uy * w1 * 0.7)} L${p(x1 - ux * w1 * 0.9 + 30, y1 - uy * w1 * 0.9)} C${p(lerp(x0, x1, 0.8) - ux * w1 * 1.1, lerp(y0, y1, 0.8) - uy * w1 * 1.1)} ${p(lerp(x0, x1, 0.4) - ux * w0, lerp(y0, y1, 0.4) - uy * w0 + 20)} ${p(x0 - ux * w0 * 0.6, y0 - uy * w0 * 0.6)}Z" fill="#6B5240" stroke="${LN}" stroke-width="3"/>`;
  s += `<path d="M${p(lerp(x0, x1, 0.3) - ux * w0 * 0.6, lerp(y0, y1, 0.3) - uy * w0 * 0.6 + 14)} C${p(lerp(x0, x1, 0.6) - ux * w1 * 0.7, lerp(y0, y1, 0.6) - uy * w1 * 0.7 + 10)} ${p(lerp(x0, x1, 0.85) - ux * w1 * 0.8, lerp(y0, y1, 0.85) - uy * w1 * 0.8)} ${p(x1 - ux * w1 * 0.8 + 30, y1 - uy * w1 * 0.8)}" fill="none" stroke="#54402F" stroke-width="${f2(26 * k)}" opacity="0.6"/>`;
  // cuff (inner white sleeve edge)
  s += `<ellipse cx="${f2(x1 + 34)}" cy="${f2(y1 - 4)}" rx="${f2(26 * k)}" ry="${f2(78 * k)}" fill="#C8BFAE" stroke="${LN}" stroke-width="2.5" transform="rotate(-14 ${f2(x1 + 34)} ${f2(y1 - 4)})"/>`;
  return s;
}
function zhangHand(x, y, k, squeeze) {
  // an old man's hand resting on the top of the shoulder, seen from behind 林冲: back of the hand toward us,
  // fingers curling over the shoulder toward the camera. Origin = wrist at (x, y).
  const LN = '#2A1C17', sk = '#E0A982', skS = '#BF8763', skD = '#A06C4C';
  const sq = 1 - 0.07 * squeeze;
  let s = `<g transform="translate(${f2(x)} ${f2(y)}) scale(${f2(k)})">`;
  // back of the hand (from the wrist toward screen-left/down)
  s += `<path d="M10,-38 C-30,-46 -78,-40 -108,-22 C-120,-8 -118,14 -104,30 C-70,42 -26,42 8,34 C22,18 24,-20 10,-38Z" fill="${sk}" stroke="${LN}" stroke-width="2.6"/>`;
  s += `<path d="M10,-38 C22,-20 22,18 8,34 C-6,30 -12,10 -10,-6 C-8,-22 0,-34 10,-38Z" fill="${skS}"/>`;
  // knuckle ridges + veins (age)
  s += `<path d="M-96,-14 C-90,-20 -82,-20 -76,-14 M-72,-20 C-66,-26 -58,-26 -52,-20 M-48,-22 C-42,-28 -34,-28 -28,-22" fill="none" stroke="${skD}" stroke-width="2.2" stroke-linecap="round"/>`;
  s += `<path d="M-20,-10 C-40,-6 -60,-2 -84,8 M-14,6 C-36,10 -60,16 -80,24" fill="none" stroke="${skD}" stroke-width="1.6" opacity="0.6"/>`;
  // fingers curling down over the shoulder toward the camera (foreshortened)
  const fing = [[-104, -8, 26], [-84, -14, 28], [-62, -16, 27], [-40, -16, 24]];
  for (const [fx, fy, w] of fing) {
    const L2 = 46 * sq;
    s += `<path d="M${fx - w / 2},${fy + 8} C${fx - w / 2 - 4},${fy + 8 + L2 * 0.6} ${fx - w / 2 + 2},${fy + 8 + L2} ${fx},${fy + 10 + L2} C${fx + w / 2 - 2},${fy + 8 + L2} ${fx + w / 2 + 4},${fy + 8 + L2 * 0.6} ${fx + w / 2},${fy + 8}Z" fill="${sk}" stroke="${LN}" stroke-width="2.4"/>`;
    s += `<path d="M${fx - w / 2 + 3},${fy + 8 + L2 * 0.55} C${fx - 3},${fy + 12 + L2 * 0.55} ${fx + 3},${fy + 12 + L2 * 0.55} ${fx + w / 2 - 3},${fy + 8 + L2 * 0.55}" fill="none" stroke="${skD}" stroke-width="1.6"/>`;
  }
  // thumb on the near (front) side of the shoulder, short
  s += `<path d="M2,24 C-10,40 -28,52 -46,56 C-54,52 -52,44 -44,40 C-30,34 -18,26 -8,14Z" fill="${sk}" stroke="${LN}" stroke-width="2.4"/>`;
  s += '</g>';
  return s;
}
function linBack(t, snowK) {
  // 林冲 from behind his left shoulder (foreground, soft): back of the head (plain dark head cloth, bun), the left
  // shoulder in the slate robe, the cangue board's short end behind the neck.
  const LN = '#1E1714';
  let s = '';
  // shoulder + back (slate, sepia-graded later)
  s += `<path d="M-120,1180 L-120,700 C-40,640 120,610 300,604 C420,600 560,612 660,640 C760,668 840,740 880,860 C910,960 920,1080 930,1180Z" fill="#3B4356" stroke="${LN}" stroke-width="4"/>`;
  s += `<path d="M560,628 C700,660 800,720 850,820 C880,900 892,1000 900,1180 L760,1180 C752,980 720,860 640,760 C600,710 560,660 520,640Z" fill="#2E3445"/>`;
  // collar line
  s += `<path d="M180,640 C260,700 330,720 400,704" fill="none" stroke="#283040" stroke-width="10"/>`;
  // the cangue board's short end behind the neck (rounded, iron plate)
  s += `<path d="M40,690 C40,640 120,620 260,624 L520,630 C600,632 620,690 600,730 L560,770 C420,760 200,770 80,760 C50,750 40,720 40,690Z" fill="#8A6440" stroke="${LN}" stroke-width="4"/>`;
  s += `<path d="M60,700 C70,660 120,646 200,644 L210,756 C140,758 90,756 70,748Z" fill="#4B4F55"/>`;
  s += `<path d="M440,632 L520,634 C580,636 600,680 590,716 L560,750 L450,752Z" fill="#4B4F55" opacity="0.9"/>`;
  s += `<rect x="250" y="660" width="170" height="40" fill="#EFE9DC" opacity="0.9"/><path d="M270,676 h60 M270,688 h40" stroke="#B3302A" stroke-width="4"/>`;
  // back of the head: neck, plain head cloth with the bun
  s += `<path d="M190,640 C186,560 196,500 220,470 L380,470 C400,520 404,580 396,640Z" fill="#C9906E" stroke="${LN}" stroke-width="4"/>`;
  s += `<path d="M150,420 C140,290 220,200 310,198 C410,196 470,280 460,410 C454,480 420,520 380,540 C330,560 250,556 210,530 C170,504 154,470 150,420Z" fill="#22272F" stroke="${LN}" stroke-width="4"/>`;
  s += `<path d="M250,240 C240,180 280,140 320,142 C364,144 384,186 372,238 C340,226 290,226 250,240Z" fill="#1A1E25" stroke="${LN}" stroke-width="4"/>`;
  s += `<path d="M190,330 C240,300 380,300 440,332" fill="none" stroke="#323845" stroke-width="8"/>`;
  // ear edge (his left ear, seen from behind)
  s += `<path d="M452,380 C476,374 488,400 480,428 C474,446 462,452 452,448" fill="#B98063" stroke="${LN}" stroke-width="3"/>`;
  // snow settling on the shoulder top (72.95 →)
  if (snowK > 0) {
    s += `<path d="M${f2(470)},${f2(626 - 4 * snowK)} C${f2(560)},${f2(618 - 18 * snowK)} ${f2(700)},${f2(640 - 20 * snowK)} ${f2(800)},${f2(700 - 14 * snowK)} C${f2(780)},${f2(712)} ${f2(640)},${f2(660)} ${f2(470)},${f2(640)}Z" fill="#FFFFFF" opacity="${f2(Math.min(1, snowK * 1.2))}"/>`;
  }
  return s;
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
  const land = ramp(t, 68.1, T.hand, E.out);
  const handRest = [640, 612];
  const handFrom = [880, 520];
  const sqz = Math.sin(clamp((t - T.sq) / 0.3) * Math.PI) * (t > T.sq ? 1 : 0);
  const hp = [lerp(handFrom[0], handRest[0], land), lerp(handFrom[1], handRest[1], land) + 3 * sqz];
  const handOp = 1 - ramp(t, T.dis, 73.4, E.inOut);
  // table (top surface in perspective), the 休书 lying between them, cups
  let tab = `<path d="M-200,690 L2200,690 L2200,1300 L-200,1300Z" fill="#7A5536"/>`;
  tab += `<path d="M-200,690 L2200,690" stroke="#9A7048" stroke-width="6"/>`;
  tab += `<path d="M-200,700 L2200,700 L2200,760 L-200,760Z" fill="#8C6440" opacity="0.5"/>`;
  tab += `<g transform="translate(860 712) skewX(-12) scale(1 0.34)">${xiushu({ w: 420, h: 470, id: 't08xs', sign: 1, print: 1, printOp: 0.9 })}</g>`;
  tab += `<ellipse cx="1430" cy="770" rx="44" ry="13" fill="#2C2320"/><path d="M1386,770 C1390,800 1470,800 1474,770" fill="#3A2E28"/>`;
  tab += `<ellipse cx="1560" cy="760" rx="34" ry="10" fill="#2C2320"/><path d="M1526,760 C1530,786 1590,786 1594,760" fill="#3A2E28"/>`;
  s += L(c, 0.9, z, { id: 't08zhang' });
  s += L(c, 0.95, tab, { id: 't08table', bleed: 'lrb' });
  // light pool on the hand
  s += L(c, 1.0, `<ellipse cx="640" cy="610" rx="300" ry="190" fill="url(#t08pool)" style="mix-blend-mode:screen"/>`, { id: 'fx-pool' });
  // 林冲's back in the foreground (soft), then the arm and hand on his shoulder (sharp)
  const snowK = ramp(t, 72.55, 73.6, E.inOut);
  s += L(c, 1.25, linBack(t, 0), { id: 't08linback', blur: 5, bleed: 'lb' });
  if (handOp > 0) s += L(c, 1.25, `<g opacity="${f2(handOp)}">${zhangArm(hp, toFore(c, sh), 1.1)}${zhangHand(hp[0], hp[1], 1.15, sqz)}</g>`, { id: 't08hand', bleed: 'r' });
  if (snowK > 0) s += L(c, 1.25, `<g>${linBack(t, snowK).split('<path d="M470').slice(1).map((x) => '<path d="M470' + x).join('')}</g>`, { id: 't08shsnow', blur: 1.5 });
  // sepia memory grade + vignette
  s += `<g data-layer="fx-sepia" data-z="770" data-bleed="all"><rect x="-10" y="-10" width="1940" height="1100" fill="#C9A27A" style="mix-blend-mode:multiply" opacity="0.4"/><rect x="-10" y="-10" width="1940" height="1100" fill="url(#t08cv)"/></g>`;
  // the first snow falls into the summer memory (white, ungraded)
  const n = Math.round(lerp(0, 10, ramp(t, T.s1, T.s1 + 0.2, E.lin)) + lerp(0, 46, ramp(t, T.s2, 73.6, E.in)));
  if (n > 0) {
    s += snow(t, { seed: 81, n: Math.min(n, 12), r: [3.5, 6], fall: 60, sway: 18, op: 0.95, cam: c, d: 1, area: [200, -40, 1800, 1100] });
    if (n > 12) s += snow(t, { seed: 82, n: n - 12, r: [2, 4], fall: 45, sway: 12, op: 0.85, cam: c, d: 0.7, area: [-40, -40, 1960, 1100] });
  }
  const defs = rg('t08pool', [[0, '#F6D9A6', 0.55], [1, '#F6D9A6', 0]]) + rg('t08cv', [[0.5, '#1A0F08', 0], [1, '#1A0F08', 0.55]], 0.52, 0.48, 0.8);
  return `<defs>${defs}</defs>` + s;
}
// the shoulder anchor of 张教头 is in the d 0.9 layer; the arm is drawn in the d 1.25 layer: convert
function toFore(c, p) {
  const sp = toScreen(c, 0.9, p);
  const s = 1 + ((c.zoom || 1) - 1) * 1.25;
  return [(sp[0] - 960) / s + 960 + c.x * 1.25, (sp[1] - 540) / s + 540 + c.y * 1.25];
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
