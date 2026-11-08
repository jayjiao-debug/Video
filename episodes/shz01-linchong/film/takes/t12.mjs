// T12 · 115.217–125.620 · S29 the tear → S30 the window (builder F)
// storyboard_v3 TAKE 12, colour C10, film/timing.md. MATCH CUT in at 115.217: T11's ink drip at x ≈ 640 becomes the tear.
// The window-frame dissolve into T13 (124.78–125.62) is owned by T13; this take renders through 125.7.
import { L, ramp, E, bake, lerp, f2, clamp, noise1 } from '../lib.mjs';
import { lin, EX } from '../../chars/rig/linchong.mjs';
import { latticeWindow, winGlow } from '../cast/window.mjs';
import { banquetShadows, lanternBoatShadow } from '../cast/liangshan.mjs';

const T29 = 115.217, T30 = 116.878;
const LS_COL = { robe: '#2E3446', sash: '#4A3A30' };

// =============================================================== S29 · one tear (CU 3/4, face ≈ 60 % of the frame)
const S29_BG = bake('t12_s29bg', 2000, 1160, `
  <defs><linearGradient id="t12w" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#1C212C"/><stop offset="0.6" stop-color="#2A3242"/><stop offset="1" stop-color="#46526A"/></linearGradient>
  <radialGradient id="t12win" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#9AA6B2" stop-opacity="0.75"/><stop offset="1" stop-color="#9AA6B2" stop-opacity="0"/></radialGradient></defs>
  <rect width="2000" height="1160" fill="url(#t12w)"/>
  <ellipse cx="1930" cy="470" rx="380" ry="520" fill="url(#t12win)"/>
`);
function tear(t) {
  // from the inner corner of the near eye (x ≈ 640) down the cheek to the jaw, slight acceleration
  const p = ramp(t, T29 - 0.05, 116.04, (x) => x * (0.6 + 0.4 * x));
  if (p <= 0) return '';
  const x0 = 641, y0 = 368, y1 = lerp(y0, 712, p);
  const xm = (y) => x0 - 16 * Math.sin(((y - y0) / 344) * Math.PI * 0.9);
  const tx = xm(y1);
  let s = `<path d="M${x0},${y0} Q${f2(xm((y0 + y1) / 2) - 2)},${f2((y0 + y1) / 2)} ${f2(tx)},${f2(y1 - 6)}" stroke="#EAF6FF" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.55"/>`;
  s += `<path d="M${f2(tx)},${f2(y1 - 16)} C${f2(tx - 9)},${f2(y1 - 2)} ${f2(tx - 7)},${f2(y1 + 9)} ${f2(tx)},${f2(y1 + 9)} C${f2(tx + 7)},${f2(y1 + 9)} ${f2(tx + 9)},${f2(y1 - 2)} ${f2(tx)},${f2(y1 - 16)}Z" fill="#EAF6FF" stroke="#9CC4DA" stroke-width="1.5" opacity="0.92"/>`;
  s += `<circle cx="${f2(tx - 2.5)}" cy="${f2(y1 + 1)}" r="2.6" fill="#FFFFFF"/>`;
  return s;
}
function s29(t) {
  const c = { x: 0, y: 0, zoom: lerp(1, 1.03, ramp(t, T29, T30 + 0.4, E.sine)) };
  const sink = ramp(t, 115.62, 115.95, E.inOut) * 10;
  // slow blink 116.46 (8 frames)
  const bl = ramp(t, 116.46, 116.6, E.inOut) - ramp(t, 116.6, 116.74, E.inOut);
  const lift = ramp(t, T30, T30 + 0.3, E.out);
  const ex = { ...EX.悲, tear: 0, open: 0, mouth: -0.55, eye: 0.7 * (1 - bl) + lift * 0.15, look: [lerp(-0.1, 0.5, lift), lerp(0.55, -0.25, lift)], brow: lerp(0.95, 0.75, lift) };
  let s = L(c, 0.3, `<g transform="translate(-40 -40)">${S29_BG}</g>`, { id: 't12bg', bleed: 'all' });
  const fig = lin({ view: 'front', costume: 'A', x: 721, y: 5534 + sink, height: 5600, col: LS_COL, headCloth: 'plain', expr: ex, pose: { headTurn: 0.3, headTilt: -2 } });
  s += L(c, 1, fig + `<g transform="translate(0 ${f2(sink)})">${tear(t)}</g>`, { id: 't12face', bleed: 'b' });
  // cold side light from the right (the window): darken the left, desaturate the skin
  s += `<defs><linearGradient id="t12sl" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#4A5468"/><stop offset="0.42" stop-color="#7C8699"/><stop offset="0.62" stop-color="#FFFFFF"/><stop offset="1" stop-color="#FFFFFF"/></linearGradient></defs>`;
  s += `<rect width="1920" height="1080" fill="url(#t12sl)" style="mix-blend-mode:multiply" opacity="0.75"/>`;
  s += `<rect width="1920" height="1080" fill="#9AA6B2" style="mix-blend-mode:saturation" opacity="0.38"/>`;
  return s;
}

// =============================================================== S30 · the window (MS on the window, his profile soft in the foreground)
const WX = 980, WY = 196, WW = 480, WH = 576;
const S30_WALL = bake('t12_s30wall', 2200, 1300, `
  <defs><radialGradient id="t12wl" cx="0.56" cy="0.42" r="0.7"><stop offset="0" stop-color="#2E3646"/><stop offset="1" stop-color="#161A23"/></radialGradient></defs>
  <rect width="2200" height="1300" fill="url(#t12wl)"/>
  <rect y="1020" width="2200" height="280" fill="#141820"/>
`);
// his profile, soft (d 1.3), baked blurred once
const PROFILE = bake('t12_s30prof', 1100, 1200, `<g filter="url(#t12pb)"><g transform="translate(120 60)">${lin({ view: 'side', costume: 'A', flip: true, x: 254, y: 3770, height: 3600, col: LS_COL, headCloth: 'plain', expr: { ...EX.悲, tear: 0, eye: 0.75, look: [0.6, -0.2] } })}</g></g>`,
  { defs: `<filter id="t12pb" x="-10%" y="-10%" width="120%" height="120%" color-interpolation-filters="sRGB"><feGaussianBlur stdDeviation="11"/><feColorMatrix type="matrix" values="0.42 0.06 0.06 0 0.02  0.05 0.44 0.07 0 0.03  0.06 0.08 0.55 0 0.06  0 0 0 1 0"/></filter>` });
function s30(t) {
  const z = lerp(1, 1.1, ramp(t, T30, 125.6, E.sine));
  const wc = [WX + WW / 2, WY + WH / 2];
  const c = { x: (wc[0] - 960) * (1 - 1 / z) * 0, y: 0, zoom: z };
  // lantern bloom 120.210; banquet; boat shadow 122.29–125.2; the paper dims as the lanterns recede
  const bloom = ramp(t, 120.21, 120.7, E.out) * (1 - 0.7 * ramp(t, 124.2, 125.6, E.inOut));
  const bow = ramp(t, 120.63, 121.25, E.inOut);
  const toast = ramp(t, 121.46, 121.9, E.out);
  const fade = ramp(t, 120.25, 120.6) * (1 - ramp(t, 122.5, 123.4, E.inOut));
  const bx = lerp(-260, 760, ramp(t, 122.29, 125.2, E.lin));
  let sh = '';
  if (fade > 0) sh += banquetShadows({ bow, toast, fade });
  if (t > 122.2 && t < 125.4) sh += lanternBoatShadow(bx);
  const win = latticeWindow({ w: WW, h: WH, id: 't12win', glow: bloom, cold: 1 - bloom, shadows: sh, shadowBlur: 3.5, shadowCol: '#4A2810', shadowOp: 0.66 });
  let s = L(c, 0.6, `<g transform="translate(-140 -110)">${S30_WALL}</g>`, { id: 't12wall', bleed: 'all' });
  if (bloom > 0.01) s += L(c, 0.8, winGlow(wc[0], wc[1], 620, 0.42 * bloom, '#E8A04A', 't12glow'), { id: 't12halo', bleed: 'all' });
  s += L(c, 0.8, `<g transform="translate(${WX} ${WY})">${win}</g>`, { id: 't12window' });
  // lattice light on the floor/wall below when the lanterns glow
  s += L(c, 1.3, `<g transform="translate(-120 -60)">${PROFILE}</g>`, { id: 't12prof', bleed: 'lb' });
  return s;
}

export default {
  frame(t) {
    if (t < T30) return s29(t);
    if (t < T30 + 0.47) {
      // rack focus along his lifted eye-line to the window: the face goes soft and slides left, the window comes up
      const k = ramp(t, T30, T30 + 0.47, E.inOut);
      return `<g filter="url(#t12rk)" transform="translate(${f2(-160 * k)} 0)">${s29(t)}</g><defs><filter id="t12rk" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="${f2(1 + 10 * k)}"/></filter></defs>` +
        `<g opacity="${f2(k)}">${s30(t)}</g>`;
    }
    return s30(t);
  },
};
