// HER CAMERA, MIC AND HANDS (cam.ts, WP3) through the film's own World: the first-person mic + hand in their poses, and
// the free hand's actions. The preview harness has no lens blur and no HUD: the aside's dof is PRINTED (the film draws
// it), and with guides (default on) a translucent strip shows the subtitle band (layout.ts SCREEN.capTop..capBottom)
// and a red line the mic's limit (y 1190). One "frame" = one test (TESTS[i]):
//   bash scripts/kit/queue/still.sh src/videos/newton/preview/cam_test.ts /home/user/newton_work/film/wp3/cam/ --pick 0,1,2,3,4,5,6,7,8,9,10 --size 540x960
//   0 rest          room (morning), NEWTON at the desk, the mic at rest (no aim)
//   1 aim newton    the same, the mic held toward his mouth
//   2 aside         the mic turned to the lens (dof printed: focus on the mic, he goes soft)
//   3 aside half    the swing round, half way (lens 0.5)
//   4 enter         the mic entering from the lower left (enter 0.45)
//   5 rap           the stairs: the mic's head on the door's knock point (rap 1)
//   6 drafts        room: aimed at the drafts stack, tilted 12 deg
//   7 humphrey      the stairs, from beside his door: held toward HUMPHREY on the landing
//   8 chair         room, from the corner by the bookcase: her right hand on the chair's rail mid-drag toward NEWTON's knees
//   9 wipe          room: the handkerchief on his nose, mid first stroke (NEWTON_GOWN_INK close)
//   10 board        room at night: the board held up close in both hands
//   11 clap         room: she claps (the right palm on the back of the mic hand)
// Options: tests (names or indices), guides (false = none).
// Prints  QA: test <i> <name> | mic head px x/y r, bottom edge, dof | hand px | his head px
import * as THREE from "three";
import { preview } from "./common";
import { World } from "../world";
import { ROOM, ROOM_CAMS, RMX } from "../layout/room";
import { STAIRS, STAIRS_CAMS, STX } from "../layout/stairs";
import { SCREEN } from "../layout";
import { standing, headPx, rel, V } from "../shots/common";
import { NEWTON_INK, NEWTON_GOWN_INK, NEWTON, HUMPHREY, NEWTON_HIDE, newtonHide } from "../people";
import { CHAIR } from "../props";
import { putMic, chairDrag, wipe, noseOf, boardHold, clapHands, camFrame, fromScreen, camToWorld, toScreen, type MicO } from "../cam";
import type { CamPose, Place } from "../story";

type Test = { name: string; place: Place; params?: Record<string, string | number | boolean>; cam: CamPose; f: number; run(w: World, cam: CamPose, f: number): string };
const cp = (c: { pos: [number, number, number]; look: [number, number, number]; fov: number }): CamPose => ({ pos: c.pos, look: c.look, fov: c.fov });
const mouth = (h: THREE.Vector3) => h.clone().add(V(0, -0.08, 0.05));
/** NEWTON at the desk (standing, writing: looking down) */
const atDesk = (w: World, f: number, who = NEWTON_INK) => {
  const r = w.actor(who);
  r.set({ ...standing(ROOM.newtonDesk, 0, f, 1), expr: "focus", hide: NEWTON_HIDE, lookDown: 0.6 });
  return r;
};
const micTest = (o: (w: World) => MicO, who?: () => THREE.Vector3 | null) => (w: World, cam: CamPose, f: number) => {
  w.update();
  const M = putMic(w, cam, f, o(w));
  const hp = toScreen(cam, M.hand.at);
  void who;
  return `mic head ${M.headPx.x.toFixed(0)}/${M.headPx.y.toFixed(0)} r ${M.headPx.r.toFixed(0)} bottom ${(M.headPx.y + M.headPx.r).toFixed(0)} | dof ${M.dof ? `${M.dof.focus.toFixed(2)} m x ${M.dof.amount.toFixed(1)}` : "none"} | hand ${hp.x.toFixed(0)}/${hp.y.toFixed(0)} d ${hp.z.toFixed(2)}`;
};
const DESK = cp(ROOM_CAMS.desk);
/** close on him in the room's middle: her eyes about 1 m from his face, looking down at it (his eyes 1.14 m) */
const CLOSE: CamPose = { pos: [RMX - 0.3, 1.5, 1.2], look: [RMX - 0.3, 0.98, 0.1], fov: 62 };
const closeAt = V(RMX - 0.3, 0, 0.1);
/** C: she has come round the desk's right end into the corner by the bookcase (0.17 m off the back wall) and drags
 *  the chair left along the wall to the backs of his knees: mid-drag, the chair 0.45 m short of ROOM.chair, turned a
 *  little; he stands writing on the left of the frame */
const CHAIR_AT = ROOM.chair.clone().add(V(0.45, 0, 0)), CHAIR_YAW = 0.35;
const CHAIR_CAM: CamPose = { pos: [ROOM.chair.x + 1.0, 1.45, ROOM.chair.z - 0.06], look: [ROOM.chair.x + 0.2, 0.5, ROOM.chair.z + 0.05], fov: 62 };
/** A: from beside his door, the mic held across the landing to HUMPHREY by the window */
const HUM_CAM: CamPose = { pos: [STX + 0.3, 1.6, -0.1], look: [STX - 0.5, 1.0, -0.78], fov: 62 };

export const TESTS: Test[] = [
  { name: "rest", place: "room", params: { hour: "morning" }, cam: DESK, f: 100, run: (w, c, f) => { atDesk(w, f); return micTest(() => ({}))(w, c, f); } },
  { name: "aim newton", place: "room", params: { hour: "morning" }, cam: DESK, f: 100, run: (w, c, f) => { const r = atDesk(w, f); w.update(); return micTest(() => ({ aim: mouth(r.headWorld()) }))(w, c, f); } },
  { name: "aside", place: "room", params: { hour: "morning" }, cam: DESK, f: 100, run: (w, c, f) => { atDesk(w, f); return micTest(() => ({ aim: "lens" }))(w, c, f); } },
  { name: "aside half", place: "room", params: { hour: "morning" }, cam: DESK, f: 100, run: (w, c, f) => { const r = atDesk(w, f); w.update(); return micTest(() => ({ aim: mouth(r.headWorld()), lens: 0.5 }))(w, c, f); } },
  { name: "enter", place: "room", params: { hour: "morning" }, cam: DESK, f: 100, run: (w, c, f) => { const r = atDesk(w, f); w.update(); return micTest(() => ({ aim: mouth(r.headWorld()), enter: 0.45 }))(w, c, f); } },
  { name: "rap", place: "stairs", cam: cp(STAIRS_CAMS.door), f: 100, run: (w, c, f) => micTest(() => ({ aim: STAIRS.knock.clone().add(V(0, 0.22, 0)), rap: 1 }))(w, c, f) },
  { name: "drafts", place: "room", params: { hour: "morning" }, cam: cp(ROOM_CAMS.drafts), f: 100, run: (w, c, f) => { atDesk(w, f); w.prop("drafts").put(ROOM.drafts); return micTest(() => ({ aim: ROOM.drafts.clone().add(V(0, 0.09, 0)), tilt: 12 }))(w, c, f); } },
  { name: "humphrey", place: "stairs", cam: HUM_CAM, f: 100, run: (w, c, f) => {
    const h = w.actor(HUMPHREY); h.set({ ...standing(STAIRS.humphrey, STAIRS.humphreyFacing, f, 2), expr: "shock" });
    w.prop("inkBottle").put(STAIRS.humphrey.clone().add(V(0.25, 0.75, 0.15)));
    w.update(); return micTest(() => ({ aim: mouth(h.headWorld()) }))(w, c, f);
  } },
  { name: "chair", place: "room", params: { hour: "noon" }, cam: CHAIR_CAM, f: 100, run: (w, c, f) => {
    atDesk(w, f, NEWTON_INK);
    w.prop("chair").put(CHAIR_AT, { rot: CHAIR_YAW });
    const H = chairDrag(c, CHAIR_AT, CHAIR_YAW); w.prop("handR").put(H.at, { rot: H.rot, pose: H.pose });
    const s = micTest(() => ({ enter: 1 }))(w, c, f);
    const hp = toScreen(c, H.at);
    return `${s} | right hand ${hp.x.toFixed(0)}/${hp.y.toFixed(0)} d ${hp.z.toFixed(2)} (rail ${CHAIR.rail[1]} m)`;
  } },
  { name: "wipe", place: "room", params: { hour: "evening" }, cam: CLOSE, f: 112, run: (w, c, f) => {
    const r = w.actor(NEWTON_GOWN_INK); r.set({ ...standing(closeAt, 0, f, 1), expr: "deadpan", hide: newtonHide({}) });
    w.update();
    const nose = noseOf(r);
    const Wp = wipe(c, f, nose, 100);
    if (Wp) { w.prop("handR").put(Wp.hand.at, { rot: Wp.hand.rot, pose: "grip", scale: Wp.hand.scale }); w.prop("handkerchief").put(Wp.cloth.at, { rot: Wp.cloth.rot, scale: Wp.cloth.scale }); }
    const s = micTest(() => ({ aim: mouth(r.headWorld()) }))(w, c, f);
    return `${s} | wipe strokes ${Wp?.strokes.join(",")} cloth ${Wp ? toScreen(c, Wp.cloth.at).x.toFixed(0) + "/" + toScreen(c, Wp.cloth.at).y.toFixed(0) : "-"}`;
  } },
  { name: "board", place: "room", params: { hour: "night" }, cam: CLOSE, f: 100, run: (w, c, f) => {
    const r = w.actor(NEWTON); r.set({ ...standing(rel(closeAt, 0, 0, 0, -1.2), 0, f, 1), expr: "deadpan", hide: NEWTON_HIDE });
    w.update();
    const B = boardHold(c, f, { k: 1 });
    w.prop("board").put(B.board.at, { rot: B.board.rot });
    w.prop("handR").put(B.hand.at, { rot: B.hand.rot, pose: "grip" }); w.prop("hand").put(B.handL.at, { rot: B.handL.rot, pose: "grip" });
    const bp = toScreen(c, B.board.at);
    return `board middle ${bp.x.toFixed(0)}/${bp.y.toFixed(0)} d ${bp.z.toFixed(2)}`;
  } },
  { name: "clap", place: "room", params: { hour: "evening" }, cam: DESK, f: 100, run: (w, c, f) => {
    atDesk(w, f, NEWTON);
    w.update();
    const C = clapHands(c, f, [101]);
    w.prop("mic").put(C.mic.at, { rot: C.mic.rot }); w.prop("hand").put(C.hand.at, { rot: C.hand.rot, pose: "grip" }); w.prop("handR").put(C.handR.at, { rot: C.handR.rot, pose: "open" });
    const p = toScreen(c, C.handR.at);
    return `right palm ${p.x.toFixed(0)}/${p.y.toFixed(0)} d ${p.z.toFixed(2)}`;
  } },
];

if (typeof window !== "undefined") preview({ w: 540, h: 960 }, (c) => {
  const w = new World(c.renderer, c.camera);
  c.scene.add(w.root);
  const o = c.opts, want: (string | number)[] | undefined = o.tests;
  const list = want ? want.map((x) => (typeof x === "number" ? TESTS[x] : TESTS.find((t) => t.name === x)!)).filter(Boolean) : TESTS;
  // the guides: a translucent strip over the subtitle band and a red line at the mic's limit, 0.1 m in front of the lens
  const guide = new THREE.Group(); c.scene.add(guide);
  const bandM = new THREE.MeshBasicMaterial({ color: "#20304a", transparent: true, opacity: 0.28, depthTest: false, depthWrite: false });
  const lineM = new THREE.MeshBasicMaterial({ color: "#ff3030", transparent: true, opacity: 0.8, depthTest: false, depthWrite: false });
  const band = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), bandM), line = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), lineM);
  band.renderOrder = line.renderOrder = 999; guide.add(band, line);
  const place = (m: THREE.Mesh, cam: CamPose, y0: number, y1: number) => {
    const F = camFrame(cam), d = 0.1, a = fromScreen(F, 540, (y0 + y1) / 2, d), wpx = fromScreen(F, 1080, 0, d).x * 2, hpx = Math.abs(fromScreen(F, 0, y0, d).y - fromScreen(F, 0, y1, d).y);
    m.position.copy(camToWorld(F, a.x, a.y, a.z)); m.quaternion.copy(c.camera.quaternion); m.scale.set(wpx, Math.max(hpx, 1e-4), 1);
  };
  const pose = (i: number) => {
    const T = list[((i % list.length) + list.length) % list.length], f = T.f;
    w.beginFrame(f);
    w.setPlace(T.place);
    for (const [k, v] of Object.entries(T.params ?? {})) w.set.param(k, v);
    w.setCamera(T.cam);
    const s = T.run(w, T.cam, f);
    w.endFrame({ camera: T.cam });
    guide.visible = o.guides !== false;
    if (guide.visible) { place(band, T.cam, SCREEN.capTop, SCREEN.capBottom); place(line, T.cam, 1189, 1191); }
    const nt = [NEWTON, NEWTON_INK, NEWTON_GOWN_INK].map((p) => w.actor(p)).find((r) => r.state.visible !== false && r.group.visible);
    const hp = nt ? headPx(w, nt) : null;
    console.log(`QA: test ${i} ${T.name} f${f} | ${s}${hp ? ` | his head ${hp.x.toFixed(0)}/${hp.y.toFixed(0)} r ${hp.r.toFixed(0)}` : ""}`);
  };
  return { cam: null, frame: (i) => pose(i), ao: () => w.look().ao, bg: () => w.look().bg };
});
