// SHARED KIT: src/kit/fx/stable.ts (KIT.md, fx/README.md). Built for Hongmen; any toon film imports it from here.
// Small helpers that keep a picture STILL when the camera moves by a fraction of a pixel. The outline pass is
// fx/ink.ts; this file holds the settings and checks for everything else that was measured in the flicker
// diagnosis (/home/user/hm_notes/flicker_a2.md). README.md in this folder says when to use which.
// Everything here is deterministic and per frame; nothing keeps state between frames.
import * as THREE from "three";

// ------------------------------------------------------------------------------------------------ N8AO
/** N8AO "High" as explicit numbers. Measured: the AO is not a flicker source with these (its screen-fixed noise is
 *  0.7 levels; Low is grainier). The trap they close: the R3F <N8AO quality="high"> wrapper applies `quality` once and
 *  silently falls back to 16 / 4 / 12 when ANY other prop of the element changes later. So in a new film:
 *    <N8AO {...STABLE_AO} aoRadius={..} distanceFalloff={..} intensity={..} color={..} />     (no `quality`)
 *  and in a harness:  stableAO(new N8AOPostPass(scene, camera, w, h)). */
export const STABLE_AO = { aoSamples: 64, denoiseSamples: 8, denoiseRadius: 6, halfRes: false } as const;

/** sets STABLE_AO on an N8AOPostPass / N8AOPass (only the values that differ: N8AO rebuilds its shader on a change) */
export function stableAO<T extends { configuration: Record<string, any> }>(pass: T): T {
  const c = pass.configuration;
  for (const [k, v] of Object.entries(STABLE_AO)) if (c[k] !== v) c[k] = v;
  return pass;
}

// ------------------------------------------------------------------------------------------------ textures
/** Every painted / canvas texture of a set goes through this: mipmaps + trilinear + anisotropy 8. Measured on the
 *  privy: with mipmaps off the reed screen shimmers by 8.9 levels on average (0.7 with) and the set goes from 2100 to
 *  10391 ppm. three's defaults already give mipmaps; the trap is a texture made with generateMipmaps = false "for
 *  speed". Returns the texture. */
export function stableTexture<T extends THREE.Texture>(tex: T, anisotropy = 8): T {
  tex.generateMipmaps = true;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.anisotropy = anisotropy;
  tex.needsUpdate = true;
  return tex;
}

const MAP_KEYS = ["map", "alphaMap", "emissiveMap", "bumpMap", "normalMap", "roughnessMap", "metalnessMap", "aoMap", "lightMap", "specularMap"] as const;
const NO_MIPS = new Set<number>([THREE.NearestFilter, THREE.LinearFilter]);

/** QA for a set: the textures under `root` that would shimmer (no mipmaps, or nearest minification) and are larger
 *  than `minSize` px. Returns one line per finding ("" list = clean). Call it once after the set is built:
 *    for (const l of auditTextures(set.group)) console.log("QA: texture " + l);
 *  Not checked: textures bound through custom shader uniforms. */
export function auditTextures(root: THREE.Object3D, minSize = 64): string[] {
  const out: string[] = [], seen = new Set<THREE.Texture>();
  root.traverse((o) => {
    const mat = (o as THREE.Mesh).material as THREE.Material | THREE.Material[] | undefined;
    if (!mat) return;
    for (const m of Array.isArray(mat) ? mat : [mat]) {
      for (const k of MAP_KEYS) {
        const t = (m as unknown as Record<string, THREE.Texture | null | undefined>)[k];
        if (!t || !(t as THREE.Texture).isTexture || seen.has(t)) continue;
        seen.add(t);
        const img = t.image as { width?: number; height?: number } | undefined;
        const w = img?.width ?? 0, h = img?.height ?? 0;
        if (Math.max(w, h) < minSize) continue;
        if (!t.generateMipmaps || NO_MIPS.has(t.minFilter)) out.push(`${o.name || o.type} ${m.name || m.type}.${k} ${w}x${h}: no mipmaps (use stableTexture)`);
        else if (t.anisotropy < 4) out.push(`${o.name || o.type} ${m.name || m.type}.${k} ${w}x${h}: anisotropy ${t.anisotropy} (floors and walls seen at a slant want 8)`);
      }
    }
  });
  return out;
}

// ------------------------------------------------------------------------------------------------ floor sheets
/** A sheet that lies on a floor where figures stand (mat, rug, path, spill) may be at most this far over the floor
 *  (m). The rig's contact shadow blob lies at the figure's at.y + 0.003 with polygon offset -2 / -2; a sheet at the
 *  same height with the same offset ties with it, and the dark patch under the figure is whole, striped or gone from
 *  frame to frame (the opening's "dark band under the hem": 3421 of 5998 ppm; with the mat at 0.001: gone). */
export const FLOOR_SHEET_MAX = 0.001;

/** QA for a set: flat horizontal meshes whose top lies in the height band where they would tie with a figure's
 *  contact blob (2 .. 4 mm over `floorY`). Returns one line per finding. Only separate meshes are seen (a sheet that
 *  is merged into a bigger geometry is not). */
export function auditFloorSheets(root: THREE.Object3D, floorY = 0): string[] {
  const out: string[] = [], box = new THREE.Box3();
  root.updateWorldMatrix(true, true);
  root.traverse((o) => {
    const m = o as THREE.Mesh;
    if (!m.isMesh || !m.geometry) return;
    box.setFromObject(m);
    if (box.isEmpty()) return;
    const thick = box.max.y - box.min.y, top = box.max.y - floorY, area = (box.max.x - box.min.x) * (box.max.z - box.min.z);
    if (thick < 0.0015 && area > 0.04 && top > 0.002 && top < 0.004)
      out.push(`${o.name || o.type} (${(box.max.x - box.min.x).toFixed(2)} x ${(box.max.z - box.min.z).toFixed(2)} m) lies ${(top * 1000).toFixed(1)} mm over the floor: it ties with the figures' contact shadow (put it at ${FLOOR_SHEET_MAX * 1000} mm or lower)`);
  });
  return out;
}

// ------------------------------------------------------------------------------------------------ shadows
/** For a shadow box that must FOLLOW something (a runner, a travelling camera): centre a directional light's shadow
 *  box on `focus`, snapped to whole shadow-map texels along the shadow camera's own two axes, keeping the light's
 *  direction and distance. Static shadows then stand still while the box travels (measured in Arthur's runner shot:
 *  0 of 6335 fence-shadow pixels change). Call it every frame BEFORE the render; a pure function of `focus`.
 *  What it cannot do: the BORDER of the box still travels, and a shadow cut off by it slides (Arthur, far snow, one
 *  pixel a frame). So: keep the box fixed per place where you can (Hongmen does), or make it large enough that its
 *  border stays outside every picture of the shot. */
export function snapShadowBox(light: THREE.DirectionalLight, focus: THREE.Vector3): void {
  const cam = light.shadow.camera, size = light.shadow.mapSize;
  const dir = _d.copy(light.position).sub(light.target.position);
  const dist = dir.length() || 1;
  dir.divideScalar(dist);                                         // from the target to the light = the shadow camera's +z
  const x = _x.crossVectors(cam.up, dir);
  if (x.lengthSq() < 1e-12) x.set(1, 0, 0); else x.normalize();   // (a light straight overhead: any fixed axis)
  const y = _y.crossVectors(dir, x);
  const tx = (cam.right - cam.left) / size.x, ty = (cam.top - cam.bottom) / size.y;
  const fx = Math.round(focus.dot(x) / tx) * tx, fy = Math.round(focus.dot(y) / ty) * ty, fz = focus.dot(dir);
  light.target.position.set(0, 0, 0).addScaledVector(x, fx).addScaledVector(y, fy).addScaledVector(dir, fz);
  light.position.copy(light.target.position).addScaledVector(dir, dist);
  light.target.updateMatrixWorld();
  light.updateMatrixWorld();
}
const _d = new THREE.Vector3(), _x = new THREE.Vector3(), _y = new THREE.Vector3();
