// "group" set: the 1974 psychology lab of Ingham et al. (the rope-pulling study behind social loafing), built in code.
// 8 m (x) x 5 m (z), 3.2 m suspended ceiling. Plain and literal on purpose: one rope line, one big round dial.
//  - shell: pale green glazed tile dado (0.15 m tiles, 9 courses to 1.35 m, a darker bullnose cap and a cove skirting),
//    cream paint above, a muted cream / sage checker lino floor (0.3 m tiles, low contrast, waxed), acoustic ceiling
//    tiles with six surface fluorescent battens (opal diffusers, emissive, NOINK).
//  - two tall steel windows on the -z wall with venetian blinds (slats tilted, NOINK) and cast-iron column radiators;
//    a low afternoon sun (LAB_SUN, 22 deg up from the -x / -z side, behind-left of the main camera) lays blind stripes
//    across the floor, the rope line and the floor toward the door; a painted view outside (NOINK).
//  - THE APPARATUS at the -x end wall: a grey hammertone steel frame (two uprights bolted to the floor, braced back to the
//    wall and forward to floor plates, a mounting plate filling it from the load bar to the top rail) carrying a 0.64 m
//    round dial gauge (white enamel face, bold black ticks, 0 10 ... 100 over 300 deg from 7 to 5 o'clock, a red
//    needle, chrome bezel, glass with a thin highlight crescent at the upper-left rim only) centred 1.45 m up, facing +x;
//    under it at rope height (0.9 m, level with the pullers' hands) a load cell, eye bolt and galvanised D-shackle where
//    the rope ties on. A black cable runs from the load cell over the load bar, down the frame and along the wall foot to
//    a 1970s strip-chart recorder (red trace) on a steel trolley in the window-side corner.
//  - floor: six taped squares (yellow floor tape) numbered 1-6 (stencil digits on the camera side of each square, each
//    turned to read upright from cams.side, so they read sideways / upside down from cams.main), 1.3 m from the
//    shackle and 0.8 m apart along the rope line.
//  - dressing, all against the walls and never on the rope line: at the gauge end (window side) a spare rope coiled on a
//    wall peg, a red fire extinguisher on a bracket, and a cork board with blank-looking notes on the pier above the
//    recorder trolley; the area directly behind the dial stays plain. Grey-green steel desk (clipboard, papers,
//    anglepoise lamp, mug, pencil pot, notebook, stopwatch) with its chair, a shelf of plain binders, a pinned graph
//    sheet (a falling curve of dots, no text) on the pier between window 2 and the shelf, a dark coat stand beside the
//    desk with a white lab coat turned to face the main camera, a 4-drawer filing cabinet in the +x / -z corner, a flush
//    wooden door with a vision panel, a wooden bench and a chair on the +z wall, surface conduit and a switch.
//    No text, no brand, no wall clock.
//  - NO rope: the film draws kit/rope.ts ropes between the figures' hands; see anchors.
//
// Use:
//   const M = mats(makeEnv(gl), makeEnv(gl, LAB_FILL));             // pbr.ts; LAB_FILL is the room's env
//   const lab = buildLab(M);  root.add(lab.group, ...lab.lights);    // lights = [sun, sun.target, dialLamp, its target]
//   per frame: lab.setDial(v) (0..100, the needle; 0 at 7 o'clock, 100 at 5 o'clock, clockwise), lab.animate(t)
//     (recorder pen wiggle; pure function of t), optional lab.setLight({ sun, lamp }) (0..1 sun, 0..1.5 dial lamp).
//   film camera: enable vasa/ink NOINK (glass, slats, diffusers, the view outside); gl.shadowMap.type =
//     LIGHTS.shadow.type, N8AO per LAB_AO, NEUTRAL tone mapping. Cards: LAB_CAST_LIGHT is a cast.ts CastLight.
// Anchors (metres, y up, floor y 0; the gauge at -x, pullers pull toward +x):
//   hook        where the rope ties on: the front of the D-shackle's bow (on the bow wire's centreline),
//               (-3.365, 0.9, -0.7); y = ropeY (0.9), z = ropeZ (-0.7). Tie with kit/rope attachA
//               { kind: "knot", axis: hookTie.axis (0,0,1), postR: hookTie.postR (0.0075) }.
//   positions   6 floor points: the centres of the taped squares 1..6 (x = -3.357 + 1.3 + 0.8 i, z = ropeZ)
//   facing      -PI/2: the yaw that faces the gauge (-x)
//   researcher  (-1.617, 0, -1.08): just behind square 1 on the window (-z) side, 0.38 m off the rope line (her card
//               stays clear of the rope), for the blindfold beat; in cams.pos1 her face is left of square 1's
//               (NDC x ~ -0.42 vs +0.43). Move her to researcherIdle before the slack-rope beat.
//   researcherIdle: (-3.3, 0, 1.6), on the +z side behind the main camera: out of every cam's frame
//   desk / deskTop  floor point in front of the desk (chair spot) / the desk-top centre;  door: floor point inside it
//   dialCentre / dialNormal (+x) / dialRadius (white face radius, 0.28) / dialBezelRadius (0.324)
// Rope recipe (preview/lab_common.ts): aimAt each puller's arm 1 at (p.x - 1.2, ropeY, ropeZ); one Rope from hook
//   through every hand (lead, rear per square) with NO slack (the kit's TAUT default) and attachA = the knot above;
//   the tail = a second Rope from square 6's rear hand to the floor, slack = lieSlack(hand, floorEnd). Pretend-pull
//   beat: hook -> square 1's two hands taut, then a second Rope from square 1's rear hand through squares 2-6 with
//   0.5-0.8 m of slack. Measured: hands 0.82-0.95 m (side drawing), hook -> square 1 slope 0.6 deg in cams.side,
//   -3.3 deg in cams.main; the rope deviates <= 3 cm from straight (the knot's exit); 0 collider hits.
// Cams (9:16, eye level, untilted). Pullers use the "side" haul drawing in main and side (it reads as pulling toward
//   the gauge; the front drawing leans the whole line sideways like dominoes); the front drawing only in pos1.
//   main      the faces camera: beside the gauge, 1.95 m to the camera side of the line, square 1 large at the left
//             (rope out of the left edge toward the shackle), heads separating in a diagonal to square 6 at the right
//             (NDC x -0.58 .. 0.88). The dial is behind it (it faces +x): use side / dial for the dial.
//   side      the establishing / counting camera from the door end on the camera side, 7 deg down: the dial upper left
//             (bezel NDC x -0.69 .. -0.90), the rope line and all six squares (square 6's head NDC x 0.74); the lens
//             (~74.6 deg) is solved in code so the bezel and square 6's head stay inside NDC +-0.9.
//   pos1      head and torso of square 1 (front drawing) with the researcher behind it (blindfold beat).
//   dial      square-on, bezel ~85 % of the width;  dialFull  same axis and lens, the white face fills the width (a
//             straight push from dial to dialFull; the match cut to a round wall clock).
// Cost: ~30.3k tris, 58 meshes (static parts merged per material), textures <= 2048 px, seeded RNG only; builds in
// ~1.5-2 s alone on SwiftShader (preview/lab_*.ts log it). objects.colliders = solid boxes (frame, desk, chair,
// cabinet, trolley, bench, radiators, coat stand, door, rope coil, extinguisher) for rope.clearance / cardClearance.
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { mats, makeSun, LIGHTS, type EnvSpec } from "../../bt/pbr";
import * as W from "../../bt/woodtex";
import { NOINK } from "../../vasa/ink";
import { laminate, corkTex, fabricTex, ceilingTiles } from "./classroom";

type RGB = [number, number, number];
type V3 = [number, number, number];
type Mats = ReturnType<typeof mats>;
export type Cam = { pos: V3; look: V3; fov: number };

// =====================================================================================================================
// light
// =====================================================================================================================
/** world-frame fill: warm floor bounce, cream / pale-green walls at the horizon, the fluorescent ceiling, cool daylight
 *  from the window wall (-z, azimuth 270) and the warm bounce of the sun patches (toward +z / +x) */
export const LAB_FILL: EnvSpec = {
  frame: "world",
  stops: [
    [-90, [0.2, 0.183, 0.153]], [-30, [0.221, 0.204, 0.174]], [-5, [0.264, 0.268, 0.242]], [5, [0.315, 0.319, 0.297]],
    [30, [0.357, 0.361, 0.353]], [60, [0.399, 0.404, 0.399]], [90, [0.425, 0.429, 0.425]],
  ],
  boxes: [
    { az: 270, el: 14, rot: 0, w: 60, h: 22, soft: 14, col: [0.74, 0.82, 0.95] },     // the window wall: daylight
    { az: 0, el: 72, rot: 0, w: 22, h: 10, soft: 6, col: [1.0, 1.02, 0.99] },          // fluorescent battens
    { az: 180, el: 72, rot: 0, w: 22, h: 10, soft: 6, col: [1.0, 1.02, 0.99] },
    { az: 90, el: 55, rot: 0, w: 26, h: 10, soft: 6, col: [0.9, 0.92, 0.9] },
    { az: 270, el: 55, rot: 0, w: 26, h: 10, soft: 6, col: [0.9, 0.92, 0.9] },
    { az: 70, el: -40, rot: 0, w: 46, h: 25, soft: 18, col: [0.6, 0.49, 0.35] },       // sunlit floor patches
  ],
};
export const LAB_AO = { aoRadius: 0.4, distanceFalloff: 1.0, intensity: 2.0, color: "#2a1a10" };
/** toward the sun: low (22 deg) from the window wall (-z) and the gauge end (-x), so the light travels across the
 *  rope line toward +z / +x: the blind stripes cross the rope line and the floor in front of the door, the pullers'
 *  fronts (facing -x) catch it, and it is behind-left of the main camera */
export const LAB_SUN = { dir: [-0.55, 0.38, -0.74] as V3, intensity: 13, color: "#ffe6c4" };
/** cast.ts CastLight for the cards in this room (structural copy, so the set does not import the cast kit). Key =
 *  LAB_SUN.dir (the crescent sits on the side away from the windows, like the set's cast shadows). A bright daylight
 *  lab (blinds + fluorescent tubes): lit side near neutral, a touch cool, light skin bleached near white; shadow
 *  lavender (reference store / office: head shadow/lit ~0.7-0.75, cloth ~0.5, never green), crescent edge ~0.12 r;
 *  thin lit-edge sheen on the torsos. Sunlit floor: a dark blue-violet contact shadow with a short tail away from the
 *  windows (reference sun shadows x0.12-0.25 of the ground, darkest at the feet), not the light interior blob. */
export const LAB_CAST_LIGHT = {
  key: [-0.55, 0.38, -0.74] as V3, tint: [0.99, 1.0, 1.04] as V3, tintK: 1, gain: 1.0, grad: 0.22, bodyGrad: 0.16, sideTint: [0.93, 0.94, 0.98] as V3,
  shade: [1.04, 0.95, 1.3] as V3, shadeK: 0.32, bodyShadeK: 0.42, wrap: [26, 52] as [number, number], edge: 0.13, broad: 0, bodySat: 0.12, sheen: 0.1, lift: 0,
  bleach: 0.75, contact: "#8a8fb2", contactLen: 0.5,
};

// =====================================================================================================================
// canvas infrastructure (classroom.ts / woodtex.ts style)
// =====================================================================================================================
type G = CanvasRenderingContext2D;
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
/** separable box blur (x3) of a greyscale canvas (R channel), wrapping */
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
const spot = (g: G, x: number, y: number, rx: number, ry: number, col: string, col0: string) => {
  g.save(); g.translate(x, y); g.scale(1, ry / rx);
  const gr = g.createRadialGradient(0, 0, 0, 0, 0, rx); gr.addColorStop(0, col); gr.addColorStop(1, col0);
  g.fillStyle = gr; g.beginPath(); g.arc(0, 0, rx, 0, Math.PI * 2); g.fill(); g.restore();
};

// ---------------- font-free digits (polylines in a 0.6 x 1 box; classroom.ts glyph set, digits only) ----------------
type Poly = [number, number][];
const arc = (cx: number, cy: number, rx: number, ry: number, a0: number, a1: number, n = 14): Poly => {
  const out: Poly = [];
  for (let i = 0; i <= n; i++) { const a = ((a0 + ((a1 - a0) * i) / n) * Math.PI) / 180; out.push([cx + rx * Math.cos(a), cy + ry * Math.sin(a)]); }
  return out;
};
const GLYPH: Record<string, Poly[]> = {
  "0": [arc(0.3, 0.5, 0.27, 0.48, -90, 270, 30)],
  "1": [[[0.1, 0.22], [0.34, 0.02], [0.34, 1]]],
  "2": [[...arc(0.3, 0.27, 0.27, 0.25, -170, 15), [0.03, 1], [0.6, 1]]],
  "3": [arc(0.3, 0.26, 0.25, 0.24, -160, 90), arc(0.3, 0.74, 0.28, 0.26, -90, 160)],
  "4": [[[0.47, 1], [0.47, 0.02], [0.02, 0.68], [0.6, 0.68]]],
  "5": [[[0.56, 0.02], [0.12, 0.02], [0.07, 0.47], ...arc(0.3, 0.69, 0.29, 0.3, -140, 150)]],
  "6": [[...arc(0.55, 0.62, 0.48, 0.6, -105, -180, 10), ...arc(0.32, 0.72, 0.26, 0.27, 180, 540, 20)]],
  "7": [[[0.02, 0.02], [0.58, 0.02], [0.22, 1]]],
  "8": [arc(0.3, 0.25, 0.23, 0.23, 90, 450, 20), arc(0.3, 0.73, 0.28, 0.26, -90, 270, 20)],
  "9": [arc(0.3, 0.29, 0.26, 0.28, 0, 360, 20), [[0.56, 0.3], [0.52, 0.7], [0.38, 1]]],
};
const glyphWidth = (text: string, size: number, adv = 0.78) => { let w = 0; for (const ch of text) w += (ch === "1" ? 0.55 : adv) * size; return w - (adv - 0.6) * size; };
/** stroke a digit string centred at (cx, cy), glyph height `size` */
const digits = (g: G, text: string, cx: number, cy: number, size: number, w: number, col: string, adv = 0.78) => {
  let x = cx - glyphWidth(text, size, adv) / 2; const y = cy - size / 2;
  g.strokeStyle = col; g.lineWidth = w; g.lineCap = "round"; g.lineJoin = "round";
  for (const ch of text) {
    const off = ch === "1" ? -0.08 * size : 0;
    for (const p of GLYPH[ch] ?? []) { g.beginPath(); p.forEach(([gx, gy], i) => (i ? g.lineTo(x + off + gx * size, y + gy * size) : g.moveTo(x + off + gx * size, y + gy * size))); g.stroke(); }
    x += (ch === "1" ? 0.55 : adv) * size;
  }
};

// =====================================================================================================================
// textures
// =====================================================================================================================
/** pale green glazed wall tiles, 0.15 m, thin light grout, glossy glaze pooled darker at the edges, a little crazing.
 *  Tile 1.2 m (8 x 8 tiles) at 1024 px; v = metres up (courses at multiples of 0.15 m). */
export function glazedTile(o: { seed?: number; color?: RGB } = {}): W.WoodTex {
  const N = 1024, t = N / 8, R = rng(o.seed ?? 101), base = o.color ?? [172, 206, 182];
  const S = new Sheet(N, N, [214, 214, 202], 40, 228), { a, h, r } = S, gw = 3;
  for (let ty = 0; ty < 8; ty++) for (let tx = 0; tx < 8; tx++) {
    const x0 = tx * t + gw / 2, y0 = ty * t + gw / 2, w = t - gw, k = 0.965 + 0.06 * R();
    const tone = mix(mul(base, k), [196, 222, 200], 0.15 * R());
    a.fillStyle = css(tone); a.fillRect(x0, y0, w, w);
    // glaze pooling: darker, greener edges; a soft lighter centre
    const ge = a.createRadialGradient(x0 + w * 0.45, y0 + w * 0.42, w * 0.15, x0 + w / 2, y0 + w / 2, w * 0.75);
    ge.addColorStop(0, css([236, 246, 236], 0.14)); ge.addColorStop(0.6, css(tone, 0)); ge.addColorStop(1, css(mul(base, 0.78), 0.32));
    a.fillStyle = ge; a.fillRect(x0, y0, w, w);
    h.fillStyle = grey(220); h.fillRect(x0 + 1, y0 + 1, w - 2, w - 2);
    r.fillStyle = grey(38 + 18 * R()); r.fillRect(x0, y0, w, w);
    if (R() < 0.25) { // crazing: a few fine hairline cracks
      a.strokeStyle = css(mul(base, 0.7), 0.18); a.lineWidth = 0.8;
      for (let c = 0; c < 4; c++) { a.beginPath(); let px = x0 + R() * w, py = y0 + R() * w; a.moveTo(px, py); for (let s = 0; s < 5; s++) { px = Math.min(x0 + w, Math.max(x0, px + (R() - 0.5) * 30)); py = Math.min(y0 + w, Math.max(y0, py + (R() - 0.5) * 30)); a.lineTo(px, py); } a.stroke(); }
    }
  }
  blurGrey(S.ch, 2.2); // cushion edges
  // grout grime toward the bottom of each course
  for (let ty = 0; ty < 8; ty++) { a.fillStyle = css([150, 146, 128], 0.18); a.fillRect(0, ty * t - 1, N, 3); }
  return S.done(new THREE.Vector2(1 / 1.2, 1 / 1.2), 1.4);
}

/** cream emulsion over plaster: orange-peel roller texture, broad mottle. Tile 1.2 m, 512 px. */
export function paintTex(o: { seed?: number; color?: RGB } = {}): W.WoodTex {
  const N = 512, R = rng(o.seed ?? 111), base = o.color ?? [238, 226, 198], S = new Sheet(N, N, base, 128, 215), { a, h } = S;
  for (let i = 0; i < 7000; i++) { const x = R() * N, y = R() * N; h.fillStyle = grey(R() < 0.5 ? 170 : 90, 0.35); h.fillRect(x, y, 2, 2); }
  for (let i = 0; i < 34; i++) {
    const x = R() * N, y = R() * N, lt = R() < 0.5, c: RGB = lt ? [255, 250, 236] : mul(base, 0.86);
    S.wrap(x - 140, y - 140, x + 140, y + 140, (dx, dy) => spot(a, x + dx, y + dy, 50 + 90 * R(), 40 + 70 * R(), css(c, 0.07), css(c, 0)));
  }
  blurGrey(S.ch, 1.2);
  return S.done(new THREE.Vector2(1 / 1.2, 1 / 1.2), 0.5);
}

/** lino tiles, 0.3 m checker of cream and muted sage, marbled chips, waxed sheen with scuffs. Tile 2.4 m at 2048 px. */
export function labFloor(o: { seed?: number } = {}): W.WoodTex {
  const N = 2048, t = N / 8, R = rng(o.seed ?? 121), S = new Sheet(N, N, [120, 116, 104], 70, 150), { a, h, r } = S;
  const A: RGB = [228, 220, 200], B: RGB = [194, 198, 182];
  for (let ty = 0; ty < 8; ty++) for (let tx = 0; tx < 8; tx++) {
    const odd = (tx + ty) % 2 === 1, base = odd ? B : A, x0 = tx * t + 1.5, y0 = ty * t + 1.5, w = t - 3;
    const tone = mul(base, 0.975 + 0.05 * R());
    a.fillStyle = css(tone); a.fillRect(x0, y0, w, w);
    h.fillStyle = grey(200); h.fillRect(x0, y0, w, w);
    r.fillStyle = grey(96 + 16 * R()); r.fillRect(x0, y0, w, w);
    a.save(); a.beginPath(); a.rect(x0, y0, w, w); a.clip();
    const along = R() < 0.5, chips: RGB[] = odd ? [[210, 214, 200], [172, 178, 164], [222, 224, 212]] : [[246, 240, 224], [204, 194, 172], [214, 206, 188]];
    for (let i = 0; i < 300; i++) {
      const c = chips[Math.floor(R() * chips.length)], x = x0 + R() * w, y = y0 + R() * w, l = 4 + 12 * R(), ww = 1.2 + 2.2 * R();
      a.fillStyle = css(c, 0.2 + 0.3 * R()); a.beginPath(); a.ellipse(x, y, along ? l : ww, along ? ww : l, (R() - 0.5) * 0.4, 0, Math.PI * 2); a.fill();
    }
    spot(a, x0 + w * (0.3 + 0.4 * R()), y0 + w * (0.3 + 0.4 * R()), w * 0.5, w * 0.35, css([255, 252, 240], 0.08), css([255, 252, 240], 0));
    a.restore();
    a.fillStyle = "rgba(255,255,248,0.18)"; a.fillRect(x0, y0, w, 1.4); a.fillRect(x0, y0, 1.4, w);
    a.fillStyle = "rgba(70,60,40,0.12)"; a.fillRect(x0, y0 + w - 1.4, w, 1.4); a.fillRect(x0 + w - 1.4, y0, 1.4, w);
  }
  blurGrey(S.ch, 1.1);
  for (let i = 0; i < 70; i++) {
    const x = R() * N, y = R() * N, l = 12 + 34 * R(), ang = R() * 6.28, w = 2 + 2.5 * R(), al = 0.06 + 0.1 * R();
    S.wrap(x - 40, y - 40, x + 40, y + 40, (dx, dy) => {
      a.strokeStyle = css([60, 55, 48], al); a.lineWidth = w; a.beginPath(); a.moveTo(x + dx - Math.cos(ang) * l / 2, y + dy - Math.sin(ang) * l / 2); a.quadraticCurveTo(x + dx + 4, y + dy - 3, x + dx + Math.cos(ang) * l / 2, y + dy + Math.sin(ang) * l / 2); a.stroke();
    });
  }
  for (let i = 0; i < 60; i++) {
    const x = R() * N, y = R() * N, rr = 60 + 140 * R(), v = 70 + 80 * R();
    S.wrap(x - rr, y - rr, x + rr, y + rr, (dx, dy) => spot(r, x + dx, y + dy, rr, rr * 0.7, grey(v, 0.35), grey(v, 0)));
  }
  return S.done(new THREE.Vector2(1 / 2.4, 1 / 2.4), 0.8);
}

/** the gauge face: white enamel, bold black ticks 0-100 (1 / 5 / 10), digits every 10 over a 300 deg sweep from
 *  7 o'clock (0) clockwise to 5 o'clock (100), an inner ring and a small hub ring. 2048 px square = the face disc. */
export function dialFaceTex(): THREE.CanvasTexture {
  const N = 2048, c = N / 2, cv = canvas(N, N), g = cv.getContext("2d", CTX)!;
  g.fillStyle = "#e9e6dc"; g.fillRect(0, 0, N, N);
  const bg = g.createRadialGradient(c * 0.92, c * 0.86, c * 0.1, c, c, c);
  bg.addColorStop(0, "#fbfaf5"); bg.addColorStop(0.75, "#f5f3eb"); bg.addColorStop(1, "#efece4");
  g.fillStyle = bg; g.beginPath(); g.arc(c, c, c, 0, Math.PI * 2); g.fill();
  const ang = (v: number) => ((210 + 3 * v) * Math.PI) / 180;
  const P = (v: number, rr: number): [number, number] => [c + rr * c * Math.sin(ang(v)), c - rr * c * Math.cos(ang(v))];
  g.lineCap = "butt";
  // the scale arc
  g.strokeStyle = "#16171a"; g.lineWidth = 7;
  g.beginPath(); g.arc(c, c, 0.93 * c, ang(0) - Math.PI / 2, ang(100) - Math.PI / 2 + 2 * Math.PI, false); g.stroke();
  for (let v = 0; v <= 100; v++) {
    const major = v % 10 === 0, mid = v % 5 === 0;
    const r0 = major ? 0.795 : mid ? 0.84 : 0.875, w = major ? 20 : mid ? 11 : 5.5;
    const [x0, y0] = P(v, r0), [x1, y1] = P(v, 0.93);
    g.strokeStyle = "#16171a"; g.lineWidth = w; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
  }
  for (let v = 0; v <= 100; v += 10) {
    const [x, y] = P(v, 0.655), s = 0.122 * c;
    digits(g, String(v), x, y, s, 0.021 * c, "#16171a", v === 100 ? 0.7 : 0.78);
  }
  // fine rings: just inside the bezel and round the hub
  g.strokeStyle = "rgba(22,23,26,0.85)"; g.lineWidth = 4; g.beginPath(); g.arc(c, c, 0.975 * c, 0, Math.PI * 2); g.stroke();
  g.lineWidth = 5; g.beginPath(); g.arc(c, c, 0.13 * c, 0, Math.PI * 2); g.stroke();
  return ctex(cv, true, false);
}

/** soft reflection on the gauge glass (alpha): only a thin crescent hugging the upper-left of the bezel, outside the
 *  scale (texture radius > 0.93 of the face), and a tiny glint there, so every numeral and tick prints the same black */
function glassReflTex(): THREE.CanvasTexture {
  const N = 512, c = N / 2, cv = canvas(N, N), g = cv.getContext("2d", CTX)!, R0 = c * (0.28 / 0.284);
  g.clearRect(0, 0, N, N); g.lineCap = "round";
  // the crescent: short arc pieces, alpha rising and falling along it (no blur filter), centred on 10:30
  const a0 = Math.PI * 0.82, a1 = Math.PI * 1.68, n = 80;
  for (const [rr, lw, k] of [[0.965, 0.05, 0.22], [0.968, 0.022, 0.5]] as const) {
    g.lineWidth = lw * R0;
    for (let i = 0; i < n; i++) {
      const t0 = i / n, t1 = (i + 1) / n, w = Math.pow(Math.sin(Math.PI * (t0 + t1) / 2), 1.6);
      g.strokeStyle = `rgba(255,255,255,${(k * w).toFixed(3)})`;
      g.beginPath(); g.arc(c, c, rr * R0, a0 + (a1 - a0) * t0, a0 + (a1 - a0) * t1 + 0.004); g.stroke();
    }
  }
  spot(g, c + Math.cos(Math.PI * 1.22) * 0.955 * R0, c + Math.sin(Math.PI * 1.22) * 0.955 * R0, N * 0.03, N * 0.016, "rgba(255,255,255,0.7)", "rgba(255,255,255,0)");
  return ctex(cv, true, false);
}

/** the six taped floor marks: a 3 x 2 atlas of 512 x 768 cells; each cell = 0.6 m (u, along x) x 0.9 m (v, along z):
 *  a 0.5 m square of 5 cm yellow floor tape (slightly crooked, worn) in the top 0.6 m and a black stencil digit below
 *  it. rot[i] = canvas rotation of digit i (glyph up = canvas (sin, -cos) = world (x, z)): the set turns each digit to
 *  read upright from the establishing camera (cams.side). Alpha-cut decal. */
function floorMarksTex(rot: number[]): THREE.CanvasTexture {
  const CW = 512, CH = 768, cv = canvas(CW * 3, CH * 2), g = cv.getContext("2d", CTX)!, R = rng(131), px = CW / 0.6;
  g.clearRect(0, 0, cv.width, cv.height);
  for (let i = 0; i < 6; i++) {
    const ox = (i % 3) * CW, oy = Math.floor(i / 3) * CH;
    g.save(); g.translate(ox, oy); g.beginPath(); g.rect(0, 0, CW, CH); g.clip();
    // tape square centred at (0.3, 0.3) m of the cell (v down = +z)
    g.save(); g.translate(0.3 * px, 0.3 * px); g.rotate((R() - 0.5) * 0.05);
    const s = 0.5 * px, tw = 0.05 * px;
    const strip = (x: number, y: number, w: number, h: number) => {
      g.fillStyle = css([226, 181, 44]); g.fillRect(x, y, w, h);
      for (let k = 0; k < 40; k++) { g.fillStyle = css([150, 112, 30], 0.1 + 0.14 * R()); g.fillRect(x + R() * w, y + R() * h, 2 + 6 * R(), 1 + 2 * R()); }
      g.fillStyle = "rgba(255,236,150,0.45)"; g.fillRect(x, y, w, 1.5);
    };
    strip(-s / 2, -s / 2, s, tw); strip(-s / 2, s / 2 - tw, s, tw); strip(-s / 2, -s / 2 + tw, tw, s - 2 * tw); strip(s / 2 - tw, -s / 2 + tw, tw, s - 2 * tw);
    // torn / worn bits (punch alpha)
    g.globalCompositeOperation = "destination-out";
    for (let k = 0; k < 10; k++) { const e = R() * 4 | 0, f = (R() - 0.5) * s; const [x, y] = e === 0 ? [f, -s / 2] : e === 1 ? [f, s / 2] : e === 2 ? [-s / 2, f] : [s / 2, f]; g.beginPath(); g.ellipse(x, y, 3 + 6 * R(), 2 + 4 * R(), R() * 3, 0, Math.PI * 2); g.fill(); }
    g.globalCompositeOperation = "source-over";
    g.restore();
    // the stencil digit: centred at (0.3, 0.73) m of the cell, 0.15 m tall, turned by rot[i]
    g.save(); g.translate(0.3 * px, 0.73 * px); g.rotate(rot[i]);
    digits(g, String(i + 1), 0, 0, 0.15 * px, 0.026 * px, "rgba(24,24,26,0.9)");
    g.restore();
    g.restore();
  }
  return ctex(cv, true, false);
}

/** a pinned sheet of graph paper with a hand-drawn falling curve of dots (no text): a lab's working chart */
function graphTex(): THREE.CanvasTexture {
  const Wd = 384, Ht = 512, cv = canvas(Wd, Ht), g = cv.getContext("2d", CTX)!;
  g.fillStyle = "#f5f3ea"; g.fillRect(0, 0, Wd, Ht);
  g.strokeStyle = "rgba(80,150,170,0.35)"; g.lineWidth = 1;
  for (let x = 24; x < Wd - 10; x += 12) { g.beginPath(); g.moveTo(x, 40); g.lineTo(x, Ht - 40); g.stroke(); }
  for (let y = 40; y < Ht - 30; y += 12) { g.beginPath(); g.moveTo(24, y); g.lineTo(Wd - 16, y); g.stroke(); }
  g.strokeStyle = "rgba(60,90,110,0.85)"; g.lineWidth = 3; g.beginPath(); g.moveTo(60, 70); g.lineTo(60, Ht - 70); g.lineTo(Wd - 40, Ht - 70); g.stroke();
  const pts = [[90, 130], [140, 205], [190, 245], [240, 268], [290, 282], [330, 290]];
  g.strokeStyle = "#2f3fa0"; g.lineWidth = 3.5; g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke();
  g.fillStyle = "#c92a1f"; for (const [x, y] of pts) { g.beginPath(); g.arc(x, y, 7, 0, Math.PI * 2); g.fill(); }
  g.strokeStyle = "rgba(70,70,80,0.3)"; g.lineWidth = 2; g.beginPath(); g.moveTo(80, 36); for (let x = 80; x < 250; x += 6) g.lineTo(x, 36 - 3 * Math.sin(x * 0.35)); g.stroke();
  return ctex(cv, true, false);
}

/** laid three-strand rope for the spare coil (u along the rope, v round it): diagonal strand bands, light hemp */
function coilTex(): THREE.CanvasTexture {
  const Wd = 64, Ht = 64, cv = canvas(Wd, Ht), g = cv.getContext("2d", CTX)!;
  g.fillStyle = "#d9bf8e"; g.fillRect(0, 0, Wd, Ht);
  for (let k = -3; k < 6; k++) {
    const x0 = k * (Wd / 3);
    const gr = g.createLinearGradient(x0, 0, x0 + Wd / 3, 0);
    gr.addColorStop(0, "rgba(120,88,44,0.55)"); gr.addColorStop(0.25, "rgba(255,240,205,0.25)"); gr.addColorStop(0.75, "rgba(170,130,72,0.1)"); gr.addColorStop(1, "rgba(120,88,44,0.55)");
    g.fillStyle = gr; g.beginPath(); g.moveTo(x0, 0); g.lineTo(x0 + Wd / 3, 0); g.lineTo(x0 + Wd / 3 + Wd, Ht); g.lineTo(x0 + Wd, Ht); g.closePath(); g.fill();
  }
  const t = ctex(cv, true, true); t.repeat.set(140, 1);
  return t;
}

/** opal diffuser of a fluorescent batten (emissive map): bright centre line, soft falloff to the edges */
function diffuserTex(): THREE.CanvasTexture {
  const cv = canvas(64, 256), g = cv.getContext("2d", CTX)!;
  const gr = g.createLinearGradient(0, 0, 64, 0);
  gr.addColorStop(0, "#c9ccc8"); gr.addColorStop(0.2, "#f1f3ef"); gr.addColorStop(0.5, "#ffffff"); gr.addColorStop(0.8, "#f1f3ef"); gr.addColorStop(1, "#c9ccc8");
  g.fillStyle = gr; g.fillRect(0, 0, 64, 256);
  const ge = g.createLinearGradient(0, 0, 0, 256);
  ge.addColorStop(0, "rgba(150,150,145,0.6)"); ge.addColorStop(0.06, "rgba(150,150,145,0)"); ge.addColorStop(0.94, "rgba(150,150,145,0)"); ge.addColorStop(1, "rgba(150,150,145,0.6)");
  g.fillStyle = ge; g.fillRect(0, 0, 64, 256);
  return ctex(cv, true, false);
}

/** the view outside the windows (unlit, painted): warm late-afternoon sky, a row of trees, a low brick block */
function outsideTex(): THREE.CanvasTexture {
  const Wd = 1024, Ht = 512, cv = canvas(Wd, Ht), g = cv.getContext("2d", CTX)!, R = rng(141);
  const sk = g.createLinearGradient(0, 0, 0, Ht);
  sk.addColorStop(0, "#8fc0e6"); sk.addColorStop(0.45, "#cfe2ec"); sk.addColorStop(0.62, "#f6e6c8"); sk.addColorStop(1, "#f2dcb4");
  g.fillStyle = sk; g.fillRect(0, 0, Wd, Ht);
  // building across the lawn
  g.fillStyle = "#b9785a"; g.fillRect(0, Ht * 0.48, Wd, Ht * 0.3);
  g.fillStyle = "#e8dfcf"; g.fillRect(0, Ht * 0.46, Wd, Ht * 0.025);
  for (let x = 20; x < Wd; x += 70) { g.fillStyle = "#5d7182"; g.fillRect(x, Ht * 0.53, 44, 34); g.fillStyle = "#e8dfcf"; g.fillRect(x - 2, Ht * 0.53 + 34, 48, 4); g.fillStyle = "#5d7182"; g.fillRect(x, Ht * 0.63, 44, 34); }
  // trees in front of it
  for (let i = 0; i < 9; i++) {
    const x = R() * Wd, y = Ht * (0.55 + 0.1 * R()), s = 50 + 50 * R(), col = ["#6f9e55", "#82ad5f", "#5f8d4c"][i % 3];
    g.fillStyle = "#6a4c34"; g.fillRect(x - 5, y, 10, Ht - y);
    g.fillStyle = col; for (let k = 0; k < 5; k++) { g.beginPath(); g.arc(x + (R() - 0.5) * s, y - s * 0.4 + (R() - 0.5) * s * 0.6, s * (0.45 + 0.2 * R()), 0, Math.PI * 2); g.fill(); }
  }
  g.fillStyle = "#86ad62"; g.fillRect(0, Ht * 0.8, Wd, Ht * 0.2);
  return ctex(cv, true, false);
}

/** note paper atlas (2 x 2): lined white, yellow, pale blue squared, pink; blank-looking (faint rules, no writing) */
function notesTex(): THREE.CanvasTexture {
  const N = 512, h = N / 2, cv = canvas(N, N), g = cv.getContext("2d", CTX)!;
  const cols = ["#f7f5ee", "#f6e79a", "#d9e9f2", "#f4cfd4"];
  for (let i = 0; i < 4; i++) {
    const ox = (i % 2) * h, oy = Math.floor(i / 2) * h;
    g.fillStyle = cols[i]; g.fillRect(ox, oy, h, h);
    g.strokeStyle = i === 2 ? "rgba(90,140,180,0.25)" : "rgba(120,140,170,0.28)"; g.lineWidth = 1.5;
    for (let y = oy + 40; y < oy + h - 10; y += 20) { g.beginPath(); g.moveTo(ox + 12, y); g.lineTo(ox + h - 12, y); g.stroke(); }
    if (i === 2) for (let x = ox + 20; x < ox + h; x += 20) { g.beginPath(); g.moveTo(x, oy + 10); g.lineTo(x, oy + h - 10); g.stroke(); }
    if (i === 0) { g.strokeStyle = "rgba(210,90,90,0.4)"; g.beginPath(); g.moveTo(ox + 34, oy); g.lineTo(ox + 34, oy + h); g.stroke(); }
    // a faint pencil scribble line, unreadable
    g.strokeStyle = "rgba(70,70,80,0.22)"; g.lineWidth = 2; g.beginPath(); g.moveTo(ox + 40, oy + 58); for (let x = 40; x < 170; x += 6) g.lineTo(ox + x, oy + 58 - 4 * Math.sin(x * 0.4)); g.stroke();
  }
  return ctex(cv, true, false);
}

/** strip-chart paper (u across, v along the strip): pale green grid with a red pen trace */
function chartTex(): THREE.CanvasTexture {
  const Wd = 256, Ht = 512, cv = canvas(Wd, Ht), g = cv.getContext("2d", CTX)!;
  g.fillStyle = "#f4f2e6"; g.fillRect(0, 0, Wd, Ht);
  g.strokeStyle = "rgba(90,160,120,0.45)"; g.lineWidth = 1;
  for (let x = 16; x < Wd; x += 16) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, Ht); g.stroke(); }
  for (let y = 0; y < Ht; y += 16) { g.beginPath(); g.moveTo(0, y); g.lineTo(Wd, y); g.stroke(); }
  g.strokeStyle = "rgba(90,160,120,0.8)"; g.lineWidth = 2;
  for (let x = 0; x < Wd; x += 80) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, Ht); g.stroke(); }
  g.strokeStyle = "#c92a1f"; g.lineWidth = 3; g.beginPath();
  for (let y = 0; y <= Ht; y += 4) {
    const lv = y < 120 ? 0.82 : y < 250 ? 0.74 : y < 380 ? 0.66 : 0.6;
    const x = 20 + (Wd - 40) * (lv + 0.02 * Math.sin(y * 0.31) + 0.015 * Math.sin(y * 0.87));
    if (y) g.lineTo(x, y); else g.moveTo(x, y);
  }
  g.stroke();
  return ctex(cv, true, false);
}

// =====================================================================================================================
// geometry kit (one merged mesh per material)
// =====================================================================================================================
const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const T = (x = 0, y = 0, z = 0, ry = 0, rx = 0, rz = 0, s: number | V3 = 1) => {
  const sc = typeof s === "number" ? V(s, s, s) : V(s[0], s[1], s[2]);
  return new THREE.Matrix4().compose(V(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz, "YXZ")), sc);
};
const at = (p: THREE.Matrix4, ...c: THREE.Matrix4[]) => c.reduce((m, x) => m.multiply(x), p.clone());
class Kit {
  lists = new Map<THREE.Material, THREE.BufferGeometry[]>();
  add(g: THREE.BufferGeometry, m: THREE.Material, mx?: THREE.Matrix4) {
    if (mx) g.applyMatrix4(mx);
    let l = this.lists.get(m); if (!l) this.lists.set(m, (l = [])); l.push(g);
    return g;
  }
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
      if (!merged) { console.warn("lab: merge failed", m.name); continue; }
      const mesh = new THREE.Mesh(merged, m);
      mesh.castShadow = !noCast.has(m); mesh.receiveShadow = true; mesh.name = `lab:${m.name || m.type}`;
      root.add(mesh);
      tris += merged.getAttribute("position").count / 3;
    }
    this.lists.clear();
    return tris;
  }
}
const bx = (w: number, h: number, d: number) => { const g = new THREE.BoxGeometry(w, h, d); W.metricGeo(g); return g; };
/** rounded box of the true size (classroom.ts rb) */
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
const cyl = (r0: number, r1: number, h: number, seg = 12, open = false) => { const g = new THREE.CylinderGeometry(r0, r1, h, seg, 1, open); W.metricGeo(g); return g; };
const lathe = (pts: [number, number][], seg = 24) => { const g = new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), seg); W.metricGeo(g); return g; };
const quad = (w: number, h: number, uv: [number, number, number, number] = [0, 0, 1, 1]) => {
  const g = new THREE.PlaneGeometry(w, h), a = g.getAttribute("uv");
  for (let i = 0; i < a.count; i++) a.setXY(i, uv[0] + a.getX(i) * (uv[2] - uv[0]), uv[1] + a.getY(i) * (uv[3] - uv[1]));
  return g;
};
const flatQuad = (w: number, d: number, uv?: [number, number, number, number]) => { const g = quad(w, d, uv); g.rotateX(-Math.PI / 2); return g; };
const rod = (a: THREE.Vector3, b: THREE.Vector3, r: number, seg = 8) => {
  const d = b.clone().sub(a), g = cyl(r, r, d.length(), seg, true);
  g.translate(0, d.length() / 2, 0);
  g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), d.clone().normalize()));
  g.translate(a.x, a.y, a.z);
  return g;
};
/** square tube between two points (frame members): w x w section */
const bar = (a: THREE.Vector3, b: THREE.Vector3, w: number, d = w) => {
  const v = b.clone().sub(a), g = bx(w, v.length(), d);
  g.translate(0, v.length() / 2, 0);
  g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), v.clone().normalize()));
  g.translate(a.x, a.y, a.z);
  return g;
};
const tube = (pts: THREE.Vector3[], r: number, seg = 48, rs = 6) => { const g = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, false, "catmullrom", 0.2), seg, r, rs, false); W.metricGeo(g); return g; };
/** world-metre UVs by face orientation (walls: u along the wall, v = height; floors / ceilings: x, -z) */
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
const taperY = (g: THREE.BufferGeometry, k: number, kz = 0) => {
  g.computeBoundingBox(); const b = g.boundingBox!, h = b.max.y - b.min.y, p = g.getAttribute("position");
  for (let i = 0; i < p.count; i++) { const f = (p.getY(i) - b.min.y) / h; p.setX(i, p.getX(i) * (1 - k * f)); p.setZ(i, p.getZ(i) * (1 - kz * f)); }
  g.computeVertexNormals(); return g;
};
const colorBox = (w: number, h: number, d: number, body: THREE.Color, ends: THREE.Color, spine?: THREE.Color) => {
  const g = new THREE.BoxGeometry(w, h, d); W.metricGeo(g);
  const n = g.getAttribute("normal"), c = new Float32Array(n.count * 3);
  for (let i = 0; i < n.count; i++) {
    const col = Math.abs(n.getY(i)) > 0.5 ? ends : spine && n.getZ(i) > 0.5 ? spine : body;
    c[i * 3] = col.r; c[i * 3 + 1] = col.g; c[i * 3 + 2] = col.b;
  }
  g.setAttribute("color", new THREE.BufferAttribute(c, 3));
  return g;
};

// =====================================================================================================================
// layout (metres)
// =====================================================================================================================
const X0 = -4.0, X1 = 4.0, Z0 = -2.5, Z1 = 2.5, HC = 3.2, WT = 0.2, DADO = 1.35;
/** the rope line and the gauge */
const ROPE_Z = -0.7, ROPE_Y = 0.9, DIAL_Y = 1.45;
const FX = -3.7;                           // frame upright centre line (x)
const FW = 0.07;                           // upright section
const FZ = 0.4;                            // uprights at ROPE_Z +- FZ
const HOUSE_BACK = FX + FW / 2 + 0.012;    // the mounting plate's front face
const FACE_X = HOUSE_BACK + 0.095;         // the enamel face plane
const R_FACE = 0.28, R_BEZEL = 0.324;
/** square 1 starts 1.3 m from the shackle, 0.8 m apart */
const HOOK_X = -3.36;
const POS_X = [0, 1, 2, 3, 4, 5].map((i) => HOOK_X + 1.3 + 0.8 * i);
/** the establishing camera (cams.side): at the door end on the camera (+z) side, standing eye height; the floor digits
 *  turn to read upright from here (glyph up = away from this point) */
const SIDE_POS: V3 = [3.85, 1.5, 1.1], SIDE_PITCH = -7;
/** the main camera: beside the gauge, 1.95 m to the camera side of the rope line so the six side-drawn heads separate */
const MAIN_POS: V3 = [-3.35, 1.45, 1.25], MAIN_LOOK: V3 = [0.65, 0.75, -1.68], MAIN_FOV = 70;
const DIGIT_ROT = POS_X.map((x) => Math.atan2(x - SIDE_POS[0], -(ROPE_Z + 0.43 - SIDE_POS[2])));
/** windows on the -z wall: x ranges, sill, head, transom */
const WINS: [number, number][] = [[-3.05, -1.65], [-0.95, 0.45]];
const SILL = 0.85, HEAD = 2.75, TRANSOM = 2.25;
/** the door on the +x end wall (z range), height */
const DOOR: [number, number] = [-1.6, -0.7], DH = 2.08;
const DESK = { x0: 1.3, x1: 2.8, d: 0.75, h: 0.74 };
const ease = (x: number) => { const t = Math.min(1, Math.max(0, x)); return t * t * (3 - 2 * t); };

// ---------------- materials ----------------
function makeMaterials(M: Mats) {
  const wm = W.woodMaps;
  const tx = { tile: glazedTile(), paint: paintTex(), floor: labFloor(), ceil: ceilingTiles({ seed: 133 }), lam: laminate({ seed: 141, color: [196, 140, 88] }), lamTop: laminate({ seed: 142, color: [150, 120, 92] }), cork: corkTex({ seed: 143 }), fab: fabricTex({ seed: 144 }) };
  const P = (o: Parameters<Mats["paint"]>[0], name: string) => { const m = M.paint(o); m.name = name; return m; };
  const basic = (o: THREE.MeshBasicMaterialParameters, name: string) => { const m = new THREE.MeshBasicMaterial(o); m.name = name; return m; };
  const marks = P({ map: floorMarksTex(DIGIT_ROT), roughness: 0.55 }, "floorMarks"); marks.alphaTest = 0.45; marks.transparent = false;
  marks.polygonOffset = true; marks.polygonOffsetFactor = -2; marks.polygonOffsetUnits = -2;
  const books = P({ roughness: 0.6 }, "binders"); books.vertexColors = true;
  const chrome = M.metalWith({ color: "#e4e7ea", roughness: 0.14 }); chrome.name = "chrome";
  const zinc = M.metalWith({ color: "#b9bec4", roughness: 0.32 }); zinc.name = "zinc";
  const steelBare = M.ironWith({ color: "#9aa0a6", roughness: 0.3 }); steelBare.name = "steelBare";
  const glassCan = canvas(64, 64), gg = glassCan.getContext("2d", CTX)!;
  { const gr = gg.createLinearGradient(0, 64, 64, 0); gr.addColorStop(0, "rgba(255,255,255,0.3)"); gr.addColorStop(0.42, "rgba(255,255,255,0.3)"); gr.addColorStop(0.5, "rgba(255,255,255,0.9)"); gr.addColorStop(0.58, "rgba(255,255,255,0.3)"); gr.addColorStop(1, "rgba(255,255,255,0.25)"); gg.fillStyle = gr; gg.fillRect(0, 0, 64, 64); }
  const m = {
    tile: P({ ...wm(tx.tile), roughness: 1, specular: 0.9 }, "tile"),
    tileCap: P({ color: "#6f9d83", roughness: 0.22, specular: 0.9 }, "tileCap"), cove: P({ color: "#3e6452", roughness: 0.3, specular: 0.8 }, "tileCove"),
    paint: P({ ...wm(tx.paint), roughness: 1 }, "wallPaint"),
    floor: P({ ...wm(tx.floor), roughness: 1, specular: 0.7 }, "floor"), marks,
    ceil: P({ ...wm(tx.ceil), roughness: 1, envMapIntensity: 1.4 }, "ceiling"),
    frame: P({ color: "#66706d", roughness: 0.42, specular: 0.6 }, "gaugeFrame"),       // grey hammertone
    frameDark: P({ color: "#3c4241", roughness: 0.45 }, "frameDark"),
    dialBody: P({ color: "#2c3134", roughness: 0.3, specular: 0.8 }, "dialBody"),
    dialFace: P({ map: dialFaceTex(), roughness: 0.32, specular: 0.5 }, "dialFace"),
    needle: P({ color: "#d42a1e", roughness: 0.32, specular: 0.7 }, "needle"),
    chrome, zinc, steelBare,
    shackle: P({ color: "#8d9398", roughness: 0.45, specular: 0.55 }, "shackle"),             // galvanised, not bright
    cable: P({ color: "#1d1f22", roughness: 0.5 }, "cable"),
    dialGlass: basic({ map: glassReflTex(), color: "#ffffff", transparent: true, opacity: 0.3, depthWrite: false }, "dialGlass"),
    winGlass: basic({ map: ctex(glassCan, true, false), color: "#e6f4ff", transparent: true, opacity: 0.18, depthWrite: false, side: THREE.DoubleSide }, "windowGlass"),
    winFrame: P({ color: "#e8e4d8", roughness: 0.4 }, "windowFrame"), slat: P({ color: "#efe9da", roughness: 0.5 }, "slat"),
    sill: P({ color: "#d8d2c2", roughness: 0.35, specular: 0.7 }, "sill"),
    radiator: P({ color: "#ece6d6", roughness: 0.45 }, "radiator"),
    outside: basic({ map: outsideTex() }, "outside"),
    lightBody: P({ color: "#f3f1ea", roughness: 0.35 }, "lightBody"),
    diffuser: basic({ map: diffuserTex(), color: new THREE.Color(1.6, 1.6, 1.55) }, "diffuser"),
    deskSteel: P({ color: "#8f9b8f", roughness: 0.4, specular: 0.6 }, "deskSteel"),
    deskTop: W.edgeWear(P({ ...wm(tx.lamTop), roughness: 1 }, "deskTop"), { k: 0.12, w: 0.006 }),
    cabinet: P({ color: "#a2a69e", roughness: 0.42, specular: 0.6 }, "cabinet"),
    wood: W.edgeWear(P({ ...wm(tx.lam), roughness: 1 }, "wood"), { k: 0.14, w: 0.006 }),
    door: P({ ...wm(tx.lam), roughness: 1, color: "#d9b48c" }, "doorLeaf"),
    doorFrame: P({ color: "#4f6f60", roughness: 0.38 }, "doorFrame"), doorGlass: P({ color: "#2e3f48", roughness: 0.06, specular: 1 }, "doorGlass"),
    alu: P({ color: "#c7cbcf", roughness: 0.3, specular: 0.8 }, "aluminium"),
    vinyl: P({ color: "#2f5d58", roughness: 0.35, specular: 0.6 }, "vinyl"), rubber: P({ color: "#25272a", roughness: 0.7 }, "rubber"),
    paper: P({ color: "#f8f6ef", roughness: 0.9 }, "paper"), notes: P({ map: notesTex(), roughness: 0.9 }, "notes"),
    chart: P({ map: chartTex(), roughness: 0.85 }, "chartPaper"),
    hardboard: P({ color: "#8e6a48", roughness: 0.75 }, "hardboard"),
    lamp: P({ color: "#3f7a62", roughness: 0.3, specular: 0.8 }, "lampEnamel"),
    mug: P({ color: "#e98a3c", roughness: 0.3, specular: 0.8 }, "mug"), white: P({ color: "#f4f2ec", roughness: 0.4 }, "white"),
    pencil: P({ color: "#e8b83a", roughness: 0.5 }, "pencil"), red: P({ color: "#c93a2c", roughness: 0.4 }, "red"),
    cork: P({ ...wm(tx.cork, [1.1 / 0.6, 0.75 / 0.6]), roughness: 1 }, "cork"),
    coat: P({ ...wm(tx.fab), roughness: 1, color: "#f4f4f0" }, "labCoat"),
    recorder: P({ color: "#8c948f", roughness: 0.4, specular: 0.6 }, "recorder"), panelDark: P({ color: "#2a2d2f", roughness: 0.5 }, "panelDark"),
    books,
    led: basic({ color: new THREE.Color(1.6, 0.35, 0.25) }, "pilotLamp"),
    plate: P({ color: "#f0ece2", roughness: 0.4 }, "switchPlate"),
    darkWood: P({ color: "#5e3f28", roughness: 0.42, specular: 0.6 }, "darkWood"),          // the coat stand
    extRed: P({ color: "#c8261c", roughness: 0.3, specular: 0.8 }, "extinguisher"),
    graph: P({ map: graphTex(), roughness: 0.85 }, "graphSheet"),
    coil: P({ map: coilTex(), roughness: 0.9, color: "#e8d2a6" }, "spareRope"),
  };
  return m;
}
type Mt = ReturnType<typeof makeMaterials>;

// =====================================================================================================================
// the set
// =====================================================================================================================
export type LabAnchors = {
  /** the rope's tie point on the gauge: the front of the shackle's bow (on the bow wire's centreline), y = ropeY.
   *  Tie the rope there with kit/rope attachA { kind: "knot", axis: hookTie.axis, postR: hookTie.postR } */
  hook: THREE.Vector3; hookTie: { axis: THREE.Vector3; postR: number }; ropeY: number; ropeZ: number;
  /** floor points, centres of taped squares 1..6 (square 1 nearest the gauge) */
  positions: THREE.Vector3[];
  /** yaw for pullers to face the gauge (-x): -PI/2 */
  facing: number;
  /** where the researcher ties the blindfold: just behind square 1 on the window (-z) side, 0.38 m off the rope line
   *  (clear of the rope), 0.44 m behind square 1; she leaves to researcherIdle before the slack-rope beat */
  researcher: THREE.Vector3;
  /** out of the way during the pulls: (-3.3, 0, 1.6), on the +z side behind the main camera, out of every cam */
  researcherIdle: THREE.Vector3;
  /** floor point in front of the desk (chair spot), the desk-top centre */
  desk: THREE.Vector3; deskTop: THREE.Vector3;
  dialCentre: THREE.Vector3; dialNormal: THREE.Vector3; dialRadius: number; dialBezelRadius: number;
  door: THREE.Vector3;
};
export type LabSet = {
  group: THREE.Group;
  /** [sun, sun.target, dialLamp, dialLamp.target]: add all to the scene (dialLamp: a soft unshadowed spot from the batten
   *  over the gauge end onto the dial face) */
  lights: THREE.Object3D[];
  anchors: LabAnchors;
  cams: Record<"main" | "side" | "pos1" | "dial" | "dialFull", Cam>;
  /** recorder pen wiggle (pure function of seconds) */
  animate: (t: number) => void;
  /** needle: 0..100 (clamped), 0 at 7 o'clock, 100 at 5 o'clock, clockwise; pure */
  setDial: (v: number) => void;
  /** sun strength 0..1 of LAB_SUN.intensity (default 1) */
  setLight: (o: { sun?: number; lamp?: number }) => void;
  objects: { needle: THREE.Group; dialGlass: THREE.Mesh; sun: THREE.DirectionalLight; pen: THREE.Mesh; colliders: THREE.Box3[] };
  tris: number;
};

export function buildLab(M: Mats, opts: { seed?: number } = {}): LabSet {
  const R = rng(opts.seed ?? 1974), group = new THREE.Group(), k = new Kit(), mt = makeMaterials(M);
  group.name = "lab";
  const noCast = new Set<THREE.Material>([mt.diffuser, mt.winGlass, mt.dialGlass, mt.outside, mt.led, mt.marks]);
  const colliders: THREE.Box3[] = [];
  const box3 = (x0: number, y0: number, z0: number, x1: number, y1: number, z1: number) => { const b = new THREE.Box3(V(Math.min(x0, x1), y0, Math.min(z0, z1)), V(Math.max(x0, x1), y1, Math.max(z0, z1))); colliders.push(b); return b; };
  let tris = 0;

  // ---------------- shell ----------------
  // wall slab: glazed tile below DADO, paint above (world-metre UVs, tile courses from the floor)
  const slab = (x0: number, x1: number, y0: number, y1: number, z0: number, z1: number) => {
    if (y0 < DADO) worldUV(k.add(new THREE.BoxGeometry(x1 - x0, Math.min(y1, DADO) - y0, z1 - z0), mt.tile, T((x0 + x1) / 2, (y0 + Math.min(y1, DADO)) / 2, (z0 + z1) / 2)), 0, 0);
    if (y1 > DADO) worldUV(k.add(new THREE.BoxGeometry(x1 - x0, y1 - Math.max(y0, DADO), z1 - z0), mt.paint, T((x0 + x1) / 2, (Math.max(y0, DADO) + y1) / 2, (z0 + z1) / 2)), 0, 0);
  };
  worldUV(k.add(new THREE.BoxGeometry(X1 - X0 + 2 * WT, 0.2, Z1 - Z0 + 2 * WT), mt.floor, T(0, -0.1, 0)), 0.15, 0.15);
  const top = HC + 0.05;
  slab(X0 - WT, X0, 0, top, Z0 - WT, Z1 + WT);                                        // gauge wall (-x)
  slab(X1, X1 + WT, 0, top, Z0 - WT, DOOR[0]); slab(X1, X1 + WT, 0, top, DOOR[1], Z1 + WT); slab(X1, X1 + WT, DH, top, DOOR[0], DOOR[1]);
  slab(X0, X1, 0, top, Z1, Z1 + WT);                                                   // bench wall (+z)
  // window wall (-z) with the two openings
  slab(X0, X1, 0, SILL, Z0 - WT, Z0); slab(X0, X1, HEAD, top, Z0 - WT, Z0);
  { const xs = [X0, ...WINS.flat(), X1]; for (let i = 0; i < xs.length; i += 2) slab(xs[i], xs[i + 1], SILL, HEAD, Z0 - WT, Z0); }
  // tile cap (bullnose) and cove skirting round the room (broken at the door and the windows' reveals stay plain)
  const runX = (z: number, s: number, y: number, h: number, d: number, m: THREE.Material, x0: number, x1: number) => k.add(rb(x1 - x0, h, d, Math.min(h, d) * 0.45, 1), m, T((x0 + x1) / 2, y, z + s * d / 2));
  const runZ = (x: number, s: number, y: number, h: number, d: number, m: THREE.Material, z0: number, z1: number) => k.add(rb(d, h, z1 - z0, Math.min(h, d) * 0.45, 1), m, T(x + s * d / 2, y, (z0 + z1) / 2));
  for (const [y, h, d, m] of [[DADO + 0.018, 0.036, 0.022, mt.tileCap], [0.05, 0.1, 0.016, mt.cove]] as const) {
    if (m === mt.tileCap) { const xs = [X0, ...WINS.flat(), X1]; for (let i = 0; i < xs.length; i += 2) runX(Z0, 1, y, h, d, m, xs[i], xs[i + 1]); }
    else runX(Z0, 1, y, h, d, m, X0, X1);
    runX(Z1, -1, y, h, d, m, X0, X1);
    runZ(X0, 1, y, h, d, m, Z0, Z1);
    runZ(X1, -1, y, h, d, m, Z0, DOOR[0] - 0.08); runZ(X1, -1, y, h, d, m, DOOR[1] + 0.08, Z1);
  }

  // ---------------- ceiling: acoustic tiles, six fluorescent battens ----------------
  worldUV(k.add(new THREE.BoxGeometry(X1 - X0, 0.04, Z1 - Z0), mt.ceil, T(0, HC + 0.02, 0)), 0.3, 0.3);
  for (const x of [-2.5, 0.0, 2.5]) for (const z of [ROPE_Z - 1.05, ROPE_Z + 1.05]) {
    k.add(rb(1.28, 0.06, 0.2, 0.012, 1), mt.lightBody, T(x, HC - 0.03, z));
    k.add(rb(1.24, 0.055, 0.16, 0.02, 2), mt.diffuser, T(x, HC - 0.085, z));
    for (const s of [-1, 1]) k.add(bx(0.012, 0.07, 0.18), mt.lightBody, T(x + s * 0.625, HC - 0.085, z));
  }

  // ---------------- windows (-z wall): steel frames, glass, blinds, sills, column radiators ----------------
  const wy = Z0 - WT / 2; // frame plane (middle of the wall)
  for (const [xa, xb] of WINS) {
    const cx = (xa + xb) / 2, w = xb - xa, hh = HEAD - SILL;
    for (const s of [-1, 1]) k.add(bx(0.05, hh, 0.06), mt.winFrame, T(cx + s * (w / 2 - 0.025), (SILL + HEAD) / 2, wy));
    k.add(bx(w, 0.05, 0.06), mt.winFrame, T(cx, HEAD - 0.025, wy)); k.add(bx(w, 0.05, 0.06), mt.winFrame, T(cx, SILL + 0.025, wy));
    k.add(bx(w - 0.1, 0.04, 0.05), mt.winFrame, T(cx, TRANSOM, wy)); k.add(bx(0.035, hh - 0.1, 0.05), mt.winFrame, T(cx, (SILL + HEAD) / 2, wy));
    for (const y of [SILL + 0.6]) for (const s of [-1, 1]) k.add(bx(w / 2 - 0.07, 0.022, 0.04), mt.winFrame, T(cx + s * (w / 4 - 0.008), y, wy)); // glazing bars
    k.add(quad(w - 0.1, hh - 0.1), mt.winGlass, T(cx, (SILL + HEAD) / 2, wy));
    // reveals (the wall's thickness round the opening), painted
    for (const s of [-1, 1]) worldUV(k.add(new THREE.BoxGeometry(0.004, hh, WT), mt.paint, T(s < 0 ? xa + 0.002 : xb - 0.002, (SILL + HEAD) / 2, Z0 - WT / 2)), 0, 0);
    k.add(rb(w + 0.1, 0.035, 0.2, 0.01, 1), mt.sill, T(cx, SILL + 0.0175, Z0 + 0.03));
    // venetian blind (fully lowered, slats tilted: room-side edge down, ~40 % of the sun through as bold stripes)
    const zb = Z0 + 0.06;
    k.add(rb(w - 0.02, 0.05, 0.06, 0.008, 1), mt.slat, T(cx, HEAD - 0.06, zb));
    for (let y = HEAD - 0.12; y > SILL + 0.1; y -= 0.075) k.add(bx(w - 0.06, 0.003, 0.065), mt.slat, T(cx, y, zb, 0, 0.5));
    k.add(bx(w - 0.05, 0.016, 0.05), mt.slat, T(cx, SILL + 0.08, zb));
    for (const s of [-1, 1]) k.add(bx(0.006, HEAD - SILL - 0.14, 0.002), mt.white, T(cx + s * (w / 2 - 0.25), (HEAD + SILL + 0.02) / 2, zb + 0.022));
    k.add(cyl(0.004, 0.004, 0.9, 5), mt.white, T(xb - 0.12, HEAD - 0.55, zb + 0.03));
    k.add(cyl(0.012, 0.009, 0.05, 8), mt.white, T(xb - 0.12, HEAD - 1.02, zb + 0.03));
    // column radiator under the window, its pipes and valve
    const rw = w - 0.3, n = Math.round(rw / 0.062);
    for (let i = 0; i < n; i++) k.add(rb(0.05, 0.6, 0.13, 0.02, 1), mt.radiator, T(cx - rw / 2 + 0.031 + i * 0.062, 0.45, Z0 + 0.1));
    for (const y of [0.2, 0.7]) k.add(rod(V(cx - rw / 2, y, Z0 + 0.1), V(cx + rw / 2, y, Z0 + 0.1), 0.018, 8), mt.radiator);
    for (const s of [-1, 1]) k.add(cyl(0.022, 0.022, 0.15, 8), mt.radiator, T(cx + s * (rw / 2 - 0.02), 0.075, Z0 + 0.1));
    k.add(rod(V(cx - rw / 2 - 0.06, 0.2, Z0 + 0.1), V(cx - rw / 2, 0.2, Z0 + 0.1), 0.012, 8), mt.radiator);
    k.add(rod(V(cx - rw / 2 - 0.06, 0.0, Z0 + 0.1), V(cx - rw / 2 - 0.06, 0.2, Z0 + 0.1), 0.012, 8), mt.radiator);
    k.add(cyl(0.02, 0.02, 0.05, 10), mt.chrome, T(cx - rw / 2 - 0.06, 0.24, Z0 + 0.1));
    box3(cx - rw / 2 - 0.08, 0, Z0, cx + rw / 2 + 0.02, 0.76, Z0 + 0.17);
  }
  // the painted view outside (unlit, NOINK)
  k.add(quad(11, 5.5), mt.outside, T(-1.2, 1.6, Z0 - 3.2));

  // ---------------- THE APPARATUS ----------------
  {
    const zs = [ROPE_Z - FZ, ROPE_Z + FZ], fr = mt.frame;
    for (const z of zs) {
      k.add(bx(FW, 2.05, FW), fr, T(FX, 1.025, z));                                                     // upright
      k.add(bx(0.22, 0.012, 0.18), fr, T(FX + 0.03, 0.006, z));                                          // base plate
      for (const [dx, dz] of [[-0.07, -0.06], [-0.07, 0.06], [0.12, -0.06], [0.12, 0.06]]) k.add(cyl(0.011, 0.011, 0.012, 6), mt.zinc, T(FX + 0.03 + dx, 0.018, z + dz));
      // wall brackets: tube back to a wall plate with four bolts
      for (const y of [0.4, 1.95]) {
        k.add(bx(FX - FW / 2 - X0, 0.05, 0.05), fr, T((X0 + FX - FW / 2) / 2, y, z));
        k.add(bx(0.012, 0.16, 0.14), fr, T(X0 + 0.006, y, z));
        for (const [dy, dz] of [[-0.05, -0.045], [-0.05, 0.045], [0.05, -0.045], [0.05, 0.045]]) k.add(cyl(0.009, 0.009, 0.01, 6), mt.zinc, T(X0 + 0.016, y + dy, z + dz, 0, 0, Math.PI / 2));
      }
      // forward brace to a floor plate (keeps the frame from tipping when six people pull)
      const a = V(FX + FW / 2, 0.78, z), b = V(-3.08, 0.03, z);
      k.add(bar(a, b, 0.05), fr);
      k.add(bx(0.18, 0.012, 0.14), fr, T(-3.1, 0.006, z));
      for (const dx of [-0.06, 0.06]) for (const dz of [-0.045, 0.045]) k.add(cyl(0.01, 0.01, 0.012, 6), mt.zinc, T(-3.1 + dx, 0.018, z + dz));
      box3(FX - FW / 2, 0, z - FW / 2, FX + FW / 2, 2.05, z + FW / 2);
      box3(Math.min(a.x, b.x), 0, z - 0.03, Math.max(a.x, b.x), 0.8, z + 0.03);
    }
    // cross members: top rail, the heavy load bar at rope height (a channel), the dial's mounting plate
    k.add(bx(FW, FW, 2 * FZ + FW), fr, T(FX, 2.05 - FW / 2, ROPE_Z));
    k.add(bx(0.1, 0.13, 2 * FZ + FW), fr, T(FX, ROPE_Y, ROPE_Z));
    // the mounting plate fills the frame from the load bar's top to the top rail (no slot shows round the dial)
    const plY0 = ROPE_Y + 0.065, plY1 = 2.05 - FW;
    k.add(bx(0.012, plY1 - plY0, 2 * FZ - FW + 0.02), mt.frame, T(HOUSE_BACK - 0.006, (plY0 + plY1) / 2, ROPE_Z));
    for (const y of [plY0 + 0.07, plY1 - 0.07]) for (const dz of [-0.3, 0.3]) k.add(cyl(0.012, 0.012, 0.012, 6), mt.shackle, T(HOUSE_BACK + 0.004, y, ROPE_Z + dz, 0, 0, Math.PI / 2));
    box3(FX - 0.06, ROPE_Y - 0.07, ROPE_Z - FZ, FX + 0.06, ROPE_Y + 0.07, ROPE_Z + FZ);
    box3(FX, 0.97, ROPE_Z - FZ, HOUSE_BACK + 0.13, 2.08, ROPE_Z + FZ);
    // the dial: housing drum, chrome bezel (lathe, axis +x), enamel face (static); needle and glass are own meshes
    const toX = new THREE.Matrix4().makeRotationZ(-Math.PI / 2);   // lathe axis +y -> +x
    const dm = (mx: THREE.Matrix4) => at(T(FACE_X, DIAL_Y, ROPE_Z), mx);
    k.add(lathe([[0, -0.095], [0.3, -0.095], [0.312, -0.088], [0.316, -0.06], [0.316, -0.004], [0.3, -0.002], [0.29, 0.0]], 48), mt.dialBody, dm(toX));
    k.add(lathe([[0.318, -0.02], [0.324, -0.012], [0.324, 0.01], [0.318, 0.025], [0.305, 0.031], [0.29, 0.026], [0.281, 0.012], [0.279, 0.0]], 64), mt.chrome, dm(toX));
    k.add(new THREE.CircleGeometry(R_FACE + 0.002, 72), mt.dialFace, dm(new THREE.Matrix4().makeRotationY(Math.PI / 2)));
    // a short conduit from the load cell up into the drum, and its gland
    k.add(rod(V(FX + 0.09, ROPE_Y + 0.05, ROPE_Z + 0.03), V(FX + 0.09, DIAL_Y - 0.3, ROPE_Z + 0.03), 0.011, 8), mt.cable);
    k.add(cyl(0.017, 0.017, 0.03, 10), mt.zinc, T(FX + 0.09, DIAL_Y - 0.305, ROPE_Z + 0.03));
    // the load cell (a short steel cylinder on a clevis), eye bolt, D-shackle
    k.add(bx(0.03, 0.14, 0.12), fr, T(FX + 0.065, ROPE_Y, ROPE_Z));                                           // clevis plate
    k.add(cyl(0.048, 0.048, 0.12, 20), mt.steelBare, T(FX + 0.14, ROPE_Y, ROPE_Z, 0, 0, Math.PI / 2));         // load cell
    k.add(cyl(0.05, 0.05, 0.02, 20), mt.chrome, T(FX + 0.14, ROPE_Y, ROPE_Z, 0, 0, Math.PI / 2));               // its band
    k.add(cyl(0.013, 0.013, 0.03, 8), mt.zinc, T(FX + 0.14, ROPE_Y + 0.06, ROPE_Z));                          // cable gland
    k.add(cyl(0.014, 0.014, 0.05, 10), mt.zinc, T(FX + 0.22, ROPE_Y, ROPE_Z, 0, 0, Math.PI / 2));              // eye bolt shank
    k.add(new THREE.TorusGeometry(0.026, 0.008, 8, 20), mt.zinc, T(FX + 0.27, ROPE_Y, ROPE_Z));               // eye (vertical, in x-y)
    // D-shackle through the eye: bow in the horizontal plane, pin along z through the eye
    const sx = FX + 0.275;
    k.add(cyl(0.007, 0.007, 0.075, 8), mt.shackle, T(sx, ROPE_Y, ROPE_Z, 0, Math.PI / 2));
    { const bow = new THREE.TorusGeometry(0.032, 0.0075, 8, 18, Math.PI); bow.rotateX(Math.PI / 2); bow.rotateY(-Math.PI / 2); k.add(bow, mt.shackle, T(sx + 0.028, ROPE_Y, ROPE_Z)); }
    for (const s of [-1, 1]) k.add(rod(V(sx, ROPE_Y, ROPE_Z + s * 0.032), V(sx + 0.03, ROPE_Y, ROPE_Z + s * 0.032), 0.0075, 8), mt.shackle);
    // the cable to the recorder: off the load cell's gland, over the load bar (kept above its top until past the -z
    // upright's outer face), down that face, along the wall foot to the trolley
    const cz = ROPE_Z - FZ - FW / 2 - 0.012;
    k.add(tube([V(FX + 0.14, ROPE_Y + 0.075, ROPE_Z), V(FX + 0.12, ROPE_Y + 0.1, ROPE_Z - 0.15), V(FX + 0.07, ROPE_Y + 0.1, ROPE_Z - FZ + 0.02), V(FX + 0.05, ROPE_Y + 0.095, cz - 0.012), V(FX + 0.01, ROPE_Y + 0.02, cz),
      V(FX, 0.5, cz), V(FX - 0.01, 0.06, cz), V(FX - 0.04, 0.012, cz - 0.15), V(X0 + 0.08, 0.012, -1.6), V(X0 + 0.06, 0.012, -2.0), V(X0 + 0.05, 0.3, -2.15), V(X0 + 0.05, 0.76, -2.16), V(-3.83, 0.8, -2.16)], 0.0065, 64, 6), mt.cable);
    for (const y of [0.35, 1.6]) k.add(bx(0.02, 0.03, 0.02), mt.zinc, T(FX, y, cz + 0.004));
  }

  // ---------------- floor marks: six taped squares, numbered ----------------
  POS_X.forEach((x, i) => {
    const u0 = (i % 3) / 3, v1 = 1 - Math.floor(i / 3) / 2;
    // cell: 0.6 m along x (u), 0.9 m along z (v down the canvas = +z); the square sits in the -z 0.6 m of it
    k.add(flatQuad(0.6, 0.9, [u0, v1 - 0.5, u0 + 1 / 3, v1]), mt.marks, T(x, 0.0015, ROPE_Z + 0.15));
  });

  // ---------------- strip-chart recorder on a steel trolley (window-side corner by the gauge) ----------------
  {
    const tx0 = -3.92, tx1 = -3.36, tz0 = -2.42, tz1 = -1.88, ty = 0.72, cx = (tx0 + tx1) / 2, cz = (tz0 + tz1) / 2;
    k.add(rb(tx1 - tx0, 0.025, tz1 - tz0, 0.006, 1), mt.deskSteel, T(cx, ty, cz));
    k.add(rb(tx1 - tx0 - 0.04, 0.02, tz1 - tz0 - 0.04, 0.005, 1), mt.deskSteel, T(cx, 0.18, cz));
    for (const sx of [tx0 + 0.025, tx1 - 0.025]) for (const sz of [tz0 + 0.025, tz1 - 0.025]) {
      k.add(bx(0.025, ty - 0.06, 0.025), mt.deskSteel, T(sx, (ty + 0.06) / 2, sz));
      k.add(cyl(0.025, 0.025, 0.02, 10), mt.rubber, T(sx, 0.04, sz, 0, 0, Math.PI / 2)); k.add(bx(0.03, 0.02, 0.03), mt.zinc, T(sx, 0.055, sz));
    }
    box3(tx0, 0, tz0, tx1, ty + 0.25, tz1);
    // the recorder: a grey case, sloped front with the chart window, knobs, pilot lamp; paper curling out over the front
    const rx = -3.66, ry = ty + 0.0125, rz = cz;
    k.add(rb(0.32, 0.17, 0.42, 0.012, 1), mt.recorder, T(rx, ry + 0.085, rz));
    k.add(bx(0.006, 0.12, 0.3), mt.panelDark, T(rx + 0.161, ry + 0.095, rz - 0.03));
    k.add(quad(0.26, 0.1, [0.05, 0.55, 0.95, 0.75]), mt.chart, T(rx + 0.1645, ry + 0.095, rz - 0.03, Math.PI / 2));
    for (const dz of [0.15, 0.18]) k.add(cyl(0.012, 0.012, 0.02, 12), mt.panelDark, T(rx + 0.17, ry + 0.11 - (dz - 0.15) * 2, rz + dz - 0.02, 0, 0, Math.PI / 2));
    k.add(new THREE.SphereGeometry(0.008, 8, 6), mt.led, T(rx + 0.163, ry + 0.045, rz + 0.17));
    // chart paper spilling over the front lip in a curl
    const curl: THREE.Vector3[] = [];
    for (let i = 0; i <= 10; i++) { const a = (i / 10) * Math.PI * 0.9; curl.push(V(rx + 0.16 + 0.07 * Math.sin(a), ry + 0.04 - 0.07 * (1 - Math.cos(a)) - i * 0.002, rz - 0.03)); }
    {
      const pos: number[] = [], uv: number[] = [], wz = 0.12;
      for (let i = 0; i < curl.length; i++) { const p = curl[i]; pos.push(p.x, p.y, p.z - wz, p.x, p.y, p.z + wz); uv.push(0, i / 10, 1, i / 10); }
      const idx: number[] = []; for (let i = 0; i < curl.length - 1; i++) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
      const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
      const m2 = mt.chart.clone(); m2.side = THREE.DoubleSide; m2.name = "chartCurl"; k.add(g, m2);
    }
    // a roll of spare chart paper and a pencil on the trolley
    k.add(cyl(0.035, 0.035, 0.12, 14), mt.paper, T(-3.5, ty + 0.047, tz1 - 0.07, 0, Math.PI / 2));
  }

  // ---------------- desk on the -z wall: steel desk, chair, lamp, clipboard, papers ----------------
  const deskZ0 = Z0 + 0.01, deskZ1 = Z0 + 0.01 + DESK.d, dcx = (DESK.x0 + DESK.x1) / 2, dcz = (deskZ0 + deskZ1) / 2;
  {
    const { x0, x1, h } = DESK;
    k.add(rb(x1 - x0, 0.032, DESK.d, 0.006, 1), mt.deskTop, T(dcx, h - 0.016, dcz));
    k.add(bx(x1 - x0 - 0.02, 0.05, DESK.d - 0.02), mt.deskSteel, T(dcx, h - 0.057, dcz));
    // pedestal (right, 3 drawers) and the left end panel, modesty panel
    const px0 = x1 - 0.42;
    k.add(bx(0.42, h - 0.1, DESK.d - 0.02), mt.deskSteel, T(px0 + 0.21, (h - 0.1) / 2 + 0.02, dcz));
    for (let i = 0; i < 3; i++) {
      const y = 0.12 + i * 0.2;
      k.add(rb(0.39, 0.185, 0.012, 0.004, 1), mt.deskSteel, T(px0 + 0.21, y + 0.09, deskZ1 - 0.004));
      k.add(rb(0.12, 0.016, 0.022, 0.006, 1), mt.alu, T(px0 + 0.21, y + 0.16, deskZ1 + 0.008));
    }
    k.add(bx(0.03, h - 0.1, DESK.d - 0.02), mt.deskSteel, T(x0 + 0.015, (h - 0.1) / 2 + 0.02, dcz));
    k.add(bx(x1 - x0 - 0.44, 0.4, 0.015), mt.deskSteel, T((x0 + px0) / 2, h - 0.3, deskZ0 + 0.1));
    k.add(rb(x1 - x0 - 0.47, 0.1, 0.012, 0.004, 1), mt.deskSteel, T((x0 + px0) / 2 + 0.01, h - 0.135, deskZ1 - 0.01));   // centre drawer front
    for (const sx of [x0 + 0.015, px0 + 0.21]) k.add(bx(sx === x0 + 0.015 ? 0.03 : 0.42, 0.02, DESK.d - 0.04), mt.rubber, T(sx, 0.01, dcz));
    box3(x0, 0, deskZ0, x1, h, deskZ1);
    // props on the top
    const ty = h;
    // clipboard with a form (blank rules)
    k.add(rb(0.235, 0.006, 0.32, 0.01, 1), mt.hardboard, T(dcx - 0.18, ty + 0.003, dcz + 0.12, 0.12));
    k.add(quad(0.21, 0.29, [0, 0.5, 0.5, 1]), mt.notes, at(T(dcx - 0.18, ty + 0.0065, dcz + 0.135, 0.12), T(0, 0, 0, 0, -Math.PI / 2)));
    k.add(rb(0.09, 0.016, 0.03, 0.005, 1), mt.chrome, T(dcx - 0.18 - 0.02, ty + 0.012, dcz - 0.025, 0.12));
    // loose papers
    for (let i = 0; i < 4; i++) k.add(flatQuad(0.21, 0.297), mt.paper, T(dcx + 0.12 + 0.01 * i, ty + 0.001 + 0.0008 * i, dcz + 0.05 - 0.004 * i, 0.2 - 0.12 * i));
    // anglepoise lamp, back left corner, shade toward the papers
    {
      const lx = DESK.x0 + 0.22, lz = deskZ0 + 0.18;
      k.add(cyl(0.085, 0.095, 0.03, 20), mt.lamp, T(lx, ty + 0.015, lz));
      const j0 = V(lx, ty + 0.04, lz), j1 = V(lx + 0.08, ty + 0.38, lz + 0.05), j2 = V(lx + 0.36, ty + 0.46, lz + 0.2);
      k.add(rod(j0, j1, 0.008), mt.chrome); k.add(rod(j0.clone().add(V(0.02, 0, 0.01)), j1.clone().add(V(0.02, 0, 0.01)), 0.006), mt.chrome);
      k.add(rod(j1, j2, 0.008), mt.chrome);
      k.add(new THREE.SphereGeometry(0.018, 10, 8), mt.lamp, T(j1.x, j1.y, j1.z));
      const shade = lathe([[0.078, -0.004], [0.075, 0.0], [0.045, 0.05], [0.03, 0.085], [0.012, 0.09]], 20);
      const dir = V(0.25, -0.75, 0.35).normalize(), q = new THREE.Quaternion().setFromUnitVectors(V(0, -1, 0), dir);
      k.add(shade, mt.lamp, new THREE.Matrix4().compose(j2.clone().addScaledVector(dir, 0.09), q, V(1, 1, 1)));
      const shIn = lathe([[0.02, 0.08], [0.044, 0.048], [0.074, 0.002]], 20);
      k.add(shIn, mt.white, new THREE.Matrix4().compose(j2.clone().addScaledVector(dir, 0.09), q, V(1, 1, 1)));
    }
    // mug, pencil pot with pencils, a notebook
    k.add(lathe([[0, 0], [0.04, 0], [0.042, 0.004], [0.042, 0.095], [0.038, 0.095], [0.038, 0.01], [0, 0.01]], 18), mt.mug, T(DESK.x1 - 0.25, ty, deskZ0 + 0.22));
    k.add(new THREE.TorusGeometry(0.026, 0.006, 6, 12, Math.PI), mt.mug, T(DESK.x1 - 0.25 + 0.042, ty + 0.05, deskZ0 + 0.22, 0, 0, -Math.PI / 2));
    k.add(cyl(0.035, 0.035, 0.1, 14, true), mt.cabinet, T(DESK.x1 - 0.12, ty + 0.05, deskZ0 + 0.12));
    for (let i = 0; i < 5; i++) k.add(cyl(0.004, 0.004, 0.17, 6), mt.pencil, T(DESK.x1 - 0.12 + (R() - 0.5) * 0.03, ty + 0.1, deskZ0 + 0.12 + (R() - 0.5) * 0.03, R() * 3, (R() - 0.5) * 0.3, (R() - 0.5) * 0.3));
    k.add(colorBox(0.17, 0.014, 0.24, new THREE.Color("#2f5f9e"), new THREE.Color("#f2ecdc")), mt.books, T(dcx + 0.42, ty + 0.007, dcz - 0.05, -0.25));
    // the chair, pulled out a little, facing the desk (-z)
    const chx = dcx - 0.12, chz = deskZ1 + 0.26;
    k.add(rb(0.44, 0.06, 0.42, 0.02, 2), mt.vinyl, T(chx, 0.46, chz));
    k.add(rb(0.42, 0.24, 0.05, 0.02, 2), mt.vinyl, T(chx, 0.74, chz + 0.21, 0, -0.1));
    for (const s of [-1, 1]) {
      k.add(bar(V(chx + s * 0.2, 0.0, chz - 0.2), V(chx + s * 0.2, 0.43, chz - 0.17), 0.022), mt.chrome);
      k.add(bar(V(chx + s * 0.2, 0.0, chz + 0.2), V(chx + s * 0.2, 0.86, chz + 0.25), 0.022), mt.chrome);
      k.add(bar(V(chx + s * 0.2, 0.43, chz - 0.18), V(chx + s * 0.2, 0.43, chz + 0.22), 0.02), mt.chrome);
    }
    box3(chx - 0.23, 0, chz - 0.22, chx + 0.23, 0.9, chz + 0.28);
    // shelf of plain binders over the desk
    k.add(rb(1.2, 0.025, 0.24, 0.004, 1), mt.wood, T(dcx, 1.78, Z0 + 0.12));
    for (const sx of [-0.5, 0.5]) k.add(bx(0.02, 0.18, 0.2), mt.deskSteel, T(dcx + sx, 1.68, Z0 + 0.1));
    let bxp = dcx - 0.55; const bcol = ["#3d5f8c", "#7d3a32", "#3d6b4f", "#c2a04a", "#3d5f8c", "#55585e", "#7d3a32", "#3d6b4f"];
    for (let i = 0; i < 12 && bxp < dcx + 0.3; i++) { const w = 0.055 + 0.02 * R(), hgt = 0.28 + 0.03 * R(); k.add(colorBox(w, hgt, 0.21, new THREE.Color(bcol[i % bcol.length]), new THREE.Color("#ece4d0"), new THREE.Color(bcol[i % bcol.length]).multiplyScalar(0.85)), mt.books, T(bxp + w / 2, 1.7925 + hgt / 2, Z0 + 0.125, 0, 0, i === 9 ? 0.18 : 0)); bxp += w + 0.004; }
    k.add(rb(0.3, 0.12, 0.2, 0.01, 1), mt.hardboard, T(dcx + 0.42, 1.7925 + 0.06, Z0 + 0.125));
  }

  // ---------------- filing cabinet (the +x / -z corner), coat stand with a lab coat (beside the desk) ----------------
  {
    const cx = 3.7, cw = 0.47, cd = 0.62, ch = 1.32, cz = Z0 + 0.01 + cd / 2;
    k.add(rb(cw, ch, cd, 0.008, 1), mt.cabinet, T(cx, ch / 2, cz));
    for (let i = 0; i < 4; i++) {
      const y = 0.06 + i * 0.315;
      k.add(rb(cw - 0.03, 0.295, 0.016, 0.005, 1), mt.cabinet, T(cx, y + 0.15, cz + cd / 2 + 0.006));
      k.add(rb(0.12, 0.02, 0.03, 0.008, 1), mt.alu, T(cx, y + 0.2, cz + cd / 2 + 0.024));
      k.add(bx(0.08, 0.035, 0.004), mt.alu, T(cx, y + 0.25, cz + cd / 2 + 0.016)); k.add(quad(0.07, 0.026), mt.paper, T(cx, y + 0.25, cz + cd / 2 + 0.0185));
    }
    box3(cx - cw / 2, 0, Z0, cx + cw / 2, ch, cz + cd / 2 + 0.04);
    // two box files and a stack of papers on top
    k.add(colorBox(0.09, 0.28, 0.34, new THREE.Color("#5b6f86"), new THREE.Color("#e6dfcd")), mt.books, T(cx - 0.12, ch + 0.14, cz, 0.05));
    k.add(colorBox(0.09, 0.28, 0.34, new THREE.Color("#8a5a3c"), new THREE.Color("#e6dfcd")), mt.books, T(cx - 0.02, ch + 0.14, cz, -0.03));
    for (let i = 0; i < 5; i++) k.add(flatQuad(0.21, 0.297), mt.paper, T(cx + 0.13, ch + 0.002 + i * 0.003, cz + 0.02, 1.57 + (R() - 0.5) * 0.1));
  }
  {
    // dark stained coat stand; the coat hangs from its collar on the hook that faces the main camera, its FRONT (lapels,
    // buttons, pockets) turned to the main camera so collar and sleeves read
    const rx = 3.08, rz = Z0 + 0.37;
    k.add(cyl(0.017, 0.021, 1.8, 10), mt.darkWood, T(rx, 0.9, rz));
    for (let i = 0; i < 4; i++) { const a = (i / 4) * Math.PI * 2 + 0.4; k.add(bar(V(rx, 0.12, rz), V(rx + 0.24 * Math.cos(a), 0.01, rz + 0.24 * Math.sin(a)), 0.03, 0.02), mt.darkWood); }
    const yaw = Math.atan2(MAIN_POS[0] - rx, MAIN_POS[2] - rz);        // toward the main camera (yaw: 0 = +z)
    for (let i = 0; i < 4; i++) {
      const a = yaw + (i / 4) * Math.PI * 2, dx = Math.sin(a), dz = Math.cos(a);   // hook 0 holds the coat's collar
      k.add(bar(V(rx, 1.69, rz), V(rx + 0.1 * dx, 1.77, rz + 0.1 * dz), 0.012), mt.frameDark);
      k.add(new THREE.SphereGeometry(0.011, 8, 6), mt.frameDark, T(rx + 0.1 * dx, 1.775, rz + 0.1 * dz));
    }
    k.add(new THREE.SphereGeometry(0.026, 10, 8), mt.darkWood, T(rx, 1.81, rz));
    // the coat in its own frame: +z = its front, x = across the shoulders; origin on the pole axis at the floor
    const C = (x: number, y: number, z: number, ry = 0, rx2 = 0, rz2 = 0) => at(T(rx, 0, rz, yaw), T(x, y, z, ry, rx2, rz2));
    const top = 1.71, oz = 0.1;
    const body = taperY(rb(0.46, 0.98, 0.12, 0.045, 2), 0.16, 0.0);
    k.add(body, mt.coat, C(0, top - 0.55, oz));
    k.add(rb(0.4, 0.09, 0.13, 0.04, 2), mt.coat, C(0, top - 0.07, oz));                                    // shoulders
    k.add(rb(0.17, 0.06, 0.11, 0.025, 2), mt.coat, C(0, top - 0.005, oz - 0.005, 0, -0.25));               // collar
    for (const sd of [-1, 1]) {
      k.add(taperY(cyl(0.058, 0.048, 0.66, 10), -0.12), mt.coat, C(sd * 0.225, top - 0.42, oz - 0.005, 0, 0, sd * 0.07));   // sleeves
      k.add(cyl(0.05, 0.05, 0.03, 10), mt.coat, C(sd * 0.248, top - 0.75, oz - 0.005, 0, 0, sd * 0.07));                 // cuffs
      k.add(rb(0.075, 0.24, 0.012, 0.004, 1), mt.coat, C(sd * 0.05, top - 0.17, oz + 0.064, 0, 0, -sd * 0.32));         // lapels (a V)
      k.add(rb(0.13, 0.13, 0.008, 0.004, 1), mt.coat, C(sd * 0.12, top - 0.78, oz + 0.064));                            // hip pockets
    }
    k.add(rb(0.1, 0.09, 0.008, 0.003, 1), mt.coat, C(0.12, top - 0.34, oz + 0.064));                                    // breast pocket
    k.add(cyl(0.0045, 0.0045, 0.11, 6), mt.red, C(0.1, top - 0.29, oz + 0.07));                                           // a pen in it
    k.add(bx(0.006, 0.66, 0.004), mt.alu, C(0, top - 0.62, oz + 0.062));                                                  // placket line
    for (let i = 0; i < 4; i++) k.add(new THREE.SphereGeometry(0.008, 8, 6), mt.white, C(0.012, top - 0.34 - i * 0.16, oz + 0.064));
    box3(rx - 0.28, 0, rz - 0.32, rx + 0.26, 1.85, rz + 0.3);
  }

  // ---------------- -z wall pier between window 2 and the shelf: a pinned graph sheet; desk stopwatch ----------------
  {
    const gx = 0.88, gy = 1.72, gw = 0.42, gh = 0.56;
    k.add(rb(gw + 0.05, gh + 0.05, 0.012, 0.004, 1), mt.hardboard, T(gx, gy, Z0 + 0.006));
    k.add(quad(gw, gh), mt.graph, T(gx, gy, Z0 + 0.0135));
    for (const [dx, dy] of [[-1, 1], [1, 1]]) k.add(new THREE.SphereGeometry(0.008, 8, 6), mt.red, T(gx + dx * (gw / 2 - 0.02), gy + dy * (gh / 2 - 0.02), Z0 + 0.018));
    // stopwatch on the desk by the clipboard: chrome case, white dial, crown
    const sx = (DESK.x0 + DESK.x1) / 2 - 0.42, sz = Z0 + 0.01 + DESK.d / 2 + 0.2;
    k.add(cyl(0.032, 0.032, 0.012, 20), mt.chrome, T(sx, DESK.h + 0.006, sz));
    k.add(new THREE.CircleGeometry(0.027, 20), mt.white, at(T(sx, DESK.h + 0.0125, sz), T(0, 0, 0, 0, -Math.PI / 2)));
    k.add(cyl(0.006, 0.006, 0.014, 8), mt.chrome, T(sx, DESK.h + 0.006, sz - 0.038, 0, Math.PI / 2));
    k.add(bx(0.002, 0.002, 0.022), mt.red, T(sx + 0.004, DESK.h + 0.0135, sz - 0.006, 0.5));
  }

  // ---------------- the gauge end, window side: spare rope coiled on a peg, fire extinguisher; cork board on the pier ----
  {
    const wx = X0, cz0 = -1.58;
    // peg: a wall plate and a steel peg sticking out of the gauge wall
    k.add(rb(0.012, 0.1, 0.07, 0.004, 1), mt.frame, T(wx + 0.006, 1.86, cz0));
    k.add(cyl(0.011, 0.011, 0.11, 8), mt.frameDark, T(wx + 0.06, 1.865, cz0, 0, 0, Math.PI / 2 + 0.15));
    // the coil: 7 loops hanging off the peg in the wall plane, the end falling a little below them
    const pts: THREE.Vector3[] = [], nl = 7, Rr = rng(77);
    const lw = Array.from({ length: nl }, () => 0.3 + 0.04 * Rr()), lh = Array.from({ length: nl }, () => 0.5 + 0.05 * Rr());
    for (let i = 0; i <= nl * 24; i++) {
      const t = i / 24, L = Math.min(nl - 1, Math.floor(t)), th = 2 * Math.PI * (t - L), f = t / nl;
      const w = lw[L], h = lh[L];
      pts.push(V(wx + 0.035 + 0.05 * f + 0.008 * Math.sin(th), 1.875 - 0.5 * h * (1 - Math.cos(th)) * (0.92 + 0.08 * Math.cos(th)), cz0 + 0.5 * w * Math.sin(th) * (0.75 + 0.25 * (1 - Math.cos(th)) / 2)));
    }
    const e = pts[pts.length - 1];
    pts.push(V(e.x + 0.01, e.y - 0.12, e.z + 0.05), V(e.x + 0.012, e.y - 0.3, e.z + 0.07), V(e.x + 0.01, e.y - 0.42, e.z + 0.05));
    k.add(tube(pts, 0.014, 300, 7), mt.coil);
    box3(wx, 1.0, cz0 - 0.2, wx + 0.12, 1.9, cz0 + 0.2);
    // fire extinguisher on a wall bracket, low
    const ex = wx + 0.1, ez = -1.6;
    k.add(lathe([[0, 0], [0.074, 0], [0.08, 0.02], [0.08, 0.46], [0.07, 0.52], [0.042, 0.56], [0.03, 0.57], [0, 0.57]], 20), mt.extRed, T(ex, 0.22, ez));
    k.add(cyl(0.02, 0.024, 0.06, 10), mt.panelDark, T(ex, 0.82, ez));
    k.add(rb(0.03, 0.022, 0.14, 0.006, 1), mt.panelDark, T(ex + 0.02, 0.86, ez - 0.03, 0, 0, -0.25));               // handle
    k.add(tube([V(ex + 0.03, 0.83, ez + 0.02), V(ex + 0.085, 0.76, ez + 0.06), V(ex + 0.1, 0.55, ez + 0.07), V(ex + 0.09, 0.4, ez + 0.06)], 0.009, 16, 6), mt.rubber);
    k.add(rb(0.07, 0.022, 0.025, 0.008, 1), mt.panelDark, T(ex + 0.09, 0.39, ez + 0.06));
    { const lb = new THREE.CylinderGeometry(0.0812, 0.0812, 0.14, 10, 1, true, Math.PI / 2 - 0.6, 1.2); k.add(lb, mt.white, T(ex, 0.5, ez)); }   // blank label
    k.add(rb(0.015, 0.05, 0.16, 0.004, 1), mt.frameDark, T(wx + 0.008, 0.66, ez));                                    // bracket
    k.add(rb(0.1, 0.012, 0.03, 0.004, 1), mt.frameDark, T(wx + 0.05, 0.62, ez));
    box3(wx, 0.2, ez - 0.09, ex + 0.12, 0.92, ez + 0.1);
    // cork board on the -z wall pier between the corner and window 1, above the recorder trolley and the tile cap
    const bx0 = -3.86, bx1 = -3.2, by0 = 1.45, by1 = 2.07, bcx = (bx0 + bx1) / 2, bcy = (by0 + by1) / 2, wz = Z0;
    k.add(quad(bx1 - bx0, by1 - by0), mt.cork, T(bcx, bcy, wz + 0.0125));
    k.add(bx(bx1 - bx0, by1 - by0, 0.012), mt.hardboard, T(bcx, bcy, wz + 0.006));
    for (const sd of [-1, 1]) { k.add(rb(bx1 - bx0 + 0.06, 0.03, 0.02, 0.006, 1), mt.wood, T(bcx, sd < 0 ? by0 - 0.015 : by1 + 0.015, wz + 0.014)); k.add(rb(0.03, by1 - by0, 0.02, 0.006, 1), mt.wood, T(sd < 0 ? bx0 - 0.015 : bx1 + 0.015, bcy, wz + 0.014)); }
    const notes: [number, number, number, number, number, number][] = [[-3.72, 1.88, 0.16, 0.2, 0.06, 1], [-3.48, 1.92, 0.2, 0.15, -0.05, 0], [-3.32, 1.66, 0.15, 0.2, 0.03, 3], [-3.68, 1.62, 0.21, 0.24, -0.04, 2], [-3.44, 1.62, 0.13, 0.13, 0.07, 1]];
    notes.forEach(([x, y, w2, h2, rot, cell], i) => {
      const u0 = (cell % 2) * 0.5, v1 = 1 - Math.floor(cell / 2) * 0.5;
      k.add(quad(w2, h2, [u0, v1 - 0.5 * (h2 / Math.max(w2, h2)), u0 + 0.5 * (w2 / Math.max(w2, h2)), v1]), mt.notes, T(x, y, wz + 0.014 + i * 0.0004, 0, 0, rot));
      k.add(new THREE.SphereGeometry(0.008, 8, 6), [mt.red, mt.lamp, mt.mug][i % 3], T(x, y + h2 / 2 - 0.02, wz + 0.022));
    });
  }

  // ---------------- +x end wall: door with a vision panel, switch and conduit ----------------
  {
    const [z0, z1] = DOOR, cz = (z0 + z1) / 2, w = z1 - z0;
    // frame (architrave) and the flush door leaf, slightly recessed
    for (const s of [-1, 1]) k.add(bx(0.03, DH + 0.06, 0.07), mt.doorFrame, T(X1 - 0.015, (DH + 0.06) / 2, cz + s * (w / 2 + 0.035)));
    k.add(bx(0.03, 0.07, w + 0.14), mt.doorFrame, T(X1 - 0.015, DH + 0.035, cz));
    for (const s of [-1, 1]) worldUV(k.add(new THREE.BoxGeometry(WT, DH, 0.004), mt.paint, T(X1 + WT / 2, DH / 2, cz + s * (w / 2 - 0.002))), 0, 0);
    const lx = X1 + 0.04;
    k.add(bx(0.04, DH - 0.01, w - 0.01), mt.door, T(lx, (DH - 0.01) / 2, cz));
    k.add(bx(0.01, 0.52, 0.2), mt.doorFrame, T(lx - 0.022, 1.55, cz + 0.17));                       // vision panel bead
    k.add(quad(0.16, 0.48), mt.doorGlass, T(lx - 0.0275, 1.55, cz + 0.17, -Math.PI / 2));
    k.add(bx(0.005, 0.25, w - 0.08), mt.alu, T(lx - 0.022, 0.13, cz));                               // kick plate
    // lever handle on the lock side (+z edge)
    k.add(cyl(0.028, 0.028, 0.012, 14), mt.chrome, T(lx - 0.026, 1.0, z0 + 0.08, 0, 0, Math.PI / 2));
    k.add(rod(V(lx - 0.03, 1.0, z0 + 0.08), V(lx - 0.075, 1.0, z0 + 0.08), 0.008), mt.chrome);
    k.add(rod(V(lx - 0.075, 1.0, z0 + 0.08), V(lx - 0.075, 1.0, z0 + 0.2), 0.009), mt.chrome);
    for (const y of [0.25, 1.05, 1.85]) k.add(cyl(0.008, 0.008, 0.1, 8), mt.alu, T(lx - 0.02, y, z1 - 0.004));
    box3(X1 - 0.1, 0, z0, X1 + WT, DH, z1);
    // light switch beside the door and its surface conduit up to the ceiling
    const swz = z0 - 0.17;
    k.add(rb(0.012, 0.085, 0.085, 0.004, 1), mt.plate, T(X1 - 0.006, 1.35, swz));
    k.add(bx(0.012, 0.02, 0.012), mt.panelDark, T(X1 - 0.014, 1.35, swz));
    k.add(rod(V(X1 - 0.012, 1.4, swz), V(X1 - 0.012, HC, swz), 0.01, 8), mt.plate);
  }

  // ---------------- +z wall: a wooden bench (waiting subjects) and a spare chair ----------------
  {
    const x0 = -1.5, x1 = 0.5, z = Z1 - 0.21, h = 0.45;
    for (let s = 0; s < 3; s++) k.add(rb(x1 - x0, 0.03, 0.11, 0.008, 1), mt.wood, T((x0 + x1) / 2, h - 0.015, z - 0.13 + s * 0.13));
    for (const sx of [x0 + 0.12, x1 - 0.12]) {
      k.add(bx(0.04, h - 0.03, 0.04), mt.deskSteel, T(sx, (h - 0.03) / 2, z - 0.15)); k.add(bx(0.04, h - 0.03, 0.04), mt.deskSteel, T(sx, (h - 0.03) / 2, z + 0.15));
      k.add(bx(0.04, 0.04, 0.34), mt.deskSteel, T(sx, h - 0.05, z));
    }
    box3(x0, 0, z - 0.2, x1, h, z + 0.2);
    const cx = 1.2, cz = Z1 - 0.32;
    k.add(rb(0.44, 0.05, 0.42, 0.02, 2), mt.vinyl, T(cx, 0.46, cz));
    k.add(rb(0.42, 0.24, 0.05, 0.02, 2), mt.vinyl, T(cx, 0.74, cz + 0.2, 0, 0.1));
    for (const s of [-1, 1]) for (const t of [-1, 1]) k.add(bar(V(cx + s * 0.2, 0, cz + t * 0.19), V(cx + s * 0.2, t > 0 ? 0.86 : 0.44, cz + t * 0.2), 0.022), mt.chrome);
    box3(cx - 0.23, 0, cz - 0.22, cx + 0.23, 0.9, cz + 0.25);
  }

  // ---------------- bake ----------------
  tris += k.bake(group, noCast);
  for (const c of group.children) {
    const n = c.name;
    if (n === "lab:slat" || n === "lab:diffuser" || n === "lab:outside") c.layers.set(NOINK);
    if (n === "lab:windowGlass") { c.layers.set(NOINK); c.renderOrder = 5; }
    if (n === "lab:outside") { c.castShadow = false; c.receiveShadow = false; }
  }

  // ---------------- the needle (own group, turned by setDial) and the dial glass ----------------
  const needle = new THREE.Group(); needle.name = "lab:needle";
  needle.position.set(FACE_X + 0.006, DIAL_Y, ROPE_Z); needle.rotation.set(0, Math.PI / 2, 0, "YXZ");
  const spin = new THREE.Group(); needle.add(spin);
  {
    const sh = new THREE.Shape();
    sh.moveTo(-0.0055, -0.0); sh.lineTo(-0.0016, 0.236); sh.lineTo(0, 0.247); sh.lineTo(0.0016, 0.236); sh.lineTo(0.0055, 0); sh.lineTo(0.009, -0.05);
    sh.absarc(0, -0.058, 0.016, 0.0, Math.PI, true); sh.lineTo(-0.009, -0.05); sh.closePath();
    const g = new THREE.ExtrudeGeometry(sh, { depth: 0.0025, bevelEnabled: false, curveSegments: 10 });
    const nm = new THREE.Mesh(g, mt.needle); nm.castShadow = true; nm.receiveShadow = true; spin.add(nm);
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.022, 0.008, 20).rotateX(Math.PI / 2), mt.needle); hub.position.z = 0.003; spin.add(hub);
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.011, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2).rotateX(Math.PI / 2), mt.chrome); cap.position.z = 0.007; spin.add(cap);
    tris += g.getAttribute("position").count / 3 + 80 + 120;
  }
  group.add(needle);
  const glassG = new THREE.CircleGeometry(R_FACE + 0.004, 64);
  { const p = glassG.getAttribute("position"); for (let i = 0; i < p.count; i++) { const r2 = (p.getX(i) ** 2 + p.getY(i) ** 2) / (R_FACE * R_FACE); p.setZ(i, 0.01 * (1 - r2)); } glassG.computeVertexNormals(); }
  const dialGlass = new THREE.Mesh(glassG, mt.dialGlass); dialGlass.name = "lab:dialGlass";
  dialGlass.position.set(FACE_X + 0.016, DIAL_Y, ROPE_Z); dialGlass.rotation.set(0, Math.PI / 2, 0);
  dialGlass.layers.set(NOINK); dialGlass.renderOrder = 6; dialGlass.castShadow = false; dialGlass.receiveShadow = false;
  group.add(dialGlass); tris += 64;

  // the recorder's pen (animate wiggles it along the chart window)
  const pen = new THREE.Mesh(new THREE.BoxGeometry(0.004, 0.012, 0.02), mt.red); pen.name = "lab:recorderPen";
  pen.position.set(-3.66 + 0.168, 0.72 + 0.0125 + 0.095, 0); group.add(pen); tris += 12;
  const penZ0 = -2.15 - 0.03 - 0.12, penZ1 = -2.15 - 0.03 + 0.12;

  // ---------------- sun (shadow frustum fitted to the room seen from the sun) ----------------
  const sd = V(...LAB_SUN.dir).normalize(), tgt = V(-0.5, 1.2, 0);
  const fit = (() => {
    const ax = new THREE.Vector3().crossVectors(V(0, 1, 0), sd).normalize(), ay = new THREE.Vector3().crossVectors(sd, ax);
    let l = Infinity, r = -Infinity, b = Infinity, t = -Infinity;
    for (const x of [X0 - 0.05, X1 + 0.05]) for (const y of [0, HC + 0.1]) for (const z of [Z0 - WT - 0.05, Z1 + 0.05]) {
      const p = V(x, y, z).sub(tgt), u = p.dot(ax), v = p.dot(ay);
      l = Math.min(l, u); r = Math.max(r, u); b = Math.min(b, v); t = Math.max(t, v);
    }
    return { left: l - 0.1, right: r + 0.1, top: t + 0.1, bottom: b - 0.1, near: 0.5, far: 50 };
  })();
  const L: typeof LIGHTS = {
    ...LIGHTS,
    sun: { color: LAB_SUN.color, intensity: LAB_SUN.intensity, position: tgt.clone().addScaledVector(sd, 24).toArray() as V3, target: tgt.toArray() as V3 },
    shadow: { ...LIGHTS.shadow, camera: fit },
  };
  const sun = makeSun(L); sun.name = "lab:sun"; sun.target.name = "lab:sunTarget"; sun.shadow.radius = 3;
  // the batten over the gauge end lights the dial face from above-front (no shadow: it only lifts the enamel to white)
  const dialLamp = new THREE.SpotLight("#f4f7f2", 14, 0, 0.42, 0.85, 2); dialLamp.name = "lab:dialLamp";
  dialLamp.position.set(-2.5, HC - 0.12, ROPE_Z); dialLamp.target.position.set(FACE_X, DIAL_Y - 0.1, ROPE_Z); dialLamp.castShadow = false;

  // ---------------- anchors ----------------
  const positions = POS_X.map((x) => V(x, 0, ROPE_Z));
  const dialCentre = V(FACE_X, DIAL_Y, ROPE_Z), dialNormal = V(1, 0, 0);
  const anchors: LabAnchors = {
    hook: V(FX + 0.275 + 0.028 + 0.032, ROPE_Y, ROPE_Z), hookTie: { axis: V(0, 0, 1), postR: 0.0075 }, ropeY: ROPE_Y, ropeZ: ROPE_Z,
    positions, facing: -Math.PI / 2,
    researcher: V(POS_X[0] + 0.44, 0, ROPE_Z - 0.38),
    researcherIdle: V(-3.3, 0, 1.6),
    desk: V(dcx - 0.12, 0, deskZ1 + 0.26), deskTop: V(dcx, DESK.h, dcz),
    dialCentre, dialNormal, dialRadius: R_FACE, dialBezelRadius: R_BEZEL,
    door: V(X1 - 0.5, 0, (DOOR[0] + DOOR[1]) / 2),
  };

  // ---------------- cameras (9:16) ----------------
  const v3 = (v: THREE.Vector3): V3 => [+v.x.toFixed(3), +v.y.toFixed(3), +v.z.toFixed(3)];
  const dirYP = (yaw: number, pitch: number) => V(Math.cos(pitch) * Math.cos(yaw), Math.sin(pitch), Math.cos(pitch) * Math.sin(yaw)); // yaw < 0 turns toward -z
  const d2r = Math.PI / 180;
  const sidePos = V(...SIDE_POS), sidePitch = SIDE_PITCH * d2r;
  const p1 = positions[0];
  const p1Dir = V(-0.8, 0, 0.6).normalize(), p1Pos = p1.clone().addScaledVector(p1Dir, 1.55).setY(1.22);
  // pos1 frames square 1's head (right of centre) and the researcher's (left, behind it on the window side) together
  const p1Look = V(POS_X[0] + 0.13, 1.1, ROPE_Z + 0.085);
  // side (establishing): fixed position and pitch; the yaw centres, and the lens fits, the dial's bezel (left) and
  // square 6's head (right; side drawing) inside NDC +-0.9
  const fitPts: THREE.Vector3[] = [];
  for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2; fitPts.push(V(FACE_X + 0.03, DIAL_Y + R_BEZEL * Math.sin(a), ROPE_Z + R_BEZEL * Math.cos(a))); }
  // square 6's head: the haul card leans BACK (away from the gauge), so the head sits ~0.31 m to the camera's right of
  // the feet on the yaw-only billboard, 1.11 m up, radius ~0.2 (measured from the cast in preview/lab_side.ts)
  const toC = V(sidePos.x - POS_X[5], 0, sidePos.z - ROPE_Z).normalize(), h6 = V(POS_X[5] + toC.z * 0.31, 1.11, ROPE_Z - toC.x * 0.31);
  for (const d of [V(1, 0, 0), V(-1, 0, 0), V(0, 1, 0), V(0, -1, 0), V(0, 0, 1), V(0, 0, -1)]) fitPts.push(h6.clone().addScaledVector(d, 0.2));
  let sideYaw = 0, sideT = Infinity;
  for (let yd = -175; yd <= -120; yd += 0.05) {
    const yw = yd * d2r, f = dirYP(yw, sidePitch), r = V(-Math.sin(yw), 0, Math.cos(yw));
    let m = 0;
    for (const q of fitPts) { const d = q.clone().sub(sidePos); m = Math.max(m, Math.abs(d.dot(r) / d.dot(f))); }
    if (m < sideT) { sideT = m; sideYaw = yw; }
  }
  const sideFov = (2 * Math.atan((sideT / 0.9) / (9 / 16)) * 180) / Math.PI;
  const sideDir = dirYP(sideYaw, sidePitch);
  // dial cams: one lens; dial = bezel 80 % of the width at 0.9 m, dialFull = the white face exactly the width
  const dialFov = 74, htan = Math.tan((dialFov * d2r) / 2) * (9 / 16);
  const dFull = R_FACE / htan;
  const cams: LabSet["cams"] = {
    /** the faces camera: beside the gauge, 1.95 m to the camera side of the rope line, 1.45 m up, looking down the line
     *  (yaw 38 deg toward -z, 8 deg down). Pullers in view "side": square 1 large at the left (arms and rope run out of
     *  the left edge toward the shackle), the heads separate in a diagonal to square 6 small at the right, faces in the
     *  upper half; the desk, coat stand and door behind the far end. The dial is behind this camera (it faces +x, the
     *  camera looks +x): cut to `side` / `dial` for it. */
    main: { pos: [...MAIN_POS], look: [...MAIN_LOOK], fov: MAIN_FOV },
    /** establishing (the counting beat 1 -> 2 -> 3 -> 6): from the door end on the camera side at standing eye level,
     *  7 deg down: the dial upper left, the rope line and all six squares receding to it (square 6 large at the right),
     *  the windows and their sun stripes at the right. Pullers in view "side" (it sees them from behind-left). */
    side: { pos: v3(sidePos), look: v3(sidePos.clone().addScaledVector(sideDir, 6)), fov: +sideFov.toFixed(1) },
    /** medium on square 1 (head and torso; front drawing), from in front and to the camera side at the figure's eye
     *  height, with the researcher (at anchors.researcher, behind it on the window side) in the same frame */
    pos1: { pos: v3(p1Pos), look: v3(p1Look), fov: 47 },
    /** square-on to the dial at 0.9 m: the bezel fills ~80 % of the frame width */
    dial: { pos: v3(dialCentre.clone().addScaledVector(dialNormal, 0.9)), look: v3(dialCentre), fov: dialFov },
    /** the same axis and lens pushed in to dFull: the white face exactly fills the frame width (match cut to a clock) */
    dialFull: { pos: v3(dialCentre.clone().addScaledVector(dialNormal, dFull)), look: v3(dialCentre), fov: dialFov },
  };

  // ---------------- controls ----------------
  const setDial = (v: number) => { const x = Math.min(100, Math.max(0, v)); spin.rotation.z = -((210 + 3 * x) * Math.PI) / 180; };
  const animate = (t: number) => {
    const tt = Math.max(0, t);
    pen.position.z = penZ0 + (penZ1 - penZ0) * (0.62 + 0.05 * Math.sin(tt * 2.1) + 0.03 * Math.sin(tt * 5.3 + 1.1));
  };
  const setLight = (o: { sun?: number; lamp?: number }) => { sun.intensity = LAB_SUN.intensity * Math.min(1, Math.max(0, o.sun ?? 1)); dialLamp.intensity = 14 * Math.min(1.5, Math.max(0, o.lamp ?? 1)); };
  setDial(0); animate(0);
  void ease; void mt;
  return { group, lights: [sun, sun.target, dialLamp, dialLamp.target], anchors, cams, animate, setDial, setLight, objects: { needle, dialGlass, sun, pen, colliders }, tris: Math.round(tris) };
}
