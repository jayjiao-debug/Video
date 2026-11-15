// HER CAMERA (qin/cam.ts, WP3) in the corridor through the film's own World: a whip pan and a dip, frame by frame,
// with the scared handheld on. The preview harness has no lens blur and no overlays, so the whip's blur (post.dof)
// and smear (whipSmear) are printed, not drawn: the film draws them. One "frame" = one test frame (FRAMES[i]):
//   bash scripts/kit/queue/still.sh src/videos/qin/preview/cam_test.ts /home/user/qin_work/wp3/cam/ --pick 0,1,2,3,4,5 --size 540x960
//   0 1 2   the whip from the walkway (creep camera) to the T-junction (dir -1: to the left): leaving (on + 2),
//           arriving (on + 4), settled (on + 9)
//   3 4 5   the dip at the peek pillar: on, half down (on + 5), down and straining (on + 40)
// Prints  QA: frame <i> <what> | the camera's pos / look / fov / roll, the whip's blur and smear, the EMPEROR's head on
// screen (x/y px of 1080 x 1920)
import * as THREE from "three";
import { preview } from "./common";
import { World } from "../world";
import { CORRIDOR, CORRIDOR_CAMS } from "../layout/corridor";
import { standing, headPx, PEOPLE } from "../shots/common";
import { povCam, whip, dip, keyCam, type CamKey } from "../cam";
import type { CamPose } from "../story";

const ON = 100;
/** the creep down the walkway (keys), the junction view, the peek view */
const CREEP: CamKey[] = [{ f: 0, ...CORRIDOR_CAMS.creep }, { f: 200, pos: [CORRIDOR_CAMS.creep.pos[0], 1.55, 1.2], look: CORRIDOR_CAMS.creep.look }];
const JUNCTION = keyCam(0, [{ f: 0, ...CORRIDOR_CAMS.junction }]);
const PEEK: CamKey[] = [{ f: 0, ...CORRIDOR_CAMS.peek }];
type Test = { what: string; f: number; cam(f: number): { cam: CamPose; blur?: number; smear?: number } };
export const FRAMES: Test[] = [
  ...[2, 4, 9].map((d): Test => ({ what: `whip +${d}`, f: ON + d, cam: (f) => {
    const W = whip(povCam(f, CREEP, { mood: "scared", walk: 1 }), f, ON, { dir: -1, to: povCam(f, [{ f: 0, ...JUNCTION } as CamKey], { mood: "scared" }) });
    return { cam: W.cam, blur: W.post?.dof?.amount ?? 0, smear: W.smear };
  } })),
  ...[0, 5, 40].map((d): Test => ({ what: `dip +${d}`, f: ON + d, cam: (f) => ({ cam: dip(povCam(f, PEEK, { mood: "scared" }), f, ON) }) })),
];

if (typeof window !== "undefined") preview({ w: 540, h: 960 }, (c) => {
  const w = new World(c.renderer, c.camera);
  c.scene.add(w.root);
  const pose = (i: number) => {
    const T = FRAMES[((i % FRAMES.length) + FRAMES.length) % FRAMES.length], f = T.f, C = T.cam(f);
    w.beginFrame(f);
    w.setPlace("corridor"); w.setCamera(C.cam);
    const emp = w.actor(PEOPLE.emperor);
    emp.set({ ...standing(CORRIDOR.emperor, 0, f, 1), expr: "stern" });
    w.update();
    w.endFrame({ camera: C.cam });
    const n = (v: unknown) => (Array.isArray(v) ? v : (v as THREE.Vector3).toArray()).map((x: number) => x.toFixed(3)).join(",");
    const hp = headPx(w, emp);
    console.log(`QA: frame ${i} ${T.what} f${f} | pos ${n(C.cam.pos)} look ${n(C.cam.look)} fov ${C.cam.fov.toFixed(1)} roll ${(((C.cam.roll ?? 0) * 180) / Math.PI).toFixed(2)} deg | blur ${(C.blur ?? 0).toFixed(1)} smear ${(C.smear ?? 0).toFixed(2)} | head ${hp.x.toFixed(0)}/${hp.y.toFixed(0)} r ${hp.r.toFixed(0)}`);
  };
  return { cam: null, frame: (i) => pose(i), ao: () => w.look().ao, bg: () => w.look().bg };
});
