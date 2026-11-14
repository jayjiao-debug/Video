// HER HAND AND THE RED MIC (su/her.ts) and HER CAMERA's Su additions (su/cam.ts) through the film's own World, in
// front of SU (WP3). One "frame" = one test (FRAMES[i]):
//   bash scripts/kit/queue/still.sh src/videos/su/preview/cam_test.ts /home/user/su_work/wp3/cam/ --pick 0,1,2,3,4,5,6,7 --size 540x960
//   bash scripts/kit/queue/still.sh src/videos/su/preview/cam_test.ts /home/user/su_work/wp3/cam/ --pick 8,9,10,11,12,13,14,15 --size 540x960
//   0  mic "toward" SU's mouth (YARD_CAMS.su, calm handheld)            8  hand "hold" the lychee (cupped), mic toward
//   1  mic "in" half way (k 0.5: the swing from the lower left)          9  hand "eat" the peeled lychee
//   2  mic "lens" (the aside)                                           10  hand "wave" (the river bank, the boat out)
//   3  mic "low" half way (toward -> low, k 0.5)                        11  close: the camera 1.2 m from him, micReach
//   4  hand "reach" for the bone he holds out, mic toward               12  night (pines): mic toward him, the lantern low
//   5  hand "hold" the bone (fist), mic toward                          13  tiltDown half way (C: the shell pile)
//   6  hand "eat" the bone                                              14  tiltDown down, mic at the lens
//   7  hand "catch": the lychee in the air (k 0.6)                      15  tripod + slowPush mid-way (pines F48-F50)
//   16 = 8 with her.ts dy (mic toward -0.16, hand hold -0.26 NDC)       17 = 1 with dy { toward: -0.16 }
// The preview harness has no lens blur and no overlays. Prints  QA: frame <i> <what> | the camera | the mic head (px
// of 1080 x 1920, m from the lens) | the palm (px, m) | SU's head (px, r).
import * as THREE from "three";
import { preview } from "./common";
import { World } from "../world";
import { YARD, YARD_CAMS, RIVER, RIVER_CAMS, PINES, PINES_CAMS } from "../layout";
import { SU } from "../people";
import { standing, headPx, rel, V } from "../shots/common";
import { povCam, keyCam, tripod, slowPush, stillFrom, tiltDown, camAxes, type CamKey } from "../cam";
import { putHer, micReach, type HerO } from "../her";
import { boatSeat } from "../props";
import type { CamPose, Place } from "../story";
import type { Rig } from "../../group/kit/rig3d";

const key = (c: { pos: readonly number[] | THREE.Vector3; look: readonly number[] | THREE.Vector3; fov: number }): CamKey[] => [{ f: 0, pos: c.pos as never, look: c.look as never, fov: c.fov }];
const calm = (c: Parameters<typeof key>[0]) => (f: number) => povCam(f, key(c), { mood: "calm" });
/** SU's mouth (world): a little under his head's middle and to its front */
const mouthOf = (r: Rig) => r.headWorld().add(V(0, -0.075, 0.06));
type Test = {
  what: string; f: number; place: Place; cam(f: number, su: () => Rig): CamPose;
  /** SU's staging: his mark, facing, expression, and his hand (world) if he holds something out */
  su?: { at: THREE.Vector3; facing: number; expr?: string; hand?: THREE.Vector3; boat?: boolean };
  extra?(w: World, f: number, su: Rig): void;
  her(su: Rig, cam: CamPose, f: number): HerO;
};
const SUY = { at: YARD.su, facing: YARD.suFacing };
/** the bone he holds out to her (B07): his LEFT hand (arm 1: on the right as we see him) forward, into her frame */
const OUT = rel(YARD.su, YARD.suFacing, 0.22, 0.95, 0.5);
/** the lychee in the air (C pre: tossed to her): between them, to the right as we see it (his left) */
const LYCHEE_AIR = rel(YARD.su, YARD.suFacing, 0.32, 1.22, 1.45);
const CLOSE: CamPose = (() => { const C = YARD_CAMS.su, p = V(...(C.pos as [number, number, number])), l = V(...(C.look as [number, number, number])), d = l.clone().sub(p).setY(0).normalize(); p.addScaledVector(d, 1.0); return { pos: p.toArray() as never, look: l.addScaledVector(d, 1.0).toArray() as never, fov: C.fov }; })();
const ON = 400;
export const FRAMES: Test[] = [
  { what: "mic toward", f: 30, place: "yard", cam: calm(YARD_CAMS.su), su: { ...SUY, expr: "smile" }, her: (s) => ({ mic: { mode: "toward", aim: mouthOf(s) } }) },
  { what: "mic in k .5", f: 60, place: "yard", cam: calm(YARD_CAMS.su), su: { ...SUY, expr: "happy" }, her: (s) => ({ mic: { mode: "in", k: 0.5, aim: mouthOf(s) } }) },
  { what: "mic lens", f: 90, place: "yard", cam: calm(YARD_CAMS.su), su: { ...SUY, expr: "grin" }, her: () => ({ mic: { mode: "lens" } }) },
  { what: "mic low k .5", f: 120, place: "yard", cam: calm(YARD_CAMS.su), su: { ...SUY, expr: "smile_closed" }, her: (s) => ({ mic: { mode: "low", from: "toward", k: 0.5, aim: mouthOf(s) } }) },
  { what: "hand reach", f: 150, place: "yard", cam: calm(YARD_CAMS.su), su: { ...SUY, expr: "happy", hand: OUT },
    extra: (w, f, s) => { w.prop("bone").put(s.handWorld(1), { grip: "hilt", rot: [-0.5, 0, -0.2] }); },
    her: (s) => ({ mic: { mode: "toward", aim: mouthOf(s) }, hand: { mode: "reach", at: s.handWorld(1).add(V(0, 0.09, 0.04)) } }) },
  { what: "hand hold bone", f: 180, place: "yard", cam: calm(YARD_CAMS.su), su: { ...SUY, expr: "smug" }, her: (s) => ({ mic: { mode: "toward", aim: mouthOf(s) }, hand: { mode: "hold", item: "bone" } }) },
  { what: "hand eat bone", f: 210, place: "yard", cam: calm(YARD_CAMS.su), su: { ...SUY, expr: "laugh" }, her: () => ({ hand: { mode: "eat", item: "bone" } }) },
  { what: "hand catch k .6", f: 240, place: "yard", cam: calm(YARD_CAMS.su), su: { ...SUY, expr: "grin" },
    extra: (w) => { w.prop("lychee").put(LYCHEE_AIR); },
    her: () => ({ hand: { mode: "catch", from: "off", k: 0.6, at: LYCHEE_AIR } }) },
  { what: "hand hold lychee", f: 270, place: "yard", cam: calm(YARD_CAMS.su), su: { ...SUY, expr: "smug" }, her: (s) => ({ mic: { mode: "toward", aim: mouthOf(s) }, hand: { mode: "hold", item: "lychee" } }) },
  { what: "hand eat lychee", f: 300, place: "yard", cam: calm(YARD_CAMS.su), su: { ...SUY, expr: "happy" }, her: () => ({ hand: { mode: "eat", item: "lychee", peeled: 1 } }) },
  { what: "hand wave", f: 330, place: "river", cam: calm(RIVER_CAMS.wave), su: { at: RIVER.boatPath[1], facing: 0, expr: "smile", boat: true },
    extra: (w, f) => { w.prop("boat").put(RIVER.boatPath[1], { t: f / 30 }); },
    her: () => ({ hand: { mode: "wave" } }) },
  { what: "close micReach", f: 360, place: "yard", cam: () => CLOSE, su: { ...SUY, expr: "smile" }, her: (s, cam) => ({ mic: { mode: "toward", aim: mouthOf(s), reach: micReach(cam, mouthOf(s)) } }) },
  { what: "night pines", f: 390, place: "pines", cam: calm(PINES_CAMS.stop), su: { at: PINES.su, facing: PINES.suFacing, expr: "smile_closed" },
    extra: (w) => { w.set.param("glow", 1); w.prop("lantern").put(PINES.su.clone().add(V(-0.3, 0.42, 0.35)), { lit: 1 }); },
    her: (s) => ({ mic: { mode: "toward", aim: mouthOf(s) } }) },
  { what: "tiltDown half", f: ON + 7, place: "yard", cam: (f) => tiltDown(povCam(f, key(YARD_CAMS.bed), { mood: "calm" }), f, ON, undefined, YARD.shells), extra: (w) => { w.set.param("shells", 1); }, her: () => ({}) },
  { what: "tiltDown down + mic lens", f: ON + 30, place: "yard", cam: (f) => tiltDown(povCam(f, key(YARD_CAMS.bed), { mood: "calm" }), f, ON, undefined, YARD.shells), extra: (w) => { w.set.param("shells", 1); }, her: () => ({ mic: { mode: "lens" } }) },
  { what: "slowPush mid", f: 500, place: "pines", cam: (f) => slowPush(povCam(f, key(PINES_CAMS.push), { mood: stillFrom(440) }), f, 440, 560, camAxes(keyCam(0, key(PINES_CAMS.push))).p.distanceTo(V(...(PINES_CAMS.close.pos as [number, number, number])))), su: { at: PINES.su, facing: PINES.suFacing, expr: "sad" },
    extra: (w) => { w.set.param("glow", 1); }, her: (s) => ({ mic: { mode: "toward", aim: mouthOf(s) } }) },
  // 16 = 8 with the screen offsets (her.ts dy, WP3-fix): the mic head 0.16 NDC lower, the lychee hand 0.26 lower (out of
  // the caption band, segC's numbers); 17 = mic "in" half way with per-mode dy (the "toward" value blended in)
  { what: "dy: hold lychee + toward", f: 270, place: "yard", cam: calm(YARD_CAMS.su), su: { ...SUY, expr: "smug" }, her: (s) => ({ mic: { mode: "toward", aim: mouthOf(s), dy: { toward: -0.16, lens: -0.08 } }, hand: { mode: "hold", item: "lychee", dy: { hold: -0.26 } } }) },
  { what: "dy: mic in k .5", f: 60, place: "yard", cam: calm(YARD_CAMS.su), su: { ...SUY, expr: "happy" }, her: (s) => ({ mic: { mode: "in", k: 0.5, aim: mouthOf(s), dy: { toward: -0.16 } } }) },
];
// (tripod: D's still camera is keyCam with no handheld; frame 15's povCam goes still from 440 through stillFrom)
void tripod;

if (typeof window !== "undefined") preview({ w: 540, h: 960 }, (c) => {
  const w = new World(c.renderer, c.camera);
  c.scene.add(w.root);
  const pose = (i: number) => {
    const T = FRAMES[((i % FRAMES.length) + FRAMES.length) % FRAMES.length], f = T.f;
    w.beginFrame(f);
    w.setPlace(T.place);
    const su = w.actor(SU);
    let cam = T.cam(f, () => su);
    w.setCamera(cam);
    if (T.su) {
      if (T.su.boat) { const B = boatSeat(T.su.at, T.su.facing); su.set({ at: B.at, facing: B.facing, seat: B.seat, pose: { kind: "wave", t: f / 30 }, expr: (T.su.expr ?? "smile") as never, visible: true }); }
      else su.set({ ...standing(T.su.at, T.su.facing, f, 1, { expr: (T.su.expr ?? "smile") as never }), hands: T.su.hand ? [null, T.su.hand] : undefined });
    }
    w.update();
    T.extra?.(w, f, su);
    const H = putHer(w, cam, f, T.her(su, cam, f));
    w.endFrame({ camera: cam });
    const n = (v: unknown) => (Array.isArray(v) ? v : (v as THREE.Vector3).toArray()).map((x: number) => x.toFixed(2)).join(",");
    const lens = V(...(cam.pos as [number, number, number]));
    const hp = T.su ? headPx(w, su) : null;
    console.log(`QA: frame ${i} ${T.what} f${f} | cam ${n(cam.pos)} -> ${n(cam.look)} fov ${cam.fov.toFixed(0)} | mic ${H.mic ? `${H.mic.x.toFixed(0)}/${H.mic.y.toFixed(0)} ${H.mic.head.distanceTo(lens).toFixed(3)} m` : "-"} | palm ${H.hand ? `${H.hand.x.toFixed(0)}/${H.hand.y.toFixed(0)} ${H.hand.palm.distanceTo(lens).toFixed(3)} m` : "-"} | head ${hp ? `${hp.x.toFixed(0)}/${hp.y.toFixed(0)} r ${hp.r.toFixed(0)}` : "-"}`);
  };
  return { cam: null, frame: (i) => pose(i), ao: () => w.look().ao, bg: () => w.look().bg };
});
