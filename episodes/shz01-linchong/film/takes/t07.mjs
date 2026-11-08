// T07 · 56.930–59.870 · S14 ECU shut eyes (忍 2: the vein, the exhale) → eyelid-slit wipe → S15 白虎节堂 from high
// above: the plaque, 林冲 small with the 宝刀, 高俅's arm sweeps down at him (its line continues as the tattoo
// stroke at the match cut into T08 at 59.870). Builder C. Entry from T06: the wine has turned to ink (dissolve).
import { L, ramp, E, camAt, bake, f2, clamp, lerp, rng, lg, rg, blurId, motes, noise1 } from '../lib.mjs';
import { lin, NE } from '../../chars/rig/linchong.mjs';
import { rigPoint } from '../cast/c_util.mjs';

const LN = '#2A1C17';

// ------------------------------------------------------------ S14: ECU eyes (front view, very large)
const KF = 12.6, EYEC = [426.5, 253.5];
const LCF = { x: 960 + (428 - EYEC[0]) * KF, y: 650 + (1468 - EYEC[1]) * KF, height: KF * 7.5 * ((1468 - 331) / 6.5) };
const fp = (p) => rigPoint('front', 'A', LCF, p);

function s14(t) {
  const z = lerp(1.0, 1.03, ramp(t, 56.93, 58.4, E.lin));
  const c = camAt([960, 500], [960, 500], z);
  const exhale = ramp(t, 57.8, 58.15, E.inOut);
  const open = ramp(t, 58.33, 58.5, E.inOut) * 0.22;
  const expr = { ...NE, brow: -0.5 + 0.05 * exhale, eye: open, mouth: -0.4, jaw: 1, look: [0, 0] };
  let s = `<rect x="-10" y="-10" width="1940" height="1100" fill="#0F0D10"/>`;
  let face = lin({ view: 'front', costume: 'A', ...LCF, expr });
  // the temple vein rises at 57.38 (his right temple, viewer's left)
  const v = ramp(t, 57.38, 57.58, E.out), tp = fp([371, 232]);
  const vein = `<path d="M${f2(tp[0])},${f2(tp[1] - 120)} C${f2(tp[0] + 30)},${f2(tp[1] - 60)} ${f2(tp[0] - 20)},${f2(tp[1])} ${f2(tp[0] + 16)},${f2(tp[1] + 70)} M${f2(tp[0] + 4)},${f2(tp[1] - 30)} l${f2(40)},${f2(-26)}" fill="none" stroke="#8A4E3C" stroke-width="${f2(6 + 8 * v)}" stroke-linecap="round" stroke-dasharray="400" stroke-dashoffset="${f2(400 * (1 - v))}" opacity="${f2(0.95 * v)}"/>`;
  s += L(c, 1.0, `<g data-allowcut="1">${face}${vein}</g>`, { id: 't07face', bleed: 'all' });
  // cool low key from the lower left, the rest falls into ink-dark (luma ≈ 55)
  s += `<rect width="1920" height="1080" fill="#3A4252" style="mix-blend-mode:multiply" opacity="0.72"/>`;
  s += `<rect width="1920" height="1080" fill="url(#t07key)" style="mix-blend-mode:screen"/>`;
  s += `<rect width="1920" height="1080" fill="url(#t07vig)"/>`;
  s += `<defs>${rg('t07key', [[0, '#6F7A8C', 0.55], [1, '#6F7A8C', 0]], 0.1, 1.0, 0.9)}${rg('t07vig', [[0.55, '#0F0D10', 0], [1, '#0F0D10', 0.75]], 0.5, 0.5, 0.75)}</defs>`;
  // out of the ink (T06's wine turned to ink)
  const ink = 1 - ramp(t, 56.93, 57.3, E.out);
  if (ink > 0) s += `<rect width="1920" height="1080" fill="#0F0D10" opacity="${f2(ink)}"/>`;
  return s;
}

// ------------------------------------------------------------ S15: 白虎节堂, extreme high angle
function hallFloor() {
  // floor + back wall (bake 2400×1500 at -240,-210), steel blue, tiles converging toward the far wall
  const ox = 240, oy = 210, X = (x) => x + ox, Y = (y) => y + oy;
  let s = `<rect width="2400" height="1500" fill="#2B3340"/>`;
  // back wall + beam at the top
  s += `<rect x="0" y="0" width="2400" height="${Y(250)}" fill="#1D232D"/>`;
  s += `<rect x="0" y="${Y(232)}" width="2400" height="26" fill="#141820"/>`;
  // tiles: horizontal joints (spacing grows toward the bottom = nearer), radial joints from a far point
  let y = 260, sp = 46;
  while (y < 1300) { s += `<rect x="0" y="${Y(y)}" width="2400" height="3" fill="#1F2630"/>`; y += sp; sp *= 1.1; }
  const vp = [960, -900];
  for (let i = -16; i <= 16; i++) {
    const xb = 960 + i * 190, k0 = (260 - vp[1]) / (1300 - vp[1]);
    s += `<line x1="${X(vp[0] + (xb - vp[0]) * k0)}" y1="${Y(260)}" x2="${X(xb)}" y2="${Y(1300)}" stroke="#1F2630" stroke-width="3"/>`;
  }
  // a long runner carpet down the middle toward the dais (dark red, cold)
  s += `<path d="M${X(880)},${Y(260)} L${X(1040)},${Y(260)} L${X(1180)},${Y(1300)} L${X(740)},${Y(1300)}Z" fill="#3A2630" opacity="0.8"/>`;
  // columns at both sides (seen from above: dark bases)
  for (const x of [120, 1800]) for (let j = 0; j < 3; j++) s += `<rect x="${X(x)}" y="${Y(300 + j * 300)}" width="${110 + j * 20}" height="${200 + j * 60}" fill="#161B23"/><rect x="${X(x + 10)}" y="${Y(300 + j * 300)}" width="24" height="${200 + j * 60}" fill="#2E3846"/>`;
  return s;
}
const FLOOR_DEFS = '';

function plaque() {
  // 「白虎节堂」 plaque, top centre (x 760–1160, y 120–220): dark board, gold frame, gold characters
  let s = `<rect x="740" y="108" width="440" height="126" fill="#141518" stroke="#C9A45C" stroke-width="7"/>`;
  s += `<rect x="752" y="120" width="416" height="102" fill="none" stroke="#7E6630" stroke-width="2"/>`;
  s += `<text x="960" y="172" text-anchor="middle" dominant-baseline="central" font-family="Noto Serif CJK SC" font-weight="900" font-size="80" fill="#C9A45C" letter-spacing="14">白虎节堂</text>`;
  return s;
}

function dais() {
  // the dais at the upper right with the white-tiger screen behind it (abstract ink tiger, no copy)
  let s = `<path d="M1240,250 L1720,250 L1760,470 L1210,470Z" fill="#3D4A5C"/><path d="M1210,470 L1760,470 L1760,500 L1210,500Z" fill="#232B36"/>`;
  s += `<rect x="1280" y="20" width="420" height="250" fill="#D8DCE0"/>`;
  for (let i = 1; i < 4; i++) s += `<rect x="${1280 + i * 105 - 3}" y="20" width="6" height="250" fill="#9AA3AD"/>`;
  // an abstract ink tiger: one crouching body stroke, a head, a few stripes
  s += `<path d="M1330,210 C1380,170 1450,176 1520,160 C1580,146 1620,150 1650,130" fill="none" stroke="#2A2E35" stroke-width="22" stroke-linecap="round"/>`;
  s += `<circle cx="1655" cy="124" r="22" fill="#2A2E35"/><path d="M1340,206 C1316,226 1312,246 1322,262 M1500,166 C1496,196 1500,226 1512,250" fill="none" stroke="#2A2E35" stroke-width="12" stroke-linecap="round"/>`;
  s += `<path d="M1420,172 q8,-18 2,-34 M1470,166 q8,-18 2,-34 M1560,150 q8,-16 2,-30" fill="none" stroke="#D8DCE0" stroke-width="7" stroke-linecap="round"/>`;
  s += `<rect x="1280" y="20" width="420" height="250" fill="none" stroke="#5A4A2A" stroke-width="12"/>`;
  return s;
}

function gaoqiu(t) {
  // 高俅 silhouette standing on the dais (upper right), 展脚幞头 wings; the arm sweeps down 59.50–59.87
  const k = ramp(t, 59.5, 59.87, E.in);
  const x = 1480, y = 452, h = 330, S = h / 100;
  const sil = '#0E1116';
  let s = `<g transform="translate(${x} ${y}) scale(${f2(S)})">`;
  s += `<path d="M-16,0 C-18,-30 -16,-60 -12,-74 C-6,-80 6,-80 12,-74 C16,-60 18,-30 16,0Z" fill="${sil}"/>`;
  s += `<ellipse cx="0" cy="-84" rx="8" ry="9" fill="${sil}"/><rect x="-7" y="-98" width="14" height="10" rx="3" fill="${sil}"/>`;
  s += `<rect x="-44" y="-93" width="88" height="3.2" rx="1.6" fill="${sil}"/>`;
  s += `<path d="M10,-72 C26,-66 30,-50 24,-34 L14,-40Z" fill="${sil}"/>`;
  // accusing arm: from raised (up-left of him, toward the plaque) to pointing down-left at 林冲
  const a = lerp(-100, -212, k); // degrees, screen: raised (up) → over the left → pointing down-left at 林冲
  const r = (a * Math.PI) / 180, L1 = 50;
  const sh = [-10, -70], hd = [sh[0] + Math.cos(r) * L1, sh[1] + Math.sin(r) * L1];
  s += `<path d="M${sh[0]},${sh[1]} L${f2(hd[0])},${f2(hd[1])}" stroke="${sil}" stroke-width="12" stroke-linecap="round"/>`;
  s += `<path d="M${f2(hd[0])},${f2(hd[1])} l${f2(Math.cos(r) * 12)},${f2(Math.sin(r) * 12)}" stroke="${sil}" stroke-width="4.5" stroke-linecap="round"/>`;
  s += `<path d="M${sh[0]},${sh[1] + 4} Q${f2((sh[0] + hd[0]) / 2)},${f2((sh[1] + hd[1]) / 2 + 12)} ${f2(hd[0])},${f2(hd[1])}" fill="none" stroke="${sil}" stroke-width="12" opacity="0.8"/>`;
  s += `</g>`;
  // motion smear of the sweep
  if (k > 0.05 && k < 1) {
    const r0 = (lerp(-100, -212, Math.max(0, k - 0.3)) * Math.PI) / 180;
    s += `<path d="M${f2(x - 10 * S + Math.cos(r0) * 50 * S)},${f2(y - 70 * S + Math.sin(r0) * 50 * S)} A${f2(50 * S)},${f2(50 * S)} 0 0 0 ${f2(x - 10 * S + Math.cos(r) * 50 * S)},${f2(y - 70 * S + Math.sin(r) * 50 * S)}" fill="none" stroke="${sil}" stroke-width="${f2(14 * S)}" opacity="0.18"/>`;
  }
  return s;
}

function sword(x, y, s) {
  // 宝刀 in its scabbard, hanging from his hand
  return `<g transform="translate(${f2(x)} ${f2(y)}) rotate(8) scale(${f2(s)})"><rect x="-5" y="-26" width="10" height="26" rx="3" fill="#2A1E16"/><rect x="-11" y="-2" width="22" height="7" rx="2" fill="#C9A45C"/>` +
    `<path d="M-6,5 L6,5 L7,120 C6,128 -6,128 -7,120Z" fill="#4A2418" stroke="#1a1010" stroke-width="1.5"/><rect x="-7" y="40" width="14" height="5" fill="#C9A45C"/><rect x="-7" y="112" width="14" height="6" fill="#C9A45C"/></g>`;
}

function s15(t) {
  const z = lerp(1.0, 1.12, ramp(t, 58.42, 59.87, E.sine));
  const c = camAt([960, 560 + 30 * ramp(t, 58.42, 59.87, E.sine)], [960, 540], z);
  let s = `<rect x="-10" y="-10" width="1940" height="1100" fill="#1D232D"/>`;
  s += L(c, 0.85, bake('t07floor', 2400, 1500, hallFloor(), { x: -240, y: -210, defs: FLOOR_DEFS }), { id: 't07floor', bleed: 'all' });
  s += L(c, 0.9, dais() + plaque(), { id: 't07dais' });
  s += L(c, 0.9, gaoqiu(t), { id: 't07gao' });
  // 林冲 small at the centre, foreshortened by the high angle, holding the 宝刀 (right hand = viewer's left)
  const LCo = { x: 960, y: 700, height: 330 };
  const fig = lin({ view: 'front', costume: 'A', ...LCo, expr: { ...NE, brow: 0.3, eye: 1.1 }, pose: { headTilt: -4 } });
  const hr = rigPoint('front', 'A', LCo, [190, 812]);
  const lcSq = `<g transform="translate(960 700) scale(1 0.84) translate(-960 -700)">${fig}${sword(hr[0], hr[1], 0.9)}</g>`;
  // guards' long shadows closing in from the edges
  const cl = ramp(t, 58.62, 59.87, E.inOut);
  let shadows = '';
  [[-200, 1100, 760, 760, 1], [2120, 1150, 1160, 770, -1], [-260, 300, 700, 640, 1], [2200, 420, 1220, 650, -1]].forEach(([x0, y0, x1, y1], i) => {
    const xe = lerp(x0, x1, 0.55 + 0.25 * cl), ye = lerp(y0, y1, 0.55 + 0.25 * cl);
    shadows += `<path d="M${x0},${y0 - 50} L${f2(xe)},${f2(ye - 16)} L${f2(xe)},${f2(ye + 16)} L${x0},${y0 + 50}Z" fill="#0E1116" opacity="0.55"/>`;
  });
  // cold key from a high window: a shaft and a pool of light on him
  const light = `<path d="M420,-60 L700,-60 L1060,760 L860,780Z" fill="#A9C1D9" opacity="0.16"/><ellipse cx="960" cy="700" rx="200" ry="70" fill="#A9C1D9" opacity="0.28"/>`;
  s += L(c, 1.0, light + shadows + lcSq, { id: 't07lin' });
  s += motes(t, { seed: 14, n: 20, area: [500, 0, 1300, 900], color: '#C7D6E4', op: 0.35, vx: 2, vy: 4 });
  s += `<rect width="1920" height="1080" fill="url(#t07hv)"/><defs>${rg('t07hv', [[0.5, '#0B0E13', 0], [1, '#0B0E13', 0.6]], 0.5, 0.55, 0.75)}</defs>`;
  return s;
}

// ------------------------------------------------------------ the eyelid slit (58.40–58.619)
function slitMask(t) {
  const k = ramp(t, 58.42, 58.619, E.in);
  const hh = lerp(4, 760, k), ww = lerp(500, 1500, Math.sqrt(k));
  return `<path d="M${f2(960 - ww)},540 Q960,${f2(540 - hh * 1.3)} ${f2(960 + ww)},540 Q960,${f2(540 + hh * 1.3)} ${f2(960 - ww)},540Z" fill="#fff" filter="url(#${blurId(6)})"/>`;
}

export default {
  enter: { a: 56.6, b: 56.93, type: 'dissolve', ease: E.inOut },
  frame(t) {
    if (t < 58.40) return s14(t);
    if (t >= 58.619) return s15(t);
    // the lids part on the hall: S14 sinks into the dark of his closed eyes; the slit shows the hall
    const dark = ramp(t, 58.36, 58.46, E.in);
    let s = s14(t) + `<rect width="1920" height="1080" fill="#07060A" opacity="${f2(0.6 + 0.4 * dark)}"/>`;
    s += `<defs><mask id="t07slit" maskUnits="userSpaceOnUse" x="0" y="0" width="1920" height="1080"><rect width="1920" height="1080" fill="#000"/>${slitMask(t)}</mask></defs>`;
    s += `<g mask="url(#t07slit)">${s15(t)}</g>`;
    return s;
  },
};
