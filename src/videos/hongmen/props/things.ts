// THE SMALL PROPS of the Hongmen film: everything a hand holds, carries, throws or eats (the horses are props/horse.ts).
// Each builder fills a prop's group; the prop's ORIGIN and AXES are those of props/index.ts PROP_INFO. A builder may
// return a Hook: called by put() with { t, pose } after the prop is placed (flames, cloth).
// Period: the end of Qin. Lacquer ware is black outside and red inside; bronze; jade; straight swords (剑); no paper.
import * as THREE from "three";
import * as L from "../layout";
import { officerCapGeo } from "../acc/headwear";
import { C, V, M4, Part, turned, lenAt, limb, ball, box, prism, ringSeg, roundLoop, sheet, paint, bandTex, hash, FONT, NOINK, lerp, type Kit, type G2 } from "./kit";

export type Hook = (o: { t: number; pose?: string; rider?: string }, g: THREE.Group) => void;
const TAU = Math.PI * 2;

// ===================================================================================================== swords (剑)
/** a straight double-edged sword: +y = toward the tip, origin = the middle of the grip, the flat of the blade faces z */
export const SWORD = { tip: 0.8, pommel: -0.108, bladeW: 0.056, guardW: 0.1 };
export const sword = (K: Kit, g: THREE.Group, grip: string) => {
  const P = new Part(K), steel = K.flat(C.steel, { rough: 0.35 }), gold = K.flat(C.gold, { rough: 0.45 });
  P.add(K.flat(grip), new THREE.CylinderGeometry(0.0165, 0.0185, 0.15, 12), 0.004);
  P.add(gold, turned([[0, -0.108], [0.02, -0.105], [0.03, -0.09], [0.02, -0.073], [0, -0.07]], 16), 0.004);                  // the disc pommel (剑首)
  P.add(gold, turned([[0, 0.066], [0.026, 0.068], [0.05, 0.088], [0.03, 0.106], [0, 0.108]], 16).scale(1, 1, 0.5), 0.004);   // the guard (剑格): a small lozenge, not a cross bar
  P.add(steel, prism([[0.095, 0.028, 0.008], [0.66, 0.023, 0.0065], [SWORD.tip, 0.0008, 0.0006]]), 0.005);                   // the blade: a ridge down the middle
  P.into(g, "sword");
};

// ===================================================================================================== Fan Kuai's shield (盾)
/** a tall lacquered shield, rounded, a little domed: half width a (x), half height b (z), the rim `rim` thick, the dome
 *  `dome` higher in the middle, a bronze boss `boss` on top of that. Origin = the middle of its BACK, +y = out of its front. */
export const SHIELD_D = { a: 0.29, b: 0.4, rim: 0.035, dome: 0.035, boss: 0.033, top: 0.07 };
const shR = (th: number) => { const n = 3.2, c = Math.abs(Math.cos(th)) / SHIELD_D.a, s = Math.abs(Math.sin(th)) / SHIELD_D.b; return Math.pow(Math.pow(c, n) + Math.pow(s, n), -1 / n); };
const shieldGeo = () => {
  const NT = 56, S = [0, 0.3, 0.6, 0.85, 1], ns = S.length, D = SHIELD_D;
  const uvOf = (x: number, z: number) => [x / (2 * D.a) * 0.96 + 0.5, z / (2 * D.b) * 0.96 + 0.5];
  const mk = (pos: number[], uv: number[], idx: number[]) => { const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals(); return g; };
  const fp: number[] = [], fu: number[] = [], fi: number[] = [], wp: number[] = [], wu: number[] = [], wi: number[] = [], bp: number[] = [0, 0, 0], bu: number[] = [0.5, 0.5], bi: number[] = [];
  for (let i = 0; i < NT; i++) {
    const th = (TAU * i) / NT, r = shR(th), cx = Math.cos(th), sz = Math.sin(th), j = (i + 1) % NT;
    for (const s of S) { const x = r * s * cx, z = r * s * sz; fp.push(x, D.rim + D.dome * (1 - s * s), z); fu.push(...uvOf(x, z)); }
    for (let k = 0; k < ns - 1; k++) { const A = i * ns + k, B = A + 1, Cn = j * ns + k, Dn = Cn + 1; fi.push(A, Cn, B, B, Cn, Dn); }
    const x = r * cx, z = r * sz;
    wp.push(x, D.rim, z, x, 0, z); wu.push(...uvOf(x * 1.04, z * 1.04), ...uvOf(x * 1.04, z * 1.04));
    wi.push(i * 2, j * 2, i * 2 + 1, j * 2, j * 2 + 1, i * 2 + 1);
    bp.push(x, 0, z); bu.push(...uvOf(x, z)); bi.push(0, 1 + i, 1 + j);
  }
  return { front: mk(fp, fu, fi), wall: mk(wp, wu, wi), back: mk(bp, bu, bi) };
};
const shieldTex = (back: boolean) => paint(256, 352, (g, w, h) => {
  const D = SHIELD_D, path = (k: number) => { g.beginPath(); for (let i = 0; i <= 96; i++) { const th = (i / 96) * TAU, r = shR(th) * k * 0.96, x = w / 2 + (r * Math.cos(th) / (2 * D.a)) * w, y = h / 2 - (r * Math.sin(th) / (2 * D.b)) * h; if (i) g.lineTo(x, y); else g.moveTo(x, y); } g.closePath(); };
  g.fillStyle = C.lac; g.fillRect(0, 0, w, h);
  path(0.9); g.fillStyle = back ? "#93402f" : C.red; g.fill();
  g.strokeStyle = C.gold; g.lineWidth = 5; g.stroke();
  g.lineCap = "round";
  if (back) {                                                                    // the grip and its two rivets, two brace lines
    g.strokeStyle = "#7a3226"; g.lineWidth = 6; for (const y of [h * 0.3, h * 0.7]) { g.beginPath(); g.moveTo(w * 0.2, y); g.lineTo(w * 0.8, y); g.stroke(); }
    g.strokeStyle = C.lac; g.lineWidth = 26; g.beginPath(); g.moveTo(w / 2, h * 0.36); g.lineTo(w / 2, h * 0.64); g.stroke();
    g.fillStyle = C.gold; for (const y of [h * 0.36, h * 0.64]) { g.beginPath(); g.arc(w / 2, y, 7, 0, 7); g.fill(); }
  } else {                                                                       // a gold spine and four black cloud hooks (云纹)
    g.strokeStyle = C.gold; g.lineWidth = 7; g.beginPath(); g.moveTo(w / 2, h * 0.09); g.lineTo(w / 2, h * 0.91); g.stroke();
    for (const sx of [-1, 1]) for (const sy of [-1, 1]) {
      const cx = w / 2 + sx * 58, cy = h / 2 + sy * 84;
      g.strokeStyle = C.lac; g.lineWidth = 11; g.beginPath(); g.arc(cx, cy, 25, sx > 0 ? Math.PI * 0.6 : Math.PI * 0.4, sx > 0 ? Math.PI * 2.2 : -Math.PI * 1.2, sx < 0); g.stroke();
      g.fillStyle = C.gold; g.beginPath(); g.arc(cx, cy, 7, 0, 7); g.fill();
    }
  }
});
/** face: true = the front up (held, or lying boss up); false = lying FACE DOWN, origin on the floor under its middle,
 *  the flat back up at y = SHIELD_D.top (the chopping board of line 15; no boss: it would stand in the floor) */
export const shield = (K: Kit, g: THREE.Group, faceUp: boolean) => {
  const P = new Part(K), G = shieldGeo(), D = SHIELD_D, m = faceUp ? undefined : M4(0, D.top, 0, Math.PI, 0, 0);
  const mBack = K.flat("#ffffff", { map: shieldTex(true), rough: 0.55 });
  P.shell([[K.flat("#ffffff", { map: shieldTex(false), rough: 0.5 }), G.front], [mBack, G.wall], [mBack, G.back]], 0.008, m);
  if (faceUp) P.add(K.flat(C.gold, { rough: 0.45 }), turned([[0, 0], [0.085, 0], [0.076, 0.022], [0.042, 0.04], [0, 0.045]], 20), 0.005, M4(0, D.rim + D.dome - 0.012, 0));
  P.into(g, "shield");
};

// ===================================================================================================== the RAW pork leg (彘肩)
/** a whole raw shoulder with the skin on and the trotter: it lies along x (the cut end at -x, the hoof at +x),
 *  origin = its middle, +y up; the shank bends 29 degrees toward +z at the hock (flat on the surface). len long,
 *  r = the thick end's radius, restY = the origin's height when it lies on a surface */
export const PIG = { len: 0.535, r: 0.12, restY: 0.103 };
const PIG_PROFILE: [number, number][] = [[0, 0], [0.098, 0], [0.116, 0.05], [0.12, 0.12], [0.104, 0.2], [0.074, 0.28], [0.052, 0.34], [0.042, 0.39], [0.042, 0.425], [0.05, 0.45], [0.046, 0.47], [0.03, 0.487], [0, 0.492]];
const pigTex = () => {
  const f = lenAt(PIG_PROFILE), vCap = f[1], vMeat = f[4], vShank = f[8], vHoof = f[10];
  return paint(256, 512, (g, w, h) => {
    const Y = (v: number) => h * (1 - v);
    g.fillStyle = C.skinPig; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 9; i++) { g.fillStyle = "rgba(240,160,150,0.28)"; g.beginPath(); g.ellipse(w * hash(i), Y(lerp(vMeat + 0.06, vShank, hash(i + 20))), 30, 18, 0, 0, 7); g.fill(); }   // a pink blush on the skin
    g.fillStyle = "#edb9ab"; g.fillRect(0, 0, w, Y(vHoof));                                                    // the foot end, a little darker
    g.strokeStyle = "#d99c8e"; g.lineWidth = 4; for (const v of [vShank - 0.02, vShank + 0.012]) { g.beginPath(); g.moveTo(0, Y(v)); g.lineTo(w, Y(v)); g.stroke(); }   // two folds at the hock
    // RAW MEAT where the rind is off: the thick third and the cut end
    g.fillStyle = C.meat; g.fillRect(0, Y(vMeat), w, h - Y(vMeat));
    g.strokeStyle = "#f8dcd8"; g.lineWidth = 6; g.lineCap = "round";
    for (let i = 0; i < 8; i++) { const x = (w * (i + 0.5)) / 8, a = Y(vCap + 0.03), b = Y(vMeat - 0.045), k = (hash(i + 3) - 0.5) * 26; g.beginPath(); g.moveTo(x, a); g.bezierCurveTo(x + k, lerp(a, b, 0.35), x - k, lerp(a, b, 0.7), x + k * 0.4, b); g.stroke(); }   // marbling
    g.strokeStyle = C.fat; g.lineWidth = 22; g.beginPath(); for (let i = 0; i <= 48; i++) { const x = (w * i) / 48, y = Y(vMeat) + 9 * Math.sin((TAU * 3 * i) / 48); if (i) g.lineTo(x, y); else g.moveTo(x, y); } g.stroke();   // the fat under the rind's edge
    g.fillStyle = C.fat; g.fillRect(0, Y(vCap) - 9, w, 20);                                                    // rind and fat round the cut face
    g.fillStyle = C.meatLo; g.fillRect(0, Y(vCap * 0.55), w, Y(vCap * 0.28) - Y(vCap * 0.55));                 // the darker eye of the meat
    g.fillStyle = C.fat; g.fillRect(0, Y(vCap * 0.28), w, h - Y(vCap * 0.28));                                 // the bone
    g.fillStyle = "#e59a9a"; g.fillRect(0, Y(vCap * 0.1), w, h - Y(vCap * 0.1));                               // its marrow
  });
};
/** the hock's bend: the lathe's straight axis (y) turns toward +z over a short arc from y0 on, by PIG_BEND rad */
const PIG_BEND = 0.5;
const bendLeg = (geo: THREE.BufferGeometry) => {
  const P = geo.attributes.position as THREE.BufferAttribute, y0 = 0.25, R = 0.16, Lb = R * PIG_BEND;
  for (let i = 0; i < P.count; i++) {
    const y = P.getY(i), z = P.getZ(i), s = y - y0;
    if (s <= 0) continue;
    const th = Math.min(s, Lb) / R, ext = Math.max(0, s - Lb), az = R * (1 - Math.cos(th)) + ext * Math.sin(th), ay = y0 + R * Math.sin(th) + ext * Math.cos(th);
    P.setY(i, ay - z * Math.sin(th)); P.setZ(i, az + z * Math.cos(th));
  }
  geo.computeVertexNormals();
  return geo;
};
/** the cut face of raw pork, seen square on (a disc's planar uv): white fat and rind round the edge, red meat with a
 *  few white seams, a white bone off the middle with its marrow */
const cutTex = () => paint(128, 128, (g, w) => {
  const c = w / 2, disc = (x: number, y: number, r: number, col: string) => { g.fillStyle = col; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); };
  g.fillStyle = C.fat; g.fillRect(0, 0, w, w);
  disc(c, c, w * 0.39, C.meat); disc(c - 6, c + 8, w * 0.2, C.meatLo);
  g.strokeStyle = "#f8dcd8"; g.lineWidth = 6; g.lineCap = "round";
  g.beginPath(); g.moveTo(c - 38, c - 14); g.bezierCurveTo(c - 20, c - 34, c + 6, c - 30, c + 30, c - 34); g.stroke();
  g.beginPath(); g.moveTo(c - 34, c + 24); g.bezierCurveTo(c - 16, c + 40, c + 8, c + 36, c + 22, c + 40); g.stroke();
  disc(c + 20, c + 2, w * 0.125, C.fat); disc(c + 20, c + 2, w * 0.05, "#e59a9a");
});
export const pigLeg = (K: Kit, g: THREE.Group) => {
  const P = new Part(K), m = new THREE.Matrix4().makeScale(1, 0.86, 1).multiply(new THREE.Matrix4().makeRotationZ(-Math.PI / 2)).multiply(new THREE.Matrix4().makeTranslation(0, -PIG.len / 2, 0));
  P.add(K.flat("#ffffff", { map: pigTex(), rough: 0.5 }), bendLeg(turned(PIG_PROFILE, 28, 44)), 0.007, m);
  P.add(K.flat("#ffffff", { map: cutTex(), rough: 0.5 }), new THREE.CircleGeometry(0.095, 24).rotateX(Math.PI / 2).translate(0, -0.003, 0), 0, m);   // the cut face (3 mm proud of the lathe's own end)
  for (const s of [-1, 1]) P.add(K.flat(C.hoof, { rough: 0.5 }), bendLeg(ball(V(s * 0.021, 0.493, 0), 0.027, [0.85, 1.55, 1.1], 12)), 0.005, m);   // the cloven hoof
  P.into(g, "pigLeg");
};
/** a cut slice of the raw leg: lies flat, origin = the middle of its underside, +y up; 0.15 x 0.12 m, 2.4 cm thick */
export const SLICE = { w: 0.15, d: 0.116, t: 0.024 };
export const legSlice = (K: Kit, g: THREE.Group) => {
  const P = new Part(K), face = K.flat("#ffffff", { map: cutTex(), rough: 0.5 }), k: [number, number, number] = [1.3, 1, 1];
  P.add(K.flat(C.fat, { rough: 0.5 }), turned([[0, 0], [0.052, 0], [0.058, 0.012], [0.052, 0.024], [0, 0.024]], 20).scale(...k), 0.005);
  P.add(face, new THREE.CircleGeometry(0.051, 20).rotateX(-Math.PI / 2).translate(0, 0.0262, 0).scale(...k), 0);
  P.add(face, new THREE.CircleGeometry(0.051, 20).rotateX(Math.PI / 2).translate(0, -0.0022, 0).scale(...k), 0);
  P.into(g, "legSlice");
};

// ===================================================================================================== jade
/** Fan Zeng's 玉玦: a flat jade ring with a slit (at the bottom), on a red cord. The ring faces +z, origin = its
 *  centre, +y = up the cord; the hand holds the cord's knot at y = JADE_D.grip */
export const JADE_D = { r: 0.075, hole: 0.03, t: 0.024, grip: 0.15 };
export const jade = (K: Kit, g: THREE.Group) => {
  const P = new Part(K), D = JADE_D, gap = 0.42, cord = K.flat(C.red);
  P.add(K.flat(C.jade, { rough: 0.3 }), ringSeg(roundLoop(D.hole, D.r, D.t, 0.009), gap / 2, TAU - gap, 44).rotateX(Math.PI / 2), 0.005);
  P.add(cord, new THREE.TorusGeometry(0.027, 0.0075, 8, 16).rotateY(Math.PI / 2).translate(0, (D.hole + D.r) / 2, 0), 0.003);   // the cord's turn round the ring
  P.add(cord, limb(V(0, D.r - 0.005, 0), V(0, D.grip, 0), 0.0065, 0.0065, 8), 0.0035);
  P.add(cord, ball(V(0, D.grip, 0), 0.012, [1, 1, 1], 10), 0.003);
  P.into(g, "jade");
};
/** a white jade disc (白璧): faces +z, origin = its centre */
export const BI = { r: 0.085, hole: 0.024, t: 0.013 };
const biGeo = () => ringSeg(roundLoop(BI.hole, BI.r, BI.t, 0.004), 0, TAU, 40).rotateX(Math.PI / 2);
export const bi = (K: Kit, g: THREE.Group) => { new Part(K).add(K.flat(C.jadeWhite, { rough: 0.3 }), biGeo(), 0.005).into(g, "bi"); };
/** a jade wine cup (玉斗): origin = the middle of its foot, +y up; a small ear toward +x */
export const YUDOU = { h: 0.062, r: 0.04 };
const yudouInto = (K: Kit, P: Part, m?: THREE.Matrix4) => {
  const j = K.flat("#bfe6c6", { rough: 0.3 });
  P.add(j, turned([[0, 0], [0.026, 0], [0.03, 0.008], [0.038, 0.05], [0.04, 0.062], [0.034, 0.062]], 18), 0.004, m);
  P.add(K.flat("#a3d4ae", { rough: 0.3 }), turned([[0.034, 0.062], [0.03, 0.045], [0, 0.045]], 18), 0, m);
  P.add(j, ball(V(0.046, 0.04, 0), 0.014, [1.1, 0.75, 0.6], 10), 0.004, m);
};
export const yudou = (K: Kit, g: THREE.Group) => { const P = new Part(K); yudouInto(K, P); P.into(g, "yudou"); };
/** the two jade cups, smashed: pieces on the floor within 0.17 m of the origin (on the floor, +y up) */
export const shards = (K: Kit, g: THREE.Group) => {
  const P = new Part(K), j = K.flat("#bfe6c6", { rough: 0.3 }), wallPiece = (a: number) => ringSeg(roundLoop(0.03, 0.04, 0.05, 0.004), 0, a, 8);
  const at: [number, number, number, number][] = [[-0.09, 0.03, 0.4, 1.2], [0.05, -0.06, 2.1, 0.9], [0.1, 0.07, 4.0, 1.3], [-0.03, 0.11, 5.2, 0.8]];
  for (const [x, z, ry, a] of at) P.add(j, wallPiece(a), 0.004, M4(x, 0.036, z, Math.PI / 2 + 0.25, ry, 0));       // pieces of the cups' walls, lying on their backs
  for (let i = 0; i < 6; i++) { const a = i * 1.07 + 0.3, r = 0.05 + 0.11 * hash(i + 40); P.add(j, ball(V(Math.cos(a) * r, 0.008, Math.sin(a) * r), 0.016 + 0.008 * hash(i), [1.2, 0.5, 0.8], 8), 0.003); }
  P.into(g, "shards");
};
/** the gift table (layout TRAY: w along x, d along z, top at h): a small lacquer stand with a red silk pad; on it the
 *  PAIR of white jade discs (one lying, one leaning on it) and the PAIR of jade cups. full = false: one disc is gone
 *  (it is in Xiang Yu's hand: the prop "bi"). Origin = on the floor under its middle. Hands carry it under the top's
 *  two short ends: (0, h - 0.03, +-d / 2). */
export const tray = (K: Kit, g: THREE.Group, full: boolean) => {
  const P = new Part(K), T = L.TRAY, lac = K.flat(C.lac, { rough: 0.45 }), pad = T.h + 0.01, white = K.flat(C.jadeWhite, { rough: 0.3 });
  P.add(lac, box(T.w, 0.03, T.d, 0, T.h - 0.015, 0), 0.005);
  for (const s of [-1, 1]) P.add(lac, box(T.w - 0.05, T.h - 0.02, 0.03, 0, (T.h - 0.02) / 2, s * (T.d / 2 - 0.045)), 0.005);
  P.add(K.flat(C.lacRed, { rough: 0.8 }), box(T.w - 0.04, 0.012, T.d - 0.04, 0, T.h + 0.004, 0), 0);
  P.add(white, biGeo(), 0.004, M4(0, pad + BI.t / 2, -0.11, -Math.PI / 2, 0, 0));
  if (full) P.add(white, biGeo(), 0.004, M4(0, pad + 0.0172, 0.01, -Math.PI / 2 + 0.12, 0, 0));   // (its low rim on the pad, 2 mm clear of the lying disc's rim)
  for (const s of [-1, 1]) yudouInto(K, P, M4(s * 0.062, pad, 0.15, 0, s > 0 ? 0 : Math.PI, 0));
  P.into(g, "tray");
};

// ===================================================================================================== lacquer ware, bronze
/** a lacquer wine cup (卮): origin = the middle of its foot, +y up; h high, r = the rim's radius. k = its size (1 = the
 *  seats' cups; the big 斗卮 handed to Fan Kuai is 1.8 with a ring handle toward +x) */
export const CUP = { h: 0.09, r: 0.05, bigK: 1.8 };
export const cup = (K: Kit, g: THREE.Group, liu: boolean, k = 1, handle = false) => {
  const out: [number, number][] = [[0, 0], [0.037, 0], [0.04, 0.01], [0.047, 0.075], [0.05, 0.09], [0.043, 0.09]], f = lenAt(out), a = f[2], b = f[3], m = M4(0, 0, 0, 0, 0, 0, k), P = new Part(K);
  // Liu Bang's cup is RED outside with a gold band (his empty seat is told by it); the host's cups are black with a red band
  const tex = liu ? bandTex(C.red, [[lerp(a, b, 0.38), lerp(a, b, 0.66), C.gold], [f[4] - 0.012, f[4] + 0.03, C.gold]])
    : bandTex(C.lac, [[lerp(a, b, 0.38), lerp(a, b, 0.66), C.lacRed], [f[4] - 0.012, f[4] + 0.03, C.lacRed]]);
  P.add(K.flat("#ffffff", { map: tex, rough: 0.4 }), turned(out, 20, 28), k > 1.2 ? 0.007 : 0.005, m);
  P.add(K.flat(C.lacRed, { rough: 0.5 }), turned([[0.043, 0.09], [0.041, 0.072], [0, 0.072]], 20), 0, m);
  P.add(K.flat(C.wine, { rough: 0.3 }), new THREE.CircleGeometry(0.0412, 20).rotateX(-Math.PI / 2).translate(0, 0.0725, 0), 0, m);
  if (handle) P.add(K.flat(C.lac, { rough: 0.4 }), new THREE.TorusGeometry(0.03, 0.0105, 8, 18).translate(0.047 * k + 0.02, 0.085, 0), 0.005);
  P.into(g, "cup");
};
/** an ear cup (耳杯): an oval lacquer bowl with two flat ears on its long sides. Origin = the middle of its foot; 0.16 long (x), 0.05 high */
export const earCup = (K: Kit, g: THREE.Group) => {
  const P = new Part(K), lac = K.flat(C.lac, { rough: 0.4 });
  P.add(lac, turned([[0, 0], [0.034, 0], [0.04, 0.006], [0.072, 0.04], [0.08, 0.05], [0.073, 0.05]], 24).scale(1, 1, 0.62), 0.005);
  P.add(K.flat(C.lacRed, { rough: 0.5 }), turned([[0.073, 0.05], [0.06, 0.026], [0, 0.02]], 24).scale(1, 1, 0.62), 0);
  for (const s of [-1, 1]) P.add(lac, new THREE.CylinderGeometry(0.04, 0.04, 0.012, 14).scale(1.25, 1, 0.5).translate(0, 0.045, s * 0.056), 0.005);
  P.into(g, "earCup");
};
/** a wine ladle (勺): origin = the bottom of its bowl, +y up, the handle rises toward +x; the hand holds it at LADLE.grip */
export const LADLE = { grip: [0.2, 0.136, 0] as [number, number, number] };
export const ladle = (K: Kit, g: THREE.Group) => {
  const P = new Part(K), lac = K.flat(C.lac, { rough: 0.4 });
  P.add(lac, turned([[0, 0], [0.022, 0.004], [0.036, 0.018], [0.04, 0.04], [0.034, 0.04]], 16), 0.004);
  P.add(K.flat(C.lacRed, { rough: 0.5 }), turned([[0.034, 0.04], [0.028, 0.02], [0, 0.012]], 16), 0);
  P.add(lac, limb(V(0.03, 0.034, 0), V(0.235, 0.157, 0), 0.0095, 0.0085, 8), 0.004);
  P.add(K.flat(C.lacRed, { rough: 0.5 }), ball(V(0.24, 0.16, 0), 0.014, [1, 1, 1], 10), 0.004);
  P.into(g, "ladle");
};
/** the wine vessel (樽): a lacquer drum on three bronze feet, two ring handles, wine in it. Origin = on the floor under its middle */
export const WINE = { h: 0.32, r: 0.165 };
export const wineJar = (K: Kit, g: THREE.Group) => {
  const out: [number, number][] = [[0, 0.05], [0.14, 0.05], [0.15, 0.065], [0.155, 0.3], [0.165, 0.32], [0.15, 0.32]], f = lenAt(out), a = f[2], b = f[3], P = new Part(K), br = K.flat(C.bronze, { rough: 0.45 });
  const tex = bandTex(C.lac, [[lerp(a, b, 0.36), lerp(a, b, 0.68), C.lacRed], [lerp(a, b, 0.48), lerp(a, b, 0.56), C.gold], [f[4] - 0.01, f[4] + 0.03, C.lacRed]]);
  P.add(K.flat("#ffffff", { map: tex, rough: 0.4 }), turned(out, 28, 32), 0.006);
  P.add(K.flat(C.lacRed, { rough: 0.5 }), turned([[0.15, 0.32], [0.142, 0.275], [0, 0.275]], 28), 0);
  P.add(K.flat(C.wine, { rough: 0.3 }), new THREE.CircleGeometry(0.1425, 28).rotateX(-Math.PI / 2).translate(0, 0.2755, 0), 0);
  for (let i = 0; i < 3; i++) { const an = (TAU * i) / 3 + 0.5; P.add(br, new THREE.CylinderGeometry(0.036, 0.03, 0.085, 10).translate(Math.cos(an) * 0.105, 0.0425, Math.sin(an) * 0.105), 0.005); }
  for (const s of [-1, 1]) P.add(br, new THREE.TorusGeometry(0.032, 0.0105, 8, 18).rotateY(Math.PI / 2).translate(s * 0.167, 0.2, 0), 0.004);
  P.into(g, "wineJar");
};
/** a bronze cauldron (鼎): three legs, two upright ears. Origin = on the floor under its middle; 0.54 high, 0.54 wide */
export const DING = { h: 0.54, r: 0.27 };
export const ding = (K: Kit, g: THREE.Group) => {
  const out: [number, number][] = [[0, 0.2], [0.1, 0.205], [0.2, 0.25], [0.25, 0.34], [0.255, 0.43], [0.27, 0.455], [0.245, 0.455]], f = lenAt(out), P = new Part(K), br = K.flat(C.bronze, { rough: 0.45 });
  const tex = bandTex(C.bronze, [[f[3] + 0.02, f[4] - 0.02, C.bronzeLo]], (c, w, h) => {                       // a band of square hooks (雷纹), painted
    const y0 = h * (1 - f[4] + 0.035), y1 = h * (1 - f[3] - 0.035); c.strokeStyle = C.bronze; c.lineWidth = 3;
    for (let x = 4; x < w; x += 16) c.strokeRect(x, y0, 9, y1 - y0);
  });
  P.add(K.flat("#ffffff", { map: tex, rough: 0.45 }), turned(out, 28, 32), 0.007);
  P.add(K.flat(C.bronzeLo, { rough: 0.6 }), turned([[0.245, 0.455], [0.225, 0.4], [0, 0.4]], 28), 0);
  for (let i = 0; i < 3; i++) { const an = (TAU * i) / 3 + Math.PI / 2; P.add(br, limb(V(Math.cos(an) * 0.18, 0, Math.sin(an) * 0.18), V(Math.cos(an) * 0.15, 0.27, Math.sin(an) * 0.15), 0.036, 0.05, 10), 0.006); }
  for (const s of [-1, 1]) P.add(br, new THREE.TorusGeometry(0.05, 0.018, 8, 18).rotateY(Math.PI / 2).translate(s * 0.255, 0.48, 0), 0.005);
  P.into(g, "ding");
};
/** a lacquer dish with three pieces of cooked meat. Origin = the middle of its foot; 0.19 across, 0.06 high with the food */
export const dish = (K: Kit, g: THREE.Group) => {
  const P = new Part(K), food = K.flat("#a8643c", { rough: 0.7 });
  P.add(K.flat(C.lac, { rough: 0.4 }), turned([[0, 0], [0.05, 0], [0.056, 0.006], [0.086, 0.022], [0.093, 0.03], [0.086, 0.03]], 22), 0.005);
  P.add(K.flat(C.lacRed, { rough: 0.5 }), turned([[0.086, 0.03], [0.06, 0.014], [0, 0.012]], 22), 0);
  for (let i = 0; i < 3; i++) { const an = (TAU * i) / 3 + 0.4; P.add(food, ball(V(Math.cos(an) * 0.034, 0.034, Math.sin(an) * 0.034), 0.03, [1.1, 0.72, 0.9], 10), 0.004); }
  P.into(g, "dish");
};
/** the informer's message: a ROLL OF BAMBOO SLIPS (简) tied with a red cord (no paper in 206 BC). It lies along x,
 *  origin = its middle; 0.20 long, 5.4 cm thick */
export const note = (K: Kit, g: THREE.Group) => {
  const P = new Part(K), m = M4(0, 0, 0, 0, 0, Math.PI / 2);
  const tex = paint(256, 128, (c, w, h) => {
    c.fillStyle = C.bamboo; c.fillRect(0, 0, w, h);
    c.fillStyle = C.bambooLo; for (let i = 0; i < 12; i++) c.fillRect((w * i) / 12 - 2, 0, 4, h);              // the slips, edge to edge
    c.fillStyle = C.red; for (const v of [0.24, 0.76]) c.fillRect(0, h * v - 6, w, 12);                       // the two cords
  }, true);
  const end = K.flat(C.bambooLo, { rough: 0.7 });
  P.shell([[K.flat("#ffffff", { map: tex, rough: 0.7 }), new THREE.CylinderGeometry(0.027, 0.027, 0.2, 16, 1, true)],
    [end, new THREE.CircleGeometry(0.027, 16).rotateX(-Math.PI / 2).translate(0, 0.1, 0)], [end, new THREE.CircleGeometry(0.027, 16).rotateX(Math.PI / 2).translate(0, -0.1, 0)]], 0.005, m);
  P.into(g, "note");
};

// ===================================================================================================== fire, cloth
/** a hand torch: origin = the grip, +y = toward the flame; the handle runs from y -0.14 to 0.36, the flame's foot is at
 *  TORCH.flame. The flame always rises straight UP in the world (whatever the torch's tilt) and breathes with put's t. */
export const TORCH = { flame: 0.44, top: 0.73 };
export const torch = (K: Kit, g: THREE.Group): Hook => {
  const P = new Part(K);
  P.add(K.flat(C.wood), limb(V(0, -0.14, 0), V(0, 0.36, 0), 0.018, 0.021, 10), 0.004);
  const head: [number, number][] = [[0, 0.3], [0.036, 0.31], [0.05, 0.36], [0.05, 0.44], [0.03, 0.468], [0, 0.474]], f = lenAt(head);
  P.add(K.flat("#ffffff", { map: bandTex("#5a4a40", [[f[2] + 0.04, f[2] + 0.12, C.rope], [f[3] - 0.12, f[3] - 0.04, C.rope]]), rough: 0.9 }), turned(head, 14, 20), 0.005);
  P.into(g, "torch");
  const fl = new THREE.Group(); fl.position.set(0, TORCH.flame, 0); g.add(fl);
  const tex = paint(8, 64, (c, w, h) => { const gr = c.createLinearGradient(0, h, 0, 0); gr.addColorStop(0, C.flameHi); gr.addColorStop(0.45, C.flameHi); gr.addColorStop(0.8, C.flame); gr.addColorStop(1, C.flame); c.fillStyle = gr; c.fillRect(0, 0, w, h); });
  new Part(K).add(new THREE.MeshBasicMaterial({ map: tex }), turned([[0, 0], [0.045, 0.025], [0.062, 0.08], [0.045, 0.16], [0.016, 0.24], [0, 0.27]], 14, 20), 0.007, undefined, K.hullOf(C.flameLo)).into(fl, "torch.flame", { cast: false, receive: false });
  const q = new THREE.Quaternion(), e = new THREE.Euler();
  return ({ t }) => {
    q.copy(g.quaternion).invert();
    fl.quaternion.copy(q).multiply(new THREE.Quaternion().setFromEuler(e.set(0.1 * Math.sin(t * 9.1 + 1), t * 2.3, 0.1 * Math.sin(t * 7.3))));
    fl.scale.set(1 + 0.06 * Math.sin(t * 15.1), 1 + 0.1 * Math.sin(t * 12.7) + 0.05 * Math.sin(t * 20.3 + 2), 1 + 0.06 * Math.sin(t * 15.1));
  };
};
/** a cloth that waves: the sheet's z is rewritten from t alone every put */
const waving = (geo: THREE.BufferGeometry, wave: (x: number, y: number, t: number) => number): ((t: number) => void) => {
  const P = geo.attributes.position as THREE.BufferAttribute;
  return (t) => { for (let i = 0; i < P.count; i++) P.setZ(i, wave(P.getX(i), P.getY(i), t)); P.needsUpdate = true; geo.computeVertexNormals(); };
};
const clothMesh = (K: Kit, geo: THREE.BufferGeometry, tex: THREE.Texture, name: string) => {
  const m = new THREE.Mesh(geo, K.flat("#ffffff", { map: tex, rough: 0.9, side: THREE.DoubleSide }));
  m.castShadow = true; m.receiveShadow = false; m.layers.set(NOINK); m.name = name; m.frustumCulled = false;
  return m;
};
/** the red flag of line 3 on its pole: origin = the pole's foot, +y = up the pole (layout CARD.city.pole long), the
 *  cloth (layout CARD.city.flag) flies toward +x with two tails and ripples with put's t */
export const flag = (K: Kit, g: THREE.Group): Hook => {
  const Cc = L.CARD.city, P = new Part(K), w = Cc.flag.w, h = Cc.flag.h, nx = 8, ny = 4;
  P.add(K.flat(C.wood), limb(V(0, 0, 0), V(0, Cc.pole, 0), 0.022, 0.02, 10), 0.005);
  P.add(K.flat(C.gold, { rough: 0.45 }), ball(V(0, Cc.pole + 0.02, 0), 0.034, [1, 1, 1], 12), 0.005);
  P.into(g, "flag");
  const geo = sheet(w, h, nx, ny), pp = geo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pp.count; i++) { const u = pp.getX(i) / w, v = -pp.getY(i) / h; pp.setX(i, u * (w - 0.13 * (1 - Math.abs(2 * v - 1)))); }      // the swallow tail
  const tex = paint(256, 160, (c, cw, ch) => {
    c.fillStyle = C.red; c.fillRect(0, 0, cw, ch);
    c.strokeStyle = "#8a211f"; c.lineWidth = 12; c.strokeRect(0, 0, cw, ch);                                   // its own dark edge (the cloth has no hull)
    c.strokeStyle = C.gold; c.lineWidth = 7; c.strokeRect(18, 18, cw - 36, ch - 36);
  });
  const mesh = clothMesh(K, geo, tex, "flag.cloth"); mesh.position.set(0.018, Cc.pole - 0.03, 0); g.add(mesh);
  const wave = waving(geo, (x, _y, t) => 0.035 * (x / w) * Math.sin(t * 6.2 - x * 9) + 0.012 * (x / w) * Math.sin(t * 9.7 - x * 17));
  return ({ t }) => wave(t);
};
/** a carried army banner: a pole with a cross bar and a hanging cloth (a field, a border, the lord's name, two tails).
 *  Origin = the pole's foot, +y = up the pole; the hand holds the pole at BANNER.grip; the cloth hangs on the +x side
 *  and faces +z / -z; it sways with put's t */
export const BANNER = { pole: 2.3, grip: 0.95, w: 0.38, h: 0.96, top: 2.19 };
export const banner = (K: Kit, g: THREE.Group, field: string, edge: string, mark: string, text: string): Hook => {
  const B = BANNER, P = new Part(K), wood = K.flat(C.woodLo);
  P.add(wood, limb(V(0, 0, 0), V(0, B.pole, 0), 0.021, 0.019, 10), 0.005);
  P.add(wood, limb(V(-0.04, B.top + 0.012, 0), V(B.w + 0.07, B.top + 0.012, 0), 0.015, 0.015, 8), 0.005);
  P.add(K.flat(C.gold, { rough: 0.45 }), turned([[0, 0], [0.03, 0.02], [0.034, 0.06], [0.016, 0.12], [0, 0.15]], 12).translate(0, B.pole - 0.01, 0), 0.005);
  P.into(g, "banner");
  const nx = 4, ny = 10, geo = sheet(B.w, B.h, nx, ny), pp = geo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pp.count; i++) if (-pp.getY(i) > B.h - 1e-6 && Math.abs(pp.getX(i) - B.w / 2) < 1e-6) pp.setY(i, -B.h + 0.13);                // two tails
  const tex = paint(160, 400, (c: G2, cw, ch) => {
    c.fillStyle = field; c.fillRect(0, 0, cw, ch);
    c.strokeStyle = edge; c.lineWidth = 12; c.strokeRect(0, 0, cw, ch);
    c.strokeStyle = mark; c.lineWidth = 6; c.strokeRect(16, 16, cw - 32, ch - 32);
    c.fillStyle = mark; c.textAlign = "center"; c.textBaseline = "middle"; c.font = `700 ${Math.round(cw * 0.62)}px ${FONT}`;
    c.fillText(text, cw / 2, ch * 0.3);
    c.fillRect(cw * 0.26, ch * 0.56, cw * 0.48, 9); c.fillRect(cw * 0.32, ch * 0.62, cw * 0.36, 9);
  });
  const mesh = clothMesh(K, geo, tex, "banner.cloth"); mesh.position.set(0.035, B.top, 0); g.add(mesh);
  const wave = waving(geo, (x, y, t) => 0.045 * (-y / B.h) * Math.sin(t * 2.3 + y * 3.1 + x * 1.5) + 0.012 * (-y / B.h) * Math.sin(t * 4.1 + x * 9));
  return ({ t }) => wave(t);
};

// ===================================================================================================== the informer's cap
/** 曹无伤's gable cap as a thing on the ground (line 20): THE CAST'S OWN SHAPE (acc/headwear.ts officerCapGeo) cut
 *  where it leaves the head. Origin = the middle of its foot, +y up, the ridge runs along z (higher at -z...+z as on
 *  the head); 0.22 x 0.25 m at the foot, 0.36 m across the eaves, 0.27 m high */
export const CAP = { h: 0.27, r: 0.18, foot: 0.11 };
export const cap = (K: Kit, g: THREE.Group, col = "#2a2630", band: string = C.red) => {
  const R = 0.24, Y0 = 0.8, geo = officerCapGeo((v) => v.set(v.x * R, Math.max(v.y - Y0, 0) * R, v.z * R)), [, v1] = geo.userData.vBand as number[];
  const tex = paint(8, 256, (c, w, h) => { c.fillStyle = col; c.fillRect(0, 0, w, h); c.fillStyle = band; const yb = h * (1 - v1); c.fillRect(0, yb, w, h - yb); c.fillStyle = "#6a1c1a"; c.fillRect(0, yb - 3, w, 6); });
  new Part(K).add(K.flat("#ffffff", { map: tex, rough: 0.8 }), geo, 0.008).into(g, "cap");
};
