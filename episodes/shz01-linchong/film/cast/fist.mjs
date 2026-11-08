// 林冲's big cocked fist (S10/S11 close-ups, reprised in T13/S33). Builder C owns it; T13 imports it.
//
//   fist(x, y, size, { open = 0, rot = 0, sleeve = '#2F6B52', sleeveS = '#22513E', flip = false,
//                      tremble = 0, t = 0, light = 0, id = 'fist' }) -> SVG string
//   (x, y)  centre of the closed hand; size = fist height in px (model sheet: 0.42 H; ECU ≈ 480).
//           Fist width ≈ 0.95 × height (0.40 × 0.42 H).
//   open    0 closed … 0.5 index + middle unrolled … 1 all four fingers half open (the hand goes soft).
//           The fingers MOVE (no cross-fade): each finger rotates and lengthens about its knuckle.
//   rot     degrees, clockwise; 0 = forearm comes from below (slightly left), finger side faces right.
//   flip    mirrors (finger side faces left).
//   tremble px amplitude of an 8 Hz tremble (needs t in seconds).
//   light   0..1 warm rim light on the knuckle row.
//   arm     false = hand only (no forearm / sleeve cuff), for callers that draw their own sleeve.
// Local frame: fist height 100; the wrist is at about (-8, 50); the forearm runs down to the sleeve cuff at y ≈ 150.
// Style: the rig's — thin brown line #2A1C17, two-tone cel skin, no drawn nails or outlined fingertips.
import { f2, clamp, lerp } from '../lib.mjs';

const LN = '#2A1C17', SK = '#EFB58E', SKS = '#D29A76', SKD = '#B9785A', SKL = '#F9D4B6';
const LW = 1.15;

function band(x0, y, len, w, ang, k) {
  // one finger seen from the side, rooted at its knuckle (x0, y): closed = short curled block,
  // open = longer, rotated forward/up, with the fingertip segment showing
  const r = `<g transform="translate(${f2(x0)} ${f2(y)}) rotate(${f2(ang)})">`;
  let s = `<path d="M0,${f2(-w / 2)} L${f2(len - w / 2)},${f2(-w / 2)} A${f2(w / 2)},${f2(w / 2)} 0 0 1 ${f2(len - w / 2)},${f2(w / 2)} L0,${f2(w / 2)}Z" fill="${SK}" stroke="${LN}" stroke-width="${LW}" stroke-linejoin="round"/>`;
  // cel shadow along the lower edge of each finger
  s += `<path d="M2,${f2(w * 0.12)} L${f2(len - w * 0.55)},${f2(w * 0.12)} A${f2(w * 0.38)},${f2(w * 0.38)} 0 0 1 ${f2(len - w * 0.62)},${f2(w * 0.48)} L2,${f2(w * 0.48)}Z" fill="${SKS}"/>`;
  // joint creases: middle joint always, the last joint appears as it opens
  s += `<path d="M${f2(len * 0.5)},${f2(-w * 0.42)} q${f2(w * 0.12)},${f2(w * 0.3)} 0,${f2(w * 0.6)}" fill="none" stroke="${SKD}" stroke-width="${LW * 0.9}" stroke-linecap="round"/>`;
  if (k > 0.15) s += `<path d="M${f2(len * 0.78)},${f2(-w * 0.4)} q${f2(w * 0.1)},${f2(w * 0.28)} 0,${f2(w * 0.55)}" fill="none" stroke="${SKD}" stroke-width="${LW * 0.8}" stroke-linecap="round" opacity="${f2(clamp((k - 0.15) * 3))}"/>`;
  return r + s + '</g>';
}

export function fist(x, y, size, o = {}) {
  const S = size / 100;
  const open = clamp(o.open || 0);
  const oi = clamp(open * 2), or_ = clamp(open * 2 - 1); // index/middle first, then ring/little
  const tr = o.tremble ? [Math.sin((o.t || 0) * 2 * Math.PI * 8) * o.tremble, Math.cos((o.t || 0) * 2 * Math.PI * 8 + 1) * o.tremble * 0.6] : [0, 0];
  const sl = o.sleeve || '#2F6B52', slS = o.sleeveS || '#22513E';
  let s = '';
  if (o.arm !== false) {
  // ---- forearm: tapers from the sleeve up to the wrist, never narrower than the wrist
  s += `<path d="M-40,46 C-44,80 -48,120 -52,170 L30,170 C26,120 20,80 14,50 Z" fill="${SK}" stroke="${LN}" stroke-width="${LW}" stroke-linejoin="round"/>`;
  s += `<path d="M-40,46 C-44,80 -48,120 -52,170 L-30,170 C-28,120 -26,80 -24,46Z" fill="${SKS}"/>`;
  s += `<path d="M-30,74 C-20,80 0,80 12,74" fill="none" stroke="${SKD}" stroke-width="${LW}" stroke-linecap="round" opacity="0.7"/>`;
  // ---- the green sleeve cuff (the wide sleeve has slid down the raised forearm)
  s += `<path d="M-70,150 C-56,136 -14,130 22,136 C42,140 52,152 56,170 L68,260 L-92,260 C-88,220 -82,180 -70,150Z" fill="${sl}" stroke="${LN}" stroke-width="${LW}" stroke-linejoin="round"/>`;
  s += `<path d="M-70,150 C-56,136 -14,130 22,136 C42,140 52,152 56,170 C30,160 -30,158 -70,150Z" fill="${slS}"/>`;
  s += `<path d="M-58,176 C-54,200 -54,230 -58,256 M-14,170 C-10,200 -12,230 -16,256 M30,176 C36,204 40,232 40,256" fill="none" stroke="${slS}" stroke-width="3" stroke-linecap="round"/>`;
  }
  // ---- four fingers on the finger side: index (top) … little (bottom); closed = curled blocks.
  //      Drawn before the back of the hand so their roots tuck under it.
  const F = [
    { y: 32, w: 19, L: [40, 62], a: [2, -20], k: or_ },   // little
    { y: 12, w: 21, L: [44, 70], a: [1, -24], k: or_ },   // ring
    { y: -10, w: 22, L: [46, 76], a: [0, -28], k: oi },   // middle
    { y: -32, w: 22, L: [45, 74], a: [-1, -32], k: oi },  // index
  ];
  for (const g of F) s += band(2, g.y, lerp(g.L[0], g.L[1], g.k), g.w, lerp(g.a[0], g.a[1], g.k), g.k);
  // ---- back of the hand (two-tone: shadow on the left); its right edge is where the fingers emerge
  s += `<path d="M-44,46 C-50,20 -50,-14 -46,-34 C-42,-46 -30,-52 -16,-52 L6,-52 C13,-52 17,-47 17,-40 L17,42 C17,50 11,55 2,55 L-12,55 C-28,55 -40,52 -44,46Z" fill="${SK}" stroke="${LN}" stroke-width="${LW}" stroke-linejoin="round"/>`;
  s += `<path d="M-44,46 C-50,20 -50,-14 -46,-34 C-43,-44 -36,-49 -28,-51 C-32,-30 -33,0 -30,30 C-29,42 -24,51 -18,55 C-30,55 -40,52 -44,46Z" fill="${SKS}"/>`;
  // ---- knuckle row along the top (fades as the fingers unroll)
  const kc = 1 - open;
  s += `<g opacity="${f2(0.35 + 0.65 * kc)}">` + [-30, -17, -4, 9].map((kx, i) => `<path d="M${kx - 6.5},-51 Q${kx},${-57.5 + i * 0.5} ${kx + 6.5},-51" fill="${SK}" stroke="${LN}" stroke-width="${LW}" stroke-linejoin="round"/>`).join('') + '</g>';
  if (o.light) s += `<path d="M-36,-54 Q-30,-59 -24,-54 M-23,-54 Q-17,-59 -11,-54 M-10,-54 Q-4,-59 2,-54 M3,-53 Q9,-58 15,-53" fill="none" stroke="${SKL}" stroke-width="2.2" stroke-linecap="round" opacity="${f2(o.light * kc)}"/>`;
  // ---- thumb across the middle phalanges of index and middle (relaxes up and back as the hand opens)
  const tb = [-34, -6], tt = [lerp(34, 6, oi), lerp(-26, -66, oi)], tm = [lerp(4, -20, oi), lerp(-12, -40, oi)];
  const td = `M${tb[0]},${tb[1]} Q${f2(tm[0])},${f2(tm[1])} ${f2(tt[0])},${f2(tt[1])}`;
  s += `<path d="${td}" fill="none" stroke="${LN}" stroke-width="${f2(20 + LW * 2)}" stroke-linecap="round"/>`;
  s += `<path d="${td}" fill="none" stroke="${SK}" stroke-width="20" stroke-linecap="round"/>`;
  s += `<path d="M${tb[0] + 2},${tb[1] + 6} Q${f2(tm[0] + 2)},${f2(tm[1] + 7)} ${f2(tt[0] - 5)},${f2(tt[1] + 6)}" fill="none" stroke="${SKS}" stroke-width="6" stroke-linecap="round"/>`;
  const sx = o.flip ? -S : S;
  return `<g data-prop="${o.id || 'fist'}" transform="translate(${f2(x + tr[0])} ${f2(y + tr[1])}) rotate(${f2(o.rot || 0)}) scale(${f2(sx)} ${f2(S)})">${s}</g>`;
}
