// The full "safe" keyframe board for v4 (owner 2026-11-08: no hands, no side-character faces, few close-ups, no prop
// handling, real motion only, simple transitions). FRAMES = one still per narration beat; t = index.
//   node render.mjs stills <dir> 0,1,...,37 --comp=board/safe2.mjs --hooks=tex_demo/hooksA.mjs
import { f2, lg, rg, flames, vtext, snow, palmPrint } from '../lib.mjs';
import { loadTakes, frameSVG as v2Frame, stamp } from '../film.mjs';
import { lin, EX } from '../../chars/rig/linchong.mjs';
import { xiushu } from '../cast/xiushu.mjs';
import { KEYS } from './v4new.mjs';
import * as PUSH from './pushtest.mjs';
import * as GAO from '../cast/v4/gao.mjs';
import * as WIFE from '../cast/v4/wife.mjs';
import * as GUARD from '../cast/v4/guard.mjs';

const takes = await loadTakes();
const v2 = (s, hide = []) => { globalThis.HIDE_LAYERS = new Set(hide); const r = v2Frame(takes, s, { clean: true }); globalThis.HIDE_LAYERS = null; return r; };
const sil = (id, col, rim) => `<filter id="${id}" x="-30%" y="-30%" width="160%" height="160%" color-interpolation-filters="sRGB"><feFlood flood-color="${col}"/><feComposite in2="SourceAlpha" operator="in" result="s"/>` +
  (rim ? `<feFlood flood-color="${rim}"/><feComposite in2="SourceAlpha" operator="in" result="r"/><feOffset in="r" dx="4" dy="-3" result="ro"/><feComposite in="ro" in2="SourceAlpha" operator="out" result="rim"/><feMerge><feMergeNode in="rim"/><feMergeNode in="s"/></feMerge>` : '') + `</filter>`;
const silG = (fid, tf, inner, op = 1, blur = null) => `<g opacity="${op}"${blur ? ` filter="url(#${blur})"` : ''}><g filter="url(#${fid})" transform="${tf}">${inner}</g></g>`;

// ---------------------------------------------------------------- the letter on the table (T01 S01 table, no hand)
export const SH = { x: 760, y: 112, w: 680, h: 760, rot: -4, sy: 0.92 };
export const sheet = (inner) => `<g transform="translate(${SH.x + SH.w / 2} ${SH.y + (SH.h * SH.sy) / 2}) rotate(${SH.rot}) scale(1 ${SH.sy}) translate(${-SH.w / 2} ${-SH.h / 2})">${inner}</g>`;
export const table = () => v2(4.9, ['t01hand', 't01herfingers', 't01sheet']);
export const drop = (x, y, r = 9) => `<path d="M${x},${y - r * 2.2} C${x + r * 0.9},${y - r * 0.6} ${x + r},${y + r * 0.6} ${x},${y + r} C${x - r},${y + r * 0.6} ${x - r * 0.9},${y - r * 0.6} ${x},${y - r * 2.2}Z" fill="#DDF0FA" opacity="0.9"/><circle cx="${x - r * 0.3}" cy="${y}" r="${r * 0.3}" fill="#fff"/>`;
export function letter(o = {}) {
  let inner = xiushu({ w: SH.w, h: SH.h, id: 'sb' + (o.id || 'x'), sign: o.sign ?? 1, print: o.print ?? 1, bloom: o.bloom || 0 });
  if (o.writeTo != null) {
    // being written: only the heading and the first columns have ink; the column in progress is still wet
    inner = `<clipPath id="sbw${o.id}"><rect x="${SH.w * o.writeTo}" y="0" width="${SH.w}" height="${SH.h}"/></clipPath><rect width="${SH.w}" height="${SH.h}" fill="#EFE2C4"/><g clip-path="url(#sbw${o.id})">${inner}</g>` +
      `<rect x="${SH.w * o.writeTo}" y="80" width="46" height="300" fill="#2a1d14" opacity="0.06"/>`;
  }
  return sheet(inner);
}
export const darken = (op, light = true) => `<rect width="1920" height="1080" fill="#0b0705" opacity="${op}"/>` + (light ? `<defs>${rg('sbl', [[0, '#FFC46A', 0.45], [1, '#FFC46A', 0]], 0.5, 0.5, 0.5)}</defs><ellipse cx="1100" cy="440" rx="760" ry="560" fill="url(#sbl)" style="mix-blend-mode:screen"/>` : '');

export const N_letter = () => table() + letter({ id: 'a' });
export const N_tear = (n = 1) => table() + letter({ id: 'b', bloom: 0.75 }) + drop(1388, 40, 11) + (n > 1 ? drop(1240, 260, 9) + drop(1460, 520, 8) : '');
export const N_write = () => table() + letter({ id: 'c', writeTo: 0.6, print: 0, sign: 0 });
export function N_lantern() {
  // night: the same letter on the table in one lantern's light; a tear has fallen on 休
  let s = table() + letter({ id: 'd', bloom: 0.6 }) + darken(0.62);
  s += `<g transform="translate(300 120)"><line x1="0" y1="-200" x2="0" y2="0" stroke="#1a120c" stroke-width="5"/><rect x="-70" y="0" width="140" height="190" rx="18" fill="#F2B45C"/><rect x="-70" y="0" width="140" height="190" rx="18" fill="none" stroke="#3a2416" stroke-width="5"/>` +
    `<line x1="-70" y1="63" x2="70" y2="63" stroke="#3a2416" stroke-width="3"/><line x1="-70" y1="127" x2="70" y2="127" stroke="#3a2416" stroke-width="3"/><ellipse cx="0" cy="95" rx="260" ry="260" fill="#FFB24A" opacity="0.12"/></g>`;
  return s + drop(1386, 30, 11);
}

// ---------------------------------------------------------------- 岳庙 wall: the scuffle in shadow
function wall(lantern = true) {
  let s = `<defs>${lg('sbwall', [[0, '#C9573E'], [1, '#9E3B2A']], 0, 0, 1, 0)}${rg('sbsun', [[0, '#FFE6B0', 0.55], [1, '#FFE6B0', 0]], 0.45, 0.42, 0.62)}${sil('sbsh', '#3A1712')}<filter id="sbsoft"><feGaussianBlur stdDeviation="3"/></filter></defs>`;
  s += `<rect width="1920" height="1080" fill="url(#sbwall)"/>`;
  for (let i = 0; i < 9; i++) s += `<rect x="${i * 230 - 40}" y="0" width="6" height="1080" fill="#8A3324" opacity="0.4"/>`;
  s += `<rect x="0" y="860" width="1920" height="220" fill="#7A5A44"/><rect x="0" y="852" width="1920" height="12" fill="#5E4231"/>`;
  for (let i = 0; i < 14; i++) s += `<rect x="${i * 150}" y="864" width="3" height="216" fill="#5E4231" opacity="0.5"/>`;
  s += `<rect width="1920" height="1080" fill="url(#sbsun)" style="mix-blend-mode:screen"/>`;
  if (lantern) s += gaoLantern(260, 250, 1);
  return s;
}
export function gaoLantern(x, y, k) {
  return `<g transform="translate(${x} ${y}) scale(${k})"><line x1="0" y1="-260" x2="0" y2="0" stroke="#2A1C17" stroke-width="6"/><ellipse cx="0" cy="90" rx="110" ry="130" fill="#E9C27A"/><ellipse cx="0" cy="90" rx="110" ry="130" fill="none" stroke="#7A3A22" stroke-width="6"/>` +
    `<rect x="-60" y="-50" width="120" height="16" fill="#3A2216"/><rect x="-60" y="214" width="120" height="16" fill="#3A2216"/><text x="0" y="96" font-family="Ma Shan Zheng" font-size="110" fill="#8E1F17" text-anchor="middle" dominant-baseline="middle">高</text></g>`;
}
const shadow = (inner, x, rot = 0, op = 0.72) => silG('sbsh', `translate(${x} 870) skewX(-14) rotate(${rot})`, inner, op, 'sbsoft');
const linA = (pose, h = 800) => lin({ view: 'side', costume: 'A', height: h, x: 0, y: 0, flip: false, pose });
function N_temple1() { // W07 someone accosts her: his shadow leans in over hers
  return wall(true) + shadow(WIFE.draw({ view: 'back34', height: 600, x: 0, y: 0 }), 820) + shadow(GAO.draw({ view: 'side', height: 740, x: 0, y: 0, flip: true }), 640, 8);
}
// 林冲 grabbing (far arm forward) with the fist cocked above his head: in shadow the raised arm is one simple shape
// (sleeve, forearm, fist) hung from the rig's shoulder, so no drawn fingers ever appear
function linGrabFist(h = 800) {
  const info = {};
  const fig = lin({ view: 'side', costume: 'A', height: h, x: 0, y: 0, flip: false, info, pose: { shoulderL: 6, elbowL: 4, shoulderR: 88, elbowR: 4, torso: 8, legL: 20, kneeL: 25, legR: -15, kneeR: 5 } });
  const H = h / 7.5, S = info.shoulderNear;
  const E = [S[0] + 0.85 * H, S[1] - 0.35 * H], F = [E[0] + 0.1 * H, E[1] - 0.95 * H];
  const n = (a, b, w) => { const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy); return [(-dy / l) * w, (dx / l) * w]; };
  const [ax, ay] = n(S, E, 0.3 * H), [bx, by] = n(E, F, 0.17 * H);
  const arm = `<path d="M${S[0] + ax},${S[1] + ay} L${E[0] + ax * 0.9},${E[1] + ay * 0.9} L${F[0] + bx},${F[1] + by} L${F[0] - bx},${F[1] - by} L${E[0] - ax * 0.9},${E[1] - ay * 0.9} L${S[0] - ax},${S[1] - ay}Z" fill="#000"/><circle cx="${F[0]}" cy="${F[1] - 0.08 * H}" r="${0.25 * H}" fill="#000"/>`;
  return fig + arm;
}
function N_temple2() { // W08 林冲 seizes him and the fist goes up
  return wall(true) + shadow(GAO.draw({ view: 'side', height: 740, x: 0, y: 0, flip: true }), 700, -9) + shadow(linGrabFist(), 1180);
}
function N_temple3() { // W09 who he is: the 高 lantern close, the scuffle small on the wall behind
  let s = wall(false);
  s += shadow(GAO.draw({ view: 'side', height: 440, x: 0, y: 0, flip: true }), 1180, -9, 0.5) + shadow(linGrabFist(470), 1500, 0, 0.5);
  s += `<rect width="1920" height="1080" fill="#000" opacity="0.12"/>` + gaoLantern(620, 300, 2.1);
  return s;
}
function N_temple4() { // W10 the fist comes down; the young lord walks off, 林冲's shadow bows its head
  return wall(true) + shadow(GAO.draw({ view: 'side', height: 740, x: 0, y: 0, flip: false }), 520, 0, 0.55) +
    shadow(linA({ shoulderL: 8, elbowL: 10, shoulderR: 4, torso: 12, headTilt: -14 }), 1240);
}

// ---------------------------------------------------------------- 陆谦: two cups and a leaving shadow
function N_lu() {
  let s = `<defs>${lg('sbbg2', [[0, '#3E2A1E'], [1, '#22170F']])}${rg('sblamp2', [[0, '#FFD996', 0.6], [1, '#FFD996', 0]], 0.5, 0.5, 0.5)}${sil('sbsh2', '#2A1A10')}<filter id="sbb2"><feGaussianBlur stdDeviation="5"/></filter></defs>`;
  s += `<rect width="1920" height="1080" fill="url(#sbbg2)"/><rect x="160" y="80" width="1600" height="560" fill="#E8D2A6"/>`;
  for (let i = 1; i < 8; i++) s += `<rect x="${160 + i * 200 - 4}" y="80" width="8" height="560" fill="#5A3E2B"/>`;
  for (let j = 1; j < 3; j++) s += `<rect x="160" y="${80 + j * 186 - 4}" width="1600" height="8" fill="#5A3E2B"/>`;
  s += silG('sbsh2', 'translate(1420 650)', lin({ view: 'side', costume: 'A', height: 760, x: 0, y: 0, flip: true, pose: { legR: 22, legL: -18, shoulderR: -10, shoulderL: 20 } }), 0.55, 'sbb2');
  s += `<rect x="0" y="700" width="1920" height="380" fill="#4A3121"/><rect x="0" y="690" width="1920" height="14" fill="#2E1E14"/><ellipse cx="960" cy="760" rx="520" ry="60" fill="url(#sblamp2)" opacity="0.6"/>`;
  const cup = (x, full) => `<path d="M${x - 60},720 L${x + 60},720 L${x + 44},790 L${x - 44},790Z" fill="#E9E4D8" stroke="#2A1C17" stroke-width="3"/><ellipse cx="${x}" cy="720" rx="60" ry="14" fill="${full ? '#B98A3E' : '#3B2A1E'}" stroke="#2A1C17" stroke-width="3"/>`;
  s += cup(760, false) + cup(1180, true);
  s += `<path d="M930,650 C905,660 900,700 915,740 L1005,740 C1020,700 1015,660 990,650 L985,600 L935,600Z" fill="#DDE3E0" stroke="#2A1C17" stroke-width="3"/><path d="M990,660 C1040,650 1060,620 1080,600" fill="none" stroke="#2A1C17" stroke-width="5"/>`;
  s += `<rect x="1380" y="900" width="420" height="80" rx="30" fill="#6E2F28"/><rect x="1380" y="900" width="420" height="80" rx="30" fill="none" stroke="#2A1C17" stroke-width="3"/>`;
  return s;
}

// ---------------------------------------------------------------- the road out (backlit silhouettes, far away)
function N_road(snowy = false) {
  let s = `<defs>${lg('sbsky', snowy ? [[0, '#8E9BAE'], [1, '#D9DEE6']] : [[0, '#E9C98F'], [1, '#F6E6C4']])}${sil('sbsh3', snowy ? '#2A2F38' : '#3A2A1C')}</defs>`;
  s += `<rect width="1920" height="1080" fill="url(#sbsky)"/>`;
  s += `<path d="M0,610 C300,590 600,600 960,585 C1300,600 1600,590 1920,605 L1920,1080 L0,1080Z" fill="${snowy ? '#C9CFD8' : '#D9B77E'}"/>`;
  s += `<path d="M0,640 C400,628 700,632 1920,622 L1920,660 C700,668 400,672 0,676Z" fill="${snowy ? '#AEB6C2' : '#C29A5E'}" opacity="0.6"/>`;
  s += `<path d="M860,1080 L940,600 L980,600 L1180,1080Z" fill="${snowy ? '#B4BCC8' : '#C9A56C'}"/>`;
  for (let i = 0; i < 7; i++) s += `<path d="M${120 + i * 270},${600 - (i % 3) * 8} l20,-140 l20,140Z" fill="${snowy ? '#7E8796' : '#9A8A64'}" opacity="0.7"/>`;
  const C = { view: 'side', costume: snowy ? 'C' : 'A', height: 150, y: 0, flip: true };
  const walk = (ph) => ({ legR: 16 * ph, legL: -16 * ph, kneeR: 8, kneeL: 8 });
  s += silG('sbsh3', 'translate(930 640)', lin({ ...C, x: 0, pose: walk(1), cangue: !snowy, col: { robe: '#3B4356' }, headCloth: 'plain', props: snowy ? { spear: { hand: 'R', angle: -35, grip: 0.4 } } : undefined }));
  if (!snowy) {
    s += silG('sbsh3', 'translate(880 635) scale(0.92)', GUARD.draw({ view: 'side', height: 150, x: 0, y: 0, flip: true }));
    s += silG('sbsh3', 'translate(1010 642) scale(0.98)', GUARD.draw({ view: 'side', height: 150, x: 0, y: 0, flip: true }));
  }
  if (snowy) s += snow(2.0, { n: 220, seed: 11, r: [1.5, 4] });
  return s;
}

// ---------------------------------------------------------------- the threat at home: the 高 lantern, his shadow on the house
function N_threat() {
  let s = v2(34.6);
  s += `<defs>${sil('sbsh4', '#140C0C')}<filter id="sbb4"><feGaussianBlur stdDeviation="4"/></filter></defs>`;
  s += silG('sbsh4', 'translate(560 1120) skewX(18)', GAO.draw({ view: 'side', height: 1050, x: 0, y: 0, flip: true }), 0.55, 'sbb4');
  return s + gaoLantern(1700, 230, 1.1);
}

// ---------------------------------------------------------------- the fight: a real-motion thrust in silhouette
function N_thrust() {
  let s = `<defs>${lg('sbsky5', [[0, '#2A0F0A'], [0.6, '#7A2A14'], [1, '#C8572A']])}${lg('sbg5', [[0, '#B5653A'], [1, '#3A1A10']])}${sil('sbs5', '#0F0907', '#FF9A4A')}</defs>`;
  s += `<rect width="1920" height="1080" fill="url(#sbsky5)"/>` + flames(0.4, { x0: 700, x1: 1920, y: 760, h: 420, n: 18, seed: 3 });
  s += `<path d="M0,760 C500,740 1300,750 1920,735 L1920,1080 L0,1080Z" fill="url(#sbg5)"/>`;
  const sp = { hand: 'R', angle: 92, grip: 0.8 };
  s += silG('sbs5', 'translate(760 830)', lin({ view: 'side', costume: 'C', height: 600, x: 0, y: 0, flip: true, pose: { legR: 48, kneeR: 80, legL: -32, kneeL: 12, torso: 22, shoulderR: 70, elbowR: 10, spear: sp }, props: { spear: sp } }));
  s += silG('sbs5', 'translate(1500 700) rotate(-58)', GUARD.draw({ view: 'side', height: 560, x: 0, y: 0, flip: false }));
  return s + snow(3.0, { n: 120, seed: 4 });
}

// ---------------------------------------------------------------- 林冲 listening, the promise brushed beside him
export const N_listen = (brush) => {
  let s = v2(11.6, ['t01gh', 't01her3']);
  if (brush) s += `<rect x="0" y="0" width="760" height="1080" fill="#120D0A" opacity="0.35"/>` + vtext('依旧夫妻完聚', 300, 150, 120, { fill: '#F2E4C4', sp: 128 });
  return s;
};

// [line, picture, fn]
export const FRAMES = [
  ['W01–03 东京八十万禁军教头林冲…情愿立此休书 · 这是林冲留给妻子的休书', 'The letter on the table. No hand: the print is already pressed, the brush rests on the inkstone.', N_letter],
  ['W04 成亲三年，两人没红过一次脸', 'Home at night: two shadows behind the lit window.', () => v2(33.0)],
  ['W05 他为什么要休了她？', 'A tear lands on 「休」 and blooms.', () => N_tear(1)],
  ['— title', '林冲 brushed; the emblem silhouette (kept).', () => v2(24.0)],
  ['W06 那时候，他有一身本事，', 'The drill ground (wide; hands tiny).', () => v2(28.6)],
  ['W06 有一个家。', 'The lit window again.', () => v2(34.6)],
  ['W07 直到那天在岳庙，有人调戏他的娘子。', 'On the temple wall: her shadow; a man\'s shadow leans in.', N_temple1],
  ['W08 他一把扳过那人，拳头举起来——', '林冲\'s shadow seizes him; the fist goes up (shadow only).', N_temple2],
  ['W09 却认出，那是上司高太尉的干儿子。', 'The 高 lantern, close. Who he is, without his face.', N_temple3],
  ['W10 拳头，软了。', 'The fist comes down; the young lord walks off; 林冲\'s shadow bows.', N_temple4],
  ['W11 连最好的朋友陆谦，也站到了他们那边。', 'Two cups (his untouched), the empty cushion, his shadow leaving.', N_lu],
  ['W12 一把宝刀，把他引进了白虎节堂。', '白虎节堂: 林冲 small in the light, the accusing silhouette.', () => v2(59.3)],
  ['W13 刺了面，押往沧州。', 'In the cangue under the shaft of light (medium).', () => v2(61.6)],
  ['W14 临走前，他请人写了这封休书。', 'The letter writing itself: ink appearing column by column.', N_write],
  ['W15 他怕自己死在路上，', 'The road out: three figures far away, backlit.', () => N_road(false)],
  ['W16 更怕高衙内逼她，误了她一辈子。', 'Home: the 高 lantern at the gate, a big shadow over the house.', N_threat],
  ['W17 她哭着问：我清清白白，你为什么不要我？', 'Tears falling onto the letter.', () => N_tear(3)],
  ['W18 他只说：我是好意。', 'Close-up 1: 林冲 in the cangue. No one else in frame.', () => N_listen(false)],
  ['W19 岳父说：放你回来时，依旧夫妻完聚。', 'The promise brushed beside him.', () => N_listen(true)],
  ['W20 为了这句话，他忍着活下去。', 'The road turns to snow.', () => N_road(true)],
  ['W21 沧州下了大雪，压塌了他的草屋。', 'The depot roof caves in (wide) + 沧州 stamp.', () => v2(75.4) + stamp(75.4)],
  ['W22 他躲进山神庙，草料场却烧了起来。', 'The stone to the door (real motion, wide).', () => PUSH.frameSVG(1.0).replace(/^<svg[^>]*>|<\/svg>$/g, '')],
  ['W23–24 门外是陆谦的声音：烧死了…', 'Through the crack: three silhouettes against the fire.', () => v2(84.2)],
  ['W25 回不去了。', 'Close-up 2: his eyes in the slit of fire light.', () => v2(91.6)],
  ['W26 他一把拽开庙门。', 'The doors open; the camera stays still.', () => KEYS.K26()],
  ['W27 一枪戳倒差拨，再一枪，追倒了逃跑的富安。', 'The thrust: moving silhouettes from real motion capture.', N_thrust],
  ['W28 陆谦被他掀翻在雪里，刀，就搁在脸上。', 'Silhouette: 陆谦 down in the snow, the blade at his face.', () => KEYS.K29()],
  ['W29 杀人可恕，情理难容！', 'Close-up 3: his face in fire light.', () => KEYS.K30()],
  ['W30 这一回，他没有再忍。', 'The blow is a cut to ink.', () => KEYS.K31()],
  ['W31 再后来，他落草梁山。', 'A lone figure in the snow night.', () => v2(98.6)],
  ['W32 他想接娘子上山，却一拖再拖。', 'The pier; the seasons turn.', () => v2(103.0)],
  ['W33 派去的人回来说：娘子被逼自尽，已故半载。', 'The boat comes in; 「已故半载」 brushed with the voice.', () => v2(113.3)],
  ['W34–35 他哭了。那封休书，没能护住她。', 'The letter in one lantern\'s light; a tear has fallen on it.', N_lantern],
  ['W36 他立下它，只是想让她好好活着。', 'The letter and the print.', () => v2(129.6)],
  ['W37 从此，他心里再没有可挂念的人。', 'The dark window.', () => v2(119.5)],
  ['W38 依旧夫妻完聚——', 'Brushed over the letter.', () => v2(135.3)],
  ['W39 这句话，他终究没能等到。', 'Only the print remains. No fist.', () => v2(136.6)],
  ['— end card', 'Title 《林冲为什么要休妻？》, follow, 下回, sources.', () => v2(145.5)],
];
export const DUR = FRAMES.length;
export function frameSVG(t) {
  const f = FRAMES[Math.max(0, Math.min(FRAMES.length - 1, Math.round(t)))];
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1920" height="1080" viewBox="0 0 1920 1080"><rect width="1920" height="1080" fill="#000"/>${f[2]()}</svg>`;
}
