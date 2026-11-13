// THE WARDROBE of the Newton film (PLAN 2): accessories for the rig3d figures of group/kit (imported, never edited).
// WP3. Each function returns an Acc (group/kit/RIG3D.md "角色道具"); people.ts puts them on NEWTON and HUMPHREY.
//   coat(o)       a 1680s coat: the whole body in the cloth, open down the front over a darker waistcoat with a row of
//                 small buttons, pocket flaps at the hips, and the FALLING BAND (a flat white collar of two broad
//                 rounded tabs under the chin); in 3D the coat's skirts flare to the knees (the kit's robe skirt, short).
//                 slots: coat. name "coat" (hide: ["coat"] hides only the 3D skirts)
//   gown(o)       the black academic gown over it (outdoors, the lecture): broad black panels from the shoulders down
//                 both sides of the front (the coat and collar show between them) and all of the back; in 3D it hangs
//                 behind to the knees (the kit's cape cloth, rebuilt from the pose every frame). slots: back, neck
//   locks(o)      his OWN long hair: locks that fall from the temples past the jaw to the shoulders on both sides,
//                 parted in the middle, a little wild (seeded, never random). name "locks"
//   nest(o)       the bird's nest of the morning: short tufts standing out of the crown and over the ears (A). name
//                 "nest": hide: ["nest"] once he has (not) combed it
//   earQuill(o)   a goose quill tucked behind his right ear (A): a cream feather standing up and back. name "earQuill":
//                 hide: ["earQuill"] when it is not there
//   inkSmear(k)   the ink on his nose: a slanting blue-black smear (k 1) or its smudged ghost after her first wipe
//                 (k 0.45). Drawn on the face (part of the face drawing): change it by SWAPPING figures (people.ts)
//   soot(k)       Humphrey's soot at night: grey-black smudges on a cheek, the brow and the chin (face), k = how much
//   band(o)       a plain small white collar (Humphrey's): two short tabs under the chin, painted
// Rules (RIG3D.md): units on the face are u = 1 % of the head's width from the middle of the eye line, y down; head parts
// in head units (radius 1: x = the person's left, y up, z = the face side); nothing random; colours between #2b2630 and
// #f4f1ea (the ink stays the darkest thing).
import * as THREE from "three";
import type { Acc, OutfitKit, P2 } from "../../group/kit/rig3d";
import { robe, cape } from "../../../kit/acc/garb";
import { leafGeo } from "../../wanbi/acc/envoy";

const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const rad = (d: number) => (d * Math.PI) / 180;
/** a fixed pseudo-random number 0..1 (seeded; never Math.random) */
const hash = (n: number, k = 0) => { const s = Math.sin(n * 127.1 + k * 311.7 + 74.7) * 43758.5453; return s - Math.floor(s); };
const shadeHex = (col: string, k: number) => { const c = new THREE.Color(col); c.multiplyScalar(k); return "#" + c.getHexString(); };

// ---------------------------------------------------------------------------------------------- painting helpers
/** points of the curve from a to b bent toward k */
const bend = (a: P2, k: P2, b: P2, n = 10): P2[] => Array.from({ length: n + 1 }, (_, i) => { const t = i / n, s = 1 - t; return [s * s * a[0] + 2 * s * t * k[0] + t * t * b[0], s * s * a[1] + 2 * s * t * k[1] + t * t * b[1]] as P2; });
/** a band all the way round the body between two heights */
const ring = (c: OutfitKit, t0: number, t1: number, col: string) => c.poly([c.P(-180, t1), c.P(180, t1), c.P(180, t0), c.P(-180, t0)], col);
/** a round spot of radius rm metres at (az, t) */
const disc = (c: OutfitKit, az: number, t: number, rm: number, col: string, stroke?: string, lw = 4) => {
  const [x, y] = c.P(az, t), rx = (c.az(rm, t) / 360) * c.W, ry = rm * c.pxUp(t), g = c.g;
  g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, 7); g.fillStyle = col; g.fill();
  if (stroke) { g.strokeStyle = stroke; g.lineWidth = lw; g.stroke(); }
};
/** THE FALLING BAND: two broad white tabs with rounded lower corners hanging from the throat over the chest, a little
 *  apart in the middle (az = half its width in degrees; drop = how far down the chest it reaches, body t) */
const fallingBand = (c: OutfitKit, col: string, az: number, drop: number) => {
  const P = c.P, t0 = c.chin + 0.03, t1 = c.chin - drop, ink = c.shade(col, 0.55), gap = 1.6;
  for (const s of [-1, 1]) {
    const a0 = s * gap, a1 = s * az, r = 0.35;              // r = the share of the tab's height its round corner takes
    const pts: P2[] = [P(a0, t0), P(a1 * 0.92, t0), ...bend(P(a1, t0 - (t0 - t1) * (1 - r)), P(a1, t1), P(a1 * 0.62, t1), 6), P(a0, t1 + 0.004)];
    c.poly(pts, col, ink, 5);
    // two soft folds down the tab
    c.line([P(s * az * 0.42, t0 - 0.01), P(s * az * 0.45, t1 + 0.012)], c.shade(col, 0.86), 4);
  }
};

// --------------------------------------------------------------------------------------------------------- coat
export type CoatO = {
  /** the coat's cloth */ col: string;
  /** the waistcoat between its open edges (default: the cloth a little darker) */ vest?: string;
  /** the buttons (default: a dull pale brass) */ button?: string;
  /** the falling band's white; false = none */ collar?: string | false;
  /** the collar's half width in degrees round the body (default 30) and how far it drops (body t, 0.085) */ collarW?: number; collarDrop?: number;
  /** half the opening at the waist, in degrees (default 13) */ open?: number;
  /** grey-black soot smudges on the front (Humphrey at night), 0..1 */ soot?: number;
  /** false = no 3D skirts (under the gown, whose own long skirt hangs there) */ skirt?: boolean;
};
/** A 1680s coat over a waistcoat with the falling band at the throat; the kit's short robe skirt carries it to the knees
 *  in 3D (see the head of this file). */
export const coat = (o: CoatO): Acc => {
  const vest = o.vest ?? shadeHex(o.col, 0.78), button = o.button ?? "#b49866", collar = o.collar === undefined ? "#eeeae2" : o.collar;
  const cw = o.collarW ?? 30, cd = o.collarDrop ?? 0.085, op = o.open ?? 13, soot = Math.max(0, Math.min(1, o.soot ?? 0));
  const key = ["nwCoat", o.col, vest, button, collar, cw, cd, op, soot.toFixed(2)].join("|");
  const skirt = robe({ col: o.col, band: shadeHex(o.col, 0.86), sash: false, skirt: "short", knot: false });
  return {
    name: "coat", slots: ["coat"], key,
    outfit(c) {
      const P = c.P, ch = c.chin, ink = c.shade(o.col, 0.42), edge = c.shade(o.col, 1.28);
      ring(c, 0, 1, o.col);
      // folds at the sides and back
      for (const az of [-150, -110, -72, 70, 108, 150]) c.line([P(az, 0.5), P(az + 3, 0.04)], c.shade(o.col, 0.84), 5);
      // the waistcoat in the opening: narrow at the throat, wider toward the hem
      const L = bend(P(-6, 1), P(-op * 0.7, ch - 0.25), P(-op * 1.25, 0), 12), R = bend(P(6, 1), P(op * 0.7, ch - 0.25), P(op * 1.25, 0), 12);
      c.poly([...L, ...R.slice().reverse()], vest);
      // the waistcoat's own buttons down the middle
      for (let i = 0; i < 7; i++) disc(c, 0, ch - 0.05 - i * 0.075, 0.0085, button, c.shade(button, 0.5), 3);
      // the coat's edges: a pale lit edge and a dark line, and its buttons along the wearer's right edge
      for (const s of [L, R]) { c.line(s, edge, 13); c.line(s, ink, 5); }
      for (let i = 0; i < 6; i++) { const t = ch - 0.14 - i * 0.09, k = (ch - t) / ch; disc(c, -(op * 0.7 + op * 0.55 * k) - 5, t, 0.009, button, c.shade(button, 0.5), 3); }
      // pocket flaps at the hips
      for (const s of [-1, 1]) {
        const a = s * 46, t = 0.24;
        c.poly([P(a - 14, t + 0.03), P(a + 14, t + 0.03), P(a + 12, t - 0.02), P(a - 12, t - 0.02)], o.col, ink, 4);
        disc(c, a, t + 0.004, 0.007, button, c.shade(button, 0.5), 2);
      }
      if (soot > 0) {
        const g = c.g; g.save(); g.globalAlpha = 0.32 * soot;
        for (let i = 0; i < 4; i++) disc(c, -50 + 100 * hash(i, 3), 0.15 + 0.45 * hash(i, 5), 0.02 + 0.02 * hash(i, 7), "#3a3638");
        g.restore();
      }
      if (collar) fallingBand(c, collar, cw, cd);
    },
    build: o.skirt === false ? undefined : skirt.build,
  };
};
/** a plain small white collar (Humphrey's): two short tabs, painted after the coat */
export const band = (o: { col?: string; w?: number; drop?: number } = {}): Acc => {
  const col = o.col ?? "#eeeae2", w = o.w ?? 18, drop = o.drop ?? 0.05;
  return { name: "band", slots: ["neck"], key: ["nwBand", col, w, drop].join("|"), outfit(c) { fallingBand(c, col, w, drop); } };
};

// --------------------------------------------------------------------------------------------------------- gown
/** THE ACADEMIC GOWN: black panels from the shoulders down both sides of the front (open between az -open..open at the
 *  chest, widening a little to the hem), all of the back; in 3D the kit's cape cloth hangs behind to the knees and the
 *  kit's long robe skirt carries the black to the calves all round. Wear it with coat({ skirt: false }). */
export const gown = (o: { col?: string; open?: number } = {}): Acc => {
  const col = o.col ?? "#322e36", open = o.open ?? 34, lining = shadeHex(col, 0.8);
  const back = cape({ col, lining, clasp: col, len: 1 }), skirt = robe({ col, band: shadeHex(col, 0.8), sash: false, skirt: "long", knot: false });
  return {
    name: "gown", slots: ["back", "neck"], key: ["nwGown", col, open].join("|"),
    outfit(c) {
      const P = c.P, ch = c.chin, edge = c.shade(col, 1.6), ink = c.shade(col, 0.5);
      for (const s of [-1, 1]) {
        // the panel: from the shoulder seam round the side to the back seam, its front edge a soft curve down the chest
        const e = bend(P(s * (open - 6), 1), P(s * (open + 4), ch - 0.2), P(s * (open + 10), 0), 12);
        c.poly([P(s * 180, 1), ...e, P(s * 180, 0)], col);
        c.line(e, edge, 10); c.line(e, ink, 4);
        // gathers at the shoulder
        for (const a of [62, 84, 108]) c.line([P(s * a, ch + 0.03), P(s * (a + 4), ch - 0.32)], c.shade(col, 1.3), 4);
      }
    },
    build: (b) => { back.build?.(b); skirt.build?.(b); },
  };
};

// --------------------------------------------------------------------------------------------------------- hair
/** HIS OWN LONG HAIR (no wig): `n` locks a side falling from the temples past the jaw onto the shoulders, set out a
 *  little from the head; wild 0..1 = how much they splay (seeded). Hair-coloured, painted as hair. */
export const locks = (o: { col?: string; n?: number; wild?: number; len?: number } = {}): Acc => {
  const n = o.n ?? 4, wild = o.wild ?? 0.5, len = o.len ?? 1;
  return {
    name: "locks", slots: [], key: ["nwLocks2", o.col ?? "", n, wild, len].join("|"),
    build(b) {
      const col = o.col ?? b.look.hairCol;
      // two or three uneven strand lines (no regular stripes: those read as a wig)
      const map = b.tex(64, 256, (g) => {
        g.fillStyle = "#ffffff"; g.fillRect(0, 0, 64, 256);
        g.strokeStyle = "#8e8a92"; g.lineCap = "round";
        for (const [x, w, y0] of [[20, 3, 210], [41, 2.5, 250], [30, 2, 120]] as [number, number, number][]) { g.lineWidth = w; g.beginPath(); g.moveTo(x, y0); g.quadraticCurveTo(x + 9, y0 * 0.5, x - 4, 10); g.stroke(); }
      }, "nwLocks2");
      const lock = (p0: THREE.Vector3, p1: THREE.Vector3, p2: THREE.Vector3, wide: number, deep: number) => b.solid("head", leafGeo(b.toM, p0, p1, p2, wide, deep, 0.4), { col, map, paint: "hair", ink: 0.0075 });
      for (const s of [-1, 1]) for (let i = 0; i < n; i++) {
        const k = i / Math.max(1, n - 1), h1 = hash(i * 7 + (s > 0 ? 3 : 0), 11), h2 = hash(i * 5 + (s > 0 ? 1 : 0), 13), h3 = hash(i * 3 + (s > 0 ? 2 : 0), 17);
        // root on the side of the head from the temple back past the ear; the tip below the jaw, splayed and curling
        const az = rad(74 + 66 * k + 8 * (h3 - 0.5)), sn = Math.sin(az), cs = Math.cos(az);
        const p0 = V(s * 0.88 * sn, 0.36 - 0.14 * k, 0.88 * cs);
        const out = 1.03 + 0.12 * wild * h1 + 0.04 * k;
        const wave = (h2 - 0.5) * 0.22 * wild;
        const p1 = V(s * (out + wave) * Math.sin(az + rad(3)), -0.4 - 0.1 * h3, out * Math.cos(az + rad(3)) - 0.04);
        const tipY = -(0.86 + 0.26 * len * (0.75 + 0.5 * h2)), tipOut = out + 0.04 + 0.22 * wild * (h1 - 0.25);
        const curl = rad(8 + 26 * wild * (h3 - 0.35));
        const p2 = V(s * tipOut * Math.sin(az + curl), tipY, tipOut * Math.cos(az + curl) - 0.1 - 0.12 * k);
        lock(p0, p1, p2, 0.3 + 0.12 * h2, 0.18 + 0.05 * h1);
      }
      // the back: a broad fall over the nape (covers the bare back of the head) and two flicks
      lock(V(0, 0.15, -0.95), V(0, -0.45, -1.08), V(0.04, -1.1, -0.98), 1.3, 0.26);
      for (const s of [-1, 1]) {
        lock(V(s * 0.36, 0.05, -0.9), V(s * 0.5, -0.5, -1.0), V(s * 0.58, -1.06, -0.86), 0.9, 0.24);
        lock(V(s * 0.62, 0.05, -0.74), V(s * 0.8, -0.5, -0.8), V(s * 0.86, -1.0, -0.66), 0.6, 0.22);
      }
    },
  };
};
/** THE BIRD'S NEST (scene A): `n` short tufts standing out of the crown and over the temples at seeded angles. */
export const nest = (o: { col?: string; n?: number; size?: number } = {}): Acc => {
  const n = o.n ?? 9, size = o.size ?? 1;
  return {
    name: "nest", slots: [], key: ["nwNest", o.col ?? "", n, size].join("|"),
    build(b) {
      const col = o.col ?? b.look.hairCol;
      for (let i = 0; i < n; i++) {
        const h1 = hash(i, 21), h2 = hash(i, 23), h3 = hash(i, 29);
        // spread over the top and back of the head, away from the face (polar 10-70 deg from the crown, azimuth all round
        // but the front third)
        // round the crown and over the temples, away from the face: azimuth all round but the front third, 30-75 deg
        // from the crown; each tuft leans over sideways (a flattened, slept-on mess), never straight up
        const az = rad(-160 + 320 * ((i + 0.6 * h1) / n)), th = rad(48 + 34 * h2), sn = Math.sin(th);
        const dir = V(sn * Math.sin(az), Math.cos(th), sn * Math.cos(az));
        if (dir.z > 0.35) dir.z = 0.35 - 0.25 * h3;                // never over the brow
        dir.normalize();
        const side = V().crossVectors(dir, V(0.3 * (h3 - 0.5), 1, 0.2)).normalize();
        const p0 = dir.clone().multiplyScalar(0.78), L = (0.2 + 0.18 * h3) * size;
        // the tip: out and curling back down over the hair (a flick, not a spike)
        const p2 = dir.clone().multiplyScalar(0.98 + L).addScaledVector(side, (h1 - 0.5) * 0.5).add(V(0, -0.12 - 0.12 * h2, 0));
        const p1 = p0.clone().lerp(p2, 0.45).addScaledVector(dir, 0.16).add(V(0, 0.06, 0));
        b.solid("head", leafGeo(b.toM, p0, p1, p2, 0.36 + 0.12 * h1, 0.13, 0.32), { col, paint: "hair", ink: 0.007 });
      }
    },
  };
};
/** A GOOSE QUILL behind his right ear (the person's right = -x): the shaft tucked over the ear, the feather standing up
 *  and back past the hair. name "earQuill" */
export const earQuill = (o: { col?: string; shaft?: string } = {}): Acc => {
  const col = o.col ?? "#efe8d8", shaft = o.shaft ?? "#d8c9a8";
  return {
    name: "earQuill", slots: [], key: ["nwEarQuill", col, shaft].join("|"),
    build(b) {
      const map = b.tex(64, 256, (g) => {
        g.fillStyle = "#ffffff"; g.fillRect(0, 0, 64, 256);
        g.fillStyle = "#c9bfae"; g.fillRect(29, 0, 6, 256);                 // the rachis down the vane
        g.strokeStyle = "#d6cdbd"; g.lineWidth = 2;
        for (let y = 20; y < 250; y += 18) { g.beginPath(); g.moveTo(32, y); g.lineTo(4, y - 14); g.moveTo(32, y); g.lineTo(60, y - 14); g.stroke(); }
      }, "nwQuillVane");
      // the vane: from just above the ear back and up (about 55 deg from upright, its tip behind the head no higher
      // than the crown: tucked behind the ear, never a horn)
      b.solid("head", leafGeo(b.toM, V(-1.04, 0.3, -0.02), V(-1.2, 0.72, -0.48), V(-1.17, 1.02, -1.15), 0.2, 0.05, 0.62), { col, map, ink: 0.0055 });
      // the bare shaft running down past the ear, in front of the locks
      b.solid("head", leafGeo(b.toM, V(-1.03, 0.36, -0.01), V(-1.08, 0.08, 0.1), V(-1.06, -0.18, 0.22), 0.06, 0.06, 0.5), { col: shaft, ink: 0.0045 });
    },
  };
};

// --------------------------------------------------------------------------------------------------------- the face
/** THE INK ON HIS NOSE: a slanting blue-black smear across the bridge of the nose and a small flick under it (k 1); at
 *  k < 0.7 the smudged ghost after her first stroke (paler, wider, no flick). Part of the face drawing: a SWAP. */
export const inkSmear = (k = 1): Acc => {
  const a = Math.max(0, Math.min(1, k)), ghost = a < 0.7;
  return {
    name: "inkSmear", slots: [], key: `nwInk|${a.toFixed(2)}`,
    face(fk) {
      const g = fk.g, u = fk.u;
      g.save();
      g.globalAlpha = ghost ? 0.55 * a + 0.1 : 0.92;
      g.fillStyle = "#2f3a55";
      // the smear: a slanted blob across the bridge (between the eyes and below), heavier at its lower end
      const [cx, cy] = fk.px(1.5, 6.5);
      g.translate(cx, cy); g.rotate(rad(-24));
      g.beginPath(); g.ellipse(0, 0, (ghost ? 11 : 8.5) * u, (ghost ? 4.4 : 3.3) * u, 0, 0, Math.PI * 2); g.fill();
      if (!ghost) {
        g.beginPath(); g.ellipse(5.5 * u, 1.2 * u, 3.6 * u, 2.4 * u, 0, 0, Math.PI * 2); g.fill();
        // a thumb-print streak toward the cheek
        g.globalAlpha = 0.6; g.beginPath(); g.ellipse(-8 * u, -0.6 * u, 4.5 * u, 1.6 * u, rad(8), 0, Math.PI * 2); g.fill();
      }
      g.restore();
    },
  };
};
/** HUMPHREY'S SOOT: grey-black smudges on his right cheek, the brow and the chin (k = how dark) */
export const soot = (k = 1): Acc => {
  const a = Math.max(0, Math.min(1, k));
  return {
    name: "soot", slots: [], key: `nwSoot|${a.toFixed(2)}`,
    faceUnder(fk) {
      const g = fk.g, u = fk.u;
      const blot = (x: number, y: number, rx: number, ry: number, rot: number, al: number) => {
        const [px, py] = fk.px(x, y); g.save(); g.globalAlpha = al * a; g.fillStyle = "#3a3638"; g.translate(px, py); g.rotate(rad(rot));
        g.beginPath(); g.ellipse(0, 0, rx * u, ry * u, 0, 0, Math.PI * 2); g.fill(); g.restore();
      };
      blot(-22, 11, 9, 4.5, -12, 0.42); blot(-17, 15, 5, 2.4, -20, 0.5);   // his right cheek (screen left)
      blot(9, -24, 11, 3, 6, 0.32);                                         // the brow
      blot(3, 33, 7, 3, 0, 0.36);                                           // the chin
    },
  };
};
