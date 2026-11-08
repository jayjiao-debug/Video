// 张氏 (the wife). Her face is NEVER shown: back view, hands, sleeve, hair, shadow. Owner: T01 builder.
// T04 (S07 shadow, S08 pouring hand) and T05 (S09 temple, small back view) import it.
//
//   wifeBack({ x, y, head=179, tilt=0, bow=0, slump=0, armL=null, armR=null, sleeveSway=0, id }) -> SVG <g>
//     (x, y) = crown of the skull (the 高髻 rises 0.4 head above it). head = px of the head (22.3 cm).
//     Back view: her right side is on the viewer's right. Body is drawn down to ~4.2 heads (waist + skirt top)
//     — frame it so the lower edge is off-frame or covered.
//     tilt: head roll deg (+ = toward viewer's right). bow: 0..1 head pitched down (nape shows more, bun tips forward).
//     slump: 0..1 shoulders drop/round (grief).
//     armL / armR: null = hanging; or {to:[x,y]} a point in the same space the hand reaches (gripping a door post):
//     two-bone IK from the shoulder, sleeve hangs from the forearm.
//   wifeFull({ x, y, height=263, view:'back'|'backThreeQuarter', phase, ... }) small full figure (WS), feet at (x, y).
//   wifeHandGrip({ x, y, size=315, side:'L'|'R', squeeze=0, rot=0 }) -> her hand pinching a sheet's lower corner:
//     thumb on the near face, the hand below the paper edge, sleeve going down; (x, y) = thumb pad; draw it ABOVE the
//     paper. Also returns finger shadows (backlit paper) when opts.shadow is true.
//   wifeHandPour({ x, y, size=200, rot=0 }) -> her hand holding something by a handle (S08 ewer): back of the hand,
//     fingers curled around a vertical handle at (x, y).
//   COLW: palette.
import { f2, clamp } from '../lib.mjs';

export const COLW = {
  line: '#2A1C17', hair: '#1B1512', hairH: '#3A2E2A', skin: '#F2CDB4', skinS: '#D9A88E', skinD: '#C08A72',
  coat: '#E7C4C9', coatS: '#C99AA2', coatD: '#A97A84', trim: '#9C4A58', inner: '#F6EFE6', innerS: '#D9CFC2', skirt: '#B98A92',
  gold: '#D9A441', goldS: '#9C7124', jade: '#BFD8C8',
};
const C = COLW;
const P = (x, y) => `${f2(x)},${f2(y)}`;

function ik2(a, tgt, l1, l2, bendSign = 1) {
  const dx = tgt[0] - a[0], dy = tgt[1] - a[1];
  let d = Math.hypot(dx, dy);
  const dd = Math.min(d, l1 + l2 - 0.01);
  const ang = Math.atan2(dy, dx);
  const cosA = clamp((l1 * l1 + dd * dd - l2 * l2) / (2 * l1 * dd), -1, 1);
  const A = ang + bendSign * Math.acos(cosA);
  const el = [a[0] + Math.cos(A) * l1, a[1] + Math.sin(A) * l1];
  const k = dd / (d || 1);
  return { el, wr: [a[0] + dx * k, a[1] + dy * k] };
}
function limb(a, b, ra, rb) {
  const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
  return `M${P(a[0] + nx * ra, a[1] + ny * ra)} L${P(b[0] + nx * rb, b[1] + ny * rb)} A${f2(rb)},${f2(rb)} 0 0 1 ${P(b[0] - nx * rb, b[1] - ny * rb)} L${P(a[0] - nx * ra, a[1] - ny * ra)} A${f2(ra)},${f2(ra)} 0 0 1 ${P(a[0] + nx * ra, a[1] + ny * ra)}Z`;
}

/** Her head from behind, unit u = head height; origin crown; returns SVG. */
function headBack(u, bow, id) {
  const lw = Math.max(1, 0.012 * u);
  const ln = `stroke="${C.line}" stroke-width="${f2(lw)}" stroke-linejoin="round" stroke-linecap="round"`;
  let s = '';
  const bowY = bow * 0.12 * u;
  // ears (small, partly under hair)
  for (const sd of [-1, 1]) s += `<path d="M${P(sd * 0.34 * u, 0.42 * u)} C${P(sd * 0.43 * u, 0.4 * u)} ${P(sd * 0.44 * u, 0.62 * u)} ${P(sd * 0.35 * u, 0.66 * u)}Z" fill="${C.skinS}" ${ln}/>`;
  // nape skin below the hairline (more when bowed)
  s += `<path d="M${P(-0.2 * u, 0.82 * u - bowY)} C${P(-0.2 * u, 1.0 * u)} ${P(-0.17 * u, 1.12 * u)} ${P(-0.16 * u, 1.22 * u)} L${P(0.16 * u, 1.22 * u)} C${P(0.17 * u, 1.12 * u)} ${P(0.2 * u, 1.0 * u)} ${P(0.2 * u, 0.82 * u - bowY)}Z" fill="${C.skin}" ${ln}/>`;
  s += `<path d="M${P(-0.06 * u, 0.98 * u)} C${P(-0.03 * u, 1.06 * u)} ${P(-0.03 * u, 1.14 * u)} ${P(-0.05 * u, 1.2 * u)}" fill="none" stroke="${C.skinS}" stroke-width="${f2(lw)}"/>`;
  // skull with hair swept up from the nape
  s += `<path d="M${P(-0.36 * u, 0.5 * u)} C${P(-0.38 * u, 0.15 * u)} ${P(-0.2 * u, 0.0)} ${P(0, 0)} C${P(0.2 * u, 0.0)} ${P(0.38 * u, 0.15 * u)} ${P(0.36 * u, 0.5 * u)} C${P(0.34 * u, 0.7 * u)} ${P(0.24 * u, 0.86 * u - bowY)} ${P(0.18 * u, 0.9 * u - bowY)} C${P(0.08 * u, 0.84 * u - bowY)} ${P(-0.08 * u, 0.84 * u - bowY)} ${P(-0.18 * u, 0.9 * u - bowY)} C${P(-0.24 * u, 0.86 * u - bowY)} ${P(-0.34 * u, 0.7 * u)} ${P(-0.36 * u, 0.5 * u)}Z" fill="${C.hair}" ${ln}/>`;
  // swept strands
  let st = '';
  for (let i = -3; i <= 3; i++) st += `<path d="M${P(i * 0.055 * u, 0.84 * u - bowY)} C${P(i * 0.07 * u, 0.6 * u)} ${P(i * 0.04 * u, 0.3 * u)} ${P(i * 0.012 * u, 0.06 * u)}" fill="none" stroke="${C.hairH}" stroke-width="${f2(lw * 1.2)}" opacity="0.7"/>`;
  s += st;
  // sheen
  s += `<path d="M${P(-0.22 * u, 0.24 * u)} C${P(-0.1 * u, 0.12 * u)} ${P(0.12 * u, 0.12 * u)} ${P(0.24 * u, 0.24 * u)}" fill="none" stroke="#6B5A55" stroke-width="${f2(0.035 * u)}" stroke-linecap="round" opacity="0.55"/>`;
  // 高髻: a tall rounded bun on the crown, wrapped by a band
  s += `<path d="M${P(-0.17 * u, 0.06 * u)} C${P(-0.24 * u, -0.12 * u)} ${P(-0.2 * u, -0.36 * u)} ${P(-0.04 * u, -0.42 * u)} C${P(0.12 * u, -0.46 * u)} ${P(0.24 * u, -0.3 * u)} ${P(0.2 * u, -0.08 * u)} C${P(0.19 * u, 0.0)} ${P(0.17 * u, 0.06 * u)} ${P(0.15 * u, 0.08 * u)}Z" fill="${C.hair}" ${ln}/>`;
  s += `<path d="M${P(-0.12 * u, -0.3 * u)} C${P(-0.04 * u, -0.38 * u)} ${P(0.08 * u, -0.38 * u)} ${P(0.14 * u, -0.28 * u)}" fill="none" stroke="#6B5A55" stroke-width="${f2(0.03 * u)}" stroke-linecap="round" opacity="0.6"/>`;
  s += `<path d="M${P(-0.19 * u, -0.02 * u)} C${P(-0.06 * u, -0.07 * u)} ${P(0.08 * u, -0.07 * u)} ${P(0.2 * u, -0.03 * u)} L${P(0.2 * u, 0.03 * u)} C${P(0.08 * u, -0.01 * u)} ${P(-0.06 * u, -0.01 * u)} ${P(-0.18 * u, 0.04 * u)}Z" fill="${C.trim}" ${ln}/>`;
  // gold hairpin (金钗) through the bun, ornament on the viewer's right
  s += `<path d="M${P(-0.3 * u, -0.08 * u)} L${P(0.3 * u, -0.26 * u)}" stroke="${C.goldS}" stroke-width="${f2(0.03 * u)}" stroke-linecap="round"/>`;
  s += `<path d="M${P(-0.3 * u, -0.085 * u)} L${P(0.29 * u, -0.265 * u)}" stroke="${C.gold}" stroke-width="${f2(0.016 * u)}" stroke-linecap="round"/>`;
  const fx = 0.33 * u, fy = -0.275 * u;
  for (let i = 0; i < 5; i++) { const a = (i / 5) * Math.PI * 2; s += `<circle cx="${f2(fx + Math.cos(a) * 0.035 * u)}" cy="${f2(fy + Math.sin(a) * 0.035 * u)}" r="${f2(0.026 * u)}" fill="${C.gold}" ${ln}/>`; }
  s += `<circle cx="${f2(fx)}" cy="${f2(fy)}" r="${f2(0.02 * u)}" fill="#E8C66A"/>`;
  s += `<path d="M${P(fx, fy + 0.03 * u)} L${P(fx + 0.01 * u, fy + 0.13 * u)}" stroke="${C.goldS}" stroke-width="${f2(lw)}"/><circle cx="${f2(fx + 0.01 * u)}" cy="${f2(fy + 0.15 * u)}" r="${f2(0.016 * u)}" fill="${C.jade}" ${ln}/>`;
  return s;
}

export function wifeBack(o = {}) {
  const u = o.head || 179, x = o.x || 0, y = o.y || 0;
  const bow = o.bow || 0, slump = o.slump || 0, tilt = o.tilt || 0;
  const lw = Math.max(1, 0.012 * u);
  const ln = `stroke="${C.line}" stroke-width="${f2(lw)}" stroke-linejoin="round" stroke-linecap="round"`;
  const shY = 1.36 * u + slump * 0.1 * u, shX = 0.8 * u - slump * 0.06 * u;
  let s = '';
  // arms (behind the torso edge when hanging; raised arms drawn after the torso)
  const arm = (side, spec) => {
    const sh = [side * (shX - 0.12 * u), shY + 0.12 * u];
    let el, wr;
    if (spec && spec.to) {
      const t = [spec.to[0] - x, spec.to[1] - y];
      ({ el, wr } = ik2(sh, t, 1.25 * u, 1.05 * u, side > 0 ? 1 : -1));
    } else {
      el = [sh[0] + side * 0.12 * u, sh[1] + 1.25 * u];
      wr = [el[0] + side * 0.02 * u, el[1] + 1.05 * u];
    }
    let g = `<path d="${limb(sh, el, 0.24 * u, 0.2 * u)}" fill="${C.coatS}" ${ln}/>`;
    const sway = (o.sleeveSway || 0) * 0.1 * u;
    if (!spec) {
      // hanging arm: the long wide sleeve falls along the body side
      const top = [sh[0] - side * 0.1 * u, sh[1] - 0.05 * u], bot = wr[1] + 0.5 * u;
      g += `<path d="M${P(top[0], top[1])} C${P(top[0] + side * 0.36 * u, top[1] + 0.2 * u)} ${P(wr[0] + side * 0.24 * u, wr[1] - 0.6 * u)} ${P(wr[0] + side * 0.22 * u + sway, bot)} L${P(wr[0] - side * 0.3 * u + sway, bot + 0.04 * u)} C${P(wr[0] - side * 0.34 * u, wr[1] - 0.4 * u)} ${P(top[0] - side * 0.1 * u, top[1] + 0.8 * u)} ${P(top[0], top[1])}Z" fill="${C.coat}" ${ln}/>`;
      g += `<path d="M${P(wr[0] + side * 0.22 * u + sway, bot)} L${P(wr[0] - side * 0.3 * u + sway, bot + 0.04 * u)}" stroke="${C.trim}" stroke-width="${f2(0.05 * u)}" stroke-linecap="round"/>`;
    } else {
      // raised arm: a tube along the forearm flaring to the cuff, loose cloth hanging below it
      const fx = wr[0] - el[0], fy = wr[1] - el[1], fl = Math.hypot(fx, fy) || 1, nx = -fy / fl, ny = fx / fl;
      const cuff = [el[0] + fx * 0.82, el[1] + fy * 0.82];
      const w0 = 0.24 * u, w1 = 0.34 * u;
      const A = [el[0] + nx * w0, el[1] + ny * w0], B = [cuff[0] + nx * w1, cuff[1] + ny * w1];
      const Cc = [cuff[0] - nx * w1, cuff[1] - ny * w1], D = [el[0] - nx * w0, el[1] - ny * w0];
      const lowSide = (A[1] + B[1]) > (Cc[1] + D[1]);
      const [E1, E2] = lowSide ? [A, B] : [D, Cc];
      const hang = 0.45 * u * Math.abs(fx / fl) + 0.15 * u;
      const mid = [(E1[0] + E2[0]) / 2 + sway, Math.max(E1[1], E2[1]) + hang];
      g += `<path d="${limb(cuff, wr, 0.09 * u, 0.08 * u)}" fill="${C.skin}" ${ln}/>`;
      g += `<path d="M${P(A[0], A[1])} L${P(B[0], B[1])} L${P(Cc[0], Cc[1])} L${P(D[0], D[1])}Z" fill="${C.coat}" ${ln}/>`;
      g += `<path d="M${P(E1[0], E1[1])} Q${P(mid[0], mid[1] + hang * 0.3)} ${P(E2[0], E2[1])}" fill="${C.coatS}" ${ln}/>`;
      g += `<path d="M${P(B[0], B[1])} L${P(Cc[0], Cc[1])}" stroke="${C.trim}" stroke-width="${f2(0.05 * u)}" stroke-linecap="round"/>`;
    }
    // hand (back of the hand, fingers curled around a post when raised)
    const hx = wr[0] + (spec ? 0 : side * 0.02 * u), hy = wr[1] + (spec ? -0.02 * u : 0.16 * u);
    if (spec) g += `<path d="M${P(hx - 0.1 * u, hy - 0.06 * u)} C${P(hx - 0.13 * u, hy - 0.26 * u)} ${P(hx + 0.1 * u, hy - 0.3 * u)} ${P(hx + 0.12 * u, hy - 0.1 * u)} C${P(hx + 0.13 * u, hy + 0.06 * u)} ${P(hx - 0.06 * u, hy + 0.08 * u)} ${P(hx - 0.1 * u, hy - 0.06 * u)}Z" fill="${C.skin}" ${ln}/><path d="M${P(hx - 0.06 * u, hy - 0.2 * u)} L${P(hx + 0.08 * u, hy - 0.2 * u)} M${P(hx - 0.07 * u, hy - 0.13 * u)} L${P(hx + 0.09 * u, hy - 0.13 * u)}" stroke="${C.skinS}" stroke-width="${f2(lw)}"/>`;
    
    return g;
  };
  const hang = (side) => !(side < 0 ? o.armL : o.armR);
  if (hang(-1)) s += arm(-1, null);
  if (hang(1)) s += arm(1, null);
  // torso (褙子 back), down to the skirt top
  s += `<path d="M${P(-0.2 * u, 1.08 * u)} C${P(-0.45 * u, shY - 0.12 * u)} ${P(-shX + 0.1 * u, shY - 0.08 * u)} ${P(-shX, shY + 0.16 * u)} C${P(-shX - 0.08 * u, shY + 0.9 * u)} ${P(-shX + 0.02 * u, 3.0 * u)} ${P(-shX + 0.04 * u, 4.4 * u)} L${P(shX - 0.04 * u, 4.4 * u)} C${P(shX - 0.02 * u, 3.0 * u)} ${P(shX + 0.08 * u, shY + 0.9 * u)} ${P(shX, shY + 0.16 * u)} C${P(shX - 0.1 * u, shY - 0.08 * u)} ${P(0.45 * u, shY - 0.12 * u)} ${P(0.2 * u, 1.08 * u)}Z" fill="${C.coat}" ${ln}/>`;
  // inner collar + back collar band
  s += `<path d="M${P(-0.22 * u, 1.1 * u)} C${P(-0.1 * u, 1.22 * u)} ${P(0.1 * u, 1.22 * u)} ${P(0.22 * u, 1.1 * u)} L${P(0.26 * u, 1.2 * u)} C${P(0.1 * u, 1.34 * u)} ${P(-0.1 * u, 1.34 * u)} ${P(-0.26 * u, 1.2 * u)}Z" fill="${C.inner}" ${ln}/>`;
  s += `<path d="M${P(-0.27 * u, 1.2 * u)} C${P(-0.1 * u, 1.35 * u)} ${P(0.1 * u, 1.35 * u)} ${P(0.27 * u, 1.2 * u)} L${P(0.3 * u, 1.3 * u)} C${P(0.1 * u, 1.46 * u)} ${P(-0.1 * u, 1.46 * u)} ${P(-0.3 * u, 1.3 * u)}Z" fill="${C.trim}" ${ln}/>`;
  // fabric folds and a cel shadow on the viewer's left (key light from the right)
  s += `<path d="M${P(-shX + 0.04 * u, shY + 0.4 * u)} C${P(-shX + 0.22 * u, 2.2 * u)} ${P(-shX + 0.2 * u, 3.4 * u)} ${P(-shX + 0.26 * u, 4.4 * u)} L${P(-shX + 0.04 * u, 4.4 * u)} C${P(-shX + 0.02 * u, 3.0 * u)} ${P(-shX - 0.06 * u, shY + 0.9 * u)} ${P(-shX + 0.04 * u, shY + 0.4 * u)}Z" fill="${C.coatS}" opacity="0.8"/>`;
  s += `<path d="M${P(0.0, 1.5 * u)} C${P(0.04 * u, 2.4 * u)} ${P(-0.02 * u, 3.4 * u)} ${P(0.02 * u, 4.4 * u)}" fill="none" stroke="${C.coatS}" stroke-width="${f2(lw * 1.4)}"/>`;
  s += `<path d="M${P(0.36 * u, 1.9 * u)} C${P(0.4 * u, 2.6 * u)} ${P(0.38 * u, 3.4 * u)} ${P(0.42 * u, 4.4 * u)}" fill="none" stroke="${C.coatS}" stroke-width="${f2(lw)}" opacity="0.7"/>`;
  // raised arms over the torso edge
  if (!hang(-1)) s += arm(-1, o.armL);
  if (!hang(1)) s += arm(1, o.armR);
  // head (rotates about the nape)
  const nape = [0, 1.15 * u];
  const hs = headBack(u, bow, o.id || 'w');
  s += `<g transform="rotate(${f2(tilt)} ${f2(nape[0])} ${f2(nape[1])}) translate(0 ${f2(bow * 0.1 * u)})">${hs}</g>`;
  return `<g data-cast="wife" transform="translate(${f2(x)} ${f2(y)})">${s}</g>`;
}

/** Small full figure (WS). (x, y) = feet. view 'back'. */
export function wifeFull(o = {}) {
  const hgt = o.height || 263, u = hgt / 7.1;
  // reuse wifeBack for the upper body and add the skirt to the ground
  const top = wifeBack({ ...o, head: u, x: 0, y: 0 });
  const lw = Math.max(1, 0.03 * u);
  const skirt = `<path d="M${P(-0.75 * u, 4.2 * u)} L${P(-0.9 * u, 7.0 * u)} C${P(-0.3 * u, 7.12 * u)} ${P(0.3 * u, 7.12 * u)} ${P(0.9 * u, 7.0 * u)} L${P(0.75 * u, 4.2 * u)}Z" fill="${C.skirt}" stroke="${C.line}" stroke-width="${f2(lw)}"/>`;
  return `<g data-cast="wife" transform="translate(${f2(o.x || 0)} ${f2((o.y || 0) - 7.1 * u + 0.4 * u)})">${skirt}${top}</g>`;
}

/** Her hand pinching a sheet's lower corner (thumb on the near face). side 'L' = viewer's left corner. */
export function wifeHandGrip(o = {}) {
  const size = o.size || 315, k = size / 300, sd = o.side === 'R' ? -1 : 1, sq = o.squeeze || 0;
  const lw = 2.4;
  const ln = `stroke="${C.line}" stroke-width="${f2(lw)}" stroke-linejoin="round" stroke-linecap="round"`;
  // local frame: thumb pad at (0,0); paper bottom edge at y = 40; the hand goes down-left (for side L) out of the paper.
  let s = '';
  if (o.shadow) {
    // fingers behind the backlit paper: soft dark shapes above the thumb
    s += `<g opacity="0.16" fill="#3a2a22">`;
    for (let i = 0; i < 4; i++) s += `<rect x="${-30 + i * 34}" y="${-150 + i * 10 + sq * 8}" width="30" height="${150 - i * 14}" rx="15" transform="rotate(${-14 + i * 6} ${-15 + i * 34} 30)"/>`;
    s += `</g>`;
  }
  // sleeve (wide, pink) going down off the frame
  s += `<path d="M-200,520 C-170,330 -120,170 -70,95 L60,120 C70,230 90,400 120,520Z" fill="${C.coat}" ${ln}/>`;
  s += `<path d="M-74,98 L58,122 L54,142 L-80,118Z" fill="${C.trim}" ${ln}/>`;
  s += `<path d="M-160,520 C-130,360 -96,230 -60,140" fill="none" stroke="${C.coatS}" stroke-width="3"/>`;
  // wrist + hand mass below the paper edge (back/side of the hand)
  s += `<path d="M-62,104 C-60,72 -46,46 -24,36 C8,26 46,32 60,52 C68,66 66,90 58,112 Z" fill="${C.skin}" ${ln}/>`;
  s += `<path d="M-30,60 C-10,52 20,52 40,62" fill="none" stroke="${C.skinS}" stroke-width="2.4"/>`;
  // index finger knuckle curling round the edge (just peeking below the edge)
  s += `<path d="M10,40 C30,36 52,40 62,50 C66,58 60,66 50,64 C38,60 24,56 10,52Z" fill="${C.skinS}" ${ln}/>`;
  // thumb on the paper face, pointing up toward the sheet centre
  const tr = 26 - sq * 4;
  s += `<g transform="rotate(${tr} -10 40)"><path d="M-30,44 C-34,20 -32,-26 -22,-62 C-18,-78 6,-80 10,-62 C16,-30 16,10 14,42Z" fill="${C.skin}" ${ln}/>` +
    `<path d="M-20,-30 C-12,-34 0,-34 8,-30" fill="none" stroke="${C.skinS}" stroke-width="2.2"/>` +
    `<path d="M-14,-66 C-8,-70 2,-70 6,-64" fill="none" stroke="${C.skinS}" stroke-width="1.8" opacity="0.7"/></g>`;
  return `<g data-cast="wife-hand" transform="translate(${f2(o.x || 0)} ${f2(o.y || 0)}) rotate(${f2(o.rot || 0)}) scale(${f2(sd * k)} ${f2(k)})">${s}</g>`;
}

/** Her hand holding a vertical handle at (x, y) (S08 ewer): back of the hand, fingers wrapped. */
export function wifeHandPour(o = {}) {
  const size = o.size || 200, k = size / 200;
  const ln = `stroke="${C.line}" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"`;
  let s = `<path d="M60,-40 C120,-60 220,-50 300,-20 L300,70 C220,60 120,60 50,50Z" fill="${C.coat}" ${ln}/>`;
  s += `<path d="M44,-38 L64,-42 L58,52 L40,48Z" fill="${C.trim}" ${ln}/>`;
  s += `<path d="M44,-36 C20,-46 -10,-40 -26,-24 C-40,-8 -38,22 -24,38 C-6,54 26,52 44,44Z" fill="${C.skin}" ${ln}/>`;
  for (let i = 0; i < 4; i++) s += `<path d="M${-30 + i * 2},${-22 + i * 16} C${-48},${-20 + i * 16} ${-48},${-6 + i * 16} ${-30},${-4 + i * 16}" fill="${C.skin}" ${ln}/>`;
  s += `<path d="M-6,-34 C-30,-58 -44,-44 -36,-30" fill="${C.skin}" ${ln}/>`;
  return `<g data-cast="wife-hand" transform="translate(${f2(o.x || 0)} ${f2(o.y || 0)}) rotate(${f2(o.rot || 0)}) scale(${f2(k)})">${s}</g>`;
}
