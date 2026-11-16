// THE CUT'S PICTURE (Wanbi): the film's 3D picture WITH the film's post chain, drawn by the preview harness (no React,
// no Remotion). A copy of src/videos/hongmen/preview/film_cut_core.ts (WP14); what changed: the World / story / beats
// are Wanbi's, the default font is this repo's, the console names. Used by scripts/kit/cut/make_cut.sh --film wanbi
// through preview/film_cut.ts (kit.json entries.pic / picCore).
//
// What is the SAME as src/videos/wanbi/Film.tsx (its post section is the same code as Hongmen's, comments aside;
// deps.mjs warns when that section changes after scripts/wanbi/cut/chain.sha was written):
//   - the Director: exit / enter on a segment change, w.beginFrame(f); P = SEG.pose(w, f); w.endFrame(P)
//   - the renderer as R3F makes it for <ThreeCanvas shadows="percentage" gl={GL_OPTS}>: alpha, no antialias, no
//     stencil, PCF shadows, sRGB output, no renderer tone mapping; the camera (fov 46, near 0.03, far 600)
//   - the composer: HalfFloat, 4x multisampling, stencil buffer; the passes in the order and the GROUPING that
//     @react-three/postprocessing 3.2.2 builds from Film.tsx's children (mergeMode "auto"):
//       RenderPass -> N8AO (High, full res) -> InkPass (src/kit/fx/ink.ts, 8 samples) -> EffectPass(lens pre) ->
//       EffectPass(lens main, bloom, NEUTRAL tone mapping, grade) -> CopyPass (the wrapper appends one: N8AO is a pass)
//   - per frame: the place's look (background, AO, bloom, grade: world.look()) and Pose.post over it
//   - the page behind the canvas is #0d0e16, as the film's AbsoluteFill
// What is NOT the same (Hongmen's measurements, /home/user/hm_notes/x_cut.md):
//   - the size: this page renders w x h natively (540 x 960 for the cut). A Remotion --scale=0.5 frame is the
//     1080 x 1920 render halved by the browser (2 x 2 supersampling): its edges and ink lines are smoother. N8AO's
//     denoise radius and the bloom's blur are in pixels of the buffer, so they are a little wider here.
//   - no DOM: HUD, overlays, captions and Pose.top come from Remotion's "ovonly" render and are laid over by ffmpeg.
// Options (--opts): w, h, f (the frame drawn first, twice, as the film's first frame of a page), font, and the
// switches for measuring: ao / ink / lens / bloom / tone / grade: false, raw: true (nothing after the RenderPass),
// lens: "auto" (frames without depth of field skip the two lens passes: the same picture, 0.5 to 0.8 s less),
// inksamples (the ink pass's sub-pixel buffers: 8 = the film, 4, 1), quiet: true (no per-frame QA line),
// bench: [frames] (times each of those frames with parts of the chain off: QA: BENCH lines).
// Prints per new frame:  QA: f<frame> seg <id> <place> [<slate>] ok | <figures with reach / clear problems>
//                        QA: T f<frame> pose <ms> draw <ms>      (draw = until the GPU has finished)
import * as THREE from "three";
import { EffectComposer, RenderPass, EffectPass, CopyPass, Effect, Pass, BlendFunction, BloomEffect, ToneMappingEffect, ToneMappingMode } from "postprocessing";
import { N8AOPostPass } from "n8ao";
import { LensBlur } from "../../vasa/lensblur";
import { GradeEffect, type GradeParams } from "../../vasa/grade";
import { World } from "../world";
import { SEGMENTS, type Pose, type Segment } from "../story";
import { shotCheck } from "../beats";

/** the ink pass of the film: film_cut.ts hands in the SAME class Film.tsx imports (deps.mjs checks the module) */
export type InkKit = {
  InkPass: new (scene: THREE.Scene, camera: THREE.PerspectiveCamera, options?: { samples?: number }) => Pass & { set(o: { strength?: number }): void };
  noInkFallback: (root: THREE.Object3D) => void;
};

// ---- copies of Film.tsx's post defaults (deps.mjs hashes the originals: kit.json chainSha)
const GRADE_FILM: GradeParams = { ky: [0, 0.1, 0.27, 0.58, 0.82, 0.935, 1], sat: [0.97, 0.98, 0.96], tintS: [0.006, 0.006], tintM: [-0.01, 0.008], tintH: [-0.016, 0.01], vig: [0.16, 0.42] };
const BLOOM = 0.35;
const PAGE_BG = "#0d0e16";

// ---- @react-three/postprocessing 3.2.2 buildPasses(nodes, camera, "auto"): which effects share one EffectPass
const isConvolution = (e: Effect) => (e.getAttributes() & 2) === 2;
const hasMainUv = (e: Effect) => /mainUv/.test(e.getFragmentShader() ?? "");
function buildPasses(nodes: (Effect | Pass)[], camera: THREE.Camera): Pass[] {
  const passes: Pass[] = [];
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    if (node instanceof Effect) {
      const effects = [node];
      let conv = isConvolution(node), uv = hasMainUv(node);
      let next: Effect | Pass | undefined;
      while ((next = nodes[i + 1]) instanceof Effect) {
        const nc = isConvolution(next), nu = hasMainUv(next);
        if ((conv && nc) || (conv && nu) || (uv && nc)) break;
        effects.push(next); conv ||= nc; uv ||= nu; i++;
      }
      passes.push(new EffectPass(camera, ...effects));
    } else passes.push(node);
  }
  return passes;
}

const loadFont = async (path: string) => {
  try {
    const ff = new FontFace("FrSans", `url(file://${path})`, { weight: "700" });
    await ff.load(); (document.fonts as any).add(ff);
  } catch (e) { console.log("QA: preview font not loaded (" + (e as Error).message + "), falling back to the system CJK font"); }
};

export function runCut(kit: InkKit, SEGS_IN: Segment[]) {
  const hash = typeof location !== "undefined" ? decodeURIComponent(location.hash.slice(1)) : "";
  const o: Record<string, any> = hash ? JSON.parse(hash) : {};
  loadFont(o.font ?? "/home/user/video/public/bt/sans700.ttf").then(() => {
    try { run(o, kit, SEGS_IN); } catch (e) {
      console.error("PREVIEW FAILED: " + (e as Error).message + " | " + String((e as Error).stack).slice(0, 800));
      (window as any).__failed = true;
      throw e;
    }
  });
}

function run(o: Record<string, any>, kit: InkKit, SEGS: Segment[]) {
  const w: number = o.w ?? 540, h: number = o.h ?? 960;
  SEGMENTS.forEach((s, i) => {
    const g = SEGS[i];
    if (!g || g.id !== s.id || g.from !== s.from || g.to !== s.to) throw new Error(`segment ${s.id}: SEG must be { id: "${s.id}", from: ${s.from}, to: ${s.to} }`);
  });
  // ---- the renderer, as R3F builds it for Film.tsx's <ThreeCanvas shadows="percentage" gl={GL_OPTS}>
  const renderer = new THREE.WebGLRenderer({ powerPreference: "high-performance", antialias: false, alpha: true, stencil: false, preserveDrawingBuffer: true });
  renderer.setPixelRatio(1); renderer.setSize(w, h);
  renderer.debug.onShaderError = (gl, program, vs, fs) => {
    const msg = [gl.getProgramInfoLog(program), gl.getShaderInfoLog(vs), gl.getShaderInfoLog(fs)].filter(Boolean).join(" | ").slice(0, 600);
    console.error("PREVIEW SHADER ERROR: " + msg);
    throw new Error("preview: a shader did not compile: " + msg);
  };
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NoToneMapping;
  document.body.style.margin = "0"; document.body.style.background = PAGE_BG; document.body.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(46, w / h, 0.03, 600);

  const t0 = performance.now();
  const world = new World(renderer, camera);
  scene.add(world.root);
  console.log(`QA: built in ${Math.round(performance.now() - t0)} ms`);
  for (const m of shotCheck()) console.log(`QA: SHOTS ${m}`);

  // ---- the chain
  const comp = new EffectComposer(renderer, { stencilBuffer: true, multisampling: 4, frameBufferType: THREE.HalfFloatType });
  comp.addPass(new RenderPass(scene, camera));
  const raw = o.raw === true;
  const n8 = new N8AOPostPass(scene, camera);
  n8.configuration.halfRes = false; n8.configuration.depthAwareUpsampling = true; n8.setQualityMode("High");
  const ink = new kit.InkPass(scene, camera, { samples: o.inksamples ?? 8 });   // Film.tsx: ipNum("inksamples", 8, false); 8 = the film
  const lens = new LensBlur({ maxCoC: 20, nearScale: 1.0 });
  const bloom = new BloomEffect({ blendFunction: BlendFunction.ADD, intensity: BLOOM, luminanceThreshold: 1.0, luminanceSmoothing: 0.2, mipmapBlur: true });
  const tone = new ToneMappingEffect({ mode: ToneMappingMode.NEUTRAL });
  const grade = new GradeEffect(GRADE_FILM, 1);
  let alt: { bloom: BloomEffect; grade: GradeEffect; pass: EffectPass; lensPasses: Pass[] } | null = null;
  if (!raw) {
    const nodes: (Effect | Pass)[] = [n8, ink];
    if (o.lens !== false) nodes.push(lens.pre, lens.main);
    if (o.bloom !== false) nodes.push(bloom);
    if (o.tone !== false) nodes.push(tone);
    if (o.grade !== false) nodes.push(grade);
    for (const p of buildPasses(nodes, camera)) comp.addPass(p);
    // lens: "auto" (the cut's --lens auto): on a frame with no depth of field (Pose.post.dof unset: cInf 0) the two
    // lens passes copy their input unchanged and still cost 0.5 to 0.8 s here. Such a frame goes through a second tail
    // WITHOUT them (its own bloom / tone mapping / grade objects, set to the same values every frame); a frame with
    // dof goes through the film's own passes.
    if (o.lens === "auto") {
      alt = { bloom: new BloomEffect({ blendFunction: BlendFunction.ADD, intensity: BLOOM, luminanceThreshold: 1.0, luminanceSmoothing: 0.2, mipmapBlur: true }), grade: new GradeEffect(GRADE_FILM, 1), pass: null as unknown as EffectPass, lensPasses: comp.passes.filter((p) => p instanceof EffectPass) };
      alt.pass = new EffectPass(camera, alt.bloom, new ToneMappingEffect({ mode: ToneMappingMode.NEUTRAL }), alt.grade);
      comp.addPass(alt.pass);
    }
    comp.addPass(new CopyPass());
    if (o.ao === false) n8.enabled = false;
    if (o.ink === false) ink.enabled = false;
  }
  comp.setSize(w, h);
  console.log(`QA: chain ${comp.passes.map((p) => (p instanceof EffectPass ? `EffectPass(${((p as any).effects as Effect[]).map((e) => e.name).join(", ")})` : p.name) + (p.enabled ? "" : " OFF")).join(" -> ")}`);

  // ---- the Director (Film.tsx)
  let cur: Segment | null = null;
  const segAt = (f: number) => SEGS.find((s) => f >= s.from && f <= s.to) ?? (f < SEGS[0].from ? SEGS[0] : SEGS[SEGS.length - 1]);
  const director = (f: number): Pose => {
    const s = segAt(f);
    if (s !== cur) { if (cur) cur.exit(world); s.enter(world); cur = s; }
    world.beginFrame(f);
    const P = s.pose(world, f);
    world.endFrame(P);
    return P;
  };
  const bg = new THREE.Color(), aoCol = new THREE.Color();
  const gl = renderer.getContext();
  // wait for the GPU: gl.finish() returns at once in headless Chromium (the GPU process works on); reading one pixel
  // of the canvas back does block until the frame is really drawn. Timing only.
  const px = new Uint8Array(4);
  const sync = () => { gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px); };
  let last = -1, said = -1;
  const draw = (f: number) => {
    const ta = performance.now();
    const P = director(f);
    // Film.tsx <Inner>: the place's values, then the pose's own
    const look = world.look(), pp = (P.post ?? {}) as NonNullable<Pose["post"]>;
    scene.background = bg.set(pp.bg ?? look.bg);
    lens.focus = pp.dof?.focus ?? 10; lens.cInf = pp.dof ? pp.dof.amount : 0;
    bloom.intensity = pp.bloom ?? look.bloom ?? BLOOM;
    grade.set(pp.grade ?? look.grade ?? GRADE_FILM); grade.amount = pp.gradeAmount ?? 1;
    ink.set({ strength: pp.ink ?? 1 });
    if (alt) {
      const blur = lens.main.cInf >= 0.25;                     // the shader's own test (lensblur.ts: cInf < 0.25 = off)
      alt.lensPasses.forEach((p) => (p.enabled = blur)); alt.pass.enabled = !blur;
      alt.bloom.intensity = bloom.intensity; alt.grade.set(pp.grade ?? look.grade ?? GRADE_FILM); alt.grade.amount = grade.amount;
    }
    kit.noInkFallback(world.root);
    const c = n8.configuration, a = look.ao, k = a.intensity * (pp.ao ?? 1);
    if (c.aoRadius !== a.aoRadius) c.aoRadius = a.aoRadius;
    if (c.distanceFalloff !== a.distanceFalloff) c.distanceFalloff = a.distanceFalloff;
    if (c.intensity !== k) c.intensity = k;
    aoCol.set(a.color); if (!c.color || !c.color.equals(aoCol)) c.color = aoCol.clone();
    const tb = performance.now();
    renderer.autoClear = true;                    // the R3F wrapper renders the composer with gl.autoClear = true
    comp.render(1 / 30);
    renderer.autoClear = false;
    sync();
    const tc = performance.now();
    last = f;
    if (f !== said && o.quiet !== true) {
      said = f;
      const bad = world.rc.figures.map((r, i) => ({ r, i })).filter(({ r }) => r.group.visible && (r.qa.reach > 0.012 || r.qa.clear < -0.0005));
      const head = `QA: f${f} seg ${cur!.id} ${world.place}${P.slate ? ` [${P.slate}]` : ""}`;
      console.log(bad.length ? `${head} | ` + bad.map(({ r, i }) => `#${i} ${r.state.pose.kind} reach ${r.qa.reach.toFixed(3)} clear ${r.qa.clear.toFixed(3)}`).join("  ") : `${head} ok`);
    }
    console.log(`QA: T f${f} pose ${Math.round(tb - ta)} draw ${Math.round(tc - tb)}`);
  };
  // ---- bench: [frames]  (measuring only) each frame is drawn with parts of the chain switched off, twice each, and
  // the second draw is timed until the GPU has finished:  QA: BENCH f<frame> <variant> <ms>
  if (Array.isArray(o.bench) && !raw) {
    const tailNoLens = new EffectPass(camera, new BloomEffect({ blendFunction: BlendFunction.ADD, intensity: BLOOM, luminanceThreshold: 1.0, luminanceSmoothing: 0.2, mipmapBlur: true }), new ToneMappingEffect({ mode: ToneMappingMode.NEUTRAL }), new GradeEffect(GRADE_FILM, 1));
    const tailPlain = new EffectPass(camera, new ToneMappingEffect({ mode: ToneMappingMode.NEUTRAL }), new GradeEffect(GRADE_FILM, 1));
    const copy = comp.passes[comp.passes.length - 1];
    comp.removePass(copy); comp.addPass(tailNoLens); comp.addPass(tailPlain); comp.addPass(copy);
    tailNoLens.enabled = false; tailPlain.enabled = false;
    const eps = comp.passes.filter((p) => p instanceof EffectPass && p !== tailNoLens && p !== tailPlain);   // [lens pre, lens main + bloom + tone + grade]
    const inkN = (n: number) => (ink as unknown as { set(o: { samples: number }): void }).set({ samples: n });
    const variants: [string, () => void][] = [
      ["full (ink 8)", () => {}],
      ["ink 4 samples", () => inkN(4)],
      ["ink 1 sample", () => inkN(1)],
      ["no ink", () => { ink.enabled = false; }],
      ["no N8AO", () => { n8.enabled = false; }],
      ["no lens blur", () => { eps.forEach((p) => (p.enabled = false)); tailNoLens.enabled = true; }],
      ["no lens blur, no bloom", () => { eps.forEach((p) => (p.enabled = false)); tailPlain.enabled = true; }],
      ["no ink, no N8AO, no lens, no bloom", () => { ink.enabled = false; n8.enabled = false; eps.forEach((p) => (p.enabled = false)); tailPlain.enabled = true; }],
    ];
    const reset = () => { inkN(o.inksamples ?? 8); ink.enabled = o.ink !== false; n8.enabled = o.ao !== false; eps.forEach((p) => (p.enabled = true)); tailNoLens.enabled = false; tailPlain.enabled = false; };
    const quiet = o.quiet; o.quiet = true;
    for (const f of o.bench as number[]) {
      draw(f);
      for (const [name, on] of variants) {
        reset(); on();
        comp.render(1 / 30); sync();
        const t = performance.now();
        renderer.autoClear = true; comp.render(1 / 30); renderer.autoClear = false; sync();
        console.log(`QA: BENCH f${f} ${name}: ${Math.round(performance.now() - t)} ms`);
      }
      reset();
    }
    o.quiet = quiet; last = -1; said = -1;
  }
  // a frame that is already on the canvas is not drawn again (the first frame of a run is drawn twice below, as the
  // film's first frame of a page is; a frame is a pure function of its number)
  (window as any).__frame = (f: number) => { if (f !== last) draw(f); };
  const f0: number = o.f ?? 0;
  draw(f0); last = -1; draw(f0);
  (window as any).__ready = true; (window as any).__done = true;
}
