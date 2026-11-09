// Dorm set for 《你的朋友，有几个也把你当朋友？》: a Chinese university four-person room (四人间, 上床下桌) on the 4th floor of
// a dorm block, built in code as a game-asset interior, plus the outside: our block's facade, a 3-storey block 18 m across
// a yard (the friend's lit window on its top storey; the block is turned 32 deg about that window toward the -x end of
// the yard so the end shot sees both hero windows), the yard, far blocks and a sky dome. The room is 3.6 m x 6 m: two
// loft units (bed over desk, shelves, ladder) on each long wall, tall steel lockers by the entrance door (a corridor
// outside), a sliding window and a glazed French door (Juliet railing, drying rack with laundry) in the far wall.
// Hero props: the phone face up on your desk (a prop group with a swappable screen), the laptop on desk 3, noodles,
// fairy lights on bunk 3, the bed curtain on bunk 2, posters, a calendar, sneakers, a guitar, desk lamps.
//
// v2 (this file; v1 is backed up as friends/backup/dorm_v1.ts): light states and a time-lapse, the opening window,
// the outside, the line-02 ladder post, perches for ten friends + you, your bunk / desk / phone / door anchors, more
// 9:16 cams, collision proxies and checked rope routes. The approved evening look (v1 wide_final) is the default state.
//
//   const M = mats(makeEnv(gl), makeEnv(gl, DORM_FILL));
//   const D = buildDorm(M, { renderer: gl });   // renderer: bakes the day / night / sky PMREMs (~0.6 s on SwiftShader)
//   scene.add(D.group); camera.layers.enable(NOINK) (glass, sky, halos, spill cards live on NOINK, as InkPass expects)
//   per frame: D.setLight("evening" | "dawn" | "day" | "night") or D.setTime(u) (pure functions of their inputs), then
//   D.animate(t) (fan, laundry sway, fairy-light twinkle). Cams: D.cams[name] -> camera.up.set(...(up ?? [0,1,0]));
//   camera.position.set(...pos); camera.lookAt(...look); camera.rotateZ(roll ?? 0); fov; near ?? your default.
//
// Light: setLight("evening") = lines 01-02 / 18-19 (battens + four warm desk lamps on the lights-on fill DORM_FILL, a
// deep blue-violet dusk in the window, the facade windows lit); "dawn" = lines 11-16 (lamps off, a cool window key and
// sun-shadowed mullions on the floor, a peach / grey-blue morning outside); setTime(u) = line 17's time-lapse from
// dawn (0) through noon (.5) and sunset (.8) to night (1): the sun rises behind the block (cool dawn, no sun patch),
// stands high left of the window at noon (patch by the window) and sets almost straight in front of it (a long orange
// streak down the aisle at .8); sky, window fill, facade windows and street lamps follow, your desk lamp clicks on at
// u = .93 (o.lampAt), o.roommates / o.battens bring the others on after it. Interior / exterior materials share two env rigs (envRigs) that cross-fade
// the day / night PMREMs and tint them; all lights always exist (fixed count, no recompiles), off ones skip shadows.
// Outside: setWindowOpen(u) slides the right sash over the left (0 closed .. 1 = .62 x 1.4 m aperture; .385 approved),
// setDoorOpen / setFrenchDoorOpen, setFriend({ lit, figure }) (the friend's room + silhouette), setFacade(f) (fraction
// of facade windows lit; e.g. .1 for the end shot), setLamps([...]) per desk lamp. At night both hero windows carry a
// warm halo + core sprite and a spill card on the wall (NOINK; faded out for cameras within ~6-12 m of the window), and
// the exterior env rig dims direct light on the facades (envRigs.exterior.direct) so the moon key does not floodlight
// our block. End shot: cams.exterior (alt. exteriorHigh); the rope needs to be thick / glowing to read at 25-30 m.
// Anchors (anchors.*): perches (17 spots with pose / facing / clearance / grip / cams; the 10 flagged line01 + you are
// all visible together in cams.hookEnd and checked against colliders), you / youFacing, ladderPost (line 02 knot),
// youBunk, youDesk, phone, door / doorInside, window (aperture, openX(u)), friendWindow (world centre / normal / rope
// hand; aperture in the turned block's frame via toLocal), routeOut (phone -> window -> the friend's hand, line 19) and
// routeIn (outside -> window -> your bunk rail, line 11): polylines checked clear of the colliders and through both apertures (preview/dorm_v2_common.ts routeCheck).
// colliders: pre-merge world boxes of furniture / props ("support" = seats, bedding, rungs) for 穿模 checks (walls and
// the moving leaves / sash excluded). Static meshes are merged per material (a few hundred draw calls with the outside).
//
// Systems reused from the backtest kit: pbr.ts materials (mats(): paint / wood / metalWith), woodtex.ts (railCap /
// carriageWood timber, woodMaps, metricUV, edgeWear, the albedo + packed height/roughness sheet convention). The sheets
// below follow woodtex's convention: an sRGB albedo plus ONE linear map with height in R and roughness in G.
// Scale: metres, floor y = 0, ceiling 3.0, desks 0.765, bed mattress top 1.775, doors 2.1-2.15, window sill 0.9 (deep
// sill board to z -2.7), outside ground -10.35. Deterministic (seeded RNG; state setters are pure functions of input).
import * as THREE from "three";
import { mergeGeometries, mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { makeEnv, type Mats, type EnvSpec } from "../../bt/pbr";
import { NOINK } from "../../vasa/ink";
import * as W from "../../bt/woodtex";

type RGB = [number, number, number];
type V3 = [number, number, number];
export type Cam = { pos: V3; look: V3; fov: number; roll?: number; up?: V3; /** suggested camera.near (exterior cams: keep the depth buffer tight at 20-40 m) */ near?: number };

// ============================================================================================================
// light environment + post numbers for this set
// ============================================================================================================
/** the room's diffuse fill for mats(env, DORM_FILL) with the ceiling battens ON (the default, opts.overhead true):
 *  an evening room lit from the ceiling, warm cream bounce off the walls and tiled floor, a bright warm ceiling band
 *  overhead, a small cool dusk glow from the balcony end (-z) and warm bounce from the lamp-lit desks. */
export const DORM_FILL: EnvSpec = {
  frame: "world",
  stops: [
    [-90, [0.3, 0.25, 0.2]], [-35, [0.3, 0.255, 0.205]], [-8, [0.34, 0.3, 0.26]], [6, [0.38, 0.35, 0.31]],
    [40, [0.44, 0.41, 0.37]], [90, [0.5, 0.47, 0.42]],
  ],
  boxes: [
    { az: 0, el: 75, rot: 90, w: 12, h: 50, soft: 22, col: [0.9, 0.84, 0.72] },     // the batten lights + lit ceiling
    { az: -90, el: 12, rot: 0, w: 26, h: 20, soft: 14, col: [0.3, 0.33, 0.62] },    // balcony window: cool dusk
    { az: 180, el: -10, rot: 0, w: 55, h: 26, soft: 28, col: [0.46, 0.34, 0.22] },  // warm bounce from the left desks
    { az: 0, el: -10, rot: 0, w: 55, h: 26, soft: 28, col: [0.46, 0.34, 0.22] },    // and the right desks
    { az: 90, el: 5, rot: 0, w: 40, h: 30, soft: 25, col: [0.42, 0.38, 0.33] },     // door end
  ],
};
/** the lamp-only night fill (opts.overhead false): dim warm walls and floor bounce, a cool blue-violet glow from the
 *  balcony end (-z) and warm bounce from the lamp-lit desks on both long walls. */
export const DORM_FILL_NIGHT: EnvSpec = {
  frame: "world",
  stops: [
    [-90, [0.11, 0.1, 0.11]], [-30, [0.115, 0.105, 0.115]], [-5, [0.135, 0.13, 0.155]], [10, [0.15, 0.15, 0.185]],
    [45, [0.14, 0.14, 0.185]], [90, [0.13, 0.13, 0.175]],
  ],
  boxes: [
    { az: -90, el: 14, rot: 0, w: 30, h: 24, soft: 14, col: [0.26, 0.29, 0.6] },  // balcony window: cool dusk
    { az: 180, el: -12, rot: 0, w: 55, h: 26, soft: 28, col: [0.36, 0.25, 0.15] }, // warm bounce from the left desks
    { az: 0, el: -12, rot: 0, w: 55, h: 26, soft: 28, col: [0.36, 0.25, 0.15] },   // and the right desks
    { az: 90, el: 0, rot: 0, w: 40, h: 30, soft: 25, col: [0.22, 0.2, 0.21] },     // door end
  ],
};
/** N8AO / bloom numbers the previews use for this interior (tighter AO radius than the open deck) */
export const DORM_POST = {
  ao: { aoRadius: 0.4, distanceFalloff: 1.0, intensity: 2.4, color: "#22140c" },
  bloom: { luminanceThreshold: 1.0, intensity: 0.45 },
};
/** daylight fill for the room (dawn / day / the setTime time-lapse): soft light from the window end (-z), dimmer
 *  ceiling and wall bounce, a darker floor. Neutral; setTime() tints it per hour (dawn cool and dim, noon warm white). */
export const DORM_FILL_DAY: EnvSpec = {
  frame: "world",
  stops: [
    [-90, [0.2, 0.19, 0.18]], [-30, [0.22, 0.21, 0.2]], [-5, [0.27, 0.27, 0.27]], [10, [0.32, 0.33, 0.35]],
    [45, [0.35, 0.36, 0.38]], [90, [0.37, 0.38, 0.4]],
  ],
  boxes: [
    { az: -90, el: 14, rot: 0, w: 34, h: 30, soft: 16, col: [1.25, 1.3, 1.4] },   // the window + French door
    { az: -90, el: -25, rot: 0, w: 50, h: 22, soft: 20, col: [0.5, 0.48, 0.45] },  // lit floor bounce by the window
    { az: 0, el: 70, rot: 90, w: 30, h: 60, soft: 25, col: [0.42, 0.42, 0.42] },   // ceiling bounce
    { az: 180, el: 0, rot: 0, w: 50, h: 30, soft: 25, col: [0.36, 0.34, 0.32] },   // the left wall's bounce
    { az: 0, el: 0, rot: 0, w: 50, h: 30, soft: 25, col: [0.36, 0.34, 0.32] },     // the right wall's
  ],
};
/** outdoor sky fill for the two dorm blocks, the yard and the far blocks (setTime() tints it per hour) */
export const DORM_SKY: EnvSpec = {
  frame: "world",
  stops: [[-90, [0.15, 0.15, 0.14]], [-5, [0.3, 0.3, 0.3]], [5, [0.62, 0.68, 0.78]], [40, [0.72, 0.8, 0.95]], [90, [0.78, 0.86, 1.0]]],
  boxes: [],
};

// ============================================================================================================
// time of day: every PBR material of the set gets two env slots + a mix + a tint (shared uniforms, no recompiles)
// ============================================================================================================
/** shared uniforms of one env rig: indirect light = mix(envA, envB, mix) x tint (envA/envB: PMREMs of the same size) */
export type EnvRig = { tint: { value: THREE.Color }; mix: { value: number }; a: { value: THREE.Texture | null }; b: { value: THREE.Texture | null };
  /** multiplier on direct light (the sun / moon key, window fill) for the rig's materials: the exterior rig dims it at
   *  night so the moon key that lights the room through the window does not floodlight our facade */
  direct: { value: number } };
const ENV_PARS = `uniform sampler2D dEnvA; uniform sampler2D dEnvB; uniform float dEnvMix;
#if defined( USE_ENVMAP ) && defined( ENVMAP_TYPE_CUBE_UV )
vec4 dormEnv( vec3 d, float r ) { return mix( textureCubeUV( dEnvA, d, r ), textureCubeUV( dEnvB, d, r ), dEnvMix ); }
#endif
` + THREE.ShaderChunk.envmap_physical_pars_fragment.replace(/textureCubeUV\( envMap,/g, "dormEnv(");
/** chains onto the material's onBeforeCompile (groundAO, edgeWear, the metals' matcap): the env lookups read the rig's
 *  two PMREMs mixed, and all image-based light (env + matcap) is multiplied by the rig's tint */
const patchEnv = (m: THREE.MeshStandardMaterial, rig: EnvRig, tag: string) => {
  if (m.userData.dormEnv) return;
  m.userData.dormEnv = tag;
  const prev = m.onBeforeCompile, prevKey = m.customProgramCacheKey.call(m);
  m.onBeforeCompile = function (this: THREE.Material, sh, r) {
    prev.call(this, sh, r);
    Object.assign(sh.uniforms, { dEnvA: rig.a, dEnvB: rig.b, dEnvMix: rig.mix, dEnvTint: rig.tint, dEnvDirect: rig.direct });
    sh.fragmentShader = sh.fragmentShader
      .replace("#include <common>", "#include <common>\nuniform vec3 dEnvTint; uniform float dEnvDirect;")
      .replace("#include <envmap_physical_pars_fragment>", ENV_PARS)
      .replace("#include <lights_fragment_end>", "iblIrradiance *= dEnvTint; radiance *= dEnvTint; reflectedLight.directDiffuse *= dEnvDirect; reflectedLight.directSpecular *= dEnvDirect;\n#include <lights_fragment_end>");
  };
  m.customProgramCacheKey = () => prevKey + "|dormEnv2";
  m.needsUpdate = true;
};
const sstep = (a: number, b: number, x: number) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/** piecewise-linear keyframes over u (ascending) of number arrays */
const keyed = (keys: [number, number[]][], u: number): number[] => {
  if (u <= keys[0][0]) return keys[0][1].slice();
  for (let i = 1; i < keys.length; i++) {
    const [u1, v1] = keys[i];
    if (u <= u1) { const [u0, v0] = keys[i - 1], t = (u - u0) / (u1 - u0); return v0.map((v, k) => lerp(v, v1[k], t)); }
  }
  return keys[keys.length - 1][1].slice();
};
const lin = (hexs: string) => { const c = new THREE.Color(hexs); return [c.r, c.g, c.b]; };

// ============================================================================================================
// canvas infrastructure (same conventions as bt/woodtex.ts)
// ============================================================================================================
type G2 = CanvasRenderingContext2D;
const CTX: CanvasRenderingContext2DSettings = { willReadFrequently: true };
const mkCanvas = (w: number, h: number) => { const c = document.createElement("canvas"); c.width = w; c.height = h; return c; };
/** mulberry32 */
const rng = (seed: number) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0; let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};
const clamp = (x: number, a = 0, b = 255) => Math.max(a, Math.min(b, x));
const css = (c: RGB, a = 1) => `rgba(${clamp(c[0]) | 0},${clamp(c[1]) | 0},${clamp(c[2]) | 0},${a.toFixed(3)})`;
const grey = (v: number, a = 1) => css([v, v, v], a);
const mul = (c: RGB, k: number): RGB => [c[0] * k, c[1] * k, c[2] * k];
const mixc = (a: RGB, b: RGB, k: number): RGB => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
const hex = (c: RGB) => "#" + c.map((v) => (clamp(v) | 0).toString(16).padStart(2, "0")).join("");

const toTex = (c: HTMLCanvasElement, srgb: boolean, repeat = true) => {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  t.wrapS = t.wrapT = repeat ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping;
  t.generateMipmaps = true; t.minFilter = THREE.LinearMipmapLinearFilter; t.magFilter = THREE.LinearFilter;
  t.anisotropy = 8; t.needsUpdate = true;
  return t;
};
/** a printed / drawn image (posters, labels, screens): sRGB, no bump */
const printTex = (w: number, h: number, draw: (g: G2, w: number, h: number) => void, repeat = false) => {
  const c = mkCanvas(w, h), g = c.getContext("2d", CTX)!;
  g.lineCap = "round"; g.lineJoin = "round";
  draw(g, w, h);
  return toTex(c, true, repeat);
};
/** box blur of a float array, wrapping round the tile (2-3 passes ~ gaussian) */
const boxBlurF = (src: Float32Array, Wd: number, Ht: number, r: number, passes = 2): Float32Array => {
  let a: Float32Array = src, b: Float32Array = new Float32Array(src.length); const k = 1 / (2 * r + 1);
  const mx = (i: number, n: number) => ((i % n) + n) % n;
  for (let p = 0; p < passes; p++) {
    for (let y = 0; y < Ht; y++) {
      const o = y * Wd; let s = 0;
      for (let i = -r; i <= r; i++) s += a[o + mx(i, Wd)];
      for (let x = 0; x < Wd; x++) { b[o + x] = s * k; s += a[o + mx(x + r + 1, Wd)] - a[o + mx(x - r, Wd)]; }
    }
    [a, b] = [b, a];
    for (let x = 0; x < Wd; x++) {
      let s = 0;
      for (let i = -r; i <= r; i++) s += a[mx(i, Ht) * Wd + x];
      for (let y = 0; y < Ht; y++) { b[y * Wd + x] = s * k; s += a[mx(y + r + 1, Ht) * Wd + x] - a[mx(y - r, Ht) * Wd + x]; }
    }
    [a, b] = [b, a];
  }
  return a;
};
/** tileable fine noise, roughly in [-1, 1] (blurred white noise scaled by 2.5 sigma) */
const fineNoise = (Wd: number, Ht: number, R: () => number, radius: number) => {
  let a: Float32Array = new Float32Array(Wd * Ht);
  for (let i = 0; i < a.length; i++) a[i] = R() * 2 - 1;
  if (radius > 0) a = boxBlurF(a, Wd, Ht, radius, 2);
  let s2 = 0; for (let i = 0; i < a.length; i++) s2 += a[i] * a[i];
  const k = 1 / (2.5 * Math.sqrt(s2 / a.length) + 1e-6);
  for (let i = 0; i < a.length; i++) a[i] = Math.max(-1, Math.min(1, a[i] * k));
  return a;
};
/** blur the R channel of a grey canvas (height map bevels) */
const blurGrey = (c: HTMLCanvasElement, r: number) => {
  if (r <= 0) return;
  const g = c.getContext("2d", CTX)!, Wd = c.width, Ht = c.height, im = g.getImageData(0, 0, Wd, Ht), d = im.data;
  const a = new Float32Array(Wd * Ht); for (let i = 0; i < a.length; i++) a[i] = d[i * 4];
  const b = boxBlurF(a, Wd, Ht, Math.max(1, Math.round(r)), 2);
  for (let i = 0; i < a.length; i++) { d[i * 4] = d[i * 4 + 1] = d[i * 4 + 2] = b[i]; d[i * 4 + 3] = 255; }
  g.putImageData(im, 0, 0);
};
/** soft elliptical spot (radial gradient) */
const spot = (g: G2, x: number, y: number, rx: number, ry: number, col: string, col0: string) => {
  g.save(); g.translate(x, y); g.scale(1, ry / rx);
  const gr = g.createRadialGradient(0, 0, 0, 0, 0, rx); gr.addColorStop(0, col); gr.addColorStop(1, col0);
  g.fillStyle = gr; g.beginPath(); g.arc(0, 0, rx, 0, Math.PI * 2); g.fill(); g.restore();
};
const rrect = (g: G2, x: number, y: number, w: number, h: number, r: number) => {
  r = Math.min(r, w / 2, h / 2);
  g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
};

/** albedo + height + roughness canvases of one size drawn from one layout, packed like woodtex (height R, rough G) */
class Sheet {
  ca: HTMLCanvasElement; ch: HTMLCanvasElement; cr: HTMLCanvasElement; a: G2; h: G2; r: G2;
  constructor(public Wd: number, public Ht: number) {
    this.ca = mkCanvas(Wd, Ht); this.ch = mkCanvas(Wd, Ht); this.cr = mkCanvas(Wd, Ht);
    this.a = this.ca.getContext("2d", CTX)!; this.h = this.ch.getContext("2d", CTX)!; this.r = this.cr.getContext("2d", CTX)!;
    for (const g of [this.a, this.h, this.r]) { g.lineCap = "round"; g.lineJoin = "round"; }
  }
  fill(albedo: RGB, height: number, rough: number) {
    this.a.fillStyle = css(albedo); this.a.fillRect(0, 0, this.Wd, this.Ht);
    this.h.fillStyle = grey(height); this.h.fillRect(0, 0, this.Wd, this.Ht);
    this.r.fillStyle = grey(rough); this.r.fillRect(0, 0, this.Wd, this.Ht);
  }
  /** call fn(dx, dy) for each tile copy the box touches (seamless wrap) */
  wrap(x0: number, y0: number, x1: number, y1: number, fn: (dx: number, dy: number) => void) {
    for (const dx of [0, -this.Wd, this.Wd]) for (const dy of [0, -this.Ht, this.Ht]) {
      if (x1 + dx < 0 || x0 + dx > this.Wd || y1 + dy < 0 || y0 + dy > this.Ht) continue;
      fn(dx, dy);
    }
  }
  /** add amp * n to a channel ("h" height or "r" roughness), weighted per pixel */
  addNoise(ch: "h" | "r" | "a", n: Float32Array, amp: number, wgt?: (x: number, y: number) => number) {
    const g = ch === "h" ? this.h : ch === "r" ? this.r : this.a, { Wd, Ht } = this;
    const im = g.getImageData(0, 0, Wd, Ht), d = im.data;
    for (let y = 0; y < Ht; y++) for (let x = 0; x < Wd; x++) {
      const i = y * Wd + x, k = amp * n[i] * (wgt ? wgt(x, y) : 1);
      if (ch === "a") { d[i * 4] = clamp(d[i * 4] * (1 + k)); d[i * 4 + 1] = clamp(d[i * 4 + 1] * (1 + k)); d[i * 4 + 2] = clamp(d[i * 4 + 2] * (1 + k)); }
      else d[i * 4] = clamp(d[i * 4] + k);
    }
    g.putImageData(im, 0, 0);
  }
  done(rep: THREE.Vector2, bumpScale: number, repeat = true): W.WoodTex {
    const { Wd, Ht } = this, hd = this.h.getImageData(0, 0, Wd, Ht), rd = this.r.getImageData(0, 0, Wd, Ht), d = hd.data, e = rd.data;
    for (let i = 0; i < d.length; i += 4) { d[i + 1] = e[i]; d[i + 2] = 0; d[i + 3] = 255; }
    this.h.putImageData(hd, 0, 0);
    this.cr.width = this.cr.height = 1;
    const surf = toTex(this.ch, false, repeat);
    return { map: toTex(this.ca, true, repeat), bump: surf, rough: surf, repeatPerMetre: rep, bumpScale };
  }
}

// ============================================================================================================
// surface sheets (albedo + packed height/roughness)
// ============================================================================================================
/** glazed porcelain floor tiles (600 mm, the standard dorm floor): warm cream with faint clouding, speckle and a few
 *  veins, recessed grey grout with a soft bevel, glossy tiles / matte grout, shoe scuffs and grime. Metric UVs, tile
 *  n x tile metres (default 2.4 m = 4 x 4 tiles); repeat = repeatPerMetre. */
export function floorTiles(o: { seed?: number; color?: RGB; grout?: RGB; tile?: number; n?: number; size?: number; scuffs?: number } = {}): W.WoodTex {
  const n = o.n ?? 4, tile = o.tile ?? 0.6, N = o.size ?? 2048, TU = n * tile, pm = N / TU, R = rng(o.seed ?? 101);
  const S = new Sheet(N, N), { a, h, r } = S, base = o.color ?? [236, 222, 198], T = tile * pm;
  const gw = Math.max(1.6, 0.0021 * pm);
  S.fill(o.grout ?? [158, 146, 130], 24, 230);
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
    const x0 = i * T + gw, y0 = j * T + gw, w = T - 2 * gw, v = 0.965 + 0.05 * R(), warm = (R() - 0.5) * 7;
    const tone: RGB = [base[0] * v + warm, base[1] * v, base[2] * v - warm];
    a.fillStyle = css(tone); a.fillRect(x0, y0, w, w);
    a.save(); a.beginPath(); a.rect(x0, y0, w, w); a.clip();
    for (let k = 0; k < 7; k++) spot(a, x0 + R() * w, y0 + R() * w, (0.1 + 0.18 * R()) * w, (0.05 + 0.12 * R()) * w, css(mul(tone, R() < 0.55 ? 0.92 : 1.05), 0.4), css(tone, 0));
    for (let k = 0; k < 3; k++) { // soft veins
      let x = x0 + R() * w, y = y0 + R() * w, ang = R() * 6.28;
      a.strokeStyle = css(mul(tone, 0.86), 0.12 + 0.12 * R()); a.lineWidth = 1 + 2.5 * R(); a.beginPath(); a.moveTo(x, y);
      for (let s = 0; s < 14; s++) { ang += (R() - 0.5) * 0.9; x += Math.cos(ang) * w * 0.05; y += Math.sin(ang) * w * 0.05; a.lineTo(x, y); }
      a.stroke();
    }
    for (let k = 0; k < 340; k++) {
      const dk = R() < 0.72; a.fillStyle = dk ? css([128, 110, 90], 0.16 + 0.26 * R()) : css([255, 252, 244], 0.35);
      a.beginPath(); a.arc(x0 + R() * w, y0 + R() * w, 0.6 + 1.5 * R(), 0, 6.283); a.fill();
    }
    const gr = a.createLinearGradient(x0, y0, x0 + w, y0 + w); gr.addColorStop(0, "rgba(255,255,255,0.06)"); gr.addColorStop(1, "rgba(0,0,0,0.05)");
    a.fillStyle = gr; a.fillRect(x0, y0, w, w);
    a.restore();
    h.fillStyle = grey(212 + (R() - 0.5) * 14); h.fillRect(x0, y0, w, w);
    r.fillStyle = grey(72 + R() * 26); r.fillRect(x0, y0, w, w);
  }
  blurGrey(S.ch, 1.5);
  // grime in the grout lines, darker in patches
  for (let k = 0; k < 60; k++) {
    const vert = R() < 0.5, line = Math.floor(R() * n) * T, s0 = R() * N, len = (0.2 + 0.8 * R()) * pm;
    a.fillStyle = css([92, 80, 66], 0.18 + 0.2 * R());
    S.wrap(0, 0, N, N, (dx, dy) => { if (vert) a.fillRect(line - gw * 1.2 + dx, s0 + dy, gw * 2.4, len); else a.fillRect(s0 + dx, line - gw * 1.2 + dy, len, gw * 2.4); });
  }
  // shoe scuffs: short dark arcs, rougher
  const ns = o.scuffs ?? 30;
  for (let k = 0; k < ns; k++) {
    const x = R() * N, y = R() * N, rad = (0.04 + 0.12 * R()) * pm, a0 = R() * 6.28, a1 = a0 + 0.3 + 0.8 * R();
    S.wrap(x - rad, y - rad, x + rad, y + rad, (dx, dy) => {
      a.strokeStyle = css([70, 60, 52], 0.1 + 0.16 * R()); a.lineWidth = 1.5 + 4 * R();
      a.beginPath(); a.arc(x + dx, y + dy, rad, a0, a1); a.stroke();
      r.strokeStyle = grey(200, 0.5); r.lineWidth = 6; r.beginPath(); r.arc(x + dx, y + dy, rad, a0, a1); r.stroke();
    });
  }
  // dusty dull patches
  for (let k = 0; k < 10; k++) { const x = R() * N, y = R() * N, rr = (0.2 + 0.4 * R()) * pm; S.wrap(x - rr, y - rr, x + rr, y + rr, (dx, dy) => spot(r, x + dx, y + dy, rr, rr * 0.7, grey(170, 0.35), grey(170, 0))); }
  S.addNoise("h", fineNoise(N, N, R, 1), 6);
  return S.done(new THREE.Vector2(1 / TU, 1 / TU), 1.2);
}

/** painted dorm wall in metric UVs (u along the wall, v = height in metres from the floor): matte cream emulsion
 *  with roller orange-peel, a semi-gloss mint dado (墙裙) up to `dado` m with a darker bead line, a dark grey tile
 *  skirting, chair scuffs, old tape marks and nail holes. Tile tw x th metres; repeat = repeatPerMetre. */
export function wallPaint(o: { seed?: number; upper?: RGB; lower?: RGB; skirting?: RGB; dado?: number; tw?: number; th?: number; ppm?: number } = {}): W.WoodTex {
  const tw = o.tw ?? 2, th = o.th ?? 3, ppm = o.ppm ?? 512, Wd = Math.round(tw * ppm), Ht = Math.round(th * ppm), R = rng(o.seed ?? 202);
  const S = new Sheet(Wd, Ht), { a, h, r } = S, up = o.upper ?? [242, 233, 214], lo = o.lower ?? [150, 204, 184], sk = o.skirting ?? [112, 104, 98];
  const Y = (m: number) => Ht - m * ppm, dado = o.dado ?? 1.1;
  S.fill(up, 128, 236);
  // faint roller lanes
  for (let x = 0; x < Wd;) { const w = (0.18 + 0.3 * R()) * ppm; a.fillStyle = css(R() < 0.5 ? [255, 250, 240] : [200, 188, 170], 0.03 + 0.03 * R()); a.fillRect(x, 0, w, Y(dado)); x += w; }
  // soft tonal clouds on the upper wall
  for (let k = 0; k < 10; k++) { const x = R() * Wd, y = R() * Y(dado), rr = (0.2 + 0.5 * R()) * ppm; S.wrap(x - rr, y - rr, x + rr, y + rr, (dx, dy) => spot(a, x + dx, y + dy, rr, rr * 0.8, css(mul(up, 0.95), 0.25), css(up, 0))); }
  // dado
  a.fillStyle = css(lo); a.fillRect(0, Y(dado), Wd, Ht - Y(dado));
  for (let k = 0; k < 8; k++) { const x = R() * Wd, y = Y(dado) + R() * (dado * ppm), rr = (0.15 + 0.3 * R()) * ppm; S.wrap(x - rr, y - rr, x + rr, y + rr, (dx, dy) => spot(a, x + dx, y + dy, rr, rr * 0.6, css(mul(lo, 1.05), 0.25), css(lo, 0))); }
  const bead = 0.022 * ppm;
  a.fillStyle = css(mul(lo, 0.62)); a.fillRect(0, Y(dado) - bead, Wd, bead);
  a.fillStyle = css(mixc(lo, [255, 255, 255], 0.35), 0.8); a.fillRect(0, Y(dado) - bead, Wd, bead * 0.3);
  a.fillStyle = css([40, 60, 50], 0.18); a.fillRect(0, Y(dado), Wd, bead * 0.5);
  h.fillStyle = grey(128); h.fillRect(0, Y(dado), Wd, Ht - Y(dado));
  h.fillStyle = grey(200); h.fillRect(0, Y(dado) - bead, Wd, bead);
  r.fillStyle = grey(135); r.fillRect(0, Y(dado), Wd, Ht - Y(dado));
  r.fillStyle = grey(110); r.fillRect(0, Y(dado) - bead, Wd, bead);
  // skirting (tile strip)
  const skH = 0.1;
  a.fillStyle = css(sk); a.fillRect(0, Y(skH), Wd, skH * ppm);
  a.fillStyle = css(mixc(sk, [255, 255, 255], 0.3)); a.fillRect(0, Y(skH), Wd, 3);
  for (let x = 0; x < Wd; x += 0.6 * ppm) { a.fillStyle = css(mul(sk, 0.7)); a.fillRect(x, Y(skH), 2, skH * ppm); }
  h.fillStyle = grey(230); h.fillRect(0, Y(skH), Wd, skH * ppm);
  r.fillStyle = grey(90); r.fillRect(0, Y(skH), Wd, skH * ppm);
  blurGrey(S.ch, 1.5);
  // orange peel (rougher above the dado)
  const nz = fineNoise(Wd, Ht, R, 1);
  S.addNoise("h", nz, 16, (_x, y) => (y < Y(dado) ? 1 : 0.4));
  // chair / shoe scuffs on the dado
  for (let k = 0; k < 26; k++) {
    const x = R() * Wd, y = Y(0.12 + 0.75 * R()), len = (0.04 + 0.16 * R()) * ppm;
    S.wrap(x - len, y - 10, x + len, y + 10, (dx, dy) => {
      a.strokeStyle = css([60, 64, 62], 0.12 + 0.2 * R()); a.lineWidth = 1.5 + 3 * R();
      a.beginPath(); a.moveTo(x + dx, y + dy); a.quadraticCurveTo(x + len * 0.5 + dx, y + (R() - 0.5) * 12 + dy, x + len + dx, y + (R() - 0.5) * 8 + dy); a.stroke();
    });
  }
  // old tape marks (four corners of a poster that came down) + nail holes
  for (let k = 0; k < 3; k++) {
    const cx = R() * Wd, cy = Y(1.5 + 1.1 * R()), pw = (0.3 + 0.25 * R()) * ppm, ph = pw * 1.35;
    for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
      const x = cx + (sx * pw) / 2, y = cy + (sy * ph) / 2, tw2 = 0.035 * ppm, th2 = 0.018 * ppm;
      S.wrap(x - tw2, y - tw2, x + tw2, y + tw2, (dx, dy) => {
        a.save(); a.translate(x + dx, y + dy); a.rotate(sx * sy * 0.6); a.fillStyle = css([226, 210, 168], 0.45); a.fillRect(-tw2 / 2, -th2 / 2, tw2, th2); a.restore();
      });
    }
  }
  for (let k = 0; k < 9; k++) {
    const x = R() * Wd, y = Y(1.3 + 1.5 * R());
    S.wrap(x - 6, y - 6, x + 6, y + 6, (dx, dy) => {
      a.fillStyle = css([90, 80, 70], 0.7); a.beginPath(); a.arc(x + dx, y + dy, 2.2, 0, 6.283); a.fill();
      a.fillStyle = css([255, 255, 255], 0.5); a.beginPath(); a.arc(x + dx - 1.5, y + dy - 1.5, 1.5, 0, 6.283); a.fill();
      h.fillStyle = grey(40); h.beginPath(); h.arc(x + dx, y + dy, 2.5, 0, 6.283); h.fill();
    });
  }
  return S.done(new THREE.Vector2(1 / tw, 1 / th), 1.0);
}

/** powder-coated steel (bed frames, lockers, ladders): near-white albedo for tinting with the material colour, fine
 *  orange-peel, faint mottle, a few light scratches; semi-gloss. Metric, tile `tile` m. */
export function powderCoat(o: { seed?: number; tile?: number; size?: number } = {}): W.WoodTex {
  const N = o.size ?? 512, tile = o.tile ?? 0.5, R = rng(o.seed ?? 303), S = new Sheet(N, N), { a, r } = S;
  S.fill([238, 238, 236], 128, 115);
  S.addNoise("a", fineNoise(N, N, R, 18), 0.035);
  S.addNoise("h", fineNoise(N, N, R, 1), 22);
  S.addNoise("r", fineNoise(N, N, R, 6), 20);
  for (let k = 0; k < 18; k++) {
    const x = R() * N, y = R() * N, l = (0.02 + 0.08 * R()) * (N / tile), ang = R() * 6.28;
    S.wrap(x - l, y - l, x + l, y + l, (dx, dy) => {
      a.strokeStyle = css([255, 255, 255], 0.25 + 0.3 * R()); a.lineWidth = 0.8 + R();
      a.beginPath(); a.moveTo(x + dx, y + dy); a.lineTo(x + Math.cos(ang) * l + dx, y + Math.sin(ang) * l + dy); a.stroke();
      r.strokeStyle = grey(70, 0.6); r.lineWidth = 2; r.beginPath(); r.moveTo(x + dx, y + dy); r.lineTo(x + Math.cos(ang) * l + dx, y + Math.sin(ang) * l + dy); r.stroke();
    });
  }
  for (let k = 0; k < 40; k++) { a.fillStyle = css([120, 120, 125], 0.2 + 0.3 * R()); a.beginPath(); a.arc(R() * N, R() * N, 0.7 + R(), 0, 6.283); a.fill(); }
  return S.done(new THREE.Vector2(1 / tile, 1 / tile), 0.6);
}

/** front face of a steel wardrobe door (UV 0..1 over the face, v up): pressed inner panel, two louvre vent groups,
 *  a name-card holder with a handwritten card, a few dings. Near-white so the material colour tints it. */
export function lockerDoor(o: { seed?: number; w?: number; h?: number; ppm?: number; card?: RGB } = {}): W.WoodTex {
  const w = o.w ?? 0.46, hh = o.h ?? 1.86, ppm = o.ppm ?? 640, Wd = Math.round(w * ppm), Ht = Math.round(hh * ppm), R = rng(o.seed ?? 404);
  const S = new Sheet(Wd, Ht), { a, h, r } = S, P = (m: number) => m * ppm;
  S.fill([236, 238, 240], 150, 110);
  // pressed panel: light top/left ridge, dark bottom/right groove
  const inset = P(0.035);
  a.strokeStyle = css([255, 255, 255], 0.5); a.lineWidth = 3; a.strokeRect(inset, inset, Wd - 2 * inset, Ht - 2 * inset);
  a.strokeStyle = css([90, 96, 110], 0.35); a.lineWidth = 2; a.strokeRect(inset + 3, inset + 3, Wd - 2 * inset, Ht - 2 * inset);
  h.strokeStyle = grey(220); h.lineWidth = 6; h.strokeRect(inset, inset, Wd - 2 * inset, Ht - 2 * inset);
  // louvres
  const louvres = (top: number) => {
    for (let i = 0; i < 6; i++) {
      const y = P(top) + i * P(0.032), x0 = Wd / 2 - P(0.13), lw = P(0.26), sh = P(0.011);
      a.fillStyle = css([40, 44, 52], 0.9); rrect(a, x0, y, lw, sh, sh / 2); a.fill();
      a.fillStyle = css([255, 255, 255], 0.65); rrect(a, x0, y - 2.5, lw, 2.5, 1.2); a.fill();
      a.fillStyle = css([60, 66, 80], 0.25); a.fillRect(x0, y + sh, lw, 2);
      h.fillStyle = grey(30); rrect(h, x0, y, lw, sh, sh / 2); h.fill();
      h.fillStyle = grey(240); h.fillRect(x0, y - 3, lw, 3);
      r.fillStyle = grey(230); rrect(r, x0, y, lw, sh, sh / 2); r.fill();
    }
  };
  louvres(0.1); louvres(hh - 0.29);
  // name-card holder
  const cx = Wd / 2 - P(0.05), cy = P(0.36), cw = P(0.1), chh = P(0.055);
  a.fillStyle = css([170, 176, 186]); rrect(a, cx - 3, cy - 3, cw + 6, chh + 6, 3); a.fill();
  a.fillStyle = css(o.card ?? [252, 250, 240]); a.fillRect(cx, cy, cw, chh);
  a.strokeStyle = css([40, 70, 170], 0.85); a.lineWidth = 2.2; a.beginPath();
  for (let k = 0; k < 7; k++) { const x = cx + P(0.012) + k * P(0.011), y = cy + chh * 0.55; a.moveTo(x, y + 4); a.quadraticCurveTo(x + 3, y - 8, x + 6, y + 2); }
  a.stroke();
  h.fillStyle = grey(190); h.fillRect(cx - 3, cy - 3, cw + 6, chh + 6);
  // dings + scratches near the handle side
  for (let k = 0; k < 14; k++) {
    const x = Wd * (0.65 + 0.3 * R()), y = Ht * (0.35 + 0.3 * R());
    a.strokeStyle = css([255, 255, 255], 0.3 + 0.3 * R()); a.lineWidth = 1; a.beginPath(); a.moveTo(x, y); a.lineTo(x + (R() - 0.5) * 30, y + (R() - 0.5) * 8); a.stroke();
  }
  for (let k = 0; k < 4; k++) spot(h, R() * Wd, R() * Ht, 10, 10, grey(110, 0.5), grey(110, 0));
  blurGrey(S.ch, 1.2);
  S.addNoise("h", fineNoise(Wd, Ht, R, 1), 14);
  return S.done(new THREE.Vector2(1, 1), 0.8, false);
}

export type FabricPattern = "plain" | "gingham" | "stripe" | "dots" | "stars" | "plaid" | "floral" | "hearts" | "check";
/** woven fabric (bedding, curtains, clothes, towels): pattern in albedo, basket-weave height, matte, soft mottle.
 *  Metric, tile `tile` m. */
export function fabric(o: { seed?: number; base: RGB; accent?: RGB; accent2?: RGB; pattern?: FabricPattern; tile?: number; size?: number; weave?: number }): W.WoodTex {
  const N = o.size ?? 512, tile = o.tile ?? 0.4, R = rng(o.seed ?? 505), S = new Sheet(N, N), { a, h } = S;
  const B = o.base, A = o.accent ?? mixc(B, [255, 255, 255], 0.6), A2 = o.accent2 ?? mul(B, 0.7), pat = o.pattern ?? "plain";
  S.fill(B, 128, 245);
  const stripes = (vert: boolean, w: number, step: number, col: RGB, al: number, off = 0) => {
    a.fillStyle = css(col, al);
    for (let s = off; s < N + step; s += step) vert ? a.fillRect(s, 0, w, N) : a.fillRect(0, s, N, w);
  };
  if (pat === "gingham" || pat === "check") {
    const st = N / (pat === "check" ? 4 : 8);
    stripes(true, st / 2, st, A, 0.5); stripes(false, st / 2, st, A, 0.5);
  } else if (pat === "stripe") {
    const st = N / 8; stripes(false, st * 0.35, st, A, 0.9); stripes(false, st * 0.08, st, A2, 0.8, st * 0.5);
  } else if (pat === "plaid") {
    const st = N / 4; stripes(true, st * 0.4, st, A, 0.35); stripes(false, st * 0.4, st, A, 0.35);
    stripes(true, st * 0.06, st, A2, 0.7, st * 0.7); stripes(false, st * 0.06, st, A2, 0.7, st * 0.7);
  } else if (pat === "dots" || pat === "stars" || pat === "hearts" || pat === "floral") {
    const n = pat === "floral" ? 6 : 8, cell = N / n;
    for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
      const x = (i + (j % 2) * 0.5) * cell + cell * 0.5, y = (j + 0.5) * cell, sz = cell * (pat === "dots" ? 0.16 : 0.26);
      a.save(); a.translate(x % N, y); a.rotate((R() - 0.5) * 0.6);
      const col = R() < 0.3 ? A2 : A;
      a.fillStyle = css(col);
      if (pat === "dots") { a.beginPath(); a.arc(0, 0, sz, 0, 6.283); a.fill(); }
      else if (pat === "stars") { a.beginPath(); for (let k = 0; k < 10; k++) { const rr = k % 2 ? sz * 0.45 : sz, an = (k / 10) * 6.283 - Math.PI / 2; a.lineTo(Math.cos(an) * rr, Math.sin(an) * rr); } a.closePath(); a.fill(); }
      else if (pat === "hearts") { a.beginPath(); a.moveTo(0, sz * 0.7); a.bezierCurveTo(-sz * 1.2, -sz * 0.1, -sz * 0.5, -sz * 0.95, 0, -sz * 0.35); a.bezierCurveTo(sz * 0.5, -sz * 0.95, sz * 1.2, -sz * 0.1, 0, sz * 0.7); a.fill(); }
      else { for (let k = 0; k < 5; k++) { const an = (k / 5) * 6.283; a.beginPath(); a.ellipse(Math.cos(an) * sz * 0.55, Math.sin(an) * sz * 0.55, sz * 0.45, sz * 0.3, an, 0, 6.283); a.fill(); }
        a.fillStyle = css([255, 214, 90]); a.beginPath(); a.arc(0, 0, sz * 0.28, 0, 6.283); a.fill();
        a.fillStyle = css(A2, 0.8); a.beginPath(); a.ellipse(sz * 1.0, sz * 0.6, sz * 0.4, sz * 0.15, 0.6, 0, 6.283); a.fill(); }
      a.restore();
      if (x + sz > N) { // wrap the half that falls off the right edge
        a.save(); a.translate(x - N, y); a.fillStyle = css(col); a.beginPath(); a.arc(0, 0, pat === "dots" ? sz : sz * 0.7, 0, 6.283); a.fill(); a.restore();
      }
    }
  }
  // soft mottle + weave
  S.addNoise("a", fineNoise(N, N, R, 20), 0.05);
  const wv = o.weave ?? 1, im = h.getImageData(0, 0, N, N), d = im.data;
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const i = (y * N + x) * 4, cxw = ((x >> 1) + (y >> 2)) & 1, cyw = ((y >> 1) + (x >> 2)) & 1;
    d[i] = clamp(128 + wv * 30 * (cxw ? 1 : -1) * (cyw ? 0.6 : 1));
  }
  h.putImageData(im, 0, 0);
  blurGrey(S.ch, 0.8);
  S.addNoise("h", fineNoise(N, N, R, 6), 20);
  // thread slubs in the albedo
  for (let k = 0; k < 200; k++) { a.fillStyle = css(R() < 0.5 ? mul(B, 0.85) : mixc(B, [255, 255, 255], 0.3), 0.18); a.fillRect(R() * N, R() * N, 4 + 14 * R(), 1); }
  return S.done(new THREE.Vector2(1 / tile, 1 / tile), 0.9);
}

/** corrugated kraft cardboard: fibre mottle, flute ridges, a few scuffs. Metric, tile 0.5 m. */
export function cardboard(o: { seed?: number; color?: RGB } = {}): W.WoodTex {
  const N = 512, R = rng(o.seed ?? 606), S = new Sheet(N, N), { a, h } = S, B = o.color ?? [206, 160, 108];
  S.fill(B, 128, 235);
  S.addNoise("a", fineNoise(N, N, R, 12), 0.06);
  S.addNoise("a", fineNoise(N, N, R, 1), 0.04);
  for (let x = 0; x < N; x += 8) { h.fillStyle = grey(160); h.fillRect(x, 0, 3, N); a.fillStyle = css(mul(B, 1.04), 0.25); a.fillRect(x, 0, 2, N); }
  blurGrey(S.ch, 1.2);
  for (let k = 0; k < 12; k++) { a.strokeStyle = css(mul(B, 0.7), 0.25); a.lineWidth = 1 + 2 * R(); const x = R() * N, y = R() * N; a.beginPath(); a.moveTo(x, y); a.lineTo(x + (R() - 0.5) * 60, y + (R() - 0.5) * 20); a.stroke(); }
  return S.done(new THREE.Vector2(2, 2), 0.7);
}

/** dorm wall in metric UVs (u along the wall, v = height in metres from the floor), the art-pass replacement for the
 *  flat painted dado: glazed ceramic wall tiles (墙砖) 0.25 x 0.2 m in a stacked grid up to 1.2 m, with recessed matte
 *  grout and soft bevels (height), glossy glaze with faint clouding and speckle (roughness), one row of narrow accent
 *  tiles and a bullnose trim on top, a dark tile skirting row, grime in the low grout and a few chipped corners; above
 *  it matte warm emulsion with roller orange-peel, old tape marks and nail holes. Tile tw x th metres (8 tiles across
 *  2 m, so it wraps seamlessly); repeat = repeatPerMetre. */
export function tiledWall(o: { seed?: number; upper?: RGB; tile?: RGB; accent?: RGB; skirting?: RGB; grout?: RGB; tw?: number; th?: number; ppm?: number } = {}): W.WoodTex {
  const tw = o.tw ?? 2, th = o.th ?? 3, ppm = o.ppm ?? 512, Wd = Math.round(tw * ppm), Ht = Math.round(th * ppm), R = rng(o.seed ?? 212);
  const S = new Sheet(Wd, Ht), { a, h, r } = S;
  const up = o.upper ?? [246, 230, 198], tl = o.tile ?? [238, 242, 240], ac = o.accent ?? [64, 124, 204], sk = o.skirting ?? [92, 100, 118], gc = o.grout ?? [176, 176, 170];
  const Y = (m: number) => Ht - m * ppm;
  const skH = 0.12, rowH = 0.2, nRows = 5, accH = 0.08, trimH = 0.025, top = skH + nRows * rowH + accH; // 1.2 m
  S.fill(up, 128, 236);
  // upper wall: faint roller lanes + soft tonal clouds
  for (let x = 0; x < Wd;) { const w = (0.18 + 0.3 * R()) * ppm; a.fillStyle = css(R() < 0.5 ? [255, 250, 240] : [206, 190, 166], 0.035 + 0.03 * R()); a.fillRect(x, 0, w, Y(top)); x += w; }
  for (let k = 0; k < 12; k++) { const x = R() * Wd, y = R() * Y(top + 0.1), rr = (0.2 + 0.5 * R()) * ppm; S.wrap(x - rr, y - rr, x + rr, y + rr, (dx, dy) => spot(a, x + dx, y + dy, rr, rr * 0.8, css(mul(up, 0.94), 0.28), css(up, 0))); }
  // a soft darker band of hand grime at chair-back / shoulder height just above the tiles
  { const gr = a.createLinearGradient(0, Y(top + 0.45), 0, Y(top)); gr.addColorStop(0, css(mul(up, 0.95), 0)); gr.addColorStop(1, css(mul(up, 0.9), 0.5)); a.fillStyle = gr; a.fillRect(0, Y(top + 0.45), Wd, 0.45 * ppm); }
  // tile zone: grout background, recessed, matte
  a.fillStyle = css(gc); a.fillRect(0, Y(top + trimH), Wd, Ht - Y(top + trimH));
  h.fillStyle = grey(70); h.fillRect(0, Y(top + trimH), Wd, Ht - Y(top + trimH));
  r.fillStyle = grey(225); r.fillRect(0, Y(top + trimH), Wd, Ht - Y(top + trimH));
  const gw = Math.max(2.5, 0.006 * ppm);
  /** one stacked row of tiles between heights y0..y1 (m), tile width w (m) */
  const row = (y0: number, y1: number, w: number, col: RGB, vary: number, gloss: [number, number], speck = 1) => {
    const n = Math.round(tw / w), pw = Wd / n;
    for (let i = 0; i < n; i++) {
      const x0 = i * pw + gw / 2, x1 = (i + 1) * pw - gw / 2, ya = Y(y1) + gw / 2, yb = Y(y0) - gw / 2, tw2 = x1 - x0, th2 = yb - ya;
      const tone: RGB = mul(col, 1 + (R() - 0.5) * vary);
      a.fillStyle = css(tone); rrect(a, x0, ya, tw2, th2, 2.5); a.fill();
      a.save(); rrect(a, x0, ya, tw2, th2, 2.5); a.clip();
      for (let k = 0; k < 4; k++) spot(a, x0 + R() * tw2, ya + R() * th2, (0.2 + 0.3 * R()) * tw2, (0.15 + 0.25 * R()) * th2, css(mul(tone, R() < 0.5 ? 0.96 : 1.03), 0.5), css(tone, 0));
      for (let k = 0; k < 60 * speck; k++) { a.fillStyle = R() < 0.7 ? css(mul(tone, 0.82), 0.25) : css([255, 255, 255], 0.4); a.fillRect(x0 + R() * tw2, ya + R() * th2, 1.4, 1.4); }
      // glaze bevel: bright top/left lip, darker bottom/right lip
      a.fillStyle = css([255, 255, 255], 0.45); a.fillRect(x0, ya, tw2, 2); a.fillRect(x0, ya, 2, th2);
      a.fillStyle = css([0, 0, 0], 0.1); a.fillRect(x0, yb - 2.5, tw2, 2.5); a.fillRect(x1 - 2, ya, 2, th2);
      a.restore();
      h.fillStyle = grey(212 + (R() - 0.5) * 8); rrect(h, x0, ya, tw2, th2, 2.5); h.fill();
      r.fillStyle = grey(gloss[0] + R() * (gloss[1] - gloss[0])); rrect(r, x0, ya, tw2, th2, 2.5); r.fill();
      // the odd chipped corner near the floor
      if (y0 < 0.6 && R() < 0.12) { const cx = R() < 0.5 ? x0 : x1, cy = R() < 0.5 ? ya : yb; a.fillStyle = css(gc); a.beginPath(); a.arc(cx, cy, 5 + 4 * R(), 0, 6.283); a.fill(); h.fillStyle = grey(90); h.beginPath(); h.arc(cx, cy, 6, 0, 6.283); h.fill(); }
    }
  };
  row(0, skH, 0.5, sk, 0.06, [70, 90], 0.6);
  for (let j = 0; j < nRows; j++) row(skH + j * rowH, skH + (j + 1) * rowH, 0.25, tl, 0.05, [34, 56]);
  row(top - accH, top, 0.125, ac, 0.08, [40, 60], 0.5);
  // bullnose trim on top of the tiles: one long rounded strip
  a.fillStyle = css(mixc(tl, [255, 255, 255], 0.2)); a.fillRect(0, Y(top + trimH), Wd, trimH * ppm);
  a.fillStyle = css([255, 255, 255], 0.7); a.fillRect(0, Y(top + trimH) + 2, Wd, 2.5);
  a.fillStyle = css([60, 60, 70], 0.22); a.fillRect(0, Y(top) - 2, Wd, 3);
  h.fillStyle = grey(240); h.fillRect(0, Y(top + trimH), Wd, trimH * ppm);
  r.fillStyle = grey(50); r.fillRect(0, Y(top + trimH), Wd, trimH * ppm);
  blurGrey(S.ch, 1.6);
  // orange peel on the paint (tiles stay smooth)
  S.addNoise("h", fineNoise(Wd, Ht, R, 1), 14, (_x, y) => (y < Y(top + trimH) ? 1 : 0.12));
  // grime in the low grout lines + shoe scuffs on the skirting
  for (let k = 0; k < 40; k++) { const x = R() * Wd, y = Y(0.02 + 0.5 * R()), rr = (0.05 + 0.15 * R()) * ppm; S.wrap(x - rr, y - rr, x + rr, y + rr, (dx, dy) => spot(a, x + dx, y + dy, rr, rr * 0.5, css([110, 96, 80], 0.1), css([110, 96, 80], 0))); }
  for (let k = 0; k < 22; k++) {
    const x = R() * Wd, y = Y(0.03 + 0.4 * R()), len = (0.04 + 0.12 * R()) * ppm;
    S.wrap(x - len, y - 10, x + len, y + 10, (dx, dy) => { a.strokeStyle = css([50, 54, 60], 0.1 + 0.15 * R()); a.lineWidth = 1.5 + 2.5 * R(); a.beginPath(); a.moveTo(x + dx, y + dy); a.lineTo(x + len + dx, y + (R() - 0.5) * 6 + dy); a.stroke(); });
  }
  // old tape marks + nail holes on the paint
  for (let k = 0; k < 3; k++) {
    const cx = R() * Wd, cy = Y(1.65 + 1.0 * R()), pw = (0.3 + 0.25 * R()) * ppm, ph = pw * 1.35;
    for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
      const x = cx + (sx * pw) / 2, y = cy + (sy * ph) / 2, t1 = 0.035 * ppm, t2 = 0.018 * ppm;
      S.wrap(x - t1, y - t1, x + t1, y + t1, (dx, dy) => { a.save(); a.translate(x + dx, y + dy); a.rotate(sx * sy * 0.6); a.fillStyle = css([226, 206, 160], 0.5); a.fillRect(-t1 / 2, -t2 / 2, t1, t2); a.restore(); });
    }
  }
  for (let k = 0; k < 9; k++) {
    const x = R() * Wd, y = Y(1.4 + 1.4 * R());
    S.wrap(x - 6, y - 6, x + 6, y + 6, (dx, dy) => {
      a.fillStyle = css([90, 80, 70], 0.7); a.beginPath(); a.arc(x + dx, y + dy, 2.2, 0, 6.283); a.fill();
      h.fillStyle = grey(40); h.beginPath(); h.arc(x + dx, y + dy, 2.5, 0, 6.283); h.fill();
    });
  }
  return S.done(new THREE.Vector2(1 / tw, 1 / th), 1.1);
}

/** printed wood-grain laminate for the desk tops (metric, tile 2 x 1 m, grain along u): honey maple print with long
 *  wavy grain streaks, cathedral arches and fine pores (albedo, faint emboss), a satin finish (roughness) with duller
 *  hand-worn patches, and lived-in marks: coffee rings, ballpoint scribbles, light scratches. */
export function deskLaminate(o: { seed?: number; color?: RGB } = {}): W.WoodTex {
  const Wd = 2048, Ht = 1024, pm = 1024, R = rng(o.seed ?? 515), S = new Sheet(Wd, Ht), { a, h, r } = S, B = o.color ?? [224, 170, 112];
  S.fill(B, 140, 112);
  // broad tonal bands along u (wrap in v)
  for (let k = 0; k < 22; k++) { const y = R() * Ht, hh = (0.015 + 0.07 * R()) * pm, col = css(mul(B, R() < 0.5 ? 0.9 : 1.06), 0.3 + 0.2 * R()); S.wrap(0, y - hh / 2, Wd, y + hh / 2, (_dx, dy) => { a.fillStyle = col; a.fillRect(0, y - hh / 2 + dy, Wd, hh); }); }
  // long grain streaks: wavy lines whose waves repeat a whole number of times across the tile (seamless in u)
  const dark = mul(B, 0.7), darker = mul(B, 0.55);
  for (let k = 0; k < 300; k++) {
    const y = R() * Ht, amp = (0.002 + 0.012 * R()) * pm, f = (6.283 * (1 + Math.floor(R() * 4))) / Wd, f2 = (6.283 * (3 + Math.floor(R() * 5))) / Wd, ph = R() * 6.28;
    const col = css(R() < 0.3 ? darker : dark, 0.07 + 0.2 * R()), lw = 0.6 + 2.4 * R();
    for (const dy of [0, -Ht, Ht]) {
      if (y + dy < -40 || y + dy > Ht + 40) continue;
      a.strokeStyle = col; a.lineWidth = lw; a.beginPath();
      for (let x = 0; x <= Wd; x += 16) a.lineTo(x, y + dy + amp * Math.sin(x * f + ph) + amp * 0.45 * Math.sin(x * f2 + ph * 1.7));
      a.stroke();
    }
  }
  // cathedral arches (flame figure) pointing along +u
  for (let c = 0; c < 7; c++) {
    const cx = R() * Wd, cy = R() * Ht, len = (0.25 + 0.3 * R()) * pm, w0 = (0.01 + 0.015 * R()) * pm, sp = (0.008 + 0.006 * R()) * pm;
    S.wrap(cx - len * 1.3, cy - 12 * sp - w0, cx + 0.1 * pm, cy + 12 * sp + w0, (dx, dy) => {
      for (let i = 0; i < 9; i++) {
        const hw = w0 + i * sp, L2 = len * (1 - i * 0.07);
        a.strokeStyle = css(i % 3 === 0 ? darker : dark, 0.16 + 0.12 * R()); a.lineWidth = 1 + 1.6 * R(); a.beginPath();
        for (let t = -1; t <= 1.001; t += 0.05) a.lineTo(cx + dx - t * t * L2 * 0.9 + L2 * 0.1, cy + dy + t * hw);
        a.stroke();
      }
    });
  }
  // pores: tiny dark dashes along the grain, embossed a touch
  for (let k = 0; k < 7000; k++) { const x = R() * Wd, y = R() * Ht, l = 2 + 5 * R(); a.fillStyle = css(darker, 0.12 + 0.14 * R()); a.fillRect(x, y, l, 1); h.fillStyle = grey(110, 0.6); h.fillRect(x, y, l, 1); }
  // satin finish, duller where hands and elbows rest (two broad patches)
  S.addNoise("r", fineNoise(Wd, Ht, R, 12), 14);
  for (let k = 0; k < 6; k++) { const x = R() * Wd, y = R() * Ht, rr = (0.12 + 0.2 * R()) * pm; S.wrap(x - rr, y - rr, x + rr, y + rr, (dx, dy) => spot(r, x + dx, y + dy, rr, rr * 0.6, grey(170, 0.5), grey(170, 0))); }
  // coffee rings
  for (let k = 0; k < 3; k++) {
    const x = R() * Wd, y = R() * Ht, rr = 0.036 * pm + R() * 6;
    S.wrap(x - rr - 6, y - rr - 6, x + rr + 6, y + rr + 6, (dx, dy) => {
      a.strokeStyle = css([120, 72, 36], 0.22 + 0.1 * R()); a.lineWidth = 3 + 2 * R(); a.beginPath(); a.arc(x + dx, y + dy, rr, R() * 2, R() * 2 + 5.4); a.stroke();
      r.strokeStyle = grey(175, 0.7); r.lineWidth = 6; r.beginPath(); r.arc(x + dx, y + dy, rr, 0, 6.283); r.stroke();
    });
  }
  // ballpoint scribbles + a doodled star near one edge
  for (let k = 0; k < 4; k++) {
    let x = R() * Wd, y = R() * Ht; const col = css(R() < 0.6 ? [40, 70, 170] : [30, 30, 40], 0.35 + 0.2 * R());
    S.wrap(x - 80, y - 80, x + 80, y + 80, (dx, dy) => { a.strokeStyle = col; a.lineWidth = 1.6; a.beginPath(); a.moveTo(x + dx, y + dy); for (let s2 = 0; s2 < 24; s2++) { a.lineTo(x + dx + Math.cos(s2 * 1.3) * 10 + s2 * 2.5, y + dy + Math.sin(s2 * 1.7) * 7); } a.stroke(); });
    x += 1;
  }
  { const x = Wd * 0.62, y = Ht * 0.86; a.strokeStyle = css([40, 70, 170], 0.5); a.lineWidth = 2; a.beginPath(); for (let q = 0; q <= 10; q++) { const rr = q % 2 ? 8 : 20, an = (q / 10) * 6.283 - Math.PI / 2; a.lineTo(x + Math.cos(an) * rr, y + Math.sin(an) * rr); } a.stroke(); }
  // light scratches (paler, rougher, slightly cut in)
  for (let k = 0; k < 40; k++) {
    const x = R() * Wd, y = R() * Ht, l = (0.02 + 0.1 * R()) * pm, an = (R() - 0.5) * 0.8;
    S.wrap(x - l, y - l, x + l, y + l, (dx, dy) => {
      a.strokeStyle = css([255, 236, 205], 0.25 + 0.25 * R()); a.lineWidth = 0.8 + R(); a.beginPath(); a.moveTo(x + dx, y + dy); a.lineTo(x + dx + Math.cos(an) * l, y + dy + Math.sin(an) * l); a.stroke();
      h.strokeStyle = grey(100); h.lineWidth = 1.2; h.beginPath(); h.moveTo(x + dx, y + dy); h.lineTo(x + dx + Math.cos(an) * l, y + dy + Math.sin(an) * l); h.stroke();
    });
  }
  S.addNoise("h", fineNoise(Wd, Ht, R, 1), 4);
  return S.done(new THREE.Vector2(1 / 2, 1), 0.35);
}

/** ceiling plaster (metric, tile 2 m): warm white emulsion with roller lanes and orange peel, a faint old water stain
 *  and a hairline crack, so the big ceiling area reads as a surface and not as an empty plane. */
export function ceilingPlaster(o: { seed?: number; color?: RGB } = {}): W.WoodTex {
  const N = 1024, tile = 2, pm = N / tile, R = rng(o.seed ?? 313), S = new Sheet(N, N), { a, h } = S, B = o.color ?? [246, 242, 234];
  S.fill(B, 128, 240);
  for (let x = 0; x < N;) { const w = (0.2 + 0.25 * R()) * pm; a.fillStyle = css(R() < 0.5 ? [255, 253, 248] : [214, 206, 192], 0.05); a.fillRect(x, 0, w, N); x += w; }
  S.addNoise("a", fineNoise(N, N, R, 24), 0.035);
  S.addNoise("h", fineNoise(N, N, R, 1), 18);
  S.addNoise("h", fineNoise(N, N, R, 5), 10);
  // water stain: a soft tan blot with a darker tide line
  { const x = N * 0.7, y = N * 0.3, rr = 0.22 * pm; spot(a, x, y, rr, rr * 0.8, css([214, 190, 150], 0.22), css([214, 190, 150], 0));
    a.strokeStyle = css([190, 160, 120], 0.25); a.lineWidth = 2.5; a.beginPath(); a.ellipse(x, y, rr * 0.8, rr * 0.62, 0.4, 0, 6.283); a.stroke(); }
  // hairline crack
  { let x = N * 0.15, y = N * 0.62, ang = -0.3; a.strokeStyle = css([150, 140, 128], 0.45); a.lineWidth = 1.4; a.beginPath(); a.moveTo(x, y);
    h.strokeStyle = grey(60); h.lineWidth = 2; h.beginPath(); h.moveTo(x, y);
    for (let s = 0; s < 22; s++) { ang += (R() - 0.5) * 0.7; x += Math.cos(ang) * 0.025 * pm; y += Math.sin(ang) * 0.025 * pm; a.lineTo(x, y); h.lineTo(x, y); }
    a.stroke(); h.stroke(); }
  return S.done(new THREE.Vector2(1 / tile, 1 / tile), 0.7);
}

// ============================================================================================================
// printed / drawn images (no bump)
// ============================================================================================================
/** whiteboard on the entrance wall: a duty rota grid (Latin + digits only), a doodle, magnets, ghosted old marker */
export function whiteboardTex() {
  return printTex(640, 480, (g, w, h) => {
    g.fillStyle = "#fbfcfd"; g.fillRect(0, 0, w, h);
    const R = rng(61);
    // ghosting of wiped writing
    for (let k = 0; k < 14; k++) { g.strokeStyle = `rgba(120,130,160,${0.05 + 0.05 * R()})`; g.lineWidth = 6 + 8 * R(); g.beginPath(); const x = R() * w, y = R() * h; g.moveTo(x, y); g.quadraticCurveTo(x + 60, y - 20, x + 160 * R(), y + 30 * (R() - 0.5)); g.stroke(); }
    g.fillStyle = "#2a55c8"; g.font = "900 46px sans-serif"; g.textAlign = "left"; g.fillText("DUTY", 28, 62);
    g.strokeStyle = "#2a55c8"; g.lineWidth = 3;
    const x0 = 28, y0 = 90, cw = 70, rh = 44, days = ["MON", "TUE", "WED", "THU", "FRI"];
    for (let i = 0; i <= 5; i++) { g.beginPath(); g.moveTo(x0 + i * cw, y0); g.lineTo(x0 + i * cw, y0 + 4 * rh); g.stroke(); }
    for (let j = 0; j <= 4; j++) { g.beginPath(); g.moveTo(x0, y0 + j * rh); g.lineTo(x0 + 5 * cw, y0 + j * rh); g.stroke(); }
    g.font = "700 20px sans-serif"; g.fillStyle = "#2a55c8"; days.forEach((d, i) => g.fillText(d, x0 + i * cw + 12, y0 + 28));
    const ic = ["#e5483b", "#2fa84f", "#f0a020", "#8a4fd8"];
    for (let j = 1; j < 4; j++) for (let i = 0; i < 5; i++) if ((i + j) % 2 === 0 || R() < 0.3) { g.strokeStyle = ic[(i + j) % 4]; g.lineWidth = 5; const cx = x0 + i * cw + cw / 2, cy = y0 + j * rh + rh / 2; g.beginPath(); g.moveTo(cx - 12, cy); g.lineTo(cx - 3, cy + 9); g.lineTo(cx + 14, cy - 10); g.stroke(); }
    // four round-head doodles holding hands (the room), and a "22:30" lights-out note
    for (let k = 0; k < 4; k++) { const cx = 440 + k * 48, cy = 150; g.strokeStyle = "#222"; g.lineWidth = 4; g.fillStyle = "#fff"; g.beginPath(); g.arc(cx, cy, 17, 0, 6.283); g.fill(); g.stroke();
      g.beginPath(); g.moveTo(cx, cy + 17); g.lineTo(cx, cy + 60); g.moveTo(cx, cy + 60); g.lineTo(cx - 12, cy + 90); g.moveTo(cx, cy + 60); g.lineTo(cx + 12, cy + 90); g.moveTo(cx - 24, cy + 35); g.lineTo(cx + 24, cy + 35); g.stroke();
      g.fillStyle = "#222"; g.beginPath(); g.arc(cx - 6, cy - 3, 2.5, 0, 6.283); g.arc(cx + 6, cy - 3, 2.5, 0, 6.283); g.fill(); }
    g.strokeStyle = "#e5483b"; g.lineWidth = 4; g.beginPath(); g.moveTo(440, 262); g.bezierCurveTo(430, 240, 410, 262, 440, 285); g.bezierCurveTo(470, 262, 450, 240, 440, 262); g.stroke();
    g.fillStyle = "#e5483b"; g.font = "800 40px sans-serif"; g.fillText("22:30", 380, 360);
    g.fillStyle = "#222"; g.font = "700 24px sans-serif"; g.fillText("lights out!", 384, 395);
    g.strokeStyle = "#2fa84f"; g.lineWidth = 3; for (let k = 0; k < 3; k++) { g.beginPath(); for (let x = 0; x < 260 - k * 50; x += 8) g.lineTo(40 + x, 320 + k * 34 + Math.sin(x * 0.7 + k) * 4); g.stroke(); }
  });
}

export type PosterKind = "hoops" | "vinyl" | "sunset" | "planet" | "cat" | "timetable" | "wave";
/** wall posters, all original art (no IP, no CJK text so any font set renders them) */
export function posterTex(kind: PosterKind, seed = 1) {
  const R = rng(seed * 97 + 13);
  return printTex(512, 720, (g, w, h) => {
    const border = (col: string) => { g.strokeStyle = col; g.lineWidth = 18; g.strokeRect(9, 9, w - 18, h - 18); };
    if (kind === "hoops") {
      g.fillStyle = "#ff7a3d"; g.fillRect(0, 0, w, h);
      for (let i = -8; i < 14; i++) { g.fillStyle = i % 2 ? "#ff9a52" : "#ff6b35"; g.beginPath(); g.moveTo(i * 60, 0); g.lineTo(i * 60 + 30, 0); g.lineTo(i * 60 + 330, h); g.lineTo(i * 60 + 300, h); g.fill(); }
      g.fillStyle = "#1d2a5a"; g.fillRect(0, h * 0.72, w, h * 0.28);
      // hoop + net
      g.strokeStyle = "#f2f2f2"; g.lineWidth = 6; g.fillStyle = "#ffffff"; g.fillRect(w * 0.55, h * 0.1, w * 0.36, h * 0.2); g.strokeStyle = "#e33"; g.strokeRect(w * 0.64, h * 0.17, w * 0.18, h * 0.1);
      g.strokeStyle = "#e33"; g.lineWidth = 8; g.beginPath(); g.ellipse(w * 0.73, h * 0.31, w * 0.11, h * 0.018, 0, 0, 6.283); g.stroke();
      g.strokeStyle = "rgba(255,255,255,0.9)"; g.lineWidth = 3;
      for (let k = 0; k <= 6; k++) { g.beginPath(); g.moveTo(w * (0.62 + k * 0.037), h * 0.31); g.lineTo(w * (0.66 + k * 0.025), h * 0.42); g.stroke(); }
      // ball
      const bx = w * 0.36, by = h * 0.42, br = w * 0.2;
      g.fillStyle = "#f08a24"; g.beginPath(); g.arc(bx, by, br, 0, 6.283); g.fill();
      g.strokeStyle = "#3a1d0b"; g.lineWidth = 7; g.beginPath(); g.arc(bx, by, br, 0, 6.283); g.stroke();
      g.beginPath(); g.moveTo(bx - br, by); g.lineTo(bx + br, by); g.moveTo(bx, by - br); g.lineTo(bx, by + br); g.stroke();
      g.beginPath(); g.arc(bx - br * 1.25, by, br * 0.9, -0.75, 0.75); g.stroke(); g.beginPath(); g.arc(bx + br * 1.25, by, br * 0.9, Math.PI - 0.75, Math.PI + 0.75); g.stroke();
      g.fillStyle = "rgba(255,255,255,0.35)"; g.beginPath(); g.arc(bx - br * 0.4, by - br * 0.45, br * 0.22, 0, 6.283); g.fill();
      for (let k = 0; k < 5; k++) { g.strokeStyle = "rgba(255,255,255,0.8)"; g.lineWidth = 6; g.beginPath(); g.moveTo(bx - br - 30 - k * 8, by + 40 + k * 30); g.lineTo(bx - br - 120 - k * 10, by + 70 + k * 36); g.stroke(); }
      g.fillStyle = "#ffffff"; g.font = "900 130px sans-serif"; g.textAlign = "center"; g.fillText("23", w * 0.5, h * 0.92);
      g.fillStyle = "#ffd23f"; g.font = "900 44px sans-serif"; g.fillText("GAME DAY", w * 0.5, h * 0.79);
      border("#ffffff");
    } else if (kind === "vinyl") {
      const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#4b2a8a"); gr.addColorStop(1, "#d6457a"); g.fillStyle = gr; g.fillRect(0, 0, w, h);
      for (let k = 0; k < 8; k++) { g.strokeStyle = `rgba(255,220,120,${0.25 + 0.08 * k})`; g.lineWidth = 5; g.beginPath(); for (let x = 0; x <= w; x += 8) g.lineTo(x, h * 0.78 + Math.sin(x * 0.03 + k) * (20 + k * 6) - k * 10); g.stroke(); }
      const cx = w * 0.5, cy = h * 0.4, rr = w * 0.34;
      g.fillStyle = "#15121c"; g.beginPath(); g.arc(cx, cy, rr, 0, 6.283); g.fill();
      for (let k = 1; k < 12; k++) { g.strokeStyle = `rgba(255,255,255,${k % 3 ? 0.06 : 0.14})`; g.lineWidth = 2; g.beginPath(); g.arc(cx, cy, rr * (0.38 + k * 0.05), 0, 6.283); g.stroke(); }
      g.fillStyle = "rgba(255,255,255,0.18)"; g.beginPath(); g.moveTo(cx, cy); g.arc(cx, cy, rr, -2.4, -1.9); g.fill();
      g.fillStyle = "#ffcf3f"; g.beginPath(); g.arc(cx, cy, rr * 0.32, 0, 6.283); g.fill();
      g.fillStyle = "#15121c"; g.beginPath(); g.arc(cx, cy, 8, 0, 6.283); g.fill();
      g.fillStyle = "#ffffff"; g.font = "900 120px sans-serif"; g.textAlign = "center"; g.fillText("LIVE", w * 0.5, h * 0.93);
      border("#15121c");
    } else if (kind === "sunset") {
      const gr = g.createLinearGradient(0, 0, 0, h * 0.7); gr.addColorStop(0, "#5b6fd6"); gr.addColorStop(0.55, "#f39ac0"); gr.addColorStop(1, "#ffd28a"); g.fillStyle = gr; g.fillRect(0, 0, w, h);
      g.fillStyle = "#fff4c8"; g.beginPath(); g.arc(w * 0.62, h * 0.5, w * 0.16, 0, 6.283); g.fill();
      for (let k = 0; k < 4; k++) { g.fillStyle = "rgba(255,255,255,0.65)"; rrect(g, w * (0.1 + 0.2 * k) - 40, h * (0.18 + 0.07 * (k % 2)), 150, 26, 13); g.fill(); }
      const ridge = (y0: number, amp: number, col: string, ph: number) => { g.fillStyle = col; g.beginPath(); g.moveTo(0, h); for (let x = 0; x <= w; x += 16) g.lineTo(x, y0 - Math.abs(Math.sin(x * 0.012 + ph)) * amp - Math.sin(x * 0.04 + ph) * amp * 0.15); g.lineTo(w, h); g.fill(); };
      ridge(h * 0.62, 90, "#9c6fb8", 0.5); ridge(h * 0.7, 70, "#6a4f9e", 2); ridge(h * 0.8, 50, "#3c3a78", 4);
      g.fillStyle = "#2a2a55"; g.fillRect(0, h * 0.86, w, h * 0.14);
      g.strokeStyle = "#2a2a55"; g.lineWidth = 3; for (let k = 0; k < 3; k++) { const x = w * (0.2 + 0.1 * k), y = h * (0.3 + 0.04 * k); g.beginPath(); g.moveTo(x - 12, y); g.quadraticCurveTo(x - 5, y - 8, x, y); g.quadraticCurveTo(x + 5, y - 8, x + 12, y); g.stroke(); }
      border("#fdf6e8");
    } else if (kind === "planet") {
      g.fillStyle = "#151a44"; g.fillRect(0, 0, w, h);
      for (let k = 0; k < 120; k++) { g.fillStyle = `rgba(255,255,255,${0.3 + 0.7 * R()})`; g.beginPath(); g.arc(R() * w, R() * h, 0.6 + 1.8 * R(), 0, 6.283); g.fill(); }
      const cx = w * 0.48, cy = h * 0.45, rr = w * 0.26;
      g.strokeStyle = "#ffd27a"; g.lineWidth = 14; g.beginPath(); g.ellipse(cx, cy, rr * 1.7, rr * 0.42, -0.35, Math.PI, 2 * Math.PI); g.stroke();
      const pg = g.createRadialGradient(cx - rr * 0.4, cy - rr * 0.4, 5, cx, cy, rr); pg.addColorStop(0, "#ffb3c7"); pg.addColorStop(1, "#e2557d");
      g.fillStyle = pg; g.beginPath(); g.arc(cx, cy, rr, 0, 6.283); g.fill();
      g.strokeStyle = "rgba(255,255,255,0.25)"; g.lineWidth = 10; for (let k = -1; k <= 1; k++) { g.beginPath(); g.ellipse(cx, cy + k * rr * 0.4, rr * 0.95, rr * 0.12, -0.2, 0, 6.283); g.stroke(); }
      g.strokeStyle = "#ffd27a"; g.lineWidth = 14; g.beginPath(); g.ellipse(cx, cy, rr * 1.7, rr * 0.42, -0.35, 0, Math.PI); g.stroke();
      // little rocket
      g.save(); g.translate(w * 0.78, h * 0.78); g.rotate(-0.6); g.fillStyle = "#f4f4f4"; rrect(g, -18, -50, 36, 90, 18); g.fill();
      g.fillStyle = "#3fa9f5"; g.beginPath(); g.arc(0, -15, 10, 0, 6.283); g.fill(); g.fillStyle = "#ff7a3d"; g.beginPath(); g.moveTo(-14, 40); g.lineTo(0, 80); g.lineTo(14, 40); g.fill(); g.restore();
      border("#ffd27a");
    } else if (kind === "cat") {
      g.fillStyle = "#ffd84d"; g.fillRect(0, 0, w, h);
      for (let k = 0; k < 40; k++) { g.fillStyle = "rgba(255,255,255,0.5)"; g.beginPath(); g.arc(R() * w, R() * h, 6 + 10 * R(), 0, 6.283); g.fill(); }
      const cx = w * 0.5, cy = h * 0.46;
      g.fillStyle = "#3a3a46";
      g.beginPath(); g.moveTo(cx - 150, cy - 40); g.lineTo(cx - 120, cy - 200); g.lineTo(cx - 40, cy - 120); g.fill();
      g.beginPath(); g.moveTo(cx + 150, cy - 40); g.lineTo(cx + 120, cy - 200); g.lineTo(cx + 40, cy - 120); g.fill();
      g.beginPath(); g.ellipse(cx, cy, 170, 140, 0, 0, 6.283); g.fill();
      g.fillStyle = "#ffffff"; g.beginPath(); g.ellipse(cx - 62, cy - 10, 36, 42, 0, 0, 6.283); g.fill(); g.beginPath(); g.ellipse(cx + 62, cy - 10, 36, 42, 0, 0, 6.283); g.fill();
      g.fillStyle = "#3a3a46"; g.beginPath(); g.arc(cx - 55, cy - 4, 18, 0, 6.283); g.fill(); g.beginPath(); g.arc(cx + 69, cy - 4, 18, 0, 6.283); g.fill();
      g.fillStyle = "#ff8fa8"; g.beginPath(); g.moveTo(cx - 12, cy + 40); g.lineTo(cx + 12, cy + 40); g.lineTo(cx, cy + 54); g.fill();
      g.strokeStyle = "#ffffff"; g.lineWidth = 4; for (const s of [-1, 1]) for (let k = 0; k < 3; k++) { g.beginPath(); g.moveTo(cx + s * 80, cy + 50 + k * 14); g.lineTo(cx + s * 170, cy + 40 + k * 22); g.stroke(); }
      g.fillStyle = "#3a3a46"; g.font = "900 80px sans-serif"; g.textAlign = "center"; g.fillText("MEOW", cx, h * 0.9);
      border("#3a3a46");
    } else if (kind === "timetable") {
      g.fillStyle = "#fbfaf4"; g.fillRect(0, 0, w, h);
      g.fillStyle = "#4b7bd8"; g.fillRect(0, 0, w, 70);
      const cols = 6, rows = 9, x0 = 30, y0 = 90, cw = (w - 60) / cols, chh = (h - 120) / rows, pal = ["#ffb3a7", "#a7d8ff", "#b9f0c1", "#ffe08a", "#d7b8ff", "#ffc98a"];
      for (let j = 0; j < rows; j++) for (let i = 1; i < cols; i++) {
        if (R() < 0.55) { g.fillStyle = pal[Math.floor(R() * pal.length)]; rrect(g, x0 + i * cw + 3, y0 + j * chh + 3, cw - 6, chh * (R() < 0.3 ? 2 : 1) - 6, 8); g.fill(); g.fillStyle = "rgba(40,40,60,0.55)"; g.fillRect(x0 + i * cw + 12, y0 + j * chh + 18, cw * 0.55, 6); g.fillRect(x0 + i * cw + 12, y0 + j * chh + 32, cw * 0.35, 5); }
      }
      g.strokeStyle = "rgba(60,70,100,0.35)"; g.lineWidth = 2;
      for (let i = 0; i <= cols; i++) { g.beginPath(); g.moveTo(x0 + i * cw, y0); g.lineTo(x0 + i * cw, y0 + rows * chh); g.stroke(); }
      for (let j = 0; j <= rows; j++) { g.beginPath(); g.moveTo(x0, y0 + j * chh); g.lineTo(x0 + cols * cw, y0 + j * chh); g.stroke(); }
      g.fillStyle = "#ffffff"; g.font = "900 40px sans-serif"; g.textAlign = "left"; g.fillText("WEEK 10", 30, 50);
      g.fillStyle = "#4b7bd8"; g.font = "700 26px sans-serif"; for (let j = 0; j < rows; j++) g.fillText(String(j + 1), x0 + 12, y0 + j * chh + chh * 0.6);
    } else {
      // "wave": big stylised wave in blues
      g.fillStyle = "#f6efe0"; g.fillRect(0, 0, w, h);
      g.fillStyle = "#e9573f"; g.beginPath(); g.arc(w * 0.72, h * 0.22, 60, 0, 6.283); g.fill();
      for (let k = 0; k < 5; k++) { g.fillStyle = ["#1d3f8f", "#2f63c4", "#5b8fe0", "#9cc2f2", "#dbe9fb"][k]; g.beginPath(); g.moveTo(0, h); for (let x = 0; x <= w; x += 10) g.lineTo(x, h * (0.45 + k * 0.1) + Math.sin(x * 0.02 + k * 1.3) * 30 - Math.max(0, 1 - Math.abs(x - w * 0.35) / 160) * (120 - k * 20)); g.lineTo(w, h); g.fill(); }
      border("#1d3f8f");
    }
  });
}

/** wall calendar, November 2026 (Latin + digits only): photo on top, month grid, crossed-off days, a circled date */
/** wall-clock face: white dial, hour ticks, numbers, hands at 10:40 (late evening) */
const clockTex = () => printTex(512, 512, (g, w) => {
  const c = w / 2;
  g.fillStyle = "#fbfaf6"; g.fillRect(0, 0, w, w);
  for (let k = 0; k < 60; k++) { const a = (k / 60) * Math.PI * 2, r0 = k % 5 ? 222 : 200; g.strokeStyle = "#2a2a30"; g.lineWidth = k % 5 ? 3 : 9;
    g.beginPath(); g.moveTo(c + Math.sin(a) * r0, c - Math.cos(a) * r0); g.lineTo(c + Math.sin(a) * 236, c - Math.cos(a) * 236); g.stroke(); }
  g.fillStyle = "#2a2a30"; g.font = "bold 44px sans-serif"; g.textAlign = "center"; g.textBaseline = "middle";
  for (let k = 1; k <= 12; k++) { const a = (k / 12) * Math.PI * 2; g.fillText(String(k), c + Math.sin(a) * 160, c - Math.cos(a) * 160); }
  const hand = (a: number, len: number, wd: number, col: string) => { g.strokeStyle = col; g.lineWidth = wd; g.lineCap = "round"; g.beginPath(); g.moveTo(c - Math.sin(a) * 24, c + Math.cos(a) * 24); g.lineTo(c + Math.sin(a) * len, c - Math.cos(a) * len); g.stroke(); };
  hand(((10 + 40 / 60) / 12) * Math.PI * 2, 120, 16, "#2a2a30"); hand((40 / 60) * Math.PI * 2, 190, 10, "#2a2a30"); hand((12 / 60) * Math.PI * 2, 200, 4, "#e5484d");
  g.fillStyle = "#e5484d"; g.beginPath(); g.arc(c, c, 14, 0, 6.283); g.fill();
});

export function calendarTex() {
  return printTex(512, 720, (g, w, h) => {
    g.fillStyle = "#fffdf6"; g.fillRect(0, 0, w, h);
    const gr = g.createLinearGradient(0, 30, 0, 330); gr.addColorStop(0, "#7fc4f0"); gr.addColorStop(1, "#d8f0ff"); g.fillStyle = gr; g.fillRect(24, 40, w - 48, 290);
    g.fillStyle = "#57a05a"; g.beginPath(); g.moveTo(24, 330); for (let x = 24; x <= w - 24; x += 12) g.lineTo(x, 260 - Math.sin(x * 0.02) * 30 - Math.sin(x * 0.007) * 30); g.lineTo(w - 24, 330); g.fill();
    g.fillStyle = "#e4a23b"; g.beginPath(); for (let k = 0; k < 12; k++) { const x = 60 + k * 36; g.moveTo(x, 300); g.lineTo(x + 16, 250 - (k % 3) * 12); g.lineTo(x + 32, 300); } g.fill();
    for (let k = 0; k < 6; k++) { g.fillStyle = "#3d3d3d"; g.beginPath(); g.arc(60 + k * 78, 22, 9, 0, 6.283); g.fill(); }
    g.fillStyle = "#e5483b"; g.font = "900 64px sans-serif"; g.textAlign = "left"; g.fillText("11", 30, 400);
    g.fillStyle = "#333"; g.font = "800 30px sans-serif"; g.fillText("NOVEMBER  2026", 120, 392);
    const x0 = 30, y0 = 425, cw = (w - 60) / 7, chh = 52;
    g.font = "700 18px sans-serif"; g.textAlign = "center";
    ["S", "M", "T", "W", "T", "F", "S"].forEach((d, i) => { g.fillStyle = i === 0 || i === 6 ? "#e5483b" : "#666"; g.fillText(d, x0 + cw * (i + 0.5), y0); });
    g.font = "700 24px sans-serif";
    for (let d = 1; d <= 30; d++) {
      const i = (d - 1) % 7, j = Math.floor((d - 1) / 7), x = x0 + cw * (i + 0.5), y = y0 + 40 + j * chh;
      g.fillStyle = i === 0 || i === 6 ? "#e5483b" : "#2c2c2c"; g.fillText(String(d), x, y);
      if (d < 9) { g.strokeStyle = "rgba(220,50,50,0.8)"; g.lineWidth = 3; g.beginPath(); g.moveTo(x - 14, y - 22); g.lineTo(x + 14, y + 4); g.moveTo(x + 14, y - 22); g.lineTo(x - 14, y + 4); g.stroke(); }
      if (d === 9) { g.strokeStyle = "#e5483b"; g.lineWidth = 4; g.beginPath(); g.ellipse(x, y - 8, 24, 20, 0, 0, 6.283); g.stroke(); }
      if (d === 20) { g.fillStyle = "rgba(255,210,63,0.55)"; g.fillRect(x - 22, y - 26, 44, 34); }
    }
    g.strokeStyle = "rgba(0,0,0,0.08)"; g.lineWidth = 2; g.strokeRect(2, 2, w - 4, h - 4);
  });
}

/** laptop screen: a video site in dark mode (big player with a cartoon scene, a column of thumbnails) */
export function laptopScreenTex() {
  return printTex(640, 400, (g, w, h) => {
    g.fillStyle = "#14161f"; g.fillRect(0, 0, w, h);
    g.fillStyle = "#1f2230"; g.fillRect(0, 0, w, 34);
    g.fillStyle = "#ff4d6d"; rrect(g, 14, 9, 52, 16, 6); g.fill();
    g.fillStyle = "#2c3042"; rrect(g, 180, 8, 280, 18, 9); g.fill();
    // player
    const px = 16, py = 46, pw = 420, ph = 236;
    const sky = g.createLinearGradient(0, py, 0, py + ph); sky.addColorStop(0, "#5ec8ff"); sky.addColorStop(1, "#c8f1ff"); g.fillStyle = sky; g.fillRect(px, py, pw, ph);
    g.fillStyle = "#7bd36a"; g.beginPath(); g.moveTo(px, py + ph); for (let x = 0; x <= pw; x += 10) g.lineTo(px + x, py + ph * 0.7 - Math.sin(x * 0.02) * 22); g.lineTo(px + pw, py + ph); g.fill();
    g.fillStyle = "#ffffff"; for (const [x, y] of [[90, 80], [280, 70], [360, 110]]) { g.beginPath(); g.arc(px + x, py + y, 18, 0, 6.283); g.arc(px + x + 20, py + y - 8, 22, 0, 6.283); g.arc(px + x + 42, py + y, 16, 0, 6.283); g.fill(); }
    g.fillStyle = "#ffffff"; g.beginPath(); g.arc(px + 200, py + 130, 26, 0, 6.283); g.fill();
    g.strokeStyle = "#222"; g.lineWidth = 6; g.beginPath(); g.moveTo(px + 200, py + 156); g.lineTo(px + 200, py + 200); g.moveTo(px + 200, py + 200); g.lineTo(px + 185, py + 228); g.moveTo(px + 200, py + 200); g.lineTo(px + 215, py + 228); g.moveTo(px + 200, py + 170); g.lineTo(px + 175, py + 150); g.moveTo(px + 200, py + 170); g.lineTo(px + 228, py + 186); g.stroke();
    g.fillStyle = "rgba(0,0,0,0.5)"; g.fillRect(px, py + ph - 22, pw, 22);
    g.fillStyle = "#ff4d6d"; g.fillRect(px + 10, py + ph - 13, pw * 0.42, 4); g.fillStyle = "rgba(255,255,255,0.4)"; g.fillRect(px + 10 + pw * 0.42, py + ph - 13, pw * 0.52, 4);
    g.fillStyle = "#e9ecf5"; g.fillRect(px, py + ph + 14, 300, 12); g.fillStyle = "#8a90a6"; g.fillRect(px, py + ph + 34, 190, 9);
    g.fillStyle = "#ff4d6d"; rrect(g, px + 330, py + ph + 12, 86, 26, 13); g.fill();
    // thumbnails
    const pal = ["#ffb347", "#7ad3a8", "#b48cff", "#ff8fa3", "#6cc3ff", "#ffd95e"];
    for (let k = 0; k < 6; k++) {
      const y = 46 + k * 58, x = 452;
      g.fillStyle = pal[k]; rrect(g, x, y, 90, 50, 6); g.fill();
      g.fillStyle = "rgba(255,255,255,0.6)"; g.beginPath(); g.arc(x + 45, y + 25, 12, 0, 6.283); g.fill();
      g.fillStyle = "#d8dbe6"; g.fillRect(x + 98, y + 6, 76, 8); g.fillStyle = "#7d8296"; g.fillRect(x + 98, y + 22, 54, 6);
    }
  });
}

/** placeholder phone screen (portrait 9:19.5): a contacts / chat list with round avatars, name bars, a tab bar.
 *  Replace D.phoneScreen.material.map with the film's own contact-list texture. */
export function phoneScreenTex(seed = 7) {
  const R = rng(seed);
  return printTex(450, 975, (g, w, h) => {
    g.fillStyle = "#f6f7fb"; g.fillRect(0, 0, w, h);
    g.fillStyle = "#1f2433"; g.font = "700 22px sans-serif"; g.textAlign = "left"; g.fillText("21:47", 28, 38);
    g.fillRect(w - 70, 22, 40, 18);
    g.fillStyle = "#1f2433"; g.font = "800 42px sans-serif"; g.fillText("Friends", 28, 110);
    g.fillStyle = "#e6e8ef"; rrect(g, 24, 130, w - 48, 46, 23); g.fill();
    const pal = ["#ff8a65", "#4fc3f7", "#81c784", "#ffd54f", "#ba68c8", "#f06292", "#4db6ac", "#9575cd", "#ffb74d", "#7986cb"];
    for (let k = 0; k < 10; k++) {
      const y = 200 + k * 72;
      g.fillStyle = pal[k % pal.length]; g.beginPath(); g.arc(58, y + 30, 26, 0, 6.283); g.fill();
      g.fillStyle = "rgba(255,255,255,0.85)"; g.beginPath(); g.arc(58, y + 24, 9, 0, 6.283); g.fill(); g.beginPath(); g.ellipse(58, y + 44, 14, 9, 0, Math.PI, 2 * Math.PI); g.fill();
      g.fillStyle = "#2a2f3d"; rrect(g, 100, y + 14, 110 + R() * 110, 14, 7); g.fill();
      g.fillStyle = "#a3a8b8"; rrect(g, 100, y + 38, 150 + R() * 120, 10, 5); g.fill();
      if (k % 3 === 0) { g.fillStyle = "#ffb300"; g.font = "900 26px sans-serif"; g.fillText("★", w - 60, y + 38); }
      g.fillStyle = "#e3e5ec"; g.fillRect(100, y + 66, w - 120, 2);
    }
    g.fillStyle = "#ffffff"; g.fillRect(0, h - 90, w, 90); g.fillStyle = "#e3e5ec"; g.fillRect(0, h - 90, w, 2);
    for (let k = 0; k < 4; k++) { g.fillStyle = k === 1 ? "#2f80ed" : "#b0b5c4"; rrect(g, 50 + k * ((w - 100) / 3) - 18, h - 66, 36, 30, 8); g.fill(); }
  });
}

/** instant-noodle cup label for a lathe (u around, v up): red rim band, yellow body, a bowl of noodles, a badge */
const noodleTex = () => printTex(1024, 256, (g, w, h) => {
  g.fillStyle = "#ffd23a"; g.fillRect(0, 0, w, h);
  g.fillStyle = "#e5302b"; g.fillRect(0, 0, w, h * 0.3); g.fillRect(0, h * 0.9, w, h * 0.1);
  g.fillStyle = "#ffffff"; for (let x = 0; x < w; x += 40) { g.beginPath(); g.arc(x + 20, h * 0.3, 10, 0, Math.PI); g.fill(); }
  for (const cx of [w * 0.25, w * 0.75]) {
    g.fillStyle = "#ffffff"; g.beginPath(); g.ellipse(cx, h * 0.58, 120, 60, 0, 0, Math.PI); g.fill();
    g.fillStyle = "#c4581f"; g.beginPath(); g.ellipse(cx, h * 0.58, 120, 22, 0, 0, 6.283); g.fill();
    g.strokeStyle = "#ffe08a"; g.lineWidth = 6; for (let k = 0; k < 6; k++) { g.beginPath(); g.moveTo(cx - 90 + k * 30, h * 0.58); g.quadraticCurveTo(cx - 80 + k * 30, h * 0.48, cx - 70 + k * 30, h * 0.58); g.stroke(); }
    g.fillStyle = "#fff6dc"; g.beginPath(); g.ellipse(cx + 40, h * 0.54, 26, 14, 0.3, 0, 6.283); g.fill(); g.fillStyle = "#ffb11f"; g.beginPath(); g.arc(cx + 42, h * 0.54, 8, 0, 6.283); g.fill();
    g.fillStyle = "#4caf50"; for (let k = 0; k < 6; k++) { g.beginPath(); g.arc(cx - 50 + k * 15, h * 0.555 + (k % 2) * 4, 4, 0, 6.283); g.fill(); }
  }
  for (const cx of [w * 0.5, 0, w]) { g.fillStyle = "#e5302b"; g.beginPath(); g.arc(cx, h * 0.6, 50, 0, 6.283); g.fill(); g.strokeStyle = "#fff"; g.lineWidth = 6; g.beginPath(); g.arc(cx, h * 0.6, 40, 0, 6.283); g.stroke(); g.fillStyle = "#ffd23a"; g.beginPath(); for (let k = 0; k < 10; k++) { const rr = k % 2 ? 12 : 28, an = (k / 10) * 6.283 - Math.PI / 2; g.lineTo(cx + Math.cos(an) * rr, h * 0.6 + Math.sin(an) * rr); } g.fill(); }
}, true);

/** dusk sky behind the balcony: deep blue-violet zenith, lavender, a peach-pink band low down, faint stars + clouds */
const skyTex = () => printTex(512, 1024, (g, w, h) => {
  const gr = g.createLinearGradient(0, 0, 0, h);
  gr.addColorStop(0, "#1c2058"); gr.addColorStop(0.3, "#2f3580"); gr.addColorStop(0.55, "#5d55a6"); gr.addColorStop(0.72, "#9a74b8"); gr.addColorStop(0.84, "#e092a6"); gr.addColorStop(0.93, "#f5b591"); gr.addColorStop(1, "#f7c99a");
  g.fillStyle = gr; g.fillRect(0, 0, w, h);
  const R = rng(77);
  for (let k = 0; k < 70; k++) { const y = R() * h * 0.5; g.fillStyle = `rgba(255,255,255,${(0.25 + 0.6 * R()) * (1 - y / (h * 0.5))})`; g.beginPath(); g.arc(R() * w, y, 0.6 + 1.3 * R(), 0, 6.283); g.fill(); }
  for (let k = 0; k < 7; k++) { const y = h * (0.58 + 0.25 * R()), x = R() * w, cw = 80 + 160 * R(); g.fillStyle = `rgba(${k % 2 ? "255,190,200" : "190,150,210"},0.35)`; rrect(g, x - cw / 2, y, cw, 8 + 8 * R(), 8); g.fill(); }
});

/** the dorm block across the yard at dusk: blue-grey facade, a grid of windows (warm lit, cool screen-lit, dark),
 *  balcony slabs with railings, laundry specks */
const facadeTex = () => printTex(1024, 1024, (g, w, h) => {
  const R = rng(88);
  const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#6c6a9a"); gr.addColorStop(1, "#4a4a78"); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  const cols = 12, rows = 6, cw = w / cols, rh = h / rows;
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const x = i * cw + cw * 0.14, y = j * rh + rh * 0.18, ww = cw * 0.72, hh = rh * 0.55, q = R();
    const col = q < 0.42 ? (R() < 0.7 ? "#ffd27a" : "#ffb85c") : q < 0.52 ? "#9fd0ff" : "#2e3158";
    g.fillStyle = col; g.fillRect(x, y, ww, hh);
    if (q < 0.52) { g.fillStyle = "rgba(255,255,255,0.25)"; g.fillRect(x, y, ww, hh * 0.25); g.fillStyle = "rgba(60,40,40,0.35)"; g.fillRect(x + ww * 0.48, y, 3, hh); }
    g.fillStyle = "#5a5888"; g.fillRect(i * cw, j * rh + rh * 0.76, cw, rh * 0.08);
    g.fillStyle = "#3d3c66"; g.fillRect(i * cw, j * rh + rh * 0.84, cw, rh * 0.16);
    g.strokeStyle = "rgba(30,30,60,0.5)"; g.lineWidth = 2; for (let k = 0; k < 6; k++) { g.beginPath(); g.moveTo(i * cw + k * cw / 6, j * rh + rh * 0.84); g.lineTo(i * cw + k * cw / 6, j * rh + rh); g.stroke(); }
    if (R() < 0.35) { const pal = ["#e46a6a", "#f2f2f2", "#6aa0e4", "#f2cf5a"]; for (let k = 0; k < 3; k++) { g.fillStyle = pal[Math.floor(R() * pal.length)]; g.fillRect(x + k * ww * 0.3 + 4, y + hh * 0.05, ww * 0.18, hh * 0.45); } }
  }
});

/** silver laptop deck: dark keys and a trackpad */
const keyboardTex = () => printTex(512, 352, (g, w, h) => {
  g.fillStyle = "#c9ccd3"; g.fillRect(0, 0, w, h);
  const kw = (w - 60) / 14;
  for (let j = 0; j < 5; j++) for (let i = 0; i < 14; i++) { g.fillStyle = "#2b2d33"; rrect(g, 30 + i * kw + 2, 22 + j * (kw + 2), kw - 4, kw - 4, 4); g.fill(); }
  g.fillStyle = "#2b2d33"; rrect(g, 30 + 4 * kw, 22 + 5 * (kw + 2), 6 * kw, kw - 4, 4); g.fill();
  g.fillStyle = "#b9bcc4"; rrect(g, w / 2 - 90, h - 120, 180, 105, 10); g.fill();
  g.strokeStyle = "rgba(0,0,0,0.12)"; g.lineWidth = 2; rrect(g, w / 2 - 90, h - 120, 180, 105, 10); g.stroke();
});

/** a strip of four snapshots for the photo string (friends, beach, food, sunset) */
const photoTex = () => printTex(512, 160, (g) => {
  const R = rng(5);
  for (let k = 0; k < 4; k++) {
    const x = k * 128 + 6;
    g.fillStyle = "#fbfbf6"; g.fillRect(x, 4, 116, 152);
    const bg = ["#8fd3ff", "#ffcf8a", "#c8b6ff", "#ff9e9e"][k]; g.fillStyle = bg; g.fillRect(x + 8, 12, 100, 104);
    if (k === 0 || k === 2) for (let p = 0; p < 3; p++) { g.fillStyle = "#ffffff"; g.beginPath(); g.arc(x + 28 + p * 30, 60, 13, 0, 6.283); g.fill(); g.strokeStyle = "#333"; g.lineWidth = 2; g.stroke(); g.fillStyle = ["#e65", "#46c", "#3a5"][p]; g.fillRect(x + 20 + p * 30, 76, 16, 34); }
    else { g.fillStyle = k === 1 ? "#3ea1d9" : "#6d4fa0"; g.fillRect(x + 8, 80, 100, 36); g.fillStyle = "#fff3b0"; g.beginPath(); g.arc(x + 70, 52, 16, 0, 6.283); g.fill(); }
    g.fillStyle = `rgba(0,0,0,${0.05 + 0.05 * R()})`; g.fillRect(x + 8, 12, 100, 104);
  }
});

/** door roster sheet + misc stickers in one image (left: roster grid, right: round stickers) */
const rosterTex = () => printTex(512, 360, (g) => {
  g.fillStyle = "#ffffff"; g.fillRect(0, 0, 300, 360);
  g.fillStyle = "#3f7be0"; g.fillRect(0, 0, 300, 48);
  g.strokeStyle = "#9aa3b5"; g.lineWidth = 2;
  for (let j = 0; j < 8; j++) { g.beginPath(); g.moveTo(14, 70 + j * 36); g.lineTo(286, 70 + j * 36); g.stroke(); }
  for (let i = 0; i < 5; i++) { g.beginPath(); g.moveTo(14 + i * 68, 70); g.lineTo(14 + i * 68, 322); g.stroke(); }
  g.strokeStyle = "#2fa84f"; g.lineWidth = 4; for (let j = 0; j < 6; j++) { const x = 40 + ((j * 3) % 4) * 68, y = 92 + j * 36; g.beginPath(); g.moveTo(x - 8, y); g.lineTo(x, y + 8); g.lineTo(x + 14, y - 10); g.stroke(); }
  const st: [string, string][] = [["#ff6b6b", "#fff"], ["#ffd93d", "#e67e22"], ["#6bcBff", "#1e5fa8"], ["#9b7bff", "#fff"]];
  st.forEach(([c, c2], k) => { const x = 360 + (k % 2) * 90, y = 80 + Math.floor(k / 2) * 120; g.fillStyle = c; g.beginPath(); g.arc(x, y, 40, 0, 6.283); g.fill(); g.fillStyle = c2; g.beginPath(); for (let q = 0; q < 10; q++) { const rr = q % 2 ? 9 : 22, an = (q / 10) * 6.283 - Math.PI / 2; g.lineTo(x + Math.cos(an) * rr, y + Math.sin(an) * rr); } g.fill(); });
});

/** basketball leather for a SphereGeometry (u around, v pole to pole) */
const ballTex = () => printTex(512, 256, (g, w, h) => {
  g.fillStyle = "#e9792a"; g.fillRect(0, 0, w, h);
  const R = rng(9); for (let k = 0; k < 1500; k++) { g.fillStyle = `rgba(120,50,10,${0.08 + 0.1 * R()})`; g.fillRect(R() * w, R() * h, 2, 2); }
  g.strokeStyle = "#2a160a"; g.lineWidth = 6;
  g.beginPath(); g.moveTo(0, h / 2); g.lineTo(w, h / 2); g.stroke();
  for (const x of [0, w / 4, w / 2, (3 * w) / 4, w]) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
  for (const c of [w / 8, (5 * w) / 8]) { g.beginPath(); for (let y = 0; y <= h; y += 4) g.lineTo(c + Math.sin((y / h) * Math.PI) * w * 0.09, y); g.stroke(); }
}, true);

/** glass highlight streaks for window panes (white on transparent) */
const glassTex = () => printTex(256, 256, (g, w, h) => {
  g.fillStyle = "rgba(205,222,255,0.16)"; g.fillRect(0, 0, w, h);
  g.fillStyle = "rgba(255,255,255,0.3)";
  g.beginPath(); g.moveTo(w * 0.15, h); g.lineTo(w * 0.42, h); g.lineTo(w * 0.95, 0); g.lineTo(w * 0.68, 0); g.fill();
  g.fillStyle = "rgba(255,255,255,0.14)";
  g.beginPath(); g.moveTo(w * 0.5, h); g.lineTo(w * 0.58, h); g.lineTo(w * 1.1, 0); g.lineTo(w * 1.02, 0); g.fill();
});

/** sticky-note scribbles (yellow note with pen lines) */
const noteTex = (col: string) => printTex(128, 128, (g, w, h) => {
  g.fillStyle = col; g.fillRect(0, 0, w, h);
  g.fillStyle = "rgba(0,0,0,0.08)"; g.fillRect(0, 0, w, 14);
  g.strokeStyle = "rgba(30,40,90,0.75)"; g.lineWidth = 3;
  for (let k = 0; k < 4; k++) { g.beginPath(); g.moveTo(14, 36 + k * 22); for (let x = 14; x < w - 20 - (k % 2) * 30; x += 10) g.lineTo(x + 5, 36 + k * 22 + ((x / 10) % 2 ? -4 : 3)); g.stroke(); }
});

/** open notebook pages: ruled lines, handwriting squiggles, a doodle */
const notebookTex = () => printTex(512, 352, (g, w, h) => {
  g.fillStyle = "#fbfaf3"; g.fillRect(0, 0, w, h);
  g.fillStyle = "rgba(0,0,0,0.12)"; g.fillRect(w / 2 - 3, 0, 6, h);
  g.strokeStyle = "rgba(90,140,220,0.45)"; g.lineWidth = 1.5; for (let y = 40; y < h; y += 22) { g.beginPath(); g.moveTo(10, y); g.lineTo(w - 10, y); g.stroke(); }
  g.strokeStyle = "rgba(230,80,80,0.5)"; g.beginPath(); g.moveTo(40, 0); g.lineTo(40, h); g.moveTo(w / 2 + 34, 0); g.lineTo(w / 2 + 34, h); g.stroke();
  const R = rng(3); g.strokeStyle = "rgba(30,30,60,0.75)"; g.lineWidth = 2;
  for (let j = 0; j < 12; j++) for (const side of [0, 1]) { if (side && j > 6) continue; const x0 = side ? w / 2 + 44 : 48, len = 120 + R() * 90; g.beginPath(); for (let x = 0; x < len; x += 6) g.lineTo(x0 + x, 36 + j * 22 + Math.sin(x * 0.9 + j) * 3); g.stroke(); }
  g.strokeStyle = "#e5483b"; g.lineWidth = 3; g.beginPath(); g.arc(w * 0.78, h * 0.78, 30, 0, 6.283); g.stroke(); g.beginPath(); g.arc(w * 0.78 - 10, h * 0.78 - 6, 3, 0, 6.283); g.arc(w * 0.78 + 10, h * 0.78 - 6, 3, 0, 6.283); g.stroke(); g.beginPath(); g.arc(w * 0.78, h * 0.78 + 4, 14, 0.3, Math.PI - 0.3); g.stroke();
});

/** monitor screen for desk 4: a game lobby, dim blue with bright cards */
const monitorTex = () => printTex(512, 300, (g, w, h) => {
  const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, "#1b2a6b"); gr.addColorStop(1, "#5a2a7a"); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  for (let k = 0; k < 4; k++) { g.fillStyle = ["#ffcc4d", "#4dd2ff", "#ff6b9a", "#7dff9b"][k]; rrect(g, 30 + k * 118, 70, 100, 150, 10); g.fill(); g.fillStyle = "rgba(255,255,255,0.7)"; g.beginPath(); g.arc(80 + k * 118, 130, 26, 0, 6.283); g.fill(); g.fillStyle = "rgba(0,0,0,0.35)"; g.fillRect(40 + k * 118, 190, 80, 12); }
  g.fillStyle = "#ffffff"; g.font = "900 34px sans-serif"; g.fillText("PLAY", w / 2 - 44, 270);
});

// ============================================================================================================
// v2 exterior textures (the two dorm blocks, the yard, the friend's room, the sky)
// ============================================================================================================
/** facade strip tiles of the dorm blocks (200 x 60 mm, running bond, the usual Chinese campus cladding): warm cream
 *  with per-tile tone, light grout, faint rain streaks; tile 1.2 m, metric UVs */
export function facadeTiles(o: { seed?: number; color?: RGB; grout?: RGB; size?: number } = {}): W.WoodTex {
  const N = o.size ?? 1024, TU = 1.2, pm = N / TU, R = rng(o.seed ?? 404);
  const S = new Sheet(N, N), { a, h, r } = S, base = o.color ?? [228, 214, 188];
  S.fill(o.grout ?? [200, 192, 180], 60, 225);
  const rows = Math.round(TU / 0.06), cols = Math.round(TU / 0.2), TH = N / rows, TW = N / cols, gj = 0.006 * pm;
  for (let j = 0; j < rows; j++) for (let i = -1; i < cols + 1; i++) {
    const x0 = i * TW + (j % 2 ? TW / 2 : 0) + gj / 2, y0 = j * TH + gj / 2, w = TW - gj, hh = TH - gj, v = 0.93 + 0.11 * R();
    const tone: RGB = [base[0] * v + (R() - 0.5) * 6, base[1] * v, base[2] * v - (R() - 0.5) * 6];
    a.fillStyle = css(tone); a.fillRect(x0, y0, w, hh);
    h.fillStyle = grey(196); h.fillRect(x0, y0, w, hh);
    r.fillStyle = grey(100 + 50 * R()); r.fillRect(x0, y0, w, hh);
  }
  blurGrey(S.ch, 1);
  for (let k = 0; k < 18; k++) { // rain streaks below sills (drawn inside the tile, no wrap needed)
    const x = R() * (N - 20), y = R() * N * 0.5, len = (0.25 + 0.4 * R()) * pm, gr = a.createLinearGradient(0, y, 0, y + len);
    gr.addColorStop(0, "rgba(110,100,90,0)"); gr.addColorStop(0.15, "rgba(110,100,90,0.07)"); gr.addColorStop(1, "rgba(110,100,90,0)");
    a.fillStyle = gr; a.fillRect(x, y, 4 + 10 * R(), len);
  }
  S.addNoise("a", fineNoise(N, N, R, 4), 0.03);
  return S.done(new THREE.Vector2(1 / TU, 1 / TU), 0.5);
}

/** the facade windows of both blocks, 4 x 4 cells of 256 px: near-greyscale room interiors behind an aluminium frame
 *  (drawn curtains, blinds, bunk frames, shelves, hung clothes, a desk lamp). The quads' vertex colours carry the
 *  light: warm when lit, dark blue-grey at night, sky grey-blue by day; the cell decides what you see. */
const windowAtlasTex = () => printTex(1024, 1024, (g) => {
  const R = rng(515), C = 256;
  for (let cell = 0; cell < 16; cell++) {
    const ox = (cell % 4) * C, oy = Math.floor(cell / 4) * C, kind = cell % 8;
    g.save(); g.translate(ox, oy); g.beginPath(); g.rect(0, 0, C, C); g.clip();
    // the room: ceiling light falloff, back wall, floor
    const gr = g.createLinearGradient(0, 0, 0, C); gr.addColorStop(0, grey(250)); gr.addColorStop(0.55, grey(205)); gr.addColorStop(1, grey(150));
    g.fillStyle = gr; g.fillRect(0, 0, C, C);
    spot(g, C * (0.3 + 0.4 * R()), C * 0.12, C * 0.5, C * 0.3, grey(255, 0.8), grey(255, 0));
    g.strokeStyle = grey(95); g.lineWidth = 7; // a loft bed frame in the back (上床下桌)
    if (kind !== 2) { const bx = C * (0.15 + 0.4 * R()); g.strokeRect(bx, C * 0.3, C * 0.5, C * 0.18); g.beginPath(); g.moveTo(bx, C * 0.3); g.lineTo(bx, C); g.moveTo(bx + C * 0.5, C * 0.3); g.lineTo(bx + C * 0.5, C); g.stroke(); }
    g.fillStyle = grey(120); for (let k = 0; k < 6; k++) g.fillRect(C * (0.08 + 0.13 * k), C * (0.62 + 0.04 * (k % 2)), C * 0.08, C * 0.12); // shelf / books
    if (kind === 0 || kind === 6) { // curtains drawn across
      const tone = kind === 6 ? 215 : 232;
      for (const [x0, x1] of [[0, 0.52], [0.48, 1]]) { g.fillStyle = grey(tone); g.fillRect(C * x0, 0, C * (x1 - x0), C); for (let k = 0; k < 7; k++) { g.fillStyle = grey(tone - 30, 0.5); g.fillRect(C * (x0 + (x1 - x0) * (k + 0.3) / 7), 0, 5, C); } }
      if (kind === 6) { g.fillStyle = grey(150); for (let k = 0; k < 40; k++) { g.beginPath(); g.arc(R() * C, R() * C, 5, 0, 6.283); g.fill(); } }
    } else if (kind === 1 || kind === 4) { // one curtain pulled to the side
      g.fillStyle = grey(226); g.fillRect(kind === 1 ? 0 : C * 0.7, 0, C * 0.3, C);
      for (let k = 0; k < 4; k++) { g.fillStyle = grey(190, 0.6); g.fillRect((kind === 1 ? 0 : C * 0.7) + C * 0.07 * (k + 0.4), 0, 4, C); }
      if (kind === 4) { g.fillStyle = grey(80); for (let k = 0; k < 3; k++) { g.fillRect(C * (0.2 + 0.14 * k), C * 0.08, C * 0.1, C * 0.3); } }
    } else if (kind === 2) { // venetian blinds, half down
      for (let y = 0; y < C * 0.62; y += 13) { g.fillStyle = grey(236); g.fillRect(0, y, C, 9); g.fillStyle = grey(170); g.fillRect(0, y + 9, C, 2); }
    } else if (kind === 5) { // a plant on the sill and a desk lamp
      g.fillStyle = grey(70); g.beginPath(); g.ellipse(C * 0.75, C * 0.8, C * 0.12, C * 0.16, 0, 0, 6.283); g.fill(); g.fillRect(C * 0.7, C * 0.88, C * 0.1, C * 0.12);
      spot(g, C * 0.3, C * 0.7, C * 0.25, C * 0.2, grey(255, 0.9), grey(255, 0));
    } else if (kind === 7) { // dark room with a screen
      g.fillStyle = grey(95, 0.75); g.fillRect(0, 0, C, C); g.fillStyle = grey(245); g.fillRect(C * 0.35, C * 0.55, C * 0.3, C * 0.18); spot(g, C * 0.5, C * 0.64, C * 0.4, C * 0.3, grey(255, 0.35), grey(255, 0));
    }
    // aluminium frame + mullion + the sliding sash's meeting rail
    g.strokeStyle = grey(70); g.lineWidth = 16; g.strokeRect(0, 0, C, C);
    g.fillStyle = grey(70); g.fillRect(C * 0.49 - 5, 0, 10, C); g.fillStyle = grey(110); g.fillRect(C * 0.49 + 5, 0, 4, C);
    // glass sheen
    g.fillStyle = "rgba(255,255,255,0.10)"; g.beginPath(); g.moveTo(C * 0.1, C); g.lineTo(C * 0.32, C); g.lineTo(C * 0.75, 0); g.lineTo(C * 0.53, 0); g.fill();
    g.restore();
  }
});

/** the friend's room seen through their open window (back wall, 1024 x 512, warm lamp-lit): a loft bed, a curtain
 *  pushed aside, posters, a string of photos, a desk lamp's pool. Drawn already lit (MeshBasicMaterial). */
const friendRoomTex = () => printTex(1024, 512, (g, w, h) => {
  const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#f3d6a8"); gr.addColorStop(0.7, "#e7b77c"); gr.addColorStop(1, "#b98352"); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  spot(g, w * 0.3, h * 0.55, w * 0.32, h * 0.5, "rgba(255,236,190,0.9)", "rgba(255,236,190,0)");
  g.fillStyle = "#3f6fb5"; g.fillRect(w * 0.52, h * 0.08, w * 0.4, h * 0.32); g.fillStyle = "#f6efe0"; g.fillRect(w * 0.53, h * 0.12, w * 0.38, h * 0.2); // bunk + duvet
  g.strokeStyle = "#4a78c8"; g.lineWidth = 12; g.beginPath(); g.moveTo(w * 0.52, h * 0.08); g.lineTo(w * 0.52, h); g.moveTo(w * 0.92, h * 0.08); g.lineTo(w * 0.92, h); g.stroke();
  g.fillStyle = "#c98a4a"; g.fillRect(w * 0.55, h * 0.62, w * 0.35, h * 0.05); // desk under the bunk
  g.fillStyle = "#e85d75"; g.fillRect(w * 0.08, h * 0.15, w * 0.12, h * 0.26); g.fillStyle = "#7ad3a8"; g.fillRect(w * 0.24, h * 0.2, w * 0.1, h * 0.2);
  g.strokeStyle = "#7a5a3a"; g.lineWidth = 2; g.beginPath(); g.moveTo(w * 0.05, h * 0.06); g.quadraticCurveTo(w * 0.25, h * 0.12, w * 0.45, h * 0.06); g.stroke();
  for (let k = 0; k < 5; k++) { g.fillStyle = "#fbfbf6"; g.fillRect(w * (0.07 + 0.08 * k), h * 0.07, w * 0.045, h * 0.07); }
  g.fillStyle = "rgba(255,190,120,0.55)"; g.fillRect(0, 0, w * 0.06, h); g.fillRect(w * 0.94, 0, w * 0.06, h); // curtain edges
});

/** the friend as a silhouette against their lit room (256 x 512, 1.6 m tall card): round head, bean body, stick legs;
 *  the left arm holds a glowing phone up to the face, the right arm reaches out to the side (the rope hand at
 *  card u .93, v .8 from the bottom: held up above the sill). Dark warm violet so it reads on the warm wall. */
const SIL = { w: 0.72, h: 1.45, hand: [0.93, 0.8] as [number, number] };
const silhouetteTex = () => printTex(256, 512, (g, w, h) => {
  g.clearRect(0, 0, w, h);
  const ink = "#2a1c2e", U = (u: number) => u * w, Vv = (v: number) => h - v * h;
  g.strokeStyle = ink; g.lineCap = "round"; g.lineJoin = "round"; g.fillStyle = ink;
  g.lineWidth = 11; g.beginPath(); g.moveTo(U(0.44), Vv(0.42)); g.lineTo(U(0.42), Vv(0.02)); g.moveTo(U(0.56), Vv(0.42)); g.lineTo(U(0.6), Vv(0.02)); g.stroke(); // legs
  g.beginPath(); g.ellipse(U(0.5), Vv(0.56), U(0.16), h * 0.16, 0, 0, 6.283); g.fill();                                                        // bean body
  g.beginPath(); g.arc(U(0.5), Vv(0.86), U(0.15), 0, 6.283); g.fill();                                                                         // round head
  g.lineWidth = 9; g.beginPath(); g.moveTo(U(0.6), Vv(0.65)); g.lineTo(U(SIL.hand[0]), Vv(SIL.hand[1])); g.stroke();                          // rope arm
  g.beginPath(); g.moveTo(U(0.4), Vv(0.66)); g.lineTo(U(0.24), Vv(0.6)); g.lineTo(U(0.3), Vv(0.78)); g.stroke();                               // phone arm
  g.fillStyle = "#cfefff"; rrect(g, U(0.25), Vv(0.84), U(0.08), h * 0.075, 3); g.fill();                                                        // the phone's screen
});

/** soft cloud streaks (white on transparent) for the sky cards */
const cloudTex = () => printTex(512, 128, (g, w, h) => {
  const R = rng(61); g.clearRect(0, 0, w, h);
  for (let k = 0; k < 14; k++) spot(g, w * (0.12 + 0.76 * R()), h * (0.4 + 0.25 * R()), w * (0.08 + 0.12 * R()), h * (0.12 + 0.12 * R()), "rgba(255,255,255,0.55)", "rgba(255,255,255,0)");
});

/** the yard lawn (2 m tile): mown grass with clover patches and worn spots */
export function lawnTex(o: { seed?: number } = {}): W.WoodTex {
  const N = 512, TU = 2, pm = N / TU, R = rng(o.seed ?? 606), S = new Sheet(N, N), { a } = S;
  S.fill([98, 150, 74], 128, 245);
  for (let k = 0; k < 40; k++) { const x = R() * N, y = R() * N, rr = (0.1 + 0.3 * R()) * pm; S.wrap(x - rr, y - rr, x + rr, y + rr, (dx, dy) => spot(a, x + dx, y + dy, rr, rr * 0.7, css(R() < 0.5 ? [120, 168, 82] : [84, 128, 64], 0.5), css([98, 150, 74], 0))); }
  for (let k = 0; k < 2600; k++) { a.fillStyle = css(R() < 0.5 ? [140, 186, 96] : [70, 112, 56], 0.5); a.fillRect(R() * N, R() * N, 2, 4); }
  S.addNoise("h", fineNoise(N, N, R, 1), 30);
  return S.done(new THREE.Vector2(1 / TU, 1 / TU), 0.8);
}
/** concrete paving slabs (0.5 m) for the yard paths */
export function pavingTex(o: { seed?: number } = {}): W.WoodTex {
  return floorTiles({ seed: o.seed ?? 707, tile: 0.5, n: 4, size: 512, color: [196, 192, 184], grout: [140, 136, 128], scuffs: 6 });
}
/** a soft round light pool (warm white on black) for additive lamp decals */
const poolTex = () => printTex(256, 256, (g, w, h) => { g.fillStyle = "#000"; g.fillRect(0, 0, w, h); spot(g, w / 2, h / 2, w / 2, h / 2, "rgba(255,255,255,1)", "rgba(0,0,0,0)"); });
/** lit windows of the far blocks (additive overlay: black = nothing): a grid of warm / cool lit and dark windows */
const farWindowsTex = () => printTex(1024, 512, (g, w, h) => {
  const R = rng(818); g.fillStyle = "#000"; g.fillRect(0, 0, w, h);
  const cols = 16, rows = 8, cw = w / cols, rh = h / rows;
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const q = R(); if (q > 0.38) continue;
    g.fillStyle = q < 0.3 ? (R() < 0.7 ? "#ffcf86" : "#ffb35c") : "#9fd0ff";
    g.fillRect(i * cw + cw * 0.2, j * rh + rh * 0.25, cw * 0.6, rh * 0.45);
  }
});
/** the far blocks' facade (day colours, windows as darker panes): pale render with a window grid */
const farFacadeTex = () => printTex(1024, 512, (g, w, h) => {
  g.fillStyle = "#d8d2c6"; g.fillRect(0, 0, w, h);
  const cols = 16, rows = 8, cw = w / cols, rh = h / rows;
  for (let j = 0; j < rows; j++) { g.fillStyle = "#c4bdb0"; g.fillRect(0, j * rh + rh * 0.82, w, rh * 0.08); for (let i = 0; i < cols; i++) { g.fillStyle = "#6f7f93"; g.fillRect(i * cw + cw * 0.2, j * rh + rh * 0.25, cw * 0.6, rh * 0.45); } }
});

// ============================================================================================================
// geometry helpers
// ============================================================================================================
const GC = new Map<string, THREE.BufferGeometry>();
const k4 = (...n: number[]) => n.map((v) => v.toFixed(4)).join("|");
/** rounded box. (three r178's RoundedBoxGeometry assumes a unit cube when it derives normals from positions, so boxes
 *  much smaller than 1 m come out squashed with inverted normals; this applies the same rounding to a unit-cube grid
 *  and scales it correctly.) s = 1: one chamfer ring (108 tris); s = 2-3: softer (pillows, cushions). */
function roundedBox(w: number, h: number, d: number, r: number, s = 1) {
  const n = 2 * s + 1, g = new THREE.BoxGeometry(1, 1, 1, n, n, n).toNonIndexed();
  r = Math.min(r, w / 2.01, h / 2.01, d / 2.01);
  const bx = w / 2 - r, by = h / 2 - r, bz = d / 2 - r, hs = 0.5 / n, v = new THREE.Vector3();
  const p = g.attributes.position.array as Float32Array, nm = g.attributes.normal.array as Float32Array;
  for (let i = 0; i < p.length; i += 3) {
    const x = p[i], y = p[i + 1], z = p[i + 2];
    v.set(x - Math.sign(x) * hs, y - Math.sign(y) * hs, z - Math.sign(z) * hs).normalize();
    p[i] = bx * Math.sign(x) + v.x * r; p[i + 1] = by * Math.sign(y) + v.y * r; p[i + 2] = bz * Math.sign(z) + v.z * r;
    nm[i] = v.x; nm[i + 1] = v.y; nm[i + 2] = v.z;
  }
  return g;
}
/** cached rounded box */
const RB = (w: number, h: number, d: number, r = 0.006, s = 1) => {
  const k = "rb" + k4(w, h, d, r, s);
  let g = GC.get(k); if (!g) { g = roundedBox(w, h, d, r, s); GC.set(k, g); }
  return g;
};
const BX = (w: number, h: number, d: number) => { const k = "bx" + k4(w, h, d); let g = GC.get(k); if (!g) { g = new THREE.BoxGeometry(w, h, d); GC.set(k, g); } return g; };
const CY = (rt: number, rb: number, h: number, seg = 16, open = false) => { const k = "cy" + k4(rt, rb, h, seg, open ? 1 : 0); let g = GC.get(k); if (!g) { g = new THREE.CylinderGeometry(rt, rb, h, seg, 1, open); GC.set(k, g); } return g; };
const SP = (r: number, ws = 16, hs = 12) => { const k = "sp" + k4(r, ws, hs); let g = GC.get(k); if (!g) { g = new THREE.SphereGeometry(r, ws, hs); GC.set(k, g); } return g; };
const lathe = (pts: [number, number][], seg = 24) => new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), seg);
const _up = new THREE.Vector3(0, 1, 0);

/** lumpy soft box (duvet, clothes pile, bag): a subdivided box with welded vertices and smooth noise on the top */
function lumpy(w: number, h: number, d: number, seed: number, amp = 0.45, seg: V3 = [10, 2, 14], droop = 0.35) {
  let g: THREE.BufferGeometry = new THREE.BoxGeometry(w, h, d, seg[0], seg[1], seg[2]);
  g.deleteAttribute("normal"); g.deleteAttribute("uv");
  g = mergeVertices(g, 1e-5);
  const p = g.attributes.position, R = rng(seed), ph = Array.from({ length: 6 }, () => R() * 6.283);
  for (let i = 0; i < p.count; i++) {
    let x = p.getX(i), y = p.getY(i); const z = p.getZ(i);
    const u = x / w, v = z / d, top = (y + h / 2) / h;
    const n = 0.55 * Math.sin(u * 9 + ph[0]) * Math.sin(v * 7 + ph[1]) + 0.3 * Math.sin(u * 17 + v * 11 + ph[2]) + 0.18 * Math.sin(v * 23 + ph[3]);
    y += h * amp * n * top;
    const edge = Math.max(Math.abs(u), Math.abs(v)) * 2;
    y -= h * droop * Math.pow(edge, 5) * top;
    x *= 1 + 0.05 * top * (0.5 + 0.5 * Math.sin(v * 13 + ph[4]));
    p.setXYZ(i, x, y, z);
  }
  g.computeVertexNormals();
  return g;
}
/** vertical pleated fabric hanging from y = 0 down to -height (curtains); uv in metres (u across, v up) */
function pleats(width: number, height: number, n: number, depth: number, seed: number) {
  const sx = Math.max(8, Math.round(n * 8)), g = new THREE.PlaneGeometry(width, height, sx, 8);
  g.translate(0, -height / 2, 0);
  const p = g.attributes.position, uv = g.attributes.uv, R = rng(seed), ph = R() * 6.28;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), u = x / width + 0.5, fall = -y / height;
    p.setZ(i, depth * Math.sin(u * n * Math.PI * 2 + ph * 0.2) * (1 + 0.35 * fall) + 0.01 * Math.sin(y * 9 + ph + u * 5));
    uv.setXY(i, u * width * 1.6, (y + height));
  }
  g.computeVertexNormals();
  return g;
}

// ============================================================================================================
// the set
// ============================================================================================================
export type DormLight = "evening" | "dawn" | "day" | "night";
export type DormOpts = {
  seed?: number;
  /** desk lamps cast shadows (default true). Four 512 px spot shadow maps; set false on very slow renders */
  lampShadows?: boolean;
  lampShadowSize?: number;
  /** merge static meshes per material into a few dozen draw calls (default true) */
  merge?: boolean;
  /** textures for the two screens (defaults: placeholder contact list / video site) */
  phoneScreen?: THREE.Texture;
  laptopScreen?: THREE.Texture;
  /** overall multiplier on the four desk lamps (default 1) */
  lampGain?: number;
  /** the light state the set starts in (default "evening", the approved look). Switch any time: setLight / setTime */
  light?: DormLight;
  /** v1 switch, still honoured: false = start in setLight("night") */
  overhead?: boolean;
  /** multiplier on the two ceiling battens (default 1) */
  overheadGain?: number;
  /** ceiling battens cast shadows (default true; two 1024 px spot maps) */
  overheadShadows?: boolean;
  /** the WebGLRenderer: bakes the day / night / sky PMREMs (DORM_FILL_DAY, DORM_FILL_NIGHT, DORM_SKY, ~0.2 s each on
   *  SwiftShader) that dawn / day / night / setTime use. Without it every state tints the evening fill instead. */
  renderer?: THREE.WebGLRenderer;
  /** the sun: a shadow-casting directional light (2048 px) for the dawn key, the time-lapse sun patch and the night sky
   *  light through the window. Default true; false saves one shadow map in evening-only shots (no sun patch then). */
  sun?: boolean;
  /** build the outside (our block's facade, the block across the yard, the yard, far blocks, sky). Default true. */
  exterior?: boolean;
  /** where the friend's window is (x of its centre in the block across the yard; default -2.0) */
  friendX?: number;
  /** yaw of the block across the yard about the vertical through the friend's window (radians, default .56 = 32 deg):
   *  its facade turns toward the -x end of the yard, so the end shot (cams.exterior, from -x) sees the friend's window
   *  at ~40 deg instead of edge-on. 0 = parallel to our block (cams.exterior then needs re-framing) */
  friendYaw?: number;
};
/** a spot for one of the line-01 friends (or anyone). `pos` by pose:
 *   stand: the point under the feet (y = the surface: 0 floor, 0.012 rug / threshold, rung top on a ladder) -> cast `at` (+ `floor` = pos.y)
 *   sit:   the seat-surface centre -> cast `seat: { top: pos, front }`
 *   lie:   the mattress point under the hip -> cast `bed: { top: pos }`, facing = hip -> head yaw */
export type Perch = {
  name: string; pose: "stand" | "sit" | "lie"; pos: THREE.Vector3;
  /** yaw the person faces, cast.ts convention atan2(dx, dz) (0 = +z toward the door, PI = toward the window) */
  facing: number;
  /** sit: m from pos to the seat's front edge (cast seat.front); deskEdge / deskTop when at a desk */
  front?: number; deskEdge?: number; deskTop?: number;
  /** free radius (m) checked round the body axis, and the highest point the head may reach (ceiling / bed above) */
  clear: number; headroom: number;
  /** a world point a free hand can rest on / grip (ladder stile, bed rail, door frame) */
  grip?: THREE.Vector3;
  /** cams this spot reads from without the card crossing geometry */
  cams: string[];
  /** in the recommended 10-friend line-01 set (all visible together in cams.wide / cams.hookEnd) */
  line01: boolean;
  note: string;
};
export type DormAnchors = {
  [k: string]: unknown;
  // v1 floor spots (kept): chairs, aisle middle, the bunk-3 mattress, the phone centre, the v1 knot point
  desk1: THREE.Vector3; desk2: THREE.Vector3; desk3: THREE.Vector3; desk4: THREE.Vector3; bed: THREE.Vector3;
  middle: THREE.Vector3; balcony: THREE.Vector3; ladderKnot: THREE.Vector3; windowsill: THREE.Vector3;
  /** "you", mid-floor (line 01) and the yaw that faces cams.wide */
  you: THREE.Vector3; youFacing: number;
  perches: Perch[];
  /** the bunk-ladder post that takes the line-02 knot: round stile of your loft's ladder (room side). Wrap between
   *  yMin and yMax (the rungs above and below); pos = the middle of that free span on the axis */
  ladderPost: { pos: THREE.Vector3; axis: THREE.Vector3; radius: number; yMin: number; yMax: number };
  /** you curled in your top bunk (lines 11-16): mattress point under the hip, facing = yaw hip -> head (pillow),
   *  mattress top, pillow centre, and the free span along the aisle-side rail where a rope can come over (rail top y) */
  youBunk: { top: THREE.Vector3; facing: number; mattressTop: number; pillow: THREE.Vector3; railTop: number; ladderTop: THREE.Vector3 };
  /** your desk (上床下桌, under youBunk): chair seat, facing (toward the desk), desk edge distance, desk top, the lamp
   *  head and its switch on the base, where the phone rests */
  youDesk: { seat: THREE.Vector3; facing: number; deskEdge: number; deskTop: number; lampHead: THREE.Vector3; lampSwitch: THREE.Vector3; phone: THREE.Vector3 };
  /** the phone's screen centre at rest (the v1 anchor, a Vector3); D.phone has the prop itself */
  phone: THREE.Vector3;
  /** the entrance doorway (floor point on the threshold, for the roommate's grin, line 16; door open via setDoorOpen)
   *  doorInside: just inside the room, doorFacing: yaw that faces into the room */
  door: THREE.Vector3; doorInside: THREE.Vector3; doorFacing: number;
  /** the window that opens (setWindowOpen): the clear aperture at full open (on the sash plane), its centre, the
   *  outward normal (-z), points 0.8 m outside and inside on the centre line, and openX(u) gives the aperture's
   *  right..left x at opening u */
  window: { centre: THREE.Vector3; normal: THREE.Vector3; x0: number; x1: number; y0: number; y1: number; z: number; outside: THREE.Vector3; inside: THREE.Vector3; openX: (u: number) => [number, number] };
  /** the friend's window across the yard (line 19). World: centre of the open half, outward normal (the block is
   *  turned by `yaw` about the vertical through the window, so normal = (-sin yaw, 0, cos yaw)), the silhouette's rope
   *  hand, a point inside their room. The aperture x0..x1 / y0..y1 on the plane z is in the block's own (unturned)
   *  frame: toLocal(p) maps a world point into it, toWorld(p) back */
  friendWindow: { centre: THREE.Vector3; normal: THREE.Vector3; x0: number; x1: number; y0: number; y1: number; z: number; hand: THREE.Vector3; room: THREE.Vector3;
    yaw: number; toLocal: (p: THREE.Vector3) => THREE.Vector3; toWorld: (p: THREE.Vector3) => THREE.Vector3 };
  /** rope routes checked against the set's colliders (polylines; run a smooth curve through them):
   *  routeOut = phone -> up out of the desk -> aisle -> through the window aperture -> the friend's hand (line 19)
   *  routeIn  = from the classroom side outside -> through the aperture -> down the aisle to youBunk's rail (line 11) */
  routeOut: THREE.Vector3[]; routeIn: THREE.Vector3[];
};
export type DormSet = {
  group: THREE.Group;
  anchors: DormAnchors;
  /** 9:16 cams; roll (radians about the view axis) / up are optional: camera.up.set(...up ?? [0,1,0]);
   *  camera.position.set(...pos); camera.lookAt(...look); camera.rotateZ(roll ?? 0) */
  cams: Record<string, Cam>;
  /** every light, already parented inside group */
  lights: THREE.Object3D[];
  animate: (t: number) => void;
  /** presets: "evening" (lines 01-02: battens + four desk lamps, deep blue dusk window: the approved look),
   *  "dawn" (lines 11-16: lamps off, cool window key), "day" (= setTime(.5)), "night" (= setTime(1): your lamp only) */
  setLight: (s: DormLight) => void;
  /** the line-17 time-lapse, dawn (0) -> sunrise (.1) -> noon (.5) -> sunset (.8, the low sun straight in through the
   *  window and French door: an orange streak down the aisle) -> dusk -> night (1): sun patch and shadows sweep the
   *  room, sky / window / facade lights follow, your desk lamp clicks on at o.lampAt (.93).
   *  o.roommates: the other three lamps come on too, just after yours. Pure function of u. */
  setTime: (u: number, o?: { lampAt?: number; roommates?: boolean; battens?: boolean }) => void;
  /** 0 closed .. 1 the right sash slid fully over the left (aperture 0.62 x 1.4 m). The approved look is .385 */
  setWindowOpen: (u: number) => void;
  /** the entrance door, 0 closed .. 1 open 90 deg into the room (its leaf ends along x = -0.45, clear of the lockers) */
  setDoorOpen: (u: number) => void;
  /** the glazed French door by the window, 0 closed .. 1 open 90 deg into the room */
  setFrenchDoorOpen: (u: number) => void;
  /** the friend's window across the yard: lit room (0..1) and the silhouette (shown only while lit > 0) */
  setFriend: (o: { lit?: number; figure?: boolean }) => void;
  /** per-lamp level 0..1 in order [your lamp (desk 1), desk 2, desk 3, desk 4] (setLight / setTime set these too) */
  setLamps: (k: number[]) => void;
  /** fraction of the facade windows (both blocks) lit, 0..1, overriding the hour's value until the next setLight /
   *  setTime (evening .42, night .2). The friend's window is separate (setFriend); e.g. setFacade(.08) for the end shot */
  setFacade: (litFrac: number) => void;
  /** the phone prop (not merged): group at rest on your desk (move / rotate it to pick it up), the screen plane
   *  (0.068 x 0.148 m, UV 0..1, image top = phone top; MeshBasicMaterial: swap .map for a CanvasTexture), the
   *  screen's outward normal and "up" (toward the phone's top) in group space */
  phone: { group: THREE.Group; screen: THREE.Mesh; screenSize: [number, number]; rest: { pos: THREE.Vector3; quat: THREE.Quaternion } };
  /** v1 field: the phone screen mesh */
  phoneScreen: THREE.Mesh;
  laptopScreen: THREE.Mesh;
  windowLight: THREE.DirectionalLight;
  /** the sun (null when opts.sun is false) */
  sun: THREE.DirectionalLight | null;
  lamps: THREE.SpotLight[];
  ceilingLights: THREE.SpotLight[];
  /** collision proxies: world boxes of the furniture and props (pre-merge mesh bounds, walls excluded) for 穿模 checks
   *  of cards and ropes; `kind` "support" marks seats, mattresses, the sill, rungs (things a body may rest on) */
  colliders: { name: string; box: THREE.Box3; kind: "solid" | "support" }[];
  /** the two env rigs (interior / exterior) the light states drive; exposed for custom looks */
  envRigs: { interior: EnvRig; exterior: EnvRig };
  /** triangle count of the built set */
  tris: number;
};

/** room extents (metres) */
export const DORM = { hx: 1.8, hz: 3.0, ceil: 3.0, deskY: 0.765, bedY: 1.66, mattressTop: 1.775 };

export function buildDorm(M: Mats, opts: DormOpts = {}): DormSet {
  const root = new THREE.Group(); root.name = "dorm";
  const HX = DORM.hx, HZ = DORM.hz, CH = DORM.ceil, DT = DORM.deskY;
  const keep = new Set<THREE.Object3D>();              // meshes not merged (animated / re-texturable)
  const animFns: ((t: number) => void)[] = [];
  const lights: THREE.Object3D[] = [];

  // ---------------- materials ----------------
  const pc = powderCoat();
  const pcMaps = (rep = 1) => W.woodMaps(pc, [pc.repeatPerMetre.x * rep, pc.repeatPerMetre.y * rep]);
  const floorT = floorTiles();
  const floorM = M.paint({ ...W.woodMaps(floorT), specular: 0.7 });
  const balcFloorM = M.paint({ ...W.woodMaps(floorTiles({ seed: 7, tile: 0.3, n: 6, size: 1024, color: [200, 196, 190], grout: [120, 116, 110], scuffs: 10 })), specular: 0.5 });
  const wallT = tiledWall();
  const wallM = M.paint({ ...W.woodMaps(wallT), specular: 0.55 });
  const revealM = M.paint({ ...pcMaps(0.5), color: "#efe6d4", roughness: 1, specular: 0.3 });
  const ceilM = M.paint({ ...W.woodMaps(ceilingPlaster()), specular: 0.15 });
  // art pass: bold colour blocking instead of beige-on-beige. Cornflower-blue powder-coated bed frames (they echo the
  // blue accent tiles), honey wood desks and cabinets, mustard lockers, cream walls over white glazed tiles.
  const frameM = M.paint({ ...pcMaps(), color: "#5a8fd8" });
  const greyFrameM = M.paint({ ...pcMaps(), color: "#5d6370" });
  const lockerM = M.paint({ ...pcMaps(), color: "#e8b440" });
  const lockerDoorT = lockerDoor();
  const lockerDoorM = M.paint({ map: lockerDoorT.map, bumpMap: lockerDoorT.bump, bumpScale: lockerDoorT.bumpScale, roughnessMap: lockerDoorT.rough, roughness: 1, color: "#e8b440" });
  const lockerDoorM2 = M.paint({ map: lockerDoorT.map, bumpMap: lockerDoorT.bump, bumpScale: lockerDoorT.bumpScale, roughnessMap: lockerDoorT.rough, roughness: 1, color: "#f0c45a" });
  // pale birch laminate; the desks sit under the beds, so they see less of the room's fill (the lamp pools read)
  // desk tops: printed maple laminate with marks; the desks sit under the beds, so they get less of the room's fill
  // (envMapIntensity) and the warm lamp pools read as the key there
  const deskWood = W.edgeWear(M.wood({ ...W.woodMaps(deskLaminate()), envMapIntensity: 0.42, specular: 0.55 }), { k: 0.14, w: 0.006 });
  const panelWood = W.edgeWear(M.wood({ ...W.woodMaps(W.railCap({ color: [238, 196, 140], grain: 1.6, seed: 57 })), envMapIntensity: 0.85 }), { k: 0.12, w: 0.006 });
  const doorWood = M.wood(W.woodMaps(W.carriageWood({ color: [190, 120, 76], seed: 12 })));
  const cardM = M.wood(W.woodMaps(cardboard()));
  const tapeM = M.paint({ color: "#d9c79a", roughness: 0.35 });
  const blackM = M.paint({ color: "#26272c", roughness: 0.5 });
  const darkPl = M.paint({ color: "#3a3d46", roughness: 0.45 });
  const whitePl = M.paint({ color: "#f4f3ef", roughness: 0.42 });
  const chrome = M.metalWith({ color: "#d8dbe0", roughness: 0.2 });
  const alu = M.metalWith({ color: "#c4c8ce", roughness: 0.32 });
  const steel = M.metalWith({ color: "#dfe2e6", roughness: 0.16 });
  const paperM = M.paint({ color: "#fbf9f2", roughness: 0.9, specular: 0.2 });
  const plC = new Map<string, THREE.Material>();
  /** plastic / painted colour (cached) */
  const pl = (c: string, rough = 0.45) => { const k = c + rough; let m = plC.get(k); if (!m) { m = M.paint({ color: c, roughness: rough }); plC.set(k, m); } return m; };
  const fab = (base: RGB, pattern: FabricPattern = "plain", accent?: RGB, accent2?: RGB, tile = 0.4, seed = 1, side: THREE.Side = THREE.FrontSide) =>
    M.wood({ ...W.woodMaps(fabric({ base, pattern, accent, accent2, tile, seed })), specular: 0.25, side });
  const basic = (c: THREE.ColorRepresentation, o: THREE.MeshBasicMaterialParameters = {}) => new THREE.MeshBasicMaterial({ color: c, ...o });
  // v2 outside: PBR materials flagged `ext` take the exterior env rig (sky fill per hour) instead of the room's
  const extTag = <T extends THREE.Material>(m: T) => { m.userData.ext = true; return m; };
  const facadeM = extTag(M.paint({ ...W.woodMaps(facadeTiles()), specular: 0.3 }));
  const bandM = extTag(M.paint({ ...W.woodMaps(facadeTiles({ seed: 9, color: [204, 124, 94], grout: [176, 150, 132] })), specular: 0.3 }));
  const trimM = extTag(M.paint({ color: "#ece8e0", roughness: 0.5 }));
  const extGreyM = extTag(M.paint({ color: "#9ea3a8", roughness: 0.55 }));
  const extDarkM = extTag(M.paint({ color: "#4a4e57", roughness: 0.5 }));
  const extAlu = extTag(M.metalWith({ color: "#c4c8ce", roughness: 0.32 }));
  const lawnM = extTag(M.wood({ ...W.woodMaps(lawnTex()), specular: 0.2 }));
  const pavingM = extTag(M.paint({ ...W.woodMaps(pavingTex()), specular: 0.35 }));
  const leafM = extTag(M.paint({ color: "#4f8a4a", roughness: 0.85, specular: 0.2 }));
  const leaf2M = extTag(M.paint({ color: "#3f7740", roughness: 0.85, specular: 0.2 }));
  const barkM = extTag(M.paint({ color: "#6b4a34", roughness: 0.9 }));
  const roofM = extTag(M.paint({ color: "#8e8a84", roughness: 0.8 }));
  // the corridor outside the entrance door: white walls over a green dado, grey terrazzo-like tiles
  const corrWallM = M.paint({ ...W.woodMaps(wallPaint({ seed: 31, upper: [238, 236, 230], lower: [120, 168, 140], dado: 1.2 })), specular: 0.4 });
  const corrFloorM = M.paint({ ...W.woodMaps(floorTiles({ seed: 33, size: 1024, color: [204, 202, 196], grout: [150, 146, 140], scuffs: 20 })), specular: 0.6 });
  const extPl = new Map<string, THREE.Material>();
  const xpl = (c: string, rough = 0.5) => { let m = extPl.get(c + rough); if (!m) { m = extTag(M.paint({ color: c, roughness: rough })); extPl.set(c + rough, m); } return m; };

  // ---------------- placement helpers ----------------
  const put = (parent: THREE.Object3D, geo: THREE.BufferGeometry, mat: THREE.Material, x: number, y: number, z: number, ry = 0, rx = 0, rz = 0, shadow = true) => {
    const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.rotation.set(rx, ry, rz, "YXZ"); // tilt first, then yaw
    m.castShadow = shadow; m.receiveShadow = true; parent.add(m); return m;
  };
  /** box from min/max corners (r > 0: rounded) */
  const boxAt = (parent: THREE.Object3D, mat: THREE.Material, x0: number, y0: number, z0: number, x1: number, y1: number, z1: number, r = 0) => {
    const w = Math.abs(x1 - x0), h = Math.abs(y1 - y0), d = Math.abs(z1 - z0);
    return put(parent, r > 0 ? RB(w, h, d, r) : BX(w, h, d), mat, (x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
  };
  /** cylinder rod between two points */
  const rod = (parent: THREE.Object3D, mat: THREE.Material, a: THREE.Vector3, b: THREE.Vector3, r: number, seg = 8) => {
    const d = new THREE.Vector3().subVectors(b, a), len = d.length();
    const m = put(parent, CY(r, r, len, seg), mat, 0, 0, 0);
    m.position.copy(a).addScaledVector(d, 0.5); m.quaternion.setFromUnitVectors(_up, d.normalize());
    return m;
  };
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  /** flat picture (poster, note, screen) facing +z in `parent`'s frame; uv01 so metricUV leaves it alone */
  const pic = (parent: THREE.Object3D, mat: THREE.Material, w: number, h: number, x: number, y: number, z: number, ry = 0, rx = 0, rz = 0, curl = 0) => {
    const g = new THREE.PlaneGeometry(w, h, curl ? 4 : 1, curl ? 4 : 1);
    if (curl) { const p = g.attributes.position; for (let i = 0; i < p.count; i++) { const u = p.getX(i) / w + 0.5, v = p.getY(i) / h + 0.5; p.setZ(i, curl * (Math.pow(Math.max(0, u - 0.75) * 4, 2) * Math.pow(Math.max(0, 0.25 - v) * 4, 2) + 0.15 * Math.sin(u * 3.1))); } g.computeVertexNormals(); }
    const m = put(parent, g, mat, x, y, z, ry, rx, rz, false); m.userData.uv01 = true; return m;
  };
  const R = rng(opts.seed ?? 2026);

  // ---------------- room shell ----------------
  const shell = new THREE.Group(); shell.name = "shell"; root.add(shell);
  { // floor (uv in metres)
    const g = new THREE.PlaneGeometry(2 * HX, 2 * HZ); g.rotateX(-Math.PI / 2);
    const m = put(shell, g, floorM, 0, 0, 0, 0, 0, 0, false); m.name = "floor";
  }
  // side walls: planes in world coords with y from 0..CH so metricUV gives u along the wall, v = height
  for (const s of [-1, 1]) {
    const g = new THREE.PlaneGeometry(2 * HZ, CH); g.translate(0, CH / 2, 0); g.rotateY(s < 0 ? Math.PI / 2 : -Math.PI / 2); g.translate(s * HX, 0, 0);
    put(shell, g, wallM, 0, 0, 0);
  }
  // far wall (balcony side, z = -HZ) with a window and a door, near wall (entrance) with a door
  const WIN = { x0: -1.55, x1: -0.15, y0: 0.9, y1: 2.4 }, BDOOR = { x0: 0.2, x1: 1.1, y1: 2.15 }, EDOOR = { x0: -0.45, x1: 0.45, y1: 2.1 };
  const SILL_Z = -HZ + 0.3; // front edge of the deep sill board
  {
    const sh = new THREE.Shape([V(-HX, 0, 0), V(HX, 0, 0), V(HX, CH, 0), V(-HX, CH, 0)].map((v) => new THREE.Vector2(v.x, v.y)));
    const hw = new THREE.Path([[WIN.x0, WIN.y0], [WIN.x1, WIN.y0], [WIN.x1, WIN.y1], [WIN.x0, WIN.y1]].map(([x, y]) => new THREE.Vector2(x, y)));
    const hd = new THREE.Path([[BDOOR.x0, 0], [BDOOR.x1, 0], [BDOOR.x1, BDOOR.y1], [BDOOR.x0, BDOOR.y1]].map(([x, y]) => new THREE.Vector2(x, y)));
    sh.holes.push(hw, hd);
    const g = new THREE.ShapeGeometry(sh); g.translate(0, 0, -HZ);
    put(shell, g, wallM, 0, 0, 0);
    // outer face (our block's facade: the same strip tiles as the rest of the block) so the wall has thickness for
    // shadows and holds up from outside
    const g2 = new THREE.ShapeGeometry(sh); g2.rotateY(Math.PI); g2.translate(0, 0, -HZ - 0.2);
    put(shell, g2, facadeM, 0, 0, 0);
    // reveals (wall thickness round the openings)
    const T = 0.2, z0 = -HZ - T, z1 = -HZ, rv = revealM;
    boxAt(shell, rv, WIN.x0 - 0.01, WIN.y0 - 0.02, z0, WIN.x0, WIN.y1, z1); boxAt(shell, rv, WIN.x1, WIN.y0 - 0.02, z0, WIN.x1 + 0.01, WIN.y1, z1);
    boxAt(shell, rv, WIN.x0, WIN.y1, z0, WIN.x1, WIN.y1 + 0.01, z1);
    boxAt(shell, rv, BDOOR.x0 - 0.01, 0, z0, BDOOR.x0, BDOOR.y1, z1); boxAt(shell, rv, BDOOR.x1, 0, z0, BDOOR.x1 + 0.01, BDOOR.y1, z1);
    boxAt(shell, rv, BDOOR.x0, BDOOR.y1, z0, BDOOR.x1, BDOOR.y1 + 0.01, z1);
    boxAt(shell, pl("#d9d2c6", 0.3), BDOOR.x0, -0.02, z0 - 0.02, BDOOR.x1, 0.012, z1 + 0.02, 0.004); // stone threshold
    // v2: a deep stone sill board (0.3 m into the room) a friend can sit on; the window frame stands on its back edge.
    // A thin apron under its front edge, and the outside sill below the frame.
    boxAt(shell, pl("#e9e4dc", 0.3), WIN.x0 - 0.06, WIN.y0 - 0.04, z0 + 0.02, WIN.x1 + 0.06, WIN.y0, SILL_Z, 0.006);
    boxAt(shell, pl("#ded8cf", 0.4), WIN.x0 - 0.02, WIN.y0 - 0.1, SILL_Z - 0.03, WIN.x1 + 0.02, WIN.y0 - 0.04, SILL_Z - 0.01, 0.004);
    boxAt(shell, trimM, WIN.x0 - 0.04, WIN.y0 - 0.05, z0 - 0.08, WIN.x1 + 0.04, WIN.y0, z0 + 0.02, 0.006);
    // near wall: room face, corridor face (0.2 m thick), reveals and a stone threshold in the doorway
    const sn = new THREE.Shape([[-HX, 0], [HX, 0], [HX, CH], [-HX, CH]].map(([x, y]) => new THREE.Vector2(x, y)));
    sn.holes.push(new THREE.Path([[EDOOR.x0, 0], [EDOOR.x1, 0], [EDOOR.x1, EDOOR.y1], [EDOOR.x0, EDOOR.y1]].map(([x, y]) => new THREE.Vector2(x, y))));
    const gn = new THREE.ShapeGeometry(sn); gn.rotateY(Math.PI); gn.translate(0, 0, HZ);
    put(shell, gn, wallM, 0, 0, 0);
    const sc = new THREE.Shape([[-4, 0], [4, 0], [4, 2.9], [-4, 2.9]].map(([x, y]) => new THREE.Vector2(x, y)));
    sc.holes.push(new THREE.Path([[EDOOR.x0, 0], [EDOOR.x1, 0], [EDOOR.x1, EDOOR.y1], [EDOOR.x0, EDOOR.y1]].map(([x, y]) => new THREE.Vector2(x, y))));
    const gc = new THREE.ShapeGeometry(sc); gc.translate(0, 0, HZ + 0.2);
    put(shell, gc, corrWallM, 0, 0, 0);
    boxAt(shell, rv, EDOOR.x0 - 0.01, 0, HZ, EDOOR.x0, EDOOR.y1, HZ + 0.2); boxAt(shell, rv, EDOOR.x1, 0, HZ, EDOOR.x1 + 0.01, EDOOR.y1, HZ + 0.2);
    boxAt(shell, rv, EDOOR.x0, EDOOR.y1, HZ, EDOOR.x1, EDOOR.y1 + 0.01, HZ + 0.2);
    boxAt(shell, pl("#cfc8bc", 0.35), EDOOR.x0, -0.02, HZ - 0.02, EDOOR.x1, 0.012, HZ + 0.22, 0.004);
  }
  { // ceiling + cornice
    const g = new THREE.PlaneGeometry(2 * HX, 2 * HZ); g.rotateX(Math.PI / 2); g.translate(0, CH, 0);
    put(shell, g, ceilM, 0, 0, 0);
    for (const s of [-1, 1]) boxAt(shell, ceilM, s * HX - 0.03, CH - 0.05, -HZ, s * HX + 0.03, CH, HZ);
  }

  // ---------------- entrance door (near wall, z = +HZ) ----------------
  const doorLeaf = new THREE.Group(); doorLeaf.name = "doorLeaf";
  {
    const g = new THREE.Group(); g.position.set(0, 0, HZ); root.add(g);
    // frame
    boxAt(g, doorWood, EDOOR.x0 - 0.07, 0, -0.03, EDOOR.x0, EDOOR.y1 + 0.07, 0.02, 0.008);
    boxAt(g, doorWood, EDOOR.x1, 0, -0.03, EDOOR.x1 + 0.07, EDOOR.y1 + 0.07, 0.02, 0.008);
    boxAt(g, doorWood, EDOOR.x0, EDOOR.y1, -0.03, EDOOR.x1, EDOOR.y1 + 0.07, 0.02, 0.008);
    // leaf with panel mouldings, hinged on its left edge (x0): setDoorOpen swings it 90 deg into the room. `lf` keeps
    // the v1 coordinates inside the pivot group.
    doorLeaf.position.set(EDOOR.x0 + 0.005, 0, -0.04); g.add(doorLeaf); keep.add(doorLeaf);
    const lf = new THREE.Group(); lf.position.set(-(EDOOR.x0 + 0.005), 0, 0.04); doorLeaf.add(lf);
    boxAt(lf, doorWood, EDOOR.x0 + 0.005, 0.02, -0.06, EDOOR.x1 - 0.005, EDOOR.y1 - 0.005, -0.02, 0.006);
    for (const [y0, y1] of [[0.18, 0.95], [1.1, 1.95]]) boxAt(lf, doorWood, EDOOR.x0 + 0.1, y0, -0.075, EDOOR.x1 - 0.1, y1, -0.06, 0.008);
    // lever handles (both faces) + lock
    put(lf, CY(0.03, 0.03, 0.02, 16), chrome, EDOOR.x1 - 0.1, 1.0, -0.08, 0, Math.PI / 2);
    boxAt(lf, chrome, EDOOR.x1 - 0.22, 0.99, -0.11, EDOOR.x1 - 0.1, 1.01, -0.09, 0.005);
    put(lf, CY(0.012, 0.012, 0.05, 12), chrome, EDOOR.x1 - 0.1, 1.0, -0.095, 0, Math.PI / 2);
    put(lf, CY(0.03, 0.03, 0.02, 16), chrome, EDOOR.x1 - 0.1, 1.0, -0.002, 0, Math.PI / 2);
    boxAt(lf, chrome, EDOOR.x1 - 0.22, 0.99, 0.0, EDOOR.x1 - 0.1, 1.01, 0.02, 0.005);
    // roster sheet + stickers on the door, full-length mirror strip
    const rM = M.paint({ map: rosterTex(), roughness: 0.7 });
    const ro = pic(lf, rM, 0.3, 0.36, 0, 1.55, -0.079, Math.PI); (ro.geometry as THREE.PlaneGeometry).attributes.uv.array.set([0, 1, 300 / 512, 1, 0, 0, 300 / 512, 0]); ro.geometry.attributes.uv.needsUpdate = true;
    // corridor-side architrave
    boxAt(g, doorWood, EDOOR.x0 - 0.07, 0, 0.2, EDOOR.x0, EDOOR.y1 + 0.07, 0.23, 0.008);
    boxAt(g, doorWood, EDOOR.x1, 0, 0.2, EDOOR.x1 + 0.07, EDOOR.y1 + 0.07, 0.23, 0.008);
    boxAt(g, doorWood, EDOOR.x0, EDOOR.y1, 0.2, EDOOR.x1, EDOOR.y1 + 0.07, 0.23, 0.008);
    // hooks with a towel and a backpack beside the door
    boxAt(g, chrome, EDOOR.x1 + 0.12, 1.62, -0.03, EDOOR.x1 + 0.62, 1.66, -0.01, 0.005);
    const towel = put(g, lumpy(0.2, 0.55, 0.04, 31, 0.15, [3, 8, 2], 0), fab([255, 196, 92], "stripe", [255, 255, 255], [240, 120, 60], 0.3, 4), EDOOR.x1 + 0.25, 1.36, -0.05);
    towel.rotation.z = 0.04;
    const bag = put(g, lumpy(0.3, 0.42, 0.16, 32, 0.12, [4, 5, 3], 0.1), pl("#2f4f8f", 0.7), EDOOR.x1 + 0.5, 1.3, -0.1);
    bag.rotation.z = -0.05;
    // wall clock above the door
    put(g, CY(0.17, 0.17, 0.045, 32), pl("#e5484d", 0.35), 0, 2.48, -0.0225, 0, Math.PI / 2);
    pic(g, M.paint({ map: clockTex(), roughness: 0.35 }), 0.3, 0.3, 0, 2.48, -0.046, Math.PI);
    // light switches
    boxAt(g, whitePl, EDOOR.x0 - 0.3, 1.28, -0.012, EDOOR.x0 - 0.18, 1.4, 0, 0.006);
    boxAt(g, whitePl, EDOOR.x0 - 0.15, 1.28, -0.012, EDOOR.x0 - 0.03, 1.4, 0, 0.006);
  }

  // ---------------- v2: the corridor outside the entrance door (seen through the open door, line 16) ----------------
  // 2 m wide, white over a green dado, a fluorescent panel and a short-range light, the door of the room opposite
  // (offset, plain number plate), a red hydrant cabinet, a notice board. Ends closed at x = +-4.
  let corridorLight: THREE.PointLight;
  const corrPanelM = basic(new THREE.Color(2.4, 2.45, 2.5));
  {
    const g = new THREE.Group(); g.name = "corridor"; g.position.set(0, 0, HZ); root.add(g);
    const CW = 2.2, CHt = 2.9;
    const fl = new THREE.PlaneGeometry(8, CW); fl.rotateX(-Math.PI / 2); put(g, fl, corrFloorM, 0, 0, CW / 2, 0, 0, 0, false);
    const ce = new THREE.PlaneGeometry(8, CW); ce.rotateX(Math.PI / 2); put(g, ce, ceilM, 0, CHt, CW / 2, 0, 0, 0, false);
    const fw = new THREE.PlaneGeometry(8, CHt); fw.translate(0, CHt / 2, 0); fw.rotateY(Math.PI); put(g, fw, corrWallM, 0, 0, CW);
    for (const s of [-1, 1]) { const ew = new THREE.PlaneGeometry(CW, CHt); ew.translate(0, CHt / 2, 0); ew.rotateY(s < 0 ? Math.PI / 2 : -Math.PI / 2); put(g, ew, corrWallM, s * 4, 0, CW / 2); }
    // the room opposite: door leaf in a frame, number plate, handle
    const ox = 1.15;
    boxAt(g, doorWood, ox - 0.52, 0, CW - 0.03, ox + 0.52, 2.17, CW, 0.008);
    boxAt(g, doorWood, ox - 0.45, 0.01, CW - 0.06, ox + 0.45, 2.1, CW - 0.03, 0.006);
    for (const [y0, y1] of [[0.18, 0.95], [1.1, 1.95]]) boxAt(g, doorWood, ox - 0.35, y0, CW - 0.075, ox + 0.35, y1, CW - 0.06, 0.008);
    boxAt(g, chrome, ox - 0.4, 0.99, CW - 0.1, ox - 0.28, 1.01, CW - 0.08, 0.005);
    boxAt(g, whitePl, ox - 0.12, 2.22, CW - 0.015, ox + 0.12, 2.32, CW, 0.006);
    // hydrant cabinet + notice board
    boxAt(g, pl("#d8342c", 0.35), -1.55, 0.75, CW - 0.16, -0.85, 1.7, CW, 0.01);
    boxAt(g, pl("#f2f2ee", 0.3), -1.48, 1.45, CW - 0.165, -0.92, 1.62, CW - 0.16);
    boxAt(g, panelWood, -0.55, 1.2, CW - 0.02, 0.2, 1.75, CW, 0.006);
    const nb = pic(g, M.paint({ map: whiteboardTex(), roughness: 0.6 }), 0.7, 0.5, -0.175, 1.475, CW - 0.022, Math.PI); void nb;
    // skirting tile strip both sides is in the wall texture; fluorescent panel + its light
    boxAt(g, whitePl, -0.35, CHt - 0.04, 0.85, 0.35, CHt, 1.45, 0.008);
    const pnl = put(g, BX(0.62, 0.006, 0.52), corrPanelM, 0, CHt - 0.043, 1.15, 0, 0, 0, false); keep.add(pnl);
    corridorLight = new THREE.PointLight("#e8f0ff", 2.2, 3.1, 2); corridorLight.name = "corridorLight"; corridorLight.position.set(0, CHt - 0.3, 1.45);
    g.add(corridorLight); lights.push(corridorLight);
  }

  // ---------------- lockers (entrance end, both sides) ----------------
  const lockerCols = ["#6f9fd0", "#86b3de"];
  for (const s of [-1, 1]) for (let i = 0; i < 2; i++) {
    const g = new THREE.Group(); root.add(g);
    const z0 = 1.97 + i * 0.5, z1 = z0 + 0.49, xw = s * HX, xf = s * (HX - 0.55);
    boxAt(g, lockerM, Math.min(xw, xf), 0.04, z0, Math.max(xw, xf), 1.98, z1, 0.008);
    boxAt(g, darkPl, xw, 0, z0 + 0.02, xf - s * 0.03, 0.04, z1 - 0.02);
    // door face (uv01 plane with louvres + name card)
    const door = pic(g, i ? lockerDoorM2 : lockerDoorM, 0.46, 1.86, xf - s * 0.001, 1.0, (z0 + z1) / 2, -s * Math.PI / 2);
    door.castShadow = false;
    void lockerCols;
    // handle + lock
    const hz = s < 0 ? z1 - 0.06 : z0 + 0.06;
    boxAt(g, chrome, xf - s * 0.035, 0.95, hz - 0.012, xf - s * 0.01, 1.15, hz + 0.012, 0.006);
    put(g, CY(0.014, 0.014, 0.02, 12), chrome, xf - s * 0.01, 1.22, hz, 0, 0, Math.PI / 2);
    // stuff on top: suitcase / box
    if (i === 0) {
      const sc = new THREE.Group(); sc.position.set(s * (HX - 0.28), 1.98, z0 + 0.25); sc.rotation.y = 0.15 * s; g.add(sc);
      boxAt(sc, pl(s < 0 ? "#e85d75" : "#41b3a3", 0.35), -0.22, 0, -0.17, 0.22, 0.24, 0.17, 0.03);
      for (const zz of [-0.08, 0.08]) boxAt(sc, darkPl, -0.225, 0.02, zz - 0.01, 0.225, 0.22, zz + 0.01, 0.004);
      boxAt(sc, darkPl, -0.06, 0.24, -0.02, 0.06, 0.27, 0.02, 0.008);
    } else {
      const bx = new THREE.Group(); bx.position.set(s * (HX - 0.27), 1.98, z0 + 0.24); bx.rotation.y = -0.1 * s; g.add(bx);
      boxAt(bx, cardM, -0.24, 0, -0.2, 0.24, 0.3, 0.2, 0.004);
      boxAt(bx, tapeM, -0.245, 0.29, -0.03, 0.245, 0.302, 0.03);
    }
  }

  // ---------------- loft units (上床下桌) ----------------
  const D = 0.95, L = 2.0, P = 0.045, BED = DORM.bedY, RT = 2.18, RM = 1.97;
  type DeskKind = "phone" | "books" | "laptop" | "messy";
  type Unit = { g: THREE.Group; desk: [number, number]; deskKind: DeskKind; chairAt: THREE.Vector3; lampTarget: THREE.Vector3 };
  const lamps: THREE.SpotLight[] = [];
  let phoneScreen: THREE.Mesh | null = null, laptopScreen: THREE.Mesh | null = null, phoneCentre = V(0, 0, 0);
  const lampShadow = opts.lampShadows ?? true, lampGain = opts.lampGain ?? 1;
  const lampBulbs: THREE.MeshBasicMaterial[] = []; // one per lamp (in lamp order), so each can switch on and off
  const BULB_ON = new THREE.Color(2.6, 2.0, 1.25), BULB_OFF = new THREE.Color(0.85, 0.82, 0.76);
  let phoneGroup: THREE.Group | null = null, youLampHead = V(0, 0, 0), youLampBase = V(0, 0, 0);
  let monitorScreenM: THREE.MeshBasicMaterial | null = null, rgbStripM: THREE.MeshBasicMaterial | null = null;

  const books = (parent: THREE.Object3D, x0: number, y: number, z0: number, z1: number, depth: number, seed: number, maxH = 0.24, lean = true) => {
    const RR = rng(seed), pal = ["#e8574f", "#3f7fd8", "#f2c14e", "#4fb37a", "#9b6bd6", "#f08a3c", "#2f3e5c", "#e9e2d0", "#6cc3d5", "#d65a8b"];
    let z = z0;
    while (z < z1 - 0.03) {
      if (RR() < 0.12 && z > z0 + 0.05) { z += 0.05 + 0.08 * RR(); continue; } // gap
      const t = 0.018 + 0.03 * RR(), h = maxH * (0.62 + 0.38 * RR()), dd = depth * (0.75 + 0.25 * RR());
      if (z + t > z1) break;
      const m = put(parent, RB(dd, h, t, 0.003), pl(pal[Math.floor(RR() * pal.length)], 0.6), x0 + dd / 2, y + h / 2, z + t / 2);
      if (lean && RR() < 0.08) { m.rotation.x = 0.18; m.position.y -= 0.005; }
      z += t + 0.002;
    }
  };
  const bookStack = (parent: THREE.Object3D, x: number, y: number, z: number, n: number, seed: number) => {
    const RR = rng(seed), pal = ["#e8574f", "#3f7fd8", "#f2c14e", "#4fb37a", "#9b6bd6", "#2f3e5c", "#f08a3c"];
    let yy = y;
    for (let i = 0; i < n; i++) {
      const w = 0.16 + 0.07 * RR(), d = 0.22 + 0.06 * RR(), t = 0.015 + 0.025 * RR(), ry = (RR() - 0.5) * 0.3;
      const b = new THREE.Group(); b.position.set(x + (RR() - 0.5) * 0.02, yy, z + (RR() - 0.5) * 0.02); b.rotation.y = ry; parent.add(b);
      boxAt(b, pl(pal[Math.floor(RR() * pal.length)], 0.55), -w / 2, 0, -d / 2, w / 2, t, d / 2, 0.003);
      boxAt(b, paperM, -w / 2 + 0.004, 0.003, -d / 2 + 0.003, w / 2 + 0.002, t - 0.003, d / 2 - 0.003);
      yy += t;
    }
    return yy;
  };
  const mug = (parent: THREE.Object3D, x: number, y: number, z: number, col: string, pens = false) => {
    put(parent, lathe([[0, 0], [0.04, 0], [0.042, 0.004], [0.042, 0.1], [0.038, 0.1], [0.036, 0.008], [0, 0.008]], 18), pl(col, 0.35), x, y, z);
    const h = put(parent, new THREE.TorusGeometry(0.025, 0.007, 6, 12, Math.PI), pl(col, 0.35), x + 0.042, y + 0.055, z, 0, 0, -Math.PI / 2);
    void h;
    if (pens) { const RR = rng(Math.round(x * 1000 + z * 77)); for (let i = 0; i < 5; i++) { const c = ["#2b59c3", "#e33", "#222", "#ffcc00", "#3a3"][i]; const p = put(parent, CY(0.004, 0.004, 0.15, 6), pl(c, 0.4), x + (RR() - 0.5) * 0.03, y + 0.1, z + (RR() - 0.5) * 0.03); p.rotation.set((RR() - 0.5) * 0.4, 0, (RR() - 0.5) * 0.4); } }
  };
  const can = (parent: THREE.Object3D, x: number, y: number, z: number, col: string, tipped = false) => {
    const c = put(parent, CY(0.033, 0.033, 0.12, 14), pl(col, 0.3), x, y + (tipped ? 0.033 : 0.06), z);
    put(c, CY(0.028, 0.033, 0.008, 14), alu, 0, 0.064, 0);
    if (tipped) { c.rotation.z = Math.PI / 2; c.rotation.y = R() * 3; }
  };
  const bottle = (parent: THREE.Object3D, x: number, y: number, z: number, col: string, cap: string) => {
    put(parent, lathe([[0, 0], [0.035, 0], [0.036, 0.01], [0.036, 0.17], [0.03, 0.2], [0.014, 0.215], [0, 0.215]], 16), pl(col, 0.15), x, y, z);
    put(parent, CY(0.016, 0.016, 0.025, 12), pl(cap, 0.4), x, y + 0.225, z);
  };
  const plant = (parent: THREE.Object3D, x: number, y: number, z: number, s = 1, seed = 1) => {
    const RR = rng(seed);
    put(parent, lathe([[0, 0], [0.045 * s, 0], [0.06 * s, 0.09 * s], [0.064 * s, 0.1 * s], [0, 0.1 * s]], 14), pl(["#e8835a", "#f2f2ee", "#7fb5e8"][seed % 3], 0.5), x, y, z);
    for (let i = 0; i < 6; i++) {
      const lf = put(parent, new THREE.IcosahedronGeometry(0.045 * s, 0), pl(i % 2 ? "#4caf62" : "#69c46f", 0.6), x + (RR() - 0.5) * 0.06 * s, y + (0.13 + 0.07 * RR()) * s, z + (RR() - 0.5) * 0.06 * s);
      lf.scale.set(0.7, 1.3, 0.5); lf.rotation.set(RR() * 0.8, RR() * 6, (RR() - 0.5) * 1.2);
    }
  };
  const plush = (parent: THREE.Object3D, x: number, y: number, z: number, ry: number, col: string) => {
    const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; parent.add(g);
    const m = pl(col, 0.9);
    put(g, SP(0.075, 14, 10), m, 0, 0.07, 0).scale.set(1, 0.95, 0.85);
    put(g, SP(0.06, 14, 10), m, 0, 0.18, 0.01);
    for (const sx of [-1, 1]) { put(g, SP(0.022, 8, 6), m, sx * 0.045, 0.23, 0.0); put(g, SP(0.028, 8, 6), m, sx * 0.07, 0.03, 0.04); put(g, SP(0.024, 8, 6), m, sx * 0.075, 0.1, 0.02); }
    put(g, SP(0.025, 10, 8), pl("#fbe7d0", 0.9), 0, 0.17, 0.06).scale.set(1, 0.8, 0.6);
    for (const sx of [-1, 1]) put(g, SP(0.008, 6, 4), blackM, sx * 0.022, 0.195, 0.062);
  };
  const snack = (parent: THREE.Object3D, x: number, y: number, z: number, ry: number, col: string, seed: number) => {
    const m = put(parent, lumpy(0.14, 0.035, 0.2, seed, 0.6, [4, 1, 5], 0.6), pl(col, 0.25), x, y + 0.02, z, ry);
    m.scale.set(1, 1, 1);
  };
  const cable = (parent: THREE.Object3D, pts: THREE.Vector3[], col = "#f4f4f4", r = 0.0035) => {
    const g = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), Math.max(8, pts.length * 6), r, 5, false);
    put(parent, g, pl(col, 0.5), 0, 0, 0);
  };

  /** arm desk lamp facing +x in its own frame, head at about (0.2, 0.36, 0); returns the bulb position (local) */
  const armLamp = (parent: THREE.Object3D, x: number, z: number, ry: number, col: string) => {
    const g = new THREE.Group(); g.position.set(x, DT, z); g.rotation.y = ry; parent.add(g);
    const m = pl(col, 0.3);
    put(g, CY(0.07, 0.078, 0.022, 22), m, 0, 0.011, 0);
    put(g, CY(0.018, 0.018, 0.03, 10), m, 0, 0.035, 0);
    const j1 = V(0.0, 0.05, 0), j2 = V(0.05, 0.25, 0), hd = V(0.2, 0.29, 0);
    rod(g, m, j1, j2, 0.009); rod(g, m, j2, hd, 0.008);
    put(g, SP(0.016, 10, 8), m, j2.x, j2.y, j2.z);
    // shade: narrow end (+y) up-back toward the arm, wide opening (-y) down-forward onto the desk
    const head = new THREE.Group(); head.position.copy(hd); head.rotation.z = 0.5; g.add(head);
    put(head, CY(0.034, 0.072, 0.11, 20, true), m, 0, 0.0, 0);
    put(head, CY(0.036, 0.036, 0.022, 16), m, 0, 0.064, 0);
    const shadeIn = put(head, CY(0.032, 0.069, 0.106, 20, true), pl("#fff4dc", 0.6), 0, 0.0, 0, 0, 0, 0, false); (shadeIn.material as THREE.Material).side = THREE.BackSide;
    const bm = basic(BULB_ON.clone()); lampBulbs.push(bm);
    put(head, CY(0.048, 0.048, 0.004, 20), bm, 0, 0.004, 0, 0, 0, 0, false).name = "lampBulb";
    const bulb = new THREE.Object3D(); bulb.position.set(0, -0.025, 0); head.add(bulb);
    return { g, bulb };
  };
  const addLamp = (unit: THREE.Group, bulb: THREE.Object3D, target: THREE.Vector3, k = 1) => {
    const sp = new THREE.SpotLight("#ffc78a", 0.85 * k * lampGain, 6, 0.85, 0.8, 2);
    sp.name = "deskLamp";
    unit.updateMatrixWorld(true);
    sp.position.copy(unit.worldToLocal(bulb.getWorldPosition(new THREE.Vector3())));
    sp.target.position.copy(target);
    unit.add(sp, sp.target);
    if (lampShadow) {
      sp.castShadow = true; const ss = opts.lampShadowSize ?? 512; sp.shadow.mapSize.set(ss, ss);
      sp.shadow.radius = 4; sp.shadow.bias = -0.0004; sp.shadow.normalBias = 0.01; sp.shadow.camera.near = 0.05; sp.shadow.camera.far = 4;
    }
    lamps.push(sp); lights.push(sp);
    return sp;
  };

  /** chair facing -x in its own frame (back at +x); `drape` hangs a hoodie / jacket of that colour over the back */
  const chair = (parent: THREE.Object3D, x: number, z: number, ry: number, style: "dorm" | "office", seatCol: string, drape?: string) => {
    const g = new THREE.Group(); g.name = style === "dorm" ? "chair" : "officeChair"; g.position.set(x, 0, z); g.rotation.y = ry; parent.add(g);
    if (style === "dorm") {
      for (const [lx, lz] of [[-0.18, -0.18], [0.18, -0.18], [-0.18, 0.18], [0.18, 0.18]]) put(g, CY(0.011, 0.011, 0.45, 8), greyFrameM, lx, 0.225, lz);
      boxAt(g, panelWood, -0.21, 0.45, -0.21, 0.21, 0.48, 0.21, 0.01);
      boxAt(g, pl(seatCol, 0.85), -0.19, 0.48, -0.19, 0.19, 0.51, 0.19, 0.012).userData.support = true;
      for (const lz of [-0.18, 0.18]) put(g, CY(0.011, 0.011, 0.42, 8), greyFrameM, 0.19, 0.69, lz);
      boxAt(g, panelWood, 0.17, 0.72, -0.2, 0.2, 0.88, 0.2, 0.01);
      boxAt(g, greyFrameM, -0.18, 0.12, -0.19, 0.18, 0.135, -0.17); boxAt(g, greyFrameM, -0.18, 0.12, 0.17, 0.18, 0.135, 0.19);
    } else {
      for (let i = 0; i < 5; i++) { const a = (i / 5) * Math.PI * 2; const leg = put(g, RB(0.28, 0.025, 0.04, 0.008), darkPl, Math.cos(a) * 0.14, 0.06, Math.sin(a) * 0.14, -a); void leg; put(g, SP(0.022, 8, 6), blackM, Math.cos(a) * 0.27, 0.022, Math.sin(a) * 0.27); }
      put(g, CY(0.025, 0.025, 0.3, 12), chrome, 0, 0.22, 0);
      put(g, CY(0.04, 0.04, 0.05, 12), darkPl, 0, 0.37, 0);
      boxAt(g, pl(seatCol, 0.9), -0.24, 0.4, -0.24, 0.24, 0.48, 0.24, 0.035).userData.support = true;
      const back = new THREE.Group(); back.position.set(0.22, 0.48, 0); back.rotation.z = -0.12; g.add(back);
      boxAt(back, darkPl, -0.02, 0.0, -0.03, 0.02, 0.18, 0.03, 0.01);
      boxAt(back, pl(seatCol, 0.9), -0.02, 0.16, -0.22, 0.04, 0.7, 0.22, 0.04);
      for (const sz of [-1, 1]) { boxAt(g, darkPl, -0.12, 0.6, sz * 0.25 - 0.025, 0.14, 0.63, sz * 0.25 + 0.025, 0.012); boxAt(g, darkPl, 0.05, 0.47, sz * 0.25 - 0.012, 0.08, 0.6, sz * 0.25 + 0.012); }
    }
    if (drape) {
      // a hoodie folded over the top of the backrest: a soft roll on the top edge, a long flap down the back, a short
      // one down the front, a sleeve and the hood hanging behind. Origin = the backrest's top edge, x = its mid-plane.
      const m = pl(drape, 0.92), seed = Math.round(x * 100 + z * 10) & 255, half = style === "dorm" ? 0.215 : 0.235;
      const dg = new THREE.Group(); dg.name = "chairHoodie"; g.add(dg);
      if (style === "dorm") dg.position.set(0.185, 0.885, 0); else { dg.position.set(0.25, 1.18, 0); dg.rotation.z = -0.12; }
      put(dg, CY(0.032, 0.032, 2 * half, 12), m, 0, 0.005, 0, 0, Math.PI / 2).scale.set(1, 1, 1.15);
      put(dg, lumpy(0.024, 0.3, 2 * half - 0.02, seed + 1, 0.06, [2, 5, 6], 0.04), m, 0.03, -0.15, 0, 0, 0, -0.04);   // back flap
      put(dg, lumpy(0.022, 0.15, 2 * half - 0.04, seed + 2, 0.06, [2, 3, 6], 0.04), m, -0.03, -0.07, 0, 0, 0, 0.05);  // front flap
      put(dg, lumpy(0.045, 0.3, 0.075, seed + 3, 0.05, [2, 5, 2], 0.03), m, 0.05, -0.27, half * 0.62, 0, 0, -0.06); // sleeve
      put(dg, SP(0.07, 12, 8), m, 0.05, -0.1, -half * 0.35).scale.set(0.38, 0.95, 1);                              // hood
      put(dg, CY(0.004, 0.004, 0.15, 5), pl("#f4f4f0", 0.6), -0.042, -0.12, 0.04);                                  // drawstring
    }
    return g;
  };

  const loft = (o: { ladderAt: 0 | 1; deskKind: DeskKind; duvet: THREE.Material; sheet: THREE.Material; pillow: THREE.Material; lampCol: string; chair: "dorm" | "office"; chairCol: string; seed: number }): Unit => {
    const g = new THREE.Group(), RR = rng(o.seed);
    const ladZ = o.ladderAt ? L - 0.26 : 0.26;
    const c0 = o.ladderAt ? L - 0.52 : P, c1 = c0 + 0.47;     // cabinet column under the ladder end
    const d0 = o.ladderAt ? P : c1, d1 = o.ladderAt ? c0 : L - P; // desk span
    // posts (+ black feet)
    for (const [x, z] of [[P / 2, P / 2], [D - P / 2, P / 2], [P / 2, L - P / 2], [D - P / 2, L - P / 2]]) {
      boxAt(g, frameM, x - P / 2, 0.02, z - P / 2, x + P / 2, RT + 0.03, z + P / 2, 0.006);
      boxAt(g, blackM, x - P / 2 - 0.003, 0, z - P / 2 - 0.003, x + P / 2 + 0.003, 0.025, z + P / 2 + 0.003, 0.004);
      put(g, SP(0.026, 10, 6), frameM, x, RT + 0.035, z).scale.set(1, 0.5, 1);
    }
    // bed frame
    boxAt(g, frameM, D - P, BED - 0.09, P, D, BED, L - P, 0.006);
    boxAt(g, frameM, 0, BED - 0.09, P, P, BED, L - P, 0.006);
    for (const z of [0, L - P]) boxAt(g, frameM, P, BED - 0.09, z, D - P, BED, z + P, 0.006);
    boxAt(g, panelWood, P, BED - 0.035, P, D - P, BED - 0.015, L - P);
    for (let k = 1; k < 5; k++) boxAt(g, frameM, P, BED - 0.06, (k * L) / 5 - 0.015, D - P, BED - 0.035, (k * L) / 5 + 0.015);
    // mattress + bedding
    const mat = put(g, RB(D - 0.08, 0.13, L - 0.1, 0.035, 2), o.sheet, D / 2, BED + 0.05, L / 2); mat.userData.support = true;
    // guard rails
    const gapA = o.ladderAt ? P : 0.52, gapB = o.ladderAt ? L - 0.52 : L - P;
    for (const y of [RM, RT]) {
      boxAt(g, frameM, D - P + 0.005, y - 0.018, gapA, D - 0.005, y + 0.018, gapB, 0.006);
      for (const z of [P / 2, L - P / 2]) boxAt(g, frameM, P, y - 0.018, z - 0.016, D - P, y + 0.018, z + 0.016, 0.006);
    }
    boxAt(g, frameM, 0.005, RM - 0.018, P, P - 0.005, RM + 0.018, L - P, 0.006);
    const endPostZ = o.ladderAt ? L - 0.52 : 0.52;
    boxAt(g, frameM, D - P + 0.005, BED, endPostZ - 0.018, D - 0.005, RT + 0.02, endPostZ + 0.018, 0.006);
    // ladder (in front of the cabinet column, parallel to the aisle)
    const lx = D + 0.035;
    for (const s of [-1, 1]) put(g, CY(0.017, 0.017, RT, 16), frameM, lx, RT / 2, ladZ + s * 0.2); // round tube stiles (the line-02 knot post)
    for (let k = 1; k <= 4; k++) {
      const y = k * 0.355;
      boxAt(g, frameM, lx - 0.03, y - 0.014, ladZ - 0.19, lx + 0.07, y + 0.014, ladZ + 0.19, 0.006).userData.support = true;
      boxAt(g, blackM, lx - 0.028, y + 0.012, ladZ - 0.17, lx + 0.068, y + 0.017, ladZ + 0.17).userData.support = true;
    }
    for (const s of [-1, 1]) boxAt(g, frameM, D - 0.01, RT - 0.04, ladZ + s * 0.2 - 0.016, lx + 0.016, RT - 0.01, ladZ + s * 0.2 + 0.016, 0.004);
    // cabinet column: sides, top, shelves, a door on the lower half
    const cx1 = 0.58;
    for (const z of [c0, c1 - 0.018]) boxAt(g, panelWood, 0.01, 0.02, z, cx1, BED - 0.09, z + 0.018, 0.004);
    boxAt(g, panelWood, 0.01, 0.02, c0, cx1, 0.06, c1, 0.004);
    for (const y of [0.55, 1.08]) boxAt(g, panelWood, 0.01, y, c0 + 0.018, cx1 - 0.01, y + 0.018, c1 - 0.018);
    boxAt(g, pl("#f5f0e6", 0.5), cx1, 0.07, c0 + 0.005, cx1 + 0.02, 1.07, c1 - 0.005, 0.006);
    boxAt(g, chrome, cx1 + 0.02, 0.62, (o.ladderAt ? c0 + 0.04 : c1 - 0.06), cx1 + 0.035, 0.78, (o.ladderAt ? c0 + 0.06 : c1 - 0.04), 0.004);
    // open top compartment: folded clothes + a box
    const fc = ["#e9e4d8", "#5d7fb8", "#d9706a", "#3f3f46", "#f1c75b"];
    let yy = 1.1;
    for (let k = 0; k < 4; k++) { const t = 0.04 + 0.02 * RR(); boxAt(g, pl(fc[(k + o.seed) % fc.length], 0.9), 0.06, yy, c0 + 0.05, 0.4, yy + t, c1 - 0.06, 0.015); yy += t; }
    boxAt(g, pl(["#7ec8e3", "#ffb3c1", "#b8e994", "#ffd166"][o.seed % 4], 0.35), 0.42, 1.1, c0 + 0.06, 0.56, 1.26, c1 - 0.08, 0.01);
    // desk
    boxAt(g, deskWood, 0.005, DT - 0.03, d0, 0.62, DT, d1, 0.008);
    boxAt(g, panelWood, 0.02, DT - 0.1, d0 + 0.01, 0.6, DT - 0.03, d0 + 0.028);
    const farZ = o.ladderAt ? d0 : d1 - 0.018;
    boxAt(g, panelWood, 0.01, 0.02, farZ, 0.6, DT - 0.03, farZ + 0.018, 0.004);
    // shallow drawer under the desk top next to the cabinet
    const dz0 = o.ladderAt ? d1 - 0.48 : d0 + 0.02, dz1 = dz0 + 0.46;
    boxAt(g, panelWood, 0.05, DT - 0.12, dz0, 0.6, DT - 0.03, dz1, 0.004);
    boxAt(g, chrome, 0.6, DT - 0.085, (dz0 + dz1) / 2 - 0.05, 0.615, DT - 0.07, (dz0 + dz1) / 2 + 0.05, 0.004);
    // hutch: far side panel + two shelves
    const hz = o.ladderAt ? d0 : d1 - 0.018;
    boxAt(g, panelWood, 0.01, DT, hz, 0.3, BED - 0.09, hz + 0.018, 0.004);
    for (const y of [1.13, 1.39]) boxAt(g, panelWood, 0.01, y, d0 + 0.005, 0.3, y + 0.018, d1 - 0.005, 0.004);
    // shelf contents
    const s0 = d0 + 0.03, s1 = d1 - 0.03, mid = (d0 + d1) / 2;
    books(g, 0.03, 1.148, s0, s0 + 0.55 + 0.25 * RR(), 0.24, o.seed * 3 + 1, 0.22);
    books(g, 0.03, 1.408, s1 - 0.5 - 0.3 * RR(), s1, 0.24, o.seed * 3 + 2, 0.2);
    plush(g, 0.16, 1.148, s1 - 0.14, -0.4 + Math.PI / 2, ["#c98d5a", "#f4f1ec", "#f7b6c6", "#9fd3a8"][o.seed % 4]);
    plant(g, 0.15, 1.408, s0 + 0.12, 0.9, o.seed);
    boxAt(g, pl(["#ffd166", "#7bdff2", "#f7aef8", "#b2f7ef"][(o.seed + 1) % 4], 0.35), 0.04, 1.148, mid - 0.1, 0.26, 1.24, mid + 0.06, 0.008);
    // LED strip under the bed board (a soft warm line many students stick up there)
    // under-desk: plastic drawer tower or basin + box
    const ux = 0.3, uz = o.ladderAt ? d0 + 0.3 : d1 - 0.3;
    if (o.seed % 2) {
      for (let k = 0; k < 3; k++) { boxAt(g, pl("#eef3f6", 0.35), ux - 0.18, 0.02 + k * 0.2, uz - 0.17, ux + 0.18, 0.2 + k * 0.2, uz + 0.17, 0.01); boxAt(g, pl(["#7ec8e3", "#ffb3c1", "#b8e994"][k], 0.35), ux + 0.18, 0.06 + k * 0.2, uz - 0.15, ux + 0.19, 0.17 + k * 0.2, uz + 0.15, 0.004); }
    } else {
      put(g, lathe([[0, 0], [0.15, 0], [0.19, 0.11], [0.2, 0.12], [0.18, 0.12], [0.14, 0.012], [0, 0.012]], 24), pl("#ff8fab", 0.4), ux, 0, uz);
      put(g, lumpy(0.2, 0.06, 0.15, o.seed + 70, 0.5, [3, 1, 3], 0.2), fab([120, 190, 240], "stripe", [255, 255, 255], [80, 140, 210], 0.25, 8), ux, 0.1, uz);
    }
    // the desk itself, per kind
    const dz = (f: number) => d0 + (d1 - d0) * f; // desk position by fraction from d0
    const fz = (f: number) => (o.ladderAt ? dz(f) : dz(1 - f)); // fraction measured from the lamp end
    let tgt: THREE.Vector3;
    if (o.deskKind === "phone") {
      // hero desk, laid out along the over-the-shoulder camera's depth axis (it looks from the aisle toward the
      // wall): phone near the front edge in the lamp's pool, noodles and the kettle behind it, calendar on the wall
      const pz = dz(0.5), sgn = o.ladderAt ? 1 : -1, Z = (dzm: number) => pz + sgn * dzm;
      const lampPos = V(0.12, 0, Z(-0.32)), toPh = V(0.47 - lampPos.x, 0, pz - lampPos.z);
      const lamp = armLamp(g, lampPos.x, lampPos.z, -Math.atan2(toPh.z, toPh.x), o.lampCol);
      tgt = V(0.44, DT, pz);
      addLamp(g, lamp.bulb, tgt, 1.15);
      youLampHead = lamp.bulb.getWorldPosition(new THREE.Vector3()); youLampBase = lamp.g.position.clone(); // unit-local; mapped to world below
      youLampHead = lamp.g.parent!.worldToLocal(youLampHead);
      // v2 phone prop (a group the camera can push in on, kept out of the merge; lift it off the desk for line 17):
      // mint case with rounded corners and bevels, black glass front, side keys, a punch-hole camera and a separate
      // rounded screen plane (UV 0..1, image top = phone top) with a MeshBasicMaterial whose map can be swapped
      const ph = new THREE.Group(); ph.name = "phone"; ph.position.set(0.47, DT, pz); ph.rotation.y = Math.PI / 2 + 0.2 * sgn; g.add(ph);
      keep.add(ph); phoneGroup = ph;
      const rr = (w: number, h: number, r: number) => { const sh = new THREE.Shape(), x = w / 2, y = h / 2;
        sh.moveTo(-x + r, -y); sh.lineTo(x - r, -y); sh.quadraticCurveTo(x, -y, x, -y + r); sh.lineTo(x, y - r); sh.quadraticCurveTo(x, y, x - r, y);
        sh.lineTo(-x + r, y); sh.quadraticCurveTo(-x, y, -x, y - r); sh.lineTo(-x, -y + r); sh.quadraticCurveTo(-x, -y, -x + r, -y); return sh; };
      const body = new THREE.ExtrudeGeometry(rr(0.072, 0.154, 0.009), { depth: 0.0042, bevelEnabled: true, bevelThickness: 0.0016, bevelSize: 0.0016, bevelSegments: 3, curveSegments: 6 });
      body.rotateX(-Math.PI / 2); body.translate(0, 0.0016, 0);           // shape y -> -z (phone top toward local -z); case 0..0.0074 under the glass
      const caseM = pl("#9ad0c2", 0.38);
      const bm1 = put(ph, body, caseM, 0, 0, 0); bm1.userData.uv01 = true;
      const glass = new THREE.ExtrudeGeometry(rr(0.0715, 0.1535, 0.0085), { depth: 0.0008, bevelEnabled: false, curveSegments: 6 });
      glass.rotateX(-Math.PI / 2); const gm = put(ph, glass, M.paint({ color: "#0d0f14", roughness: 0.12, specular: 1 }), 0, 0.0074, 0); gm.userData.uv01 = true;
      for (const [z0, len] of [[-0.035, 0.02], [-0.008, 0.035]] as const) boxAt(ph, caseM, 0.0368, 0.0028, z0 - len / 2, 0.0378, 0.0058, z0 + len / 2, 0.0006);
      const sg = new THREE.ShapeGeometry(rr(0.068, 0.148, 0.0072), 6);
      { const p = sg.attributes.position, uv = sg.attributes.uv; for (let i = 0; i < p.count; i++) uv.setXY(i, p.getX(i) / 0.068 + 0.5, p.getY(i) / 0.148 + 0.5); }
      sg.rotateX(-Math.PI / 2);
      const scr = new THREE.Mesh(sg, basic(0xffffff, { map: opts.phoneScreen ?? phoneScreenTex() }));
      scr.position.y = 0.0084; scr.name = "phoneScreen"; scr.userData.uv01 = true; scr.receiveShadow = false; ph.add(scr);
      phoneScreen = scr;
      put(ph, CY(0.0021, 0.0021, 0.0004, 12), blackM, 0, 0.0087, -0.067, 0, 0, 0, false); // punch-hole camera
      phoneCentre = V(0.47, DT + 0.0084, pz);
      // instant noodles: lathe cup with a label, soup + noodles, the lid peeled back, a fork resting on top
      const nc = new THREE.Group(); nc.position.set(0.27, DT, Z(0.04)); nc.rotation.y = 0.6; g.add(nc);
      const cup = put(nc, lathe([[0.0, 0], [0.042, 0], [0.044, 0.005], [0.056, 0.11], [0.058, 0.112]], 28), M.paint({ map: noodleTex(), roughness: 0.45 }), 0, 0, 0); cup.userData.uv01 = true;
      put(nc, CY(0.053, 0.053, 0.004, 24), pl("#c4581f", 0.2), 0, 0.1, 0);
      for (let k = 0; k < 8; k++) put(nc, new THREE.TorusGeometry(0.01 + 0.012 * ((k * 37) % 10) / 10, 0.0035, 4, 12), pl("#f3d27a", 0.5), (((k * 13) % 7) - 3) * 0.009, 0.103, (((k * 7) % 5) - 2) * 0.012, k, Math.PI / 2 + 0.2);
      put(nc, SP(0.012, 8, 6), pl("#fff3d6", 0.5), 0.02, 0.104, -0.015).scale.set(1.4, 0.5, 1);
      for (let k = 0; k < 6; k++) put(nc, SP(0.004, 5, 4), pl("#4caf50", 0.6), -0.02 + (k % 3) * 0.012, 0.104, 0.01 + Math.floor(k / 3) * 0.012);
      put(nc, CY(0.059, 0.059, 0.002, 24), M.paint({ map: noodleTex(), roughness: 0.35 }), -0.045, 0.13, 0, 0, 0, 1.15).userData.uv01 = true;
      put(nc, RB(0.012, 0.004, 0.15, 0.0015), whitePl, 0.012, 0.118, 0.01, 0.5, 0, 0.3);
      // kettle behind it by the wall
      const kt = new THREE.Group(); kt.position.set(0.13, DT, Z(0.22)); kt.rotation.y = 2.6; g.add(kt);
      put(kt, CY(0.085, 0.09, 0.025, 24), blackM, 0, 0.0125, 0);
      put(kt, lathe([[0, 0.025], [0.08, 0.025], [0.083, 0.04], [0.078, 0.17], [0.062, 0.21], [0.0, 0.215]], 28), steel, 0, 0, 0);
      put(kt, CY(0.035, 0.04, 0.012, 16), blackM, 0, 0.215, 0);
      boxAt(kt, blackM, 0.085, 0.05, -0.016, 0.11, 0.2, 0.016, 0.008);
      boxAt(kt, blackM, 0.05, 0.19, -0.016, 0.11, 0.215, 0.016, 0.008);
      put(kt, CY(0.012, 0.025, 0.05, 10), steel, -0.085, 0.18, 0, 0, 0, -0.9);
      put(kt, SP(0.005, 6, 4), basic(new THREE.Color(2.2, 0.5, 0.3)), 0.07, 0.018, 0.05, 0, 0, 0, false);
      // mug of pens, tissues, power strip along the wall with plugs, snack, bottle, notebook
      mug(g, 0.1, DT, Z(-0.13), "#ffcf5a", true);
      boxAt(g, pl("#8fd3c1", 0.5), 0.24, DT, Z(0.42) - 0.06, 0.34, DT + 0.08, Z(0.42) + 0.06, 0.012);
      put(g, lumpy(0.05, 0.05, 0.06, 41, 0.6, [2, 2, 2], 0.2), paperM, 0.29, DT + 0.095, Z(0.42));
      const sz0 = Math.min(Z(0.34), Z(0.64)), sz1 = Math.max(Z(0.34), Z(0.64));
      boxAt(g, whitePl, 0.03, DT, sz0, 0.09, DT + 0.035, sz1, 0.008);
      boxAt(g, pl("#ff7043", 0.4), 0.05, DT + 0.035, sz1 - 0.04, 0.075, DT + 0.04, sz1 - 0.015);
      for (let k = 0; k < 2; k++) boxAt(g, whitePl, 0.04, DT + 0.035, sz0 + 0.03 + k * 0.07, 0.08, DT + 0.06, sz0 + 0.07 + k * 0.07, 0.006);
      const plugA = V(0.06, DT + 0.05, sz0 + 0.05), plugB = V(0.06, DT + 0.05, sz0 + 0.12);
      { const dx = Math.cos(0.2 * sgn), dzz = -Math.sin(0.2 * sgn), a0 = V(0.47 + 0.08 * dx, DT + 0.005, pz + 0.08 * dzz);
        cable(g, [a0, V(a0.x + 0.06, DT + 0.003, a0.z + sgn * 0.03), V(0.58, DT + 0.003, Z(0.16)), V(0.46, DT + 0.003, Z(0.3)), V(0.2, DT + 0.003, Z(0.3)), plugA], "#f4f4f4", 0.0028);
        cable(g, [V(0.13, DT + 0.02, Z(0.22)), V(0.09, DT + 0.004, Z(0.22) + sgn * 0.03), plugB], "#2a2a2a", 0.003); }
      snack(g, 0.5, DT, Z(0.34), 0.4, "#ff5e5b", o.seed + 1);
      bottle(g, 0.5, DT, Z(0.6), "#7ac7ff", "#2a6fb8");
      const nbk = new THREE.Group(); nbk.position.set(0.41, DT, Z(-0.4)); nbk.rotation.y = -0.15 * sgn; g.add(nbk);
      boxAt(nbk, pl("#2f6fd6", 0.5), -0.108, 0, -0.158, 0.108, 0.003, 0.158);
      pic(nbk, M.paint({ map: notebookTex(), roughness: 0.85 }), 0.3, 0.205, 0, 0.0045, 0, Math.PI / 2, -Math.PI / 2);
      put(g, CY(0.005, 0.005, 0.14, 8), pl("#222", 0.4), 0.46, DT + 0.009, Z(-0.33), 0.3, 0, Math.PI / 2);
      // calendar on the wall above the phone, hung on a nail; sticky notes round it
      pic(g, M.paint({ map: calendarTex(), roughness: 0.8 }), 0.215, 0.3, 0.004, DT + 0.19, Z(0.03), Math.PI / 2, 0, 0.02, 0.008);
      put(g, CY(0.003, 0.003, 0.02, 6), chrome, 0.01, DT + 0.345, Z(0.03), 0, 0, Math.PI / 2);
      const nY = ["#ffe066", "#ff9ec7", "#9ef0b0", "#a7d8ff"];
      nY.forEach((c, k) => pic(g, M.paint({ map: noteTex(c), roughness: 0.8 }), 0.07, 0.07, 0.005, DT + 0.27 - (k % 2) * 0.09, Z([-0.2, -0.27, 0.2, 0.27][k]), Math.PI / 2, 0, (k - 1.5) * 0.12));
    } else {
      const lampZ = o.ladderAt ? d0 + 0.17 : d1 - 0.17;
      const lamp = armLamp(g, 0.13, lampZ, o.ladderAt ? -0.55 : 0.55, o.lampCol); // aim toward the desk middle
      tgt = V(0.42, DT, (lampZ + mid) / 2);
      addLamp(g, lamp.bulb, tgt);
    }
    if (o.deskKind === "phone") {
      // (built above)
    } else if (o.deskKind === "laptop") {
      const lp = new THREE.Group(); lp.position.set(0.36, DT, fz(0.48)); lp.rotation.y = Math.PI / 2 + 0.08; g.add(lp);
      // laptop faces +z in its own frame (screen at the back, -z); rotated so it faces the aisle (+x)
      put(lp, RB(0.33, 0.016, 0.23, 0.005), alu, 0, 0.008, 0);
      const kb = pic(lp, M.paint({ map: keyboardTex(), roughness: 0.6 }), 0.31, 0.21, 0, 0.0165, 0.0, 0, -Math.PI / 2); void kb;
      const lid = new THREE.Group(); lid.position.set(0, 0.016, -0.112); lid.rotation.x = -0.32; lp.add(lid);
      put(lid, RB(0.33, 0.22, 0.008, 0.004), alu, 0, 0.11, -0.004);
      put(lid, RB(0.322, 0.212, 0.002, 0.0009), blackM, 0, 0.11, 0.0005);
      const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.19), basic(new THREE.Color(1.25, 1.25, 1.25), { map: opts.laptopScreen ?? laptopScreenTex() }));
      scr.position.set(0, 0.112, 0.0018); scr.name = "laptopScreen"; scr.userData.uv01 = true; lid.add(scr); keep.add(scr); laptopScreen = scr;
      const glow = new THREE.PointLight("#9cc4ff", 0.05, 1.6, 2); glow.name = "laptopGlow"; glow.position.set(0, 0.14, 0.1); lid.add(glow); lights.push(glow);
      // mouse + pad
      boxAt(g, pl("#2d3a6b", 0.8), 0.32, DT, fz(0.74) - 0.12, 0.56, DT + 0.003, fz(0.74) + 0.12, 0.002);
      put(g, SP(0.03, 14, 8, ), darkPl, 0.45, DT + 0.006, fz(0.74)).scale.set(0.7, 0.45, 1.1);
      cable(g, [V(0.45, DT + 0.01, fz(0.74) - 0.03), V(0.4, DT + 0.005, fz(0.74) - 0.12), V(0.3, DT + 0.005, fz(0.62))], "#333", 0.002);
      // headphones
      const hp = new THREE.Group(); hp.position.set(0.18, DT, fz(0.82)); hp.rotation.set(-Math.PI / 2, 0, 0.6); g.add(hp);
      put(hp, new THREE.TorusGeometry(0.075, 0.01, 6, 18, Math.PI), pl("#f2f2f2", 0.4), 0, 0, 0.02);
      for (const s of [-1, 1]) put(hp, CY(0.04, 0.04, 0.03, 16), pl("#f2f2f2", 0.4), s * 0.075, 0, 0.02, 0, Math.PI / 2);
      can(g, 0.12, DT, fz(0.3), "#3bd16f"); can(g, 0.2, DT, fz(0.24), "#ff6b6b"); can(g, 0.5, DT, fz(0.12), "#3bd16f", true);
      snack(g, 0.16, DT, fz(0.62), -0.5, "#ffb000", o.seed + 2);
      mug(g, 0.1, DT, fz(0.12), "#5cc8ff");
      // charger + power strip
      boxAt(g, whitePl, 0.04, DT, fz(0.62) - 0.15, 0.1, DT + 0.035, fz(0.62) + 0.15, 0.008);
      boxAt(g, pl("#ff7043", 0.4), 0.06, DT + 0.035, fz(0.62) + 0.11, 0.085, DT + 0.04, fz(0.62) + 0.135);
      cable(g, [V(0.07, DT + 0.03, fz(0.62)), V(0.15, DT + 0.005, fz(0.55)), V(0.24, DT + 0.005, fz(0.5)), V(0.3, DT + 0.01, fz(0.47))], "#f4f4f4", 0.003);
    } else if (o.deskKind === "books") {
      bookStack(g, 0.18, DT, fz(0.82), 7, o.seed + 9);
      bookStack(g, 0.16, DT, fz(0.62), 4, o.seed + 19);
      // open textbook
      const ob = new THREE.Group(); ob.position.set(0.4, DT, fz(0.4)); ob.rotation.y = Math.PI / 2 + 0.1; g.add(ob);
      for (const s of [-1, 1]) { const pg = put(ob, RB(0.17, 0.012, 0.24, 0.003), paperM, s * 0.087, 0.008, 0, 0, 0, -s * 0.05); void pg; }
      pic(ob, M.paint({ map: notebookTex(), roughness: 0.85 }), 0.34, 0.235, 0, 0.0166, 0, 0, -Math.PI / 2);
      boxAt(ob, pl("#3f7fd8", 0.5), -0.18, 0, -0.125, 0.18, 0.004, 0.125);
      // highlighters + organizer + coffee
      for (let k = 0; k < 3; k++) put(g, CY(0.008, 0.008, 0.12, 8), pl(["#fff04d", "#ff7ab8", "#6dff9e"][k], 0.4), 0.5, DT + 0.008, fz(0.62) + k * 0.025, 0, 0, Math.PI / 2);
      boxAt(g, pl("#f4f1ea", 0.4), 0.05, DT, fz(0.24) - 0.07, 0.17, DT + 0.11, fz(0.24) + 0.07, 0.006);
      for (let k = 0; k < 6; k++) put(g, CY(0.004, 0.004, 0.15, 6), pl(["#e33", "#222", "#2b59c3", "#3a3", "#ff9800", "#9c27b0"][k], 0.4), 0.08 + (k % 3) * 0.03, DT + 0.12, fz(0.24) - 0.03 + Math.floor(k / 3) * 0.05);
      mug(g, 0.27, DT, fz(0.2), "#8d6e63");
      plant(g, 0.1, DT, fz(0.95), 0.8, o.seed + 2);
      // timetable poster on the wall between desk and shelf
      pic(g, M.paint({ map: posterTex("timetable", 2), roughness: 0.8 }), 0.25, 0.35, 0.003, DT + 0.19, fz(0.48), Math.PI / 2, 0, 0, 0.008).scale.setScalar(0.92);
      const nY = ["#ffe066", "#9ef0b0", "#ffb3a7", "#a7d8ff"];
      nY.forEach((c, k) => pic(g, M.paint({ map: noteTex(c), roughness: 0.8 }), 0.07, 0.07, 0.004, DT + 0.12 + (k % 2) * 0.085, fz(0.7 + Math.floor(k / 2) * 0.09), Math.PI / 2, 0, (k - 1.5) * 0.1));
    } else {
      // messy gamer desk: monitor + keyboard, takeaway bag, cans, chips
      const mn = new THREE.Group(); mn.position.set(0.17, DT, fz(0.5)); mn.rotation.y = Math.PI / 2; g.add(mn);
      put(mn, CY(0.08, 0.09, 0.012, 20), darkPl, 0, 0.006, 0);
      boxAt(mn, darkPl, -0.02, 0.01, -0.03, 0.02, 0.12, -0.01, 0.005);
      put(mn, RB(0.47, 0.275, 0.028, 0.008), darkPl, 0, 0.195, 0.0);
      monitorScreenM = basic(new THREE.Color(0.95, 0.95, 0.95), { map: monitorTex() });
      const ms = pic(mn, monitorScreenM, 0.45, 0.255, 0, 0.195, 0.0145);
      keep.add(ms);
      boxAt(g, darkPl, 0.36, DT, fz(0.5) - 0.2, 0.5, DT + 0.022, fz(0.5) + 0.2, 0.006);
      boxAt(g, basic(new THREE.Color(0.6, 1.4, 2.0)), 0.355, DT + 0.004, fz(0.5) - 0.195, 0.362, DT + 0.012, fz(0.5) + 0.195);
      // takeaway bag (lumpy white) with a box inside
      put(g, lumpy(0.22, 0.2, 0.16, o.seed + 40, 0.25, [4, 4, 3], 0.1), pl("#f6f6f2", 0.3), 0.18, DT + 0.1, fz(0.15));
      boxAt(g, pl("#ffb000", 0.4), 0.1, DT + 0.15, fz(0.15) - 0.05, 0.25, DT + 0.21, fz(0.15) + 0.05, 0.01);
      can(g, 0.45, DT, fz(0.18), "#ff6b6b"); can(g, 0.5, DT, fz(0.28), "#4d7cff", true); can(g, 0.1, DT, fz(0.85), "#ffcc33");
      snack(g, 0.45, DT, fz(0.82), 0.9, "#ff4d6d", o.seed + 3);
      snack(g, 0.33, DT + 0.03, fz(0.88), -0.3, "#43c463", o.seed + 4);
      mug(g, 0.08, DT, fz(0.08), "#ffffff", true);
      // RGB LED strip stuck under the bed frame's aisle rail, washing the desk violet
      rgbStripM = basic(new THREE.Color(1.5, 0.55, 2.4));
      boxAt(g, rgbStripM, D - P + 0.008, BED - 0.098, d0 + 0.04, D - 0.012, BED - 0.09, d1 - 0.04);
      const rgb = new THREE.PointLight("#b46bff", 0.16, 2.4, 2); rgb.name = "rgbStrip"; rgb.position.set(D - 0.15, BED - 0.16, fz(0.5)); g.add(rgb); lights.push(rgb);
    }
    // (the random draws stay in the v1 order so the other three desks keep their approved layout)
    let chairZ = mid + (RR() - 0.5) * 0.16;
    let chairX = o.deskKind === "phone" ? 0.98 : 0.82 + 0.12 * RR(), chairYaw = (RR() - 0.5) * 0.5;
    if (o.deskKind === "phone") { chairX = 0.86; chairZ = mid; chairYaw = 0; } // your chair: square to the desk (line 17)
    chair(g, chairX, chairZ, chairYaw, o.chair, o.chairCol, ({ 2: "#4f6fa8", 4: "#3f4250" } as Record<number, string>)[o.seed]);
    return { g, desk: [d0, d1], deskKind: o.deskKind, chairAt: V(chairX, 0, chairZ), lampTarget: tgt };
  };

  // fabrics
  const fYellow = fab([255, 214, 102], "dots", [255, 255, 255], [255, 160, 90], 0.35, 11);
  const fBlueG = fab([118, 170, 230], "gingham", [255, 255, 255], undefined, 0.3, 12);
  const fPink = fab([250, 170, 190], "hearts", [255, 255, 255], [230, 90, 120], 0.3, 13);
  const fGreen = fab([130, 196, 140], "check", [230, 245, 225], undefined, 0.4, 14);
  const sheetW = fab([238, 240, 245], "stripe", [190, 205, 230], [150, 170, 210], 0.4, 15);
  const sheetC = fab([250, 236, 214], "plain", undefined, undefined, 0.4, 16);
  const pillowW = fab([250, 250, 248], "plain", undefined, undefined, 0.3, 17);
  const curtainF = fab([232, 116, 96], "stars", [255, 236, 170], [255, 255, 255], 0.3, 18, THREE.DoubleSide);

  const units: Unit[] = [];
  const mk = (x: number, z: number, ry: number, o: Parameters<typeof loft>[0]) => { const u = loft(o); u.g.name = `loft${units.length + 1}`; u.g.position.set(x, 0, z); u.g.rotation.y = ry; root.add(u.g); units.push(u); return u; };
  const L1 = mk(-HX, -0.05, 0, { ladderAt: 1, deskKind: "phone", duvet: fYellow, sheet: sheetC, pillow: pillowW, lampCol: "#ff6b57", chair: "dorm", chairCol: "#e86f5a", seed: 1 });
  const L2 = mk(-HX, -2.05, 0, { ladderAt: 0, deskKind: "books", duvet: fPink, sheet: sheetW, pillow: pillowW, lampCol: "#ff9eb5", chair: "dorm", chairCol: "#6fb3e8", seed: 2 });
  const R1 = mk(HX, 1.95, Math.PI, { ladderAt: 0, deskKind: "laptop", duvet: fBlueG, sheet: sheetW, pillow: pillowW, lampCol: "#2f3640", chair: "dorm", chairCol: "#2f6fd6", seed: 3 });
  const R2 = mk(HX, -0.05, Math.PI, { ladderAt: 1, deskKind: "messy", duvet: fGreen, sheet: sheetC, pillow: pillowW, lampCol: "#ffd23f", chair: "office", chairCol: "#c0392b", seed: 4 });

  // bedding per bunk (in unit-local coords)
  const bedTop = BED + 0.115;
  const bedding = (u: Unit, kind: "messy" | "rumpled" | "curtain" | "fairy" | "tofu", duvet: THREE.Material, seed: number) => {
    const g = u.g, ladderAt = u.desk[0] < 0.1 ? 1 : 0, head = ladderAt ? 0.32 : L - 0.32, foot = ladderAt ? L - 0.7 : 0.7;
    put(g, RB(0.5, 0.11, 0.32, 0.05, 3), pillowW, D / 2 - 0.02, bedTop + 0.05, head, 0.08 * (seed % 2 ? 1 : -1)).scale.set(1, 1, 1);
    if (kind === "tofu") {
      boxAt(g, duvet, D / 2 - 0.25, bedTop, foot - 0.22, D / 2 + 0.25, bedTop + 0.2, foot + 0.22, 0.03);
      return;
    }
    const dv = put(g, lumpy(D - 0.12, 0.09, 1.3, seed, kind === "messy" || kind === "rumpled" ? 0.7 : 0.45), duvet, D / 2, bedTop + 0.045, (L / 2) + (ladderAt ? 0.25 : -0.25), (seed % 3 - 1) * 0.06);
    void dv;
    if (kind === "messy") {
      put(g, lumpy(0.35, 0.08, 0.3, seed + 5, 0.8, [5, 2, 5], 0.4), pl("#3f4a5e", 0.9), 0.3, bedTop + 0.12, L / 2 - 0.1, 0.5);
      put(g, lumpy(0.25, 0.05, 0.3, seed + 6, 0.8, [4, 2, 4], 0.4), pl("#e6e1d6", 0.9), 0.55, bedTop + 0.1, L / 2 + 0.3, -0.3);
    }
  };
  bedding(L1, "rumpled", fYellow, 21); // your bunk: clear for you curled under the duvet (v1 had two clothes heaps)
  bedding(L2, "curtain", fPink, 22);
  bedding(R1, "fairy", fBlueG, 23);
  bedding(R2, "tofu", fGreen, 24);
  plush(R1.g, 0.25, bedTop, L - 0.35, -0.3, "#c98d5a");

  // bed curtain (床帘) round bunk 2: rod frame above the bed, pleated panels, the aisle side drawn open in the middle
  {
    const g = L2.g, top = 2.78, bot = BED + 0.02, hgt = top - bot;
    for (const [x, z] of [[P / 2, P / 2], [D - P / 2, P / 2], [P / 2, L - P / 2], [D - P / 2, L - P / 2]]) put(g, CY(0.011, 0.011, top - RT, 8), frameM, x, (top + RT) / 2, z);
    for (const z of [P / 2, L - P / 2]) rod(g, frameM, V(P / 2, top, z), V(D - P / 2, top, z), 0.011);
    for (const x of [P / 2, D - P / 2]) rod(g, frameM, V(x, top, P / 2), V(x, top, L - P / 2), 0.011);
    // aisle side: two gathered panels leaving the middle open
    const a1 = put(g, pleats(0.5, hgt, 8, 0.045, 1), curtainF, D + 0.03, top - 0.01, 0.3, Math.PI / 2); a1.userData.uv01 = true;
    const a2 = put(g, pleats(0.28, hgt, 6, 0.045, 2), curtainF, D + 0.03, top - 0.01, L - 0.19, Math.PI / 2); a2.userData.uv01 = true;
    // ends
    const e1 = put(g, pleats(D, hgt, 9, 0.03, 3), curtainF, D / 2, top - 0.01, -0.03); e1.userData.uv01 = true;
    const e2 = put(g, pleats(D, hgt, 9, 0.03, 4), curtainF, D / 2, top - 0.01, L + 0.03); e2.userData.uv01 = true;
    // tie-back bands
    for (const z of [0.3, L - 0.19]) put(g, new THREE.TorusGeometry(0.06, 0.01, 6, 14), pl("#ffd27a", 0.6), D + 0.02, BED + 0.55, z, 0, Math.PI / 2).scale.set(1, 1.3, 0.7);
  }

  // fairy lights on bunk 3's aisle rail + photo string on the wall above it
  const fairyMats: THREE.MeshBasicMaterial[] = [];
  {
    const g = R1.g, cols = [new THREE.Color(2.6, 1.7, 0.7), new THREE.Color(2.4, 1.2, 1.4), new THREE.Color(2.6, 2.1, 1.0)];
    for (const c of cols) fairyMats.push(basic(c));
    const pts: THREE.Vector3[] = [];
    const z0 = 0.56, z1 = L - 0.06, n = 5;
    for (let i = 0; i <= 60; i++) {
      const t = i / 60, z = z0 + (z1 - z0) * t, seg = (t * n) % 1, sag = 0.07 * Math.sin(seg * Math.PI);
      pts.push(V(D + 0.004 + 0.012 * Math.sin(t * 40), RT - 0.02 - sag, z));
    }
    // wrap down the end post and along the top rail of the foot end
    const curve = new THREE.CatmullRomCurve3(pts);
    put(g, new THREE.TubeGeometry(curve, 120, 0.0018, 4, false), pl("#2f5d3a", 0.6), 0, 0, 0, 0, 0, 0, false);
    const bulbG = new THREE.IcosahedronGeometry(0.011, 1);
    const NB = 28;
    for (let i = 0; i <= NB; i++) { const p = curve.getPoint(i / NB); const b = put(g, bulbG, fairyMats[i % 3], p.x + 0.004, p.y - 0.008, p.z, 0, 0, 0, false); b.scale.set(1, 1.35, 1); }
    // second strand along the far-end rail and down the post
    const pts2: THREE.Vector3[] = [];
    for (let i = 0; i <= 30; i++) { const t = i / 30; pts2.push(V(P + (D - 2 * P) * t, RM - 0.02 - 0.05 * Math.sin(t * Math.PI * 2) ** 2, L - P / 2 + 0.03)); }
    const c2 = new THREE.CatmullRomCurve3(pts2);
    put(g, new THREE.TubeGeometry(c2, 60, 0.0018, 4, false), pl("#2f5d3a", 0.6), 0, 0, 0, 0, 0, 0, false);
    for (let i = 0; i <= 10; i++) { const p = c2.getPoint(i / 10); put(g, bulbG, fairyMats[(i + 1) % 3], p.x, p.y - 0.008, p.z + 0.004, 0, 0, 0, false).scale.set(1, 1.35, 1); }
    for (const [z, c] of [[0.9, "#ffb36b"], [1.6, "#ff9fb0"]] as const) {
      const pt = new THREE.PointLight(c, 0.14, 2.8, 2); pt.name = "fairyGlow"; pt.position.set(D + 0.08, RT - 0.1, z); g.add(pt); lights.push(pt);
    }
    // photo string on the wall above the bed (wall side, x = 0 in unit frame)
    const ps: THREE.Vector3[] = [];
    for (let i = 0; i <= 20; i++) { const t = i / 20; ps.push(V(0.006, 2.62 - 0.08 * Math.sin(t * Math.PI), 0.35 + 1.3 * t)); }
    put(g, new THREE.TubeGeometry(new THREE.CatmullRomCurve3(ps), 40, 0.0015, 4, false), pl("#c9a46a", 0.7), 0, 0, 0, 0, 0, 0, false);
    const phT = photoTex();
    for (let k = 0; k < 4; k++) {
      const t = 0.12 + k * 0.25, y = 2.62 - 0.08 * Math.sin(t * Math.PI) - 0.07, z = 0.35 + 1.3 * t;
      const m = M.paint({ map: phT, roughness: 0.4 });
      const ph = pic(g, m, 0.1, 0.13, 0.008, y, z, Math.PI / 2, 0, (k - 1.5) * 0.08);
      const uv = ph.geometry.attributes.uv; uv.setXY(0, k / 4, 1); uv.setXY(1, (k + 1) / 4, 1); uv.setXY(2, k / 4, 0); uv.setXY(3, (k + 1) / 4, 0); uv.needsUpdate = true;
      boxAt(g, pl("#d9b07a", 0.6), 0.006, y + 0.055, z - 0.006, 0.02, y + 0.085, z + 0.006);
    }
    // USB clip fan on bunk 4's rail and a towel over bunk 1's rail
  }
  {
    const g = R2.g, f = new THREE.Group(); f.position.set(D - P / 2, RT + 0.06, 1.2); f.rotation.y = Math.PI / 2 + 0.3; g.add(f);
    boxAt(f, whitePl, -0.02, -0.06, -0.02, 0.02, 0.0, 0.02, 0.006);
    put(f, CY(0.07, 0.07, 0.035, 20, true), whitePl, 0, 0.06, 0, 0, Math.PI / 2);
    put(f, CY(0.02, 0.02, 0.04, 12), pl("#7ec8e3", 0.4), 0, 0.06, 0, 0, Math.PI / 2);
    for (let k = 0; k < 4; k++) { const b = put(f, RB(0.05, 0.004, 0.025, 0.0015), pl("#7ec8e3", 0.4), 0, 0.06, 0, 0, Math.PI / 2); b.rotation.set(Math.PI / 2, 0, (k * Math.PI) / 2); b.position.set(Math.cos((k * Math.PI) / 2) * 0.03, 0.06 + Math.sin((k * Math.PI) / 2) * 0.03, 0); }
    // v2: the towel hangs over the top rail at the head end (clear of the line-11 rope route at z .9 and of cams.bunk's
    // foreground): a roll over
    // the rail, a long flap outside, a short one inside
    const tm = fab([110, 200, 190], "stripe", [255, 255, 255], [70, 150, 140], 0.25, 9), tz = 0.24;
    put(L1.g, CY(0.024, 0.024, 0.28, 12), tm, D - P / 2, RT + 0.022, tz, 0, Math.PI / 2);
    put(L1.g, RB(0.012, 0.4, 0.28, 0.005), tm, D + 0.012, RT - 0.17, tz, 0, 0, -0.03);
    put(L1.g, RB(0.012, 0.18, 0.28, 0.005), tm, D - P - 0.008, RT - 0.07, tz, 0, 0, 0.04);
  }

  // posters on the walls above the beds and near the window
  const posterM = (k: PosterKind, s: number) => M.paint({ map: posterTex(k, s), roughness: 0.55, specular: 0.4 });
  const tapeDots = (parent: THREE.Object3D, x: number, y: number, z: number, w: number, h: number, ry: number) => {
    const n = new THREE.Vector3(Math.sin(ry), 0, Math.cos(ry)), t = new THREE.Vector3(Math.cos(ry), 0, -Math.sin(ry));
    for (const [sx, sy] of [[-1, 1], [1, 1], [-1, -1], [1, -1]]) {
      const p = V(x, y, z).addScaledVector(t, (sx * w) / 2 - sx * 0.01).addScaledVector(n, 0.002); p.y += (sy * h) / 2 - sy * 0.01;
      const m = pic(parent, M.paint({ color: "#f5e9c8", roughness: 0.3, specular: 0.6 }), 0.05, 0.022, p.x, p.y, p.z, ry, 0, sx * sy * 0.7);
      m.renderOrder = 1;
    }
  };
  const poster = (k: PosterKind, s: number, w: number, x: number, y: number, z: number, ry: number, rz = 0) => {
    const h = w * (720 / 512);
    pic(root, posterM(k, s), w, h, x, y, z, ry, 0, rz, 0.012);
    tapeDots(root, x, y, z, w, h, ry);
  };
  poster("hoops", 1, 0.42, -HX + 0.004, 2.42, 1.0, Math.PI / 2, 0.02);
  poster("vinyl", 2, 0.4, -HX + 0.004, 2.4, -1.15, Math.PI / 2, -0.03);
  poster("planet", 3, 0.38, HX - 0.004, 2.45, -1.05, -Math.PI / 2, 0.02);
  poster("cat", 4, 0.36, HX - 0.004, 2.42, -1.7 + 0.25, -Math.PI / 2, -0.04);
  poster("sunset", 5, 0.34, HX - 0.004, 1.72, -2.45, -Math.PI / 2, 0.02);
  poster("wave", 6, 0.3, -HX + 0.004, 2.35, -0.25, Math.PI / 2, 0.05);
  { // cork board over the shoe rack: photos, notes, a ticket, pins
    const cb = new THREE.Group(); cb.position.set(-HX + 0.012, 1.42, -2.52); cb.rotation.y = Math.PI / 2; root.add(cb);
    boxAt(cb, panelWood, -0.33, -0.24, -0.012, 0.33, 0.24, 0.0, 0.006);
    const cork = M.wood({ ...W.woodMaps(cardboard({ seed: 4, color: [196, 146, 96] })), envMapIntensity: 0.9 });
    boxAt(cb, cork, -0.31, -0.22, -0.004, 0.31, 0.22, 0.004);
    const phT = photoTex();
    for (let k = 0; k < 4; k++) {
      const ph = pic(cb, M.paint({ map: phT, roughness: 0.4 }), 0.1, 0.13, -0.22 + k * 0.14, 0.07 + ((k * 5) % 3) * 0.03, 0.006, 0, 0, (k - 1.5) * 0.12);
      const uv = ph.geometry.attributes.uv; uv.setXY(0, k / 4, 1); uv.setXY(1, (k + 1) / 4, 1); uv.setXY(2, k / 4, 0); uv.setXY(3, (k + 1) / 4, 0); uv.needsUpdate = true;
      put(cb, SP(0.008, 8, 6), pl(["#e53935", "#1e88e5", "#43a047", "#fdd835"][k], 0.3), -0.22 + k * 0.14, 0.13 + ((k * 5) % 3) * 0.03, 0.01);
    }
    ["#ffe066", "#ff9ec7", "#9ef0b0"].forEach((c, k) => pic(cb, M.paint({ map: noteTex(c), roughness: 0.8 }), 0.08, 0.08, -0.18 + k * 0.17, -0.12, 0.006 + k * 0.0005, 0, 0, (k - 1) * 0.15));
    pic(cb, M.paint({ map: posterTex("planet", 9), roughness: 0.6 }), 0.07, 0.1, 0.25, -0.1, 0.007, 0, 0, 0.2);
  }

  // ---------------- window wall: sliding window, glazed French door, curtains, AC, shoe rack, water dispenser ----------------
  // v2: the balcony is gone (from outside a recessed balcony hid the window under the slab above). The window and a
  // glazed French door open straight onto the facade: a Juliet railing outside the door, a stainless drying rack over
  // it with the laundry (still seen against the sky through the door glass), the AC's outdoor unit under the window.
  const glassM = new THREE.MeshBasicMaterial({ color: "#cfe0ff", map: glassTex(), transparent: true, opacity: 0.55, depthWrite: false });
  const sashR = new THREE.Group(); sashR.name = "windowSash";       // the sliding (inner) sash: setWindowOpen
  const fdLeaf = new THREE.Group(); fdLeaf.name = "frenchDoorLeaf"; // the French door leaf: setFrenchDoorOpen
  const SASH = { closedX: 0, travel: 0.65 };
  const laundry = new THREE.Group(); laundry.name = "laundry"; root.add(laundry); keep.add(laundry);
  {
    const g = new THREE.Group(); root.add(g);
    const fz = -HZ - 0.1;
    const frame = (par: THREE.Object3D, x0: number, y0: number, x1: number, y1: number, z: number, t = 0.04, mat: THREE.Material = alu) => {
      boxAt(par, mat, x0, y0, z - 0.03, x1, y0 + t, z + 0.03, 0.004); boxAt(par, mat, x0, y1 - t, z - 0.03, x1, y1, z + 0.03, 0.004);
      boxAt(par, mat, x0, y0, z - 0.03, x0 + t, y1, z + 0.03, 0.004); boxAt(par, mat, x1 - t, y0, z - 0.03, x1, y1, z + 0.03, 0.004);
    };
    const pane = (par: THREE.Object3D, x0: number, y0: number, x1: number, y1: number, z: number) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, y1 - y0), glassM); m.position.set((x0 + x1) / 2, (y0 + y1) / 2, z);
      m.userData.uv01 = true; m.userData.noInk = true; m.layers.set(NOINK); m.renderOrder = 2; par.add(m); keep.add(m);
    };
    // window: outer frame, the fixed outer-track sash (left), the sliding inner sash (right) in its own group
    frame(g, WIN.x0, WIN.y0, WIN.x1, WIN.y1, fz, 0.05);
    const mx = (WIN.x0 + WIN.x1) / 2;
    frame(g, WIN.x0 + 0.05, WIN.y0 + 0.05, mx + 0.03, WIN.y1 - 0.05, fz - 0.03, 0.04); pane(g, WIN.x0 + 0.09, WIN.y0 + 0.09, mx - 0.01, WIN.y1 - 0.09, fz - 0.03);
    g.add(sashR); keep.add(sashR);
    frame(sashR, mx - 0.03, WIN.y0 + 0.05, WIN.x1 - 0.05, WIN.y1 - 0.05, fz + 0.03, 0.04); pane(sashR, mx + 0.01, WIN.y0 + 0.09, WIN.x1 - 0.09, WIN.y1 - 0.09, fz + 0.03);
    boxAt(sashR, alu, WIN.x1 - 0.085, (WIN.y0 + WIN.y1) / 2 - 0.06, fz + 0.06, WIN.x1 - 0.07, (WIN.y0 + WIN.y1) / 2 + 0.06, fz + 0.075, 0.004); // pull
    boxAt(g, alu, WIN.x0 + 0.06, (WIN.y0 + WIN.y1) / 2 + 0.25, fz + 0.06, WIN.x0 + 0.09, (WIN.y0 + WIN.y1) / 2 + 0.35, fz + 0.075, 0.004);
    // glazed French door: frame fixed, the leaf (kick panel, rail, glass, handles) hinged at its left edge
    frame(g, BDOOR.x0, 0, BDOOR.x1, BDOOR.y1, fz, 0.05);
    fdLeaf.position.set(BDOOR.x0 + 0.05, 0, fz); g.add(fdLeaf); keep.add(fdLeaf);
    const fl = new THREE.Group(); fl.position.set(-(BDOOR.x0 + 0.05), 0, -fz); fdLeaf.add(fl);
    boxAt(fl, alu, BDOOR.x0 + 0.05, 0.05, fz - 0.02, BDOOR.x1 - 0.05, 0.62, fz + 0.02, 0.006);
    boxAt(fl, alu, BDOOR.x0 + 0.05, 0.62, fz - 0.025, BDOOR.x1 - 0.05, 0.66, fz + 0.025, 0.004);
    frame(fl, BDOOR.x0 + 0.05, 0.05, BDOOR.x1 - 0.05, BDOOR.y1 - 0.05, fz, 0.035);
    pane(fl, BDOOR.x0 + 0.08, 0.66, BDOOR.x1 - 0.08, BDOOR.y1 - 0.085, fz);
    put(fl, CY(0.012, 0.012, 0.14, 10), chrome, BDOOR.x1 - 0.1, 1.05, fz + 0.06);
    boxAt(fl, chrome, BDOOR.x1 - 0.12, 0.97, fz + 0.035, BDOOR.x1 - 0.08, 1.13, fz + 0.045, 0.004);
    put(fl, CY(0.012, 0.012, 0.14, 10), chrome, BDOOR.x1 - 0.1, 1.05, fz - 0.06);
    // curtain rod + curtains gathered at both ends of the far wall
    rod(g, chrome, V(-HX + 0.05, 2.62, -HZ + 0.1), V(HX - 0.05, 2.62, -HZ + 0.1), 0.012, 10);
    for (const s of [-1, 1]) put(g, SP(0.022, 10, 8), chrome, s * (HX - 0.04), 2.62, -HZ + 0.1);
    const cF = fab([236, 214, 170], "plaid", [255, 240, 210], [200, 120, 90], 0.45, 19, THREE.DoubleSide);
    for (const [x, w] of [[-HX + 0.24, 0.42], [-0.02, 0.22], [HX - 0.22, 0.4]] as const) {
      const c = put(g, pleats(w, 2.5, Math.round(w * 22), 0.04, Math.round(x * 10 + 50)), cF, x, 2.6, -HZ + 0.1); c.userData.uv01 = true;
    }
    // AC indoor unit over the window, its pipe through the wall to the outdoor unit
    const ac = new THREE.Group(); ac.position.set(-0.85, 2.72, -HZ + 0.12); g.add(ac);
    boxAt(ac, whitePl, -0.42, -0.14, -0.1, 0.42, 0.14, 0.1, 0.03);
    boxAt(ac, pl("#e3e5e8", 0.35), -0.4, -0.14, 0.05, 0.4, -0.08, 0.105, 0.01);
    for (let k = 0; k < 5; k++) boxAt(ac, pl("#c9ccd1", 0.4), -0.38, 0.06 + k * 0.012, 0.098, 0.38, 0.065 + k * 0.012, 0.102);
    put(ac, SP(0.005, 6, 4), basic(new THREE.Color(0.4, 2.2, 0.6)), 0.33, -0.03, 0.102, 0, 0, 0, false);
    cable(g, [V(-0.44, 2.64, -HZ + 0.07), V(-0.36, 2.62, -HZ + 0.05), V(-0.3, 2.6, -HZ + 0.012)], "#f0f0f0", 0.009); // pipe into the wall above the window
    put(g, CY(0.025, 0.025, 0.008, 16), whitePl, -0.3, 2.6, -HZ + 0.004, 0, Math.PI / 2);
    // shoe rack (left, near the window) with shoes, water dispenser (right) + thermos
    const sr = new THREE.Group(); sr.position.set(-HX + 0.17, 0, -2.55); g.add(sr);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) put(sr, CY(0.008, 0.008, 0.62, 6), chrome, sx * 0.13, 0.31, sz * 0.4);
    for (const y of [0.08, 0.32, 0.56]) for (const sx of [-1, 1]) rod(sr, chrome, V(sx * 0.1, y, -0.4), V(sx * 0.1, y, 0.4), 0.006, 6);
    const wd = new THREE.Group(); wd.position.set(HX - 0.2, 0, -2.72); wd.rotation.y = -Math.PI / 2; g.add(wd);
    boxAt(wd, whitePl, -0.15, 0, -0.15, 0.15, 0.92, 0.15, 0.02);
    boxAt(wd, pl("#cfd6dd", 0.4), -0.13, 0.45, 0.15, 0.13, 0.7, 0.16, 0.006);
    put(wd, RB(0.04, 0.05, 0.04, 0.01), pl("#e53935", 0.3), -0.05, 0.63, 0.17); put(wd, RB(0.04, 0.05, 0.04, 0.01), pl("#1e88e5", 0.3), 0.05, 0.63, 0.17);
    boxAt(wd, pl("#9aa4ad", 0.4), -0.1, 0.45, 0.1, 0.1, 0.47, 0.22, 0.004);
    put(wd, lathe([[0, 0], [0.13, 0], [0.135, 0.02], [0.135, 0.3], [0.11, 0.36], [0.03, 0.4], [0.03, 0.43], [0, 0.43]], 24), M.paint({ color: "#6fb7ef", roughness: 0.08, specular: 1 }), 0, 0.92, 0, Math.PI);
    for (const y of [0.98, 1.08, 1.18]) put(wd, new THREE.TorusGeometry(0.135, 0.006, 6, 24), M.paint({ color: "#5aa6e3", roughness: 0.1 }), 0, y, 0, 0, Math.PI / 2);
    const th = new THREE.Group(); th.position.set(HX - 0.22, 0, -2.35); g.add(th);
    put(th, lathe([[0, 0], [0.07, 0], [0.075, 0.02], [0.075, 0.3], [0.05, 0.36], [0.03, 0.38], [0, 0.38]], 22), pl("#d93a3a", 0.3), 0, 0, 0);
    put(th, CY(0.077, 0.077, 0.06, 22), pl("#f2d36b", 0.3), 0, 0.15, 0);
    put(th, CY(0.032, 0.03, 0.05, 14), pl("#f2efe6", 0.6), 0, 0.4, 0);

    // ---- outside the window wall (our bay of the facade) ----
    const zo = -HZ - 0.2; // facade plane
    // Juliet railing outside the French door: posts, rails, bars, wall brackets
    const jz = zo - 0.16, jx0 = BDOOR.x0 - 0.04, jx1 = BDOOR.x1 + 0.04;
    for (const x of [jx0, jx1]) { rod(g, extAlu, V(x, 0.0, jz), V(x, 1.08, jz), 0.014, 10); for (const y of [0.12, 1.02]) rod(g, extAlu, V(x, y, zo), V(x, y, jz), 0.01, 6); }
    for (const y of [0.1, 1.08]) rod(g, extAlu, V(jx0, y, jz), V(jx1, y, jz), y > 1 ? 0.018 : 0.011, 10);
    for (let k = 1; k < 9; k++) { const x = jx0 + ((jx1 - jx0) * k) / 9; rod(g, extAlu, V(x, 0.1, jz), V(x, 1.08, jz), 0.007, 6); }
    // stainless drying rack over the French door: two arms from the wall, three poles; laundry on hangers (sways)
    const ry = 2.36, ax = [BDOOR.x0 - 0.03, BDOOR.x1 + 0.03];
    for (const x of ax) { rod(g, extAlu, V(x, ry - 0.06, zo), V(x, ry, zo - 0.78), 0.012, 8); rod(g, extAlu, V(x, ry - 0.3, zo), V(x, ry - 0.03, zo - 0.4), 0.008, 6); boxAt(g, extAlu, x - 0.03, ry - 0.36, zo - 0.012, x + 0.03, ry, zo, 0.004); }
    const polesZ = [zo - 0.32, zo - 0.55, zo - 0.76];
    for (const z of polesZ) rod(g, extAlu, V(ax[0] - 0.08, ry - 0.02 + (zo - z) * 0.07, z), V(ax[1] + 0.08, ry - 0.02 + (zo - z) * 0.07, z), 0.009, 8);
    const tee = new THREE.Shape();
    tee.moveTo(-0.08, 0); tee.quadraticCurveTo(0, -0.06, 0.08, 0); tee.lineTo(0.19, -0.03); tee.lineTo(0.3, -0.17); tee.lineTo(0.22, -0.24); tee.lineTo(0.18, -0.19);
    tee.lineTo(0.18, -0.62); tee.lineTo(-0.18, -0.62); tee.lineTo(-0.18, -0.19); tee.lineTo(-0.22, -0.24); tee.lineTo(-0.3, -0.17); tee.lineTo(-0.19, -0.03); tee.closePath();
    const pants = new THREE.Shape();
    pants.moveTo(-0.17, 0); pants.lineTo(0.17, 0); pants.lineTo(0.2, -0.85); pants.lineTo(0.04, -0.85); pants.lineTo(0, -0.2); pants.lineTo(-0.04, -0.85); pants.lineTo(-0.2, -0.85); pants.closePath();
    const towel = new THREE.Shape(); towel.moveTo(-0.16, 0); towel.lineTo(0.16, 0); towel.lineTo(0.16, -0.5); towel.lineTo(-0.16, -0.5); towel.closePath();
    const extr = (sh: THREE.Shape) => { const e = new THREE.ExtrudeGeometry(sh, { depth: 0.012, bevelEnabled: false, curveSegments: 4 }); e.translate(0, 0, -0.006); const p = e.attributes.position; for (let i = 0; i < p.count; i++) p.setZ(i, p.getZ(i) + 0.03 * Math.sin(p.getX(i) * 8) * (-p.getY(i))); e.computeVertexNormals(); return e; };
    const teeG = extr(tee), pantsG = extr(pants), towelG = extr(towel);
    // hangers face the room (garments in the x-y plane), so they read through the door glass
    const items: [number, number, THREE.BufferGeometry, THREE.Material, number][] = [
      [0.36, polesZ[0], teeG, fab([245, 245, 240], "plain", undefined, undefined, 0.3, 30, THREE.DoubleSide), 0.8],
      [0.78, polesZ[0], towelG, fab([255, 140, 120], "stripe", [255, 240, 230], [220, 80, 70], 0.25, 31, THREE.DoubleSide), 1],
      [0.55, polesZ[1], teeG, fab([90, 140, 220], "stripe", [255, 255, 255], [40, 80, 160], 0.3, 32, THREE.DoubleSide), 0.8],
      [1.0, polesZ[1], towelG, fab([140, 210, 190], "check", [255, 255, 255], undefined, 0.25, 35, THREE.DoubleSide), 0.9],
      [0.3, polesZ[2], pantsG, fab([60, 70, 100], "plain", undefined, undefined, 0.3, 33, THREE.DoubleSide), 0.8],
      [0.82, polesZ[2], teeG, fab([255, 200, 80], "plain", undefined, undefined, 0.3, 34, THREE.DoubleSide), 0.8],
    ];
    items.forEach(([x, z, geo, m, sc], k) => {
      const hg = new THREE.Group(); hg.position.set(x, ry - 0.02 + (zo - z) * 0.07, z); laundry.add(hg);
      put(hg, new THREE.TorusGeometry(0.02, 0.003, 4, 10, Math.PI * 1.3), alu, 0, 0.0, 0, 0, 0, Math.PI * 0.85);
      rod(hg, alu, V(0, -0.02, 0), V(-0.18 * sc, -0.11, 0), 0.003, 4); rod(hg, alu, V(0, -0.02, 0), V(0.18 * sc, -0.11, 0), 0.003, 4); rod(hg, alu, V(-0.18 * sc, -0.11, 0), V(0.18 * sc, -0.11, 0), 0.003, 4);
      const c = put(hg, geo, m, 0, -0.12, 0, (k % 2 ? 0.2 : -0.15), 0, 0); c.userData.uv01 = true; c.scale.setScalar(sc);
      animFns.push((t) => { hg.rotation.z = 0.035 * Math.sin(t * 1.1 + k * 1.7); hg.rotation.y = 0.08 * Math.sin(t * 0.7 + k); });
    });
    // AC outdoor unit on brackets under the window, fan grille toward the yard, its pipe up into the wall
    const ou = new THREE.Group(); ou.position.set(-0.95, 0.14, zo); g.add(ou);
    boxAt(ou, xpl("#eeeeea", 0.45), -0.4, 0, -0.42, 0.4, 0.55, -0.04, 0.015);
    put(ou, CY(0.19, 0.19, 0.01, 28), xpl("#3a3e46", 0.6), -0.08, 0.275, -0.425, 0, Math.PI / 2);
    for (const r of [0.07, 0.13, 0.18]) put(ou, new THREE.TorusGeometry(r, 0.005, 4, 28), xpl("#d8d8d4", 0.4), -0.08, 0.275, -0.43);
    for (let k = 0; k < 6; k++) boxAt(ou, xpl("#c9cbc8", 0.5), 0.2, 0.08 + k * 0.07, -0.425, 0.36, 0.1 + k * 0.07, -0.42);
    for (const x of [-0.3, 0.3]) { boxAt(ou, extGreyM, x - 0.02, -0.04, -0.46, x + 0.02, 0.0, 0.0, 0.004); rod(ou, extGreyM, V(x, -0.02, -0.44), V(x, -0.3, 0), 0.012, 6); }
    // the refrigerant pipe runs right under the sill, up the pier between the window and the French door, and into
    // the wall above the window where the indoor unit's pipe comes out (never across the glass)
    { const pm = xpl("#e8e8e4", 0.5), pts = [V(0.4, 0.42, -0.2), V(0.9, 0.42, -0.07), V(0.9, 2.46, -0.07), V(0.65, 2.46, -0.07), V(0.65, 2.46, 0.0)];
      for (let k = 0; k + 1 < pts.length; k++) rod(ou, pm, pts[k], pts[k + 1], 0.02, 8);
      for (const p of pts.slice(1, 4)) put(ou, SP(0.02, 8, 6), pm, p.x, p.y, p.z, 0, 0, 0, false); }
  }

  // ---------------- floor props ----------------
  {
    const g = new THREE.Group(); root.add(g);
    // sneakers: sole, upper (scaled half sphere), collar
    const shoe = (x: number, z: number, ry: number, up: string, sole: string, s = 1) => {
      const sh = new THREE.Group(); sh.position.set(x, 0, z); sh.rotation.y = ry; sh.scale.setScalar(s); g.add(sh);
      put(sh, RB(0.105, 0.03, 0.28, 0.012, 2), pl(sole, 0.5), 0, 0.015, 0);
      const u = put(sh, new THREE.SphereGeometry(0.1, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), pl(up, 0.55), 0, 0.028, 0.015); u.scale.set(0.5, 0.75, 1.32);
      put(sh, CY(0.04, 0.045, 0.03, 14), pl(sole === "#ffffff" ? "#2b2b2b" : "#f4f4f4", 0.6), 0, 0.09, -0.075).scale.set(1, 1, 1.25);
      put(sh, RB(0.06, 0.012, 0.11, 0.004), pl("#ffffff", 0.7), 0, 0.085, 0.05, 0, 0.45);
    };
    shoe(-1.02, 1.72, 0.3, "#f5f5f5", "#ffffff"); shoe(-0.86, 1.6, 0.05, "#f5f5f5", "#ffffff");
    shoe(0.66, -1.66, 2.9, "#e53935", "#ffffff"); shoe(0.97, -1.36, 3.5, "#e53935", "#ffffff");
    shoe(-0.18, 0.95, 1.4, "#2f3542", "#ffffff", 0.95); g.children[g.children.length - 1].position.y = 0.012; // kicked off onto the rug
    // rug in the aisle (clear of the chairs)
    { const rg = put(g, RB(1.0, 0.012, 1.3, 0.005, 1), fab([242, 196, 104], "stripe", [255, 246, 228], [222, 96, 80], 0.55, 40), 0.03, 0.006, 1.15, 0.04);
      rg.receiveShadow = true; }
    // acoustic guitar leaning on the post between bunks 3 and 4, its face toward the room
    { const gt = new THREE.Group(); gt.position.set(0.7, 0, -0.16); gt.rotation.set(0, -Math.PI / 2 + 0.5, 0, "YXZ"); g.add(gt);
      const lean = new THREE.Group(); lean.rotation.x = -0.2; gt.add(lean); // top tips back toward the post
      const top = M.wood(W.woodMaps(W.railCap({ color: [236, 186, 120], grain: 1.2, seed: 77 }))), side = pl("#8a4b2a", 0.35);
      const body = (r: number, y: number) => { put(lean, CY(r, r, 0.1, 28), side, 0, y, -0.05, 0, Math.PI / 2); put(lean, CY(r - 0.006, r - 0.006, 0.004, 28), top, 0, y, 0.001, 0, Math.PI / 2); };
      body(0.19, 0.24); body(0.145, 0.5); body(0.12, 0.38);
      put(lean, CY(0.045, 0.045, 0.004, 20), blackM, 0, 0.47, 0.004, 0, Math.PI / 2);
      put(lean, new THREE.TorusGeometry(0.052, 0.005, 4, 20), pl("#f2e2c0", 0.4), 0, 0.47, 0.004);
      boxAt(lean, pl("#3a2418", 0.4), -0.05, 0.19, -0.002, 0.05, 0.215, 0.012, 0.003);
      boxAt(lean, pl("#5a3420", 0.4), -0.024, 0.6, -0.03, 0.024, 1.02, -0.004, 0.004);
      boxAt(lean, blackM, -0.022, 0.6, -0.006, 0.022, 1.02, 0.0, 0.002);
      boxAt(lean, pl("#5a3420", 0.4), -0.035, 1.02, -0.03, 0.035, 1.18, -0.006, 0.006);
      for (let k = 0; k < 3; k++) for (const sx of [-1, 1]) put(lean, CY(0.006, 0.006, 0.03, 6), chrome, sx * 0.045, 1.06 + k * 0.045, -0.018, 0, 0, Math.PI / 2);
      for (let k = 0; k < 6; k++) rod(lean, chrome, V(-0.0125 + k * 0.005, 0.205, 0.006), V(-0.0125 + k * 0.005, 1.02, 0.002), 0.0008, 3); }
    // on the shoe rack
    for (const [z, c, y] of [[-2.8, "#ffd23f", 0.33], [-2.48, "#4b7bd8", 0.33], [-2.75, "#f5f5f5", 0.09], [-2.4, "#8e44ad", 0.57], [-2.75, "#2f3542", 0.57]] as const) {
      shoe(-HX + 0.17, z, Math.PI / 2 + (z * 7) % 0.3, c, "#ffffff", 0.95); g.children[g.children.length - 1].position.y = y;
    }
    // slippers by bunk 3's ladder
    for (const [x, z, ry] of [[0.63, 1.62, 2.9], [0.76, 1.48, 3.3]] as const) { const s = new THREE.Group(); s.position.set(x, 0, z); s.rotation.y = ry; g.add(s); put(s, RB(0.11, 0.022, 0.27, 0.01, 2), pl("#5fb0e8", 0.5), 0, 0.011, 0); put(s, new THREE.TorusGeometry(0.05, 0.016, 6, 14, Math.PI), pl("#3b8fd0", 0.5), 0, 0.02, 0.04).scale.set(1, 1, 1.6); }
    // trash bin between desks 1 and 2, crumpled paper (one missed shot on the floor)
    const tb = new THREE.Group(); tb.position.set(-0.68, 0, -0.18); g.add(tb);
    put(tb, lathe([[0, 0], [0.11, 0], [0.135, 0.3], [0.14, 0.31], [0.13, 0.31], [0.105, 0.012], [0, 0.012]], 24), pl("#7dc87d", 0.4), 0, 0, 0);
    put(tb, new THREE.TorusGeometry(0.138, 0.01, 6, 24), pl("#f2f2f2", 0.3), 0, 0.31, 0, 0, Math.PI / 2);
    for (const [x, y, z] of [[0.02, 0.27, 0.03], [-0.05, 0.25, -0.02], [0.05, 0.24, -0.05]] as const) put(tb, new THREE.IcosahedronGeometry(0.04, 1), paperM, x, y, z, x * 20, y * 10);
    const crumple = (x: number, z: number, s: number) => { const gg = new THREE.IcosahedronGeometry(0.035 * s, 1); const p = gg.attributes.position; const RR = rng(Math.round(x * 100 + z * 10)); for (let i = 0; i < p.count; i++) p.setXYZ(i, p.getX(i) * (0.8 + 0.4 * RR()), p.getY(i) * (0.8 + 0.4 * RR()), p.getZ(i) * (0.8 + 0.4 * RR())); gg.computeVertexNormals(); put(g, gg, paperM, x, 0.03 * s, z, RR() * 6); };
    crumple(-0.46, -0.32, 1); crumple(-0.5, 0.02, 0.8);
    // basketball under desk 4 and a delivery box
    put(g, new THREE.SphereGeometry(0.12, 24, 16), M.paint({ map: ballTex(), roughness: 0.7 }), 1.38, 0.12, -1.2).userData.uv01 = true;
    const db = new THREE.Group(); db.position.set(-1.22, 0, -2.72); db.rotation.y = 0.2; g.add(db); // v2: in the corner under the sill (clear of the door swing and the perches)
    boxAt(db, cardM, -0.2, 0, -0.15, 0.2, 0.22, 0.15, 0.004);
    boxAt(db, tapeM, -0.205, 0.218, -0.025, 0.205, 0.223, 0.025);
    pic(db, pl("#ffffff", 0.6), 0.12, 0.08, 0.05, 0.224, 0.06, 0, -Math.PI / 2);
    // power strip on the floor under desk 3 with cables
    boxAt(g, whitePl, 1.5, 0, 0.3, 1.56, 0.04, 0.62, 0.008);
    cable(g, [V(1.53, 0.03, 0.4), V(1.4, 0.005, 0.5), V(1.25, 0.005, 0.8), V(1.2, 0.3, 1.0), V(1.22, DT - 0.02, 1.05)], "#f4f4f4", 0.004);
    // broom leaning in the corner by the door
    rod(g, pl("#4aa3df", 0.4), V(-HX + 0.62, 0.05, HZ - 0.06), V(-HX + 0.6, 1.25, HZ - 0.04), 0.012);
    boxAt(g, pl("#e65a5a", 0.6), -HX + 0.52, 0, HZ - 0.1, -HX + 0.72, 0.1, HZ - 0.03, 0.01);
  }

  // ---------------- art pass: lived-in dressing (bed rails, entrance wall, aisle edges) ----------------
  {
    const g = new THREE.Group(); g.name = "dressing"; root.add(g);
    // garments: flat extruded cloth with a soft billow, hung from a wire hanger (shape in the XY plane, hook at origin)
    const teeShape = () => { const s = new THREE.Shape(); s.moveTo(-0.08, 0); s.quadraticCurveTo(0, -0.06, 0.08, 0); s.lineTo(0.19, -0.03); s.lineTo(0.3, -0.17); s.lineTo(0.22, -0.24); s.lineTo(0.18, -0.19);
      s.lineTo(0.18, -0.62); s.lineTo(-0.18, -0.62); s.lineTo(-0.18, -0.19); s.lineTo(-0.22, -0.24); s.lineTo(-0.3, -0.17); s.lineTo(-0.19, -0.03); s.closePath(); return s; };
    const cloth = (shape: THREE.Shape, billow = 0.025) => { const e = new THREE.ExtrudeGeometry(shape, { depth: 0.014, bevelEnabled: false, curveSegments: 4 }); e.translate(0, 0, -0.007);
      const p = e.attributes.position; for (let i = 0; i < p.count; i++) p.setZ(i, p.getZ(i) + billow * Math.sin(p.getX(i) * 9 + 1) * (-p.getY(i))); e.computeVertexNormals(); return e; };
    const hungTee = (parent: THREE.Object3D, x: number, y: number, z: number, ry: number, mat: THREE.Material) => {
      const hg = new THREE.Group(); hg.position.set(x, y, z); hg.rotation.y = ry; parent.add(hg);
      put(hg, new THREE.TorusGeometry(0.022, 0.003, 4, 10, Math.PI * 1.3), alu, 0, 0.02, 0, 0, 0, Math.PI * 0.85);
      rod(hg, alu, V(0, 0, 0), V(-0.19, -0.1, 0), 0.003, 4); rod(hg, alu, V(0, 0, 0), V(0.19, -0.1, 0), 0.003, 4); rod(hg, alu, V(-0.19, -0.1, 0), V(0.19, -0.1, 0), 0.003, 4);
      const c = put(hg, cloth(teeShape()), mat, 0, -0.02, 0.012); c.userData.uv01 = true;
      return hg;
    };
    // a tee hung off bunk 1's aisle top rail and a striped shirt off bunk 4's (outside the rail, over the aisle)
    hungTee(L1.g, D + 0.035, RT - 0.005, 0.32, Math.PI / 2 + 0.15, fab([240, 120, 110], "plain", undefined, undefined, 0.3, 61, THREE.DoubleSide));
    hungTee(R2.g, D + 0.035, RT - 0.005, 0.18, Math.PI / 2 - 0.1, fab([250, 250, 246], "stripe", [70, 120, 210], [40, 80, 160], 0.25, 62, THREE.DoubleSide));
    // hanging bedside caddy on bunk 4's aisle rail: water bottle, tissues, a paperback
    { const c = new THREE.Group(); c.position.set(D + 0.065, RM - 0.03, 0.62); c.scale.setScalar(0.85); R2.g.add(c);
      const cm = pl("#62c4b8", 0.45);
      boxAt(c, cm, -0.06, -0.14, -0.15, 0.06, -0.125, 0.15, 0.004);
      for (const s of [-1, 1]) { boxAt(c, cm, -0.06, -0.14, s * 0.15 - 0.006, 0.06, 0, s * 0.15 + 0.006, 0.003); boxAt(c, cm, s * 0.06 - 0.006, -0.14, -0.15, s * 0.06 + 0.006, 0, 0.15, 0.003); }
      for (const z of [-0.1, 0.1]) boxAt(c, cm, -0.075, -0.01, z - 0.012, -0.045, 0.03, z + 0.012, 0.003);
      bottle(c, 0.0, -0.125, -0.08, "#9fe0ff", "#ff6b6b");
      boxAt(c, pl("#ffffff", 0.7), -0.045, -0.125, 0.0, 0.045, -0.05, 0.13, 0.008);
      boxAt(c, pl("#2f6fd6", 0.6), -0.05, -0.125, -0.02, 0.05, 0.03, -0.004, 0.003); }
    // tote bag on bunk 1's aisle corner post, cap on bunk 3's ladder
    { const t = put(L1.g, lumpy(0.3, 0.34, 0.06, 81, 0.12, [4, 5, 2], 0.05), fab([244, 232, 206], "plain", undefined, undefined, 0.3, 63), D + 0.02, 1.3, P / 2 + 0.01, Math.PI / 2 + 0.1, 0, 0.06); void t;
      put(L1.g, CY(0.004, 0.004, 0.24, 5), pl("#c9a46a", 0.7), D + 0.02, 1.52, P / 2 - 0.08, Math.PI / 2, 0, 0.6);
      put(L1.g, CY(0.004, 0.004, 0.24, 5), pl("#c9a46a", 0.7), D + 0.02, 1.52, P / 2 + 0.1, Math.PI / 2, 0, -0.6);
      pic(L1.g, M.paint({ map: posterTex("cat", 12), roughness: 0.8 }), 0.12, 0.15, D + 0.055, 1.3, P / 2 + 0.01, Math.PI / 2 + 0.1); }
    { const cp = new THREE.Group(); cp.position.set(D + 0.05, RT + 0.02, 0.26 + 0.2); cp.rotation.set(0.25, 0.4, 0); R1.g.add(cp);
      put(cp, new THREE.SphereGeometry(0.085, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), pl("#e5483b", 0.6), 0, 0, 0).scale.set(1, 0.75, 1.05);
      put(cp, RB(0.15, 0.008, 0.1, 0.004), pl("#e5483b", 0.6), 0, 0.004, 0.11); }

    // entrance wall: whiteboard with the duty rota, a broadcast speaker up by the cornice
    { const wb = new THREE.Group(); wb.position.set(-0.97, 1.64, HZ - 0.012); wb.rotation.y = Math.PI; g.add(wb);
      boxAt(wb, alu, -0.27, -0.2, -0.008, 0.27, 0.2, 0.008, 0.006);
      pic(wb, M.paint({ map: whiteboardTex(), roughness: 0.25, specular: 0.8 }), 0.52, 0.38, 0, 0, 0.0085);
      boxAt(wb, alu, -0.2, -0.235, 0.0, 0.2, -0.205, 0.045, 0.004);
      put(wb, CY(0.009, 0.009, 0.12, 8), pl("#2a55c8", 0.4), -0.08, -0.198, 0.025, 0, 0, Math.PI / 2);
      put(wb, CY(0.009, 0.009, 0.12, 8), pl("#e5483b", 0.4), 0.07, -0.198, 0.02, 0.2, 0, Math.PI / 2);
      for (const [x, y, c] of [[-0.22, 0.15, "#ffd23f"], [0.21, 0.16, "#2fa84f"], [0.2, -0.13, "#e5483b"]] as const) put(wb, CY(0.014, 0.014, 0.01, 12), pl(c, 0.3), x, y, 0.013, 0, Math.PI / 2); }
    { const sp = new THREE.Group(); sp.position.set(-1.5, 2.66, HZ - 0.055); g.add(sp);
      boxAt(sp, pl("#f2efe8", 0.5), -0.13, -0.09, -0.05, 0.13, 0.09, 0.05, 0.012);
      for (let k = 0; k < 5; k++) boxAt(sp, pl("#9aa0a8", 0.5), -0.1, -0.06 + k * 0.026, -0.053, 0.1, -0.05 + k * 0.026, -0.049);
      boxAt(sp, pl("#9aa0a8", 0.5), -0.015, 0.09, -0.01, 0.015, 0.34, 0.01); }
    // red plastic stool by bunk 1's ladder with a wash basin, toothbrush mug and towel on it
    { const st = new THREE.Group(); st.position.set(-0.98, 0, 2.38); st.rotation.y = 0.3; g.add(st);
      const red = pl("#e8433a", 0.4);
      put(st, lathe([[0, 0.43], [0.15, 0.43], [0.155, 0.41], [0.13, 0.4], [0, 0.4]], 22), red, 0, 0, 0);
      for (let k = 0; k < 4; k++) { const a = (k / 4) * Math.PI * 2 + 0.785; const lg = put(st, RB(0.04, 0.42, 0.06, 0.01), red, Math.cos(a) * 0.12, 0.2, Math.sin(a) * 0.12, -a); lg.rotation.set(0, -a, 0); lg.rotateZ(0.12); }
      put(st, new THREE.TorusGeometry(0.14, 0.012, 6, 22), red, 0, 0.12, 0, 0, Math.PI / 2);
      put(st, lathe([[0, 0], [0.12, 0], [0.165, 0.1], [0.175, 0.105], [0.17, 0.11], [0.155, 0.1], [0.11, 0.008], [0, 0.008]], 24), pl("#52b8e8", 0.3), 0, 0.43, 0);
      mug(st, 0.04, 0.438, -0.03, "#ffd23f");
      for (const [dx, c] of [[0.0, "#ff6b9a"], [0.012, "#2fa84f"]] as const) { const tb = put(st, CY(0.004, 0.004, 0.17, 5), pl(c, 0.4), 0.04 + dx, 0.53, -0.03 + dx); tb.rotation.set(0.15, 0, 0.12 - dx * 10); }
      put(st, lumpy(0.2, 0.05, 0.14, 84, 0.6, [3, 1, 3], 0.4), fab([140, 210, 190], "check", [255, 255, 255], undefined, 0.25, 64), -0.04, 0.475, 0.05, 0.4); }
    // umbrella leaning by the door, flip-flops on the doormat
    { const u = new THREE.Group(); u.position.set(0.6, 0, HZ - 0.08); u.rotation.set(0.12, 0, -0.1); g.add(u);
      put(u, CY(0.045, 0.012, 0.62, 10), pl("#3f7fd8", 0.5), 0, 0.42, 0);
      put(u, CY(0.006, 0.006, 0.86, 6), chrome, 0, 0.43, 0);
      put(u, new THREE.TorusGeometry(0.035, 0.009, 6, 12, Math.PI), darkPl, 0.035, 0.86, 0, 0, 0, 0);
      put(u, CY(0.01, 0.016, 0.02, 8), darkPl, 0, 0.01, 0); }
    boxAt(g, fab([110, 120, 140], "plain", undefined, undefined, 0.3, 65), -0.42, 0, HZ - 0.55, 0.42, 0.012, HZ - 0.05, 0.005); // doormat
    for (const [x, z, ry] of [[0.18, 2.72, 0.2], [0.32, 2.68, -0.15]] as const) { const f = new THREE.Group(); f.position.set(x, 0.012, z); f.rotation.y = ry; g.add(f);
      put(f, RB(0.1, 0.018, 0.25, 0.01, 2), pl("#ffd23f", 0.5), 0, 0.009, 0); boxAt(f, pl("#2f3542", 0.5), -0.045, 0.018, -0.03, 0.045, 0.04, 0.02, 0.01); }
    // laundry basket by the balcony end of bunk 4, clothes spilling over the rim
    { const lb = new THREE.Group(); lb.position.set(1.17, 0, -2.68); lb.rotation.y = 0.4; g.add(lb); // v2: tucked by the water dispenser
      const bm = pl("#5cc0b0", 0.5);
      put(lb, lathe([[0, 0], [0.15, 0], [0.152, 0.01], [0.18, 0.38], [0.192, 0.385], [0.19, 0.4], [0.175, 0.395], [0.142, 0.016], [0, 0.016]], 22), bm, 0, 0, 0);
      for (const y of [0.13, 0.26]) put(lb, new THREE.TorusGeometry(0.152 + y * 0.075, 0.007, 4, 22), pl("#3f9d90", 0.5), 0, y, 0, 0, Math.PI / 2);
      put(lb, lumpy(0.3, 0.12, 0.3, 91, 0.9, [5, 2, 5], 0.5), fab([90, 140, 220], "stripe", [255, 255, 255], [40, 80, 160], 0.3, 66), 0, 0.42, 0);
      put(lb, lumpy(0.07, 0.26, 0.12, 92, 0.25, [2, 5, 3], 0.1), pl("#f4f1ea", 0.9), 0.2, 0.3, 0.04, 0.2, 0, -0.35);
      put(lb, lumpy(0.18, 0.08, 0.16, 93, 0.8, [4, 2, 4], 0.3), pl("#3a3d46", 0.9), -0.05, 0.47, 0.05, 1.2); }
    // window sill: a cactus at the far end (the rest stays clear for a figure to stand on)
    plant(g, WIN.x0 + 0.07, WIN.y0, -HZ + 0.02, 0.9, 7);
  }

  // ---------------- ceiling: fan + smoke detector ----------------
  const fan = new THREE.Group(); fan.position.set(0, CH, 0.1); root.add(fan); keep.add(fan);
  {
    put(fan, CY(0.07, 0.05, 0.06, 18), whitePl, 0, -0.03, 0);
    put(fan, CY(0.012, 0.012, 0.32, 8), whitePl, 0, -0.22, 0);
    const rot = new THREE.Group(); rot.position.y = -0.42; fan.add(rot); rot.name = "fanRotor";
    put(rot, CY(0.11, 0.12, 0.09, 22), whitePl, 0, 0, 0);
    put(rot, CY(0.04, 0.04, 0.03, 12), pl("#c9ccd1", 0.4), 0, -0.06, 0);
    for (let k = 0; k < 3; k++) {
      const a = (k / 3) * Math.PI * 2, b = new THREE.Group(); b.rotation.y = a; rot.add(b);
      boxAt(b, chrome, 0.08, -0.01, -0.02, 0.2, 0.0, 0.02, 0.003);
      const bl = put(b, RB(0.58, 0.008, 0.12, 0.003), whitePl, 0.47, -0.005, 0); bl.rotation.x = 0.12;
    }
    animFns.push((t) => { rot.rotation.y = t * 1.2; });
    put(root, CY(0.06, 0.06, 0.03, 16), whitePl, 0.7, CH - 0.015, 1.0);
  }

  // ---------------- ceiling battens (日光灯): the room's motivated key light ----------------
  // Two surface-mounted twin-tube battens along the aisle, each with a shadow-casting spot pointing straight down from
  // the tubes (opts.overhead). White PVC trunking feeds them from the switch by the door. A soft additive spill on
  // the ceiling round each fixture stands in for the light the tubes throw upward (a spot cannot light the ceiling).
  const ceilingLights: THREE.SpotLight[] = [];
  const battenTubes: THREE.Mesh[] = [], battenSpills: THREE.Mesh[] = [];
  const TUBE_ON = basic(new THREE.Color(3.4, 3.2, 2.8)), TUBE_OFF = pl("#f1f1ee", 0.3);
  {
    // v2: always built; setLight / setTime switch them (tube material swap, spot intensity, spill opacity)
    const gain = opts.overheadGain ?? 1;
    const spillT = printTex(256, 256, (g, w, h) => { const gr = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.35, "rgba(255,255,255,0.45)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
    for (const z of [-1.75, 1.75]) {
      const f = new THREE.Group(); f.position.set(0, CH, z); f.rotation.y = Math.PI / 2; root.add(f); // across the room, so they read from down the aisle
      boxAt(f, whitePl, -0.1, -0.05, -0.66, 0.1, 0, 0.66, 0.012);                       // body
      for (const s of [-1, 1]) {
        boxAt(f, pl("#dfe2e6", 0.3), -0.105, -0.07, s * 0.635 - 0.025, 0.105, -0.004, s * 0.635 + 0.025, 0.008); // end caps (tube holders)
        const tb = put(f, CY(0.019, 0.019, 1.22, 12), TUBE_ON, s * 0.05, -0.075, 0, 0, Math.PI / 2, 0, false); // twin tubes
        keep.add(tb); battenTubes.push(tb);
      }
      boxAt(f, pl("#e8eaee", 0.25), -0.012, -0.068, -0.6, 0.012, -0.05, 0.6, 0.004);    // centre reflector ridge
      {
        const sp = new THREE.SpotLight("#fff0dc", 7.5 * gain, 10, 1.32, 1, 2); sp.name = "ceilingBatten"; sp.userData.base = 7.5 * gain;
        sp.position.set(0, CH - 0.1, z); sp.target.position.set(0, 0, z * 0.92);
        if (opts.overheadShadows ?? true) {
          sp.castShadow = true; sp.shadow.mapSize.set(1024, 1024); sp.shadow.radius = 4; sp.shadow.bias = -0.0005; sp.shadow.normalBias = 0.02;
          sp.shadow.camera.near = 0.2; sp.shadow.camera.far = 7;
        }
        root.add(sp, sp.target); ceilingLights.push(sp); lights.push(sp);
        const spill = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 2.4), new THREE.MeshBasicMaterial({ map: spillT, color: new THREE.Color(0.34, 0.31, 0.25), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
        spill.rotation.x = Math.PI / 2; spill.position.set(0, CH - 0.003, z); spill.userData.uv01 = true; spill.userData.noInk = true; spill.renderOrder = 1;
        spill.layers.set(NOINK); root.add(spill); keep.add(spill); battenSpills.push(spill);
      }
    }
    // trunking: from above the entrance switches up the near wall, along the ceiling to both battens and the fan
    const trunk = pl("#f4f4f0", 0.4);
    boxAt(root, trunk, -0.64, 1.42, HZ - 0.03, -0.6, CH, HZ);
    boxAt(root, trunk, -0.64, CH - 0.025, -1.77, -0.6, CH, HZ);
    for (const z of [-1.75, 0.1, 1.75]) boxAt(root, trunk, -0.62, CH - 0.022, z - 0.02, z === 0.1 ? -0.1 : -0.55, CH, z + 0.02);
    put(root, RB(0.09, 0.03, 0.09, 0.006), trunk, -0.62, CH - 0.02, -1.75);
  }

  // ---------------- v2 outside: our block's facade, the block across the yard, the yard, far blocks, sky ----------------
  // Our room is a 4th-floor bay (floor pitch 3.3 m, bay pitch 3.8 m) of a 6-storey block whose window wall faces -z.
  // 18 m across the yard stands a 3-storey block facing +z (its top storey one floor below ours, so the dusk sky shows
  // over its roof through our window); the friend's room is on its top storey. Facade windows are one vertex-coloured
  // quad each (an atlas of drawn interiors): lit / dark / sky-grey per hour, switched by setTime.
  const ext = new THREE.Group(); ext.name = "exterior"; root.add(ext);
  const FP = { bx: 3.8, fy: 3.3 }, GROUND = -3 * FP.fy - 0.45, ZF = -HZ - 0.2, ZO = ZF - 18;
  const FX = opts.friendX ?? -2.0, FFY = -FP.fy;           // the friend's window: bay centre x, floor y
  // the block across the yard is built in its own (unrotated) frame, then turned by friendYaw about the vertical through
  // the friend's window (pivot FP0): fW maps that frame to world, fL world to that frame
  const FYAW = opts.friendYaw ?? 0.56, FP0 = new THREE.Vector3(FX, 0, ZO), YAX = new THREE.Vector3(0, 1, 0);
  const fW = (v: THREE.Vector3) => v.clone().sub(FP0).applyAxisAngle(YAX, -FYAW).add(FP0);
  const fL = (v: THREE.Vector3) => v.clone().sub(FP0).applyAxisAngle(YAX, FYAW).add(FP0);
  type Rect = [number, number, number, number];
  type GWin = { v: number; thr: number; warm: boolean; k: number };
  type Glow = { pos: number[]; uv: number[]; col: number[]; idx: number[]; wins: GWin[]; geo?: THREE.BufferGeometry; par?: THREE.Object3D };
  const glows: Glow[] = [];
  const mkGlow = (): Glow => { const G: Glow = { pos: [], uv: [], col: [], idx: [], wins: [] }; glows.push(G); return G; };
  const glowQuad = (G: Glow, x0: number, y0: number, x1: number, y1: number, z: number, nz: number, R: () => number) => {
    const v = G.pos.length / 3, cell = Math.floor(R() * 16), cu = (cell % 4) / 4, cv = 1 - (Math.floor(cell / 4) + 1) / 4;
    const xa = nz > 0 ? x0 : x1, xb = nz > 0 ? x1 : x0;    // CCW and unmirrored as seen from outside
    G.pos.push(xa, y0, z, xb, y0, z, xb, y1, z, xa, y1, z);
    G.uv.push(cu + 0.004, cv + 0.004, cu + 0.246, cv + 0.004, cu + 0.246, cv + 0.246, cu + 0.004, cv + 0.246);
    for (let k = 0; k < 12; k++) G.col.push(0);
    G.idx.push(v, v + 1, v + 2, v, v + 2, v + 3);
    G.wins.push({ v, thr: R(), warm: R() < 0.82, k: 0.7 + 0.5 * R() });
  };
  const cellPieces = (cx0: number, cy0: number, cx1: number, cy1: number, holes: Rect[]): Rect[] => {
    const ys = Array.from(new Set([cy0, cy1, ...holes.flatMap((h) => [h[1], h[3]])])).filter((y) => y >= cy0 && y <= cy1).sort((a, b) => a - b);
    const out: Rect[] = [];
    for (let k = 0; k + 1 < ys.length; k++) {
      const y0 = ys[k], y1 = ys[k + 1], ym = (y0 + y1) / 2; if (y1 - y0 < 1e-4) continue;
      const cuts = holes.filter((h) => h[1] < ym && h[3] > ym).sort((a, b) => a[0] - b[0]);
      let x = cx0;
      for (const h of cuts) { if (h[0] > x + 1e-4) out.push([x, y0, h[0], y1]); x = Math.max(x, h[2]); }
      if (cx1 > x + 1e-4) out.push([x, y0, cx1, y1]);
    }
    return out;
  };
  /** a facade box with its own geometry and world-aligned metric UVs (u horizontal, v up on the walls), so the tile
   *  courses run level and continue across neighbouring pieces; no edge wear (edgeD 9) so the seams stay invisible */
  const extBox = (mat: THREE.Material, x0: number, y0: number, z0: number, x1: number, y1: number, z1: number) => {
    const w = Math.abs(x1 - x0), h = Math.abs(y1 - y0), d = Math.abs(z1 - z0), cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, cz = (z0 + z1) / 2;
    const geo = new THREE.BoxGeometry(w, h, d), p = geo.attributes.position, n = geo.attributes.normal, uv = geo.attributes.uv;
    for (let i = 0; i < p.count; i++) {
      const X = p.getX(i) + cx, Y = p.getY(i) + cy, Zz = p.getZ(i) + cz, ax = Math.abs(n.getX(i)), ay = Math.abs(n.getY(i));
      if (ay > 0.5) uv.setXY(i, X, Zz); else if (ax > 0.5) uv.setXY(i, Zz, Y); else uv.setXY(i, X, Y);
    }
    geo.setAttribute("edgeD", new THREE.BufferAttribute(new Float32Array(p.count * 4).fill(9), 4));
    const m = put(ext, geo, mat, cx, cy, cz); m.userData.uv01 = true; return m;
  };
  const railT = printTex(256, 128, (g, w, h) => { g.clearRect(0, 0, w, h); g.fillStyle = "#d4d8dc"; g.fillRect(0, 0, w, 10); g.fillRect(0, h - 12, w, 6); g.fillRect(0, 0, 8, h); g.fillRect(w - 8, 0, 8, h); for (let k = 1; k < 9; k++) g.fillRect((w * k) / 9 - 2, 0, 4, h); });
  const railM = extTag(M.paint({ map: railT, roughness: 0.4, side: THREE.DoubleSide })); railM.alphaTest = 0.5;
  const clothShapes = [ // flat garments for the other bays' racks (far away: no thickness)
    (() => { const s = new THREE.Shape(); s.moveTo(-0.18, 0); s.lineTo(0.18, 0); s.lineTo(0.3, -0.17); s.lineTo(0.18, -0.2); s.lineTo(0.18, -0.62); s.lineTo(-0.18, -0.62); s.lineTo(-0.18, -0.2); s.lineTo(-0.3, -0.17); s.closePath(); return new THREE.ShapeGeometry(s); })(),
    (() => { const s = new THREE.Shape(); s.moveTo(-0.16, 0); s.lineTo(0.16, 0); s.lineTo(0.16, -0.5); s.lineTo(-0.16, -0.5); s.closePath(); return new THREE.ShapeGeometry(s); })(),
  ];
  const clothM = ["#f2f2ee", "#e46a6a", "#6aa0e4", "#f2cf5a", "#7fcfb4", "#3d4458"].map((c) => extTag(M.paint({ color: c, roughness: 0.9, side: THREE.DoubleSide })));
  /** one storey-bay of a block: wall pieces round the openings, a terracotta slab band, sills, window quads, AC units,
   *  Juliet railings + drying racks with laundry on French doors */
  const bay = (o: { bx: number; fy: number; z: number; nz: 1 | -1; win: Rect[]; door: Rect[]; G: Glow | null; R: () => number; ac: number; racks: number }) => {
    const { bx, fy, z, nz, R } = o, zb = z - nz * 0.2, zg = z - nz * 0.1, Z = (d: number) => z + nz * d;
    for (const [x0, y0, x1, y1] of cellPieces(-FP.bx / 2, -0.3, FP.bx / 2, FP.fy - 0.3, [...o.win, ...o.door])) {
      const band = y1 <= 1e-4, e = 0.006; // pieces overlap their neighbours by 6 mm: no hairline seams onto the hollow block
      extBox(band ? bandM : facadeM, bx + x0 - e, fy + y0 - e, band ? Z(0.03) : z, bx + x1 + e, fy + y1 + e, zb);
    }
    for (const [x0, y0, x1, y1] of o.win) {
      if (o.G) glowQuad(o.G, bx + x0, fy + y0, bx + x1, fy + y1, zg, nz, R);
      boxAt(ext, trimM, bx + x0 - 0.04, fy + y0 - 0.05, Z(-0.02), bx + x1 + 0.04, fy + y0, Z(0.07));
      if (R() < o.ac) { // outdoor AC unit on brackets under the window
        const ux = bx + (x0 + x1) / 2 + (R() - 0.5) * 0.3, uy = fy + y0 - 0.78;
        boxAt(ext, xpl("#ecebe6", 0.5), ux - 0.4, uy, Z(0.04), ux + 0.4, uy + 0.55, Z(0.44));
        put(ext, CY(0.18, 0.18, 0.01, 18), xpl("#3a3e46", 0.6), ux - 0.08, uy + 0.275, Z(0.445), 0, Math.PI / 2);
        for (const dx of [-0.3, 0.3]) boxAt(ext, extGreyM, ux + dx - 0.02, uy - 0.04, z, ux + dx + 0.02, uy, Z(0.46));
      }
    }
    for (const [x0, y0, x1, y1] of o.door) {
      if (o.G) glowQuad(o.G, bx + x0, fy + y0, bx + x1, fy + y1, zg, nz, R);
      const rl = put(ext, new THREE.PlaneGeometry(x1 - x0 + 0.08, 1.08), railM, bx + (x0 + x1) / 2, fy + 0.54, Z(0.16), nz > 0 ? 0 : Math.PI, 0, 0, false);
      rl.userData.uv01 = true;
      if (R() < o.racks) { // drying rack + laundry
        const ry = fy + 2.36, xa = bx + x0 - 0.03, xb = bx + x1 + 0.03;
        for (const x of [xa, xb]) rod(ext, extAlu, V(x, ry - 0.06, z), V(x, ry, Z(0.78)), 0.012, 6);
        for (const d of [0.4, 0.76]) rod(ext, extAlu, V(xa - 0.08, ry + d * 0.07, Z(d)), V(xb + 0.08, ry + d * 0.07, Z(d)), 0.009, 6);
        const n = 1 + Math.floor(R() * 3);
        for (let k = 0; k < n; k++) {
          const c = put(ext, clothShapes[Math.floor(R() * 2)], clothM[Math.floor(R() * clothM.length)], xa + 0.2 + R() * (xb - xa - 0.4), ry - 0.02, Z(R() < 0.5 ? 0.4 : 0.76), (R() - 0.5) * 0.5, 0, 0, false);
          c.userData.uv01 = true;
        }
      }
    }
  };
  const block = (o: { xs: number[]; ys: number[]; z: number; nz: 1 | -1; depth: number; win: Rect[]; door: Rect[]; skip: (bx: number, fy: number) => boolean; seed: number; ac: number; racks: number; roofY: number }) => {
    const G = mkGlow(), R = rng(o.seed);
    for (const bx of o.xs) for (const fy of o.ys) { if (o.skip(bx, fy)) continue; bay({ bx, fy, z: o.z, nz: o.nz, win: o.win, door: o.door, G, R, ac: o.ac, racks: o.racks }); }
    const xl = Math.min(...o.xs) - FP.bx / 2, xr = Math.max(...o.xs) + FP.bx / 2, zb = o.z - o.nz * o.depth, y0 = Math.min(...o.ys) - 0.3;
    // plinth, end walls, roof slab, parapet with a coping, a water tank and a stair head on the roof
    boxAt(ext, extGreyM, xl - 0.2, GROUND, o.z + o.nz * 0.05, xr + 0.2, y0, zb);
    for (const x of [xl - 0.2, xr]) extBox(facadeM, x, y0, o.z, x + 0.2, o.roofY, zb);
    extBox(roofM, xl - 0.2, o.roofY - 0.3, o.z, xr + 0.2, o.roofY, zb);
    extBox(bandM, xl - 0.2, o.roofY - 0.3, o.z + o.nz * 0.04, xr + 0.2, o.roofY, o.z);
    extBox(facadeM, xl - 0.2, o.roofY, o.z, xr + 0.2, o.roofY + 0.9, o.z - o.nz * 0.2);
    boxAt(ext, trimM, xl - 0.24, o.roofY + 0.9, o.z + o.nz * 0.04, xr + 0.24, o.roofY + 0.96, o.z - o.nz * 0.24);
    for (const x of [xl - 0.2, xr]) extBox(facadeM, x, o.roofY, o.z, x + 0.2, o.roofY + 0.9, zb);
    const sx = (xl + xr) / 2 + 3.5;
    extBox(facadeM, sx - 2, o.roofY, o.z - o.nz * 4, sx + 2, o.roofY + 2.8, o.z - o.nz * 8);
    boxAt(ext, trimM, sx - 2.1, o.roofY + 2.8, o.z - o.nz * 3.9, sx + 2.1, o.roofY + 2.95, o.z - o.nz * 8.1);
    put(ext, CY(0.9, 0.9, 1.6, 20), xpl("#d9dde0", 0.45), xl + 6, o.roofY + 1.7, o.z - o.nz * 6);
    for (const dx of [-0.6, 0.6]) boxAt(ext, extGreyM, xl + 6 + dx - 0.08, o.roofY, o.z - o.nz * 6.7, xl + 6 + dx + 0.08, o.roofY + 0.9, o.z - o.nz * 5.3);
    return G;
  };
  // our block: 9 bays x 6 storeys (our room = bay 0 on storey 0), window + French door per room
  const ourWin: Rect[] = [[WIN.x0, WIN.y0, WIN.x1, WIN.y1]], ourDoor: Rect[] = [[BDOOR.x0, 0, BDOOR.x1, BDOOR.y1]];
  const ourXs = [-4, -3, -2, -1, 0, 1, 2, 3, 4].map((k) => k * FP.bx), ourYs = [-3, -2, -1, 0, 1, 2].map((k) => k * FP.fy);
  const glowOurs = block({ xs: ourXs, ys: ourYs, z: ZF, nz: -1, depth: 14, win: ourWin, door: ourDoor, skip: (bx, fy) => Math.abs(bx) < 0.1 && Math.abs(fy) < 0.1, seed: 901, ac: 0.75, racks: 0.55, roofY: 2 * FP.fy + 3.0 });
  // our own bay: the real wall face covers x +-1.8, y 0..3; add the party-wall piers and the slab band
  for (const s of [-1, 1]) extBox(facadeM, s * 1.8 - (s < 0 ? 0.1 : 0), -0.3, ZF, s * 1.8 + (s > 0 ? 0.1 : 0), 3.0, ZF + 0.2);
  extBox(bandM, -1.8, -0.3, ZF - 0.03, 1.8, 0.0, ZF + 0.2);
  // the block across the yard: 5 bays x 3 storeys, one window per room (its back side: no French doors), built in its
  // own frame (everything added to ext from here to the end of the friend's bay moves into the turned group extO)
  const nO = ext.children.length;
  const oWin: Rect[] = [[-0.75, 0.95, 0.75, 2.35]];
  const oXs = [-2, -1, 0, 1, 2].map((k) => FX + k * FP.bx), oYs = [-3, -2, -1].map((k) => k * FP.fy);
  const glowOther = block({ xs: oXs, ys: oYs, z: ZO, nz: 1, depth: 14, win: oWin, door: [], skip: (bx, fy) => Math.abs(bx - FX) < 0.1 && Math.abs(fy - FFY) < 0.1, seed: 902, ac: 0.6, racks: 0, roofY: -FP.fy + 3.0 });
  void glowOurs;
  // the friend's bay: real window (outer frame, fixed left sash, the right sash slid open), a lit room, a silhouette
  const friendMats: { m: THREE.MeshBasicMaterial; on: THREE.Color }[] = [];
  // side walls get polygonOffset (pushed back by their depth slope): seen nearly edge-on behind the 0.2 m facade from
  // our window their rasterised depth is unstable and leaked through as a 1-px bright line. Not on the ceiling: pushed
  // back it fell behind the block's roof slab
  const fRoomM = (on: THREE.ColorRepresentation, map?: THREE.Texture, offset = false) => { const m = basic(0x000000, { ...(map ? { map } : {}), ...(offset ? { polygonOffset: true, polygonOffsetFactor: 4, polygonOffsetUnits: 4 } : {}) }); friendMats.push({ m, on: new THREE.Color(on) }); return m; };
  const silM = new THREE.MeshBasicMaterial({ map: silhouetteTex(), transparent: true, alphaTest: 0.35 });
  const friendFig = new THREE.Mesh(new THREE.PlaneGeometry(SIL.w, SIL.h), silM); friendFig.name = "friendSilhouette";
  const FW = { x0: FX - 0.75, x1: FX + 0.75, y0: FFY + 0.95, y1: FFY + 2.35 };
  const fAp = { x0: FX + 0.04, x1: FX + 0.71, y0: FW.y0 + 0.05, y1: FW.y1 - 0.05, z: ZO - 0.1 };
  // the silhouette stands behind the fixed left sash, its rope arm reaching into the open right half (the rope comes in
  // obliquely from our window, ~36 deg off the block's normal, and must cross the aperture, not the sash frame)
  const SILX = FX - 0.3, SILZ = ZO - 0.45; // head clear of the meeting stiles from our window and the friend cam
  const friendHandL = V(SILX + (SIL.hand[0] - 0.5) * SIL.w, FFY + SIL.hand[1] * SIL.h, SILZ);
  {
    const R = rng(903);
    bay({ bx: FX, fy: FFY, z: ZO, nz: 1, win: oWin, door: [], G: null, R, ac: 0, racks: 0 });
    const g = new THREE.Group(); g.name = "friendRoom"; ext.add(g);
    const fz = ZO - 0.1, fr = (x0: number, y0: number, x1: number, y1: number, z: number, t: number) => {
      boxAt(g, trimM, x0, y0, z - 0.03, x1, y0 + t, z + 0.03); boxAt(g, trimM, x0, y1 - t, z - 0.03, x1, y1, z + 0.03);
      boxAt(g, trimM, x0, y0, z - 0.03, x0 + t, y1, z + 0.03); boxAt(g, trimM, x1 - t, y0, z - 0.03, x1, y1, z + 0.03);
    };
    fr(FW.x0, FW.y0, FW.x1, FW.y1, fz, 0.05);
    fr(FW.x0 + 0.05, FW.y0 + 0.05, FX + 0.04, FW.y1 - 0.05, fz - 0.03, 0.04);
    fr(FW.x0 + 0.08, FW.y0 + 0.05, FX + 0.0, FW.y1 - 0.05, fz + 0.03, 0.04);         // the right sash, slid fully left
    for (const [x0, z] of [[FW.x0 + 0.09, fz - 0.03], [FW.x0 + 0.12, fz + 0.03]] as const) {
      const p = new THREE.Mesh(new THREE.PlaneGeometry(FX - x0 - 0.05, FW.y1 - FW.y0 - 0.18), glassM);
      p.position.set((x0 + FX - 0.05) / 2, (FW.y0 + FW.y1) / 2, z); p.userData.uv01 = true; p.layers.set(NOINK); p.renderOrder = 2; g.add(p); keep.add(p);
    }
    // the room behind (lit planes, MeshBasic: setFriend scales them), 3.4 x 3 m, 2.65 m tall
    const rz0 = ZO - 0.2, rz1 = ZO - 3.2, rx0 = FX - 1.7, rx1 = FX + 1.7, ry0 = FFY, ry1 = FFY + 2.65; // under the roof slab (FFY + 2.7)
    const back = new THREE.Mesh(new THREE.PlaneGeometry(rx1 - rx0, ry1 - ry0), fRoomM("#ffffff", friendRoomTex())); back.position.set(FX, (ry0 + ry1) / 2, rz1); g.add(back);
    for (const s of [-1, 1]) { const w = new THREE.Mesh(new THREE.PlaneGeometry(rz0 - rz1, ry1 - ry0), fRoomM(s < 0 ? "#e9c38f" : "#dcb27e", undefined, true)); w.rotation.y = s < 0 ? Math.PI / 2 : -Math.PI / 2; w.position.set(s < 0 ? rx0 : rx1, (ry0 + ry1) / 2, (rz0 + rz1) / 2); g.add(w); }
    const ce = new THREE.Mesh(new THREE.PlaneGeometry(rx1 - rx0, rz0 - rz1), fRoomM("#f6e2bf")); ce.rotation.x = Math.PI / 2; ce.position.set(FX, ry1, (rz0 + rz1) / 2); g.add(ce);
    const fl = new THREE.Mesh(new THREE.PlaneGeometry(rx1 - rx0, rz0 - rz1), fRoomM("#a8784e")); fl.rotation.x = -Math.PI / 2; fl.position.set(FX, ry0, (rz0 + rz1) / 2); g.add(fl);
    const lampD = new THREE.Mesh(new THREE.CircleGeometry(0.22, 20), fRoomM(new THREE.Color(2.2, 2.0, 1.6))); lampD.rotation.x = Math.PI / 2; lampD.position.set(FX, ry1 - 0.01, rz0 - 1.2); g.add(lampD);
    const curtain = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 1.55), fRoomM("#f0a868")); curtain.position.set(FW.x0 + 0.12, (FW.y0 + FW.y1) / 2 + 0.05, rz0 - 0.08); g.add(curtain);
    for (const o of g.children) { if ((o as THREE.Mesh).isMesh && friendMats.some((f) => f.m === (o as THREE.Mesh).material)) { o.userData.uv01 = true; keep.add(o); (o as THREE.Mesh).castShadow = false; } }
    friendFig.position.set(SILX, FFY + SIL.h / 2, SILZ); friendFig.userData.uv01 = true; g.add(friendFig); keep.add(friendFig);
    void R;
    // its apron, kerb and hedge row (in the block's frame, so they turn with it)
    const xl = Math.min(...oXs) - FP.bx / 2, xr = Math.max(...oXs) + FP.bx / 2;
    boxAt(ext, pavingM, xl - 2, GROUND, ZO, xr + 2, GROUND + 0.04, ZO + 1.8);
    boxAt(ext, trimM, xl - 2, GROUND, ZO + 1.79, xr + 2, GROUND + 0.12, ZO + 1.91);
    for (let x = xl + 0.4; x < xr - 3.4; x += 4.2) if (Math.abs(x + 1.7 - FX) > 2.4) put(ext, lumpy(3.4, 0.8, 0.65, Math.round(x * 10 + 7), 0.18, [8, 2, 3], 0.2), leaf2M, x + 1.7, GROUND + 0.4, ZO + 2.28, 0, 0, 0, false);
  }
  const extO = new THREE.Group(); extO.name = "friendBlock"; extO.position.copy(FP0); extO.rotation.y = -FYAW;
  for (const c of ext.children.slice(nO)) { c.position.sub(FP0); extO.add(c); }
  ext.add(extO); glowOther.par = extO;
  const friendHand = fW(friendHandL);
  // a warm glow round the two hero windows (ours, the friend's), so at night both read from down the yard even at a
  // grazing angle: a wide soft halo + a tight bright core (additive sprites) and a warm spill on the facade round the
  // opening (an additive card flat on the wall). All on NOINK, driven by the lamps / battens / setFriend, and faded out
  // for cameras close to the window (inside the room, or the friend cam) so they never wash a near frame.
  const haloTex = poolTex();
  type Halo = { parts: { o: THREE.Object3D; m: THREE.Material & { opacity: number }; k: number; near: [number, number] }[]; base: number };
  const haloTmp = new THREE.Vector3();
  const haloTmp2 = new THREE.Vector3();
  const mkHalo = (x: number, y: number, z: number, nz: number, w: number, h: number, par: THREE.Object3D = ext): Halo => {
    const H: Halo = { parts: [], base: 0 };
    // the window centre in world space (fade distance; the sprites' anchor)
    const anchorW = par === ext ? V(x, y, z + nz * 0.05) : fW(V(x, y, z + nz * 0.05));
    const add = (o: THREE.Object3D, m: THREE.Material & { opacity: number }, k: number, near: [number, number], push = 0) => {
      if (par !== ext) o.position.sub(FP0); // positions are given in the block's frame
      o.layers.set(NOINK); o.visible = false; o.userData.uv01 = true; par.add(o); keep.add(o); H.parts.push({ o, m, k, near });
      o.onBeforeRender = (_r, _s, cam) => {
        const c = cam.getWorldPosition(haloTmp), d = c.distanceTo(anchorW);
        m.opacity = H.base * k * sstep(near[0], near[1], d);
        if (push > 0) { // sprites slide toward the camera along its ray to the window: centred on the window from any angle,
          // never cut by the facade plane they would otherwise cross when seen obliquely
          haloTmp2.copy(c).sub(anchorW).multiplyScalar(Math.min(push, d * 0.5) / Math.max(d, 1e-3)).add(anchorW);
          o.position.copy(par.worldToLocal(haloTmp2)); o.updateMatrixWorld();
        }
      };
    };
    const sprite = (sx: number, sy: number, col: THREE.Color, k: number, near: [number, number]) => {
      const m = new THREE.SpriteMaterial({ map: haloTex, color: col, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, opacity: 0 });
      const s = new THREE.Sprite(m); s.position.set(x, y, z + nz * 0.5); s.scale.set(sx, sy, 1); s.renderOrder = 3; add(s, m, k, near, 0.5 * Math.max(sx, sy) + 0.3);
    };
    sprite(7.0, 5.6, new THREE.Color("#ff9c4a"), 0.75, [6, 12]);            // wide soft halo
    sprite(w * 1.6, h * 1.35, new THREE.Color("#ffd29a"), 0.9, [6, 12]);    // bright core over the opening
    const sm = new THREE.MeshBasicMaterial({ map: haloTex, color: new THREE.Color("#ffae62"), blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, opacity: 0 }); // front side only (outward): never seen from inside through the French door
    const sp = new THREE.Mesh(new THREE.PlaneGeometry(w * 2.4, h * 2.2), sm); sp.position.set(x, y - h * 0.15, z + nz * 0.03); if (nz < 0) sp.rotation.y = Math.PI; sp.renderOrder = 2;
    add(sp, sm, 0.55, [3, 6]);                                                       // warm spill on the wall round the window
    return H;
  };
  const setHalo = (H: Halo, v: number) => { H.base = v; for (const p of H.parts) p.o.visible = v > 0.01; };
  const haloOurs = mkHalo((WIN.x0 + WIN.x1) / 2, (WIN.y0 + WIN.y1) / 2, ZF, -1, WIN.x1 - WIN.x0, WIN.y1 - WIN.y0);
  const haloFriend = mkHalo(FX, FFY + 1.65, ZO, 1, 1.5, 1.4, extO);
  // the glow quads -> one mesh per block (vertex colours rewritten by setTime)
  const glowMat = new THREE.MeshBasicMaterial({ map: windowAtlasTex(), vertexColors: true });
  for (const G of glows) {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(G.pos, 3)); geo.setAttribute("uv", new THREE.Float32BufferAttribute(G.uv, 2));
    geo.setAttribute("color", new THREE.Float32BufferAttribute(G.col, 3)); geo.setIndex(G.idx); geo.computeVertexNormals(); G.geo = geo;
    const m = new THREE.Mesh(geo, glowMat); m.name = "facadeWindows"; m.userData.uv01 = true; keep.add(m);
    if (G.par) { m.position.copy(FP0).negate(); G.par.add(m); } else ext.add(m); // quads were laid out in the block's frame
  }
  // the yard: lawn, paving (a walk down the middle, aprons along both blocks), kerbs, trees, lamp posts, hedges, benches
  const streetMats: { head: THREE.MeshBasicMaterial; pool: THREE.MeshBasicMaterial } = {
    head: basic(new THREE.Color(2.6, 2.1, 1.4)),
    pool: new THREE.MeshBasicMaterial({ map: poolTex(), color: new THREE.Color(0.55, 0.42, 0.26), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }),
  };
  {
    const R = rng(904);
    const gp = new THREE.PlaneGeometry(220, 220); gp.rotateX(-Math.PI / 2); put(ext, gp, lawnM, 0, GROUND, -12, 0, 0, 0, false);
    boxAt(ext, pavingM, -110, GROUND, -13.6, 110, GROUND + 0.04, -11.0);
    boxAt(ext, pavingM, -110, GROUND, ZF - 1.8, 110, GROUND + 0.04, ZF);
    for (const z of [-13.65, -10.95, ZF - 1.85]) boxAt(ext, trimM, -110, GROUND, z - 0.06, 110, GROUND + 0.12, z + 0.06);
    const tree = (x: number, z: number, s: number) => {
      put(ext, CY(0.12 * s, 0.17 * s, 2.6 * s, 8), barkM, x, GROUND + 1.3 * s, z, 0, 0, 0, false);
      for (let k = 0; k < 4; k++) {
        const c = put(ext, new THREE.IcosahedronGeometry((1.15 + 0.5 * R()) * s, 1), k % 2 ? leafM : leaf2M, x + (R() - 0.5) * 1.4 * s, GROUND + (2.9 + 1.1 * R() + (k === 3 ? 0.9 : 0)) * s, z + (R() - 0.5) * 1.4 * s, R() * 6, 0, 0, false);
        c.scale.set(1, 0.85, 1);
      }
    };
    for (const [x, z, s] of [[-14, -7.6, 1], [-7.5, -7.9, 0.9], [6.5, -7.4, 1.05], [13.5, -7.8, 0.95], [11.5, -16.6, 0.95], [24, -15.6, 1.1], [-25, -8.6, 1.0]] as const) tree(x, z, s);
    // trees in front of the turned block (laid out in its frame, clear of its apron and of the sight line between the windows)
    for (const [lx, lz, s] of [[-6.2, 4.6, 1.0], [5.4, 4.4, 0.92], [-13.5, 3.8, 1.05]] as const) { const w = fW(V(FX + lx, 0, ZO + lz)); tree(w.x, w.z, s); }
    for (const x of [-13, -4.5, 4.5, 13]) { // lamp posts along the walk, with an additive light pool
      const z = -10.75;
      put(ext, CY(0.05, 0.07, 4.0, 8), extDarkM, x, GROUND + 2.0, z, 0, 0, 0, false);
      boxAt(ext, extDarkM, x - 0.03, GROUND + 3.95, z - 0.03, x + 0.45, GROUND + 4.0, z + 0.03);
      boxAt(ext, extDarkM, x + 0.3, GROUND + 3.85, z - 0.12, x + 0.62, GROUND + 3.97, z + 0.12, 0.02);
      const hd = put(ext, BX(0.28, 0.02, 0.2), streetMats.head, x + 0.46, GROUND + 3.84, z, 0, 0, 0, false); keep.add(hd);
      const pool = new THREE.Mesh(new THREE.PlaneGeometry(6, 6), streetMats.pool); pool.rotation.x = -Math.PI / 2; pool.position.set(x + 0.46, GROUND + 0.05, z - 0.8);
      pool.userData.uv01 = true; pool.layers.set(NOINK); pool.renderOrder = 1; ext.add(pool); keep.add(pool);
    }
    for (const [z0, z1] of [[ZF - 2.6, ZF - 1.95]]) for (let x = -16; x < 16; x += 4.2) {
      if (Math.abs(x + 1) < 2.5 && z0 > -10) continue; // a gap in front of our block's entrance path
      const hgt = put(ext, lumpy(3.4, 0.8, z1 - z0, Math.round(x * 10 + z0), 0.18, [8, 2, 3], 0.2), leaf2M, x + 1.7, GROUND + 0.4, (z0 + z1) / 2, 0, 0, 0, false); void hgt;
    }
    for (const x of [-9, 9]) { boxAt(ext, xpl("#8a5a3a", 0.7), x - 0.9, GROUND + 0.42, -14.2, x + 0.9, GROUND + 0.47, -13.8); for (const dx of [-0.75, 0.75]) boxAt(ext, extDarkM, x + dx - 0.04, GROUND, -14.15, x + dx + 0.04, GROUND + 0.42, -13.85); }
  }
  // far blocks round the campus: pale boxes plus an additive lit-window overlay on the face toward us
  const farWinM = new THREE.MeshBasicMaterial({ map: farWindowsTex(), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, color: new THREE.Color(1, 1, 1) });
  {
    const farM = extTag(M.paint({ map: farFacadeTex(), roughness: 0.85 }));
    for (const [x, z, w, h, d] of [[-30, -62, 34, 24, 14], [8, -70, 30, 30, 14], [40, -60, 26, 20, 14], [-62, -30, 14, 22, 30], [60, -28, 14, 26, 30]] as const) {
      const b = put(ext, new THREE.BoxGeometry(w, h, d), farM, x, GROUND + h / 2, z, 0, 0, 0, false); b.userData.uv01 = true;
      const side = Math.abs(x) > 50, ov = new THREE.Mesh(new THREE.PlaneGeometry(side ? d : w, h * 0.92), farWinM);
      if (side) { ov.rotation.y = x < 0 ? Math.PI / 2 : -Math.PI / 2; ov.position.set(x + (x < 0 ? w / 2 + 0.05 : -w / 2 - 0.05), GROUND + h / 2, z); }
      else ov.position.set(x, GROUND + h / 2, z + d / 2 + 0.05);
      ov.userData.uv01 = true; ov.layers.set(NOINK); ext.add(ov); keep.add(ov);
    }
  }
  // the sky: a vertex-coloured dome (gradient + sun glow rewritten per hour), stars, cloud cards, the sun's disc
  const SKY_C = new THREE.Vector3(0, 0, -12), SKY_R = 140;
  const skyGeo = new THREE.SphereGeometry(SKY_R, 64, 32); skyGeo.setAttribute("color", new THREE.Float32BufferAttribute(new Float32Array(skyGeo.attributes.position.count * 3), 3));
  const sky = new THREE.Mesh(skyGeo, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: false, depthWrite: false }));
  sky.name = "sky"; sky.position.copy(SKY_C); sky.renderOrder = -10; sky.userData.uv01 = true; sky.userData.noInk = true; sky.layers.set(NOINK); sky.castShadow = false; sky.receiveShadow = false; root.add(sky); keep.add(sky);
  const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 2.2, sizeAttenuation: false, transparent: true, opacity: 0, depthWrite: false, fog: false });
  {
    const R = rng(905), sp: number[] = [];
    for (let k = 0; k < 420; k++) { const az = R() * 6.283, el = Math.asin(0.08 + 0.92 * R()), r = SKY_R * 0.97; sp.push(Math.cos(el) * Math.cos(az) * r, Math.sin(el) * r, Math.cos(el) * Math.sin(az) * r); }
    const sg = new THREE.BufferGeometry(); sg.setAttribute("position", new THREE.Float32BufferAttribute(sp, 3));
    const stars = new THREE.Points(sg, starMat); stars.name = "stars"; stars.position.copy(SKY_C); stars.layers.set(NOINK); stars.userData.noInk = true; root.add(stars); keep.add(stars);
  }
  const cloudMat = new THREE.MeshBasicMaterial({ map: cloudTex(), transparent: true, depthWrite: false, fog: false, color: new THREE.Color(1, 1, 1) });
  {
    const R = rng(906);
    for (let k = 0; k < 9; k++) {
      const az = -Math.PI / 2 + (R() - 0.5) * 2.4, el = 0.06 + 0.22 * R(), r = SKY_R * 0.9;
      const c = new THREE.Mesh(new THREE.PlaneGeometry(40 + 40 * R(), 9 + 6 * R()), cloudMat);
      c.position.set(SKY_C.x + Math.cos(el) * Math.cos(az) * r, SKY_C.y + Math.sin(el) * r, SKY_C.z + Math.cos(el) * Math.sin(az) * r); c.lookAt(SKY_C);
      c.userData.uv01 = true; c.userData.noInk = true; c.layers.set(NOINK); c.renderOrder = -9; root.add(c); keep.add(c);
    }
  }
  const sunDisc = new THREE.Mesh(new THREE.CircleGeometry(3.2, 24), new THREE.MeshBasicMaterial({ color: new THREE.Color(4, 3.4, 2.4), fog: false, transparent: true, depthWrite: false }));
  sunDisc.name = "sunDisc"; sunDisc.userData.uv01 = true; sunDisc.layers.set(NOINK); sunDisc.renderOrder = -8; root.add(sunDisc); keep.add(sunDisc);
  if (opts.exterior === false) ext.visible = false;

  // ---------------- lights: window fill, the sun (key / sun patch / night sky light) ----------------
  const win = new THREE.DirectionalLight("#a3b0ff", 0.45);
  win.position.set(0.9, 5.2, -11); win.target.position.set(0, 0.3, -0.5);
  win.castShadow = false;
  root.add(win, win.target); lights.unshift(win);
  let sun: THREE.DirectionalLight | null = null;
  const SUN_T = V(0, 1.3, -0.4);
  if (opts.sun ?? true) {
    sun = new THREE.DirectionalLight("#fff1dc", 0); sun.name = "sun";
    sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.radius = 3; sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.025;
    Object.assign(sun.shadow.camera, { left: -4.4, right: 4.4, top: 4.4, bottom: -4.4, near: 6, far: 26 }); sun.shadow.camera.updateProjectionMatrix();
    sun.target.position.copy(SUN_T); root.add(sun, sun.target); lights.push(sun);
  }
  // practicals that follow the light state
  const namedLights = (n: string) => lights.filter((l) => l.name === n) as THREE.PointLight[];
  for (const l of lights) if ((l as THREE.Light).isLight) l.userData.base ??= (l as THREE.Light).intensity;

  // ---------------- light states ----------------
  const probe = M.paint({}) as THREE.MeshPhysicalMaterial; const ENV_A = probe.envMap; probe.dispose();
  const rd = opts.renderer;
  const ENV_DAY = rd ? makeEnv(rd, DORM_FILL_DAY) : ENV_A, ENV_NIGHT = rd ? makeEnv(rd, DORM_FILL_NIGHT) : ENV_A, ENV_SKY = rd ? makeEnv(rd, DORM_SKY) : ENV_A;
  const rigIn: EnvRig = { tint: { value: new THREE.Color(1, 1, 1) }, mix: { value: 0 }, a: { value: ENV_A }, b: { value: ENV_A }, direct: { value: 1 } };
  const rigEx: EnvRig = { tint: { value: new THREE.Color(0.2, 0.2, 0.38) }, mix: { value: 0 }, a: { value: ENV_SKY }, b: { value: ENV_SKY }, direct: { value: 1 } };
  const C3 = (h: string, k = 1) => lin(h).map((v) => v * k);
  // keyframes over u (the time-lapse): sky horizon / band (~12 deg) / zenith, sun-side glow (rgb x strength), interior
  // tint, exterior tint, sun colour x intensity, window fill colour x intensity, stars, facade lit fraction, clouds,
  // practicals (fairy lights, screens), street lamps, darkness of unlit glass (0 day .. 1 night), env mix day -> night
  type Key = { hor: number[]; mid: number[]; zen: number[]; glow: number[]; inT: number[]; exT: number[]; sun: number[]; win: number[]; stars: number; lit: number; cloud: number[]; prac: number; street: number; dark: number; mix: number };
  const KEYS: [number, Key][] = [
    [0.0, { hor: C3("#d6bfc6"), mid: C3("#6d7db6"), zen: C3("#1f2c5c"), glow: C3("#ffc9a0", 0.7), inT: [0.46, 0.54, 0.78], exT: [0.3, 0.36, 0.56], sun: C3("#c4d2ff", 0.95), win: C3("#b9c8ff", 0.45), stars: 0.3, lit: 0.12, cloud: C3("#b9a3bd", 0.8), prac: 0, street: 0.7, dark: 0.55, mix: 0 }],
    [0.06, { hor: C3("#e9c8bf"), mid: C3("#7f8fc4"), zen: C3("#2b4182"), glow: C3("#ffc095", 1.0), inT: [0.56, 0.6, 0.78], exT: [0.4, 0.44, 0.6], sun: C3("#d6dcff", 0.9), win: C3("#c4d0ff", 0.45), stars: 0.06, lit: 0.08, cloud: C3("#e7c2bf", 0.9), prac: 0, street: 0.25, dark: 0.4, mix: 0 }],
    [0.12, { hor: C3("#f6d2a8"), mid: C3("#93b4de"), zen: C3("#3f63a8"), glow: C3("#ffb36b", 1.5), inT: [0.76, 0.7, 0.72], exT: [0.6, 0.56, 0.58], sun: C3("#ffb978", 1.7), win: C3("#d0d8ff", 0.35), stars: 0, lit: 0.0, cloud: C3("#ffd2b0"), prac: 0, street: 0, dark: 0.15, mix: 0 }],
    [0.3, { hor: C3("#c2def2"), mid: C3("#86bdea"), zen: C3("#3d7fd0"), glow: C3("#fff0d8", 0.5), inT: [1.0, 0.98, 0.95], exT: [0.92, 0.95, 1.02], sun: C3("#fff0dc", 2.6), win: C3("#dfe8ff", 0.3), stars: 0, lit: 0, cloud: C3("#ffffff"), prac: 0, street: 0, dark: 0, mix: 0 }],
    [0.5, { hor: C3("#c8e2f4"), mid: C3("#88c0ec"), zen: C3("#3a7bd0"), glow: C3("#ffffff", 0.4), inT: [1.06, 1.04, 1.0], exT: [1.0, 1.02, 1.05], sun: C3("#fff4e6", 2.9), win: C3("#e6eeff", 0.3), stars: 0, lit: 0, cloud: C3("#ffffff"), prac: 0, street: 0, dark: 0, mix: 0 }],
    [0.7, { hor: C3("#e2dcd6"), mid: C3("#8cb8e0"), zen: C3("#3f78c4"), glow: C3("#ffd29a", 0.8), inT: [1.04, 0.95, 0.84], exT: [0.95, 0.9, 0.86], sun: C3("#ffd9a8", 2.5), win: C3("#e6eaff", 0.3), stars: 0, lit: 0, cloud: C3("#fff6ea"), prac: 0, street: 0, dark: 0, mix: 0 }],
    [0.8, { hor: C3("#ffb27a"), mid: C3("#b09ac8"), zen: C3("#3a5fa6"), glow: C3("#ff8a3d", 1.8), inT: [0.98, 0.7, 0.52], exT: [0.8, 0.6, 0.5], sun: C3("#ff9248", 2.6), win: C3("#c8c4ff", 0.3), stars: 0, lit: 0.02, cloud: C3("#ffb08a"), prac: 0, street: 0, dark: 0.1, mix: 0 }],
    [0.86, { hor: C3("#d68e9c"), mid: C3("#5a5aa6"), zen: C3("#283a7c"), glow: C3("#ff8a62", 0.9), inT: [0.52, 0.46, 0.58], exT: [0.32, 0.3, 0.45], sun: C3("#a3b0ff", 0.15), win: C3("#a3b0ff", 0.35), stars: 0.12, lit: 0.14, cloud: C3("#9a7aa8", 0.8), prac: 0.2, street: 0.6, dark: 0.6, mix: 0.15 }],
    [0.92, { hor: C3("#5a4f92"), mid: C3("#2a2f72"), zen: C3("#161d50"), glow: C3("#a06a90", 0.35), inT: [0.8, 0.8, 0.88], exT: [0.14, 0.15, 0.27], sun: C3("#a3b0ff", 0.45), win: C3("#9aa4ff", 0.35), stars: 0.6, lit: 0.3, cloud: C3("#3e3f74", 0.8), prac: 0.8, street: 1, dark: 0.9, mix: 0.62 }],
    [0.97, { hor: C3("#262f60"), mid: C3("#151c48"), zen: C3("#0b1131"), glow: C3("#2e3a70", 0.2), inT: [1, 1, 1], exT: [0.08, 0.09, 0.17], sun: C3("#a3b0ff", 0.55), win: C3("#8c98ff", 0.35), stars: 1, lit: 0.2, cloud: C3("#262c58", 0.8), prac: 1, street: 1, dark: 1, mix: 1 }],
    [1.0, { hor: C3("#262f60"), mid: C3("#151c48"), zen: C3("#0b1131"), glow: C3("#2e3a70", 0.2), inT: [1, 1, 1], exT: [0.08, 0.09, 0.17], sun: C3("#a3b0ff", 0.55), win: C3("#8c98ff", 0.35), stars: 1, lit: 0.2, cloud: C3("#262c58", 0.8), prac: 1, street: 1, dark: 1, mix: 1 }],
  ];
  const EVENING: Key = { hor: C3("#7c74cc"), mid: C3("#4a46a8"), zen: C3("#1a1d54"), glow: C3("#f2a2b4", 0.3), inT: [1, 1, 1], exT: [0.4, 0.4, 0.62], sun: [0, 0, 0], win: C3("#a3b0ff", 0.45), stars: 0.3, lit: 0.42, cloud: C3("#8f6fb0", 0.9), prac: 1, street: 1, dark: 0.85, mix: 0 };
  const keyAt = (u: number): Key => {
    const pick = (f: (k: Key) => number[]) => keyed(KEYS.map(([t, k]) => [t, f(k)] as [number, number[]]), u);
    const sc = (f: (k: Key) => number) => keyed(KEYS.map(([t, k]) => [t, [f(k)]] as [number, number[]]), u)[0];
    return { hor: pick((k) => k.hor), mid: pick((k) => k.mid), zen: pick((k) => k.zen), glow: pick((k) => k.glow), inT: pick((k) => k.inT), exT: pick((k) => k.exT), sun: pick((k) => k.sun), win: pick((k) => k.win), stars: sc((k) => k.stars), lit: sc((k) => k.lit), cloud: pick((k) => k.cloud), prac: sc((k) => k.prac), street: sc((k) => k.street), dark: sc((k) => k.dark), mix: sc((k) => k.mix) };
  };
  /** direction toward the sun (or the cool sky key before sunrise / after sunset) */
  const sunDirAt = (u: number) => {
    const dir = (azDeg: number, elDeg: number) => { const a = THREE.MathUtils.degToRad(azDeg), e = THREE.MathUtils.degToRad(elDeg); return V(Math.sin(a) * Math.cos(e), Math.sin(e), -Math.cos(a) * Math.cos(e)); };
    // the window faces roughly west-south-west: the sun rises behind the block (no direct sun at dawn), stands high to the
    // left of the window at noon and sets almost straight in front of it, so the sunset patch rakes deep into the room
    const s = (u - 0.1) / 0.72, real = dir(-105 + 115 * s, -2 + 46 * Math.pow(Math.max(0, Math.sin(Math.PI * Math.min(1, Math.max(0, s)))), 0.5));
    const dawnKey = dir(-18, 30), nightKey = dir(10, 26);
    if (u < 0.12) return dawnKey.lerp(real, sstep(0.06, 0.12, u)).normalize();
    if (u > 0.82) return real.lerp(nightKey, sstep(0.82, 0.88, u)).normalize();
    return real;
  };
  let practical = 1, lampK = [1, 1, 1, 1], friendLit = 0, friendShow = true;
  const skyCol = skyGeo.attributes.color as THREE.BufferAttribute, skyPos = skyGeo.attributes.position;
  const applyKey = (k: Key, sd: THREE.Vector3, sunUp: number) => {
    // sky dome
    const sxz = V(sd.x, 0, sd.z).normalize();
    for (let i = 0; i < skyPos.count; i++) {
      const x = skyPos.getX(i) / SKY_R, y = skyPos.getY(i) / SKY_R, z = skyPos.getZ(i) / SKY_R, el = Math.asin(Math.max(-1, Math.min(1, y)));
      const t1 = sstep(0, 0.21, el), t2 = sstep(0.21, 1.1, el);
      let r = lerp(lerp(k.hor[0], k.mid[0], t1), k.zen[0], t2), g = lerp(lerp(k.hor[1], k.mid[1], t1), k.zen[1], t2), b = lerp(lerp(k.hor[2], k.mid[2], t1), k.zen[2], t2);
      if (el < 0) { const d = sstep(0, -0.3, el); r = lerp(r, k.hor[0] * 0.45, d); g = lerp(g, k.hor[1] * 0.45, d); b = lerp(b, k.hor[2] * 0.5, d); }
      const hl = Math.hypot(x, z) || 1, az = Math.max(0, (x * sxz.x + z * sxz.z) / hl);
      const gl = Math.pow(az, 3) * Math.exp(-Math.pow(Math.max(0, el) / 0.32, 2)) + 0.6 * Math.pow(Math.max(0, x * sd.x + y * sd.y + z * sd.z), 24) * sunUp;
      skyCol.setXYZ(i, r + k.glow[0] * gl, g + k.glow[1] * gl, b + k.glow[2] * gl);
    }
    skyCol.needsUpdate = true;
    starMat.opacity = k.stars; starMat.visible = k.stars > 0.01;
    cloudMat.color.setRGB(k.cloud[0], k.cloud[1], k.cloud[2]); cloudMat.opacity = 0.85;
    // sun disc: visible near the horizon while the sun is up
    sunDisc.visible = sunUp > 0.01; sunDisc.position.copy(SKY_C).addScaledVector(sd, SKY_R * 0.85); sunDisc.lookAt(SKY_C);
    (sunDisc.material as THREE.MeshBasicMaterial).opacity = sunUp;
    // env rigs
    rigIn.tint.value.setRGB(k.inT[0], k.inT[1], k.inT[2]); rigEx.tint.value.setRGB(k.exT[0], k.exT[1], k.exT[2]);
    rigEx.direct.value = lerp(1, 0.22, sstep(0.3, 1, k.dark)); // the moon key / window fill barely touch the facades at night
    // window fill + sun
    win.color.setRGB(1, 1, 1); const wl = Math.max(k.win[0], k.win[1], k.win[2]) || 1; win.color.setRGB(k.win[0] / wl, k.win[1] / wl, k.win[2] / wl); win.intensity = wl;
    if (sun) {
      const sl = Math.max(k.sun[0], k.sun[1], k.sun[2]);
      sun.intensity = sl; if (sl > 0) sun.color.setRGB(k.sun[0] / sl, k.sun[1] / sl, k.sun[2] / sl);
      sun.position.copy(SUN_T).addScaledVector(sd, 16); sun.shadow.autoUpdate = sl > 0.001; sun.shadow.needsUpdate = false;
    }
    paintFacade(k, k.lit);
    streetMats.head.color.setRGB(lerp(0.75, 2.6, k.street), lerp(0.75, 2.1, k.street), lerp(0.72, 1.4, k.street));
    streetMats.pool.opacity = k.street; streetMats.pool.visible = k.street > 0.01;
    practical = k.prac; applyPracticals();
  };
  /** facade windows: lit (warm / cool screen light) below the lit fraction, else dark glass at night, sky glass by day */
  let lastKey: Key = EVENING;
  const paintFacade = (k: Key, litFrac: number) => {
    lastKey = k;
    const day = 1 - k.dark;
    for (const G of glows) {
      const c = G.geo!.attributes.color as THREE.BufferAttribute;
      for (const w of G.wins) {
        const lit = w.thr < litFrac;
        for (let q = 0; q < 4; q++) {
          const top = q >= 2 ? 1 : 0;
          let r: number, g: number, b: number;
          if (lit) { const e = w.k; if (w.warm) { r = 1.75 * e; g = 1.3 * e; b = 0.78 * e; } else { r = 0.75 * e; g = 0.95 * e; b = 1.35 * e; } }
          else { const s = top ? 0.6 : 0.4; r = lerp(0.045, k.hor[0] * s, day); g = lerp(0.055, k.hor[1] * s, day); b = lerp(0.09, k.hor[2] * s + 0.02, day); }
          c.setXYZ(w.v + q, r, g, b);
        }
      }
      c.needsUpdate = true;
    }
    const ff = Math.min(1, litFrac / 0.42); farWinM.color.setScalar(ff * ff * 0.85); // sparse far lights late at night / in the end shot
    updateHalos();
  };
  const setFacade = (litFrac: number) => paintFacade(lastKey, Math.max(0, Math.min(1, litFrac)));
  const fairyLights = namedLights("fairyGlow"), laptopGlow = namedLights("laptopGlow"), rgbGlow = namedLights("rgbStrip");
  const applyPracticals = () => {
    for (const l of [...fairyLights, ...laptopGlow, ...rgbGlow]) l.intensity = (l.userData.base as number) * practical;
    if (laptopScreen) (laptopScreen.material as THREE.MeshBasicMaterial).color.setScalar(lerp(0.035, 1.25, practical));
    if (monitorScreenM) monitorScreenM.color.setScalar(lerp(0.03, 0.95, practical));
    if (rgbStripM) rgbStripM.color.setRGB(lerp(0.2, 1.5, practical), lerp(0.18, 0.55, practical), lerp(0.22, 2.4, practical));
  };
  const setLamps = (k: number[]) => {
    lampK = [0, 1, 2, 3].map((i) => Math.max(0, Math.min(1, k[i] ?? 0)));
    lamps.forEach((sp, i) => { sp.intensity = (sp.userData.base as number) * lampK[i]; sp.shadow.autoUpdate = lampK[i] > 0.001; sp.shadow.needsUpdate = false; });
    lampBulbs.forEach((m, i) => m.color.copy(BULB_OFF).lerp(BULB_ON, lampK[i]));
    updateHalos();
  };
  let battenK = 1;
  const updateHalos = () => {
    const night = sstep(0.5, 0.95, lastKey.dark);
    const ours = Math.min(1, 0.16 * lampK.reduce((a, b) => a + b, 0) + 0.5 * battenK) * night * 0.85, fr = friendLit * night * 0.85;
    setHalo(haloOurs, ours); setHalo(haloFriend, fr);
  };
  const setBattens = (k: number) => {
    battenK = k;
    ceilingLights.forEach((sp) => { sp.intensity = (sp.userData.base as number) * k; sp.shadow.autoUpdate = k > 0.001; sp.shadow.needsUpdate = false; });
    battenTubes.forEach((t) => { t.material = k > 0.5 ? TUBE_ON : TUBE_OFF; });
    battenSpills.forEach((s) => { (s.material as THREE.MeshBasicMaterial).opacity = k; s.visible = k > 0.01; });
    updateHalos();
  };
  const setFriend = (o: { lit?: number; figure?: boolean }) => {
    if (o.lit !== undefined) friendLit = Math.max(0, Math.min(1, o.lit));
    if (o.figure !== undefined) friendShow = o.figure;
    for (const f of friendMats) f.m.color.copy(f.on).multiplyScalar(lerp(0.035, 1, friendLit));
    friendFig.visible = friendShow && friendLit > 0.01;
    updateHalos();
  };
  const setTime = (u: number, o: { lampAt?: number; roommates?: boolean; battens?: boolean } = {}) => {
    u = Math.max(0, Math.min(1, u));
    const k = keyAt(u), sd = sunDirAt(u), sunUp = sstep(0.09, 0.13, u) * (1 - sstep(0.8, 0.84, u)) * (1 - sstep(0.25, 0.4, u) + sstep(0.62, 0.76, u));
    rigIn.a.value = ENV_DAY; rigIn.b.value = ENV_NIGHT; rigIn.mix.value = k.mix;
    rigEx.a.value = ENV_SKY; rigEx.b.value = ENV_SKY; rigEx.mix.value = 0;
    applyKey(k, sd, sunUp);
    const la = o.lampAt ?? 0.93;
    setLamps([u >= la ? 1 : 0, ...[1, 2, 3].map((i) => (o.roommates && u >= la + 0.012 * i ? 1 : 0))]);
    setBattens(o.battens && u >= la + 0.05 ? 1 : 0);
    setFriend({ lit: sstep(0.87, 0.9, u) });
    corridorLight.intensity = corridorLight.userData.base as number; corrPanelM.color.setRGB(2.4, 2.45, 2.5);
  };
  const setLight = (s: DormLight) => {
    if (s === "dawn") { setTime(0.03); return; }
    if (s === "day") { setTime(0.5); return; }
    if (s === "night") { setTime(1); return; }
    // evening: the approved v1 look (battens + four lamps on the lights-on fill), a dusk sky, the window block lit
    rigIn.a.value = ENV_A; rigIn.b.value = ENV_A; rigIn.mix.value = 0;
    rigEx.a.value = ENV_SKY; rigEx.b.value = ENV_SKY; rigEx.mix.value = 0;
    applyKey(EVENING, sunDirAt(0.98), 0);
    if (sun) { sun.intensity = 0; sun.shadow.autoUpdate = false; }
    setLamps([1, 1, 1, 1]); setBattens(1); setFriend({ lit: 1 });
  };
  const setWindowOpen = (u: number) => { sashR.position.x = SASH.closedX - SASH.travel * Math.max(0, Math.min(1, u)); };
  const setDoorOpen = (u: number) => { doorLeaf.rotation.y = (Math.PI / 2) * Math.max(0, Math.min(1, u)); };
  const setFrenchDoorOpen = (u: number) => { fdLeaf.rotation.y = -(Math.PI / 2) * Math.max(0, Math.min(1, u)); };

  // ---------------- anchors + cameras ----------------
  root.updateMatrixWorld(true);
  const wp = (u: Unit, v: THREE.Vector3) => u.g.localToWorld(v.clone());
  const yawTo = (a: THREE.Vector3, b: THREE.Vector3) => Math.atan2(b.x - a.x, b.z - a.z);
  const you = V(0, 0, 0.2);
  const desk = (u: Unit) => { const p = wp(u, u.chairAt); p.y = 0; return p; };
  const desk1 = desk(L1), desk2 = desk(L2), desk3 = desk(R1), desk4 = desk(R2);
  const ladderPostPos = wp(L1, V(D + 0.035, 0.89, L - 0.26 - 0.2));
  const youLampHeadW = wp(L1, youLampHead), youLampBaseW = wp(L1, youLampBase.clone().setY(DT + 0.022));
  const phoneW = wp(L1, phoneCentre);
  const winAp = { x0: (WIN.x0 + WIN.x1) / 2 + 0.03, x1: WIN.x1 - 0.05, y0: WIN.y0 + 0.05, y1: WIN.y1 - 0.05, z: -HZ - 0.1 };
  const winC = V((winAp.x0 + winAp.x1) / 2, (winAp.y0 + winAp.y1) / 2, winAp.z);
  const fwC = fW(V((fAp.x0 + fAp.x1) / 2, (fAp.y0 + fAp.y1) / 2, fAp.z));
  /** n points on a parabolic sag (sag m at the middle) between a and b, ends excluded */
  const span = (a: THREE.Vector3, b: THREE.Vector3, sag: number, n: number) => Array.from({ length: n }, (_, i) => { const t = (i + 1) / (n + 1); return a.clone().lerp(b, t).add(V(0, -4 * sag * t * (1 - t), 0)); });
  const PCH = (name: string, pose: Perch["pose"], pos: THREE.Vector3, facing: number, x: Partial<Perch>): Perch => ({ name, pose, pos, facing, clear: 0.18, headroom: 3.0, cams: [], line01: false, note: "", ...x });
  const seatOf = (u: Unit, top: number) => { const p = wp(u, u.chairAt); p.y = top; return p; };
  const perches: Perch[] = [
    // the recommended line-01 ten (all in cams.wide, toward the window)
    PCH("sill", "sit", V(-0.85, WIN.y0, -2.86), 0, { front: 0.16, clear: 0.17, headroom: 2.55, line01: true, cams: ["hookEnd", "wide", "windowIn"], note: "on the deep sill in front of the fixed (left) sash, legs over the front edge; clear of bunk 2's ladder in the door-end cams" }),
    PCH("frenchDoor", "stand", V(0.55, 0.012, -3.08), 0, { line01: true, cams: ["hookEnd", "wide", "windowIn"], grip: V(0.27, 1.2, -3.1), note: "in the open French door (setFrenchDoorOpen(1)) on the threshold stone, the dusk and the laundry behind; its leaf lies along x .25" }),
    PCH("bunkL2", "sit", wp(L2, V(0.62, bedTop + 0.075, 0.35)), Math.PI / 2 - 0.2, { front: 0.2, headroom: 2.75, line01: true, cams: ["hookEnd", "wide"], grip: wp(L2, V(D - P / 2, RT, 0.6)), note: "on bunk 2's duvet at the window end, seen through the curtain gap from the door end (half hidden by the near panel: peeking out); .33 m behind the rail so a camera-facing card clears it; legs tucked" }),
    PCH("bunkR2", "sit", wp(R2, V(0.6, bedTop, 0.8)), -Math.PI / 2, { front: 0.2, headroom: 3.0, line01: true, cams: ["hookEnd", "wide", "wideBack"], grip: wp(R2, V(D - P / 2, RT, 0.8)), note: "on bunk 4's mattress between the pillow and the folded duvet, behind the aisle rails: legs tucked" }),
    PCH("desk2Chair", "sit", seatOf(L2, 0.51), yawTo(desk2, you), { front: 0.19, line01: true, cams: ["hookEnd", "wide", "wideBack"], note: "desk 2's chair (backrest on the aisle side, +x): turned toward you; keep the card's turn within .5 rad (cast clampYaw)" }),
    PCH("desk4Chair", "sit", seatOf(R2, 0.48), -1.2, { front: 0.22, line01: true, cams: ["hookEnd", "wide", "wideBack"], note: "desk 4's office chair swivelled out toward the aisle (not straight at you: the legs would hit the guitar)" }),
    PCH("ladderR2", "stand", V(0.7, 0, -1.32), -Math.PI / 2 + 0.55, { clear: 0.15, line01: true, cams: ["hookEnd", "wide", "wideBack"], grip: V(0.815, 1.25, -1.59), note: "at the foot of bunk 4's ladder (near side), free hand on its stile (grip). A card ON a rung would cross the rungs from aisle cams: ladderRung is for side cams only" }),
    PCH("aisleL", "stand", V(-0.68, 0, -1.42), Math.PI / 2 - 0.45, { clear: 0.15, line01: true, cams: ["hookEnd", "wide", "wideBack"], grip: V(-0.815, 1.25, -1.59), note: "at the foot of bunk 2's ladder (near side), hand on its stile" }),
    PCH("aisleFar", "stand", V(-0.3, 0, -2.55), 0.15, { line01: true, cams: ["hookEnd", "wide"], note: "by the window, left of the French door's swing (its open leaf lies along x .25, z -3.1..-2.25)" }),
    PCH("aisleR", "stand", V(0.2, 0, -1.05), -0.2, { line01: true, cams: ["hookEnd", "wide", "wideBack"], note: "mid-aisle behind you, clear of desk 4's swivelled chair" }),
    // the door end and other spots (cams.wideBack / cams.ladder)
    PCH("door", "stand", V(0, 0.012, HZ + 0.1), Math.PI, { cams: ["wideBack", "door"], grip: V(EDOOR.x1, 1.1, HZ + 0.02), note: "in the entrance doorway on the threshold (setDoorOpen(1)), corridor light behind: the roommate's grin (line 16)" }),
    PCH("lockerGap", "stand", V(0.88, 0, 2.58), 0, { clear: 0.17, cams: ["wideBack", "door"], note: "the gap between the right lockers and the door (towel and backpack on hooks behind)" }),
    PCH("ladderL1", "stand", V(-0.56, 0, 1.69), Math.PI / 2 - 0.4, { clear: 0.16, cams: ["wideBack", "ladder"], grip: V(-0.815, 1.25, 1.89), note: "at the foot of your ladder (the knot post is its other stile)" }),
    PCH("ladderRung", "stand", V(0.67, 0.372, -1.79), -Math.PI / 2, { clear: 0.14, headroom: 3.0, cams: ["ladderSide"], grip: V(0.815, 1.6, -1.59), note: "ON bunk 4's first rung (tread top 0.372, the feet at x .8; pass floor = .372): only from cams looking along +-x at the ladder (card plane parallel to it)" }),
    PCH("bunkR1", "sit", wp(R1, V(0.62, bedTop + 0.075, 1.0)), -Math.PI / 2, { front: 0.2, headroom: 3.0, cams: ["wideBack"], note: "on bunk 3's duvet behind the fairy-light rail" }),
    PCH("desk1Chair", "sit", seatOf(L1, 0.51), -Math.PI / 2, { front: 0.19, deskEdge: 0.86 - 0.62, deskTop: DT, cams: ["desk", "wideBack"], note: "your chair, square to your desk (= youDesk.seat)" }),
    PCH("desk3Chair", "sit", seatOf(R1, 0.51), yawTo(desk3, you), { front: 0.19, cams: ["wideBack"], note: "desk 3's chair (laptop desk), turned toward you" }),
  ];
  const anchors: DormAnchors = {
    desk1, desk2, desk3, desk4,
    bed: wp(R1, V(D / 2 + 0.08, bedTop, L / 2)),
    middle: V(0, 0, 0.15), balcony: V(0.55, 0, -2.55),
    ladderKnot: wp(L1, V(D + 0.035, 1.0, L - 0.26 - 0.2)),
    windowsill: V(-1.04, WIN.y0, -2.86),
    you, youFacing: 0,
    perches,
    ladderPost: { pos: ladderPostPos, axis: V(0, 1, 0), radius: 0.017, yMin: 0.355 * 2 + 0.014, yMax: 0.355 * 3 - 0.014 },
    youBunk: { top: wp(L1, V(0.5, bedTop, 0.95)), facing: Math.PI, mattressTop: bedTop, pillow: wp(L1, V(D / 2 - 0.02, bedTop + 0.05, 0.32)), railTop: RT + 0.018, ladderTop: wp(L1, V(D + 0.035, RT, L - 0.26)) },
    youDesk: { seat: seatOf(L1, 0.51), facing: -Math.PI / 2, deskEdge: 0.86 - 0.62, deskTop: DT, lampHead: youLampHeadW, lampSwitch: youLampBaseW, phone: phoneW.clone() },
    phone: phoneW,
    door: V(0, 0.012, HZ + 0.1), doorInside: V(0, 0, HZ - 0.45), doorFacing: Math.PI,
    window: { centre: winC, normal: V(0, 0, -1), ...winAp, outside: winC.clone().add(V(0, 0, -0.8)), inside: winC.clone().add(V(0, 0, 0.8)), openX: (u: number) => [winAp.x1 - (winAp.x1 - winAp.x0) * Math.max(0, Math.min(1, u)), winAp.x1] },
    friendWindow: { centre: fwC, normal: V(-Math.sin(FYAW), 0, Math.cos(FYAW)), ...fAp, hand: friendHand, room: fW(V(FX, FFY + 1.2, ZO - 1.8)), yaw: FYAW, toLocal: fL, toWorld: fW },
    routeOut: [phoneW.clone(), wp(L1, V(0.6, 1.15, 0.65)), V(-0.5, 1.3, 0.25), V(-0.5, 1.55, -2.4), winC.clone(), ...span(winC, friendHand, 0.45, 9), friendHand.clone()],
    routeIn: [V(winC.x - 0.4, 2.6, ZF - 6), V(winC.x, 1.8, ZF - 0.8), winC.clone(), V(-0.45, 1.6, -2.3), V(-0.4, 1.7, -0.5), V(-0.55, 2.05, 0.55), wp(L1, V(D - 0.02, RT + 0.06, 0.9)), wp(L1, V(0.55, bedTop + 0.24, 0.95))],
  };
  const ph = phoneW, fh = friendHand;
  const phoneTop = V(-1, 0, 0).applyAxisAngle(V(0, 1, 0), 0.2); // the phone's top points toward the wall (-x), turned .2
  const cams: Record<string, Cam> = {
    // v1 cams (kept)
    wide: { pos: [0.25, 1.8, 2.85], look: [-0.1, 0.82, -2.6], fov: 66 },
    deskClose: { pos: [ph.x + 0.77, 1.52, ph.z + 0.43], look: [ph.x - 0.05, ph.y + 0.024, ph.z - 0.05], fov: 29 },
    bed: { pos: [-0.75, 1.3, anchors.bed.z + 0.55], look: [anchors.bed.x, 1.6, anchors.bed.z - 0.35], fov: 56 },
    reverse: { pos: [0.55, 1.5, -2.65], look: [-0.1, 1.0, 2.9], fov: 66 },
    // v2
    hook: { pos: [0.06, 1.3, 0.78], look: [0, 1.16, 0.2], fov: 36, roll: 0.32 },
    // the hook's pull-back ends here: high at the door end, under the fan blades (2.58), all ten line-01 heads + you
    hookEnd: { pos: [0.2, 2.4, 2.9], look: [-0.05, 0.62, -2.4], fov: 70 },
    wideBack: { pos: [0.45, 1.9, -2.7], look: [-0.15, 0.85, 2.6], fov: 66 },
    ladder: { pos: [-0.36, 1.12, 2.15], look: [ladderPostPos.x, ladderPostPos.y + 0.02, ladderPostPos.z], fov: 32 },
    ladderSide: { pos: [-0.7, 1.1, -1.45], look: [0.75, 1.05, -1.8], fov: 68 },
    bunk: { pos: [0.3, 2.32, 1.78], look: [-1.25, 1.86, 0.8], fov: 50 },
    desk: { pos: [0.2, 1.42, 0.05], look: [-1.38, 0.9, 0.78], fov: 46 },
    phone: { pos: [ph.x - phoneTop.x * -0.035, ph.y + 0.26, ph.z - phoneTop.z * -0.035], look: [ph.x, ph.y, ph.z], fov: 40, up: [phoneTop.x, 0, phoneTop.z] },
    windowIn: { pos: [0.35, 0.95, -0.7], look: [-0.5, 1.6, -3.1], fov: 55 },
    windowOut: { pos: [-0.36, 1.56, -2.78], look: [fwC.x, fwC.y + 0.5, fwC.z], fov: 50, near: 0.05 },
    door: { pos: [0.3, 0.42, 1.55], look: [0, 1.2, HZ + 0.1], fov: 54 },
    friend: { pos: fW(V(FX + 1.6, FFY + 1.0, ZO + 4.2)).toArray() as V3, look: [fwC.x, fwC.y, fwC.z], fov: 34, near: 0.1 },
    // the end shot (line 19): from the -x end of the yard between the blocks, our window high on the right, the
    // friend's lower on the left (its block turned toward this end, so it reads at ~40 deg); the rope spans the frame
    exterior: { pos: [-30, 1.5, (ZF + ZO) / 2 - 0.4], look: [-1.2, -0.4, (ZF + ZO) / 2 - 0.05], fov: 76, near: 0.3 },
    exteriorHigh: { pos: [-27, 9, (ZF + ZO) / 2 + 0.6], look: [-1.2, -1.2, (ZF + ZO) / 2 - 0.2], fov: 72, near: 0.3 },
  };
  void fh;

  // ---------------- colliders (pre-merge mesh bounds; walls, glass, sky, outside excluded) ----------------
  const colliders: DormSet["colliders"] = [];
  {
    const skipRoots = new Set<THREE.Object3D>([shell, ext, laundry, sky, doorLeaf, fdLeaf, sashR]); // moving leaves / sash: not in the list
    const supportMats = new Set<THREE.Material>([fYellow, fPink, fBlueG, fGreen, sheetW, sheetC, pillowW]);
    const inSkip = (o: THREE.Object3D) => { for (let p: THREE.Object3D | null = o; p; p = p.parent) if (skipRoots.has(p)) return true; return false; };
    const bb = new THREE.Box3();
    root.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh || inSkip(m) || (m.material as THREE.Material).transparent) return;
      if (!m.geometry.boundingBox) m.geometry.computeBoundingBox();
      bb.copy(m.geometry.boundingBox!).applyMatrix4(m.matrixWorld);
      const sz = bb.getSize(V(0, 0, 0)); if (Math.max(sz.x, sz.y, sz.z) < 0.03 || Math.min(sz.x, sz.y, sz.z) < 0.003) return;
      let name = ""; for (let p: THREE.Object3D | null = m; p && !name; p = p.parent) name = p.name;
      colliders.push({ name: name || "prop", box: bb.clone(), kind: m.userData.support || supportMats.has(m.material as THREE.Material) ? "support" : "solid" });
    });
  }

  // ---------------- finish: metric UVs, merge static meshes, env rigs, initial state, count ----------------
  W.metricUV(root, (m) => !m.userData.uv01);
  if (opts.merge ?? true) mergeStatic(root, keep);
  {
    const seen = new Set<THREE.Material>();
    root.traverse((o) => {
      const m = o as THREE.Mesh; if (!m.isMesh) return;
      for (const mat of Array.isArray(m.material) ? m.material : [m.material]) {
        if (seen.has(mat)) continue; seen.add(mat);
        if ((mat as THREE.MeshStandardMaterial).isMeshStandardMaterial) patchEnv(mat as THREE.MeshStandardMaterial, mat.userData.ext ? rigEx : rigIn, mat.userData.ext ? "ext" : "in");
      }
    });
    for (const mat of [TUBE_OFF]) if ((mat as THREE.MeshStandardMaterial).isMeshStandardMaterial) patchEnv(mat as THREE.MeshStandardMaterial, rigIn, "in");
  }
  setWindowOpen(0.385);
  const start: DormLight = opts.light ?? (opts.overhead === false ? "night" : "evening");
  setLight(start);
  let tris = 0;
  root.traverse((o) => { const m = o as THREE.Mesh; if (m.isMesh) { const g = m.geometry; tris += (g.index ? g.index.count : g.attributes.position.count) / 3; } });

  return {
    group: root, anchors, cams, lights,
    animate: (t: number) => {
      for (const f of animFns) f(t);
      fairyMats.forEach((m, i) => { const k = (0.75 + 0.25 * Math.sin(t * 2.2 + i * 2.1)) * lerp(0.12, 1, practical); m.color.setRGB([2.6, 2.4, 2.6][i] * k, [1.7, 1.2, 2.1][i] * k, [0.7, 1.4, 1.0][i] * k); });
    },
    setLight, setTime, setWindowOpen, setDoorOpen, setFrenchDoorOpen, setFriend, setLamps, setFacade,
    phone: { group: phoneGroup!, screen: phoneScreen!, screenSize: [0.068, 0.148], rest: { pos: phoneGroup!.position.clone(), quat: phoneGroup!.quaternion.clone() } },
    phoneScreen: phoneScreen!, laptopScreen: laptopScreen!, windowLight: win, sun, lamps, ceilingLights, colliders,
    envRigs: { interior: rigIn, exterior: rigEx },
    tris: Math.round(tris),
  };
}

/** merge every mesh under root that is not in `keep` (or under a kept object) into one mesh per material and shadow
 *  flag, in root's frame. Lights and kept subtrees are left in place. */
function mergeStatic(root: THREE.Group, keep: Set<THREE.Object3D>) {
  root.updateMatrixWorld(true);
  const inv = new THREE.Matrix4().copy(root.matrixWorld).invert();
  const groups = new Map<string, { mat: THREE.Material; cast: boolean; geos: THREE.BufferGeometry[] }>();
  const doomed: THREE.Mesh[] = [];
  const kept = (o: THREE.Object3D) => { for (let p: THREE.Object3D | null = o; p && p !== root; p = p.parent) if (keep.has(p)) return true; return false; };
  root.traverse((o) => {
    const m = o as THREE.Mesh;
    if (!m.isMesh || kept(m) || Array.isArray(m.material)) return;
    const mat = m.material as THREE.Material;
    if ((mat as THREE.MeshBasicMaterial).transparent) return;
    let g = m.geometry.index ? m.geometry.toNonIndexed() : m.geometry.clone();
    for (const name of Object.keys(g.attributes)) if (!["position", "normal", "uv", "edgeD"].includes(name)) g.deleteAttribute(name);
    if (!g.attributes.normal) g.computeVertexNormals();
    if (!g.attributes.uv) g.setAttribute("uv", new THREE.BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2));
    g.applyMatrix4(new THREE.Matrix4().multiplyMatrices(inv, m.matrixWorld));
    const key = mat.uuid + (m.castShadow ? "c" : "n");
    let e = groups.get(key); if (!e) { e = { mat, cast: m.castShadow, geos: [] }; groups.set(key, e); }
    e.geos.push(g); doomed.push(m);
  });
  for (const m of doomed) m.parent?.remove(m);
  for (const e of groups.values()) {
    const anyEdge = e.geos.some((g) => g.attributes.edgeD);
    for (const g of e.geos) {
      if (anyEdge && !g.attributes.edgeD) g.setAttribute("edgeD", new THREE.BufferAttribute(new Float32Array(g.attributes.position.count * 4).fill(9), 4));
      if (!anyEdge && g.attributes.edgeD) g.deleteAttribute("edgeD");
    }
    const merged = mergeGeometries(e.geos, false);
    if (!merged) continue;
    const mesh = new THREE.Mesh(merged, e.mat); mesh.castShadow = e.cast; mesh.receiveShadow = true; mesh.name = "merged";
    root.add(mesh);
  }
  // drop empty groups
  const empties: THREE.Object3D[] = [];
  root.traverse((o) => { if (o !== root && (o as THREE.Group).isGroup && o.children.length === 0) empties.push(o); });
  for (const o of empties) o.parent?.remove(o);
}
