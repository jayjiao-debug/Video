// 林冲's big cocked fist (S10/S11 ECU, reprised in T13/S33). Builder C owns it; T13 imports it.
//
//   fist(x, y, size, { open = 0, rot = 0, sleeve = '#2F6B52', sleeveS = '#22513E', flip = false,
//                      tremble = 0, t = 0, light = 0, id = 'fist' }) -> SVG string
//   (x, y)  centre of the fist (the closed hand), size = fist height in px (model sheet: 0.42 H; ECU ≈ 480).
//   open    0 closed … 0.5 index + middle eased open … 1 all four fingers half open (the hand "goes soft").
//   rot     degrees, clockwise; 0 = forearm comes from below-left, fingers face right (a cocked fist by
//           the ear, seen from the fighter's side, facing right). flip mirrors (facing left).
//   tremble px amplitude of an 8 Hz tremble (needs t in seconds).
//   light   0..1 extra warm rim light on the top/back edge.
// Style: flat cel, brown line #2A1C17, no drawn nails or outlined fingertips (owner rule).
import { f2, clamp, lerp } from '../lib.mjs';

const LN = '#2A1C17', SK = '#EFB58E', SKS = '#D29A76', SKD = '#B9785A', SKL = '#F7CDAE';

function capsule(a, b, w, fill, lw) {
  // a filled rounded segment from point a to point b (width w) with an outline
  const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy), ang = (Math.atan2(dy, dx) * 180) / Math.PI;
  return `<rect x="${f2(-w / 2)}" y="${f2(-w / 2)}" width="${f2(L + w)}" height="${f2(w)}" rx="${f2(w / 2)}" transform="translate(${f2(a[0])} ${f2(a[1])}) rotate(${f2(ang)})" fill="${fill}" stroke="${LN}" stroke-width="${f2(lw)}"/>`;
}
function chain(base, angs, lens) {
  const pts = [base];
  let p = base;
  angs.forEach((a, i) => { const r = (a * Math.PI) / 180; p = [p[0] + Math.cos(r) * lens[i], p[1] + Math.sin(r) * lens[i]]; pts.push(p); });
  return pts;
}

export function fist(x, y, size, o = {}) {
  const S = size / 100; // local unit: fist height = 100
  const open = clamp(o.open || 0);
  const oi = clamp(open * 2), or_ = clamp(open * 2 - 1); // index/middle first, then ring/little
  const tr = o.tremble ? [Math.sin((o.t || 0) * 2 * Math.PI * 8) * o.tremble, Math.cos((o.t || 0) * 2 * Math.PI * 8 + 1) * o.tremble * 0.6] : [0, 0];
  const id = o.id || 'fist';
  const sl = o.sleeve || '#2F6B52', slS = o.sleeveS || '#22513E';
  const lw = 2.6;
  let s = '';
  // forearm (skin) rising from the sleeve, which has fallen back toward the elbow
  s += `<path d="M-32,38 C-42,90 -52,150 -60,230 L-4,236 C-2,170 4,100 10,48 Z" fill="${SK}" stroke="${LN}" stroke-width="${lw}" stroke-linejoin="round"/>`;
  s += `<path d="M-30,70 C-22,80 -6,82 4,74" fill="none" stroke="${SKS}" stroke-width="3" stroke-linecap="round"/>`;
  s += `<path d="M-74,188 C-56,176 -20,172 6,180 C20,186 30,206 34,236 L38,300 L-104,300 C-98,258 -90,218 -74,188Z" fill="${sl}" stroke="${LN}" stroke-width="${lw}" stroke-linejoin="round"/>`;
  s += `<path d="M-62,200 C-54,226 -52,258 -54,296 M-22,186 C-16,220 -18,256 -22,296 M14,192 C20,224 22,260 22,296" fill="none" stroke="${slS}" stroke-width="4" stroke-linecap="round"/>`;
  // back of the hand (vertical fist, seen from the finger side: thumb on top)
  s += `<path d="M-30,52 C-44,30 -46,-10 -42,-34 C-38,-48 -22,-54 -6,-52 L6,-48 L6,46 C-6,54 -18,56 -30,52Z" fill="${SKS}" stroke="${LN}" stroke-width="${lw}" stroke-linejoin="round"/>`;
  s += `<path d="M-36,-30 C-40,-4 -38,22 -30,40" fill="none" stroke="${SKD}" stroke-width="3" stroke-linecap="round" opacity="0.6"/>`;
  // four fingers stacked: little (bottom) .. index (top). Closed: short curled bands; open: they unroll forward and up.
  const FG = [
    { y: 31, w: 20, L: [37, 58], k: or_, a: [4, -22] },
    { y: 12, w: 22, L: [43, 66], k: or_, a: [2, -26] },
    { y: -8, w: 23, L: [46, 72], k: oi, a: [0, -30] },
    { y: -29, w: 23, L: [45, 70], k: oi, a: [-2, -34] },
  ];
  FG.forEach((g) => {
    const L = lerp(g.L[0], g.L[1], g.k), ang = lerp(g.a[0], g.a[1], g.k);
    const bx = -6, by = g.y;
    s += `<g transform="translate(${bx} ${f2(by)}) rotate(${f2(ang)})">` +
      `<rect x="0" y="${f2(-g.w / 2)}" width="${f2(L)}" height="${f2(g.w)}" rx="${f2(g.w / 2)}" fill="${SK}" stroke="${LN}" stroke-width="${lw}"/>` +
      // first joint crease, then (opening) the second joint
      `<path d="M${f2(L * 0.62)},${f2(-g.w * 0.36)} q3,${f2(g.w * 0.36)} 0,${f2(g.w * 0.72)}" fill="none" stroke="${SKD}" stroke-width="2.2" stroke-linecap="round"/>` +
      `<path d="M${f2(L - g.w * 0.55)},${f2(-g.w * 0.5 + 2)} q${f2(g.w * 0.25)},${f2(g.w * 0.5)} 0,${f2(g.w - 4)}" fill="none" stroke="${SKS}" stroke-width="3" stroke-linecap="round" opacity="${f2(1 - g.k)}"/>` +
      `</g>`;
  });
  // knuckle bumps along the back edge (fade as the hand opens)
  const kc = 1 - open;
  if (kc > 0.05) s += `<g opacity="${f2(kc)}">` + [-30, -8, 13, 32].map((ky) => `<path d="M2,${ky - 7} Q-5,${ky} 2,${ky + 7}" fill="none" stroke="${SKD}" stroke-width="2.4" stroke-linecap="round"/>`).join('') + '</g>';
  // thumb wraps over index and middle (relaxes up and back as the hand opens)
  const tb = [-32, 2], tt = [lerp(36, 10, oi), lerp(-4, -58, oi)], tm = [lerp(4, -14, oi), lerp(8, -40, oi)];
  const td = `M${tb[0]},${tb[1]} Q${f2(tm[0])},${f2(tm[1])} ${f2(tt[0])},${f2(tt[1])}`;
  s += `<path d="${td}" fill="none" stroke="${LN}" stroke-width="${f2(22 + lw * 2)}" stroke-linecap="round"/>`;
  s += `<path d="${td}" fill="none" stroke="${SK}" stroke-width="22" stroke-linecap="round"/>`;
  s += `<path d="M${tb[0] + 2},${tb[1] + 7} Q${f2(tm[0] + 2)},${f2(tm[1] + 8)} ${f2(tt[0] - 5)},${f2(tt[1] + 7)}" fill="none" stroke="${SKS}" stroke-width="3.5" stroke-linecap="round"/>`;
  // rim light
  if (o.light) s += `<path d="M-42,-34 C-38,-48 -22,-54 -6,-52" fill="none" stroke="${SKL}" stroke-width="5" stroke-linecap="round" opacity="${f2(o.light)}"/>`;
  const sx = o.flip ? -S : S;
  return `<g data-prop="${id}" transform="translate(${f2(x + tr[0])} ${f2(y + tr[1])}) rotate(${f2(o.rot || 0)}) scale(${f2(sx)} ${f2(S)})">${s}</g>`;
}
