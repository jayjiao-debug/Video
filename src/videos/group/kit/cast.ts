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
//     fx        [{ kind: "?" | "!" | "sweat" | "huff" | "dust" | "zzz", t: seconds since it popped, s?: size factor
//               (default 1), dy?: extra lift in head radii (default 0) }]
//     scale     pop-in scale (1 = normal);  visible;  dim (0..1 card brightness, e.g. inside a dark bunk)
//     blob      false = no contact blob
//
//   Light: cast.light = LIGHT_DORM / LIGHT_DORM_NIGHT / LIGHT_CLASS or your own CastLight { key (world dir TOWARD the
//   key light: the set's real sun / lamp), tint, tintK, gain, grad, bodyGrad, sideTint, and optional shade, shadeK,
//   bodyShadeK, wrap, edge, broad, bodySat, sheen, lift, bleach, contact, contactLen }: lit-sphere crescent on the head
//   and a far-side band on the torso from the key in the card frame, per pixel and per frame (no canvas redraw);
//   shadow = part x (1 - shadeK) x shade (room tint), lit = part x key tint, a day key bleaches light skin toward white;
//   ink never shaded. The drawings are painted with flat fills (FlatPen: toon.ts's painted ramps are not drawn), so the
//   shader's crescent is the only shading. Contact blob colour / directional tail per light (see "light + card shading").
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
// Determinism: nothing reads wall time; the pool redraws a canvas only from (look, solved pose, face, light) keys (the
// light only picks the thick side of the ink ring: the drawings carry no painted shading, see FlatPen).
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

// ---------------- light + card shading (vasa/cardshade.ts, rebuilt on the reference light study) ----------------
// Recipe (refstudy/light/ref_sheets/ref_light_recipe.md, 27 reference heads in 8 films):
//  - head: a soft crescent shaped like a lit sphere on the side away from the key. Sphere normal from the head disc,
//    n = (p, sqrt(1 - p.p)), lit by lEff = (dir2 sin th, cos th), dir2 = the key's direction in the card plane,
//    th = mix(wrap0, wrap1, |key in the card plane|): the 50 % line sits 1 - cos th in from the rim (0.1-0.3 r), the
//    crescent tapers to nothing about 90 deg round. The terminator's 10-90 % edge is `edge` r wide for any th
//    (d(n.l)/dr = 1 / sin th at the terminator), reference 0.12-0.15 r: a crescent, not a vignette, never a seam.
//  - body: the bean torso lit as a capsule along its own axis (so a leaning or lying torso keeps its shading) by the
//    same key with a broader angle: a lateral key gives a band down the far side (dark plateau on the outer ~12 %,
//    50 % point a third of the width in, 10-90 % over a quarter of it), a key along the torso darkens the far end cap;
//    past the torso's ends (legs, skirt, raised arms) the capsule turns back into a cylinder (side band only).
//    Deeper than the head (cloth shadow/lit ~0.5), a little more saturated, an optional thin sheen on the lit edge.
//  - shadow colour = part colour x (1 - shadeK) x shade: the room's shade tint (lavender / rose, never green).
//  - lit side = part colour x key tint (normalised to keep the face value), flat. A bright day key bleaches light skin
//    toward white (`bleach`: the reference day faces are near-white, #e2dfe6 / #ebebed, so the lavender crescent
//    shows; under a warm lamp the same face goes cream: keep bleach low there).
//  - ink (outlines, eyes, mouth lines) is never shaded or tinted.
//  - the drawings are painted by FlatPen: toon.ts's shadedFill / gradFill ramps (SH_SKIN, SH_FELT, SH_CLOTH, quantised
//    to 45 deg per card) are drawn as their flat base colour, so the shader's continuous crescent is the only shading
//    and it follows the world key per frame with no canvas redraw; every drawn line and detail stays as drawn.
export type CastLight = {
  /** world direction TOWARD the key light (crescent + body band side; use the set's real sun / lamp direction) */
  key: [number, number, number];
  /** key light colour on the lit side (mixed by tintK, normalised to keep the face value), overall gain */
  tint: [number, number, number]; tintK: number; gain: number;
  /** legacy: head / body shading strength (the defaults of shadeK = 1.4 grad, bodyShadeK = 2.5 bodyGrad) and the old
   *  far-side tint (unused) */
  grad: number; bodyGrad: number; sideTint: [number, number, number];
  /** shadow tint, linear (normalised to luminance 1): day / neutral rooms lavender [1.04, .95, 1.34], warm rooms rose
   *  [1.08, .96, 1.16], night blue-violet [1.05, .9, 1.8]. Default lavender. */
  shade?: [number, number, number];
  /** shadow depth 1 - shadow/lit (linear, before tone mapping) at the full head crescent / the body's dark plateau
   *  (reference head shadow/lit 0.54-0.86, median 0.73; cloth 0.46-0.54) */
  shadeK?: number; bodyShadeK?: number;
  /** crescent angle th (degrees) for a key straight in front of the card (thin crescent) .. fully to the side or
   *  behind. 50 % line at 1 - cos th in from the disc rim: [26, 54] = 0.10 .. 0.41 r, i.e. ~0.25 r in from the skin
   *  edge after the thick far-side ink (reference 0.19-0.31 r). A hard low side sun may go to 75-90. Default [26, 54]. */
  wrap?: [number, number];
  /** 10-90 % width of the head terminator in head radii (default 0.13; reference 0.10-0.17 r as rendered; keep
   *  >= 0.09 so it reads as form, never a seam) */
  edge?: number;
  /** legacy (r1): terminator softness in n.l; used as edge = 0.6 soft when `edge` is not given */
  soft?: number;
  /** broad second falloff across the face toward the shadow side, as a share of the full shadow (warm lamps / night 0.3) */
  broad?: number;
  /** body (capsule) crescent angle for a front .. lateral / back key (degrees, default [40, 70]: 50 % line a third of
   *  the torso width in from the far edge) and its terminator softness in n.l (default 0.38: 10-90 % over ~25 % of
   *  the width) */
  bodyWrap?: [number, number]; bodySoft?: number;
  /** extra chroma in the body shadow (0.12 = +12 % at the dark plateau) */
  bodySat?: number;
  /** lit-edge sheen on the torso, + linear (0 = none; reference 0.1 day .. 0.4 warm) */
  sheen?: number;
  /** lit side of the head lifted toward white (0 .. 0.04) */
  lift?: number;
  /** a bright day key bleaches light skin toward white: 0 = the look's skin colour, 1 = white (light skins only,
   *  luma >= .76; darker skins keep their colour). Day interiors 0.5-0.7, warm lamps 0-0.2. Default 0. */
  bleach?: number;
  /** contact blob: sRGB multiply colour at its core (flat interiors: light lavender #e0dae8, about x0.72; sunlit sets:
   *  a dark blue-violet, reference cast shadows x0.12-0.25 of the sunlit ground). Default "#e0dae8". */
  contact?: string;
  /** contact blob tail (m) away from the key along the ground: 0 = a round blob under the feet; sunlit sets ~0.5 (the
   *  reference sun shadow is darkest at the feet and fades over ~1.5 body widths). Default 0. */
  contactLen?: number;
};
/** dorm, ceiling battens on (evening): warm overhead key slightly from the door end */
export const LIGHT_DORM: CastLight = { key: [0.35, 1, 0.55], tint: [1, 0.9, 0.78], tintK: 0.55, gain: 0.97, grad: 0.2, bodyGrad: 0.16, sideTint: [0.93, 0.9, 0.98], shade: [1.08, 0.95, 1.12] };
/** dorm, lamps only (night): warmer, dimmer, more side modelling from the desk lamps */
export const LIGHT_DORM_NIGHT: CastLight = { key: [0.8, 0.6, 0.2], tint: [1, 0.82, 0.62], tintK: 0.6, gain: 0.78, grad: 0.3, bodyGrad: 0.22, sideTint: [0.85, 0.85, 1.0], shade: [1.05, 0.9, 1.6], broad: 0.3 };
/** classroom: low afternoon sun from the window wall (sets/classroom CLASSROOM_SUN.dir), cream walls and cork board:
 *  a bright day interior. Lit skin bleached near white (Lab chroma ~5, reference day faces 1-5) with a touch of sun,
 *  shadow lavender with a little rose from the warm room (reference shadow chroma 10-18, hue -50..-67 deg), head
 *  shadow/lit ~0.7 and cloth ~0.5 as displayed, crescent edge ~0.13 r; a light, soft contact blob. */
export const LIGHT_CLASS: CastLight = {
  key: [-0.803, 0.375, 0.464], tint: [1.01, 1.0, 0.985], tintK: 1, gain: 1.0, grad: 0.22, bodyGrad: 0.16, sideTint: [0.93, 0.92, 0.99],
  shade: [1.06, 0.94, 1.36], shadeK: 0.4, bodyShadeK: 0.42, wrap: [26, 52], edge: 0.13, broad: 0, bodySat: 0.12, sheen: 0.1, lift: 0,
  bleach: 0.8, contact: "#e0dae8", contactLen: 0,
};

const SHADE_DEF: [number, number, number] = [1.04, 0.95, 1.34];
const U = {
  uKey: { value: new THREE.Vector3(0, 1, 0) }, uTint: { value: new THREE.Vector3(1, 1, 1) }, uGain: { value: 1 },
  uShade: { value: new THREE.Vector3(...SHADE_DEF) }, uShadeK: { value: new THREE.Vector2(0.31, 0.4) },
  uWrap: { value: new THREE.Vector2(rad0(26), rad0(54)) }, uEdge: { value: 0.13 }, uBroad: { value: 0 },
  uWrapB: { value: new THREE.Vector2(rad0(40), rad0(70)) }, uSoftB: { value: 0.38 },
  uBodySat: { value: 0.12 }, uSheen: { value: 0 }, uLift: { value: 0 }, uBleach: { value: 0 },
};
function rad0(d: number) { return (d * Math.PI) / 180; }
const LUMA3 = (v: THREE.Vector3) => 0.2126 * v.x + 0.7152 * v.y + 0.0722 * v.z;
const setLight = (L: CastLight) => {
  U.uKey.value.set(...L.key).normalize();
  const t = U.uTint.value.set(1 - L.tintK + L.tint[0] * L.tintK, 1 - L.tintK + L.tint[1] * L.tintK, 1 - L.tintK + L.tint[2] * L.tintK);
  t.multiplyScalar(1 / Math.max(LUMA3(t), 0.05));
  U.uGain.value = L.gain;
  const s = U.uShade.value.set(...(L.shade ?? SHADE_DEF)); s.multiplyScalar(1 / Math.max(LUMA3(s), 0.05));
  U.uShadeK.value.set(L.shadeK ?? Math.min(0.6, 1.4 * L.grad), L.bodyShadeK ?? Math.min(0.52, 2.5 * L.bodyGrad));
  const w = L.wrap ?? [26, 54]; U.uWrap.value.set(rad0(w[0]), rad0(w[1]));
  U.uEdge.value = Math.max(0.04, L.edge ?? (L.soft !== undefined ? 0.6 * L.soft : 0.13)); U.uBroad.value = L.broad ?? 0;
  const wb = L.bodyWrap ?? [40, 70]; U.uWrapB.value.set(rad0(wb[0]), rad0(wb[1])); U.uSoftB.value = Math.max(0.05, L.bodySoft ?? 0.38);
  U.uBodySat.value = L.bodySat ?? 0.12; U.uSheen.value = L.sheen ?? 0; U.uLift.value = L.lift ?? 0;
  U.uBleach.value = Math.min(1, Math.max(0, L.bleach ?? 0));
};
type P2 = [number, number];
/** the drawing with toon.ts's painted light ramps flattened: shadedFill / gradFill fill the flat base colour. The card
 *  shader owns all shading, so nothing painted doubles or fights its crescent, and every drawn line, part line and
 *  detail (also the ones close to a ramp colour) stays exactly as drawn. */
class FlatPen extends Pen {
  shadedFill(pts: P2[], base: string) { this.path(pts, true); this.g.fillStyle = base; this.g.fill(); }
  gradFill(pts: P2[], base: string) { this.path(pts, true); this.g.fillStyle = base; this.g.fill(); }
}
const CARD_DECL = /* glsl */ `
uniform vec3 uKey; uniform vec3 uTint; uniform float uGain; uniform vec3 uShade; uniform vec2 uShadeK; uniform vec2 uWrap;
uniform float uEdge; uniform float uBroad; uniform float uBodySat; uniform float uSheen; uniform float uLift; uniform float uBleach;
uniform vec2 uWrapB; uniform float uSoftB;
varying vec2 vCard; varying vec4 vHead; varying vec4 vBody; varying float vDim; varying float vAspect; varying vec3 vKc;
varying vec3 vSkin;
vec3 cardToSrgb( vec3 c ) { c = max( c, vec3( 0.0 ) ); return mix( c * 12.92, 1.055 * pow( c, vec3( 0.4166667 ) ) - 0.055, step( vec3( 0.0031308 ), c ) ); }
vec3 cardToLin( vec3 c ) { c = max( c, vec3( 0.0 ) ); return mix( c / 12.92, pow( ( c + 0.055 ) / 1.055, vec3( 2.4 ) ), step( vec3( 0.04045 ), c ) ); }
`;
/** vertex: the key in the card's own frame (x = card +u, y = card up, z = toward the camera side of the card) */
const CARD_VERT = (inst: boolean) => /* glsl */ `
{
  mat3 cm = mat3( modelMatrix )${inst ? " * mat3( instanceMatrix )" : ""};
  vec3 cR = normalize( cm * vec3( 1.0, 0.0, 0.0 ) ), cU = normalize( cm * vec3( 0.0, 1.0, 0.0 ) ), cN = normalize( cross( cR, cU ) );
  vec3 cwp = ( modelMatrix * ${inst ? "instanceMatrix * " : ""}vec4( position, 1.0 ) ).xyz;
  if ( dot( cN, cameraPosition - cwp ) < 0.0 ) cN = -cN;
  vec3 kk = normalize( uKey );
  vKc = vec3( dot( kk, cR ), dot( kk, cU ), dot( kk, cN ) );
}
`;
/** card shading in the fragment shader. vCard = card uv (0..1), vHead = (u, v, r in v units, torso half length in v
 *  units), vBody = torso centre (x in v units, v), half width (v units), axis angle (rad, canvas sense), vKc = key in
 *  the card frame, vDim = brightness, vSkin = the look's skin colour (sRGB 0..1, for the day bleach). */
const CARD_GLSL = /* glsl */ `
vec3 cB = diffuseColor.rgb;
vec3 outgoingLight;
{
  const vec3 LW = vec3( 0.2126, 0.7152, 0.0722 );
  vec3 kc = normalize( vKc );
  float lat = length( kc.xy );
  // direction of the key in the card plane (a key straight behind / in front falls back toward "from above")
  vec2 dir2 = normalize( kc.xy + vec2( 0.0, 0.05 ) );
  // a key in front of the card thins the crescent (readable faces); lateral or behind keeps it full width
  // (reference golden-hour back light: 0.24 r crescent on the far side)
  float latE = kc.z > 0.0 ? clamp( lat, 0.0, 1.0 ) : 1.0;
  float th = mix( uWrap.x, uWrap.y, latE );
  vec3 lEff = vec3( dir2 * sin( th ), cos( th ) );
  // the terminator's 10-90 % edge is uEdge head radii for any th: n.l changes by 1 / sin th per radius there, and
  // smoothstep's 10-90 % spans 0.608 of its window
  float soft = uEdge / ( 1.216 * max( sin( th ), 0.25 ) );
  // head: lit sphere from the head disc
  vec2 pc = vec2( vCard.x * vAspect, vCard.y );
  vec2 P = ( pc - vec2( vHead.x * vAspect, vHead.y ) ) / vHead.z;
  float pr = length( P );
  float ndl = dot( vec3( P, sqrt( max( 1.0 - pr * pr, 0.0 ) ) ), lEff );
  float sHead = 1.0 - smoothstep( -soft, soft, ndl );
  sHead = max( sHead, uBroad * ( 1.0 - smoothstep( -0.6, 0.4, ndl ) ) );
  // body: a capsule along the torso's own axis (radius = half width, caps from +-(half length - half width)); past the
  // torso's ends (legs, skirt, a raised arm) it turns back into a cylinder, so those keep the side band only
  vec2 ax = vec2( cos( vBody.w ), -sin( vBody.w ) ), ay = vec2( -ax.y, ax.x );
  vec2 dB = pc - vBody.xy;
  float bu = dot( dB, ax ) / vBody.z, bw = dot( dB, ay ) / vBody.z;
  float capE = max( abs( bw ) - max( vHead.w / vBody.z - 1.0, 0.0 ), 0.0 );
  float bt = sign( bw ) * min( capE, 1.0 ) * ( 1.0 - smoothstep( 1.0, 1.6, capE ) );
  vec3 nB = normalize( vec3( bu, bt, sqrt( max( 1.0 - bu * bu - bt * bt, 0.0 ) ) + 1e-4 ) );
  float thB = mix( uWrapB.x, uWrapB.y, latE );
  vec3 lB = vec3( dir2 * sin( thB ), cos( thB ) );
  float ndlB = nB.x * dot( ax, lB.xy ) + nB.y * dot( ay, lB.xy ) + nB.z * lB.z;
  float sBody = 1.0 - smoothstep( -uSoftB, uSoftB, ndlB );
  // only the torso (and a little past its outline) takes the band: legs, shoes, hands and arms held away from it stay
  // unshaded (thin dark limbs show no band anyway; white shoes would turn lavender)
  float outT = length( vec2( max( capE - 1.0, 0.0 ), max( abs( bu ) - 1.0, 0.0 ) ) );
  sBody *= 1.0 - smoothstep( 0.12, 0.5, outT );
  float sheen = uSheen * smoothstep( 0.72, 0.9, abs( bu ) ) * ( 1.0 - smoothstep( 0.98, 1.1, abs( bu ) ) ) * smoothstep( 0.15, 0.45, ndlB ) * ( 1.0 - smoothstep( 0.4, 0.6, abs( bt ) ) );
  float hz = 1.0 - smoothstep( 0.9, 1.1, pr );
  float notInk = smoothstep( 0.012, 0.045, dot( cB, LW ) );
  float s = mix( sBody, sHead, hz ) * notInk;
  float K = mix( uShadeK.y, uShadeK.x, hz );
  // day bleach (light skins only): the look's skin moves toward white. The canvas mixes its anti-aliased edges in sRGB,
  // so a skin / ink edge texel lies on the sRGB line INK -> skin: it is moved to INK -> bleached skin with the same ink
  // share. The bleach follows coverage continuously (no warm fringe on the ink, no crawl when a card moves); colours
  // off that line (hair, cloth, eyes, teeth, cream shirts) and the dark stick limbs (ink share > 1/2) keep their colour.
  float wB = uBleach * smoothstep( 0.62, 0.76, dot( vSkin, LW ) );
  if ( wB > 0.0 ) {
    const vec3 INKS = vec3( 0.1412, 0.0902, 0.149 );   // toon.ts INK #241726
    vec3 xs = cardToSrgb( cB ), sg = vSkin - INKS;
    float a = clamp( dot( xs - INKS, sg ) / max( dot( sg, sg ), 1e-4 ), 0.0, 1.0 );
    float res = length( xs - INKS - sg * a );
    vec3 skL = cardToLin( vSkin );
    skL = mix( skL, vec3( max( max( skL.r, skL.g ), skL.b ) ), wB );
    vec3 tgt = cardToLin( INKS + ( cardToSrgb( skL ) - INKS ) * a );
    cB = mix( cB, tgt, ( 1.0 - smoothstep( 0.012, 0.035, res ) ) * smoothstep( 0.5, 0.75, a ) );
  }
  vec3 col = cB * uTint;
  float sat = uBodySat * s * ( 1.0 - hz );
  col = max( mix( vec3( dot( col, LW ) ), col, 1.0 + sat ), vec3( 0.0 ) );
  col *= mix( vec3( 1.0 ), ( 1.0 - K ) * uShade, s );
  col *= 1.0 + sheen * ( 1.0 - hz ) * notInk;
  float mx = max( max( col.r, col.g ), col.b );
  col = mix( col, vec3( mx ), uLift * ( 1.0 - s ) * hz * notInk );
  outgoingLight = col * uGain * vDim;
}
`;
const DECL_F = "#include <common>\n" + CARD_DECL;
const VDECL = "varying vec2 vCard; varying vec4 vHead; varying vec4 vBody; varying float vDim; varying float vAspect; varying vec3 vKc;\nvarying vec3 vSkin;\nuniform vec3 uKey;";
type Zone = { uHead: { value: THREE.Vector4 }; uBody: { value: THREE.Vector4 }; uDim: { value: number }; uAspect: { value: number }; uSkin: { value: THREE.Vector3 } };
/** single card: zones as uniforms */
const figMaterial = () => {
  const m = new THREE.MeshBasicMaterial({ map: blank, alphaTest: 0.5, side: THREE.DoubleSide });
  const zone: Zone = {
    uHead: { value: new THREE.Vector4(0.5, 0.7, 0.12, 0.2) }, uBody: { value: new THREE.Vector4(0.38, 0.4, 0.1, 0) }, uDim: { value: 1 }, uAspect: { value: 0.76 },
    uSkin: { value: new THREE.Vector3(1, 0.886, 0.761) },
  };
  m.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, U, zone);
    sh.vertexShader = sh.vertexShader.replace("#include <common>", "#include <common>\nuniform vec4 uHead; uniform vec4 uBody; uniform float uDim; uniform float uAspect; uniform vec3 uSkin;\n" + VDECL)
      .replace("#include <uv_vertex>", "#include <uv_vertex>\nvCard = uv; vHead = uHead; vBody = uBody; vDim = uDim; vAspect = uAspect; vSkin = uSkin;\n" + CARD_VERT(false));
    sh.fragmentShader = sh.fragmentShader.replace("#include <common>", DECL_F).replace("vec3 outgoingLight = reflectedLight.indirectDiffuse;", CARD_GLSL);
  };
  m.customProgramCacheKey = () => "figcard5";
  return { m, zone };
};
/** instanced atlas card: per-instance cell rect + zones + the look's skin colour (aColA.rgb) */
const crowdMaterial = (map: THREE.Texture) => {
  const m = new THREE.MeshBasicMaterial({ map, alphaTest: 0.5, side: THREE.DoubleSide });
  m.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, U);
    sh.vertexShader = sh.vertexShader.replace("#include <common>", "#include <common>\nattribute vec4 aCell; attribute vec4 aHead; attribute vec4 aBody; attribute float aDim; attribute vec4 aColA;\n" + VDECL)
      .replace("#include <uv_vertex>", "#include <uv_vertex>\nvCard = uv; vHead = aHead; vBody = aBody; vDim = aDim; vAspect = " + (760 / 1000).toFixed(4) + "; vSkin = aColA.rgb;\n#ifdef USE_MAP\nvMapUv = aCell.xy + uv * aCell.zw;\n#endif\n" + CARD_VERT(true));
    sh.fragmentShader = sh.fragmentShader.replace("#include <common>", DECL_F).replace("vec3 outgoingLight = reflectedLight.indirectDiffuse;", CARD_GLSL);
  };
  m.customProgramCacheKey = () => "figcrowd5";
  return m;
};
/** a look's skin colour as sRGB 0..1 (the day bleach finds the skin texels by it; -1 = none) */
const SKIN_COL = new WeakMap<Look, number[]>();
const hex01 = (h: string | undefined) => {
  if (!h || h[0] !== "#" || h.length < 7) return [-1, -1, -1];
  const n = parseInt(h.slice(1, 7), 16); return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};
const skinCol = (L: Look) => {
  let c = SKIN_COL.get(L);
  if (!c) { c = hex01(L.skin); SKIN_COL.set(L, c); }
  return c;
};
/** torso zone of a solved pose (toon.ts paintFig's torso blob T): centre (x / f.h, 1 - y / f.h), half width / f.h,
 *  axis angle (lean + roll, canvas sense), half length / f.h */
const bodyZone = (L: Look, sv: Solved): [number, number, number, number, number] => {
  const f = sv.frame, D = dimsOf(L), lean = rad0(sv.lean);
  const hb = 0.5 * (sv.torsoBot - (sv.chin - 0.25 * D.HH)), lx = sv.tcx, ly = sv.torsoBot - hb;
  // local -> leaned about the hip -> frame (rotate by roll about piv, then translate by tr)
  const c1 = Math.cos(lean), s1 = Math.sin(lean), dx = lx - sv.hip[0], dy = ly - sv.hip[1];
  const qx = sv.hip[0] + dx * c1 - dy * s1 - sv.piv[0], qy = sv.hip[1] + dx * s1 + dy * c1 - sv.piv[1];
  const c2 = Math.cos(sv.roll), s2 = Math.sin(sv.roll);
  const fx = sv.piv[0] + qx * c2 - qy * s2 + sv.tr[0], fy = sv.piv[1] + qx * s2 + qy * c2 + sv.tr[1];
  return [fx / f.h, 1 - fy / f.h, (sv.view === "side" ? D.Tas : D.Ta) / f.h, lean + sv.roll, hb / f.h];
};
/** ground contact blob: multiplies what is already drawn (vasa/cardshade.ts blobMaterial) */
const blobMaterial = (map: THREE.Texture) => new THREE.MeshBasicMaterial({
  map, transparent: false, depthWrite: false, fog: false, toneMapped: false,
  blending: THREE.CustomBlending, blendEquation: THREE.AddEquation, blendSrc: THREE.ZeroFactor, blendDst: THREE.SrcColorFactor,
  polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2, side: THREE.DoubleSide,
});
const blank = (() => { const c = document.createElement("canvas"); c.width = c.height = 2; return new THREE.CanvasTexture(c); })();
/** contact blob textures per (colour, round / tail). Round (128 x 128): toon.ts fxContact, the colour at the core,
 *  soft fall-off, no hard rim (flat interiors: reference x0.65-0.85 within ~50-60 px of the feet). Tail (128 x 256):
 *  the same round core with its centre a quarter down the canvas (the feet) and a tail toward the canvas bottom,
 *  tapering and fading out (sunlit sets: the reference sun shadow is darkest at the feet and fades over ~1.5 body
 *  widths). */
const BLOB_TEX = new Map<string, THREE.CanvasTexture>();
const CONTACT_PROFILE: [number, number][] = [[0, 0], [0.32, 0.02], [0.5, 0.22], [0.66, 0.58], [0.82, 0.88], [1, 1]];
const blobTex = (col: string, tail: boolean) => {
  const key = `${col}|${tail ? 1 : 0}`;
  let t = BLOB_TEX.get(key);
  if (t) return t;
  const c = document.createElement("canvas"); c.width = 128; c.height = tail ? 256 : 128;
  const g = c.getContext("2d")!;
  if (!tail) fxContact(new Pen(g), col);
  else {
    const k = hex01(col), im = g.createImageData(128, 256), d = im.data;
    // white -> colour by density (sRGB mix, like fxContact's gradient stops)
    const prof = (r: number) => {
      if (r >= 1) return 0;
      for (let i = 1; i < CONTACT_PROFILE.length; i++) {
        const [r1, k1] = CONTACT_PROFILE[i], [r0, k0] = CONTACT_PROFILE[i - 1];
        if (r <= r1) return 1 - (k0 + ((k1 - k0) * (r - r0)) / (r1 - r0));
      }
      return 0;
    };
    for (let y = 0; y < 256; y++) for (let x = 0; x < 128; x++) {
      const dx = (x + 0.5 - 64) / 64, dy = (y + 0.5 - 64) / 64;
      let dens: number;
      if (dy <= 0) dens = prof(Math.hypot(dx, dy));
      else {
        const al = Math.min(1, dy / 3), hw = 1 - 0.4 * al;   // along the tail 0..1, half width tapering to .6
        const fade = 1 - al * al * (3 - 2 * al);              // darkest at the feet, gone at the far end
        dens = Math.max(prof(Math.hypot(dx, dy)), prof(Math.abs(dx) / hw) * (0.55 + 0.45 * (1 - al)) * fade);
      }
      const o = (y * 128 + x) * 4;
      for (let ch = 0; ch < 3; ch++) d[o + ch] = Math.round(255 * (1 + (k[ch] - 1) * dens));
      d[o + 3] = 255;
    }
    g.putImageData(im, 0, 0);
  }
  t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.generateMipmaps = false; t.minFilter = THREE.LinearFilter;
  BLOB_TEX.set(key, t);
  return t;
};
const CONTACT_DEF = "#e0dae8";
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
  view?: View; clampYaw?: number; fx?: { kind: FxKind; t: number; s?: number; dy?: number }[]; scale?: number; visible?: boolean; dim?: number; blob?: boolean;
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
  private zone: Zone;
  private mat: THREE.MeshBasicMaterial; private fxs: FxSlot[] = []; private parent: THREE.Object3D;
  constructor(parent: THREE.Object3D, look: Look) {
    this.look = look; this.parent = parent;
    const { m, zone } = figMaterial(); this.mat = m; this.zone = zone;
    this.mesh = new THREE.Mesh(frameGeo(FRAMES.stand), m);
    this.mesh.renderOrder = 1; this.mesh.layers.set(NOINK); this.mesh.visible = false; this.mesh.frustumCulled = false;
    this.mesh.onBeforeRender = () => {};
    this.blob = new THREE.Mesh(FLAT, blobMaterial(blobTex(CONTACT_DEF, false))); this.blob.renderOrder = 0.5; this.blob.layers.set(NOINK); this.blob.visible = false;
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
    this.r = pool.req(keyStr, w, h, k, (p) => paintFig(new FlatPen(p.g), L, sv, fo));
    if (m.geometry !== frameGeo(f)) m.geometry = frameGeo(f);
    // shading zones
    const bz = bodyZone(L, sv);
    this.zone.uHead.value.set(sv.out.head[0] / f.w, 1 - sv.out.head[1] / f.h, (sv.out.headR * 1.02) / f.h, bz[4]);
    this.zone.uBody.value.set(bz[0], bz[1], bz[2], bz[3]);
    this.zone.uDim.value = s.dim ?? 1; this.zone.uAspect.value = f.w / f.h;
    const skc = skinCol(L); this.zone.uSkin.value.set(skc[0], skc[1], skc[2]);
    m.visible = true;
    // contact blob: under the feet (standing / seated), along the body (lying)
    this.blob.visible = s.blob !== false && pick.view !== undefined;
    if (this.blob.visible) {
      // tail away from the key along the ground (sunlit sets); none for a key near the zenith or a lying body
      const kx = -light.key[0], kz = -light.key[2], kg = Math.hypot(kx, kz), tailLen = lying || kg < 0.15 ? 0 : (light.contactLen ?? 0);
      const bm = this.blob.material as THREE.MeshBasicMaterial, bt = blobTex(light.contact ?? CONTACT_DEF, tailLen > 0);
      if (bm.map !== bt) { bm.map = bt; bm.needsUpdate = true; }
      if (lying) {
        const hip = this.hipWorld(), head = this.headWorld(), c = hip.clone().lerp(head, 0.15);
        const len = Math.max(0.6, hip.distanceTo(head) * 2.2);
        this.blob.position.set(c.x, at.y + 0.006, c.z); this.blob.rotation.set(0, facing, 0); this.blob.scale.set(0.55, 1, len);
      } else if (tailLen > 0) {
        // tail texture: the feet a quarter down the canvas (local -z end), the tail toward local +z = the ground
        // direction away from the key; width across that direction from the ankle spread
        const gx = kx / kg, gz = kz / kg, a0 = this.ankleWorld(0), a1 = this.ankleWorld(1), c = a0.clone().add(a1).multiplyScalar(0.5);
        const span = Math.max(0.36, Math.abs((a0.x - a1.x) * gz - (a0.z - a1.z) * gx) + 0.3), lz = (tailLen + 0.16) / 0.75;
        this.blob.position.set(c.x + gx * 0.25 * lz * sc, floor + 0.004, c.z + gz * 0.25 * lz * sc);
        this.blob.rotation.set(0, Math.atan2(gx, gz), 0); this.blob.scale.set(span * sc, 1, lz * sc);
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
      const pos = hw.clone(); pos.y += (e.dy ?? 0) * R;
      const size = (e.kind === "huff" || e.kind === "dust" ? 0.34 : 0.3) * (e.kind === "huff" || e.kind === "dust" ? 1 : popScale(e.t)) * (e.s ?? 1);
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
      const cell = new THREE.InstancedBufferAttribute(new Float32Array(cnt * 4), 4), head = new THREE.InstancedBufferAttribute(new Float32Array(cnt * 4), 4);
      const body = new THREE.InstancedBufferAttribute(new Float32Array(cnt * 4), 4), dim = new THREE.InstancedBufferAttribute(new Float32Array(cnt).fill(1), 1);
      // the look's skin colour for the day bleach (looks are fixed per seat)
      const colA = new THREE.InstancedBufferAttribute(new Float32Array(cnt * 4), 4);
      for (let j = 0; j < cnt; j++) { const c = skinCol(looks[pi * PER + j]); colA.setXYZW(j, c[0], c[1], c[2], 1); }
      ig.setAttribute("aCell", cell); ig.setAttribute("aHead", head); ig.setAttribute("aBody", body); ig.setAttribute("aDim", dim);
      ig.setAttribute("aColA", colA);
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
        paintFig(new FlatPen(g), this.looks[i], sv, fo);
        g.restore();
        this.cellKey[i] = ck; pg.dirty = true; this.redrawn++;
        const fr = sv.frame;
        const bz = bodyZone(this.looks[i], sv);
        pg.head.setXYZW(j, sv.out.head[0] / fr.w, 1 - sv.out.head[1] / fr.h, (sv.out.headR * 1.02) / fr.h, bz[4]);
        pg.body.setXYZW(j, bz[0], bz[1], bz[2], bz[3]);
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
