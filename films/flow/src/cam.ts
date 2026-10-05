/* A tiny perspective camera for canvas drawing (no WebGL): look from `pos` at `target`,
   vertical field of view `fov` (degrees). project() → [screen x, screen y, depth, px per unit]. */
export type V3 = [number, number, number];
export type Cam = {project: (x: number, y: number, z: number, out?: number[]) => number[]};

const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = (a: V3): V3 => {
  const l = Math.hypot(a[0], a[1], a[2]) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};

export const makeCam = (pos: V3, target: V3, fov = 40, cx = 960, cy = 540, H = 1080): Cam => {
  const f = norm(sub(target, pos));
  const r = norm(cross(f, [0, 1, 0]));
  const u = cross(r, f);
  const k = H / 2 / Math.tan((fov * Math.PI) / 360);
  return {
    project: (x, y, z, out = [0, 0, 0, 0]) => {
      const d: V3 = [x - pos[0], y - pos[1], z - pos[2]];
      const zc = d[0] * f[0] + d[1] * f[1] + d[2] * f[2];
      const s = zc > 0.05 ? k / zc : 0;
      out[0] = cx + (d[0] * r[0] + d[1] * r[1] + d[2] * r[2]) * s;
      out[1] = cy - (d[0] * u[0] + d[1] * u[1] + d[2] * u[2]) * s;
      out[2] = zc;
      out[3] = s;
      return out;
    },
  };
};
