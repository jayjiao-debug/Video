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
import { povCam, type CamKey } from "../cam";
import { V, standing, yawTo, walkAlong, seated } from "./common";
import { JULIET, FRIAR, FRIAR_VIAL, FRIAR_QUILL, FRIAR_LETTER, YOUNG_FRIAR } from "../people";
import { whisperLean } from "../whisper";
import { P, wv, spot, camAt, faceAt, talk, wordAt, startOf, endOf, ky, accent, rel, REACT } from "./kit";
import { h } from "./h";
import { seatOn, stoolSeat } from "../../../kit/day/rig/seats";
import { clamp01, easeInOutCubic } from "../../group/story";

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
/** the cut before the bottle can come back toward her: black from here to the end of the scene */
export const TOAST_CUT = endOf("F09") + 16;

export const SEG: Segment = {
  id: "F", from: S.from, to: S.to,
  enter() {}, exit() {},
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
  const handAt = endOf("F08") + 14, yfLeave = handAt + 4;
  // ---------------------------------------------------------------- the camera
  const k = (fr: number, o: Partial<CamKey> = {}): CamKey => ({ ...BENCH_CAM, f: fr, ...o });
  let camera = povCam(f, [
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
    k(handAt - 6, { look: wv("cell", [0.3, 1.0, -0.05]), fov: 50 }),
    k(yfLeave + 18, { look: wv("cell", [-1.7, 1.05, -1.0]), fov: 46 }),             // after the young friar: the doorway
    k(JOIN.black, { look: wv("cell", [-1.8, 1.05, -1.05]), fov: 46 }),
  ], { mood: "calm", amp: 0.4 });
  camera = whisperLean(f, camera);
  w.setCamera(camera);

  // ---------------------------------------------------------------- the Friar: vial -> desk (quill, wax) -> letter to the lens
  const deskLeg = walkAlong([FR_AT, P("cell", 1.45, 0, -1.1), DESK.at], 1.3, (f - deskWalk) / 30, { endFacing: DESK.facing });
  const lensLeg = walkAlong([DESK.at, P("cell", 1.42, 0, -0.06), FR_LENS], 1.4, (f - lensWalk) / 30, { endFacing: yawTo(FR_LENS, BENCH_CAM.pos as number[]) });
  const phase = f < tGive ? "vial" : f < deskWalk ? "free" : f < lensWalk ? "desk" : f < handAt ? "letter" : "after";
  const fr = w.actor(phase === "vial" ? FRIAR_VIAL : phase === "desk" ? FRIAR_QUILL : phase === "letter" ? FRIAR_LETTER : FRIAR);
  let frAt = FR_AT.clone(), frFacing = yawTo(FR_AT, JU_AT), frX: Record<string, unknown> = { pose: { kind: "idle", t: f / 30 } };
  if (phase === "vial") {
    const up = ky(f, [[f02 - 6, 0], [f02 + 10, 1]]);
    frX = { pose: { kind: "hold", t: f / 30 }, hands: up > 0 ? [rel(FR_AT, frFacing, -0.12, 0.72, 0.25).lerp(VIAL_UP, up), null] : [null, null] };
  } else if (phase === "desk") {
    frAt = deskLeg.at; frFacing = deskLeg.facing;
    const writing = deskLeg.arrived && f < sealAt;
    const stroke = Math.sin(f * 0.9) * 0.025, line = ((f % 18) / 18) * 0.06;
    const nib = P("cell", 1.03, 1.03, -0.66 + line).add(V(0, stroke * 0.4, stroke));
    const seal = P("cell", 1.02, 1.0 + 0.06 * (1 - ky(f, [[sealAt, 0], [sealAt + 4, 1]])), -0.56);
    frX = { pose: deskLeg.moving ? deskLeg.pose : { kind: "hold", t: f / 30 }, hands: writing ? [nib, null] : f >= sealAt ? [null, seal] : [null, null], lookDown: deskLeg.arrived ? 16 : 0, hide: f >= sealAt ? ["quill"] : [] };
  } else if (phase === "letter") {
    frAt = lensLeg.at; frFacing = lensLeg.facing;
    frX = { pose: lensLeg.moving ? lensLeg.pose : { kind: "hold", t: f / 30 }, hands: lensLeg.arrived ? [rel(FR_LENS, frFacing, -0.12, 1.0, 0.4), null] : [null, null] };
  } else if (phase === "after") {
    frAt = FR_LENS.clone(); frFacing = yawTo(FR_LENS, YF_TAKE);
  }
  if (phase === "free") frFacing = yawTo(FR_AT, JU_AT);
  fr.set({
    ...standing(frAt, frFacing, f, 3),
    ...frX,
    expr: faceAt(f, [[0, "worried"], [f02 - 2, "warn"], [f04 + REACT, "worried"], [f06 - 2, "weary"], [f07 - 2, "worried"], [endOf("F08") + REACT, "weary"]]),
    ...talk("fr", f, 3),
    head: accent("nod", f, endOf("F08") + REACT + 2) ?? undefined,
    gaze: phase === "letter" ? 0 : undefined,
    hide: [...((frX.hide as string[] | undefined) ?? []), "herbBasket"],
  });

  // ---------------------------------------------------------------- Juliet: steady beside him; snatches the vial
  const ju = w.actor(JULIET);
  const has = f >= tGive;
  const juFacing = f < f06 ? yawTo(JU_AT, FR_AT) + 0.35 : yawTo(JU_AT, frAt);
  const grab = ky(f, [[tGive - 8, 0], [tGive, 1], [tGive + 14, 0.25]]);
  // (v3b) the vial held in front of her middle, not off to her left: there her left drill curl swung into it as she
  // turned her head to the Friar (clearance v3a: the vial 2.4 cm into her hair, f3722-3861)
  ju.set({
    ...standing(JU_AT, juFacing, f, 2),
    pose: { kind: has ? "hold" : "idle", t: f / 30 },
    hands: grab > 0 && f < tGive + 14 ? [null, VIAL_UP.clone().lerp(rel(JU_AT, juFacing, 0.03, 0.76, 0.3), clamp01(1 - grab))] : has ? [null, rel(JU_AT, juFacing, 0.03, 0.76, 0.3)] : [null, null],
    expr: faceAt(f, [[0, "brave"], [f04 - 2, "bossy"], [endOf("F04") + REACT, "brave"]]),
    ...talk("ju", f, 2),
    hide: has ? [] : ["vial"],
  });

  // ---------------------------------------------------------------- the young friar
  const yf = w.actor(YOUNG_FRIAR);
  const yfIn = walkAlong([DOOR.at.clone().add(V(-0.35, 0, -0.1)), YF_WAIT], 1.2, (f - (f07 + 10)) / 30, { endFacing: yawTo(YF_WAIT, FR_LENS) });
  const yfTo = walkAlong([YF_WAIT, YF_TAKE], 1.3, (f - (endOf("F08") - 6)) / 30, { endFacing: yawTo(YF_TAKE, FR_LENS) });
  const yfOut = walkAlong([YF_TAKE, DOOR.at.clone().add(V(-0.5, 0, -0.15))], 1.5, (f - yfLeave) / 30);
  const yl = f < endOf("F08") - 6 ? yfIn : f < yfLeave ? yfTo : yfOut;
  const holding = f >= handAt;
  yf.set({
    ...standing(yl.at, yl.facing, f, 4),
    pose: yl.moving ? yl.pose : { kind: holding ? "hold" : "idle", t: f / 30 },
    hands: f >= handAt - 6 && f < handAt + 2 ? [rel(FR_LENS, frFacing, -0.1, 0.95, 0.42), null] : [null, null],
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
function room(w: Parameters<Segment["pose"]>[0], f: number) {
  w.setPlace("bedroom");
  const toast = wordAt("F09", "drink");
  // a touch wider than the set's spot and a little to her left, so the raised bottle stands clear of her hair (stills v6:
  // arms draw under the head, and at fov 44 the bottle hid behind her hair)
  const tc = { look: wv("bedroom", [0.08, 1.0, -1.0]), fov: 50 };
  const camera = povCam(f, [camAt("bedroom", "toast", JOIN.black, tc), camAt("bedroom", "toast", S.to, tc)], { mood: "calm", amp: 0.3 });
  w.setCamera(camera);
  const ju = w.actor(JULIET);
  const seat = seatOn(stoolSeat({ seat: 0.42, d: 0.4 }), BED.at, BED.facing);
  // the bottle: in her lap, raised to the lens like a toast on "drink", held out; it never comes back toward her
  const raise = ky(f, [[toast - 14, 0], [toast + 2, 1]]);
  const lap = rel(BED.at, BED.facing, 0.1, 0.58, 0.3), out = rel(BED.at, BED.facing, 0.36, 1.12, 0.36);
  ju.set({
    ...standing(seat.top.clone(), BED.facing, f, 2),
    ...seated(seat, f / 30),
    hands: [rel(BED.at, BED.facing, -0.1, 0.61, 0.3), lap.clone().lerp(out, easeInOutCubic(raise))],
    expr: faceAt(f, [[0, "brave"], [toast - 4, "sure"]]),
    ...talk("ju", f, 2),
    head: accent("nod", f, toast) ?? undefined,
  });
  w.update();
  const opening = f < JOIN.done ? doorWipe(1 - clamp01((f - JOIN.open) / (JOIN.done - JOIN.open))) : undefined;
  const top = f >= TOAST_CUT ? h("div", { style: { position: "absolute", inset: 0, background: "#000" } }) : undefined;
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
