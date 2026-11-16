// fx/isolate.ts: THE CUT-OUT (shared kit; src/kit/fx/README.md). While the lead's intro card is up he is ISOLATED: he
// stays in full colour with a cut-out line round him, like a sticker lifted off the picture, and everything behind
// him drops to a wash. This is the picture's half of that card, as one pass in the film's own post chain, so it is in
// the farm render, in the cut's picture and in a preview alike. The card's words are the film's DOM layer, around him.
//
// It is a building block and has NO look of its own: the wash's two colours, how strong it is, the line's colour and
// width, the drop and the lift all come from the film's skin, every frame. With no state, or k = 0, the pass does
// nothing and costs nothing, so the frames outside the card are the same picture as before, bit for bit.
//
//   const iso = new IsolatePass(scene, camera);                 // once; in the chain AFTER the ink pass and the lens blur,
//   comp.addPass(iso);                                          // BEFORE the last effect pass (bloom, tone mapping, grade)
//   iso.set(z ? {                                               // every frame; z = CLOCK.at(f) of overlay/freeze.ts
//     k: life.k, keep: [w.actor(LEAD).group, cup],              // who stays (and what he holds)
//     wash: { dark: SKIN.colour.ink, light: SKIN.colour.paper, amount: 0.85, dim: 0.8 },
//     outline: { color: SKIN.colour.paper, width: 14 },
//     shadow: { x: 10, y: 14, alpha: 0.45 },                    // optional
//     lift: { s: 1.12, rot: -3, cx: 540, cy: 800 },             // optional: start at s 1, rot 0 so he does not jump
//     left: { color: SKIN.colour.ink, alpha: 0.5 },             // optional: the flat shape he leaves where he stood
//   } : null);
//   const face = screenBox(w.actor(LEAD).group, camera, W, H);  // where he is, for overlay slots() and checkOverlays()
//
// How: the whole scene is drawn once more into a small buffer for its depth only, then the objects in `keep` are drawn
// over that depth, alone, with their own materials: what comes through is the part of them the camera really sees, and
// its alpha is the matte. The picture inside the matte is left as it is (so he keeps the film's light, ink and grade);
// outside it the picture is washed; the line is the matte grown by `width`. Nothing is remembered between frames.
// Limits: a thing in front of him (the table he sits behind, the cup he holds) cuts the matte unless it is in `keep`,
// so put what he holds in `keep`; lifted clear of himself, the washed picture still shows him where he stood unless
// `left` covers that place with a flat shape. In an R3F chain it is <primitive object={iso} dispose={null} /> between the
// lens blur and bloom: a pass between two effects makes the composer build two effect passes where it built one, so add
// it before the film's first full render, not between two renders that must match pixel for pixel.
import * as THREE from "three";
import { Pass } from "postprocessing";

/** move, scale and turn the cut-out about a point, all in film px (1080 wide); turn in degrees, clockwise */
export type Lift = { x?: number; y?: number; s?: number; rot?: number; cx: number; cy: number };
/** one frame of the isolation. There are no defaults for the look: the film gives every value from its skin. */
export type IsolateState = {
  /** how present it is, 0..1: the wash, the line and the drop fade with it (0 = nothing is drawn) */ k: number;
  /** who stays in full colour: the lead's rig group, and anything he holds that sticks out past him */ keep: THREE.Object3D[];
  /** the picture behind him: a wash from `dark` (the shadows) to `light` (the highlights), #rrggbb; `amount` 0..1 = how
   *  far the picture goes to it; `dim` multiplies what is left (1 = no dimming) */
  wash: { dark: string; light: string; amount: number; dim: number };
  /** the cut-out line round him: colour, and width in film px (0 = no line) */ outline: { color: string; width: number };
  /** a hard drop under the cut-out: its offset in film px and its strength 0..1, in the wash's dark colour */ shadow?: { x: number; y: number; alpha: number };
  /** lift him off the picture; bring it in from s 1, rot 0 so he does not jump on the first frame */ lift?: Lift;
  /** what stays where he stood once he is lifted away: a flat shape of this colour, `alpha` 0..1 strong. Without it the
   *  washed picture still shows him there, so a lift that moves him clear of himself gives two of him. */
  left?: { color: string; alpha: number };
};

const FS_VERT = /* glsl */ `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;
const COMP_FRAG = /* glsl */ `
uniform sampler2D tPic;
uniform sampler2D tMatte;
uniform vec2 texel;
uniform float k;
uniform vec3 dark;
uniform vec3 light;
uniform float wash;
uniform float dim;
uniform vec3 lineCol;
uniform float lineR;
uniform vec3 drop;
uniform vec4 leftCol;
uniform mat3 lift;
varying vec2 vUv;
bool off(vec2 uv) { return uv.x < 0.0 || uv.y < 0.0 || uv.x > 1.0 || uv.y > 1.0; }
float matteAt(vec2 uv) { return off(uv) ? 0.0 : texture2D(tMatte, uv).a; }
// the matte grown by r px: the most of it on three rings of sixteen taps
float grown(vec2 uv, float r) {
  float d = matteAt(uv);
  if (r <= 0.0) return d;
  for (int i = 0; i < 16; i++) {
    float a = 0.39269908 * float(i);
    vec2 dir = vec2(cos(a), sin(a)) * texel * r;
    d = max(d, max(matteAt(uv + dir), max(matteAt(uv + dir * 0.66), matteAt(uv + dir * 0.33))));
  }
  return d;
}
void main() {
  vec4 pic = texture2D(tPic, vUv);
  vec2 suv = (lift * vec3(vUv, 1.0)).xy;                       // where this pixel of the cut-out comes from
  float m = matteAt(suv);
  float lum = pow(clamp(dot(pic.rgb, vec3(0.2126, 0.7152, 0.0722)), 0.0, 1.0), 0.4545);
  vec3 col = mix(pic.rgb, mix(dark, light, lum), wash * k) * mix(1.0, dim, k);
  if (leftCol.a > 0.0) col = mix(col, leftCol.rgb, leftCol.a * k * matteAt(vUv));   // the place he left
  if (drop.z > 0.0) col = mix(col, dark, drop.z * k * grown(suv - drop.xy, lineR));
  col = mix(col, lineCol, grown(suv, lineR) * k);
  vec3 lead = off(suv) ? pic.rgb : texture2D(tPic, suv).rgb;
  gl_FragColor = vec4(mix(col, lead, m), pic.a);
  #include <colorspace_fragment>
}`;
const COPY_FRAG = /* glsl */ `
uniform sampler2D tSrc;
varying vec2 vUv;
void main() {
  gl_FragColor = texture2D(tSrc, vUv);
  #include <colorspace_fragment>
}`;

/** how much nearer (of the 0..1 depth range) the kept objects are drawn than the scene they are tested against */
const NEARER = 4e-6;
const DEPTH_ONLY = (o: THREE.Object3D) => { const m = (o as THREE.Mesh).material; return Array.isArray(m) ? m.length > 0 && m.every((x) => x.colorWrite === false) : !!m && m.colorWrite === false; };
const RENDERED = (o: THREE.Object3D) => { const r = o as unknown as Record<string, unknown>; return !!(r.isMesh || r.isLine || r.isPoints || r.isSprite); };

/** THE CUT-OUT as a pass (postprocessing). Put it after the ink pass and the lens blur and before the last effect
 *  pass; call set() every frame. It writes back into the buffer it reads, as the ink pass does. */
export class IsolatePass extends Pass {
  private world: THREE.Scene;
  private cam: THREE.Camera;
  private state: IsolateState | null = null;
  private matte: THREE.WebGLRenderTarget;
  private tmp: THREE.WebGLRenderTarget;
  private compMat: THREE.ShaderMaterial;
  private copyMat: THREE.ShaderMaterial;
  private fsScene = new THREE.Scene();
  private fsCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  private quad: THREE.Mesh;
  private clearCol = new THREE.Color();
  private col = new THREE.Color();
  private W = 1;
  private H = 1;
  /** the film's width in px: outline, drop and lift are given at this size, whatever size is rendered */
  readonly filmW: number;

  constructor(scene: THREE.Scene, camera: THREE.Camera, options: { filmW?: number } = {}) {
    super("IsolatePass");
    this.world = scene;
    this.cam = camera;
    this.filmW = options.filmW ?? 1080;
    this.needsSwap = false;                                     // writes back into the input buffer
    // the matte: the kept objects alone, with their own materials; multisampled so its edge is as smooth as the picture's,
    // with a stencil buffer because the rig's figures layer their heads with one
    this.matte = new THREE.WebGLRenderTarget(1, 1, { type: THREE.UnsignedByteType, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, generateMipmaps: false, depthBuffer: true, stencilBuffer: true, samples: 4 });
    this.tmp = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, generateMipmaps: false, depthBuffer: false });
    const fs = (fragmentShader: string, uniforms: Record<string, THREE.IUniform>) =>
      new THREE.ShaderMaterial({ vertexShader: FS_VERT, fragmentShader, uniforms, depthTest: false, depthWrite: false, toneMapped: false });
    this.compMat = fs(COMP_FRAG, {
      tPic: { value: null }, tMatte: { value: this.matte.texture }, texel: { value: new THREE.Vector2(1, 1) }, k: { value: 0 },
      dark: { value: new THREE.Color() }, light: { value: new THREE.Color() }, wash: { value: 0 }, dim: { value: 1 },
      lineCol: { value: new THREE.Color() }, lineR: { value: 0 }, drop: { value: new THREE.Vector3() }, leftCol: { value: new THREE.Vector4() },
      lift: { value: new THREE.Matrix3() },
    });
    this.copyMat = fs(COPY_FRAG, { tSrc: { value: null } });
    this.quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.compMat);
    this.quad.frustumCulled = false;
    this.fsScene.add(this.quad);
  }

  /** this frame's isolation (null, or k 0 = none). Call it every frame: nothing is kept from the frame before. */
  set(state: IsolateState | null) { this.state = state && state.k > 0 && state.keep.length ? state : null; }

  override initialize(_renderer: THREE.WebGLRenderer, _alpha: boolean, frameBufferType: number) {
    if (frameBufferType !== undefined) this.tmp.texture.type = frameBufferType as THREE.TextureDataType;
  }
  override setSize(width: number, height: number) {
    this.W = width; this.H = height;
    this.matte.setSize(width, height);
    this.tmp.setSize(width, height);
    (this.compMat.uniforms.texel.value as THREE.Vector2).set(1 / width, 1 / height);
  }

  /** the matte: first the whole scene for its depth only (colour locked off), then the kept objects alone over that
   *  depth, so only what the camera really sees of them comes through. Objects are taken off the camera's layers for
   *  one render and put back (an object's layers do not hide its children, so a kept thing under a set piece still
   *  draws). */
  private renderMatte(renderer: THREE.WebGLRenderer, keep: THREE.Object3D[]) {
    const scene = this.world, kept = new Set(keep), put: [THREE.Object3D, number][] = [], colour = renderer.state.buffers.color, gl = renderer.getContext();
    const background = scene.background, shadowAuto = renderer.shadowMap.autoUpdate, clearAlpha = renderer.getClearAlpha();
    renderer.getClearColor(this.clearCol);
    scene.background = null;
    renderer.shadowMap.autoUpdate = false;                       // the shadow maps of the main render are still good
    renderer.setClearColor(0x000000, 0);
    renderer.setRenderTarget(this.matte);
    renderer.clear(true, true, true);
    try {
      // 1) the depth of everything that draws colour. Helpers that write depth only are left out: the rig draws each
      //    head once more as depth, a little nearer, and the head itself would fail against that copy.
      const first = (o: THREE.Object3D) => {
        if (!o.visible) return;
        if (RENDERED(o) && DEPTH_ONLY(o)) { put.push([o, o.layers.mask]); o.layers.mask = 0; }
        for (const c of o.children) first(c);
      };
      first(scene);
      colour.setMask(false); colour.setLocked(true);
      try { renderer.render(scene, this.cam); }
      finally { colour.setLocked(false); colour.setMask(true); for (const [o, mask] of put) o.layers.mask = mask; put.length = 0; }
      renderer.clear(false, false, true);                        // the figures layer their heads with the stencil: start it clean
      // 2) the kept objects alone, over that depth
      const walk = (o: THREE.Object3D, inKeep: boolean) => {
        if (!o.visible) return;
        const k = inKeep || kept.has(o);
        if (!k && RENDERED(o)) { put.push([o, o.layers.mask]); o.layers.mask = 0; }
        for (const c of o.children) walk(c, k);
      };
      walk(scene, false);
      // a hair nearer than the first render, so a part drawn with a strict depth test (the rig's heads) passes
      // against its own depth
      gl.depthRange(0, 1 - NEARER);
      renderer.render(scene, this.cam);
    } finally {
      gl.depthRange(0, 1);
      for (const [o, mask] of put) o.layers.mask = mask;
      scene.background = background;
      renderer.shadowMap.autoUpdate = shadowAuto;
      renderer.setClearColor(this.clearCol, clearAlpha);
    }
  }
  private draw(renderer: THREE.WebGLRenderer, material: THREE.ShaderMaterial, to: THREE.WebGLRenderTarget | null) {
    this.quad.material = material;
    renderer.setRenderTarget(to);
    renderer.render(this.fsScene, this.fsCam);
  }

  override render(renderer: THREE.WebGLRenderer, inputBuffer: THREE.WebGLRenderTarget) {
    const s = this.state;
    if (!s && !this.renderToScreen) return;                      // no card on this frame: the picture is not touched
    const autoClear = renderer.autoClear;
    renderer.autoClear = false;
    if (!s) {                                                     // last in the chain with nothing to do: pass the picture on
      this.copyMat.uniforms.tSrc.value = inputBuffer.texture;
      this.draw(renderer, this.copyMat, null);
      renderer.autoClear = autoClear;
      return;
    }
    this.renderMatte(renderer, s.keep);
    const u = this.compMat.uniforms, px = this.W / this.filmW, sc = Math.max(0.01, s.lift?.s ?? 1), filmH = this.H / px;
    u.tPic.value = inputBuffer.texture;
    u.k.value = Math.min(1, s.k);
    (u.dark.value as THREE.Color).set(s.wash.dark); (u.light.value as THREE.Color).set(s.wash.light);
    u.wash.value = s.wash.amount; u.dim.value = s.wash.dim;
    (u.lineCol.value as THREE.Color).set(s.outline.color);
    u.lineR.value = (s.outline.width * px) / sc;
    const d = s.shadow;
    (u.drop.value as THREE.Vector3).set(d ? d.x / this.filmW / sc : 0, d ? -d.y / filmH / sc : 0, d ? d.alpha : 0);
    if (s.left) this.col.set(s.left.color);
    (u.leftCol.value as THREE.Vector4).set(this.col.r, this.col.g, this.col.b, s.left ? s.left.alpha : 0);
    liftMatrix(u.lift.value as THREE.Matrix3, s.lift, this.filmW, filmH);
    if (this.renderToScreen) this.draw(renderer, this.compMat, null);
    else {
      this.draw(renderer, this.compMat, this.tmp);
      this.copyMat.uniforms.tSrc.value = this.tmp.texture;
      this.draw(renderer, this.copyMat, inputBuffer);            // colour only; the buffer's depth is untouched
    }
    renderer.autoClear = autoClear;
  }

  override dispose() {
    this.matte.dispose(); this.tmp.dispose();
    this.compMat.dispose(); this.copyMat.dispose();
    this.quad.geometry.dispose();
  }
}

const _P = new THREE.Matrix3(), _Pi = new THREE.Matrix3(), _A = new THREE.Matrix3();
/** the matrix that takes a pixel of the output (as uv) to the place in the picture it shows (as uv): the inverse of the
 *  lift, with the frame's shape and its y direction folded in */
const liftMatrix = (out: THREE.Matrix3, l: Lift | undefined, W: number, H: number) => {
  if (!l) return out.identity();
  const s = Math.max(0.01, l.s ?? 1), a = (-(l.rot ?? 0) * Math.PI) / 180, c = Math.cos(a) / s, n = Math.sin(a) / s;
  const tx = l.cx + (l.x ?? 0), ty = l.cy + (l.y ?? 0);          // output px -> source px:  p = C + R(-rot) (q - C - t) / s
  _A.set(c, -n, l.cx - c * tx + n * ty, n, c, l.cy - n * tx - c * ty, 0, 0, 1);
  _P.set(W, 0, 0, 0, -H, H, 0, 0, 1);                             // uv -> film px (y down)
  _Pi.set(1 / W, 0, 0, 0, -1 / H, 1, 0, 0, 1);                    // film px -> uv
  return out.multiplyMatrices(_Pi, _A).multiply(_P);
};

/** a box in film px (the overlay kit's Rect, without importing it) */
export type Box = { x0: number; y0: number; x1: number; y1: number };
const _one = new THREE.Box3(), _v = new THREE.Vector3(), _view = new THREE.Matrix4();
/** WHERE AN OBJECT IS ON SCREEN: the box, in film px (W x H), round its VISIBLE meshes, each measured on its own (the
 *  eight corners of its bounding box, put on screen). For the overlay kit's slots() (where the card's words may sit)
 *  and checkOverlays (what they must not cover). Call it after the frame is posed: it brings the object's and the
 *  camera's world matrices up to date itself (the renderer only does that when it draws) and reads the camera's
 *  projection as it stands. A mesh the rig rewrites every frame (not frustum culled) is measured from its vertices,
 *  not from its stored box; helpers that write depth only are left out. The box is the whole figure, also the part of
 *  him behind a table, and a little generous. Null when nothing of it is in front of the camera. Not for skinned or
 *  instanced meshes. */
export const screenBox = (o: THREE.Object3D, camera: THREE.Camera, W: number, H: number): Box | null => {
  o.updateWorldMatrix(true, true);
  camera.updateWorldMatrix(true, false);
  _view.copy(camera.matrixWorld).invert();
  const near = (camera as THREE.PerspectiveCamera).near ?? 0;
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  const walk = (x: THREE.Object3D) => {
    if (!x.visible) return;
    const mesh = x as THREE.Mesh, g = mesh.geometry as THREE.BufferGeometry | undefined, pos = g?.attributes?.position;
    if (mesh.isMesh && g && pos && !DEPTH_ONLY(x)) {
      if (mesh.frustumCulled === false) _one.setFromBufferAttribute(pos as THREE.BufferAttribute);
      else { if (!g.boundingBox) g.computeBoundingBox(); _one.copy(g.boundingBox as THREE.Box3); }
      const a = _one.min, b = _one.max;
      if (b.x - a.x + (b.y - a.y) + (b.z - a.z) > 0) {              // a mesh with no size (not yet filled) says nothing
        for (let i = 0; i < 8; i++) {
          _v.set(i & 1 ? b.x : a.x, i & 2 ? b.y : a.y, i & 4 ? b.z : a.z).applyMatrix4(x.matrixWorld).applyMatrix4(_view);
          if (_v.z > -near) continue;                               // behind the camera
          _v.applyMatrix4(camera.projectionMatrix);
          const px = (_v.x * 0.5 + 0.5) * W, py = (0.5 - _v.y * 0.5) * H;
          x0 = Math.min(x0, px); x1 = Math.max(x1, px); y0 = Math.min(y0, py); y1 = Math.max(y1, py);
        }
      }
    }
    for (const c of x.children) walk(c);
  };
  walk(o);
  return x1 >= x0 ? { x0, y0, x1, y1 } : null;
};
/** where a box lands once the cut-out is lifted (the box round its four moved corners) */
export const liftBox = (r: Box, l: Lift | undefined): Box => {
  if (!l) return r;
  const s = l.s ?? 1, a = ((l.rot ?? 0) * Math.PI) / 180, c = Math.cos(a) * s, n = Math.sin(a) * s;
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const [x, y] of [[r.x0, r.y0], [r.x1, r.y0], [r.x1, r.y1], [r.x0, r.y1]]) {
    const dx = x - l.cx, dy = y - l.cy, X = l.cx + (l.x ?? 0) + c * dx - n * dy, Y = l.cy + (l.y ?? 0) + n * dx + c * dy;
    x0 = Math.min(x0, X); x1 = Math.max(x1, X); y0 = Math.min(y0, Y); y1 = Math.max(y1, Y);
  }
  return { x0, y0, x1, y1 };
};
