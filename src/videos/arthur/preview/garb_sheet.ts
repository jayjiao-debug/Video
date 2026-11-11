// GARB sheet: a row of rig figures in the garments of acc/garb.ts on a plain light ground, under the film's sun.
//   node scripts/rig3d/render.mjs src/videos/arthur/preview/garb_sheet.ts out.png --size 540x960 --opts '<json>'
// Options (all optional):
//   which   what the row wears: "cast" (Arthur, Kay, Ector, a lord, a guard, a commoner: the default), "tunic",
//           "surcoat", "cloak", "beard", "scabbard", "spear", "lords", "guards", "commons", "arthur", "kay", "ector", "king",
//           "bare" (no accessories), or a list of those names (their rows one after the other)
//   look    the looks under the garments, one name or a list, used in turn: "you", "c<n>" = classmate(n), "f<n>" =
//           friend(n); left out, each row has its own (the role's look, or classmates 3, 17, 42, 75)
//   n       how many figures (default: as many as the row has variants or looks)
//   facing  every figure's facing in radians (0 = toward +z, the camera side); turn = state.turn (1 = true back view)
//   pose    idle | walk | haul | cheer | wave | point;  phase = walk / haul phase 0..1;  expr;  mouth (a talking mouth)
//   gap     metres between figures (default 0.62);  rows = how many rows deep the figures stand (default 1);
//           up = metres between rows that stand above one another instead (a model sheet, no ground)
//   bare    true = the same figures without any accessory (the baseline of rig.qa for rule 3)
//   cam     { pos, look, fov } (default: frames the row from eye level);  dist = camera distance instead
// Prints one QA line per figure: reach / clear / held (see rig.qa).
import * as THREE from "three";
import { preview } from "./common";
import { makeSun } from "../../bt/pbr";
import { RigCast, type Acc, type RigPose, type RigMouth } from "../../group/kit/rig3d";
import type { Look, Expr } from "../../group/kit/toon";
import { LAB_CAST_LIGHT } from "../../group/sets/lab";
import { YOU, classmate, friend } from "../../group/kit/cast";
import { moustache } from "../../group/kit/rigacc";
import { tunic, surcoat, cloak, beard, scabbard, spear } from "../acc/garb";

type Fig = { name: string; look?: Look; acc: () => Acc[] };
const SKIN = "#f6d9bd";
/** the base look of a medieval figure: a plain "tee" under the garment; only the head, the hair and the build show */
const base = (L: Look, o: Partial<Look> = {}): Look => ({ ...L, top: "tee", bottom: "chinos", botCol: "#5a4a3a", shoes: "#4a3526", glasses: undefined, lanyard: undefined, tag: undefined, headband: undefined, inner: undefined, trim: undefined, ...o });
const ARTHUR: Look = { seed: 211, skin: SKIN, top: "tee", topCol: "#2f6fd0", bottom: "chinos", botCol: "#6a5236", shoes: "#4a3526", hair: "short", hairCol: "#7a4f2c", width: 0.95 };
const KAY: Look = { seed: 223, skin: "#f3d2b0", top: "tee", topCol: "#7f8894", bottom: "chinos", botCol: "#4a4a55", shoes: "#3a3236", hair: "side", hairCol: "#3b2a22", width: 1.05 };
const ECTOR: Look = { seed: 239, skin: "#f1cfae", top: "tee", topCol: "#8a6a44", bottom: "chinos", botCol: "#4a3a2c", shoes: "#3a3236", hair: "short", hairCol: "#b9b7b4", width: 1.12 };
const LORD = (i: number): Look => ({ seed: 251 + 6 * i, skin: ["#f3d2b0", "#f6d9bd", "#efc9a4", "#f8d6b4"][i % 4], top: "tee", topCol: ["#e8dcc0", "#3a3a48", "#c9b48a", "#5a2f2f"][i % 4], bottom: "chinos", botCol: "#3a3236", shoes: "#2d2a30", hair: (["side", "short", "buzz", "curly"] as const)[i % 4], hairCol: ["#3b2a22", "#8c8a88", "#6b4a33", "#1f1a18"][i % 4], width: 1.25 + 0.05 * (i % 4) });
const GUARD = (i: number): Look => ({ seed: 301 + 4 * i, skin: SKIN, top: "tee", topCol: "#7f8894", bottom: "chinos", botCol: "#4a4a55", shoes: "#3a3236", hair: "buzz", hairCol: "#3b2a22", width: 1.06 });
const COMMON = (i: number): Look => base(classmate([3, 17, 42, 75, 8, 29][i % 6]), { width: 0.88 + 0.04 * (i % 3) });
const arthur = () => [tunic({ col: "#2f6fd0", scarf: "#d23b34" })];
const kay = () => [surcoat({ col: "#c2332f", charge: "chevron", chargeCol: "#f2c230" }), scabbard()];
const ector = () => [tunic({ col: "#8a6a44" }), cloak({ col: "#2f5a3c", fur: "#ece4d2" }), beard({ col: "#b9b7b4" }), moustache({ kind: "walrus", col: "#b9b7b4" })];
const lordAcc = (i: number) => () => [
  tunic({ col: ["#e8dcc0", "#3a3a48", "#c9b48a", "#5a2f2f"][i % 4], belt: "#3a2a22" }),
  cloak({ col: ["#7a2f8f", "#b0263a", "#d9a520", "#2d2a36"][i % 4], lining: i % 4 === 3 ? "#b0263a" : undefined, fur: i % 2 ? "#ece4d2" : false }),
  beard({ kind: (["full", "fork", "short", "full"] as const)[i % 4], col: ["#3b2a22", "#8c8a88", "#a3552a", "#1f1a18"][i % 4] }),
  ...(i % 4 === 2 ? [] : [moustache({ kind: (["handlebar", "walrus", "curl", "handlebar"] as const)[i % 4], col: ["#3b2a22", "#8c8a88", "#a3552a", "#1f1a18"][i % 4] })]),
];
const guard = (hand: 0 | 1 = 0) => () => [surcoat({ col: "#6f86a6", charge: "plain" }), spear({ hand })];
const common = (i: number) => () => [tunic({ col: ["#c8962e", "#a8502c", "#6f8a4a", "#8a6a44", "#b98a4a", "#7d8a5a"][i % 6], belt: i % 2 ? "#3a2a22" : undefined, hem: i % 3 === 1 ? "#e8dcc0" : false })];
const ROWS: Record<string, Fig[]> = {
  cast: [{ name: "arthur", look: ARTHUR, acc: arthur }, { name: "kay", look: KAY, acc: kay }, { name: "ector", look: ECTOR, acc: ector }, { name: "lord", look: LORD(0), acc: lordAcc(0) }, { name: "guard", look: GUARD(0), acc: guard() }, { name: "common", look: COMMON(0), acc: common(0) }],
  arthur: [{ name: "arthur", look: ARTHUR, acc: arthur }],
  kay: [{ name: "kay", look: KAY, acc: kay }],
  ector: [{ name: "ector", look: ECTOR, acc: ector }],
  // the finale: the same Arthur under a red cape (the cloak takes the neck, so the tunic goes without its scarf: the
  // cloak's own red at the throat stands in for it)
  king: [{ name: "king", look: ARTHUR, acc: () => [tunic({ col: "#2f6fd0" }), cloak({ col: "#c8282f", lining: "#8f1d2a", fur: "#f4efe2" })] }, { name: "king plain", look: ARTHUR, acc: () => [tunic({ col: "#2f6fd0" }), cloak({ col: "#c8282f" })] }],
  tunic: [{ name: "tunic", acc: () => [tunic()] }, { name: "tunic+scarf", acc: arthur }, { name: "tunic+hem", acc: () => [tunic({ col: "#a8502c", hem: "#e8dcc0" })] }, { name: "tunic green", acc: () => [tunic({ col: "#6f8a4a", belt: "#3a2a22", lace: false })] }],
  surcoat: [{ name: "chevron", acc: () => [surcoat()] }, { name: "pale", acc: () => [surcoat({ col: "#2f5fa8", charge: "pale", chargeCol: "#f4f1e8" })] }, { name: "bend", acc: () => [surcoat({ col: "#2f7a4a", charge: "bend", chargeCol: "#f2c230" })] }, { name: "quarter", acc: () => [surcoat({ col: "#c2332f", charge: "quarter", chargeCol: "#f4f1e8" })] }, { name: "fess", acc: () => [surcoat({ col: "#2d2a36", charge: "fess", chargeCol: "#f2c230" })] }, { name: "plain", acc: () => [surcoat({ col: "#6f86a6", charge: "plain" })] }],
  cloak: [{ name: "cloak", acc: () => [tunic({ col: "#e8dcc0" }), cloak()] }, { name: "cloak+fur", acc: () => [tunic({ col: "#8a6a44" }), cloak({ col: "#2f5a3c", fur: "#ece4d2" })] }, { name: "cloak red", acc: () => [tunic({ col: "#3a3a48" }), cloak({ col: "#b0263a", lining: "#f2c230" })] }, { name: "cloak short", acc: () => [tunic({ col: "#c9b48a" }), cloak({ col: "#d9a520", len: 0.45, fur: "#ece4d2" })] }],
  beard: [{ name: "full", acc: () => [beard({ kind: "full", col: "#b9b7b4" })] }, { name: "short", acc: () => [beard({ kind: "short" })] }, { name: "fork", acc: () => [beard({ kind: "fork", col: "#a3552a" })] }, { name: "stubble", acc: () => [beard({ kind: "stubble" })] }, { name: "full+walrus", acc: () => [beard({ col: "#b9b7b4" }), moustache({ kind: "walrus", col: "#b9b7b4" })] }, { name: "fork+curl", acc: () => [beard({ kind: "fork", col: "#1f1a18" }), moustache({ kind: "curl" })] }, { name: "full dark+handlebar", acc: () => [beard({ col: "#2a221e" }), moustache({ kind: "handlebar", col: "#2a221e" })] }, { name: "short+pencil", acc: () => [beard({ kind: "short", col: "#6b4a33" }), moustache({ kind: "pencil" })] }],
  scabbard: [{ name: "empty", acc: kay }, { name: "hilt", acc: () => [surcoat({ col: "#2f5fa8", charge: "pale", chargeCol: "#f4f1e8" }), scabbard({ empty: false })] }, { name: "right", acc: () => [tunic({ col: "#a8502c" }), scabbard({ side: 0 })] }, { name: "hilt right", acc: () => [tunic({ col: "#6f8a4a" }), scabbard({ side: 0, empty: false, col: "#2d2a36", chape: "#cfd4dc" })] }],
  spear: [{ name: "spear", look: GUARD(0), acc: guard(0) }, { name: "spear left", look: GUARD(1), acc: guard(1) }, { name: "spear tunic", acc: () => [tunic({ col: "#8a6a44" }), spear({ lift: 0.09 })] }, { name: "spear short", acc: () => [tunic({ col: "#c8962e" }), spear({ hand: 1, len: 1.6 })] }],
  lords: [0, 1, 2, 3].map((i) => ({ name: "lord" + i, look: LORD(i), acc: lordAcc(i) })),
  guards: [0, 1, 2, 3].map((i) => ({ name: "guard" + i, look: GUARD(i), acc: guard() })),
  commons: [0, 1, 2, 3, 4, 5].map((i) => ({ name: "common" + i, look: COMMON(i), acc: common(i) })),
  bare: [{ name: "bare", acc: () => [] }],
};
const lookOf = (n: string): Look => (n === "you" ? YOU : n[0] === "c" ? classmate(+n.slice(1)) : n[0] === "f" ? friend(+n.slice(1)) : (() => { throw new Error("garb_sheet: no look called " + n); })());

preview({ w: 540, h: 960, which: "cast" }, (c) => {
  const o = c.opts, M = c.mats();
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), M.paint({ color: o.ground ?? "#e9eef5" }));
  ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; c.scene.add(ground);
  const sun = makeSun(); sun.position.set(-0.5 * 14, 0.55 * 14, 0.67 * 14); sun.target.position.set(0, 0, 0); c.scene.add(sun, sun.target);
  const rc = new RigCast(c.scene, { light: LAB_CAST_LIGHT as never });
  const figs = ([] as Fig[]).concat(...(Array.isArray(o.which) ? o.which : [o.which]).map((w: string) => { if (!ROWS[w]) throw new Error("garb_sheet: no row called " + w); return ROWS[w]; }));
  const looks: Look[] | null = o.look ? (Array.isArray(o.look) ? o.look : [o.look]).map(lookOf) : null, dflt = [3, 17, 42, 75].map(classmate);
  const n: number = o.n ?? Math.max(figs.length, looks ? looks.length : 0), gap: number = o.gap ?? 0.62, rows: number = o.rows ?? 1, per = Math.ceil(n / rows);
  const cast = Array.from({ length: n }, (_, i) => {
    const f = figs[i % figs.length], L = looks ? base(looks[i % looks.length], o.width ? { width: o.width } : {}) : f.look ?? base(dflt[i % dflt.length], o.width ? { width: o.width } : {});
    const col = i % per, row = Math.floor(i / per);
    // rows stand behind one another, or (up = metres between them) above one another, as on a model sheet
    return { f, rig: rc.add(L, { acc: o.bare ? [] : f.acc() }), at: o.up ? new THREE.Vector3((col - (per - 1) / 2) * gap, (rows - 1 - row) * o.up, 0) : new THREE.Vector3((col - (per - 1) / 2) * gap + (row % 2) * gap * 0.5, 0, -row * 0.8) };
  });
  const wide = (per - 1) * gap + 0.7, high = o.up ? (rows - 1) * o.up + 1.6 : 0, dist: number = o.dist ?? Math.max(2.3, (wide / 2 / Math.tan((25 * Math.PI) / 180) / (c.w / c.h)) * 1.02, high / 2 / Math.tan((25 * Math.PI) / 180) * 1.02);
  if (o.up) ground.visible = false;
  return {
    cam: o.up ? { pos: [0, high / 2, dist], look: [0, high / 2, 0], fov: 50 } : { pos: [0, 1.3, dist], look: [0, 0.82, 0], fov: 50 },
    frame: (i, t) => {
      cast.forEach(({ f, rig, at }, k) => {
        const kind = (o.pose ?? "idle") as RigPose["kind"], tt = t + (o.t ?? 0) + k * 0.13;
        const pose: RigPose = kind === "walk" ? { kind, phase: o.phase ?? (0.12 + 0.19 * k) % 1, stride: o.stride ?? 0.2 } : kind === "haul" ? { kind, phase: o.phase ?? 0.25, amount: o.amount ?? 0.9 } : { kind, t: tt };
        rig.set({ at, facing: o.facing ?? 0, pose, expr: (o.expr ?? "neutral") as Expr, turn: o.turn, mouth: o.mouth as RigMouth | undefined, twist: o.twist });
      });
      rc.update(c.camera, c.h);
      cast.forEach(({ f, rig }, k) => console.log(`QA: ${k} ${f.name} reach ${rig.qa.reach.toFixed(3)} clear ${rig.qa.clear.toFixed(3)} held ${rig.qa.held.toFixed(3)}`));
    },
  };
});
