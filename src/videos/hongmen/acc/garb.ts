// GARB of the Hongmen film: what the people of the Han camp tents wear on the body. Accessories for the kit's rig3d
// figures (group/kit/RIG3D.md, "角色道具"); each function returns an Acc, a figure takes them at creation:
//   rc.add(look, { acc: [robe({ col: "#c8322c", band: "#2a2630", sash: "#e2b03a" }), beard({ kind: "short" })] })   // Liu Bang
//   rc.add(look, { acc: [armour({ col: "#4a4f5e", trim: "#e2b03a" }), cape({ col: "#5b2a86" }), swordBelt(), hilt()] })
// Base Look for all of them: top "tee", bottom "chinos" (people.ts `han`): the painted garments cover the whole body.
//
//   robe       a crossed-collar Han robe (交领右衽): painted on the body, with a sash, and a SKIRT in 3D from the waist
//              to the ankles (len "long") or the knees ("short") that covers the stick legs. slots: coat
//   armour     lamellar armour: rows of small plates painted on the body, shoulder guards, a belt or sash, and a
//              knee-length plate skirt in 3D. slots: coat
//   cape       a cape on the back from the shoulders to the knees, its shoulders painted. slots: back, neck
//   beard      drawn on the face: full / short / fork / stubble / goatee / long. "long" adds a 3D beard that hangs
//              from the chin over the chest and stays under the DRAWN face (people.ts addPerson tells it where the
//              face is). slots: chin
//   swordBelt  a scabbard at the hip of the drawing hand (side 0 = the person's right, the default), with a dark,
//              empty mouth. slots: waist
//   hilt       the sword's hilt standing in that scabbard: an accessory of its own (name "hilt"), so a shot hides it
//              with state.hide = ["hilt"] while the drawn sword (a world prop) is out. Needs swordBelt before it in
//              the list. No slot.     hiltWorld(rig) = where a hand grips it (world), for pinning the hand
//   pendant    a jade disc hanging from the sash at the front of the hip (Fan Zeng's 玉玦). No slot; hide: ["pendant"]
//              while the raised one (a world prop) is shown.
//   scroll     a small roll of bamboo slips tied with a cord, tucked slantwise over the sash in front (the informer's
//              message). No slot; hide: ["scroll"]
//   whiskers   a thin drooping moustache drawn on the face (the kit's moustaches are "pencil", "walrus", ...). slot: lip
//   setSeat / onSeat   a figure on a seat of chair height: its skirts lie over the thighs and hang from the knees, and
//              the seat shows under it (see "A SEAT OF CHAIR HEIGHT" below)
//   armour({ tunic }) = SHORT armour: a plate fringe at the hips over a cloth tunic that goes on to the knees
//
// HOW THE CLOTH BEHAVES (the general mechanism; nothing is random, nothing is kept from frame to frame):
// A skirt and a cape are not rigid parts of the body. Every frame they are rebuilt from the pose alone:
//   - they hang plumb from the body (a lean does not swing them through the legs);
//   - their hem never goes below the ground: when the body comes down (sitting on a low seat, kneeling by sinking,
//     the dip of a step) the cloth is gathered between the waist and the ground;
//   - the figure's own legs push them out: wherever a leg would come through, the cloth is tented over it (a knee
//     that comes up under a seated robe, the leading shin of a step). So the legs never show through, in any pose.
// The legs are read from the figure's own limb tubes (the kit builds limbs in the figure group's own space, which is
// the world: the group is never moved), the body from the torso group's matrix. "Ground" is y = 0, or
// group.userData.hmGround when a stage sets it (setGround). A body whose bottom is lower than a standing one's is
// taken to sit on something: the things that hang beside it (scabbard, cape) then rest on that seat's top.
// A SEAT OF CHAIR HEIGHT (setSeat): by itself a skirt does not know what its wearer sits on: on the floor seats of the
// banquet it is a bell that rests on the ground, which is right there. On a chair, a bench, a commode it would be a
// column of cloth down to the floor that swallows the seat. A stage that seats a figure on real furniture tells the
// cloth: setSeat(rig, seat, facing) with the SAME RigSeat it gives rig.set({ seat }). From then on every skirt of
// that figure takes the seat as a solid bench (everything below its top and behind its front edge) and stays out of
// it: the cloth comes down the body to the seat, lies over the thighs as a lap whose underside rests on the seat's
// top, and only in front of the seat's front edge does it hang on, from the knees down over the shins to the hem. So
// the seat shows UNDER the sitter. The shape is still a pure function of the pose (the same hull of the hips and the
// legs' points, cut by the bench), so it follows a figure that rises from the seat or sits lower or higher, on a seat
// of any height; while the cloth is clear of the bench (a figure standing in front of it) it is exactly the cloth
// without a seat, so setSeat(rig, null) there changes nothing. A figure that was never given a seat is untouched.
// For a figure that lives on one seat, make its garment with onSeat(acc, seat, facing): only such a garment has the
// fine rows over the lap (skirtOn LAP_SUB) that keep the lap's outline smooth when the thighs slope. And for a lap
// that reads as a lap, give the seat the height at which the thighs lie level (sets/privy.ts SEAT_TOP says how).
// Beards: a colour clearly different from the skin. Under a bright key the kit bleaches LIGHT skin toward white, so
// a white beard reads only on a skin darker than luma 0.76 (Fan Zeng's is tanned for that reason) and by its 3D part
// over a dark robe.
import * as THREE from "three";
import type { Acc, OutfitKit, P2, PartKit, Rig } from "../../group/kit/rig3d";
import { dimsOf } from "../../group/kit/toon";
import { turned, roundBox, shade } from "../../group/kit/rigacc/shapes";

const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (x: number) => { const t = clamp(x, 0, 1); return t * t * (3 - 2 * t); };
const rad = (d: number) => (d * Math.PI) / 180;
const wrapA = (a: number) => a - 2 * Math.PI * Math.round(a / (2 * Math.PI));
const GOLD = "#e2b03a", DARK = "#2a2230", JADE = "#3fae6e";
/** how light a colour looks, 0..1 */
const luma = (col: string) => { const c = new THREE.Color(col).convertLinearToSRGB(); return 0.299 * c.r + 0.587 * c.g + 0.114 * c.b; };

// ===== drawing on the clothes =====
/** points of the curve from a to b bent toward k */
const bend = (a: P2, k: P2, b: P2, n = 10): P2[] => Array.from({ length: n + 1 }, (_, i) => { const t = i / n, s = 1 - t; return [s * s * a[0] + 2 * s * t * k[0] + t * t * b[0], s * s * a[1] + 2 * s * t * k[1] + t * t * b[1]] as P2; });
/** a band all the way round the body between two heights */
const ring = (c: OutfitKit, t0: number, t1: number, col: string) => c.poly([c.P(-180, t1), c.P(180, t1), c.P(180, t0), c.P(-180, t0)], col);
/** a line all the way round at one height */
const hoop = (c: OutfitKit, t: number, col: string, lw: number) => c.line([c.P(-180, t), c.P(180, t)], col, lw);
/** a round spot of radius rm metres at (az, t); it may lie on the back seam */
const disc = (c: OutfitKit, az: number, t: number, rm: number, col: string, stroke?: string, lw = 4, tall = 1) => {
  const [x, y] = c.P(az, t), rx = (c.az(rm, t) / 360) * c.W, ry = rm * c.pxUp(t) * tall, g = c.g;
  for (const dx of [0, -c.W, c.W]) {
    if (x + dx + rx < 0 || x + dx - rx > c.W) continue;
    g.beginPath(); g.ellipse(x + dx, y, rx, ry, 0, 0, 7); g.fillStyle = col; g.fill();
    if (stroke) { g.strokeStyle = stroke; g.lineWidth = lw; g.stroke(); }
  }
};
/** where the sash sits on the body (0 = its bottom .. 1 = its top) and half its height */
const SASH_T = 0.385, SASH_H = 0.042;
/** a cloth sash round the waist: a band with a darker line along each edge; knot = tied in front, a little to the
 *  person's left, with two short ends that hang to the top of the skirt */
const sashOn = (c: OutfitKit, col: string, knot: boolean) => {
  const t = SASH_T, h = SASH_H, ink = c.shade(col, 0.5), P = c.P;
  ring(c, t - h, t + h, col); hoop(c, t + h, ink, 4); hoop(c, t - h, ink, 4);
  hoop(c, t + h * 0.15, c.shade(col, 0.84), 3);
  if (knot) {
    const a = 13, w = c.az(0.017, t);
    for (const [da, lo] of [[-0.6, 0.16], [0.75, 0.12]] as [number, number][]) c.poly([P(a + da * w - w * 0.6, t - h * 0.5), P(a + da * w + w * 0.6, t - h * 0.5), P(a + da * w * 2.1 + w * 0.75, t - lo), P(a + da * w * 2.1 - w * 0.75, t - lo - 0.012)], col, ink, 4);
    disc(c, a, t, 0.022, col, ink, 4, 0.95);
  }
};

/** the hem band along the foot of a skirt: how much of the skirt's height it takes */
const HEM_BAND = 0.075;
type RobeO = {
  /** the cloth (default: the look's topCol) */ col?: string;
  /** the collar band and the hem band (default: a darker shade of the cloth) */ band?: string;
  /** the sash; false = none */ sash?: string | false;
  /** the under-robe that shows at the throat */ inner?: string;
  /** "long" = to the ankles (default), "short" = to the knees, false = no 3D skirt: the fallback, a painted robe on
   *  the body with the look's own stick legs under it */
  skirt?: "long" | "short" | false;
  /** a knot with two hanging ends in front (default true) */ knot?: boolean;
};
/** A Han robe with a crossed collar, right over left as the wearer sees it (交领右衽): the whole body in the cloth's
 *  colour; the over-panel's edge is a broad band from the left of the neck across the chest down to the right hip,
 *  the under-panel's edge a short band from the right of the neck that goes under it; the pale under-robe shows in
 *  the V between them; a sash round the waist. The 3D skirt (see `skirtOn`) continues it to the ankles or the
 *  knees, with a band along the hem and the over-panel's edge running down its front. */
export const robe = (o: RobeO = {}): Acc => {
  const sash = o.sash === undefined ? GOLD : o.sash, inner = o.inner ?? "#f3ecdc", len = o.skirt === undefined ? "long" : o.skirt, knot = o.knot ?? true;
  const key = ["robe", o.col ?? "", o.band ?? "", sash, inner, len, knot].join("|");
  return {
    name: "robe", slots: ["coat"], key,
    outfit(c) {
      const col = o.col ?? c.top, band = o.band ?? c.shade(col, 0.6), ink = c.shade(col, 0.36), bi = c.shade(band, luma(band) < 0.25 ? 1.7 : 0.5), P = c.P, ch = c.chin;
      ring(c, 0, 1, col);
      // a few folds between the sash and where the skirt takes over
      for (const az of [-150, -100, -62, 58, 104, 152]) c.line([P(az, SASH_T - SASH_H - 0.03), P(az + 2, 0.12)], c.shade(col, 0.82), 5);
      // the over-panel's edge: from the left of the neck down across the chest to the right hip, where it meets the sash
      const over = bend(P(46, 1), P(20, ch - 0.1), P(-34, SASH_T + SASH_H - 0.01), 14);
      // the under-panel's edge: from the right of the neck down to where the over-panel covers it
      const under = bend(P(-46, 1), P(-24, ch - 0.06), P(3, ch - 0.215), 10);
      // the under-robe in the V between them (down to the crossing)
      c.poly([P(-46, 1), ...under.slice(1), ...over.slice(0, 8).reverse()], inner);
      c.line(under, bi, 25); c.line(under, band, 16);
      c.line(over, bi, 27); c.line(over, band, 18);
      // below the sash the over-panel's edge runs on down the front of the skirt (the skirt paints it from there)
      if (sash) sashOn(c, sash, knot);
      else hoop(c, SASH_T, ink, 4);
      c.line([P(-34, SASH_T - SASH_H - 0.004), P(-31, 0.1)], ink, 5);
    },
    build: len ? (b) => {
      const col = o.col ?? b.look.topCol, band = o.band ?? shade(col, 0.6);
      skirtOn(b, {
        hem: len === "long" ? 0.07 : 0.33, flare: len === "long" ? 0.075 : 0.045, key,
        paint: (g, W, H, y) => {
          g.fillStyle = col; g.fillRect(0, 0, W, H);
          // folds: soft darker lines down the cloth
          g.strokeStyle = shade(col, 0.84); g.lineWidth = W * 0.008; g.lineCap = "round";
          for (const u of [0.07, 0.19, 0.31, 0.63, 0.74, 0.86, 0.95]) { g.beginPath(); g.moveTo(u * W, y(0.42)); g.lineTo((u + 0.006) * W, y(HEM_BAND + 0.03)); g.stroke(); }
          // the band along the hem
          g.fillStyle = band; g.fillRect(0, y(HEM_BAND), W, H);
          g.fillStyle = shade(band, luma(band) < 0.25 ? 1.7 : 0.5); g.fillRect(0, y(HEM_BAND) - H * 0.006, W, H * 0.012);
          // the over-panel's edge down the front, right of the middle as the wearer has it (az about -31 degrees)
          const x = (0.5 - 31 / 360) * W;
          g.fillStyle = shade(col, 0.36); g.fillRect(x - W * 0.004, y(0.78), W * 0.008, y(HEM_BAND) - y(0.78));
        },
      });
    } : undefined,
  };
};

// ===== cloth that hangs =====
/** the head's height factor and the height of the body's bottom above the ground when the figure stands */
const stand = (b: PartKit) => {
  const D = dimsOf(b.look), ys = clamp((D.H.b / D.H.a) * 0.95, 0.85, 0.97);
  return { ys, hipY: 1.45 - b.R * ys - b.headY };
};
/** one normal per position (the mean of the faces that meet there), so that the ink hull stays closed over seams */
const weld = <T extends THREE.BufferGeometry>(g: T) => {
  g.computeVertexNormals();
  const P = g.attributes.position, N = g.attributes.normal, key = (i: number) => `${Math.round(P.getX(i) * 1e5)},${Math.round(P.getY(i) * 1e5)},${Math.round(P.getZ(i) * 1e5)}`, sum = new Map<string, number[]>();
  for (let i = 0; i < P.count; i++) { const a = sum.get(key(i)) ?? [0, 0, 0]; a[0] += N.getX(i); a[1] += N.getY(i); a[2] += N.getZ(i); sum.set(key(i), a); }
  for (let i = 0; i < P.count; i++) { const a = sum.get(key(i))!, l = Math.hypot(a[0], a[1], a[2]) || 1; N.setXYZ(i, a[0] / l, a[1] / l, a[2] / l); }
  g.computeBoundingSphere();
  return g;
};
/** The ground under a figure for its hanging cloth and scabbard (default: y = 0). A stage calls it for a figure that
 *  stands on something (a dais): the hems then stop at that height. */
export const setGround = (rig: Rig, y: number) => { rig.group.userData.hmGround = y; };
/** the bench a figure's cloth keeps out of (setSeat): everything below y and behind the upright plane n . p = d
 *  (n = the seat's flat front direction) */
type Bench = { y: number; nx: number; nz: number; d: number; sig: number };
/** how far above the seat's top the underside of the cloth lies (its ink line, 1 cm, then rests on the seat), and how
 *  far in front of the seat's front edge the cloth hangs down (its ink line clear of the edge) */
const BENCH_LIFT = 0.014, BENCH_CLEAR = 0.025;
const benchOf = (seat: SeatLike, facing: number): Bench => {
  const nx = Math.sin(facing), nz = Math.cos(facing), d = nx * seat.top.x + nz * seat.top.z + (seat.front ?? 0.2) + BENCH_CLEAR;
  return { y: seat.top.y, nx, nz, d, sig: seat.top.y * 13.7 + nx * 3.3 + nz * 5.9 + d * 7.1 + 0.5 };
};
/** what the cloth needs of a seat: the fields of the rig's RigSeat it reads (world, metres) */
type SeatLike = { top: { x: number; y: number; z: number }; front?: number };
/** Tells a figure's skirts what it sits on (see "A SEAT OF CHAIR HEIGHT" at the head of this file): `seat` = the
 *  RigSeat the stage gives rig.set({ seat }) (its top's centre and `front`, the distance from that centre to the
 *  front edge, default 0.2 as in the rig), facing = the direction the seat faces (the sitter's state.facing, radians,
 *  0 = +z). null = no seat any more. Call it once, or whenever the seat changes; it is not a per-frame call. For low
 *  floor seats (the banquet's pads) do NOT call it: there the robe rests on the ground round the sitter. */
export const setSeat = (rig: Rig, seat: SeatLike | null, facing = 0) => {
  const U = rig.group.userData;
  if (seat) U.hmSeat = benchOf(seat, facing); else delete U.hmSeat;
};
/** the seat for the skirts of the accessory that is being built (onSeat) */
let seatForBuild: Bench | null = null;
/** The same garment (robe, armour: any accessory with a skirt), made for a figure that sits on this seat for as long
 *  as it exists: a Person of one place (acc/liu_dage.ts: Liu Bang on the privy). The figure is then born with the
 *  seat, as if setSeat(rig, seat, facing) had been called on it; nothing to do per shot. */
export const onSeat = (acc: Acc, seat: SeatLike, facing = 0): Acc => {
  const build = acc.build;
  if (!build) return acc;
  return { ...acc, key: `${acc.key}|seat ${seat.top.x},${seat.top.y},${seat.top.z},${seat.front ?? 0.2},${facing}`, build: (b) => { seatForBuild = benchOf(seat, facing); try { build(b); } finally { seatForBuild = null; } } };
};

/** What a hanging part knows of its figure in this frame, all in the figure group's own space (= the world):
 *  B = the bottom of the body on its axis, ex / ey / ez = the body's axes (the person's left, up, front), fx / fz =
 *  the same left and front laid flat, legs = points down the middle of both legs (x, y, z each), ground, and rest =
 *  the height things beside the body rest on (the ground, or the seat's top under a body that sits low). */
type Frame = { B: THREE.Vector3; ex: THREE.Vector3; ey: THREE.Vector3; ez: THREE.Vector3; fx: THREE.Vector3; fz: THREE.Vector3; sy: number; legs: Float32Array; ground: number; rest: number; sig: number };
const LEG_RING = 14;
/** reads the frame from the figure (torso = the kit's torso group, a child of the figure's group). Returns null while
 *  the figure is hidden. */
const frameOf = (torso: THREE.Object3D, standHip: number): Frame | null => {
  const root = torso.parent;
  if (!root || !root.visible) return null;
  const U = root.userData;
  let F = U.hmFrame as Frame | undefined;
  if (!F) F = U.hmFrame = { B: new THREE.Vector3(), ex: new THREE.Vector3(), ey: new THREE.Vector3(), ez: new THREE.Vector3(), fx: new THREE.Vector3(), fz: new THREE.Vector3(), sy: 1, legs: new Float32Array(0), ground: 0, rest: 0, sig: 0 };
  // the two leg tubes: the kit's limbs are the meshes with a "tangent3" attribute, in the order arm, arm, leg, leg
  let tubes = U.hmTubes as THREE.BufferGeometry[] | undefined;
  if (!tubes) {
    const seen: THREE.BufferGeometry[] = [];
    for (const c of root.children) { const g = (c as THREE.Mesh).geometry as THREE.BufferGeometry | undefined; if (g && g.attributes && g.attributes.tangent3 && !seen.includes(g)) seen.push(g); }
    if (seen.length < 4) return null;
    tubes = U.hmTubes = seen.slice(2, 4);
  }
  const e = torso.matrix.elements;
  F.B.set(e[12], e[13], e[14]);
  F.ex.set(e[0], e[1], e[2]).normalize(); F.sy = Math.hypot(e[4], e[5], e[6]); F.ey.set(e[4], e[5], e[6]).normalize(); F.ez.set(e[8], e[9], e[10]).normalize();
  const fl = Math.hypot(F.ez.x, F.ez.z) || 1;
  F.fz.set(F.ez.x / fl, 0, F.ez.z / fl); F.fx.set(F.fz.z, 0, -F.fz.x);
  const n = tubes.reduce((s, g) => s + g.attributes.position.count / LEG_RING, 0);
  if (F.legs.length !== n * 3) F.legs = new Float32Array(n * 3);
  let k = 0, sig = e[12] * 3.1 + e[13] * 5.3 + e[14] * 7.7 + e[0] * 1.3 + e[2] * 2.9 + e[5] * 4.1 + e[9] * 6.1 + e[10] * 0.7;
  for (const g of tubes) {
    const P = g.attributes.position.array as Float32Array, rings = P.length / (3 * LEG_RING);
    for (let i = 0; i < rings; i++, k += 3) {
      let x = 0, y = 0, z = 0;
      for (let j = 0, q = i * LEG_RING * 3; j < LEG_RING; j++, q += 3) { x += P[q]; y += P[q + 1]; z += P[q + 2]; }
      F.legs[k] = x / LEG_RING; F.legs[k + 1] = y / LEG_RING; F.legs[k + 2] = z / LEG_RING;
      sig += F.legs[k] * (1.1 + 0.01 * k) + F.legs[k + 1] * (2.3 + 0.02 * k) + F.legs[k + 2] * (3.7 + 0.03 * k);
    }
  }
  F.ground = typeof U.hmGround === "number" ? U.hmGround : 0;
  // a body that is lower than a standing one sits on something (the kit puts a seated body's bottom 2.8 cm over the
  // seat): its top is where a scabbard or a cape comes to rest
  const h = F.B.y - F.ground;
  F.rest = lerp(F.ground + Math.max(0, h - 0.028), F.ground, smooth((h - 0.45 * standHip) / (0.3 * standHip)));
  F.sig = sig + F.ground * 9.1;
  return F;
};
/** How far the cloth has to stand out from an upright axis through (cx, cz) at height y toward the flat direction
 *  th (radians: atan2(x, z)), given that it is a circle of radius R0 there when nothing pushes it: the legs' points,
 *  taken as balls of radius rho, tent it. The outline is the rounded hull of the circle and each ball: straight from
 *  the circle to the ball (cloth pulled taut), round over the ball. A point above the ring pushes it fully (cloth
 *  hangs straight down from a knee); one below it only with the part of its ball that reaches up to the ring. */
type Push = { th: number; d: number; rho: number; beta: number; gamma: number };
const CAP = 0.055;
const pushesAt = (F: Frame, cx: number, cz: number, y: number, R0: number, rho: number, out: Push[]) => {
  out.length = 0;
  const L = F.legs;
  for (let k = 0; k < L.length; k += 3) {
    const dy = y - L[k + 1];
    if (dy >= CAP) continue;
    // (over a point the cloth is a tall rounded cap, CAP high: a knee's top never shows between two rows)
    const re = dy <= 0 ? rho : rho * Math.sqrt(1 - (dy / CAP) ** 2), dx = L[k] - cx, dz = L[k + 2] - cz, d = Math.hypot(dx, dz);
    if (d + re <= R0 + 1e-4) continue;
    const beta = Math.acos(clamp((R0 - re) / d, -1, 1));
    out.push({ th: Math.atan2(dx, dz), d, rho: re, beta, gamma: Math.atan2(re * Math.sin(beta), d + re * Math.cos(beta)) });
  }
  return out;
};
const pushed = (ps: Push[], th: number, R0: number) => {
  let r = R0;
  for (const p of ps) {
    const a = Math.abs(wrapA(th - p.th));
    if (a >= p.beta) continue;
    const v = a <= p.gamma ? p.d * Math.cos(a) + Math.sqrt(Math.max(0, p.rho * p.rho - (p.d * Math.sin(a)) ** 2)) : R0 / Math.cos(p.beta - a);
    if (v > r) r = v;
  }
  return r;
};
/** runs fn whenever the object's world matrix is brought up to date (once per traversal of the scene, before a
 *  frame is drawn): a pure function of the pose, as the kit's own `plumb` does it */
const everyFrame = (o: THREE.Object3D, fn: () => void) => {
  const base = o.updateMatrixWorld;
  o.updateMatrixWorld = function (force?: boolean) { fn(); base.call(o, force); };
};

type SkirtO = {
  /** how high its hem hangs above the ground when the figure stands (m): 0.07 = to the ankles, 0.33 = to the knees */
  hem: number;
  /** how much wider than the hips it is at the hem (m) */
  flare: number;
  /** paints its map: W x H canvas, x = round the body (0.5 = the front), y(h) = the canvas row at the share h of the
   *  skirt's height above the hem (0 = the hem, 1 = where it leaves the body) */
  paint: (g: CanvasRenderingContext2D, W: number, H: number, y: (h: number) => number) => void;
  key: string; ink?: number;
  /** the legs' clearance under the cloth (m, default 0.024) */
  rho?: number;
};
/** A skirt: cloth round the legs from inside the lower body down to `hem` above the ground. It is one closed surface
 *  (its top is deep inside the body, its underside is closed), rebuilt every frame in the figure's own space from the
 *  pose (see the head of this file): plumb below the body, gathered above the ground, tented over the legs. */
const skirtOn = (b: PartKit, o: SkirtO) => {
  const F0 = stand(b), Ht = b.Ht, rb = b.rb, NA = 48, rho = o.rho ?? 0.024;
  const Lc = Math.max(0.06, F0.hipY - o.hem);                       // the cloth's length below the body's bottom
  // rows from the top down. s = height above the body's bottom along the body (rows inside and round the body);
  // f = share of the way down to the hem (rows below the body). r0 = the radius at rest (rows on the body: + the
  // body's own unevenness at each azimuth, so the line where the skirt leaves the body stays level)
  type Row = { s: number; f: number; r0: number; on: number; lip: number };
  const rows: Row[] = [];
  const TOP = 0.44;
  rows.push({ s: TOP * Ht, f: 0, r0: 0, on: 0, lip: 0 });
  // A garment MADE FOR A SEAT (onSeat) has LAP_SUB times as many rows from the hips down to the body's bottom: the
  // top of a lap is where the rows meet the thighs, and a thigh that is not exactly level enters them row by row;
  // with the standing skirt's rows (1.3 cm apart) that showed as a staircase of 3 to 7 px in the lap's outline, with
  // rows 3 mm apart it is a smooth line. (The rows between two of the standing skirt's lie straight between them, so
  // the cloth at rest has the same shape; a garment that was not made for a seat has exactly the rows it always had.)
  const LAP_SUB = seatForBuild ? 4 : 1, LAP_FROM = 0.34;
  let prevRow: [number, number, number] | null = null;
  for (const row of [[0.42, 0.45, 0], [0.4, 0.7, 0], [0.37, 0.88, 0], [0.34, 1, -0.006], [0.31, 1, -0.006], [0.28, 1, -0.006], [0.25, 1, -0.0055], [0.22, 1, -0.005], [0.19, 1, -0.0045], [0.16, 0, rb - 0.002], [0.13, 0, rb + 0.002], [0.1, 0, rb + 0.005], [0.065, 0, rb + 0.008], [0.03, 0, rb + 0.01], [0, 0, rb + 0.012]] as [number, number, number][]) {
    const [t, k, off] = row;
    if (prevRow && LAP_SUB > 1 && prevRow[0] <= LAP_FROM + 1e-9) for (let q = 1; q < LAP_SUB; q++) { const m = q / LAP_SUB; rows.push({ s: lerp(prevRow[0], t, m) * Ht, f: 0, r0: lerp(prevRow[2], off, m), on: lerp(prevRow[1], k, m), lip: 0 }); }
    rows.push({ s: t * Ht, f: 0, r0: off, on: k, lip: 0 });
    prevRow = row;
  }
  const NB = Math.max(4, Math.round(Lc / 0.04)), FIRST = rows.length;      // FIRST = the first row below the body
  for (let i = 1; i <= NB; i++) { const f = i / NB; rows.push({ s: 0, f, r0: rb + 0.012 + o.flare * f ** 1.25, on: 0, lip: 0 }); }
  const HEM = rows.length - 1;
  rows.push({ s: 0, f: 1, r0: 0, on: 0, lip: 1 }, { s: 0, f: 1, r0: 0, on: 0, lip: 2 });
  const NR = rows.length, NC = NA + 1, pos = new Float32Array(NR * NC * 3), nor = new Float32Array(NR * NC * 3), uv = new Float32Array(NR * NC * 2), idx: number[] = [];
  // the rest radius per row and azimuth
  const azOf = (j: number) => -Math.PI + (2 * Math.PI * j) / NA;
  const R0 = rows.map((r) => Array.from({ length: NC }, (_, j) => (r.on ? b.bodyR(r.s / Ht, (azOf(j) * 180) / Math.PI) * r.on + r.r0 : r.r0)));
  const R0m = R0.map((a) => a.reduce((s, x) => s + x, 0) / a.length);
  const total = TOP * Ht + Lc, hShare = (r: Row) => (r.f > 0 ? 1 - r.f : 1 + r.s / Lc);        // height above the hem as a share of the cloth below the body
  for (let i = 0; i < NR; i++) for (let j = 0; j < NC; j++) { uv[(i * NC + j) * 2] = j / NA; uv[(i * NC + j) * 2 + 1] = rows[i].lip ? 0 : clamp(1 - (TOP * Ht - (rows[i].f > 0 ? -Lc * rows[i].f : rows[i].s)) / total, 0, 1); }
  for (let i = 0; i < NR - 1; i++) for (let j = 0; j < NA; j++) { const A = i * NC + j, B = A + 1, C = A + NC, D = C + 1; idx.push(A, C, B, B, C, D); }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("normal", new THREE.BufferAttribute(nor, 3));
  geo.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  geo.setIndex(idx);
  geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1e4);
  geo.userData.hull = () => geo;                                    // the ink hull is this same surface (it changes every frame)
  // the map: v = 1 at the very top (inside the body) .. 0 at the hem; `y(h)` = the row of height share h (see SkirtO)
  const vOfShare = (h: number) => 1 - (TOP * Ht + (1 - h) * Lc) / total;
  const map = b.tex(512, 512, (g) => o.paint(g, 512, 512, (h) => 512 * (1 - vOfShare(h))), `${o.key}|${Math.round(Lc * 1000)}|${Math.round(Ht * 1000)}`);
  void hShare;
  const mesh = b.solid("body", geo, { map, paint: "cloth", ink: o.ink ?? 0.0105 });
  const torso = mesh.parent!, root = torso.parent!;
  root.add(mesh);                                                   // it lives in the figure's own space, like the limbs
  mesh.frustumCulled = false;
  if (seatForBuild) root.userData.hmSeat = seatForBuild;            // a garment made for a seat (onSeat)
  const ps: Push[] = [], c = new THREE.Vector3(), u = new THREE.Vector3(), v = new THREE.Vector3();
  let last = NaN;
  const set = (i: number, j: number, x: number, y: number, z: number) => { const q = (i * NC + j) * 3; pos[q] = x; pos[q + 1] = y; pos[q + 2] = z; };
  // ---- on a seat (setSeat): the same cloth, kept out of the bench ----
  // Below the body the rows are split: MU rows from the body's bottom down to the seat (the full outline: the lap and
  // the hips, resting on the seat's top), then the rest from the seat's top down to the hem, cut along the seat's
  // front: only what is in front of it hangs on. Between the two the surface runs level, back under the lap: its
  // underside. Round each row the points are no longer spread evenly: NF either side of the middle take the part of
  // the outline that is in front of the seat (what hangs down, and what is seen), the others the part behind it; one
  // point is pinned on each corner where the outline meets the seat's front, so the hanging cloth has crisp back
  // edges. beta (0 = the cloth is clear of the bench .. 1 = it stands 8 cm or more into it) blends all of this in, so
  // that a figure clear of the bench has exactly the cloth it has without a seat.
  // On a seat the cloth also spans from leg to leg (taut between the two knees and between the two shins: a lap, and
  // one flat front below the knees), where the cloth without a seat keeps a tent over each leg with a valley between
  // them. The valley's walls are steep: a camera that looks along one sees a wall edge-on, as specks.
  const NF = Math.round(NA * 0.3125), MU = Math.max(2, Math.round(NB / 3)), psA: Push[] = [], brA: number[] = [], br: number[] = [];
  /** the spans between the two legs at height y, seen from the axis (cx, cz): for every pair of matching points down
   *  the two legs that reach up to y, the strip between them of their clearance (6 numbers each: the first point,
   *  the unit direction to the second, the length, the half width) */
  const spansAt = (F: Frame, cx: number, cz: number, y: number, out: number[]) => {
    out.length = 0;
    const L = F.legs, half = L.length / 2;
    if (half % 3) return out;
    for (let k = 0; k < half; k += 3) {
      const d0 = y - L[k + 1], d1 = y - L[half + k + 1];
      if (d0 >= CAP || d1 >= CAP) continue;
      const dm = Math.max(d0, d1), ro = dm <= 0 ? rho : rho * Math.sqrt(1 - (dm / CAP) ** 2), ex = L[half + k] - L[k], ez = L[half + k + 2] - L[k + 2], len = Math.hypot(ex, ez);
      if (len > 1e-4) out.push(L[k] - cx, L[k + 2] - cz, ex / len, ez / len, len, ro);
    }
    return out;
  };
  /** how far the spans reach from the axis toward the flat direction th (0 = none that way) */
  const spanned = (bs: number[], th: number) => {
    const ux = Math.sin(th), uz = Math.cos(th);
    let r = 0;
    for (let k = 0; k < bs.length; k += 6) {
      const ax = bs[k], az = bs[k + 1], ex = bs[k + 2], ez = bs[k + 3], un = ux * ez - uz * ex;
      if (Math.abs(un) < 1e-6) continue;
      const an = ax * ez - az * ex;
      let t = (an + bs[k + 5]) / un, sl = (t * ux - ax) * ex + (t * uz - az) * ez;
      if (t > r && sl >= 0 && sl <= bs[k + 4]) r = t;
      t = (an - bs[k + 5]) / un; sl = (t * ux - ax) * ex + (t * uz - az) * ez;
      if (t > r && sl >= 0 && sl <= bs[k + 4]) r = t;
    }
    return r;
  };
  // The legs are read as a row of points 3 cm apart; over a thigh that lies level each point lifts the cloth as a
  // rounded cap, and row by row another cap comes into reach: small steps along the top of the lap, in the outline
  // when the lap is seen from the side. On a seat the points are taken DENSE times closer (laid between the read ones).
  const DENSE = 4;
  let denseLegs = new Float32Array(0);
  const denser = (F: Frame): Frame => {
    const L = F.legs, half = L.length / 2, n = half / 3;
    if (n < 2 || n % 1) return F;
    const m = (n - 1) * DENSE + 1;
    if (denseLegs.length !== 2 * m * 3) denseLegs = new Float32Array(2 * m * 3);
    for (let leg = 0; leg < 2; leg++) for (let i = 0; i < m; i++) {
      const a = Math.min(n - 2, Math.floor(i / DENSE)), t = i / DENSE - a, p = leg * half + a * 3, q = (leg * m + i) * 3;
      for (let k = 0; k < 3; k++) denseLegs[q + k] = L[p + k] + (L[p + 3 + k] - L[p + k]) * t;
    }
    return { ...F, legs: denseLegs };
  };
  const benchRows = (F0: Frame, S: Bench, LeStd: number, yaw0: number): [number, number] => {
    const F = denser(F0), Bx = F.B.x, By = F.B.y, Bz = F.B.z, yawN = Math.atan2(S.nx, S.nz), azN = wrapA(yawN - yaw0);
    const dAx = S.nx * Bx + S.nz * Bz - S.d;                          // the body's axis: how far in front of the seat's front (< 0: behind)
    const yu = Math.min(S.y + BENCH_LIFT, By - 0.002);                 // the cloth's underside on the seat
    /** the outline of a row (its pushes ps, its rest radius R) toward az; how far that point is in front of the seat */
    const hull = (q: Push[], R: number, az: number) => {
      const bs = q === psA ? brA : br;
      let r = q.length ? Math.max(R, pushed(q, yaw0 + az, R)) : R;
      if (beta > 0 && bs.length) { const t = spanned(bs, yaw0 + az); if (t > r) r += beta * (t - r); }
      return r;
    };
    const depth = (q: Push[], R: number, az: number) => dAx + hull(q, R, az) * Math.cos(az - azN);
    /** how far round from the seat's front direction (0 .. PI, toward the side sg) a row's outline stays in front of it */
    const cross = (q: Push[], R: number, sg: number) => {
      if (depth(q, R, azN) <= 0) return 0;
      for (let k = 1, a0 = 0; k <= 45; k++) {
        const a1 = k * rad(4);
        if (depth(q, R, azN + sg * a1) < 0) {
          let lo = a0, hi = a1;
          for (let n = 0; n < 16; n++) { const m = (lo + hi) / 2; if (depth(q, R, azN + sg * m) < 0) hi = m; else lo = m; }
          return hi;
        }
        a0 = a1;
      }
      return Math.PI;
    };
    /** how far the row's outline reaches in front of the seat's front (its support along the seat's direction) */
    const reach = (q: Push[], R: number) => { let m = R; for (const p of q) m = Math.max(m, p.d * Math.cos(p.th - yawN) + p.rho); return dAx + m; };
    /** where point j of a row sits (the angle from the body's front), given where its outline meets the seat's front */
    const jr = NA / 2 - NF, jl = NA / 2 + NF;
    const azT = (j: number, aR: number, aL: number) => {
      const back = (2 * Math.PI - (aL - aR)) / (NA - 2 * NF);
      return j < jr ? aR - back * (jr - j) : j > jl ? aL + back * (j - jl) : aR + ((aL - aR) * (j - jr)) / (2 * NF);
    };
    // the row on the seat's top (row A): its outline decides how the points are spread on it and above it
    const iA = FIRST + MU - 1, beta = smooth((rows[iA].r0 - dAx) / 0.08);
    // (on a seat the cloth widens with its real drop below the body, not with the row's place in the standing skirt:
    // the rows that lie together on the seat's top then have one outline, and the hips are not wider than standing)
    const flareAt = (y: number) => rb + 0.012 + o.flare * clamp((By - y) / Lc, 0, 1) ** 1.25;
    const RA = lerp(rows[iA].r0, flareAt(yu), beta), yA = lerp(By - LeStd * rows[iA].f, yu, beta);
    pushesAt(F, Bx, Bz, yA, RA, rho, psA); spansAt(F, Bx, Bz, yA, brA);
    const aRA = azN - cross(psA, RA, -1), aLA = azN + cross(psA, RA, 1), DA = reach(psA, RA);
    // what hangs in front of the seat: gone (drawn up to the seat's top) when less than 3 cm of the outline is in front
    const lam = smooth((DA - 0.03) / 0.05), run = Math.max(0, DA - dAx - RA);
    const hemB = Math.max(F.ground + 0.015, yu - Math.max(0.02, Lc - (By - yu) - run));
    let cx = Bx, cz = Bz;
    for (let i = 0; i <= HEM; i++) {
      const r = rows[i], onBody = i < FIRST, n = i - FIRST + 1;                 // n = 1 .. NB below the body
      if (onBody) {
        c.copy(F.B).addScaledVector(F.ey, r.s * F.sy);
        const w = clamp(r.s / (0.3 * Ht), 0, 1), wr = r.on ? 0 : beta * smooth(1 - r.s / (0.16 * Ht));
        pushesAt(F, c.x, c.z, c.y, R0m[i], rho, ps);
        if (beta > 0) spansAt(F, c.x, c.z, c.y, br); else br.length = 0;
        for (let j = 0; j < NC; j++) {
          const a0 = azOf(j), az = wr ? a0 + wr * (azT(j, aRA, aLA) - a0) : a0, sn = Math.sin(az), cs = Math.cos(az);
          u.set(0, 0, 0).addScaledVector(F.fx, sn).addScaledVector(F.fz, cs);
          if (w > 0) { v.set(0, 0, 0).addScaledVector(F.ex, sn).addScaledVector(F.ez, cs); u.lerp(v, w).normalize(); }
          let rr = R0[i][j];
          if (ps.length) rr = Math.max(rr, pushed(ps, yaw0 + az, R0m[i]));
          if (br.length) { const t = spanned(br, yaw0 + az); if (t > rr) rr += beta * (t - rr); }
          set(i, j, c.x + u.x * rr, c.y + u.y * rr, c.z + u.z * rr);
        }
        continue;
      }
      const yE = By - LeStd * r.f;
      if (n <= MU) {
        // from the body's bottom to the seat: the whole outline. The last row but one lies 1 mm over the last: the
        // surface turns under there, and a turn spread over the rows above would show as a darker fringe along the lap
        const yb = n === MU ? yu : By - ((By - yu - 0.001) * n) / (MU - 1), y = lerp(yE, yb, beta), R = n === MU ? RA : lerp(r.r0, flareAt(n === MU - 1 ? yu : yb), beta);
        const q = n === MU ? psA : pushesAt(F, Bx, Bz, y, R, rho, ps);
        if (n !== MU) spansAt(F, Bx, Bz, y, br);
        for (let j = 0; j < NC; j++) {
          const a0 = azOf(j), az = a0 + beta * (azT(j, aRA, aLA) - a0), rr = hull(q, R, az), th = yaw0 + az;
          set(i, j, Bx + Math.sin(th) * rr, y, Bz + Math.cos(th) * rr);
        }
        continue;
      }
      // from the seat's top to the hem: only what is in front of the seat
      const yb = yu - (yu - hemB) * ((n - MU - 1) / Math.max(1, NB - MU - 1)) * lam, y = lerp(yE, yb, beta), R = lerp(r.r0, flareAt(yb), beta);
      pushesAt(F, Bx, Bz, y, R, rho, ps); spansAt(F, Bx, Bz, y, br);
      const aR = azN - cross(ps, R, -1), aL = azN + cross(ps, R, 1);
      // a point inside what hangs here (the cut outline is convex): from between the two legs' foremost points (or the
      // foremost point of the hips' circle, when that is further forward), half way back toward the seat's front
      let d0 = -1e9, d1 = -1e9, x0 = 0, z0 = 0, x1 = 0, z1 = 0;
      const L = F.legs, half = L.length / 2;
      for (let k = 0; k < L.length; k += 3) {
        if (y - L[k + 1] >= CAP) continue;
        const dp = S.nx * L[k] + S.nz * L[k + 2] - S.d;
        if (k < half) { if (dp > d0) { d0 = dp; x0 = L[k]; z0 = L[k + 2]; } } else if (dp > d1) { d1 = dp; x1 = L[k]; z1 = L[k + 2]; }
      }
      let mx = Bx + S.nx * R, mz = Bz + S.nz * R, dm = dAx + R;
      if (Math.max(d0, d1) > dm) {
        // (the leg that is further back counts only while it is in front of the seat itself)
        const lo = d0 < d1 ? 0 : 1, k = 0.5 * smooth((lo ? d1 : d0) / 0.03), fx = lo ? x0 : x1, fz = lo ? z0 : z1, bx = lo ? x1 : x0, bz = lo ? z1 : z0;
        mx = lerp(fx, bx, k); mz = lerp(fz, bz, k); dm = S.nx * mx + S.nz * mz - S.d;
      }
      const tau = dm > dAx ? clamp((0.5 * dm) / (dm - dAx), 0, 0.5) : 0, cd = dm + (dAx - dm) * tau;
      cx = lerp(mx, Bx, tau); cz = lerp(mz, Bz, tau);
      for (let j = 0; j < NC; j++) {
        const a0 = azOf(j), az = a0 + beta * (azT(j, aR, aL) - a0), rr = hull(ps, R, az), th = yaw0 + az;
        let px = Bx + Math.sin(th) * rr, pz = Bz + Math.cos(th) * rr;
        const dp = S.nx * px + S.nz * pz - S.d;
        if (dp < 0) {
          // behind the seat's front: onto it, along the line to that inner point (the back of the hanging cloth)
          if (cd > 1e-5) { const k = cd / (cd - dp); px = cx + (px - cx) * k; pz = cz + (pz - cz) * k; } else { px = cx; pz = cz; }
        }
        set(i, j, px, y, pz);
      }
    }
    return [cx, cz];
  };
  const refresh = () => {
    const F = frameOf(torso, F0.hipY), S = root.userData.hmSeat as Bench | undefined;
    if (!F) return;
    const sig = S ? F.sig + S.sig : F.sig;
    if (sig === last) return;
    last = sig;
    const hemY = Math.max(F.B.y - Lc, F.ground + 0.015), Le = Math.max(F.B.y - hemY, 0.004), yaw0 = Math.atan2(F.fz.x, F.fz.z);
    let lx = F.B.x, lz = F.B.z;                                      // where the underside closes: under the body, or inside what hangs in front of a seat
    if (S) [lx, lz] = benchRows(F, S, Le, yaw0);
    else for (let i = 0; i <= HEM; i++) {
      const r = rows[i], onBody = r.f === 0;
      // the row's middle: on the body's own axis above its bottom, plumb under it below
      if (onBody) c.copy(F.B).addScaledVector(F.ey, r.s * F.sy); else c.set(F.B.x, F.B.y - Le * r.f, F.B.z);
      const w = onBody ? clamp(r.s / (0.3 * Ht), 0, 1) : 0;
      pushesAt(F, c.x, c.z, c.y, R0m[i], rho, ps);
      for (let j = 0; j < NC; j++) {
        const az = azOf(j % NA), sn = Math.sin(az), cs = Math.cos(az);
        // the direction out from the axis: flat below the body, turning into the body's own (leaning) frame on it
        u.set(0, 0, 0).addScaledVector(F.fx, sn).addScaledVector(F.fz, cs);
        if (w > 0) { v.set(0, 0, 0).addScaledVector(F.ex, sn).addScaledVector(F.ez, cs); u.lerp(v, w).normalize(); }
        let rr = R0[i][j];
        if (ps.length) rr = Math.max(rr, pushed(ps, yaw0 + az, R0m[i]));
        set(i, j, c.x + u.x * rr, c.y + u.y * rr, c.z + u.z * rr);
      }
    }
    // the underside: a lip turned in under the hem, then closed
    for (let j = 0; j < NC; j++) {
      const q = (HEM * NC + j) * 3, dx = pos[q] - lx, dz = pos[q + 2] - lz, l = Math.hypot(dx, dz) || 1, k = Math.max(0, 1 - 0.03 / l);
      set(HEM + 1, j, lx + dx * k, pos[q + 1] + 0.012, lz + dz * k);
      set(HEM + 2, j, lx, pos[q + 1] + 0.03, lz);
    }
    // normals: from the grid (round the seam; the two poles point up and down)
    for (let i = 0; i < NR; i++) for (let j = 0; j < NC; j++) {
      const q = (i * NC + j) * 3;
      if (i === 0 || i === NR - 1) { nor[q] = 0; nor[q + 1] = i === 0 ? 1 : -1; nor[q + 2] = 0; continue; }
      const a = ((i - 1) * NC + j) * 3, d = ((i + 1) * NC + j) * 3, l = (i * NC + ((j % NA) + NA - 1) % NA) * 3, rgt = (i * NC + ((j % NA) + 1) % NA) * 3;
      const tx = pos[d] - pos[a], ty = pos[d + 1] - pos[a + 1], tz = pos[d + 2] - pos[a + 2], ax = pos[rgt] - pos[l], ay = pos[rgt + 1] - pos[l + 1], az2 = pos[rgt + 2] - pos[l + 2];
      const nx = ty * az2 - tz * ay, ny = tz * ax - tx * az2, nz = tx * ay - ty * ax, nl = Math.hypot(nx, ny, nz) || 1;
      nor[q] = nx / nl; nor[q + 1] = ny / nl; nor[q + 2] = nz / nl;
    }
    geo.attributes.position.needsUpdate = true; geo.attributes.normal.needsUpdate = true;
  };
  everyFrame(mesh, refresh);
  return mesh;
};

// ===== armour =====
/** short armour (ArmourO.tunic): the share of the skirt's height above the hem at which the plate fringe ends (1 = level
 *  with the body's bottom; the skirt leaves the body about a third higher) */
const FRINGE = 1.15;
type ArmourO = {
  /** the plates (charcoal blue-grey by default; never pure black: it joins the ink and the limbs into one blob) */ col?: string;
  /** the edging: collar, shoulder guards, the skirt's hem (default: a lighter shade of the plates) */ trim?: string;
  /** a sash or belt round the waist; false = a plain dark belt */ sash?: string | false;
  /** a cloth at the neck (Fan Kuai's is red); false = the tunic under the armour shows there */ scarf?: string | false;
  /** the tunic under the armour, seen at the neck and the arm openings */ under?: string;
  /** false = no 3D plate skirt (stick legs, as the soldiers of the earlier film) */ skirt?: boolean;
  /** SHORT armour over a tunic: the plates end in a short fringe at the hips and the cloth of the tunic (this colour)
   *  goes on under it to the knees, with a darker band along its hem */ tunic?: string;
};
/** rows of small plates over a region of a canvas: every other row set half a plate along; two close tones (a
 *  strong small pattern breaks into flickering dots at the outline) */
const plates = (g: CanvasRenderingContext2D, x0: number, y0: number, x1: number, y1: number, pw: number, ph: number, col: string) => {
  const edge = shade(col, 0.74), lit = shade(col, 1.16);
  g.save(); g.beginPath(); g.rect(x0, y0, x1 - x0, y1 - y0); g.clip();
  g.fillStyle = col; g.fillRect(x0, y0, x1 - x0, y1 - y0);
  for (let j = 0, y = y0; y < y1; y += ph, j++) for (let x = x0 - (j % 2) * pw * 0.5; x < x1; x += pw) {
    g.fillStyle = edge; g.fillRect(x, y, pw, ph);
    g.fillStyle = col; g.fillRect(x + pw * 0.1, y + ph * 0.08, pw * 0.8, ph * 0.84);
    g.fillStyle = lit; g.fillRect(x + pw * 0.1, y + ph * 0.08, pw * 0.8, ph * 0.16);
  }
  g.restore();
};
/** Lamellar armour (札甲), painted over the whole top and the trousers: rows of small plates on the chest, the back
 *  and the sides, a guard over each shoulder, an edged collar, a sash or belt, and (3D) a plate skirt to the knees
 *  that behaves like the robe's skirt (see `skirtOn`): the legs never show through it, standing, walking or seated. */
export const armour = (o: ArmourO = {}): Acc => {
  const col = o.col ?? "#4a4f5e", trim = o.trim ?? shade(col, 1.5), sash = o.sash === undefined ? false : o.sash, scarf = o.scarf || false, under = o.under ?? shade(col, 0.7), skirt = o.skirt ?? true;
  const tunic = o.tunic || false;
  const key = ["armour", col, trim, sash, scarf, under, skirt, tunic].join("|");
  return {
    name: "armour", slots: scarf ? ["coat", "neck"] : ["coat"], key,
    outfit(c) {
      const P = c.P, g = c.g, ink = c.shade(col, 0.4), ti = c.shade(trim, 0.5), ch = c.chin;
      ring(c, 0, 1, col);
      // the plates: all round, from under the sash up to the neck
      plates(g, 0, 0, c.W, c.H, 34, 30, col);
      // below the sash the body is inside the skirt: plain
      ring(c, 0, SASH_T - SASH_H, c.shade(col, 0.9));
      // the shoulder guards: a broad flap over each shoulder, edged
      for (const s of [-1, 1]) {
        const flap: P2[] = [P(s * 50, 1), ...bend(P(s * 52, 0.8), P(s * 60, 0.63), P(s * 96, 0.61)), ...bend(P(s * 96, 0.61), P(s * 132, 0.63), P(s * 140, 0.8)).slice(1), P(s * 142, 1)];
        c.poly(flap, c.shade(col, 0.82));
        c.line(flap.slice(1, -1), ti, 15); c.line(flap.slice(1, -1), trim, 8);
      }
      // the neck: the tunic under the armour (or the scarf) in a round opening with an edged collar
      for (const m of [0, 180]) {
        const U = (a: number, lo: number): P2[] => [P(m - a, 1), ...bend(P(m - a, ch + 0.03), P(m - a * 0.92, lo), P(m, lo)), ...bend(P(m, lo), P(m + a * 0.92, lo), P(m + a, ch + 0.03)).slice(1), P(m + a, 1)];
        c.poly(U(33, ch - 0.115), trim, ti, 5);
        c.poly(U(25, ch - 0.075), scarf || under);
      }
      if (scarf) {
        // a neck cloth: its two ends tucked down the front
        const sk = c.shade(scarf, 0.5);
        c.poly([P(-8, ch - 0.06), P(8, ch - 0.06), P(5, ch - 0.2), P(0, ch - 0.235), P(-5, ch - 0.2)], scarf, sk, 4);
      }
      // the front edge
      c.line([P(0, ch - (scarf ? 0.24 : 0.12)), P(0, SASH_T + SASH_H)], ink, 5);
      if (sash) sashOn(c, sash, true);
      else { ring(c, SASH_T - SASH_H * 0.8, SASH_T + SASH_H * 0.8, "#3a2a22"); hoop(c, SASH_T + SASH_H * 0.8, "#1f1814", 4); hoop(c, SASH_T - SASH_H * 0.8, "#1f1814", 4); disc(c, 0, SASH_T, 0.022, trim, ti, 4); }
    },
    build: skirt ? (b) => {
      skirtOn(b, {
        hem: 0.3, flare: 0.05, key, ink: 0.0105,
        paint: (g, W, H, y) => {
          plates(g, 0, 0, W, H, W / 22, H / 15, col);
          if (tunic) {
            // short armour: below the plate fringe the tunic's cloth, a few folds down it, a darker band along its hem
            const yf = y(FRINGE);
            g.fillStyle = tunic; g.fillRect(0, yf, W, H);
            g.strokeStyle = shade(tunic, 0.82); g.lineWidth = W * 0.008; g.lineCap = "round";
            for (const u of [0.08, 0.2, 0.33, 0.44, 0.57, 0.68, 0.81, 0.93]) { g.beginPath(); g.moveTo(u * W, yf + H * 0.05); g.lineTo((u + 0.005) * W, y(0.14)); g.stroke(); }
            g.fillStyle = shade(tunic, 0.62); g.fillRect(0, y(0.1), W, H);
            // the fringe's edge: the trim, a darker line under it
            g.fillStyle = shade(tunic, 0.45); g.fillRect(0, yf, W, H * 0.012);
            g.fillStyle = trim; g.fillRect(0, yf - H * 0.035, W, H * 0.035);
            g.fillStyle = shade(trim, luma(trim) < 0.25 ? 1.7 : 0.5); g.fillRect(0, yf - H * 0.035 - H * 0.006, W, H * 0.012);
            return;
          }
          // split in front; an edged hem
          g.fillStyle = shade(col, 0.4); g.fillRect(W / 2 - W * 0.004, y(0.9), W * 0.008, H);
          g.fillStyle = trim; g.fillRect(0, y(0.16), W, H);
          g.fillStyle = shade(trim, 0.5); g.fillRect(0, y(0.16) - H * 0.007, W, H * 0.014);
        },
      });
    } : undefined,
  };
};

// ===== the cape =====
/** A cape: cloth over both shoulders and all of the back (painted), its edges coming down the chest from a round
 *  clasp at the throat, and in 3D a cape that hangs behind from under the head to about knee height (len = 0..1 of
 *  that; default 1), as wide as the body beside it and flaring out below it. Its inside is the lining's colour.
 *  Like the skirts it is rebuilt every frame from the pose: plumb below the body, gathered on the ground or on the
 *  seat when its wearer sits, and pushed out by the legs (and so always outside a skirt worn under it). */
export const cape = (o: { col?: string; lining?: string; clasp?: string; len?: number; trim?: string | false } = {}): Acc => {
  const col = o.col ?? "#5b2a86", lining = o.lining ?? shade(col, 0.62), clasp = o.clasp ?? GOLD, len = clamp(o.len ?? 1, 0, 1), trim = o.trim || false;
  const key = ["cape", col, lining, clasp, len, trim].join("|");
  return {
    name: "cape", slots: ["back", "neck"], key,
    outfit(c) {
      const P = c.P, ink = c.shade(col, 0.36), ct = c.chin - 0.075;
      // the cloth: everything but an opening in front that widens downward from the clasp
      const edge = (s: number): P2[] => bend(P(0, ct), P(s * 34, ct - 0.2), P(s * 70, 0));
      for (const s of [-1, 1]) c.poly([P(s * 180, 1), P(0, 1), ...edge(s), P(s * 180, 0)], col);
      for (const s of [-1, 1]) { c.line(edge(s), ink, 21); c.line(edge(s), trim || lining, 12); }
      disc(c, 0, ct, 0.03, clasp, c.shade(clasp, 0.4), 5);
      disc(c, -1.6, ct + 0.012, 0.01, c.shade(clasp, 1.35));
    },
    build(b) {
      const F0 = stand(b), Ht = b.Ht, th = 0.036, R = th / 2;
      const yTop = 0.9 * Ht, knee = -(F0.hipY * 0.5 - 0.02), yHem = lerp(-0.03, knee, len), yFl = 0.26 * Ht, scallop = 0.022, fold = 0.007;
      const back = (y: number) => b.bodyR(clamp(y / Ht, 0.3, 0.9), 180);
      const flare = (y: number) => smooth((yFl - y) / (yFl - knee));
      const mid = (y: number) => back(y) + 0.01 + 0.115 * flare(y);
      const half = (y: number) => rad(lerp(60, 64, flare(y))) * (1 - 0.25 * smooth((y / Ht - 0.72) / 0.18));
      // the slab (as the Arthur film's capeGeo): s = -1..1 across, v = 0 at the top .. 1 at the hem, two faces. Kept
      // per point at rest: its height y on the body's axis, its angle ph from the back, its radius rho
      const NS = 36, NV = 30, n = (NS + 1) * (NV + 1), rest = new Float32Array(2 * n * 3), pos = new Float32Array(2 * n * 3), nor = new Float32Array(2 * n * 3), uv = new Float32Array(2 * n * 2), idx: number[] = [];
      const wHem = mid(yHem) * half(yHem), rc = 0.07, total = yTop - yHem;
      let q = 0;
      for (const side of [1, -1]) for (let j = 0; j <= NV; j++) for (let i = 0; i <= NS; i++, q++) {
        const s = -Math.cos((Math.PI * i) / NS), v = (1 - Math.cos((Math.PI * j) / NV)) / 2;
        const k = clamp((Math.abs(s) * wHem - (wHem - rc)) / rc, 0, 1), hem = yHem + scallop * (0.5 - 0.5 * Math.cos(s * Math.PI * 3)) + rc * (1 - Math.sqrt(1 - k * k));
        const y = yTop - v * (yTop - hem), ph = s * half(y), m = mid(y) + fold * Math.cos(s * Math.PI * 3) * smooth((yTop - y) / total - 0.35);
        const dx = (1 - Math.abs(s)) * m * half(y), dy = Math.min(v, 1 - v) * (yTop - hem), ex = 1 - Math.min(1, dx / R), ey = 1 - Math.min(1, dy / R);
        rest[q * 3] = y; rest[q * 3 + 1] = ph; rest[q * 3 + 2] = m + side * R * Math.sqrt(Math.max(0, 1 - Math.min(1, ex * ex + ey * ey)));
        uv[q * 2] = (side > 0 ? 0.25 : 0.75) + 0.2 * s; uv[q * 2 + 1] = 1 - v;
      }
      for (let sd = 0; sd < 2; sd++) for (let j = 0; j < NV; j++) for (let i = 0; i < NS; i++) {
        const A = sd * n + j * (NS + 1) + i, B = A + 1, C = A + NS + 1, D = C + 1;
        if (sd === 0) idx.push(A, B, C, C, B, D); else idx.push(A, C, B, B, C, D);
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      geo.setAttribute("normal", new THREE.BufferAttribute(nor, 3));
      geo.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
      geo.setIndex(idx);
      geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1e4);
      geo.userData.hull = () => geo;
      const map = b.tex(256, 512, (cg) => {
        cg.fillStyle = col; cg.fillRect(0, 0, 128, 512); cg.fillStyle = lining; cg.fillRect(128, 0, 128, 512);
        if (trim) { cg.fillStyle = trim; cg.fillRect(0, 512 - 26, 128, 26); cg.fillStyle = shade(trim, 0.5); cg.fillRect(0, 512 - 30, 128, 5); }
      }, key);
      const mesh = b.solid("body", geo, { map, paint: "cloth", ink: 0.0105 });
      const torso = mesh.parent!, root = torso.parent!;
      root.add(mesh); mesh.frustumCulled = false;
      // the arms keep off the upper cape (the elbows of hanging arms point back)
      for (const sx of [-1, 1]) for (const t of [0.34, 0.62]) b.keepOut(new THREE.Vector3(sx * 0.42 * b.rb, t * Ht, -(back(t * Ht) + 0.012)), 0.036);
      // which points share a place (the two faces meet along the edges): they share a normal, so the hull stays closed
      const twin = new Int32Array(2 * n).fill(-1);
      for (let j = 0; j <= NV; j++) for (let i = 0; i <= NS; i++) if (i === 0 || i === NS || j === 0 || j === NV) { const a = j * (NS + 1) + i; twin[a] = a + n; twin[a + n] = a; }
      const ps: Push[] = [], u = new THREE.Vector3(), w = new THREE.Vector3(), p = new THREE.Vector3(), rho = 0.056;
      let last = NaN;
      const refresh = () => {
        const F = frameOf(torso, F0.hipY);
        if (!F || F.sig === last) return;
        last = F.sig;
        const yaw0 = Math.atan2(F.fz.x, F.fz.z), Lr = -yHem, Le = clamp(F.B.y - (F.rest + 0.02), 0.004, Lr), kk = Le / Lr;
        for (let j = 0; j <= NV; j++) {
          // this row's push (its height: of its middle point on the outer face)
          const y0 = rest[(j * (NS + 1) + (NS >> 1)) * 3], below = y0 < 0, yw = below ? F.B.y + y0 * kk : F.B.y + y0;
          if (below) pushesAt(F, F.B.x, F.B.z, yw, mid(y0), rho, ps); else ps.length = 0;
          for (const sd of [0, 1]) for (let i = 0; i <= NS; i++) {
            const a = sd * n + j * (NS + 1) + i, y = rest[a * 3], ph = rest[a * 3 + 1];
            let rr = rest[a * 3 + 2];
            const az = Math.PI - ph, sn = Math.sin(az), cs = Math.cos(az);
            // beside the body: in the body's own frame; below its bottom: plumb, gathered above what it rests on
            u.set(0, 0, 0).addScaledVector(F.fx, sn).addScaledVector(F.fz, cs);
            if (y >= 0) {
              const t = clamp(y / (0.3 * Ht), 0, 1);
              w.set(0, 0, 0).addScaledVector(F.ex, sn).addScaledVector(F.ez, cs); u.lerp(w, t).normalize();
              p.copy(F.B).addScaledVector(F.ey, y * F.sy).addScaledVector(u, rr);
            } else {
              if (ps.length) rr += Math.max(0, pushed(ps, yaw0 + az, mid(y0)) - mid(y0));
              p.set(F.B.x, F.B.y + y * kk, F.B.z).addScaledVector(u, rr);
            }
            pos[a * 3] = p.x; pos[a * 3 + 1] = p.y; pos[a * 3 + 2] = p.z;
          }
        }
        // normals: per face from the grid, the edge points take the mean of the two faces
        for (let sd = 0; sd < 2; sd++) for (let j = 0; j <= NV; j++) for (let i = 0; i <= NS; i++) {
          const a = (sd * n + j * (NS + 1) + i) * 3, i0 = Math.max(i - 1, 0), i1 = Math.min(i + 1, NS), j0 = Math.max(j - 1, 0), j1 = Math.min(j + 1, NV);
          const l = (sd * n + j * (NS + 1) + i0) * 3, r2 = (sd * n + j * (NS + 1) + i1) * 3, up = (sd * n + j0 * (NS + 1) + i) * 3, dn = (sd * n + j1 * (NS + 1) + i) * 3;
          const ax = pos[r2] - pos[l], ay = pos[r2 + 1] - pos[l + 1], az2 = pos[r2 + 2] - pos[l + 2], tx = pos[dn] - pos[up], ty = pos[dn + 1] - pos[up + 1], tz = pos[dn + 2] - pos[up + 2];
          let nx = ay * tz - az2 * ty, ny = az2 * tx - ax * tz, nz = ax * ty - ay * tx;
          if (sd === 1) { nx = -nx; ny = -ny; nz = -nz; }
          const nl = Math.hypot(nx, ny, nz) || 1;
          nor[a] = nx / nl; nor[a + 1] = ny / nl; nor[a + 2] = nz / nl;
        }
        for (let a = 0; a < n; a++) if (twin[a] >= 0) {
          const b2 = twin[a] * 3, a3 = a * 3, nx = nor[a3] + nor[b2], ny = nor[a3 + 1] + nor[b2 + 1], nz = nor[a3 + 2] + nor[b2 + 2], nl = Math.hypot(nx, ny, nz);
          if (nl > 1e-6) { nor[a3] = nor[b2] = nx / nl; nor[a3 + 1] = nor[b2 + 1] = ny / nl; nor[a3 + 2] = nor[b2 + 2] = nz / nl; }
        }
        geo.attributes.position.needsUpdate = true; geo.attributes.normal.needsUpdate = true;
      };
      everyFrame(mesh, refresh);
    },
  };
};

// ===== the sword at the hip =====
/** what swordBelt leaves on the figure's torso group for `hilt` and `hiltWorld` */
type SwordMount = { pv: THREE.Group; put: (m: THREE.Object3D, y: number) => void; L: number; grip: THREE.Vector3; col: string; chape: string };
/** A sword scabbard at the hip of the drawing hand: it hangs low from a short strap, outside the leg and the skirt
 *  and under the hanging hand, angled back; dark lacquer with a metal throat and tip; its mouth is a dark opening
 *  (the hilt is another accessory: see `hilt`). side: 0 = the person's right hip (default: the rig draws with the
 *  right hand and cannot draw across the body), 1 = the left. It hangs plumb when its wearer leans, and when the
 *  body comes down (a low seat, a kneel) it tips back until it lies on the seat or the ground beside its wearer. */
export const swordBelt = (o: { col?: string; chape?: string; side?: 0 | 1 } = {}): Acc => {
  const col = o.col ?? "#4a2622", chape = o.chape ?? "#d9b45a", side = o.side ?? 0, s = side ? 1 : -1;
  const key = ["swordBelt", col, chape, side].join("|");
  return {
    name: "swordBelt", slots: ["waist"], key,
    outfit(c) {
      // the hanger: a strap from the sash in front down to the hip where the scabbard hangs
      const pts = bend(c.P(s * 30, SASH_T - SASH_H), c.P(s * 62, 0.27), c.P(s * 90, 0.12));
      c.line(pts, c.shade(col, 0.5), 15); c.line(pts, c.shade(col, 1.15), 8);
    },
    build(b) {
      const F0 = stand(b), L = 0.44, FL = 0.72, parts: THREE.Object3D[] = [], ink = 0.0062;
      // in its own frame the scabbard runs along y from the tip (0) to the mouth (L), an oval: thinner across x. It is
      // turned to hang down and back (36 deg from plumb), a little outward, its mouth facing up and forward
      // The mouth hangs 11.5 cm under the body's bottom and outside the skirt there: the pommel then stands just under
      // the hanging hand (the hand rests 2 to 6 cm above the body's bottom, 5.5 cm out from its side), so a resting or
      // swinging arm never meets the hilt (rig.qa.clear stays >= 0 in idle and in a walk)
      const dir = new THREE.Vector3(s * 0.12, -0.8, -0.585).normalize(), T = new THREE.Vector3(s * (b.rb + 0.058), -0.115, -0.012);
      const qt = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, -1, 0), dir);
      const put = (m: THREE.Object3D, y: number) => { m.quaternion.copy(qt); m.position.copy(T).addScaledVector(dir, L - y); parts.push(m); };
      const flat = (g: THREE.BufferGeometry, k: number) => { g.scale(k, 1, 1); return weld(g); };
      put(b.solid("body", flat(turned([[0, 0], [0.013, 0], [0.021, 0.04], [0.03, L], [0, L]], 0.008, 28), FL), { col, ink }), 0);
      // the tip and the throat: metal, 5 to 6 mm proud of the lacquer all round
      put(b.solid("body", flat(turned([[0, -0.012], [0.02, -0.012], [0.0275, 0.03], [0.0285, 0.085], [0, 0.085]], 0.008, 28), 0.82), { col: chape, ink }), 0);
      const lg = turned([[0, L - 0.065], [0.0345, L - 0.065], [0.0365, L + 0.006], [0, L + 0.006]], 0.005, 28), v = lg.userData.v as number[];
      const mouth = b.tex(8, 256, (g) => { g.fillStyle = "#ffffff"; g.fillRect(0, 0, 8, 256); g.fillStyle = "#2b2028"; g.fillRect(0, 0, 8, Math.round(256 * (1 - v[2]) * 0.8)); }, "mouth");
      put(b.solid("body", flat(lg, 0.8), { col: chape, map: mouth, ink }), 0);
      // the strap it hangs from: from inside the body's lower side down to the throat
      const A = new THREE.Vector3(s * 0.7 * b.rb, 0.085, 0), Bp = T.clone().addScaledVector(dir, 0.03), strap = b.solid("body", roundBox(0.021, A.distanceTo(Bp) + 0.02, 0.034, 0.5), { col: shade(col, 1.2), ink: 0.005 });
      strap.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), A.clone().sub(Bp).normalize()); strap.position.copy(A).add(Bp).multiplyScalar(0.5); parts.push(strap);
      const torso = parts[0].parent!, pv = new THREE.Group();
      pv.position.copy(A); torso.add(pv);
      for (const p of parts) { pv.add(p); p.position.sub(A); }
      // the tip against the pivot, at rest: what has to stay above the ground
      const tip = T.clone().addScaledVector(dir, L + 0.012).sub(A), Rt = Math.hypot(tip.y, tip.z), dl = Math.atan2(-tip.z, -tip.y);
      everyFrame(pv, () => {
        // plumb when the torso leans (as the kit's scabbard), then tipped back as far as the ground asks
        const e = torso.matrixWorld.elements, l = Math.hypot(e[8], e[9], e[10]) || 1, lean = clamp(Math.asin(clamp(e[9] / l, -1, 1)), -0.35, 0.6);
        const F = frameOf(torso, F0.hipY);
        let tipBack = 0;
        if (F) { const h = F.B.y + A.y - (F.rest + 0.04); tipBack = Math.max(0, Math.acos(clamp(h / Rt, -1, 1)) - dl); }
        pv.rotation.x = lean + tipBack;
      });
      b.keepOut(T.clone().addScaledVector(dir, 0.02), 0.03);
      b.keepOut(T.clone().addScaledVector(dir, 0.11), 0.028);
      b.keepOut(T.clone().addScaledVector(dir, -0.07), 0.018);
      const mount: SwordMount = { pv, put: (m, y) => { m.quaternion.copy(qt); m.position.copy(T).addScaledVector(dir, L - y).sub(A); pv.add(m); }, L, grip: T.clone().addScaledVector(dir, -0.062).sub(A), col, chape };
      torso.userData.hmSword = mount;
    },
  };
};
/** The hilt of the sword in the scabbard of `swordBelt` (which has to come before it in the figure's list): a small
 *  guard, a wrapped grip and a ring pommel standing in the scabbard's mouth. An accessory of its own, so that
 *  state.hide = ["hilt"] takes the sword out of the scabbard for a frame (the drawn sword is a world prop); the
 *  scabbard's mouth is then a dark opening. It takes no slot. */
export const hilt = (o: { grip?: string; metal?: string } = {}): Acc => ({
  name: "hilt", slots: [], key: ["hilt", o.grip ?? "", o.metal ?? ""].join("|"),
  build(b) {
    const probe = b.solid("body", new THREE.SphereGeometry(0.019, 18, 12), { col: o.metal ?? "#d9b45a", ink: 0.0062 });
    const M = probe.parent!.userData.hmSword as SwordMount | undefined;
    if (!M) throw new Error('garb: "hilt" needs swordBelt() before it in the accessory list');
    const metal = o.metal ?? M.chape, ink = 0.0062;
    M.put(probe, M.L + 0.112);                                         // the pommel
    const guard = b.solid("body", roundBox(0.024, 0.022, 0.1, 0.4), { col: metal, ink }); M.put(guard, M.L + 0.014);
    const grip = b.solid("body", turned([[0, 0], [0.0115, 0], [0.0105, 0.08], [0, 0.08]], 0.004, 20), { col: o.grip ?? DARK, ink: 0.005 }); M.put(grip, M.L + 0.02);
  },
});
/** where a hand grips the hilt of this figure's sword (world; the middle of the grip), or null without a swordBelt.
 *  Call it after the cast's update of this frame: pin the drawing hand there (state.hands) on the next solve, as the
 *  Arthur film did with scabbardMouth(). */
export const hiltWorld = (rig: Rig): THREE.Vector3 | null => {
  let M: SwordMount | undefined;
  for (const c of rig.group.children) if (c.userData.hmSword) M = c.userData.hmSword as SwordMount;
  if (!M) return null;
  M.pv.updateWorldMatrix(true, false);
  return M.pv.localToWorld(M.grip.clone());
};

/** A jade pendant (玉玦) at the belt: a green jade ring, hanging on a short red cord from the sash at the
 *  front of the hip (side 1 = the person's left, the default). It lies ON the skirt in every pose (it is placed each
 *  frame where the cloth is). It takes no slot; hide it (state.hide = ["pendant"]) while its wearer holds up the
 *  world prop. */
export const pendant = (o: { col?: string; cord?: string; side?: 0 | 1; az?: number } = {}): Acc => {
  const col = o.col ?? JADE, cord = o.cord ?? "#c8322c", s = (o.side ?? 1) ? 1 : -1, az0 = rad(o.az ?? 38) * s;
  return {
    name: "pendant", slots: [], key: ["pendant", col, cord, s, az0].join("|"),
    build(b) {
      const F0 = stand(b), g = new THREE.Group(), ringG = new THREE.TorusGeometry(0.026, 0.0105, 10, 22);
      const disc3 = b.solid("body", weld(ringG), { col, ink: 0.0055 }), torso = disc3.parent!, root = torso.parent!;
      const cordM = b.solid("body", new THREE.CylinderGeometry(0.0055, 0.0055, 0.07, 8, 1), { col: cord, ink: 0.004 });
      root.add(g); g.add(disc3, cordM); disc3.position.set(0, -0.098, 0); cordM.position.set(0, -0.037, 0);
      const ps: Push[] = [], R0 = b.rb + 0.014, drop = SASH_T * b.Ht - 0.02;
      everyFrame(g, () => {
        const F = frameOf(torso, F0.hipY);
        if (!F) return;
        // it hangs from the sash: its top a little under the sash, never lower than a hand above what the body rests on
        const yaw = Math.atan2(F.fz.x, F.fz.z) + az0, top = Math.max(F.B.y + drop, F.ground + 0.14), y = top - 0.098;
        pushesAt(F, F.B.x, F.B.z, y, R0, 0.024, ps);
        const lowR = pushed(ps, yaw, R0), upR = b.bodyR(clamp((top - F.B.y) / b.Ht, 0.05, 0.95), (az0 * 180) / Math.PI), r = Math.max(lowR, upR) + 0.016;
        g.position.set(F.B.x + Math.sin(yaw) * r, top, F.B.z + Math.cos(yaw) * r);
        g.rotation.set(0, yaw, 0);
      });
    },
  };
};

/** A message at the belt (the informer's): a small roll of bamboo slips (简牍) tied with a cord, tucked slantwise
 *  over the sash at the front of the body, a little to the person's left (side 1, the default; 0 = the right). It is
 *  fixed to the body (it leans with it), pale against the armour, and the arms stay clear of it. It takes no slot;
 *  state.hide = ["scroll"] while the wearer hands the world prop over. len = its length (m, default 0.17). */
export const scroll = (o: { col?: string; cord?: string; side?: 0 | 1; az?: number; len?: number; lean?: number } = {}): Acc => {
  const col = o.col ?? "#f0e2b8", cord = o.cord ?? "#c8322c", s = (o.side ?? 1) ? 1 : -1, azD = (o.az ?? 30) * s, L = o.len ?? 0.17, lean = rad(o.lean ?? 52) * s;
  return {
    name: "scroll", slots: [], key: ["scroll", col, cord, azD, L, lean].join("|"),
    build(b) {
      const r = 0.023, geo = turned([[0, 0], [r, 0], [r, L], [0, L]], 0.006, 20);
      geo.translate(0, -L / 2, 0);
      // its map: v runs along the roll (the lathe's uv: the flat ends take the first and last tenth), u round it.
      // The slips' edges run along it, the cord goes round its middle, its two ends are the slips' darker end grain
      const map = b.tex(64, 256, (g) => {
        g.fillStyle = "#ffffff"; g.fillRect(0, 0, 64, 256);
        g.fillStyle = shade(col, 0.8); for (let x = 0; x < 64; x += 8) g.fillRect(x, 0, 1.6, 256);
        g.fillStyle = shade(col, 0.62); g.fillRect(0, 0, 64, 30); g.fillRect(0, 226, 64, 30);
        g.fillStyle = cord; g.fillRect(0, 116, 64, 24);
        g.fillStyle = shade(cord, 0.5); g.fillRect(0, 114, 64, 3); g.fillRect(0, 139, 64, 3);
      }, `scroll|${col}|${cord}`);
      const m = b.solid("body", geo, { col, map, ink: 0.006 });
      // on the body's surface at the sash, lying in the surface there (turned to the azimuth, then leaned in it)
      const az = rad(azD), t = SASH_T + 0.03, rr = b.bodyR(t, azD) + r * 0.72;
      m.position.set(Math.sin(az) * rr, t * b.Ht, Math.cos(az) * rr);
      m.rotation.set(0, az, 0); m.rotateZ(-lean);
      for (const k of [-0.36, 0, 0.36]) b.keepOut(new THREE.Vector3(0, k * L, 0).applyEuler(m.rotation).add(m.position), r + 0.012);
    },
  };
};

// ===== the face =====
/** Tells every figure of the cast where its drawn face points, each frame: wraps the cast's update once, so that
 *  after it each figure's group carries userData.hmFaceYaw (the rig's own faceYaw: the face is drawn within 12
 *  degrees of the camera while the head turns up to 45). A long beard's 3D part reads it and stays under the drawn
 *  face. people.ts addPerson calls this; a sheet that adds figures with rc.add calls it itself. */
export const trackFace = (rc: { update: (cam: THREE.Camera, renderH?: number) => void; figures: Rig[] }) => {
  const tag = rc as unknown as { hmTracked?: boolean };
  if (tag.hmTracked) return;
  tag.hmTracked = true;
  const base = rc.update.bind(rc), cp = new THREE.Vector3();
  rc.update = (cam: THREE.Camera, renderH?: number) => {
    base(cam, renderH);
    cam.getWorldPosition(cp);
    for (const f of rc.figures) {
      // hmFaceOn = how much of the drawn face shows (the kit's own rule: it fades between 46 and 72 degrees from the
      // camera when the head turns away, and stays on under an overhead camera)
      const U = f.group.userData, h = f.headWorld(), dx = cp.x - h.x, dz = cp.z - h.z;
      const follow = smooth((Math.hypot(dx, dz) / Math.max(Math.abs(cp.y - (h.y - 0.25)), 1e-3) - 0.35) / 0.6);
      U.hmFaceYaw = f.faceYaw;
      U.hmFaceOn = 1 - follow * smooth((Math.abs(wrapA(f.faceYaw - Math.atan2(dx, dz))) - rad(46)) / rad(26));
    }
  };
};

/** the hanging part of a long beard: a tapered tongue of hair from inside the chin down over the chest. Head units
 *  through toM: it starts deep inside the head, comes out under the chin, is `wide` at its fullest just below the
 *  chin and ends in a blunt point `len` below the head's middle. uv: u round it (0.25 = its front), v along it. */
const beardGeo = (toM: (v: THREE.Vector3) => THREE.Vector3, len: number, wide: number, deep: number) => {
  const NS = 22, NC = 16, pos: number[] = [], uv: number[] = [], idx: number[] = [], v = new THREE.Vector3();
  // its middle line: from inside the head, forward and down out of the chin, then straight down in front of the chest
  const y0 = -0.5, mid = (t: number): [number, number] => [lerp(y0, -len, t), 0.42 + 0.36 * smooth(t / 0.3) - 0.1 * smooth((t - 0.45) / 0.55)];
  const [ya, za] = mid(0), [yb, zb] = mid(1);
  toM(v.set(0, ya, za)); pos.push(v.x, v.y, v.z); uv.push(0.5, 0);
  for (let i = 1; i < NS; i++) {
    const t = i / NS, [y, z] = mid(t);
    // full a third of the way down, then tapering to the tip (a little wavy: locks of hair)
    const k = smooth(t / 0.3) * (1 - 0.82 * smooth((t - 0.32) / 0.68) ** 1.1), w = (wide / 2) * k * (1 + 0.05 * Math.sin(t * 15)), d = (deep / 2) * (0.5 + 0.5 * k);
    for (let j = 0; j < NC; j++) { const p = (j / NC) * Math.PI * 2; toM(v.set(w * Math.cos(p), y, z + d * Math.sin(p))); pos.push(v.x, v.y, v.z); uv.push(j / NC, t); }
  }
  toM(v.set(0, yb, zb)); pos.push(v.x, v.y, v.z); uv.push(0.5, 1);
  const R = (i: number, j: number) => 1 + (i - 1) * NC + (j % NC), end = 1 + (NS - 1) * NC;
  for (let j = 0; j < NC; j++) { idx.push(0, R(1, j + 1), R(1, j)); idx.push(end, R(NS - 1, j), R(NS - 1, j + 1)); }
  for (let i = 1; i < NS - 1; i++) for (let j = 0; j < NC; j++) idx.push(R(i, j), R(i, j + 1), R(i + 1, j), R(i, j + 1), R(i + 1, j + 1), R(i + 1, j));
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  return weld(g);
};

/** A thin drooping moustache (八字胡), drawn on the face in ink: from under the nose each half runs out past the
 *  corner of the mouth and hangs down beside it to below the mouth's level (the kit's "pencil" stays above the mouth;
 *  its "walrus" is heavy). The mark of a sly man. slot lip (the mouth sits lower under it, as under the kit's
 *  moustaches). len = how far it hangs (1 = default), col = default the ink. */
export const whiskers = (o: { col?: string; len?: number } = {}): Acc => {
  const len = o.len ?? 1;
  return {
    name: "whiskers", slots: ["lip"], key: `droop|${o.col ?? ""}|${len}`,
    face(f) {
      const [mx] = f.mouth, y = f.lip + f.jit(100, 0.4), q = f.quad, col = o.col ?? f.INK, d = 15 * len;
      // one half as a closed outline: along its upper edge out to the bend, down the outside to the tip, and back
      const half = (s: number): P2[] => {
        const X = (x: number) => mx + s * x;
        return [...q([X(1.4), y - 1.9], [X(10.5), y - 3], [X(15.6), y + 3.4], 10), ...q([X(15.6), y + 3.4], [X(18.6), y + 4 + d * 0.55], [X(17.2), y + 4.5 + d], 10).slice(1),
          ...q([X(17.2), y + 4.5 + d], [X(15.2), y + 4 + d * 0.5], [X(12.4), y + 5.6], 10).slice(1), ...q([X(12.4), y + 5.6], [X(8.5), y + 2.4], [X(1.4), y + 2.5], 10).slice(1)];
      };
      f.turned(mx, y, f.jit(101, 2), () => { for (const s of [-1, 1]) f.fill(half(s), col, 0); });
    },
  };
};

type BeardKind = "full" | "short" | "fork" | "stubble" | "goatee" | "long";
/** A beard, drawn on the face under the mouth and the other features (the mouth is drawn on top of it and every
 *  expression keeps working). full = over the jaw and the chin up to the cheeks and under the nose; short = trimmed
 *  along the jaw; fork = a full beard that ends in two points; stubble = a shadow of dots; goatee = a tuft on the
 *  chin only; long = a full beard, and in 3D a long tongue of beard that hangs from the chin over the chest (len =
 *  how far below the head's middle it ends, in head radii, default 2.0; wide = its width, default 0.95). col: default
 *  the look's hair colour. A beard as dark as the ink goes round the mouth instead (the mouth stays on bare skin,
 *  where its line reads). With a moustache of the kit (slot lip) the mouth sits lower, and the beard goes with it.
 *  The long beard's 3D part belongs to the head (it is drawn over the figure's own body and arms) and turns about
 *  the head's upright axis to stay under the DRAWN face (see trackFace), and it is gone with the face in a back
 *  view; it breaks the kit's "nothing 3D in front of the face" rule on purpose, below the mouth only:
 *  rig.accRules() reports it. */
export const beard = (o: { col?: string; kind?: BeardKind; len?: number; wide?: number } = {}): Acc => {
  const kind = o.kind ?? "full", len = o.len ?? 2.0, wide = o.wide ?? 0.95;
  return {
    name: "beard", slots: ["chin"], key: `${kind}|${o.col ?? ""}|${len}|${wide}`,
    faceUnder(f) {
      const col = o.col ?? f.look.hairCol, my = f.mouth[1], q = f.quad, dark = luma(col) < 0.3, top = my - 7.6, strand = dark ? shade(col, 1.7) : shade(col, 0.74);
      // the upper edge of a full beard, from the left temple to the right: a sideburn down the side of the head, a dip
      // under the cheek, then level above the mouth, which is drawn on the beard. A beard as dark as the ink goes
      // down round the mouth instead: the mouth (and a moustache) stay on bare skin, where they read
      const cheek = Math.max(top + 4.5, 15.5), in0 = top + (dark ? 3 : 0);
      const side = (s: number): P2[] => [[s * 62, -27], [s * 43, -26], ...q([s * 43.5, -8], [s * 45, cheek + 2], [s * 34, cheek], 8), ...q([s * 34, cheek], [s * 25, cheek - 1.5], [s * 19.5, in0], 6).slice(1)];
      const mid: P2[] = dark ? [...q([-19.5, in0], [-20, my + 9.5], [0, my + 10], 8).slice(1), ...q([0, my + 10], [20, my + 9.5], [19.5, in0], 8).slice(1, -1)] : [];
      const upper: P2[] = [...side(-1), ...mid, ...side(1).reverse()];
      if (kind === "full" || kind === "long") f.fill([...upper, [62, 20], [50, 70], [-50, 70], [-62, 20]], col, 1.6);
      else if (kind === "fork") f.fill([...upper, ...q([56, 6], [40, 24], [14.5, 43.5], 10), ...q([14.5, 43.5], [9, 37], [0, my + 11.5], 6).slice(1), ...q([0, my + 11.5], [-9, 37], [-14.5, 43.5], 6).slice(1), ...q([-14.5, 43.5], [-40, 24], [-56, 6], 10).slice(1)], col, 1.6);
      // (a band up the jaw to the ears, a hand wide at the chin: lower than that it reads as a chin strap, not as a beard)
      else if (kind === "short") f.fill([...q([-58, -8], [-44, my + 6], [0, my + 9.5], 14), ...q([0, my + 9.5], [44, my + 6], [58, -8], 14).slice(1), [62, 30], [40, 70], [-40, 70], [-62, 30]], col, 1.6);
      // a tuft under the lower lip, down over the chin to the head's outline
      // (fullest just under its top, then drawn in to a blunt point at the chin: a block of one width reads as a patch)
      else if (kind === "goatee") f.fill([...q([-8.5, my + 8], [0, my + 5.5], [8.5, my + 8], 6), ...q([8.5, my + 8], [13.5, my + 17], [3.2, 70], 8).slice(1), [-3.2, 70], ...q([-3.2, 70], [-13.5, my + 17], [-8.5, my + 8], 8).slice(1)], col, 1.6);
      else {
        // stubble: a faint shadow over the jaw and rows of dots on it
        const g = f.g, area: P2[] = [...upper, [62, 20], [50, 70], [-50, 70], [-62, 20]];
        g.save(); g.globalAlpha = 0.16; f.fill(area, col, 0); g.restore();
        for (let j = 0, k = 0; j < 7; j++) for (let i = -6; i <= 6; i++, k++) {
          const x = i * 7.2 + (j % 2) * 3.6 + f.jit(200 + k, 1.6), y = top + 2.5 + j * 5.6 + f.jit(400 + k, 1.3), e = (Math.abs(x) - 21) / 20, yTopAt = Math.abs(x) < 21 ? top : top - 9 * e * e - 6 * e;
          if (y < yTopAt + 2 || Math.hypot(x, y) > 47) continue;
          f.fill(f.arc(x, y, 1.05, 1.05, 0, 360, 8), col, 0);
        }
        return;
      }
      // a few strands
      if (kind === "full" || kind === "fork" || kind === "long") for (const [x, y, dx] of [[-30, my + 9, 2.5], [-12, my + 15.5, 1], [12, my + 15.5, -1], [30, my + 9, -2.5]] as [number, number, number][]) f.line(q([x, y], [x + dx, y + 4], [x + dx * 1.6, y + 7.5], 5), 1.5, strand);
    },
    build: kind === "long" ? (b) => {
      const col = o.col ?? b.look.hairCol, pale = luma(col) > 0.6;
      // its map: the beard's colour with a few long strands down it
      const map = b.tex(128, 256, (g) => {
        g.fillStyle = col; g.fillRect(0, 0, 128, 256);
        g.strokeStyle = shade(col, pale ? 0.8 : 1.5); g.lineWidth = 3.2; g.lineCap = "round";
        for (const [u, y0, y1] of [[0.12, 70, 190], [0.2, 100, 236], [0.25, 60, 170], [0.3, 110, 240], [0.38, 80, 200]] as [number, number, number][]) { g.beginPath(); g.moveTo(u * 128, y0); g.lineTo(u * 128 + 2, y1); g.stroke(); }
      }, `beard|${col}`);
      const mesh = b.solid("head", beardGeo(b.toM, len, wide, 0.42), { map, paint: "hair", ink: 0.0085 });
      // it hangs from a pivot at the head's middle that turns about the head's upright axis toward the drawn face
      const head = mesh.parent!, pv = new THREE.Group();
      head.add(pv); pv.add(mesh);
      // ... and goes with the face in a back view: as the face fades the beard draws back into the head and is gone
      // (a head part is drawn over its figure's own body, so from behind it would show through the back)
      everyFrame(pv, () => {
        const root = head.parent?.parent, fy = root ? (root.userData.hmFaceYaw as number | undefined) : undefined;
        if (fy === undefined) { pv.rotation.y = 0; pv.visible = true; pv.scale.set(1, 1, 1); return; }
        const e = head.matrixWorld.elements, on = smooth((root!.userData.hmFaceOn as number | undefined) ?? 1);
        pv.rotation.y = clamp(wrapA(fy - Math.atan2(e[8], e[10])), -rad(50), rad(50));
        pv.visible = on > 0.02; pv.scale.set(0.3 + 0.7 * on, 0.45 + 0.55 * on, 0.3 + 0.7 * on);
      });
    } : undefined,
  };
};
