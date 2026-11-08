// Procedural, canvas-drawn wood for the backtest set: every texture comes as an albedo map (sRGB) plus ONE linear
// "surface" map that packs bump height in R and roughness in G (three samples bumpMap.x and roughnessMap.g, so the
// same texture serves as both). Albedo and surface are drawn from one layout, so seams, joints, nails, knots and checks
// line up. Painterly game-asset look tuned against the reference: nearly flat boards with a few broad soft streaks and
// one or two crisp drawn grain lines, clean slightly wavering dark seams with a light worn bevel (no photographic
// noise, no pinstripe grain). Deterministic (seeded RNG), no image files.
//
// Lighting: albedos are calibrated under pbr.ts (makeSun(), mats(makeEnv(ENV), makeEnv(ENV_FILL)).wood / .paint,
// N8AO per LIGHTS.ao, NEUTRAL tone mapping). Plug the maps into those materials with woodMaps():
//   M.wood(W.woodMaps(W.deckPlanks(), [3.5, 6.364]))
// woodMat() is a MeshStandardMaterial fallback for scenes without pbr.ts; it requires an envMap (without one, faces
// away from the sun go nearly black).
//
// UV conventions
//  - deckPlanks(): planks run along the canvas VERTICAL (texture v). On BtCannon's deck PlaneGeometry(7.7, 28) rotated
//    flat, u runs along world x (7.7 m) and v along world -z (28 m), so planks run fore-aft along z like the reference:
//    repeat = (7.7 * repeatPerMetre.x, 28 * repeatPerMetre.y).
//  - bulwarkPlanks / railCap / carriageWood / wheelWood: "metric" textures, grain along u, v = up. Their meshes need
//    metric UVs (metricUV() rewrites a group's UVs in metres); repeat = repeatPerMetre (the default).
//  - bucketStaves / barrelStaves: fitted to props.ts lathe UVs (u around, v = profile point index): repeat (1, 1).
//  - rope: u = metres along the tube after tubeUV() (any number of merged tubes), v around: repeat = repeatPerMetre.
//    Without tubeUV (u 0..1 per tube): repeat = (tubeLength * repeatPerMetre.x, 1).
//  - poleWood: CylinderGeometry side UVs (u around, v along): repeat = (1, length * repeatPerMetre.y).
import * as THREE from "three";

export type WoodTex = {
  map: THREE.CanvasTexture;
  /** height in R; the same texture as `rough` (packed) */
  bump: THREE.CanvasTexture;
  /** roughness in G; the same texture as `bump` (packed) */
  rough: THREE.CanvasTexture;
  /** texture tiles per metre along u and v (metric UVs), or the fixed repeat for UV-fitted textures (see header) */
  repeatPerMetre: THREE.Vector2;
  /** bumpScale that reads right at 1-3 m on the 1080x1920 frame */
  bumpScale: number;
};
export type RGB = [number, number, number];

// ---------------- infrastructure ----------------
type G = CanvasRenderingContext2D;
/** mulberry32: small, fast, deterministic */
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
/** CPU-backed 2D canvases: the sheets are read back (blur, packing) and rasterising them on the GPU under software GL
 *  (SwiftShader on CI) costs more than Skia raster */
const CTX: CanvasRenderingContext2DSettings = { willReadFrequently: true };
const canvas = (w: number, h: number) => { const c = document.createElement("canvas"); c.width = w; c.height = h; return c; };
/** smooth 1-D wobble in [-1, 1]: a seeded sum of three sines (hand-drawn line waver) */
const wobbler = (R: () => number, period: number) => {
  const p = [0, 1, 2].map((i) => ({ f: (6.283 / period) * (1 + i * 1.7 + R() * 0.6), ph: R() * 6.283, a: [0.55, 0.3, 0.15][i] }));
  return (s: number) => p.reduce((acc, q) => acc + q.a * Math.sin(s * q.f + q.ph), 0);
};

/** albedo + height + roughness canvases of one size, drawn from one layout; height and roughness are packed at the end */
class Sheet {
  ca: HTMLCanvasElement; ch: HTMLCanvasElement; cr: HTMLCanvasElement; a: G; h: G; r: G;
  constructor(public W: number, public H: number) {
    this.ca = canvas(W, H); this.ch = canvas(W, H); this.cr = canvas(W, H);
    this.a = this.ca.getContext("2d", CTX)!; this.h = this.ch.getContext("2d", CTX)!; this.r = this.cr.getContext("2d", CTX)!;
    for (const g of [this.a, this.h, this.r]) { g.lineCap = "round"; g.lineJoin = "round"; }
  }
  /** call fn(dx, dy) once per tile copy that the box [x0,x1]x[y0,y1] touches, so drawing wraps seamlessly */
  wrap(x0: number, y0: number, x1: number, y1: number, fn: (dx: number, dy: number) => void) {
    for (const dx of [0, -this.W, this.W]) for (const dy of [0, -this.H, this.H]) {
      if (x1 + dx < 0 || x0 + dx > this.W || y1 + dy < 0 || y0 + dy > this.H) continue;
      fn(dx, dy);
    }
  }
  /** pack height (R) + roughness (G) into the height canvas and wrap everything as textures */
  done(rep: THREE.Vector2, bumpScale: number, wrapS = true, wrapT = true): WoodTex {
    const { W, H } = this, hd = this.h.getImageData(0, 0, W, H), rd = this.r.getImageData(0, 0, W, H), d = hd.data, e = rd.data;
    for (let i = 0; i < d.length; i += 4) { d[i + 1] = e[i]; d[i + 2] = 0; d[i + 3] = 255; }
    this.h.putImageData(hd, 0, 0);
    this.cr.width = this.cr.height = 1; // release the roughness canvas
    const surf = tex(this.ch, false, wrapS, wrapT);
    return { map: tex(this.ca, true, wrapS, wrapT), bump: surf, rough: surf, repeatPerMetre: rep, bumpScale };
  }
}
const tex = (c: HTMLCanvasElement, srgb: boolean, wrapS: boolean, wrapT: boolean) => {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  t.wrapS = wrapS ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping; t.wrapT = wrapT ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping;
  t.generateMipmaps = true; t.minFilter = THREE.LinearMipmapLinearFilter; t.magFilter = THREE.LinearFilter;
  t.anisotropy = 8; t.needsUpdate = true;
  return t;
};
/** gaussian blur that wraps round the tile edges (canvas blur alone would darken the borders) */
const blurWrap = (c: HTMLCanvasElement, px: number, wrapX = true, wrapY = true) => {
  if (px <= 0) return;
  const W = c.width, H = c.height, p = Math.ceil(px * 3);
  const big = canvas(W + 2 * p, H + 2 * p), g = big.getContext("2d", CTX)!;
  for (const dx of [-1, 0, 1]) for (const dy of [-1, 0, 1]) {
    if ((!wrapX && dx) || (!wrapY && dy)) continue;
    g.drawImage(c, p + dx * W, p + dy * H);
  }
  if (!wrapX) { g.drawImage(c, 0, 0, 1, H, 0, p, p, H); g.drawImage(c, W - 1, 0, 1, H, W + p, p, p, H); }
  if (!wrapY) { g.drawImage(big, 0, p, W + 2 * p, 1, 0, 0, W + 2 * p, p); g.drawImage(big, 0, H + p - 1, W + 2 * p, 1, 0, H + p, W + 2 * p, p); }
  const o = c.getContext("2d", CTX)!; o.save(); o.globalCompositeOperation = "copy"; o.filter = `blur(${px}px)`; o.drawImage(big, -p, -p); o.restore();
};
/** gaussian-ish blur of a greyscale canvas (R channel) in JS: three separable box passes, wrapping round the tile.
 *  Much faster than canvas filter blur under software GL (SwiftShader on CI). */
const blurGrey = (c: HTMLCanvasElement, sigma: number, wrapX = true, wrapY = true) => {
  if (sigma <= 0) return;
  const g = c.getContext("2d", CTX)!, W = c.width, H = c.height, im = g.getImageData(0, 0, W, H), d = im.data, N = W * H;
  let a = new Float32Array(N), b = new Float32Array(N);
  for (let i = 0; i < N; i++) a[i] = d[i * 4];
  const r = Math.max(1, Math.round((Math.sqrt(4 * sigma * sigma + 1) - 1) / 2)), k = 1 / (2 * r + 1);
  const ix = (L: number, wrap: boolean) => { const t = new Int32Array(L + 2 * r + 2); for (let i = 0; i < t.length; i++) { const j = i - r - 1; t[i] = wrap ? ((j % L) + L) % L : Math.max(0, Math.min(L - 1, j)); } return t; };
  const tx = ix(W, wrapX), ty = ix(H, wrapY);
  for (let pass = 0; pass < 3; pass++) {
    for (let y = 0; y < H; y++) {
      const o = y * W; let s = 0;
      for (let i = -r; i <= r; i++) s += a[o + tx[i + r + 1]];
      for (let x = 0; x < W; x++) { b[o + x] = s * k; s += a[o + tx[x + 2 * r + 2]] - a[o + tx[x + 1]]; }
    }
    [a, b] = [b, a];
  }
  for (let pass = 0; pass < 3; pass++) {
    for (let x = 0; x < W; x++) {
      let s = 0;
      for (let i = -r; i <= r; i++) s += a[ty[i + r + 1] * W + x];
      for (let y = 0; y < H; y++) { b[y * W + x] = s * k; s += a[ty[y + 2 * r + 2] * W + x] - a[ty[y + 1] * W + x]; }
    }
    [a, b] = [b, a];
  }
  for (let i = 0; i < N; i++) { const v = a[i]; d[i * 4] = v; d[i * 4 + 1] = v; d[i * 4 + 2] = v; d[i * 4 + 3] = 255; }
  g.putImageData(im, 0, 0);
};
/** filled brush stroke along pts, width w tapering to points at both ends (a painted streak, not a hard line) */
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
/** soft elliptical spot (radial gradient), for tone blotches, wear and nail shadows */
const spot = (g: G, x: number, y: number, rx: number, ry: number, col: string, col0: string) => {
  g.save(); g.translate(x, y); g.scale(1, ry / rx);
  const gr = g.createRadialGradient(0, 0, 0, 0, 0, rx); gr.addColorStop(0, col); gr.addColorStop(1, col0);
  g.fillStyle = gr; g.beginPath(); g.arc(0, 0, rx, 0, Math.PI * 2); g.fill(); g.restore();
};

// ---------------- shared board painter ----------------
/** one board = a rectangle of wood on the sheet; grain runs along `along` ("y" = canvas vertical, "x" = horizontal) */
type Board = { x0: number; y0: number; x1: number; y1: number; tone: RGB; hgt: number; rough: number; seed: number;
  /** spans the whole tile along the grain with no butt joint: no end gaps, and its grain wraps across the tile edge */
  seamless?: boolean };
type BoardStyle = {
  along: "x" | "y";
  pxPerM: [number, number];  // canvas px per metre in x and y
  seam: RGB;                 // seam / gap colour
  seamW: number;             // half gap in px, across the board edge
  endW: number;              // half gap in px at board ends (butt joints)
  wobble?: number;           // max px the albedo seam edge wavers into the board (hand-drawn line; height stays straight). default 1
  grainDark: RGB; grainLight: RGB;
  grainPerM: number;         // broad soft streaks per metre of board length per 0.2 m of width
  grainW?: number;           // streak width, mm (default 10)
  grainA: [number, number];  // alpha range of the dark streaks
  grainLightK?: number;      // light streaks as a fraction of the dark ones (default 0.15)
  grainSoft?: number;        // blur (px) of the streak layer (default 1.5)
  grainBump?: number;        // streak depth in the height map (default 0: boards stay smooth)
  accents?: number;          // crisp drawn dark grain lines per metre of board (default 0)
  accentA?: [number, number];
  accentW?: number;          // accent line width, mm (default 2.5)
  knots: number;             // chance of a knot per metre of board
  knotCol: RGB;
  checks?: number;           // chance of a shallow check (crack) per board (default 0.3)
  wear: RGB; wearA: number;  // light worn edge colour and strength
  ao: number;                // painted cavity darkening next to seams
  crossGrad: number;         // light-to-dark tint across the board
  blotch: number;            // strength of the large soft tonal patches
  long?: boolean;            // gaps + cavity + worn bevel along the long edges (default true)
  ends?: boolean;            // gaps + cavity at the board ends (default true)
  bevelBlur?: number;        // height-map blur that rounds the board edges (default 1.3 x seamW)
};
/** paint the albedo, height and roughness of a list of boards (the seam colour / floor is filled first) */
const paintBoards = (S: Sheet, boards: Board[], st: BoardStyle) => {
  const { a, h, r } = S, Y = st.along === "y", LONG = st.long ?? true, ENDS = st.ends ?? true;
  const [pxX, pxY] = st.pxPerM, pxL = Y ? pxY : pxX, pxW = Y ? pxX : pxY; // px per metre along / across the grain
  a.fillStyle = css(st.seam); a.fillRect(0, 0, S.W, S.H);
  h.fillStyle = grey(0); h.fillRect(0, 0, S.W, S.H);
  r.fillStyle = grey(245); r.fillRect(0, 0, S.W, S.H);
  // board bodies (inset by the gap)
  const sw = LONG ? st.seamW : 0, ew0 = ENDS ? st.endW : 0;
  const inset = (b: Board) => { const e = b.seamless ? 0 : ew0; return Y
    ? [b.x0 + sw, b.y0 + e, b.x1 - sw, b.y1 - e]
    : [b.x0 + e, b.y0 + sw, b.x1 - e, b.y1 - sw]; };
  for (const b of boards) {
    const [x0, y0, x1, y1] = inset(b);
    S.wrap(x0, y0, x1, y1, (dx, dy) => {
      a.fillStyle = css(b.tone); a.fillRect(x0 + dx, y0 + dy, x1 - x0, y1 - y0);
      h.fillStyle = grey(b.hgt); h.fillRect(x0 + dx, y0 + dy, x1 - x0, y1 - y0);
      r.fillStyle = grey(b.rough); r.fillRect(x0 + dx, y0 + dy, x1 - x0, y1 - y0);
    });
  }
  // rounded board edges = bevels in the height map
  blurGrey(S.ch, st.bevelBlur ?? Math.max(2, st.seamW * 1.3));
  // per-board geometry shared by the passes below: board-space -> canvas (s along the grain, t across), knots + bend
  const meta = boards.map((b) => {
    const R = rng(b.seed), [x0, y0, x1, y1] = inset(b);
    const len = Y ? y1 - y0 : x1 - x0, wid = Y ? x1 - x0 : y1 - y0;
    const P = (s: number, t: number): [number, number] => (Y ? [x0 + t, y0 + s] : [x0 + s, y0 + t]);
    const knots: { s: number; t: number; rs: number; rt: number }[] = [];
    const nk = (len / pxL) * st.knots;
    for (let k = 0; k < Math.floor(nk) + (R() < nk % 1 ? 1 : 0); k++) {
      const rt = (0.007 + 0.006 * R()) * pxW, rs = rt * (pxL / pxW) * (1.8 + 0.8 * R());
      knots.push({ s: rs * 2 + R() * Math.max(1, len - rs * 4), t: wid * (0.25 + 0.5 * R()), rs, rt });
    }
    const bend = (s: number, t: number) => {
      let d = 0;
      for (const k of knots) {
        const ds = (s - k.s) / (k.rs * 3.2), dt = t - k.t, reach = k.rt * 4.5;
        if (Math.abs(dt) > reach) continue;
        d += Math.sign(dt || 1) * k.rt * 2.1 * Math.exp(-ds * ds) * (1 - Math.abs(dt) / reach);
      }
      return d;
    };
    return { b, x0, y0, x1, y1, len, wid, P, knots, bend };
  });
  // clip to the board (a seamless board is open along the grain, so its strokes wrap round the tile via the copies)
  const clipAll = (gs: G[], m: (typeof meta)[number], dx: number, dy: number) => {
    const o = m.b.seamless ? 4 * (Y ? S.H : S.W) : 0;
    for (const g of gs) { g.save(); g.beginPath(); if (Y) g.rect(m.x0 + dx, m.y0 + dy - o, m.x1 - m.x0, m.y1 - m.y0 + 2 * o); else g.rect(m.x0 + dx - o, m.y0 + dy, m.x1 - m.x0 + 2 * o, m.y1 - m.y0); g.clip(); }
  };
  // pass 1: tonal patches and the cross-board gradient (albedo), broad grain streaks into a soft layer
  const layer = canvas(S.W >> 1, S.H >> 1), gl = layer.getContext("2d", CTX)!; // soft streaks: half resolution is plenty
  gl.scale(0.5, 0.5);
  const gW = ((st.grainW ?? 10) / 1000) * pxW, gLK = st.grainLightK ?? 0.15, gB = st.grainBump ?? 0;
  for (const m of meta) {
    const { b, x0, y0, x1, y1, len, wid, P } = m;
    S.wrap(x0, y0, x1, y1, (dx, dy) => {
      clipAll([a, h, r, gl], m, dx, dy); // nothing below runs on past a butt joint
      const RR = rng(b.seed * 7 + 3);    // identical stream for every wrapped copy
      const nb = 2 + Math.floor((len / pxL) * 1.5);
      for (let k = 0; k < nb; k++) {
        const [cx, cy] = P(RR() * len, wid * (0.2 + 0.6 * RR()));
        const rl = (0.25 + 0.5 * RR()) * pxL, rw = wid * (0.35 + 0.4 * RR()), light = RR() < 0.5;
        const c: RGB = light ? [255, 236, 200] : [90, 50, 25], al = st.blotch * (0.6 + 0.8 * RR());
        if (Y) spot(a, cx + dx, cy + dy, rw, rl, css(c, al), css(c, 0)); else spot(a, cx + dx, cy + dy, rl, rw, css(c, al), css(c, 0));
      }
      if (st.crossGrad > 0) {
        const gr = Y ? a.createLinearGradient(x0 + dx, 0, x1 + dx, 0) : a.createLinearGradient(0, y0 + dy, 0, y1 + dy);
        gr.addColorStop(0, `rgba(255,238,205,${st.crossGrad})`); gr.addColorStop(0.45, "rgba(255,238,205,0)");
        gr.addColorStop(0.6, "rgba(70,35,15,0)"); gr.addColorStop(1, `rgba(70,35,15,${st.crossGrad * 1.2})`);
        a.fillStyle = gr; a.fillRect(x0 + dx, y0 + dy, x1 - x0, y1 - y0);
      }
      // broad soft streaks: few, wide, faint (value variation, not pinstripes)
      const ng = Math.round((len / pxL) * st.grainPerM * (wid / pxW / 0.2)), nl = Math.round(ng * gLK);
      for (let k = 0; k < ng + nl; k++) {
        const light = k >= ng, s0 = RR() * len - 0.2 * pxL, sl = (0.35 + 1.1 * RR()) * pxL, t0 = 0.12 * wid + RR() * 0.76 * wid;
        const amp = (1 + 3 * RR()) * (pxW / 1000), wl = (0.3 + 0.6 * RR()) * pxL, ph = RR() * 6.28;
        const w = gW * (0.6 + 0.8 * RR()), al = st.grainA[0] + (st.grainA[1] - st.grainA[0]) * RR();
        const pts: [number, number][] = [];
        for (let s = s0; s <= s0 + sl; s += 14) { const t = t0 + amp * Math.sin((s / wl) * 6.28 + ph); const p = P(s, t + m.bend(s, t)); pts.push([p[0] + dx, p[1] + dy]); }
        gl.fillStyle = light ? css(st.grainLight, al * 0.8) : css(st.grainDark, al); taper(gl, pts, w);
        if (gB > 0 && !light) { h.fillStyle = grey(0, al * gB); taper(h, pts, w); }
        r.fillStyle = light ? grey(0, 0.03) : grey(255, 0.06); taper(r, pts, w);
      }
      for (const g of [a, h, r, gl]) g.restore();
    });
  }
  blurWrap(layer, (st.grainSoft ?? 1.5) / 2);
  a.drawImage(layer, 0, 0, S.W, S.H);
  layer.width = layer.height = 1;
  // pass 2: hand-drawn seam waver (albedo only), checks, knots, crisp accent grain lines, wear + cavity shading
  const wob = st.wobble ?? 1;
  for (const m of meta) {
    const { b, x0, y0, x1, y1, len, wid, P, knots } = m;
    if (LONG && wob > 0) S.wrap(x0 - 4, y0 - 4, x1 + 4, y1 + 4, (dx, dy) => {
      const RW = rng(b.seed * 5 + 11);
      // seam darkness varies +-10 % along its length: soft strips over the gap before this board
      for (let k = 0; k < 2 + Math.floor((len / pxL) * 1.2); k++) {
        const s0 = RW() * len, sl = (0.3 + 0.6 * RW()) * pxL, c: RGB = RW() < 0.5 ? [255, 225, 190] : [0, 0, 0];
        const [ax, ay] = P(s0, -2 * sw), [bx, by] = P(Math.min(len, s0 + sl), 0);
        const gr = Y ? a.createLinearGradient(0, ay + dy, 0, by + dy) : a.createLinearGradient(ax + dx, 0, bx + dx, 0);
        gr.addColorStop(0, css(c, 0)); gr.addColorStop(0.5, css(c, 0.12)); gr.addColorStop(1, css(c, 0));
        a.fillStyle = gr; a.fillRect(Math.min(ax, bx) + dx, Math.min(ay, by) + dy, Math.abs(bx - ax), Math.abs(by - ay));
      }
      for (const side of [0, 1]) {
        const f = wobbler(RW, (0.35 + 0.4 * RW()) * pxL), pts: [number, number][] = [];
        for (let s = 0; s <= len; s += 12) pts.push(P(Math.min(s, len), side ? wid : 0));
        pts.push(P(len, side ? wid : 0));
        for (let i = pts.length - 1; i >= 0; i--) {
          const s = Math.min(i * 12, len), d = wob * Math.max(0, 0.45 + 0.55 * f(s));
          pts.push(P(s, side ? wid - d : d));
        }
        a.fillStyle = css(st.seam); a.beginPath(); a.moveTo(pts[0][0] + dx, pts[0][1] + dy);
        for (const p of pts) a.lineTo(p[0] + dx, p[1] + dy);
        a.closePath(); a.fill();
      }
    });
    S.wrap(x0, y0, x1, y1, (dx, dy) => {
      clipAll([a, h, r], m, dx, dy);
      const RR = rng(b.seed * 11 + 7);
      // the odd shallow check (crack) along the grain
      if (RR() < (st.checks ?? 0.3)) {
        const s0 = RR() * len * 0.8, sl = (0.06 + 0.14 * RR()) * pxL, t0 = 0.15 * wid + RR() * 0.7 * wid, pts: [number, number][] = [];
        for (let s = s0; s <= s0 + sl; s += 8) { const p = P(s, t0 + 1.5 * Math.sin(s * 0.05)); pts.push([p[0] + dx, p[1] + dy]); }
        a.fillStyle = css(mul(st.seam, 1.15), 0.5); taper(a, pts, 2.2);
        h.fillStyle = grey(0, 0.45); taper(h, pts, 3);
      }
      // crisp drawn grain lines: one or two long, gently wavy dark lines that flow round the knots
      const na = (len / pxL) * (st.accents ?? 0), aA = st.accentA ?? [0.16, 0.28], aW = ((st.accentW ?? 2.5) / 1000) * pxW;
      for (let k = 0; k < Math.floor(na) + (RR() < na % 1 ? 1 : 0); k++) {
        const sl = Math.min(len * 0.9, (0.5 + 0.9 * RR()) * pxL), s0 = RR() * Math.max(1, len - sl), t0 = 0.2 * wid + RR() * 0.6 * wid;
        const f = wobbler(RR, (0.25 + 0.3 * RR()) * pxL), amp = (2 + 3 * RR()) * (pxW / 1000), al = aA[0] + (aA[1] - aA[0]) * RR();
        const pts: [number, number][] = [];
        for (let s = s0; s <= s0 + sl; s += 8) { const t = t0 + amp * f(s); const p = P(s, t + m.bend(s, t)); pts.push([p[0] + dx, p[1] + dy]); }
        a.fillStyle = css(st.grainDark, al); taper(a, pts, Math.max(1.6, aW), 0.35);
      }
      // knots: soft halo, dark body, a ring
      for (const k of knots) {
        const [cx, cy] = P(k.s, k.t), rx = Y ? k.rt : k.rs, ry = Y ? k.rs : k.rt, X = cx + dx, Yc = cy + dy;
        spot(a, X, Yc, rx * 2.4, ry * 2.0, css(st.knotCol, 0.12), css(st.knotCol, 0));
        a.fillStyle = css(mul(st.knotCol, 1.1), 0.45); a.beginPath(); a.ellipse(X, Yc, rx, ry, 0, 0, Math.PI * 2); a.fill();
        a.strokeStyle = css(mul(st.knotCol, 0.85), 0.3); a.lineWidth = Math.max(1, rx * 0.14);
        a.beginPath(); a.ellipse(X, Yc, rx * 0.62, ry * 0.62, 0, 0, Math.PI * 2); a.stroke();
        spot(h, X, Yc, rx * 1.3, ry * 1.3, grey(255, 0.1), grey(255, 0)); // hard knot stands slightly proud
        spot(r, X, Yc, rx * 1.2, ry * 1.2, grey(0, 0.2), grey(0, 0));
      }
      for (const g of [a, h, r]) g.restore();
    });
    // light worn bevel on the first long edge, cavity shade next to every gap (drawn unclipped onto the bevel)
    S.wrap(x0 - 20, y0 - 20, x1 + 20, y1 + 20, (dx, dy) => {
      const RR = rng(b.seed * 13 + 5), ew = Math.max(2, st.seamW * 1.1);
      const band = (gx0: number, gy0: number, gx1: number, gy1: number, vx: number, vy: number, k: number) => {
        const gr = a.createLinearGradient(gx0, gy0, gx0 + vx, gy0 + vy);
        gr.addColorStop(0, css(st.seam, st.ao * k)); gr.addColorStop(1, css(st.seam, 0));
        a.fillStyle = gr; a.fillRect(Math.min(gx0, gx1), Math.min(gy0, gy1), Math.abs(gx1 - gx0) || 1, Math.abs(gy1 - gy0) || 1);
      };
      const cw = Math.max(5, st.seamW * 3);
      const X0 = x0 + dx, X1 = x1 + dx, Y0 = y0 + dy, Y1 = y1 + dy, ENDS = (st.ends ?? true) && !b.seamless;
      if (st.ao > 0) {
        if (Y) {
          if (LONG) { band(X0, Y0, X0 + cw, Y1, cw, 0, 0.6); band(X1, Y0, X1 - cw, Y1, -cw, 0, 1); }
          if (ENDS) { band(X0, Y0, X1, Y0 + cw * 0.8, 0, cw * 0.8, 0.8); band(X0, Y1, X1, Y1 - cw * 0.8, 0, -cw * 0.8, 1); }
        } else {
          if (LONG) { band(X0, Y0, X1, Y0 + cw, 0, cw, 0.6); band(X0, Y1, X1, Y1 - cw, 0, -cw, 1); }
          if (ENDS) { band(X0, Y0, X0 + cw * 0.8, Y1, cw * 0.8, 0, 0.8); band(X1, Y0, X1 - cw * 0.8, Y1, -cw * 0.8, 0, 1); }
        }
      }
      // worn highlight: broken light line just inside the first long edge, and the board start
      const nseg = LONG && st.wearA > 0 ? 2 + Math.floor((len / pxL) * 2.5) : 0;
      for (let k = 0; k < nseg; k++) {
        const s0 = RR() * len, sl = (0.15 + 0.5 * RR()) * pxL, al = st.wearA * (0.5 + 0.7 * RR()), pts: [number, number][] = [];
        for (let s = s0; s <= Math.min(len, s0 + sl); s += 10) { const p = P(s, ew * 1.3); pts.push([p[0] + dx, p[1] + dy]); }
        a.fillStyle = css(st.wear, al); taper(a, pts, ew * 1.6, 0.3);
        r.fillStyle = grey(0, 0.25 * al / st.wearA); taper(r, pts, ew * 2.4, 0.3);
      }
      if (ENDS && st.wearA > 0) {
        const p0 = P(ew * 0.9, 0), p1 = P(ew * 0.9, wid);
        a.fillStyle = css(st.wear, st.wearA * 0.6); taper(a, [[p0[0] + dx, p0[1] + dy], [p1[0] + dx, p1[1] + dy]], ew * 1.2, 0.2);
      }
    });
  }
};
/** iron nail / treenail head: dark dot with a soft shadow and a pinpoint highlight, recessed in the height map */
const nail = (S: Sheet, x: number, y: number, rx: number, ry: number, col: RGB, a0 = 0.85) => {
  S.wrap(x - rx * 3, y - ry * 3, x + rx * 3, y + ry * 3, (dx, dy) => {
    const X = x + dx, Y = y + dy;
    spot(S.a, X + rx * 0.25, Y + ry * 0.35, rx * 2.0, ry * 2.0, css(mul(col, 0.8), 0.2 * a0), css(col, 0));
    S.a.fillStyle = css(col, a0); S.a.beginPath(); S.a.ellipse(X, Y, rx, ry, 0, 0, Math.PI * 2); S.a.fill();
    S.a.fillStyle = css(mix(col, [255, 240, 215], 0.45), 0.45 * a0); S.a.beginPath(); S.a.ellipse(X - rx * 0.3, Y - ry * 0.3, rx * 0.35, ry * 0.35, 0, 0, Math.PI * 2); S.a.fill();
    spot(S.h, X, Y, rx * 1.6, ry * 1.6, grey(0, 0.4), grey(0, 0));
    spot(S.r, X, Y, rx * 1.4, ry * 1.4, grey(70, 0.8), grey(70, 0));
  });
};
/** joint positions (px, sorted) for one row/column of boards: k joints round a wrapping length L, each at least minSep
 *  from the others and, as far as it fits, nb[i][1] px from any joint of row nb[i][0] (the neighbouring rows) */
const rowJoints = (R: () => number, L: number, k: number, minSep: number, nb: [number[] | undefined, number][]) => {
  const dist = (p: number, q: number) => { const e = Math.abs(p - q) % L; return Math.min(e, L - e); };
  let best: number[] = [], bestScore = -1;
  for (let tries = 0; tries < 60; tries++) {
    const js: number[] = [];
    for (let i = 0; i < k; i++) {
      let j = R() * L;
      for (let t = 0; t < 30 && js.some((q) => dist(j, q) < minSep); t++) j = R() * L;
      js.push(j);
    }
    const score = Math.min(2, ...js.flatMap((j) => nb.flatMap(([row, d]) => (row ?? []).map((q) => dist(j, q) / d))));
    if (score > bestScore) { best = js; bestScore = score; }
    if (score >= 1) break;
  }
  return best.sort((p, q) => p - q);
};

// ---------------- deck ----------------
/** wide warm-tan deck planks running along the canvas vertical. Tile 2.2 m (10 planks of 0.22 m) x 4.4 m, 2048^2;
 *  boards 2.2-4.4 m long with staggered butt joints, a pair of treenails either side of every joint. */
export function deckPlanks(o: { seed?: number; color?: RGB; nailsOnBeams?: boolean } = {}): WoodTex {
  const W = 2048, H = 2048, N = 10, TU = 2.2, TV = 4.4, pu = W / TU, pv = H / TV, PW = W / N;
  const R = rng(o.seed ?? 11), S = new Sheet(W, H);
  const BASE: RGB = o.color ?? [200, 152, 100];
  // staggered butt joints: 1-2 per column, kept away from the neighbours' joints
  const cols: number[][] = [];
  for (let i = 0; i < N; i++) {
    const d = 0.42 * pv;
    cols.push(rowJoints(R, H, R() < 0.3 ? 1 : 2, 0.4 * H, [[cols[i - 1], d], [i === N - 1 ? cols[0] : undefined, d]]));
  }
  const boards: Board[] = [];
  cols.forEach((js, i) => {
    js.forEach((j, k) => {
      const j1 = k + 1 < js.length ? js[k + 1] : js[0] + H;
      // darker boards go warmer (not greyer), lighter ones a touch paler
      const v = R(), hue = R() - 0.5, kk = 0.93 + 0.11 * v;
      const tone: RGB = [BASE[0] * Math.pow(kk, 0.75) + hue * 8, BASE[1] * kk + hue * 2, BASE[2] * Math.pow(kk, 1.35) - hue * 6];
      boards.push({ x0: i * PW, x1: (i + 1) * PW, y0: j, y1: j1, tone, hgt: 205 + (R() - 0.5) * 12, rough: 200 + (R() - 0.5) * 30, seed: 1000 + i * 17 + k * 131 + (o.seed ?? 11) });
    });
  });
  paintBoards(S, boards, {
    along: "y", pxPerM: [pu, pv], seam: [74, 42, 22], seamW: 3.0, endW: 1.8, wobble: 1.1,
    grainDark: [132, 84, 46], grainLight: [240, 208, 160], grainPerM: 7, grainW: 11, grainA: [0.04, 0.1], grainLightK: 0.15, grainSoft: 2,
    accents: 0.5, accentA: [0.18, 0.3], accentW: 2.6,
    knots: 0.1, knotCol: [118, 72, 40], checks: 0.25, wear: [240, 210, 164], wearA: 0.3, ao: 0.3, crossGrad: 0.05, blotch: 0.05,
  });
  // nails: a pair either side of every butt joint, optionally pairs on the beam lines too
  const nr = 0.0075, nc: RGB = [122, 80, 46];
  const dist = (p: number, q: number) => { const e = Math.abs(p - q) % H; return Math.min(e, H - e); };
  cols.forEach((js, i) => {
    const xc = (i + 0.5) * PW;
    for (const j of js) for (const sd of [-1, 1]) for (const t of [-0.27, 0.27]) nail(S, xc + t * PW, j + sd * 0.06 * pv, nr * pu, nr * pv, nc, 0.6);
    if (o.nailsOnBeams ?? false) for (let b = 0; b < 4; b++) {
      const y = ((b + 0.5) / 4) * H;
      if (js.some((j) => dist(y, j) < 0.16 * pv)) continue;
      for (const t of [-0.27, 0.27]) nail(S, xc + t * PW, y, nr * 0.9 * pu, nr * 0.9 * pv, nc, 0.55);
    }
  });
  // re-cut the groove floors (the bevel blur lifted them)
  S.h.fillStyle = grey(0, 0.8);
  for (let i = 0; i <= N; i++) S.h.fillRect(i * PW - 1.1, 0, 2.2, H);
  cols.forEach((js, i) => { for (const j of js) S.wrap(i * PW, j - 2, (i + 1) * PW, j + 2, (dx, dy) => S.h.fillRect(i * PW + dx, j - 0.8 + dy, PW, 1.6)); });
  blurGrey(S.cr, 1);
  return S.done(new THREE.Vector2(1 / TU, 1 / TV), 1.6);
}

// ---------------- bulwark ----------------
/** red-painted horizontal planks of the bulwark's inner face: per-plank gradient (light top, dark bottom), dark seam
 *  under a light bevel, faint grain through the paint, a few paint chips at the edges. Metric UVs (u along the ship,
 *  v = up); tile 4 m x 1 m = 6 rows of 0.167 m, so rows sit at fixed heights from the deck (y = 0) to the rail (y = 1).
 *  Butt joints are random per row (0-2 per 4 m, mean 0.85, >= 1.6 m apart, >= 1 m clear of the row below, 0.45 m of the one under that), so the joints do not
 *  march in a regular staircase. */
export function bulwarkPlanks(o: { seed?: number; color?: RGB; rows?: number; grain?: number } = {}): WoodTex {
  const gk = o.grain ?? 1; // grain/accent contrast multiplier
  const W = 2048, H = 1024, TU = 4, TV = 1, NR = o.rows ?? 6, pu = W / TU, pv = H / TV, RH = H / NR;
  const R = rng(o.seed ?? 23), S = new Sheet(W, H), BASE = o.color ?? [242, 110, 80];
  const boards: Board[] = [], rows: number[][] = [];
  for (let i = 0; i < NR; i++) {
    const q = R(), nj = q < 0.3 ? 0 : q < 0.85 ? 1 : 2;
    const js = nj ? rowJoints(R, W, nj, 1.6 * pu, [[rows[i - 1], 1.0 * pu], [rows[i - 2], 0.45 * pu]]) : [];
    rows.push(js);
    if (!nj) { const v = 0.95 + 0.08 * R(); boards.push({ x0: 0, x1: W, y0: H - (i + 1) * RH, y1: H - i * RH, tone: [BASE[0] * v, BASE[1] * v * (0.97 + 0.06 * R()), BASE[2] * v], hgt: 200 + (R() - 0.5) * 10, rough: 165 + (R() - 0.5) * 20, seed: 500 + i * 31 + (o.seed ?? 23), seamless: true }); }
    js.forEach((j, k) => {
      const j1 = k + 1 < js.length ? js[k + 1] : js[0] + W, v = 0.95 + 0.08 * R();
      boards.push({ x0: j, x1: j1, y0: H - (i + 1) * RH, y1: H - i * RH, tone: [BASE[0] * v, BASE[1] * v * (0.97 + 0.06 * R()), BASE[2] * v], hgt: 200 + (R() - 0.5) * 10, rough: 165 + (R() - 0.5) * 20, seed: 500 + i * 31 + k * 7 + (o.seed ?? 23) });
    });
  }
  paintBoards(S, boards, {
    along: "x", pxPerM: [pu, pv], seam: [72, 20, 12], seamW: 3.5, endW: 1.4, wobble: 1.2,
    grainDark: [130, 40, 20], grainLight: [255, 170, 130], grainPerM: 5, grainW: 9, grainA: [0.03 * gk, 0.07 * gk], grainSoft: 1.5,
    accents: 0.25 * gk, accentA: [Math.min(0.4, 0.08 * gk), Math.min(0.5, 0.14 * gk)], accentW: 2.2,
    knots: 0, knotCol: [120, 40, 20], checks: 0.15, wear: [255, 170, 120], wearA: 0.45, ao: 0.5, crossGrad: 0.12, blotch: 0.035,
  });
  // paint chips: small lighter flecks where the paint wore through to the primer, darker ones to bare wood
  for (const b of boards) {
    const RR = rng(b.seed * 3 + 1), n = Math.floor(((b.x1 - b.x0) / pu) * 2.2);
    for (let k = 0; k < n; k++) {
      const x = b.x0 + RR() * (b.x1 - b.x0), top = RR() < 0.6, y = top ? b.y0 + 5 + RR() * 4 : b.y1 - 5 - RR() * 4;
      const w = 6 + 18 * RR(), hh = 2 + 3 * RR(), bare = RR() < 0.35;
      S.wrap(x - w, y - 8, x + w, y + 8, (dx, dy) => {
        S.a.fillStyle = bare ? "rgba(150,82,48,0.55)" : "rgba(255,186,140,0.5)";
        S.a.beginPath(); S.a.moveTo(x - w / 2 + dx, y + dy);
        for (let t = 0; t <= 6; t++) S.a.lineTo(x - w / 2 + (w * t) / 6 + dx, y + dy + (t % 2 ? hh : -hh * 0.4) * (top ? 1 : -1));
        S.a.closePath(); S.a.fill();
        S.h.fillStyle = grey(0, 0.15); S.h.fillRect(x - w / 2 + dx, y - hh + dy, w, hh * 2);
      });
    }
  }
  return S.done(new THREE.Vector2(1 / TU, 1 / TV), 1.4);
}

// ---------------- rail cap ----------------
/** pale tan cap-rail timber: continuous grain along u (no long seams, so any v window looks right), the odd scarf
 *  joint across it with two treenails. Metric UVs, tile 4 m x 1 m. */
export function railCap(o: { seed?: number; color?: RGB; grain?: number } = {}): WoodTex {
  const gk = o.grain ?? 1; // grain/accent contrast multiplier (close-ups want more)
  const W = 2048, H = 512, TU = 4, TV = 1, pu = W / TU, pv = H / TV;
  const R = rng(o.seed ?? 37), S = new Sheet(W, H), BASE = o.color ?? [240, 202, 148];
  const js = [0.1, 0.55].map((f) => (f + (R() - 0.5) * 0.1) * W);
  const boards: Board[] = js.map((j, n) => {
    const j1 = n + 1 < js.length ? js[n + 1] : js[0] + W, v = 0.96 + 0.06 * R();
    return { x0: j, x1: j1, y0: 0, y1: H, tone: mul(BASE, v), hgt: 205, rough: 175, seed: 900 + n * 11 + (o.seed ?? 37) };
  });
  paintBoards(S, boards, {
    along: "x", pxPerM: [pu, pv], seam: [72, 42, 24], seamW: 0, endW: 2.2, long: false,
    grainDark: [140, 92, 52], grainLight: [248, 220, 178], grainPerM: 5, grainW: 10, grainA: [0.04 * gk, 0.1 * gk],
    accents: 1.2, accentA: [Math.min(0.5, 0.14 * gk), Math.min(0.6, 0.24 * gk)], accentW: 2.4,
    knots: 0.15, knotCol: [124, 76, 42], checks: 0.3, wear: [240, 210, 168], wearA: 0.3, ao: 0.45, crossGrad: 0, blotch: 0.05,
  });
  for (const j of js) for (const sd of [-1, 1]) for (const v of [0.3, 0.7]) nail(S, j + sd * 0.05 * pu, v * H, 0.008 * pu, 0.008 * pv, [124, 80, 46], 0.5);
  return S.done(new THREE.Vector2(1 / TU, 1 / TV), 1.2);
}

// ---------------- gun carriage ----------------
/** bright vermilion-orange carriage timber: continuous grain along u with soft tonal drift and the odd knot, no seams
 *  (the parts are solid timbers; their edges come from geometry + ink + AO). Metric UVs, tile 1 m x 1 m. The default
 *  keeps enough green/blue that faces in shade hold their colour through the NEUTRAL toe instead of going rust. */
export function carriageWood(o: { seed?: number; color?: RGB } = {}): WoodTex {
  const W = 1024, H = 1024, TU = 1, TV = 1, pu = W / TU, pv = H / TV;
  const R = rng(o.seed ?? 41), S = new Sheet(W, H), BASE = o.color ?? [255, 148, 94];
  // four horizontal "timbers" with no gaps between them: only the tone and grain stream change
  const boards: Board[] = [0, 1, 2, 3].map((i) => ({ x0: 0, x1: W, y0: (i * H) / 4, y1: ((i + 1) * H) / 4, tone: mul(BASE, 0.97 + 0.05 * R()), hgt: 205, rough: 180, seed: 1300 + i * 19 + (o.seed ?? 41) }));
  paintBoards(S, boards, {
    along: "x", pxPerM: [pu, pv], seam: [90, 34, 14], seamW: 0, endW: 0, long: false, ends: false, wobble: 0,
    grainDark: [170, 74, 38], grainLight: [255, 190, 140], grainPerM: 8, grainW: 9, grainA: [0.06, 0.13], grainLightK: 0.2,
    accents: 1.1, accentA: [0.14, 0.24], accentW: 2.2,
    knots: 0.2, knotCol: [150, 60, 28], checks: 0.2, wear: [255, 170, 110], wearA: 0, ao: 0, crossGrad: 0, blotch: 0.04, bevelBlur: 0,
  });
  return S.done(new THREE.Vector2(1 / TU, 1 / TV), 1.0);
}
/** end grain for the truck wheels: concentric growth rings round the tile corners (metricUV maps a CylinderGeometry's
 *  caps to their local x/z in metres, centred on 0,0), a darker ring band at 0.085 m like the reference, and plain
 *  tread grain across the middle of the tile where metricUV puts the cylinder side (v 0.5 + height). Lighter tan-orange
 *  than the carriage. Tile 1 m x 1 m; repeat = repeatPerMetre. Assign with swapWheels(). */
export function wheelWood(o: { seed?: number; color?: RGB } = {}): WoodTex {
  const W = 1024, H = 1024, px = W, R = rng(o.seed ?? 43), S = new Sheet(W, H), base = o.color ?? [242, 172, 114];
  const { a, h, r } = S;
  // tread band (the cylinder side) and the background: plain warm wood with soft streaks along u
  a.fillStyle = css(mul(base, 0.97)); a.fillRect(0, 0, W, H);
  h.fillStyle = grey(205); h.fillRect(0, 0, W, H); r.fillStyle = grey(185); r.fillRect(0, 0, W, H);
  for (let k = 0; k < 60; k++) {
    const y = 0.42 * H + R() * 0.2 * H, x0 = R() * W, l = (0.2 + 0.4 * R()) * W, w = 4 + 6 * R(), pts: [number, number][] = [];
    for (let x = x0; x <= x0 + l; x += 16) pts.push([x, y + 2 * Math.sin(x * 0.01 + k)]);
    a.fillStyle = css([170, 84, 44], 0.05 + 0.05 * R()); S.wrap(x0, y - 10, x0 + l, y + 10, (dx, dy) => taper(a, pts.map(([p, q]) => [p + dx, q + dy] as [number, number]), w));
  }
  // end-grain discs at the four corners (one disc, wrapped)
  const ring = (rad: number, col: string, lw: number, wob: number, seed: number) => {
    const Rw = rng(seed), f = wobbler(Rw, 2.2);
    S.wrap(-rad - 10, -rad - 10, rad + 10, rad + 10, (dx, dy) => {
      a.strokeStyle = col; a.lineWidth = lw; a.beginPath();
      for (let i = 0; i <= 96; i++) { const t = (i / 96) * Math.PI * 2, rr = rad + wob * f(t * 3); const x = Math.cos(t) * rr + dx, y = Math.sin(t) * rr + dy; if (i) a.lineTo(x, y); else a.moveTo(x, y); }
      a.closePath(); a.stroke();
    });
  };
  S.wrap(-0.2 * px, -0.2 * px, 0.2 * px, 0.2 * px, (dx, dy) => {
    const gr = a.createRadialGradient(dx, dy, 0, dx, dy, 0.17 * px);
    gr.addColorStop(0, css(mix(base, [255, 225, 175], 0.25))); gr.addColorStop(0.55, css(base)); gr.addColorStop(0.85, css(mul(base, 0.93))); gr.addColorStop(1, css(mul(base, 0.82)));
    a.fillStyle = gr; a.beginPath(); a.arc(dx, dy, 0.17 * px, 0, Math.PI * 2); a.fill();
    h.fillStyle = grey(205); h.beginPath(); h.arc(dx, dy, 0.17 * px, 0, Math.PI * 2); h.fill();
  });
  for (let k = 0; k < 9; k++) ring((0.018 + 0.0145 * k + 0.003 * R()) * px, css([150, 72, 36], 0.12 + 0.06 * R()), 1.6, 1.5, 4300 + k);
  ring(0.085 * px, css([112, 52, 26], 0.75), 4, 0.6, 4400);  // the drawn ring band
  ring(0.091 * px, css([255, 214, 160], 0.35), 2, 0.6, 4401); // its light lip
  // a couple of radial checks
  for (let k = 0; k < 3; k++) {
    const t = R() * Math.PI * 2, r0 = (0.03 + 0.04 * R()) * px, r1 = r0 + (0.03 + 0.03 * R()) * px;
    S.wrap(-0.2 * px, -0.2 * px, 0.2 * px, 0.2 * px, (dx, dy) => {
      a.fillStyle = css([110, 50, 24], 0.45); taper(a, [[Math.cos(t) * r0 + dx, Math.sin(t) * r0 + dy], [Math.cos(t) * r1 + dx, Math.sin(t) * r1 + dy]], 2.4);
      h.fillStyle = grey(0, 0.4); taper(h, [[Math.cos(t) * r0 + dx, Math.sin(t) * r0 + dy], [Math.cos(t) * r1 + dx, Math.sin(t) * r1 + dy]], 3);
    });
  }
  // the ring band is a shallow groove
  S.wrap(-0.1 * px, -0.1 * px, 0.1 * px, 0.1 * px, (dx, dy) => { h.strokeStyle = grey(120); h.lineWidth = 5; h.beginPath(); h.arc(dx, dy, 0.085 * px, 0, Math.PI * 2); h.stroke(); });
  blurGrey(S.ch, 1.2);
  return S.done(new THREE.Vector2(1, 1), 1.0);
}

// ---------------- coopered staves (bucket, barrel) ----------------
/** iron hoop band painted across the sheet at canvas y (centre), height hh px: dark iron, light top lip, contact shadow */
const hoop = (S: Sheet, y: number, hh: number, shadow = 0.3) => {
  const { a, h, r, W } = S;
  const sh = a.createLinearGradient(0, y + hh / 2, 0, y + hh / 2 + hh * 0.8); sh.addColorStop(0, `rgba(60,30,12,${shadow})`); sh.addColorStop(1, "rgba(60,30,12,0)");
  a.fillStyle = sh; a.fillRect(0, y + hh / 2, W, hh * 0.8);
  const gr = a.createLinearGradient(0, y - hh / 2, 0, y + hh / 2);
  gr.addColorStop(0, "#9aa0a8"); gr.addColorStop(0.18, "#767b84"); gr.addColorStop(0.55, "#555961"); gr.addColorStop(1, "#383a40");
  a.fillStyle = gr; a.fillRect(0, y - hh / 2, W, hh);
  const hg = h.createLinearGradient(0, y - hh / 2 - 2, 0, y + hh / 2 + 2);
  hg.addColorStop(0, grey(205, 1)); hg.addColorStop(0.2, grey(250, 1)); hg.addColorStop(0.8, grey(250, 1)); hg.addColorStop(1, grey(205, 1));
  h.fillStyle = hg; h.fillRect(0, y - hh / 2 - 2, W, hh + 4);
  r.fillStyle = grey(110); r.fillRect(0, y - hh / 2, W, hh);
  for (let x = W / 10; x < W; x += W / 5) { a.fillStyle = "rgba(170,176,186,0.8)"; a.beginPath(); a.arc(x, y, hh * 0.16, 0, Math.PI * 2); a.fill(); }
};
/** staves around a lathe: n staves over the full width (u around), the cy range [y0, y1] of the canvas */
const staveBoards = (W: number, n: number, y0: number, y1: number, base: RGB, R: () => number, seed: number, k = 1, vary = 0.1): Board[] =>
  Array.from({ length: n }, (_, i) => {
    const v = (1 - vary * 0.6 + vary * R()) * k;
    return { x0: (i * W) / n, x1: ((i + 1) * W) / n, y0, y1, tone: [base[0] * Math.pow(v, 0.8), base[1] * v, base[2] * Math.pow(v, 1.3)] as RGB, hgt: 205 + (R() - 0.5) * 10, rough: 190 + (R() - 0.5) * 20, seed: seed + i * 7 };
  });
const staveStyle = (pu: number, pv: number, seam: RGB, dark: RGB, o: Partial<BoardStyle> = {}): BoardStyle => ({
  along: "y", pxPerM: [pu, pv], seam, seamW: 2.0, endW: 0, ends: false, wobble: 0.8,
  grainDark: dark, grainLight: [244, 212, 168], grainPerM: 6, grainW: 8, grainA: [0.04, 0.09],
  accents: 1.6, accentA: [0.1, 0.18], accentW: 2.0,
  knots: 0, knotCol: dark, checks: 0.15, wear: [244, 214, 170], wearA: 0.22, ao: 0.25, crossGrad: 0.05, blotch: 0.04, ...o,
});
/** bucket staves fitted to props.ts bucket(): its lathes map u around and v by profile point, so the outer wall
 *  (y 0.01-0.32) is v 0.5-0.75, the top lip v 0.75-1, and the inner wall runs v 0 (rim) to 0.5. Two iron hoops are
 *  painted under the geometry hoops (y 0.06, 0.26). A light tan pail like the reference: few staves with thin light
 *  seams (plain: true drops the staves for a smooth pail with only a vertical gradient and the rim band). repeat (1, 1).
 *  NOTE props.ts leaves the rim open between r 0.17 (inner lathe) and 0.19 (outer lathe): it needs a bridging ring
 *  before the bucket can look solid. */
export function bucketStaves(o: { seed?: number; color?: RGB; staves?: number; hoops?: boolean; plain?: boolean } = {}): WoodTex {
  const W = 1024, H = 1024, plain = o.plain ?? false, n = plain ? 1 : o.staves ?? 10, base = o.color ?? [244, 198, 140], R = rng(o.seed ?? 53), S = new Sheet(W, H);
  const pu = W / (2 * Math.PI * 0.17), pv = 256 / 0.31, cy = (v: number) => (1 - v) * H, vy = (y: number) => 0.5 + (0.25 * (y - 0.01)) / 0.31;
  const outer = staveBoards(W, n, cy(0.75), cy(0.5), base, R, 3000, 1, 0.07);
  const inner = staveBoards(W, n, cy(0.5), cy(0), base, R, 3100, 0.9, 0.07);
  const lip = staveBoards(W, n, 0, cy(0.75), mix(base, [248, 214, 166], 0.4), R, 3200, 1, 0.04);
  paintBoards(S, [...outer, ...inner, ...lip], staveStyle(pu, pv, [124, 82, 50], [150, 98, 56], plain
    ? { long: false, wobble: 0, accents: 0.6, wearA: 0, ao: 0, crossGrad: 0, checks: 0 }
    : { seamW: 1.5, ao: 0.18, wearA: 0.18 }));
  // inside gets a little darker toward the bottom (mostly under water); the cut rim at the top of the inner wall is pale end grain
  const ig = S.a.createLinearGradient(0, cy(0), 0, cy(0.5)); ig.addColorStop(0, "rgba(60,30,12,0)"); ig.addColorStop(1, "rgba(60,30,12,0.25)");
  S.a.fillStyle = ig; S.a.fillRect(0, cy(0.5), W, cy(0) - cy(0.5));
  S.a.fillStyle = css(mix(base, [252, 222, 176], 0.5), 0.9); S.a.fillRect(0, H - 14, W, 14);
  // outer wall: a gentle vertical gradient, lighter toward the rim (the reference's soft pail shading), and a light rim band
  const vg = S.a.createLinearGradient(0, cy(0.75), 0, cy(0.5)); vg.addColorStop(0, "rgba(255,236,200,0.12)"); vg.addColorStop(1, "rgba(255,236,200,0)");
  S.a.fillStyle = vg; S.a.fillRect(0, cy(0.75), W, cy(0.5) - cy(0.75));
  S.a.fillStyle = css(mix(base, [252, 222, 176], 0.45), 0.85); S.a.fillRect(0, cy(0.75), W, 0.012 * pv);
  if (o.hoops ?? true) for (const y of [0.06, 0.26]) hoop(S, cy(vy(y)), 0.022 * pv, 0.22);
  return S.done(new THREE.Vector2(1, 1), plain ? 0.8 : 1.1);
}
/** barrel staves fitted to props.ts barrel(): 15 profile points, so the side is v 1/14-13/14 (linear in height), the
 *  lids the end bands; four iron hoops at 0.1/0.3/0.7/0.9 of the height, a recessed lid with its chime ring.
 *  repeat (1, 1). */
export function barrelStaves(o: { seed?: number; color?: RGB; staves?: number; hoops?: boolean } = {}): WoodTex {
  const W = 1024, H = 1024, n = o.staves ?? 16, base = o.color ?? [218, 160, 106], R = rng(o.seed ?? 61), S = new Sheet(W, H);
  const v0 = 1 / 14, v1 = 13 / 14, cy = (v: number) => (1 - v) * H, pu = W / (2 * Math.PI * 0.28), pv = (cy(v0) - cy(v1)) / 0.85;
  const side = staveBoards(W, n, cy(v1), cy(v0), base, R, 4000, 1, 0.09);
  paintBoards(S, side, staveStyle(pu, pv, [92, 56, 30], [130, 80, 42], { seamW: 1.8, ao: 0.25 }));
  // bilge: the belly catches a little more light, the ends a little less
  const bg = S.a.createLinearGradient(0, cy(v1), 0, cy(v0));
  bg.addColorStop(0, "rgba(60,30,12,0.16)"); bg.addColorStop(0.5, "rgba(255,235,200,0.07)"); bg.addColorStop(1, "rgba(60,30,12,0.16)");
  S.a.fillStyle = bg; S.a.fillRect(0, cy(v1), W, cy(v0) - cy(v1));
  // lids (rings in this mapping): chime = stave end grain, then the recessed head
  for (const [e0, e1] of [[cy(v1), 0], [cy(v0), H]] as const) {
    const dir = Math.sign(e1 - e0), L = Math.abs(e1 - e0);
    const yA = e0, yB = e0 + dir * L * 0.25;
    S.a.fillStyle = css(mix(base, [245, 205, 150], 0.3)); S.a.fillRect(0, Math.min(yA, yB), W, Math.abs(yB - yA));
    S.a.fillStyle = css(mul(base, 0.6)); S.a.fillRect(0, yB - (dir < 0 ? 3 : 0), W, 3);
    S.a.fillStyle = css(mul(base, 0.9)); S.a.fillRect(0, Math.min(yB, e1), W, Math.abs(e1 - yB));
    S.a.strokeStyle = css(mul(base, 0.72), 0.45); S.a.lineWidth = 2; const yr = e0 + dir * L * 0.6; S.a.beginPath(); S.a.moveTo(0, yr); S.a.lineTo(W, yr); S.a.stroke();
    S.h.fillStyle = grey(230); S.h.fillRect(0, Math.min(yA, yB), W, Math.abs(yB - yA)); S.h.fillStyle = grey(150); S.h.fillRect(0, Math.min(yB, e1), W, Math.abs(e1 - yB));
    S.r.fillStyle = grey(200); S.r.fillRect(0, Math.min(e0, e1), W, L);
  }
  if (o.hoops ?? true) for (const f of [0.1, 0.3, 0.7, 0.9]) hoop(S, cy(v0 + f * (v1 - v0)), 0.028 * pv);
  return S.done(new THREE.Vector2(1, 1), 1.1);
}

// ---------------- rope ----------------
/** three-strand laid rope for tube UVs (u along, v around), drawn like the reference: a smooth tan tube whose strands
 *  read as a soft scalloped light band with gentle grooves (no deep black lay, no fibre noise). One tile = one full
 *  lay (default 0.2 m of rope), v wraps once round. With tubeUV(): repeat = repeatPerMetre. */
export function rope(o: { color?: RGB; lay?: number } = {}): WoodTex {
  const W = 512, H = 256, S = new Sheet(W, H), base = o.color ?? [216, 176, 120], dark: RGB = [128, 92, 56];
  const ia = S.a.createImageData(W, H), ih = S.h.createImageData(W, H), ir = S.r.createImageData(W, H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const u = (x + 0.5) / W, v = (y + 0.5) / H, q = 3 * (v - u), f = q - Math.floor(q), idx = ((Math.floor(q) % 3) + 3) % 3;
    const prof = Math.pow(Math.sin(Math.PI * f), 0.45);                   // strand cross-section
    const fib = 0.5 + 0.5 * Math.sin(2 * Math.PI * (27 * v - 33 * u));     // faint fibres, a steeper twist than the strand
    const crest = Math.exp(-Math.pow((f - 0.45) / 0.2, 2));                 // soft scalloped light band
    const tone = [0.98, 1.02, 1.0][idx] * (0.985 + 0.015 * fib);
    let c = mix(mix(base, dark, 0.4), mul(base, tone), prof);              // grooves only ~40 % toward dark
    c = mix(c, [248, 226, 186], 0.3 * crest);
    const i4 = (y * W + x) * 4;
    ia.data[i4] = clamp(c[0]); ia.data[i4 + 1] = clamp(c[1]); ia.data[i4 + 2] = clamp(c[2]); ia.data[i4 + 3] = 255;
    const hv = clamp(255 * (0.25 + 0.7 * prof));
    ih.data[i4] = ih.data[i4 + 1] = ih.data[i4 + 2] = hv; ih.data[i4 + 3] = 255;
    const rv = clamp(255 * (0.92 - 0.06 * prof));
    ir.data[i4] = ir.data[i4 + 1] = ir.data[i4 + 2] = rv; ir.data[i4 + 3] = 255;
  }
  S.a.putImageData(ia, 0, 0); S.h.putImageData(ih, 0, 0); S.r.putImageData(ir, 0, 0);
  return S.done(new THREE.Vector2(1 / (o.lay ?? 0.2), 1), 0.6);
}

// ---------------- poles ----------------
/** light ash-coloured staff wood for CylinderGeometry side UVs (u around, v along): a few soft streaks, a crisp grain
 *  line or two, the odd knot. Tile = once round x 1 m; repeat = (1, length * repeatPerMetre.y); for a mast (6, length). */
export function poleWood(o: { seed?: number; color?: RGB } = {}): WoodTex {
  const W = 256, H = 1024, R = rng(o.seed ?? 71), S = new Sheet(W, H), base = o.color ?? [210, 162, 106];
  const boards: Board[] = [{ x0: 0, x1: W, y0: 0, y1: H, tone: mul(base, 0.97 + 0.04 * R()), hgt: 205, rough: 170, seed: 5000 + (o.seed ?? 71) }];
  paintBoards(S, boards, {
    along: "y", pxPerM: [W / 0.15, H], seam: [80, 50, 28], seamW: 0, endW: 0, long: false, ends: false, bevelBlur: 0, wobble: 0,
    grainDark: [128, 82, 44], grainLight: [245, 214, 170], grainPerM: 5, grainW: 8, grainA: [0.06, 0.14], grainSoft: 1,
    accents: 1.5, accentA: [0.14, 0.24], accentW: 2.5,
    knots: 0.35, knotCol: [116, 70, 36], checks: 0.2, wear: [240, 210, 168], wearA: 0, ao: 0, crossGrad: 0, blotch: 0.06,
  });
  return S.done(new THREE.Vector2(1, 1), 1.0);
}

// ---------------- UV helpers ----------------
/** Rewrite UVs in metres so one repeatPerMetre fits every part: planar faces project onto their dominant axis with u
 *  along the part's longest dimension (the grain) and v = up where possible. CylinderGeometry: the side becomes
 *  (u x circumference, 0.5 + v x height) and the caps their local (x, z) in metres, centred on 0,0 (wheelWood() puts
 *  end-grain rings there and tread grain at v 0.5). Geometry shared by several meshes is converted once.
 *  Lathe/torus/sphere/capsule/tube geometry keeps its own UVs. Also writes the edgeD attribute used by edgeWear(). */
export function metricUV(root: THREE.Object3D, filter: (m: THREE.Mesh) => boolean = () => true) {
  const seen = new Set<THREE.BufferGeometry>();
  root.traverse((ob) => {
    const m = ob as THREE.Mesh;
    if (!m.isMesh || seen.has(m.geometry) || !filter(m)) return;
    seen.add(m.geometry); metricGeo(m.geometry);
  });
}
export function metricGeo(g: THREE.BufferGeometry) {
  if (g.userData.woodMetric) return; // already converted
  g.userData.woodMetric = true;
  const type = (g as { type?: string }).type ?? "", par = ((g as { parameters?: Record<string, number> }).parameters ?? {}) as Record<string, number>;
  if (/Lathe|Torus|Sphere|Capsule|Tube/.test(type)) { // keep their UVs; neutral edgeD so an edge-worn material stays safe
    g.setAttribute("edgeD", new THREE.BufferAttribute(new Float32Array(g.attributes.position.count * 4).fill(9), 4)); return;
  }
  if (!g.attributes.normal) g.computeVertexNormals();
  const pos = g.attributes.position, nor = g.attributes.normal, old = g.attributes.uv, uv = new Float32Array(pos.count * 2);
  // edgeD: distances (m) from each vertex to its face's four edges, linear across a planar face
  const ed = new Float32Array(pos.count * 4).fill(9);
  if (type === "CylinderGeometry" && old) {
    const C = Math.PI * (par.radiusTop + par.radiusBottom), Hh = par.height, nSide = (par.radialSegments + 1) * (par.heightSegments + 1);
    const rr = Math.max(par.radiusTop, par.radiusBottom);
    for (let i = 0; i < pos.count; i++) {
      if (i < nSide) { uv[2 * i] = old.getX(i) * C; uv[2 * i + 1] = 0.5 + old.getY(i) * Hh; ed[4 * i] = old.getY(i) * Hh; ed[4 * i + 1] = (1 - old.getY(i)) * Hh; }
      else { uv[2 * i] = pos.getX(i); uv[2 * i + 1] = pos.getZ(i); ed[4 * i] = rr - Math.hypot(pos.getX(i), pos.getZ(i)); }
    }
  } else {
    g.computeBoundingBox(); const bb = g.boundingBox!, size = [bb.max.x - bb.min.x, bb.max.y - bb.min.y, bb.max.z - bb.min.z];
    const gi = size[0] >= size[1] && size[0] >= size[2] ? 0 : size[2] >= size[1] ? 2 : 1;
    const p = [0, 0, 0], planes = new Map<string, { u0: number; u1: number; v0: number; v1: number; ids: number[] }>();
    for (let i = 0; i < pos.count; i++) {
      const n = [Math.abs(nor.getX(i)), Math.abs(nor.getY(i)), Math.abs(nor.getZ(i))];
      const k = n[0] >= n[1] && n[0] >= n[2] ? 0 : n[1] >= n[2] ? 1 : 2;
      let ua: number;
      if (k !== gi) ua = gi; else { const o1 = (k + 1) % 3, o2 = (k + 2) % 3; ua = size[o1] >= size[o2] ? o1 : o2; }
      const va = 3 - k - ua;
      p[0] = pos.getX(i); p[1] = pos.getY(i); p[2] = pos.getZ(i);
      uv[2 * i] = p[ua]; uv[2 * i + 1] = p[va];
      const key = `${k}${Math.sign([nor.getX(i), nor.getY(i), nor.getZ(i)][k])}${Math.round(p[k] * 1000)}`;
      let pl = planes.get(key); if (!pl) { pl = { u0: 1e9, u1: -1e9, v0: 1e9, v1: -1e9, ids: [] }; planes.set(key, pl); }
      pl.u0 = Math.min(pl.u0, p[ua]); pl.u1 = Math.max(pl.u1, p[ua]); pl.v0 = Math.min(pl.v0, p[va]); pl.v1 = Math.max(pl.v1, p[va]); pl.ids.push(i);
    }
    for (const pl of planes.values()) for (const i of pl.ids) {
      const u = uv[2 * i], v = uv[2 * i + 1];
      ed[4 * i] = u - pl.u0; ed[4 * i + 1] = pl.u1 - u; ed[4 * i + 2] = v - pl.v0; ed[4 * i + 3] = pl.v1 - v;
    }
  }
  g.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  g.setAttribute("edgeD", new THREE.BufferAttribute(ed, 4));
}
/** rewrite a TubeGeometry's u (or that of several tubes merged into one geometry, e.g. props.ts ropeCoil) to metres of
 *  arc length, restarting at 0 for each tube (detected where u drops), so one repeat (rope().repeatPerMetre) gives the
 *  same lay on every tube. Cheap enough to call on a rebuilt ropeSpan each frame (17 rings). */
export function tubeUV(g: THREE.BufferGeometry) {
  const uv = g.attributes.uv, pos = g.attributes.position, n = uv.count, out = new Float32Array(n * 2);
  let ring = 1; while (ring < n && uv.getX(ring) === uv.getX(0)) ring++;
  const c = new THREE.Vector3(), pc = new THREE.Vector3(); let acc = 0, pu = Infinity;
  for (let i0 = 0; i0 + ring <= n; i0 += ring) {
    c.set(0, 0, 0); for (let j = 0; j < ring - 1; j++) c.x += pos.getX(i0 + j), c.y += pos.getY(i0 + j), c.z += pos.getZ(i0 + j);
    c.divideScalar(Math.max(1, ring - 1));
    const u = uv.getX(i0);
    acc = u > pu ? acc + c.distanceTo(pc) : 0;
    for (let j = 0; j < ring; j++) { out[2 * (i0 + j)] = acc; out[2 * (i0 + j) + 1] = uv.getY(i0 + j); }
    pc.copy(c); pu = u;
  }
  g.setAttribute("uv", new THREE.BufferAttribute(out, 2));
}
/** give the truck wheels their end-grain material: every CylinderGeometry mesh under root that uses `from` gets `to`
 *  (e.g. swapWheels(cannon.carriage, woodCar, wheelM)). Run metricUV on them too (before or after). */
export function swapWheels(root: THREE.Object3D, from: THREE.Material, to: THREE.Material) {
  root.traverse((ob) => {
    const m = ob as THREE.Mesh;
    if (m.isMesh && m.material === from && (m.geometry as { type?: string }).type === "CylinderGeometry") m.material = to;
  });
}

// ---------------- material helpers ----------------
/** the maps with their own repeat (clones share the canvas and the GPU upload; bump and rough stay one texture) */
export function withRepeat(t: WoodTex, ru: number, rv: number): WoodTex {
  const c = (x: THREE.CanvasTexture) => { const k = x.clone(); k.repeat.set(ru, rv); k.needsUpdate = true; return k; };
  const bump = c(t.bump);
  return { ...t, map: c(t.map), bump, rough: t.rough === t.bump ? bump : c(t.rough) };
}
/** the maps as material parameters for pbr.ts mats().wood / .paint (or any MeshStandard/Physical material):
 *  M.wood(W.woodMaps(W.carriageWood())). repeat defaults to repeatPerMetre (metric UVs). */
export function woodMaps(t: WoodTex, repeat?: [number, number]) {
  const r = repeat ?? [t.repeatPerMetre.x, t.repeatPerMetre.y], k = withRepeat(t, r[0], r[1]);
  return { map: k.map as THREE.Texture, bumpMap: k.bump as THREE.Texture, bumpScale: t.bumpScale, roughnessMap: k.rough as THREE.Texture, roughness: 1 };
}
/** MeshStandardMaterial fallback (scenes without pbr.ts). envMap is required: the albedos assume diffuse environment
 *  fill (pbr.ts makeEnv(renderer, ENV_FILL) or a RoomEnvironment PMREM); pass null only if the scene sets
 *  scene.environment itself. */
export function woodMat(t: WoodTex, o: { envMap: THREE.Texture | null; repeat?: [number, number]; bumpScale?: number; roughness?: number; color?: THREE.ColorRepresentation; envMapIntensity?: number; side?: THREE.Side; wear?: EdgeOpts }) {
  const k = woodMaps(t, o.repeat);
  const m = new THREE.MeshStandardMaterial({
    ...k, bumpScale: o.bumpScale ?? t.bumpScale, roughness: o.roughness ?? 1,
    metalness: 0, color: o.color ?? 0xffffff, envMap: o.envMap, envMapIntensity: o.envMapIntensity ?? 1, side: o.side ?? THREE.FrontSide,
  });
  if (o.wear) edgeWear(m, o.wear);
  return m;
}
export type EdgeOpts = { k?: number; w?: number };
/** worn-edge highlight for solid timbers: albedo x (1 + k) at a face edge, easing out over w metres (game assets
 *  lighten worn convex edges; concave corners are left to N8AO / pbr.ts GROUND_AO). Chains any onBeforeCompile already
 *  on the material (pbr.ts GROUND_AO survives) and extends its program cache key. Reads the edgeD attribute from
 *  metricUV(): a mesh that missed metricUV gets the default attribute (0,0,0,1), i.e. the whole face lightened by k. */
export function edgeWear<M extends THREE.Material>(m: M, o: EdgeOpts = {}): M {
  const K = (o.k ?? 0.08).toFixed(3), Wd = (o.w ?? 0.01).toFixed(4);
  const prev = m.onBeforeCompile, prevKey = m.customProgramCacheKey.call(m);
  m.onBeforeCompile = function (this: M, sh, r) {
    prev.call(this, sh, r);
    sh.vertexShader = sh.vertexShader.replace("#include <common>", "#include <common>\nattribute vec4 edgeD;\nvarying vec4 vEdgeD;")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\nvEdgeD = edgeD;");
    sh.fragmentShader = sh.fragmentShader.replace("#include <common>", "#include <common>\nvarying vec4 vEdgeD;")
      .replace("#include <map_fragment>", `#include <map_fragment>
        { float eD = min( min( vEdgeD.x, vEdgeD.y ), min( vEdgeD.z, vEdgeD.w ) );
          diffuseColor.rgb *= 1.0 + ${K} * ( 1.0 - smoothstep( 0.0, ${Wd}, eD ) ); }`);
  };
  m.customProgramCacheKey = () => `${prevKey}|woodWear_${K}_${Wd}`;
  m.needsUpdate = true;
  return m;
}
