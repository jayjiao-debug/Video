// BLOCK-OUT HELPERS for the WP1 place stubs (sets/market.ts ... sets/temple.ts): plain shapes in a colour, built with
// the props kit's flat toon paint (lit by the place's fill), a figure light / fill maker for a block-out look, painted
// words. The sets lanes (WP2a / WP2b) replace the stubs with the real places and may drop this file's use; nothing
// else depends on it.
import * as THREE from "three";
import type { Kit } from "../../../kit/props/kit";
import type { EnvSpec } from "../../bt/pbr";
import type { CastLight } from "../../group/kit/cast";
import { paint, FONT } from "../../../kit/sets/okit";

export type Blk = ReturnType<typeof blockKit>;
/** shapes into `group`: each is a Mesh that casts and receives shadows, named `name` */
export const blockKit = (K: Kit, group: THREE.Group) => {
  const add = (name: string, geo: THREE.BufferGeometry, col: string | THREE.Material, o: { cast?: boolean; rough?: number; into?: THREE.Object3D } = {}) => {
    const m = new THREE.Mesh(geo, typeof col === "string" ? K.flat(col, { rough: o.rough ?? 0.85 }) : col);
    m.name = name; m.castShadow = o.cast ?? true; m.receiveShadow = true; (o.into ?? group).add(m);
    return m;
  };
  return {
    add,
    /** a box by its extents */
    box: (name: string, col: string, x0: number, x1: number, y0: number, y1: number, z0: number, z1: number, o: { cast?: boolean; into?: THREE.Object3D } = {}) =>
      add(name, new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0).translate((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2), col, o),
    /** an upright cylinder standing on (x, y0, z) */
    cyl: (name: string, col: string, x: number, z: number, r: number, y0: number, y1: number, o: { seg?: number; r1?: number; cast?: boolean; into?: THREE.Object3D } = {}) =>
      add(name, new THREE.CylinderGeometry(o.r1 ?? r, r, y1 - y0, o.seg ?? 24).translate(x, (y0 + y1) / 2, z), col, o),
    /** a level floor quad (y) by its extents: one quad, no seams */
    floor: (name: string, col: string, x0: number, x1: number, z0: number, z1: number, y = 0, o: { into?: THREE.Object3D } = {}) =>
      add(name, new THREE.PlaneGeometry(x1 - x0, z1 - z0).rotateX(-Math.PI / 2).translate((x0 + x1) / 2, y, (z0 + z1) / 2), col, { cast: false, ...o }),
    /** an unlit glowing shape (lantern paper, the moon): not in the ink pass's way (MeshBasicMaterial) */
    glow: (name: string, col: string, geo: THREE.BufferGeometry, o: { into?: THREE.Object3D } = {}) => {
      const m = new THREE.Mesh(geo, K.glow(col)); m.name = name; m.castShadow = false; (o.into ?? group).add(m); return m;
    },
  };
};
/** a fixed pseudo-random sequence 0..1 (never Math.random) */
export const seq = (seed: number) => { let s = seed >>> 0 || 1; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; };

// ------------------------------------------------------------------------------------------------ block-out looks
type V3 = [number, number, number];
/** a figure light for a block-out look: the place's key direction, tint and gain over common toon values (the BAKED
 *  values of sets/index.ts BAKED_LIGHT are in it) */
export const castOf = (o: { key: V3; tint: V3; tintK?: number; gain?: number; shade?: V3; shadeK?: number; lift?: number; side?: V3 }): CastLight => ({
  key: o.key, tint: o.tint, tintK: o.tintK ?? 0.8, gain: o.gain ?? 0.93, grad: 0.22, bodyGrad: 0.16, sideTint: o.side ?? [0.92, 0.94, 1.0],
  shade: o.shade ?? [1.04, 0.95, 1.34], shadeK: o.shadeK ?? 0.36, wrap: [28, 56], edge: 0.13, broad: 0.1, bodySat: 0.13, sheen: 0.08, lift: o.lift ?? 0.01, contactLen: 0.4,
  bleach: 0.7, bodyShadeK: 0.4, contact: "#8a93c2",
} as unknown as CastLight);
/** a bt/pbr fill for a block-out: ground / horizon / sky colours (0..1) and one soft bright box toward the sun */
export const fillOf = (o: { ground: V3; horizon: V3; sky: V3; sun: { az: number; el: number; col: V3 } }): EnvSpec => ({
  frame: "world",
  stops: [[-90, o.ground], [-8, o.ground.map((v, i) => (v + o.horizon[i]) / 2) as V3], [5, o.horizon], [40, o.sky], [90, o.sky]],
  boxes: [{ az: o.sun.az, el: o.sun.el, rot: 0, w: 40, h: 18, soft: 14, col: o.sun.col }],
});
/** a painted board with words (the 「德有邻堂」 board): a texture, `w` x `h` px */
export const wordsTex = (text: string, o: { w?: number; h?: number; bg: string; fg: string; border?: string; vertical?: boolean }) =>
  paint(o.w ?? 512, o.h ?? 160, (g, W, H) => {
    g.fillStyle = o.bg; g.fillRect(0, 0, W, H);
    if (o.border) { g.strokeStyle = o.border; g.lineWidth = Math.round(H * 0.08); g.strokeRect(g.lineWidth / 2, g.lineWidth / 2, W - g.lineWidth, H - g.lineWidth); }
    g.fillStyle = o.fg; g.textAlign = "center"; g.textBaseline = "middle";
    const n = [...text].length, px = o.vertical ? Math.min(W * 0.7, (H * 0.86) / n) : Math.min(H * 0.62, (W * 0.84) / n);
    g.font = `700 ${Math.round(px)}px ${FONT}`;
    if (o.vertical) [...text].forEach((ch, i) => g.fillText(ch, W / 2, H * 0.07 + px * (i + 0.5)));
    else g.fillText(text, W / 2, H / 2 + px * 0.04);
  });
