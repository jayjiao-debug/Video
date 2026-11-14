// SEGMENT F's own helpers (WP5-F): framing, camera mixing, her walking ease, a lagged eye, the mic's aim through keys
// (copies of the generic camera helpers of segE_parts, kept here so segment F never moves when another segment's file
// changes), the constant-speed push, axes -> quaternion, THE SHOVEL by its blade, the charcoal's strokes on the board
// and THE SPARKS (a 2D burst out of the fire door, kept off the faces: the fire spits, the shovel's charcoal goes in, the
// poker stirs), the flare's warm flash, the grades (the night garden; the room hours later).
// Every function is pure: nothing keeps state between frames; all noise from hash().
import * as THREE from "three";
import { FPS, clamp01, lerp, smooth, easeOutCubic, hash, h, type CamPose } from "../story";
import { FOV } from "../layout";
import * as C from "../cam";
import type { GradeParams } from "../../vasa/grade";

export const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
export const sec = (s: number) => Math.round(s * FPS);
const v3 = (p: CamPose["pos"]) => (p instanceof THREE.Vector3 ? p.clone() : V(p[0], p[1], p[2]));
/** a camera's position as a Vector3 */
export const posOf = (c: CamPose) => v3(c.pos);

/** a camera at `pos` turned so that the world point `p` lands on screen (sx, sy) px (vertical fov, 9:16) */
export const frameOn = (pos: THREE.Vector3, p: THREE.Vector3, sx: number, sy: number, fov = FOV): CamPose => {
  const tanV = Math.tan((fov * Math.PI) / 360), tanH = tanV * (1080 / 1920);
  const d = p.clone().sub(pos), yawP = Math.atan2(d.x, -d.z), pitchP = Math.atan2(d.y, Math.hypot(d.x, d.z));
  const yaw = yawP - Math.atan(((sx / 1080) * 2 - 1) * tanH), pitch = pitchP - Math.atan((1 - (sy / 1920) * 2) * tanV);
  const L = 3;
  return { pos: [pos.x, pos.y, pos.z], look: [pos.x + Math.sin(yaw) * Math.cos(pitch) * L, pos.y + Math.sin(pitch) * L, pos.z - Math.cos(yaw) * Math.cos(pitch) * L], fov };
};
/** two cameras mixed: position, view direction and fov (k 0..1, eased) */
export const mixCam = (a: CamPose, b: CamPose, k: number): CamPose => {
  if (k <= 0) return a;
  if (k >= 1) return b;
  const A = C.camAxes(a), B = C.camAxes(b), e = smooth(k);
  const pos = A.p.clone().lerp(B.p, e), dir = A.fwd.clone().lerp(B.fwd, e).normalize(), dist = lerp(A.dist, B.dist, e);
  const look = pos.clone().addScaledVector(dir, dist);
  return { pos: [pos.x, pos.y, pos.z], look: [look.x, look.y, look.z], fov: lerp(a.fov, b.fov, e) };
};
/** two cameras mixed LINEARLY (k as given, no ease): for a push that runs at its own speed */
export const lerpCam = (a: CamPose, b: CamPose, k: number): CamPose => {
  if (k <= 0) return a;
  if (k >= 1) return b;
  const A = C.camAxes(a), B = C.camAxes(b);
  const pos = A.p.clone().lerp(B.p, k), dir = A.fwd.clone().lerp(B.fwd, k).normalize(), dist = lerp(A.dist, B.dist, k);
  const look = pos.clone().addScaledVector(dir, dist);
  return { pos: [pos.x, pos.y, pos.z], look: [look.x, look.y, look.z], fov: lerp(a.fov, b.fov, k) };
};
/** a walker's ease: speeding up over the first quarter, steady, slowing over the last (peak 1.33 x the average) */
export const stride = (x: number, r = 0.25) => {
  const v = 1 / (1 - r), u = clamp01(x);
  return u < r ? (v * u * u) / (2 * r) : u > 1 - r ? 1 - (v * (1 - u) * (1 - u)) / (2 * r) : v * (u - r / 2);
};
/** THE SLOW PUSH: 0..1 over [from, to] at a constant speed with soft starts of `ramp` frames (cam.ts creep's profile) */
export const creepU = (f: number, from: number, to: number, ramp = 8) => {
  const n = Math.max(1, to - from), r = Math.min(ramp, n / 3), x = clamp01((f - from) / n) * n, v = 1 / (n - r);
  return clamp01(x < r ? (v * x * x) / (2 * r) : x > n - r ? 1 - (v * (n - x) * (n - x)) / (2 * r) : v * (x - r / 2));
};
/** a point averaged over the `win` frames up to f (weights falling off: her eyes follow a little late). Pure. */
export const lagged = (f: number, at: (g: number) => THREE.Vector3, win = 6) => {
  const p = V(); let ws = 0;
  for (let i = 0; i < win; i++) { const wg = win - i; p.addScaledVector(at(f - i), wg); ws += wg; }
  return p.divideScalar(ws);
};
/** the mic's aim through step keys [frame, aim(f)], each change eased over `len` frames */
export const aimThrough = (f: number, keys: [number, (g: number) => THREE.Vector3][], len = 9) => {
  let i = 0; while (i + 1 < keys.length && keys[i + 1][0] <= f) i++;
  const cur = keys[i][1](f);
  if (i === 0) return cur;
  const k = smooth(clamp01((f - keys[i][0]) / len));
  return k >= 1 ? cur : keys[i - 1][1](f).lerp(cur, k);
};
/** a world rotation from a thing's local +y and +z given as world directions (z made perpendicular to y) */
export const quatYZ = (y: THREE.Vector3, z: THREE.Vector3) => {
  const yy = y.clone().normalize(); let zz = z.clone().addScaledVector(yy, -z.dot(yy));
  if (zz.lengthSq() < 1e-8) zz = Math.abs(yy.y) < 0.9 ? V(0, 1, 0).addScaledVector(yy, -yy.y) : V(0, 0, 1);
  zz.normalize();
  return new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(V().crossVectors(yy, zz), yy, zz));
};

// ------------------------------------------------------------------------------------------------- the shovel
/** the blade's middle above the shovel's origin (props/things.ts: the blade box sits at y 0.56, tipped 0.25 rad) */
export const BLADE_Y = 0.56;
/** THE SHOVEL put by its blade: the blade's middle `blade` (world) and `handle` = the direction from the blade toward
 *  the T grip; the scoop's open face turned toward `up` (default the sky). -> { at, rot } for put(at, { rot, load }) */
export const shovelPut = (blade: THREE.Vector3, handle: THREE.Vector3, up = V(0, 1, 0)) => {
  const y = handle.clone().normalize().multiplyScalar(-1);
  return { at: blade.clone().addScaledVector(handle.clone().normalize(), BLADE_Y), rot: quatYZ(y, up) };
};

// ------------------------------------------------------------------------------------------------- the board
/** his charcoal's place on the board's face at time t (board units: x across, y up the drawing, metres): circles and
 *  triangles, one stroke at a time; `k` 1 = drawing, 0 = the hand held still just off the board */
export const stroke = (t: number) => {
  const T = 1.6, n = Math.floor(t / T), u = t / T - n, kind = n % 3, cx = -0.07 + 0.05 * (hash(n, 3) - 0.5), cy = 0.01 + 0.06 * (hash(n, 5) - 0.5);
  let x: number, y: number;
  if (kind === 0) { const a = u * Math.PI * 2 * 1.05; x = cx + 0.035 * Math.cos(a); y = cy + 0.03 * Math.sin(a); }
  else { const P = [[0, 0.04], [-0.04, -0.025], [0.04, -0.025], [0, 0.04]], s = Math.min(2.999, u * 3), i = Math.floor(s), e = s - i; x = cx + lerp(P[i][0], P[i + 1][0], e); y = cy + lerp(P[i][1], P[i + 1][1], e); }
  // a lift between strokes (the last 12 % of each)
  const lift = u > 0.88 ? Math.sin(Math.PI * (u - 0.88) / 0.12) : 0;
  return { x, y, lift };
};

// ------------------------------------------------------------------------------------------------- the sparks
/** screen circles (px, 1080 x 1920) a spark never crosses: the heads in front of the fire (its sparks fly out of the
 *  fire door BEHIND them, so a 2D spark over a face is wrong; director round 1) */
export type SparkMask = { x: number; y: number; r: number }[];
const masked = (m: SparkMask, x: number, y: number, pad: number) => m.some((c) => (x - c.x) * (x - c.x) + (y - c.y) * (y - c.y) < (c.r + pad) * (c.r + pad));
/** THE SPARKS: a burst of glowing sparks flying up and out from screen point `p` (px) on frame f, `on` = the burst's
 *  first frame; `dir` = the screen direction they mostly fly (deg, 0 = right, -90 = up); `n` sparks, `len` frames,
 *  `speed` px a frame, `size` px, `stagger` = over how many frames they are born, `streak` > 0 = drawn as streaks
 *  along their flight (that many frames of travel long), `glow` = the halo's strength. A spark whose head or tail is in
 *  a `mask` circle is not drawn. Nothing before `on` or after the last spark dies. */
export const sparks = (f: number, on: number, p: { x: number; y: number }, o: { n?: number; len?: number; speed?: number; size?: number; dir?: number; spread?: number; seed?: number; stagger?: number; streak?: number; glow?: number; jitter?: number } = {}, mask: SparkMask = []) => {
  const d = f - on, len = o.len ?? 16, stag = o.stagger ?? 2;
  if (d < 0 || d > len + stag + 2) return null;
  const n = o.n ?? 14, sd = o.seed ?? 0, dots: ReturnType<typeof h>[] = [];
  for (let i = 0; i < n; i++) {
    const a = ((o.dir ?? -70) + (hash(i, 11 + sd) - 0.5) * (o.spread ?? 90)) * (Math.PI / 180);
    const life = len * (0.5 + 0.5 * hash(i, 13 + sd)), age = d - stag * hash(i, 17 + sd);
    if (age < 0 || age > life) continue;
    const v = (o.speed ?? 14) * (0.55 + 0.6 * hash(i, 19 + sd)), u = age / life;
    const j = (o.jitter ?? 0) * (hash(i, 29 + sd) - 0.5);
    const x0 = p.x + j * Math.sin(a), y0 = p.y - j * Math.cos(a);
    const x = x0 + Math.cos(a) * v * age, y = y0 + Math.sin(a) * v * age + 0.35 * age * age;
    const vx = Math.cos(a) * v, vy = Math.sin(a) * v + 0.7 * age, sp = Math.hypot(vx, vy) || 1;
    const s = (o.size ?? 9) * (0.6 + 0.6 * hash(i, 23 + sd)) * (1 - 0.5 * u), al = (1 - easeOutCubic(u)) * 0.97;
    const L = o.streak ? Math.max(s, sp * o.streak * (1 - 0.4 * u)) : s;
    const tx = x - (vx / sp) * L, ty = y - (vy / sp) * L;
    if (masked(mask, x, y, s * 0.6) || masked(mask, tx, ty, s * 0.4)) continue;
    const gl = o.glow ?? 1;
    if (!o.streak) {
      dots.push(h("div", { key: i, style: { position: "absolute", left: x - s / 2, top: y - s / 2, width: s, height: s, borderRadius: "50%", opacity: al,
        background: "radial-gradient(circle, #ffffff 0%, #fff0a0 30%, #ffb040 58%, rgba(255,110,30,0) 100%)", boxShadow: `0 0 ${Math.round(s * 1.4 * gl)}px ${Math.round(s * 0.45 * gl)}px rgba(255,130,40,0.7)` } }));
    } else {
      const th = Math.max(2, s * 0.42), ang = (Math.atan2(vy, vx) * 180) / Math.PI;
      dots.push(h("div", { key: i, style: { position: "absolute", left: x - L, top: y - th / 2, width: L, height: th, borderRadius: th, opacity: al, transformOrigin: `${L}px ${th / 2}px`, transform: `rotate(${ang.toFixed(1)}deg)`,
        background: "linear-gradient(to right, rgba(255,90,20,0) 0%, rgba(255,150,50,0.85) 45%, #fff3b8 88%, #ffffff 100%)", boxShadow: `0 0 ${Math.round(s * 1.1 * gl)}px ${Math.round(s * 0.3 * gl)}px rgba(255,140,50,0.65)` } }));
    }
  }
  return dots.length ? h("div", { key: `sparks${on}`, style: { position: "absolute", left: 0, top: 0, width: 1080, height: 1920, overflow: "hidden", pointerEvents: "none" } }, ...dots) : null;
};
/** THE FLASH of a flare: warm firelight thrown out of the fire door for a few frames (a soft radial glow, screen-blended,
 *  centred on the door's mouth on screen, radius r px), `k` 0..1 */
export const flash = (key: string, p: { x: number; y: number }, r: number, k: number) => k <= 0.01 ? null :
  h("div", { key, style: { position: "absolute", left: 0, top: 0, width: 1080, height: 1920, pointerEvents: "none", mixBlendMode: "screen", opacity: Math.min(1, k),
    background: `radial-gradient(circle ${Math.round(r)}px at ${Math.round(p.x)}px ${Math.round(p.y)}px, rgba(255,170,90,0.62) 0%, rgba(255,130,60,0.34) 42%, rgba(255,110,40,0) 100%)` } });

/** THE FLARE ON HIS CHEEK: a warm glow laid over the cheek nearest the fire, soft-light blended (a screen blend does
 *  not show on a pale face, a normal one washes his drawn eyes and brows out; soft light warms the pale skin and keeps
 *  the dark lines dark), centred on `p` px, radius r px, `k` 0..1 */
export const cheekGlow = (key: string, p: { x: number; y: number }, r: number, k: number) => k <= 0.01 ? null :
  h("div", { key, style: { position: "absolute", left: 0, top: 0, width: 1080, height: 1920, pointerEvents: "none", mixBlendMode: "soft-light", opacity: Math.min(1, k),
    background: `radial-gradient(circle ${Math.round(r)}px at ${Math.round(p.x)}px ${Math.round(p.y)}px, rgba(255,120,30,0.95) 0%, rgba(255,120,30,0.6) 45%, rgba(255,110,30,0) 100%)` } });

// ------------------------------------------------------------------------------------------------- the grades
/** a COPY of Film.tsx GRADE_FILM (the default every place uses; kept here so F never imports the composition) */
export const GRADE_BASE: GradeParams = { ky: [0, 0.1, 0.27, 0.58, 0.82, 0.935, 1], sat: [0.97, 0.98, 0.96], tintS: [0.006, 0.006], tintM: [-0.01, 0.008], tintH: [-0.016, 0.01], vig: [0.16, 0.42] };
/** F1, the night garden: the moonlit day colours pulled toward a desaturated blue (shadows and mids cooled and greyed),
 *  the highlights (his candle, the lit window, the door's glow) left warm; the same curve, so the same mid-tone */
export const GRADE_NIGHT: GradeParams = { ky: [0, 0.1, 0.27, 0.58, 0.82, 0.935, 1], sat: [0.46, 0.55, 1.0], tintS: [0.04, -0.022], tintM: [0.03, -0.018], tintH: [-0.018, 0.022], vig: [0.22, 0.4] };
/** F4-F5, hours later: the room sunk round him (the low end pressed, a heavier vignette), the face's highlights kept */
export const GRADE_LATE: GradeParams = { ky: [0, 0.075, 0.215, 0.52, 0.79, 0.93, 1], sat: [0.94, 0.98, 0.98], tintS: [0.004, 0.012], tintM: [-0.012, 0.01], tintH: [-0.016, 0.01], vig: [0.38, 0.28] };
/** two grades mixed (k 0..1) */
export const mixGrade = (a: GradeParams, b: GradeParams, k: number): GradeParams => {
  const L = (x: number, y: number) => x + (y - x) * k;
  return { ky: a.ky.map((v, i) => L(v, b.ky[i])), sat: [L(a.sat[0], b.sat[0]), L(a.sat[1], b.sat[1]), L(a.sat[2], b.sat[2])], tintS: [L(a.tintS[0], b.tintS[0]), L(a.tintS[1], b.tintS[1])],
    tintM: [L(a.tintM[0], b.tintM[0]), L(a.tintM[1], b.tintM[1])], tintH: [L(a.tintH[0], b.tintH[0]), L(a.tintH[1], b.tintH[1])], vig: [L(a.vig[0], b.vig[0]), L(a.vig[1], b.vig[1])] };
};
