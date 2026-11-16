// THE PROPS of the Qin film (props/index.ts + props/things.ts, WP3) seen through the film's own World: labelled sheets
// of every prop, and the props IN USE (held with holdPoints / handWorld, the desk seat, the scale's pan, the road's
// carriage). A copy of Wanbi's preview/props_sheet.ts. One "frame" = one view (frame i of the page = views[i]):
//   bash scripts/kit/queue/still.sh src/videos/qin/preview/props_sheet.ts /home/user/qin_work/wp3/props/ --pick 0,1,2,3,4,5 --size 540x960
//   bash scripts/kit/queue/still.sh src/videos/qin/preview/props_sheet.ts /home/user/qin_work/wp3/road.png --size 540x960 --opts '{"views":["road"]}'
// Views (VIEW_NAMES):
//   small   the hand props on the hall floor: sword, scabbard (with its hilt / empty), knife, the sea chart open 1 and
//           0.4, bolt, brush, crossbow; on the floor: one slip bundle, the ink stone, the sand-table fish, boat, pine + hat
//   big     the steelyard scale (tilt 0.2), slip towers of 4 and 9, the desk with its cushion, ink stone and brush, the
//           railing, a lantern, a halberd, a basket of salted fish with its flies
//   use     the hall at its stand-in camera: the EMPEROR writing at the desk on the cushion (deskSeat, the brush in his
//           hand, his scabbard lying beside him), the scale with a bundle in its pan (scalePanLocal), the slip towers
//   hold    the EMPEROR with the sword (hilt), XU FU with the chart open (pair), the attendant with a bundle (pair)
//   arms    the EMPEROR with the crossbow (pair), the BANDIT with the knife (hilt), the official with a halberd (grip)
//   road    the road at G01's camera: the closed carriage (curtain open 0.6), a basket on its rack, the fish cart with
//           its flies, a small carriage far off
// Options (preview/common.ts adds w, h, ink, ao, raw, cam): views, labels (false = none).
// Prints  QA: view <i> <name> | reach / clear of each figure | screen points of the props (x/y % of the frame)
import * as THREE from "three";
import { preview } from "./common";
import { World } from "../world";
import { QHALL, HALL_STAND } from "../layout/hall";
import { ROAD, ROAD_CAMS, RX } from "../layout/road";
import { standing, rel, PEOPLE, V } from "../shots/common";
import { holdPoints, deskSeat, scalePan, DESK } from "../props";
import { FONT } from "../../../kit/props/kit";
import type { Place, CamPose } from "../story";
import type { Rig } from "../../group/kit/rig3d";

export type Lab = (text: string, at: THREE.Vector3, size?: number) => void;
export type View = { place: Place; cam: CamPose; f: number; pose(w: World, f: number, lab: Lab, o: Record<string, any>): Rig[] };
const cm = (pos: [number, number, number], look: [number, number, number], fov: number): CamPose => ({ pos, look, fov });
/** the sheets stand on the hall floor in front of the desk's place */
const S = (x: number, y: number, z: number) => V(x, y, z);

export const VIEWS: Record<string, View> = {
  small: {
    place: "hall", cam: cm([0, 1.05, 2.05], [0, 0.88, -1.2], 52), f: 0,
    pose(w, f, lab) {
      w.prop("sword").put(S(-0.62, 0.22, -1.4)); lab("sword", S(-0.62, 1.68, -1.4));
      w.prop("scabbard").put(S(-0.3, 0.64, -1.4)); lab("scabbard", S(-0.3, 0.86, -1.4), 0.08);
      w.prop("scabbard", "empty").put(S(-0.14, 0.6, -1.4), { on: false }); lab("on:false", S(-0.12, 0.05, -1.25), 0.06);
      w.prop("knife").put(S(-0.24, 1.15, -1.4)); lab("knife", S(-0.24, 1.55, -1.4), 0.08);
      w.prop("seaChart").put(S(0.14, 1.62, -1.4), { open: 1 }); lab("seaChart open 1", S(0.14, 1.72, -1.4), 0.08);
      w.prop("seaChart", "half").put(S(0.14, 1.02, -1.4), { open: 0.4 }); lab("open 0.4", S(0.14, 1.1, -1.4), 0.08);
      w.prop("bolt").put(S(0.6, 1.3, -1.4)); lab("bolt", S(0.6, 1.53, -1.4), 0.08);
      w.prop("brush").put(S(0.6, 0.85, -1.4)); lab("brush", S(0.6, 1.02, -1.4), 0.08);
      w.prop("crossbow").put(S(0.36, 0.35, -1.0), { rot: 0.6 }); lab("crossbow", S(0.36, 0.68, -1.0), 0.08);
      w.prop("slips").put(S(-0.5, 0, -0.45)); lab("slips n1", S(-0.5, 0.22, -0.45), 0.06);
      w.prop("inkstone").put(S(-0.2, 0, -0.45)); lab("inkstone", S(-0.2, 0.1, -0.45), 0.06);
      w.prop("fish").put(S(0.08, 0.035, -0.45)); lab("fish", S(0.08, 0.26, -0.45), 0.06);
      w.prop("boat").put(S(0.33, 0, -0.45), { rot: 0.5 }); lab("boat", S(0.33, 0.24, -0.45), 0.06);
      w.prop("tree").put(S(0.56, 0, -0.5)); w.prop("hat").put(S(0.555, 0.375, -0.5)); lab("tree + hat", S(0.56, 0.5, -0.5), 0.06);
      return [];
    },
  },
  big: {
    place: "hall", cam: cm([0, 1.75, 2.6], [0, 0.85, -1.9], 56), f: 0,
    pose(w, f, lab) {
      w.prop("railing").put(S(-0.4, 0, -3.1)); lab("railing", S(-0.4, 1.15, -3.1));
      w.prop("lantern").put(S(0.95, 2.2, -3.1)); lab("lantern", S(0.95, 2.35, -3.1));
      w.prop("halberd").put(S(1.2, 0.95, -2.9)); lab("halberd", S(1.2, 2.75, -2.9));
      w.prop("scale").put(S(-0.9, 0, -2.2), { tilt: 0.2 }); lab("scale tilt 0.2", S(-0.9, 1.4, -2.2));
      w.prop("slips", "pan").put(scalePan(S(-0.9, 0, -2.2), 0.2));
      w.prop("desk").put(S(0.25, 0, -2.0)); lab("desk", S(0.25, 0.62, -2.0));
      w.prop("inkstone").put(S(0.0, DESK.top, -1.95));
      w.prop("brush").put(S(0.35, DESK.top + 0.0085, -1.92), { rot: [0, 0.3, Math.PI / 2] });
      w.prop("cushion").put(S(-0.55, 0, -0.75), { rot: 0.3 }); lab("cushion", S(-0.55, 0.3, -0.75), 0.08);
      w.prop("slips", "t4").put(S(-0.7, 0, -1.25), { n: 4 }); lab("slips n4", S(-0.7, 0.45, -1.25), 0.08);
      w.prop("slips", "t9").put(S(1.15, 0, -1.6), { n: 9 }); lab("slips n9", S(1.15, 0.85, -1.6), 0.08);
      w.prop("fishBasket").put(S(0.3, 0, -0.9), { on: true }); lab("fishBasket on", S(0.3, 0.75, -0.9), 0.08);
      return [];
    },
  },
  use: {
    place: "hall", cam: HALL_STAND.cam, f: 200,
    pose(w, f) {
      const Sd = deskSeat(QHALL.desk), emp = w.actor(PEOPLE.emperor);
      emp.set({ ...standing(Sd.at, Sd.facing, f, 1), seat: Sd.seat, pose: { kind: "write", t: f / 30 }, hide: ["swordBelt", "hilt"], expr: "neutral" });
      w.prop("desk").put(QHALL.desk); w.prop("cushion").put(Sd.cushion, { rot: Sd.facing });
      w.prop("inkstone").put(QHALL.desk.clone().add(V(-0.38, DESK.top, 0.08)));
      w.prop("scabbard").put(Sd.at.clone().add(V(0.5, 0.035, -0.18)), { rot: [-Math.PI / 2, 0, 0] });
      w.prop("scale").put(QHALL.scale, { tilt: 0.12, rot: Math.PI });
      w.prop("slips", "pan").put(scalePan(QHALL.scale, 0.12, Math.PI));
      QHALL.slips.forEach((p, i) => w.prop("slips", `tower${i}`).put(p, { n: [6, 9, 4][i] }));
      w.update();
      w.prop("brush").put(emp.handWorld(0), { grip: "hilt", rot: [Math.PI * 0.85, 0, 0] });
      return [emp];
    },
  },
  hold: {
    place: "hall", cam: cm([0, 1.5, 3.3], [0, 1.05, -1.5], 50), f: 300,
    pose(w, f, lab) {
      const out: Rig[] = [];
      const pE = S(-0.82, 0, -1.5), emp = w.actor(PEOPLE.emperor), hE = rel(pE, 0, -0.28, 1.05, 0.26);
      emp.set({ ...standing(pE, 0, f, 1), hands: [hE, null], expr: "smug" }); out.push(emp);
      const pX = S(0.05, 0, -1.5), xu = w.actor(PEOPLE.xufu), cX = rel(pX, 0, 0, 1.08, 0.3), hX = holdPoints("seaChart", cX, { grip: "pair", open: 1 });
      xu.set({ ...standing(pX, 0, f, 3), hands: [hX[0], hX[1]], expr: "smile" }); out.push(xu);
      const pA = S(0.85, 0, -1.5), at = w.actor(PEOPLE.attendant), cA = rel(pA, 0, 0, 0.92, 0.27), hA = holdPoints("slips", cA, { grip: "pair" });
      at.set({ ...standing(pA, 0, f, 5), hands: [hA[0], hA[1]] }); out.push(at);
      w.update();
      w.prop("sword").put(emp.handWorld(0), { grip: "hilt", rot: [0.1, 0, 0.12] }); lab("sword · hilt", S(-0.82, 2.05, -1.5), 0.09);
      w.prop("seaChart").put(cX, { grip: "pair", open: 1 }); lab("chart · pair", S(0.05, 2.05, -1.5), 0.09);
      w.prop("slips").put(cA, { grip: "pair" }); lab("slips · pair", S(0.85, 1.85, -1.5), 0.09);
      return out;
    },
  },
  arms: {
    place: "hall", cam: cm([0, 1.5, 3.3], [0, 1.05, -1.5], 50), f: 400,
    pose(w, f, lab) {
      const out: Rig[] = [];
      const pE = S(-0.82, 0, -1.5), emp = w.actor(PEOPLE.emperor), cE = rel(pE, 0, -0.18, 0.8, 0.18), hE = holdPoints("crossbow", cE, { grip: "pair", rot: 0.8 });
      emp.set({ ...standing(pE, 0, f, 1), hands: [hE[0], hE[1]], expr: "grin" }); out.push(emp);
      const pB = S(0.05, 0, -1.5), ba = w.actor(PEOPLE.bandit), hB = rel(pB, 0, -0.3, 1.0, 0.22);
      ba.set({ ...standing(pB, 0, f, 7), hands: [hB, null], expr: "stern" }); out.push(ba);
      const pO = S(0.85, 0, -1.5), of = w.actor(PEOPLE.official), hO = rel(pO, 0, -0.22, 0.9, 0.12);
      of.set({ ...standing(pO, 0, f, 9), hands: [hO, null] }); out.push(of);
      w.update();
      w.prop("crossbow").put(cE, { grip: "pair", rot: 0.8 }); lab("crossbow · pair", S(-0.82, 2.0, -1.5), 0.09);
      w.prop("knife").put(ba.handWorld(0), { grip: "hilt", rot: [0.2, 0, 0.5] }); lab("knife · hilt", S(0.05, 1.95, -1.5), 0.09);
      w.prop("halberd").put(of.handWorld(0), { grip: "grip" }); lab("halberd · grip", S(0.85, 2.85, -1.5), 0.09);
      return out;
    },
  },
  road: {
    place: "road", cam: ROAD_CAMS.stand, f: 500,
    pose(w) {
      w.prop("bigCarriage").put(ROAD.carriage, { open: 0.6 });
      w.prop("fishBasket").put(ROAD.rack, { on: true });
      w.prop("fishCart").put(ROAD.fishCart, { on: true });
      w.prop("carriage").put(V(RX - 1.2, 0, -24));
      return [];
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
    w.setPlace(v.place); w.setCamera(v.cam);
    const figs = v.pose(w, v.f, lab, o);
    w.endFrame({ camera: v.cam });
    console.log(`QA: view ${i} ${name} | ${qaLine(w, figs)}`);
  };
  return { cam: null, frame: (i) => pose(i), ao: () => w.look().ao, bg: () => w.look().bg };
});
