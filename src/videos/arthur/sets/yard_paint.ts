// Canvas painters of the Arthur set (sets/yard.ts): small hand-painted textures, all seeded (no Math.random), all
// low-contrast on purpose (the ink pass draws the lines; the paint only says "stone", "tile", "turf").
import * as THREE from "three";

export type RGB = [number, number, number];
type G = CanvasRenderingContext2D;

/** mulberry32 (group/story.ts rng) */
export const rng = (seed: number) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0; let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};
const clamp = (x: number) => Math.max(0, Math.min(255, x));
export const css = (c: RGB, a = 1) => `rgba(${clamp(c[0]) | 0},${clamp(c[1]) | 0},${clamp(c[2]) | 0},${a.toFixed(3)})`;
export const hex = (h: string): RGB => { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
const mul = (c: RGB, k: number): RGB => [c[0] * k, c[1] * k, c[2] * k];
const mix = (a: RGB, b: RGB, k: number): RGB => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
const canvas = (w: number, h: number) => { const c = document.createElement("canvas"); c.width = w; c.height = h; return c; };
const tex = (c: HTMLCanvasElement, wrap = true, srgb = true) => {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  t.wrapS = t.wrapT = wrap ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping;
  t.generateMipmaps = true; t.minFilter = THREE.LinearMipmapLinearFilter; t.magFilter = THREE.LinearFilter;
  t.anisotropy = 8; t.needsUpdate = true;
  return t;
};
const blotch = (g: G, x: number, y: number, rad: number, col: RGB, a: number) => {
  const gr = g.createRadialGradient(x, y, 0, x, y, rad);
  gr.addColorStop(0, css(col, a)); gr.addColorStop(0.6, css(col, a * 0.6)); gr.addColorStop(1, css(col, 0));
  g.fillStyle = gr; g.beginPath(); g.arc(x, y, rad, 0, Math.PI * 2); g.fill();
};
/** runs fn at the 9 wrapped offsets (tileable painting) */
const wrap9 = (S: number, fn: (dx: number, dy: number) => void) => { for (const dx of [-S, 0, S]) for (const dy of [-S, 0, S]) fn(dx, dy); };

/** soft blotches on a flat base: plaster, snow, cloth */
export function mottleTex(seed: number, base: RGB, lo: RGB, n = 36, a = 0.3, size = 256) {
  const c = canvas(size, size), g = c.getContext("2d")!, r = rng(seed);
  g.fillStyle = css(base); g.fillRect(0, 0, size, size);
  for (let i = 0; i < n; i++) {
    const x = r() * size, y = r() * size, rad = size * (0.07 + 0.13 * r());
    wrap9(size, (dx, dy) => blotch(g, x + dx, y + dy, rad, lo, a));
  }
  return tex(c);
}

/** coursed ashlar: `courses` rows of broad blocks on a square tile; low contrast, soft joints */
export function ashlarTex(seed: number, base: RGB, mortar: RGB, courses = 8, size = 1024) {
  const c = canvas(size, size), g = c.getContext("2d")!, r = rng(seed), ch = size / courses, J = Math.max(2, size / 400);
  g.fillStyle = css(mortar); g.fillRect(0, 0, size, size);
  for (let j = 0; j < courses; j++) {
    const n = 4 + (j % 2), ws: number[] = []; let sum = 0;
    for (let i = 0; i < n; i++) { const w = 0.75 + 0.5 * r(); ws.push(w); sum += w; }
    let x = r() * size * 0.25;
    for (let i = 0; i < n; i++) {
      const w = (ws[i] / sum) * size, k = 0.95 + 0.1 * r(), warm = (r() - 0.5) * 8;
      const col: RGB = [base[0] * k + warm, base[1] * k, base[2] * k - warm];
      for (const dx of [0, -size]) {
        const x0 = x + dx + J, y0 = j * ch + J, bw = w - 2 * J, bh = ch - 2 * J;
        g.fillStyle = css(col); g.fillRect(x0, y0, bw, bh);
        g.fillStyle = "rgba(255,255,255,0.10)"; g.fillRect(x0, y0, bw, J); g.fillRect(x0, y0, J, bh);
        g.fillStyle = "rgba(40,36,50,0.07)"; g.fillRect(x0, y0 + bh - J, bw, J); g.fillRect(x0 + bw - J, y0, J, bh);
      }
      x += w;
    }
  }
  for (let i = 0; i < 26; i++) {
    const x = r() * size, y = r() * size, rad = size * (0.05 + 0.1 * r()), dark = r() < 0.5;
    wrap9(size, (dx, dy) => blotch(g, x + dx, y + dy, rad, dark ? mul(base, 0.8) : [255, 255, 255], 0.1));
  }
  return tex(c);
}

/** the paved circle: concentric rings of flags on a square canvas; the disc's diameter spans the middle 86 % of the
 *  canvas (so the rim drifts are not cut by the canvas edge). snow = joints and rim drifted in */
export function flagTex(seed: number, base: RGB, joint: RGB, snow: boolean, size = 1024) {
  const c = canvas(size, size), g = c.getContext("2d")!, r = rng(seed), C = size / 2, R = (size / 2) * 0.86;
  g.fillStyle = css(joint); g.fillRect(0, 0, size, size);
  const rings = [0, 0.2, 0.42, 0.63, 0.83, 1.02], J = size / 260;
  for (let k = 0; k < rings.length - 1; k++) {
    const r0 = rings[k] * R, r1 = rings[k + 1] * R, rm = (r0 + r1) / 2;
    const n = k === 0 ? 1 : Math.max(5, Math.round((2 * Math.PI * rm) / (R * 0.27))), a00 = r() * 6.28;
    for (let i = 0; i < n; i++) {
      const a0 = a00 + (i / n) * Math.PI * 2, a1 = a00 + ((i + 1) / n) * Math.PI * 2, kk = 0.94 + 0.12 * r(), warm = (r() - 0.5) * 10;
      g.fillStyle = css([base[0] * kk + warm, base[1] * kk, base[2] * kk - warm]);
      g.beginPath();
      if (k === 0) g.arc(C, C, r1 - J, 0, Math.PI * 2);
      else { g.arc(C, C, r1 - J, a0 + J / r1, a1 - J / r1); g.arc(C, C, r0 + J, a1 - J / Math.max(r0, 1), a0 + J / Math.max(r0, 1), true); }
      g.closePath(); g.fill();
    }
  }
  for (let i = 0; i < 20; i++) blotch(g, r() * size, r() * size, size * (0.05 + 0.08 * r()), r() < 0.5 ? mul(base, 0.78) : [255, 255, 255], 0.1);
  if (snow) {
    for (let i = 0; i < 46; i++) {
      const a = r() * 6.28, rr = R * (0.8 + 0.22 * r());
      blotch(g, C + Math.cos(a) * rr, C + Math.sin(a) * rr, size * (0.035 + 0.05 * r()), [244, 248, 255], 0.95);
    }
    for (let i = 0; i < 14; i++) { const a = r() * 6.28, rr = R * (0.3 + 0.45 * r()); blotch(g, C + Math.cos(a) * rr, C + Math.sin(a) * rr, size * (0.02 + 0.03 * r()), [244, 248, 255], 0.7); }
  }
  return tex(c, false);
}

/** vertical boards (a light neutral, tinted by the material colour): doors, shutters. boards across the tile */
export function boardTex(seed: number, boards = 4, base: RGB = [236, 226, 212], size = 256) {
  const c = canvas(size, size), g = c.getContext("2d")!, r = rng(seed), bw = size / boards;
  for (let i = 0; i < boards; i++) {
    g.fillStyle = css(mul(base, 0.93 + 0.1 * r())); g.fillRect(i * bw, 0, bw, size);
    g.strokeStyle = css(mul(base, 0.8), 0.35); g.lineWidth = Math.max(1, size / 200);
    for (let k = 0; k < 3; k++) {
      const x = i * bw + bw * (0.2 + 0.6 * r()); g.beginPath(); g.moveTo(x, 0);
      g.bezierCurveTo(x + bw * 0.12 * (r() - 0.5), size * 0.33, x + bw * 0.12 * (r() - 0.5), size * 0.66, x, size); g.stroke();
    }
    g.fillStyle = css(mul(base, 0.5), 0.9); g.fillRect(i * bw - size / 170, 0, size / 85, size);
  }
  g.fillStyle = css(mul(base, 0.5), 0.9); g.fillRect(size - size / 170, 0, size / 170, size);
  return tex(c);
}

/** the church doors: two leaves of oak boards under a round arch (uv 0..1 over 3.0 x 4.2 m), iron strap hinges, studs
 *  and two ring handles, all painted */
export function churchDoorTex(seed: number, wood: RGB, iron: RGB) {
  const W = 512, H = 716, c = canvas(W, H), g = c.getContext("2d")!, r = rng(seed), px = W / 3.0; // px per metre
  const boards = 10, bw = W / boards;
  for (let i = 0; i < boards; i++) {
    g.fillStyle = css(mul(wood, 0.93 + 0.12 * r())); g.fillRect(i * bw, 0, bw + 1, H);
    g.strokeStyle = css(mul(wood, 0.82), 0.4); g.lineWidth = 1.5;
    for (let k = 0; k < 3; k++) { const x = i * bw + bw * (0.15 + 0.7 * r()); g.beginPath(); g.moveTo(x, 0); g.bezierCurveTo(x + 5 * (r() - 0.5), H * 0.3, x + 5 * (r() - 0.5), H * 0.6, x, H); g.stroke(); }
    g.fillStyle = css(mul(wood, 0.55)); g.fillRect(i * bw - 1.5, 0, 3, H);
  }
  g.fillStyle = css(mul(wood, 0.3)); g.fillRect(W / 2 - 3.5, 0, 7, H);        // the gap between the leaves
  g.fillStyle = css(iron);
  for (const ym of [0.55, 1.75, 2.95]) {                                       // strap hinges from each jamb
    const y = H - ym * px, h = 0.13 * px;
    for (const s of [-1, 1]) {
      const x0 = s < 0 ? 0 : W, len = 1.12 * px;
      g.beginPath(); g.moveTo(x0, y - h / 2); g.lineTo(x0 - s * len, y - h * 0.3); g.lineTo(x0 - s * (len + h * 0.9), y); g.lineTo(x0 - s * len, y + h * 0.3); g.lineTo(x0, y + h / 2); g.closePath(); g.fill();
    }
  }
  for (const s of [-1, 1]) {                                                   // ring handles
    const x = W / 2 + s * 0.3 * px, y = H - 1.15 * px;
    g.beginPath(); g.arc(x, y - 0.1 * px, 0.05 * px, 0, 6.3); g.fill();
    g.lineWidth = 0.035 * px; g.strokeStyle = css(iron); g.beginPath(); g.arc(x, y, 0.1 * px, 0, 6.3); g.stroke();
  }
  return tex(c, false);
}

/** the wheel window: dark blue glass, a stone hub and eight spokes (uv 0..1 over the disc's diameter) */
export function wheelTex(glass: RGB, stone: RGB) {
  const S = 256, c = canvas(S, S), g = c.getContext("2d")!, C = S / 2;
  const gr = g.createLinearGradient(0, 0, S, S); gr.addColorStop(0, css(mul(glass, 1.25))); gr.addColorStop(1, css(mul(glass, 0.8)));
  g.fillStyle = gr; g.fillRect(0, 0, S, S);
  g.strokeStyle = css(stone); g.lineWidth = S * 0.075; g.lineCap = "butt";
  for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2 + Math.PI / 8; g.beginPath(); g.moveTo(C, C); g.lineTo(C + Math.cos(a) * S, C + Math.sin(a) * S); g.stroke(); }
  g.fillStyle = css(stone); g.beginPath(); g.arc(C, C, S * 0.14, 0, 6.3); g.fill();
  g.fillStyle = css(mul(glass, 0.9)); g.beginPath(); g.arc(C, C, S * 0.065, 0, 6.3); g.fill();
  return tex(c, false);
}

/** scalloped roof tiles in rows (tile = 2.4 m: 8 tiles x 6 rows) */
export function roofTex(seed: number, base: RGB, size = 512) {
  const c = canvas(size, size), g = c.getContext("2d")!, r = rng(seed), rows = 6, cols = 8, rh = size / rows, cw = size / cols;
  g.fillStyle = css(mul(base, 0.72)); g.fillRect(0, 0, size, size);
  for (let j = rows; j >= -1; j--) for (let i = -1; i <= cols; i++) {
    const x = i * cw + (j % 2 ? cw / 2 : 0), y = j * rh, k = 0.92 + 0.16 * r();
    for (const dy of [0, size]) {
      g.fillStyle = css(mul(base, k));
      g.beginPath(); g.moveTo(x + 2, y + dy - rh * 0.1); g.lineTo(x + cw - 2, y + dy - rh * 0.1); g.lineTo(x + cw - 2, y + dy + rh * 0.62);
      g.quadraticCurveTo(x + cw / 2, y + dy + rh * 1.18, x + 2, y + dy + rh * 0.62); g.closePath(); g.fill();
      g.strokeStyle = css(mul(base, 0.62), 0.8); g.lineWidth = 2.5; g.stroke();
    }
  }
  return tex(c);
}

/** turf: a light neutral green-grey with short blade strokes, tinted by the material colour (tile ~6 m) */
export function turfTex(seed: number, size = 512) {
  const c = canvas(size, size), g = c.getContext("2d")!, r = rng(seed);
  g.fillStyle = "rgb(232,236,222)"; g.fillRect(0, 0, size, size);
  for (let i = 0; i < 40; i++) { const x = r() * size, y = r() * size, rad = size * (0.06 + 0.12 * r()), lo = r() < 0.55; wrap9(size, (dx, dy) => blotch(g, x + dx, y + dy, rad, lo ? [196, 212, 178] : [250, 250, 232], 0.4)); }
  g.lineCap = "round";
  for (let i = 0; i < 520; i++) {
    const x = r() * size, y = r() * size, l = size * (0.012 + 0.014 * r()), lo = r() < 0.6;
    g.strokeStyle = lo ? "rgba(168,190,150,0.55)" : "rgba(255,255,240,0.5)"; g.lineWidth = size / 220;
    for (let k = -1; k <= 1; k++) wrap9(size, (dx, dy) => { g.beginPath(); g.moveTo(x + dx + k * l * 0.45, y + dy); g.lineTo(x + dx + k * l * 0.8, y + dy - l * (1 - 0.25 * Math.abs(k))); g.stroke(); });
  }
  return tex(c);
}

/** spring turf: turfTex with the grass colour `tint` baked in (so the flowers stay white), plus loose drifts of
 *  daisies, a few pink and yellow heads among them; tile 7 m, heads 8 - 11 cm so they mip down to pale flecks */
export function meadowTex(seed: number, tint: RGB, size = 1024) {
  const base = turfTex(seed, size);
  const c = canvas(size, size), g = c.getContext("2d")!, r = rng(seed + 500), px = size / 7;
  g.drawImage(base.image as HTMLCanvasElement, 0, 0); base.dispose();
  g.globalCompositeOperation = "multiply"; g.fillStyle = css(tint); g.fillRect(0, 0, size, size);
  g.globalCompositeOperation = "source-over";
  for (let i = 0; i < 18; i++) {
    const cx = r() * size, cy = r() * size, n = 5 + ((r() * 6) | 0), spread = px * (0.35 + 0.45 * r());
    for (let k = 0; k < n; k++) {
      const a = r() * 6.283, d = Math.sqrt(r()) * spread, x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d * 0.8, rad = px * (0.04 + 0.016 * r()), kind = r();
      wrap9(size, (dx, dy) => {
        g.fillStyle = kind < 0.7 ? "rgb(255,255,250)" : kind < 0.86 ? "rgb(255,206,228)" : "rgb(255,226,84)";
        g.beginPath(); g.arc(x + dx, y + dy, rad, 0, 6.3); g.fill();
        if (kind < 0.7) { g.fillStyle = "rgb(248,196,56)"; g.beginPath(); g.arc(x + dx, y + dy, rad * 0.36, 0, 6.3); g.fill(); }
      });
    }
  }
  return tex(c);
}

/** the thaw: wet dark earth, dull winter grass and big soft patches of old snow (tile ~12 m) */
export function thawTex(seed: number, size = 1024) {
  const c = canvas(size, size), g = c.getContext("2d")!, r = rng(seed);
  g.fillStyle = "rgb(150,122,90)"; g.fillRect(0, 0, size, size);
  for (let i = 0; i < 60; i++) { const x = r() * size, y = r() * size, rad = size * (0.04 + 0.08 * r()), k = r(); wrap9(size, (dx, dy) => blotch(g, x + dx, y + dy, rad, k < 0.5 ? [150, 166, 96] : k < 0.72 ? [122, 98, 76] : [170, 142, 106], 0.5)); }
  for (let i = 0; i < 34; i++) {
    const x = r() * size, y = r() * size, n = 3 + ((r() * 4) | 0), rad0 = size * (0.035 + 0.05 * r());
    for (let k = 0; k < n; k++) {
      const ox = (r() - 0.5) * rad0 * 2.4, oy = (r() - 0.5) * rad0 * 1.2, rad = rad0 * (0.6 + 0.7 * r());
      wrap9(size, (dx, dy) => { g.fillStyle = "rgba(196,208,230,0.9)"; g.beginPath(); g.ellipse(x + ox + dx, y + oy + dy + rad * 0.08, rad * 1.04, rad * 0.62, 0, 0, 6.3); g.fill(); });
    }
    const rr = rng(seed + 100 + i);
    for (let k = 0; k < n; k++) {
      const ox = (rr() - 0.5) * rad0 * 2.4, oy = (rr() - 0.5) * rad0 * 1.2, rad = rad0 * (0.6 + 0.7 * rr());
      wrap9(size, (dx, dy) => { g.fillStyle = "rgb(240,245,253)"; g.beginPath(); g.ellipse(x + ox + dx, y + oy + dy, rad, rad * 0.58, 0, 0, 6.3); g.fill(); });
    }
  }
  return tex(c);
}

/** packed earth of the path: a light neutral with long soft ruts along u and scattered pebbles (tile 4 m), tinted by
 *  the material colour; snow = trodden snow (soft footprints instead of pebbles) */
export function pathTex(seed: number, snow: boolean, size = 512) {
  const c = canvas(size, size), g = c.getContext("2d")!, r = rng(seed);
  g.fillStyle = snow ? "rgb(238,243,252)" : "rgb(236,228,214)"; g.fillRect(0, 0, size, size);
  for (let i = 0; i < 30; i++) { const x = r() * size, y = r() * size, rad = size * (0.06 + 0.1 * r()), lo = r() < 0.6; wrap9(size, (dx, dy) => blotch(g, x + dx, y + dy, rad, lo ? (snow ? [206, 218, 240] : [205, 190, 168]) : [255, 255, 255], 0.35)); }
  if (snow) {
    for (let i = 0; i < 46; i++) {
      const x = r() * size, y = r() * size, a = (r() - 0.5) * 0.9;
      wrap9(size, (dx, dy) => { g.fillStyle = "rgba(176,192,222,0.6)"; g.beginPath(); g.ellipse(x + dx, y + dy, size * 0.03, size * 0.014, a, 0, 6.3); g.fill(); });
    }
  } else {
    for (let i = 0; i < 70; i++) {
      const x = r() * size, y = r() * size, rad = size * (0.006 + 0.01 * r()), lo = r() < 0.5;
      wrap9(size, (dx, dy) => { g.fillStyle = lo ? "rgba(176,160,140,0.8)" : "rgba(255,252,244,0.8)"; g.beginPath(); g.ellipse(x + dx, y + dy, rad * 1.4, rad, 0, 0, 6.3); g.fill(); });
    }
  }
  return tex(c);
}

/** a puffy cartoon cloud with a flat lavender base (alpha) */
export function cloudTex(seed: number) {
  const W = 512, H = 256, c = canvas(W, H), g = c.getContext("2d")!, r = rng(seed);
  const puffs: [number, number, number][] = [];
  const n = 6 + ((r() * 3) | 0);
  for (let i = 0; i < n; i++) { const u = (i + 0.5) / n, x = W * (0.14 + 0.72 * u), rad = H * (0.16 + 0.2 * Math.sin(Math.PI * u) + 0.06 * r()); puffs.push([x, H * 0.7 - rad * 0.55, rad]); }
  g.fillStyle = "#cfd6ee"; for (const [x, y, rad] of puffs) { g.beginPath(); g.arc(x, y + rad * 0.16, rad, 0, 6.3); g.fill(); }
  g.fillStyle = "#ffffff"; for (const [x, y, rad] of puffs) { g.beginPath(); g.arc(x - rad * 0.05, y - rad * 0.05, rad * 0.93, 0, 6.3); g.fill(); }
  g.clearRect(0, H * 0.74, W, H);
  g.fillStyle = "#cfd6ee"; g.beginPath(); g.ellipse(W / 2, H * 0.74, W * 0.37, H * 0.035, 0, 0, 6.3); g.fill();
  const t = tex(c, false); t.premultiplyAlpha = false;
  return t;
}

/** the far skyline: hazy wooded hills and a line of roofs, white on alpha (tinted by the material colour); tiles in u */
export function skylineTex(seed: number) {
  const W = 2048, H = 256, c = canvas(W, H), g = c.getContext("2d")!, r = rng(seed);
  // far hills (lighter)
  g.fillStyle = "rgb(255,255,255)"; g.beginPath(); g.moveTo(0, H);
  for (let x = 0; x <= W; x += 8) { const u = (x / W) * Math.PI * 2; g.lineTo(x, H * (0.5 - 0.1 * Math.sin(u * 2 + 1) - 0.07 * Math.sin(u * 5 + 2.2) - 0.03 * Math.sin(u * 11))); }
  g.lineTo(W, H); g.closePath(); g.fill();
  // tree line and roofs (darker)
  g.fillStyle = "rgb(214,220,232)";
  for (let i = 0; i < 120; i++) { const x = r() * W, rad = H * (0.07 + 0.07 * r()), y = H * (0.82 - 0.1 * r()); for (const dx of [-W, 0, W]) { g.beginPath(); g.arc(x + dx, y, rad, 0, 6.3); g.fill(); } }
  for (let i = 0; i < 34; i++) {
    const x = r() * W, w = W * (0.012 + 0.014 * r()), h = H * (0.1 + 0.12 * r()), y = H * 0.9, tower = r() < 0.12;
    for (const dx of [-W, 0, W]) {
      if (tower) { g.fillRect(x + dx - w * 0.3, y - h * 2.2, w * 0.6, h * 2.2); g.beginPath(); g.moveTo(x + dx - w * 0.42, y - h * 2.2); g.lineTo(x + dx, y - h * 3.1); g.lineTo(x + dx + w * 0.42, y - h * 2.2); g.fill(); }
      else { g.fillRect(x + dx - w, y - h, w * 2, h); g.beginPath(); g.moveTo(x + dx - w * 1.15, y - h); g.lineTo(x + dx, y - h - w * 1.1); g.lineTo(x + dx + w * 1.15, y - h); g.fill(); }
    }
  }
  g.fillRect(0, H * 0.84, W, H * 0.16);
  const t = tex(c, true); t.wrapT = THREE.ClampToEdgeWrapping; t.anisotropy = 4;
  return t;
}
