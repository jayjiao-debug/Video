// SCENE F · Tuesday, the Friar's cell, then Juliet's room that night (第2天 · 已婚 · 已分居). Her whisper over the
// greyer cell (her parents want her married to another man); the Friar holds the vial up to the window light, Juliet's
// steady face behind it (no warmth, no breath; two and forty hours); she snatches it ("Give me, give me!"). Her question
// (does Romeo know?); he writes and seals a letter, then holds it out to HER lens exactly as Romeo did in scene A; "…I
// only film." He nods without blame and gives it to a young friar, who leaves; she holds on the empty doorway a second
// too long. The cell door closes over the lens and opens on Juliet's room at night: she raises the bottle to the lens
// like a toast, and the picture cuts before it comes anywhere near her lips.
// CAMERA PLAN:
//   1  F01      the bench framing, Tuesday grey; her whisper lean                                        (the news)
//   2  F02-F03  a push onto the vial held up to the light, Juliet's face behind it                       (the 假死药)
//   3  F04      hold: she snatches it                                                                    (it changes hands)
//   4  F06      ease back and pan right to the writing desk                                              (the letter is made)
//   5  F07      he walks the letter up to the lens; she holds still                                      (scene A again)
//   6  F08      pan left after the young friar to the empty doorway; hold too long                       (it is gone)
//   7  join     the door closes over the lens and opens on her room                                       (a door wipe)
//   8  F09      the toast to the lens; cut to black before the bottle comes back to her                  (the end of hope)
import * as THREE from "three";
import { seg, type Segment } from "../story";
import { povCam, keyCam, handheld, lensCam, toScreen, type CamKey } from "../cam";
import { V, VERBS, standing, yawTo, walkAlong, seated } from "./common";
import { JULIET, FRIAR, FRIAR_VIAL, FRIAR_QUILL, FRIAR_LETTER, YOUNG_FRIAR } from "../people";
import { whisperLean } from "../whisper";
import { P, wv, spot, camAt, faceAt, talk, wordAt, startOf, endOf, ky, accent, rel, soft, carry, REACT } from "./kit";
import { h } from "./h";
import { seatOn, stoolSeat } from "../../../kit/day/rig/seats";
import { clamp01, easeInOutCubic, smooth } from "../../group/story";
import { cap } from "../captions";
import { hit, span, lineBody, leans, talkHead } from "./gest";
import { setSeat } from "../../../kit/acc/garb";

const S = seg("F");
const BENCH = spot("cell", "friarBench"), DOOR = spot("cell", "door"), DESK = spot("cell", "desk"), BED = spot("bedroom", "julietBed");
const BENCH_CAM = camAt("cell", "bench", 0);
/** the cell beats: the Friar and Juliet face each other by the bench; the vial goes up between them */
const FR_AT = P("cell", 0.62, 0, -1.38), JU_AT = P("cell", -0.02, 0, -1.08);
const VIAL_UP = P("cell", 0.3, 1.12, -1.05);
/** the letter walked up to the lens, and the young friar by the door */
const FR_LENS = P("cell", 0.32, 0, -0.05), YF_WAIT = P("cell", -1.45, 0, -0.8), YF_TAKE = P("cell", -0.25, 0, -0.35);
/** the door wipe's frames, and the place switch at its black */
export const JOIN = { close: startOf("F09") - 26, black: startOf("F09") - 14, open: startOf("F09") - 11, done: startOf("F09") - 1 };
/** the black after she has fallen (v7; until v6 the cut before the bottle could come back toward her, the line's end + 16) */
export const TOAST_CUT = endOf("F09") + 100;

export const SEG: Segment = {
  id: "F", from: S.from, to: S.to,
  enter() {}, exit(w) { setSeat(w.actor(JULIET), null); },
  pose(w, f) {
    return f < JOIN.black ? cell(w, f) : room(w, f);
  },
};

// ------------------------------------------------------------------------------------------------------ the cell
function cell(w: Parameters<Segment["pose"]>[0], f: number) {
  w.setPlace("cell");
  w.set.param("day", "tuesday");
  const f02 = startOf("F02"), f04 = startOf("F04"), f06 = startOf("F06"), f07 = startOf("F07"), f08 = startOf("F08");
  const tGive = startOf("F04") + 6, sealAt = endOf("F06") - 6;
  const deskWalk = f06 - 10, lensWalk = f07 - 18;
  // the young friar: in by the door during F07, takes the letter after F08, leaves
  // THE LETTER CHANGES HANDS (v5). The Friar held it out to the lens to the end, and the young friar, beside and behind
  // him, reached for it 24 cm short: it jumped from one hand to the other, and the Friar's turn to him came after. Now,
  // once the tally has blinked, the Friar turns to him and brings the letter between them (GIVE); the young friar's
  // hand is on it (TAKE) when it goes; he lowers it and turns to the door.
  const handAt = endOf("F08") + 18, yfLeave = handAt + 6;
  // (he sets off 24 frames before the line ends, not 6: at 6 he was still 29 cm short when he turned to go, and jumped there)
  const yfGo = endOf("F08") - 24;
  const TO_YF = yawTo(FR_LENS, YF_TAKE), GIVE = rel(FR_LENS, TO_YF, 0, 0.95, 0.34), TAKE = rel(FR_LENS, TO_YF, 0, 0.95, 0.4);
  const give = ky(f, [[handAt - 9, 0], [handAt - 1, 1]]);
  // ---------------------------------------------------------------- the camera
  const k = (fr: number, o: Partial<CamKey> = {}): CamKey => ({ ...BENCH_CAM, f: fr, ...o });
  const keys: CamKey[] = [
    // the two of them by the bench, from a step further back so both heads fit (v4 stills: her head was cut at the left)
    k(S.from, { pos: wv("cell", [0.05, 1.5, 1.75]), look: wv("cell", [0.26, 1.1, -1.2]), fov: 48 }),
    k(f02 - 4, { pos: wv("cell", [0.05, 1.5, 1.75]), look: wv("cell", [0.26, 1.1, -1.2]), fov: 48 }),
    // the push onto the vial is a zoom from where she stands (taste review of v1: stepping in to the stock bench view
    // put the back of Juliet's head over half the frame and the vial was lost beside it); her face, the vial, his face
    k(f02 + 30, { pos: wv("cell", [0.05, 1.5, 1.75]), look: wv("cell", [0.3, 1.14, -1.08]), fov: 28 }),
    k(endOf("F03"), { pos: wv("cell", [0.05, 1.5, 1.75]), look: wv("cell", [0.3, 1.14, -1.08]), fov: 30 }),
    k(endOf("F05") + 4, { pos: wv("cell", [0.05, 1.5, 1.75]), look: wv("cell", [0.32, 1.1, -1.1]), fov: 36 }),
    k(f06 + 20, { look: wv("cell", [1.28, 1.08, -0.62]), fov: 38 }),                // pan right to the desk: him writing at it
    k(lensWalk, { look: wv("cell", [1.28, 1.08, -0.62]), fov: 38 }),
    k(f07 + 4, { look: wv("cell", [0.3, 1.0, -0.05]), fov: 50 }),                   // he walks the letter up to her
    k(handAt - 9, { look: wv("cell", [0.3, 1.0, -0.05]), fov: 50 }),
    // with the letter as he turns and holds it out: the boy's face and the two hands on it (it changed hands at the
    // frame's left edge, under the part the app cuts off). An even turn of the lens, as the Friar's own turn is (the
    // default ease is three times as fast in its middle: 6 degrees a frame here, a whip); then a beat on the hands
    k(handAt + 1, { look: wv("cell", [-0.12, 1.02, -0.28]), fov: 50, ease: smooth }),
    k(handAt + 4, { look: wv("cell", [-0.12, 1.02, -0.28]), fov: 50 }),
  ];
  // AFTER THE BOY: the lens stays on him as he turns and walks to the door. (It swung to the doorway in twenty frames,
  // faster than he walks: he hung at the frame's right edge, under the part the app cuts off, f4160-4172, and crossed
  // the picture only as he left.) His head is brought from the left of the letter to the middle as he walks, and kept
  // there to the door wipe: the lens turns at his pace, at most 2.4 degrees a frame.
  const yfOutAt = (g: number) => walkAlong([YF_TAKE, DOOR.at.clone().add(V(-0.5, 0, -0.15))], 1.5, (g - yfLeave) / 30, { easeOut: 0 });      // (he walks out of sight)
  const yfHead = (g: number) => (g < yfLeave ? YF_TAKE : yfOutAt(g).at).clone().setY(1.12);
  const atHand = keyCam(handAt + 4, keys), s0 = toScreen(atHand, yfHead(handAt + 4));
  let camera = f <= handAt + 4 ? keyCam(f, keys) : lensCam(f, [
    { f: handAt + 4, pos: BENCH_CAM.pos, at: yfHead, sx: s0.x, sy: s0.y, fov: 50 },
    { f: yfLeave + 25, pos: BENCH_CAM.pos, at: yfHead, sx: 600, sy: 890, fov: 46 },
    { f: JOIN.close + 6, pos: BENCH_CAM.pos, at: yfHead, sx: 540, sy: 930, fov: 46 },
  ]);
  camera = handheld(camera, f, { mood: "calm", amp: 0.4 });
  camera = whisperLean(f, camera);
  w.setCamera(camera);

  // ---------------------------------------------------------------- the Friar: vial -> desk (quill, wax) -> letter to the lens
  const DESK_PATH = [FR_AT, P("cell", 1.45, 0, -1.1), DESK.at];
  const deskLeg = walkAlong(DESK_PATH, 1.3, (f - deskWalk) / 30, { endFacing: DESK.facing });
  // he walks up beside the desk, turns to it (the walk's own turn: six frames) and THEN puts the quill to the sheet
  // (the hand went to the sheet on the frame he arrived, a quarter turn before he faced it: eased, it came up from
  // under the desk and through the writing slope)
  const deskAt = deskWalk + Math.ceil(VERBS.walkTime(DESK_PATH, 1.3) * 30);
  const lensLeg = walkAlong([DESK.at, P("cell", 1.42, 0, -0.06), FR_LENS], 1.4, (f - lensWalk) / 30, { endFacing: yawTo(FR_LENS, BENCH_CAM.pos as number[]) });
  const phase = f < tGive ? "vial" : f < deskWalk ? "free" : f < lensWalk ? "desk" : f < handAt ? "letter" : "after";
  const fr = w.actor(phase === "vial" ? FRIAR_VIAL : phase === "desk" ? FRIAR_QUILL : phase === "letter" ? FRIAR_LETTER : FRIAR);
  let frAt = FR_AT.clone(), frFacing = yawTo(FR_AT, JU_AT), frX: Record<string, unknown> = { pose: { kind: "idle", t: f / 30 } };
  if (phase === "vial") {
    const up = ky(f, [[f02 - 6, 0], [f02 + 10, 1]]);
    // (v5, the owner: "Make their body or hands move as they speak") THE VIAL MOVES WITH HIS WORDS (it stood in the air
    // between them for ten seconds): shown on "vial"; tipped from side to side through "no warmth, no breath" (a
    // slow no); turned in a small circle over "two and forty hours"; lifted on "awake"
    const no = cap("F02", 1), hours = cap("F03", 0), tip = span(f, no.from, no.end - 8, 6, 14) * Math.sin((f - no.from) * 0.24);
    const turn = span(f, hours.from, hours.end, 8, 12), ta = (f - hours.from) * 0.2;
    const vial = VIAL_UP.clone().add(V(0.036 * tip + 0.02 * turn * Math.sin(ta), 0.03 * hit(f, wordAt("F02", "vial"), 4, 12) + 0.045 * hit(f, wordAt("F03", "awake"), 5, 18) + 0.02 * turn * (1 - Math.cos(ta)), 0));
    frX = { pose: { kind: "hold", t: f / 30 }, hands: up > 0 ? [rel(FR_AT, frFacing, -0.12, 0.72, 0.25).lerp(vial, up), null] : [null, null] };
  } else if (phase === "desk") {
    frAt = deskLeg.at; frFacing = deskLeg.facing;
    const writing = f >= deskAt + 9 && f < sealAt;
    const stroke = Math.sin(f * 0.9) * 0.025, line = ((f % 18) / 18) * 0.06;
    const nib = P("cell", 1.03, 1.03, -0.66 + line).add(V(0, stroke * 0.4, stroke));
    const seal = P("cell", 1.02, 1.0 + 0.06 * (1 - ky(f, [[sealAt, 0], [sealAt + 4, 1]])), -0.56);
    // the quill is in his hand from the frame the hand comes down on the desk to the frame it leaves it (it was in his
    // hanging hand from the first step of the walk: it popped in there, in view, and he carried it across the cell);
    // the desk's top is seen edge on from the bench, so a quill lying on it could not be seen before or after
    const quillOn = f >= deskAt + 11 && f < sealAt;
    frX = { pose: deskLeg.moving ? deskLeg.pose : { kind: deskLeg.arrived ? "hold" : "idle", t: f / 30 }, hands: writing ? [nib, null] : f >= sealAt ? [null, seal] : [null, null], hide: quillOn ? [] : ["quill"] };
  } else if (phase === "letter") {
    const d = TO_YF - lensLeg.facing;
    frAt = lensLeg.at; frFacing = lensLeg.facing + Math.atan2(Math.sin(d), Math.cos(d)) * give;
    // (v5) "bear THIS to Romeo": the letter is pushed at her lens on "this", and again, less, on "Romeo"
    const push = hit(f, wordAt("F07", "this"), 3, 14) + 0.5 * hit(f, wordAt("F07", "Romeo"), 3, 10);
    frX = { pose: lensLeg.moving ? lensLeg.pose : { kind: "hold", t: f / 30 }, hands: lensLeg.arrived ? [rel(FR_LENS, lensLeg.facing, -0.12, 1.0 + 0.06 * push, 0.4 + 0.07 * push).lerp(GIVE, give), null] : [null, null] };
  } else if (phase === "after") {
    frAt = FR_LENS.clone(); frFacing = yawTo(FR_LENS, YF_TAKE);
  }
  if (phase === "free") frFacing = yawTo(FR_AT, JU_AT);
  fr.set({
    ...standing(frAt, frFacing, f, 3),
    ...frX,
    expr: faceAt(f, [[0, "worried"], [f02 - 2, "warn"], [f04 + REACT, "worried"], [f06 - 2, "weary"], [f07 - 2, "worried"], [endOf("F08") + REACT, "weary"]]),
    ...talk("fr", f, 3),
    // he looks down at the sheet while he stands at the desk, and up again as he turns to the lens with the letter (each
    // took one frame; the rule is of the frame alone, so the look travels across the change of figure at lensWalk too)
    lookDown: soft(f, (g) => (g >= deskAt && g < lensWalk ? 16 : 0)),
    head: talkHead("fr", f, 3, accent("nod", f, endOf("F08") + REACT + 2)),
    // (v5) he leans to her with each phrase of the plan; he leans in at the lens with his letter
    lean: leans(lineBody(f, "F02", { lean: 3, dip: 2.2, sway: 0 }), lineBody(f, "F03", { lean: 3, dip: 2.2, sway: 0, words: ["awake"] }), lineBody(f, "F07", { lean: 4, dip: 2.5, sway: 0, words: ["this"] })),
    gaze: phase === "letter" && f < handAt - 9 ? 0 : undefined,                    // (his eyes leave the lens as he turns to the boy)
    hide: [...((frX.hide as string[] | undefined) ?? []), "herbBasket"],
  });

  // ---------------------------------------------------------------- Juliet: steady beside him; snatches the vial
  const ju = w.actor(JULIET);
  setSeat(ju, null);
  const has = f >= tGive;
  // she stands a fifth of a turn open to the lens while they talk, and turns to follow him as he goes to the desk (the
  // 0.35 went in one frame at F06: her body's turn was eased, but the vial's place went with it at once, 10 cm, and
  // her elbow 22 cm)
  // ... and to the boy as he comes for the letter: she watches it go. (She stood square to the Friar to the end, and
  // from the bench the vial in her hand sat right on top of the letter as it changed hands, f4143-4152. Turned to
  // him, a little past, it is behind his head from there, and comes out as he walks off.) Off the frame while she turns.
  const toFriar = yawTo(JU_AT, frAt) + 0.35 * (1 - ky(f, [[f06 - 4, 0], [f06 + 8, 1]]));
  const watch = yawTo(JU_AT, YF_TAKE) - 0.2 - toFriar;
  const juFacing = toFriar + Math.atan2(Math.sin(watch), Math.cos(watch)) * ky(f, [[yfGo + 6, 0], [yfGo + 26, 1]]);
  // up to the vial in eight frames; then she yanks it down and settles it slowly, 22 frames, the last quarter of the
  // way in 14 of them. (It came down on a key that ended a quarter of the way up and dropped the last 12 cm in one
  // frame; and down there her arm lines up with the pose's elbow direction, where the rig turns the elbow out and up:
  // crossed at speed, the elbow went 14 cm in one frame.)
  const grab = f <= tGive ? ky(f, [[tGive - 8, 0], [tGive, 1]]) : Math.pow(1 - clamp01((f - tGive) / 22), 3);
  // (v3b) the vial held in front of her middle, not off to her left: there her left drill curl swung into it as she
  // turned her head to the Friar (clearance v3a: the vial 2.4 cm into her hair, f3722-3861). (v5) 6 cm higher: at 0.76
  // its foot stood in the top of the caption for three seconds
  ju.set({
    ...standing(JU_AT, juFacing, f, 2),
    pose: { kind: has ? "hold" : "idle", t: f / 30 },
    hands: grab > 0 ? [null, VIAL_UP.clone().lerp(rel(JU_AT, juFacing, 0.03, 0.82, 0.3), clamp01(1 - grab))] : has ? [null, rel(JU_AT, juFacing, 0.03, 0.82, 0.3)] : [null, null],
    // (v7, the owner: "Juliet should be more sad rather then a smile?": sad through the plan, desperate on the snatch)
    expr: faceAt(f, [[0, "sorrow"], [f04 - 2, "desperate"], [endOf("F04") + REACT, "sorrow"]]),
    ...talk("ju", f, 2), head: talkHead("ju", f, 2),
    // (v5) she leans in to the vial as he explains it, goes at it with her whole body on "Give me", and tells him off
    lean: leans({ pitch: 3 * span(f, f02 + 24, f04 - 6, 18, 8) + 7 * hit(f, tGive, 5, 12) }, lineBody(f, "F04", { lean: 3, dip: 3, sway: 0, words: ["tell"] })),
    hide: has ? [] : ["vial"],
  });

  // ---------------------------------------------------------------- the young friar
  const yf = w.actor(YOUNG_FRIAR);
  const yfIn = walkAlong([DOOR.at.clone().add(V(-0.35, 0, -0.1)), YF_WAIT], 1.2, (f - (f07 + 10)) / 30, { endFacing: yawTo(YF_WAIT, FR_LENS), easeIn: 0 });      // (he comes in walking)
  const yfTo = walkAlong([YF_WAIT, YF_TAKE], 1.3, (f - yfGo) / 30, { endFacing: yawTo(YF_TAKE, FR_LENS) });
  const yfOut = yfOutAt(f);
  const yl = f < yfGo ? yfIn : f < yfLeave ? yfTo : yfOut;
  const holding = f >= handAt;
  yf.set({
    ...standing(yl.at, yl.facing, f, 4),
    pose: yl.moving ? yl.pose : { kind: holding ? "hold" : "idle", t: f / 30 },
    hands: f >= handAt - 6 && f < handAt + 2 ? [TAKE, null] : [null, null],
    expr: faceAt(f, [[0, "neutral"]]),
    visible: f >= f07 + 10 && !(f >= yfLeave && yfOut.arrived),
    hide: holding ? [] : ["letter"],
  });
  // the sealed letter on the desk between the wax and his picking it up
  if (f >= sealAt && f < lensWalk) w.prop("letterSealed").put(P("cell", 1.02, 1.02, -0.56), { rot: -1.4 });
  w.update();

  // ---------------------------------------------------------------- the door wipe (closes over the lens)
  const overlays = f >= JOIN.close ? doorWipe(clamp01((f - JOIN.close) / (JOIN.black - JOIN.close))) : undefined;
  return { camera, overlays };
}

// ------------------------------------------------------------------------------------------------------ her room
/** HER ROOM (v7, the owner on the v6.1 cut: "let do a animation of where drinking the potion, the potion empties, she
 *  drops it and starts to fall, then transition"; "Her dress is clipping with the bed, maybe make her sit closer up?";
 *  "Juliet should be more sad rather then a smile?"). Until v6 she raised the bottle to the lens and the picture cut to
 *  black before it came back to her. Now, from closer (waist up: the bed's edge, where the gown went into it, is under
 *  the frame): the toast to the lens on "drink"; she brings the bottle to her lips, the cork comes away, she tips it up
 *  with her eyes shut and it drains; she lowers it and looks at it, empty; it slips out of her fingers; she sways and
 *  falls sideways onto the bed; the picture fades to black. Frames after the line's end: */
export const ROOM = { lift: 2, cork: [5, 13], lips: 16, drain: [20, 46], lower: [48, 56], drop: 64, fall: [70, 92], fade: [90, 100] } as const;
/** the vial's tilt while she drinks (rad, about the lens's axis: the neck to her mouth), how far it goes up */
const DRINK_TILT = 2.0, FALL_TURN = 1.05;
/** the mouth of a figure for this camera: below the head's centre on the front of the head, toward the lens */
const mouthOf = (w: Parameters<Segment["pose"]>[0], r: { headWorld(): THREE.Vector3 }) => {
  const hd = r.headWorld(), cam = (w.camera as THREE.PerspectiveCamera).position;
  const toCam = cam.clone().sub(hd).setY(0).normalize();
  return hd.clone().addScaledVector(toCam, 0.24).add(V(0, -0.075, 0));
};
function room(w: Parameters<Segment["pose"]>[0], f: number) {
  w.setPlace("bedroom");
  const toast = wordAt("F09", "drink"), e = endOf("F09"), R = ROOM;
  const at = (k: number) => e + k;
  // closer than v6 (waist up), the bottle and her face both in; as she falls the lens tips down after her
  const fallK = easeInOutCubic(clamp01((f - at(R.fall[0])) / (R.fall[1] - R.fall[0])));
  const tc = { look: wv("bedroom", [0.07 - 0.22 * fallK, 1.06 - 0.16 * fallK, -1.0]), fov: 37 + 3 * fallK };
  const camera = povCam(f, [camAt("bedroom", "toast", JOIN.black, tc), camAt("bedroom", "toast", S.to, tc)], { mood: "calm", amp: 0.3 });
  w.setCamera(camera);
  const ju = w.actor(JULIET);
  const seat = seatOn(stoolSeat({ seat: 0.42, d: 0.4 }), BED.at, BED.facing);
  // (v7) her gown lies on the bed and hangs from her knees in front of it (garb.ts setSeat), not down through it
  setSeat(ju, seat, BED.facing);
  // the bottle: in her lap, raised to the lens like a toast on "drink"
  const raise = ky(f, [[toast - 14, 0], [toast + 2, 1]]);
  const lapL = rel(BED.at, BED.facing, -0.1, 0.61, 0.3), lap = rel(BED.at, BED.facing, 0.1, 0.58, 0.3), out = rel(BED.at, BED.facing, 0.36, 1.12, 0.36);
  const free = f >= at(R.lift);                       // the vial is a prop from here (she tips it, it drains, it falls)
  const toLips = ky(f, [[at(R.lift), 0], [at(R.lips), 1], [at(R.lower[0]), 1], [at(R.lower[1]), 0]]);
  const tilt = DRINK_TILT * ky(f, [[at(R.lips) - 2, 0], [at(R.drain[0]), 0.75], [at(R.drain[1]), 1], [at(R.lower[0]), 1], [at(R.lower[1]), 0.15]]);
  const amount = 1 - clamp01((f - at(R.drain[0])) / (R.drain[1] - R.drain[0]));
  const dropped = f >= at(R.drop), falling = f >= at(R.fall[0]);
  // her face: sad (v7); eyes shut while she drinks; looking down at the empty bottle; shut again as she goes
  const drinking = f >= at(R.lips) - 2 && f < at(R.lower[0]) + 2;
  const lids = falling ? ky(f, [[at(R.fall[0]), 0.3], [at(R.fall[0]) + 8, 1]]) : drinking ? 1 : f >= at(R.drop) + 2 ? 0.35 : undefined;
  const state = (hands: [THREE.Vector3 | null, THREE.Vector3 | null]) => ({
    ...standing(seat.top.clone(), BED.facing, f, 2),
    ...seated(seat, f / 30),
    // (v7, the ease check: the "sit" pose's elbow pole is out and back, and with the hand at her mouth the arm's swivel
    // flipped the elbow up and down again, 22 and 25 cm in one frame, f4494 and f4531. "hold" keeps both elbows low
    // and out, the way a bottle is drunk; she still sits on her seat.)
    pose: { kind: "hold" as const, t: f / 30 },
    hands,
    expr: faceAt(f, [[0, "sorrow"], [at(R.fall[0]) + 6, "down"]]),
    ...talk("ju", f, 2),
    head: talkHead("ju", f, 2, accent("nod", f, toast)),
    // her chin comes up as she drinks, down to the empty bottle, then her head goes with her body
    lookDown: soft(f, (g) => (g >= at(R.lips) && g < at(R.lower[0]) ? -12 : g >= at(R.lower[1]) && g < at(R.fall[0]) ? 16 : 0), 3),
    ...(lids !== undefined ? { blink: lids } : {}),
    // (the bottle arm is drawn at its true depth through the whole room: switched on only as the vial came free, the
    // stricter clearance swung the elbow 9 cm in one frame)
    armFront: [undefined, true] as [boolean | undefined, boolean | undefined],
    ...(free ? { hide: ["vial"] } : {}),
  });
  const restHands: [THREE.Vector3 | null, THREE.Vector3 | null] = [lapL, lap.clone().lerp(out, easeInOutCubic(raise))];
  ju.set(state(restHands));
  w.update();
  let vialAt: THREE.Vector3 | null = null, vialQ: THREE.Quaternion | null = null;
  if (free && !dropped) {
    // where the bottle is: at the toast (out), or with its neck at her lips, tipped toward her mouth
    const dir = V(-Math.sin(tilt), Math.cos(tilt), 0), H = 0.1;
    const mouth = mouthOf(w, ju), atLips = mouth.clone().addScaledVector(dir, -H);
    const atToast = out.clone().add(V(-0.01, -0.03, 0));
    const atLook = rel(BED.at, BED.facing, 0.14, 0.95, 0.42);
    vialAt = f < at(R.lower[0]) ? atToast.clone().lerp(atLips, easeInOutCubic(toLips)) : atLook.clone().lerp(atLips, easeInOutCubic(toLips));
    vialQ = new THREE.Quaternion().setFromAxisAngle(V(0, 0, 1), tilt);
    const hand = vialAt.clone().addScaledVector(dir, 0.035);
    ju.set(state([lapL, hand]));
    w.update();
  } else if (dropped) {
    // it slips from her fingers: from where it was held at the look, falling, turning; it stops on the floor
    const t = (f - at(R.drop)) / 30, p0 = rel(BED.at, BED.facing, 0.14, 0.95, 0.42);
    const y = Math.max(0.02, p0.y - 0.5 * 9.8 * t * t);
    vialAt = V(p0.x + 0.12 * t, y, p0.z + 0.25 * t);
    vialQ = new THREE.Quaternion().setFromAxisAngle(V(0.3, 0, 1).normalize(), 0.3 + 7 * t);
    const handsNow: [THREE.Vector3 | null, THREE.Vector3 | null] = falling ? [null, null] : [lapL, rel(BED.at, BED.facing, 0.14, 0.93, 0.42)];
    ju.set(state(handsNow));
    w.update();
  }
  if (vialAt && vialQ) w.prop("vialFree").put(vialAt, { rot: vialQ, amount, go: clamp01((f - at(R.cork[0])) / (R.cork[1] - R.cork[0])) });
  // SHE FALLS sideways onto the bed (the rig cannot lie: the seated figure is carried about her hips, kit.ts carry)
  if (falling) {
    const k = clamp01((f - at(R.fall[0])) / (R.fall[1] - R.fall[0])), ek = k * k * (3 - 2 * k) * (0.6 + 0.4 * k);
    const settle = f > at(R.fall[1]) ? 0.04 * Math.sin(Math.min(1, (f - at(R.fall[1])) / 6) * Math.PI) : 0;
    const q = new THREE.Quaternion().setFromAxisAngle(V(0, 0, 1), FALL_TURN * Math.min(1, ek) - settle);
    carry(w, ju, q, seat.top.clone(), V(0, 0.02 * ek, 0), true);
  }
  const opening = f < JOIN.done ? doorWipe(1 - clamp01((f - JOIN.open) / (JOIN.done - JOIN.open))) : undefined;
  const fade = clamp01((f - at(R.fade[0])) / (R.fade[1] - R.fade[0]));
  const top = fade > 0 ? h("div", { style: { position: "absolute", inset: 0, background: "#000", opacity: fade } }) : undefined;
  return { camera, overlays: opening, top, hud: f >= TOAST_CUT ? false : undefined, captions: f >= TOAST_CUT ? false : undefined };
}

/** the cell door swinging shut over the lens: dark planks with iron bands slide across from the left (k 0..1 = shut) */
function doorWipe(k: number) {
  if (k <= 0) return undefined;
  const e = easeInOutCubic(k), x = -1080 + 1080 * e;
  return h("div", { style: { position: "absolute", left: x, top: 0, width: 1080, height: 1920, background: "repeating-linear-gradient(90deg, #3b2716 0px, #4a321d 150px, #2a1b0f 156px, #3b2716 160px)", boxShadow: "18px 0 40px rgba(0,0,0,0.6)" } },
    h("div", { style: { position: "absolute", left: 0, right: 0, top: 520, height: 46, background: "#1d1712", opacity: 0.9 } }),
    h("div", { style: { position: "absolute", left: 0, right: 0, top: 1360, height: 46, background: "#1d1712", opacity: 0.9 } }));
}
