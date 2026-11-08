// New keyframes for the v4 storyboard 《林冲为什么要休妻？》 (script_v4.md). One still each, 1920x1080.
//   KEYS.K16 … KEYS.K36 () -> SVG content (full frame). Rendered by film/board/render_new.mjs.
// Look: the film's flat cel style; the fight is played in silhouette against the fire (no blood, no wounds).
import { lg, rg, f2, rng, noise1, flames, embers, blurId, lerp, clamp, bake, PAPER, INK, SEAL } from '../lib.mjs';
import { lin, EX } from '../../chars/rig/linchong.mjs';
import { xiushu, XS } from '../cast/xiushu.mjs';
import { zhang } from '../cast/zhang.mjs';

const LINE = '#2A1C17';
const SIL = '#120C0A', RIM = '#FF8A3D';

// ------------------------------------------------------------------ rig points (screen position of a point in a posed part)
const mat = (str) => str.trim().split(/[ ,]+/).map(Number);
const mmul = (a, b) => [a[0] * b[0] + a[2] * b[1], a[1] * b[0] + a[3] * b[1], a[0] * b[2] + a[2] * b[3], a[1] * b[2] + a[3] * b[3], a[0] * b[4] + a[2] * b[5] + a[4], a[1] * b[4] + a[3] * b[5] + a[5]];
const mapp = (m, p) => [m[0] * p[0] + m[2] * p[1] + m[4], m[1] * p[0] + m[3] * p[1] + m[5]];
/** Screen point of ref point p in rig part `part` ('handL', 'legNear', 'legFar', 'farHand') of a lin() SVG string. */
function rigPt(svg, part, p) {
  const root = mat(svg.match(/data-rig="linchong"[^>]*transform="matrix\(([^)]+)\)"/)[1]);
  let m;
  if (part === 'farHand') {
    const far = svg.slice(svg.indexOf('data-part="farArm"'));
    const ms = [...far.matchAll(/<g transform="matrix\(([^)]+)\)"/g)].slice(0, 3);
    m = mat(ms[2][1]);
  } else m = mat(svg.match(new RegExp(`data-part="${part}" transform="matrix\\(([^)]+)\\)"`))[1]);
  return mapp(mmul(root, m), p);
}
const WRIST = [478, 846], FIST = [478, 890], HIP = [450, 850], FOOT = [470, 1462];

// ------------------------------------------------------------------ shared pieces
const fireSkyDefs = (id) => lg(id, [[0, '#1A0C0A'], [0.38, '#4A1C12'], [0.7, '#B3461C'], [1, '#F08A42']]);
function silFilters(id, rim = RIM, dx = 3, dy = -2) {
  return `<filter id="${id}s" x="-5%" y="-5%" width="110%" height="110%" color-interpolation-filters="sRGB"><feFlood flood-color="${SIL}"/><feComposite in2="SourceAlpha" operator="in"/></filter>` +
    `<filter id="${id}r" x="-5%" y="-5%" width="110%" height="110%" color-interpolation-filters="sRGB"><feFlood flood-color="${rim}"/><feComposite in2="SourceAlpha" operator="in"/><feOffset dx="${dx}" dy="${dy}"/><feGaussianBlur stdDeviation="1.2"/></filter>`;
}
/** A figure drawn as a rim-lit silhouette: rim copy (offset, coloured) under a flat dark copy. */
const silhouette = (id, inner) => `<g filter="url(#${id}r)">${inner}</g><g filter="url(#${id}s)">${inner}</g>`;

/** Generic silhouette figure from segment angles (deg from straight down, + = toward +x).
 *  o: { x, y (pelvis), h (standing height px), torso (deg from up, + leans to +x), head: 'cap'|'cloth'|'futou',
 *       armN:[upper, fore], armF:[upper, fore], legN:[thigh, shin], legF:[thigh, shin], robe 0..1, hatOff:[dx,dy,rot] } */
function figure(o) {
  const h = o.h, u = h / 100, th = o.thick || 1.35;
  const dir = (a, len) => [Math.sin((a * Math.PI) / 180) * len, Math.cos((a * Math.PI) / 180) * len];
  const P = [o.x, o.y];
  const tA = o.torso || 0;
  const up = (a, len) => [Math.sin((a * Math.PI) / 180) * len, -Math.cos((a * Math.PI) / 180) * len];
  const neck = [P[0] + up(tA, 30 * u)[0], P[1] + up(tA, 30 * u)[1]];
  const headC = [neck[0] + up(tA, 9 * u)[0], neck[1] + up(tA, 9 * u)[1]];
  const sh = [neck[0] + up(tA, -2 * u)[0], neck[1] + up(tA, -2 * u)[1]];
  const seg = (p, a, len) => [p[0] + dir(a, len)[0], p[1] + dir(a, len)[1]];
  const limb = (p0, a1, l1, a2, l2, w0, w1) => {
    const p1 = seg(p0, a1, l1), p2 = seg(p1, a2, l2);
    return `<path d="M${f2(p0[0])},${f2(p0[1])} L${f2(p1[0])},${f2(p1[1])} L${f2(p2[0])},${f2(p2[1])}" fill="none" stroke="#000" stroke-width="${f2(w0)}" stroke-linecap="round" stroke-linejoin="round"/>` +
      `<circle cx="${f2(p2[0])}" cy="${f2(p2[1])}" r="${f2(w1)}" fill="#000"/>`;
  };
  let s = '';
  // far limbs first
  if (o.armF) s += limb(sh, o.armF[0], 17 * u, o.armF[1], 15 * u, 5.4 * u * th, 3.2 * u * th);
  if (o.legF) s += limb(P, o.legF[0], 24 * u, o.legF[1], 24 * u, 7 * u * th, 4 * u * th);
  // torso (a tapered block) and robe skirt
  const perp = (a) => [Math.cos((a * Math.PI) / 180), Math.sin((a * Math.PI) / 180)];
  const pp = perp(tA);
  const tl = [sh[0] - pp[0] * 10.5 * u, sh[1] - pp[1] * 9 * u], tr = [sh[0] + pp[0] * 10.5 * u, sh[1] + pp[1] * 9 * u];
  const bl = [P[0] - pp[0] * 9.5 * u, P[1] - pp[1] * 8 * u], br = [P[0] + pp[0] * 9.5 * u, P[1] + pp[1] * 8 * u];
  s += `<path d="M${f2(tl[0])},${f2(tl[1])} L${f2(tr[0])},${f2(tr[1])} L${f2(br[0])},${f2(br[1])} L${f2(bl[0])},${f2(bl[1])}Z" fill="#000"/>`;
  if (o.robe) {
    const kN = seg(P, o.legN ? o.legN[0] : 0, 26 * u), kF = seg(P, o.legF ? o.legF[0] : 0, 26 * u);
    s += `<path d="M${f2(bl[0])},${f2(bl[1])} L${f2(br[0])},${f2(br[1])} L${f2(Math.max(kN[0], kF[0]) + 6 * u)},${f2(Math.max(kN[1], kF[1]))} L${f2(Math.min(kN[0], kF[0]) - 6 * u)},${f2(Math.max(kN[1], kF[1]) + 2 * u)}Z" fill="#000"/>`;
  }
  // neck + head + headgear
  s += `<path d="M${f2(sh[0])},${f2(sh[1])} L${f2(headC[0])},${f2(headC[1])}" stroke="#000" stroke-width="${f2(6 * u)}"/>`;
  s += `<ellipse cx="${f2(headC[0])}" cy="${f2(headC[1])}" rx="${f2(6.2 * u)}" ry="${f2(7.4 * u)}" fill="#000" transform="rotate(${f2(tA)} ${f2(headC[0])} ${f2(headC[1])})"/>`;
  const hatT = `translate(${f2(headC[0] + (o.hatOff ? o.hatOff[0] * u : 0))} ${f2(headC[1] + (o.hatOff ? o.hatOff[1] * u : 0))}) rotate(${f2(tA + (o.hatOff ? o.hatOff[2] : 0))})`;
  if (o.head === 'cap') s += `<path transform="${hatT}" d="M${f2(-9 * u)},${f2(-4 * u)} Q0,${f2(-17 * u)} ${f2(9 * u)},${f2(-4 * u)}Z" fill="#000"/>`;
  if (o.head === 'cloth') s += `<path transform="${hatT}" d="M${f2(-7 * u)},${f2(-3 * u)} Q0,${f2(-14 * u)} ${f2(7 * u)},${f2(-3 * u)}Z M${f2(5 * u)},${f2(-6 * u)} l${f2(6 * u)},${f2(7 * u)} l${f2(-3 * u)},${f2(2 * u)}Z" fill="#000"/>`;
  if (o.head === 'futou') s += `<path transform="${hatT}" d="M${f2(-6 * u)},${f2(-5 * u)} Q0,${f2(-15 * u)} ${f2(6 * u)},${f2(-5 * u)}Z" fill="#000"/><rect transform="${hatT}" x="${f2(-17 * u)}" y="${f2(-7 * u)}" width="${f2(34 * u)}" height="${f2(1.6 * u)}" fill="#000"/>`;
  // near limbs
  if (o.legN) s += limb(P, o.legN[0], 24 * u, o.legN[1], 24 * u, 7.4 * u * th, 4.2 * u * th);
  if (o.armN) s += limb(sh, o.armN[0], 17 * u, o.armN[1], 15 * u, 5.8 * u * th, 3.4 * u * th);
  return s;
}

function snowStreaks(seed, n, area, col, slant = 0.35, len = [30, 90], op = 0.7, w = [1.2, 3]) {
  const R = rng(seed); let s = '';
  for (let i = 0; i < n; i++) {
    const x = area[0] + R() * (area[2] - area[0]), y = area[1] + R() * (area[3] - area[1]), l = len[0] + R() * (len[1] - len[0]);
    s += `<path d="M${f2(x)},${f2(y)} l${f2(-l * slant)},${f2(l)}" stroke="${col}" stroke-width="${f2(w[0] + R() * (w[1] - w[0]))}" stroke-linecap="round" opacity="${f2(op * (0.4 + R() * 0.6))}"/>`;
  }
  return s;
}
function flakes(seed, n, area, col, r = [1.5, 4], op = 0.85) {
  const R = rng(seed); let s = '';
  for (let i = 0; i < n; i++) s += `<circle cx="${f2(area[0] + R() * (area[2] - area[0]))}" cy="${f2(area[1] + R() * (area[3] - area[1]))}" r="${f2(r[0] + R() * (r[1] - r[0]))}" fill="${col}" opacity="${f2(op * (0.5 + R() * 0.5))}"/>`;
  return s;
}
/** The burning 草料场 far away: smoke, flame bands, the black frame of the hut, haystacks. */
function burningDepot(id, x0, x1, base, hgt, t = 0.4) {
  const cx = (x0 + x1) / 2, w = x1 - x0;
  let s = '';
  for (let i = 0; i < 7; i++) s += `<ellipse cx="${f2(x0 + w * (0.1 + i * 0.13) + noise1(i * 3.1, 4) * 40)}" cy="${f2(base - hgt * (1.1 + (i % 3) * 0.35))}" rx="${f2(w * 0.16)}" ry="${f2(hgt * 0.28)}" fill="#2A1612" opacity="0.55"/>`;
  s += flames(t, { x0, x1, y: base, h: hgt, n: 18, seed: 21, cols: ['#A8301A', '#E04A1F', '#FF7A2E', '#FFB15E'] });
  s += `<path d="M${f2(cx - w * 0.3)},${base} L${f2(cx - w * 0.29)},${f2(base - hgt * 0.62)} L${f2(cx - w * 0.1)},${f2(base - hgt * 0.95)} L${f2(cx + w * 0.08)},${f2(base - hgt * 0.95)} L${f2(cx + w * 0.27)},${f2(base - hgt * 0.62)} L${f2(cx + w * 0.28)},${base}" stroke="${SIL}" stroke-width="${f2(w * 0.014)}" fill="none"/>`;
  s += `<path d="M${f2(cx - w * 0.12)},${f2(base - hgt * 0.95)} L${f2(cx - w * 0.02)},${f2(base - hgt * 0.5)} M${f2(cx + w * 0.06)},${f2(base - hgt * 0.95)} L${f2(cx + w * 0.15)},${f2(base - hgt * 0.45)}" stroke="${SIL}" stroke-width="${f2(w * 0.01)}"/>`;
  s += flames(t + 1.3, { x0: x0 + w * 0.08, x1: x1 - w * 0.08, y: base + 4, h: hgt * 0.6, n: 14, seed: 33, cols: ['#FF7A2E', '#FFB15E', '#FFE3A3'] });
  return s;
}

// ------------------------------------------------------------------ K30 · 「杀人可恕，情理难容！」 CU, 怒, fire light
function K30() {
  const id = 'k30';
  const hgt = 3000, fx = 1010, feetY = 430 + 3000 * 0.92; // chin-ish placement tuned by eye: face centre ≈ (1010, 430)
  const face = lin({ view: 'front', costume: 'C', hat: false, tattoo: 1, expr: { ...EX.怒, open: 0.35, brow: -1, eye: 1.18, jaw: 0.6 }, height: hgt, x: fx, y: feetY });
  let s = `<defs>${rg(id + 'bg', [[0, '#5A2214'], [0.55, '#2A100C'], [1, '#0E0807']], 0.78, 0.45, 0.8)}` +
    lg(id + 'fire', [[0, '#FF8A3D', 0], [0.55, '#FF8A3D', 0.0], [1, '#FF9A4A', 0.55]], 0, 0, 1, 0) +
    lg(id + 'shade', [[0, '#120806', 0.78], [0.45, '#120806', 0.35], [0.7, '#120806', 0]], 0, 0, 1, 0) + `</defs>`;
  s += `<rect width="1920" height="1080" fill="url(#${id}bg)"/>`;
  s += embers(0.7, { seed: 9, n: 60, area: [1100, 0, 1920, 1080], speed: 120, life: 3 });
  s += `<g>${face}</g>`;
  // fire light from screen-right: warm wash on the near side, deep shade on the far side
  s += `<rect width="1920" height="1080" fill="url(#${id}fire)" style="mix-blend-mode:screen"/>`;
  s += `<rect width="1920" height="1080" fill="url(#${id}shade)"/>`;
  // the blade edge rising into frame at the right edge, catching the fire
  s += `<path d="M1700,1080 L1820,620 L1836,618 L1748,1080Z" fill="#C9CDD2"/><path d="M1820,620 L1836,618 L1760,1080 L1748,1080Z" fill="#FFE3A3" opacity="0.85"/>`;
  s += `<path d="M1708,1080 L1822,628" stroke="#FFF2D6" stroke-width="3" opacity="0.9"/>`;
  // snow drifting in front, large and soft
  s += `<g filter="url(#${blurId(5)})">${flakes(31, 26, [0, 0, 1920, 1080], '#FFD9B8', [5, 11], 0.75)}</g>`;
  s += flakes(32, 40, [0, 0, 1920, 1080], '#FFE6CF', [1.6, 3.2], 0.8);
  return s;
}

// ------------------------------------------------------------------ K31 · 「这一回，他没有再忍。」 ink on snow
function K31() {
  const id = 'k31';
  const R = rng(5);
  let s = `<defs>${lg(id + 'snow', [[0, '#F4F6F8'], [1, '#D9E1E8']])}` +
    `<filter id="${id}edge" x="-10%" y="-30%" width="120%" height="160%"><feTurbulence type="fractalNoise" baseFrequency="0.012 0.04" numOctaves="3" seed="11" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="26" xChannelSelector="R" yChannelSelector="G"/></filter>` +
    `<filter id="${id}dry" x="-10%" y="-30%" width="120%" height="160%"><feTurbulence type="fractalNoise" baseFrequency="0.006 0.35" numOctaves="2" seed="4" result="g"/><feColorMatrix in="g" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -3 1.9" result="m"/><feComposite in="SourceGraphic" in2="m" operator="in" result="c"/><feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="2" seed="9" result="d"/><feDisplacementMap in="c" in2="d" scale="10"/></filter></defs>`;
  s += `<rect width="1920" height="1080" fill="url(#${id}snow)"/>`;
  s += `<path d="M-50,760 Q480,700 980,748 T1980,720 L1980,1100 L-50,1100Z" fill="#C9D3DD" opacity="0.55"/><path d="M-50,880 Q620,830 1220,872 T1980,860 L1980,1100 L-50,1100Z" fill="#BAC6D2" opacity="0.5"/>`;
  // the body of the slash: solid wet ink, heavy at the start, tapering
  const body = `<path d="M300,300 C560,330 900,430 1180,520 C1300,560 1420,600 1520,640 L1530,654 C1400,628 1260,600 1130,574 C860,514 560,430 286,356Z" fill="${INK}"/>`;
  s += `<g filter="url(#${id}edge)">${body}</g>`;
  // the dry tail: bristle trails breaking up
  let tail = '';
  for (let i = 0; i < 14; i++) {
    const off = (i - 7) * 7, len = 0.7 + R() * 0.3;
    tail += `<path d="M${f2(1050 + R() * 120)},${f2(540 + off)} Q${f2(1400)},${f2(630 + off * 1.1)} ${f2(1100 + 640 * len)},${f2(660 + off * 1.5 + 50 * len)}" stroke="${INK}" stroke-width="${f2(4 + R() * 7)}" fill="none" stroke-linecap="round"/>`;
  }
  s += `<g filter="url(#${id}dry)">${tail}</g>`;
  // spatter thrown off at the start of the stroke
  for (let i = 0; i < 30; i++) { const a = -0.6 + R() * 2.6, r = 40 + R() * 200; s += `<circle cx="${f2(320 + Math.cos(a) * r * 1.3)}" cy="${f2(320 + Math.sin(a) * r * 0.6)}" r="${f2(2 + R() * 10)}" fill="${INK}" opacity="${f2(0.7 + R() * 0.3)}"/>`; }
  s += flakes(77, 34, [0, 0, 1920, 1080], '#FFFFFF', [2, 5], 0.95);
  s += `<g filter="url(#${blurId(3)})">${flakes(78, 10, [0, 0, 1920, 1080], '#FFFFFF', [7, 12], 0.9)}</g>`;
  return s;
}

// ------------------------------------------------------------------ K27 · 「一枪戳倒差拨」 thrust, silhouette against the fire
function K27() {
  const id = 'k27';
  let s = `<defs>${fireSkyDefs(id + 'sky')}${lg(id + 'gnd', [[0, '#C8693A'], [0.35, '#7A3A22'], [1, '#1E0E0A']])}${rg(id + 'glow', [[0, '#FFB15E', 0.55], [1, '#FFB15E', 0]], 0.5, 0.5, 0.5)}${silFilters(id + 'a')}${silFilters(id + 'b', '#FFB15E', 4, -1)}</defs>`;
  s += `<rect width="1920" height="1080" fill="url(#${id}sky)"/>`;
  s += `<ellipse cx="1420" cy="640" rx="900" ry="420" fill="url(#${id}glow)"/>`;
  s += burningDepot(id, 1040, 1820, 660, 300, 0.6);
  s += embers(0.9, { seed: 4, n: 80, area: [900, 120, 1920, 660], speed: 150, life: 2.6 });
  s += `<path d="M-40,650 Q500,630 980,660 T1960,646 L1960,1100 L-40,1100Z" fill="url(#${id}gnd)"/>`;
  s += snowStreaks(12, 160, [-100, -80, 2100, 1080], '#FFD0A8', 0.42, [26, 80], 0.6);
  // 林冲: side view facing right, lunge, level thrust (rig as a rim-lit silhouette)
  const hgt = 640, fx = 560, fy = 930;
  const lc = lin({ view: 'side', costume: 'C', hat: false, flip: true, height: hgt, x: fx, y: fy, expr: EX.怒,
    pose: { shoulderR: 78, elbowR: 6, shoulderL: 60, elbowL: 20, legR: 34, legL: -30 }, props: { spear: { hand: 'R', angle: 90, grip: 0.3, gourd: false } } });
  s += `<g transform="rotate(6 ${fx} ${fy})">${silhouette(id + 'a', lc)}</g>`;
  // 差拨 thrown back off his feet at the spear tip: body tilted far back, legs up, cap flying
  const cb = figure({ x: 1250, y: 640, h: 470, torso: 62, head: null, robe: 1, armN: [-150, -175], armF: [-120, -90], legN: [-40, -70], legF: [-10, -40] });
  s += silhouette(id + 'b', `<g>${cb}</g>`);
  s += silhouette(id + 'b', figure({ x: 1250, y: 640, h: 470, torso: 62, head: 'cap', hatOff: [26, -26, 40] }).replace(/<path d="M[^"]*" fill="none"[^>]*>|<circle[^>]*>/g, ''));
  // impact: a burst of snow at the contact point, and speed lines along the thrust
  const ix = 1180, iy = 470;
  s += flakes(91, 40, [ix - 90, iy - 80, ix + 120, iy + 90], '#FFF0DE', [2, 6], 0.95);
  for (let i = 0; i < 7; i++) s += `<path d="M${f2(ix - 120 - i * 60)},${f2(iy + (i - 3) * 12)} l${f2(-160 - i * 20)},0" stroke="#FFE3A3" stroke-width="${f2(4 - i * 0.4)}" stroke-linecap="round" opacity="${f2(0.75 - i * 0.08)}"/>`;
  // dark snow bank in the foreground (keeps the subtitle band calm)
  s += `<path d="M-40,960 Q600,900 1200,950 T1960,930 L1960,1100 L-40,1100Z" fill="#160A07" opacity="0.85"/>`;
  return s;
}

// ------------------------------------------------------------------ K28 · 「再一枪，追倒了逃跑的富安」 the chase
function K28() {
  const id = 'k28';
  let s = `<defs>${fireSkyDefs(id + 'sky')}${lg(id + 'gnd', [[0, '#B85E34'], [0.4, '#5E2C1A'], [1, '#160A07']])}${rg(id + 'glow', [[0, '#FFB15E', 0.5], [1, '#FFB15E', 0]], 0.5, 0.5, 0.5)}${silFilters(id + 'a', RIM, -3, -2)}${silFilters(id + 'b', '#FFB15E', -4, -1)}</defs>`;
  s += `<rect width="1920" height="1080" fill="url(#${id}sky)"/>`;
  s += `<ellipse cx="420" cy="600" rx="820" ry="420" fill="url(#${id}glow)"/>`;
  s += burningDepot(id, 60, 760, 640, 280, 1.4);
  s += embers(1.7, { seed: 6, n: 70, area: [0, 120, 900, 640], speed: 140, life: 2.6 });
  s += `<path d="M-40,630 Q600,610 1100,640 T1960,628 L1960,1100 L-40,1100Z" fill="url(#${id}gnd)"/>`;
  s += snowStreaks(17, 170, [-100, -80, 2100, 1080], '#FFD0A8', 0.5, [30, 90], 0.55);
  // 富安 running away to the right, leaning forward, head cloth, arms pumping, looking back over his shoulder
  const fa = figure({ x: 1470, y: 700, h: 440, torso: 26, head: 'cloth', robe: 1, armN: [-70, -120], armF: [80, 30], legN: [60, -5], legF: [-50, 5] });
  s += silhouette(id + 'b', fa);
  s += flakes(55, 34, [1260, 800, 1420, 905], '#FFE6CF', [2, 5], 0.9);
  // 林冲 closing in, the spear chambered at the hip (arm drawn back, tip forward and low), running stride
  const hgt = 620, fx = 780, fy = 950;
  const lc = lin({ view: 'side', costume: 'C', hat: false, flip: true, height: hgt, x: fx, y: fy, expr: EX.怒,
    pose: { shoulderL: -34, elbowL: 82, shoulderR: 50, elbowR: 30, legL: 40, legR: -38 }, props: { spear: { hand: 'L', angle: 98, grip: 0.42, gourd: false } } });
  s += `<g transform="rotate(12 ${fx} ${fy})">${silhouette(id + 'a', lc)}</g>`;
  for (let i = 0; i < 9; i++) s += `<path d="M${f2(560 - i * 26)},${f2(520 + i * 40)} l${f2(-220 + i * 10)},0" stroke="#FFD9A8" stroke-width="${f2(3.5 - i * 0.25)}" stroke-linecap="round" opacity="${f2(0.6 - i * 0.04)}"/>`;
  s += flakes(56, 30, [560, 890, 780, 965], '#FFE6CF', [2, 5], 0.9);
  s += `<path d="M-40,970 Q700,920 1300,960 T1960,950 L1960,1100 L-40,1100Z" fill="#140906" opacity="0.85"/>`;
  return s;
}

// ------------------------------------------------------------------ K29 · 陆谦 thrown in the snow, the blade at his face
function K29() {
  const id = 'k29';
  let s = `<defs>${fireSkyDefs(id + 'sky')}${lg(id + 'gnd', [[0, '#D47A46'], [0.5, '#6E3420'], [1, '#180B08']])}${rg(id + 'glow', [[0, '#FFC27A', 0.6], [1, '#FFC27A', 0]], 0.5, 0.5, 0.5)}${silFilters(id + 'a', RIM, -3, -2)}${silFilters(id + 'b', '#FFB15E', -2, -3)}</defs>`;
  s += `<rect width="1920" height="1080" fill="url(#${id}sky)"/>`;
  s += `<ellipse cx="1500" cy="560" rx="760" ry="420" fill="url(#${id}glow)"/>`;
  s += burningDepot(id, 1240, 1900, 600, 260, 2.1);
  s += embers(2.2, { seed: 8, n: 60, area: [1100, 100, 1920, 600], speed: 140, life: 2.6 });
  s += `<path d="M-40,590 Q700,570 1200,600 T1960,588 L1960,1100 L-40,1100Z" fill="url(#${id}gnd)"/>`;
  s += flakes(61, 120, [0, 0, 1920, 1000], '#FFD9B8', [1.6, 4.2], 0.8);
  // 林冲 facing left: near leg forward and down onto 陆谦's chest, near hand with the knife lowered to his face
  const hgt = 660, fx = 1240, fy = 860;
  const lc = lin({ view: 'side', costume: 'C', hat: false, flip: false, height: hgt, x: fx, y: fy, expr: EX.怒,
    pose: { shoulderL: 44, elbowL: 18, fistL: true, shoulderR: 10, elbowR: 14, legL: 40, legR: -6, headTilt: 10 } });
  const foot = rigPt(lc, 'legNear', FOOT), fist = rigPt(lc, 'handL', FIST), wrist = rigPt(lc, 'handL', WRIST);
  // 陆谦 on his back, chest under the boot, head toward the knife, hands up pleading
  const lqx = foot[0] + 10, lqy = foot[1] + 22;
  const lq = figure({ x: lqx + 150, y: lqy + 18, h: 400, torso: -84, head: 'futou', robe: 0.6, armN: [-150, -175], armF: [-130, -160], legN: [118, 20], legF: [100, 30] });
  s += `<path d="M${f2(lqx - 260)},${f2(lqy + 46)} Q${f2(lqx - 120)},${f2(lqy + 12)} ${f2(lqx)},${f2(lqy + 30)} Q${f2(lqx + 180)},${f2(lqy + 4)} ${f2(lqx + 330)},${f2(lqy + 44)}Z" fill="#E9D2C0" opacity="0.5"/>`;
  s += silhouette(id + 'b', lq);
  s += silhouette(id + 'a', lc);
  // the knife in his fist, blade pointing down toward 陆谦's face, catching the fire
  const ax = fist[0] - wrist[0], ay = fist[1] - wrist[1], L = Math.hypot(ax, ay) || 1, ux = ax / L, uy = ay / L;
  const b0 = [fist[0] + ux * 10, fist[1] + uy * 10], b1 = [fist[0] + ux * 78, fist[1] + uy * 78];
  s += `<path d="M${f2(b0[0] - uy * 7)},${f2(b0[1] + ux * 7)} L${f2(b1[0])},${f2(b1[1])} L${f2(b0[0] + uy * 7)},${f2(b0[1] - ux * 7)}Z" fill="#E8ECEF"/>`;
  s += `<path d="M${f2(b0[0])},${f2(b0[1])} L${f2(b1[0])},${f2(b1[1])} L${f2(b0[0] + uy * 7)},${f2(b0[1] - ux * 7)}Z" fill="#FFE3A3"/>`;
  s += `<path d="M-40,960 Q700,920 1300,955 T1960,945 L1960,1100 L-40,1100Z" fill="#140906" opacity="0.85"/>`;
  return s;
}

// ------------------------------------------------------------------ K26 · 「他一把拽开庙门。」 inside, low angle at the door
function K26() {
  const id = 'k26';
  let s = `<defs>${lg(id + 'wall', [[0, '#2E2622'], [1, '#1C1714']], 0, 0, 1, 0)}${fireSkyDefs(id + 'sky')}${lg(id + 'gnd', [[0, '#C8693A'], [1, '#3A1A10']])}` +
    `${lg(id + 'spill', [[0, '#FFB15E', 0.5], [1, '#FFB15E', 0]], 1, 0, 0, 0.5)}${silFilters(id + 'a', '#FFB15E', 4, 0)}${silFilters(id + 'm', '#FF8A3D', 2, -1)}</defs>`;
  s += `<rect width="1920" height="1080" fill="url(#${id}wall)"/>`;
  s += `<rect x="0" y="0" width="1920" height="40" fill="#140F0C"/>`;
  // altar at the left with the 毡笠 resting on it
  s += `<rect x="40" y="640" width="440" height="440" fill="#241C18"/><rect x="20" y="620" width="480" height="28" fill="#33281F"/>`;
  s += `<ellipse cx="260" cy="616" rx="112" ry="15" fill="#B3A998"/><path d="M196,616 Q260,572 324,616Z" fill="#D9D1C3"/><path d="M148,616 Q260,632 372,616" stroke="#857A69" stroke-width="4" fill="none"/>`;
  s += `<path d="M260,592 C290,630 300,670 280,720" stroke="#B8322A" stroke-width="4" fill="none"/>`;
  // 林冲 first (to know where his left hand is), bare-headed, facing right toward the door
  const hgt = 940, fx = 760, fy = 1130;
  const lc = lin({ view: 'side', costume: 'C', hat: false, flip: true, height: hgt, x: fx, y: fy, expr: EX.怒,
    pose: { shoulderL: 62, elbowL: 8, fistL: true, shoulderR: 52, elbowR: 28, legL: 16, legR: -14 }, props: { spear: { hand: 'R', angle: 90, grip: 0.3, gourd: false } } });
  const hand = rigPt(lc, 'handL', FIST);
  // the doorway: left jamb at dx0; the near leaf hinged on the right jamb swings in toward camera, its free edge in his fist
  const dx0 = 1040, dx1 = 1800, dy0 = 70, dy1 = 1000, ex = hand[0] + 18;
  s += `<rect x="${dx0}" y="${dy0}" width="${dx1 - dx0}" height="${dy1 - dy0}" fill="url(#${id}sky)"/>`;
  s += `<defs><clipPath id="${id}open"><rect x="${dx0}" y="${dy0}" width="${f2(Math.max(60, ex - dx0))}" height="${dy1 - dy0}"/></clipPath></defs><g clip-path="url(#${id}open)">`;
  s += burningDepot(id, dx0 - 40, ex + 40, 760, 330, 3.1);
  s += `<rect x="${dx0}" y="760" width="${f2(ex - dx0)}" height="240" fill="url(#${id}gnd)"/>`;
  const mx = dx0 + (ex - dx0) * 0.5;
  s += silhouette(id + 'm', figure({ x: mx - 110, y: 805, h: 200, torso: -10, head: 'cap', robe: 1, armN: [-40, -70], armF: [20, 10], legN: [8, 0], legF: [-8, 0] }) +
    figure({ x: mx, y: 800, h: 215, torso: -16, head: 'futou', robe: 1, armN: [-80, -130], armF: [40, 20], legN: [10, 0], legF: [-10, 0] }) +
    figure({ x: mx + 110, y: 806, h: 200, torso: 12, head: 'cloth', robe: 1, armN: [40, 10], armF: [-20, -40], legN: [14, 0], legF: [-6, 0] }));
  s += snowStreaks(23, 110, [dx0 - 200, dy0, ex + 60, dy1], '#FFE3C2', 0.9, [40, 120], 0.75);
  s += `</g>`;
  // the leaf: from its hinge on the right jamb, swung in, free edge at ex (taller toward camera)
  s += `<path d="M${dx1},${dy0} L${f2(ex)},${dy0 - 70} L${f2(ex)},${dy1 + 70} L${dx1},${dy1}Z" fill="#3A2E26" stroke="#211913" stroke-width="4"/>`;
  for (let i = 1; i < 4; i++) { const x = lerp(dx1, ex, i / 4); s += `<path d="M${f2(x)},${f2(dy0 - 70 * i / 4)} L${f2(x)},${f2(dy1 + 70 * i / 4)}" stroke="#211913" stroke-width="4"/>`; }
  s += `<path d="M${dx1},${dy0 + 170} L${f2(ex)},${dy0 + 130} M${dx1},${dy1 - 170} L${f2(ex)},${dy1 - 140}" stroke="#4A3B31" stroke-width="18"/>`;
  s += `<path d="M${f2(ex)},${dy0 - 70} L${f2(ex)},${dy1 + 70}" stroke="#FFB15E" stroke-width="5" opacity="0.6"/>`;
  s += `<rect x="${dx0 - 26}" y="${dy0 - 40}" width="26" height="${dy1 - dy0 + 60}" fill="#2A221D"/>`;
  // fire light spilling in across the floor
  s += `<path d="M${dx0},${dy1} L${f2(ex)},${dy1} L${f2(ex - 160)},1090 L${dx0 - 620},1090Z" fill="url(#${id}spill)"/>`;
  // the stone, shoved aside, by the jamb
  s += `<path d="M560,1010 Q540,910 600,872 Q680,840 780,862 Q850,892 850,1010Z" fill="#4E4943" stroke="${LINE}" stroke-width="3"/><path d="M580,912 Q620,872 700,862 Q780,862 820,890" stroke="#8A837A" stroke-width="5" fill="none" opacity="0.5"/>`;
  s += silhouette(id + 'a', lc);
  return s;
}

// ------------------------------------------------------------------ K16 · 「临走前，他请人写了这封休书。」 the scribe writes
function K16() {
  const id = 'k16';
  let s = `<defs>${lg(id + 'wall', [[0, '#5A4030'], [1, '#2A1E17']], 0, 0, 1, 0)}${lg(id + 'shaft', [[0, '#FFF4DC', 0.5], [1, '#FFF4DC', 0]], 0, 0, 0.7, 1)}` +
    `${lg(id + 'table', [[0, '#6B4A30'], [1, '#3E2A1C']])}${rg(id + 'pool', [[0, '#FFF0D0', 0.55], [1, '#FFF0D0', 0]], 0.5, 0.5, 0.5)}</defs>`;
  s += `<rect width="1920" height="1080" fill="url(#${id}wall)"/>`;
  // lattice window behind, left of centre (out of the watermark corner), summer daylight
  const wx = 500, wy = 110, ww = 380, wh = 300;
  s += `<rect x="${wx}" y="${wy}" width="${ww}" height="${wh}" fill="#F6E8C8"/>`;
  for (let i = 1; i < 6; i++) s += `<rect x="${wx + (i * ww) / 6 - 4}" y="${wy}" width="8" height="${wh}" fill="#5A3E2B"/>`;
  for (let j = 1; j < 5; j++) s += `<rect x="${wx}" y="${wy + (j * wh) / 5 - 4}" width="${ww}" height="8" fill="#5A3E2B"/>`;
  s += `<rect x="${wx - 14}" y="${wy - 14}" width="${ww + 28}" height="${wh + 28}" fill="none" stroke="#3A281C" stroke-width="16"/>`;
  // 张教头 at the left, soft, watching 林冲
  s += `<g filter="url(#${blurId(3)})">${zhang({ x: 430, y: 560, H: 220, e: { brow: 0.8, eye: 0.6, smile: 0, look: [0.8, 0.1] } }).replace('data-face', 'data-x')}</g>`;
  // 林冲 across the table, convict robe, cangue, tattoo: dictating, eyes down on the letter
  const lc = lin({ view: 'front', costume: 'A', col: { robe: '#3B4356', sash: '#2A2E3A' }, headCloth: 'plain', cangue: true, tattoo: 1,
    expr: { ...EX.隐忍, open: 0.16, look: [0.1, 0.85], eye: 0.62 }, height: 1500, x: 1000, y: 120 + 1500 });
  s += `<path d="M${wx},${wy + wh} L${wx + ww},${wy + wh} L1500,760 L640,760Z" fill="url(#${id}shaft)"/>`;
  s += lc;
  // table, the letter in the light pool, the inkstone
  s += `<path d="M-40,690 L1960,668 L1960,1100 L-40,1100Z" fill="url(#${id}table)"/><path d="M-40,690 L1960,668" stroke="#2A1C17" stroke-width="5"/>`;
  s += `<ellipse cx="900" cy="830" rx="440" ry="140" fill="url(#${id}pool)"/>`;
  const px = 690, py = 740;
  s += `<g transform="translate(${px} ${py}) rotate(-4) scale(1 0.5)">${xiushu({ w: 440, h: 460, id: id + 'xs', ink: 1, sign: 0, print: 0 })}</g>`;
  s += `<rect x="${px + 8}" y="${py + 6}" width="150" height="214" fill="#EADBB9" opacity="0.94" transform="rotate(-4 ${px} ${py}) scale(1 0.5) translate(0 ${py})"/>`;
  s += `<rect x="1180" y="770" width="150" height="74" rx="14" fill="#2E2C2A" stroke="${LINE}" stroke-width="3"/><rect x="1198" y="782" width="114" height="40" rx="10" fill="#141210"/>`;
  // the hired scribe in the right foreground, over his shoulder: head cloth, grey-blue robe, his writing arm across the table
  let fg = `<path d="M1460,1100 C1440,900 1500,780 1640,740 C1760,710 1900,720 1990,760 L1990,1100Z" fill="#5C6670"/>`;
  fg += `<path d="M1620,740 C1600,640 1640,560 1720,544 C1800,534 1850,600 1846,690 C1842,740 1800,770 1740,772Z" fill="#E2AC85"/>`;
  fg += `<path d="M1606,676 C1590,560 1650,492 1730,488 C1820,486 1872,560 1862,664 C1830,600 1780,566 1720,568 C1670,570 1630,610 1606,676Z" fill="#1E1A18"/>`;
  s += `<g filter="url(#${blurId(6)})">${fg}</g>`;
  // his arm and sleeve reaching to the letter, brush pinched at the end of a column
  s += `<path d="M1520,830 C1380,840 1200,860 1040,880 L1030,930 C1200,914 1390,900 1540,900Z" fill="#5C6670" stroke="${LINE}" stroke-width="3"/>`;
  s += `<path d="M1046,876 C1020,872 1000,884 1000,902 C1000,918 1018,930 1040,928Z" fill="#E2AC85" stroke="${LINE}" stroke-width="2.6"/>`;
  s += `<path d="M1010,892 L972,840" stroke="#6B4A2E" stroke-width="7" stroke-linecap="round"/><path d="M1006,887 l-8,22 l10,-6Z" fill="${INK}"/>`;
  return s;
}

// ------------------------------------------------------------------ K36 · 「那封休书，没能护住她。」 the old letter in lantern light
function K36() {
  const id = 'k36';
  let s = `<defs>${rg(id + 'bg', [[0, '#3A2A22'], [0.6, '#1A1820'], [1, '#0E0E14']], 0.72, 0.3, 0.9)}${rg(id + 'lan', [[0, '#FFD08A', 0.95], [0.4, '#E8A04A', 0.45], [1, '#E8A04A', 0]], 0.5, 0.5, 0.5)}` +
    `${lg(id + 'warm', [[0, '#E8A04A', 0], [1, '#E8A04A', 0.35]], 0, 0, 1, 0.3)}</defs>`;
  s += `<rect width="1920" height="1080" fill="url(#${id}bg)"/>`;
  // a cold night window at the left (梁山), lattice in blue
  const wx = 180, wy = 160, ww = 300, wh = 380;
  s += `<rect x="${wx}" y="${wy}" width="${ww}" height="${wh}" fill="#2A3448"/>`;
  for (let i = 1; i < 4; i++) s += `<rect x="${wx + (i * ww) / 4 - 3}" y="${wy}" width="6" height="${wh}" fill="#141820"/>`;
  for (let j = 1; j < 5; j++) s += `<rect x="${wx}" y="${wy + (j * wh) / 5 - 3}" width="${ww}" height="6" fill="#141820"/>`;
  // lantern, upper right
  s += `<ellipse cx="1600" cy="230" rx="300" ry="300" fill="url(#${id}lan)"/>`;
  s += `<path d="M1600,110 L1600,150" stroke="#2A1C17" stroke-width="4"/><ellipse cx="1600" cy="230" rx="62" ry="80" fill="#D8432F"/><ellipse cx="1600" cy="230" rx="40" ry="66" fill="#F2A65A" opacity="0.7"/><rect x="1572" y="146" width="56" height="10" fill="#2A1C17"/><rect x="1572" y="306" width="56" height="10" fill="#2A1C17"/>`;
  // 林冲 (梁山 indigo), head bowed, soft behind the paper
  const face = lin({ view: 'front', costume: 'A', col: { robe: '#2E3446', sash: '#5A4A3A' }, headCloth: 'plain', tattoo: 1, expr: { ...EX.悲, tear: 0, look: [0, 0.9], eye: 0.55 }, height: 2300, x: 1000, y: 160 + 2300 * 0.97, pose: { headTilt: 6 } });
  s += `<g filter="url(#${blurId(4)})">${face}</g>`;
  s += `<rect width="1920" height="1080" fill="url(#${id}warm)" style="mix-blend-mode:screen"/>`;
  // the old letter held up in both hands, creased from folding, lantern-lit
  const px = 640, py = 470, pw = 620, ph = 560;
  s += `<g transform="rotate(-4 ${px + pw / 2} ${py + ph / 2})">`;
  s += `<g transform="translate(${px} ${py})">${xiushu({ w: pw, h: ph, id: id + 'xs', ink: 1, sign: 1, print: 1, printOp: 0.9, crumple: 0.4 })}</g>`;
  s += `<path d="M${px + pw / 2},${py} L${px + pw / 2 + 6},${py + ph}" stroke="#8A6A44" stroke-width="3" opacity="0.5"/><path d="M${px},${py + ph / 2} L${px + pw},${py + ph / 2 - 8}" stroke="#8A6A44" stroke-width="3" opacity="0.45"/>`;
  s += `<rect x="${px}" y="${py}" width="${pw}" height="${ph}" fill="#E8A04A" opacity="0.14"/>`;
  // thumbs in front at the lower corners, fingers behind (simple 2D shapes); indigo cuffs
  for (const [hx, flip] of [[px + 30, 1], [px + pw - 30, -1]]) {
    const hy = py + ph - 120;
    s += `<path d="M${hx - flip * 60},${hy + 200} C${hx - flip * 70},${hy + 120} ${hx - flip * 40},${hy + 80} ${hx},${hy + 70} L${hx + flip * 20},${hy + 150} C${hx},${hy + 170} ${hx - flip * 20},${hy + 190} ${hx - flip * 30},${hy + 220}Z" fill="#2E3446" stroke="${LINE}" stroke-width="3"/>`;
    s += `<path d="M${hx - flip * 4},${hy + 76} C${hx + flip * 10},${hy + 30} ${hx + flip * 34},${hy + 8} ${hx + flip * 52},${hy + 14} C${hx + flip * 62},${hy + 22} ${hx + flip * 56},${hy + 40} ${hx + flip * 40},${hy + 52} C${hx + flip * 30},${hy + 70} ${hx + flip * 22},${hy + 90} ${hx + flip * 16},${hy + 110}Z" fill="#EFB58E" stroke="${LINE}" stroke-width="3"/>`;
    s += `<path d="M${hx + flip * 20},${hy + 60} C${hx + flip * 30},${hy + 48} ${hx + flip * 40},${hy + 40} ${hx + flip * 48},${hy + 32}" stroke="#D29A76" stroke-width="3" fill="none"/>`;
  }
  s += `</g>`;
  return s;
}

export const KEYS = { K16, K26, K27, K28, K29, K30, K31, K36 };
