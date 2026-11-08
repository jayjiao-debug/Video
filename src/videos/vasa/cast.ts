// Our cast as lit flat sprites in the 3D world. Each frame every character asks for a drawing (a key + a draw call);
// the pool keeps one canvas per distinct drawing, so soldiers marching in step share canvases (7 head shapes x 4
// outfits). Characters are yaw-only billboards shaded by cardShade() (scene tint, bright floor, side gradient toward
// the sun, painted crescent in the drawing); standing ones get a soft multiply contact blob. Effects are unlit cards.
// Cards, effects and blobs live on the NOINK layer so the world ink pass never outlines their quads.
import * as THREE from "three";
import {
  Pen, bodyFront, bodySide, fxNote, fxBurst, fxCreak, fxShadow, fxContact, fxPuff, fxSplash, fxRing, fxPlank, Outfit, Expr, FrontOpts, SideOpts, SKINS,
} from "./toon";
import { FPS, D0, SHOTS, V3, smooth, clamp01, crowdC, deckY, WHISTLE, STOP, ZS, HALF_BEAM, halfW, shipToWorld, lin, Pose, AT_QUAY, storyT, GUST1, GUST2, HAT } from "./story";
import { NICHE, DESIGNER_CHAIR, toyLandT } from "./sets";
import { LIGHTS } from "./lights";
import { NOINK } from "./ink";
import { cardShade, blobMaterial, CARD_K } from "./cardshade";

// ---------------- canvas pool ----------------
type Entry = { cv: HTMLCanvasElement; tex: THREE.CanvasTexture; w: number; h: number };
export type Req = { key: string; w: number; h: number; k: number; draw: (p: Pen) => void; tex?: THREE.CanvasTexture };
const makeEntry = (w: number, h: number): Entry => {
  const cv = document.createElement("canvas");
  cv.width = w; cv.height = h;
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  return { cv, tex, w, h };
};
export class Pool {
  private live = new Map<string, Entry>();
  private free: Entry[] = [];
  private reqs: Req[] = [];
  req(key: string, w: number, h: number, k: number, draw: (p: Pen) => void) {
    const r: Req = { key: `${w}x${h}|${key}`, w, h, k, draw };
    this.reqs.push(r);
    return r;
  }
  flush() {
    const want = new Map<string, Req[]>();
    for (const r of this.reqs) { const l = want.get(r.key); if (l) l.push(r); else want.set(r.key, [r]); }
    for (const [key, e] of this.live) if (!want.has(key)) { this.live.delete(key); this.free.push(e); }
    for (const [key, rs] of want) {
      let e = this.live.get(key);
      if (!e) {
        const r = rs[0], i = this.free.findIndex((x) => x.w === r.w && x.h === r.h);
        e = i >= 0 ? this.free.splice(i, 1)[0] : makeEntry(r.w, r.h);
        const g = e.cv.getContext("2d")!;
        g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, e.w, e.h); g.setTransform(r.k, 0, 0, r.k, 0, 0);
        r.draw(new Pen(g));
        e.tex.needsUpdate = true;
        this.live.set(key, e);
      }
      for (const r of rs) r.tex = e.tex;
    }
    this.reqs = [];
  }
}

// ---------------- sprite meshes ----------------
const blank = (() => { const c = document.createElement("canvas"); c.width = c.height = 2; return new THREE.CanvasTexture(c); })();
export const SU = 0.00216; // metres per design unit: 1000 units = 2.16 m
export const SU_SWING = 2.3 / 1830; // swing canvas: rope of 1830 units = 2.3 m
const BODY = (() => { const g = new THREE.PlaneGeometry(600 * SU, 1000 * SU); g.translate(0, (975 - 500) * SU, 0); return g; })();
const CARD = new THREE.PlaneGeometry(1, 1);
/** world roots that hold actors (to find the scene's sun when world.ts does not pass it) */
const ROOTS = new Set<THREE.Object3D>();

/** lit flat character: cardShade() material, receives shadows (dims to the bright floor only), casts its silhouette
 *  when world.ts says so (golden). Drawn after the contact blobs (renderOrder 1). */
export class Actor {
  mesh: THREE.Mesh; mat: THREE.MeshLambertMaterial; dmat: THREE.MeshDepthMaterial; r: Req | null = null;
  constructor(parent: THREE.Object3D, geo: THREE.BufferGeometry = BODY) {
    this.mat = cardShade(new THREE.MeshLambertMaterial({ map: blank, alphaTest: 0.5, side: THREE.DoubleSide }));
    this.mat.alphaToCoverage = false; // A2C + MSAA left 1 px sky-depth seams on blurred far cards (POST)
    this.dmat = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: blank, alphaTest: 0.5, side: THREE.DoubleSide });
    this.mesh = new THREE.Mesh(geo, this.mat);
    this.mesh.customDepthMaterial = this.dmat;
    // rim width is in output pixels: tell the card shader the render height (1920 = 1080 x 1920 frame)
    this.mesh.onBeforeRender = (r) => { const rt = r.getRenderTarget(); CARD_K.uPx.value = (rt ? rt.height : r.domElement.height) / 1920; };
    this.mesh.castShadow = false; this.mesh.receiveShadow = true; this.mesh.visible = false;
    this.mesh.rotation.order = "YXZ"; this.mesh.renderOrder = 1; this.mesh.layers.set(NOINK);
    parent.add(this.mesh);
    ROOTS.add(parent);
  }
  bind() { const t = this.r?.tex; if (t) { this.mat.map = t; this.dmat.map = t; } }
}
/** unlit effect card: hard cut-out (ink drawings), soft see-through (dust, mist) or a multiply ground blob */
export class Fx {
  mesh: THREE.Mesh; mat: THREE.MeshBasicMaterial; soft: THREE.MeshBasicMaterial; blob: THREE.MeshBasicMaterial; r: Req | null = null;
  constructor(parent: THREE.Object3D) {
    this.mat = new THREE.MeshBasicMaterial({ map: blank, alphaTest: 0.5, side: THREE.DoubleSide });
    this.mat.alphaToCoverage = false; // A2C + MSAA left 1 px sky-depth seams on blurred far cards (POST)
    this.soft = new THREE.MeshBasicMaterial({ map: blank, transparent: true, depthWrite: false, side: THREE.DoubleSide });
    this.blob = blobMaterial(blank);
    this.mesh = new THREE.Mesh(CARD, this.mat);
    this.mesh.visible = false; this.mesh.layers.set(NOINK);
    parent.add(this.mesh);
  }
  use(soft: boolean) { this.mesh.material = soft ? this.soft : this.mat; }
  bind() {
    const t = this.r?.tex;
    if (!t) return;
    if (this.r!.key.includes("|blob|")) {
      // no mipmaps: at grazing views the mip chain averages the blob with its white surround and it fades out
      if (t.generateMipmaps) { t.generateMipmaps = false; t.minFilter = THREE.LinearFilter; t.needsUpdate = true; }
      this.blob.map = t; this.mesh.material = this.blob; this.mesh.renderOrder = 0.5;
    }
    else { this.mat.map = t; this.soft.map = t; this.mesh.renderOrder = 0; }
  }
}

// ---------------- placements ----------------
export type Place = {
  key: string; draw: (p: Pen) => void; x: number; y: number; z: number;
  scale?: number; mirror?: boolean; yaw?: number; geo?: "body" | "swing"; roll?: number; size?: [number, number, number];
};
export type FxPlace = { key: string; cw: number; ch: number; draw: (p: Pen) => void; x: number; y: number; z: number; w: number; h: number; flat?: boolean; rot?: number; soft?: boolean; tiltX?: number };
/** sun = world direction TOWARD the sun (optional: when absent the scene's shadow-casting light is used) */
export type CamInfo = { pos: THREE.Vector3; right: THREE.Vector3; sun?: THREE.Vector3 };

const hh = (i: number, s = 0) => { const v = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return v - Math.floor(v); };
const q = (v: number, n = 120) => Math.round(v * n) / n;
// 1628 outfits: sailors in knit caps, officers in wide felt hats with plumes, townsfolk in wide hats and bonnets
const CAPS = ["#b8342c", "#2f4a7a", "#7a5a3a", "#5c6370", "#c98a2a"];
const SHIRTS = ["#8d96a3", "#7a6450", "#cbbd9e", "#55708f", "#9a5e45", "#6f7f5a"];
const SAILOR = [0, 1, 2, 3, 4, 5].map((v): Outfit => ({ jacket: SHIRTS[v], pants: ["#4e4238", "#3d4658", "#5a4a3a"][v % 3], boots: "#3b2e26",
  hat: "cap", cap: CAPS[v % 5], skin: SKINS[v % 4], moustache: v % 3 === 1 ? "#4a3426" : undefined }));
export const CAPTAIN: Outfit = { jacket: "#3a2c28", pants: "#2c2522", boots: "#1e1714", hat: "wide", cap: "#2a2220", plume: "#e8e2d4", buttons: "#e8c45a", moustache: "#3a2618", build: "stout" };
export const ADMIRAL: Outfit = { jacket: "#2f4f8a", pants: "#2a2f45", boots: "#1e1714", hat: "wide", cap: "#1e1a22", plume: "#f4f0e6", buttons: "#e8c45a", sash: "#e0b040", moustache: "#c9c2b8", build: "stout" };
const FOLK = [0, 1, 2, 3, 4, 5].map((v): Outfit => {
  const coats = ["#3f6fb5", "#8c3b4a", "#5d7a3a", "#b5653f", "#2f5f6a", "#7b5ac9"];
  const o: Outfit = { jacket: coats[v % 6], pants: "#3b3f52", boots: "#4a3426", skin: SKINS[v % 4] };
  return v % 2 ? { ...o, hat: "bonnet", dress: ["#d9a441", "#c25a7a", "#5a8fc2"][v % 3] } : { ...o, hat: "wide", cap: ["#3a3030", "#4a3a2a", "#2a2a3a"][v % 3], plume: v % 4 === 0 ? "#c0353a" : undefined };
});
const vOf = (i: number) => (i * 7 + (i >> 2)) % 4;
/** head / body seed: 13 shapes (v2: more variety in the crowds; marching figures in step still share canvases) */
const seedOf = (i: number) => ((i * 5 + 3) % 13) + 1;
/** drawing resolution by distance: [canvas w, h, scale from the 600 x 1000 design]; sized for the 1440 x 2560 final */
const tier = (d: number): [number, number, number] =>
  d < 3.2 ? [1800, 3000, 3.0] : d < 6.5 ? [1080, 1800, 1.8] : d < 16 ? [480, 800, 0.8] : [240, 400, 0.4];

// ---------------- light ----------------
const SUN = new THREE.Vector3(0.5, 0.75, -0.4).normalize();
const tmp = new THREE.Vector3();
let LNAME: "day" | "golden" = "day";
const sunOf = (root: THREE.Object3D) => {
  let s: THREE.DirectionalLight | null = null;
  root.traverse((o) => { if (!s && o instanceof THREE.DirectionalLight && o.castShadow) s = o; });
  return s as THREE.DirectionalLight | null;
};
/** the sun of the world that is calling: the attached root whose sun target sits on this camera's view axis */
const findSun = (cam: CamInfo, out: THREE.Vector3) => {
  if (cam.sun) return out.copy(cam.sun).normalize();
  let best: THREE.DirectionalLight | null = null, err = Infinity;
  for (const r of ROOTS) {
    if (!r.parent) continue;
    const s = sunOf(r);
    if (!s) continue;
    const d = tmp.copy(s.target.position).sub(cam.pos), e = Math.abs(d.dot(cam.right)) / (d.length() || 1);
    if (e < err) { err = e; best = s; }
  }
  return best ? out.copy(best.position).sub(best.target.position).normalize() : out;
};
/** canvas angle the sun comes FROM on an upright card facing the camera, in 45-degree steps (small texture cache) */
const light2D = (cam: CamInfo, mirror: boolean) => {
  const sx = SUN.dot(cam.right) * (mirror ? -1 : 1), sy = -SUN.y;
  return Math.round(Math.atan2(sy, sx) / (Math.PI / 4)) * (Math.PI / 4);
};

/** front / side view and mirroring for someone at (x, z) walking along (dx, dz); fs = foreshortening of the walk */
const viewOf = (cam: CamInfo, x: number, z: number, dx: number, dz: number) => {
  const tx = cam.pos.x - x, tz = cam.pos.z - z, tl = Math.hypot(tx, tz) || 1;
  const c = (tx * dx + tz * dz) / tl;
  return { side: c < 0.57, mirror: dx * cam.right.x + dz * cam.right.z < 0, fs: Math.round(Math.sqrt(Math.max(0, 1 - c * c)) * 20) / 20 };
};

// ---------------- life: blinks and reaction timing ----------------
/** reference expression and action changes land 0-3 f before the word onset */
const LEAD = 2 / FPS;
/** eyelid 0 open .. 1 shut. Reference: gaps 0.5-2.3 s, 4-frame blink half / shut / shut / half, plus a blink across
 *  every expression swap (the shut frames hide the swap) */
const LID = [0.5, 1, 1, 0.5];
const lidAt = (t: number, i: number, swaps: number[] = []) => {
  const f = Math.round(t * FPS);
  for (const ts of swaps) { const k = f - Math.round((ts - LEAD) * FPS) + 1; if (k >= 0 && k < 4) return LID[k]; }
  let s = Math.round(-60 * hh(i, 9));
  for (let n = 0; s <= f && n < 400; n++) {
    const k = f - s;
    if (k >= 0 && k < 4) return LID[k];
    s += Math.round(66 + 66 * hh(i * 31 + n, 13)); // v3: next blink 2.2-4.4 s later (v2's 0.5-2.3 s made a busy frame twitch)
  }
  return 0;
};
const fkey = (o: object) => JSON.stringify(o, (_k, v) => (typeof v === "number" ? q(v) : v));

type Who = { i: number; o: Outfit; okey: string };
/** one character drawing in the 600 x 1000 design space, sized by distance, lit from the scene's sun */
const person = (cam: CamInfo, who: Who, x: number, y: number, z: number, view: { side: boolean; mirror: boolean }, fo: FrontOpts, so: SideOpts, scale = 1): Place & { tierKey: string } => {
  const d = cam.pos.distanceTo(tmp.set(x, y + 1.2, z)) / scale;
  const [w, h, k] = tier(d);
  const mirror = view.side && view.mirror, light = light2D(cam, mirror), seed = seedOf(who.i);
  const f2: FrontOpts = { ...fo, light, seed }, s2: SideOpts = { ...so, light, seed };
  const key = view.side ? `S|${who.okey}|${fkey(s2)}` : `F|${who.okey}|${fkey(f2)}`;
  return {
    key, x, y, z, scale, mirror, tierKey: `${w}`,
    draw: (p) => (view.side ? bodySide(p, who.o, s2) : bodyFront(p, who.o, f2)),
    size: [w, h, k],
  };
};

/** ground shadow under a standing / sitting card (review rounds 2-4), multiply, blue-violet: a TIGHT contact pool right under
 *  the feet (~.5 on screen at the core) so nobody floats, plus by day (cards cast no real shadow) a lighter soft tail
 *  stretched AWAY from the sun, length ~1.6 m / tan(sun elevation), capped. Golden: world.ts casts real card shadows. */
const CONTACT: Record<"day" | "golden", [number, number, number]> = { day: [0.2, 0.21, 0.33], golden: [0.24, 0.2, 0.33] };
const TAIL: [number, number, number] = [0.42, 0.44, 0.62];
const toSrgb = (v: number) => { const c = clamp01(v); return c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055; };
const hexOf = (c: [number, number, number], k: number) => "#" + c.map((v) => Math.round(255 * toSrgb(1 - (1 - v) * k)).toString(16).padStart(2, "0")).join("");
const blob = (out: Stage, x: number, y: number, z: number, sc = 1, k = 1) => {
  const hl = Math.hypot(SUN.x, SUN.z) || 1, ox = -SUN.x / hl, oz = -SUN.z / hl, rot = Math.atan2(-ox, -oz);
  if (LNAME === "day") {
    const el = Math.asin(Math.min(0.99, Math.max(0.1, SUN.y)));
    const len = Math.min(2.4, Math.max(0.5, 1.6 / Math.tan(el))) * sc, h = len + 0.55 * sc, c = 0.3 * h; // feet at v = .2 of the card
    const tc = hexOf(TAIL, k);
    out.fx.push({ key: `blob|shadow|${tc}`, cw: 128, ch: 256, draw: (p) => fxShadow(p, tc), x: x + ox * c, y: y + 0.018, z: z + oz * c,
      w: 0.72 * sc, h, flat: true, rot });
  }
  const cc = hexOf(CONTACT[LNAME], k);
  out.fx.push({ key: `blob|contact|${cc}`, cw: 128, ch: 128, draw: (p) => fxContact(p, cc), x: x + ox * 0.03 * sc, y: y + 0.022, z: z + oz * 0.03 * sc,
    w: 0.52 * sc, h: 0.4 * sc, flat: true, rot });
};

// ---------------- crowd by shot ----------------
export type Stage = { places: Place[]; fx: FxPlace[] };

/** flat contact pool under someone standing on the (rolling) deck */
const deckBlob = (out: Stage, lx: number, ly: number, lz: number, heel: number, sc = 1) => {
  const [x, y, z] = shipToWorld([lx, ly + 0.03, lz], heel);
  const cc = hexOf(CONTACT[LNAME], 1);
  out.fx.push({ key: `blob|contact|${cc}`, cw: 128, ch: 128, draw: (p) => fxContact(p, cc), x, y, z, w: 0.55 * sc, h: 0.42 * sc, flat: true, tiltX: heel });
};

// sailor lanes along the waist (the main mast stands at x = 0.8, the capstan at x = -6.6 on the centreline)
const LANES = [-5.6, -4.3, -3.0, -1.7, -0.5, 2.1, 3.4, 4.7, 6.0, 7.3];
const SAILORS = 30;
const sailorLocal = (i: number, t: number) => {
  const lane = i % 10, row = Math.floor(i / 10), d = (hh(i, 21) - 0.5) * 0.36;
  const x = LANES[lane] + (hh(i, 22) - 0.5) * 0.5 + (row - 1) * 0.25;
  const zmax = halfW(x, 5.5) - 0.75 - row * 0.8;
  const cAt = (tt: number) => { const c = crowdC(tt - d); return c * zmax + (1 - Math.abs(c)) * (row - 1) * 1.0; };
  return { x, z: cAt(t), zAt: cAt };
};
/** distance a sailor has run since the start (for the stride phase) */
const runDist = (zAt: (t: number) => number, t: number) => {
  let s = 0, prev = zAt(15.6);
  const n = Math.max(1, Math.ceil((t - 15.6) / 0.05));
  for (let k = 1; k <= n; k++) { const z = zAt(15.6 + ((t - 15.6) * k) / n); s += Math.abs(z - prev); prev = z; }
  return s;
};
const sailorExpr = (i: number, t: number): Expr => {
  if (t < 16.0) return i % 3 ? "neutral" : "grin";
  if (t < 17.4) return i % 2 ? "grin" : "laugh";
  if (t < 19.0) return i % 3 === 0 ? "grin" : "nervous";
  if (t < STOP) return i % 3 === 0 ? "shock" : "nervous";
  if (t < 23.0) return i % 2 ? "shock" : "dazed";
  return i % 2 ? "relief" : "nervous";
};

const testCrew = (cam: CamInfo, t: number, heel: number, out: Stage) => {
  for (let i = 0; i < SAILORS; i++) {
    const { x, z, zAt } = sailorLocal(i, t);
    const v = (zAt(t + 0.02) - zAt(t - 0.02)) / 0.04;
    const [wx, wy, wz] = shipToWorld([x, 5.5, z], heel);
    const who: Who = { i, o: SAILOR[i % 6], okey: `sl${i % 6}` };
    let expr = sailorExpr(i, t);
    const blink = lidAt(t, i);
    // a few lose their footing when the third lap piles everyone against the river-side rail
    const tumble = i % 4 === 0 && t > STOP - 0.25 && t < 23.2;
    let place: Place;
    if (tumble) {
      const u = clamp01((t - (STOP - 0.25)) / 0.5), sit = u >= 1;
      if (sit) expr = "dazed";
      place = person(cam, who, wx, wy, wz, { side: false, mirror: false }, { mode: sit ? "sit" : "fall", expr, blink, tilt: sit ? 0 : 30 * u * (i % 8 ? 1 : -1) }, {});
    } else if (Math.abs(v) > 0.6) {
      const dir = Math.sign(v), view = viewOf(cam, wx, wz, 0, dir);
      const ph = q((runDist(zAt, t) / 2.4) % 1, 60);
      const so: SideOpts = { mode: "march", phase: ph, expr, blink, stomp: 1.6, stride: 1.5 * view.fs };
      const fo: FrontOpts = { mode: "march", phase: ph, expr, blink, lift: 90 };
      place = person(cam, who, wx, wy, wz, view, fo, so);
      const scr = Math.sign(dir * cam.right.z || 1);
      place.roll = -0.13 * scr;
    } else {
      place = person(cam, who, wx, wy, wz, { side: false, mirror: false }, { mode: "stand", expr, blink, look: t > 21 && t < 23 ? -1 : 0 }, {});
    }
    out.places.push(place);
    if (!tumble) deckBlob(out, x, 5.5, z, heel);
  }
  // the captain on the quarterdeck edge: whistles the start, waves STOP on the third lap
  {
    const lx = -8.75, lz = -1.4, [wx, wy, wz] = shipToWorld([lx, 8.0, lz], heel);
    const blowing = (t > WHISTLE - 0.05 && t < WHISTLE + 0.8) || (t > 15.95 && t < 16.35);
    const waving = t > STOP - 0.3 && t < STOP + 1.4;
    const expr: Expr = blowing ? "whistle" : waving ? "shock" : t > 19.3 ? "nervous" : "stern";
    const fo: FrontOpts = { mode: "stand", expr, blink: blowing ? 0 : lidAt(t, 90), wave: waving ? q(Math.sin(t * 22), 20) : undefined, facing: 1 };
    out.places.push(person(cam, { i: 90, o: CAPTAIN, okey: "capt" }, wx, wy, wz, { side: false, mirror: false }, fo, {}));
    deckBlob(out, lx, 8.0, lz, heel, 1.1);
    if (blowing) for (let n = 0; n < 3; n++) {
      const age = ((t - WHISTLE) * 1.6 + n / 3) % 1;
      const [nx, ny, nz] = shipToWorld([lx + 0.3, 8.0 + 2.05 + 0.6 * age, lz + 0.25 + 0.35 * age], heel);
      out.fx.push({ key: `note${n % 2}`, cw: 220, ch: 260, draw: (p) => fxNote(p, n % 2), x: nx, y: ny, z: nz, w: 0.3, h: 0.35, rot: 0.3 * Math.sin(age * 6 + n) });
    }
  }
  // the vice admiral in the waist on the quay side: sweats through the test, sighs on "叹了口气", glances at the chair
  {
    const lx = -6.0, lz = -3.35, [wx, wy, wz] = shipToWorld([lx, 5.5, lz], heel);
    const sigh = t > 21.45 && t < 22.35;
    const expr: Expr = t < 18.6 ? "stern" : sigh ? "sigh" : "nervous";
    const look = t > 22.4 && t < 24.0 ? -1 : 0;
    const fo: FrontOpts = { mode: "stand", expr, blink: lidAt(t, 91), look, facing: 1 };
    out.places.push(person(cam, { i: 91, o: ADMIRAL, okey: "adm" }, wx, wy, wz, { side: false, mirror: false }, fo, {}));
    deckBlob(out, lx, 5.5, lz, heel, 1.1);
    if (sigh) {
      const u = (t - 21.45) / 0.9;
      const [px, py, pz] = shipToWorld([lx + 0.25 + 0.4 * u, 5.5 + 1.62 + 0.1 * u, lz + 0.35], heel);
      out.fx.push({ key: `puff${q(u, 20)}`, cw: 300, ch: 300, draw: (p) => fxPuff(p, q(u, 20)), x: px, y: py, z: pz, w: 0.5 + 0.4 * u, h: 0.5 + 0.4 * u, soft: true });
    }
  }
  // hull creaks on the big rolls
  if (Math.abs(heel) > 0.15) for (let k = 0; k < 2; k++) {
    const u = q((t * 1.3 + k * 0.5) % 1, 30), lx = -2 + k * 6;
    const [cx, cy, cz] = shipToWorld([lx, 7.2, (heel > 0 ? 1 : -1) * (halfW(lx, 6.7) + 0.2)], heel);
    out.fx.push({ key: `creak${u}`, cw: 300, ch: 300, draw: (p) => fxCreak(p, u), x: cx, y: cy, z: cz, w: 1.1, h: 1.1, rot: k * 0.6 - 0.3 });
  }
};

/** launch day: crew and families on deck waving, the town packed along the quay */
const launchCrowd = (cam: CamInfo, t: number, out: Stage) => {
  for (let i = 0; i < 18; i++) {
    const x = LANES[i % 10] + (hh(i, 31) - 0.5) * 0.6, row = Math.floor(i / 10);
    const z = (row ? -1 : 1) * (halfW(x, 5.5) - 1.0 - hh(i, 32) * 1.4);
    const [wx, wy, wz] = shipToWorld([x, 5.5, z], 0);
    const fam = i % 6 === 5, o = fam ? FOLK[(i >> 1) % 6] : SAILOR[i % 6];
    const fo: FrontOpts = { mode: "stand", expr: (["grin", "smile", "laugh"] as Expr[])[i % 3], blink: lidAt(t, i + 50), wave: i % 2 ? q(Math.sin(t * 9 + i * 1.3), 30) : undefined };
    out.places.push(person(cam, { i: i + 50, o, okey: fam ? `f${(i >> 1) % 6}` : `sl${i % 6}` }, wx, wy, wz, { side: false, mirror: false }, fo, {}));
    deckBlob(out, x, 5.5, z, 0);
  }
  for (let i = 0; i < 84; i++) {
    const x = -20 + (i % 28) * 1.45 + (hh(i, 41) - 0.5) * 0.7, z = -31.1 - Math.floor(i / 28) * 1.55 - hh(i, 42) * 1.0;
    const cheer = Math.sin(t * 2.4 + i) > 0.2, hop = cheer && i % 3 === 0 ? Math.max(0, Math.sin(t * 7 + i)) * 0.15 : 0;
    const fo: FrontOpts = { mode: "stand", expr: (["smile", "grin", "laugh", "smile_closed"] as Expr[])[i % 4], blink: lidAt(t, i + 120),
      wave: cheer && i % 2 ? q(Math.sin(t * 9 + i * 1.3), 30) : undefined };
    out.places.push(person(cam, { i: i + 120, o: FOLK[i % 6], okey: `f${i % 6}` }, x, D0 + hop, z, { side: false, mirror: false }, fo, {}));
    blob(out, x, D0, z, 1, hop > 0 ? 0.6 : 1);
  }
};

// ---------------- the rest of the film's cast ----------------
const KING: Outfit = { jacket: "#8a1f2b", pants: "#3a2a2a", boots: "#1e1714", hat: "crown", cap: "#e3b84a", buttons: "#e8c45a", sash: "#2f5fb0", moustache: "#c8a060", build: "stout" };
const BUILDER: Outfit = { jacket: "#6b4a2f", pants: "#4a3a2a", boots: "#2e241e", hat: "wide", cap: "#5a4632", dress: "#9a6a3a", moustache: "#5a3a22", skin: SKINS[1] };
const CONTRACTOR: Outfit = { jacket: "#3d5a3a", pants: "#2e3a2e", boots: "#1e1714", hat: "wide", cap: "#2a2a22", buttons: "#d9a93a", build: "stout", moustache: "#2a1a12" };
const FONT = "'WenQuanYi Zen Hei', 'Noto Sans CJK SC', sans-serif";
const INKC = "#1b1216", PAPER = "#f4e9cf", PAPER2 = "#e6d6b2", SEAL = "#b8282c";

/** gust lines on a 600 x 300 canvas */
const fxWind = (p: Pen, t: number) => {
  const g = p.g;
  g.lineCap = "round";
  for (let k = 0; k < 4; k++) {
    const y = 60 + k * 60, x0 = 40 + ((k * 97) % 120), len = 300 + (k % 2) * 140, a = Math.sin(Math.PI * t);
    g.strokeStyle = `rgba(255,255,255,${(0.85 * a).toFixed(3)})`; g.lineWidth = 10 - k;
    g.beginPath(); g.moveTo(x0, y); g.bezierCurveTo(x0 + len * 0.4, y - 30, x0 + len * 0.7, y + 25, x0 + len, y - 5);
    if (k % 2 === 0) g.arc(x0 + len + 18, y - 25, 22, Math.PI / 2, Math.PI * 2.1);
    g.stroke();
  }
};
/** the king's order on a 1000 x 700 canvas: parchment unrolled by u, a big "72" and rows of little cannons, red seal */
const fxOrder = (p: Pen, u: number) => {
  const g = p.g, w = 900 * Math.max(0.08, u), x0 = 500 - w / 2;
  g.fillStyle = PAPER; g.fillRect(x0, 90, w, 520); g.strokeStyle = INKC; g.lineWidth = 8; g.strokeRect(x0, 90, w, 520);
  for (const x of [x0, x0 + w]) { p.ell(x, 350, 34, 290, PAPER2, 8); }
  if (u > 0.55) {
    g.save(); g.beginPath(); g.rect(x0 + 20, 95, w - 40, 510); g.clip();
    g.fillStyle = SEAL; g.font = `900 300px ${FONT}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("72", 500, 290);
    g.lineWidth = 10; g.strokeStyle = INKC; g.strokeText("72", 500, 290);
    for (let r = 0; r < 2; r++) for (let i = 0; i < 9; i++) {
      const x = 160 + i * 85, y = 470 + r * 60;
      p.band([[x - 26, y], [x + 26, y - 6]], "#3a3d47", 16, 4, "round"); p.ell(x - 16, y + 10, 12, 12, "#7a4b2a", 4);
    }
    g.restore();
    p.ell(810, 540, 56, 56, SEAL, 6); p.ell(810, 540, 30, 30, "#d8484a", 0);
  }
};
/** the inquiry letter on an 800 x 1060 canvas: "严查" in big ink, a small heading, the red royal seal */
const fxLetter = (p: Pen, u: number) => {
  const g = p.g, h = 960 * Math.max(0.08, u), y0 = 50;
  g.fillStyle = PAPER; g.fillRect(60, y0, 680, h); g.strokeStyle = INKC; g.lineWidth = 9; g.strokeRect(60, y0, 680, h);
  p.ell(400, y0, 360, 30, PAPER2, 8); p.ell(400, y0 + h, 360, 30, PAPER2, 8);
  if (u > 0.6) {
    g.save(); g.beginPath(); g.rect(64, y0 + 30, 672, h - 60); g.clip();
    g.fillStyle = INKC; g.textAlign = "center"; g.textBaseline = "middle";
    g.font = `900 104px ${FONT}`; g.fillText("国王令", 400, 165);
    g.fillRect(180, 250, 440, 6);
    g.font = `900 260px ${FONT}`; g.fillText("严", 400, 450); g.fillText("查", 400, 720);
    g.restore();
    p.ell(590, 900, 70, 70, SEAL, 7); p.ell(590, 900, 40, 40, "#d8484a", 0);
    g.fillStyle = "#f6e1c0"; g.font = `900 52px ${FONT}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("王", 590, 902);
  }
};
/** the dead designer's small portrait on a 500 x 640 canvas: gilded frame, a man with a ruff collar, black mourning ribbon */
const fxPortrait = (p: Pen) => {
  const g = p.g;
  g.fillStyle = "#d9a93a"; g.fillRect(10, 10, 480, 620); g.strokeStyle = INKC; g.lineWidth = 8; g.strokeRect(10, 10, 480, 620);
  g.fillStyle = "#3a4a3e"; g.fillRect(60, 60, 380, 520); g.strokeRect(60, 60, 380, 520);
  p.ell(250, 520, 150, 110, "#2a2420", 7); // shoulders
  for (let i = 0; i < 12; i++) p.ell(250 + Math.cos((i / 12) * Math.PI * 2) * 70, 410 + Math.sin((i / 12) * Math.PI * 2) * 22, 30, 18, "#f6f1e6", 4); // ruff
  p.ell(250, 300, 95, 105, "#f0c9a5", 7);
  for (const s of [-1, 1]) p.ell(250 + s * 34, 290, 8, 11, INKC, 0);
  p.arc(250, 345, 22, 8, 20, 160, 6); p.ell(250, 210, 100, 40, "#5a3a22", 6, 180, 360); // hair
  g.save(); g.translate(400, 100); g.rotate(Math.PI / 4); g.fillStyle = "#111"; g.fillRect(-160, -26, 320, 52); g.restore();
};
/** the Vasa cut in half, seen from the bow, on a 1200 x 1900 canvas. a = "大炮雕像全在上面" highlight, b = "又窄又浅" highlight */
const fxCutaway = (p: Pen, a: number, b: number) => {
  const g = p.g, cx = 600, WL = 1250;
  g.fillStyle = PAPER; g.fillRect(0, 0, 1200, 1900);
  g.strokeStyle = "#cbb790"; g.lineWidth = 3; for (let y = 80; y < 1900; y += 70) { g.beginPath(); g.moveTo(40, y); g.lineTo(1160, y); g.stroke(); }
  // water
  g.fillStyle = "rgba(90,160,220,0.35)"; g.fillRect(0, WL, 1200, 650);
  // hull section (half widths by height): narrow, shallow bottom; wide gun decks; tall upper works
  const half: [number, number][] = [[1520, 60], [1450, 200], [1360, 270], [WL, 320], [1100, 390], [900, 400], [700, 370], [520, 320], [420, 300]];
  const L = half.map(([y, w]) => [cx - w, y] as [number, number]), Rt = half.map(([y, w]) => [cx + w, y] as [number, number]).reverse();
  p.poly([...L, ...Rt], "#8a5a34", 10);
  // underwater part: hatched blue, the narrow and shallow bit
  g.save(); g.beginPath(); L.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); Rt.forEach(([x, y]) => g.lineTo(x, y)); g.closePath(); g.clip();
  g.fillStyle = `rgba(40,110,200,${(0.25 + 0.45 * b).toFixed(3)})`; g.fillRect(0, WL, 1200, 400);
  g.restore();
  // decks and guns
  for (const [y, n] of [[1060, 3], [860, 3]] as const) {
    g.fillStyle = "#5a3820"; g.fillRect(cx - 380, y, 760, 16);
    for (const s of [-1, 1]) for (let i = 0; i < n; i++) {
      const x = cx + s * (330 - i * 70);
      const hot = a > 0;
      p.band([[x, y - 34], [x + s * 90, y - 40]], hot ? "#e0742a" : "#3a3d47", 34, 6, "round");
      p.ell(x - s * 20, y - 14, 22, 22, "#7a4b2a", 5);
      if (hot && a > 0.1) { g.fillStyle = `rgba(255,170,60,${(0.35 * a).toFixed(3)})`; g.beginPath(); g.arc(x + s * 30, y - 36, 70, 0, 7); g.fill(); }
    }
  }
  // carvings on the top: little gold statues
  for (let i = 0; i < 6; i++) {
    const x = cx - 270 + i * 108, y = 400;
    p.ell(x, y - 70, 24, 26, a > 0 ? "#ffcf4a" : "#d9a93a", 5); p.poly([[x - 26, y - 44], [x + 26, y - 44], [x + 32, y], [x - 32, y]], a > 0 ? "#ffcf4a" : "#d9a93a", 5);
  }
  // mast
  g.fillStyle = "#7a4b2a"; g.fillRect(cx - 18, 0, 36, 420); g.strokeStyle = INKC; g.lineWidth = 6; g.strokeRect(cx - 18, -10, 36, 430);
  // waterline
  g.strokeStyle = "#1f5fa8"; g.lineWidth = 8; g.setLineDash([30, 18]); g.beginPath(); g.moveTo(40, WL); g.lineTo(1160, WL); g.stroke(); g.setLineDash([]);
  // a = weight arrows pointing down on the top, labels
  g.textAlign = "center"; g.textBaseline = "middle";
  if (a > 0) {
    g.globalAlpha = Math.min(1, a * 1.5);
    for (const x of [cx - 280, cx + 280]) { p.band([[x, 140], [x, 260]], "#c0262c", 26, 6); p.poly([[x - 50, 250], [x + 50, 250], [x, 320]], "#c0262c", 6); }
    g.fillStyle = INKC; g.font = `900 92px ${FONT}`; g.fillText("大炮", cx - 280, 90); g.fillText("雕像", cx + 280, 90);
    g.globalAlpha = 1;
  }
  // b = width and depth arrows for the underwater hull
  if (b > 0) {
    g.globalAlpha = Math.min(1, b * 1.5);
    const y = WL + 60;
    p.band([[cx - 300, y], [cx + 300, y]], INKC, 10, 0);
    p.poly([[cx - 320, y], [cx - 280, y - 26], [cx - 280, y + 26]], INKC, 0); p.poly([[cx + 320, y], [cx + 280, y - 26], [cx + 280, y + 26]], INKC, 0);
    p.band([[cx + 430, WL], [cx + 430, 1520]], INKC, 10, 0);
    p.poly([[cx + 430, WL - 18], [cx + 404, WL + 22], [cx + 456, WL + 22]], INKC, 0); p.poly([[cx + 430, 1538], [cx + 404, 1498], [cx + 456, 1498]], INKC, 0);
    g.fillStyle = "#c0262c"; g.font = `900 120px ${FONT}`; g.fillText("窄", cx, WL + 180); g.fillText("浅", cx + 530, 1400);
    g.globalAlpha = 1;
  }
  // centre of gravity: high
  const gy = 800;
  p.ell(cx, gy, 46, 46, "#fbf4e2", 8);
  g.fillStyle = INKC; g.beginPath(); g.moveTo(cx, gy); g.arc(cx, gy, 46, 0, Math.PI / 2); g.lineTo(cx, gy); g.fill();
  g.beginPath(); g.moveTo(cx, gy); g.arc(cx, gy, 46, Math.PI, Math.PI * 1.5); g.lineTo(cx, gy); g.fill();
  g.fillStyle = INKC; g.font = `900 64px ${FONT}`; g.fillText("重心", cx, gy + 100);
};
/** "heavy" arrow on a 400 x 600 canvas: a down arrow and the word 重 */
const fxHeavy = (p: Pen, a: number) => {
  const g = p.g;
  g.globalAlpha = a;
  p.band([[200, 160], [200, 420]], "#c0262c", 50, 9); p.poly([[110, 410], [290, 410], [200, 560]], "#c0262c", 9);
  g.fillStyle = "#fbf4e2"; g.strokeStyle = INKC; g.lineWidth = 12; g.font = `900 140px ${FONT}`; g.textAlign = "center"; g.textBaseline = "middle";
  g.strokeText("重", 200, 80); g.fillText("重", 200, 80);
  g.globalAlpha = 1;
};
/** flick lines on a 400 x 300 canvas */
const fxSwoosh = (p: Pen, t: number) => {
  const g = p.g, a = 1 - t;
  g.lineCap = "round";
  for (let k = 0; k < 3; k++) { g.strokeStyle = `rgba(255,250,235,${a.toFixed(3)})`; g.lineWidth = 14 - k * 3; g.beginPath(); g.arc(60, 150, 120 + k * 40, -0.6, 0.6); g.stroke(); }
};
/** v3 (owner: "topside up for better recognition"): an officer's wide felt hat floating crown up, seen from the
 *  shot's high three-quarter angle, on a 500 x 400 canvas; the brim's centre line is at y = 285 (the waterline) */
const fxHat = (p: Pen) => {
  const felt = "#2a2220", rim = "#3b302a";
  // plume first (behind the crown), sweeping back to the left
  const pl: [number, number][] = [];
  for (let i = 0; i <= 14; i++) { const u = i / 14; pl.push([300 - 250 * u, 150 - 110 * Math.sin(Math.PI * u * 0.8) + 40 * u * u]); }
  for (let i = 14; i >= 0; i--) { const u = i / 14; pl.push([300 - 230 * u, 180 - 70 * Math.sin(Math.PI * u * 0.8) + 45 * u * u]); }
  p.poly(pl, "#f1ece0", 7);
  for (let k = 1; k <= 4; k++) p.stroke([[290 - 40 * k, 160 - 14 * k], [270 - 40 * k, 120 - 4 * k]], 4, "#cfc6b4");
  p.ell(250, 285, 228, 80, rim, 9); // brim
  p.ell(250, 278, 200, 62, "#241c19", 0); // its shadowed top round the crown
  const dome: [number, number][] = [];
  for (let i = 0; i <= 24; i++) { const th = (Math.PI * i) / 24; dome.push([250 + 112 * Math.cos(th) * (1 - 0.12 * Math.sin(th)), 282 - 170 * Math.sin(th) ** 0.7]); }
  for (let i = 0; i <= 12; i++) { const th = Math.PI + (Math.PI * i) / 12; dome.push([250 + 112 * Math.cos(th), 282 - 22 * Math.sin(th)]); }
  p.poly(dome, felt, 9);
  p.clip(dome, () => { p.band([[120, 252], [380, 252]], "#d9a93a", 26, 4); p.ell(205, 170, 30, 70, "rgba(255,255,255,0.10)", 0); });
  p.poly(dome, null, 9);
};

/** launch day under way: crew and families on deck waving (hidden once she heels far) */
const sailCrowd = (cam: CamInfo, t: number, P: Pose, key: string, out: Stage) => {
  if (Math.abs(P.heel) < 0.3 && P.y > -0.4) for (let i = 0; i < 18; i++) {
    const x = LANES[i % 10] + (hh(i, 31) - 0.5) * 0.6, row = Math.floor(i / 10);
    const z = (row ? -1 : 1) * (halfW(x, 5.5) - 1.0 - hh(i, 32) * 1.4);
    const [wx, wy, wz] = shipToWorld([x, 5.5, z], P);
    const fam = i % 6 === 5, o = fam ? FOLK[(i >> 1) % 6] : SAILOR[i % 6];
    const worried = P.heel > 0.12;
    const fo: FrontOpts = { mode: "stand", expr: worried ? (i % 2 ? "nervous" : "shock") : (["grin", "smile", "laugh"] as Expr[])[i % 3], blink: lidAt(t, i + 50),
      wave: !worried && i % 2 ? q(Math.sin(t * 9 + i * 1.3), 30) : undefined };
    const pl = person(cam, { i: i + 50, o, okey: fam ? `f${(i >> 1) % 6}` : `sl${i % 6}` }, wx, wy, wz, { side: false, mirror: false }, fo, {});
    pl.roll = -P.heel * 0.6;
    out.places.push(pl);
  }
  // gusts: white wind lines blowing across from the quay side
  if (key === "s4_glide") for (const [g0, n] of [[GUST1, 3], [GUST2, 4]] as const) {
    const u = (t - g0) / 1.4;
    if (u > 0 && u < 1) for (let k = 0; k < n; k++) {
      const uu = clamp01(u * 1.2 - k * 0.07);
      out.fx.push({ key: `wind${q(uu, 24)}`, cw: 600, ch: 300, draw: (p) => fxWind(p, q(uu, 24)), x: P.x + 8 - k * 7, y: 9 + k * 4.5, z: P.z - 10 + 26 * uu, w: 9, h: 4.5, rot: -0.1 });
    }
  }
  // water pours in through the lower ports that reach the waterline (river side)
  if (key === "s4_ports" || key === "s4_glide" || key === "s1_aerial") for (const [i, px] of [-13.8, -11.3, -8.8, -6.3, -3.8, -1.3, 1.2, 3.7, 6.2, 8.7, 11.2].entries()) {
    const [x, y, z] = shipToWorld([px, 1.55, halfW(px, 1.55) + 0.1], P);
    if (y < 0.45 && y > -0.9) {
      const ph = q((t * 1.8 + i * 0.37) % 1, 20);
      out.fx.push({ key: `splash${ph}`, cw: 800, ch: 800, draw: (p) => fxSplash(p, ph), x, y: 0.25, z: z + 0.2, w: 1.6, h: 1.6 });
    }
  }
  // sinking: the hull pushes up spray all along the waterline
  if (P.y < -0.6 && P.y > -16) for (let k = 0; k < 6; k++) {
    const ph = q((t * 1.3 + k * 0.29) % 1, 20), x = P.x - 15 + k * 6;
    out.fx.push({ key: `splash${ph}`, cw: 800, ch: 800, draw: (p) => fxSplash(p, ph), x, y: 0.3, z: P.z + 5.5, w: 5, h: 5 });
  }
};

/** S1: the captain and the admiral at the quay, before the test: "...船上的人就知道它会翻" */
const officers = (cam: CamInfo, t: number, out: Stage) => {
  const glance = t > 7.5 && t < 8.35, gulp = t >= 8.35;
  const ex: Expr = gulp ? "pained" : glance ? "nervous" : "stern";
  const C = shipToWorld([-6.3, 5.5, -2.0], AT_QUAY), A = shipToWorld([-5.6, 5.5, -2.5], AT_QUAY);
  out.places.push(person(cam, { i: 90, o: CAPTAIN, okey: "capt" }, C[0], C[1], C[2], { side: false, mirror: false },
    { mode: "stand", expr: ex, blink: lidAt(t, 90, [7.5, 8.35]), look: glance ? 1 : 0, facing: glance ? 1 : 0 }, {}));
  out.places.push(person(cam, { i: 91, o: ADMIRAL, okey: "adm" }, A[0], A[1], A[2], { side: false, mirror: false },
    { mode: "stand", expr: ex, blink: lidAt(t, 91, [7.5, 8.35]), look: glance ? -1 : 0, facing: glance ? -1 : 0 }, {}));
  deckBlob(out, -6.3, 5.5, -2.0, 0, 1.1); deckBlob(out, -5.6, 5.5, -2.5, 0, 1.1);
  for (const [i, lx, lz] of [[3, -7.7, -4.3], [7, -6.6, -4.7], [11, -8.6, -3.5], [14, -5.4, -4.9], [18, -9.3, -4.6]] as const) {
    const [x, y, z] = shipToWorld([lx, 5.5, lz], AT_QUAY);
    out.places.push(person(cam, { i, o: SAILOR[i % 6], okey: `sl${i % 6}` }, x, y, z, { side: false, mirror: false },
      { mode: "stand", expr: t > 7.9 ? "nervous" : "neutral", blink: lidAt(t, i), look: t > 7.9 ? (i % 2 ? 1 : -1) : 0 }, {}));
    deckBlob(out, lx, 5.5, lz, 0);
  }
};

/** S2: the king leans out of his portrait and slaps down the order for 72 guns */
const KING_POS: V3 = [0, 1.32, -6.5];
const kingShot = (cam: CamInfo, t: number, out: Stage) => {
  const lean = smooth((t - 9.5) / 0.7), slap = t > 10.4 && t < 11.0;
  const expr: Expr = t < 10.9 ? "stern" : "grin";
  const pl = person(cam, { i: 95, o: KING, okey: "king" }, KING_POS[0], KING_POS[1], KING_POS[2] + 0.25 * lean, { side: false, mirror: false },
    { mode: "stand", expr, blink: lidAt(t, 95, [10.9]), wave: slap ? q(Math.sin((t - 10.4) * 30), 10) : undefined, headTilt: -6 * lean }, {}, 1 + 0.05 * lean);
  out.places.push(pl);
  const u = smooth((t - 10.45) / 0.35);
  if (u > 0) out.fx.push({ key: `order${q(u, 20)}`, cw: 1000, ch: 700, draw: (p) => fxOrder(p, q(u, 20)), x: 0.05, y: NICHE.y0 - 0.12, z: NICHE.z + 0.5, w: 1.2, h: 0.84, rot: -0.04 });
};

/** still water after the sink: one floating hat, rings, a few planks */
const afterSink = (t: number, out: Stage) => {
  const [hx, , hz] = HAT, bob = 0.02 * Math.sin(t * 2.2);
  // a billboard tilted with the camera: the brim's centre sits on the water, the rest of the brim below it is hidden by the water
  out.fx.push({ key: "hat34", cw: 500, ch: 400, draw: fxHat, x: hx, y: 0.13 + bob, z: hz, w: 0.85, h: 0.68, rot: 0.06 * Math.sin(t * 1.3) });
  for (let k = 0; k < 2; k++) {
    const u = q(((t * 0.35 + k * 0.5) % 1), 30);
    out.fx.push({ key: `ring${u}`, cw: 600, ch: 600, draw: (p) => fxRing(p, u), x: hx, y: 0.03, z: hz, w: 2.6, h: 2.6, flat: true });
  }
  for (const [dx, dz, r] of [[-2.2, -1.6, 0.4], [1.9, -2.6, -0.7], [-0.6, -3.8, 1.2]] as const)
    out.fx.push({ key: "plank", cw: 320, ch: 110, draw: fxPlank, x: hx + dx + 0.1 * t, y: 0.04, z: hz + dz, w: 1.3, h: 0.45, flat: true, rot: r + 0.02 * t });
};

/** S5: the toy beats (it is a mesh in world.ts): flick lines, the "heavy" arrow, the ship cutaway card, the clack */
const toyFx = (key: string, t: number, out: Stage) => {
  if (key === "s5_toy") {
    for (const t0 of [43.3, 44.75]) { const u = (t - t0) / 0.35; if (u > 0 && u < 1) out.fx.push({ key: `swoosh${q(u, 12)}`, cw: 400, ch: 300, draw: (p) => fxSwoosh(p, q(u, 12)), x: -0.1, y: 0.11, z: 0.02, w: 0.1, h: 0.075 }); }
    const a = clamp01((t - 45.7) / 0.3);
    if (a > 0) out.fx.push({ key: `heavy${q(a, 10)}`, cw: 400, ch: 600, draw: (p) => fxHeavy(p, q(a, 10)), x: 0.1, y: 0.07, z: 0.03, w: 0.05, h: 0.075 });
  } else if (key === "s5_cut") {
    const a = clamp01((t - 48.85) / 0.4), b = clamp01((t - 50.25) / 0.4);
    out.fx.push({ key: `cut${q(a, 10)}|${q(b, 10)}`, cw: 1200, ch: 1900, draw: (p) => fxCutaway(p, q(a, 10), q(b, 10)), x: 0.55, y: 0.135, z: 0.0, w: 0.146, h: 0.231 });
  } else if (key === "s5_flip") {
    const land = toyLandT(), u = (t - land) / 0.3;
    if (u > 0 && u < 1) out.fx.push({ key: `burst${q(u, 30)}`, cw: 500, ch: 500, draw: (p) => fxBurst(p, q(u, 30)), x: 0.13, y: 0.02, z: 0.03, w: 0.12, h: 0.12 });
  }
};

/** S6: the inquiry in the palace hall */
const standAt = (cam: CamInfo, out: Stage, i: number, o: Outfit, okey: string, x: number, z: number, fo: FrontOpts, mirror = false) => {
  const pl = person(cam, { i, o, okey }, x, 0, z, { side: false, mirror: false }, fo, {});
  if (mirror) pl.mirror = true;
  out.places.push(pl);
  blob(out, x, 0, z, 1.0);
};
const inquiry = (cam: CamInfo, key: string, t: number, out: Stage) => {
  // the king, now just his portrait in the niche (still)
  const kingExpr: Expr = key === "s6_builder" && t > 58.3 ? "shock" : "stern";
  out.places.push(person(cam, { i: 95, o: KING, okey: "king" }, KING_POS[0], KING_POS[1], KING_POS[2], { side: false, mirror: false },
    { mode: "stand", expr: kingExpr, blink: 0 }, {}));
  if (key === "s6_letter") {
    const u = smooth((t - 54.65) / 0.4);
    // v3: the order beside the king in his niche (both readable, clear of the subtitles)
    out.fx.push({ key: `letter${q(u, 20)}`, cw: 800, ch: 1060, draw: (p) => fxLetter(p, q(u, 20)), x: -0.26, y: 1.75, z: -1.1, w: 0.453, h: 0.6 });
    return;
  }
  if (key === "s6_chair") {
    out.fx.push({ key: "designer", cw: 500, ch: 640, draw: fxPortrait, x: DESIGNER_CHAIR[0], y: 0.82, z: DESIGNER_CHAIR[2] + 0.02, w: 0.46, h: 0.59 });
    return;
  }
  if (key === "s6_builder") {
    const pt = t > 56.9;
    standAt(cam, out, 96, BUILDER, "bld", 1.5, -1.0, { mode: "stand", expr: pt ? "smile" : "nervous", blink: lidAt(t, 96, [56.9]), point: pt ? 35 : undefined }, true);
    standAt(cam, out, 90, CAPTAIN, "capt", -1.3, -1.5, { mode: "stand", expr: "nervous", blink: lidAt(t, 90), look: 1 });
    standAt(cam, out, 91, ADMIRAL, "adm", -2.2, -1.1, { mode: "stand", expr: "nervous", blink: lidAt(t, 91), look: 1 });
    standAt(cam, out, 97, CONTRACTOR, "ctr", 0.4, -1.7, { mode: "stand", expr: "stern", blink: lidAt(t, 97) });
    return;
  }
  if (key === "s6_up") {
    const up = (d: number) => smooth((t - 62.45 - d) / 0.35);
    standAt(cam, out, 97, CONTRACTOR, "ctr", 0.6, -1.2, { mode: "stand", expr: t > 61.9 ? "smile" : "stern", blink: lidAt(t, 97), point: t > 61.95 ? 88 : undefined, lookUp: up(0) });
    standAt(cam, out, 90, CAPTAIN, "capt", -1.6, -1.5, { mode: "stand", expr: "nervous", blink: lidAt(t, 90), lookUp: q(up(0.15), 10), headTilt: -4 * up(0.15) });
    standAt(cam, out, 91, ADMIRAL, "adm", -0.55, -1.75, { mode: "stand", expr: "neutral", blink: lidAt(t, 91), lookUp: q(up(0.3), 10), headTilt: 4 * up(0.3) });
    standAt(cam, out, 96, BUILDER, "bld", 1.75, -1.6, { mode: "stand", expr: "nervous", blink: lidAt(t, 96), lookUp: q(up(0.45), 10), headTilt: -3 * up(0.45) });
    return;
  }
  if (key === "s6_promo") {
    const who: [number, Outfit, string, number][] = [[96, BUILDER, "bld", -1.17], [97, CONTRACTOR, "ctr", -0.39], [90, CAPTAIN, "capt", 0.39], [91, ADMIRAL, "adm", 1.17]];
    who.forEach(([i, o, okey, x], n) => {
      const tp = 67.95 + n * 0.35, u = (t - tp) / 0.3;
      const k = u <= 0 ? 1 : u >= 1 ? 1.75 : 1 + 0.75 * (u * u * (3 - 2 * u)) + 0.25 * Math.sin(Math.PI * u);
      const relief = t > 66.55;
      const expr: Expr = u > 0 ? "grin" : relief ? "relief" : "nervous";
      const o2: Outfit = u > 0 ? { ...o, hat: "wide", hatK: q(k, 20), medal: true, hatMax: 1.85 } : { ...o, hat: "wide", hatMax: 1.85 };
      standAt(cam, out, i, o2, `${okey}${u > 0 ? "P" : ""}`, x, -1.4 - (n % 2) * 0.25, { mode: "stand", expr, blink: lidAt(t, i, [66.55, tp]) });
      if (u > 0 && u < 1) out.fx.push({ key: `burstG${q(u, 30)}`, cw: 500, ch: 500, draw: (p) => fxBurst(p, q(u, 30), "#ffe27a"), x, y: 2.05, z: -1.3, w: 0.9, h: 0.9 });
    });
  }
};

/** everything with a face in shot id at voice time t; P = where the ship is */
export const stage = (id: number, t: number, P: Pose, cam: CamInfo): Stage => {
  const out: Stage = { places: [], fx: [] };
  const s = SHOTS[id - 1];
  LNAME = s.light;
  findSun(cam, SUN);
  const tt = storyT(s, t);
  switch (s.crowd) {
    case "test": testCrew(cam, t, P.heel, out); break;
    case "freeze": testCrew(cam, tt, P.heel, out); break;
    case "launch": launchCrowd(cam, t, out); break;
    case "sail": sailCrowd(cam, tt, P, s.key, out); break;
    case "officers": officers(cam, t, out); break;
    case "king": kingShot(cam, t, out); break;
    case "toy": toyFx(s.key, t, out); break;
    case "inquiry": inquiry(cam, s.key, t, out); break;
    case "empty": if (s.key === "s4_hat") afterSink(t, out); break;
  }
  return out;
};
export { FPS };
