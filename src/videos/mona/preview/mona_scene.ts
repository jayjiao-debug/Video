// MONA IN HER PAINTING (look test, 23 Nov 2026): the figure inside the panel (sets/painting.ts), as stills or as the
// motion test (the smile held, the gallery goes dark, the smile drops, she rubs her jaw, a torch, the smile is back).
//   bash scripts/kit/queue/still.sh src/videos/mona/preview/mona_scene.ts <abs out.png> --size 540x960 [--opts '<json>']
//   bash scripts/kit/queue/still.sh src/videos/mona/preview/mona_scene.ts <abs out dir>/ --frames 210 --size 540x960 --opts '{"motion":true}'
// Options: who (a PEOPLE key); expr (a FACES key or a rig expression); hands "cross" | "jaw" | "down"; shot "wall" |
// "mid" | "close" | "side"; night 0..1 (how dark the gallery is); torch [x, y, r, k]; facing, gaze; motion: true (the
// timed test: every frame is a pure function of its time); pages (one option object per frame, for stills).
import * as THREE from "three";
import { preview, type Cam } from "../../wanbi/preview/common";
import { makeSun } from "../../bt/pbr";
import { RigCast, rigMood, rigHeadAdd, type Rig, type RigFace, type RigHead, type RigPose, type RigState } from "../../group/kit/rig3d";
import type { CastLight } from "../../group/kit/cast";
import type { Expr } from "../../group/kit/toon";
import { LAB_CAST_LIGHT } from "../../group/sets/lab";
import { addPerson, PEOPLE, FACES, type Person } from "../people";
import { paintingSet, OPEN, FRAME_Z } from "../sets/painting";

type V3 = [number, number, number];
const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const ease = (x: number) => { const t = clamp(x); return t * t * (3 - 2 * t); };
const ramp = (t: number, a: number, b: number) => ease((t - a) / (b - a));
const mix3 = (a: V3, b: V3, k: number): V3 => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];

/** the pose of the panel: her body turned to her right, the face to us */
const FACING = -0.5, GAZE = 0.5;
/** her hands (world, she stands at the origin): the left forearm laid across, the right hand over the left wrist */
const CROSS: [V3, V3] = [[-0.035, 0.812, 0.222], [-0.135, 0.782, 0.185]];
/** the right hand at her jaw (the cheek beside the mouth, on her right) */
const JAW: V3 = [-0.112, 1.062, 0.225];
const SHOTS: Record<string, Cam> = {
  wall: { pos: [0, 1.16, 5.5], look: [0, 1.1, FRAME_Z], fov: 24 },
  mid: { pos: [0, 1.18, 4.75], look: [0, 1.13, FRAME_Z], fov: 24 },
  close: { pos: [0, 1.22, 2.75], look: [0, 1.2, 0], fov: 22 },
  side: { pos: [1.5, 1.3, 4.6], look: [0, 1.1, FRAME_Z], fov: 24 },
};
/** plain rig expressions -> her own faces (the acted changes of rigMood run on the rig's names) */
const HERS: Record<string, keyof typeof FACES> = { smile: "pose", neutral: "plain", deadpan: "tired", pained: "sore", sigh: "sigh", shock: "caught" };
const hers = (e: Expr | RigFace): Expr | RigFace => (typeof e === "string" ? (e in HERS ? FACES[HERS[e]] : e) : { ...e, marks: "neutral" as Expr });

preview({ w: 540, h: 960 }, (c) => {
  const o = c.opts, M = c.mats();
  const pages: Record<string, any>[] = Array.isArray(o.pages) && o.pages.length ? o.pages : [{}];
  const page = (i: number): Record<string, any> => ({ ...o, ...pages[((i % pages.length) + pages.length) % pages.length] });
  const P = paintingSet(M, { wall: o.wall }); c.scene.add(P.group);
  const sun = makeSun(); c.scene.add(sun, sun.target); sun.position.set(-5, 6.2, 9.4); sun.target.position.set(0, 1, 0);
  const rc = new RigCast(c.scene, { light: { ...LAB_CAST_LIGHT, bleach: o.bleach ?? 0, ...(o.shade ? { shade: o.shade } : {}), bodyShadeK: 0.4, contact: "#5a4a3a" } as CastLight as never });
  const p = (PEOPLE as Record<string, Person>)[o.who ?? "mona"];
  if (!p) throw new Error(`mona_scene: nobody called ${o.who}`);
  const rig: Rig = addPerson(rc, p);
  for (const r of rig.accRules()) console.log(`QA: RULE ${p.name}: ${r.acc}: ${r.rule}: ${r.msg}`);
  const v = (a: V3) => new THREE.Vector3(a[0], a[1], a[2]);
  const camOf = (i: number, t: number): Cam => {
    const Pg = page(i);
    if (Pg.camPose) return Pg.camPose as Cam;
    const s = SHOTS[Pg.shot ?? "wall"];
    if (!s) throw new Error(`mona_scene: no shot called ${Pg.shot}`);
    if (!o.motion) return s;
    // the reporter's hand: a slow breath, and a small step in when the smile drops
    const k = ramp(t, 2.6, 3.4) - ramp(t, 5.3, 5.5) * 0.4, by = 0.006 * Math.sin(t * 1.9), bx = 0.004 * Math.sin(t * 1.3 + 1);
    return { pos: [s.pos[0] + bx, s.pos[1] + by + 0.04 * k, s.pos[2] - 1.5 * k], look: [s.look[0], s.look[1] + 0.07 * k, s.look[2]], fov: s.fov };
  };
  return {
    cam: (i, t) => camOf(i, t),
    bg: () => "#1c140c",
    ao: { aoRadius: 0.4, distanceFalloff: 1.0, intensity: 1.5, color: "#2a1a10" },
    frame: (fi, t) => {
      const Pg = page(fi);
      const st: Partial<RigState> = { at: new THREE.Vector3(0, 0, 0), facing: Pg.facing ?? FACING, gaze: Pg.gaze ?? GAZE, visible: true };
      // (the "hold" pose only for its elbows: down and a little out, where pinned hands leave them to the pose)
      let pose: Partial<RigPose> = { kind: Pg.hands === "down" ? "idle" : "hold" }, night = Pg.night ?? 0, torch: number[] = Pg.torch ?? [0, 0, 0.4, 0];
      if (o.motion) {
        // ----- the motion test (seconds)
        const m = rigMood(t, [{ at: 0, expr: "smile" }, { at: 2.8, expr: "sigh", how: "sink" }, { at: 3.75, expr: "pained", how: "blink" }, { at: 5.42, expr: "shock", how: "take" }, { at: 5.72, expr: "smile", how: "blink" }]);
        st.expr = hers(m.expr) as RigState["expr"];
        if (m.blink !== undefined) st.blink = m.blink; else if (Math.abs(t - 0.75) < 0.05) st.blink = 1;
        night = 0.8 * ramp(t, 1.25, 1.75);
        // the eyes check the room, left then right, before she lets go
        const look = t < 1.9 ? 0 : t < 2.25 ? -1.3 * ramp(t, 1.9, 2.0) : t < 2.65 ? -1.3 + 2.0 * ramp(t, 2.25, 2.37) : 0.7 * (1 - ramp(t, 2.65, 2.78));
        // after the torch has gone by, her eyes follow it out
        st.gaze = GAZE + look + 0.6 * ramp(t, 6.55, 6.7);
        // the right hand: up to the jaw, round and round, and back in four frames
        const up = ramp(t, 3.2, 3.7) * (1 - ramp(t, 5.42, 5.55)), rub = clamp((t - 3.7) / 0.3) * (1 - ramp(t, 5.3, 5.42)), a = (t - 3.7) * 2 * Math.PI * 1.5;
        const hR = mix3(CROSS[0], JAW, up); hR[2] += 0.07 * Math.sin(Math.PI * up); hR[0] -= 0.05 * Math.sin(Math.PI * up);
        hR[0] += 0.011 * rub * Math.cos(a); hR[1] += 0.016 * rub * Math.sin(a);
        st.hands = [v(hR), v(CROSS[1])] as RigState["hands"];
        st.armFront = [up > 0.35, undefined];
        // the body lets go with the smile: the shoulders sink, the head tips onto the hand
        const sag = ramp(t, 2.8, 3.3) * (1 - ramp(t, 5.42, 5.52));
        const own: RigHead = { dy: -0.035 * sag, tilt: -5.5 * up + 1.2 * rub * Math.sin(a) } as RigHead;
        st.head = rigHeadAdd(m.head, own);
        if (sag > 0.01) st.lean = { pitch: 0.07 * sag } as RigState["lean"];
        // the torch: in from the right at 5.2, on her face, wobbling, and out to the left
        const tin = ramp(t, 5.15, 5.45), tout = ramp(t, 6.45, 6.85);
        torch = [1.1 * (1 - tin) - 1.3 * tout + 0.02 * Math.sin(t * 7), 1.22 + 0.25 * (1 - tin) + 0.015 * Math.sin(t * 5.3), 0.5, 0.96 * clamp(tin * 3) * (1 - clamp(tout * 1.4))];
      } else {
        const e = Pg.expr as string | undefined;
        st.expr = (e === undefined ? undefined : e in FACES ? FACES[e] : (e as Expr)) as RigState["expr"];
        const hands = (Pg.hands ?? "cross") as string;
        if (hands === "cross") st.hands = [v(CROSS[0]), v(CROSS[1])] as RigState["hands"];
        else if (hands === "rub") { pose = { kind: "shh", arm: 0, amount: Pg.amount ?? 1, jaw: Pg.jaw ?? 1.3 }; st.hands = [null, v(CROSS[1])] as RigState["hands"]; st.head = { dy: -0.03, tilt: Pg.tilt ?? -5 } as RigHead; st.lean = { pitch: 0.07 } as RigState["lean"]; }
        else if (hands === "jaw") { st.hands = [v(JAW), v(CROSS[1])] as RigState["hands"]; st.armFront = [true, undefined]; st.head = { dy: -0.03, tilt: -5.5 } as RigHead; st.lean = { pitch: 0.07 } as RigState["lean"]; }
        if (Pg.blink !== undefined) st.blink = Pg.blink;
        if (Pg.tilt !== undefined) st.head = { tilt: Pg.tilt } as RigHead;
      }
      st.pose = { ...pose, t: 0.4 + t } as RigPose;
      rig.set(st);
      rig.group.userData.hmGround = 0;
      P.dim(1 - night);
      P.torch(torch[0], torch[1], torch[2], torch[3]);
      rc.update(c.camera, c.h);
      if (fi === (o.f ?? 0) && o.dbg) { const h0 = rig.handWorld(0), h1 = rig.handWorld(1), hd = rig.headWorld(); console.log(`QA: LOG head ${hd.x.toFixed(3)},${hd.y.toFixed(3)},${hd.z.toFixed(3)} hand0 ${h0.x.toFixed(3)},${h0.y.toFixed(3)},${h0.z.toFixed(3)} hand1 ${h1.x.toFixed(3)},${h1.y.toFixed(3)},${h1.z.toFixed(3)} open ${JSON.stringify(OPEN)}`); }
    },
  };
});
