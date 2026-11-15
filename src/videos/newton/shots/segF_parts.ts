// SEGMENT F's own helpers (the v5 one take): the marks scene F and scene G share (G opens on F's last frame with NO CUT:
// clock join ⑩ races over F's held extreme close, so G reads F's end from here, never the other way), her eyes (the
// crouch at his seated eye height, the extreme close), the constant-speed push, a lagged point, axes -> quaternion, THE
// SHOVEL by its blade, the charcoal's strokes on the board, THE FIRE's own 3D sparks and flare (in the world, depth
// tested, behind his face: the v5 table's "light on the fire and his face only", no screen effect anywhere in F), the
// candle's light on the furnace top, the grades (the night garden; the room sunk round him as the fire dies), the
// stool under the seated Newton (a little shorter: its seat stays hidden inside his coat).
// Every function is pure: nothing keeps state between frames (the meshes built once per World are only shown, moved
// and dimmed per frame); all noise from hash().
//
// FOR SCENE G (read only; segG imports these so the F -> G join stays one picture):
//   F_EYE_CROUCH, F_S       her crouched eye height and her floor point by him (she stays there to F's last frame)
//   F_SEAT_EYES             the point her lens is aimed at on the stool (his eyes' place while he sits)
//   F_END_CAM (= PUSH_END)  F's last camera: the extreme close, held from "dressings" to F's last frame
//   F_SEAT, F_BOARD, F_CANDLE, F_POKER_REST   where F leaves him, his board, his candle (still tall: no lapse) and the poker
//   fireF(f)                the fire F leaves burning (fire, embers, the grade's "late" share) on any frame from F07 on,
//                           through the race ⑩ (the firelight on his face sinks to ember red from BEAT.F.race to
//                           BEAT.G.strike1, the race's landing: G carries it on)
//   putStoolUnder           the stool, a little shorter (STOOL_SY)
import * as THREE from "three";
import { FPS, clamp01, lerp, smooth, easeOutCubic, hash, type CamPose } from "../story";
import { ELX, ELAB, ELAB_SET, type TaSeat } from "../layout";
import { BOARD, POKER, STOOL } from "../props";
import { BEAT } from "../beats";
import * as C from "../cam";
import type { GradeParams } from "../../vasa/grade";
import type { World } from "../world";
import { NOINK } from "../../../kit/fx/ink";
import { glowCard } from "../../../kit/sets/okit";

export const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
export const sec = (s: number) => Math.round(s * FPS);
/** a camera's position as a Vector3 */
export const posOf = (c: CamPose) => (c.pos instanceof THREE.Vector3 ? c.pos.clone() : V(c.pos[0], c.pos[1], c.pos[2]));
/** a walker's ease: speeding up over the first quarter, steady, slowing over the last (peak 1.33 x the average) */
export const stride = (x: number, r = 0.25) => {
  const v = 1 / (1 - r), u = clamp01(x);
  return u < r ? (v * u * u) / (2 * r) : u > 1 - r ? 1 - (v * (1 - u) * (1 - u)) / (2 * r) : v * (u - r / 2);
};
/** THE SLOW PUSH: 0..1 over [from, to] at a constant speed with soft starts of `ramp` frames (cam.ts creep's profile) */
export const creepU = (f: number, from: number, to: number, ramp = 8) => {
  const n = Math.max(1, to - from), r = Math.min(ramp, n / 3), x = clamp01((f - from) / n) * n, v = 1 / (n - r);
  return clamp01(x < r ? (v * x * x) / (2 * r) : x > n - r ? 1 - (v * (n - x) * (n - x)) / (2 * r) : v * (x - r / 2));
};
/** an ease that LEAVES at speed `v0` (a multiple of the average speed: she is already walking when it starts) and lands
 *  at rest (a cubic with u(0) 0, u'(0) v0, u(1) 1, u'(1) 0) */
export const fromWalk = (v0: number) => (x: number) => { const u = clamp01(x), c = v0 - 2, b = 3 - 2 * v0; return v0 * u + b * u * u + c * u * u * u; };
/** a sine in-out (the director's "sine in-out" for the slow push over her promise) */
export const sineIO = (x: number) => 0.5 - 0.5 * Math.cos(Math.PI * clamp01(x));
/** a point averaged over the `win` frames up to f (weights falling off: her eyes follow a little late). Pure. */
export const lagged = (f: number, at: (g: number) => THREE.Vector3, win = 6) => {
  const p = V(); let ws = 0;
  for (let i = 0; i < win; i++) { const wg = win - i; p.addScaledVector(at(f - i), wg); ws += wg; }
  return p.divideScalar(ws);
};
/** a world rotation from a thing's local +y and +z given as world directions (z made perpendicular to y) */
export const quatYZ = (y: THREE.Vector3, z: THREE.Vector3) => {
  const yy = y.clone().normalize(); let zz = z.clone().addScaledVector(yy, -z.dot(yy));
  if (zz.lengthSq() < 1e-8) zz = Math.abs(yy.y) < 0.9 ? V(0, 1, 0).addScaledVector(yy, -yy.y) : V(0, 0, 1);
  zz.normalize();
  return new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(V().crossVectors(yy, zz), yy, zz));
};
const rel = (p: THREE.Vector3, facing: number, x: number, y: number, z: number) => p.clone().add(V(Math.cos(facing) * x + Math.sin(facing) * z, y, -Math.sin(facing) * x + Math.cos(facing) * z));

// ------------------------------------------------------------------------------------------------- the marks F leaves
/** THE STOOL by the fire door (ELAB.stool: it stands there from the start of F; he sits on it once, on BEAT.F.sit) */
export const F_SEAT: TaSeat = { top: ELAB.stool.clone().add(V(0, STOOL.seat, 0)), floor: 0, back: 0.03, facing: ELAB.stoolFacing };
const FACE = ELAB.stoolFacing;
/** THE BOARD on his knees, its drawn face up and tilted 0.3 rad toward him, its +x edge at his RIGHT (he carries it
 *  there by that edge from its nail on the furnace face: segF), its middle; local +y runs away from him */
const BOARD_TILT = 0.3;
export const F_BOARD = (() => {
  const fwd = V(Math.sin(FACE), 0, Math.cos(FACE)), right = V(-Math.cos(FACE), 0, Math.sin(FACE));
  const z = V(0, Math.cos(BOARD_TILT), 0).addScaledVector(fwd, -Math.sin(BOARD_TILT)), y = V().crossVectors(z, right);
  return { at: rel(F_SEAT.top, FACE, 0.0, 0.17, 0.24), rot: quatYZ(y, z) };
})();
/** HIS CANDLE on the furnace top by the front corner (he sets it there in shot on BEAT.F.candle, still TALL: script v5
 *  has no lapse, the director's fallback A; the length E hands him, 0.8; lifted 2 mm off the iron plate) */
export const F_CANDLE = { at: V(ELX - 1.25, ELAB_SET.furnace.h + 0.07 + 0.002, -0.38), len: 0.8 };   // 1 cm in from the plate's edge, so he sets it from a step back (his head clear of the iron)
/** THE POKER at rest: hung by its ring on the end of the fire door's iron lintel bar (origin = the grip, +y down the
 *  rod), where his right hand reaches it from the stool */
const PK_DIR_REST = V(0, -1, 0.05).normalize();
export const F_POKER_REST = { grip: V(ELX + ELAB_SET.furnace.x1 + 0.0078, 0.83 + 0.0325, -0.713).addScaledVector(PK_DIR_REST, 0.066), dir: PK_DIR_REST, rot: quatYZ(PK_DIR_REST, V(1, 0, 0)) };
/** his head seated on the stool (measured on the solved rig: its ball's middle, which is his eye line; the 5 deg lean
 *  carries it forward of the seat) */
export const F_SEAT_EYES = V(ELX - 0.68, 1.175, -0.785);
/** HER CROUCH: as he sits she comes down to his seated eye height, level (script v5 "STEP DOWN": "level is a friend"),
 *  and stays there to the end of F (G goes on from it: on the second stroke she reaches down for the board) */
export const F_EYE_CROUCH = F_SEAT_EYES.y;
/** where she crouches: S' of camplan F (about 2.1 m from his eyes, the fire door behind him on screen left, the board
 *  on his knees below his face) */
export const F_S = V(ELX + 0.85, 0, 0.65);
/** the TWO (the step down lands on it on 火 of F06) and THE EXTREME CLOSE (the one slow push lands on it on
 *  "dressings" of F15, lens only, and holds to F's last frame): his eyes' screen point and the lens.
 *  The extreme close keeps his whole head ball inside x 160-1000 (its radius about 400 px), its hair below the REC
 *  row and the battery, his chin above y 1100 */
export const F_TWO = { sx: 620, sy: 610, fov: 60 };
export const F_XC = { sx: 585, sy: 665, fov: 33 };
const CROUCH_POS = V(F_S.x, F_EYE_CROUCH, F_S.z);
/** F's LAST CAMERA (held from "dressings" to F's last frame; G opens on it: no cut) */
export const F_END_CAM: CamPose = C.aimCam(CROUCH_POS, F_SEAT_EYES, F_XC.sx, F_XC.sy, F_XC.fov);
/** the old name (segG's comments read it): F's last camera */
export const PUSH_END: CamPose = F_END_CAM;

/** THE STOOL UNDER THE SEATED NEWTON (F, then G: one picture). His coat's skirt does not know the stool (the kit's cloth
 *  makes a bell round a sitter), and the bell's lap lies within a few mm of the seat's top: shortened to STOOL_SY of its
 *  height about its feet (its seat top 5 cm under his thighs, the feet where they were; the rig's seat, his body and the
 *  board do not move), the seat stays behind the coat on every seated frame; what shows (its legs under the hem) moves by
 *  a few mm. Pure: the props reset their scale every frame (props begin()). */
export const STOOL_SY = 0.88;
export const putStoolUnder = (w: World, at: THREE.Vector3, facing: number) => {
  const P = w.prop("stool").put(at, { rot: facing });
  P.group.scale.y *= STOOL_SY; P.group.updateMatrixWorld(true);
  return P;
};

// ------------------------------------------------------------------------------------------------- the fire F leaves
/** the fire's level (the set's `fire` param: the room's key and the figures' light), its ember bed and the grade's
 *  "late" share: roaring while Humphrey feeds it; it SINKS once he goes out for charcoal (F05 .. F07: the hours pass in
 *  the take, the director's fallback A; done before the turn, so nothing changes in the quiet stretch); low and red
 *  through the mother story; from the race ⑩ (BEAT.F.race) to its landing (BEAT.G.strike1) the firelight on his face
 *  sinks to ember red (script v5's last F row); after that it stays there (G may take over) */
export const FIRE_HIGH = 1, FIRE_LOW = 0.16, FIRE_RACE = 0.05;
export const DIE0 = BEAT.F.sackOut - 30, DIE1 = BEAT.F.quiet - 6;
export const fireF = (f: number) => {
  const d = smooth(clamp01((f - DIE0) / (DIE1 - DIE0))), r = smooth(clamp01((f - BEAT.F.race) / (BEAT.G.strike1 - BEAT.F.race)));
  return { fire: lerp(lerp(FIRE_HIGH, FIRE_LOW, d), FIRE_RACE, r), embers: d, late: d };
};

// ------------------------------------------------------------------------------------------------- the shovel
/** the blade's middle above the shovel's origin (props/things.ts: the blade box sits at y 0.56, tipped 0.25 rad) */
export const BLADE_Y = 0.56;
/** THE SHOVEL put by its blade: the blade's middle `blade` (world) and `handle` = the direction from the blade toward
 *  the T grip; the scoop's open face turned toward `up` (default the sky). -> { at, rot } for put(at, { rot, load }) */
export const shovelPut = (blade: THREE.Vector3, handle: THREE.Vector3, up = V(0, 1, 0)) => {
  const y = handle.clone().normalize().multiplyScalar(-1);
  return { at: blade.clone().addScaledVector(handle.clone().normalize(), BLADE_Y), rot: quatYZ(y, up) };
};

// ------------------------------------------------------------------------------------------------- the board
/** his charcoal's place on the board's face at time t (board units: x across, y up the drawing, metres): circles and
 *  triangles, one stroke at a time; `lift` 1 = the charcoal off the board between strokes */
export const stroke = (t: number) => {
  const T = 1.6, n = Math.floor(t / T), u = t / T - n, kind = n % 3, cx = -0.07 + 0.05 * (hash(n, 3) - 0.5), cy = 0.01 + 0.06 * (hash(n, 5) - 0.5);
  let x: number, y: number;
  if (kind === 0) { const a = u * Math.PI * 2 * 1.05; x = cx + 0.035 * Math.cos(a); y = cy + 0.03 * Math.sin(a); }
  else { const P = [[0, 0.04], [-0.04, -0.025], [0.04, -0.025], [0, 0.04]], s = Math.min(2.999, u * 3), i = Math.floor(s), e = s - i; x = cx + lerp(P[i][0], P[i + 1][0], e); y = cy + lerp(P[i][1], P[i + 1][1], e); }
  const lift = u > 0.88 ? Math.sin(Math.PI * (u - 0.88) / 0.12) : 0;
  return { x, y, lift };
};
export { BOARD, POKER };

// ------------------------------------------------------------------------------------------------- THE FIRE's own 3D sparks
/** a soft round spark (a radial falloff as a DataTexture: no canvas, so it builds headless too) */
let SPARK_TEX: THREE.DataTexture | null = null;
const sparkTex = () => {
  if (SPARK_TEX) return SPARK_TEX;
  const n = 32, d = new Uint8Array(n * n * 4);
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
    const r = Math.hypot(i + 0.5 - n / 2, j + 0.5 - n / 2) / (n / 2), a = Math.max(0, 1 - r), k = (j * n + i) * 4;
    d[k] = 255; d[k + 1] = Math.round(255 * (0.55 + 0.45 * a)); d[k + 2] = Math.round(255 * 0.35 * a * a); d[k + 3] = Math.round(255 * a * a);
  }
  SPARK_TEX = new THREE.DataTexture(d, n, n); SPARK_TEX.needsUpdate = true;
  return SPARK_TEX;
};
const SPARKS = new WeakMap<World, Map<string, THREE.Points>>();
/** THE SPARKS of a stir or a spit: `n` glowing points thrown out of the fire door's mouth `mouth` (world) on `on`, out
 *  along `out` (unit, world: the door's normal) and up, slowing, falling, dying over `len` frames; IN THE WORLD
 *  (depth-tested, additive, no ink line): they fly in front of the bricks and behind his face, never over it.
 *  `size` = a spark's world size (m), `speed` m/s, `spread` 0..1. Pure: positions from (f - on) and hash. */
export const putSparks = (w: World, key: string, f: number, on: number, mouth: THREE.Vector3, out: THREE.Vector3, o: { n?: number; len?: number; speed?: number; size?: number; spread?: number; seed?: number; stagger?: number; up?: number } = {}) => {
  const N = o.n ?? 20, len = o.len ?? 18, stag = o.stagger ?? 3, d = f - on;
  let m = SPARKS.get(w); if (!m) { m = new Map(); SPARKS.set(w, m); }
  let P = m.get(key);
  if (!P) {
    if (d < 0 || d > len + stag + 2) return;
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(new Float32Array(N * 3), 3));
    g.setAttribute("color", new THREE.Float32BufferAttribute(new Float32Array(N * 3), 3));
    const mat = new THREE.PointsMaterial({ map: sparkTex(), size: o.size ?? 0.035, sizeAttenuation: true, vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, depthTest: true, fog: false });
    P = new THREE.Points(g, mat); P.name = `segF.sparks.${key}`; P.layers.set(NOINK); P.frustumCulled = false; P.renderOrder = 6;
    w.root.add(P); m.set(key, P);
  }
  const live = d >= 0 && d <= len + stag + 2;
  P.visible = live;
  if (!live) return;
  const pos = P.geometry.getAttribute("position") as THREE.BufferAttribute, col = P.geometry.getAttribute("color") as THREE.BufferAttribute;
  const side = V().crossVectors(out, V(0, 1, 0)).normalize(), sd = o.seed ?? 0, sp = o.spread ?? 0.5;
  for (let i = 0; i < N; i++) {
    const life = len * (0.5 + 0.5 * hash(i, 13 + sd)), age = (d - stag * hash(i, 17 + sd)) / FPS, u = (age * FPS) / life;
    if (age < 0 || u > 1) { pos.setXYZ(i, mouth.x, mouth.y, mouth.z); col.setXYZ(i, 0, 0, 0); continue; }
    const v = (o.speed ?? 1.6) * (0.5 + 0.7 * hash(i, 19 + sd));
    const dir = out.clone().multiplyScalar(0.55 + 0.3 * hash(i, 23 + sd)).addScaledVector(side, (hash(i, 29 + sd) - 0.5) * 2 * sp).add(V(0, (o.up ?? 0.9) * (0.6 + 0.6 * hash(i, 31 + sd)), 0)).normalize();
    const drag = (1 - Math.exp(-2.2 * age)) / 2.2;                         // the air slows them
    const p = mouth.clone().addScaledVector(side, (hash(i, 37 + sd) - 0.5) * 0.2).add(V(0, (hash(i, 41 + sd) - 0.5) * 0.12, 0)).addScaledVector(dir, v * drag);
    p.y -= 0.9 * age * age;                                                   // and they fall a little
    pos.setXYZ(i, p.x, p.y, p.z);
    const b = (1 - easeOutCubic(u)) * (0.75 + 0.25 * Math.sin(age * 40 + i));
    col.setXYZ(i, b, b, b);
  }
  pos.needsUpdate = true; col.needsUpdate = true;
};
/** hides every spark burst (segment F's exit) */
export const sparksOff = (w: World) => { const m = SPARKS.get(w); if (m) for (const P of m.values()) P.visible = false; };

// ------------------------------------------------------------------------------------------------- THE FIRE's own flare
const FLARE = new WeakMap<World, { door: THREE.Mesh; floor: THREE.Mesh }>();
/** THE FLARE of a spit (or a stir): warm light swelling IN the fire door's mouth and on the bricks round it and the floor
 *  before it, as the flames leap: two additive glow cards in the world (depth-tested: his head in front of the door
 *  hides them; no ink line), `k` 0..1. Built once per World on first use. The room's light rises a little too, through
 *  the set's fire param (SPIT_ROOM in segF): the light on his face is the set's own figure light. */
export const putFlare = (w: World, mouth: THREE.Vector3, k: number) => {
  let c = FLARE.get(w);
  if (!c) {
    if (k <= 0.005) return;
    const door = glowCard(0.42, "#ff9a3c", 0), floor = glowCard(0.6, "#ff8a30", 0);
    door.name = "segF.flare.door"; floor.name = "segF.flare.floor";
    door.rotation.y = Math.PI / 2; floor.rotation.x = -Math.PI / 2;
    w.root.add(door); w.root.add(floor); c = { door, floor }; FLARE.set(w, c);
  }
  const on = k > 0.005;
  c.door.visible = on; c.floor.visible = on;
  if (!on) return;
  c.door.position.copy(mouth).add(V(0.012, 0, 0));
  c.floor.position.set(mouth.x + 0.38, 0.004, mouth.z);
  (c.door.material as THREE.MeshBasicMaterial).opacity = Math.min(1, 0.9 * k);
  (c.floor.material as THREE.MeshBasicMaterial).opacity = Math.min(1, 0.45 * k);
};
export const flareOff = (w: World) => { const c = FLARE.get(w); if (c) { c.door.visible = false; c.floor.visible = false; } };

// ------------------------------------------------------------------------------------------------- the candle's light
/** a flat rectangle lit by the candle: corner `a`, edges `u` and `v` (world vectors), `nu` x `nv` segments; `n` = its
 *  normal for a Lambert term (omit: none), `fade` = the light falls off linearly along v (full at the a + v edge, 0 at
 *  the `a` edge), `gain` = its strength */
export type LitQuad = { a: THREE.Vector3; u: THREE.Vector3; v: THREE.Vector3; nu: number; nv: number; gain: number; n?: THREE.Vector3; fade?: boolean };
const CL_R0 = 0.07, CL_KNEE = 0.22, CL_REACH = 0.45;
const clFall = (d: number) => (1 / (1 + (d / CL_R0) * (d / CL_R0))) * (1 - smooth(clamp01((d - CL_KNEE) / (CL_REACH - CL_KNEE))));
const CL_COL = new THREE.Color(1.0, 0.56, 0.24);
const litQuadGeo = (q: LitQuad, L: THREE.Vector3) => {
  const pos: number[] = [], col: number[] = [], idx: number[] = [];
  const p = V(), d = V();
  for (let j = 0; j <= q.nv; j++) for (let i = 0; i <= q.nu; i++) {
    p.copy(q.a).addScaledVector(q.u, i / q.nu).addScaledVector(q.v, j / q.nv);
    d.copy(L).sub(p); const r = d.length();
    let c = q.gain * clFall(r);
    if (q.n) c *= Math.max(0, q.n.dot(d) / Math.max(r, 1e-6));
    if (q.fade) c *= j / q.nv;
    pos.push(p.x, p.y, p.z); col.push(CL_COL.r * c, CL_COL.g * c, CL_COL.b * c);
  }
  for (let j = 0; j < q.nv; j++) for (let i = 0; i < q.nu; i++) {
    const k = j * (q.nu + 1) + i;
    idx.push(k, k + 1, k + q.nu + 1, k + 1, k + q.nu + 2, k + q.nu + 1);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3)); g.setIndex(idx);
  return g;
};
const CLIGHT = new WeakMap<World, { g: THREE.Group; m: THREE.MeshBasicMaterial }>();
/** THE CANDLE'S LIGHT ON WHAT IT STANDS ON (review v2 row 11): the furnace's iron top plate, which the room's light
 *  alone leaves a featureless near-black slab once the fire has sunk. Warm light ADDED on the quads (the pool round the
 *  candlestick, the plate's edges, the faces that look at the flame), each vertex lit from `flame` with the candle's soft
 *  falloff. Additive, unlit, no ink line, never written to depth. Built once per World; `k` = its strength (0 hides). */
export const putCandleLight = (w: World, flame: THREE.Vector3, quads: LitQuad[], k: number) => {
  let c = CLIGHT.get(w);
  if (!c) {
    if (k <= 0) return;
    const g = new THREE.Group(); g.name = "segF.candleLight";
    const m = new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false, side: THREE.DoubleSide });
    for (const q of quads) { const me = new THREE.Mesh(litQuadGeo(q, flame), m); me.layers.set(NOINK); me.castShadow = false; me.receiveShadow = false; me.renderOrder = 4; g.add(me); }
    w.root.add(g); c = { g, m }; CLIGHT.set(w, c);
  }
  c.g.visible = k > 0;
  c.m.color.setScalar(Math.max(0, k));
};
/** hides the candle's light (segment F's exit) */
export const candleLightOff = (w: World) => { const c = CLIGHT.get(w); if (c) c.g.visible = false; };

// ------------------------------------------------------------------------------------------------- the grades
/** a COPY of Film.tsx GRADE_FILM (the default every place uses; kept here so F never imports the composition) */
export const GRADE_BASE: GradeParams = { ky: [0, 0.1, 0.27, 0.58, 0.82, 0.935, 1], sat: [0.97, 0.98, 0.96], tintS: [0.006, 0.006], tintM: [-0.01, 0.008], tintH: [-0.016, 0.01], vig: [0.16, 0.42] };
/** the night garden: the moonlit day colours pulled toward a desaturated blue, the highlights (his candle, the lit
 *  window, the door's glow) left warm; the same curve, so the same mid-tone */
export const GRADE_NIGHT: GradeParams = { ky: [0, 0.1, 0.27, 0.58, 0.82, 0.935, 1], sat: [0.46, 0.55, 1.0], tintS: [0.04, -0.022], tintM: [0.03, -0.018], tintH: [-0.018, 0.022], vig: [0.22, 0.4] };
/** the fire sunk, hours on: the room sunk round him (the low end pressed, a heavier vignette), the face's highlights kept */
export const GRADE_LATE: GradeParams = { ky: [0, 0.075, 0.215, 0.52, 0.79, 0.93, 1], sat: [0.94, 0.98, 0.98], tintS: [0.004, 0.012], tintM: [-0.012, 0.01], tintH: [-0.016, 0.01], vig: [0.38, 0.28] };
/** two grades mixed (k 0..1) */
export const mixGrade = (a: GradeParams, b: GradeParams, k: number): GradeParams => {
  const L = (x: number, y: number) => x + (y - x) * k;
  return { ky: a.ky.map((v, i) => L(v, b.ky[i])), sat: [L(a.sat[0], b.sat[0]), L(a.sat[1], b.sat[1]), L(a.sat[2], b.sat[2])], tintS: [L(a.tintS[0], b.tintS[0]), L(a.tintS[1], b.tintS[1])],
    tintM: [L(a.tintM[0], b.tintM[0]), L(a.tintM[1], b.tintM[1])], tintH: [L(a.tintH[0], b.tintH[0]), L(a.tintH[1], b.tintH[1])], vig: [L(a.vig[0], b.vig[0]), L(a.vig[1], b.vig[1])] };
};
