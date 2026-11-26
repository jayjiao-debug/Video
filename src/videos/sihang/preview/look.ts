// A LOOK at a place of 采访八百壮士的一天 through the film's own World: any camera (LOCAL to the place's island), any
// params, any people standing about. One "frame" = one page of `pages` (each merged over the options).
//   bash scripts/kit/queue/still.sh src/videos/sihang/preview/look.ts <abs out.png> --size 540x960 --opts '<json>'
// Options: place; params { name: value }; view { pos, look, fov } (local); t (seconds);
//   people [{ who (a PEOPLE key), at [x, y, z] (local), facing, expr?, pose?, turn?, key?, hands? [[x,y,z]|null, ...] (local) }]
//   pages [ { ...the same keys } ]
import * as THREE from "three";
import { preview } from "../../wanbi/preview/common";
import { World } from "../world";
import { PEOPLE, FACES, type Person } from "../people";
import { ISLAND, type Place } from "../places";
import type { ParamValue } from "../sets";
import type { RigPose, RigState } from "../../group/kit/rig3d";
import type { Expr } from "../../group/kit/toon";

type Who = { who: string; at: [number, number, number]; facing?: number; expr?: string; pose?: string; turn?: number; key?: string; hands?: ([number, number, number] | null)[]; lookDown?: number; seat?: number };
preview({ w: 540, h: 960 }, (c) => {
  const w = new World(c.renderer, c.camera);
  c.scene.add(w.root);
  const o = c.opts, pages: Record<string, any>[] = Array.isArray(o.pages) && o.pages.length ? o.pages : [{}];
  const pose = (i: number) => {
    const P = { ...o, ...pages[((i % pages.length) + pages.length) % pages.length] } as Record<string, any>;
    const place = (P.place ?? "hall") as Place, x0 = ISLAND[place], t = typeof P.t === "number" ? P.t : 0, f = Math.round(t * 30);
    w.beginFrame(f);
    w.setPlace(place);
    for (const [k, val] of Object.entries((P.params ?? {}) as Record<string, ParamValue>)) w.set.param(k, val);
    const v = P.view ?? { pos: [0, 1.5, 4], look: [0, 1.2, -4], fov: 62 };
    const cam = { pos: [x0 + v.pos[0], v.pos[1], v.pos[2]] as [number, number, number], look: [x0 + v.look[0], v.look[1], v.look[2]] as [number, number, number], fov: v.fov ?? 62 };
    w.setCamera(cam);
    for (const s of (P.people ?? []) as Who[]) {
      const p = (PEOPLE as Record<string, Person>)[s.who];
      if (!p) throw new Error(`look: nobody called ${s.who} (${Object.keys(PEOPLE).join(", ")})`);
      const at = new THREE.Vector3(x0 + s.at[0], s.at[1], s.at[2]);
      const ex = s.expr === undefined ? undefined : s.expr in FACES ? (FACES as Record<string, unknown>)[s.expr] : (s.expr as Expr);
      const st: Partial<RigState> = { at, facing: s.facing ?? 0, turn: s.turn, pose: { kind: (s.pose ?? "idle") as RigPose["kind"], t: 0.4 + t } as RigPose, expr: ex as RigState["expr"], lookDown: s.lookDown, visible: true };
      if (s.hands) st.hands = s.hands.map((h) => (h ? new THREE.Vector3(x0 + h[0], h[1], h[2]) : null)) as RigState["hands"];
      w.actor(p, s.key ?? "").set(st);
    }
    w.update();
    w.endFrame({ camera: cam, clock: t });
    console.log(`QA: page ${i} ${place} t ${t}`);
  };
  return { cam: null, frame: (i) => pose(i), ao: () => w.look().ao, bg: () => w.look().bg };
});
