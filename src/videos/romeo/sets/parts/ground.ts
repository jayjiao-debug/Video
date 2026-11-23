// GROUNDS THAT HOLD STILL (v5, 23 Nov 2026). The owner on the v4 cut: "The ground is twitching" (the grove) and "the
// ground (walking path) keeps clipping with each other and causing issues" (Mantua).
//
// WHY THEY MOVED. The kit's groundG and levelQuad make a ground of ONE quad (600 m square under the sycamore, 100 x
// 120 m in Mantua). The lens's near plane is 3 cm in front of it, and a triangle that crosses that plane is cut there:
// its new corners lie on the near plane and project TENS OF MILLIONS of pixels off the frame (300 m / 0.03 m x the
// focal length). Depth and uv across the whole triangle are then interpolated, in float32, from a corner that far
// away, so the ground lands a pixel or more off against everything that stands on it, differently on every frame as
// the handheld layer moves the lens by a hair. Raw stills of frames 475 and 476 (lens moved 0.04 px): the grass slid
// 1.5 px under the tree's foot and the rock, which held still.
// And with near 0.03 and a 24 bit depth buffer one depth step is 0.2 mm at 10 m and 1.8 mm at 30 m: a sheet laid
// 0.6 mm over a ground (Mantua's wheel ruts, the street's gutter and kerbs) fights it from about 15 m.
//
// THE RULES
//   1  a ground is a GRID: cells of `cell` metres wherever the lens can stand (so no triangle that both shows and
//      crosses the near plane is larger than that), growing by GROW a line out to the reach. One rectilinear grid:
//      every corner is shared, so there is no T junction and no crack.
//   2  nothing lies ON a ground. What is on it (ruts, a gutter, a kerb, a path) is painted INTO its texture, or is its
//      own strip of the same grid at the same height, side by side with its neighbours (strips), never over them.
import * as THREE from "three";

const GROW = 1.7;
/** the grid's lines along one axis from lo to hi: `cell` apart between f0 and f1 (where the lens can be, with a margin),
 *  growing outward from there; `also` = lines that must exist exactly (the edges of strips) */
export const gridLines = (lo: number, hi: number, f0: number, f1: number, cell = 1, also: number[] = []): number[] => {
  const a = Math.max(lo, Math.min(f0, f1)), b = Math.min(hi, Math.max(f0, f1)), n = Math.max(1, Math.ceil((b - a) / cell - 1e-9)), out: number[] = [];
  for (let i = 0; i <= n; i++) out.push(a + ((b - a) * i) / n);
  for (let x = b, s = cell * GROW; x < hi - 1e-6; s *= GROW) { x = Math.min(hi, x + s); if (hi - x < s * 0.35) x = hi; out.push(x); }
  for (let x = a, s = cell * GROW; x > lo + 1e-6; s *= GROW) { x = Math.max(lo, x - s); if (x - lo < s * 0.35) x = lo; out.push(x); }
  for (const v of also) if (v > lo && v < hi) out.push(v);
  out.sort((p, q) => p - q);
  // lines closer than 2 mm are one line (an `also` line next to a grid line): the `also` line wins
  const keep: number[] = [];
  for (const v of out) { const last = keep.length - 1; if (last >= 0 && v - keep[last] < 0.002) { if (also.includes(v)) keep[last] = v; } else keep.push(v); }
  return keep;
};
/** a level grid facing up over the lines xs and zs (both ascending); uv from the world x, z */
export const gridG = (xs: number[], zs: number[], y: number, uv: (x: number, z: number) => [number, number]): THREE.BufferGeometry => {
  const pos: number[] = [], nor: number[] = [], uvs: number[] = [], idx: number[] = [], nx = xs.length, nz = zs.length;
  for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) { pos.push(xs[i], y, zs[j]); nor.push(0, 1, 0); uvs.push(...uv(xs[i], zs[j])); }
  for (let j = 0; j < nz - 1; j++) for (let i = 0; i < nx - 1; i++) { const a = j * nx + i, b = a + 1, c = a + nx, d = c + 1; idx.push(a, c, b, b, c, d); }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2)); g.setIndex(idx);
  return g;
};
/** THE KIT'S groundG AS A GRID: a ground round (cx, cz) out to `reach`, its texture one square of `size` metres centred
 *  there (clamped: the border colour runs on). `fine` = how far from (fx, fz) the lens can be, with a margin (m) */
export const groundGrid = (cx: number, cz: number, size: number, reach: number, o: { fine?: number; at?: [number, number]; cell?: number; y?: number } = {}): THREE.BufferGeometry => {
  const [fx, fz] = o.at ?? [cx, cz], fine = o.fine ?? 10, cell = o.cell ?? 1;
  return gridG(gridLines(cx - reach, cx + reach, fx - fine, fx + fine, cell), gridLines(cz - reach, cz + reach, fz - fine, fz + fine, cell), o.y ?? 0,
    (x, z) => [(x - cx) / size + 0.5, 0.5 - (z - cz) / size]);
};
/** a level rectangle as a grid (the kit's levelQuad): x0..x1, z0..z1 at height y; fine = [x0, x1, z0, z1] where the
 *  lens can be (with a margin); alsoX / alsoZ = lines that must exist (so strips cut from the same lines share them) */
export const levelGrid = (x0: number, x1: number, z0: number, z1: number, y: number, uv: (x: number, z: number) => [number, number],
  o: { fine: [number, number, number, number]; cell?: number; alsoX?: number[]; alsoZ?: number[] }): THREE.BufferGeometry =>
  gridG(gridLines(x0, x1, o.fine[0], o.fine[1], o.cell ?? 1, o.alsoX), gridLines(z0, z1, o.fine[2], o.fine[3], o.cell ?? 1, o.alsoZ), y, uv);
/** STRIPS SIDE BY SIDE IN ONE PLANE (a street: paving | kerb | gutter | kerb | paving): the rectangle x0..x1, z0..z1 is
 *  cut along `cuts` (x values, ascending, inside x0..x1) and each strip is its own geometry over the SAME z lines and
 *  with the cut lines as its own edges, so neighbours share every corner. Returns the strips from x0 to x1. */
export const strips = (x0: number, x1: number, z0: number, z1: number, y: number, cuts: number[], uv: (strip: number) => (x: number, z: number) => [number, number],
  o: { fine: [number, number, number, number]; cell?: number; alsoZ?: number[] }): THREE.BufferGeometry[] => {
  const xs = gridLines(x0, x1, o.fine[0], o.fine[1], o.cell ?? 1, cuts), zs = gridLines(z0, z1, o.fine[2], o.fine[3], o.cell ?? 1, o.alsoZ), edges = [x0, ...cuts, x1];
  return edges.slice(0, -1).map((a, i) => gridG(xs.filter((x) => x >= a - 1e-9 && x <= edges[i + 1] + 1e-9), zs, y, uv(i)));
};
/** a rectangle of a grid whose lines are xs and zs: x0, x1, z0, z1 must be lines of it (pass them as `also` to
 *  gridLines). Patches cut from the same lines share every corner on their common edges. */
export const patchG = (xs: number[], zs: number[], x0: number, x1: number, z0: number, z1: number, y: number, uv: (x: number, z: number) => [number, number]): THREE.BufferGeometry =>
  gridG(xs.filter((v) => v >= x0 - 1e-6 && v <= x1 + 1e-6), zs.filter((v) => v >= z0 - 1e-6 && v <= z1 + 1e-6), y, uv);
/** A FLOOR PAINTED IN METRES: a canvas over the rectangle x0..x1 (across), z0..z1 (z0 at the canvas's top), `ppm`
 *  pixels a metre. `fn` draws in METRES (x, z) with the context already scaled, so the same design function can paint
 *  two neighbouring canvases at different sharpness and its marks run on across their seam. The uv of a point is
 *  uvOf(x, z). */
export const metrePaint = (x0: number, x1: number, z0: number, z1: number, ppm: number) => {
  const W = Math.round((x1 - x0) * ppm), H = Math.round((z1 - z0) * ppm);
  return {
    W, H,
    /** set the context up to draw in metres */
    begin(g: CanvasRenderingContext2D) { g.setTransform(W / (x1 - x0), 0, 0, H / (z1 - z0), -x0 * (W / (x1 - x0)), -z0 * (H / (z1 - z0))); },
    uvOf: (x: number, z: number): [number, number] => [(x - x0) / (x1 - x0), 1 - (z - z0) / (z1 - z0)],
  };
};
