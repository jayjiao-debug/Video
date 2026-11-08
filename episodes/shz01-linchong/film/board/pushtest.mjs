// Motion test (not on the film timeline): 林冲 pushes the stone to the 山神庙 door and straightens up, driven end to end
// by one continuous take of real motion capture (CMU 82_06, frames 760 -> 1090): the steady push, the stone slowing
// into the door, the hold, the release and the stand-up all keep the capture's own timing.
//   node render.mjs video <out.mp4> 0 <n> --comp=board/pushtest.mjs      (PUSH_SLOW=2 renders a true half-speed pass)
import { L, f2, lerp, clamp, shake } from '../lib.mjs';
import { lin, EX } from '../../chars/rig/linchong.mjs';
import { pushFigure } from '../../chars/rig/push.mjs';
import { loadClip, sampler, retarget, spring, keyed } from '../../chars/rig/mocap_drive.mjs';
import { hand } from '../hand2d/poses.mjs';
import { parts } from '../takes/t10.mjs';

const { ROOM, door, stone, SPEAR_LEAN, FL, HF, CRACK, STONE_W } = parts;
const SLOW = +(process.env.PUSH_SLOW || 1);
const FPS = 30;
const clip = loadClip(new URL('../mocap/clips/push_heavy.json', import.meta.url));
const OLD = !!process.env.PUSH_OLD;   // the previous (jiggly) settings, for comparison
const at = OLD ? sampler(clip, 3, {}) : sampler(clip);
const F_START = 760, F_REL0 = 970, F_REL1 = 1012, F_END = 1090, HOLD = 0.7;   // the captured hands leave the object at ≈ f975
// the capture ends mid-step: its last 0.7 s play on a decelerating clock so the stand-up settles instead of freezing
const DC = (F_END - F_START) / 120, TE = 0.7, T1 = DC - TE / 2;
const tau = (t) => (t < T1 ? t : t < T1 + TE ? T1 + (t - T1) - ((t - T1) ** 2) / (2 * TE) : DC);
const ACT = T1 + TE;                                 // seconds of action on screen
export const DUR = (ACT + HOLD) * SLOW;
const S = (0.515 * HF) / clip.hipH;                  // px per capture unit (standing hip heights matched)
const TOP = FL - 0.36 * HF, R = 0.075 * HF;          // stone top and the rounded corner the palms sit on
const cornerP = (sx) => [sx + R - R * Math.SQRT1_2, TOP + R - R * Math.SQRT1_2];
const EXPR_PUSH = { ...EX.隐忍, jaw: 1, eye: 0.6, brow: -0.9, mouth: -0.5 };
const EXPR_AFTER = { ...EX.隐忍, eye: 0.8, brow: -0.6, mouth: -0.2 };
const smoothArr = (a, sd) => {
  const R2 = Math.ceil(3 * sd), out = a.slice();
  for (let i = 0; i < a.length; i++) { let s = 0, w = 0; for (let j = -R2; j <= R2; j++) { const k = Math.min(a.length - 1, Math.max(0, i + j)); const g = Math.exp(-(j * j) / (2 * sd * sd)); s += a[k] * g; w += g; } out[i] = s / w; }
  return out;
};
const ss = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };

// ---------------------------------------------------------------- precomputed track (one entry per output frame)
const N = Math.ceil(DUR * FPS) + 1;
const cfOf = (i) => Math.min(F_END, F_START + tau(i / FPS / SLOW) * 120);
// while he grinds forward, the trunk's step-by-step pitching and the leg bounce are real but read as wobble on the big
// flat cloak: a calm sampler (≈ 0.25 s on the trunk) carries the push; the stand-up returns to the light one so the
// release keeps its real snap
// Clean-up pass: keys at the gait events (far foot planted 760-840, near foot lands 840, far foot drags 840-960, the
// stone stops 960, hands off 975, up by 1086) and a smooth spline between them — captured postures and timing, without
// the frame-to-frame micro-motion that reads as wobble on a flat 2D figure. Foot contacts still come from the raw take.
const KEYS = [760, 784, 808, 828, 840, 862, 886, 910, 934, 960, 976, 996, 1016, 1036, 1056, 1074, 1090];
const clean = keyed(sampler(clip, 5), KEYS);
const recAt = (cf) => (OLD ? at(cf) : { ...clean(cf), p: { ...clean(cf).p } });
const base = (cf) => {
  const r = retarget(recAt(cf), clip, { mirror: true });
  const rel = ss(F_REL0, F_REL1 + 20, cf);
  r.pose.headWorld = lerp(40, r.pose.headWorld, rel);  // eyes on the stone while pushing, then the captured head
  r.pose.cloakFront = 0.1; if (!OLD) r.pose.cloakBack = 0.45;
  return r;
};
const T = [];
const hipRef = at(F_START).p.Hips[0];
// pass A: where the hips are, how far the rig must drop to stand on its feet
for (let i = 0; i < N; i++) {
  const cf = cfOf(i), b = base(cf), info = {};
  lin({ view: 'side', costume: 'C', height: HF, x: 0, y: 0, flip: true, pose: b.pose, info, hands: false });
  T.push({ cf, b, hipLocalX: info.hip[0], dy: info.root[3] * info.groundDy, hx: S * (b.hipX - hipRef), toeN: info.legNear.toe, toeF: info.legFar.toe, heelN: info.legNear.heel, heelF: info.legFar.heel, ct: info.cloakTarget, ankN: info.legNear.ankle, ankF: info.legFar.ankle });
}
const dyS = smoothArr(T.map((e) => e.dy), 1.5 * SLOW);
// the cloak follows the legs through a spring: it lags and settles instead of being glued to every step
{
  const ks = ['dxF', 'dxB', 'liftF', 'liftB'], sp = {};
  for (const k of ks) sp[k] = spring(T.map((e) => e.ct[k]), FPS * SLOW, 1.4, 0.8);
  if (!OLD) T.forEach((e, i) => { e.cloak = Object.fromEntries(ks.map((k) => [k, sp[k][i]])); e.b.pose.cloak = e.cloak; });
}
// foot plants: the rig's legs are not the capture actor's, so the captured hip path alone lets a planted foot skate.
// Which foot is planted comes from the capture (toe low and still); while it is, the figure's x is corrected so that
// foot stays where it landed. The correction only changes during plants, so it is continuous; then lightly smoothed.
const toeAt = (cf, side) => at(cf).p[side === 'R' ? 'RightToeBase' : 'LeftToeBase'];
const planted = (cf, side) => { const a = toeAt(cf, side), b = toeAt(cf + 2, side); return a[1] < 1.1 && Math.abs(b[0] - a[0]) * 60 < 3.5; };
{
  let corr = 0, anchor = null, plantX = 0;
  const cs = [];
  for (let i = 0; i < N; i++) {
    const e = T[i];
    // capture right drives the rig's far leg (mirrored), capture left the near leg
    const cand = [['F', 'R'], ['N', 'L']].filter(([, cs_]) => planted(e.cf, cs_)).map(([rs]) => rs);
    const toeW = (rs) => e.hx - e.hipLocalX + (rs === 'F' ? e.toeF[0] : e.toeN[0]);
    if (!cand.includes(anchor)) { anchor = cand[0] || null; if (anchor) plantX = toeW(anchor) + corr; }
    if (anchor) corr = plantX - toeW(anchor);
    cs.push(corr);
  }
  const cS = smoothArr(cs, 2 * SLOW);
  T.forEach((e, i) => { e.hx += cS[i]; });
}
// Calm root: while he grinds forward the pelvis glides (its step surges and bounce smoothed over ≈ 0.2 s) and the
// planted foot is held on its spot by foot IK, so nothing skates; the stand-up keeps the captured root.
const W_UP = T.map((e) => (OLD ? 1 : ss(950, 985, e.cf)));
const hxRaw = T.map((e) => e.hx);
{
  const hs = smoothArr(hxRaw, 6 * SLOW), ds = smoothArr(dyS, 6 * SLOW);
  T.forEach((e, i) => { e.hxS = lerp(hs[i], e.hx, W_UP[i]); e.dyC = lerp(ds[i], dyS[i], W_UP[i]); });
}
// the stone rides on the hands: offset from the hips fixed by a natural reach at the first frame
const nat0 = pushFigure({ costume: 'C', HF, height: HF, x: 0, y: 0, flip: true, pose: T[0].b.pose });
const C = (nat0.contact[0] - T[0].hipLocalX) - (cornerP(0)[0]);
const maxHx = Math.max(...T.filter((e) => e.cf <= F_REL0).map((e) => e.hxS));
const X0 = CRACK - STONE_W - C - maxHx;              // the stone's right side meets the door at the furthest push
let run = -1e9;
for (let i = 0; i < N; i++) {
  const e = T[i];
  // the raw solution (feet planted by the x correction): where each ankle is in the world
  const txR = X0 + e.hx - e.hipLocalX, tyR = FL + dyS[i];
  e.ankW = { N: [txR + e.ankN[0], tyR + e.ankN[1] - e.dy], F: [txR + e.ankF[0], tyR + e.ankF[1] - e.dy] };
  e.hipW = X0 + e.hxS;
  if (e.cf <= F_REL0) run = Math.max(run, e.hipW + C);
  e.stoneX = Math.min(run, CRACK - STONE_W);
  e.tx = e.hipW - e.hipLocalX; e.ty = FL + e.dyC;
}
// lock each planted foot where it landed (blending in and out over 4 frames at touch-down and lift-off)
if (!OLD) for (const [rs, cs_] of [['F', 'R'], ['N', 'L']]) {
  const pl = T.map((e) => planted(e.cf, cs_));
  for (let i = 0; i < N;) {
    if (!pl[i]) { i++; continue; }
    let j = i; while (j + 1 < N && pl[j + 1]) j++;
    const lockW = T[Math.min(j, i + 2)].ankW[rs];
    for (let k = i; k <= j; k++) (T[k].locks ||= {})[rs] = { p: lockW, w: Math.min(1, i === 0 ? 1 : (k - i + 1) / 4, j >= N - 2 ? 1 : (j - k + 1) / 4) };
    i = j + 1;
  }
}
/** the frame's pose with the foot locks applied (rig sides: near = R, far = L when facing right) */
function lockedPose(e, pose) {
  if (!e.locks) return pose;
  const fk = {}; lin({ view: 'side', costume: 'C', height: HF, x: 0, y: 0, flip: true, pose, hands: false, info: fk });
  const fl = {};
  for (const [rs, L] of Object.entries(e.locks)) {
    const cur = rs === 'N' ? fk.legNear.ankle : fk.legFar.ankle, tgt = [L.p[0] - e.tx, L.p[1] - e.ty];
    fl[rs === 'N' ? 'R' : 'L'] = [lerp(cur[0], tgt[0], L.w), lerp(cur[1], tgt[1], L.w)];
  }
  return { ...pose, footLock: fl };
}
const camX = smoothArr(T.map((e) => e.hipW), 14 * SLOW);
const CONTACT_I = T.findIndex((e) => e.stoneX >= CRACK - STONE_W - 0.5);
const CONTACT_T = CONTACT_I / FPS;

function figure(i, t) {
  const e = T[i], rel = ss(F_REL0, F_REL1, e.cf);
  const breathe = e.cf >= F_END ? Math.sin((t - ACT * SLOW) * 2.4 / SLOW) * 0.8 : 0;
  const pose = lockedPose(e, { ...e.b.pose, ground: false, torso: e.b.pose.torso + breathe });
  const expr = rel < 0.5 ? EXPR_PUSH : EXPR_AFTER;
  const local = [cornerP(e.stoneX)[0] - e.tx, cornerP(e.stoneX)[1] - e.ty];
  let svg, info;
  if (rel <= 0) {
    const r = pushFigure({ costume: 'C', HF, height: HF, x: 0, y: 0, flip: true, pose, expr, tattoo: 1, target: local });
    svg = r.svg; info = r.info;
  } else {
    // letting go: arms ease from the stone (IK) to the captured arms, hands cross from 'stone' to 'loose'
    const ik = pushFigure({ costume: 'C', HF, height: HF, x: 0, y: 0, flip: true, pose, expr, tattoo: 1, target: local }).pose;
    const p2 = { ...pose };
    for (const k of ['shoulderR', 'elbowR', 'shoulderL', 'elbowL']) p2[k] = lerp(ik[k], pose[k], rel);
    info = {};
    const body = lin({ view: 'side', costume: 'C', height: HF, x: 0, y: 0, flip: true, pose: p2, expr, tattoo: 1, hat: true, hands: false, info });
    const size = 0.108 * HF;
    const hd = (w, el, dark) => {
      const a = (Math.atan2(el[1] - w[1], el[0] - w[0]) * 180) / Math.PI;
      const st = hand('stone', { x: w[0], y: w[1], size, rot: a - 128 + 28, sleeve: false });
      const lo = hand('loose', { x: w[0], y: w[1], size, rot: a - 90, sleeve: false });
      const g = `<g opacity="${f2(1 - rel)}">${st}</g><g opacity="${f2(rel)}">${lo}</g>`;
      return dark ? `<g style="filter:brightness(0.8)">${g}</g>` : g;
    };
    svg = hd(info.wristFar, info.elbowFar, true) + body + hd(info.wristNear, info.elbowNear, false);
  }
  return `<g transform="translate(${f2(e.tx)} ${f2(e.ty)})">${svg}</g>`;
}

export function frameSVG(t) {
  const i = Math.min(N - 1, Math.round(t * FPS));
  const e = T[i];
  const sk = shake(t, CONTACT_T, 3 * SLOW, 3.5, 4);   // the stone thuds into the door
  const c = { x: Math.max(-300, camX[i] + 230 - 960), y: 36, zoom: 1.1 };   // never past the room plate's left edge
  let s = L(c, 1, ROOM, { id: 'ptroom', bleed: 'all' });
  s += L(c, 1, SPEAR_LEAN + door(sk) + figure(i, t) + stone(e.stoneX, sk, TOP, R), { id: 'ptset', bleed: 'all' });
  s += `<rect width="1920" height="1080" fill="#1B2A44" opacity="0.08" style="mix-blend-mode:screen"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1920" height="1080" viewBox="0 0 1920 1080"><rect width="1920" height="1080" fill="#000"/>${s}</svg>`;
}
export const TRACK = T;
/** world positions of head, near wrist and hip at output frame i (for smoothness checks) */
export function probe(i) {
  const e = T[i], rel = ss(F_REL0, F_REL1, e.cf);
  const pose = lockedPose(e, { ...e.b.pose, ground: false });
  const local = [cornerP(e.stoneX)[0] - e.tx, cornerP(e.stoneX)[1] - e.ty];
  const ik = pushFigure({ costume: 'C', HF, height: HF, x: 0, y: 0, flip: true, pose, target: local });
  const p2 = { ...pose };
  for (const k of ['shoulderR', 'elbowR', 'shoulderL', 'elbowL']) p2[k] = lerp(ik.pose[k], pose[k], rel);
  const info = {};
  lin({ view: 'side', costume: 'C', height: HF, x: 0, y: 0, flip: true, pose: p2, hands: false, info });
  const w = (p) => [p[0] + e.tx, p[1] + e.ty];
  return { head: w(info.head), wrist: w(info.wristNear), hip: w(info.hip), stone: e.stoneX, ankN: w(info.legNear.ankle), ankF: w(info.legFar.ankle), toeN: w(info.legNear.toe), toeF: w(info.legFar.toe) };
}
