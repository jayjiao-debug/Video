// THE PRIVY of the Hongmen film (鸿门宴): the place of the film's FIRST and LAST picture. Liu Bang sits on a privy seat
// in Xiang Yu's camp and does the "shh, look at my jawline" gesture while the narrator says 他靠上厕所，躲过了一场暗杀。
// Built in code, in the way of arthur/sets/yard.ts (bt/pbr materials, ink outlines by vasa/ink, N8AO, one key light).
//
// The place (metres, y up, floor y = 0; everything is built round PRIVY_AT, the floor point under the seat's middle;
// the sitter faces +z, the cameras live on +z and on his RIGHT (-x), the side of the hand that does the gesture):
//   - the seat:
//       variant "B" (the film's): a COMMODE shaped like the thing everybody knows, pale: an oval bowl on a foot, a
//       seat ring on it (a dark joint line under the ring), UNDER the sitter, and the seat's own lid standing open on
//       a hinge behind his back, free of everything behind it. Its seat is as high as his thighs lie level (SEAT_TOP).
//       He SITS ON it: his robe knows the seat (acc/garb.ts setSeat / onSeat; acc/liu_dage.ts
//       gives both privy figures the seat), so the cloth lies over his thighs as a lap that rests on the seat's top,
//       and hangs down only in front of the seat, from the knees over the shins to the hem. From the cameras the bowl
//       and its foot show under his hips and thighs and behind his calves (the numbers: "THE COMMODE", at the marks).
//       variant "A" (period): a plain plank box seat, one piece with a plank ledge along the back (a figure on it
//       needs setSeat(rig, PRIVY.seat.A, PRIVY_FACING): preview/opening.ts does it);
//   - a low reed screen behind and on his left (B: top 0.885 m, under the seated head's middle, so the face and the
//     hand read against the dark wall); B has none on his right, the hero camera's side (A: a short piece);
//   - a hanging wooden sign with the character 厕, upper screen left (over the gesture's hand), on two cords that
//     leave the frame's top; B: turned toward the hero camera;
//   - a bronze oil lamp at screen left: B a standing lamp on the floor behind him on his right, A a small one on
//     the ledge (its flame is the warm accent; animate(t) breathes it). Nothing else: the bucket of wiping sticks,
//     its table and (B) the lamp's side table are gone (the owner could not tell what the bucket was);
//   - a dark indigo cloth wall (calm: nothing on it but the sign; the name tag goes upper screen right); B: it
//     stands across the corner behind him, so that it has no end and no corner in the hero camera's frame;
//   - a beaten-earth floor with a woven mat (B: under the commode and his feet, with soft contact shades under the
//     commode, his feet and the lamp).
// B IS ARRANGED FOR THE HERO CAMERA (PRIVY.cams.hero, 58 degrees round on his right): the sign's turn, the lamp's place,
// the cloth wall and the key light (PRIVY_KEY) follow HERO_YAW.
// Nothing is crude: the robe is down, the seat's hole is never seen (the bowl's top is closed).
//
// Use (a segment):
//   const M = mats(makeEnv(gl), makeEnv(gl, PRIVY_FILL));
//   const set = buildPrivy(M, { variant: "B" });  root.add(set.group);            // the lights are INSIDE the group
//   scene.background = new THREE.Color(PRIVY_BG);  N8AO per PRIVY_AO;  the figures' CastLight = PRIVY_CAST_LIGHT
//   (its key points at the hero camera on purpose: read the note at PRIVY_CAST_LIGHT before changing it)
//   const liu = addPerson(rc, LIU_PRIVY), big = addPerson(rc, LIU_DAGE);          // acc/liu_dage.ts: their robes know
//                                                                                 // this seat (PRIVY.seat.B) by themselves
//   per frame f of the shot (0 = the film's first frame):
//     const P = privyOpening(f);                      // or privyClosing(g, len) for the film's last shot
//     liu.set({ ...P.state, visible: P.who === 0 });  big.set({ ...P.state, visible: P.who === 1 });
//     camera <- P.cam;  set.animate(P.t);  rc.update(camera, heightPx)
// Ink: nothing stands a few centimetres proud of what it sits on (the screens' rails are painted on them, the sign hangs
// well clear of the cloth wall, hoops and plank joints are painted, the bowl is one smooth profile); thin round
// things are under 3 cm. Nothing of the set is less than 9 cm behind the robe where the lens can see it (the ink pass
// would draw its lines over the cloth), and the lid stands 14 cm clear of the screen behind it.
// Determinism: seeded painting only; animate(t) and privyOpening(f) are pure functions of their argument.
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { LIGHTS, type EnvSpec, type Mats } from "../../bt/pbr";
import { NOINK } from "../../vasa/ink";
import { rng } from "../../arthur/sets/yard_paint";
import { rigJawline, rigHeadAdd, type RigSeat, type RigState, type RigHead } from "../../group/kit/rig3d";
import type { Expr } from "../../group/kit/toon";
import { L } from "../lang";

type V3 = [number, number, number];
export type PrivyVariant = "A" | "B";
export type PrivyCam = { pos: V3; look: V3; fov: number };
const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const rad = (d: number) => (d * Math.PI) / 180;
const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x));

// =====================================================================================================================
// marks (world)
// =====================================================================================================================
/** the floor point under the middle of the seat (far from the tent at x 0 and the camp at x 60 and beyond) */
export const PRIVY_AT: V3 = [-60, 0, 0];
/** the seat's top above the floor. 0.235 m: the height at which the seated figure's THIGHS LIE LEVEL with its feet on
 *  the floor. The rig lays a seated thigh as low as the leg allows (group/kit/rig3d seatFit): the hip joints are
 *  7.3 cm over the seat's top, the knees 30.9 cm over the floor (Liu Bang's shin of 29.1 cm with the foot on the
 *  ground). On the first commode (0.30 m) the thighs therefore sloped 13 degrees down to the knees, and the lap read
 *  as a bulge that falls away from the waist, not as a lap (two viewers: "no thigh shelf"). At 0.235 hip joints and
 *  knees are both 30.8 cm up (preview/opening.ts dbg: LEGS): the lap's top is one level line from the belly to the
 *  knee, with the knee as its corner. On a higher seat than 0.30 the feet hang and the shoes come through the front
 *  of the robe (tried at 0.38). For another figure: SEAT_TOP = its shin + 1.8 cm - 7.3 cm. */
export const SEAT_TOP = 0.235;
/** variant A only: the box seat's front edge, in front of the seat's middle: as built AND as the rig and the robe
 *  know it (RigSeat.front), like SEAT_EDGE of the commode. The knees are then 12.5 cm in front of it and the cloth
 *  hangs from them in front of the planks (acc/garb.ts setSeat: with the front at the rig's default 0.2 the knees
 *  are only 3 cm in front of where the cloth may hang, the hanging part draws back and the bare shins show). */
const SEAT_FRONT = 0.13;
/** the sitter faces +z (toward the cameras) */
export const PRIVY_FACING = 0;
// THE COMMODE (variant B), and why its numbers are these. The sitter's hip is 3 cm behind the seat's middle (z -0.03);
// his body is 0.30 m across with the robe, his thighs go forward 0.29 m to the knees (z +0.26), his shins stand
// under the knees. The robe is told the seat (acc/garb.ts setSeat): below the seat's top it hangs only in front of
// SEAT_EDGE + 2.5 cm (z 0.155 .. 0.28: the cloth over the shins), above it it is the lap and the hips, whose underside
// lies 1.4 cm over the seat's top.
//   - SEAT_EDGE = the seat's front edge as the RIG and the ROBE know it (RigSeat.front): 0.13 m in front of the
//     seat's middle. The knees are 12.5 cm in front of it, so the cloth that hangs from them is 12.5 cm deep: a calf's
//     depth, not a sheet.
//   - the BOWL is an oval BOWL_RX x BOWL_RZ round z = BOWL_ZC, top = SEAT_TOP, wider than the sitter (6.7 cm of seat
//     show on either side of his hips). Its front (z +0.065) is 9 cm behind the BACK of the hanging cloth: so from
//     every camera on the front half the calves and the robe's front fall in front of the bowl with air between, none
//     of the bowl's lines is inked over the cloth (the ink pass draws a world line over a figure that is less than
//     about 9 cm in front of it), and the bowl is never between the cloth and its own outline (the back of a shell
//     1 cm outside the cloth). Its back (z -0.335) is 14 cm behind his back.
//   - the SEAT is the bowl's top SEAT_H: a ring of its own (a dark joint line all round under it, painted as a band
//     of the same smooth profile: a step would ink as dashes), so that what he sits on is seen to be a seat.
//   - the LID is the SEAT's own oval (as wide as the bowl, LID_H = the bowl's depth tall: the lid that would cover
//     it, not a disc bigger than the bowl), plain, of the seat's colour, hinged on the back of the seat (z LID_HINGE,
//     a dark hinge bar under it) and standing open, leaning LID_TILT back: its front face is 11 cm behind the
//     robe's back at the seat and more higher up; its top (SEAT_TOP + 0.39) is at his waist. Nothing touches it from
//     behind: the reed screen stands LID_GAP = 14 cm behind its rearmost point (the owner saw the first lid, which
//     leaned ON the screen, "clipping into the background").
const SEAT_EDGE = 0.13;
const BOWL_RX = 0.215, BOWL_RZ = 0.2, BOWL_ZC = SEAT_EDGE + 0.025 - 0.09 - BOWL_RZ;       // = -0.135
const SEAT_H = 0.028, SEAT_LINE = 0.008;
/** how much of its own colour the lid gives off (see buildPrivy: it stands in half light) */
const LID_GLOW = 0.3;
const LID_H = 2 * BOWL_RZ - 0.01, LID_T = 0.03, LID_LIFT = 0.016, LID_TILT = rad(8), LID_HINGE = BOWL_ZC - BOWL_RZ + 0.012, LID_GAP = 0.14;
/** the lid's front face at the seat, and its rearmost point (the top of its back face) */
const LID_FRONT = LID_HINGE + LID_T / 2, LID_REAR = LID_HINGE - LID_H * Math.sin(LID_TILT) - (LID_T / 2) * Math.cos(LID_TILT);
/** the reed screen's front face behind the sitter: B = LID_GAP behind the lid; A = as first built */
const screenZ = (variant: PrivyVariant) => (variant === "B" ? LID_REAR - LID_GAP : -0.45);
const seatOf = (variant: PrivyVariant): RigSeat => (variant === "B"
  // B: the seat ends at SEAT_EDGE; the open lid is the chair's back (the arms stay in front of it)
  ? { top: V(PRIVY_AT[0], SEAT_TOP, PRIVY_AT[2]), back: 0.03, front: SEAT_EDGE, backrest: -LID_FRONT, backrestTop: SEAT_TOP + LID_LIFT + LID_H * Math.cos(LID_TILT) }
  : { top: V(PRIVY_AT[0], SEAT_TOP, PRIVY_AT[2]), back: 0.03, front: SEAT_FRONT });
/** a camera that looks at the sitter: yaw = degrees round him from straight in front (negative = toward his right
 *  hand: the camera then stands on the gesture's side, where it must be), pitch = degrees it looks down, dist =
 *  metres from the point it looks at (lookY above the floor, lookX to his left of the seat's middle) */
export const privyCam = (yaw: number, pitch: number, dist: number, fov: number, lookY: number, lookX = 0): PrivyCam => {
  const a = rad(yaw), p = rad(pitch);
  return {
    pos: [PRIVY_AT[0] + lookX + Math.sin(a) * Math.cos(p) * dist, lookY + Math.sin(p) * dist, PRIVY_AT[2] + Math.cos(a) * Math.cos(p) * dist],
    look: [PRIVY_AT[0] + lookX, lookY, PRIVY_AT[2]], fov,
  };
};
/** How far round the hero camera stands, on the side of the gesture's hand (degrees from straight in front; negative =
 *  his right). -58: from there the picture is the side-on pictogram everybody knows: the bowl and its foot under his
 *  hips with the lid behind his back (screen left), the lap going forward (screen right) as a level shelf as long as
 *  the trunk is wide, the knee as its corner, the cloth over the shins falling in front of the bowl. At 40 degrees
 *  (the round before) the lap is a third shorter and the cloth over the shins, seen broad, covers half the bowl: two
 *  viewers read "perched / leaning on the front lip", "one standing red pillar with a toilet tucked behind". The face
 *  reads as from in front (the rig draws it toward the lens and never shows a profile); the hand of the gesture is on
 *  the lens's side. The set is arranged for this camera: the sign is turned toward it, the lamp stands screen left. */
const HERO_YAW = -58;
export const PRIVY = {
  at: PRIVY_AT, facing: PRIVY_FACING, seatTop: SEAT_TOP,
  /** the rig's seat (RigState.seat) per variant */
  seat: { A: seatOf("A"), B: seatOf("B") } as Record<PrivyVariant, RigSeat>,
  /** about where the seated head's middle is (for aiming, name tags): world */
  head: [PRIVY_AT[0], SEAT_TOP + 0.78, PRIVY_AT[2] + 0.02] as V3,
  /** the checked cameras. `hero` is the shot's camera: HERO_YAW degrees round on the gesture's side (see HERO_YAW)
   *  and 7 degrees above, 4.2 m away. It looks at a point between his back and the lid, low, so that the WHOLE
   *  figure and commode stand above the film's caption: the cap's top at about 6 % of the frame's height, the chin
   *  at 30 %, the seat's top at 51 %, the bowl's foot, the hem and his feet at 61 .. 63 %. The caption's line is
   *  drawn at 66.4 .. 73.5 % (measured on the film's overlay frames); from 3.9 m with the lens 8 cm higher the hem
   *  and the feet stood at 67 % and, after the slow push, at 72 %: the words lay on the bowl's foot and the hem.
   *  `front` is nearly head on (the bowl shows only either side of the hanging cloth: weak);
   *  `wide` shows the whole privy. Any camera on the front half works for the commode (its numbers, above); the
   *  gesture wants the camera in front or on his right. */
  cams: {
    hero: privyCam(HERO_YAW, 7, 4.2, 31, 0.28, -0.1),
    front: privyCam(-8, 8, 3.9, 31, 0.37, 0),
    wide: privyCam(HERO_YAW, 10, 4.7, 36, 0.53, -0.1),
  } as Record<string, PrivyCam>,
};

// =====================================================================================================================
// light
// =====================================================================================================================
/** toward the key: 10 degrees to the LEFT of the hero camera and 38 degrees up, warm (a lamp-lit corner of the camp).
 *  From the lens's left the shadows fall to screen right and back: the figure's and the commode's shadows lie on the
 *  mat beside them (they stand ON the floor), nothing of his arm's shadow lands on the lid (it read as a stain), and
 *  the cloth over the shins throws no thin sliver of light along its own outline on the bowl (it did while the key
 *  stood at the lens's own azimuth). */
const KEY_AZ = rad(HERO_YAW - 10), KEY_EL = rad(38);
export const PRIVY_KEY = { dir: [Math.sin(KEY_AZ) * Math.cos(KEY_EL), Math.sin(KEY_EL), Math.cos(KEY_AZ) * Math.cos(KEY_EL)] as V3, intensity: 1.55, color: "#ffe3c0" };
export const PRIVY_FILL: EnvSpec = {
  frame: "world",
  stops: [[-90, [0.34, 0.27, 0.25]], [-12, [0.4, 0.33, 0.33]], [6, [0.52, 0.47, 0.55]], [40, [0.46, 0.43, 0.58]], [90, [0.4, 0.38, 0.55]]],
  boxes: [{ az: 90 - HERO_YAW + 10, el: 38, rot: 0, w: 40, h: 22, soft: 14, col: [1.0, 0.87, 0.68] }],
};
export const PRIVY_AO = { aoRadius: 0.45, distanceFalloff: 1.0, intensity: 2.1, color: "#1c1226" };
export const PRIVY_BG = "#2b2438";
/** the figures' light here (group/kit/cast CastLight, a structural copy): warm, deep violet shade, gain a little
 *  under 1 so that the red robe and the skin do not blow out in front of the dark wall. bleach, bodyShadeK and
 *  contact are the film's common values (they are baked when a figure is first built and must be the same in every
 *  place: 07 finding 5).
 *  ITS KEY POINTS AT THE CAMERA (6 degrees above the lens), on purpose. The kit shades cloth with a PALE BAND on the
 *  side that faces the key (15 % toward white on red: pink). On a standing body that band is a thin edge; on the flat
 *  side of a SEATED robe's lap it fills the whole face and looks like a see-through pink patch (seen with the key at
 *  the upper left). With the key on the lens axis the kit switches the band off (rig3d FRAG_SHADE: gAll), and the
 *  figure is lit like the reference's: flat, a thin shade at the rims. privyCastLight(cam) gives it for another
 *  camera; PRIVY_CAST_LIGHT is the hero camera's. */
export const privyCastLight = (cam: PrivyCam) => {
  const d = V(cam.pos[0] - cam.look[0], cam.pos[1] - cam.look[1], cam.pos[2] - cam.look[2]).normalize();
  d.y += 0.1; d.normalize();
  return { ...CAST_BASE, key: [d.x, d.y, d.z] as V3 };
};
const CAST_BASE = {
  key: [-0.45, 0.62, 0.64] as V3, tint: [1.0, 0.88, 0.7] as V3, tintK: 0.7, gain: 0.93, grad: 0.22, bodyGrad: 0.16, sideTint: [0.9, 0.88, 1.0] as V3,
  shade: [1.06, 0.9, 1.5] as V3, shadeK: 0.4, bodyShadeK: 0.4, wrap: [30, 60] as [number, number], edge: 0.14, broad: 0.3, bodySat: 0.14, sheen: 0.14, lift: 0,
  bleach: 0.7, contact: "#8a93c2", contactLen: 0.3,
};
export const PRIVY_CAST_LIGHT = privyCastLight(PRIVY.cams.hero);

// =====================================================================================================================
// painting
// =====================================================================================================================
type G = CanvasRenderingContext2D;
const canvasOf = (w: number, h: number) => { const c = document.createElement("canvas"); c.width = w; c.height = h; return c; };
const texOf = (c: HTMLCanvasElement, repeat = false) => {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = repeat ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping;
  t.generateMipmaps = true; t.minFilter = THREE.LinearMipmapLinearFilter; t.magFilter = THREE.LinearFilter; t.anisotropy = 8; t.needsUpdate = true;
  return t;
};
const grey = (v: number, a = 1) => `rgba(${v | 0},${v | 0},${v | 0},${a})`;
/** boards (a light neutral, tinted by the material's colour): n boards across, with dark joints and a little grain;
 *  horizontal = the boards lie */
const boardsTex = (seed: number, n: number, horizontal: boolean, size = 256) => {
  const c = canvasOf(size, size), g = c.getContext("2d")!, r = rng(seed), bw = size / n;
  if (horizontal) { g.translate(size, 0); g.rotate(Math.PI / 2); }
  for (let i = 0; i < n; i++) {
    g.fillStyle = grey(222 + 26 * r()); g.fillRect(i * bw, 0, bw + 1, size);
    g.strokeStyle = grey(150, 0.3); g.lineWidth = Math.max(1, size / 180);
    for (let k = 0; k < 3; k++) {
      const x = i * bw + bw * (0.2 + 0.6 * r());
      g.beginPath(); g.moveTo(x, 0); g.bezierCurveTo(x + bw * 0.14 * (r() - 0.5), size * 0.33, x + bw * 0.14 * (r() - 0.5), size * 0.66, x, size); g.stroke();
    }
    g.fillStyle = grey(96, 0.95); g.fillRect(i * bw - size / 150, 0, size / 75, size);
  }
  g.fillStyle = grey(96, 0.95); g.fillRect(size - size / 150, 0, size / 150, size);
  return texOf(c);
};
/** a reed screen WITH its top rail, one picture: fine upright reeds of uneven tone, bound by three cords, and over
 *  them the rail as a brown band that takes the top `rail` of the height (0..1), with a dark line under it. It
 *  repeats sideways. The rail is PAINTED, not a second box on top of the reeds: where two boxes met flush, the key's
 *  shadow map leaked along the joint and left a row of evenly spaced black dots under the rail (two viewers: "nail
 *  heads or stray dots"). The band's colour is given for a material tinted #c9a964 (it comes out as #7b5434). */
const reedTex = (seed: number, rail: number) => {
  const W = 512, H = 512, c = canvasOf(W, H), g = c.getContext("2d")!, r = rng(seed), y0 = H * rail, RH = H - y0;
  g.fillStyle = grey(232); g.fillRect(0, 0, W, H);
  const n = 64, bw = W / n;
  for (let i = 0; i < n; i++) {
    g.fillStyle = grey(206 + 44 * r()); g.fillRect(i * bw, 0, bw, H);
    g.fillStyle = grey(120, 0.55); g.fillRect(i * bw, 0, 1.6, H);
    for (let k = 0; k < 2; k++) { g.fillStyle = grey(150, 0.5); g.fillRect(i * bw + 1, y0 + RH * r(), bw - 2, 2); }       // nodes
  }
  for (const y of [0.2, 0.52, 0.84]) {
    g.fillStyle = "rgba(96,62,40,0.95)"; g.fillRect(0, y0 + RH * y - 5, W, 10);
    g.fillStyle = "rgba(60,36,24,0.9)"; g.fillRect(0, y0 + RH * y - 6, W, 2); g.fillRect(0, y0 + RH * y + 4, W, 2);
  }
  g.fillStyle = "rgb(158,130,142)"; g.fillRect(0, 0, W, y0);
  g.fillStyle = "rgb(84,62,60)"; g.fillRect(0, y0 - 2, W, 5);
  return texOf(c, true);
};
/** a woven floor mat: a herringbone of straw with a dark bound edge */
const matTex = (seed: number, W = 512, H = 320) => {
  const c = canvasOf(W, H), g = c.getContext("2d")!, r = rng(seed), q = 16;
  g.fillStyle = grey(226); g.fillRect(0, 0, W, H);
  for (let y = 0; y < H / q; y++) for (let x = 0; x < W / q; x++) {
    g.fillStyle = grey(204 + 40 * r()); g.fillRect(x * q, y * q, q, q);
    g.strokeStyle = grey(130, 0.5); g.lineWidth = 1.5; g.beginPath();
    if ((x + y) % 2) { g.moveTo(x * q, y * q + q / 2); g.lineTo(x * q + q, y * q + q / 2); } else { g.moveTo(x * q + q / 2, y * q); g.lineTo(x * q + q / 2, y * q + q); }
    g.stroke();
  }
  g.strokeStyle = "rgba(96,50,40,0.95)"; g.lineWidth = 18; g.strokeRect(9, 9, W - 18, H - 18);
  return texOf(c);
};
/** the sign: a pale board with a dark edge line and the character (the film's font must be loaded: FrSans) */
const signTex = (ch: string) => {
  const S = 256, c = canvasOf(S, S), g = c.getContext("2d")!, r = rng(31);
  g.fillStyle = "#ecd9ae"; g.fillRect(0, 0, S, S);
  g.strokeStyle = "rgba(150,110,60,0.35)"; g.lineWidth = 2;
  for (let k = 0; k < 9; k++) { const y = S * (0.06 + 0.11 * k + 0.03 * r()); g.beginPath(); g.moveTo(0, y); g.bezierCurveTo(S * 0.3, y + 5 * (r() - 0.5), S * 0.7, y + 5 * (r() - 0.5), S, y); g.stroke(); }
  g.strokeStyle = "#5b2a1c"; g.lineWidth = 9; g.strokeRect(11, 11, S - 22, S - 22);
  const face = (px: number) => `700 ${px}px FrSans, "Noto Sans SC", "Noto Sans CJK SC", sans-serif`;
  let px = Math.round(S * 0.66); g.font = face(px);
  const wide = g.measureText(ch).width; if (wide > S * 0.72) { px = Math.floor(px * (S * 0.72) / wide); g.font = face(px); }   // Latin text (the English "WC") is shrunk to fit; one Chinese character is not touched
  g.fillStyle = "#3a1c18";
  g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(ch, S / 2, S * 0.53);
  return texOf(c);
};
/** a soft round shade, full in the middle and gone at the rim (the alpha map of a contact shadow on the floor: an
 *  alpha map is read from the green channel) */
const shadeTex = () => {
  const S = 128, c = canvasOf(S, S), g = c.getContext("2d")!, gr = g.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
  gr.addColorStop(0, grey(255)); gr.addColorStop(0.6, grey(245)); gr.addColorStop(0.82, grey(150)); gr.addColorStop(1, grey(0));
  g.fillStyle = grey(0); g.fillRect(0, 0, S, S); g.fillStyle = gr; g.fillRect(0, 0, S, S);
  return texOf(c);
};
/** cloth: soft uneven blotches and faint hanging folds */
const clothTex = (seed: number) => {
  const S = 512, c = canvasOf(S, S), g = c.getContext("2d")!, r = rng(seed);
  g.fillStyle = grey(232); g.fillRect(0, 0, S, S);
  for (let i = 0; i < 26; i++) {
    const x = r() * S, y = r() * S, R = S * (0.1 + 0.16 * r()), gr = g.createRadialGradient(x, y, 0, x, y, R);
    gr.addColorStop(0, grey(190, 0.22)); gr.addColorStop(1, grey(190, 0));
    g.fillStyle = gr; g.fillRect(x - R, y - R, 2 * R, 2 * R);
  }
  for (let i = 0; i < 7; i++) { const x = S * (0.07 + 0.14 * i + 0.03 * r()); const gr = g.createLinearGradient(x - 22, 0, x + 22, 0); gr.addColorStop(0, grey(255, 0)); gr.addColorStop(0.5, grey(255, 0.16)); gr.addColorStop(1, grey(170, 0)); g.fillStyle = gr; g.fillRect(x - 22, 0, 44, S); }
  return texOf(c, true);
};

// =====================================================================================================================
// geometry helpers (as arthur/sets/yard.ts)
// =====================================================================================================================
/** static pieces collected per material, merged into one mesh each */
class Batch {
  private map = new Map<THREE.Material, THREE.BufferGeometry[]>();
  tris = 0;
  add(mat: THREE.Material, g: THREE.BufferGeometry) {
    const q = g.index ? g.toNonIndexed() : g;
    for (const k of Object.keys(q.attributes)) if (k !== "position" && k !== "normal" && k !== "uv") q.deleteAttribute(k);
    let l = this.map.get(mat); if (!l) this.map.set(mat, (l = []));
    l.push(q);
  }
  flush(into: THREE.Object3D, name: string, cast = true, receive = true) {
    for (const [mat, list] of this.map) {
      const m = new THREE.Mesh(mergeGeometries(list, false), mat);
      m.castShadow = cast; m.receiveShadow = receive; m.name = name;
      this.tris += m.geometry.attributes.position.count / 3;
      into.add(m);
    }
    this.map.clear();
  }
}
const boxG = (x0: number, x1: number, y0: number, y1: number, z0: number, z1: number) =>
  new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0).translate((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
const _up = V(0, 1, 0), _q = new THREE.Quaternion();
/** a round bar from a to b */
const limb = (a: THREE.Vector3, b: THREE.Vector3, ra: number, rb: number, seg = 8) => {
  const d = b.clone().sub(a), len = d.length(), g = new THREE.CylinderGeometry(rb, ra, len, seg, 1, false);
  _q.setFromUnitVectors(_up, d.normalize());
  g.applyQuaternion(_q); g.translate((a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2);
  return g;
};
/** scales a box's uv so that its texture repeats u x v times on every face */
const tile = (g: THREE.BufferGeometry, u: number, v: number) => {
  const a = g.attributes.uv as THREE.BufferAttribute;
  for (let i = 0; i < a.count; i++) a.setXY(i, a.getX(i) * u, a.getY(i) * v);
  return g;
};


// =====================================================================================================================
// the commode (variant B): its geometry (the numbers and the reasons are at the marks, above)
// =====================================================================================================================
/** one smooth turned profile from the foot up to under the seat, [radius at the bowl's widest = BOWL_RX, height as a
 *  share of the bowl's own height (SEAT_TOP - SEAT_H - SEAT_LINE)] (no small steps: they would ink as dashes), then
 *  the joint line and the seat, flush with it, and the closed top */
const BOWL_BODY: [number, number][] = [[0, 0], [0.64, 0], [0.66, 0.06], [0.6, 0.2], [0.535, 0.36], [0.535, 0.48], [0.61, 0.63], [0.78, 0.78], [0.93, 0.88], [0.99, 0.95], [1, 1]];
const BOWL_Y1 = SEAT_TOP - SEAT_H - SEAT_LINE;
const BOWL_PROFILE: [number, number][] = [
  ...BOWL_BODY.map(([r, h]) => [r, h * BOWL_Y1] as [number, number]),                    // 0 .. BODY_N - 1: the bowl
  [1, BOWL_Y1 + SEAT_LINE],                                                                // the joint line
  [1, SEAT_TOP - 0.01], [0.988, SEAT_TOP - 0.003], [0.96, SEAT_TOP], [0, SEAT_TOP],        // the seat and the closed top
];
const BODY_N = BOWL_BODY.length;
/** the commode's outline seen from above, as a distance from (0, BOWL_ZC) in the direction th (0 = the front, +z):
 *  an oval */
const commodeOutline = (th: number) => 1 / Math.hypot(Math.sin(th) / BOWL_RX, Math.cos(th) / BOWL_RZ);
/** a part of the commode: BOWL_PROFILE's points i0 .. i1 swept round that outline (a lathe whose radius depends on
 *  the direction) */
const commodeG = (i0: number, i1: number) => {
  const ths: number[] = [];
  for (let k = 0; k < 72; k++) ths.push(-Math.PI + (k * Math.PI) / 36);
  const NA = ths.length, NP = i1 - i0 + 1, pos: number[] = [], uv: number[] = [], idx: number[] = [];
  for (let i = 0; i < NP; i++) for (let j = 0; j < NA; j++) {
    const r = commodeOutline(ths[j]) * BOWL_PROFILE[i0 + i][0];
    pos.push(Math.sin(ths[j]) * r, BOWL_PROFILE[i0 + i][1], BOWL_ZC + Math.cos(ths[j]) * r); uv.push(j / NA, i / (NP - 1));
  }
  for (let i = 0; i < NP - 1; i++) for (let j = 0; j < NA; j++) {
    const j1 = (j + 1) % NA, a = i * NA + j, b = i * NA + j1, c = (i + 1) * NA + j, d = (i + 1) * NA + j1;
    idx.push(a, b, c, b, d, c);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx); g.computeVertexNormals();
  return g;
};
/** a small flame: a drop with its point up, its foot at y = 0 */
const flameG = (r: number, h: number) => new THREE.LatheGeometry([[0, 0], [0.62, 0.1], [1, 0.3], [0.86, 0.5], [0.5, 0.72], [0.18, 0.9], [0, 1]].map(([x, y]) => new THREE.Vector2(x * r, y * h)), 14);

// =====================================================================================================================
// the set
// =====================================================================================================================
export type PrivySet = {
  group: THREE.Group;                       // meshes AND lights: hide the group and the place is off
  variant: PrivyVariant;
  seat: RigSeat;
  cams: Record<string, PrivyCam>;
  anchors: { at: THREE.Vector3; head: THREE.Vector3; sign: THREE.Vector3; lamp: THREE.Vector3 };
  /** the lamp's flame: a pure function of t (seconds). For the loop give the SAME t on the film's first and last frame. */
  animate(t: number): void;
  tris: number;
};

export function buildPrivy(M: Mats, o: { variant?: PrivyVariant; sign?: string } = {}): PrivySet {
  const variant = o.variant ?? "B";
  const group = new THREE.Group(); group.name = "privy";
  const root = new THREE.Group(); root.position.set(...PRIVY_AT); group.add(root);          // local: the seat's floor point
  const flat = (color: string, map: THREE.Texture | null = null, rough = 0.9) => M.paint({ color, map, roughness: rough });
  const B = new Batch(), NC = new Batch();                                                    // NC: receives, does not cast

  // ---- materials (nothing darker than about #2b2530: the ink must stay darker than everything)
  const mEarth = flat("#6e5a4c", clothTex(3)); (mEarth.map as THREE.Texture).repeat.set(2, 2);
  const mCloth = flat("#40375a", clothTex(5)); (mCloth.map as THREE.Texture).repeat.set(2.2, 1.6);
  const SCR = variant === "B" ? SEAT_TOP + 0.56 : 0.86, RAIL = 0.09;                        // the reed screen's height, and its rail on top
  const mReed = flat("#c9a964", reedTex(9, RAIL / (SCR + RAIL)));
  const mMat = flat("#b3955c", variant === "B" ? matTex(7, 640, 512) : matTex(7));
  const mPlankH = flat("#b88a58", boardsTex(13, 3, true)), mPlankTop = flat("#c69a66", boardsTex(17, 4, false));
  const mPost = flat("#6a4a32");
  const mSign = flat("#ffffff", signTex(o.sign ?? L("厕", "WC")), 0.85), mSignEdge = flat("#b08a58");
  const mCord = flat("#5a4030");
  // The bowl and the lid are round, made of many small faces, pale, and they stand close behind and under the red robe. Where
  // such a thing turns away from the lens its faces are slivers seen edge-on, and the rasteriser's depth for a sliver
  // is wrong by centimetres: single samples of the bowl came out NEARER than the robe 20 cm in front of it and showed
  // as pale single pixels on the robe that come and go from frame to frame (2 of them on frame 77 at 1080 x 1920; 9
  // of the first clip's 40 frames had one to three). The kit cures its own figures of the same thing with a polygon
  // offset of one depth slope (rig3d SLOPE_BIAS); the same here: a face seen square on does not move, a sliver goes
  // back by what its depth can be wrong by. Their outlines do not change (the ink is drawn from its own depth pass).
  const behind = <T extends THREE.Material>(m: T): T => { m.polygonOffset = true; m.polygonOffsetFactor = 1; m.polygonOffsetUnits = 0; return m; };
  // One thing in three tones: the bowl, the seat ring with the lid (a little lighter), and the dark joint line and
  // hinge between them (not darker than #2b2530: the ink stays the darkest thing).
  const mBowl = behind(flat("#e6d6b8", null, 0.7)), mSeat = behind(flat("#f3e8d2", null, 0.7)), mJoint = behind(flat("#6a5444", null, 0.8));
  const mBronze = flat("#b98a3a", null, 0.55);

  // ---- floor and the cloth wall behind (calm and dark: the head and the hand read against it)
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(7, 6).rotateX(-Math.PI / 2).translate(0, 0, 0.8), mEarth);
  floor.receiveShadow = true; floor.name = "privy.floor"; root.add(floor);
  // B: the cloth wall stands ACROSS the corner behind him, square to a lens 35 degrees round on his right, so that
  // from the hero camera and from in front alike it is one calm plane with no end, no corner and no post in the frame
  // (behind the left end of the reed screen by 1.1 m, behind the corner by 0.2 m). A: behind him, as first built.
  if (variant === "B") NC.add(mCloth, new THREE.PlaneGeometry(12, 4).rotateY(rad(-35)).translate(0.66, 2, -0.94));
  else NC.add(mCloth, new THREE.PlaneGeometry(7, 4).translate(0, 2, -1.05));
  // a woven mat (a flat sheet just over the floor: no step, so no ink sliver). B: it lies under the commode AND his
  // feet, from under the screens to well in front of him and toward the lens, so that none of its edges runs along
  // the hem or the bowl's foot (the first mat's back edge lay exactly on the hem's line) or through the caption band:
  // from the hero camera its edge runs at 78 .. 87 % of the frame's height, under the caption's words (66 .. 74 %)
  // (x -1.5 .. 0.71, z -0.54 .. 1.2: when the hero camera moved back and down, the smaller mat's edge rose to
  // 72 .. 80 %, a dark line right under the caption); A: under his feet
  const mat = new THREE.Mesh(variant === "B"
    ? new THREE.PlaneGeometry(2.21, 1.74).rotateX(-Math.PI / 2).translate(-0.395, 0.003, 0.33)
    : new THREE.PlaneGeometry(1.5, 0.95).rotateX(-Math.PI / 2).translate(0, 0.003, 0.56), mMat);
  mMat.polygonOffset = true; mMat.polygonOffsetFactor = -2; mMat.polygonOffsetUnits = -2;
  mat.receiveShadow = true; mat.name = "privy.mat"; root.add(mat);

  // ---- the reed screen behind him and on his left, its rails flush with it, two posts and a beam above every framing.
  // Its top is under the seated head's middle (B: 0.885 m), so that the face and the hand read against the dark wall.
  // B: there is NO screen on his right: that is the lens's side (a piece that stopped short behind him stood at the
  // frame's left edge as a strip nobody could name). A keeps its short piece.
  const SX = 0.7, ZB = screenZ(variant), ZF = 0.42, TH = 0.06, ZBEAM = -0.51;
  /** one panel with its rail, the picture `rep` times along it; its top face takes the rail's colour */
  const panel = (x0: number, x1: number, z0: number, z1: number, rep: number) => {
    const g = tile(boxG(x0, x1, 0, SCR + RAIL, z0, z1), rep, 1), uv = g.attributes.uv as THREE.BufferAttribute, nr = g.attributes.normal as THREE.BufferAttribute;
    for (let i = 0; i < uv.count; i++) if (Math.abs(nr.getY(i)) > 0.5) uv.setY(i, 1 - 0.3 * RAIL / (SCR + RAIL));
    return g;
  };
  B.add(mReed, panel(-SX - TH, SX + TH, ZB - TH, ZB, 2));
  for (const s of [-1, 1]) {
    if (variant === "A") B.add(mPost, boxG(s * 1.6 - 0.055, s * 1.6 + 0.055, 0, 2.75, ZBEAM - 0.11, ZBEAM));  // outside A's framings
    if (s < 0 && variant === "B") continue;
    const x0 = s > 0 ? SX : -SX - TH, zf = s > 0 ? ZF : -0.12;
    B.add(mReed, panel(x0, x0 + TH, ZB, zf, s > 0 ? 1.4 : 0.55));
  }
  if (variant === "A") B.add(mPost, boxG(-1.8, 1.8, 2.5, 2.61, ZBEAM - 0.11, ZBEAM));

  // ---- the seat
  const ledge = (x0: number, x1: number, z1: number) => { B.add(mPlankH, boxG(x0, x1, 0, SEAT_TOP - 0.03, ZB, z1)); B.add(mPlankTop, boxG(x0, x1, SEAT_TOP - 0.03, SEAT_TOP, ZB, z1)); };
  if (variant === "A") {
    // a plank box seat, one piece with a ledge along the back
    ledge(-SX, SX, -0.12);
    B.add(mPlankH, boxG(-0.36, 0.36, 0, SEAT_TOP - 0.03, -0.12, SEAT_FRONT));
    B.add(mPlankTop, boxG(-0.36, 0.36, SEAT_TOP - 0.03, SEAT_TOP, -0.12, SEAT_FRONT));
  } else {
    // THE COMMODE, shaped like the thing everybody knows: a pale oval bowl on a foot, a seat ring on it (a dark joint
    // line under the ring), under the sitter, and the seat's own lid standing open behind his back on a dark hinge,
    // 14 cm clear of the screen (see the marks).
    B.add(mBowl, commodeG(0, BODY_N - 1));
    B.add(mJoint, commodeG(BODY_N - 1, BODY_N));
    B.add(mSeat, commodeG(BODY_N, BOWL_PROFILE.length - 1));
    const lid = new THREE.CylinderGeometry(BOWL_RX - 0.005, BOWL_RX - 0.005, LID_T, 48, 1, false).rotateX(Math.PI / 2).scale(1, LID_H / (2 * BOWL_RX - 0.01), 1);    // an upright oval
    lid.rotateX(-LID_TILT).translate(0, SEAT_TOP + LID_LIFT + (LID_H / 2) * Math.cos(LID_TILT), LID_HINGE - (LID_H / 2) * Math.sin(LID_TILT));
    // The lid stands upright and faces the room's front; the key comes from 68 degrees round and 38 degrees up, so the
    // lid takes a third of the light the seat's top takes and came out grey beside the cream bowl ("a grey disc":
    // not the same thing as the seat). Its own material, the seat's colour, with a part of that colour as its own
    // glow: in the picture it is the seat's cream, a shade deeper, and still has its soft shading.
    const mLid = behind(flat("#f3e8d2", null, 0.7));
    (mLid as THREE.MeshStandardMaterial).emissive = new THREE.Color("#f3e8d2").multiplyScalar(LID_GLOW);
    B.add(mLid, lid);
    // the hinge: one dark bar on the back of the seat; the lid stands on it
    B.add(mJoint, boxG(-0.085, 0.085, SEAT_TOP - 0.004, SEAT_TOP + LID_LIFT + 0.004, LID_HINGE - 0.014, LID_HINGE + 0.022));
  }

  // ---- the sign: hangs on two cords from above every framing, well clear of the cloth wall. B: turned SIGN_YAW
  // toward the hero camera (seen from 58 degrees a sign that faces the room's front is half as wide and its
  // character is squeezed), upper screen left, over the lid and clear of his head
  const SGN = variant === "B" ? V(-0.2, SEAT_TOP + 0.97, -0.4) : V(-0.31, 1.27, -0.4), SW = 0.29, SIGN_YAW = variant === "B" ? rad(HERO_YAW + 16) : 0;
  const signAt = <T extends THREE.BufferGeometry>(g: T) => g.rotateY(SIGN_YAW).translate(SGN.x, SGN.y, SGN.z);
  B.add(mSignEdge, signAt(boxG(-SW / 2, SW / 2, -SW / 2, SW / 2, -0.03, -0.001)));
  const face = new THREE.Mesh(signAt(new THREE.PlaneGeometry(SW, SW)), mSign);
  face.receiveShadow = true; face.name = "privy.sign"; root.add(face);
  for (const s of [-1, 1]) B.add(mCord, signAt(limb(V(s * 0.11, SW / 2 - 0.01, -0.015), V(s * 0.11, 2.52 - SGN.y, -0.015), 0.006, 0.006, 6)));

  // ---- the oil lamp (screen left): a foot, a thin stem, a dish, one small flame. B: a standing lamp on the floor
  // in the corner behind him on his right (screen left of the lid, under the sign); A: a small one on the ledge
  const LP = variant === "B" ? V(-0.3, 0, -0.44) : V(-0.47, SEAT_TOP, -0.33), STEM = variant === "B" ? 0.42 : 0.17, FOOT = variant === "B" ? 1.3 : 1;
  B.add(mBronze, new THREE.CylinderGeometry(0.035 * FOOT, 0.062 * FOOT, 0.03, 20).translate(LP.x, LP.y + 0.015, LP.z));
  B.add(mBronze, new THREE.CylinderGeometry(0.011, 0.011, STEM, 10).translate(LP.x, LP.y + 0.025 + STEM / 2, LP.z));
  B.add(mBronze, new THREE.CylinderGeometry(0.066, 0.028, 0.045, 24).translate(LP.x, LP.y + 0.03 + STEM, LP.z));
  const FL = V(LP.x, LP.y + 0.05 + STEM, LP.z);
  const flame = new THREE.Mesh(flameG(0.021, 0.085), new THREE.MeshBasicMaterial({ color: new THREE.Color(2.9, 1.75, 0.55) }));
  flame.position.copy(FL); flame.layers.set(NOINK); flame.name = "privy.flame"; root.add(flame);
  const lamp = new THREE.PointLight("#ffb46a", 0.55, 2.2, 2); lamp.position.set(FL.x - 0.05, FL.y + 0.06, FL.z + 0.03); root.add(lamp);

  // ---- contact shadows on the mat (B): under the commode's foot, under the cloth and the feet in front of it, under
  // the lamp's foot. The key's own shadows fall behind the things, away from the lens, and the floor under a thing
  // that stands on it gives the ink pass no depth step to draw: without these everything floated a little (two
  // viewers). Flat soft discs 5 mm over the floor, not inked, not in the depth buffer.
  if (variant === "B") {
    const mShade = new THREE.MeshBasicMaterial({ color: "#2a1c22", alphaMap: shadeTex(), transparent: true, opacity: 0.5, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 });
    for (const [x, z, rx, rz] of [[0, BOWL_ZC, BOWL_RX * 0.93, BOWL_RZ * 0.93], [0, 0.235, 0.21, 0.125], [LP.x, LP.z, 0.125, 0.125]] as [number, number, number, number][]) {
      const d = new THREE.Mesh(new THREE.CircleGeometry(1, 40).rotateX(-Math.PI / 2).scale(rx, 1, rz).translate(x, 0.005, z), mShade);
      d.layers.set(NOINK); d.renderOrder = 2; d.name = "privy.contact"; root.add(d);
    }
  }

  B.flush(root, "privy.static"); NC.flush(root, "privy.backdrop", false, true);

  // ---- light: one warm key with shadows from the camera's upper left front, a soft sky
  const key = new THREE.DirectionalLight(PRIVY_KEY.color, PRIVY_KEY.intensity), kd = V(...PRIVY_KEY.dir).normalize();
  key.position.copy(kd).multiplyScalar(9).add(V(0, 0.7, 0)); key.target.position.set(0, 0.7, 0);
  key.castShadow = true; key.shadow.mapSize.set(LIGHTS.shadow.mapSize, LIGHTS.shadow.mapSize);
  key.shadow.radius = LIGHTS.shadow.radius; key.shadow.bias = LIGHTS.shadow.bias; key.shadow.normalBias = 0.02;
  Object.assign(key.shadow.camera, { left: -2.6, right: 2.6, bottom: -2.2, top: 3, near: 1, far: 20 }); key.shadow.camera.updateProjectionMatrix();
  const hemi = new THREE.HemisphereLight("#c4bfe0", "#6e5544", 0.5);
  root.add(key, key.target, hemi);

  const W = (v: THREE.Vector3) => v.clone().add(V(...PRIVY_AT));
  return {
    group, variant, seat: PRIVY.seat[variant], cams: PRIVY.cams,
    anchors: { at: V(...PRIVY_AT), head: V(...PRIVY.head), sign: W(SGN), lamp: W(FL) },
    animate(t: number) {
      // a slow breath of the flame, at most 5 %: sums of sines of t only
      const k = 1 + 0.03 * Math.sin(t * 5.1) + 0.02 * Math.sin(t * 8.7 + 1.3);
      flame.scale.set(1, k, 1); lamp.intensity = 0.55 * k;
    },
    tris: B.tris + NC.tris + 2 + 2,
  };
}

// =====================================================================================================================
// the shot: who does what on frame f (30 frames a second)
// =====================================================================================================================
/** The opening's clock, in frames at 30 a second (f 0 = the film's first frame = its last frame):
 *    0 .. 8        Liu Bang as himself (who 0, face "smug"): seated, the left hand on his knee, the right hand comes
 *                  up from in front of the chest (RISE = 9 frames)
 *    9             THE CHANGE, on the frame the finger reaches the lips: the block-jawed Liu Bang (who 1) is shown
 *                  instead, with the "hush" face; the head pops (POP: x 1.13, 1.075, 1.03 on frames 9, 10, 11) and the
 *                  lens punches in toward the head (PUNCH: fov x 0.93 .. 0.99 on frames 9 .. 12). One frame, two figures: a swap, sold
 *                  as a beat. Nothing else changes on that frame (the body, the robe and the arms are the same).
 *    9 .. 30       the finger at the lips (HOLD 0.7 s)
 *    30 .. 37.5    the turn (0.25 s): the head and body turn to his left, the fingertip goes to under his right ear
 *    37.5 .. 75    the fingertip runs down the jaw to the chin (TRACE 1.25 s); the lens pushes in 5 % and looks 1 cm
 *                  higher on the same clock (PUSH, PUSH_UP), so the jaw and the finger grow a little as they are
 *                  shown. Small on purpose: the hem and the feet go from 62.6 % to 63.7 % of the frame's height
 *                  and stay above the caption (66.4 %), the cap's top goes from 6 % to 4 % (with 7 % and 7 cm the
 *                  feet ended at 72 %, under the caption's words)
 *    75 .. 77      held; the shot is LEN = 78 frames (2.6 s). Cut on frame 78. */
export const OPENING = { RISE: 9, HOLD: 0.7, TURN: 0.25, TRACE: 1.25, LEN: 78, POP: [1.13, 1.075, 1.03], PUNCH: [0.93, 0.955, 0.975, 0.99], PUNCH_UP: 1.2, PUSH: 0.05, PUSH_UP: 0.01 };
/** where the OTHER hand (his left) rests: on his left knee, on top of the robe. turn = 0..1, how far the body has
 *  turned away in the gesture: the left shoulder goes back with it and the arm is only 0.40 m long, so the hand
 *  slides back along the thigh, 5 cm (a pinned hand out of reach would hover; 10 cm brought it against the belly:
 *  rig.qa clear -0.021, a ball at the sash's knot). World. */
const restHand = (turn: number) => V(PRIVY_AT[0] + 0.08, SEAT_TOP + REST_Y, PRIVY_AT[2] + 0.2 - 0.05 * clamp(turn, 0, 1));
/** the resting hand's height over the seat's top: ON the lap's cloth over the middle of his left thigh. The thigh's
 *  middle line is 7.3 cm over the seat (rig3d seatFit) and nearly level on this seat; the robe lies 5.5 cm over it
 *  (acc/garb.ts CAP); the hand's ball is 2.3 cm with its ink line. */
const REST_Y = 0.073 + 0.055 + 0.027;
export type PrivyFrame = {
  /** which figure shows: 0 = LIU_PRIVY (himself), 1 = LIU_DAGE (the block jaw) */
  who: 0 | 1;
  /** for both figures' rig.set (add `visible`) */
  state: Partial<RigState>;
  cam: PrivyCam;
  /** seconds for set.animate */
  t: number;
  /** 1 on the frame of the change, else 0: where a film may lay a one-frame flash over the picture (not needed) */
  beat: number;
};
/** Liu Bang's plain face before the change (and in the closing shot) */
const PLAIN: Expr = "smug";
/** frame f of the opening shot (f <= 0 gives the still first picture: use privyClosing for the film's last shot) */
export function privyOpening(f: number, o: { variant?: PrivyVariant; cam?: PrivyCam } = {}): PrivyFrame {
  const variant = o.variant ?? "B", K = OPENING, base = o.cam ?? PRIVY.cams.hero, t = f / 30;
  const common = { at: V(...PRIVY_AT), facing: PRIVY_FACING, seat: PRIVY.seat[variant], blink: 0 };
  const rest = (turn: number) => ({ hands: [null, restHand(turn)] as [THREE.Vector3 | null, THREE.Vector3 | null] });
  if (f < K.RISE) {
    const amount = clamp(f / K.RISE, 0, 1);
    return {
      who: 0, cam: base, t, beat: 0,
      state: { ...common, ...rest(0), pose: { kind: "shh", arm: 0, amount, t: Math.max(t, 0), jaw: 0 }, expr: PLAIN, gaze: 0, head: undefined, twist: 0 },
    };
  }
  const k = f - K.RISE, jl = rigJawline(k / 30, { arm: 0, amount: 1, hold: K.HOLD, turnT: K.TURN, trace: K.TRACE });
  const pop: RigHead | undefined = k < K.POP.length ? { scale: K.POP[k] } : undefined;
  const punch = k < K.PUNCH.length ? K.PUNCH[k] : 1;
  // the slow push toward the jaw while the finger runs down it (from the end of the turn to the end of the trace)
  const f1 = K.RISE + (K.HOLD + K.TURN) * 30, u = clamp((f - f1) / (K.TRACE * 30), 0, 1), push = u * u * (3 - 2 * u);
  // (the punch goes toward the head: the lens looks PUNCH_UP x (1 - punch) m higher, 8.4 cm on the frame of the change,
  // so that the popped head and its cap stay inside the frame's top)
  const cam: PrivyCam = { pos: base.pos, look: [base.look[0], base.look[1] + K.PUSH_UP * push + K.PUNCH_UP * (1 - punch), base.look[2]], fov: base.fov * punch * (1 - K.PUSH * push) };
  return {
    who: 1, t, beat: k === 0 ? 1 : 0, cam,
    state: { ...common, ...rest(Math.abs(jl.twist) / rad(46)), pose: { ...jl.pose, t }, expr: jl.expr, gaze: jl.gaze, head: rigHeadAdd(jl.head, pop), twist: jl.twist },
  };
}
/** The film's LAST shot (line 22, 至于刘邦，): g = frames since the shot began, len = its length in frames. Liu Bang
 *  sits as himself, the hand in front of his chest, and the shot's last frame (g = len - 1 ... the frame BEFORE the
 *  film wraps round) is one frame of breathing before privyOpening(0), so the loop joins without a step. */
export function privyClosing(g: number, len: number, o: { variant?: PrivyVariant; cam?: PrivyCam } = {}): PrivyFrame {
  const variant = o.variant ?? "B", t = (g - len) / 30;
  // the pose's clock runs toward 0: breathing is continuous through the loop point (pose.t = 0 on the film's frame 0)
  return {
    who: 0, cam: o.cam ?? PRIVY.cams.hero, t, beat: 0,
    state: { at: V(...PRIVY_AT), facing: PRIVY_FACING, seat: PRIVY.seat[variant], blink: 0, hands: [null, restHand(0)], pose: { kind: "shh", arm: 0, amount: 0, t, jaw: 0 }, expr: PLAIN, gaze: 0, head: undefined, twist: 0 },
  };
}
