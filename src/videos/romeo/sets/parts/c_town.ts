// TOWN PARTS of 采访罗密欧与朱丽叶 (set builder C: the street of Verona, scene 5, and the street of Mantua, scene 7).
// A house is built in its OWN frame (its front at z 0 facing +z, u = x from 0 to w along the front, depth into -z)
// and placed by a matrix: `houseAt(x, z, yaw)`. Everything small on a front is PAINT (one canvas per house front:
// windows, shutters, sills, string courses, cornice, plinth, weathering); geometry is chunky and closed: the body box,
// the eaves (a 16 cm fascia), balconies (16 cm slab, a solid parapet with painted balusters), the holes that need
// depth (a doorway, the boardable window) with their reveals. Kit rules: src/kit/sets/okit.ts header, kit fx/README.md.
// Seeded painting only (okit rng).
import * as THREE from "three";
import { paint, rng, css, mix, toHex, blotch, soft, facesG, Batch, type G2 } from "../../../../kit/sets/okit";
import { boxG, quad4, wallQuad, type Mk } from "../../../newton/sets/parts/common";
import { holedWall, revealG, type Hole } from "../../../newton/sets/parts/newton";

export { Batch, boxG, quad4, wallQuad, holedWall, revealG };
export type { Hole };
export type V3 = [number, number, number];

/** a placement: the house's left front corner (seen from the street) at world (x, z), its front turned by yaw
 *  (0 = facing +z, PI/2 = facing +x, -PI/2 = facing -x) */
export const houseAt = (x: number, z: number, yaw: number) => new THREE.Matrix4().makeRotationY(yaw).setPosition(x, 0, z);
/** a local point of a house (u along the front, y up, k in front of it) in the world */
export const onHouse = (M: THREE.Matrix4, u: number, y: number, k = 0) => new THREE.Vector3(u, y, k).applyMatrix4(M);

// =====================================================================================================================
// the paintings
// =====================================================================================================================
export type WinKind = "closed" | "open" | "half" | "dark" | "door" | "plank";
export type Win = { u: number; y0: number; y1: number; w: number; kind: WinKind };
export type FrontPal = { wall: string; wallLo: string; wallHi: string; trim: string; shutter: string; plinth: string; line: string; brick?: string; dark: string };
/** THE PAINTED FRONT of a house, w x h metres at ppm px per metre: stucco with soft weathering (and a patch or two
 *  where it fell off the brick), a stone plinth, string courses at `courses` heights, a cornice under the eaves,
 *  the windows (stone surround, sill, louvered shutters closed / open / half, or a dark opening), the surround of
 *  each hole (holes are cut out of the geometry: paint only their frames) */
export const frontTex = (o: { seed: number; w: number; h: number; ppm?: number; pal: FrontPal; wins: Win[]; courses?: number[]; cornice?: boolean; plinth?: number; holes?: (Hole & { surround?: number })[]; brickPatches?: number; cracks?: number; stains?: number }) => {
  const ppm = o.ppm ?? 64, P = o.pal;
  return paint(Math.round(o.w * ppm), Math.round(o.h * ppm), (g, W, H) => {
    const r = rng(o.seed), X = (u: number) => u * ppm, Y = (y: number) => H - y * ppm, m = ppm;
    g.fillStyle = P.wall; g.fillRect(0, 0, W, H);
    // soft uneven stucco: big quiet blotches, a darker wash toward the foot, lighter at the top
    for (let i = 0; i < 26 * o.w * o.h / 30 + 8; i++) blotch(g, W * r(), H * r(), m * (0.5 + 1.4 * r()), r() < 0.55 ? P.wallLo : P.wallHi, 0.16 + 0.12 * r());
    const gr = g.createLinearGradient(0, H, 0, H - 2.2 * m); gr.addColorStop(0, css(P.wallLo, 0.45)); gr.addColorStop(1, css(P.wallLo, 0)); g.fillStyle = gr; g.fillRect(0, H - 2.2 * m, W, 2.2 * m);
    // patches where the stucco fell off: the brick shows (soft-edged, a few courses)
    for (let i = 0; i < (o.brickPatches ?? 0); i++) {
      const cx = W * (0.12 + 0.76 * r()), cy = H * (0.25 + 0.55 * r()), rw = m * (0.35 + 0.35 * r()), rh = m * (0.22 + 0.2 * r());
      g.save(); g.beginPath(); g.ellipse(cx, cy, rw, rh, (r() - 0.5) * 0.4, 0, 7); g.clip();
      g.fillStyle = css(mix(P.brick ?? "#b08268", P.wallLo, 0.25)); g.fillRect(cx - rw, cy - rh, 2 * rw, 2 * rh);
      const bh = 0.075 * m, bw = 0.24 * m;
      g.strokeStyle = css(P.wallHi, 0.55); g.lineWidth = Math.max(1, m / 60);
      for (let y = cy - rh, k = 0; y < cy + rh; y += bh, k++) { g.beginPath(); g.moveTo(cx - rw, y); g.lineTo(cx + rw, y); g.stroke(); for (let x = cx - rw + (k % 2) * bw / 2; x < cx + rw; x += bw) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + bh); g.stroke(); } }
      g.restore();
      g.strokeStyle = css(P.line, 0.35); g.lineWidth = Math.max(1.2, m / 40); g.beginPath(); g.ellipse(cx, cy, rw, rh, 0, 0, 7); g.stroke();
    }
    // the plinth (stone blocks)
    const ph = o.plinth ?? 0.55;
    if (ph > 0) {
      g.fillStyle = P.plinth; g.fillRect(0, Y(ph), W, ph * m);
      g.strokeStyle = css(P.line, 0.3); g.lineWidth = Math.max(1, m / 50);
      for (let x = r() * 0.6 * m; x < W; x += (0.5 + 0.4 * r()) * m) { g.beginPath(); g.moveTo(x, Y(ph)); g.lineTo(x, H); g.stroke(); }
      g.fillStyle = css(P.wallHi, 0.5); g.fillRect(0, Y(ph) - m * 0.03, W, m * 0.03);
      g.fillStyle = css(P.line, 0.25); g.fillRect(0, Y(ph), W, m * 0.025);
    }
    // string courses and the cornice
    for (const y of o.courses ?? []) {
      g.fillStyle = P.trim; g.fillRect(0, Y(y + 0.07), W, 0.14 * m);
      g.fillStyle = css(P.line, 0.28); g.fillRect(0, Y(y - 0.07), W, 0.04 * m);
    }
    if (o.cornice) {
      g.fillStyle = P.trim; g.fillRect(0, 0, W, 0.34 * m);
      g.fillStyle = css(P.line, 0.3); for (let x = 0.06 * m; x < W; x += 0.2 * m) g.fillRect(x, 0.2 * m, 0.09 * m, 0.1 * m);   // dentils
      g.fillStyle = css(P.line, 0.25); g.fillRect(0, 0.34 * m, W, 0.04 * m);
    }
    // cracks and rain stains
    g.lineCap = "round";
    for (let i = 0; i < (o.cracks ?? 2); i++) {
      let x = W * (0.1 + 0.8 * r()), y = H * (0.15 + 0.5 * r()); g.strokeStyle = css(P.line, 0.3); g.lineWidth = Math.max(1, m / 55); g.beginPath(); g.moveTo(x, y);
      for (let k = 0; k < 5; k++) { x += (r() - 0.5) * 0.25 * m; y += (0.08 + 0.12 * r()) * m; g.lineTo(x, y); } g.stroke();
    }
    // the holes' surrounds (stone)
    for (const hl of o.holes ?? []) {
      const s = (hl.surround ?? 0.12) * m, x0 = X(hl.u0), x1 = X(hl.u1), y1 = Y(hl.y1), y0 = Y(hl.y0);
      g.fillStyle = P.trim;
      if (hl.arch) {
        const cx = (x0 + x1) / 2, rr = (x1 - x0) / 2, spring = Y(hl.y1 - hl.arch);
        g.beginPath(); g.moveTo(x0 - s, y0); g.lineTo(x0 - s, spring); g.ellipse(cx, spring, rr + s, hl.arch * m + s, 0, Math.PI, 0); g.lineTo(x1 + s, y0); g.closePath(); g.fill();
        g.strokeStyle = css(P.line, 0.4); g.lineWidth = Math.max(1.2, m / 40); g.stroke();
        for (let k = 0; k <= 8; k++) { const a = Math.PI + (Math.PI * k) / 8; g.beginPath(); g.moveTo(cx + Math.cos(a) * rr, spring + Math.sin(a) * hl.arch * m); g.lineTo(cx + Math.cos(a) * (rr + s), spring + Math.sin(a) * (hl.arch * m + s)); g.stroke(); }   // voussoirs
      } else {
        g.fillRect(x0 - s, y1 - s, x1 - x0 + 2 * s, y0 - y1 + s);
        g.strokeStyle = css(P.line, 0.4); g.lineWidth = Math.max(1.2, m / 40); g.strokeRect(x0 - s, y1 - s, x1 - x0 + 2 * s, y0 - y1 + s);
        g.fillStyle = css(P.line, 0.12); g.fillRect(x0 - s, y1 - s, x1 - x0 + 2 * s, s * 0.25);
      }
    }
    // the windows
    for (const wn of o.wins) win(g, wn, X, Y, m, P, r);
  });
};
/** one painted window (or door) */
const win = (g: G2, wn: Win, X: (u: number) => number, Y: (y: number) => number, m: number, P: FrontPal, r: () => number) => {
  const x0 = X(wn.u - wn.w / 2), x1 = X(wn.u + wn.w / 2), y0 = Y(wn.y0), y1 = Y(wn.y1), w = x1 - x0, h = y0 - y1, s = 0.09 * m, lw = Math.max(1.2, m / 42);
  // the rain stain under the sill
  const st = g.createLinearGradient(0, y0, 0, y0 + 1.1 * m); st.addColorStop(0, css(P.wallLo, 0.5)); st.addColorStop(1, css(P.wallLo, 0));
  g.fillStyle = st; g.fillRect(x0 + w * 0.1, y0, w * 0.8, 1.1 * m);
  // the surround and the sill
  if (wn.kind !== "plank") {
    g.fillStyle = P.trim; g.fillRect(x0 - s, y1 - s, w + 2 * s, h + s);
    g.strokeStyle = css(P.line, 0.38); g.lineWidth = lw; g.strokeRect(x0 - s, y1 - s, w + 2 * s, h + s);
  }
  if (wn.kind !== "door") {
    g.fillStyle = css(mix(P.trim, "#ffffff", 0.1)); g.fillRect(x0 - 1.6 * s, y0 - 0.02 * m, w + 3.2 * s, 0.11 * m);
    g.fillStyle = css(P.line, 0.3); g.fillRect(x0 - 1.6 * s, y0 + 0.09 * m, w + 3.2 * s, 0.03 * m);
  }
  // the opening
  const op = g.createLinearGradient(0, y1, 0, y0); op.addColorStop(0, P.dark); op.addColorStop(1, css(mix(P.dark, P.wallLo, 0.25)));
  g.fillStyle = op; g.fillRect(x0, y1, w, h);
  const louvers = (a: number, b: number, top: number, bot: number, col: string) => {
    g.fillStyle = col; g.fillRect(a, top, b - a, bot - top);
    g.fillStyle = css(mix(col, "#20181c", 0.35)); for (let y = top + 0.05 * m; y < bot - 0.03 * m; y += 0.055 * m) g.fillRect(a + 0.035 * m, y, b - a - 0.07 * m, Math.max(1, 0.016 * m));
    g.strokeStyle = css(mix(col, "#20181c", 0.5)); g.lineWidth = lw; g.strokeRect(a, top, b - a, bot - top);
    g.fillStyle = css(mix(col, "#ffffff", 0.15)); g.fillRect(a + 0.01 * m, top + 0.01 * m, Math.max(1, 0.02 * m), bot - top - 0.02 * m);
  };
  const sh = P.shutter, sh2 = toHex(mix(P.shutter, "#ffffff", 0.06 * r()));
  if (wn.kind === "closed") { louvers(x0, x0 + w / 2, y1, y0, sh); louvers(x0 + w / 2, x1, y1, y0, sh2); }
  else if (wn.kind === "open") { louvers(x0 - w / 2 - s, x0 - s, y1, y0, sh); louvers(x1 + s, x1 + w / 2 + s, y1, y0, sh2); curtain(g, x0, x1, y1, y0, m); }
  else if (wn.kind === "half") { louvers(x0, x0 + w / 2, y1, y0, sh); louvers(x1 + s, x1 + w / 2 + s, y1, y0, sh2); curtain(g, x0 + w / 2, x1, y1, y0, m); }
  else if (wn.kind === "door") {
    // a plank door under a stone head: two leaves, iron studs, a ring
    g.fillStyle = css(mix(sh, "#3a2a22", 0.35)); g.fillRect(x0 + 0.04 * m, y1 + 0.04 * m, w - 0.08 * m, h - 0.04 * m);
    g.strokeStyle = css(mix(sh, "#20181c", 0.55)); g.lineWidth = lw;
    for (let x = x0 + 0.04 * m; x < x1 - 0.05 * m; x += 0.16 * m) { g.beginPath(); g.moveTo(x, y1 + 0.04 * m); g.lineTo(x, y0); g.stroke(); }
    g.beginPath(); g.moveTo((x0 + x1) / 2, y1); g.lineTo((x0 + x1) / 2, y0); g.lineWidth = lw * 1.6; g.stroke();
    g.fillStyle = "#4a3c3a"; for (const yy of [0.3, 0.6]) for (let x = x0 + 0.1 * m; x < x1 - 0.06 * m; x += 0.16 * m) { g.beginPath(); g.arc(x, y1 + h * yy, 0.018 * m, 0, 7); g.fill(); }
  } else if (wn.kind === "plank") {
    // a small opening shut with grey boards (Mantua)
    g.fillStyle = sh; g.fillRect(x0, y1, w, h);
    g.strokeStyle = css(mix(sh, "#20181c", 0.4)); g.lineWidth = lw; for (let x = x0; x <= x1 + 1; x += w / 3) { g.beginPath(); g.moveTo(x, y1); g.lineTo(x, y0); g.stroke(); }
    g.strokeRect(x0, y1, w, h);
  }
};
const curtain = (g: G2, x0: number, x1: number, y1: number, y0: number, m: number) => {
  g.fillStyle = "rgba(226,214,190,0.55)"; g.beginPath(); g.moveTo(x0, y1); g.lineTo(x0 + (x1 - x0) * 0.4, y1); g.quadraticCurveTo(x0 + (x1 - x0) * 0.18, (y1 + y0) / 2, x0 + (x1 - x0) * 0.12, y0 - 0.1 * m); g.lineTo(x0, y0 - 0.1 * m); g.closePath(); g.fill();
};
/** ROOF TILES: rows of curved channel tiles (coppi) running down the slope (v), the courses' lower edges darker */
export const tilesTex = (seed: number, base: string, lo: string, hi: string) => paint(256, 256, (g, W, H) => {
  const r = rng(seed), n = 8, cw = W / n;
  g.fillStyle = lo; g.fillRect(0, 0, W, H);
  for (let i = 0; i < n; i++) for (let j = 0; j < 6; j++) {
    const x = i * cw, y = (j * H) / 6 + ((i % 2) * H) / 12, c = toHex(mix(base, r() < 0.5 ? lo : hi, 0.25 * r()));
    const gr = g.createLinearGradient(x, 0, x + cw, 0); gr.addColorStop(0, css(mix(c, lo, 0.4))); gr.addColorStop(0.45, c); gr.addColorStop(0.7, css(mix(c, hi, 0.3))); gr.addColorStop(1, css(mix(c, lo, 0.5)));
    for (const dy of [-H, 0, H]) { g.fillStyle = gr; g.fillRect(x + 1, y + dy, cw - 2, H / 6 - 3); g.fillStyle = css(lo, 0.8); g.fillRect(x + 1, y + dy + H / 6 - 6, cw - 2, 4); }
  }
}, true);
/** the dark underside of the eaves with the rafter ends (painted stripes across u) */
export const raftersTex = (base: string, lo: string) => paint(256, 64, (g, W, H) => {
  g.fillStyle = lo; g.fillRect(0, 0, W, H);
  for (let x = 0; x < W; x += W / 8) { g.fillStyle = base; g.fillRect(x + 4, 0, W / 16, H); g.fillStyle = css(lo, 0.6); g.fillRect(x + 4 + W / 16 - 3, 0, 3, H); }
}, true);
/** a stone parapet's front: rounded balusters on a darker ground, a rail and a base */
export const balustradeTex = (stone: string, lo: string, line: string) => paint(256, 128, (g, W, H) => {
  g.fillStyle = css(mix(lo, "#3a2c2c", 0.35)); g.fillRect(0, 0, W, H);
  const n = 7;
  for (let i = 0; i < n; i++) {
    const cx = ((i + 0.5) * W) / n, bw = W / n * 0.34;
    g.fillStyle = stone; g.beginPath(); g.moveTo(cx - bw * 0.5, H * 0.82); g.quadraticCurveTo(cx - bw * 1.25, H * 0.55, cx - bw * 0.42, H * 0.3); g.lineTo(cx + bw * 0.42, H * 0.3); g.quadraticCurveTo(cx + bw * 1.25, H * 0.55, cx + bw * 0.5, H * 0.82); g.closePath(); g.fill();
    g.strokeStyle = css(line, 0.4); g.lineWidth = 2; g.stroke();
  }
  g.fillStyle = stone; g.fillRect(0, 0, W, H * 0.22); g.fillRect(0, H * 0.8, W, H * 0.2);
  g.fillStyle = css(line, 0.3); g.fillRect(0, H * 0.22, W, 3); g.fillRect(0, H * 0.8, W, 3);
});
/** big paving flags in courses across the street (rows along u), quiet joints, soft wear */
export const pavingTex = (seed: number, o: { base: string; lo: string; hi: string; joint: string; px?: number }) => paint(o.px ?? 512, o.px ?? 512, (g, W, H) => {
  const r = rng(seed), rows = 5, rh = H / rows;
  g.fillStyle = o.joint; g.fillRect(0, 0, W, H);
  for (let j = 0; j < rows; j++) {
    let x = -r() * W * 0.3; const ws: number[] = []; let tot = 0;
    while (tot < W) { const w = W * (0.22 + 0.2 * r()); ws.push(w); tot += w; }
    const k = W / tot; x = r() * W;
    for (const w0 of ws) {
      const w = w0 * k, c = css(mix(o.base, r() < 0.5 ? o.lo : o.hi, 0.15 + 0.4 * r()));
      for (const dx of [-W, 0]) {
        const x0 = ((x + dx) % (2 * W)), gap = 3;
        g.fillStyle = c; g.fillRect(x0 + gap, j * rh + gap, w - 2 * gap, rh - 2 * gap);
        g.save(); g.beginPath(); g.rect(x0 + gap, j * rh + gap, w - 2 * gap, rh - 2 * gap); g.clip();
        for (let b = 0; b < 3; b++) blotch(g, x0 + w * r(), j * rh + rh * r(), w * (0.2 + 0.25 * r()), r() < 0.5 ? o.hi : o.lo, 0.12);
        g.restore();
      }
      x += w;
    }
  }
  for (let i = 0; i < 260; i++) { g.fillStyle = r() < 0.5 ? css(o.lo, 0.12) : css(o.hi, 0.1); g.fillRect(W * r(), H * r(), 2 + 3 * r(), 2 + 3 * r()); }
}, true);

// =====================================================================================================================
// the house
// =====================================================================================================================
export type RoofMats = { tile: THREE.Material; under: THREE.Material; fascia: THREE.Material; end: THREE.Material };
export type HouseO = {
  w: number; h: number; D?: number;
  /** the front's material (frontTex) and the plain sides' */
  face: THREE.Material; side: THREE.Material;
  /** holes cut in the front (a doorway, a deep window), what they look into (the body's front face `recess` m back) */
  holes?: Hole[]; recess?: number; back?: THREE.Material; reveal?: THREE.Material;
  /** eaves to the street (a pitched roof, ridge along u) or a flat top behind a low parapet */
  roof?: { kind: "eaves" | "flat"; rise?: number; over?: number; m: RoofMats };
  balcony?: { u: number; y: number; w: number; d?: number; slab: THREE.Material; rail: THREE.Material };
  /** extra stone sills under some windows (chunky blocks: [u, y, w]) */
  sills?: [number, number, number][]; sillMat?: THREE.Material;
  cast?: boolean;
};
/** ONE HOUSE in its own frame, placed by M. Body + front as their own meshes (named), the rest into the batch. */
export const house = (Mk: Mk, BT: Batch, M: THREE.Matrix4, o: HouseO, name: string, into?: THREE.Object3D) => {
  const D = o.D ?? 5, w = o.w, h = o.h, cast = o.cast ?? true, W = (g: THREE.BufferGeometry) => g.applyMatrix4(M);
  const add = (m: THREE.Material, g: THREE.BufferGeometry) => BT.add(m, W(g));
  if (o.holes?.length) {
    const rc = o.recess ?? 0.28;
    Mk.mesh(name + ".front", W(holedWall([0, 0], [w, 0], 0, h, o.holes, w, h)), o.face, { cast, into });
    Mk.mesh(name + ".body", W(new THREE.BoxGeometry(w, h, D - rc).translate(w / 2, h / 2, -rc - (D - rc) / 2)), [o.side, o.side, o.side, o.side, o.back ?? o.side, o.side], { cast, into });
    for (const hl of o.holes) Mk.mesh(name + ".reveal", W(revealG([0, 0], [w, 0], { ...hl, arch: 0 }, rc, 0.6, hl.arch ? [0, 1, 3] : undefined)), o.reveal ?? o.side, { cast: false, into });
    for (const hl of o.holes) if (hl.arch) {   // the arched head's soffit: a strip along the curve, rc deep
      const n = 10, ww = hl.u1 - hl.u0, spring = hl.y1 - hl.arch, pts: THREE.Vector3[] = [];
      for (let i = 0; i <= n; i++) { const t = i / n, x = hl.u1 - ww * t, y = spring + hl.arch * Math.sin(Math.PI * t) ** 0.6; pts.push(new THREE.Vector3(x, Math.min(hl.y1, y), 0)); }
      const faces: THREE.Vector3[][] = [];
      for (let i = 0; i < n; i++) { const a = pts[i], b = pts[i + 1]; faces.push([a, b, b.clone().setZ(-rc), a.clone().setZ(-rc)]); }
      Mk.mesh(name + ".soffit", W(facesG(faces)), o.reveal ?? o.side, { cast: false, into });
      // the jambs up to the spring are in the reveal (sides 0, 1, 3)
    }
    // close the gap between the front and the body at both ends
    Mk.mesh(name + ".endL", W(wallQuad([0, -rc], [0, 0], 0, h)), o.side, { cast, into });
    Mk.mesh(name + ".endR", W(wallQuad([w, 0], [w, -rc], 0, h)), o.side, { cast, into });
  } else {
    Mk.mesh(name + ".body", W(new THREE.BoxGeometry(w, h, D).translate(w / 2, h / 2, -D / 2)), [o.side, o.side, o.side, o.side, o.face, o.side], { cast, into });
  }
  // the roof
  const R = o.roof;
  if (R?.kind === "eaves") {
    const over = R.over ?? 0.5, rise = R.rise ?? 1.4, ye = h - 0.04, zf = over, zr = -D / 2, yr = h + rise, ox = 0.02;
    const A = new THREE.Vector3(-ox, ye, zf), B = new THREE.Vector3(w + ox, ye, zf), C = new THREE.Vector3(w + ox, yr, zr), Dd = new THREE.Vector3(-ox, yr, zr);
    const slope = Math.hypot(zf - zr, rise);
    add(R.m.tile, quad4(A, B, C, Dd, (w + 2 * ox) / 1.1, slope / 1.1));
    const Bk = new THREE.Vector3(w + ox, ye, -D - over), Ak = new THREE.Vector3(-ox, ye, -D - over);
    add(R.m.tile, quad4(Bk, Ak, Dd, C, (w + 2 * ox) / 1.1, slope / 1.1));
    const dn = (v: THREE.Vector3) => v.clone().add(new THREE.Vector3(0, -0.06, 0));
    add(R.m.under, quad4(dn(B), dn(A), new THREE.Vector3(-ox, h - 0.02, 0), new THREE.Vector3(w + ox, h - 0.02, 0), (w + 2 * ox) / 1.6, 1));
    add(R.m.fascia, boxG(-ox, w + ox, ye - 0.2, ye + 0.02, zf - 0.1, zf + 0.01));
    // the gable ends (seen where a neighbour is lower)
    add(R.m.end, facesG([[new THREE.Vector3(0, h, zf), new THREE.Vector3(0, yr, zr), new THREE.Vector3(0, h, -D - over)]]));
    add(R.m.end, facesG([[new THREE.Vector3(w, h, zf), new THREE.Vector3(w, h, -D - over), new THREE.Vector3(w, yr, zr)]]));
  } else if (R?.kind === "flat") {
    add(R.m.fascia, boxG(-0.02, w + 0.02, h, h + 0.32, -0.02, 0.06));                 // a low parapet, its coping
    add(R.m.end, boxG(0, w, h, h + 0.22, -D, -0.02));
  }
  // the balcony: a 16 cm slab on stepped corbels, a solid parapet with painted balusters
  const Bl = o.balcony;
  if (Bl) {
    const d = Bl.d ?? 0.6, u0 = Bl.u - Bl.w / 2, u1 = Bl.u + Bl.w / 2, y = Bl.y, t = 0.13;
    add(Bl.slab, boxG(u0, u1, y - 0.16, y, -0.02, d));
    add(Bl.rail, boxG(u0, u1, y, y + 0.86, d - t, d));
    add(Bl.slab, boxG(u0 - 0.04, u1 + 0.04, y + 0.86, y + 0.96, d - t - 0.03, d + 0.03));
    for (const s of [0, 1]) add(Bl.rail, boxG(s ? u1 - t : u0, s ? u1 : u0 + t, y, y + 0.86, -0.02, d - t));
    for (const s of [0, 1]) add(Bl.slab, boxG(s ? u1 - t - 0.04 : u0 - 0.04, s ? u1 + 0.04 : u0 + t + 0.04, y + 0.86, y + 0.96, -0.02, d - t));
    for (const c of [u0 + 0.25, u1 - 0.25]) { add(Bl.slab, boxG(c - 0.09, c + 0.09, y - 0.42, y - 0.16, -0.02, d * 0.7)); add(Bl.slab, boxG(c - 0.09, c + 0.09, y - 0.62, y - 0.42, -0.02, d * 0.35)); }
  }
  for (const [u, y, sw] of o.sills ?? []) add(o.sillMat ?? o.side, boxG(u - sw / 2, u + sw / 2, y - 0.09, y, -0.02, 0.13));
};

/** the windows of a plain house front: `cols` windows per upper storey, shutters by a seeded mix */
export const upperWins = (seed: number, w: number, storeys: number[], cols: number, ww = 0.72, wh = 1.25, kinds: WinKind[] = ["closed", "open", "half", "closed"]): Win[] => {
  const r = rng(seed), out: Win[] = [];
  for (const y of storeys) for (let i = 0; i < cols; i++) out.push({ u: (w * (i + 0.5)) / cols, y0: y + 0.85, y1: y + 0.85 + wh, w: ww, kind: kinds[Math.floor(r() * kinds.length)] });
  return out;
};

// =====================================================================================================================
// small things
// =====================================================================================================================
/** a soft drifting veil (dust in the air, haze): an additive / normal soft card on NOINK */
export const softCard = (w: number, h: number, col: string, a: number, additive = false) => {
  const t = paint(128, 64, (g, W, H) => { soft(g, 12, () => { g.fillStyle = css(col, 1); g.beginPath(); g.ellipse(W / 2, H / 2, W * 0.36, H * 0.3, 0, 0, 7); g.fill(); }); });
  return new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: t, transparent: true, opacity: a, depthWrite: false, fog: false, blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending }));
};
