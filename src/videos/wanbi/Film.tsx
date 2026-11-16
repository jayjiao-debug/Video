// 《完璧归赵》 the film composition "WanbiFilm" (1080 x 1920, 30 fps, TOTAL = 2107 frames). A copy of Hongmen's
// Film.tsx (WP1b, frozen after it) on the shared kit (src/kit/fx/ink, src/kit/film/env).
// Engine: story.ts (segment contract + how to build a segment), world.ts (places, props, cast).
// Per page (a still, or one farm chunk): the font is loaded, then the World is built ONCE under the delayRender handle
// "wanbi world build"; per frame the Director picks the segment (exit / enter on a change), then w.beginFrame(f);
// P = SEG.pose(w, f); w.endFrame(P). <Inner> applies the PLACE's look (background, N8AO, bloom, grade: world.look())
// and P.post on the chain N8AO -> InkPass -> lens blur -> bloom -> NEUTRAL tone mapping -> grade. The composer has a
// stencil buffer (the rig figures layer their heads with it).
// DOM layers on top, in this order: the HUD layer (story.ts registerHud: the source tag, the jade chip; hidden by
// Pose.hud === false), P.overlays, the caption, P.top.
// Input props: src/kit/film/env.ts (lang, nocap, nohud, noov, cover, zoom / sx / sy / ov, nopost, slate, kick, dbg,
// ovonly, inksamples).
import React, { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { AbsoluteFill, continueRender, delayRender, useCurrentFrame } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree, type RootState } from "@react-three/fiber";
import { EffectComposer, N8AO } from "@react-three/postprocessing";
import { BlendFunction, BloomEffect, ToneMappingEffect, ToneMappingMode } from "postprocessing";
import { InkPass, noInkFallback } from "../../kit/fx/ink";
import { ipFlag, ipNum } from "../../kit/film/env";
import { LensBlur } from "../vasa/lensblur";
import { GradeEffect, type GradeParams } from "../vasa/grade";
import { FONT_STACK, COL, useOverlayFont } from "../group/kit/overlay";
import { World } from "./world";
import { W, H, TOTAL, CAPTION_Y, ROW_PX, SEGMENTS, clamp01, easeOutBack, huds, lineNo, type Pose, type Segment } from "./story";
import { captionAt, captionRuns, TRAILING_PUNCT } from "./captions";
import { captionAtEN } from "./captions_en";
import { EN } from "./lang";
import { SEG as SEG_A } from "./shots/segA";
import { SEG as SEG_B } from "./shots/segB";
import { SEG as SEG_C } from "./shots/segC";
import { SEG as SEG_D } from "./shots/segD";
import { SEG as SEG_E } from "./shots/segE";
import "./hud"; // the overlay package (hud/index.ts): importing it registers the source tag and the jade chip as HUDs

export const WANBI_FRAMES = TOTAL;
const COVER = ipFlag("cover"), NOCAP = COVER || ipFlag("nocap"), NOHUD = COVER || ipFlag("nohud"), NOOV = COVER || ipFlag("noov");
const NOPOST = ipFlag("nopost"), DBG = ipFlag("dbg"), SLATE = ipFlag("slate"), KICK = ipNum("kick", 0);
const OVONLY = ipFlag("ovonly"); // the cut's overlay pass: the world is posed every frame, nothing is drawn in 3D, the page is transparent

// ---------------------------------------------------------------------------------------------------- segments
const SEGS: Segment[] = [SEG_A, SEG_B, SEG_C, SEG_D, SEG_E];
SEGMENTS.forEach((s, i) => {
  const g = SEGS[i];
  if (!g || g.id !== s.id || g.from !== s.from || g.to !== s.to) throw new Error(`segment ${s.id}: SEG must be { id: "${s.id}", from: ${s.from}, to: ${s.to} } (got ${g ? `${g.id} ${g.from}-${g.to}` : "nothing"})`);
});
const segAt = (f: number) => SEGS.find((s) => f >= s.from && f <= s.to) ?? (f < SEGS[0].from ? SEGS[0] : SEGS[SEGS.length - 1]);

/** owns the segment switch: exit the old one, enter the new one; then reset the world and pose the frame */
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
/** the accepted BtCannon grade, as in Arthur and Hongmen; a place may bring its own (sets/index.ts PlaceLook.grade),
 *  a shot may override both (Pose.post.grade) */
export const GRADE_FILM: GradeParams = { ky: [0, 0.1, 0.27, 0.58, 0.82, 0.935, 1], sat: [0.97, 0.98, 0.96], tintS: [0.006, 0.006], tintM: [-0.01, 0.008], tintH: [-0.016, 0.01], vig: [0.16, 0.42] };
const BLOOM = 0.35;
const GL_OPTS = { antialias: false, stencil: false, powerPreference: "high-performance" as const };
const CAM_OPTS = { fov: 46, near: 0.03, far: 600 };

// ---------------------------------------------------------------------------------------------------- inside the canvas
type N8 = { configuration: { aoRadius: number; distanceFalloff: number; intensity: number; color: THREE.Color } };
const Inner: React.FC<{ world: World; P: Pose; onReady: () => void }> = ({ world, P, onReady }) => {
  const { scene, camera } = useThree();
  const fx = useMemo(() => ({
    ink: new InkPass(scene, camera as THREE.PerspectiveCamera, { samples: ipNum("inksamples", 8, false) }), // 8 = the film; --props '{"inksamples":4}' = faster checks
    lens: new LensBlur({ maxCoC: 20, nearScale: 1.0 }),
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
    const hd = delayRender("wanbi first frame");
    // The composer (@react-three/postprocessing) is created in a passive effect and gets its passes one re-render
    // later; until then its useFrame (priority 1) swallows the render. So advance once per animation frame until two
    // advances have really drawn (renderer.info.render.frame moved), at most ~4 s of frames.
    let good = 0, tries = 0;
    const step = () => {
      const before = gl.info.render.frame, t0 = performance.now();
      advance(performance.now());
      if (DBG) gl.getContext().finish();
      if (gl.info.render.frame !== before) { good++; if (DBG) console.log(`[wanbi] advance ${tries} drew in ${Math.round(performance.now() - t0)} ms (GPU finished)`); }
      if (good >= 2 || ++tries > 240) {
        if (good < 2) console.warn(`[wanbi] first frame: post never drew (${good} draws in ${tries} advances)`);
        if (DBG) console.log(`[wanbi] first frame after ${tries} advances, ${good} drew, ${gl.info.programs?.length} programs; page time ${Math.round(performance.now())} ms`);
        continueRender(hd); onReady();
      } else requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useLayoutEffect(() => {
    if (first.current) { first.current = false; return; }
    if (KICK <= 0) return;
    const hd = delayRender("wanbi kick");
    let i = 0; const step = () => { advance(performance.now()); if (++i < KICK) requestAnimationFrame(step); else continueRender(hd); };
    requestAnimationFrame(step);
  }, [f, advance]);
  return null;
};

// ---------------------------------------------------------------------------------------------------- captions
/** Noto Sans SC Bold 72 px, white, gold key words. NOTHING behind it (no box, no plate, no shade): the words carry a
 *  thick ink line, drawn as a layer of its own UNDER the fills, with a hard little drop and a soft dark shadow.
 *  Centred at y 70 % (CAPTION_Y); a small pop-in per group (none on a group that starts on frame 0); the group on
 *  screen is the group being spoken (captions.ts), and its gold key word gives a small punch on the frame its first
 *  syllable falls (its place between the group's from and end).
 *  A group with ROWS (line 1, from frame 0: the thumbnail's subtitle) is drawn as its rows, one under the other, at
 *  ROW_PX (64), the block centred on CAPTION_Y; each row is centred on its own ink.
 *  Optical centring: full-width marks carry half an em of blank on one side (，。：？！” on their right, “ on its
 *  left). A row is shifted by half the difference, so that the INK is centred. */
const LEAD_PUNCT = "“‘（《「";
const CAP_PX = 72, CAP_INK = "#12111a", ROW_GAP = 1.3;
type Run = { text: string; gold: boolean };
/** one line of the caption: its runs, centred on its ink at (0, y) of the caption's anchor */
const CapRow: React.FC<{ runs: Run[]; px: number; y: number; bumps: number[]; en: boolean }> = ({ runs, px, y, bumps, en }) => {
  const plain = [...runs.map((r) => r.text).join("")];
  let blankR = 0, blankL = 0;
  if (!en) {
    for (let i = plain.length - 1; i >= 0 && TRAILING_PUNCT.includes(plain[i]); i--) blankR += 0.5;
    for (let i = 0; i < plain.length && LEAD_PUNCT.includes(plain[i]); i++) blankL += 0.5;
  }
  const shift = ((blankR - blankL) / 2) * px;
  const text: React.CSSProperties = { fontFamily: FONT_STACK, fontWeight: 700, fontSize: px, lineHeight: 1, letterSpacing: en ? 0.5 : 2, whiteSpace: en ? "pre" : "nowrap" };
  const line = Math.round(px * 0.19);                         // the ink line's full width: half of it shows outside the glyph
  const under: React.CSSProperties = { color: CAP_INK, WebkitTextStroke: `${line}px ${CAP_INK}`, textShadow: `0 ${Math.round(px * 0.06)}px 0 rgba(8,8,16,0.5), 0 ${Math.round(px * 0.08)}px ${Math.round(px * 0.3)}px rgba(8,8,16,0.5)` } as React.CSSProperties;
  const spans = (fill: boolean) => runs.map((r, i) => (
    <span key={i} style={{ display: "inline-block", transform: `scale(${bumps[i].toFixed(4)})`, transformOrigin: "50% 62%", color: fill ? (r.gold ? COL.gold : COL.white) : undefined }}>{r.text}</span>
  ));
  return (
    <div style={{ position: "absolute", left: shift, top: y, transform: "translate(-50%, -50%)", ...text }}>
      <span style={under}>{spans(false)}</span>
      <span style={{ position: "absolute", left: 0, top: 0 }}>{spans(true)}</span>
    </div>
  );
};
export const Caption: React.FC<{ f: number }> = ({ f }) => {
  useOverlayFont();
  const en = EN ? captionAtEN(f) : null;
  const c = EN ? en : captionAt(f);
  if (!c) return null;
  const k = c.from === 0 ? 1 : clamp01((f - c.from + 1) / 5);
  const s = c.from === 0 ? 1 : 0.86 + 0.14 * easeOutBack(k, 2.2), o = c.from === 0 ? 1 : clamp01((f - c.from + 1) / 2.5);
  const rows = c.rows && c.rows.length ? c.rows : [c.text];
  const px = c.rows && c.rows.length ? (en ? Math.min(en.px, ROW_PX) : ROW_PX) : en ? en.px : CAP_PX;
  // the key word's punch: on the frame its first syllable falls (its share of the group's spoken frames over ALL its
  // rows), 5 frames long. (English: a long gold run punches less, down to +5 %)
  const len = [...rows.join("").replace(/[【】]/g, "")].length;
  let pos = 0;
  const lines = rows.map((row) => {
    const runs = captionRuns(row);
    const bumps = runs.map((r) => {
      const at = c.from + Math.round((pos / Math.max(1, len)) * (c.end - c.from)); pos += [...r.text].length;
      const amp = en ? Math.max(0.05, 0.13 * Math.min(1, 4 / Math.max(1, [...r.text.trim()].length))) : 0.13;
      return r.gold && f >= at && f < at + 5 ? 1 + amp * (1 - (f - at) / 5) : 1;
    });
    return { runs, bumps };
  });
  const step = px * ROW_GAP, y0 = -((lines.length - 1) * step) / 2;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: W / 2, top: CAPTION_Y, width: 0, height: 0, opacity: o, transform: `scale(${s})`, transformOrigin: "0 0" }}>
        {lines.map((l, i) => <CapRow key={i} runs={l.runs} bumps={l.bumps} px={px} y={y0 + i * step} en={!!en} />)}
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------------------------------- the HUD layer
/** every registered HUD (story.ts registerHud), in registration order */
const Hud: React.FC<{ f: number; P: Pose }> = ({ f, P }) => <>{huds().map((x) => <React.Fragment key={x.name}>{x.draw(f, P)}</React.Fragment>)}</>;
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
export const WanbiFilm: React.FC = () => {
  const f = useCurrentFrame();
  const [handle] = useState(() => { if (DBG) console.log(`[wanbi] composition mounted at page time ${Math.round(performance.now())} ms`); return delayRender("wanbi world build"); });
  const [ctx, setCtx] = useState<{ gl: THREE.WebGLRenderer; camera: THREE.PerspectiveCamera } | null>(null);
  // the font first: anything drawn into textures when the world is built uses it
  const fontReady = useOverlayFont();
  const world = useMemo(() => (ctx && fontReady ? new World(ctx.gl, ctx.camera) : null), [ctx, fontReady]);
  const director = useMemo(() => (world ? new Director(world) : null), [world]);
  const t0 = DBG ? performance.now() : 0;
  const P = director ? director.frame(f) : null;
  if (DBG && P) console.log(`[wanbi] f${f} pose (segment ${director!.cur?.id}, place ${world!.place}) in ${Math.round(performance.now() - t0)} ms`);
  const onCreated = useCallback((s: RootState) => setCtx({ gl: s.gl, camera: s.camera as THREE.PerspectiveCamera }), []);
  const onReady = useCallback(() => continueRender(handle), [handle]);
  React.useEffect(() => { if (OVONLY && world) continueRender(handle); }, [world, handle]); // ovonly has no <Inner> to release the world handle
  return (
    <AbsoluteFill style={{ background: OVONLY ? "transparent" : "#0d0e16" }}>
      <ThreeCanvas width={W} height={H} shadows="percentage" gl={GL_OPTS} camera={CAM_OPTS} onCreated={onCreated} style={OVONLY ? { visibility: "hidden" } : undefined}>
        {world && P && !OVONLY ? <Inner world={world} P={P} onReady={onReady} /> : null}
      </ThreeCanvas>
      {P && P.hud !== false && !NOHUD ? <AbsoluteFill style={{ pointerEvents: "none", overflow: "hidden" }}><Hud f={f} P={P} /></AbsoluteFill> : null}
      {P?.overlays && !NOOV ? <AbsoluteFill style={{ pointerEvents: "none", overflow: "hidden" }}>{P.overlays}</AbsoluteFill> : null}
      {P && P.captions !== false && !NOCAP ? <Caption f={f} /> : null}
      {P?.top && !NOOV ? <AbsoluteFill style={{ pointerEvents: "none" }}>{P.top}</AbsoluteFill> : null}
      {P && SLATE ? <Slate f={f} P={P} /> : null}
    </AbsoluteFill>
  );
};
