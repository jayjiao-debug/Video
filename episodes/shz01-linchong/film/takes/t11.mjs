// T11 · 93.565–115.217 · S25 door → S26 雪夜上梁山 → S27 seasons → S28 the news (builder F)
// storyboard_v3 TAKE 11, colour C9–C10, film/timing.md (retimed: 「已故半载」 brushed with the voice).
import { L, kf, ramp, E, bake, snow, ridge, lerp, clamp, f2, rng, noise1, fbm1, wipeMask, shake, blurId, smooth, toScreen, toWorld } from '../lib.mjs';
import { lin } from '../../chars/rig/linchong.mjs';
import { walker, rearDoorSil, spearLevel, rearBust, smallBoat, smallMan, geese } from '../cast/liangshan.mjs';

const T25 = 93.565, T26 = 95.237, T27 = 100.241, T28 = 105.221, TEND = 115.217;
const WALK_V = 180; // px/s at d 1 (the world slides left, he stays at x ≈ 620)

// =============================================================== S25 · the door (93.565–95.237)
const S25_BG = bake('t11_s25bg', 2120, 1200, `
  <rect width="2120" height="1200" fill="#2A2420"/>
  <rect y="990" width="2120" height="210" fill="#211B17"/>
  <path d="M0,640 L260,600 L300,1200 L0,1200Z" fill="#1A1512"/>
  <path d="M0,980 C120,930 260,940 420,990 L460,1200 L0,1200Z" fill="#3A3024"/>
  <g stroke="#5A4A32" stroke-width="3" opacity="0.6">${Array.from({ length: 26 }, (_, i) => `<path d="M${20 + i * 15},${1000 + (i % 5) * 9} l${30 + (i % 7) * 6},${-18 - (i % 4) * 5}"/>`).join('')}</g>
  <rect x="1660" y="1010" width="190" height="110" rx="14" fill="#3B342C"/><rect x="1660" y="1010" width="190" height="20" rx="8" fill="#4E463C"/>
`);
function doorLeaf(hx, side, theta, top, bot, cx) {
  // hinge x (screen, at the door plane), leaf width 410, opens outward (away from camera) by theta (deg)
  const D = 1100, w = 410, r = (theta * Math.PI) / 180;
  const X = hx + side * w * Math.cos(r), Z = w * Math.sin(r), k = D / (D + Z);
  const sx = cx + (X - cx) * k, hy = 520;
  const t2 = hy + (top - hy) * k, b2 = hy + (bot - hy) * k;
  return `<path d="M${f2(hx)},${f2(top)} L${f2(sx)},${f2(t2)} L${f2(sx)},${f2(b2)} L${f2(hx)},${f2(bot)}Z" fill="#2E211A" stroke="#120C09" stroke-width="3"/>` +
    `<path d="M${f2(lerp(hx, sx, 0.5))},${f2(lerp(top, t2, 0.5) + 30)} L${f2(lerp(hx, sx, 0.5))},${f2(lerp(bot, b2, 0.5) - 30)}" stroke="#1C140F" stroke-width="5"/>` +
    `<path d="M${f2(sx)},${f2(t2)} L${f2(sx)},${f2(b2)}" stroke="#FFB15E" stroke-width="3" opacity="0.8"/>`;
}
function s25(t) {
  const c = { x: 0, y: 0, zoom: lerp(1, 1.08, ramp(t, T25, 94.45, E.sine)) };
  const open = ramp(t, T25, T25 + 0.2, E.out); // 6 frames
  const theta = lerp(12, 98, open);
  const light = ramp(t, T25, 94.40, E.in); // exposure ramp to white
  const sh = shake(t, T25, 3, 4, 2);
  const cx = 1180;
  let s = '';
  s += L(c, 1, `<g transform="translate(-100 -60)">${S25_BG}</g>`, { id: 't11s25bg', bleed: 'all' });
  // the opening: fire + blizzard light beyond
  const op = `<defs><radialGradient id="t11fire" cx="0.5" cy="0.78" r="0.75"><stop offset="0" stop-color="#FFFFFF"/><stop offset="0.25" stop-color="#FFE3A3"/><stop offset="0.6" stop-color="#FFB15E"/><stop offset="1" stop-color="#E07A3A"/></radialGradient></defs>` +
    `<rect x="780" y="80" width="800" height="880" fill="url(#t11fire)"/>` +
    `<path d="M780,960 ${Array.from({ length: 17 }, (_, i) => { const x = 780 + i * 50, h = 60 + 50 * (0.5 + 0.5 * noise1(t * 3 + i * 1.7, 4)); return `L${x},${f2(960 - h)} L${x + 25},${f2(960 - h * 0.4)}`; }).join(' ')} L1580,960Z" fill="#FFF4DC" opacity="0.7"/>`;
  s += L(c, 1, op, { id: 't11s25open' });
  // floor light spill from the door toward the camera
  s += L(c, 1, `<path d="M780,960 L1580,960 L${f2(1580 + 900 * open)},1300 L${f2(780 - 900 * open)},1300Z" fill="#FFB15E" opacity="${f2(0.25 + 0.5 * open)}"/>`, { id: 't11s25spill', bleed: 'all' });
  // snow bursting in through the doorway (radial, growing toward the lens)
  let sn = '';
  const R = rng(25);
  for (let i = 0; i < 110; i++) {
    const a = R() * Math.PI * 2, sp = 0.6 + R() * 0.8, ph = R();
    const pos = (q) => { const rr = 20 + 1000 * q * q; return [cx + Math.cos(a) * rr * 1.15 - 160 * q, 540 + Math.sin(a) * rr * 0.75]; };
    const p = ((t - T25) * sp * 1.5 + ph) % 1, p0 = Math.max(0, p - 0.06);
    if (t - T25 < ph * 0.15) continue;
    const [x, y] = pos(p), [x0, y0] = pos(p0);
    sn += `<line x1="${f2(x0)}" y1="${f2(y0)}" x2="${f2(x)}" y2="${f2(y)}" stroke-width="${f2(1.5 + 8 * p * p)}" opacity="${f2(Math.min(1, p * 4) * 0.85)}"/>`;
  }
  s += L(c, 1, `<g stroke="#FFFFFF" stroke-linecap="round">${sn}</g>`, { id: 'snow-t11door', bleed: 'all' });
  // door posts, lintel, threshold
  s += L(c, 1, `<rect x="730" y="30" width="60" height="980" fill="#3A2A20"/><rect x="1570" y="30" width="60" height="980" fill="#3A2A20"/><rect x="700" y="20" width="960" height="70" fill="#33251C"/><rect x="740" y="955" width="880" height="34" fill="#2A1E17"/>` +
    `<rect x="784" y="84" width="6" height="874" fill="#FFB15E" opacity="${f2(0.5 * open)}"/><rect x="1570" y="84" width="6" height="874" fill="#FFB15E" opacity="${f2(0.5 * open)}"/>`, { id: 't11s25frame' });
  // the leaves (shake 3 frames on the leaves only)
  s += L(c, 1, `<g transform="translate(${f2(sh[0])} ${f2(sh[1])})">${doorLeaf(790, 1, theta, 90, 958, cx)}${doorLeaf(1570, -1, theta, 90, 958, cx)}</g>`, { id: 't11s25leaves' });
  // 林冲 from behind, braced, spear level into the doorway; steps into the white from 93.98
  const step = ramp(t, 93.98, 94.40, E.inOut);
  const fx = 1080 + step * 60, fy = 1210 - step * 120, fk = 1 - step * 0.18;
  const sil = rearDoorSil({ height: 980, hat: false }); // 毡笠 left on the 供桌 (第十回); back on only after
  const spear = spearLevel(1150, 790, 1440, 548, 10, 4);
  const rimF = `<filter id="t11rimf" x="-10%" y="-10%" width="120%" height="120%" color-interpolation-filters="sRGB"><feMorphology in="SourceAlpha" operator="dilate" radius="3" result="d"/><feFlood flood-color="#FFB15E"/><feComposite in2="d" operator="in" result="r"/><feGaussianBlur in="r" stdDeviation="1.5" result="rb"/><feMerge><feMergeNode in="rb"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`;
  s += L(c, 1.05, `<defs>${rimF}</defs><g filter="url(#t11rimf)" opacity="${f2(1 - ramp(t, 94.1, 94.4))}"><g transform="translate(${f2(sh[0] * 0.6)} ${f2(sh[1] * 0.6)})"><g transform="translate(${f2(fx)} ${f2(fy)}) scale(${f2(fk)}) translate(${-1080} ${-1210})">${spear}<g transform="translate(1080 1210)">${sil}</g></g></g></g>`, { id: 't11s25lin', bleed: 'b' });
  // exposure: warm flood then white
  s += `<rect width="1920" height="1080" fill="#FFB15E" opacity="${f2(0.18 * open + 0.25 * light)}" style="mix-blend-mode:screen"/>`;
  s += `<rect width="1920" height="1080" fill="#FFFFFF" opacity="${f2(light)}"/>`;
  return s;
}

// =============================================================== S26 · snow night, the walker (95.237–100.241)
function cam26(t) {
  const cr = ramp(t, 98.569, 100.27, E.inOut);
  return { x: WALK_V * (t - T26), y: -100 * cr, zoom: 1 - 0.05 * cr };
}
const S26_FAR = bake('t11_s26far', 2600, 760, `
  <defs><linearGradient id="t11fog" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8FA3B8" stop-opacity="0"/><stop offset="1" stop-color="#8FA3B8" stop-opacity="0.85"/></linearGradient>
  <radialGradient id="t11glow"><stop offset="0" stop-color="#E07A3A" stop-opacity="0.8"/><stop offset="1" stop-color="#E07A3A" stop-opacity="0"/></radialGradient></defs>
  <path d="${ridge(11, -40, 2640, 470, 230, 760, 20)}" fill="#3E4C60" opacity="0.55"/>
  <rect y="330" width="2600" height="200" fill="url(#t11fog)"/>
  <ellipse cx="140" cy="560" rx="360" ry="150" fill="url(#t11glow)"/>
  <path d="${smooth([[1470, 610], [1540, 566], [1592, 522], [1628, 474], [1662, 436], [1694, 458], [1724, 414], [1752, 398], [1786, 442], [1822, 474], [1862, 458], [1904, 502], [1956, 548], [2010, 590], [2060, 612]], false, 0.35)} L2060,640 L1470,640Z" fill="#2E3846" opacity="0.92"/>
  <path d="M1662,436 l14,26 l10,-4 M1752,398 l12,30 l14,6 M1724,414 l-8,22" stroke="#9FB2C4" stroke-width="5" fill="none" opacity="0.45" stroke-linecap="round"/>
  <path d="M1500,600 C1600,585 1900,585 2040,604" stroke="#8FA3B8" stroke-width="18" opacity="0.35" fill="none"/>
  <path d="${ridge(23, -40, 2640, 560, 150, 760, 18)}" fill="#34404E" opacity="0.75"/>
  <rect y="470" width="2600" height="160" fill="url(#t11fog)" opacity="0.8"/>
  <path d="${ridge(37, -40, 2640, 610, 90, 760, 16)}" fill="#2E3846" opacity="0.85"/>
`);
const S26_MARSH = bake('t11_s26marsh', 2900, 260, (() => {
  let s = `<rect y="60" width="2900" height="200" fill="#AFC0CE"/><rect y="60" width="2900" height="10" fill="#C9D6E0"/>`;
  const R = rng(5);
  for (let i = 0; i < 70; i++) {
    const x = R() * 2900, n = 4 + Math.floor(R() * 7), base = 70 + R() * 120;
    for (let j = 0; j < n; j++) s += `<path d="M${f2(x + j * 4)},${f2(base)} q${f2(-4 + R() * 8)},${f2(-25 - R() * 30)} ${f2(-6 + R() * 12)},${f2(-50 - R() * 40)}" stroke="#4E5A68" stroke-width="2.2" fill="none" opacity="0.8"/>`;
  }
  return s;
})());
const S26_PLAIN = bake('t11_s26plain', 3300, 760, (() => {
  let s = `<defs><linearGradient id="t11pl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D2DCE5"/><stop offset="0.35" stop-color="#DDE6EE"/><stop offset="1" stop-color="#C3CFDA"/></linearGradient></defs><rect width="3300" height="760" fill="url(#t11pl)"/>`;
  const R = rng(8);
  for (let i = 0; i < 46; i++) {
    const x = R() * 3300, y = 30 + R() * 520, w = 120 + R() * 260;
    s += `<path d="M${f2(x)},${f2(y)} q${f2(w / 2)},${f2(-8 - R() * 10)} ${f2(w)},0" stroke="#AFBFCF" stroke-width="${f2(2 + R() * 3)}" fill="none" opacity="0.7"/>`;
    s += `<path d="M${f2(x + 10)},${f2(y - 3)} q${f2(w / 2)},${f2(-8 - R() * 10)} ${f2(w - 20)},0" stroke="#F2F6F9" stroke-width="2" fill="none" opacity="0.8"/>`;
  }
  return s;
})());
const S26_FG = bake('t11_s26fg', 4600, 420, (() => {
  let p = 'M0,420 L0,110';
  for (let x = 0; x <= 4600; x += 40) p += ` L${x},${f2(90 + 40 * fbm1(x / 500, 3))}`;
  p += ' L4600,420Z';
  return `<path d="${p}" fill="#7D8FA3"/><path d="${p}" fill="none" stroke="#B9C7D4" stroke-width="5" opacity="0.7"/>`;
})());
function s26(t) {
  const c = cam26(t);
  const wop = 1 - ramp(t, 99.25, 99.8, E.inOut); // he walks on into the snow before the pier appears
  let s = '';
  s += `<defs><linearGradient id="t11sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3E4C60"/><stop offset="0.55" stop-color="#6F8399"/><stop offset="1" stop-color="#8FA3B8"/></linearGradient></defs>`;
  s += `<rect x="-100" y="-300" width="2120" height="1500" fill="url(#t11sky)" data-layer="t11sky" data-z="0"/>`;
  s += L(c, 0.15, `<g transform="translate(-340 0)">${S26_FAR}</g>`, { id: 't11far', bleed: 'all' });
  s += L(c, 0.35, `<g transform="translate(-360 560)">${S26_MARSH}</g>`, { id: 't11marsh', bleed: 'all' });
  s += L(c, 1, `<g transform="translate(-500 640)">${S26_PLAIN}</g>`, { id: 't11plain', bleed: 'all' });
  // footprints: one per step, placed where the foot landed, they stay (world, d 1)
  const fx = 620 + c.x, fy = 700;
  let fp = '';
  const step = 0.42;
  for (let k = Math.floor((T26 - 6) / step); k * step <= t; k++) {
    const ts = k * step, x = 620 + WALK_V * (ts - T26) + (k % 2 ? 6 : -6);
    if (x < c.x - 200 || x > fx - 30) continue;
    fp += `<ellipse cx="${f2(x)}" cy="${f2(fy + (k % 2 ? 3 : -2))}" rx="9" ry="2.6" fill="#93A5B8"/>`;
  }
  s += L(c, 1, fp, { id: 't11prints', bleed: 'l' });
  // the walker (iconic silhouette: hat, spear on the shoulder, gourd at the tip)
  if (wop > 0) s += L(c, 1, walker({ t, x: fx, y: fy, height: 160, id: 't11wk', gourdCol: true }), { id: 't11walker', op: wop });
  s += L(c, 1.4, `<g transform="translate(-600 750)">${S26_FG}</g>`, { id: 't11fg', bleed: 'all' });
  // blizzard: three bands, slanting left (wind against him)
  s += snow(t, { seed: 261, n: 220, d: 0.5, r: [1, 2.2], fall: 170, slant: -28, sway: 10, cam: c, op: 0.75 });
  s += snow(t, { seed: 262, n: 150, d: 1.0, r: [2, 3.6], fall: 230, slant: -30, sway: 14, cam: c, op: 0.85 });
  s += snow(t, { seed: 263, n: 44, d: 1.6, r: [5, 9], fall: 320, slant: -32, sway: 18, cam: c, op: 0.7, blur: 3 });
  return s;
}

// =============================================================== S27 · seasons on the 梁山泊 pier (100.241–105.221)
const SEASONS = {
  su: { sky: '#C9D2D1', sky2: '#E3E7E2', water: '#7E9A9A', far: '#8FA295', reed: '#6E8F5A', plume: '#B9B48C', pier: '#6B5E4F' },
  au: { sky: '#D9CDB4', sky2: '#EDE4D2', water: '#8E9C92', far: '#A89A78', reed: '#C9A25A', plume: '#EAD9B0', pier: '#6B5E4F' },
  wi: { sky: '#D8DDE0', sky2: '#EEF0F1', water: '#9AAAB0', far: '#B7C0C4', reed: '#A79E8C', plume: '#F2F2EE', pier: '#7A7064', snow: true },
  sp: { sky: '#CBD8D0', sky2: '#E6ECE4', water: '#7E9E98', far: '#9DB28A', reed: '#8FB07A', plume: '#C9D6A8', pier: '#6B5E4F' },
};
// [time of the flip, season, sweep duration]
const FLIPS = [[T27 - 1, 'su', 0.01], [101.889, 'au', 0.4], [103.561, 'wi', 0.3], [103.98, 'sp', 0.3], [104.39, 'su', 0.3], [104.80, 'au', 0.3]];
function seasonBg(key) {
  const P = SEASONS[key];
  let s = `<defs><linearGradient id="t11sk${key}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${P.sky}"/><stop offset="1" stop-color="${P.sky2}"/></linearGradient>` +
    `<linearGradient id="t11wa${key}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${P.sky2}"/><stop offset="0.08" stop-color="${P.water}"/><stop offset="1" stop-color="${P.water}"/></linearGradient></defs>`;
  s += `<rect width="2200" height="1240" fill="url(#t11sk${key})"/>`;
  s += `<defs><linearGradient id="t11fs${key}" x1="0" y1="0" x2="1" y2="0"><stop offset="0.28" stop-color="#000"/><stop offset="0.6" stop-color="#fff"/></linearGradient><mask id="t11fm${key}" maskUnits="userSpaceOnUse" x="0" y="0" width="2200" height="700"><rect width="2200" height="700" fill="url(#t11fs${key})"/></mask></defs>`;
  s += `<path d="${ridge(71, -100, 2240, 520, 70, 600, 30)}" fill="${P.far}" opacity="0.55" mask="url(#t11fm${key})"/>`;
  s += `<rect y="520" width="2200" height="40" fill="${P.sky2}" opacity="0.85"/>`;
  s += `<rect y="540" width="2200" height="700" fill="url(#t11wa${key})"/>`;
  const R = rng(17);
  for (let i = 0; i < 40; i++) s += `<path d="M${f2(R() * 2200)},${f2(600 + R() * 600)} h${f2(60 + R() * 140)}" stroke="${P.sky2}" stroke-width="2" opacity="0.45"/>`;
  if (P.snow) s += `<path d="M0,560 C400,575 900,570 2200,560 L2200,590 C1200,600 500,600 0,592Z" fill="#E6E8E6" opacity="0.9"/>`;
  return bake(`t11_s27bg_${key}`, 2200, 1240, s);
}
const S27BG = Object.fromEntries(Object.keys(SEASONS).map((k) => [k, seasonBg(k)]));
function reedBand(t, key, seed, y0, h, x0 = -140, x1 = 2060, n = 140, op = 1) {
  const P = SEASONS[key], R = rng(seed);
  let s = '';
  for (let i = 0; i < n; i++) {
    const x = x0 + R() * (x1 - x0), hh = h * (0.6 + R() * 0.5), sw = noise1(t * 0.9 + x / 300, seed) * 10;
    const tip = [x + sw + (R() - 0.5) * 16, y0 - hh];
    s += `<path d="M${f2(x)},${f2(y0 + R() * 20)} Q${f2(x + sw * 0.4)},${f2(y0 - hh * 0.5)} ${f2(tip[0])},${f2(tip[1])}" stroke="${P.reed}" stroke-width="${f2(2.5 + R() * 2)}" fill="none"/>`;
    if (R() < 0.6) s += `<ellipse cx="${f2(tip[0])}" cy="${f2(tip[1] - 8)}" rx="4" ry="12" fill="${P.plume}" transform="rotate(${f2(sw * 2)} ${f2(tip[0])} ${f2(tip[1])})"/>`;
    if (P.snow && R() < 0.5) s += `<circle cx="${f2(tip[0])}" cy="${f2(tip[1] - 2)}" r="3.5" fill="#FFFFFF"/>`;
  }
  return `<g opacity="${op}">${s}</g>`;
}
function pierSvg(key) {
  const P = SEASONS[key];
  let s = '<g transform="translate(0 110)">' + `<path d="M-200,1160 L-200,880 L700,640 L760,656 L120,1160Z" fill="${P.pier}"/>`;
  for (let i = 0; i < 14; i++) { const k = i / 14; s += `<path d="M${f2(lerp(-200, 700, k))},${f2(lerp(880, 640, k))} L${f2(lerp(120, 760, k))},${f2(lerp(1160, 656, k))}" stroke="#4A3F34" stroke-width="${f2(lerp(5, 2, k))}"/>`; }
  for (const k of [0.25, 0.55, 0.85]) s += `<rect x="${f2(lerp(120, 760, k) - 6)}" y="${f2(lerp(1160, 656, k))}" width="${f2(lerp(14, 6, k))}" height="${f2(lerp(120, 50, k))}" fill="#3E342B"/>`;
  if (P.snow) s += `<path d="M-200,880 L700,640 L760,656 L120,1160 L60,1160 L690,652 L-200,890Z" fill="#F2F4F5" opacity="0.9"/>`;
  return s + '</g>';
}
function seasonAt(t, x) {
  // season key for screen x at time t (sweeps left -> right)
  let key = 'su';
  for (const [tf, k, d] of FLIPS) { const front = -100 + ((t - tf) / d) * 2120; if (t >= tf && x <= front) key = k; }
  return key;
}
function s27scene(t, key, rise = 1) {
  let s = `<g transform="translate(-140 -80)">${S27BG[key]}</g>`;
  s += reedBand(t, key, 31, 600, 210 * rise, 900, 2100, 80);
  s += reedBand(t, key, 32, 520, 120 * rise, -140, 2060, 70, 0.75);
  s += pierSvg(key);
  s += reedBand(t, key, 33, 1120, 260 * rise, -200, 380, 30);
  return s;
}
// 林冲 on the pier: 梁山 look (costume A, dark indigo robe, plain head cloth), side view facing right
const LS_COL = { robe: '#2E3446', sash: '#4A3A30' };
function linPier(t, h = 300) {
  const br = Math.sin(t * 1.6) * 0.004;
  return `<g transform="translate(637 786) scale(1 ${f2(1 + br)}) translate(-637 -786)">${lin({ view: 'side', costume: 'A', flip: true, x: 637, y: 786, height: h, col: LS_COL, headCloth: 'plain', expr: { brow: 0.2, eye: 0.85, look: [0.3, 0.1] }, pose: { shoulderR: 4, elbowR: 6 } })}</g>`;
}
function s27(t, rise = 1) {
  const z = lerp(1, 1.06, ramp(t, T27, T28, E.sine));
  const drift = ramp(t, T28 - 0.25, T28 + 0.6, E.inOut);
  const c = { x: 20 + 60 * drift, y: 40 * drift, zoom: z + 0.18 * drift };
  // per season scene, with sweep masks between consecutive seasons
  let cur = 'su', s = '';
  const active = FLIPS.filter(([tf]) => t >= tf);
  const last = active[active.length - 1];
  const prev = active.length > 1 ? active[active.length - 2][1] : last[1];
  const [tf, key, d] = last;
  const front = -420 + ((t - tf) / d) * 2760;
  if (front < 2340 && prev !== key) {
    s += L(c, 1, s27scene(t, prev), { id: 't11s27a', bleed: 'all' });
    const id = `t11sw${Math.round(tf * 10)}`;
    s += `<defs><linearGradient id="${id}g" gradientUnits="userSpaceOnUse" x1="${f2(front - 420)}" y1="0" x2="${f2(front + 420)}" y2="0"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#000"/></linearGradient><mask id="${id}" maskUnits="userSpaceOnUse" x="-400" y="-400" width="2800" height="1900"><rect x="-400" y="-400" width="2800" height="1900" fill="url(#${id}g)"/></mask></defs>`;
    s += `<g mask="url(#${id})">${L(c, 1, s27scene(t, key), { id: 't11s27b', bleed: 'all' })}</g>`;
  } else s += L(c, 1, s27scene(t, key, rise), { id: 't11s27b', bleed: 'all' });
  cur = key;
  s += L(c, 1, linPier(t), { id: 't11s27lin' });
  // near reeds in front of the pier foot (left), sway
  s += geese(t, 102.25, 103.75, { x0: 2000, x1: -140, y0: 170, y1: 130 });
  // winter snow on the beat 103.561 (until spring)
  if (t >= 103.561 && t < 104.1) s += snow(t, { seed: 271, n: 90, r: [1.5, 3.5], fall: 120, slant: -8, op: 0.85 * (1 - ramp(t, 103.9, 104.1)) });
  return s;
}

// =============================================================== S28 · the boat and the news (105.221–115.217)
const S28_INNER = (() => {
  let s = `<defs><linearGradient id="t11m" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#DDE2DE"/><stop offset="0.42" stop-color="#E3E7E2"/><stop offset="0.48" stop-color="#C9D3D0"/><stop offset="1" stop-color="#7E9A9A"/></linearGradient></defs><rect width="2160" height="1240" fill="url(#t11m)"/>`;
  s += `<path d="${ridge(91, 1300, 2200, 560, 60, 620, 30)}" fill="#AEBCB8" opacity="0.45"/>`;
  const R = rng(41);
  for (let i = 0; i < 120; i++) { const x = R() * 2160, y = 620 + R() * 520; s += `<path d="M${f2(x)},${f2(y)} h${f2(40 + R() * 160)}" stroke="#E3E7E2" stroke-width="2" opacity="${f2(0.25 + R() * 0.3)}"/>`; }
  // misty reed banks, left and right
  for (let i = 0; i < 160; i++) {
    const left = i < 90, x = left ? R() * 620 : 1500 + R() * 660, b = 600 + R() * 60, h = 90 + R() * 150;
    s += `<path d="M${f2(x)},${f2(b)} q${f2(-6 + R() * 12)},${f2(-h / 2)} ${f2(-10 + R() * 20)},${f2(-h)}" stroke="#7E8F80" stroke-width="${f2(2 + R() * 2)}" fill="none" opacity="${f2(0.35 + R() * 0.3)}"/>`;
  }
  s += `<rect y="430" width="2160" height="180" fill="#E3E7E2" opacity="0.35"/>`;
  return s;
})();
const S28_BG = bake('t11_s28bg', 2160, 1240, S28_INNER);
const S28_BGB = bake('t11_s28bgb', 2160, 1240, `<g filter="url(#t11bb)">${S28_INNER}</g>`, { defs: `<filter id="t11bb" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="6"/></filter>` });
function s28(t) {
  const push = ramp(t, T28, 108.553, E.inOut);
  const rack = ramp(t, 109.813, 109.813 + 14 / 30, E.inOut);
  const c = { x: 0, y: 0, zoom: lerp(1, 1.1, push), blurK: 7, focusD: lerp(0.5, 1.3, rack) };
  let s = '';
  s += L(c, 0.4, `<g transform="translate(-120 -80)">${S28_BG}</g>`, { id: 't11s28bg', bleed: 'all', blur: 0 });
  if (rack > 0) s += L(c, 0.4, `<g transform="translate(-120 -80)" opacity="${f2(rack)}">${S28_BGB}</g>`, { id: 't11s28bgb', bleed: 'all', blur: 0 });
  // the boat: out of the mist (105.64) to the pier end (108.553)
  const b = ramp(t, 105.64, 108.553, E.out);
  const bx = lerp(520, 790, b), by = lerp(585, 612, b), bs = lerp(0.8, 1, b), bop = ramp(t, 105.4, 106.8);
  const off = ramp(t, 108.85, 109.3, E.inOut); // the messenger steps off onto the pier
  const bow = ramp(t, 109.39, 109.9, E.out);
  let boat = `<g transform="translate(${f2(bx)} ${f2(by + Math.sin(t * 1.7) * 1.5)}) scale(${f2(bs)})">`;
  boat += `<g transform="translate(-110 -16)">${smallMan({ h: 118, kind: 'boatman', pole: Math.sin(t * 1.1) * 0.3 * (1 - b), coat: '#4A4E48' })}</g>`;
  if (off <= 0) boat += `<g transform="translate(40 -16)">${smallMan({ h: 120, kind: 'messenger', coat: '#4E5A62' })}</g>`;
  boat += smallBoat(330);
  boat += `</g>`;
  // the pier (from under him toward the boat), d 0.8
  const pier = `<path d="M2100,1300 L1500,1300 L880,628 L940,622Z" fill="#6B5E4F"/><path d="M880,628 L940,622 L944,632 L884,640Z" fill="#4A3F34"/>` +
    Array.from({ length: 12 }, (_, i) => { const k = i / 12; return `<path d="M${f2(lerp(1500, 880, k))},${f2(lerp(1300, 628, k))} L${f2(lerp(2100, 940, k))},${f2(lerp(1300, 622, k))}" stroke="#4A3F34" stroke-width="${f2(lerp(6, 1.5, k))}"/>`; }).join('');
  // messenger on the pier, bowing
  let mess = '';
  if (off > 0) {
    // from his place on the boat (boat layer, d 0.5) onto the pier end (pier layer, d 0.8)
    const onBoat = toWorld(c, 0.8, toScreen(c, 0.5, [bx + 40 * bs, by - 16 * bs]));
    const stand = [958, 652];
    const hop = Math.sin(off * Math.PI) * 18;
    const mx = lerp(onBoat[0], stand[0], E.inOut(off)), my = lerp(onBoat[1], stand[1], E.inOut(off)) - hop;
    mess = `<g transform="translate(${f2(mx)} ${f2(my)})">${smallMan({ h: lerp(120 * bs, 124, off), kind: 'messenger', bow, coat: '#4E5A62', facing: 1 })}</g>`;
  }
  s += L(c, 0.5, `<g opacity="${f2(bop)}">${boat}</g>`, { id: 't11s28boat' });
  s += L(c, 0.8, pier + mess, { id: 't11s28pier', bleed: 'rb' });
  // his back, right third (shoulders y ≈ 520), sinks as the words land
  const drop = ramp(t, 112.1, 113.2, E.inOut);
  s += L(c, 1.3, `<g transform="translate(1440 520)">${rearBust({ H: 250, drop, robe: '#2E3446', robeS: '#232837' })}</g>`, { id: 't11s28back', bleed: 'b' });
  // the news: desaturate, flatten contrast
  const des = ramp(t, 110.6, 112.2, E.inOut);
  s += `<rect width="1920" height="1080" fill="#888888" opacity="${f2(0.78 * des)}" style="mix-blend-mode:saturation"/>`;
  s += `<rect width="1920" height="1080" fill="#C9CCCA" opacity="${f2(0.16 * des)}"/>`;
  // the light drains with the drip (softens the jump into T12's night interior)
  const dk = ramp(t, 114.3, 115.217, E.in);
  if (dk > 0) s += `<rect width="1920" height="1080" fill="#2A3242" opacity="${f2(0.5 * dk)}"/>`;
  // 「已故半载」 brushed with the voice, then the drip
  s += callig(t);
  return s;
}
// --- calligraphy: 已故 (right column) / 半载 (left column, x 640), dry brush, each brushed in ~0.35 s with the voice.
// Two columns so the drip from 载 can end where T12's tear is at the cut (MC3: x ≈ 642, y ≈ 470).
const CH = [['已', 112.10, 790, 160], ['故', 112.45, 790, 296], ['半', 112.80, 640, 160], ['载', 113.14, 640, 296]];
const CFS = 128;
export const DRIP = { x: 642, y0: 352, y1: 470, t0: 114.38, t1: 115.217 };
export const dripHead = (t) => DRIP.y0 + (DRIP.y1 - DRIP.y0) * Math.pow(clamp((t - DRIP.t0) / (DRIP.t1 - DRIP.t0)), 2);
const DRY = `<filter id="t11dry" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency="0.09 0.22" numOctaves="3" seed="7" result="n"/><feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -3.2 2.75" result="m"/><feComposite in="SourceGraphic" in2="m" operator="in" result="t"/><feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" seed="3" result="d"/><feDisplacementMap in="t" in2="d" scale="5" xChannelSelector="R" yChannelSelector="G"/></filter>` +
  `<filter id="t11halo" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="9"/></filter>`;
const GLYPH = CH.map(([ch], i) => bake(`t11_glyph${i}`, 200, 200,
  `<text x="100" y="104" font-family="Ma Shan Zheng" font-size="${CFS + 8}" text-anchor="middle" dominant-baseline="central" fill="#15110E" opacity="0.18" filter="url(#t11halo)">${ch}</text>` +
  `<g filter="url(#t11dry)"><text x="100" y="100" font-family="Ma Shan Zheng" font-size="${CFS}" text-anchor="middle" dominant-baseline="central" fill="#15110E" stroke="#15110E" stroke-width="3.5" stroke-linejoin="round">${ch}</text></g>`, { defs: DRY }));
function callig(t) {
  if (t < 112.0) return '';
  let s = '<g data-layer="text-callig" data-z="700">';
  CH.forEach(([ch, t0, cx, cy], i) => {
    const p = ramp(t, t0, t0 + 0.38, E.inOut);
    if (p <= 0) return;
    const x = cx - 100, y = cy - 100;
    const m = wipeMask(x, y, 200, 200, p, 'down', 0.3);
    const sc = 1 + 0.03 * (1 - ramp(t, t0, t0 + 0.5, E.out));
    s += `<defs>${m.defs}</defs><g ${m.attr}><g transform="translate(${cx} ${cy}) scale(${f2(sc)}) translate(${-cx} ${-cy})"><g transform="translate(${x} ${y})">${GLYPH[i]}</g></g></g>`;
  });
  // the drip from the last stroke of 载, sliding down at x 642 (→ the tear in T12, same point at the cut)
  if (t >= DRIP.t0) {
    const y0 = DRIP.y0, y1 = dripHead(t), dx = DRIP.x;
    s += `<path d="M${f2(dx - 4)},${f2(y0 - 10)} C${f2(dx - 3)},${f2(lerp(y0, y1, 0.5))} ${f2(dx - 2)},${f2(y1 - 8)} ${f2(dx)},${f2(y1)} C${f2(dx + 2)},${f2(y1 - 8)} ${f2(dx + 3)},${f2(lerp(y0, y1, 0.5))} ${f2(dx + 4)},${f2(y0 - 10)}Z" fill="#15110E" opacity="0.85"/>`;
    s += `<ellipse cx="${f2(dx)}" cy="${f2(y1 + 4)}" rx="6" ry="8.5" fill="#15110E"/>`;
  }
  return s + '</g>';
}

// =============================================================== take
export default {
  frame(t) {
    if (t < T26 - 0.42) return s25(t);
    if (t < T26) {
      // white holds to 94.82, then the snowfield emerges (12 frames)
      const k = ramp(t, 94.82, T26, E.out);
      return s26(t) + `<rect width="1920" height="1080" fill="#FFFFFF" opacity="${f2(1 - k)}"/>`;
    }
    if (t < T27) {
      if (t < 99.82) return s26(t);
      // time-lapse melt: the snow plain becomes water, reeds rise; the walker dissolves into him standing on the pier
      const k = ramp(t, 99.82, T27 + 0.05, E.inOut);
      return s26(t) + `<g opacity="${f2(k)}">${s27(T27, lerp(0.25, 1, k))}</g>`;
    }
    if (t < T28 - 0.2) return s27(t);
    if (t < T28 + 0.6) {
      const k = ramp(t, T28 - 0.2, T28 + 0.6, E.inOut);
      return s27(t) + `<g opacity="${f2(k)}">${s28(t)}</g>`;
    }
    return s28(t);
  },
};
