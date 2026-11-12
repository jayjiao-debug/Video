// The cast line-up of the Hongmen film: the people of people.ts in a row (or a sheet of rows), standing, walking or
// seated on the floor at low tables, under a choice of light.
//   /home/user/hm_tools/still.sh src/videos/hongmen/preview/people_lineup.ts out.png --size 1680x720 --opts '{"who":"named"}'
// Options (all optional):
//   who     person names (liuBang, zhangLiang, fanKuai, caoWushang, xiangYu, fanZeng, xiangBo, xiangZhuang, guard0,
//           guard1, servant, liuGuard0, liuGuard1), role ids (LIU_BANG ...), indices into ALL_PEOPLE, or groups:
//           "named" (the eight, the default), "seated" (the six banquet sitters), "liu", "xiang", "extras", "all"
//   facing  radians (0 = toward +z, the camera side), one number or a list used in turn;  turn = state.turn (1 = keep
//           the true facing);  spin = radians per second added (frames with --pick: a turn on the spot)
//   pose    idle | walk | haul | cheer | wave | point | hold | sit (one or a list);  phase (walk / haul; a list: one
//           per figure), stride (walk: half a step in m, default 0.16), amount, t;  expr (one or a list);  mouth;
//           lookDown;  twist;  hands = RigState.hands (pinned hands, offsets from each figure's own place);
//           armFront = RigState.armFront ([true, false]: the right arm is drawn in front of the own head);
//           gaze (one or a list: -1 screen left .. 1 right);  shh = seconds into the kit's "shh, my jawline" gesture
//           (rigJawline: the right hand's finger at the lips, the turn, the trace down the jaw; amount = how far the
//           hand is raised), on every figure: the check of a hand at the face;  finger: true = the kit's raised
//           forefinger on every figure's right hand (as acc/liu_dage.ts LIU_PRIVY has it)
//   hilt    true = every figure with a sword rests its right hand on the hilt (pinned at garb.ts hiltWorld)
//   hide    accessory names whose 3D parts are hidden (e.g. ["hilt"]);  bare: true = no accessories (the qa baseline)
//   seat    true = everybody sits on a pad at a low table (layout.ts numbers), both drawn; props = false: neither,
//           "pad": only the pad;  rise = 0..1: the seat raised toward standing (07 finding 3)
//   layout  "row" (default up to `cols` figures) | "sheet" (rows stacked upward, no ground);  cols (default 8),
//           gap (m between figures: 0.78 standing, 1.0 seated), rowH (sheet, 2.0)
//   view    "front" | "34" | "34r" (three-quarter from the figures' left / right) | "high" (a raised camera: the
//           default when seated) | "side" | "sider" | "back" | "back34";  fov (40);
//           far = metres added to the camera's distance;  camUp, camX;  cam = { pos, look, fov }: an explicit camera
//   light   "lab" (bright day, the default) | "yard" | "tent" (dark, warm lamp);  ground = the ground's colour
//   dbg     true = prints where each figure's body bottom and hands are
//   flat    true = no ground, no contact shadows, a plain background of colour `key` (default "#ff00ff"): the input
//           of the silhouette sheet (/home/user/hm_work/g3/sheets.py)
// Prints one QA line per figure: reach / clear / held / seat (rig.qa) and every accRules violation.
import * as THREE from "three";
import { preview, SHEET_LIGHTS, lowTable, seatPad, SEAT } from "./sheet_common";
import { makeSun } from "../../bt/pbr";
import { RigCast, rigJawline, type RigPose, type RigMouth, type RigState } from "../../group/kit/rig3d";
import type { Expr } from "../../group/kit/toon";
import { finger } from "../../group/kit/rigacc/finger";
import { hiltWorld } from "../acc/garb";
import { ALL_PEOPLE, ALTERNATES, NAMED, SEATED, ROLES, GUARD, GUARD_B, SERVANT, addPerson, type Person } from "../people";

const GROUPS: Record<string, () => Person[]> = {
  all: () => ALL_PEOPLE,
  named: () => NAMED,
  seated: () => SEATED,
  liu: () => ROLES.filter((r) => r.camp === "liu" && r.tag).map((r) => r.person),
  xiang: () => ROLES.filter((r) => r.camp === "xiang" && r.tag).map((r) => r.person),
  extras: () => [GUARD, GUARD_B, SERVANT],
};
const find = (w: string | number): Person[] => {
  if (typeof w === "number") return [ALL_PEOPLE[((w % ALL_PEOPLE.length) + ALL_PEOPLE.length) % ALL_PEOPLE.length]];
  if (GROUPS[w]) return GROUPS[w]();
  const p = ALL_PEOPLE.find((q) => q.name === w) ?? ROLES.find((r) => r.id === w)?.person ?? ALTERNATES.find((q) => q.name === w);
  if (!p) throw new Error(`people_lineup: nobody called "${w}" (${ALL_PEOPLE.map((q) => q.name).join(", ")}, ${Object.keys(GROUPS).join(", ")})`);
  return [p];
};
const pickOf = <T,>(v: T | T[] | undefined, i: number, d: T): T => (v === undefined ? d : Array.isArray(v) ? v[i % v.length] : v);

preview({ w: 1680, h: 720 }, (c) => {
  const o = c.opts, M = c.mats(), LT = SHEET_LIGHTS[o.light ?? "lab"];
  if (!LT) throw new Error("people_lineup: no light called " + o.light);
  const who: (string | number)[] = o.who === undefined ? ["named"] : Array.isArray(o.who) ? o.who : [o.who];
  const list = who.flatMap(find), seated = !!o.seat, flat = !!o.flat;
  const cols: number = o.cols ?? 8, layout: string = o.layout ?? (list.length <= cols ? "row" : "sheet"), per = layout === "row" ? list.length : cols;
  const gap: number = o.gap ?? (seated ? 1.0 : 0.78), rowH: number = o.rowH ?? 2.0, rows = Math.ceil(list.length / per);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), M.paint({ color: o.ground ?? LT.ground }));
  ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; ground.visible = layout !== "sheet" && !flat; c.scene.add(ground);
  const sun = makeSun(); sun.position.set(LT.sun[0] * 14, LT.sun[1] * 14, LT.sun[2] * 14); sun.intensity *= LT.sunK; sun.target.position.set(0, 0, 0); c.scene.add(sun, sun.target);
  const rc = new RigCast(c.scene, { light: LT.cast as never });
  const figs = list.map((p, i) => {
    const col = i % per, row = Math.floor(i / per), n = Math.min(per, list.length - row * per);
    const at = new THREE.Vector3((col - (n - 1) / 2) * gap, layout === "sheet" ? (rows - 1 - row) * rowH : 0, 0);
    const rig = o.bare ? rc.add(p.look) : addPerson(rc, o.finger ? { ...p, acc: () => [...p.acc(), finger({ hand: 0 })] } : p);
    for (const r of rig.accRules()) console.log(`QA: RULE ${p.name}: ${r.acc}: ${r.rule}: ${r.msg}`);
    return { p, rig, at };
  });
  if (seated && o.props !== false && !flat) for (const f of figs) { const g = new THREE.Group(); g.position.copy(f.at); g.add(seatPad(M)); if (o.props !== "pad") g.add(lowTable(M)); c.scene.add(g); }
  const view: string = o.view ?? (seated ? "high" : "front"), fov: number = o.fov ?? 40, tv = Math.tan((fov * Math.PI) / 360);
  const W = (Math.min(per, list.length) - 1) * gap + (seated ? 1.5 : 1.0), H = layout === "sheet" ? (rows - 1) * rowH + 2.0 : seated ? 1.5 : 2.0;
  const cy = layout === "sheet" ? H / 2 - 0.05 : seated ? (view === "high" ? 0.4 : 0.55) : 0.9;
  const d = Math.max(W / (2 * tv * (c.w / c.h)), H / (2 * tv)) + (o.far ?? 0);
  const DIRS: Record<string, [number, number, number]> = { front: [0, 0.1, 1], "34": [0.6, 0.22, 0.77], "34r": [-0.6, 0.22, 0.77], high: [0, 0.5, 0.87], side: [1, 0.1, 0.001], sider: [-1, 0.1, 0.001], back: [0, 0.1, -1], back34: [-0.6, 0.3, -0.77] };
  const dir = DIRS[view];
  if (!dir) throw new Error(`people_lineup: no view called ${view} (${Object.keys(DIRS).join(", ")})`);
  const dl = Math.hypot(...dir), lookZ = seated ? 0.12 : 0;
  return {
    cam: { pos: [(dir[0] / dl) * d + (o.camX ?? 0), cy + (dir[1] / dl) * d + (o.camUp ?? 0), lookZ + (dir[2] / dl) * d], look: [0, cy, lookZ], fov }, ao: LT.ao, bg: flat ? o.key ?? "#ff00ff" : LT.bg,
    frame: (fi, t) => {
      figs.forEach((f, i) => {
        const kind = pickOf<string>(o.pose, i, seated ? "sit" : "idle") as RigPose["kind"], tt = (o.t ?? 0.4) + t + i * 0.13;
        const pose: RigPose = kind === "walk" ? { kind, phase: (pickOf<number>(o.phase, i, 0.12 + 0.19 * i) + (o.walk ?? 0) * t) % 1, stride: o.stride ?? 0.16 }
          : kind === "haul" ? { kind, phase: pickOf<number>(o.phase, i, 0.25), amount: o.amount ?? 0.9 } : { kind, t: tt, amount: o.amount };
        const st: Partial<RigState> = { at: f.at, facing: pickOf<number>(o.facing, i, 0) + (o.spin ?? 0) * t, turn: o.turn, pose, expr: pickOf<string>(o.expr, i, "neutral") as Expr, mouth: o.mouth as RigMouth | undefined, hide: o.hide, twist: o.twist, lookDown: o.lookDown, visible: true };
        if (o.hands) st.hands = (o.hands as ([number, number, number] | null)[]).map((h) => (h ? new THREE.Vector3(f.at.x + h[0], f.at.y + h[1], f.at.z + h[2]) : null)) as never;
        if (seated) {
          const k: number = o.rise ?? 0, top = SEAT.top + (f.rig.dim.hipY - 0.028 - SEAT.top) * k;
          st.seat = { top: new THREE.Vector3(f.at.x, f.at.y + top, f.at.z), deskEdge: k > 0 ? undefined : SEAT.deskEdge, deskTop: SEAT.deskTop };
        } else st.seat = undefined;
        if (typeof o.gaze === "number" || Array.isArray(o.gaze)) st.gaze = pickOf<number>(o.gaze, i, 0);
        if (o.armFront) st.armFront = o.armFront;
        if (o.hilt) { const hw = hiltWorld(f.rig); if (hw && fi >= 0) st.hands = [hw, null]; }                 // the right hand on the sword's hilt (from the last solve)
        if (o.shh !== undefined) { const jl = rigJawline(o.shh + t, { arm: 0, amount: o.amount ?? 1 }); st.pose = jl.pose; st.expr = (o.expr ? st.expr : jl.expr) as Expr; st.gaze = jl.gaze; st.head = jl.head; st.twist = jl.twist; }
        f.rig.set(st);
      });
      rc.update(c.camera, c.h);
      if (flat) for (const f of figs) { const b = (f.rig as unknown as { blob?: THREE.Object3D }).blob; if (b) b.visible = false; }
      if (o.dbg && fi === (o.f ?? 0)) for (const f of figs) { const B = new THREE.Vector3().setFromMatrixPosition(f.rig.group.children[0].matrixWorld), h = [f.rig.handWorld(0), f.rig.handWorld(1)]; console.log(`QA: DBG ${f.p.name} body bottom ${B.toArray().map((v) => v.toFixed(3))} hands from it ${h.map((v) => v.clone().sub(B).toArray().map((x) => x.toFixed(3)).join(",")).join(" | ")}`); }
      if (fi === (o.f ?? 0)) figs.forEach((f, i) => console.log(`QA: ${i} ${f.p.name} ${pickOf<string>(o.pose, i, seated ? "sit" : "idle")} reach ${f.rig.qa.reach.toFixed(3)} clear ${f.rig.qa.clear.toFixed(3)} held ${f.rig.qa.held.toFixed(3)} seat ${f.rig.qa.seat.toFixed(3)} | rb ${f.rig.dim.rb.toFixed(3)} hipY ${f.rig.dim.hipY.toFixed(3)}`));
    },
  };
});
