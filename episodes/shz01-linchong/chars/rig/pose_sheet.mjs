// node pose_sheet.mjs <out.png> — real-motion pose sheet: each column shows a CMU motion-capture frame (projected to the
// side plane by film/mocap/bvh2d.py, /dev/shm/shz01/mocap/<clip>_angles.json) and 林冲's rig posed from the same joint
// angles, with the capture skeleton drawn over him at the same hip, so the posture can be checked against a real body.
import { createRequire } from 'module';
import fs from 'fs';
import { lin, EX } from './linchong.mjs';
import { hand } from '../../film/hand2d/poses.mjs';
import { pushFigure } from './push.mjs';

/** 2D hands (film/hand2d 'stone': heel pressed, fingers over the stone) on the rig's wrists, continuing each forearm.
 *  The far hand first (behind), slightly darker. */
export function pushHands(info, HF, o = {}) {
  const size = 0.108 * HF; // wrist to fingertip ≈ 0.108 of stature
  const one = (w, e, dark) => {
    const a = (Math.atan2(e[1] - w[1], e[0] - w[0]) * 180) / Math.PI; // wrist -> elbow
    const rot = a - 128 + (o.bend || 0);                                 // the pose's forearm leaves the wrist at 128°
    const g = hand(o.pose || 'stone', { x: w[0], y: w[1], size, rot, sleeve: false });
    return dark ? `<g filter="brightness(0.82)" style="filter:brightness(0.82)">${g}</g>` : g;
  };
  let s = '';
  if (info.wristFar) s += one(info.wristFar, info.elbowFar, true);
  return { far: s, near: one(info.wristNear, info.elbowNear, false) };
}
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const OUT = process.argv[2] || '/dev/shm/shz01/rig/pose_sheet.png';
const MC = '/dev/shm/shz01/mocap/';
const clip = (n) => JSON.parse(fs.readFileSync(`${MC}${n}_angles.json`, 'utf8'));
const frameOf = (c, f) => c.frames.reduce((a, b) => (Math.abs(b.frame - f) < Math.abs(a.frame - f) ? b : a));

/** mocap frame -> rig pose (side view, figure facing right = flip, near side R). Arm angles are world angles in the
 *  capture; the rig's shoulder is relative to the chest, so the lean is added back. `over` overrides artistic choices
 *  (head lift so the face reads, hands). */
export function poseFrom(r0, over = {}, swap = false) {
  const r = swap ? mirror(r0) : r0;
  const lean = r.torso;
  return {
    torso: lean, spine: 0.4,
    legR: r.thighR, kneeR: Math.max(0, r.kneeR), legL: r.thighL, kneeL: Math.max(0, r.kneeL),
    armsWorld: true, shoulderR: r.upperR, elbowR: Math.max(0, r.elbowR), shoulderL: r.upperL, elbowL: Math.max(0, r.elbowL),
    headWorld: lean + r.head, ...over,
  };
}

/** the same captured pose with left and right exchanged (a mirrored real pose) */
export function mirror(r) {
  const o = { ...r, pts: {} };
  for (const k of Object.keys(r)) { if (/R$/.test(k) && r[k.slice(0, -1) + 'L'] !== undefined) { o[k] = r[k.slice(0, -1) + 'L']; o[k.slice(0, -1) + 'L'] = r[k]; } }
  for (const [k, v] of Object.entries(r.pts)) o.pts[k.replace(/^Left/, '#').replace(/^Right/, 'Left').replace(/^#/, 'Right')] = v;
  return o;
}
const BONES = [['Hips', 'Spine'], ['Spine', 'Spine1'], ['Spine1', 'Neck'], ['Neck', 'Head'],
  ['Neck', 'LeftArm'], ['LeftArm', 'LeftForeArm'], ['LeftForeArm', 'LeftHand'], ['Neck', 'RightArm'], ['RightArm', 'RightForeArm'], ['RightForeArm', 'RightHand'],
  ['Hips', 'LeftUpLeg'], ['LeftUpLeg', 'LeftLeg'], ['LeftLeg', 'LeftFoot'], ['LeftFoot', 'LeftToeBase'],
  ['Hips', 'RightUpLeg'], ['RightUpLeg', 'RightLeg'], ['RightLeg', 'RightFoot'], ['RightFoot', 'RightToeBase']];
/** capture skeleton drawn with its hips at `hip` (screen), scaled so its standing hip height = hipH px */
function stick(c, r, hip, hipH, o = {}) {
  const f0 = c.frames[1] || c.frames[0];
  const ground0 = Math.min(f0.pts.LeftToeBase[1], f0.pts.RightToeBase[1]);
  const k = hipH / (f0.pts.Hips[1] - ground0);
  const H = r.pts.Hips;
  const S = (p) => [hip[0] + (p[0] - H[0]) * k, hip[1] - (p[1] - H[1]) * k];
  let s = '';
  for (const [a, b] of BONES) {
    if (!r.pts[a] || !r.pts[b]) continue;
    const col = /Right/.test(a + b) ? '#d0453a' : /Left/.test(a + b) ? '#3a64b8' : '#2a221d';
    const A = S(r.pts[a]), B = S(r.pts[b]);
    s += `<line x1="${A[0].toFixed(1)}" y1="${A[1].toFixed(1)}" x2="${B[0].toFixed(1)}" y2="${B[1].toFixed(1)}" stroke="${col}" stroke-width="${o.w || 6}" stroke-linecap="round" opacity="${o.op || 1}"/>`;
  }
  const hd = S(r.pts.Head);
  s += `<circle cx="${hd[0].toFixed(1)}" cy="${hd[1].toFixed(1)}" r="${(0.11 * hipH).toFixed(1)}" fill="none" stroke="#2a221d" stroke-width="${o.w || 6}" opacity="${o.op || 1}"/>`;
  const fl = Math.max(S(r.pts.LeftToeBase)[1], S(r.pts.RightToeBase)[1]);
  return { svg: s, floor: fl };
}

/** a big stone: back face at st.x, top st.top, rounded top-back corner of radius st.r, width w, standing on the floor */
export function stoneSVG(st, floor, w) {
  const x = st.x, t = st.top, r = st.r, h = floor - t;
  const d = `M${x + 4},${floor} C${x - 6},${floor - h * 0.35} ${x - 2},${t + r * 1.6} ${x},${t + r} A${r},${r} 0 0 1 ${x + r},${t} C${x + w * 0.45},${t - 6} ${x + w * 0.8},${t + 4} ${x + w * 0.95},${t + h * 0.25} C${x + w * 1.02},${t + h * 0.5} ${x + w},${floor - h * 0.2} ${x + w},${floor}Z`;
  return `<path d="${d}" fill="#6a645c"/><path d="M${x + 2},${t + r * 0.9} A${r},${r} 0 0 1 ${x + r},${t + 1} C${x + w * 0.45},${t - 4} ${x + w * 0.8},${t + 6} ${x + w * 0.93},${t + h * 0.24} L${x + w * 0.7},${t + h * 0.3} C${x + w * 0.4},${t + h * 0.2} ${x + r},${t + h * 0.25} ${x + 2},${t + r * 0.9}Z" fill="#7d776e"/><path d="${d}" fill="none" stroke="#2a1c17" stroke-width="3"/>`;
}

const T = (x, y, t, sz = 30, w = 700, col = '#2a221d', anchor = 'start') => `<text x="${x}" y="${y}" font-family="Noto Sans CJK SC, sans-serif" font-size="${sz}" font-weight="${w}" fill="${col}" text-anchor="${anchor}">${t}</text>`;

if (process.argv[1] && process.argv[1].endsWith('pose_sheet.mjs')) {
  const HF = 900, FLOOR = 1240, W = 3300, Hh = 1400;
  const cols = [];
  const ph = clip('push_heavy'), pb = clip('push_box');
  // 1. real capture, 2. the rig from it with the capture over him, 3. old S22 pose, 4. new pose in costume A for the robe test
  const r1 = frameOf(ph, 456);
  const pose1 = poseFrom(r1, { headWorld: 40 });
  cols.push({ title: '真人动捕 · 推重物', sub: `CMU 动捕 82_06 第 ${r1.frame} 帧 · 躯干前倾 ${r1.torso.toFixed(0)}° · 前膝 ${r1.kneeR.toFixed(0)}° · 后膝 ${r1.kneeL.toFixed(0)}°`, kind: 'stick', r: r1, c: ph });
  void pose1;
  const pose3 = poseFrom(r1, { headWorld: 40, cloakFront: 0.1 }, true);
  cols.push({ title: '林冲 · 按真人数据摆的姿势', sub: '腿、胯、腰背 = 同一帧的关节角度（细线 = 真人骨架叠在身上）· 手臂伸到石头上', kind: 'rig', pose: pose3, r: mirror(r1), c: ph, overlay: true });
  cols.push({ title: '原来的 S22（太僵）', sub: '整个人直挺挺倾斜 38° · 腿没弯', kind: 'old' });
  let body = `<rect width="${W}" height="${Hh}" fill="#efe9df"/>`;
  body += T(60, 80, '林冲 · 真人动作参考 → 骨骼姿势（推石头）', 56, 900);
  body += T(60, 130, '数据：卡内基梅隆大学 CMU 动作捕捉库（真人实录，可商用）→ 投影到侧面量关节角度 · 新骨骼：膝、踝能弯，腰背分两节弯，后脚自动踮起着地', 28, 500, '#6b5d52');
  const cw = W / cols.length;
  cols.forEach((c, i) => {
    const x0 = i * cw, cx = x0 + cw * ({ stick: 0.55, rig: 0.4, old: 0.36 }[c.kind]);
    body += `<rect x="${x0 + 20}" y="170" width="${cw - 40}" height="${Hh - 200}" rx="16" fill="${c.kind === 'old' ? '#e3dbd0' : '#e9e2d6'}"/>`;
    body += T(x0 + 50, 230, c.title, 36, 800);
    body += T(x0 + 50, 272, c.sub, 21, 500, '#6b5d52');
    body += `<clipPath id="col${i}"><rect x="${x0 + 20}" y="170" width="${cw - 40}" height="${Hh - 200}" rx="16"/></clipPath><g clip-path="url(#col${i})">`;
    body += `<line x1="${x0 + 40}" y1="${FLOOR}" x2="${x0 + cw - 40}" y2="${FLOOR}" stroke="#8a7d70" stroke-width="3"/>`;
    const info = {};
    if (c.kind === 'stick') {
      const rest = {}; lin({ view: 'side', costume: 'C', height: HF, x: cx, y: FLOOR, flip: true, info: rest });
      const hipH = FLOOR - rest.hip?.[1] || 0.53 * HF;
      // place by the floor: compute once with a dummy hip then shift so the lowest toe meets the floor
      const a = stick(c.c, c.r, [cx, FLOOR - 400], 0.52 * HF);
      body += `<g transform="translate(0 ${(FLOOR - a.floor).toFixed(1)})">${a.svg}</g>`;
      void hipH;
    } else if (c.kind === 'rig') {
      const pf = pushFigure({ costume: 'C', HF, height: HF, x: cx, y: FLOOR, flip: true, expr: { ...EX.隐忍, jaw: 1, eye: 0.6, brow: -0.9, mouth: -0.5 }, pose: c.pose, tattoo: 1 });
      Object.assign(info, pf.info);
      body += stoneSVG(pf.stone, FLOOR, 0.5 * HF) + pf.svg;
      if (c.overlay) { const a = stick(c.c, c.r, info.hip, 0.52 * HF, { w: 3, op: 0.55 }); body += `<g transform="translate(0 ${(FLOOR - a.floor).toFixed(1)})">${a.svg}</g>`; }
    } else {
      // the v2 S22 pose: rigid lean 38 about the feet, stride only
      const g = lin({ view: 'side', costume: 'C', height: HF, x: 0, y: 0, flip: true, expr: { ...EX.隐忍, jaw: 1, eye: 0.6, brow: -0.9, mouth: -0.5 }, pose: { headTilt: -4, shoulderR: 84, elbowR: 6, shoulderL: 77, elbowL: 6, legR: 14, legL: -18 }, tattoo: 1 });
      body += `<g transform="translate(${cx - 60} ${FLOOR}) rotate(38 -40 0)">${g}</g>`;
    }
    body += '</g>';
  });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: W, height: Hh } });
  await page.setContent(`<html><body style="margin:0"><svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${Hh}">${body}</svg></body></html>`);
  await page.evaluate(() => document.fonts.ready);
  fs.mkdirSync(OUT.replace(/\/[^/]*$/, ''), { recursive: true });
  await page.screenshot({ path: OUT });
  await browser.close();
  console.log('wrote', OUT);
}
