// isolate.ts: THE ISOLATION of 李白 on his intro card (hud/intro.tsx LeadCard, story.ts CLOCK's freeze).
//
// While the picture is frozen for his card, everything behind him drops away: a backdrop card in the film's skin is set
// up IN THE 3D SCENE just behind his head, square to the lens and a little bigger than the frame. He, and what is in
// front of him (his table, his jar), keep full colour; the ink pass sees the backdrop as a flat wall, so the tavern's
// lines behind him vanish and his own outline stays, like a figure cut out of the frame.
//
// The cut-out (Jay, 14 Nov: "smash bro character cutout focus"): his silhouette is drawn alone into a small mask each
// frame, and the backdrop paints a thick amber ring round it with a thin ink edge, so he reads as a sticker cut
// out of the frozen frame (his own ink outline inside the ring).
//
// The backdrop: only a night-indigo wash over the frozen frame, a little lighter round him (Jay, 15 Nov: the moon
// that stood behind him was too much). Unlit, no shadows. k 0..1 fades it with the freeze (Film.tsx).
import * as THREE from "three";
import { C, TONE } from "./hud/skin";

const TW = 720, TH = 1200;            // the texture (the frame's 1080 x 1800 at two thirds)
const MARGIN = 1.12;                  // the card is this much bigger than the frame at its depth
const BEHIND = 0.42;                  // metres behind his head

const draw = (g: CanvasRenderingContext2D, u: number, v: number) => {
  // u, v: his head's centre on the card, 0..1 from the top left
  const x = u * TW, y = v * TH;
  // the frozen frame stays, dimmed under a night-indigo wash, a little lighter round him (Jay, 15 Nov: the moon behind
  // him was too much and confused the morning; the earlier simple card was better). Nothing else: no moon, no rays.
  g.clearRect(0, 0, TW, TH);
  const bg = g.createRadialGradient(x, y, 60, x, y, TH * 0.9);
  bg.addColorStop(0, "rgba(27,33,72,0.42)"); bg.addColorStop(0.5, "rgba(20,25,58,0.66)"); bg.addColorStop(1, "rgba(11,14,38,0.84)");
  g.fillStyle = bg; g.fillRect(0, 0, TW, TH);
};

const RING = 24, EDGE = 5;            // the cut-out ring (his amber, so it reads on the pale moon and on the dark; wide enough to clear the head's own thick outline, which the flat mask does not have) and its ink edge, px of the 1080 frame
const VERT = `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const FRAG = `
uniform sampler2D map; uniform sampler2D mask; uniform float opacity; uniform vec3 ring; uniform vec3 edge; uniform vec2 px; uniform float margin;
varying vec2 vUv;
float around(vec2 p, float r) {
  float m = 0.0;
  for (int i = 0; i < 32; i++) { float a = 6.2831853 * float(i) / 32.0; m = max(m, texture2D(mask, p + vec2(cos(a), sin(a)) * px * r).a); }
  return m;
}
void main() {
  vec2 s = (vUv - 0.5) * margin + 0.5;
  vec4 t = texture2D(map, vUv); vec3 c = t.rgb;
  float inner = max(around(s, ${RING.toFixed(1)}), around(s, ${(RING / 2).toFixed(1)}));
  float outer = around(s, ${(RING + EDGE).toFixed(1)});
  c = mix(c, edge, clamp(outer - inner, 0.0, 1.0));
  c = mix(c, ring, inner);
  gl_FragColor = vec4(c, opacity * max(t.a, outer));
  #include <colorspace_fragment>
}`;
const MW = 540, MH = 900;              // the mask (the frame at half size)

export class Isolation {
  private readonly canvas = document.createElement("canvas");
  private readonly tex: THREE.CanvasTexture;
  private readonly mat: THREE.ShaderMaterial;
  private readonly rt = new THREE.WebGLRenderTarget(MW, MH);
  private readonly white = new THREE.MeshBasicMaterial({ color: 0xffffff });
  private readonly cc = new THREE.Color();
  readonly mesh: THREE.Mesh;
  private key = "";
  private readonly v = new THREE.Vector3();
  private readonly fwd = new THREE.Vector3();
  constructor(root: THREE.Object3D, private readonly gl: THREE.WebGLRenderer) {
    this.canvas.width = TW; this.canvas.height = TH;
    this.tex = new THREE.CanvasTexture(this.canvas);
    this.tex.colorSpace = THREE.SRGBColorSpace;
    this.mat = new THREE.ShaderMaterial({
      vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: true,
      uniforms: {
        map: { value: this.tex }, mask: { value: this.rt.texture }, opacity: { value: 0 }, margin: { value: MARGIN },
        ring: { value: new THREE.Color(C.lead) }, edge: { value: new THREE.Color(TONE.shadow.startsWith("rgba") ? "#0c0e22" : TONE.shadow) },
        px: { value: new THREE.Vector2(1 / 1080, 1 / 1800) },
      },
    });
    this.mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), this.mat);
    this.mesh.name = "libai-isolation"; this.mesh.castShadow = false; this.mesh.receiveShadow = false;
    this.mesh.frustumCulled = false; this.mesh.visible = false;
    root.add(this.mesh);
  }
  /** his silhouette alone, white on clear, into the mask (every mesh of his figure drawn flat for one render) */
  private silhouette(fig: THREE.Object3D, cam: THREE.PerspectiveCamera) {
    const gl = this.gl, swapped: [THREE.Mesh, THREE.Material | THREE.Material[]][] = [];
    fig.traverse((o) => { const m = o as THREE.Mesh; if (m.isMesh) { swapped.push([m, m.material]); m.material = this.white; } });
    const prev = gl.getRenderTarget(), alpha = gl.getClearAlpha(); gl.getClearColor(this.cc);
    const shadows = gl.shadowMap.autoUpdate; gl.shadowMap.autoUpdate = false;
    try {
      gl.setRenderTarget(this.rt); gl.setClearColor(0x000000, 0); gl.clear(true, true, true);
      gl.render(fig, cam);
    } finally {
      gl.setRenderTarget(prev); gl.setClearColor(this.cc, alpha); gl.shadowMap.autoUpdate = shadows;
      for (const [m, mat] of swapped) m.material = mat;
    }
  }
  /** k 0..1; cam after the pose's camera is applied; head = his head's world position; fig = his figure (the cut-out) */
  set(k: number, cam: THREE.PerspectiveCamera, head: THREE.Vector3, fig?: THREE.Object3D) {
    if (k <= 0.001) { this.mesh.visible = false; return; }
    cam.updateMatrixWorld();
    cam.getWorldDirection(this.fwd);
    const d = this.v.copy(head).sub(cam.position).dot(this.fwd) + BEHIND;
    const h = 2 * d * Math.tan(THREE.MathUtils.degToRad(cam.fov) / 2) * MARGIN, w = h * cam.aspect;
    this.mesh.position.copy(cam.position).addScaledVector(this.fwd, d);
    this.mesh.quaternion.copy(cam.quaternion);
    this.mesh.scale.set(w, h, 1);
    this.mesh.visible = true;
    this.mat.uniforms.opacity.value = k;
    if (fig) this.silhouette(fig, cam);
    // his head on the card (NDC -> the card's 0..1, the card being MARGIN times the frame)
    const p = this.v.copy(head).project(cam);
    const u = 0.5 + p.x / 2 / MARGIN, vv = 0.5 - p.y / 2 / MARGIN;
    const key = `${u.toFixed(3)},${vv.toFixed(3)}`;
    if (key !== this.key) { this.key = key; const g = this.canvas.getContext("2d")!; draw(g, u, vv); this.tex.needsUpdate = true; }
  }
}
