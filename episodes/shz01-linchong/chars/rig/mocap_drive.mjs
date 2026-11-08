// Driving 林冲's side-view rig from a motion-capture clip (film/mocap/clips/*.json, made by film/mocap/bvh2d.py).
// The capture keeps its own timing (real accelerations, real stops), so a shot cut from it moves like a person:
// no frozen holds, no instant starts, no instant stops. Curves are smoothed lightly (Gaussian, a few capture frames)
// to remove marker jitter without softening the motion.
//   const clip = loadClip(url); const at = sampler(clip, 3);  at(frame) -> record (angles + side-plane points)
//   retarget(rec, clip, { mirror }) -> { pose, hipX, hipY }  (pose in rig terms; hip in capture units)
import fs from 'fs';

export function loadClip(url) {
  const c = JSON.parse(fs.readFileSync(url, 'utf8'));
  c.f0 = c.frames[0].f; c.df = c.frames[1].f - c.frames[0].f;
  return c;
}

/** smoothed, interpolating sampler over capture frame numbers */
// default smoothing (capture frames, 120 Hz) per channel: the trunk calmest (its gait pitching reads as wobble on a
// big flat cloak), legs enough to round off the knee snapping straight at foot strike, points for placement
const SIG = { torso: 9, head: 9, thighR: 5, thighL: 5, kneeR: 6, kneeL: 6, upperR: 5, upperL: 5, elbowR: 5, elbowL: 5 };
export function sampler(clip, sigma = 4, per = SIG) {
  const F = clip.frames, n = F.length;
  const keys = Object.keys(F[0]).filter((k) => typeof F[0][k] === 'number' && k !== 'f');
  const pk = Object.keys(F[0].p);
  const smooth = (get, sg) => {
    const sd = sg / clip.df, R = Math.ceil(3 * sd), w = [];
    for (let i = -R; i <= R; i++) w.push(Math.exp(-(i * i) / (2 * sd * sd)));
    const raw = F.map(get), out = new Float64Array(n);
    for (let i = 0; i < n; i++) { let s = 0, ws = 0; for (let j = -R; j <= R; j++) { const k = Math.min(n - 1, Math.max(0, i + j)); s += raw[k] * w[j + R]; ws += w[j + R]; } out[i] = s / ws; }
    return out;
  };
  const S = {};
  for (const k of keys) S[k] = smooth((r) => r[k], per[k] ?? sigma);
  for (const k of pk) { S[`${k}.x`] = smooth((r) => r.p[k][0], sigma); S[`${k}.y`] = smooth((r) => r.p[k][1], sigma); }
  return (fr) => {
    const x = Math.max(0, Math.min(n - 1.0001, (fr - clip.f0) / clip.df)), i = Math.floor(x), u = x - i;
    const g = (a) => a[i] + (a[i + 1] - a[i]) * u;
    const r = { f: fr, p: {} };
    for (const k of keys) r[k] = g(S[k]);
    for (const k of pk) r.p[k] = [g(S[`${k}.x`]), g(S[`${k}.y`])];
    return r;
  };
}

/** cloth lag: run per-frame targets through a damped spring (frequency hz, damping zeta), dt = 1 / fps */
export function spring(targets, fps, hz = 1.6, zeta = 0.75) {
  const w = 2 * Math.PI * hz, dt = 1 / fps, out = [];
  let x = targets[0], v = 0;
  for (const tg of targets) {
    for (let k = 0; k < 4; k++) { const a = w * w * (tg - x) - 2 * zeta * w * v; v += a * dt / 4; x += v * dt / 4; }
    out.push(x);
  }
  return out;
}

const deg = (r) => (r * 180) / Math.PI;
/** foot pitch: ankle -> toe base, degrees below horizontal (+ = toes lower, i.e. heel up) */
const pitch = (a, t) => deg(Math.atan2(a[1] - t[1], t[0] - a[0]));

/** capture record -> rig pose. mirror: the capture's right leg/arm drive the rig's left (when he faces right the far
 *  side is L, so the capture's leading right leg becomes the far leg that shows in the cloak's opening). */
export function retarget(r, clip, o = {}) {
  const mir = o.mirror !== false;
  const rest = clip._restPitch || (clip._restPitch = (() => {
    const s = clip.frames[3].p; return { R: pitch(s.RightFoot, s.RightToeBase), L: pitch(s.LeftFoot, s.LeftToeBase) };
  })());
  const heel = { R: pitch(r.p.RightFoot, r.p.RightToeBase) - rest.R, L: pitch(r.p.LeftFoot, r.p.LeftToeBase) - rest.L };
  const A = mir ? 'L' : 'R', B = mir ? 'R' : 'L'; // rig side driven by the capture's right (A) and left (B)
  const pose = {
    torso: r.torso, spine: 0.4,
    [`leg${A}`]: r.thighR, [`knee${A}`]: Math.max(0, r.kneeR), [`foot${A}`]: Math.max(-5, heel.R),
    [`leg${B}`]: r.thighL, [`knee${B}`]: Math.max(0, r.kneeL), [`foot${B}`]: Math.max(-5, heel.L),
    armsWorld: true,
    [`shoulder${A}`]: r.upperR, [`elbow${A}`]: Math.max(0, r.elbowR), [`shoulder${B}`]: r.upperL, [`elbow${B}`]: Math.max(0, r.elbowL),
    headWorld: r.torso + r.head, footAuto: false,
  };
  return { pose, hipX: r.p.Hips[0], hipY: r.p.Hips[1] };
}

/** Keyframe reduction (the animator's clean-up pass): sample the capture only at chosen key frames — gait events and
 *  extremes — and pass a smooth spline (Catmull-Rom, through every key) between them. The posture and the timing stay
 *  the captured ones; the frame-to-frame micro-motion that reads as wobble on a flat 2D figure is gone. */
export function keyed(src, keys) {
  const K = keys.map((f) => ({ f, r: src(f) }));
  const num = Object.keys(K[0].r).filter((k) => typeof K[0].r[k] === 'number' && k !== 'f');
  const pk = Object.keys(K[0].r.p);
  const cr = (p0, p1, p2, p3, t, t0, t1, t2, t3) => {
    // non-uniform Catmull-Rom (keys are not evenly spaced): tangents from neighbouring keys, Hermite in between
    const m1 = ((p2 - p0) / (t2 - t0)) * (t2 - t1), m2 = ((p3 - p1) / (t3 - t1)) * (t2 - t1);
    const u = (t - t1) / (t2 - t1), u2 = u * u, u3 = u2 * u;
    return (2 * u3 - 3 * u2 + 1) * p1 + (u3 - 2 * u2 + u) * m1 + (-2 * u3 + 3 * u2) * p2 + (u3 - u2) * m2;
  };
  return (fr) => {
    const f = Math.max(K[0].f, Math.min(K[K.length - 1].f, fr));
    let i = 0;
    while (i < K.length - 2 && K[i + 1].f <= f) i++;
    const a = K[Math.max(0, i - 1)], b = K[i], c = K[i + 1], d = K[Math.min(K.length - 1, i + 2)];
    const ta = a === b ? b.f - (c.f - b.f) : a.f, td = d === c ? c.f + (c.f - b.f) : d.f;
    const g = (get) => cr(get(a.r), get(b.r), get(c.r), get(d.r), f, ta, b.f, c.f, td);
    const r = { f: fr, p: {} };
    for (const k of num) r[k] = g((q) => q[k]);
    for (const k of pk) r.p[k] = [g((q) => q.p[k][0]), g((q) => q.p[k][1])];
    return r;
  };
}
