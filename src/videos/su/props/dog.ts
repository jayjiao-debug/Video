// THE YARD DOG of the Su film (PLAN 2 "DOG", 4; WP3): a small yellow village dog, NOT a rig figure: a prop in the kit's
// toon prop style (src/kit/props/kit.ts: merged meshes + ONE black hull outline per part, layer NOINK, the place's
// paint), animated by a PURE pose function of the put's options (nothing kept between frames):
//   w.prop("dog").put(YARD.dog, { rot, pose, t, lookAt, from, k })
//     pose     "idle"   standing, breathing, the tail wagging
//              "sniff"  the nose down to the ground in front of its forepaws, sniffing (a quick small bob), the tail slow
//              "lookUp" the head up toward `lookAt` (a world point: his face), the ears laid BACK, the head TILTED
//                       (the betrayed look), the tail low and still
//              "sit"    sitting up (the rump down, the hind legs folded), the head up toward lookAt (or ahead)
//              "walk"   a trot of the four legs in diagonal pairs (2 steps a second), the body bobbing, the tail wagging
//              "lie"    lying down by the bench: the belly on the ground, the forelegs out in front, the head up
//     t        seconds (time from the film frame: f / FPS)
//     lookAt   a world point the head turns to (lookUp, sit, idle): yaw +-70 deg, pitch -40..+55 deg at most
//     from, k  a blend: the pose `from` -> `pose` by k (0..1, ease it in the shot): sniff -> lookUp over 6 frames
// Origin = on the ground under the middle of its body; it faces +z (rot = its yaw, as a figure's facing).
// Sizes: DOG (0.56 m nose to rump, the back 0.3 m up, the head's top 0.42 m standing, 0.5 m sitting).
import * as THREE from "three";
import { V, Part, limb, ball, paint, type Kit } from "../../../kit/props/kit";

/** the dog's sizes (m): length nose to rump, the back's height, the head's top standing / sitting, its width */
export const DOG = { len: 0.56, back: 0.3, head: 0.42, headSit: 0.5, w: 0.2 } as const;
export type DogPose = "idle" | "sniff" | "lookUp" | "sit" | "walk" | "lie";
export type DogO = { pose?: string; t?: number; lookAt?: THREE.Vector3 | [number, number, number]; from?: string; k?: number };
/** HOW HIGH TO PUT THE DOG for a pose (m added to the ground's y): the poses do not all stand on the origin (measured
 *  with the clearance checker by segB, 2026-11-13: "lie" sinks 4.8 cm into the ground, "sit" floats 4.4 cm over it,
 *  "sniff" puts the nose 1.3 cm in). The geometry is left as it is (segB already puts the dog at these heights); a
 *  new shot puts it at ground + dogGroundY(pose, from, k). WP3-fix, 2026-11-14 */
export const DOG_GROUND: Record<DogPose, number> = { idle: 0, walk: 0, lookUp: 0, lie: 0.048, sit: -0.044, sniff: 0.013 };
/** the dog's height over the ground for a put with { pose, from, k } (blended like the pose: segB's DOG_Y) */
export const dogGroundY = (pose: string, from?: string, k = 1) => {
  const y = (p?: string) => DOG_GROUND[(p ?? pose) as DogPose] ?? 0;
  return y(from) + (y(pose) - y(from)) * Math.max(0, Math.min(1, k));
};
type Q = {
  /** body: lift (m), pitch (rad, + = nose up) */ y: number; pitch: number;
  /** neck: pitch (+ = up), yaw (+ = to its left); the head's roll (+ = tilts to its left) */ neck: number; yaw: number; roll: number;
  /** ears back 0..1; tail: up (rad), wag (rad) */ ear: number; tailUp: number; wag: number;
  /** legs: fore L, fore R, hind L, hind R swing (+ = the paw goes back); hind fold 0..1 (sit / lie), fore fold 0..1 (lie) */
  legs: [number, number, number, number]; hindFold: number; foreFold: number;
};
const TAU = Math.PI * 2, clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x));
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const Y_BODY = 0.27, HIP = V(0, 0.213, -0.12), SHO = V(0, 0.213, 0.12), LEG = 0.21;   // (pivot heights = the leg + the paw: the paws stand on y 0)

/** the pose's parameters at time t, the head aimed at local point `look` (or null: ahead) */
const poseQ = (pose: string, t: number, look: THREE.Vector3 | null): Q => {
  const breathe = 0.004 * Math.sin(TAU * 0.45 * t), wagFast = 0.55 * Math.sin(TAU * 2.6 * t), wagSlow = 0.25 * Math.sin(TAU * 0.9 * t);
  const aim = (base: number) => {
    if (!look) return { neck: base, yaw: 0 };
    const head = V(0, Y_BODY + 0.13, 0.22), d = look.clone().sub(head);
    return { neck: clamp(Math.atan2(d.y, Math.hypot(d.x, d.z)), -0.7, 0.95), yaw: clamp(Math.atan2(d.x, d.z), -1.2, 1.2) };
  };
  const q: Q = { y: breathe, pitch: 0, neck: 0.15, yaw: 0, roll: 0, ear: 0, tailUp: 0.9, wag: wagFast, legs: [0, 0, 0, 0], hindFold: 0, foreFold: 0 };
  switch (pose) {
    case "sniff": {
      const bob = 0.05 * Math.abs(Math.sin(TAU * 3.2 * t));
      return { ...q, pitch: -0.08, neck: -0.95 + bob, yaw: 0.12 * Math.sin(TAU * 0.6 * t), ear: 0.1, tailUp: 0.6, wag: wagSlow };
    }
    case "lookUp": {
      const a = aim(0.6);
      return { ...q, pitch: 0.03, neck: a.neck, yaw: a.yaw, roll: 0.34 + 0.03 * Math.sin(TAU * 0.5 * t), ear: 1, tailUp: 0.15, wag: 0.04 * Math.sin(TAU * 0.7 * t) };
    }
    case "sit": {
      const a = aim(0.45);
      return { ...q, y: -0.03 + breathe, pitch: 0.55, neck: a.neck - 0.45, yaw: a.yaw, ear: 0.2, tailUp: -0.2, wag: wagSlow, hindFold: 1 };
    }
    case "walk": {
      const ph = TAU * 2 * t * 0.5, s = 0.42;
      return { ...q, y: 0.012 * Math.abs(Math.sin(ph)), neck: 0.1 + 0.04 * Math.sin(2 * ph), legs: [s * Math.sin(ph), -s * Math.sin(ph), -s * Math.sin(ph), s * Math.sin(ph)] };
    }
    case "lie": {
      const a = aim(0.25);
      return { ...q, y: -0.13 + breathe * 0.6, pitch: 0, neck: a.neck * 0.6 + 0.1, yaw: a.yaw * 0.7, ear: 0.3, tailUp: -0.35, wag: wagSlow * 0.4, hindFold: 1, foreFold: 1 };
    }
    default: {
      const a = aim(0.15);
      return { ...q, neck: a.neck, yaw: a.yaw };
    }
  }
};
const mixQ = (a: Q, b: Q, k: number): Q => ({
  y: lerp(a.y, b.y, k), pitch: lerp(a.pitch, b.pitch, k), neck: lerp(a.neck, b.neck, k), yaw: lerp(a.yaw, b.yaw, k), roll: lerp(a.roll, b.roll, k),
  ear: lerp(a.ear, b.ear, k), tailUp: lerp(a.tailUp, b.tailUp, k), wag: lerp(a.wag, b.wag, k),
  legs: [0, 1, 2, 3].map((i) => lerp(a.legs[i], b.legs[i], k)) as Q["legs"], hindFold: lerp(a.hindFold, b.hindFold, k), foreFold: lerp(a.foreFold, b.foreFold, k),
});

/** builds the dog into g and returns its hook (see the head of this file) */
export const dog = (K: Kit, g: THREE.Group) => {
  const coat = K.flat("#d6a255", { rough: 0.85 }), pale = K.flat("#f0d8a8", { rough: 0.85 }), dark = K.flat("#a8763a", { rough: 0.85 });
  const nose = K.flat("#2e2a30", { rough: 0.35 }), eyeM = K.flat("#2a2630", { rough: 0.3 }), INK = 0.0055;
  // the body group pivots about its middle (pitch for sitting); it carries the neck, the tail and the legs
  const body = new THREE.Group(); body.position.set(0, Y_BODY, 0); g.add(body);
  const belly = paint(64, 64, (c, w, h) => { c.fillStyle = "#d6a255"; c.fillRect(0, 0, w, h); c.fillStyle = "#f0d8a8"; c.fillRect(0, h * 0.62, w, h * 0.38); });
  new Part(K).add(K.flat("#ffffff", { map: belly, rough: 0.85 }), new THREE.CapsuleGeometry(0.095, 0.24, 6, 16).rotateX(Math.PI / 2).scale(0.92, 1, 1), INK).into(body, "dog.body");
  // the neck and head: the neck pivots at the chest; the head is a ball with a muzzle, a nose, dot eyes, ears that lay back
  const neck = new THREE.Group(); neck.position.set(0, 0.04, 0.14); body.add(neck);
  new Part(K).add(coat, limb(V(0, 0, 0), V(0, 0.1, 0.07), 0.062, 0.055, 12), INK).into(neck, "dog.neck");
  const head = new THREE.Group(); head.position.set(0, 0.11, 0.08); neck.add(head);
  const H = new Part(K);
  H.add(coat, ball(V(0, 0.02, 0), 0.072, [1, 0.95, 1.05], 16), INK);
  H.add(pale, limb(V(0, -0.005, 0.04), V(0, -0.018, 0.115), 0.04, 0.032, 12), INK);
  H.add(pale, ball(V(0, -0.018, 0.115), 0.032, [1, 0.9, 1], 12), INK);
  H.add(nose, ball(V(0, -0.006, 0.143), 0.016, [1.2, 0.85, 0.9], 10), 0.003);
  for (const s of [-1, 1]) H.add(eyeM, ball(V(s * 0.033, 0.035, 0.058), 0.0105, [1, 1.15, 0.6], 8), 0);
  H.into(head, "dog.head");
  const ears = [-1, 1].map((s) => {
    const e = new THREE.Group(); e.position.set(s * 0.045, 0.07, -0.005); head.add(e);
    new Part(K).add(dark, new THREE.ConeGeometry(0.03, 0.075, 8).scale(1, 1, 0.45).rotateZ(-s * 0.25).translate(s * 0.008, 0.032, 0), 0.0035).into(e, "dog.ear");
    return e;
  });
  // the tail: a curl up over the rump, swinging about its root
  const tail = new THREE.Group(); tail.position.set(0, 0.05, -0.17); body.add(tail);
  const T = new Part(K), tp = [V(0, 0, 0), V(0, 0.06, -0.04), V(0, 0.12, -0.03), V(0, 0.15, 0.01)];
  for (let i = 0; i < 3; i++) T.add(i === 2 ? pale : coat, limb(tp[i], tp[i + 1], 0.026 - i * 0.005, 0.021 - i * 0.005, 8), INK);
  for (let i = 1; i < 3; i++) T.add(coat, ball(tp[i], 0.021 - (i - 1) * 0.005, [1, 1, 1], 8), 0);
  T.into(tail, "dog.tail");
  // the legs: an upper and a lower piece each, the knee bending for the fold; paws pale
  const legs = [SHO, SHO, HIP, HIP].map((p, i) => {
    const s = i % 2 ? -1 : 1, top = new THREE.Group(); top.position.set(s * 0.055, p.y - Y_BODY, p.z); body.add(top);
    new Part(K).add(i < 2 ? coat : coat, limb(V(0, 0.02, 0), V(0, -LEG / 2, 0), i < 2 ? 0.032 : 0.04, 0.026, 10), INK).into(top, "dog.leg");
    const low = new THREE.Group(); low.position.set(0, -LEG / 2, 0); top.add(low);
    const L = new Part(K);
    L.add(coat, limb(V(0, 0, 0), V(0, -LEG / 2 + 0.015, 0), 0.026, 0.022, 10), INK);
    L.add(pale, ball(V(0, -LEG / 2 + 0.015, 0.012), 0.026, [1, 0.7, 1.3], 10), INK);
    L.into(low, "dog.paw");
    return { top, low };
  });
  const _l = V(), _q = new THREE.Quaternion();
  return (o: DogO, gg: THREE.Group) => {
    const t = o.t ?? 0;
    // lookAt to the dog's own frame (the group's place, turn and scale are set by put before the hook)
    let look: THREE.Vector3 | null = null;
    if (o.lookAt) {
      const p = Array.isArray(o.lookAt) ? _l.set(o.lookAt[0], o.lookAt[1], o.lookAt[2]) : _l.copy(o.lookAt);
      look = p.sub(gg.position).applyQuaternion(_q.copy(gg.quaternion).invert()).divideScalar(gg.scale.x || 1);
    }
    const b = poseQ(o.pose ?? "idle", t, look), q = o.from && o.k !== undefined && o.k < 1 ? mixQ(poseQ(o.from, t, look), b, clamp(o.k, 0, 1)) : b;
    body.position.set(0, Y_BODY + q.y, 0); body.rotation.set(-q.pitch, 0, 0);
    neck.rotation.set(-(q.neck - 0.15) - (-q.pitch) * 0.6, q.yaw, 0, "YXZ");
    head.rotation.set(0, 0, -q.roll);
    ears.forEach((e, i) => e.rotation.set(-1.1 * q.ear, 0, (i ? -1 : 1) * 0.35 * q.ear));
    tail.rotation.set(-(q.tailUp - 0.9), q.wag, 0, "YXZ");
    legs.forEach((L, i) => {
      const hind = i >= 2, fold = hind ? q.hindFold : q.foreFold;
      // standing: plumb against the body's pitch, swinging; folded: the thigh forward, the shin back (sitting) or
      // the foreleg stretched forward along the ground (lying)
      const plumb = q.pitch;
      if (hind) { L.top.rotation.set(plumb * (1 - fold) + q.legs[i] * (1 - fold) - 1.25 * fold, 0, 0); L.low.rotation.set(2.1 * fold, 0, 0); }
      else { L.top.rotation.set(plumb + q.legs[i] * (1 - fold) - 1.35 * fold, 0, 0); L.low.rotation.set(-0.15 * fold, 0, 0); }
    });
  };
};
