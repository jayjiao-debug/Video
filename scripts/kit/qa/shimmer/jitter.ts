// SHIMMER TEST, part 1: the camera jitter (harness-independent; no film code is imported).
//
// The idea: a still picture must not change when the camera moves by a fraction of a pixel. `shimmerJitter` shifts the
// picture of a PerspectiveCamera by a fixed, known offset (camera.setViewOffset: an off-axis window of the SAME image
// plane, so the picture is the same picture moved by (-dx, -dy) px; there is no parallax and no change of scale). The
// analyser (shimmer.py) moves every jittered picture back by its offset and looks at what is left.
//
// Use it from any harness:
//     import { shimmerJitter } from "<repo>/scripts/kit/qa/shimmer/jitter";
//     shimmerJitter(camera, w, h, k);        // k = 0..7; call it BEFORE the frame is drawn; k < 0 switches it off
// It stays on the camera through later updateProjectionMatrix() calls (three keeps camera.view). The preview entries
// of this repo do not need to call it: scripts/kit/qa/shimmer/hook.ts does it from outside (see README.md).
//
// Deterministic: the offsets are a fixed table (Halton 2,3 for the fraction, Halton 5,7 for whole pixels).
import type { PerspectiveCamera } from "three";

const halton = (i: number, b: number) => { let f = 1, r = 0; while (i > 0) { f /= b; r += f * (i % b); i = Math.floor(i / b); } return r; };

/** the offset (px) of jitter k: a fraction in [-0.5, 0.5) (Halton 2,3, index k + 1) plus, if spread > 0, a whole number
 *  of px in [-spread, spread] (Halton 5,7). The fraction tests the sampling phase (point-sampled thresholds, thin
 *  geometry); the whole px move the picture across everything that is fixed to the SCREEN (noise tiles, dither).
 *  shimmer.py computes the same table (keep the two in step). */
export const shimmerOffset = (k: number, spread = 0): [number, number] => {
  const i = k + 1;
  const whole = (b: number) => (spread > 0 ? Math.round((halton(i, b) - 0.5) * 2 * spread) : 0);
  return [halton(i, 2) - 0.5 + whole(5), halton(i, 3) - 0.5 + whole(7)];
};

/** shift the picture of `camera` (w x h px) by the offset of jitter k (or by an explicit [dx, dy] in px);
 *  k < 0 or null: no jitter. Returns the offset. */
export function shimmerJitter(camera: PerspectiveCamera, w: number, h: number, k: number | [number, number] | null, spread = 0): [number, number] {
  if (k === null || (typeof k === "number" && k < 0)) { camera.clearViewOffset(); return [0, 0]; }
  const o = typeof k === "number" ? shimmerOffset(k, spread) : k;
  camera.setViewOffset(w, h, o[0], o[1], w, h);                    // also calls updateProjectionMatrix()
  return o;
}
