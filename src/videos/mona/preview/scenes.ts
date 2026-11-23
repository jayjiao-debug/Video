// THE SCENES of 采访蒙娜丽莎的一天 as stills (first build, 23 Nov 2026): the stage (sets/stage.ts) in each scene's room,
// she in her picture, the side cast where the script puts them.
//   bash scripts/kit/queue/still.sh src/videos/mona/preview/scenes.ts <abs out.png> --size 540x960 --opts '{"scene":"s3"}'
//   bash scripts/kit/queue/still.sh src/videos/mona/preview/scenes.ts <abs out dir>/ --pick 0,1,2 --size 540x960 --opts '{"pages":[{"scene":"s1"},{"scene":"s2"},{"scene":"s3"}]}'
// Options: scene (a SCENES key); any field of a scene over it (room, mount, state, cracks, glass, crowd, stone, cake,
// soup, night, torch [x, y, r, k], plate [a, b], expr, hands, who [names], shot, gaze); shot "room" | "wide" | "close" or
// camPose { pos, look, fov }; pages (one option object per frame).
import * as THREE from "three";
import { preview, type Cam } from "../../wanbi/preview/common";
import { makeSun } from "../../bt/pbr";
import { RigCast, type Rig, type RigHead, type RigPose, type RigState, type RigSeat } from "../../group/kit/rig3d";
import type { CastLight } from "../../group/kit/cast";
import type { Expr } from "../../group/kit/toon";
import { LAB_CAST_LIGHT } from "../../group/sets/lab";
import { addPerson, PEOPLE, FACES, type Person } from "../people";
import { stageSet, LIFT, WZ, MOODS, SPOTS, PIC, type Room, type Mount, type PanelState } from "../sets/stage";

type V3 = [number, number, number];
const FACING = -0.5, GAZE = 0.5;
const CROSS: [V3, V3] = [[-0.035, 0.812 + LIFT, 0.222], [-0.135, 0.782 + LIFT, 0.185]];
const JAW: V3 = [-0.112, 1.062 + LIFT, 0.225];
const SHOTS: Record<string, Cam> = {
  room: { pos: [0, 1.5, 5.0], look: [0, 1.3, WZ], fov: 38 },
  wide: { pos: [0.5, 1.5, 5.8], look: [0, 1.4, WZ], fov: 46 },
  close: { pos: [0, 1.5, 3.1], look: [0, 1.5, 0], fov: 24 },
  theft: { pos: [0.25, 1.5, 5.0], look: [0.12, 1.3, WZ], fov: 38 },
  bed: { pos: [-0.05, 1.5, 4.8], look: [-0.12, 1.12, WZ], fov: 40 },
};
type Side = "leonardo" | "jester" | "napoleon" | "thief";
type Sc = {
  room: Room; mount: Mount; state: PanelState; cracks?: number; glass?: number; crowd?: number; stone?: number; cake?: number; soup?: number;
  night?: number; torch?: number[]; plate?: [string, string]; expr?: string; hands?: "cross" | "jaw"; who?: Side[]; shot?: string; gaze?: number;
};
export const SCENES: Record<string, Sc> = {
  s1: { room: "studio", mount: "easel", state: "head", expr: "pose", gaze: 1.0 },
  s2: { room: "studio", mount: "easel", state: "body", expr: "tired", who: ["jester"] },
  s3: { room: "cloux", mount: "easel", state: "done", expr: "pose", who: ["leonardo"] },
  s4a: { room: "palace0", mount: "frame", state: "done", cracks: 0.2, plate: ["枫丹白露宫", "国王的收藏"], expr: "pose" },
  s4b: { room: "palace1", mount: "frame", state: "done", cracks: 0.3, plate: ["王宫", "国王的收藏"], expr: "tired" },
  s4c: { room: "palace2", mount: "frame", state: "done", cracks: 0.4, plate: ["卢浮宫", "大革命以后"], expr: "tired" },
  s4d: { room: "bedroom", mount: "frame", state: "done", cracks: 0.45, plate: ["杜伊勒里宫", "1800"], expr: "pose", who: ["napoleon"], shot: "bed", gaze: -0.6 },
  s5: { room: "salon", mount: "frame", state: "done", cracks: 0.65, plate: ["卢浮宫", "1911"], expr: "pose", who: ["thief"], shot: "theft" },
  s6: { room: "louvre", mount: "frame", state: "done", cracks: 1, glass: 1, crowd: 1, plate: ["卢浮宫", ""], expr: "tired" },
  s6b: { room: "louvre", mount: "frame", state: "done", cracks: 1, glass: 1, crowd: 1, stone: 1, plate: ["卢浮宫", "1956"], expr: "caught" },
  s6c: { room: "louvre", mount: "frame", state: "done", cracks: 1, glass: 1, crowd: 1, cake: 1, plate: ["卢浮宫", "2022"], expr: "pose" },
  s6d: { room: "louvre", mount: "frame", state: "done", cracks: 1, glass: 1, crowd: 1, soup: 1, plate: ["卢浮宫", "2024"], expr: "tired" },
  s7: { room: "louvre", mount: "frame", state: "done", cracks: 1, glass: 1, plate: ["卢浮宫", ""], expr: "pose" },
  s8: { room: "louvre", mount: "frame", state: "done", cracks: 1, glass: 1, night: 0.8, plate: ["卢浮宫", ""], expr: "sore", hands: "jaw" },
  s9: { room: "louvre", mount: "frame", state: "done", cracks: 1, glass: 1, night: 0.8, torch: [0, 1.58, 0.55, 0.96], plate: ["卢浮宫", ""], expr: "pose" },
};

preview({ w: 540, h: 960 }, (c) => {
  const o = c.opts, M = c.mats();
  const pages: Record<string, any>[] = Array.isArray(o.pages) && o.pages.length ? o.pages : [{}];
  const page = (i: number): Sc & Record<string, any> => { const pg = { ...o, ...pages[((i % pages.length) + pages.length) % pages.length] }; const sc = SCENES[pg.scene ?? "s7"]; if (!sc) throw new Error(`scenes: no scene called ${pg.scene}`); return { ...sc, ...pg }; };
  const S = stageSet(M); c.scene.add(S.group);
  const sun = makeSun(); c.scene.add(sun, sun.target); sun.position.set(-5, 6.2, 9.4); sun.target.position.set(0, 1.3, 0);
  const sunK = sun.intensity;
  const rc = new RigCast(c.scene, { light: { ...LAB_CAST_LIGHT, bleach: 0, bodyShadeK: 0.4, contact: "#5a4a3a" } as CastLight as never });
  const P = PEOPLE as Record<string, Person>;
  const mona: Rig = addPerson(rc, P[o.who0 ?? "mona"]);
  const side = {} as Record<Side, Rig>;
  for (const n of ["leonardo", "jester", "napoleon", "thief"] as Side[]) side[n] = addPerson(rc, P[n]);
  for (const r of [mona, ...Object.values(side)]) for (const q of r.accRules()) console.log(`QA: RULE ${q.acc}: ${q.rule}: ${q.msg}`);
  const v = (a: V3) => new THREE.Vector3(a[0], a[1], a[2]);
  let mood = MOODS.louvre;
  return {
    cam: (i) => { const Pg = page(i); if (Pg.camPose) return Pg.camPose as Cam; const s = SHOTS[Pg.shot ?? "room"]; if (!s) throw new Error(`scenes: no shot called ${Pg.shot}`); return s; },
    bg: (i) => MOODS[page(i).room].bg,
    ao: { aoRadius: 0.4, distanceFalloff: 1.0, intensity: 1.5, color: "#2a1a10" },
    frame: (fi, t) => {
      const Pg = page(fi);
      // ----- the stage
      S.room(Pg.room); S.mount(Pg.mount); S.state(Pg.state); S.cracks(Pg.cracks ?? 0); S.glass(Pg.glass ?? 0); S.crowd(Pg.crowd ?? 0);
      S.stain("stone", Pg.stone ?? 0); S.stain("cake", Pg.cake ?? 0); S.stain("soup", Pg.soup ?? 0);
      const pl = Pg.plate ?? ["", ""]; S.plate(pl[0], pl[1]);
      mood = MOODS[Pg.room];
      sun.color.set(mood.sun); sun.intensity = sunK * mood.k;
      const night = Pg.night ?? mood.night, torch: number[] = Pg.torch ?? mood.glow ?? [0, 0, 0.4, 0];
      S.dim(1 - night); S.torch(torch[0], torch[1], torch[2], torch[3]);
      // ----- she
      const e = Pg.expr as string | undefined;
      const st: Partial<RigState> = { at: new THREE.Vector3(0, LIFT, 0), facing: Pg.facing ?? FACING, gaze: Pg.gaze ?? GAZE, visible: true, blink: Pg.blink ?? 0 };
      st.expr = (e === undefined ? undefined : e in FACES ? FACES[e] : (e as Expr)) as RigState["expr"];
      if (Pg.hands === "jaw") { st.hands = [v(JAW), v(CROSS[1])] as RigState["hands"]; st.armFront = [true, undefined]; st.head = { dy: -0.03, tilt: -5.5 } as RigHead; st.lean = { pitch: 0.07 } as RigState["lean"]; }
      else { st.hands = [v(CROSS[0]), v(CROSS[1])] as RigState["hands"]; st.armFront = [undefined, undefined]; st.head = {} as RigHead; st.lean = { pitch: 0 } as RigState["lean"]; }
      st.pose = { kind: "hold", t: 0.4 + t } as RigPose;
      mona.set(st); mona.group.userData.hmGround = LIFT;
      // ----- the side cast
      const who: Side[] = Pg.who ?? [];
      for (const n of Object.keys(side) as Side[]) if (!who.includes(n)) side[n].set({ visible: false });
      if (who.includes("jester")) side.jester.set({ visible: true, at: v(Pg.jesterAt ?? [-0.28, 0, 1.6]), facing: 0.35, pose: { kind: "cheer", t } as RigPose, expr: "smile" as Expr, gaze: 0.5 });
      if (who.includes("leonardo")) {
        const ch = SPOTS.chair, seat: RigSeat = { top: new THREE.Vector3(ch.at[0], ch.top, ch.at[2]), back: 0.05, front: 0.22, backrest: 0.22, backrestTop: ch.top + 0.9, floor: 0 };
        side.leonardo.set({ visible: true, at: v(ch.at), facing: ch.yaw, seat, pose: { kind: "sit", t } as RigPose, expr: "doze" as Expr, blink: 1, head: { tilt: 9, dy: -0.06 } as RigHead, lean: { pitch: 4 } as RigState["lean"] });
      }
      if (who.includes("napoleon")) {
        const b = SPOTS.bed, seat: RigSeat = { top: new THREE.Vector3(b.at[0], b.top, b.at[2]), back: 0.02, front: 0.9, floor: 0 };
        side.napoleon.set({ visible: true, at: v(b.at), facing: 0.1, seat, pose: { kind: "hold", t } as RigPose, expr: (Pg.napExpr ?? "shock") as Expr, gaze: 0.9,
          hands: [v([b.at[0] - 0.13, b.top + 0.5, b.at[2] + 0.2]), v([b.at[0] + 0.13, b.top + 0.5, b.at[2] + 0.2])] as RigState["hands"] });
      }
      if (who.includes("thief")) side.thief.set({ visible: true, at: v(Pg.thiefAt ?? [0.72, 0, 0.66]), facing: Pg.thiefFacing ?? -2.3, turn: Pg.thiefTurn, pose: { kind: "hold", t } as RigPose, expr: (Pg.thiefExpr ?? "scheming") as Expr, gaze: Pg.thiefGaze ?? -0.5,
        hands: (Pg.thiefHands ?? [[PIC.x1 + 0.1, 1.36, 0.5], [PIC.x1 + 0.1, 1.06, 0.5]]).map((q: V3) => v(q)) as RigState["hands"] });
      rc.update(c.camera, c.h);
      if (fi === (o.f ?? 0) && o.dbg) { const hd = mona.headWorld(); console.log(`QA: LOG head ${hd.x.toFixed(3)},${hd.y.toFixed(3)},${hd.z.toFixed(3)}`); for (const n of who) { const h = side[n].headWorld(); console.log(`QA: LOG ${n} head ${h.x.toFixed(3)},${h.y.toFixed(3)},${h.z.toFixed(3)}`); } }
    },
  };
});
