// FIGURE FIXES of 采访罗密欧与朱丽叶: what a kit Look cannot say, put on a figure the rig has built (people.ts addPerson).
// The rig (group/kit/rig3d.ts) is read only; this reaches the figure's own materials the way 苏东坡's limbColours does,
// and is guarded: if the rig's insides are not as expected it does nothing but print one line.
//   legColours(rig, { leg, foot })   HOSE AND BOOTS. The rig draws both legs and both feet near-ink (LIMB_COL). leg =
//              the leg tubes' colour (Romeo's hose), foot = the feet's (his boots). Only colours change.
import * as THREE from "three";
import type { Rig } from "../../group/kit/rig3d";

type RigInner = { limbs?: { geo: THREE.BufferGeometry }[]; feet?: THREE.Group[] };
const recolour = (m: THREE.Material, col: string) => {
  const b = m as THREE.MeshBasicMaterial;
  if (!b.color) return;
  b.color.set(col);
  const c = new THREE.Color(col).convertLinearToSRGB(), luma = 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b;
  if (luma > 0.3 && !m.userData.rjStripe) {
    // (the highlight stripe the rig puts on limbs is made for near-ink: tone it down on a light colour)
    m.userData.rjStripe = true;
    const base = m.onBeforeCompile;
    m.onBeforeCompile = function (this: THREE.Material, sh, renderer) {
      base.call(this, sh, renderer);
      const u = sh.uniforms as Record<string, { value: THREE.Vector4 } | undefined>;
      if (u.uStripe) u.uStripe = { value: new THREE.Vector4(1.16, 1.16, 1.13, u.uStripe.value.w) };
    };
    m.needsUpdate = true;
  }
};
export const legColours = (r: Rig, o: { leg?: string; foot?: string }): boolean => {
  const rr = r as unknown as RigInner, limbs = rr.limbs, feet = rr.feet;
  if (!limbs || limbs.length !== 4 || !feet || feet.length !== 2) { console.log("QA: legColours: the rig's limbs are not as expected (rig3d.ts changed?): the legs keep the rig's colour"); return false; }
  const done = new Set<THREE.Material>();
  if (o.leg) r.group.traverse((o3) => {
    const m = o3 as THREE.Mesh;
    if (!m.isMesh || (m.geometry !== limbs[2].geo && m.geometry !== limbs[3].geo) || Array.isArray(m.material)) return;
    if (m.material.customProgramCacheKey() !== "rig3-tube" || done.has(m.material)) return;
    done.add(m.material); recolour(m.material, o.leg!);
  });
  if (o.foot) for (const fg of feet) {
    const foot = fg.children[0] as THREE.Mesh | undefined;
    if (foot?.isMesh && !Array.isArray(foot.material) && !done.has(foot.material)) { done.add(foot.material); recolour(foot.material, o.foot); }
  }
  return done.size > 0;
};

/** A BALD HEAD (the Friar, v2): the rig paints the hair on the head ball from a lookup of how far down the hair goes at
 *  each azimuth (rig3d.ts uHair); this swaps in a lookup of 0 everywhere, so no hair is painted at all (his ring of hair
 *  is 3D tufts: acc/head.ts hairRing). Call once after the rig built the figure. Guarded like napeHair. */
type RigHair = { faceU?: { uHair?: { value: THREE.Texture } } };
let baldTex: THREE.DataTexture | null = null;
export const baldHead = (r: Rig): boolean => {
  const u = (r as unknown as RigHair).faceU?.uHair;
  if (!u || !(u.value instanceof THREE.DataTexture)) { console.log("QA: baldHead: the rig's head has no uHair lookup (rig3d.ts changed?): the hair stays"); return false; }
  if (!baldTex) {
    const N = 256, data = new Uint8Array(N * 4);
    for (let k = 0; k < N; k++) data[k * 4 + 3] = 255;   // (16 bits of deg / 180 in R and G: all 0 = no hair anywhere)
    baldTex = new THREE.DataTexture(data, N, 1, THREE.RGBAFormat, THREE.UnsignedByteType);
    baldTex.wrapS = THREE.RepeatWrapping; baldTex.magFilter = THREE.NearestFilter; baldTex.minFilter = THREE.NearestFilter; baldTex.generateMipmaps = false; baldTex.needsUpdate = true;
  }
  u.value = baldTex;
  return true;
};
