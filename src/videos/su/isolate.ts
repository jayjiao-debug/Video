// isolate.ts: THE LEAD'S ISOLATION under his intro card (v3, Jay 2026-11-14: "we still gonna be doing isolating him
// when his introcard comes up right?"). A postprocessing Effect, LAST in the chain (after the grade): while `amount`
// is above 0 it renders a silhouette MASK of the given objects (苏东坡's rig and the spine in his hands) from the same
// camera into its own target (update(): his colour-painting meshes go on layer ISO_LAYER with one white material for that one render, every
// other layer off), then:
//   inside the mask (and 4 px round it, so the toon ink line stays) the picture is untouched: he stays in full colour;
//   a 3..9.5 px ring round him is rice cream and a 9.5..12.5 px ring warm ink: a sticker lifted off the frame;
//   everything else fades to old paper (its own light and dark kept, soft, warm), and behind him one ink-brush ensō
//   is drawn round his head over the flash (v4, Jay 21:53 local, with Newton's card as the reference: the lead in
//   colour over a faded frame with a themed drawing behind him; the ensō goes with his 居士 seal).
// Pure per frame (no state kept between frames), so farm chunks render it the same in any order.
import * as THREE from "three";
import { Effect, BlendFunction } from "postprocessing";
import { SK } from "./hud/skin";
import { ipFlag } from "../../kit/film/env";

export const ISO_LAYER = 7;

const frag = /* glsl */ `
uniform sampler2D isoMask;
uniform float isoAmount;
uniform vec2 isoFocus;
uniform vec2 isoPx;
uniform vec3 isoA;
uniform vec3 isoB;
uniform vec3 isoRice;
uniform vec3 isoInk;
uniform float isoT;
uniform float isoR;
uniform float isoDebug;
float isoAt(vec2 p) { return texture2D(isoMask, p).r; }
float isoRing(vec2 uv, float r) {
  float m = 0.0;
  for (int i = 0; i < 28; i++) { float a = 6.2831853 * float(i) / 28.0; m = max(m, isoAt(uv + vec2(cos(a), sin(a)) * r * isoPx)); }
  return m;
}
float isoH(float x) { return fract(sin(x * 127.1) * 43758.5453); }
float isoN(float x) { float i = floor(x), f = fract(x); f = f * f * (3.0 - 2.0 * f); return mix(isoH(i), isoH(i + 1.0), f); }
void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  if (isoAmount <= 0.0) { outputColor = inputColor; return; }
  if (isoDebug > 0.5) { vec4 m = texture2D(isoMask, uv); outputColor = vec4(m.r, m.a, 0.0, 1.0); return; }
  float keep = max(isoAt(uv), isoRing(uv, 3.0));
  float rice = max(keep, max(isoRing(uv, 6.0), isoRing(uv, 9.5)));
  float ink = max(rice, isoRing(uv, 12.5));
  // the frozen frame fades to old paper: its own light and dark kept, soft, warm, a little darker at the edges
  float lum = dot(inputColor.rgb, vec3(0.2126, 0.7152, 0.0722));
  vec3 paper = mix(isoA, isoB, 0.3 + 0.62 * sqrt(clamp(lum, 0.0, 1.0)));
  vec2 e = (uv - 0.5) * vec2(1.0, 1.5);
  paper *= 1.0 - 0.22 * smoothstep(0.35, 0.95, length(e));
  // the ensō behind him: one brush stroke round his head, drawn on over the flash (thin start, full belly, a dry tail
  // that stops short of where it began)
  vec2 d = (uv - isoFocus) / isoPx;
  float r = length(d), ang = atan(d.y, d.x);
  float u = fract((-0.38 - ang) / 6.2831853);   // (starts low on his right, so the full belly of the stroke is on his left, clear of the hat and the band)
  float drawn = 0.88 * clamp((isoT - 1.0) / 9.0, 0.0, 1.0);
  float belly = sin(3.14159 * clamp(u / 0.88, 0.0, 1.0));
  float w = isoR * (0.03 + 0.085 * pow(belly, 0.55)) * (0.8 + 0.4 * isoN(u * 19.0));
  float rr = isoR * (1.0 + 0.035 * sin(u * 6.2831853 + 1.3) + 0.015 * isoN(u * 37.0));
  float x = (r - rr) / max(w, 1.0);
  float stroke = 1.0 - smoothstep(0.5 - 1.5 / max(w, 1.0), 0.5 + 1.5 / max(w, 1.0), abs(x));
  float dry = smoothstep(0.55, 0.88, u) * step(0.42, isoN(x * 11.0 + 5.0 + floor(u * 60.0) * 0.0));
  stroke *= (1.0 - dry) * (1.0 - smoothstep(drawn - 0.012, drawn, u));
  vec3 col = mix(paper, isoInk, 0.88 * stroke);
  col = mix(col, isoInk, ink);
  col = mix(col, isoRice, rice);
  col = mix(col, inputColor.rgb, keep);
  outputColor = vec4(mix(inputColor.rgb, col, isoAmount), inputColor.a);
}
`;

const lin = (hex: string) => { const c = new THREE.Color(hex); return new THREE.Vector3(c.r, c.g, c.b); };

export class IsolateEffect extends Effect {
  amount = 0;
  /** the objects to cut out (called every frame while amount > 0) and the screen point the rays leave from (px) */
  target: () => THREE.Object3D[] = () => [];
  focusPx = new THREE.Vector2(540, 650);
  /** frames into the freeze (the ensō is drawn on over the first ten) and the ensō's radius (px) */
  t = 0;
  radiusPx = 345;
  private rt = new THREE.WebGLRenderTarget(1080, 1920, { depthBuffer: true, type: THREE.UnsignedByteType });
  private white = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
  private keepClear = new THREE.Color();
  constructor(private scene: THREE.Scene, private camera: THREE.Camera) {
    super("IsolateEffect", frag, {
      blendFunction: BlendFunction.NORMAL,
      uniforms: new Map<string, THREE.Uniform>([
        ["isoMask", new THREE.Uniform(null)], ["isoAmount", new THREE.Uniform(0)], ["isoFocus", new THREE.Uniform(new THREE.Vector2(0.5, 0.66))],
        ["isoPx", new THREE.Uniform(new THREE.Vector2(1 / 1080, 1 / 1920))],
        ["isoA", new THREE.Uniform(lin("#4a2e1a"))], ["isoB", new THREE.Uniform(lin("#f3e4c4"))],
        ["isoT", new THREE.Uniform(0)], ["isoR", new THREE.Uniform(345)],
        ["isoDebug", new THREE.Uniform(ipFlag("isodebug") ? 1 : 0)], ["isoRice", new THREE.Uniform(lin(SK.rice))], ["isoInk", new THREE.Uniform(lin(SK.ink))],
      ]),
    });
  }
  override setSize(w: number, h: number) { this.rt.setSize(w, h); (this.uniforms.get("isoPx")!.value as THREE.Vector2).set(1 / w, 1 / h); }
  override update(renderer: THREE.WebGLRenderer, input: THREE.WebGLRenderTarget) {
    const a = Math.max(0, Math.min(1, this.amount));
    this.uniforms.get("isoAmount")!.value = a;
    if (a <= 0) return;
    if (this.rt.width !== input.width || this.rt.height !== input.height) this.setSize(input.width, input.height);
    // every mesh of his that paints colour goes on ISO_LAYER with the white material for this one render. Left out: the
    // rig's depth-only helpers (colorWrite off: the disc through the head's edge plane is 4 head radii wide, the
    // depth twins of head parts) and its contact blob (a flat plane at his feet, rig3d.ts)
    const swap: [THREE.Mesh, THREE.Material | THREE.Material[]][] = [];
    for (const o of this.target()) o.traverse((c) => {
      const m = c as THREE.Mesh;
      if (!m.isMesh || !m.visible || m.userData.depthOnly) return;
      const mats = Array.isArray(m.material) ? m.material : [m.material];
      if (mats.every((x) => x.colorWrite === false)) return;
      if (m.renderOrder === 0.5 && m.geometry?.type === "PlaneGeometry") return;
      m.layers.enable(ISO_LAYER); swap.push([m, m.material]); m.material = this.white;
    });
    const sc = this.scene, cam = this.camera;
    const prev = { rt: renderer.getRenderTarget(), mask: cam.layers.mask, bg: sc.background, ov: sc.overrideMaterial, alpha: renderer.getClearAlpha(), auto: renderer.autoClear, shadow: renderer.shadowMap.autoUpdate, fog: sc.fog };
    renderer.getClearColor(this.keepClear);
    cam.layers.set(ISO_LAYER); sc.background = null; sc.overrideMaterial = null; sc.fog = null;
    renderer.shadowMap.autoUpdate = false; renderer.autoClear = false;
    renderer.setRenderTarget(this.rt); renderer.setClearColor(0x000000, 0); renderer.clear(true, true, true);
    renderer.render(sc, cam);
    renderer.setRenderTarget(prev.rt); renderer.setClearColor(this.keepClear, prev.alpha);
    cam.layers.mask = prev.mask; sc.background = prev.bg; sc.overrideMaterial = prev.ov; sc.fog = prev.fog;
    renderer.shadowMap.autoUpdate = prev.shadow; renderer.autoClear = prev.auto;
    for (const [m, mat] of swap) { m.material = mat; m.layers.disable(ISO_LAYER); }
    this.uniforms.get("isoMask")!.value = this.rt.texture;
    (this.uniforms.get("isoFocus")!.value as THREE.Vector2).set(this.focusPx.x / 1080, 1 - this.focusPx.y / 1920);
    this.uniforms.get("isoT")!.value = this.t;
    this.uniforms.get("isoR")!.value = this.radiusPx * input.width / 1080;
  }
}
