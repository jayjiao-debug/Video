// WP2a's places (sets/market.ts, sets/yard.ts, sets/room.ts) through the film's own World: every named camera of the
// three places (layout/<place>.ts <PLACE>_CAMS), each with its scene's dressing, WP3's props on their marks (the block;
// the stove, stool, bench, ladder, dog, rattan bed; the desk, cushion, trunks, robes, bench) and a stand-in cast (SU on
// the view's mark, the butcher and villagers at the market, MAI on the ladder and the kids in the yard, the family in
// the room, the courier and the family at the gate). One "frame" = one view:
//   bash scripts/kit/queue/still.sh src/videos/su/preview/sets_wp2a.ts /home/user/su_work/wp2a/v/ --pick 0,1,2 --size 540x960
//   bash scripts/kit/queue/still.sh src/videos/su/preview/sets_wp2a.ts /home/user/su_work/wp2a/x.png --size 540x960 --opts '{"views":["yard.land"],"params":{"sun":"noon"}}'
// Options (preview/common.ts adds w, h, ink, ao, raw, cam):
//   views   "<place>.<camera>" names (default: VIEWS, all of them in order); frame i shows views[i % n]
//   dump    a mesh-name prefix: prints those meshes (visible, vertices, bounding sphere) — a set's debug
//   cast    false = the empty place (no figures);  props  false = no props;  params  { name: value } over the view's own
//   dressing;  t  seconds (animate)
// Prints  QA: view <i> <name> | place | params | the projected eyes of SU (1080 x 1920 px)
import * as THREE from "three";
import { preview } from "./common";
import { World } from "../world";
import { CAMS, MARKET, YARD, ROOM, ROOM_SET, RIVER_SET, type Cam } from "../layout";
import { makeFarHouse } from "../sets/parts/farhouse";
import { makeKit } from "../../../kit/props/kit";
import { SU, BUTCHER, VILLAGER, MAI, KID, KID2, WIFE, GUO, COURIER, SERVANT } from "../people";
import { standing, yawTo, seated } from "../shots/common";
import { deskSeat, bedSeat, ladderRot, ladderRung } from "../props";
import type { Place } from "../story";
import type { ParamValue } from "../sets";

type View = { place: Place; cam: Cam; params: Record<string, ParamValue>; su?: { at: THREE.Vector3; facing: number } | null; scene: string };
const P3 = (v: THREE.Vector3) => v.clone();
const VIEWS: Record<string, View> = {};
const market: Record<string, ParamValue> = { crowd: 1, carcass: true };
const yardB: Record<string, ParamValue> = { sun: "morning", lantern: 1, shells: 0 };
const yardC: Record<string, ParamValue> = { sun: "noon", lantern: 1, shells: 1 };
const yardD: Record<string, ParamValue> = { sun: "afternoon", lantern: 1, shells: 1, gate: 1 };
const room: Record<string, ParamValue> = { sun: 1 };
for (const [k, cam] of Object.entries(CAMS.market)) VIEWS[`market.${k}`] = { place: "market", cam, params: market, su: { at: MARKET.su, facing: MARKET.suFacing }, scene: "A" };
for (const [k, cam] of Object.entries(CAMS.yard)) {
  const scene = k === "bed" || k === "shells" || k === "tree" ? "C" : k === "gate" || k === "road" || k === "wide" ? "D" : "B";
  const su = scene === "C" ? { at: new THREE.Vector3(YARD.bed.x, 0, YARD.bed.z - 1.3), facing: 0.25 } : scene === "D" ? { at: YARD.family.su, facing: 2.6 } : k === "stove" ? { at: YARD.suSquat, facing: 0.1 } : { at: YARD.su, facing: YARD.suFacing };
  VIEWS[`yard.${k}`] = { place: "yard", cam, params: scene === "C" ? yardC : scene === "D" ? yardD : yardB, su, scene };
}
for (const [k, cam] of Object.entries(CAMS.room)) VIEWS[`room.${k}`] = { place: "room", cam, params: room, su: { at: ROOM.sit, facing: ROOM.suFacing }, scene: "E" };
// the far house (sets/parts/farhouse.ts) on WP2b's river place, as G sees it (a check of the copy, not a yard view)
VIEWS["far.river"] = { place: "river", cam: CAMS.river.far, params: {}, su: null, scene: "G" };
export const VIEW_NAMES = Object.keys(VIEWS);

preview({ w: 540, h: 960 }, (c) => {
  const w = new World(c.renderer, c.camera);
  c.scene.add(w.root);
  const o = c.opts, names: string[] = o.views ?? VIEW_NAMES;
  let far: ReturnType<typeof makeFarHouse> | null = null;
  const pose = (i: number) => {
    const name = names[((i % names.length) + names.length) % names.length], v = VIEWS[name];
    if (!v) throw new Error(`sets_wp2a: no view "${name}" (there are: ${VIEW_NAMES.join(", ")})`);
    const t = typeof o.t === "number" ? o.t : 0, f = Math.round(t * 30);
    w.beginFrame(f);
    w.setPlace(v.place);
    const params = { ...v.params, ...(o.params ?? {}) } as Record<string, ParamValue>;
    for (const [k, val] of Object.entries(params)) w.set.param(k, val);
    w.setCamera(v.cam);
    if (v.scene === "G" && !far) {
      far = makeFarHouse(makeKit(w.set.mats("river"))); far.group.position.copy(RIVER_SET.house);
      far.group.rotation.y = Math.atan2(v.cam.pos[0] - RIVER_SET.house.x, v.cam.pos[2] - RIVER_SET.house.z); w.root.add(far.group); far.setLantern(1);
    }
    if (far) far.group.visible = v.scene === "G";
    let eyes = "";
    if (o.props !== false) {
      if (v.scene === "A") w.prop("block").put(MARKET.block);
      if (v.scene === "B" || v.scene === "C" || v.scene === "D") {
        w.prop("stove").put(YARD.stove, { steam: 0.6, t }); w.prop("stool").put(new THREE.Vector3(YARD.wine.x, 0, YARD.wine.z)); w.prop("bench").put(YARD.bench);
      }
      if (v.scene === "B") { w.prop("ladder").put(YARD.ladder, { rot: ladderRot(YARD.ladder, YARD.ladderTop) }); w.prop("dog").put(YARD.dog, { pose: "lie", t }); }
      if (v.scene === "C") w.prop("rattanBed").put(YARD.bed);
      if (v.scene === "E") {
        const Sd = deskSeat(ROOM.desk); w.prop("desk").put(ROOM.desk); w.prop("cushion").put(Sd.cushion, { rot: Sd.facing });
        ROOM.trunks.forEach((p, k) => w.prop("trunk", String(k)).put(p, { open: 1, rot: k ? 1.2 : 0.35 }));
        w.prop("robes").put(new THREE.Vector3(ROOM.trunks[1].x + 0.55, 0, ROOM.trunks[1].z - 0.45)); w.prop("bench").put(ROOM.bench);
      }
    }
    if (o.cast !== false) {
      if (v.su && v.scene === "E") { const Sd = deskSeat(ROOM.desk); w.actor(SU).set({ ...standing(Sd.at, Sd.facing, f, 1), ...seated({ ...Sd.seat, facing: Sd.facing }, t) }); }
      else if (v.su && v.scene === "C" && (name === "yard.bed" || name === "yard.shells" || name === "yard.tree")) { const Sb = bedSeat(YARD.bed); w.actor(SU).set({ ...standing(Sb.at, Sb.facing, f, 1), ...seated({ ...Sb.seat, facing: Sb.facing }, t) }); }
      else if (v.su) w.actor(SU).set(standing(P3(v.su.at), v.su.facing, f, 1));
      if (v.scene === "A") {
        w.actor(BUTCHER).set(standing(MARKET.butcher, -0.3, f, 2, { expr: "deadpan" }));
        MARKET.villagers.forEach((p, k) => w.actor(VILLAGER, String(k)).set(standing(p, yawTo(p, MARKET.block) + 0.6 * (k % 2 ? 1 : -1), f, 6 + k)));
        w.actor(SERVANT, "0").set({ ...standing(MARKET.servantPath[1], yawTo(MARKET.servantPath[1], MARKET.servantPath[2]), f, 3), turn: 1 });
      } else if (v.scene === "B") {
        w.actor(MAI).set(standing(YARD.mai.clone(), Math.PI, f, 2, { turn: 1 })); void ladderRung;
        w.actor(KID).set(standing(YARD.kids[0], 2.0, f, 3, { expr: "happy" }));
        w.actor(KID2).set(standing(YARD.kids[2], -1.0, f, 4, { expr: "happy" }));
      } else if (v.scene === "D") {
        const F = YARD.family;
        w.actor(COURIER).set(standing(YARD.courier, yawTo(YARD.courier, F.su), f, 5, { expr: "stern" }));
        w.actor(MAI).set(standing(F.mai, yawTo(F.mai, YARD.courier), f, 2, { turn: 1 }));
        w.actor(KID).set(standing(F.kid, yawTo(F.kid, YARD.courier), f, 3, { turn: 1 }));
        w.actor(GUO).set(standing(F.guo, yawTo(F.guo, YARD.courier), f, 4, { turn: 1 }));
      } else if (v.scene === "E") {
        w.actor(WIFE).set(standing(ROOM.wife, yawTo(ROOM.wife, ROOM.trunks[0]) + 0.5, f, 2, { expr: "smile_closed" }));
        ROOM.kids.forEach((p, k) => w.actor(k ? KID2 : KID).set({ ...standing(new THREE.Vector3(p.x, 0, p.z), 0.15 - 0.3 * k, f, 3 + k, { expr: "happy" }), ...seated({ top: new THREE.Vector3(p.x, ROOM_SET.bench.top, p.z + 0.02), floor: 0, back: 0.03, facing: 0 } as Parameters<typeof seated>[0], t) }));
      }
      w.update();
      if (v.su) { const r = w.actor(SU), p = w.project(r.headWorld()); eyes = ` | SU eyes ${p.x.toFixed(0)},${p.y.toFixed(0)}`; }
    } else w.update();
    w.endFrame({ camera: v.cam, clock: t });
    console.log(`QA: view ${i} ${name} | place ${v.place} | params ${JSON.stringify(params)}${eyes}`);
    if (o.dump) w.root.traverse((x) => { const m = x as THREE.Mesh; if (!m.isMesh || !m.name.startsWith(String(o.dump))) return; m.geometry.computeBoundingSphere(); let vis = true; for (let q: THREE.Object3D | null = m; q; q = q.parent) vis = vis && q.visible; console.log(`QA: mesh ${m.name} vis ${vis} verts ${m.geometry.attributes.position.count} r ${m.geometry.boundingSphere?.radius.toFixed(2)} c ${m.geometry.boundingSphere?.center.toArray().map((n) => n.toFixed(1)).join(",")}`); });
  };
  return { cam: null, frame: (i) => pose(i), ao: () => w.look().ao, bg: () => w.look().bg };
});
