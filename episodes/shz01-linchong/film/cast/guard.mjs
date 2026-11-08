// Convoy guards (公差 董超 / 薛霸) with the 水火棍. Owner: T01 builder. T08 imports it.
//
//   guard({ view:'side'|'back', x, y, height=287, phase=0, flip=false, staff='shoulder'|'hand'|'none',
//           staffAng, tone=0|1, id, armR }) -> SVG <g>, feet (ground point) at (x, y).
//   view 'side' faces RIGHT by default (flip faces left); 'back' walks away from the camera.
//   height: px for 1.72 m (WS 287, FS 650). H = height / 7 (the guards are 7 heads, stocky, shoulders 2 H).
//   phase: walk cycle 0..1 (one full cycle = two steps); pass null for standing.
//   staff: 'shoulder' (carried on the near shoulder, angled back), 'hand' (held upright like a walking pole,
//          or at `staffAng` deg from vertical, + = tip forward), 'none'.
//   tone: 0 = dun tunic (董超), 1 = dark blue-grey tunic (薛霸).
//   armR: optional near-arm override in degrees from straight down (+ = forward), e.g. a nudge.
// Also exported: guardHand(x, y, size, rot, flip) — a rough hand (back view, fingers forward) for S03's shoulder grab.
import { f2, clamp } from '../lib.mjs';

const LN = '#2A1C17';
const TONES = [
  { tunic: '#7A6448', tunicS: '#5C4A34', belt: '#2E2420', trou: '#4A4038', wrap: '#D8CFBF', wrapS: '#B3A893', cap: '#2F2724', capS: '#1F1916', skin: '#D9A07A', skinS: '#B57E5C' },
  { tunic: '#4B5563', tunicS: '#363E4A', belt: '#2A211C', trou: '#3E3A36', wrap: '#D5CDBE', wrapS: '#AFA592', cap: '#2B2522', capS: '#1C1714', skin: '#D49C77', skinS: '#B07A58' },
];
const P = (x, y) => `${f2(x)},${f2(y)}`;
const rot = (p, a, c) => { const r = (a * Math.PI) / 180, s = Math.sin(r), co = Math.cos(r); return [c[0] + (p[0] - c[0]) * co - (p[1] - c[1]) * s, c[1] + (p[0] - c[0]) * s + (p[1] - c[1]) * co]; };

function staffSVG(a, b, w) {
  // half red, half black
  const m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  return `<line x1="${f2(a[0])}" y1="${f2(a[1])}" x2="${f2(m[0])}" y2="${f2(m[1])}" stroke="#8F2520" stroke-width="${f2(w)}" stroke-linecap="round"/>` +
    `<line x1="${f2(m[0])}" y1="${f2(m[1])}" x2="${f2(b[0])}" y2="${f2(b[1])}" stroke="#1E1A18" stroke-width="${f2(w)}" stroke-linecap="round"/>`;
}

/** Tapered limb outline from a to b (radii ra, rb) as a closed path. */
function limb(a, b, ra, rb) {
  const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
  return `M${P(a[0] + nx * ra, a[1] + ny * ra)} L${P(b[0] + nx * rb, b[1] + ny * rb)} A${f2(rb)},${f2(rb)} 0 0 1 ${P(b[0] - nx * rb, b[1] - ny * rb)} L${P(a[0] - nx * ra, a[1] - ny * ra)} A${f2(ra)},${f2(ra)} 0 0 1 ${P(a[0] + nx * ra, a[1] + ny * ra)}Z`;
}

function sideGuard(u, C, ph, staff, staffAng, armR) {
  // units: u = 1 head. Origin = feet, facing +x. y up is negative.
  const walk = ph == null ? 0 : Math.sin(ph * Math.PI * 2);
  const bob = ph == null ? 0 : -Math.abs(Math.cos(ph * Math.PI * 2)) * 0.06 * u;
  const lw = Math.max(1, 0.045 * u);
  const ln = `stroke="${LN}" stroke-width="${f2(lw)}" stroke-linejoin="round" stroke-linecap="round"`;
  const hip = [0, -3.55 * u + bob];
  let s = '';
  // legs: far leg first (darker)
  const leg = (sw, far) => {
    const a = sw * 17, knee = rot([hip[0], hip[1] + 1.75 * u], a, hip);
    const kb = sw < 0 ? -sw * 14 : 3 + Math.max(0, sw - 0.6) * 10; // back leg bends a little
    const ank = rot([knee[0], knee[1] + 1.65 * u], a - kb, knee);
    const toe = [ank[0] + 0.55 * u, ank[1] + 0.12 * u];
    const tc = far ? C.trou : C.trou, wc = far ? C.wrapS : C.wrap;
    let g = `<path d="${limb(hip, knee, 0.34 * u, 0.25 * u)}" fill="${tc}" ${ln}/>`;
    g += `<path d="${limb(knee, ank, 0.24 * u, 0.17 * u)}" fill="${wc}" ${ln}/>`;
    // wrap bands
    for (let i = 1; i < 4; i++) { const p = [knee[0] + (ank[0] - knee[0]) * i / 4, knee[1] + (ank[1] - knee[1]) * i / 4]; s; g += `<path d="M${P(p[0] - 0.2 * u, p[1] - 0.05 * u)} L${P(p[0] + 0.2 * u, p[1] + 0.05 * u)}" stroke="${C.wrapS}" stroke-width="${f2(lw * 0.8)}"/>`; }
    g += `<path d="M${P(ank[0] - 0.2 * u, ank[1] - 0.12 * u)} C${P(ank[0] - 0.22 * u, ank[1] + 0.16 * u)} ${P(toe[0] - 0.1 * u, toe[1] + 0.12 * u)} ${P(toe[0] + 0.08 * u, toe[1] + 0.02 * u)} C${P(toe[0] + 0.08 * u, toe[1] - 0.14 * u)} ${P(ank[0] + 0.25 * u, ank[1] - 0.18 * u)} ${P(ank[0] + 0.1 * u, ank[1] - 0.2 * u)}Z" fill="#1E1A18" ${ln}/>`;
    return far ? `<g style="filter:brightness(0.82)">${g}</g>` : g;
  };
  s += leg(-walk, true);
  // far arm (swings opposite to the near arm)
  const sh = [0.05 * u, -5.62 * u + bob];
  const farA = walk * 18;
  const fel = rot([sh[0], sh[1] + 1.45 * u], -farA, sh), fwr = rot([fel[0], fel[1] + 1.15 * u], -farA - 12, fel);
  s += `<path d="${limb(sh, fel, 0.28 * u, 0.24 * u)}" fill="${C.tunicS}" ${ln}/><path d="${limb(fel, fwr, 0.24 * u, 0.2 * u)}" fill="${C.tunicS}" ${ln}/>`;
  s += `<circle cx="${f2(fwr[0])}" cy="${f2(fwr[1] + 0.12 * u)}" r="${f2(0.2 * u)}" fill="${C.skinS}" ${ln}/>`;
  s += leg(walk, false);
  // tunic: shoulders to knee, belted
  const tw = 0.95 * u;
  s += `<path d="M${P(-0.55 * u, -5.7 * u + bob)} C${P(-0.75 * u, -4.9 * u + bob)} ${P(-0.6 * u, -4.2 * u + bob)} ${P(-0.66 * u, -3.9 * u + bob)} L${P(-0.9 * u - walk * 0.15 * u, -2.0 * u + bob)} L${P(tw - walk * 0.1 * u, -2.0 * u + bob)} L${P(0.62 * u, -3.9 * u + bob)} C${P(0.72 * u, -4.4 * u + bob)} ${P(0.75 * u, -5.2 * u + bob)} ${P(0.45 * u, -5.75 * u + bob)} C${P(0.2 * u, -5.95 * u + bob)} ${P(-0.3 * u, -5.95 * u + bob)} ${P(-0.55 * u, -5.7 * u + bob)}Z" fill="${C.tunic}" ${ln}/>`;
  s += `<path d="M${P(-0.15 * u, -3.9 * u + bob)} L${P(-0.45 * u, -2.02 * u + bob)}" stroke="${C.tunicS}" stroke-width="${f2(lw)}"/>`;
  s += `<path d="M${P(-0.7 * u, -4.05 * u + bob)} L${P(0.66 * u, -4.05 * u + bob)} L${P(0.64 * u, -3.75 * u + bob)} L${P(-0.68 * u, -3.75 * u + bob)}Z" fill="${C.belt}" ${ln}/>`;
  s += `<path d="M${P(0.2 * u, -5.75 * u + bob)} L${P(0.45 * u, -5.0 * u + bob)} L${P(0.62 * u, -5.3 * u + bob)}" fill="none" stroke="${C.tunicS}" stroke-width="${f2(lw)}"/>`;
  // neck + head (profile, facing +x)
  const hc = [0.12 * u, -6.5 * u + bob];
  s += `<path d="M${P(hc[0] - 0.22 * u, hc[1] + 0.35 * u)} L${P(hc[0] - 0.28 * u, hc[1] + 0.78 * u)} L${P(hc[0] + 0.24 * u, hc[1] + 0.8 * u)} L${P(hc[0] + 0.2 * u, hc[1] + 0.35 * u)}Z" fill="${C.skinS}" ${ln}/>`;
  s += `<path d="M${P(hc[0] - 0.38 * u, hc[1] - 0.15 * u)} C${P(hc[0] - 0.42 * u, hc[1] + 0.3 * u)} ${P(hc[0] - 0.1 * u, hc[1] + 0.52 * u)} ${P(hc[0] + 0.22 * u, hc[1] + 0.5 * u)} C${P(hc[0] + 0.36 * u, hc[1] + 0.48 * u)} ${P(hc[0] + 0.38 * u, hc[1] + 0.32 * u)} ${P(hc[0] + 0.36 * u, hc[1] + 0.2 * u)} L${P(hc[0] + 0.46 * u, hc[1] + 0.06 * u)} L${P(hc[0] + 0.37 * u, hc[1] - 0.04 * u)} C${P(hc[0] + 0.38 * u, hc[1] - 0.3 * u)} ${P(hc[0] + 0.2 * u, hc[1] - 0.45 * u)} ${P(hc[0] - 0.05 * u, hc[1] - 0.45 * u)} C${P(hc[0] - 0.3 * u, hc[1] - 0.45 * u)} ${P(hc[0] - 0.38 * u, hc[1] - 0.3 * u)} ${P(hc[0] - 0.38 * u, hc[1] - 0.15 * u)}Z" fill="${C.skin}" ${ln}/>`;
  s += `<circle cx="${f2(hc[0] + 0.2 * u)}" cy="${f2(hc[1] - 0.05 * u)}" r="${f2(0.045 * u)}" fill="${LN}"/>`;
  s += `<path d="M${P(hc[0] + 0.08 * u, hc[1] - 0.17 * u)} L${P(hc[0] + 0.3 * u, hc[1] - 0.15 * u)}" stroke="${LN}" stroke-width="${f2(lw * 1.4)}"/>`;
  s += `<path d="M${P(hc[0] + 0.22 * u, hc[1] + 0.2 * u)} C${P(hc[0] + 0.32 * u, hc[1] + 0.26 * u)} ${P(hc[0] + 0.1 * u, hc[1] + 0.48 * u)} ${P(hc[0] - 0.12 * u, hc[1] + 0.4 * u)}" fill="none" stroke="#3a2a22" stroke-width="${f2(lw * 1.2)}"/>`;
  s += `<path d="M${P(hc[0] - 0.12 * u, hc[1] + 0.0 * u)} C${P(hc[0] - 0.05 * u, hc[1] - 0.06 * u)} ${P(hc[0] - 0.02 * u, hc[1] + 0.12 * u)} ${P(hc[0] - 0.1 * u, hc[1] + 0.14 * u)}" fill="none" stroke="${C.skinS}" stroke-width="${f2(lw)}"/>`;
  // felt cap (毡帽): dome with a turned-up brim
  s += `<path d="M${P(hc[0] - 0.46 * u, hc[1] - 0.18 * u)} C${P(hc[0] - 0.5 * u, hc[1] - 0.75 * u)} ${P(hc[0] + 0.42 * u, hc[1] - 0.82 * u)} ${P(hc[0] + 0.44 * u, hc[1] - 0.22 * u)}Z" fill="${C.cap}" ${ln}/>`;
  s += `<path d="M${P(hc[0] - 0.52 * u, hc[1] - 0.12 * u)} L${P(hc[0] + 0.5 * u, hc[1] - 0.2 * u)} L${P(hc[0] + 0.5 * u, hc[1] - 0.32 * u)} L${P(hc[0] - 0.5 * u, hc[1] - 0.28 * u)}Z" fill="${C.capS}" ${ln}/>`;
  // near arm + staff
  const nA = armR != null ? armR : (staff === 'shoulder' ? 0 : -walk * 18);
  let el, wr;
  if (staff === 'shoulder') {
    el = rot([sh[0], sh[1] + 1.45 * u], -28, sh); wr = rot([el[0], el[1] + 1.15 * u], -150, el);
  } else if (staff === 'hand') {
    el = rot([sh[0], sh[1] + 1.45 * u], -(nA + 20), sh); wr = rot([el[0], el[1] + 1.15 * u], -(nA + 70), el);
  } else {
    el = rot([sh[0], sh[1] + 1.45 * u], -nA, sh); wr = rot([el[0], el[1] + 1.15 * u], -nA - 14, el);
  }
  let st = '';
  if (staff === 'shoulder') {
    // over the shoulder, butt forward-down at the hand, tip up behind
    const a = [wr[0] + 0.55 * u, wr[1] + 0.45 * u], dir = [-0.8, -0.6], L = 6.7 * u;
    st = staffSVG(a, [a[0] + dir[0] * L, a[1] + dir[1] * L], 0.16 * u);
    s = st + s;
  } else if (staff === 'hand') {
    const ang = ((staffAng ?? 8) * Math.PI) / 180, L = 6.7 * u;
    const g = [wr[0] + 0.08 * u, wr[1] + 0.1 * u];
    const top = [g[0] + Math.sin(ang) * L * 0.42, g[1] - Math.cos(ang) * L * 0.42], bot = [g[0] - Math.sin(ang) * L * 0.58, g[1] + Math.cos(ang) * L * 0.58];
    st = staffSVG(top, bot, 0.16 * u);
  }
  s += `<path d="${limb(sh, el, 0.3 * u, 0.25 * u)}" fill="${C.tunic}" ${ln}/><path d="${limb(el, wr, 0.25 * u, 0.2 * u)}" fill="${C.tunic}" ${ln}/>`;
  if (staff === 'hand') s += st;
  s += `<circle cx="${f2(wr[0] + 0.05 * u)}" cy="${f2(wr[1] + 0.12 * u)}" r="${f2(0.21 * u)}" fill="${C.skin}" ${ln}/>`;
  return s;
}

function backGuard(u, C, ph, staff) {
  const walk = ph == null ? 0 : Math.sin(ph * Math.PI * 2);
  const bob = ph == null ? 0 : -Math.abs(Math.cos(ph * Math.PI * 2)) * 0.06 * u;
  const lw = Math.max(1, 0.05 * u);
  const ln = `stroke="${LN}" stroke-width="${f2(lw)}" stroke-linejoin="round"`;
  let s = '';
  // legs (alternate lift: the stepping leg's foot rises and shortens)
  for (const side of [-1, 1]) {
    const lift = Math.max(0, side * walk) * 0.35 * u;
    const x = side * 0.32 * u;
    s += `<path d="M${P(x - 0.27 * u, -3.5 * u + bob)} L${P(x - 0.2 * u, -0.25 * u - lift)} L${P(x + 0.2 * u, -0.25 * u - lift)} L${P(x + 0.27 * u, -3.5 * u + bob)}Z" fill="${C.trou}" ${ln}/>`;
    s += `<path d="M${P(x - 0.21 * u, -1.75 * u - lift * 0.5)} L${P(x - 0.19 * u, -0.22 * u - lift)} L${P(x + 0.19 * u, -0.22 * u - lift)} L${P(x + 0.21 * u, -1.75 * u - lift * 0.5)}Z" fill="${C.wrap}" ${ln}/>`;
    s += `<path d="M${P(x - 0.22 * u, -0.25 * u - lift)} L${P(x + 0.22 * u, -0.25 * u - lift)} L${P(x + 0.2 * u, 0 - lift)} L${P(x - 0.2 * u, 0 - lift)}Z" fill="#1E1A18" ${ln}/>`;
  }
  // tunic back
  s += `<path d="M${P(-0.95 * u, -5.55 * u + bob)} C${P(-1.05 * u, -4.8 * u + bob)} ${P(-0.85 * u, -4.2 * u + bob)} ${P(-0.8 * u, -3.9 * u + bob)} L${P(-0.95 * u, -1.95 * u + bob)} L${P(0.95 * u, -1.95 * u + bob)} L${P(0.8 * u, -3.9 * u + bob)} C${P(0.85 * u, -4.2 * u + bob)} ${P(1.05 * u, -4.8 * u + bob)} ${P(0.95 * u, -5.55 * u + bob)} C${P(0.5 * u, -5.9 * u + bob)} ${P(-0.5 * u, -5.9 * u + bob)} ${P(-0.95 * u, -5.55 * u + bob)}Z" fill="${C.tunic}" ${ln}/>`;
  s += `<path d="M0,${f2(-3.9 * u + bob)} L0,${f2(-1.97 * u + bob)}" stroke="${C.tunicS}" stroke-width="${f2(lw)}"/>`;
  s += `<path d="M${P(-0.84 * u, -4.05 * u + bob)} L${P(0.84 * u, -4.05 * u + bob)} L${P(0.82 * u, -3.75 * u + bob)} L${P(-0.82 * u, -3.75 * u + bob)}Z" fill="${C.belt}" ${ln}/>`;
  // arms swinging (fore-aft reads as small vertical shift)
  for (const side of [-1, 1]) {
    const sw = side * walk * 0.12 * u;
    const x = side * 0.98 * u;
    if (staff === 'shoulder' && side === 1) {
      s += `<path d="M${P(x - 0.25 * u, -5.4 * u + bob)} L${P(x + 0.15 * u, -4.4 * u + bob)} L${P(x - 0.1 * u, -4.0 * u + bob)} L${P(x - 0.45 * u, -4.9 * u + bob)}Z" fill="${C.tunicS}" ${ln}/>`;
      continue;
    }
    s += `<path d="M${P(x - 0.24 * u, -5.4 * u + bob)} L${P(x - 0.2 * u * side - 0.05 * u, -3.3 * u + bob + sw)} L${P(x + 0.18 * u - 0.2 * u * side, -3.3 * u + bob + sw)} L${P(x + 0.24 * u, -5.3 * u + bob)}Z" fill="${C.tunicS}" ${ln}/>`;
    s += `<circle cx="${f2(x - 0.12 * u * side)}" cy="${f2(-3.15 * u + bob + sw)}" r="${f2(0.19 * u)}" fill="${C.skinS}" ${ln}/>`;
  }
  // neck, head from behind, cap
  s += `<path d="M${P(-0.24 * u, -6.0 * u + bob)} L${P(-0.26 * u, -5.62 * u + bob)} L${P(0.26 * u, -5.62 * u + bob)} L${P(0.24 * u, -6.0 * u + bob)}Z" fill="${C.skinS}" ${ln}/>`;
  s += `<ellipse cx="0" cy="${f2(-6.5 * u + bob)}" rx="${f2(0.4 * u)}" ry="${f2(0.5 * u)}" fill="#2a201c" ${ln}/>`;
  s += `<ellipse cx="${f2(-0.4 * u)}" cy="${f2(-6.45 * u + bob)}" rx="${f2(0.08 * u)}" ry="${f2(0.14 * u)}" fill="${C.skinS}" ${ln}/><ellipse cx="${f2(0.4 * u)}" cy="${f2(-6.45 * u + bob)}" rx="${f2(0.08 * u)}" ry="${f2(0.14 * u)}" fill="${C.skinS}" ${ln}/>`;
  s += `<path d="M${P(-0.47 * u, -6.62 * u + bob)} C${P(-0.5 * u, -7.25 * u + bob)} ${P(0.5 * u, -7.25 * u + bob)} ${P(0.47 * u, -6.62 * u + bob)}Z" fill="${C.cap}" ${ln}/>`;
  s += `<path d="M${P(-0.53 * u, -6.58 * u + bob)} L${P(0.53 * u, -6.58 * u + bob)} L${P(0.5 * u, -6.74 * u + bob)} L${P(-0.5 * u, -6.74 * u + bob)}Z" fill="${C.capS}" ${ln}/>`;
  if (staff === 'shoulder') s += staffSVG([0.95 * u, -4.1 * u + bob], [2.3 * u, -9.4 * u + bob], 0.17 * u);
  else if (staff === 'hand') s = staffSVG([1.0 * u, -0.1 * u], [1.15 * u, -6.6 * u + bob], 0.17 * u) + s;
  return s;
}

export function guard(o = {}) {
  const height = o.height || 287, u = height / 7, C = TONES[o.tone || 0];
  const ph = o.phase === undefined ? 0 : o.phase;
  const inner = o.view === 'back' ? backGuard(u, C, ph, o.staff || 'shoulder') : sideGuard(u, C, ph, o.staff || 'hand', o.staffAng, o.armR);
  const sx = o.flip ? -1 : 1;
  return `<g data-cast="guard" transform="translate(${f2(o.x || 0)} ${f2(o.y || 0)}) scale(${sx} 1)">${inner}</g>`;
}

/** A guard's rough hand seen from above/behind, fingers pointing along +x, wrist at (x, y). size = hand length px. */
export function guardHand(x, y, size, rot = 0, flip = false, tone = 0) {
  const C = TONES[tone], k = size / 100;
  const ln = `stroke="${LN}" stroke-width="${f2(2.2)}" stroke-linejoin="round" stroke-linecap="round"`;
  const sleeve = `<path d="M-120,-34 L0,-30 L4,30 L-120,38Z" fill="${C.tunic}" ${ln}/><path d="M-10,-30 L4,-30 L8,30 L-6,30Z" fill="${C.tunicS}"/>`;
  const hand = `<path d="M0,-26 C20,-34 46,-32 60,-26 L96,-22 C104,-20 104,-12 96,-10 L64,-8 L98,-4 C106,-2 106,6 98,8 L64,10 L94,14 C101,16 101,23 94,25 L60,26 L84,32 C90,34 89,41 82,41 L50,38 C30,40 10,34 0,28Z" fill="${C.skin}" ${ln}/>` +
    `<path d="M10,-24 C26,-44 44,-46 52,-38 C46,-34 36,-30 30,-22" fill="${C.skin}" ${ln}/>` +
    `<path d="M58,-24 L60,24 M30,-20 C34,-6 34,8 30,22" fill="none" stroke="${C.skinS}" stroke-width="2"/>`;
  return `<g transform="translate(${f2(x)} ${f2(y)}) rotate(${rot}) scale(${f2(k)} ${f2(flip ? -k : k)})">${sleeve}${hand}</g>`;
}
