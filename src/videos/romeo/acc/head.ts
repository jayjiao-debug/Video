// HEADS of 采访罗密欧与朱丽叶 (design stage): hats and hair in 3D for the rig3d figures of group/kit (imported, never
// edited). Head units: the head's radius = 1; x = the person's left, y = up, z = the face side. Nothing 3D sits in
// front of the face below the brows (the kit's "face" rule): side tresses hang 68 degrees or more round from it.
//   beret(o)       ROMEO: a big soft velvet cap slouched to his right, a gold band, a jewelled brooch and one long
//                  curling feather. name "beret" (hide: ["beret"] = bare-headed: the tomb).
//   curls(o)       ROMEO: loose locks that stick out under the cap at the temples and the nape (and a cowlick on a
//                  bare head). name "curls"
//   julietCap(o)   JULIET: the cap named after her: a small gold net cap on the back of the crown, pearls at the net's
//                  knots and along its rim. name "julietCap"
//   tresses(o)     JULIET: two long tresses that hang from behind the temples down in front of the shoulders, each
//                  bound with a ribbon near its end. name "tresses"
//   hairRoll(o)    JULIET: a soft roll of her own hair over the head from ear to ear, in front of the cap. name "hairRoll"
//   tonsure(o)     THE FRIAR: the shaved crown: a dome of bare skin with the ring of hair left round it. name "tonsure"
import * as THREE from "three";
import type { Acc } from "../../group/kit/rig3d";
import { hoop, shade } from "../../group/kit/rigacc/shapes";
import { lathe, leafGeo, weld } from "../../wanbi/acc/envoy";

const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const rad = (d: number) => (d * Math.PI) / 180;

// ------------------------------------------------------------------------------------------------------- Romeo
/** ROMEO'S CAP (see the head of this file). col = the velvet, band = the band round its foot, plume = the feather,
 *  gem = the brooch's stone. size = the crown's spread (1 = 1.18 head radii) */
export const beret = (o: { col?: string; band?: string; plume?: string; gem?: string; size?: number } = {}): Acc => {
  const col = o.col ?? "#24468f", band = o.band ?? "#e2b03a", plume = o.plume ?? "#f6f1e4", gem = o.gem ?? "#c4202e", k = o.size ?? 1;
  return {
    name: "beret", slots: ["hat", "crown"], key: ["rjBeret", col, band, plume, gem, k].join("|"), hat: { rim: 44, hair: "keep", shade: false },
    build(b) {
      b.tilt(-13, -5);
      const R = b.R, r0 = 0.74, base = 0.62, hb = 0.17, rx = 1.18 * k, ry = 0.36, t0 = -Math.acos(r0 / rx), cy = base + hb - ry * Math.sin(t0);
      // the band (a short upright wall), then the soft crown bulging out over it and closing on top
      const prof: [number, number][] = [[r0 * 0.96, base - 0.32], [r0, base + hb]];
      for (let i = 1; i < 14; i++) { const t = t0 + ((Math.PI / 2 - t0) * i) / 14; prof.push([rx * Math.cos(t), cy + ry * Math.sin(t)]); }
      prof.push([0, cy + ry * 0.94]);
      const hat = lathe(b.toM, prof, 56), vAt = hat.userData.vAt as number[];
      const map = b.tex(64, 512, (g) => {
        const Y = (v: number) => 512 * (1 - v);
        g.fillStyle = col; g.fillRect(0, 0, 64, 512);
        // soft gathers radiating over the crown
        g.fillStyle = shade(col, 0.82); for (let x = 4; x < 64; x += 16) g.fillRect(x, 0, 2.2, Y(vAt[3]));
        g.fillStyle = shade(col, 1.25); for (let x = 12; x < 64; x += 16) g.fillRect(x, Y(vAt[9]), 1.6, Y(vAt[3]) - Y(vAt[9]));
        // the band
        g.fillStyle = band; g.fillRect(0, Y(vAt[1]), 64, 512);
        g.fillStyle = shade(band, 0.55); g.fillRect(0, Y(vAt[1]) - 3, 64, 5);
      }, `rjBeret|${col}|${band}`);
      b.solid("head", hat, { map, ink: 0.0085 });
      // the feather: from the brooch at his left temple up, back and over the cap in one long curl
      const fmap = b.tex(256, 256, (g) => {
        g.fillStyle = plume; g.fillRect(0, 0, 256, 256);
        g.strokeStyle = shade(plume, 0.82); g.lineWidth = 6; g.lineCap = "round";
        for (const x of [64, 192]) for (let i = 1; i < 11; i++) for (const s of [-1, 1]) { g.beginPath(); g.moveTo(x, 256 - i * 23); g.lineTo(x + s * 52, 256 - i * 23 - 20); g.stroke(); }
        g.fillStyle = shade(plume, 0.62); for (const x of [64, 192]) g.fillRect(x - 4, 0, 8, 256);
      }, `rjPlume|${plume}`);
      b.solid("head", leafGeo(b.toM, V(0.66, base + 0.1, 0.34), V(1.7, 2.2, 0.1), V(0.1, 2.05, -1.25), 0.6, 0.2, 0.55), { map: fmap, ink: 0.0075 });
      // the brooch: a gold boss with a red stone in it
      b.put(b.solid("head", new THREE.SphereGeometry(0.15 * R, 16, 12), { col: band, ink: b.INK * 0.7 }), 0.7, base + 0.1, 0.4);
      b.put(b.solid("head", new THREE.SphereGeometry(0.085 * R, 12, 10), { col: gem, ink: b.INK * 0.5 }), 0.745, base + 0.1, 0.49);
    },
  };
};
/** ROMEO'S LOCKS (see the head of this file): n pairs of locks at the temples and the nape; cowlick = one more that
 *  stands up at the back of the crown (for the bare head) */
export const curls = (o: { col?: string; cowlick?: boolean } = {}): Acc => ({
  name: "curls", slots: [], key: ["rjCurls", o.col ?? "", !!o.cowlick].join("|"),
  build(b) {
    const col = o.col ?? b.look.hairCol;
    const lock = (p0: THREE.Vector3, p1: THREE.Vector3, p2: THREE.Vector3, wide: number, deep = 0.2) => b.solid("head", leafGeo(b.toM, p0, p1, p2, wide, deep, 0.45), { col, paint: "hair", ink: 0.0075 });
    for (const s of [-1, 1]) {
      // behind the ear: out from under the cap, down, and a small flick outward
      lock(V(s * 0.82, 0.3, -0.26), V(s * 1.08, -0.1, -0.32), V(s * 1.14, -0.42, -0.26), 0.3, 0.16);
      // the nape
      lock(V(s * 0.5, 0.1, -0.8), V(s * 0.68, -0.3, -0.98), V(s * 0.74, -0.62, -0.88), 0.36, 0.18);
    }
    lock(V(0, 0.12, -0.86), V(0, -0.32, -1.06), V(0.06, -0.68, -0.94), 0.4, 0.18);
    if (o.cowlick) lock(V(0.1, 0.86, -0.3), V(0.3, 1.32, -0.42), V(0.62, 1.3, -0.2), 0.3, 0.16);
  },
});

// ------------------------------------------------------------------------------------------------------- Juliet
/** THE JULIET CAP (see the head of this file): gold = the net, pearl = the pearls; back = how far it is tipped toward
 *  the back of the head (deg); to = how far down from its own top it reaches (deg) */
export const julietCap = (o: { gold?: string; pearl?: string; back?: number; to?: number } = {}): Acc => {
  const gold = o.gold ?? "#e2b03a", pearl = o.pearl ?? "#fbf6ea", back = o.back ?? 20, to = o.to ?? 44;
  return {
    name: "julietCap", slots: ["crown"], key: ["rjJulietCap", gold, pearl, back, to].join("|"), noHairProps: true,
    build(b) {
      b.tilt(0, -back);
      const map = b.tex(512, 256, (g) => {
        // (u round the head, v = 1 at the cap's top .. 0 at its rim) the hair shows through a diamond net of gold
        g.fillStyle = shade(b.look.hairCol, 1.25); g.fillRect(0, 0, 512, 256);
        g.strokeStyle = gold; g.lineWidth = 7; g.lineCap = "round";
        const N = 12, step = 512 / N;
        for (let i = -N; i < 2 * N; i++) { g.beginPath(); g.moveTo(i * step, 256); g.lineTo(i * step + 256 * 0.9, 0); g.stroke(); g.beginPath(); g.moveTo(i * step, 256); g.lineTo(i * step - 256 * 0.9, 0); g.stroke(); }
        // pearls where the cords cross, on the two lower rows
        g.fillStyle = pearl; g.strokeStyle = shade(pearl, 0.6); g.lineWidth = 2;
        for (const m of [3, 5]) for (let i = -1; i <= N; i++) { g.beginPath(); g.ellipse((i + m / 2) * step, 256 - (m * step) / 1.8, 8.5, 9.5, 0, 0, 7); g.fill(); g.stroke(); }
        // the rim: a gold band with a row of pearls on it
        g.fillStyle = gold; g.fillRect(0, 256 - 46, 512, 46);
        g.fillStyle = shade(gold, 0.55); g.fillRect(0, 256 - 49, 512, 5);
        g.fillStyle = pearl; g.strokeStyle = shade(pearl, 0.6);
        for (let i = 0; i < 2 * N; i++) { g.beginPath(); g.ellipse((i + 0.5) * step * 0.5, 256 - 23, 9.5, 12, 0, 0, 7); g.fill(); g.stroke(); }
      }, `rjJulietCap|${gold}|${pearl}|${b.look.hairCol}`);
      b.shell({ r: 1.075, from: 0, to, map, rimInk: 0.007, tuck: 9, onR: 1.03 });
    },
  };
};
/** JULIET'S TRESSES (see the head of this file): len = how far below the head's middle they end (head radii); ribbon =
 *  the binding's colour (false = none) */
export const tresses = (o: { col?: string; ribbon?: string | false; len?: number } = {}): Acc => {
  const ribbon = o.ribbon === undefined ? "#e2b03a" : o.ribbon, len = o.len ?? 1.8;
  return {
    name: "tresses", slots: [], key: ["rjTresses", o.col ?? "", ribbon, len].join("|"),
    build(b) {
      const col = o.col ?? b.look.hairCol;
      const map = b.tex(64, 256, (g) => {
        // (v runs along the tress, 0 at the temple .. 1 at its end) strands, then the ribbon wound three times near the end
        g.fillStyle = "#ffffff"; g.fillRect(0, 0, 64, 256);
        g.strokeStyle = "#8a8490"; g.lineWidth = 2.4; for (let x = 5; x < 64; x += 10) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x + 3, 256); g.stroke(); }
      }, "rjTressStrands");
      for (const s of [-1, 1]) {
        const p0 = V(s * 0.82, 0.42, 0.14), p1 = V(s * 1.13, -0.5, 0.2), p2 = V(s * 0.9, -len, 0.34);
        b.solid("head", leafGeo(b.toM, p0, p1, p2, 0.4, 0.3, 0.46), { col, map, paint: "hair", ink: 0.0075 });
        if (ribbon) {
          // three small rings round the tress near its end (balls: a ring's hull would open seen edge-on)
          for (const t of [0.72, 0.8, 0.88]) {
            const q = 1 - t, c = V().addScaledVector(p0, q * q).addScaledVector(p1, 2 * q * t).addScaledVector(p2, t * t), w = 0.5 * Math.sin(Math.PI * t ** 1) ** 0.6;
            const ring = new THREE.SphereGeometry(b.R * (0.08 + 0.2 * w), 14, 10); ring.scale(1.06, 0.3, 1.0);
            b.put(b.solid("head", weld(ring), { col: ribbon, ink: 0.005 }), c.x, c.y, c.z);
          }
        }
      }
    },
  };
};
/** a soft roll of hair over the head from ear to ear (see the head of this file) */
export const hairRoll = (o: { col?: string; yaw?: number; deep?: number; across?: number } = {}): Acc => ({
  name: "hairRoll", slots: [], key: ["rjHairRoll", o.col ?? "", o.yaw ?? 12, o.deep ?? 0.14, o.across ?? 0.26].join("|"),
  build(b) {
    const g = hoop(b.toM, { r: 1.07, a0: -84, a1: 84, deep: o.deep ?? 0.14, across: o.across ?? 0.26, yaw: o.yaw ?? 12, e: 0.8 });
    b.solid("head", weld(g), { col: o.col ?? b.look.hairCol, paint: "hair", ink: 0.007 });
  },
});

// ------------------------------------------------------------------------------------------------------- the Friar
/** THE TONSURE (see the head of this file). It is a "hat" to the rig (rim = how far down from the crown the bare skin
 *  reaches, deg; hair "cut": the rig then leaves the fringe out and lets the hair show only under the rim from the
 *  temples back, which is exactly a tonsure's ring), and the bare patch is a skin-coloured shell lying on the head.
 *  tufts = a soft tuft of hair over each ear. col = the patch's colour (the lit skin, near white). */
export const tonsure = (o: { rim?: number; col?: string; tufts?: boolean } = {}): Acc => {
  const rim = o.rim ?? 50, tufts = o.tufts ?? true;
  return {
    name: "tonsure", slots: ["hat", "crown"], key: ["rjTonsure", rim, o.col ?? "", tufts].join("|"), hat: { rim, hair: "cut", shade: false },
    build(b) {
      if (tufts) {
        const col = b.look.hairCol;
        for (const s of [-1, 1]) {
          b.solid("head", leafGeo(b.toM, V(s * 0.88, 0.22, -0.06), V(s * 1.16, 0.06, -0.1), V(s * 1.1, -0.3, -0.02), 0.36, 0.18, 0.45), { col, paint: "hair", ink: 0.0075 });
          b.solid("head", leafGeo(b.toM, V(s * 0.76, 0.26, -0.48), V(s * 1.04, 0.06, -0.6), V(s * 0.98, -0.32, -0.5), 0.38, 0.18, 0.45), { col, paint: "hair", ink: 0.0075 });
        }
      }
      b.shell({ r: 1.014, from: 0, to: rim + 1, col: o.col ?? "#f3e9e3", ink: 0 });
    },
  };
};
/** THE FRIAR'S RING OF HAIR (v2, 22 Nov: replaces the tonsure shell, whose cap of skin read as a glass visor): the head
 *  is bald (people.ts Person.bald clears the rig's painted hair), and the ring is a horseshoe of soft tufts lying on
 *  the skull from the temples round the back, fullest over the ears (the classic friar's crown seen from the front as
 *  two puffs). col = the hair (default the look's), y = the ring's height on the head (head units), puff = how far the
 *  side tufts stand out. */
export const hairRing = (o: { col?: string; y?: number; puff?: number } = {}): Acc => {
  const y0 = o.y ?? 0.1, puff = o.puff ?? 1;
  return {
    name: "hairRing", slots: [], key: ["rjHairRing", o.col ?? "", y0, puff].join("|"),
    build(b) {
      const col = o.col ?? b.look.hairCol;
      // P(az, y, r): a point at azimuth az (deg from the face toward the person's left), height y, radius r (head units)
      const P = (az: number, y: number, r: number) => { const c = Math.sqrt(Math.max(0, 1 - y * y)), a = rad(az); return V(r * c * Math.sin(a), y, r * c * Math.cos(a)); };
      const tuft = (az: number, k: number) => {
        // a lock lying on the skull: from above the ring down over it and back in, standing out by k at its fullest
        b.solid("head", leafGeo(b.toM, P(az, y0 + 0.34, 0.985), P(az, y0 + 0.02, 1.0 + 0.17 * k * puff), P(az, y0 - 0.34, 0.99), 0.2 + 0.05 * k, 0.36 + 0.08 * k, 0.5), { col, paint: "hair", ink: 0.0075 });
      };
      for (const s of [-1, 1]) {
        for (const [az, k] of [[84, 0.85], [103, 1.15], [121, 1.0], [139, 0.8], [156, 0.65], [170, 0.55]] as const) tuft(s * az, k);
      }
      tuft(180, 0.5);
    },
  };
};
export { rad };
