// THE CAST LINE-UP of 采访八百壮士的一天: the cast in a row on a plain stage.
//   bash scripts/kit/queue/still.sh src/videos/sihang/preview/people_lineup.ts <abs out> --size 540x960 [--opts '<json>']
// Options: slots [{ who, expr?, facing?, turn?, pose?, hands?, gaze?, lookDown?, hide? }] (who = a PEOPLE key, or
// "hair:<kind>[:seed]"); gap (m); view "front" | "34" | "high" | "back"; fov; far; cy; tall; margin; camX; camUp;
// black: true (the silhouette test, with raw: true); bg, ground; noGround; pages (one option object per frame).
import * as THREE from "three";
import { preview, type Cam } from "../../wanbi/preview/common";
import { makeSun } from "../../bt/pbr";
import { RigCast, type Rig, type RigPose, type RigState } from "../../group/kit/rig3d";
import type { CastLight } from "../../group/kit/cast";
import type { Expr } from "../../group/kit/toon";
import { LAB_CAST_LIGHT } from "../../group/sets/lab";
import { addPerson, PEOPLE, FACES, type Person } from "../people";

type Slot = { who: string; expr?: string; facing?: number; turn?: number; pose?: string; hands?: ([number, number, number] | null)[]; gaze?: number; lookDown?: number; lean?: number; hide?: string[]; blink?: number; y?: number; amount?: number; tilt?: number; roll?: number; arm?: 0 | 1; armFront?: [boolean | undefined, boolean | undefined]; twist?: number };

const DIRS: Record<string, [number, number, number]> = { front: [0, 0.08, 1], "34": [0.6, 0.2, 0.77], "34r": [-0.6, 0.2, 0.77], high: [0, 0.45, 0.9], back: [0, 0.08, -1], back34: [0.6, 0.2, -0.77] };

preview({ w: 540, h: 960 }, (c) => {
  const o = c.opts, M = c.mats();
  const slots: Slot[] = Array.isArray(o.slots) ? o.slots : [{ who: "mancang" }, { who: "lao" }, { who: "xie" }];
  const pages: Record<string, any>[] = Array.isArray(o.pages) && o.pages.length ? o.pages : [{}];
  const page = (i: number): Record<string, any> => ({ ...o, ...pages[((i % pages.length) + pages.length) % pages.length] });
  const gap: number = o.gap ?? 0.86, n = slots.length, black = !!o.black;
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), M.paint({ color: o.ground ?? "#cdbfa6" }));
  ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; ground.visible = !black && !o.noGround; c.scene.add(ground);
  const sun = makeSun(); c.scene.add(sun, sun.target); sun.position.set(-7, 7.7, 9.4);
  const rc = new RigCast(c.scene, { light: { ...LAB_CAST_LIGHT, bleach: o.bleach ?? 0.7, bodyShadeK: 0.4, contact: "#8a93c2" } as CastLight as never });
  const personOf = (w: string): Person => {

    const p = (PEOPLE as Record<string, Person>)[w];
    if (!p) throw new Error(`people_lineup: nobody called ${w} (${Object.keys(PEOPLE).join(", ")})`);
    return p;
  };
  const blackMat = new THREE.MeshBasicMaterial({ color: o.blackCol ?? "#17151b" });
  const blacken = (g: THREE.Object3D) => g.traverse((o3) => { const m = o3 as THREE.Mesh; if (m.isMesh && !Array.isArray(m.material) && m.material.colorWrite !== false && m.material.visible !== false) m.material = blackMat; });
  const figs = slots.map((slot, i) => {
    const p = personOf(slot.who), at = new THREE.Vector3((i - (n - 1) / 2) * gap, slot.y ?? 0, 0);
    const rig: Rig = addPerson(rc, p);
    for (const r of rig.accRules()) console.log(`QA: RULE ${p.name}: ${r.acc}: ${r.rule}: ${r.msg}`);
    if (black) blacken(rig.group);
    return { slot, rig, p, at };
  });
  const camOf = (P: Record<string, any>): Cam => {
    const fov: number = P.fov ?? 30, tv = Math.tan((fov * Math.PI) / 360), W = (n - 1) * gap + (P.margin ?? 1.0), H = P.tall ?? 2.0, cy: number = P.cy ?? 0.86;
    const d = Math.max(W / (2 * tv * (c.w / c.h)), H / (2 * tv)) + (P.far ?? 0), dir = DIRS[P.view ?? "front"];
    if (!dir) throw new Error(`people_lineup: no view called ${P.view}`);
    const dl = Math.hypot(...dir);
    return P.camPose ?? { pos: [(dir[0] / dl) * d + (P.camX ?? 0), cy + (dir[1] / dl) * d + (P.camUp ?? 0), (dir[2] / dl) * d], look: [P.camX ?? 0, cy, 0], fov };
  };
  return {
    cam: (i) => camOf(page(i)),
    bg: () => o.bg ?? (black ? "#efe6d2" : "#e9dcc0"),
    ao: { aoRadius: 0.55, distanceFalloff: 1.0, intensity: 1.6, color: "#3a2a1c" },
    frame: (fi, t) => {
      figs.forEach((f, i) => {
        const s = f.slot, kind = (s.pose ?? "idle") as RigPose["kind"];
        const ex = s.expr === undefined ? undefined : s.expr in FACES ? FACES[s.expr] : (s.expr as Expr);
        const st: Partial<RigState> = { at: f.at, facing: s.facing ?? 0, turn: s.turn, pose: { kind, t: 0.4 + t + i * 0.13, amount: s.amount, arm: s.arm } as RigPose, expr: ex as RigState["expr"], gaze: s.gaze ?? 0, lookDown: s.lookDown, blink: s.blink, visible: true };
        if (s.lean || s.roll) st.lean = { pitch: s.lean, roll: s.roll } as RigState["lean"];
        if (s.tilt) st.head = { tilt: s.tilt };
        if (s.armFront) st.armFront = s.armFront;
        if (s.twist) st.twist = s.twist;
        if (s.hide) st.hide = s.hide;
        if (s.hands) st.hands = s.hands.map((h) => (h ? new THREE.Vector3(f.at.x + h[0], f.at.y + h[1], f.at.z + h[2]) : null)) as RigState["hands"];
        f.rig.set(st);
        f.rig.group.userData.hmGround = f.at.y;
      });
      rc.update(c.camera, c.h);
      if (black) for (const f of figs) { const b = (f.rig as unknown as { blob?: THREE.Object3D }).blob; if (b) b.visible = false; }
      if (fi === (o.f ?? 0) && o.dbg) figs.forEach((f) => { const d = f.rig.dim as unknown as Record<string, number>, h0 = f.rig.handWorld(0), h1 = f.rig.handWorld(1), hd = f.rig.headWorld(); console.log(`LOG: dim ${f.p.name} R ${d.R.toFixed(3)} Ht ${d.Ht.toFixed(3)} hipY ${d.hipY.toFixed(3)} rb ${d.rb.toFixed(3)} head ${hd.y.toFixed(3)} hand0 ${h0.x.toFixed(2)},${h0.y.toFixed(2)},${h0.z.toFixed(2)} hand1 ${h1.x.toFixed(2)},${h1.y.toFixed(2)},${h1.z.toFixed(2)} at ${f.at.x.toFixed(2)}`); });
      if (fi === (o.f ?? 0)) figs.forEach((f, i) => { const a = f.at.clone().project(c.camera), hd = f.rig.headWorld().project(c.camera); console.log(`LOG: slot ${i} ${f.p.name} foot ${Math.round((a.x * 0.5 + 0.5) * c.w)},${Math.round((0.5 - a.y * 0.5) * c.h)} head ${Math.round((hd.x * 0.5 + 0.5) * c.w)},${Math.round((0.5 - hd.y * 0.5) * c.h)}`); });
    },
  };
});
