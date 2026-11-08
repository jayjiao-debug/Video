// Soldier ranks for the 禁军 training ground (T03 · S06). Owner: builder B.
//   soldier({ x, y, h, spear, arm, lean, step, flip, col, id }) -> side-view soldier facing left, flat cel style.
//     (x, y) feet, h = height in px for 1.70 m. spear = spear angle in degrees (0 up, + toward the facing side,
//     90 = horizontal forward). arm 0..1 = hand reach (0 at the chest, 1 arm extended). lean deg (+ forward).
//     step 0..1 lifts the front foot (stamp).
//   ranks(t, opts) -> two rows of soldiers mirroring a motion timeline: opts.motion(t) -> {spear, arm, lean, step}.
import { f2, rng, lerp } from '../lib.mjs';

const LN = '#2A1C17';

export function soldier(o) {
  const { x, y, h } = o;
  const k = h / 340; // drawn at 340 px tall
  const col = { tunic: '#8E3B2C', tunicS: '#6E2A20', trou: '#3C3A44', boot: '#1E1A1A', scarf: '#24201E', skin: '#E6A882', skinS: '#C98B68', belt: '#2E2420', shaft: '#6B4A2E', steel: '#C9CED2', tassel: '#C8372D', ...(o.col || {}) };
  const lean = o.lean || 0, step = o.step || 0;
  const arm = o.arm ?? 0.5, ang = o.spear ?? 0;
  // body in local coords (feet at 0,0; facing left; up = -y), drawn at k
  let s = '';
  // legs: back leg, front leg (front foot lifts on a stamp)
  const fl = step * 26;
  s += `<path d="M6,-150 L22,-150 L26,-14 L40,-12 L42,0 L6,0 L8,-14Z" fill="${col.trou}" stroke="${LN}" stroke-width="2"/>`;
  s += `<path d="M6,-14 L44,-14 L48,0 L4,0Z" fill="${col.boot}"/>`;
  s += `<g transform="translate(${f2(-step * 6)} ${f2(-fl)})"><path d="M-22,-150 L-6,-150 L-8,-14 L-34,-12 L-36,0 L-4,0 L-2,-150Z" fill="${col.trou}" stroke="${LN}" stroke-width="2"/><path d="M-38,-14 L-2,-14 L0,0 L-40,0Z" fill="${col.boot}"/></g>`;
  // torso (tunic to the knee), lean about the hips
  let up = '';
  up += `<path d="M-34,-268 C-42,-230 -46,-180 -44,-120 L44,-120 C46,-180 40,-232 32,-268 C10,-280 -14,-280 -34,-268Z" fill="${col.tunic}" stroke="${LN}" stroke-width="2.4"/>`;
  up += `<path d="M10,-270 C30,-240 40,-180 44,-122 L20,-122 C20,-170 14,-230 4,-268Z" fill="${col.tunicS}" opacity="0.9"/>`;
  up += `<rect x="-44" y="-178" width="88" height="12" fill="${col.belt}"/>`;
  // neck + head (profile left) + scarf
  up += `<path d="M-12,-282 L8,-282 L10,-262 L-12,-262Z" fill="${col.skinS}"/>`;
  up += `<path d="M-22,-330 C-26,-318 -30,-306 -32,-298 L-24,-296 C-24,-288 -20,-280 -8,-278 L10,-280 C18,-290 20,-306 18,-322Z" fill="${col.skin}" stroke="${LN}" stroke-width="2"/>`;
  up += `<path d="M-26,-326 C-24,-350 16,-352 22,-330 C24,-318 22,-306 18,-300 L10,-302 L8,-322 L-20,-322Z" fill="${col.scarf}"/>`;
  up += `<path d="M18,-326 C30,-318 36,-304 34,-290 L26,-292 C26,-304 22,-314 14,-320Z" fill="${col.scarf}"/>`;
  up += `<circle cx="-14" cy="-310" r="2" fill="${LN}"/>`;
  // arm with the spear: shoulder at (-6,-252); hand reach from chest (-30,-200) to extended (-120,-232)
  const sh = [-6, -252];
  const hand = [lerp(-34, -118, arm), lerp(-198, -236, arm)];
  const el = [lerp(-4, -66, arm), lerp(-196, -246, arm)];
  const r = (ang * Math.PI) / 180;
  const dir = [-Math.sin(r), -Math.cos(r)]; // + angle tilts the tip toward the facing side (left)
  const L1 = 300 * (2.3 / 1.7) * 340 / 340 * 0.95, back = L1 * 0.25;
  const tip = [hand[0] + dir[0] * (L1 - back), hand[1] + dir[1] * (L1 - back)], butt = [hand[0] - dir[0] * back, hand[1] - dir[1] * back];
  let spear = `<line x1="${f2(butt[0])}" y1="${f2(butt[1])}" x2="${f2(tip[0])}" y2="${f2(tip[1])}" stroke="${col.shaft}" stroke-width="5" stroke-linecap="round"/>`;
  const hx = tip[0] + dir[0] * 22, hy = tip[1] + dir[1] * 22, nx = -dir[1], ny = dir[0];
  spear += `<path d="M${f2(tip[0] + nx * 5)},${f2(tip[1] + ny * 5)} L${f2(hx)},${f2(hy)} L${f2(tip[0] - nx * 5)},${f2(tip[1] - ny * 5)}Z" fill="${col.steel}" stroke="${LN}" stroke-width="1.2"/>`;
  spear += `<path d="M${f2(tip[0])},${f2(tip[1])} l${f2(-dir[0] * 10 + nx * 7)},${f2(-dir[1] * 10 + ny * 7 + 8)} l${f2(-nx * 14)},${f2(-ny * 14)}Z" fill="${col.tassel}"/>`;
  up += spear;
  up += `<path d="M${sh[0]},${sh[1]} Q${f2(el[0])},${f2(el[1])} ${f2(hand[0])},${f2(hand[1])}" stroke="${LN}" stroke-width="22" stroke-linecap="round" fill="none"/>`;
  up += `<path d="M${sh[0]},${sh[1]} Q${f2(el[0])},${f2(el[1])} ${f2(hand[0])},${f2(hand[1])}" stroke="${col.tunic}" stroke-width="18" stroke-linecap="round" fill="none"/>`;
  up += `<circle cx="${f2(hand[0])}" cy="${f2(hand[1])}" r="9" fill="${col.skin}" stroke="${LN}" stroke-width="1.8"/>`;
  s += `<g transform="rotate(${f2(-lean)} 0 -150)">${up}</g>`;
  return `<g transform="translate(${f2(x)} ${f2(y)}) scale(${f2(o.flip ? -k : k)} ${f2(k)})">${s}</g>`;
}

/** Two rows of ten soldiers (back row first). motion(t) gives the shared pose; each man lags slightly. */
export function ranks(t, o = {}) {
  const R = rng(o.seed || 17);
  const rows = o.rows || [
    { y: 668, h: 262, x0: 120, dx: 168, n: 10, lag: 0.17 },
    { y: 706, h: 300, x0: 40, dx: 186, n: 10, lag: 0.13 },
  ];
  let s = '';
  for (const row of rows) {
    for (let i = 0; i < row.n; i++) {
      const jit = R(), hj = 1 + (R() - 0.5) * 0.08, lagi = row.lag + R() * 0.05;
      const m = o.motion(t - lagi);
      const tone = R() > 0.5 ? {} : { tunic: '#7E3428', tunicS: '#5E241C' };
      s += soldier({ x: row.x0 + i * row.dx + (jit - 0.5) * 30, y: row.y, h: row.h * hj, ...m, col: tone });
    }
  }
  return s;
}
