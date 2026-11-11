// Previews of the rig's seated and hand-to-head poses (kit/rig3d.ts: seat, "sit" / "desk" / "write" / "phone",
// armFront), in the lab set with the film's lab pipeline (the same renderer, sun, N8AO and tone mapping as
// rig3d_common.ts), on plain furniture built here: a chair (seat slab 0.44 x 0.42 m, top at y 0.456, with a back) and
// a desk (top at 0.75 m, its near edge 0.23 m in front of the seat's centre).
//   poseLab(opts) renders one still (window.__done) or, with `frames`, exposes window.__frame(i) (scripts/rig3d/
//   render.mjs --frames N / --pick a,b,c). Options given on the page's URL (render.mjs --opts) go over the entry's own.
// Every frame prints a QA line: reach (0 = every hand is in its place), clear (the smallest gap of anything to
// anything: arms to body / head / furniture, legs to seat / desk / floor, a held thing to head / body / desk; below 0
// = something passes through something) and, after the bar, the rig's own numbers per figure. In frames mode it also
// prints how far each hand and elbow moved since the frame before (m) and the largest such step so far.
import * as THREE from "three";
import { EffectComposer, RenderPass, EffectPass, ToneMappingEffect, ToneMappingMode } from "postprocessing";
import { N8AOPostPass } from "n8ao";
import { makeEnv, mats, LIGHTS } from "../../bt/pbr";
import { NOINK } from "../../vasa/ink";
import { buildLab, LAB_FILL, LAB_AO, LAB_CAST_LIGHT } from "../sets/lab";
import { RigCast, type Rig, type Hat, type Acc, type RigPoseKind, type RigSeat, type RigHead } from "../kit/rig3d";
import { accessories } from "../kit/rigacc/catalog";
import { phone } from "../kit/rigacc/phone";
import { pen } from "../kit/rigacc/pen";
import { finger } from "../kit/rigacc/finger";
import type { Expr } from "../kit/toon";
import { lookOf, type LookKey } from "./rig3d_common";

const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const rad = (d: number) => (d * Math.PI) / 180;

/** one person. seat: "chair" = on the chair, "desk" = on the chair at the desk, "none" (default) = standing.
 *  acc: accessories by name ("phone", "pen", "finger": in the pose's own hand; "phone0" / "phone1" / "pen0" / "pen1" / "finger0" / "finger1" = in that
 *  hand; any other name is taken from the catalogue, kit/rigacc/catalog.ts). facing = degrees the person (and the furniture) is turned from the row's direction. x / z = the place in
 *  the row (m; default: 0.95 m apart, centred). */
export type PoseWho = {
  look?: LookKey; hat?: Hat; acc?: string[]; pose?: RigPoseKind; arm?: 0 | 1; amount?: number; expr?: Expr;
  seat?: "chair" | "desk" | "none"; facing?: number; x?: number; z?: number;
  armFront?: [boolean | null, boolean | null]; hide?: string[]; lookDown?: number; headFront?: number; clipboard?: 0 | 1;
  /** the head layer (RigState.head): an accent of talking held still, to see a pose with it */
  head?: RigHead;
  /** a hand pinned in space: metres from the person's floor point in their own frame (x = their left, y = up, z =
   *  forward); null = the pose's own place */
  hands?: ([number, number, number] | null)[];
};
export type PoseLabOpts = {
  who: PoseWho[];
  w?: number; h?: number;
  /** the camera goes round the middle of the row: yaw in degrees from the row's direction (0 = in front of the
   *  people, 90 = at their left), pitch = degrees it looks down (9 = eye height, 25 = from above), dist = metres from
   *  the point it looks at (lookY above the floor) */
  cam?: { yaw?: number; pitch?: number; dist?: number; fov?: number; lookY?: number };
  /** frames mode: frame i is seen from views[i] = [yaw, pitch] (a contact sheet of camera angles in one page load) */
  views?: [number, number][];
  /** frames mode: the camera's yaw runs from a0 to a1 degrees over the frames (a1 itself is the frame after the last) */
  orbit?: [number, number];
  /** frames mode: seconds advance by 1/30 per frame from t (default: time stands still at t) */
  run?: boolean;
  /** frames mode: the phone pose's amount: 0 until `start`, up to 1 over `up` frames, held for `hold`, down over `down` */
  raise?: { start: number; up: number; hold: number; down: number };
  /** the furniture: the seat's top (m above the floor), the desk's near edge from the seat's centre, how far behind
   *  the seat's centre the hip sits (RigSeat.back) */
  seatTop?: number; deskEdge?: number; back?: number; deskTop?: number;
  /** furniture nobody sits on (the baseline of a flicker check: the same things in the picture, the figure standing
   *  beside them): a chair, or a chair at a desk, at x / z in the row, turned `facing` degrees */
  props?: { kind: "chair" | "desk"; x?: number; z?: number; facing?: number }[];
  frames?: number; t?: number; hand?: number;
};

const withHash = (o: PoseLabOpts): PoseLabOpts => {
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

/** the seven camera yaws the poses are checked from, at eye height and from above */
export const POSE_VIEWS: [number, number][] = [0, 45, -45, 90, -90, 135, 180].flatMap((y) => [[y, 9], [y, 25]] as [number, number][]);
/** the chair's and the desk's measures (m): the seat slab, where its back's front face is nearest the sitter */
const SEAT_W = 0.44, SEAT_D = 0.42, SEAT_T = 0.032, BACK_Z = 0.236, BACK_T = 0.026, BACK_H = 0.21, BACK_TILT = 0.14, DESK_W = 1.0, DESK_D = 0.55;
/** from the seat's centre back to the nearest point of the chair back's front face (its lower edge: the back leans) */
const BACKREST = BACK_Z - (BACK_T / 2) * Math.cos(BACK_TILT) - (BACK_H / 2) * Math.sin(BACK_TILT);
/** the top edge of the chair's back above the seat's top */
const BACK_TOP = 0.289 + (BACK_H / 2) * Math.cos(BACK_TILT) + (BACK_T / 2) * Math.sin(BACK_TILT);

export function poseLab(o0: PoseLabOpts) {
  const o = withHash(o0);
  const w = o.w ?? 540, h = o.h ?? 960;
  const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
  renderer.setSize(w, h); renderer.setPixelRatio(1);
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = LIGHTS.shadow.type;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  document.body.style.margin = "0"; document.body.appendChild(renderer.domElement);
  const scene = new THREE.Scene(); scene.background = new THREE.Color("#bfe3f7");
  const camera = new THREE.PerspectiveCamera(46, w / h, 0.05, 2000);
  camera.layers.enable(NOINK);
  const M = mats(makeEnv(renderer), makeEnv(renderer, LAB_FILL));
  const lab = buildLab(M);
  scene.add(lab.group, ...lab.lights);
  lab.setDial(82); lab.animate(1);
  const comp = new EffectComposer(renderer, { frameBufferType: THREE.HalfFloatType, multisampling: 4, stencilBuffer: true });   // stencil: the figures' head-over-body layering
  comp.addPass(new RenderPass(scene, camera));
  const n8 = new N8AOPostPass(scene, camera, w, h);
  n8.configuration.aoRadius = LAB_AO.aoRadius; n8.configuration.intensity = LAB_AO.intensity;
  n8.configuration.distanceFalloff = LAB_AO.distanceFalloff; n8.configuration.color = new THREE.Color(LAB_AO.color);
  n8.configuration.halfRes = false; n8.setQualityMode("Ultra");
  comp.addPass(n8);
  comp.addPass(new EffectPass(camera, new ToneMappingEffect({ mode: ToneMappingMode.NEUTRAL })));

  // ---- furniture: plain boxes in the set's own materials. Built in the sitter's frame (z = the way they face). ----
  const seatTop = o.seatTop ?? 0.456, deskEdge = o.deskEdge ?? 0.23, deskTop = o.deskTop ?? 0.75;
  const mShell = M.paint({ color: "#3f72d9", roughness: 0.42 }), mFrame = M.paint({ color: "#4b5059", roughness: 0.5 });
  const mTop = M.wood({ color: "#d8b98c", roughness: 0.6 }), mPaper = M.paint({ color: "#f4f2ea", roughness: 0.9 });
  const box = (g: THREE.Group, m: THREE.Material, sx: number, sy: number, sz: number, x: number, y: number, z: number, rx = 0) => {
    const b = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), m);
    b.position.set(x, y, z); b.rotation.x = rx; b.castShadow = true; b.receiveShadow = true; g.add(b);
    return b;
  };
  const chair = () => {
    const g = new THREE.Group();
    box(g, mShell, SEAT_W, SEAT_T, SEAT_D, 0, seatTop - SEAT_T / 2, 0);
    box(g, mShell, 0.42, BACK_H, BACK_T, 0, seatTop + 0.289, -BACK_Z, -BACK_TILT);
    for (const s of [-1, 1]) {
      box(g, mFrame, 0.022, 0.42, 0.022, s * 0.17, seatTop + 0.185, -BACK_Z - 0.03, -BACK_TILT);     // the back's posts
      for (const z of [-0.18, 0.18]) box(g, mFrame, 0.022, seatTop - SEAT_T, 0.022, s * 0.19, (seatTop - SEAT_T) / 2, z);
    }
    return g;
  };
  const desk = () => {
    const g = new THREE.Group(), zc = deskEdge + DESK_D / 2;
    box(g, mTop, DESK_W, 0.03, DESK_D, 0, deskTop - 0.015, zc);
    box(g, mFrame, DESK_W - 0.1, 0.03, 0.025, 0, deskTop - 0.045, deskEdge + 0.03);                    // the rail under the near edge
    box(g, mFrame, DESK_W - 0.1, 0.03, 0.025, 0, deskTop - 0.045, deskEdge + DESK_D - 0.03);
    for (const s of [-1, 1]) for (const z of [0.04, DESK_D - 0.04]) box(g, mFrame, 0.035, deskTop - 0.03, 0.035, s * (DESK_W / 2 - 0.05), (deskTop - 0.03) / 2, deskEdge + z);
    box(g, mPaper, 0.21, 0.0012, 0.297, -0.03, deskTop + 0.0006, deskEdge + 0.19);                      // a sheet to write on
    return g;
  };

  // ---- people ----
  const rc = new RigCast(scene, { light: LAB_CAST_LIGHT as never, hand: o.hand });
  const centre = V(-1.2, 0, 0.1), n = o.who.length;
  const accOf = (wh: PoseWho): Acc[] => (wh.acc ?? []).map((a) => {
    const own = wh.arm, last = a.slice(-1), hd = last === "0" ? 0 : last === "1" ? 1 : undefined;
    if (a.startsWith("phone")) return phone({ hand: hd ?? own ?? 1 });
    if (a.startsWith("pen")) return pen({ hand: hd ?? own ?? 0 });
    if (a.startsWith("finger")) return finger({ hand: hd ?? own ?? 1 });
    return accessories(a);
  }).flat();
  for (const pr of o.props ?? []) {
    const g = new THREE.Group(); g.position.set(centre.x + (pr.x ?? 0), 0, centre.z + (pr.z ?? 0)); g.rotation.y = rad(pr.facing ?? 0); scene.add(g);
    g.add(chair());
    if (pr.kind === "desk") g.add(desk());
  }
  const people = o.who.map((wh, k) => {
    const at = V(centre.x + (wh.x ?? (k - (n - 1) / 2) * 0.95), 0, centre.z + (wh.z ?? 0)), facing = rad(wh.facing ?? 0);
    const kind = wh.seat ?? "none";
    let seat: RigSeat | undefined;
    if (kind !== "none") {
      const g = new THREE.Group(); g.position.copy(at); g.rotation.y = facing; scene.add(g);
      g.add(chair());
      if (kind === "desk") g.add(desk());
      seat = { top: V(at.x, seatTop, at.z), front: SEAT_D / 2, backrest: BACKREST, backrestTop: seatTop + BACK_TOP, ...(o.back !== undefined ? { back: o.back } : {}), ...(kind === "desk" ? { deskEdge, deskTop } : {}) };
    }
    return { wh, at, facing, seat, rig: rc.add(lookOf(wh.look), { hat: wh.hat, acc: accOf(wh) }) };
  });

  const N = o.frames ?? 1;
  const amountAt = (i: number, wh: PoseWho) => {
    const r = o.raise;
    if (!r) return wh.amount;
    const u = i < r.start ? 0 : i < r.start + r.up ? (i - r.start) / r.up : i < r.start + r.up + r.hold ? 1 : Math.max(0, 1 - (i - r.start - r.up - r.hold) / r.down);
    return u;
  };
  const prev: THREE.Vector3[][] = people.map(() => []);
  let prevI = -2, worst = 0, worstSw = 0;
  const prevSw: number[][] = people.map(() => []);
  const render = (i: number) => {
    // the camera
    const c = o.cam ?? {};
    let yaw = c.yaw ?? 0, pitch = c.pitch ?? 9;
    if (o.views) [yaw, pitch] = o.views[i % o.views.length];
    if (o.orbit) yaw = o.orbit[0] + ((o.orbit[1] - o.orbit[0]) * i) / N;
    const dist = c.dist ?? 2.15, lookY = c.lookY ?? 0.76, a = rad(yaw), p = rad(pitch);
    camera.position.set(centre.x + Math.sin(a) * Math.cos(p) * dist, lookY + Math.sin(p) * dist, centre.z + Math.cos(a) * Math.cos(p) * dist);
    camera.lookAt(centre.x, lookY, centre.z);
    camera.fov = c.fov ?? 46; camera.updateProjectionMatrix(); camera.updateMatrixWorld();
    const T = (o.t ?? 1) + (o.run ? i / 30 : 0);
    people.forEach((P, k) => {
      const wh = P.wh, kind = wh.pose ?? "idle", am = amountAt(i, wh);
      P.rig.set({
        at: P.at, facing: P.facing, ...(P.seat ? { seat: P.seat } : {}),
        pose: { kind, t: T + k * 0.31, ...(wh.arm !== undefined ? { arm: wh.arm } : {}), ...(am !== undefined ? { amount: am } : {}), ...(kind === "walk" ? { phase: (T * 0.9) % 1 } : {}) },
        expr: wh.expr ?? "smile", blink: 0,
        ...(wh.armFront ? { armFront: [wh.armFront[0] ?? undefined, wh.armFront[1] ?? undefined] as [boolean | undefined, boolean | undefined] } : {}),
        ...(wh.hide ? { hide: wh.hide } : {}), ...(wh.lookDown !== undefined ? { lookDown: wh.lookDown } : {}), ...(wh.headFront !== undefined ? { headFront: wh.headFront } : {}),
        ...(wh.clipboard !== undefined ? { clipboard: wh.clipboard } : {}), ...(wh.head ? { head: wh.head } : {}),
        ...(wh.hands ? { hands: [0, 1].map((j) => { const q = wh.hands![j]; return q ? V(P.at.x + q[0] * Math.cos(P.facing) + q[2] * Math.sin(P.facing), q[1], P.at.z - q[0] * Math.sin(P.facing) + q[2] * Math.cos(P.facing)) : null; }) as [THREE.Vector3 | null, THREE.Vector3 | null] } : {}),
      });
    });
    rc.update(camera, h);
    // QA
    let reach = 0, clear = 1;
    const per: string[] = [], f3 = (x: number) => x.toFixed(3);
    const cont = o.frames !== undefined && !o.views && i === prevI + 1;
    people.forEach((P, k) => {
      const q = P.rig.qa, pts = [P.rig.handWorld(0), P.rig.handWorld(1), P.rig.elbowWorld(0), P.rig.elbowWorld(1)];
      reach = Math.max(reach, q.reach); clear = Math.min(clear, q.clear, q.seat, q.head);
      let s = `${k}:${P.rig.state.pose.kind} r${f3(q.reach)} c${f3(q.clear)} seat${f3(q.seat)} head${f3(q.head)} sw${q.swivel.map((x) => x.toFixed(2)).join("/")} turn${Math.round((Math.atan2(Math.sin(P.rig.bodyYaw - P.facing), Math.cos(P.rig.bodyYaw - P.facing)) * 180) / Math.PI)}`;
      if (cont) {
        const step = pts.map((v, j) => v.distanceTo(prev[k][j])), sw = Math.max(Math.abs(q.swivel[0] - prevSw[k][0]), Math.abs(q.swivel[1] - prevSw[k][1]));
        worst = Math.max(worst, ...step); worstSw = Math.max(worstSw, sw);
        s += ` step h${step[0].toFixed(4)}/${step[1].toFixed(4)} e${step[2].toFixed(4)}/${step[3].toFixed(4)}`;
      }
      prev[k] = pts; prevSw[k] = [...q.swivel];
      per.push(s);
    });
    prevI = i;
    if (i === 0) console.log("QA: dim " + people.slice(0, 4).map((P) => JSON.stringify(P.rig.dim, (key, v) => (typeof v === "number" ? +v.toFixed(4) : v))).join(" | "));
    console.log(`QA: frame ${i} reach ${f3(reach)} clear ${clear.toFixed(4)} | ` + per.join("  ") + (o.frames !== undefined && !o.views ? ` | largest step ${worst.toFixed(4)} m, swivel step ${worstSw.toFixed(3)} rad` : ""));
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
