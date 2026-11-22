// THE PROPS of 采访罗密欧与朱丽叶 (props/index.ts, props/things.ts; the hand-held ones acc/held2.ts) through the film's
// own World: a labelled sheet of every registry prop laid out on a plain floor (the dust of Mantua, away from its
// street), the hand-held ones on Romeo and the Friar, and the props in use at their marks. One "frame" = one view:
//   bash scripts/kit/queue/still.sh src/videos/romeo/preview/props_sheet.ts /home/user/romeo_work/sets/props/ --pick 0,1,2,3,4 --size 540x960 \
//     --opts '{"font":"/home/user/jayjiao-debug/video/public/bt/sans700.ttf","w":540,"h":960}'
// Views (VIEW_NAMES, in this order):
//   all      every registry prop on a plain floor, labelled (spill at amount 0.55, the bottle standing and lying, the
//            letter lying and standing, two paper balls)
//   held     ROMEO with the mask on its stick (hand raised to the chest), ROMEO with the dark bottle, THE FRIAR with his
//            quill (acc/held2.ts maskStick, darkBottleHeld, quillHeld)
//   street   scene 5 (street, camera "back", dusk): Romeo's back, the sword and the red cap at their marks
//   window   scene 7 (street, camera "window", light "day", boards 0.6): the letter standing behind the window
//   rider    scene 7 (mantua, camera "above"): Romeo far, the rider standing at its mark and a second one leaving (go 0.4)
// Options (preview/common.ts adds w, h, ink, ao, raw, cam): views, labels (false = none).
// Prints  QA: view <i> <name> | each figure's reach / clear / held | the visible props' screen points (x/y % of the frame)
import * as THREE from "three";
import { preview } from "../../wanbi/preview/common";
import { World } from "../world";
import { ROMEO, FRIAR, type Person } from "../people";
import { standing } from "../shots/common";
import { STAGE, ISLAND, type Place, type CamSpot, type Spot } from "../places";
import { FONT } from "../../../kit/props/kit";
import { maskStick, darkBottleHeld, quillHeld } from "../acc/held2";
import type { Rig } from "../../group/kit/rig3d";
import type { CamPose } from "../../../kit/day/types";

type Lab = (text: string, at: THREE.Vector3, size?: number) => void;
type View = { place: Place; cam: CamPose; f: number; params?: Record<string, string | number | boolean>; pose(w: World, f: number, lab: Lab): Rig[] };
const PI = Math.PI;
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
/** the plain floor: Mantua's dust 30 m east of its street */
const FX = ISLAND.mantua + 30;
const F = (x: number, y: number, z: number) => V(FX + x, y, z);
const camAt = (p: Place, c: CamSpot): CamPose => ({ pos: [ISLAND[p] + c.pos[0], c.pos[1], c.pos[2]], look: [ISLAND[p] + c.look[0], c.look[1], c.look[2]], fov: c.fov });
const spot = (p: Place, k: string) => (STAGE[p].spots as Record<string, Spot>)[k];
const at = (p: Place, k: string) => { const s = spot(p, k); return V(ISLAND[p] + s.at[0], s.at[1], s.at[2]); };
const ROMEO_MASK: Person = { ...ROMEO, name: "romeoMaskSheet", acc: () => [...ROMEO.acc(), maskStick()] };
const ROMEO_BOTTLE: Person = { ...ROMEO, name: "romeoBottleSheet", acc: () => [...ROMEO.acc(), darkBottleHeld()] };
const FRIAR_QUILL: Person = { ...FRIAR, name: "friarQuillSheet", acc: () => [...FRIAR.acc(), quillHeld()] };

export const VIEWS: Record<string, View> = {
  all: {
    place: "mantua", cam: { pos: [FX, 1.55, 0.35], look: [FX, 0, -1.15], fov: 48 }, f: 0,
    pose(w, f, lab) {
      const s = 0.034;
      w.prop("sword").put(F(-0.3, 0, -1.95), { rot: 0 }); lab("sword", F(0.05, 0.12, -1.95), s);
      w.prop("redCap").put(F(-0.36, 0, -1.45)); lab("redCap", F(-0.36, 0.13, -1.45), s);
      w.prop("darkBottle").put(F(-0.05, 0, -1.45)); lab("darkBottle", F(-0.05, 0.16, -1.45), s);
      w.prop("darkBottle", "lying").put(F(0.15, 0, -1.4), { lying: true, rot: 0.4 }); lab("lying", F(0.15, 0.09, -1.4), s);
      w.prop("inkpot").put(F(0.38, 0, -1.45)); lab("inkpot", F(0.38, 0.12, -1.45), s);
      w.prop("letterSealed").put(F(-0.3, 0, -1.0), { rot: 0.15 }); lab("letterSealed", F(-0.3, 0.07, -1.0), s);
      w.prop("letterSealed", "stand").put(F(0.0, 0, -1.05), { stand: true }); lab("stand", F(0.0, 0.2, -1.05), s);
      w.prop("quill").put(F(0.28, 0, -1.08), { rot: 0.3 }); lab("quill", F(0.28, 0.07, -1.1), s);
      w.prop("waxStick").put(F(0.3, 0, -0.9), { rot: -0.2 }); lab("waxStick", F(0.3, 0.05, -0.86), s);
      w.prop("spill").put(F(-0.22, 0, -0.5), { amount: 0.55 }); lab("spill .55", F(-0.22, 0.05, -0.5), s);
      w.prop("glassShards").put(F(0.24, 0, -0.5)); lab("glassShards", F(0.24, 0.06, -0.42), s);
      w.prop("crumpledPage").put(F(-0.05, 0, -0.75)); w.prop("crumpledPage", "b").put(F(0.04, 0, -0.66), { rot: 1.3 }); lab("crumpledPage", F(0.0, 0.12, -0.72), s);
      void f;
      return [];
    },
  },
  held: {
    place: "mantua", cam: { pos: [FX + 0.05, 1.2, 4.7], look: [FX + 0.05, 0.9, -0.2], fov: 46 }, f: 12,
    pose(w, f, lab) {
      const out: Rig[] = [], z = -0.2;
      const a = F(-0.66, 0, z), ro = w.actor(ROMEO_MASK), b = F(0.05, 0, z), rb = w.actor(ROMEO_BOTTLE, "bottle"), c = F(0.76, 0, z), fr = w.actor(FRIAR_QUILL);
      ro.set({ ...standing(a, 0.15, f, 1), hands: [null, a.clone().add(V(0.2, 0.7, 0.26))] }); out.push(ro);
      rb.set({ ...standing(b, 0, f, 2), hands: [null, b.clone().add(V(0.19, 0.78, 0.25))] }); out.push(rb);
      fr.set({ ...standing(c, -0.15, f, 3), hands: [c.clone().add(V(-0.2, 0.84, 0.28)), null] }); out.push(fr);
      w.update();
      lab("maskStick", F(-0.66, 2.0, z), 0.07); lab("darkBottleHeld", F(0.05, 2.0, z), 0.07); lab("quillHeld", F(0.76, 2.0, z), 0.07);
      return out;
    },
  },
  street: {
    place: "street", cam: camAt("street", STAGE.street.cams.back), f: 24, params: { light: "dusk" },
    pose(w, f) {
      const r = w.actor(ROMEO), s = spot("street", "romeoBack");
      r.set(standing(at("street", "romeoBack"), s.facing, f, 1)); w.update();
      w.prop("sword").put(at("street", "sword"), { rot: spot("street", "sword").facing });
      w.prop("redCap").put(at("street", "cap"), { rot: 0.6 });
      return [r];
    },
  },
  window: {
    place: "street", cam: camAt("street", STAGE.street.cams.window), f: 36, params: { light: "day", boards: 0.6 },
    pose(w) {
      w.prop("letterSealed").put(V(ISLAND.street + 2.47, 0.9, -0.2), { stand: true, rot: -PI / 2 });
      return [];
    },
  },
  rider: {
    place: "mantua", cam: camAt("mantua", STAGE.mantua.cams.above), f: 48,
    pose(w, f) {
      const r = w.actor(ROMEO), s = spot("mantua", "romeoFar"), rs = spot("mantua", "rider");
      r.set(standing(at("mantua", "romeoFar"), s.facing, f, 1)); w.update();
      w.prop("horseRider").put(at("mantua", "rider"), { rot: rs.facing, t: f / 30 });
      w.prop("horseRider", "go").put(at("mantua", "rider").add(V(1.6, 0, -2)), { rot: rs.facing, go: 0.4, t: f / 30 });
      return [r];
    },
  },
};
export const VIEW_NAMES = Object.keys(VIEWS);

if (typeof window !== "undefined") preview({ w: 540, h: 960 }, (c) => {
  const w = new World(c.renderer, c.camera);
  c.scene.add(w.root);
  const o = c.opts, names: string[] = o.views ?? VIEW_NAMES;
  const labG = new THREE.Group(); c.scene.add(labG);
  const labs = new Map<string, THREE.Mesh>();
  const lab: Lab = (text, p, size = 0.11) => {
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
    m.visible = true; m.position.copy(p); m.scale.setScalar(size); m.quaternion.copy(c.camera.quaternion);
  };
  const pose = (i: number) => {
    const name = names[((i % names.length) + names.length) % names.length], v = VIEWS[name];
    if (!v) throw new Error(`props_sheet: no view "${name}" (there are: ${VIEW_NAMES.join(", ")})`);
    for (const m of labs.values()) m.visible = false;
    w.beginFrame(v.f);
    w.setPlace(v.place);
    for (const [k, val] of Object.entries(v.params ?? {})) w.set.param(k, val);
    w.setCamera(v.cam);
    const figs = v.pose(w, v.f, lab);
    if (!figs.length) w.update();
    w.endFrame({ camera: v.cam, clock: v.f / 30 });
    const pct = (p: THREE.Vector3) => { const q = w.project(p); return `${((100 * q.x) / 1080).toFixed(1)}/${((100 * q.y) / 1920).toFixed(1)}`; };
    const props: string[] = [];
    w.props.group.children.forEach((g) => { if (g.visible) props.push(`${g.name.slice(5)} ${pct(g.getWorldPosition(new THREE.Vector3()))}`); });
    console.log(`QA: view ${i} ${name} | ${figs.map((r) => `reach ${r.qa.reach.toFixed(4)} clear ${r.qa.clear.toFixed(4)} held ${r.qa.held.toFixed(3)}`).join("; ")} | ${props.join(", ")}`);
  };
  return { cam: null, frame: (i) => pose(i), ao: () => w.look().ao, bg: () => w.look().bg };
});
