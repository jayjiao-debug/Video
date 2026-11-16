// THE PROPS of the Wanbi film (props/index.ts, WP5) seen through the film's own World: a labelled sheet of every prop in
// every grip (in the Zhao court's light, on its floor), and the props IN USE in their places with the film's cameras.
// One "frame" = one view (frame i of the page = views[i]):
//   bash scripts/kit/queue/still.sh src/videos/wanbi/preview/props_sheet.ts /home/user/wanbi_work/stills/wp5/ --pick 0,1,2 --size 540x960
//   bash scripts/kit/queue/still.sh src/videos/wanbi/preview/props_sheet.ts /home/user/wanbi_work/stills/wp5/m.png --size 540x960 --opts '{"views":["map"]}'
// Views (VIEW_NAMES):
//   sheet   every prop beside a figure: the jade in the rim grip (the frame-0 hold) and in the pair grip, the map
//           scroll open 1 and half rolled, the jade on its stand, the cap in the pair grip (the Zhao king), in the
//           under grip (the promoted envoy, his own cap on his head beside it) and on its foot, the cauldron
//   map     12b with CAMS.map: the stand, the map open, the official in a high kneel with both hands on the bottom
//           roller (holdPoints), the king at kingMap; small gold balls on MAP_CITIES (mapCitiesWorld): each must sit in the
//           middle of a painted city ring (opts dots: false = none)
//   crown   23b with CAMS.zhaoCrown about 2050: the king holds the cap out at ZHAO.capPass (pair), the envoy kneels
//           (hands down: see the note in the view), the eunuch, the jade upright on its stand on the dais
// Options (preview/common.ts adds w, h, ink, ao, raw, cam): views, labels (false = none), dots (false = none), open
// (the map's open in the map view, default 1).
// Prints  QA: view <i> <name> | reach ... | screen points of the props (x/y % of the frame)
import * as THREE from "three";
import { preview } from "./common";
import { World } from "../world";
import { CAMS, HALL, ZHAO, type Cam } from "../layout";
import { standing, kneel, rel, PEOPLE, V } from "../shots/common";
import { holdPoints, mapCitiesWorld, JADE_STAND } from "../props";
import { FONT } from "../../../kit/props/kit";
import type { Place } from "../story";
import type { Rig } from "../../group/kit/rig3d";

export type Lab = (text: string, at: THREE.Vector3, size?: number) => void;
export type Dots = (pts: THREE.Vector3[]) => void;
export type View = { place: Place; cam: Cam; f: number; pose(w: World, f: number, lab: Lab, dots: Dots, o: Record<string, any>): Rig[] };
const cm = (pos: [number, number, number], look: [number, number, number], fov: number): Cam => ({ pos, look, fov });
const swap = <T,>(p: T[]): [T, T] => [p[1], p[0]];

/** the sheet stands on the Zhao court's rug, in front of the dais (x 39.2..41.85, z -3.3..-0.9) */
const SX = 40.25, S = (x: number, y: number, z: number) => V(SX + x, y, z);

export const VIEWS: Record<string, View> = {
  sheet: {
    place: "zhao", cam: cm([SX, 2.2, 4.3], [SX, 1.1, -1.4], 48), f: 0,
    pose(w, f, lab) {
      const out: Rig[] = [], after: (() => void)[] = [];
      // the maps, hung in the air at the back: open 1 and half rolled (open 0.35)
      const mA = S(-0.55, 2.62, -2.3), mB = S(0.58, 2.62, -2.3);
      w.prop("mapScroll").put(mA, { open: 1 }); lab("map · open 1", S(-0.55, 2.75, -2.3));
      w.prop("mapScroll", "half").put(mB, { open: 0.35 }); lab("open 0.35", S(0.58, 2.75, -2.3));
      // the jade, rim grip: the frame-0 hold (one hand up beside the head, the disc standing on it)
      const pL = S(-0.93, 0, -1.6), lin = w.actor(PEOPLE.lin), hR = rel(pL, 0, 0.3, 1.25, -0.02);
      lin.set({ ...standing(pL, 0, f, 1), hands: [null, hR], expr: "neutral" }); out.push(lin);
      after.push(() => w.prop("jade").put(hR, { grip: "rim" })); lab("jade · rim", S(-0.85, 1.66, -1.6));
      // the jade, pair grip at the chest (lady A)
      const pA = S(-0.31, 0, -1.6), ladyA = w.actor(PEOPLE.ladyA), cA = rel(pA, 0, 0, 0.97, 0.24), hA = holdPoints("jade", cA, { grip: "pair", rot: 0 });
      ladyA.set({ ...standing(pA, 0, f, 3), hands: [hA[0], hA[1]] }); out.push(ladyA);
      after.push(() => w.prop("jade", "pair").put(cA, { grip: "pair", rot: 0 })); lab("jade · pair", S(-0.31, 1.52, -1.6));
      // the cap, pair grip (the Zhao king standing)
      const pZ = S(0.31, 0, -1.6), zw = w.actor(PEOPLE.zhaoWang), cZ = rel(pZ, 0, 0, 0.98, 0.27), hZ = holdPoints("officialCap", cZ, { grip: "pair", rot: 0 });
      zw.set({ ...standing(pZ, 0, f, 11), hands: [hZ[0], hZ[1]] }); out.push(zw);
      after.push(() => w.prop("officialCap").put(cZ, { grip: "pair", rot: 0 })); lab("cap · pair", S(0.31, 1.66, -1.6));
      // the cap, under grip (the promoted envoy: his own cap on his head beside the prop)
      const pO = S(0.93, 0, -1.6), lo = w.actor(PEOPLE.linOfficial), cO = rel(pO, 0, 0, 0.92, 0.27), hO = holdPoints("officialCap", cO, { grip: "under", rot: 0 });
      lo.set({ ...standing(pO, 0, f, 1), hands: [hO[0], hO[1]] }); out.push(lo);
      after.push(() => w.prop("officialCap", "under").put(cO, { grip: "under", rot: 0 })); lab("cap · under", S(0.93, 1.9, -1.6));
      // on the floor in front: the jade on its stand, the cap on its foot, the cauldron
      const st = S(-0.75, 0, -0.55);
      w.prop("jadeStand").put(st); w.prop("jade", "stand").put(st.clone().add(V(0, JADE_STAND.disc, 0)));
      lab("jadeStand", S(-0.75, 0.82, -0.55));
      w.prop("officialCap", "foot").put(S(-0.2, 0, -0.55), { rot: 0.35 }); lab("cap · foot", S(-0.2, 0.47, -0.55));
      w.prop("cauldron").put(S(0.5, 0, -0.3), { rot: 0.3 }); lab("cauldron", S(0.5, 1.1, -0.3));
      w.update();
      for (const a of after) a();
      return out;
    },
  },
  map: {
    place: "hall", cam: CAMS.map, f: 1000,
    pose(w, f, lab, dots, o) {
      w.set.setMapStand(true);
      const open = o.open ?? 1, king = w.actor(PEOPLE.qinWang), off = w.actor(PEOPLE.qinMinC);
      king.set({ ...standing(HALL.kingMap, 0.7, f, 2), expr: "grin" });
      // the official kneels facing the stand (north): his right hand (0) takes the EAST point. A HIGH kneel (kneel 0.5,
      // no bow): from the full kneel at HALL.official the roller at y 1.00 is 11 cm out of reach (rig.qa, WP5 qa2)
      const hd = swap(holdPoints("mapScroll", HALL.mapBar, { open }));
      off.set({ ...standing(HALL.official, Math.PI, f, 7), ...kneel(0.5, HALL.official, 0), hands: hd, turn: 1 });
      w.update();
      const p = w.prop("mapScroll").put(HALL.mapBar, { open });
      if (o.dots !== false && open >= 1) dots(mapCitiesWorld(p));
      return [king, off];
    },
  },
  crown: {
    place: "zhao", cam: CAMS.zhaoCrown, f: 2050,
    pose(w, f) {
      const z = w.actor(PEOPLE.zhaoWang), lin = w.actor(PEOPLE.lin), miao = w.actor(PEOPLE.miaoXian);
      // the cap faces the way its wearer will face (the kneeling envoy, west), turned 0.6 rad toward the camera so its
      // board is not seen edge-on; its lean goes toward the envoy, away from the king's black hair. The king faces the
      // other way: his hands take the pair the other way round
      const put = { grip: "pair" as const, rot: ZHAO.kneelFacing + 0.6 };
      z.set({ ...standing(ZHAO.kingStand, ZHAO.kingStandFacing, f, 11), hands: swap(holdPoints("officialCap", ZHAO.capPass, put)), expr: "smile" });
      // the envoy kneels facing the king (west), his hands down: from the full kneel at ZHAO.kneel no hold on the cap at
      // capPass is clean (rig.qa, WP5 qa2-qa4: reach 0.05-0.12 m short, arms 1.4 cm and more into the body)
      lin.set({ ...standing(ZHAO.kneel, ZHAO.kneelFacing, f, 1), ...kneel(1, ZHAO.kneel, 20) });
      miao.set({ ...standing(ZHAO.miao23, -0.7, f, 12), expr: "smile" });
      w.prop("jadeStand").put(ZHAO.jadeStand);
      w.update();
      w.prop("officialCap").put(ZHAO.capPass, put);
      w.prop("jade").put(ZHAO.jadeStand.clone().add(V(0, JADE_STAND.disc, 0)));
      return [z, lin, miao];
    },
  },
};
export const VIEW_NAMES = Object.keys(VIEWS);

/** a view's QA line: each figure's rig.qa and the props' screen points */
export const qaLine = (w: World, figs: Rig[]) => {
  const pct = (p: THREE.Vector3) => { const q = w.project(p); return `${((100 * q.x) / 1080).toFixed(1)}/${((100 * q.y) / 1920).toFixed(1)}`; };
  const f = figs.map((r) => `reach ${r.qa.reach.toFixed(4)} clear ${r.qa.clear.toFixed(4)}`).join("; ");
  const props: string[] = [];
  w.props.group.children.forEach((g) => { if (g.visible) props.push(`${g.name.slice(5)} ${pct(g.getWorldPosition(V()))}`); });
  return `${f} | ${props.join(", ")}`;
};

if (typeof window !== "undefined") preview({ w: 540, h: 960 }, (c) => {
  const w = new World(c.renderer, c.camera);
  c.scene.add(w.root);
  const o = c.opts, names: string[] = o.views ?? VIEW_NAMES;
  // ---- labels: small boards that face the camera (canvas text; nothing of the film)
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
  // ---- the city check: small gold balls (preview only)
  const dotG = new THREE.Group(); c.scene.add(dotG);
  const dotGeo = new THREE.SphereGeometry(0.0055, 10, 8), dotMat = new THREE.MeshBasicMaterial({ color: "#ffc21a", toneMapped: false });
  const dots: Dots = (pts) => { for (const p of pts) { const m = new THREE.Mesh(dotGeo, dotMat); m.position.copy(p); m.layers.enableAll(); dotG.add(m); } };
  const pose = (i: number) => {
    const name = names[((i % names.length) + names.length) % names.length], v = VIEWS[name];
    if (!v) throw new Error(`props_sheet: no view "${name}" (there are: ${VIEW_NAMES.join(", ")})`);
    for (const m of labs.values()) m.visible = false;
    dotG.clear();
    w.beginFrame(v.f);
    w.setPlace(v.place); w.setCamera(v.cam);
    const figs = v.pose(w, v.f, lab, dots, o);
    w.endFrame({ camera: v.cam });
    console.log(`QA: view ${i} ${name} | ${qaLine(w, figs)}`);
  };
  return { cam: null, frame: (i) => pose(i), ao: () => w.look().ao, bg: () => w.look().bg };
});
