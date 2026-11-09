// "friends" set, v2: the university seminar room where 84 adult students (23-38) rated every classmate on paper (0-5)
// and guessed what each would give back. 11.6 m x 12 m, 3.2 m suspended ceiling, built in code.
// The approved v1 look is kept: a sunflower-yellow board wall with a green chalkboard (chalk 0-5 scale, the A->B / B->A
// sketch, "84 x 83"), warm cream block walls over a teal dado with a wooden rail, venetian blinds throwing a low
// afternoon sun's stripes, light vinyl tiles with a teal accent band, a ceiling grid of light panels, pennant bunting,
// coral lockers, blue doors. v2:
//  - 42 two-seat desks: 3 blocks x 2 desks x 7 rows (84 seats); 0.9 m aisles between the blocks (x -1.98, 1.54), side
//    aisles 0.63 m clear of the radiators and 0.74 m clear of the lockers. A rating card and a pen at every seat (the 1448 px
//    hero card at `you`, its guess column blank for the film's pen); laptops on ~36 %, coffee cups, water bottles,
//    phones, notebooks, a few lanyards, totes and jackets on chair backs, backpacks only in the outer aisles.
//  - board wall: three-panel board, clock, four framed prints (concert poster, course timetable, paper-cut art print,
//    talk-series poster; no school name or logo anywhere), projector screen, speakers; a 0.2 m dais along it (x -5.1 to
//    4.9, 1.5 m deep) with a lectern and the teacher's desk right of centre.
//  - five windows on the left wall (x = X0). The front-most (index 0, the storyboard's "window 1") opens: two outward
//    casements, blind raised, sill clear. Its sun falls on the dais at anchors.platform; setShaft() adds the visible beam
//    (crisp-edged additive shaft, its pool on the dais, ~140 dust motes that drift with animate(t)).
//  - window 3's radiator (4th from the front) feeds an exposed heating riser (floor to the ceiling void, at z 1.33) that
//    takes line 07's knot at 1.0 m: anchors.radiatorTie. A taut rope from `you` runs level to it through the clear lane
//    behind row 3's chair backs: anchors.radiatorRoute (raycast-checked; a low pipe could not be reached without the rope
//    passing through the seated row).
//  - the ceiling is a separate lid (tiles, light panels, vents, smoke detectors, projector, optional fans):
//    setCeilingOpen(u) lifts it 1.3 m and slides it 15 m toward +x. The wall tops are capped (finished from above) and an
//    invisible shadow-only roof keeps the room's light unchanged when the lid is gone.
//  - outside: the building round the room (rooms front and back, the corridor block on the door side, brick facade,
//    membrane roofs with rooflights and AC units), a lawn with toon trees, a paved walk with benches and lamp posts, a
//    teaching block 16 m across the lawn, a painted sky cylinder. Holds up through the open window and from the crane.
//
// Use (R3F / plain three):
//   const M = mats(makeEnv(gl), makeEnv(gl, CLASSROOM_FILL));        // pbr.ts; CLASSROOM_FILL is the room's env
//   const set = classroom(M);  root.add(set.group, ...set.lights);    // lights = [sun, sun.target]
//   per frame (pure functions of their argument): set.animate(t) (clock, fans), set.setCeilingOpen(u),
//     set.setWindowOpen(u), set.setShaft(u); all three setters take 0..1
//   camera from set.cams.<name> = { pos, look, fov } (9:16); the film camera must enable vasa/ink NOINK (sky, glass,
//     beams, blind slats live there); gl.shadowMap.type = LIGHTS.shadow.type, N8AO per CLASSROOM_AO, NEUTRAL tone mapping.
// Anchors (set.anchors; metres, y up, the board wall at -z, the windows at -x):
//   seats[84]    { i, row, col, side, pos: hip on the seat (y 0.472), facing: yaw (0 = toward the board, + turns to -x),
//                  dir, feet }; index = row * 12 + col * 2 + side, row 0 at the front, col 0 on the window side
//   cards[84]    { i, pos: card centre on the desk (y 0.7506), yaw, pen }; cards[you.i] is objects.heroSheet / heroPen
//   you          seat 41 (row 3, centre block, x -0.56) + neighbours [40, 42]
//   researcherPath  floor points down the window-side inner aisle (x -1.98): in front of the dais, one per row, back wall
//   radiatorTie (riser, y 1.0), radiatorSeat (36), radiatorRoute [hand behind your left shoulder, knot]
//   platform (feet, on the dais, sunlit to ~1.55 m above it), platformTop · lecturer, door, doorBack
//   windowOut    { centre, sill, outside, normal (-x), width 1.38, height 1.17, bottom, top, z } of the open casements
// Cams: wide (window-side front corner, sun behind the camera: 75 of 84 seated figures fully framed, the most a portrait
//   frame gets indoors), wideDoor (the old door-corner wide, 73/84, backlit), wideBack, wideAll / topdown / top72
//   (ceiling open: all 84), seat (OTS over your right shoulder onto the hero card), card (macro on the 0-5 boxes), board
//   (whole 0-5 scale and "84 x 83"), platform (front-row eye level across the shaft), platformLow (floor-level low angle,
//   along the shaft), platformClose (the storyboard's PLAT_LOW after its tilt), windowOut (toward the open window),
//   front, window, door.
// Cost: ~176k tris; static parts merged per material, desks / chairs / cards / props instanced per material: ~267
// draw calls including the shadow pass; ~2.3 s build, ~4.6 s to the first frame on SwiftShader; textures <= 2048 px.
// Textures follow woodtex.ts: albedo (sRGB) + one linear map with bump height in R and roughness in G. Seeded RNG only.
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { mats, makeSun, LIGHTS, type EnvSpec } from "../../bt/pbr";
import * as W from "../../bt/woodtex";
import { NOINK } from "../../vasa/ink";

type RGB = [number, number, number];
type V3 = [number, number, number];
type Mats = ReturnType<typeof mats>;
export type Cam = { pos: V3; look: V3; fov: number };

// =====================================================================================================================
// light: the room's diffuse environment (for mats(..., makeEnv(gl, CLASSROOM_FILL))), the sun, AO
// =====================================================================================================================
/** world-frame fill for wood/paint inside the room: warm floor bounce, cream walls at the horizon, a bright ceiling
 *  with the light panels, cool daylight from the window side (-x, azimuth 180) and a warm sun-patch bounce. */
export const CLASSROOM_FILL: EnvSpec = {
  frame: "world",
  // art pass: ~22 % less fill than the first build and a touch cooler above the horizon, so the low sun's striped
  // patches read as the key (warm sun / cool shade, like the reference interiors) instead of an overcast wash
  stops: [
    [-90, [0.24, 0.212, 0.172]], [-30, [0.26, 0.235, 0.195]], [-5, [0.325, 0.305, 0.27]], [5, [0.38, 0.37, 0.35]],
    [30, [0.42, 0.42, 0.41]], [60, [0.465, 0.47, 0.47]], [90, [0.49, 0.495, 0.5]],
  ],
  boxes: [
    { az: 180, el: 12, rot: 0, w: 70, h: 22, soft: 14, col: [0.74, 0.82, 0.95] },      // the window wall: daylight
    { az: 0, el: 70, rot: 0, w: 14, h: 22, soft: 6, col: [1.05, 1.03, 0.98] },         // ceiling panels
    { az: 120, el: 62, rot: 0, w: 14, h: 22, soft: 6, col: [1.05, 1.03, 0.98] },
    { az: 240, el: 62, rot: 0, w: 14, h: 22, soft: 6, col: [1.05, 1.03, 0.98] },
    { az: 210, el: -40, rot: 0, w: 46, h: 25, soft: 18, col: [0.62, 0.5, 0.36] },      // sunlit floor patches (warm bounce)
  ],
};
/** N8AO for the interior (smaller radius than the deck: lots of small props close together) */
export const CLASSROOM_AO = { aoRadius: 0.4, distanceFalloff: 1.0, intensity: 2.0, color: "#2a1a10" };
/** sun through the windows: direction (towards the sun: a low afternoon sun from the window side, 22 deg up and 30 deg
 *  toward the back, so the blind-striped patches stream right across the room to the centre aisle, the front desks,
 *  the board and the dado) and strength */
export const CLASSROOM_SUN = { dir: [-0.803, 0.375, 0.464] as V3, intensity: 13, color: "#ffe6c4" };

// =====================================================================================================================
// canvas infrastructure (woodtex.ts style)
// =====================================================================================================================
type G = CanvasRenderingContext2D;
/** mulberry32 */
const rng = (seed: number) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0; let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};
const clamp = (x: number, a = 0, b = 255) => Math.max(a, Math.min(b, x));
const css = (c: RGB, a = 1) => `rgba(${clamp(c[0]) | 0},${clamp(c[1]) | 0},${clamp(c[2]) | 0},${a.toFixed(3)})`;
const grey = (v: number, a = 1) => css([v, v, v], a);
const mul = (c: RGB, k: number): RGB => [c[0] * k, c[1] * k, c[2] * k];
const mix = (a: RGB, b: RGB, k: number): RGB => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
const CTX: CanvasRenderingContext2DSettings = { willReadFrequently: true };
const canvas = (w: number, h: number) => { const c = document.createElement("canvas"); c.width = w; c.height = h; return c; };
const ctex = (c: HTMLCanvasElement, srgb: boolean, wrap: boolean) => {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  t.wrapS = t.wrapT = wrap ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping;
  t.generateMipmaps = true; t.minFilter = THREE.LinearMipmapLinearFilter; t.magFilter = THREE.LinearFilter;
  t.anisotropy = 8; t.needsUpdate = true;
  return t;
};
/** albedo + height + roughness canvases drawn from one layout; height (R) and roughness (G) packed by done() */
class Sheet {
  ca: HTMLCanvasElement; ch: HTMLCanvasElement; cr: HTMLCanvasElement; a: G; h: G; r: G;
  constructor(public Wd: number, public Ht: number, base: RGB, hgt = 200, rough = 200) {
    this.ca = canvas(Wd, Ht); this.ch = canvas(Wd, Ht); this.cr = canvas(Wd, Ht);
    this.a = this.ca.getContext("2d", CTX)!; this.h = this.ch.getContext("2d", CTX)!; this.r = this.cr.getContext("2d", CTX)!;
    for (const g of [this.a, this.h, this.r]) { g.lineCap = "round"; g.lineJoin = "round"; }
    this.a.fillStyle = css(base); this.a.fillRect(0, 0, Wd, Ht);
    this.h.fillStyle = grey(hgt); this.h.fillRect(0, 0, Wd, Ht);
    this.r.fillStyle = grey(rough); this.r.fillRect(0, 0, Wd, Ht);
  }
  /** fn(dx, dy) once per tile copy the box touches, so drawing wraps seamlessly */
  wrap(x0: number, y0: number, x1: number, y1: number, fn: (dx: number, dy: number) => void) {
    for (const dx of [0, -this.Wd, this.Wd]) for (const dy of [0, -this.Ht, this.Ht]) {
      if (x1 + dx < 0 || x0 + dx > this.Wd || y1 + dy < 0 || y0 + dy > this.Ht) continue;
      fn(dx, dy);
    }
  }
  done(rep: THREE.Vector2, bumpScale: number, wrap = true): W.WoodTex {
    const { Wd, Ht } = this, hd = this.h.getImageData(0, 0, Wd, Ht), rd = this.r.getImageData(0, 0, Wd, Ht), d = hd.data, e = rd.data;
    for (let i = 0; i < d.length; i += 4) { d[i + 1] = e[i]; d[i + 2] = 0; d[i + 3] = 255; }
    this.h.putImageData(hd, 0, 0);
    this.cr.width = this.cr.height = 1;
    const surf = ctex(this.ch, false, wrap);
    return { map: ctex(this.ca, true, wrap), bump: surf, rough: surf, repeatPerMetre: rep, bumpScale };
  }
}
/** separable box blur (x3 = gaussian-ish) of a greyscale canvas (R channel), wrapping round the tile */
const blurGrey = (c: HTMLCanvasElement, sigma: number, wrap = true) => {
  if (sigma <= 0) return;
  const g = c.getContext("2d", CTX)!, Wd = c.width, Ht = c.height, im = g.getImageData(0, 0, Wd, Ht), d = im.data, N = Wd * Ht;
  let a = new Float32Array(N), b = new Float32Array(N);
  for (let i = 0; i < N; i++) a[i] = d[i * 4];
  const r = Math.max(1, Math.round((Math.sqrt(4 * sigma * sigma + 1) - 1) / 2)), k = 1 / (2 * r + 1);
  const ix = (L: number) => { const t = new Int32Array(L + 2 * r + 2); for (let i = 0; i < t.length; i++) { const j = i - r - 1; t[i] = wrap ? ((j % L) + L) % L : Math.max(0, Math.min(L - 1, j)); } return t; };
  const tx = ix(Wd), ty = ix(Ht);
  for (let pass = 0; pass < 3; pass++) {
    for (let y = 0; y < Ht; y++) {
      const o = y * Wd; let s = 0;
      for (let i = -r; i <= r; i++) s += a[o + tx[i + r + 1]];
      for (let x = 0; x < Wd; x++) { b[o + x] = s * k; s += a[o + tx[x + 2 * r + 2]] - a[o + tx[x + 1]]; }
    }
    [a, b] = [b, a];
  }
  for (let pass = 0; pass < 3; pass++) {
    for (let x = 0; x < Wd; x++) {
      let s = 0;
      for (let i = -r; i <= r; i++) s += a[ty[i + r + 1] * Wd + x];
      for (let y = 0; y < Ht; y++) { b[y * Wd + x] = s * k; s += a[ty[y + 2 * r + 2] * Wd + x] - a[ty[y + 1] * Wd + x]; }
    }
    [a, b] = [b, a];
  }
  for (let i = 0; i < N; i++) { const v = a[i]; d[i * 4] = v; d[i * 4 + 1] = v; d[i * 4 + 2] = v; d[i * 4 + 3] = 255; }
  g.putImageData(im, 0, 0);
};
/** filled brush stroke along pts, tapering at both ends */
const taper = (g: G, pts: [number, number][], w: number, ends = 0.6) => {
  const n = pts.length; if (n < 2) return;
  const L: [number, number][] = [], R: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)];
    let tx = b[0] - a[0], ty = b[1] - a[1]; const l = Math.hypot(tx, ty) || 1; tx /= l; ty /= l;
    const t = i / (n - 1), ww = 0.5 * w * (0.12 + 0.88 * Math.pow(Math.sin(Math.PI * t), ends));
    L.push([pts[i][0] - ty * ww, pts[i][1] + tx * ww]); R.push([pts[i][0] + ty * ww, pts[i][1] - tx * ww]);
  }
  g.beginPath(); g.moveTo(L[0][0], L[0][1]);
  for (let i = 1; i < n; i++) g.lineTo(L[i][0], L[i][1]);
  for (let i = n - 1; i >= 0; i--) g.lineTo(R[i][0], R[i][1]);
  g.closePath(); g.fill();
};
/** soft elliptical spot */
const spot = (g: G, x: number, y: number, rx: number, ry: number, col: string, col0: string) => {
  g.save(); g.translate(x, y); g.scale(1, ry / rx);
  const gr = g.createRadialGradient(0, 0, 0, 0, 0, rx); gr.addColorStop(0, col); gr.addColorStop(1, col0);
  g.fillStyle = gr; g.beginPath(); g.arc(0, 0, rx, 0, Math.PI * 2); g.fill(); g.restore();
};
const rrect = (g: G, x: number, y: number, w: number, h: number, r: number) => {
  r = Math.min(r, w / 2, h / 2);
  g.beginPath(); g.moveTo(x + r, y); g.lineTo(x + w - r, y); g.quadraticCurveTo(x + w, y, x + w, y + r); g.lineTo(x + w, y + h - r);
  g.quadraticCurveTo(x + w, y + h, x + w - r, y + h); g.lineTo(x + r, y + h); g.quadraticCurveTo(x, y + h, x, y + h - r);
  g.lineTo(x, y + r); g.quadraticCurveTo(x, y, x + r, y); g.closePath();
};

// ---------------- hand-drawn glyphs (no fonts: digits and a few signs as polylines in a 0.6 x 1 box) ----------------
type Poly = [number, number][];
const arc = (cx: number, cy: number, rx: number, ry: number, a0: number, a1: number, n = 14): Poly => {
  const out: Poly = [];
  for (let i = 0; i <= n; i++) { const a = ((a0 + ((a1 - a0) * i) / n) * Math.PI) / 180; out.push([cx + rx * Math.cos(a), cy + ry * Math.sin(a)]); }
  return out;
};
const GLYPH: Record<string, Poly[]> = {
  "0": [arc(0.3, 0.5, 0.27, 0.48, -90, 270, 26)],
  "1": [[[0.1, 0.22], [0.34, 0.02], [0.34, 1]]],
  "2": [[...arc(0.3, 0.27, 0.27, 0.25, -170, 15), [0.03, 1], [0.6, 1]]],
  "3": [arc(0.3, 0.26, 0.25, 0.24, -160, 90), arc(0.3, 0.74, 0.28, 0.26, -90, 160)],
  "4": [[[0.47, 1], [0.47, 0.02], [0.02, 0.68], [0.6, 0.68]]],
  "5": [[[0.56, 0.02], [0.12, 0.02], [0.07, 0.47], ...arc(0.3, 0.69, 0.29, 0.3, -140, 150)]],
  "6": [[...arc(0.55, 0.62, 0.48, 0.6, -105, -180, 10), ...arc(0.32, 0.72, 0.26, 0.27, 180, 540, 20)]],
  "7": [[[0.02, 0.02], [0.58, 0.02], [0.22, 1]]],
  "8": [arc(0.3, 0.25, 0.23, 0.23, 90, 450, 20), arc(0.3, 0.73, 0.28, 0.26, -90, 270, 20)],
  "9": [arc(0.3, 0.29, 0.26, 0.28, 0, 360, 20), [[0.56, 0.3], [0.52, 0.7], [0.38, 1]]],
  A: [[[0.0, 1], [0.3, 0], [0.6, 1]], [[0.12, 0.64], [0.48, 0.64]]],
  B: [[[0.06, 0.49], [0.06, 0], [0.3, 0], ...arc(0.3, 0.245, 0.22, 0.245, -90, 90, 10), [0.06, 0.49]],
    [[0.06, 0.49], [0.06, 1], [0.32, 1], ...arc(0.32, 0.745, 0.25, 0.255, 90, -90, 10)]],
  "?": [[...arc(0.3, 0.28, 0.26, 0.26, -170, 60, 12), [0.3, 0.7]]],
  "x": [[[0.08, 0.35], [0.52, 0.85]], [[0.52, 0.35], [0.08, 0.85]]],
  "=": [[[0.05, 0.45], [0.55, 0.45]], [[0.05, 0.72], [0.55, 0.72]]],
  "-": [[[0.08, 0.6], [0.52, 0.6]]],
  "%": [arc(0.14, 0.18, 0.11, 0.16, 0, 360, 12), arc(0.46, 0.82, 0.11, 0.16, 0, 360, 12), [[0.55, 0.02], [0.05, 0.98]]],
  ":": [],
};
const GLYPH_DOT: Record<string, [number, number][]> = { "?": [[0.3, 0.94]], ":": [[0.3, 0.32], [0.3, 0.78]] };
/** polylines + dots for a string at (x, y) top-left, glyph height `size` px */
const glyphs = (text: string, x: number, y: number, size: number, adv = 0.82) => {
  const polys: Poly[] = [], dots: [number, number][] = [];
  let cx = x;
  for (const ch of text) {
    if (ch !== " ") {
      for (const p of GLYPH[ch] ?? []) polys.push(p.map(([gx, gy]) => [cx + gx * size, y + gy * size] as [number, number]));
      for (const [gx, gy] of GLYPH_DOT[ch] ?? []) dots.push([cx + gx * size, y + gy * size]);
    }
    cx += (ch === "1" ? 0.62 : ch === ":" ? 0.5 : adv) * size;
  }
  return { polys, dots, width: cx - x };
};
const strokePolys = (g: G, polys: Poly[], w: number, col: string) => {
  g.strokeStyle = col; g.lineWidth = w; g.lineCap = "round"; g.lineJoin = "round";
  for (const p of polys) { g.beginPath(); p.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke(); }
};
const penText = (g: G, text: string, x: number, y: number, size: number, w: number, col: string) => {
  const q = glyphs(text, x, y, size); strokePolys(g, q.polys, w, col);
  g.fillStyle = col; for (const [dx, dy] of q.dots) { g.beginPath(); g.arc(dx, dy, w * 0.8, 0, Math.PI * 2); g.fill(); }
  return q.width;
};
/** chalk: three jittered overlapping passes (grain is punched in afterwards) */
const chalkPolys = (g: G, polys: Poly[], w: number, col: RGB, R: () => number) => {
  g.lineCap = "round"; g.lineJoin = "round";
  for (let k = 0; k < 3; k++) {
    g.strokeStyle = css(col, [0.3, 0.45, 0.75][k]); g.lineWidth = w * [1.6, 1.15, 0.7][k];
    for (const p of polys) {
      g.beginPath();
      p.forEach(([x, y], i) => { const jx = (R() - 0.5) * w * 0.3, jy = (R() - 0.5) * w * 0.3; if (i) g.lineTo(x + jx, y + jy); else g.moveTo(x + jx, y + jy); });
      g.stroke();
    }
  }
};
/** a run of cursive "handwriting" (looping trochoid words) on baseline y, total length len, x-height h */
const cursive = (R: () => number, x: number, y: number, len: number, h: number): Poly[] => {
  const out: Poly[] = []; let cx = x;
  while (cx < x + len - h) {
    const wl = Math.min(x + len - cx, h * (1.3 + 3.4 * R())), k = (2 * Math.PI) / (h * (0.5 + 0.22 * R())), ph = R() * 6.28;
    const tallAt = R() * wl, p: Poly = [];
    for (let s = 0; s <= wl; s += h * 0.07) {
      const tall = 1 + 1.1 * Math.exp(-Math.pow((s - tallAt) / (h * 0.35), 2));
      p.push([cx + s - 0.22 * h * Math.sin(k * s + ph), y - 0.5 * h * tall * (1 - Math.cos(k * s + ph)) * 0.5 - 0.15 * h * Math.sin(s / h)]);
    }
    out.push(p); cx += wl + h * (0.55 + 0.5 * R());
  }
  return out;
};
const circlePoly = (cx: number, cy: number, rx: number, ry = rx, n = 28, a0 = 0): Poly => arc(cx, cy, rx, ry, a0, a0 + 360, n);
const heartPoly = (cx: number, cy: number, s: number): Poly => {
  const p: Poly = [];
  for (let i = 0; i <= 40; i++) {
    const t = (i / 40) * Math.PI * 2;
    p.push([cx + s * 16 * Math.pow(Math.sin(t), 3) / 17, cy - s * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) / 17]);
  }
  return p;
};

// =====================================================================================================================
// textures
// =====================================================================================================================
/** painted cinder block (0.4 x 0.2 m blocks, running bond, recessed mortar, pitted paint). Tile 1.2 m; v = metres up
 *  (courses at multiples of 0.2 m of v). */
export function blockWall(o: { color: RGB; seed?: number }): W.WoodTex {
  const N = 1024, px = N / 1.2, R = rng(o.seed ?? 11), S = new Sheet(N, N, mul(o.color, 0.84), 60, 205);
  const bw = 0.4 * px, bh = 0.2 * px, j = 0.012 * px, { a, h, r } = S;
  for (let row = 0; row < 6; row++) {
    const off = row % 2 ? bw / 2 : 0, y0 = row * bh;
    for (let i = -1; i < 3; i++) {
      const x0 = i * bw + off, k = 0.975 + 0.05 * R(), tone = mix(mul(o.color, k), [255, 246, 228], 0.02 * R());
      S.wrap(x0, y0, x0 + bw, y0 + bh, (dx, dy) => {
        a.fillStyle = css(tone); a.fillRect(x0 + j / 2 + dx, y0 + j / 2 + dy, bw - j, bh - j);
        h.fillStyle = grey(215 + 10 * R()); h.fillRect(x0 + j / 2 + dx, y0 + j / 2 + dy, bw - j, bh - j);
        r.fillStyle = grey(150 + 20 * R()); r.fillRect(x0 + j / 2 + dx, y0 + j / 2 + dy, bw - j, bh - j);
      });
      // a soft light top edge and darker bottom edge on each block face (paint pooling)
      S.wrap(x0, y0, x0 + bw, y0 + bh, (dx, dy) => {
        const gr = a.createLinearGradient(0, y0 + dy, 0, y0 + bh + dy);
        gr.addColorStop(0, "rgba(255,250,236,0.10)"); gr.addColorStop(0.25, "rgba(255,250,236,0)"); gr.addColorStop(0.8, "rgba(60,40,20,0)"); gr.addColorStop(1, "rgba(60,40,20,0.08)");
        a.fillStyle = gr; a.fillRect(x0 + j / 2 + dx, y0 + j / 2 + dy, bw - j, bh - j);
      });
    }
  }
  blurGrey(S.ch, 2.6); // rounded block arrises
  // pits in the block face (through the paint) and a few bigger voids
  for (let i = 0; i < 7000; i++) {
    const x = R() * N, y = R() * N, rr = 0.5 + 1.7 * R() * R(), al = 0.05 + 0.12 * R();
    a.fillStyle = css(mul(o.color, 0.55), al); a.beginPath(); a.arc(x, y, rr, 0, Math.PI * 2); a.fill();
    h.fillStyle = grey(0, 0.35); h.beginPath(); h.arc(x, y, rr * 1.1, 0, Math.PI * 2); h.fill();
  }
  for (let i = 0; i < 160; i++) {
    const x = R() * N, y = R() * N, rr = 2 + 3 * R();
    a.fillStyle = css(mul(o.color, 0.62), 0.25); a.beginPath(); a.ellipse(x, y, rr, rr * 0.7, R() * 3, 0, Math.PI * 2); a.fill();
    h.fillStyle = grey(0, 0.6); h.beginPath(); h.ellipse(x, y, rr, rr * 0.7, 0, 0, Math.PI * 2); h.fill();
  }
  // roller mottle
  for (let i = 0; i < 26; i++) {
    const x = R() * N, y = R() * N, light = R() < 0.5, c: RGB = light ? [255, 250, 235] : mul(o.color, 0.7);
    S.wrap(x - 160, y - 160, x + 160, y + 160, (dx, dy) => spot(a, x + dx, y + dy, 60 + 100 * R(), 40 + 80 * R(), css(c, 0.05), css(c, 0)));
  }
  return S.done(new THREE.Vector2(1 / 1.2, 1 / 1.2), 2.2);
}

/** light vinyl composition tiles, 0.3 m, quarter-turned directional chips, a few confetti flecks, grout seams, waxed
 *  sheen with traffic scuffs; tiles from a few dye lots (a cream majority, some warmer grey, a few paler) so the floor
 *  reads in perspective. Tile 2.4 m (8 x 8 tiles) at 2048 px. */
export function floorTiles(o: { seed?: number; base?: RGB } = {}): W.WoodTex {
  const N = 2048, px = N / 2.4, t = 0.3 * px, R = rng(o.seed ?? 21), base = o.base ?? [238, 230, 214];
  const S = new Sheet(N, N, [146, 136, 122], 70, 160), { a, h, r } = S;
  const chipsCol: RGB[] = [[252, 250, 244], [214, 206, 192], [196, 186, 170], [226, 214, 194], [178, 170, 160]];
  const confetti: RGB[] = [[70, 170, 160], [236, 110, 80], [240, 190, 70], [110, 140, 210]];
  for (let ty = 0; ty < 8; ty++) for (let tx = 0; tx < 8; tx++) {
    const lot = R(), lk = lot < 0.6 ? 1.0 : lot < 0.85 ? 0.945 : lot < 0.95 ? 1.03 : 0.9;
    const x0 = tx * t, y0 = ty * t, tone = mix(mul(base, lk * (0.99 + 0.02 * R())), [214, 200, 178], lk < 0.95 ? 0.25 : 0);
    const sw = 2.2;
    a.fillStyle = css(tone); a.fillRect(x0 + sw, y0 + sw, t - 2 * sw, t - 2 * sw);
    h.fillStyle = grey(205); h.fillRect(x0 + sw, y0 + sw, t - 2 * sw, t - 2 * sw);
    r.fillStyle = grey(92 + 14 * R()); r.fillRect(x0 + sw, y0 + sw, t - 2 * sw, t - 2 * sw);
    a.save(); a.beginPath(); a.rect(x0 + sw, y0 + sw, t - 2 * sw, t - 2 * sw); a.clip();
    const along = (tx + ty) % 2 === 0; // quarter-turned
    for (let i = 0; i < 260; i++) {
      const c = chipsCol[Math.floor(R() * chipsCol.length)], x = x0 + R() * t, y = y0 + R() * t, l = 3 + 9 * R(), w = 1.2 + 2 * R();
      a.fillStyle = css(c, 0.22 + 0.3 * R()); a.beginPath(); a.ellipse(x, y, along ? l : w, along ? w : l, (R() - 0.5) * 0.3, 0, Math.PI * 2); a.fill();
    }
    for (let i = 0; i < 7; i++) {
      const c = confetti[Math.floor(R() * confetti.length)], x = x0 + R() * t, y = y0 + R() * t;
      a.fillStyle = css(c, 0.55); a.beginPath(); a.ellipse(x, y, 1.6 + 1.6 * R(), 1.2 + R(), R() * 3, 0, Math.PI * 2); a.fill();
    }
    // soft tonal cloud inside the tile
    spot(a, x0 + t * (0.3 + 0.4 * R()), y0 + t * (0.3 + 0.4 * R()), t * 0.45, t * 0.3, css([255, 252, 240], 0.12), css([255, 252, 240], 0));
    a.restore();
    // light bevel on the top/left edges, darker bottom/right
    a.fillStyle = "rgba(255,255,250,0.25)"; a.fillRect(x0 + sw, y0 + sw, t - 2 * sw, 1.2); a.fillRect(x0 + sw, y0 + sw, 1.2, t - 2 * sw);
    a.fillStyle = "rgba(90,80,60,0.12)"; a.fillRect(x0 + sw, y0 + t - sw - 1.2, t - 2 * sw, 1.2); a.fillRect(x0 + t - sw - 1.2, y0 + sw, 1.2, t - 2 * sw);
  }
  blurGrey(S.ch, 1.1);
  // heel scuffs (dark, rougher) and wax blotches
  for (let i = 0; i < 56; i++) {
    const x = R() * N, y = R() * N, l = 10 + 30 * R(), ang = R() * 6.28, pts: [number, number][] = [];
    for (let k = 0; k <= 6; k++) { const s = (k / 6 - 0.5) * l; pts.push([x + Math.cos(ang) * s + Math.sin(k) * 2, y + Math.sin(ang) * s + Math.cos(k * 1.3) * 3]); }
    S.wrap(x - 30, y - 30, x + 30, y + 30, (dx, dy) => {
      a.fillStyle = css([60, 55, 50], 0.08 + 0.1 * R()); taper(a, pts.map(([u, v]) => [u + dx, v + dy] as [number, number]), 2.5 + 2 * R());
      r.fillStyle = grey(190, 0.6); taper(r, pts.map(([u, v]) => [u + dx, v + dy] as [number, number]), 5);
    });
  }
  for (let i = 0; i < 64; i++) {
    const x = R() * N, y = R() * N, rr = 60 + 120 * R(), v = 70 + 70 * R();
    S.wrap(x - rr, y - rr, x + rr, y + rr, (dx, dy) => spot(r, x + dx, y + dy, rr, rr * 0.7, grey(v, 0.35), grey(v, 0)));
  }
  return S.done(new THREE.Vector2(1 / 2.4, 1 / 2.4), 0.9);
}

/** acoustic ceiling tiles 0.6 m in a raised white T-bar grid, fissured surface. Tile 1.2 m. */
export function ceilingTiles(o: { seed?: number } = {}): W.WoodTex {
  const N = 512, px = N / 1.2, R = rng(o.seed ?? 31), S = new Sheet(N, N, [246, 244, 238], 150, 245), { a, h, r } = S;
  for (let i = 0; i < 1400; i++) {
    const x = R() * N, y = R() * N, l = 2 + 6 * R(), ang = R() * 6.28;
    a.strokeStyle = css([196, 192, 184], 0.12 + 0.16 * R()); a.lineWidth = 0.8 + 0.6 * R();
    a.beginPath(); a.moveTo(x, y); a.quadraticCurveTo(x + Math.cos(ang + 1) * l * 0.6, y + Math.sin(ang + 1) * l * 0.6, x + Math.cos(ang) * l, y + Math.sin(ang) * l); a.stroke();
    h.strokeStyle = grey(60, 0.5); h.lineWidth = 1.2; h.beginPath(); h.moveTo(x, y); h.lineTo(x + Math.cos(ang) * l, y + Math.sin(ang) * l); h.stroke();
  }
  for (let i = 0; i < 1200; i++) { const x = R() * N, y = R() * N; a.fillStyle = css([170, 166, 160], 0.22); a.fillRect(x, y, 1, 1); }
  const bar = 0.022 * px;
  for (const p of [0, 0.6 * px]) {
    for (const [x, y, w, hh] of [[p - bar / 2, 0, bar, N], [0, p - bar / 2, N, bar]] as const) {
      S.wrap(x, y, x + w, y + hh, (dx, dy) => {
        a.fillStyle = css([250, 250, 248]); a.fillRect(x + dx, y + dy, w, hh);
        h.fillStyle = grey(250); h.fillRect(x + dx, y + dy, w, hh);
        r.fillStyle = grey(110); r.fillRect(x + dx, y + dy, w, hh);
      });
      // the bar's shadow line on the tile edge
      S.wrap(x - 3, y - 3, x + w + 3, y + hh + 3, (dx, dy) => { a.strokeStyle = "rgba(120,114,104,0.45)"; a.lineWidth = 1.5; a.strokeRect(x + dx - 0.75, y + dy - 0.75, w + 1.5, hh + 1.5); });
    }
  }
  blurGrey(S.ch, 1.4);
  return S.done(new THREE.Vector2(1 / 1.2, 1 / 1.2), 1.2);
}

/** lacquered wood laminate (desk tops, lectern, door, shelves): painterly streaks, cathedral grain, crisp grain lines.
 *  Grain along u. Tile 1.6 x 0.8 m. */
export function laminate(o: { seed?: number; color?: RGB } = {}): W.WoodTex {
  const Wd = 1024, Ht = 512, px = Wd / 1.6, R = rng(o.seed ?? 41), base = o.color ?? [226, 172, 112];
  const S = new Sheet(Wd, Ht, base, 200, 118), { a, h, r } = S;
  const dark: RGB = mix(base, [120, 66, 30], 0.55), light: RGB = mix(base, [255, 232, 196], 0.5);
  // broad soft streaks
  for (let i = 0; i < 70; i++) {
    const y = R() * Ht, x = R() * Wd, l = (0.4 + 0.9 * R()) * px, w = 4 + 26 * R(), lt = R() < 0.4, wav = 3 + 8 * R(), ph = R() * 6;
    const pts: [number, number][] = [];
    for (let k = 0; k <= 12; k++) { const s = (k / 12) * l; pts.push([x + s, y + wav * Math.sin(s / 90 + ph)]); }
    S.wrap(x, y - w - wav, x + l, y + w + wav, (dx, dy) => { a.fillStyle = css(lt ? light : dark, lt ? 0.08 + 0.1 * R() : 0.05 + 0.08 * R()); taper(a, pts.map(([u, v]) => [u + dx, v + dy] as [number, number]), w, 0.4); });
  }
  // cathedral arches (nested parabolas opening along -u)
  for (let c = 0; c < 3; c++) {
    const cx = R() * Wd, cy = R() * Ht, sp = 7 + 5 * R(), q = 30 + 30 * R(), L = (0.35 + 0.35 * R()) * px;
    for (let k = 1; k <= 7; k++) {
      const pts: [number, number][] = [];
      for (let s = -L; s <= L * 0.25; s += 8) { const d = Math.max(0, (L * 0.25 - s)) / px; pts.push([cx + s, cy - (k * sp + q * Math.sqrt(d * 2))]); }
      for (let s = L * 0.25; s >= -L; s -= 8) { const d = Math.max(0, (L * 0.25 - s)) / px; pts.push([cx + s, cy + (k * sp + q * Math.sqrt(d * 2))]); }
      S.wrap(cx - L, cy - 200, cx + L, cy + 200, (dx, dy) => {
        a.strokeStyle = css(dark, 0.1 + 0.08 * R()); a.lineWidth = 1.4 + 1.2 * R();
        a.beginPath(); pts.forEach(([u, v], i) => (i ? a.lineTo(u + dx, v + dy) : a.moveTo(u + dx, v + dy))); a.stroke();
      });
    }
  }
  // crisp long grain lines + pores
  for (let i = 0; i < 26; i++) {
    const y = R() * Ht, ph = R() * 6, amp = 2 + 5 * R(), al = 0.1 + 0.14 * R();
    S.wrap(0, y - 10, Wd, y + 10, (dx, dy) => {
      a.strokeStyle = css(dark, al); a.lineWidth = 0.9 + 0.8 * R(); a.beginPath();
      for (let x = 0; x <= Wd; x += 16) { const yy = y + amp * Math.sin((x / Wd) * Math.PI * 2 * 2 + ph); if (x) a.lineTo(x + dx, yy + dy); else a.moveTo(x + dx, yy + dy); }
      a.stroke();
      h.strokeStyle = grey(150, 0.5); h.lineWidth = 1.2; h.beginPath();
      for (let x = 0; x <= Wd; x += 16) { const yy = y + amp * Math.sin((x / Wd) * Math.PI * 2 * 2 + ph); if (x) h.lineTo(x + dx, yy + dy); else h.moveTo(x + dx, yy + dy); }
      h.stroke();
    });
  }
  for (let i = 0; i < 2600; i++) { const x = R() * Wd, y = R() * Ht; a.fillStyle = css(dark, 0.1 + 0.1 * R()); a.fillRect(x, y, 2 + 4 * R(), 1); }
  // lacquer: smooth, a few duller handling patches
  for (let i = 0; i < 10; i++) { const x = R() * Wd, y = R() * Ht; S.wrap(x - 120, y - 80, x + 120, y + 80, (dx, dy) => spot(r, x + dx, y + dy, 80 + 60 * R(), 40 + 40 * R(), grey(160, 0.4), grey(160, 0))); }
  blurGrey(S.ch, 0.8);
  return S.done(new THREE.Vector2(1 / 1.6, 1 / 0.8), 0.35);
}

/** woven fabric for bags and the pencil case (neutral light grey: tint it with the material colour). Tile 0.1 m. */
export function fabricTex(o: { seed?: number } = {}): W.WoodTex {
  const N = 256, R = rng(o.seed ?? 51), S = new Sheet(N, N, [232, 232, 232], 128, 235), { a, h } = S, c = 8;
  for (let y = 0; y < N; y += c) for (let x = 0; x < N; x += c) {
    const over = ((x + y) / c) % 2 === 0, v = 0.96 + 0.06 * R();
    a.fillStyle = grey(232 * v * (over ? 1.02 : 0.95)); a.fillRect(x, y, c, c);
    const gr = over ? h.createLinearGradient(x, y, x + c, y) : h.createLinearGradient(x, y, x, y + c);
    gr.addColorStop(0, grey(90)); gr.addColorStop(0.5, grey(220)); gr.addColorStop(1, grey(90));
    h.fillStyle = gr; h.fillRect(x, y, c, c);
  }
  for (let i = 0; i < 40; i++) { const x = R() * N, y = R() * N; spot(a, x, y, 30, 20, grey(255, 0.06), grey(255, 0)); }
  return S.done(new THREE.Vector2(10, 10), 0.6);
}

/** cork for the notice board: granules light and dark. Tile 0.6 m. */
export function corkTex(o: { seed?: number } = {}): W.WoodTex {
  const N = 512, R = rng(o.seed ?? 61), S = new Sheet(N, N, [196, 146, 94], 150, 245), { a, h } = S;
  for (let i = 0; i < 9000; i++) {
    const x = R() * N, y = R() * N, rr = 0.6 + 1.8 * R() * R(), lt = R() < 0.5;
    a.fillStyle = css(lt ? [226, 186, 134] : [142, 96, 58], 0.35 + 0.4 * R()); a.beginPath(); a.ellipse(x, y, rr, rr * (0.6 + 0.4 * R()), R() * 3, 0, Math.PI * 2); a.fill();
    h.fillStyle = grey(lt ? 230 : 60, 0.6); h.beginPath(); h.arc(x, y, rr, 0, Math.PI * 2); h.fill();
  }
  for (let i = 0; i < 18; i++) { const x = R() * N, y = R() * N; S.wrap(x - 90, y - 90, x + 90, y + 90, (dx, dy) => spot(a, x + dx, y + dy, 50 + 40 * R(), 40 + 30 * R(), css([120, 80, 46], 0.08), css([120, 80, 46], 0))); }
  blurGrey(S.ch, 0.7);
  return S.done(new THREE.Vector2(1 / 0.6, 1 / 0.6), 1.2);
}

/** panel radiator fins: vertical channels. Tile 0.1 m. */
export function finTex(): W.WoodTex {
  const N = 128, S = new Sheet(N, N, [244, 242, 236], 128, 120), { a, h } = S, n = 4;
  for (let i = 0; i < n; i++) {
    const x0 = (i * N) / n, w = N / n;
    const ga = a.createLinearGradient(x0, 0, x0 + w, 0); ga.addColorStop(0, "rgba(150,146,138,0.45)"); ga.addColorStop(0.3, "rgba(255,255,255,0.15)"); ga.addColorStop(0.75, "rgba(255,255,255,0)"); ga.addColorStop(1, "rgba(150,146,138,0.35)");
    a.fillStyle = ga; a.fillRect(x0, 0, w, N);
    const gh = h.createLinearGradient(x0, 0, x0 + w, 0); gh.addColorStop(0, grey(30)); gh.addColorStop(0.5, grey(240)); gh.addColorStop(1, grey(30));
    h.fillStyle = gh; h.fillRect(x0, 0, w, N);
  }
  return S.done(new THREE.Vector2(10, 10), 1.5);
}

/** green chalkboard, 3.4 x 1.2 m: dusty eraser swirls, a chalk 0-5 rating scale with faces, notes, "84 x 83", and an
 *  A <-> B reciprocity sketch (5 one way, 2 back). Font-free (hand-drawn glyph polylines). */
export function chalkboardTex(o: { seed?: number; blank?: boolean } = {}): W.WoodTex {
  const Wd = 2048, Ht = 724, R = rng(o.seed ?? 71), S = new Sheet(Wd, Ht, [56, 108, 84], 128, 228), { a } = S;
  // board tone: large soft patches, then dusty eraser arcs
  for (let i = 0; i < 16; i++) {
    const lt = R() < 0.5, c: RGB = lt ? [86, 140, 112] : [40, 84, 64];
    spot(a, R() * Wd, R() * Ht, 200 + 300 * R(), 120 + 160 * R(), css(c, 0.25), css(c, 0));
  }
  for (let i = 0; i < 12; i++) {
    const y = R() * Ht, x0 = R() * Wd * 0.7, l = 300 + 700 * R(), amp = 30 + 60 * R(), ph = R() * 6;
    a.strokeStyle = css([210, 232, 218], 0.035 + 0.035 * R()); a.lineWidth = 70 + 70 * R(); a.lineCap = "round";
    a.beginPath();
    for (let s = 0; s <= l; s += 20) { const yy = y + amp * Math.sin(s / 160 + ph); if (s) a.lineTo(x0 + s, yy); else a.moveTo(x0 + s, yy); }
    a.stroke();
  }
  // ghost of old writing (half erased)
  { const g = a; g.save(); g.globalAlpha = 0.12; for (let k = 0; k < 5; k++) strokePolys(g, cursive(R, 1100 + 80 * R(), 470 + k * 52, 500, 34), 5, "rgba(230,240,232,1)"); g.restore(); }
  const L = canvas(Wd, Ht), g = L.getContext("2d", CTX)!;
  const WH: RGB = [246, 248, 238], YE: RGB = [252, 226, 110], PK: RGB = [252, 156, 168], BL: RGB = [150, 212, 252];
  const ch = (polys: Poly[], w: number, col: RGB) => chalkPolys(g, polys, w, col, R);
  const chText = (t: string, x: number, y: number, s: number, w: number, col: RGB) => {
    const q = glyphs(t, x, y, s); ch(q.polys, w, col);
    for (const [dx, dy] of q.dots) ch([circlePoly(dx, dy, w * 0.6, w * 0.6, 8)], w * 0.8, col);
    return q.width;
  };
  if (o.blank) {
    // group-project film: no rating content; a few half-legible lines of notes and a boxed outline, left to right
    for (let k = 0; k < 4; k++) ch(cursive(R, 120, 150 + k * 70, 380 + 220 * R(), 40), 6, WH);
    ch([[[100, 450], [760, 452]]], 5, YE);
    for (let k = 0; k < 3; k++) { ch([circlePoly(130, 530 + k * 60 - 12, 6, 6, 8)], 7, WH); ch(cursive(R, 160, 530 + k * 60, 300 + 200 * R(), 34), 5, WH); }
    for (let n = 0; n < 4; n++) { const x = 1060 + n * 230, y = 210; ch([[[x, y], [x + 180, y + 2], [x + 178, y + 120], [x + 1, y + 118], [x, y]]], 6, n === 0 ? YE : WH);
      if (n < 3) ch([[[x + 190, y + 60], [x + 222, y + 60]], [[x + 210, y + 48], [x + 222, y + 60], [x + 210, y + 72]]], 5, BL);
      ch(cursive(R, x + 18, y + 70, 140, 26), 4, WH); }
    ch(cursive(R, 1080, 470, 620, 40), 6, WH); ch(cursive(R, 1080, 540, 480, 36), 5, WH); ch([[[1070, 600], [1700, 596]]], 5, PK);
  } else {
  // ---- left: the 0-5 scale ----
  ch(cursive(R, 96, 118, 560, 54), 7, WH);
  ch([[[86, 150], [300, 147], [660, 151]]], 6, YE);
  const bx0 = 96, by0 = 205, bw = 142, bh = 122, gap = 26;
  for (let n = 0; n <= 5; n++) {
    const x = bx0 + n * (bw + gap), col = n === 5 ? YE : WH;
    ch([[[x, by0], [x + bw, by0 + 2], [x + bw - 2, by0 + bh], [x + 1, by0 + bh - 1], [x, by0]]], 6, col);
    chText(String(n), x + bw / 2 - 0.3 * 78, by0 + 22, 78, 9, col);
    // face under each box: frown -> grin, 5 = heart
    const cx = x + bw / 2, cy = by0 + bh + 92, rr = 44;
    if (n === 5) { ch([heartPoly(cx, cy + 4, 48)], 8, PK); continue; }
    ch([circlePoly(cx, cy, rr, rr, 30)], 6, WH);
    for (const ex of [-15, 15]) ch([circlePoly(cx + ex, cy - 10, 3, 3, 6)], 6, WH);
    const curv = [-14, -7, 0, 9, 17][n], mouth: Poly = [];
    for (let k = 0; k <= 8; k++) { const s = (k / 8 - 0.5) * 2; mouth.push([cx + s * 20, cy + 16 + curv * (1 - s * s)]); }
    if (n === 0) ch([[[cx - 18, cy + 18], [cx - 6, cy + 13], [cx + 6, cy + 19], [cx + 18, cy + 14]]], 5, WH); else ch([mouth], 6, WH);
  }
  // arrow under the faces, 0 -> 5
  const ay = by0 + bh + 175, ax0 = bx0 + 20, ax1 = bx0 + 5 * (bw + gap) + bw - 10;
  ch([[[ax0, ay], [ax1, ay - 4]], [[ax1 - 30, ay - 22], [ax1, ay - 4], [ax1 - 28, ay + 16]]], 6, BL);
  ch(cursive(R, ax0, ay + 62, 200, 30), 5, WH); ch(cursive(R, ax1 - 230, ay + 62, 220, 30), 5, WH);
  // notes + "84 x 83"
  for (let k = 0; k < 2; k++) { ch([circlePoly(110, 640 + k * 50 - 12, 5, 5, 8)], 7, WH); ch(cursive(R, 140, 640 + k * 50, 320 + 160 * R(), 34), 5, WH); }
  { const x = 760, y = 590; const w0 = chText("84", x, y, 76, 9, YE); ch([circlePoly(x + w0 / 2 - 6, y + 38, w0 * 0.68, 54, 30, -100)], 6, YE); chText("x 83", x + w0 + 20, y, 76, 9, WH); }
  // ---- right: A -> B : 5, B -> A : 2 ? ----
  const hA: [number, number] = [1330, 300], hB: [number, number] = [1790, 300], hr = 92;
  for (const [hx, hy] of [hA, hB]) {
    ch([circlePoly(hx, hy, hr, hr * 1.02, 34)], 7, WH);
    for (const ex of [-28, 28]) ch([circlePoly(hx + ex, hy - 14, 5, 5, 6)], 7, WH);
    ch([[[hx - 26, hy + 30], [hx - 8, hy + 40], [hx + 10, hy + 40], [hx + 28, hy + 28]]], 6, WH);
    // stick body
    ch([[[hx, hy + hr + 4], [hx, hy + hr + 120]], [[hx - 60, hy + hr + 50], [hx + 60, hy + hr + 50]], [[hx, hy + hr + 120], [hx - 40, hy + hr + 190]], [[hx, hy + hr + 120], [hx + 40, hy + hr + 190]]], 7, WH);
  }
  chText("A", hA[0] - 22, hA[1] - hr - 92, 66, 8, WH); chText("B", hB[0] - 22, hB[1] - hr - 92, 66, 8, WH);
  // top arrow A -> B with 5 and a heart, bottom arrow B -> A with 2 ?
  const top: Poly = [], bot: Poly = [];
  for (let k = 0; k <= 16; k++) { const t = k / 16, x = hA[0] + 110 + (hB[0] - hA[0] - 220) * t; top.push([x, hA[1] - 70 - 70 * Math.sin(Math.PI * t)]); bot.push([hB[0] - 110 - (hB[0] - hA[0] - 220) * t, hA[1] + 70 + 60 * Math.sin(Math.PI * t)]); }
  ch([top, [[top[16][0] - 34, top[16][1] - 18], top[16], [top[16][0] - 16, top[16][1] - 38]]], 7, YE);
  ch([bot, [[bot[16][0] + 34, bot[16][1] + 14], bot[16], [bot[16][0] + 18, bot[16][1] + 36]]], 7, PK);
  chText("5", 1540, 92, 72, 9, YE); ch([heartPoly(1622, 130, 26)], 6, PK);
  chText("2", 1520, 420, 72, 9, PK); chText("?", 1590, 420, 72, 9, PK);
  // a squiggly underline and a note at the bottom right
  ch(cursive(R, 1240, 640, 560, 38), 5, WH); ch([[[1230, 668], [1820, 664]]], 5, BL);
  }
  // chalk grain: punch the strokes per pixel (dry chalk skips on the board's tooth)
  const id = g.getImageData(0, 0, Wd, Ht), d = id.data;
  for (let i = 0; i < Wd * Ht; i++) { const al = d[i * 4 + 3]; if (!al) continue; const n = R(); d[i * 4 + 3] = al * (n < 0.12 ? 0.25 : 0.62 + 0.38 * n); }
  g.putImageData(id, 0, 0);
  a.drawImage(L, 0, 0);
  // the tray end gets chalk dust
  const dg = a.createLinearGradient(0, Ht - 60, 0, Ht); dg.addColorStop(0, "rgba(230,240,232,0)"); dg.addColorStop(1, "rgba(230,240,232,0.16)");
  a.fillStyle = dg; a.fillRect(0, Ht - 60, Wd, 60);
  return S.done(new THREE.Vector2(1, 1), 0.3, false);
}

/** the rating card (A4 portrait, the study's paper form): header, a table of 15 classmates (printed name bars), a 0-5
 *  box column ("how close a friend is this person?": one pen mark per row) and a narrow guess column ("what will this
 *  person give me?": a handwritten digit). hero: 1448 x 2047 px (the macro shots; the guess column is left blank for
 *  the film's pen to fill, and `done` rows are marked), else 384 px. Font-free (hand-drawn glyph polylines). */
export function ratingSheetTex(o: { seed?: number; hero?: boolean; ink?: RGB; done?: number; guesses?: boolean } = {}): W.WoodTex {
  const hero = o.hero ?? false, Wd = hero ? 1448 : 384, Ht = Math.round(Wd * 1.4137), u = Wd / 210, R = rng(o.seed ?? 81);
  const S = new Sheet(Wd, Ht, [250, 248, 242], 200, 225), { a, h } = S, ink: RGB = o.ink ?? [36, 70, 176];
  const TEAL: RGB = [78, 168, 158], DK: RGB = [58, 62, 72], CORAL: RGB = [232, 120, 92];
  const guesses = o.guesses ?? !hero;
  // paper fibre noise
  for (let i = 0; i < Wd * 2; i++) { a.fillStyle = css([200, 196, 186], 0.08 + 0.08 * R()); a.fillRect(R() * Wd, R() * Ht, 1 + R() * 2 * u / 4, 1); }
  // header: a round-head badge (the study's stick-figure mark, no institution), title and subtitle bars
  a.fillStyle = css(TEAL); rrect(a, 14 * u, 13 * u, 20 * u, 20 * u, 3 * u); a.fill();
  a.fillStyle = "rgba(255,255,255,0.9)"; a.beginPath(); a.arc(24 * u, 21 * u, 4.4 * u, 0, Math.PI * 2); a.fill();
  a.fillStyle = "rgba(255,255,255,0.9)"; rrect(a, 17 * u, 27 * u, 14 * u, 4 * u, 2 * u); a.fill();
  a.fillStyle = css(DK); rrect(a, 40 * u, 14 * u, 92 * u, 7.5 * u, 2 * u); a.fill();
  a.fillStyle = css([140, 144, 152]); rrect(a, 40 * u, 25 * u, 64 * u, 3.6 * u, 1.5 * u); a.fill();
  rrect(a, 40 * u, 31 * u, 48 * u, 3.6 * u, 1.5 * u); a.fill();
  // name field, top right, with a scribbled name
  a.fillStyle = css([140, 144, 152]); rrect(a, 140 * u, 16 * u, 14 * u, 3.4 * u, 1.5 * u); a.fill();
  a.strokeStyle = css([150, 150, 156]); a.lineWidth = Math.max(1, 0.3 * u); a.beginPath(); a.moveTo(140 * u, 30 * u); a.lineTo(196 * u, 30 * u); a.stroke();
  strokePolys(a, cursive(R, 142 * u, 28 * u, 46 * u, 4.2 * u), Math.max(1, 0.45 * u), css(ink, 0.9));
  // table: # | name | 0..5 boxes | guess
  const rows = 15, x0 = 14 * u, x1 = 196 * u, top = 44 * u, rh = 14.6 * u, cName = 26 * u, cBox = 98 * u, cGuess = 168 * u, bwid = (cGuess - 2 * u - cBox) / 6;
  a.fillStyle = css(mix(TEAL, [255, 255, 255], 0.55)); a.fillRect(x0, top, cGuess - x0, rh);
  a.fillStyle = css(mix(CORAL, [255, 255, 255], 0.62)); a.fillRect(cGuess, top, x1 - cGuess, rh);
  for (let n = 0; n <= 5; n++) penText(a, String(n), cBox + n * bwid + bwid / 2 - 0.3 * 6 * u, top + 4 * u, 6.4 * u, Math.max(1, 0.6 * u), css(DK));
  penText(a, "?", cGuess + (x1 - cGuess) / 2 - 0.3 * 6.4 * u, top + 4 * u, 6.4 * u, Math.max(1, 0.6 * u), css(DK));
  a.fillStyle = css(DK); rrect(a, cName, top + 5 * u, 30 * u, 4 * u, 1.5 * u); a.fill();
  const done = o.done ?? rows;
  for (let i = 0; i < rows; i++) {
    const y = top + (i + 1) * rh;
    if (i % 2) { a.fillStyle = "rgba(78,168,158,0.08)"; a.fillRect(x0, y, x1 - x0, rh); }
    penText(a, String(i + 1).padStart(2, "0"), x0 + 1.6 * u, y + 4.4 * u, 5.4 * u, Math.max(1, 0.5 * u), css([110, 114, 122]));
    a.fillStyle = css([92, 96, 106]); rrect(a, cName, y + 5 * u, (30 + 36 * R()) * u, 4.4 * u, 1.8 * u); a.fill();
    for (let n = 0; n <= 5; n++) {
      const bx = cBox + n * bwid + bwid / 2 - 3.3 * u, by = y + rh / 2 - 3.3 * u;
      a.strokeStyle = css([150, 154, 162]); a.lineWidth = Math.max(1, 0.35 * u); a.strokeRect(bx, by, 6.6 * u, 6.6 * u);
    }
    // the guess field: a short dashed underline
    a.strokeStyle = css([176, 150, 140]); a.lineWidth = Math.max(1, 0.3 * u); a.setLineDash([1.6 * u, 1.2 * u]);
    a.beginPath(); a.moveTo(cGuess + 6 * u, y + rh - 3.4 * u); a.lineTo(x1 - 6 * u, y + rh - 3.4 * u); a.stroke(); a.setLineDash([]);
    if (i >= done) continue;
    // the mark: mostly low numbers (most classmates are not close friends), a few 4-5
    const rv = R(), pick = rv < 0.18 ? 0 : rv < 0.42 ? 1 : rv < 0.64 ? 2 : rv < 0.8 ? 3 : rv < 0.92 ? 4 : 5;
    const mx = cBox + pick * bwid + bwid / 2, my = y + rh / 2, kind = R();
    a.strokeStyle = css(ink, 0.92); a.lineWidth = Math.max(1.2, 0.6 * u); a.lineCap = "round";
    if (kind < 0.55) { // tick
      a.beginPath(); a.moveTo(mx - 3.2 * u, my); a.lineTo(mx - 0.8 * u, my + 3 * u); a.lineTo(mx + 4.5 * u, my - 4.4 * u); a.stroke();
    } else if (kind < 0.85) { // cross
      a.beginPath(); a.moveTo(mx - 3 * u, my - 3 * u); a.lineTo(mx + 3 * u, my + 3 * u); a.moveTo(mx + 3 * u, my - 3 * u); a.lineTo(mx - 3 * u, my + 3 * u); a.stroke();
    } else { // filled in
      a.fillStyle = css(ink, 0.85); a.fillRect(mx - 2.8 * u, my - 2.8 * u, 5.6 * u, 5.6 * u);
    }
    if (R() < 0.12) { // a changed mind: scribbled out next door
      const sx = cBox + Math.min(5, pick + 1) * bwid + bwid / 2;
      a.beginPath(); for (let k = 0; k < 6; k++) { a.lineTo(sx - 3.3 * u + (k % 2) * 6.6 * u, my - 3 * u + k * 1.2 * u); } a.stroke();
    }
    if (pick === 5 && R() < 0.7) { a.strokeStyle = css(ink, 0.8); a.lineWidth = Math.max(1, 0.45 * u); a.beginPath(); a.ellipse(mx, my, 5.6 * u, 5.2 * u, 0.2, 0, Math.PI * 2); a.stroke(); }
    // the guess: people guess high (they expect to be liked back): mostly 3-5, written in the same pen
    if (guesses && pick >= 2) {
      const g = pick >= 4 ? 4 + (R() < 0.6 ? 1 : 0) : 3 + Math.floor(R() * 2.2);
      penText(a, String(g), cGuess + (x1 - cGuess) / 2 - 2 * u + (R() - 0.5) * 2 * u, y + 2.6 * u, 8.4 * u, Math.max(1.2, 0.62 * u), css(ink, 0.9));
    }
  }
  a.strokeStyle = css([180, 184, 190]); a.lineWidth = Math.max(1, 0.3 * u);
  for (let i = 0; i <= rows + 1; i++) { a.beginPath(); a.moveTo(x0, top + i * rh); a.lineTo(x1, top + i * rh); a.stroke(); }
  for (const x of [x0, cName - 2 * u, cBox, cGuess, x1]) { a.beginPath(); a.moveTo(x, top); a.lineTo(x, top + (rows + 1) * rh); a.stroke(); }
  a.strokeStyle = css(mix(CORAL, [255, 255, 255], 0.3)); a.lineWidth = Math.max(1, 0.5 * u); a.beginPath(); a.moveTo(cGuess, top); a.lineTo(cGuess, top + (rows + 1) * rh); a.stroke();
  // footer: "1 / 6" page marker and a doodle in the margin
  const fy = top + (rows + 1) * rh + 8 * u;
  a.fillStyle = css([150, 154, 162]); rrect(a, x0, fy, 40 * u, 3.4 * u, 1.4 * u); a.fill();
  penText(a, "1-6", x1 - 18 * u, fy - 1 * u, 5 * u, Math.max(1, 0.45 * u), css([140, 144, 152]));
  if (R() < 0.6) { a.strokeStyle = css(ink, 0.7); a.lineWidth = Math.max(1, 0.45 * u); a.beginPath(); a.arc(x0 + 60 * u, fy + 10 * u, 4 * u, 0, Math.PI * 2); a.stroke(); }
  // a soft fold crease at a third (light ridge + shadow) and handling smudges
  const cy = Ht * (0.36 + 0.04 * R());
  const cg = a.createLinearGradient(0, cy - 3 * u, 0, cy + 3 * u); cg.addColorStop(0, "rgba(255,255,255,0)"); cg.addColorStop(0.45, "rgba(255,255,255,0.5)"); cg.addColorStop(0.55, "rgba(120,110,96,0.16)"); cg.addColorStop(1, "rgba(120,110,96,0)");
  a.fillStyle = cg; a.fillRect(0, cy - 3 * u, Wd, 6 * u);
  h.fillStyle = grey(235); h.fillRect(0, cy - 1.2 * u, Wd, 2.4 * u);
  for (let i = 0; i < 3; i++) spot(a, R() * Wd, R() * Ht, 20 * u, 14 * u, "rgba(120,110,100,0.05)", "rgba(120,110,100,0)");
  blurGrey(S.ch, hero ? 4 : 1.2, false);
  return S.done(new THREE.Vector2(1, 1), hero ? 0.5 : 0.3, false);
}

/** printed matter atlas, 4 x 2 cells of 512 px: 0 event flyer, 1 timetable, 2 notice, 3 sticky note, 4 network
 *  poster, 5 rating histogram poster, 6 calendar, 7 landscape poster. Use cellUV() on a plane. */
export function printAtlas(o: { seed?: number } = {}): THREE.CanvasTexture {
  const C = 512, c = canvas(4 * C, 2 * C), g = c.getContext("2d", CTX)!, R = rng(o.seed ?? 91);
  const TEAL: RGB = [70, 168, 156], CORAL: RGB = [238, 112, 80], MUST: RGB = [242, 190, 64], NAVY: RGB = [52, 72, 130], DK: RGB = [56, 60, 70];
  const cell = (i: number, f: (x: number, y: number) => void) => { g.save(); const x = (i % 4) * C, y = Math.floor(i / 4) * C; g.beginPath(); g.rect(x, y, C, C); g.clip(); f(x, y); g.restore(); };
  const paper = (x: number, y: number, col: RGB = [250, 248, 242]) => { g.fillStyle = css(col); g.fillRect(x, y, C, C); };
  const bar = (x: number, y: number, w: number, h: number, col: RGB) => { g.fillStyle = css(col); rrect(g, x, y, w, h, h / 2); g.fill(); };
  const lines = (x: number, y: number, w: number, n: number, sp: number, col: RGB = [150, 154, 162]) => { for (let k = 0; k < n; k++) bar(x, y + k * sp, w * (0.6 + 0.4 * R()), sp * 0.32, col); };
  cell(0, (x, y) => { paper(x, y, [255, 246, 226]); g.fillStyle = css(CORAL); g.beginPath(); g.arc(x + 330, y + 200, 150, 0, Math.PI * 2); g.fill();
    g.fillStyle = css(MUST); g.beginPath(); g.arc(x + 170, y + 330, 90, 0, Math.PI * 2); g.fill(); g.fillStyle = css(TEAL); g.fillRect(x + 40, y + 40, 200, 26);
    bar(x + 40, y + 90, 260, 40, DK); lines(x + 40, y + 430, 400, 2, 30); });
  cell(1, (x, y) => { paper(x, y); bar(x + 30, y + 30, 300, 34, NAVY);
    for (let r = 0; r < 6; r++) for (let k = 0; k < 5; k++) { const col = [TEAL, CORAL, MUST, [180, 186, 196] as RGB][Math.floor(R() * 4)]; if (R() < 0.35) continue; g.fillStyle = css(col, 0.75); g.fillRect(x + 40 + k * 90, y + 100 + r * 66, 82, 58); }
    g.strokeStyle = css([170, 174, 180]); g.lineWidth = 2; for (let k = 0; k <= 5; k++) { g.beginPath(); g.moveTo(x + 36 + k * 90, y + 96); g.lineTo(x + 36 + k * 90, y + 496); g.stroke(); } });
  cell(2, (x, y) => { paper(x, y); g.fillStyle = css(TEAL); g.fillRect(x, y, C, 90); bar(x + 40, y + 28, 280, 34, [255, 255, 255]); lines(x + 40, y + 130, 430, 9, 38); bar(x + 40, y + 470, 160, 20, CORAL); });
  cell(3, (x, y) => { paper(x, y, [255, 230, 120]); g.strokeStyle = css(NAVY, 0.85); for (let k = 0; k < 6; k++) strokePolys(g, cursive(R, x + 50, y + 110 + k * 66, 380, 26), 5, css(NAVY, 0.85)); });
  cell(4, (x, y) => { paper(x, y); bar(x + 40, y + 36, 300, 36, DK);
    const pts: [number, number][] = []; for (let k = 0; k < 13; k++) pts.push([x + 70 + R() * 370, y + 120 + R() * 340]);
    for (let k = 0; k < 22; k++) { const p = pts[Math.floor(R() * 13)], q = pts[Math.floor(R() * 13)]; g.strokeStyle = css(k < 6 ? TEAL : [170, 174, 182]); g.lineWidth = k < 6 ? 6 : 3; g.beginPath(); g.moveTo(p[0], p[1]); g.lineTo(q[0], q[1]); g.stroke(); }
    pts.forEach((p, k) => { g.fillStyle = css(k % 4 === 0 ? CORAL : k % 3 === 0 ? MUST : TEAL); g.beginPath(); g.arc(p[0], p[1], 14, 0, Math.PI * 2); g.fill(); g.strokeStyle = "#fff"; g.lineWidth = 4; g.stroke(); }); });
  cell(5, (x, y) => { paper(x, y); bar(x + 40, y + 36, 260, 36, NAVY);
    const hs = [0.55, 0.9, 0.75, 0.5, 0.3, 0.16]; hs.forEach((v, k) => { g.fillStyle = css(k === 5 ? CORAL : TEAL); g.fillRect(x + 60 + k * 70, y + 440 - v * 300, 54, v * 300); penText(g, String(k), x + 76 + k * 70, y + 452, 30, 4, css(DK)); });
    g.fillStyle = css(DK); g.fillRect(x + 50, y + 440, 420, 3); });
  cell(6, (x, y) => { paper(x, y); g.fillStyle = css(CORAL); g.fillRect(x, y, C, 80); penText(g, "11", x + 220, y + 20, 44, 6, "#fff");
    for (let r = 0; r < 5; r++) for (let k = 0; k < 7; k++) { const n = r * 7 + k + 1; if (n > 30) continue; g.strokeStyle = css([200, 204, 210]); g.lineWidth = 2; g.strokeRect(x + 26 + k * 66, y + 100 + r * 78, 62, 74);
      penText(g, String(n), x + 32 + k * 66, y + 106 + r * 78, 20, 3, css(n === 9 ? CORAL : DK)); if (n === 9) { g.strokeStyle = css(CORAL); g.lineWidth = 4; g.beginPath(); g.arc(x + 57 + k * 66, y + 140 + r * 78, 26, 0, Math.PI * 2); g.stroke(); } } });
  cell(7, (x, y) => { const sky = g.createLinearGradient(0, y, 0, y + C); sky.addColorStop(0, "#7cc4ee"); sky.addColorStop(1, "#f8e2b8"); g.fillStyle = sky; g.fillRect(x, y, C, C);
    g.fillStyle = "#ffd36a"; g.beginPath(); g.arc(x + 360, y + 170, 60, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#5aa088"; g.beginPath(); g.moveTo(x, y + 420); g.lineTo(x + 170, y + 230); g.lineTo(x + 330, y + 400); g.lineTo(x + 420, y + 300); g.lineTo(x + C, y + 380); g.lineTo(x + C, y + C); g.lineTo(x, y + C); g.fill();
    g.fillStyle = "#3f7f6c"; g.beginPath(); g.moveTo(x, y + 470); g.lineTo(x + 250, y + 400); g.lineTo(x + C, y + 470); g.lineTo(x + C, y + C); g.lineTo(x, y + C); g.fill();
    g.fillStyle = "rgba(255,255,255,0.9)"; g.fillRect(x + 40, y + 40, 220, 30); });
  // thin white borders (printed margins) on the posters
  for (let i = 0; i < 8; i++) { const x = (i % 4) * C, y = Math.floor(i / 4) * C; g.strokeStyle = i === 3 ? "rgba(0,0,0,0)" : "rgba(255,255,255,0.95)"; g.lineWidth = 16; g.strokeRect(x + 8, y + 8, C - 16, C - 16); }
  return ctex(c, true, false);
}

/** wall clock face: ticks, hand-drawn numerals, red dot brand. */
export function clockFaceTex(): THREE.CanvasTexture {
  const N = 512, c = canvas(N, N), g = c.getContext("2d", CTX)!, m = N / 2;
  const gr = g.createRadialGradient(m - 40, m - 60, 10, m, m, m); gr.addColorStop(0, "#ffffff"); gr.addColorStop(0.8, "#f6f4ee"); gr.addColorStop(1, "#dcd8cf");
  g.fillStyle = gr; g.fillRect(0, 0, N, N);
  g.strokeStyle = "#2e3138"; g.lineCap = "round";
  for (let i = 0; i < 60; i++) {
    const a = (i / 60) * Math.PI * 2, r0 = i % 5 ? 222 : 200, r1 = 236;
    g.lineWidth = i % 5 ? 3 : 9; g.beginPath(); g.moveTo(m + Math.sin(a) * r0, m - Math.cos(a) * r0); g.lineTo(m + Math.sin(a) * r1, m - Math.cos(a) * r1); g.stroke();
  }
  for (let hNum = 1; hNum <= 12; hNum++) {
    const a = (hNum / 12) * Math.PI * 2, t = String(hNum), s = 44, w = glyphs(t, 0, 0, s).width - 0.22 * s;
    penText(g, t, m + Math.sin(a) * 160 - w / 2, m - Math.cos(a) * 160 - s / 2, s, 7, "#2e3138");
  }
  g.fillStyle = "#e0523a"; g.beginPath(); g.arc(m, m + 80, 10, 0, Math.PI * 2); g.fill();
  return ctex(c, true, false);
}

// ---------------- exterior (the campus outside the windows; unlit painted look like the reference backdrops) ----------------
/** a toon tree crown in the backdrop style: shadow lobes, body, sunlit dabs (light from the upper left) */
const paintTree = (g: G, x: number, y: number, s: number, hue: number, trunk = true) => {
  const dark = hue < 0.5 ? "#3d8450" : "#4a8a3e", body = hue < 0.5 ? "#55a85c" : "#6cb04e", lit = hue < 0.5 ? "#82cc72" : "#a2d468";
  if (trunk) { g.fillStyle = "#6e4e34"; g.fillRect(x - s * 0.07, y, s * 0.14, s * 0.95); }
  const lobes: [number, number, number][] = [[0, -0.2, 0.62], [-0.48, 0.1, 0.45], [0.48, 0.08, 0.48], [-0.22, -0.62, 0.45], [0.26, -0.56, 0.42], [0, 0.22, 0.42]];
  g.fillStyle = dark; for (const [dx, dy, k] of lobes) { g.beginPath(); g.arc(x + dx * s + 4, y + dy * s + 6, k * s, 0, Math.PI * 2); g.fill(); }
  g.fillStyle = body; for (const [dx, dy, k] of lobes) { g.beginPath(); g.arc(x + dx * s - k * s * 0.1, y + dy * s - k * s * 0.12, k * s * 0.84, 0, Math.PI * 2); g.fill(); }
  g.fillStyle = lit; for (const [dx, dy, k] of lobes) { if (dy > 0.15) continue; g.beginPath(); g.arc(x + dx * s - k * s * 0.3, y + dy * s - k * s * 0.32, k * s * 0.42, 0, Math.PI * 2); g.fill(); }
};
/** the sky backdrop wrapped round the inside of a cylinder (u = azimuth, seamless; v = up; 45 m tall, the horizon
 *  1 m above its foot): blue gradient, cumulus clouds, pale distant campus blocks and a hazy far tree line. */
export function skyTex(o: { seed?: number } = {}): THREE.CanvasTexture {
  const Wd = 2048, Ht = 1024, c = canvas(Wd, Ht), g = c.getContext("2d", CTX)!, R = rng(o.seed ?? 101), pxm = Ht / 45, GL = Ht - pxm;
  const sky = g.createLinearGradient(0, 0, 0, GL); sky.addColorStop(0, "#4f9fe6"); sky.addColorStop(0.55, "#8cc6f2"); sky.addColorStop(0.9, "#cde8f8"); sky.addColorStop(1, "#e8f5fb");
  g.fillStyle = sky; g.fillRect(0, 0, Wd, Ht);
  const wrap = (x: number, f: (x: number) => void) => { for (const dx of [-Wd, 0, Wd]) f(x + dx); };
  const cloud = (x: number, y: number, s: number) => {
    const lobes: [number, number, number][] = [[0, 0, 1], [-0.9, 0.2, 0.7], [0.9, 0.25, 0.75], [-0.4, -0.45, 0.7], [0.45, -0.4, 0.65], [1.6, 0.35, 0.5], [-1.6, 0.35, 0.45]];
    g.fillStyle = "rgba(190,218,240,1)"; for (const [dx, dy, k] of lobes) { g.beginPath(); g.ellipse(x + dx * s, y + dy * s * 0.6 + 8, k * s, k * s * 0.62, 0, 0, Math.PI * 2); g.fill(); }
    g.fillStyle = "#ffffff"; for (const [dx, dy, k] of lobes) { g.beginPath(); g.ellipse(x + dx * s - 4, y + dy * s * 0.6, k * s * 0.94, k * s * 0.58, 0, 0, Math.PI * 2); g.fill(); }
  };
  for (let i = 0; i < 16; i++) { const x = R() * Wd, y = 90 + R() * 520, s = 26 + 46 * R() * (1 - y / 900); wrap(x, (xx) => cloud(xx, y, s)); }
  // distant campus blocks (pale, hazy) and a far tree line along the horizon
  for (let i = 0; i < 9; i++) {
    const x = R() * Wd, w = 60 + 120 * R(), hgt = (6 + 10 * R()) * pxm;
    wrap(x, (xx) => { g.fillStyle = "#c9d9e2"; g.fillRect(xx, GL - hgt, w, hgt); g.fillStyle = "rgba(255,255,255,0.35)"; for (let y = GL - hgt + 10; y < GL - 12; y += 16) g.fillRect(xx + 6, y, w - 12, 5); });
  }
  g.fillStyle = "#a9d4a4"; for (let x = -40; x < Wd + 40; x += 30 + 26 * R()) { const r = (2.4 + 2.4 * R()) * pxm, y = GL - (3 + 3 * R()) * pxm; wrap(x, (xx) => { g.beginPath(); g.arc(xx, y, r, 0, Math.PI * 2); g.fill(); }); }
  g.fillStyle = "#bfe0b6"; for (let x = -40; x < Wd + 40; x += 50 + 40 * R()) { const r = (1.2 + 1.2 * R()) * pxm, y = GL - (6 + 3 * R()) * pxm; wrap(x, (xx) => { g.beginPath(); g.arc(xx, y, r, 0, Math.PI * 2); g.fill(); }); }
  g.fillStyle = "#a9d4a4"; g.fillRect(0, GL - 3 * pxm, Wd, Ht);
  g.fillStyle = "#8fc77e"; g.fillRect(0, GL, Wd, Ht - GL);
  return ctex(c, true, true);
}
/** the teaching block across the lawn, its long facade (36 x 11 m, 2048 x 640): brick with courses, a cream cornice and
 *  string course, three floors of framed windows (sky reflection, blinds), a glazed entrance with a blue canopy. */
export function facadeTex(o: { seed?: number } = {}): THREE.CanvasTexture {
  const Wd = 2048, Ht = 640, c = canvas(Wd, Ht), g = c.getContext("2d", CTX)!, R = rng(o.seed ?? 103), pxm = Wd / 36;
  g.fillStyle = "#d99c74"; g.fillRect(0, 0, Wd, Ht);
  for (let y = 0; y < Ht; y += 0.075 * pxm) { g.fillStyle = "rgba(0,0,0,0.07)"; g.fillRect(0, y, Wd, 1.2); }
  for (let i = 0; i < 1400; i++) { g.fillStyle = R() < 0.5 ? "rgba(255,220,190,0.10)" : "rgba(120,60,30,0.08)"; g.fillRect(R() * Wd, R() * Ht, 6 + 8 * R(), 3); }
  g.fillStyle = "#f1e6d2"; g.fillRect(0, 0, Wd, 0.55 * pxm); g.fillRect(0, 0.62 * pxm, Wd, 0.12 * pxm); // cornice
  g.fillStyle = "#e8dcc6"; g.fillRect(0, Ht - 0.5 * pxm, Wd, 0.5 * pxm);                          // plinth
  const floors = [[1.2, 2.2], [4.6, 2.0], [8.0, 2.0]] as const, bays = 14, bw = Wd / bays;          // window bottoms (m above grade), heights
  for (const [y0, wh] of floors) for (let b = 0; b < bays; b++) {
    if (y0 < 2 && (b === 6 || b === 7)) continue; // the entrance
    const wx = b * bw + bw * 0.2, ww = bw * 0.6, wy = Ht - (y0 + wh) * pxm, hh = wh * pxm;
    g.fillStyle = "#f4ecdc"; g.fillRect(wx - 5, wy - 5, ww + 10, hh + 10);
    const gl = g.createLinearGradient(wx, wy, wx + ww, wy + hh); gl.addColorStop(0, "#9fcbe6"); gl.addColorStop(1, "#5d8fb5");
    g.fillStyle = gl; g.fillRect(wx, wy, ww, hh);
    if (R() < 0.6) { g.fillStyle = "rgba(245,242,232,0.85)"; const bl = hh * (0.2 + 0.5 * R()); g.fillRect(wx, wy, ww, bl); g.fillStyle = "rgba(0,0,0,0.08)"; for (let y = wy + 4; y < wy + bl; y += 5) g.fillRect(wx, y, ww, 1); }
    g.fillStyle = "rgba(255,255,255,0.45)"; g.beginPath(); g.moveTo(wx, wy + hh * 0.6); g.lineTo(wx + ww * 0.5, wy); g.lineTo(wx + ww * 0.72, wy); g.lineTo(wx, wy + hh * 0.9); g.fill();
    g.fillStyle = "#f4ecdc"; g.fillRect(wx + ww / 2 - 2, wy, 4, hh); g.fillRect(wx - 8, wy + hh + 4, ww + 16, 7);
  }
  // entrance: glazed doors, canopy
  const ex = 6 * bw, ew = 2 * bw;
  g.fillStyle = "#2c3a4c"; g.fillRect(ex + 30, Ht - 3.0 * pxm, ew - 60, 2.5 * pxm);
  g.fillStyle = "#7fb0d2"; for (let k = 0; k < 4; k++) g.fillRect(ex + 38 + k * (ew - 76) / 4, Ht - 2.9 * pxm, (ew - 76) / 4 - 8, 2.35 * pxm);
  g.fillStyle = "#3e7fbf"; g.fillRect(ex + 10, Ht - 3.35 * pxm, ew - 20, 0.3 * pxm);
  g.fillStyle = "rgba(0,0,0,0.18)"; g.fillRect(ex + 10, Ht - 3.05 * pxm, ew - 20, 0.12 * pxm);
  return ctex(c, true, false);
}
/** mown lawn, unlit tile 3 m (512 px): blade flecks and soft tonal patches */
export function grassTex(o: { seed?: number } = {}): THREE.CanvasTexture {
  const N = 512, c = canvas(N, N), g = c.getContext("2d", CTX)!, R = rng(o.seed ?? 105);
  g.fillStyle = "#86c76e"; g.fillRect(0, 0, N, N);
  for (let i = 0; i < 40; i++) { const x = R() * N, y = R() * N, lt = R() < 0.5; for (const dx of [-N, 0, N]) for (const dy of [-N, 0, N]) spot(g, x + dx, y + dy, 50 + 70 * R(), 40 + 50 * R(), lt ? "rgba(190,230,150,0.16)" : "rgba(60,120,60,0.12)", "rgba(0,0,0,0)"); }
  for (let i = 0; i < 9000; i++) { const x = R() * N, y = R() * N, l = 2 + 3 * R(); g.strokeStyle = R() < 0.5 ? "rgba(70,140,70,0.35)" : "rgba(180,226,140,0.35)"; g.lineWidth = 1; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (R() - 0.5) * 2, y - l); g.stroke(); }
  return ctex(c, true, true);
}
/** concrete paving slabs 0.6 m, unlit tile 2.4 m (512 px) */
export function pavingTex(o: { seed?: number } = {}): THREE.CanvasTexture {
  const N = 512, c = canvas(N, N), g = c.getContext("2d", CTX)!, R = rng(o.seed ?? 107), t = N / 4;
  g.fillStyle = "#9c968c"; g.fillRect(0, 0, N, N);
  for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) {
    const v = 214 + 18 * R(); g.fillStyle = css([v, v - 4, v - 12]); g.fillRect(x * t + 2, y * t + 2, t - 4, t - 4);
    for (let i = 0; i < 120; i++) { g.fillStyle = R() < 0.5 ? "rgba(120,110,96,0.18)" : "rgba(255,255,250,0.2)"; g.fillRect(x * t + 2 + R() * (t - 6), y * t + 2 + R() * (t - 6), 2, 2); }
  }
  return ctex(c, true, true);
}
/** flat-roof membrane, light grey with lap seams every 1 m, ballast speckle and weathering. Tile 4 m (512 px). */
export function roofTex(o: { seed?: number } = {}): W.WoodTex {
  const N = 512, px = N / 4, R = rng(o.seed ?? 109), S = new Sheet(N, N, [196, 196, 192], 128, 220), { a, h } = S;
  for (let i = 0; i < 9000; i++) { const x = R() * N, y = R() * N, v = 150 + 90 * R(); a.fillStyle = css([v, v, v - 4], 0.5); a.fillRect(x, y, 1.6, 1.6); h.fillStyle = grey(R() < 0.5 ? 90 : 170, 0.5); h.fillRect(x, y, 1.6, 1.6); }
  for (let k = 0; k < 4; k++) { const y = k * px; a.fillStyle = "rgba(90,90,88,0.35)"; a.fillRect(0, y, N, 2); a.fillStyle = "rgba(255,255,255,0.35)"; a.fillRect(0, y + 2, N, 2); h.fillStyle = grey(230); h.fillRect(0, y, N, 5); }
  for (let i = 0; i < 10; i++) { const x = R() * N, y = R() * N; S.wrap(x - 90, y - 90, x + 90, y + 90, (dx, dy) => spot(a, x + dx, y + dy, 50 + 50 * R(), 30 + 40 * R(), "rgba(110,106,98,0.12)", "rgba(110,106,98,0)")); }
  blurGrey(S.ch, 0.8);
  return S.done(new THREE.Vector2(1 / 4, 1 / 4), 0.6);
}
/** facing brick for the building's outer walls: running bond, recessed light mortar, tone variation. Tile 1.8 m. */
export function brickTex(o: { seed?: number; color?: RGB } = {}): W.WoodTex {
  const N = 512, px = N / 1.8, R = rng(o.seed ?? 111), col = o.color ?? [206, 128, 92], S = new Sheet(N, N, [218, 206, 188], 70, 230), { a, h } = S;
  const bw = 0.225 * px, bh = 0.075 * px, j = 0.01 * px, rows = Math.round(N / bh);
  for (let r = 0; r < rows; r++) for (let i = -1; i < N / bw + 1; i++) {
    const x0 = i * bw + (r % 2 ? bw / 2 : 0), y0 = r * bh, tone = mul(col, 0.88 + 0.2 * R());
    S.wrap(x0, y0, x0 + bw, y0 + bh, (dx, dy) => {
      a.fillStyle = css(tone); a.fillRect(x0 + j / 2 + dx, y0 + j / 2 + dy, bw - j, bh - j);
      h.fillStyle = grey(200 + 20 * R()); h.fillRect(x0 + j / 2 + dx, y0 + j / 2 + dy, bw - j, bh - j);
    });
  }
  for (let i = 0; i < 3000; i++) { a.fillStyle = css(mul(col, 0.6), 0.15); a.fillRect(R() * N, R() * N, 1.5, 1.5); }
  blurGrey(S.ch, 0.9);
  return S.done(new THREE.Vector2(1 / 1.8, 1 / 1.8), 1.2);
}
/** a neighbouring room's window seen from outside (256 x 384): cream frame and mullion, sky-reflecting glass with a
 *  glare, a blind half down inside */
export function outsideWindowTex(): THREE.CanvasTexture {
  const Wd = 256, Ht = 384, c = canvas(Wd, Ht), g = c.getContext("2d", CTX)!;
  g.fillStyle = "#f4f1ea"; g.fillRect(0, 0, Wd, Ht);
  const gl = g.createLinearGradient(0, 0, Wd, Ht); gl.addColorStop(0, "#a8d2ec"); gl.addColorStop(1, "#5b88ad");
  g.fillStyle = gl; g.fillRect(14, 14, Wd - 28, Ht - 28);
  g.fillStyle = "rgba(246,244,236,0.9)"; g.fillRect(14, 14, Wd - 28, 120); g.fillStyle = "rgba(0,0,0,0.1)"; for (let y = 18; y < 134; y += 6) g.fillRect(14, y, Wd - 28, 1.5);
  g.fillStyle = "rgba(255,255,255,0.4)"; g.beginPath(); g.moveTo(14, 250); g.lineTo(150, 14); g.lineTo(200, 14); g.lineTo(14, 330); g.fill();
  g.fillStyle = "#f4f1ea"; g.fillRect(Wd / 2 - 5, 0, 10, Ht); g.fillRect(0, 238, Wd, 10);
  return ctex(c, true, false);
}

/** projected slide: title bar, friendship network (mutual links bold teal, one-way grey with arrowheads), legend. */
export function slideTex(o: { seed?: number } = {}): THREE.CanvasTexture {
  const Wd = 1024, Ht = 704, c = canvas(Wd, Ht), g = c.getContext("2d", CTX)!, R = rng(o.seed ?? 111);
  g.fillStyle = "#111318"; g.fillRect(0, 0, Wd, Ht); // screen border
  const x0 = 26, y0 = 26, w = Wd - 52, h = Ht - 52;
  g.fillStyle = "#fbfbf8"; g.fillRect(x0, y0, w, h);
  g.fillStyle = "#3e9e94"; g.fillRect(x0, y0, w, 84);
  g.fillStyle = "#ffffff"; rrect(g, x0 + 40, y0 + 26, 380, 32, 16); g.fill();
  const pts: [number, number][] = [];
  for (let k = 0; k < 14; k++) { const a = (k / 14) * Math.PI * 2 + R() * 0.3, r = 150 + 90 * R(); pts.push([x0 + 610 + Math.cos(a) * r * 1.3, y0 + 360 + Math.sin(a) * r]); }
  const edge = (p: [number, number], q: [number, number], mutual: boolean) => {
    g.strokeStyle = mutual ? "#3e9e94" : "#b9bdc6"; g.lineWidth = mutual ? 7 : 3.5; g.beginPath(); g.moveTo(p[0], p[1]); g.lineTo(q[0], q[1]); g.stroke();
    if (!mutual) { const a = Math.atan2(q[1] - p[1], q[0] - p[0]), ex = q[0] - Math.cos(a) * 22, ey = q[1] - Math.sin(a) * 22; g.fillStyle = "#9aa0ab"; g.beginPath(); g.moveTo(ex, ey); g.lineTo(ex - Math.cos(a - 0.4) * 18, ey - Math.sin(a - 0.4) * 18); g.lineTo(ex - Math.cos(a + 0.4) * 18, ey - Math.sin(a + 0.4) * 18); g.fill(); }
  };
  for (let k = 0; k < 24; k++) { const i = Math.floor(R() * 14), j = (i + 1 + Math.floor(R() * 6)) % 14; edge(pts[i], pts[j], k % 3 === 0); }
  pts.forEach((p, k) => { g.fillStyle = k % 5 === 0 ? "#ee7050" : "#f2c14a"; g.beginPath(); g.arc(p[0], p[1], 20, 0, Math.PI * 2); g.fill(); g.strokeStyle = "#ffffff"; g.lineWidth = 5; g.stroke(); });
  // legend on the left: bold line = both say friends, thin arrow = only one says so
  g.strokeStyle = "#3e9e94"; g.lineWidth = 7; g.beginPath(); g.moveTo(x0 + 50, y0 + 190); g.lineTo(x0 + 140, y0 + 190); g.stroke();
  g.strokeStyle = "#b9bdc6"; g.lineWidth = 3.5; g.beginPath(); g.moveTo(x0 + 50, y0 + 260); g.lineTo(x0 + 140, y0 + 260); g.stroke();
  for (const [yy, ww] of [[178, 150], [248, 170], [330, 210], [370, 180], [410, 200]] as const) { g.fillStyle = "#9aa0ab"; rrect(g, x0 + (yy > 300 ? 50 : 160), y0 + yy, ww, 22, 11); g.fill(); }
  penText(g, "34%", x0 + 50, y0 + 470, 70, 9, "#ee7050");
  return ctex(c, true, false);
}

/** big leaf (fiddle-leaf fig): u along the leaf, v across; midrib + side veins */
export function leafTex(): THREE.CanvasTexture {
  const Wd = 256, Ht = 128, c = canvas(Wd, Ht), g = c.getContext("2d", CTX)!;
  const gr = g.createLinearGradient(0, 0, Wd, 0); gr.addColorStop(0, "#3f8a4a"); gr.addColorStop(0.6, "#56a85a"); gr.addColorStop(1, "#6cbc62");
  g.fillStyle = gr; g.fillRect(0, 0, Wd, Ht);
  const eg = g.createLinearGradient(0, 0, 0, Ht); eg.addColorStop(0, "rgba(40,90,50,0.45)"); eg.addColorStop(0.25, "rgba(40,90,50,0)"); eg.addColorStop(0.75, "rgba(40,90,50,0)"); eg.addColorStop(1, "rgba(40,90,50,0.45)");
  g.fillStyle = eg; g.fillRect(0, 0, Wd, Ht);
  g.strokeStyle = "rgba(200,236,160,0.75)"; g.lineCap = "round"; g.lineWidth = 4; g.beginPath(); g.moveTo(0, Ht / 2); g.lineTo(Wd, Ht / 2); g.stroke();
  g.lineWidth = 2;
  for (let k = 1; k < 8; k++) { const x = k * 30; for (const s of [-1, 1]) { g.beginPath(); g.moveTo(x, Ht / 2); g.quadraticCurveTo(x + 16, Ht / 2 + s * 30, x + 34, Ht / 2 + s * 58); g.stroke(); } }
  return ctex(c, true, false);
}

/** light panel diffuser (prismatic grid, white frame edge) used as an emissive map */
export function diffuserTex(): THREE.CanvasTexture {
  const Wd = 256, Ht = 512, c = canvas(Wd, Ht), g = c.getContext("2d", CTX)!;
  g.fillStyle = "#ffffff"; g.fillRect(0, 0, Wd, Ht);
  g.strokeStyle = "rgba(200,206,214,0.55)"; g.lineWidth = 1;
  for (let x = 14; x < Wd - 10; x += 8) { g.beginPath(); g.moveTo(x, 12); g.lineTo(x, Ht - 12); g.stroke(); }
  for (let y = 14; y < Ht - 10; y += 8) { g.beginPath(); g.moveTo(12, y); g.lineTo(Wd - 12, y); g.stroke(); }
  const eg = g.createLinearGradient(0, 0, Wd, 0); eg.addColorStop(0, "rgba(150,156,166,0.7)"); eg.addColorStop(0.08, "rgba(150,156,166,0)"); eg.addColorStop(0.92, "rgba(150,156,166,0)"); eg.addColorStop(1, "rgba(150,156,166,0.7)");
  g.fillStyle = eg; g.fillRect(0, 0, Wd, Ht);
  return ctex(c, true, false);
}

/** green exit sign: running stick figure, door, arrow */
export function exitSignTex(): THREE.CanvasTexture {
  const Wd = 256, Ht = 96, c = canvas(Wd, Ht), g = c.getContext("2d", CTX)!;
  g.fillStyle = "#1fa463"; g.fillRect(0, 0, Wd, Ht);
  g.strokeStyle = "#ffffff"; g.fillStyle = "#ffffff"; g.lineCap = "round"; g.lineJoin = "round"; g.lineWidth = 9;
  g.strokeRect(24, 14, 48, 70);
  g.beginPath(); g.arc(112, 24, 9, 0, Math.PI * 2); g.fill();
  g.beginPath(); g.moveTo(108, 38); g.lineTo(100, 62); g.lineTo(84, 82); g.moveTo(100, 62); g.lineTo(118, 70); g.lineTo(122, 86); g.moveTo(106, 44); g.lineTo(88, 50); g.moveTo(106, 44); g.lineTo(126, 54); g.stroke();
  g.beginPath(); g.moveTo(150, 48); g.lineTo(220, 48); g.moveTo(196, 26); g.lineTo(222, 48); g.lineTo(196, 70); g.stroke();
  return ctex(c, true, false);
}

/** slotted grille (ceiling vents, AC outlet, speaker grilles) as albedo + bump. Tile = one grille (1 x 1 UV). */
export function grilleTex(o: { slots?: number; dots?: boolean; base?: RGB } = {}): W.WoodTex {
  const N = 256, base = o.base ?? [236, 236, 232], S = new Sheet(N, N, base, 220, 140), { a, h } = S;
  if (o.dots) {
    for (let y = 8; y < N; y += 10) for (let x = 8; x < N; x += 10) { a.fillStyle = css(mul(base, 0.35)); a.beginPath(); a.arc(x, y, 3, 0, Math.PI * 2); a.fill(); h.fillStyle = grey(30); h.beginPath(); h.arc(x, y, 3, 0, Math.PI * 2); h.fill(); }
  } else {
    const n = o.slots ?? 10;
    for (let k = 0; k < n; k++) { const y = 20 + (k * (N - 40)) / n; a.fillStyle = css(mul(base, 0.32)); a.fillRect(18, y, N - 36, ((N - 40) / n) * 0.5); h.fillStyle = grey(30); h.fillRect(18, y, N - 36, ((N - 40) / n) * 0.5); }
    a.strokeStyle = css(mul(base, 0.8)); a.lineWidth = 6; a.strokeRect(6, 6, N - 12, N - 12);
  }
  blurGrey(S.ch, 1, false);
  return S.done(new THREE.Vector2(1, 1), 1.0, false);
}

/** painted steel locker doors, `n` in a row (cells of 256 x 1024 px, one 0.36 x 1.44 m door each, u across the run):
 *  pressed border panel, louvre vents top and bottom, a riveted number plate, the handle recess, stickers on some,
 *  chipped edges and scratches through the paint, dents. Drawn in colour (no tint needed). */
export function lockerTex(o: { seed?: number; color?: RGB; first?: number; n?: number } = {}): W.WoodTex {
  const C = 256, Ht = 1024, n = o.n ?? 6, Wd = C * n, R = rng(o.seed ?? 121), col = o.color ?? [236, 116, 86];
  const S = new Sheet(Wd, Ht, col, 150, 120), { a, h, r } = S;
  const STK: RGB[] = [[252, 214, 74], [86, 170, 236], [250, 250, 244], [92, 196, 128], [180, 120, 220]];
  for (let i = 0; i < n; i++) {
    const x0 = i * C, tone = mul(col, 0.96 + 0.07 * R()), m = 16;
    a.fillStyle = css(tone); a.fillRect(x0, 0, C, Ht);
    // pressed panel: raised inner field with a lit top/left and shaded bottom/right bevel
    h.fillStyle = grey(110); h.fillRect(x0, 0, C, Ht);
    h.fillStyle = grey(200); rrect(h, x0 + m, m, C - 2 * m, Ht - 2 * m, 12); h.fill();
    a.strokeStyle = css(mix(tone, [255, 240, 220], 0.35), 0.8); a.lineWidth = 3; rrect(a, x0 + m, m, C - 2 * m, Ht - 2 * m, 12); a.stroke();
    a.strokeStyle = css(mul(tone, 0.62), 0.7); a.lineWidth = 3; a.beginPath(); a.moveTo(x0 + C - m, m + 12); a.lineTo(x0 + C - m, Ht - m); a.lineTo(x0 + m + 12, Ht - m); a.stroke();
    // a soft vertical sheen down the field
    const sg = a.createLinearGradient(x0, 0, x0 + C, 0); sg.addColorStop(0, "rgba(255,240,225,0)"); sg.addColorStop(0.3, "rgba(255,240,225,0.10)"); sg.addColorStop(0.55, "rgba(255,240,225,0)"); sg.addColorStop(1, "rgba(60,20,10,0.08)");
    a.fillStyle = sg; a.fillRect(x0 + m, m, C - 2 * m, Ht - 2 * m);
    // louvres (pressed slots: dark opening with a lit lip under it)
    for (const yb of [64, Ht - 152]) for (let k = 0; k < 6; k++) {
      const y = yb + k * 15, lx = x0 + 54, lw = C - 108;
      a.fillStyle = css(mul(tone, 0.25)); rrect(a, lx, y, lw, 7, 3.5); a.fill();
      a.fillStyle = css(mix(tone, [255, 244, 228], 0.45), 0.9); rrect(a, lx, y + 7, lw, 3, 1.5); a.fill();
      h.fillStyle = grey(20); rrect(h, lx, y, lw, 7, 3.5); h.fill();
      h.fillStyle = grey(255); rrect(h, lx, y + 7, lw, 4, 2); h.fill();
    }
    // riveted number plate
    const pw = 96, ph = 46, px = x0 + C / 2 - pw / 2, py = 186;
    a.fillStyle = css([226, 228, 232]); rrect(a, px, py, pw, ph, 7); a.fill();
    a.strokeStyle = css([140, 144, 150]); a.lineWidth = 2.5; rrect(a, px, py, pw, ph, 7); a.stroke();
    h.fillStyle = grey(250); rrect(h, px, py, pw, ph, 7); h.fill();
    r.fillStyle = grey(60); rrect(r, px, py, pw, ph, 7); r.fill();
    for (const rx of [px + 10, px + pw - 10]) { a.fillStyle = css([118, 122, 128]); a.beginPath(); a.arc(rx, py + ph / 2, 4, 0, Math.PI * 2); a.fill(); }
    const num = String((o.first ?? 31) + i), nw = glyphs(num, 0, 0, 30).width - 0.22 * 30;
    penText(a, num, px + pw / 2 - nw / 2, py + 8, 30, 5, css([36, 40, 48]));
    // handle recess (right, mid height) and the key/lock plate above it
    const hx = x0 + C - 66, hy = Ht * 0.46;
    a.fillStyle = css(mul(tone, 0.45)); rrect(a, hx, hy, 32, 128, 14); a.fill();
    a.fillStyle = css(mix(tone, [255, 244, 228], 0.4), 0.8); rrect(a, hx + 2, hy + 118, 28, 6, 3); a.fill();
    h.fillStyle = grey(50); rrect(h, hx, hy, 32, 128, 14); h.fill();
    // a band sticker or a star on a few doors
    const ns = R() < 0.6 ? 0 : 1;
    for (let s = 0; s < ns; s++) {
      const sx = x0 + 60 + R() * (C - 130), sy = 300 + R() * 520, kind: number = R() < 0.7 ? 2 : 1, sc = STK[Math.floor(R() * STK.length)], rot = (R() - 0.5) * 0.6;
      a.save(); a.translate(sx, sy); a.rotate(rot);
      a.fillStyle = "rgba(255,255,255,0.95)"; // die-cut white margin
      if (kind === 0) {
        a.beginPath(); a.arc(0, 0, 30, 0, Math.PI * 2); a.fill(); a.fillStyle = css([252, 214, 74]); a.beginPath(); a.arc(0, 0, 25, 0, Math.PI * 2); a.fill();
        a.fillStyle = css([40, 36, 30]); for (const ex of [-9, 9]) { a.beginPath(); a.arc(ex, -6, 3.5, 0, Math.PI * 2); a.fill(); }
        a.strokeStyle = css([40, 36, 30]); a.lineWidth = 3.5; a.beginPath(); a.arc(0, 2, 13, 0.25 * Math.PI, 0.75 * Math.PI); a.stroke();
      } else if (kind === 1) {
        const star = (rr: number) => { a.beginPath(); for (let q = 0; q < 10; q++) { const an = -Math.PI / 2 + (q * Math.PI) / 5, rq = q % 2 ? rr * 0.45 : rr; a.lineTo(Math.cos(an) * rq, Math.sin(an) * rq); } a.closePath(); a.fill(); };
        star(34); a.fillStyle = css(sc); star(27);
      } else if (kind === 2) {
        rrect(a, -44, -18, 88, 36, 8); a.fill(); a.fillStyle = css(sc); rrect(a, -40, -14, 80, 28, 6); a.fill();
        a.fillStyle = "rgba(255,255,255,0.9)"; for (let q = 0; q < 3; q++) a.fillRect(-30 + q * 22, -6, 14, 12);
      } else {
        a.save(); a.scale(1.18, 1.18); a.beginPath(); heartPoly(0, 0, 26).forEach(([u, v], q) => (q ? a.lineTo(u, v) : a.moveTo(u, v))); a.fill(); a.restore();
        a.fillStyle = css([238, 92, 110]); a.beginPath(); heartPoly(0, 0, 26).forEach(([u, v], q) => (q ? a.lineTo(u, v) : a.moveTo(u, v))); a.fill();
      }
      a.restore();
    }
    // wear: chips through the paint along the door edges (bare grey steel, rougher), scratches, dents
    for (let q = 0; q < 26; q++) {
      const side = Math.floor(R() * 4), t = R(), ex = side === 0 ? x0 + 4 + R() * 10 : side === 1 ? x0 + C - 6 - R() * 10 : x0 + t * C, ey = side < 2 ? t * Ht : side === 2 ? 4 + R() * 10 : Ht - 6 - R() * 10;
      const rr = 1.5 + 4 * R() * R();
      a.fillStyle = css([170, 168, 164], 0.9); a.beginPath(); a.ellipse(ex, ey, rr * 1.4, rr, R() * 3, 0, Math.PI * 2); a.fill();
      h.fillStyle = grey(60, 0.8); h.beginPath(); h.ellipse(ex, ey, rr * 1.4, rr, 0, 0, Math.PI * 2); h.fill();
      r.fillStyle = grey(200); r.beginPath(); r.ellipse(ex, ey, rr * 1.4, rr, 0, 0, Math.PI * 2); r.fill();
    }
    for (let q = 0; q < 10; q++) {
      const sx = x0 + 30 + R() * (C - 60), sy = 260 + R() * 640, l = 10 + 40 * R(), an = (R() - 0.5) * 1.2;
      a.strokeStyle = css(mix(tone, [255, 246, 236], 0.5), 0.5); a.lineWidth = 1.2; a.beginPath(); a.moveTo(sx, sy); a.lineTo(sx + Math.cos(an) * l, sy + Math.sin(an) * l); a.stroke();
    }
    for (let q = 0; q < 2; q++) { const dx = x0 + 50 + R() * (C - 100), dy = 400 + R() * 500; spot(h, dx, dy, 22, 16, grey(120, 0.5), grey(120, 0)); spot(a, dx + 3, dy + 3, 20, 14, css(mul(tone, 0.7), 0.18), css(mul(tone, 0.7), 0)); }
    // the gap between doors: a dark shadow line
    a.fillStyle = "rgba(30,14,10,0.85)"; a.fillRect(x0, 0, 3, Ht); a.fillRect(x0 + C - 3, 0, 3, Ht);
  }
  blurGrey(S.ch, 1.6, false);
  return S.done(new THREE.Vector2(1, 1), 1.4, false);
}

/** framed prints for the board wall, 2 x 2 cells of 512 x 368 px (landscape 0.5 x 0.36 m) inside a white mat with a
 *  glass glare: 0 campus concert poster, 1 the course timetable, 2 an art print (paper cut-outs), 3 a talk-series
 *  poster. Font-free: titles are bars, numbers are the hand-drawn glyphs. No institution names or logos. */
export function framedPrintsTex(o: { seed?: number } = {}): THREE.CanvasTexture {
  const CW = 512, CH = 368, c = canvas(CW * 2, CH * 2), g = c.getContext("2d", CTX)!, R = rng(o.seed ?? 131);
  const TEAL = "#3fa596", CORAL = "#ee7050", MUST = "#f2be40", NAVY = "#2f4478", CREAM = "#fbf3e2", DK = "#2e3138";
  const bar = (x: number, y: number, w: number, h: number, col: string) => { g.fillStyle = col; rrect(g, x, y, w, h, h / 2); g.fill(); };
  for (let i = 0; i < 4; i++) {
    const x0 = (i % 2) * CW, y0 = Math.floor(i / 2) * CH;
    g.save(); g.beginPath(); g.rect(x0, y0, CW, CH); g.clip();
    g.fillStyle = "#f7f4ec"; g.fillRect(x0, y0, CW, CH);
    const ix = x0 + 30, iy = y0 + 28, iw = CW - 60, ih = CH - 56;
    g.save(); g.beginPath(); g.rect(ix, iy, iw, ih); g.clip();
    if (i === 0) { // concert on the lawn: a big sun, sound waves, a stage silhouette, date
      g.fillStyle = CORAL; g.fillRect(ix, iy, iw, ih);
      g.fillStyle = MUST; g.beginPath(); g.arc(ix + iw * 0.68, iy + ih * 0.42, ih * 0.34, 0, Math.PI * 2); g.fill();
      g.strokeStyle = CREAM; g.lineWidth = 7; for (let k = 1; k <= 3; k++) { g.beginPath(); g.arc(ix + iw * 0.68, iy + ih * 0.42, ih * (0.34 + k * 0.08), Math.PI * 0.95, Math.PI * 1.45); g.stroke(); }
      g.fillStyle = NAVY; g.beginPath(); g.moveTo(ix, iy + ih); g.lineTo(ix, iy + ih * 0.78); g.lineTo(ix + iw * 0.3, iy + ih * 0.7); g.lineTo(ix + iw, iy + ih * 0.82); g.lineTo(ix + iw, iy + ih); g.fill();
      bar(ix + 22, iy + 24, 190, 30, CREAM); bar(ix + 22, iy + 66, 130, 16, "rgba(255,243,226,0.8)");
      penText(g, "11-28", ix + 24, iy + ih - 70, 40, 6, CREAM);
    } else if (i === 1) { // course timetable: five days x six slots, coloured course blocks, times down the side
      g.fillStyle = "#fbfbf8"; g.fillRect(ix, iy, iw, ih);
      g.fillStyle = NAVY; g.fillRect(ix, iy, iw, 46); bar(ix + 18, iy + 14, 170, 18, "#ffffff");
      const gx = ix + 54, gy = iy + 64, cw = (iw - 70) / 5, rh = (ih - 80) / 6;
      g.strokeStyle = "#c4c8d0"; g.lineWidth = 2;
      for (let k = 0; k <= 5; k++) { g.beginPath(); g.moveTo(gx + k * cw, gy); g.lineTo(gx + k * cw, gy + 6 * rh); g.stroke(); }
      for (let r = 0; r <= 6; r++) { g.beginPath(); g.moveTo(gx, gy + r * rh); g.lineTo(gx + 5 * cw, gy + r * rh); g.stroke(); }
      for (let r = 0; r < 6; r++) penText(g, String(9 + r), ix + 10, gy + r * rh + 8, 18, 3, DK);
      const cols = [TEAL, CORAL, MUST, "#7a8fd0"];
      for (let d = 0; d < 5; d++) for (let r = 0; r < 6; r++) { if (R() < 0.45) continue; const span = R() < 0.3 && r < 5 ? 2 : 1; g.fillStyle = cols[Math.floor(R() * 4)]; rrect(g, gx + d * cw + 4, gy + r * rh + 4, cw - 8, span * rh - 8, 6); g.fill(); g.fillStyle = "rgba(255,255,255,0.85)"; rrect(g, gx + d * cw + 10, gy + r * rh + 10, cw * 0.55, 7, 3.5); g.fill(); r += span - 1; }
    } else if (i === 2) { // art print: paper cut-outs on cream (a blue leaf, a coral blob, a black line, mustard dots)
      g.fillStyle = CREAM; g.fillRect(ix, iy, iw, ih);
      g.fillStyle = "#2f62c8"; g.beginPath(); g.moveTo(ix + 70, iy + ih - 20);
      for (let k = 0; k <= 12; k++) { const t = k / 12, a = -Math.PI / 2 + (t - 0.5) * 2.2, r = 120 + 26 * Math.sin(k * 2.3); g.lineTo(ix + 150 + Math.cos(a) * r * 0.7, iy + ih - 40 + Math.sin(a) * r * 1.1); }
      g.closePath(); g.fill();
      g.fillStyle = CORAL; g.beginPath(); g.ellipse(ix + iw * 0.66, iy + ih * 0.45, 86, 64, 0.4, 0, Math.PI * 2); g.fill();
      g.strokeStyle = DK; g.lineWidth = 9; g.lineCap = "round"; g.beginPath(); for (let k = 0; k <= 30; k++) { const x = ix + 230 + k * 7, y = iy + ih * 0.78 + 22 * Math.sin(k * 0.5); if (k) g.lineTo(x, y); else g.moveTo(x, y); } g.stroke();
      g.fillStyle = MUST; for (const [dx, dy, r] of [[0.84, 0.18, 22], [0.9, 0.36, 14], [0.5, 0.16, 18]]) { g.beginPath(); g.arc(ix + iw * dx, iy + ih * dy, r, 0, Math.PI * 2); g.fill(); }
    } else { // talk series: navy, a lectern-and-speech-bubble mark, title bars, the time
      g.fillStyle = NAVY; g.fillRect(ix, iy, iw, ih);
      g.fillStyle = TEAL; g.beginPath(); g.arc(ix + iw * 0.74, iy + ih * 0.44, 92, 0, Math.PI * 2); g.fill();
      g.fillStyle = CREAM; rrect(g, ix + iw * 0.6, iy + ih * 0.22, 130, 82, 18); g.fill();
      g.beginPath(); g.moveTo(ix + iw * 0.64, iy + ih * 0.22 + 78); g.lineTo(ix + iw * 0.62, iy + ih * 0.22 + 112); g.lineTo(ix + iw * 0.7, iy + ih * 0.22 + 80); g.fill();
      for (let k = 0; k < 3; k++) bar(ix + iw * 0.6 + 18, iy + ih * 0.22 + 18 + k * 20, 92 - k * 22, 9, NAVY);
      bar(ix + 22, iy + 26, 200, 28, CREAM); bar(ix + 22, iy + 66, 150, 14, "rgba(251,243,226,0.7)"); bar(ix + 22, iy + 88, 120, 14, "rgba(251,243,226,0.7)");
      penText(g, "19:30", ix + 24, iy + ih - 74, 42, 6, MUST);
    }
    g.restore();
    g.strokeStyle = "rgba(0,0,0,0.18)"; g.lineWidth = 2; g.strokeRect(ix, iy, iw, ih);
    const gl = g.createLinearGradient(x0, y0, x0 + CW, y0 + CH); gl.addColorStop(0.2, "rgba(255,255,255,0)"); gl.addColorStop(0.3, "rgba(255,255,255,0.22)"); gl.addColorStop(0.42, "rgba(255,255,255,0)");
    g.fillStyle = gl; g.fillRect(x0, y0, CW, CH);
    g.restore();
  }
  return ctex(c, true, false);
}

/** laptop screens, 2 x 2 cells of 256 x 160 px (emissive): 0 code editor, 1 spreadsheet, 2 slides, 3 a document */
export function laptopScreensTex(o: { seed?: number } = {}): THREE.CanvasTexture {
  const CW = 256, CH = 160, c = canvas(CW * 2, CH * 2), g = c.getContext("2d", CTX)!, R = rng(o.seed ?? 133);
  const cell = (i: number, f: (x: number, y: number) => void) => { const x = (i % 2) * CW, y = Math.floor(i / 2) * CH; g.save(); g.beginPath(); g.rect(x, y, CW, CH); g.clip(); f(x, y); g.restore(); };
  cell(0, (x, y) => { g.fillStyle = "#22262e"; g.fillRect(x, y, CW, CH); g.fillStyle = "#2c313b"; g.fillRect(x, y, 40, CH);
    const cols = ["#7fc8f8", "#f2c14a", "#ef8f7a", "#9ad48a", "#c9b2f2", "#e6e6e6"];
    for (let r = 0; r < 14; r++) { let cx = x + 50 + (R() < 0.4 ? 14 : 0) + (R() < 0.2 ? 14 : 0); const n = 1 + Math.floor(R() * 4); for (let k = 0; k < n; k++) { const w = 12 + 36 * R(); g.fillStyle = cols[Math.floor(R() * cols.length)]; g.fillRect(cx, y + 10 + r * 10.5, w, 4.5); cx += w + 6; } } });
  cell(1, (x, y) => { g.fillStyle = "#ffffff"; g.fillRect(x, y, CW, CH); g.fillStyle = "#2f8f5e"; g.fillRect(x, y, CW, 16);
    g.strokeStyle = "#d4d8dd"; g.lineWidth = 1; for (let k = 0; k <= 8; k++) { g.beginPath(); g.moveTo(x + k * 32, y + 16); g.lineTo(x + k * 32, y + CH); g.stroke(); } for (let r = 0; r <= 12; r++) { g.beginPath(); g.moveTo(x, y + 16 + r * 12); g.lineTo(x + CW, y + 16 + r * 12); g.stroke(); }
    for (let r = 0; r < 12; r++) for (let k = 0; k < 8; k++) if (R() < 0.6) { g.fillStyle = k === 0 ? "#6b7280" : "#9aa0ab"; g.fillRect(x + k * 32 + 4, y + 20 + r * 12, 10 + 14 * R(), 4); }
    g.fillStyle = "rgba(47,143,94,0.25)"; g.fillRect(x + 96, y + 52, 64, 36); });
  cell(2, (x, y) => { g.fillStyle = "#fbfbf8"; g.fillRect(x, y, CW, CH); g.fillStyle = "#3e9e94"; g.fillRect(x, y, CW, 26); g.fillStyle = "#ffffff"; rrect(g, x + 12, y + 8, 100, 10, 5); g.fill();
    const pts: [number, number][] = []; for (let k = 0; k < 8; k++) { const a = (k / 8) * Math.PI * 2, r = 34 + 14 * R(); pts.push([x + 160 + Math.cos(a) * r * 1.3, y + 92 + Math.sin(a) * r]); }
    for (let k = 0; k < 11; k++) { const p = pts[Math.floor(R() * 8)], q = pts[Math.floor(R() * 8)]; g.strokeStyle = k % 3 ? "#b9bdc6" : "#3e9e94"; g.lineWidth = k % 3 ? 1.5 : 3; g.beginPath(); g.moveTo(p[0], p[1]); g.lineTo(q[0], q[1]); g.stroke(); }
    pts.forEach((p, k) => { g.fillStyle = k % 3 ? "#f2c14a" : "#ee7050"; g.beginPath(); g.arc(p[0], p[1], 6, 0, Math.PI * 2); g.fill(); });
    for (let k = 0; k < 4; k++) { g.fillStyle = "#9aa0ab"; rrect(g, x + 14, y + 44 + k * 18, 56 + 20 * R(), 6, 3); g.fill(); } });
  cell(3, (x, y) => { g.fillStyle = "#e9ebef"; g.fillRect(x, y, CW, CH); g.fillStyle = "#ffffff"; g.fillRect(x + 48, y + 6, CW - 96, CH);
    g.fillStyle = "#2f62c8"; rrect(g, x + 60, y + 18, 90, 9, 4.5); g.fill();
    for (let r = 0; r < 11; r++) { g.fillStyle = "#a3a8b2"; rrect(g, x + 60, y + 38 + r * 10.5, (CW - 120) * (r % 4 === 3 ? 0.55 : 0.9 + 0.1 * R()), 4, 2); g.fill(); } });
  return ctex(c, true, false);
}

/** the plain wing panels either side of the chalkboard (1.3 x 1.2 m, 784 x 724 px): board tone, dusty eraser arcs and
 *  the ghost of old, half-erased writing; same albedo + bump/rough packing as chalkboardTex */
export function blankBoardTex(o: { seed?: number } = {}): W.WoodTex {
  const Wd = 784, Ht = 724, R = rng(o.seed ?? 73), S = new Sheet(Wd, Ht, [56, 108, 84], 128, 228), { a } = S;
  for (let i = 0; i < 8; i++) { const lt = R() < 0.5, c: RGB = lt ? [86, 140, 112] : [40, 84, 64]; spot(a, R() * Wd, R() * Ht, 160 + 200 * R(), 100 + 120 * R(), css(c, 0.25), css(c, 0)); }
  for (let i = 0; i < 6; i++) {
    const y = R() * Ht, x0 = R() * Wd * 0.4, l = 200 + 400 * R(), amp = 30 + 50 * R(), ph = R() * 6;
    a.strokeStyle = css([210, 232, 218], 0.035 + 0.035 * R()); a.lineWidth = 60 + 60 * R(); a.lineCap = "round";
    a.beginPath(); for (let s = 0; s <= l; s += 20) { const yy = y + amp * Math.sin(s / 140 + ph); if (s) a.lineTo(x0 + s, yy); else a.moveTo(x0 + s, yy); } a.stroke();
  }
  a.save(); a.globalAlpha = 0.1; for (let k = 0; k < 6; k++) strokePolys(a, cursive(R, 60 + 60 * R(), 150 + k * 80, 420 + 160 * R(), 34), 5, "rgba(230,240,232,1)"); a.restore();
  const dg = a.createLinearGradient(0, Ht - 60, 0, Ht); dg.addColorStop(0, "rgba(230,240,232,0)"); dg.addColorStop(1, "rgba(230,240,232,0.14)");
  a.fillStyle = dg; a.fillRect(0, Ht - 60, Wd, 60);
  return S.done(new THREE.Vector2(1, 1), 0.3, false);
}

// =====================================================================================================================
// geometry kit: every static part is collected per material and merged into one mesh per material at the end
// =====================================================================================================================
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
/** translate + rotate (Euler YXZ: yaw, then pitch, then roll) + scale */
const T = (x = 0, y = 0, z = 0, ry = 0, rx = 0, rz = 0, s: number | V3 = 1) => {
  const sc = typeof s === "number" ? V(s, s, s) : V(s[0], s[1], s[2]);
  return new THREE.Matrix4().compose(V(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz, "YXZ")), sc);
};
const at = (p: THREE.Matrix4, ...c: THREE.Matrix4[]) => c.reduce((m, x) => m.multiply(x), p.clone());
type Part = { g: THREE.BufferGeometry; m: THREE.Material };

class Kit {
  lists = new Map<THREE.Material, THREE.BufferGeometry[]>();
  add(g: THREE.BufferGeometry, m: THREE.Material, mx?: THREE.Matrix4) {
    if (mx) g.applyMatrix4(mx);
    let l = this.lists.get(m); if (!l) this.lists.set(m, (l = [])); l.push(g);
    return g;
  }
  /** place a template (parts in its local space) */
  put(parts: Part[], mx: THREE.Matrix4) { for (const p of parts) this.add(p.g.clone(), p.m, mx); }
  /** merge per material into meshes under root; returns the triangle count */
  bake(root: THREE.Object3D, noCast: Set<THREE.Material>) {
    let tris = 0;
    for (const [m, list] of this.lists) {
      const hasEdge = list.some((g) => !!g.getAttribute("edgeD")), hasCol = list.some((g) => !!g.getAttribute("color"));
      const keep = ["position", "normal", "uv", ...(hasEdge ? ["edgeD"] : []), ...(hasCol ? ["color"] : [])];
      const gs = list.map((g0) => {
        const g = g0.index ? g0.toNonIndexed() : g0;
        if (!g.getAttribute("normal")) g.computeVertexNormals();
        const n = g.getAttribute("position").count;
        if (!g.getAttribute("uv")) g.setAttribute("uv", new THREE.BufferAttribute(new Float32Array(n * 2), 2));
        if (hasEdge && !g.getAttribute("edgeD")) g.setAttribute("edgeD", new THREE.BufferAttribute(new Float32Array(n * 4).fill(9), 4));
        if (hasCol && !g.getAttribute("color")) g.setAttribute("color", new THREE.BufferAttribute(new Float32Array(n * 3).fill(1), 3));
        for (const key of Object.keys(g.attributes)) if (!keep.includes(key)) g.deleteAttribute(key);
        g.morphAttributes = {}; g.clearGroups();
        return g;
      });
      const merged = mergeGeometries(gs, false);
      if (!merged) { console.warn("classroom: merge failed", m.name); continue; }
      const mesh = new THREE.Mesh(merged, m);
      mesh.castShadow = !noCast.has(m); mesh.receiveShadow = true; mesh.name = `classroom:${m.name || m.type}`;
      root.add(mesh);
      tris += merged.getAttribute("position").count / 3;
    }
    this.lists.clear();
    return tris;
  }
}
/** one geometry from several parts of one material: non-indexed, the same attribute set (position, normal, uv,
 *  edgeD when any part has it), so mergeGeometries never refuses */
const mergeParts = (list: THREE.BufferGeometry[]) => {
  const hasEdge = list.some((g) => !!g.getAttribute("edgeD")), keep = ["position", "normal", "uv", ...(hasEdge ? ["edgeD"] : [])];
  const gs = list.map((g0) => {
    const g = g0.index ? g0.toNonIndexed() : g0.clone();
    if (!g.getAttribute("normal")) g.computeVertexNormals();
    const n = g.getAttribute("position").count;
    if (!g.getAttribute("uv")) g.setAttribute("uv", new THREE.BufferAttribute(new Float32Array(n * 2), 2));
    if (hasEdge && !g.getAttribute("edgeD")) g.setAttribute("edgeD", new THREE.BufferAttribute(new Float32Array(n * 4).fill(9), 4));
    for (const key of Object.keys(g.attributes)) if (!keep.includes(key)) g.deleteAttribute(key);
    g.morphAttributes = {}; g.clearGroups();
    return g;
  });
  return mergeGeometries(gs, false)!;
};
/** a repeated template (desk, chair, laptop, cup ...): its parts merged per material once, then one InstancedMesh per
 *  material for every placement. `tint` materials take a per-instance colour (instanceColor x material colour). */
class Inst {
  tpl = new Map<THREE.Material, THREE.BufferGeometry>(); mx: THREE.Matrix4[] = []; cols: THREE.Color[] = [];
  constructor(public name: string, parts: Part[], public tint: THREE.Material[] = []) {
    const by = new Map<THREE.Material, THREE.BufferGeometry[]>();
    for (const p of parts) { let l = by.get(p.m); if (!l) by.set(p.m, (l = [])); l.push(p.g); }
    for (const [m, l] of by) this.tpl.set(m, mergeParts(l));
  }
  add(mx: THREE.Matrix4, col?: THREE.ColorRepresentation) { this.mx.push(mx.clone()); this.cols.push(new THREE.Color(col ?? 0xffffff)); return this.mx.length - 1; }
  bake(root: THREE.Object3D, noCast: Set<THREE.Material>, cast = true) {
    let tris = 0;
    if (!this.mx.length) return 0;
    for (const [m, g] of this.tpl) {
      const im = new THREE.InstancedMesh(g, m, this.mx.length);
      this.mx.forEach((x, i) => im.setMatrixAt(i, x));
      if (this.tint.includes(m)) this.cols.forEach((c, i) => im.setColorAt(i, c));
      im.instanceMatrix.needsUpdate = true; im.computeBoundingSphere(); im.computeBoundingBox();
      im.castShadow = cast && !noCast.has(m); im.receiveShadow = true; im.name = `classroom:${this.name}:${m.name || m.type}`;
      root.add(im);
      tris += (g.getAttribute("position").count / 3) * this.mx.length;
    }
    return tris;
  }
}

// ---------------- primitives (metric UVs + edgeD via woodtex metricGeo, built in local space) ----------------
const bx = (w: number, h: number, d: number) => { const g = new THREE.BoxGeometry(w, h, d); W.metricGeo(g); return g; };
/** rounded box of the true size w x h x d (three's RoundedBoxGeometry bends its normals in unit-cube space, so boxes
 *  far from 1 m come out shrunk or folded: a 3 cm seat slab loses 2.4 cm of its top). Built from a unit box instead. */
const rb = (w: number, h: number, d: number, r: number, seg = 2) => {
  const S = seg * 2 + 1, hs = 0.5 / S, rr = Math.min(w / 2, h / 2, d / 2, r), ib = [w / 2 - rr, h / 2 - rr, d / 2 - rr];
  const g = new THREE.BoxGeometry(1, 1, 1, S, S, S).toNonIndexed(), p = g.attributes.position, nr = g.attributes.normal, q = new THREE.Vector3(), n = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    q.fromBufferAttribute(p, i); const sx = Math.sign(q.x), sy = Math.sign(q.y), sz = Math.sign(q.z);
    n.set(q.x - sx * hs, q.y - sy * hs, q.z - sz * hs).normalize();
    p.setXYZ(i, ib[0] * sx + n.x * rr, ib[1] * sy + n.y * rr, ib[2] * sz + n.z * rr); nr.setXYZ(i, n.x, n.y, n.z);
  }
  W.metricGeo(g); return g;
};
const cyl = (r0: number, r1: number, h: number, seg = 10, open = false) => { const g = new THREE.CylinderGeometry(r0, r1, h, seg, 1, open); W.metricGeo(g); return g; };
const lathe = (pts: [number, number][], seg = 14) => { const g = new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), seg); W.metricGeo(g); return g; };
/** plane facing +z, uv = the [u0, v0, u1, v1] window of the texture */
const quad = (w: number, h: number, uv: [number, number, number, number] = [0, 0, 1, 1]) => {
  const g = new THREE.PlaneGeometry(w, h), a = g.getAttribute("uv");
  for (let i = 0; i < a.count; i++) a.setXY(i, uv[0] + a.getX(i) * (uv[2] - uv[0]), uv[1] + a.getY(i) * (uv[3] - uv[1]));
  return g;
};
/** atlas cell (printAtlas: 4 x 2 cells, cell 0 top-left) with an inner crop (0..0.5) */
const cellUV = (i: number, crop = 0): [number, number, number, number] => {
  const cx = i % 4, cy = Math.floor(i / 4), u0 = cx / 4, v1 = 1 - cy / 2;
  return [u0 + crop / 4, v1 - 0.5 + crop / 2, u0 + 0.25 - crop / 4, v1 - crop / 2];
};
/** thin cylinder between two points */
const rod = (a: THREE.Vector3, b: THREE.Vector3, r: number, seg = 6) => {
  const d = b.clone().sub(a), g = cyl(r, r, d.length(), seg, true);
  g.translate(0, d.length() / 2, 0);
  g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), d.clone().normalize()));
  g.translate(a.x, a.y, a.z);
  return g;
};
const tube = (pts: THREE.Vector3[], r: number, seg = 12, rs = 6) => { const g = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), seg, r, rs, false); W.metricGeo(g); return g; };
/** world-metre UVs by face orientation (walls: u along the wall, v = height + vOff; floors/ceilings: x, -z) */
const worldUV = (g: THREE.BufferGeometry, uOff = 0, vOff = 0) => {
  const p = g.getAttribute("position"), n = g.getAttribute("normal"), uv = new Float32Array(p.count * 2);
  for (let i = 0; i < p.count; i++) {
    const ax = Math.abs(n.getX(i)), ay = Math.abs(n.getY(i)), az = Math.abs(n.getZ(i));
    let u: number, v: number;
    if (ay >= ax && ay >= az) { u = p.getX(i) + uOff; v = -p.getZ(i) + vOff; }
    else if (ax >= az) { u = -Math.sign(n.getX(i)) * p.getZ(i); v = p.getY(i) + vOff; }
    else { u = Math.sign(n.getZ(i)) * p.getX(i); v = p.getY(i) + vOff; }
    uv[2 * i] = u; uv[2 * i + 1] = v;
  }
  g.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  return g;
};
/** bend a part about its local x: z += k x^2 (wraps a chair back round the sitter) */
const bendZ = (g: THREE.BufferGeometry, k: number) => {
  const p = g.getAttribute("position");
  for (let i = 0; i < p.count; i++) p.setZ(i, p.getZ(i) + k * p.getX(i) * p.getX(i));
  g.computeVertexNormals(); return g;
};
/** narrow a part toward its top: x, z *= 1 - k * (y - y0) / h */
const taperY = (g: THREE.BufferGeometry, k: number, kz = 0) => {
  g.computeBoundingBox(); const b = g.boundingBox!, h = b.max.y - b.min.y, p = g.getAttribute("position");
  for (let i = 0; i < p.count; i++) { const f = (p.getY(i) - b.min.y) / h; p.setX(i, p.getX(i) * (1 - k * f)); p.setZ(i, p.getZ(i) * (1 - kz * f)); }
  g.computeVertexNormals(); return g;
};
/** box with per-face vertex colours: top/bottom faces `ends`, the rest `body` (books, binders, reams) */
const colorBox = (w: number, h: number, d: number, body: THREE.Color, ends: THREE.Color, spine?: THREE.Color) => {
  const g = new THREE.BoxGeometry(w, h, d); W.metricGeo(g);
  const n = g.getAttribute("normal"), c = new Float32Array(n.count * 3);
  for (let i = 0; i < n.count; i++) {
    const col = Math.abs(n.getY(i)) > 0.5 ? ends : spine && n.getX(i) < -0.5 ? spine : body;
    c[i * 3] = col.r; c[i * 3 + 1] = col.g; c[i * 3 + 2] = col.b;
  }
  g.setAttribute("color", new THREE.BufferAttribute(c, 3));
  return g;
};
/** big leaf along +x from the origin: folded along the midrib, drooping (uv: u along, v across) */
const leafGeo = (len: number, wid: number, fold = 0.3, droop = 0.25) => {
  const n = 7, pos: number[] = [], uv: number[] = [], idx: number[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n, x = t * len, w = 0.5 * wid * Math.pow(Math.sin(Math.PI * Math.pow(t, 0.8)), 0.8), y = -droop * len * t * t;
    pos.push(x, y + fold * w, -w, x, y, 0, x, y + fold * w, w); uv.push(t, 0, t, 0.5, t, 1);
  }
  for (let i = 0; i < n; i++) { const a = i * 3; idx.push(a, a + 1, a + 3, a + 1, a + 4, a + 3, a + 1, a + 2, a + 4, a + 2, a + 5, a + 4); }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx); g.computeVertexNormals();
  return g;
};

// =====================================================================================================================
// room layout (metres): x across (windows at X0, doors at X1), z from the board wall (Z0) to the back wall (Z1), y up
// =====================================================================================================================
const X0 = -5.8, X1 = 5.8, Z0 = -6.0, Z1 = 6.0, HC = 3.2, WT = 0.25, DADO = 0.85, SILL = 0.85, HEAD = 2.7;
/** plenum: the suspended ceiling at HC, the roof slab from PLEN to ROOF; the window wall rises to PARAPET outside */
const PLEN = 3.7, ROOF = 3.9, PARAPET = 4.25, TOPI = ROOF + 0.05, GROUND = -0.35;
const WIN_Z = [-4.3, -2.15, 0, 2.15, 4.3], WIN_W = 1.6, TRANSOM = 2.15;
/** the casement pair that opens (the front-most window: the storyboard's "window 1", whose sun also lights the dais)
 *  and the radiator whose exposed pipe takes the knot */
const WIN_OPEN = 0, RAD_WIN = 3;
const DOORS: [number, number][] = [[-5.55, -4.55], [4.45, 5.45]], DH = 2.1;
/** the teacher's platform: a 0.2 m dais along the board wall */
const DAIS = { x0: -5.1, x1: 4.9, z1: Z0 + 1.5, h: 0.2 };
/** three blocks of two abutting two-seat desks (6 desk columns), 7 rows at 1.25 m: 42 desks, 84 seats */
const BLOCK_X0 = [-5.05, -1.53, 1.99], BLOCK_W = 2.62;
const DESK_X = BLOCK_X0.flatMap((b) => [b + 0.65, b + 1.97]);
const ROW_Z = [0, 1, 2, 3, 4, 5, 6].map((r) => -3.3 + 1.25 * r);
const AISLE_X = [(BLOCK_X0[0] + BLOCK_W + BLOCK_X0[1]) / 2, (BLOCK_X0[1] + BLOCK_W + BLOCK_X0[2]) / 2];
const SEAT_X = 0.32, DESK_TOP = 0.75, CHAIR_Z = 0.52, HIP_Y = 0.472, HIP_Z = 0.06;
/** the protagonist: middle row, centre block, the inner seat on the window side (neighbours on both sides) */
const YOU = { row: 3, col: 2, side: 1 };
/** the rope lane for line 07: a level run at TIE_Y through the gap behind row 3's chair backs (and their totes and
 *  jackets, all below 0.9 m) and in front of row 4's desk props (from z 1.435), to the exposed riser at RISER_Z */
const RISER_Z = ROW_Z[YOU.row] + 0.88, TIE_Y = 1.0;
const BOARD = { x: -0.5, w: 3.4, y0: 1.1, y1: 2.3, wing: 1.3 }, SCREEN_X = 3.75;
const LOCK_Z0 = -3.4; // the locker run on the door wall: 6 x 0.4 m from here toward +z
const FANS: [number, number][] = [[-2.75, -3.05], [2.75, -3.05], [-2.75, 2.75], [2.75, 2.75]]; // ceiling fans (x, z)
/** blinds per window (front to back): bottom of the slats (m) and slat tilt (rad, negative = room-side edge down:
 *  -0.45 passes ~40 % of the sun as bold stripes); raised = stacked at the top (the opening window's blind is up). */
const BLINDS: { drop: number; tilt: number; raised?: boolean }[] = [
  { drop: HEAD, tilt: 0, raised: true }, { drop: SILL + 0.06, tilt: -0.45 }, { drop: SILL + 0.06, tilt: -0.5 }, { drop: 1.65, tilt: -0.55 }, { drop: 1.55, tilt: -0.45 },
];
const ease = (x: number) => { const t = Math.min(1, Math.max(0, x)); return t * t * (3 - 2 * t); };

// ---------------- materials ----------------
function makeMaterials(M: Mats, blankBoard = false) {
  const wm = W.woodMaps;
  const tx = {
    wallC: blockWall({ color: [246, 232, 204], seed: 11 }), wallT: blockWall({ color: [96, 178, 166], seed: 12 }),
    wallY: blockWall({ color: [250, 204, 96], seed: 13 }), locker: lockerTex(),
    floor: floorTiles(), ceil: ceilingTiles(), lam: laminate(), lamD: laminate({ color: [190, 124, 74], seed: 43 }),
    fab: fabricTex(), cork: corkTex(), fin: finTex(), board: chalkboardTex({ blank: blankBoard }), wing: blankBoardTex(),
    vent: grilleTex({ slots: 12 }), spk: grilleTex({ dots: true, base: [74, 76, 84] }),
    roof: roofTex(), brick: brickTex(),
  };
  const P = (o: Parameters<Mats["paint"]>[0], name: string) => { const m = M.paint(o); m.name = name; return m; };
  const fabric = (col: string, name: string) => { const m = M.wood({ ...wm(tx.fab), color: col, roughness: 1 }); m.name = name; return m; };
  const basic = (o: THREE.MeshBasicMaterialParameters, name: string) => { const m = new THREE.MeshBasicMaterial(o); m.name = name; return m; };
  const rep = (t: THREE.CanvasTexture, r: number) => { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(r, r); return t; };
  const atlas = printAtlas(), slide = slideTex(), screens = laptopScreensTex();
  const sheetsLo = [0, 1, 2, 3].map((i) => ratingSheetTex({ seed: 300 + i, ink: i % 2 ? [40, 44, 52] : [36, 70, 176], done: i === 3 ? 9 : 15 }));
  const screen = P({ map: slide, roughness: 0.95 }, "screen"); screen.emissive = new THREE.Color(1, 1, 1); screen.emissiveMap = slide; screen.emissiveIntensity = 0.5;
  const laptopScr = P({ map: slide, roughness: 0.3 }, "laptopScreen"); laptopScr.emissive = new THREE.Color(1, 1, 1); laptopScr.emissiveMap = slide; laptopScr.emissiveIntensity = 0.7;
  const screens4 = P({ map: screens, roughness: 0.3 }, "laptopScreens"); screens4.emissive = new THREE.Color(1, 1, 1); screens4.emissiveMap = screens; screens4.emissiveIntensity = 0.75;
  const books = P({ roughness: 0.7 }, "books"); books.vertexColors = true;
  // window glass: a faint glare, transparent, no depth write (NOINK, never in the AO / ink buffers)
  const gc = canvas(128, 128), gg = gc.getContext("2d", CTX)!;
  { const gr = gg.createLinearGradient(0, 128, 128, 0); gr.addColorStop(0, "rgba(255,255,255,0.25)"); gr.addColorStop(0.38, "rgba(255,255,255,0.25)"); gr.addColorStop(0.44, "rgba(255,255,255,0.95)"); gr.addColorStop(0.52, "rgba(255,255,255,0.3)"); gr.addColorStop(0.6, "rgba(255,255,255,0.75)"); gr.addColorStop(0.66, "rgba(255,255,255,0.22)"); gr.addColorStop(1, "rgba(255,255,255,0.22)"); gg.fillStyle = gr; gg.fillRect(0, 0, 128, 128); }
  const glass = basic({ map: ctex(gc, true, false), color: "#e4f4ff", transparent: true, opacity: 0.2, depthWrite: false, side: THREE.DoubleSide }, "windowGlass");
  const vc = (name: string) => basic({ vertexColors: true }, name);
  const shadowTex = (() => { const c = canvas(128, 128), g = c.getContext("2d", CTX)!; const gr = g.createRadialGradient(64, 64, 4, 64, 64, 64); gr.addColorStop(0, "rgba(20,40,20,0.45)"); gr.addColorStop(1, "rgba(20,40,20,0)"); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); return ctex(c, true, false); })();
  const m = {
    wallC: P({ ...wm(tx.wallC), roughness: 1 }, "wallCream"), wallT: P({ ...wm(tx.wallT), roughness: 1 }, "wallTeal"),
    wallY: P({ ...wm(tx.wallY), roughness: 1 }, "wallYellow"),
    locker: P({ ...wm(tx.locker, [1, 1]), roughness: 1, specular: 0.7 }, "lockerDoors"), lockerBody: P({ color: "#d9654a", roughness: 0.45 }, "lockerBody"),
    doorPaint: P({ color: "#3f74cf", roughness: 0.42 }, "doorPaint"), prints: P({ map: framedPrintsTex(), roughness: 0.25, specular: 0.8 }, "framedPrints"),
    floor: P({ ...wm(tx.floor), roughness: 1 }, "floor"), floorAcc: P({ ...wm(tx.floor), roughness: 1, color: "#86c9bd" }, "floorAccent"),
    ceil: P({ ...wm(tx.ceil), roughness: 1, envMapIntensity: 1.45 }, "ceiling"),
    lam: W.edgeWear(P({ ...wm(tx.lam), roughness: 1 }, "deskWood"), { k: 0.16, w: 0.006 }),
    lamD: W.edgeWear(P({ ...wm(tx.lamD), roughness: 1 }, "darkWood"), { k: 0.14, w: 0.006 }),
    frame: P({ color: "#4e545e", roughness: 0.42 }, "frame"), panel: P({ color: "#e4e0d6", roughness: 0.5 }, "modesty"),
    glide: P({ color: "#26282c", roughness: 0.6 }, "rubber"), chair: P({ color: "#3f72d9", roughness: 0.36 }, "chairShell"),
    white: P({ color: "#f5f3ed", roughness: 0.45 }, "white"), slat: P({ color: "#f5f3ed", roughness: 0.45 }, "slat"), offwhite: P({ color: "#e6e2d8", roughness: 0.5 }, "offwhite"),
    alu: P({ color: "#c9cdd3", roughness: 0.32, specular: 0.8 }, "aluminium"), dark: P({ color: "#34373e", roughness: 0.45 }, "darkPlastic"),
    skirting: P({ color: "#3f5f62", roughness: 0.55 }, "skirting"), doorFrame: P({ color: "#2f7d84", roughness: 0.42 }, "doorFrame"),
    doorGlass: P({ color: "#2c4152", roughness: 0.06, specular: 1 }, "doorGlass"), glass,
    chrome: M.metalWith({ color: "#dfe2e6", roughness: 0.18 }),
    board: P({ ...wm(tx.board, [1, 1]), roughness: 1 }, "chalkboard"), wing: P({ ...wm(tx.wing, [1, 1]), roughness: 1 }, "boardWing"),
    cork: P({ ...wm(tx.cork, [2.4 / 0.6, 1.2 / 0.6]), roughness: 1 }, "cork"),
    fin: P({ ...wm(tx.fin), roughness: 1, color: "#f6f4ee" }, "radiator"),
    vent: P({ ...wm(tx.vent, [1, 1]), roughness: 1 }, "vent"), spk: P({ ...wm(tx.spk, [1, 1]), roughness: 1 }, "speakerGrille"),
    paper: P({ color: "#faf8f2", roughness: 0.9 }, "paper"), print: P({ map: atlas, roughness: 0.85 }, "prints"),
    clock: P({ map: clockFaceTex(), roughness: 0.6 }, "clockFace"), screen, laptopScr, screens4, books,
    sheets: sheetsLo.map((t, i) => P({ ...wm(t, [1, 1]), roughness: 1 }, `card${i}`)),
    heroSheet: P({ ...wm(ratingSheetTex({ seed: 7, hero: true, done: 11 }), [1, 1]), roughness: 1 }, "heroCard"),
    leaf: P({ map: leafTex(), roughness: 0.55, side: THREE.DoubleSide }, "leaf"),
    pot: P({ color: "#f2efe8", roughness: 0.4 }, "pot"), terracotta: P({ color: "#d9845a", roughness: 0.7 }, "terracotta"),
    soil: P({ color: "#5a3e2b", roughness: 1 }, "soil"), trunk: P({ color: "#8a6142", roughness: 0.8 }, "trunk"),
    cactus: P({ color: "#5fae6a", roughness: 0.6 }, "cactus"),
    red: P({ color: "#e0453a", roughness: 0.35 }, "red"), bin: P({ color: "#8d949e", roughness: 0.5 }, "bin"), binBlue: P({ color: "#3f7fd0", roughness: 0.45 }, "binBlue"),
    pens: ["#2e62d6", "#2b2e35", "#d8433a", "#2e62d6"].map((c, i) => P({ color: c, roughness: 0.35 }, `pen${i}`)),
    bottles: ["#3fb0a8", "#f4f2ec", "#ef8fae", "#5b86e0", "#f2c14a"].map((c, i) => P({ color: c, roughness: 0.3 }, `bottle${i}`)),
    caps: P({ color: "#2f3238", roughness: 0.5 }, "caps"),
    bags: ["#3d5a9e", "#d4503f", "#e9b43e", "#4f9a62", "#7b8794", "#7a5cb4", "#3a3d45", "#3aa3a0"].map((c, i) => fabric(c, `bag${i}`)),
    trim: fabric("#3b3e46", "bagTrim"),
    jackets: [fabric("#34508f", "jacketNavy"), fabric("#d9a43a", "jacketMustard")],
    notebook: ["#e2574a", "#4a86d8", "#56b07a", "#f0c040"].map((c, i) => P({ color: c, roughness: 0.6 }, `notebook${i}`)),
    sleeve: P({ color: "#b07a4c", roughness: 0.8 }, "cupSleeve"),
    chalk: ["#fbfaf4", "#f8e27a", "#f7a2b0"].map((c, i) => P({ color: c, roughness: 0.95 }, `chalk${i}`)),
    felt: P({ color: "#4a4d55", roughness: 1 }, "felt"),
    lights: basic({ map: diffuserTex(), color: new THREE.Color(1.55, 1.53, 1.46) }, "lightPanel"),
    panelFrame: P({ color: "#f5f3ed", roughness: 0.45 }, "panelFrame"), panelInk: basic({ color: "#111111" }, "panelInk"),
    ventFlush: P({ ...wm(tx.vent, [1, 1]), roughness: 1 }, "ventFlush"),
    exit: basic({ map: exitSignTex(), color: new THREE.Color(1.25, 1.25, 1.25) }, "exitSign"),
    led: basic({ color: new THREE.Color(0.4, 1.6, 0.6) }, "led"),
    cardboard: P({ color: "#c99a62", roughness: 0.85 }, "cardboard"), tape: P({ color: "#d9b27a", roughness: 0.4 }, "tape"),
    bunting: (() => { const b = P({ roughness: 0.8, side: THREE.DoubleSide }, "bunting"); b.vertexColors = true; return b; })(),
    // tintable bases for instanced props (instance colour x white)
    tBottle: P({ color: "#ffffff", roughness: 0.3 }, "bottleBody"), tPen: P({ color: "#ffffff", roughness: 0.35 }, "penBody"),
    tCover: P({ color: "#ffffff", roughness: 0.6 }, "notebookCover"), tRibbon: P({ color: "#ffffff", roughness: 0.6 }, "lanyardRibbon"),
    tBag: fabric("#ffffff", "toteBag"), tPack: fabric("#ffffff", "backpack"), tJacket: fabric("#ffffff", "jacket"),
    tLaptop: P({ color: "#ffffff", roughness: 0.32, specular: 0.8 }, "laptopBody"),
    keys: P({ color: "#25272c", roughness: 0.6 }, "keyboard"), phoneScr: P({ color: "#111317", roughness: 0.08, specular: 1 }, "phoneScreen"),
    badge: P({ color: "#f6f6f2", roughness: 0.3, specular: 0.8 }, "badge"), lid: P({ color: "#3a3330", roughness: 0.5 }, "cupLid"),
    // the dais, the building's outside
    daisRiser: P({ color: "#3f6f73", roughness: 0.5 }, "daisRiser"),
    // roofs tinted to a mid grey: in full sun the raw membrane went paper-white and the crane shots lost the room
    roof: P({ ...wm(tx.roof), roughness: 1, color: "#a29e95" }, "roofMembrane"), brick: P({ ...wm(tx.brick), roughness: 1 }, "facingBrick"),
    cap: P({ color: "#dcd8d0", roughness: 0.7 }, "wallCap"), lidSide: P({ color: "#d6d2ca", roughness: 0.8 }, "ceilingEdge"),
    // exterior: unlit and painted like the reference backdrops
    grass: basic({ map: rep(grassTex(), 1), color: new THREE.Color(1.0, 1.0, 1.0) }, "lawn"),
    paving: basic({ map: rep(pavingTex(), 1) }, "paving"),
    facade: basic({ map: facadeTex() }, "facade"), outWin: basic({ map: outsideWindowTex() }, "outsideWindow"),
    extBody: basic({ color: "#c98a66" }, "blockSide"), extRoof: basic({ color: "#bdbab3" }, "blockRoof"), extCoping: basic({ color: "#efe7d8" }, "blockCoping"),
    extDark: basic({ color: "#3a4250" }, "postDark"), extLamp: basic({ color: "#fff4d0" }, "lampGlass"), extWood: basic({ color: "#b77a45" }, "benchWood"),
    extTrunk: basic({ color: "#7a5638" }, "treeTrunk"), crown: vc("treeCrown"), skyGlass: basic({ color: "#5d84a6" }, "skylightGlass"),
    blob: basic({ map: shadowTex, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 }, "treeShadow"),
    sky: basic({ map: skyTex(), side: THREE.BackSide, fog: false, color: new THREE.Color(1.08, 1.08, 1.08) }, "sky"),
    skyTop: basic({ color: "#4f9fe6", side: THREE.DoubleSide, fog: false }, "skyTop"),
  };
  m.grass.map!.repeat.set(1 / 3, 1 / 3); m.paving.map!.repeat.set(1 / 2.4, 1 / 2.4);
  return m;
}
type Mt = ReturnType<typeof makeMaterials>;

// ---------------- furniture and prop templates (local space; desks/chairs face -z, i.e. the board) ----------------
type Adder = (g: THREE.BufferGeometry, m: THREE.Material, mx?: THREE.Matrix4) => void;
const parts = (f: (add: Adder) => void): Part[] => { const P: Part[] = []; f((g, m, mx) => { if (mx) g.applyMatrix4(mx); P.push({ g, m }); }); return P; };
function chairParts(mt: Mt): Part[] {
  return parts((add) => {
    add(rb(0.44, 0.032, 0.42, 0.014, 2), mt.chair, T(0, 0.456, -0.01));
    add(bendZ(rb(0.42, 0.21, 0.026, 0.011, 2), -0.75), mt.chair, T(0, 0.745, 0.226, 0, 0.14));
    for (const sx of [-1, 1]) {
      add(rod(V(sx * 0.195, 0, -0.18), V(sx * 0.185, 0.445, -0.165), 0.011), mt.frame);
      add(rod(V(sx * 0.195, 0, 0.2), V(sx * 0.18, 0.445, 0.175), 0.011), mt.frame);
      add(rod(V(sx * 0.18, 0.44, 0.175), V(sx * 0.172, 0.83, 0.237), 0.0105), mt.frame);
      add(rod(V(sx * 0.193, 0.15, -0.176), V(sx * 0.193, 0.15, 0.194), 0.008), mt.frame);
      for (const z of [-0.18, 0.2]) add(cyl(0.014, 0.014, 0.012, 8), mt.glide, T(sx * 0.195, 0.006, z));
    }
    add(bx(0.36, 0.018, 0.34), mt.frame, T(0, 0.432, 0));
  });
}
function deskParts(mt: Mt): Part[] {
  return parts((add) => {
    add(bx(1.3, 0.03, 0.55), mt.lam, T(0, DESK_TOP - 0.015, 0));
    // dark T-mould edge band round the top (2 mm proud): a bold readable rim on every desk
    for (const sz of [-1, 1]) add(rb(1.316, 0.036, 0.008, 0.003, 1), mt.dark, T(0, DESK_TOP - 0.016, sz * 0.279));
    for (const sx of [-1, 1]) add(rb(0.008, 0.036, 0.55, 0.003, 1), mt.dark, T(sx * 0.654, DESK_TOP - 0.016, 0));
    for (const sx of [-1, 1]) {
      for (const sz of [-1, 1]) add(bx(0.035, 0.7, 0.035), mt.frame, T(sx * 0.6, 0.37, sz * 0.225));
      add(bx(0.04, 0.03, 0.52), mt.frame, T(sx * 0.6, 0.015, 0));
      add(bx(0.03, 0.035, 0.45), mt.frame, T(sx * 0.6, 0.7, 0));
      for (const sz of [-1, 1]) add(bx(0.044, 0.006, 0.05), mt.glide, T(sx * 0.6, 0.003, sz * 0.24));
    }
    add(bx(1.17, 0.035, 0.025), mt.frame, T(0, 0.7, -0.225));
    add(bx(1.17, 0.3, 0.008), mt.panel, T(0, 0.5, -0.232));
    add(bx(1.15, 0.008, 0.34), mt.frame, T(0, 0.595, -0.04));
    add(bx(1.15, 0.035, 0.008), mt.frame, T(0, 0.61, 0.13));
  });
}
const flatQuad = (w: number, h: number, uv?: [number, number, number, number]) => { const g = quad(w, h, uv); g.rotateX(-Math.PI / 2); return g; };
/** the rating card: an A4 plane lying on the desk, its header toward -z (readable from the seat) */
const cardParts = (m: THREE.Material): Part[] => [{ g: flatQuad(0.21, 0.297), m }];
/** pen lying along local x, resting on y = 0 */
const penParts = (mt: Mt): Part[] => parts((add) => {
  add(cyl(0.0045, 0.0045, 0.115, 8), mt.tPen, T(0, 0.0045, 0, 0, 0, Math.PI / 2));
  add(cyl(0.0012, 0.0045, 0.018, 8), mt.caps, T(-0.0665, 0.0045, 0, 0, 0, Math.PI / 2));
  add(cyl(0.0054, 0.0054, 0.042, 8), mt.tPen, T(0.04, 0.0047, 0, 0, 0, Math.PI / 2));
  add(bx(0.03, 0.002, 0.003), mt.caps, T(0.04, 0.0105, 0));
});
/** open laptop: base centred on the origin, hinge at the far (-z) edge, screen (atlas cell 0-3) facing +z */
const laptopParts = (mt: Mt, cell: number): Part[] => parts((add) => {
  add(rb(0.32, 0.016, 0.22, 0.005, 1), mt.tLaptop, T(0, 0.008, 0));
  add(flatQuad(0.28, 0.1), mt.keys, T(0, 0.0165, -0.03));
  add(flatQuad(0.09, 0.055), mt.dark, T(0, 0.0164, 0.065));
  const lid = T(0, 0.016, -0.11, 0, -0.3);
  add(bx(0.32, 0.215, 0.007), mt.tLaptop, at(lid, T(0, 0.1075, -0.0035)));
  const u0 = (cell % 2) * 0.5, v1 = 1 - Math.floor(cell / 2) * 0.5;
  add(quad(0.296, 0.185, [u0 + 0.005, v1 - 0.495, u0 + 0.495, v1 - 0.005]), mt.screens4, at(lid, T(0, 0.11, 0.0006)));
});
const cupParts = (mt: Mt): Part[] => parts((add) => {
  add(lathe([[0, 0], [0.029, 0], [0.03, 0.004], [0.04, 0.106], [0, 0.106]], 14), mt.white);
  add(cyl(0.0385, 0.0345, 0.045, 14, true), mt.sleeve, T(0, 0.06, 0));
  add(lathe([[0, 0], [0.043, 0], [0.043, 0.008], [0.036, 0.016], [0, 0.016]], 14), mt.lid, T(0, 0.103, 0));
});
const bottleParts = (mt: Mt, h = 0.23, r = 0.034): Part[] => parts((add) => {
  add(lathe([[0, 0], [r * 0.85, 0], [r, 0.012], [r, h * 0.72], [r * 0.82, h * 0.82], [r * 0.56, h * 0.88], [r * 0.56, h * 0.9], [0, h * 0.9]], 14), mt.tBottle);
  add(cyl(r * 0.62, r * 0.62, h * 0.12, 12), mt.caps, T(0, h * 0.95, 0));
});
const phoneParts = (mt: Mt): Part[] => parts((add) => {
  add(rb(0.075, 0.008, 0.155, 0.004, 1), mt.dark, T(0, 0.004, 0));
  add(flatQuad(0.067, 0.143), mt.phoneScr, T(0, 0.0082, 0));
});
const notebookParts = (mt: Mt): Part[] => parts((add) => {
  add(bx(0.15, 0.012, 0.21), mt.tCover, T(0, 0.006, 0));
  add(bx(0.145, 0.009, 0.205), mt.paper, T(0.004, 0.0065, 0));
});
/** a lanyard dropped on the desk: a flat ribbon loop with its badge (footprint ~0.1 x 0.19 m along z) */
const lanyardParts = (mt: Mt): Part[] => parts((add) => {
  add(rb(0.056, 0.003, 0.086, 0.002, 1), mt.badge, T(0, 0.0015, 0.055));
  add(flatQuad(0.05, 0.02), mt.tRibbon, T(0, 0.0032, 0.03));
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i < 24; i++) { const a = (i / 24) * Math.PI * 2; pts.push(V(Math.sin(a) * 0.045 * (1 - 0.35 * Math.cos(a)), 0.0018, 0.012 - (1 - Math.cos(a)) * 0.05)); }
  const rib = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, true), 48, 0.005, 4, true); rib.scale(1, 0.35, 1); W.metricGeo(rib);
  add(rib, mt.tRibbon);
  add(bx(0.012, 0.005, 0.016), mt.chrome, T(0, 0.003, 0.012));
});
/** tote bag hung on the chair back (chair-local space; clear of the back rods and the next row's desk) */
const toteParts = (mt: Mt): Part[] => parts((add) => {
  add(rb(0.32, 0.37, 0.045, 0.012, 1), mt.tBag, T(0, 0.555, 0.288, 0, -0.05));
  for (const sx of [-0.075, 0.075]) add(tube([V(sx, 0.735, 0.296), V(sx, 0.86, 0.275), V(sx, 0.885, 0.238), V(sx, 0.862, 0.212)], 0.007, 8, 4), mt.tBag);
});
/** jacket draped over the chair back (chair-local) */
const jacketParts = (mt: Mt): Part[] => parts((add) => {
  add(taperY(rb(0.42, 0.44, 0.05, 0.02, 1), -0.08), mt.tJacket, T(0, 0.6, 0.29, 0, -0.07));
  add(rb(0.42, 0.05, 0.075, 0.022, 1), mt.tJacket, T(0, 0.876, 0.242));
  for (const sx of [-1, 1]) add(rb(0.085, 0.42, 0.06, 0.025, 1), mt.tJacket, T(sx * 0.19, 0.55, 0.3, 0, -0.05, sx * 0.04));
});
/** backpack standing on the floor */
const backpackParts = (mt: Mt): Part[] => parts((add) => {
  add(taperY(rb(0.3, 0.4, 0.17, 0.065, 2), 0.16, 0.2), mt.tPack, T(0, 0.2, 0));
  add(rb(0.22, 0.17, 0.06, 0.026, 1), mt.tPack, T(0, 0.135, -0.098));
  add(bx(0.19, 0.008, 0.01), mt.trim, T(0, 0.212, -0.127));
  const h = new THREE.TorusGeometry(0.035, 0.008, 4, 8, Math.PI); W.metricGeo(h); add(h, mt.trim, T(0, 0.392, 0.01));
  for (const sx of [-1, 1]) add(bx(0.045, 0.34, 0.014), mt.trim, T(sx * 0.072, 0.21, 0.09, 0, -0.06));
});
function bottle(k: Kit, mx: THREE.Matrix4, body: THREE.Material, cap: THREE.Material, h = 0.23, r = 0.034) {
  k.add(lathe([[0, 0], [r * 0.85, 0], [r, 0.012], [r, h * 0.72], [r * 0.82, h * 0.82], [r * 0.56, h * 0.88], [r * 0.56, h * 0.9], [0, h * 0.9]], 14), body, mx);
  k.add(cyl(r * 0.62, r * 0.62, h * 0.12, 12), cap, at(mx, T(0, h * 0.95, 0)));
}
function plantLeaves(k: Kit, mt: Mt, R: () => number, base: THREE.Matrix4, n: number, h0: number, h1: number, len: [number, number], spread = 1) {
  for (let i = 0; i < n; i++) {
    const t = i / n, y = h0 + (h1 - h0) * Math.pow(t, 0.85), az = i * 2.4 + R() * 0.6, l = len[0] + (len[1] - len[0]) * (1 - 0.5 * t) * (0.8 + 0.4 * R());
    const tilt = (0.2 + 0.5 * R()) * spread, w = l * (0.55 + 0.15 * R());
    k.add(leafGeo(l, w, 0.28, 0.3 + 0.25 * R()), mt.leaf, at(base, T(0, y, 0, az, 0, tilt)));
  }
}
function pottedPlant(k: Kit, mt: Mt, R: () => number, mx: THREE.Matrix4, big: boolean) {
  if (big) {
    k.add(lathe([[0, 0], [0.15, 0], [0.19, 0.36], [0.205, 0.38], [0.205, 0.42], [0.185, 0.42], [0.18, 0.39], [0, 0.39]], 22), mt.pot, mx);
    k.add(cyl(0.18, 0.18, 0.01, 20), mt.soil, at(mx, T(0, 0.39, 0)));
    k.add(tube([V(0, 0.38, 0), V(0.03, 0.9, 0.02), V(-0.02, 1.4, 0.04), V(0.02, 1.75, 0)], 0.022, 10, 6), mt.trunk, mx);
    k.add(tube([V(0.02, 1.0, 0.02), V(0.2, 1.25, -0.05), V(0.32, 1.45, -0.06)], 0.012, 6, 5), mt.trunk, mx);
    plantLeaves(k, mt, R, mx, 26, 0.7, 1.8, [0.3, 0.38], 1);
    plantLeaves(k, mt, R, at(mx, T(0.3, 0, -0.05)), 7, 1.3, 1.55, [0.22, 0.28], 0.9);
  } else {
    k.add(lathe([[0, 0], [0.055, 0], [0.07, 0.1], [0.075, 0.11], [0, 0.11]], 14), mt.terracotta, mx);
    k.add(cyl(0.066, 0.066, 0.005, 12), mt.soil, at(mx, T(0, 0.105, 0)));
    plantLeaves(k, mt, R, mx, 9, 0.11, 0.2, [0.09, 0.13], 1.6);
  }
}
function cactus(k: Kit, mt: Mt, mx: THREE.Matrix4) {
  k.add(lathe([[0, 0], [0.045, 0], [0.055, 0.08], [0.058, 0.09], [0, 0.09]], 12), mt.terracotta, mx);
  const c = new THREE.CapsuleGeometry(0.03, 0.1, 4, 10); W.metricGeo(c); k.add(c, mt.cactus, at(mx, T(0, 0.17, 0)));
  const a = new THREE.CapsuleGeometry(0.016, 0.04, 3, 8); W.metricGeo(a); k.add(a, mt.cactus, at(mx, T(0.035, 0.18, 0, 0, 0, -0.9)));
  const b = new THREE.CapsuleGeometry(0.014, 0.03, 3, 8); W.metricGeo(b); k.add(b, mt.cactus, at(mx, T(-0.03, 0.2, 0, 0, 0, 0.9)));
}
/** a row of books standing along local z from z0, on a shelf at y; returns the end z */
function bookRow(k: Kit, mt: Mt, R: () => number, mx: THREE.Matrix4, z0: number, z1: number, depth: number, hMax: number) {
  const pal = ["#d9503f", "#3d6fc4", "#e9b43e", "#4f9a62", "#7a5cb4", "#3aa3a0", "#ef8a5a", "#2f3a56", "#c9c2b0", "#9b4a3a"].map((c) => new THREE.Color(c));
  const page = new THREE.Color("#f2ead6");
  let z = z0;
  while (z < z1 - 0.03) {
    if (R() < 0.08) { z += 0.04 + 0.06 * R(); continue; }
    const w = 0.022 + 0.04 * R(), h = hMax * (0.62 + 0.38 * R()), d = depth * (0.75 + 0.25 * R()), col = pal[Math.floor(R() * pal.length)];
    const lean = z + w > z1 - 0.06 && R() < 0.5 ? 0.25 : 0;
    k.add(colorBox(d, h, w, col.clone().multiplyScalar(0.85), page, col), mt.books, at(mx, T(0, h / 2, z + w / 2, 0, lean)));
    z += w + 0.002;
  }
}
/** a casement sash (white frame, faint glass, lever handle on the room side of the free stile). Local space: the
 *  pivot (outer face of the hinge stile) at the origin, the sash body at x 0..0.05, y 0..h, z 0..w*dir. */
function casement(k: Kit, mt: Mt, mx: THREE.Matrix4, w: number, h: number, dir: number) {
  const f = 0.05, d = 0.05, z = (v: number) => v * dir;
  k.add(bx(d, f, w), mt.white, at(mx, T(d / 2, f / 2, z(w / 2)))); k.add(bx(d, f, w), mt.white, at(mx, T(d / 2, h - f / 2, z(w / 2))));
  k.add(bx(d, h - 2 * f, f), mt.white, at(mx, T(d / 2, h / 2, z(f / 2)))); k.add(bx(d, h - 2 * f, f), mt.white, at(mx, T(d / 2, h / 2, z(w - f / 2))));
  k.add(quad(w - 2 * f + 0.01, h - 2 * f + 0.01), mt.glass, at(mx, T(d / 2, h / 2, z(w / 2), Math.PI / 2)));
  k.add(bx(0.016, 0.034, 0.03), mt.chrome, at(mx, T(d + 0.008, h * 0.5, z(w - f / 2))));
  k.add(bx(0.014, 0.12, 0.016), mt.chrome, at(mx, T(d + 0.024, h * 0.5 - 0.045, z(w - f / 2))));
}
/** toon tree crown lobe: an icosphere with three flat tones by face (lit / body / shade, light from the sun side) */
function crownLobe(r: number, hue: number, R: () => number) {
  const g = new THREE.IcosahedronGeometry(r, 2).toNonIndexed(), p = g.getAttribute("position"), col = new Float32Array(p.count * 3);
  const L = V(-0.62, 0.7, 0.36).normalize(), a = V(0, 0, 0), b = V(0, 0, 0), c = V(0, 0, 0), n = V(0, 0, 0);
  const tones = hue < 0.5 ? ["#3d8450", "#55a85c", "#82cc72"] : ["#4a8a3e", "#6cb04e", "#a2d468"];
  const cs = tones.map((t) => new THREE.Color(t));
  for (let i = 0; i < p.count; i += 3) {
    a.fromBufferAttribute(p, i); b.fromBufferAttribute(p, i + 1); c.fromBufferAttribute(p, i + 2);
    n.subVectors(c, b).cross(a.clone().sub(b)).normalize();
    const d = n.dot(L) + (R() - 0.5) * 0.12, cc = d > 0.42 ? cs[2] : d > -0.15 ? cs[1] : cs[0];
    for (let j = 0; j < 3; j++) { col[(i + j) * 3] = cc.r; col[(i + j) * 3 + 1] = cc.g; col[(i + j) * 3 + 2] = cc.b; }
  }
  g.setAttribute("color", new THREE.BufferAttribute(col, 3)); g.computeVertexNormals();
  return g;
}

// =====================================================================================================================
// the set
// =====================================================================================================================
export type ClassroomOpts = {
  seed?: number;
  /** group-project film: no rating cards on the desks (the hero card object still exists: hide it), a blank board */
  noCards?: boolean;
  /** soft additive light shafts from the windows (NOINK, no depth write). default true */
  beams?: boolean;
  /** override CLASSROOM_SUN.intensity */
  sunIntensity?: number;
  /** override CLASSROOM_SUN.dir (towards the sun) */
  sunDir?: V3;
  /** per-window blinds (5 windows, front to back); default BLINDS (window 0, the front-most, the one that opens, has its blind up) */
  blinds?: { drop: number; tilt: number; raised?: boolean }[];
  /** four ceiling fans on the removable ceiling (default false) */
  fans?: boolean;
  /** ceiling fan speed in turns per second (default 0.35: a slow, strobe-free turn at 30 fps; 0 = still) */
  fanSpeed?: number;
  /** the campus outside (lawn, trees, the teaching block across the lawn, the neighbouring roofs, sky). default true */
  exterior?: boolean;
};
/** a seat: `pos` is where a seated figure's hip sits (on the seat, y 0.472), `facing` its yaw (0 = facing the board,
 *  -z; positive turns toward -x), `dir` the unit facing vector, `feet` the floor point under the knees */
export type SeatAnchor = { i: number; row: number; col: number; side: 0 | 1; pos: THREE.Vector3; facing: number; dir: THREE.Vector3; feet: THREE.Vector3 };
/** a desk card: centre of the card's top face on the desk (an A4 sheet 0.21 x 0.297 m; its centre 0.10 m from the desk's
 *  centre line toward the sitter, 0.115 m when that seat has a laptop, so its near edge is 1-3 cm inside the desk edge
 *  nearest the hip), its yaw (0 = header toward the board), the pen position */
export type CardAnchor = { i: number; pos: THREE.Vector3; yaw: number; pen: THREE.Vector3 };
export type WindowAnchor = {
  /** centre of the opening casement pair (frame plane), the inner sill top centre, a point 2.5 m outside at eye level */
  centre: THREE.Vector3; sill: THREE.Vector3; outside: THREE.Vector3;
  /** outward normal (-x), clear opening width/height when open, bottom/top of the clear opening (y), centre z */
  normal: THREE.Vector3; width: number; height: number; bottom: number; top: number; z: number;
};
export type ClassroomAnchors = {
  /** 84 seats: index = row * 12 + col * 2 + side (row 0 = front, col 0 = window side, side 0 = left/-x) */
  seats: SeatAnchor[];
  /** the rating card on the desk in front of each seat (same index); seat `you` has the hero card object instead */
  cards: CardAnchor[];
  /** the protagonist's seat (middle row, centre block) with the seat indices of the neighbours left and right */
  you: SeatAnchor & { neighbours: [number, number] };
  /** knot point on the exposed heating riser that climbs from window 3's radiator (the 4th from the front), on its
   *  room side at y 1.0, in line with the lane behind row 3's chairs; and the index of the seat nearest to it (36, hip
   *  ~1.15 m away: reachable leaning over from the seat) */
  radiatorTie: THREE.Vector3; radiatorSeat: number;
  /** line 07's taut rope from `you` to the radiator: [hand, knot]. hand = directly behind your left shoulder (0.28 m
   *  behind the hip, y 1.0, over the chair back); the straight segment runs level through the gap between row 3's
   *  chair backs (and their totes / jackets, all under 0.9 m) and row 4's desks and their props (raycast-checked clear
   *  for a 2 cm rope). Any hand point on this line between x -0.3 and the knot keeps it clear. */
  radiatorRoute: THREE.Vector3[];
  /** the researcher's aisle walk, front (in front of the dais) to back, one point per row in between (floor, y 0) */
  researcherPath: THREE.Vector3[];
  /** x of the two inner aisles (window side, door side) */
  aisleX: number[];
  /** where a figure stands on the dais in the open window's sun patch (feet, y = dais top: the sun through the opening
   *  covers a standing figure from the feet to ~1.55 m above the dais); platformTop = dais height */
  platform: THREE.Vector3; platformTop: number;
  windowOut: WindowAnchor;
  lecturer: THREE.Vector3; door: THREE.Vector3; doorBack: THREE.Vector3;
};
export type ClassroomSet = {
  group: THREE.Group;
  anchors: ClassroomAnchors;
  /** vertical 9:16 framings (see the header) */
  cams: Record<string, Cam>;
  /** [sun, sun.target]: add both to the scene */
  lights: THREE.Object3D[];
  /** clock hands and fans (call each frame with seconds) */
  animate: (t: number) => void;
  /** 0 = ceiling in place, 1 = gone: lifts 1.3 m over u 0-0.3, then slides 15 m toward +x (hidden at 1). The light in
   *  the room does not change (a shadow-only roof stays). */
  setCeilingOpen: (u: number) => void;
  /** 0 = closed, 1 = both casements of the front-most window open 80 deg outward (clear opening anchors.windowOut) */
  setWindowOpen: (u: number) => void;
  /** 0 = off, 1 = full: the bright shaft of sun from the open window onto the dais, its pool of light and the dust
   *  motes in it (the real sun patch is always there; this adds the visible beam, glow and motes) */
  setShaft: (u: number) => void;
  objects: {
    ceiling: THREE.Group; sashes: THREE.Group[]; shaft: THREE.Group; heroSheet: THREE.Mesh; heroPen: THREE.Group; clockHands: THREE.Group;
    fans: THREE.Group[]; sun: THREE.DirectionalLight; beams: THREE.Group; sky: THREE.Group; outside: THREE.Group; shadowRoof: THREE.Mesh; backHands: THREE.Group;
  };
  /** group film (noCards): the back-wall clock face (centre on the face, radius incl. bezel, normal into the room) */
  backClock: { centre: THREE.Vector3; radius: number; normal: THREE.Vector3 };
  tris: number;
};

export function classroom(M: Mats, opts: ClassroomOpts = {}): ClassroomSet {
  const R = rng(opts.seed ?? 2026), group = new THREE.Group(), k = new Kit(), mt = makeMaterials(M, !!opts.noCards);
  group.name = "classroom";
  const noCast = new Set<THREE.Material>([mt.lights, mt.exit, mt.led, mt.screen, mt.laptopScr, mt.screens4, mt.glass, mt.phoneScr]);
  const blinds = opts.blinds ?? BLINDS;
  const I = new THREE.Matrix4();
  let tris = 0;

  // ---------------- shell: floor, accent band, block walls (teal dado below DADO, cream above), wall caps ----------------
  const slab = (x0: number, x1: number, y0: number, y1: number, z0: number, z1: number, upper: THREE.Material = mt.wallC) => {
    const ps: [number, number, THREE.Material][] = [];
    if (y0 < DADO) ps.push([y0, Math.min(y1, DADO), mt.wallT]);
    if (y1 > DADO) ps.push([Math.max(y0, DADO), y1, upper]);
    for (const [a, b, m] of ps) worldUV(k.add(new THREE.BoxGeometry(x1 - x0, b - a, z1 - z0), m, T((x0 + x1) / 2, (a + b) / 2, (z0 + z1) / 2)), 0, -0.05);
  };
  worldUV(k.add(new THREE.BoxGeometry(X1 - X0 + 2 * WT, 0.2, Z1 - Z0 + 2 * WT), mt.floor, T(0, -0.1, 0)), -X0, Z1);
  for (const [x0, x1, z0, z1] of [[X0 + 0.3, X1 - 0.3, DAIS.z1 + 0.15, DAIS.z1 + 0.45], [X0 + 0.3, X1 - 0.3, Z1 - 0.6, Z1 - 0.3], [X0 + 0.3, X0 + 0.6, DAIS.z1 + 0.45, Z1 - 0.6], [X1 - 0.6, X1 - 0.3, DAIS.z1 + 0.45, Z1 - 0.6]]) {
    const g = new THREE.PlaneGeometry(x1 - x0, z1 - z0); g.rotateX(-Math.PI / 2);
    worldUV(k.add(g, mt.floorAcc, T((x0 + x1) / 2, 0.0015, (z0 + z1) / 2)), -X0, Z1);
  }
  slab(X0 - WT, X1 + WT, 0, TOPI, Z0 - WT, Z0, mt.wallY); // the board wall: the sunflower accent wall
  slab(X0 - WT, X1 + WT, 0, TOPI, Z1, Z1 + WT);
  slab(X1, X1 + WT, 0, TOPI, Z0, DOORS[0][0]); slab(X1, X1 + WT, 0, TOPI, DOORS[0][1], DOORS[1][0]); slab(X1, X1 + WT, 0, TOPI, DOORS[1][1], Z1);
  for (const [a, b] of DOORS) slab(X1, X1 + WT, DH, TOPI, a, b);
  slab(X0 - WT, X0, 0, SILL, Z0, Z1); slab(X0 - WT, X0, HEAD, PARAPET, Z0 - WT, Z1 + WT);
  const wz = [Z0, ...WIN_Z.flatMap((z) => [z - WIN_W / 2, z + WIN_W / 2]), Z1];
  for (let i = 0; i < wz.length; i += 2) slab(X0 - WT, X0, SILL, HEAD, wz[i], wz[i + 1]);
  // caps: the wall tops seen from above when the ceiling is off (internal walls 5 cm proud of the roof, the window wall a parapet)
  const cap = (x0: number, x1: number, z0: number, z1: number, y: number) => k.add(bx(x1 - x0, 0.05, z1 - z0), mt.cap, T((x0 + x1) / 2, y + 0.025, (z0 + z1) / 2));
  cap(X0, X1 + WT + 0.02, Z0 - WT - 0.02, Z0 + 0.02, TOPI); cap(X0, X1 + WT + 0.02, Z1 - 0.02, Z1 + WT + 0.02, TOPI);
  cap(X1 - 0.02, X1 + WT + 0.02, Z0 + 0.02, Z1 - 0.02, TOPI);
  cap(X0 - WT - 0.04, X0 + 0.02, Z0 - WT - 7, Z1 + WT + 7, PARAPET);

  // ---------------- windows: casement frames, sills, venetian blinds, radiators and their pipework ----------------
  const xF = X0 - 0.13, sashW = WIN_W / 2 - 0.06, sashY0 = SILL + 0.06, sashH = TRANSOM - 0.025 - sashY0;
  const sashes: THREE.Group[] = [];
  let radiatorTie = V(0, 0, 0);
  WIN_Z.forEach((z, i) => {
    const mid = (SILL + HEAD) / 2, hh = HEAD - SILL;
    k.add(bx(0.07, 0.06, WIN_W), mt.white, T(xF, HEAD - 0.03, z)); k.add(bx(0.07, 0.06, WIN_W), mt.white, T(xF, SILL + 0.03, z));
    for (const s of [-1, 1]) k.add(bx(0.07, hh, 0.06), mt.white, T(xF, mid, z + s * (WIN_W / 2 - 0.03)));
    k.add(bx(0.07, 0.05, WIN_W - 0.12), mt.white, T(xF, TRANSOM, z));                                            // transom
    k.add(bx(0.05, HEAD - 0.06 - TRANSOM - 0.025, 0.04), mt.white, T(xF, (HEAD - 0.06 + TRANSOM + 0.025) / 2, z)); // fanlight bar
    k.add(quad(WIN_W - 0.12, HEAD - 0.06 - TRANSOM - 0.025), mt.glass, T(xF, (HEAD - 0.06 + TRANSOM + 0.025) / 2, z, Math.PI / 2));
    // casements: hinged at the jambs, opening outward; window WIN_OPEN's pair are their own groups (setWindowOpen)
    for (const dir of [1, -1]) {
      const pivot = T(xF - 0.025, sashY0, z - dir * sashW);
      if (i === WIN_OPEN) {
        const sg = new THREE.Group(); sg.name = `classroom:sash${dir > 0 ? "L" : "R"}`; sg.position.setFromMatrixPosition(pivot); sg.userData.dir = dir;
        const ks = new Kit(); casement(ks, mt, I, sashW, sashH, dir); tris += ks.bake(sg, noCast);
        for (const c of sg.children) if ((c as THREE.Mesh).material === mt.glass) { c.layers.set(NOINK); c.renderOrder = 5; }
        group.add(sg); sashes.push(sg);
      } else casement(k, mt, pivot, sashW, sashH, dir);
    }
    k.add(bx(0.22, 0.032, WIN_W + 0.12), mt.offwhite, T(X0 - 0.06, SILL + 0.016, z));                 // interior sill
    k.add(bx(0.14, 0.04, WIN_W + 0.1), mt.alu, T(X0 - WT - 0.04, SILL - 0.04, z));                     // exterior sill
    // blinds
    const b = blinds[i], xb = X0 - 0.045;
    k.add(bx(0.05, 0.045, WIN_W - 0.03), mt.white, T(xb, HEAD - 0.03, z));
    if (b.raised) {
      k.add(bx(0.034, 0.1, WIN_W - 0.06), mt.white, T(xb, HEAD - 0.1, z)); k.add(bx(0.036, 0.016, WIN_W - 0.05), mt.white, T(xb, HEAD - 0.158, z));
    } else {
      for (let y = HEAD - 0.09; y > b.drop; y -= 0.09) k.add(bx(0.08, 0.003, WIN_W - 0.07), mt.slat, T(xb + 0.015, y, z, 0, 0, b.tilt));
      k.add(bx(0.034, 0.016, WIN_W - 0.06), mt.white, T(xb, b.drop - 0.012, z));
      for (const s of [-1, 1]) k.add(bx(0.002, HEAD - b.drop, 0.008), mt.offwhite, T(xb + 0.016, (HEAD + b.drop) / 2, z + s * (WIN_W / 2 - 0.28)));
    }
    k.add(cyl(0.006, 0.006, 0.75, 6), mt.white, T(xb + 0.035, HEAD - 0.42, z + WIN_W / 2 - 0.12));
    // radiator, valves and the exposed pipework: the flow comes out of the +z end at 0.6 m, runs 0.26 m along the wall
    // and drops to the floor (that horizontal run is the rope's tie point); the return drops from the -z end
    const rx = X0 + 0.07;
    k.add(bx(0.075, 0.5, 1.2), mt.fin, T(X0 + 0.085, 0.42, z));
    k.add(bx(0.08, 0.012, 1.2), mt.offwhite, T(X0 + 0.085, 0.676, z));
    for (const s of [-1, 1]) k.add(bx(0.05, 0.03, 0.03), mt.offwhite, T(X0 + 0.025, 0.55, z + s * 0.45));
    if (i === RAD_WIN) {
      // the tie radiator (window 3): its flow leaves the -z (front) end at 0.6 m, runs along the wall to the exposed
      // riser at RISER_Z (in the clear lane behind row 3's chairs) which climbs from the floor into the ceiling void.
      // The knot sits on the riser at TIE_Y, so a taut rope from `you` runs level through the lane (anchors.radiatorRoute).
      const rr = rx + 0.012, fz = RISER_Z;
      k.add(rod(V(rx, 0.6, z - 0.6), V(rx, 0.6, fz + 0.03), 0.014, 10), mt.white);
      k.add(new THREE.SphereGeometry(0.016, 10, 8), mt.white, T(rr, 0.6, fz));                                   // tee
      k.add(rod(V(rr, 0.6, fz + 0.03), V(rr, 0.6, fz), 0.014, 10), mt.white);
      k.add(rod(V(rr, 0, fz), V(rr, PLEN - 0.12, fz), 0.016, 12), mt.white);                                     // riser
      k.add(new THREE.SphereGeometry(0.017, 10, 8), mt.white, T(rr, PLEN - 0.12, fz));
      k.add(rod(V(rr, PLEN - 0.12, fz), V(X0 - 0.02, PLEN - 0.12, fz), 0.016, 10), mt.white);                    // elbow into the wall
      for (const y of [0.25, 1.75, 2.75]) k.add(bx(0.07, 0.022, 0.034), mt.chrome, T(X0 + 0.035, y, fz));       // pipe clips (none near the knot)
      k.add(cyl(0.021, 0.021, 0.05, 12), mt.chrome, T(rx, 0.6, z - 0.665, 0, Math.PI / 2));                    // valve body
      k.add(cyl(0.024, 0.026, 0.07, 14), mt.white, T(rx, 0.64, z - 0.665)); k.add(cyl(0.02, 0.02, 0.012, 12), mt.dark, T(rx, 0.681, z - 0.665));
      k.add(rod(V(rx, 0.2, z + 0.6), V(rx, 0.2, z + 0.7), 0.012, 8), mt.white); k.add(rod(V(rx, 0.2, z + 0.7), V(rx, 0, z + 0.7), 0.012, 8), mt.white);
      k.add(cyl(0.018, 0.018, 0.04, 10), mt.chrome, T(rx, 0.2, z + 0.65, 0, Math.PI / 2));
      radiatorTie = V(rr + 0.016, TIE_Y, fz);
    } else {
      k.add(rod(V(rx, 0.6, z + 0.6), V(rx, 0.6, z + 0.86), 0.014, 10), mt.white);
      k.add(new THREE.SphereGeometry(0.0145, 10, 8), mt.white, T(rx, 0.6, z + 0.86));
      k.add(rod(V(rx, 0.6, z + 0.86), V(rx, 0, z + 0.86), 0.014, 10), mt.white);
      k.add(cyl(0.021, 0.021, 0.05, 12), mt.chrome, T(rx, 0.6, z + 0.665, 0, Math.PI / 2));                      // valve body
      k.add(cyl(0.024, 0.026, 0.07, 14), mt.white, T(rx, 0.64, z + 0.665)); k.add(cyl(0.02, 0.02, 0.012, 12), mt.dark, T(rx, 0.681, z + 0.665)); // thermostat head
      for (const y of [0.12, 0.38]) k.add(bx(0.07, 0.02, 0.03), mt.chrome, T(X0 + 0.035, y, z + 0.86));         // pipe clips
      k.add(rod(V(rx, 0.2, z - 0.6), V(rx, 0.2, z - 0.7), 0.012, 8), mt.white); k.add(rod(V(rx, 0.2, z - 0.7), V(rx, 0, z - 0.7), 0.012, 8), mt.white);
      k.add(cyl(0.018, 0.018, 0.04, 10), mt.chrome, T(rx, 0.2, z - 0.65, 0, Math.PI / 2));
    }
  });
  // small posters on the window piers
  ([[-3.225, cellUV(5, 0.04)], [-1.075, cellUV(0, 0.06)], [1.075, cellUV(1, 0.04)], [3.225, cellUV(2, 0.06)]] as const).forEach(([z, uv], i) => k.add(quad(0.24, 0.32, uv as [number, number, number, number]), mt.print, T(X0 + 0.004, 1.72, z, Math.PI / 2, 0, [0.02, -0.015, 0.01, -0.02][i])));
  // window-sill props, only under blinds raised clear of them (window 0, the one that opens, stays clear)
  cactus(k, mt, T(X0 - 0.05, SILL + 0.032, WIN_Z[3] - 0.4));
  pottedPlant(k, mt, R, T(X0 - 0.06, SILL + 0.032, WIN_Z[4] + 0.45), false);
  for (let j = 0; j < 3; j++) k.add(colorBox(0.16, 0.03, 0.23, new THREE.Color(["#3d6fc4", "#e9b43e", "#d9503f"][j]), new THREE.Color("#f2ead6")), mt.books, T(X0 - 0.05, SILL + 0.032 + 0.015 + j * 0.03, WIN_Z[4] - 0.45, 0.1 * j - 0.1));
  bottle(k, T(X0 - 0.06, SILL + 0.032, WIN_Z[4] - 0.15), mt.bottles[0], mt.caps);

  // ---------------- wall trim: rubber skirting, wooden dado rail, cable trunking with sockets ----------------
  const alongX = (z: number, dz: number, y: number, h: number, d: number, m: THREE.Material, x0 = X0, x1 = X1) => k.add(bx(x1 - x0, h, d), m, T((x0 + x1) / 2, y, z + dz * d / 2));
  const alongZ = (x: number, dx: number, y: number, h: number, d: number, m: THREE.Material, z0: number, z1: number) => k.add(bx(d, h, z1 - z0), m, T(x + dx * d / 2, y, (z0 + z1) / 2));
  alongX(Z0, 1, 0.05, 0.1, 0.012, mt.skirting, X0, DAIS.x0); alongX(Z0, 1, 0.05, 0.1, 0.012, mt.skirting, DAIS.x1, X1);
  alongX(Z0, 1, DAIS.h + 0.05, 0.1, 0.012, mt.skirting, DAIS.x0, DAIS.x1);
  alongX(Z1, -1, 0.05, 0.1, 0.012, mt.skirting);
  for (const [z, dz] of [[Z0, 1], [Z1, -1]] as const) alongX(z, dz, DADO, 0.05, 0.022, mt.lamD);
  alongX(Z1, -1, 0.31, 0.06, 0.04, mt.white, X0 + 0.7, X1 - 0.02);
  alongZ(X0, 1, 0.05, 0.1, 0.012, mt.skirting, Z0, Z1);
  for (let i = 0; i < wz.length; i += 2) alongZ(X0, 1, SILL + 0.005, 0.045, 0.022, mt.lamD, wz[i], wz[i + 1]);
  for (const [z0, z1] of [[Z0, DOORS[0][0] - 0.07], [DOORS[0][1] + 0.07, DOORS[1][0] - 0.07], [DOORS[1][1] + 0.07, Z1]]) {
    alongZ(X1, -1, 0.05, 0.1, 0.012, mt.skirting, z0, z1); alongZ(X1, -1, DADO, 0.05, 0.022, mt.lamD, z0, z1);
    if (z1 - z0 > 1) alongZ(X1, -1, 0.31, 0.06, 0.04, mt.white, z0 + 0.02, z1 - 0.02);
  }
  const socket = (mx: THREE.Matrix4) => { k.add(bx(0.085, 0.085, 0.014), mt.white, mx); for (const s of [-1, 1]) k.add(bx(0.012, 0.012, 0.004), mt.dark, at(mx, T(s * 0.018, 0, 0.008))); };
  for (const x of [-3.8, 0.9, 3.4]) socket(T(x, DAIS.h + 0.35, Z0 + 0.007));
  for (const x of [-3.9, -1.0, 2.0, 4.6]) socket(T(x, 0.31, Z1 - 0.047, Math.PI));
  for (const z of [-0.4, 1.5, 4.0]) socket(T(X1 - 0.047, 0.31, z, -Math.PI / 2));

  // ---------------- the dais (teacher's platform): teal riser, wood top, aluminium nosing ----------------
  {
    const { x0, x1, z1, h } = DAIS, cx = (x0 + x1) / 2, cz = (Z0 + z1) / 2, w = x1 - x0, d = z1 - Z0;
    k.add(bx(w, h - 0.02, d), mt.daisRiser, T(cx, (h - 0.02) / 2, cz));
    k.add(bx(w, 0.02, d), mt.lamD, T(cx, h - 0.01, cz));
    k.add(bx(w + 0.012, 0.022, 0.03), mt.alu, T(cx, h - 0.011, z1 - 0.009));
    for (const s of [x0, x1]) k.add(bx(0.03, 0.022, d), mt.alu, T(s + (s === x0 ? 0.009 : -0.009), h - 0.011, cz));
    k.add(bx(w + 0.004, 0.04, 0.006), mt.glide, T(cx, 0.02, z1 + 0.003)); // rubber kick strip
  }

  // ---------------- board wall: three-panel board + tray, clock, framed prints, screen, speakers, calendar ----------------
  {
    const { x, w, y0, y1, wing } = BOARD, h = y1 - y0, W3 = w + 2 * wing, z = Z0;
    k.add(bx(W3 + 0.06, h + 0.06, 0.016), mt.alu, T(x, (y0 + y1) / 2, z + 0.008));
    k.add(quad(w, h), mt.board, T(x, (y0 + y1) / 2, z + 0.0165));
    for (const s of [-1, 1]) {
      k.add(quad(wing, h), mt.wing, T(x + s * (w / 2 + wing / 2), (y0 + y1) / 2, z + 0.0165));
      k.add(bx(0.03, h, 0.03), mt.alu, T(x + s * (w / 2), (y0 + y1) / 2, z + 0.017));                        // panel joints
      k.add(bx(0.045, h + 0.07, 0.034), mt.alu, T(x + s * (W3 / 2 + 0.022), (y0 + y1) / 2, z + 0.017));
    }
    k.add(bx(W3 + 0.11, 0.045, 0.034), mt.alu, T(x, y1 + 0.02, z + 0.017));
    k.add(bx(W3 + 0.11, 0.02, 0.09), mt.alu, T(x, y0 - 0.012, z + 0.045)); k.add(bx(W3 + 0.11, 0.032, 0.012), mt.alu, T(x, y0 + 0.002, z + 0.088));
    for (let i = 0; i < 9; i++) {
      const cx = x - W3 / 2 + 0.25 + R() * (W3 - 0.5), l = 0.03 + 0.05 * R();
      k.add(cyl(0.0058, 0.0058, l, 8), mt.chalk[i % 3], T(cx, y0 + 0.0042, z + 0.055 + R() * 0.02, (R() - 0.5) * 0.8, 0, Math.PI / 2));
    }
    for (const ex of [x - 1.6, x + 1.2]) { k.add(bx(0.14, 0.028, 0.052), mt.lamD, T(ex, y0 + 0.024, z + 0.055, 0.15)); k.add(bx(0.14, 0.012, 0.052), mt.felt, T(ex, y0 + 0.004, z + 0.055, 0.15)); }
    k.add(cyl(0.185, 0.185, 0.05, 36), mt.dark, T(x, 2.76, z + 0.025, 0, Math.PI / 2));
    k.add(new THREE.CircleGeometry(0.163, 40), mt.clock, T(x, 2.76, z + 0.0505));
    // four framed prints flanking the clock: concert poster, course timetable | art print, talk-series poster
    const frame = (fx: number, fy: number, fw: number, fh: number, rz: number, cell: number) => {
      const mx = at(T(fx, fy, z), T(0, 0, 0, 0, 0, rz)), fr = 0.03, fd = 0.028;
      k.add(quad(fw, fh, [(cell % 2) / 2, 0.5 - Math.floor(cell / 2) / 2, (cell % 2) / 2 + 0.5, 1 - Math.floor(cell / 2) / 2]), mt.prints, at(mx, T(0, 0, fd - 0.004)));
      for (const sy of [-1, 1]) k.add(bx(fw + 2 * fr, fr, fd), mt.dark, at(mx, T(0, sy * (fh / 2 + fr / 2), fd / 2)));
      for (const sx of [-1, 1]) k.add(bx(fr, fh, fd), mt.dark, at(mx, T(sx * (fw / 2 + fr / 2), 0, fd / 2)));
      k.add(bx(fw, fh, 0.006), mt.dark, at(mx, T(0, 0, 0.003)));
    };
    [[x - 1.72, 0], [x - 1.0, 1], [x + 1.0, 2], [x + 1.72, 3]].forEach(([fx, cell], i) => frame(fx, 2.76, 0.48, 0.345, [0.012, -0.008, 0.006, -0.014][i], cell));
  }
  {
    const sx = SCREEN_X, z = Z0 + 0.1;
    k.add(cyl(0.065, 0.065, 2.02, 14), mt.white, T(sx, 3.05, z, 0, 0, Math.PI / 2));
    for (const s of [-1, 1]) { k.add(cyl(0.069, 0.069, 0.03, 14), mt.dark, T(sx + s * 1.02, 3.05, z, 0, 0, Math.PI / 2)); k.add(bx(0.04, 0.06, 0.1), mt.dark, T(sx + s * 0.92, 3.08, Z0 + 0.05)); }
    k.add(quad(1.84, 1.24), mt.screen, T(sx, 2.36, z));
    k.add(cyl(0.013, 0.013, 1.88, 8), mt.dark, T(sx, 1.735, z, 0, 0, Math.PI / 2)); k.add(bx(0.03, 0.07, 0.008), mt.dark, T(sx, 1.69, z));
  }
  for (const [x, ry] of [[X0 + 0.24, 0.7], [X1 - 0.24, -0.7]] as const) {
    const mx = T(x, 2.82, Z0 + 0.16, ry, 0.15);
    k.add(rb(0.22, 0.32, 0.17, 0.02, 1), mt.dark, mx); k.add(quad(0.18, 0.27), mt.spk, at(mx, T(0, 0, 0.0855)));
    k.add(bx(0.04, 0.04, 0.12), mt.dark, T(x, 2.82, Z0 + 0.06));
  }
  k.add(quad(0.52, 0.52, cellUV(6)), mt.print, T(-4.45, 1.75, Z0 + 0.004));
  k.add(quad(0.34, 0.48, cellUV(2, 0.06)), mt.print, T(5.25, 1.55, Z0 + 0.004, 0, 0, 0.02));

  // ---------------- surface conduit: a white run under the ceiling (board + door walls) with drops ----------------
  {
    const yC = HC - 0.1, r = 0.012, jb = (p: THREE.Vector3) => k.add(rb(0.09, 0.09, 0.045, 0.008, 1), mt.offwhite, T(p.x, p.y, p.z));
    const runs: [THREE.Vector3, THREE.Vector3][] = [
      [V(X0 + 0.28, yC, Z0 + 0.03), V(X1 - 0.03, yC, Z0 + 0.03)],
      [V(X1 - 0.03, yC, Z0 + 0.03), V(X1 - 0.03, yC, Z1 - 0.3)],
      [V(X1 - 0.03, yC, DOORS[0][1] + 0.2), V(X1 - 0.03, 1.2, DOORS[0][1] + 0.2)],
      [V(X1 - 0.03, yC, DOORS[1][0] - 0.2), V(X1 - 0.03, 1.2, DOORS[1][0] - 0.2)],
      [V(X1 - 0.03, yC, 0.6), V(X1 - 0.03, 2.97, 0.6)],
      [V(X0 + 0.28, yC, Z0 + 0.03), V(X0 + 0.28, 2.98, Z0 + 0.03)],
    ];
    for (const [a0, a1] of runs) k.add(rod(a0, a1, r, 8), mt.offwhite);
    for (const p of [V(X1 - 0.03, yC, Z0 + 0.03), V(X1 - 0.03, yC, DOORS[0][1] + 0.2), V(X1 - 0.03, yC, DOORS[1][0] - 0.2), V(X1 - 0.03, yC, 0.6), V(BOARD.x, yC, Z0 + 0.03)]) jb(p);
    for (let z = Z0 + 0.5; z < Z1 - 0.3; z += 0.9) k.add(bx(0.03, 0.035, 0.02), mt.offwhite, T(X1 - 0.02, yC, z));
    for (let x = X0 + 0.6; x < X1 - 0.2; x += 0.9) k.add(bx(0.02, 0.035, 0.03), mt.offwhite, T(x, yC, Z0 + 0.02));
  }

  // ---------------- pennant bunting across the back wall (three swags) ----------------
  {
    const pal = ["#e2574a", "#f2c14a", "#4a86d8", "#56b07a", "#ef8fae", "#3aa3a0", "#7a5cb4", "#f08a4b"].map((c) => new THREE.Color(c));
    const zB = Z1 - 0.07;
    [[-5.4, -1.8], [-1.8, 1.8], [1.8, 5.4]].forEach(([xa, xb], sw) => {
      const ya = 3.02, sag = 0.22, pts: THREE.Vector3[] = [];
      for (let i = 0; i <= 12; i++) { const t = i / 12; pts.push(V(xa + (xb - xa) * t, ya - sag * 4 * t * (1 - t), zB)); }
      const skip = !!opts.noCards && sw === 1;   // group film: the middle swag would hang over the back clock
      if (!skip) k.add(tube(pts, 0.0035, 24, 4), mt.dark);
      const nF = 12;
      for (let i = 0; i < nF; i++) {
        const t = (i + 0.5) / nF, x = xa + (xb - xa) * t, y = ya - sag * 4 * t * (1 - t), w = 0.17, hF = 0.2 + 0.02 * R(), col = pal[(i + sw * 3) % pal.length];
        const sl = -sag * 4 * (1 - 2 * t) / (xb - xa), dy = sl * w / 2;
        const g = new THREE.BufferGeometry();
        g.setAttribute("position", new THREE.Float32BufferAttribute([x - w / 2, y - dy, zB, x + w / 2, y + dy, zB, x + (R() - 0.5) * 0.02, y - hF, zB + 0.01], 3));
        g.setAttribute("color", new THREE.Float32BufferAttribute([col.r, col.g, col.b, col.r, col.g, col.b, col.r * 0.9, col.g * 0.9, col.b * 0.9], 3));
        g.computeVertexNormals();
        if (!skip) k.add(g, mt.bunting);
      }
    });
  }

  // ---------------- lectern on the dais (right, angled to the class) ----------------
  const lecternMx = T(3.0, DAIS.h, -5.2, Math.PI - 0.3);
  {
    const sh = new THREE.Shape([new THREE.Vector2(-0.25, 0), new THREE.Vector2(0.25, 0), new THREE.Vector2(0.25, 1.12), new THREE.Vector2(-0.25, 1.03)]);
    const g = new THREE.ExtrudeGeometry(sh, { depth: 0.6, bevelEnabled: true, bevelThickness: 0.008, bevelSize: 0.008, bevelSegments: 1 });
    g.applyMatrix4(new THREE.Matrix4().makeBasis(V(0, 0, -1), V(0, 1, 0), V(1, 0, 0))); g.translate(-0.3, 0, 0); W.metricGeo(g);
    k.add(g, mt.lam, lecternMx);
    const top = T(0, 1.1, 0, 0, Math.atan(0.09 / 0.5));
    k.add(bx(0.68, 0.026, 0.6), mt.lamD, at(lecternMx, top));
    k.add(bx(0.5, 0.62, 0.012), mt.panel, at(lecternMx, T(0, 0.6, -0.262)));
    k.add(cyl(0.1, 0.1, 0.012, 28), mt.white, at(lecternMx, T(0, 0.72, -0.272, 0, Math.PI / 2)));
    k.add(cyl(0.06, 0.06, 0.012, 24), mt.chair, at(lecternMx, T(0, 0.72, -0.28, 0, Math.PI / 2)));
    k.add(bx(0.66, 0.035, 0.016), mt.lamD, at(lecternMx, T(0, 1.075, 0.3)));
    const lap = at(lecternMx, top, T(0.05, 0.013, 0.02));
    k.add(bx(0.32, 0.014, 0.22), mt.alu, at(lap, T(0, 0.007, 0)));
    const scr = at(lap, T(0, 0.014, -0.11, 0, -0.28));
    k.add(bx(0.32, 0.21, 0.008), mt.alu, at(scr, T(0, 0.105, 0)));
    k.add(quad(0.29, 0.18, [0.03, 0.03, 0.97, 0.97]), mt.laptopScr, at(scr, T(0, 0.108, 0.0045)));
    const m0 = V(-0.25, 1.1, -0.22).applyMatrix4(lecternMx), m1 = V(-0.24, 1.32, -0.12).applyMatrix4(lecternMx), m2 = V(-0.2, 1.4, 0.06).applyMatrix4(lecternMx);
    k.add(tube([m0, m1, m2], 0.006, 10, 5), mt.dark);
    const mic = new THREE.CapsuleGeometry(0.014, 0.05, 3, 8); W.metricGeo(mic);
    k.add(mic, mt.dark, at(lecternMx, T(-0.2, 1.4, 0.07, 0, 1.2)));
    bottle(k, at(lecternMx, T(0.3, 0, 0.3)), mt.bottles[3], mt.caps, 0.26, 0.036);
  }

  // ---------------- teacher's desk on the dais (right of centre, clear of the sun patch) with the collected cards ----------------
  const deskT = deskParts(mt), chairT = chairParts(mt);
  const chairI = new Inst("chair", chairT), deskI = new Inst("desk", deskT);
  {
    const mx = T(1.45, DAIS.h, -5.05, Math.PI + 0.05);
    k.add(bx(1.5, 0.035, 0.72), mt.lamD, at(mx, T(0, 0.7425, 0)));
    k.add(bx(0.04, 0.725, 0.66), mt.lamD, at(mx, T(-0.72, 0.3625, 0)));
    k.add(bx(0.44, 0.725, 0.68), mt.lam, at(mx, T(0.5, 0.3625, 0)));
    for (let d = 0; d < 3; d++) { k.add(bx(0.4, 0.2, 0.02), mt.lamD, at(mx, T(0.5, 0.15 + d * 0.22, 0.345))); k.add(bx(0.12, 0.014, 0.02), mt.chrome, at(mx, T(0.5, 0.21 + d * 0.22, 0.36))); }
    k.add(bx(1.0, 0.46, 0.018), mt.lamD, at(mx, T(-0.2, 0.48, -0.3)));
    const top = at(mx, T(0, 0.76, 0));
    for (const [px, pz, n] of [[-0.25, -0.05, 9], [0.12, 0.1, 6]] as const) {
      for (let s = 0; s < n; s++) k.add(bx(0.21, 0.004, 0.297), mt.paper, at(top, T(px + (R() - 0.5) * 0.012, 0.002 + s * 0.004, pz + (R() - 0.5) * 0.012, (R() - 0.5) * 0.08)));
      k.add(flatQuad(0.21, 0.297), mt.sheets[n % 4], at(top, T(px, 0.0045 + (n - 1) * 0.004 + 0.0005, pz, 0.03)));
    }
    k.add(rb(0.33, 0.02, 0.23, 0.006, 1), mt.alu, at(top, T(0.5, 0.01, -0.02, 0.2)));
    k.add(lathe([[0, 0], [0.04, 0], [0.042, 0.1], [0.038, 0.1], [0.036, 0.008], [0, 0.008]], 16), mt.red, at(top, T(-0.55, 0, 0.1)));
    const hnd = new THREE.TorusGeometry(0.025, 0.006, 5, 10, Math.PI * 1.2); W.metricGeo(hnd); k.add(hnd, mt.red, at(top, T(-0.55 + 0.042, 0.05, 0.1, 0, 0, -Math.PI * 0.6)));
    k.add(lathe([[0, 0], [0.035, 0], [0.035, 0.1], [0.032, 0.1], [0.032, 0.006], [0, 0.006]], 14), mt.dark, at(top, T(-0.62, 0, -0.18)));
    for (let p = 0; p < 3; p++) k.add(cyl(0.005, 0.005, 0.14, 8), mt.pens[p], at(top, T(-0.62 + (p - 1) * 0.012, 0.09, -0.18 + (p % 2) * 0.01, 0, (p - 1) * 0.15, (p - 1) * 0.12)));
    chairI.add(at(mx, T(0.1, 0, 0.52, 0.15)));
  }

  // ---------------- door wall: two doors, exit signs, switches, extinguisher, lockers, posters, AC unit, bookshelf ----------------
  {
    for (const [z0, z1] of DOORS) {
      const dzc = (z0 + z1) / 2, dw = z1 - z0;
      for (const z of [z0 - 0.035, z1 + 0.035]) k.add(bx(0.03, DH + 0.07, 0.07), mt.doorFrame, T(X1 - 0.015, (DH + 0.07) / 2, z));
      k.add(bx(0.03, 0.07, dw + 0.14), mt.doorFrame, T(X1 - 0.015, DH + 0.035, dzc));
      for (const z of [z0 + 0.01, z1 - 0.01]) k.add(bx(WT, DH, 0.02), mt.doorFrame, T(X1 + WT / 2, DH / 2, z));
      k.add(bx(WT, 0.02, dw), mt.doorFrame, T(X1 + WT / 2, DH - 0.01, dzc));
      const lx = X1 + 0.045;
      k.add(bx(0.045, DH - 0.02, dw - 0.03), mt.doorPaint, T(lx, (DH - 0.02) / 2, dzc));
      k.add(bx(0.006, 0.62, dw - 0.26), mt.doorPaint, T(lx - 0.025, 0.62, dzc)); k.add(bx(0.006, 0.5, 0.42), mt.doorPaint, T(lx - 0.025, 1.6, dzc - 0.2));
      k.add(bx(0.052, 0.68, 0.21), mt.doorFrame, T(lx, 1.5, dzc + 0.2)); k.add(bx(0.056, 0.6, 0.14), mt.doorGlass, T(lx, 1.5, dzc + 0.2));
      k.add(bx(0.004, 0.25, dw - 0.1), mt.alu, T(lx - 0.0245, 0.15, dzc));
      k.add(bx(0.012, 0.2, 0.05), mt.chrome, T(lx - 0.028, 1.02, z1 - 0.1));
      k.add(cyl(0.01, 0.01, 0.13, 8), mt.chrome, T(lx - 0.07, 1.06, z1 - 0.15, 0, Math.PI / 2)); k.add(cyl(0.008, 0.008, 0.05, 8), mt.chrome, T(lx - 0.05, 1.06, z1 - 0.1, 0, 0, Math.PI / 2));
      k.add(bx(0.06, 0.06, 0.3), mt.alu, T(lx - 0.05, DH - 0.08, z0 + 0.25)); k.add(bx(0.02, 0.02, 0.32), mt.alu, T(X1 - 0.03, DH + 0.04, z0 + 0.3, 0.2));
      for (const y of [0.25, 1.05, 1.85]) k.add(cyl(0.008, 0.008, 0.1, 8), mt.chrome, T(X1 + 0.02, y, z0 + 0.02));
      k.add(bx(0.06, 0.15, 0.36), mt.white, T(X1 - 0.03, 2.36, dzc)); k.add(quad(0.34, 0.13), mt.exit, T(X1 - 0.0605, 2.36, dzc, -Math.PI / 2));
      const swz = z0 === DOORS[0][0] ? z1 + 0.2 : z0 - 0.2;
      k.add(bx(0.012, 0.09, 0.09), mt.white, T(X1 - 0.006, 1.15, swz)); k.add(bx(0.008, 0.05, 0.03), mt.offwhite, T(X1 - 0.014, 1.15, swz));
    }
    // fire extinguisher on its bracket
    const fz = -4.05, fx = X1 - 0.1;
    k.add(bx(0.03, 0.14, 0.07), mt.dark, T(X1 - 0.015, 0.95, fz));
    k.add(lathe([[0, 0], [0.07, 0], [0.078, 0.02], [0.078, 0.4], [0.06, 0.46], [0.025, 0.49], [0, 0.49]], 18), mt.red, T(fx, 0.5, fz));
    k.add(cyl(0.02, 0.02, 0.05, 10), mt.dark, T(fx, 1.0, fz)); k.add(bx(0.03, 0.012, 0.12), mt.dark, T(fx, 1.03, fz + 0.03, 0, 0, 0.2));
    k.add(tube([V(fx, 0.99, fz - 0.02), V(fx - 0.06, 0.9, fz - 0.07), V(fx - 0.07, 0.65, fz - 0.07)], 0.009, 10, 5), mt.dark);
    k.add(quad(0.14, 0.14), mt.red, T(X1 - 0.004, 1.25, fz, -Math.PI / 2));
    // posters and the AC unit
    k.add(quad(0.55, 0.55, cellUV(7)), mt.print, T(X1 - 0.004, 1.6, 0.35, -Math.PI / 2));
    k.add(quad(0.5, 0.5, cellUV(4)), mt.print, T(X1 - 0.004, 1.66, 1.12, -Math.PI / 2, 0, -0.02));
    k.add(quad(0.26, 0.36, cellUV(0, 0.06)), mt.print, T(X1 - 0.004, 1.62, -0.45, -Math.PI / 2, 0, 0.03));
    // a run of six steel lockers (coral, numbered 31-36), a box, binders and a plant on top
    {
      const n = 6, lw = 0.4, z0 = LOCK_Z0, xb = X1 - 0.045, d = 0.4, xf = xb - d, hT = 1.86, y0 = 0.1;
      k.add(bx(d, hT - y0, n * lw), mt.lockerBody, T(xb - d / 2, (hT + y0) / 2, z0 + (n * lw) / 2));
      k.add(bx(d - 0.03, y0, n * lw - 0.02), mt.dark, T(xb - d / 2 + 0.01, y0 / 2, z0 + (n * lw) / 2));
      k.add(bx(d + 0.02, 0.025, n * lw + 0.02), mt.lockerBody, T(xb - d / 2 - 0.01, hT + 0.0125, z0 + (n * lw) / 2));
      for (let i = 0; i < n; i++) {
        const zc = z0 + lw * (i + 0.5);
        k.add(quad(lw - 0.012, hT - y0 - 0.04, [i / n, 0, (i + 1) / n, 1]), mt.locker, T(xf - 0.002, (hT + y0) / 2, zc, -Math.PI / 2));
        const hz = zc + lw / 2 - 0.085, hy = y0 + 0.02 + (hT - y0 - 0.04) * 0.46 + 0.07;
        k.add(rb(0.03, 0.11, 0.022, 0.008, 1), mt.chrome, T(xf - 0.016, hy, hz));
        k.add(bx(0.012, 0.02, 0.02), mt.dark, T(xf - 0.008, hy + 0.08, hz));
        if (i === 1 || i === 4) {
          k.add(rb(0.016, 0.04, 0.034, 0.006, 1), mt.alu, T(xf - 0.03, hy + 0.035, hz));
          const sh = new THREE.TorusGeometry(0.011, 0.0025, 4, 10, Math.PI); W.metricGeo(sh); k.add(sh, mt.chrome, T(xf - 0.03, hy + 0.055, hz, Math.PI / 2));
        }
      }
      const top = hT + 0.025;
      k.add(rb(0.34, 0.24, 0.42, 0.01, 1), mt.cardboard, T(xb - 0.2, top + 0.12, z0 + 0.35, 0.08));
      k.add(bx(0.345, 0.004, 0.06), mt.tape, T(xb - 0.2, top + 0.242, z0 + 0.35, 0.08));
      k.add(rb(0.3, 0.18, 0.36, 0.01, 1), mt.cardboard, T(xb - 0.19, top + 0.09, z0 + 0.95, -0.12));
      for (let b = 0; b < 4; b++) k.add(colorBox(0.3, 0.06, 0.24, new THREE.Color(["#3d6fc4", "#4f9a62", "#e9b43e", "#7a5cb4"][b]).multiplyScalar(0.85), new THREE.Color("#f2ead6")), mt.books, T(xb - 0.19, top + 0.03 + b * 0.06, z0 + 1.65, (R() - 0.5) * 0.3));
      pottedPlant(k, mt, R, T(xb - 0.2, top, z0 + 2.15), false);
    }
    k.add(rb(0.22, 0.3, 0.95, 0.04, 2), mt.white, T(X1 - 0.11, 2.82, 0.6));
    k.add(bx(0.02, 0.025, 0.84), mt.dark, T(X1 - 0.215, 2.7, 0.6)); k.add(bx(0.006, 0.006, 0.006), mt.led, T(X1 - 0.222, 2.86, 1.0));
    // bookshelf toward the back
    const bxs = X1 - 0.17, bz0 = 2.0, bz1 = 3.6, bH = 1.95;
    for (const z of [bz0 + 0.0125, bz1 - 0.0125]) k.add(bx(0.32, bH, 0.025), mt.lamD, T(bxs, bH / 2, z));
    k.add(bx(0.01, bH, bz1 - bz0), mt.lamD, T(X1 - 0.008, bH / 2, (bz0 + bz1) / 2));
    k.add(bx(0.3, 0.08, bz1 - bz0 - 0.05), mt.lamD, T(bxs, 0.04, (bz0 + bz1) / 2));
    const shelves = [0.08, 0.47, 0.86, 1.25, 1.62, bH - 0.0125];
    for (const y of shelves.slice(1)) k.add(bx(0.32, 0.025, bz1 - bz0 - 0.05), mt.lam, T(bxs, y, (bz0 + bz1) / 2));
    for (let s = 0; s < shelves.length - 1; s++) {
      const y = shelves[s] + (s ? 0.0125 : 0), gap = shelves[s + 1] - y - 0.02;
      if (s === 2) { bookRow(k, mt, R, T(bxs + 0.02, y, 0), bz0 + 0.03, bz0 + 0.9, 0.22, Math.min(0.3, gap)); k.add(rb(0.28, 0.2, 0.5, 0.01, 1), mt.bags[3], T(bxs, y + 0.1, bz0 + 1.25)); }
      else bookRow(k, mt, R, T(bxs + 0.02, y, 0), bz0 + 0.03, bz1 - 0.03, 0.22, Math.min(0.31, gap));
    }
    pottedPlant(k, mt, R, T(bxs, bH, bz1 - 0.3), false);
    k.add(rb(0.25, 0.16, 0.34, 0.01, 1), mt.offwhite, T(bxs, bH + 0.08, bz0 + 0.35));
  }

  // ---------------- back wall: notice board, coat hooks, cupboard, bins, big plant ----------------
  {
    const nx = 0, ny = 1.75, nw = 2.4, nh = 1.2, z = Z1;
    k.add(quad(nw, nh), mt.cork, T(nx, ny, z - 0.012, Math.PI));
    for (const s of [-1, 1]) { k.add(bx(nw + 0.09, 0.045, 0.03), mt.lamD, T(nx, ny + s * (nh / 2 + 0.022), z - 0.015)); k.add(bx(0.045, nh, 0.03), mt.lamD, T(nx + s * (nw / 2 + 0.022), ny, z - 0.015)); }
    const pins = [mt.red, mt.binBlue, mt.bottles[4], mt.bottles[0]];
    const items: { x: number; y: number; w: number; h: number; m: THREE.Material; uv?: [number, number, number, number] }[] = [
      { x: -0.95, y: 0.24, w: 0.21, h: 0.297, m: mt.sheets[0] }, { x: -0.68, y: 0.22, w: 0.21, h: 0.297, m: mt.sheets[2] },
      { x: -0.3, y: 0.14, w: 0.36, h: 0.36, m: mt.print, uv: cellUV(5) }, { x: 0.15, y: 0.26, w: 0.26, h: 0.37, m: mt.print, uv: cellUV(2, 0.07) },
      { x: 0.55, y: 0.2, w: 0.3, h: 0.3, m: mt.print, uv: cellUV(1) }, { x: 0.95, y: 0.24, w: 0.21, h: 0.297, m: mt.sheets[3] },
      { x: 0.86, y: -0.22, w: 0.14, h: 0.14, m: mt.print, uv: cellUV(3) },
      { x: -0.95, y: -0.24, w: 0.27, h: 0.27, m: mt.print, uv: cellUV(0) }, { x: -0.6, y: -0.28, w: 0.14, h: 0.14, m: mt.print, uv: cellUV(3) },
      { x: -0.25, y: -0.26, w: 0.3, h: 0.3, m: mt.print, uv: cellUV(4) }, { x: 0.18, y: -0.22, w: 0.21, h: 0.297, m: mt.sheets[1] },
      { x: 0.52, y: -0.27, w: 0.18, h: 0.25, m: mt.print, uv: cellUV(2, 0.1) },
    ];
    items.forEach((it, i) => {
      const mx = T(nx - it.x, ny + it.y, z - 0.014 - i * 0.0008, Math.PI, 0, (R() - 0.5) * 0.12);
      k.add(quad(it.w, it.h, it.uv), it.m, mx);
      const pin = new THREE.SphereGeometry(0.009, 8, 6); W.metricGeo(pin); k.add(pin, pins[i % 4], at(mx, T(0, it.h / 2 - 0.02, 0.008)));
    });
    // coat hooks with two jackets and a tote
    const cx = 2.7;
    k.add(bx(1.0, 0.09, 0.022), mt.lamD, T(cx, 1.72, z - 0.011));
    for (let i = 0; i < 4; i++) { const hx = cx - 0.36 + i * 0.24; k.add(rod(V(hx, 1.72, z - 0.02), V(hx, 1.69, z - 0.08), 0.007), mt.chrome); k.add(rod(V(hx, 1.69, z - 0.08), V(hx, 1.73, z - 0.1), 0.006), mt.chrome); }
    for (const [i, m] of [[0, mt.jackets[0]], [2, mt.jackets[1]]] as const) {
      const hx = cx - 0.36 + i * 0.24;
      k.add(taperY(rb(0.46, 0.74, 0.11, 0.05, 2), 0.2, 0.1), m, T(hx, 1.3, z - 0.1, 0, -0.04));
      for (const s of [-1, 1]) k.add(rb(0.1, 0.56, 0.09, 0.04, 1), m, T(hx + s * 0.205, 1.32, z - 0.12, 0, -0.05, s * 0.06));
      k.add(rb(0.2, 0.07, 0.09, 0.03, 1), m, T(hx, 1.68, z - 0.1));
    }
    k.add(rb(0.3, 0.34, 0.05, 0.02, 1), mt.bags[2], T(cx - 0.36 + 3 * 0.24, 1.34, z - 0.07, 0, 0.05));
    const th = new THREE.TorusGeometry(0.1, 0.008, 4, 12, Math.PI); W.metricGeo(th); k.add(th, mt.bags[2], T(cx - 0.36 + 3 * 0.24, 1.51, z - 0.07));
    // cupboard (back left)
    const cx0 = -4.9, cx1 = -2.7, ccx = (cx0 + cx1) / 2, cw = cx1 - cx0, cz = z - 0.225;
    k.add(bx(cw, 0.8, 0.45), mt.lam, T(ccx, 0.46, cz)); k.add(bx(cw - 0.05, 0.06, 0.4), mt.dark, T(ccx, 0.03, cz + 0.02));
    k.add(bx(cw + 0.04, 0.03, 0.47), mt.lamD, T(ccx, 0.875, cz - 0.01));
    for (let i = 0; i < 4; i++) {
      const dx = cx0 + cw / 8 + (i * cw) / 4;
      k.add(bx(cw / 4 - 0.012, 0.74, 0.018), mt.lamD, T(dx, 0.47, z - 0.459));
      k.add(bx(0.012, 0.13, 0.02), mt.chrome, T(dx + (i % 2 ? -1 : 1) * (cw / 8 - 0.04), 0.62, z - 0.475));
    }
    const ct = 0.89;
    k.add(rb(0.44, 0.22, 0.38, 0.02, 1), mt.offwhite, T(-3.1, ct + 0.11, z - 0.23)); k.add(bx(0.32, 0.006, 0.14), mt.dark, T(-3.1, ct + 0.222, z - 0.25));
    k.add(bx(0.3, 0.012, 0.16), mt.dark, T(-3.1, ct + 0.06, z - 0.47)); k.add(bx(0.21, 0.003, 0.15), mt.paper, T(-3.1, ct + 0.068, z - 0.47, 0.05));
    for (let i = 0; i < 3; i++) k.add(colorBox(0.3, 0.055, 0.215, new THREE.Color("#9fc4e6"), new THREE.Color("#f6f4ee")), mt.books, T(-3.75, ct + 0.0275 + i * 0.055, z - 0.22, (R() - 0.5) * 0.2));
    const bpal = ["#d9503f", "#3d6fc4", "#e9b43e", "#4f9a62", "#2f3a56", "#3aa3a0", "#7a5cb4"];
    for (let i = 0; i < 7; i++) k.add(colorBox(0.28, 0.31, 0.055, new THREE.Color(bpal[i]).multiplyScalar(0.85), new THREE.Color(bpal[i]).multiplyScalar(0.7), new THREE.Color(bpal[i])), mt.books, T(-4.75 + i * 0.058, ct + 0.155, z - 0.2, -Math.PI / 2, 0, i === 6 ? -0.25 : 0));
    pottedPlant(k, mt, R, T(-4.25, ct, z - 0.2), false);
    // bins (by the rear door)
    const binP: [number, number][] = [[0, 0], [0.14, 0], [0.17, 0.4], [0.178, 0.41], [0.168, 0.412], [0.136, 0.02], [0, 0.02]];
    k.add(lathe(binP, 20), mt.bin, T(4.15, 0, z - 0.24)); k.add(lathe(binP, 20), mt.binBlue, T(3.75, 0, z - 0.24));
    for (const [px, py, pz] of [[4.13, 0.38, z - 0.25], [4.19, 0.4, z - 0.2]] as const) { const pb = new THREE.IcosahedronGeometry(0.045, 1); W.metricGeo(pb); k.add(pb, mt.paper, T(px, py, pz, R() * 3, R() * 3)); }
    pottedPlant(k, mt, R, T(-5.35, 0, z - 0.42), true);
  }

  // ---------------- desks, chairs, cards, pens and the students' things (instanced) ----------------
  const cardI = mt.sheets.map((m, i) => new Inst(`card${i}`, cardParts(m)));
  const penI = new Inst("pen", penParts(mt), [mt.tPen]);
  const laptopI = [0, 1, 2, 3].map((c) => new Inst(`laptop${c}`, laptopParts(mt, c), [mt.tLaptop]));
  const cupI = new Inst("cup", cupParts(mt)), bottleI = new Inst("bottle", bottleParts(mt), [mt.tBottle]);
  const phoneI = new Inst("phone", phoneParts(mt)), noteI = new Inst("notebook", notebookParts(mt), [mt.tCover]);
  const lanyardI = new Inst("lanyard", lanyardParts(mt), [mt.tRibbon]), toteI = new Inst("tote", toteParts(mt), [mt.tBag]);
  const jacketI = new Inst("jacket", jacketParts(mt), [mt.tJacket]), packI = new Inst("backpack", backpackParts(mt), [mt.tPack]);
  const PEN = ["#2e62d6", "#2b2e35", "#d8433a", "#2e62d6", "#2a9d8f"], LAP = ["#c9cdd3", "#c9cdd3", "#5c6068", "#d9c9b6"];
  const BOT = ["#3fb0a8", "#f4f2ec", "#ef8fae", "#5b86e0", "#f2c14a", "#3a3d45"], COVER = ["#e2574a", "#4a86d8", "#56b07a", "#f0c040", "#2f3a56"];
  const RIB = ["#2a9d8f", "#2f4478", "#d8433a", "#f2be40"], BAG = ["#e8dcc4", "#d4503f", "#3d5a9e", "#4f9a62", "#2f3238", "#e9b43e", "#7a5cb4", "#f2efe6"];
  const JKT = ["#34508f", "#d9a43a", "#5d6b3a", "#8a3b3b"], PACK = ["#3d5a9e", "#3a3d45", "#4f9a62", "#d4503f", "#7b8794"];
  const pick = <X,>(a: X[]) => a[Math.floor(R() * a.length)];
  const seats: SeatAnchor[] = [], cards: CardAnchor[] = [];
  let heroSheetMx = new THREE.Matrix4(), heroPenMx = new THREE.Matrix4();
  const youIdx = YOU.row * 12 + YOU.col * 2 + YOU.side;
  const tmpQ = new THREE.Quaternion(), tmpS = V(1, 1, 1), tmpP = V(0, 0, 0), yawOf = (m: THREE.Matrix4) => { m.decompose(tmpP, tmpQ, tmpS); return new THREE.Euler().setFromQuaternion(tmpQ, "YXZ").y; };
  ROW_Z.forEach((rz, r) => DESK_X.forEach((cx, c) => {
    const dm = T(cx + (R() - 0.5) * 0.02, 0, rz + (R() - 0.5) * 0.03, (R() - 0.5) * 0.016);
    deskI.add(dm);
    const top = at(dm, T(0, DESK_TOP, 0));
    for (const side of [0, 1] as const) {
      const i = r * 12 + c * 2 + side, s = side ? 1 : -1, sx = s * SEAT_X, you = i === youIdx;
      // chair pulled out to where a sitter has it (occupied: all 84 seats are taken in the film)
      const turn = R() < 0.12 ? (R() - 0.5) * 0.3 : (R() - 0.5) * 0.1;
      const cm = you ? at(dm, T(sx, 0, CHAIR_Z + 0.02)) : at(dm, T(sx + (R() - 0.5) * 0.02, 0, CHAIR_Z + R() * 0.05, turn));
      chairI.add(cm);
      const hip = V(0, HIP_Y, HIP_Z).applyMatrix4(cm), feet = V(0, 0, -0.42).applyMatrix4(cm), facing = yawOf(cm);
      seats.push({ i, row: r, col: c, side, pos: hip, facing, dir: V(-Math.sin(facing), 0, -Math.cos(facing)), feet });
      // the desk zone in front of this seat: card in the middle, things in the far corners / at the side
      const lap = !you && R() < 0.36, cz = lap ? 0.115 : 0.1, cyaw = you ? -0.05 : (R() - 0.5) * (lap ? 0.16 : 0.3);
      const sm = at(top, T(sx + (you ? 0 : (R() - 0.5) * 0.05), 0.0006, cz, cyaw));
      if (you) heroSheetMx = sm; else { const ci = Math.floor(R() * 4); if (!opts.noCards) cardI[ci].add(sm); }
      const free = { L: true, R: true, farL: true, farR: true };
      const onCard = you || R() < 0.65;
      const pm = onCard ? at(sm, you ? T(0.035, 0.0004, 0.092, 0.62) : T((R() - 0.5) * 0.06, 0.0004, (R() - 0.5) * 0.12, R() * 6.28)) : null;
      if (lap) {
        laptopI[Math.floor(R() * 4)].add(at(top, T(sx + (R() - 0.5) * 0.03, 0, -0.155, (R() - 0.5) * 0.16)), pick(LAP));
        free.farL = free.farR = false;
        if (R() < 0.5) { const sd = R() < 0.5 ? -1 : 1; (R() < 0.6 ? cupI : bottleI).add(at(top, T(sx + sd * 0.255, 0, -0.03, R() * 6)), pick(BOT)); if (sd < 0) free.L = false; else free.R = false; }
      } else {
        if (you || R() < 0.32) { const sd = you ? 1 : R() < 0.5 ? -1 : 1; cupI.add(at(top, T(sx + sd * 0.2, 0, -0.17, R() * 6))); if (sd < 0) free.farL = false; else free.farR = false; }
        if (!you && R() < 0.3) { const sd = free.farL ? -1 : 1; if (sd < 0 ? free.farL : free.farR) { bottleI.add(at(top, T(sx + sd * 0.205, 0, -0.18, R() * 6)), pick(BOT)); if (sd < 0) free.farL = false; else free.farR = false; } }
        if (!you && R() < 0.24) noteI.add(at(top, T(sx + (R() - 0.5) * 0.04, 0, -0.185, Math.PI / 2 + (R() - 0.5) * 0.2)), pick(COVER));
      }
      const sideSlot = () => { const opts2 = (["L", "R"] as const).filter((q) => free[q]); if (!opts2.length) return 0; const q = opts2[Math.floor(R() * opts2.length)]; free[q] = false; return q === "L" ? -1 : 1; };
      // group film (noCards): no dressing phones on the four team desks 76-79 (they hold their own); the R() calls stay
      if (!you && R() < 0.22) { const sd = sideSlot(); if (sd) { const pmx = at(top, T(sx + sd * 0.235, 0, 0.1, (R() - 0.5) * 0.5)); if (!(opts.noCards && i >= 76 && i <= 79)) phoneI.add(pmx); } }
      if (!you && R() < 0.1) { const sd = sideSlot(); if (sd) lanyardI.add(at(top, T(sx + sd * 0.235, 0, 0.08, (R() - 0.5) * 0.3)), pick(RIB)); }
      let penMx = pm;
      if (!penMx) { const sd = sideSlot(); penMx = sd ? at(top, T(sx + sd * 0.235, 0.0001, 0.1, Math.PI / 2 + (R() - 0.5) * 0.4)) : at(sm, T(0.02, 0.0004, 0.05, R() * 6.28)); }
      if (you) heroPenMx = penMx; else penI.add(penMx, pick(PEN));
      cards.push({ i, pos: V(0, 0, 0).applyMatrix4(sm), yaw: yawOf(sm), pen: V(0, 0.0045, 0).applyMatrix4(penMx) });
      // the chair back: a tote or a jacket; backpacks only on the floor of the outer aisles
      if (!you) {
        const b = R();
        if (b < 0.3) toteI.add(cm, pick(BAG)); else if (b < 0.37) jacketI.add(cm, pick(JKT));
        const outer = (c === 0 && side === 0 && r !== YOU.row) || (c === 5 && side === 1);
        if (outer && R() < 0.55) packI.add(at(dm, T(sx + s * 0.42, 0, 0.12 + 0.1 * R(), s * 0.5 + (R() - 0.5) * 0.6)), pick(PACK));
      }
    }
    if (R() < 0.3) k.add(colorBox(0.21, 0.025, 0.15, new THREE.Color(["#3d6fc4", "#e9b43e", "#4f9a62"][Math.floor(R() * 3)]), new THREE.Color("#f2ead6")), mt.books, at(dm, T((R() - 0.5) * 0.6, 0.6125, -0.05, 0.1 + R() * 0.3)));
  }));
  // a dropped card and a crumpled one on the floor of the back aisle
  k.add(flatQuad(0.21, 0.297), mt.sheets[3], T(2.6, 0.0025, 5.45, 0.9));
  { const pb = new THREE.IcosahedronGeometry(0.04, 1); W.metricGeo(pb); k.add(pb, mt.paper, T(-3.3, 0.035, 5.35, 0.4, 0.3)); }
  for (const I2 of [deskI, chairI, ...cardI, penI, ...laptopI, cupI, bottleI, phoneI, noteI, lanyardI, toteI, jacketI, packI]) tris += I2.bake(group, noCast);

  // ---------------- the removable ceiling: a lid (tile underside, plenum edge, roof membrane on top) with the light
  // panels, vents, smoke detectors, projector and optional fans. It casts no shadow: a shadow-only roof stays. ----------------
  const ceiling = new THREE.Group(); ceiling.name = "classroom:ceiling"; group.add(ceiling);
  const kc = new Kit(), e = 0.004;
  worldUV(kc.add(new THREE.BoxGeometry(X1 - X0 - 2 * e, 0.03, Z1 - Z0 - 2 * e), mt.ceil, T(0, HC + 0.015, 0)), 0.3, 0.3);
  kc.add(bx(X1 - X0 - 2 * e, PLEN - HC - 0.03, Z1 - Z0 - 2 * e), mt.lidSide, T(0, (HC + 0.03 + PLEN) / 2, 0));
  worldUV(kc.add(new THREE.BoxGeometry(X1 - X0 - 2 * e, ROOF - PLEN, Z1 - Z0 - 2 * e), mt.roof, T(0, (PLEN + ROOF) / 2, 0)), 0, 0);
  // light panels: the frame, diffuser and a modelled near-black rim are kept out of the ink pass (NOINK, set after the
  // bake): from the wide's grazing angle the post-process ink broke the far panels' 3 cm edges into crawling dashes;
  // the 12 mm rim draws the same outline as geometry (MSAA-smooth at any distance)
  const rim = (x: number, z: number, w: number, d: number, yb: number) => {   // 12 mm wide, 9 mm tall rim at the fixture's bottom edge
    for (const s2 of [-1, 1]) {
      kc.add(bx(0.012, 0.009, d + 0.024), mt.panelInk, T(x + s2 * (w / 2 + 0.006), yb + 0.0045, z));
      kc.add(bx(w, 0.009, 0.012), mt.panelInk, T(x, yb + 0.0045, z + s2 * (d / 2 + 0.006)));
    }
  };
  for (const x of [-4.1, -1.4, 1.3, 4.0]) for (const z of [-4.45, -1.55, 1.35, 4.25]) {
    kc.add(bx(0.62, 0.03, 1.22), mt.panelFrame, T(x, HC - 0.015, z));
    kc.add(quad(0.56, 1.16), mt.lights, T(x, HC - 0.0305, z, 0, Math.PI / 2));
    rim(x, z, 0.62, 1.22, HC - 0.0305);
  }
  for (const [x, z] of [[-2.75, 0.0], [2.75, 0.0], [0.0, 5.0]] as const) {
    kc.add(bx(0.6, 0.02, 0.6), mt.panelFrame, T(x, HC - 0.01, z)); kc.add(quad(0.54, 0.54), mt.ventFlush, T(x, HC - 0.0205, z, 0, Math.PI / 2));
    rim(x, z, 0.6, 0.6, HC - 0.0205);
  }
  for (const z of [-3.0, 2.9]) { kc.add(cyl(0.065, 0.06, 0.035, 18), mt.white, T(0, HC - 0.0175, z)); kc.add(bx(0.008, 0.004, 0.008), mt.led, T(0, HC - 0.036, z + 0.03)); }
  {
    const px = SCREEN_X - 0.1, pz = -1.6;
    kc.add(cyl(0.02, 0.02, 0.26, 8), mt.white, T(px, HC - 0.13, pz)); kc.add(bx(0.13, 0.012, 0.13), mt.white, T(px, HC - 0.262, pz));
    kc.add(rb(0.34, 0.11, 0.28, 0.025, 1), mt.offwhite, T(px, HC - 0.325, pz));
    kc.add(cyl(0.045, 0.045, 0.03, 18), mt.dark, T(px + 0.08, HC - 0.325, pz - 0.15, 0, Math.PI / 2));
    kc.add(quad(0.12, 0.06), mt.vent, T(px + 0.171, HC - 0.325, pz, Math.PI / 2));
    kc.add(bx(0.01, 0.01, 0.004), mt.led, T(px - 0.1, HC - 0.3, pz - 0.141));
  }
  const fans: THREE.Group[] = [];
  if (opts.fans) {
    const hy = HC - 0.5;
    const canopy: [number, number][] = [[0, 0], [0.075, 0], [0.075, -0.012], [0.05, -0.055], [0.016, -0.07], [0, -0.07]];
    const motor: [number, number][] = [[0, 0.07], [0.04, 0.07], [0.06, 0.05], [0.125, 0.025], [0.13, -0.005], [0.12, -0.03], [0.07, -0.05], [0, -0.05]];
    for (const [fx, fz] of FANS) {
      kc.add(lathe(canopy, 18), mt.white, T(fx, HC, fz));
      kc.add(cyl(0.011, 0.011, HC - 0.07 - (hy + 0.07), 8), mt.white, T(fx, (HC - 0.07 + hy + 0.07) / 2, fz));
      kc.add(lathe(motor, 20), mt.white, T(fx, hy, fz));
    }
    const rotor = new THREE.Group(), kp = new Kit();
    kp.add(cyl(0.05, 0.035, 0.03, 16), mt.chrome, T(0, -0.065, 0));
    for (let b = 0; b < 3; b++) {
      const m = T(0, -0.06, 0, (b * 2 * Math.PI) / 3);
      kp.add(bx(0.17, 0.008, 0.04), mt.chrome, at(m, T(0.12, 0, 0, 0, 0, 0.08)));
      kp.add(rb(0.5, 0.012, 0.12, 0.005, 1), mt.lamD, at(m, T(0.43, -0.012, 0, 0, 0.14)));
    }
    tris += kp.bake(rotor, noCast) * FANS.length;
    FANS.forEach(([fx, fz], i) => { const f = i ? rotor.clone() : rotor; f.position.set(fx, hy, fz); f.rotation.y = i * 0.7; f.name = `classroom:fan${i}`; ceiling.add(f); fans.push(f); });
  }
  tris += kc.bake(ceiling, noCast);
  for (const c of ceiling.children) if (c.name === "classroom:panelFrame" || c.name === "classroom:panelInk" || c.name === "classroom:lightPanel" || c.name === "classroom:ventFlush") c.layers.set(NOINK);
  ceiling.traverse((o) => { o.castShadow = false; });
  const shadowRoof = new THREE.Mesh(new THREE.BoxGeometry(X1 - X0 + 2 * WT, ROOF - PLEN, Z1 - Z0 + 2 * WT), new THREE.MeshBasicMaterial({ colorWrite: false, depthWrite: false }));
  shadowRoof.position.set(0, (PLEN + ROOF) / 2, 0); shadowRoof.castShadow = true; shadowRoof.receiveShadow = false; shadowRoof.layers.set(NOINK); shadowRoof.name = "classroom:shadowRoof";
  group.add(shadowRoof);

  // ---------------- outside: the building around the room, the lawn, trees, the teaching block across it, the sky ----------------
  const outside = new THREE.Group(); outside.name = "classroom:outside"; outside.visible = opts.exterior ?? true; group.add(outside);
  const sky = new THREE.Group(); sky.name = "classroom:sky"; outside.add(sky);
  {
    const ke = new Kit(), kb = new Kit(); // ke: unlit painted exterior; kb: the building's own lit walls and roofs
    const BX0 = X0 - WT, BX1 = X1 + WT + 2.6, BZ = 13.25;
    // the building: neighbouring rooms front and back, the corridor along the door side; brick walls, membrane roofs, parapets
    const block = (x0: number, x1: number, z0: number, z1: number) => {
      kb.add(bx(x1 - x0, ROOF - 0.2 - GROUND, z1 - z0), mt.brick, T((x0 + x1) / 2, (ROOF - 0.2 + GROUND) / 2, (z0 + z1) / 2));
      worldUV(kb.add(new THREE.BoxGeometry(x1 - x0, 0.2, z1 - z0), mt.roof, T((x0 + x1) / 2, ROOF - 0.1, (z0 + z1) / 2)), 0, 0);
    };
    block(BX0, BX1, -BZ, Z0 - WT); block(BX0, BX1, Z1 + WT, BZ); block(X1 + WT, BX1, Z0 - WT, Z1 + WT);
    const parapet = (x0: number, x1: number, z0: number, z1: number) => { kb.add(bx(x1 - x0, PARAPET - ROOF, z1 - z0), mt.brick, T((x0 + x1) / 2, (ROOF + PARAPET) / 2, (z0 + z1) / 2)); cap(x0 - 0.02, x1 + 0.02, z0 - 0.02, z1 + 0.02, PARAPET); };
    parapet(BX0, BX0 + 0.2, -BZ, Z0 - WT); parapet(BX0, BX0 + 0.2, Z1 + WT, BZ);
    parapet(BX0, BX1, -BZ, -BZ + 0.2); parapet(BX0, BX1, BZ - 0.2, BZ); parapet(BX1 - 0.2, BX1, -BZ + 0.2, BZ - 0.2);
    // our window wall's outer face: brick cladding round the five openings
    const clad = (y0: number, y1: number, z0: number, z1: number) => kb.add(bx(0.014, y1 - y0, z1 - z0), mt.brick, T(BX0 - 0.007, (y0 + y1) / 2, (z0 + z1) / 2));
    clad(GROUND, SILL - 0.06, Z0 - WT, Z1 + WT); clad(HEAD, PARAPET, Z0 - WT, Z1 + WT);
    for (let i = 0; i < wz.length; i += 2) clad(SILL - 0.06, HEAD, i ? wz[i] : Z0 - WT, i === wz.length - 2 ? Z1 + WT : wz[i + 1]);
    // the neighbours' windows on the same facade (unlit painted panes) with their sills
    for (const z of [-7.6, -9.75, -11.9, 7.6, 9.75, 11.9]) {
      ke.add(quad(WIN_W, HEAD - SILL), mt.outWin, T(BX0 - 0.016, (SILL + HEAD) / 2, z, -Math.PI / 2));
      kb.add(bx(0.14, 0.04, WIN_W + 0.1), mt.alu, T(BX0 - 0.06, SILL - 0.04, z));
    }
    // rooftop clutter on the neighbouring roofs (seen from the top-down crane)
    for (const [x, z, w, h, d] of [[1.2, 9.4, 1.6, 1.0, 1.2], [4.6, 8.0, 0.8, 0.6, 0.8], [-3.6, -10.4, 1.2, 0.8, 1.0]] as const) {
      kb.add(rb(w, h, d, 0.03, 1), mt.offwhite, T(x, ROOF + h / 2, z)); kb.add(quad(w * 0.8, d * 0.8), mt.vent, T(x, ROOF + h + 0.002, z, 0, -Math.PI / 2));
    }
    // rooflights: an aluminium upstand with a lit, glossy pale polycarbonate dome (reads as a rooflight from above)
    const domeM = M.paint({ color: "#86a6bb", roughness: 0.3 }); domeM.name = "rooflightDome";
    for (const [x, z] of [[-1.6, -10.4], [1.8, -10.4], [-1.6, 10.6]] as const) {
      kb.add(bx(1.3, 0.22, 1.3), mt.alu, T(x, ROOF + 0.11, z));
      const dome = new THREE.SphereGeometry(0.55, 20, 8, 0, Math.PI * 2, 0, Math.PI / 2); dome.scale(1, 0.15, 1); W.metricGeo(dome);
      kb.add(dome, domeM, T(x, ROOF + 0.22, z)); ke.add(flatQuad(1.12, 1.12), mt.skyGlass, T(x, ROOF + 0.221, z));
    }
    for (const [x, z] of [[4.2, -7.6], [5.4, -11.2], [-4.4, 8.4], [7.4, 2.0], [7.4, -3.5]] as const) kb.add(cyl(0.07, 0.07, 0.6, 10), mt.alu, T(x, ROOF + 0.3, z));
    kb.add(bx(BX1 - BX0 + 0.04, -GROUND, 2 * BZ + 0.04), mt.cap, T((BX0 + BX1) / 2, GROUND / 2, 0)); // plinth under the floor slab
    // lawn, the paved walk along the facade, a path to the block across the lawn
    ke.add(flatQuad(180, 180, [0, 0, 60, 60]), mt.grass, T(-20, GROUND, 0));
    ke.add(flatQuad(1.6, 2 * BZ, [0, 0, 1.6, 2 * BZ]), mt.paving, T(BX0 - 0.8, GROUND + 0.006, 0));
    ke.add(flatQuad(14.4, 2.0, [0, 0, 14.4, 2.0]), mt.paving, T(BX0 - 1.6 - 7.2, GROUND + 0.005, -0.2));
    // the teaching block across the lawn (36 x 11 m facade facing the classroom)
    const NB = -22;
    ke.add(bx(9, 11, 36), mt.extBody, T(NB - 4.5, GROUND + 5.5, 0));
    ke.add(quad(36, 11), mt.facade, T(NB + 0.01, GROUND + 5.5, 0, Math.PI / 2));
    ke.add(bx(0.3, 0.35, 36.2), mt.extCoping, T(NB + 0.05, GROUND + 11.15, 0));
    ke.add(bx(8.8, 0.02, 35.8), mt.extRoof, T(NB - 4.5, GROUND + 11.01, 0));
    // lamp posts and benches along the walk
    for (const z of [-8, 7]) { ke.add(cyl(0.05, 0.06, 3.6, 8), mt.extDark, T(BX0 - 1.9, GROUND + 1.8, z)); ke.add(bx(0.36, 0.12, 0.2), mt.extDark, T(BX0 - 1.9, GROUND + 3.62, z)); ke.add(bx(0.3, 0.04, 0.16), mt.extLamp, T(BX0 - 1.9, GROUND + 3.54, z)); }
    for (const z of [-4.8, 4.2]) {
      const bm = T(BX0 - 2.1, GROUND, z, -Math.PI / 2);
      for (let s = 0; s < 3; s++) ke.add(bx(1.6, 0.035, 0.09), mt.extWood, at(bm, T(0, 0.44, -0.12 + s * 0.11)));
      for (let s = 0; s < 2; s++) ke.add(bx(1.6, 0.09, 0.03), mt.extWood, at(bm, T(0, 0.62 + s * 0.12, 0.22, 0, 0.2)));
      for (const sx of [-0.7, 0.7]) { ke.add(bx(0.05, 0.44, 0.4), mt.extDark, at(bm, T(sx, 0.22, 0.04))); ke.add(bx(0.05, 0.4, 0.04), mt.extDark, at(bm, T(sx, 0.62, 0.22, 0, 0.2))); }
    }
    // trees: toon crowns, trunks, contact shadows
    const trees: [number, number, number, number][] = [[-11.4, -8.6, 1.0, 0.2], [-12.6, 3.4, 1.15, 0.7], [-10.2, 9.6, 0.95, 0.4], [-16.5, -11.5, 1.2, 0.8], [-17.2, 6.4, 1.1, 0.3], [-9.6, -13.2, 0.9, 0.6], [-15.2, 13.5, 1.0, 0.1], [-18.4, -2.6, 1.25, 0.55], [-13.8, -1.0, 0.85, 0.9]];
    for (const [x, z, s, hue] of trees) {
      ke.add(cyl(0.11 * s, 0.17 * s, 3.0 * s, 8), mt.extTrunk, T(x, GROUND + 1.5 * s, z));
      const lobes: [number, number, number, number][] = [[0, 3.9, 0, 1.55], [-0.95, 3.4, 0.4, 1.15], [0.9, 3.5, -0.3, 1.2], [-0.35, 4.75, -0.5, 1.1], [0.45, 4.6, 0.55, 1.05], [0.1, 3.2, 1.0, 1.0], [0.0, 3.3, -1.0, 1.0]];
      for (const [dx, dy, dz, r] of lobes) ke.add(crownLobe(r * s * (0.9 + 0.2 * R()), hue, R), mt.crown, T(x + dx * s, GROUND + dy * s, z + dz * s));
      ke.add(flatQuad(4.2 * s, 3.4 * s), mt.blob, T(x + 0.5 * s, GROUND + 0.012, z - 0.2 * s, 0.5));
    }
    tris += ke.bake(outside, new Set(Object.values(mt).flat() as THREE.Material[]));
    tris += kb.bake(outside, noCast);
    outside.traverse((o) => { o.castShadow = false; if ((o as THREE.Mesh).material === mt.blob) { o.layers.set(NOINK); o.renderOrder = 2; } });
    // sky: a painted cylinder (horizon 1 m above its foot) and a zenith cap
    const cylG = new THREE.CylinderGeometry(85, 85, 45, 48, 1, true);
    const skyM = new THREE.Mesh(cylG, mt.sky); skyM.position.set(-10, GROUND - 1 + 22.5, 0); skyM.rotation.y = 0.4;
    const capG = new THREE.CircleGeometry(85, 48); capG.rotateX(Math.PI / 2);
    const capM = new THREE.Mesh(capG, mt.skyTop); capM.position.set(-10, GROUND - 1 + 45, 0);
    for (const m of [skyM, capM]) { m.layers.set(NOINK); m.castShadow = m.receiveShadow = false; m.frustumCulled = false; sky.add(m); }
    tris += 48 * 2 + 48;
  }

  // ---------------- bake the room ----------------
  tris += k.bake(group, noCast);
  // blind slats: no ink (a black line round every 3 mm slat turns each window into a barcode); they still cast the stripes
  for (const c of group.children) {
    if (c.name === "classroom:slat") c.layers.set(NOINK);
    if (c.name === "classroom:windowGlass") { c.layers.set(NOINK); c.renderOrder = 5; }
  }

  // hero card + pen as their own objects (the film animates the pen / swaps the card)
  const heroSheet = new THREE.Mesh(flatQuad(0.21, 0.297), mt.heroSheet);
  heroSheet.applyMatrix4(heroSheetMx); heroSheet.receiveShadow = true; heroSheet.name = "classroom:heroCard"; group.add(heroSheet);
  const heroPen = new THREE.Group(); heroPen.name = "classroom:heroPen";
  { const kp = new Kit(); for (const p of penParts(mt)) kp.add(p.g.clone(), p.m === mt.tPen ? mt.pens[0] : p.m); tris += kp.bake(heroPen, new Set()); heroPen.applyMatrix4(heroPenMx); group.add(heroPen); }
  tris += 2;

  // clock hands
  const clockHands = new THREE.Group(); clockHands.position.set(BOARD.x, 2.76, Z0 + 0.054); clockHands.name = "classroom:clockHands"; group.add(clockHands);
  const hand = (w: number, l: number, back: number, z: number, m: THREE.Material) => { const g = new THREE.BoxGeometry(w, l + back, 0.004); g.translate(0, (l - back) / 2, z); const h = new THREE.Mesh(g, m); h.castShadow = true; clockHands.add(h); tris += 12; return h; };
  const hH = hand(0.018, 0.095, 0.02, 0, mt.dark), hM = hand(0.012, 0.138, 0.025, 0.004, mt.dark), hS = hand(0.004, 0.142, 0.04, 0.008, mt.red);
  { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.016, 12).rotateX(Math.PI / 2), mt.red); c.position.z = 0.008; clockHands.add(c); tris += 48; }

  // group film: a second wall clock on the BACK wall, above the notice board (the students face away from it; a camera
  // in front of them sees it over their heads). Same face and hands as the board clock; animate(t) turns both.
  const BACK_CLOCK = { x: -0.22, y: 2.72, z: Z1 };
  const backHands = new THREE.Group(); backHands.name = "classroom:backClockHands";
  let bH: THREE.Mesh | null = null, bM: THREE.Mesh | null = null, bS: THREE.Mesh | null = null;
  if (opts.noCards) {
    const kc = new Kit();
    kc.add(cyl(0.2, 0.2, 0.05, 40), mt.dark, T(BACK_CLOCK.x, BACK_CLOCK.y, BACK_CLOCK.z - 0.025, 0, Math.PI / 2));
    kc.add(new THREE.CircleGeometry(0.178, 48), mt.clock, T(BACK_CLOCK.x, BACK_CLOCK.y, BACK_CLOCK.z - 0.0505, Math.PI));
    tris += kc.bake(group, noCast);
    backHands.position.set(BACK_CLOCK.x, BACK_CLOCK.y, BACK_CLOCK.z - 0.054); backHands.rotation.y = Math.PI; group.add(backHands);
    const bh = (w: number, l: number, back: number, z: number, m: THREE.Material) => { const g = new THREE.BoxGeometry(w, l + back, 0.004); g.translate(0, (l - back) / 2, z); const h = new THREE.Mesh(g, m); h.castShadow = true; backHands.add(h); tris += 12; return h; };
    bH = bh(0.02, 0.104, 0.022, 0, mt.dark); bM = bh(0.013, 0.15, 0.027, 0.004, mt.dark); bS = bh(0.0045, 0.155, 0.044, 0.008, mt.red);
    const c = new THREE.Mesh(new THREE.CylinderGeometry(0.013, 0.013, 0.016, 12).rotateX(Math.PI / 2), mt.red); c.position.z = 0.008; backHands.add(c); tris += 48;
  }

  // ---------------- light shafts (additive, no depth write, NOINK): every window's faint beams + the open window's hero shaft ----------------
  const sd = V(...(opts.sunDir ?? CLASSROOM_SUN.dir)).normalize(), Ld = sd.clone().negate();
  const beams = new THREE.Group(); beams.name = "classroom:beams"; beams.visible = opts.beams ?? true; group.add(beams);
  const shaft = new THREE.Group(); shaft.name = "classroom:shaft"; shaft.visible = false; group.add(shaft);
  const shaftMats: { m: THREE.MeshBasicMaterial; base: THREE.Color }[] = [];
  let moteDrift = (t: number) => { void t; };
  {
    // beam textures: across the beam a soft sine profile; along it (v = 1 at the window) the faint beams fade out toward
    // the floor, the hero shaft keeps 45 % at its foot so the figure standing in it glows
    const beamTex = (fall: (v: number) => number, across = (u: number) => Math.pow(Math.sin(Math.PI * u), 0.7)) => {
      const bc = canvas(64, 128), bg = bc.getContext("2d", CTX)!, id = bg.createImageData(64, 128);
      for (let y = 0; y < 128; y++) for (let x = 0; x < 64; x++) {
        const u = (x + 0.5) / 64, v = (y + 0.5) / 128, val = across(u) * fall(v) * 255;
        const o = (y * 64 + x) * 4; id.data[o] = val; id.data[o + 1] = val * 0.93; id.data[o + 2] = val * 0.8; id.data[o + 3] = 255;
      }
      bg.putImageData(id, 0, 0);
      return ctex(bc, true, false);
    };
    // the hero shaft: a flat core with crisp (12 %) edges so it reads as a defined beam of sun, not a haze
    const crisp = (u: number) => ease(u / 0.12) * ease((1 - u) / 0.12);
    const bt = beamTex((v) => Math.pow(v, 1.4)), btHero = beamTex((v) => 0.55 + 0.45 * Math.pow(v, 1.1), crisp);
    const shaftMesh = (z0: number, z1: number, y0: number, y1: number, k0: number, floorY: number, into: THREE.Group, tex = bt) => {
      const xw = X0 - 0.13, c = [V(xw, y0, z0), V(xw, y1, z0), V(xw, y1, z1), V(xw, y0, z1)];
      const f = c.map((p) => p.clone().addScaledVector(Ld, (p.y - floorY) / -Ld.y));
      const pos: number[] = [], uv: number[] = [];
      for (let e2 = 0; e2 < 4; e2++) {
        const a = c[e2], b = c[(e2 + 1) % 4], fa = f[e2], fb = f[(e2 + 1) % 4];
        pos.push(...a.toArray(), ...b.toArray(), ...fb.toArray(), ...a.toArray(), ...fb.toArray(), ...fa.toArray());
        uv.push(0, 1, 1, 1, 1, 0, 0, 1, 1, 0, 0, 0);
      }
      const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
      const base = new THREE.Color(1, 0.95, 0.84).multiplyScalar(k0);
      const m = new THREE.MeshBasicMaterial({ map: tex, color: base.clone(), transparent: true, opacity: 1, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
      const mesh = new THREE.Mesh(g, m); mesh.layers.set(NOINK); mesh.renderOrder = 10; mesh.castShadow = false; mesh.receiveShadow = false; into.add(mesh); tris += 8;
      return { m, base };
    };
    WIN_Z.forEach((z, i) => {
      const b = blinds[i], z0 = z - WIN_W / 2 + 0.06, z1 = z + WIN_W / 2 - 0.06;
      const open = b.raised ? HEAD - 0.17 : b.drop;
      if (open > SILL + 0.1) shaftMesh(z0, z1, SILL + 0.04, open, 0.13, 0.01, beams);
      if (!b.raised) shaftMesh(z0, z1, Math.max(SILL + 0.04, b.drop), HEAD - 0.08, 0.05, 0.01, beams);
    });
    // the hero shaft: the open window's whole clear opening (sill rail to the raised blind), landing on the dais top
    // (where it runs into the board wall the depth test cuts it, as the real light would be)
    const zw = WIN_Z[WIN_OPEN], sy0 = SILL + 0.1, sy1 = HEAD - 0.18;
    shaftMats.push(shaftMesh(zw - WIN_W / 2 + 0.07, zw + WIN_W / 2 - 0.07, sy0, sy1, 0.5, DAIS.h, shaft, btHero));
    // dust motes floating in the hero shaft (own seeded RNG; they drift slowly with animate(t))
    {
      const Rd = rng(4242), n = 140, base = new Float32Array(n * 3), ph = new Float32Array(n * 3);
      let j = 0;
      for (let tries = 0; j < n && tries < 2000; tries++) {
        const y = sy0 + (sy1 - sy0) * Rd(), zz = zw - 0.68 + 1.36 * Rd(), L = (y - DAIS.h - 0.05) / -Ld.y, t = 0.08 + 0.9 * Math.pow(Rd(), 0.8);
        const p = V(X0 - 0.13, y, zz).addScaledVector(Ld, L * t);
        if (p.x < X0 + 0.08 || p.z < Z0 + 0.06 || p.y < DAIS.h + 0.05) continue;
        base.set([p.x, p.y, p.z], j * 3); ph.set([Rd() * 6.283, Rd() * 6.283, Rd() * 6.283], j * 3); j++;
      }
      const mg = new THREE.BufferGeometry(); mg.setAttribute("position", new THREE.Float32BufferAttribute(base.slice(0, j * 3), 3));
      const dc = canvas(32, 32), dg = dc.getContext("2d", CTX)!, gr = dg.createRadialGradient(16, 16, 0, 16, 16, 16);
      gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.35, "rgba(255,250,235,0.55)"); gr.addColorStop(1, "rgba(255,240,210,0)"); dg.fillStyle = gr; dg.fillRect(0, 0, 32, 32);
      const base0 = new THREE.Color(1, 0.94, 0.8).multiplyScalar(0.9);
      const mm = new THREE.PointsMaterial({ size: 0.024, map: ctex(dc, true, false), color: base0.clone(), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true });
      const motes = new THREE.Points(mg, mm); motes.layers.set(NOINK); motes.renderOrder = 11; motes.frustumCulled = false; motes.name = "classroom:motes"; shaft.add(motes);
      shaftMats.push({ m: mm as unknown as THREE.MeshBasicMaterial, base: base0 });
      moteDrift = (t: number) => {
        const a = mg.getAttribute("position") as THREE.BufferAttribute;
        for (let q = 0; q < j; q++) {
          const o = q * 3;
          a.setXYZ(q, base[o] + 0.035 * Math.sin(0.23 * t + ph[o]), base[o + 1] + 0.05 * Math.sin(0.17 * t + ph[o + 1]) + 0.02 * Math.sin(0.5 * t + ph[o]), base[o + 2] + 0.035 * Math.sin(0.19 * t + ph[o + 2]));
        }
        a.needsUpdate = true;
      };
      tris += j;
    }
    // its pool on the dais: the sun patch through that window, clipped to the dais top, a soft additive glow
    const poly: [number, number][] = [];
    for (const [yy, zz] of [[sy0, zw - 0.72], [sy1, zw - 0.72], [sy1, zw + 0.72], [sy0, zw + 0.72]] as const) { const p = V(X0 - 0.13, yy, zz).addScaledVector(Ld, (yy - DAIS.h) / -Ld.y); poly.push([p.x, p.z]); }
    const clip = (pts: [number, number][], axis: 0 | 1, v: number, keepLess: boolean) => {
      const out: [number, number][] = [];
      for (let i2 = 0; i2 < pts.length; i2++) {
        const a = pts[i2], b = pts[(i2 + 1) % pts.length], ina = keepLess ? a[axis] <= v : a[axis] >= v, inb = keepLess ? b[axis] <= v : b[axis] >= v;
        if (ina) out.push(a);
        if (ina !== inb) { const t = (v - a[axis]) / (b[axis] - a[axis]); out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]); }
      }
      return out;
    };
    let pp = clip(poly, 1, DAIS.z1 - 0.01, true); pp = clip(pp, 1, Z0 + 0.01, false); pp = clip(pp, 0, DAIS.x0 + 0.01, false); pp = clip(pp, 0, DAIS.x1 - 0.01, true);
    if (pp.length >= 3) {
      const pc = new THREE.Vector2(); pp.forEach(([x, z]) => pc.add(new THREE.Vector2(x, z))); pc.divideScalar(pp.length);
      const pos: number[] = [], uv: number[] = [];
      for (let i2 = 0; i2 < pp.length; i2++) { const a = pp[i2], b = pp[(i2 + 1) % pp.length]; pos.push(pc.x, DAIS.h + 0.003, pc.y, b[0], DAIS.h + 0.003, b[1], a[0], DAIS.h + 0.003, a[1]); uv.push(0.5, 0.95, 0.5, 0.05, 0.5, 0.05); }
      const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
      const base = new THREE.Color(1, 0.92, 0.78).multiplyScalar(0.4);
      const m = new THREE.MeshBasicMaterial({ map: bt, color: base.clone(), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
      const mesh = new THREE.Mesh(g, m); mesh.layers.set(NOINK); mesh.renderOrder = 9; shaft.add(mesh); shaftMats.push({ m, base }); tris += pp.length;
    }
  }

  // ---------------- sun (shadow frustum fitted to the room box seen from the sun, including the roof) ----------------
  const tgt = V(0, 1.4, 0);
  const fit = (() => {
    const ax = new THREE.Vector3().crossVectors(V(0, 1, 0), sd).normalize(), ay = new THREE.Vector3().crossVectors(sd, ax);
    let l = Infinity, r = -Infinity, b = Infinity, t = -Infinity;
    for (const x of [X0 - WT - 0.05, X1 + 0.05]) for (const y of [0, ROOF + 0.05]) for (const z of [Z0 - 0.25, Z1 + 0.25]) {
      const p = V(x, y, z).sub(tgt), u = p.dot(ax), v = p.dot(ay);
      l = Math.min(l, u); r = Math.max(r, u); b = Math.min(b, v); t = Math.max(t, v);
    }
    return { left: l - 0.1, right: r + 0.1, top: t + 0.1, bottom: b - 0.1, near: 0.5, far: 50 };
  })();
  const L: typeof LIGHTS = {
    ...LIGHTS,
    sun: { color: CLASSROOM_SUN.color, intensity: opts.sunIntensity ?? CLASSROOM_SUN.intensity, position: tgt.clone().addScaledVector(sd, 24).toArray() as V3, target: tgt.toArray() as V3 },
    shadow: { ...LIGHTS.shadow, camera: fit },
  };
  const sun = makeSun(L); sun.name = "classroom:sun"; sun.target.name = "classroom:sunTarget"; sun.shadow.radius = 3;

  // ---------------- anchors ----------------
  const ys = seats[youIdx];
  const zr = WIN_Z[RAD_WIN];
  let radiatorSeat = 0, best = Infinity;
  seats.forEach((s) => { const d = s.pos.distanceTo(radiatorTie); if (d < best) { best = d; radiatorSeat = s.i; } });
  // the platform spot: in the open window's sun patch on the dais, 1.9 m from the window along the sun's path, where
  // the light through the opening covers a standing figure from the feet to ~1.55 m above the dais
  const platform = (() => {
    const hd = V(Ld.x, 0, Ld.z).normalize(), p = V(X0, DAIS.h, WIN_Z[WIN_OPEN]).addScaledVector(hd, 1.9);
    p.x = Math.max(DAIS.x0 + 0.4, p.x); p.z = Math.max(Z0 + 0.55, Math.min(DAIS.z1 - 0.4, p.z)); return p;
  })();
  const zw = WIN_Z[WIN_OPEN], openY0 = sashY0 + 0.05, openY1 = TRANSOM - 0.025;
  const anchors: ClassroomAnchors = {
    seats, cards,
    you: { ...ys, neighbours: [youIdx - 1, youIdx + 1] },
    radiatorTie, radiatorSeat,
    radiatorRoute: [V(ys.pos.x - 0.05, TIE_Y, RISER_Z), radiatorTie.clone()],
    researcherPath: [V(AISLE_X[0], 0, DAIS.z1 + 0.35), ...ROW_Z.map((z) => V(AISLE_X[0], 0, z + CHAIR_Z + HIP_Z)), V(AISLE_X[0], 0, Z1 - 0.6)],
    aisleX: AISLE_X,
    platform, platformTop: DAIS.h,
    windowOut: {
      centre: V(xF, (openY0 + openY1) / 2, zw), sill: V(X0 - 0.06, SILL + 0.032, zw), outside: V(X0 - WT - 2.5, 1.6, zw), normal: V(-1, 0, 0),
      width: 2 * sashW - 0.1, height: openY1 - openY0, bottom: openY0, top: openY1, z: zw,
    },
    lecturer: V(2.75, DAIS.h, -5.65), door: V(X1 - 0.5, 0, (DOORS[0][0] + DOORS[0][1]) / 2), doorBack: V(X1 - 0.5, 0, (DOORS[1][0] + DOORS[1][1]) / 2),
  };
  void zr;

  // ---------------- cameras (vertical 9:16) ----------------
  const cardA = cards[youIdx];
  const cardLocal = (x: number, y: number, z: number) => V(x, y, z).applyAxisAngle(V(0, 1, 0), cardA.yaw).add(cardA.pos);
  const v3 = (v: THREE.Vector3): V3 => [v.x, v.y, v.z];
  const pf = anchors.platform;
  // PLAT_LOW after its tilt: 1.25 m in front of and 0.45 m beside the platform feet, 0.35 m above them, pitched 22 deg up
  const plPos = pf.clone().add(V(0.45, 0.35, 1.25)), plDir = pf.clone().sub(plPos).setY(0).normalize().multiplyScalar(Math.cos(0.384)).setY(Math.sin(0.384));
  const cams: Record<string, Cam> = {
    /** from the front corner on the window side, just under the ceiling, across all rows (faces toward the camera, the
     *  sun from behind the camera: striped sun on the front floor, the dais and the desk tops). The widest view a
     *  portrait frame gets inside the room: 75 of 84 seated figures fully in frame (missing: front-row door-side 8-11,
     *  22, 23 and the outer window seats of rows 4-6, 48 / 60 / 72, which sit just under the camera's frame edge); the
     *  empty ceiling band at the top holds a title / the 94 %. All 84 need the ceiling open (wideAll, topdown, top72) */
    wide: { pos: [-5.35, 2.98, -5.65], look: [2.1, -2.0, 4.9], fov: 92 },
    /** the mirror view from the door-side front corner (backlit: flatter light; 73 of 84 framed) */
    wideDoor: { pos: [5.24, 3.0, -5.67], look: [-2.56, -1.01, 4.83], fov: 88 },
    /** from the back corner over the rows to the board (backs of heads; the storyboard's WIDE5) */
    wideBack: { pos: [5.4, 2.95, 5.55], look: [-3.4, -0.6, -3.6], fov: 72 },
    /** ceiling open: high over the board wall looking down the whole room (faces), all 84 seats, none hidden by the wall */
    wideAll: { pos: [-0.2, 16, -9.5], look: [-0.2, 0, 0.9], fov: 62 },
    /** ceiling open: straight down over the room (board at the top of the frame), all 84 seats and the wall tops */
    topdown: { pos: [-0.1, 30, 0.401], look: [-0.1, 0, 0.4], fov: 42 },
    /** ceiling open: the storyboard's TOP, pitch -72 deg from the back; seats inside x 6-92 %, y 27-62 % */
    top72: { pos: [-0.2, 20.45, 8.59], look: [-0.2, 0, 1.95], fov: 52 },
    /** over the protagonist's right shoulder (camera 0.3 m right of, 0.87 m above and 0.35 m behind the hip) onto the
     *  hero card: your head and shoulder fill the left edge, the card sits right of centre, clear of your body */
    seat: { pos: v3(ys.pos.clone().add(V(0.3, 0.868, 0.352))), look: v3(cardA.pos.clone().add(V(-0.014, -0.031, -0.088))), fov: 46 },
    /** macro on the hero card's 0-5 boxes (first rows) */
    card: { pos: v3(cardLocal(0.03, 0.21, 0.02)), look: v3(cardLocal(0.032, 0, -0.07)), fov: 44 },
    /** the board's 0-5 scale from the aisle at standing eye height */
    board: { pos: [-1.4, 1.75, -2.1], look: [-1.15, 1.62, -6.0], fov: 50 },
    /** a front-row classmate's eye level (seated, 1.15 m) from the window-side aisle, looking across the beam at the
     *  platform spot: the figure full length on the dais, the shaft of sun entering from the left (beam, drifting motes,
     *  its pool on the dais), the blind-striped sun on the yellow board wall behind him, the board's edge at the right */
    platform: { pos: [pf.x + 2.15, 1.15, pf.z + 2.0], look: [pf.x, pf.y + 1.05, pf.z], fov: 54 },
    /** a true low angle from the floor of the cross aisle in front of the dais, the open window behind-left of the
     *  figure (looks along the beam, so the shaft reads as a warm wash round him) */
    platformLow: { pos: [pf.x + 2.55, 0.45, pf.z + 1.35], look: [pf.x - 0.1, pf.y + 1.1, pf.z + 0.1], fov: 55 },
    /** the storyboard's PLAT_LOW after its tilt: 1.25 m in front of / 0.45 m beside the platform feet, 0.35 m up, 22 deg up */
    platformClose: { pos: v3(plPos), look: v3(plPos.clone().add(plDir)), fov: 46 },
    /** from inside toward the open window (lawn, trees, the teaching block across the lawn outside) */
    windowOut: { pos: [-3.2, 1.62, zw + 1.4], look: [X0 - 1.0, 1.4, zw - 0.45], fov: 56 },
    /** from the dais over the class toward the back */
    front: { pos: [1.3, 2.75, -5.65], look: [-0.8, -0.3, 3.2], fov: 70 },
    /** across the room to the windows */
    window: { pos: [3.2, 1.75, 4.4], look: [-5.6, 0.9, -1.2], fov: 60 },
    /** across the room to the door wall */
    door: { pos: [-2.6, 1.75, 2.2], look: [5.8, 0.9, -3.0], fov: 58 },
  };

  // ---------------- animation and set-piece controls ----------------
  const fanSpeed = opts.fanSpeed ?? 0.35;
  const animate = (t: number) => {
    const s0 = 10 * 3600 + 42 * 60 + 8 + Math.max(0, t), whole = Math.floor(s0), sec = (whole % 60) + ease((s0 - whole) / 0.14);
    const min = (Math.floor(s0 / 60) % 60) + sec / 60, hr = (Math.floor(s0 / 3600) % 12) + min / 60;
    hS.rotation.z = -(sec / 60) * Math.PI * 2; hM.rotation.z = -(min / 60) * Math.PI * 2; hH.rotation.z = -(hr / 12) * Math.PI * 2;
    if (bS && bM && bH) { bS.rotation.z = hS.rotation.z; bM.rotation.z = hM.rotation.z; bH.rotation.z = hH.rotation.z; }
    fans.forEach((f, i) => { f.rotation.y = i * 0.7 + Math.max(0, t) * fanSpeed * Math.PI * 2 * (i % 2 ? 1.04 : 1); });
    moteDrift(Math.max(0, t));
  };
  const setCeilingOpen = (u: number) => {
    const x = Math.min(1, Math.max(0, u));
    ceiling.position.set(15 * ease((x - 0.3) / 0.7), 1.3 * ease(x / 0.3), 0);
    ceiling.visible = x < 0.999;
  };
  const setWindowOpen = (u: number) => { const th = ease(u) * (80 * Math.PI) / 180; for (const s of sashes) s.rotation.y = -(s.userData.dir as number) * th; };
  const setShaft = (u: number) => { const x = Math.min(1, Math.max(0, u)); shaft.visible = x > 0.001; for (const { m, base } of shaftMats) m.color.copy(base).multiplyScalar(x); };
  animate(0); setCeilingOpen(0); setWindowOpen(0); setShaft(0);
  return {
    group, anchors, cams, lights: [sun, sun.target], animate, setCeilingOpen, setWindowOpen, setShaft,
    objects: { ceiling, sashes, shaft, heroSheet, heroPen, clockHands, fans, sun, beams, sky, outside, shadowRoof, backHands },
    backClock: { centre: V(BACK_CLOCK.x, BACK_CLOCK.y, BACK_CLOCK.z - 0.055), radius: 0.2, normal: V(0, 0, -1) },
    tris: Math.round(tris),
  };
}
