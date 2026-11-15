// drunk.ts: 李白 NEVER STANDS STILL. Jay, 15 Nov: "What happened to his being drunk and aren't able to stay still,
// swaying, etc., typical of a drunk." The personality profile's sway (pose-clipping persona_test.ts: 5 degrees at
// 0.28 Hz, the head carried tipped, a hiccup now and then) was never put into the film; this puts it on every frame of
// his, whatever the segment does, as a layer over the segment's own lean and head (world.ts installs it on his rigs):
//   the body   rolls side to side (a slow sway with a quicker wobble on it) and rocks a little forward and back
//   the head   tipped to one side, lagging the body's sway (it flops), and a hiccup's jolt at a few chosen moments
// How drunk, scene by scene (K): asleep at dawn only a little (breathing); awake in the morning and at the tavern door
// fully; on the terrace, soaked from the bucket, less; at the gate less until the gold makes him giddy; at the evening
// tavern fully; under the night tree softer and slower (the quiet scene).
// The layer is added for the solve only and taken off again (the state the segment set is left as it was), so it is
// the same however many times a frame is solved.
import { SEGMENTS, FPS, lineId } from "./story";
import { BEAT } from "./beats";
import { rigHeadAdd, rigHeadAccent, type Rig, type RigState } from "../group/kit/rig3d";

const segOf = (f: number) => SEGMENTS.find((s) => f >= s.from && f <= s.to)?.id ?? "A";
/** how drunk he shows on picture frame f, 0..1, and how fast he sways (1 = his own tempo) */
export const drunkK = (f: number): { k: number; tempo: number } => {
  switch (segOf(f)) {
    case "A": return { k: f < BEAT.A.wake ? 0.3 : 1, tempo: 1 };
    case "B": return { k: 1, tempo: 1 };
    case "C": return { k: 0.5, tempo: 0.9 };
    case "D": return { k: f < lineId("D25").from ? 0.45 : 0.9, tempo: 1 };
    case "E": return { k: 1, tempo: 1.05 };
    default: return { k: 0.6, tempo: 0.75 };
  }
};
/** HIS HICCUPS, placed by hand, each one the full stop of a joke (Jay, 15 Nov: "it should be correctly timed for
 *  humorous effect instead of doing on a loop"; before, one fell every 6-9 s). None in the night scene. */
const HICCUPS: number[] = [
  lineId("A06").to + 5,    // 早上喝的，叫早酒。 hic
  lineId("B17").to + 7,    // 好，走！ on his feet at last, swaying: hic, and down he goes
  lineId("C21").to + 17,   // 帮我脱一下。 the terrace has gone dead silent: hic
  lineId("E31").to + 1,    // 日日醉如泥。 hic
];
const TAU = Math.PI * 2;
/** the layer on picture frame f: degrees to add to his lean, and a head layer */
export const drunkLayer = (f: number): { pitch: number; roll: number; head: ReturnType<typeof rigHeadAdd> } | null => {
  const { k, tempo } = drunkK(f);
  if (k <= 0) return null;
  const t = (f / FPS) * tempo;
  const roll = k * (6 * Math.sin(TAU * 0.27 * t) + 1.6 * Math.sin(TAU * 0.71 * t + 1.3));
  let pitch = k * 2.2 * Math.sin(TAU * 0.43 * t + 0.7);
  const hs = [{ tilt: k * (4 - 4.5 * Math.sin(TAU * 0.27 * t - 0.7)), dy: -0.02 * k }];
  for (const h of HICCUPS) {
    if (f < h || f >= h + 9) continue;
    const a = rigHeadAccent("jolt", (f - h) / FPS, { amp: 1.1 * Math.max(0.6, k) });
    if (a) hs.push(a as never);
    pitch -= 3 * Math.sin((Math.PI * (f - h)) / 9) * Math.max(0.6, k);
  }
  return { pitch, roll, head: rigHeadAdd(...hs) };
};
/** his hiccups' frames (sound_events.ts gives each a small hic) */
export const HICCUP_FRAMES = HICCUPS;

type Inner = { _update: (cam: unknown) => void };
type Lean = { pitch?: number; roll?: number };
/** Puts the layer on one of his rigs: around every solve, his lean (the segment's own, else his resting posture) and
 *  head get the layer, then are put back. frame() = the picture frame being posed. Lying, asleep on the table, being
 *  carried: a segment that wants him still sets `steady` in the state's userData-like slot (st.drunk === false). */
export const installDrunk = (r: Rig, rest: Lean, frame: () => number) => {
  const rr = r as unknown as Inner, up = rr._update.bind(r);
  rr._update = (cam) => {
    const st = r.state as RigState & { lean?: Lean; drunk?: boolean };
    const L = st.visible === false || st.drunk === false ? null : drunkLayer(frame());
    if (!L) { up(cam); return; }
    const lean0 = st.lean, head0 = st.head, base = lean0 ?? rest;
    st.lean = { pitch: (base.pitch ?? 0) + L.pitch, roll: (base.roll ?? 0) + L.roll };
    st.head = rigHeadAdd(head0, L.head);
    try { up(cam); } finally { st.lean = lean0; st.head = head0; }
  };
};
