// 林冲 pushing something heavy (side view): body from a motion-capture frame (legs, hips, spine: see pose_sheet.mjs),
// arms solved to reach the object (two-bone IK: a real body's arms go where the object is), 2D hands from
// film/hand2d ('stone': heel of the hand pressed, fingers over the rounded top edge).
//   pushFigure({ pose, HF, x, y, flip, expr, reach, drop, far, ...lin options })
//     pose   rig pose with torso/legs/knees (arms are overwritten); x, y = feet on the floor (as lin)
//     reach  0..1 straightness of the arms (default 0.93); drop = degrees below horizontal from the shoulder (20)
//     target [x, y]: put the near palm exactly here instead (the far hand a little behind and above)
//   -> { svg, info, contact: [x, y] (near palm on the object), stone: { x, top, r } } — `stone` is where the object's
//      back face (x), top (top) and corner radius (r) must be so the palm sits on the rounded top-back edge.
import { lin } from './linchong.mjs';
import { hand } from '../../film/hand2d/poses.mjs';

const deg = (r) => (r * 180) / Math.PI, rad = (d) => (d * Math.PI) / 180;
const sub = (a, b) => [a[0] - b[0], a[1] - b[1]], len = (a) => Math.hypot(a[0], a[1]);

export function pushFigure(o) {
  const { HF, flip = true } = o, s = flip ? 1 : -1;
  const ns = flip ? 'R' : 'L', fs = flip ? 'L' : 'R';
  const base = { ...o.pose, armsWorld: true };
  const run = (pose, info = {}) => ({ svg: lin({ ...o, view: 'side', pose, flip, hands: false, info }), info });
  // world angle of a segment from straight down, + = forward
  const wang = (a, b) => deg(Math.atan2(s * (b[0] - a[0]), b[1] - a[1]));
  let pose = { ...base, [`shoulder${ns}`]: 60, [`elbow${ns}`]: 10, [`shoulder${fs}`]: 60, [`elbow${fs}`]: 10 };
  let r = run(pose);
  const I0 = r.info;
  const l1 = len(sub(I0.elbowNear, I0.shoulderNear)), l2 = len(sub(I0.wristNear, I0.elbowNear));
  const ik = (S, T) => {
    const d = Math.min(len(sub(T, S)), (l1 + l2) * 0.999);
    const base = Math.atan2(T[1] - S[1], T[0] - S[0]);
    const al = Math.acos(Math.max(-1, Math.min(1, (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d))));
    const b = base + s * al; // elbow below the line shoulder -> hand
    const E = [S[0] + l1 * Math.cos(b), S[1] + l1 * Math.sin(b)];
    return { E, T, u: wang(S, E), f: wang(E, T) };
  };
  const size = 0.108 * HF, k = size / 100, bend = o.bend ?? 28;
  const rotOf = (w, e) => { const a = deg(Math.atan2(e[1] - w[1], e[0] - w[0])); return flip ? a - 128 + bend : a - 52 - bend; };
  const palmOff = (rot) => { const pc = [15 * (flip ? 1 : -1) * k, -24 * k], rr = rad(rot); return [pc[0] * Math.cos(rr) - pc[1] * Math.sin(rr), pc[0] * Math.sin(rr) + pc[1] * Math.cos(rr)]; };
  const reach = (o.reach ?? 0.93) * (l1 + l2), drop = rad(o.drop ?? 20);
  let Tn = [I0.shoulderNear[0] + s * reach * Math.cos(drop), I0.shoulderNear[1] + reach * Math.sin(drop)];
  // target: where the near palm must touch (world); the wrist goes where that palm offset says
  const aimWrist = (rot) => { const q = palmOff(rot); return [o.target[0] - q[0], o.target[1] - q[1]]; };
  if (o.target) Tn = aimWrist(rotOf([0, 0], [-s, 0]));
  let Tf = [Tn[0] - s * 0.012 * HF, Tn[1] - 0.022 * HF];
  // passes: the rig's drawn arms have their own rest angles, so correct by what was measured
  for (let pass = 0; pass < (o.target ? 3 : 2); pass++) {
    const I = r.info;
    if (o.target && pass > 0) { Tn = aimWrist(rotOf(I.wristNear, I.elbowNear)); Tf = [Tn[0] - s * 0.012 * HF, Tn[1] - 0.022 * HF]; }
    const gN = ik(I.shoulderNear, Tn), gF = ik(I.shoulderFar, Tf);
    const uN = wang(I.shoulderNear, I.elbowNear), fN = wang(I.elbowNear, I.wristNear);
    const uF = wang(I.shoulderFar, I.elbowFar), fF = wang(I.elbowFar, I.wristFar);
    pose = { ...pose,
      [`shoulder${ns}`]: pose[`shoulder${ns}`] + (gN.u - uN), [`elbow${ns}`]: pose[`elbow${ns}`] + (gN.f - fN) - (gN.u - uN),
      [`shoulder${fs}`]: pose[`shoulder${fs}`] + (gF.u - uF), [`elbow${fs}`]: pose[`elbow${fs}`] + (gF.f - fF) - (gF.u - uF) };
    r = run(pose);
  }
  const I = r.info;
  const handAt = (w, e, dark) => {
    // 'stone' leaves the wrist toward its forearm at 128° (mirrored when facing left)
    const rot = rotOf(w, e);
    const g = hand('stone', { x: w[0], y: w[1], size, rot, flip: !flip, sleeve: false });
    const q = palmOff(rot), P = [w[0] + q[0], w[1] + q[1]];
    return { svg: dark ? `<g style="filter:brightness(0.8)">${g}</g>` : g, P, rot };
  };
  const hf = handAt(I.wristFar, I.elbowFar, true), hn = handAt(I.wristNear, I.elbowNear, false);
  // the object's rounded top-back corner under the near palm (palm normal = the contact direction)
  const R = 0.075 * HF, nrm = rad(hn.rot + (flip ? 0 : 180)); // the palm faces along the hand's local +x
  const C = [hn.P[0] + R * Math.cos(nrm), hn.P[1] + R * Math.sin(nrm)];
  const stone = { x: C[0] - s * R, top: C[1] - R, r: R, contact: hn.P };
  return { svg: hf.svg + r.svg + hn.svg, info: I, pose, stone, contact: hn.P };
}
