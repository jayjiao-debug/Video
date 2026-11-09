// Friends film cast: drawn stick-figure cards (kit/toon.ts) placed in the PBR sets as lit, yaw-only billboards.
// Lean rewrite of vasa/cast.ts + vasa/cardshade.ts for this film (those depend on the Vasa story, so the pieces are
// copied here: the canvas Pool, the card shading, the multiply contact blob, the blink timing).
//
// =====================================================================================================================
// API
// =====================================================================================================================
// Scale: metres, floor y = 0 (pass `floor` otherwise). Figures are 1.45 m (toon.SU = 1.45 / 780 m per design unit).
// Yaw convention: `facing` = the world direction the person faces, as a yaw: 0 = +z, PI/2 = +x (atan2(dx, dz)).
//
//   const cast = new Cast(parent, { renderHeight: 1920, light: LIGHT_DORM });   // one per scene (owns the canvas Pool)
//   const you = cast.add(YOU);                 // Look -> Figure (YOU, ROOMMATE, RESEARCHER, classmate(i), friend(i))
//   per frame (pure functions of the frame time):
//     you.set({ at, facing, pose: { kind: "hold", t, grip: false }, aimAt: [ropeTargetA, ropeTargetB], expr: "smug", blink: lidAt(t, 7) });
//     cast.update(camera);                     // solves every pose, draws / reuses canvases, places cards, blobs, fx
//     you.handWorld(1) / ankleWorld(i) / headWorld() / hipWorld() / shoulderWorld(i)   -> THREE.Vector3 (world)
//                                              // the exact END of the drawn stick limb in this frame: attach ropes here
//
//   FigState (Figure.set):
//     at        root, world: floor point under the feet (standing), floor point under the hip (seated; or use `seat`),
//               support point under the hip on the mattress / floor (bed and lying poses; or use `bed`)
//     facing    yaw the person faces (lying poses: the yaw from the hip toward the HEAD; the card lies in that plane)
//     pose      PoseReq (toon.ts): kind + t (seconds) / phase / aim / grip / amount / target / base / props / card ...
//               kinds: idle walk jog desk write cardUp curl hold haul throw wave point dust lookDown reach dragged sitUp phone
//     seat      { top: seat-surface centre (world), back?: m the hip sits behind the seat centre (default .03),
//                 deskEdge?: m from the seat centre to the desk's near edge along `facing`, deskTop?: desk-top height,
//                 front?: m from the seat centre to its front edge (default .2) }
//               -> sets at, pose.seat, pose.desk (forearms rest ON the desk top, the torso stays behind its edge).
//               Seen from the front the card moves to the seat's front edge (+ .2 x sin(turn) when turned toward the
//               camera, so the lap stays in front of the seat slab; at a desk: 2.5 cm behind the desk's near
//               edge, so the forearms sit on the real desk top from any camera height); from the side / back it stands
//               through the hip (the backrest hides the lower back).
//     bed       { top: mattress point under the hip (world) } -> at, pose.base = "bed" for phone / reach / lookDown
//     aimAt     [arm0, arm1] world targets for hold / haul / point / curl / dragged (arm 1 = the leg for dragged): converted
//               to on-card directions, reach (foreshortening) and behind-the-torso per arm every frame
//     expr, blink, look, lookUp, faceTurn (-1 / 0 / 1: front-view 3/4 turn of the face)
//               props: [HeldProp, HeldProp] ("clipboard" | "card" | "phone" | "pen" | null) per hand; card: text on a card
//     view      force "front" | "side" | "back" (default: from the camera vs facing; side drawings face canvas right and
//               mirror so the card's own +x points along `facing`)
//     clampYaw  seated cards keep their yaw within this many radians of the view's axis (default .5) so a card never
//               swings into the desk or the chair back; the drawing is chosen for the closest axis. Lying / bed cards:
//               how far (default .45) the card may turn from the body's vertical plane toward the camera
//     fx        [{ kind: "?" | "!" | "sweat" | "huff" | "dust" | "zzz", t: seconds since it popped }]
//     scale     pop-in scale (1 = normal);  visible;  dim (0..1 card brightness, e.g. inside a dark bunk)
//     blob      false = no contact blob
//
//   Light: cast.light = LIGHT_DORM / LIGHT_DORM_NIGHT / LIGHT_CLASS or your own CastLight { key (world dir TOWARD the
//   key light), tint, tintK, gain, grad, bodyGrad, sideTint }: the card copy of cardShade (scene tint normalised to keep
//   the face value, soft side gradient toward the key on head and body, painted crescent in the drawing).
//
//   Crowd (84 seated classmates, cheap):
//     const crowd = cast.crowd(seats, looks, { near: 3.2 });   seats: CrowdSeat[] { top, facing, deskEdge?, deskTop?, back? }
//     crowd.state = (i, t) => ({ pose: { kind: "write", t }, expr: "smug", blink: lidAt(t, i), visible: true, scale: 1 });
//     cast.update(camera, t)    // crowd needs t
//     Cards farther than `near` are ONE InstancedMesh per 2048 px atlas page (48 cells / page, one cell per classmate,
//     redrawn only when that person's drawing changes); nearer ones become normal pooled Figures (full resolution).
//     crowd.handWorld(i, arm) for ropes from a classmate; crowd.figure(i) -> the promoted Figure or null; crowd.redrawn.
//     classroom.ts anchors: its `facing` is the yaw of -z, so pass facing: seat.facing + PI, top: seat.pos (hip point),
//     back: 0, deskTop: .75, deskEdge: hip -> desk near edge (see preview/cast_classcommon.ts).
//
//   Helpers: lidAt(t, id, swaps?) blink lid 0..1 (2.2-4.4 s gaps, 4-frame blinks, a blink across expression swaps);
//            walkPhase(dist) / jogPhase(dist) (feet planted for a body that moved dist metres);
//            cardClearance(fig, boxes, grid = 48) -> { hits, worst (m), at } 穿模 check of the card's opaque pixels
//            against world boxes (after cast.update). With the dorm, pass D.colliders' boxes (preview/cast_dormcommon.ts
//            clearance() splits "support" = seat / bedding contact from "solid" hits). Hand points follow the card's yaw,
//            i.e. the camera: re-solve aimAt and re-check ropes per frame in a moving shot.
//
//   Two-person rope (hand to hand), solved in two passes so each aim sees the other's real hand:
//     a.set({... aimAt: [null, roughChestB] }); b.set({... aimAt: [roughChestA, null] }); cast.update(cam);
//     for (let n = 0; n < 2; n++) { a.set({... aimAt: [null, b.handWorld(0)] }); b.set({... aimAt: [a.handWorld(1), null] }); cast.update(cam); }
//     rope(a.handWorld(1), b.handWorld(0));
//   Which arm: front / back views: arm 0 = canvas-LEFT hand, 1 = canvas-right (pick the arm on the target's side of the
//   screen); side views: 1 = near arm. Lying (curl / dragged): arm 1 = near arm; dragged: aimAt[1] = the pulled ankle.
//
//   Placement recipes checked on the dorm v2 set (preview/cast_dormcommon.ts: card pixels at most 0.6 cm into a solid
//   collider box, 1 cm into bedding, ropes clear of D.colliders except bedding the rope lies on):
//     you mid-floor:     at anchors.you, facing toward the camera, pose hold, aimAt both friends' hands.
//     desk 2's chair:    seat { top: anchors.desk2 at y .51, front .26 }, facing .3 (the backrest is on the aisle side:
//                        turned further toward the aisle the knees reach its corner). cams.wide: the tote on bunk 1's post
//                        overlaps the left of her head; cams.hookEnd clears the face.
//     bunk 4 (top):      bed { top: (1.06, 1.775, -1.25) }, facing PI (head toward the window end = the ladder gap, no
//                        rail bar across the face), curl amount .35, clampYaw .45, aimAt[1] ~ (.7, 2.06, -.9): the only
//                        top-bunk head cams.wide / hookEnd can see (bunk 2's curtain and bunk 3's rail hide the others).
//     your bunk (11-16): bed { top: anchors.youBunk.top }, facing youBunk.facing, curl amount .2, blanket "#ffd666" (the
//                        duvet's yellow; a tight curl draws a tall mound), clampYaw .3; a rope leaves between the mattress
//                        top (1.775) and the lower rail bar (1.95): aim the near arm at (-.8, 1.87, z) just outside it.
//                        The set's cams.bunk crops the head at the right edge: look ~(-1.3, 1.84, .5).
//     Avoid: the set's desk4Chair perch (it faces the aisle = into the office chair's backrest) and lying cards seen along
//     the bunk's length (end-on cams flatten them; the card turns at most clampYaw toward the camera).
//
// Determinism: nothing reads wall time; the pool redraws a canvas only from (look, solved pose, face, light) keys.
// Layers: cards, blobs and fx are on NOINK (the world ink pass does not outline them); enable NOINK on the camera.
import * as THREE from "three";
import {
  Pen, Look, PoseReq, View, Solved, FaceOpts, Expr, poseFig, paintFig, VIEWS, SEATED, LYING, SU, FRAMES, Frame, fxPop, popScale, fxContact,
  dimsOf, YOU, ROOMMATE, RESEARCHER, classmate, friend,
} from "./toon";
import { NOINK } from "../../vasa/ink";

export { YOU, ROOMMATE, RESEARCHER, classmate, friend, SU };
export const FPS = 30;

// ---------------- canvas pool (vasa/cast.ts) ----------------
type Entry = { cv: HTMLCanvasElement; tex: THREE.CanvasTexture; w: number; h: number };
export type Req = { key: string; w: number; h: number; k: number; draw: (p: Pen) => void; tex?: THREE.CanvasTexture };
const makeEntry = (w: number, h: number): Entry => {
  const cv = document.createElement("canvas");
  cv.width = w; cv.height = h;
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  return { cv, tex, w, h };
};
export class Pool {
  private live = new Map<string, Entry>();
  private free: Entry[] = [];
  private reqs: Req[] = [];
  /** canvases drawn since construction (perf counter) */
  drawn = 0;
  req(key: string, w: number, h: number, k: number, draw: (p: Pen) => void) {
    const r: Req = { key: `${w}x${h}|${key}`, w, h, k, draw };
    this.reqs.push(r);
    return r;
  }
  flush() {
    const want = new Map<string, Req[]>();
    for (const r of this.reqs) { const l = want.get(r.key); if (l) l.push(r); else want.set(r.key, [r]); }
    for (const [key, e] of this.live) if (!want.has(key)) { this.live.delete(key); this.free.push(e); }
    for (const [key, rs] of want) {
      let e = this.live.get(key);
      if (!e) {
        const r = rs[0], i = this.free.findIndex((x) => x.w === r.w && x.h === r.h);
        e = i >= 0 ? this.free.splice(i, 1)[0] : makeEntry(r.w, r.h);
        const g = e.cv.getContext("2d")!;
        g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, e.w, e.h); g.setTransform(r.k, 0, 0, r.k, 0, 0);
        r.draw(new Pen(g)); this.drawn++;
        e.tex.needsUpdate = true;
        this.live.set(key, e);
      }
      for (const r of rs) r.tex = e.tex;
    }
    this.reqs = [];
    // keep a few free canvases for reuse, drop the rest (memory)
    while (this.free.length > 8) { const e = this.free.shift()!; e.tex.dispose(); e.cv.width = e.cv.height = 1; }
  }
}

// ---------------- light + card shading (vasa/cardshade.ts, adapted) ----------------
export type CastLight = {
  /** world direction TOWARD the key light (side gradient + painted crescent side) */
  key: [number, number, number];
  /** scene light colour on the cards (normalised to keep the face value), share of it, overall gain */
  tint: [number, number, number]; tintK: number; gain: number;
  /** side-gradient strength on the head / body, colour of the far side */
  grad: number; bodyGrad: number; sideTint: [number, number, number];
};
/** dorm, ceiling battens on (evening): warm overhead key slightly from the door end */
export const LIGHT_DORM: CastLight = { key: [0.35, 1, 0.55], tint: [1, 0.9, 0.78], tintK: 0.55, gain: 0.97, grad: 0.2, bodyGrad: 0.16, sideTint: [0.93, 0.9, 0.98] };
/** dorm, lamps only (night): warmer, dimmer, more side modelling from the desk lamps */
export const LIGHT_DORM_NIGHT: CastLight = { key: [0.8, 0.6, 0.2], tint: [1, 0.82, 0.62], tintK: 0.6, gain: 0.78, grad: 0.3, bodyGrad: 0.22, sideTint: [0.85, 0.85, 1.0] };
/** classroom (low afternoon sun from the window side, sets/classroom CLASSROOM_SUN.dir) */
export const LIGHT_CLASS: CastLight = { key: [-0.803, 0.375, 0.464], tint: [1, 0.96, 0.92], tintK: 0.5, gain: 1.0, grad: 0.22, bodyGrad: 0.16, sideTint: [0.93, 0.92, 0.99] };

const U = {
  uKey: { value: new THREE.Vector3(0, 1, 0) }, uTint: { value: new THREE.Vector3(1, 1, 1) }, uTintK: { value: 0.5 }, uNorm: { value: 0.7 },
  uGain: { value: 1 }, uGrad: { value: 0.2 }, uBodyGrad: { value: 0.16 }, uSideTint: { value: new THREE.Vector3(0.93, 0.9, 0.98) },
};
const setLight = (L: CastLight) => {
  U.uKey.value.set(...L.key).normalize(); U.uTint.value.set(...L.tint); U.uTintK.value = L.tintK; U.uGain.value = L.gain;
  U.uGrad.value = L.grad; U.uBodyGrad.value = L.bodyGrad; U.uSideTint.value.set(...L.sideTint);
};
/** card shading in the fragment shader. vCard = card uv (0..1), vHead = (u, v, r in v units), vBody = (u, half width u),
 *  vDim = brightness. Same recipe as cardShade: tint normalised by its luminance, far-side gradient + lavender tint,
 *  a slight lift on the lit edge; the drawing itself carries the painted crescent and the thick-thin outline. */
const CARD_GLSL = /* glsl */ `
vec3 tintK = mix( vec3( 1.0 ), uTint, uTintK );
tintK /= pow( max( dot( tintK, vec3( 0.2126, 0.7152, 0.0722 ) ), 0.2 ), uNorm );
vec3 outgoingLight = diffuseColor.rgb * tintK;
{
  vec3 keyV = normalize( ( viewMatrix * vec4( uKey, 0.0 ) ).xyz );
  float side = sign( keyV.x ) * smoothstep( 0.0, 0.35, abs( keyV.x ) );
  vec2 pc = vec2( vCard.x * vAspect, vCard.y ), hc = vec2( vHead.x * vAspect, vHead.y );
  float head = 1.0 - smoothstep( 0.9, 1.1, length( pc - hc ) / vHead.z );
  float scr = sign( dFdx( vCard.x ) + 1e-7 );
  float uu = mix( clamp( ( vCard.x - vBody.x ) / vBody.y, -1.0, 1.0 ), clamp( ( pc.x - hc.x ) / vHead.z, -1.0, 1.0 ), head ) * scr;
  float t = uu * side;
  float g = mix( uBodyGrad, uGrad, head );
  float dark = smoothstep( -0.15, 0.9, -t );
  vec3 sideK = mix( vec3( 1.0 ), uSideTint, dark * 0.5 );
  float lift = 1.0 + 0.04 * smoothstep( 0.0, 0.9, t );
  outgoingLight *= ( 1.0 - g * dark ) * sideK * lift * uGain * vDim;
}
`;
const DECL_F = "#include <common>\nuniform vec3 uKey; uniform vec3 uTint; uniform float uTintK; uniform float uNorm; uniform float uGain; uniform float uGrad; uniform float uBodyGrad; uniform vec3 uSideTint;\nvarying vec2 vCard; varying vec3 vHead; varying vec2 vBody; varying float vDim; varying float vAspect;";
/** single card: zones as uniforms */
const figMaterial = () => {
  const m = new THREE.MeshBasicMaterial({ map: blank, alphaTest: 0.5, side: THREE.DoubleSide });
  const zone = { uHead: { value: new THREE.Vector3(0.5, 0.7, 0.12) }, uBody: { value: new THREE.Vector2(0.5, 0.15) }, uDim: { value: 1 }, uAspect: { value: 0.76 } };
  m.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, U, zone);
    sh.vertexShader = sh.vertexShader.replace("#include <common>", "#include <common>\nuniform vec3 uHead; uniform vec2 uBody; uniform float uDim; uniform float uAspect;\nvarying vec2 vCard; varying vec3 vHead; varying vec2 vBody; varying float vDim; varying float vAspect;")
      .replace("#include <uv_vertex>", "#include <uv_vertex>\nvCard = uv; vHead = uHead; vBody = uBody; vDim = uDim; vAspect = uAspect;");
    sh.fragmentShader = sh.fragmentShader.replace("#include <common>", DECL_F).replace("vec3 outgoingLight = reflectedLight.indirectDiffuse;", CARD_GLSL);
  };
  m.customProgramCacheKey = () => "figcard1";
  return { m, zone };
};
/** instanced atlas card: per-instance cell rect + zones */
const crowdMaterial = (map: THREE.Texture) => {
  const m = new THREE.MeshBasicMaterial({ map, alphaTest: 0.5, side: THREE.DoubleSide });
  m.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, U);
    sh.vertexShader = sh.vertexShader.replace("#include <common>", "#include <common>\nattribute vec4 aCell; attribute vec3 aHead; attribute vec2 aBody; attribute float aDim; uniform float uAspect;\nvarying vec2 vCard; varying vec3 vHead; varying vec2 vBody; varying float vDim; varying float vAspect;")
      .replace("#include <uv_vertex>", "#include <uv_vertex>\nvCard = uv; vHead = aHead; vBody = aBody; vDim = aDim; vAspect = " + (760 / 1000).toFixed(4) + ";\n#ifdef USE_MAP\nvMapUv = aCell.xy + uv * aCell.zw;\n#endif");
    sh.fragmentShader = sh.fragmentShader.replace("#include <common>", DECL_F).replace("vec3 outgoingLight = reflectedLight.indirectDiffuse;", CARD_GLSL);
  };
  m.customProgramCacheKey = () => "figcrowd1";
  return m;
};
/** ground contact blob: multiplies what is already drawn (vasa/cardshade.ts blobMaterial) */
const blobMaterial = (map: THREE.Texture) => new THREE.MeshBasicMaterial({
  map, transparent: false, depthWrite: false, fog: false, toneMapped: false,
  blending: THREE.CustomBlending, blendEquation: THREE.AddEquation, blendSrc: THREE.ZeroFactor, blendDst: THREE.SrcColorFactor,
  polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2, side: THREE.DoubleSide,
});
const blank = (() => { const c = document.createElement("canvas"); c.width = c.height = 2; return new THREE.CanvasTexture(c); })();
const BLOB_TEX = (() => {
  const c = document.createElement("canvas"); c.width = c.height = 128;
  fxContact(new Pen(c.getContext("2d")!), "#6f6070");
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.generateMipmaps = false; t.minFilter = THREE.LinearFilter; return t;
})();
const FLAT = (() => { const g = new THREE.PlaneGeometry(1, 1); g.rotateX(-Math.PI / 2); return g; })();
const QUAD = new THREE.PlaneGeometry(1, 1);
const GEO = new Map<string, THREE.BufferGeometry>();
/** card geometry for a frame: the frame's root (ox, oy) sits at the mesh origin */
export const frameGeo = (f: Frame) => {
  let g = GEO.get(f.name);
  if (!g) { g = new THREE.PlaneGeometry(f.w * SU, f.h * SU); g.translate((f.w / 2 - f.ox) * SU, (f.oy - f.h / 2) * SU, 0); GEO.set(f.name, g); }
  return g;
};

// ---------------- timing helpers ----------------
const hh = (i: number, s = 0) => { const v = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return v - Math.floor(v); };
const LID = [0.5, 1, 1, 0.5];
/** eyelid 0 open .. 1 shut for character id at time t: 4-frame blinks 2.2-4.4 s apart, and one across every
 *  expression swap time in `swaps` (the shut frames hide the swap) */
export const lidAt = (t: number, id: number, swaps: number[] = []) => {
  const f = Math.round(t * FPS);
  for (const ts of swaps) { const k = f - Math.round((ts - 2 / FPS) * FPS) + 1; if (k >= 0 && k < 4) return LID[k]; }
  let s = Math.round(-60 * hh(id, 9));
  for (let n = 0; s <= f && n < 600; n++) {
    const k = f - s;
    if (k >= 0 && k < 4) return LID[k];
    s += Math.round(66 + 66 * hh(id * 31 + n, 13));
  }
  return 0;
};
import { WALK_CYCLE_M, JOG_CYCLE_M } from "./toon";
export const walkPhase = (dist: number) => ((dist / WALK_CYCLE_M) % 1 + 1) % 1;
export const jogPhase = (dist: number) => ((dist / JOG_CYCLE_M) % 1 + 1) % 1;

// ---------------- view selection ----------------
const tmpV = new THREE.Vector3(), tmpW = new THREE.Vector3(), camR = new THREE.Vector3(), camP = new THREE.Vector3();
const q = (v: number, n = 1) => Math.round(v * n) / n;
const wrap = (a: number) => Math.atan2(Math.sin(a), Math.cos(a));
type ViewPick = { view: View; mirror: boolean; yaw: number };
/** the drawing (front / side / back, mirrored) and card yaw for someone at `at` facing `facing`, seen from cam */
const pickView = (camPos: THREE.Vector3, camRight: THREE.Vector3, at: THREE.Vector3, facing: number, kind: PoseReq["kind"], seated: boolean, clampYaw: number, force?: View, atDesk = false): ViewPick => {
  const toCam = Math.atan2(camPos.x - at.x, camPos.z - at.z), rel = wrap(toCam - facing), a = Math.abs(rel);
  const fx = Math.sin(facing), fz = Math.cos(facing);
  const views = VIEWS[kind];
  let view: View = force ?? (a < rad(50) ? "front" : a > rad(130) ? "back" : "side");
  if (!views.includes(view)) {
    // closest supported: side <-> front/back by angle
    view = views.includes("side") && view !== "side" ? (views.includes(a < rad(90) ? "front" : "back") ? (a < rad(90) ? "front" : "back") : "side") : views[0];
    if (!views.includes(view)) view = views[0];
  }
  let yaw = toCam;
  if (seated) {
    const axis = view === "front" ? facing : view === "back" ? facing + Math.PI : facing + Math.sign(rel || 1) * Math.PI / 2;
    // at a desk, a front card stands just behind the desk edge: keep it parallel to the edge (a turned card would
    // swing its arms into the desk top)
    const lim = atDesk && view === "front" ? Math.min(clampYaw, 0.1) : clampYaw;
    yaw = axis + Math.max(-lim, Math.min(lim, wrap(toCam - axis)));
  }
  // side drawings face canvas right: mirror when the card's own +x (cos yaw, 0, -sin yaw) points away from `facing`.
  // (Testing the camera's right vector instead flipped off-centre seated cards in wide shots: classmates faced the
  // back of the room with their forearms through the chair back. camRight is kept for the near-tie case only.)
  const dRight = Math.cos(yaw) * fx - Math.sin(yaw) * fz;
  const mirror = view === "side" ? (Math.abs(dRight) > 1e-3 ? dRight < 0 : fx * camRight.x + fz * camRight.z < 0) : false;
  return { view, mirror, yaw };
};
const rad = (d: number) => (d * Math.PI) / 180;

// ---------------- Figure ----------------
export type FxKind = "?" | "!" | "sweat" | "huff" | "dust" | "zzz";
export type FigState = {
  at?: THREE.Vector3; facing?: number; pose: PoseReq;
  seat?: { top: THREE.Vector3; back?: number; deskEdge?: number; deskTop?: number; front?: number };
  bed?: { top: THREE.Vector3 };
  aimAt?: [THREE.Vector3 | null, THREE.Vector3 | null];
  expr?: Expr; blink?: number; look?: number; lookUp?: number; faceTurn?: -1 | 0 | 1;
  view?: View; clampYaw?: number; fx?: { kind: FxKind; t: number }[]; scale?: number; visible?: boolean; dim?: number; blob?: boolean;
  floor?: number;
};
type FxSlot = { mesh: THREE.Mesh; mat: THREE.MeshBasicMaterial; r: Req | null };
let LOOK_ID = 0;
const lookKey = new WeakMap<Look, string>();
const keyOfLook = (L: Look) => { let k = lookKey.get(L); if (!k) { k = `L${LOOK_ID++}:${JSON.stringify(L).length}`; lookKey.set(L, k); } return k; };
/** compact cache key of a solved pose (joints rounded to a design unit) */
export const solvedKey = (sv: Solved) => {
  const r = (p: [number, number]) => `${Math.round(p[0])},${Math.round(p[1])}`;
  return [sv.view, sv.frame.name, q(sv.roll, 100), r(sv.hip), q(sv.lean, 2), q(sv.headTilt, 2), q(sv.breathe, 2), q(sv.torsoBot), sv.seated ? 1 : 0,
    ...sv.arms.map((a) => `${r(a.s)}|${r(a.e)}|${r(a.h)}|${a.front ? 1 : 0}`), ...sv.legs.map((l) => `${r(l.h)}|${r(l.k)}|${r(l.a)}|${q(l.pitch, 20)}|${l.shin ? 1 : 0}`),
    ...sv.props.map((p) => `${p.kind}${p.hand}${p.face}${q(p.ang, 20)}${p.text ?? ""}`), q(sv.lookUp, 20), q(sv.look, 20), sv.facing, sv.blanket ?? ""].join(";");
};

export class Figure {
  look: Look; mesh: THREE.Mesh; blob: THREE.Mesh; st: FigState = { pose: { kind: "idle" } };
  sv: Solved | null = null; mirror = false; r: Req | null = null;
  private zone: { uHead: { value: THREE.Vector3 }; uBody: { value: THREE.Vector2 }; uDim: { value: number }; uAspect: { value: number } };
  private mat: THREE.MeshBasicMaterial; private fxs: FxSlot[] = []; private parent: THREE.Object3D;
  constructor(parent: THREE.Object3D, look: Look) {
    this.look = look; this.parent = parent;
    const { m, zone } = figMaterial(); this.mat = m; this.zone = zone;
    this.mesh = new THREE.Mesh(frameGeo(FRAMES.stand), m);
    this.mesh.renderOrder = 1; this.mesh.layers.set(NOINK); this.mesh.visible = false; this.mesh.frustumCulled = false;
    this.mesh.onBeforeRender = () => {};
    this.blob = new THREE.Mesh(FLAT, blobMaterial(BLOB_TEX)); this.blob.renderOrder = 0.5; this.blob.layers.set(NOINK); this.blob.visible = false;
    parent.add(this.mesh, this.blob);
  }
  set(s: FigState) { this.st = s; return this; }
  /** frame-unit point of the current drawing -> world */
  cardToWorld(p: [number, number], out = new THREE.Vector3()) {
    const f = this.sv!.frame;
    return this.mesh.localToWorld(out.set((p[0] - f.ox) * SU, (f.oy - p[1]) * SU, 0));
  }
  handWorld(i: 0 | 1, out?: THREE.Vector3) { return this.cardToWorld(this.sv!.out.hand[i], out); }
  ankleWorld(i: 0 | 1, out?: THREE.Vector3) { return this.cardToWorld(this.sv!.out.ankle[i], out); }
  headWorld(out?: THREE.Vector3) { return this.cardToWorld(this.sv!.out.head, out); }
  hipWorld(out?: THREE.Vector3) { return this.cardToWorld(this.sv!.out.hip, out); }
  shoulderWorld(i: 0 | 1, out?: THREE.Vector3) { return this.cardToWorld(this.sv!.out.shoulder[i], out); }
  /** world radius of the head (for fx placement / eyelines) */
  get headR() { return (this.sv?.out.headR ?? 110) * SU; }

  /** solve, place, request the canvas (Cast.update calls this, then flushes the pool and binds) */
  _update(cam: THREE.PerspectiveCamera, pool: Pool, renderH: number, light: CastLight) {
    const s = this.st, L = this.look, floor = s.floor ?? 0;
    if (s.visible === false) { this.mesh.visible = false; this.blob.visible = false; this.r = null; for (const f of this.fxs) f.mesh.visible = false; return; }
    const pose: PoseReq = { ...s.pose };
    let facing = s.facing ?? 0;
    const at = (s.at ?? new THREE.Vector3()).clone();
    if (s.seat) {
      const back = s.seat.back ?? 0.03, fx = Math.sin(facing), fz = Math.cos(facing);
      at.set(s.seat.top.x - fx * back, floor, s.seat.top.z - fz * back);
      pose.seat = (s.seat.top.y - floor) / SU;
      if (pose.base === undefined && !SEATED(pose)) pose.base = "seat";
      if (s.seat.deskEdge !== undefined) pose.desk = { edge: (s.seat.deskEdge + back) / SU, top: ((s.seat.deskTop ?? 0.75) - floor) / SU };
    }
    if (s.bed) { at.copy(s.bed.top); if (pose.kind !== "curl" && pose.kind !== "dragged" && pose.kind !== "sitUp" && !pose.base) pose.base = "bed"; }
    const seated = SEATED(pose) || pose.base === "seat";
    const lying = LYING(pose) || pose.kind === "sitUp" || pose.base === "bed";
    cam.updateMatrixWorld(); camP.setFromMatrixPosition(cam.matrixWorld); camR.setFromMatrixColumn(cam.matrixWorld, 0);
    let pick: ViewPick;
    if (lying) {
      // the card stands in the vertical plane through the body axis (head toward `facing`), on the side the camera is,
      // then turns up to clampYaw (default .45 rad) about the hip toward the camera so a bunk seen along its length
      // does not flatten to a sliver (keep clampYaw small enough that the turned card stays inside the bed: check
      // with cardClearance)
      const yawA = facing + Math.PI / 2, yawB = facing - Math.PI / 2, toCam = Math.atan2(camP.x - at.x, camP.z - at.z);
      const yaw0 = Math.abs(wrap(toCam - yawA)) < Math.abs(wrap(toCam - yawB)) ? yawA : yawB, lim = s.clampYaw ?? 0.45;
      const yaw = yaw0 + Math.max(-lim, Math.min(lim, wrap(toCam - yaw0)));
      // card +x (canvas right) in world = (cos yaw, 0, -sin yaw); the drawing's head is at canvas left
      const rx = Math.cos(yaw), rz = -Math.sin(yaw), hx = Math.sin(facing), hz = Math.cos(facing);
      pick = { view: "side", mirror: rx * hx + rz * hz > 0, yaw };
    } else pick = pickView(camP, camR, at, facing, pose.kind, seated, s.clampYaw ?? 0.5, s.view, s.seat?.deskEdge !== undefined);
    // seen from the front, a seated card stands at the seat's front edge (the lap covers the seat instead of the seat
    // slab covering the lap) or, at a desk, 2.5 cm behind the desk's near edge (the forearms drawn on the desk-top line
    // then sit on the real desk top from any camera height, instead of floating by the parallax of the gap)
    if (s.seat && seated && pick.view === "front") {
      // a turned card swings its lap edge back by (half lap width) x sin(turn): move it forward by that much so the
      // thighs drawn at seat height stay in front of the seat slab (no desk: the desk case keeps the yaw within .1)
      const fwd = s.seat.deskEdge !== undefined ? s.seat.deskEdge - 0.025 : (s.seat.front ?? 0.2) + 0.2 * Math.abs(Math.sin(wrap(pick.yaw - facing)));
      at.set(s.seat.top.x + Math.sin(facing) * fwd, floor, s.seat.top.z + Math.cos(facing) * fwd);
    }
    // place the card
    const m = this.mesh;
    m.position.copy(at); m.rotation.set(0, pick.yaw, 0); const sc = s.scale ?? 1; m.scale.set(pick.mirror ? -sc : sc, sc, sc);
    m.updateMatrixWorld(true);
    this.mirror = pick.mirror;
    // world aims -> on-card directions (from the screen projection of shoulder -> target)
    if (s.aimAt && (pose.kind === "hold" || pose.kind === "haul" || pose.kind === "point" || pose.kind === "dragged" || pose.kind === "curl")) {
      const pre = poseFig(L, { ...pose, aim: pose.aim ?? [s.aimAt[0] ? { dir: 0 } : null, s.aimAt[1] ? { dir: 0 } : null] }, pick.view);
      this.sv = pre;
      const aim: [PoseReq["aim"] extends infer A ? A extends [infer X, unknown] ? X : never : never, unknown] = [null, null] as never;
      const res: [{ dir: number; reach: number; behind: boolean } | null, { dir: number; reach: number; behind: boolean } | null] = [null, null];
      for (const i of [0, 1] as const) {
        const T = s.aimAt[i]; if (!T) continue;
        const S = pose.kind === "dragged" ? this.hipWorld() : this.shoulderWorld(i);
        const lenM = (pose.kind === "dragged" ? dimsOf(L).legLen : dimsOf(L).aLen) * SU;
        const dW = tmpV.copy(T).sub(S); const dist = dW.length() || 1; dW.multiplyScalar(lenM / dist);
        const a2 = S.clone().project(cam), b2 = S.clone().add(dW).project(cam);
        const asp = cam.aspect, sx = (b2.x - a2.x) * asp, sy = b2.y - a2.y;
        // the same length lying in the card plane, for the foreshortening ratio
        const inPlane = S.clone().add(tmpW.set(0, lenM, 0)).project(cam), ref = Math.hypot((inPlane.x - a2.x) * asp, inPlane.y - a2.y) || 1e-6;
        let dir = (Math.atan2(sy, sx) * 180) / Math.PI;
        if (pick.mirror) dir = 180 - dir;
        const behind = T.clone().sub(camP).length() > S.clone().sub(camP).length() + 0.05;
        res[i] = { dir, reach: Math.max(0.2, Math.min(1, Math.hypot(sx, sy) / ref)), behind };
      }
      void aim;
      pose.aim = [res[0], res[1]];
    }
    const sv = poseFig(L, pose, pick.view);
    this.sv = sv;
    // light: canvas angle the key comes FROM on this card, 45-degree steps
    const key = tmpV.set(...light.key).normalize();
    const cr = tmpW.set(Math.cos(pick.yaw), 0, -Math.sin(pick.yaw));
    const lx = key.dot(cr) * (pick.mirror ? -1 : 1), ly = -key.y;
    const lightA = Math.round(Math.atan2(ly, lx) / (Math.PI / 4)) * (Math.PI / 4);
    const fo: FaceOpts = { expr: s.expr ?? "neutral", blink: q(s.blink ?? 0, 2), light: lightA, look: s.look, lookUp: s.lookUp, facing: s.faceTurn };
    // resolution: canvas px per design unit from the card's on-screen size
    const f = sv.frame, dist = camP.distanceTo(at) || 1, fov = (cam.fov * Math.PI) / 180;
    const pxPerUnit = (SU * renderH) / (2 * dist * Math.tan(fov / 2)) * sc;
    const kMax = 2048 / Math.max(f.w, f.h), steps = [0.25, 0.35, 0.5, 0.7, 1.0, 1.4, 2.0, 2.7];
    let k = steps[steps.length - 1];
    for (const st of steps) if (st >= pxPerUnit * 1.2) { k = st; break; }
    k = Math.min(k, kMax);
    const w = Math.round(f.w * k), h = Math.round(f.h * k);
    const keyStr = `${keyOfLook(L)}|${solvedKey(sv)}|${JSON.stringify(fo)}`;
    this.r = pool.req(keyStr, w, h, k, (p) => paintFig(p, L, sv, fo));
    if (m.geometry !== frameGeo(f)) m.geometry = frameGeo(f);
    // shading zones
    const D = dimsOf(L);
    this.zone.uHead.value.set(sv.out.head[0] / f.w, 1 - sv.out.head[1] / f.h, (sv.out.headR * 1.02) / f.h);
    this.zone.uBody.value.set(sv.out.hip[0] / f.w, lying ? 0.5 : (sv.view === "side" ? D.Tas : D.Ta) / f.w);
    this.zone.uDim.value = s.dim ?? 1; this.zone.uAspect.value = f.w / f.h;
    m.visible = true;
    // contact blob: under the feet (standing / seated), along the body (lying)
    this.blob.visible = s.blob !== false && pick.view !== undefined;
    if (this.blob.visible) {
      if (lying) {
        const hip = this.hipWorld(), head = this.headWorld(), c = hip.clone().lerp(head, 0.15);
        const len = Math.max(0.6, hip.distanceTo(head) * 2.2);
        this.blob.position.set(c.x, at.y + 0.006, c.z); this.blob.rotation.set(0, facing, 0); this.blob.scale.set(0.55, 1, len);
      } else {
        const a0 = this.ankleWorld(0), a1 = this.ankleWorld(1), c = a0.clone().add(a1).multiplyScalar(0.5);
        const span = Math.max(0.36, Math.hypot(a0.x - a1.x, a0.z - a1.z) + 0.3);
        this.blob.position.set(c.x, floor + 0.004, c.z); this.blob.rotation.set(0, pick.yaw, 0); this.blob.scale.set(span * sc, 1, 0.32 * sc);
      }
    }
    // pop-up fx
    const fx = s.fx ?? [];
    while (this.fxs.length < fx.length) {
      const mat = new THREE.MeshBasicMaterial({ map: blank, alphaTest: 0.5, side: THREE.DoubleSide, toneMapped: true });
      const mesh = new THREE.Mesh(QUAD, mat); mesh.layers.set(NOINK); mesh.renderOrder = 2; mesh.visible = false; this.parent.add(mesh);
      this.fxs.push({ mesh, mat, r: null });
    }
    this.fxs.forEach((slot, i) => {
      const e = fx[i];
      if (!e || popScale(e.t) <= 0 || (e.kind === "huff" || e.kind === "dust") && e.t > 1) { slot.mesh.visible = false; slot.r = null; return; }
      const tt = e.kind === "huff" || e.kind === "dust" ? q(Math.min(1, e.t / 0.9), 20) : 0;
      slot.r = pool.req(`fx|${e.kind}|${tt}`, 300, 300, 1, (p) => fxPop(p, e.kind, tt));
      const hw = this.headWorld(), R = this.headR, right = tmpW.set(Math.cos(pick.yaw), 0, -Math.sin(pick.yaw));
      const fwdSide = sv.view === "side" ? (pick.mirror ? -1 : 1) : 1;
      const pos = hw.clone();
      const size = (e.kind === "huff" || e.kind === "dust" ? 0.34 : 0.3) * (e.kind === "huff" || e.kind === "dust" ? 1 : popScale(e.t));
      if (e.kind === "?" || e.kind === "!" || e.kind === "zzz") pos.addScaledVector(right, 0.55 * R * fwdSide).y += R + 0.17;
      else if (e.kind === "sweat") pos.addScaledVector(right, -1.05 * R * fwdSide).y += 0.35 * R;
      else if (e.kind === "huff") pos.addScaledVector(right, 1.25 * R * fwdSide).y -= 0.2 * R;
      else { const h0 = this.handWorld(0), h1 = this.handWorld(1); pos.copy(h0).lerp(h1, 0.5); pos.y += 0.04; }
      slot.mesh.position.copy(pos); slot.mesh.rotation.set(0, pick.yaw, 0);
      slot.mesh.scale.set(size * (e.kind === "huff" && fwdSide < 0 ? -1 : 1), size, 1);
      // keep the fx card a touch in front of the figure card (toward the camera) so it never z-fights it
      slot.mesh.position.addScaledVector(tmpV.copy(camP).sub(pos).normalize(), 0.04);
      slot.mesh.visible = true;
    });
  }
  _bind() {
    const t = this.r?.tex; if (t) this.mat.map = t;
    for (const f of this.fxs) if (f.r?.tex) f.mat.map = f.r.tex;
  }
}

// ---------------- Crowd (instanced atlas) ----------------
export type CrowdSeat = { top: THREE.Vector3; facing: number; deskEdge?: number; deskTop?: number; back?: number; floor?: number };
export type CrowdState = { pose: PoseReq; expr?: Expr; blink?: number; lookUp?: number; look?: number; faceTurn?: -1 | 0 | 1; visible?: boolean; scale?: number; dim?: number };
const PAGE = 2048, COLS = 8, CW = PAGE / COLS, CH = Math.floor(CW * (FRAMES.stand.h / FRAMES.stand.w)), ROWS = Math.floor(PAGE / CH), PER = COLS * ROWS;
type Page = { cv: HTMLCanvasElement; g: CanvasRenderingContext2D; tex: THREE.CanvasTexture; mesh: THREE.InstancedMesh; cell: THREE.InstancedBufferAttribute; head: THREE.InstancedBufferAttribute; body: THREE.InstancedBufferAttribute; dim: THREE.InstancedBufferAttribute; dirty: boolean };
export class Crowd {
  seats: CrowdSeat[]; looks: Look[]; near: number;
  state: (i: number, t: number) => CrowdState = (_i, t) => ({ pose: { kind: "desk", t } });
  private pages: Page[] = []; private cellKey: string[] = []; private sv: (Solved | null)[] = []; private yaw: number[] = []; private mir: boolean[] = [];
  private figs = new Map<number, Figure>(); private parent: THREE.Object3D;
  /** per-frame count of atlas cells redrawn (perf) */
  redrawn = 0;
  constructor(parent: THREE.Object3D, seats: CrowdSeat[], looks: Look[], o: { near?: number } = {}) {
    this.parent = parent; this.seats = seats; this.looks = looks; this.near = o.near ?? 3.2;
    const n = seats.length, np = Math.ceil(n / PER);
    for (let pi = 0; pi < np; pi++) {
      const cv = document.createElement("canvas"); cv.width = PAGE; cv.height = PAGE;
      const g = cv.getContext("2d")!;
      const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
      const cnt = Math.min(PER, n - pi * PER);
      const geo = (frameGeo(FRAMES.stand) as THREE.BufferGeometry).clone() as unknown as THREE.InstancedBufferGeometry;
      const ig = new THREE.InstancedBufferGeometry(); ig.index = geo.index; for (const k of Object.keys(geo.attributes)) ig.setAttribute(k, geo.attributes[k]);
      const cell = new THREE.InstancedBufferAttribute(new Float32Array(cnt * 4), 4), head = new THREE.InstancedBufferAttribute(new Float32Array(cnt * 3), 3);
      const body = new THREE.InstancedBufferAttribute(new Float32Array(cnt * 2), 2), dim = new THREE.InstancedBufferAttribute(new Float32Array(cnt).fill(1), 1);
      ig.setAttribute("aCell", cell); ig.setAttribute("aHead", head); ig.setAttribute("aBody", body); ig.setAttribute("aDim", dim);
      const mesh = new THREE.InstancedMesh(ig, crowdMaterial(tex), cnt);
      mesh.layers.set(NOINK); mesh.renderOrder = 1; mesh.frustumCulled = false;
      for (let j = 0; j < cnt; j++) {
        const c = j % COLS, r = Math.floor(j / COLS);
        cell.setXYZW(j, (c * CW) / PAGE, 1 - ((r + 1) * CH) / PAGE, CW / PAGE, CH / PAGE);
      }
      parent.add(mesh);
      this.pages.push({ cv, g, tex, mesh, cell, head, body, dim, dirty: true });
    }
    for (let i = 0; i < n; i++) { this.cellKey.push(""); this.sv.push(null); this.yaw.push(0); this.mir.push(false); }
  }
  /** the near-path Figure for classmate i (exists only while i is nearer than `near`) */
  figure(i: number) { return this.figs.get(i) ?? null; }
  handWorld(i: number, arm: 0 | 1, out = new THREE.Vector3()) {
    const f = this.figs.get(i); if (f?.sv) return f.handWorld(arm, out);
    const sv = this.sv[i]; if (!sv) return out.copy(this.seats[i].top);
    const pi = Math.floor(i / PER), j = i % PER, m = new THREE.Matrix4(); this.pages[pi].mesh.getMatrixAt(j, m);
    const fr = sv.frame, p = sv.out.hand[arm];
    return out.set((p[0] - fr.ox) * SU, (fr.oy - p[1]) * SU, 0).applyMatrix4(m);
  }
  _update(cam: THREE.PerspectiveCamera, t: number, pool: Pool, renderH: number, light: CastLight) {
    cam.updateMatrixWorld(); camP.setFromMatrixPosition(cam.matrixWorld); camR.setFromMatrixColumn(cam.matrixWorld, 0);
    this.redrawn = 0;
    const key = new THREE.Vector3(...light.key).normalize(), m4 = new THREE.Matrix4(), qt = new THREE.Quaternion(), sc3 = new THREE.Vector3(), zero = new THREE.Matrix4().makeScale(0, 0, 0);
    const k = CW / FRAMES.stand.w;
    this.seats.forEach((seat, i) => {
      const pg = this.pages[Math.floor(i / PER)], j = i % PER, st = this.state(i, t), floor = seat.floor ?? 0;
      const back = seat.back ?? 0.03, fx = Math.sin(seat.facing), fz = Math.cos(seat.facing);
      const at = new THREE.Vector3(seat.top.x - fx * back, floor, seat.top.z - fz * back);
      const dist = camP.distanceTo(at);
      const near = dist < this.near && st.visible !== false;
      // near: a full-resolution pooled Figure
      if (near) {
        let f = this.figs.get(i); if (!f) { f = new Figure(this.parent, this.looks[i]); this.figs.set(i, f); }
        f.set({ seat: { top: seat.top, back, deskEdge: seat.deskEdge, deskTop: seat.deskTop }, facing: seat.facing, pose: st.pose, expr: st.expr, blink: st.blink, lookUp: st.lookUp, look: st.look, faceTurn: st.faceTurn, scale: st.scale, dim: st.dim, blob: false, floor });
        f._update(cam, pool, renderH, light);
        pg.mesh.setMatrixAt(j, zero); return;
      }
      const f = this.figs.get(i); if (f) { f.mesh.visible = false; f.blob.visible = false; this.figs.delete(i); this.parent.remove(f.mesh, f.blob); }
      if (st.visible === false || (st.scale ?? 1) <= 0.001) { pg.mesh.setMatrixAt(j, zero); return; }
      const pose: PoseReq = { ...st.pose, seat: (seat.top.y - floor) / SU };
      if (!SEATED(pose)) pose.base = "seat";
      if (seat.deskEdge !== undefined) pose.desk = { edge: (seat.deskEdge + back) / SU, top: ((seat.deskTop ?? 0.75) - floor) / SU };
      const pick = pickView(camP, camR, at, seat.facing, pose.kind, true, 0.5, undefined, seat.deskEdge !== undefined);
      if (pick.view === "front") { const fwd = seat.deskEdge !== undefined ? seat.deskEdge - 0.025 : 0.2 + 0.2 * Math.abs(Math.sin(wrap(pick.yaw - seat.facing))); at.set(seat.top.x + fx * fwd, floor, seat.top.z + fz * fwd); }
      const sv = poseFig(this.looks[i], pose, pick.view);
      const cr = new THREE.Vector3(Math.cos(pick.yaw), 0, -Math.sin(pick.yaw));
      const lightA = Math.round(Math.atan2(-key.y, key.dot(cr) * (pick.mirror ? -1 : 1)) / (Math.PI / 4)) * (Math.PI / 4);
      const fo: FaceOpts = { expr: st.expr ?? "neutral", blink: q(st.blink ?? 0, 2), light: lightA, look: st.look, lookUp: st.lookUp, facing: st.faceTurn };
      const ck = `${solvedKey(sv)}|${JSON.stringify(fo)}`;
      if (ck !== this.cellKey[i]) {
        const c = j % COLS, r = Math.floor(j / COLS), g = pg.g;
        g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(c * CW, r * CH, CW, CH);
        g.save(); g.beginPath(); g.rect(c * CW + 1, r * CH + 1, CW - 2, CH - 2); g.clip();
        g.setTransform(k, 0, 0, k, c * CW, r * CH);
        paintFig(new Pen(g), this.looks[i], sv, fo);
        g.restore();
        this.cellKey[i] = ck; pg.dirty = true; this.redrawn++;
        const D = dimsOf(this.looks[i]), fr = sv.frame;
        pg.head.setXYZ(j, sv.out.head[0] / fr.w, 1 - sv.out.head[1] / fr.h, (sv.out.headR * 1.02) / fr.h);
        pg.body.setXY(j, sv.out.hip[0] / fr.w, (sv.view === "side" ? D.Tas : D.Ta) / fr.w);
        pg.head.needsUpdate = true; pg.body.needsUpdate = true;
      }
      if (pg.dim.getX(j) !== (st.dim ?? 1)) { pg.dim.setX(j, st.dim ?? 1); pg.dim.needsUpdate = true; }
      this.sv[i] = sv; this.yaw[i] = pick.yaw; this.mir[i] = pick.mirror;
      const s = st.scale ?? 1;
      qt.setFromAxisAngle(new THREE.Vector3(0, 1, 0), pick.yaw); sc3.set(pick.mirror ? -s : s, s, s);
      m4.compose(at, qt, sc3); pg.mesh.setMatrixAt(j, m4);
    });
    for (const pg of this.pages) {
      pg.mesh.instanceMatrix.needsUpdate = true;
      if (pg.dirty) { pg.tex.needsUpdate = true; pg.dirty = false; }
    }
  }
  _bind() { for (const f of this.figs.values()) f._bind(); }
}

// ---------------- Cast ----------------
export class Cast {
  pool = new Pool(); figures: Figure[] = []; crowds: Crowd[] = []; light: CastLight; renderHeight: number; parent: THREE.Object3D;
  constructor(parent: THREE.Object3D, o: { renderHeight?: number; light?: CastLight } = {}) {
    this.parent = parent; this.renderHeight = o.renderHeight ?? 1920; this.light = o.light ?? LIGHT_DORM;
  }
  add(look: Look) { const f = new Figure(this.parent, look); this.figures.push(f); return f; }
  crowd(seats: CrowdSeat[], looks: Look[], o: { near?: number } = {}) { const c = new Crowd(this.parent, seats, looks, o); this.crowds.push(c); return c; }
  /** call once per frame after every Figure.set(): solves, draws / reuses canvases, places cards, blobs and fx */
  update(cam: THREE.PerspectiveCamera, t = 0) {
    setLight(this.light);
    for (const f of this.figures) f._update(cam, this.pool, this.renderHeight, this.light);
    for (const c of this.crowds) c._update(cam, t, this.pool, this.renderHeight, this.light);
    this.pool.flush();
    for (const f of this.figures) f._bind();
    for (const c of this.crowds) c._bind();
  }
}

// ---------------- 穿模 check ----------------
/** samples the card's opaque pixels (from its canvas alpha) on a grid, maps them to world and tests them against solid
 *  boxes (desk tops, chair backs, bunk rails ...). Returns how many samples are inside a box and the deepest one (m).
 *  Use in previews / tests after cast.update(). */
export function cardClearance(fig: Figure, boxes: THREE.Box3[], grid = 48): { hits: number; worst: number; at: THREE.Vector3 | null } {
  const sv = fig.sv, tex = fig.r?.tex; if (!sv || !tex) return { hits: 0, worst: 0, at: null };
  const cv = tex.image as HTMLCanvasElement, g = cv.getContext("2d")!, img = g.getImageData(0, 0, cv.width, cv.height).data;
  const f = sv.frame, nx = grid, ny = Math.round((grid * f.h) / f.w);
  let hits = 0, worst = 0, at: THREE.Vector3 | null = null;
  const p = new THREE.Vector3();
  for (let iy = 0; iy < ny; iy++) for (let ix = 0; ix < nx; ix++) {
    const px = Math.floor(((ix + 0.5) / nx) * cv.width), py = Math.floor(((iy + 0.5) / ny) * cv.height);
    if (img[(py * cv.width + px) * 4 + 3] < 128) continue;
    fig.cardToWorld([((ix + 0.5) / nx) * f.w, ((iy + 0.5) / ny) * f.h], p);
    for (const b of boxes) if (b.containsPoint(p)) {
      const d = Math.min(p.x - b.min.x, b.max.x - p.x, p.y - b.min.y, b.max.y - p.y, p.z - b.min.z, b.max.z - p.z);
      hits++; if (d > worst) { worst = d; at = p.clone(); }
    }
  }
  return { hits, worst, at };
}
