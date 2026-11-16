// Preview harness of the Arthur film: one page renders one still or a run of frames through a post chain close to
// the film's (N8AO -> InkPass -> NEUTRAL tone mapping; the film adds lens blur, bloom and the grade on top).
//   node scripts/rig3d/render.mjs src/videos/arthur/preview/<entry>.ts out.png [--size 540x960] [--opts '<json>']
//   node scripts/rig3d/render.mjs src/videos/arthur/preview/<entry>.ts outdir --pick 0,15,30 [--size ..] [--opts ..]
// --opts is merged over the entry's own options (objects merge key by key). Options every entry understands:
//   w, h      size in px (default 540 x 960; the film is 1080 x 1920)
//   f         the frame of a still (default 0);  fps (default 30): t = f / fps
//   cam       { pos, look, fov, near? } instead of the entry's camera
//   ink       false = no ink outlines;  ao: false = no ambient occlusion;  raw: true = no post at all
// An entry:
//   import { preview } from "./common";
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
import { InkPass, NOINK, noInkFallback } from "../../vasa/ink";

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
  loadFont(o.font ?? "/home/user/film/public/bt/sans700.ttf").then(() => run(o, build));
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
    if (!o.raw && o.ink !== false) comp.addPass(new InkPass(scene, camera));
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
