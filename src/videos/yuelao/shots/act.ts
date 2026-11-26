// THE ACTING of 采访月老的一天: who each character IS, written once, and one call that plays a figure for a frame.
// The series rules it carries (day-in-life-film, "Acting" and "The lead"):
//   - a face never swaps cold: every change is an EVENT with its cover (a blink, a take, a sink; a hard cut only when
//     asked). mood() does for this film's MIXED faces (people.ts FACES: eyes of one drawing, mouth of another) what the
//     rig's rigMood does for plain expressions, frame for frame the same patterns;
//   - personality is behaviour repeated: a PROFILE per character (resting face, blink tempo, where the eyes live, how
//     much the head moves with words, posture, how hard a change hits) that act() reads on every frame;
//   - a spoken line has a before (the eyes go to the listener and the head lifts 5 frames ahead), a during (the mouth
//     and head accents of the rig's speak) and an after (the shot's next face key comes 8 to 12 frames after the last
//     word: after());
//   - a body is held up by something: act({ seat }) sits the figure on real furniture (rig/seats.ts seatOn) and tells
//     the robe about the seat (garb.setSeat), so the cloth lies over the lap instead of swallowing the stool.
// Pure functions of the frame.
import type * as THREE from "three";
import { rigHeadAccent, rigHeadAdd, type Rig, type RigFace, type RigHead, type RigMoodHow, type RigPose, type RigSeat, type RigState } from "../../group/kit/rig3d";
import type { Expr } from "../../group/kit/toon";
import { hash } from "../../group/story";
import { setSeat } from "../../../kit/acc/garb";
import type { Seat } from "../../../kit/day/verbs";
import { FPS, line, type Speaker } from "../story";
import { FACES, YUELAO, XIAOMAN, MA, XIANGQIN, RIDER, type Person } from "../people";
import type { World } from "../world";
import { VERBS, V, rel, hang, saying, speak, smooth, clamp01, wordAt } from "./kit";

// ------------------------------------------------------------------------------------------------------- profiles
export type Profile = {
  person: Person; id: number; who?: Speaker;
  /** the face at rest (people.ts FACES) */
  rest: string;
  /** blink tempo: 1 = the rig's; below 1 = slow, heavy lids; above 1 = quick */
  blinkK: number;
  /** 0 = the eyes stay where they are put .. 1 = they dart about */
  restless: number;
  /** how much the head moves with the words */
  talkHead: number;
  /** how hard a change of face hits the head (the dip, the pop, the jolt) */
  amp: number;
  /** the resting posture, degrees (pitch + = forward) */
  lean?: { pitch?: number; roll?: number };
  /** things in the hands that stay put away unless a shot shows them (act({ show })) */
  hide?: string[];
};
/** 月老: small, quick, fussy; a worried smile at rest, eyes that dart, a head that bobs with every word, a slight stoop */
export const YL: Profile = { person: YUELAO, id: 1, who: "yl", rest: "worry", blinkK: 1.2, restless: 0.75, talkHead: 1.2, amp: 1, lean: { pitch: 3 }, hide: ["finger", "pen"] };
/** 林小满: flat and tired; slow lids, eyes on her screen, almost no head with her words, a slouch */
export const XM: Profile = { person: XIAOMAN, id: 2, who: "xm", rest: "flat", blinkK: 0.62, restless: 0.08, talkHead: 0.4, amp: 0.5, lean: { pitch: 5 }, hide: ["phone"] };
/** 小满妈: loud, pleading */
export const MAMA: Profile = { person: MA, id: 3, who: "ma", rest: "plead", blinkK: 1, restless: 0.2, talkHead: 1.3, amp: 1 };
/** 相亲男: upright, polite, a clerk's small nods */
export const XQ: Profile = { person: XIANGQIN, id: 4, who: "xq", rest: "polite", blinkK: 0.9, restless: 0.25, talkHead: 0.6, amp: 0.6, lean: { pitch: -3 }, hide: ["phone"] };
/** 骑手: young, kind, a little shy; bouncy */
export const QS: Profile = { person: RIDER, id: 5, who: "qs", rest: "smile", blinkK: 1.1, restless: 0.45, talkHead: 1, amp: 0.9 };

// ---------------------------------------------------------------------------------------------------------- faces
const keyed = (f: number, keys: [number, number][]) => {
  if (f <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) if (f <= keys[i][0]) { const [f0, v0] = keys[i - 1], [f1, v1] = keys[i]; return v0 + ((v1 - v0) * (f - f0)) / (f1 - f0); }
  return keys[keys.length - 1][1];
};
/** a face by name as its parts (a plain expression's name = all its parts) */
export const F = (n: string): RigFace => {
  const e = (FACES as Record<string, Expr | RigFace>)[n] ?? (n as Expr);
  return typeof e === "string" ? { eyes: e, mouth: e, brows: e, marks: e } : { marks: e.mouth, ...e };
};
const same = (a: RigFace) => (a.eyes === a.mouth && a.mouth === a.brows && (a.marks ?? a.mouth) === a.eyes ? (a.eyes as Expr) : a);
const TAKE = new Set(["shock", "aghast", "rage"]), QUIET_EYES = new Set(["sad", "deadpan", "sleep", "doze", "gloom", "sigh"]), QUIET_MOUTH = new Set(["neutral", "sigh", "sad", "deadpan", "sleep", "gloom", "nervous"]);
/** how a face changes into `to` when the shot does not say: alarm = a take; a face that goes quiet = a sink; else a blink */
const howOf = (from: RigFace, to: RigFace): RigMoodHow =>
  TAKE.has(to.eyes) || TAKE.has(to.mouth) ? "take" : QUIET_EYES.has(to.eyes) && QUIET_MOUTH.has(to.mouth) && !(QUIET_EYES.has(from.eyes) && QUIET_MOUTH.has(from.mouth)) ? "sink" : "blink";
/** one entry of a face track: from frame `at` on the face is `name`; how = the cover of the change; amp = its head part */
export type MoodKey = [at: number, name: string, how?: RigMoodHow, amp?: number];
/** A FACE OVER TIME with every change acted out. keys = what the face is from when on (the first holds from the
 *  start); `at` = the frame the new face is THERE (put it on the word that causes it): its cover comes before. */
export const mood = (f: number, keys: MoodKey[], amp = 1): { expr: Expr | RigFace; blink?: number; head?: RigHead } => {
  const ks = [...keys].sort((a, b) => a[0] - b[0]);
  let cur = ks[0][1];
  for (const k of ks) if (f >= k[0]) cur = k[1];
  const out: { expr: Expr | RigFace; blink?: number; head?: RigHead } = { expr: same(F(cur)) }, hs: (RigHead | undefined)[] = [];
  for (let j = 1; j < ks.length; j++) {
    const [at, to, how0, amp0] = ks[j], from = ks[j - 1][1];
    if (from === to) continue;
    const A = F(from), B = F(to), how = how0 ?? howOf(A, B);
    if (how === "cut") continue;
    const d = f - at, a = (amp0 ?? 1) * amp;
    if (d < -6 || d > 20) continue;
    let seq: [RigFace, number][], d0: number, dm: number, bk: [number, number][];
    if (how === "blink") {
      d0 = -3; dm = -1; seq = [[A, 0.5], [A, 1], [B, 1]];
      bk = [[-4, 0], [-3, 0.15], [-2, 0.4], [-1, 0.75], [0, 1.15], [1, 1.06], [2, 1]];
      if (d >= -4 && d <= 6) hs.push({ dy: a * keyed(d, [[-4, 0], [-3, -0.03], [-2, -0.06], [-1, -0.06], [0, 0.03], [2, 0.02], [5, 0]]), squash: a * keyed(d, [[-4, 0], [-2, 0.05], [-1, 0.05], [0, -0.02], [3, 0]]) }, rigHeadAccent("pop", d / FPS, { amp: 0.8 * a }, FPS));
    } else if (how === "take") {
      d0 = -2; dm = 0; seq = [[A, 0.5], [A, 1]];
      bk = [[-3, 0], [-2, 0.2], [-1, 0.4], [0, 1.3], [1, 1.2], [2, 1.08], [4, 1]];
      if (d >= -3 && d < 0) hs.push({ dy: -a * keyed(d, [[-3, 0], [-2, 0.04], [-1, 0.06]]), squash: a * keyed(d, [[-3, 0], [-2, 0.05], [-1, 0.07]]) });
      hs.push(rigHeadAccent("jolt", d / FPS, { amp: a }, FPS), rigHeadAccent("pop", d / FPS, { amp: 0.6 * a }, FPS));
    } else {
      d0 = -4; dm = 0; seq = [[A, 0.5], [A, 0.5], [A, 1], [A, 1], [B, 1], [B, 1], [B, 0.5], [B, 0.5]];
      bk = [[-4, 0], [-2, 0.12], [0, 0.45], [2, 0.82], [4, 0.97], [5, 1]];
      if (d >= -4 && d <= 18) hs.push({ dy: -a * keyed(d, [[-4, 0], [0, 0.05], [4, 0.08], [10, 0.06], [18, 0]]) });
    }
    const dEnd = Math.max(bk[bk.length - 1][0], d0 + seq.length);
    if (d < Math.min(d0, bk[0][0] + 1) || d > dEnd + 2) continue;
    const eye: [RigFace, number] = d >= d0 && d < d0 + seq.length ? seq[d - d0] : [d < d0 ? A : B, 0];
    const lower = d < dm ? A : B;
    if (d < dEnd) out.expr = { eyes: eye[0].eyes, mouth: lower.mouth, brows: A.brows, browsTo: B.brows, k: Math.round(keyed(d, bk) * 100) / 100, marks: lower.marks };
    if (d >= d0) out.blink = eye[1];
  }
  out.head = rigHeadAdd(...hs);
  return out;
};
/** the frame a line's last word ends plus a hold: where the NEXT face may begin (the last face holds 8 to 12 frames) */
export const after = (id: string, hold = 10) => line(id).to + hold;
/** the frame a word of a line starts (a face lands ON the word that causes it) */
export const on = (id: string, word: string, d = 0) => wordAt(id, word) + d;

// ------------------------------------------------------------------------------------------------------------ life
const GAZES = [0, 0, 0.5, 0, -0.5, 0, 1, -1];
/** where restless eyes are at time t: a quiet character's stay ahead; a nervous one's change about once a second */
const wander = (t: number, p: Profile) => {
  if (p.restless <= 0.05) return 0;
  const step = Math.floor(t * (0.3 + 1.2 * p.restless) + hash(p.id, 7) * 5);
  return GAZES[Math.floor(hash(step, p.id + 3) * (p.restless > 0.6 ? 8 : 6))];
};
const scaleHead = (h: RigHead | undefined, k: number): RigHead | undefined =>
  h && { dx: (h.dx ?? 0) * k, dy: (h.dy ?? 0) * k, tilt: (h.tilt ?? 0) * k, scale: 1 + ((h.scale ?? 1) - 1) * k, squash: (h.squash ?? 0) * k };
/** the screen side of a world point seen from a figure standing at `at`: a gaze value (-1 .. 1 in half steps) that
 *  turns the eyes toward it. Needs the camera set. */
export const gazeTo = (w: World, at: THREE.Vector3, to: THREE.Vector3, far = 1): number => {
  const a = w.project(at.clone().add(V(0, 1.05, 0))), b = w.project(to), dx = b.x - a.x;
  return Math.abs(dx) < 60 ? 0 : Math.sign(dx) * (Math.abs(dx) > 420 ? far : 0.5);
};

// ------------------------------------------------------------------------------------------------------ one figure
export type ActO = {
  at: THREE.Vector3; facing: number;
  /** the face: a name held, or a track (mood). Default: the profile's resting face */
  faces?: string | MoodKey[];
  /** the body's pose (default: standing, breathing) */
  pose?: RigPose;
  /** sitting on real furniture (rig/seats.ts seatOn). rise 0..1 = getting up from it */
  seat?: Seat & RigSeat; rise?: number;
  hands?: RigState["hands"]; turn?: number; twist?: number; lookDown?: number; head?: RigHead; lean?: { pitch?: number; roll?: number };
  /** where the eyes are (screen, -1 .. 1). Default: they wander by the profile, and go to the lens while speaking */
  gaze?: number;
  /** the gaze while speaking when not the lens (talking to someone beside the camera, or down at a thing) */
  talkGaze?: number;
  /** things of the profile's `hide` that this frame shows (the phone in her hand, his raised finger) */
  show?: string[];
  armFront?: RigState["armFront"]; headFront?: number;
  /** the quiet scene: the head keeps almost still under the words */
  still?: boolean;
  /** which syllables of the line being said hit hardest (0-based) */
  stress?: number[];
  /** lip sync from another speaker's lines (a figure that voices someone else: never used) or none (false) */
  talk?: boolean;
  more?: Partial<RigState>;
  key?: string;
};
/** ONE FIGURE FOR ONE FRAME: where it is, how it holds itself, its face with its changes, its words, its life. */
export function act(w: World, f: number, p: Profile, a: ActO): Rig {
  const t = f / FPS, r = w.actor(p.person, a.key ?? "");
  const st: Partial<RigState> = { at: a.at.clone(), facing: a.facing, pose: a.pose ?? { kind: "idle", t: t + 0.41 * p.id }, visible: true };
  if (a.seat) {
    const k = clamp01(a.rise ?? 0);
    Object.assign(st, VERBS.seated(a.seat, t, { rise: k, hipY: r.dim.hipY, scale: p.person.scale ?? 1 }));
    if (a.pose) st.pose = a.pose;
    setSeat(r, a.seat, a.seat.facing);
  } else setSeat(r, null);
  // the face and its changes
  const m = a.faces === undefined ? { expr: same(F(p.rest)) } as ReturnType<typeof mood> : typeof a.faces === "string" ? { expr: same(F(a.faces)) } as ReturnType<typeof mood> : mood(f, a.faces, p.amp);
  st.expr = m.expr as RigState["expr"];
  let blink = VERBS.lid(t * p.blinkK, p.id), gaze = a.gaze ?? wander(t, p), talkHead: RigHead | undefined, ready: RigHead | undefined;
  // the words
  const q = a.talk !== false && p.who ? saying(p.who, f) : null;
  if (q) {
    const s = speak(q, f, p.id, a.stress);
    if (s.mouth) st.mouth = s.mouth;
    if (s.blink !== undefined) blink = s.blink;
    talkHead = scaleHead(s.head, a.still ? 0.3 : p.talkHead);
    // before the line: the eyes go to the listener and the head lifts a little
    if (f >= q.from - 5 && f <= q.to + 8) gaze = a.talkGaze ?? (a.gaze !== undefined ? a.gaze : 0);
    const up = Math.min(smooth((f - (q.from - 6)) / 5), 1 - smooth((f - q.from) / 6));
    if (up > 0.01 && !a.still) ready = { dy: 0.035 * up };
  }
  if (m.blink !== undefined) blink = m.blink;
  st.blink = blink; st.gaze = gaze;
  const head = rigHeadAdd(m.head, talkHead, ready, a.head);
  if (head) st.head = head;
  const pitch = (p.lean?.pitch ?? 0) + (a.lean?.pitch ?? 0), roll = (p.lean?.roll ?? 0) + (a.lean?.roll ?? 0);
  if (pitch || roll) st.lean = { pitch, roll };
  if (a.hands) { st.hands = a.hands; if (!a.pose && !a.seat) st.pose = { kind: "hold", t }; }
  if (a.turn !== undefined) st.turn = a.turn;
  if (a.twist !== undefined) st.twist = a.twist;
  if (a.lookDown !== undefined) st.lookDown = a.lookDown;
  const hide = (p.hide ?? []).filter((n) => !(a.show ?? []).includes(n));
  if (hide.length) st.hide = hide;
  if (a.armFront) st.armFront = a.armFront;
  if (a.headFront !== undefined) st.headFront = a.headFront;
  if (a.more) Object.assign(st, a.more);
  r.set(st);
  return r;
}

// ------------------------------------------------------------------------------------------------------- his tics
type Hands = [THREE.Vector3 | null, THREE.Vector3 | null];
/** HE STROKES HIS BEARD when he is pleased with himself: the right hand comes up beside the beard and draws down it,
 *  slowly, again and again. k 0..1 brings the hand up from his side. */
export const stroke = (at: THREE.Vector3, facing: number, f: number, k: number): Hands | undefined => {
  if (k <= 0.01) return undefined;
  const u = (f % 38) / 38, down = u < 0.62 ? smooth(u / 0.62) : 1 - smooth((u - 0.62) / 0.38);
  const p = rel(at, facing, -0.085, 0.79 - 0.13 * down, 0.215);
  return [hang(at, facing, 0).lerp(p, smooth(k)), null];
};
/** HE WRINGS HIS HANDS when he is worried: both hands together in front of the belly, turning over one another */
export const wring = (at: THREE.Vector3, facing: number, f: number, k: number, y = 0.66): Hands | undefined => {
  if (k <= 0.01) return undefined;
  const a = f * 0.42, e = smooth(k);
  return [hang(at, facing, 0).lerp(rel(at, facing, -0.045 + 0.012 * Math.cos(a), y + 0.014 * Math.sin(a), 0.215), e), hang(at, facing, 1).lerp(rel(at, facing, 0.045 - 0.012 * Math.cos(a), y - 0.014 * Math.sin(a), 0.215), e)];
};
/** both hands thrown up beside the head (alarm, joy): staged for the camera so they never cross the face */
export const flail = (w: World, at: THREE.Vector3, facing: number, f: number, k: number, spread = 0.33, y = 1.06): Hands | undefined => {
  if (k <= 0.01) return undefined;
  const e = smooth(k), sh = 0.02 * Math.sin(f * 1.6);
  return [hang(at, facing, 0).lerp(VERBS.staged(w, at, -spread, y + sh, 0.06), e), hang(at, facing, 1).lerp(VERBS.staged(w, at, spread, y - sh, 0.06), e)];
};
/** one hand out, palm up (offering, explaining): arm 0 = his right */
export const offer = (at: THREE.Vector3, facing: number, k: number, arm: 0 | 1 = 0, y = 0.8, z = 0.3, x = 0.2): Hands | undefined => {
  if (k <= 0.01) return undefined;
  const p = hang(at, facing, arm).lerp(rel(at, facing, arm ? x : -x, y, z), smooth(k));
  return arm ? [null, p] : [p, null];
};
