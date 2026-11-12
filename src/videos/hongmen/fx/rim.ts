// THE RIM LIGHT on the heads of the Hongmen film, set from OUR side (the rig, group/kit/rig3d.ts, is another team's
// and is not edited). The rig draws a rim arc on every head: `const RIM = [0.87, 0.4, 0.08, 0.3]` (a gold line, the
// uniform uRim of the head material, mixed over skin and hair at 0.7). In the dark tent that gold stripe reads as
// painted on. Here it becomes a SOFT COOL-WHITE edge light:
//   softRim(root)   root = the scene, a figure's group (rig.group) or anything above them: every head material found
//                   under it gets (1) uRim = RIM_SOFT.col (slightly cool white) at RIM_SOFT.at, and (2) a guarded patch
//                   of its fragment shader: the line is LIGHT ONLY (max with what is there: it can never darken skin),
//                   its strength is RIM_SOFT.alpha over dark hair and falls to RIM_SOFT.alpha * (1 - RIM_SOFT.pale) on
//                   pale skin, and its profile is feathered: brightest just inside the outline, fading out toward
//                   the middle of the head over a sixth of the head's radius (no line of constant width).
//                   Safe to call any number of times (a material is patched once); cheap.
// Where it is called (so that no figure can miss it):
//   people.ts addPerson()                      every figure of the film, the opening preview, the line-up: the film's
//                                              World.actor() and every preview that uses the cast go through it
//   preview/common.ts, preview/sheet_common.ts once per drawn frame on the whole scene: the sheets that add bare
//                                              figures with rc.add()
// If the rig's shader text changes, the patch does NOTHING (the uniform alone still turns the line white, at the rig's
// own 0.7) and says so once on the console: "[hongmen] rim: ...".
//
// The same mechanism (editHeadShader) carries the other change this film makes to the head material: acc/facehair.ts
// lets the painted HAIR lie over the face drawing at the sides of the face (a beard's sideburn runs up under the hair).
import * as THREE from "three";

/** the film's rim light: light that catches the edge of the head on the lit side. col = linear RGB; alpha = how
 *  visible at its brightest over dark hair (0..1); pale = how much of it is taken away on a surface as light as the
 *  light itself (pale skin: 0.82 leaves under a fifth); in / peak / to = its profile across the edge, as the rig's
 *  "facing" (0 = the outline itself, 1 = the middle of the head): nothing at `in` (under the ink outline), brightest
 *  at `peak` (just inside the outline), then a long feathered fall to nothing at `to`. No hard side anywhere: it is
 *  not a stripe of constant width (round 1's was; viewers read it as painted on). at = the rig's own uniform (unused
 *  by the soft profile; only has to be above zero) */
export const RIM_SOFT = { col: [0.86, 0.92, 1.0] as [number, number, number], at: 0.27, alpha: 0.46, pale: 0.82, in: 0.03, peak: 0.15, to: 0.52 };

type Edit = { id: string; edit: (frag: string) => string | null; uniforms?: Record<string, { value: unknown }>; onUniforms?: (u: Record<string, { value: any }>) => void };
type HeadMat = THREE.Material & { userData: { hmEdits?: Edit[] } };
const warned = new Set<string>();

/** true for the rig's head material (the one that draws skin, hair and the face: rig3d rigMat kind "face") */
export const isHeadMaterial = (m: unknown): m is THREE.Material => {
  const k = (m as THREE.Material | undefined)?.customProgramCacheKey;
  return typeof k === "function" && String(k.call(m)).startsWith("rig3-face");
};
/** every head material under root */
export const headMaterials = (root: THREE.Object3D): THREE.Material[] => {
  const out: THREE.Material[] = [];
  root.traverse((o) => {
    const m = (o as THREE.Mesh).material as THREE.Material | THREE.Material[] | undefined;
    for (const x of Array.isArray(m) ? m : m ? [m] : []) if (isHeadMaterial(x) && !out.includes(x)) out.push(x);
  });
  return out;
};
/** Adds one edit of the head material's FRAGMENT shader (and uniforms for it), by id: at most once per material.
 *  edit(frag) returns the changed text, or null when the text it expects is not there: then nothing is changed and one
 *  warning is printed. onUniforms sees the program's uniforms (the rig's own objects: uRim, uHair ...) at compile time.
 *  Works whether or not the material was drawn before. */
export const editHeadShader = (mat: THREE.Material, e: Edit): boolean => {
  const m = mat as HeadMat;
  if (m.userData.hmEdits?.some((x) => x.id === e.id)) return false;
  if (!m.userData.hmEdits) {
    const edits: Edit[] = (m.userData.hmEdits = []), base = m.onBeforeCompile, baseKey = m.customProgramCacheKey;
    m.onBeforeCompile = function (this: THREE.Material, sh, renderer) {
      base.call(this, sh, renderer);
      for (const x of edits) {
        const out = x.edit(sh.fragmentShader);
        // (onUniforms runs either way: it only sets the rig's OWN uniforms, which exist whatever the shader text is)
        x.onUniforms?.(sh.uniforms as Record<string, { value: any }>);
        if (out === null) { if (!warned.has(x.id)) { warned.add(x.id); console.warn(`[hongmen] ${x.id}: the rig's head shader has changed (the expected text is not there): this shader edit is OFF`); } continue; }
        sh.fragmentShader = out;
        if (x.uniforms) Object.assign(sh.uniforms, x.uniforms);
      }
    };
    m.customProgramCacheKey = function (this: THREE.Material) { return baseKey.call(this) + "|hm:" + edits.map((x) => x.id).join("+"); };
  }
  m.userData.hmEdits!.push(e);
  m.needsUpdate = true;
  return true;
};

// the three places of the rig's fragment shader the rim patch needs (rig3d.ts FRAG_DECL / FRAG_SHADE, kind "face")
const DECL = "uniform vec4 uRim;";
const LINE = "float rl = ( 1.0 - smoothstep( rd - 0.5 * rw, rd + 0.5 * rw, abs( ndv - uRim.w ) ) ) * clamp( 2.0 * rd / rw - 0.6, 0.0, 1.0 );";
const MIX = "col = mix( col, uRim.rgb * uTint, 0.7 * rl * gAll * smoothstep( 0.2, 0.62, rs ) * step( 1e-3, uRim.w ) );";
const LUMA = "vec3( 0.2126, 0.7152, 0.0722 )";
/** uHmRim = (alpha, pale, peak, to) */
const rimEdit = (frag: string): string | null => {
  if (!frag.includes(DECL) || !frag.includes(LINE) || !frag.includes(MIX)) return null;
  return frag
    .replace(DECL, DECL + " uniform vec4 uHmRim;")
    // a feathered profile: up from the outline to its brightest just inside it, then a long soft fall toward the
    // middle of the head; gone before the whole band is thinner than about two pixels (a small, far head)
    .replace(LINE, `float rl = smoothstep( ${RIM_SOFT.in.toFixed(3)}, uHmRim.z, ndv ) * pow( 1.0 - smoothstep( uHmRim.z, uHmRim.w, ndv ), 2.0 ) * clamp( 0.5 * ( uHmRim.w - uHmRim.z ) / rw - 0.6, 0.0, 1.0 );`)
    // light only (never darker than what is there), weaker the lighter the surface already is
    .replace(MIX, `{ vec3 hmC = uRim.rgb * uTint; float hmL = dot( col, ${LUMA} ) / max( dot( hmC, ${LUMA} ), 1e-3 );
      col = mix( col, max( col, hmC ), uHmRim.x * ( 1.0 - uHmRim.y * smoothstep( 0.3, 0.9, hmL ) ) * rl * gAll * smoothstep( 0.2, 0.62, rs ) * step( 1e-3, uRim.w ) ); }`);
};
const RIM_U = { uHmRim: { value: new THREE.Vector4(RIM_SOFT.alpha, RIM_SOFT.pale, RIM_SOFT.peak, RIM_SOFT.to) } };

/** The film's soft white rim light on every head under `root` (see the head of this file). Returns how many head
 *  materials it changed in this call. opts.off = leave the rig's own gold line (for a before / after picture). */
export const softRim = (root: THREE.Object3D, opts: { off?: boolean } = {}): number => {
  if (opts.off) return 0;
  let n = 0;
  for (const m of headMaterials(root)) {
    if (editHeadShader(m, {
      id: "rim", edit: rimEdit, uniforms: RIM_U,
      // (uRim is the figure's own uniform object: set here it stays set)
      onUniforms: (u) => { (u.uRim?.value as THREE.Vector4 | undefined)?.set(RIM_SOFT.col[0], RIM_SOFT.col[1], RIM_SOFT.col[2], RIM_SOFT.at); },
    })) n++;
  }
  return n;
};
