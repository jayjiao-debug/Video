// 2D-style timing for the hand test: drawings on twos (15 per second), anticipation and overshoot.
// The 3D rig is only the hidden pose/proportion guide; this returns {ps, pl, meta} per drawing time.
const FILM = '/home/claude/video/episodes/shz01-linchong/film';
const { kf, E, ramp, lerp, clamp } = await import(FILM + '/lib.mjs');

export const FPS = 30, N = 150, T_CONTACT = 3.6;
// the press lands on the paper's lower-left blank area (xiushu XS.anchor('print') on the paper placed at
// x 690, y 150, 680x760, rotated -4°) -> screen ≈ (829, 694)
export const PRINT_TARGET = [812, 706];
export const S_PRESS = 1900;           // px per metre at contact: wrist->fingertip ≈ 355 px (S01's hand ≈ 353 px)

const FIST = { index: [88, 100, 60], middle: [90, 102, 62], ring: [92, 104, 62], pinky: [94, 104, 60] };
const OPEN = { index: [14, 22, 10], middle: [13, 21, 10], ring: [16, 25, 12], pinky: [19, 27, 13] };
const SPF = { index: 4, middle: 1, ring: -3, pinky: -7 }, SPO = { index: -2, middle: 0, ring: 2, pinky: 5 };
const TF = { opp: -95, abd: 5, flex1: 55, flex2: 55 }, TO = { opp: -58, abd: 2, flex1: 22, flex2: 26 };
const mixA = (a, b, k) => a.map((v, i) => lerp(v, b[i], k));
// a 2D-style spacing curve with anticipation (a) and overshoot (o): goes slightly back, snaps forward fast, overshoots, settles
function snap(t, t0, t1, a = 0.08, o = 0.1) {
  if (t <= t0) return 0;
  if (t >= t1) return 1;
  const u = (t - t0) / (t1 - t0);
  if (u < 0.18) return -a * Math.sin((u / 0.18) * Math.PI / 2);             // anticipation
  if (u < 0.55) { const v = (u - 0.18) / 0.37; return -a + (1 + o + a) * (1 - Math.pow(1 - v, 3)); } // fast out
  const v = (u - 0.55) / 0.45; return 1 + o * (1 - E.inOut(v));            // overshoot settles
}
export let OFFSET = [0, 0]; // set by the driver so the palm lands on PRINT_TARGET

export function handAt2(t) {
  // grip: tremble while clenched (on the drawing only, by the compositor), squeeze before letting go
  const k = snap(t, 0.8, 1.9, 0.10, 0.12);           // fingers open (anticipation = squeeze tighter)
  const kT = snap(t, 0.95, 2.0, 0.08, 0.10);
  const fingers = {};
  for (const f of Object.keys(FIST)) fingers[f] = mixA(FIST[f], OPEN[f], k).map((v) => Math.max(-12, v));
  const spread = Object.fromEntries(Object.keys(SPF).map((f) => [f, lerp(SPF[f], SPO[f], clamp(k))]));
  const thumb = Object.fromEntries(Object.keys(TF).map((q) => [q, lerp(TF[q], TO[q], kT)]));
  // flatten and spread for the press
  const kFlat = ramp(t, 3.25, 3.6, E.out);
  if (kFlat > 0) {
    for (const f of Object.keys(fingers)) fingers[f] = fingers[f].map((v) => v * (1 - 0.75 * kFlat));
    thumb.opp = lerp(thumb.opp, -16, kFlat); thumb.abd = lerp(thumb.abd, -10, kFlat); thumb.flex1 *= 1 - 0.6 * kFlat; thumb.flex2 *= 1 - 0.6 * kFlat;
    for (const f of Object.keys(spread)) spread[f] = lerp(spread[f], { index: -4, middle: 0, ring: 3, pinky: 7 }[f], kFlat);
  }
  // roll: palm toward camera (fist) -> turns as it opens -> palm-down, with a little wind-up
  const roll = kf(t, [[0, 8], [0.9, 8], [1.95, 52, E.inOut], [2.15, 46, E.inOut], [3.0, 180, E.out]]);
  const ang = roll * Math.PI / 180;
  const kR = ramp(t, 2.15, 3.0, E.out);
  const A = [lerp(0.12, 0, kR), 1, lerp(0.25, 0, kR)];
  const N3 = [Math.sin(ang), 0, Math.cos(ang)];
  // path: fist upper right over the paper -> travels to the lower-left blank area, descending (scale down)
  const cx = PRINT_TARGET[0] + OFFSET[0], cy = OFFSET[1];
  const x = kf(t, [[0, 1330], [1.9, 1320], [2.15, 1340, E.inOut], [3.0, cx + 10, E.out], [3.3, cx], [T_CONTACT, cx, E.in], [4.05, cx], [4.6, cx + 520, E.out], [5.0, cx + 560]]);
  const y = kf(t, [[0, 40], [1.9, 60], [2.15, 50, E.inOut], [3.0, cy + 30, E.out], [3.3, cy + 40], [T_CONTACT, cy, E.in], [4.05, cy], [4.6, cy - 120, E.out], [5.0, cy - 130]]);
  const s = kf(t, [[0, 3000], [1.9, 2950], [2.15, 2980], [3.0, S_PRESS * 1.1, E.out], [3.3, S_PRESS * 1.14, E.out], [T_CONTACT, S_PRESS, E.in], [4.05, S_PRESS], [4.6, S_PRESS * 1.16, E.out], [5.0, S_PRESS * 1.17]]);
  const meta = { curlMCP: (fingers.middle[0] + fingers.index[0]) / 2, thumbOpp: thumb.opp, palmDown: roll > 120 };
  return { ps: { fingers, spread, thumb }, pl: { A, N: N3, x, y, s, light: [-0.55, 0.75, 0.85], outline: 3 }, meta };
}

// compositor-only effects (on the drawing, in screen px): tremble while clenched, press squash, 2-frame shake
export function drawFx(t, frame) {
  const tremble = t < 0.8 ? ((Math.floor(frame / 2) % 2) ? 1.6 : -1.6) : 0;
  const squash = t >= T_CONTACT && t < T_CONTACT + 3 / FPS ? 0.08 : 0;
  const sh = t >= T_CONTACT && t < T_CONTACT + 2 / FPS ? ((frame % 2) ? 3 : -3) : 0;
  return { dx: tremble * 0.6 + sh, dy: tremble + sh * 0.5, squash };
}
