// SEGMENT E · 傍晚 · his room, slanting gold evening light (PLAN 7 E; script scene 5, lines 29-35 = E01-E07). WP5-E.
// The camera moves only because people move (her eyes at 1.6 m); every frame is a pure function of f; every time comes
// from line() / capWord() / BEAT / the mix's anchors (sound/SYNC_POINTS.md: the fork clinks at E02 end + 0.25 s and
// + 1.25 s, the chewing at + 0.55 s, the quill again from E02 end + 2.0 s; the fly buzzes until E01's end).
//   E1  THE PLATE (the day's clock, third tick): close on the window table in the gold light, the dinner cold and
//       untouched (the cover where Humphrey left it at the table's right end), a FLY walking across the chop. She bends
//       in until the fly is big in the frame (it walks, stops, walks on). 29 「您今天一口都没吃！」 over it.
//   E2  On 「没吃！」 she straightens up and turns to him: NEWTON standing at his desk reading a page. He looks up,
//       genuinely surprised: 30 "Have I not?", and is already on his way to the table, the page still in his left hand;
//       she steps back out of his way (the mic comes in toward him). At the table he takes the fork and, standing, eyes on
//       the page, takes a bite (the clink; the morsel on the tines up to his lips), chews, a second bite (the clink),
//       lays the fork down and goes back to the desk.
//   E3  She steps in and bends over the plate: two bites gone (the mic tips toward it).
//   E4  She turns and walks to the desk asking 31 「您是不是……没什么朋友？」; he is writing again (the quill). 32
//       "Friends interrupt.": he stops the quill and lifts his head; on "interrupt" his eyes go pointedly to her mic and
//       stay there. 33 「那讨厌的人呢？」 (he is back at his page); 34 "Hooke.": his head snaps up, instant: still deadpan
//       (never seemingly angry; the relish is in the timing, the voice and her 秒答), the "oo" an O mouth, no teeth.
//   E5  ASIDE 35 「秒答。胡克定律那个胡克。」: the mic swings round to the lens, Newton soft behind it, writing.
import * as THREE from "three";
import { SEGMENTS, line, capWord, FPS, clamp01, lerp, smooth, easeOutCubic, easeInOutCubic, type Segment, type CamPose, type Pose } from "../story";
import { BEAT } from "../beats";
import * as C from "../cam";
import { NEWTON, NEWTON_HIDE } from "../people";
import { RMX, ROOM, ROOM_SET, EYE } from "../layout";
import { flyAt } from "../props";
import { lid, speak, saying, accent, heads, headPop, at, ky, swaps, walkAlong, walkTime, yawTo, lerpA, rel, asideK, CHAIR_ASIDE, type Rig, type RigPose } from "./common";
import { V, sec, frameOn, mixCam, stride, lagged, aimThrough, nibAt, quillFist, QROT, pagePut, forkRot, FORK_TIP, posOf, putMorsel, morselOff } from "./segE_parts";
import type { World } from "../world";

const S = SEGMENTS[4];
const L1 = line("E01"), L2 = line("E02"), L3 = line("E03"), L4 = line("E04"), L5 = line("E05"), L6 = line("E06"), L7 = line("E07");

// ---------------------------------------------------------------------------------------------------- the beats
/** the push-in: from the scene's first frame until she starts to scold (the fly big in the frame) */
const T_PUSH1 = L1.from + sec(0.3);
/** on 「没吃！」 she straightens up and turns to him */
const T_SWING0 = capWord("E01", "没").from - sec(0.25), T_SWING1 = L1.to;
/** he looks up from his page (on 吃) */
const T_LOOKUP = capWord("E01", "吃").from;
/** the fly leaves the plate (its buzz fades out at E01's end) */
const T_FLYOFF = L1.to + sec(0.3);
/** "Have I not?": he sets off for the table as he says it (BEAT.E.step) */
const T_WALK0 = BEAT.E.step - 6;
/** THE TWO BITES on the mix's fork clinks (E02 end + 0.25 s and + 1.25 s); the chewing from + 0.55 s */
const T_CLINK1 = L2.to + sec(0.25), T_CLINK2 = L2.to + sec(1.25), T_CHEW = L2.to + sec(0.55);
/** the second bite's chewing starts as the fork reaches his mouth again */
const T_CHEW2 = T_CLINK2 + 8;
/** he reaches the table, takes up the fork */
const T_ARRIVE = T_CLINK1 - 12, T_GRAB = T_ARRIVE + 4;
/** the fork goes back down where it lay, he lets go and goes back to his desk */
const T_DOWN = T_CLINK2 + 14, T_GO = T_DOWN + 1;
/** she steps in and bends over the plate: two bites gone (BEAT.E.twoBites) */
const T_PLATE0 = Math.min(BEAT.E.twoBites + 1, T_DOWN - 4), T_PLATE1 = T_PLATE0 + 28;
/** she turns to the desk and walks over, asking 31 (the bitten chop held clean under the start of 31 first; she is at
 *  the desk as 31 ends, before 32) */
const T_TURN0 = Math.max(L3.from + sec(0.85), T_PLATE1 + 6), T_DESK1 = L3.to + 1;
/** 32: he stops the quill and lifts his head; on "interrupt" his eyes go to her mic; back to the page during 33 */
const T_UP0 = L4.from + sec(0.25), T_LOOK = capWord("E04", "interrupt").from, T_DOWN1 = capWord("E05", "讨").from;
/** 34 "Hooke.": the head snaps up on the word, back down as her aside starts */
const T_HOOKE = capWord("E06", "Hooke").from, T_DOWN2 = L7.from + 2;

// ---------------------------------------------------------------------------------------------------- the marks
const T = ROOM_SET.table, TT = ROOM.tableTop;
const P = (x: number, z: number, y = 0) => V(RMX + x, y, z);
/** the plate as segments B and C leave it: turned as Humphrey set it, the cover dome up at the table's right end */
const PLATE_ROT = yawTo(P(T.x + 0.23, T.z + 0.44), ROOM.plate);
const LID_DOWN = V(RMX + T.x + 0.29, TT + 0.002, T.z + 0.07);
const rotY = (p: THREE.Vector3, a: number) => V(p.x * Math.cos(a) + p.z * Math.sin(a), p.y, -p.x * Math.sin(a) + p.z * Math.cos(a));
/** a point on the plate (its own frame) in the world */
const onPlate = (x: number, y: number, z: number) => ROOM.plate.clone().add(rotY(V(x, y, z), PLATE_ROT));
/** the chop's top, where the fork goes in (two spots, one per bite) */
const CHOP1 = onPlate(-0.03, 0.036, -0.012), CHOP2 = onPlate(-0.012, 0.036, -0.026);
/** THE FLY: its place on its walk (it walks, stops, walks on, toward the near rim) and its point in the world */
const flyU = (f: number) => ky(f, [[S.from, 0.1], [S.from + sec(0.9), 0.2], [S.from + sec(1.5), 0.2], [S.from + sec(2.5), 0.29], [S.from + sec(3.0), 0.29], [L1.to, 0.36]]);
const flyPos = (f: number) => { const F = flyAt(flyU(f)); return ROOM.plate.clone().add(rotY(F.p, PLATE_ROT)).add(V(0, 0.006, 0)); };
/** the fork where it lies (on the cloth in front of the plate, tines to the left) and its hilt */
const FORK_HILT = P(T.x + 0.11, T.z + 0.225, TT + 0.0085);
const FORK_REST = forkRot(V(-1, 0, 0));
/** his fist sits this much above the fork's hilt when it picks it up or lays it down (the ball hand on the cloth) */
const GRAB_UP = 0.017;
/** THE MORSEL on the tines: from just after each stab (the notch appears) until it is in his mouth (the chew starts) */
const morselOn = (f: number) => (f > T_CLINK1 && f < T_CHEW) || (f > T_CLINK2 && f < T_CHEW2);

/** NEWTON: at his desk (reading, then writing), and where he stands to eat (in front of the table, right of the plate,
 *  turned toward her) */
const ND = ROOM.newtonDesk, N_EAT = P(-0.95, -1.77), F_EAT = -0.72;
const N_EYE = 1.14;
const eyesOf = (p: THREE.Vector3, e = N_EYE) => p.clone().add(V(0, e, 0));
/** his way round: behind the desk's tall left pile (the head is wide), then in front of the table's right end */
const PATH_TO = [ND, P(0.32, -2.2), P(-0.3, -2.02), P(-0.72, -1.73), N_EAT], PATH_BACK = [...PATH_TO].reverse();
const SPEED_TO = walkTime(PATH_TO, 1) / ((T_ARRIVE - T_WALK0) / FPS);
const SPEED_BACK = 1.7;
const T_DESK = T_GO + Math.round(walkTime(PATH_BACK, SPEED_BACK) * FPS);

type NState = { at: THREE.Vector3; facing: number; pose: RigPose; moving: boolean; where: "desk" | "walk" | "table" };
const newtonAt = (f: number): NState => {
  const t = f / FPS;
  if (f < T_WALK0) return { at: ND.clone(), facing: ROOM.deskFacing, pose: { kind: "idle", t: t + 1.7 }, moving: false, where: "desk" };
  if (f < T_ARRIVE) {
    const g = walkAlong(PATH_TO, SPEED_TO, (f - T_WALK0) / FPS, { startFacing: 0, endFacing: F_EAT });
    return { at: g.at, facing: lerpA(0, g.facing, smooth(clamp01((f - T_WALK0) / 7))), pose: g.pose, moving: g.moving, where: "walk" };
  }
  if (f < T_GO) { const k = smooth(clamp01((f - T_ARRIVE) / 6)); return { at: N_EAT.clone(), facing: lerpA(yawTo(PATH_TO[3], N_EAT), F_EAT, k), pose: { kind: "idle", t: t + 0.6 }, moving: false, where: "table" }; }
  if (f < T_DESK) {
    const g = walkAlong(PATH_BACK, SPEED_BACK, (f - T_GO) / FPS, { startFacing: F_EAT, endFacing: 0 });
    return { at: g.at, facing: lerpA(F_EAT, g.facing, smooth(clamp01((f - T_GO) / 7))), pose: g.pose, moving: g.moving, where: "walk" };
  }
  const k = smooth(clamp01((f - T_DESK) / 6));
  return { at: ND.clone(), facing: lerpA(yawTo(PATH_TO[1], ND), ROOM.deskFacing, k), pose: { kind: "idle", t: t + 1.7 }, moving: false, where: "desk" };
};

// ---------------------------------------------------------------------------------------------------- her eyes
const FLY_DIR = (() => { const u = P(-1.4, -1.55).sub(ROOM.plate).setY(0).normalize(); return u.multiplyScalar(Math.cos(0.84)).add(V(0, Math.sin(0.84), 0)).normalize(); })();
/** E1: bent over the plate, pushing in on the fly (tracked, a little late); the plate fills ~60 % of the width at the
 *  start, the fly is big at the end */
const insertCam = (f: number): CamPose => {
  const k = stride(clamp01((f - S.from) / (T_PUSH1 - S.from)), 0.35);
  const fly = lagged(f, flyPos, 6), target = ROOM.plate.clone().add(V(0, 0.03, 0)).lerp(fly, smooth(Math.min(1, k * 1.4)));
  const d = lerp(0.86, 0.17, k), fov = lerp(50, 44, k);
  const pos = target.clone().addScaledVector(FLY_DIR, d);
  return frameOn(pos, target, 540, lerp(900, 820, k), fov);
};
/** E2: standing at the table's front-left (straightened), then stepping back out of his way to the front-left of the
 *  room: his eyes held a little right of the middle, high */
const P2 = P(-1.4, -1.4, EYE), C_EAT = P(-1.85, -0.15, EYE);
const herE2 = (f: number) => P2.clone().lerp(C_EAT, stride(clamp01((f - (T_SWING1 - 4)) / (T_ARRIVE + 8 - T_SWING1 + 4))));
const eyeE2 = (f: number) => lagged(f, (g) => eyesOf(newtonAt(Math.min(g, T_GO)).at), 3);
const e2Cam = (f: number): CamPose => frameOn(herE2(f), eyeE2(f), ky(f, [[T_WALK0, 560], [T_ARRIVE + 6, 680]]), ky(f, [[T_WALK0, 600], [T_WALK0 + 10, 540], [T_ARRIVE - 4, 540], [T_ARRIVE + 8, 600]]));
/** E3: she steps in and bends over the plate (two bites gone): the plate a little above the middle, ~60 % wide */
const U2 = C_EAT.clone().sub(ROOM.plate).setY(0).normalize();
const P4 = ROOM.plate.clone().addScaledVector(U2, 0.95).setY(TT + 0.8);
/** the plate close: its lens and where the plate sits (high: the bites on the chop's near edge clear of everything) */
const PLATE_FOV = 36, PLATE_Y = 800;
/** E4: at the desk, a little left of in front of him: his eyes right of the middle, high */
const P5 = P(0.3, -0.2, EYE);
const CAM_DESK = frameOn(P5, eyesOf(ND), 590, 600);
const herE4 = (f: number) => P4.clone().lerp(P5, stride(clamp01((f - T_TURN0) / (T_DESK1 - T_TURN0))));

const camAt = (f: number): CamPose => {
  let cam: CamPose;
  if (f < T_SWING0) cam = insertCam(f);
  else if (f < T_PLATE0) {
    const swing = smooth(clamp01((f - T_SWING0) / (T_SWING1 - T_SWING0)));
    cam = swing < 1 ? mixCam(insertCam(T_SWING0), e2Cam(f), swing) : e2Cam(f);
  } else if (f < T_TURN0) {
    const k = stride(clamp01((f - T_PLATE0) / (T_PLATE1 - T_PLATE0)), 0.35);
    const pos = C_EAT.clone().lerp(P4, k), fov = lerp(62, PLATE_FOV, k);
    const onHim = frameOn(pos, eyeE2(f), 680, 600, fov), onPlate = frameOn(pos, ROOM.plate.clone().add(V(0, 0.02, 0)), 540, PLATE_Y, fov);
    cam = mixCam(onHim, onPlate, smooth(clamp01((f - T_PLATE0) / 14)));
  } else {
    const k = clamp01((f - T_TURN0) / (T_DESK1 - T_TURN0)), pos = herE4(f), fov = lerp(PLATE_FOV, 62, smooth(Math.min(1, k * 2.2)));
    const onPlate = frameOn(pos, ROOM.plate.clone().add(V(0, 0.02, 0)), 540, PLATE_Y, fov);
    const onHim = frameOn(pos, lagged(f, (g) => eyesOf(newtonAt(g).at), 5), lerp(560, 590, k), 600, fov);
    cam = k >= 1 ? CAM_DESK : mixCam(onPlate, onHim, smooth(Math.min(1, (f - T_TURN0) / 16)));
    // 33-34: she leans in a little toward him
    cam = C.creep(cam, f, L5.from, L6.to, 0.12);
  }
  return C.handheld(cam, f, { walk: [[T_WALK0, 0], [T_WALK0 + 6, 0.5], [T_ARRIVE, 0.5], [T_ARRIVE + 8, 0], [T_PLATE0, 0], [T_PLATE0 + 5, 0.45], [T_PLATE1 - 5, 0.45], [T_PLATE1, 0], [T_TURN0, 0], [T_TURN0 + 6, 0.65], [T_DESK1 - 6, 0.65], [T_DESK1, 0]] });
};

// ---------------------------------------------------------------------------------------------------- his hands
/** how far the page he reads is turned toward the lens (0 = only toward his eyes) */
const PAGE_CAM = 0.5;
/** the page in his left hand while he reads (at the desk, walking, eating): low in front of his left side */
const pageHand = (s: NState, f: number) => {
  const bob = 0.006 * Math.sin(f * 0.05), sway = s.moving ? 0.01 * Math.sin(f * 0.6) : 0;
  // walking: in close to his side (clear of the desk's back edge while he turns away from it); at the desk a little
  // higher and out to his left (clear of his face); at the table out to his left, low
  const walk = rel(s.at, s.facing, 0.27, 0.84 + bob, 0.26 + sway);
  if (s.where === "desk") return rel(s.at, s.facing, 0.25, 0.85 + bob, 0.17).lerp(walk, smooth(clamp01((f - T_WALK0 + 6) / 6)));
  if (s.where === "table") return walk.lerp(rel(s.at, s.facing, 0.26, 0.88 + bob, 0.3), smooth(clamp01((f - T_ARRIVE) / 6)));
  return walk;
};
/** how much he is writing (1) or holding the quill still (0: he lifts his head at 32 and 34) */
const writeK = (f: number) => 1 - Math.max(ky(f, [[T_UP0 - 4, 0], [T_UP0 + 4, 1], [T_DOWN1, 1], [T_DOWN1 + 8, 0]]), ky(f, [[T_HOOKE - 6, 0], [T_HOOKE - 1, 1], [T_DOWN2, 1], [T_DOWN2 + 8, 0]]));
const leftOnPage = (f: number) => ROOM.deskWrite.clone().add(V(0.15 + 0.004 * Math.sin(f * 0.031), 0.06, 0.01 + 0.003 * Math.sin(f * 0.023 + 1)));
/** the fork's hand at the table: to the fork, up, in (clink), to his mouth, hovering while he chews, in again, to his
 *  mouth, down where it lay. `mouth` = the fork's tip at his mouth (from his head, after update) */
type ForkKey = [number, THREE.Vector3, ((x: number) => number)?];
const forkKeys = (s: NState, mouthTip: THREE.Vector3, toCam: THREE.Vector3): { keys: ForkKey[]; hang: THREE.Vector3 } => {
  const hang = rel(s.at, s.facing, -0.16, 0.6, 0.06);
  // his fist in front of his chin, low and to his right: the tines at his lips
  const rightDir = V(-Math.cos(s.facing), 0, Math.sin(s.facing));
  const mouth = mouthTip.clone().addScaledVector(toCam.clone().multiplyScalar(0.6).add(V(0, -0.6, 0)).addScaledVector(rightDir, 0.45).normalize(), FORK_TIP);
  const stabDir = (c: THREE.Vector3) => V(-0.25, -0.85, -0.45).normalize().add(c.clone().sub(rel(s.at, s.facing, -0.13, 0.97, 0.04)).normalize()).normalize();
  const stab = (c: THREE.Vector3) => c.clone().addScaledVector(stabDir(c), -FORK_TIP);
  const over = (c: THREE.Vector3) => stab(c).add(V(0, 0.06, 0.02));
  const hover = mouth.clone().add(V(0, -0.12, 0)).addScaledVector(toCam, 0.04);
  // on the way up the fist comes out in front of his chin first (the tines never pass under it)
  const front = mouth.clone().addScaledVector(toCam, 0.09).add(V(0, -0.05, 0));
  // over the table's edge (never through the cloth's drop)
  const edge = FORK_HILT.clone().add(V(0, 0.08, 0.08));
  return {
    hang,
    keys: [
      [T_ARRIVE - 4, hang], [T_ARRIVE + 1, edge], [T_GRAB, FORK_HILT.clone().add(V(0, GRAB_UP, 0)), easeOutCubic],
      [T_CLINK1 - 4, over(CHOP1)], [T_CLINK1, stab(CHOP1)],
      [T_CLINK1 + 5, front], [T_CLINK1 + 9, mouth.clone(), easeOutCubic], [T_CLINK1 + 13, mouth.clone()], [T_CLINK1 + 20, hover], [T_CLINK2 - 9, hover],
      [T_CLINK2 - 4, over(CHOP2)], [T_CLINK2, stab(CHOP2)],
      [T_CLINK2 + 4, front], [T_CLINK2 + 7, mouth.clone(), easeOutCubic], [T_CLINK2 + 9, mouth.clone()], [T_CLINK2 + 11, front], [T_DOWN - 2, edge], [T_DOWN, FORK_HILT.clone().add(V(0, GRAB_UP, 0))],
    ],
  };
};
const pathAt = (f: number, keys: ForkKey[]) => {
  if (f <= keys[0][0]) return keys[0][1].clone();
  for (let i = 1; i < keys.length; i++) if (f <= keys[i][0]) return keys[i - 1][1].clone().lerp(keys[i][1], (keys[i][2] ?? smooth)(clamp01((f - keys[i - 1][0]) / Math.max(1, keys[i][0] - keys[i - 1][0]))));
  return keys[keys.length - 1][1].clone();
};

// ---------------------------------------------------------------------------------------------------- his face
type Ex = "focus" | "deadpan" | "shock";
/** the surprise holds until just after "not" */
const SHOCK_END = capWord("E02", "not").from + 6;
const NEWTON_EXPR: [number, Ex][] = [
  [S.from, "focus"], [T_LOOKUP, "deadpan"], [L2.from - 3, "shock"], [SHOCK_END, "focus"],
  // "Hooke.": deadpan like "Friends interrupt." (the head pop and the nod carry the instant answer; the stern face's
  // V brows and teeth read as rage on a phone, and the laugh in G must stay his only big face after the surprise)
  [L4.from - 3, "deadpan"], [T_DOWN1, "focus"], [T_HOOKE - 3, "deadpan"], [T_DOWN2, "focus"],
];
/** "Hooke." has its own mouth set (speak id): its first open mouth is the O of the "oo", held through the head pop;
 *  on the deadpan face no talking mouth shows teeth (the small mouth's top teeth and the closing strip become the pill) */
const HOOKE_ID = 2;
const NO_TEETH: Record<string, "pill" | "round"> = { strip: "pill", half: "round", wide: "round", tongue: "pill", small: "pill" };
const speakNt = (f: number) => {
  const q = saying("nt", f);
  if (!q) return {};
  if (q.id !== "E06") return speak(q, f, 1);
  const sp = speak(q, f, HOOKE_ID);
  if (!sp.mouth || !NO_TEETH[sp.mouth]) return sp;
  return { ...sp, mouth: sp.mouth === "small" && f < T_HOOKE + 5 ? "round" as const : NO_TEETH[sp.mouth] };
};
/** how far his head is bowed (deg): over the page, up at her, over the page while he walks and eats, over the desk */
const lookDownAt = (f: number) => {
  if (f < T_DESK) return ky(f, [[T_LOOKUP - 2, 26], [T_LOOKUP + 6, 2], [capWord("E02", "not").from + 4, 2], [L2.to + 4, 22]]);
  return lerp(44, 3, 1 - writeK(f));
};
/** his eyes: on the page in his left hand (screen right) while he reads and eats; up at her; at her mic (screen left) */
const gazeAt = (f: number) => at(f, [[S.from, 0.5], [T_LOOKUP, 0], [capWord("E02", "not").from + 4, 0.5], [T_DESK, 0], [T_LOOK, -1], [T_DOWN1, 0], [T_HOOKE, 0], [T_DOWN2, 0]]);
/** chewing (his mouth stays shut: the head bobs a little, the jaw's work), after each bite */
const chewAt = (f: number) => {
  const on = (a: number, b: number) => f >= a && f < b ? Math.sin(Math.PI * clamp01((f - a) / 4)) * Math.sin(Math.PI * clamp01((b - f) / 4)) : 0;
  const k = Math.max(on(T_CHEW - 2, T_CLINK2 - 8), on(T_CHEW2, T_CHEW2 + sec(1.6)));
  return k > 0 ? { dy: -0.035 * k * (0.5 + 0.5 * Math.sin((f / FPS) * 2 * Math.PI * 2.4)), squash: 0.015 * k * Math.sin((f / FPS) * 2 * Math.PI * 2.4) } : undefined;
};

// ---------------------------------------------------------------------------------------------------- the shot
const pose = (w: World, f: number): Pose => {
  const t = f / FPS;
  w.setPlace("room");
  w.set.param("hour", "evening");
  const cam = camAt(f);
  w.setCamera(cam);

  // NEWTON
  const s = newtonAt(f);
  const n: Rig = w.actor(NEWTON);
  const ns = speakNt(f);
  const writing = f >= T_DESK;
  // his hands: the page (left) until he is back at the desk; the fork (right) at the table; the quill at the desk
  const headGuess = s.at.clone().add(V(0.01, 1.22, 0.01));
  const toCam = posOf(cam).sub(headGuess).setY(0).normalize();
  const mouthGuess = headGuess.clone().addScaledVector(toCam, 0.215).add(V(0, -0.13, 0));
  const FK = forkKeys(s, mouthGuess.clone().addScaledVector(toCam, 0.02), toCam);
  let right: THREE.Vector3 | null = null, left: THREE.Vector3 | null = null;
  if (writing) { right = quillFist(nibAt(f, ROOM.deskWrite, writeK(f))); left = leftOnPage(f); }
  else {
    left = pageHand(s, f);
    if (s.where === "table" || (f >= T_GO && f < T_DOWN + 6)) {
      const lift = FORK_HILT.clone().add(V(0, 0.09, 0.1)), grab = FORK_HILT.clone().add(V(0, GRAB_UP, 0));
      right = f < T_DOWN ? pathAt(f, FK.keys) : f < T_DOWN + 4 ? grab.lerp(lift, smooth((f - T_DOWN) / 4)) : null;
    }
  }
  const upToMouth = f >= T_CLINK1 + 2 && f < T_DOWN;
  n.set({
    at: s.at, facing: s.facing, pose: s.pose, expr: at(f, NEWTON_EXPR), ...ns,
    // the surprise stays wide-eyed (no blink over "Have I not?" once the swap's blink is done)
    blink: f >= L2.from + 1 && f < SHOCK_END ? 0 : ns.blink ?? lid(t, 1, swaps(NEWTON_EXPR)),
    head: heads(ns.head, chewAt(f), accent("nod", f, T_HOOKE, { amp: 0.6 }), headPop(f, T_HOOKE), accent("jolt", f, L2.from - 3, { amp: 0.35 }),
      // the pointed look: his head leans a little toward her mic
      f >= T_LOOK - 4 && f < T_DOWN1 + 6 ? { dx: -0.07 * smooth(clamp01((f - T_LOOK + 4) / 8)) * smooth(clamp01((T_DOWN1 + 6 - f) / 8)), tilt: 3 * smooth(clamp01((f - T_LOOK + 4) / 8)) * smooth(clamp01((T_DOWN1 + 6 - f) / 8)) } : undefined),
    lookDown: lookDownAt(f), gaze: gazeAt(f), hands: [right, left], armFront: [upToMouth, false], hide: NEWTON_HIDE, visible: true,
  });

  // the room: the plate (cold, the fly, then two bites), the cover, the fork, the desk's things, the chair aside
  const bites = f > T_CLINK2 ? 2 : f > T_CLINK1 ? 1 : 0;
  w.prop("plate").put(ROOM.plate, { rot: PLATE_ROT, lid: 0, steam: 0, bites, fly: f < T_FLYOFF ? flyU(f) : undefined, t });
  w.prop("lid").put(LID_DOWN);
  w.prop("drafts").put(ROOM.drafts, { rot: -0.15 });
  w.prop("inkwell").put(ROOM.inkwell);
  w.prop("sheets").put(ROOM.deskWrite, { n: writing ? 3 : 2 });
  w.prop("chair").put(CHAIR_ASIDE, { rot: ROOM.chairFacing });

  w.update();

  // the held things: the page, the fork, the quill (from where his fists really are)
  const head = n.headWorld();
  // the page: its face toward his eyes, turned half toward the lens (never edge-on)
  if (!writing) { const pg = pagePut(n.handWorld(1), eyesOf(s.at, N_EYE + 0.02), 0.3, posOf(cam), PAGE_CAM); w.prop("sheets", "page").put(pg.at, { rot: pg.rot, n: 1 }); }
  if (writing) w.prop("quill").put(n.handWorld(0), { grip: "hilt", rot: QROT });
  const held = f >= T_GRAB && f < T_DOWN;
  if (held) {
    const hand = n.handWorld(0), mouth = head.clone().addScaledVector(toCam, 0.235).add(V(0, -0.13, 0));
    // the fork points from his fist at the chop while it goes in, at his mouth while it is up, level as it goes down
    const toChop = (c: THREE.Vector3) => c.clone().sub(hand).normalize();
    const kUp = ky(f, [[T_CLINK1, 0], [T_CLINK1 + 6, 1], [T_CLINK1 + 13, 1], [T_CLINK1 + 20, 0.45], [T_CLINK2 - 9, 0.45], [T_CLINK2 - 3, 0], [T_CLINK2, 0], [T_CLINK2 + 5, 1], [T_CLINK2 + 9, 1], [T_DOWN - 1, 0]]);
    const chopDir = f < T_CLINK2 - 6 ? toChop(CHOP1) : f < T_CLINK2 + 9 ? toChop(CHOP2) : V(-1, 0, 0);
    const kGrab = smooth(clamp01((f - T_GRAB) / 5));
    const dir = V(-1, 0, 0).lerp(chopDir, kGrab).lerp(mouth.clone().sub(hand).normalize(), kUp).normalize();
    // the fork in his fist (it sits GRAB_UP under the fist's middle while it leaves the cloth and while it goes back)
    const low = Math.max(1 - clamp01((f - T_GRAB) / 4), 1 - clamp01((T_DOWN - 1 - f) / 4));
    const forkAt = hand.clone().add(V(0, -GRAB_UP * low, 0)), forkQ = forkRot(dir);
    w.prop("fork").put(forkAt, { grip: "hilt", rot: forkQ });
    // the bite on the tines, from the stab to his lips
    putMorsel(w, morselOn(f) ? forkAt : null, forkQ);
  } else { w.prop("fork").put(FORK_HILT, { rot: FORK_REST }); putMorsel(w, null); }

  // HER MIC: out over the insert; in from the lower left toward him on "Have I not?"; tipped at the plate (two bites);
  // back on him for 31-34; round to the lens on the aside
  const mouthOf = () => head.clone().add(V(0, -0.1, 0));
  const plateTop = () => ROOM.plate.clone().add(V(0, 0.06, 0));
  const aim = aimThrough(f, [[S.from, mouthOf], [T_PLATE0 + 4, plateTop], [T_TURN0 + 4, mouthOf]], 10);
  // (lowered out of the frame while she bends over the plate: the bites stay clear)
  const enter = easeOutCubic(clamp01((f - L2.from) / 12)) * (1 - ky(f, [[T_PLATE0 + 4, 0], [T_PLATE0 + 14, 1], [T_TURN0 + 2, 1], [T_TURN0 + 14, 0]]));
  const M = C.putMic(w, cam, f, { aim, lens: asideK(f), enter, tilt: ky(f, [[T_PLATE0 + 4, 0], [T_PLATE0 + 14, 12], [T_TURN0, 12], [T_TURN0 + 10, 0]]) });

  // the lens: the insert focuses on the fly (the plate soft round it), the plate close on the plate; the aside on the mic
  const camPos = posOf(cam);
  let dof: { focus: number; amount: number } | undefined;
  if (f < T_SWING1) { const k = 1 - smooth(clamp01((f - T_SWING0) / (T_SWING1 - T_SWING0))); dof = { focus: camPos.distanceTo(lagged(f, flyPos, 6)), amount: lerp(2, 9, smooth(clamp01((f - S.from) / (T_PUSH1 - S.from)))) * k }; }
  else if (f >= T_PLATE0 + 8 && f < T_TURN0 + 8 && !(M.dof && M.dof.amount > 3)) dof = { focus: camPos.distanceTo(ROOM.plate), amount: 4 * smooth(clamp01((f - T_PLATE0 - 8) / 8)) * smooth(clamp01((T_TURN0 + 8 - f) / 8)) };
  else if (M.visible && M.dof) dof = M.dof;
  return { camera: cam, post: dof && dof.amount > 0.05 ? { dof } : undefined, slate: "E" };
};

export const SEG: Segment = { id: "E", from: S.from, to: S.to, enter() {}, exit(w) { morselOff(w); }, pose };
