// 《鸿门宴，到底死了谁？》 the film composition "HongmenFilm" (1080 x 1920, 30 fps, TOTAL frames).
// Engine: see story.ts (segment contract + how to build a segment), world.ts (places, props, cast) and
// /home/user/hm_notes/e_engine.md.
// Per page (a still, or one farm chunk): the font is loaded, then the World is built ONCE under the delayRender handle
// "hongmen world build"; per frame the Director picks the segment (exit / enter on a change), then w.beginFrame(f);
// P = SEG.pose(w, f); w.endFrame(P). <Inner> applies the PLACE's look (background, N8AO, bloom, grade: world.look())
// and P.post on the chain N8AO -> InkPass -> lens blur -> bloom -> NEUTRAL tone mapping -> grade. The composer has a
// stencil buffer (the rig figures layer their heads with it).
// DOM layers on top, in this order: the HUD layer (story.ts registerHud; hidden by Pose.hud === false), P.overlays,
// the caption, P.top.
// Input props: env.ts (lang, nocap, nohud, noov, cover, zoom / sx / sy / ov, nopost, slate, kick, dbg).
import React, { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { AbsoluteFill, continueRender, delayRender, useCurrentFrame } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree, type RootState } from "@react-three/fiber";
import { EffectComposer, N8AO } from "@react-three/postprocessing";
import { BlendFunction, BloomEffect, ToneMappingEffect, ToneMappingMode } from "postprocessing";
import { InkPass, noInkFallback } from "./fx/ink"; // the stable outline pass (fx/README.md); the old one: "../vasa/ink"
import { LensBlur } from "../vasa/lensblur";
import { GradeEffect, type GradeParams } from "../vasa/grade";
import { FONT_STACK, COL, useOverlayFont } from "../group/kit/overlay";
import { World } from "./world";
import { W, H, TOTAL, CAPTION_Y, SEGMENTS, clamp01, easeOutBack, huds, lineNo, registerHud, type Pose, type Segment } from "./story";
import { captionAt, captionRuns, TRAILING_PUNCT } from "./captions";
import { captionAtEN } from "./captions_en";
import { EN, TXT } from "./lang";
import { ipFlag, ipNum } from "./env";
import { BEAT } from "./beats";
import { SEG as SEG_A } from "./shots/segA";
import { SEG as SEG_B } from "./shots/segB";
import { SEG as SEG_C } from "./shots/segC";
import { SEG as SEG_D } from "./shots/segD";
import { SEG as SEG_E } from "./shots/segE";

export const HONGMEN_FRAMES = TOTAL;
const COVER = ipFlag("cover"), NOCAP = COVER || ipFlag("nocap"), NOHUD = COVER || ipFlag("nohud"), NOOV = COVER || ipFlag("noov");
const NOPOST = ipFlag("nopost"), DBG = ipFlag("dbg"), SLATE = ipFlag("slate"), KICK = ipNum("kick", 0);
const OVONLY = ipFlag("ovonly"); // the cut's overlay pass (scripts/hongmen/cut): the world is posed every frame, nothing is drawn in 3D, the page is transparent

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
/** the accepted BtCannon grade (bt/BtCannon.tsx GRADE_BT), as in the Arthur film; a place may bring its own
 *  (sets/index.ts PlaceLook.grade), a shot may override both (Pose.post.grade) */
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
    const hd = delayRender("hongmen first frame");
    // The composer (@react-three/postprocessing) is created in a passive effect and gets its passes one re-render
    // later; until then its useFrame (priority 1) swallows the render. So advance once per animation frame until two
    // advances have really drawn (renderer.info.render.frame moved), at most ~4 s of frames.
    let good = 0, tries = 0;
    const step = () => {
      const before = gl.info.render.frame, t0 = performance.now();
      advance(performance.now());
      if (DBG) gl.getContext().finish(); // dbg only: wait for the GPU so the timing below is the real frame cost
      if (gl.info.render.frame !== before) { good++; if (DBG) console.log(`[hongmen] advance ${tries} drew in ${Math.round(performance.now() - t0)} ms (GPU finished)`); }
      if (good >= 2 || ++tries > 240) {
        if (good < 2) console.warn(`[hongmen] first frame: post never drew (${good} draws in ${tries} advances)`);
        if (DBG) console.log(`[hongmen] first frame after ${tries} advances, ${good} drew, ${gl.info.programs?.length} programs; page time ${Math.round(performance.now())} ms`);
        continueRender(hd); onReady();
      } else requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useLayoutEffect(() => {
    if (first.current) { first.current = false; return; }
    if (KICK <= 0) return;
    const hd = delayRender("hongmen kick");
    let i = 0; const step = () => { advance(performance.now()); if (++i < KICK) requestAnimationFrame(step); else continueRender(hd); };
    requestAnimationFrame(step);
  }, [f, advance]);
  return null;
};

// ---------------------------------------------------------------------------------------------------- captions
/** Noto Sans SC Bold 72 px, white, gold key words. NOTHING behind it (the owner's rule: no box, no plate, no shade):
 *  the words carry a thick ink line, drawn as a layer of its own UNDER the fills (so no glyph's line covers its
 *  neighbour), with a hard little drop and a soft dark shadow: it reads on the bright sand table and in the night
 *  shots alike. Centred at y 70 %; a small pop-in per group (none on a group that starts on frame 0); the group on
 *  screen is the group being spoken (captions.ts), and its gold key word gives a small punch on the frame its first
 *  syllable falls (its place between the group's from and end).
 *  Optical centring: full-width marks carry half an em of blank on one side (，。：？！” on their right, “ on its
 *  left). The line is shifted by half the difference, so that the INK is centred: “一定是” needs no shift, 至于刘邦，
 *  goes a quarter em right (Arthur pulled back only one trailing mark, which left quotes off centre). */
const LEAD_PUNCT = "“‘（《「";
const CAP_PX = 72, CAP_INK = "#12111a";
import "./hud"; // the overlay package (hud/index.ts): importing it registers the 《史记·项羽本纪》 source tag as a HUD
export const Caption: React.FC<{ f: number }> = ({ f }) => {
  useOverlayFont();
  const en = EN ? captionAtEN(f) : null;
  const c = EN ? en : captionAt(f);
  if (!c) return null;
  const k = c.from === 0 ? 1 : clamp01((f - c.from + 1) / 5);
  const s = c.from === 0 ? 1 : 0.86 + 0.14 * easeOutBack(k, 2.2), o = c.from === 0 ? 1 : clamp01((f - c.from + 1) / 2.5);
  const runs = captionRuns(c.text);
  const plain = [...c.text.replace(/[【】]/g, "")], len = plain.length, px = en ? en.px : CAP_PX;
  // (English: ASCII punctuation is narrow, nothing to balance; the chunk carries its own size and width)
  let blankR = 0, blankL = 0;
  if (!EN) {
    for (let i = plain.length - 1; i >= 0 && TRAILING_PUNCT.includes(plain[i]); i--) blankR += 0.5;
    for (let i = 0; i < plain.length && LEAD_PUNCT.includes(plain[i]); i++) blankL += 0.5;
  }
  const shift = ((blankR - blankL) / 2) * px;
  const text: React.CSSProperties = { fontFamily: FONT_STACK, fontWeight: 700, fontSize: px, lineHeight: 1, letterSpacing: en ? 0.5 : 2, whiteSpace: en ? "pre" : "nowrap" }; // (English: "pre" keeps the space at the edge of a gold run)
  const line = Math.round(px * 0.19);                         // the ink line's full width: half of it shows outside the glyph
  const under: React.CSSProperties = { color: CAP_INK, WebkitTextStroke: `${line}px ${CAP_INK}`, textShadow: `0 ${Math.round(px * 0.06)}px 0 rgba(8,8,16,0.5), 0 ${Math.round(px * 0.08)}px ${Math.round(px * 0.3)}px rgba(8,8,16,0.5)` } as React.CSSProperties;
  // the key word's punch: on the frame its first syllable falls (its share of the group's spoken frames), 5 frames long
  let pos = 0;
  const bumps = runs.map((r) => {
    const at = c.from + Math.round((pos / Math.max(1, len)) * (c.end - c.from)); pos += [...r.text].length;
    // (English: a long gold run at +13 % grows over the space before it ("a sword dancer"): runs over 4 letters punch less, down to +5 %)
    const amp = en ? Math.max(0.05, 0.13 * Math.min(1, 4 / Math.max(1, [...r.text.trim()].length))) : 0.13;
    return r.gold && f >= at && f < at + 5 ? 1 + amp * (1 - (f - at) / 5) : 1;
  });
  const spans = (fill: boolean) => runs.map((r, i) => (
    <span key={i} style={{ display: "inline-block", transform: `scale(${bumps[i].toFixed(4)})`, transformOrigin: "50% 62%", color: fill ? (r.gold ? COL.gold : COL.white) : undefined }}>{r.text}</span>
  ));
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: W / 2, top: CAPTION_Y, width: 0, height: 0, opacity: o }}>
        <div style={{ position: "absolute", left: shift, top: 0, transform: `translate(-50%, -50%) scale(${s})`, transformOrigin: "50% 50%", ...text }}>
          <span style={under}>{spans(false)}</span>
          <span style={{ position: "absolute", left: 0, top: 0 }}>{spans(true)}</span>
        </div>
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
// a self-test of the HUD hook (input prop hudtest: true): a plain tag where the source tag will sit, from line 3 on.
// It is also the pattern for the overlay builder: registerHud(name, (f, P) => node | null) at module level.
if (ipFlag("hudtest")) registerHud("hudtest", (f) => (f >= BEAT.source && f < BEAT.sourceOff
  ? <div style={{ position: "absolute", left: 44, top: 210, color: COL.white, fontFamily: FONT_STACK, fontWeight: 700, fontSize: 46, textShadow: "0 0 5px rgba(8,9,16,0.8)" }}>{TXT.source}</div>
  : null));

// ---------------------------------------------------------------------------------------------------- the composition
export const HongmenFilm: React.FC = () => {
  const f = useCurrentFrame();
  const [handle] = useState(() => { if (DBG) console.log(`[hongmen] composition mounted at page time ${Math.round(performance.now())} ms`); return delayRender("hongmen world build"); });
  const [ctx, setCtx] = useState<{ gl: THREE.WebGLRenderer; camera: THREE.PerspectiveCamera } | null>(null);
  // the font first: signs and inscriptions are drawn into textures when the world is built
  const fontReady = useOverlayFont();
  const world = useMemo(() => (ctx && fontReady ? new World(ctx.gl, ctx.camera) : null), [ctx, fontReady]);
  const director = useMemo(() => (world ? new Director(world) : null), [world]);
  const t0 = DBG ? performance.now() : 0;
  const P = director ? director.frame(f) : null;
  if (DBG && P) console.log(`[hongmen] f${f} pose (segment ${director!.cur?.id}, place ${world!.place}) in ${Math.round(performance.now() - t0)} ms`);
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
