// segment D camera: the match cut onto the back-wall clock, the pull-back to the four, the hold, the glide back to OPEN.
// Pure functions of the frame (no THREE objects: the probe script imports this file in node).
import { between, easeInOutCubic, easeInOutQuad, lerp, smooth, type CamPose, type Vec3 } from "../story";
import { OPEN } from "./common";

const W = 1080, H = 1920;
/** classroom back-wall clock (sets/classroom.ts backClock): face centre, radius incl. bezel; the face looks -z */
export const CLOCK_C: Vec3 = [-0.22, 2.72, 5.945];
export const CLOCK_R = 0.2;
/** segment C ends with the lab dial's outer rim as a circle of this diameter (px) centred here */
export const MATCH = { d: 0.92 * W, x: 540, y: 760 };

/** f1367: square-on to the clock (camera axis along +z, the clock's normal), clock rim = MATCH exactly.
 *  d tan(fov/2) = R H / MATCH.d; the camera sits below the clock so its centre lands 200 px above the frame centre. */
const CLOCK_Z = 2.9;
const dist = CLOCK_C[2] - CLOCK_Z;
const tanH0 = (CLOCK_R * H) / (MATCH.d * dist);
const dy0 = ((H / 2 - MATCH.y) / (H / 2)) * tanH0 * dist;
export const CAM_CLOCK: CamPose = {
  pos: [CLOCK_C[0], CLOCK_C[1] - dy0, CLOCK_Z],
  look: [CLOCK_C[0], CLOCK_C[1] - dy0, CLOCK_C[2]],
  fov: (2 * Math.atan(tanH0) * 180) / Math.PI,
};
/** end of the fast pull-back (~f1440): eye level, the four with the clock above them */
export const CAM_A: CamPose = { pos: [-0.22, 1.52, 1.3], look: [-0.22, 1.0, 4.9], fov: 70 };
/** the slow drift ends here (~f1650): a touch wider, all four heads clear of the frame edges for the slide card */
export const CAM_B: CamPose = { pos: [-0.22, 1.5, 1.0], look: [-0.22, 1.0, 4.9], fov: 74 };

const lnTan = (fov: number) => Math.log(Math.tan((fov * Math.PI) / 360));
const fovOf = (lt: number) => (2 * Math.atan(Math.exp(lt)) * 180) / Math.PI;
const v = (p: CamPose["pos"]) => p as Vec3;
const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
/** screen y (px) of the clock centre seen from cam (camera axis in the y-z plane, no roll) */
const clockY = (c: CamPose) => {
  const p = v(c.pos), l = v(c.look), pitch = Math.atan2(p[1] - l[1], l[2] - p[2]);
  const elev = Math.atan2(CLOCK_C[1] - p[1], CLOCK_C[2] - p[2]);
  return H / 2 - (H / 2) * (Math.tan(elev + pitch) / Math.tan((c.fov * Math.PI) / 360));
};
const YC0 = clockY(CAM_CLOCK), YCA = clockY(CAM_A);
/** the pull-back, u 0..1: position and log-tan fov interpolate linearly; the tilt is solved every frame so the clock's
 *  screen height moves monotonically from the match (y 760) to its place in CAM_A (it never runs off the top) */
const pull = (u: number, uz = u): CamPose => {
  const p0 = v(CAM_CLOCK.pos), p1 = v(CAM_A.pos);
  const pos: Vec3 = [lerp(p0[0], p1[0], u), lerp(p0[1], p1[1], u), lerp(p0[2], p1[2], u)];
  const lt = lerp(lnTan(CAM_CLOCK.fov), lnTan(CAM_A.fov), uz), tanH = Math.exp(lt);
  const yc = lerp(YC0, YCA, u), k = (H / 2 - yc) / (H / 2);
  const elev = Math.atan2(CLOCK_C[1] - pos[1], CLOCK_C[2] - pos[2]);
  const pitch = Math.atan(k * tanH) - elev;   // + = looking down
  const L = lerp(CLOCK_C[2] - p0[2], v(CAM_A.look)[2] - p1[2], u);
  return { pos, look: [pos[0], pos[1] - Math.tan(pitch) * L, pos[2] + L], fov: fovOf(lt) };
};
/** base + weight x (B - A) in pos / look / log-tan fov */
const addDelta = (base: CamPose, A: CamPose, B: CamPose, w: number): CamPose => {
  const dp = sub(v(B.pos), v(A.pos)), dl = sub(v(B.look), v(A.look)), bp = v(base.pos), bl = v(base.look);
  return {
    pos: [bp[0] + w * dp[0], bp[1] + w * dp[1], bp[2] + w * dp[2]],
    look: [bl[0] + w * dl[0], bl[1] + w * dl[1], bl[2] + w * dl[2]],
    fov: fovOf(lnTan(base.fov) + w * (lnTan(B.fov) - lnTan(A.fov))),
  };
};

/** frame schedule */
export const CAMT = { pull0: 1367, pull1: 1440, zoom1: 1425, drift0: 1426, warp: 6, warp0: 1405, warp1: 1415, drift1: 1652, glide0: 1932, glide1: 1985 };

export function camD(f: number): CamPose {
  const T = CAMT;
  if (f >= T.glide1) return { pos: [...v(OPEN.pos)] as Vec3, look: [...v(OPEN.look)] as Vec3, fov: OPEN.fov };
  if (f >= T.glide0) return addDelta(CAM_B, CAM_B, OPEN, between(f, T.glide0, T.glide1, easeInOutCubic));
  // the pull-back out of the match (C ends on a push-in into the dial), overlapped by a slow drift wider
  // zoom (log-tan fov) over 1367-1425 and descent over 1372-1440, both easeInOutQuad: the clock's peak shrink rate is
  // 0.071 / frame (x2.4 per 0.4 s; the old cubic whip was 0.124). Both run 6 frames ahead around f1405-1415 (a smooth
  // time warp), the moment the four rise through the caption band: their head centres cross y 62-78 % in 4 frames
  // (f1408-1411), then they settle above it (y ~48 % by f1440)
  const wf = f + T.warp * smooth((f - T.warp0) / (T.warp1 - T.warp0));
  const a = between(wf, T.pull0 + 5, T.pull1, easeInOutQuad), az = between(wf, T.pull0, T.zoom1, easeInOutQuad);
  const b = between(f, T.drift0, T.drift1, easeInOutQuad);
  return addDelta(pull(a, az), CAM_A, CAM_B, b);
}
