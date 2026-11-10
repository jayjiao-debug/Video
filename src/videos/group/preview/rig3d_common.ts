// Previews of the 3D "toy" rig (kit/rig3d.ts) in the lab set, beside the current drawn cards (kit/cast.ts), on the
// film's lab rig: mats(STUDIO, LAB_FILL), the set's sun (PCF), N8AO (LAB_AO), NEUTRAL tone mapping.
//   rigLab(opts) renders one still (window.__done) or, with frames, exposes window.__frame(i) for rig3d_frames.sh.
import * as THREE from "three";
import { EffectComposer, RenderPass, EffectPass, ToneMappingEffect, ToneMappingMode } from "postprocessing";
import { N8AOPostPass } from "n8ao";
import { makeEnv, mats, LIGHTS } from "../../bt/pbr";
import { NOINK } from "../../vasa/ink";
import { buildLab, LAB_FILL, LAB_AO, LAB_CAST_LIGHT, type Cam } from "../sets/lab";
import { Cast, YOU, RESEARCHER, classmate, friend, lidAt, walkPhase, type Figure } from "../kit/cast";
import { RigCast, RIG_WALK_CYCLE_M, type Rig, type Hat, type Acc, type RigPoseKind } from "../kit/rig3d";
import { Rope, lieSlack } from "../kit/rope";
import type { Expr, Look } from "../kit/toon";

const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
export type Who = "rig" | "card";
export type LookKey = "you" | "researcher" | "worker" | "mate" | `friend${number}` | `class${number}` | Look;
/** one person of a lineup: the look (see lookOf), accessories, a pose and an expression, the facing in degrees from
 *  the camera (default 0; in frames mode the whole row sweeps `turn`) */
export type LineupWho = { look?: LookKey; hat?: Hat; acc?: Acc[]; set?: string | string[]; pose?: RigPoseKind; expr?: Expr; facing?: number; hide?: string[]; label?: string };
export type RigLabOpts = {
  who: Who; scene: "pullers" | "trio" | "turn" | "crowd" | "lineup";
  /** lineup scene (rig only): people in a row, `gap` metres apart (default 0.62), `rows` deep (default 1), the middle
   *  of the row at `centre` [x, z]; sweep = [a0, a1] degrees: everyone turns together over the frames */
  lineup?: { who: LineupWho[]; gap?: number; rows?: number; centre?: [number, number]; sweep?: [number, number] };
  /** accessories by name, for `set` in a turn or a lineup: the name of a set (or several) instead of the objects, so
   *  that a case can be chosen on the command line (--opts '{"turn":{"set":"topHat"}}'); kit/rigacc/catalog.ts has
   *  the standard ones */
  accSets?: Record<string, () => Acc[]>;
  /** rig only: 0 = clean geometry, 1 (default) = hand-drawn */
  hand?: number;
  /** pullers (rig): the body's distance from the rope line and the two grips along the rope (m, + = behind the body) */
  haul?: { lat: number; g0: number; g1: number; amount?: number; twist?: number };
  /** turn scene: the look (default YOU; "friend0".."friend5" = the six named friends: ponytail, curly, bob, side,
   *  long, buzz; "class<N>" = classmate(N); or a Look), a hat, the facing sweep in degrees (frames mode) or one facing */
  turn?: { look?: LookKey; hat?: Hat; acc?: Acc[]; set?: string | string[]; hide?: string[]; a0: number; a1: number; pose?: RigPoseKind; expr?: Expr; exprs?: Expr[]; blink?: number; gaze?: number };
  w?: number; h?: number;
  /** a lab cam name, a Cam, or an orbit (frames mode) */
  cam?: "main" | "side" | "pos1" | Cam;
  orbit?: { centre: [number, number, number]; r: number; y: number; a0: number; a1: number; look?: [number, number, number]; fov: number };
  frames?: number; t?: number;
};
/** the worker / teammates from world.ts LOOK (copied: world.ts builds both sets on import) */
const WORKER: Look = { ...classmate(42), top: "sweater", topCol: "#5d9b5a", trim: "#eef1e6", glasses: "round", glassCol: "#2a2430" };
const MATE1: Look = { ...classmate(75), top: "hoodie", topCol: "#f08a3c", trim: "#fbe9d6" };

/** options given on the page's URL (#<json>; scripts/rig3d/render.mjs --size / --opts) go over the entry's own */
const withHash = (o: RigLabOpts): RigLabOpts => {
  const h = typeof location !== "undefined" ? decodeURIComponent(location.hash.slice(1)) : "";
  if (!h) return o;
  const merge = (a: any, b: any): any => {
    if (!a || !b || typeof a !== "object" || typeof b !== "object" || Array.isArray(a) || Array.isArray(b)) return b;
    const r = { ...a };
    for (const k of Object.keys(b)) r[k] = merge(a[k], b[k]);
    return r;
  };
  return merge(o, JSON.parse(h));
};

export const lookOf = (k: LookKey | undefined): Look =>
  !k || k === "you" ? YOU : typeof k === "object" ? k : k === "researcher" ? RESEARCHER : k === "worker" ? WORKER : k === "mate" ? MATE1
    : k.startsWith("friend") ? friend(+k.slice(6)) : classmate(+k.slice(5));

export function rigLab(o0: RigLabOpts) {
  const o = withHash(o0);
  const w = o.w ?? 540, h = o.h ?? 960;
  const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
  renderer.setSize(w, h); renderer.setPixelRatio(1);
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = LIGHTS.shadow.type;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  document.body.style.margin = "0"; document.body.appendChild(renderer.domElement);
  const scene = new THREE.Scene(); scene.background = new THREE.Color("#bfe3f7");
  const camera = new THREE.PerspectiveCamera(50, w / h, 0.05, 2000);
  camera.layers.enable(NOINK);
  const M = mats(makeEnv(renderer), makeEnv(renderer, LAB_FILL));
  const lab = buildLab(M);
  scene.add(lab.group, ...lab.lights);
  lab.setDial(82); lab.animate(1);
  const A = lab.anchors;
  const comp = new EffectComposer(renderer, { frameBufferType: THREE.HalfFloatType, multisampling: 4, stencilBuffer: true });   // stencil: the figures' head-over-body layering
  comp.addPass(new RenderPass(scene, camera));
  const n8 = new N8AOPostPass(scene, camera, w, h);
  n8.configuration.aoRadius = LAB_AO.aoRadius; n8.configuration.intensity = LAB_AO.intensity;
  n8.configuration.distanceFalloff = LAB_AO.distanceFalloff; n8.configuration.color = new THREE.Color(LAB_AO.color);
  n8.configuration.halfRes = false; n8.setQualityMode("Ultra");
  comp.addPass(n8);
  comp.addPass(new EffectPass(camera, new ToneMappingEffect({ mode: ToneMappingMode.NEUTRAL })));

  const setCam = (k: Cam) => { camera.position.set(...k.pos); camera.lookAt(...k.look); camera.fov = k.fov; camera.near = 0.05; camera.updateProjectionMatrix(); camera.updateMatrixWorld(); };
  const camAt = (i: number): Cam => {
    if (o.orbit) {
      const n = Math.max(1, (o.frames ?? 1) - 1), u = i / n, e = u * u * (3 - 2 * u), a = o.orbit.a0 + (o.orbit.a1 - o.orbit.a0) * e, c = o.orbit.centre;
      return { pos: [c[0] + Math.sin(a) * o.orbit.r, o.orbit.y, c[2] + Math.cos(a) * o.orbit.r], look: o.orbit.look ?? [c[0], 1.0, c[2]], fov: o.orbit.fov };
    }
    const k = o.cam ?? "main";
    return typeof k === "string" ? lab.cams[k] : k;
  };

  // ---- people ----
  const rc = o.who === "rig" ? new RigCast(scene, { light: LAB_CAST_LIGHT as never, hand: o.hand }) : null;
  const cast = o.who === "card" ? new Cast(scene, { renderHeight: h, light: LAB_CAST_LIGHT as never }) : null;
  type P = { rig?: Rig; card?: Figure };
  const mk = (L: Look, hat?: Hat, acc?: Acc[]): P => (rc ? { rig: rc.add(L, { hat, acc }) } : { card: cast!.add(L) });
  /** the accessories given as objects plus the named sets */
  const accOf = (acc?: Acc[], set?: string | string[]): Acc[] | undefined => {
    const more = (!set ? [] : Array.isArray(set) ? set : [set]).flatMap((n) => { const f = o.accSets?.[n]; if (!f) throw new Error(`rigLab: no accessory set "${n}"`); return f(); });
    return acc || more.length ? [...(acc ?? []), ...more] : undefined;
  };
  const all: P[] = [];
  const qa = (i: number) => {
    if (!rc) return;
    let reach = 0, clear = 1;
    for (const f of rc.figures) { reach = Math.max(reach, f.qa.reach); clear = Math.min(clear, f.qa.clear); }
    if (i === 0) console.log("QA: dim " + rc.figures.slice(0, 4).map((f) => JSON.stringify(f.dim, (k, v) => (typeof v === "number" ? +v.toFixed(4) : v))).join(" | "));
    if (i === 0 || reach > 0.012 || clear < -0.0005) console.log(`QA: frame ${i} reach ${reach.toFixed(3)} clear ${clear.toFixed(4)} | ` + rc.figures.map((f, k) => `${k}:${f.state.pose.kind} r${f.qa.reach.toFixed(3)} c${f.qa.clear.toFixed(3)} sw${f.qa.swivel.map((x) => x.toFixed(2)).join("/")}`).join("  "));
  };
  const ropes: Rope[] = [];
  let frame: (t: number, i: number) => void;
  if (o.scene === "pullers") {
    const looks = [YOU, WORKER, MATE1, classmate(34), classmate(41), classmate(48)];
    const exprs: Expr[] = ["huff", "pained", "huff", "stern", "huff", "pained"];
    const hats: (Hat | undefined)[] = [undefined, undefined, undefined, { kind: "cap", col: "#3f6b8f", trim: "#2c4a66" }, undefined, { kind: "beanie", col: "#c9503f", trim: "#f1e6d2" }];
    const ps = looks.map((L, i) => mk(L, hats[i])), res = mk(RESEARCHER);
    const R = new Rope(M, { radius: 0.016, gold: 0.55, seed: 3 }), tail = new Rope(M, { radius: 0.016, gold: 0.55, seed: 5 });
    scene.add(R.mesh, tail.mesh); ropes.push(R, tail);
    const tie = { kind: "knot" as const, axis: A.hookTie.axis, postR: A.hookTie.postR }, HL = o.haul ?? { lat: 0.19, g0: -0.08, g1: 0.05, twist: 0.75 };
    frame = (T) => {
      A.positions.forEach((p, i) => {
        const P = ps[i], ph = (0.15 + i * 0.23 + T * 0.6) % 1;
        if (P.rig) {
          // the body stands beside the rope (the rope passes in front of the hips on the camera side)
          P.rig.set({
            at: V(p.x, 0, A.ropeZ - HL.lat), facing: A.facing, pose: { kind: "haul", t: T + i * 0.37, phase: ph, amount: HL.amount ?? 0.85 },
            hands: [V(p.x + HL.g0, A.ropeY, A.ropeZ), V(p.x + HL.g1, A.ropeY, A.ropeZ)], expr: exprs[i], blink: lidAt(T, i), twist: HL.twist ?? 0,
          });
        } else {
          P.card!.set({ at: p, facing: A.facing, view: "side", pose: { kind: "haul", t: T + i * 0.37, phase: ph, amount: 0.85, grip: true },
            aimAt: [null, V(p.x - 1.2, A.ropeY, A.ropeZ)], expr: exprs[i], blink: lidAt(T, i) });
        }
      });
      const ra = A.researcher, rf = Math.atan2(A.positions[0].x - ra.x, A.positions[0].z - ra.z);
      if (res.rig) res.rig.set({ at: V(ra.x, 0, ra.z - 0.3), facing: rf, pose: { kind: "hold", t: T }, clipboard: 1, expr: "neutral", blink: lidAt(T, 9) });
      else res.card!.set({ at: ra, facing: rf, pose: { kind: "idle", t: T, props: [null, "clipboard"] }, expr: "neutral", blink: lidAt(T, 9) });
      if (rc) rc.update(camera, h); else cast!.update(camera, T);
      const hands = ps.map((P) => (P.rig ? [P.rig.handWorld(1), P.rig.handWorld(0)] : [P.card!.handWorld(1), P.card!.handWorld(0)]));
      const via: THREE.Vector3[] = []; for (const hh of hands) via.push(hh[0], hh[1]);
      const last = hands[5][1], floorEnd = V(A.positions[5].x + 0.85, 0, A.ropeZ - 0.12);
      R.update({ a: A.hook, b: last, via: via.slice(0, -1), attachA: tie, attachB: { kind: "hand", tail: 0 } });
      tail.update({ a: last, b: floorEnd, slack: lieSlack(last, floorEnd, 0, 0.016), attachA: { kind: "hand", tail: 0 }, attachB: { kind: "end" } });
    };
  } else if (o.scene === "crowd") {
    // 84 people standing in a block (12 x 7): a cost test for the classroom crowd
    const ps: P[] = [];
    for (let i = 0; i < 84; i++) ps.push(mk(i === 40 ? YOU : classmate(30 + i), i % 9 === 4 ? { kind: i % 2 ? "cap" : "beanie", col: ["#3f6b8f", "#c9503f", "#5d9b5a"][i % 3] } : undefined));
    frame = (T) => {
      const t0 = performance.now();
      ps.forEach((P, i) => {
        const at = V(-2.9 + (i % 12) * 0.42, 0, -1.7 + Math.floor(i / 12) * 0.5), pose = (i % 5 === 0 ? { kind: "wave", t: T + i, arm: i % 2 } : i % 7 === 3 ? { kind: "cheer", t: T + i * 0.3 } : { kind: "idle", t: T + i }) as never;
        if (P.rig) P.rig.set({ at, facing: 0.3 * Math.sin(i * 1.7), pose, expr: (["smile", "neutral", "grin", "smug"] as Expr[])[i % 4], blink: lidAt(T, i) });
        else P.card!.set({ at, facing: 0.3 * Math.sin(i * 1.7), pose, expr: "smile", blink: lidAt(T, i) });
      });
      if (rc) rc.update(camera, h); else cast!.update(camera, T);
      console.log(`QA: crowd update ${(performance.now() - t0).toFixed(1)} ms`);
    };
  } else if (o.scene === "turn") {
    // one person turning on the spot in front of a fixed camera: the body stops at 45 deg, the face stays, the hair goes round
    const tn = o.turn ?? { a0: 0, a1: 0 };
    const L = lookOf(tn.look);
    const P = mk(L, tn.hat, accOf(tn.acc, tn.set)), at = V(-1.2, 0, 0.2);
    frame = (T, i) => {
      const n = Math.max(1, (o.frames ?? 1) - 1), deg = tn.a0 + ((tn.a1 - tn.a0) * i) / n;
      const camYaw = Math.atan2(camera.position.x - at.x, camera.position.z - at.z), facing = camYaw + (deg * Math.PI) / 180;
      const kind = tn.pose ?? "idle";
      if (P.rig) P.rig.set({ at, facing, pose: (kind === "walk" ? { kind, t: T, phase: (T * 0.9) % 1 } : { kind, t: T, arm: 1 }) as never, expr: tn.exprs ? tn.exprs[i % tn.exprs.length] : tn.expr ?? "smile", blink: tn.blink ?? 0, ...(tn.gaze !== undefined ? { gaze: tn.gaze } : {}), ...(tn.hide ? { hide: tn.hide } : {}) } as never);
      else P.card!.set({ at, facing, pose: (kind === "walk" ? { kind, t: T, phase: (T * 0.9) % 1 } : { kind, t: T, arm: 1 }) as never, expr: "smile", blink: 0 });
      if (rc) rc.update(camera, h); else cast!.update(camera, T);
    };
  } else if (o.scene === "lineup") {
    // people side by side, each with their own look, accessories, pose and expression (accessory sheets)
    const lu = o.lineup ?? { who: [{}] }, gap = lu.gap ?? 0.62, rows = lu.rows ?? 1, per = Math.ceil(lu.who.length / rows), c = lu.centre ?? [-1.2, 0.2];
    const ps = lu.who.map((wh) => mk(lookOf(wh.look), wh.hat, accOf(wh.acc, wh.set)));
    frame = (T, i) => {
      const n = Math.max(1, (o.frames ?? 1) - 1), sw = lu.sweep ? lu.sweep[0] + ((lu.sweep[1] - lu.sweep[0]) * i) / n : 0;
      ps.forEach((P, k) => {
        const wh = lu.who[k], row = Math.floor(k / per), col = k % per, inRow = Math.min(per, lu.who.length - row * per);
        const at = V(c[0] + (col - (inRow - 1) / 2) * gap, 0, c[1] - row * 0.75);
        const camYaw = Math.atan2(camera.position.x - at.x, camera.position.z - at.z), facing = camYaw + (((wh.facing ?? 0) + sw) * Math.PI) / 180;
        const kind = wh.pose ?? "idle";
        P.rig!.set({ at, facing, pose: (kind === "walk" ? { kind, t: T, phase: (T * 0.9 + k * 0.17) % 1 } : { kind, t: T + k * 0.31, arm: 1 }) as never, expr: wh.expr ?? "smile", blink: 0, ...(wh.hide ? { hide: wh.hide } : {}) });
      });
      rc!.update(camera, h);
    };
  } else {
    // trio: you waving, the researcher with her clipboard, the worker idle; all "facing" the gauge end (-x) a little
    const you = mk(YOU), res = mk(RESEARCHER), wk = mk(WORKER), walker = mk(MATE1, { kind: "cap", col: "#3f6b8f", trim: "#2c4a66" });
    const base = V(-1.2, 0, 0.35);
    frame = (T) => {
      const s = (P: P, at: THREE.Vector3, facing: number, pose: never, expr: Expr, id: number, extra: object = {}) => {
        if (P.rig) P.rig.set({ at, facing, pose, expr, blink: lidAt(T, id), ...extra });
        else P.card!.set({ at, facing, pose, expr, blink: lidAt(T, id), ...extra });
      };
      s(you, base.clone().add(V(-0.02, 0, 0.12)), 0.15, { kind: "wave", t: T, arm: 1 } as never, "grin", 1);
      s(res, base.clone().add(V(-0.62, 0, -0.36)), 0.55, (res.rig ? { kind: "hold", t: T } : { kind: "idle", t: T, props: [null, "clipboard"] }) as never, "neutral", 2, res.rig ? { clipboard: 1 } : {});
      s(wk, base.clone().add(V(0.74, 0, -0.12)), -0.55, { kind: "idle", t: T } as never, "smug", 3);
      // a teammate walking across behind them (+x): the body turns toward the camera, the feet stay planted
      const dist = 0.5 * (T - 1.5), wat = V(-2.4 + dist, 0, -0.9);
      s(walker, wat, Math.PI / 2, (walker.rig ? { kind: "walk", t: T, phase: (dist / RIG_WALK_CYCLE_M) % 1 } : { kind: "walk", t: T, phase: walkPhase(dist) }) as never, "smile", 4);
      if (rc) rc.update(camera, h); else cast!.update(camera, T);
    };
  }
  const render = (i: number) => {
    setCam(camAt(i));
    frame((o.t ?? 1) + (o.scene === "turn" || o.scene === "lineup" ? 0 : i / 30), i);
    qa(i);
    comp.render();
  };
  if (o.frames) {
    (window as any).__frame = (i: number) => { render(i); return true; };
    (window as any).__ready = true;
  } else {
    render(0);
    (window as any).__done = true;
  }
}
