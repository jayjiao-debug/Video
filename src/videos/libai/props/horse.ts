// THE COURIER'S HORSE of the Su film (PLAN 4; WP3): a COPY of the kit's src/kit/props/horse.ts (read only) with one
// change: the walk has an AMOUNT (put({ pose: "walk", amount })), 1 = the full four-beat walk, 0 = standing square,
// so a horse can STOP smoothly (ease amount 1 -> 0 over half a second while t runs on: the legs swing less and less
// and the body stays on its hooves, because the lift is worked out from the same legs). horseSeat takes the same
// amount. Everything else is the kit's, unchanged:
// THE HORSE of the Hongmen film: a chunky toon horse in the figures' style (round barrel, big head, dot eyes, short
// legs), built from the prop kit (its own back-face ink hull, layer NOINK). One build, four coats:
//   "horse"   Liu Bang's mount: bay, cream saddle cloth (a pad saddle with two low rolls: NO STIRRUPS in 206 BC)
//   "horse1"  a rider's mount: grey, cream saddle cloth      "horse3"  a rider's mount: dun, red saddle cloth
//   "horse2"  the chariot's horse: dark brown, a yoke bar over the withers, no saddle
// Origin = on the ground under its middle, head toward +z, 1.5 m long, 0.5 m wide, back 0.965 m, ears 1.56 m.
// (Short legs and a big head on purpose: the figures are big heads on small bodies.)
// POSE (put(at, { facing, pose, t })): "stand" (default; the tail and the head move a little with t), "walk" (a
// four-beat walk, 1.5 strides a second), "gallop" (the toon gallop: fore and hind legs stretch apart and gather,
// 2.5 strides a second, the body rocks and leaves the ground while stretched). A pure function of t.
// THE RIDER is a seated rig figure: seat.top = horseSeat(at, facing, pose, t) every frame (it rides the bob and the
// rock), facing = the horse's. The rig cannot straddle: its seat is 10 cm INSIDE the horse's back, so that the
// figure's own legs (they point forward along the back) are hidden in the barrel, as a kneeling figure's shins are
// hidden in the floor; the HORSE draws the rider's two legs hanging at its sides: put(at, { rider: "<robe colour>" }).
// The lowest hoof is always exactly on the ground (in the gallop the hooves leave it while the legs are stretched).
import * as THREE from "three";
import { C, V, Part, limb, ball, paint, NOINK, type Kit } from "../../../kit/props/kit";
/** what the horse's hook reads of a put */
export type HorseO = { t?: number; pose?: string; rider?: string; amount?: number };
export type HorseHook = (o: HorseO, g: THREE.Group) => void;

/** world sizes (m): back = the top of the bare back, cloth = the saddle cloth's top, seatY / seatZ = the rider's seat.top
 *  (inside the back), ears = the highest point, nose / tail = the ends along z */
export const HORSE = { len: 1.5, w: 0.5, back: 0.965, cloth: 0.985, seatY: 0.88, seatZ: -0.06, ears: 1.56, nose: 0.98, tail: -0.78 };
export type Coat = { body: string; mane: string; tack: "saddle" | "yoke"; cloth?: string };
export const COATS: Record<"horse" | "horse1" | "horse2" | "horse3", Coat> = {
  horse: { body: "#a2643e", mane: "#3d3034", tack: "saddle", cloth: C.cream },
  horse1: { body: "#bcb7b1", mane: "#5f5b62", tack: "saddle", cloth: C.cream },
  horse2: { body: "#75503c", mane: "#362b2f", tack: "yoke" },
  horse3: { body: "#cfab72", mane: "#4e3d33", tack: "saddle", cloth: C.redDeep },
};
// MODEL coordinates: the legs' pivots are at y = PIVY inside the barrel; the legs are LEG long, so the model stands
// LIFT above the ground and the whole horse is set down by LIFT (world y = model y - LIFT)
const TAU = Math.PI * 2, CB = V(0, 0.84, -0.05), PIVY = 0.74, LEG = 0.62, LIFT = PIVY - LEG, SEAT_M = 1.0, HOOF_R = 0.068;   // (HOOF_R = the hoof disc's bottom radius, below)
/** the legs' pivots: fore left, fore right, hind left, hind right (left = +x) */
const PIV = [V(0.125, PIVY, 0.27), V(-0.125, PIVY, 0.27), V(0.125, PIVY, -0.37), V(-0.125, PIVY, -0.37)];

/** the motion of a pose at time t (s): each leg's swing about its pivot (rad, + = the hoof goes back), the body's
 *  rock about its middle (rad, + = nose down) and its lift (m) so that the lowest hoof stands on the ground */
export const horseGait = (pose: string | undefined, t: number, amount = 1) => {
  const legs = [0, 0, 0, 0];
  let pitch = 0, air = 0, nod = 0.02 * Math.sin(t * 0.9), tail = 0.07 * Math.sin(t * 1.3);
  if (pose === "walk") {
    const ph = t * 1.5, off = [0.25, 0.75, 0, 0.5];
    const a = Math.max(0, Math.min(1, amount));
    for (let i = 0; i < 4; i++) legs[i] = 0.34 * a * Math.sin(TAU * (ph + off[i]));
    nod = (0.05 * a + 0.02 * (1 - a)) * Math.sin(TAU * 2 * ph); tail = 0.14 * Math.sin(TAU * ph);
  } else if (pose === "gallop") {
    const ph = t * 2.5, c = Math.cos(TAU * ph);
    // stretched (c = 1): the fore legs reach forward, the hind legs back, the horse is in the air; gathered (c = -1):
    // the legs come under the body but never cross (fore and hind hooves stay 0.2 m apart)
    legs[0] = -0.22 - 0.52 * c; legs[1] = -0.22 - 0.52 * Math.cos(TAU * (ph - 0.06));
    legs[2] = 0.22 + 0.52 * Math.cos(TAU * (ph - 0.03)); legs[3] = 0.22 + 0.52 * Math.cos(TAU * (ph - 0.09));
    pitch = -0.06 * Math.sin(TAU * ph); air = -0.045 - 0.015 * c; nod = 0.08 * Math.sin(TAU * ph + 0.6); tail = -0.5 + 0.12 * Math.sin(TAU * ph);
  }
  // the lowest point of each leg is its hoof's RIM, not the leg's end: the hoof is a disc of radius HOOF_R square to
  // the leg, so tilted by the leg's swing plus the rock its rim hangs HOOF_R |sin| below the end (2.4 cm in the
  // gallop: the hooves went into the ground; 2026-11-12, measured by the clearance checker)
  let low = Infinity;
  for (let i = 0; i < 4; i++) {
    const p = PIV[i], dy = p.y - LEG * Math.cos(legs[i]) - CB.y, dz = p.z - LEG * Math.sin(legs[i]) - CB.z;
    low = Math.min(low, CB.y + dy * Math.cos(pitch) - dz * Math.sin(pitch) - HOOF_R * Math.abs(Math.sin(legs[i] + pitch)));
  }
  // stand / walk: the lowest hoof is on the ground. Gallop: the body keeps about its height (`air` is its lift then) and
  // the hooves leave the ground while the legs are stretched; never below the ground
  return { legs, pitch, bob: pose === "gallop" ? Math.max(LIFT - low, air) : LIFT - low, nod, tail };
};
/** where a rider's seat top is in the world (the rig's seat.top) on a horse put at `at` with this facing, pose, t and scale */
export const horseSeat = (at: THREE.Vector3, facing = 0, pose?: string, t = 0, scale = 1, amount = 1) => {
  const G = horseGait(pose, t, amount), dy = SEAT_M - CB.y, dz = HORSE.seatZ - CB.z;
  const y = (CB.y - LIFT + G.bob + dy * Math.cos(G.pitch) - dz * Math.sin(G.pitch)) * scale, z = (CB.z + dy * Math.sin(G.pitch) + dz * Math.cos(G.pitch)) * scale;
  return V(at.x + Math.sin(facing) * z, at.y + y, at.z + Math.cos(facing) * z);
};

export const horse = (K: Kit, g: THREE.Group, coat: Coat): HorseHook => {
  const body = K.flat(coat.body, { rough: 0.8 }), mane = K.flat(coat.mane, { rough: 0.85 }), hoof = K.flat("#3b3138", { rough: 0.6 }), INK = 0.014;
  // everything that rocks: rock (at the body's middle) > all (back at the origin)
  const base = new THREE.Group(), rock = new THREE.Group(), all = new THREE.Group(); base.position.y = -LIFT; rock.position.copy(CB); all.position.copy(CB).negate(); rock.add(all); base.add(rock); g.add(base);
  // ---- the trunk
  const T = new Part(K);
  T.add(body, new THREE.CapsuleGeometry(0.245, 0.56, 8, 20).rotateX(Math.PI / 2).scale(0.94, 1, 1).translate(0, CB.y, CB.z), INK);
  if (coat.tack === "saddle") {
    // the saddle cloth: a slab bent over the back (its inner face is inside the barrel), two low rolls before and behind the seat
    const sh = new THREE.Shape(), R1 = 0.263, R0 = 0.2, A = 1.36, n = 14;
    for (let i = 0; i <= n; i++) { const a = -A + (2 * A * i) / n, x = Math.sin(a) * R1 * 0.94, y = Math.cos(a) * R1; if (i) sh.lineTo(x, y); else sh.moveTo(x, y); }
    for (let i = n; i >= 0; i--) { const a = -A + (2 * A * i) / n; sh.lineTo(Math.sin(a) * R0 * 0.94, Math.cos(a) * R0); }
    T.add(K.flat(coat.cloth ?? C.red, { rough: 0.85 }), new THREE.ExtrudeGeometry(sh, { depth: 0.5, bevelEnabled: false, curveSegments: 1 }).translate(0, CB.y, -0.31), 0.009);
    const roll = K.flat("#8a5a34", { rough: 0.8 });
    T.add(roll, ball(V(0, 1.1, 0.165), 0.055, [2.5, 0.85, 0.8], 12), 0.008); T.add(roll, ball(V(0, 1.1, -0.285), 0.055, [2.5, 0.95, 0.8], 12), 0.008);
  } else {
    const wood = K.flat(C.wood, { rough: 0.8 });
    T.add(wood, limb(V(-0.36, 1.135, 0.25), V(0.36, 1.135, 0.25), 0.036, 0.036, 10), 0.006);                     // the yoke bar: its ends reach toward the chariot's shafts
    for (const s of [-1, 1]) T.add(wood, limb(V(s * 0.15, 1.13, 0.25), V(s * 0.215, 0.86, 0.3), 0.03, 0.03, 8), 0.005);
  }
  T.into(all, "horse.trunk");
  // ---- the rider's legs (shown by put's `rider` colour): a thigh and shin in one piece down each side, a dark boot; no stirrup
  const riderM = K.M.paint({ color: "#c8322c", roughness: 0.85, specular: 0.25, envMapIntensity: 0.55 }) as THREE.MeshPhysicalMaterial, riderG = new THREE.Group(); riderG.visible = false; all.add(riderG);
  const RL = new Part(K);
  for (const s of [-1, 1]) {
    RL.add(riderM, limb(V(s * 0.2, 1.06, -0.04), V(s * 0.285, 0.7, 0.07), 0.07, 0.05, 10), 0.011);
    RL.add(K.flat("#3b3138", { rough: 0.6 }), ball(V(s * 0.29, 0.655, 0.095), 0.055, [0.9, 0.85, 1.5], 10), 0.011);
  }
  RL.into(riderG, "horse.rider");
  // ---- neck and head (they nod about the chest)
  const neck = new THREE.Group(), NP = V(0, 0.9, 0.36); neck.position.copy(NP); all.add(neck);
  const N = new Part(K), rel = (x: number, y: number, z: number) => V(x, y - NP.y, z - NP.z);
  const h0 = rel(0, 1.47, 0.585), h1 = rel(0, 1.19, 0.875), hp = (s: number) => h0.clone().lerp(h1, s), hr = (s: number) => 0.148 - 0.04 * s;
  N.add(body, limb(rel(0, 0.86, 0.34), rel(0, 1.4, 0.6), 0.19, 0.115, 14), INK); N.add(body, ball(rel(0, 0.86, 0.34), 0.19, [1, 1, 1], 16), INK);   // (a round chest under the neck's foot)
  N.add(body, limb(h0, h1, hr(0), hr(1), 14), INK); N.add(body, ball(h0, hr(0), [1, 1, 1], 16), INK); N.add(body, ball(h1, hr(1), [1, 1, 1], 14), INK);
  for (const s of [-1, 1]) {
    N.add(body, new THREE.ConeGeometry(0.046, 0.13, 8).rotateZ(-s * 0.25).translate(s * 0.08, 1.625 - NP.y, 0.555 - NP.z), 0.009);
    N.add(K.flat("#2a2630", { rough: 0.4 }), ball(hp(0.25).add(V(s * (hr(0.25) - 0.012), 0.012, 0)), 0.03, [1, 1, 1], 10), 0);             // a dot eye, as the figures'
  }
  N.add(mane, limb(rel(0, 1.58, 0.49), rel(0, 0.98, 0.2), 0.05, 0.062, 8).scale(0.6, 1, 1), 0.009);                                       // the mane: a dark crest down the neck
  N.add(mane, ball(rel(0, 1.595, 0.635), 0.056, [0.9, 0.7, 1.1], 10), 0.009);                                                             // the forelock
  N.add(K.flat(C.red, { rough: 0.8 }), limb(hp(0.6), hp(0.73), hr(0.6) + 0.008, hr(0.73) + 0.008, 14), 0);                                // the red noseband
  N.into(neck, "horse.neck");
  // ---- the tail (it swings about its root)
  const tail = new THREE.Group(); tail.position.set(0, 1.0, -0.56); all.add(tail);
  new Part(K).add(mane, new THREE.LatheGeometry([[0, 0], [0.045, 0.06], [0.07, 0.25], [0.05, 0.42], [0, 0.5]].map(([r, y]) => new THREE.Vector2(r, y)), 10).rotateX(Math.PI), 0.011).into(tail, "horse.tail");
  // ---- the four legs (each swings about its pivot inside the barrel)
  const legs = PIV.map((p, i) => {
    const lg = new THREE.Group(); lg.position.copy(p); all.add(lg);
    const Lp = new Part(K);
    Lp.add(body, limb(V(0, 0.07, 0), V(0, -LEG + 0.08, 0), i < 2 ? 0.085 : 0.097, 0.058, 10), INK);
    Lp.add(hoof, new THREE.CylinderGeometry(0.06, HOOF_R, 0.095, 10).translate(0, -LEG + 0.0475, 0), 0.011);
    Lp.into(lg, "horse.leg");
    return lg;
  });
  // ---- a soft shadow on the ground (it stays on the ground while the body rocks)
  const blobTex = paint(64, 64, (c, w, h) => { const gr = c.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); gr.addColorStop(0, "rgba(20,14,30,0.42)"); gr.addColorStop(0.6, "rgba(20,14,30,0.26)"); gr.addColorStop(1, "rgba(20,14,30,0)"); c.fillStyle = gr; c.fillRect(0, 0, w, h); });
  const blob = new THREE.Mesh(new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: blobTex, transparent: true, depthWrite: false }));
  blob.scale.set(0.95, 1, 1.75); blob.position.set(0, 0.012, -0.05); blob.layers.set(NOINK); blob.renderOrder = 1; blob.name = "horse.blob"; g.add(blob);
  return ({ t = 0, pose, rider, amount }) => {
    const G = horseGait(pose, t, amount ?? 1);
    riderG.visible = !!rider; if (rider) riderM.color.set(rider);
    rock.position.set(CB.x, CB.y + G.bob, CB.z); rock.rotation.set(G.pitch, 0, 0);
    for (let i = 0; i < 4; i++) legs[i].rotation.set(G.legs[i], 0, 0);
    neck.rotation.set(G.nod, 0, 0); tail.rotation.set(0.42 - G.tail, 0, 0);
    const k = 1 - Math.min(0.5, Math.max(0, G.bob - 0.0) * 3); blob.scale.set(0.95 * k, 1, 1.75 * k);
  };
};
