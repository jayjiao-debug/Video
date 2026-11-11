// "Toy" figures: real 3D bodies drawn to read as hand-drawn 2D, the look of the reference shorts (a blob head that
// carries a 2D face, a wrapped outfit on a rounded body, painted hair, small hat / bun props, thin limbs with ball
// hands and L feet, brush-weight ink outlines, real cast shadows). A drop-in alternative to kit/cast.ts's drawn cards
// for the same Looks.
//
// What keeps the 2D read while the camera moves (measured on the reference frames):
//   1. the face is a flat 2D drawing projected onto the head along a direction that stays within FACE_MAX (12 deg)
//      of the camera: almost a front drawing, nudged toward the side the person faces. Never profile. The drawing is
//      placed by position (not by the surface normal), so the head's lumps do not bend it, and it is scaled by depth,
//      so it keeps one size on the head at every camera distance. It goes on over the hair (a raised brow crosses the
//      fringe); only a hat covers it.
//      The drawings are this file's own (see "faces" below): the reference's kit of parts, one round pen for every
//      line, a lid bar with a hanging pupil as the default eye, plain arc brows, a tiny mouth. toon.ts's Expr names
//      are kept, so a card scene's expressions carry over one to one.
//   2. the body turns toward the camera so it is never more than BODY_MAX (45 deg) from facing it: the outfit's front
//      (a picture wrapped on the body) stays in view and foreshortens on its own as the camera moves.
//   3. hair is painted on the head itself (one surface: nothing can z-fight along the hairline) and drawn like the
//      reference's: a flat colour with an ink line along the hairline, an ink parting and a few lighter streaks, the
//      fringe low over the forehead. The lines are analytic in the shader and fade out before they get thinner than
//      a pixel. Hats, buns and tails are small rigid props; caps carry drawn seams and a stitched band, beanies ribs.
//      Under a hat the hair shows only from the temples back (no fringe, parting or streaks). A cap's peak is a
//      wedge that grows out of the gap under the rim: it never touches the head and has no hull, its ink edge is
//      painted on it (a thin plate's hull shows as a hairline or a row of dots whenever it is seen edge on).
//      Hair and hats turn with the BODY (up to 45 deg), the face barely moves: the two slide past each other, and
//      that gap is the main 3D cue of the reference.
//   4. the head is drawn complete, on top of its own body and limbs, with the heaviest ink under the chin, the way a
//      drawing layers a head over a body. Against everything else (other figures, props, the set) it keeps its true
//      depth. Done with the stencil buffer (see layerMat): the render target must have one.
//      state.headFront = 0 = plain depth order for that figure.
//   5. limbs: thin tubes in near-ink with one flat lighter stripe, ball hands, feet = the leg bent forward. Effort =
//      lean the body, never stretch the head.
//   6. two frames: TRAVEL (the story facing: feet, stride, the haul lean, hip joints; planted in the world, so feet
//      never skate when the camera or the body turn) and SHOW (the camera-turned torso, arms, head, hair).
//
// What makes it read as drawn, not modelled (RigCast's `hand`: 0 = clean geometry, 1 = the reference's amount):
//   - shapes are uneven: the head is the Look's blob (wider than tall, lopsided, lumpy), the body's sides wobble,
//     limbs bow a little and vary in width, the face and outfit drawings are slightly warped;
//   - ink has brush weight: thin toward the key, heavy away from it and underneath, swelling and thinning along the
//     line;
//   - colour is flat and the shading is drawn: the head gets one soft band along its far rim; cloth gets a pale band
//     on the lit edge, a flat middle and a darker far third; limbs get one flat stripe. No lambert falloff anywhere.
//     Hats and props (PART.prop) get a lit band and a far third that goes clearly darker; hair gets a lighter lit
//     side, a darker far side and five comb streaks (curls take the head's light, not one each: rigMat's form);
//     a brim throws a band of shadow on the head under it (PartKit.brim
//     does it on its own, a hand-built hat says PartKit.shadow); the head carries a thin warm arc inside its outline
//     on the lit side (RIM). The scene's own light does not reach the figures yet (they cast shadows, take none).
//   All of it is seeded per character and fixed to the part: nothing changes from frame to frame (no line boil).
//
// API (metres, floor y 0, yaw 0 = +z, PI/2 = +x: same conventions as kit/cast.ts):
//   const rc = new RigCast(scene, { light: LAB_CAST_LIGHT });        // { light, hand?: 0..1 }
//   const a = rc.add(YOU);                    // or rc.add(look, { hat: { kind: "cap", col: "#3f6b8f" } })
//   per frame: a.set({ at, facing, pose: { kind: "haul", t, amount: .85 }, hands: [worldA, worldB], expr: "huff", blink });
//              rc.update(camera, renderHeightPx);   // solves the body turn, face slide, IK; rebuilds limbs
//              a.handWorld(0 | 1), a.headWorld(), a.footWorld(i)     (attach ropes after update)
//   arm 0 = the person's right hand (screen left when they face the camera), 1 = left.
//   state.turn: 0 = turn toward the camera (rule 2), 1 = keep the true facing (a back view); undefined = from the
//   camera angle (continuous). Animate it over 8-12 frames for a turn-away; set it for group shots so a line of
//   people never splits between front and back.
//   state.twist: the torso's own turn away from the feet's direction (rad, + = toward the person's left), applied
//   before rule 2. The arms are short (0.84 head widths), so anyone who grips something beside them (a rope) has to
//   turn toward it.
//   state.gaze: -1 (screen left) .. 1 (screen right) slides the pupils, in steps of 0.5. state.blink: 0 open, 0.5
//   half, 1 shut (two drawn steps, no in-betweens).
//   rigFaceCanvas(look, expr, { lid, gaze, brim }) = one face drawing as a canvas (sheets, QA); RIG_EXPRS = the names.
//   Talking: Object.assign(state, rigSpeak(t, lines, id)) gives state.mouth (one of the eight talking mouths,
//   RIG_MOUTHS: one open-and-close per syllable, the widest on a stressed one), state.head and the blinks at the
//   lines' joints. rigSay = the mouth alone, rigSayEnv = the mouth from a voice track's loudness. Only while the
//   character speaks its own line: never under a narrator (the reference's rule).
//   state.head (RigHead: dx, dy, tilt, scale, squash) = the head as a layer of its own on top of the pose; the face,
//   the hair and everything worn on the head go with it. rigHeadAccent("pop" | "squash" | "nod" | "jolt" | "shake" |
//   "laugh" | "lean", seconds since it began) = the reference's accents; rigHeadAdd joins several.
//   Walking: pose: rigWalk(distance walked in metres, speed in m/s): the step's length follows the speed, the feet
//   stay planted, the body bounces (a sharp low after each landing, a rounded high as the legs pass) and the head
//   and hat nod a beat late.
//   a.qa after update: clear = the smallest gap between an arm and the own body / head in metres (< 0 = clipping),
//   reach = how far a hand target is beyond the arm (> 0 = cannot reach); seated, clear also counts the seat, the
//   desk and the chair's back, and qa.seat / qa.head give the legs' and a front arm's gaps (see Rig.qa).
// Sitting, writing, a phone (kit/RIG3D_poses.md has the staging advice and the limits):
//   a.set({ at, facing, seat: { top: V(x, 0.456, z), deskEdge: 0.23, deskTop: 0.75 }, pose: { kind: "write", t } });
//   state.seat (see RigSeat: the fields of kit/cast.ts's seat, plus backrest / backrestTop): the figure sits there and
//   `at` is ignored. The hips rest on the seat; the thighs lie forward over it in the TRAVEL frame, the knees bend
//   just past the front edge and the shins hang; a foot is planted only if the leg reaches the floor without passing
//   through the seat, otherwise it dangles (these legs are short: on a 0.456 m chair they dangle). The legs belong
//   to the seat, so they are still. Every pose keeps its upper body on a seat (idle, wave, cheer, point, hold ...);
//   a hand that would hang rests on its own thigh, or on the desk top when the seat has a desk, and stays put while
//   the body breathes and the camera moves. Seated, the torso turns at most 20 deg from the chair toward the camera
//   (14 at a desk, less where a build's resting hands could not keep their places); the head turns the rest of the
//   way on the body (up to 46 deg), so face, hair and hat follow the camera as they do on a standing figure.
//   pose kinds: "sit" (= "desk"): hands on the lap, or forearms ON the desk top when the seat has a desk.
//     "write": seated at a desk, pose.arm (default 0) makes small strokes on the desk top with what it holds (pen()),
//     the other forearm rests, the head tips down; driven by pose.t alone.
//     "phone": pose.arm (default 1) holds a phone (phone()): amount 0 = looking at it in front of the chest, 1 = at
//     the ear, in between a smooth raise (animate amount over 8-12 frames). Standing or seated.
//     "shh": a finger to the lips. pose.arm (default 1) brings its hand up under the mouth, in front of the chin, and
//     what it holds as `posed` (finger()) stands up across the lips: amount 1 (the default) = at the lips, 0 = in
//     front of the chest. Its arm is drawn in front of the own head. The face for it: expr "hush".
//   state.armFront = [right, left]: true = that arm, its hand and what it holds are drawn at their true depth against
//   the figure's own head (rule 4 is off for that arm only), so they can show in front of the face, and they are kept
//   strictly outside the head's real shape (hair and hat included). undefined = the pose decides ("phone" sets it for
//   the phone's arm); false = under the own head, as always. With no arm in front every picture is as before.
//   Things for a hand: kit/rigacc/phone.ts, pen.ts (PartKit.held with posed: true: these poses turn the thing and
//   keep every point of it outside the head, the body and the desk).
// Accessories (role props: glasses, a moustache, hats, headphones, a tie, a backpack, a briefcase ...) plug in:
//   rc.add(look, { acc: [glasses({ kind: "round" }), topHat()] })           // kit/rigacc/ has the standard ones
//   An accessory is a plain object (see Acc) made by a function in its own file. It can draw on the face (face /
//   faceUnder), draw on the clothes (outfit) and build 3D parts (build) through a kit that knows the layering rules
//   (PartKit: shell, solid, plate, brim, band, held, keepOut). It names the slots it takes ("eyes", "lip", "hat",
//   "crown", "ears", "neck", "back", "hand0" ...): two accessories in one slot stop with an error that names both,
//   and a look's own extras (glasses, lanyard, tag, headband) give way to an accessory in their slot.
//   Adding one never needs a change in this file: copy the nearest one in kit/rigacc/ (RIG3D.md, "Accessories").
//   A figure without accessories is built and drawn exactly as before: scripts/rig3d/regress.py compares stills
//   pixel by pixel with recorded ones, run it after every change to this file.
//   state.hide = ["phone"] hides an accessory's 3D parts for a frame (a phone that is still in the pocket).
// Staging: keep a facing out of 115-170 deg from the camera (the turn-away transition; use turn = 1 for a back view).
//   A figure's own hand never shows in front of its own head (rule 4), so poses keep the hands beside or below it;
//   state.armFront (and the "phone" pose) lifts that for one arm.
// Pipeline: EffectComposer needs stencilBuffer: true (postprocessing: new EffectComposer(renderer, { stencilBuffer:
//   true }); @react-three/postprocessing: <EffectComposer stencilBuffer>). The figures draw in three steps by
//   renderOrder: heads (0), bodies and limbs (1), heads again as depth only (2). Within a head, a hat's shells go
//   first (-0.2), then the skin (-0.1), which skips their pixels. While an arm is drawn in front of its own head
//   (armFront), a depth-only disc through the head's edge plane goes in between (0.6): the head's ink ring is the
//   back of a hull and lies behind that plane, and without the disc a phone tucked behind the head would cover it.
// Lighting: the same CastLight as the cards (key, tint, shade, gain). The key is held within a per-part angle of the
//   view, so shade never swallows a face. Outline: inverted hulls pushed out in view space, never thinner than uMinPx
//   pixels. Everything is on NOINK (the world ink pass never outlines it).
import * as THREE from "three";
import { INK, SU, dimsOf, niTag, Pen, type Look, type Expr, type Blob } from "./toon";
import type { CastLight } from "./cast";
import { NOINK } from "../../vasa/ink";

type V3 = THREE.Vector3;
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x));
const rad = (d: number) => (d * Math.PI) / 180;
const smooth = (x: number) => { const t = clamp(x, 0, 1); return t * t * (3 - 2 * t); };
const wrapA = (a: number) => Math.atan2(Math.sin(a), Math.cos(a));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerpA = (a: number, b: number, t: number) => a + wrapA(b - a) * t;
const UP = V(0, 1, 0);
const rnd = (seed: number, k: number) => { const x = Math.sin(seed * 127.1 + k * 311.7) * 43758.5453; return x - Math.floor(x); };
/** hand-drawn irregularity: smooth lumps over a unit direction (three zonal harmonics about seeded axes; range about
 *  +-2.2, typically +-1). Fixed to the part, so an outline changes only as the part really turns: nothing boils. */
const lumps = (seed: number) => {
  const ax = [0, 1, 2].map((i) => { const u = 2 * rnd(seed, 60 + i) - 1, a = rnd(seed, 70 + i) * 2 * Math.PI, q = Math.sqrt(1 - u * u); return [q * Math.cos(a), u, q * Math.sin(a)]; });
  return (x: number, y: number, z: number) => {
    const a = x * ax[0][0] + y * ax[0][1] + z * ax[0][2], b = x * ax[1][0] + y * ax[1][1] + z * ax[1][2], c = x * ax[2][0] + y * ax[2][1] + z * ax[2][2];
    return 2 * a * a - 1 + 0.7 * (4 * b * b * b - 3 * b) + 0.5 * (8 * c * c * c * c - 8 * c * c + 1);
  };
};

export const BODY_MAX = rad(45);
export const FACE_MAX = rad(12);
/** "shh": how far to the other side of the body's front a hand follows the face (see armPlan) */
export const SHH_FAR = rad(30);
/** The part of the head that belongs to the face drawing, for 3D parts: az = degrees from the face side, top = height
 *  in head units. The face turns to the camera on its own (FACE_MAX) while hair and hats turn with the body
 *  (BODY_MAX), so the drawn eyes and mouth slide up to 33 degrees round the head, and their outer ends lie another
 *  24 degrees out. A 3D part that is within `az` of the front, below `top` (the brows) and outside the skin will, at
 *  some camera angle a film uses, lie over an eye or the mouth, or drift away from the mouth it was meant to sit at.
 *  What belongs there is drawn on the face (Acc.face). Rig.accRules reports parts that break this. */
export const FACE_ZONE = { az: 62, top: 0.2 };
/** walk: half stride (m) and stance share; metres per full cycle (two steps) for planted feet */
const STRIDE = 0.2, STANCE = 0.6;
export const RIG_WALK_CYCLE_M = (2 * STRIDE) / STANCE;
/** The walk pose of someone who has walked `dist` metres at a steady `speed` (m/s): the feet stay planted on the
 *  ground, and the steps are as long as that speed needs for the reference's cadence (a step every 11 frames or so:
 *  short quick steps when slow, long ones when fast), never shorter than 0.1 m or longer than 0.27 m a half step.
 *  For a speed that changes during the shot, give RigPose a phase of your own (the distance in step cycles). */
export const rigWalk = (dist: number, speed: number, amount = 1): RigPose => {
  const stride = clamp(0.225 * Math.abs(speed), 0.1, 0.27), cycle = (2 * stride) / STANCE;
  return { kind: "walk", phase: (((Math.abs(dist) / cycle) % 1) + 1) % 1, stride, amount };
};
/** the walk's bounce (measured on the reference's walks: Second Draw 21.67 to 23.0 s, a step every 10.5 frames). The
 *  whole figure drops quickly into a sharp low point 0 to 1 frames after a foot lands and rises slowly to a rounded
 *  high point as the legs pass: 7 to 9 % of its height. The head and hat tip forward 11 to 15 degrees, most 1 to 2
 *  frames after the low point, and are level again by the passing pose; the body rocks forward with each landing.
 *  lift = how far above its standing height the hip is at the high point (m; the leg under the body is then straight:
 *  a standing figure's legs are a little slack); bob = the drop from there to the low point (m; 0.09 = 6 % of the
 *  height: with this stride the knees give without squatting); low = where the low point is in a step (0 = as the
 *  foot lands); top = where the high point is, from the low point; nod = the head's tip (degrees of headPitch; the
 *  head group turns by 0.6 of it), over nodLen of the step; rock = degrees the body pitches forward at the low point.
 *  RigPose.amount scales all of it (0 = a glide). */
const WALK = { lift: 0.03, bob: 0.09, low: 0.06, top: 0.58, nod: 18, nodLen: 0.5, rock: 4 };
/** limbs are near-ink (reference: (33, 25, 46) with a lighter band); the outline ink is lifted so the film's NEUTRAL
 *  tone mapping lands it on the reference's (31, 23, 40) instead of crushing it to black */
export const LIMB_COL = "#3f3b4b";
export const RIG_INK = "#3a3742";

// ===== light + materials =====
const LUMA = (c: THREE.Color) => 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b;
type LightU = { uKey: { value: V3 }; uTint: { value: V3 }; uGain: { value: number }; uShade: { value: V3 }; uResH: { value: number }; uInkLift: { value: V3 } };
const lightUniforms = (): LightU => {
  const a = new THREE.Color(RIG_INK), b = new THREE.Color(INK);
  return { uKey: { value: V(0, 1, 0) }, uTint: { value: V(1, 1, 1) }, uGain: { value: 1 }, uShade: { value: V(1.04, 0.95, 1.34) }, uResH: { value: 1920 }, uInkLift: { value: V(a.r - b.r, a.g - b.g, a.b - b.b) } };
};
const applyLight = (U: LightU, L: CastLight) => {
  U.uKey.value.set(...L.key).normalize();
  const t = U.uTint.value.set(1 - L.tintK + L.tint[0] * L.tintK, 1 - L.tintK + L.tint[1] * L.tintK, 1 - L.tintK + L.tint[2] * L.tintK);
  t.multiplyScalar(1 / Math.max(0.2126 * t.x + 0.7152 * t.y + 0.0722 * t.z, 0.05));
  U.uGain.value = L.gain;
  const s = U.uShade.value.set(...(L.shade ?? [1.04, 0.95, 1.34]));
  s.multiplyScalar(1 / Math.max(0.2126 * s.x + 0.7152 * s.y + 0.0722 * s.z, 0.05));
};
/** how a part is painted: a flat colour plus an "inner shadow" that hugs the outline on the side away from the key (the
 *  reference's shading: drawn, not lit). wrap = the largest angle (deg) of the key from the view; band = [full, none]
 *  in n.v (0 = the outline, 1 = facing the camera); k = shadow depth; sat 0 = the light's lavender shade, 1 = the
 *  part's own colour, darker and richer (cloth); stripe = a flat highlight (rgb gain, w = cos of its half width, 2 = none);
 *  grad = shaded across the form instead (see PART); pale = light colours take the light's own shade colour, half as
 *  deep (a white hat's dark side is pale lavender, not grey); lit = the lit band multiplies the colour (gain, plus a
 *  little added) instead of mixing it toward white: matt things, hair */
type Part = { wrap: number; k: number; band: [number, number]; sat: number; far?: number; stripe?: [number, number, number, number]; grad?: [number, number, number, number]; gradOn?: number; pale?: number; lit?: [number, number] };
type Kind = "plain" | "face" | "tube";
const HAIR_N = 256;
/** The rasteriser's depth for a triangle seen nearly edge-on is not reliable: it snaps the corners to a sixteenth of
 *  a pixel, and across a sliver that is centimetres of depth. Single samples of it then come out nearer than the
 *  surface and land, as single pixels that flicker while the figure turns, on whatever stands just in front of this
 *  part's outline (a headphone cup at the head's edge, a case in front of a leg, a clasp on a case).
 *  Two cures, both for every rig material (fills, ink hulls, accessories):
 *  SLOPE_BIAS: each triangle is drawn that many pixels' worth of its own depth slope further away (polygon offset
 *  factor). A surface facing the camera does not move; a sliver moves back by about what its depth can be wrong by,
 *  so it only shows where it is in front by more than that. Nothing is dropped, so outlines do not change.
 *  EDGE_ON: a triangle whose plane is within asin(EDGE_ON) of edge-on is not drawn at all (0 = off). It removes
 *  specks too, but whole triangles go, so the outline's edges move by a fraction of a pixel as the figure turns. */
const SLOPE_BIAS: number = 1, EDGE_ON: number = 0;
const EDGE_ON_GLSL = (P: string, V: string) => EDGE_ON > 0 ? `{ vec3 eN = cross( dFdx( ${P} ), dFdy( ${P} ) ); float eL = length( eN ); if ( eL > 0.0 && abs( dot( eN, ${V} ) ) < ${EDGE_ON.toFixed(4)} * eL ) discard; }` : "";
const slopeBias = <M extends THREE.Material>(m: M): M => { if (SLOPE_BIAS > 0) { m.polygonOffset = true; m.polygonOffsetFactor = SLOPE_BIAS; m.polygonOffsetUnits = 0; } return m; };
const FRAG_DECL = (kind: Kind) => /* glsl */ `
uniform vec3 uKey; uniform vec3 uTint; uniform float uGain; uniform vec3 uShade;
uniform float uWrap; uniform float uK; uniform vec2 uBand; uniform float uSat; uniform vec4 uStripe; uniform vec4 uGrad; uniform float uGradOn; uniform float uPale; uniform vec2 uLit; uniform float uFar; uniform vec4 uForm;
varying vec3 vWN; varying vec3 vWP;
${kind === "face" ? /* glsl */ `
uniform sampler2D uFace; uniform vec3 uFF; uniform vec3 uFR; uniform vec3 uFU; uniform float uFaceOn; uniform vec3 uInkLift;
uniform vec4 uHead; uniform vec3 uInk;
uniform sampler2D uHair; uniform vec3 uHairCol; uniform vec4 uHeadband; uniform vec4 uHairPart; uniform float uHairInk;
uniform vec4 uBrim; uniform vec2 uBrimAz; uniform vec3 uKeyH; uniform vec4 uRim;
varying vec3 vON;
float hairTexel( float i ) { vec4 t = texture2D( uHair, vec2( ( i + 0.5 ) / ${HAIR_N}.0, 0.5 ) ); return ( t.r * 65280.0 + t.g * 255.0 ) / 65535.0 * 3.14159265; }
float hairLineAt( float az ) {
  float u = ( az / 6.28318531 + 0.5 ) * ${HAIR_N}.0 - 0.5, i0 = floor( u );
  return mix( hairTexel( i0 ), hairTexel( i0 + 1.0 ), u - i0 );
}` : ""}
${kind === "tube" ? "varying vec3 vWT;" : ""}
`;
const FRAG_SHADE = (kind: Kind) => /* glsl */ `
vec3 outgoingLight;
{
  vec3 n = normalize( vWN );
  if ( !gl_FrontFacing ) n = -n;
  vec3 base = diffuseColor.rgb;
  vec3 Vd = normalize( cameraPosition - vWP );
  ${EDGE_ON_GLSL("vWP", "Vd")}
  vec3 L = normalize( uKey );
  float a = acos( clamp( dot( L, Vd ), -1.0, 1.0 ) );
  if ( a > uWrap ) {
    vec3 ax = cross( Vd, L );
    float al = length( ax );
    vec3 perp = al > 1e-4 ? cross( ax / al, Vd ) : vec3( 0.0, 1.0, 0.0 );
    L = normalize( Vd * cos( uWrap ) + perp * sin( uWrap ) );
  }
  float ndl = dot( n, L ), ndv = dot( n, Vd ), kk = uK, sat = uSat;
${kind === "face" ? /* glsl */ `
  // the face drawing is projected flat along the face direction (by position, in ball radii from the head's centre):
  // what is drawn is what shows, whatever the head's own shape. The front of the head is nearer the camera than its
  // outline, so a close camera would show the face larger against the outline than a far one; the drawing is scaled
  // back by that ratio, so it keeps one size on the head at every distance, as a 2D drawing does.
  vec3 hp = ( vWP - uHead.xyz ) / uHead.w;
  vec3 hc = uHead.xyz - cameraPosition;
  float hcd = max( length( hc ), 1e-4 );
  vec2 q = vec2( dot( hp, uFR ), dot( hp, uFU ) ) * ( hcd * hcd / max( dot( vWP - cameraPosition, hc ), 1e-4 ) );
  vec4 f = texture2D( uFace, clamp( q * 0.5 + 0.5, 0.0, 1.0 ) );
  float fm = uFaceOn * smoothstep( 0.0, 0.2, dot( n, uFF ) ) * step( abs( q.x ), 1.0 ) * step( abs( q.y ), 1.0 );
  float fl = dot( f.rgb, vec3( 0.2126, 0.7152, 0.0722 ) );
  vec3 fc = f.rgb + uInkLift * ( 1.0 - smoothstep( 0.012, 0.05, fl ) );
  // hair and headband are painted on the ball itself (no second surface: nothing can z-fight along the hairline)
  vec3 on = normalize( vON );
  float th = acos( clamp( on.y, -1.0, 1.0 ) );
  float az = atan( on.x, on.z ), hl = hairLineAt( az );
  float hd = th - hl;
  float hw = 0.5 * clamp( fwidth( hd ), 1e-4, 0.06 ), tw = 0.5 * clamp( fwidth( th ), 1e-4, 0.06 );
  float hm = 1.0 - smoothstep( -hw, hw, hd );
  float bm = uHeadband.a * smoothstep( -tw, tw, th - 0.8727 ) * ( 1.0 - smoothstep( -tw, tw, th - 1.0297 ) );
  // drawn hair (the reference): a few lighter streaks that run with the hairline, an ink parting, and an ink line
  // along the hairline itself. All of it is analytic and fades out before it gets thinner than a pixel.
  float fw = clamp( fwidth( th ), 1e-4, 0.2 );
  float rel = th / max( hl, 0.2 );
  float dz = az - uHairPart.x;
  dz = atan( sin( dz ), cos( dz ) );
  float sdz = uHairPart.y == 0.0 ? abs( dz ) : dz * uHairPart.y;
  float st = 0.0;
  for ( int i = 0; i < 5; i ++ ) {
    // (five comb lines, as on the reference's heads; they start a little apart and the lower ones are shorter)
    float fi = float( i ), odd = mod( fi, 2.0 );
    float span = smoothstep( 0.14 + 0.07 * odd, 0.46 + 0.07 * odd, sdz ) * ( 1.0 - smoothstep( 1.3 - 0.16 * fi, 1.75 - 0.16 * fi, sdz ) );
    float w = 0.023 * span;
    st = max( st, span * ( 1.0 - smoothstep( w - 0.5 * fw, w + 0.5 * fw, abs( rel - 0.47 - 0.105 * fi ) * hl ) ) );
  }
  st *= clamp( 0.054 / fw - 0.6, 0.0, 1.0 ) * uHairPart.z;
  vec3 hairC = mix( uHairCol, uHairCol * 1.7 + vec3( 0.07, 0.07, 0.085 ), st );
  float pl = ( 1.0 - smoothstep( 0.02 - 0.5 * fw, 0.02 + 0.5 * fw, abs( dz ) * sin( th ) ) ) * smoothstep( 0.34, 0.5, rel ) * uHairPart.w * clamp( 0.04 / fw - 0.6, 0.0, 1.0 );
  float il = ( 1.0 - smoothstep( uHairInk - hw, uHairInk + hw, abs( hd ) ) ) * step( 1e-4, uHairInk );
  base = mix( base, hairC, hm );
  base = mix( base, uInk, max( il, pl * hm ) );
  base = mix( base, uHeadband.rgb, bm );
  // the face goes on last: a raised brow is drawn over the fringe, as in the reference (a hat still covers it)
  base = mix( base, fc, f.a * fm );
  float cov = max( hm, bm ) * ( 1.0 - f.a * fm );
  kk = mix( uK, ${HAIR_K.toFixed(2)}, cov ); sat = mix( uSat, 0.8, cov );
` : ""}
  // light colours shade toward the light's own shade colour and half as deep (uPale)
  float pale = uPale * smoothstep( 0.45, 0.9, dot( base, vec3( 0.2126, 0.7152, 0.0722 ) ) );
  kk *= 1.0 - 0.5 * pale; sat *= 1.0 - pale;
  // a lump that is part of a larger form (uForm = that form's middle, w > 0: the curls on a head) is shaded across
  // that form, not across itself: it takes the light the form has at that place, so the two read as one mass and
  // not as small balls stuck on a ball, each with a lit and a dark side of its own
  vec3 nf = uForm.w > 0.0 ? normalize( vWP - uForm.xyz ) : n;
  // the inner shadow: strongest at the outline, only on the side away from the key
  float s = ( 1.0 - smoothstep( uBand.x, uBand.y, dot( nf, Vd ) ) ) * smoothstep( -0.25, 0.5, -dot( nf, L ) );
  // cloth (grad): a drawn gradient across the form instead: a pale band along the lit edge, flat in the middle, darker
  // over the far third. It runs along the key as seen on screen, mostly sideways, and fades out when the key is
  // straight behind the camera (so it never jumps from one side to the other)
  vec3 upv = vec3( 0.0, 1.0, 0.0 ) - Vd * Vd.y;
  float upl = length( upv );
  upv = upl > 1e-3 ? upv / upl : vec3( 0.0, 0.0, 1.0 );
  vec3 Gp = L - Vd * dot( L, Vd );
  Gp -= upv * dot( Gp, upv ) * 0.65;
  float gLen = length( Gp ), gAll = smoothstep( 0.06, 0.4, gLen ), gk = gAll * uGradOn;
  float gu = dot( nf, Gp / max( gLen, 1e-4 ) );
  ${kind === "face" ? "gk = max( gk, gAll * cov );     // hair painted on the head is shaded across the form, the skin is not" : ""}
  s = mix( s, max( smoothstep( uGrad.x, uFar, -gu ), 0.4 * smoothstep( 0.25, 0.95, -dot( nf, upv ) ) ), gk );
  vec3 bn = base / max( max( base.r, max( base.g, base.b ) ), 1e-4 );
  vec3 col = base * uTint;
  col *= mix( vec3( 1.0 ), ( 1.0 - kk ) * mix( uShade, pow( bn, vec3( 0.25 ) ), sat ), s );
  // the pale band is weaker on dark cloth (on the reference's mint it lifts the luma by about a quarter)
  float hk = uGrad.w * clamp( dot( base, vec3( 0.2126, 0.7152, 0.0722 ) ) / 0.55, 0.35, 1.0 );
  col = mix( col, vec3( 0.9, 1.0, 1.14 ) * uTint, hk * gk * smoothstep( uGrad.y, uGrad.z, gu ) );
  // matt things (hair): the lit band multiplies the colour instead
  col = mix( col, col * uLit.x + vec3( uLit.y ) * uTint, step( 1e-3, uLit.x ) * gk * smoothstep( uGrad.y, uGrad.z, gu ) );
${kind === "face" ? /* glsl */ `
  // the rim arc (the reference): a thin warm line just inside the head's outline, on the side the light comes from,
  // over skin and hair alike. It runs where the ball faces the camera by uRim.w (a ring a little inside the outline),
  // for about a third of the way round, and is gone before it is thinner than a pixel.
  {
    float rw = max( fwidth( ndv ), 1e-4 ), rd = 0.03;
    vec3 np = n - Vd * ndv;
    float rs = dot( np / max( length( np ), 1e-4 ), Gp / max( gLen, 1e-4 ) );
    float rl = ( 1.0 - smoothstep( rd - 0.5 * rw, rd + 0.5 * rw, abs( ndv - uRim.w ) ) ) * clamp( 2.0 * rd / rw - 0.6, 0.0, 1.0 );
    col = mix( col, uRim.rgb * uTint, 0.7 * rl * gAll * smoothstep( 0.2, 0.62, rs ) * step( 1e-3, uRim.w ) );
  }
  // a brim's shadow on the head: a cast shadow worked out on the ball, under a drawn light. From this point toward the
  // light, does the ray pass under the brim's edge (uBrim: its height, its reach at the front and at the sides, in
  // head radii; uBrimAz: the middle and half the width of a peak)? The light stands straight out from the head at
  // every point, uKeyH.y = the sine of its height, and leans toward the key by uKeyH.xz (head axes): so the shadow
  // is a band under the brim, as deep as the brim reaches out there and a little deeper on the side away from the
  // key. It does not depend on the camera, so it does not swim as the camera goes round.
  if ( uBrim.w > 0.0 ) {
    vec2 oB = on.xz / max( length( on.xz ), 1e-3 );
    vec3 LB = normalize( vec3( oB.x * sqrt( 1.0 - uKeyH.y * uKeyH.y ) + uKeyH.x, uKeyH.y, oB.y * sqrt( 1.0 - uKeyH.y * uKeyH.y ) + uKeyH.z ) );
    float tB = ( uBrim.x - on.y ) / max( LB.y, 0.05 );
    vec2 hB = on.xz + tB * LB.xz;
    float rB = mix( uBrim.y, uBrim.z, hB.x * hB.x / max( dot( hB, hB ), 1e-4 ) );
    float dAz = atan( hB.x, hB.y ) - uBrimAz.x;
    dAz = abs( atan( sin( dAz ), cos( dAz ) ) );
    float shB = step( 0.0, tB ) * ( 1.0 - smoothstep( uBrimAz.y - 0.1, uBrimAz.y + 0.04, dAz ) ) * ( 1.0 - smoothstep( rB - 0.14, rB + 0.03, length( hB ) ) );
    col *= mix( vec3( 1.0 ), uShade * 0.7, uBrim.w * shB );
  }
` : ""}
${kind === "tube" ? /* glsl */ `
  // the highlight is a flat stripe along the limb on the lit side (drawn, not a specular falloff)
  vec3 T = normalize( vWT );
  vec3 Lp = L - T * dot( T, L ), Vp = Vd - T * dot( T, Vd );
  vec3 hh = normalize( Lp / max( length( Lp ), 1e-3 ) + Vp / max( length( Vp ), 1e-3 ) + n * 1e-3 );
  col *= mix( vec3( 1.0 ), uStripe.rgb, smoothstep( uStripe.w - 0.035, uStripe.w, dot( n, hh ) ) );
` : /* glsl */ `
  col *= mix( vec3( 1.0 ), uStripe.rgb, smoothstep( uStripe.w - 0.02, uStripe.w, dot( n, normalize( L + Vd ) ) ) );
`}
  outgoingLight = col * uGain;
}
`;
type NumU = { value: number };
type FaceU = { uFace: { value: THREE.Texture }; uFF: { value: V3 }; uFR: { value: V3 }; uFU: { value: V3 }; uFaceOn: NumU; uHead: { value: THREE.Vector4 }; uInk: { value: THREE.Color };
  uHair: { value: THREE.Texture }; uHairCol: { value: THREE.Color }; uHeadband: { value: THREE.Vector4 }; uHairPart: { value: THREE.Vector4 }; uHairInk: NumU;
  uBrim: { value: THREE.Vector4 }; uBrimAz: { value: THREE.Vector2 }; uKeyH: { value: V3 }; uRim: { value: THREE.Vector4 } };
/** pull: the mesh is drawn that many metres nearer the camera along the view ray (depth only; its place on screen and
 *  its shading do not change): the head group uses it to sit in front of its own body.
 *  form: the mesh is a lump on a larger round form (the curls on a head): the middle of that form in the world, w > 0
 *  (the head's own uHead, so it follows the head). The lump is then shaded across the form (see the shader). */
const rigMat = (U: LightU, part: Part, o: THREE.MeshBasicMaterialParameters = {}, kind: Kind = "plain", face?: FaceU, pull?: NumU, form?: { value: THREE.Vector4 }) => {
  const m = slopeBias(new THREE.MeshBasicMaterial(o));
  const P = { uWrap: { value: rad(part.wrap) }, uK: { value: part.k }, uBand: { value: new THREE.Vector2(part.band[0], part.band[1]) }, uSat: { value: part.sat }, uStripe: { value: new THREE.Vector4(...(part.stripe ?? [1, 1, 1, 2])) }, uGrad: { value: new THREE.Vector4(...(part.grad ?? [0, 2, 3, 0])) }, uGradOn: { value: part.gradOn ?? (part.grad ? 1 : 0) }, uPale: { value: part.pale ?? 0 }, uLit: { value: new THREE.Vector2(...(part.lit ?? [0, 0])) }, uFar: { value: part.far ?? 1 }, uPull: pull ?? { value: 0 }, uForm: form ?? { value: new THREE.Vector4(0, 0, 0, 0) } };
  m.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, U, P, face ?? {});
    sh.vertexShader = sh.vertexShader
      .replace("#include <common>", "#include <common>\nuniform float uPull; varying vec3 vWN; varying vec3 vWP;" + (kind === "tube" ? "\nattribute vec3 tangent3; varying vec3 vWT;" : "") + (kind === "face" ? "\nvarying vec3 vON;" : ""))
      .replace("#include <project_vertex>", "#include <project_vertex>\nmvPosition.xyz -= normalize( mvPosition.xyz ) * uPull;\ngl_Position = projectionMatrix * mvPosition;\nvWP = ( modelMatrix * vec4( transformed, 1.0 ) ).xyz;\nvWN = normalize( mat3( modelMatrix ) * normal );"
        + (kind === "tube" ? "\nvWT = normalize( mat3( modelMatrix ) * tangent3 );" : "") + (kind === "face" ? "\nvON = normal;" : ""));
    sh.fragmentShader = sh.fragmentShader.replace("#include <common>", "#include <common>\n" + FRAG_DECL(kind)).replace("vec3 outgoingLight = reflectedLight.indirectDiffuse;", FRAG_SHADE(kind));
  };
  m.customProgramCacheKey = () => "rig3-" + kind;
  return m;
};
/** reference values (bench frame): head fill flat, a lavender band (x 0.89, 0.87, 0.98 in sRGB) about 0.15 R wide
 *  along the far rim with a soft edge of about 0.1 R; cloth is a gradient across the body: a pale cool band over the
 *  lit 15% of the width (42% toward white at the edge), flat for half the width, then darker over the far 30%, down
 *  to x (0.69, 0.74, 0.78) at the edge (grad = [where the dark starts, lit band from, lit band full, lit strength], in
 *  units of the half width from the middle); limbs are flat near-ink with one lighter stripe (x 2.3 in luma on
 *  screen) just inside the lit edge */
/** hats, hair and props (measured on the reference's bowler through a camera orbit, and on seven heads of hair): they
 *  are shaded across the form like the cloth, and that is what makes them read as solid while the camera moves.
 *  The bowler, in sRGB luma across its crown: a lit band of 112 over the 20 to 29 % nearest the light, a quick step
 *  down to 62 across the middle, then down to 38 over the far third; the band stays on the light's side as the
 *  camera goes round. Hair is matt: its lit side is 1.2 x the middle and its far side 0.75 x (in sRGB).
 *  HAIR_K = how deep hair's far side goes; the head's own grad only applies where hair is painted on it.
 *  far (hats and props) = where the far side's dark is full, in half widths from the middle (1 = only at the outline,
 *  as on cloth; 0.72 = the whole far third is dark, as on the bowler).
 *  RIM = the rim arc on the head: its colour (linear) and how far inside the outline it runs (the facing there; 0 =
 *  no arc). The reference draws it on every head: a thin warm line inside the outline on the lit side. */
const HAIR_K = 0.4, HAIR_GRAD: [number, number, number, number] = [0.3, 0.5, 0.66, 0], HAIR_LIT: [number, number] = [1.5, 0.045];
const RIM: [number, number, number, number] = [0.87, 0.4, 0.08, 0.3];
/** the light that throws a brim's shadow on the head: its height above the horizon is the key's, kept within
 *  BRIM_ELEV degrees; BRIM_SIDE = how far it leans toward the key (0 = the same band all round) */
const BRIM_ELEV: [number, number] = [42, 60], BRIM_SIDE = 0.3;
const PART = {
  head: { wrap: 60, k: 0.22, band: [0.5, 0.68], sat: 0, grad: HAIR_GRAD, gradOn: 0, lit: HAIR_LIT } as Part,
  body: { wrap: 62, k: 0.47, band: [0, 0.8], sat: 0.75, grad: [0.35, 0.58, 0.88, 0.42] } as Part,
  hair: { wrap: 60, k: HAIR_K, band: [0.2, 0.75], sat: 0.8, grad: HAIR_GRAD, lit: HAIR_LIT } as Part,
  limb: { wrap: 75, k: 0, band: [0, 0.01], sat: 0, stripe: [1.86, 1.86, 1.71, 0.925] } as Part,
  ball: { wrap: 75, k: 0, band: [0, 0.01], sat: 0, stripe: [1.86, 1.86, 1.71, 0.965] } as Part,
  prop: { wrap: 60, k: 0.5, band: [0.15, 0.75], sat: 1, grad: [0.3, 0.5, 0.66, 0.36], pale: 1, far: 0.72 } as Part,
};
/** ink hull: the mesh's own geometry drawn back-side-only, pushed out along the view-space normal by w metres, at
 *  least minPx pixels. The line has weight, like a brush line: x (1 +- thick) on the side away from / toward the key
 *  and (down) underneath, and it swells and thins slowly along the outline (brush; fixed to the part). */
const HULL_VERT = /* glsl */ `
vec4 mvPosition = modelViewMatrix * vec4( transformed, 1.0 );
{
  vec3 nv = normalize( normalMatrix * normal );
  vec3 kv = mat3( viewMatrix ) * normalize( uKey );
  float kl = length( kv.xy ), nl = length( nv.xy );
  vec2 kd = kl > 1e-4 ? ( -kv.xy / kl ) * min( kl * 1.6, 1.0 ) : vec2( 0.0 );
  vec2 td = mix( kd, vec2( 0.0, -1.0 ), uDown );
  float side = nl > 1e-4 ? dot( nv.xy / nl, td ) * smoothstep( 0.0, 0.3, nl ) : 0.0;
  float br = 0.6 * sin( dot( position, uB1.xyz ) + uB1.w ) + 0.4 * sin( dot( position, uB2.xyz ) + uB2.w );
  float px = 2.0 * ( -mvPosition.z ) / ( projectionMatrix[ 1 ][ 1 ] * uResH );
  float w = max( uW * ( 1.0 + uThick * side ) * ( 1.0 + uBrush * br ), uMinPx * px );
  mvPosition.xyz += nv * w;
  mvPosition.xyz -= normalize( mvPosition.xyz ) * uPull;
}
vHP = mvPosition.xyz;
gl_Position = projectionMatrix * mvPosition;
`;
type HullO = { minPx?: number; down?: number; pull?: NumU; brush?: number; seed?: number; freq?: number };
const hullMat = (U: LightU, w: number, thick = 0.4, o: HullO = {}) => {
  const m = slopeBias(new THREE.MeshBasicMaterial({ color: RIG_INK, side: THREE.BackSide }));
  const sd = o.seed ?? 1, fr = o.freq ?? 14;
  const bv = (k: number, f: number) => { const u = 2 * rnd(sd, k) - 1, a = rnd(sd, k + 1) * 6.283, q = Math.sqrt(1 - u * u); return new THREE.Vector4(q * Math.cos(a) * f, u * f, q * Math.sin(a) * f, rnd(sd, k + 2) * 6.283); };
  const P = { uW: { value: w }, uThick: { value: thick }, uMinPx: { value: o.minPx ?? 1.6 }, uDown: { value: o.down ?? 0 }, uPull: o.pull ?? { value: 0 }, uBrush: { value: o.brush ?? 0 }, uB1: { value: bv(90, fr) }, uB2: { value: bv(94, fr * 1.7) } };
  m.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, { uKey: U.uKey, uResH: U.uResH }, P);
    sh.vertexShader = sh.vertexShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vHP;\nuniform vec3 uKey; uniform float uResH; uniform float uW; uniform float uThick; uniform float uMinPx; uniform float uDown; uniform float uPull; uniform float uBrush; uniform vec4 uB1; uniform vec4 uB2;")
      .replace("#include <project_vertex>", HULL_VERT);
    sh.fragmentShader = sh.fragmentShader.replace("#include <common>", "#include <common>\nvarying vec3 vHP;").replace("#include <clipping_planes_fragment>", EDGE_ON_GLSL("vHP", "normalize( vHP )") + "\n#include <clipping_planes_fragment>");
  };
  m.customProgramCacheKey = () => "rig3-hull";
  return m;
};

/** layering, as in a drawing: a figure's head (with its ring, hair props and hat) is always on top of that figure's own
 *  body and limbs, and at its true depth against everything else. The head group writes the figure's id to the
 *  stencil; the figure's other parts skip the pixels that carry it. Needs a stencil buffer on the render target
 *  (EffectComposer: stencilBuffer true); without one the body simply covers the chin where it is nearer.
 *  Draw order: heads (renderOrder 0), the rest of each figure (1), then each head once more as depth only (2), a
 *  little nearer the camera: the depth buffer the post effects read (ambient occlusion) then has the head in front
 *  of the body too, so the occlusion shade falls on the collar, not on the chin. */
const layerMat = (m: THREE.Material, sid: number, kind: "head" | "under" | "depth") => {
  m.stencilWrite = true; m.stencilRef = sid;
  if (kind === "head") { m.stencilFunc = THREE.AlwaysStencilFunc; m.stencilZPass = THREE.ReplaceStencilOp; }
  else { m.stencilFunc = kind === "under" ? THREE.NotEqualStencilFunc : THREE.EqualStencilFunc; m.stencilFuncMask = ID_BITS; }
};
/** The stencil's low seven bits hold the figure's id; the top bit marks the pixels the head's skin drew. The skin's
 *  own ink hull skips those: it is always behind the skin, and with SLOPE_BIAS the depth test cannot say so at the
 *  skin's outline (the last sliver of skin is moved back, behind its hull, and the outline would grow and shrink by
 *  a fraction of a pixel as the head turns). Everything else that is drawn over the skin clears the bit again. */
const ID_BITS = 0x7f, SKIN_BIT = 0x80;
/** clears the stencil at the start of every pass that draws the figures (a full-screen triangle drawn first), so the
 *  layering does not depend on how the pipeline clears its buffers */
const stencilClear = () => {
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]), 3));
  const m = new THREE.Mesh(g, new THREE.ShaderMaterial({
    vertexShader: "void main() { gl_Position = vec4( position.xy, 0.0, 1.0 ); }", fragmentShader: "void main() { gl_FragColor = vec4( 0.0 ); }",
    colorWrite: false, depthTest: false, depthWrite: false, stencilWrite: true, stencilRef: 0, stencilFunc: THREE.AlwaysStencilFunc,
    stencilZPass: THREE.ReplaceStencilOp, stencilFail: THREE.ReplaceStencilOp, stencilZFail: THREE.ReplaceStencilOp,
  }));
  m.frustumCulled = false; m.renderOrder = -1e5; m.layers.set(NOINK);
  return m;
};

// ===== textures: face, outfit (canvas, cached per key) =====
type Wob = { amp: number; seed: number; wrapX?: boolean; opaque?: boolean };
/** hand-drawn wobble: a slow warp of a finished canvas (rows slide sideways, then columns slide up and down, by up to
 *  amp px): ruler-straight lines and perfect ellipses come out slightly off, the same way every time (seeded) */
const wobbleCanvas = (c: HTMLCanvasElement, o: Wob) => {
  if (o.amp < 0.25) return;
  const w = c.width, h = c.height, t = document.createElement("canvas"), g = c.getContext("2d")!;
  t.width = w; t.height = h;
  const tg = t.getContext("2d")!, ph = [81, 82, 83, 84].map((k) => rnd(o.seed, k) * 6.283), B = 2, T = 6.283;
  if (o.opaque) tg.drawImage(c, 0, 0);
  for (let y = 0; y < h; y += B) {
    const dx = o.amp * (0.65 * Math.sin((y / h) * T * 2 + ph[0]) + 0.35 * Math.sin((y / h) * T * 5 + ph[1]));
    tg.drawImage(c, 0, y, w, B, dx, y, w, B);
    if (o.wrapX) tg.drawImage(c, 0, y, w, B, dx - Math.sign(dx) * w, y, w, B);
  }
  if (!o.opaque) g.clearRect(0, 0, w, h);
  // whole periods across the width: a texture wrapped round a body still meets at the seam
  for (let x = 0; x < w; x += B) {
    const dy = o.amp * (0.65 * Math.sin((x / w) * T * 2 + ph[2]) + 0.35 * Math.sin((x / w) * T * 5 + ph[3]));
    g.drawImage(t, x, 0, B, h, x, dy, B, h);
  }
};
const canvasTex = (w: number, h: number, draw: (g: CanvasRenderingContext2D) => void, wob?: Wob) => {
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  draw(c.getContext("2d")!);
  if (wob) wobbleCanvas(c, wob);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  return t;
};
const blobCache = new Map<string, THREE.Texture>();
const blobMat = (col: string) => {
  let map = blobCache.get(col);
  if (!map) {
    map = canvasTex(128, 128, (g) => {
      const c = new THREE.Color(col), mid = new THREE.Color(col).lerp(new THREE.Color(1, 1, 1), 0.55);
      const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
      gr.addColorStop(0, "#" + c.getHexString()); gr.addColorStop(0.45, "#" + mid.getHexString()); gr.addColorStop(1, "#ffffff");
      g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
    });
    blobCache.set(col, map);
  }
  return new THREE.MeshBasicMaterial({
    map, transparent: false, depthWrite: false, fog: false, toneMapped: false,
    blending: THREE.CustomBlending, blendEquation: THREE.AddEquation, blendSrc: THREE.ZeroFactor, blendDst: THREE.SrcColorFactor,
    polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2,
  });
};
// ===== faces: the reference's kit of parts, drawn with one round pen =====
// Measured on about sixty heads pulled at random from eleven reference films, in u = 1 % of the head's visible width:
//   - one pen, about 3u wide with round ends, draws every line (brows, closed eyes, smiles). Nothing tapers.
//   - eyes sit 28u apart. The parts: a lid bar 20u long with a half-round pupil hanging from it (the default look),
//     a tall dot 9.9 x 13.3u, a ring 24.5u across with a small pupil (alarm), a happy arc 18.4 x 8.3u, a flat line
//     18u (closed), a chevron (squeezed shut).
//   - brows are plain arcs 18.5u long: 12.5u above a lid, about 21u above open eyes; angry brows are heavier and sit
//     on the lid. One brow usually rides a little higher than the other.
//   - mouths sit 18.7u under the eye line: a tiny lens 10 x 4.4u (the default), a smile arc 16.8u wide, an open smile
//     40 x 13.5u filled with ink with a row of separate teeth along its top edge, a bared-teeth box 26 x 17u, a small o.
//   - extras: a sweat drop, a soft blush.
// Each character strays a little from the pattern (spacing, sizes, tilts), the same way in every expression (seeded).
type EyeK = "lid" | "slit" | "down" | "dot" | "happy" | "closed" | "dash" | "squeeze" | "ring" | "ringHalf" | "spiral";
type MouthK = "tiny" | "frown" | "smirk" | "smirkWide" | "smile" | "smileWide" | "grin" | "laugh" | "o" | "O" | "wave" | "teeth" | "lick";
/** The mouths of a character who is speaking (RigState.mouth; rigSay gives the sequence for a line). The reference's
 *  talk kit, measured on five characters (width x height in u): mouths two to four times the size of the resting
 *  one, dark boxes with round corners, white teeth, a pink tongue. They hang from the upper lip: the top edge rises a
 *  few u, the bottom drops to about 6 u above the chin. They bend with the mood (corners up on a smiling face, down
 *  on a stern one). They replace the expression's own mouth for a frame; eyes and brows stay.
 *    line   26 x 4.6  closed, between words            pill   38 x 9   closed and pressed (m, b, p)
 *    strip  40 x 13   the teeth together (s, z, t, i)  small  28 x 13  a little open, the tongue shows (e)
 *    half   36 x 19   open, both rows of teeth (a)     wide   36 x 26  wide open, top teeth and tongue (a stressed a)
 *    round  24 x 22   an O without teeth (o, u, w)     tongue 40 x 14  the tongue between the teeth (l, th) */
export type RigMouth = "line" | "pill" | "strip" | "small" | "half" | "wide" | "round" | "tongue";
export const RIG_MOUTHS: RigMouth[] = ["line", "pill", "strip", "small", "half", "wide", "round", "tongue"];
/** eye = [screen left, screen right]; brow = [inner, outer] end offsets (u, + = down); tilt = the lid bar's slope (deg,
 *  + = inner end lower); bar = heavy straight brows sitting on the lids; raise = brows higher by that many u; skew =
 *  how much higher one brow rides than the other; pupil = a ring eye's pupil radius */
/** cock = one brow cocked (the one on the strong side): it goes up by that many u in a high arch, its inner end
 *  staying down by the nose; the other brow stays where it is. cheek = a cheekbone line on each side (cheekbone()):
 *  it cuts the round face into a jaw, on any head */
type FaceDef = { eye: [EyeK, EyeK]; brow: [number, number]; mouth: MouthK; tilt?: number; bar?: boolean; raise?: number; skew?: number; cock?: number; cheek?: boolean; pupil?: number; sweat?: boolean; blush?: boolean };
const FACES: Record<Expr, FaceDef> = {
  neutral: { eye: ["lid", "lid"], brow: [0, -0.5], mouth: "tiny" },
  stern: { eye: ["lid", "lid"], brow: [3.2, -2.2], mouth: "frown", tilt: 9, bar: true, skew: 0 },
  grin: { eye: ["happy", "happy"], brow: [-0.8, 0.6], mouth: "grin" },
  laugh: { eye: ["squeeze", "squeeze"], brow: [-1.4, 0.6], mouth: "laugh", raise: 1 },
  whistle: { eye: ["dash", "dash"], brow: [-1, -1.4], mouth: "o", raise: 2 },
  nervous: { eye: ["ring", "ring"], brow: [-2.6, 2], mouth: "wave", pupil: 2.2, sweat: true, skew: 0.3 },
  shock: { eye: ["ring", "ring"], brow: [-1.4, 0.2], mouth: "O", raise: 2.5, skew: 0.3 },
  relief: { eye: ["happy", "happy"], brow: [-1.6, 1], mouth: "smileWide", blush: true },
  relief_open: { eye: ["happy", "happy"], brow: [-1.6, 1], mouth: "grin", blush: true },
  dazed: { eye: ["spiral", "spiral"], brow: [-2.4, 2], mouth: "wave" },
  pained: { eye: ["squeeze", "lid"], brow: [-2.6, 2], mouth: "teeth", skew: 0.3 },
  smile: { eye: ["dot", "dot"], brow: [0, -0.5], mouth: "smile" },
  smile_closed: { eye: ["happy", "happy"], brow: [0, -0.5], mouth: "smile", blush: true },
  lick: { eye: ["dot", "dot"], brow: [0, -0.5], mouth: "lick" },
  sigh: { eye: ["dash", "dash"], brow: [-3.2, 2.6], mouth: "o", skew: 0.3 },
  wince: { eye: ["squeeze", "squeeze"], brow: [-3, 2.2], mouth: "teeth", skew: 0.3 },
  smug: { eye: ["lid", "lid"], brow: [0.6, -1.6], mouth: "smirk", tilt: 3, skew: 3.2 },
  sad: { eye: ["down", "down"], brow: [-3.2, 2.8], mouth: "frown", tilt: -7, skew: 0.3 },
  deadpan: { eye: ["slit", "slit"], brow: [0.6, 0.6], mouth: "tiny", raise: -2, skew: 0 },
  sleep: { eye: ["closed", "closed"], brow: [0, 0.8], mouth: "o" },
  huff: { eye: ["lid", "lid"], brow: [3.4, -2.6], mouth: "o", tilt: 10, bar: true, skew: 0 },
  happy: { eye: ["happy", "happy"], brow: [-1, -1], mouth: "smile", blush: true },
  focus: { eye: ["down", "down"], brow: [1, -0.4], mouth: "tiny", skew: 0.2 },
  // unbothered: narrowed eyes under heavy level brows that sit on the lids, the hint of a smile
  cool: { eye: ["slit", "slit"], brow: [1.0, -0.6], mouth: "smirk", tilt: 3, bar: true, skew: 0 },
  // "not a word" (for the "shh" pose): the face of "cool" with one brow cocked high and a cheekbone line on each
  // side (a cut jaw); the finger stands in front of the hint of a smile
  hush: { eye: ["slit", "slit"], brow: [1.0, -0.6], mouth: "smirkWide", tilt: 3, bar: true, skew: 0, cock: 7.5, cheek: true },
};
/** a blink in two steps: half (lid 0.5) and shut (lid 1) */
const blinkEye = (k: EyeK, lid: number): EyeK =>
  lid >= 1 ? (k === "happy" || k === "squeeze" || k === "spiral" || k === "closed" ? k : "dash")
    : lid > 0 ? (k === "dot" ? "lid" : k === "lid" || k === "down" ? "slit" : k === "ring" ? "ringHalf" : k) : k;
export type P2 = [number, number];
const quadPts = (a: P2, c: P2, b: P2, n = 22): P2[] => {
  const o: P2[] = [];
  for (let i = 0; i <= n; i++) { const t = i / n, s = 1 - t; o.push([s * s * a[0] + 2 * s * t * c[0] + t * t * b[0], s * s * a[1] + 2 * s * t * c[1] + t * t * b[1]]); }
  return o;
};
const arcPts = (cx: number, cy: number, rx: number, ry: number, a0 = 0, a1 = 360, n = 36): P2[] => {
  const o: P2[] = [];
  for (let i = 0; i <= n; i++) { const a = rad(a0 + ((a1 - a0) * i) / n); o.push([cx + rx * Math.cos(a), cy + ry * Math.sin(a)]); }
  return o;
};
/** the cheekbone line of side s (-1 / +1), in u from the middle of the eye line: from under the outer end of the eye
 *  in and down toward the corner of the mouth. Drawn CHEEK_PEN wide: lighter than the features, it is a contour. */
export const cheekbone = (s: number): P2[] => quadPts([s * 36.5, 5.5], [s * 30.5, 9.5], [s * 27.5, 17], 8);
export const CHEEK_PEN = 2.4;
const TEETH = "#ffffff", TONGUE = "#e8697a", SWEAT = "#a9dcff";
/** the pen: every line of a face is this wide (u), with round ends */
const PEN = 3.3;
/** design u -> canvas u (the head's outline is about 1 % wider than the ball's diameter the canvas spans) */
const FACE_FS = 0.99;
/** the face, front on, on a canvas that spans the head ball's diameter (W px). gaze -1..1 slides the pupils. */
const drawFace = (p: Pen, W: number, L: Look, expr: Expr, lid: number, brim: boolean, gaze: number, hand: number, fa: FaceAcc = faceAccOf(L, []), talk?: RigMouth) => {
  const F = FACES[expr], sd = L.seed, u = (W / 100) * FACE_FS, g = p.g;
  if (!F) throw new Error(`rig3d: there is no expression "${expr}" (there are: ${Object.keys(FACES).join(", ")})`);
  const jit = (k: number, a: number) => (2 * rnd(sd, 60 + k) - 1) * a * hand;
  const cx = W / 2 + jit(0, 0.7) * u, E = W / 2 - (brim ? 0 : 1.5) * u;        // the eye line (lower under a hat brim)
  const strong = rnd(sd, 71) < 0.5 ? -1 : 1;                                   // the side of the higher brow and the smirk
  const pts = (a: P2[]): P2[] => a.map(([x, y]) => [cx + x * u, E + y * u] as P2);
  const line = (a: P2[], w = PEN, col = INK) => p.stroke(pts(a), w * u, col);
  const fill = (a: P2[], col: string | null, ol = 0) => p.poly(pts(a), col, ol * u);
  const turned = (x: number, y: number, deg: number, fn: () => void) => { p.rot = [rad(deg), cx + x * u, E + y * u]; fn(); p.rot = null; };
  const sp = fa.lens ? 14.3 : 14 + jit(1, 0.6);
  // a moustache sits on the upper lip, below a pair of glasses' rims; the mouth makes room under it
  const lipY = fa.lens ? 15 : 12.4, mouthY = fa.lip ? lipY + 9.5 : 18.7;
  // accessories drawn on the face (see Acc): under = before the eyes, brows and mouth; over = after everything
  const kit: FaceKit = {
    look: L, expr, hand, sp, mouth: [jit(20, 1.1), mouthY], lip: lipY, lens: fa.lens, strong, shade: brim, cheek: !!F.cheek, PEN, INK, jit: (k, a) => jit(Math.max(k, 100), a),
    line, fill, turned, arc: arcPts, quad: quadPts, g, u, px: (x, y) => [cx + x * u, E + y * u],
  };
  const hook = (fn: (f: FaceKit) => void) => { g.save(); fn(kit); g.restore(); p.rot = null; };
  fa.under.forEach(hook);
  for (const s of [-1, 1]) {
    const i = s < 0 ? 0 : 1, kind = blinkEye(F.eye[i], lid);
    const x0 = s * sp, y0 = jit(2 + i, 0.5), sc = 1 + jit(4 + i, 0.045), gl = fa.lens;
    const rot = -s * (F.tilt ?? 0) + jit(6 + i, 1.6);
    switch (kind) {
      case "lid": case "slit": case "down": {
        const by = y0 + (kind === "down" ? -1.2 : -4.5), rx = (kind === "down" ? 4.9 : 5.25) * sc, ry = (kind === "slit" ? 4.2 : kind === "down" ? 6.6 : 9.8) * sc;
        turned(x0, by, rot, () => { fill(arcPts(x0 + gaze * 3.6, by, rx, ry, 0, 180), INK); line([[x0 - 8.4 * sc, by], [x0 + 8.4 * sc, by]], PEN + 0.1); });
        break;
      }
      case "dot": turned(x0, y0, jit(8 + i, 5), () => fill(arcPts(x0 + gaze * 2.2, y0, 4.95 * sc, 6.65 * sc), INK)); break;
      case "happy": line(arcPts(x0, y0 + 2.4, 7.7 * sc, 5.4 * sc, 190, 350)); break;
      case "closed": line(arcPts(x0, y0 - 1.4, 7.7 * sc, 3.8 * sc, 12, 168)); break;
      case "dash": turned(x0, y0, rot * 0.5, () => line([[x0 - 7.6 * sc, y0], [x0 + 7.6 * sc, y0]])); break;
      case "squeeze": line([[x0 + s * 5 * sc, y0 - 5 * sc], [x0 - s * 5.2 * sc, y0], [x0 + s * 5 * sc, y0 + 5 * sc]]); break;
      case "ring": case "ringHalf": {
        const r = 10.75 * sc, cy0 = y0 - 1, pr = (F.pupil ?? 3.3) * sc;
        if (!gl) fill(arcPts(x0, cy0, r, r), TEETH, PEN - 0.1);                // behind glasses the lens is the ring
        fill(arcPts(x0 + gaze * 4.4, cy0 + 0.4, pr, pr), INK);
        if (kind === "ringHalf") {                                             // the lid comes down over the top half
          const rr = gl ? 8.6 : r;
          g.save(); g.globalCompositeOperation = "destination-out"; fill(arcPts(x0, cy0, rr - 1.4, rr - 1.4, 180, 360), "#000"); g.restore();
          line([[x0 - rr, cy0], [x0 + rr, cy0]]);
        }
        break;
      }
      default: { const a: P2[] = []; for (let t = 2; t <= 30; t++) a.push([x0 + Math.cos(t * 0.5) * t * 0.3 * sc, y0 + Math.sin(t * 0.5) * t * 0.3 * sc]); line(a, PEN - 0.6); }
    }
    // brow: one arc of the same pen
    const open = kind === "dot" || kind === "happy" || kind === "squeeze" || kind === "spiral";
    let bh = F.bar ? 10.5 : kind === "ring" || kind === "ringHalf" ? 19.5 : open ? 21 : kind === "down" ? 13.7 : kind === "dash" || kind === "closed" ? 14.5 : 17;
    bh += (F.raise ?? 0) + (s === strong ? 0.5 : -0.5) * (F.skew ?? 1.4) * hand + jit(10 + i, 0.4);
    if (brim) bh = Math.min(bh, 16.5);
    const [dI, dO] = F.brow, bl = 7.75 * (1 + jit(12 + i, 0.06)), by = y0 - bh, arch = F.bar ? 0.4 : 2 + jit(14 + i, 0.5);
    const a: P2 = [x0 - s * bl, by + dI], b: P2 = [x0 + s * bl, by + dO];
    const ck = s === strong && !brim ? F.cock ?? 0 : 0;
    if (ck) line(quadPts(a, [x0 + s * 0.12 * bl, by - 1.9 * ck], [x0 + s * 1.06 * bl, by + dO - 0.35 * ck]), F.bar ? PEN + 0.9 : PEN);
    else line(quadPts(a, [x0 + jit(16 + i, 1.2), (a[1] + b[1]) / 2 - 2 * arch], b), F.bar ? PEN + 0.9 : PEN);
  }
  // mouth
  const mx = jit(20, 1.1), my = mouthY, ms = 1 + jit(21, 0.05);
  const openMouth = (hw: number, yc: number, sag: number, depth: number, tongue: boolean) => {
    // corners at (mx -+ hw, yc); the top edge dips `sag` in the middle (a smile), the bottom reaches yc + depth
    const A: P2 = [mx - hw, yc], B: P2 = [mx + hw, yc], top = quadPts(A, [mx, yc + 2 * sag], B, 26), bot = quadPts(B, [mx, yc + 2 * depth], A, 26);
    const shape = [...top, ...bot.slice(1, -1)], topAt = (x: number) => { const t = clamp((x - A[0]) / (2 * hw), 0, 1); return yc + 4 * sag * t * (1 - t); };
    fill(shape, INK, 1.2);
    p.clip(pts(shape), () => {
      if (tongue) fill(arcPts(mx + 0.8 * strong, yc + depth - 2.4, hw * 0.44, depth * 0.3), TONGUE);
      const n = 6, tw = 4.2, gap = 1, x00 = mx - (n * tw + (n - 1) * gap) / 2;
      for (let k = 0; k < n; k++) {                                            // separate teeth hanging from the top edge
        const xa = x00 + k * (tw + gap), xb = xa + tw, th = k === 0 || k === n - 1 ? 2.6 : 3.4, m = 0.9;
        fill([[xa, topAt(xa) + m], [xb, topAt(xb) + m], [xb, topAt(xb) + m + th - 0.7], [xb - 0.7, topAt(xb) + m + th], [xa + 0.7, topAt(xa) + m + th], [xa, topAt(xa) + m + th - 0.7]], TEETH);
      }
    });
  };
  // a speaking mouth: a dark box with round corners, hw wide each way and h high, its top edge `rise` above the
  // resting mouth's (it hangs from the upper lip and never reaches the chin); teeth = [top, bottom] rows (u high,
  // 0 = none; "all" = the teeth fill it, one dark line between the rows); tongue = [half width, half height, its
  // middle above the box's bottom edge]. The whole mouth bends with the mood.
  const mood = F.mouth === "smile" || F.mouth === "smileWide" || F.mouth === "grin" || F.mouth === "laugh" || F.mouth === "lick" ? 1 : F.mouth === "frown" || F.mouth === "teeth" ? -0.75 : 0;
  const talkMouth = (hw0: number, h0: number, r0: number, rise: number, teeth: [number, number] | "all", tongue: [number, number, number] | null) => {
    const hw = hw0 * ms, top = my - 2.3 - rise, h = Math.max(Math.min(h0, 40.6 - top), 0.62 * h0), k = h / h0, r = Math.min(r0 * k, h / 2, hw), rim = 2.6;
    const bend = (x: number) => -mood * 2.4 * ((x - mx) / hw) ** 2;                       // corners up on a smiling face
    const rbox = (ins: number): P2[] => {
      const a: P2[] = [], w = hw - ins, rr = Math.max(r - ins, 0.3), y0 = top + ins, y1 = top + h - ins;
      for (const [qx, qy, a0] of [[1, -1, -90], [1, 1, 0], [-1, 1, 90], [-1, -1, 180]]) a.push(...arcPts(mx + qx * (w - rr), (qy > 0 ? y1 : y0) - qy * rr, rr, rr, a0, a0 + 90, 8));
      return a.map(([x, y]) => [x, y + bend(x)] as P2);
    };
    fill(rbox(0), INK);
    if (h < 2 * rim + 1.5) return;                                                        // a closed mouth: a bar of ink
    const band = (y0: number, y1: number, col: string) => {                               // a strip right across, bent with the mouth
      const a: P2[] = [], b: P2[] = [];
      for (let i = 0; i <= 16; i++) { const x = mx - hw + (2 * hw * i) / 16; a.push([x, y0 + bend(x)]); b.push([x, y1 + bend(x)]); }
      fill([...a, ...b.reverse()], col);
    };
    p.clip(pts(rbox(rim)), () => {
      if (teeth === "all") { band(top, top + h, TEETH); band(top + h / 2 - 0.65, top + h / 2 + 0.65, INK); }
      if (tongue) fill(arcPts(mx + 0.6 * strong, top + h - rim - tongue[2] * k, tongue[0] * ms, tongue[1] * k), TONGUE);
      if (teeth !== "all") {
        if (teeth[0]) band(top, top + rim + teeth[0] * k, TEETH);
        if (teeth[1]) band(top + h - rim - teeth[1] * k, top + h, TEETH);
      }
    });
  };
  turned(mx, my, jit(22, 2.5), () => {
    if (talk) {
      switch (talk) {
        case "line": talkMouth(13, 4.6, 2.3, 0, [0, 0], null); break;
        case "pill": talkMouth(19, 9, 4.5, 1.3, [0, 0], null); break;
        case "strip": talkMouth(20, 13, 6, 2.3, "all", null); break;
        case "small": talkMouth(14, 13, 6, 1.5, [2.2, 0], [8.2, 4.6, 1.2]); break;
        case "half": talkMouth(18, 19, 8, 2.9, [3.9, 2.8], [9.5, 3.6, 5.4]); break;
        case "wide": talkMouth(18, 26, 9.5, 4.5, [3.6, 0], [11, 7.4, 3.2]); break;
        case "round": talkMouth(12, 22, 11, 3.2, [0, 0], [6.4, 3.8, 1]); break;
        case "tongue": talkMouth(20, 14, 6, 2.3, [3.2, 0], [7.6, 4.4, 4.4]); break;
      }
      return;
    }
    switch (F.mouth) {
      case "tiny": fill([...quadPts([mx - 4.6, my + 0.2], [mx - 0.4, my - 3.9], [mx + 4.6, my - 0.3], 12), ...quadPts([mx + 4.6, my - 0.3], [mx + 0.6, my + 4.3], [mx - 4.6, my + 0.2], 12).slice(1, -1)], INK, 0.7); break;
      case "frown": line(quadPts([mx - 6.5 * ms, my + 1.8], [mx, my - 5], [mx + 6.5 * ms, my + 1.8])); break;
      case "smirk": line(quadPts([mx - strong * 5.6, my + 1.3], [mx + strong * 1, my + 4.6], [mx + strong * 5.9, my - 3.3])); break;
      // the same smirk half as wide again: both of its ends show beside a finger held in front of it
      case "smirkWide": line(quadPts([mx - strong * 8.8, my + 1.2], [mx + strong * 1.6, my + 5.6], [mx + strong * 9.4, my - 3.8])); break;
      case "smile": line(quadPts([mx - 6.9 * ms, my - 1.6], [mx + 0.5 * strong, my + 5.4], [mx + 6.9 * ms, my - 1.6])); break;
      case "smileWide": line(quadPts([mx - 12 * ms, my - 2.6], [mx, my + 9.4], [mx + 12 * ms, my - 2.6])); break;
      case "grin": openMouth(20 * ms, my - 6.5, 2.75, 13.5, false); break;
      case "laugh": openMouth(20.5 * ms, my - 9.5, 2.2, 19.5, true); break;
      case "o": fill(arcPts(mx + strong * 2.4, my + 0.4, 3.4 * ms, 4.3 * ms), INK); break;
      case "O": {
        const o = arcPts(mx, my + 2.2, 8.4 * ms, 10.2 * ms);
        fill(o, INK); p.clip(pts(o), () => fill(arcPts(mx, my + 10, 5.4, 3.6), TONGUE));
        break;
      }
      case "wave": { const a: P2[] = [], ph = rnd(sd, 83) * 6.283; for (let k = 0; k <= 24; k++) a.push([mx - 9 + k * 0.75, my + 2.1 * Math.sin(k * 0.615 + ph)]); line(a); break; }
      case "teeth": {
        const hw = 11.5 * ms, hh = 7, r = 5.2, yc = my + 0.5, box: P2[] = [];
        for (const [qx, qy, a0] of [[1, -1, -90], [1, 1, 0], [-1, 1, 90], [-1, -1, 180]]) box.push(...arcPts(mx + qx * (hw - r), yc + qy * (hh - r), r, r, a0, a0 + 90, 8));
        fill(box, TEETH, PEN - 0.1);
        line([[mx - hw, yc], [mx + hw, yc]], PEN - 0.7);
        for (const k of [-0.5, 0, 0.5]) line([[mx + k * hw, yc - hh], [mx + k * hw, yc + hh]], PEN - 0.7);
        break;
      }
      case "lick": line(quadPts([mx - 6.9 * ms, my - 1.6], [mx, my + 5.4], [mx + 6.9 * ms, my - 1.6])); fill(arcPts(mx + strong * 6.3, my + 3.6, 3.3, 4.3), TONGUE, 2.2); break;
    }
  });
  if (F.cheek) for (const s of [-1, 1]) line(cheekbone(s), CHEEK_PEN);
  if (F.blush) for (const s of [-1, 1]) {
    const bx = cx + s * 20.5 * u, by = E + 9.6 * u, r = 6.6 * u, gr = g.createRadialGradient(0, 0, 0, 0, 0, r);
    gr.addColorStop(0, "rgba(238,118,140,0.5)"); gr.addColorStop(0.55, "rgba(238,118,140,0.3)"); gr.addColorStop(1, "rgba(238,118,140,0)");
    g.save(); g.globalCompositeOperation = "destination-over"; g.translate(bx, by); g.scale(1, 0.6); g.fillStyle = gr; g.beginPath(); g.arc(0, 0, r, 0, 7); g.fill(); g.restore();
  }
  if (F.sweat) turned(-strong * 35, -11, -strong * 14, () => fill([[-strong * 35 + 0.6, -19], ...arcPts(-strong * 35, -11, 3.3, 3.7, -52, 232, 20)], SWEAT, 2.2));
  if (L.glasses && fa.own) {
    const r = 12.2, gc = L.glassCol ?? "#2a2230";
    for (const s of [-1, 1]) {
      if (L.glasses === "round") p.poly(pts(arcPts(s * sp, -0.6, r, r * 0.94)), null, 2.4 * u);
      else { const box: P2[] = []; for (const [qx, qy, a0] of [[1, -1, -90], [1, 1, 0], [-1, 1, 90], [-1, -1, 180]]) box.push(...arcPts(s * sp + qx * (r - 3), -0.6 + qy * (r * 0.8 - 3), 3, 3, a0, a0 + 90, 6)); p.poly(pts(box), null, 2.4 * u); }
      line([[s * (sp + r), -2.6], [s * 47, -5.6]], 2.1, gc);
    }
    line([[-sp + r, -1.6], [sp - r, -1.6]], 2.1, gc);
  }
  fa.over.forEach(hook);
};
const FACE_PX = 1024, FACE_CACHE_MAX = 160;
const faceCache = new Map<string, THREE.CanvasTexture>();
/** the face drawing for one look / expression / lid state / gaze step: a canvas that spans the head ball's diameter.
 *  True LRU; three lid states and five gaze steps only. */
const faceTex = (L: Look, expr: Expr, lid: number, brim: boolean, hand = 1, gaze = 0, fa: FaceAcc = faceAccOf(L, []), talk?: RigMouth) => {
  const lq = lid >= 1 ? 1 : lid > 0 ? 0.5 : 0, gq = Math.round(clamp(gaze, -1, 1) * 2) / 2;
  // (accessories that draw on the face are handed the whole look: two looks that share a seed may differ in what they read)
  const key = `${L.seed}|${expr}|${lq}|${gq}|${brim ? 1 : 0}|${L.glasses ?? ""}|${L.glassCol ?? ""}|${hand}|${fa.own ? 1 : 0}|${fa.key}${fa.under.length || fa.over.length ? "|" + JSON.stringify(L) : ""}${talk ? "|say:" + talk : ""}`;
  let t = faceCache.get(key);
  if (t) { faceCache.delete(key); faceCache.set(key, t); return t; }
  t = canvasTex(FACE_PX, FACE_PX, (g) => drawFace(new Pen(g), FACE_PX, L, expr, lq, brim, gq, hand, fa, talk), { amp: FACE_PX * 0.0045 * hand, seed: L.seed });
  t.generateMipmaps = true; t.minFilter = THREE.LinearMipmapLinearFilter;
  faceCache.set(key, t);
  while (faceCache.size > FACE_CACHE_MAX) { const k0 = faceCache.keys().next().value!; faceCache.get(k0)!.dispose(); faceCache.delete(k0); }
  return t;
};

/** the face drawing as a canvas (expression sheets, QA); acc = accessories drawn on the face */
export const rigFaceCanvas = (L: Look, expr: Expr, o: { lid?: number; brim?: boolean; hand?: number; gaze?: number; acc?: Acc[]; mouth?: RigMouth } = {}) =>
  faceTex(L, expr, o.lid ?? 0, !!o.brim, o.hand ?? 1, o.gaze ?? 0, faceAccOf(L, o.acc ?? []), o.mouth).image as HTMLCanvasElement;
/** One spoken line: from .. to in seconds; syl = its syllables (Chinese: one a character; default: 5.5 a second);
 *  stress = the syllables said loudest (0 = the first): their mouth is the widest; seed = which mouths it picks (give
 *  each character its own). */
export type RigLine = { from: number; to: number; syl?: number; stress?: number[]; seed?: number };
const NARROWER: Record<RigMouth, RigMouth> = { wide: "half", half: "small", round: "small", tongue: "strip", small: "strip", strip: "pill", pill: "line", line: "line" };
/** the mouths of syllable k of a line: [open, a little less, closing, closed] */
const sylMouths = (seed: number, k: number, stressed: boolean): [RigMouth, RigMouth, RigMouth, RigMouth] => {
  const pick = (j: number): RigMouth => { const x = rnd(seed + 0.731 * j, 311); return x < 0.3 ? "half" : x < 0.5 ? "small" : x < 0.66 ? "round" : x < 0.84 ? "strip" : x < 0.93 ? "wide" : "tongue"; };
  let a = stressed ? "wide" : pick(k);
  if (!stressed && k > 0 && a === pick(k - 1)) a = a === "half" ? "round" : "half";      // two syllables in a row never open the same way
  const b = NARROWER[a], c = b === "strip" || b === "pill" ? "pill" : "strip";
  return [a, b, c, rnd(seed + 0.731 * k, 312) < 0.28 ? "pill" : "line"];
};
/** The mouth at time t (seconds) of a character who speaks the given lines; undefined outside them (the expression's
 *  own mouth shows). Timed as the reference does it, measured at 30 frames a second: the mouth opens 2 frames before
 *  the sound; every syllable is one open-and-close of 5 to 6 frames (open, a little less, closing, closed: a new
 *  drawing about every frame and a half, none held longer than 3 frames); after the last syllable it settles for 8
 *  frames (a small mouth, then the closed line) and gives way to the expression's own mouth.
 *  Only for lines a character says. The reference never moves a mouth under the narrator. */
export const rigSay = (t: number, lines: RigLine | RigLine[], fps = 30): RigMouth | undefined => {
  const f = t * fps + 1e-6;
  for (const ln of Array.isArray(lines) ? lines : [lines]) {
    const n = Math.max(1, Math.round(ln.syl ?? (ln.to - ln.from) * 5.5)), fd = Math.max(((ln.to - ln.from) * fps) / n, 2);
    const tf = Math.floor(f) + 2 - ln.from * fps;                                         // 2 frames ahead of the sound
    if (tf < 0 || tf >= n * fd + 8) continue;
    const k = Math.floor(tf / fd);
    if (k >= n) return tf - n * fd < 3 ? "small" : "line";
    const u = (tf - k * fd) / fd, m = sylMouths(ln.seed ?? 0, k, !!ln.stress?.includes(k));
    // a fast talker (under 4.5 frames a syllable) has no time for the closing mouth
    return fd < 4.5 ? (u < 0.5 ? m[0] : u < 0.78 ? m[1] : m[3]) : u < 0.42 ? m[0] : u < 0.68 ? m[1] : u < 0.86 ? m[2] : m[3];
  }
  return undefined;
};
/** A mouth that keeps talking (no line timing): rigSay with an endless line of 5.5 syllables a second. */
export const rigTalk = (t: number, seed = 0, fps = 30): RigMouth => rigSay(t, { from: 0, to: Math.max(t, 0) + 2, syl: Math.round((Math.max(t, 0) + 2) * 5.5), seed }, fps) ?? "line";
/** The mouth in frame f from the voice itself: env[i] = how loud the voice is in frame i, 0..1 of the line's loudest.
 *  The reference's rule of thumb: read the sound 2 frames ahead; under 0.15 the mouth is closed, to 0.35 the teeth are
 *  together, to 0.55 a little open, to 0.8 open, above that wide open; an open mouth is never held longer than 3
 *  frames (the fourth is one step narrower). undefined = the voice has been silent for 8 frames. */
export const rigSayEnv = (f: number, env: ArrayLike<number>): RigMouth | undefined => {
  const at = (i: number) => { const e = i + 2 >= 0 && i + 2 < env.length ? env[i + 2] : 0; return e < 0.15 ? 0 : e < 0.35 ? 1 : e < 0.55 ? 2 : e < 0.8 ? 3 : 4; };
  const lvl = at(f);
  if (!lvl) { for (let i = 1; i <= 8; i++) if (at(f - i)) return i <= 3 ? "pill" : "line"; return undefined; }
  let run = 0;
  while (run < 12 && at(f - run - 1) === lvl) run++;
  const m = (["line", "strip", "small", "half", "wide"] as RigMouth[])[lvl];
  return run % 4 === 3 ? NARROWER[m] : m;
};
/** head layers together: shifts, tilts and squashes add, scales multiply */
export const rigHeadAdd = (...hs: (RigHead | undefined)[]): RigHead | undefined => {
  const o = { dx: 0, dy: 0, tilt: 0, scale: 1, squash: 0 };
  let any = false;
  for (const h of hs) if (h) { any = true; o.dx += h.dx ?? 0; o.dy += h.dy ?? 0; o.tilt += h.tilt ?? 0; o.scale *= h.scale ?? 1; o.squash += h.squash ?? 0; }
  return any ? o : undefined;
};
const keyed = (f: number, keys: [number, number][]) => {                                 // straight lines between [frame, value] keys
  if (f <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) if (f <= keys[i][0]) { const [f0, v0] = keys[i - 1], [f1, v1] = keys[i]; return v0 + ((v1 - v0) * (f - f0)) / (f1 - f0); }
  return keys[keys.length - 1][1];
};
export type RigAccent = "pop" | "squash" | "nod" | "jolt" | "shake" | "laugh" | "lean";
/** A head accent, timed as the reference times them at 30 frames a second. t = seconds since it began; the answer is
 *  the head layer for that moment (RigState.head), undefined once it is over.
 *    pop     a stressed word: 7 % larger within a frame, held 2 frames, back over 3
 *    squash  a landing, a blow, a hard word: a tenth flatter for 2 frames, a twentieth taller for 2, settled by frame 8
 *    nod     "yes", or the first word of a line: dips a tenth of its radius, back by frame 7
 *    jolt    a start: up a fifth of its radius in 2 frames and a little taller, back by frame 8
 *    shake   "no": leans right, left, right over 12 frames (5 degrees)
 *    laugh   rocks for as long as it lasts (dur seconds): 2 degrees and 0.056 radii each way, once every 6.5 frames
 *    lean    leans to one side (dir 1 = screen right) for as long as it lasts (dur seconds): 4 degrees, 5 frames in and out
 *  amp scales it (1). */
export const rigHeadAccent = (kind: RigAccent, t: number, o: { dur?: number; dir?: 1 | -1; amp?: number } = {}, fps = 30): RigHead | undefined => {
  const f = Math.floor(t * fps + 1e-6), a = o.amp ?? 1, n = Math.round((o.dur ?? 1) * fps), dir = o.dir ?? 1;
  if (f < 0) return undefined;
  switch (kind) {
    case "pop": return f >= 6 ? undefined : { scale: 1 + 0.07 * a * keyed(f, [[0, 0.6], [1, 1], [3, 1], [6, 0]]) };
    case "squash": return f >= 8 ? undefined : { squash: a * keyed(f, [[0, 0.06], [1, 0.1], [2, 0.1], [3, -0.05], [4, -0.05], [6, 0.015], [8, 0]]) };
    case "nod": return f >= 7 ? undefined : { dy: -0.1 * a * keyed(f, [[0, 0.5], [1, 1], [3, 1], [7, 0]]) };
    case "jolt": return f >= 8 ? undefined : { dy: 0.2 * a * keyed(f, [[0, 0.55], [1, 1], [3, 1], [8, 0]]), squash: -0.04 * a * keyed(f, [[0, 1], [2, 1], [5, 0]]) };
    case "shake": return f >= 12 ? undefined : { tilt: 5 * a * dir * Math.sin((f / 12) * Math.PI * 3) * keyed(f, [[0, 1], [8, 1], [12, 0]]) };
    case "laugh": return f >= n ? undefined : { tilt: 2 * a * Math.sin((f / 6.5) * Math.PI * 2 + 1.2), dy: 0.056 * a * Math.sin((f / 6.5) * Math.PI * 2) };
    case "lean": return f >= n ? undefined : { tilt: 4 * a * dir * Math.min(keyed(f, [[0, 0.2], [5, 1]]), keyed(n - f, [[0, 0], [5, 1]])) };
  }
};
/** A spoken line acted out the way the reference does it: the mouth, the head and the eyelids together. Put the
 *  answer into the state: Object.assign(state, rigSpeak(t, lines, id)); blink is only given at the moments it blinks
 *  (use it before your own: blink: sp.blink ?? ownBlink).
 *    mouth  rigSay.
 *    head   a small nod on the first syllable, a pop on every stressed syllable (2 frames ahead of the sound, with the
 *           mouth), and a lean of a few degrees held through the line, to the other side on the next line.
 *    blink  shut for a frame, half shut on either side, just before the mouth opens and again as the line ends: the
 *           reference blinks at the joints of a line, never inside it.
 *  id = the character (which mouths it picks, which way it leans first). */
export const rigSpeak = (t: number, lines: RigLine | RigLine[], id = 0, fps = 30): { mouth?: RigMouth; head?: RigHead; blink?: number } => {
  const ls = (Array.isArray(lines) ? lines : [lines]).map((l, i) => ({ ...l, seed: l.seed ?? id + 0.37 * i })), f = Math.floor(t * fps + 1e-6);
  const out: { mouth?: RigMouth; head?: RigHead; blink?: number } = { mouth: rigSay(t, ls, fps) };
  const hs: (RigHead | undefined)[] = [];
  ls.forEach((ln, i) => {
    const f0 = Math.round(ln.from * fps) - 2, f1 = Math.round(ln.to * fps), n = Math.max(1, Math.round(ln.syl ?? (ln.to - ln.from) * 5.5)), fd = (f1 - f0 - 2) / n;
    const dir = (Math.floor(rnd(id, 331) * 2) + i) % 2 ? 1 : -1;
    hs.push(rigHeadAccent("lean", (f - f0) / fps, { dur: (f1 - f0 + 6) / fps, dir, amp: 0.75 }, fps), rigHeadAccent("nod", (f - f0) / fps, { amp: 0.6 }, fps));
    for (const k of ln.stress ?? []) hs.push(rigHeadAccent("pop", (f - (f0 + Math.round(k * fd))) / fps, {}, fps));
    for (const fb of [f0 - 3, f1 + 2]) if (f >= fb && f < fb + 3) out.blink = f === fb + 1 ? 1 : 0.5;
  });
  out.head = rigHeadAdd(...hs);
  return out;
};
export const RIG_EXPRS = Object.keys(FACES) as Expr[];

const shadeHex = (c: string, k: number) => { const x = new THREE.Color(c); x.multiplyScalar(k); return "#" + x.getHexString(); };
const OUT_W = 1024, OUT_H = 512;
/** outfit wrapped round the body: x = around (front centre at 0.5, the person's left toward +x), y = top -> bottom.
 *  Details are flat fills with ink-weight lines (about half the silhouette line). */
const outfitTex = (L: Look, hand: number, accs: Acc[], d: Dim) => canvasTex(OUT_W, OUT_H, (g) => {
  const W = OUT_W, H = OUT_H, cx = W / 2, top = L.topCol, seam = shadeHex(top, 0.36), LW = 9, p = new Pen(g);
  g.fillStyle = top; g.fillRect(0, 0, W, H);
  const pantsY = 0.79 * H;
  const fillPoly = (pts: [number, number][], col: string, stroke?: string, lw = LW) => {
    g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath();
    g.fillStyle = col; g.fill(); if (stroke) { g.strokeStyle = stroke; g.lineWidth = lw; g.lineJoin = "round"; g.stroke(); }
  };
  const line = (pts: [number, number][], col: string, lw: number) => {
    g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.strokeStyle = col; g.lineWidth = lw; g.lineCap = "round"; g.lineJoin = "round"; g.stroke();
  };
  const button = (x: number, y: number, col: string) => { g.beginPath(); g.arc(x, y, 8, 0, 7); g.fillStyle = col; g.fill(); g.strokeStyle = seam; g.lineWidth = 4; g.stroke(); };
  const collar = (col: string, h = 0.055) => { g.fillStyle = col; g.fillRect(0, 0, W, h * H); line([[0, h * H], [W, h * H]], seam, LW - 2); };
  // accessories: what is worn under a coat (a tie) is drawn right after the look's own top, inside the opening of an
  // open top (a cardigan, a jacket); the rest is drawn over the top and the trousers, in the order given, and under
  // the look's own lanyard and tag (which give way to an accessory that takes their slot)
  const drawn = accs.filter((a) => a.outfit || a.outfitUnder), has = (sl: AccSlot) => accs.some((a) => a.slots.includes(sl));
  const kit = drawn.length ? outfitKit(g, L, hand, d, top, seam, LW) : null;
  let underDone = false;
  const under = (clip?: [number, number][]) => {
    underDone = true;
    if (kit) for (const a of drawn) if (a.outfitUnder) {
      g.save();
      if (clip) { g.beginPath(); clip.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.clip(); }
      a.outfitUnder(kit); g.restore();
    }
  };
  switch (L.top) {
    case "hoodie": {
      collar(L.inner ?? shadeHex(top, 0.7), 0.06);
      fillPoly([[0.62 * W, 0], [0.88 * W, 0], [0.84 * W, 0.2 * H], [0.75 * W, 0.26 * H], [0.66 * W, 0.2 * H]], shadeHex(top, 0.84), seam);
      fillPoly([[cx - 0.1 * W, 0.5 * H], [cx + 0.1 * W, 0.5 * H], [cx + 0.125 * W, 0.7 * H], [cx - 0.125 * W, 0.7 * H]], shadeHex(top, 0.84), seam);
      for (const s of [-1, 1]) { line([[cx + s * 0.022 * W, 0.05 * H], [cx + s * 0.026 * W, 0.33 * H]], L.trim ?? "#f4f1e8", 8); g.fillStyle = L.trim ?? "#f4f1e8"; g.beginPath(); g.arc(cx + s * 0.026 * W, 0.34 * H, 7, 0, 7); g.fill(); }
      g.fillStyle = shadeHex(top, 0.8); g.fillRect(0, pantsY - 0.05 * H, W, 0.05 * H); line([[0, pantsY - 0.05 * H], [W, pantsY - 0.05 * H]], seam, LW - 3);
      break;
    }
    case "tee": collar(shadeHex(top, 0.74), 0.045); break;
    case "sweater": {
      collar(shadeHex(top, 0.74), 0.06);
      g.fillStyle = L.trim ?? "#eef1e6"; g.fillRect(0, 0.3 * H, W, 0.07 * H); g.fillRect(0, 0.42 * H, W, 0.03 * H);
      g.fillStyle = shadeHex(top, 0.78); g.fillRect(0, pantsY - 0.06 * H, W, 0.06 * H); line([[0, pantsY - 0.06 * H], [W, pantsY - 0.06 * H]], seam, LW - 3);
      break;
    }
    case "cardigan": case "jacket": {
      const inner = L.inner ?? "#f6f4ee", open = L.top === "jacket" ? 0.07 : 0.05, front: [number, number][] = [[cx - open * W, 0], [cx + open * W, 0], [cx + 0.03 * W, pantsY], [cx - 0.03 * W, pantsY]];
      fillPoly(front, inner);
      under(front);
      line([[cx - open * W, 0], [cx - 0.03 * W, pantsY]], seam, LW); line([[cx + open * W, 0], [cx + 0.03 * W, pantsY]], seam, LW);
      if (L.top === "jacket") for (const s of [-1, 1]) fillPoly([[cx + s * open * W, 0], [cx + s * (open + 0.06) * W, 0], [cx + s * 0.05 * W, 0.3 * H]], shadeHex(top, 0.82), seam, LW - 2);
      else for (let i = 0; i < 4; i++) button(cx + 0.047 * W, (0.18 + i * 0.15) * H, shadeHex(top, 0.62));
      for (const s of [-1, 1]) fillPoly([[cx + s * 0.1 * W, 0.52 * H], [cx + s * 0.18 * W, 0.52 * H], [cx + s * 0.18 * W, 0.66 * H], [cx + s * 0.1 * W, 0.66 * H]], shadeHex(top, 0.84), seam, LW - 2);
      break;
    }
    case "run": {
      collar(L.trim ?? "#f4f1e8", 0.04);
      g.fillStyle = L.trim ?? "#f4f1e8"; for (const s of [-1, 1]) g.fillRect(cx + s * 0.2 * W - 0.025 * W, 0, 0.05 * W, pantsY);
      break;
    }
  }
  const trousers = () => {
    g.fillStyle = L.botCol; g.fillRect(0, pantsY, W, H - pantsY);
    line([[0, pantsY], [W, pantsY]], shadeHex(L.botCol, 0.45), LW - 2);
    if (L.bottom === "skirt") for (let x = 0; x < W; x += W / 24) line([[x, pantsY + 0.03 * H], [x, H]], shadeHex(L.botCol, 0.7), 4);
  };
  if (!underDone) under();
  if (kit) {
    trousers();
    // a coat goes on first, whatever the order in the list: what is worn over it (straps, a badge) stays on top
    for (const a of [...drawn.filter((x) => x.slots.includes("coat")), ...drawn.filter((x) => !x.slots.includes("coat"))]) if (a.outfit) { g.save(); a.outfit(kit); g.restore(); }
  }
  if (L.lanyard && !has("neck")) {
    const by = 0.42 * H;
    line([[cx - 0.07 * W, 0], [cx, by - 0.06 * H], [cx + 0.07 * W, 0]], L.lanyard, 9);
    fillPoly([[cx - 0.035 * W, by - 0.06 * H], [cx + 0.035 * W, by - 0.06 * H], [cx + 0.035 * W, by + 0.1 * H], [cx - 0.035 * W, by + 0.1 * H]], "#f7f6f0", INK, 5);
    g.fillStyle = L.lanyard; g.fillRect(cx - 0.035 * W + 2, by - 0.06 * H + 2, 0.07 * W - 4, 0.04 * H);
  }
  if (L.tag && !has("chest")) niTag(p, cx + 0.085 * W, 0.27 * H, 0.06 * W, 0.12 * H, 3);
  if (!drawn.length) trousers();
}, { amp: 7 * hand, seed: L.seed + 3, wrapX: true, opaque: true });

/** hairline: degrees from the crown the hair reaches, by azimuth from the face side (+ toward the person's left).
 *  The highest brows reach about 57 deg from the crown, so the fringe stops near 52 (the face is drawn over the
 *  hair where the two meet) and the sides drop behind the face. */
export const hairLine = (L: Look, az: number): number => {
  const c = Math.cos(az), back = (1 - c) / 2, part = L.part ?? 1, front = (1 - back) ** 2;
  switch (L.hair) {
    case "buzz": return 51 + 61 * back;
    case "curly": return 50 + 67 * back + 4 * Math.abs(Math.sin(az * 6));
    case "bob": return 52 + 12 * smooth((Math.abs(az) - rad(48)) / rad(16)) + 59 * smooth((Math.abs(az) - rad(64)) / rad(30)) + 6 * back;
    case "long": return 52 + 10 * smooth((Math.abs(az) - rad(46)) / rad(16)) + 67 * smooth((Math.abs(az) - rad(62)) / rad(30)) + 6 * back;
    case "side": return 51 + 63 * back + 12 * (smooth((az * part + 0.9) / 1.8) - 0.5) * front;
    case "bun": case "ponytail": return 52 + 60 * back;
    default: return 52 + 63 * back + 8 * (smooth((az * part + 0.9) / 1.8) - 0.5) * front;
  }
};
/** the hairline under a hat whose rim sits `rim` degrees from the crown: no fringe in front (under a brim it would
 *  show as a hair-thin sliver along the rim), and from the temples back the hair comes out from under the rim as a
 *  block whose front edge crosses the rim steeply, the way the reference draws hair under a cap */
const hairLineHat = (L: Look, az: number, rim: number): number =>
  lerp(rim - 22, Math.max(hairLine(L, az), rim + 11), smooth((Math.abs(az) - rad(50)) / rad(12)));
/** a cap's peak, in head units (the head's radius = 1) before the head's warp: a wedge that grows out of the gap
 *  under the cap's rim (rimR, rimY = the rim circle's radius and height), thins toward a blunt front edge and never
 *  touches the head. It carries no ink hull: a thin plate's hull shows as a hair-thin line or as a row of dots
 *  whenever the plate is seen edge on, and wherever it meets the head. Its ink edge is painted on it instead
 *  (uv.y = 1 at the front edge, falling by 1 per PEAK_OUT head units toward the back; see peakTex). */
const PEAK_OUT = 0.24;
const peakGeo = (rimR: number, rimY: number, toM: (v: V3) => V3) => {
  const NA = 28, NT = 6, A0 = rad(52), TH = 0.05, FRONT = 0.42, DROOP = 0.3, LEN = 0.42, rIn = rimR - 0.028, yTop = rimY + 0.012, W = 2 * (NT + 1);
  const pos: number[] = [], uv: number[] = [], idx: number[] = [], v = V();
  for (let i = 0; i <= NA; i++) {
    const a = -A0 + (2 * A0 * i) / NA, sh = Math.sqrt(Math.max(1 - (a / A0) ** 2, 0.0025));
    const rOut = rIn + LEN * sh, yOut = yTop - 0.012 - DROOP * (rOut - rIn);
    for (let k = 0; k < W; k++) {                                              // top rings 0..NT (back -> front), then bottom rings 0..NT
      const top = k <= NT, t = (top ? k : k - NT - 1) / NT, r = lerp(rIn, rOut, t), y = lerp(yTop, yOut, t) - (top ? 0 : TH * sh * lerp(1, FRONT, t));
      toM(v.set(r * Math.sin(a), y, r * Math.cos(a)));
      pos.push(v.x, v.y, v.z); uv.push(i / NA, 1 - (rOut - r) / PEAK_OUT);
    }
  }
  const T = (i: number, j: number) => i * W + j, B = (i: number, j: number) => i * W + NT + 1 + j;
  for (let i = 0; i < NA; i++) {
    for (let j = 0; j < NT; j++) {
      idx.push(T(i, j), T(i, j + 1), T(i + 1, j), T(i + 1, j), T(i, j + 1), T(i + 1, j + 1));
      idx.push(B(i, j), B(i + 1, j), B(i, j + 1), B(i + 1, j), B(i + 1, j + 1), B(i, j + 1));
    }
    idx.push(T(i, 0), T(i + 1, 0), B(i, 0), T(i + 1, 0), B(i + 1, 0), B(i, 0));                     // the back wall, inside the gap
    idx.push(T(i, NT), B(i, NT), T(i + 1, NT), T(i + 1, NT), B(i, NT), B(i + 1, NT));               // the blunt front edge
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx); g.computeVertexNormals(); g.computeBoundingSphere();
  return g;
};
/** the peak's painted ink edge: a grey map that multiplies its colour, dark over the last fifth toward the front edge */
let peakTexC: THREE.Texture | null = null;
const peakTex = () => (peakTexC ??= canvasTex(16, 160, (g) => { g.fillStyle = "#ffffff"; g.fillRect(0, 0, 16, 160); g.fillStyle = "#3d3d3d"; g.fillRect(0, 0, 16, 32); }));
/** a hat's drawn detail, as a grey map that multiplies its colour (u = round the head, v = 1 at the top .. 0 at the
 *  rim): a cap has six panel seams and a stitched line above the rim, a beanie is ribbed */
const hatTexCache = new Map<string, THREE.Texture>();
const hatTex = (kind: "cap" | "beanie") => {
  let t = hatTexCache.get(kind);
  if (!t) {
    t = canvasTex(768, 128, (g) => {
      g.fillStyle = "#ffffff"; g.fillRect(0, 0, 768, 128);
      if (kind === "cap") {
        g.fillStyle = "#6e6e6e";
        for (let k = 0; k < 6; k++) g.fillRect(((k + 0.5) / 6) * 768 - 5, 0, 10, 128);
        g.fillRect(0, 128 - 17, 768, 5);
      } else {
        for (let k = 0; k < 24; k++) { g.fillStyle = "#b9b9b9"; g.fillRect((k / 24) * 768 + 10, 0, 12, 128); }
      }
    });
    t.wrapS = THREE.RepeatWrapping;
    hatTexCache.set(kind, t);
  }
  return t;
};
/** how the hair is drawn on the head (the shader's uHairPart): x = the parting's azimuth (rad, + = the person's
 *  left), y = the side the lighter streaks lie on (+-1, or 0 = both sides of a middle parting), z = streaks on / off,
 *  w = the ink parting on / off */
const hairDraw = (L: Look, hand: number, hat = false) => {
  const part = L.part ?? 1;
  if (hat) return new THREE.Vector4(0, 0, 0, 0);                              // under a hat: a flat block, no thin lines at the rim
  switch (L.hair) {
    case "buzz": case "curly": return new THREE.Vector4(0, 0, 0, 0);
    case "bob": case "long": case "bun": case "ponytail": return new THREE.Vector4(part * 0.1, 0, hand, hand);
    default: return new THREE.Vector4(part * 0.52, -part, hand, hand);
  }
};
/** the hairline as a lookup for the head's shader: HAIR_N samples round the head, 16 bits each (R high, G low) of
 *  degrees / 180. The hair is painted on the ball itself, with an anti-aliased edge worked out per pixel. */
const hairTexCache = new Map<string, THREE.DataTexture>();
const hairTex = (L: Look, rim = 0) => {
  const key = `${L.hair}|${L.part ?? 1}|${rim}`;
  let t = hairTexCache.get(key);
  if (!t) {
    const data = new Uint8Array(HAIR_N * 4);
    for (let k = 0; k < HAIR_N; k++) {
      const az = -Math.PI + ((k + 0.5) / HAIR_N) * 2 * Math.PI, v = Math.round((clamp(rim ? hairLineHat(L, az, rim) : hairLine(L, az), 8, 150) / 180) * 65535);
      data[k * 4] = v >> 8; data[k * 4 + 1] = v & 255; data[k * 4 + 3] = 255;
    }
    t = new THREE.DataTexture(data, HAIR_N, 1, THREE.RGBAFormat, THREE.UnsignedByteType);
    t.wrapS = THREE.RepeatWrapping; t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestFilter; t.generateMipmaps = false; t.needsUpdate = true;
    hairTexCache.set(key, t);
  }
  return t;
};

// ===== geometry helpers =====
const _p = V(), _tg = V(), _n = V(), _b = V(), _u1 = V(), _u2 = V(), _pp = V();
/** limb path rings: N1 on the first bone, NC round the joint, N2 on the second bone */
const N1 = 8, NC = 16, N2 = 8, SEG = N1 + NC + N2, FILLET = 0.45;
/** ring i (0..SEG) of a limb: a bone, a rounded corner at the joint j (a quadratic that starts FILLET of the shorter
 *  bone before it), a bone. bow = [b1, b2]: each bone bends sideways in the limb's plane by that share of its length
 *  (a drawn line is never ruler straight; + = toward the inside of the joint), with no offset and no slope at either
 *  end of the bone. Writes the point (and the unit tangent). */
const limbAt = (a: V3, j: V3, c: V3, i: number, out: V3, tan?: V3, bow?: [number, number]) => {
  _u1.copy(j).sub(a); const l1 = _u1.length() || 1e-6; _u1.divideScalar(l1);
  _u2.copy(c).sub(j); const l2 = _u2.length() || 1e-6; _u2.divideScalar(l2);
  const rho = FILLET * Math.min(l1, l2);
  if (i > N1 && i < N1 + NC) {
    const t = (i - N1) / NC, u = 1 - t;
    out.copy(j).addScaledVector(_u1, -rho * u * u).addScaledVector(_u2, rho * t * t);
    if (tan) { tan.copy(_u1).multiplyScalar(u).addScaledVector(_u2, t); if (tan.lengthSq() < 1e-8) tan.copy(_u2); tan.normalize(); }
    return out;
  }
  const first = i <= N1, q = first ? i / N1 : (i - N1 - NC) / N2, len = (first ? l1 : l2) - rho;
  if (first) out.copy(a).addScaledVector(_u1, len * q); else out.copy(j).addScaledVector(_u2, rho + len * q);
  tan?.copy(first ? _u1 : _u2);
  const b = bow ? bow[first ? 0 : 1] : 0;
  if (b) {
    const cs = _u1.dot(_u2);
    if (first) _pp.copy(_u2).addScaledVector(_u1, -cs); else _pp.copy(_u2).multiplyScalar(cs).sub(_u1);
    const pl = _pp.length();
    if (pl > 1e-4) {
      const amp = (b * (first ? l1 : l2)) / pl, sn = Math.sin(Math.PI * q);
      out.addScaledVector(_pp, amp * sn * sn);
      if (tan) tan.addScaledVector(_pp, (amp * Math.PI * Math.sin(2 * Math.PI * q)) / Math.max(len, 1e-6)).normalize();
    }
  }
  return out;
};
/** a tube along that path (root a, joint b, end c): fixed topology, rebuilt in place every frame. `tangent3` feeds
 *  the highlight stripe. The first ring's normal comes from `seed` (the bend plane's normal; M is even so a half turn
 *  maps the ring onto itself). wob: the width swells and thins a little along the limb (a drawn line's weight). */
class Tube {
  readonly geo = new THREE.BufferGeometry();
  private pos: Float32Array; private nor: Float32Array; private tan: Float32Array;
  constructor(private S = SEG, private M = 14) {
    const n = (S + 1) * M;
    this.pos = new Float32Array(n * 3); this.nor = new Float32Array(n * 3); this.tan = new Float32Array(n * 3);
    const idx: number[] = [];
    for (let i = 0; i < S; i++) for (let j = 0; j < M; j++) {
      const a = i * M + j, b = i * M + ((j + 1) % M), c = (i + 1) * M + j, d = (i + 1) * M + ((j + 1) % M);
      idx.push(a, b, c, b, d, c);                        // outward-facing ((b - a) x (c - a) points along the normal)
    }
    this.geo.setIndex(idx);
    this.geo.setAttribute("position", new THREE.BufferAttribute(this.pos, 3));
    this.geo.setAttribute("normal", new THREE.BufferAttribute(this.nor, 3));
    this.geo.setAttribute("tangent3", new THREE.BufferAttribute(this.tan, 3));
    this.geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1e4);   // the meshes are never frustum-culled
  }
  update(a: V3, b: V3, c: V3, r: number, seed: V3, bow?: [number, number], wob = 0, ph = 0) {
    const { S, M } = this;
    _n.copy(seed);
    for (let i = 0; i <= S; i++) {
      limbAt(a, b, c, i, _p, _tg, bow);
      _n.addScaledVector(_tg, -_n.dot(_tg));
      if (_n.lengthSq() < 1e-10) { _n.set(1, 0, 0).addScaledVector(_tg, -_tg.x); if (_n.lengthSq() < 1e-6) _n.set(0, 0, 1).addScaledVector(_tg, -_tg.z); }
      _n.normalize();
      _b.crossVectors(_tg, _n);
      const ri = r * (1 + wob * (0.6 * Math.sin(i * 0.47 + ph) + 0.4 * Math.sin(i * 1.13 + ph * 1.7)));
      for (let j = 0; j < M; j++) {
        const ang = (j / M) * Math.PI * 2, cs = Math.cos(ang), sn = Math.sin(ang), k = (i * M + j) * 3;
        const nx = _n.x * cs + _b.x * sn, ny = _n.y * cs + _b.y * sn, nz = _n.z * cs + _b.z * sn;
        this.nor[k] = nx; this.nor[k + 1] = ny; this.nor[k + 2] = nz;
        this.pos[k] = _p.x + nx * ri; this.pos[k + 1] = _p.y + ny * ri; this.pos[k + 2] = _p.z + nz * ri;
        this.tan[k] = _tg.x; this.tan[k + 1] = _tg.y; this.tan[k + 2] = _tg.z;
      }
    }
    this.geo.attributes.position.needsUpdate = true; this.geo.attributes.normal.needsUpdate = true; this.geo.attributes.tangent3.needsUpdate = true;
  }
}
/** the rings of an arm that are tested for clearance */
const CLEAR_RINGS = [1, 2, 3, 4, 5, 6, 7, 8, 10, 12, 14, 16, 18, 20, 22, 24, 25, 26, 27, 28, 29, 30, 31, SEG];
/** body radius at height y (0 = bottom .. Ht): a pill a little wider low down, rounded ends */
const bodyR = (y: number, Ht: number, rb: number, rt: number) => {
  const t = y / Ht;
  if (t <= 0 || t >= 1) return 0;
  const r0 = lerp(rb, rt, smooth(t)), eb = rb / Ht, et = rt / Ht;
  const capB = t < eb ? Math.sqrt(Math.max(0, 1 - ((eb - t) / eb) ** 2)) : 1;
  const capT = t > 1 - et ? Math.sqrt(Math.max(0, 1 - ((t - (1 - et)) / et) ** 2)) : 1;
  return r0 * Math.min(capB, capT);
};
const bodyProfile = (Ht: number, rb: number, rt: number, n = 40) => {
  const pts: THREE.Vector2[] = [];
  for (let i = 0; i <= n; i++) {
    const s = i / n, t = 0.5 - 0.5 * Math.cos(Math.PI * s);
    pts.push(new THREE.Vector2(Math.max(0.0004, bodyR(clamp(t, 1e-5, 1 - 1e-5) * Ht, Ht, rb, rt)), t * Ht));
  }
  return pts;
};
/** the body's hand-drawn unevenness: a radius factor at a torso-local point (by its direction from the middle) */
const bodyWob = (seed: number, Ht: number, hand: number) => {
  const N = lumps(seed + 9), A = 0.022 * hand;
  return (x: number, y: number, z: number) => { const h = Math.hypot(x, z) || 1e-9, yy = (2 * y) / Ht - 1, l = Math.hypot(1, yy); return 1 + A * N(x / h / l, yy / l, z / h / l); };
};
/** the body: a lathe closed at both poles, pushed a little out of true (bw); the pole vertices share one axial normal,
 *  so the ink hull (pushed out along the normals) stays closed too: no pinhole under the body. Normals stay the
 *  lathe's: the paint is smooth, only the outline is uneven. */
const bodyGeo = (Ht: number, rb: number, rt: number, bw: (x: number, y: number, z: number) => number) => {
  const pts = bodyProfile(Ht, rb, rt);
  pts[0].x = 0; pts[pts.length - 1].x = 0;
  const g = new THREE.LatheGeometry(pts, 56, Math.PI), P = g.attributes.position, N = g.attributes.normal;
  for (let i = 0; i < P.count; i++) {
    const x = P.getX(i), y = P.getY(i), z = P.getZ(i);
    if (Math.hypot(x, z) < 1e-7) { N.setXYZ(i, 0, y < Ht / 2 ? -1 : 1, 0); continue; }
    const f = bw(x, y, z);
    P.setXYZ(i, x * f, y, z * f);
  }
  g.computeBoundingSphere();
  return g;
};
/** the head: a ball pushed into the look's drawn blob (toon.ts headBlob: a squarer jaw, a wider crown, one fuller
 *  side, a tilt, soft lumps). Returns a map for points given on / around the unit ball (any radius), in place. */
const headWarp = (B: Blob, ys: number, hand: number) => {
  const N = lumps(B.seed + 5), eT = 2 / lerp(2, B.nTop, hand), eB = 2 / lerp(2, B.nBot, hand);
  const egg = B.egg * 0.5 * hand, asym = B.asym * hand, nz = B.noise * 1.6 * hand, cr = Math.cos(B.rot * hand), sr = Math.sin(B.rot * hand);
  return (v: V3) => {
    const r = v.length() || 1e-9, x = v.x / r, y = v.y / r, z = v.z / r, c = Math.hypot(x, z), e = y > 0 ? eT : eB;
    const Y = Math.sign(y) * Math.abs(y) ** e, C = c > 1e-6 ? c ** e / c : 0, lump = 1 + nz * N(x, y, z), k = (1 - egg * Y) * lump;
    const px = x * C * k * (1 + asym * x), py = Y * ys * lump, pz = z * C * k;
    return v.set((px * cr - py * sr) * r, (px * sr + py * cr) * r, pz * r);
  };
};
/** a geometry built round the unit ball, pushed through the head's warp and scaled to R (normals stay the ball's) */
const warpGeo = <T extends THREE.BufferGeometry>(g: T, warp: (v: V3) => V3, R: number, pre?: (v: V3) => void) => {
  const P = g.attributes.position, v = V();
  for (let i = 0; i < P.count; i++) { v.fromBufferAttribute(P, i); pre?.(v); warp(v).multiplyScalar(R); P.setXYZ(i, v.x, v.y, v.z); }
  P.needsUpdate = true; g.computeBoundingSphere();
  return g;
};
/** 3D two-bone IK frame: the joint is a + dir * x + pp * h; when the pole lines up with the limb it blends to pole2 */
const ikFrame = (a: V3, t: V3, l1: number, l2: number, pole: V3, pole2: V3) => {
  const dir = t.clone().sub(a), D = dir.length() || 1e-6; dir.divideScalar(D);
  const d = clamp(D, Math.abs(l1 - l2) + 1e-3, l1 + l2 - 1e-3);
  const x = (l1 * l1 - l2 * l2 + d * d) / (2 * d), h = Math.sqrt(Math.max(0, l1 * l1 - x * x));
  const perp = (p: V3) => { const q = p.clone().addScaledVector(dir, -p.dot(dir)); const l = q.length(); return l > 1e-5 ? q.divideScalar(l) : null; };
  const p1 = perp(pole), p2 = perp(pole2) ?? perp(UP) ?? V(1, 0, 0);
  const c = Math.abs(pole.clone().normalize().dot(dir));
  const pp = !p1 ? p2 : c > 0.85 ? p1.lerp(p2, smooth((c - 0.85) / 0.13)).normalize() : p1;
  if (pp.lengthSq() < 0.5) pp.copy(p2);
  return { dir, d, x, h, pp, reachErr: Math.max(0, D - d) };
};

// ===== poses =====
export type RigPoseKind = "idle" | "walk" | "wave" | "point" | "haul" | "hold" | "cheer" | "sit" | "desk" | "write" | "phone" | "shh";
/** t = seconds (breathing, waving, the writing strokes: every frame is a pure function of it); arm = which arm waves /
 *  points / writes (default 0, the right hand) / holds the phone (default 1); amount: haul = effort, phone = 0 looking
 *  at it .. 1 at the ear, walk = how much it bounces (1).
 *  walk: phase = where in the cycle of two steps (0..1; from the distance walked, so that the feet stay planted:
 *  rigWalk gives it), stride = half a step's length in metres (default 0.2) */
export type RigPose = { kind: RigPoseKind; t?: number; phase?: number; amount?: number; arm?: 0 | 1; stride?: number };
/** The head as a layer of its own. The reference moves the head against a still body, in short accents on stressed
 *  words and reactions (never a steady wobble): it pops 6 to 7 % larger for 3 frames, squashes a tenth and stretches
 *  a twentieth, nods, tilts a few degrees across a line, rocks while laughing.
 *  dx, dy = a shift toward screen right / up, in head radii (dy is kept within reach of the neck: -0.25 .. 0.25; a
 *  real jump moves the whole figure); tilt = degrees, + = the top of the head toward screen right, about the chin;
 *  scale = its size (1 = as built), growing from the chin; squash = that share flatter and half that share wider
 *  (negative = taller and thinner), also from the chin. The face, the hair and everything worn on the head go along. */
export type RigHead = { dx?: number; dy?: number; tilt?: number; scale?: number; squash?: number };
/** Where a figure sits (the same fields as kit/cast.ts FigState.seat, so a card scene ports one to one). Metres, world.
 *    top       the centre of the seat's top surface
 *    back      how far the hip sits behind that centre (default 0.03)
 *    front     from the centre to the seat's front edge (default 0.2): the knees bend just past it
 *    deskEdge  from the centre to the desk's near edge, along the facing (leave out: no desk)
 *    deskTop   the height of the desk top (world y, default 0.75)
 *    floor     the floor's height (world y, default 0): a foot is planted only if the leg reaches it
 *    backrest  (not in cast.ts) from the centre back to the front face of the chair's back: the hip then sits no
 *              further back than the body's own radius and ink allow, and the arms stay in front of it
 *    backrestTop  the height of that back's top edge (world y, default 0.42 above the seat): above it nothing is in
 *              the way (a hand at the ear with the head turned)
 *  The seat is taken as a bench: as wide as it needs to be, solid below its top and back from its front edge. The
 *  desk is a slab 6 cm thick from its near edge on (legs go under it). */
export type RigSeat = { top: V3; back?: number; deskEdge?: number; deskTop?: number; front?: number; floor?: number; backrest?: number; backrestTop?: number };
export type RigState = {
  at: V3; facing: number; pose: RigPose;
  /** sitting: the figure sits on this seat and `at` is ignored. Every pose keeps its upper body (a hand that would
   *  hang rests on the lap, or on the desk when the seat has one). "sit" / "desk" / "write" without a seat sit on a
   *  seat 0.472 m high over `at`, as the cards do. */
  seat?: RigSeat;
  /** per arm (0 = the right): true = the arm, its hand and what it holds are drawn at their true depth against the
   *  figure's own head, so they can show in front of it; they are then kept strictly outside the head's real shape.
   *  false = hidden behind the own head, as always. undefined (also per arm) = the pose decides: "phone" sets it for
   *  the arm that holds the phone, "shh" for the arm at the lips. */
  armFront?: [boolean | undefined, boolean | undefined];
  hands?: [V3 | null, V3 | null];
  expr?: Expr; blink?: number; visible?: boolean;
  /** a speaking mouth for this frame, instead of the expression's own (see RigMouth; rigSay(t, lines) gives the
   *  sequence for a spoken line, rigSpeak the mouth, the head and the blinks together). Only while the character
   *  itself speaks: the reference never moves a mouth under the narrator. */
  mouth?: RigMouth;
  /** the head as a layer of its own, on top of the pose (see RigHead; rigHeadAccent gives the reference's accents,
   *  rigSpeak ties them to a spoken line) */
  head?: RigHead;
  /** where the pupils look, -1 (screen left) .. 1 (screen right); 0 = straight ahead. Five steps. */
  gaze?: number;
  maxBody?: number;
  /** 0 = turn toward the camera, 1 = keep the true facing (back view); undefined = from the camera angle */
  turn?: number;
  lookDown?: number;
  clipboard?: 0 | 1;
  /** 1 (default) = the head is drawn on top of its own body and limbs, 0 = plain depth order (the body may cover the
   *  chin; a hand may pass in front of the face) */
  headFront?: number;
  /** the torso's own turn from the feet's direction (rad, + = to the person's left), before it turns toward the
   *  camera: e.g. about 0.6 toward a rope held at the left side, so that both short arms reach it */
  twist?: number;
  /** accessories (by name) whose 3D parts are not shown this frame: a phone that is still in the pocket. What an
   *  accessory draws on the face or the clothes is part of those drawings and always shows. */
  hide?: string[];
};
/** a hand target: f 0 = torso-local (origin = bottom of the body, follows its lean), 1 = travel frame (floor under
 *  `at`), 2 = staged for the camera (x = screen right, y up from the bottom of the body, z toward the camera): a wave
 *  or a cheer stays beside the head on screen from any camera angle, it never crosses the face */
type HandT = { p: V3; f: 0 | 1 | 2 };
/** an arm whose place depends on where things are in this frame (the lap, the desk top, the head): solved once the
 *  body stands (see armPlan). lap / desk = the hand rests there; write = the pen hand; phone = the phone hand; shh = the
 *  hand at the lips. */
type ArmPlan = "lap" | "desk" | "write" | "phone" | "shh" | null;
type BodyPose = {
  hip: V3; ankle: [V3, V3]; footYaw: [number, number];     // TRAVEL frame: x = the person's left, y up, z = the story facing
  pitch: number; roll: number; breathe: number;
  /** the part of `roll` that is the body's idle sway (the rest is the pose's own lean to the side) */
  sway: number;
  hand: [HandT | null, HandT | null];
  elbowPole: [V3, V3];                                      // show frame
  headPitch: number;
  plan: [ArmPlan, ArmPlan];
  /** the pose wants this arm drawn in front of the own head (see RigState.armFront) */
  front: [boolean, boolean];
};
/** a seat for one frame, in the TRAVEL frame from the floor point under the hip (y = above the floor, z = forward):
 *  h = the seat top, front = its front edge, deskZ / deskY = the desk's near edge and top (deskZ null: none), restZ /
 *  restY = the front face of the chair's back (null: unknown) and its top edge */
type SeatBox = { h: number; front: number; deskZ: number | null; deskY: number; restZ: number | null; restY: number };
/** how the legs lie on a seat: fixed for a seat and a build, worked out once (Rig.seatFit) */
type SeatFit = {
  /** per leg, in that frame (x = the person's left): hip joint, knee, ankle */
  hip: [V3, V3]; knee: [V3, V3]; ankle: [V3, V3];
  /** per leg: toes up (rad): a dangling foot stays square to its shin; a planted one lies flat */
  footPitch: [number, number];
  /** per leg: how far the ankle hangs above its place on the floor (0 = planted) */
  dangle: [number, number];
  /** the smallest gap of the legs and feet to the seat, the desk, the floor and each other (m) */
  gap: number;
  /** the furthest lean forward (rad) that keeps the body's ink clear of the desk's near edge */
  leanMax: number;
  /** how far (rad) the torso may turn from the seat's direction toward the camera: as far as both resting hands
   *  (on the lap, or on the desk) still reach their places with the arms clear of the body (Rig.seatTurn; null =
   *  not worked out yet) */
  turn: number | null;
  /** per arm: where a hand resting on the lap lies on this seat, the same place for every turn of the torso
   *  (z = how far along the thigh from the seat's centre; u above 1 = held that far over it: see the lap plan in
   *  Rig.armPlan; null = not worked out yet) */
  lap: [{ z: number; u: number } | null, { z: number; u: number } | null];
};
type Sit = SeatBox & { at: V3; fit: SeatFit };
/** the desk is taken as a slab this thick from its near edge on (a top and its rail) */
const DESK_T = 0.06;
/** how far a point is outside the seat, the chair's back and the desk (m, < 0 = inside), in the seat's frame */
const furnGap = (S: SeatBox, y: number, z: number) => {
  const sy = y - S.h, sz = z - S.front;
  let g = sy > 0 && sz > 0 ? Math.hypot(sy, sz) : Math.max(sy, sz);
  if (S.restZ !== null && sy > 0) { const dz = z - S.restZ, dy = y - S.restY; g = Math.min(g, dz > 0 && dy > 0 ? Math.hypot(dz, dy) : Math.max(dz, dy)); }
  if (S.deskZ !== null) {
    const dz = S.deskZ - z, dy = Math.max(y - S.deskY, S.deskY - DESK_T - y);
    g = Math.min(g, dz > 0 && dy > 0 ? Math.hypot(dz, dy) : Math.max(dz, dy));
  }
  return g;
};
/** x for |x| up to 0.7 lim, then easing toward lim (never beyond): a limit without a corner */
const softLim = (x: number, lim: number) => { const a = Math.abs(x), k = 0.7 * lim; return a < k ? x : Math.sign(x) * (k + (lim - k) * (1 - Math.exp(-(a - k) / Math.max(lim - k, 1e-4)))); };
export type Hat = { kind: "cap" | "beanie"; col: string; trim?: string };

// ===== accessories: role props (glasses, moustaches, hats, ties, headphones, packs, things in a hand) =====
// An accessory is a plain object (Acc); a figure takes any number: rc.add(look, { acc: [topHat(), tie()] }).
// Nothing in this file changes when one is added: write a function that returns an Acc (kit/rigacc/ holds the
// standard ones, one file each) and pass it in. What keeps a new one from breaking a picture is built into the kits
// it draws with:
//   - slots: two accessories on one figure cannot take the same place (the figure refuses to build and names both);
//   - face / faceUnder: drawn into the face drawing, so it turns with the face, is cached with it (key) and is gone
//     in a back view, like the eyes;
//   - outfit: drawn into the outfit wrapped round the body;
//   - build: 3D parts. shell = wraps the head (drawn before the skin, which skips its pixels, so nothing can speckle
//     through it); solid = a rounded thing with an ink hull (closed over hard edges); plate = a thin thing whose ink
//     edge is painted (a thin plate's hull breaks up when seen edge on). Head parts are drawn over the figure's own
//     body and arms and get their depth-only twins; body parts and held things sit under the head like the body does;
//     held things follow the hand; keepOut = a ball the arms stay clear of.
// A figure without accessories is built and drawn exactly as before: scripts/rig3d/regress.py checks that.
/** What an accessory occupies. A Look's own extras give way to an accessory in their slot (glasses: eyes, lanyard:
 *  neck, the 你 tag: chest, headband: crown).
 *    drawn on the face:    eyes, lip, chin, mouth, cheek
 *    on the head:          hat (covers the crown and sets a rim), crown (anything else on top), ears
 *    drawn on the clothes: neck, coat, chest, waist
 *    on the body:          back, shoulder
 *    in a hand:            hand0 (the person's right), hand1 (the left) */
export type AccSlot = "eyes" | "lip" | "chin" | "mouth" | "cheek" | "hat" | "crown" | "ears" | "neck" | "coat" | "chest" | "waist" | "back" | "shoulder" | "hand0" | "hand1";
export type Acc = {
  /** a short name (error messages, QA) */
  name: string;
  slots: AccSlot[];
  /** everything that changes how it draws, as text (kind, colours, sizes): part of the face drawing's cache key */
  key: string;
  /** a hat. rim = where its lower edge sits, in degrees from the crown (pulled down like a cap: about 63; perched on
   *  top: about 36). hair "cut" (the default) = pulled down: no fringe shows and the hair comes out from under the rim
   *  from the temples back; "keep" = perched: the look's own hair stays as drawn. shade (default: true for "cut") =
   *  it sits low over the brows: the eye line drops 1.5u and the brows stay under the rim. Any hat leaves out the
   *  look's bun, curls and headband. A hat takes the "hat" slot. */
  hat?: { rim: number; hair?: "cut" | "keep"; shade?: boolean };
  /** true = the look's bun / curls are left out though this is no hat (they would stick through it) */
  noHairProps?: boolean;
  /** the eyes sit behind lenses: 0.3u further apart, and a ring eye leaves its own ring out (the lens is the ring) */
  lens?: boolean;
  /** drawn on the face after the eyes, brows and mouth (glasses, a moustache) */
  face?: (f: FaceKit) => void;
  /** drawn on the face before them (a beard the mouth is drawn on) */
  faceUnder?: (f: FaceKit) => void;
  /** drawn on the clothes, over the look's top and trousers and under its own lanyard and 你 tag */
  outfit?: (o: OutfitKit) => void;
  /** drawn on the clothes before any accessory's outfit: something worn under a coat (a tie, a collar). A coat
   *  drawn after it covers it, except in the opening the coat leaves at the neck; on a look whose own top is open
   *  (a cardigan, a jacket) it shows only inside that opening. */
  outfitUnder?: (o: OutfitKit) => void;
  /** 3D parts: on the head, on the body, in a hand */
  build?: (b: PartKit) => void;
};
/** Drawing on the face. Units are u = 1 % of the head's width, from the middle of the eye line: x = screen right,
 *  y = down. The eyes are at x = -sp and +sp (sp = 14), about 10u tall; the brows 13 to 21u above; the mouth's
 *  middle is at `mouth` (y = 18.7; a grin spans x +-20 and y 12 to 26); the chin's outline is near y = 44, the head's
 *  sides near x = +-50. What is drawn beyond the head's outline simply does not show.
 *  A moustache goes at y = `lip`, the middle of the upper lip (12.4; behind glasses 15, because their rims come
 *  down to y = 11). An accessory that takes the "lip" slot moves the mouth down to make room: its middle is then at
 *  lip + 9.5. */
export type FaceKit = {
  look: Look; expr: Expr; hand: number;
  sp: number; mouth: P2; lip: number;
  /** true when the eyes sit behind lenses (an accessory's or the look's own glasses): keep clear of y < 11 */
  lens: boolean;
  /** +1 / -1: the side of the higher brow and of a smirk */
  strong: number;
  /** true under a hat that shades the eyes */
  shade: boolean;
  /** true when the expression draws the cheekbone lines itself (do not draw them again) */
  cheek: boolean;
  /** the pen every line of the face is drawn with (3.3u, round ends) and the ink colour */
  PEN: number; INK: string;
  /** a seeded offset within +-a, the same in every expression of this character (k: your own index, 100 and up) */
  jit: (k: number, a: number) => number;
  /** a round-capped line through the points (w in u, default PEN) */
  line: (pts: P2[], w?: number, col?: string) => void;
  /** a filled shape with an ink outline `outline` u wide (0 = none); col null = the outline only */
  fill: (pts: P2[], col: string | null, outline?: number) => void;
  /** draws what fn draws turned by deg about (x, y) */
  turned: (x: number, y: number, deg: number, fn: () => void) => void;
  /** points of an ellipse arc (degrees: 0 = +x, 90 = down) / of a curve from a to b bent toward c */
  arc: (cx: number, cy: number, rx: number, ry: number, a0?: number, a1?: number, n?: number) => P2[];
  quad: (a: P2, c: P2, b: P2, n?: number) => P2[];
  /** for anything else: the canvas context; px(x, y) = a point in u as canvas pixels; u = one u in pixels */
  g: CanvasRenderingContext2D; u: number; px: (x: number, y: number) => P2;
};
/** Drawing on the clothes: the canvas that is wrapped round the body. Give places as P(az, t): az = degrees round
 *  the body (0 = the front centre, + = the person's left, +-180 = the back seam), t = height (0 = the body's bottom,
 *  1 = its top). A front view shows about az -75..75. The head hides what is above t = chin (about 0.8), the trousers
 *  start below t = waist (about 0.1). One canvas pixel is about half as wide as it is tall on the body, so a line
 *  that runs round the body comes out about twice as heavy as one that runs up it: give it half the width. */
export type OutfitKit = {
  look: Look; hand: number;
  g: CanvasRenderingContext2D; W: number; H: number;
  P: (az: number, t: number) => P2;
  chin: number; waist: number;
  /** the degrees of az that m metres span at height t / canvas pixels per metre up the body at height t */
  az: (m: number, t: number) => number; pxUp: (t: number) => number;
  /** the top's colour, its seam colour (the detail lines of the clothes), the detail line width in px */
  top: string; seam: string; LW: number;
  /** a colour made darker (k < 1) or lighter */
  shade: (col: string, k: number) => string;
  /** a filled polygon (with an outline) / a round-capped line, through points from P(); shapes may cross the back seam */
  poly: (pts: P2[], col: string, stroke?: string, lw?: number) => void;
  line: (pts: P2[], col: string, lw: number) => void;
};
export type AccMount = "head" | "body" | THREE.Group;
/** how a part is painted and inked: col = its colour (default white); map = a texture that multiplies it; paint =
 *  the kind of drawn shading ("prop" by default; "cloth" = the clothes' gradient; "hair"; "skin"); mat = a paint made
 *  with PartKit.paint, to share between parts; ink = the outline's width in metres; thick = how much heavier the line
 *  is on the side away from the light (0.4) */
export type PartO = { col?: string; map?: THREE.Texture; paint?: "prop" | "cloth" | "hair" | "skin"; mat?: THREE.Material; ink?: number; thick?: number };
/** a brim or a peak: see PartKit.brim */
export type BrimO = { rIn: number; y: number; out: number | ((azDeg: number) => number); from?: number; to?: number; droop?: number; thick?: number | ((azDeg: number) => number); taper?: number; join?: number; seg?: number };
/** Building 3D parts. Lengths are metres unless they are "head units" (the head's radius = 1).
 *  Head: x = the person's left, y = up, z = the face side, from the head's centre. Body: the same axes from the
 *  bottom of the body on its axis (y = Ht at its top). */
export type PartKit = {
  look: Look; hand: number;
  /** R = the head's radius; Ht = the body's height; rb / rt = the body's radius low down / at the top; headY = the
   *  head's centre above the body's bottom; handR = a hand's radius; INK = the usual ink width of a prop's outline */
  R: number; Ht: number; rb: number; rt: number; headY: number; handR: number; INK: number;
  /** this figure's hat rim in degrees from the crown (0 = no hat) */
  rim: number;
  /** the body's radius at height t (0 = bottom .. 1 = top) toward az (degrees, 0 = front, + = the person's left) */
  bodyR: (t: number, az?: number) => number;
  /** HEAD. A point in head units -> metres from the head's centre, through the head's own lumpy shape and this
   *  accessory's tilt: 1 = on the skin, more = outside it. at() makes a new vector, toM() changes one in place. */
  at: (x: number, y: number, z: number) => V3;
  toM: (v: V3) => V3;
  /** tilts what this accessory puts on the head from here on (degrees toward the person's left, toward the face) */
  tilt: (left: number, forward?: number) => void;
  /** puts a mesh on the head at a point in head units, turned with the tilt */
  put: <T extends THREE.Object3D>(m: T, x: number, y: number, z: number) => T;
  /** a paint to share between parts of one mount (see PartO) */
  paint: (on: AccMount, o: PartO) => THREE.Material;
  /** a part that wraps the head: the band of the ball of radius r (head units, more than 1) between `from` and `to`
   *  degrees from the crown, pushed through the head's shape (squash = its height factor); or geo = your own patch
   *  round the unit ball (see band). Drawn before the skin, which skips its pixels. rimInk = an ink line painted along
   *  its lower edge, in metres (a shell's hull only draws its outer outline). A map's v runs 1 at the top to 0 at the
   *  lower edge, u round the head.
   *  tuck = the lower edge turns in to the skin over its last `tuck` degrees (about 9). Give it to every shell whose
   *  lower edge ends on the bare head or the hair with nothing in front of it (a band, a skull cap, a cuff): an edge
   *  that just stops stands off the head and shows as a forked spike at each side of the head. tuckTop = the same at
   *  the upper edge, in to the radius onR (the r of the shell it lies on; default 1, the skin). */
  shell: (o: PartO & { r?: number; from?: number; to?: number; squash?: number; rings?: number; geo?: THREE.BufferGeometry; rimInk?: number; tuck?: number; tuckTop?: number; onR?: number }) => THREE.Mesh;
  /** a rounded solid with an ink hull (hard edges are fine: the hull is closed over them). Geometry in metres round
   *  its own origin; then place it: put() on the head, position.set() on the body or in a held group. Keep it at
   *  least two ink widths thick; anything thinner is a plate. */
  solid: (on: AccMount, geo: THREE.BufferGeometry, o?: PartO) => THREE.Mesh;
  /** a thin plate: no hull. edge (the default) = its ink edge is painted where the geometry's uv.y is above 0.8
   *  (brim() makes such geometry); edge false = no painted edge (give it a map of your own) */
  plate: (on: AccMount, geo: THREE.BufferGeometry, o?: PartO & { edge?: boolean }) => THREE.Mesh;
  /** the geometry of a brim or peak round the head, in metres, placed (use it at the head's origin). In head units:
   *  it grows out of the circle of radius rIn at height y, `out` far (a number, or a function of the azimuth in
   *  degrees from the face side, + = the person's left; 0 = nothing there), between azimuths from..to (default: all
   *  the way round), dropping `droop` per unit out (0.1; negative turns it up), `thick` at the root (0.07; a number
   *  or a function of the azimuth) and thick * taper at the rounded free edge (0.6). Thick (0.08 and up): solid().
   *  Thin: plate().
   *  Start it inside the head or the crown (rIn well below their radius there) and say where it comes out: join =
   *  that radius (the crown's or the shell's radius at the brim). A solid brim's outline is anchored there: it then
   *  stays on the brim from every camera height, also when the brim is seen edge-on. */
  brim: (o: BrimO) => THREE.BufferGeometry;
  /** says that this accessory has an edge that throws a shadow on the head (the rig draws it: a soft band under the
   *  edge, on the skin and the hair, that moves with the light and with the head's turn). brim() says it by itself;
   *  call this for an edge built another way. In head units: y = the edge's height, r = how far out it reaches at
   *  the middle of its span, rSide = a quarter turn from there (default r), from..to = its span in degrees from the
   *  face side (default: all the way round). The widest edge on the head wins. */
  shadow: (o: { y: number; r: number; rSide?: number; from?: number; to?: number }) => void;
  /** a strip of the ball of radius r for shell({ geo }): from a0 to a1 degrees from the crown along the great circle
   *  that runs ear to ear (yaw 0; - = the person's right; yaw 90 = from the back of the head over the crown to the
   *  face), `half` head units wide on each side. edge = the radius its two long edges come down to (default r: a
   *  flat strip). A strip that lies outside another shell needs it: give the edges a radius inside that shell, or
   *  the strip floats, and from the side the background shows through the gap under it. */
  band: (o: { r: number; a0: number; a1: number; half: number; yaw?: number; edge?: number }) => THREE.BufferGeometry;
  /** IN A HAND: a group that follows hand i (0 = the person's right). offset = metres from the hand's centre in the
   *  body's frame (x = the person's left, y = up, z = forward); rot = [pitch, yaw, roll] in radians on top of the
   *  body's facing. layer "limb" (the default) = drawn like the hand that holds it: hidden behind the figure's own
   *  head, or in front of it when that arm is (RigState.armFront); "free" = plain depth (something held up over the
   *  head). Add parts to it with solid(group, ...) / plate(group, ...).
   *  hang: true = the thing hangs from the hand (a case, a bag, a bucket): that arm then stays down in wave, point
   *  and cheer, as a person carrying a case would keep it; a wave or a point asked of that arm goes to the other arm
   *  when that one is free. Leave it out for what is raised with the hand (a cup, a flag). Either way Rig.qa.held
   *  tells whether the thing passes through the figure's own body or head in a pose.
   *  posed: true = a thing a pose knows how to hold (a pen, a phone). In the poses that handle what a hand holds
   *  ("write", "phone", and a hand resting on the lap or the desk) the group then sits ON the hand's centre and the
   *  pose turns it; offset and rot are left out. Build the thing for that: its length along the group's +y (a pen:
   *  the tip at the -y end; a phone: its top at +y), its face toward +z (a phone's screen), the group's origin where
   *  the hand grips it (so the hand is behind a phone, on -z). What the poses do with it: writing leans +y back over
   *  the paper and sets the hand's height so the thing's lowest point touches the paper; looking at a phone turns
   *  +z to the face; a call lays +z against the side of the head; a resting hand lays the thing flat under itself
   *  (+z down). The pose keeps every point of the thing (its vertices, with its ink) outside the head, the body and
   *  the desk. In every other pose, and for groups without `posed`, offset and rot apply exactly as before. */
  held: (i: 0 | 1, o?: { offset?: [number, number, number]; rot?: [number, number, number]; layer?: "limb" | "free"; hang?: boolean; posed?: boolean }) => THREE.Group;
  /** ON THE BODY: the arms stay clear of this ball (centre in body metres). Head parts need none: the head is drawn
   *  over the arms. */
  keepOut: (c: V3, r: number) => void;
  /** a canvas texture (it multiplies the part's colour); key = share it between figures under that name */
  tex: (w: number, h: number, draw: (g: CanvasRenderingContext2D) => void, key?: string) => THREE.Texture;
};
type FaceAcc = { key: string; lens: boolean; lip: boolean; own: boolean; under: ((f: FaceKit) => void)[]; over: ((f: FaceKit) => void)[] };
/** what a figure's accessories do to its face drawing; own = the look's own glasses are drawn */
const faceAccOf = (L: Look, accs: Acc[]): FaceAcc => {
  const eyes = accs.some((a) => a.slots.includes("eyes"));
  return {
    key: accs.filter((a) => a.face || a.faceUnder || a.lens).map((a) => a.name + ":" + a.key).join(","),
    own: !!L.glasses && !eyes, lens: (!!L.glasses && !eyes) || accs.some((a) => a.lens), lip: accs.some((a) => a.slots.includes("lip")),
    under: accs.filter((a) => a.faceUnder).map((a) => a.faceUnder!), over: accs.filter((a) => a.face).map((a) => a.face!),
  };
};
const outfitKit = (g: CanvasRenderingContext2D, L: Look, hand: number, d: Dim, top: string, seam: string, LW: number): OutfitKit => {
  const W = OUT_W, H = OUT_H;
  const across = (pts: P2[], fn: (dx: number) => void) => {
    let lo = Infinity, hi = -Infinity;
    for (const [x] of pts) { lo = Math.min(lo, x); hi = Math.max(hi, x); }
    fn(0); if (lo < 0) fn(W); if (hi > W) fn(-W);
  };
  const trace = (pts: P2[], dx: number, close: boolean) => { g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x + dx, y) : g.moveTo(x + dx, y))); if (close) g.closePath(); };
  return {
    look: L, hand, g, W, H,
    P: (az, t) => [W / 2 + (az / 360) * W, H * (1 - Math.acos(clamp(1 - 2 * t, -1, 1)) / Math.PI)],
    chin: clamp((d.Ht + 0.72 * d.R - d.R * d.ys - 1.5 * HULL.head) / d.Ht, 0.5, 0.95), waist: 0.105,
    az: (m, t) => ((m / Math.max(bodyR(clamp(t, 0.02, 0.98) * d.Ht, d.Ht, d.rb, d.rt), 1e-3)) * 180) / Math.PI,
    pxUp: (t) => H / (Math.PI * Math.sqrt(Math.max(t * (1 - t), 1e-4)) * d.Ht),
    top, seam, LW, shade: shadeHex,
    poly: (pts, col, stroke, lw = LW) => across(pts, (dx) => { trace(pts, dx, true); g.fillStyle = col; g.fill(); if (stroke) { g.strokeStyle = stroke; g.lineWidth = lw; g.lineJoin = "round"; g.stroke(); } }),
    line: (pts, col, lw) => across(pts, (dx) => { trace(pts, dx, false); g.strokeStyle = col; g.lineWidth = lw; g.lineCap = "round"; g.lineJoin = "round"; g.stroke(); }),
  };
};
const posKey = (P: THREE.BufferAttribute | THREE.InterleavedBufferAttribute, i: number) => `${Math.round(P.getX(i) * 1e5)},${Math.round(P.getY(i) * 1e5)},${Math.round(P.getZ(i) * 1e5)}`;
/** does the geometry have hard edges (one position carrying different normals)? */
const hardEdges = (g: THREE.BufferGeometry) => {
  const P = g.attributes.position, N = g.attributes.normal, seen = new Map<string, number>();
  for (let i = 0; i < P.count; i++) {
    const k = posKey(P, i), j = seen.get(k);
    if (j === undefined) seen.set(k, i);
    else if (N.getX(i) * N.getX(j) + N.getY(i) * N.getY(j) + N.getZ(i) * N.getZ(j) < 0.985) return true;
  }
  return false;
};
/** the same geometry with one normal per position (the mean of the faces that meet there): pushed out along those, an
 *  ink hull stays closed over hard edges (a box's corners, a cylinder's rim) */
const hullGeo = (g: THREE.BufferGeometry) => {
  const P = g.attributes.position, N = g.attributes.normal, sum = new Map<string, [number, number, number]>();
  for (let i = 0; i < P.count; i++) {
    const k = posKey(P, i), a = sum.get(k) ?? [0, 0, 0];
    a[0] += N.getX(i); a[1] += N.getY(i); a[2] += N.getZ(i); sum.set(k, a);
  }
  const out = g.clone(), M = out.attributes.normal;
  for (let i = 0; i < P.count; i++) { const a = sum.get(posKey(P, i))!, l = Math.hypot(a[0], a[1], a[2]) || 1; M.setXYZ(i, a[0] / l, a[1] / l, a[2] / l); }
  return out;
};
/** For a part with large flat faces (a brim): sets geo.userData.hull, the geometry PartKit.solid draws as the part's
 *  ink hull instead of the part's own surface. It is the same surface with point i moved into the part by
 *  (1 - sin(90 deg x up[i])) x 1.8 line widths (more than the widest line: the hull's shader pushes every point out
 *  again by the line's width, which changes with the light). up = 1: the outline is drawn there; 0: it is not.
 *  Why: a flat face that is pushed out whole floats one line width over the part, and a camera that sees the part
 *  nearly edge-on sees that face edge-on too, as the line along the part's edge. SLOPE_BIAS moves a face seen
 *  edge-on far back, by an amount that jumps from triangle to triangle, and the line falls behind whatever stands
 *  behind it (a brim's line: the crown) in single pixels, a dotted row that comes and goes as the head nods.
 *  With the flat faces sunk and only the rim at the edge left up, the line along the edge is made of the rim's short
 *  steep faces, which no camera sees edge-on over any length. */
export const sunkHull = (g: THREE.BufferGeometry, up: ArrayLike<number>) => {
  g.userData.hull = (ink: number) => {
    const h = g.clone(), P = h.attributes.position, N = g.attributes.normal;
    for (let i = 0; i < P.count; i++) {
      const sink = (1 - Math.sin((Math.PI / 2) * up[i])) * 1.8 * ink;
      if (sink > 0) P.setXYZ(i, P.getX(i) - N.getX(i) * sink, P.getY(i) - N.getY(i) * sink, P.getZ(i) - N.getZ(i) * sink);
    }
    return h;
  };
  return g;
};
/** see PartKit.brim: one closed, smooth surface (the cross-section is a loop: top, the rounded free edge, bottom, the
 *  root wall); uv.y = 1 on the free edge, falling by 1 per PEAK_OUT head units toward the root (what peakTex paints).
 *  Its ink hull (see sunkHull) keeps the outline at the free edge only: the top and the bottom lie inside the brim
 *  and come out between the last ring and the edge. At the two ends of a brim that does not go all round they come
 *  out earlier, over BRIM_RAMP head units from `join` (where the brim leaves the crown), to outline the ends. */
const BRIM_RAMP = 0.075;
const brimGeo = (o: BrimO, toM: (v: V3) => V3) => {
  const full = o.from === undefined && o.to === undefined, a0 = rad(o.from ?? -180), a1 = rad(o.to ?? 180);
  const NA = o.seg ?? (full ? 72 : 36), NT = 5, NE = 6, tp = o.taper ?? 0.6, dr = o.droop ?? 0.1;
  const M = 2 * (NT + 1) + NE - 1, cols = full ? NA : NA + 1;
  const pos: number[] = [], uv: number[] = [], idx: number[] = [], ramp: number[] = [], v = V();
  for (let i = 0; i < cols; i++) {
    const a = a0 + ((a1 - a0) * i) / NA, L = Math.max(typeof o.out === "number" ? o.out : o.out((a * 180) / Math.PI), 1e-3);
    const T0 = Math.max(typeof o.thick === "function" ? o.thick((a * 180) / Math.PI) : o.thick ?? 0.07, 1e-4);
    const T = T0 * smooth(L / (2 * T0)), Te = T * tp, sn = Math.sin(a), cs = Math.cos(a);
    // rings along the top and the bottom: one on the join, one where the hull's ramp ends, the rest evenly to the edge
    const lj = clamp((o.join ?? o.rIn) - o.rIn, 0, L), D = Math.max(Math.min(BRIM_RAMP, 0.6 * (L - lj)), 1e-4), ls = lj > 1e-4 ? [0, lj, Math.min(lj + D, L)] : [0, Math.min(D, L)];
    for (let k = 1, n = NT + 1 - ls.length, l0 = ls[ls.length - 1]; k <= n; k++) ls.push(l0 + ((L - l0) * k) / n);
    // (l = how far out along the brim; up = how far the hull is out of the brim there, 0 .. 1: see sunkHull)
    const push = (r: number, y: number, l: number, up: number) => { toM(v.set(r * sn, y, r * cs)); pos.push(v.x, v.y, v.z); uv.push(i / NA, 1 - (L - l) / PEAK_OUT); ramp.push(up); };
    const end = !full && (i === 0 || i === NA);
    const upAt = (k: number) => (L - lj < 1e-3 ? 0 : end ? clamp((ls[k] - lj) / D, 0, 1) : k === NT ? 1 : 0);
    for (let k = 0; k <= NT; k++) { const l = ls[k]; push(o.rIn + l, o.y - dr * l, l, upAt(k)); }                                      // top, root -> edge
    for (let j = 1; j < NE; j++) { const an = Math.PI / 2 - (Math.PI * j) / NE; push(o.rIn + L + (Te / 2) * Math.cos(an), o.y - dr * L - Te / 2 + (Te / 2) * Math.sin(an), L, 1); }
    for (let k = NT; k >= 0; k--) { const l = ls[k]; push(o.rIn + l, o.y - dr * l - lerp(T, Te, l / L), l, upAt(k)); }                // bottom, edge -> root
  }
  for (let i = 0; i < NA; i++) {
    const i1 = full ? (i + 1) % NA : i + 1;
    for (let m = 0; m < M; m++) { const m1 = (m + 1) % M, A = i * M + m, B = i * M + m1, C = i1 * M + m, D = i1 * M + m1; idx.push(A, B, C, C, B, D); }
  }
  if (!full) for (const [c, flip] of [[0, false], [NA, true]] as [number, boolean][]) for (let m = 1; m < M - 1; m++) idx.push(c * M, c * M + (flip ? m : m + 1), c * M + (flip ? m + 1 : m));
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx); g.computeVertexNormals(); g.computeBoundingSphere();
  return sunkHull(g, ramp);
};
/** see PartKit.shell: the band of the ball of radius r between `from` and `to` degrees from the crown whose lower
 *  edge (and upper edge) turns in over the last `tuck` (`tuckTop`) degrees: down to the head's skin (to the radius
 *  `onR`). sq = the height factor the shell is squashed by afterwards (the lower edge still lands on the skin). Same
 *  layout as THREE.SphereGeometry: u round the head, v = 1 at `from` .. 0 at `to`. */
const tuckedBand = (r: number, from: number, to: number, rings: number, sq: number, tuck: number, tuckTop: number, onR: number) => {
  const NS = 48, LIP = 6, tb = Math.min(tuck, (to - from) * 0.45), tt = Math.min(tuckTop, (to - from) * 0.45);
  const th: number[] = [];
  if (tt > 0) for (let i = 0; i < LIP; i++) th.push(from + (tt * i) / LIP);
  for (let i = 0; i <= rings; i++) th.push(lerp(from + tt, to - tb, i / rings));
  if (tb > 0) for (let i = 1; i <= LIP; i++) th.push(to - tb + (tb * i) / LIP);
  // rho(theta) and its slope per radian: a smooth step from r to the edge's own radius
  const skin = (a: number) => 0.995 / Math.hypot(Math.sin(a), sq * Math.cos(a));
  const prof = (deg: number): [number, number] => {
    const a = rad(deg);
    if (tb > 0 && deg > to - tb) { const t = (deg - (to - tb)) / tb, e = skin(a); return [lerp(r, e, smooth(t)), ((e - r) * 6 * t * (1 - t)) / rad(tb)]; }
    if (tt > 0 && deg < from + tt) { const t = (from + tt - deg) / tt, e = onR * 0.99; return [lerp(r, e, smooth(t)), (-(e - r) * 6 * t * (1 - t)) / rad(tt)]; }
    return [r, 0];
  };
  const pos: number[] = [], nor: number[] = [], uv: number[] = [], idx: number[] = [], NR = th.length - 1;
  for (let j = 0; j <= NR; j++) {
    const a = rad(th[j]), sa = Math.sin(a), ca = Math.cos(a), [rho, d] = prof(th[j]);
    for (let i = 0; i <= NS; i++) {
      const ph = (i / NS) * Math.PI * 2, ux = -Math.cos(ph), uz = Math.sin(ph);
      pos.push(rho * sa * ux, rho * ca, rho * sa * uz);
      // the normal of a surface of revolution rho(theta): rho * e_r - rho' * e_theta
      const nx = rho * sa * ux - d * ca * ux, ny = rho * ca + d * sa, nz = rho * sa * uz - d * ca * uz, l = Math.hypot(nx, ny, nz) || 1;
      nor.push(nx / l, ny / l, nz / l); uv.push(i / NS, 1 - (th[j] - from) / (to - from));
    }
  }
  for (let j = 0; j < NR; j++) for (let i = 0; i < NS; i++) {
    const A = j * (NS + 1) + i + 1, B = j * (NS + 1) + i, C = (j + 1) * (NS + 1) + i, D = (j + 1) * (NS + 1) + i + 1;
    if (j !== 0 || from > 0) idx.push(A, B, D);
    idx.push(B, C, D);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx); g.computeBoundingSphere();
  return g;
};
/** see PartKit.band: a patch of the ball of radius r, its normals the ball's */
const bandGeo = (r: number, a0: number, a1: number, half: number, yaw = 0, edge = r) => {
  const NA = 44, NW = 4, cy = Math.cos(rad(yaw)), sy = Math.sin(rad(yaw)), pos: number[] = [], nor: number[] = [], uv: number[] = [], idx: number[] = [];
  for (let i = 0; i <= NA; i++) for (let j = 0; j <= NW; j++) {
    const a = rad(lerp(a0, a1, i / NA)), w = lerp(-half, half, j / NW) / r, sa = Math.sin(a);
    const x = sa * cy - w * sy, y = Math.cos(a), z = sa * sy + w * cy, l = Math.hypot(x, y, z), rj = lerp(r, edge, (2 * j / NW - 1) ** 2);
    pos.push((x / l) * rj, (y / l) * rj, (z / l) * rj); nor.push(x / l, y / l, z / l); uv.push(i / NA, j / NW);
  }
  for (let i = 0; i < NA; i++) for (let j = 0; j < NW; j++) { const A = i * (NW + 1) + j, B = A + 1, C = A + NW + 1, D = C + 1; idx.push(A, B, C, C, B, D); }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx); g.computeBoundingSphere();
  return g;
};
const accTexCache = new Map<string, THREE.Texture>();
/** an ink line painted along a shell's lower edge: a grey map that multiplies its colour, dark over the lowest `frac` */
const rimInkTex = (frac: number) => {
  const n = clamp(Math.round(frac * 256), 2, 128), key = "rimInk" + n;
  let t = accTexCache.get(key);
  if (!t) { t = canvasTex(8, 256, (g) => { g.fillStyle = "#ffffff"; g.fillRect(0, 0, 8, 256); g.fillStyle = "#3d3d3d"; g.fillRect(0, 256 - n, 8, n); }); accTexCache.set(key, t); }
  return t;
};
/** the two built-in hats as accessories (worked examples: shells, a plate with a painted edge, small solids) */
export const hatAcc = (h: Hat): Acc => ({
  name: h.kind, slots: ["hat", "crown"], key: `${h.kind}|${h.col}|${h.trim ?? ""}`, hat: { rim: h.kind === "cap" ? 63 : 68 },
  build(b) {
    const trim = h.trim ?? shadeHex(h.col, 0.7), hm = b.paint("head", { col: h.col, map: hatTex(h.kind) }), tm = b.paint("head", { col: trim });
    if (h.kind === "cap") {
      const ySq = 0.95, rimR = 1.075 * Math.sin(rad(63)), rimY = 1.075 * Math.cos(rad(63)) * ySq;
      b.shell({ r: 1.075, to: 63, squash: ySq, mat: hm, tuck: 9 });
      // the peak: a wedge out of the gap under the rim, with its ink edge painted on it and no hull (see peakGeo)
      b.plate("head", peakGeo(rimR, rimY, b.toM), { col: trim, map: peakTex() });
      b.shadow({ y: rimY - 0.12, r: rimR + 0.39, from: -52, to: 52 });
      b.solid("head", new THREE.SphereGeometry(b.R * 0.085, 12, 8), { mat: tm, ink: HULL.prop * 0.6 }).position.copy(b.at(0, 1.075 * ySq, 0));
    } else {
      b.shell({ r: 1.07, to: 60, squash: 1.04, mat: hm });
      b.shell({ r: 1.125, from: 49, to: 69, rings: 5, mat: tm, ink: HULL.prop, thick: 0.4, tuck: 8, tuckTop: 7, onR: 1.07 });   // the cuff: a roll
      b.solid("head", new THREE.SphereGeometry(b.R * 0.17, 14, 10), { mat: tm }).position.copy(b.at(0, 1.07 * 1.04, 0)).add(V(0, b.R * 0.1, 0));
    }
  },
});

// ===== the figure =====
type Dim = { R: number; ys: number; Ht: number; rb: number; rt: number; hipY: number; thigh: number; shin: number; upper: number; fore: number; limbR: number; legR: number; handR: number; ankleY: number; sh: [V3, V3]; bw: (x: number, y: number, z: number) => number; H: Blob };
/** ink widths (m). Reference, in head widths: the head's line 2.2 % on the lit side, 5.5 % on the far side, 8 % under
 *  the chin; the body's line about as heavy; a limb with its line about 5.4 %, a hand about 2.1 x the limb */
const HULL = { head: 0.021, body: 0.0175, limb: 0.0037, hand: 0.0041, prop: 0.011 };
/** sitting. The body's bottom rests SEAT_LIFT above the seat: its ink line (the heaviest: underneath) sits on the
 *  seat instead of in it; BODY_INK = the room that line takes at the body's sides. SEAT_TURN = the most the torso may
 *  turn from the chair's direction toward the camera (the head turns the rest of the way, up to HEAD_TURN on the
 *  body); at a desk less, so both forearms stay on it; a build whose short arms cannot rest both hands at that turn
 *  gets less (SeatFit.turn). SEAT_LEAN = the lean forward of a seated body (more at a desk in the desk poses).
 *  REST_GAP = the air under a limb that rests on something. */
const SEAT_LIFT = 1.6 * HULL.body, BODY_INK = 1.6 * HULL.body, SEAT_TURN = rad(20), SEAT_TURN_DESK = rad(14), HEAD_TURN = rad(46), SEAT_LEAN = rad(3), REST_GAP = 0.003;
/** the head's real reach from its centre is kept per direction on this grid (see Rig.headEnv) */
const ENV_T = 40, ENV_A = 80;
/** reference build: the head is about a third of the height, the body about 0.58 head widths wide and 0.85 long below
 *  the head, the arms about 0.85 head widths: a bigger head, a slimmer body and shorter arms than the drawn cards */
const HEAD_K = 1.16, BODY_W = 0.88;
const dimOf = (L: Look, hand: number): Dim => {
  const D = dimsOf(L);
  const R = D.H.a * SU * HEAD_K, ys = clamp((D.H.b / D.H.a) * 0.95, 0.85, 0.97);
  const Ht = 2 * R * 1.04 * clamp(D.torso / 250, 0.94, 1.06), rb = D.Ta * SU * 0.96 * BODY_W, rt = rb * 0.86;
  const crown = 1.45, headC = crown - R * ys, torsoTop = headC - 0.72 * R;
  const limbR = 0.009, legR = limbR * 1.06, ankleY = legR + HULL.limb + 0.005;
  const hipY = torsoTop - Ht, legTop = hipY + 0.08 * Ht, leg = legTop - ankleY, arm = 2 * R * 0.84;
  const bw = bodyWob(L.seed, Ht, hand);
  // shoulders: just off the side surface near the top corner, a little to the front: pinned to the body's side, never
  // inside it, and clear of the surface by the limb's own ink (so that line never cuts into the body's)
  const shY = 0.84 * Ht, shAz = rad(72);
  const shAt = (sg: number) => { const x = sg * Math.sin(shAz), z = Math.cos(shAz), r = bodyR(shY, Ht, rb, rt) * bw(x, shY, z) + limbR + HULL.limb + 0.005; return V(x * r, shY, z * r); };
  return { R, ys, Ht, rb, rt, hipY, thigh: leg * 0.5, shin: leg * 0.5, upper: arm * 0.5, fore: arm * 0.5, limbR, legR, handR: 0.0232, ankleY, sh: [shAt(-1), shAt(1)], bw, H: D.H };
};

const _q1 = new THREE.Quaternion(), _q2 = new THREE.Quaternion(), _q3 = new THREE.Quaternion(), _s = V(), _w = V(), _bq = new THREE.Quaternion(), _bq2 = new THREE.Quaternion(), _bv = V();
const _hl = V(), _hp = V(), _m4 = new THREE.Matrix4();
/** a turn from its three axes (x = y cross z) */
const basisQ = (y: V3, z: V3, out: THREE.Quaternion) => out.setFromRotationMatrix(_m4.makeBasis(V().crossVectors(y, z), y, z));

export class Rig {
  readonly group = new THREE.Group();
  look: Look;
  state: RigState = { at: V(), facing: 0, pose: { kind: "idle" } };
  readonly dim: Dim;
  /** QA after update (metres; a gap below 0 = something passes through something):
   *    reach   how far the worst hand is from where it should be (0 = every hand is in its place)
   *    clear   the smallest gap the arms keep: to the own body, the head (its real shape for an arm in front of it),
   *            an accessory's keep-out, and, seated, the seat / desk / chair back; and of a posed thing to the body
   *    held    the smallest gap between a held thing and the figure's own body and head (1 = no held thing)
   *    seat    seated: the smallest gap of the legs, feet, arms, hands, posed things and the body to the seat, the
   *            desk, the chair back, the floor, and of the arms to the own legs (1 = not seated)
   *    head    the smallest gap of an arm in front of the head (rings, hand, what it holds) to the head's real shape
   *            (1 = no arm in front)
   *    swivel  how far each elbow was turned out of the pose's own plane to clear (rad) */
  qa = { reach: 0, clear: 1, swivel: [0, 0] as [number, number], held: 1, seat: 1, head: 1 };
  private torsoG = new THREE.Group(); private headG = new THREE.Group();
  private faceU: FaceU; private hatLine: number;
  /** this figure's accessories (the hat option comes first), what they do to the face drawing, and whether a hat
   *  shades the eyes */
  readonly acc: Acc[]; private fa: FaceAcc; private shade: boolean;
  /** held things (they follow a hand) and the balls the arms stay clear of (body frame; w = in the world, per frame) */
  private held: { g: THREE.Group; i: 0 | 1; off: V3; rot: [number, number, number]; hang: boolean; posed: boolean; pts: Float32Array | null; ink: number; far: number }[] = [];
  /** each accessory's 3D parts (state.hide switches them off by the accessory's name) */
  private accParts: { name: string; o: THREE.Object3D }[] = [];
  private keep: { c: V3; r: number; w: V3 }[] = [];
  private limbs: Tube[] = []; private hands: THREE.Mesh[] = []; private feet: THREE.Group[] = []; private caps: THREE.Mesh[] = [];
  private clip: THREE.Group; private blob: THREE.Mesh;
  /** an arm in front of the head (state.armFront) is drawn by depth against the head, but the head's ink ring is the
   *  back of a pushed-out hull: up to 10 cm behind the head's edge, so a thing just behind the head would hide the ring
   *  and leave the head without its line there. While an arm is in front, this flat disc through the head's edge
   *  plane (it faces the camera; depth only, on the head's own pixels, after the heads and before the limbs) brings
   *  the ring forward to that plane: what is behind the head is behind its line too. */
  private ring: THREE.Mesh;
  private torsoM = new THREE.Matrix4(); private torsoInv = new THREE.Matrix4();
  private out = { hand: [V(), V()] as [V3, V3], elbow: [V(), V()] as [V3, V3], head: V(), foot: [V(), V()] as [V3, V3], bodyYaw: 0, faceYaw: 0 };
  /** per arm: its own materials (tube, hand, shoulder cap, their hulls, and what it holds on the "limb" layer), so
   *  one arm can be drawn in front of the head; whether it is this frame; and the turn a pose gives a posed thing */
  private armMats: THREE.Material[][] = [[], []];
  private frontArm: [boolean, boolean] = [false, false];
  private grip: [THREE.Quaternion | null, THREE.Quaternion | null] = [null, null];
  private gripQ = [new THREE.Quaternion(), new THREE.Quaternion()];
  /** how far a plan had to leave a hand from its place this frame (m; "shh": off the lips), for qa.reach */
  private planOff = [0, 0];
  /** sitting: this frame's seat (null = standing), the floor point under the hip, sin / cos of the facing, the legs
   *  in the world, and the fits worked out so far (one per seat) */
  private sit: Sit | null = null; private sitAt = V(); private sitF: [number, number] = [0, 1];
  private legW = [{ h: V(), k: V(), a: V() }, { h: V(), k: V(), a: V() }];
  /** seated: points along both legs' centre lines in the world (every second ring from the 4th), for the arms' tests */
  private legPts = new Float32Array(2 * (SEG / 2 - 1) * 3);
  private fits = new Map<string, SeatFit>();
  /** the head's real reach from its centre by direction (see buildHeadEnv), and world -> head frame for this frame */
  private headEnv: Float32Array | null = null; private headInv = new THREE.Matrix4();
  /** depth-only offsets of head parts (m toward the camera): the curls sit a little behind the ball, so their ink shows
   *  only outside the head. The head itself is at its true depth; see layerMat for how it stays on top of the body. */
  private pullU: NumU = { value: 0 }; private curlPullU: NumU = { value: -0.03 };
  /** the same for the heads' depth-only pass (see layerMat) */
  private depthU: NumU = { value: 0 }; private curlDepthU: NumU = { value: 0 };
  /** the materials of everything that is not the head (they skip the pixels of the figure's own head) */
  private under: THREE.Material[] = [];
  /** per limb: the bones' sideways bends and the phase of the width wobble (fixed per character) */
  private bow: [number, number][]; private wobPh: number[];
  constructor(private rc: RigCast, look: Look, o: { hat?: Hat; acc?: Acc[] } = {}) {
    this.look = look;
    const L = look, hand = rc.hand, d = (this.dim = dimOf(L, hand)), U = rc.U, sd = L.seed;
    // accessories: no two in one slot; at most one hat, which decides how the hair and the face are drawn
    const accs = (this.acc = [...(o.hat ? [hatAcc(o.hat)] : []), ...(o.acc ?? [])]), slotOf = new Map<string, string>();
    for (const a of accs) {
      if (a.hat && !a.slots.includes("hat")) throw new Error(`rig3d: accessory "${a.name}" is a hat and must take the "hat" slot`);
      // (a hat covers the crown whether it says so or not: nothing else can sit there)
      for (const sl of a.hat && !a.slots.includes("crown") ? [...a.slots, "crown" as AccSlot] : a.slots) {
        if (slotOf.has(sl)) throw new Error(`rig3d: accessories "${slotOf.get(sl)}" and "${a.name}" both take the "${sl}" slot`);
        slotOf.set(sl, a.name);
      }
    }
    const hatA = accs.find((a) => a.hat), rimDeg = hatA ? hatA.hat!.rim : 0;    // where the hat's rim sits, degrees from the crown
    const cut = !!hatA && (hatA.hat!.hair ?? "cut") === "cut", hairProps = !hatA && !accs.some((a) => a.noHairProps);
    this.shade = !!hatA && (hatA.hat!.shade ?? cut);
    this.fa = faceAccOf(L, accs);
    this.bow = [0, 1, 2, 3].map((i) => { const k = (i < 2 ? 0.07 : 0.075) * hand; return [(rnd(sd, 40 + i) - 0.5) * k, (rnd(sd, 44 + i) - 0.5) * k] as [number, number]; });
    this.wobPh = [0, 1, 2, 3].map((i) => rnd(sd, 48 + i) * 6.283);
    const add = (parent: THREE.Object3D, m: THREE.Mesh, shadow = true) => { m.castShadow = shadow; m.layers.set(NOINK); parent.add(m); return m; };
    const pullU = this.pullU, HP: HullO = { pull: pullU };
    let hid = 0;
    /** a painted mesh plus its ink hull (same geometry) */
    const inked = (parent: THREE.Object3D, geo: THREE.BufferGeometry, mat: THREE.Material, w: number, thick = 0.4, ho: HullO = {}, hg: THREE.BufferGeometry = geo) => {
      const m = add(parent, new THREE.Mesh(geo, mat)), hs: HullO = { brush: 0.26 * hand, seed: sd + 0.37 * ++hid, ...ho };
      const h = add(m, new THREE.Mesh(hg, hullMat(U, w, thick, hs)), false);
      h.frustumCulled = false; h.userData.hull = true; m.userData.ink = w;
      if (ho.pull) {                                                     // a head part: its depth-only twins
        const dp = ho.pull === this.curlPullU ? this.curlDepthU : this.depthU, hm = hullMat(U, w, thick, { ...hs, pull: dp });
        hm.colorWrite = false;
        for (const tm of [rigMat(U, PART.head, { colorWrite: false }, "plain", undefined, dp), hm]) {
          const t = add(m, new THREE.Mesh(tm === hm ? hg : geo, tm), false);
          t.frustumCulled = false; t.userData.depthOnly = true; if (tm === hm) t.userData.hull = true;
        }
      }
      return m;
    };
    this.group.add(this.torsoG);
    this.torsoG.matrixAutoUpdate = false;
    // body: lathe (u = 0 at the back, 0.5 at the front) with the outfit wrapped on it
    inked(this.torsoG, bodyGeo(d.Ht, d.rb, d.rt, d.bw), rigMat(U, { ...PART.body, k: Math.min(PART.body.k, rc.light.bodyShadeK ?? 1) }, { map: outfitTex(L, hand, accs, d) }), HULL.body, 0.5, { down: 0.3 });
    // head: the look's blob with the face projected on it; hair and headband are painted on it by its shader
    this.headG.position.set(0, d.Ht + 0.72 * d.R, 0);
    this.torsoG.add(this.headG);
    const warp = headWarp(d.H, d.ys, hand), at = (x: number, y: number, z: number) => warp(V(x, y, z)).multiplyScalar(d.R);
    const onHead = (part: Part, mo: THREE.MeshBasicMaterialParameters) => rigMat(U, part, mo, "plain", undefined, pullU);
    const skin = new THREE.Color(L.skin);
    const bleach = rc.light.bleach ?? 0;
    if (bleach > 0 && LUMA(new THREE.Color(L.skin).convertLinearToSRGB()) >= 0.76) { const mx = Math.max(skin.r, skin.g, skin.b); skin.lerp(new THREE.Color(mx, mx, mx), bleach); }
    const bandC = new THREE.Color(L.headband ?? "#000000");
    this.faceU = {
      uFace: { value: faceTex(L, "neutral", 0, this.shade, hand, 0, this.fa) }, uFF: { value: V(0, 0, 1) }, uFR: { value: V(1, 0, 0) }, uFU: { value: V(0, 1, 0) }, uFaceOn: { value: 1 },
      uHead: { value: new THREE.Vector4(0, 0, 0, d.R) }, uInk: { value: new THREE.Color(RIG_INK) },
      uHair: { value: hairTex(L, cut ? rimDeg : 0) }, uHairCol: { value: new THREE.Color(L.hairCol) }, uHeadband: { value: new THREE.Vector4(bandC.r, bandC.g, bandC.b, L.headband && !hatA && !slotOf.has("crown") ? 1 : 0) },
      uHairPart: { value: hairDraw(L, hand, cut) }, uHairInk: { value: 0.03 * hand },
      uBrim: { value: new THREE.Vector4(0, 0, 0, 0) }, uBrimAz: { value: new THREE.Vector2(0, 4) }, uKeyH: { value: V(0, 1, 0) }, uRim: { value: new THREE.Vector4(...RIM) },
    };
    const skinM = inked(this.headG, warpGeo(new THREE.SphereGeometry(1, 72, 48), warp, d.R), rigMat(U, PART.head, { color: skin }, "face", this.faceU, pullU), HULL.head, 0.63, { down: 0.5, ...HP });
    const shells: THREE.Mesh[] = [];                                            // a hat's parts that enclose the head
    const hairSolid = () => onHead(PART.hair, { color: L.hairCol });
    // the curls are lumps on the head's hair: they take the head's light, not one each (a bun or a ponytail stands
    // clear of the head and keeps its own)
    const curlM = () => rigMat(U, PART.hair, { color: L.hairCol }, "plain", undefined, pullU, this.faceU.uHead);
    if (L.hair === "bun" && hairProps) {
      const bun = inked(this.headG, new THREE.SphereGeometry(d.R * 0.36, 24, 16), hairSolid(), HULL.prop * 0.8, 0.4, HP);
      bun.position.copy(at(0, 0.78, -0.52));
    }
    if (L.hair === "curly" && hairProps) {
      const spots: [number, number][] = [[0, 22], [70, 40], [-70, 40], [140, 55], [-140, 55], [180, 20], [180, 78], [105, 80], [-105, 80]];
      for (const [azD, thD] of spots) {
        const az = rad(azD), th = rad(thD), c = inked(this.headG, new THREE.SphereGeometry(d.R * 0.2, 16, 12), curlM(), HULL.prop * 0.7, 0.4, { pull: this.curlPullU });
        c.position.copy(at(Math.sin(th) * Math.sin(az) * 0.93, Math.cos(th) * 0.93, Math.sin(th) * Math.cos(az) * 0.93));
      }
    }
    if (L.hair === "ponytail" || L.hair === "long") {
      const long = L.hair === "long", len = long ? d.R * 0.95 : d.R * 0.8, rr = long ? d.R * 0.48 : d.R * 0.17;
      // the long fall hangs behind the body at its true depth; a ponytail belongs to the head
      const tail = inked(this.headG, new THREE.CapsuleGeometry(rr, len, 6, 16), long ? rigMat(U, PART.hair, { color: L.hairCol }) : hairSolid(), HULL.prop * 0.8, 0.4, long ? {} : HP);
      if (long) { tail.scale.z = 0.42; tail.position.set(0, -0.42 * d.R, -(d.rt + rr * 0.42 + 0.016)); tail.rotation.x = 0.05; tail.userData.under = true; }
      else { tail.position.copy(at(0, 0.1, -1)).add(V(0, 0, -rr * 0.9)); tail.rotation.x = 0.42; }
    }
    this.hatLine = cut ? rimDeg : 0;
    // an edge that throws a shadow on the head (PartKit.shadow): the widest one is kept
    const castShadow = (o: { y: number; r: number; rSide?: number; from?: number; to?: number }) => {
      const B = this.faceU.uBrim.value;
      if (o.r <= 1.02 || (B.w > 0 && o.r <= B.y)) return;                       // (an edge that does not clear the head shades nothing)
      B.set(o.y, o.r, o.rSide ?? o.r, 1);
      this.faceU.uBrimAz.value.set(o.from !== undefined && o.to !== undefined ? rad((o.from + o.to) / 2) : 0, o.from !== undefined && o.to !== undefined ? rad((o.to - o.from) / 2) : 4);
    };
    // accessories' 3D parts, through a kit that knows the layering rules (see PartKit)
    for (const a of accs) {
      if (!a.build) continue;
      let tq: THREE.Quaternion | null = null;
      const part = <T extends THREE.Object3D>(o3: T) => { this.accParts.push({ name: a.name, o: o3 }); return o3; };
      const toM = (v: V3) => { if (tq) v.applyQuaternion(tq); return warp(v).multiplyScalar(d.R); };
      const parentOf = (on: AccMount) => (on === "head" ? this.headG : on === "body" ? this.torsoG : on);
      const paint = (on: AccMount, po: PartO): THREE.Material => {
        if (po.mat) return po.mat;
        const part = po.paint === "cloth" ? { ...PART.body, k: Math.min(PART.body.k, rc.light.bodyShadeK ?? 1) } : po.paint === "hair" ? PART.hair : po.paint === "skin" ? PART.head : PART.prop;
        const mo: THREE.MeshBasicMaterialParameters = { color: po.col ?? "#ffffff" };
        if (po.map) mo.map = po.map;
        return on === "head" ? onHead(part, mo) : rigMat(U, part, mo);
      };
      const kit: PartKit = {
        look: L, hand, R: d.R, Ht: d.Ht, rb: d.rb, rt: d.rt, headY: d.Ht + 0.72 * d.R, handR: d.handR, INK: HULL.prop, rim: rimDeg,
        bodyR: (t, az = 0) => { const y = clamp(t, 0, 1) * d.Ht, x = Math.sin(rad(az)), z = Math.cos(rad(az)); return bodyR(y, d.Ht, d.rb, d.rt) * d.bw(x, y, z); },
        toM, at: (x, y, z) => toM(V(x, y, z)),
        tilt: (left, forward = 0) => { tq = new THREE.Quaternion().setFromEuler(new THREE.Euler(rad(forward), 0, rad(-left), "XYZ")); },
        put: (m, x, y, z) => { m.position.copy(toM(V(x, y, z))); if (tq) m.quaternion.copy(tq); return m; },
        paint,
        shell: (so) => {
          if (so.geo && so.rimInk) throw new Error(`rig3d: accessory "${a.name}": shell({ geo, rimInk }) cannot work, the kit does not know where a patch's lower edge is. Paint the line on a map of your own (PartKit.tex)`);
          const from = so.from ?? 0, to = so.to ?? 60, r = so.r ?? 1.08, sq = so.squash ?? 1, tl = tq;
          const g0 = so.geo ?? (so.tuck || so.tuckTop ? tuckedBand(r, from, to, so.rings ?? 14, sq, so.tuck ?? 0, so.tuckTop ?? 0, so.onR ?? 1)
            : new THREE.SphereGeometry(r, 48, so.rings ?? 14, 0, Math.PI * 2, rad(from), rad(to - from)));
          const pre = sq !== 1 || tl ? (v: V3) => { v.y *= sq; if (tl) v.applyQuaternion(tl); } : undefined;
          const po: PartO = so.rimInk && !so.map && !so.mat ? { ...so, map: rimInkTex(so.rimInk / (r * d.R * rad(to - from))) } : so;
          const m = part(inked(this.headG, warpGeo(g0, warp, d.R, pre), paint("head", po), so.ink ?? HULL.prop * 1.2, so.thick ?? 0.45, HP));
          shells.push(m);
          return m;
        },
        solid: (on, geo, po = {}) => {
          const w = po.ink ?? HULL.prop * 0.8, own = geo.userData.hull as ((ink: number) => THREE.BufferGeometry) | undefined;
          return part(inked(parentOf(on), geo, paint(on, po), w, po.thick ?? 0.4, on === "head" ? HP : {}, own ? own(w) : hardEdges(geo) ? hullGeo(geo) : geo));
        },
        plate: (on, geo, po = {}) => {
          const m = part(add(parentOf(on), new THREE.Mesh(geo, paint(on, po.map || po.mat || po.edge === false ? po : { ...po, map: peakTex() }))));
          if (on === "head") {
            const t = add(m, new THREE.Mesh(geo, rigMat(U, PART.head, { colorWrite: false }, "plain", undefined, this.depthU)), false);
            t.frustumCulled = false; t.userData.depthOnly = true;
          }
          return m;
        },
        brim: (bo) => {
          const mid = bo.from !== undefined && bo.to !== undefined ? (bo.from + bo.to) / 2 : 0, outAt = (az: number) => (typeof bo.out === "number" ? bo.out : bo.out(az));
          const full = bo.from === undefined || bo.to === undefined, oF = outAt(mid), oS = full ? (outAt(mid + 90) + outAt(mid - 90)) / 2 : oF;
          castShadow({ y: bo.y - (bo.droop ?? 0.1) * oF, r: bo.rIn + oF, rSide: bo.rIn + oS, from: bo.from, to: bo.to });
          return brimGeo(bo, toM);
        },
        shadow: castShadow,
        band: (bo) => bandGeo(bo.r, bo.a0, bo.a1, bo.half, bo.yaw, bo.edge),
        held: (i, ho = {}) => {
          const g = new THREE.Group();
          if (ho.layer === "free") g.userData.free = true;
          this.group.add(g); this.held.push({ g, i, off: V(...(ho.offset ?? [0, 0, 0])), rot: ho.rot ?? [0, 0, 0], hang: !!ho.hang, posed: !!ho.posed, pts: null, ink: 0, far: 0 });
          return g;
        },
        keepOut: (c, r) => { this.keep.push({ c: c.clone(), r, w: V() }); },
        tex: (w, h, draw, key) => {
          const k = key ? "acc:" + a.name + ":" + key : undefined;       // (its own name space: two accessories may use the same key)
          let t = k ? accTexCache.get(k) : undefined;
          if (!t) { t = canvasTex(w, h, draw); if (k) accTexCache.set(k, t); }
          return t;
        },
      };
      a.build(kit);
    }
    // limbs: 0 right arm, 1 left arm, 2 right leg, 3 left leg (built in world space: the group stays at the origin)
    // Each arm has its own materials (the legs and feet share theirs): an arm can then be drawn in front of the head
    // (state.armFront) while the rest of the figure stays under it.
    const mkLimb = () => rigMat(U, PART.limb, { color: LIMB_COL }, "tube"), mkBall = () => rigMat(U, PART.ball, { color: LIMB_COL });
    const mkLimbHull = () => hullMat(U, HULL.limb, 0.3), mkBallHull = () => hullMat(U, HULL.hand, 0.3, { brush: 0.15 * hand, seed: sd + 7, freq: 60 });
    const limbMats = [mkLimb(), mkLimb()], limbMat = mkLimb(), ballMats = [mkBall(), mkBall()], ballMat = mkBall();
    const limbHulls = [mkLimbHull(), mkLimbHull()], limbHull = mkLimbHull(), ballHulls = [mkBallHull(), mkBallHull()];
    for (let i = 0; i < 2; i++) this.armMats[i].push(limbMats[i], ballMats[i], limbHulls[i], ballHulls[i]);
    for (let i = 0; i < 4; i++) {
      const tb = new Tube(); this.limbs.push(tb);
      add(this.group, new THREE.Mesh(tb.geo, i < 2 ? limbMats[i] : limbMat)).frustumCulled = false;
      add(this.group, new THREE.Mesh(tb.geo, i < 2 ? limbHulls[i] : limbHull), false).frustumCulled = false;
    }
    const handGeo = new THREE.SphereGeometry(d.handR, 24, 16), capGeo = new THREE.SphereGeometry(d.limbR, 12, 8);
    // L foot: the leg bent forward at the ankle: the same thickness, heel on the ankle
    const footLen = 0.055, footGeo = new THREE.CapsuleGeometry(d.legR, footLen, 5, 12);
    // (the feet keep their true depth, without SLOPE_BIAS: they lie on the floor, which is not a rig material and is
    //  not moved back, so the floor would show through a foot's lowest edge, a pixel here and there)
    const footMat = rigMat(U, PART.ball, { color: LIMB_COL }), footHull = hullMat(U, HULL.limb, 0.3);
    footMat.polygonOffset = footHull.polygonOffset = false;
    for (let i = 0; i < 2; i++) {
      const h = add(this.group, new THREE.Mesh(handGeo, ballMats[i]));
      add(h, new THREE.Mesh(handGeo, ballHulls[i]), false).frustumCulled = false;
      this.hands.push(h);
      const cap = add(this.group, new THREE.Mesh(capGeo, ballMats[i]));   // the arm's rounded root on the shoulder
      add(cap, new THREE.Mesh(capGeo, limbHulls[i]), false).frustumCulled = false;
      this.caps.push(cap);
      const fg = new THREE.Group(); this.group.add(fg);
      const foot = add(fg, new THREE.Mesh(footGeo, footMat));
      foot.rotation.x = Math.PI / 2; foot.position.set(0, 0, footLen / 2);
      add(foot, new THREE.Mesh(footGeo, footHull), false).frustumCulled = false;
      this.feet.push(fg);
    }
    this.blob = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), blobMat(rc.light.contact ?? "#e0dae8"));
    this.blob.layers.set(NOINK); this.blob.renderOrder = 0.5; this.group.add(this.blob);
    // clipboard prop (hidden unless asked for)
    const cb = new THREE.Group(); cb.visible = false; this.group.add(cb); this.clip = cb;
    const board = add(cb, new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.27, 0.008), rigMat(U, PART.prop, { color: "#b9824c" })));
    const paper = new THREE.Mesh(new THREE.PlaneGeometry(0.17, 0.22), rigMat(U, PART.prop, { map: canvasTex(256, 330, (g) => {
      g.fillStyle = "#f7f5ee"; g.fillRect(0, 0, 256, 330); g.strokeStyle = "#9aa3b5"; g.lineWidth = 6;
      for (let y = 60; y < 310; y += 34) { g.beginPath(); g.moveTo(26, y); g.lineTo(y % 68 ? 230 : 180, y); g.stroke(); }
    }) }));
    paper.layers.set(NOINK); paper.position.set(0, -0.01, 0.0046); board.add(paper);
    const bh = add(cb, new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.27, 0.008), new THREE.MeshBasicMaterial({ color: RIG_INK, side: THREE.BackSide })), false);
    bh.scale.set(1.05, 1.04, 2.2);
    // layering: head parts first (they mark their pixels), then the rest of the figure, which skips those pixels
    const sid = rc.newId(), heads = new Set<THREE.Object3D>();
    this.headG.traverse((o3) => { if (!o3.userData.under && !(o3.parent && o3.parent.userData.under)) heads.add(o3); });
    this.group.traverse((o3) => {
      const m = o3 as THREE.Mesh;
      if (!m.isMesh || m === this.blob) return;
      let inHand = -1;
      for (let q: THREE.Object3D | null = m; q; q = q.parent) {
        if (q === cb || q.userData.free) return;                           // props keep their true depth
        const hd = this.held.find((x) => x.g === q);
        if (hd) inHand = hd.i;
      }
      const head = heads.has(m), mat = m.material as THREE.Material;
      if (m.userData.depthOnly) { layerMat(mat, sid, "depth"); m.renderOrder = 2; return; }
      layerMat(mat, sid, head ? "head" : "under");
      if (!head) { m.renderOrder = 1; if (!this.under.includes(mat)) this.under.push(mat); }
      if (inHand >= 0 && !this.armMats[inHand].includes(mat)) this.armMats[inHand].push(mat);   // a held thing follows its arm
    });
    {
      const rm = new THREE.MeshBasicMaterial({ colorWrite: false });
      layerMat(rm, sid, "depth");
      const ring = (this.ring = new THREE.Mesh(new THREE.CircleGeometry(1, 48), rm));
      ring.layers.set(NOINK); ring.renderOrder = 0.6; ring.frustumCulled = false; ring.visible = false; this.group.add(ring);
    }
    // a hat's shells are drawn before the skin, and the skin skips the pixels they took: a shell's front is always
    // nearer than the head inside it, and this does not rest on the depth test. (At the head's own outline, under a
    // hat, the rasteriser can give one sample of an edge-on triangle a depth in front of the hat: a one-pixel speck
    // of skin on the hat, here and there, for one frame.)
    const skinMat = skinM.material as THREE.Material, skinHull = skinM.children.find((c) => !c.userData.depthOnly) as THREE.Mesh;
    if (shells.length) {
      for (const sh of shells) sh.renderOrder = -0.2;
      skinM.renderOrder = -0.1; skinMat.stencilFunc = THREE.NotEqualStencilFunc; skinMat.stencilFuncMask = ID_BITS;
    }
    // the skin marks its pixels (SKIN_BIT) and its own ink hull, drawn right after it, leaves them alone
    skinMat.stencilRef = sid | SKIN_BIT;
    const hm = skinHull.material as THREE.Material;
    hm.stencilRef = sid | SKIN_BIT; hm.stencilFunc = THREE.NotEqualStencilFunc; skinHull.renderOrder = skinM.renderOrder + 0.05;
  }

  set(s: Partial<RigState>) { Object.assign(this.state, s); return this; }
  handWorld(i: 0 | 1) { return this.out.hand[i].clone(); }
  elbowWorld(i: 0 | 1) { return this.out.elbow[i].clone(); }
  headWorld() { return this.out.head.clone(); }
  footWorld(i: 0 | 1) { return this.out.foot[i].clone(); }
  get bodyYaw() { return this.out.bodyYaw; }
  get faceYaw() { return this.out.faceYaw; }
  /** QA (scripts/rig3d/acc_check.py, step "rules"): which of the rules every accessory has to keep (RIG3D.md) this
   *  figure's accessories break, found from their geometry alone; nothing is drawn. One entry per accessory and rule.
   *    face: a 3D part on the head lies in front of the face (FACE_ZONE) */
  accRules(): { acc: string; rule: string; msg: string }[] {
    const out: { acc: string; rule: string; msg: string }[] = [], d = this.dim, v = V();
    const rel = (o: THREE.Object3D, root: THREE.Object3D) => { const m = new THREE.Matrix4(); for (let p: THREE.Object3D | null = o; p && p !== root; p = p.parent) { p.updateMatrix(); m.premultiply(p.matrix); } return m; };
    const under = (o: THREE.Object3D, root: THREE.Object3D) => { for (let p: THREE.Object3D | null = o; p; p = p.parent) if (p === root) return true; return false; };
    const face = new Map<string, { n: number; az: number; y: number }>();
    for (const ap of this.accParts) {
      const o = ap.o as THREE.Mesh;
      if (!o.isMesh || !under(o, this.headG)) continue;
      const P = o.geometry.attributes.position, m = rel(o, this.headG);
      for (let i = 0; i < P.count; i++) {
        v.fromBufferAttribute(P, i).applyMatrix4(m).divideScalar(d.R);
        if (v.z <= 0 || v.y >= FACE_ZONE.top || v.y < -1.1 || v.length() < 0.97) continue;
        const az = (Math.atan2(Math.abs(v.x), v.z) * 180) / Math.PI;
        if (az >= FACE_ZONE.az) continue;
        const f = face.get(ap.name) ?? { n: 0, az: 180, y: 0 };
        f.n++; if (az < f.az) { f.az = az; f.y = v.y; }
        face.set(ap.name, f);
      }
    }
    for (const [acc, f] of face) if (f.n >= 4) out.push({ acc, rule: "face", msg: `${f.n} points of its 3D parts lie in front of the face (nearest: ${f.az.toFixed(0)} deg from the face side at height ${f.y.toFixed(2)}; the face zone is within ${FACE_ZONE.az} deg and below ${FACE_ZONE.top}). The face turns to the camera on its own, so such a part covers an eye or the mouth, or leaves the mouth, at some camera angle. Draw it on the face (Acc.face) or keep it beside or above the face` });
    return out;
  }

  /** the pose: hips and feet in the travel frame, hands torso-local (or travel / staged). Hand targets are set in arm
   *  lengths from the shoulders, so they stay within reach for any build. */
  private solvePose(): BodyPose {
    const d = this.dim, st = this.state, P = st.pose, t = P.t ?? 0, sx = 0.085, A = d.upper + d.fore, shx = (i: number) => Math.abs(d.sh[i].x), shy = d.sh[0].y, shz = d.sh[0].z;
    const bp: BodyPose = {
      hip: V(0, d.hipY, 0), pitch: 0, roll: 0, sway: 0, breathe: 0.012 * Math.sin(t * 2 * Math.PI * 0.28),
      hand: [null, null], elbowPole: [V(-1, -0.1, -0.7), V(1, -0.1, -0.7)],
      ankle: [V(-sx, d.ankleY, 0), V(sx, d.ankleY, 0)], footYaw: [-0.35, 0.35], headPitch: rad(st.lookDown ?? 0),
      plan: [null, null], front: [false, false],
    };
    // hanging hand: near full reach (almost straight, a small outward bow), just outside the body's side
    const reach = 0.972 * A, hung = [false, false];
    const hang = (i: number, dz = 0): HandT => {
      const s = i ? 1 : -1, hx = d.rb + 0.05, hz = 0.03 + dz, dx = hx - shx(i), dzz = hz - shz;
      hung[i] = true;
      return { p: V(s * hx, shy - Math.sqrt(Math.max(0.01, reach * reach - dx * dx - dzz * dzz)), hz), f: 0 };
    };
    // a hand that carries a hanging thing (PartKit.held hang) stays down: a gesture goes to the other arm if it is free
    const carries = (i: number) => this.held.some((h) => h.hang && h.i === i);
    const free = (a: 0 | 1): 0 | 1 => (carries(a) && !carries(1 - a) ? ((1 - a) as 0 | 1) : a);
    // seated: the lower body belongs to the seat whatever the pose; a pose made for standing legs sits still
    const sit = this.sit, kind: RigPoseKind = sit && (P.kind === "walk" || P.kind === "haul" || P.kind === "idle") ? "sit" : P.kind;
    switch (kind) {
      case "sit": case "desk": {
        bp.roll = bp.sway = rad(0.8) * Math.sin(t * 2 * Math.PI * 0.21);
        bp.hand = [hang(0), hang(1)];                  // seated, a hand that would hang rests (see below)
        break;
      }
      case "write": {
        const a = P.arm ?? 0;
        bp.hand = [hang(0), hang(1)];
        if (sit && sit.deskZ !== null) { bp.plan[a] = "write"; hung[a] = false; bp.hand[a] = null; }
        bp.headPitch += rad(13);
        break;
      }
      case "phone": {
        const a = P.arm ?? 1;
        bp.hand[1 - a] = hang(1 - a);
        bp.plan[a] = "phone"; bp.front[a] = true;
        bp.headPitch += rad(17) * (1 - smooth(P.amount ?? 0));      // looking down at it; level again for a call
        break;
      }
      case "shh": {
        const a = P.arm ?? 1;
        bp.hand[1 - a] = hang(1 - a);
        bp.plan[a] = "shh"; bp.front[a] = true;
        break;
      }
      case "idle": {
        bp.roll = bp.sway = rad(1.2) * Math.sin(t * 2 * Math.PI * 0.21);
        bp.hand = [hang(0, 0.012 * Math.sin(t * 1.3)), hang(1, 0.012 * Math.sin(t * 1.3 + 1))];
        break;
      }
      case "walk": {
        const ph = P.phase ?? (t * 1.6) % 1, S = clamp(P.stride ?? STRIDE, 0.05, 0.3);
        for (let k = 0; k < 2; k++) {
          const q = (((ph + 0.5 * k) % 1) + 1) % 1;
          let z: number, y = d.ankleY;
          if (q < STANCE) z = S - (2 * S * q) / STANCE;
          else { const u = (q - STANCE) / (1 - STANCE); z = -S + 2 * S * smooth(u); y += 0.07 * Math.sin(Math.PI * u); }
          bp.ankle[k].set((k ? 1 : -1) * 0.07, y, z);
          bp.hand[1 - k] = hang(1 - k, -z * 0.8);        // the opposite arm swings with this leg
        }
        bp.footYaw = [-0.12, 0.12];
        // the bounce (WALK): u = 0 at a low point, just after a foot lands, .. 1 at the next; up = how high the body is
        // (it rises quickly out of the low point, slows into a rounded high point as the legs pass, then drops);
        // the head and what it wears tip forward right after each low point and are level again by the passing pose
        const u = (((2 * ph - WALK.low) % 1) + 1) % 1, am = (P.amount ?? 1) * clamp(S / STRIDE, 0.5, 1.25);           // (short steps bounce less)
        const up = u < WALK.top ? Math.sin((Math.PI / 2) * (u / WALK.top)) : Math.cos((Math.PI / 2) * ((u - WALK.top) / (1 - WALK.top)));
        const x = Math.min(1, u / WALK.nodLen), nod = 6.75 * x * (1 - x) * (1 - x);
        bp.hip.y += (WALK.lift - WALK.bob * (1 - up)) * am;
        bp.headPitch += rad(WALK.nod) * am * nod;
        bp.pitch = rad(4 + WALK.rock * am * (1 - up));
        break;
      }
      case "wave": {
        const a = free(P.arm ?? 1), s = a ? 1 : -1, w = Math.sin(t * 2 * Math.PI * 1.6);
        bp.hand[1 - a] = hang(1 - a);
        bp.hand[a] = { p: V(s * (shx(a) + A * (0.62 + 0.1 * w)), shy + 0.36 * A, shz + 0.2 * A), f: 2 };
        bp.elbowPole[a] = V(s, -1, 0.1);
        bp.roll = s * rad(-3);
        break;
      }
      case "cheer": {
        const up = (0.42 + 0.08 * (P.amount ?? 1) * Math.sin(t * 2 * Math.PI * 1.2)) * A;
        bp.hand = [{ p: V(-(shx(0) + 0.52 * A), shy + up, shz + 0.15 * A), f: 2 }, { p: V(shx(1) + 0.52 * A, shy + up, shz + 0.15 * A), f: 2 }];
        bp.elbowPole = [V(-1, -0.6, 0.1), V(1, -0.6, 0.1)];
        break;
      }
      case "point": {
        const a = free(P.arm ?? 1), s = a ? 1 : -1;
        bp.hand[1 - a] = hang(1 - a);
        bp.hand[a] = { p: V(s * (shx(a) + 0.12 * A), shy - 0.03, shz + 0.86 * A), f: 0 };      // replaced by the world target if given
        bp.elbowPole[a] = V(s, -1, 0.1);
        break;
      }
      case "hold": {
        const a = st.clipboard ?? 1, s = a ? 1 : -1;
        bp.hand[a] = { p: V(s * 0.55 * d.rb, shy - 0.62 * A, d.rb + 0.22 * A), f: 0 };
        bp.hand[1 - a] = { p: V(-s * 0.2 * d.rb, shy - 0.68 * A, d.rb + 0.2 * A), f: 0 };
        bp.elbowPole = [V(-1, -0.8, 0.1), V(1, -0.8, 0.1)];
        break;
      }
      case "haul": {
        const am = P.amount ?? 1, ph = P.phase ?? (t * 0.7) % 1, heave = Math.sin(ph * 2 * Math.PI);
        bp.pitch = -rad(19) * am - rad(4) * am * heave;
        bp.hip.set(0, d.hipY - 0.07 * am, -0.06 * am - 0.015 * am * heave);
        bp.ankle = [V(-0.09, d.ankleY, 0.23 * am), V(0.09, d.ankleY, -0.19 * am)];
        bp.footYaw = [-0.2, 0.45];
        bp.hand = [{ p: V(0.03, d.hipY + 0.5 * d.Ht, 0.06), f: 1 }, { p: V(0.06, d.hipY + 0.5 * d.Ht, 0.15), f: 1 }];
        bp.elbowPole = [V(-0.5, -0.5, 1), V(0.9, -0.6, 0.3)];
        break;
      }
    }
    if (P.kind === "wave" || P.kind === "point" || P.kind === "cheer") for (let i = 0; i < 2; i++) if (carries(i)) { bp.hand[i] = hang(i); bp.elbowPole[i] = V(i ? 1 : -1, -0.1, -0.7); }
    if (sit) {
      // the body on the seat: its bottom SEAT_LIFT above the top (it rolls on its round bottom as it leans; _update adds
      // that), a small lean forward: more to write, and at a desk never so far that the belly's ink meets the edge
      const desk = sit.deskZ !== null, far = desk ? clamp((sit.deskZ! - 0.26) / 0.01, 0, 8) : 0;
      const want = desk && (kind === "write" || kind === "sit" || kind === "desk") ? rad((kind === "write" ? 12 : 5) + far) : SEAT_LEAN;
      bp.pitch = desk ? Math.min(want, sit.fit.leanMax) : want;
      bp.hip.set(0, sit.h + SEAT_LIFT, 0);
      // a hand that would hang rests instead: on the desk, or on the lap. Holding a board over a desk: above its top.
      for (let i = 0; i < 2; i++) if (hung[i]) { bp.hand[i] = null; bp.plan[i] = desk ? "desk" : "lap"; }
      if (kind === "hold" && desk) for (const h of bp.hand) if (h) h.p.y = Math.max(h.p.y, sit.deskY - sit.h - SEAT_LIFT + 0.07);
    }
    return bp;
  }

  /** this frame's seat, or null when the figure stands (see RigSeat) */
  private resolveSeat(): Sit | null {
    const st = this.state, k = st.pose.kind, d = this.dim;
    let s = st.seat;
    if (!s) {
      if (k !== "sit" && k !== "desk" && k !== "write") return null;
      s = { top: V(st.at.x, st.at.y + 0.472, st.at.z), back: 0, floor: st.at.y };       // as the cards: a seat 0.472 m high under `at`
    }
    const floor = s.floor ?? 0;
    let back = s.back ?? 0.03;
    if (s.backrest !== undefined) back = Math.min(back, s.backrest - (d.rb * 1.05 + BODY_INK + 0.004));
    const B: SeatBox = {
      h: s.top.y - floor, front: (s.front ?? 0.2) + back, deskZ: s.deskEdge !== undefined ? s.deskEdge + back : null,
      deskY: (s.deskTop ?? 0.75) - floor, restZ: s.backrest !== undefined ? back - s.backrest : null, restY: (s.backrestTop ?? s.top.y + 0.42) - floor,
    };
    const key = [B.h, B.front, B.deskZ, B.deskY, B.restZ, B.restY].map((x) => (x === null ? "-" : x.toFixed(5))).join("|");
    let fit = this.fits.get(key);
    if (!fit) { if (this.fits.size > 16) this.fits.clear(); fit = this.seatFit(B); this.fits.set(key, fit); }
    const sn = Math.sin(st.facing), cs = Math.cos(st.facing);
    this.sitF = [sn, cs];
    this.sitAt.set(s.top.x - sn * back, floor, s.top.z - cs * back);
    return { ...B, at: this.sitAt, fit };
  }
  /** the body's gap to the desk's near edge when it leans p forward (its ink counted) */
  private bodyDeskGap(S: SeatBox, p: number) {
    if (S.deskZ === null) return 1;
    const d = this.dim, by = S.h + SEAT_LIFT + d.rb * (1 - Math.cos(p)), cp = Math.cos(p), sp = Math.sin(p);
    let g = 1;
    for (let c = 0; c <= 2; c++) {                                        // the edge's corner, the slab's face, its lower corner
      const ry = S.deskY - (c * DESK_T) / 2 - by, rz = S.deskZ, t = ry * cp + rz * sp, dp = rz * cp - ry * sp;
      const r0 = bodyR(clamp(t, 1e-4, d.Ht - 1e-4), d.Ht, d.rb, d.rt) * 1.05;
      if (dp <= r0 && t > 0 && t < d.Ht) { g = Math.min(g, dp - r0); continue; }
      for (let k = -4; k <= 4; k++) { const tt = clamp(t + k * 0.015, 1e-4, d.Ht - 1e-4); g = Math.min(g, Math.hypot(dp - bodyR(tt, d.Ht, d.rb, d.rt) * 1.05, t - tt)); }
    }
    return g - BODY_INK;
  }
  /** how the legs lie on a seat (see SeatFit). Thighs forward over the seat in the travel frame, as low as they can
   *  lie with their ink clear of it; the knees bend past the front edge; the shins hang. Searched per leg: the smallest
   *  reach forward of the shin, then the lowest thigh, for which every ring of the leg and the foot clears the seat,
   *  the desk and the floor. So on a chair the feet dangle or stand, as the leg's length decides; on a low seat the
   *  knees come up and the feet stand on the floor; on a seat too deep for the knee to pass its edge they stand on
   *  the seat. The hip joints are the seat's (they do not ride the torso's lean or breath), so seated legs are still. */
  private seatFit(S: SeatBox): SeatFit {
    const d = this.dim, own = d.legR * 1.08 + HULL.limb, yH = S.h + SEAT_LIFT + 0.09 * d.Ht, splay = rad(4), footLen = 0.055, onFloor = own + 0.004;
    const H: [V3, V3] = [V(-0.38 * d.rb, yH, 0), V(0.38 * d.rb, yH, 0)], K: [V3, V3] = [V(), V()], A: [V3, V3] = [V(), V()];
    const place = (i: number, sl: number, a: number) => {
      const sg = i ? 1 : -1;
      K[i].set(H[i].x + sg * d.thigh * Math.sin(splay) * Math.cos(sl), yH - d.thigh * Math.sin(sl), d.thigh * Math.cos(splay) * Math.cos(sl));
      A[i].set(K[i].x, K[i].y - d.shin * Math.cos(a), K[i].z + d.shin * Math.sin(a));
    };
    const pitchOf = (i: number, a: number) => a * smooth((A[i].y - onFloor) / 0.03);
    /** [gap to the seat and desk, gap to the floor] of leg i as placed */
    const gaps = (i: number, a: number): [number, number] => {
      let fu = 1, fl = 1;
      for (let r = 0; r <= SEG; r++) {
        limbAt(H[i], K[i], A[i], r, _w, undefined, this.bow[2 + i]);
        fu = Math.min(fu, furnGap(S, _w.y, _w.z) - own); fl = Math.min(fl, _w.y - own);
      }
      const fp = pitchOf(i, a);
      for (let u = 0; u <= 1; u += 0.5) {
        const y = A[i].y + Math.sin(fp) * footLen * u, z = A[i].z + Math.cos(fp) * footLen * u;
        fu = Math.min(fu, furnGap(S, y, z) - own); fl = Math.min(fl, y - own);
      }
      return [fu, fl];
    };
    const ok = (i: number, sl: number, a: number) => { place(i, sl, a); const g = gaps(i, a); return g[0] >= REST_GAP && g[1] >= 0.004; };
    const lowest = (i: number, a: number): number | null => {
      const S0 = rad(35), DS = rad(5);
      if (ok(i, S0, a)) return S0;
      for (let sl = S0 - DS; sl >= rad(-76); sl -= DS) if (ok(i, sl, a)) {
        let lo = sl + DS, hi = sl;
        for (let n = 0; n < 10; n++) { const m = (lo + hi) / 2; if (ok(i, m, a)) hi = m; else lo = m; }
        return hi;
      }
      return null;
    };
    const footPitch: [number, number] = [0, 0], dangle: [number, number] = [0, 0];
    let gap = 1;
    for (let i = 0; i < 2; i++) {
      let sl = lowest(i, 0), a = 0;
      if (sl === null) {
        const DA = rad(5);
        sl = rad(-20); a = rad(90);                                         // nothing clears (a seat inside a box): qa.seat says by how much
        for (let q = DA; q <= rad(90) + 1e-6; q += DA) {
          const s1 = lowest(i, q);
          if (s1 === null) continue;
          let lo = q - DA, hi = q; sl = s1;
          for (let n = 0; n < 8; n++) { const m = (lo + hi) / 2, s2 = lowest(i, m); if (s2 !== null) { hi = m; sl = s2; } else lo = m; }
          a = hi; break;
        }
      }
      place(i, sl, a);
      const g = gaps(i, a);
      gap = Math.min(gap, g[0], g[1]);
      footPitch[i] = pitchOf(i, a); dangle[i] = Math.max(0, A[i].y - onFloor);
    }
    // the two legs against each other
    const o = V();
    for (let r = 4; r <= SEG; r++) {
      limbAt(H[0], K[0], A[0], r, _w, undefined, this.bow[2]);
      for (let q = 4; q <= SEG; q++) gap = Math.min(gap, limbAt(H[1], K[1], A[1], q, o, undefined, this.bow[3]).distanceTo(_w) - 2 * own);
    }
    // the furthest lean that keeps the belly off the desk's edge
    let leanMax = rad(24);
    if (S.deskZ !== null) {
      const fine = (p: number) => this.bodyDeskGap(S, p) >= 0.006;
      if (!fine(leanMax)) {
        let lo = 0, hi = leanMax;
        if (!fine(0)) leanMax = 0;
        else { for (let n = 0; n < 12; n++) { const m = (lo + hi) / 2; if (fine(m)) lo = m; else hi = m; } leanMax = lo; }
      }
    }
    return { hip: H, knee: K, ankle: A, footPitch, dangle, gap, leanMax, turn: null, lap: [null, null] };
  }
  /** How far this figure's torso may turn on this seat (SeatFit.turn), worked out once per seat: the largest turn,
   *  up to SEAT_TURN (SEAT_TURN_DESK at a desk), at which both resting hands still reach their places with the
   *  arms clear of the body, either way round, with 2 degrees to spare. Builds differ: a wide body under short arms
   *  cannot rest a hand on the far thigh once that shoulder has swung back. One limit for every pose on the seat, so
   *  a change of pose never turns the body. */
  private seatTurn(sit: Sit, at: V3, facing: number) {
    const fit = sit.fit;
    if (fit.turn !== null) return fit.turn;
    const max = sit.deskZ !== null ? SEAT_TURN_DESK : SEAT_TURN, spare = rad(2);
    const ok = (tw: number) => this.restOk(sit, at, facing, tw + spare) && this.restOk(sit, at, facing, -tw - spare);
    let lim = max;
    if (!ok(max)) { let lo = 0, hi = max; for (let n = 0; n < 6; n++) { const m = (lo + hi) / 2; if (ok(m)) lo = m; else hi = m; } lim = lo; }
    this.grip[0] = this.grip[1] = null;
    return (fit.turn = Math.max(lim, rad(0.5)));
  }
  /** would both resting arms be fine with the torso turned tw from the seat's direction? (the still pose: no sway) */
  private restOk(sit: Sit, at: V3, facing: number, tw: number) {
    const d = this.dim, cT = Math.cos(facing), sT = Math.sin(facing), fwdT = V(sT, 0, cT), leftT = V(cT, 0, -sT), bodyYaw = facing + tw;
    const lean = Math.min(SEAT_LEAN, sit.deskZ !== null ? sit.fit.leanMax : 1);
    const q1 = new THREE.Quaternion().setFromAxisAngle(UP, bodyYaw), tq = new THREE.Quaternion().setFromAxisAngle(leftT, lean).multiply(q1);
    this.torsoM.compose(V(at.x, at.y + sit.h + SEAT_LIFT + d.rb * (1 - V(0, 1, 0).applyQuaternion(tq).y), at.z), tq, V(1, 1, 1));
    this.torsoInv.copy(this.torsoM).invert();
    const headC = V(0, d.Ht + 0.72 * d.R, 0).applyMatrix4(this.torsoM);
    for (const k of this.keep) k.w.copy(k.c).applyMatrix4(this.torsoM);
    const C = { at, fwdT, leftT, headC, q1, bodyYaw, yawF: bodyYaw, lean, roll: 0, t: 0, am: 0, arm: -1 };
    for (let i = 0; i < 2; i++) {
      const sh = d.sh[i].clone().applyMatrix4(this.torsoM), g = this.armPlan(sit.deskZ !== null ? "desk" : "lap", i, sh, C);
      const k = this.solveArm(i, sh, g.target, g.pole, V(i ? 1 : -1, 0, 0).applyQuaternion(q1), headC);
      if (k.c < 0 || k.reach > 1e-4) return false;
    }
    return true;
  }
  /** a world point's gap to the seat, the chair back and the desk (seated only) */
  private furnGapW(p: V3) {
    const S = this.sit!;
    return furnGap(S, p.y - S.at.y, (p.x - S.at.x) * this.sitF[0] + (p.z - S.at.z) * this.sitF[1]);
  }
  /** a world point's gap to the body's surface (the body's own ink not counted) */
  private bodyGap(p: V3) {
    const d = this.dim;
    _s.copy(p).applyMatrix4(this.torsoInv);
    const r = bodyR(_s.y, d.Ht, d.rb, d.rt);
    if (r > 0) return Math.hypot(_s.x, _s.z) - r * d.bw(_s.x, _s.y, _s.z);
    return _s.y <= 0 ? Math.hypot(_s.x, _s.y, _s.z) : Math.hypot(_s.x, _s.y - d.Ht, _s.z);
  }

  /** The head's real reach from its centre, per direction in the head's own frame: the lumpy skin, the hair props, a
   *  hat, whatever an accessory puts on the head (their ink not counted). An arm that is drawn in front of the head
   *  is kept outside this shape, not outside a ball. Built on first use from the head's own meshes (every triangle
   *  is sampled finely enough that no cell between its corners is missed), then widened by a cell. */
  private buildHeadEnv() {
    const NT = ENV_T, NA = ENV_A, raw = new Float32Array(NT * NA), rel = new THREE.Matrix4(), A = V(), B = V(), C = V(), P = V();
    const splat = (p: V3) => {
      const r = p.length();
      if (r < 1e-6) return;
      const ti = clamp(Math.floor((Math.acos(clamp(p.y / r, -1, 1)) / Math.PI) * NT), 0, NT - 1);
      const ai = ((Math.floor(((Math.atan2(p.x, p.z) + Math.PI) / (2 * Math.PI)) * NA) % NA) + NA) % NA;
      if (r > raw[ti * NA + ai]) raw[ti * NA + ai] = r;
    };
    this.headG.traverse((o3) => {
      const m = o3 as THREE.Mesh;
      if (!m.isMesh || m.userData.depthOnly || m.userData.hull || m.userData.under || (m.parent && m.parent.userData.under)) return;
      rel.identity();
      for (let q: THREE.Object3D | null = m; q && q !== this.headG; q = q.parent) { q.updateMatrix(); rel.premultiply(q.matrix); }
      const pos = m.geometry.attributes.position, idx = m.geometry.index, n = idx ? idx.count : pos.count;
      for (let t = 0; t + 2 < n; t += 3) {
        A.fromBufferAttribute(pos, idx ? idx.getX(t) : t).applyMatrix4(rel);
        B.fromBufferAttribute(pos, idx ? idx.getX(t + 1) : t + 1).applyMatrix4(rel);
        C.fromBufferAttribute(pos, idx ? idx.getX(t + 2) : t + 2).applyMatrix4(rel);
        const ext = Math.max(A.distanceTo(B), B.distanceTo(C), C.distanceTo(A)) / Math.max(Math.min(A.length(), B.length(), C.length()), 0.02);
        const k = clamp(Math.ceil(ext / ((0.5 * Math.PI) / NT)), 1, 24);
        for (let i = 0; i <= k; i++) for (let j = 0; j <= k - i; j++) splat(P.set(0, 0, 0).addScaledVector(A, i / k).addScaledVector(B, j / k).addScaledVector(C, (k - i - j) / k));
      }
    });
    const env = new Float32Array(NT * NA);
    for (let ti = 0; ti < NT; ti++) {
      const w = Math.min(NA >> 1, Math.ceil(1 / Math.max(Math.sin(((ti + 0.5) / NT) * Math.PI), 0.03)));       // a cell's width in azimuth cells
      for (let ai = 0; ai < NA; ai++) {
        let mx = 0;
        for (let dt = -1; dt <= 1; dt++) { const tj = clamp(ti + dt, 0, NT - 1); for (let da = -w; da <= w; da++) mx = Math.max(mx, raw[tj * NA + ((ai + da + NA) % NA)]); }
        env[ti * NA + ai] = mx || this.dim.R;
      }
    }
    this.headEnv = env;
  }
  /** the head's reach (m) toward a point given in the head's frame */
  private headRho(x: number, y: number, z: number) {
    const env = this.headEnv!, r = Math.hypot(x, y, z) || 1e-9;
    const tf = clamp((Math.acos(clamp(y / r, -1, 1)) / Math.PI) * ENV_T - 0.5, 0, ENV_T - 1), af = ((Math.atan2(x, z) + Math.PI) / (2 * Math.PI)) * ENV_A - 0.5;
    const t0 = Math.floor(tf), t1 = Math.min(t0 + 1, ENV_T - 1), a0 = Math.floor(af), u = tf - t0, v = af - a0;
    const A0 = ((a0 % ENV_A) + ENV_A) % ENV_A, A1 = (A0 + 1) % ENV_A;
    return lerp(lerp(env[t0 * ENV_A + A0], env[t0 * ENV_A + A1], v), lerp(env[t1 * ENV_A + A0], env[t1 * ENV_A + A1], v), u);
  }
  /** how far a world point is outside the head's real shape (m, < 0 = inside), along the line from the head's centre */
  private headGap(p: V3) {
    _hl.copy(p).applyMatrix4(this.headInv);
    return _hl.length() - this.headRho(_hl.x, _hl.y, _hl.z);
  }
  /** a posed thing's points in its group's frame (its vertices; the six furthest along the axes always among them),
   *  its ink, and its reach along +z (what a resting hand lays it down on) */
  private heldPts(hd: Rig["held"][number]) {
    if (hd.pts) return hd.pts;
    const out: number[] = [], rel = new THREE.Matrix4(), v = V(), ext: (V3 | null)[] = [null, null, null, null, null, null];
    hd.g.traverse((o3) => {
      const m = o3 as THREE.Mesh;
      if (!m.isMesh || m.userData.hull || m.userData.depthOnly) return;
      rel.identity();
      for (let q: THREE.Object3D | null = m; q && q !== hd.g; q = q.parent) { q.updateMatrix(); rel.premultiply(q.matrix); }
      const P = m.geometry.attributes.position, step = Math.max(1, Math.ceil(P.count / 200));
      for (let k = 0; k < P.count; k++) {
        v.fromBufferAttribute(P, k).applyMatrix4(rel);
        if (k % step === 0) out.push(v.x, v.y, v.z);
        for (let c = 0; c < 6; c++) { const e = ext[c], val = v.getComponent(c >> 1) * (c & 1 ? -1 : 1); if (!e || val > e.getComponent(c >> 1) * (c & 1 ? -1 : 1)) ext[c] = v.clone(); }
      }
      hd.ink = Math.max(hd.ink, m.userData.ink ?? 0);
    });
    for (const e of ext) if (e) out.push(e.x, e.y, e.z);
    hd.pts = new Float32Array(out);
    hd.far = 0;
    for (let k = 2; k < out.length; k += 3) hd.far = Math.max(hd.far, out[k] + hd.ink);
    return hd.pts;
  }
  /** the smallest value of fn over the points of the posed things in hand i, each less the thing's ink, with the hand
   *  at H and the things turned by q (1 if the hand holds nothing posed) */
  private heldMin(i: number, H: V3, q: THREE.Quaternion, fn: (p: V3) => number) {
    let worst = 1;
    for (const hd of this.held) {
      if (hd.i !== i || !hd.posed || !hd.g.visible) continue;
      const pts = this.heldPts(hd);
      for (let k = 0; k < pts.length; k += 3) worst = Math.min(worst, fn(_hp.set(pts[k], pts[k + 1], pts[k + 2]).applyQuaternion(q).add(H)) - hd.ink);
    }
    return worst;
  }
  /** how high a resting hand's centre lies over what it rests on: its own radius and ink, or the posed thing under it */
  private restH(i: number) {
    let h = this.dim.handR + HULL.hand;
    for (const hd of this.held) if (hd.i === i && hd.posed && hd.g.visible) { this.heldPts(hd); h = Math.max(h, hd.far); }
    return h;
  }

  /** smallest clearance of arm i (shoulder a, elbow j, hand e) to the body surface and the head, in metres. Every ring
   *  keeps its own ink clear of the body (that line never cuts into the body's); the head is a looser test, because
   *  the head is drawn in front of whatever is near it. An arm that is itself drawn in front of the head (frontArm)
   *  gets the strict test instead: every ring and the hand, with their ink, outside the head's real shape. Seated,
   *  the seat, the chair back and the desk count too. */
  private armClear(i: number, a: V3, j: V3, e: V3, headC: V3) {
    const d = this.dim, strict = this.frontArm[i], sit = this.sit;
    let worst = 1;
    for (const ri of CLEAR_RINGS) {
      const own = ri === SEG ? d.handR + HULL.hand : d.limbR * 1.08 + HULL.limb;
      limbAt(a, j, e, ri, _w, undefined, this.bow[i]);
      if (strict) worst = Math.min(worst, this.headGap(_w) - own - 0.002);
      else worst = Math.min(worst, _w.distanceTo(headC) - d.R * 1.04 - own);
      _s.copy(_w).applyMatrix4(this.torsoInv);
      const r = bodyR(_s.y, d.Ht, d.rb, d.rt);
      if (r > 0) worst = Math.min(worst, Math.hypot(_s.x, _s.z) - r * d.bw(_s.x, _s.y, _s.z) - own - 0.002);
      for (const k of this.keep) worst = Math.min(worst, _w.distanceTo(k.w) - k.r - own);
      if (sit) {
        worst = Math.min(worst, this.furnGapW(_w) - own);
        if (ri >= N1 + NC) {                                               // the forearm and the hand: off the own legs
          const lp = this.legPts, legOwn = d.legR * 1.08 + HULL.limb;
          let m = 1e9;
          for (let n = 0; n < lp.length; n += 3) { const dx = lp[n] - _w.x, dy = lp[n + 1] - _w.y, dz = lp[n + 2] - _w.z; m = Math.min(m, dx * dx + dy * dy + dz * dz); }
          worst = Math.min(worst, Math.sqrt(m) - own - legOwn);
        }
      }
    }
    return worst;
  }
  /** a resting hand lays a posed thing flat under itself: its length across the line it rests along (the thigh, the
   *  forearm), pointing in toward the body's middle, its face down on what it rests on */
  private layFlat(i: number, along: V3) {
    const y = V().crossVectors(UP, along).multiplyScalar(i ? -1 : 1);
    if (y.lengthSq() < 1e-8) y.set(i ? -1 : 1, 0, 0);
    y.normalize();
    const z = V().crossVectors(y, along).normalize();
    if (z.y > 0) z.negate();
    return (this.grip[i] = basisQ(y, z, this.gripQ[i]));
  }
  /** The arms whose place depends on where things are this frame (see ArmPlan): the hand's place and the elbow's
   *  side, in the world, and the turn of a posed thing in that hand (this.grip; flat = the hand rests on the desk:
   *  the thing is laid under it once the forearm is known). sh = the shoulder. C = this frame's frames: q1 = the show
   *  yaw, yawF = the face's yaw, t / am = the pose's time and amount, arm = the writing arm (-1: nobody writes),
   *  face = the face drawing's frame (F = out of the face, U = up the face, r = one ball radius on the drawing, m). */
  private armPlan(plan: Exclude<ArmPlan, null>, i: number, sh: V3, C: { at: V3; fwdT: V3; leftT: V3; headC: V3; q1: THREE.Quaternion; bodyYaw: number; yawF: number; lean: number; roll: number; t: number; am: number; arm: number; laid?: boolean; face?: { F: V3; U: V3; r: number } }): { target: V3; pole: V3; flat: boolean } {
    const d = this.dim, sit = this.sit, s = i ? 1 : -1, A = d.upper + d.fore, hand = d.handR + HULL.hand, limb = d.limbR * 1.08 + HULL.limb;
    const show = (x: number, y: number, z: number) => V(x, y, z).applyQuaternion(C.q1);
    if (plan === "lap" && sit) {
      // The hand lies on its own thigh, on the outer half of it (the arm comes down past the belly's side: any
      // further in and it would have to press through), toward the knee as far as an easy reach allows, never
      // nearer the body than the belly lets the hand, and what it holds, lie. The arm is short: where it cannot
      // come down to the thigh clear of the body, the hand slides back to the belly, and then is held just over
      // the thigh in front of it (see `put`). The place is found for the STILL body (no sway, no breath), with
      // 1.5 mm to spare, and once per seat for the two ends of the torso's turn (SeatFit.lap): the nearer, higher
      // of the two serves every turn in between. So the hand lies still while the body breathes and while the
      // camera moves round the figure, and the elbow keeps its own place (no swivel search): a resting arm never
      // jumps. Only where that place is not clear at this frame's turn does the hand go on back, continuously.
      const M0 = new THREE.Matrix4().copy(this.torsoM), I0 = new THREE.Matrix4().copy(this.torsoInv);
      const L = this.legW[i], zOf = (p: V3) => (p.x - C.at.x) * C.fwdT.x + (p.z - C.at.z) * C.fwdT.z;
      const OUT = 0.025, zK = zOf(L.k), up = d.legR * 1.08 + HULL.limb + this.restH(i) + REST_GAP, rise = Math.sqrt(Math.max(up * up - OUT * OUT, 1e-6));
      const tgt = V(), p0 = V(), p1 = V();
      const onThigh = (zt: number) => {
        limbAt(L.h, L.k, L.a, 0, p0, undefined, this.bow[2 + i]);
        for (let r = 1; r <= N1 + NC / 2; r++) {
          limbAt(L.h, L.k, L.a, r, p1, undefined, this.bow[2 + i]);
          const z0 = zOf(p0), z1 = zOf(p1);
          if (z1 >= zt || r === N1 + NC / 2) { tgt.lerpVectors(p0, p1, clamp((zt - z0) / Math.max(z1 - z0, 1e-6), 0, 1)); break; }
          p0.copy(p1);
        }
        // OUT to the side, and up by what keeps the hand `up` away from the thigh's line where it slopes
        tgt.y += rise / Math.max(Math.hypot(p1.x - p0.x, p1.z - p0.z) / Math.max(p0.distanceTo(p1), 1e-6), 0.5);
        return tgt.addScaledVector(C.leftT, s * OUT);
      };
      const q = this.layFlat(i, V().copy(L.k).sub(L.h).normalize());
      let lift = 0;
      const at = (zt: number) => { onThigh(zt).y += lift; return tgt; };
      const clearAt = (zt: number) => { at(zt); return Math.min(this.bodyGap(tgt) - hand, this.heldMin(i, tgt, q, (p) => this.bodyGap(p)) - BODY_INK * 0.5) - 0.004; };
      const zPref = zK - 0.085, zMax = zK - 0.036, z0 = zOf(L.h);
      /** the place nearest the body where the hand (lifted so far) lies clear of the belly */
      const nearest = () => {
        let lo = z0, hi = zPref;                                         // lo: inside the belly; hi: clear of it
        if (clearAt(hi) < 0) { lo = hi; hi = zMax; }
        if (clearAt(hi) >= 0) for (let n = 0; n < 12; n++) { const m = (lo + hi) / 2; if (clearAt(m) >= 0) hi = m; else lo = m; }
        return hi;
      };
      const pole = V(), p2 = V(), j = V(), e = V(), hc = V(), tq = new THREE.Quaternion(), rq = new THREE.Quaternion();
      /** Puts tgt at the hand's place for the still body turned to q1 (and leaning `roll` to the side, as a waving
       *  body does) and returns it as { z: how far along the thigh, u: 0 = lying on it, above 1 = held over it (see
       *  `put`) }. from = the place to start from (the seat's own: nothing further from the body, nothing lower);
       *  null = the best place for this turn alone. */
      const rest = (q1: THREE.Quaternion, roll: number, from: { z: number; u: number } | null) => {
        tq.setFromAxisAngle(C.leftT, C.lean).multiply(rq.setFromAxisAngle(_s.set(0, 0, 1).applyQuaternion(q1), -roll)).multiply(q1);
        this.torsoM.compose(V(C.at.x, C.at.y + sit.h + SEAT_LIFT + d.rb * (1 - _s.set(0, 1, 0).applyQuaternion(tq).y), C.at.z), tq, V(1, 1, 1));
        this.torsoInv.copy(this.torsoM).invert();
        for (const k of this.keep) k.w.copy(k.c).applyMatrix4(this.torsoM);
        sh = d.sh[i].clone().applyMatrix4(this.torsoM);
        hc.set(0, d.Ht + 0.72 * d.R, 0).applyMatrix4(this.torsoM);
        pole.set(s, -0.3, 0.5).applyQuaternion(q1); p2.set(s, 0, 0).applyQuaternion(q1);
        const far = (zt: number) => at(zt).distanceTo(sh) - 0.95 * A;
        /** how clear the arm is with the hand at tgt and the elbow in its own place (1.5 mm to spare; below 0 too
         *  when the arm would be straighter than a hanging one) */
        const arm = () => {
          if (tgt.distanceTo(sh) > 0.972 * A) return -1;
          const F = ikFrame(sh, tgt, d.upper, d.fore, pole, p2);
          e.copy(sh).addScaledVector(F.dir, F.d); j.copy(sh).addScaledVector(F.dir, F.x).addScaledVector(F.pp, F.h);
          return this.armClear(i, sh, j, e, hc) - 0.0015;
        };
        lift = 0;
        const zLo = nearest();
        let zA = zLo, u = 0;
        if (from) { zA = Math.max(from.z, zLo); u = from.u; }
        else if (zLo < zPref) {
          if (far(zPref) <= 0) zA = zPref;
          else { let a = zLo, b = zPref; for (let n = 0; n < 12; n++) { const m = (a + b) / 2; if (far(m) <= 0) a = m; else b = m; } zA = a; }
        }
        // v = 0: there. Up to 1: back along the thigh to the belly. Up to 2: held up to 0.16 m over the thigh, at
        // the belly. The smallest v, from u on, at which the arm is clear.
        const put = (v: number) => { if (v <= 1) { lift = 0; at(lerp(zA, zLo, v)); } else { lift = (v - 1) * 0.16; at(nearest()); } };
        put(u);
        if (arm() < 0) {
          let a = u, b = 2;
          put(2);
          if (arm() >= 0) for (let n = 0; n < 14; n++) { const m = (a + b) / 2; put(m); if (arm() >= 0) b = m; else a = m; }
          put(b); u = b;
        }
        return u <= 1 ? { z: lerp(zA, zLo, u), u: 0 } : { z: zLo, u };
      };
      const fit = sit.fit;
      let own = fit.lap[i];
      if (!own && fit.turn !== null) {
        const f = Math.atan2(C.fwdT.x, C.fwdT.z), qe = new THREE.Quaternion();
        const a = rest(qe.setFromAxisAngle(UP, f + fit.turn), 0, null), b = rest(qe.setFromAxisAngle(UP, f - fit.turn), 0, null);
        own = fit.lap[i] = { z: Math.min(a.z, b.z), u: Math.max(a.u, b.u) };
      }
      rest(C.q1, C.roll, own);
      this.torsoM.copy(M0); this.torsoInv.copy(I0);
      for (const k of this.keep) k.w.copy(k.c).applyMatrix4(this.torsoM);
      return { target: tgt, pole, flat: false };
    }
    if ((plan === "desk" || plan === "write") && sit && sit.deskZ !== null) {
      const top = C.at.y + sit.deskY, write = plan === "write";
      const sx = (sh.x - C.at.x) * C.leftT.x + (sh.z - C.at.z) * C.leftT.z, sz = (sh.x - C.at.x) * C.fwdT.x + (sh.z - C.at.z) * C.fwdT.z;
      let hx: number, hz: number, hy = top + this.restH(i) + REST_GAP;
      if (write) {
        // small looping strokes (2.2 a second: 14 frames a loop, so the hand never jitters) along a line that runs to
        // the person's right, then a quick return with the pen lifted
        const T = 2.4, u = (((C.t / T) % 1) + 1) % 1, back = u < 0.84 ? 0 : (u - 0.84) / 0.16, along = u < 0.84 ? u / 0.84 : 1 - smooth(back), w = C.t * 2 * Math.PI * 2.2;
        hx = s * 0.04 - (along - 0.5) * 0.075 + 0.0065 * Math.sin(w);
        hz = sit.deskZ + 0.095 + 0.004 * Math.sin(w + 1.1);
        // the pen leans back over the paper, its top toward the writer and out to the writing side; the hand's height
        // puts the thing's lowest point on the paper
        const y = show(s * 0.42, 0.82, -0.56).normalize(), zd = show(0, 0.3, -1), z = zd.addScaledVector(y, -zd.dot(y)).normalize();
        const q = (this.grip[i] = basisQ(y, z, this.gripQ[i]));
        const low = this.heldMin(i, V(), q, (p) => p.y);
        hy = Math.max(top + hand + REST_GAP, low < 1 ? top + 0.0015 - low : 0) + 0.012 * Math.sin(Math.PI * back);
      } else {
        // resting: the hands a little apart in front of the chest (further apart beside a writing hand, and when a
        // resting hand has a posed thing laid under it: a phone lies across the forearm and would reach the other hand)
        hx = s * (C.arm >= 0 || C.laid ? 0.09 : 0.062); hz = sit.deskZ + (C.arm >= 0 ? 0.11 : 0.1);
      }
      // within easy reach: toward the shoulder if it is not, but never off the desk
      const dy = sh.y - hy, Rh = Math.sqrt(Math.max((0.9 * A) ** 2 - dy * dy, 1e-4)), px = hx - sx, pz = hz - sz, dist = Math.hypot(px, pz);
      if (dist > Rh) {
        hx = sx + (px * Rh) / dist; hz = sz + (pz * Rh) / dist;
        const zMin = sit.deskZ + hand + 0.012;
        if (hz < zMin) { hz = zMin; const w = Rh * Rh - (hz - sz) ** 2; if (w > 0) hx = sx + Math.sign(px || s) * Math.min(Math.abs(px), Math.sqrt(w)); }
      }
      const target = V().copy(C.at).addScaledVector(C.leftT, hx).addScaledVector(C.fwdT, hz).setY(hy);
      // the forearm lies ON the desk: the elbow is turned about the shoulder-hand line, outward, down to the height
      // at which the lowest ring of the forearm (its ink counted, its own bend too) rests REST_GAP above the top
      const dir = target.clone().sub(sh), D = dir.length() || 1e-6; dir.divideScalar(D);
      const dd = clamp(D, Math.abs(d.upper - d.fore) + 1e-3, A - 1e-3), x = (d.upper * d.upper - d.fore * d.fore + dd * dd) / (2 * dd), h = Math.sqrt(Math.max(0, d.upper * d.upper - x * x));
      const down = V(0, -1, 0).addScaledVector(dir, dir.y), dl = down.length(), pole = show(s, -0.4, 0);
      if (dl > 1e-3 && h > 1e-4) {
        down.divideScalar(dl);
        const out = V().crossVectors(dir, down);
        if (out.dot(C.leftT) * s < 0) out.negate();
        const mid = sh.clone().addScaledVector(dir, x), e = sh.clone().addScaledVector(dir, dd), j = V();
        let yE = top + limb + REST_GAP;
        for (let n = 0; n < 4; n++) {
          const c = clamp((yE - mid.y) / (h * down.y), -1, 1);
          pole.copy(down).multiplyScalar(c).addScaledVector(out, Math.sqrt(1 - c * c));
          if (n === 3) break;
          j.copy(mid).addScaledVector(pole, h);
          let g = 1;
          for (let r = N1 + NC / 2; r < SEG; r++) g = Math.min(g, this.furnGapW(limbAt(sh, j, e, r, _w, undefined, this.bow[i])) - limb);
          if (Math.abs(g - REST_GAP) < 2e-4) break;
          yE += REST_GAP - g;
        }
      }
      return { target, pole, flat: !write };
    }
    if (plan === "phone") {
      const e = smooth(C.am), shy = d.sh[0].y, hc = C.headC;
      // looking at it: in front of the chest, the top leaning away, the screen up toward the face
      const tau = rad(40), P0 = V(s * 0.05, shy - 0.2 * A, d.rt + BODY_INK + 0.075).applyMatrix4(this.torsoM);
      const q0 = basisQ(show(0, Math.cos(tau), Math.sin(tau)), show(0, Math.sin(tau), -Math.cos(tau)), new THREE.Quaternion());
      // a call: against the side of the head that the FACE shows (the face is the drawing's front; held within 50 deg of
      // the body's own side so the arm reaches), a little under the middle and toward the cheek, the top tipped back
      const yaw = C.bodyYaw + softLim(wrapA(C.yawF - C.bodyYaw), rad(50)), Fd = V(Math.sin(yaw), 0, Math.cos(yaw)), side = V(Math.cos(yaw), 0, -Math.sin(yaw)).multiplyScalar(s);
      const dirE = side.clone().addScaledVector(Fd, 0.14).addScaledVector(UP, -0.22).normalize(), z1 = dirE.clone().negate();
      const yd = V(0, Math.cos(rad(20)), 0).addScaledVector(Fd, -Math.sin(rad(20))), y1 = yd.addScaledVector(z1, -yd.dot(z1)).normalize();
      const q1 = basisQ(y1, z1, new THREE.Quaternion());
      _hl.copy(dirE).transformDirection(this.headInv);
      const P1 = hc.clone().addScaledVector(dirE, this.headRho(_hl.x, _hl.y, _hl.z) + 0.012);
      // between the two: a straight run that swings a little out to the side, the turn spread evenly over it
      const H = P0.lerp(P1, e).addScaledVector(side, 0.03 * Math.sin(Math.PI * e)).addScaledVector(show(0, 0, 1), 0.02 * Math.sin(Math.PI * e));
      const q = (this.grip[i] = this.gripQ[i].copy(q0).slerp(q1, e));
      // nothing through anything: the hand and every point of the phone are moved out of the head (along the line
      // from its centre), off the body (straight out from its axis) and off the desk, the seat and the chair's back
      // (the way that frees them fastest), by what each is short; twice over, in case one push undid another
      const GAP = 0.004, hg = (p: V3) => this.headGap(p), bg = (p: V3) => this.bodyGap(p), fg = (p: V3) => this.furnGapW(p), o = V();
      const furn = (P: V3) => Math.min(fg(P) - hand, this.heldMin(i, P, q, fg));
      for (let round = 0; round < 2; round++) {
        for (let n = 0; n < 6; n++) {
          const g = Math.min(hg(H) - hand, this.heldMin(i, H, q, hg)) - GAP;
          if (g >= -2e-4) break;
          H.addScaledVector(o.copy(H).sub(hc).normalize(), -g);
        }
        for (let n = 0; n < 4; n++) {
          const g = Math.min(bg(H) - hand - 0.002, this.heldMin(i, H, q, bg) - BODY_INK * 0.5) - GAP;
          if (g >= -2e-4) break;
          o.copy(H).applyMatrix4(this.torsoInv).setY(0);
          if (o.lengthSq() < 1e-8) o.set(0, 0, 1);
          H.addScaledVector(o.normalize().transformDirection(this.torsoM), -g);
        }
        if (sit) for (let n = 0; n < 4; n++) {
          const g0 = furn(H), g = g0 - 0.012 * (1 - e) - GAP;
          if (g >= -2e-4) break;
          const E = 0.002, dy = (furn(o.copy(H).setY(H.y + E)) - g0) / E, dz = (furn(o.copy(H).addScaledVector(C.fwdT, E)) - g0) / E, l = Math.hypot(dy, dz);
          if (l < 1e-3) H.y -= g; else { H.y -= (g * dy) / l; H.addScaledVector(C.fwdT, (-g * dz) / l); }
        }
      }
      const pole = show(s * 0.55, -1, -0.2).normalize().lerp(show(s, -0.5, 0.2).normalize(), e).normalize();
      return { target: H, pole, flat: false };
    }
    if (plan === "shh" && C.face) {
      // A finger to the lips. The face is a drawing laid on the head along its own direction: its mouth is 0.34 r
      // under the middle, wherever the drawing has slid to. The hand comes to rest just under the mouth, in front of
      // the chin, and what it holds (a finger: its length along +y) stands up across the lips toward where a nose
      // would be, leaning back as the head's surface does, its +z out of the face. Hand and finger are kept outside
      // the head's real shape (hair and hat included) and off the body. amount 0 = in front of the chest.
      // The arm of the far side cannot come round the head to a face that has turned away from it (the head is as
      // wide as the arm is long): the hand follows the face up to SHH_FAR to that side of the body's front and
      // then stays behind, beside the lips, softly (nothing jumps). Rig.qa.reach reports how far off the lips it is.
      // For such a view give the pose the other arm (pose.arm, and finger({ hand })).
      const e = smooth(C.am), r = C.face.r, hc = C.headC, shy = d.sh[0].y, GAP = 0.004, o = V();
      const far = Math.max(0, -s * wrapA(C.yawF - C.bodyYaw)), back = far - softLim(far, SHH_FAR);
      const F = back ? C.face.F.clone().applyAxisAngle(UP, s * back) : C.face.F, U = back ? C.face.U.clone().applyAxisAngle(UP, s * back) : C.face.U;
      this.planOff[i] = e * back * d.R;
      const hg = (p: V3) => this.headGap(p), bg = (p: V3) => this.bodyGap(p);
      // the point y ball radii up the face that is `own` clear of the head, straight out of the face
      const onFace = (y: number, own: number) => {
        const p = hc.clone().addScaledVector(U, y * r).addScaledVector(F, d.R);
        for (let n = 0; n < 10; n++) {
          const g = hg(p) - own;
          if (Math.abs(g) < 1e-4) break;
          p.addScaledVector(F, -g / Math.max(0.35, o.copy(p).sub(hc).normalize().dot(F)));
        }
        return p;
      };
      const H1 = onFace(-0.4 - hand / r, hand + GAP), T1 = onFace(-0.14, 0.014 + GAP);
      const y1 = T1.sub(H1).normalize(), z1 = F.clone().addScaledVector(y1, -F.dot(y1)).normalize(), q1 = basisQ(y1, z1, new THREE.Quaternion());
      const P0 = V(s * 0.05, shy - 0.2 * A, d.rt + BODY_INK + 0.075).applyMatrix4(this.torsoM), q0 = basisQ(show(0, 1, 0), show(0, 0, 1), new THREE.Quaternion());
      const H = P0.lerp(H1, e), q = (this.grip[i] = this.gripQ[i].copy(q0).slerp(q1, e));
      for (let round = 0; round < 2; round++) {
        for (let n = 0; n < 6; n++) {
          const g = Math.min(hg(H) - hand, this.heldMin(i, H, q, hg)) - GAP;
          if (g >= -2e-4) break;
          H.addScaledVector(F, -g / Math.max(0.35, o.copy(H).sub(hc).normalize().dot(F)));
        }
        for (let n = 0; n < 4; n++) {
          const g = Math.min(bg(H) - hand - 0.002, this.heldMin(i, H, q, bg) - BODY_INK * 0.5) - GAP;
          if (g >= -2e-4) break;
          o.copy(H).applyMatrix4(this.torsoInv).setY(0);
          if (o.lengthSq() < 1e-8) o.set(0, 0, 1);
          H.addScaledVector(o.normalize().transformDirection(this.torsoM), -g);
        }
      }
      // the elbow low and forward: the forearm comes up to the mouth from in front, not from under the jaw
      return { target: H, pole: show(s * 0.5, -0.85, 0.45).normalize(), flat: false };
    }
    // a plan without its furniture (a desk pose and no desk): the hand hangs in front of the hip
    return { target: sh.clone().add(show(s * 0.02, -0.3, 0.05)), pole: show(s, -0.3, -0.45), flat: false };
  }
  /** An arm the swivel could not clear (on some builds the body swells just under the shoulder): the whole arm,
   *  shoulder and hand (a and target are moved), goes straight out from the body's axis, 1 mm at a time (it takes 2 or
   *  3). k = what solveArm gave; returns the arm as it is then. */
  private armOut(i: number, a: V3, target: V3, pole: V3, pole2: V3, headC: V3, k: ReturnType<Rig["solveArm"]>) {
    if (k.c < -0.0005) {
      const out = _s.copy(a).applyMatrix4(this.torsoInv).setY(0);
      if (out.lengthSq() > 1e-8) {
        const dir = out.normalize().transformDirection(this.torsoM).clone();
        for (let n = 0; n < 8 && k.c < 0; n++) { a.addScaledVector(dir, 0.001); target.addScaledVector(dir, 0.001); k = this.solveArm(i, a, target, pole, pole2, headC); }
      }
    }
    return k;
  }
  /** how far an arm (its rings and its hand, with their ink) is outside the head's real shape (m, < 0 = inside) */
  private armHeadClear(i: number, a: V3, j: V3, e: V3) {
    const d = this.dim;
    let worst = 1;
    for (const ri of CLEAR_RINGS) {
      limbAt(a, j, e, ri, _w, undefined, this.bow[i]);
      worst = Math.min(worst, this.headGap(_w) - (ri === SEG ? d.handR + HULL.hand : d.limbR * 1.08 + HULL.limb) - 0.002);
    }
    return worst;
  }
  /** arm IK with a swivel that keeps the arm outside the body and the head: the smallest turn of the elbow about the
   *  shoulder -> hand line that clears (fine scan + bisection, so it moves continuously with the pose) */
  private solveArm(i: number, a: V3, target: V3, pole: V3, pole2: V3, headC: V3) {
    const d = this.dim, F = ikFrame(a, target, d.upper, d.fore, pole, pole2);
    const e = a.clone().addScaledVector(F.dir, F.d), mid = a.clone().addScaledVector(F.dir, F.x);
    const jAt = (phi: number) => mid.clone().addScaledVector(F.pp.clone().applyAxisAngle(F.dir, phi), F.h);
    let phi = 0, j = jAt(0), c0 = this.armClear(i, a, j, e, headC);
    if (c0 < 0) {
      const STEP = 0.1;
      let found = false;
      for (let s = 1; s <= 28 && !found; s++) for (const sg of [1, -1]) {
        const p1 = sg * s * STEP;
        if (this.armClear(i, a, jAt(p1), e, headC) >= 0) {
          let lo = sg * (s - 1) * STEP, hi = p1;                       // lo is inside, hi clears
          for (let n = 0; n < 6; n++) { const m = (lo + hi) / 2; if (this.armClear(i, a, jAt(m), e, headC) >= 0) hi = m; else lo = m; }
          phi = hi; found = true; break;
        }
      }
      j = jAt(phi); c0 = this.armClear(i, a, j, e, headC);
    }
    return { j, e, c: c0, phi, reach: F.reachErr };
  }

  /** body turn toward the camera, face slide, IK, meshes */
  _update(cam: THREE.Camera) {
    const st = this.state, d = this.dim, L = this.look;
    this.group.visible = st.visible ?? true;
    if (!this.group.visible) return;
    this.qa.reach = 0; this.qa.clear = 1; this.qa.seat = 1; this.qa.head = 1;
    const front = (st.headFront ?? 1) >= 0.5, fn = front ? THREE.NotEqualStencilFunc : THREE.AlwaysStencilFunc;
    for (const m of this.under) m.stencilFunc = fn;
    this.depthU.value = front ? this.rc.headDepth * d.R : 0; this.curlDepthU.value = this.depthU.value - 0.03;
    const hand = this.rc.hand;
    // seated: the figure belongs to its seat (state.at is not used)
    const sit = (this.sit = this.resolveSeat());
    const camPos = V().setFromMatrixPosition(cam.matrixWorld), at = sit ? sit.at : st.at;
    // seated legs: the seat's own (see seatFit), set in the world first (a hand may rest on a thigh)
    if (sit) {
      const c = Math.cos(st.facing), sn = Math.sin(st.facing), f = sit.fit;
      for (let i = 0; i < 2; i++) for (const [p, o] of [[f.hip[i], this.legW[i].h], [f.knee[i], this.legW[i].k], [f.ankle[i], this.legW[i].a]] as [V3, V3][]) o.set(at.x + p.x * c + p.z * sn, at.y + p.y, at.z - p.x * sn + p.z * c);
      for (let i = 0, n = 0; i < 2; i++) for (let r = 4; r <= SEG; r += 2, n += 3) { limbAt(this.legW[i].h, this.legW[i].k, this.legW[i].a, r, _w, undefined, this.bow[2 + i]); this.legPts[n] = _w.x; this.legPts[n + 1] = _w.y; this.legPts[n + 2] = _w.z; }
      this.frontArm[0] = this.frontArm[1] = false;
    }
    // 1. the show yaw: soft knee instead of a hard clamp; an overhead camera leaves the true facing; a facing well
    //    away from the camera (or state.turn) goes continuously to the true back view.
    const hz = Math.hypot(camPos.x - at.x, camPos.z - at.z), vt = Math.max(Math.abs(camPos.y - (at.y + 1)), 1e-3);
    const follow = smooth((hz / vt - 0.35) / 0.6);
    const camYaw = Math.atan2(camPos.x - at.x, camPos.z - at.z);
    const faceT = st.facing + (st.twist ?? 0);
    const off = wrapA(faceT - camYaw), aOff = Math.abs(off), maxB = st.maxBody ?? BODY_MAX, knee = 0.7 * maxB;
    const soft = aOff < knee ? aOff : knee + (maxB - knee) * (1 - Math.exp(-(aOff - knee) / Math.max(maxB - knee, 1e-4)));
    const wB = st.turn !== undefined ? clamp(st.turn, 0, 1) : smooth((aOff - rad(115)) / rad(55));
    const offB = Math.sign(off) * lerp(soft, aOff, wB);
    let bodyYaw = faceT + follow * wrapA(camYaw + offB - faceT), headYaw = bodyYaw;
    if (sit) {
      // seated, the torso turns only so far from its chair (both hands keep their places, nothing swings into the
      // desk or the chair back); the head turns the rest of the way on the body, so the head, hair and face still
      // follow the camera as they do on a standing figure
      const lim = this.seatTurn(sit, at, st.facing), free = wrapA(bodyYaw - st.facing);
      bodyYaw = st.facing + lim * Math.tanh(free / lim);
      headYaw = bodyYaw + HEAD_TURN * Math.tanh(wrapA(st.facing + free - bodyYaw) / HEAD_TURN);
    }
    this.out.bodyYaw = bodyYaw;
    // 2. frames: travel (planted in the world) and the torso's world matrix (show yaw, lean about the travel axis)
    const bp = this.solvePose();
    const cT = Math.cos(st.facing), sT = Math.sin(st.facing);
    const travel = (p: V3, out = V()) => out.set(at.x + p.x * cT + p.z * sT, at.y + p.y, at.z - p.x * sT + p.z * cT);
    const fwdT = V(sT, 0, cT), leftT = V(cT, 0, -sT);
    _q1.setFromAxisAngle(UP, bodyYaw);
    _q2.setFromAxisAngle(_s.set(Math.sin(bodyYaw), 0, Math.cos(bodyYaw)), -bp.roll);
    _q3.setFromAxisAngle(leftT, bp.pitch);
    const tq = _q3.clone().multiply(_q2).multiply(_q1);
    const scl = V(1, 1 + bp.breathe, 1);
    // seated: the body rolls on its round bottom as it leans, so its lowest point stays on the seat
    if (sit) bp.hip.y += d.rb * (1 - _s.set(0, 1, 0).applyQuaternion(tq).y);
    // hip joints: under the body, in the TRAVEL frame (they turn with the feet, not with the camera-turned torso), so
    // the legs never cross however far the torso has turned toward the camera
    const dT = wrapA(st.facing - bodyYaw), hjx = 0.38 * d.rb * Math.cos(dT), hjz = 0.38 * d.rb * Math.sin(dT);
    const hipJL = [V(-hjx, 0.09 * d.Ht, hjz), V(hjx, 0.09 * d.Ht, -hjz)];
    const ankle = [travel(bp.ankle[0]), travel(bp.ankle[1])];
    const legLen = d.thigh + d.shin;
    // lower the hips until both ankles are within reach: feet never hover (seated, the hips stay on the seat and a
    // foot that does not reach the floor dangles)
    if (!sit) for (let n = 0; n < 3; n++) {
      this.torsoM.compose(travel(bp.hip, _w), tq, scl);
      let need = 0;
      for (let i = 0; i < 2; i++) need = Math.max(need, _s.copy(hipJL[i]).applyMatrix4(this.torsoM).distanceTo(ankle[i]) - 0.985 * legLen);
      if (need <= 1e-4) break;
      bp.hip.y -= need * 1.05;
    }
    this.torsoM.compose(travel(bp.hip, _w), tq, scl);
    this.torsoInv.copy(this.torsoM).invert();
    this.torsoG.matrix.copy(this.torsoM);
    // the head layer (RigState.head): scaled, squashed and tilted about the chin, shifted on screen. The tilt is a
    // turn about the line to the camera, so it reads the same whichever way the body has turned.
    const hl = st.head, hSc = clamp(hl?.scale ?? 1, 0.6, 1.6), hSq = clamp(hl?.squash ?? 0, -0.3, 0.4), hsy = hSc * (1 - hSq), hsx = hSc * (1 + 0.5 * hSq), hTilt = rad(clamp(hl?.tilt ?? 0, -35, 35));
    const head0 = V(0, d.Ht + 0.72 * d.R, 0).applyMatrix4(this.torsoM), toCam0 = camPos.clone().sub(head0).normalize();
    const hRight = V().crossVectors(UP, toCam0);
    if (hRight.lengthSq() < 1e-6) hRight.set(1, 0, 0); else hRight.normalize();
    head0.addScaledVector(hRight, (hl?.dx ?? 0) * d.R + Math.sin(hTilt) * d.R * hsy)
      .addScaledVector(UP, clamp(hl?.dy ?? 0, -0.25, 0.25) * d.R + (hsy - 1) * d.R - (1 - Math.cos(hTilt)) * d.R * hsy);
    this.headG.position.copy(head0.applyMatrix4(this.torsoInv));
    this.headG.scale.set(hsx, hsy, hsx);
    this.headG.quaternion.setFromAxisAngle(_s.set(1, 0, 0), bp.headPitch * 0.6);
    if (sit) this.headG.quaternion.premultiply(_bq.setFromAxisAngle(UP, wrapA(headYaw - bodyYaw)));   // seated, the head turns on the body
    if (hTilt) this.headG.quaternion.premultiply(tq).premultiply(_bq.setFromAxisAngle(toCam0, -hTilt)).premultiply(_bq2.copy(tq).invert());   // (scratch of its own: _q1 = the body's yaw is used further down)
    this.torsoG.updateMatrixWorld(true);
    const headC = V().setFromMatrixPosition(this.headG.matrixWorld);
    this.out.head.copy(headC);
    for (const k of this.keep) k.w.copy(k.c).applyMatrix4(this.torsoM);
    // 3. face direction: toward the camera, nudged toward where the head points, at most FACE_MAX from the camera;
    //    it goes round with the head for a back view. Its upward slide stops under the hairline / hat brim.
    const toCam = camPos.clone().sub(headC), dist = toCam.length() || 1; toCam.divideScalar(dist);
    const camYawH = Math.atan2(toCam.x, toCam.z), camPitch = Math.asin(clamp(toCam.y, -1, 1));
    const rel = wrapA(headYaw - camYawH);
    const slid = camYawH + clamp(rel * 0.3, -FACE_MAX, FACE_MAX);
    const fy = lerpA(lerpA(headYaw, slid, follow), headYaw, wB);
    const storyPitch = -bp.headPitch - bp.pitch * 0.5;
    let fp = camPitch + clamp((storyPitch - camPitch) * 0.4, -rad(12), rad(12));
    const line = this.hatLine || hairLine(L, wrapA(fy - headYaw));
    fp = Math.min(fp, rad(58 - line) - bp.headPitch * 0.6);
    fp = lerp(fp, 0, wB);
    const F = V(Math.sin(fy) * Math.cos(fp), Math.sin(fp), Math.cos(fy) * Math.cos(fp));
    const Rf = V().crossVectors(UP, F).normalize(), Uf = V().crossVectors(F, Rf);
    const roll = bp.roll * 0.8 + hTilt;
    if (roll) { Rf.applyAxisAngle(F, -roll); Uf.applyAxisAngle(F, -roll); }
    // the drawing grows, squashes and tilts with the head layer. And it narrows as it slides away from the middle,
    // as a face drawn on a ball does: the reference's is 13 % narrower at its farthest (a ball of 0.43 R).
    const fSlide = clamp(wrapA(fy - camYawH) / FACE_MAX, -1, 1), fNarrow = Math.sqrt(1 - (0.49 * fSlide) ** 2);
    this.faceU.uFF.value.copy(F); this.faceU.uFR.value.copy(Rf).multiplyScalar(1 / (hsx * fNarrow)); this.faceU.uFU.value.copy(Uf).multiplyScalar(1 / hsy);
    this.faceU.uFace.value = faceTex(L, st.expr ?? "neutral", clamp(st.blink ?? 0, 0, 1), this.shade, hand, st.gaze ?? 0, this.fa, st.mouth);
    this.faceU.uHead.value.set(headC.x, headC.y, headC.z, d.R);
    if (this.faceU.uBrim.value.w > 0) {
      // the light that throws a brim's shadow (see the shader): as high as the key, kept within BRIM_ELEV, leaning
      // toward the key by BRIM_SIDE. A set's own key is often low or to one side, and then the true shadow is a wedge
      // on one temple; the reference draws a band across the top of the face under every wide brim.
      const kv = this.rc.U.uKey.value, kl = Math.hypot(kv.x, kv.z);
      _bv.set(kv.x, 0, kv.z).multiplyScalar(kl > 1e-4 ? BRIM_SIDE / kl : 0).applyQuaternion(this.headG.getWorldQuaternion(_bq).invert());   // (scratch of its own: _s and _q1 are in use here)
      this.faceU.uKeyH.value.set(_bv.x, Math.sin(clamp(Math.asin(clamp(kv.y, -1, 1)), rad(BRIM_ELEV[0]), rad(BRIM_ELEV[1]))), _bv.z);
    }
    // turning away: the face goes round with the head and fades as it nears the edge of the ball (it is gone before it
    // could be a sliver of a profile); from overhead it simply stays on the front of the head
    this.faceU.uFaceOn.value = 1 - follow * smooth((Math.abs(wrapA(fy - camYawH)) - rad(46)) / rad(26));
    this.out.faceYaw = fy;
    // 4. arms (show frame, on the leaned torso) with the clearance swivel; legs (travel frame)
    const showDir = (p: V3) => p.clone().applyQuaternion(_q1);
    // the picture plane a staged hand (wave, cheer) is set out in: the camera's. Seated, the torso cannot turn to it
    // as a standing one does, so the plane follows the camera only as far from the torso as a standing torso would
    // be (BODY_MAX): the hands stay where the shoulders can put them
    const stYaw = sit ? bodyYaw + softLim(wrapA(camYaw - bodyYaw), BODY_MAX) : camYaw;
    const scrF = V(Math.sin(stYaw), 0, Math.cos(stYaw)), scrR = V(Math.cos(stYaw), 0, -Math.sin(stYaw));
    // which arms are drawn in front of the own head this frame (the state's word, else the pose's); those are tested
    // against the head's real shape
    this.grip[0] = this.grip[1] = null;
    let anyFront = false;
    for (let i = 0; i < 2; i++) {
      const f = (this.frontArm[i] = st.armFront?.[i] ?? bp.front[i]);
      anyFront = anyFront || f;
      if (f && front) for (const m of this.armMats[i]) m.stencilFunc = THREE.AlwaysStencilFunc;
    }
    if (anyFront || bp.plan[0] === "phone" || bp.plan[1] === "phone") {
      if (!this.headEnv) this.buildHeadEnv();
      this.headInv.copy(this.headG.matrixWorld).invert();
    }
    // the head's ink ring at the depth of the head's edge while an arm is in front (see `ring`): the plane of a ball's
    // outline as the camera sees it lies R * R / distance in front of its centre
    this.ring.visible = anyFront && front;
    if (this.ring.visible) {
      this.ring.position.copy(headC).addScaledVector(toCam, (d.R * d.R) / dist);
      this.ring.lookAt(camPos);
      this.ring.scale.setScalar(4 * d.R);
    }
    const P = st.pose, planC = { at, fwdT, leftT, headC, q1: _q1, bodyYaw, yawF: fy, lean: bp.pitch, roll: bp.roll - bp.sway, t: P.t ?? 0, am: clamp(P.amount ?? (P.kind === "shh" ? 1 : 0), 0, 1), arm: P.kind === "write" ? P.arm ?? 0 : -1,
      face: { F, U: Uf, r: d.R * hsy },
      laid: this.held.some((hd) => hd.posed && hd.g.visible && bp.plan[hd.i] === "desk" && !st.hands?.[hd.i]) };
    for (let i = 0; i < 2; i++) {
      const s = i ? 1 : -1, sh = d.sh[i].clone().applyMatrix4(this.torsoM);
      const wt = st.hands?.[i], ht = bp.hand[i];
      let target = wt ? wt.clone() : ht ? (ht.f === 1 ? travel(ht.p) : ht.p.clone().applyMatrix4(this.torsoM)) : sh.clone().add(V(0, -0.3, 0.05));
      if (!wt && ht && ht.f === 2) {
        const staged = V().setFromMatrixPosition(this.torsoM).addScaledVector(scrR, ht.p.x).addScaledVector(UP, ht.p.y).addScaledVector(scrF, ht.p.z);
        target.lerp(staged, follow * (1 - wB));
      }
      if (st.pose.kind === "point" && wt && i === (st.pose.arm ?? 1)) target = sh.clone().addScaledVector(wt.clone().sub(sh).normalize(), (d.upper + d.fore) * 0.94);
      let pole = showDir(bp.elbowPole[i]), flat = false;
      const plan = wt ? null : bp.plan[i];
      this.planOff[i] = 0;
      if (plan) { const g = this.armPlan(plan, i, sh, planC); target = g.target; pole = g.pole; flat = g.flat; }
      let k = this.solveArm(i, sh, target, pole, showDir(V(s, 0, 0)), headC);
      // an arm the swivel could not clear: the whole arm moves out (see armOut). Only for a free hand: one pinned to
      // the world (state.hands) stays where it was put, and qa.clear reports it.
      if (!wt) k = this.armOut(i, sh, target, pole, showDir(V(s, 0, 0)), headC, k);
      // an arm in front of the head that no swivel clears (a call past an ear cup while the head pops and tilts): its
      // hand goes out from the head, by what the arm is short, until the arm is outside the head's real shape
      if (!wt && this.frontArm[i] && k.c < -0.0005) for (let n = 0; n < 8; n++) {
        const short = this.armHeadClear(i, sh, k.j, k.e);
        if (short >= 0) break;
        target.addScaledVector(_w.copy(target).sub(headC).normalize(), Math.min(0.03, 0.002 - 1.5 * short));
        k = this.solveArm(i, sh, target, pole, showDir(V(s, 0, 0)), headC);
      }
      this.qa.swivel[i as 0 | 1] = k.phi; this.qa.clear = Math.min(this.qa.clear, k.c); this.qa.reach = Math.max(this.qa.reach, k.reach, this.planOff[i]);
      const seed = V().copy(k.j).sub(sh).cross(V().copy(k.e).sub(k.j));
      if (seed.lengthSq() < 1e-10) seed.copy(showDir(V(1, 0, 0)));
      this.limbs[i].update(sh, k.j, k.e, d.limbR, seed.normalize(), this.bow[i], 0.07 * hand, this.wobPh[i]);
      this.hands[i].position.copy(k.e);
      this.caps[i].position.copy(sh);
      this.out.hand[i].copy(k.e); this.out.elbow[i].copy(k.j);
      // a hand resting on the desk lays a posed thing flat under itself, across its forearm
      if (flat) { const fa = V().copy(k.e).sub(k.j).setY(0); this.layFlat(i, fa.lengthSq() > 1e-8 ? fa.normalize() : fwdT); }
      // QA beyond the arm's own clearance: what the hand holds, the furniture, the own legs, the head's real shape
      const gq = this.grip[i];
      if (gq) {
        this.qa.clear = Math.min(this.qa.clear, this.heldMin(i, k.e, gq, (p) => this.bodyGap(p)));
        if (sit) this.qa.seat = Math.min(this.qa.seat, this.heldMin(i, k.e, gq, (p) => this.furnGapW(p)));
        if (this.frontArm[i]) this.qa.head = Math.min(this.qa.head, this.heldMin(i, k.e, gq, (p) => this.headGap(p)));
      }
      if (this.frontArm[i] || sit) {
        const legOwn = d.legR * 1.08 + HULL.limb;
        for (const ri of CLEAR_RINGS) {
          const own = ri === SEG ? d.handR + HULL.hand : d.limbR * 1.08 + HULL.limb;
          limbAt(sh, k.j, k.e, ri, _w, undefined, this.bow[i]);
          if (this.frontArm[i]) this.qa.head = Math.min(this.qa.head, this.headGap(_w) - own);
          if (sit) {
            this.qa.seat = Math.min(this.qa.seat, this.furnGapW(_w) - own);
            if (ri >= N1 + NC) for (let n = 0; n < this.legPts.length; n += 3) this.qa.seat = Math.min(this.qa.seat, Math.hypot(this.legPts[n] - _w.x, this.legPts[n + 1] - _w.y, this.legPts[n + 2] - _w.z) - own - legOwn);
          }
        }
      }
      const fg = this.feet[i];
      if (sit) {
        // seated leg: as the seat has it; a dangling foot stays square to its shin
        const W = this.legW[i];
        this.limbs[2 + i].update(W.h, W.k, W.a, d.legR, leftT, this.bow[2 + i], 0.07 * hand, this.wobPh[2 + i]);
        fg.position.copy(W.a);
        fg.rotation.set(-sit.fit.footPitch[i], st.facing + 0.2 * s, 0, "YXZ");
        this.out.foot[i].copy(fg.position);
        continue;
      }
      // leg: hip joint on the turned torso, ankle planted in the travel frame, knee toward the travel direction
      const hipJ = hipJL[i].clone().applyMatrix4(this.torsoM);
      const Fl = ikFrame(hipJ, ankle[i], d.thigh, d.shin, fwdT.clone().addScaledVector(UP, 0.15), leftT);
      const knee2 = hipJ.clone().addScaledVector(Fl.dir, Fl.x).addScaledVector(Fl.pp, Fl.h), foot = hipJ.clone().addScaledVector(Fl.dir, Fl.d);
      this.limbs[2 + i].update(hipJ, knee2, foot, d.legR, leftT, this.bow[2 + i], 0.07 * hand, this.wobPh[2 + i]);
      fg.position.copy(foot); fg.position.y = Math.max(fg.position.y, at.y + d.ankleY);
      fg.rotation.set(0, st.facing + bp.footYaw[i] + clamp(wrapA(bodyYaw - st.facing), -rad(20), rad(20)), 0, "XYZ");
      this.out.foot[i].copy(fg.position);
    }
    if (sit) this.qa.seat = Math.min(this.qa.seat, sit.fit.gap, this.bodyDeskGap(sit, bp.pitch));
    // contact shadow: between the feet, stretched away from the key (CastLight contactLen)
    {
      const k = this.rc.light.key, kh = Math.hypot(k[0], k[2]) || 1, dx = -k[0] / kh, dz = -k[2] / kh, tl = this.rc.light.contactLen ?? 0;
      const spread = this.out.foot[0].distanceTo(this.out.foot[1]), wid = 0.3 + spread * 0.6, len = wid + tl * 0.5;
      this.blob.position.set((this.out.foot[0].x + this.out.foot[1].x) / 2 + dx * tl * 0.22, at.y + 0.003, (this.out.foot[0].z + this.out.foot[1].z) / 2 + dz * tl * 0.22);
      this.blob.rotation.set(-Math.PI / 2, 0, Math.atan2(dx, dz), "YXZ");
      this.blob.scale.set(wid, len, 1);
      // seated with the feet off the floor: nothing touches it, so no contact shadow (the chair has its own)
      this.blob.visible = true;
      if (sit) { const k = 1 - smooth(Math.min(sit.fit.dangle[0], sit.fit.dangle[1]) / 0.05); this.blob.visible = k > 0.01; this.blob.scale.set(wid * k, len * k, 1); }
    }
    if (this.accParts.length) for (const ap of this.accParts) ap.o.visible = !st.hide || !st.hide.includes(ap.name);
    this.qa.held = 1;
    for (const hd of this.held) {
      const gq = hd.posed ? this.grip[hd.i] : null;
      if (gq) { hd.g.position.copy(this.out.hand[hd.i]); hd.g.quaternion.copy(gq); continue; }      // a pose turns it (see PartKit.held)
      hd.g.position.copy(this.out.hand[hd.i]).add(showDir(hd.off));
      hd.g.rotation.set(hd.rot[0], bodyYaw + hd.rot[1], hd.rot[2], "YXZ");
      // QA: the gap between the held thing and this figure's own body and head (its points against their surfaces)
      hd.g.updateMatrixWorld(true);
      for (const o of hd.g.children) {
        const P = (o as THREE.Mesh).geometry?.attributes.position;
        if (!P) continue;
        for (let i = 0, step = Math.max(1, Math.floor(P.count / 240)); i < P.count; i += step) {
          _w.fromBufferAttribute(P, i).applyMatrix4(o.matrixWorld);
          this.qa.held = Math.min(this.qa.held, _w.distanceTo(headC) - d.R);
          _s.copy(_w).applyMatrix4(this.torsoInv);
          const r = bodyR(_s.y, d.Ht, d.rb, d.rt);
          if (r > 0) this.qa.held = Math.min(this.qa.held, Math.hypot(_s.x, _s.z) - r * d.bw(_s.x, _s.y, _s.z));
        }
      }
    }
    const a = st.clipboard;
    this.clip.visible = a !== undefined;
    if (a !== undefined) {
      this.clip.position.copy(this.out.hand[a]).add(showDir(V(0, 0.07, 0.035)));
      this.clip.rotation.set(-0.42, bodyYaw, 0, "YXZ");
    }
  }
}

export class RigCast {
  readonly U = lightUniforms();
  figures: Rig[] = [];
  light: CastLight;
  /** how hand-drawn the figures are: 0 = clean geometry, 1 = the reference's amount (uneven shapes, brush-weight ink,
   *  lines that are never ruler straight). Everything is fixed per character: nothing changes from frame to frame. */
  readonly hand: number;
  /** how far (in head radii) the heads' depth-only pass sits nearer the camera (see layerMat): 0.6 is just enough to
   *  keep the occlusion shade off the chin */
  headDepth: number;
  constructor(private parent: THREE.Object3D, o: { light: CastLight; hand?: number; headDepth?: number }) {
    this.light = o.light; this.hand = o.hand ?? 1; this.headDepth = o.headDepth ?? 0.6; applyLight(this.U, o.light);
    parent.add(stencilClear());
  }
  private ids = 0;
  /** a figure's stencil id, 1..127 (more figures than that share ids; it only matters where two with the same id overlap) */
  newId() { return 1 + (this.ids++ % ID_BITS); }
  /** hat = one of the two built-in hats; acc = accessories (see Acc; kit/rigacc/ has the standard ones) */
  add(look: Look, o: { hat?: Hat; acc?: Acc[] } = {}) { const r = new Rig(this, look, o); this.parent.add(r.group); this.figures.push(r); return r; }
  /** renderH = the height in pixels of the frame being rendered (the ink's minimum width is in pixels) */
  update(cam: THREE.Camera, renderH = 1920) {
    cam.updateMatrixWorld();
    this.U.uResH.value = renderH;
    for (const f of this.figures) f._update(cam);
  }
}
