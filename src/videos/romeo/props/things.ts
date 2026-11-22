// THE SMALL PROPS of 采访罗密欧与朱丽叶 (props builder C): every builder fills its prop's group with props-kit Parts
// (merged meshes + ONE black hull outline, layer NOINK: kit props/README.md) and may return a Hook that put() calls
// with its options every frame. Origins and axes are props/index.ts PROP_INFO. Deterministic (hash, fixed tables).
// Renaissance Verona: a rapier with a cup hilt (NO cross guard: nothing on the ground may read as a cross), paper,
// wax, quills; Romeo's poison in a DARK bottle (clearly not Juliet's pale teal vial).
import * as THREE from "three";
import { C, V, M4, Part, turned, limb, ball, prism, paint, hash, NOINK, type Kit } from "../../../kit/props/kit";
import { horse, horseGait, horseSeat, type Coat } from "../../../kit/props/horse";
import type { Hook } from "../../../kit/props/things";

export type { Hook };
export type PropO = { t?: number; amount?: number; go?: number; lying?: boolean; stand?: boolean };
export type Build = (K: Kit, g: THREE.Group) => ((o: PropO, g: THREE.Group) => void) | void;
const TAU = Math.PI * 2;

// ===================================================================================================== the rapier
/** sizes: the blade's tip along +x from the origin, the pommel behind it (-x), the cup's radius (it lifts the hilt) */
export const SWORD = { tip: 0.74, pommel: -0.17, cup: 0.045 };
/** A PLAIN RAPIER lying on the stones: steel blade, a shallow steel cup guard, a knuckle bow, a dark wire-bound grip, a
 *  ball pommel. Built along +y (the tip) round the hilt, then laid down along +x resting on its cup and its tip. */
export const sword: Build = (K, g) => {
  const inner = new THREE.Group(); g.add(inner);
  const P = new Part(K), steel = K.flat("#dfe3e8", { rough: 0.35 }), steelLo = K.flat("#b9c0ca", { rough: 0.4 }), grip = K.flat("#4e3a34", { rough: 0.7 });
  const L = SWORD.tip;
  P.add(steel, prism([[0.03, 0.0125, 0.0048], [0.12, 0.011, 0.0045], [L - 0.12, 0.0085, 0.0038], [L, 0.0008, 0.0006]]), 0.004);   // the blade (a ridge down it)
  P.add(steelLo, turned([[0.012, -0.004], [0.026, 0.004], [0.04, 0.018], [SWORD.cup, 0.034], [SWORD.cup - 0.004, 0.038]], 20), 0.004);   // the cup (outside)
  P.add(steel, turned([[SWORD.cup - 0.006, 0.036], [0.034, 0.02], [0.02, 0.008], [0.01, 0.004]], 20), 0);                             // its bright inside (no hull)
  P.add(grip, new THREE.CylinderGeometry(0.0125, 0.0145, 0.11, 12).translate(0, -0.06, 0), 0.004);
  P.add(steelLo, ball(V(0, -0.128, 0), 0.022, [1, 1.1, 1], 14), 0.004);                                                                // the pommel
  const bow = new THREE.CatmullRomCurve3([V(0.004, -0.122, 0), V(0.03, -0.11, 0), V(0.05, -0.06, 0), V(0.046, -0.01, 0), V(0.036, 0.02, 0)]);
  P.add(steelLo, new THREE.TubeGeometry(bow, 16, 0.0055, 8, false), 0.0035);                                                           // the knuckle bow
  P.into(inner, "sword");
  // lying: +y along +x, the flat of the blade on the ground; the cup's rim under the hilt, the tip on the stones
  const tilt = Math.atan2(SWORD.cup - 0.004, L);
  inner.rotation.set(Math.PI / 2, Math.PI / 2, -tilt, "ZYX"); inner.position.set(0, SWORD.cup + 0.002, 0);
};

// ===================================================================================================== the red cap
/** A SOFT RED CAP lying on the ground a little crumpled: a floppy crown over a band, a short pale feather */
export const redCap: Build = (K, g) => {
  const P = new Part(K), red = K.flat("#a8262c", { rough: 0.85 }), redLo = K.flat("#8a1f26", { rough: 0.85 });
  const crown = new THREE.SphereGeometry(0.13, 28, 14, 0, TAU, 0, Math.PI / 2), p = crown.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i), a = Math.atan2(z, x), k = 1 + 0.07 * Math.sin(3 * a + 1) + 0.04 * Math.sin(5 * a); p.setXYZ(i, x * k, y * 0.42 * (1 - 0.25 * Math.max(0, Math.cos(a - 0.6))) , z * k); }
  crown.computeVertexNormals();
  P.add(red, crown.translate(0.012, 0.034, 0), 0.006);
  P.add(redLo, new THREE.TorusGeometry(0.098, 0.017, 10, 32).rotateX(Math.PI / 2).scale(1, 1, 0.94).translate(0, 0.018, 0), 0.005);
  const feather = prism([[0, 0.004, 0.003], [0.05, 0.016, 0.003], [0.12, 0.011, 0.003], [0.16, 0.001, 0.001]]);
  P.add(K.flat("#ece4d0", { rough: 0.8 }), feather, 0.003, M4(-0.06, 0.05, 0.05, Math.PI / 2 - 0.25, -0.5, -1.2));
  P.into(g, "redCap");
  g.children.forEach((c) => (c.rotation.z = 0.08));
};

// ===================================================================================================== the dark bottle
export const DARK_BOTTLE = { h: 0.102, r: 0.028 };
/** the dark bottle's body profile ([radius, y] from the foot up): flat shoulders, a short neck (Juliet's vial is round
 *  and pale teal: this one is square-shouldered, taller, almost black plum) */
export const darkBottleProfile: [number, number][] = [[0, 0], [0.026, 0], [0.028, 0.006], [0.028, 0.062], [0.024, 0.07], [0.011, 0.077], [0.0095, 0.088], [0, 0.088]];
export const darkGlassTex = () => paint(64, 128, (c, w, h) => {
  c.fillStyle = "#4a3246"; c.fillRect(0, 0, w, h);
  c.fillStyle = "#6e5068"; c.fillRect(w * 0.12, h * 0.12, w * 0.06, h * 0.7);           // a long highlight down the side
  c.fillStyle = "#e4d8bc"; c.fillRect(0, h * 0.42, w, h * 0.22);                        // a plain paper label round the body
  c.fillStyle = "#6a5a50"; for (let i = 0; i < 3; i++) c.fillRect(w * (0.55 + 0.1 * i), h * 0.48, w * 0.05, h * 0.1);
});
/** THE DARK BOTTLE (Romeo's poison from the Mantuan apothecary): standing; put({ lying: true }) lays it on its side */
export const darkBottle: Build = (K, g) => {
  const inner = new THREE.Group(); g.add(inner);
  const P = new Part(K);
  P.add(K.flat("#ffffff", { map: darkGlassTex(), rough: 0.25 }), turned(darkBottleProfile, 24), 0.004);
  P.add(K.flat("#5a4636", { rough: 0.8 }), turned([[0, 0.084], [0.0115, 0.084], [0.0125, 0.1], [0.008, DARK_BOTTLE.h], [0, DARK_BOTTLE.h]], 16), 0.0035);   // the cork, a dark wax cap
  P.into(inner, "darkBottle");
  return (o) => {
    if (o.lying) { inner.rotation.set(0, 0, Math.PI / 2); inner.position.set(0.045, DARK_BOTTLE.r, 0); }
    else { inner.rotation.set(0, 0, 0); inner.position.set(0, 0, 0); }
  };
};

// ===================================================================================================== the spill
export const SPILL = { r: 0.36 };
/** A DARK STAIN ON THE STONES that spreads with put({ amount }) 0..1 (0 = none): a lobed puddle that runs out toward +x.
 *  One flat card 0.8 mm over the floor (kit fx rule 6), alpha-tested against an "arrival" map (the stain reaches each
 *  point at its own amount), so its edge stays crisp while it grows. Dark plum-brown (never red). */
export const spill: Build = (K, g) => {
  const S = 256, R = SPILL.r;
  const arrival = paint(S, S, (c) => {
    const im = c.createImageData(S, S);
    for (let j = 0; j < S; j++) for (let i = 0; i < S; i++) {
      const x = ((i + 0.5) / S - 0.5) * 2 * R * 1.1, z = ((j + 0.5) / S - 0.5) * 2 * R * 1.1;
      const a = Math.atan2(z, x), d = Math.hypot(x, z);
      // the reach in each direction: lobes + a tongue toward +x (it ran that way)
      const reach = R * 0.62 * (1 + 0.16 * Math.sin(3 * a + 0.7) + 0.1 * Math.sin(5 * a + 2.1) + 0.06 * Math.sin(9 * a + 0.3)) + R * 0.4 * Math.pow(Math.max(0, Math.cos(a - 0.15)), 6);
      // a few drops ahead of the edge
      let v = Math.min(1, d / reach);
      for (const [dx, dz, dr, dt] of [[0.3, 0.06, 0.018, 0.85], [0.26, -0.1, 0.014, 0.9], [-0.22, 0.12, 0.012, 0.95]] as number[][]) { const q = Math.hypot(x - dx, z - dz); if (q < dr) v = Math.min(v, dt); }
      const k = Math.round(255 * (1 - v)), o = (j * S + i) * 4;
      im.data[o] = im.data[o + 1] = im.data[o + 2] = k; im.data[o + 3] = 255;
    }
    c.putImageData(im, 0, 0);
  });
  arrival.generateMipmaps = false; arrival.minFilter = THREE.LinearFilter;
  const col = paint(128, 128, (c, w, h) => {
    c.fillStyle = "#3e2c3a"; c.fillRect(0, 0, w, h);
    const gr = c.createRadialGradient(w * 0.45, h * 0.45, 0, w / 2, h / 2, w / 2); gr.addColorStop(0, "rgba(40,28,38,0.6)"); gr.addColorStop(0.7, "rgba(40,28,38,0)"); gr.addColorStop(0.9, "rgba(110,84,96,0.5)"); gr.addColorStop(1, "rgba(110,84,96,0)");
    c.fillStyle = gr; c.fillRect(0, 0, w, h);
    c.fillStyle = "rgba(200,180,190,0.35)"; c.beginPath(); c.ellipse(w * 0.38, h * 0.4, w * 0.08, h * 0.03, -0.4, 0, 7); c.fill();   // a wet glint
  });
  const mat = K.M.paint({ color: "#ffffff", map: col, roughness: 0.25, specular: 0.4, envMapIntensity: 0.6 }) as THREE.MeshPhysicalMaterial;
  mat.alphaMap = arrival; mat.alphaTest = 0.5; mat.polygonOffset = true; mat.polygonOffsetFactor = -1; mat.polygonOffsetUnits = -4;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(2 * R * 1.1, 2 * R * 1.1).rotateX(-Math.PI / 2).translate(0, 0.0008, 0), mat);
  m.layers.set(NOINK); m.receiveShadow = true; m.castShadow = false; m.name = "spill"; g.add(m);
  return (o) => {
    const a = Math.max(0, Math.min(1, o.amount ?? 1));
    m.visible = a > 0.002; mat.alphaTest = Math.min(0.999, Math.max(0.004, 1 - a));
  };
};

// ===================================================================================================== letter, quill, ink, wax
export const LETTER = { w: 0.19, d: 0.12, t: 0.012 };
/** THE SEALED LETTER: a folded sheet with a red wax seal on its face. Lying: face up (+y). put({ stand: true }) stands
 *  it on its long edge, leaning back a little, its face toward +z (behind the boarded window: rot -PI/2 faces it -x) */
export const letterSealed: Build = (K, g) => {
  const inner = new THREE.Group(); g.add(inner);
  const { w, d, t } = LETTER;
  const face = paint(256, 162, (c, W, H) => {
    c.fillStyle = "#efe2c4"; c.fillRect(0, 0, W, H);
    c.fillStyle = "rgba(170,140,100,0.25)"; for (let i = 0; i < 6; i++) { c.beginPath(); c.arc(W * hash(i + 1), H * hash(i + 9), 24 + 30 * hash(i + 3), 0, 7); c.fill(); }
    c.strokeStyle = "#9a8462"; c.lineWidth = 4; c.beginPath(); c.moveTo(0, H * 0.18); c.lineTo(W / 2, H * 0.62); c.lineTo(W, H * 0.18); c.stroke();   // the flap's two edges meeting at the seal
    c.strokeStyle = "rgba(90,70,60,0.55)"; c.lineWidth = 3; c.beginPath(); c.moveTo(W * 0.12, H * 0.84); c.bezierCurveTo(W * 0.3, H * 0.78, W * 0.4, H * 0.9, W * 0.6, H * 0.82); c.stroke();   // an address
    c.strokeStyle = "#5a4636"; c.lineWidth = 4; c.strokeRect(2, 2, W - 4, H - 4);
  });
  const P = new Part(K);
  P.add(K.flat("#ffffff", { map: face, rough: 0.85 }), new THREE.BoxGeometry(w, t, d), 0.004);
  P.add(K.flat("#b0222c", { rough: 0.5 }), new THREE.CylinderGeometry(0.017, 0.018, 0.007, 20).translate(0, t / 2 + 0.003, 0.012), 0.003);   // the seal
  P.add(K.flat("#8a1a24", { rough: 0.5 }), new THREE.CylinderGeometry(0.009, 0.009, 0.004, 14).translate(0, t / 2 + 0.0075, 0.012), 0);
  P.into(inner, "letterSealed");
  return (o) => {
    if (o.stand) { const th = Math.PI / 2 - 0.15; inner.rotation.set(th, 0, 0); inner.position.set(0, (d / 2) * Math.sin(th) + (t / 2) * Math.cos(th) + 0.001, 0); }
    else { inner.rotation.set(0, 0, 0); inner.position.set(0, t / 2, 0); }
  };
};
export const QUILL = { len: 0.28 };
/** the vane's texture: cream with darker barbs slanting off the shaft */
const vaneTex = () => paint(64, 256, (c, w, h) => {
  c.fillStyle = "#f2ecdc"; c.fillRect(0, 0, w, h);
  c.strokeStyle = "rgba(128,114,96,0.8)"; c.lineWidth = 2.5; for (let y = 10; y < h; y += 9) { c.beginPath(); c.moveTo(w / 2, y); c.lineTo(0, y - 14); c.moveTo(w / 2, y); c.lineTo(w, y - 14); c.stroke(); }
  c.fillStyle = "#cfc4ac"; c.fillRect(w / 2 - 2, 0, 4, h);
});
/** the quill's parts along +y (nib at y0), shared with the held quill */
export const quillParts = (P: Part, K: Kit, y0: number) => {
  const L = QUILL.len;
  P.add(K.flat("#ffffff", { map: vaneTex(), rough: 0.8 }), prism([[y0 + 0.07, 0.002, 0.0028], [y0 + 0.12, 0.016, 0.003], [y0 + 0.22, 0.019, 0.003], [y0 + L, 0.002, 0.002]]), 0.003);
  P.add(K.flat("#e2d6ba", { rough: 0.7 }), new THREE.CylinderGeometry(0.0035, 0.0045, 0.09, 8).translate(0, y0 + 0.05, 0), 0.0025);
  P.add(K.flat("#3e3438", { rough: 0.5 }), new THREE.ConeGeometry(0.0045, 0.02, 8).rotateX(Math.PI).translate(0, y0 + 0.006, 0), 0.0025);   // the inked nib
};
/** A GOOSE QUILL lying on the desk, the feather toward +x */
export const quill: Build = (K, g) => {
  const inner = new THREE.Group(); g.add(inner);
  const P = new Part(K); quillParts(P, K, -QUILL.len / 2); P.into(inner, "quill");
  inner.rotation.set(Math.PI / 2, 0, -Math.PI / 2, "YXZ"); inner.position.y = 0.006;
};
/** AN INKPOT: a squat glazed earthenware pot, black ink in its mouth */
export const inkpot: Build = (K, g) => {
  const P = new Part(K);
  const prof: [number, number][] = [[0, 0], [0.036, 0], [0.042, 0.012], [0.042, 0.036], [0.032, 0.048], [0.019, 0.05], [0.019, 0.058], [0.0145, 0.058], [0.0145, 0.052]];
  const tex = paint(16, 128, (c, w, h) => { c.fillStyle = "#7c6c5c"; c.fillRect(0, 0, w, h); c.fillStyle = "#a89880"; c.fillRect(0, h * 0.3, w, h * 0.12); c.fillStyle = "#5e5048"; c.fillRect(0, h * 0.82, w, h * 0.18); });
  P.add(K.flat("#ffffff", { map: tex, rough: 0.45 }), turned(prof, 24), 0.004);
  P.add(K.flat("#2e2834", { rough: 0.2 }), new THREE.CircleGeometry(0.0146, 18).rotateX(-Math.PI / 2).translate(0, 0.0525, 0), 0);
  P.into(g, "inkpot");
};
/** A STICK OF SEALING WAX lying along x, its burnt tip at +x */
export const waxStick: Build = (K, g) => {
  const P = new Part(K), tex = paint(128, 16, (c, w, h) => { c.fillStyle = "#9a2a2e"; c.fillRect(0, 0, w, h); c.fillStyle = "#b8444a"; c.fillRect(0, 2, w, 3); c.fillStyle = "#4a3034"; c.fillRect(w * 0.9, 0, w * 0.1, h); });
  const geo = new THREE.CylinderGeometry(0.0075, 0.0075, 0.1, 6).rotateZ(-Math.PI / 2);
  const uv = geo.attributes.uv as THREE.BufferAttribute, p = geo.attributes.position as THREE.BufferAttribute; for (let i = 0; i < uv.count; i++) uv.setXY(i, (p.getX(i) + 0.05) / 0.1, uv.getY(i));
  P.add(K.flat("#ffffff", { map: tex, rough: 0.5 }), geo.translate(0, 0.0075, 0), 0.0035);
  P.into(g, "waxStick");
};

// ===================================================================================================== glass shards
/** CAMERA-GLASS SHARDS on the floor: six flat broken pieces of a lens round the origin (within 0.3 m), one domed
 *  piece of the front element; pale smoky glass with a coated sheen (no saturated blue) */
export const glassShards: Build = (K, g) => {
  const P = new Part(K), glass = K.flat("#d6dedc", { rough: 0.15 }), sheen = K.flat("#c8c0d2", { rough: 0.15 });
  const piece = (x: number, z: number, s: number, ry: number, n: number, seed: number, m: THREE.Material) => {
    const pts: THREE.Vector2[] = [];
    for (let i = 0; i < n; i++) { const a = (i / n) * TAU + 0.5 * hash(seed + i), rr = s * (0.55 + 0.6 * hash(seed + 7 + i)); pts.push(new THREE.Vector2(Math.cos(a) * rr, Math.sin(a) * rr * 0.75)); }
    const geo = new THREE.ExtrudeGeometry(new THREE.Shape(pts), { depth: 0.006, bevelEnabled: false }).rotateX(-Math.PI / 2);
    P.add(m, geo, 0.0025, M4(x, 0.0005, z, 0, ry, 0));
  };
  piece(0, 0, 0.05, 0.3, 4, 11, glass); piece(0.13, 0.06, 0.035, 1.4, 3, 21, glass); piece(-0.1, 0.09, 0.04, 2.2, 5, 31, sheen);
  piece(0.05, -0.12, 0.028, 0.9, 3, 41, glass); piece(-0.16, -0.05, 0.022, 2.9, 3, 51, glass); piece(0.22, -0.04, 0.018, 0.4, 3, 61, sheen);
  // the domed piece of the front element (a slice of a shallow cap, lying dome up)
  const dome = new THREE.SphereGeometry(0.09, 20, 8, 0, 1.3, 0, 0.42).translate(0, 0.001 - 0.09 * Math.cos(0.42), 0);
  P.add(sheen, dome, 0.0025, M4(-0.02, 0, 0.2, 0, 0.7, 0));
  P.into(g, "glassShards");
};

// ===================================================================================================== the rider leaving
export const RIDER = { go: 9, cloak: "#6a6458" };
const RIDER_COAT: Coat = { body: "#a49c90", mane: "#5a5450", tack: "saddle", cloth: "#8c867a" };
/** A HORSE WITH A SMALL CLOAKED RIDER, seen far away (kit horse, a grey; a hooded cloak, no face detail). put({ go })
 *  0..1 = leaving: it moves RIDER.go metres along its facing, at a gallop while 0 < go < 1 (eased in), standing at 0;
 *  t = the gait's seconds */
export const horseRider: Build = (K, g) => {
  const body = new THREE.Group(); g.add(body);
  const hook = horse(K, body, RIDER_COAT);
  const rider = new THREE.Group(); body.add(rider);
  const P = new Part(K), cloak = K.flat(RIDER.cloak, { rough: 0.9 }), cloakLo = K.flat("#57524a", { rough: 0.9 });
  P.add(cloak, turned([[0.0, 0.0], [0.2, 0.0], [0.17, 0.2], [0.12, 0.42], [0.06, 0.5], [0, 0.5]], 18).scale(1, 1, 0.82), 0.012);   // the cloak over the body
  P.add(cloakLo, ball(V(0, 0.6, 0), 0.15, [1, 1.05, 1], 16), 0.012);                                                                   // the hood
  P.add(K.flat("#e8dccc", { rough: 0.8 }), ball(V(0, 0.59, 0.075), 0.095, [1, 1.1, 0.7], 14), 0);                                       // the pale face in it
  P.add(cloakLo, new THREE.ConeGeometry(0.06, 0.16, 10).rotateX(-0.5).translate(0, 0.72, -0.1), 0.01);                               // the hood's point
  P.into(rider, "horseRider.rider");
  return (o) => {
    const go = Math.max(0, Math.min(1, o.go ?? 0)), e = go * go * (3 - 2 * go) * 0.4 + go * 0.6, pose = go > 0.001 && go < 0.999 ? "gallop" : "stand", t = o.t ?? 0;
    body.position.set(0, 0, RIDER.go * e);
    hook({ t, pose, rider: RIDER.cloak }, body);
    const s = horseSeat(V(0, 0, 0), 0, pose, t), G = horseGait(pose, t);
    rider.position.set(s.x, s.y - 0.06, s.z); rider.rotation.set(G.pitch * 0.6, 0, 0);
  };
};

// ===================================================================================================== a paper ball
/** A CRUMPLED PAGE: a lumpy paper ball (r about 4.5 cm) with painted creases; origin on the floor under it */
export const crumpledPage: Build = (K, g) => {
  const geo = new THREE.IcosahedronGeometry(0.045, 2), p = geo.attributes.position as THREE.BufferAttribute, v = V();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i); const n = v.clone().normalize();
    const k = 1 + 0.14 * Math.sin(n.x * 9 + 1) * Math.sin(n.y * 8 + 2) + 0.1 * Math.sin(n.z * 11 + n.x * 5) + 0.06 * Math.sign(Math.sin(n.y * 13 + n.z * 7));
    v.copy(n).multiplyScalar(0.045 * k); p.setXYZ(i, v.x, v.y * 0.88, v.z);
  }
  const q = geo.toNonIndexed(); q.computeVertexNormals();
  const tex = paint(128, 128, (c, w, h) => { c.fillStyle = "#efe6d0"; c.fillRect(0, 0, w, h); c.strokeStyle = "rgba(140,120,96,0.5)"; c.lineWidth = 2; for (let i = 0; i < 14; i++) { c.beginPath(); c.moveTo(w * hash(i), h * hash(i + 20)); c.lineTo(w * hash(i + 40), h * hash(i + 60)); c.stroke(); } c.strokeStyle = "rgba(70,60,70,0.45)"; c.lineWidth = 3; for (let i = 0; i < 5; i++) { c.beginPath(); c.moveTo(w * 0.15, h * (0.2 + i * 0.13)); c.lineTo(w * 0.8, h * (0.22 + i * 0.13)); c.stroke(); } });
  new Part(K).add(K.flat("#ffffff", { map: tex, rough: 0.9 }), q.translate(0, 0.039, 0), 0.004).into(g, "crumpledPage");
};
void C; void limb;
