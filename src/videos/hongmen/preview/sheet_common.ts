// Preview harness of the cast sheets of the Hongmen film (a copy of arthur/preview/common.ts with the font default fixed;
// the engine's own harness is preview/common.ts): one page renders one still or a run of frames through a post chain close to
// the film's (N8AO -> InkPass -> NEUTRAL tone mapping; the film adds lens blur, bloom and the grade on top).
//   node scripts/rig3d/render.mjs src/videos/hongmen/preview/<entry>.ts out.png [--size 540x960] [--opts '<json>']
//   node scripts/rig3d/render.mjs src/videos/hongmen/preview/<entry>.ts outdir --pick 0,15,30 [--size ..] [--opts ..]
// --opts is merged over the entry's own options (objects merge key by key). Options every entry understands:
//   w, h      size in px (default 540 x 960; the film is 1080 x 1920)
//   f         the frame of a still (default 0);  fps (default 30): t = f / fps
//   cam       { pos, look, fov, near? } instead of the entry's camera
//   ink       false = no ink outlines;  ao: false = no ambient occlusion;  raw: true = no post at all
//   oldInk    true = the OLD outline pass (vasa/ink.ts) instead of the stable one (fx/ink.ts);  inkSamples 8 | 4 | 1
// An entry:
//   import { preview } from "./sheet_common";
//   preview({ w: 540, h: 960 }, (c) => {
//     const M = c.mats(MY_FILL);                      // bt/pbr mats with this env fill
//     ... build things, c.scene.add(...)
//     return { cam: { pos: [0, 1.3, 5], look: [0, 0.9, 0], fov: 50 }, frame: (i, t) => { ...pose; rc.update(c.camera, c.h); } };
//   });
// frame(i, t) runs after the camera of frame i is applied (so RigCast.update and hand positions see the right camera).
import * as THREE from "three";
import { EffectComposer, RenderPass, EffectPass, ToneMappingEffect, ToneMappingMode } from "postprocessing";
import { N8AOPostPass } from "n8ao";
import { makeEnv, mats, LIGHTS, ENV_FILL, type EnvSpec, type Mats } from "../../bt/pbr";
import { InkPass, NOINK, noInkFallback } from "../fx/ink";             // the stable outline pass (fx/README.md)
import { InkPass as OldInkPass } from "../../vasa/ink";               // --opts '{"oldInk":true}': the old pass, for comparison
import { softRim } from "../fx/rim";

export type V3 = [number, number, number];
export type Cam = { pos: V3; look: V3; fov: number; near?: number; far?: number };
export type AO = { aoRadius: number; distanceFalloff: number; intensity: number; color: string };
export type Ctx = {
  renderer: THREE.WebGLRenderer; scene: THREE.Scene; camera: THREE.PerspectiveCamera; w: number; h: number;
  /** bt/pbr materials: metals on the studio matcap, wood / paint on this fill (default: the pbr default fill) */
  mats: (fill?: EnvSpec) => Mats;
  /** the merged options (the entry's own + --opts) */
  opts: Record<string, any>;
};
export type Built = {
  cam: Cam | ((i: number, t: number) => Cam);
  frame?: (i: number, t: number) => void;
  ao?: AO; bg?: string;
};

const merge = (a: any, b: any): any => {
  if (!a || !b || typeof a !== "object" || typeof b !== "object" || Array.isArray(a) || Array.isArray(b)) return b;
  const r = { ...a };
  for (const k of Object.keys(b)) r[k] = merge(a[k], b[k]);
  return r;
};

/** the film's font (Noto Sans SC Bold as "FrSans") for canvas text in previews: the film itself waits for it
 *  (group/kit/phone loadOverlayFonts) before the world is built, so text drawn into textures at build time is safe */
const loadFont = async (path: string) => {
  try {
    const ff = new FontFace("FrSans", `url(file://${path})`, { weight: "700" });
    await ff.load(); (document.fonts as any).add(ff);
  } catch (e) { console.log("QA: preview font not loaded (" + (e as Error).message + "), falling back to the system CJK font"); }
};

export function preview(own: Record<string, any>, build: (c: Ctx) => Built) {
  const hash = typeof location !== "undefined" ? decodeURIComponent(location.hash.slice(1)) : "";
  const o = hash ? merge(own, JSON.parse(hash)) : own;
  loadFont(o.font ?? "/home/user/jayjiao-debug/video/public/bt/sans700.ttf").then(() => run(o, build));
}

function run(o: Record<string, any>, build: (c: Ctx) => Built) {
  const w: number = o.w ?? 540, h: number = o.h ?? 960, fps: number = o.fps ?? 30;
  try {
    const renderer = new THREE.WebGLRenderer({ antialias: false, stencil: false, preserveDrawingBuffer: true });
    renderer.setSize(w, h); renderer.setPixelRatio(1);
    renderer.debug.onShaderError = (gl, program, vs, fs) => {
      const msg = [gl.getProgramInfoLog(program), gl.getShaderInfoLog(vs), gl.getShaderInfoLog(fs)].filter(Boolean).join(" | ").slice(0, 600);
      console.error("PREVIEW SHADER ERROR: " + msg);
      throw new Error("preview: a shader did not compile: " + msg);
    };
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = LIGHTS.shadow.type;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    document.body.style.margin = "0"; document.body.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, w / h, 0.03, 600);
    camera.layers.enable(NOINK);
    const studio = makeEnv(renderer);
    const ctx: Ctx = { renderer, scene, camera, w, h, opts: o, mats: (fill?: EnvSpec) => mats(studio, makeEnv(renderer, fill ?? ENV_FILL)) };
    const t0 = performance.now();
    const B = build(ctx);
    console.log(`QA: built in ${Math.round(performance.now() - t0)} ms`);
    scene.background = new THREE.Color(B.bg ?? "#bfe3f7");
    const comp = new EffectComposer(renderer, { frameBufferType: THREE.HalfFloatType, multisampling: 4, stencilBuffer: true });
    comp.addPass(new RenderPass(scene, camera));
    if (!o.raw && o.ao !== false) {
      const a = B.ao ?? { aoRadius: 0.55, distanceFalloff: 1.0, intensity: 2.2, color: "#2a1a10" };
      const n8 = new N8AOPostPass(scene, camera, w, h);
      n8.configuration.aoRadius = a.aoRadius; n8.configuration.intensity = a.intensity; n8.configuration.distanceFalloff = a.distanceFalloff;
      n8.configuration.color = new THREE.Color(a.color); n8.configuration.halfRes = false; n8.setQualityMode("High");
      comp.addPass(n8);
    }
    // ink: the stable pass, 8 sub-pixel samples as in the film; options: inkSamples 8 | 4 | 1, inkSkip false, inkGate "legacy", oldInk true
    if (!o.raw && o.ink !== false) comp.addPass(o.oldInk ? new OldInkPass(scene, camera) : new InkPass(scene, camera, { samples: o.inkSamples ?? 8, skipFlat: o.inkSkip !== false, gate: o.inkGate ?? "robust" }));
    comp.addPass(new EffectPass(camera, new ToneMappingEffect({ mode: ToneMappingMode.NEUTRAL })));
    const setCam = (k: Cam) => {
      camera.up.set(0, 1, 0); camera.position.set(...k.pos); camera.lookAt(...k.look); camera.fov = k.fov;
      camera.near = k.near ?? 0.03; camera.far = k.far ?? 600; camera.aspect = w / h; camera.updateProjectionMatrix(); camera.updateMatrixWorld(true);
    };
    const draw = (i: number) => {
      const t = i / fps;
      const own = typeof B.cam === "function" ? B.cam(i, t) : B.cam;
      setCam(o.cam ?? own);
      B.frame?.(i, t);
      softRim(scene);                                              // the film's rim light on every head (fx/rim.ts)
      noInkFallback(scene);
      comp.render();
    };
    (window as any).__frame = (i: number) => { draw(i); };
    draw(o.f ?? 0); draw(o.f ?? 0);
    (window as any).__ready = true; (window as any).__done = true;
  } catch (e) {
    console.error("PREVIEW FAILED: " + (e as Error).message + " | " + String((e as Error).stack).slice(0, 800));
    (window as any).__failed = true;
    throw e;
  }
}

// ===== what the cast sheets share: lights to judge the figures under, and a floor seat with its low table =====
import { LAB_CAST_LIGHT } from "../../group/sets/lab";
import { YARD_CAST_LIGHT } from "../../arthur/sets/yard";
/** a light to look at figures under: cast = the rig's CastLight, sun = the direction toward the scene's sun (it
 *  lights the ground and throws the shadows), sunK = its strength against the pbr default, ground / bg = the ground's
 *  and the sky's colour, ao = the occlusion pass */
export type SheetLight = { cast: Record<string, unknown>; sun: V3; sunK: number; ground: string; bg: string; ao?: AO };
/** "lab" and "yard" are the bright day lights of the earlier films (skin bleached 0.75 / 0.7: the hard case for a
 *  white beard). "tent" is a stand-in for the banquet: a warm lamp from the upper front left, deep violet shade, a
 *  dark indigo room; the figures' gain is below 1 so that reds and whites do not blow out against dark walls. The
 *  set's own CastLight replaces it in the film (bleach, bodyShadeK and contact must be the same in every place of
 *  the film: 07 finding 5; here they are the yard's so that the sheets compare). */
export const SHEET_LIGHTS: Record<string, SheetLight> = {
  lab: { cast: LAB_CAST_LIGHT, sun: [-0.5, 0.55, 0.67], sunK: 1, ground: "#e9eef5", bg: "#bfe3f7" },
  yard: { cast: YARD_CAST_LIGHT, sun: [-0.4997, 0.5496, 0.6695], sunK: 1, ground: "#d9c9a0", bg: "#bfe3f7", ao: { aoRadius: 0.6, distanceFalloff: 1.0, intensity: 1.9, color: "#2b2a4a" } },
  tent: {
    cast: {
      key: [-0.45, 0.62, 0.64], tint: [1.0, 0.86, 0.66], tintK: 0.7, gain: 0.9, grad: 0.22, bodyGrad: 0.16, sideTint: [0.9, 0.88, 1.0],
      shade: [1.06, 0.9, 1.5], shadeK: 0.42, bodyShadeK: 0.4, wrap: [30, 60], edge: 0.14, broad: 0.3, bodySat: 0.14, sheen: 0.14, lift: 0,
      bleach: 0.7, contact: "#8a93c2", contactLen: 0.3,
    },
    sun: [-0.45, 0.62, 0.64], sunK: 0.55, ground: "#5a3f37", bg: "#2b2238", ao: { aoRadius: 0.5, distanceFalloff: 1.0, intensity: 2.4, color: "#1a1024" },
  },
};
/** the floor seat of the banquet (layout.ts: PAD_TOP, DESK_TOP, DESK_EDGE, PAD, TABLE): a pad 0.10 m high and a low
 *  lacquer table whose top is 0.34 m up and whose near edge is 0.26 m in front of the seat's middle */
export const SEAT = { top: 0.10, deskTop: 0.34, deskEdge: 0.26, pad: { w: 0.66, d: 0.6 }, table: { w: 0.7, d: 0.36 } };
/** the pad, at the origin of its parent (the seat's middle on the ground), facing +z */
export const seatPad = (M: Mats, col = "#7a6a4a") => {
  const m = new THREE.Mesh(new THREE.BoxGeometry(SEAT.pad.w, SEAT.top, SEAT.pad.d), M.paint({ color: col }));
  m.position.set(0, SEAT.top / 2, 0); m.receiveShadow = true; m.castShadow = true;
  return m;
};
/** the low table in front of that seat: a red top on a black lacquer frame with four legs, open underneath */
export const lowTable = (M: Mats) => {
  const g = new THREE.Group(), T = SEAT.table, z0 = SEAT.deskEdge + T.d / 2, black = M.paint({ color: "#2b2730" }), red = M.paint({ color: "#b5332b" });
  const add = (w: number, h: number, d: number, x: number, y: number, z: number, mat: THREE.Material) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; g.add(m); };
  add(T.w, 0.03, T.d, 0, SEAT.deskTop - 0.015, z0, red);
  add(T.w, 0.03, T.d, 0, SEAT.deskTop - 0.045, z0, black);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) add(0.04, SEAT.deskTop - 0.06, 0.04, sx * (T.w / 2 - 0.035), (SEAT.deskTop - 0.06) / 2, z0 + sz * (T.d / 2 - 0.035), black);
  return g;
};
