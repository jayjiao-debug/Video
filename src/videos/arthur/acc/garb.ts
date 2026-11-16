// GARB: what the people of the Arthur film wear on the body and hold. Accessories for the kit's rig3d figures
// (group/kit/RIG3D.md, "角色道具"): each function returns an Acc, a figure takes them at creation:
//   rc.add(look, { acc: [tunic({ col: "#2f6fd0", scarf: "#d23b34" })] })                          // Arthur
//   rc.add(look, { acc: [surcoat({ col: "#c2332f", charge: "chevron", chargeCol: "#f2c230" }), scabbard()] })   // Kay
//   rc.add(look, { acc: [cloak({ col: "#2f5a3c", fur: "#ece4d2" }), beard({ col: "#b9b7b4" }), moustache(...)] }) // Ector
//   rc.add(look, { acc: [surcoat({ col: "#6f86a6", charge: "plain" }), spear()] })                // a guard
// Base Look for all of them: top "tee" (the plainest top: nothing of it shows through), bottom "chinos". The painted
// garments (tunic, surcoat) cover the whole body, trousers included; under a cloak alone the look's own top and
// trousers show in the cloak's opening, so give a cloak a tunic as well (the "coat" slot is free for it).
// Slots: tunic coat (+ neck with a scarf) | surcoat coat | cloak back, neck | beard chin | scabbard waist | spear
// hand0 / hand1. So tunic + scarf and cloak cannot be worn together (both take the neck): a cloaked figure's tunic
// goes without the scarf.
// The cape of the cloak and the scabbard hang: when the torso leans back (haul) they stay plumb instead of swinging
// through the legs with the body (see `plumb`). Nothing here is random or changes from frame to frame.
// Beards: give a colour clearly darker than the skin (the light bleaches skin to near white: a white or pale grey
// beard is only an outline; "#a09e9b" is about the lightest grey that reads), and the hair's own colour (the sideburns
// run up into the hair). Under a hood or a cap a full beard leaves only a band round the eyes bare: use stubble or a
// moustache there.
import * as THREE from "three";
import type { Acc, OutfitKit, P2, PartKit } from "../../group/kit/rig3d";
import { dimsOf } from "../../group/kit/toon";
import { turned, roundBox, shade } from "../../group/kit/rigacc/shapes";

const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (x: number) => { const t = clamp(x, 0, 1); return t * t * (3 - 2 * t); };
const rad = (d: number) => (d * Math.PI) / 180;
const GOLD = "#e9b53a", LEATHER = "#5b3a22", LINEN = "#efe6d2", STEEL = "#cfd4dc", MAIL = "#7f8894", DARK = "#2a2230";
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
/** a seeded number 0..1 that belongs to this look (k: which one) */
const seeded = (seed: number, k: number) => { const x = Math.sin((seed + 1) * 12.9898 + k * 78.233) * 43758.5453; return x - Math.floor(x); };
/** a leather belt round the waist at height t: a buckle in front, and (tail) its free end hanging from the buckle */
const beltOn = (c: OutfitKit, t: number, col: string, buckle: string | null, tail: boolean) => {
  const h = 0.036, ink = c.shade(col, 0.42), P = c.P;
  ring(c, t - h, t + h, col); hoop(c, t + h, ink, 4); hoop(c, t - h, ink, 4);
  if (tail) { const a = c.az(0.034, t), w = c.az(0.015, t); c.poly([P(a - w, t - h), P(a + w, t - h), P(a + w * 1.15, t - 0.19), P(a, t - 0.235), P(a - w * 1.15, t - 0.19)], col, ink, 4); }
  if (buckle) {
    const a = c.az(0.031, t), b = c.az(0.014, t);
    c.poly([P(-a, t + 0.062), P(a, t + 0.062), P(a, t - 0.062), P(-a, t - 0.062)], buckle, c.shade(buckle, 0.42), 5);
    c.poly([P(-b, t + 0.026), P(b, t + 0.026), P(b, t - 0.026), P(-b, t - 0.026)], c.shade(col, 0.8));
  }
};

/** A plain belted tunic, painted over the whole top and the trousers: the body colour (default: the look's topCol),
 *  a round neckline with a short laced slit, a leather belt with a buckle and a hanging end, a few folds in the
 *  skirt. hem = a contrasting band along the bottom. scarf = a short neckerchief: a band round the neck, a triangle
 *  at the throat, the knot and two short ends at the back (Arthur's is red). */
export const tunic = (o: { col?: string; belt?: string; buckle?: string; scarf?: string | false; hem?: string | false; lace?: boolean } = {}): Acc => {
  const scarf = o.scarf || false, hem = o.hem || false, lace = o.lace ?? true, belt = o.belt ?? LEATHER, buckle = o.buckle ?? GOLD;
  return {
    name: "tunic", slots: scarf ? ["coat", "neck"] : ["coat"], key: [o.col ?? "", belt, buckle, scarf, hem, lace].join("|"),
    outfit(c) {
      const col = o.col ?? c.top, ink = c.shade(col, 0.36), fold = c.shade(col, 0.8), P = c.P, bt = 0.37;
      ring(c, 0, 1, col);
      // the skirt below the belt: a few folds
      for (const az of [-152, -104, -58, -24, 20, 62, 110, 156]) c.line([P(az, bt - 0.08), P(az + 3, hem ? 0.13 : 0.07)], fold, 5);
      if (hem) { ring(c, 0, 0.125, hem); hoop(c, 0.125, c.shade(hem, 0.45), 5); }
      // the neckline: a facing band round a linen shirt, and a short slit below it, laced
      const nb = c.chin - 0.075, na = 25, U = (a: number, lo: number): P2[] => [P(-a, 1), ...bend(P(-a, c.chin + 0.03), P(-a * 0.92, lo), P(0, lo)), ...bend(P(0, lo), P(a * 0.92, lo), P(a, c.chin + 0.03)).slice(1), P(a, 1)];
      if (!scarf) {
        c.poly(U(na + 7, nb - 0.035), c.shade(col, 0.72), ink, 4);
        c.poly(U(na, nb), LINEN);
        if (lace) {
          c.line([P(0, nb - 0.035), P(0, nb - 0.16)], ink, 6);
          for (const t of [nb - 0.07, nb - 0.115]) c.line([P(-5.5, t), P(5.5, t)], LINEN, 5);
        }
      }
      beltOn(c, bt, belt, buckle, true);
      if (scarf) {
        const sk = c.shade(scarf, 0.45), lo = c.chin - 0.07, tip = c.chin - 0.31, half = 46;
        c.poly([P(-180, 1), P(180, 1), P(180, lo), P(half, lo), P(0, tip), P(-half, lo), P(-180, lo)], scarf);
        c.line([P(-180, lo), P(-half, lo), P(0, tip), P(half, lo), P(180, lo)], sk, 5);
        c.line([P(-half * 0.5, lo - 0.01), P(-4, tip + 0.075)], c.shade(scarf, 0.8), 5);
        // the knot at the back of the neck and its two ends
        for (const s of [-1, 1]) c.poly([P(180 + s * 2, lo + 0.03), P(180 + s * 22, lo - 0.15), P(180 + s * 10, lo - 0.2), P(180, lo - 0.03)], scarf, sk, 4);
        disc(c, 180, lo + 0.015, 0.02, scarf, sk, 4);
      }
    },
  };
};

/** A knight's sleeveless surcoat over mail, painted over the whole top and the trousers. The heraldic colour fills
 *  the chest, the back and the skirt with ONE bold geometric charge: chevron = an inverted V, pale = a vertical
 *  stripe, bend = a diagonal band, quarter = quartered in the two colours, fess = a horizontal band, plain = none.
 *  Mail (steel grey with a faint ring pattern) shows in the wide arm openings and at the neck; mail false = the
 *  look's own top shows there instead. A sword belt at the waist. */
export const surcoat = (o: { col?: string; charge?: "chevron" | "pale" | "bend" | "quarter" | "fess" | "plain"; chargeCol?: string; mail?: string | false; belt?: string } = {}): Acc => {
  const col = o.col ?? "#c2332f", charge = o.charge ?? "chevron", cc = o.chargeCol ?? "#f2c230", mail = o.mail === false ? null : o.mail ?? MAIL, belt = o.belt ?? "#4a3020";
  return {
    name: "surcoat", slots: ["coat"], key: [col, charge, cc, mail ?? "none", belt].join("|"),
    outfit(c) {
      const P = c.P, ink = c.shade(col, 0.36), bt = 0.335, g = c.g, under = mail ?? c.top;
      ring(c, 0, 1, col);
      // the charge, on the chest and again on the back
      for (const m of [0, 180]) {
        const Q = (az: number, t: number) => P(m + az, t);
        if (charge === "chevron") c.poly([Q(0, 0.78), Q(64, 0.515), Q(64, 0.395), Q(0, 0.66), Q(-64, 0.395), Q(-64, 0.515)], cc);
        else if (charge === "pale") c.poly([Q(-17, 1), Q(17, 1), Q(17, 0), Q(-17, 0)], cc);
        else if (charge === "bend") c.poly([Q(-70, 0.9), Q(-36, 0.9), Q(70, 0.06), Q(36, 0.06)], cc);
        else if (charge === "fess") c.poly([Q(-90, 0.66), Q(90, 0.66), Q(90, 0.5), Q(-90, 0.5)], cc);
        else if (charge === "quarter") { c.poly([Q(-90, 1), Q(0, 1), Q(0, bt), Q(-90, bt)], cc); c.poly([Q(0, bt), Q(90, bt), Q(90, 0), Q(0, 0)], cc); }
      }
      // the skirt is split in front and behind
      for (const m of [0, 180]) c.line([P(m, bt - 0.04), P(m, 0.03)], ink, 5);
      beltOn(c, bt, belt, GOLD, false);
      // what shows of the mail: two deep arm openings and a round neck opening in front and behind
      const holes: P2[][] = [];
      for (const s of [-1, 1]) holes.push([P(s * 47, 1), ...bend(P(s * 49, 0.86), P(s * 54, 0.47), P(s * 90, 0.47)), ...bend(P(s * 90, 0.47), P(s * 126, 0.47), P(s * 131, 0.86)).slice(1), P(s * 133, 1)]);
      for (const m of [0, 180]) holes.push([P(m - 27, 1), ...bend(P(m - 27, c.chin + 0.03), P(m - 25, c.chin - 0.085), P(m, c.chin - 0.085)), ...bend(P(m, c.chin - 0.085), P(m + 25, c.chin - 0.085), P(m + 27, c.chin + 0.03)).slice(1), P(m + 27, 1)]);
      for (const dx of [0, -c.W, c.W]) {
        g.save(); g.beginPath();
        for (const h of holes) { h.forEach(([x, y], i) => (i ? g.lineTo(x + dx, y) : g.moveTo(x + dx, y))); g.closePath(); }
        g.clip();
        g.fillStyle = under; g.fillRect(0, 0, c.W, c.H);
        if (mail) {
          // rings: rows of low arcs, every other row shifted by half a ring; two tones close together, so that at a
          // distance they melt into one grey instead of shimmering
          g.strokeStyle = c.shade(mail, 0.88); g.lineWidth = 4.5; g.lineCap = "round";
          for (let j = 0, y = 4; y < c.H; y += 15, j++) for (let x = (j % 2) * 13 - 13; x < c.W + 13; x += 26) { g.beginPath(); g.arc(x, y, 10.5, 0.12 * Math.PI, 0.88 * Math.PI); g.stroke(); }
        }
        g.restore();
      }
      for (const h of holes) c.line(h.slice(1, -1), ink, 6);
    },
  };
};

// ===== hanging parts =====
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
/** Makes parts that were built on the body hang from the point `at` (body metres): when the torso leans back by up
 *  to `back` radians, or forward by up to `fwd`, they keep hanging straight down instead of swinging with it. (A
 *  cape that is rigid on the back swings forward through the legs when its wearer leans back to haul.) The parts
 *  move into a group whose turn about the body's left-right axis is set from the torso's own lean whenever its
 *  matrix is brought up to date: a pure function of the pose, nothing is kept from frame to frame. */
const plumb = (parts: THREE.Object3D[], at: THREE.Vector3, o: { back: number; fwd: number }) => {
  const torso = parts[0].parent!, pv = new THREE.Group();
  pv.position.copy(at); torso.add(pv);
  for (const p of parts) { pv.add(p); p.position.sub(at); }
  const base = pv.updateMatrixWorld;
  pv.updateMatrixWorld = function (force?: boolean) {
    // the torso's forward axis in the world: its y part is the sine of the lean (+ = leaning back)
    const e = torso.matrixWorld.elements, l = Math.hypot(e[8], e[9], e[10]) || 1;
    pv.rotation.x = clamp(Math.asin(clamp(e[9] / l, -1, 1)), -o.fwd, o.back);
    base.call(pv, force);
  };
  return pv;
};

/** the cape: a slab of cloth bent round the back of the body's axis. Points are given by height y (body metres),
 *  s = -1..1 across; mid(y) = the radius of its middle surface, half(y) = the half angle it spans (radians from the
 *  back), th = thickness. The hem is scalloped and its corners are rounded off. uv: the outer face has u 0.05..0.45,
 *  the inner 0.55..0.95; v = 1 at the top .. 0 at the hem. */
const capeGeo = (f: { yTop: number; yHem: number; mid: (y: number) => number; half: (y: number) => number; th: number; scallop: number; fold: number }) => {
  const NS = 40, NV = 34, R = f.th / 2, pos: number[] = [], uv: number[] = [], idx: number[] = [], len = f.yTop - f.yHem;
  const wHem = f.mid(f.yHem) * f.half(f.yHem), rc = 0.07;
  for (const side of [1, -1]) for (let j = 0; j <= NV; j++) for (let i = 0; i <= NS; i++) {
    const s = -Math.cos((Math.PI * i) / NS), v = (1 - Math.cos((Math.PI * j) / NV)) / 2;
    // the hem: three soft scallops, lifted into a round corner at each side
    const k = clamp((Math.abs(s) * wHem - (wHem - rc)) / rc, 0, 1), hem = f.yHem + f.scallop * (0.5 - 0.5 * Math.cos(s * Math.PI * 3)) + rc * (1 - Math.sqrt(1 - k * k));
    const y = f.yTop - v * (f.yTop - hem), ph = s * f.half(y), mid = f.mid(y) + f.fold * Math.cos(s * Math.PI * 3) * smooth((f.yTop - y) / len - 0.35);
    // thickness: full inside, rounded off to nothing at the edge
    const dx = (1 - Math.abs(s)) * mid * f.half(y), dy = Math.min(v, 1 - v) * (f.yTop - hem), ex = 1 - Math.min(1, dx / R), ey = 1 - Math.min(1, dy / R);
    const rho = mid + side * R * Math.sqrt(Math.max(0, 1 - Math.min(1, ex * ex + ey * ey)));
    pos.push(rho * Math.sin(ph), y, -rho * Math.cos(ph));
    uv.push((side > 0 ? 0.25 : 0.75) + 0.2 * s, 1 - v);
  }
  const n = (NS + 1) * (NV + 1);
  for (let sd = 0; sd < 2; sd++) for (let j = 0; j < NV; j++) for (let i = 0; i < NS; i++) {
    const A = sd * n + j * (NS + 1) + i, B = A + 1, C = A + NS + 1, D = C + 1;
    if (sd === 0) idx.push(A, B, C, C, B, D); else idx.push(A, C, B, B, C, D);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  return weld(g);
};

/** the lower edge of a fur collar at azimuth az (degrees): where it sits and how it bulges, per look */
const FUR_LO = 0.6, FUR_LUMPS = 13;

/** A cloak. Painted on the clothes: the cloth over both shoulders and all of the back, its edges (lined) coming
 *  down the chest from a round clasp at the throat, and with fur a pale, lumpy collar round the neck and shoulders.
 *  On the back a cape hangs from under the head to about knee height (len = 0..1 of that; default 1): as wide as
 *  the body beside it, where the arms swing, and flaring out and back below it, so that from the front it shows
 *  wide behind the legs. Its inside is the lining's colour. The cape hangs plumb when its wearer leans back. */
export const cloak = (o: { col?: string; lining?: string; fur?: string | false; clasp?: string; len?: number } = {}): Acc => {
  const col = o.col ?? "#7a2f8f", lining = o.lining ?? shade(col, 0.66), fur = o.fur || false, clasp = o.clasp ?? GOLD, len = clamp(o.len ?? 1, 0, 1);
  const key = [col, lining, fur, clasp, len].join("|");
  return {
    name: "cloak", slots: ["back", "neck"], key,
    outfit(c) {
      const P = c.P, ink = c.shade(col, 0.36), ct = c.chin - 0.075;
      // the cloth: everything but an opening in front that widens downward from the clasp
      const edge = (s: number): P2[] => bend(P(0, ct), P(s * 30, ct - 0.2), P(s * 62, 0));
      for (const s of [-1, 1]) c.poly([P(s * 180, 1), P(0, 1), ...edge(s), P(s * 180, 0)], col);
      for (const s of [-1, 1]) { c.line(edge(s), ink, 21); c.line(edge(s), lining, 12); }
      if (fur) {
        // the collar: a row of lumps along its lower edge, then the band over their upper halves
        const fi = c.shade(fur, 0.5), fs = c.shade(fur, 0.86), sd = c.look.seed;
        for (let k = 0; k < FUR_LUMPS; k++) disc(c, -180 + (360 * (k + 0.5)) / FUR_LUMPS, FUR_LO + 0.012 * (seeded(sd, k) - 0.5), 0.036 + 0.006 * seeded(sd, 20 + k), fur, fi, 5, 0.8);
        ring(c, FUR_LO + 0.012, 1, fur);
        for (let k = 0; k < 22; k++) { const az = -180 + (360 * (k + seeded(sd, 40 + k) * 0.6)) / 22, t = FUR_LO + 0.03 + 0.15 * seeded(sd, 70 + k); c.line([P(az, t), P(az + 2.5, t - 0.035)], fs, 5); }
      }
      disc(c, 0, ct, 0.027, clasp, c.shade(clasp, 0.4), 5);
      disc(c, -1.6, ct + 0.012, 0.009, c.shade(clasp, 1.35));
    },
    build(b) {
      const F = stand(b), Ht = b.Ht, th = 0.036;
      // from under the head down to knee height (the knee is halfway down the leg); beside the body it follows the
      // body's back and is no wider than the body (the hands swing past its edges); below the body it flares
      const yTop = 0.9 * Ht, knee = -(F.hipY * 0.5 - 0.02), yHem = lerp(-0.03, knee, len), yFl = 0.26 * Ht;
      const back = (y: number) => b.bodyR(clamp(y / Ht, 0.3, 0.9), 180);
      const flare = (y: number) => smooth((yFl - y) / (yFl - knee));
      const g = capeGeo({
        yTop, yHem, th, scallop: 0.022, fold: 0.007,
        // (its inner face is a centimetre inside the body, its outer face 2.6 cm clear of it: never skin deep)
        mid: (y) => back(y) + 0.008 + 0.105 * flare(y),
        half: (y) => rad(lerp(60, 66, flare(y))) * (1 - 0.25 * smooth((y / Ht - 0.72) / 0.18)),
      });
      // its colours: the outer face (with the collar's fur across the top, level with the painted one), the lining
      const total = yTop - yHem, map = b.tex(256, 512, (cg) => {
        cg.fillStyle = col; cg.fillRect(0, 0, 128, 512); cg.fillStyle = lining; cg.fillRect(128, 0, 128, 512);
        if (fur) {
          const yb = ((yTop - FUR_LO * Ht) / total) * 512, r = 15;
          cg.fillStyle = fur; cg.strokeStyle = shade(fur, 0.5); cg.lineWidth = 3;
          for (let k = 0; k < 5; k++) { cg.beginPath(); cg.ellipse(12.8 + k * 25.6, yb, 14.5, r, 0, 0, 7); cg.fill(); cg.stroke(); }
          cg.fillRect(0, 0, 128, yb);
          cg.strokeStyle = shade(fur, 0.86); cg.lineWidth = 3; cg.lineCap = "round";
          for (let k = 0; k < 7; k++) { const x = 10 + k * 17, y = yb * (0.3 + 0.5 * seeded(7, k)); cg.beginPath(); cg.moveTo(x, y); cg.lineTo(x + 2, y + 10); cg.stroke(); }
        }
      }, `${key}|${Math.round(total * 1000)}|${Math.round(Ht * 1000)}`);
      const cape = b.solid("body", g, { map, paint: "cloth" });
      plumb([cape], new THREE.Vector3(0, yTop - 0.02, -back(yTop)), { back: 0.7, fwd: 0 });
      // the arms keep off the upper cape (the elbows of hanging arms point back)
      for (const sx of [-1, 1]) for (const t of [0.34, 0.62]) b.keepOut(new THREE.Vector3(sx * 0.42 * b.rb, t * Ht, -(back(t * Ht) + 0.012)), 0.036);
    },
  };
};

/** A beard, drawn on the face under the mouth and the other features (the mouth is drawn on top of it and every
 *  expression keeps working). full = over the jaw and the chin up to the cheeks and under the nose; short = trimmed
 *  along the jaw; fork = a full beard that ends in two points; stubble = a shadow of dots. col: default the look's
 *  hair colour. A beard as dark as the ink goes round the mouth instead (the mouth stays on bare skin, where its line reads). With
 *  a moustache of the kit (slot lip) the mouth sits lower, and the beard goes with it. */
export const beard = (o: { col?: string; kind?: "full" | "short" | "fork" | "stubble" } = {}): Acc => {
  const kind = o.kind ?? "full";
  return {
    name: "beard", slots: ["chin"], key: `${kind}|${o.col ?? ""}`,
    faceUnder(f) {
      const col = o.col ?? f.look.hairCol, my = f.mouth[1], q = f.quad, dark = luma(col) < 0.3, top = my - 7.6, strand = dark ? shade(col, 1.7) : shade(col, 0.8);
      // the upper edge of a full beard, from the left temple to the right: a sideburn down the side of the head, a dip
      // under the cheek, then level above the mouth, which is drawn on the beard. A beard as dark as the ink goes
      // down round the mouth instead: the mouth (and a moustache) stay on bare skin, where they read
      const cheek = Math.max(top + 4.5, 15.5), in0 = top + (dark ? 3 : 0);
      const side = (s: number): P2[] => [[s * 62, -27], [s * 43, -26], ...q([s * 43.5, -8], [s * 45, cheek + 2], [s * 34, cheek], 8), ...q([s * 34, cheek], [s * 25, cheek - 1.5], [s * 19.5, in0], 6).slice(1)];
      const mid: P2[] = dark ? [...q([-19.5, in0], [-20, my + 9.5], [0, my + 10], 8).slice(1), ...q([0, my + 10], [20, my + 9.5], [19.5, in0], 8).slice(1, -1)] : [];
      const upper: P2[] = [...side(-1), ...mid, ...side(1).reverse()];
      if (kind === "full") f.fill([...upper, [62, 20], [50, 70], [-50, 70], [-62, 20]], col, 1.6);
      else if (kind === "fork") f.fill([...upper, ...q([56, 6], [40, 24], [14.5, 43.5], 10), ...q([14.5, 43.5], [9, 37], [0, my + 11.5], 6).slice(1), ...q([0, my + 11.5], [-9, 37], [-14.5, 43.5], 6).slice(1), ...q([-14.5, 43.5], [-40, 24], [-56, 6], 10).slice(1)], col, 1.6);
      // (a band up the jaw to the ears, a hand wide at the chin: lower than that it reads as a chin strap, not as a beard)
      else if (kind === "short") f.fill([...q([-58, -8], [-44, my + 6], [0, my + 9.5], 14), ...q([0, my + 9.5], [44, my + 6], [58, -8], 14).slice(1), [62, 30], [40, 70], [-40, 70], [-62, 30]], col, 1.6);
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
      if (kind !== "short") for (const [x, y, dx] of [[-30, my + 9, 2.5], [-12, my + 15.5, 1], [12, my + 15.5, -1], [30, my + 9, -2.5]] as [number, number, number][]) f.line(q([x, y], [x + dx, y + 4], [x + dx * 1.6, y + 7.5], 5), 1.5, strand);
    },
  };
};

/** A sword scabbard: it hangs low at the hip from a short strap, outside the leg and under the hanging hand, angled
 *  back; leather with a metal throat and tip. empty (default true) = its mouth is a dark opening with no hilt in it
 *  (Kay's); false = a simple hilt stands in it. side: 1 = the person's left hip (default), 0 = the right. A strap is
 *  painted from the belt to the hip. It hangs plumb when its wearer leans. */
export const scabbard = (o: { col?: string; chape?: string; empty?: boolean; side?: 0 | 1 } = {}): Acc => {
  const col = o.col ?? "#6a4026", chape = o.chape ?? "#d9b45a", empty = o.empty ?? true, side = o.side ?? 1, s = side ? 1 : -1;
  const key = [col, chape, empty, side].join("|");
  return {
    name: "scabbard", slots: ["waist"], key,
    outfit(c) {
      // the hanger: a strap from the belt in front down to the hip where the scabbard hangs
      const pts = bend(c.P(s * 34, 0.33), c.P(s * 66, 0.25), c.P(s * 92, 0.07));
      c.line(pts, c.shade(col, 0.42), 15); c.line(pts, c.shade(col, 0.9), 8);
    },
    build(b) {
      const L = 0.44, FL = 0.72, parts: THREE.Object3D[] = [], ink = 0.0062;
      // in its own frame the scabbard runs along y from the tip (0) to the mouth (L), an oval: thinner across x. It is
      // turned to hang down and back (36 deg from plumb), a little outward, its mouth facing up and forward
      const dir = new THREE.Vector3(s * 0.12, -0.8, -0.585).normalize(), T = new THREE.Vector3(s * (b.rb - 0.004), -0.04, -0.012);
      const qt = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, -1, 0), dir);
      const put = (m: THREE.Mesh, y: number) => { m.quaternion.copy(qt); m.position.copy(T).addScaledVector(dir, L - y); parts.push(m); return m; };
      const flat = (g: THREE.BufferGeometry, k: number) => { g.scale(k, 1, 1); return weld(g); };
      put(b.solid("body", flat(turned([[0, 0], [0.013, 0], [0.021, 0.04], [0.03, L], [0, L]], 0.008, 28), FL), { col, ink }), 0);
      // the tip and the throat: metal, 5 to 6 mm proud of the leather all round
      put(b.solid("body", flat(turned([[0, -0.012], [0.02, -0.012], [0.0275, 0.03], [0.0285, 0.085], [0, 0.085]], 0.008, 28), 0.82), { col: chape, ink }), 0);
      const lg = turned([[0, L - 0.065], [0.0345, L - 0.065], [0.0365, L + 0.006], [0, L + 0.006]], 0.005, 28), v = lg.userData.v as number[];
      const mouth = b.tex(8, 256, (g) => { g.fillStyle = "#ffffff"; g.fillRect(0, 0, 8, 256); if (empty) { g.fillStyle = "#2b2028"; g.fillRect(0, 0, 8, Math.round(256 * (1 - v[2]) * 0.8)); } }, `${empty}`);
      put(b.solid("body", flat(lg, 0.8), { col: chape, map: mouth, ink }), 0);
      if (!empty) {
        // a plain hilt standing in the mouth: guard, grip, pommel
        const guard = put(b.solid("body", roundBox(0.024, 0.022, 0.112, 0.4), { col: chape, ink }), L + 0.014);
        put(b.solid("body", turned([[0, 0], [0.0115, 0], [0.0105, 0.075], [0, 0.075]], 0.004, 20), { col: DARK, ink: 0.005 }), L + 0.02);
        put(b.solid("body", new THREE.SphereGeometry(0.019, 18, 12), { col: chape, ink }), L + 0.106);
      }
      // the strap it hangs from: from inside the body's lower side down to the throat
      const A = new THREE.Vector3(s * 0.7 * b.rb, 0.085, 0), B = T.clone().addScaledVector(dir, 0.03), strap = b.solid("body", roundBox(0.021, A.distanceTo(B) + 0.02, 0.034, 0.5), { col: shade(col, 0.8), ink: 0.005 });
      strap.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), A.clone().sub(B).normalize()); strap.position.copy(A).add(B).multiplyScalar(0.5); parts.push(strap);
      plumb(parts, A, { back: 0.6, fwd: 0.35 });
      b.keepOut(T.clone().addScaledVector(dir, 0.02), 0.034);
      b.keepOut(T.clone().addScaledVector(dir, 0.11), 0.03);
      if (!empty) b.keepOut(T.clone().addScaledVector(dir, -0.07), 0.02);
    },
  };
};

/** A guard's spear, held upright in one hand (0 = the person's right, the default): a wooden shaft `len` long (1.9 m)
 *  with a leaf-shaped steel head. The arm hangs and stays down in wave, point and cheer (held hang); the hand is on
 *  the shaft where a hanging hand is, about 0.6 m up (the rig's hand cannot hang higher), and the butt stands
 *  `lift` above the ground when the figure stands idle (default 0.03 m; give 0.09 to a guard who walks: the body
 *  dips 6 cm in every step and the spear with it). It leans out a little at the top, clear of the head. layer:
 *  "limb" (default) = like the hand it is never drawn in front of the figure's own head, so the shaft cannot cross
 *  the face when the arm swings forward on the camera's side (the spear's head stands above the figure's head and
 *  always shows); "free" = plain depth. head = the steel's colour. */
export const spear = (o: { hand?: 0 | 1; len?: number; col?: string; lift?: number; head?: string; layer?: "limb" | "free" } = {}): Acc => {
  const hand = o.hand ?? 0, len = o.len ?? 1.9, col = o.col ?? "#a06c3a", lift = o.lift ?? 0.03, steel = o.head ?? STEEL, s = hand ? 1 : -1;
  return {
    name: "spear", slots: [hand ? "hand1" : "hand0"], key: [hand, len, col, lift, steel, o.layer ?? "limb"].join("|"),
    build(b) {
      // where the hanging hand is when the figure stands (the rig's own rule for a hanging arm)
      const F = stand(b), shY = 0.84 * b.Ht, r = b.bodyR(0.84, s * 72) + 0.0177, A = 2 * b.R * 0.84, reach = 0.972 * A;
      const dx = b.rb + 0.05 - Math.sin(rad(72)) * r, dz = 0.03 - Math.cos(rad(72)) * r, handY = F.hipY + shY - Math.sqrt(Math.max(0.01, reach * reach - dx * dx - dz * dz));
      // the shaft passes the hand on its outer side and leans out toward the top: at the head's height it is clear
      // of the head (whose half width is more than the hand's distance from the body's axis)
      const out = 0.03, need = b.R * 1.1 + 0.035 - (b.rb + 0.05 + out), rise = b.headY - (handY - F.hipY), tilt = clamp(Math.atan2(Math.max(need, 0), rise), rad(3), rad(11));
      const g = b.held(hand, { offset: [s * out, 0, 0], rot: [0, 0, -s * tilt], layer: o.layer ?? "limb", hang: true });
      const y0 = -(handY - lift) / Math.cos(tilt), rs = 0.0155, hl = 0.3, ink = 0.0058, sl = len - hl + 0.04;
      // (rings all the way up the shaft: rig.qa.held measures a held thing's points against the body and the head)
      b.solid(g, new THREE.CylinderGeometry(rs, rs, sl, 14, Math.ceil(sl / 0.06)), { col, ink }).position.y = y0 + sl / 2;
      // the head: a socket on the shaft's end and a flat leaf, broadside to the front
      b.solid(g, turned([[0, 0], [0.024, 0], [0.019, 0.085], [0, 0.085]], 0.005, 18), { col: shade(steel, 0.8), ink }).position.y = y0 + len - hl - 0.012;
      const leaf = turned([[0, 0], [0.014, 0], [0.05, 0.085], [0.03, 0.18], [0, 0.245]], 0.012, 28);
      leaf.scale(1, 1, 0.3);
      b.solid(g, weld(leaf), { col: steel, ink }).position.y = y0 + len - 0.245;
    },
  };
};
