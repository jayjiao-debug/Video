// Segment A helper: YOUR hero rating sheet in S03-S04 (and the state segment B must start from at H1).
// Builder A's helper file. Runtime tweaks only (the classroom set is not edited): the hero card's maps are swapped for
// our own canvas (the set's sheet: seed 7, no rows marked) with the two printed column heads the storyboard's MACRO
// needs ("我给他打" over the 0-5 boxes, "我猜他给我" over the guess column), and the ink the film writes on it:
//   circled 3 in row 1 (f396-408), circled 5 in row 2 (f432-446), the gold underline under 我猜他给我 (f470-480, part
//   of the sheet's overlay so it moves with the sheet), and 5 / 5 / 4 / 5 down the guess column (f496, 502, 508, 514,
//   4 frames each). The hero pen (set object) is moved into YOUR hand while it writes.
// Segment B (H1 in): call heroSheetH1(w) in enter() (sheet ink + pen exactly as at f535) and heroSheetRestore(w) in
// exit(); h1Points(w) gives the pen grip (YOUR right hand) and the left fist with the rope ends.
import * as THREE from "three";
import { ratingSheetTex } from "../sets/classroom";
import { FONT_STACK, loadOverlayFonts, overlayFontReady } from "../kit/phone";
import type { World } from "../world";

// the font file is local; start loading at import so it is ready long before the world finishes building
void loadOverlayFonts();

const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const WD = 1448, HT = Math.round(WD * 1.4137), U = WD / 210; // px per mm (A4 210 x 297 mm)
type P2 = [number, number];

// -------------------------------------------------------------------------------------------- sheet layout (mm)
/** ratingSheetTex's table: top 44, row height 14.6, 0-5 boxes from 98 (each 11.33 wide), guess column 168-196 */
export const SHEET = { top: 44, rh: 14.6, cBox: 98, cGuess: 168, x1: 196, bw: (168 - 2 - 98) / 6 };
/** centre of box n (0-5) in table row `row` (0 = the first person) */
export const boxMM = (n: number, row: number): P2 => [SHEET.cBox + n * SHEET.bw + SHEET.bw / 2, SHEET.top + (row + 1) * SHEET.rh + SHEET.rh / 2];
/** a point on the sheet (mm from the top-left, header toward the board) -> world (h = height above the paper) */
export function sheetWorld(w: World, mm: P2, h = 0.0008): THREE.Vector3 {
  const c = w.classroom.A.cards[w.classroom.roles.you];
  return V((mm[0] / 210 - 0.5) * 0.21, h, (mm[1] / 297 - 0.5) * 0.297).applyAxisAngle(V(0, 1, 0), c.yaw).add(c.pos);
}

// -------------------------------------------------------------------------------------------- the ink timeline
export const INK = { c3: [396, 408], c5: [432, 446], under: [470, 480], digits: [496, 502, 508, 514], dur: 4, values: ["5", "5", "4", "5"] } as const;
export type InkState = { c3: number; c5: number; under: number; d: number[] };
export const inkAt = (f: number): InkState => ({
  c3: clamp01((f - INK.c3[0]) / (INK.c3[1] - INK.c3[0])), c5: clamp01((f - INK.c5[0]) / (INK.c5[1] - INK.c5[0])),
  under: clamp01((f - INK.under[0]) / (INK.under[1] - INK.under[0])), d: INK.digits.map((a) => clamp01((f - a) / INK.dur)),
});
/** the circle round box n of row `row`: a hand-drawn loop starting top-left, closing with a small overshoot */
function circleStroke(n: number, row: number): P2[] {
  const [cx, cy] = boxMM(n, row), out: P2[] = [], N = 44, a0 = -2.5, sweep = 2 * Math.PI + 0.6;
  for (let k = 0; k <= N; k++) {
    const u = k / N, a = a0 + sweep * u, r = 1 + 0.05 * Math.sin(3 * a + 1.3) + 0.07 * u;
    out.push([cx + 7.6 * r * Math.cos(a), cy + 6.3 * r * Math.sin(a) - 0.6 * u]);
  }
  return out;
}
/** single-stroke handwritten digits in a 5 x 8 mm box (y down) */
const GLYPH: Record<string, P2[][]> = {
  "5": [[[4.5, 0.1], [1.1, 0.25], [0.75, 3.7], [2.3, 3.05], [3.9, 3.6], [4.55, 5.35], [3.85, 7.3], [2.0, 8.0], [0.3, 7.05]]],
  "4": [[[3.3, 0], [0.2, 5.35], [4.9, 5.3]], [[3.5, 2.3], [3.25, 8.2]]],
};
/** the strokes of guess digit k (rows 0-3), in sheet mm */
function digitStrokes(k: number): P2[][] {
  const g = GLYPH[INK.values[k]], s = 1.08, x0 = (SHEET.cGuess + SHEET.x1) / 2 - 2.5 * s + (k % 2 ? 0.6 : -0.4), y0 = SHEET.top + (k + 1) * SHEET.rh + 2.9;
  return g.map((st) => st.map(([x, y]) => [x0 + x * s + y * 0.08, y0 + y * s] as P2));
}
const UNDER: P2[] = [[168.8, 43.1], [195.4, 42.6]];
/** polyline length helpers: the drawn part of `strokes` at progress p (by length) and the pen point there */
function partial(strokes: P2[][], p: number): { parts: P2[][]; tip: P2 } {
  const lens = strokes.map((st) => st.slice(1).reduce((s, q, i) => s + Math.hypot(q[0] - st[i][0], q[1] - st[i][1]), 0));
  let left = lens.reduce((a, b) => a + b, 0) * clamp01(p);
  const parts: P2[][] = []; let tip: P2 = strokes[0][0];
  for (let si = 0; si < strokes.length; si++) {
    const st = strokes[si], part: P2[] = [st[0]]; tip = st[0];
    for (let i = 1; i < st.length; i++) {
      const d = Math.hypot(st[i][0] - st[i - 1][0], st[i][1] - st[i - 1][1]);
      if (left >= d) { part.push(st[i]); tip = st[i]; left -= d; continue; }
      const u = d > 0 ? left / d : 0; tip = [st[i - 1][0] + (st[i][0] - st[i - 1][0]) * u, st[i - 1][1] + (st[i][1] - st[i - 1][1]) * u]; part.push(tip); left = 0; break;
    }
    parts.push(part);
    if (left <= 0) break;
  }
  return { parts, tip };
}

// -------------------------------------------------------------------------------------------- the pen's path (mm + lift)
/** where the pen tip is at frame f (S04): sheet mm, lift above the paper (m), and whether it is in YOUR hand.
 *  Before f386 it lies where the set put it; it enters MACRO from the lower right (f388-396). */
export function penAt(f: number): { mm: P2; lift: number; held: boolean } {
  const c3 = circleStroke(3, 0), c5 = circleStroke(5, 1);
  const lerp2 = (a: P2, b: P2, u: number): P2 => [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u];
  const eo = (u: number) => 1 - Math.pow(1 - clamp01(u), 3), eio = (u: number) => { const t = clamp01(u); return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
  const OFF: P2 = [236, 168];
  if (f < 386) return { mm: OFF, lift: 0.07, held: false };
  if (f < 396) { const u = eo((f - 386) / 10); return { mm: lerp2(OFF, c3[0], u), lift: 0.07 * (1 - u) + 0.0, held: true }; }
  if (f <= 408) return { mm: partial([c3], (f - 396) / 12).tip, lift: 0, held: true };
  const rest3: P2 = [158, 74], rest5: P2 = [176, 90];
  if (f < 430) { const u = eo((f - 408) / 8); return { mm: lerp2(c3[c3.length - 1], rest3, u), lift: 0.009 * u, held: true }; }
  if (f < 432) { const u = eio((f - 430) / 2); return { mm: lerp2(rest3, c5[0], u), lift: 0.009 * (1 - u), held: true }; }
  if (f <= 446) return { mm: partial([c5], (f - 432) / 14).tip, lift: 0, held: true };
  const d0 = digitStrokes(0)[0][0];
  if (f < 462) { const u = eo((f - 446) / 8); return { mm: lerp2(c5[c5.length - 1], rest5, u), lift: 0.009 * u, held: true }; }
  if (f < 494) { const u = eio((f - 462) / 32); return { mm: lerp2(rest5, d0, u), lift: 0.009 * (1 - u) + 0.004 * Math.sin(Math.PI * u), held: true }; }
  for (let k = 0; k < 4; k++) {
    const at = INK.digits[k], st = digitStrokes(k), next = k < 3 ? digitStrokes(k + 1)[0][0] : null;
    if (f < at) {
      // moving from the previous digit's end to this digit's start (or waiting on it)
      if (k === 0) return { mm: d0, lift: 0.0015 * clamp01((496 - f) / 2), held: true };
      const prev = digitStrokes(k - 1), pe = prev[prev.length - 1], pend = pe[pe.length - 1], u = eio((f - (INK.digits[k - 1] + INK.dur)) / (at - INK.digits[k - 1] - INK.dur));
      return { mm: lerp2(pend, st[0][0], u), lift: 0.004 * Math.sin(Math.PI * u), held: true };
    }
    if (f <= at + INK.dur) return { mm: partial(st, (f - at) / INK.dur).tip, lift: 0, held: true };
    if (!next) { const pe = st[st.length - 1]; return { mm: pe[pe.length - 1], lift: 0, held: true }; }
  }
  const last = digitStrokes(3), le = last[last.length - 1];
  return { mm: le[le.length - 1], lift: 0, held: true };
}

// -------------------------------------------------------------------------------------------- painting + swapping maps
type Saved = { map: THREE.Texture | null; bump: THREE.Texture | null; rough: THREE.Texture | null; penPos: THREE.Vector3; penQ: THREE.Quaternion; penS: THREE.Vector3 };
let base: HTMLCanvasElement | null = null, bumpTex: THREE.Texture | null = null;
let cv: HTMLCanvasElement | null = null, g: CanvasRenderingContext2D | null = null, tex: THREE.CanvasTexture | null = null;
let lastKey = "", saved: Saved | null = null;
/** dbg: whether the overlay font was ready when the headers were last painted */
export let headerFontOk = false;

function ensureCanvas(orig: THREE.Texture) {
  if (cv) return;
  const t = ratingSheetTex({ seed: 7, hero: true, done: 0 });
  base = t.map.image as HTMLCanvasElement; bumpTex = t.bump;
  t.map.dispose();
  cv = document.createElement("canvas"); cv.width = WD; cv.height = HT;
  g = cv.getContext("2d")!;
  tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = orig.colorSpace; tex.flipY = orig.flipY; tex.wrapS = orig.wrapS; tex.wrapT = orig.wrapT;
  tex.repeat.copy(orig.repeat); tex.offset.copy(orig.offset); tex.anisotropy = orig.anisotropy;
  tex.minFilter = orig.minFilter; tex.magFilter = orig.magFilter; tex.generateMipmaps = orig.generateMipmaps;
}
function stroke(pts: P2[], width: number, color: string) {
  if (pts.length < 2) return;
  const c = g!; c.strokeStyle = color; c.lineWidth = width * U; c.lineCap = "round"; c.lineJoin = "round";
  c.beginPath(); c.moveTo(pts[0][0] * U, pts[0][1] * U); for (let i = 1; i < pts.length; i++) c.lineTo(pts[i][0] * U, pts[i][1] * U); c.stroke();
}
function paint(ink: InkState) {
  const c = g!;
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1;
  c.drawImage(base!, 0, 0);
  // printed column heads (the study's form): over the 0-5 boxes and over the guess column
  headerFontOk = overlayFontReady();
  c.fillStyle = "rgb(58,62,72)"; c.textAlign = "center"; c.textBaseline = "alphabetic";
  c.font = `700 ${Math.round(6.2 * U)}px ${FONT_STACK}`; c.fillText("我给他打", ((SHEET.cBox + SHEET.cGuess - 2) / 2) * U, 41.4 * U);
  c.font = `700 ${Math.round(4.7 * U)}px ${FONT_STACK}`; c.fillText("我猜他给我", ((SHEET.cGuess + SHEET.x1) / 2) * U, 41.4 * U);
  const BLUE = "rgba(36,70,176,0.93)";
  if (ink.c3 > 0) for (const p of partial([circleStroke(3, 0)], ink.c3).parts) stroke(p, 0.75, BLUE);
  if (ink.c5 > 0) for (const p of partial([circleStroke(5, 1)], ink.c5).parts) stroke(p, 0.75, BLUE);
  if (ink.under > 0) { for (const p of partial([UNDER], ink.under).parts) { stroke(p, 1.6, "rgba(17,19,27,0.9)"); stroke(p, 1.05, "#f0b631"); } }
  ink.d.forEach((p, k) => { if (p > 0) for (const q of partial(digitStrokes(k), p).parts) stroke(q, 0.72, BLUE); });
}
const inkKey = (ink: InkState) => [ink.c3, ink.c5, ink.under, ...ink.d].map((v) => Math.round(v * 200)).join(",") + (overlayFontReady() ? "F" : "f");

/** put our sheet on the hero card with the ink of `ink` (repaints only when the ink changes) */
export function heroSheetApply(w: World, ink: InkState) {
  const mesh = w.classroom.set.objects.heroSheet, mat = mesh.material as THREE.MeshStandardMaterial;
  if (!saved) {
    const pen = w.classroom.set.objects.heroPen;
    saved = { map: mat.map, bump: mat.bumpMap, rough: mat.roughnessMap, penPos: pen.position.clone(), penQ: pen.quaternion.clone(), penS: pen.scale.clone() };
  }
  ensureCanvas(saved.map ?? new THREE.Texture());
  if (mat.map !== tex) { mat.map = tex; if (mat.bumpMap && bumpTex) mat.bumpMap = bumpTex; if (mat.roughnessMap && bumpTex) mat.roughnessMap = bumpTex; }
  const key = inkKey(ink);
  if (key !== lastKey) { paint(ink); tex!.needsUpdate = true; lastKey = key; }
}

/** the hero pen in YOUR hand: tip at `tip` (world), the pen leaning along `dir` (tip -> back end) */
export function penPlace(w: World, tip: THREE.Vector3, dir: THREE.Vector3) {
  const pen = w.classroom.set.objects.heroPen;
  const x = dir.clone().normalize(), up = V(0, 1, 0), y = up.clone().addScaledVector(x, -up.dot(x)).normalize(), z = x.clone().cross(y);
  const q = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, y, z));
  pen.quaternion.copy(q); pen.scale.set(1, 1, 1);
  // the pen's writing tip is at local (-0.0755, 0.0045, 0) (penParts: cone at -x)
  pen.position.copy(tip).sub(V(-0.0755, 0.0045, 0).applyQuaternion(q));
  pen.updateMatrixWorld(true);
}
/** the pen back where the set put it (lying on the sheet) */
export function penRest(w: World) {
  if (!saved) return;
  const pen = w.classroom.set.objects.heroPen;
  pen.position.copy(saved.penPos); pen.quaternion.copy(saved.penQ); pen.scale.copy(saved.penS); pen.updateMatrixWorld(true);
}
/** the pen's lean while writing: from the tip toward YOUR right shoulder, tipped up */
export function penDir(tip: THREE.Vector3, shoulder: THREE.Vector3, o: { side?: number; flat?: number; up?: number } = {}) {
  // horizontal: toward the shoulder, turned toward YOUR right (+x) by `side`; then `flat` of that plus `up` (H1 defaults)
  const hz = shoulder.clone().sub(tip).setY(0).normalize().add(V(o.side ?? 0, 0, 0)).normalize();
  return hz.multiplyScalar(o.flat ?? 0.62).add(V(0, o.up ?? 0.78, 0)).normalize();
}
/** YOUR right shoulder (physical, from the seat: facing the board, +x is your right) */
export function rightShoulder(w: World) {
  const s = w.classroom.A.seats[w.classroom.roles.you];
  return s.pos.clone().add(V(0.165, 0.47, 0.02));
}
/** where the writing hand grips the pen (3 cm up the pen from the tip) */
export const penGrip = (tip: THREE.Vector3, dir: THREE.Vector3, d = 0.032) => tip.clone().addScaledVector(dir, d);

/** everything back as the set had it */
export function heroSheetRestore(w: World) {
  if (!saved) return;
  const mat = w.classroom.set.objects.heroSheet.material as THREE.MeshStandardMaterial;
  mat.map = saved.map; mat.bumpMap = saved.bump; mat.roughnessMap = saved.rough;
  penRest(w);
  saved = null;
}

/** H1 for segment B's enter(): the sheet and pen exactly as at f535 */
export function heroSheetH1(w: World) {
  heroSheetApply(w, inkAt(535));
  const p = penAt(535), tip = sheetWorld(w, p.mm, p.lift + 0.0008);
  penPlace(w, tip, penDir(tip, rightShoulder(w)));
}
/** H1 points for segment B: YOUR right hand on the pen, the left fist holding the near ends of Y3 / Y5 */
export function h1Points(w: World) {
  const p = penAt(535), tip = sheetWorld(w, p.mm, p.lift + 0.0008), dir = penDir(tip, rightShoulder(w));
  return { penTip: tip, penGrip: penGrip(tip, dir), leftFist: leftFist(w) };
}
/** YOUR left fist at H1 (resting on the desk's near edge, left of the sheet) */
export function leftFist(w: World) {
  const s = w.classroom.A.seats[w.classroom.roles.you];
  return V(s.pos.x - 0.24, 0.84, s.pos.z - 0.29);
}
