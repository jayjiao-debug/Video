// Stills of the shared action recipes (shots/common.ts) with the real World: the proof that they work.
//   node scripts/rig3d/render.mjs src/videos/arthur/preview/act_test.ts out.png --size 360x640 --opts '{"test":"pull","u":0.5}'
//   node scripts/rig3d/render.mjs src/videos/arthur/preview/act_test.ts outdir --pick 0,2,4,6,8,10 --opts '{"test":"pull","steps":10}'   (u = i / steps)
// test: pull (u, side) | tug (who, side, t, effort) | raise | carry (facing, d) | offer | kneel (k) | crowd (k, season) |
//       field | walk (d). cam overrides the camera; season 0..3.
import * as THREE from "three";
import { preview, type Cam } from "./common";
import { World } from "../world";
import { YARD_AO } from "../sets/yard";
import { PEOPLE, type Person } from "../people";
import * as C from "../shots/common";
import type { CamPose, V3Like } from "../story";

const arr = (v: V3Like): [number, number, number] => (Array.isArray(v) ? v : [v.x, v.y, v.z]);
preview({ w: 360, h: 640, test: "pull", steps: 10, season: 0 }, (c) => {
  const w = new World(c.renderer, c.camera);
  c.scene.add(w.root);
  const o = c.opts, bg = new THREE.Color();
  const who = (n: string): Person => (n === "kay" ? PEOPLE.kay : n === "ector" ? PEOPLE.ector : n === "arthur" ? PEOPLE.arthur : n === "king" ? PEOPLE.arthurKing : n?.startsWith("lord") ? PEOPLE.lord(+n.slice(4) || 0) : n?.startsWith("guard") ? PEOPLE.guard(+n.slice(5) || 0) : n?.startsWith("com") ? PEOPLE.commoner(+n.slice(3) || 0) : PEOPLE.arthur);
  const run = (i: number): Cam => {
    const test: string = o.test, t = (o.t ?? 0) + i / 30;
    w.beginFrame(i);
    let cam: CamPose = o.cam ?? C.STAGE.putBack.cam;
    const A = w.actor(PEOPLE.arthur);
    const rep = (r: C.Rig, tag: string) => console.log(`QA: ${tag} reach ${r.qa.reach.toFixed(3)} clear ${r.qa.clear.toFixed(3)} held ${r.qa.held.toFixed(3)} hand0 ${r.handWorld(0).toArray().map((v) => v.toFixed(2))} head ${r.headWorld().toArray().map((v) => v.toFixed(2))}`);
    if (test === "pull") {
      const u = o.u ?? i / (o.steps ?? 10), side = o.side ?? "R";
      w.setCamera(cam);
      C.pullOut(w, A, u, { side, t, extra: { expr: "smile" } });
      const P = C.STAGE.putBack;
      w.actor(PEOPLE.ector).set({ at: P.ector.at, facing: P.ector.facing, pose: { kind: "idle", t }, expr: "shock", visible: true });
      w.actor(PEOPLE.kay).set({ at: P.kay.at, facing: P.kay.facing, pose: { kind: "idle", t }, expr: "shock", visible: true });
      w.update(); C.pullOutAfter(w, A, u, side); rep(A, `pull u ${u.toFixed(2)}`);
    } else if (test === "tug") {
      const r = w.actor(who(o.who ?? "lord0"));
      w.setCamera(cam);
      C.tug(w, r, { side: o.side ?? "R", t, effort: o.effort ?? 0.9, twist: o.twist, out: o.out, extra: { expr: o.expr ?? "pained" } });
      w.update(); rep(r, `tug ${o.who ?? "lord0"} ${o.side ?? "R"}`);
    } else if (test === "raise") {
      cam = o.cam ?? { pos: [0.2, 1.4, 4.0], look: [0.2, 1.1, 0], fov: 40 };
      w.setCamera(cam);
      const r = w.actor(who(o.who ?? "arthur")), at = o.at ? C.v3(o.at) : C.SPOT.drawR.clone();
      C.raise(r, at, { arm: o.arm ?? 0, t });
      w.update(); C.raiseAfter(w, r, o.arm ?? 0); rep(r, "raise");
    } else if (test === "carry") {
      cam = o.cam ?? { pos: [1.6, 1.35, 5.2], look: [1.6, 0.9, 1.0], fov: 40 };
      w.setCamera(cam);
      const facing = o.facing ?? -Math.PI / 2, d = (o.d ?? 0.4) + i * 0.11;
      A.set({ at: C.V(1.6, 0, 1.0), facing, pose: C.rigWalk(d, 3.2), expr: "smile", visible: true });
      w.update(); C.carry(w, A, facing, o.arm ?? 0); rep(A, "carry"); console.log(`QA: tip ${w.stone.tip().toArray().map((v) => v.toFixed(2))}`);
    } else if (test === "offer") {
      cam = o.cam ?? { pos: [1.6, 1.35, 4.6], look: [1.6, 0.9, 1.0], fov: 40 };
      w.setCamera(cam);
      const at = C.V(1.9, 0, 1.0), K = w.actor(PEOPLE.kay), kat = C.V(1.0, 0, 1.0);
      A.set({ at, facing: -0.9, pose: { kind: "idle", t }, hands: [C.offerPoint(at, -1), null], expr: "happy", visible: true });
      K.set({ at: kat, facing: 0.9, pose: { kind: "idle", t }, expr: "shock", visible: true });
      w.update(); C.offer(w, A, 0, -1); rep(A, "offer");
    } else if (test === "kneel") {
      cam = o.cam ?? { pos: [-1.6, 1.35, 4.9], look: [-2.1, 0.7, 0.2], fov: 40 };
      w.setCamera(cam);
      const k = o.k ?? i / (o.steps ?? 10);
      const ps: [Person, number, number][] = [[PEOPLE.ector, -1.5, 0.5], [PEOPLE.kay, 1.5, 0.6], [PEOPLE.lord(0), -3.0, -0.3], [PEOPLE.commoner(0), 3.0, -0.3], [PEOPLE.lord(1), -2.2, 1.6], [PEOPLE.commoner(1), 2.3, 1.7]];
      for (const [p, x, z] of ps) { const at = C.V(x, 0, z); w.actor(p).set({ at, facing: C.yawTo(at, [0, 0, 0]) * 0.5, pose: { kind: "idle", t }, expr: "neutral", ...C.kneel(k, at), visible: true }); }
      C.raise(A, C.SPOT.drawR.clone(), { t });
      w.update(); C.raiseAfter(w, A, 0);
    } else if (test === "crowd") {
      cam = o.cam ?? C.STAGE.yardWide;
      w.setCamera(cam);
      const k = o.k ?? 0;
      for (const s of C.crowd()) w.actor(s.who, s.key).set({ at: s.at, facing: s.facing, pose: o.cheer ? { kind: "cheer", t: t + s.id * 0.13, amount: 1 } : { kind: "idle", t: t + s.id }, expr: s.kind === "lord" ? "stern" : "happy", ...C.alive(t, s.id), ...(k > 0 ? C.kneel(k, s.at) : {}), visible: true });
      const r = w.actor(o.king ? PEOPLE.arthurKing : PEOPLE.arthur);
      C.raise(r, C.SPOT.drawR.clone(), { t });
      w.update(); C.raiseAfter(w, r, 0);
    } else if (test === "field") {
      const F = C.STAGE.field; cam = o.cam ?? F.cam;
      w.setCamera(cam);
      w.actor(PEOPLE.kay).set({ at: F.kay.at, facing: F.kay.facing, pose: { kind: "idle", t }, expr: "smug", visible: true });
      A.set({ at: F.arthur.at, facing: F.arthur.facing, pose: { kind: "idle", t }, expr: "happy", visible: true });
      w.set.anchors.fieldCrowd.forEach((p, k) => w.actor(PEOPLE.commoner(k)).set({ at: p, facing: 0, pose: { kind: "cheer", t: t + k * 0.21, amount: 1 }, expr: "happy", visible: true }));
      w.update();
    } else if (test === "cast") {
      cam = o.cam ?? { pos: [0, 1.3, 6.2], look: [0, 0.8, 0], fov: 40 };
      w.setCamera(cam);
      const names: string[] = o.names ?? ["arthur", "kay", "ector", "lord0", "guard0", "com0"];
      names.forEach((n, k) => w.actor(who(n)).set({ at: C.V((k - (names.length - 1) / 2) * 0.75, 0, 1.2), facing: 0, pose: { kind: "idle", t }, expr: "neutral", visible: true }));
      w.update();
    }
    const P = { camera: cam, season: (o.season ?? 0) as 0 | 1 | 2 | 3 };
    w.endFrame(P);
    c.scene.background = bg.set(w.bg());
    return { pos: arr(cam.pos), look: arr(cam.look), fov: cam.fov } as Cam;
  };
  return { cam: (i) => run(i), ao: YARD_AO, bg: "#bfe3f7" };
});
