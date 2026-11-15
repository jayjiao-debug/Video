// wash.ts: THE SEPIA WASH of the frozen frame for skin A's lead card (stage 1; freeze.ts washAt, Film.tsx). On
// the card's frames the SET and its PROPS turn into a sepia ink drawing on laid paper while every FIGURE (Newton) and
// the quill in his hand stay in full colour, as in the approved frame looks/frames/A_card.png. Picture side (it changes
// the 3D render), so it lives outside hud/ (kit.json domOnly: hud/ never touches the picture).
//
// HOW (the cheapest robust way in this engine): every material under the set's and the props' groups gets ONE chained
// fragment edit (the kit's pattern, src/kit/fx/rim.ts: the material's own onBeforeCompile runs first, its program
// cache key is kept and suffixed), added the first time a frame needs the wash. The edit is a branch on a shared
// uniform: with uMsWash = 0 it does nothing (the frames before and after are drawn exactly as before), with uMsWash > 0
// it maps the surface's light to a ramp from iron-gall ink to laid paper and lays the paper's chain lines (every 104 px
// of the 1080-wide frame), laid lines, fibres and foxing over it in screen space, behind a page-turn front (uMsSweep:
// from the top right to the bottom left). The figures are never edited (the rig's own shaders), so they keep their
// colour without any matte; the ink pass's outlines stay on top of the washed set, which reads as an ink drawing.
// The background colour goes to the paper with it (Pose.post.bg). Materials whose shader has no "#include
// <dithering_fragment>" (a raw ShaderMaterial) are left in colour.
// Cost: the first washed frame on a page compiles the edited programs once (a page that renders no card frame never
// edits a material); later frames change two uniforms.
//
//   msWash(w, s, keep?)       on every frame after the Director posed it: s = freeze.ts washAt(f) (null = no wash);
//                             keep = prop names that stay in colour (default: the quill in his hand)
//   msWashBg(bg, s)           the frame's background colour under the wash
import * as THREE from "three";
import type { World } from "./world";
import type { PropName } from "./props";

/** the skin's laid paper (= hud/ms/skin.ts MS.paper; hud/ms/check.ts checks they agree: the picture side never imports
 *  hud/) */
export const WASH_PAPER = "#F1E4C3";

const EDIT = "newton-ms-wash1";
const lin = (hex: string) => new THREE.Color(hex);           // THREE.Color(hex) converts sRGB to the linear working space
/** the shared uniforms of every edited program (one object each: setting .value reaches them all) */
const U = {
  uMsWash: { value: 0 },
  uMsSweep: { value: 0 },
  uMsRes: { value: new THREE.Vector2(1080, 1920) },
  /** the paper and the ink of the ramp (linear) */
  uMsPaper: { value: lin(WASH_PAPER) },
  uMsInk: { value: lin("#4a3826") },
};
const DECL = `uniform float uMsWash; uniform float uMsSweep; uniform vec2 uMsRes; uniform vec3 uMsPaper; uniform vec3 uMsInk;
float msHash( vec2 p ) { return fract( sin( dot( p, vec2( 12.9898, 78.233 ) ) ) * 43758.5453 ); }
float msNoise( vec2 p ) { vec2 i = floor( p ), f = fract( p ); vec2 u = f * f * ( 3.0 - 2.0 * f );
  return mix( mix( msHash( i ), msHash( i + vec2( 1.0, 0.0 ) ), u.x ), mix( msHash( i + vec2( 0.0, 1.0 ) ), msHash( i + vec2( 1.0, 1.0 ) ), u.x ), u.y ); }
`;
// film px (1080 wide, y down) from the fragment's place in the render target, in the approved 9:15 frame's rows (the
// 1920 frame's row minus 60: the paper's grain and the front lie on the picture exactly as approved; the 60 px strips
// above and below take the same paper); the front d runs 0 (top right) .. 1 (bottom left); behind it the surface's
// light (linear, before tone mapping) is mapped to the ink -> paper ramp
const BODY = `
if ( uMsWash > 0.0 ) {
  vec2 msQ = gl_FragCoord.xy / uMsRes;
  vec2 msP = vec2( msQ.x * 1080.0, ( 1.0 - msQ.y ) * 1920.0 - 60.0 );
  float msD = ( 1080.0 - msP.x ) / 1080.0 * 0.45 + msP.y / 1800.0 * 0.55;
  float msF = uMsSweep * 1.12 - 0.06;
  float msW = ( 1.0 - smoothstep( msF - 0.05, msF + 0.05, msD ) ) * uMsWash;
  if ( msW > 0.0 ) {
    float msL = dot( gl_FragColor.rgb, vec3( 0.2126, 0.7152, 0.0722 ) );
    float msT = clamp( 0.14 + 0.92 * pow( msL / ( msL + 0.2 ), 0.85 ), 0.0, 1.0 );
    vec3 msC = mix( uMsInk, uMsPaper, msT );
    float msChain = 1.0 - smoothstep( 0.0, 1.3, abs( mod( msP.x, 104.0 ) - 52.0 ) );
    float msLaid = 0.5 + 0.5 * sin( msP.y * 1.2566 );
    float msFib = msNoise( vec2( msP.x * 0.9, msP.y * 0.06 ) );
    float msFox = smoothstep( 0.6, 0.86, msNoise( msP * 0.012 ) * 0.62 + msNoise( msP * 0.031 + 7.0 ) * 0.38 );
    msC *= 1.0 - 0.13 * msChain - 0.025 * msLaid - 0.07 * ( msFib - 0.5 );
    msC = mix( msC, msC * vec3( 0.84, 0.72, 0.55 ), msFox * 0.35 );
    gl_FragColor.rgb = mix( gl_FragColor.rgb, msC, msW );
  }
}
`;
const done = new WeakSet<THREE.Material>();
const DEFAULT_KEY = THREE.Material.prototype.customProgramCacheKey;
/** add the wash edit to one material (once) */
const edit = (m: THREE.Material) => {
  if (done.has(m)) return;
  done.add(m);
  if ((m as THREE.ShaderMaterial).isShaderMaterial) return;            // raw shaders: no standard chunks, left in colour
  const base = m.onBeforeCompile, baseKey = m.customProgramCacheKey;
  // the material's own key, as three would have made it (the default key is its onBeforeCompile's source)
  const key0 = baseKey === DEFAULT_KEY ? () => base.toString() : () => baseKey.call(m);
  m.onBeforeCompile = function (this: THREE.Material, sh, r) {
    base.call(this, sh, r);
    if (!sh.fragmentShader.includes("#include <dithering_fragment>") || !sh.fragmentShader.includes("void main()")) return;
    Object.assign(sh.uniforms, U);
    sh.fragmentShader = sh.fragmentShader.replace("void main()", DECL + "void main()").replace("#include <dithering_fragment>", "#include <dithering_fragment>\n" + BODY);
  };
  m.customProgramCacheKey = () => key0() + "|" + EDIT;
  m.needsUpdate = true;
};
const editAll = (root: THREE.Object3D, skip: Set<THREE.Object3D>) => {
  const walk = (o: THREE.Object3D) => {
    if (skip.has(o)) return;
    const mat = (o as THREE.Mesh).material as THREE.Material | THREE.Material[] | undefined;
    if (mat) for (const x of Array.isArray(mat) ? mat : [mat]) edit(x);
    for (const c of o.children) walk(c);
  };
  walk(root);
};
const _buf = new THREE.Vector2();
/** THE WASH on this frame (call it after the Director posed the frame): s = freeze.ts washAt(f), null = none */
export const msWash = (w: World, s: { k: number; sweep: number } | null, keep: PropName[] = ["quill"]) => {
  if (!s || s.k <= 0 || s.sweep <= 0) { U.uMsWash.value = 0; return; }
  const skip = new Set<THREE.Object3D>(keep.map((n) => w.prop(n).group));
  editAll(w.set.group, skip);
  editAll(w.props.group, skip);
  w.gl.getDrawingBufferSize(_buf);
  if (_buf.x > 0 && _buf.y > 0) U.uMsRes.value.copy(_buf);
  U.uMsWash.value = s.k;
  U.uMsSweep.value = s.sweep;
};
/** the frame's background under the wash (Pose.post.bg): toward the paper as the front passes the frame's middle */
export const msWashBg = (bg: string, s: { k: number; sweep: number } | null): string => {
  if (!s) return bg;
  const a = s.k * Math.min(1, Math.max(0, (s.sweep - 0.3) / 0.4));
  return "#" + new THREE.Color(bg).lerp(new THREE.Color(WASH_PAPER), a).getHexString();
};
