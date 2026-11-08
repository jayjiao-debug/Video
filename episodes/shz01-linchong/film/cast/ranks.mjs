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
  const col = { tunic: '#8E3B2C', tunicS: '#6E2A20', trou: '#3C3A44', trouS: '#2E2C36', boot: '#1E1A1A', scarf: '#24201E', skin: '#E6A882', skinS: '#C98B68', belt: '#2E2420', shaft: '#6B4A2E', steel: '#C9CED2', tassel: '#C8372D', ...(o.col || {}) };
  const lean = o.lean || 0, step = o.step || 0;
  const arm = o.arm ?? 0.5, ang = o.spear ?? 0;
  const build = o.build || 1, gear = o.gear || 'scarf';
  // body in local coords (feet at 0,0; facing left; up = -y), drawn at k
  let s = '';
  const fl = step * 30;
  const leg = (dx, lift, back) => {
    const c = back ? col.trouS : col.trou;
    return `<g transform="translate(${f2(dx)} ${f2(-lift)})">` +
      `<path d="M-16,-176 C-20,-140 -18,-104 -15,-92 L-13,-18 L11,-18 L13,-92 C17,-110 18,-146 16,-176Z" fill="${c}" stroke="${LN}" stroke-width="2"/>` +
      `<path d="M-14,-92 L12,-92 L11,-18 L-13,-18Z" fill="${back ? '#B9AF9C' : '#D6CDB8'}" stroke="${LN}" stroke-width="1.6"/>` +
      `<path d="M-13,-80 L11,-70 M-13,-62 L11,-52 M-13,-44 L11,-34" stroke="#9A907E" stroke-width="1.6"/>` +
      `<path d="M-15,-20 L12,-20 L13,-6 C6,-2 -22,-1 -30,-4 C-34,-8 -26,-14 -15,-16Z" fill="${col.boot}"/></g>`;
  };
  s += leg(14, 0, true);           // back leg
  s += leg(-10 - step * 6, fl, false); // front leg (lifts on the stamp)
  let up = '';
  // tunic: shoulders to below the knee, flared, side slit
  up += `<path d="M-30,-276 C-44,-262 -46,-220 -44,-190 C-50,-160 -58,-128 -62,-104 L-6,-100 L-2,-150 L4,-150 L8,-100 L56,-104 C52,-130 46,-160 42,-190 C44,-222 40,-262 30,-276 C12,-284 -12,-284 -30,-276Z" fill="${col.tunic}" stroke="${LN}" stroke-width="2.4"/>`;
  up += `<path d="M14,-276 C34,-250 40,-214 42,-190 C46,-160 52,-130 56,-104 L22,-102 C22,-140 20,-200 6,-272Z" fill="${col.tunicS}" opacity="0.85"/>`;
  up += `<path d="M-32,-272 C-20,-262 -6,-256 6,-254 L2,-244 C-12,-246 -26,-252 -36,-262Z" fill="#E9DFC9" stroke="${LN}" stroke-width="1.5"/>`; // inner collar
  up += `<path d="M-46,-196 L44,-196 L46,-180 L-48,-180Z" fill="${col.belt}"/><path d="M-46,-188 l-10,22 l8,2 l8,-20Z" fill="${col.belt}"/>`;
  // neck + head (profile, facing left) + 幞头 headscarf with two short tails
  up += `<path d="M-10,-298 L10,-298 L12,-276 L-12,-276Z" fill="${col.skinS}"/>`;
  up += `<path d="M-16,-336 C-22,-326 -26,-316 -27,-310 L-34,-302 L-27,-298 C-26,-290 -22,-284 -12,-282 C0,-280 10,-284 14,-292 L16,-318Z" fill="${col.skin}" stroke="${LN}" stroke-width="2"/>`;
  up += `<path d="M-22,-330 C-22,-356 18,-360 24,-336 C27,-324 24,-306 18,-298 L12,-300 L10,-326 L-18,-324Z" fill="${col.scarf}"/>`;
  up += `<path d="M20,-334 C34,-328 42,-314 44,-298 L36,-298 C34,-310 28,-320 18,-326Z M18,-326 C30,-316 34,-300 32,-286 L26,-288 C26,-300 22,-310 14,-318Z" fill="${col.scarf}"/>`;
  up += `<circle cx="-14" cy="-316" r="2" fill="${LN}"/><path d="M-20,-322 l8,-2" stroke="${LN}" stroke-width="2"/><path d="M4,-312 c4,2 4,8 0,10" stroke="${col.skinS}" stroke-width="2" fill="none"/>`;
  if (gear === 'band') up += `<path d="M-24,-330 C-10,-334 10,-334 24,-330 L24,-322 C10,-326 -10,-326 -24,-322Z" fill="#C8372D"/><path d="M22,-328 C34,-326 40,-316 42,-306 L36,-306 C34,-314 30,-320 20,-322Z" fill="#C8372D"/>`;
  if (gear === 'cap') up += `<path d="M-30,-326 C-30,-362 30,-366 32,-328 L40,-324 L-38,-322Z" fill="#4A3A2A"/><path d="M-38,-324 L40,-326 L40,-320 L-38,-318Z" fill="#2E241A"/>`;
  if (o.beard) up += `<path d="M-26,-298 C-22,-286 -12,-280 -4,-282 C-10,-288 -14,-294 -16,-300Z" fill="${col.scarf}"/>`;
  // arm with the spear
  const sh = [-6, -262];
  const hand = [lerp(-34, -122, arm), lerp(-206, -244, arm)];
  const el = [lerp(-2, -64, arm), lerp(-200, -254, arm)];
  const r = (ang * Math.PI) / 180;
  const dir = [-Math.sin(r), -Math.cos(r)];
  const L1 = 300 * (2.3 / 1.7) * 0.95, back = L1 * 0.25;
  const tip = [hand[0] + dir[0] * (L1 - back), hand[1] + dir[1] * (L1 - back)], butt = [hand[0] - dir[0] * back, hand[1] - dir[1] * back];
  let spear = `<line x1="${f2(butt[0])}" y1="${f2(butt[1])}" x2="${f2(tip[0])}" y2="${f2(tip[1])}" stroke="${col.shaft}" stroke-width="5" stroke-linecap="round"/>`;
  const hx = tip[0] + dir[0] * 24, hy = tip[1] + dir[1] * 24, nx = -dir[1], ny = dir[0];
  spear += `<path d="M${f2(tip[0] + nx * 5)},${f2(tip[1] + ny * 5)} L${f2(hx)},${f2(hy)} L${f2(tip[0] - nx * 5)},${f2(tip[1] - ny * 5)}Z" fill="${col.steel}" stroke="${LN}" stroke-width="1.2"/>`;
  spear += `<path d="M${f2(tip[0] - dir[0] * 2)},${f2(tip[1] - dir[1] * 2)} l${f2(-dir[0] * 12 + nx * 6)},${f2(-dir[1] * 12 + ny * 6 + 7)} l${f2(-nx * 12)},${f2(-ny * 12)}Z" fill="${col.tassel}"/>`;
  up += spear;
  up += `<path d="M${sh[0]},${sh[1]} Q${f2(el[0])},${f2(el[1])} ${f2(hand[0] + 8)},${f2(hand[1])}" stroke="${LN}" stroke-width="27" stroke-linecap="round" fill="none"/>`;
  up += `<path d="M${sh[0]},${sh[1]} Q${f2(el[0])},${f2(el[1])} ${f2(hand[0] + 8)},${f2(hand[1])}" stroke="${col.tunic}" stroke-width="22" stroke-linecap="round" fill="none"/>`;
  up += `<ellipse cx="${f2(hand[0])}" cy="${f2(hand[1])}" rx="10" ry="9" fill="${col.skin}" stroke="${LN}" stroke-width="1.8"/>`;
  s += `<g transform="rotate(${f2(-lean)} 0 -170)">${up}</g>`;
  return `<g transform="translate(${f2(x)} ${f2(y)}) scale(${f2((o.flip ? -k : k) * build)} ${f2(k)})">${s}</g>`;
}

/** Two rows of ten soldiers (back row first). motion(t) gives the shared pose; each man lags slightly. */
export function ranks(t, o = {}) {
  const R = rng(o.seed || 17);
  const rows = o.rows || [
    { y: 628, h: 176, x0: 20, dx: 132, n: 15, lag: 0.2, haze: 0.42 },
    { y: 652, h: 214, x0: 60, dx: 158, n: 12, lag: 0.16, haze: 0.22 },
    { y: 690, h: 250, x0: -10, dx: 182, n: 11, lag: 0.12, haze: 0 },
  ];
  const tones = [{}, { tunic: '#7E3428', tunicS: '#5E241C' }, { tunic: '#9A4630', tunicS: '#743222' }, { tunic: '#86372C', tunicS: '#622720', trou: '#45404A' }];
  const skins = ['#E6A882', '#D99A72', '#EDB590', '#CF9068'];
  let s = '';
  for (const row of rows) {
    let x = row.x0;
    let g = '';
    for (let i = 0; i < row.n; i++) {
      const hj = 1 + (R() - 0.5) * 0.12;                 // ±6 % height
      const lagi = row.lag + R() * 0.16;                  // up to ~5 frames apart
      const m = o.motion(t - lagi);
      const ds = (R() - 0.5) * 12, da = (R() - 0.5) * 0.16, dl = (R() - 0.5) * 4;
      const gr = R(), gear = gr < 0.55 ? 'scarf' : gr < 0.8 ? 'band' : 'cap';
      const col = { ...tones[Math.floor(R() * tones.length)], skin: skins[Math.floor(R() * skins.length)] };
      const build = 0.9 + R() * 0.22;
      g += soldier({ x, y: row.y + (R() - 0.5) * 8, h: row.h * hj, spear: m.spear + ds, arm: Math.max(0, Math.min(1, m.arm + da)), lean: m.lean + dl, step: m.step, col, gear, build, beard: R() > 0.6 });
      x += row.dx * (0.78 + R() * 0.5) + (R() > 0.85 ? row.dx * 0.5 : 0); // uneven spacing, the odd gap
    }
    s += g;
    // depth haze in front of the farther rows (spring haze #F3E2BE)
    if (row.haze) {
      const gid = `rkhz${Math.round(row.y)}`;
      s += `<defs><linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F3E2BE" stop-opacity="0"/><stop offset="0.35" stop-color="#F3E2BE" stop-opacity="${row.haze}"/><stop offset="0.8" stop-color="#F3E2BE" stop-opacity="${row.haze}"/><stop offset="1" stop-color="#F3E2BE" stop-opacity="0"/></linearGradient></defs>` +
        `<rect x="-600" y="${row.y - row.h * 1.3}" width="3200" height="${row.h * 1.42}" fill="url(#${gid})"/>`;
    }
  }
  return s;
}
