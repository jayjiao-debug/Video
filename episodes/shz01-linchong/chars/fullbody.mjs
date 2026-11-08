// 林冲 full body in his best-known look, 风雪山神庙 (第十回): 毡笠, 白布衫 under a pale
// cloak, 花枪 over the shoulder with the wine gourd hanging from it, red tassel, 金印 on the
// cheek. Front (standing) and side (walking into the wind). Canvas 1000 x 2000.
import { frontSVG, sideSVG, PAL } from './styles.mjs';
import { smooth, poly, f, NEUTRAL, EXPR } from './geom.mjs';

const OUTL = (S, w = 7) => `stroke="${S.line}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;
const XS = {
  B: { tunic: '#f5f3ec', trousers: '#3a4049', boots: '#24282e', wrap: '#cfd3d6', wood: '#6e4b2c', woodHi: '#9a6c41', steel: '#d3dade', gourd: '#b98140', gourdS: '#80552a', bg: '#e9eef2', snowBg: '#c9d3dc' },
  P: { tunic: '#eef2f5', trousers: '#262c34', boots: '#15181c', wrap: '#9aa4ae', wood: '#4e3520', woodHi: '#7c5532', steel: '#c3ccd2', gourd: '#a8712f', gourdS: '#6a4521', bg: '#1b2430', snowBg: '#2a3644' },
};

function snowfall(n, seed, w = 1000, h = 2000) {
  let s = seed, out = '';
  const r = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  for (let i = 0; i < n; i++) {
    const rr = 1.5 + r() * r() * 7;
    out += `<circle cx="${f(r() * w)}" cy="${f(r() * h)}" r="${f(rr)}" fill="#ffffff" opacity="${f(0.55 + r() * 0.45)}"/>`;
  }
  return out;
}

const gourdShape = (x, y, k = 1) => `M${f(x)},${f(y)} c${f(-14 * k)},0 ${f(-16 * k)},${f(20 * k)} ${f(-8 * k)},${f(28 * k)} c${f(-26 * k)},${f(8 * k)} ${f(-30 * k)},${f(62 * k)} ${f(8 * k)},${f(66 * k)} c${f(38 * k)},${f(-4 * k)} ${f(34 * k)},${f(-58 * k)} ${f(8 * k)},${f(-66 * k)} c${f(8 * k)},${f(-8 * k)} ${f(6 * k)},${f(-28 * k)} ${f(-8 * k)},${f(-28 * k)}Z`;

export function fullFront(style = 'B', E = EXPR['隐忍'], opts = {}) {
  const S = PAL[style], X = XS[style];
  const L = OUTL(S), Li = OUTL(S, 4);
  let o = '';
  const add = (s) => (o += s + '\n');
  // spear, back part (behind the body): from behind the right hip up over his right shoulder
  const sp0 = [760, 1160], sp1 = [70, 130];
  const at = (t) => [sp0[0] + (sp1[0] - sp0[0]) * t, sp0[1] + (sp1[1] - sp0[1]) * t];
  add(`<path d="M${f(sp0[0])},${f(sp0[1])} L${f(at(0.55)[0])},${f(at(0.55)[1])}" stroke="${S.line}" stroke-width="20" stroke-linecap="round"/><path d="M${f(sp0[0])},${f(sp0[1])} L${f(at(0.55)[0])},${f(at(0.55)[1])}" stroke="${X.wood}" stroke-width="11" stroke-linecap="round"/>`);
  // legs, wraps (绑腿), boots
  for (const [x0, x1, b] of [[424, 498, 1], [504, 578, -1]]) {
    add(`<path d="${poly([[x0, 1300], [x1, 1300], [x1 - 6, 1770], [x0 + 6, 1770]])}" fill="${X.trousers}" ${L}/>`);
    add(`<path d="${poly([[x0 + 4, 1610], [x1 - 4, 1610], [x1 - 8, 1772], [x0 + 8, 1772]])}" fill="${X.wrap}" ${Li}/>`);
    for (let k = 0; k < 5; k++) add(`<path d="M${x0 + 6},${1630 + k * 30} L${x1 - 6},${1612 + k * 30}" stroke="${S.line}" stroke-width="3" opacity="0.6"/>`);
    add(`<path d="${smooth([[x0 + 2, 1766], [x1 - 2, 1766], [x1 + (b > 0 ? 0 : 10), 1860], [x1 + 14 * (b > 0 ? 0 : 1), 1892], [x0 - 18 * (b > 0 ? 1 : 0), 1894], [x0 - 4, 1850]])}" fill="${X.boots}" ${L}/>`);
  }
  // cloak (白布衫 under a pale padded cloak), blown a little to his left by the wind
  const cloak = [[332, 466], [262, 560], [238, 800], [226, 1100], [206, 1410], [300, 1446], [420, 1420], [500, 1452], [600, 1424], [720, 1456], [820, 1418],
    [770, 1100], [752, 800], [732, 560], [668, 466], [560, 438], [500, 470], [440, 438]];
  const nx = (pts) => pts.map(([x, y]) => [500 + (x - 500) * 0.86, y]);
  add(`<path d="${smooth(nx(cloak))}" fill="${S.cloak}" ${L}/>`);
  add(`<path d="${smooth(nx([[668, 470], [732, 560], [752, 800], [770, 1100], [820, 1418], [720, 1456], [660, 1100], [640, 800], [628, 560]]))}" fill="${S.cloakS}" opacity="0.85"/>`);
  add(`<path d="${smooth([[300, 700], [282, 1000], [270, 1380]], false)}" fill="none" stroke="${S.cloakS}" stroke-width="6" opacity="0.9"/>`);
  // tunic panel and the cloth belt (搭膊)
  add(`<path d="${poly([[456, 470], [544, 470], [592, 1330], [408, 1330]])}" fill="${X.tunic}" ${Li}/>`);
  add(`<path d="${poly([[452, 470], [500, 560], [548, 470], [530, 462], [500, 520], [470, 462]])}" fill="${S.cloakT}" ${Li}/>`);
  add(`<path d="${poly([[432, 806], [568, 806], [574, 852], [426, 852]])}" fill="${S.cloakT}" ${Li}/>`);
  add(`<path d="${smooth([[520, 850], [530, 930], [516, 1010], [540, 1010], [552, 930], [544, 850]])}" fill="${S.cloakT}" ${Li}/>`);
  // left arm hanging, fist
  add(`<path d="${smooth([[650, 480], [716, 600], [742, 820], [736, 990], [666, 1000], [664, 820], [630, 620]])}" fill="${S.cloak}" ${L}/>`);
  add(`<path d="${smooth([[672, 990], [730, 990], [734, 1044], [702, 1064], [670, 1044]])}" fill="${S.skin}" ${L}/>`);
  // head (close-up rig, scaled), wearing the hat
  const head = frontSVG(style, E, { inner: true, headOnly: true, hat: true, tattoo: true, costume: 'snow' });
  const k = 0.47;
  add(`<g transform="translate(${f(500 - 400 * k)},${f(318 - 470 * k)}) scale(${k})">${head.out}</g>`);
  // right arm raised, hand on the shaft in front of the shoulder
  add(`<path d="${smooth([[352, 476], [284, 580], [272, 720], [330, 742], [384, 660], [410, 600]])}" fill="${S.cloak}" ${L}/>`);
  // spear, front part from the hand to the head, red tassel, gourd hanging near the tip
  add(`<path d="M${f(at(0.5)[0])},${f(at(0.5)[1])} L${f(sp1[0])},${f(sp1[1])}" stroke="${S.line}" stroke-width="20" stroke-linecap="round"/><path d="M${f(at(0.5)[0])},${f(at(0.5)[1])} L${f(sp1[0])},${f(sp1[1])}" stroke="${X.wood}" stroke-width="11" stroke-linecap="round"/>`);
  add(`<path d="M${f(at(0.5)[0] - 3)},${f(at(0.5)[1] - 6)} L${f(sp1[0] + 4)},${f(sp1[1] - 2)}" stroke="${X.woodHi}" stroke-width="3" stroke-linecap="round"/>`);
  const dx = sp1[0] - sp0[0], dy = sp1[1] - sp0[1], Ls = Math.hypot(dx, dy), ux = dx / Ls, uy = dy / Ls;
  const tip = [sp1[0] + ux * 120, sp1[1] + uy * 120];
  add(`<path d="${poly([[sp1[0] - uy * 16, sp1[1] + ux * 16], [tip[0], tip[1]], [sp1[0] + uy * 16, sp1[1] - ux * 16], [sp1[0] - ux * 8, sp1[1] - uy * 8]])}" fill="${X.steel}" ${L}/>`);
  for (let j = 0; j < 7; j++) {
    const a = Math.atan2(uy, ux) + Math.PI + (j - 3) * 0.16;
    add(`<path d="M${f(sp1[0])},${f(sp1[1])} q${f(Math.cos(a) * 30 + 6)},${f(Math.sin(a) * 30 + 20)} ${f(Math.cos(a) * 46 + 14)},${f(Math.sin(a) * 46 + 64)}" stroke="${S.red}" stroke-width="9" fill="none" stroke-linecap="round"/>`);
  }
  const gp = at(0.86);
  add(`<path d="M${f(gp[0])},${f(gp[1])} L${f(gp[0] + 4)},${f(gp[1] + 46)}" stroke="${S.line}" stroke-width="4"/>`);
  add(`<path d="${gourdShape(gp[0] + 4, gp[1] + 44, 1.1)}" fill="${X.gourd}" ${L}/>`);
  add(`<path d="M${f(gp[0] + 20)},${f(gp[1] + 92)} q14,10 8,40" stroke="${X.gourdS}" stroke-width="7" fill="none" stroke-linecap="round"/>`);
  add(`<path d="${smooth([[352, 580], [404, 566], [424, 610], [400, 646], [356, 638]])}" fill="${S.skin}" ${L}/>`);
  const bg = `<rect width="1000" height="2000" fill="${X.bg}"/><path d="M0,1820 Q500,1770 1000,1830 L1000,2000 L0,2000Z" fill="#ffffff" opacity="${style === 'P' ? 0.12 : 0.9}"/>`;
  const fig = opts.silhouette ? `<g filter="url(#silF)">${o}</g>` : o;
  const defs = `<defs>${head.defs}<filter id="silF"><feColorMatrix type="matrix" values="0 0 0 0 0.08  0 0 0 0 0.08  0 0 0 0 0.09  0 0 0 1 0"/></filter></defs>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 2000">${defs}${bg}${fig}${opts.silhouette ? '' : snowfall(160, 7)}</svg>`;
}

export function fullSide(style = 'B', E = EXPR['隐忍'], opts = {}) {
  const S = PAL[style], X = XS[style];
  const L = OUTL(S), Li = OUTL(S, 4);
  let o = '';
  const add = (s) => (o += s + '\n');
  const sp0 = [250, 820], sp1 = [900, 190];
  const at = (t) => [sp0[0] + (sp1[0] - sp0[0]) * t, sp0[1] + (sp1[1] - sp0[1]) * t];
  // far leg (behind), striding back
  add(`<path d="${smooth([[500, 1240], [560, 1250], [500, 1520], [430, 1760], [380, 1756], [440, 1510]])}" fill="${X.trousers}" ${L}/>`);
  add(`<path d="${smooth([[440, 1610], [488, 1622], [440, 1770], [396, 1762]])}" fill="${X.wrap}" ${Li}/>`);
  add(`<path d="${smooth([[392, 1748], [446, 1760], [430, 1830], [338, 1846], [326, 1820]])}" fill="${X.boots}" ${L}/>`);
  // spear back part
  add(`<path d="M${f(sp0[0])},${f(sp0[1])} L${f(at(0.45)[0])},${f(at(0.45)[1])}" stroke="${S.line}" stroke-width="20" stroke-linecap="round"/><path d="M${f(sp0[0])},${f(sp0[1])} L${f(at(0.45)[0])},${f(at(0.45)[1])}" stroke="${X.wood}" stroke-width="11" stroke-linecap="round"/>`);
  // cloak streaming back in the wind
  const cloak = [[560, 440], [612, 520], [636, 760], [650, 1060], [668, 1380], [560, 1400], [440, 1392], [300, 1430], [160, 1380], [110, 1300], [220, 1210], [300, 1000],
    [372, 760], [420, 560], [470, 452]];
  add(`<path d="${smooth(cloak)}" fill="${S.cloak}" ${L}/>`);
  add(`<path d="${smooth([[420, 560], [372, 760], [300, 1000], [220, 1210], [110, 1300], [160, 1380], [300, 1430], [330, 1200], [420, 900], [470, 640]])}" fill="${S.cloakS}" opacity="0.85"/>`);
  add(`<path d="${smooth([[560, 820], [600, 1100], [620, 1380]], false)}" fill="none" stroke="${S.cloakS}" stroke-width="6"/>`);
  add(`<path d="${poly([[600, 800], [652, 800], [656, 846], [596, 846]])}" fill="${S.cloakT}" ${Li}/>`);
  // near leg, striding forward
  add(`<path d="${smooth([[540, 1300], [620, 1300], [650, 1520], [690, 1780], [630, 1786], [580, 1530]])}" fill="${X.trousers}" ${L}/>`);
  add(`<path d="${smooth([[600, 1620], [660, 1610], [690, 1786], [632, 1790]])}" fill="${X.wrap}" ${Li}/>`);
  add(`<path d="${smooth([[626, 1776], [694, 1770], [760, 1840], [756, 1866], [620, 1862]])}" fill="${X.boots}" ${L}/>`);
  // head (side rig) with the hat
  const head = sideSVG(style, E, { inner: true, headOnly: true, hat: true, tattoo: true, costume: 'snow' });
  const k = 0.47;
  add(`<g transform="translate(${f(560 - 500 * k)},${f(316 - 430 * k)}) scale(${k})">${head.out}</g>`);
  // arm forward, hand on the shaft at the shoulder
  add(`<path d="${smooth([[470, 470], [560, 470], [610, 560], [640, 640], [600, 690], [530, 600]])}" fill="${S.cloak}" ${L}/>`);
  // spear front part, tassel, gourd hanging near the tip
  add(`<path d="M${f(at(0.42)[0])},${f(at(0.42)[1])} L${f(sp1[0])},${f(sp1[1])}" stroke="${S.line}" stroke-width="20" stroke-linecap="round"/><path d="M${f(at(0.42)[0])},${f(at(0.42)[1])} L${f(sp1[0])},${f(sp1[1])}" stroke="${X.wood}" stroke-width="11" stroke-linecap="round"/>`);
  const dx = sp1[0] - sp0[0], dy = sp1[1] - sp0[1], Ls = Math.hypot(dx, dy), ux = dx / Ls, uy = dy / Ls;
  const tip = [sp1[0] + ux * 110, sp1[1] + uy * 110];
  add(`<path d="${poly([[sp1[0] - uy * 15, sp1[1] + ux * 15], tip, [sp1[0] + uy * 15, sp1[1] - ux * 15], [sp1[0] - ux * 8, sp1[1] - uy * 8]])}" fill="${X.steel}" ${L}/>`);
  for (let j = 0; j < 7; j++) {
    const a = Math.PI + Math.atan2(uy, ux) + (j - 3) * 0.15;
    add(`<path d="M${f(sp1[0])},${f(sp1[1])} q${f(Math.cos(a) * 26 - 20)},${f(Math.sin(a) * 26 + 16)} ${f(Math.cos(a) * 40 - 46)},${f(Math.sin(a) * 40 + 50)}" stroke="${S.red}" stroke-width="9" fill="none" stroke-linecap="round"/>`);
  }
  const gp = at(0.88);
  add(`<path d="M${f(gp[0])},${f(gp[1])} L${f(gp[0] - 6)},${f(gp[1] + 46)}" stroke="${S.line}" stroke-width="4"/>`);
  add(`<path d="${gourdShape(gp[0] - 6, gp[1] + 44, 1.1)}" fill="${X.gourd}" ${L}/>`);
  add(`<path d="${smooth([[596, 590], [646, 584], [660, 630], [628, 660], [592, 642]])}" fill="${S.skin}" ${L}/>`);
  const bg = `<rect width="1000" height="2000" fill="${X.bg}"/><path d="M0,1830 Q500,1790 1000,1840 L1000,2000 L0,2000Z" fill="#ffffff" opacity="${style === 'P' ? 0.12 : 0.9}"/>`;
  const fig = opts.silhouette ? `<g filter="url(#silF2)">${o}</g>` : o;
  const defs = `<defs>${head.defs}<filter id="silF2"><feColorMatrix type="matrix" values="0 0 0 0 0.08  0 0 0 0 0.08  0 0 0 0 0.09  0 0 0 1 0"/></filter></defs>`;
  // footprints behind him
  let fp = '';
  if (!opts.silhouette) for (let i = 0; i < 4; i++) fp += `<ellipse cx="${300 - i * 110}" cy="${1880 + (i % 2) * 14}" rx="34" ry="9" fill="${S.cloakS}" opacity="0.5"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 2000">${defs}${bg}${fp}${fig}${opts.silhouette ? '' : snowfall(160, 11)}</svg>`;
}
