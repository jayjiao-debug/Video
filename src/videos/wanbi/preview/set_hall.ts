// THE HALL (sets/hall.ts) seen through the film's own World from each of its 15 cameras (layout/hall.ts HALL_CAMS),
// with plain block-out figures on EVERY mark the camera's shots place (BIBLE 4's holds, STORYBOARD's placed lists),
// and from close views of the dressing. One "frame" = one view, so several views render in one page (WP2):
//   bash scripts/kit/queue/still.sh src/videos/wanbi/preview/set_hall.ts /home/user/wanbi_work/stills/wp2/ --pick 0,1,2 --size 540x960
//   bash scripts/kit/queue/still.sh src/videos/wanbi/preview/set_hall.ts /home/user/wanbi_work/stills/wp2/x.png --size 540x960 --opts '{"views":["door"],"cast":false}'
// Options:
//   views     the list of view names; frame i shows views[i % n] (default: VIEW_ORDER, the 15 cameras + hallWideCer;
//             HALL_VIEW_NAMES lists all, incl. the close views screen, throneClose, door, banners, drum, grid)
//   cast      false = nobody (the empty set; default: the view's block-out figures)
//   ceremony  0..1 over every view (default: the view's own);  mapStand  true / false (default: the view's own)
//   t         seconds for the idles (default 0; the banners' sway needs sets/index.ts to call the hall's animate)
//   view      { pos, look, fov }: one free camera instead of the list (the walls are hidden for it as in the film)
// Prints  QA: view <i> <name> (shot <id>) | hidden walls ... | <figure> reach r clear c  for pinned hands that miss
// The staging (stageHall) is exported for the headless hold measurement (no preview starts outside a browser).
import * as THREE from "three";
import { preview } from "./common";
import { World } from "../world";
import { HALL, HALL_SET, type Cam } from "../layout";
import { HALL_CAMS } from "../layout/hall";
import { PEOPLE } from "../people";
import { standing, seated, lap, kneel, alive, halberdHand } from "../shots/common";

type V3 = [number, number, number];
const cm = (pos: V3, look: V3, fov: number): Cam => ({ pos, look, fov });
/** who and what a view places (block-out: idle, on the marks) */
type Who =
  | "linPillar" | "linRagePillar" | "linPresent" | "linGive" | "linMid" | "linExit"
  | "kingSeat" | "kingRisen" | "kingMap" | "ladies" | "ministers" | "guards" | "usher" | "official" | "guardCMark" | "guardCGrab"
  | "jadeHigh" | "map" | "cauldron";
export type HallView = { cam: Cam; shot: string; who: Who[]; ceremony?: number; mapStand?: boolean };
const C = HALL_CAMS, MS = HALL_SET.mapStand, SC = HALL_SET.screen, D = HALL_SET.door, CE = HALL_SET.ceremony;
export const HALL_VIEWS: Record<string, HallView> = {
  // ---- the 15 cameras, each with the placed list of the shot named (its first frame's staging)
  hook: { cam: C.hook, shot: "1", who: ["linRagePillar", "jadeHigh", "kingRisen"] },
  kingWave: { cam: C.kingWave, shot: "2", who: ["kingRisen", "linRagePillar"] },
  hallWide: { cam: C.hallWide, shot: "7a", who: ["kingSeat", "linPresent", "ladies", "ministers", "guards"] },
  presentTwo: { cam: C.presentTwo, shot: "7b", who: ["kingSeat", "linGive", "ladies", "ministers", "guards"] },
  linClose: { cam: C.linClose, shot: "8b", who: ["linMid", "kingSeat", "ministers", "guards"] },
  retreat: { cam: C.retreat, shot: "10a", who: ["kingRisen", "linPillar", "jadeHigh", "ladies", "ministers", "guards"] },
  pillarClose: { cam: C.pillarClose, shot: "10b", who: ["linRagePillar", "jadeHigh"] },
  throne: { cam: C.throne, shot: "21a", who: ["kingSeat", "linMid", "ministers", "guardCMark", "cauldron"], ceremony: 1 },
  map: { cam: C.map, shot: "12b", who: ["kingMap", "official", "map", "linPillar"], mapStand: true },
  stageTwo: { cam: C.stageTwo, shot: "13", who: ["kingMap", "official", "map", "linMid"], mapStand: true },
  linStage: { cam: C.linStage, shot: "14", who: ["linMid", "kingMap", "official", "map"], mapStand: true },
  linMid: { cam: C.linMid, shot: "18a", who: ["linMid", "kingSeat", "ministers", "guardCMark", "usher"], ceremony: 1 },
  hallMid: { cam: C.hallMid, shot: "20b", who: ["linMid", "kingSeat", "ministers", "guardCGrab", "cauldron"], ceremony: 1 },
  ministers: { cam: C.ministers, shot: "20a", who: ["ministers", "kingSeat", "linMid", "guardCMark", "cauldron"], ceremony: 1 },
  hallDoor: { cam: C.hallDoor, shot: "22", who: ["linExit", "kingSeat", "ministers", "guardCMark", "cauldron"], ceremony: 1 },
  // ---- hallWide again with the ceremony dressing (17a: the usher, the envoy at mid; no ladies, no guardL / guardR)
  hallWideCer: { cam: C.hallWide, shot: "17a", who: ["kingSeat", "linMid", "usher", "ministers", "guardCMark"], ceremony: 1 },
  // ---- close views of the dressing (nobody unless asked)
  screen: { cam: cm([0.5, 1.5, -1.9], [0, 1.3, SC.z], 40), shot: "-", who: [] },
  throneClose: { cam: cm([1.1, 1.2, -2.7], [0, 0.55, -4.6], 36), shot: "-", who: [] },
  door: { cam: cm([0.6, 1.5, -0.6], [D.x, 1.2, D.z], 40), shot: "-", who: [] },
  banners: { cam: cm([-0.6, 1.6, 1.4], [-CE.bannerX, 1.6, -2.4], 44), shot: "-", who: [], ceremony: 1 },
  drum: { cam: cm([-1.3, 1.3, -2.6], [CE.drum.x, 0.8, CE.drum.z], 40), shot: "-", who: [], ceremony: 1 },
  stand: { cam: cm([0.4, 1.4, -1.2], [MS.x, 1.0, MS.z], 40), shot: "-", who: [], mapStand: true },
  /** the floor's grid at grazing and steep angles (the shimmer test's view) */
  grid: { cam: cm([0.2, 2.4, 3.2], [-0.2, 0.0, -2.0], 44), shot: "-", who: [] },
};
export const HALL_VIEW_NAMES = Object.keys(HALL_VIEWS);
export const VIEW_ORDER = ["hook", "kingWave", "hallWide", "presentTwo", "linClose", "retreat", "pillarClose", "throne", "map", "stageTwo", "linStage", "linMid", "hallMid", "ministers", "hallDoor", "hallWideCer"];

/** poses the hall for one view on time t (s): the place, the camera, the dressing, the block-out figures and props.
 *  Call between w.beginFrame and w.endFrame; returns the camera (the caller passes it to endFrame). */
export function stageHall(w: World, v: HallView, t: number, o: { cast?: boolean; ceremony?: number; mapStand?: boolean } = {}): Cam {
  w.setPlace("hall");
  w.set.setCeremony(o.ceremony ?? v.ceremony ?? 0);
  w.set.setMapStand(o.mapStand ?? v.mapStand ?? false);
  w.setCamera(v.cam);
  const f = Math.round(t * 30), who = new Set(o.cast === false ? [] : v.who), after: (() => void)[] = [];
  const has = (k: Who) => who.has(k);
  // the envoy (LIN; LIN_RAGE in the hook's axis)
  if (has("linRagePillar") || has("linPillar")) {
    const r = w.actor(has("linRagePillar") ? PEOPLE.linRage : PEOPLE.lin);
    r.set({ ...standing(HALL.pillar, HALL.pillarFacing, f, 1), hands: [null, has("jadeHigh") ? HALL.jadeHand0.clone() : null], expr: has("linRagePillar") ? "huff" : "neutral" });
    if (has("jadeHigh")) after.push(() => w.prop("jade").put(HALL.jadeHand0, { grip: "rim" }));
  }
  if (has("linPresent")) w.actor(PEOPLE.lin).set(standing(HALL.present, -0.9, f, 1));
  if (has("linGive")) w.actor(PEOPLE.lin).set(standing(HALL.give, HALL.giveFacing, f, 1));
  if (has("linMid")) w.actor(PEOPLE.lin).set(standing(HALL.mid, -0.9, f, 1));
  if (has("linExit")) w.actor(PEOPLE.lin).set({ ...standing(HALL.exit, Math.PI / 2, f, 1), turn: 1 });
  // the King of Qin
  const K = PEOPLE.qinWang, sc = K.scale ?? 1;
  if (has("kingSeat")) w.actor(K).set({ ...seated(HALL.seat, t), ...alive(t, 2), ...lap(HALL.seat, 0.11, 0.26, 0.20), visible: true });
  if (has("kingRisen")) {
    const r = w.actor(K), k = HALL.kingHookHand, p = HALL.seat.top;
    r.set({ ...seated(HALL.seat, t, { rise: 0.45, hipY: r.dim.hipY, scale: sc }), ...alive(t, 2), expr: "shock", hands: [new THREE.Vector3(p.x - k.x, k.y, p.z + k.z), new THREE.Vector3(p.x + k.x, k.y, p.z + k.z)], visible: true });
  }
  if (has("kingMap")) w.actor(K).set(standing(HALL.kingMap, 0.7, f, 2));
  // the court
  if (has("ladies")) { w.actor(PEOPLE.ladyA).set(standing(HALL.ladyA, 0.9, f, 3)); w.actor(PEOPLE.ladyB).set(standing(HALL.ladyB, 0.4, f, 4)); }
  if (has("ministers")) {
    w.actor(PEOPLE.qinMinA).set(standing(HALL.minA, HALL.minFacing, f, 5));
    w.actor(PEOPLE.qinMinB).set(standing(HALL.minB, HALL.minFacing, f, 6));
    if (!has("official")) w.actor(PEOPLE.qinMinC).set(standing(HALL.minC, HALL.minFacing, f, 7));
  }
  if (has("official")) w.actor(PEOPLE.qinMinC).set({ ...standing(HALL.official, Math.PI, f, 7), ...kneel(1, HALL.official, 10), turn: 1 });
  if (has("guards")) {
    w.actor(PEOPLE.qinGuard).set({ ...standing(HALL.guardL, 0.6, f, 8), hands: [null, halberdHand(HALL.guardL, 0.6, 1)] });
    w.actor(PEOPLE.qinGuardB).set({ ...standing(HALL.guardR, -0.6, f, 9), hands: [halberdHand(HALL.guardR, -0.6, 0), null] });
  }
  if (has("guardCMark")) w.actor(PEOPLE.qinGuardB).set({ ...standing(HALL.guardC, -0.8, f, 9), hands: [halberdHand(HALL.guardC, -0.8, 0), null] });
  if (has("guardCGrab")) { const fc = -1.9; w.actor(PEOPLE.qinGuardB).set({ ...standing(HALL.guardGrab, fc, f, 9), hands: [halberdHand(HALL.guardGrab, fc, 0), null] }); }
  if (has("usher")) w.actor(PEOPLE.qinUsher).set(standing(HALL.usher, -0.5, f, 10));
  // props
  if (has("map")) w.prop("mapScroll").put(HALL.mapBar, { open: 1 });
  if (has("cauldron")) w.prop("cauldron").put(HALL.cauldron);
  w.update();
  for (const a of after) a();
  return v.cam;
}

if (typeof location !== "undefined") preview({ w: 540, h: 960 }, (c) => {
  const w = new World(c.renderer, c.camera);
  c.scene.add(w.root);
  const o = c.opts, names: string[] = o.view ? ["free"] : (o.views ?? VIEW_ORDER);
  const pose = (i: number) => {
    const name = names[((i % names.length) + names.length) % names.length];
    const v: HallView | undefined = o.view ? { cam: o.view as Cam, shot: "-", who: [] } : HALL_VIEWS[name];
    if (!v) throw new Error(`set_hall: no view "${name}" (there are: ${HALL_VIEW_NAMES.join(", ")})`);
    const t = +(o.t ?? 0);
    w.beginFrame(0);
    const cam = stageHall(w, v, t, { cast: o.cast, ceremony: o.ceremony, mapStand: o.mapStand });
    w.endFrame({ camera: cam, clock: t });
    const hidden: string[] = [];
    w.set.group.traverse((x) => { if (/^hall\.wall[NEWS]$/.test(x.name) && !x.visible) hidden.push(x.name.slice(9)); });
    const bad = w.rc.figures.filter((r) => r.group.visible && (r.qa.reach > 0.012 || r.qa.clear < -0.0005)).map((r) => `${r.state.pose.kind} reach ${r.qa.reach.toFixed(3)} clear ${r.qa.clear.toFixed(3)}`);
    console.log(`QA: view ${i} ${name} (shot ${v.shot}) | hidden walls [${hidden.join(" ")}]${bad.length ? " | " + bad.join("  ") : ""}`);
  };
  return { cam: null, frame: (i) => pose(i), ao: () => w.look().ao, bg: () => w.look().bg };
});
