// THE SCENES of 采访蒙娜丽莎的一天 as data: which room stands round her picture, what state the panel is in, who else is
// there and where the reporter stands. poseScene(w, scene, t) dresses the stage and poses the cast for one frame; the
// previews (preview/scenes.ts), the clipping checker's walk (kit.world.ts) and the shots all go through it.
import * as THREE from "three";
import type { Rig, RigHead, RigPose, RigState, RigSeat } from "../group/kit/rig3d";
import type { Expr } from "../group/kit/toon";
import type { CamPose } from "../../kit/day/types";
import type { World } from "./world";
import { MONA, LEONARDO, JESTER, NAPOLEON, THIEF, FACES, type Person } from "./people";
import { LIFT, WZ, SPOTS, PIC, MOODS, type Room, type Mount, type PanelState } from "./sets/stage";
import { setSeat } from "../../kit/acc/garb";

export type V3 = [number, number, number];
/** the pose of the panel: her body turned to her right, the face to us */
export const FACING = -0.5, GAZE = 0.5;
/** her hands (she stands at the origin, lifted by LIFT): the left forearm laid across, the right hand over its wrist */
export const CROSS: [V3, V3] = [[-0.035, 0.812 + LIFT, 0.222], [-0.135, 0.782 + LIFT, 0.185]];
/** the right hand at her jaw */
export const JAW: V3 = [-0.112, 1.062 + LIFT, 0.225];
export type Shot = { pos: V3; look: V3; fov: number };
/** where the reporter stands (her eye 1.5 m): the room, a step back, close on her, the theft, the bed */
export const SHOTS: Record<string, Shot> = {
  room: { pos: [0, 1.5, 5.0], look: [0, 1.3, WZ], fov: 38 },
  wide: { pos: [0.5, 1.5, 5.8], look: [0, 1.4, WZ], fov: 46 },
  close: { pos: [0, 1.5, 3.1], look: [0, 1.5, 0], fov: 24 },
  theft: { pos: [0.3, 1.5, 5.0], look: [0.2, 1.3, WZ], fov: 38 },
  bed: { pos: [-0.05, 1.5, 4.8], look: [-0.12, 1.12, WZ], fov: 40 },
};
export type Side = "leonardo" | "jester" | "napoleon" | "thief";
export const SIDE_PEOPLE: Record<Side, Person> = { leonardo: LEONARDO, jester: JESTER, napoleon: NAPOLEON, thief: THIEF };
export type Scene = {
  room: Room; mount: Mount; state: PanelState; cracks?: number; glass?: number; crowd?: number; stone?: number; cake?: number; soup?: number;
  night?: number; torch?: number[]; plate?: [string, string]; gone?: number;
  expr?: string; hands?: "cross" | "jaw"; who?: Side[]; shot?: string; gaze?: number;
  // (per-figure overrides, for the previews)
  facing?: number; blink?: number; jesterAt?: V3; thiefAt?: V3; thiefFacing?: number; thiefTurn?: number; thiefExpr?: string; thiefGaze?: number; thiefHands?: V3[]; leoHands?: V3[]; napExpr?: string; camPose?: Shot;
};
export const SCENES: Record<string, Scene> = {
  s1: { room: "studio", mount: "easel", state: "head", expr: "pose", gaze: 1.0 },
  s2: { room: "studio", mount: "easel", state: "body", expr: "tired", who: ["jester"] },
  s3: { room: "cloux", mount: "easel", state: "done", expr: "pose", who: ["leonardo"] },
  s4a: { room: "palace0", mount: "frame", state: "done", cracks: 0.2, plate: ["枫丹白露宫", "国王的收藏"], expr: "pose" },
  s4b: { room: "palace1", mount: "frame", state: "done", cracks: 0.3, plate: ["王宫", "国王的收藏"], expr: "tired" },
  s4c: { room: "palace2", mount: "frame", state: "done", cracks: 0.4, plate: ["卢浮宫", "大革命以后"], expr: "tired" },
  s4d: { room: "bedroom", mount: "frame", state: "done", cracks: 0.45, plate: ["杜伊勒里宫", "1800"], expr: "pose", who: ["napoleon"], shot: "bed", gaze: -0.6 },
  s5: { room: "salon", mount: "frame", state: "done", cracks: 0.65, plate: ["卢浮宫", "1911"], expr: "pose", who: ["thief"], shot: "theft", gaze: 0.8 },
  s5b: { room: "salon", mount: "frame", state: "done", plate: ["卢浮宫", "1911"], gone: 1, shot: "theft" },
  s6: { room: "louvre", mount: "frame", state: "done", cracks: 1, glass: 1, crowd: 1, plate: ["卢浮宫", ""], expr: "tired" },
  s6b: { room: "louvre", mount: "frame", state: "done", cracks: 1, glass: 1, crowd: 1, stone: 1, plate: ["卢浮宫", "1956"], expr: "caught" },
  s6c: { room: "louvre", mount: "frame", state: "done", cracks: 1, glass: 1, crowd: 1, cake: 1, plate: ["卢浮宫", "2022"], expr: "pose" },
  s6d: { room: "louvre", mount: "frame", state: "done", cracks: 1, glass: 1, crowd: 1, soup: 1, plate: ["卢浮宫", "2024"], expr: "tired" },
  s7: { room: "louvre", mount: "frame", state: "done", cracks: 1, glass: 1, plate: ["卢浮宫", ""], expr: "pose" },
  s8: { room: "louvre", mount: "frame", state: "done", cracks: 1, glass: 1, night: 0.72, torch: [0.08, 1.56, 1.0, 0.5], plate: ["卢浮宫", ""], expr: "sore", hands: "jaw" },
  s9: { room: "louvre", mount: "frame", state: "done", cracks: 1, glass: 1, night: 0.86, torch: [0.0, 1.6, 0.42, 1.0], plate: ["卢浮宫", ""], expr: "pose" },
};
export const SCENE_KEYS = Object.keys(SCENES);

const v = (a: V3) => new THREE.Vector3(a[0], a[1], a[2]);
/** dresses the stage for a scene: every param of the place */
export const dressScene = (w: World, sc: Scene) => {
  w.setPlace("stage");
  const p = (n: string, x: number | string) => w.set.param(n, x);
  p("room", sc.room); p("mount", sc.mount); p("state", sc.state); p("gone", sc.gone ?? 0);
  p("cracks", sc.cracks ?? 0); p("glass", sc.glass ?? 0); p("crowd", sc.crowd ?? 0);
  p("stone", sc.stone ?? 0); p("cake", sc.cake ?? 0); p("soup", sc.soup ?? 0);
  p("plateA", sc.plate?.[0] ?? ""); p("plateB", sc.plate?.[1] ?? "");
  if (sc.night !== undefined) p("night", sc.night);
  if (sc.torch) { p("torchX", sc.torch[0]); p("torchY", sc.torch[1]); p("torchR", sc.torch[2]); p("torchK", sc.torch[3]); }
};
/** her state in the picture: the pose of the panel, a face, the hands crossed or one at her jaw */
export const monaState = (sc: Pick<Scene, "expr" | "hands" | "gaze" | "facing" | "blink">, t: number): Partial<RigState> => {
  const e = sc.expr;
  const st: Partial<RigState> = { at: new THREE.Vector3(0, LIFT, 0), facing: sc.facing ?? FACING, gaze: sc.gaze ?? GAZE, visible: true, blink: sc.blink ?? 0 };
  st.expr = (e === undefined ? undefined : e in FACES ? FACES[e] : (e as Expr)) as RigState["expr"];
  if (sc.hands === "jaw") { st.hands = [v(JAW), v(CROSS[1])] as RigState["hands"]; st.armFront = [true, undefined]; st.head = { dy: -0.03, tilt: -5.5 } as RigHead; st.lean = { pitch: 0.07 } as RigState["lean"]; }
  else { st.hands = [v(CROSS[0]), v(CROSS[1])] as RigState["hands"]; st.armFront = [undefined, undefined]; st.head = {} as RigHead; st.lean = { pitch: 0 } as RigState["lean"]; }
  st.pose = { kind: "hold", t: 0.4 + t } as RigPose;
  return st;
};
/** Leonardo's hands on his lap in the chair (world; the right one, paralysed, lies a little apart) */
const LEO_HANDS: V3[] = [[-0.47, 0.5, 1.87], [-0.3, 0.5, 1.8]];
/** the thief of 1911: where he stands, and his right hand on the outer edge of the frame's right bar */
const THIEF_AT: V3 = [0.73, 0, 0.72], THIEF_HAND: V3 = [0.545, 1.0, 0.49];
/** the seat of the master's chair at Cloux, and of the bed's head where Napoleon sits up */
/** (he sits 11 cm forward of the seat's middle, so that his long hair clears the chair's back) */
export const chairSeat = (): RigSeat => { const ch = SPOTS.chair, f = 0.11; return { top: new THREE.Vector3(ch.at[0] + f * Math.sin(ch.yaw), ch.top, ch.at[2] + f * Math.cos(ch.yaw)), back: 0.05, front: 0.15, backrest: 0.33, backrestTop: ch.top + 0.9, floor: 0 }; };
export const bedSeat = (): RigSeat => { const b = SPOTS.bed; return { top: new THREE.Vector3(b.at[0], b.top, b.at[2]), back: 0.02, front: 0.9, floor: 0 }; };
/** one frame of a scene: the stage, she, the side cast. Returns the camera (the shot's, or the scene's own). */
export const poseScene = (w: World, sc: Scene, t: number): CamPose => {
  dressScene(w, sc);
  const rigs: Record<string, Rig> = {};
  if (!sc.gone) { rigs.mona = w.actor(MONA); rigs.mona.set(monaState(sc, t)); }
  const who: Side[] = sc.who ?? [];
  if (who.includes("jester")) w.actor(JESTER).set({ visible: true, at: v(sc.jesterAt ?? [-0.28, 0, 1.6]), facing: 0.35, pose: { kind: "cheer", t } as RigPose, expr: "smile" as Expr, gaze: 0.5 });
  if (who.includes("leonardo")) {
    const ch = SPOTS.chair, leo = w.actor(LEONARDO);
    // (the robe is told what he sits on: it lies over his thighs and hangs from the chair's front edge, kit acc/garb.ts)
    if (!leo.group.userData.monaSeated) { setSeat(leo, chairSeat(), ch.yaw); leo.group.userData.monaSeated = true; }
    leo.set({ visible: true, at: v(ch.at), facing: ch.yaw, seat: chairSeat(), pose: { kind: "sit", t } as RigPose, expr: "doze" as Expr, blink: 1, head: { tilt: 9, dy: -0.06 } as RigHead, lean: { pitch: 4 } as RigState["lean"],
      // (his hands lie on his lap, on top of the robe)
      hands: (sc.leoHands ?? LEO_HANDS).map((q) => v(q)) as RigState["hands"] });
  }
  if (who.includes("napoleon")) {
    const b = SPOTS.bed;
    w.actor(NAPOLEON).set({ visible: true, at: v(b.at), facing: 0.1, seat: bedSeat(), pose: { kind: "hold", t } as RigPose, expr: (sc.napExpr ?? "shock") as Expr, gaze: 0.9,
      hands: [v([b.at[0] - 0.13, b.top + 0.5, b.at[2] + 0.2]), v([b.at[0] + 0.13, b.top + 0.5, b.at[2] + 0.2])] as RigState["hands"] });
  }
  // (the thief stands beside the frame, facing us: one hand already on the frame's outer edge, a finger at his lips)
  if (who.includes("thief")) w.actor(THIEF).set({ visible: true, at: v(sc.thiefAt ?? THIEF_AT), facing: sc.thiefFacing ?? -0.45, pose: { kind: "shh", arm: 1, t } as RigPose, expr: (sc.thiefExpr ?? "hush") as Expr, gaze: sc.thiefGaze ?? -0.2,
    head: { tilt: 6 } as RigHead, hands: [v((sc.thiefHands?.[0] ?? THIEF_HAND) as V3), null] as RigState["hands"] });
  const s = sc.camPose ?? SHOTS[sc.shot ?? "room"];
  if (!s) throw new Error(`scenes: no shot called ${sc.shot}`);
  return { pos: s.pos, look: s.look, fov: s.fov };
};
/** the page's background for a scene's room */
export const sceneBg = (sc: Scene) => MOODS[sc.room].bg;
