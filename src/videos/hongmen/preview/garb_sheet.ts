// GARB sheet of the Hongmen film: a row of rig figures in the garments of acc/garb.ts (and the headwear of
// acc/headwear.ts), standing, walking, or seated on the floor at low tables, under a choice of light.
//   /home/user/hm_tools/still.sh src/videos/hongmen/preview/garb_sheet.ts out.png --size 720x720 --opts '<json>'
// Options (all optional):
//   which   what the row wears, one name or a list (rows one after the other): "proto" (the three risky elements:
//           robe + topknot, robe + long white beard, robe + tall cap), "robe" (five robes: red, slim, wide, short,
//           painted only), "armour" (three), "cape" (two), "sword" (three: with a jade ring, on armour, an empty
//           scabbard), "beard" (the six kinds), "bare" (no accessories)
//   look    the looks under the garments, one name or a list, used in turn: "you", "c<n>" = classmate(n), "f<n>" =
//           friend(n); left out, each figure has its own;  width = every figure's Look.width
//   n       how many figures (default: as many as the rows have)
//   facing  every figure's facing in radians (0 = toward +z, the camera side), or a list; turn = state.turn
//   pose    idle | walk | haul | cheer | wave | point | hold | sit;  phase = walk / haul phase 0..1 (a list: one per
//           figure);  stride (walk, half a step in m, default 0.16);  amount;  expr;  mouth;  lookDown;  hide
//   seat    true = every figure sits on a pad (layout.ts: top 0.10 m) at a low table (top 0.34 m, near edge 0.26 m),
//           both drawn;  rise = 0..1: the seat's top raised toward standing (07 finding 3);  sink = metres: the
//           figure stands sunk that far into the ground instead (the kneel recipe; no pad)
//           props = false: neither is drawn; "pad": only the pad (to look at the lap);  seatFacing = the seats' facing
//   gap     metres between figures (default 0.62; seated 0.95);  up = metres between rows stacked upward
//   bare    true = the same figures without any accessory
//   view    "front" (default) | "34" (three-quarter) | "high" (the banquet's raised camera) | "side";
//           cam = { pos, look, fov } instead;  dist = camera distance of the front view
//   light   "lab" (bright day, the default) | "yard" | "tent" (dark, warm lamp);  ground = the ground's colour
// Prints one QA line per figure: reach / clear / held / seat (see rig.qa) and every accRules violation.
import * as THREE from "three";

import { makeSun } from "../../bt/pbr";
import { RigCast, type Acc, type RigPose, type RigMouth, type RigState } from "../../group/kit/rig3d";
import type { Look, Expr } from "../../group/kit/toon";
import { YOU, classmate, friend } from "../../group/kit/cast";
import { robe, armour, cape, swordBelt, hilt, pendant, beard, trackFace } from "../acc/garb";
import { moustache } from "../../group/kit/rigacc";
import { topknot, scholarCap } from "../acc/headwear";
import { preview, SHEET_LIGHTS, lowTable, seatPad, SEAT } from "./sheet_common";

type Fig = { name: string; look?: Look; acc: () => Acc[] };
const SKIN = "#f6d9bd";
/** the base look of a Han figure: a plain "tee" under the garment; only the head, the hair and the build show */
const base = (L: Look, o: Partial<Look> = {}): Look => ({ seed: L.seed, skin: L.skin, part: L.part, width: L.width, top: "tee", topCol: "#8a8a8a", bottom: "chinos", botCol: "#3a3440", shoes: "#2d2a30", shoeSole: "#1f1c22", hair: "buzz", hairCol: "#1f1c22", ...o });
const TAN = "#e0b088", WHITE = "#f1f1ee";
const ROWS: Record<string, Fig[]> = {
  // the three risky elements of the cast (gate G3): a robe with its skirt and a topknot with a hairpin; a long white
  // beard on an old man's tanned face over a dark robe; a tall cap
  proto: [
    { name: "robe+topknot", look: base(classmate(3), { width: 1.0, skin: SKIN }), acc: () => [robe({ col: "#c8322c", band: "#2a2630", sash: "#e2b03a" }), beard({ kind: "short", col: "#1f1c22" }), topknot({ band: "#c8322c", pin: "#e2b03a" })] },
    { name: "long beard", look: base(classmate(17), { width: 0.95, skin: TAN, hairCol: WHITE }), acc: () => [robe({ col: "#5b2a86", band: "#2a2630", sash: "#e6dcc6" }), beard({ kind: "long", col: WHITE }), moustache({ kind: "walrus", col: WHITE }), topknot({ band: "#8f86a8", pin: "#3fae6e", size: 0.9 })] },
    { name: "tall cap", look: base(classmate(42), { width: 0.9, skin: "#fbe7d3" }), acc: () => [robe({ col: "#8fc7bd", band: "#c8322c", sash: "#c8322c" }), scholarCap()] },
  ],
  robe: [
    { name: "robe red", look: base(classmate(3), { width: 1.0, skin: SKIN }), acc: () => [robe({ col: "#c8322c", band: "#2a2630", sash: "#e2b03a" })] },
    { name: "robe slim", look: base(classmate(17), { width: 0.9, skin: SKIN }), acc: () => [robe({ col: "#8fc7bd", band: "#c8322c", sash: "#c8322c" })] },
    { name: "robe wide", look: base(classmate(42), { width: 1.4, skin: SKIN }), acc: () => [robe({ col: "#5b2a86", band: "#2a2630", sash: "#e6dcc6" })] },
    { name: "robe short", look: base(classmate(75), { width: 1.0, skin: SKIN }), acc: () => [robe({ col: "#4a4f5e", band: "#2a2630", sash: "#7a3fa8", skirt: "short" })] },
    { name: "robe painted", look: base(classmate(8), { width: 1.0, skin: SKIN }), acc: () => [robe({ col: "#c8322c", band: "#2a2630", sash: "#e2b03a", skirt: false })] },
  ],
  armour: [
    { name: "armour charcoal", look: base(classmate(42), { width: 1.32, skin: SKIN }), acc: () => [armour({ trim: "#e2b03a" })] },
    { name: "armour leather wide", look: base(classmate(8), { width: 1.5, skin: SKIN }), acc: () => [armour({ col: "#8a5a34", trim: "#d2b27c", sash: "#c8322c", scarf: "#c8322c" })] },
    { name: "armour no skirt", look: base(classmate(12), { width: 1.06, skin: SKIN }), acc: () => [armour({ skirt: false, sash: "#7a3fa8" })] },
  ],
  cape: [
    { name: "cape on armour", look: base(classmate(42), { width: 1.32, skin: SKIN }), acc: () => [armour({ trim: "#e2b03a" }), cape({ trim: "#e2b03a" })] },
    { name: "cape on robe", look: base(classmate(3), { width: 1.0, skin: SKIN }), acc: () => [robe({ col: "#4a4f5e", band: "#2a2630", sash: "#7a3fa8" }), cape({ col: "#c8322c", len: 0.7 })] },
  ],
  sword: [
    { name: "sword on robe", look: base(classmate(17), { width: 0.9, skin: SKIN }), acc: () => [robe({ col: "#5b2a86", band: "#2a2630", sash: "#e6dcc6" }), pendant(), swordBelt(), hilt()] },
    { name: "sword on armour", look: base(classmate(8), { width: 1.5, skin: SKIN }), acc: () => [armour({ col: "#8a5a34", sash: "#c8322c" }), swordBelt(), hilt()] },
    { name: "empty scabbard", look: base(classmate(75), { width: 1.0, skin: SKIN }), acc: () => [robe({ col: "#4a4f5e", band: "#2a2630", sash: "#7a3fa8", skirt: "short" }), swordBelt()] },
  ],
  beard: (["full", "short", "fork", "stubble", "goatee", "long"] as const).map((kind, i) => ({ name: "beard " + kind, look: base(classmate([3, 17, 42, 75, 8, 12][i]), { skin: i === 5 ? TAN : SKIN, hairCol: i === 5 ? WHITE : "#1f1c22" }), acc: () => [robe({ col: ["#c8322c", "#8fc7bd", "#5b2a86", "#4a4f5e", "#c8322c", "#5b2a86"][i] }), beard({ kind })] })),
  bare: [{ name: "bare", acc: () => [] }],
};
const lookOf = (n: string): Look => (n === "you" ? YOU : n[0] === "c" ? classmate(+n.slice(1)) : n[0] === "f" ? friend(+n.slice(1)) : (() => { throw new Error("garb_sheet: no look called " + n); })());
const pickOf = <T,>(v: T | T[] | undefined, i: number, d: T): T => (v === undefined ? d : Array.isArray(v) ? v[i % v.length] : v);

preview({ w: 720, h: 720, which: "proto" }, (c) => {
  const o = c.opts, M = c.mats(), LT = SHEET_LIGHTS[o.light ?? "lab"];
  if (!LT) throw new Error("garb_sheet: no light called " + o.light);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), M.paint({ color: o.ground ?? LT.ground }));
  ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; c.scene.add(ground);
  const sun = makeSun(); sun.position.set(LT.sun[0] * 14, LT.sun[1] * 14, LT.sun[2] * 14); sun.intensity *= LT.sunK; sun.target.position.set(0, 0, 0); c.scene.add(sun, sun.target);
  const rc = new RigCast(c.scene, { light: LT.cast as never });
  trackFace(rc);
  const figs = ([] as Fig[]).concat(...(Array.isArray(o.which) ? o.which : [o.which]).map((w: string) => { if (!ROWS[w]) throw new Error(`garb_sheet: no row called ${w} (${Object.keys(ROWS).join(", ")})`); return ROWS[w]; }));
  const looks: Look[] | null = o.look ? (Array.isArray(o.look) ? o.look : [o.look]).map(lookOf) : null, dflt = [3, 17, 42, 75].map(classmate);
  const seated = !!o.seat, n: number = o.n ?? Math.max(figs.length, looks ? looks.length : 0), gap: number = o.gap ?? (seated ? 0.95 : 0.62), rows: number = o.rows ?? 1, per = Math.ceil(n / rows);
  const cast = Array.from({ length: n }, (_, i) => {
    const f = figs[i % figs.length], L0 = looks ? base(looks[i % looks.length]) : f.look ?? base(dflt[i % dflt.length]), L = o.width ? { ...L0, width: o.width } : L0;
    const col = i % per, row = Math.floor(i / per);
    const at = o.up ? new THREE.Vector3((col - (per - 1) / 2) * gap, (rows - 1 - row) * o.up, 0) : new THREE.Vector3((col - (per - 1) / 2) * gap + (row % 2) * gap * 0.5, 0, -row * 0.8);
    const rig = rc.add(L, { acc: o.bare ? [] : f.acc() });
    for (const r of rig.accRules()) console.log(`QA: RULE ${f.name}: ${r.acc}: ${r.rule}: ${r.msg}`);
    return { f, rig, at };
  });
  if (seated && o.props !== false) cast.forEach(({ at }, k) => { const g = new THREE.Group(); g.position.copy(at); g.rotation.y = pickOf<number>(o.seatFacing, k, 0); g.add(seatPad(M)); if (o.props !== "pad") g.add(lowTable(M)); c.scene.add(g); });
  if (o.up) ground.visible = false;
  const wide = (per - 1) * gap + (seated ? 1.0 : 0.7), high = o.up ? (rows - 1) * o.up + 1.6 : 0, tv = Math.tan((25 * Math.PI) / 180);
  const dist: number = o.dist ?? Math.max(2.3, (wide / 2 / tv / (c.w / c.h)) * 1.02, (high / 2 / tv) * 1.02);
  const view: string = o.view ?? "front", cy = seated ? 0.5 : 0.8;
  const cam = o.up ? { pos: [0, high / 2, dist], look: [0, high / 2, 0], fov: 50 }
    : view === "34" ? { pos: [dist * 0.64, 1.3, dist * 0.77], look: [0, cy, 0], fov: 50 }
    : view === "side" ? { pos: [dist, 1.2, 0.001], look: [0, cy, 0], fov: 50 }
    : view === "high" ? { pos: [dist * 0.18, dist * 0.62, dist * 0.9], look: [0, cy * 0.7, 0], fov: 46 }
    : { pos: [0, 1.3, dist], look: [0, seated ? 0.55 : 0.82, 0], fov: 50 };
  return {
    cam: cam as never, ao: LT.ao, bg: LT.bg,
    frame: (i, t) => {
      cast.forEach(({ rig, at }, k) => {
        const kind = (o.pose ?? (seated ? "sit" : "idle")) as RigPose["kind"], tt = t + (o.t ?? 0) + k * 0.13;
        const pose: RigPose = kind === "walk" ? { kind, phase: pickOf<number>(o.phase, k, (0.12 + 0.19 * k) % 1), stride: o.stride ?? 0.16 } : kind === "haul" ? { kind, phase: pickOf<number>(o.phase, k, 0.25), amount: o.amount ?? 0.9 } : { kind, t: tt, amount: o.amount };
        const facing = pickOf<number>(o.facing, k, 0);
        const st: Partial<RigState> = { at: o.sink ? at.clone().setY(at.y - o.sink) : at, facing, pose, expr: pickOf<string>(o.expr, k, "neutral") as Expr, turn: o.turn, mouth: o.mouth as RigMouth | undefined, twist: o.twist, lookDown: o.lookDown, hide: o.hide, visible: true };
        if (seated) {
          const k2: number = o.rise ?? 0, top = SEAT.top + (rig.dim.hipY - 0.028 - SEAT.top) * k2;
          st.seat = { top: new THREE.Vector3(at.x, top, at.z), deskEdge: k2 > 0 ? undefined : SEAT.deskEdge, deskTop: SEAT.deskTop };
          st.facing = pickOf<number>(o.seatFacing, k, 0);
        } else st.seat = undefined;
        rig.set(st);
      });
      rc.update(c.camera, c.h);
      if (i === (o.f ?? 0)) cast.forEach(({ f, rig }, k) => console.log(`QA: ${k} ${f.name} reach ${rig.qa.reach.toFixed(3)} clear ${rig.qa.clear.toFixed(3)} held ${rig.qa.held.toFixed(3)} seat ${rig.qa.seat.toFixed(3)} | hipY ${rig.dim.hipY.toFixed(3)} rb ${rig.dim.rb.toFixed(3)} Ht ${rig.dim.Ht.toFixed(3)} R ${rig.dim.R.toFixed(3)}`));
    },
  };
});
