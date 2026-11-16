// SHIMMER TEST, part 2: the page hook. It makes ANY preview entry of this repo render one frame K times with the
// camera jitters of jitter.ts and with single post passes switched off, in ONE page load, WITHOUT a change to the
// entry or to its harness. shimmer.py writes a two-line wrapper entry
//     import "<repo>/scripts/kit/qa/shimmer/hook";      // first: it patches before the entry runs
//     import "<the entry under test>";
// and renders it with  render.mjs ... --pick 0,1,2,...  and  --opts '{"jit":{...}}'.
//
// What the hook does (all from outside, by patching postprocessing's EffectComposer prototype in this page only):
//   - reads `jit` from the page's options (location.hash, the same JSON the harness reads):
//       jit.f         the film / preview frame under test (default: the option f, or 0)
//       jit.offs      [[dx, dy], ...] px, the K jitters (default: shimmerOffset(0..7, jit.spread ?? 0))
//       jit.variants  what to render, in order (default ["final"]):
//                       "final"  the picture as the harness makes it
//                       "noink"  the ink outline pass (vasa/ink InkPass, or a pass named like it) disabled
//                       "noao"   the N8AO pass disabled
//                       "raw"    both disabled (geometry, textures, shadows, the figures' own lines, tone mapping)
//                       "mask"   the ink pass in debug mode 1: the ink mask alone, black lines on white
//   - EffectComposer.addPass: remembers the passes, so a variant can set pass.enabled / ink.debug per render, and takes
//     the MAIN camera from the RenderPass;
//   - EffectComposer.render: the jitter is put on the main camera's projection matrix ONLY for the duration of the
//     render (elements 8 and 9: exactly what camera.setViewOffset does to the matrix) and taken off again. The frame's
//     own code (poses, the figures' solve, shots that aim the camera by projecting a point) never sees it, so the
//     scene is IDENTICAL in all K pictures and only the sampling differs. (Why not setViewOffset before the frame:
//     Arthur's "pull three" shot re-aims its camera from the projection and cancelled the vertical offset.)
//   - window.__frame(j): render.mjs calls it with j = 0, 1, 2, ...; the hook turns j into (variant = floor(j / K),
//     jitter = j % K), sets both and calls the harness's own __frame(jit.f). So f0000.png .. are variant 0 jitter
//     0..K-1, then variant 1, ... One more j after the last (j = variants x K) repeats (variant 0, jitter 0): if that
//     picture differs from f0000.png the entry is not a pure function of the frame number.
//   - window.remotion_inputProps = "{}" if it is not set (the Arthur film previews call getInputProps() at import).
// With no `jit` option the hook does nothing (verified: pixel-identical pictures).
// A page with no postprocessing EffectComposer is not jittered by the hook (it prints a warning): call
// shimmerJitter(camera, w, h, k) of jitter.ts in that harness instead.
// Deterministic: no clock, no random numbers. Prints "QA: shimmer ..." lines.
import * as THREE from "three";
import { EffectComposer, RenderPass } from "postprocessing";
import { shimmerOffset } from "./jitter";

type Jit = { f?: number; offs?: [number, number][]; variants?: string[]; spread?: number; k?: number };
const W = window as any;
if (W.remotion_inputProps === undefined) W.remotion_inputProps = "{}";

const opts: Record<string, any> = (() => { try { return JSON.parse(decodeURIComponent(location.hash.slice(1)) || "{}"); } catch { return {}; } })();
const jit: Jit | null = opts.jit ?? null;

if (jit) {
  const w: number = opts.w ?? 540, h: number = opts.h ?? 960;
  const offs: [number, number][] = jit.offs ?? Array.from({ length: jit.k ?? 8 }, (_, k) => shimmerOffset(k, jit.spread ?? 0));
  const variants = jit.variants ?? ["final"], K = offs.length, F = jit.f ?? opts.f ?? 0;
  let cur: [number, number] = [0, 0];                              // the jitter of the picture being drawn
  let mainCam: THREE.Camera | null = null, renders = 0;
  const passes: any[] = [];
  const isInk = (p: any) => p && (p.name === "InkPass" || (typeof p.debug === "number" && typeof p.set === "function" && p.constructor?.name?.includes("Ink")));
  const isAO = (p: any) => p && p.configuration && "aoRadius" in p.configuration;

  // 1) the passes and the main camera
  const C = EffectComposer.prototype as any, addPass = C.addPass, render = C.render;
  C.addPass = function (this: any, pass: any, index?: number) {
    passes.push(pass);
    if (!mainCam && pass instanceof RenderPass) mainCam = ((pass as any).mainCamera ?? (pass as any).camera ?? null) as THREE.Camera | null;
    return addPass.call(this, pass, index);
  };
  const setVariant = (v: string) => {
    for (const p of passes) {
      if (isInk(p)) { p.enabled = v !== "noink" && v !== "raw"; p.debug = v === "mask" ? 1 : 0; }
      if (isAO(p)) p.enabled = v !== "noao" && v !== "raw";
    }
  };

  // 2) the jitter, on the projection matrix for the duration of the render only
  //    (setViewOffset(w, h, dx, dy, w, h) changes exactly: e[8] += 2 dx / w, e[9] -= 2 dy / h)
  C.render = function (this: any, deltaTime?: number) {
    const cam = mainCam;
    if (!cam || (cur[0] === 0 && cur[1] === 0)) return render.call(this, deltaTime);
    const P = cam.projectionMatrix, PI = cam.projectionMatrixInverse, e8 = P.elements[8], e9 = P.elements[9];
    const inv = PI.clone();
    P.elements[8] = e8 + (2 * cur[0]) / w; P.elements[9] = e9 - (2 * cur[1]) / h;
    PI.copy(P).invert();
    try { renders++; return render.call(this, deltaTime); } finally { P.elements[8] = e8; P.elements[9] = e9; PI.copy(inv); }
  };

  // 3) the frame call of render.mjs
  let own: ((i: number) => void) | null = null, told = false;
  const frame = (j: number) => {
    const repeat = j >= variants.length * K;
    const v = repeat ? variants[0] : variants[Math.floor(j / K)], k = repeat ? 0 : j % K;
    if (!told) {
      told = true;
      console.log(`QA: shimmer frame ${F}, ${K} jitters x [${variants.join(", ")}], passes: ink ${passes.filter(isInk).length} ao ${passes.filter(isAO).length} of ${passes.length}, main camera ${mainCam ? "from the RenderPass" : "NOT FOUND"}`);
      if (!mainCam) console.log("QA: shimmer WARNING this page has no postprocessing EffectComposer with a RenderPass: NO JITTER is applied (call shimmerJitter of jitter.ts in the harness)");
      for (const want of variants) {
        if ((want === "noink" || want === "mask") && !passes.some(isInk)) console.log(`QA: shimmer WARNING variant ${want}: this page has no ink pass (the variant equals another one)`);
        if (want === "noao" && !passes.some(isAO)) console.log("QA: shimmer WARNING variant noao: this page has no N8AO pass");
      }
    }
    cur = offs[k]; setVariant(v);
    const before = renders;
    own!(F);
    if (mainCam && (cur[0] !== 0 || cur[1] !== 0) && renders === before) console.log("QA: shimmer WARNING the frame was drawn without the composer: NO JITTER in this picture");
    console.log(`QA: shimmer j ${j} ${v} k ${k} off ${cur[0].toFixed(4)},${cur[1].toFixed(4)}${repeat ? " (repeat)" : ""}`);
  };
  Object.defineProperty(W, "__frame", { configurable: true, get: () => (own ? frame : undefined), set: (fn) => { own = fn; } });
}
