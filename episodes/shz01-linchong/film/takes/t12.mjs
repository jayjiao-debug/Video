// T12 · 115.217–125.620 · S29 the tear → (rack focus) → S30 the window (builder F)
// storyboard_v3 TAKE 12, colour C10, film/timing.md.
// MC3 in at 115.217: T11's ink drip ends at (642, 470); the tear is at that point at the cut and rolls on down the cheek.
// A 3-frame crossover (enter) joins them. S29 → S30 is one camera: the window is behind him from the start (it is the
// cold side light); on 116.878 the focus racks from his face to the window while the camera trucks right.
// The window-frame dissolve into T13 (124.78–125.62) is owned by T13; this take renders through 125.7.
import { L, ramp, E, bake, lerp, f2, clamp } from '../lib.mjs';
import { lin, EX } from '../../chars/rig/linchong.mjs';
import { latticeWindow, winGlow } from '../cast/window.mjs';
import { banquetShadows, lanternBoatShadow } from '../cast/liangshan.mjs';
import { DRIP, dripHead } from './t11.mjs';

const T29 = 115.217, T30 = 116.878, RACK = 14 / 30;
const LS_COL = { robe: '#2E3446', sash: '#4A3A30' };
// face: CU 3/4, head unit ≈ 587 px (storyboard H ≈ 600); eye y ≈ 330 so the beard ends above the subtitle band
const FACE = { x: 704, y: 4403, height: 4400 };
const PAN = 300; // camera truck right during the rack (px at d 1)
const hx = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
const cmix = (a, b, k) => '#' + hx(a).map((v, i) => Math.round(lerp(v, hx(b)[i], clamp(k))).toString(16).padStart(2, '0')).join('');

// window at d 0.6, placed so it lands on x 980 after the truck (the S30 rectangle T13 dissolves from)
const WD = 0.6, WW = 480, WH = 576, WX = 980 + PAN * WD, WY = 196;
const WALL = bake('t12_wall', 2600, 1400, `
  <defs><radialGradient id="t12wl" cx="0.62" cy="0.42" r="0.7"><stop offset="0" stop-color="#2E3646"/><stop offset="1" stop-color="#161A23"/></radialGradient></defs>
  <rect width="2600" height="1400" fill="url(#t12wl)"/>
  <rect y="1110" width="2600" height="290" fill="#141820"/>
`);

function faceExpr(t) {
  const bl = ramp(t, 116.46, 116.6, E.inOut) - ramp(t, 116.6, 116.74, E.inOut); // slow blink
  const lift = ramp(t, T30, T30 + 0.3, E.out); // eyes lift to the window
  return { ...EX.悲, tear: 0, open: 0, mouth: -0.55, eye: 0.7 * (1 - bl) + lift * 0.15, look: [lerp(-0.1, 0.55, lift), lerp(0.55, -0.25, lift)], brow: lerp(0.95, 0.75, lift) };
}
const faceSVG = (t, sink) => lin({ view: 'front', costume: 'A', x: FACE.x, y: FACE.y + sink, height: FACE.height, col: LS_COL, headCloth: 'plain', expr: faceExpr(t), pose: { headTurn: 0.3, headTilt: -2 } });
// after the rack the face is a still, soft foreground: bake it once at the final blur
const FACE_SOFT = bake('t12_facesoft', 1500, 1300, `<g filter="url(#t12fb)">${faceSVG(T30 + 1, 10)}</g>`,
  { defs: `<filter id="t12fb" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="12"/></filter>` });

function tear(t) {
  // at the cut the tear is where the drip ended (642, 470); it rolls on to the jaw by 116.04, a wet trail above it
  if (t < DRIP.t1 - 0.12) return '';
  const y1 = t < T29 ? dripHead(t) : lerp(DRIP.y1, 600, ramp(t, T29, 116.04, (x) => x * (0.7 + 0.3 * x)));
  const x0 = DRIP.x, ye = 342;
  const tx = x0 - 10 * Math.sin(clamp((y1 - DRIP.y1) / 130) * Math.PI * 0.6);
  let s = `<path d="M${x0},${ye} C${x0 - 2},${f2((ye + y1) / 2)} ${f2(tx - 3)},${f2(y1 - 30)} ${f2(tx)},${f2(y1 - 8)}" stroke="#EAF6FF" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.5"/>`;
  s += `<path d="M${f2(tx)},${f2(y1 - 16)} C${f2(tx - 9)},${f2(y1 - 2)} ${f2(tx - 7)},${f2(y1 + 9)} ${f2(tx)},${f2(y1 + 9)} C${f2(tx + 7)},${f2(y1 + 9)} ${f2(tx + 9)},${f2(y1 - 2)} ${f2(tx)},${f2(y1 - 16)}Z" fill="#EAF6FF" stroke="#9CC4DA" stroke-width="1.5" opacity="0.94"/>`;
  s += `<circle cx="${f2(tx - 2.5)}" cy="${f2(y1 + 1)}" r="2.6" fill="#FFFFFF"/>`;
  return s;
}

function scene(t) {
  const rack = ramp(t, T30, T30 + RACK, E.inOut);
  const push = ramp(t, T30 + RACK, 125.6, E.sine);
  const creep = lerp(1, 1.03, ramp(t, T29, T30, E.sine));
  const c = { x: PAN * rack, y: 0, zoom: creep * (1 + 0.1 * push) };
  const sink = ramp(t, 115.62, 115.95, E.inOut) * 10;
  // the window: cold and dark, lantern bloom 120.21, banquet, boat 122.29–125.2, dims as the lanterns recede
  const bloom = ramp(t, 120.21, 120.7, E.out) * (1 - 0.7 * ramp(t, 124.2, 125.6, E.inOut));
  const bow = ramp(t, 120.63, 121.25, E.inOut), toast = ramp(t, 121.46, 121.9, E.out);
  const fade = ramp(t, 120.25, 120.6) * (1 - ramp(t, 122.5, 123.4, E.inOut));
  let sh = '';
  if (fade > 0) sh += banquetShadows({ bow, toast, fade });
  if (t > 122.2 && t < 125.4) sh += lanternBoatShadow(lerp(-260, 760, ramp(t, 122.29, 125.2, E.lin)));
  const win = latticeWindow({ w: WW, h: WH, id: 't12win', glow: bloom, cold: 1 - bloom, shadows: sh, shadowBlur: 3.5, shadowCol: '#4A2810', shadowOp: 0.66 });
  const wBlur = 9 * (1 - rack); // the window is soft behind his face until the rack
  let s = L(c, 0.4, `<g transform="translate(-300 -160)">${WALL}</g>`, { id: 't12wall', bleed: 'all', blur: 0 });
  s += L(c, WD, winGlow(WX + WW / 2, WY + WH / 2, 640, 0.18 + 0.3 * bloom, cmix('#9AA6B2', '#E8A04A', bloom), 't12glow'), { id: 't12halo', bleed: 'all', blur: 0 });
  s += L(c, WD, `<g transform="translate(${WX} ${WY})">${win}</g>`, { id: 't12window', blur: wBlur });
  // his face: sharp in S29, racks soft and slides left; a baked soft still afterwards
  if (t < T30 + RACK) s += L(c, 1, faceSVG(t, sink) + tear(t), { id: 't12face', bleed: 'b', blur: 12 * rack });
  else s += L(c, 1, `<g transform="translate(0 0)">${FACE_SOFT}</g>`, { id: 't12face', bleed: 'lb', blur: 0 });
  // light: cold from the right (the window) — darker on the left; skin desaturated; the cut opens a little lifted
  s += `<defs><linearGradient id="t12sl" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#4A5468"/><stop offset="0.42" stop-color="#7C8699"/><stop offset="0.62" stop-color="#FFFFFF"/><stop offset="1" stop-color="#FFFFFF"/></linearGradient></defs>`;
  s += `<rect width="1920" height="1080" fill="url(#t12sl)" style="mix-blend-mode:multiply" opacity="${f2(0.75 - 0.25 * rack)}"/>`;
  s += `<rect width="1920" height="1080" fill="#9AA6B2" style="mix-blend-mode:saturation" opacity="0.38"/>`;
  const lift = 1 - ramp(t, T29, T29 + 0.6, E.out);
  if (lift > 0) s += `<rect width="1920" height="1080" fill="#9AA6B2" style="mix-blend-mode:screen" opacity="${f2(0.35 * lift)}"/>`;
  return s;
}

export default {
  enter: { a: DRIP.t1 - 0.1, b: DRIP.t1, type: 'dissolve' }, // 3-frame crossover at MC3: drip and tear on the same point
  frame(t) { return scene(t); },
};
