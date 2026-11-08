// Vasa short, the whole film (73.2 s), timed to the narration (vasa_narration_v1, Jin). Frame f = voice time * 30.
// All story times below are VOICE seconds.
// Camera grammar is the bridge short's: smootherstep glides, creeping push-ins on holds, flip kicks on impacts.
export const FPS = 30;
export const T0 = 0; // voice time of frame 0
export const TOTAL = 2196; // 73.2 s
export const D0 = 6.0; // quay top (m); water at y = 0
export type V3 = [number, number, number];
export const tv = (f: number) => T0 + f / FPS; // frame -> voice time
export const fv = (t: number) => Math.round((t - T0) * FPS); // voice time -> frame

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const smooth = (x: number) => { const u = clamp01(x); return u * u * (3 - 2 * u); };
export const easeOut = (u: number) => 1 - (1 - clamp01(u)) ** 4;
export const lin = (pts: [number, number][], x: number) => {
  if (x <= pts[0][0]) return pts[0][1];
  for (let i = 1; i < pts.length; i++) if (x <= pts[i][0]) {
    const [x0, y0] = pts[i - 1], [x1, y1] = pts[i];
    return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0);
  }
  return pts[pts.length - 1][1];
};

// ---------------- the ship ----------------
export const ZS = -22; // ship centreline (world z); the quay wall is at z = -30, the river side is +z
export const ROLL_Y = 0.6; // roll axis height
export const HALF_BEAM = 5.7;
/** deck heights along the ship (bow at +x): poop, quarterdeck, waist, forecastle */
export const deckY = (x: number) => (x < -15 ? 10.5 : x < -8 ? 8.0 : x < 10 ? 5.5 : 7.0);
/** top of the bulwark (sheer line) */
export const sheerY = (x: number) => lin([[-20, 13.2], [-15.2, 12.2], [-14.8, 11.6], [-8.2, 10.0], [-7.8, 6.7], [9.8, 6.7], [10.2, 8.1], [17, 8.4], [20, 9.2]], x);
const SEC: [number, number][] = [[-4.6, 0.12], [-3.2, 0.58], [-1.6, 0.87], [0, 0.97], [1.6, 1.0], [3.2, 0.97], [5.2, 0.9], [8, 0.84], [14, 0.8]];
const plan = (x: number) => (x < -17 ? 0.9 + 0.1 * smooth((x + 20) / 3) : x <= 7 ? 1 : Math.sqrt(Math.max(0, 1 - ((x - 7) / 13.2) ** 2)));
/** half-width of the hull at (x, y) */
export const halfW = (x: number, y: number) => HALF_BEAM * plan(x) * lin(SEC, y);
/** where the ship is: roll about x through ROLL_Y, then moved to (x, y, z) (z = centreline) */
export type Pose = { heel: number; x: number; y: number; z: number };
export const AT_QUAY: Pose = { heel: 0, x: 0, y: 0, z: ZS };
/** ship-local point -> world */
export const shipToWorld = (p: V3, P: Pose | number): V3 => {
  const q = typeof P === "number" ? { ...AT_QUAY, heel: P } : P;
  const y = p[1] - ROLL_Y, c = Math.cos(q.heel), s = Math.sin(q.heel);
  return [p[0] + q.x, ROLL_Y + q.y + y * c - p[2] * s, q.z + y * s + p[2] * c];
};
/** smooth keyframes: ease in/out between keys (zero speed at each key) */
export const spl = (pts: [number, number][], x: number) => {
  if (x <= pts[0][0]) return pts[0][1];
  for (let i = 1; i < pts.length; i++) if (x <= pts[i][0]) {
    const [x0, y0] = pts[i - 1], [x1, y1] = pts[i];
    return y0 + (y1 - y0) * smooth((x - x0) / (x1 - x0));
  }
  return pts[pts.length - 1][1];
};

// ---------------- the running test ----------------
// crowd position across the deck, -1 = quay side (-z) .. +1 = river side (+z). Laps land on the narration:
// whistle on "出发前" (15.0), off on "让三十个水手" (16.0), the third lap on "第三趟" (19.2), the worst roll on "快翻了"
export const WHISTLE = 15.0, STOP = 20.6;
export const crowdC = (t: number) => lin([
  [16.0, 0], [16.75, 1], [17.35, 1], [18.55, -1], [19.0, -1], [20.25, 1], [21.9, 1], [23.4, 0.15],
], t);
/** heel in radians (positive = rail on the river side goes down): a lightly damped roll driven by the crowd */
const HEEL: number[] = (() => {
  const dt = 1 / 300, w = (2 * Math.PI) / 2.75, z = 0.07, n = Math.ceil((30 - 14) / dt) + 1;
  let th = 0, om = 0;
  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    const t = 14 + i * dt;
    out.push(th);
    const acc = -w * w * th - 2 * z * w * om + w * w * crowdC(t);
    om += acc * dt; th += om * dt;
  }
  const peak = Math.max(...out.map(Math.abs));
  const k = (16 * Math.PI) / 180 / peak; // the worst roll is 16 degrees
  return out.map((v) => v * k);
})();
export const heelAt = (t: number) => {
  if (t >= 25.0) return 0; // launch day: upright
  const u = (t - 14) * 300, i = Math.floor(u), a = u - i;
  if (i < 0) return 0;
  if (i >= HEEL.length - 1) return HEEL[HEEL.length - 1];
  return HEEL[i] * (1 - a) + HEEL[i + 1] * a;
};

// ---------------- shots ----------------
export type Light = "day" | "golden";
/** who is in the shot (cast.ts stage) */
export type Crowd = "test" | "launch" | "sail" | "officers" | "empty" | "king" | "toy" | "inquiry" | "freeze";
export type SetName = "harbour" | "hall" | "table";
export type ShotDef = { id: number; key: string; a: number; b: number; light: Light; crowd: Crowd; set: SetName; local?: boolean; towns?: boolean };
type Row = [key: string, t0: number, crowd: Crowd, set: SetName, light: Light, local?: boolean];
// voice-time cut points; cuts sit in the pauses between lines or on a word
const ROWS: Row[] = [
  ["s1_salute", 0, "sail", "harbour", "day"],          // 1: v2 hook: the gun salute fires on frame 0, low at the waterline
  ["s1_wide", 2.0, "sail", "harbour", "day"],          // 1: "...新战舰首航": out into the harbour, smoke drifting
  ["s1_aerial", 3.13, "sail", "harbour", "day"],       // 1: "开了一千多米，就沉了": low on the river side, she rolls toward the lens
  ["s1_rewind", 5.27, "sail", "harbour", "day"],       // 2: picture runs backwards to the quay
  ["s1_officers", 6.2, "officers", "harbour", "day", true], // 2: "船上的人就知道它会翻"
  ["s2_king", 9.33, "king", "hall", "day"],         // 3: "国王亲自下单：要七十二门大炮"
  ["s2_ports", 12.39, "empty", "harbour", "day"],      // 4: "一层放不下？那就造两层"
  ["s3_a", 14.85, "test", "harbour", "day"],           // 5
  ["s3_b", 18.567, "test", "harbour", "day"],          // 6
  ["s3_c", 21.033, "test", "harbour", "day", true],    // 7
  ["s3_d", 25.0, "launch", "harbour", "day"],          // 8
  ["s3_e", 26.9, "launch", "harbour", "day"],          // 9
  ["s4_glide", 29.0, "sail", "harbour", "day"],        // 10-11: two gusts, no cut between
  ["s4_ports", 34.0, "sail", "harbour", "day"],        // 12: water through the open ports
  ["s4_sink", 36.3, "sail", "harbour", "day"],         // 13: down she goes
  ["s4_hat", 39.6, "empty", "harbour", "day"],         // 13: "约三十人遇难"
  ["s5_toy", 41.65, "toy", "table", "day"],         // 14-15
  ["s5_cut", 47.36, "toy", "table", "day"],         // 16: the ship's cross-section
  ["s5_flip", 52.41, "toy", "table", "day"],        // 17: top-heavy toy falls over
  ["s6_letter", 54.6, "inquiry", "hall", "day"],    // 18
  ["s6_builder", 56.28, "inquiry", "hall", "day"],  // 19
  ["s6_chair", 59.15, "inquiry", "hall", "day"],    // 20
  ["s6_up", 61.64, "inquiry", "hall", "day"],       // 21
  ["s6_promo", 65.02, "inquiry", "hall", "day"],    // 22
  ["s7_end", 69.5, "freeze", "harbour", "day"],        // 23
];
export const SHOTS: ShotDef[] = ROWS.map(([key, t0, crowd, set, light, local], i) => ({
  id: i + 1, key, a: fv(t0), b: i + 1 < ROWS.length ? fv(ROWS[i + 1][1]) : TOTAL, light, crowd, set, local,
  towns: set === "harbour",
}));
export const SH = Object.fromEntries(SHOTS.map((s) => [s.key, s])) as Record<string, ShotDef>;
export const XFADE: Record<number, number> = {};
export const FLASH_AT = -100;
export const BLACK_AT = 72.85; // cut to black after the last word
export const shotAt = (f: number) => SHOTS.find((s) => f >= s.a && f < s.b) ?? SHOTS[SHOTS.length - 1];
export const layersAt = (f: number): { id: number; alpha: number }[] => [{ id: shotAt(f).id, alpha: 1 }];

// ---------------- the ship's pose per shot ----------------
/** S1: sails out, leans on "开了一千多米", rolls over and goes down on "就沉了" */
export const s1Pose = (t: number): Pose => ({
  x: -30 + 2.4 * t, z: -6,
  heel: spl([[0, 0.03], [3.2, 0.05], [3.8, 0.3], [4.3, 0.7], [4.8, 1.3], [5.25, 1.5]], t),
  y: spl([[4.2, 0], [4.7, -1.2], [5.25, -4.5], [5.9, -11]], t),
});
/** S1 salute: the lower river-side guns fire one after another from the bow aft (rank 0 = the bow gun, on frame 0) */
export const SALUTE_DT = 0.16;
/** S1 rewind: the same picture played backwards fast */
export const rewindT = (t: number) => 5.27 - (t - 5.27) * 4.5;
/** S4: first gust leans and recovers, the second keeps going, the lower ports reach the water, she rolls over */
const s4X = (t: number) => -20 + 2 * (Math.min(t, 36) - 29) + 0.5 * Math.max(0, t - 36);
const s4Pose = (t: number): Pose => ({
  x: s4X(t), z: -8,
  heel: spl([[29.0, 0.02], [29.4, 0.03], [30.25, 0.17], [30.7, 0.18], [31.9, 0.04], [32.4, 0.03], [33.3, 0.2], [34.0, 0.24], [36.2, 0.33],
    [37.3, 0.8], [38.3, 1.3], [39.3, 1.52]], t),
  y: spl([[34.0, 0], [36.2, -0.5], [37.2, -1.4], [38.2, -4], [39.4, -14], [40.0, -22]], t),
});
export const GUST1 = 29.25, GUST2 = 32.35;
/** the frozen moment for the last shot: mid-run on the second lap */
export const FREEZE_T = 17.25;
/** voice time the ship and crowd are posed at in shot s (rewind and freeze remap it) */
export const storyT = (s: ShotDef, t: number) => (s.key === "s1_rewind" ? rewindT(t) : s.key === "s7_end" ? FREEZE_T : t);
export const poseAt = (s: ShotDef, t: number): Pose => {
  const k = s.key, tt = storyT(s, t);
  if (k.startsWith("s1_") && k !== "s1_officers") return s1Pose(tt);
  if (k === "s4_glide" || k === "s4_ports" || k === "s4_sink") return s4Pose(tt);
  if (k === "s4_hat") return { ...AT_QUAY, y: -40 };
  if (k.startsWith("s3_") || k === "s7_end") return { ...AT_QUAY, heel: heelAt(tt) };
  return AT_QUAY;
};

// ---------------- camera ----------------
export type Cam = { pos: V3; look: V3; fov: number; roll: number };
type Shot = Partial<Cam> & { pos: V3; look: V3 };
type Key = { f: number; dur?: number; cut?: boolean; s: (f: number) => Shot };
export const glide = (u: number) => { const x = clamp01(u); return x * x * x * (x * (6 * x - 15) + 10); };
const mix = (a: Cam, b: Cam, k: number): Cam => ({
  pos: a.pos.map((v, i) => v + (b.pos[i] - v) * k) as V3, look: a.look.map((v, i) => v + (b.look[i] - v) * k) as V3,
  fov: a.fov + (b.fov - a.fov) * k, roll: a.roll + (b.roll - a.roll) * k,
});
const full = (c: Shot): Cam => ({ fov: 40, roll: 0, ...c });
const run = (keys: Key[], f: number) => {
  let cur = full(keys[0].s(f));
  for (let i = 1; i < keys.length; i++) {
    const k = keys[i];
    if (f < k.f) break;
    cur = k.cut ? full(k.s(f)) : mix(cur, full(k.s(f)), glide((f - k.f) / (k.dur ?? 24)));
  }
  return cur;
};
const pushK = (f: number, f0: number, rate: number, punch = 0, n = 35) => {
  const x = Math.max(0, f - f0);
  let s = rate * x;
  if (punch > rate) for (let i = 0; i < Math.min(x, n); i++) s += (punch - rate) * Math.max(0, Math.min(1, (i + 0.5) / 8, (n - i - 0.5) / 8));
  return Math.exp(-s);
};
const dolly = (pos: V3, look: V3, k: number, rest: Partial<Cam> = {}): Shot =>
  ({ pos: [look[0] + (pos[0] - look[0]) * k, look[1] + (pos[1] - look[1]) * k, look[2] + (pos[2] - look[2]) * k], look, ...rest });

const W = (x: number, y: number, z: number): V3 => [x, y, ZS + z]; // world point given ship-centred z
const F = (t: number) => fv(t);
// ---- S1 ----
// salute: at the waterline off the bow quarter, looking aft along the run-out guns as they fire, tracking the ship
const S1S = (f: number) => { const P = s1Pose(tv(f)); return dolly([P.x + 21, 1.7, P.z + 12.5], [P.x + 1, 3.1, P.z + 5.6], pushK(f, 0, 0.0025), { fov: 40, roll: -0.07 }); };
// wide: high on the river side, astern, tracking the ship; slow push
const S1A = (f: number) => { const t = tv(f), P = s1Pose(Math.min(t, 5.6)); return dolly([P.x - 52, 64, P.z + 74], [P.x + 2, 10, P.z], pushK(f, 0, 0.0012), { fov: 40 }); };
// capsize: low on the river side, abeam; she heels toward +z, so the masts come down toward the lens
const S1L = (f: number) => { const t = tv(f), P = s1Pose(Math.min(t, 5.6)); return dolly([P.x + 5, 30, P.z + 62], [P.x - 1, 15, P.z], pushK(f, F(3.13), 0.002), { fov: 48 }); };
// rewind: the capsize camera at the remapped time
const S1R = (f: number) => S1L(fv(rewindT(tv(f))));
// the captain and the admiral at the quay before the test (ship-local, like S3 C)
const S1O = (f: number) => dolly([-3.0, 7.05, 2.9], [-6.0, 6.85, -2.3], pushK(f, F(6.2), 0.0022), { fov: 36 });
// ---- S2 ---- (hall: back wall z = -6, the king's portrait niche centred at x = 0, y = 2.9)
const S2K = (f: number) => dolly([0.15, 2.85, 2.6], [0, 2.85, -6.3], pushK(f, F(9.33), 0.003, 0.009, 24), { fov: 32 });
// the hull at the quay from the river side, the port rows receding
const S2P = (f: number) => dolly(W(15, 4.0, 15.5), W(-4, 3.5, 5.0), pushK(f, F(12.39), 0.002), { fov: 44 });
// ---- S3 ----
const SA = (f: number) => dolly(W(-24, 20.5, 24), W(-5.0, 7.0, -1.2), pushK(f, F(14.85), 0.0016, 0.0045, 30), { fov: 38 });
const SB = (f: number) => dolly(W(14, 14.5, 10), W(-3.5, 5.8, -1.5), pushK(f, F(18.567), 0.0025), { fov: 50 });
const SC = (f: number) => dolly([-5.35, 7.0, -0.95], [-6.0, 6.95, -3.35], pushK(f, F(21.033), 0.0022), { fov: 34 });
const SD = (f: number) => dolly(W(38, 5.0, 26), W(0, 12.5, 0), pushK(f, F(25.0), 0.0018), { fov: 46 });
const SE0 = (f: number) => dolly([-30, 9.2, -33.8], [2, 7.6, -27], pushK(f, F(26.9), 0.0015), { fov: 44 });
const SE1 = (f: number) => dolly([-28.5, 17, -35], [2, 9.5, -26], pushK(f, F(26.9) + 12, 0.0015), { fov: 44 });
// ---- S4 ----
// the bow quarter, tracking: the lean reads as the masts tipping left in frame
const S4G = (f: number) => { const x = s4X(tv(f)); return dolly([x + 56, 15, 27], [x - 2, 13, -8], pushK(f, F(29.0), 0.0012), { fov: 44 }); };
// low at the hull on the low (+z) side: the open lower ports at the waterline
const S4P = (f: number) => { const x = s4X(tv(f)); return dolly([x + 11, 2.8, -8 + 16.5], [x - 4, 0.9, -8 + 5.4], pushK(f, F(34.0), 0.0025), { fov: 44 }); };
// wide from the far quay: she rolls onto her side and the masts slide under
const S4S = (f: number) => dolly([-27, 12.5, -33.5], [-4, 5.5, -6], pushK(f, F(36.3), 0.0012), { fov: 46 });
// still water, one floating hat
export const HAT: V3 = [-3.4, 0.03, -7.4];
const S4H = (f: number) => dolly([HAT[0] + 1.3, 2.3, HAT[2] + 3.4], [HAT[0], 0.1, HAT[2]], pushK(f, F(39.6), 0.0016), { fov: 40 });
// ---- S5 ---- (table top at y = 0, the toy at the origin)
const S5T = (f: number) => dolly([0.08, 0.125, 0.62], [0.01, 0.075, 0], pushK(f, F(41.65), 0.0012), { fov: 30 });
const S5C = (f: number) => dolly([0.55, 0.42, 0.44], [0.55, 0.13, 0], pushK(f, F(47.36), 0.0012), { fov: 34 });
const S5F = (f: number) => dolly([0.1, 0.12, 0.66], [0.05, 0.07, 0], pushK(f, F(52.41), 0.0015), { fov: 30 });
// ---- S6 ---- (hall: long table along x at z = -2.5)
const S6L = (f: number) => dolly([0, 1.6, 0.9], [0, 1.05, -1.0], pushK(f, F(54.6), 0.003), { fov: 34 });
const S6B0 = (f: number) => dolly([2.9, 1.65, 3.2], [1.5, 1.45, -1.0], pushK(f, F(56.28), 0.002), { fov: 38 });
const S6B1 = (f: number) => dolly([1.4, 2.45, -1.0], [0, 2.85, -6.3], pushK(f, F(57.7), 0.002), { fov: 30 });
const S6C = (f: number) => dolly([-2.0, 1.35, -0.6], [-3.1, 0.85, -3.6], pushK(f, F(59.15), 0.0035), { fov: 36 });
const S6U0 = (f: number) => dolly([0.3, 1.6, 4.6], [0, 1.5, -2.0], pushK(f, F(61.64), 0.0015), { fov: 46 });
const S6U1 = (f: number) => dolly([0.3, 1.5, 4.4], [0, 5.6, -2.6], 1, { fov: 46 });
const S6P = (f: number) => dolly([0, 1.6, 6.3], [0, 1.3, -1.4], pushK(f, F(65.02), 0.0018), { fov: 40 });
// ---- S7 ---- the frozen run, pushing in
const S7 = (f: number) => dolly(W(-15, 15, 15), W(1.0, 6.2, -0.4), pushK(f, F(69.5), 0.0045), { fov: 38 });

const CAMS: Record<string, Key[]> = {
  s1_salute: [{ f: 0, s: S1S }],
  s1_wide: [{ f: SH.s1_wide.a, s: S1A }],
  s1_aerial: [{ f: SH.s1_aerial.a, s: S1L }],
  s1_rewind: [{ f: SH.s1_rewind.a, s: S1R }],
  s1_officers: [{ f: SH.s1_officers.a, s: S1O }],
  s2_king: [{ f: SH.s2_king.a, s: S2K }],
  s2_ports: [{ f: SH.s2_ports.a, s: S2P }],
  s3_a: [{ f: SH.s3_a.a, s: SA }],
  s3_b: [{ f: SH.s3_b.a, s: SB }],
  s3_c: [{ f: SH.s3_c.a, s: SC }],
  s3_d: [{ f: SH.s3_d.a, s: SD }],
  s3_e: [{ f: SH.s3_e.a, s: SE0 }, { f: SH.s3_e.a + 12, dur: 60, s: SE1 }],
  s4_glide: [{ f: SH.s4_glide.a, s: S4G }],
  s4_ports: [{ f: SH.s4_ports.a, s: S4P }],
  s4_sink: [{ f: SH.s4_sink.a, s: S4S }],
  s4_hat: [{ f: SH.s4_hat.a, s: S4H }],
  s5_toy: [{ f: SH.s5_toy.a, s: S5T }],
  s5_cut: [{ f: SH.s5_cut.a, s: S5C }],
  s5_flip: [{ f: SH.s5_flip.a, s: S5F }],
  s6_letter: [{ f: SH.s6_letter.a, s: S6L }],
  s6_builder: [{ f: SH.s6_builder.a, s: S6B0 }, { f: F(57.7), dur: 9, s: S6B1 }],
  s6_chair: [{ f: SH.s6_chair.a, s: S6C }],
  s6_up: [{ f: SH.s6_up.a, s: S6U0 }, { f: F(63.1), dur: 40, s: S6U1 }],
  s6_promo: [{ f: SH.s6_promo.a, s: S6P }],
  s7_end: [{ f: SH.s7_end.a, s: S7 }],
};

// impact kicks: the worst roll and the cannon that slides into the rail
const KICKS: [number, number][] = [[0, 0.7], [0.32, 0.35], [0.64, 0.3], [4.75, 0.8], [20.35, 0.9], [20.55, 0.6], [38.3, 0.5], [53.97, 0.7]];
export const kickAt = (t: number) => {
  let a = 0;
  for (const [t0, g] of KICKS) {
    const n = Math.floor((t - t0) * FPS + 1e-6);
    if (n >= 0 && n < 7) a += g * (n % 2 ? -1 : 1) * (1 - n / 7) ** 1.5;
  }
  return a;
};
export const camAt = (id: number, f: number): Cam => {
  const c = run(CAMS[SHOTS[id - 1].key], f), a = SHOTS[id - 1].key === "s1_rewind" ? 0 : kickAt(tv(f));
  if (!a) return c;
  const d: V3 = [c.look[0] - c.pos[0], c.look[1] - c.pos[1], c.look[2] - c.pos[2]];
  const L = Math.hypot(...d), h = Math.hypot(d[0], d[2]) || 1;
  const m = (3 / 640) * Math.tan((c.fov * Math.PI) / 360) * L * a;
  return { ...c, look: [c.look[0] - (d[2] / h) * m, c.look[1] + 0.6 * m, c.look[2] + (d[0] / h) * m], roll: c.roll + a * 0.004 };
};
export const keyEnd = (id: number, f: number) => {
  let e = 0;
  for (const k of CAMS[SHOTS[id - 1].key]) if (f >= k.f) e = k.f + (k.cut ? 0 : k.dur ?? 24);
  return Math.max(f, e);
};

// ---------------- lens ----------------
export type Dof = { cInf: number; focus?: (f: number) => V3 };
const DOFS: Record<string, Dof> = {
  s1_salute: { cInf: 3 }, s1_officers: { cInf: 12 }, s2_king: { cInf: 10 }, s2_ports: { cInf: 3 }, s3_b: { cInf: 2 }, s3_c: { cInf: 13 }, s3_e: { cInf: 2.5 },
  s4_ports: { cInf: 4 }, s4_hat: { cInf: 8 }, s5_toy: { cInf: 16 }, s5_cut: { cInf: 6 }, s5_flip: { cInf: 16 },
  s6_letter: { cInf: 12 }, s6_builder: { cInf: 6 }, s6_chair: { cInf: 12 }, s6_up: { cInf: 3 }, s6_promo: { cInf: 6 }, s7_end: { cInf: 2 },
};
export const dofAt = (f: number) => DOFS[shotAt(f).key] ?? { cInf: 0 };
export type Fg = { a: number; b: number; kit: string; pos: V3; s?: number; yaw?: number };
export const FOREGROUND: Fg[] = [];
