// 《石中剑》 the film composition "ArthurFilm" (1080 x 1920, 30 fps, TOTAL frames).
// Engine: see story.ts (segment contract + how to build a segment) and world.ts (the set, the stone, the cast).
// Per page (a still, or one farm chunk): the font is loaded, then the World is built ONCE under the delayRender handle
// "arthur world build"; per frame the Director picks the segment (exit / enter on a change), then w.beginFrame(f);
// P = SEG.pose(w, f); w.endFrame(P). <Inner> applies P.post on the chain N8AO -> InkPass -> lens blur -> bloom ->
// NEUTRAL tone mapping -> grade. The composer has a stencil buffer (the rig figures layer their heads with it).
// DOM layers on top: P.overlays, the caption, P.top.
// Debug input props: nopost (raw render), kick: n (extra advances per frame), nocap (no captions), dbg (timing logs).
// Covers (world.ts): zoom: z (< 1 shows more around the same frame), sx / sy (move the picture right / down by that
// fraction of the frame), ov (the size of the hook's crown and "?" icons, which do not shrink with zoom). With nocap
// these give clean stills for the 9:16, 3:4 and 4:3 covers: scripts/arthur/cover/.
import React, { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { AbsoluteFill, continueRender, delayRender, getInputProps, useCurrentFrame } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree, type RootState } from "@react-three/fiber";
import { EffectComposer, N8AO } from "@react-three/postprocessing";
import { BlendFunction, BloomEffect, ToneMappingEffect, ToneMappingMode } from "postprocessing";
import { InkPass, noInkFallback } from "../vasa/ink";
import { LensBlur } from "../vasa/lensblur";
import { GradeEffect, type GradeParams } from "../vasa/grade";
import { YARD_AO } from "./sets/yard";
import { FONT_STACK, COL, useOverlayFont } from "../group/kit/overlay";
import { World } from "./world";
import { W, H, TOTAL, CAPTION_Y, SEGMENTS, clamp01, easeOutBack, type Pose, type Segment } from "./story";
import { captionAt, captionRuns, TRAILING_PUNCT } from "./captions";
import { SEG as SEG_A } from "./shots/segA";
import { SEG as SEG_B } from "./shots/segB";
import { SEG as SEG_C } from "./shots/segC";
import { SEG as SEG_D } from "./shots/segD";
import { SEG as SEG_E } from "./shots/segE";

export const ARTHUR_FRAMES = TOTAL;
const IP = getInputProps() as { nopost?: boolean; kick?: number; nocap?: boolean; dbg?: boolean };

// ---------------------------------------------------------------------------------------------------- segments
const SEGS: Segment[] = [SEG_A, SEG_B, SEG_C, SEG_D, SEG_E];
SEGMENTS.forEach((s, i) => {
  const g = SEGS[i];
  if (!g || g.id !== s.id || g.from !== s.from || g.to !== s.to) throw new Error(`segment ${s.id}: SEG must be { id: "${s.id}", from: ${s.from}, to: ${s.to} } (got ${g ? `${g.id} ${g.from}-${g.to}` : "nothing"})`);
});
const segAt = (f: number) => SEGS.find((s) => f >= s.from && f <= s.to) ?? (f < SEGS[0].from ? SEGS[0] : SEGS[SEGS.length - 1]);

/** owns the segment switch: exit the old one, reset the world, enter the new one; then pose the frame */
class Director {
  cur: Segment | null = null;
  constructor(readonly w: World) {}
  frame(f: number): Pose {
    const s = segAt(f);
    if (s !== this.cur) {
      if (this.cur) this.cur.exit(this.w);
      s.enter(this.w);
      this.cur = s;
    }
    this.w.beginFrame(f);
    const P = s.pose(this.w, f);
    this.w.endFrame(P);
    return P;
  }
}

// ---------------------------------------------------------------------------------------------------- post defaults
/** the accepted BtCannon grade (bt/BtCannon.tsx GRADE_BT) */
export const GRADE_FILM: GradeParams = { ky: [0, 0.1, 0.27, 0.58, 0.82, 0.935, 1], sat: [0.97, 0.98, 0.96], tintS: [0.006, 0.006], tintM: [-0.01, 0.008], tintH: [-0.016, 0.01], vig: [0.16, 0.42] };
const BLOOM = 0.35;
const GL_OPTS = { antialias: false, stencil: false, powerPreference: "high-performance" as const };
const CAM_OPTS = { fov: 46, near: 0.03, far: 600 };

// ---------------------------------------------------------------------------------------------------- inside the canvas
type N8 = { configuration: { aoRadius: number; distanceFalloff: number; intensity: number; color: THREE.Color } };
const Inner: React.FC<{ world: World; P: Pose; onReady: () => void }> = ({ world, P, onReady }) => {
  const { scene, camera } = useThree();
  const fx = useMemo(() => ({
    ink: new InkPass(scene, camera as THREE.PerspectiveCamera),
    lens: new LensBlur({ maxCoC: 20, nearScale: 1.0 }),
    bloom: new BloomEffect({ blendFunction: BlendFunction.ADD, intensity: 0.35, luminanceThreshold: 1.0, luminanceSmoothing: 0.2, mipmapBlur: true }),
    tone: new ToneMappingEffect({ mode: ToneMappingMode.NEUTRAL }),
    grade: new GradeEffect(GRADE_FILM, 1),
  }), [scene, camera]);
  const ao = useRef<N8 | null>(null);
  const post = useMemo(() => (
    <EffectComposer multisampling={4} stencilBuffer>
      <N8AO ref={ao as never} aoRadius={YARD_AO.aoRadius} distanceFalloff={YARD_AO.distanceFalloff} intensity={YARD_AO.intensity} color={YARD_AO.color as never} quality="high" halfRes={false} />
      <primitive object={fx.ink} dispose={null} />
      <primitive object={fx.lens.pre} dispose={null} />
      <primitive object={fx.lens.main} dispose={null} />
      <primitive object={fx.bloom} dispose={null} />
      <primitive object={fx.tone} dispose={null} />
      <primitive object={fx.grade} dispose={null} />
    </EffectComposer>
  ), [fx]);
  // per frame: post parameters from the pose (defaults where omitted)
  const pp = P.post ?? {};
  const bg = useMemo(() => new THREE.Color(), []);
  scene.background = bg.set(world.bg());
  fx.lens.focus = pp.dof?.focus ?? 10; fx.lens.cInf = pp.dof ? pp.dof.amount : 0;
  fx.bloom.intensity = pp.bloom ?? BLOOM;
  fx.grade.set(pp.grade ?? GRADE_FILM); fx.grade.amount = pp.gradeAmount ?? 1;
  fx.ink.set({ strength: pp.ink ?? 1 });
  noInkFallback(world.root);
  const aoMul = pp.ao ?? 1;
  useLayoutEffect(() => {
    const c = ao.current?.configuration; if (!c) return;
    const k = YARD_AO.intensity * aoMul; if (c.intensity !== k) c.intensity = k;
  });
  return (<><primitive object={world.root} dispose={null} />{IP.nopost ? null : post}<FirstKick onReady={onReady} /></>);
};

/** first frame of the page: two extra advances once the composer has subscribed, then release the world handle.
 *  Later frames are drawn by ThreeCanvas' ManualFrameRenderer (one advance per frame) plus `kick` extra advances. */
const FirstKick: React.FC<{ onReady: () => void }> = ({ onReady }) => {
  const f = useCurrentFrame();
  const advance = useThree((s) => s.advance);
  const gl = useThree((s) => s.gl);
  const first = useRef(true);
  useLayoutEffect(() => {
    const h = delayRender("arthur first frame");
    // The composer (@react-three/postprocessing) is created in a passive effect and gets its passes one re-render
    // later; until then its useFrame (priority 1) swallows the render. So advance once per animation frame until two
    // advances have really drawn (renderer.info.render.frame moved), at most ~4 s of frames.
    let good = 0, tries = 0;
    const step = () => {
      const before = gl.info.render.frame, t0 = performance.now();
      advance(performance.now());
      if (IP.dbg) gl.getContext().finish(); // dbg only: wait for the GPU so the timing below is the real frame cost
      if (gl.info.render.frame !== before) { good++; if (IP.dbg) console.log(`[arthur] advance ${tries} drew in ${Math.round(performance.now() - t0)} ms (GPU finished)`); }
      if (good >= 2 || ++tries > 240) {
        if (good < 2) console.warn(`[arthur] first frame: post never drew (${good} draws in ${tries} advances)`);
        if (IP.dbg) console.log(`[arthur] first frame after ${tries} advances, ${good} drew, ${gl.info.programs?.length} programs; page time ${Math.round(performance.now())} ms`);
        continueRender(h); onReady();
      } else requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useLayoutEffect(() => {
    if (first.current) { first.current = false; return; }
    const n = Number(IP.kick ?? 0); if (n <= 0) return;
    const h = delayRender("arthur kick");
    let i = 0; const step = () => { advance(performance.now()); if (++i < n) requestAnimationFrame(step); else continueRender(h); };
    requestAnimationFrame(step);
  }, [f, advance]);
  return null;
};

// ---------------------------------------------------------------------------------------------------- captions
/** storyboard §0.2: Noto Sans SC Bold 64 px, white, gold key words, no box: a soft dark edge plus a borderless
 *  feathered shade; centred at y 70 %; trailing ？！，。： pulled back by half an em; a small pop-in per group */
export const Caption: React.FC<{ f: number }> = ({ f }) => {
  useOverlayFont();
  const c = captionAt(f);
  if (!c) return null;
  const k = c.from === 0 ? 1 : clamp01((f - c.from + 1) / 5);
  const s = c.from === 0 ? 1 : 0.86 + 0.14 * easeOutBack(k, 2.2), o = c.from === 0 ? 1 : clamp01((f - c.from + 1) / 2.5);
  const runs = captionRuns(c.text);
  const last = runs[runs.length - 1], lastCh = last.text.slice(-1), pull = TRAILING_PUNCT.includes(lastCh);
  if (pull) last.text = last.text.slice(0, -1);
  const len = [...c.text.replace(/[【】]/g, "")].length;
  const shadeW = 150 + len * 68;
  const edge = "0 0 2px rgba(8,9,16,0.95), 0 0 5px rgba(8,9,16,0.75), 0 2px 12px rgba(8,9,16,0.55), 0 4px 26px rgba(8,9,16,0.35)";
  const text: React.CSSProperties = {
    fontFamily: FONT_STACK, fontWeight: 700, fontSize: 64, lineHeight: 1, letterSpacing: 2, whiteSpace: "nowrap", color: COL.white, textShadow: edge,
  };
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: W / 2, top: CAPTION_Y, width: 0, height: 0, opacity: o }}>
        <div style={{ position: "absolute", left: -shadeW / 2, top: -82, width: shadeW, height: 164,
          background: "radial-gradient(closest-side, rgba(10,12,22,0.34) 0%, rgba(10,12,22,0.3) 45%, rgba(10,12,22,0.16) 72%, rgba(10,12,22,0.05) 90%, rgba(10,12,22,0) 100%)" }} />
        <div style={{ position: "absolute", left: 0, top: 0, transform: `translate(-50%, -50%) scale(${s})`, transformOrigin: "50% 50%", ...text }}>
          {runs.map((r, i) => <span key={i} style={r.gold ? { color: COL.gold } : undefined}>{r.text}</span>)}
          {pull ? <span style={{ marginRight: "-0.5em" }}>{lastCh}</span> : null}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------------------------------- the composition
export const ArthurFilm: React.FC = () => {
  const f = useCurrentFrame();
  const [handle] = useState(() => { if (IP.dbg) console.log(`[arthur] composition mounted at page time ${Math.round(performance.now())} ms`); return delayRender("arthur world build"); });
  const [ctx, setCtx] = useState<{ gl: THREE.WebGLRenderer; camera: THREE.PerspectiveCamera } | null>(null);
  // the font first: the stone's inscription is drawn into a texture when the world is built
  const fontReady = useOverlayFont();
  const world = useMemo(() => (ctx && fontReady ? new World(ctx.gl, ctx.camera) : null), [ctx, fontReady]);
  const director = useMemo(() => (world ? new Director(world) : null), [world]);
  const t0 = IP.dbg ? performance.now() : 0;
  const P = director ? director.frame(f) : null;
  if (IP.dbg && P) console.log(`[arthur] f${f} pose (segment ${director!.cur?.id}) in ${Math.round(performance.now() - t0)} ms`);
  const onCreated = useCallback((s: RootState) => setCtx({ gl: s.gl, camera: s.camera as THREE.PerspectiveCamera }), []);
  const onReady = useCallback(() => continueRender(handle), [handle]);
  return (
    <AbsoluteFill style={{ background: "#0d0e16" }}>
      <ThreeCanvas width={W} height={H} shadows="percentage" gl={GL_OPTS} camera={CAM_OPTS} onCreated={onCreated}>
        {world && P ? <Inner world={world} P={P} onReady={onReady} /> : null}
      </ThreeCanvas>
      {P?.overlays ? <AbsoluteFill style={{ pointerEvents: "none", overflow: "hidden" }}>{P.overlays}</AbsoluteFill> : null}
      {P && P.captions !== false && !IP.nocap ? <Caption f={f} /> : null}
      {P?.top ? <AbsoluteFill style={{ pointerEvents: "none" }}>{P.top}</AbsoluteFill> : null}
    </AbsoluteFill>
  );
};
