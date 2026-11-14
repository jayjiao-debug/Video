// isolate.ts: THE ISOLATION of 李白 on his intro card (hud/intro.tsx LeadCard, story.ts CLOCK's freeze).
//
// While the picture is frozen for his card, everything behind him drops away: a backdrop card in the film's skin is set
// up IN THE 3D SCENE just behind his head, square to the lens and a little bigger than the frame. He, and what is in
// front of him (his table, his jar), keep full colour; the ink pass sees the backdrop as a flat wall, so the tavern's
// lines behind him vanish and his own outline stays, like a figure cut out of the frame.
//
// The backdrop (skin.ts): night-indigo ink with the cloth's weave, rays of a slightly lighter indigo, and a big pale
// moon right behind his head (the moon is the film's thread, and he has just asked the lens 「月亮？」), with a
// wine-amber rim. Unlit (MeshBasicMaterial), no shadows. k 0..1 fades it with the freeze (Film.tsx).
import * as THREE from "three";
import { C, TONE } from "./hud/skin";

const TW = 720, TH = 1200;            // the texture (the frame's 1080 x 1800 at two thirds)
const MARGIN = 1.12;                  // the card is this much bigger than the frame at its depth
const BEHIND = 0.42;                  // metres behind his head

const draw = (g: CanvasRenderingContext2D, u: number, v: number) => {
  // u, v: his head's centre on the card, 0..1 from the top left
  const x = u * TW, y = v * TH;
  const bg = g.createRadialGradient(x, y, 40, x, y, TH * 0.95);
  bg.addColorStop(0, "#2c3570"); bg.addColorStop(0.45, C.ink); bg.addColorStop(1, "#0b0e26");
  g.fillStyle = bg; g.fillRect(0, 0, TW, TH);
  // rays from the moon, every other one a shade lighter
  const R = Math.hypot(TW, TH);
  for (let i = 0; i < 28; i++) {
    if (i % 2) continue;
    const a0 = (i / 28) * Math.PI * 2 + 0.06, a1 = ((i + 1) / 28) * Math.PI * 2 + 0.06;
    g.beginPath(); g.moveTo(x, y); g.lineTo(x + R * Math.cos(a0), y + R * Math.sin(a0)); g.lineTo(x + R * Math.cos(a1), y + R * Math.sin(a1)); g.closePath();
    g.fillStyle = "rgba(120,140,220,0.07)"; g.fill();
  }
  // the cloth's weave
  g.globalAlpha = 0.05; g.fillStyle = C.paper;
  for (let yy = 0; yy < TH; yy += 6) g.fillRect(0, yy, TW, 1);
  for (let xx = 0; xx < TW; xx += 7) g.fillRect(xx, 0, 1, TH);
  g.globalAlpha = 1;
  // the moon behind his head: halo, amber rim, pale disc
  const mr = TW * 0.36;
  const halo = g.createRadialGradient(x, y, mr * 0.9, x, y, mr * 1.9);
  halo.addColorStop(0, "rgba(243,229,195,0.30)"); halo.addColorStop(1, "rgba(243,229,195,0)");
  g.fillStyle = halo; g.beginPath(); g.arc(x, y, mr * 1.9, 0, Math.PI * 2); g.fill();
  g.fillStyle = TONE.amberTop; g.beginPath(); g.arc(x, y, mr + 10, 0, Math.PI * 2); g.fill();
  const disc = g.createRadialGradient(x - mr * 0.3, y - mr * 0.3, 10, x, y, mr);
  disc.addColorStop(0, "#fffaf0"); disc.addColorStop(1, C.paper);
  g.fillStyle = disc; g.beginPath(); g.arc(x, y, mr, 0, Math.PI * 2); g.fill();
  // two soft craters, low on the disc
  g.fillStyle = "rgba(214,189,138,0.35)";
  g.beginPath(); g.arc(x + mr * 0.42, y + mr * 0.38, mr * 0.16, 0, Math.PI * 2); g.fill();
  g.beginPath(); g.arc(x - mr * 0.5, y + mr * 0.5, mr * 0.1, 0, Math.PI * 2); g.fill();
};

export class Isolation {
  private readonly canvas = document.createElement("canvas");
  private readonly tex: THREE.CanvasTexture;
  private readonly mat: THREE.MeshBasicMaterial;
  readonly mesh: THREE.Mesh;
  private key = "";
  private readonly v = new THREE.Vector3();
  private readonly fwd = new THREE.Vector3();
  constructor(root: THREE.Object3D) {
    this.canvas.width = TW; this.canvas.height = TH;
    this.tex = new THREE.CanvasTexture(this.canvas);
    this.tex.colorSpace = THREE.SRGBColorSpace;
    this.mat = new THREE.MeshBasicMaterial({ map: this.tex, transparent: true, opacity: 0, depthWrite: true, fog: false });
    this.mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), this.mat);
    this.mesh.name = "libai-isolation"; this.mesh.castShadow = false; this.mesh.receiveShadow = false;
    this.mesh.frustumCulled = false; this.mesh.visible = false;
    root.add(this.mesh);
  }
  /** k 0..1; cam after the pose's camera is applied; head = his head's world position */
  set(k: number, cam: THREE.PerspectiveCamera, head: THREE.Vector3) {
    if (k <= 0.001) { this.mesh.visible = false; return; }
    cam.updateMatrixWorld();
    cam.getWorldDirection(this.fwd);
    const d = this.v.copy(head).sub(cam.position).dot(this.fwd) + BEHIND;
    const h = 2 * d * Math.tan(THREE.MathUtils.degToRad(cam.fov) / 2) * MARGIN, w = h * cam.aspect;
    this.mesh.position.copy(cam.position).addScaledVector(this.fwd, d);
    this.mesh.quaternion.copy(cam.quaternion);
    this.mesh.scale.set(w, h, 1);
    this.mesh.visible = true;
    this.mat.opacity = k;
    // his head on the card (NDC -> the card's 0..1, the card being MARGIN times the frame)
    const p = this.v.copy(head).project(cam);
    const u = 0.5 + p.x / 2 / MARGIN, vv = 0.5 - p.y / 2 / MARGIN;
    const key = `${u.toFixed(3)},${vv.toFixed(3)}`;
    if (key !== this.key) { this.key = key; const g = this.canvas.getContext("2d")!; draw(g, u, vv); this.tex.needsUpdate = true; }
  }
}
