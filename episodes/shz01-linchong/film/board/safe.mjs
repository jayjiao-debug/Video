// "Safe storyboard" sample frames (owner 2026-11-08 21:34: hands, AI-looking side characters, close faces, prop
// handling, flying transitions keep failing — show only what we do well). t = frame index:
//   0 the letter, no hand · 1 岳庙 as shadows on the wall · 2 陆谦 as two cups and a leaving shadow · 3 林冲 listening +
//   依旧夫妻完聚 brushed · 4 the thrust as a moving silhouette (motion study, 4 phases) · 5 doors open, camera still ·
//   6 the print alone · 7 option B: 皮影 shadow-puppet look test
//   node render.mjs stills <dir> 0,1,2,3,4,5,6,7 --comp=board/safe.mjs --hooks=tex_demo/hooksA.mjs
import { f2, lg, rg, rng, flames, vtext, snow, embers } from '../lib.mjs';
import { loadTakes, frameSVG as v2Frame } from '../film.mjs';
import { lin, EX } from '../../chars/rig/linchong.mjs';
import { KEYS } from './v4new.mjs';
import * as GAO from '../cast/v4/gao.mjs';

export const DUR = 8;
const takes = await loadTakes();
const v2 = (s, hide = []) => { globalThis.HIDE_LAYERS = new Set(hide); const r = v2Frame(takes, s, { clean: true }); globalThis.HIDE_LAYERS = null; return r; };
const wrap = (s) => `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1920" height="1080" viewBox="0 0 1920 1080"><rect width="1920" height="1080" fill="#000"/>${s}</svg>`;
const silF = (id, col = '#120C0A', rim = null) => `<filter id="${id}" x="-20%" y="-20%" width="140%" height="140%" color-interpolation-filters="sRGB"><feFlood flood-color="${col}"/><feComposite in2="SourceAlpha" operator="in" result="s"/>` +
  (rim ? `<feFlood flood-color="${rim}"/><feComposite in2="SourceAlpha" operator="in" result="r"/><feOffset in="r" dx="4" dy="-3" result="ro"/><feComposite in="ro" in2="SourceAlpha" operator="out" result="rim"/><feMerge><feMergeNode in="rim"/><feMergeNode in="s"/></feMerge>` : '') + `</filter>`;

// 1 · 岳庙: the scuffle as shadows on a lit temple wall; who he is told by the lantern, never by his face
function F1() {
  let s = `<defs>${lg('f1wall', [[0, '#C9573E'], [1, '#9E3B2A']], 0, 0, 1, 0)}${rg('f1sun', [[0, '#FFE6B0', 0.55], [1, '#FFE6B0', 0]], 0.42, 0.45, 0.6)}${silF('f1sh', '#3A1712')}<filter id="f1soft"><feGaussianBlur stdDeviation="3"/></filter></defs>`;
  s += `<rect width="1920" height="1080" fill="url(#f1wall)"/>`;
  for (let i = 0; i < 9; i++) s += `<rect x="${i * 230 - 40}" y="0" width="6" height="1080" fill="#8A3324" opacity="0.4"/>`;
  s += `<rect x="0" y="860" width="1920" height="220" fill="#7A5A44"/><rect x="0" y="852" width="1920" height="12" fill="#5E4231"/>`;
  for (let i = 0; i < 14; i++) s += `<rect x="${i * 150}" y="864" width="3" height="216" fill="#5E4231" opacity="0.5"/>`;
  s += `<rect width="1920" height="1080" fill="url(#f1sun)" style="mix-blend-mode:screen"/>`;
  // the shadows, long and skewed by a low sun: 林冲's arm raised (left), the young lord shrinking (right)
  // 林冲 (right, facing left) has the young lord by the shoulder; the young lord (left) recoils
  const him = lin({ view: 'side', costume: 'A', height: 800, x: 0, y: 0, flip: false, pose: { shoulderL: 88, elbowL: 2, torso: 8, legL: 20, kneeL: 25, legR: -15, kneeR: 5 } });
  const gao = GAO.draw({ view: 'side', height: 740, x: 0, y: 0, flip: true });
  s += `<g opacity="0.72" filter="url(#f1soft)"><g filter="url(#f1sh)" transform="translate(1180 870) skewX(-14)">${him}</g>`;
  s += `<g filter="url(#f1sh)" transform="translate(700 870) skewX(-14) rotate(-9 0 0)">${gao}</g></g>`;
  // the lantern with 高 (太尉府) in the foreground, out of focus edge
  s += `<g transform="translate(260 250)"><line x1="0" y1="-260" x2="0" y2="0" stroke="#2A1C17" stroke-width="6"/><ellipse cx="0" cy="90" rx="110" ry="130" fill="#E9C27A"/><ellipse cx="0" cy="90" rx="110" ry="130" fill="none" stroke="#7A3A22" stroke-width="6"/>`;
  s += `<rect x="-60" y="-50" width="120" height="16" fill="#3A2216"/><rect x="-60" y="214" width="120" height="16" fill="#3A2216"/><text x="0" y="96" font-family="Ma Shan Zheng" font-size="110" fill="#8E1F17" text-anchor="middle" dominant-baseline="middle">高</text></g>`;
  return s;
}

// 2 · 陆谦: two cups, his cup untouched, the cushion empty, his shadow leaving across the paper screen
function F2() {
  let s = `<defs>${lg('f2bg', [[0, '#3E2A1E'], [1, '#22170F']])}${rg('f2lamp', [[0, '#FFD996', 0.6], [1, '#FFD996', 0]], 0.5, 0.5, 0.5)}${silF('f2sh', '#2A1A10')}<filter id="f2b"><feGaussianBlur stdDeviation="5"/></filter></defs>`;
  s += `<rect width="1920" height="1080" fill="url(#f2bg)"/>`;
  // paper screen (lit from the next room)
  s += `<rect x="160" y="80" width="1600" height="560" fill="#E8D2A6"/>`;
  for (let i = 1; i < 8; i++) s += `<rect x="${160 + i * 200 - 4}" y="80" width="8" height="560" fill="#5A3E2B"/>`;
  for (let j = 1; j < 3; j++) s += `<rect x="160" y="${80 + j * 186 - 4}" width="1600" height="8" fill="#5A3E2B"/>`;
  const lu = lin({ view: 'side', costume: 'A', col: { robe: '#4A3A55' }, height: 760, x: 0, y: 0, flip: true, pose: { legR: 22, legL: -18, shoulderR: -10, shoulderL: 20 } });
  s += `<g opacity="0.55" filter="url(#f2b)"><g filter="url(#f2sh)" transform="translate(1420 650)">${lu}</g></g>`;
  // table, two cups, the jug, the empty cushion
  s += `<rect x="0" y="700" width="1920" height="380" fill="#4A3121"/><rect x="0" y="690" width="1920" height="14" fill="#2E1E14"/>`;
  s += `<ellipse cx="960" cy="760" rx="520" ry="60" fill="url(#f2lamp)" opacity="0.6"/>`;
  const cup = (x, full) => `<path d="M${x - 60},720 L${x + 60},720 L${x + 44},790 L${x - 44},790Z" fill="#E9E4D8" stroke="#2A1C17" stroke-width="3"/><ellipse cx="${x}" cy="720" rx="60" ry="14" fill="${full ? '#B98A3E' : '#3B2A1E'}" stroke="#2A1C17" stroke-width="3"/>`;
  s += cup(760, false) + cup(1180, true);
  s += `<path d="M930,650 C905,660 900,700 915,740 L1005,740 C1020,700 1015,660 990,650 L985,600 L935,600Z" fill="#DDE3E0" stroke="#2A1C17" stroke-width="3"/><path d="M990,660 C1040,650 1060,620 1080,600" fill="none" stroke="#2A1C17" stroke-width="5"/>`;
  s += `<rect x="1380" y="900" width="420" height="80" rx="30" fill="#6E2F28"/><rect x="1380" y="900" width="420" height="80" rx="30" fill="none" stroke="#2A1C17" stroke-width="3"/>`;
  return s;
}

// 3 · the promise: 林冲 listening (no one else in frame), the words brushed beside him
function F3() {
  let s = v2(11.6, ['t01gh', 't01her3']);
  s += `<rect x="0" y="0" width="760" height="1080" fill="#120D0A" opacity="0.35"/>`;
  s += vtext('依旧夫妻完聚', 300, 150, 120, { fill: '#F2E4C4', sp: 128 });
  return s;
}

// 4 · the thrust as a moving silhouette: four phases of one real-motion move against the fire (motion study)
function F4() {
  let s = `<defs>${lg('f4sky', [[0, '#2A0F0A'], [0.6, '#7A2A14'], [1, '#C8572A']])}${lg('f4gnd', [[0, '#B5653A'], [1, '#3A1A10']])}${silF('f4s', '#0F0907', '#FF9A4A')}</defs>`;
  s += `<rect width="1920" height="1080" fill="url(#f4sky)"/>`;
  s += flames(0.4, { x0: 900, x1: 1920, y: 760, h: 380, n: 16, seed: 3 });
  s += `<path d="M0,760 C500,740 1300,750 1920,735 L1920,1080 L0,1080Z" fill="url(#f4gnd)"/>`;
  const ph = [
    { x: 260, op: 0.22, pose: { legR: 5, kneeR: 15, legL: -5, kneeL: 15, torso: 4, spear: { hand: 'R', angle: 60, grip: 0.55 } } },
    { x: 560, op: 0.38, pose: { legR: 28, kneeR: 40, legL: -18, kneeL: 10, torso: 10, spear: { hand: 'R', angle: 80, grip: 0.6 } } },
    { x: 900, op: 1, pose: { legR: 48, kneeR: 80, legL: -32, kneeL: 12, torso: 22, spear: { hand: 'R', angle: 92, grip: 0.75 } } },
    { x: 1250, op: 0.38, pose: { legR: 38, kneeR: 60, legL: -26, kneeL: 20, torso: 14, spear: { hand: 'R', angle: 86, grip: 0.6 } } },
  ];
  for (const p of ph) {
    const fig = lin({ view: 'side', costume: 'C', height: 520, x: 0, y: 0, flip: true, pose: { ...p.pose, shoulderR: 70, elbowR: 10, armsWorld: false }, props: { spear: p.pose.spear } });
    s += `<g opacity="${p.op}" filter="url(#f4s)" transform="translate(${p.x} 800)">${fig}</g>`;
  }
  s += snow(3.0, { n: 120, seed: 4, wind: 0.6 }) || '';
  return s;
}

// 5 · the doors open with the camera standing still (no zoom, nothing flies at the lens)
const F5 = () => KEYS.K26();

// 6 · the end: the print alone
const F6 = () => v2(136.6);

// 7 · option B look test: 皮影 — translucent cut leather figures with visible joints, backlit paper screen, rods
function F7() {
  let s = `<defs>${rg('f7scr', [[0, '#FFE9B8'], [0.7, '#F2C57A'], [1, '#8A5A2A']], 0.5, 0.45, 0.75)}` +
    `<filter id="f7pi" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="0.9 0.35 0.1 0 0.05  0.25 0.55 0.1 0 0  0.1 0.15 0.35 0 0  0 0 0 0.92 0"/>` +
    `<feComponentTransfer><feFuncR type="discrete" tableValues="0.2 0.55 0.75 0.95"/><feFuncG type="discrete" tableValues="0.08 0.25 0.45 0.7"/><feFuncB type="discrete" tableValues="0.05 0.12 0.25 0.4"/></feComponentTransfer></filter>` +
    `<filter id="f7edge"><feMorphology in="SourceAlpha" operator="dilate" radius="3" result="d"/><feFlood flood-color="#1A0D06"/><feComposite in2="d" operator="in" result="o"/><feMerge><feMergeNode in="o"/><feMergeNode in="SourceGraphic"/></feMerge></filter>` +
    `<pattern id="f7holes" width="26" height="26" patternUnits="userSpaceOnUse"><circle cx="13" cy="13" r="4" fill="#FFE9B8" opacity="0.85"/></pattern></defs>`;
  s += `<rect width="1920" height="1080" fill="#2A160A"/><rect x="120" y="60" width="1680" height="900" rx="8" fill="url(#f7scr)"/>`;
  s += `<rect x="120" y="60" width="1680" height="900" rx="8" fill="none" stroke="#3A2010" stroke-width="18"/>`;
  const fig = lin({ view: 'side', costume: 'C', height: 760, x: 0, y: 0, flip: true, pose: { legR: 30, kneeR: 45, legL: -20, kneeL: 10, torso: 8, shoulderR: 80, elbowR: 10, spear: { hand: 'R', angle: 90, grip: 0.7 } }, props: { spear: { hand: 'R', angle: 90, grip: 0.7 } }, hat: true });
  s += `<g transform="translate(820 900)"><g filter="url(#f7edge)"><g filter="url(#f7pi)">${fig}</g></g></g>`;
  // the puppeteer's rods from the hands down past the screen
  s += `<path d="M1060,520 L1180,1080 M760,640 L700,1080" stroke="#2A160A" stroke-width="7"/>`;
  // a cut-paper flame motif at the right
  s += `<g transform="translate(1500 900)" opacity="0.9">${flames(0.2, { x0: -220, x1: 220, y: 0, h: 300, n: 6, seed: 9, cols: ['#8E1F17', '#C8452A', '#E9883A'] })}</g>`;
  return s;
}

// 0 · the letter on the table, no hand: the palm print is already pressed
const F0 = () => v2(4.9, ['t01hand', 't01herfingers']);

const F = [F0, F1, F2, F3, F4, F5, F6, F7];
export function frameSVG(t) { return wrap(F[Math.max(0, Math.min(F.length - 1, Math.round(t)))]()); }
