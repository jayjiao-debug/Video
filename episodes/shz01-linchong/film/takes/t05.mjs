// T05 · 岳庙 · 38.638–53.210 (S09 crane down to the incident → S10 the spin and the raised fist → S11 the face,
// the fist goes soft → S12 the jaw, 忍 1). Builder C.
// Two sets inside one take: A = the high-angle courtyard (S09), B = the profile two-shot (S10–S12); the hand-over
// is the 鼎's incense smoke drifting across the lens (42.12–42.46), the camera never stops.
// Entry from T04: the twined tea steam dissolves into the incense smoke at the same screen x (38.22–38.638).
import { L, kf, ramp, E, zexp, camAt, toScreen, toWorld, bake, f2, clamp, lerp, rng, noise1, fbm1, lg, rg, blurId, motes } from '../lib.mjs';
import { lin, EX, NE } from '../../chars/rig/linchong.mjs';
import { gaoTQ, gaoFront, gaoBack, gaoPt } from '../cast/gao.mjs';
import { crowd } from '../cast/crowd.mjs';
import { fist } from '../cast/fist.mjs';
import { wifeFull, wifeBack } from '../cast/wife.mjs';
import { dropParts, rigPoint, tracedG } from '../cast/c_util.mjs';

const LN = '#2A1C17';
const ROBE = '#2F6B52', ROBE_S = '#22513E', ROBE_D = '#1A3F31';

// ======================================================================= SET A (S09, world = d 1.0)
const PAIR = { wife: [1740, 1188], gao: [1868, 1132] };
const DING = [1150, 1262];
const YH = -1300, CAMH = 9.72; // perspective rule in world px (a 1.70 m man at y 1160 is ~430 px)
const hAt = (y, P) => ((y - YH) * P) / CAMH;

function farRoofs() {
  let s = `<rect x="0" y="0" width="4400" height="1700" fill="#E7D3AE"/>`;
  const R = rng(5);
  for (let i = 0; i < 7; i++) {
    const cx = 300 + i * 640 + R() * 120, w = 520 + R() * 260, y = 560 + R() * 120, hgt = 120 + R() * 60;
    s += `<path d="M${cx - w / 2 - 60},${y} Q${cx - w / 2},${y - 10} ${cx - w / 2 + 40},${y - hgt * 0.55} L${cx + w / 2 - 40},${y - hgt * 0.55} Q${cx + w / 2},${y - 10} ${cx + w / 2 + 60},${y} Z" fill="#9C9A92" opacity="0.55"/>`;
    s += `<rect x="${cx - w / 2 + 20}" y="${y}" width="${w - 40}" height="${hgt * 1.2}" fill="#B9A988" opacity="0.5"/>`;
  }
  // trees
  for (let i = 0; i < 16; i++) {
    const x = R() * 4400, y = 700 + R() * 80, r = 70 + R() * 70;
    s += `<ellipse cx="${x}" cy="${y}" rx="${r * 1.3}" ry="${r}" fill="#8E9472" opacity="0.45"/>`;
  }
  s += `<rect x="0" y="760" width="4400" height="940" fill="#CDBB98"/>`;
  return s;
}

function hall() {
  // main hall facade, layer coords (offset applied by the caller): roof ridge ~ -350, eave line -50, columns 20..400,
  // platform 400..470, steps 470..540, paving below
  let s = `<rect x="0" y="0" width="4400" height="1900" fill="none"/>`;
  const ox = 1000, oy = 700; // layer (0,0) sits at bake pixel (ox, oy)
  const X = (x) => x + ox, Y = (y) => y + oy;
  // paving under everything
  s += `<rect x="0" y="${Y(470)}" width="4400" height="${1900 - Y(470)}" fill="#BDB2A0"/>`;
  for (let i = 0; i < 14; i++) s += `<rect x="0" y="${Y(500 + i * 52)}" width="4400" height="2" fill="#A89D8B" opacity="0.6"/>`;
  // walls left/right (side halls) behind
  s += `<rect x="${X(-1000)}" y="${Y(-80)}" width="1400" height="560" fill="#B5584A"/><rect x="${X(3000)}" y="${Y(-80)}" width="1400" height="560" fill="#B5584A"/>`;
  s += `<rect x="${X(-1000)}" y="${Y(-120)}" width="1400" height="60" fill="#4F5A63"/><rect x="${X(3000)}" y="${Y(-120)}" width="1400" height="60" fill="#4F5A63"/>`;
  // platform + steps
  s += `<rect x="${X(260)}" y="${Y(392)}" width="2880" height="86" fill="#C9BFAE" stroke="#8E8474" stroke-width="3"/>`;
  for (let i = 0; i < 5; i++) s += `<rect x="${X(1250 - i * 26)}" y="${Y(470 + i * 16)}" width="${900 + i * 52}" height="17" fill="${i % 2 ? '#C3B8A6' : '#CFC5B4'}" stroke="#8E8474" stroke-width="2"/>`;
  // facade: lattice doors between columns
  s += `<rect x="${X(360)}" y="${Y(10)}" width="2680" height="390" fill="#7E2E24"/>`;
  for (let i = 0; i < 9; i++) {
    const x = X(400 + i * 300);
    s += `<rect x="${x + 30}" y="${Y(40)}" width="240" height="330" fill="#9A4B33" stroke="#5C1F18" stroke-width="4"/>`;
    for (let k = 0; k < 6; k++) s += `<line x1="${x + 40 + k * 40}" y1="${Y(50)}" x2="${x + 40 + k * 40}" y2="${Y(240)}" stroke="#C69A58" stroke-width="3" opacity="0.7"/>`;
    for (let k = 0; k < 5; k++) s += `<line x1="${x + 34}" y1="${Y(60 + k * 40)}" x2="${x + 266}" y2="${Y(60 + k * 40)}" stroke="#C69A58" stroke-width="3" opacity="0.7"/>`;
  }
  for (let i = 0; i <= 9; i++) s += `<rect x="${X(380 + i * 300)}" y="${Y(0)}" width="44" height="400" fill="#A8382C" stroke="#5C1F18" stroke-width="3"/><rect x="${X(386 + i * 300)}" y="${Y(0)}" width="10" height="400" fill="#C25040" opacity="0.6"/>`;
  // bracket band + plaque (blank board, gold frame)
  s += `<rect x="${X(300)}" y="${Y(-60)}" width="2800" height="70" fill="#3E5560"/>`;
  for (let i = 0; i < 28; i++) s += `<rect x="${X(320 + i * 100)}" y="${Y(-56)}" width="60" height="30" fill="#D2A24C" opacity="0.8"/><rect x="${X(330 + i * 100)}" y="${Y(-26)}" width="40" height="30" fill="#2E434D"/>`;
  s += `<rect x="${X(1500)}" y="${Y(-190)}" width="400" height="120" fill="#1F2A30" stroke="#D2A24C" stroke-width="10"/>`;
  // roof: big upturned eave
  s += `<path d="M${X(0)},${Y(-40)} Q${X(140)},${Y(-60)} ${X(260)},${Y(-110)} L${X(560)},${Y(-330)} L${X(2840)},${Y(-330)} L${X(3140)},${Y(-110)} Q${X(3260)},${Y(-60)} ${X(3400)},${Y(-40)} Q${X(3200)},${Y(-70)} ${X(3000)},${Y(-60)} L${X(400)},${Y(-60)} Q${X(200)},${Y(-70)} ${X(0)},${Y(-40)}Z" fill="#4F5A63"/>`;
  for (let i = 0; i < 60; i++) s += `<line x1="${X(560 + i * 38)}" y1="${Y(-330)}" x2="${X(420 + i * 43)}" y2="${Y(-64)}" stroke="#3C454D" stroke-width="5"/>`;
  s += `<path d="M${X(520)},${Y(-340)} L${X(2880)},${Y(-340)} L${X(2860)},${Y(-372)} L${X(540)},${Y(-372)}Z" fill="#3A434A"/>`;
  s += `<path d="M${X(500)},${Y(-372)} q-40,-50 -10,-80 M${X(2900)},${Y(-372)} q40,-50 10,-80" stroke="#3A434A" stroke-width="22" fill="none" stroke-linecap="round"/>`;
  // second (upper) roof tier
  s += `<path d="M${X(700)},${Y(-372)} L${X(900)},${Y(-520)} L${X(2500)},${Y(-520)} L${X(2700)},${Y(-372)}Z" fill="#56616A"/>`;
  s += `<rect x="${X(860)}" y="${Y(-560)}" width="1680" height="44" fill="#3A434A"/>`;
  // haze over the whole hall (distance)
  s += `<rect x="0" y="0" width="4400" height="1900" fill="#EAD9B6" opacity="0.18"/>`;
  return s;
}

function floor() {
  // world paving (d 1.0) from y 700 to 2300, perspective joints toward a vanishing point high above
  const x0 = -800, y0 = 700, w = 4600, h = 1600, vp = [1650, -1700];
  let s = `<rect x="0" y="0" width="${w}" height="${h}" fill="#BDB2A0"/>`;
  s += `<rect x="0" y="0" width="${w}" height="${h}" fill="url(#t05flg)"/>`;
  // horizontal joints: spacing grows toward the camera (bottom)
  let y = y0 + 20, sp = 46;
  while (y < y0 + h) { s += `<rect x="0" y="${f2(y - y0)}" width="${w}" height="2.4" fill="#988C7A" opacity="0.55"/>`; y += sp; sp *= 1.07; }
  for (let i = -30; i <= 30; i++) {
    const xb = 1650 + i * 150;
    // line from the vanishing point through (xb, y0+h)
    const k0 = (y0 - vp[1]) / (y0 + h - vp[1]);
    const xa = vp[0] + (xb - vp[0]) * k0;
    s += `<line x1="${f2(xa - x0)}" y1="0" x2="${f2(xb - x0)}" y2="${h}" stroke="#988C7A" stroke-width="2.2" opacity="0.5"/>`;
  }
  const R = rng(9);
  for (let i = 0; i < 160; i++) s += `<rect x="${f2(R() * w)}" y="${f2(R() * h)}" width="${f2(60 + R() * 90)}" height="${f2(20 + R() * 30)}" fill="${R() < 0.5 ? '#C9BFAD' : '#AEA391'}" opacity="0.35"/>`;
  return { svg: s, x0, y0, w, h, defs: lg('t05flg', [[0, '#C8BCA6'], [1, '#A99D89']]) };
}

function ding() {
  // bronze 鼎 at the origin = centre of its feet line, ~330 px wide, 330 tall (world units)
  const B = '#55614F', BS = '#3A4236', BL = '#86896A', BD = '#2B3128';
  let s = '';
  s += `<ellipse cx="0" cy="4" rx="190" ry="28" fill="#3A2E24" opacity="0.25"/>`;
  s += `<path d="M-120,-20 L-140,0 L-110,0 L-92,-40Z M120,-20 L140,0 L110,0 L92,-40Z M-14,-30 L-18,4 L18,4 L14,-30Z" fill="${BD}" stroke="${LN}" stroke-width="3"/>`;
  s += `<path d="M-170,-240 L170,-240 C176,-170 150,-80 100,-44 C50,-24 -50,-24 -100,-44 C-150,-80 -176,-170 -170,-240Z" fill="${B}" stroke="${LN}" stroke-width="4"/>`;
  s += `<path d="M-160,-200 L160,-200 M-150,-150 L150,-150" stroke="${BS}" stroke-width="10"/>`;
  for (let i = -3; i <= 3; i++) s += `<path d="M${i * 44 - 14},-190 q14,-12 28,0 q-14,12 -28,0" fill="none" stroke="${BL}" stroke-width="4" opacity="0.7"/>`;
  s += `<path d="M-150,-120 C-120,-70 -60,-50 0,-48" fill="none" stroke="${BL}" stroke-width="8" opacity="0.5"/>`;
  s += `<rect x="-180" y="-262" width="360" height="26" rx="6" fill="${BS}" stroke="${LN}" stroke-width="4"/>`;
  s += `<path d="M-150,-262 L-150,-330 L-96,-330 L-96,-262 M-136,-262 L-136,-316 L-110,-316 L-110,-262Z M96,-262 L96,-330 L150,-330 L150,-262 M110,-262 L110,-316 L136,-316 L136,-262Z" fill="${B}" stroke="${LN}" stroke-width="4" fill-rule="evenodd"/>`;
  // incense sticks in the ash
  const R = rng(4);
  for (let i = 0; i < 9; i++) {
    const x = -60 + i * 15 + R() * 6, a = (R() - 0.5) * 16;
    s += `<g transform="translate(${f2(x)} -262) rotate(${f2(a)})"><rect x="-2.5" y="-120" width="5" height="120" fill="#8E3B2A"/><circle cx="0" cy="-122" r="5" fill="#FF8A3D"/></g>`;
  }
  return s;
}

function smokeRibbons(t, base, n, seed, scale = 1) {
  // rising incense ribbons (world coords), base = [x, y] top of the 鼎; ribbons twine as they rise
  let s = '';
  for (let r = 0; r < n; r++) {
    const pts = [];
    for (let i = 0; i <= 26; i++) {
      const h = i * 42 * scale;
      const ph = t * 0.9 - i * 0.16 + r * 2.1;
      const amp = (10 + i * 5.2) * scale;
      const x = base[0] + (r - (n - 1) / 2) * 14 + Math.sin(ph * 1.7 + seed) * amp * 0.7 + noise1(ph + r * 3, seed) * amp;
      pts.push([x, base[1] - h]);
    }
    const d = 'M' + pts.map((p) => `${f2(p[0])},${f2(p[1])}`).join(' L');
    s += `<path d="${d}" stroke="#F8F3EA" stroke-width="${f2(30 * scale)}" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.32"/>`;
    s += `<path d="${d}" stroke="#FFFDF8" stroke-width="${f2(10 * scale)}" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.55"/>`;
  }
  return s;
}

// crowd placement (world, d 1.0): a half ring behind and beside the pair
const PEOPLE = (() => {
  const R = rng(21), out = [];
  const c = [1800, 1110];
  for (let i = 0; i < 20; i++) {
    const a = ((194 + (i / 19) * 152) * Math.PI) / 180;
    const rr = 1 + (R() - 0.5) * 0.22;
    const x = c[0] + Math.cos(a) * 650 * rr + (R() - 0.5) * 50, y = c[1] + Math.sin(a) * 240 * rr + (R() - 0.5) * 24;
    out.push({ x, y, P: 1.55 + R() * 0.23, seed: 100 + i, turn0: (R() - 0.5) * 1.4, turnTo: x < 1790 ? 0.75 : -0.75, turnAt: 40.73 + R() * 0.42, back: false });
  }
  // a few nearer onlookers at the sides (seen from behind / 3/4)
  [[1180, 1330, 0.6], [1290, 1390, 0.9], [2420, 1340, -0.7], [2540, 1290, -0.8], [2300, 1420, -0.6]].forEach(([x, y, tt], i) => out.push({ x, y, P: 1.62 + i * 0.03, seed: 200 + i, back: true, turnAt: 40.8 + i * 0.07, turnTo: tt }));
  return out;
})();

function camA(t) {
  const K1 = { p: [1150, 330], q: [1190, 560], z: 1.4 };
  const K2 = { p: [1650, 1000], q: [960, 560], z: 0.7 };
  const K3 = { p: [1770, 1000], q: [940, 520], z: 1.25 };
  const drift = [0, -40 * ramp(t, 38.0, 38.9, E.lin)];
  if (t < 38.64) return camAt([K1.p[0], K1.p[1] + 40 + drift[1]], [K1.q[0] - 30 + 30 * ramp(t, 38.0, 38.64, E.lin), K1.q[1]], K1.z);
  if (t < 40.73) {
    const k = ramp(t, 38.64, 40.73, E.inOut);
    return camAt([lerp(K1.p[0], K2.p[0], k), lerp(K1.p[1], K2.p[1], k)], [lerp(K1.q[0], K2.q[0], k), lerp(K1.q[1], K2.q[1], k)], zexp(t, 38.64, 40.73, K1.z, K2.z));
  }
  const k = ramp(t, 40.73, 42.39, E.inOut);
  const z = zexp(t, 40.73, 42.39, K2.z, K3.z) * (1 + 0.04 * ramp(t, 42.39, 42.6, E.lin));
  return camAt([lerp(K2.p[0], K3.p[0], k), lerp(K2.p[1], K3.p[1], k)], [lerp(K2.q[0], K3.q[0], k), lerp(K2.q[1], K3.q[1], k)], z);
}

function setA(t) {
  const c = camA(t);
  let s = `<rect x="-10" y="-10" width="1940" height="1100" fill="#EAD9B6"/>`;
  s += L(c, 0.25, bake('t05roofs', 4400, 1700, farRoofs(), { x: -1000, y: -500 }), { id: 't05roofs', bleed: 'all' });
  s += L(c, 0.35, bake('t05hall', 4400, 1900, hall(), { x: -1000, y: -700 }), { id: 't05hall', bleed: 'all' });
  const F = floor();
  s += L(c, 1.0, `<g opacity="1">${bake('t05floor', F.w, F.h, F.svg, { x: F.x0, y: F.y0, defs: F.defs })}</g>` +
    `<rect x="${F.x0}" y="${F.y0 - 40}" width="${F.w}" height="60" fill="url(#t05fe)"/><defs>${lg('t05fe', [[0, '#BDB2A0', 0], [1, '#BDB2A0', 1]])}</defs>`, { id: 't05floor', bleed: 'all' });
  // sunlit gap on the incident
  const pool = `<ellipse cx="1810" cy="1170" rx="430" ry="150" fill="url(#t05pool)"/><defs>${rg('t05pool', [[0, '#FFF6DE', 0.55], [1, '#FFF6DE', 0]])}</defs>`;
  // people + 鼎 sorted by depth (y)
  const items = [];
  for (const p of PEOPLE) items.push([p.y, crowd({ t, people: [p], yh: YH, cam_h: CAMH })]);
  // wife (back view), recoils at 41.571
  const rec = ramp(t, 41.571, 41.9, E.out);
  const wh = hAt(PAIR.wife[1], 1.58);
  items.push([PAIR.wife[1], wifeFull({ x: PAIR.wife[0] - 34 * rec, y: PAIR.wife[1] + 8 * rec, height: wh, tilt: -6 * rec, slump: 0.2 * rec, bow: 0.1 + 0.25 * rec })]);
  // 高衙内 steps across her path at 40.310, leans in 41.153
  const st = ramp(t, 40.31, 40.75, E.out), ln = ramp(t, 41.153, 41.45, E.out) - 0.4 * ramp(t, 41.6, 42.0, E.inOut);
  const gx = lerp(2060, PAIR.gao[0], st) - 26 * ln, bob = -Math.abs(Math.sin(ramp(t, 40.31, 40.75, E.lin) * Math.PI * 2)) * 8;
  items.push([PAIR.gao[1], gaoFront({ x: gx, y: PAIR.gao[1] + bob, h: hAt(PAIR.gao[1], 1.79), lean: -7 * ln })]);
  // 林冲 strides in from behind the 鼎 at 41.97
  if (t > 41.85) {
    const k = ramp(t, 41.85, 42.5, E.lin);
    const lx = lerp(1120, 1420, k), ly = 1262 + 6 * k, step = Math.sin(k * Math.PI * 3);
    items.push([ly - 1, lin({ view: 'side', costume: 'A', flip: true, expr: EX.怒, x: lx, y: ly - Math.abs(step) * 6, height: hAt(ly, 1.8) })]);
  }
  items.push([DING[1], `<g transform="translate(${DING[0]} ${DING[1]})">${bake('t05ding', 420, 470, `<g transform="translate(210 380)">${ding()}</g>`, { x: -210, y: -380 })}</g>`]);
  items.sort((a, b) => a[0] - b[0]);
  s += L(c, 1.0, pool + items.map((x) => x[1]).join(''), { id: 't05people' });
  // incense smoke from the 鼎 (in front of the crowd behind it, d ~1.0)
  s += L(c, 1.0, `<g filter="url(#${blurId(5)})">${smokeRibbons(t, [DING[0], DING[1] - 300], 2, 2, 1.25)}${smokeRibbons(t + 3, [DING[0] + 20, DING[1] - 300], 1, 7, 0.9)}</g>`, { id: 't05smoke', bleed: 'all' });
  // foreground: a blurred bundle of incense sticks in a sand bowl, bottom-left, arrives with the push to K3 (d 1.4)
  const fgk = ramp(t, 41.5, 42.0, E.inOut);
  if (fgk > 0) {
    const R2 = rng(12);
    let fg = `<ellipse cx="0" cy="40" rx="230" ry="70" fill="#5E4A3A"/><ellipse cx="0" cy="20" rx="210" ry="50" fill="#9A8A70"/>`;
    for (let i = 0; i < 16; i++) { const x = -150 + i * 20 + R2() * 8, a = (R2() - 0.5) * 18, h = 260 + R2() * 90; fg += `<g transform="translate(${f2(x)} 20) rotate(${f2(a)})"><rect x="-4" y="${-h}" width="8" height="${h}" fill="#8E3B2A"/><circle cx="0" cy="${-h}" r="8" fill="#FF8A3D"/></g>`; }
    const fgPos = toWorld(camAt([1770, 1000], [940, 520], 1.25), 1.4, [150, 1010]);
    s += L(c, 1.4, `<g transform="translate(${f2(fgPos[0])} ${f2(fgPos[1])})" opacity="${f2(fgk)}">${bake('t05incense', 560, 520, `<g transform="translate(280 400)">${fg}</g>`, { x: -280, y: -400 })}</g>`, { id: 't05incense', bleed: 'all', blur: 7 });
  }
  s += motes(t, { seed: 5, n: 26, area: [200, 0, 1920, 900], color: '#FFF4DC', op: 0.45 });
  return s;
}

// ======================================================================= SET B (S10–S12 profile two-shot)
// world: 林冲 (side A, facing right) feet (760, 2100), height 1600; 高衙内 3/4 facing left, feet (1350, 2100)
const LC = { x: 760, y: 2100, height: 1600, flip: true };
const LCk = 1600 / 7.5 / ((1470 - 304) / 6.5);
const LCP = (p) => rigPoint('side', 'A', LC, p);
const EYE = LCP([368, 222]), SHO = LCP([470, 410]), CHIN = LCP([362, 305]);
const G = { x: 1290, y: 2100, h: 1600 * (1.79 / 1.8), flip: true };
const GFACE = gaoPt(G, [362, 282]);
const GSHO = gaoPt(G, [455, 410]); // his shoulder nearest 林冲
const FIST_UP = [885, 430]; // raised fist (world)
const HB = LCk * 179.4; // head unit in world px (= 213)

function bgB() {
  // bright hazy temple background (layer coords, the caller places it), baked
  let s = `<rect width="3600" height="2200" fill="#EFE0BE"/>`;
  s += `<rect width="3600" height="2200" fill="url(#t05bhz)"/>`;
  for (let i = 0; i < 7; i++) {
    const x = 200 + i * 520;
    s += `<rect x="${x}" y="300" width="110" height="1900" fill="#B85A48" opacity="0.55"/><rect x="${x + 20}" y="300" width="22" height="1900" fill="#D27A62" opacity="0.4"/>`;
  }
  s += `<path d="M-100,360 Q400,320 900,260 L2700,260 Q3200,320 3700,360 L3700,180 L-100,180Z" fill="#6A737A" opacity="0.5"/>`;
  s += `<rect x="-100" y="0" width="3800" height="200" fill="#F5EAD0"/>`;
  s += `<rect x="0" y="1500" width="3600" height="700" fill="#D4C3A0" opacity="0.6"/>`;
  return s;
}
const BG_DEFS = lg('t05bhz', [[0, '#F7EED8'], [0.55, '#EADBB8'], [1, '#D9C7A2']]);

function camB(t) {
  // 42.39 MS two-shot; push to 1.6 toward the raised fist; 45.712 onto 高衙内's face (1.9);
  // 48.634 to the fist, push to 4.0; 50.29 follow the sinking hand to the jaw CU (3.4); 52.8 truck right
  const A0 = camAt([EYE[0] + 120, EYE[1] + 40], [880, 470], 1.25);
  const A1 = camAt([EYE[0] + 200, EYE[1] - 20], [940, 470], 1.6);
  const B1 = camAt(GFACE, [1380, 560], 1.9);
  const F0 = camAt(FIST_UP, [760, 400], 3.0), F1 = camAt([FIST_UP[0] + 6, FIST_UP[1] + 10], [760, 420], 4.0);
  const S0 = camAt([EYE[0] - 30, EYE[1] + 40], [700, 420], 3.4);
  const mixc = (a, b, k) => ({ x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k), zoom: a.zoom * Math.pow(b.zoom / a.zoom, k) });
  let c;
  if (t < 43.63) c = mixc(A0, A1, ramp(t, 42.39, 43.63, E.out));
  else if (t < 45.712) c = mixc(A1, { ...A1, zoom: 1.66, x: A1.x + 8 }, ramp(t, 43.63, 45.712, E.inOut));
  else if (t < 48.634) c = mixc({ ...A1, zoom: 1.66, x: A1.x + 8 }, B1, ramp(t, 45.712, 47.0, E.out));
  else if (t < 50.29) c = t < 49.3 ? mixc(B1, F0, ramp(t, 48.634, 49.3, E.inOut)) : mixc(F0, F1, ramp(t, 49.3, 49.95, E.out));
  else c = mixc(F1, S0, ramp(t, 50.29, 51.35, E.inOut));
  if (t >= 51.35) c = mixc(S0, { ...S0, zoom: 3.47 }, ramp(t, 51.35, 52.8, E.lin));
  // truck right into the pillar wipe
  if (t > 52.8) c = { ...c, x: c.x + 260 * ramp(t, 52.8, 53.6, E.in) };
  return c;
}

function nearArm(t) {
  // 林冲's near arm, code-drawn: hanging → (43.63–45.30, slow → fast) raised fist above-in-front of the head;
  // the grip gives 49.457 (index+middle) / 49.88 (ring+little); 50.29 the half-open hand sinks.
  const up = ramp(t, 43.63, 45.302, E.in);
  const sink = ramp(t, 50.29, 51.6, E.out);
  // angles (screen, y down): upper arm, forearm
  const au = lerp(lerp(96, -32, up), 60, sink), af = lerp(lerp(104, -108, up), -20 + 30 * sink, sink);
  const Lu = 1.36 * HB, Lf = 1.05 * HB;
  const S = SHO, El = [S[0] + Math.cos((au * Math.PI) / 180) * Lu, S[1] + Math.sin((au * Math.PI) / 180) * Lu];
  const Wr = [El[0] + Math.cos((af * Math.PI) / 180) * Lf, El[1] + Math.sin((af * Math.PI) / 180) * Lf];
  const size = 0.46 * HB;
  const open = clamp(ramp(t, 49.457, 49.78, E.out) * 0.5 + ramp(t, 49.88, 50.25, E.out) * 0.5);
  // fist local: wrist ≈ (-26, 46), forearm axis toward local angle 104.6°
  const rot = af + 180 - 104.6;
  const r = (rot * Math.PI) / 180, k = size / 100;
  const wl = [-26 * k, 46 * k];
  const ctr = [Wr[0] - (wl[0] * Math.cos(r) - wl[1] * Math.sin(r)), Wr[1] - (wl[0] * Math.sin(r) + wl[1] * Math.cos(r))];
  const tremble = t > 45.1 && t < 49.04 ? 1.5 / 1.66 : 0;
  // upper arm: wide green sleeve, hanging fold below the arm
  const n = [-(El[1] - S[1]), El[0] - S[0]], nl = Math.hypot(n[0], n[1]), nu = [n[0] / nl, n[1] / nl];
  const w0 = 0.44 * HB, w1 = 0.27 * HB, drape = 0.32 * HB * up;
  const P1 = [S[0] + nu[0] * w0 * 0.5, S[1] + nu[1] * w0 * 0.5], P2 = [El[0] + nu[0] * w1 * 0.5, El[1] + nu[1] * w1 * 0.5];
  const P3 = [El[0] - nu[0] * w1 * 0.5, El[1] - nu[1] * w1 * 0.5], P4 = [S[0] - nu[0] * w0 * 0.5, S[1] - nu[1] * w0 * 0.5];
  const low = (p) => [p[0], p[1] + drape];
  const lowSide = nu[1] > 0 ? [P1, P2] : [P4, P3];
  let s = '';
  s += `<path d="M${f2(lowSide[0][0])},${f2(lowSide[0][1])} L${f2(lowSide[1][0])},${f2(lowSide[1][1])} C${f2(low(lowSide[1])[0])},${f2(low(lowSide[1])[1])} ${f2(low(lowSide[0])[0])},${f2(low(lowSide[0])[1])} ${f2(lowSide[0][0])},${f2(lowSide[0][1])}Z" fill="${ROBE_S}" stroke="${LN}" stroke-width="3"/>`;
  s += `<path d="M${f2(P1[0])},${f2(P1[1])} L${f2(P2[0])},${f2(P2[1])} L${f2(P3[0])},${f2(P3[1])} L${f2(P4[0])},${f2(P4[1])}Z" fill="${ROBE}" stroke="${LN}" stroke-width="3" stroke-linejoin="round"/>`;
  s += `<circle cx="${f2(S[0])}" cy="${f2(S[1])}" r="${f2(w0 * 0.55)}" fill="${ROBE}"/>`;
  s += fist(ctr[0], ctr[1], size, { open, rot, sleeve: ROBE, sleeveS: ROBE_S, tremble, t, light: up * 0.6 });
  return { svg: s, fist: ctr };
}

function farArm(t) {
  // the far hand grabs 高衙内's shoulder at 42.39 and holds it (contact); the arm comes from behind his chest
  const reach = ramp(t, 42.2, 42.42, E.out), rel = ramp(t, 47.4, 48.2, E.inOut);
  const H = [GSHO[0] - 10 + lerp(-120, 0, reach) - 40 * rel, GSHO[1] + 16 + 90 * rel];
  const S = [SHO[0] + 0.55 * HB, SHO[1] + 0.25 * HB]; // emerges from in front of his chest
  const El = [lerp(S[0], H[0], 0.45), lerp(S[1], H[1], 0.45) + 0.28 * HB];
  const w = 0.26 * HB;
  const tube = (a, b, w1, w2) => {
    const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy), nx = -dy / l, ny = dx / l;
    return `M${f2(a[0] + nx * w1)},${f2(a[1] + ny * w1)} L${f2(b[0] + nx * w2)},${f2(b[1] + ny * w2)} L${f2(b[0] - nx * w2)},${f2(b[1] - ny * w2)} L${f2(a[0] - nx * w1)},${f2(a[1] - ny * w1)}Z`;
  };
  let s = `<path d="${tube(S, El, w * 0.75, w * 0.62)}" fill="${ROBE_S}" stroke="${LN}" stroke-width="3" stroke-linejoin="round"/>`;
  s += `<circle cx="${f2(El[0])}" cy="${f2(El[1])}" r="${f2(w * 0.62)}" fill="${ROBE_S}" stroke="${LN}" stroke-width="3"/>`;
  s += `<path d="${tube(El, [H[0] - 0.12 * HB, H[1] + 0.02 * HB], w * 0.6, w * 0.5)}" fill="${ROBE_S}" stroke="${LN}" stroke-width="3" stroke-linejoin="round"/>`;
  s += `<circle cx="${f2(El[0])}" cy="${f2(El[1])}" r="${f2(w * 0.55)}" fill="${ROBE_S}"/>`;
  // hand over the top of his shoulder: palm on top, four fingers curling down the front
  const k = HB / 213;
  s += `<g transform="translate(${f2(H[0])} ${f2(H[1])}) scale(${f2(k)})"><path d="M-44,-6 C-40,-30 -6,-40 22,-34 C42,-28 52,-10 50,6 L44,40 C36,44 28,42 26,34 L24,14 L16,40 C8,44 0,42 -2,34 L-4,12 L-12,30 C-20,34 -28,30 -28,22 L-30,10 C-40,10 -46,4 -44,-6Z" fill="#D9A07C" stroke="${LN}" stroke-width="3" stroke-linejoin="round"/>` +
    `<path d="M-30,-14 C-14,-22 6,-24 26,-20" fill="none" stroke="#B9785A" stroke-width="3" stroke-linecap="round"/></g>`;
  return s;
}

function lcExpr(t) {
  const k = ramp(t, 45.9, 46.1, E.out);
  const a = EX.怒, b = { ...NE, brow: 0.4, eye: 1.15, mouth: -0.2, open: 0.12 };
  let e = {};
  for (const key of Object.keys(NE)) e[key] = Array.isArray(a[key]) ? a[key].map((v, i) => lerp(v, (b[key] || [0, 0])[i], k)) : lerp(a[key] ?? 0, b[key] ?? 0, k);
  e.open = lerp(0.35, 0.12, k);
  if (t > 50.3) {
    const j = ramp(t, 50.3, 51.0, E.inOut), cl = ramp(t, 52.37, 52.5, E.out);
    const c = { ...EX.隐忍, look: [0.4, 0.45], jaw: lerp(0.7, 1, cl), mouth: -0.35 - 0.1 * cl, brow: -0.75 - 0.1 * cl };
    for (const key of Object.keys(NE)) e[key] = Array.isArray(e[key]) ? e[key].map((v, i) => lerp(v, c[key][i], j)) : lerp(e[key], c[key], j);
  }
  return e;
}

function setB(t) {
  const c = camB(t);
  const focusGao = ramp(t, 45.712, 46.1, E.inOut) - ramp(t, 48.634, 49.0, E.inOut);
  let s = `<rect x="-10" y="-10" width="1940" height="1100" fill="#EFE0BE"/>`;
  s += L(c, 0.3, bake('t05bgB', 3600, 2200, bgB(), { x: -1000, y: -700, defs: BG_DEFS }), { id: 't05bgB', bleed: 'all', blur: 3 });
  // background crowd silhouettes and the wife (soft), d 0.7
  let bgp = '';
  const R = rng(31);
  for (let i = 0; i < 9; i++) {
    const x = -200 + i * 330 + R() * 80, y = 1700 + R() * 60;
    bgp += `<g opacity="0.55">${tracedG('lu_front', { x, y, h: 900 + R() * 120, mono: '#8E7E68' })}</g>`;
  }
  const wturn = ramp(t, 42.6, 43.4, E.inOut);
  const wp = toWorld(camAt([EYE[0] + 120, EYE[1] + 40], [880, 470], 1.25), 0.7, [1090, 560]);
  bgp += wifeBack({ x: wp[0] + 30 * wturn, y: wp[1], head: 0.62 * HB, tilt: -8 * wturn, bow: 0.25 });
  // retainers step in behind 高衙内 at 46.14
  const rt = ramp(t, 46.14, 46.8, E.out);
  if (t > 45.9) {
    bgp += tracedG('lu_front', { x: 1700 + 140 * (1 - rt), y: 1900, h: 1350, recol: (cc, [h, sat, l]) => (sat > 0.15 && l < 0.5 ? '#4A505A' : null) });
    bgp += tracedG('lu_front', { x: 2060 + 160 * (1 - rt), y: 1880, h: 1330, recol: (cc, [h, sat, l]) => (sat > 0.15 && l < 0.5 ? '#5A4E46' : null) });
  }
  s += L(c, 0.7, bgp, { id: 't05bgp', bleed: 'all', blur: 7 });
  // 高衙内: wrenched round at 42.793 (2-frame smear), sleeve over his face until the reveal at 45.712
  const spin = ramp(t, 42.39, 42.793, E.in);
  const raise = t < 45.55 ? 1 : 1 - ramp(t, 45.55, 45.75, E.inOut);
  const smirk = ramp(t, 45.9, 46.4, E.out), tilt = 0;
  const away = ramp(t, 49.9, 51.0, E.inOut);
  let gao = '';
  if (away < 1) {
    const gx = G.x + 60 * (1 - spin) + 30 * away, rot = 8 * (1 - spin);
    const smear = t > 42.72 && t < 42.86 ? ` filter="url(#${blurId(9)})"` : '';
    gao = `<g transform="rotate(${f2(rot)} ${G.x} ${G.y})"${smear}>${gaoTQ({ ...G, x: gx, raise, smirk, tilt, id: 't05gao' })}</g>`;
  }
  const blurGao = 6 * (1 - focusGao) * ramp(t, 45.0, 45.712, E.lin) + 5 * ramp(t, 48.634, 49.0, E.inOut);
  // 林冲 (rig without its arms) + code arms
  let lcSvg = lin({ view: 'side', costume: 'A', ...LC, expr: lcExpr(t), pose: { headTilt: -2 * ramp(t, 50.29, 51.3) } });
  lcSvg = dropParts(lcSvg, ['armL_up', 'armL_lo', 'handL', 'farArm']);
  const na = nearArm(t);
  const blurLc = 6 * focusGao;
  // swallow (Adam's apple) at 52.79
  const sw = Math.sin(ramp(t, 52.79, 53.15, E.inOut) * Math.PI);
  const apple = `<path d="M${f2(CHIN[0] - 18)},${f2(CHIN[1] + 0.32 * HB - 20 * sw)} q10,6 2,16" fill="none" stroke="#B9785A" stroke-width="5" stroke-linecap="round" opacity="${f2(0.4 + 0.5 * sw)}"/>`;
  s += L(c, 1.0, `<g${blurGao > 0.4 ? ` filter="url(#${blurId(blurGao)})"` : ''}>${gao}</g>`, { id: 't05gao' });
  s += L(c, 1.0, `<g data-allowcut="1"${blurLc > 0.4 ? ` filter="url(#${blurId(blurLc)})"` : ''}>${farArm(t)}${lcSvg}${apple}${na.svg}</g>`, { id: 't05lc' });
  // 高衙内's back, receding in the distance in S12 (laughing), d 0.6
  if (t > 50.4) {
    const k = ramp(t, 50.4, 53.4, E.lin), laugh = Math.sin(t * 22) * 3 * ramp(t, 50.8, 51.2);
    const gp = toWorld(camAt([EYE[0] - 30, EYE[1] + 40], [700, 420], 3.4), 0.6, [1360 + 120 * k, 560 + laugh]);
    s += L(c, 0.6, gaoBack({ x: gp[0], y: gp[1] + 150, h: 260 - 40 * k, step: Math.sin(k * 14) * 2 }), { id: 't05gaoback', blur: 9 });
  }
  // light: warm key from the left; 45.712 the grade drains (sat −35 %, haze) and a cold edge creeps from the right
  const dr = ramp(t, 45.712, 47.0, E.inOut);
  s += `<rect width="1920" height="1080" fill="url(#t05warm)" opacity="${f2(0.35 * (1 - dr))}"/>`;
  if (dr > 0) {
    s += `<rect width="1920" height="1080" fill="#9A958A" style="mix-blend-mode:saturation" opacity="${f2(0.38 * dr)}"/>`;
    s += `<rect width="1920" height="1080" fill="#CFC6B2" opacity="${f2(0.12 * dr)}"/>`;
    s += `<rect width="1920" height="1080" fill="url(#t05cold)" opacity="${f2(0.5 * dr)}"/>`;
  }
  // S12: hard side light from the right, the near face in shadow
  const sh = ramp(t, 50.6, 51.4, E.inOut);
  if (sh > 0) s += `<rect width="1920" height="1080" fill="url(#t05side)" opacity="${f2(0.55 * sh)}" style="mix-blend-mode:multiply"/>`;
  s += `<defs>${lg('t05warm', [[0, '#FFD9A0', 0.6], [0.6, '#FFD9A0', 0]], 0, 0, 1, 0)}${lg('t05cold', [[0.55, '#8FA2B8', 0], [1, '#8FA2B8', 0.7]], 0, 0, 1, 0)}${lg('t05side', [[0, '#3A3A44'], [0.5, '#6A6870'], [0.8, '#D8D2C4'], [1, '#FFFFFF']], 0, 0, 1, 0)}</defs>`;
  return s;
}

// ======================================================================= smoke wipe A → B (42.12–42.46)
function smokeWipe(t) {
  const k = ramp(t, 42.04, 42.56, E.lin);
  if (k <= 0 || k >= 1) return '';
  const dens = Math.sin(k * Math.PI);
  const R = rng(77);
  let s = '';
  for (let i = 0; i < 22; i++) {
    const y = R() * 1240 - 80, r = 220 + R() * 240, x = lerp(-900, 2800, k) + (R() - 0.5) * 1700 - y * 0.25;
    s += `<ellipse cx="${f2(x)}" cy="${f2(y)}" rx="${f2(r * 1.6)}" ry="${f2(r)}" fill="${R() < 0.5 ? '#F3EADA' : '#E6DAC4'}"/>`;
  }
  return `<g data-layer="fx-smoke" data-z="700" data-bleed="all" opacity="${f2(Math.min(0.97, dens * 1.4))}" filter="url(#${blurId(36)})">${s}<rect width="1920" height="1080" fill="#EDE3D0" opacity="${f2(clamp(dens * 1.4 - 0.55) * 0.85)}"/></g>`;
}

export default {
  enter: { a: 38.22, b: 38.638, type: 'dissolve', ease: E.inOut },
  frame(t) {
    let s;
    if (t < 42.30) s = setA(t);
    else s = setB(Math.max(t, 42.39 - 0.12) < 42.39 ? 42.39 : t);
    if (t >= 42.30 && t < 42.39) s = setB(42.39);
    s += smokeWipe(t);
    return s;
  },
};
