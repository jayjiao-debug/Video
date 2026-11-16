// THE DAY ENGINE's film shell: the composition every day film renders through. Taken from Newton's Film.tsx (the
// newest of the four copies: the same canvas, post chain, first-frame kick and layer order as 秦始皇 / 苏东坡 / 李白,
// plus the freeze clock and the cut-out pass). A film's Film.tsx gives its World, its segments and its layers:
//
//   export const NewtonFilm = makeDayFilm({ name: "newton", W, H, segments: SEGS, timeline: SEGMENTS, makeWorld: (gl, cam) => new World(gl, cam),
//     grade: GRADE_FILM, lineNo, layers: { hud: (c) => <Hud .../>, subtitles: (c) => <Caption f={c.f} /> } });
//
// Per page (a still, or one farm chunk): the font is loaded, then the World is built ONCE under a delayRender handle;
// per frame the Director picks the segment (exit / enter on a change), then w.beginFrame(h); P = SEG.pose(w, h);
// w.endFrame(P), where h = hold(f) (the freeze clock: f itself unless the film holds a frame, e.g. under a lead card);
// then afterPose(w, f, P) may change the posed world (Newton's sepia wash). <Inner> applies the PLACE's look
// (background, N8AO, bloom, grade: world.look()) and P.post on the chain N8AO -> InkPass -> lens blur -> the cut-out
// (IsolatePass, idle unless iso(w, f) gives a state) -> bloom -> NEUTRAL tone mapping -> grade. The composer has a
// stencil buffer (the rig figures layer their heads with it).
// DOM layers on top, in this order:  under  ->  the HUD layer (hud: hidden by Pose.hud === false or the input props)
//   ->  P.overlays  ->  over  ->  subtitles  ->  P.top  ->  the slate (input prop slate)  ->  extra  ->  the phone mask
//   (input prop mask, or the component prop), all inside wrap (Newton's switch-off squeezes the whole frame).
// Input props (src/kit/film/env.ts): cover, nocap, nohud, noov, nopost, dbg, slate, kick, ovonly, inksamples, mask.
import React, { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { AbsoluteFill, continueRender, delayRender, useCurrentFrame } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree, type RootState } from "@react-three/fiber";
import { EffectComposer, N8AO } from "@react-three/postprocessing";
import { BlendFunction, BloomEffect, ToneMappingEffect, ToneMappingMode } from "postprocessing";
import { InkPass, noInkFallback } from "../fx/ink";
import { IsolatePass, type IsolateState } from "../fx/isolate";
import { ipFlag, ipNum } from "../film/env";
import { LensBlur } from "../../videos/vasa/lensblur";
import { GradeEffect, type GradeParams } from "../../videos/vasa/grade";
import { FONT_STACK, useOverlayFont } from "../../videos/group/kit/overlay";
import type { DayPose, PlaceLook } from "./types";

const COVER = ipFlag("cover"), NOCAP = COVER || ipFlag("nocap"), NOHUD = COVER || ipFlag("nohud"), NOOV = COVER || ipFlag("noov");
const NOPOST = ipFlag("nopost"), DBG = ipFlag("dbg"), SLATE = ipFlag("slate"), KICK = ipNum("kick", 0);
const OVONLY = ipFlag("ovonly"); // the cut's overlay pass: the world is posed every frame, nothing is drawn in 3D, the page is transparent
/** the phone mask (input prop mask: true; default off): never part of the film, only of review stills and cuts */
const MASK = ipFlag("mask");

/** the accepted BtCannon grade, as in Arthur, Hongmen and the day films; a place may bring its own (PlaceLook.grade),
 *  a shot may override both (Pose.post.grade) */
export const GRADE_FILM: GradeParams = { ky: [0, 0.1, 0.27, 0.58, 0.82, 0.935, 1], sat: [0.97, 0.98, 0.96], tintS: [0.006, 0.006], tintM: [-0.01, 0.008], tintH: [-0.016, 0.01], vig: [0.16, 0.42] };
export const BLOOM = 0.35;
const GL_OPTS = { antialias: false, stencil: false, powerPreference: "high-performance" as const };
const CAM_OPTS = { fov: 46, near: 0.03, far: 600 };

/** what the shell needs of a World */
export interface ShellWorld<P> {
  root: THREE.Object3D;
  place: unknown;
  look(): PlaceLook;
  beginFrame(f: number): void;
  endFrame(P: P): void;
}
export type ShellSegment<Wd, P> = { id: string; from: number; to: number; enter(w: Wd): void; exit(w: Wd): void; pose(w: Wd, f: number): P };

/** what every layer function gets for the frame (X = the film's own per-frame context: prepare()) */
export type LayerCtx<Wd, P, X> = {
  /** the film frame */ f: number;
  /** the frame the picture shows (hold(f)) */ h: number;
  world: Wd | null; P: P | null;
  /** the HUD layer shows on this frame (P, P.hud !== false, no nohud / cover) */ showHud: boolean;
  /** the input props: subtitles off (nocap / cover), overlays off (noov / cover) */ nocap: boolean; noov: boolean;
  x: X | null;
};
export type DayFilmSpec<Wd extends ShellWorld<P>, P extends DayPose, X> = {
  /** the film's name, for logs and the delayRender labels ("newton") */
  name: string;
  W: number; H: number;
  /** the segments in film order (shots/segX.ts SEG), checked against the timeline's SEGMENTS */
  segments: ShellSegment<Wd, P>[];
  timeline: { id: string; from: number; to: number }[];
  makeWorld(gl: THREE.WebGLRenderer, camera: THREE.PerspectiveCamera): Wd;
  /** the film's grade and bloom when a place has none (default GRADE_FILM, BLOOM) */
  grade?: GradeParams; bloom?: number;
  /** the line number of frame f, for the slate */
  lineNo?(f: number): number;
  /** the frame the world is posed at (a freeze); default f */
  hold?(f: number): number;
  /** after the pose: change the posed world, return the Pose to draw (default P) */
  afterPose?(w: Wd, f: number, P: P): P;
  /** the cut-out pass's state for the frame (default none) */
  iso?(w: Wd, f: number): IsolateState | null;
  /** the frame a still draws instead of the one asked for (default f) */
  stillFrame?(f: number): number;
  /** the film's own per-frame context for the layers */
  prepare?(c: LayerCtx<Wd, P, X>): X | null;
  layers?: {
    under?(c: LayerCtx<Wd, P, X>): React.ReactNode;
    hud?(c: LayerCtx<Wd, P, X>): React.ReactNode;
    over?(c: LayerCtx<Wd, P, X>): React.ReactNode;
    subtitles?(c: LayerCtx<Wd, P, X>): React.ReactNode;
    extra?(c: LayerCtx<Wd, P, X>): React.ReactNode;
    mask?(c: LayerCtx<Wd, P, X>): React.ReactNode;
    wrap?(f: number, children: React.ReactNode): React.ReactNode;
  };
};

export function makeDayFilm<Wd extends ShellWorld<P>, P extends DayPose, X = unknown>(spec: DayFilmSpec<Wd, P, X>): React.FC<{ mask?: boolean }> {
  const { name, W, H } = spec;
  const SEGS = spec.segments;
  spec.timeline.forEach((s, i) => {
    const g = SEGS[i];
    if (!g || g.id !== s.id || g.from !== s.from || g.to !== s.to) throw new Error(`segment ${s.id}: SEG must be { id: "${s.id}", from: ${s.from}, to: ${s.to} } (got ${g ? `${g.id} ${g.from}-${g.to}` : "nothing"})`);
  });
  const segAt = (f: number) => SEGS.find((s) => f >= s.from && f <= s.to) ?? (f < SEGS[0].from ? SEGS[0] : SEGS[SEGS.length - 1]);
  const hold = spec.hold ?? ((f: number) => f);
  const GRADE = spec.grade ?? GRADE_FILM, BLOOM0 = spec.bloom ?? BLOOM;
  const L = spec.layers ?? {};

  /** owns the segment switch: exit the old one, enter the new one; then reset the world and pose the frame */
  class Director {
    cur: ShellSegment<Wd, P> | null = null;
    constructor(readonly w: Wd) {}
    frame(f: number): P {
      const h = hold(f);
      const s = segAt(h);
      if (s !== this.cur) {
        if (this.cur) this.cur.exit(this.w);
        s.enter(this.w);
        this.cur = s;
      }
      this.w.beginFrame(h);
      const P = s.pose(this.w, h);
      this.w.endFrame(P);
      return spec.afterPose ? spec.afterPose(this.w, f, P) : P;
    }
  }

  type N8 = { configuration: { aoRadius: number; distanceFalloff: number; intensity: number; color: THREE.Color } };
  const Inner: React.FC<{ world: Wd; P: P; iso: IsolateState | null; onReady: () => void }> = ({ world, P, iso, onReady }) => {
    const { scene, camera } = useThree();
    const fx = useMemo(() => ({
      ink: new InkPass(scene, camera as THREE.PerspectiveCamera, { samples: ipNum("inksamples", 8, false) }), // 8 = the film; --props '{"inksamples":4}' = faster checks
      lens: new LensBlur({ maxCoC: 20, nearScale: 1.0 }),
      iso: new IsolatePass(scene, camera),                    // THE CUT-OUT (a lead card); idle unless iso() gives a state
      bloom: new BloomEffect({ blendFunction: BlendFunction.ADD, intensity: BLOOM0, luminanceThreshold: 1.0, luminanceSmoothing: 0.2, mipmapBlur: true }),
      tone: new ToneMappingEffect({ mode: ToneMappingMode.NEUTRAL }),
      grade: new GradeEffect(GRADE, 1),
    }), [scene, camera]);
    const ao = useRef<N8 | null>(null);
    // the place's look for this frame (the N8AO element is created with the first place's values and re-set every frame)
    const look = world.look(), pp = P.post ?? {};
    const first = useRef(look.ao);
    const post = useMemo(() => (
      <EffectComposer multisampling={4} stencilBuffer>
        <N8AO ref={ao as never} aoRadius={first.current.aoRadius} distanceFalloff={first.current.distanceFalloff} intensity={first.current.intensity} color={first.current.color as never} quality="high" halfRes={false} />
        <primitive object={fx.ink} dispose={null} />
        <primitive object={fx.lens.pre} dispose={null} />
        <primitive object={fx.lens.main} dispose={null} />
        <primitive object={fx.iso} dispose={null} />
        <primitive object={fx.bloom} dispose={null} />
        <primitive object={fx.tone} dispose={null} />
        <primitive object={fx.grade} dispose={null} />
      </EffectComposer>
    ), [fx]);
    // per frame: the place's values, then the pose's own (defaults where omitted)
    const bg = useMemo(() => new THREE.Color(), []), aoCol = useMemo(() => new THREE.Color(), []);
    scene.background = bg.set(pp.bg ?? look.bg);
    fx.lens.focus = pp.dof?.focus ?? 10; fx.lens.cInf = pp.dof ? pp.dof.amount : 0;
    fx.bloom.intensity = pp.bloom ?? look.bloom ?? BLOOM0;
    fx.grade.set(pp.grade ?? look.grade ?? GRADE); fx.grade.amount = pp.gradeAmount ?? 1;
    fx.ink.set({ strength: pp.ink ?? 1 });
    fx.iso.set(iso);                                          // every frame: null (or k 0) leaves the picture untouched
    noInkFallback(world.root);
    const aoMul = pp.ao ?? 1;
    useLayoutEffect(() => {
      const c = ao.current?.configuration; if (!c) return;
      const a = look.ao, k = a.intensity * aoMul;
      if (c.aoRadius !== a.aoRadius) c.aoRadius = a.aoRadius;
      if (c.distanceFalloff !== a.distanceFalloff) c.distanceFalloff = a.distanceFalloff;
      if (c.intensity !== k) c.intensity = k;
      aoCol.set(a.color); if (!c.color.equals(aoCol)) c.color = aoCol.clone();
    });
    return (<><primitive object={world.root} dispose={null} />{NOPOST ? null : post}<FirstKick onReady={onReady} /></>);
  };

  /** first frame of the page: two extra advances once the composer has subscribed, then release the world handle.
   *  Later frames are drawn by ThreeCanvas' ManualFrameRenderer (one advance per frame) plus `kick` extra advances. */
  const FirstKick: React.FC<{ onReady: () => void }> = ({ onReady }) => {
    const f = useCurrentFrame();
    const advance = useThree((s) => s.advance);
    const gl = useThree((s) => s.gl);
    const first = useRef(true);
    useLayoutEffect(() => {
      const hd = delayRender(`${name} first frame`);
      // The composer (@react-three/postprocessing) is created in a passive effect and gets its passes one re-render
      // later; until then its useFrame (priority 1) swallows the render. So advance once per animation frame until two
      // advances have really drawn (renderer.info.render.frame moved), at most ~4 s of frames.
      let good = 0, tries = 0;
      const step = () => {
        const before = gl.info.render.frame, t0 = performance.now();
        advance(performance.now());
        if (DBG) gl.getContext().finish();
        if (gl.info.render.frame !== before) { good++; if (DBG) console.log(`[${name}] advance ${tries} drew in ${Math.round(performance.now() - t0)} ms (GPU finished)`); }
        if (good >= 2 || ++tries > 240) {
          if (good < 2) console.warn(`[${name}] first frame: post never drew (${good} draws in ${tries} advances)`);
          if (DBG) console.log(`[${name}] first frame after ${tries} advances, ${good} drew, ${gl.info.programs?.length} programs; page time ${Math.round(performance.now())} ms`);
          continueRender(hd); onReady();
        } else requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    useLayoutEffect(() => {
      if (first.current) { first.current = false; return; }
      if (KICK <= 0) return;
      const hd = delayRender(`${name} kick`);
      let i = 0; const step = () => { advance(performance.now()); if (++i < KICK) requestAnimationFrame(step); else continueRender(hd); };
      requestAnimationFrame(step);
    }, [f, advance]);
    return null;
  };

  /** the animatic's slate (input prop slate: true): frame, segment, line and the shot's own label, top left */
  const Slate: React.FC<{ f: number; P: P }> = ({ f, P }) => (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: 120, top: 360, padding: "8px 16px", borderRadius: 10, background: "rgba(10,12,22,0.62)", color: "#fff", fontFamily: FONT_STACK, fontWeight: 700, fontSize: 34, letterSpacing: 1, whiteSpace: "nowrap" }}>
        {`f${f} · ${segAt(f).id} · L${spec.lineNo ? spec.lineNo(f) : "?"}${P.slate ? " · " + P.slate : ""}`}
      </div>
    </AbsoluteFill>
  );

  const Film: React.FC<{ mask?: boolean }> = ({ mask }) => {
    const f = spec.stillFrame ? spec.stillFrame(useCurrentFrame()) : useCurrentFrame();
    const showMask = mask === true || MASK;
    const [handle] = useState(() => { if (DBG) console.log(`[${name}] composition mounted at page time ${Math.round(performance.now())} ms`); return delayRender(`${name} world build`); });
    const [ctx, setCtx] = useState<{ gl: THREE.WebGLRenderer; camera: THREE.PerspectiveCamera } | null>(null);
    // the font first: anything drawn into textures when the world is built uses it
    const fontReady = useOverlayFont();
    const world = useMemo(() => (ctx && fontReady ? spec.makeWorld(ctx.gl, ctx.camera) : null), [ctx, fontReady]);
    const director = useMemo(() => (world ? new Director(world) : null), [world]);
    const t0 = DBG ? performance.now() : 0;
    const P = director ? director.frame(f) : null;
    const iso = world && P && spec.iso ? spec.iso(world, f) : null;
    if (DBG && P) console.log(`[${name}] f${f} pose (segment ${director!.cur?.id}, place ${String(world!.place)}) in ${Math.round(performance.now() - t0)} ms`);
    const showHud = !!P && P.hud !== false && !NOHUD;
    const c: LayerCtx<Wd, P, X> = { f, h: hold(f), world, P, showHud, nocap: NOCAP, noov: NOOV, x: null };
    c.x = spec.prepare ? spec.prepare(c) : null;
    const onCreated = useCallback((s: RootState) => setCtx({ gl: s.gl, camera: s.camera as THREE.PerspectiveCamera }), []);
    const onReady = useCallback(() => continueRender(handle), [handle]);
    React.useEffect(() => { if (OVONLY && world) continueRender(handle); }, [world, handle]); // ovonly has no <Inner> to release the world handle
    const body = (
      <AbsoluteFill style={{ background: OVONLY ? "transparent" : "#0d0e16" }}>
        <ThreeCanvas width={W} height={H} shadows="percentage" gl={GL_OPTS} camera={CAM_OPTS} onCreated={onCreated} style={OVONLY ? { visibility: "hidden" } : undefined}>
          {world && P && !OVONLY ? <Inner world={world} P={P} iso={iso} onReady={onReady} /> : null}
        </ThreeCanvas>
        {L.under ? L.under(c) : null}
        {P && showHud && L.hud ? <AbsoluteFill style={{ pointerEvents: "none", overflow: "hidden" }}>{L.hud(c)}</AbsoluteFill> : null}
        {P?.overlays && !NOOV ? <AbsoluteFill style={{ pointerEvents: "none", overflow: "hidden" }}>{P.overlays}</AbsoluteFill> : null}
        {L.over ? L.over(c) : null}
        {L.subtitles ? L.subtitles(c) : null}
        {P?.top && !NOOV ? <AbsoluteFill style={{ pointerEvents: "none" }}>{P.top}</AbsoluteFill> : null}
        {P && SLATE ? <Slate f={f} P={P} /> : null}
        {L.extra ? L.extra(c) : null}
        {showMask && L.mask ? L.mask(c) : null}
      </AbsoluteFill>
    );
    return <>{L.wrap ? L.wrap(f, body) : body}</>;
  };
  return Film;
}
