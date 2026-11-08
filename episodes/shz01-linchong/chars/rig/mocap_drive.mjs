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
export function sampler(clip, sigma = 3) {
  const F = clip.frames, n = F.length, sd = sigma / clip.df;
  const keys = Object.keys(F[0]).filter((k) => typeof F[0][k] === 'number' && k !== 'f');
  const pk = Object.keys(F[0].p);
  const R = Math.ceil(3 * sd), w = [];
  for (let i = -R; i <= R; i++) w.push(Math.exp(-(i * i) / (2 * sd * sd)));
  const smooth = (get) => {
    const raw = F.map(get), out = new Float64Array(n);
    for (let i = 0; i < n; i++) { let s = 0, ws = 0; for (let j = -R; j <= R; j++) { const k = Math.min(n - 1, Math.max(0, i + j)); s += raw[k] * w[j + R]; ws += w[j + R]; } out[i] = s / ws; }
    return out;
  };
  const S = {};
  for (const k of keys) S[k] = smooth((r) => r[k]);
  for (const k of pk) { S[`${k}.x`] = smooth((r) => r.p[k][0]); S[`${k}.y`] = smooth((r) => r.p[k][1]); }
  return (fr) => {
    const x = Math.max(0, Math.min(n - 1.0001, (fr - clip.f0) / clip.df)), i = Math.floor(x), u = x - i;
    const g = (a) => a[i] + (a[i + 1] - a[i]) * u;
    const r = { f: fr, p: {} };
    for (const k of keys) r[k] = g(S[k]);
    for (const k of pk) r.p[k] = [g(S[`${k}.x`]), g(S[`${k}.y`])];
    return r;
  };
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
