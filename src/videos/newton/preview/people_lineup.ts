// The cast line-up of the Newton film (WP3): the people of people.ts in a row or a sheet of rows, standing, walking or
// seated, under the figure light of a film place (or the lab's). A copy of Wanbi's preview/people_lineup.ts.
//   bash scripts/kit/queue/still.sh src/videos/newton/preview/people_lineup.ts /home/user/newton_work/film/wp3/x.png --size 540x960 --opts '{"who":"swaps","view":"34"}'
//   the laugh at quarter-screen: --opts '{"who":["newton"],"view":"face","laugh":0.3,"far":1.2}'
// Render ONLY through the queue:
//   bash scripts/kit/queue/still.sh src/videos/newton/preview/people_lineup.ts /home/user/newton_work/film/wp3/ --pick 0,1 --size 540x960
//   bash scripts/kit/queue/still.sh src/videos/newton/preview/people_lineup.ts /home/user/newton_work/film/wp3/x.png --size 540x960 --opts '{"who":"swaps","view":"34"}'
// Options (all optional; preview/common.ts adds w, h, ink, ao, raw, cam):
//   who     PEOPLE keys (newton, newtonInk, newtonGown, newtonGownInk, newtonGownSmudge, humphrey, humphreySoot), person
//           names, indices into ALL_PEOPLE or groups: "film" (every PEOPLE entry), "named" (one per role, the default),
//           "swaps" (NEWTON's five figures)
//   laugh   seconds into people.ts laugh() (one or a list): the figure takes laugh(t)'s expr, mouth and head
//   layout  "row" (default up to `cols` figures) | "sheet" (rows stacked upward, no ground);  cols (default 5),
//           gap (m between figures: 0.78 standing, 1.0 seated), rowH (sheet, 2.0)
//   view    "front" | "34" | "34r" | "high" | "side" | "sider" | "back" | "back34" | "face";  fov (40);  far (m added
//           to the distance);  camUp, camX;  camPose = { pos, look, fov }
//   light   "lab" (the default) | a place: stairs, room, garden, street, schools, elaboratory (sets/index.ts
//           PLACE_LOOKS: the place's figure light, background and AO);  ground = the ground's colour
//   flat    true = no ground, no contact shadows, a plain background of colour `key` (default "#ff00ff"): the input
//           of the black-silhouette test (the key colour is thresholded away)
//   pose    idle | walk | wave | point | cheer | hold | haul | sit | shh (one or a list);  phase, stride, amount, t;
//           expr (one or a list);  facing (radians, one or a list);  turn;  spin (rad/s);  gaze;  lookDown;  hands
//           (pinned, offsets from each figure's place);  hide (accessory names);  bare: true = no accessories
//   seat    true = everybody sits on a platform 0.40 m high (drawn unless props: false);  rise 0..1
//   pages   a list of option objects, one per frame (frame i uses pages[i % n]) for what can change per frame:
//           view, fov, far, camUp, camX, light, flat, key, pose, expr, facing, turn, gaze, hide. One queued call can
//           then render e.g. the sheet and its silhouette: --pick 0,1 --opts '{"pages":[{}, {"flat":true}]}'
//   dbg     true = prints where each figure's body bottom and hands are
// Prints one QA line per figure (rig.qa reach / clear / held / head / seat) and every accRules violation.
import * as THREE from "three";
import { preview, type Cam } from "./common";
import { makeSun } from "../../bt/pbr";
import { RigCast, type RigPose, type RigMouth, type RigState } from "../../group/kit/rig3d";
import type { CastLight } from "../../group/kit/cast";
import type { Expr } from "../../group/kit/toon";
import { LAB_CAST_LIGHT } from "../../group/sets/lab";
import { PLACE_LOOKS, BAKED_LIGHT } from "../sets/index";
import { PLACES } from "../story";
import { ALL_PEOPLE, NAMED, NEWTON_SWAPS, PEOPLE, addPerson, laugh, type Person } from "../people";

type Light = { cast: CastLight; sun: [number, number, number]; sunK: number; ground: string; bg: string; ao?: { aoRadius: number; distanceFalloff: number; intensity: number; color: string } };
/** the sun's direction and strength and the ground's colour under each place's figure light */
const PLACE_SUN: Record<string, { sun: [number, number, number]; sunK: number; ground: string }> = {
  stairs: { sun: [0.7, 0.35, 0.55], sunK: 0.8, ground: "#5a4436" }, room: { sun: [-0.45, 0.62, 0.64], sunK: 0.7, ground: "#5e4a3a" },
  garden: { sun: [-0.5, 0.6, 0.62], sunK: 0.9, ground: "#b8ab92" }, street: { sun: [-0.5, 0.6, 0.62], sunK: 0.9, ground: "#9a9084" },
  schools: { sun: [-0.3, 0.7, 0.6], sunK: 0.7, ground: "#7a6a58" }, elaboratory: { sun: [0.4, 0.5, 0.6], sunK: 0.5, ground: "#4a3a30" },
};
const LIGHTS: Record<string, Light> = {
  lab: { cast: { ...LAB_CAST_LIGHT, ...BAKED_LIGHT } as CastLight, sun: [-0.5, 0.55, 0.67], sunK: 1, ground: "#e9eef5", bg: "#bfe3f7" },
  ...Object.fromEntries(PLACES.map((p) => [p, { cast: { ...PLACE_LOOKS[p].cast, ...BAKED_LIGHT }, ...PLACE_SUN[p], bg: PLACE_LOOKS[p].bg, ao: PLACE_LOOKS[p].ao } as Light])),
};
/** group/kit/rig3d applyLight (module-private there; the same copy as world.ts): the uniforms the figures are lit by */
const applyLight = (rc: RigCast, L: CastLight) => {
  const U = rc.U;
  U.uKey.value.set(...L.key).normalize();
  const t = U.uTint.value.set(1 - L.tintK + L.tint[0] * L.tintK, 1 - L.tintK + L.tint[1] * L.tintK, 1 - L.tintK + L.tint[2] * L.tintK);
  t.multiplyScalar(1 / Math.max(0.2126 * t.x + 0.7152 * t.y + 0.0722 * t.z, 0.05));
  U.uGain.value = L.gain;
  const s = U.uShade.value.set(...(L.shade ?? [1.04, 0.95, 1.34]));
  s.multiplyScalar(1 / Math.max(0.2126 * s.x + 0.7152 * s.y + 0.0722 * s.z, 0.05));
  rc.light = L;
};

const GROUPS: Record<string, () => Person[]> = {
  film: () => ALL_PEOPLE,
  named: () => NAMED,
  swaps: () => NEWTON_SWAPS,
};
const find = (w: string | number): Person[] => {
  if (typeof w === "number") return [ALL_PEOPLE[((w % ALL_PEOPLE.length) + ALL_PEOPLE.length) % ALL_PEOPLE.length]];
  if (GROUPS[w]) return GROUPS[w]();
  const p = (PEOPLE as Record<string, Person>)[w] ?? ALL_PEOPLE.find((q) => q.name === w);
  if (!p) throw new Error(`people_lineup: nobody called "${w}" (${Object.keys(PEOPLE).join(", ")}, ${Object.keys(GROUPS).join(", ")})`);
  return [p];
};
const pickOf = <T,>(v: T | T[] | undefined, i: number, d: T): T => (v === undefined ? d : Array.isArray(v) ? v[i % v.length] : v);
const DIRS: Record<string, [number, number, number]> = { front: [0, 0.1, 1], "34": [0.6, 0.22, 0.77], "34r": [-0.6, 0.22, 0.77], high: [0, 0.5, 0.87], side: [1, 0.1, 0.001], sider: [-1, 0.1, 0.001], back: [0, 0.1, -1], back34: [-0.6, 0.3, -0.77], face: [0, 0.02, 1] };
/** the seat of the line-up: a platform this high */
const SEAT_TOP = 0.4;

preview({ w: 540, h: 960 }, (c) => {
  const o0 = c.opts, M = c.mats();
  const pages: Record<string, any>[] = Array.isArray(o0.pages) && o0.pages.length ? o0.pages : [{}];
  const page = (i: number): Record<string, any> => ({ ...o0, ...pages[((i % pages.length) + pages.length) % pages.length] });
  const who: (string | number)[] = o0.who === undefined ? ["named"] : Array.isArray(o0.who) ? o0.who : [o0.who];
  const list = who.flatMap(find), seated = !!o0.seat;
  const cols: number = o0.cols ?? 5, layout: string = o0.layout ?? (list.length <= cols ? "row" : "sheet"), per = layout === "row" ? list.length : cols;
  const gap: number = o0.gap ?? (seated ? 1.0 : 0.78), rowH: number = o0.rowH ?? 2.0, rows = Math.ceil(list.length / per);
  for (const P of [o0, ...pages]) if (P.light && !LIGHTS[P.light]) throw new Error(`people_lineup: no light called ${P.light} (${Object.keys(LIGHTS).join(", ")})`);
  const L0 = LIGHTS[o0.light ?? "lab"];
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), M.paint({ color: o0.ground ?? L0.ground }));
  ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; c.scene.add(ground);
  const sun = makeSun(); c.scene.add(sun, sun.target);
  const sunK0 = sun.intensity;
  const rc = new RigCast(c.scene, { light: L0.cast as never });
  const figs = list.map((p, i) => {
    const col = i % per, row = Math.floor(i / per), n = Math.min(per, list.length - row * per);
    const at = new THREE.Vector3((col - (n - 1) / 2) * gap, layout === "sheet" ? (rows - 1 - row) * rowH : 0, 0);
    const rig = o0.bare ? rc.add(p.look) : addPerson(rc, p);
    for (const r of rig.accRules()) console.log(`QA: RULE ${p.name}: ${r.acc}: ${r.rule}: ${r.msg}`);
    return { p, rig, at };
  });
  if (seated && o0.props !== false) for (const f of figs) {
    const g = new THREE.Mesh(new THREE.BoxGeometry(0.9, SEAT_TOP, 0.8), M.paint({ color: "#7a5a3c" }));
    g.position.set(f.at.x, f.at.y + SEAT_TOP / 2, f.at.z - 0.1); g.castShadow = g.receiveShadow = true; c.scene.add(g);
  }
  const camOf = (P: Record<string, any>): Cam => {
    const view: string = P.view ?? (seated ? "high" : "front"), fov: number = P.fov ?? 40, tv = Math.tan((fov * Math.PI) / 360);
    const W = (Math.min(per, list.length) - 1) * gap + (seated ? 1.5 : 1.0), H = layout === "sheet" ? (rows - 1) * rowH + 2.0 : seated ? 1.5 : 2.0;
    const cy = layout === "sheet" ? H / 2 - 0.05 : seated ? (view === "high" ? 0.6 : 0.75) : 0.9;
    const d = Math.max(W / (2 * tv * (c.w / c.h)), H / (2 * tv)) + (P.far ?? 0);
    const dir = DIRS[view];
    if (!dir) throw new Error(`people_lineup: no view called ${view} (${Object.keys(DIRS).join(", ")})`);
    const dl = Math.hypot(...dir), lookZ = seated ? 0.12 : 0;
    return P.camPose ?? { pos: [(dir[0] / dl) * d + (P.camX ?? 0), cy + (dir[1] / dl) * d + (P.camUp ?? 0), lookZ + (dir[2] / dl) * d], look: [0, cy, lookZ], fov };
  };
  return {
    cam: (i) => camOf(page(i)),
    ao: (i) => LIGHTS[page(i).light ?? "lab"].ao ?? { aoRadius: 0.55, distanceFalloff: 1.0, intensity: 2.2, color: "#2a1a10" },
    bg: (i) => { const P = page(i); return P.flat ? P.key ?? "#ff00ff" : LIGHTS[P.light ?? "lab"].bg; },
    frame: (fi, t) => {
      const o = page(fi), LT = LIGHTS[o.light ?? "lab"], flat = !!o.flat;
      applyLight(rc, LT.cast);
      sun.position.set(LT.sun[0] * 14, LT.sun[1] * 14, LT.sun[2] * 14); sun.intensity = sunK0 * LT.sunK; sun.target.position.set(0, 0, 0);
      (ground.material as THREE.MeshStandardMaterial).color?.set?.(o.ground ?? LT.ground);
      ground.visible = layout !== "sheet" && !flat;
      figs.forEach((f, i) => {
        const kind = pickOf<string>(o.pose, i, seated ? "sit" : "idle") as RigPose["kind"], tt = (o.t ?? 0.4) + t + i * 0.13;
        const pose: RigPose = kind === "walk" ? { kind, phase: (pickOf<number>(o.phase, i, 0.12 + 0.19 * i) + (o.walk ?? 0) * t) % 1, stride: o.stride ?? 0.16 }
          : kind === "haul" ? { kind, phase: pickOf<number>(o.phase, i, 0.25), amount: o.amount ?? 0.9 } : { kind, t: tt, amount: o.amount };
        const st: Partial<RigState> = { at: f.at, facing: pickOf<number>(o.facing, i, 0) + (o.spin ?? 0) * t, turn: o.turn, pose, expr: pickOf<string>(o.expr, i, "neutral") as Expr, mouth: o.mouth as RigMouth | undefined, hide: o.hide, lookDown: o.lookDown, visible: true };
        if (o.laugh !== undefined) Object.assign(st, laugh(pickOf<number>(o.laugh, i, 0) + t));
        if (o.hands) st.hands = (o.hands as ([number, number, number] | null)[]).map((h) => (h ? new THREE.Vector3(f.at.x + h[0], f.at.y + h[1], f.at.z + h[2]) : null)) as never;
        else st.hands = undefined;
        if (seated) {
          const k: number = o.rise ?? 0, top = SEAT_TOP + (f.rig.dim.hipY - 0.028 - SEAT_TOP) * k;
          st.seat = { top: new THREE.Vector3(f.at.x, f.at.y + top, f.at.z) };
        } else st.seat = undefined;
        st.gaze = pickOf<number>(o.gaze, i, 0);
        f.rig.set(st);
        f.rig.group.userData.hmGround = f.at.y;                  // (the robes' ground: the floor under the figure or its 榻)
      });
      rc.update(c.camera, c.h);
      for (const f of figs) { const b = (f.rig as unknown as { blob?: THREE.Object3D }).blob; if (b) b.visible = !flat; }
      if (o.dbg && fi === (o.f ?? 0)) for (const f of figs) { const B = new THREE.Vector3().setFromMatrixPosition(f.rig.group.children[0].matrixWorld), h = [f.rig.handWorld(0), f.rig.handWorld(1)]; console.log(`QA: DBG ${f.p.name} body bottom ${B.toArray().map((v) => v.toFixed(3))} hands from it ${h.map((v) => v.clone().sub(B).toArray().map((x) => x.toFixed(3)).join(",")).join(" | ")}`); }
      figs.forEach((f, i) => console.log(`QA: f${fi} ${i} ${f.p.name} ${pickOf<string>(o.pose, i, seated ? "sit" : "idle")} reach ${f.rig.qa.reach.toFixed(3)} clear ${f.rig.qa.clear.toFixed(3)} held ${f.rig.qa.held.toFixed(3)} head ${f.rig.qa.head.toFixed(3)} seat ${f.rig.qa.seat.toFixed(3)}`));
    },
  };
});
