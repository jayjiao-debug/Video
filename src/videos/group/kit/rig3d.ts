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
//   a.qa after update: clear = the smallest gap between an arm and the own body / head in metres (< 0 = clipping),
//   reach = how far a hand target is beyond the arm (> 0 = cannot reach).
// Staging: keep a facing out of 115-170 deg from the camera (the turn-away transition; use turn = 1 for a back view).
//   A figure's own hand never shows in front of its own head (rule 4), so poses keep the hands beside or below it.
// Pipeline: EffectComposer needs stencilBuffer: true (postprocessing: new EffectComposer(renderer, { stencilBuffer:
//   true }); @react-three/postprocessing: <EffectComposer stencilBuffer>). The figures draw in three steps by
//   renderOrder: heads (0), bodies and limbs (1), heads again as depth only (2). Within a head, a hat's shells go
//   first (-0.2), then the skin (-0.1), which skips their pixels.
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
/** walk: half stride (m) and stance share; metres per full cycle (two steps) for planted feet */
const STRIDE = 0.15, STANCE = 0.6;
export const RIG_WALK_CYCLE_M = (2 * STRIDE) / STANCE;
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
 *  part's own colour, darker and richer (cloth); stripe = a flat highlight (rgb gain, w = cos of its half width, 2 = none) */
type Part = { wrap: number; k: number; band: [number, number]; sat: number; stripe?: [number, number, number, number]; grad?: [number, number, number, number] };
type Kind = "plain" | "face" | "tube";
const HAIR_N = 256;
const FRAG_DECL = (kind: Kind) => /* glsl */ `
uniform vec3 uKey; uniform vec3 uTint; uniform float uGain; uniform vec3 uShade;
uniform float uWrap; uniform float uK; uniform vec2 uBand; uniform float uSat; uniform vec4 uStripe; uniform vec4 uGrad; uniform float uGradOn;
varying vec3 vWN; varying vec3 vWP;
${kind === "face" ? /* glsl */ `
uniform sampler2D uFace; uniform vec3 uFF; uniform vec3 uFR; uniform vec3 uFU; uniform float uFaceOn; uniform vec3 uInkLift;
uniform vec4 uHead; uniform vec3 uInk;
uniform sampler2D uHair; uniform vec3 uHairCol; uniform vec4 uHeadband; uniform vec4 uHairPart; uniform float uHairInk;
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
  for ( int i = 0; i < 3; i ++ ) {
    float fi = float( i );
    float span = smoothstep( 0.16, 0.5, sdz ) * ( 1.0 - smoothstep( 1.15 - 0.22 * fi, 1.65 - 0.22 * fi, sdz ) );
    float w = 0.027 * span;
    st = max( st, span * ( 1.0 - smoothstep( w - 0.5 * fw, w + 0.5 * fw, abs( rel - 0.6 - 0.125 * fi ) * hl ) ) );
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
  kk = mix( uK, 0.26, cov ); sat = mix( uSat, 0.8, cov );
` : ""}
  // the inner shadow: strongest at the outline, only on the side away from the key
  float s = ( 1.0 - smoothstep( uBand.x, uBand.y, ndv ) ) * smoothstep( -0.25, 0.5, -ndl );
  // cloth (grad): a drawn gradient across the form instead: a pale band along the lit edge, flat in the middle, darker
  // over the far third. It runs along the key as seen on screen, mostly sideways, and fades out when the key is
  // straight behind the camera (so it never jumps from one side to the other)
  vec3 upv = vec3( 0.0, 1.0, 0.0 ) - Vd * Vd.y;
  float upl = length( upv );
  upv = upl > 1e-3 ? upv / upl : vec3( 0.0, 0.0, 1.0 );
  vec3 Gp = L - Vd * dot( L, Vd );
  Gp -= upv * dot( Gp, upv ) * 0.65;
  float gLen = length( Gp ), gk = smoothstep( 0.06, 0.4, gLen ) * uGradOn;
  float gu = dot( n, Gp / max( gLen, 1e-4 ) );
  s = mix( s, max( smoothstep( uGrad.x, 1.0, -gu ), 0.4 * smoothstep( 0.25, 0.95, -dot( n, upv ) ) ), gk );
  vec3 bn = base / max( max( base.r, max( base.g, base.b ) ), 1e-4 );
  vec3 col = base * uTint;
  col *= mix( vec3( 1.0 ), ( 1.0 - kk ) * mix( uShade, pow( bn, vec3( 0.25 ) ), sat ), s );
  // the pale band is weaker on dark cloth (on the reference's mint it lifts the luma by about a quarter)
  float hk = uGrad.w * clamp( dot( base, vec3( 0.2126, 0.7152, 0.0722 ) ) / 0.55, 0.35, 1.0 );
  col = mix( col, vec3( 0.9, 1.0, 1.14 ) * uTint, hk * gk * smoothstep( uGrad.y, uGrad.z, gu ) );
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
  uHair: { value: THREE.Texture }; uHairCol: { value: THREE.Color }; uHeadband: { value: THREE.Vector4 }; uHairPart: { value: THREE.Vector4 }; uHairInk: NumU };
/** pull: the mesh is drawn that many metres nearer the camera along the view ray (depth only; its place on screen and
 *  its shading do not change): the head group uses it to sit in front of its own body */
const rigMat = (U: LightU, part: Part, o: THREE.MeshBasicMaterialParameters = {}, kind: Kind = "plain", face?: FaceU, pull?: NumU) => {
  const m = new THREE.MeshBasicMaterial(o);
  const P = { uWrap: { value: rad(part.wrap) }, uK: { value: part.k }, uBand: { value: new THREE.Vector2(part.band[0], part.band[1]) }, uSat: { value: part.sat }, uStripe: { value: new THREE.Vector4(...(part.stripe ?? [1, 1, 1, 2])) }, uGrad: { value: new THREE.Vector4(...(part.grad ?? [0, 2, 3, 0])) }, uGradOn: { value: part.grad ? 1 : 0 }, uPull: pull ?? { value: 0 } };
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
const PART = {
  head: { wrap: 60, k: 0.22, band: [0.5, 0.68], sat: 0 } as Part,
  body: { wrap: 62, k: 0.47, band: [0, 0.8], sat: 0.75, grad: [0.35, 0.58, 0.88, 0.42] } as Part,
  hair: { wrap: 60, k: 0.26, band: [0.2, 0.75], sat: 0.8 } as Part,
  limb: { wrap: 75, k: 0, band: [0, 0.01], sat: 0, stripe: [1.86, 1.86, 1.71, 0.925] } as Part,
  ball: { wrap: 75, k: 0, band: [0, 0.01], sat: 0, stripe: [1.86, 1.86, 1.71, 0.965] } as Part,
  prop: { wrap: 60, k: 0.3, band: [0.15, 0.75], sat: 1 } as Part,
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
gl_Position = projectionMatrix * mvPosition;
`;
type HullO = { minPx?: number; down?: number; pull?: NumU; brush?: number; seed?: number; freq?: number };
const hullMat = (U: LightU, w: number, thick = 0.4, o: HullO = {}) => {
  const m = new THREE.MeshBasicMaterial({ color: RIG_INK, side: THREE.BackSide });
  const sd = o.seed ?? 1, fr = o.freq ?? 14;
  const bv = (k: number, f: number) => { const u = 2 * rnd(sd, k) - 1, a = rnd(sd, k + 1) * 6.283, q = Math.sqrt(1 - u * u); return new THREE.Vector4(q * Math.cos(a) * f, u * f, q * Math.sin(a) * f, rnd(sd, k + 2) * 6.283); };
  const P = { uW: { value: w }, uThick: { value: thick }, uMinPx: { value: o.minPx ?? 1.6 }, uDown: { value: o.down ?? 0 }, uPull: o.pull ?? { value: 0 }, uBrush: { value: o.brush ?? 0 }, uB1: { value: bv(90, fr) }, uB2: { value: bv(94, fr * 1.7) } };
  m.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, { uKey: U.uKey, uResH: U.uResH }, P);
    sh.vertexShader = sh.vertexShader
      .replace("#include <common>", "#include <common>\nuniform vec3 uKey; uniform float uResH; uniform float uW; uniform float uThick; uniform float uMinPx; uniform float uDown; uniform float uPull; uniform float uBrush; uniform vec4 uB1; uniform vec4 uB2;")
      .replace("#include <project_vertex>", HULL_VERT);
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
  else m.stencilFunc = kind === "under" ? THREE.NotEqualStencilFunc : THREE.EqualStencilFunc;
};
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
type MouthK = "tiny" | "frown" | "smirk" | "smile" | "smileWide" | "grin" | "laugh" | "o" | "O" | "wave" | "teeth" | "lick";
/** eye = [screen left, screen right]; brow = [inner, outer] end offsets (u, + = down); tilt = the lid bar's slope (deg,
 *  + = inner end lower); bar = heavy straight brows sitting on the lids; raise = brows higher by that many u; skew =
 *  how much higher one brow rides than the other; pupil = a ring eye's pupil radius */
type FaceDef = { eye: [EyeK, EyeK]; brow: [number, number]; mouth: MouthK; tilt?: number; bar?: boolean; raise?: number; skew?: number; pupil?: number; sweat?: boolean; blush?: boolean };
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
const TEETH = "#ffffff", TONGUE = "#e8697a", SWEAT = "#a9dcff";
/** the pen: every line of a face is this wide (u), with round ends */
const PEN = 3.3;
/** design u -> canvas u (the head's outline is about 1 % wider than the ball's diameter the canvas spans) */
const FACE_FS = 0.99;
/** the face, front on, on a canvas that spans the head ball's diameter (W px). gaze -1..1 slides the pupils. */
const drawFace = (p: Pen, W: number, L: Look, expr: Expr, lid: number, brim: boolean, gaze: number, hand: number, fa: FaceAcc = faceAccOf(L, [])) => {
  const F = FACES[expr], sd = L.seed, u = (W / 100) * FACE_FS, g = p.g;
  const jit = (k: number, a: number) => (2 * rnd(sd, 60 + k) - 1) * a * hand;
  const cx = W / 2 + jit(0, 0.7) * u, E = W / 2 - (brim ? 0 : 1.5) * u;        // the eye line (lower under a hat brim)
  const strong = rnd(sd, 71) < 0.5 ? -1 : 1;                                   // the side of the higher brow and the smirk
  const pts = (a: P2[]): P2[] => a.map(([x, y]) => [cx + x * u, E + y * u] as P2);
  const line = (a: P2[], w = PEN, col = INK) => p.stroke(pts(a), w * u, col);
  const fill = (a: P2[], col: string | null, ol = 0) => p.poly(pts(a), col, ol * u);
  const turned = (x: number, y: number, deg: number, fn: () => void) => { p.rot = [rad(deg), cx + x * u, E + y * u]; fn(); p.rot = null; };
  const sp = fa.lens ? 14.3 : 14 + jit(1, 0.6);
  // accessories drawn on the face (see Acc): under = before the eyes, brows and mouth; over = after everything
  const kit: FaceKit = {
    look: L, expr, hand, sp, mouth: [jit(20, 1.1), 18.7], strong, shade: brim, PEN, INK, jit: (k, a) => jit(Math.max(k, 100), a),
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
    line(quadPts(a, [x0 + jit(16 + i, 1.2), (a[1] + b[1]) / 2 - 2 * arch], b), F.bar ? PEN + 0.9 : PEN);
  }
  // mouth
  const mx = jit(20, 1.1), my = 18.7, ms = 1 + jit(21, 0.05);
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
  turned(mx, my, jit(22, 2.5), () => {
    switch (F.mouth) {
      case "tiny": fill([...quadPts([mx - 4.6, my + 0.2], [mx - 0.4, my - 3.9], [mx + 4.6, my - 0.3], 12), ...quadPts([mx + 4.6, my - 0.3], [mx + 0.6, my + 4.3], [mx - 4.6, my + 0.2], 12).slice(1, -1)], INK, 0.7); break;
      case "frown": line(quadPts([mx - 6.5 * ms, my + 1.8], [mx, my - 5], [mx + 6.5 * ms, my + 1.8])); break;
      case "smirk": line(quadPts([mx - strong * 5.6, my + 1.3], [mx + strong * 1, my + 4.6], [mx + strong * 5.9, my - 3.3])); break;
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
const faceTex = (L: Look, expr: Expr, lid: number, brim: boolean, hand = 1, gaze = 0, fa: FaceAcc = faceAccOf(L, [])) => {
  const lq = lid >= 1 ? 1 : lid > 0 ? 0.5 : 0, gq = Math.round(clamp(gaze, -1, 1) * 2) / 2;
  const key = `${L.seed}|${expr}|${lq}|${gq}|${brim ? 1 : 0}|${L.glasses ?? ""}|${L.glassCol ?? ""}|${hand}|${fa.own ? 1 : 0}|${fa.key}`;
  let t = faceCache.get(key);
  if (t) { faceCache.delete(key); faceCache.set(key, t); return t; }
  t = canvasTex(FACE_PX, FACE_PX, (g) => drawFace(new Pen(g), FACE_PX, L, expr, lq, brim, gq, hand, fa), { amp: FACE_PX * 0.0045 * hand, seed: L.seed });
  t.generateMipmaps = true; t.minFilter = THREE.LinearMipmapLinearFilter;
  faceCache.set(key, t);
  while (faceCache.size > FACE_CACHE_MAX) { const k0 = faceCache.keys().next().value!; faceCache.get(k0)!.dispose(); faceCache.delete(k0); }
  return t;
};

/** the face drawing as a canvas (expression sheets, QA); acc = accessories drawn on the face */
export const rigFaceCanvas = (L: Look, expr: Expr, o: { lid?: number; brim?: boolean; hand?: number; gaze?: number; acc?: Acc[] } = {}) =>
  faceTex(L, expr, o.lid ?? 0, !!o.brim, o.hand ?? 1, o.gaze ?? 0, faceAccOf(L, o.acc ?? [])).image as HTMLCanvasElement;
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
      const inner = L.inner ?? "#f6f4ee", open = L.top === "jacket" ? 0.07 : 0.05;
      fillPoly([[cx - open * W, 0], [cx + open * W, 0], [cx + 0.03 * W, pantsY], [cx - 0.03 * W, pantsY]], inner);
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
  // accessories draw over the top and the trousers, in the order given, and under the look's own lanyard and tag
  // (which give way to an accessory that takes their slot)
  const drawn = accs.filter((a) => a.outfit), has = (sl: AccSlot) => accs.some((a) => a.slots.includes(sl));
  if (drawn.length) {
    trousers();
    const kit = outfitKit(g, L, hand, d, top, seam, LW);
    for (const a of drawn) { g.save(); a.outfit!(kit); g.restore(); }
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
  const NA = 28, NT = 6, A0 = rad(52), TH = 0.05, FRONT = 0.42, DROOP = 0.16, rIn = rimR - 0.028, yTop = rimY + 0.012, W = 2 * (NT + 1);
  const pos: number[] = [], uv: number[] = [], idx: number[] = [], v = V();
  for (let i = 0; i <= NA; i++) {
    const a = -A0 + (2 * A0 * i) / NA, sh = Math.sqrt(Math.max(1 - (a / A0) ** 2, 0.0025));
    const rOut = rIn + PEAK_OUT * sh, yOut = yTop - 0.012 - DROOP * (rOut - rIn);
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
export type RigPoseKind = "idle" | "walk" | "wave" | "point" | "haul" | "hold" | "cheer";
export type RigPose = { kind: RigPoseKind; t?: number; phase?: number; amount?: number; arm?: 0 | 1 };
export type RigState = {
  at: V3; facing: number; pose: RigPose;
  hands?: [V3 | null, V3 | null];
  expr?: Expr; blink?: number; visible?: boolean;
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
type BodyPose = {
  hip: V3; ankle: [V3, V3]; footYaw: [number, number];     // TRAVEL frame: x = the person's left, y up, z = the story facing
  pitch: number; roll: number; breathe: number;
  hand: [HandT | null, HandT | null];
  elbowPole: [V3, V3];                                      // show frame
  headPitch: number;
};
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
  /** 3D parts: on the head, on the body, in a hand */
  build?: (b: PartKit) => void;
};
/** Drawing on the face. Units are u = 1 % of the head's width, from the middle of the eye line: x = screen right,
 *  y = down. The eyes are at x = -sp and +sp (sp = 14), about 10u tall; the brows 13 to 21u above; the mouth's
 *  middle is at `mouth` (y = 18.7; a grin spans x +-20 and y 12 to 26); the chin's outline is near y = 44, the head's
 *  sides near x = +-50. What is drawn beyond the head's outline simply does not show. */
export type FaceKit = {
  look: Look; expr: Expr; hand: number;
  sp: number; mouth: P2;
  /** +1 / -1: the side of the higher brow and of a smirk */
  strong: number;
  /** true under a hat that shades the eyes */
  shade: boolean;
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
export type BrimO = { rIn: number; y: number; out: number | ((azDeg: number) => number); from?: number; to?: number; droop?: number; thick?: number; taper?: number; seg?: number };
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
   *  lower edge, u round the head. */
  shell: (o: PartO & { r?: number; from?: number; to?: number; squash?: number; rings?: number; geo?: THREE.BufferGeometry; rimInk?: number }) => THREE.Mesh;
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
   *  the way round), dropping `droop` per unit out (0.1; negative turns it up), `thick` at the root (0.07) and
   *  thick * taper at the rounded free edge (0.6). Thick (0.08 and up): solid(). Thin: plate(). */
  brim: (o: BrimO) => THREE.BufferGeometry;
  /** a strip of the ball of radius r for shell({ geo }): from a0 to a1 degrees from the crown along the great circle
   *  that runs ear to ear (yaw 0; - = the person's right; yaw 90 = from the back of the head over the crown to the
   *  face), `half` head units wide on each side */
  band: (o: { r: number; a0: number; a1: number; half: number; yaw?: number }) => THREE.BufferGeometry;
  /** IN A HAND: a group that follows hand i (0 = the person's right). offset = metres from the hand's centre in the
   *  body's frame (x = the person's left, y = up, z = forward); rot = [pitch, yaw, roll] in radians on top of the
   *  body's facing. layer "limb" (the default) = hidden behind the figure's own head, like the hand; "free" = plain
   *  depth (something held up over the head). Add parts to it with solid(group, ...) / plate(group, ...). */
  held: (i: 0 | 1, o?: { offset?: [number, number, number]; rot?: [number, number, number]; layer?: "limb" | "free" }) => THREE.Group;
  /** ON THE BODY: the arms stay clear of this ball (centre in body metres). Head parts need none: the head is drawn
   *  over the arms. */
  keepOut: (c: V3, r: number) => void;
  /** a canvas texture (it multiplies the part's colour); key = share it between figures under that name */
  tex: (w: number, h: number, draw: (g: CanvasRenderingContext2D) => void, key?: string) => THREE.Texture;
};
type FaceAcc = { key: string; lens: boolean; own: boolean; under: ((f: FaceKit) => void)[]; over: ((f: FaceKit) => void)[] };
/** what a figure's accessories do to its face drawing; own = the look's own glasses are drawn */
const faceAccOf = (L: Look, accs: Acc[]): FaceAcc => {
  const eyes = accs.some((a) => a.slots.includes("eyes"));
  return {
    key: accs.filter((a) => a.face || a.faceUnder || a.lens).map((a) => a.name + ":" + a.key).join(","),
    own: !!L.glasses && !eyes, lens: (!!L.glasses && !eyes) || accs.some((a) => a.lens),
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
/** see PartKit.brim: one closed, smooth surface (the cross-section is a loop: top, the rounded free edge, bottom, the
 *  root wall); uv.y = 1 on the free edge, falling by 1 per PEAK_OUT head units toward the root (what peakTex paints) */
const brimGeo = (o: BrimO, toM: (v: V3) => V3) => {
  const full = o.from === undefined && o.to === undefined, a0 = rad(o.from ?? -180), a1 = rad(o.to ?? 180);
  const NA = o.seg ?? (full ? 72 : 36), NT = 5, NE = 6, T0 = o.thick ?? 0.07, tp = o.taper ?? 0.6, dr = o.droop ?? 0.1;
  const M = 2 * (NT + 1) + NE - 1, cols = full ? NA : NA + 1;
  const pos: number[] = [], uv: number[] = [], idx: number[] = [], v = V();
  for (let i = 0; i < cols; i++) {
    const a = a0 + ((a1 - a0) * i) / NA, L = Math.max(typeof o.out === "number" ? o.out : o.out((a * 180) / Math.PI), 1e-3);
    const T = T0 * smooth(L / (2 * T0)), Te = T * tp, sn = Math.sin(a), cs = Math.cos(a);
    const push = (r: number, y: number, l: number) => { toM(v.set(r * sn, y, r * cs)); pos.push(v.x, v.y, v.z); uv.push(i / NA, 1 - (L - l) / PEAK_OUT); };
    for (let k = 0; k <= NT; k++) { const t = k / NT; push(o.rIn + L * t, o.y - dr * L * t, L * t); }                       // top, root -> edge
    for (let j = 1; j < NE; j++) { const an = Math.PI / 2 - (Math.PI * j) / NE; push(o.rIn + L + (Te / 2) * Math.cos(an), o.y - dr * L - Te / 2 + (Te / 2) * Math.sin(an), L); }
    for (let k = NT; k >= 0; k--) { const t = k / NT; push(o.rIn + L * t, o.y - dr * L * t - lerp(T, Te, t), L * t); }      // bottom, edge -> root
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
  return g;
};
/** see PartKit.band: a patch of the ball of radius r, its normals the ball's */
const bandGeo = (r: number, a0: number, a1: number, half: number, yaw = 0) => {
  const NA = 44, NW = 4, cy = Math.cos(rad(yaw)), sy = Math.sin(rad(yaw)), pos: number[] = [], nor: number[] = [], uv: number[] = [], idx: number[] = [];
  for (let i = 0; i <= NA; i++) for (let j = 0; j <= NW; j++) {
    const a = rad(lerp(a0, a1, i / NA)), w = lerp(-half, half, j / NW) / r, sa = Math.sin(a);
    const x = sa * cy - w * sy, y = Math.cos(a), z = sa * sy + w * cy, l = Math.hypot(x, y, z);
    pos.push((x / l) * r, (y / l) * r, (z / l) * r); nor.push(x / l, y / l, z / l); uv.push(i / NA, j / NW);
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
      b.shell({ r: 1.075, to: 63, squash: ySq, mat: hm });
      // the peak: a wedge out of the gap under the rim, with its ink edge painted on it and no hull (see peakGeo)
      b.plate("head", peakGeo(rimR, rimY, b.toM), { col: trim, map: peakTex() });
      b.solid("head", new THREE.SphereGeometry(b.R * 0.085, 12, 8), { mat: tm, ink: HULL.prop * 0.6 }).position.copy(b.at(0, 1.075 * ySq, 0));
    } else {
      b.shell({ r: 1.07, to: 60, squash: 1.04, mat: hm });
      b.shell({ r: 1.115, from: 50, to: 68, rings: 5, mat: tm, ink: HULL.prop, thick: 0.4 });
      b.solid("head", new THREE.SphereGeometry(b.R * 0.17, 14, 10), { mat: tm }).position.copy(b.at(0, 1.07 * 1.04, 0)).add(V(0, b.R * 0.1, 0));
    }
  },
});

// ===== the figure =====
type Dim = { R: number; ys: number; Ht: number; rb: number; rt: number; hipY: number; thigh: number; shin: number; upper: number; fore: number; limbR: number; legR: number; handR: number; ankleY: number; sh: [V3, V3]; bw: (x: number, y: number, z: number) => number; H: Blob };
/** ink widths (m). Reference, in head widths: the head's line 2.2 % on the lit side, 5.5 % on the far side, 8 % under
 *  the chin; the body's line about as heavy; a limb with its line about 5.4 %, a hand about 2.1 x the limb */
const HULL = { head: 0.021, body: 0.0175, limb: 0.0037, hand: 0.0041, prop: 0.011 };
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

const _q1 = new THREE.Quaternion(), _q2 = new THREE.Quaternion(), _q3 = new THREE.Quaternion(), _s = V(), _w = V();

export class Rig {
  readonly group = new THREE.Group();
  look: Look;
  state: RigState = { at: V(), facing: 0, pose: { kind: "idle" } };
  readonly dim: Dim;
  /** QA after update: worst hand reach error (m) and the smallest arm clearance to the body / head (m, < 0 = inside) */
  qa = { reach: 0, clear: 1, swivel: [0, 0] as [number, number] };
  private torsoG = new THREE.Group(); private headG = new THREE.Group();
  private faceU: FaceU; private hatLine: number;
  /** this figure's accessories (the hat option comes first), what they do to the face drawing, and whether a hat
   *  shades the eyes */
  readonly acc: Acc[]; private fa: FaceAcc; private shade: boolean;
  /** held things (they follow a hand) and the balls the arms stay clear of (body frame; w = in the world, per frame) */
  private held: { g: THREE.Group; i: 0 | 1; off: V3; rot: [number, number, number] }[] = [];
  /** each accessory's 3D parts (state.hide switches them off by the accessory's name) */
  private accParts: { name: string; o: THREE.Object3D }[] = [];
  private keep: { c: V3; r: number; w: V3 }[] = [];
  private limbs: Tube[] = []; private hands: THREE.Mesh[] = []; private feet: THREE.Group[] = []; private caps: THREE.Mesh[] = [];
  private clip: THREE.Group; private blob: THREE.Mesh;
  private torsoM = new THREE.Matrix4(); private torsoInv = new THREE.Matrix4();
  private out = { hand: [V(), V()] as [V3, V3], head: V(), foot: [V(), V()] as [V3, V3], bodyYaw: 0, faceYaw: 0 };
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
      for (const sl of a.slots) {
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
      h.frustumCulled = false;
      if (ho.pull) {                                                     // a head part: its depth-only twins
        const dp = ho.pull === this.curlPullU ? this.curlDepthU : this.depthU, hm = hullMat(U, w, thick, { ...hs, pull: dp });
        hm.colorWrite = false;
        for (const tm of [rigMat(U, PART.head, { colorWrite: false }, "plain", undefined, dp), hm]) {
          const t = add(m, new THREE.Mesh(tm === hm ? hg : geo, tm), false);
          t.frustumCulled = false; t.userData.depthOnly = true;
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
    };
    const skinM = inked(this.headG, warpGeo(new THREE.SphereGeometry(1, 72, 48), warp, d.R), rigMat(U, PART.head, { color: skin }, "face", this.faceU, pullU), HULL.head, 0.63, { down: 0.5, ...HP });
    const shells: THREE.Mesh[] = [];                                            // a hat's parts that enclose the head
    const hairSolid = () => onHead(PART.hair, { color: L.hairCol });
    if (L.hair === "bun" && hairProps) {
      const bun = inked(this.headG, new THREE.SphereGeometry(d.R * 0.36, 24, 16), hairSolid(), HULL.prop * 0.8, 0.4, HP);
      bun.position.copy(at(0, 0.78, -0.52));
    }
    if (L.hair === "curly" && hairProps) {
      const spots: [number, number][] = [[0, 22], [70, 40], [-70, 40], [140, 55], [-140, 55], [180, 20], [180, 78], [105, 80], [-105, 80]];
      for (const [azD, thD] of spots) {
        const az = rad(azD), th = rad(thD), c = inked(this.headG, new THREE.SphereGeometry(d.R * 0.2, 16, 12), hairSolid(), HULL.prop * 0.7, 0.4, { pull: this.curlPullU });
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
          const from = so.from ?? 0, to = so.to ?? 60, r = so.r ?? 1.08, sq = so.squash ?? 1, tl = tq;
          const g0 = so.geo ?? new THREE.SphereGeometry(r, 48, so.rings ?? 14, 0, Math.PI * 2, rad(from), rad(to - from));
          const pre = sq !== 1 || tl ? (v: V3) => { v.y *= sq; if (tl) v.applyQuaternion(tl); } : undefined;
          const po: PartO = so.rimInk && !so.map && !so.mat ? { ...so, map: rimInkTex(so.rimInk / (r * d.R * rad(to - from))) } : so;
          const m = part(inked(this.headG, warpGeo(g0, warp, d.R, pre), paint("head", po), so.ink ?? HULL.prop * 1.2, so.thick ?? 0.45, HP));
          shells.push(m);
          return m;
        },
        solid: (on, geo, po = {}) => part(inked(parentOf(on), geo, paint(on, po), po.ink ?? HULL.prop * 0.8, po.thick ?? 0.4, on === "head" ? HP : {}, hardEdges(geo) ? hullGeo(geo) : geo)),
        plate: (on, geo, po = {}) => {
          const m = part(add(parentOf(on), new THREE.Mesh(geo, paint(on, po.map || po.mat || po.edge === false ? po : { ...po, map: peakTex() }))));
          if (on === "head") {
            const t = add(m, new THREE.Mesh(geo, rigMat(U, PART.head, { colorWrite: false }, "plain", undefined, this.depthU)), false);
            t.frustumCulled = false; t.userData.depthOnly = true;
          }
          return m;
        },
        brim: (bo) => brimGeo(bo, toM),
        band: (bo) => bandGeo(bo.r, bo.a0, bo.a1, bo.half, bo.yaw),
        held: (i, ho = {}) => {
          const g = new THREE.Group();
          if (ho.layer === "free") g.userData.free = true;
          this.group.add(g); this.held.push({ g, i, off: V(...(ho.offset ?? [0, 0, 0])), rot: ho.rot ?? [0, 0, 0] });
          return g;
        },
        keepOut: (c, r) => { this.keep.push({ c: c.clone(), r, w: V() }); },
        tex: (w, h, draw, key) => {
          let t = key ? accTexCache.get(key) : undefined;
          if (!t) { t = canvasTex(w, h, draw); if (key) accTexCache.set(key, t); }
          return t;
        },
      };
      a.build(kit);
    }
    // limbs: 0 right arm, 1 left arm, 2 right leg, 3 left leg (built in world space: the group stays at the origin)
    const limbMat = rigMat(U, PART.limb, { color: LIMB_COL }, "tube"), ballMat = rigMat(U, PART.ball, { color: LIMB_COL });
    const limbHull = hullMat(U, HULL.limb, 0.3), ballHull = hullMat(U, HULL.hand, 0.3, { brush: 0.15 * hand, seed: sd + 7, freq: 60 });
    for (let i = 0; i < 4; i++) {
      const tb = new Tube(); this.limbs.push(tb);
      add(this.group, new THREE.Mesh(tb.geo, limbMat)).frustumCulled = false;
      add(this.group, new THREE.Mesh(tb.geo, limbHull), false).frustumCulled = false;
    }
    const handGeo = new THREE.SphereGeometry(d.handR, 24, 16), capGeo = new THREE.SphereGeometry(d.limbR, 12, 8);
    // L foot: the leg bent forward at the ankle: the same thickness, heel on the ankle
    const footLen = 0.055, footGeo = new THREE.CapsuleGeometry(d.legR, footLen, 5, 12);
    for (let i = 0; i < 2; i++) {
      const h = add(this.group, new THREE.Mesh(handGeo, ballMat));
      add(h, new THREE.Mesh(handGeo, ballHull), false).frustumCulled = false;
      this.hands.push(h);
      const cap = add(this.group, new THREE.Mesh(capGeo, ballMat));       // the arm's rounded root on the shoulder
      add(cap, new THREE.Mesh(capGeo, limbHull), false).frustumCulled = false;
      this.caps.push(cap);
      const fg = new THREE.Group(); this.group.add(fg);
      const foot = add(fg, new THREE.Mesh(footGeo, ballMat));
      foot.rotation.x = Math.PI / 2; foot.position.set(0, 0, footLen / 2);
      add(foot, new THREE.Mesh(footGeo, limbHull), false).frustumCulled = false;
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
      for (let q: THREE.Object3D | null = m; q; q = q.parent) if (q === cb || q.userData.free) return;       // props keep their true depth
      const head = heads.has(m), mat = m.material as THREE.Material;
      if (m.userData.depthOnly) { layerMat(mat, sid, "depth"); m.renderOrder = 2; return; }
      layerMat(mat, sid, head ? "head" : "under");
      if (!head) { m.renderOrder = 1; if (!this.under.includes(mat)) this.under.push(mat); }
    });
    // a hat's shells are drawn before the skin, and the skin skips the pixels they took: a shell's front is always
    // nearer than the head inside it, and this does not rest on the depth test. (At the head's own outline, under a
    // hat, the rasteriser can give one sample of an edge-on triangle a depth in front of the hat: a one-pixel speck
    // of skin on the hat, here and there, for one frame.)
    if (shells.length) {
      for (const sh of shells) sh.renderOrder = -0.2;
      skinM.renderOrder = -0.1; (skinM.material as THREE.Material).stencilFunc = THREE.NotEqualStencilFunc;
    }
  }

  set(s: Partial<RigState>) { Object.assign(this.state, s); return this; }
  handWorld(i: 0 | 1) { return this.out.hand[i].clone(); }
  headWorld() { return this.out.head.clone(); }
  footWorld(i: 0 | 1) { return this.out.foot[i].clone(); }
  get bodyYaw() { return this.out.bodyYaw; }
  get faceYaw() { return this.out.faceYaw; }

  /** the pose: hips and feet in the travel frame, hands torso-local (or travel / staged). Hand targets are set in arm
   *  lengths from the shoulders, so they stay within reach for any build. */
  private solvePose(): BodyPose {
    const d = this.dim, st = this.state, P = st.pose, t = P.t ?? 0, sx = 0.085, A = d.upper + d.fore, shx = (i: number) => Math.abs(d.sh[i].x), shy = d.sh[0].y, shz = d.sh[0].z;
    const bp: BodyPose = {
      hip: V(0, d.hipY, 0), pitch: 0, roll: 0, breathe: 0.012 * Math.sin(t * 2 * Math.PI * 0.28),
      hand: [null, null], elbowPole: [V(-1, -0.1, -0.7), V(1, -0.1, -0.7)],
      ankle: [V(-sx, d.ankleY, 0), V(sx, d.ankleY, 0)], footYaw: [-0.35, 0.35], headPitch: rad(st.lookDown ?? 0),
    };
    // hanging hand: near full reach (almost straight, a small outward bow), just outside the body's side
    const reach = 0.972 * A;
    const hang = (i: number, dz = 0): HandT => {
      const s = i ? 1 : -1, hx = d.rb + 0.05, hz = 0.03 + dz, dx = hx - shx(i), dzz = hz - shz;
      return { p: V(s * hx, shy - Math.sqrt(Math.max(0.01, reach * reach - dx * dx - dzz * dzz)), hz), f: 0 };
    };
    switch (P.kind) {
      case "idle": {
        bp.roll = rad(1.2) * Math.sin(t * 2 * Math.PI * 0.21);
        bp.hand = [hang(0, 0.012 * Math.sin(t * 1.3)), hang(1, 0.012 * Math.sin(t * 1.3 + 1))];
        break;
      }
      case "walk": {
        const ph = P.phase ?? (t * 1.6) % 1;
        for (let k = 0; k < 2; k++) {
          const q = (((ph + 0.5 * k) % 1) + 1) % 1;
          let z: number, y = d.ankleY;
          if (q < STANCE) z = STRIDE - (2 * STRIDE * q) / STANCE;
          else { const u = (q - STANCE) / (1 - STANCE); z = -STRIDE + 2 * STRIDE * smooth(u); y += 0.07 * Math.sin(Math.PI * u); }
          bp.ankle[k].set((k ? 1 : -1) * 0.07, y, z);
          bp.hand[1 - k] = hang(1 - k, -z * 0.8);        // the opposite arm swings with this leg
        }
        bp.footYaw = [-0.12, 0.12];
        bp.hip.y -= 0.01 * Math.abs(Math.cos(ph * 4 * Math.PI));
        bp.pitch = rad(4);
        break;
      }
      case "wave": {
        const a = P.arm ?? 1, s = a ? 1 : -1, w = Math.sin(t * 2 * Math.PI * 1.6);
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
        const a = P.arm ?? 1, s = a ? 1 : -1;
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
    return bp;
  }

  /** smallest clearance of arm i (shoulder a, elbow j, hand e) to the body surface and the head, in metres. Every ring
   *  keeps its own ink clear of the body (that line never cuts into the body's); the head is a looser test, because
   *  the head is drawn in front of whatever is near it. */
  private armClear(i: number, a: V3, j: V3, e: V3, headC: V3) {
    const d = this.dim;
    let worst = 1;
    for (const ri of CLEAR_RINGS) {
      const own = ri === SEG ? d.handR + HULL.hand : d.limbR * 1.08 + HULL.limb;
      limbAt(a, j, e, ri, _w, undefined, this.bow[i]);
      worst = Math.min(worst, _w.distanceTo(headC) - d.R * 1.04 - own);
      _s.copy(_w).applyMatrix4(this.torsoInv);
      const r = bodyR(_s.y, d.Ht, d.rb, d.rt);
      if (r > 0) worst = Math.min(worst, Math.hypot(_s.x, _s.z) - r * d.bw(_s.x, _s.y, _s.z) - own - 0.002);
      for (const k of this.keep) worst = Math.min(worst, _w.distanceTo(k.w) - k.r - own);
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
    this.qa.reach = 0; this.qa.clear = 1;
    const front = (st.headFront ?? 1) >= 0.5, fn = front ? THREE.NotEqualStencilFunc : THREE.AlwaysStencilFunc;
    for (const m of this.under) m.stencilFunc = fn;
    this.depthU.value = front ? this.rc.headDepth * d.R : 0; this.curlDepthU.value = this.depthU.value - 0.03;
    const hand = this.rc.hand;
    const camPos = V().setFromMatrixPosition(cam.matrixWorld), at = st.at;
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
    const bodyYaw = faceT + follow * wrapA(camYaw + offB - faceT);
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
    // hip joints: under the body, in the TRAVEL frame (they turn with the feet, not with the camera-turned torso), so
    // the legs never cross however far the torso has turned toward the camera
    const dT = wrapA(st.facing - bodyYaw), hjx = 0.38 * d.rb * Math.cos(dT), hjz = 0.38 * d.rb * Math.sin(dT);
    const hipJL = [V(-hjx, 0.09 * d.Ht, hjz), V(hjx, 0.09 * d.Ht, -hjz)];
    const ankle = [travel(bp.ankle[0]), travel(bp.ankle[1])];
    const legLen = d.thigh + d.shin;
    // lower the hips until both ankles are within reach: feet never hover
    for (let n = 0; n < 3; n++) {
      this.torsoM.compose(travel(bp.hip, _w), tq, scl);
      let need = 0;
      for (let i = 0; i < 2; i++) need = Math.max(need, _s.copy(hipJL[i]).applyMatrix4(this.torsoM).distanceTo(ankle[i]) - 0.985 * legLen);
      if (need <= 1e-4) break;
      bp.hip.y -= need * 1.05;
    }
    this.torsoM.compose(travel(bp.hip, _w), tq, scl);
    this.torsoInv.copy(this.torsoM).invert();
    this.torsoG.matrix.copy(this.torsoM);
    this.headG.rotation.set(bp.headPitch * 0.6, 0, 0);
    this.torsoG.updateMatrixWorld(true);
    const headC = V().setFromMatrixPosition(this.headG.matrixWorld);
    this.out.head.copy(headC);
    for (const k of this.keep) k.w.copy(k.c).applyMatrix4(this.torsoM);
    // 3. face direction: toward the camera, nudged toward where the head points, at most FACE_MAX from the camera;
    //    it goes round with the head for a back view. Its upward slide stops under the hairline / hat brim.
    const toCam = camPos.clone().sub(headC), dist = toCam.length() || 1; toCam.divideScalar(dist);
    const camYawH = Math.atan2(toCam.x, toCam.z), camPitch = Math.asin(clamp(toCam.y, -1, 1));
    const rel = wrapA(bodyYaw - camYawH);
    const slid = camYawH + clamp(rel * 0.3, -FACE_MAX, FACE_MAX);
    const fy = lerpA(lerpA(bodyYaw, slid, follow), bodyYaw, wB);
    const storyPitch = -bp.headPitch - bp.pitch * 0.5;
    let fp = camPitch + clamp((storyPitch - camPitch) * 0.4, -rad(12), rad(12));
    const line = this.hatLine || hairLine(L, wrapA(fy - bodyYaw));
    fp = Math.min(fp, rad(58 - line) - bp.headPitch * 0.6);
    fp = lerp(fp, 0, wB);
    const F = V(Math.sin(fy) * Math.cos(fp), Math.sin(fp), Math.cos(fy) * Math.cos(fp));
    const Rf = V().crossVectors(UP, F).normalize(), Uf = V().crossVectors(F, Rf);
    const roll = bp.roll * 0.8;
    if (roll) { Rf.applyAxisAngle(F, -roll); Uf.applyAxisAngle(F, -roll); }
    this.faceU.uFF.value.copy(F); this.faceU.uFR.value.copy(Rf); this.faceU.uFU.value.copy(Uf);
    this.faceU.uFace.value = faceTex(L, st.expr ?? "neutral", clamp(st.blink ?? 0, 0, 1), this.shade, hand, st.gaze ?? 0, this.fa);
    this.faceU.uHead.value.set(headC.x, headC.y, headC.z, d.R);
    // turning away: the face goes round with the head and fades as it nears the edge of the ball (it is gone before it
    // could be a sliver of a profile); from overhead it simply stays on the front of the head
    this.faceU.uFaceOn.value = 1 - follow * smooth((Math.abs(wrapA(fy - camYawH)) - rad(46)) / rad(26));
    this.out.faceYaw = fy;
    // 4. arms (show frame, on the leaned torso) with the clearance swivel; legs (travel frame)
    const showDir = (p: V3) => p.clone().applyQuaternion(_q1);
    const scrF = V(Math.sin(camYaw), 0, Math.cos(camYaw)), scrR = V(Math.cos(camYaw), 0, -Math.sin(camYaw));
    for (let i = 0; i < 2; i++) {
      const s = i ? 1 : -1, sh = d.sh[i].clone().applyMatrix4(this.torsoM);
      const wt = st.hands?.[i], ht = bp.hand[i];
      let target = wt ? wt.clone() : ht ? (ht.f === 1 ? travel(ht.p) : ht.p.clone().applyMatrix4(this.torsoM)) : sh.clone().add(V(0, -0.3, 0.05));
      if (!wt && ht && ht.f === 2) {
        const staged = V().setFromMatrixPosition(this.torsoM).addScaledVector(scrR, ht.p.x).addScaledVector(UP, ht.p.y).addScaledVector(scrF, ht.p.z);
        target.lerp(staged, follow * (1 - wB));
      }
      if (st.pose.kind === "point" && wt && i === (st.pose.arm ?? 1)) target = sh.clone().addScaledVector(wt.clone().sub(sh).normalize(), (d.upper + d.fore) * 0.94);
      let k = this.solveArm(i, sh, target, showDir(bp.elbowPole[i]), showDir(V(s, 0, 0)), headC);
      // an arm the swivel could not clear (on some builds the body swells just under the shoulder): the whole arm,
      // shoulder and hand, moves straight out from the body's axis, 1 mm at a time (it takes 2 or 3). Only for a free
      // hand: one pinned to the world (state.hands) stays where it was put, and qa.clear reports it.
      if (!wt && k.c < -0.0005) {
        const out = _s.copy(sh).applyMatrix4(this.torsoInv).setY(0);
        if (out.lengthSq() > 1e-8) {
          const dir = out.normalize().transformDirection(this.torsoM).clone();
          for (let n = 0; n < 8 && k.c < 0; n++) { sh.addScaledVector(dir, 0.001); target.addScaledVector(dir, 0.001); k = this.solveArm(i, sh, target, showDir(bp.elbowPole[i]), showDir(V(s, 0, 0)), headC); }
        }
      }
      this.qa.swivel[i as 0 | 1] = k.phi; this.qa.clear = Math.min(this.qa.clear, k.c); this.qa.reach = Math.max(this.qa.reach, k.reach);
      const seed = V().copy(k.j).sub(sh).cross(V().copy(k.e).sub(k.j));
      if (seed.lengthSq() < 1e-10) seed.copy(showDir(V(1, 0, 0)));
      this.limbs[i].update(sh, k.j, k.e, d.limbR, seed.normalize(), this.bow[i], 0.07 * hand, this.wobPh[i]);
      this.hands[i].position.copy(k.e);
      this.caps[i].position.copy(sh);
      this.out.hand[i].copy(k.e);
      // leg: hip joint on the turned torso, ankle planted in the travel frame, knee toward the travel direction
      const hipJ = hipJL[i].clone().applyMatrix4(this.torsoM);
      const Fl = ikFrame(hipJ, ankle[i], d.thigh, d.shin, fwdT.clone().addScaledVector(UP, 0.15), leftT);
      const knee2 = hipJ.clone().addScaledVector(Fl.dir, Fl.x).addScaledVector(Fl.pp, Fl.h), foot = hipJ.clone().addScaledVector(Fl.dir, Fl.d);
      this.limbs[2 + i].update(hipJ, knee2, foot, d.legR, leftT, this.bow[2 + i], 0.07 * hand, this.wobPh[2 + i]);
      const fg = this.feet[i];
      fg.position.copy(foot); fg.position.y = Math.max(fg.position.y, at.y + d.ankleY);
      fg.rotation.set(0, st.facing + bp.footYaw[i] + clamp(wrapA(bodyYaw - st.facing), -rad(20), rad(20)), 0);
      this.out.foot[i].copy(fg.position);
    }
    // contact shadow: between the feet, stretched away from the key (CastLight contactLen)
    {
      const k = this.rc.light.key, kh = Math.hypot(k[0], k[2]) || 1, dx = -k[0] / kh, dz = -k[2] / kh, tl = this.rc.light.contactLen ?? 0;
      const spread = this.out.foot[0].distanceTo(this.out.foot[1]), wid = 0.3 + spread * 0.6, len = wid + tl * 0.5;
      this.blob.position.set((this.out.foot[0].x + this.out.foot[1].x) / 2 + dx * tl * 0.22, at.y + 0.003, (this.out.foot[0].z + this.out.foot[1].z) / 2 + dz * tl * 0.22);
      this.blob.rotation.set(-Math.PI / 2, 0, Math.atan2(dx, dz), "YXZ");
      this.blob.scale.set(wid, len, 1);
    }
    if (this.accParts.length) for (const ap of this.accParts) ap.o.visible = !st.hide || !st.hide.includes(ap.name);
    for (const hd of this.held) {
      hd.g.position.copy(this.out.hand[hd.i]).add(showDir(hd.off));
      hd.g.rotation.set(hd.rot[0], bodyYaw + hd.rot[1], hd.rot[2], "YXZ");
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
  /** a figure's stencil id, 1..255 (more figures than that share ids; it only matters where two with the same id overlap) */
  newId() { return 1 + (this.ids++ % 255); }
  /** hat = one of the two built-in hats; acc = accessories (see Acc; kit/rigacc/ has the standard ones) */
  add(look: Look, o: { hat?: Hat; acc?: Acc[] } = {}) { const r = new Rig(this, look, o); this.parent.add(r.group); this.figures.push(r); return r; }
  /** renderH = the height in pixels of the frame being rendered (the ink's minimum width is in pixels) */
  update(cam: THREE.Camera, renderH = 1920) {
    cam.updateMatrixWorld();
    this.U.uResH.value = renderH;
    for (const f of this.figures) f._update(cam);
  }
}
