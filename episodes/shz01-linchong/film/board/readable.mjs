// Readability pass (owner 2026-11-08 22:31: "what does 高 mean … I need understandable scenes for viewer").
// Rule for every frame: a scrolling viewer can say in one sentence who is doing what, from the picture alone.
// Literal actions with the same recurring silhouettes, no private symbols (the 高 lantern, the seal, the ink cut).
// Same safety rules as the safe board: no hands, no side-character faces (silhouettes only), no prop handling.
// FRAMES[i] = [line, what the viewer understands, fn, safeIndex]
import { f2, lg, rg, flames, embers, blurId, blurDefs } from '../lib.mjs';
import { loadTakes, frameSVG as v2Frame } from '../film.mjs';
import { lin } from '../../chars/rig/linchong.mjs';
import { KEYS } from './v4new.mjs';
import * as GAO from '../cast/v4/gao.mjs';
import * as GUARD from '../cast/v4/guard.mjs';
import * as LU from '../cast/v4/luqian.mjs';
import * as WIFE from '../cast/v4/wife.mjs';
import * as SCRIBE from '../cast/v4/scribe.mjs';
import { sil, silG, rays, motes, I1, I4, I5 } from './impact.mjs';

const takes = await loadTakes();
const v2 = (s, hide = []) => { globalThis.HIDE_LAYERS = new Set(hide); const r = v2Frame(takes, s, { clean: true }); globalThis.HIDE_LAYERS = null; return r; };

// ---------------------------------------------------------------- the recurring silhouettes
// 高太尉: a big official. The 展脚幞头 (the cap with long straight wings) says "high official" at a glance.
function official(h) {
  const hb = SCRIBE.head({ view: 'front', height: h, x: 0, y: 0 }), hh = hb.head, top = hb.top;
  let s = SCRIBE.draw({ view: 'front', height: h, x: 0, y: 0 });
  s += `<rect x="${f2(-0.62 * hh)}" y="${f2(top - 0.28 * hh)}" width="${f2(1.24 * hh)}" height="${f2(0.8 * hh)}" rx="${f2(0.32 * hh)}" fill="#000"/>`;
  s += `<rect x="${f2(-2.9 * hh)}" y="${f2(top + 0.02 * hh)}" width="${f2(5.8 * hh)}" height="${f2(0.1 * hh)}" rx="${f2(0.05 * hh)}" fill="#000"/>`;
  return s;
}
// 林冲's shadow with one arm raised: the arm is one simple shape (sleeve, forearm, fist); optional knife upright in it
function linRaise(h, o = {}) {
  const info = {};
  const fig = lin({ view: 'side', costume: o.costume || 'A', hat: o.hat, height: h, x: 0, y: 0, flip: false, info, pose: { shoulderL: -4, elbowL: 12, shoulderR: 6, elbowR: 10, torso: 8, legL: 20, kneeL: 25, legR: -15, kneeR: 5 } });
  const H = h / 7.5, S = info.shoulderNear;
  const E = [S[0] + 0.85 * H, S[1] - 0.35 * H], F = [E[0] + 0.1 * H, E[1] - 0.95 * H];
  const n = (a, b, w) => { const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy); return [(-dy / l) * w, (dx / l) * w]; };
  const [ax, ay] = n(S, E, 0.3 * H), [bx, by] = n(E, F, 0.17 * H);
  let s = fig + `<path d="M${S[0] + ax},${S[1] + ay} L${E[0] + ax * 0.9},${E[1] + ay * 0.9} L${F[0] + bx},${F[1] + by} L${F[0] - bx},${F[1] - by} L${E[0] - ax * 0.9},${E[1] - ay * 0.9} L${S[0] - ax},${S[1] - ay}Z" fill="#000"/><circle cx="${F[0]}" cy="${F[1] - 0.08 * H}" r="${0.25 * H}" fill="#000"/>`;
  if (o.knife) {
    const x = F[0] + 0.02 * H, y = F[1] - 0.3 * H;
    s += `<path d="M${f2(x - 0.07 * H)},${f2(y)} L${f2(x + 0.07 * H)},${f2(y)} L${f2(x + 0.03 * H)},${f2(y - 1.05 * H)} L${f2(x - 0.02 * H)},${f2(y - 1.2 * H)}Z" fill="#000"/><rect x="${f2(x - 0.16 * H)}" y="${f2(y - 0.02 * H)}" width="${f2(0.32 * H)}" height="${f2(0.06 * H)}" fill="#000"/>`;
  }
  return s;
}
const linStand = (h, pose = {}, o = {}) => lin({ view: 'side', costume: o.costume || 'A', height: h, x: 0, y: 0, flip: o.flip ?? false, cangue: o.cangue, col: o.col, headCloth: o.headCloth, pose, props: o.props });

// ---------------------------------------------------------------- the temple wall (W07–W10): one look, low sun
function sunWall(id, shadows, o = {}) {
  let s = `<defs>${lg(id + 'w', o.cold ? [[0, '#B7604A'], [0.55, '#8E3A2C'], [1, '#3E1712']] : [[0, '#E2774E'], [0.55, '#B8432C'], [1, '#5E1C14']], 0, 0, 1, 0.3)}${rg(id + 'sun', [[0, '#FFF0C8', 0.85], [0.35, '#FFC27A', 0.35], [1, '#FFC27A', 0]], 0.08, 0.35, 0.7)}${sil(id + 's', '#2A0D09')}<filter id="${id}b"><feGaussianBlur stdDeviation="2.5"/></filter></defs>`;
  s += `<rect width="1920" height="1080" fill="url(#${id}w)"/>`;
  for (let i = 0; i < 9; i++) s += `<rect x="${i * 230 + 60}" y="0" width="7" height="1080" fill="#6E2418" opacity="0.35"/>`;
  s += `<rect width="1920" height="1080" fill="url(#${id}sun)" style="mix-blend-mode:screen" opacity="${o.cold ? 0.55 : 1}"/>` + rays(-80, 380, 16, 2400, '#FFE2A8', o.cold ? 0.12 : 0.22, 0.75, 7);
  const sh = (inner, x, rot = 0, op = 0.84) => silG(id + 's', `translate(${x} 1000) skewX(-16) rotate(${rot})`, inner, op, `filter="url(#${id}b)"`);
  s += shadows(sh);
  s += `<path d="M0,1000 L1920,960 L1920,1080 L0,1080Z" fill="#3E1E14" opacity="0.85"/>`;
  s += `<rect x="-40" y="-20" width="190" height="1120" fill="#1A0A06"/><rect x="150" y="-20" width="10" height="1120" fill="#5A2416" opacity="0.6"/>`;
  return s + motes(80, [150, 100, 1300, 900], 4);
}
// W07 a man leans in on his wife: her shadow, his shadow over her
const R07 = () => sunWall('r07', (sh) => sh(WIFE.draw({ view: 'back34', height: 640, x: 0, y: 0 }), 980) + sh(GAO.draw({ view: 'side', height: 760, x: 0, y: 0, flip: true }), 720, 10));
// W09 the young man has a giant official behind him; 林冲's raised fist is suddenly small
const R09 = () => sunWall('r09', (sh) => sh(official(880), 500, 0, 0.62) + sh(GAO.draw({ view: 'side', height: 500, x: 0, y: 0, flip: true }), 880, -16, 0.92) + sh(linRaise(640), 1330, 0, 0.8), { cold: true });
// W10 the fist comes down: 林冲's head bowed, the young man walks off
const R10 = () => sunWall('r10', (sh) => sh(GAO.draw({ view: 'side', height: 600, x: 0, y: 0, flip: false }), 480, 0, 0.6) + sh(linStand(840, { shoulderL: 8, elbowL: 10, shoulderR: 4, torso: 14, headTilt: -16 }), 1220));

// ---------------------------------------------------------------- W11 陆谦 walks over to their side
function R11() {
  let s = `<defs>${lg('r11sc', [[0, '#F6E2B4'], [1, '#D9B47A']])}${sil('r11s', '#2A1A10')}<filter id="r11b"><feGaussianBlur stdDeviation="3"/></filter></defs>`;
  s += `<rect width="1920" height="1080" fill="url(#r11sc)"/>`;
  for (let i = 1; i < 6; i++) s += `<rect x="${i * 320 - 6}" y="0" width="12" height="1080" fill="#5A3E2B"/>`;
  for (let j = 1; j < 3; j++) s += `<rect x="0" y="${j * 330 - 6}" width="1920" height="12" fill="#5A3E2B"/>`;
  const sh = (inner, x, op = 0.66) => silG('r11s', `translate(${x} 1000)`, inner, op, 'filter="url(#r11b)"');
  s += sh(official(820), 1620, 0.74) + sh(GAO.draw({ view: 'side', height: 580, x: 0, y: 0, flip: false }), 1360);
  s += sh(LU.draw({ view: 'side', height: 620, x: 0, y: 0, flip: true }), 1140);
  s += sh(linStand(640, { torso: 6, headTilt: -8 }, { flip: true }), 260, 0.6);
  // his footprints: the way 陆谦 came, from 林冲's side across the room
  for (let i = 0; i < 7; i++) s += `<ellipse cx="${420 + i * 100}" cy="${1000 + (i % 2) * 8}" rx="26" ry="7" fill="#2A1A10" opacity="${f2(0.12 + i * 0.05)}"/>`;
  // the floor line of the room
  s += `<path d="M0,1000 L1920,990 L1920,1080 L0,1080Z" fill="#2A1A10"/>`;
  return s;
}

// ---------------------------------------------------------------- W12 白虎节堂: the guards close in on him
function R12() {
  let s = v2(59.5);
  s += `<defs>${sil('r12s', '#07090C', '#6E8096', 4, -3)}</defs>`;
  const g = (x, y, h, flip, rot) => silG('r12s', `translate(${x} ${y}) rotate(${rot})`, GUARD.draw({ view: 'side', height: h, x: 0, y: 0, flip }));
  s += `<g filter="url(#${blurId(1.5)})">${g(330, 760, 330, false, 6)}${g(700, 790, 330, true, -6)}${g(220, 900, 380, false, 4)}</g>`;
  s += `<g filter="url(#${blurId(5)})">${g(120, 1220, 900, false, 8)}${g(1820, 1220, 900, true, -8)}</g>`;
  return s;
}

// ---------------------------------------------------------------- W15 led away in the cangue, big against the low sun
function R15() {
  let s = `<defs>${lg('r15s', [[0, '#C7683A'], [0.55, '#F2B36A'], [1, '#F8DDA6']])}${rg('r15sun', [[0, '#FFF6DA'], [0.2, '#FFE2A0', 0.9], [1, '#FFC27A', 0]], 0.5, 0.5, 0.5)}${sil('r15f', '#2A140C', '#FFD08A', 4, -3)}</defs>`;
  s += `<rect width="1920" height="1080" fill="url(#r15s)"/><circle cx="1040" cy="640" r="430" fill="url(#r15sun)"/>`;
  s += `<path d="M0,700 C500,684 1300,690 1920,676 L1920,1080 L0,1080Z" fill="#7A4424"/><path d="M820,1080 L1000,700 L1060,700 L1340,1080Z" fill="#9A5A30"/>`;
  for (let i = 0; i < 8; i++) s += `<path d="M${80 + i * 250},${700 - (i % 3) * 6} l26,-170 l26,170Z" fill="#5A321C" opacity="0.8"/>`;
  const walk = (ph) => ({ legR: 18 * ph, legL: -18 * ph, kneeR: 10, kneeL: 8 });
  s += silG('r15f', 'translate(820 900)', GUARD.draw({ view: 'side', height: 420, x: 0, y: 0, flip: true }));
  s += silG('r15f', 'translate(1050 905)', linStand(430, walk(1), { flip: true, cangue: true, col: { robe: '#3B4356' }, headCloth: 'plain' }));
  s += silG('r15f', 'translate(1290 910)', GUARD.draw({ view: 'side', height: 425, x: 0, y: 0, flip: true }));
  // long shadows toward the camera
  s += `<g opacity="0.35">${[820, 1050, 1290].map((x) => `<path d="M${x - 40},905 L${x + 40},905 L${x + 260},1080 L${x - 120},1080Z" fill="#2A140C"/>`).join('')}</g>`;
  return s;
}

// ---------------------------------------------------------------- W16 the same young man's shadow at her door
function R16() {
  let s = v2(32.2);
  s += `<defs>${sil('r16s', '#140C0C')}<filter id="r16b"><feGaussianBlur stdDeviation="2"/></filter></defs>`;
  s += `<defs>${rg('r16l', [[0, '#F2C27A', 0.55], [1, '#F2C27A', 0]], 0.5, 0.55, 0.5)}</defs><ellipse cx="1560" cy="640" rx="420" ry="520" fill="url(#r16l)" style="mix-blend-mode:screen"/>`;
  s += silG('r16s', 'translate(1580 1060) skewX(-8)', GAO.draw({ view: 'side', height: 880, x: 0, y: 0, flip: false }), 0.86, 'filter="url(#r16b)"');
  return s;
}

// ---------------------------------------------------------------- W30 the mirror of W08: on the burning wall, this time a knife
function R30() {
  let s = `<defs>${lg('r30w', [[0, '#8A2A14'], [0.6, '#5A160A'], [1, '#240804']], 0, 1, 0, 0)}${rg('r30f', [[0, '#FFB060', 0.8], [1, '#FF7A2E', 0]], 0.5, 1, 0.8)}${sil('r30s', '#120403')}<filter id="r30b"><feGaussianBlur stdDeviation="2.5"/></filter></defs>`;
  s += `<rect width="1920" height="1080" fill="url(#r30w)"/>`;
  for (let i = 0; i < 9; i++) s += `<rect x="${i * 230 + 60}" y="0" width="7" height="1080" fill="#3A0E06" opacity="0.5"/>`;
  s += `<rect width="1920" height="1080" fill="url(#r30f)" style="mix-blend-mode:screen"/>`;
  s += silG('r30s', 'translate(1180 1000) skewX(-16)', linRaise(800, { costume: 'C', hat: false, knife: true }), 0.9, 'filter="url(#r30b)"');
  s += `<path d="M0,1000 L1920,980 L1920,1080 L0,1080Z" fill="#1A0805"/>`;
  s += flames(1.2, { x0: -100, x1: 2020, y: 1090, h: 230, n: 22, seed: 14 });
  return s + embers(1.6, { n: 80, area: [0, 0, 1920, 1080], seed: 21, rmax: 3.5, speed: 200 });
}

export const FRAMES = [
  ['W07 直到那天在岳庙，有人调戏他的娘子。', '墙上：一个男人凑近一个女人。', R07, 6],
  ['W08 他一把扳过那人，拳头举起来——', '林冲的影子举起拳头，那人往后缩。', I1, 7],
  ['W09 却认出，那是上司高太尉的干儿子。', '那人身后立起一个巨大的大官影子（展脚幞头），林冲的拳头一下子变小了。', R09, 8],
  ['W10 拳头，软了。', '林冲低下头，那人大摇大摆走开。', R10, 9],
  ['W11 连最好的朋友陆谦，也站到了他们那边。', '一个人离开林冲，走到大官和那人身边。林冲只剩自己。', R11, 10],
  ['W12 一把宝刀，把他引进了白虎节堂。', '他走进大堂，官兵从四面围上来：中了圈套。', R12, 11],
  ['W13 刺了面，押往沧州。', '戴上枷锁的林冲（保留原镜头）。', () => v2(61.6), 12],
  ['W15 他怕自己死在路上，', '两个差人押着戴枷的林冲，迎着落日走远。', R15, 14],
  ['W16 更怕高衙内逼她，误了她一辈子。', '同一个人的影子，压在他家的窗前。', R16, 15],
  ['W20–21 沧州下了大雪', '林冲顶着暴风雪走，远处一间草屋。', I4, 19],
  ['W27 一枪戳倒差拨……', '林冲一枪戳倒对面的人。', I5, 25],
  ['W29 杀人可恕，情理难容！', '林冲的脸，火光里吼出这句话（脸已修好）。', () => KEYS.K30(), 27],
  ['W30 这一回，他没有再忍。', '和岳庙那一幕同样的墙上影子：这一次手里是刀，落下去的一瞬切黑。', R30, 28],
];
export const DUR = FRAMES.length;
export function frameSVG(t) {
  const f = FRAMES[Math.max(0, Math.min(FRAMES.length - 1, Math.round(t)))];
  const body = f[2]();
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1920" height="1080" viewBox="0 0 1920 1080"><defs>${blurDefs()}</defs><rect width="1920" height="1080" fill="#000"/>${body}</svg>`;
}
