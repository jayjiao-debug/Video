// 林冲 full body, 国风漫画 style, ~7.5 heads: short torso, long legs. Canvas 1000x2000.
import { front, COL, EX } from './manhua.mjs';
import { smooth } from './geom.mjs';
const f = (n) => (Math.round(n * 10) / 10).toString();

function snowfall(n, seed) {
  let s = seed, o = '';
  const r = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  for (let i = 0; i < n; i++) o += `<circle cx="${f(r() * 1000)}" cy="${f(r() * 2000)}" r="${f(1.5 + r() * r() * 7)}" fill="#fff" opacity="${f(0.5 + r() * 0.5)}"/>`;
  return o;
}

export function fullFront(E = EX['平静'], opts = {}) {
  const T = !!opts.tokyo;
  const C = { ...COL, ...(T ? { coat: '#2f6b52', coatS: '#22513e', sash: '#1f2a26' } : {}), trousers: '#4a4f58', trousersS: '#363a42', wrap: '#e2ddd2', wrapS: '#bdb6a8', boot: '#2a2724', sash: '#6b2f2a', wood: '#7a5332', steel: '#d4dadf', gourd: '#c08a45', gourdS: '#8a5c2a', ...(opts.col || {}) };
  const L = (w = 4) => `stroke="${C.line}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"`;
  let o = '';
  const add = (s) => (o += s + '\n');
  const sp0 = [770, 1210], sp1 = [96, 118];
  const at = (t) => [sp0[0] + (sp1[0] - sp0[0]) * t, sp0[1] + (sp1[1] - sp0[1]) * t];
  const shaft = (t0, t1) => `<path d="M${f(at(t0)[0])},${f(at(t0)[1])} L${f(at(t1)[0])},${f(at(t1)[1])}" stroke="${C.line}" stroke-width="19" stroke-linecap="round"/><path d="M${f(at(t0)[0])},${f(at(t0)[1])} L${f(at(t1)[0])},${f(at(t1)[1])}" stroke="${C.wood}" stroke-width="11" stroke-linecap="round"/>`;
  add(shaft(0, 0.6));
  // cloak behind, blown to his left (viewer right)
  if (!T) add(`<path d="${smooth([[336, 498], [290, 600], [262, 820], [246, 1060], [236, 1250], [380, 1236], [520, 1262], [660, 1236], [840, 1268], [800, 1060], [740, 820], [706, 600], [664, 498]])}" fill="${C.cloak}" ${L()}/>`);
  if (!T) add(`<path d="${smooth([[664, 500], [706, 600], [740, 820], [800, 1060], [840, 1268], [730, 1240], [700, 1000], [660, 760], [630, 560]])}" fill="${C.cloakS}"/>`);
  // legs: trousers, leg wraps (绑腿), boots
  for (const [a, b, sgn] of [[408, 494, -1], [506, 592, 1]]) {
    add(`<path d="${smooth([[a, 1120], [b, 1120], [b - 6, 1470], [b - 12, 1800], [a + 12, 1800], [a + 6, 1470]])}" fill="${C.trousers}" ${L()}/>`);
    add(`<path d="${smooth([[a + 10, 1500], [b - 10, 1500], [b - 14, 1820], [a + 14, 1820]])}" fill="${C.wrap}" ${L(3)}/>`);
    for (let k = 0; k < 7; k++) add(`<path d="M${a + 14},${1530 + k * 42} L${b - 14},${1506 + k * 42}" stroke="${C.wrapS}" stroke-width="4"/>`);
    add(`<path d="${smooth([[a + 10, 1812], [b - 10, 1812], [b + (sgn > 0 ? 22 : 0), 1890], [b + (sgn > 0 ? 26 : 4), 1916], [a - (sgn < 0 ? 26 : 4), 1918], [a - (sgn < 0 ? 22 : 0), 1890]])}" fill="${C.boot}" ${L()}/>`);
  }
  // coat (navy cotton), knee length, crossed collar, sash
  add(`<path d="${smooth([[360, 500], [334, 640], [330, 900], [338, 1160], [500, 1180], [662, 1160], [670, 900], [666, 640], [640, 500], [560, 476], [500, 520], [440, 476]])}" fill="${C.coat}" ${L()}/>`);
  add(`<path d="${smooth([[600, 520], [640, 700], [650, 900], [662, 1160], [600, 1170], [610, 900], [600, 700]])}" fill="${C.coatS}"/>`);
  add(`<path d="M452,486 L560,640 L566,1172" fill="none" ${L(3)}/>`);
  add(`<path d="M448,480 L500,560 L552,480 L566,492 L500,600 L434,492Z" fill="${C.shirt}" ${L(3)}/>`);
  add(`<path d="${smooth([[334, 872], [500, 884], [668, 872], [670, 918], [500, 930], [332, 918]])}" fill="${C.sash}" ${L(3)}/>`);
  add(`<path d="${smooth([[540, 920], [552, 1010], [536, 1080], [566, 1080], [580, 1010], [570, 920]])}" fill="${C.sash}" ${L(3)}/>`);
  // left arm hanging, fist
  add(`<path d="${smooth([[640, 504], [700, 600], [722, 800], [716, 980], [652, 990], [650, 800], [626, 620]])}" fill="${C.coat}" ${L()}/>`);
  add(`<path d="${smooth([[654, 976], [714, 974], [720, 1030], [688, 1052], [656, 1032]])}" fill="${C.skin}" ${L(3.4)}/>`);
  // head (close-up face, scaled), with scarf
  const k = 0.73;
  const h = front(E, T ? { headOnly: true, hat: false, headscarf: 'tokyo', noScarf: true } : { headOnly: true });
  add(`<g transform="translate(${f(500 - 300 * k)},${f(118 - 136 * k)}) scale(${k})">${h.body}</g>`);
  // right arm raised to the spear
  add(`<path d="${smooth([[362, 506], [300, 600], [282, 760], [338, 790], [392, 690], [418, 640]])}" fill="${C.coat}" ${L()}/>`);
  add(shaft(0.48, 1));
  const dx = sp1[0] - sp0[0], dy = sp1[1] - sp0[1], Ls = Math.hypot(dx, dy), ux = dx / Ls, uy = dy / Ls;
  const tip = [sp1[0] + ux * 120, sp1[1] + uy * 120];
  add(`<path d="M${f(sp1[0] - uy * 16)},${f(sp1[1] + ux * 16)} L${f(tip[0])},${f(tip[1])} L${f(sp1[0] + uy * 16)},${f(sp1[1] - ux * 16)} L${f(sp1[0] - ux * 8)},${f(sp1[1] - uy * 8)}Z" fill="${C.steel}" ${L()}/>`);
  for (let j = 0; j < 7; j++) {
    const a = Math.atan2(uy, ux) + Math.PI + (j - 3) * 0.16;
    add(`<path d="M${f(sp1[0])},${f(sp1[1])} q${f(Math.cos(a) * 30 + 6)},${f(Math.sin(a) * 30 + 22)} ${f(Math.cos(a) * 44 + 14)},${f(Math.sin(a) * 44 + 66)}" stroke="${C.red}" stroke-width="9" fill="none" stroke-linecap="round"/>`);
  }
  const gp = at(0.84);
  if (!T) {
  add(`<path d="M${f(gp[0])},${f(gp[1])} L${f(gp[0] + 4)},${f(gp[1] + 48)}" stroke="${C.line}" stroke-width="4"/>`);
  const gx = gp[0] + 4, gy = gp[1] + 46;
  add(`<path d="M${f(gx)},${f(gy)} c-15,0 -17,22 -9,30 c-28,9 -32,68 9,72 c41,-4 37,-63 9,-72 c8,-8 6,-30 -9,-30Z" fill="${C.gourd}" ${L(3.4)}/>`);
  add(`<path d="M${f(gx + 16)},${f(gy + 50)} q14,12 8,44" stroke="${C.gourdS}" stroke-width="7" fill="none" stroke-linecap="round"/>`);
  }
  add(`<path d="${smooth([[380, 616], [430, 604], [446, 648], [424, 680], [382, 672]])}" fill="${C.skin}" ${L(3.4)}/>`);
  const bg = opts.bg ?? '#dfe6ec';
  if (opts.inner) return { defs: h.defs, body: o };
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 2000"><defs>${h.defs}</defs><rect width="1000" height="2000" fill="${bg}"/><path d="M0,1860 Q500,1820 1000,1870 L1000,2000 L0,2000Z" fill="#fff" opacity="0.9"/>${o}${opts.snow === false ? '' : snowfall(150, 5)}</svg>`;
}
