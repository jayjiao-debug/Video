// THE PROPS of the Newton film (props/index.ts + props/things.ts, WP3) seen through the film's own World: labelled
// sheets of every prop, and the props IN USE (the desk, the plate on the window table, held with holdPoints /
// handWorld, the elaboratory at night). One "frame" = one view (frame i of the page = views[i]):
//   bash scripts/kit/queue/still.sh src/videos/newton/preview/props_sheet.ts /home/user/newton_work/film/wp3/props/ --pick 0,1,2,3,4,5 --size 540x960 --opts '{"font":"/home/user/newton_film/public/bt/sans700.ttf"}'
// Views (VIEW_NAMES):
//   small   the hand props floating in a sheet in the room (morning): quill, inkwell, ink bottle, fork, knife, the
//           plate (lid off, one bite) and its lid, candles (new, lit; a stub), charcoal, handkerchief, flask,
//           crucible (hot), the mic, her hands (grip; open)
//   big     the big props on the room floor: chair, stool, sacks (full; empty; dropped and slumped), shovel (load),
//           poker (hot), board, bellows (open 0.5), drafts, books n 4, old book, sheets n 5, notes
//   desk    the room at ROOM_CAMS.desk (morning): NEWTON writing standing (quill in hand), drafts, inkwell, sheets,
//           books, notes and the chair behind him; the mic held toward him (cam.ts putMic)
//   plate   ROOM_CAMS.plate (evening): the plate on the window table with two bites gone and the fly, the lid, fork
//           and knife beside it
//   hold    the room: NEWTON with a lit candle (grip) and the notes (grip), HUMPHREY with the covered plate (pair),
//           sooty HUMPHREY with the full sack (neck)
//   elab    the elaboratory at night (ELAB_CAMS.wide): NEWTON on the stool, the board on his knee and the charcoal in
//           his hand; sooty HUMPHREY with the loaded shovel (pair); the poker in the fire door, the empty sack
// Options (preview/common.ts adds w, h, ink, ao, raw, cam): views, labels (false = none), t (seconds: the fly, flames).
// Prints  QA: view <i> <name> | reach / clear of each figure | screen points of the props (x/y % of the frame)
import * as THREE from "three";
import { preview } from "./common";
import { World } from "../world";
import { ROOM, ROOM_CAMS, RMX } from "../layout/room";
import { ELAB, ELAB_CAMS } from "../layout/elaboratory";
import { standing, rel, V } from "../shots/common";
import { NEWTON_INK, NEWTON_HIDE, HUMPHREY, HUMPHREY_SOOT, NEWTON_GOWN } from "../people";
import { holdPoints, STOOL } from "../props";
import { putMic } from "../cam";
import { FONT } from "../../../kit/props/kit";
import type { Place, CamPose } from "../story";
import type { Rig } from "../../group/kit/rig3d";

export type Lab = (text: string, at: THREE.Vector3, size?: number) => void;
export type View = { place: Place; params?: Record<string, string | number | boolean>; cam: CamPose; f: number; pose(w: World, f: number, lab: Lab, o: Record<string, any>): Rig[] };
const cm = (pos: [number, number, number], look: [number, number, number], fov: number): CamPose => ({ pos, look, fov });
const cp = (c: { pos: [number, number, number]; look: [number, number, number]; fov: number }): CamPose => ({ pos: c.pos, look: c.look, fov: c.fov });
/** a point in the room, x from the room's middle line */
const R = (x: number, y: number, z: number) => V(RMX + x, y, z);

export const VIEWS: Record<string, View> = {
  small: {
    place: "room", params: { hour: "morning" }, cam: cm([RMX, 1.0, 1.75], [RMX, 0.98, -1], 50), f: 0,
    pose(w, f, lab, o) {
      // five rows of three, floating in a sheet 1.7 m from the lens
      const z = 0.05, t = o.t ?? 1, X = [-0.28, 0, 0.28], s = 0.05;
      w.prop("quill").put(R(X[0], 1.5, z), { rot: [0, 0, 0.25] }); lab("quill", R(X[0], 1.76, z), s);
      w.prop("candle").put(R(X[1] - 0.06, 1.47, z), { len: 1, t }); w.prop("candle", "stub").put(R(X[1] + 0.09, 1.47, z), { len: 0.1, t }); lab("candle len 1 · 0.1", R(X[1], 1.76, z), s);
      w.prop("handkerchief").put(R(X[2], 1.66, z)); lab("handkerchief", R(X[2], 1.76, z), s);
      w.prop("inkwell").put(R(X[0] - 0.05, 1.18, z)); w.prop("inkBottle").put(R(X[0] + 0.08, 1.14, z)); lab("inkwell · bottle", R(X[0], 1.34, z), s);
      w.prop("flask").put(R(X[1], 1.1, z)); lab("flask", R(X[1], 1.4, z), s);
      w.prop("crucible").put(R(X[2], 1.16, z), { hot: 1 }); lab("crucible hot", R(X[2], 1.34, z), s);
      w.prop("plate").put(R(X[0] + 0.03, 0.84, z), { rot: [0.5, 0, 0], bites: 1, lid: 0 }); lab("plate bites 1", R(X[0], 1.0, z), s);
      w.prop("lid").put(R(X[1] + 0.04, 0.8, z), { rot: [0.35, 0, 0] }); lab("lid", R(X[1], 1.0, z), s);
      w.prop("charcoal").put(R(X[2], 0.86, z), { rot: [0, 0, 0.9] }); lab("charcoal", R(X[2], 1.0, z), s);
      w.prop("fork").put(R(X[0] - 0.05, 0.6, z), { rot: [0, 0, -0.3] }); w.prop("knife").put(R(X[0] + 0.07, 0.6, z), { rot: [0, 0, 0.3] }); lab("fork · knife", R(X[0], 0.73, z), s);
      w.prop("mic").put(R(X[1], 0.56, z), { rot: [0, 0, -0.35] }); lab("mic", R(X[1], 0.73, z), s);
      w.prop("hand").put(R(X[2] - 0.06, 0.34, z), { rot: [0, -0.5, 0], pose: "grip" }); w.prop("handR").put(R(X[2] + 0.1, 0.32, z - 0.05), { rot: [0, 0.5, 0], pose: "open" }); lab("hand · handR", R(X[2], 0.44, z), s);
      return [];
    },
  },
  big: {
    place: "room", params: { hour: "morning" }, cam: cm([RMX, 1.7, 2.05], [RMX, 0.3, -0.5], 62), f: 0,
    pose(w, f, lab) {
      // the back row on the floor
      w.prop("chair").put(R(-0.6, 0, -0.6), { rot: 0.5 }); lab("chair", R(-0.6, 1.08, -0.6), 0.08);
      w.prop("stool").put(R(-0.2, 0, -0.55)); lab("stool", R(-0.2, 0.55, -0.55), 0.08);
      w.prop("sack").put(R(0.25, 0, -0.55), { full: 1 }); lab("sack full", R(0.25, 0.68, -0.55), 0.08);
      w.prop("bellows").put(R(0.7, 0.62, -0.55), { open: 0.5, rot: [0, -0.9, 0] }); lab("bellows open .5", R(0.7, 0.8, -0.55), 0.08);
      w.prop("shovel").put(R(0.82, 0.5, -0.25), { load: true, rot: [0, 0.6, 0] }); lab("shovel load", R(0.82, 1.2, -0.25), 0.08);
      w.prop("poker").put(R(-0.85, 0.38, -0.05), { hot: 1, rot: [0, 0, 0.1] }); lab("poker hot", R(-0.85, 1.12, -0.05), 0.08);
      // the middle row
      w.prop("sack", "empty").put(R(-0.6, 0, 0.12), { full: 0, rot: 0.3 }); lab("sack full 0", R(-0.6, 0.12, 0.12), 0.07);
      w.prop("sack", "slump").put(R(-0.05, 0, 0.1), { full: 1, slump: true }); lab("slump", R(-0.05, 0.4, 0.1), 0.07);
      w.prop("board").put(R(0.5, 0.2, 0.1), { rot: [-0.35, -0.2, 0] }); lab("board", R(0.5, 0.42, 0.1), 0.07);
      // the front row: the paper
      w.prop("drafts").put(R(-0.62, 0, 0.62), { rot: 0.2 }); lab("drafts", R(-0.62, 0.17, 0.62), 0.06);
      w.prop("books").put(R(-0.3, 0, 0.62), { n: 4 }); lab("books n4", R(-0.3, 0.26, 0.62), 0.06);
      w.prop("oldBook").put(R(0.05, 0, 0.62), { rot: 0.2 }); lab("old book", R(0.05, 0.12, 0.62), 0.06);
      w.prop("sheets").put(R(0.36, 0, 0.66), { n: 5 }); lab("sheets n5", R(0.36, 0.1, 0.66), 0.06);
      w.prop("notes").put(R(0.62, 0.011, 0.62), { rot: -0.3 }); lab("notes", R(0.62, 0.1, 0.62), 0.06);
      return [];
    },
  },
  desk: {
    place: "room", params: { hour: "morning" }, cam: cp(ROOM_CAMS.desk), f: 200,
    pose(w, f) {
      const nt = w.actor(NEWTON_INK), p = ROOM.newtonDesk, wr = ROOM.deskWrite;
      // he writes standing, bent over the page: the right hand on the page, the left flat beside it
      // (ROOM.deskWrite is out of his reach from ROOM.newtonDesk: the hands go on the desk's back band, 0.3 m from him)
      const page = V(wr.x, ROOM.deskTop, p.z + 0.36), hR = page.clone().add(V(-0.06, 0.06, 0)), hL = page.clone().add(V(0.16, 0.03, 0.01));
      nt.set({ ...standing(p, 0, f, 1), expr: "focus", lookDown: 0.7, hands: [hR, hL], hide: NEWTON_HIDE });
      w.prop("drafts").put(ROOM.drafts, { rot: 0.15 });
      w.prop("inkwell").put(ROOM.inkwell);
      w.prop("sheets").put(page, { n: 3, rot: 0.1 });
      w.prop("notes").put(ROOM.inkwell.clone().add(V(0.25, 0.011, 0.05)), { rot: -0.5 });
      w.prop("chair").put(ROOM.chair, { rot: ROOM.chairFacing });
      w.update();
      w.prop("quill").put(nt.handWorld(0), { grip: "hilt", rot: [0.5, 0, -0.35] });
      putMic(w, ROOM_CAMS.desk as CamPose, f, { aim: nt.headWorld().add(V(0, -0.1, 0.05)) });
      return [nt];
    },
  },
  plate: {
    place: "room", params: { hour: "evening" }, cam: cp(ROOM_CAMS.plate), f: 300,
    pose(w, f, lab, o) {
      const t = o.t ?? 2.4;
      w.prop("plate").put(ROOM.plate, { bites: 2, lid: 0, fly: 1, t });
      w.prop("lid").put(ROOM.plate.clone().add(V(-0.27, 0, -0.05)));
      w.prop("fork").put(ROOM.plate.clone().add(V(0.17, 0.006, 0.02)), { rot: [Math.PI / 2, 0.1, 0] });
      w.prop("knife").put(ROOM.plate.clone().add(V(0.2, 0.006, 0.02)), { rot: [Math.PI / 2, -0.05, 0] });
      return [];
    },
  },
  hold: {
    place: "room", params: { hour: "noon" }, cam: cm([RMX, 1.3, 2.05], [RMX, 0.78, -0.6], 62), f: 300,
    pose(w, f, lab) {
      const out: Rig[] = [];
      // NEWTON: a lit candle in his right hand, the notes in his left
      const pN = R(-0.45, 0, -0.45), nt = w.actor(NEWTON_GOWN), cN = rel(pN, 0.25, -0.14, 0.9, 0.24), nN = rel(pN, 0.25, 0.24, 0.62, 0.06);
      nt.set({ ...standing(pN, 0.25, f, 1), expr: "deadpan", hands: [cN, nN], hide: NEWTON_HIDE }); out.push(nt);
      // HUMPHREY with the covered plate in both hands
      const pH = R(0.0, 0, -0.45), hm = w.actor(HUMPHREY), cH = rel(pH, 0, 0, 0.74, 0.26), hH = holdPoints("plate", cH, { grip: "pair" });
      hm.set({ ...standing(pH, 0, f, 2), expr: "smile", hands: [hH[0], hH[1]] }); out.push(hm);
      // sooty HUMPHREY with the full sack by its neck
      const pS = R(0.55, 0, -0.45), hs = w.actor(HUMPHREY_SOOT), nS = rel(pS, -0.2, -0.22, 0.62, 0.12);
      hs.set({ ...standing(pS, -0.2, f, 3), expr: "neutral", hands: [nS, null] }); out.push(hs);
      w.update();
      w.prop("candle").put(nt.handWorld(0), { grip: "grip", len: 0.8, rot: 0.25, t: f / 30 }); lab("candle · grip", R(-0.45, 1.72, -0.45), 0.07);
      w.prop("notes").put(nt.handWorld(1), { grip: "grip", rot: [Math.PI / 2, 0.25 + Math.PI / 2, 0] }); lab("notes · grip", R(-0.45, 1.6, -0.45), 0.07);
      w.prop("plate").put(cH, { grip: "pair", lid: 1 }); lab("plate · pair", R(0.0, 1.6, -0.45), 0.07);
      w.prop("sack").put(hs.handWorld(0), { grip: "neck", full: 1, rot: -0.2 }); lab("sack · neck", R(0.55, 1.6, -0.45), 0.07);
      return out;
    },
  },
  elab: {
    place: "elaboratory", cam: cp(ELAB_CAMS.wide), f: 400,
    pose(w, f) {
      const out: Rig[] = [];
      // NEWTON on the stool, the board on his knee (drawn face up, its top toward him: upright to a camera in front)
      const st = ELAB.stool, fa = ELAB.stoolFacing, nt = w.actor(NEWTON_GOWN);
      w.prop("stool").put(st, { rot: fa });
      const bd = rel(st, fa, 0, STOOL.seat + 0.13, 0.27), bRot: [number, number, number] = [-Math.PI / 2 - 0.3, fa, 0];
      const hC = rel(st, fa, -0.06, STOOL.seat + 0.19, 0.3), hB = rel(st, fa, 0.2, STOOL.seat + 0.15, 0.25);
      nt.set({ ...standing(st, fa, f, 1), seat: { top: V(st.x, STOOL.seat, st.z), front: 0.12 }, pose: { kind: "sit", t: f / 30 }, expr: "focus", lookDown: 0.8, hands: [hC, hB], hide: NEWTON_HIDE });
      out.push(nt);
      w.prop("board").put(bd, { rot: bRot });
      // sooty HUMPHREY scooping charcoal from the heap (turned from ELAB.humphreyFacing so the shovel shows)
      const pH = ELAB.humphreyShovel, fh = -0.9, hm = w.actor(HUMPHREY_SOOT);
      const sc = rel(pH, fh, 0.03, 0.78, 0.3), sRot: [number, number, number] = [Math.PI - 0.75, fh, 0], sH = holdPoints("shovel", sc, { grip: "pair", rot: sRot });
      hm.set({ ...standing(pH, fh, f, 2), expr: "neutral", hands: [sH[1], sH[0]] }); out.push(hm);
      w.prop("shovel").put(sc, { grip: "pair", rot: sRot, load: true });
      w.prop("sack").put(ELAB.charcoal.clone().add(V(0.55, 0, -0.35)), { full: 0, rot: 0.8 });
      w.prop("poker").put(ELAB.furnaceDoor.clone().add(V(0.25, -0.1, 0.18)), { hot: 1, rot: [1.2, -Math.PI / 2, 0] });
      w.update();
      w.prop("charcoal").put(nt.handWorld(0), { grip: "hilt", rot: [0.6, fa, 0] });
      return out;
    },
  },
};
export const VIEW_NAMES = Object.keys(VIEWS);

/** a view's QA line: each figure's rig.qa and the props' screen points */
export const qaLine = (w: World, figs: Rig[]) => {
  const pct = (p: THREE.Vector3) => { const q = w.project(p); return `${((100 * q.x) / 1080).toFixed(1)}/${((100 * q.y) / 1920).toFixed(1)}`; };
  const f = figs.map((r) => `reach ${r.qa.reach.toFixed(4)} clear ${r.qa.clear.toFixed(4)} held ${r.qa.held.toFixed(3)}`).join("; ");
  const props: string[] = [];
  w.props.group.children.forEach((g) => { if (g.visible) props.push(`${g.name.slice(5)} ${pct(g.getWorldPosition(V()))}`); });
  return `${f} | ${props.join(", ")}`;
};

if (typeof window !== "undefined") preview({ w: 540, h: 960 }, (c) => {
  const w = new World(c.renderer, c.camera);
  c.scene.add(w.root);
  const o = c.opts, names: string[] = o.views ?? VIEW_NAMES;
  const labG = new THREE.Group(); c.scene.add(labG);
  const labs = new Map<string, THREE.Mesh>();
  const lab: Lab = (text, at, size = 0.11) => {
    if (o.labels === false) return;
    let m = labs.get(text);
    if (!m) {
      const cv = document.createElement("canvas"); cv.width = 640; cv.height = 96;
      const g = cv.getContext("2d")!; g.font = `700 60px ${FONT}`; g.textAlign = "center"; g.textBaseline = "middle"; g.lineJoin = "round";
      g.strokeStyle = "#1c1822"; g.lineWidth = 12; g.strokeText(text, 320, 50); g.fillStyle = "#ffffff"; g.fillText(text, 320, 50);
      const tx = new THREE.CanvasTexture(cv); tx.colorSpace = THREE.SRGBColorSpace;
      m = new THREE.Mesh(new THREE.PlaneGeometry(640 / 96, 1), new THREE.MeshBasicMaterial({ map: tx, transparent: true, depthTest: false, depthWrite: false, toneMapped: false }));
      m.layers.set(3); m.renderOrder = 50; labs.set(text, m); labG.add(m);
    }
    m.visible = true; m.position.copy(at); m.scale.setScalar(size); m.quaternion.copy(c.camera.quaternion);
  };
  const pose = (i: number) => {
    const name = names[((i % names.length) + names.length) % names.length], v = VIEWS[name];
    if (!v) throw new Error(`props_sheet: no view "${name}" (there are: ${VIEW_NAMES.join(", ")})`);
    for (const m of labs.values()) m.visible = false;
    w.beginFrame(v.f);
    w.setPlace(v.place);
    for (const [k, val] of Object.entries(v.params ?? {})) w.set.param(k, val);
    w.setCamera(v.cam);
    const figs = v.pose(w, v.f, lab, o);
    w.endFrame({ camera: v.cam });
    console.log(`QA: view ${i} ${name} | ${qaLine(w, figs)}`);
  };
  return { cam: null, frame: (i) => pose(i), ao: () => w.look().ao, bg: () => w.look().bg };
});
