// Impact pass on the safe board (owner 2026-11-08 22:02: 少了画面冲击力). Same rules (no hands, no side-character faces,
// no prop handling) but pushed: extreme scale (shadows and silhouettes filling the frame), hard contrast light (low sun,
// rim, fire, god rays), one hot accent colour, foreground depth, giant calligraphy as punctuation, particles.
// t = index; FRAMES[i] = [line, note, fn, safeIndex] (safeIndex = the frame of board/safe2.mjs it replaces).
import { f2, lg, rg, rng, flames, vtext, snow, embers, blurId, blurDefs } from '../lib.mjs';
import { loadTakes, frameSVG as v2Frame } from '../film.mjs';
import { lin, EX } from '../../chars/rig/linchong.mjs';
import { KEYS } from './v4new.mjs';
import * as GAO from '../cast/v4/gao.mjs';
import * as GUARD from '../cast/v4/guard.mjs';
import * as LU from '../cast/v4/luqian.mjs';

const takes = await loadTakes();
const v2 = (s, hide = []) => { globalThis.HIDE_LAYERS = new Set(hide); const r = v2Frame(takes, s, { clean: true }); globalThis.HIDE_LAYERS = null; return r; };
export const sil = (id, col, rim, dx = 5, dy = -4) => `<filter id="${id}" x="-30%" y="-30%" width="160%" height="160%" color-interpolation-filters="sRGB"><feFlood flood-color="${col}"/><feComposite in2="SourceAlpha" operator="in" result="s"/>` +
  (rim ? `<feFlood flood-color="${rim}"/><feComposite in2="SourceAlpha" operator="in" result="r"/><feOffset in="r" dx="${dx}" dy="${dy}" result="ro"/><feComposite in="ro" in2="SourceAlpha" operator="out" result="rim"/><feMerge><feMergeNode in="rim"/><feMergeNode in="s"/></feMerge>` : '') + `</filter>`;
export const silG = (fid, tf, inner, op = 1, extra = '') => `<g opacity="${op}" ${extra}><g filter="url(#${fid})" transform="${tf}">${inner}</g></g>`;
export const rays = (cx, cy, n, len, col, op, spread = 0.9, seed = 3) => {
  const R = rng(seed); let s = '';
  for (let i = 0; i < n; i++) { const a = -spread / 2 + (spread * (i + R() * 0.6)) / n, w = 0.012 + R() * 0.03; s += `<path d="M${cx},${cy} L${f2(cx + Math.cos(a - w) * len)},${f2(cy + Math.sin(a - w) * len)} L${f2(cx + Math.cos(a + w) * len)},${f2(cy + Math.sin(a + w) * len)}Z" fill="${col}" opacity="${f2(op * (0.4 + R() * 0.6))}"/>`; }
  return `<g style="mix-blend-mode:screen" filter="url(#${blurId(6)})">${s}</g>`;
};
export const motes = (n, area, seed, col = '#FFF1C8') => { const R = rng(seed); let s = ''; for (let i = 0; i < n; i++) s += `<circle cx="${f2(area[0] + R() * (area[2] - area[0]))}" cy="${f2(area[1] + R() * (area[3] - area[1]))}" r="${f2(1 + R() * 2.6)}" fill="${col}" opacity="${f2(0.3 + R() * 0.6)}"/>`; return s; };
export const brush = (str, x, y, fs, col, o = {}) => vtext(str, x, y, fs, { fill: col, sp: fs * (o.sp || 1.02), font: o.font || 'Ma Shan Zheng' });

// the raised-fist shadow figure (same construction as safe2: one simple shape for the arm, no fingers)
export function linGrabFist(h, grab = false) {
  const info = {};
  const fig = lin({ view: 'side', costume: 'A', height: h, x: 0, y: 0, flip: false, info, pose: { shoulderL: grab ? 6 : -4, elbowL: grab ? 4 : 12, shoulderR: grab ? 88 : 6, elbowR: grab ? 4 : 10, torso: 8, legL: 20, kneeL: 25, legR: -15, kneeR: 5 } });
  const H = h / 7.5, S = info.shoulderNear;
  const E = [S[0] + 0.85 * H, S[1] - 0.35 * H], F = [E[0] + 0.1 * H, E[1] - 0.95 * H];
  const n = (a, b, w) => { const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy); return [(-dy / l) * w, (dx / l) * w]; };
  const [ax, ay] = n(S, E, 0.3 * H), [bx, by] = n(E, F, 0.17 * H);
  return fig + `<path d="M${S[0] + ax},${S[1] + ay} L${E[0] + ax * 0.9},${E[1] + ay * 0.9} L${F[0] + bx},${F[1] + by} L${F[0] - bx},${F[1] - by} L${E[0] - ax * 0.9},${E[1] - ay * 0.9} L${S[0] - ax},${S[1] - ay}Z" fill="#000"/><circle cx="${F[0]}" cy="${F[1] - 0.08 * H}" r="${0.25 * H}" fill="#000"/>`;
}

// I1 · W08 the fist: a giant shadow thrown across the whole temple wall by the low sun; the young lord shrinks under it
export function I1() {
  let s = `<defs>${lg('i1w', [[0, '#E2774E'], [0.55, '#B8432C'], [1, '#5E1C14']], 0, 0, 1, 0.3)}${rg('i1sun', [[0, '#FFF0C8', 0.85], [0.35, '#FFC27A', 0.35], [1, '#FFC27A', 0]], 0.08, 0.35, 0.7)}${sil('i1s', '#2A0D09')}<filter id="i1b"><feGaussianBlur stdDeviation="2.5"/></filter></defs>`;
  s += `<rect width="1920" height="1080" fill="url(#i1w)"/>`;
  for (let i = 0; i < 9; i++) s += `<rect x="${i * 230 + 60}" y="0" width="7" height="1080" fill="#6E2418" opacity="0.35"/>`;
  s += `<rect width="1920" height="1080" fill="url(#i1sun)" style="mix-blend-mode:screen"/>` + rays(-80, 380, 16, 2400, '#FFE2A8', 0.22, 0.75, 7);
  // the shadows: 林冲's huge, from the bottom edge to past the top; the young lord small and cowering
  s += silG('i1s', 'translate(1180 1000) skewX(-16)', linGrabFist(910), 0.86, 'filter="url(#i1b)"');
  s += silG('i1s', 'translate(760 1000) skewX(-16) rotate(-28)', GAO.draw({ view: 'side', height: 540, x: 0, y: 0, flip: true }), 0.8, 'filter="url(#i1b)"');
  // floor and a dark pillar in the near foreground for depth
  s += `<path d="M0,1000 L1920,960 L1920,1080 L0,1080Z" fill="#3E1E14" opacity="0.85"/>`;
  s += `<rect x="-40" y="-20" width="190" height="1120" fill="#1A0A06"/><rect x="150" y="-20" width="10" height="1120" fill="#5A2416" opacity="0.6"/>`;
  return s + motes(90, [150, 100, 1300, 900], 4);
}
// I2 · W09 who he is: the 高 lantern as an extreme close-up, light bleeding through the paper
export function I2() {
  let s = `<defs>${rg('i2g', [[0, '#FFE7A8'], [0.55, '#F2B65A'], [1, '#B86A24']], 0.45, 0.45, 0.6)}${rg('i2bg', [[0, '#5A1E14'], [1, '#160805']], 0.5, 0.5, 0.75)}${rg('i2h', [[0, '#FFF2C8', 0.7], [1, '#FFF2C8', 0]], 0.5, 0.5, 0.5)}</defs>`;
  s += `<rect width="1920" height="1080" fill="url(#i2bg)"/>`;
  s += `<ellipse cx="960" cy="560" rx="760" ry="720" fill="url(#i2g)"/>`;
  for (let i = -5; i <= 5; i++) s += `<path d="M${960 + i * 128},-200 Q${960 + i * 158},560 ${960 + i * 128},1300" fill="none" stroke="#9A5A22" stroke-width="5" opacity="0.45"/>`;
  s += `<text x="960" y="600" font-family="Ma Shan Zheng" font-size="760" fill="#8E1F17" text-anchor="middle" dominant-baseline="middle" opacity="0.92">高</text>`;
  s += `<ellipse cx="760" cy="380" rx="420" ry="300" fill="url(#i2h)" style="mix-blend-mode:screen"/>`;
  s += `<rect x="0" y="0" width="1920" height="70" fill="#1A0A06"/><rect x="0" y="1010" width="1920" height="70" fill="#1A0A06"/>`;
  return s;
}
// I3 · W11 陆谦: his shadow towers over the screen, the two cups tiny and black in the foreground
export function I3() {
  let s = `<defs>${lg('i3sc', [[0, '#F6E2B4'], [1, '#D9B47A']])}${sil('i3s', '#2A1A10')}${sil('i3k', '#0E0805')}<filter id="i3b"><feGaussianBlur stdDeviation="3"/></filter></defs>`;
  s += `<rect width="1920" height="1080" fill="url(#i3sc)"/>`;
  for (let i = 1; i < 6; i++) s += `<rect x="${i * 320 - 6}" y="0" width="12" height="1080" fill="#5A3E2B"/>`;
  for (let j = 1; j < 3; j++) s += `<rect x="0" y="${j * 330 - 6}" width="1920" height="12" fill="#5A3E2B"/>`;
  s += silG('i3s', 'translate(1260 1090)', LU.draw({ view: 'side', height: 1060, x: 0, y: 0, flip: true }), 0.66, 'filter="url(#i3b)"');
  // foreground: table edge and the two cups and jug as black shapes against the lit screen
  s += `<path d="M0,900 L1920,880 L1920,1080 L0,1080Z" fill="#0E0805"/>`;
  const cup = (x, w) => `<path d="M${x - w},${884 - w * 1.1} L${x + w},${884 - w * 1.1} L${x + w * 0.66},884 L${x - w * 0.66},884Z" fill="#0E0805"/>`;
  s += cup(470, 62) + cup(860, 62) + `<path d="M640,880 C600,860 590,790 615,740 L640,690 L700,690 L720,740 C745,790 735,860 700,880Z" fill="#0E0805"/>`;
  return s;
}
// I4 · W20–21 into the snow: a blizzard; 林冲 large in the foreground walking into the wind, the depot far behind
export function I4() {
  let s = `<defs>${lg('i4s', [[0, '#3C4A60'], [1, '#9AA8BA']])}${sil('i4f', '#121821', '#C9D6E6', -4, -3)}</defs>`;
  s += `<rect width="1920" height="1080" fill="url(#i4s)"/>`;
  s += `<path d="M0,760 C400,720 900,740 1920,700 L1920,1080 L0,1080Z" fill="#C7D0DC"/><path d="M0,820 C600,790 1200,800 1920,770 L1920,1080 L0,1080Z" fill="#DCE3EC"/>`;
  // the depot, small, far right, one warm window
  s += `<g transform="translate(1500 700)"><path d="M-120,0 L-120,-80 L0,-140 L120,-80 L120,0Z" fill="#4A5262"/><path d="M-140,-78 L0,-150 L140,-78 L0,-120Z" fill="#EEF2F7"/><rect x="-30" y="-50" width="40" height="34" fill="#F6C46A"/></g>`;
  s += silG('i4f', 'translate(640 1200)', lin({ view: 'side', costume: 'C', height: 1130, x: 0, y: 0, flip: true, pose: { legR: 24, kneeR: 18, legL: -20, kneeL: 6, torso: 14, spear: { hand: 'R', angle: -32, grip: 0.42 } }, props: { spear: { hand: 'R', angle: -32, grip: 0.42 } } }));
  // wind-driven snow streaks, two depths
  const R = rng(9); let st = '';
  for (let i = 0; i < 260; i++) { const x = R() * 2200 - 140, y = R() * 1180 - 60, l = 30 + R() * 90, w = 1.2 + R() * 3.2; st += `<path d="M${f2(x)},${f2(y)} l${f2(-l)},${f2(l * 0.32)}" stroke="#F4F7FB" stroke-width="${f2(w)}" stroke-linecap="round" opacity="${f2(0.35 + R() * 0.55)}"/>`; }
  s += st + `<g filter="url(#${blurId(4)})">${snow(1.0, { n: 40, seed: 21, r: [8, 16] })}</g>`;
  return s;
}
// I5 · W27 the thrust, low and wide: 林冲 lunging from the left, the spear crossing the gap, 差拨 knocked back off his feet
export function I5() {
  let s = `<defs>${lg('i5s', [[0, '#1A0705'], [0.55, '#6E200E'], [1, '#E2662A']])}${sil('i5f', '#0B0605', '#FFB060', 6, -5)}${sil('i5g', '#0B0605', '#FFB060', -6, -5)}</defs>`;
  s += `<rect width="1920" height="1080" fill="url(#i5s)"/>` + flames(0.7, { x0: -100, x1: 2020, y: 940, h: 560, n: 22, seed: 5 });
  s += `<rect width="1920" height="1080" fill="#1a0704" opacity="0.3"/>`;
  s += `<path d="M0,960 C600,940 1300,955 1920,930 L1920,1080 L0,1080Z" fill="#2A0E08"/>`;
  // hand ≈ (765, 659) for this pose at height 1000 placed at (420, 1060); spear 1278 px, grip 0.5 → tip ≈ (1400, 592)
  const sp = { hand: 'R', angle: 84, grip: 0.5, gourd: false };
  s += silG('i5f', 'translate(420 1060)', lin({ view: 'side', costume: 'C', hat: false, height: 1000, x: 0, y: 0, flip: true, pose: { legR: 50, kneeR: 82, legL: -36, kneeL: 10, torso: 26, shoulderR: 72, elbowR: 8, shoulderL: 60, elbowL: 20, spear: sp }, props: { spear: sp } }));
  s += silG('i5g', 'translate(1170 1000) rotate(38)', GUARD.draw({ view: 'side', height: 740, x: 0, y: 0, flip: false }));
  const T = [1400, 592];
  s += `<g style="mix-blend-mode:screen"><circle cx="${T[0]}" cy="${T[1]}" r="110" fill="#FFE2A0" opacity="0.6" filter="url(#${blurId(24)})"/></g>`;
  const R = rng(12); let sk = '';
  for (let i = 0; i < 46; i++) { const a = -2.4 + R() * 2.9, l = 50 + R() * 240; sk += `<path d="M${T[0]},${T[1]} l${f2(Math.cos(a) * l)},${f2(Math.sin(a) * l)}" stroke="#FFD27A" stroke-width="${f2(1.5 + R() * 3)}" stroke-linecap="round" opacity="${f2(0.4 + R() * 0.6)}"/>`; }
  for (let i = 0; i < 14; i++) { const y = 600 + (R() - 0.5) * 120; sk += `<path d="M${f2(60 + R() * 200)},${f2(y + 40)} L${f2(700 + R() * 300)},${f2(y)}" stroke="#FFB060" stroke-width="2" opacity="0.3"/>`; }
  return s + sk + embers(1.3, { n: 70, area: [0, 0, 1920, 1080], seed: 5, rmax: 4, speed: 220 });
}
// I6 · W29 the line as the picture: 杀人可恕 情理难容 brushed huge over the fire, his silhouette small below
export function I6() {
  let s = `<defs>${lg('i6s', [[0, '#120504'], [0.6, '#4E160A'], [1, '#B4441C']])}${sil('i6f', '#090403', '#FF9A4A')}</defs>`;
  s += `<rect width="1920" height="1080" fill="url(#i6s)"/>` + flames(1.1, { x0: -100, x1: 2020, y: 1000, h: 300, n: 20, seed: 8 });
  s += brush('杀人可恕', 1240, 90, 205, '#F6E6C8', { sp: 1.05 }) + brush('情理难容', 860, 210, 205, '#F6E6C8', { sp: 1.05 });
  s += silG('i6f', 'translate(420 1040)', lin({ view: 'side', costume: 'C', height: 520, x: 0, y: 0, flip: true, pose: { legR: 10, legL: -8, torso: -2, spear: { hand: 'R', angle: 4, grip: 0.3, gourd: false } }, props: { spear: { hand: 'R', angle: 4, grip: 0.3, gourd: false } } }));
  return s + embers(2.0, { n: 60, area: [0, 200, 1920, 1080], seed: 9, rmax: 3.5 });
}
// I7 · W30 the blow: a huge 忍 brushed, then the ink slash cuts straight through it
export function I7() {
  let s = KEYS.K31();
  s = s.replace('<path d="M-50,880 Q620,830 1220,872 T1980,860 L1980,1100 L-50,1100Z" fill="#BAC6D2" opacity="0.5"/>', '<path d="M-50,880 Q620,830 1220,872 T1980,860 L1980,1100 L-50,1100Z" fill="#BAC6D2" opacity="0.5"/><text x="980" y="560" font-family="Ma Shan Zheng" font-size="820" fill="#8E1F17" text-anchor="middle" dominant-baseline="middle" opacity="0.88">忍</text>');
  return s;
}
// I8 · W13 the cangue slams shut: the board itself as a macro shot (no face), iron, rivets, the 开封府 seal, dust
export function I8() {
  let s = `<defs>${lg('i8w', [[0, '#8A5A34'], [0.5, '#6E4426'], [1, '#4A2C18']], 0, 0, 0, 1)}${rg('i8v', [[0.45, '#000', 0], [1, '#000', 0.78]], 0.5, 0.5, 0.72)}${rg('i8k', [[0, '#FFD9A0', 0.5], [1, '#FFD9A0', 0]], 0.3, 0.2, 0.6)}<filter id="i8g"><feTurbulence type="fractalNoise" baseFrequency="0.004 0.09" numOctaves="3" seed="6"/><feColorMatrix values="0 0 0 0 0.18  0 0 0 0 0.1  0 0 0 0 0.05  0 0 0 0.55 0"/><feComposite in2="SourceGraphic" operator="in"/></filter></defs>`;
  s += `<rect width="1920" height="1080" fill="#0C0907"/>`;
  // the board, tilted, filling the frame; the neck hole's curve cut at the bottom edge (only a dark robe shoulder in it)
  const board = `<path d="M-200,170 L2120,40 L2140,860 L-180,990Z"/>`;
  s += `<g transform="rotate(-3 960 540)"><g fill="url(#i8w)">${board}</g><g filter="url(#i8g)" fill="#000">${board}</g>`;
  s += `<path d="M700,1000 C720,820 1200,800 1240,1000Z" fill="#0C0907"/><path d="M760,1000 C790,880 1150,870 1180,1000Z" fill="#232838"/>`;
  // seam between the two halves, iron bands, rivets
  for (const x of [260, 1660]) {
    s += `<path d="M${x - 70},${120 - x * 0.055} L${x + 70},${120 - (x + 140) * 0.055 + 8} L${x + 82},${930 - x * 0.055} L${x - 58},${938 - x * 0.055}Z" fill="#2B2B2E"/>`;
    for (let k = 0; k < 4; k++) { const y = 230 + k * 190 - x * 0.055; s += `<circle cx="${x + 6}" cy="${y}" r="26" fill="#1A1A1C"/><circle cx="${x - 2}" cy="${y - 8}" r="11" fill="#8C8C90" opacity="0.8"/>`; }
  }
  // the seal strip across the seam: paper, black brush characters, red stamp
  s += `<g transform="translate(968 420) rotate(4)"><rect x="-120" y="-330" width="240" height="640" fill="#EDE0C2"/><rect x="-120" y="-330" width="240" height="640" fill="none" stroke="#B8A57E" stroke-width="3"/>` +
    vtext('开封府', 0, -300, 150, { fill: '#17120E', sp: 158 }) + `<g transform="translate(10 200) rotate(-8)"><rect x="-86" y="-86" width="172" height="172" fill="none" stroke="#B3302A" stroke-width="12" opacity="0.92"/>` +
    `<text x="0" y="6" font-family="Ma Shan Zheng" font-size="70" fill="#B3302A" text-anchor="middle" dominant-baseline="middle" opacity="0.92">封</text></g></g></g>`;
  s += `<rect width="1920" height="1080" fill="url(#i8k)" style="mix-blend-mode:screen"/>`;
  // dust bursting off the board from the slam
  const R = rng(4); let d = '';
  for (let i = 0; i < 180; i++) { const a = R() * Math.PI * 2, r = 80 + Math.pow(R(), 0.6) * 900; d += `<circle cx="${f2(960 + Math.cos(a) * r * 1.4)}" cy="${f2(520 + Math.sin(a) * r * 0.55)}" r="${f2(1.5 + R() * 5)}" fill="#E6D2B0" opacity="${f2(0.15 + R() * 0.5)}"/>`; }
  s += d ;
  return s + `<rect width="1920" height="1080" fill="url(#i8v)"/>`;
}

export const FRAMES = [
  ['W08 他一把扳过那人，拳头举起来——', 'The low sun throws 林冲\'s shadow across the whole wall; the fist fills the top of the frame; the young lord shrinks under it.', I1, 7],
  ['W09 却认出，那是上司高太尉的干儿子。', 'The 高 lantern as an extreme close-up, light bleeding through the paper.', I2, 8],
  ['W11 连最好的朋友陆谦，也站到了他们那边。', 'His shadow towers over the screen; the two cups tiny and black in the foreground.', I3, 10],
  ['W13 刺了面，押往沧州。', 'The cangue slams shut as a macro shot: iron, rivets, the 开封府 seal, dust bursting.', I8, 12],
  ['W20–21 为了这句话…… · 沧州下了大雪', 'Blizzard: 林冲 large in the foreground walking into the wind; the depot far behind.', I4, 19],
  ['W27 一枪戳倒差拨……', 'Full frame and low: the spear crosses the screen, 差拨 thrown back, sparks (moving silhouettes from mocap).', I5, 25],
  ['W29 杀人可恕，情理难容！', 'The line becomes the picture: brushed huge over the fire.', I6, 27],
  ['W30 这一回，他没有再忍。', 'A huge 忍, then the ink slash cuts straight through it.', I7, 28],
];
export const DUR = FRAMES.length;
export function frameSVG(t) {
  const f = FRAMES[Math.max(0, Math.min(FRAMES.length - 1, Math.round(t)))];
  const body = f[2]();
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1920" height="1080" viewBox="0 0 1920 1080"><defs>${blurDefs()}</defs><rect width="1920" height="1080" fill="#000"/>${body}</svg>`;
}
