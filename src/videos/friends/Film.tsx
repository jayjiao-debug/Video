// 《你的朋友，有几个也把你当朋友？》 the film composition "FriendsFilm" (1080 x 1920, 30 fps, 2286 frames).
// Engine: see story.ts (segment contract + how to build a segment) and world.ts (sets, casts, pools, web, projection).
//
// Per page (a still, or one farm chunk):
//   1. <ThreeCanvas> is created; onCreated hands us its renderer + camera; the World (both sets, casts, crowd, pools) is
//      built ONCE, synchronously, under the delayRender handle "friends world build" (logs "[friends] world built in").
//   2. Per frame, in this component's render: the Director picks the segment for the frame (exit / reset / enter on a
//      change), then w.beginFrame(f); P = SEG.pose(w, f); w.endFrame(P) (scene visibility, camera, cast safety net).
//   3. <Inner> (inside the canvas) applies P.post on the BtCannon chain: N8AO (per set) -> InkPass (world only, cards /
//      sky / glass on NOINK) -> lens blur (pre + main) -> bloom (threshold 1: only emissive things) -> NEUTRAL tone
//      mapping -> grade. The 3D frame is drawn by ThreeCanvas' own per-frame advance; on the page's first frame
//      <FirstKick> advances until the composer has really drawn twice, then releases the world handle.
//   4. DOM layers on top: the H3 sky gradient (P.sky / scene "sky"), P.overlays, the caption, P.top (end card).
// Debug input props: nopost (raw render, no composer), kick: n (extra advances on every frame after the first; 0 by
// default, the farm can set 1 if post output ever lags a frame), nocap (no captions), dbg (timing logs: world build,
// pose, first composer draw with a GPU finish; segments may log their own checks behind it).
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
import { CLASSROOM_AO } from "./sets/classroom";
import { DORM_POST } from "./sets/dorm";
import { FONT_STACK, COL, useOverlayFont } from "./kit/overlay";
import { World } from "./world";
import { W, H, TOTAL, SKY_H3, CAPTION_Y, SEGMENTS, clamp01, easeOutBack, type Pose, type Segment, type SceneId } from "./story";
import { captionAt, captionRuns, TRAILING_PUNCT } from "./captions";
import { SEG as SEG_A } from "./shots/segA";
import { SEG as SEG_B } from "./shots/segB";
import { SEG as SEG_C } from "./shots/segC";
import { SEG as SEG_D } from "./shots/segD";
import { SEG as SEG_E } from "./shots/segE";

export const FRIENDS_FRAMES = TOTAL;
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
      this.w.reset();
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
type SetPost = { ao: { aoRadius: number; distanceFalloff: number; intensity: number; color: string }; bloom: number; bg: THREE.Color };
const SET_POST: Record<SceneId, SetPost> = {
  dorm: { ao: DORM_POST.ao, bloom: DORM_POST.bloom.intensity, bg: new THREE.Color("#141522") },
  classroom: { ao: CLASSROOM_AO, bloom: 0.35, bg: new THREE.Color("#9cc6e8") },
  sky: { ao: CLASSROOM_AO, bloom: 0.35, bg: new THREE.Color(SKY_H3[1]) },
  phone2d: { ao: CLASSROOM_AO, bloom: 0.35, bg: new THREE.Color("#0d0e16") },
};
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
    <EffectComposer multisampling={4}>
      <N8AO ref={ao as never} aoRadius={DORM_POST.ao.aoRadius} distanceFalloff={DORM_POST.ao.distanceFalloff} intensity={DORM_POST.ao.intensity} color={DORM_POST.ao.color as never} quality="high" halfRes={false} />
      <primitive object={fx.ink} dispose={null} />
      <primitive object={fx.lens.pre} dispose={null} />
      <primitive object={fx.lens.main} dispose={null} />
      <primitive object={fx.bloom} dispose={null} />
      <primitive object={fx.tone} dispose={null} />
      <primitive object={fx.grade} dispose={null} />
    </EffectComposer>
  ), [fx]);
  // per frame: post parameters from the pose (scene defaults where omitted)
  const sp = SET_POST[P.scene], pp = P.post ?? {};
  scene.background = sp.bg;
  fx.lens.focus = pp.dof?.focus ?? 10; fx.lens.cInf = pp.dof ? pp.dof.amount : 0;
  fx.bloom.intensity = pp.bloom ?? sp.bloom;
  fx.grade.set(pp.grade ?? GRADE_FILM); fx.grade.amount = pp.gradeAmount ?? 1;
  fx.ink.set({ strength: pp.ink ?? 1 });
  const st = P.scene === "classroom" ? world.classroom : P.scene === "dorm" ? world.dorm : null;
  if (st) noInkFallback(st.scene);
  const aoMul = pp.ao ?? 1;
  useLayoutEffect(() => {
    const c = ao.current?.configuration; if (!c) return;
    if (c.aoRadius !== sp.ao.aoRadius) c.aoRadius = sp.ao.aoRadius;
    if (c.distanceFalloff !== sp.ao.distanceFalloff) c.distanceFalloff = sp.ao.distanceFalloff;
    const k = sp.ao.intensity * aoMul; if (c.intensity !== k) c.intensity = k;
    const col = new THREE.Color(sp.ao.color); if (!c.color.equals(col)) c.color = col;
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
    const h = delayRender("friends first frame");
    // The composer (@react-three/postprocessing) is created in a passive effect and gets its passes one re-render
    // later; until then its useFrame (priority 1) swallows the render. So advance once per animation frame until two
    // advances have really drawn (renderer.info.render.frame moved), at most ~4 s of frames.
    let good = 0, tries = 0;
    const step = () => {
      const before = gl.info.render.frame, t0 = performance.now();
      advance(performance.now());
      if (IP.dbg) gl.getContext().finish(); // dbg only: wait for the GPU so the timing below is the real frame cost
      if (gl.info.render.frame !== before) { good++; if (IP.dbg) console.log(`[friends] advance ${tries} drew in ${Math.round(performance.now() - t0)} ms (GPU finished)`); }
      if (good >= 2 || ++tries > 240) {
        if (good < 2) console.warn(`[friends] first frame: post never drew (${good} draws in ${tries} advances)`);
        if (IP.dbg) console.log(`[friends] first frame after ${tries} advances, ${good} drew, ${gl.info.programs?.length} programs; page time ${Math.round(performance.now())} ms`);
        continueRender(h); onReady();
      } else requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useLayoutEffect(() => {
    if (first.current) { first.current = false; return; }
    const n = Number(IP.kick ?? 0); if (n <= 0) return;
    const h = delayRender("friends kick");
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
export const FriendsFilm: React.FC = () => {
  const f = useCurrentFrame();
  const [handle] = useState(() => { if (IP.dbg) console.log(`[friends] composition mounted at page time ${Math.round(performance.now())} ms`); return delayRender("friends world build"); });
  const [ctx, setCtx] = useState<{ gl: THREE.WebGLRenderer; camera: THREE.PerspectiveCamera } | null>(null);
  const world = useMemo(() => (ctx ? new World(ctx.gl, ctx.camera) : null), [ctx]);
  const director = useMemo(() => (world ? new Director(world) : null), [world]);
  const t0 = IP.dbg ? performance.now() : 0;
  const P = director ? director.frame(f) : null;
  if (IP.dbg && P) console.log(`[friends] f${f} pose (segment ${director!.cur?.id}) in ${Math.round(performance.now() - t0)} ms`);
  const onCreated = useCallback((s: RootState) => setCtx({ gl: s.gl, camera: s.camera as THREE.PerspectiveCamera }), []);
  const onReady = useCallback(() => continueRender(handle), [handle]);
  const sky = P ? (P.scene === "sky" ? 1 : clamp01(P.sky ?? 0)) : 0;
  return (
    <AbsoluteFill style={{ background: "#0d0e16" }}>
      <ThreeCanvas width={W} height={H} shadows="percentage" gl={GL_OPTS} camera={CAM_OPTS} onCreated={onCreated}>
        {world && P ? <Inner world={world} P={P} onReady={onReady} /> : null}
      </ThreeCanvas>
      {sky > 0 ? <AbsoluteFill style={{ background: `linear-gradient(180deg, ${SKY_H3[0]} 0%, ${SKY_H3[1]} 50%, ${SKY_H3[2]} 100%)`, opacity: sky }} /> : null}
      {P?.overlays ? <AbsoluteFill style={{ pointerEvents: "none", overflow: "hidden" }}>{P.overlays}</AbsoluteFill> : null}
      {P && P.captions !== false && !IP.nocap ? <Caption f={f} /> : null}
      {P?.top ? <AbsoluteFill style={{ pointerEvents: "none" }}>{P.top}</AbsoluteFill> : null}
    </AbsoluteFill>
  );
};
