// The outdoor places of the Hongmen film (sets/outdoor.ts, night.ts, card.ts) through the REAL World, from the
// layout's cameras, with the skeleton's blank staging (the cast on the layout marks, idle), or empty.
// One page renders any number of VIEWS: frame i of the page = view i of the list.
//   /home/user/hm_tools/still.sh src/videos/hongmen/preview/set_outdoor.ts <outdir> --size 540x960 --pick 0,1,2 \
//      --opts '{"views":["gate8","gate9","gate18"],"font":"/home/user/jayjiao-debug/video/public/bt/sans700.ttf"}'
// Options: views (names from VIEWS below; default: all of them), t (seconds for the set's animation, default 1.5),
//   cast: false (no figures, no props), ink / ao / raw (preview/common.ts),
//   (card4drop / card4drop2 / card4xy0 = the sand table with setArmies(6.5, 0) / (10, 2.5) / (0, 0)),
//   shake: { view: "gate8", n: 12, dx: 0.02, dy: 0.01, push: 0.01 }  the SHIMMER TEST: frame i = that view with the
//   camera moved i steps (dx, dy metres sideways / up per step, push = fraction toward the look point per step) and
//   the set's clock held, so everything that changes between two frames is the camera's doing (compare them).
import * as THREE from "three";
import { preview } from "./common";
import { World } from "../world";
import * as L from "../layout";
import { PEOPLE } from "../people";
import { seated, standing, kneel, yawTo } from "../shots/common";
import type { Place, CamPose } from "../story";

type View = { name: string; place: Place; cam: L.CamName | L.Cam; who?: string; sun?: number; flap?: number; armies?: [number, number] };
const VIEWS: View[] = [
  { name: "gate8", place: "gate", cam: "gate", who: "gate" },
  { name: "gate9", place: "gate", cam: "gateXY", who: "gate" },
  { name: "gate18", place: "gate", cam: "gate", who: "gate18" },
  { name: "nx5", place: "nightX", cam: "nightX", who: "nx" },
  { name: "nx6", place: "nightX", cam: "nightXin", who: "nx" },
  { name: "nxBust", place: "nightX", cam: L.cam([-29.35, 1.05, 2.35], [-29.78, 0.74, -0.1], 36), who: "nx" },
  { name: "nl7", place: "nightL", cam: "campNight", who: "nl" },
  { name: "nl7i", place: "nightL", cam: L.cam([29.25, 1.3, 2.9], [29.5, 1.0, -0.45], 40), who: "nl" },
  { name: "day20", place: "dayL", cam: "campDay", who: "day" },
  { name: "day20in", place: "dayL", cam: "campDayIn", who: "cap" },
  { name: "day20bust", place: "dayL", cam: L.cam([30.5, 1.3, 2.0], [30.47, 1.12, -0.7], 36), who: "day" },
  { name: "out2b", place: "camp", cam: "outside", who: "shadow" },
  { name: "door17", place: "camp", cam: "tentDoor", who: "door" },
  { name: "door17in", place: "camp", cam: "tentDoorIn", who: "door" },
  { name: "door17open", place: "camp", cam: "tentDoor", who: "door", flap: 1 },
  { name: "out2bhalf", place: "camp", cam: "outside", flap: 0.5 },
  { name: "sky19", place: "camp", cam: "tentSky", who: "sky", sun: 0.35 },
  { name: "card3", place: "card", cam: "card3", who: "card3" },
  { name: "card4", place: "card", cam: "card4", who: "card4" },
  { name: "card4xy", place: "card", cam: L.cam([-100.45, 1.45, 3.3], [-100.62, 1.0, 0], 40), who: "card4" },
  { name: "card4xy0", place: "card", cam: L.cam([-100.45, 1.45, 3.3], [-100.62, 1.0, 0], 40), who: "card4", armies: [0, 0] },
  { name: "card4drop", place: "card", cam: "card4", who: "card4", armies: [6.5, 0] },
  { name: "card4drop2", place: "card", cam: "card4", who: "card4", armies: [10, 2.5] },
  { name: "hill", place: "path", cam: "hill", who: "hill" },
];
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);

preview({ w: 540, h: 960 }, (c) => {
  const w = new World(c.renderer, c.camera);
  c.scene.add(w.root);
  const o = c.opts, names: string[] = o.views ?? VIEWS.map((v) => v.name), T: number = o.t ?? 1.5;
  const viewOf = (n: string) => { const v = VIEWS.find((q) => q.name === n); if (!v) throw new Error(`set_outdoor: no view "${n}" (${VIEWS.map((q) => q.name).join(", ")})`); return v; };
  const camOf = (v: View): L.Cam => (typeof v.cam === "string" ? L.CAMS[v.cam] : v.cam);
  const stage = (v: View, f: number) => {
    const P = PEOPLE, a = (p: typeof P.liuBang, k = "") => w.actor(p, k);
    if (o.cast === false || !v.who) return;
    if (v.who === "gate") {
      const G = L.GATE;
      a(P.xiangYu).set(standing(G.xiangyu, yawTo(G.xiangyu, G.liuTo) * 0.5, f, 4)); a(P.liuBang).set(standing(G.liuTo, yawTo(G.liuFrom, G.liuTo), f, 1));
      w.prop("horse").put(G.horse);
    } else if (v.who === "gate18") w.prop("horse").put(L.GATE.horse);
    else if (v.who === "nx") {
      const N = L.NIGHT_X, I = N.informer;
      a(P.xiangYu).set({ ...seated(N.seat, f / 30), expr: "neutral", visible: true });
      a(P.caoWushang).set({ ...standing(I.at, I.facing, f, 13), ...kneel(I.sink / 0.38, I.at, 0) });
      w.prop("cup:xiangyu").put(N.seat.cup);
    } else if (v.who === "nl") {
      const N = L.NIGHT_L;
      a(P.xiangBo).set(standing(N.uncle, yawTo(N.uncle, N.liu) * 0.55, f, 5)); a(P.liuBang).set(standing(N.liu, yawTo(N.liu, N.uncle) * 0.55, f, 1));
    } else if (v.who === "day" || v.who === "cap") {
      const N = L.NIGHT_L;
      if (v.who === "day") {
        a(P.liuBang).set(standing(N.liuDay, 0.5, f, 1)); a(P.caoWushang).set(standing(N.informer, 0, f, 13));
        a(P.liuGuardB).set(standing(N.guards[0], 0, f, 21)); a(P.liuGuard).set(standing(N.guards[1], 0, f, 22));
      } else w.prop("cap").put(N.cap);
    } else if (v.who === "shadow") a(P.caoWushang).set(standing(L.SHADOW.at, L.SHADOW.facing, f, 13));
    else if (v.who === "door") {
      const O = L.CAMP.out;
      a(P.zhangLiang).set(standing(O.zhang, 0.2, f, 2)); a(P.liuBang).set(standing(O.liu, 0, f, 1)); a(P.fanKuai).set(standing(O.fankuai, -0.2, f, 3));
    } else if (v.who === "sky") { const Wt = L.CAMP.wait; a(P.zhangLiang).set(standing(Wt.zhang, 0, f, 2)); w.prop("tray").put(V(Wt.tray.x, 0, Wt.tray.z)); }
    else if (v.who === "card3") { const C = L.CARD.city; a(P.liuBang).set(standing(C.liu, -0.3, f, 1)); w.prop("flag").put(C.socket); }
    else if (v.who === "card4") { const K = L.CARD.versus; a(P.xiangYu).set(standing(K.xiangyu, 0.2, f, 4)); a(P.liuBang).set(standing(K.liu, -0.2, f, 1)); }
    else if (v.who === "hill") {
      const H = L.HILL, len = H.path[0].distanceTo(H.path[1]), yaw = yawTo(H.path[0], H.path[1]), along = (d: number) => H.path[0].clone().lerp(H.path[1], d / len), d0 = len * 0.55;
      w.prop("horse").put(along(d0), { facing: yaw });
      [a(P.fanKuai), a(P.liuGuard), a(P.liuGuardB), a(P.liuGuard, "c")].forEach((r, i) => r.set(standing(along(d0 - (H.gap0 + i * H.gap)), yaw, f, 30 + i)));
    }
  };
  const S = o.shake as undefined | { view: string; dx?: number; dy?: number; push?: number };
  let look = w.set.look("gate");
  const frame = (i: number) => {
    const v = viewOf(S ? S.view : names[Math.min(i, names.length - 1)]), base = camOf(v), f = Math.round(T * 30);
    let cam: CamPose = base;
    if (S) {
      const k = i, p = V(...base.pos), l = V(...base.look), fw = l.clone().sub(p), right = fw.clone().cross(V(0, 1, 0)).normalize();
      p.addScaledVector(right, (S.dx ?? 0) * k).add(V(0, (S.dy ?? 0) * k, 0)).addScaledVector(fw, (S.push ?? 0) * k);
      l.addScaledVector(right, (S.dx ?? 0) * k).add(V(0, (S.dy ?? 0) * k, 0));
      cam = { pos: p, look: l, fov: base.fov };
    }
    w.beginFrame(f);
    w.setPlace(v.place, v.who === "shadow" ? { light: { gain: 0 } } : {});
    w.setCamera(cam);
    if (v.sun !== undefined) w.set.setSun(v.sun);
    if (v.flap !== undefined) w.set.setFlap(v.flap);
    if (v.armies) w.set.setArmies(v.armies[0], v.armies[1]);
    stage(v, f);
    w.endFrame({ camera: cam, clock: T });
    look = w.look();
    console.log(`QA: view ${i} ${v.name} ${v.place}`);
  };
  return { cam: null, frame, ao: () => look.ao, bg: () => look.bg };
});
