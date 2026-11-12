// SHARED KIT: src/kit/acc/armour.ts (KIT.md, acc/README.md). Built for Hongmen; any toon film imports it from here.
// WAR GEAR of the Hongmen film (项羽's): what goes ON TOP of acc/garb.ts `armour` to make a warlord of a figure.
//   rc.add(look, { acc: [armour({ col, trim }), warBelt(), pauldrons({ col, trim }), cloak({ col }), swordBelt(), hilt(), ...] })
//     pauldrons   披膊 / 肩甲: a big shoulder guard of three overlapping lames on each shoulder, in 3D. They widen the
//                 silhouette to more than the head's width. Each one hangs on its arm's root and TURNS WITH THE UPPER
//                 ARM (it is read from the arm every frame), so the arm always comes out of its open end: a raised,
//                 pointing or pinned arm never passes through it. slot: shoulder; hide: ["pauldrons"]
//     cloak       披风: a long cloak that hangs straight down the back from the shoulders to the calves, tied at the
//                 neck with two cords (painted: no clasp, no collar, the chest stays armour). In 3D, rebuilt every
//                 frame from the pose like garb.ts `cape` (plumb, gathered on the ground or the seat, pushed out by
//                 the legs), but narrower and longer, and it keeps inside of where the scabbard hangs.
//                 slots: back, neck; hide: ["cloak"]
//     warBelt     a wide war belt with a big round boss (painted over the armour's own belt); beast: true = the boss
//                 is a beast mask (兽面). No slot.
//     lamellar    札甲 as the Qin / Han wore it: over garb.ts `armour` (list it right after it), the chest, the back
//                 and the 3D plate skirt are repainted as upright plates in level rows with lacing, the skirt split
//                 into hanging panels (腿裙). It paints over the armour's drawing and re-paints the armour's own skirt
//                 map; garb.ts itself is not touched. No slot.
//     armGuards   臂甲: the arms as ARMS: an armoured sleeve from the shoulder, cloth at the elbow, a leather bracer
//                 with two bands to the wrist, a fist. In 3D round the kit's thin arm, rebuilt from it every frame.
//                 No slot; hide: ["armGuards"]
//     warBoots    靴: thick boots round the lower legs and the feet, as long as their wearer stands or walks (seated,
//                 under the skirt, they draw in to the leg). No slot; hide: ["warBoots"]
// Everything is a pure function of the pose: nothing random, nothing kept from frame to frame.
// (garb.ts is another engineer's and changes under us: the small helpers that read the pose are COPIED here, with
// their own cache keys on the figure's group, and do not depend on garb.ts's internals.)
import * as THREE from "three";
import type { Acc, P2, PartKit } from "../../videos/group/kit/rig3d";
import { dimsOf } from "../../videos/group/kit/toon";
import { shade } from "../../videos/group/kit/rigacc/shapes";

const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (x: number) => { const t = clamp(x, 0, 1); return t * t * (3 - 2 * t); };
const rad = (d: number) => (d * Math.PI) / 180;
const wrapA = (a: number) => a - 2 * Math.PI * Math.round(a / (2 * Math.PI));
const GOLD = "#e2b03a";
/** points of the curve from a to b bent toward k */
const bend = (a: P2, k: P2, b: P2, n = 10): P2[] => Array.from({ length: n + 1 }, (_, i) => { const t = i / n, s = 1 - t; return [s * s * a[0] + 2 * s * t * k[0] + t * t * b[0], s * s * a[1] + 2 * s * t * k[1] + t * t * b[1]] as P2; });
/** where garb.ts puts the sash / belt on the body (0 = its bottom .. 1 = its top) and half its height */
const SASH_T = 0.385, SASH_H = 0.042;

/** the height of the body's bottom above the ground when the figure stands */
const standHip = (b: PartKit) => { const D = dimsOf(b.look), ys = clamp((D.H.b / D.H.a) * 0.95, 0.85, 0.97); return 1.45 - b.R * ys - b.headY; };
/** runs fn whenever the object's world matrix is brought up to date (once per traversal of the scene, before a frame
 *  is drawn): a pure function of the pose */
const everyFrame = (o: THREE.Object3D, fn: () => void) => {
  const base = o.updateMatrixWorld;
  o.updateMatrixWorld = function (force?: boolean) { fn(); base.call(o, force); };
};
const RING = 14;
/** the figure's four limb tubes (the kit's limbs are the meshes with a "tangent3" attribute, children of the figure's
 *  group, in the order right arm, left arm, right leg, left leg), or null before they exist */
const limbsOf = (root: THREE.Object3D): THREE.BufferGeometry[] | null => {
  const U = root.userData;
  let t = U.hmxTubes as THREE.BufferGeometry[] | undefined;
  if (!t) {
    const seen: THREE.BufferGeometry[] = [];
    for (const c of root.children) { const g = (c as THREE.Mesh).geometry as THREE.BufferGeometry | undefined; if (g && g.attributes && g.attributes.tangent3 && !seen.includes(g)) seen.push(g); }
    if (seen.length < 4) return null;
    t = U.hmxTubes = seen.slice(0, 4);
  }
  return t;
};
/** the middle of ring i of a limb tube (group space = the world) */
const ringMid = (g: THREE.BufferGeometry, i: number, out: THREE.Vector3) => {
  const P = g.attributes.position.array as Float32Array;
  let x = 0, y = 0, z = 0;
  for (let j = 0, q = i * RING * 3; j < RING; j++, q += 3) { x += P[q]; y += P[q + 1]; z += P[q + 2]; }
  return out.set(x / RING, y / RING, z / RING);
};

// ===== pauldrons =====
/** one normal per position (the mean of the faces that meet there), so that the ink hull stays closed over seams */
const weld = <T extends THREE.BufferGeometry>(g: T) => {
  g.computeVertexNormals();
  const P = g.attributes.position, N = g.attributes.normal, key = (i: number) => `${Math.round(P.getX(i) * 1e5)},${Math.round(P.getY(i) * 1e5)},${Math.round(P.getZ(i) * 1e5)}`, sum = new Map<string, number[]>();
  for (let i = 0; i < P.count; i++) { const a = sum.get(key(i)) ?? [0, 0, 0]; a[0] += N.getX(i); a[1] += N.getY(i); a[2] += N.getZ(i); sum.set(key(i), a); }
  for (let i = 0; i < P.count; i++) { const a = sum.get(key(i))!, l = Math.hypot(a[0], a[1], a[2]) || 1; N.setXYZ(i, a[0] / l, a[1] / l, a[2] / l); }
  g.computeBoundingSphere();
  return g;
};
/** The outer half of a bell turned round +y (prof = [radius, y] from the cap down to the rim and in to the axis), the
 *  half on +x, closed by a flat face at x = 0. uv: u across, v along the profile by length (the flat face: v = vFlat). */
const halfBell = (prof: [number, number][], vFlat: number) => {
  const NA = 22, n = prof.length, pos: number[] = [], uv: number[] = [], idx: number[] = [], len = [0];
  for (let k = 1; k < n; k++) len.push(len[k - 1] + Math.hypot(prof[k][0] - prof[k - 1][0], prof[k][1] - prof[k - 1][1]));
  for (let i = 0; i <= NA; i++) { const a = -Math.PI / 2 + (Math.PI * i) / NA; for (let k = 0; k < n; k++) { pos.push(prof[k][0] * Math.cos(a), prof[k][1], prof[k][0] * Math.sin(a)); uv.push(i / NA, len[k] / len[n - 1]); } }
  for (let i = 0; i < NA; i++) for (let k = 0; k < n - 1; k++) { const A = i * n + k, B = A + 1, C = A + n, D = C + 1; idx.push(A, B, C, B, D, C); }
  const base = pos.length / 3;
  for (let k = 0; k < n; k++) { pos.push(0, prof[k][1], -prof[k][0]); uv.push(0.5, vFlat); pos.push(0, prof[k][1], prof[k][0]); uv.push(0.5, vFlat); }
  for (let k = 0; k < n - 1; k++) { const A = base + 2 * k, B = A + 1, C = A + 2, D = A + 3; idx.push(A, C, B, B, C, D); }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  weld(g);
  // (make sure it is not inside out: the middle of the outer surface must face +x)
  const N = g.attributes.normal, m = (NA >> 1) * n + (n >> 1);
  if (N.getX(m) < 0) { for (let q = 0; q < idx.length; q += 3) { const t = idx[q + 1]; idx[q + 1] = idx[q + 2]; idx[q + 2] = t; } g.setIndex(idx); weld(g); }
  g.userData.vAt = len.map((l) => l / len[n - 1]);
  return g;
};
/** Shoulder guards (披膊): on the outside of each shoulder a guard of three overlapping lames, each wider than the
 *  one above and standing proud of it, each edged in `trim`: the outer half of a bell, its flat side toward the arm.
 *  size = 1: 19 cm across at its lower rim, 15 cm tall. It widens the figure's outline to more than its head.
 *  It hangs on the arm's root and leans out from the body like an eave (`lean` degrees from plumb at rest). The arm
 *  never passes through it: the guard lies outside the plane the arm swings in when it goes forward, back or across
 *  the body (the arm slides along its flat side), and when the arm is lifted sideways or overhead the guard is
 *  lifted with it, always `lead` degrees ahead of the arm (read from the arm's own tube every frame). Under the
 *  figure's own head like the rest of the body. slot: shoulder; hide: ["pauldrons"]. */
export const pauldrons = (o: { col?: string; trim?: string; size?: number; lean?: number; lead?: number; plates?: boolean; lace?: string } = {}): Acc => {
  const col = o.col ?? "#4a4f5e", trim = o.trim ?? GOLD, size = o.size ?? 1, lean = rad(o.lean ?? 36), lead = rad(o.lead ?? 15), plated = !!o.plates, lace = o.lace ?? shade(trim, 0.8);
  return {
    name: "pauldrons", slots: ["shoulder"], key: ["pauldrons", col, trim, size, lean, lead, plated, lace].join("|"),
    build(b) {
      const k = size;
      const prof = ([[0, -0.04], [0.03, -0.038], [0.052, -0.022], [0.062, 0.004], [0.066, 0.032], [0.058, 0.034], [0.074, 0.05], [0.081, 0.076], [0.073, 0.078], [0.089, 0.092], [0.096, 0.118], [0.09, 0.124], [0, 0.124]] as [number, number][]).map(([r, y]) => [r * k, y * k] as [number, number]);
      const geoOf = () => halfBell(prof, 0.985);
      const g0 = geoOf(), v = g0.userData.vAt as number[];
      // its map (v runs along the profile): the plates' colour with upright joints, each lame's rim in the trim, the
      // underside and the flat side dark
      const map = plated ? b.tex(256, 512, (g) => {
        // plates = true (round 2): each lame is a row of upright plates with a lacing dot, as the body's lamellar; the
        // lames' rims are thin dark lines with a hair of trim, not broad bands (three gold stripes read as a
        // Japanese sode), and only the lowest lame has a real edge of trim
        const Y = (i: number) => 512 * (1 - v[i]);
        g.fillStyle = col; g.fillRect(0, 0, 256, 512);
        const lames: [number, number][] = [[1, 4], [5, 7], [8, 10]];
        for (const [a, c2] of lames) {
          const yT = Y(c2), yB = Y(a), n = 8;
          for (let k = 0; k < n; k++) {
            const x = (k / n) * 256, w = 256 / n;
            g.fillStyle = shade(col, 0.6); g.fillRect(x, yT, 3, yB - yT);
            g.fillStyle = shade(col, 1.2); g.fillRect(x + 3, yT, 2.5, yB - yT);
            g.fillStyle = lace; g.beginPath(); g.ellipse(x + w / 2 + 1.5, yT + (yB - yT) * 0.3, 3.2, 4.4, 0, 0, 7); g.fill();
          }
        }
        for (const [a, c2] of [[4, 5], [7, 8], [10, 11]] as [number, number][]) {
          const y0 = Math.min(Y(a), Y(c2)), y1 = Math.max(Y(a), Y(c2)), low = a === 10;
          g.fillStyle = low ? trim : shade(col, 0.5); g.fillRect(0, y0 - 1, 256, y1 - y0 + 2);
          if (!low) { g.fillStyle = shade(trim, 0.75); g.fillRect(0, y1 - 1, 256, 3); }
          else { g.fillStyle = shade(trim, 0.5); g.fillRect(0, y1 + 1, 256, 3); }
        }
        g.fillStyle = shade(col, 0.5); g.fillRect(0, 0, 256, Y(11) - 1);
      }, `pauldron3|${col}|${trim}|${lace}`) : b.tex(64, 512, (g) => {
        const Y = (i: number) => 512 * (1 - v[i]);
        g.fillStyle = col; g.fillRect(0, 0, 64, 512);
        g.fillStyle = shade(col, 0.72); for (let x = 0; x < 64; x += 8) g.fillRect(x, Y(11), 1.6, Y(1) - Y(11));
        for (const [a, c2] of [[4, 5], [7, 8], [10, 11]] as [number, number][]) {
          const y0 = Math.min(Y(a), Y(c2)), y1 = Math.max(Y(a), Y(c2)), up = (Y(a - 1) - Y(a)) * 0.3;
          g.fillStyle = trim; g.fillRect(0, y0 - 1, 64, y1 - y0 + 2 + up);
          g.fillStyle = shade(trim, 0.5); g.fillRect(0, y1 + up, 64, 3);
        }
        g.fillStyle = shade(col, 0.5); g.fillRect(0, 0, 64, Y(11) - 1);
      }, `pauldron2|${col}|${trim}`);
      const mat = b.paint("body", { col: "#ffffff", map });
      const parts: THREE.Mesh[] = [];
      for (let i = 0; i < 2; i++) parts.push(b.solid("body", i ? geoOf() : g0, { mat, ink: 0.0075 }));
      const torso = parts[0].parent!, root = torso.parent!;
      for (const m of parts) { root.add(m); m.frustumCulled = false; m.visible = false; }
      const c0 = new THREE.Vector3(), c1 = new THREE.Vector3(), dir = new THREE.Vector3(), out = new THREE.Vector3(), up = new THREE.Vector3(), fwd = new THREE.Vector3(), X = new THREE.Vector3(), Yv = new THREE.Vector3(), Z = new THREE.Vector3(), M = new THREE.Matrix4();
      const refresh = () => {
        const limbs = root.visible ? limbsOf(root) : null;
        if (!limbs) return;
        const e = torso.matrix.elements;
        up.set(e[4], e[5], e[6]).normalize(); fwd.set(e[8], e[9], e[10]).normalize();
        for (let i = 0; i < 2; i++) {
          // the arm's root and the way its upper part runs (the first straight stretch of the tube)
          ringMid(limbs[i], 0, c0); ringMid(limbs[i], 5, c1);
          dir.copy(c1).sub(c0);
          if (dir.lengthSq() < 1e-10) continue;
          dir.normalize();
          // straight out from the body on that side (arm 0 = the person's right = the body's -x)
          out.set(e[0], e[1], e[2]).normalize().multiplyScalar(i ? 1 : -1);
          // the arm's angle in the plane across the body, from plumb (0) through straight out (90 deg) to overhead;
          // an arm that points mostly forward or back counts as hanging
          const dOut = dir.dot(out), dUp = dir.dot(up), lat = Math.hypot(dOut, dUp);
          const thArm = Math.atan2(dOut, -dUp) * smooth(lat / 0.5), th = Math.max(thArm + lead, lean);
          // the guard's frame: +y the way it hangs (th from plumb toward out), +x its outside, +z along the body's front
          Yv.copy(up).multiplyScalar(-Math.cos(th)).addScaledVector(out, Math.sin(th));
          X.copy(out).multiplyScalar(Math.cos(th)).addScaledVector(up, Math.sin(th));
          Z.crossVectors(X, Yv);
          const m = parts[i];
          m.visible = true;
          m.quaternion.setFromRotationMatrix(M.makeBasis(X, Yv, Z));
          // its flat side stands 1.6 cm outside the arm's root, its cap a little above it
          m.position.copy(c0).addScaledVector(X, 0.016).addScaledVector(Yv, -0.012 * k);
        }
      };
      everyFrame(parts[0], refresh);
    },
  };
};

// ===== the war belt =====
/** A wide war belt over the armour's own: dark leather with an edge of `trim` above and below, studs along it, and in
 *  front a big round boss (a ring, a raised middle). Painted on the body. No slot (list it after the armour). */
export const warBelt = (o: { col?: string; trim?: string; boss?: number; beast?: boolean } = {}): Acc => {
  const col = o.col ?? "#2e2630", trim = o.trim ?? GOLD, boss = o.boss ?? 1, beast = !!o.beast;
  return {
    name: "warBelt", slots: [], key: ["warBelt", col, trim, boss, beast].join("|"),
    outfit(c) {
      const P = c.P, t = SASH_T, h = SASH_H * 1.25, ti = c.shade(trim, 0.5), g = c.g;
      c.poly([P(-180, t + h), P(180, t + h), P(180, t - h), P(-180, t - h)], col);
      for (const s of [-1, 1]) { c.line([P(-180, t + s * h), P(180, t + s * h)], ti, 7); c.line([P(-180, t + s * h * 0.93), P(180, t + s * h * 0.93)], trim, 4); }
      const spot = (az: number, tt: number, rm: number, fill: string, stroke?: string, lw = 4) => {
        const [x, y] = P(az, tt), rx = (c.az(rm, tt) / 360) * c.W, ry = rm * c.pxUp(tt);
        for (const dx of [0, -c.W, c.W]) {
          if (x + dx + rx < 0 || x + dx - rx > c.W) continue;
          g.beginPath(); g.ellipse(x + dx, y, rx, ry, 0, 0, 7); g.fillStyle = fill; g.fill();
          if (stroke) { g.strokeStyle = stroke; g.lineWidth = lw; g.stroke(); }
        }
      };
      for (let az = -165; az <= 165; az += 22) if (Math.abs(az) > 30) spot(az, t, 0.008, trim, ti, 2);
      // the boss: a broad ring, a dark groove, a raised middle with a glint
      const r = 0.047 * boss;
      if (beast) {
        // a beast mask (兽面): a broad face of trim with two ears, heavy slanted brows over dark eyes, a nose, and a
        // row of teeth with two fangs
        const dk = c.shade(trim, 0.34), a = c.az(r, t), X = (k: number) => k * a, Yt = (k: number) => t + k * r;
        for (const sg of [-1, 1]) c.poly([P(X(sg * 0.5), Yt(0.72)), P(X(sg * 1.08), Yt(1.3)), P(X(sg * 1.02), Yt(0.3))], trim, ti, 5);
        spot(0, t, r * 1.06, trim, ti, 6);
        for (const sg of [-1, 1]) {
          c.poly([P(X(sg * 0.1), Yt(0.2)), P(X(sg * 0.8), Yt(0.62)), P(X(sg * 0.84), Yt(0.36)), P(X(sg * 0.16), Yt(0.02))], dk);
          spot(X(sg * 0.42), Yt(0.06), r * 0.15, "#fff3c4", dk, 3);
        }
        c.poly([P(X(-0.16), Yt(-0.12)), P(X(0.16), Yt(-0.12)), P(X(0.22), Yt(-0.34)), P(X(-0.22), Yt(-0.34))], c.shade(trim, 0.62), dk, 3);
        c.poly([P(X(-0.62), Yt(-0.46)), P(X(0.62), Yt(-0.46)), P(X(0.46), Yt(-0.74)), P(X(-0.46), Yt(-0.74))], dk);
        for (const k of [-0.42, 0.42]) c.poly([P(X(k - 0.12), Yt(-0.46)), P(X(k + 0.12), Yt(-0.46)), P(X(k), Yt(-0.82))], "#fff3c4");
      } else { spot(0, t, r, trim, ti, 6); spot(0, t, r * 0.66, c.shade(trim, 0.62)); spot(0, t, r * 0.5, trim, ti, 3); spot(-2.4, t + 0.014, r * 0.16, c.shade(trim, 1.4)); }
    },
  };
};

// ===== lamellar: the plates, repainted =====
/** one upright plate of lamellar on a canvas: a slab with a dark right and lower edge, a lit left edge, and a lacing
 *  dot near its top */
const plateAt = (g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, col: string, lace: string) => {
  g.fillStyle = shade(col, 0.56); g.fillRect(x, y, w, h);
  g.fillStyle = col; g.fillRect(x + w * 0.07, y, w * 0.8, h * 0.9);
  g.fillStyle = shade(col, 1.22); g.fillRect(x + w * 0.07, y, w * 0.13, h * 0.9);
  g.fillStyle = lace; g.beginPath(); g.ellipse(x + w * 0.5, y + h * 0.26, w * 0.13, h * 0.085, 0, 0, 7); g.fill();
};
/** LAMELLAR (札甲), the way the Qin and Han wore it, painted over garb.ts `armour` (list this right after it): the
 *  chest and the back are level rows of UPRIGHT plates (taller than wide, in columns: not bricks) with a lacing dot
 *  each, under a plain yoke round the neck; the armour's 3D skirt is repainted the same way and cut into hanging
 *  panels (腿裙: dark slits in front, at the sides and behind, each edged with a line of trim), with a narrow edge of
 *  trim at the hem. col = the plates (not black: it would merge with the ink), lace = the lacing dots, trim = the
 *  edges, under = the cloth at the neck. The skirt's map is the armour's own (it is found on the figure and painted
 *  again; if the armour changes so that it cannot be found, the skirt stays as the armour painted it). No slot. */
export const lamellar = (o: { col?: string; lace?: string; trim?: string; under?: string } = {}): Acc => {
  const col = o.col ?? "#4d4b55", lace = o.lace ?? "#a8823a", trim = o.trim ?? GOLD, under = o.under ?? "#3a2452";
  const key = ["lamellar", col, lace, trim, under].join("|");
  return {
    name: "lamellar", slots: [], key,
    outfit(c) {
      const P = c.P, g = c.g, ch = c.chin, t0 = SASH_T + SASH_H * 0.8, ti = c.shade(trim, 0.5);
      // the rows, from the belt up to the top (the head and the yoke hide what is above the shoulders)
      const rows = 6, dt = (1 - t0) / rows, cols = 26, da = 360 / cols;
      c.poly([P(-180, 1), P(180, 1), P(180, t0), P(-180, t0)], c.shade(col, 0.56));
      for (let j = 0; j < rows; j++) for (let k = 0; k < cols; k++) {
        const a0 = -180 + k * da, tA = t0 + j * dt, tB = tA + dt, [x0, yB] = P(a0, tA), [x1] = P(a0 + da, tA), [, yT] = P(a0, tB);
        plateAt(g, x0, yT, x1 - x0, (yB - yT) * 0.94, col, lace);
      }
      // the yoke: a plain band over the shoulders and round the neck, edged; the neck opening with the cloth under it
      for (const m of [0, 180]) {
        const U = (a: number, lo: number): P2[] => [P(m - a, 1), ...bend(P(m - a, ch + 0.03), P(m - a * 0.92, lo), P(m, lo)), ...bend(P(m, lo), P(m + a * 0.92, lo), P(m + a, ch + 0.03)).slice(1), P(m + a, 1)];
        c.poly(U(46, ch - 0.15), c.shade(col, 0.8), ti, 5);
        c.line(U(46, ch - 0.15).slice(1, -1), trim, 6);
        c.poly(U(27, ch - 0.08), under);
      }
      for (const s of [-1, 1]) c.poly([P(s * 46, 1), P(s * 134, 1), P(s * 134, 0.9), P(s * 46, 0.9)], c.shade(col, 0.8));
    },
    build(b) {
      // the armour's plate skirt: the one mesh of this figure with a square 512 map (garb.ts skirtOn)
      const probe = b.solid("body", new THREE.SphereGeometry(0.004, 6, 4), { col, ink: 0.001 }), torso = probe.parent!, root = torso.parent ?? torso;
      probe.position.set(0, 0.5 * b.Ht, 0);                                      // (deep inside the body: never seen)
      let map: THREE.Texture | null = null;
      root.traverse((m) => { const t = ((m as THREE.Mesh).material as THREE.MeshBasicMaterial | undefined)?.map; const im = t?.image as HTMLCanvasElement | undefined; if (t && im && im.width === 512 && im.height === 512 && typeof im.getContext === "function") map = t; });
      const tx = map as THREE.Texture | null;
      if (!tx || tx.userData.hmLamellar === key) return;
      const cv = tx.image as HTMLCanvasElement, g = cv.getContext("2d");
      if (!g) return;
      tx.userData.hmLamellar = key;
      const W = 512, H = 512, Lc = Math.max(0.06, standHip(b) - 0.3), total = 0.44 * b.Ht + Lc, y = (h: number) => H * ((0.44 * b.Ht + (1 - h) * Lc) / total);
      g.fillStyle = shade(col, 0.56); g.fillRect(0, 0, W, H);
      const rows = 7, cols = 20, y1 = y(0.045), yTop = y(1) - (y1 - y(1)) / rows * 3, ph = (y1 - y(1)) / rows;
      for (let yy = yTop; yy < y1 - 1; yy += ph) for (let k = 0; k < cols; k++) plateAt(g, (k / cols) * W, yy, W / cols, ph * 0.94, col, lace);
      // the panels: slits in front (u = 0.5), at both sides and behind
      for (const u of [0, 0.25, 0.5, 0.75, 1]) {
        const x = u * W, w = W * 0.011, ys = y(u === 0.5 ? 0.92 : 0.8);
        g.fillStyle = shade(col, 0.3); g.fillRect(x - w, ys, 2 * w, H - ys);
        g.fillStyle = shade(trim, 0.85); g.fillRect(x - w - W * 0.006, ys, W * 0.006, y1 - ys); g.fillRect(x + w, ys, W * 0.006, y1 - ys);
      }
      // the hem: a narrow edge of trim, dark under it (the skirt's underside takes the last row)
      g.fillStyle = trim; g.fillRect(0, y1, W, H * 0.022);
      g.fillStyle = shade(trim, 0.5); g.fillRect(0, y1 - H * 0.005, W, H * 0.008);
      g.fillStyle = shade(col, 0.4); g.fillRect(0, y1 + H * 0.022, W, H);
      tx.needsUpdate = true;
    },
  };
};

// ===== arms and boots: thick sleeves round the kit's thin limbs =====
const LIMB_RINGS = 33;
/** A sleeve round limb `limb` (0 right arm, 1 left arm, 2 right leg, 3 left leg) from ring i0 to ring i1 of the kit's
 *  tube (0 = the root .. 32 = the hand / ankle; 8..24 = the bend), `rad(u, k)` thick at share u along it (k = 0..1:
 *  how much the figure stands; see warBoots), closed at both ends. Its map: u round it, v along it. Rebuilt from the
 *  limb every frame: wherever the arm or leg is, the sleeve is round it. */
const limbSleeve = (b: PartKit, o: { limb: number; i0: number; i1: number; rad: (u: number, k: number) => number; map: THREE.Texture; paint?: "prop" | "cloth"; ink?: number; standing?: boolean; ball?: number; ballCol?: string }) => {
  const M = 12, n = o.i1 - o.i0 + 1, NR = n + 2, pos = new Float32Array(NR * (M + 1) * 3), nor = new Float32Array(NR * (M + 1) * 3), uv = new Float32Array(NR * (M + 1) * 2), idx: number[] = [];
  for (let i = 0; i < NR; i++) for (let j = 0; j <= M; j++) { uv[(i * (M + 1) + j) * 2] = j / M; uv[(i * (M + 1) + j) * 2 + 1] = 1 - clamp((i - 1) / (n - 1), 0, 1); }
  for (let i = 0; i < NR - 1; i++) for (let j = 0; j < M; j++) { const A = i * (M + 1) + j, B = A + 1, C = A + M + 1, D = C + 1; idx.push(A, B, C, B, D, C); }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("normal", new THREE.BufferAttribute(nor, 3));
  geo.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  geo.setIndex(idx);
  geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1e4);
  geo.userData.hull = () => geo;
  const mesh = b.solid("body", geo, { map: o.map, paint: o.paint ?? "prop", ink: o.ink ?? 0.0075 });
  const torso = mesh.parent!, root = torso.parent!;
  root.add(mesh); mesh.frustumCulled = false;
  const ball = o.ball ? b.solid("body", new THREE.SphereGeometry(o.ball, 18, 12), { col: o.ballCol ?? "#3a3340", ink: 0.007 }) : null;
  if (ball) { root.add(ball); ball.frustumCulled = false; }
  const hip0 = standHip(b), C = Array.from({ length: n }, () => new THREE.Vector3()), T = new THREE.Vector3(), N = new THREE.Vector3(), Bn = new THREE.Vector3();
  let last = NaN;
  const refresh = () => {
    const limbs = root.visible ? limbsOf(root) : null;
    if (!limbs || limbs[o.limb].attributes.position.count < LIMB_RINGS * RING) return;
    let sig = 0;
    for (let k = 0; k < n; k++) { ringMid(limbs[o.limb], o.i0 + k, C[k]); sig += C[k].x * (1.3 + 0.07 * k) + C[k].y * (2.1 + 0.05 * k) + C[k].z * (3.3 + 0.03 * k); }
    const e = torso.matrix.elements, ground = typeof root.userData.hmGround === "number" ? (root.userData.hmGround as number) : 0;
    const stand = o.standing ? smooth((e[13] - ground - 0.5 * hip0) / (0.3 * hip0)) : 1;
    sig += stand * 17.7 + e[8] * 0.9 + e[10] * 1.9;
    if (ball) ball.position.copy(C[n - 1]);
    if (sig === last) return;
    last = sig;
    // the first ring's normal: the body's front, kept square to the limb; then carried along it
    N.set(e[8], e[9], e[10]);
    for (let i = 0; i < NR; i++) {
      const k = clamp(i - 1, 0, n - 1), cap = i === 0 ? -1 : i === NR - 1 ? 1 : 0;
      T.copy(C[Math.min(k + 1, n - 1)]).sub(C[Math.max(k - 1, 0)]);
      if (T.lengthSq() < 1e-12) T.set(0, -1, 0); else T.normalize();
      N.addScaledVector(T, -N.dot(T));
      if (N.lengthSq() < 1e-8) { N.set(1, 0, 0).addScaledVector(T, -T.x); if (N.lengthSq() < 1e-6) N.set(0, 0, 1).addScaledVector(T, -T.z); }
      N.normalize(); Bn.crossVectors(T, N);
      const r = cap ? 0.0015 : o.rad(k / (n - 1), stand);
      for (let j = 0; j <= M; j++) {
        const a = (j / M) * Math.PI * 2, cs = Math.cos(a), sn = Math.sin(a), q = (i * (M + 1) + j) * 3;
        const nx = N.x * cs + Bn.x * sn, ny = N.y * cs + Bn.y * sn, nz = N.z * cs + Bn.z * sn;
        pos[q] = C[k].x + nx * r; pos[q + 1] = C[k].y + ny * r; pos[q + 2] = C[k].z + nz * r;
        if (cap) { nor[q] = T.x * cap; nor[q + 1] = T.y * cap; nor[q + 2] = T.z * cap; } else { nor[q] = nx; nor[q + 1] = ny; nor[q + 2] = nz; }
      }
    }
    geo.attributes.position.needsUpdate = true; geo.attributes.normal.needsUpdate = true;
  };
  everyFrame(mesh, refresh);
  return mesh;
};
/** ARMS for a warrior (臂甲): round each of the kit's thin arms a sleeve of lamellar from the shoulder to above the
 *  elbow, the tunic's cloth over the elbow, and a leather bracer with a band of trim at each end down to the wrist,
 *  and a fist over the hand. `thick` = the upper arm's radius in metres (0.036: three times the kit's line). The
 *  sleeve is rebuilt from the arm every frame, so it is where the arm is in every pose; it belongs to the body (under
 *  the figure's own head, like the arm). No slot; hide: ["armGuards"]. */
export const armGuards = (o: { col?: string; lace?: string; trim?: string; cloth?: string; bracer?: string; thick?: number; fist?: string | false } = {}): Acc => {
  const col = o.col ?? "#4d4b55", lace = o.lace ?? "#a8823a", trim = o.trim ?? GOLD, cloth = o.cloth ?? "#3a2452", bracer = o.bracer ?? "#3b2a26", thick = o.thick ?? 0.036, fist = o.fist === undefined ? "#3d3644" : o.fist;
  const key = ["armGuards", col, lace, trim, cloth, bracer, thick, fist].join("|");
  return {
    name: "armGuards", slots: [], key,
    build(b) {
      // v = 1 at the shoulder .. 0 at the wrist: plates to 0.62, cloth to 0.36, the bracer below
      const map = b.tex(128, 512, (g) => {
        const Y = (v: number) => 512 * (1 - v);
        g.fillStyle = cloth; g.fillRect(0, 0, 128, 512);
        g.strokeStyle = shade(cloth, 0.7); g.lineWidth = 4; for (const u of [0.2, 0.55, 0.85]) { g.beginPath(); g.moveTo(u * 128, Y(0.6)); g.lineTo(u * 128 + 5, Y(0.38)); g.stroke(); }
        g.fillStyle = shade(col, 0.56); g.fillRect(0, 0, 128, Y(0.62));
        for (let j = 0; j < 3; j++) for (let k = 0; k < 6; k++) plateAt(g, (k / 6) * 128, Y(1) + j * (Y(0.64) / 3), 128 / 6, (Y(0.64) / 3) * 0.94, col, lace);
        g.fillStyle = shade(trim, 0.85); g.fillRect(0, Y(0.64), 128, Y(0.615) - Y(0.64));
        g.fillStyle = bracer; g.fillRect(0, Y(0.36), 128, 512 - Y(0.36));
        g.fillStyle = shade(bracer, 1.5); for (const u of [0.25, 0.75]) g.fillRect(u * 128 - 2, Y(0.3), 4, Y(0.07) - Y(0.3));
        for (const [v0, v1] of [[0.36, 0.3], [0.07, 0]] as [number, number][]) { g.fillStyle = trim; g.fillRect(0, Y(v0), 128, Y(v1) - Y(v0)); g.fillStyle = shade(trim, 0.5); g.fillRect(0, Y(v1) - 3, 128, 3); }
      }, key);
      const rad = (u: number) => u < 0.3 ? lerp(thick, thick * 0.94, u / 0.3) : u < 0.42 ? lerp(thick * 0.94, thick * 0.74, smooth((u - 0.3) / 0.12)) : u < 0.62 ? thick * 0.74 : u < 0.7 ? lerp(thick * 0.74, thick * 0.84, smooth((u - 0.62) / 0.08)) : lerp(thick * 0.84, thick * 0.92, (u - 0.7) / 0.3);
      for (let i = 0; i < 2; i++) limbSleeve(b, { limb: i, i0: 1, i1: 31, rad, map, ink: 0.0072, ball: fist ? Math.max(b.handR * 1.22, thick * 0.98) : 0, ballCol: fist || undefined });
      // (the fist sits on the tube's last ring, the wrist: ring 31 is where the sleeve ends, the ball covers the hand)
    },
  };
};
/** BOOTS for a warrior (靴): round each lower leg a thick boot from under the knee to the ankle, with a turned-down
 *  cuff of trim, and a boot's foot over the kit's foot. `thick` = its radius (0.034). Under a plate skirt the legs
 *  have 2.4 cm of room (garb.ts skirtOn), so the boots are only full size while their wearer STANDS (walks, bows):
 *  as the body comes down onto a seat they draw in to the leg's own thickness and are hidden by the skirt.
 *  No slot; hide: ["warBoots"]. */
export const warBoots = (o: { col?: string; trim?: string; thick?: number } = {}): Acc => {
  const col = o.col ?? "#2f2a33", trim = o.trim ?? GOLD, thick = o.thick ?? 0.034, key = ["warBoots", col, trim, thick].join("|");
  return {
    name: "warBoots", slots: [], key,
    build(b) {
      const map = b.tex(64, 256, (g) => {
        g.fillStyle = col; g.fillRect(0, 0, 64, 256);
        g.fillStyle = shade(col, 1.5); g.fillRect(14, 40, 4, 200);
        g.fillStyle = trim; g.fillRect(0, 22, 64, 20); g.fillStyle = shade(trim, 0.5); g.fillRect(0, 40, 64, 4);
        g.fillStyle = shade(col, 0.6); g.fillRect(0, 0, 64, 22);
      }, key);
      const thin = 0.014, rad = (u: number, k: number) => lerp(thin, u < 0.12 ? lerp(0.6 * thick, thick * 1.08, smooth(u / 0.12)) : u < 0.24 ? thick * 1.08 : lerp(thick, thick * 0.9, (u - 0.24) / 0.76), k);
      const mats: THREE.Material[] = [];
      for (let i = 2; i < 4; i++) { const m = limbSleeve(b, { limb: i, i0: 21, i1: 32, rad, map, ink: 0.007, standing: true }); mats.push(m.material as THREE.Material); }
      // the feet: the kit's foot is a group with one capsule in it; a boot's foot goes into the same group
      const probe = b.solid("body", new THREE.SphereGeometry(0.004, 6, 4), { col, ink: 0.001 }), root = probe.parent!.parent!;
      probe.position.set(0, 0.5 * b.Ht, 0);
      for (const c of root.children) {
        const k = c.children[0] as THREE.Mesh | undefined, par = (k?.geometry as THREE.CapsuleGeometry | undefined)?.parameters;
        if (!(c as THREE.Group).isGroup || !k || !par || k.geometry.type !== "CapsuleGeometry" || c.children.length !== 1) continue;
        const r = thick * 0.82, len = 0.062, fg = new THREE.CapsuleGeometry(r, len, 6, 14);
        fg.rotateX(Math.PI / 2);
        const foot = b.solid("body", fg, { col, ink: 0.007 });
        c.add(foot); foot.position.set(0, r - par.radius, len / 2 - 0.004);
        foot.traverse((m) => { const mt = (m as THREE.Mesh).material as THREE.Material | undefined; if (mt) { mt.polygonOffset = false; } });
      }
      void mats;
    },
  };
};

// ===== the cloak =====
type LegPush = { th: number; d: number; rho: number; beta: number; gamma: number };
const CAP = 0.055;
/** how the legs (points down their middle lines, as balls of radius rho) push cloth that hangs as a circle of radius
 *  R0 round the upright axis through (cx, cz) at height y: see garb.ts pushesAt / pushed (copied) */
const pushesAt = (L: Float32Array, cx: number, cz: number, y: number, R0: number, rho: number, out: LegPush[]) => {
  out.length = 0;
  for (let k = 0; k < L.length; k += 3) {
    const dy = y - L[k + 1];
    if (dy >= CAP) continue;
    const re = dy <= 0 ? rho : rho * Math.sqrt(1 - (dy / CAP) ** 2), dx = L[k] - cx, dz = L[k + 2] - cz, d = Math.hypot(dx, dz);
    if (d + re <= R0 + 1e-4) continue;
    const beta = Math.acos(clamp((R0 - re) / d, -1, 1));
    out.push({ th: Math.atan2(dx, dz), d, rho: re, beta, gamma: Math.atan2(re * Math.sin(beta), d + re * Math.cos(beta)) });
  }
  return out;
};
const pushed = (ps: LegPush[], th: number, R0: number) => {
  let r = R0;
  for (const p of ps) {
    const a = Math.abs(wrapA(th - p.th));
    if (a >= p.beta) continue;
    const v = a <= p.gamma ? p.d * Math.cos(a) + Math.sqrt(Math.max(0, p.rho * p.rho - (p.d * Math.sin(a)) ** 2)) : R0 / Math.cos(p.beta - a);
    if (v > r) r = v;
  }
  return r;
};
/** A long cloak (披风) down the back: from under the head to the calves (len = 1; 0.6 = to the knees), `wide` = its
 *  half angle round the body in degrees (default 47: about as wide as the body, well inside of where a scabbard
 *  hangs), nearly straight (flare = how far it stands off the body at the hem, m). Painted: the back of the body in
 *  the cloak's colour and two cords from the shoulders to a knot at the throat (tie = their colour; false = none).
 *  Its inside is the lining's colour, its hem has a band of `trim`. Rebuilt every frame from the pose: plumb below
 *  the body, gathered on the ground or on the seat when its wearer sits, pushed out by the legs. */
export const cloak = (o: { col?: string; lining?: string; trim?: string | false; tie?: string | false; len?: number; wide?: number; flare?: number } = {}): Acc => {
  const col = o.col ?? "#5b2a86", lining = o.lining ?? shade(col, 0.6), trim = o.trim === undefined ? GOLD : o.trim, tie = o.tie === undefined ? col : o.tie, len = clamp(o.len ?? 1, 0.2, 1.1), wide = o.wide ?? 47, fl = o.flare ?? 0.07;
  const key = ["cloak", col, lining, trim, tie, len, wide, fl].join("|");
  return {
    name: "cloak", slots: ["back", "neck"], key,
    outfit(c) {
      const P = c.P, ink = c.shade(col, 0.4), ch = c.chin;
      // the back of the body under the cloak
      for (const s of [-1, 1]) c.poly([P(s * 180, 1), P(s * 112, 1), P(s * 122, 0.5), P(s * 128, 0), P(s * 180, 0)], col);
      if (tie) {
        // two cords from over the shoulders to a knot at the throat, two short ends under it
        const ti = c.shade(tie, 0.45), lit = c.shade(tie, 1.5), kt = ch - 0.085;
        for (const s of [-1, 1]) { const cord = bend(P(s * 64, 1), P(s * 34, ch + 0.02), P(s * 3, kt), 12); c.line(cord, ti, 17); c.line(cord, lit, 9); }
        for (const s of [-1, 1]) c.poly([P(s * 1.5, kt), P(s * 9, kt - 0.075), P(s * 4.5, kt - 0.085), P(0, kt - 0.02)], lit, ti, 4);
        const [x, y] = P(0, kt), g = c.g, rx = (c.az(0.019, kt) / 360) * c.W, ry = 0.019 * c.pxUp(kt);
        g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, 7); g.fillStyle = lit; g.fill(); g.strokeStyle = ti; g.lineWidth = 4; g.stroke();
        void ink;
      }
    },
    build(b) {
      const hip0 = standHip(b), Ht = b.Ht, th = 0.034, R = th / 2;
      const yTop = 0.9 * Ht, yHem = -(hip0 * 0.8 - 0.02) * len, yFl = 0.26 * Ht, scallop = 0.016, fold = 0.008;
      const back = (y: number) => b.bodyR(clamp(y / Ht, 0.3, 0.9), 180);
      const flare = (y: number) => smooth((yFl - y) / (yFl - yHem));
      // (it stands off the body far enough to clear a plate skirt worn under it: 6 cm at knee height)
      const mid = (y: number) => back(y) + 0.012 + 0.06 * smooth((yFl - y) / 0.2) + fl * flare(y);
      const half = (y: number) => rad(lerp(wide, wide - 3, flare(y))) * (1 - 0.3 * smooth((y / Ht - 0.7) / 0.2));
      // the slab: s = -1..1 across, v = 0 at the top .. 1 at the hem, two faces. Kept per point at rest: its height y
      // on the body's axis, its angle ph from the back, its radius rho
      const NS = 32, NV = 34, n = (NS + 1) * (NV + 1), rest = new Float32Array(2 * n * 3), pos = new Float32Array(2 * n * 3), nor = new Float32Array(2 * n * 3), uv = new Float32Array(2 * n * 2), idx: number[] = [];
      const wHem = mid(yHem) * half(yHem), rc = 0.05, total = yTop - yHem;
      let q = 0;
      for (const side of [1, -1]) for (let j = 0; j <= NV; j++) for (let i = 0; i <= NS; i++, q++) {
        const s = -Math.cos((Math.PI * i) / NS), v = (1 - Math.cos((Math.PI * j) / NV)) / 2;
        const kk = clamp((Math.abs(s) * wHem - (wHem - rc)) / rc, 0, 1), hem = yHem + scallop * (0.5 - 0.5 * Math.cos(s * Math.PI * 4)) + rc * (1 - Math.sqrt(1 - kk * kk));
        const y = yTop - v * (yTop - hem), ph = s * half(y), m = mid(y) + fold * Math.cos(s * Math.PI * 4) * smooth((yTop - y) / total - 0.3);
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
        // long folds down the outside
        cg.strokeStyle = shade(col, 0.8); cg.lineWidth = 3; cg.lineCap = "round";
        for (const u of [0.07, 0.17, 0.25, 0.33, 0.43]) { cg.beginPath(); cg.moveTo(u * 256, 150); cg.lineTo(u * 256 + 1, 470); cg.stroke(); }
        if (trim) { cg.fillStyle = trim; cg.fillRect(0, 512 - 22, 128, 22); cg.fillStyle = shade(trim, 0.5); cg.fillRect(0, 512 - 26, 128, 5); }
      }, key);
      const mesh = b.solid("body", geo, { map, paint: "cloth", ink: 0.0105 });
      const torso = mesh.parent!, root = torso.parent!;
      root.add(mesh); mesh.frustumCulled = false;
      // the arms keep off the upper cloak (the elbows of hanging arms point back)
      for (const sx of [-1, 1]) for (const t of [0.34, 0.62]) b.keepOut(new THREE.Vector3(sx * 0.36 * b.rb, t * Ht, -(back(t * Ht) + 0.014)), 0.034);
      const twin = new Int32Array(2 * n).fill(-1);
      for (let j = 0; j <= NV; j++) for (let i = 0; i <= NS; i++) if (i === 0 || i === NS || j === 0 || j === NV) { const a = j * (NS + 1) + i; twin[a] = a + n; twin[a + n] = a; }
      const ps: LegPush[] = [], u = new THREE.Vector3(), w = new THREE.Vector3(), p = new THREE.Vector3(), B = new THREE.Vector3(), exv = new THREE.Vector3(), eyv = new THREE.Vector3(), ezv = new THREE.Vector3(), fx = new THREE.Vector3(), fz = new THREE.Vector3(), mm = new THREE.Vector3(), rho = 0.056;
      let legs = new Float32Array(0), last = NaN;
      const refresh = () => {
        const limbs = root.visible ? limbsOf(root) : null;
        if (!limbs) return;
        // the frame: the body's bottom and axes (the torso group's matrix: the figure's group is the world), the legs'
        // middle lines, the ground and what the cloak rests on (the seat's top under a body that sits low)
        const e = torso.matrix.elements;
        B.set(e[12], e[13], e[14]);
        exv.set(e[0], e[1], e[2]).normalize(); const sy = Math.hypot(e[4], e[5], e[6]); eyv.set(e[4], e[5], e[6]).normalize(); ezv.set(e[8], e[9], e[10]).normalize();
        const fll = Math.hypot(ezv.x, ezv.z) || 1;
        fz.set(ezv.x / fll, 0, ezv.z / fll); fx.set(fz.z, 0, -fz.x);
        const nl = (limbs[2].attributes.position.count + limbs[3].attributes.position.count) / RING;
        if (legs.length !== nl * 3) legs = new Float32Array(nl * 3);
        let k = 0, sig = e[12] * 3.1 + e[13] * 5.3 + e[14] * 7.7 + e[0] * 1.3 + e[2] * 2.9 + e[5] * 4.1 + e[9] * 6.1 + e[10] * 0.7;
        for (const g of [limbs[2], limbs[3]]) for (let i = 0, nr = g.attributes.position.count / RING; i < nr; i++, k += 3) {
          ringMid(g, i, mm); legs[k] = mm.x; legs[k + 1] = mm.y; legs[k + 2] = mm.z;
          sig += mm.x * (1.1 + 0.01 * k) + mm.y * (2.3 + 0.02 * k) + mm.z * (3.7 + 0.03 * k);
        }
        const ground = typeof root.userData.hmGround === "number" ? (root.userData.hmGround as number) : 0, hgt = B.y - ground;
        const restY = lerp(ground + Math.max(0, hgt - 0.028), ground, smooth((hgt - 0.45 * hip0) / (0.3 * hip0)));
        sig += ground * 9.1;
        if (sig === last) return;
        last = sig;
        const yaw0 = Math.atan2(fz.x, fz.z), Lr = -yHem, Le = clamp(B.y - (restY + 0.02), 0.004, Lr), kk = Le / Lr;
        for (let j = 0; j <= NV; j++) {
          const y0 = rest[(j * (NS + 1) + (NS >> 1)) * 3], below = y0 < 0, yw = below ? B.y + y0 * kk : B.y + y0;
          if (below) pushesAt(legs, B.x, B.z, yw, mid(y0), rho, ps); else ps.length = 0;
          for (const sd of [0, 1]) for (let i = 0; i <= NS; i++) {
            const a = sd * n + j * (NS + 1) + i, y = rest[a * 3], ph = rest[a * 3 + 1];
            let rr = rest[a * 3 + 2];
            const az = Math.PI - ph, sn = Math.sin(az), cs = Math.cos(az);
            u.set(0, 0, 0).addScaledVector(fx, sn).addScaledVector(fz, cs);
            if (y >= 0) {
              const t = clamp(y / (0.3 * Ht), 0, 1);
              w.set(0, 0, 0).addScaledVector(exv, sn).addScaledVector(ezv, cs); u.lerp(w, t).normalize();
              p.copy(B).addScaledVector(eyv, y * sy).addScaledVector(u, rr);
            } else {
              if (ps.length) rr += Math.max(0, pushed(ps, yaw0 + az, mid(y0)) - mid(y0));
              p.set(B.x, B.y + y * kk, B.z).addScaledVector(u, rr);
            }
            pos[a * 3] = p.x; pos[a * 3 + 1] = p.y; pos[a * 3 + 2] = p.z;
          }
        }
        for (let sd = 0; sd < 2; sd++) for (let j = 0; j <= NV; j++) for (let i = 0; i <= NS; i++) {
          const a = (sd * n + j * (NS + 1) + i) * 3, i0 = Math.max(i - 1, 0), i1 = Math.min(i + 1, NS), j0 = Math.max(j - 1, 0), j1 = Math.min(j + 1, NV);
          const l = (sd * n + j * (NS + 1) + i0) * 3, r2 = (sd * n + j * (NS + 1) + i1) * 3, up = (sd * n + j0 * (NS + 1) + i) * 3, dn = (sd * n + j1 * (NS + 1) + i) * 3;
          const ax = pos[r2] - pos[l], ay = pos[r2 + 1] - pos[l + 1], az2 = pos[r2 + 2] - pos[l + 2], tx = pos[dn] - pos[up], ty = pos[dn + 1] - pos[up + 1], tz = pos[dn + 2] - pos[up + 2];
          let nx = ay * tz - az2 * ty, ny = az2 * tx - ax * tz, nz = ax * ty - ay * tx;
          if (sd === 1) { nx = -nx; ny = -ny; nz = -nz; }
          const nl2 = Math.hypot(nx, ny, nz) || 1;
          nor[a] = nx / nl2; nor[a + 1] = ny / nl2; nor[a + 2] = nz / nl2;
        }
        for (let a = 0; a < n; a++) if (twin[a] >= 0) {
          const b2 = twin[a] * 3, a3 = a * 3, nx = nor[a3] + nor[b2], ny = nor[a3 + 1] + nor[b2 + 1], nz = nor[a3 + 2] + nor[b2 + 2], nl2 = Math.hypot(nx, ny, nz);
          if (nl2 > 1e-6) { nor[a3] = nor[b2] = nx / nl2; nor[a3 + 1] = nor[b2 + 1] = ny / nl2; nor[a3 + 2] = nor[b2 + 2] = nz / nl2; }
        }
        geo.attributes.position.needsUpdate = true; geo.attributes.normal.needsUpdate = true;
      };
      everyFrame(mesh, refresh);
    },
  };
};
