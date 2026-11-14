// 《采访牛顿的一天》 (formerly 《跟着牛顿过一天》) the film composition "NewtonFilm" (9:15, 1080 x 1800, 30 fps, TOTAL
// frames from the timing; the lens keeps the 1920 frame's width of view: story.ts LENS_H, world.ts setCamera). A copy of
// Qin's Film.tsx (WP1) on the shared kit (src/kit/fx/ink, src/kit/film/env).
// Engine: story.ts (segment contract + how to build a segment), world.ts (places, props, cast).
// Per page (a still, or one farm chunk): the font is loaded, then the World is built ONCE under the delayRender handle
// "newton world build"; per frame the Director picks the segment (exit / enter on a change), then w.beginFrame(f);
// P = SEG.pose(w, f); w.endFrame(P). <Inner> applies the PLACE's look (background, N8AO, bloom, grade: world.look())
// and P.post on the chain N8AO -> InkPass -> lens blur -> the cut-out (IsolatePass, idle off the lead card) -> bloom ->
// NEUTRAL tone mapping -> grade. The composer has a
// stencil buffer (the rig figures layer their heads with it).
// THE FREEZE (skin A's lead card, freeze.ts: the kit's freeze clock, HOLD): the Director poses the world at msHold(f),
// B03's last frame on the card's 75 frames (only while the card is on: gap G2 in the voice track, or a still forcing
// it), the film's own frame otherwise; then wash.ts msWash turns the set and props to a sepia ink drawing on laid paper
// for washAt(f) (the figures stay in colour) and the background goes to the paper (P.post.bg). TOTAL is not changed.
// THE CUT-OUT (the owner, 14 Nov: the lead card ISOLATES him): on the same frames the kit's IsolatePass (src/kit/fx/
// isolate.ts; README "The cut-out for the lead's intro card") keeps Newton and what he holds in colour with a margin of
// the skin's paper and a hard iron-gall edge, lifted off the frozen page (cutout.ts cutState, timed by freeze.ts cutAt /
// cutLift: in with the card's build, out with its exit). It is created with the other passes and sits in the chain
// between the lens blur and bloom; it is set every frame (null off the card), so every other frame is the picture as
// before. Its own wash is off (amount 0): wash.ts is the one wash.
// DOM layers on top, in this order: the whisper's darkened edges, SKIN A's card layer (hud/ms <MsCard>: Humphrey's banner
// and Newton's lead card, under the vlog UI), the HUD layer (hud/: her camera's recording UI (hud/vlog.tsx: the REC
// lamp, the scene's timestamp, the battery; REC and timestamp hidden by Pose.rec === false, the timestamp's big intro
// skipped by Pose.cards === false), every registered HUD and the fact card (hidden by Pose.cards === false), all at the
// HELD frame msHold(f); the whole layer hidden by Pose.hud === false), P.overlays, SKIN A's title and effects (hud/ms
// <MsTitle>, <MsFx>; the skin's three layers hidden with the HUD layer), her whisper bubble, the subtitle (hud/:
// Chinese large, English small under it; the bubble and the subtitle hidden on the card's frozen frames), P.top (the end
// black covers the HUD too), the slate, and last THE PHONE MASK (hud/phone.tsx) when the prop `mask` is true. The old
// title block (hud/title.tsx TitleCard) is no longer mounted: skin A's <MsTitle> replaces it.
// Input props: src/kit/film/env.ts (lang, nocap, nohud, noov, cover, zoom / sx / sy / ov, nopost, slate, kick, dbg,
// ovonly, inksamples), and this film's own:
//   mask: true   THE PHONE MASK for review cuts (default off): the phone app's covered areas (the top-corner icons to
//                y 60, the button column x > 940 from y 950, the post's text from y 1510 on the left, the 54 px
//                margins) as translucent overlays over everything. A component prop or an input prop:
//                bash scripts/kit/queue/remotion_still.sh NewtonFilm 582 /abs/out.png --props='{"mask":true}'
//   cap: {zh, en?, who?}   a caption drawn instead of the frame's own (subtitle layout reviews only)
//   fx: {force, at?, item?}   SKIN A's STILL TEST (hud/ms/when.ts MS_FX; stills only, never the film): force = the item
//                ids drawn even while their voice gap is pending ("title", "banner", "flick", "card", "meter0", "tick1",
//                "stamp", "tick2", "lunch", "meter1", or "all"; forcing "card" also turns the freeze and the wash on);
//                at = 0..1: the whole composition is drawn at the frame that shows item `item` (default: the first
//                forced) at that progress through its frames, whatever frame number is asked for:
//                bash scripts/kit/queue/remotion_still.sh NewtonFilm 0 /abs/out.png --props='{"mask":true,"fx":{"force":["title","card"],"at":0.4}}'
//                (at 0.4 of the title; the card is forced too, so the freeze is on for that render)
//                fx.proof: true (or a local frame t) = skin A's marks proof sheet on top (hud/ms/proof.tsx; stills only)
import React, { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { AbsoluteFill, continueRender, delayRender, useCurrentFrame } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree, type RootState } from "@react-three/fiber";
import { EffectComposer, N8AO } from "@react-three/postprocessing";
import { BlendFunction, BloomEffect, ToneMappingEffect, ToneMappingMode } from "postprocessing";
import { InkPass, noInkFallback } from "../../kit/fx/ink";
import { IsolatePass, type IsolateState } from "../../kit/fx/isolate";
import { IP, ipFlag, ipNum } from "../../kit/film/env";
import { LensBlur } from "../vasa/lensblur";
import { GradeEffect, type GradeParams } from "../vasa/grade";
import { FONT_STACK, useOverlayFont } from "../group/kit/overlay";
import { World } from "./world";
import { W, H, TOTAL, SEGMENTS, huds, lineNo, type Pose, type Segment } from "./story";
// the HUD's layers (hud/index.ts; importing the index also brings hud/index.ts and hud/end.tsx under tsc)
import { Caption, FactCard, PhoneMask, VlogHud } from "./hud";
// SKIN A 「手稿」 (hud/ms/): the title, the two intro cards, the 综艺 effects; the freeze (freeze.ts) and the wash (wash.ts)
import { MS_FX, MsCard, MsFx, MsProof, MsTitle, msAny, msScreen, msStillFrame, type MsCtx } from "./hud/ms";
import { msFrozen, msHold, washAt } from "./freeze";
import { msWash, msWashBg } from "./wash";
// THE CUT-OUT (cutout.ts: the IsolatePass state of the card's frames; the props he holds stay out of the wash too)
import { cutHeld, cutLead, cutState } from "./cutout";
// THE WHISPER (hud/whisper.tsx, whisper.ts): her asides' bubble and darkened edges, under the HUD layer; the bubble
// replaces the subtitle on a whisper line's frames
import { Whisper, whisperCapAt } from "./hud/whisper";
import { SEG as SEG_A } from "./shots/segA";
import { SEG as SEG_B } from "./shots/segB";
import { SEG as SEG_C } from "./shots/segC";
import { SEG as SEG_D } from "./shots/segD";
import { SEG as SEG_E } from "./shots/segE";
import { SEG as SEG_F } from "./shots/segF";
import { SEG as SEG_G } from "./shots/segG";

export const NEWTON_FRAMES = TOTAL;
const COVER = ipFlag("cover"), NOCAP = COVER || ipFlag("nocap"), NOHUD = COVER || ipFlag("nohud"), NOOV = COVER || ipFlag("noov");
const NOPOST = ipFlag("nopost"), DBG = ipFlag("dbg"), SLATE = ipFlag("slate"), KICK = ipNum("kick", 0);
const OVONLY = ipFlag("ovonly"); // the cut's overlay pass: the world is posed every frame, nothing is drawn in 3D, the page is transparent
/** the phone mask (input prop mask: true; default off): never part of the film, only of review stills and cuts */
const MASK = ipFlag("mask");
/** a caption drawn INSTEAD of the frame's own (a review of the subtitle layout only, e.g. a Chinese screen over 13
 *  characters, which the lines file does not have today): --props='{"cap":{"zh":"……","en":"","who":"ji"}}' */
const CAP_TEST = (() => {
  const c = IP.cap as { zh?: unknown; en?: unknown; who?: unknown } | undefined;
  return c && typeof c.zh === "string" ? { zh: c.zh, en: typeof c.en === "string" ? c.en : "", who: (c.who === "nt" || c.who === "hm" ? c.who : "ji") as "ji" | "nt" | "hm" } : null;
})();

// ---------------------------------------------------------------------------------------------------- segments
const SEGS: Segment[] = [SEG_A, SEG_B, SEG_C, SEG_D, SEG_E, SEG_F, SEG_G];
SEGMENTS.forEach((s, i) => {
  const g = SEGS[i];
  if (!g || g.id !== s.id || g.from !== s.from || g.to !== s.to) throw new Error(`segment ${s.id}: SEG must be { id: "${s.id}", from: ${s.from}, to: ${s.to} } (got ${g ? `${g.id} ${g.from}-${g.to}` : "nothing"})`);
});
const segAt = (f: number) => SEGS.find((s) => f >= s.from && f <= s.to) ?? (f < SEGS[0].from ? SEGS[0] : SEGS[SEGS.length - 1]);

/** owns the segment switch: exit the old one, enter the new one; then reset the world and pose the frame. THE FREEZE:
 *  the world is posed at msHold(f) (freeze.ts: B03's last frame on the lead card's frames, f otherwise); then the sepia
 *  wash of the held frame (wash.ts; nothing on the other frames) */
class Director {
  cur: Segment | null = null;
  constructor(readonly w: World) {}
  frame(f: number): Pose {
    const h = msHold(f);
    const s = segAt(h);
    if (s !== this.cur) {
      if (this.cur) this.cur.exit(this.w);
      s.enter(this.w);
      this.cur = s;
    }
    this.w.beginFrame(h);
    const P = s.pose(this.w, h);
    this.w.endFrame(P);
    const wash = washAt(f), lead = wash ? cutLead(this.w) : null;
    msWash(this.w, wash, lead ? cutHeld(this.w, lead) : undefined);
    return wash ? { ...P, post: { ...P.post, bg: msWashBg(P.post?.bg ?? this.w.look().bg, wash) } } : P;
  }
}

// ---------------------------------------------------------------------------------------------------- post defaults
/** the accepted BtCannon grade, as in Arthur and Hongmen; a place may bring its own (sets/index.ts PlaceLook.grade),
 *  a shot may override both (Pose.post.grade) */
export const GRADE_FILM: GradeParams = { ky: [0, 0.1, 0.27, 0.58, 0.82, 0.935, 1], sat: [0.97, 0.98, 0.96], tintS: [0.006, 0.006], tintM: [-0.01, 0.008], tintH: [-0.016, 0.01], vig: [0.16, 0.42] };
const BLOOM = 0.35;
const GL_OPTS = { antialias: false, stencil: false, powerPreference: "high-performance" as const };
const CAM_OPTS = { fov: 46, near: 0.03, far: 600 };

// ---------------------------------------------------------------------------------------------------- inside the canvas
type N8 = { configuration: { aoRadius: number; distanceFalloff: number; intensity: number; color: THREE.Color } };
const Inner: React.FC<{ world: World; P: Pose; iso: IsolateState | null; onReady: () => void }> = ({ world, P, iso, onReady }) => {
  const { scene, camera } = useThree();
  const fx = useMemo(() => ({
    ink: new InkPass(scene, camera as THREE.PerspectiveCamera, { samples: ipNum("inksamples", 8, false) }), // 8 = the film; --props '{"inksamples":4}' = faster checks
    lens: new LensBlur({ maxCoC: 20, nearScale: 1.0 }),
    iso: new IsolatePass(scene, camera),                    // THE CUT-OUT of the lead card (cutout.ts); idle off the card
    bloom: new BloomEffect({ blendFunction: BlendFunction.ADD, intensity: BLOOM, luminanceThreshold: 1.0, luminanceSmoothing: 0.2, mipmapBlur: true }),
    tone: new ToneMappingEffect({ mode: ToneMappingMode.NEUTRAL }),
    grade: new GradeEffect(GRADE_FILM, 1),
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
  fx.bloom.intensity = pp.bloom ?? look.bloom ?? BLOOM;
  fx.grade.set(pp.grade ?? look.grade ?? GRADE_FILM); fx.grade.amount = pp.gradeAmount ?? 1;
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
    const hd = delayRender("newton first frame");
    // The composer (@react-three/postprocessing) is created in a passive effect and gets its passes one re-render
    // later; until then its useFrame (priority 1) swallows the render. So advance once per animation frame until two
    // advances have really drawn (renderer.info.render.frame moved), at most ~4 s of frames.
    let good = 0, tries = 0;
    const step = () => {
      const before = gl.info.render.frame, t0 = performance.now();
      advance(performance.now());
      if (DBG) gl.getContext().finish();
      if (gl.info.render.frame !== before) { good++; if (DBG) console.log(`[newton] advance ${tries} drew in ${Math.round(performance.now() - t0)} ms (GPU finished)`); }
      if (good >= 2 || ++tries > 240) {
        if (good < 2) console.warn(`[newton] first frame: post never drew (${good} draws in ${tries} advances)`);
        if (DBG) console.log(`[newton] first frame after ${tries} advances, ${good} drew, ${gl.info.programs?.length} programs; page time ${Math.round(performance.now())} ms`);
        continueRender(hd); onReady();
      } else requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useLayoutEffect(() => {
    if (first.current) { first.current = false; return; }
    if (KICK <= 0) return;
    const hd = delayRender("newton kick");
    let i = 0; const step = () => { advance(performance.now()); if (++i < KICK) requestAnimationFrame(step); else continueRender(hd); };
    requestAnimationFrame(step);
  }, [f, advance]);
  return null;
};

// ---------------------------------------------------------------------------------------------------- the HUD layer
/** her camera's recording UI, every registered HUD (story.ts registerHud, in registration order) and the fact card
 *  (hud/), drawn at the frame the picture shows (h = msHold(f): held with the picture on the lead card's frames). The
 *  old title block (hud/title.tsx TitleCard) is not mounted any more: skin A's <MsTitle> replaces it. */
const Hud: React.FC<{ h: number; P: Pose }> = ({ h, P }) => (
  <>
    <VlogHud f={h} rec={P.rec} cards={P.cards} />
    {huds().map((x) => <React.Fragment key={x.name}>{x.draw(h, P)}</React.Fragment>)}
    {P.cards !== false ? <FactCard f={h} /> : null}
  </>
);
/** the animatic's slate (input prop slate: true): frame, segment, line and the shot's own label, top left. Its own
 *  layer above everything, also where a shot hides the HUD. */
const Slate: React.FC<{ f: number; P: Pose }> = ({ f, P }) => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <div style={{ position: "absolute", left: 44, top: 96, padding: "8px 16px", borderRadius: 10, background: "rgba(10,12,22,0.62)", color: "#fff", fontFamily: FONT_STACK, fontWeight: 700, fontSize: 34, letterSpacing: 1, whiteSpace: "nowrap" }}>
      {`f${f} · ${segAt(f).id} · L${lineNo(f)}${P.slate ? " · " + P.slate : ""}`}
    </div>
  </AbsoluteFill>
);

// ---------------------------------------------------------------------------------------------------- the composition
export const NewtonFilm: React.FC<{ mask?: boolean }> = ({ mask }) => {
  // the film frame (a still with the fx prop's `at` is drawn at its item's frame instead: hud/ms/when.ts msStillFrame)
  const f = msStillFrame(useCurrentFrame());
  const showMask = mask === true || MASK;
  const [handle] = useState(() => { if (DBG) console.log(`[newton] composition mounted at page time ${Math.round(performance.now())} ms`); return delayRender("newton world build"); });
  const [ctx, setCtx] = useState<{ gl: THREE.WebGLRenderer; camera: THREE.PerspectiveCamera } | null>(null);
  // the font first: anything drawn into textures when the world is built uses it
  const fontReady = useOverlayFont();
  const world = useMemo(() => (ctx && fontReady ? new World(ctx.gl, ctx.camera) : null), [ctx, fontReady]);
  const director = useMemo(() => (world ? new Director(world) : null), [world]);
  const t0 = DBG ? performance.now() : 0;
  const P = director ? director.frame(f) : null;
  // THE CUT-OUT's state for this frame (the world as posed: the held frame on the card's frames), null elsewhere
  const iso = world && P ? cutState(world, f) : null;
  if (DBG && P) console.log(`[newton] f${f} pose (segment ${director!.cur?.id}, place ${world!.place}) in ${Math.round(performance.now() - t0)} ms`);
  // skin A's view of the posed frame (faces, hands, the camera), only on frames where one of its items draws
  const showHud = !!P && P.hud !== false && !NOHUD, frozen = msFrozen(f);
  const ms: MsCtx | null = world && P && showHud && msAny(f) ? msScreen(world, P, f, msHold(f)) : null;
  const onCreated = useCallback((s: RootState) => setCtx({ gl: s.gl, camera: s.camera as THREE.PerspectiveCamera }), []);
  const onReady = useCallback(() => continueRender(handle), [handle]);
  React.useEffect(() => { if (OVONLY && world) continueRender(handle); }, [world, handle]); // ovonly has no <Inner> to release the world handle
  return (
    <AbsoluteFill style={{ background: OVONLY ? "transparent" : "#0d0e16" }}>
      <ThreeCanvas width={W} height={H} shadows="percentage" gl={GL_OPTS} camera={CAM_OPTS} onCreated={onCreated} style={OVONLY ? { visibility: "hidden" } : undefined}>
        {world && P && !OVONLY ? <Inner world={world} P={P} iso={iso} onReady={onReady} /> : null}
      </ThreeCanvas>
      {P ? <Whisper f={f} words={false} edges={!NOOV} /> : null}
      {showHud ? <AbsoluteFill style={{ pointerEvents: "none", overflow: "hidden" }}><MsCard f={f} ctx={ms} /></AbsoluteFill> : null}
      {P && showHud ? <AbsoluteFill style={{ pointerEvents: "none", overflow: "hidden" }}><Hud h={msHold(f)} P={P} /></AbsoluteFill> : null}
      {P?.overlays && !NOOV ? <AbsoluteFill style={{ pointerEvents: "none", overflow: "hidden" }}>{P.overlays}</AbsoluteFill> : null}
      {showHud ? <AbsoluteFill style={{ pointerEvents: "none", overflow: "hidden" }}><MsTitle f={f} ctx={ms} /><MsFx f={f} ctx={ms} /></AbsoluteFill> : null}
      {P && !frozen ? <Whisper f={f} words={P.captions !== false && !NOCAP && !CAP_TEST} edges={false} /> : null}
      {P && !frozen && P.captions !== false && !NOCAP && (CAP_TEST || !whisperCapAt(f)) ? <Caption f={f} cap={CAP_TEST ?? undefined} /> : null}
      {P?.top && !NOOV ? <AbsoluteFill style={{ pointerEvents: "none" }}>{P.top}</AbsoluteFill> : null}
      {P && SLATE ? <Slate f={f} P={P} /> : null}
      {MS_FX.proof !== null ? <MsProof t={MS_FX.proof} /> : null}
      {showMask ? <PhoneMask /> : null}
    </AbsoluteFill>
  );
};
