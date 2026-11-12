// THE PROPS of the Hongmen film (props/index.ts) seen through the film's own World: labelled sheets of every prop beside
// a figure (on the pale board of the `card` place, in daylight), and close views of the props IN USE in their places.
// One "frame" = one view, so several views render in one page:
//   /home/user/hm_tools/still.sh src/videos/hongmen/preview/props_sheet.ts /home/user/hm_work/w/props/sheet --pick 0,1,2,3,4,5,6 --size 540x960
//   /home/user/hm_tools/still.sh src/videos/hongmen/preview/props_sheet.ts out.png --size 540x960 --opts '{"views":["jade"],"font":"/home/user/jayjiao-debug/video/public/bt/sans700.ttf"}'
// Options:
//   views   the list of view names; frame i shows views[i] (default: VIEW_NAMES in order)
//   t       seconds (flames, cloth, the horse's gait; default 0.4);  tStep: seconds added per frame index (a gait strip:
//           --opts '{"views":["ride"],"tStep":0.05}' --pick 0,1,2,3,4,5,6,7 shows one view at eight times)
//   labels  false = no labels;  push 0..1 = the camera this far along its own line of sight
//   nudge   metres: the camera moved sideways by nudge x the frame index (a shimmer pair: same view, two camera places)
// Prints  QA: view <i> <name>
import * as THREE from "three";
import { preview } from "./common";
import { World } from "../world";
import * as L from "../layout";
import { CAMS, SEATS, type Cam } from "../layout";
import { banquet, standing, kneel, rel, staged, PEOPLE } from "../shots/common";
import { setSeat } from "../acc/garb";
import { PROP_DIMS, PROP_GRIP, horseSeat, type PropName } from "../props";
import { FONT } from "../props/kit";
import type { Place } from "../story";

const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const cm = (pos: [number, number, number], look: [number, number, number], fov: number): Cam => ({ pos, look, fov });
type Lab = (text: string, at: THREE.Vector3, size?: number) => void;
type View = { place: Place; cam: Cam; pose(w: World, f: number, t: number, lab: Lab): void };
/** the sheets stand on the free end of the card's board */
const SX = L.CARD.board.x1 - 2.6, SZ = 0, S = (x: number, y: number, z: number) => V(SX + x, y, SZ + z);
const sheetCam = (dist: number, lookY: number, down = 0.22): Cam => cm([SX, lookY + dist * down, SZ + dist], [SX, lookY, SZ], 40);
const D = PROP_DIMS, UP = V(0, 1, 0), TOCAM = V(0, 0.25, 1);
/** Liu Bang ASTRIDE the horse `name` (w_props.md "a rider"): the seat inside the horse's back, the robe told of the seat
 *  (a long one, so no skirt hangs through the belly), the horse draws his legs, his hands on the front roll */
const mount = (w: World, name: PropName, a: THREE.Vector3, fa: number, pose: string, t: number) => {
  w.prop(name).put(a, { facing: fa, pose, t, rider: "#c8322c" });
  const top = horseSeat(a, fa, pose, t), seat = { top, front: 0.7 }, liu = w.actor(PEOPLE.liuBang, "rider");
  setSeat(liu, seat, fa);
  liu.set({ at: a.clone(), facing: fa, pose: { kind: "sit", t }, seat, hands: [rel(top, fa, -0.08, 0.17, 0.23), rel(top, fa, 0.08, 0.17, 0.23)], expr: "neutral", visible: true });
};

const VIEWS: Record<string, View> = {
  // ------------------------------------------------------------------------------------------------ the labelled sheets
  arms: {
    place: "card", cam: sheetCam(5.5, 0.82),
    pose(w, f, t, lab) {
      const p = S(-0.5, 0, 0), fk = w.actor(PEOPLE.fanKuai);
      fk.set(standing(p, 0, f, 1, { hands: [rel(p, 0, -0.4, 0.9, 0.16), null], armFront: [true, undefined], hide: ["hilt"] }));
      w.update();
      w.prop("sword2").put(fk.handWorld(0), { up: V(-0.08, 1, 0.1), face: TOCAM }); lab("sword2", S(-0.93, 1.9, 0), 0.08);
      w.prop("shield").put(S(0.1, D.SHIELD.b + 0.01, 0), { up: V(0, 0, 1), face: UP }); lab("shield", S(0.1, -0.1, 0.3), 0.08);
      w.prop("sword0").put(S(0.54, 0.11, 0), { up: UP, face: TOCAM }); lab("sword0", S(0.52, -0.1, 0.3), 0.08);
      w.prop("sword1").put(S(0.74, 0.11, 0), { up: UP, face: TOCAM }); lab("sword1", S(0.76, 1.03, 0), 0.08);
      w.prop("torch0").put(S(0.96, 0.15, 0), { t }); lab("torch0", S(0.95, -0.1, 0.3), 0.08);
    },
  },
  cloth: {
    place: "card", cam: sheetCam(7.0, 1.25, 0.12),
    pose(w, f, t, lab) {
      const p = S(-1.05, 0, 0), gd = w.actor(PEOPLE.servant);
      gd.set(standing(p, 0, f, 2, { hands: [null, rel(p, 0, 0.3, 0.95, 0.12)] }));
      w.update();
      w.prop("banner:liu").put(gd.handWorld(1), { grip: true, t, facing: 0 }); lab("banner:liu", S(-0.6, -0.14, 0.3), 0.1);
      w.prop("banner:xiang").put(S(0.0, 0, 0), { t: t + 0.7 }); lab("banner:xiang", S(0.1, -0.14, 0.3), 0.1);
      w.prop("flag").put(S(0.6, 0, 0), { t }); lab("flag", S(0.85, -0.14, 0.3), 0.1);
    },
  },
  ware: {
    place: "card", cam: sheetCam(3.3, 0.5, 0.42),
    pose(w, f, t, lab) {
      w.actor(PEOPLE.servant).set(standing(S(-0.62, 0, -0.75), 0.2, f, 3));
      const row = (names: PropName[], xs: number[], z: number, facing = 0) => names.forEach((n, i) => { w.prop(n).put(S(xs[i], 0, z), { facing }); lab(n, S(xs[i], -0.02, z + 0.17), 0.045); });
      row(["cup:liu", "cup:zhang", "bigCup", "earCup", "ladle", "dish0"], [-0.52, -0.34, -0.12, 0.1, 0.27, 0.5], 0.35);
      row(["wineJar", "ding"], [-0.12, 0.42], -0.3);
    },
  },
  leg: {
    place: "card", cam: sheetCam(3.3, 0.5, 0.42),
    pose(w, f, t, lab) {
      w.actor(PEOPLE.servant).set(standing(S(-0.62, 0, -0.75), 0.2, f, 3));
      const b = S(-0.18, 0, 0.05);
      w.prop("shieldDown").put(b); lab("shieldDown", S(-0.18, -0.02, 0.62), 0.045);
      w.prop("pigLeg").put(b.clone().add(V(0, D.SHIELD.top + D.PIG.restY, -0.08)), { facing: 0.15 }); lab("pigLeg", S(-0.18, 0.42, -0.05), 0.045);
      w.prop("legSlice").put(b.clone().add(V(-0.05, D.SHIELD.top, 0.2)), { facing: 0.5 }); lab("legSlice", S(0.2, 0.05, 0.5), 0.045);
      w.prop("note").put(S(0.42, 0.027, 0.3), { facing: 0.3 }); lab("note", S(0.42, -0.02, 0.47), 0.045);
      w.prop("cap").put(S(0.45, 0, -0.25), { facing: 0.6 }); lab("cap", S(0.45, 0.33, -0.25), 0.045);
      w.prop("dish1").put(S(0.15, 0, -0.55)); lab("dish1", S(0.15, 0.14, -0.55), 0.045);
    },
  },
  gifts: {
    place: "card", cam: sheetCam(3.3, 0.5, 0.42),
    pose(w, f, t, lab) {
      const p = S(-0.6, 0, -0.6), fz = w.actor(PEOPLE.fanZeng);
      fz.set(standing(p, 0.15, f, 4, { hands: [null, rel(p, 0.15, 0.32, 1.0, 0.16)], armFront: [undefined, true], hide: ["pendant"] }));
      w.update();
      w.prop("jade").put(fz.handWorld(1), { grip: true, face: TOCAM, up: UP }); lab("jade", S(-0.2, 1.08, -0.6), 0.045);
      w.prop("tray").put(S(-0.3, 0, 0.25), { facing: Math.PI / 2 }); lab("tray", S(-0.3, -0.02, 0.5), 0.045);
      w.prop("trayRest").put(S(0.3, 0, 0.25), { facing: Math.PI / 2 }); lab("trayRest", S(0.3, -0.02, 0.5), 0.045);
      w.prop("bi").put(S(0.02, 0.085, -0.35), { up: UP, face: TOCAM }); lab("bi", S(0.02, 0.24, -0.35), 0.045);
      w.prop("yudou").put(S(0.25, 0, -0.35)); lab("yudou", S(0.25, 0.14, -0.35), 0.045);
      w.prop("shards").put(S(0.55, 0, -0.3)); lab("shards", S(0.55, 0.12, -0.3), 0.045);
    },
  },
  horses: {
    place: "card", cam: sheetCam(7.6, 0.95, 0.16),
    pose(w, f, t, lab) {
      const a = S(-0.75, 0, 0.3), fa = 1.05;
      mount(w, "horse", a, fa, "stand", t); lab("horse", S(-0.75, -0.14, 1.0), 0.09);
      w.prop("horse2").put(S(0.75, 0, 0.3), { facing: fa, t }); lab("horse2", S(0.75, -0.14, 1.0), 0.09);
      w.actor(PEOPLE.liuGuard).set(standing(S(0.05, 0, 0.9), 0, f, 5));
    },
  },
  horses2: {
    place: "card", cam: sheetCam(7.6, 0.95, 0.16),
    pose(w, f, t, lab) {
      w.prop("horse1").put(S(-0.75, 0, 0.3), { facing: -1.05, t, pose: "walk" }); lab("horse1 walk", S(-0.75, -0.14, 1.0), 0.09);
      w.prop("horse3").put(S(0.75, 0, 0.3), { facing: Math.PI / 2, t, pose: "gallop" }); lab("horse3 gallop", S(0.75, -0.14, 1.0), 0.09);
      w.actor(PEOPLE.liuGuard).set(standing(S(0.0, 0, 1.0), 0, f, 5));
    },
  },
  // ------------------------------------------------------------------------------------------------ in use, in their places
  jade: {                                                                         // line 11: Fan Zeng raises the jade (CAMS.jade)
    place: "tent", cam: CAMS.jade,
    pose(w, f) {
      // as the film does it (segC): a seated arm is short, so the ring does not hang under the hand: it stands ON the
      // fist beside his chin (the prop turned over, up = -y: the cord hangs down past the hand), a little over life size
      const s = SEATS.fanzeng, p = V(s.top.x, 0, s.top.z), K = 1.2;
      const R = banquet(w, f, { extra: { fanzeng: { hands: [null, rel(p, s.facing, 0.24, 0.64, 0.33)], armFront: [undefined, true], hide: ["pendant"], expr: "stern" } } });
      w.update();
      const fz = R.fanzeng;
      if (fz) { const at = fz.handWorld(1).add(V(0, D.JADE.r * K + 0.012, 0)); w.prop("jade").put(at, { up: V(0, -1, 0), face: V(CAMS.jade.pos[0], 0, CAMS.jade.pos[2]).sub(V(at.x, 0, at.z)).normalize(), scale: K }); }
    },
  },
  dance: {                                                                        // lines 12-13: two drawn swords (CAMS.dance)
    place: "tent", cam: CAMS.dance,
    pose(w, f) {
      banquet(w, f, { in: ["liu", "xiangyu", "fanzeng"] });
      const M = L.DANCE_MARKS, d = w.actor(PEOPLE.xiangZhuang), u = w.actor(PEOPLE.xiangBo), eye = V(...CAMS.dance.pos);
      d.set(standing(M.dancer, 0.9, f, 6, { hands: [rel(M.dancer, 0.9, -0.36, 1.2, 0.14), null], armFront: [true, undefined], hide: ["hilt"], expr: "smug" }));
      u.set(standing(M.uncle, 0.1, f, 7, { hands: [rel(M.uncle, 0.1, -0.34, 1.05, 0.1), rel(M.uncle, 0.1, 0.4, M.wingY, 0)], armFront: [true, undefined], hide: ["hilt"], expr: "stern" }));
      w.update();
      const dh = d.handWorld(0), uh = u.handWorld(0);
      w.prop("sword0").put(dh, { up: V(0.55, 0.75, -0.2), face: eye.clone().sub(dh) });
      w.prop("sword1").put(uh, { up: V(-0.7, 0.6, 0.1), face: eye.clone().sub(uh) });
    },
  },
  eat: {                                                                          // line 15: the raw leg on the shield (CAMS.floor)
    place: "tent", cam: CAMS.floor,
    pose(w, f) {
      banquet(w, f, { in: ["liu", "xiangyu", "uncle", "fanzeng"] });
      const fk = w.actor(PEOPLE.fanKuai), p = L.MARKS.eat, b = L.SHIELD.onFloor, eye = V(...CAMS.floor.pos);
      fk.set({ ...standing(p, Math.PI / 2, f, 8, { hide: ["hilt"], expr: "neutral" }), ...kneel(1, p, 12), hands: [rel(p, Math.PI / 2, -0.22, 0.42, 0.3), null], armFront: [true, undefined] });
      w.update();
      w.prop("shieldDown").put(b);
      w.prop("pigLeg").put(b.clone().add(V(0, D.SHIELD.top + D.PIG.restY, -0.08)), { facing: 0.15 });
      w.prop("legSlice").put(b.clone().add(V(-0.06, D.SHIELD.top, 0.22)), { facing: 0.4 });
      const h = fk.handWorld(0);
      w.prop("sword0").put(h, { up: V(0.8, 0.5, 0.25), face: eye.clone().sub(h) });
    },
  },
  toast: {                                                                        // line 7: Liu Bang raises a cup to the uncle (CAMS.campNight)
    place: "nightL", cam: CAMS.campNight,
    pose(w, f, t) {
      const N = L.NIGHT_L, liu = w.actor(PEOPLE.liuBang), un = w.actor(PEOPLE.xiangBo);
      liu.set(standing(N.liu, -0.5, f, 9, { hands: [N.toast.clone().add(V(0.12, -0.02, 0)), null], armFront: [true, undefined], expr: "grin" }));
      un.set(standing(N.uncle, 0.5, f, 10));
      const gp = N.uncle.clone().add(V(-0.5, 0, -0.75)), gd = w.actor(PEOPLE.liuGuardB);
      gd.set(standing(gp, 0.2, f, 14, { hands: [null, rel(gp, 0.2, 0.3, 1.0, 0.15)], armFront: [undefined, true] }));
      w.update();
      w.prop("cup:uncle").put(liu.handWorld(0).add(V(0, -D.CUP.h * 0.5 * 1.3, 0)), { scale: 1.3 });
      w.prop("torch0").put(gd.handWorld(1), { up: V(0.2, 1, 0), t });
    },
  },
  bigcup: {                                                                       // line 15: the big cup handed to Fan Kuai (CAMS.two)
    place: "tent", cam: CAMS.two,
    pose(w, f) {
      banquet(w, f, { in: ["liu", "xiangyu", "uncle", "fanzeng"] });
      const fk = w.actor(PEOPLE.fanKuai), p = L.MARKS.eat;
      fk.set(standing(p, 0.6, f, 8, { hands: [null, rel(p, 0.6, 0.3, 0.95, 0.2)], armFront: [undefined, true] }));
      w.update();
      const g = PROP_GRIP.bigCup!;
      w.prop("bigCup").put(fk.handWorld(1).add(V(g[0], -g[1], 0)), { facing: Math.PI });
      w.prop("shield").put(p.clone().add(V(-0.42, D.SHIELD.b + 0.01, -0.05)), { up: V(0.3, 0, 1), face: UP });
      const jar = staged(w, p, 0.75, 0, 0.55);                                      // on the open floor, screen right of him
      w.prop("wineJar").put(jar);
      w.prop("ladle").put(jar.clone().add(V(0, D.WINE.h - 0.05, 0)), { facing: 0.6 });
    },
  },
  ride: {                                                                         // line 18: one horse on the hill road (closer than CAMS.hill)
    place: "path", cam: cm([L.HILL.path[0].x + 9, 1.5, L.HILL.path[0].z + 6.5], [L.HILL.path[0].x + 9, 0.95, L.HILL.path[0].z - 0.6], 34),
    pose(w, f, t) {
      mount(w, "horse", L.HILL.path[0].clone().lerp(L.HILL.path[1], 0.5), Math.PI / 2 + 0.07, "gallop", t);
    },
  },
  hill: {                                                                         // line 18 from the planned camera
    place: "path", cam: CAMS.hill,
    pose(w, f, t) {
      mount(w, "horse", L.HILL.path[0].clone().lerp(L.HILL.path[1], 0.6), Math.PI / 2 + 0.07, "gallop", t);
    },
  },
  gate: {                                                                         // lines 8 / 18: the chariot's horse in the shafts, Liu Bang's horse waiting
    place: "gate", cam: CAMS.gate,
    pose(w, f, t) {
      const G = L.GATE;
      w.actor(PEOPLE.xiangYu).set(standing(G.xiangyu, 0.3, f, 11));
      w.actor(PEOPLE.liuBang).set(standing(G.liuTo, -0.4, f, 12));
      w.prop("horse2").put(V(L.CART.at.x, 0, L.CART.at.z - 1.65), { facing: Math.PI, t });
      w.prop("horse").put(V(L.CART.at.x - 1.35, 0, L.CART.at.z - 0.2), { facing: 0.9, t });
    },
  },
  gift: {                                                                         // lines 19 / 21: the gift table, the disc in Xiang Yu's hand (CAMS.two)
    place: "tent", cam: CAMS.two,
    pose(w, f) {
      const s = SEATS.xiangyu, p = V(s.top.x, 0, s.top.z), eye = V(...CAMS.two.pos);
      const R = banquet(w, f, { in: ["xiangyu", "uncle", "fanzeng"], extra: { xiangyu: { hands: [null, rel(p, s.facing, 0.26, 0.8, 0.3)], armFront: [undefined, true], expr: "smug" } } });
      w.actor(PEOPLE.zhangLiang).set(standing(L.MARKS.gift, Math.PI / 2, f, 13));
      w.update();
      w.prop("trayRest").put(V(L.TRAY.at.x, 0, L.TRAY.at.z));
      const xy = R.xiangyu; if (xy) { const h = xy.handWorld(1); w.prop("bi").put(h.clone().add(V(0, D.BI.r - 0.01, 0)), { up: UP, face: eye.clone().sub(h) }); }
    },
  },
  giftclose: {                                                                    // the gift table alone, close
    place: "tent", cam: cm([L.TRAY.at.x - 0.5, 0.95, L.TRAY.at.z + 1.25], [L.TRAY.at.x, 0.2, L.TRAY.at.z], 34),
    pose(w) { w.prop("tray").put(V(L.TRAY.at.x, 0, L.TRAY.at.z)); },
  },
};
export const VIEW_NAMES = Object.keys(VIEWS);

preview({ w: 540, h: 960 }, (c) => {
  const w = new World(c.renderer, c.camera);
  c.scene.add(w.root);
  const o = c.opts, names: string[] = o.views ?? VIEW_NAMES;
  // ---- labels: small boards that face the camera (canvas text; nothing of the film)
  const labG = new THREE.Group(); c.scene.add(labG);
  const labs = new Map<string, THREE.Mesh>();
  const lab: Lab = (text, at, size = 0.07) => {
    if (o.labels === false) return;
    let m = labs.get(text);
    if (!m) {
      const cv = document.createElement("canvas"); cv.width = 512; cv.height = 96;
      const g = cv.getContext("2d")!; g.font = `700 60px ${FONT}`; g.textAlign = "center"; g.textBaseline = "middle"; g.lineJoin = "round";
      g.strokeStyle = "#1c1822"; g.lineWidth = 12; g.strokeText(text, 256, 50); g.fillStyle = "#ffffff"; g.fillText(text, 256, 50);
      const tx = new THREE.CanvasTexture(cv); tx.colorSpace = THREE.SRGBColorSpace;
      m = new THREE.Mesh(new THREE.PlaneGeometry(512 / 96, 1), new THREE.MeshBasicMaterial({ map: tx, transparent: true, depthTest: false, depthWrite: false, toneMapped: false }));
      m.layers.set(3); m.renderOrder = 50; labs.set(text, m); labG.add(m);
    }
    m.visible = true; m.position.copy(at); m.scale.setScalar(size); m.quaternion.copy(c.camera.quaternion);
  };
  const pose = (i: number) => {
    const name = names[((i % names.length) + names.length) % names.length], v = VIEWS[name];
    if (!v) throw new Error(`props_sheet: no view "${name}" (there are: ${VIEW_NAMES.join(", ")})`);
    let cam = v.cam;
    if (o.push) { const k = +o.push; cam = { ...cam, pos: cam.pos.map((p, a) => p + (cam.look[a] - p) * k) as [number, number, number] }; }
    if (o.nudge) { const d = +o.nudge * i, dir = V(cam.look[0] - cam.pos[0], 0, cam.look[2] - cam.pos[2]).normalize(), r = V(-dir.z, 0, dir.x); cam = { ...cam, pos: [cam.pos[0] + r.x * d, cam.pos[1], cam.pos[2] + r.z * d] }; }
    const t = +(o.t ?? 0.4) + +(o.tStep ?? 0) * i, f = Math.round(t * 30);
    for (const m of labs.values()) m.visible = false;
    w.beginFrame(f);
    w.setPlace(v.place); w.setCamera(cam);
    v.pose(w, f, t, lab);
    w.endFrame({ camera: cam, clock: t });
    console.log(`QA: view ${i} ${name}`);
  };
  return { cam: null, frame: (i) => pose(i), ao: () => w.look().ao, bg: () => w.look().bg };
});
