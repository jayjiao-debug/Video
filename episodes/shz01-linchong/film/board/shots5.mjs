// v5 shots: the readable/impact board frames made to move (owner 2026-11-08 22:42: "give me rendered film").
// Each shot is f(u, t, g) -> SVG body, u = 0..1 through its EDL segment, t = film time, g = the segment.
// Motion comes from the rig (林冲: raised arm, walk, lunge), from shadows stepping into the light (blur/scale), from
// particles and from slow camera moves; traced side characters never walk (they lean, step in, or are cut at the knees).
import { f2, lg, rg, rng, clamp, lerp, E, ramp, flames, embers, blurId, vtext, noise1 } from '../lib.mjs';
import { loadTakes, frameSVG as v2Frame } from '../film.mjs';
import { lin } from '../../chars/rig/linchong.mjs';
import { XS } from '../cast/xiushu.mjs';
import * as GAO from '../cast/v4/gao.mjs';
import * as GUARD from '../cast/v4/guard.mjs';
import * as LU from '../cast/v4/luqian.mjs';
import * as WIFE from '../cast/v4/wife.mjs';
import { sil, silG, rays, motes } from './impact.mjs';
import { official } from './readable.mjs';
import { SH, table, letter, darken } from './safe2.mjs';

const takes = await loadTakes();
export const v2 = (s, hide = []) => { globalThis.HIDE_LAYERS = new Set(hide); const r = v2Frame(takes, s, { clean: true }); globalThis.HIDE_LAYERS = null; return r; };
const io = (x) => E.inOut(clamp(x)), out = (x) => E.out(clamp(x));
// camera: zoom z about the point (cx, cy), kept inside the frame (never shows past the picture's edges)
const cam = (body, z = 1, cx = 960, cy = 540, dx = 0, dy = 0) => {
  z = Math.max(1, z) * (dx || dy ? 1.02 : 1);
  const hx = 960 / z, hy = 540 / z;
  cx = clamp(cx, hx, 1920 - hx); cy = clamp(cy, hy, 1080 - hy);
  return `<g transform="translate(${f2(960 + dx)} ${f2(540 + dy)}) scale(${f2(z * 10000) / 10000}) translate(${f2(-cx)} ${f2(-cy)})">${body}</g>`;
};
const DEG = Math.PI / 180;

// ---------------------------------------------------------------- 林冲's shadow with the animated raised arm
// k: 0 arm hanging → 1 fist up; strike: 0..1 from the fist up to swung forward-down. Optional knife in the fist.
function linArm(h, o = {}) {
  const info = {};
  const fig = lin({ view: 'side', costume: o.costume || 'A', hat: o.hat, height: h, x: 0, y: 0, flip: false, info,
    pose: { shoulderL: -4, elbowL: 12, shoulderR: 6, elbowR: 10, torso: 8 + (o.bow || 0) * 6, headTilt: -(o.bow || 0) * 16, legL: 20, kneeL: 25, legR: -15, kneeR: 5 } });
  const H = h / 7.5, S = info.shoulderNear, k = o.k ?? 1, st = o.strike || 0;
  let ua = lerp(88, -22, k), fa = lerp(84, -84, k);
  if (st) { ua = lerp(ua, 38, st); fa = lerp(fa, 28, st); }
  const E1 = [S[0] + Math.cos(ua * DEG) * 0.92 * H, S[1] + Math.sin(ua * DEG) * 0.92 * H];
  const F = [E1[0] + Math.cos(fa * DEG) * 0.955 * H, E1[1] + Math.sin(fa * DEG) * 0.955 * H];
  const n = (a, b, w) => { const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1; return [(-dy / l) * w, (dx / l) * w]; };
  const [ax, ay] = n(S, E1, 0.3 * H), [bx, by] = n(E1, F, 0.17 * H);
  let s = fig + `<path d="M${f2(S[0] + ax)},${f2(S[1] + ay)} L${f2(E1[0] + ax * 0.9)},${f2(E1[1] + ay * 0.9)} L${f2(F[0] + bx)},${f2(F[1] + by)} L${f2(F[0] - bx)},${f2(F[1] - by)} L${f2(E1[0] - ax * 0.9)},${f2(E1[1] - ay * 0.9)} L${f2(S[0] - ax)},${f2(S[1] - ay)}Z" fill="#000"/><circle cx="${f2(F[0])}" cy="${f2(F[1])}" r="${f2(0.25 * H)}" fill="#000"/>`;
  if (o.knife) {
    const d = [Math.cos(fa * DEG), Math.sin(fa * DEG)], p = [-d[1], d[0]], b0 = [F[0] + d[0] * 0.2 * H, F[1] + d[1] * 0.2 * H];
    const P = (u, v) => `${f2(b0[0] + d[0] * u * H + p[0] * v * H)},${f2(b0[1] + d[1] * u * H + p[1] * v * H)}`;
    s += `<path d="M${P(0, -0.07)} L${P(0, 0.07)} L${P(1.0, 0.03)} L${P(1.18, -0.01)}Z" fill="#000"/><path d="M${P(-0.02, -0.17)} L${P(-0.02, 0.17)} L${P(0.04, 0.17)} L${P(0.04, -0.17)}Z" fill="#000"/>`;
  }
  return s;
}

// ---------------------------------------------------------------- the temple wall in the low sun (W07–W10)
function sunWall(id, shadows, o = {}) {
  const cold = o.cold || 0;
  let s = `<defs>${lg(id + 'w', [[0, '#E2774E'], [0.55, '#B8432C'], [1, '#5E1C14']], 0, 0, 1, 0.3)}${lg(id + 'c', [[0, '#9E5444'], [0.55, '#73302A'], [1, '#2E1210']], 0, 0, 1, 0.3)}${rg(id + 'sun', [[0, '#FFF0C8', 0.85], [0.35, '#FFC27A', 0.35], [1, '#FFC27A', 0]], 0.08, 0.35, 0.7)}${sil(id + 's', '#2A0D09')}<filter id="${id}b"><feGaussianBlur stdDeviation="2.5"/></filter></defs>`;
  s += `<rect width="1920" height="1080" fill="url(#${id}w)"/>` + (cold ? `<rect width="1920" height="1080" fill="url(#${id}c)" opacity="${f2(cold)}"/>` : '');
  for (let i = 0; i < 9; i++) s += `<rect x="${i * 230 + 60}" y="0" width="7" height="1080" fill="#6E2418" opacity="0.35"/>`;
  s += `<rect width="1920" height="1080" fill="url(#${id}sun)" style="mix-blend-mode:screen" opacity="${f2(1 - 0.5 * cold)}"/>` + rays(-80, 380, 16, 2400, '#FFE2A8', 0.22 - 0.1 * cold, 0.75, 7);
  const sh = (inner, x, rot = 0, op = 0.84, extra = '') => silG(id + 's', `translate(${f2(x)} 1000) skewX(-16) rotate(${f2(rot)})${extra}`, inner, op, `filter="url(#${id}b)"`);
  s += shadows(sh);
  s += `<path d="M0,1000 L1920,960 L1920,1080 L0,1080Z" fill="#3E1E14" opacity="0.85"/>`;
  s += `<rect x="-40" y="-20" width="190" height="1120" fill="#1A0A06"/><rect x="150" y="-20" width="10" height="1120" fill="#5A2416" opacity="0.6"/>`;
  return s + motes(80, [150, 100, 1300, 900], 4);
}
const GAOs = (h, flip) => GAO.draw({ view: 'side', height: h, x: 0, y: 0, flip });

// W07 a man leans in on his wife
export const W07 = (u) => cam(sunWall('a07', (sh) => sh(WIFE.draw({ view: 'back34', height: 640, x: 0, y: 0 }), 980 + 30 * io(u), -5 * io(u)) + sh(GAOs(760, true), 700 + 50 * io(u), 12 * io(u))), lerp(1.0, 1.05, u));
// W08 the fist goes up; the young lord cowers
export function W08(u, t, g) {
  const T = (t - g[0]), k = out((T - 0.15) / 0.55), c = out((T - 0.45) / 0.5);
  const hit = T > 0.62 && T < 0.8 ? Math.sin((T - 0.62) / 0.18 * Math.PI) * 6 : 0;
  return cam(sunWall('a08', (sh) => sh(linArm(910, { k }), 1180) + sh(GAOs(540, true), 760 - 20 * c, -28 * c, 0.8)), lerp(1.0, 1.06, u), 960, 540, hit, -hit * 0.5);
}
// W09 the giant official rises behind him; the light goes cold
export function W09(u, t, g) {
  const T = t - g[0], r = out((T - 0.5) / 1.6);
  return cam(sunWall('a09', (sh) => sh(`<g transform="translate(0 ${f2(820 * (1 - r))})">${official(880)}</g>`, 500, 0, 0.62 * clamp(r * 3)) + sh(GAOs(500, true), 880, -16, 0.92) + sh(linArm(640), 1330, 0, 0.8), { cold: 0.25 + 0.75 * r }), lerp(1.04, 1.0, u));
}
// W10 the fist comes down, his head bows, the young lord saunters off
export function W10(u, t, g) {
  const T = t - g[0], k = 1 - io(T / 1.1), b = io((T - 0.7) / 1.0), w = io((T - 0.3) / 2.0);
  return cam(sunWall('a10', (sh) => sh(GAOs(600, false), 520 - 260 * w, 0, 0.6 * (1 - 0.6 * w)) + sh(linArm(840, { k, bow: b }), 1220), { cold: 0.35 }), lerp(1.0, 1.04, u));
}

// ---------------------------------------------------------------- W11 陆谦 steps into the light on their side
export function W11(u, t, g) {
  const T = t - g[0], e = io((T - 0.3) / 1.6);
  let s = `<defs>${lg('a11sc', [[0, '#F6E2B4'], [1, '#D9B47A']])}${sil('a11s', '#2A1A10')}<filter id="a11b"><feGaussianBlur stdDeviation="3"/></filter><filter id="a11l" x="-40%" y="-20%" width="180%" height="140%"><feGaussianBlur stdDeviation="${f2(3 + 16 * (1 - e))}"/></filter></defs>`;
  s += `<rect width="1920" height="1080" fill="url(#a11sc)"/>`;
  for (let i = 1; i < 6; i++) s += `<rect x="${i * 320 - 6}" y="0" width="12" height="1080" fill="#5A3E2B"/>`;
  for (let j = 1; j < 3; j++) s += `<rect x="0" y="${j * 330 - 6}" width="1920" height="12" fill="#5A3E2B"/>`;
  const sh = (inner, x, op = 0.66, f = 'a11b', sc = 1) => silG('a11s', `translate(${f2(x)} 1000) scale(${f2(sc)})`, inner, op, `filter="url(#${f})"`);
  s += sh(official(820), 1620, 0.74) + sh(GAOs(580, false), 1360);
  s += sh(LU.draw({ view: 'side', height: 620, x: 0, y: 0, flip: true }), 1140 - 60 * (1 - e), 0.2 + 0.46 * e, 'a11l', 1.25 - 0.25 * e);
  s += silG('a11s', 'translate(260 1000)', lin({ view: 'side', costume: 'A', height: 640, x: 0, y: 0, flip: true, pose: { torso: 6, headTilt: -14 * io((T - 1.6) / 1.2) } }), 0.6, 'filter="url(#a11b)"');
  s += `<path d="M0,1000 L1920,990 L1920,1080 L0,1080Z" fill="#2A1A10"/>`;
  return cam(s, lerp(1.0, 1.05, u), 1000);
}

// ---------------------------------------------------------------- W12 白虎节堂: the guards close in, the official points
export function W12(u, t, g) {
  const src = u < 0.78 ? 59.3 + 0.15 * (u / 0.78) : 59.45 + ((u - 0.78) / 0.22) * 0.42;
  let s = v2(src);
  const e = io(u * 1.1);
  s += `<defs>${sil('a12s', '#07090C', '#6E8096', 4, -3)}</defs>`;
  const gd = (x, y, h, flip, rot) => silG('a12s', `translate(${f2(x)} ${y}) rotate(${rot})`, GUARD.draw({ view: 'side', height: h, x: 0, y: 0, flip }));
  s += `<g filter="url(#${blurId(1.5)})">${gd(330 + 60 * e, 760, 330, false, 6)}${gd(700 - 60 * e, 790, 330, true, -6)}${gd(220 + 80 * e, 900, 380, false, 4)}</g>`;
  s += `<g filter="url(#${blurId(5)})">${gd(-120 + 240 * e, 1220, 900, false, 8)}${gd(2060 - 240 * e, 1220, 900, true, -8)}</g>`;
  return cam(s, lerp(1.0, 1.06, u), 960, 500);
}

// ---------------------------------------------------------------- W15 led away in the cangue (legs behind a near ridge)
export function W15(u, t) {
  const px = -120 * u;            // the camera tracks them: the far world slides left
  let s = `<defs>${lg('a15s', [[0, '#C7683A'], [0.55, '#F2B36A'], [1, '#F8DDA6']])}${rg('a15sun', [[0, '#FFF6DA'], [0.2, '#FFE2A0', 0.9], [1, '#FFC27A', 0]], 0.5, 0.5, 0.5)}${sil('a15f', '#2A140C', '#FFD08A', 4, -3)}</defs>`;
  s += `<rect width="1920" height="1080" fill="url(#a15s)"/><circle cx="${f2(1040 + px * 0.2)}" cy="640" r="430" fill="url(#a15sun)"/>`;
  s += `<path d="M0,700 C500,684 1300,690 1920,676 L1920,1080 L0,1080Z" fill="#7A4424"/>`;
  for (let i = -1; i < 9; i++) s += `<path d="M${f2(80 + i * 250 + px * 0.6)},${700 - ((i + 3) % 3) * 6} l26,-170 l26,170Z" fill="#5A321C" opacity="0.8"/>`;
  const bob = (ph) => Math.abs(Math.sin(t * 2 * Math.PI * 0.9 + ph)) * -7;
  const walk = Math.sin(t * 2 * Math.PI * 0.9);
  s += silG('a15f', `translate(820 ${f2(900 + bob(0))})`, GUARD.draw({ view: 'side', height: 420, x: 0, y: 0, flip: true }));
  s += silG('a15f', `translate(1050 ${f2(905 + bob(1.2))})`, lin({ view: 'side', costume: 'A', height: 430, x: 0, y: 0, flip: true, cangue: true, col: { robe: '#3B4356' }, headCloth: 'plain', pose: { legR: 18 * walk, legL: -18 * walk, kneeR: 10, kneeL: 8 } }));
  s += silG('a15f', `translate(1290 ${f2(910 + bob(2.1))})`, GUARD.draw({ view: 'side', height: 425, x: 0, y: 0, flip: true }));
  // the near ridge with grass, dark, sliding faster (parallax), hiding everything below the knees
  const R = rng(31); let grass = '';
  for (let i = 0; i < 90; i++) { const x = ((i * 26 + px * 2.2) % 2400 + 2400) % 2400 - 200, hgt = 30 + R() * 60, sw = noise1(t * 1.3 + i, 4) * 10; grass += `<path d="M${f2(x)},800 q${f2(sw)},${f2(-hgt * 0.6)} ${f2(sw * 2 + 6)},${f2(-hgt)}" stroke="#1E0E08" stroke-width="${f2(4 + R() * 4)}" fill="none" stroke-linecap="round"/>`; }
  s += `<path d="M-50,812 C500,796 1300,806 1980,792 L1980,1100 L-50,1100Z" fill="#1E0E08"/>` + grass;
  return cam(s, lerp(1.0, 1.05, u), 1050, 640);
}

// ---------------------------------------------------------------- W16 her window; the same man's shadow comes to the wall
export function W16(u, t, g) {
  const src = 32.0 + 0.8 * u, e = io((t - g[0] - 0.4) / 1.8);
  let s = v2(src);
  s += `<defs>${rg('a16l', [[0, '#F2C27A', 0.55], [1, '#F2C27A', 0]], 0.5, 0.55, 0.5)}${sil('a16s', '#140C0C')}<filter id="a16b"><feGaussianBlur stdDeviation="${f2(2 + 8 * (1 - e))}"/></filter></defs>`;
  s += `<ellipse cx="1560" cy="640" rx="420" ry="520" fill="url(#a16l)" style="mix-blend-mode:screen"/>`;
  s += silG('a16s', `translate(1580 1060) skewX(-8) scale(${f2(1.18 - 0.18 * e)})`, GAO.draw({ view: 'side', height: 880, x: 0, y: 0, flip: false }), 0.86 * clamp(e * 1.4), 'filter="url(#a16b)"');
  return cam(s, lerp(1.0, 1.04, u), 1200, 560);
}

// ---------------------------------------------------------------- the letter: reading it, being written, tears
const anchor = (() => { const [bx, by] = XS.anchor('休', SH.w, SH.h); const lx = bx - SH.w / 2, ly = (by - SH.h / 2) * SH.sy, a = SH.rot * DEG; return [SH.x + SH.w / 2 + lx * Math.cos(a) - ly * Math.sin(a), SH.y + (SH.h * SH.sy) / 2 + lx * Math.sin(a) + ly * Math.cos(a)]; })();
function tear(x, y, land, t, r = 10) {
  const dt = t - land;
  if (dt < -0.3) return '';
  if (dt < 0) { const yy = y + dt * 1400; return `<g opacity="${f2(clamp(1 + dt / 0.3))}"><path d="M${f2(x)},${f2(yy - r * 2.4)} C${f2(x + r)},${f2(yy - r * 0.5)} ${f2(x + r)},${f2(yy + r * 0.7)} ${f2(x)},${f2(yy + r)} C${f2(x - r)},${f2(yy + r * 0.7)} ${f2(x - r)},${f2(yy - r * 0.5)} ${f2(x)},${f2(yy - r * 2.4)}Z" fill="#E2F2FA" opacity="0.92"/><circle cx="${f2(x - r * 0.3)}" cy="${f2(yy)}" r="${f2(r * 0.3)}" fill="#fff"/></g>`; }
  const k = out(dt / 0.6);   // the wet mark spreads
  return `<ellipse cx="${f2(x)}" cy="${f2(y)}" rx="${f2(r * (1.2 + 2.2 * k))}" ry="${f2(r * (0.9 + 1.7 * k))}" fill="#7C6A50" opacity="${f2(0.28 - 0.08 * k)}"/><ellipse cx="${f2(x - r * 0.4)}" cy="${f2(y - r * 0.3)}" rx="${f2(r * 0.5)}" ry="${f2(r * 0.3)}" fill="#fff" opacity="${f2(0.5 * (1 - k))}"/>`;
}
const flick = (t, a = 0.06) => `<rect width="1920" height="1080" fill="#FFB24A" opacity="${f2(a * (0.5 + 0.5 * noise1(t * 3.1, 9)))}" style="mix-blend-mode:soft-light"/>`;
// W01–W03: read across the columns right to left, then pull back to the whole letter and its print
export function LETTER(u, t) {
  const body = table() + letter({ id: 'r1' }) + flick(t);
  let z, cx, cy;
  if (t < 10.15) { const k = io(t / 10.15); z = lerp(1.55, 1.7, k); cx = lerp(1330, 1010, k); cy = lerp(430, 470, k); }
  else { const k = io((t - 10.15) / 1.6); z = lerp(1.7, 1.02, k); cx = lerp(1010, 1100, k); cy = lerp(470, 500, k); }
  return cam(body, z, cx, cy);
}
// W05 / W17: tears land on the letter
export function TEARS(n) {
  return (u, t, g) => {
    const T = t - g[0], [ax, ay] = anchor;
    const drops = [[ax + 4, ay + 30, 0.45], [ax - 150, ay + 250, 1.6], [ax + 60, ay + 470, 2.6]].slice(0, n);
    const bloom = 0.75 * out((T - 0.5) / 1.2);
    let s = table() + letter({ id: 'r5' + n, bloom }) + flick(t, 0.04);
    for (const [x, y, l] of drops) s += tear(x, y, g[0] + l, t);
    return cam(s, lerp(1.25, 1.35, u), ax - 120, ay + 200);
  };
}
// W14: the letter being written, column by column, right to left
export const WRITE = (u, t) => cam(table() + letter({ id: 'r14', writeTo: lerp(0.9, 0.18, io(u)), print: 0, sign: 0 }) + flick(t, 0.05), lerp(1.12, 1.2, u), 1100, 470);
// W34–W35: night, one lantern; a tear falls on the letter
export function LANTERN(u, t, g) {
  const [ax, ay] = anchor;
  let s = table() + letter({ id: 'r34', bloom: 0.6 * out((t - g[0] - 0.6) / 1.2) }) + darken(0.62 - 0.05 * noise1(t * 2.7, 3));
  s += `<g transform="translate(300 120) rotate(${f2(Math.sin(t * 1.3) * 1.5)} 0 -200)"><line x1="0" y1="-200" x2="0" y2="0" stroke="#1a120c" stroke-width="5"/><rect x="-70" y="0" width="140" height="190" rx="18" fill="#F2B45C"/><rect x="-70" y="0" width="140" height="190" rx="18" fill="none" stroke="#3a2416" stroke-width="5"/>` +
    `<line x1="-70" y1="63" x2="70" y2="63" stroke="#3a2416" stroke-width="3"/><line x1="-70" y1="127" x2="70" y2="127" stroke="#3a2416" stroke-width="3"/><ellipse cx="0" cy="95" rx="260" ry="260" fill="#FFB24A" opacity="0.12"/></g>`;
  s += tear(ax + 4, ay + 30, g[0] + 0.3, t, 11);
  return cam(s, lerp(1.0, 1.08, u), 1000, 470);
}
// W18 / W19: his face (her layers hidden), the promise brushed beside him in W19
export function LISTEN(brush, s0, s1) {
  return (u, t, g) => {
    let s = v2(lerp(s0, s1, u), ['t01gh', 't01her3']);
    if (brush) {
      const n = Math.floor(clamp((t - g[0] - 0.9) / 2.4) * 6.999);
      s += `<rect x="0" y="0" width="760" height="1080" fill="#120D0A" opacity="${f2(0.35 * clamp((t - g[0]) / 0.6))}"/>` + vtext('依旧夫妻完聚'.slice(0, n), 300, 150, 120, { fill: '#F2E4C4', sp: 128 });
    }
    return s;
  };
}

// ---------------------------------------------------------------- W20 into the blizzard (rig walk, feet below frame)
export function W20(u, t) {
  let s = `<defs>${lg('a20s', [[0, '#3C4A60'], [1, '#9AA8BA']])}${sil('a20f', '#121821', '#C9D6E6', -4, -3)}</defs>`;
  s += `<rect width="1920" height="1080" fill="url(#a20s)"/>`;
  const px = -60 * u;
  s += `<path d="M0,760 C400,720 900,740 1920,700 L1920,1080 L0,1080Z" fill="#C7D0DC"/><path d="M0,820 C600,790 1200,800 1920,770 L1920,1080 L0,1080Z" fill="#DCE3EC"/>`;
  s += `<g transform="translate(${f2(1500 + px)} 700)"><path d="M-120,0 L-120,-80 L0,-140 L120,-80 L120,0Z" fill="#4A5262"/><path d="M-140,-78 L0,-150 L140,-78 L0,-120Z" fill="#EEF2F7"/><rect x="-30" y="-50" width="40" height="34" fill="#F6C46A" opacity="${f2(0.8 + 0.2 * noise1(t * 4, 2))}"/></g>`;
  const w = Math.sin(t * 2 * Math.PI * 0.75), sp = { hand: 'R', angle: -32, grip: 0.42 };
  s += silG('a20f', `translate(640 ${f2(1200 - Math.abs(w) * 10)})`, lin({ view: 'side', costume: 'C', height: 1130, x: 0, y: 0, flip: true, pose: { legR: 24 * w, kneeR: 10 + 14 * Math.max(0, -w), legL: -24 * w, kneeL: 10 + 14 * Math.max(0, w), torso: 14, spear: sp }, props: { spear: sp } }));
  const R = rng(9); let st = '';
  for (let i = 0; i < 260; i++) {
    const x0 = R() * 2400, y0 = R() * 1300, l = 30 + R() * 90, wd = 1.2 + R() * 3.2, v = 700 + R() * 900;
    const x = ((x0 - t * v) % 2400 + 2400) % 2400 - 240, y = ((y0 + t * v * 0.32) % 1300 + 1300) % 1300 - 110;
    st += `<path d="M${f2(x)},${f2(y)} l${f2(-l)},${f2(l * 0.32)}" stroke="#F4F7FB" stroke-width="${f2(wd)}" stroke-linecap="round" opacity="${f2(0.35 + R() * 0.55)}"/>`;
  }
  return cam(s + st, lerp(1.0, 1.04, u), 900, 560);
}

// ---------------------------------------------------------------- W27 the thrust (rig: coil → lunge), 差拨 knocked back
const lerpPose = (a, b, k) => Object.fromEntries(Object.keys(b).map((key) => [key, lerp(a[key] ?? 0, b[key], k)]));
export function W27(u, t, g) {
  const T = t - g[0], k = E.in(clamp((T - 0.2) / 0.22)), hitT = T - 0.42, kb = out(hitT / 0.35);
  const coil = { legR: 30, kneeR: 40, legL: -22, kneeL: 12, torso: 10, shoulderR: 36, elbowR: 70, shoulderL: 40, elbowL: 50 };
  const lunge = { legR: 50, kneeR: 82, legL: -36, kneeL: 10, torso: 26, shoulderR: 72, elbowR: 8, shoulderL: 60, elbowL: 20 };
  const sp = { hand: 'R', angle: 84, grip: lerp(0.78, 0.5, k), gourd: false };
  let s = `<defs>${lg('a27s', [[0, '#1A0705'], [0.55, '#6E200E'], [1, '#E2662A']])}${sil('a27f', '#0B0605', '#FFB060', 6, -5)}${sil('a27g', '#0B0605', '#FFB060', -6, -5)}</defs>`;
  s += `<rect width="1920" height="1080" fill="url(#a27s)"/>` + flames(t, { x0: -100, x1: 2020, y: 940, h: 560, n: 22, seed: 5 });
  s += `<rect width="1920" height="1080" fill="#1a0704" opacity="0.3"/><path d="M0,960 C600,940 1300,955 1920,930 L1920,1080 L0,1080Z" fill="#2A0E08"/>`;
  s += silG('a27f', 'translate(420 1060)', lin({ view: 'side', costume: 'C', hat: false, height: 1000, x: 0, y: 0, flip: true, pose: { ...lerpPose(coil, lunge, k), spear: sp }, props: { spear: sp } }));
  s += silG('a27g', `translate(${f2(1170 + 40 * kb)} 1000) rotate(${f2(38 * kb)})`, GUARD.draw({ view: 'side', height: 740, x: 0, y: 0, flip: false }));
  if (hitT > 0 && hitT < 0.45) {
    const a = 1 - hitT / 0.45, Tp = [1400, 592], R = rng(12); let sk = '';
    for (let i = 0; i < 46; i++) { const an = -2.4 + R() * 2.9, l = (50 + R() * 240) * (0.4 + 0.6 * out(hitT / 0.15)); sk += `<path d="M${Tp[0]},${Tp[1]} l${f2(Math.cos(an) * l)},${f2(Math.sin(an) * l)}" stroke="#FFD27A" stroke-width="${f2(1.5 + R() * 3)}" stroke-linecap="round" opacity="${f2(a * (0.4 + R() * 0.6))}"/>`; }
    s += `<g style="mix-blend-mode:screen"><circle cx="${Tp[0]}" cy="${Tp[1]}" r="110" fill="#FFE2A0" opacity="${f2(0.6 * a)}" filter="url(#${blurId(24)})"/></g>` + sk;
  }
  s += embers(t, { n: 70, area: [0, 0, 1920, 1080], seed: 5, rmax: 4, speed: 220 });
  const sh = hitT > 0 && hitT < 0.2 ? Math.sin(hitT / 0.2 * Math.PI * 3) * 10 * (1 - hitT / 0.2) : 0;
  let r = cam(s, lerp(1.0, 1.05, u), 960, 600, sh, sh * 0.4);
  if (hitT > 0 && hitT < 0.1) r += `<rect width="1920" height="1080" fill="#FF9A4A" opacity="${f2(0.3 * (1 - hitT / 0.1))}" style="mix-blend-mode:screen"/>`;
  return r;
}

// ---------------------------------------------------------------- W30 the mirror of W08: on the burning wall, a knife
export function W30(u, t, g) {
  const T = t - g[0], D = g[1] - g[0], k = out((T - 0.1) / 0.5), sT = T - (D - 0.75), st = E.in(clamp(sT / 0.14));
  if (sT > 0.15) return `<rect width="1920" height="1080" fill="#000"/>`;
  let s = `<defs>${lg('a30w', [[0, '#8A2A14'], [0.6, '#5A160A'], [1, '#240804']], 0, 1, 0, 0)}${rg('a30f', [[0, '#FFB060', 0.8], [1, '#FF7A2E', 0]], 0.5, 1, 0.8)}${sil('a30s', '#120403')}<filter id="a30b"><feGaussianBlur stdDeviation="2.5"/></filter></defs>`;
  s += `<rect width="1920" height="1080" fill="url(#a30w)"/>`;
  for (let i = 0; i < 9; i++) s += `<rect x="${i * 230 + 60}" y="0" width="7" height="1080" fill="#3A0E06" opacity="0.5"/>`;
  s += `<rect width="1920" height="1080" fill="url(#a30f)" style="mix-blend-mode:screen" opacity="${f2(0.8 + 0.2 * noise1(t * 6, 5))}"/>`;
  const jit = noise1(t * 5, 8) * 6;   // the fire makes the shadow breathe
  s += silG('a30s', `translate(${f2(1180 + jit)} 1000) skewX(${f2(-16 + jit * 0.3)})`, linArm(800, { costume: 'C', hat: false, knife: true, k, strike: st }), 0.9, 'filter="url(#a30b)"');
  s += `<path d="M0,1000 L1920,980 L1920,1080 L0,1080Z" fill="#1A0805"/>` + flames(t, { x0: -100, x1: 2020, y: 1090, h: 230, n: 22, seed: 14 });
  s += embers(t, { n: 80, area: [0, 0, 1920, 1080], seed: 21, rmax: 3.5, speed: 200 });
  return cam(s, lerp(1.0, 1.07, io(u)), 1180, 420);
}
