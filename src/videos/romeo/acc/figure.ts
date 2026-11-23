// FIGURE FIXES of 采访罗密欧与朱丽叶: what a kit Look cannot say, put on a figure the rig has built (people.ts addPerson).
// The rig (group/kit/rig3d.ts) is read only; this reaches the figure's own materials the way 苏东坡's limbColours does,
// and is guarded: if the rig's insides are not as expected it does nothing but print one line.
//   legColours(rig, { leg, foot })   HOSE AND BOOTS. The rig draws both legs and both feet near-ink (LIMB_COL). leg =
//              the leg tubes' colour (Romeo's hose), foot = the feet's (his boots). Only colours change.
//   fineHead(rig, { w, thick })      A FINER HEAD OUTLINE (Juliet): the head's ink line, thinner and more even.
//   freeDepth(rig)                   the parts an accessory marked (acc/hair.ts markFreeDepth) are drawn at their true
//              depth against the figure's own body (the hair at Romeo's nape).
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

/** A FINER HEAD OUTLINE (v5, 23 Nov 2026, the owner on the v4 cut: "Juilet's jaw black line is always so thick, make it
 *  more thin, feminine"). The rig inks a head with a brush line: 2.1 cm wide, x 1.63 underneath and on the side away
 *  from the light (3.4 cm under the chin), x 0.37 on top. This sets the width `w` (m) and the brush's swell `thick`
 *  (0 = the same all round) of THIS figure's head line, on the line's own materials (the hull and its depth twin).
 *  Call once after the rig built the figure. Guarded like legColours. */
type RigHead = { skinPts?: ArrayLike<number> };
export const fineHead = (r: Rig, o: { w: number; thick: number }): boolean => {
  const pts = (r as unknown as RigHead).skinPts;
  let skin: THREE.Mesh | null = null;
  if (pts) r.group.traverse((o3) => { const m = o3 as THREE.Mesh; if (m.isMesh && !m.userData.hull && !m.userData.depthOnly && m.geometry.attributes.position?.array === pts) skin = m; });
  const hulls = skin ? (skin as THREE.Mesh).children.filter((c) => c.userData.hull && (c as THREE.Mesh).isMesh) as THREE.Mesh[] : [];
  let n = 0;
  for (const h of hulls) {
    const m = h.material;
    if (Array.isArray(m) || m.customProgramCacheKey() !== "rig3-hull") continue;
    const base = m.onBeforeCompile;
    m.onBeforeCompile = function (this: THREE.Material, sh, renderer) {
      base.call(this, sh, renderer);
      const u = sh.uniforms as Record<string, { value: number } | undefined>;
      if (u.uW) u.uW = { value: o.w };
      if (u.uThick) u.uThick = { value: o.thick };
    };
    m.needsUpdate = true; n++;
  }
  if (!n) console.log("QA: fineHead: the rig's head line is not as expected (rig3d.ts changed?): the head keeps the rig's line");
  return n > 0;
};

/** THE PARTS AT THEIR TRUE DEPTH (acc/hair.ts FREE_DEPTH): every part an accessory marked, with its ink line, loses the
 *  rig's stencil test (the rule that puts a head on top of its own body) and keeps only the depth test. Call once
 *  after the rig built the figure. */
export const freeDepth = (r: Rig): number => {
  let n = 0;
  r.group.traverse((o3) => {
    const m = o3 as THREE.Mesh;
    if (!m.isMesh || m.userData.depthOnly || !(m.userData.rjFreeDepth || m.parent?.userData.rjFreeDepth)) return;
    for (const mat of Array.isArray(m.material) ? m.material : [m.material]) { mat.stencilWrite = false; mat.needsUpdate = true; }
    m.renderOrder = 1; n++;
  });
  return n;
};
