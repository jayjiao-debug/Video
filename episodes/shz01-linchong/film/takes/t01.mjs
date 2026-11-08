// T01 · S01–S04 · 0.000–18.657 · one continuous move from the paper to the street (summer, a tavern by the city gate).
// storyboard_v3 §5 TAKE 1, colour script C1, film/timing.md. Ids are prefixed "t01".
import { L, kf, ramp, E, bake, f2, clamp, lerp, mix, motes, shake, pulse, rng, noise1, lg, rg, full, smooth, INK } from '../lib.mjs';
import { lin, EX } from '../../chars/rig/linchong.mjs';
import { xiushu, XS } from '../cast/xiushu.mjs';
import { palm } from '../cast/palm.mjs';
import { wifeBack, wifeHandGrip, COLW } from '../cast/wife.mjs';
import { guard, guardHand } from '../cast/guard.mjs';

const LN = '#2A1C17';
const SK = { skin: '#E8AE88', skinS: '#C98F6C', skinD: '#A9714F', scar: '#F3CFB4' };
const ROBE = '#3B4356', ROBES = '#2C3241';
const CONVICT = { view: 'front', costume: 'A', col: { robe: ROBE }, headCloth: 'plain', cangue: true, tattoo: 1 };
const ln = (w) => `stroke="${LN}" stroke-width="${f2(w)}" stroke-linejoin="round" stroke-linecap="round"`;
const P = (x, y) => `${f2(x)},${f2(y)}`;
const T = { brush: 0.337, press: 2.833, lift: 3.68, her: 4.505, s2: 5.341, tear: 7.838, crumple: 8.673, s3: 9.913, spill: 12.828, guardHand: 13.665, s4: 14.498, slide: 16.161, look: 16.997, nudge: 17.82 };

// ============================================================== his right hand (back of the hand, from above)
// local: wrist centre at (0,0), fingers toward -y, L = wrist-to-fingertip = 100 units. mode 'flat' | 'brush'.
function hisHand(mode, o = {}) {
  const lw = o.lw || 1.1;
  const L_ = ln(lw);
  let s = '';
  // forearm + convict sleeve (comes from +y)
  s += `<path d="M-19,6 C-22,40 -26,90 -30,170 L34,170 C30,90 24,40 19,6Z" fill="${SK.skinS}" ${L_}/>`;
  s += `<path d="M-40,62 C-14,54 18,54 44,62 L52,190 L-48,190Z" fill="${ROBE}" ${L_}/><path d="M-40,62 C-14,54 18,54 44,62 L45,74 C18,66 -14,66 -41,74Z" fill="${ROBES}" ${L_}/>`;
  if (mode === 'flat') {
    // fingers (together, slightly spread), drawn under the hand back
    const F = [[-17, -50, -19, -94, 11.5], [-5.5, -52, -6.5, -100, 12], [6, -51, 6.5, -96, 11.5], [16.5, -46, 18.5, -83, 10]];
    for (const [x0, y0, x1, y1, w] of F) {
      s += `<path d="M${P(x0 - w / 2, y0)} L${P(x1 - w / 2 + 0.6, y1 + w / 2)} A${f2(w / 2)},${f2(w / 2)} 0 0 1 ${P(x1 + w / 2 - 0.6, y1 + w / 2)} L${P(x0 + w / 2, y0)}Z" fill="${SK.skin}" ${L_}/>`;
      // knuckle creases on the fingers
      for (const k of [0.38, 0.68]) { const x = lerp(x0, x1, k), y = lerp(y0, y1, k); s += `<path d="M${P(x - w * 0.3, y + 1)} Q${P(x, y - 1.5)} ${P(x + w * 0.3, y + 1)}" fill="none" stroke="${SK.skinS}" stroke-width="0.9"/>`; }
    }
    // thumb, angled out to the left
    s += `<path d="M-20,-16 C-30,-26 -40,-40 -46,-54 C-49,-61 -42,-66 -37,-60 C-30,-50 -22,-40 -12,-30Z" fill="${SK.skin}" ${L_}/>`;
    s += `<path d="M-41,-52 Q-37,-50 -34,-54" fill="none" stroke="${SK.skinS}" stroke-width="0.9"/>`;
  } else {
    // writing grip: fingers curled over the shaft (foreshortened), thumb on the left against it
    const F = [[-17, -50, -12, -66, 12], [-5.5, -52, -3, -66, 12.5], [6, -51, 7, -61, 12], [16.5, -46, 16, -55, 10.5]];
    for (const [x0, y0, x1, y1, w] of F) s += `<path d="M${P(x0 - w / 2, y0 + 2)} L${P(x1 - w / 2, y1 + w / 2)} A${f2(w / 2)},${f2(w / 2)} 0 0 1 ${P(x1 + w / 2, y1 + w / 2)} L${P(x0 + w / 2, y0 + 2)}Z" fill="${SK.skinS}" ${L_}/>`;
    s += `<path d="M-20,-16 C-28,-30 -30,-46 -26,-60 C-24,-66 -17,-66 -16,-60 C-15,-48 -13,-36 -10,-28Z" fill="${SK.skin}" ${L_}/>`;
  }
  // hand back
  s += `<path d="M-19,4 C-24,-6 -27,-22 -24,-36 C-22,-46 -21,-50 -20,-53 C-10,-57 8,-56 22,-48 C24,-36 24,-20 20,-6 C18,0 18,3 18,5Z" fill="${SK.skin}" ${L_}/>`;
  // cel shadow on the right (key from the top left)
  s += `<path d="M14,-49 C21,-44 23,-30 21,-16 C20,-6 19,0 18,5 C14,-6 12,-26 14,-49Z" fill="${SK.skinS}" opacity="0.85"/>`;
  // knuckles, tendons, scars
  for (const [x, y] of [[-16, -51], [-5, -53], [6, -52], [16.5, -47]]) s += `<path d="M${P(x - 4, y + 3)} Q${P(x, y - 1.5)} ${P(x + 4, y + 3)}" fill="none" stroke="${SK.skinD}" stroke-width="0.9" opacity="0.8"/>`;
  for (const x of [-12, -3, 6, 13]) s += `<path d="M${P(x * 0.5, -6)} L${P(x, -44)}" stroke="${SK.skinS}" stroke-width="0.8" opacity="0.6"/>`;
  s += `<path d="M-8,-47 L-1,-44 M9,-45 L13,-41" stroke="${SK.scar}" stroke-width="1.2" stroke-linecap="round"/>`;
  return s;
}
const handAt = (mode, x, y, len, rot = 0, sx = 1, sy = 1, extra = '') =>
  `<g transform="translate(${f2(x)} ${f2(y)}) rotate(${f2(rot)}) scale(${f2((len / 100) * sx)} ${f2((len / 100) * sy)})">${hisHand(mode)}${extra}</g>`;

// ============================================================== props
function inkstone(x, y, w) {
  const k = w / 380;
  return `<g transform="translate(${f2(x)} ${f2(y)}) scale(${f2(k)})">` +
    `<path d="M20,40 C40,8 330,0 360,30 C384,70 384,200 356,234 C320,262 50,262 22,232 C0,190 2,80 20,40Z" fill="#3E3B38" ${ln(3)}/>` +
    `<path d="M22,232 C50,262 320,262 356,234 L352,250 C318,276 50,276 20,248Z" fill="#232120"/>` +
    `<path d="M50,58 C80,36 300,32 330,56 C348,90 346,190 326,212 C290,232 84,232 54,212 C34,180 34,92 50,58Z" fill="#4F4B47"/>` +
    `<path d="M90,62 C120,44 270,44 300,64 C316,84 300,118 270,124 C220,132 140,132 110,124 C80,116 74,82 90,62Z" fill="#141210"/>` +
    `<path d="M120,72 C160,62 230,62 262,74" stroke="#5a5550" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.7"/>` +
    `<path d="M70,170 C140,158 250,158 320,176" stroke="#5f5a55" stroke-width="2.5" fill="none" opacity="0.6"/></g>`;
}
function brushSVG(tip, top, w = 13) {
  // shaft from tip (wet, dark) to top (bamboo, with a cap and loop)
  const dx = top[0] - tip[0], dy = top[1] - tip[1], Lb = Math.hypot(dx, dy), a = (Math.atan2(dy, dx) * 180) / Math.PI;
  return `<g transform="translate(${f2(tip[0])} ${f2(tip[1])}) rotate(${f2(a)})">` +
    `<path d="M0,0 C${f2(Lb * 0.06)},${-w * 0.7} ${f2(Lb * 0.16)},${-w * 0.75} ${f2(Lb * 0.2)},${-w * 0.55} L${f2(Lb * 0.2)},${w * 0.55} C${f2(Lb * 0.16)},${w * 0.75} ${f2(Lb * 0.06)},${w * 0.7} 0,0Z" fill="#141010" ${ln(1.5)}/>` +
    `<rect x="${f2(Lb * 0.2)}" y="${-w * 0.5}" width="${f2(Lb * 0.8)}" height="${w}" rx="${w * 0.4}" fill="#C9A86A" ${ln(1.5)}/>` +
    `<rect x="${f2(Lb * 0.2)}" y="${-w * 0.5}" width="${f2(Lb * 0.8)}" height="${w * 0.35}" rx="${w * 0.2}" fill="#E2C68E" opacity="0.8"/>` +
    `<rect x="${f2(Lb * 0.19)}" y="${-w * 0.6}" width="${f2(Lb * 0.05)}" height="${w * 1.2}" fill="#7A5A32"/>` +
    `<circle cx="${f2(Lb + w * 0.6)}" cy="0" r="${w * 0.55}" fill="none" stroke="#7A5A32" stroke-width="2.5"/></g>`;
}
function pasteDish(x, y, r) {
  return `<g transform="translate(${f2(x)} ${f2(y)})"><ellipse cx="0" cy="${f2(r * 0.12)}" rx="${f2(r * 1.04)}" ry="${f2(r * 0.86)}" fill="#1a1412" opacity="0.5"/>` +
    `<ellipse cx="0" cy="0" rx="${f2(r)}" ry="${f2(r * 0.82)}" fill="#9FB3A3" ${ln(3)}/><ellipse cx="0" cy="${f2(-r * 0.04)}" rx="${f2(r * 0.84)}" ry="${f2(r * 0.68)}" fill="#7E9585"/>` +
    `<ellipse cx="0" cy="${f2(-r * 0.02)}" rx="${f2(r * 0.78)}" ry="${f2(r * 0.62)}" fill="#B3302A"/><ellipse cx="${f2(-r * 0.25)}" cy="${f2(-r * 0.2)}" rx="${f2(r * 0.3)}" ry="${f2(r * 0.12)}" fill="#E06A5E" opacity="0.55"/></g>`;
}

// ============================================================== S01 · the table (CU insert, 50° above)
const S01_TABLE = bake('t01table', 2400, 1500, (() => {
  let s = `<rect width="2400" height="1500" fill="#4A3324"/>`;
  const R = rng(5);
  for (let i = 0; i < 9; i++) {
    const y = i * 170 - 20, c = ['#5A3E2B', '#523826', '#5E412D'][i % 3];
    s += `<rect x="0" y="${y}" width="2400" height="166" fill="${c}"/><rect x="0" y="${y + 164}" width="2400" height="6" fill="#2A1C14"/>`;
    for (let j = 0; j < 14; j++) { const yy = y + 12 + R() * 140; s += `<path d="M0,${f2(yy)} C600,${f2(yy + R() * 16 - 8)} 1400,${f2(yy + R() * 16 - 8)} 2400,${f2(yy + R() * 12 - 6)}" stroke="#3A281C" stroke-width="${f2(1 + R() * 2)}" fill="none" opacity="0.5"/>`; }
  }
  return s;
})());
// the summer daylight shaft through the lattice (top-left) and the warm-shadow room around it
function s01Light(c) {
  // warm daylight pool on the sheet (lattice window, top left); faint lattice bars inside it; the room falls into warm shadow
  let bars = '';
  for (let i = 0; i < 6; i++) { const o = 380 + i * 170; bars += `<path d="M${o},-200 L${o + 46},-200 L${o + 46 + 760},1300 L${o + 760},1300Z" fill="#2A1E17"/>`; }
  return L(c, 1, `<defs>${rg('t01pool', [[0, '#FFF4DC', 0.5], [0.55, '#FFE7B8', 0.2], [1, '#FFE7B8', 0]], 0.5, 0.5, 0.5)}` +
    `${rg('t01room', [[0.3, '#000', 0], [0.75, '#160E0A', 0.45], [1, '#120B08', 0.82]], 0.58, 0.42, 0.72)}` +
    `<clipPath id="t01poolc"><ellipse cx="1130" cy="400" rx="760" ry="560"/></clipPath></defs>` +
    `<ellipse cx="1130" cy="400" rx="760" ry="560" fill="url(#t01pool)" style="mix-blend-mode:screen"/>` +
    `<g clip-path="url(#t01poolc)" opacity="0.07">${bars}</g>` +
    `<rect x="-400" y="-300" width="2700" height="1700" fill="url(#t01room)"/>`, { id: 't01light', bleed: 'all' });
}

// sheet placement on the table (S01) and frontal in her hands (S02); lift interpolates
const SHEET1 = { x: 760, y: 112, w: 680, rot: -4, sy: 0.92 };
const SHEET2 = { x: 650, y: 104, w: 620, rot: 0, sy: 1 };
function sheetTf(t) {
  const k = ramp(t, 4.95, 5.5, E.inOut);
  const a = SHEET1, b = SHEET2;
  const w = lerp(a.w, b.w, k), x = lerp(a.x, b.x, k), y = lerp(a.y, b.y, k) - Math.sin(k * Math.PI) * 40, rot = lerp(a.rot, b.rot, k), sy = lerp(a.sy, b.sy, k);
  const h = (w * 760) / 680;
  return { x, y, w, h, rot, sy, k, cx: x + w / 2, cy: y + (h * sy) / 2 };
}
const sheetG = (S, inner) => `<g transform="translate(${f2(S.cx)} ${f2(S.cy)}) rotate(${f2(S.rot)}) scale(1 ${f2(S.sy)}) translate(${f2(-S.w / 2)} ${f2(-S.h / 2)})">${inner}</g>`;
const sheetPt = (S, p) => { // local sheet point -> world
  const lx = p[0] - S.w / 2, ly = (p[1] - S.h / 2) * S.sy, r = (S.rot * Math.PI) / 180;
  return [S.cx + lx * Math.cos(r) - ly * Math.sin(r), S.cy + lx * Math.sin(r) + ly * Math.cos(r)];
};

function S01(t) {
  const r = ramp(t, 0, 4.5, E.sine);
  const c = { x: -40 * r, y: 70 * r, zoom: 1 + 0.1 * r };
  const S = sheetTf(t);
  const slide = ramp(t, 4.95, 5.5, E.in) * 900;
  // press dynamics
  const sq = pulse(t, T.press, 0.1);
  const [shx, shy] = shake(t, T.press, 2, 3, 2);
  const kS = S.w / 680;
  const sign = ramp(t, -0.6, T.brush - 0.02, E.lin) * 0.4 + 0.6;
  const printOn = t >= T.lift - 0.02;
  const wet = printOn ? 1 - ramp(t, T.lift, T.lift + 1.2) * 0.6 : 0;
  let s = full('#2A1E17');
  s += L(c, 1, `<g transform="translate(-240 ${f2(-200 + slide)})">${S01_TABLE}</g>`, { id: 't01table', bleed: 'all' });
  // props on the table: inkstone (upper right), paste dish (right), the brush on the stone after 1.0 s
  let props = `<g transform="translate(0 ${f2(slide)})">`;
  props += `<g filter="url(#t01sh)" opacity="0.5"><rect x="1500" y="190" width="372" height="250" rx="34" fill="#000"/></g>`;
  props += inkstone(1490, 170, 372);
  props += pasteDish(1660, 640, 120);
  const brushLaid = t >= 1.05;
  if (brushLaid) props += brushSVG([1560, 392], [1880, 250], 14);
  props += '</g>';
  s += L(c, 1, `<defs><filter id="t01sh" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="14"/></filter></defs>` + props, { id: 't01props', bleed: 'r' });
  // the sheet
  let sheetInner = xiushu({ w: S.w, h: S.h, id: 't01xa', sign, print: printOn ? 1 : 0, wet });
  // paper dent at the press
  if (sq > 0) sheetInner += `<ellipse cx="${f2(XS.anchor('print', S.w, S.h)[0])}" cy="${f2(XS.anchor('print', S.w, S.h)[1])}" rx="${f2(150 * kS)}" ry="${f2(190 * kS)}" fill="#3a2a1c" opacity="${f2(0.12 * sq)}"/>`;
  // ink spatter at the flick
  if (t >= T.brush) {
    const [sx, sy] = XS.anchor('sign', S.w, S.h);
    sheetInner += [[64, -40, 4.5], [86, -58, 3], [102, -30, 2.4]].map(([dx, dy, rr]) => `<circle cx="${f2(sx + dx * kS)}" cy="${f2(sy + dy * kS)}" r="${f2(rr * kS * clamp((t - T.brush) * 20))}" fill="${INK}"/>`).join('');
  }
  s += L(c, 1, `<g transform="translate(${f2(shx * (t < T.press + 0.1 ? 1 : 0))} ${f2(shy * (t < T.press + 0.1 ? 1 : 0))})"><g filter="url(#t01sh)" opacity="0.35" transform="translate(10 16)">${sheetG(S, `<rect width="${S.w}" height="${S.h}" fill="#000"/>`)}</g>${sheetG(S, sheetInner)}</g>`, { id: 't01sheet' });

  // his hand: positions over time (world coords at d 1.12)
  const signP = sheetPt(S, XS.anchor('sign', S.w, S.h)), printP = sheetPt(S, XS.anchor('print', S.w, S.h));
  let hand = '';
  if (t < 4.6) {
    if (t < 1.05) {
      // writing grip: the tip finishes the flourish, flicks off at 0.337, then carries the brush to the inkstone
      const kS2 = S.w / 680;
      const sg = 0.6 + 0.4 * ramp(t, -0.6, T.brush - 0.02, E.lin);
      const tipW = [signP[0] - 70 * kS2 + 150 * kS2 * sg, signP[1] + 30 * kS2];
      const flick = ramp(t, T.brush - 0.04, T.brush + 0.14, E.out);
      const toStone = ramp(t, 0.42, 1.0, E.inOut);
      let tip = mix(tipW, [tipW[0] + 50, tipW[1] - 40], flick);
      tip = mix(tip, [1520, 300], toStone);
      let top = [tip[0] + 150, tip[1] + 300];
      const lay = ramp(t, 0.82, 1.05, E.inOut);
      tip = mix(tip, [1560, 392], lay); top = mix(top, [1880, 250], lay);
      hand += brushSVG(tip, top, 14);
      const wrist = [tip[0] + 118 + 40 * toStone, tip[1] + 252 - 20 * toStone];
      hand += handAt('brush', wrist[0], wrist[1], 300, -24 + 10 * toStone);
    } else {
      // flat hand: to the dish, press into the paste, to the print spot, hover, press, hold, lift away
      const dishP = [1660, 690], hover = [printP[0] + 20, printP[1] - 40];
      let p, lift = 0;
      if (t < 1.6) { p = mix([1600, 480], dishP, ramp(t, 1.05, 1.6)); lift = 0.4 * (1 - ramp(t, 1.05, 1.6)); }
      else if (t < 2.0) { p = dishP; lift = -0.05 * pulse(t, 1.65, 0.3); }
      else if (t < 2.43) { p = mix(dishP, hover, ramp(t, 2.0, 2.43)); lift = 0.5 * Math.sin(ramp(t, 2.0, 2.43, E.lin) * Math.PI); }
      else if (t < T.press) { const tr = noise1(t * 14, 3) * 3; p = [hover[0] + tr, hover[1] - 20 * ramp(t, 2.43, 2.75) + 20 * ramp(t, 2.75, T.press, E.in) + noise1(t * 13, 7) * 2.5]; lift = 0.22 * (1 - ramp(t, 2.43, T.press, E.in)); }
      else if (t < T.lift) { p = [hover[0], hover[1]]; lift = 0; }
      else { const k = ramp(t, T.lift, 4.12, E.inOut); p = mix(hover, [1700, 1300], k); lift = Math.min(1, k * 2.5); }
      const sc = 1 + lift * 0.12;
      const sqx = 1 + sq * 0.04, sqy = 1 - sq * 0.05;
      // wrist below the palm centre; palm centre ~ 45 units above the wrist
      const len = 360 * sc;
      hand += `<g filter="url(#t01sh)" opacity="${f2(0.35 * (1 - lift))}" transform="translate(${f2(18 + lift * 60)} ${f2(26 + lift * 80)})">${handAt('flat', p[0], p[1] + len * 0.48, len, -6, sqx, sqy).replace(/fill="[^"]*"/g, 'fill="#000"')}</g>`;
      // red palm when it has been in the dish: tint the fingertips' edge (seen from above only a rim)
      hand += handAt('flat', p[0], p[1] + len * 0.48, len, -6, sqx, sqy);
    }
  }
  s += L(c, 1.12, `<g transform="translate(${f2(t < T.press + 0.1 ? shx : 0)} ${f2(t < T.press + 0.1 ? shy : 0)})">${hand}</g>`, { id: 't01hand', bleed: 'b' });
  // her fingertips enter at the top left and take the edge (4.505)
  if (t >= T.her - 0.3) {
    const k = ramp(t, T.her - 0.3, T.her + 0.25, E.out);
    const edge = sheetPt(S, [150 * kS, 0]), edge2 = sheetPt(S, [S.w - 150 * kS, 0]);
    const fin = (pt, flip) => {
      const y = pt[1] - 140 * (1 - k);
      return `<g transform="translate(${f2(pt[0])} ${f2(y)}) rotate(${f2(S.rot)}) scale(${flip ? -1 : 1} 1)">` +
        `<path d="M-80,-420 L80,-420 L66,-70 L-62,-70Z" fill="${COLW.coat}" ${ln(2.4)}/><path d="M-64,-86 L66,-86 L66,-66 L-62,-66Z" fill="${COLW.trim}" ${ln(2)}/>` +
        `<path d="M-56,-72 C-60,-40 -50,-8 -30,4 C-6,16 30,12 46,-6 C58,-24 58,-52 52,-72Z" fill="${COLW.skin}" ${ln(2.2)}/>` +
        `<path d="M-40,-14 C-44,10 -38,40 -24,58 C-14,68 2,64 4,50 C4,30 -2,6 -10,-10Z" fill="${COLW.skin}" ${ln(2.2)}/>` +
        `<path d="M-30,30 C-24,34 -14,34 -8,30" fill="none" stroke="${COLW.skinS}" stroke-width="1.8"/>` +
        `<path d="M-16,-40 C0,-46 20,-46 36,-40" fill="none" stroke="${COLW.skinS}" stroke-width="1.8"/></g>`;
    };
    s += L(c, 1.1, fin(edge, false) + fin(edge2, true), { id: 't01herfingers', bleed: 't' });
  }
  // cangue edge and its shadow across the frame top (his board, very close, blurred)
  s += L(c, 1.5, `<path d="M-300,-260 L2300,-260 L2300,-40 C1800,10 600,10 -300,-60Z" fill="#6E4F33"/><path d="M-300,-60 C600,10 1800,10 2300,-40 L2300,-10 C1800,40 600,40 -300,-30Z" fill="#4B4F55"/>`, { id: 't01cangue', blur: 10, bleed: 'all' });
  s += s01Light(c);
  // dust in the shaft
  s += motes(t, { seed: 21, n: 26, area: [200, 0, 1500, 820], color: '#FFF4DC', op: 0.55 });
  return s;
}

// ============================================================== tavern back wall (S02, S03): warm wood, bright doorway
const TAVERN = bake('t01tavern', 2600, 1500, (() => {
  let s = `<defs>${lg('t01door', [[0, '#FFFBEF'], [1, '#FFE9C2']])}${rg('t01doorglow', [[0, '#FFF1D2', 0.85], [1, '#FFE0A8', 0]])}<filter id="t01tb" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="9"/></filter></defs>`;
  s += `<g filter="url(#t01tb)"><rect width="2600" height="1500" fill="#3E2B1F"/>`;
  for (let i = 0; i < 18; i++) s += `<rect x="${i * 150}" y="0" width="146" height="1500" fill="${['#46311F', '#3F2C1D', '#4A3422'][i % 3]}"/>`;
  s += `<rect x="0" y="980" width="2600" height="520" fill="#2E2018"/>`;
  // bright doorway with the street glare, a curtain strip
  s += `<rect x="1440" y="120" width="560" height="980" fill="url(#t01door)"/><rect x="1400" y="80" width="40" height="1060" fill="#2A1C14"/><rect x="2000" y="80" width="40" height="1060" fill="#2A1C14"/><rect x="1400" y="80" width="640" height="50" fill="#2A1C14"/>`;
  s += `<rect x="1480" y="130" width="140" height="300" fill="#C8372D" opacity="0.7"/>`;
  s += `<ellipse cx="1720" cy="620" rx="620" ry="700" fill="url(#t01doorglow)"/>`;
  // lattice window on the left wall, dim
  s += `<rect x="260" y="200" width="420" height="380" fill="#C9A26A" opacity="0.5"/>`;
  for (let i = 1; i < 6; i++) s += `<rect x="${260 + i * 70}" y="200" width="8" height="380" fill="#2A1C14"/><rect x="260" y="${200 + i * 63}" width="420" height="8" fill="#2A1C14"/>`;
  // a table edge and jar silhouettes
  s += `<rect x="0" y="900" width="1300" height="40" fill="#24180F"/><ellipse cx="420" cy="860" rx="60" ry="70" fill="#2A1E16"/><ellipse cx="560" cy="880" rx="40" ry="50" fill="#33241A"/>`;
  s += `</g>`;
  return s;
})());

// ============================================================== S02 · over her shoulder, the tear on 休
function S02(t) {
  const push = ramp(t, T.s2, 9.4, E.inOut);
  const toHim = ramp(t, 9.45, 10.05, E.inOut);
  const focus = ramp(t, 9.5, 9.91, E.inOut); // focusD 1.0 -> 0.7
  const base = { x: 60 * push, y: -40 * push, zoom: 1 + 0.06 * push };
  // at the end, glide toward his face (the dissolve into S03 finishes the move)
  const c = { x: base.x + 40 * toHim, y: base.y + 10 * toHim, zoom: base.zoom + 0.22 * toHim, blurK: 8, focusD: 1 - 0.3 * focus };
  const S = sheetTf(t);
  const lower = ramp(t, 9.08, 9.7, E.inOut);
  const tremble = t > 5.76 && t < 7.0 ? 1 : t >= 7.0 && t < 7.3 ? 1 - (t - 7) / 0.3 : 0;
  const jx = Math.sin(t * 6 * 2 * Math.PI) * 1.5 * tremble, jy = Math.cos(t * 6 * 2 * Math.PI + 1) * 1.0 * tremble;
  let s = full('#3E2B1F');
  s += L(c, 0.4, `<g transform="translate(-340 -210)">${TAVERN}</g>`, { id: 't01tav', bleed: 'all', blur: 0 });
  // him behind the paper (d 0.7): convict, cangue; face hidden until the paper lowers
  const himE = { ...EX.隐忍, look: [-0.25, 0.25 - 0.3 * lower], eye: 0.8 };
  s += L(c, 0.7, lin({ ...CONVICT, expr: himE, pose: { headTurn: -0.2, headTilt: -2 }, height: 1760, x: 1010, y: 1950 }), { id: 't01him2' });
  // the sheet, held by her hands; lowering = scaleY about the bottom edge
  const sy = 1 - 0.4 * lower;
  const kS = S.w / 680;
  const bloom = ramp(t, T.tear, T.tear + 1.2, E.out);
  const crumple = ramp(t, T.crumple, T.crumple + 0.27, E.out);
  let sheetInner = xiushu({ w: S.w, h: S.h, id: 't01xb', sign: 1, print: 1, bloom, crumple, back: 1 });
  // back-lit glow at the edges
  const tf = `translate(${f2(jx)} ${f2(jy + lower * 70)})`;
  const S2 = { ...S, sy: S.sy * sy, cy: S.y + S.h * (1 - (S.sy * sy) / 2) };
  if (S.k < 1) S2.cy = S.cy; // during the lift keep the lift geometry
  let paper = sheetG(S2, sheetInner);
  // her hands at the lower corners
  const gripL = sheetPt(S2, [52 * kS, S.h - 46 * kS]), gripR = sheetPt(S2, [S.w - 52 * kS, S.h - 46 * kS]);
  const hk = ramp(t, 5.2, 5.6, E.out);
  const hands = wifeHandGrip({ x: gripL[0], y: gripL[1] + 160 * (1 - hk), size: 300, side: 'L', squeeze: crumple, shadow: true }) +
    wifeHandGrip({ x: gripR[0], y: gripR[1] + 160 * (1 - hk), size: 300, side: 'R', squeeze: crumple, shadow: true });
  // falling tear (from above the frame onto 休)
  let tear = '';
  const xiu = sheetPt(S2, XS.anchor('休', S.w, S.h));
  if (t > T.tear - 0.28 && t < T.tear + 0.05) {
    const k = ramp(t, T.tear - 0.28, T.tear, E.in);
    const ty = lerp(-80, xiu[1] + 14, k);
    tear = `<ellipse cx="${f2(xiu[0])}" cy="${f2(ty)}" rx="9" ry="${f2(14 + 16 * k)}" fill="#E8F3FA" opacity="0.85" stroke="#9cc8de" stroke-width="1.5"/>`;
  }
  if (t >= T.tear && t < T.tear + 0.2) {
    const k = ramp(t, T.tear, T.tear + 0.2, E.out);
    tear += [0, 1, 2, 3, 4].map((i) => { const a = i * 1.26 + 0.4; return `<circle cx="${f2(xiu[0] + Math.cos(a) * 30 * k)}" cy="${f2(xiu[1] + 14 + Math.sin(a) * 18 * k)}" r="${f2(4 * (1 - k))}" fill="#DDEFF8"/>`; }).join('');
  }
  s += L(c, 1, `<g transform="${tf}">${paper}${hands}</g>${tear}`, { id: 't01paper2', bleed: 'b' });
  // her 高髻, hairpin and shoulder, soft in the top-left foreground
  s += L(c, 1.5, wifeBack({ x: 190, y: 40, head: 560, tilt: -8, bow: 0.15 + 0.2 * lower }), { id: 't01herfg', blur: 14, bleed: 'all' });
  // warm back-light bloom around the paper edge
  s += L(c, 1, `<defs>${rg('t01bl', [[0, '#FFE9C0', 0.35], [1, '#FFE9C0', 0]])}</defs><ellipse cx="1000" cy="420" rx="700" ry="520" fill="url(#t01bl)" style="mix-blend-mode:screen"/>`, { id: 't01bloom2', bleed: 'all' });
  return s;
}

// ============================================================== S03 · his close-up, holding back tears
function S03(t) {
  const push = ramp(t, T.s3 - 0.3, T.s4, E.inOut);
  const out = ramp(t, 14.05, 14.75, E.in); // dolly-out start (he rises)
  const c = { x: 40 * push, y: 0, zoom: (1 + 0.05 * push) * (1 - 0.32 * out), blurK: 6, focusD: 1 };
  // expression timeline
  let open = 0, look = [-0.35, 0.15], jaw = 0.4, tear = 0;
  if (t < 10.33) open = 0.1 * (1 - ramp(t, 10.1, 10.33));
  look = mix([-0.35, 0.15], [-0.2, 0.75], ramp(t, 11.162, 11.5, E.out));
  jaw = mix(0.4, 1, ramp(t, 12.41, 12.6));
  tear = ramp(t, T.spill, 13.66, E.in);
  const ex = { ...EX.隐忍, brow: -0.6, eye: 0.78 - 0.08 * ramp(t, 11.162, 11.5), look, open, jaw, tear, mouth: -0.35 };
  const rise = out * 260;
  let s = full('#3E2B1F');
  s += L(c, 0.4, `<g transform="translate(-330 -230)">${TAVERN}</g>`, { id: 't01tav3', bleed: 'all' });
  // him: CU H = 540 -> height 4050; eyes ≈ (1240, 400)
  const blink = t > 13.95 && t < 14.05 ? 0.1 : 1;
  s += L(c, 1, lin({ ...CONVICT, expr: { ...ex, eye: ex.eye * blink }, pose: { headTurn: -0.32, headTilt: -1.5 }, height: 4050, x: 1235, y: 4050 + 140 - rise }), { id: 't01him3', bleed: 'b' });
  // the guard's rough hand on his shoulder (13.665)
  if (t >= T.guardHand - 0.35) {
    const k = ramp(t, T.guardHand - 0.35, T.guardHand, E.out);
    s += L(c, 1.05, guardHand(lerp(2200, 1640, k), 900 - rise + 8 * pulse(t, T.guardHand, 0.15), 300, 196, false, 0), { id: 't01gh', bleed: 'r' });
  }
  // her shoulder and 高髻 soft at the left edge
  s += L(c, 1.5, wifeBack({ x: 70, y: 160, head: 520, tilt: -10, bow: 0.3 }), { id: 't01her3', blur: 14, bleed: 'all' });
  s += motes(t, { seed: 33, n: 18, area: [700, 0, 1920, 800], color: '#FFF4DC', op: 0.45 });
  return s;
}

// ============================================================== S04 · the street, summer noon, over her shoulder
const VP = [1150, 430];
const STREET = bake('t01street', 2400, 1300, (() => {
  // world origin offset: this image is placed at (-240, -110)
  const ox = 240, oy = 110;
  const X = (x) => x + ox, Y = (y) => y + oy;
  let s = `<defs>${lg('t01sky', [[0, '#F4EFE2'], [1, '#FAF6EC']])}${lg('t01road', [[0, '#E2D2AE'], [1, '#E9DBBB']])}</defs>`;
  s += `<rect width="2400" height="1300" fill="url(#t01sky)"/>`;
  // road plane
  s += `<path d="M${X(VP[0] - 30)},${Y(430)} L${X(VP[0] + 30)},${Y(430)} L${X(2600)},${Y(1200)} L${X(-500)},${Y(1200)}Z" fill="url(#t01road)"/>`;
  s += `<rect x="0" y="${Y(430)}" width="2400" height="900" fill="url(#t01road)" opacity="0.6"/>`;
  // ruts
  for (const dx of [-0.25, 0.25]) s += `<path d="M${X(VP[0])},${Y(430)} L${X(VP[0] + dx * 1800)},${Y(1200)}" stroke="#CDBB93" stroke-width="10" opacity="0.5"/>`;
  // buildings both sides: receding blocks with tiled eaves and lattice shopfronts
  const side = (sgn) => {
    let g = '';
    for (let i = 0; i < 9; i++) {
      const d0 = 1 / (1 + i * 0.55), d1 = 1 / (1 + (i + 1) * 0.55);
      const xa = VP[0] + sgn * 980 * d0, xb = VP[0] + sgn * 980 * d1;
      const ta = 430 - 520 * d0, tb = 430 - 520 * d1, ba = 430 + 330 * d0, bb = 430 + 330 * d1;
      const wall = ['#D9CDB4', '#CFC2A6', '#DED3BC'][i % 3];
      g += `<path d="M${X(xa)},${Y(ta + 60 * d0)} L${X(xb)},${Y(tb + 60 * d1)} L${X(xb)},${Y(bb)} L${X(xa)},${Y(ba)}Z" fill="${wall}" stroke="#8a7a62" stroke-width="2"/>`;
      // shopfront lattice
      const lx0 = lerp(xa, xb, 0.12), lx1 = lerp(xa, xb, 0.88);
      const y0a = lerp(ta + 60 * d0, ba, 0.35), y1a = lerp(ta + 60 * d0, ba, 0.95);
      const y0b = lerp(tb + 60 * d1, bb, 0.35), y1b = lerp(tb + 60 * d1, bb, 0.95);
      g += `<path d="M${X(lx0)},${Y(lerp(y0a, y0b, 0.12))} L${X(lx1)},${Y(lerp(y0a, y0b, 0.88))} L${X(lx1)},${Y(lerp(y1a, y1b, 0.88))} L${X(lx0)},${Y(lerp(y1a, y1b, 0.12))}Z" fill="#7A5A3A" opacity="0.85"/>`;
      for (let j = 1; j < 5; j++) { const xx = lerp(lx0, lx1, j / 5), kk = lerp(0.12, 0.88, j / 5); g += `<path d="M${X(xx)},${Y(lerp(y0a, y0b, kk))} L${X(xx)},${Y(lerp(y1a, y1b, kk))}" stroke="#E8DCC2" stroke-width="${f2(3 * d0)}"/>`; }
      // tiled eave (dark grey, upturned)
      g += `<path d="M${X(xa + sgn * 40 * d0)},${Y(ta + 70 * d0)} L${X(xb + sgn * 40 * d1)},${Y(tb + 70 * d1)} L${X(xb - sgn * 10 * d1)},${Y(tb + 20 * d1)} L${X(xa - sgn * 10 * d0)},${Y(ta + 10 * d0)}Z" fill="#4F5A63" stroke="#2F363C" stroke-width="2"/>`;
      g += `<path d="M${X(xa + sgn * 40 * d0)},${Y(ta + 70 * d0)} q${f2(sgn * 18 * d0)},${f2(-14 * d0)} ${f2(sgn * 30 * d0)},${f2(-30 * d0)}" stroke="#2F363C" stroke-width="${f2(5 * d0)}" fill="none"/>`;
      // a roof above
      g += `<path d="M${X(xa - sgn * 10 * d0)},${Y(ta + 10 * d0)} L${X(xb - sgn * 10 * d1)},${Y(tb + 20 * d1)} L${X(xb - sgn * 120 * d1)},${Y(tb - 40 * d1)} L${X(xa - sgn * 120 * d0)},${Y(ta - 60 * d0)}Z" fill="#5C6770" stroke="#2F363C" stroke-width="2"/>`;
    }
    return g;
  };
  s += side(-1) + side(1);
  // far city gate tower at the vanishing point
  s += `<path d="M${X(VP[0] - 90)},${Y(430)} L${X(VP[0] - 90)},${Y(330)} L${X(VP[0] + 90)},${Y(330)} L${X(VP[0] + 90)},${Y(430)}Z" fill="#B8AE9C"/><path d="M${X(VP[0] - 26)},${Y(430)} L${X(VP[0] - 26)},${Y(380)} Q${X(VP[0])},${Y(362)} ${X(VP[0] + 26)},${Y(380)} L${X(VP[0] + 26)},${Y(430)}Z" fill="#6E6456"/>`;
  s += `<path d="M${X(VP[0] - 120)},${Y(330)} L${X(VP[0] + 120)},${Y(330)} L${X(VP[0] + 80)},${Y(296)} L${X(VP[0] - 80)},${Y(296)}Z" fill="#5C6770"/><rect x="${X(VP[0] - 70)}" y="${Y(296)}" width="140" height="28" fill="#A8382C" opacity="0.7"/><path d="M${X(VP[0] - 100)},${Y(296)} L${X(VP[0] + 100)},${Y(296)} L${X(VP[0] + 60)},${Y(272)} L${X(VP[0] - 60)},${Y(272)}Z" fill="#4F5A63"/>`;
  // willows (right side, near) and a far one
  const willow = (x, y, h) => {
    let g = `<path d="M${X(x)},${Y(y)} C${X(x - 6)},${Y(y - h * 0.4)} ${X(x + 8)},${Y(y - h * 0.7)} ${X(x)},${Y(y - h)}" stroke="#5A4632" stroke-width="${f2(h * 0.05)}" fill="none"/>`;
    for (let i = 0; i < 16; i++) { const a = -1 + (i / 15) * 2; g += `<path d="M${X(x)},${Y(y - h)} C${X(x + a * h * 0.25)},${Y(y - h * 1.08)} ${X(x + a * h * 0.4)},${Y(y - h * 0.8)} ${X(x + a * h * 0.42)},${Y(y - h * 0.35)}" stroke="#8E9A6C" stroke-width="${f2(h * 0.025)}" fill="none" opacity="0.9"/>`; }
    return g;
  };
  s += willow(1560, 520, 230) + willow(820, 470, 120) + willow(1320, 452, 70);
  // red 酒旆 (wine banner) at x 1460
  s += `<path d="M${X(1460)},${Y(150)} L${X(1460)},${Y(420)}" stroke="#4A3626" stroke-width="7"/><path d="M${X(1462)},${Y(170)} L${X(1546)},${Y(176)} L${X(1540)},${Y(340)} L${X(1500)},${Y(322)} L${X(1462)},${Y(344)}Z" fill="#C8372D" stroke="#7a1f19" stroke-width="2"/><text x="${X(1503)}" y="${Y(262)}" font-family="Ma Shan Zheng" font-size="64" fill="#F6E7C8" text-anchor="middle" dominant-baseline="central">酒</text>`;
  return s;
})());

// 林冲 from behind (convict, cangue), walking away; look 0..1 turns the head back toward the camera-left.
function linBack(u, ph, look = 0) {
  const walk = Math.sin(ph * Math.PI * 2), bob = -Math.abs(Math.cos(ph * Math.PI * 2)) * 0.06 * u;
  const lw = Math.max(1, 0.05 * u);
  const L_ = `stroke="${LN}" stroke-width="${f2(lw)}" stroke-linejoin="round"`;
  let s = '';
  for (const sd of [-1, 1]) {
    const lift = Math.max(0, sd * walk) * 0.35 * u, x = sd * 0.34 * u;
    s += `<path d="M${P(x - 0.28 * u, -3.6 * u + bob)} L${P(x - 0.2 * u, -0.25 * u - lift)} L${P(x + 0.2 * u, -0.25 * u - lift)} L${P(x + 0.28 * u, -3.6 * u + bob)}Z" fill="#2E3240" ${L_}/>`;
    s += `<path d="M${P(x - 0.21 * u, -1.8 * u - lift * 0.5)} L${P(x - 0.19 * u, -0.22 * u - lift)} L${P(x + 0.19 * u, -0.22 * u - lift)} L${P(x + 0.21 * u, -1.8 * u - lift * 0.5)}Z" fill="#D8CFBF" ${L_}/>`;
    s += `<path d="M${P(x - 0.22 * u, -0.25 * u - lift)} L${P(x + 0.22 * u, -0.25 * u - lift)} L${P(x + 0.2 * u, -lift)} L${P(x - 0.2 * u, -lift)}Z" fill="#1E1A18" ${L_}/>`;
  }
  // robe (long, to mid-shin)
  s += `<path d="M${P(-0.98 * u, -5.9 * u + bob)} C${P(-1.08 * u, -5 * u + bob)} ${P(-0.9 * u, -4.3 * u + bob)} ${P(-0.86 * u, -4.0 * u + bob)} L${P(-1.0 * u, -1.5 * u + bob)} L${P(1.0 * u, -1.5 * u + bob)} L${P(0.86 * u, -4.0 * u + bob)} C${P(0.9 * u, -4.3 * u + bob)} ${P(1.08 * u, -5 * u + bob)} ${P(0.98 * u, -5.9 * u + bob)} C${P(0.5 * u, -6.2 * u + bob)} ${P(-0.5 * u, -6.2 * u + bob)} ${P(-0.98 * u, -5.9 * u + bob)}Z" fill="${ROBE}" ${L_}/>`;
  s += `<path d="M${P(-0.88 * u, -4.15 * u + bob)} L${P(0.88 * u, -4.15 * u + bob)} L${P(0.86 * u, -3.9 * u + bob)} L${P(-0.86 * u, -3.9 * u + bob)}Z" fill="#6E3A2C" ${L_}/>`;
  s += `<path d="M0,${f2(-3.9 * u + bob)} L0,${f2(-1.52 * u + bob)}" stroke="${ROBES}" stroke-width="${f2(lw)}"/>`;
  // arms hang (hands are free; the cangue rests on the shoulders)
  for (const sd of [-1, 1]) {
    const sw = sd * walk * 0.1 * u, x = sd * 1.0 * u;
    s += `<path d="M${P(x - 0.25 * u, -5.7 * u + bob)} L${P(x - 0.06 * u * sd - 0.08 * u, -3.5 * u + bob + sw)} L${P(x + 0.2 * u - 0.06 * u * sd, -3.5 * u + bob + sw)} L${P(x + 0.25 * u, -5.6 * u + bob)}Z" fill="${ROBES}" ${L_}/>`;
    s += `<circle cx="${f2(x)}" cy="${f2(-3.33 * u + bob + sw)}" r="${f2(0.2 * u)}" fill="${SK.skinS}" ${L_}/>`;
  }
  // neck + head from behind; plain dark head cloth with a knot
  const hx = 0, hy = -6.75 * u + bob;
  s += `<path d="M${P(-0.26 * u, hy + 0.45 * u)} L${P(-0.28 * u, hy + 0.9 * u)} L${P(0.28 * u, hy + 0.9 * u)} L${P(0.26 * u, hy + 0.45 * u)}Z" fill="${SK.skinS}" ${L_}/>`;
  // head turn: a sliver of profile on the viewer's left
  const lk = clamp(look);
  if (lk > 0) {
    s += `<path d="M${P(hx - 0.3 * u, hy - 0.1 * u)} C${P(hx - 0.42 * u - 0.12 * u * lk, hy - 0.05 * u)} ${P(hx - 0.5 * u - 0.16 * u * lk, hy + 0.18 * u)} ${P(hx - 0.44 * u - 0.1 * u * lk, hy + 0.36 * u)} L${P(hx - 0.36 * u - 0.12 * u * lk, hy + 0.66 * u)} L${P(hx - 0.1 * u, hy + 0.5 * u)}Z" fill="${SK.skin}" ${L_}/>`;
    s += `<path d="M${P(hx - 0.36 * u - 0.12 * u * lk, hy + 0.5 * u)} L${P(hx - 0.42 * u - 0.12 * u * lk, hy + 0.86 * u)} L${P(hx - 0.28 * u - 0.08 * u * lk, hy + 0.55 * u)}Z" fill="#141010"/>`;
  }
  s += `<ellipse cx="${f2(hx + 0.04 * u * lk)}" cy="${f2(hy)}" rx="${f2(0.4 * u)}" ry="${f2(0.5 * u)}" fill="#22272F" ${L_}/>`;
  s += `<ellipse cx="${f2(hx + 0.42 * u - 0.1 * u * lk)}" cy="${f2(hy + 0.08 * u)}" rx="${f2(0.08 * u)}" ry="${f2(0.14 * u)}" fill="${SK.skinS}" ${L_}/>`;
  s += `<path d="M${P(hx - 0.14 * u, hy + 0.2 * u)} L${P(hx - 0.1 * u, hy + 0.62 * u)} L${P(hx + 0.02 * u, hy + 0.28 * u)} L${P(hx + 0.14 * u, hy + 0.66 * u)} L${P(hx + 0.16 * u, hy + 0.22 * u)}Z" fill="#22272F" ${L_}/>`;
  // the cangue from behind: the board's rounded back end over the shoulders (tilted down forward)
  const cy = -5.95 * u + bob;
  s += `<path d="M${P(-0.9 * u, cy)} C${P(-0.9 * u, cy - 0.42 * u)} ${P(0.9 * u, cy - 0.42 * u)} ${P(0.9 * u, cy)} L${P(0.9 * u, cy + 0.14 * u)} C${P(0.9 * u, cy - 0.26 * u)} ${P(-0.9 * u, cy - 0.26 * u)} ${P(-0.9 * u, cy + 0.14 * u)}Z" fill="#8A6440" ${L_}/>`;
  s += `<path d="M${P(-0.9 * u, cy + 0.14 * u)} C${P(-0.9 * u, cy - 0.26 * u)} ${P(0.9 * u, cy - 0.26 * u)} ${P(0.9 * u, cy + 0.14 * u)} L${P(0.9 * u, cy + 0.26 * u)} C${P(0.9 * u, cy - 0.14 * u)} ${P(-0.9 * u, cy - 0.14 * u)} ${P(-0.9 * u, cy + 0.26 * u)}Z" fill="#5E432A" ${L_}/>`;
  s += `<path d="M${P(-0.62 * u, cy - 0.22 * u)} L${P(-0.5 * u, cy + 0.16 * u)} M${P(0.62 * u, cy - 0.22 * u)} L${P(0.5 * u, cy + 0.16 * u)}" stroke="#4B4F55" stroke-width="${f2(0.12 * u)}"/>`;
  return s;
}

function S04(t) {
  const back = ramp(t, 14.3, 15.6, E.out);
  const c = { x: -20 * (1 - back), y: -10 * (1 - back), zoom: 1.12 - 0.12 * back };
  let s = full('#F4EFE2');
  s += L(c, 0.3, `<g transform="translate(-240 -110)">${STREET}</g>`, { id: 't01street', bleed: 'all' });
  // heat shimmer band over the road (subtle)
  const sh = Math.sin(t * Math.PI) * 2;
  s += L(c, 0.3, `<rect x="400" y="${f2(436 + sh)}" width="1500" height="16" fill="#FAF6EC" opacity="0.35"/>`, { id: 't01shimmer' });
  // the three men walk away toward the vanishing point
  const k = ramp(t, T.s4 - 0.3, 18.66, E.lin);
  const yf = lerp(684, 655, k);
  const sc = (yf - 430) / 254; // relative to start
  const H = (base) => base * (yf - 430) / 250 * (250 / 254);
  const X = (x0) => VP[0] + (x0 - VP[0]) * sc;
  const step = (t - 14.92) / (2 * 0.4176);
  const ph = step / 2;
  let men = '';
  // looking back (16.997), nudged on at 17.82
  const look = ramp(t, T.look, T.look + 0.25, E.out) * (1 - ramp(t, T.nudge, T.nudge + 0.3, E.inOut));
  const gL = guard({ view: 'back', x: X(1196), y: yf - 2, height: H(287), phase: ph + 0.5, staff: 'shoulder', tone: 0 });
  const gR = guard({ view: 'back', x: X(1404), y: yf + 2, height: H(287), phase: ph + 0.25, staff: t > T.nudge - 0.3 && t < T.nudge + 0.5 ? 'hand' : 'shoulder', tone: 1 });
  const u = H(300) / 7.5;
  const me = `<g transform="translate(${f2(X(1300))} ${f2(yf)})">${linBack(u, ph, look)}</g>`;
  // dust puffs at steps
  let dust = '';
  for (let i = 0; i < 6; i++) {
    const ts = 14.92 + i * 0.835, a = t - ts;
    if (a > 0 && a < 0.6) dust += `<ellipse cx="${f2(X(1300) + (i % 2 ? 12 : -12))}" cy="${f2(yf - 3)}" rx="${f2(10 + a * 40)}" ry="${f2(3 + a * 8)}" fill="#D8C7A0" opacity="${f2(0.5 * (1 - a / 0.6))}"/>`;
  }
  men += dust + gL + me + gR;
  s += L(c, 0.8, men, { id: 't01men' });
  // the doorway: dark interior frame with the two posts
  const frame = `<path d="M-400,-400 L2400,-400 L2400,1500 L-400,1500Z M250,40 L1710,40 L1710,1500 L250,1500Z" fill="#2A1E17" fill-rule="evenodd"/>` +
    `<rect x="250" y="20" width="60" height="1480" fill="#4A3426"/><rect x="1650" y="20" width="60" height="1480" fill="#4A3426"/><rect x="230" y="0" width="1500" height="56" fill="#3A281C"/>` +
    `<rect x="290" y="20" width="14" height="1480" fill="#5E4330"/><rect x="1690" y="20" width="14" height="1480" fill="#5E4330"/>` +
    `<rect x="250" y="40" width="1460" height="20" fill="#24180F" opacity="0.6"/>`;
  s += L(c, 1.3, frame, { id: 't01doorframe', bleed: 'all' });
  // her: back view in the foreground left, hand on the door post; slides down to kneel at 16.161
  const sl = ramp(t, T.slide, T.slide + 0.84, (x) => (x < 0.7 ? E.in(x / 0.7) * 0.85 : 0.85 + 0.15 * E.out((x - 0.7) / 0.3)));
  const wy = 324 + sl * 300, wx = 520 - sl * 30;
  const handY = 470 + sl * 300;
  s += L(c, 1.5, wifeBack({ x: wx, y: wy, head: 179, tilt: -4 - 6 * sl, bow: 0.1 + 0.55 * sl, slump: 0.6 * sl, armL: { to: [318, handY] } }) +
    // her fingers wrap the post's edge
    `<path d="M${P(300, handY - 22)} C${P(318, handY - 26)} ${P(330, handY - 14)} ${P(328, handY + 6)} L${P(300, handY + 10)}Z" fill="${COLW.skin}" stroke="${LN}" stroke-width="2"/>`, { id: 't01her4', bleed: 'b' });
  // warm rim on her back from the street glare (a light wash on the right edge)
  return s;
}

// ============================================================== the take
const X1 = [4.95, 5.5], X2 = [9.75, 10.1], X3 = [14.3, 14.72];
const blend = (A, B, k) => `<g>${A}</g><g opacity="${f2(k)}">${B}</g>`;

export default {
  frame(t) {
    if (t < X1[0]) return S01(t);
    if (t < X1[1]) return blend(S01(t), S02(t), ramp(t, X1[0] + 0.1, X1[1], E.inOut));
    if (t < X2[0]) return S02(t);
    if (t < X2[1]) return blend(S02(t), S03(t), ramp(t, X2[0], X2[1], E.inOut));
    if (t < X3[0]) return S03(t);
    if (t < X3[1]) return blend(S03(t), S04(t), ramp(t, X3[0], X3[1], E.inOut));
    return S04(t);
  },
};
