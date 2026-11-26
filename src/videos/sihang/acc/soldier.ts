// THE WARDROBE of 采访八百壮士的一天: what the men of the 88th Division's 524th Regiment wear, for the rig3d figures of
// group/kit (imported, never edited). 1937: German-pattern steel helmets, a field tunic with four pockets and a stand
// collar, a leather belt, cloth puttees. No badge, no flag and no emblem is drawn anywhere on the figures.
//   m35(o)        the steel helmet: a round dome pulled low, a short peak, a skirt that flares over the ears and neck.
//                 size > 1 = a helmet a size too big (满仓: it sits lower and rocks back). slot hat
//   fieldCap(o)   an officer's soft peaked field cap (谢晋元, 杨瑞符 off duty). slot hat
//   brodie(o)     the flat "soup plate" helmet of the British soldiers at the Settlement end of the bridge. slot hat
//   fedora(o)     a civilian felt hat with a ribbon (the newsmen and the crowd on the south bank). slot hat
//   tunic(o)      painted on the body: collar, front buttons, four pockets, the belt; `strap` = an officer's cross
//                 strap; `sling` = a soldier's canvas bandolier across the chest; `grenades` = stick grenades tied
//                 round the waist in a cloth band (scene D). slot coat
//   rifle(o)      a rifle held upright by its hand, the butt near the floor (that arm stays down). name "rifle"
//   sack(o)       a full grain sack on the shoulder, held by one hand. name "sack"
//   pencil(o)     nothing: she writes; kept out
import * as THREE from "three";
import type { Acc, OutfitKit, P2 } from "../../group/kit/rig3d";
import { rad, shade, roundBox, turned } from "../../group/kit/rigacc/shapes";

const ring = (c: OutfitKit, t0: number, t1: number, col: string) => c.poly([c.P(-180, t1), c.P(180, t1), c.P(180, t0), c.P(-180, t0)], col);
const hoop = (c: OutfitKit, t: number, col: string, lw: number) => c.line([c.P(-180, t), c.P(180, t)], col, lw);
const rect = (c: OutfitKit, az: number, t: number, wm: number, ht: number, col: string, stroke?: string, lw = 4) => {
  const a = c.az(wm, t) / 2; c.poly([c.P(az - a, t + ht / 2), c.P(az + a, t + ht / 2), c.P(az + a, t - ht / 2), c.P(az - a, t - ht / 2)], col, stroke, lw);
};
const disc = (c: OutfitKit, az: number, t: number, rm: number, col: string, stroke?: string, lw = 3) => {
  const [x, y] = c.P(az, t), rx = (c.az(rm, t) / 360) * c.W, ry = rm * c.pxUp(t), g = c.g;
  for (const dx of [0, -c.W, c.W]) {
    if (x + dx + rx < 0 || x + dx - rx > c.W) continue;
    g.beginPath(); g.ellipse(x + dx, y, rx, ry, 0, 0, 7); g.fillStyle = col; g.fill();
    if (stroke) { g.strokeStyle = stroke; g.lineWidth = lw; g.stroke(); }
  }
};

export const UNI = {
  /** the tunic's cloth: a worn yellow-green khaki; its darker fold; the trousers */
  cloth: "#8c8a5e", clothLo: "#77764e", trousers: "#807f58",
  /** puttees (lighter, washed out), cloth shoes */
  puttee: "#a39c7c", shoe: "#4a4234",
  /** the helmet's paint, leather, canvas, wood, steel */
  steel: "#5c6656", leather: "#6b4a2e", canvas: "#b9ad8a", wood: "#6e4c30", gun: "#3b3d42",
  /** the British khaki and their helmet */
  brit: "#9a8c62", britHelm: "#6f7257",
} as const;

// ------------------------------------------------------------------------------------------------------- headwear
/** THE STEEL HELMET (see the head of this file). size: 1 = fitted; 1.12 = a size too big. tip = degrees it rocks back */
export const m35 = (o: { col?: string; size?: number; tip?: number; lean?: number } = {}): Acc => {
  const col = o.col ?? UNI.steel, k = o.size ?? 1, tip = o.tip ?? 0, lean = o.lean ?? 0;
  return {
    name: "m35", slots: ["hat", "crown"], key: ["shM35", col, k, tip, lean].join("|"), hat: { rim: k > 1.05 ? 63 : 59 },
    build(b) {
      const r = 1.1 * k, sq = 1.03, to = k > 1.05 ? 62 : 58, rimR = r * Math.sin(rad(to)), rimY = r * Math.cos(rad(to)) * sq, rIn = rimR - 0.24;
      if (tip || lean) b.tilt(lean, -tip);
      const m = b.paint("head", { col });
      b.shell({ r, to, squash: sq, mat: m });
      // the German-pattern shape: a short peak over the brows, and a skirt that comes straight DOWN over the ears and
      // the nape, flaring a little (two brims: the peak nearly level, the skirt steep)
      const dv = 0.36, ds = 1.3, sm = (a: number, c: number, x: number) => { const q = Math.max(0, Math.min(1, (x - a) / (c - a))); return q * q * (3 - 2 * q); };
      b.solid("head", b.brim({ rIn, y: rimY + dv * (rimR - rIn) + 0.012, out: (az) => rimR - rIn + 0.03 + 0.2 * k * Math.max(0, Math.cos(rad(az * 1.3))) ** 1.4, from: -68, to: 68, droop: dv, thick: 0.09, taper: 0.7, join: rimR + 0.003 }), { mat: m });
      b.solid("head", b.brim({ rIn, y: rimY + ds * (rimR - rIn) + 0.012, out: (az) => rimR - rIn + 0.03 + 0.2 * k * sm(0.72, 0.15, Math.cos(rad(az))), from: 38, to: 322, droop: ds, thick: 0.09, taper: 0.75, join: rimR + 0.003 }), { mat: m });
      // the two vent rivets, one a side, and the chin strap's stud
      for (const s of [-1, 1]) b.put(b.solid("head", new THREE.SphereGeometry(0.035 * b.R, 8, 6), { col: shade(col, 0.72), ink: 0 }), s * r * 0.86, 0.5 * sq, 0.28);
      if (tip || lean) b.tilt(0, 0);
    },
  };
};
/** AN OFFICER'S FIELD CAP: a soft crown, a short cloth peak (no badge) */
export const fieldCap = (o: { col?: string } = {}): Acc => {
  const col = o.col ?? UNI.cloth;
  return {
    name: "fieldCap", slots: ["hat", "crown"], key: ["shCap", col].join("|"), hat: { rim: 60 },
    build(b) {
      const R = b.R, r = 1.07, rim = 60, rimR = r * Math.sin(rad(rim)), rimY = r * Math.cos(rad(rim));
      b.shell({ r, from: 24, to: rim + 3, col: shade(col, 0.92), tuck: 9 });
      b.tilt(0, -6);
      const top = turned([[0.6 * R, -0.28 * R], [0.94 * R, 0], [1.02 * R, 0.2 * R], [0.9 * R, 0.36 * R], [0, 0.42 * R]], 0.06 * R);
      b.put(b.solid("head", top, { col }), 0, 0.62, 0);
      b.tilt(0, 0);
      const dIn = rimR - 0.03 - 0.76, show = (az: number) => 0.3 * Math.max(0, Math.cos(rad((az * 90) / 48))) ** 0.7;
      b.plate("head", b.brim({ rIn: 0.76, y: rimY + 0.02 + 0.5 * dIn, out: (az) => dIn + show(az), from: -48, to: 48, droop: 0.5, thick: (az) => { const x = Math.min(1, show(az) / 0.1); return 0.05 * x * x * (3 - 2 * x); } }), { col: shade(col, 0.7) });
      b.put(b.solid("head", roundBox(0.1 * R, 0.1 * R, 0.05 * R, 0.6), { col: shade(col, 0.6), ink: b.INK * 0.4 }), 0, 0.74, 0.84);   // a plain cloth button
    },
  };
};
/** THE BRITISH HELMET: a shallow bowl with a wide flat brim all round */
export const brodie = (o: { col?: string } = {}): Acc => {
  const col = o.col ?? UNI.britHelm;
  return {
    name: "brodie", slots: ["hat", "crown"], key: ["shBrodie", col].join("|"), hat: { rim: 52 },
    build(b) {
      const r = 1.08, sq = 0.86, to = 52, rimR = r * Math.sin(rad(to)), rimY = r * Math.cos(rad(to)) * sq, rIn = 0.55, droop = 0.2;
      const m = b.paint("head", { col });
      b.shell({ r, to, squash: sq, mat: m });
      b.solid("head", b.brim({ rIn, y: rimY + droop * (rimR - rIn) + 0.012, out: () => rimR - rIn + 0.34, droop, thick: 0.08, taper: 0.7, join: rimR + 0.003 }), { mat: m });
    },
  };
};
/** A FELT HAT with a ribbon (1930s Shanghai) */
export const fedora = (o: { col?: string; band?: string } = {}): Acc => {
  const col = o.col ?? "#6f6658", band = o.band ?? "#3b342c";
  return {
    name: "fedora", slots: ["hat", "crown"], key: ["shFedora", col, band].join("|"), hat: { rim: 50, hair: "keep", shade: true },
    build(b) {
      const R = b.R, r = 1.04, to = 50, rimR = r * Math.sin(rad(to)), rimY = r * Math.cos(rad(to));
      const crown = turned([[0.86 * R, 0], [0.84 * R, 0.14 * R], [0.8 * R, 0.5 * R], [0.62 * R, 0.62 * R], [0, 0.56 * R]], 0.05 * R), v = crown.userData.v as number[];
      const map = b.tex(8, 128, (g) => { g.fillStyle = col; g.fillRect(0, 0, 8, 128); g.fillStyle = band; g.fillRect(0, 128 * (1 - v[1]), 8, 128 * (v[1] - v[0]) + 1); }, `shFedora|${col}|${band}`);
      b.put(b.solid("head", crown, { map }), 0, rimY - 0.02, 0);
      b.solid("head", b.brim({ rIn: 0.5, y: rimY + 0.02, out: (az) => rimR - 0.5 + 0.36 + 0.06 * Math.cos(rad(az)), droop: 0.12, thick: 0.07, taper: 0.6, join: rimR * 0.9 }), { col });
    },
  };
};

// ------------------------------------------------------------------------------------------------------- the tunic
export type TunicO = { col?: string; belt?: string; strap?: boolean; sling?: boolean; grenades?: boolean; brit?: boolean; tabs?: string | false; worn?: number };
/** THE FIELD TUNIC (see the head of this file). worn 0..1 = dust and wear painted on (the men after three months) */
export const tunic = (o: TunicO = {}): Acc => {
  const belt = o.belt ?? UNI.leather, worn = o.worn ?? 0.5;
  return {
    name: "tunic", slots: ["coat"], key: ["shTunic", o.col ?? "", belt, !!o.strap, !!o.sling, !!o.grenades, !!o.brit, o.tabs ?? "", worn].join("|"),
    outfit(c) {
      const col = o.col ?? c.top, lo = c.shade(col, 0.82), ink = c.shade(col, 0.45), P = c.P, ch = c.chin, bt = 0.33;
      ring(c, 0, 1, col);
      // wear: paler patches at the shoulders and elbows' height, dust low down (seeded by position only)
      if (worn > 0) {
        const g = c.g;
        for (let i = 0; i < 26; i++) {
          const az = -180 + ((i * 137.5) % 360), t = 0.08 + ((i * 0.618) % 1) * 0.8, [x, y] = P(az, t), r = c.W * (0.02 + 0.02 * ((i * 7) % 5) / 5);
          g.globalAlpha = 0.1 * worn; g.fillStyle = i % 3 ? "#c9c3a0" : "#5a5638"; g.beginPath(); g.ellipse(x, y, r, r * 0.7, 0, 0, 7); g.fill();
        }
        c.g.globalAlpha = 1;
      }
      // the side seams
      for (const az of [-92, 92]) c.line([P(az, ch), P(az, 0.04)], lo, 5);
      // the skirt of the tunic below the belt, a touch darker, its front edges
      ring(c, 0, bt, lo);
      c.line([P(0, bt), P(0, 0.02)], ink, 4);
      // four pockets with pointed flaps: two on the chest, two bigger ones below the belt
      for (const s of [-1, 1]) {
        const a = s * 37, w = c.az(0.075, 0.6) / 2;
        c.poly([P(a - w, 0.66), P(a + w, 0.66), P(a + w, 0.5), P(a - w, 0.5)], col, ink, 4);
        c.poly([P(a - w, 0.665), P(a + w, 0.665), P(a + w, 0.615), P(a, 0.59), P(a - w, 0.615)], lo, ink, 4);
        disc(c, a, 0.607, 0.007, c.shade(col, 0.55));
        const w2 = c.az(0.09, 0.2) / 2, a2 = s * 44;
        c.poly([P(a2 - w2, 0.27), P(a2 + w2, 0.27), P(a2 + w2, 0.08), P(a2 - w2, 0.08)], lo, ink, 4);
        c.poly([P(a2 - w2, 0.275), P(a2 + w2, 0.275), P(a2 + w2, 0.22), P(a2, 0.2), P(a2 - w2, 0.22)], c.shade(col, 0.76), ink, 4);
      }
      // the front: a fly line and five dull buttons
      c.line([P(0, ch + 0.02), P(0, bt + 0.04)], ink, 4);
      for (const t of [0.7, 0.615, 0.53, 0.445, 0.385]) disc(c, 2.2, t, 0.0085, c.shade(col, 0.6), ink, 2.5);
      // the collar: a stand-and-fall collar closed at the throat, a plain cloth tab on each point (no insignia)
      const colT = ch - 0.012, tabs = o.tabs === undefined ? c.shade(col, 0.66) : o.tabs;
      c.poly([...Array.from({ length: 37 }, (_, i) => P(-180 + i * 10, 1)), ...Array.from({ length: 37 }, (_, i) => { const az = 180 - i * 10; return P(az, colT - 0.05 * Math.max(0, 1 - Math.abs(az) / 26)); })], lo, ink, 4);
      if (tabs) for (const s of [-1, 1]) c.poly([P(s * 5, colT + 0.012), P(s * 24, colT + 0.02), P(s * 22, colT - 0.03), P(s * 6, colT - 0.05)], tabs, ink, 3);
      // a soldier's canvas bandolier from the left shoulder to the right hip (pouches as stitched squares)
      if (o.sling) {
        const pts: P2[] = [], pts2: P2[] = [];
        for (let i = 0; i <= 12; i++) { const k = i / 12, az = 52 - 104 * k, t = 0.86 - 0.5 * k; pts.push(P(az - 6, t + 0.03)); pts2.push(P(az + 6, t - 0.03)); }
        c.poly([...pts, ...pts2.reverse()], UNI.canvas, c.shade(UNI.canvas, 0.5), 4);
        for (let i = 1; i <= 11; i += 2) { const k = i / 12, az = 52 - 104 * k, t = 0.86 - 0.5 * k; c.line([P(az - 5, t + 0.025), P(az + 5, t - 0.025)], c.shade(UNI.canvas, 0.6), 3); }
        // and round the back
        const b1: P2[] = [], b2: P2[] = [];
        for (let i = 0; i <= 12; i++) { const k = i / 12, az = 60 + 250 * k, t = 0.86 - 0.5 * k; b1.push(P(az, t + 0.035)); b2.push(P(az, t - 0.035)); }
        c.poly([...b1, ...b2.reverse()], UNI.canvas, c.shade(UNI.canvas, 0.5), 4);
      }
      // an officer's cross strap: thin leather from the right shoulder to the left hip
      if (o.strap) {
        const pts: P2[] = [], pts2: P2[] = [];
        for (let i = 0; i <= 12; i++) { const k = i / 12, az = -50 + 96 * k, t = 0.88 - 0.5 * k; pts.push(P(az - 3, t + 0.018)); pts2.push(P(az + 3, t - 0.018)); }
        c.poly([...pts, ...pts2.reverse()], belt, c.shade(belt, 0.5), 3);
        const b1: P2[] = [], b2: P2[] = [];
        for (let i = 0; i <= 12; i++) { const k = i / 12, az = -58 - 250 * k, t = 0.88 - 0.5 * k; b1.push(P(az, t + 0.02)); b2.push(P(az, t - 0.02)); }
        c.poly([...b1, ...b2.reverse()], belt, c.shade(belt, 0.5), 3);
      }
      // the belt and its plain buckle
      const h = 0.03, bi = c.shade(belt, 0.45);
      ring(c, bt - h, bt + h, belt); hoop(c, bt + h, bi, 4); hoop(c, bt - h, bi, 4);
      rect(c, 0, bt, 0.05, 0.085, "#8f8a78", "#4a463c", 4);
      rect(c, 0, bt, 0.022, 0.04, c.shade(belt, 0.8));
      if (!o.grenades && !o.brit) for (const s of [-1, 1]) rect(c, s * 62, bt - 0.015, 0.07, 0.11, c.shade(belt, 0.86), bi, 4);     // ammunition pouches
      // scene D: stick grenades tied in a cloth band round the waist (wooden handles up, grey heads down)
      if (o.grenades) {
        ring(c, bt - 0.02, bt + 0.11, UNI.canvas); hoop(c, bt + 0.11, c.shade(UNI.canvas, 0.5), 4); hoop(c, bt - 0.02, c.shade(UNI.canvas, 0.5), 4);
        for (let az = -170; az <= 170; az += 20) {
          rect(c, az, bt + 0.16, 0.018, 0.14, UNI.wood, c.shade(UNI.wood, 0.5), 3);
          rect(c, az, bt + 0.03, 0.04, 0.12, "#6a6e68", "#3a3d3a", 3);
        }
      }
    },
  };
};

// ------------------------------------------------------------------------------------------------------- held things
/** A RIFLE held upright beside the leg (the arm hangs): wood stock, steel barrel, a canvas sling */
export const rifle = (o: { hand?: 0 | 1; len?: number } = {}): Acc => {
  const hand = o.hand ?? 0, len = o.len ?? 1.08;
  return {
    name: "rifle", slots: [hand ? "hand1" : "hand0"], key: ["shRifle", hand, len].join("|"),
    build(b) {
      const g = b.held(hand, { offset: [hand ? 0.035 : -0.035, 0.02, 0.03], rot: [0.06, 0, hand ? -0.05 : 0.05], hang: true });
      const y0 = -0.5, wood = UNI.wood, steel = UNI.gun;
      // the stock: butt (wide) to fore-end
      const stock = turned([[0, 0], [0.03, 0], [0.034, 0.05], [0.024, 0.3], [0.02, 0.36], [0.022, 0.42], [0.02, len * 0.74], [0, len * 0.74]], 0.004, 10);
      stock.scale(1, 1, 1.5);
      b.solid(g, stock, { col: wood, ink: 0.006 }).position.set(0, y0, 0);
      const barrel = new THREE.CylinderGeometry(0.009, 0.011, len * 0.56, 8).translate(0, y0 + len * 0.72, 0.012);
      b.solid(g, barrel, { col: steel, ink: 0.005 });
      const bolt = roundBox(0.03, 0.05, 0.03, 0.4); b.solid(g, bolt, { col: steel, ink: 0.004 }).position.set(hand ? -0.02 : 0.02, y0 + 0.44, 0.012);
      const sling = new THREE.BoxGeometry(0.006, len * 0.5, 0.018).translate(0, y0 + len * 0.42, -0.03);
      b.solid(g, sling, { col: UNI.canvas, ink: 0.003 });
    },
  };
};
/** A GRAIN SACK on the shoulder (hand 1 holds it up; that arm is posed by the shot) */
export const sackHeld = (o: { hand?: 0 | 1; col?: string } = {}): Acc => {
  const hand = o.hand ?? 1, col = o.col ?? "#c9b993";
  return {
    name: "sack", slots: [hand ? "hand1" : "hand0"], key: ["shSack", hand, col].join("|"),
    build(b) {
      const g = b.held(hand, { offset: [hand ? -0.05 : 0.05, 0.03, -0.06], rot: [0.15, 0, hand ? 0.5 : -0.5], layer: "free" });
      const geo = new THREE.SphereGeometry(1, 16, 12); geo.scale(0.28, 0.13, 0.17);
      const map = b.tex(128, 64, (cg) => {
        cg.fillStyle = "#ffffff"; cg.fillRect(0, 0, 128, 64);
        cg.strokeStyle = "rgba(90,70,40,0.35)"; cg.lineWidth = 2;
        for (let x = 6; x < 128; x += 9) { cg.beginPath(); cg.moveTo(x, 0); cg.lineTo(x, 64); cg.stroke(); }
        cg.fillStyle = "rgba(150,60,40,0.55)"; cg.fillRect(40, 22, 30, 5); cg.fillRect(40, 32, 22, 5);
      }, "shSackTex");
      b.solid(g, geo, { col, map, ink: 0.007 });
      for (const s of [-1, 1]) { const ear = new THREE.ConeGeometry(0.035, 0.07, 6); ear.rotateZ(s * -1.1); b.solid(g, ear, { col: shade(col, 0.9), ink: 0.005 }).position.set(s * 0.27, 0.06, 0); }
    },
  };
};

/** his own steel helmet in his hand (scene D's end: 满仓 has taken it off) */
export const helmetHeld = (o: { hand?: 0 | 1; col?: string } = {}): Acc => {
  const hand = o.hand ?? 1, col = o.col ?? UNI.steel;
  return {
    name: "helmetHeld", slots: [hand ? "hand1" : "hand0"], key: ["shHelmHeld", hand, col].join("|"),
    build(b) {
      const g = b.held(hand, { offset: [hand ? -0.07 : 0.07, -0.03, 0.08], rot: [-1.15, 0, 0], layer: "free" });
      const dome = new THREE.SphereGeometry(0.2, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2); dome.scale(1, 0.86, 1.08);
      b.solid(g, dome, { col, ink: 0.007 });
      const rim = new THREE.TorusGeometry(0.21, 0.02, 6, 20); rim.rotateX(Math.PI / 2); rim.scale(1.06, 1, 1.14);
      b.solid(g, rim, { col: shade(col, 0.85), ink: 0.005 });
    },
  };
};
