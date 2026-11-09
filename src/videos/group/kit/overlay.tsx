// 2D on-screen graphics for 《你的朋友，有几个也把你当朋友？》 (1080 x 1920, 30 fps). Captions are NOT here (burned in later).
//
// Look: Noto Sans SC Bold (思源黑体, public/bt/sans700.ttf, family "FrSans"), white and rope-gold type with a thick ink
// stroke and a hard drop shadow (the reference channel's caption style), on feathered scrims (no boxes) so the 3D room
// shows round the words; small tags are faint pills + halo. Gold = two-way (as the ropes), grey = one-way, red = wrong.
// Motion: punchy springs with overshoot on the element that appears; numbers slam / scale in on their own beat frame;
// nothing ever scales or shakes the whole frame. Every component is a pure function of the frame number.
//
// ===================================================================================================================
// API
// ===================================================================================================================
// Common props (every component):
//   at      frame the element starts (same clock as useCurrentFrame(): absolute in the film, or relative inside a
//           <Sequence>). at <= -20 means "already settled on frame 0".
//   out?    frame it starts leaving (7-frame scale-down + fade). Set it BEFORE the camera move that leaves the scene.
//   x, y    screen position of the element's anchor in px (1080 x 1920), e.g. a projected 3D anchor. Re-pass every
//           frame to ride a moving 3D point. scale? multiplies the whole element.
//   frame?  override the frame (default useCurrentFrame()).
// Keep text out of the caption band (y ~ 1260-1440) and Douyin's right rail (x > 930 for y > 900).
//
//  <RopeCounter at x y from=10 drops={[f1,f2,f3]} marks={[{x,y},..]} pips />          line 01
//      gold count 10 -> 7 on the rope bundle: each drop frame slams the next number in, the old one falls away grey;
//      10 rope pips under it (the dropped ones slump grey with a red x). marks: screen points ON each slack rope (one per
//      drop, re-pass per frame to follow the rope): a red x pops there at its drop frame.
//  <Ticker at x y to=84 unit="人" dur=60 value? landAt? icon />                          line 03 ("84人")
//      counts from 0 (eased) or shows `value` (drive it from the desk pops); small tick bump per change, a punch on landAt.
//  <BigPercent at x y dur=24 from={pts} label="以为是双向的" strikeAt? stampAt? />        lines 05 + 06
//      16 gold rope strands fly from `from` (screen points, e.g. the 84 seats) to the number; the outline draws on and the
//      rope-striped 94% punches in on frame at+dur (its beat). strikeAt: red slash, number greys, then shrinks left;
//      stampAt: 约7成 slams in beside it (gold 7) with an impact ring + label 按你当朋友的人算.
//  <SweepCounter at x y num=413 den=775 pct=53 dur=40 head="两头都有人握" basis="按绳子算" sweep />   line 09
//      top block: head line, 413 counting / 775, a bar filling gold, then "= 53%" punches in, then the 按绳子算 tag.
//      sweep: a faint gold scan line crosses the frame while it counts.
//  <CornerTag at text icon="think|lab|two|one|none" tone="gold|grey|white" corner="tl|tr" x? y? />
//      TAGS.guess 研究者推测 · TAGS.fit 健身实验 · 76人 · 每人配搭子 · TAGS.two 双向 · 最强 · TAGS.one 单向（他→你）· 也有效
//      usage: <CornerTag at={1200} out={1320} {...TAGS.guess} />   default top-left (44, 210).
//  <RopeChip at x y text="他把你当朋友" dx=0 dy=-150 tone="grey" />   x,y = a point ON the rope; the chip springs out
//      of it on a leader line.
//  <ScoreLegend at3 at5 x y />    "3 = 朋友" (thin rope sample) and "5 = 最好的朋友之一" (thick rope), each on its frame.
//  <GuessLine at x y writes={[{at, v:"5"}, ..]} />   我猜他给我：__ ; each write scribbles a gold digit into the next slot.
//  <Stamp at x y text="测不出效果" rot=-8 />          red rubber stamp slams, ink bleeds and spatters.
//  <StepCounter at x y spinAt? rate=4 ramp=24 value? wrist? />   wristband step counter: odometer digits, 0 until
//      spinAt, then spins up to `rate` steps / frame over `ramp` frames (take A rate 5, take B rate 2, take C no spinAt).
//      wrist: screen point of the 3D wrist for a leader line.
//  <Rewind at dur=15 tcFrom=56.4 speed=13.7 />        full-frame ◀◀ + timecode running backwards + tracking bands + noise.
//  <PhoneScreen at cue={PhoneCue} thumb? x=540 top=40 width=1000 safeY=1250 state? />   full-screen chat close-up
//      (phone.ts): drawPhoneScreen(phoneStateAt(f - at, cue)) on a canvas inside a phone bezel. thumb = URL of the poster
//      (frame 0 of the film). Messages scroll up so they stay above safeY = 1250 (clear of the captions).
//  <EndCard at out? />   Juno end card: J monogram, gold title, the question, 关注 Juno · 一起看懂世界 pill, sources.
//
//  helpers: useOverlayFont() (delayRender until the font is in; every component calls it), springAt(f, at, cfg),
//  PUNCH / SNAP / SOFT spring configs, ts(size, colour) text style, stepsAt(f, spinAt, rate, ramp), COL palette,
//  FONT_STACK, loadOverlayFonts, Pt type. Phone drawing for the 3D texture: kit/phone.ts (drawPhoneScreen, phoneStateAt).
//
// Sizes (owner rules): key numbers 150-270 px, labels 50-64 px, tags 46 px, all 思源黑体 Bold. Gold #ffc53d / rope
// #f0b631, ink #11131b. Scrims: an elliptical dark tint (0.56) with a flat core and a long feather, no box edge.
// Cost: DOM + SVG only (no CSS filter, no canvas blur); the phone close-up redraws one ~956 x 2069 canvas per frame.
//
//  Example (line 01, counter riding the projected bundle point):
//    const p = project(bundleWorld, camera);              // shot code: world -> screen px
//    <RopeCounter at={8} x={p.x} y={p.y - 220} drops={[52, 70, 88]} marks={slackRopes.map((r) => project(r.spanPointAt(0.6), camera))} out={118} />
import React, { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { AbsoluteFill, cancelRender, continueRender, delayRender, random, spring, useCurrentFrame } from "remotion";
import { FONT_STACK, loadOverlayFonts, overlayFontReady, drawPhoneScreen, phoneStateAt, PhoneCue, PhoneState, PHONE_W_PT } from "./phone";

export { FONT_STACK, loadOverlayFonts } from "./phone";
export type Pt = { x: number; y: number };

// ------------------------------------------------------------------------------------------------ style + motion
export const COL = {
  gold: "#ffc53d", goldDeep: "#e09b17", goldDark: "#9a6a0c", goldLight: "#ffe9a8", rope: "#f0b631",
  white: "#ffffff", ink: "#11131b", grey: "#c3c6cd", greyDeep: "#868b96", red: "#ff3b2f", stamp: "#e2342a",
  scrim: "10,12,22", coral: "#ff6b5a",
};
export const PUNCH = { damping: 9, stiffness: 210, mass: 0.7 };
export const SNAP = { damping: 15, stiffness: 520, mass: 0.6 };
export const SOFT = { damping: 16, stiffness: 160, mass: 0.8 };
type SpringCfg = { damping: number; stiffness: number; mass: number };
const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const eOut = (x: number) => 1 - Math.pow(1 - clamp01(x), 3);
const eIn = (x: number) => Math.pow(clamp01(x), 3);
const eInOut = (x: number) => { const t = clamp01(x); return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
export const springAt = (f: number, at: number, cfg: SpringCfg = PUNCH) => (f < at ? 0 : spring({ frame: f - at, fps: 30, config: cfg }));
const outK = (f: number, out?: number) => (out === undefined ? 0 : eIn((f - out) / 7));
const hexRgb = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mix = (a: string, b: string, t: number) => {
  const A = hexRgb(a), B = hexRgb(b);
  return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], clamp01(t)))).join(",")})`;
};
const useF = (frame?: number) => { const cur = useCurrentFrame(); return frame ?? cur; };
const useSvgId = () => useId().replace(/[^a-zA-Z0-9]/g, "");

export function useOverlayFont() {
  const [ready, setReady] = useState(overlayFontReady());
  const [handle] = useState(() => (overlayFontReady() ? null : delayRender("friends overlay font")));
  useEffect(() => {
    if (handle === null) return;
    loadOverlayFonts().then(() => { setReady(true); continueRender(handle); }, (e) => cancelRender(e));
  }, [handle]);
  return ready;
}

/** text style: bold sans, ink stroke drawn under the fill, hard drop shadow */
export const ts = (size: number, color: string = COL.white, sw?: number): React.CSSProperties => ({
  fontFamily: FONT_STACK, fontWeight: 700, fontSize: size, lineHeight: 1, color, whiteSpace: "nowrap",
  WebkitTextStroke: `${sw ?? Math.max(7, Math.round(size * (size >= 110 ? 0.085 : 0.14)))}px ${COL.ink}`, paintOrder: "stroke fill",
  textShadow: `0 ${Math.max(3, Math.round(size * 0.05))}px 0 rgba(0,0,0,0.38)`, fontVariantNumeric: "tabular-nums",
} as React.CSSProperties);

const Fill: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ pointerEvents: "none", overflow: "hidden" }}>{children}</AbsoluteFill>
);
/** zero-size anchor at x,y; children are positioned relative to it */
const At: React.FC<{ x: number; y: number; s?: number; o?: number; r?: number; children?: React.ReactNode }> = ({ x, y, s = 1, o = 1, r = 0, children }) => (
  <div style={{ position: "absolute", left: x, top: y, width: 0, height: 0, transform: `scale(${s}) rotate(${r}deg)`, opacity: o }}>{children}</div>
);
/** child centred on (dx, dy) of its anchor */
const C: React.FC<{ dx?: number; dy?: number; s?: number; o?: number; r?: number; ox?: string; children?: React.ReactNode; style?: React.CSSProperties }> = ({ dx = 0, dy = 0, s = 1, o = 1, r = 0, ox = "50% 50%", children, style }) => (
  <div style={{ position: "absolute", left: dx, top: dy, transform: `translate(-50%,-50%) scale(${s}) rotate(${r}deg)`, transformOrigin: ox, opacity: o, whiteSpace: "nowrap", ...style }}>{children}</div>
);
/** feathered scrim (owner rule: no box, ~0.55-0.6 dark tint, soft edge): an ellipse with a flat core out to 55 % of its
 *  radii and a long soft falloff, so words sit on an even dark and the room shows round them. w x h = full extent. */
const Scrim: React.FC<{ w: number; h: number; dx?: number; dy?: number; o?: number; tint?: string }> = ({ w, h, dx = 0, dy = 0, o = 0.56, tint = COL.scrim }) => {
  const c = (a: number) => `rgba(${tint},${(o * a).toFixed(3)})`;
  return (
    <div style={{ position: "absolute", left: dx - w / 2, top: dy - h / 2, width: w, height: h,
      background: `radial-gradient(closest-side, ${c(1)} 0%, ${c(1)} 55%, ${c(0.74)} 70%, ${c(0.36)} 85%, ${c(0.1)} 95%, ${c(0)} 100%)` }} />
  );
};
const Svg: React.FC<{ children?: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", left: 0, top: 0, overflow: "visible", ...style }}>{children}</svg>
);

/** red x, centred at 0,0, size s px; k = 0..1 pop (spring) */
const RedX: React.FC<{ s: number; k: number }> = ({ s, k }) => {
  const a = s * 0.36;
  const d = `M${-a},${-a} L${a},${a} M${a},${-a} L${-a},${a}`;
  return (
    <g transform={`scale(${k}) rotate(${(1 - Math.min(1, k)) * -40})`}>
      <path d={d} stroke={COL.ink} strokeWidth={s * 0.34} strokeLinecap="round" fill="none" />
      <path d={d} stroke={COL.red} strokeWidth={s * 0.19} strokeLinecap="round" fill="none" />
    </g>
  );
};
/** a laid-rope stroke along path d: ink outline, colour, darker twist dashes */
const RopeStroke: React.FC<{ d: string; w: number; col?: string; dash?: string; offset?: number; pathLength?: number; o?: number }> = ({ d, w, col = COL.rope, dash, offset, pathLength, o = 1 }) => {
  const twist = mix(col.startsWith("#") ? col : COL.rope, "#000000", 0.32);
  const common = { d, fill: "none", strokeLinecap: "round" as const, strokeLinejoin: "round" as const, pathLength, strokeDasharray: dash, strokeDashoffset: offset, opacity: o };
  return (
    <g>
      <path {...common} stroke={COL.ink} strokeWidth={w + Math.max(4, w * 0.55)} />
      <path {...common} stroke={col} strokeWidth={w} />
      {dash ? null : <path {...common} stroke={twist} strokeWidth={w * 0.75} strokeDasharray={`${w * 0.45} ${w * 0.9}`} opacity={0.6 * o} />}
    </g>
  );
};

// ================================================================================================ 1. RopeCounter
export type RopeCounterProps = { at: number; out?: number; x?: number; y?: number; scale?: number; from?: number; drops?: number[]; marks?: Pt[]; pips?: boolean; frame?: number };
export const RopeCounter: React.FC<RopeCounterProps> = ({ at, out, x = 540, y = 640, scale = 1, from = 10, drops, marks = [], pips = true, frame }) => {
  useOverlayFont();
  const f = useF(frame);
  if (f < at || (out !== undefined && f > out + 8)) return null;
  const D = drops ?? [at + 36, at + 50, at + 64];
  const k = springAt(f, at), o = outK(f, out);
  const n = D.filter((d) => f >= d).length;
  const v = from - n;
  const last = n ? D[n - 1] : at;
  const hit = n ? springAt(f, last, PUNCH) : 1;
  const numS = n ? 1.75 - 0.75 * hit : 1;
  const tFall = f - last;
  const pw = 38, rowW = from * pw;
  return (
    <Fill>
      <At x={x} y={y} s={scale * k * (1 - 0.35 * o)} o={1 - o}>
        <Scrim w={660} h={560} dy={50} />
        {n > 0 && tFall < 9 ? (
          <C dy={tFall * 9} r={tFall * 4} o={1 - tFall / 9} style={ts(160, COL.grey)}>{v + 1}</C>
        ) : null}
        <C s={numS} style={ts(160, COL.gold, 22)}>{v}</C>
        {pips ? (
          <svg width={rowW + 40} height={120} viewBox={`${-rowW / 2 - 20} -60 ${rowW + 40} 120`} style={{ position: "absolute", left: -rowW / 2 - 20, top: 128 - 60, overflow: "visible" }}>
            {Array.from({ length: from }, (_, i) => {
              const m = from - 1 - i; // drops take pips from the right end
              const dropF = m < D.length ? D[m] : Infinity;
              const s = clamp01((f - dropF) / 6);
              const px = -rowW / 2 + pw / 2 + i * pw;
              const c1x = lerp(3, -4, s), c1y = lerp(-12, 16, s), c2x = lerp(-3, 22, s), c2y = lerp(12, 34, s), ex = lerp(0, 30, s), ey = lerp(32, 32, s);
              const d = `M${px},-32 C${px + c1x},${c1y} ${px + c2x},${c2y} ${px + ex},${ey}`;
              const xk = springAt(f, dropF + 1, PUNCH);
              return (
                <g key={i}>
                  <RopeStroke d={d} w={12} col={s > 0 ? mix(COL.rope, COL.grey, s) : COL.rope} />
                  {f >= dropF + 1 ? <g transform={`translate(${px + 8},-58)`}><RedX s={36} k={xk} /></g> : null}
                </g>
              );
            })}
          </svg>
        ) : null}
      </At>
      <Svg style={{ opacity: 1 - o }}>
        {marks.map((p, i) => (i < D.length && f >= D[i] ? (
          <g key={i} transform={`translate(${p.x},${p.y})`}><RedX s={74} k={springAt(f, D[i], PUNCH)} /></g>
        ) : null))}
      </Svg>
    </Fill>
  );
};

// ================================================================================================ 2. Ticker (84人)
export type TickerProps = { at: number; out?: number; x?: number; y?: number; scale?: number; from?: number; to?: number; dur?: number; value?: number; landAt?: number; unit?: string; icon?: boolean; frame?: number };
const tickVal = (f: number, at: number, from: number, to: number, dur: number) => Math.round(lerp(from, to, eOut((f - at) / dur) * 0.15 + clamp01((f - at) / dur) * 0.85));
export const Ticker: React.FC<TickerProps> = ({ at, out, x = 540, y = 300, scale = 1, from = 0, to = 84, dur = 60, value, landAt, unit = "人", icon = true, frame }) => {
  useOverlayFont();
  const f = useF(frame);
  if (f < at || (out !== undefined && f > out + 8)) return null;
  const k = springAt(f, at), o = outK(f, out);
  const v = value ?? tickVal(f, at, from, to, dur);
  let bump = 0;
  if (value === undefined) {
    for (let g = 0; g < 5; g++) if (tickVal(f - g, at, from, to, dur) !== tickVal(f - g - 1, at, from, to, dur)) { bump = 0.07 * Math.exp(-g / 1.6); break; }
  }
  const L = landAt ?? at + dur;
  const land = f >= L ? 0.3 * (1 - springAt(f, L, PUNCH)) : 0;
  const digits = String(to).length;
  return (
    <Fill>
      <At x={x} y={y} s={scale * k * (1 - 0.35 * o)} o={1 - o}>
        <Scrim w={780} h={380} dx={10} />
        <C>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            {icon ? (
              <svg width={92} height={92} viewBox="-46 -46 92 92" style={{ overflow: "visible", marginRight: 22 }}>
                <circle r={38} fill="#fff" stroke={COL.ink} strokeWidth={7} />
                <circle cx={-12} cy={2} r={4.5} fill={COL.ink} /><circle cx={12} cy={2} r={4.5} fill={COL.ink} />
                <path d="M-10,14 Q0,22 10,14" stroke={COL.ink} strokeWidth={4} fill="none" strokeLinecap="round" />
              </svg>
            ) : null}
            <div style={{ ...ts(150, COL.gold, 22), width: `${digits * 0.6}em`, textAlign: "right", transform: `scale(${1 + bump + land})`, transformOrigin: "100% 60%" }}>{v}</div>
            <div style={{ ...ts(92), marginTop: 34 }}>{unit}</div>
          </div>
        </C>
      </At>
    </Fill>
  );
};

// ================================================================================================ 3+4. BigPercent (94% -> 约7成)
export type BigPercentProps = {
  at: number; out?: number; x?: number; y?: number; scale?: number; dur?: number; from?: Pt[]; text?: string; label?: string; labelAt?: number;
  strikeAt?: number; stampAt?: number; truth?: [string, string, string]; truthLabel?: string; frame?: number;
};
export const BigPercent: React.FC<BigPercentProps> = ({ at, out, x = 540, y = 560, scale = 1, dur = 24, from, text = "94%", label = "以为是双向的", labelAt,
  strikeAt, stampAt, truth = ["约", "7", "成"], truthLabel = "按你当朋友的人算", frame }) => {
  useOverlayFont();
  const id = useSvgId();
  const f = useF(frame);
  if (f < at || (out !== undefined && f > out + 8)) return null;
  const o = outK(f, out);
  const L = at + dur;
  const N = 16;
  // default origins: the people below the number (bottom of the frame), spread evenly with a little jitter
  const src: Pt[] = from && from.length ? from : Array.from({ length: N }, (_, i) => ({ x: 30 + ((i * 7) % N) / (N - 1) * 1020 + (random(`bp-x${i}`) - 0.5) * 60, y: 1480 + random(`bp-y${i}`) * 420 }));
  // phase: after the strike the number moves left and shrinks
  const SK = strikeAt ?? Infinity;
  const mv = springAt(f, SK + 9, SOFT);
  const grey = clamp01((f - SK - 2) / 5);
  const nx = x - 235 * mv, ny = y - 10 * mv, ns = scale * (1 - 0.47 * mv);
  const punch = f >= L ? 1.32 - 0.32 * springAt(f, L, PUNCH) : 0.9;
  const draw = clamp01((f - at - 6) / (dur - 6));
  const fillO = clamp01((f - L + 1) / 2);
  const glint = clamp01((f - L - 3) / 11);
  const FS = 270, base = 96; // font size, baseline offset from the anchor
  const strike = clamp01((f - SK) / 5);
  const lab = springAt(f, labelAt ?? L + 6, PUNCH);
  const T = stampAt ?? Infinity;
  const sk = springAt(f, T, SNAP);
  const tx = x + 175 * scale, ty = y + 4 * scale;
  return (
    <Fill>
      <div style={{ opacity: 1 - o, transform: `scale(${1 - 0.25 * o})`, transformOrigin: `${x}px ${y}px`, position: "absolute", inset: 0 }}>
        <At x={lerp(x, x - 40, mv)} y={y + 50}><Scrim w={lerp(940, 1160, mv)} h={lerp(640, 600, mv)} /></At>
        <Svg>
          <defs>
            <pattern id={`st${id}`} width={26} height={26} patternUnits="userSpaceOnUse" patternTransform="rotate(-32)">
              <rect width={26} height={26} fill={COL.gold} />
              <rect width={9} height={26} fill={COL.goldDeep} />
              <rect x={9} width={3} height={26} fill={COL.goldLight} opacity={0.7} />
            </pattern>
            <linearGradient id={`gl${id}`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#fff" stopOpacity="0" /><stop offset="0.5" stopColor="#fff" stopOpacity="0.85" /><stop offset="1" stopColor="#fff" stopOpacity="0" />
            </linearGradient>
            <clipPath id={`cp${id}`}><text x={0} y={base} textAnchor="middle" fontFamily={FONT_STACK} fontWeight={700} fontSize={FS}>{text}</text></clipPath>
          </defs>
          {/* flying strands */}
          {src.slice(0, N).map((p, i) => {
            // each strand is thrown up from its origin and lands on a point of the number (short comet: head eased, tail chasing)
            const d0 = at + (i / N) * Math.max(1, dur - 13) + random(`bp-d${i}`) * 2;
            const h = eOut((f - d0) / 12);
            if (h <= 0) return null;
            const tail = Math.max(0, h - 0.3) + 0.3 * clamp01((f - d0 - 12) / 4);
            if (tail >= 0.999) return null;
            const gx = ((i * 5) % N) / (N - 1) - 0.5, gy = random(`bp-ty${i}`) - 0.5;
            const tgx = x + gx * 440 * scale, tgy = y + gy * 170 * scale;
            const mx = (p.x + tgx) / 2 + (p.x < tgx ? -1 : 1) * (80 + random(`bp-cx${i}`) * 140), my = Math.min(p.y, tgy) - 160 - random(`bp-cy${i}`) * 220;
            const dd = `M${p.x},${p.y} Q${mx},${my} ${tgx},${tgy}`;
            return <RopeStroke key={i} d={dd} w={11} pathLength={1} dash={`${Math.max(0.001, h - tail)} 3`} offset={-tail} />;
          })}
          {/* the number */}
          <g transform={`translate(${nx},${ny}) scale(${ns * punch})`}>
            {fillO < 1 ? (
              <text x={0} y={base} textAnchor="middle" fontFamily={FONT_STACK} fontWeight={700} fontSize={FS} fill="none" stroke={COL.rope} strokeWidth={13}
                strokeLinejoin="round" strokeDasharray={`${draw * 900} 900`} opacity={1 - fillO}>{text}</text>
            ) : null}
            <text x={0} y={base + 12} textAnchor="middle" fontFamily={FONT_STACK} fontWeight={700} fontSize={FS} fill="rgba(0,0,0,0.38)" opacity={fillO}>{text}</text>
            <text x={0} y={base} textAnchor="middle" fontFamily={FONT_STACK} fontWeight={700} fontSize={FS} fill={`url(#st${id})`} stroke={COL.ink} strokeWidth={30}
              strokeLinejoin="round" paintOrder="stroke" opacity={fillO}>{text}</text>
            {grey > 0 ? <text x={0} y={base} textAnchor="middle" fontFamily={FONT_STACK} fontWeight={700} fontSize={FS} fill={COL.grey} opacity={grey * fillO}>{text}</text> : null}
            {glint > 0 && glint < 1 ? (
              <g clipPath={`url(#cp${id})`}><rect x={-520 + glint * 1040 - 90} y={-140} width={180} height={300} fill={`url(#gl${id})`} transform="skewX(-20)" /></g>
            ) : null}
            {strike > 0 ? (
              <g>
                <path d="M-300,44 L300,-38" pathLength={1} strokeDasharray={`${strike} 2`} stroke={COL.ink} strokeWidth={58} strokeLinecap="round" fill="none" />
                <path d="M-300,44 L300,-38" pathLength={1} strokeDasharray={`${strike} 2`} stroke={COL.red} strokeWidth={36} strokeLinecap="round" fill="none" />
              </g>
            ) : null}
          </g>
          {/* fibre burst on the beat */}
          {f >= L && f < L + 10 ? Array.from({ length: 12 }, (_, i) => {
            const a = (i / 12) * Math.PI * 2 + 0.2, t = (f - L) / 10;
            const r0 = 250 + 140 * eOut(t), r1 = r0 + 70 * (1 - t);
            return <line key={i} x1={nx + Math.cos(a) * r0} y1={ny + Math.sin(a) * r0 * 0.55} x2={nx + Math.cos(a) * r1} y2={ny + Math.sin(a) * r1 * 0.55}
              stroke={COL.gold} strokeWidth={9 * (1 - t)} strokeLinecap="round" />;
          }) : null}
          {/* stamp impact ring */}
          {f >= T + 2 && f < T + 14 ? (() => { const t = (f - T - 2) / 12; return (
            <ellipse cx={tx} cy={ty} rx={190 + 170 * eOut(t)} ry={(190 + 170 * eOut(t)) * 0.62} fill="none" stroke={COL.gold} strokeWidth={14 * (1 - t)} opacity={0.9 * (1 - t)} />
          ); })() : null}
        </Svg>
        {/* sub-label under the 94% */}
        <At x={lerp(x, x - 235 * scale, mv)} y={y + lerp(205, 128, mv) * scale}>
          <C s={lab * lerp(1, 0.72, mv) * scale} style={ts(62)}>{label}</C>
        </At>
        {/* 约7成 stamp */}
        {f >= T ? (
          <At x={tx} y={ty} s={scale * (2.7 - 1.7 * sk)} o={clamp01((f - T + 1) / 2)} r={lerp(-8, -2, sk)}>
            <C>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                <span style={ts(104)}>{truth[0]}</span>
                <span style={{ ...ts(250, COL.gold, 32), margin: "0 4px" }}>{truth[1]}</span>
                <span style={ts(140)}>{truth[2]}</span>
              </div>
            </C>
          </At>
        ) : null}
        {f >= T + 6 ? (
          <At x={tx} y={ty + 168 * scale} s={scale * springAt(f, T + 6, PUNCH)}><C style={ts(50)}>{truthLabel}</C></At>
        ) : null}
      </div>
    </Fill>
  );
};

// ================================================================================================ 5. SweepCounter
export type SweepCounterProps = { at: number; out?: number; x?: number; y?: number; scale?: number; num?: number; den?: number; pct?: number; dur?: number; head?: string; basis?: string; sweep?: boolean; frame?: number };
export const SweepCounter: React.FC<SweepCounterProps> = ({ at, out, x = 540, y = 300, scale = 1, num = 413, den = 775, pct = 53, dur = 40, head = "两头都有人握", basis = "按绳子算", sweep = true, frame }) => {
  useOverlayFont();
  const f = useF(frame);
  if (f < at || (out !== undefined && f > out + 8)) return null;
  const k = springAt(f, at, PUNCH), o = outK(f, out);
  const t = eInOut((f - at - 4) / dur);
  const v = Math.round(num * t);
  const L = at + 4 + dur + 2;
  const pk = springAt(f, L, PUNCH);
  const tagK = springAt(f, L + 8, PUNCH);
  const barW = 760;
  const sx = -200 + 1480 * clamp01((f - at - 4) / dur);
  return (
    <Fill>
      {sweep && f < at + 4 + dur + 4 ? (
        <div style={{ position: "absolute", left: sx - 160, top: 0, width: 320, height: 1920, opacity: 0.55 * (1 - o) * clamp01((at + 4 + dur + 4 - f) / 4),
          background: "linear-gradient(90deg, rgba(255,197,61,0) 0%, rgba(255,197,61,0.22) 42%, rgba(255,240,190,0.85) 50%, rgba(255,197,61,0.22) 58%, rgba(255,197,61,0) 100%)" }} />
      ) : null}
      <At x={x} y={y} s={scale * (1 - 0.3 * o)} o={(1 - o) * clamp01(k * 2)}>
        <Scrim w={1240} h={720} dy={50} o={0.6} />
        <C dy={-118} s={k}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <svg width={168} height={78} viewBox="-60 -28 120 56" style={{ overflow: "visible" }}>
              <path d="M-38,0 Q0,10 38,0" stroke={COL.ink} strokeWidth={14} fill="none" strokeLinecap="round" />
              <path d="M-38,0 Q0,10 38,0" stroke={COL.rope} strokeWidth={8} fill="none" strokeLinecap="round" />
              <circle cx={-44} cy={-2} r={14} fill="#fff" stroke={COL.ink} strokeWidth={5} />
              <circle cx={44} cy={-2} r={14} fill="#fff" stroke={COL.ink} strokeWidth={5} />
            </svg>
            <span style={ts(60)}>{head}</span>
          </div>
        </C>
        <C dy={10} s={k}>
          <div style={{ display: "flex", alignItems: "baseline" }}>
            <span style={{ ...ts(124, COL.gold, 20), width: "1.8em", textAlign: "right" }}>{v}</span>
            <span style={{ ...ts(80), marginLeft: 6 }}>/{den}</span>
            <span style={{ ...ts(80), margin: "0 18px", opacity: f >= L ? 1 : 0.0 }}>=</span>
            <span style={{ ...ts(150, COL.gold, 24), display: "inline-block", width: "2.05em", transform: `scale(${f >= L ? 1.45 - 0.45 * pk : 0})`, transformOrigin: "50% 65%" }}>{pct}%</span>
          </div>
        </C>
        <div style={{ position: "absolute", left: -barW / 2, top: 108, width: barW, height: 26, borderRadius: 13, background: "rgba(195,198,205,0.55)",
          boxShadow: `0 0 0 5px ${COL.ink}, 0 6px 0 5px rgba(0,0,0,0.3)`, overflow: "hidden", transform: `scaleX(${k})` }}>
          <div style={{ width: barW * (v / den), height: "100%", background: `linear-gradient(180deg, ${COL.goldLight}, ${COL.gold} 45%, ${COL.goldDeep})` }} />
        </div>
        {f >= L + 8 ? (
          <C dy={206} s={tagK}>
            <div style={{ ...pill(COL.gold), padding: "10px 28px" }}><span style={ts(48)}>{basis}</span></div>
          </C>
        ) : null}
      </At>
    </Fill>
  );
};

// ================================================================================================ 6. tags and chips
const pill = (accent: string): React.CSSProperties => ({
  display: "flex", alignItems: "center", gap: 14, borderRadius: 999, background: "rgba(12,14,24,0.56)", border: `3px solid ${accent}`,
  boxShadow: "0 0 26px 10px rgba(10,12,22,0.28)",
});
const toneCol = (t: "gold" | "grey" | "white") => (t === "gold" ? COL.gold : t === "grey" ? COL.grey : "#ffffff");
const TagIcon: React.FC<{ kind: "think" | "lab" | "two" | "one"; col: string }> = ({ kind, col }) => (
  <svg width={58} height={58} viewBox="-29 -29 58 58" style={{ overflow: "visible", flex: "none" }}>
    <circle r={27} fill={col} stroke={COL.ink} strokeWidth={4} />
    {kind === "think" ? (<g fill={COL.ink}>
      <ellipse cx={1} cy={-4} rx={14} ry={10} /><circle cx={-9} cy={10} r={4} /><circle cx={-15} cy={17} r={2.4} />
      <ellipse cx={1} cy={-4} rx={9} ry={5.5} fill={col} /><text x={1} y={1} textAnchor="middle" fontFamily={FONT_STACK} fontWeight={700} fontSize={13} fill={COL.ink}>?</text>
    </g>) : null}
    {kind === "lab" ? (<g stroke={COL.ink} strokeLinecap="round">
      <line x1={-12} y1={0} x2={12} y2={0} strokeWidth={5} /><line x1={-14} y1={-9} x2={-14} y2={9} strokeWidth={7} /><line x1={14} y1={-9} x2={14} y2={9} strokeWidth={7} />
      <line x1={-20} y1={-5} x2={-20} y2={5} strokeWidth={5} /><line x1={20} y1={-5} x2={20} y2={5} strokeWidth={5} />
    </g>) : null}
    {kind === "two" ? (<g stroke={COL.ink} strokeWidth={4.5} strokeLinecap="round" strokeLinejoin="round" fill="none">
      <path d="M-15,-6 H15 M9,-12 L15,-6 L9,0" /><path d="M15,7 H-15 M-9,1 L-15,7 L-9,13" />
    </g>) : null}
    {kind === "one" ? (<g stroke={COL.ink} strokeWidth={4.5} strokeLinecap="round" strokeLinejoin="round" fill="none">
      <path d="M-16,0 H15 M8,-8 L16,0 L8,8" />
    </g>) : null}
  </svg>
);
/** text with "·" separators drawn as a tight dot in the accent colour (the CJK font's · is a full em wide) */
const SepText: React.FC<{ text: string; size: number; col: string; color?: string; sw?: number }> = ({ text, size, col, color = "#ffffff", sw = 8 }) => (
  <span style={{ display: "inline-flex", alignItems: "center" }}>
    {text.split(/\s*·\s*/).map((part, i) => (
      <React.Fragment key={i}>
        {i ? <span style={{ display: "inline-block", width: size * 0.2, height: size * 0.2, borderRadius: "50%", background: col, boxShadow: `0 0 0 ${size * 0.06}px ${COL.ink}`, margin: `0 ${size * 0.32}px` }} /> : null}
        <span style={ts(size, color, sw)}>{part}</span>
      </React.Fragment>
    ))}
  </span>
);
export type CornerTagProps = { at: number; out?: number; text: string; icon?: "think" | "lab" | "two" | "one" | "none"; tone?: "gold" | "grey" | "white"; corner?: "tl" | "tr"; x?: number; y?: number; size?: number; scale?: number; frame?: number };
export const TAGS = {
  guess: { text: "研究者推测", icon: "think", tone: "white" },
  fit: { text: "健身实验 · 76人 · 每人配搭子", icon: "lab", tone: "white" },
  two: { text: "双向 · 最强", icon: "two", tone: "gold" },
  one: { text: "单向（他→你）· 也有效", icon: "one", tone: "grey" },
} as const;
export const CornerTag: React.FC<CornerTagProps> = ({ at, out, text, icon = "none", tone = "white", corner = "tl", x, y = 210, size = 46, scale = 1, frame }) => {
  useOverlayFont();
  const f = useF(frame);
  if (f < at || (out !== undefined && f > out + 8)) return null;
  const k = springAt(f, at, PUNCH), o = outK(f, out);
  const right = corner === "tr";
  const ax = x ?? (right ? 1036 : 44);
  const col = toneCol(tone);
  return (
    <Fill>
      <div style={{ position: "absolute", left: ax, top: y, transform: `translateX(${right ? "-100%" : "0"}) translateX(${(1 - k) * (right ? 80 : -80)}px) scale(${scale * (0.6 + 0.4 * k) * (1 - 0.3 * o)})`,
        transformOrigin: right ? "100% 50%" : "0% 50%", opacity: clamp01(k * 2) * (1 - o) }}>
        <div style={{ ...pill(col), padding: icon === "none" ? "10px 28px" : "8px 28px 8px 9px" }}>
          {icon !== "none" ? <TagIcon kind={icon} col={col} /> : null}
          <SepText text={text} size={size} col={col} />
        </div>
      </div>
    </Fill>
  );
};

export type RopeChipProps = { at: number; out?: number; x: number; y: number; text?: string; dx?: number; dy?: number; tone?: "gold" | "grey"; scale?: number; frame?: number };
export const RopeChip: React.FC<RopeChipProps> = ({ at, out, x, y, text = "他把你当朋友", dx = 0, dy = -150, tone = "grey", scale = 1, frame }) => {
  useOverlayFont();
  const f = useF(frame);
  if (f < at || (out !== undefined && f > out + 8)) return null;
  const k = springAt(f, at, PUNCH), o = outK(f, out);
  const col = toneCol(tone);
  const cx = x + dx * k * scale, cy = y + dy * k * scale;
  const dot = springAt(f, at - 2, PUNCH);
  return (
    <Fill>
      <Svg style={{ opacity: 1 - o }}>
        <line x1={x} y1={y} x2={cx} y2={cy} stroke={COL.ink} strokeWidth={9} strokeLinecap="round" />
        <line x1={x} y1={y} x2={cx} y2={cy} stroke={col} strokeWidth={4} strokeLinecap="round" />
        <circle cx={x} cy={y} r={13 * dot} fill={col} stroke={COL.ink} strokeWidth={5} />
      </Svg>
      <At x={cx} y={cy} s={scale * k * (1 - 0.3 * o)} o={1 - o}>
        <C><div style={{ ...pill(col), padding: "12px 30px" }}><span style={ts(52)}>{text}</span></div></C>
      </At>
    </Fill>
  );
};

export type ScoreLegendProps = { at3: number; at5: number; out?: number; x?: number; y?: number; scale?: number; frame?: number };
export const ScoreLegend: React.FC<ScoreLegendProps> = ({ at3, at5, out, x = 540, y = 330, scale = 1, frame }) => {
  useOverlayFont();
  const f = useF(frame);
  if (f < at3 || (out !== undefined && f > out + 8)) return null;
  const o = outK(f, out);
  const row = (at: number, n: string, label: string, w: number, dy: number) => {
    if (f < at) return null;
    const k = springAt(f, at, PUNCH);
    const draw = eOut((f - at) / 8);
    return (
      <div style={{ position: "absolute", left: -330, top: dy - 50, height: 100, display: "flex", alignItems: "center", gap: 22,
        transform: `translateX(${(1 - k) * -60}px) scale(${0.7 + 0.3 * k})`, transformOrigin: "0% 50%", opacity: clamp01(k * 2) }}>
        <svg width={120} height={60} viewBox="0 -30 120 60" style={{ overflow: "visible" }}>
          <RopeStroke d="M6,4 Q60,-10 114,4" w={w} pathLength={1} dash={`${draw} 2`} />
          {draw > 0.98 ? <RopeStroke d="M6,4 Q60,-10 114,4" w={w} /> : null}
        </svg>
        <span style={ts(92, COL.gold, 16)}>{n}</span>
        <span style={ts(64)}>=</span>
        <span style={ts(60)}>{label}</span>
      </div>
    );
  };
  return (
    <Fill>
      <At x={x} y={y} s={scale * (1 - 0.3 * o)} o={1 - o}>
        <Scrim w={1120} h={520} dx={30} dy={60} />
        {row(at3, "3", "朋友", 7, 0)}
        {row(at5, "5", "最好的朋友之一", 20, 120)}
      </At>
    </Fill>
  );
};

export type GuessLineProps = { at: number; out?: number; x?: number; y?: number; scale?: number; text?: string; writes?: { at: number; v: string }[]; frame?: number };
export const GuessLine: React.FC<GuessLineProps> = ({ at, out, x = 540, y = 420, scale = 1, text = "我猜他给我：", writes = [], frame }) => {
  useOverlayFont();
  const f = useF(frame);
  if (f < at || (out !== undefined && f > out + 8)) return null;
  const k = springAt(f, at, PUNCH), o = outK(f, out);
  const slots = Math.max(1, writes.length);
  return (
    <Fill>
      <At x={x} y={y} s={scale * k * (1 - 0.3 * o)} o={1 - o}>
        <Scrim w={720 + slots * 120} h={360} />
        <C>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 14 }}>
            <span style={{ ...ts(64), marginBottom: 14 }}>{text}</span>
            {Array.from({ length: slots }, (_, i) => {
              const w = writes[i];
              const p = w ? eOut((f - w.at) / 4) : 0;
              const pop = w && f >= w.at ? 1.35 - 0.35 * springAt(f, w.at, PUNCH) : 1;
              return (
                <div key={i} style={{ position: "relative", width: 84, height: 112 }}>
                  <div style={{ position: "absolute", left: 4, right: 4, bottom: 6, height: 8, borderRadius: 4, background: COL.gold, boxShadow: `0 0 0 4px ${COL.ink}` }} />
                  {w && f >= w.at ? (
                    <div style={{ position: "absolute", left: "50%", bottom: 12, transform: `translateX(-50%) rotate(${-7 + (i % 2) * 6}deg) scale(${pop})`,
                      clipPath: `inset(0 ${100 - 100 * p}% 0 0)`, ...ts(100, COL.gold, 16) }}>{w.v}</div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </C>
      </At>
    </Fill>
  );
};

// ================================================================================================ 7. Stamp + StepCounter
export type StampProps = { at: number; out?: number; x?: number; y?: number; scale?: number; text?: string; rot?: number; size?: number; color?: string; frame?: number };
export const Stamp: React.FC<StampProps> = ({ at, out, x = 540, y = 820, scale = 1, text = "测不出效果", rot = -8, size = 118, color = COL.stamp, frame }) => {
  useOverlayFont();
  const id = useSvgId();
  const f = useF(frame);
  if (f < at || (out !== undefined && f > out + 8)) return null;
  const sk = springAt(f, at, SNAP), o = outK(f, out);
  const imp = at + 3; // impact frame
  const bleed = eOut((f - imp) / 10);
  const jolt = f >= imp && f < imp + 6 ? Math.sin((f - imp) * 2.6) * 7 * (1 - (f - imp) / 6) : 0;
  const n = [...text].length;
  const W = n * size * 1.08 + 96, H = size * 1.62;
  const holes = Array.from({ length: 150 }, (_, i) => ({ x: (random(`st-x${i}`) - 0.5) * W, y: (random(`st-y${i}`) - 0.5) * H, r: 1 + random(`st-r${i}`) * 3.2 }));
  const spat = Array.from({ length: 9 }, (_, i) => {
    const a = random(`sp-a${i}`) * Math.PI * 2;
    return { x: Math.cos(a) * (W / 2 + 14 + random(`sp-d${i}`) * 40), y: Math.sin(a) * (H / 2 + 10 + random(`sp-e${i}`) * 26), r: 3 + random(`sp-r${i}`) * 8 };
  });
  return (
    <Fill>
      <Svg style={{ opacity: (1 - o) * clamp01((f - at + 1) / 2) }}>
        <defs>
          <mask id={`m${id}`} maskUnits="userSpaceOnUse" x={-W} y={-H} width={2 * W} height={2 * H}>
            <rect x={-W} y={-H} width={2 * W} height={2 * H} fill="#fff" />
            {holes.map((h, i) => <circle key={i} cx={h.x} cy={h.y} r={h.r} fill="#000" />)}
          </mask>
          <radialGradient id={`b${id}`}><stop offset="0" stopColor={color} stopOpacity="0.32" /><stop offset="0.7" stopColor={color} stopOpacity="0.16" /><stop offset="1" stopColor={color} stopOpacity="0" /></radialGradient>
        </defs>
        <g transform={`translate(${x + jolt},${y}) rotate(${rot + (1 - sk) * -10}) scale(${scale * (2.5 - 1.5 * sk) * (1 - 0.3 * o)})`}>
          {f >= imp ? <ellipse rx={(W / 2 + 40) * (0.85 + 0.3 * bleed)} ry={(H / 2 + 40) * (0.85 + 0.3 * bleed)} fill={`url(#b${id})`} opacity={1 - 0.4 * bleed} /> : null}
          <rect x={-W / 2} y={-H / 2} width={W} height={H} rx={18} fill="rgba(255,248,236,0.84)" />
          <g mask={`url(#m${id})`}>
            <rect x={-W / 2 + 5} y={-H / 2 + 5} width={W - 10} height={H - 10} rx={14} fill="none" stroke={color} strokeWidth={9 + 2 * bleed} />
            <rect x={-W / 2 + 19} y={-H / 2 + 19} width={W - 38} height={H - 38} rx={8} fill="none" stroke={color} strokeWidth={3.5} />
            <text x={0} y={size * 0.36} textAnchor="middle" fontFamily={FONT_STACK} fontWeight={700} fontSize={size} letterSpacing={size * 0.08} fill={color}
              stroke={color} strokeWidth={2.5 * bleed} strokeLinejoin="round">{text}</text>
          </g>
          {f >= imp ? spat.map((s, i) => <circle key={i} cx={s.x} cy={s.y} r={s.r * (0.6 + 0.4 * bleed)} fill={color} opacity={0.85} />) : null}
        </g>
      </Svg>
    </Fill>
  );
};

export type StepCounterProps = { at: number; out?: number; x?: number; y?: number; scale?: number; spinAt?: number; rate?: number; ramp?: number; value?: number; wrist?: Pt; frame?: number };
/** steps at frame f: 0 before spinAt, then the rate ramps linearly to `rate` steps/frame over `ramp` frames */
export const stepsAt = (f: number, spinAt: number | undefined, rate: number, ramp: number) => {
  if (spinAt === undefined || f <= spinAt) return 0;
  const t = f - spinAt;
  return t < ramp ? (rate * t * t) / (2 * ramp) : rate * (t - ramp / 2);
};
export const StepCounter: React.FC<StepCounterProps> = ({ at, out, x = 760, y = 520, scale = 1, spinAt, rate = 4, ramp = 24, value, wrist, frame }) => {
  useOverlayFont();
  const id = useSvgId();
  const f = useF(frame);
  if (f < at || (out !== undefined && f > out + 8)) return null;
  const k = springAt(f, at, PUNCH), o = outK(f, out);
  const v = value ?? stepsAt(f, spinAt, rate, ramp);
  const speed = value === undefined ? stepsAt(f, spinAt, rate, ramp) - stepsAt(f - 1, spinAt, rate, ramp) : 0;
  const ND = 4, dw = 54, lh = 84;
  const cols = Array.from({ length: ND }, (_, i) => {
    const p = Math.pow(10, i);
    const whole = Math.floor(v / p);
    let pos = whole % 10;
    if (i === 0) pos = v % 10;
    else { const rem = v % p; const carry = clamp01(rem - (p - 1)); pos = (whole % 10) + carry; }
    return { pos, lead: v < p && i > 0 };
  }).reverse();
  const bw = ND * dw + 150, bh = 132;
  return (
    <Fill>
      {wrist ? (
        <Svg style={{ opacity: (1 - o) * clamp01(k * 2) }}>
          <line x1={wrist.x} y1={wrist.y} x2={x} y2={y} stroke={COL.ink} strokeWidth={9} strokeLinecap="round" />
          <line x1={wrist.x} y1={wrist.y} x2={x} y2={y} stroke="#fff" strokeWidth={4} strokeLinecap="round" />
          <circle cx={wrist.x} cy={wrist.y} r={11} fill="#fff" stroke={COL.ink} strokeWidth={5} />
        </Svg>
      ) : null}
      <At x={x} y={y} s={scale * k * (1 - 0.3 * o)} o={1 - o}>
        <svg width={bw + 200} height={bh + 60} viewBox={`${-bw / 2 - 100} ${-bh / 2 - 30} ${bw + 200} ${bh + 60}`} style={{ position: "absolute", left: -bw / 2 - 100, top: -bh / 2 - 30, overflow: "visible" }}>
          <defs><clipPath id={`w${id}`}><rect x={-ND * dw / 2 + 20} y={-lh / 2 - 2} width={ND * dw} height={lh + 4} rx={8} /></clipPath></defs>
          {/* strap */}
          <rect x={-bw / 2 - 90} y={-38} width={bw + 180} height={76} rx={30} fill="#2b3150" stroke={COL.ink} strokeWidth={6} />
          {[-1, 1].map((sd) => [0, 1, 2].map((j) => <circle key={`${sd}${j}`} cx={sd * (bw / 2 + 22 + j * 22)} cy={0} r={5} fill="#141828" />))}
          {/* face */}
          <rect x={-bw / 2} y={-bh / 2} width={bw} height={bh} rx={34} fill="#0d1020" stroke={COL.ink} strokeWidth={7} />
          <rect x={-bw / 2 + 8} y={-bh / 2 + 8} width={bw - 16} height={bh - 16} rx={27} fill="none" stroke="#3a4170" strokeWidth={3} />
          {/* shoe icon */}
          <g transform={`translate(${-bw / 2 + 58},4)`}>
            <path d="M-26,8 L-24,-14 Q-12,-12 -6,-4 L14,2 Q26,5 26,14 L-26,14 Z" fill={COL.gold} stroke={COL.ink} strokeWidth={3} strokeLinejoin="round" />
            <line x1={-26} y1={14} x2={26} y2={14} stroke={COL.ink} strokeWidth={5} strokeLinecap="round" />
          </g>
          {/* odometer */}
          <g clipPath={`url(#w${id})`}>
            {cols.map((c, i) => {
              const cx = -ND * dw / 2 + 20 + dw * (i + 0.5);
              const blur = i === ND - 1 ? clamp01(speed / 3) : i === ND - 2 ? clamp01(speed / 30) : 0;
              return (
                <g key={i} opacity={c.lead ? 0.22 : 1}>
                  {[0, ...(blur > 0 ? [-0.35, 0.35] : [])].map((g, j) => (
                    <g key={j} transform={`translate(${cx},${-(c.pos + g) * lh})`} opacity={j === 0 ? 1 - 0.25 * blur : 0.3 * blur}>
                      {Array.from({ length: 13 }, (_, d) => (
                        <text key={d} x={0} y={(d - 1) * lh + 30} textAnchor="middle" fontFamily={FONT_STACK} fontWeight={700} fontSize={84} fill="#ffffff">{(d + 9) % 10}</text>
                      ))}
                    </g>
                  ))}
                </g>
              );
            })}
          </g>
          <text x={bw / 2 - 30} y={34} textAnchor="middle" fontFamily={FONT_STACK} fontWeight={700} fontSize={30} fill={COL.gold}>步</text>
        </svg>
      </At>
    </Fill>
  );
};

// ================================================================================================ 8. Rewind
export type RewindProps = { at: number; dur?: number; tcFrom?: number; speed?: number; frame?: number };
const tcStr = (sec: number) => {
  const s = Math.max(0, sec), m = Math.floor(s / 60), ss = Math.floor(s % 60), ff = Math.floor((s % 1) * 30);
  return `${String(m).padStart(2, "0")}:${String(ss).padStart(2, "0")}:${String(ff).padStart(2, "0")}`;
};
export const Rewind: React.FC<RewindProps> = ({ at, dur = 15, tcFrom = 56.4, speed = 13.7, frame }) => {
  useOverlayFont();
  const f = useF(frame);
  if (f < at || f >= at + dur) return null;
  const t = f - at;
  const env = Math.min(1, (t + 1) / 2, (dur - t) / 2);
  const seed = (s: string) => random(`rw-${f}-${s}`);
  const bands = Array.from({ length: 5 }, (_, i) => {
    const h = 50 + random(`rwb-h${i}`) * 150;
    const yy = ((random(`rwb-y${i}`) * 2100 + t * (170 + i * 45)) % 2200) - 160;
    return { y: yy, h, off: (seed(`bo${i}`) - 0.5) * 80 };
  });
  const dashes = Array.from({ length: 260 }, (_, i) => ({ x: seed(`x${i}`) * 1080, y: seed(`y${i}`) * 1920, w: 8 + seed(`w${i}`) * 60, h: 2 + seed(`h${i}`) * 3.5, a: 0.3 + seed(`a${i}`) * 0.6, c: seed(`c${i}`) > 0.45 }));
  const blink = t % 6 < 4;
  return (
    <Fill>
      <div style={{ position: "absolute", inset: 0, opacity: env }}>
        <div style={{ position: "absolute", inset: 0, background: "rgba(40,60,120,0.2)" }} />
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 75% 60% at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,10,0.45) 100%)" }} />
        <Svg>
          {bands.map((b, i) => (
            <g key={i}>
              <rect x={0} y={b.y} width={1080} height={b.h} fill="rgba(235,240,255,0.26)" />
              {Array.from({ length: 6 }, (_, j) => <rect key={j} x={(seed(`bx${i}-${j}`) - 0.3) * 1080} y={b.y + seed(`by${i}-${j}`) * b.h} width={120 + seed(`bw${i}-${j}`) * 500} height={2 + seed(`bh${i}-${j}`) * 5} fill="#ffffff" opacity={0.5} />)}
              <rect x={b.off} y={b.y + b.h * 0.3} width={1080} height={3} fill="rgba(255,255,255,0.55)" />
              <rect x={b.off - 8} y={b.y + b.h * 0.3 + 6} width={1080} height={2} fill="rgba(255,60,60,0.45)" />
              <rect x={b.off + 8} y={b.y + b.h * 0.3 - 6} width={1080} height={2} fill="rgba(60,220,255,0.45)" />
              <rect x={0} y={b.y + b.h - 4} width={1080} height={4} fill="rgba(0,0,0,0.35)" />
            </g>
          ))}
          {dashes.map((d, i) => <rect key={i} x={d.x} y={d.y} width={d.w} height={d.h} fill={d.c ? "#ffffff" : "#1b1f2e"} opacity={d.a} />)}
          {Array.from({ length: 9 }, (_, i) => <rect key={`l${i}`} x={0} y={(i * 213 + t * 37) % 1920} width={1080} height={1.5} fill="rgba(255,255,255,0.18)" />)}
        </Svg>
        <div style={{ position: "absolute", left: 56, top: 196, display: "flex", alignItems: "center", gap: 22 }}>
          <svg width={128} height={76} viewBox="0 0 128 76" style={{ overflow: "visible", opacity: blink ? 1 : 0.25 }}>
            {[0, 58].map((dx) => (
              <path key={dx} d={`M${dx + 64},6 L${dx + 8},38 L${dx + 64},70 Z`} fill="#ffffff" stroke={COL.ink} strokeWidth={9} strokeLinejoin="round" paintOrder="stroke" />
            ))}
          </svg>
          <span style={ts(64, "#ffffff", 12)}>{tcStr(tcFrom - (t * speed) / 30)}</span>
        </div>
      </div>
    </Fill>
  );
};

// ================================================================================================ 9. PhoneScreen (2D close-up)
export type PhoneScreenProps = { at: number; out?: number; cue?: PhoneCue; thumb?: string; x?: number; top?: number; width?: number; state?: Partial<PhoneState>; safeY?: number; frame?: number };
export const PhoneScreen: React.FC<PhoneScreenProps> = ({ at, out, cue, thumb, x = 540, top = 40, width = 1000, state, safeY = 1250, frame }) => {
  const ready = useOverlayFont();
  const f = useF(frame);
  const ref = useRef<HTMLCanvasElement>(null);
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [handle] = useState(() => (thumb ? delayRender("phone thumb") : null));
  useEffect(() => {
    if (!thumb || handle === null) return;
    const im = new Image();
    im.onload = () => { setImg(im); continueRender(handle); };
    im.onerror = () => { continueRender(handle); };
    im.src = thumb;
  }, [thumb, handle]);
  const bez = 22;
  const sw = width - 2 * bez, sh = Math.round(sw * (844 / 390));
  const k = sw / PHONE_W_PT;
  const viewBottom = (safeY - top - bez) / k;
  useLayoutEffect(() => {
    const cv = ref.current;
    if (!cv || !ready) return;
    const g = cv.getContext("2d")!;
    drawPhoneScreen(g, cv.width, cv.height, phoneStateAt(f - at, cue, { viewBottom, ...(img ? { thumb: img } : {}), ...state }));
  });
  if (f < at || (out !== undefined && f > out + 8)) return null;
  const o = outK(f, out);
  return (
    <Fill>
      <div style={{ position: "absolute", left: x - width / 2, top, width, height: sh + 2 * bez, borderRadius: 120, background: "#07080d",
        boxShadow: "0 0 0 3px #3b4058, 0 30px 80px rgba(0,0,0,0.6)", opacity: 1 - o, transform: `scale(${1 - 0.1 * o})` }}>
        <canvas ref={ref} width={sw} height={sh} style={{ position: "absolute", left: bez, top: bez, width: sw, height: sh, borderRadius: 100 }} />
      </div>
    </Fill>
  );
};

// ================================================================================================ 10. EndCard
export type EndCardProps = { at: number; out?: number; frame?: number; title?: [string, string]; ask?: [string, string]; follow?: string; sources?: [string, string] };
export const EndCard: React.FC<EndCardProps> = ({ at, out, frame, title = ["你的朋友，", "有几个也把你当朋友？"], ask = ["发给你会打五分的那个人：", "你给我打几分？"],
  follow = "关注 Juno · 一起看懂世界", sources = ["来源：Almaatouq et al. 2016, PLoS ONE 11(3): e0151588", "The Conversation, Research Check, 2016"] }) => {
  useOverlayFont();
  const id = useSvgId();
  const f = useF(frame);
  if (f < at || (out !== undefined && f > out + 20)) return null;
  const t = f - at;
  const bg = eInOut(t / 12);
  const black = out === undefined ? 0 : eIn((f - out) / 18);
  const ring = eInOut((t - 4) / 24);
  const jO = clamp01((t - 12) / 8);
  const spark = clamp01((t - 22) / 8);
  const sweep = lerp(-700, 700, eInOut((t - 44) / 22));
  const rope = eInOut((t - 34) / 18);
  const taut = springAt(f, at + 52, PUNCH);
  const qK = springAt(f, at + 50, PUNCH);
  const pK = springAt(f, at + 62, PUNCH);
  const srcO = clamp01((t - 70) / 14);
  const TS = 92;
  /** one centred title line, char by char (full-width trailing punctuation pulled back half an em); sheen = the
   *  white sweep pass drawn over the gold */
  const titleLine = (str: string, y: number, li: number, sheen = false) => {
    const chars = [...str];
    const trail = /[，。？！：；、]$/.test(str) ? 0.5 : 0;
    const w = (chars.length - trail) * TS;
    return chars.map((ch, i) => {
      const p = sheen ? 1 : eOut((t - 12 - (li * 5 + i) * 2) / 10);
      return (
        <text key={`${li}-${i}-${sheen}`} x={540 - w / 2 + (i + 0.5) * TS} y={y + (1 - p) * 30} textAnchor="middle" opacity={p} fontFamily={FONT_STACK} fontWeight={700} fontSize={TS}
          fill={sheen ? `url(#sw${id})` : `url(#gm${id})`} stroke={sheen ? "none" : COL.ink} strokeWidth={14} paintOrder="stroke" strokeLinejoin="round">{ch}</text>
      );
    });
  };
  const RY = 852, sagY = RY + 70 * (1 - taut) + 10;
  return (
    <Fill>
      <div style={{ position: "absolute", inset: 0, opacity: bg, background: "radial-gradient(ellipse 80% 55% at 50% 42%, rgba(27,32,51,0.93) 0%, rgba(12,15,26,0.95) 55%, rgba(4,5,9,0.97) 100%)" }} />
      <Svg style={{ opacity: bg }}>
        <defs>
          <linearGradient id={`gm${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff3cf" /><stop offset="0.45" stopColor="#ffd36b" /><stop offset="0.75" stopColor="#e6a63a" /><stop offset="1" stopColor="#b97a24" />
          </linearGradient>
          <linearGradient id={`sw${id}`} x1={540 + sweep - 140} y1="0" x2={540 + sweep + 140} y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#fff" stopOpacity="0" /><stop offset="0.5" stopColor="#fff" stopOpacity="0.8" /><stop offset="1" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          <radialGradient id={`kl${id}`}><stop offset="0" stopColor="#f1c56d" stopOpacity="0.2" /><stop offset="1" stopColor="#f1c56d" stopOpacity="0" /></radialGradient>
          <clipPath id={`tc${id}`}><rect x={0} y={520} width={1080} height={240} /></clipPath>
        </defs>
        <ellipse cx={540} cy={700} rx={620} ry={520} fill={`url(#kl${id})`} />
        {/* J monogram */}
        <g transform="translate(540,336)">
          <circle r={78} fill="none" stroke={COL.gold} strokeWidth={4} pathLength={1} strokeDasharray={`${ring} 2`} transform="rotate(-90)" />
          <circle r={67} fill="none" stroke={COL.gold} strokeWidth={1.5} opacity={0.35 * ring} />
          <text x={4} y={34} textAnchor="middle" fontFamily={FONT_STACK} fontWeight={700} fontSize={104} fill={COL.gold} opacity={jO} transform="skewX(-12)">J</text>
          <path d="M0,-12 L3,-3 L12,0 L3,3 L0,12 L-3,3 L-12,0 L-3,-3 Z" fill="#fff4d6" transform={`translate(58,-58) scale(${spark * 1.3}) rotate(${spark * 90})`} />
        </g>
        {/* title */}
        {titleLine(title[0], 612, 0)}
        {titleLine(title[1], 728, 1)}
        {t > 44 && t < 68 ? (
          <g clipPath={`url(#tc${id})`} style={{ mixBlendMode: "screen" }}>
            {titleLine(title[0], 612, 0, true)}
            {titleLine(title[1], 728, 1, true)}
          </g>
        ) : null}
        {/* motif: one gold rope, held at both ends */}
        <g opacity={clamp01((t - 30) / 6)}>
          <RopeStroke d={`M330,${RY} Q540,${sagY} 750,${RY}`} w={12} pathLength={1} dash={`${rope} 2`} col={COL.rope} />
          {rope >= 1 ? <RopeStroke d={`M330,${RY} Q540,${sagY} 750,${RY}`} w={12} col={taut > 0.5 ? COL.gold : COL.rope} /> : null}
          {[298, 782].map((hx, i) => (
            <g key={i} transform={`translate(${hx},${RY - 14})`}>
              <circle r={26} fill="#fff" stroke={COL.ink} strokeWidth={6} />
              <circle cx={-8} cy={2} r={3.4} fill={COL.ink} /><circle cx={8} cy={2} r={3.4} fill={COL.ink} />
            </g>
          ))}
          {taut > 0 && f < at + 64 ? <ellipse cx={540} cy={RY + 6} rx={260 * taut} ry={22 * taut} fill="#ffd36b" opacity={0.35 * (1 - clamp01((f - at - 52) / 12))} /> : null}
        </g>
      </Svg>
      {/* question */}
      <At x={540 + 0.25 * 50} y={968} s={qK} o={clamp01(qK * 2) * bg}><C style={ts(50)}>{ask[0]}</C></At>
      <At x={540 + 0.25 * 76} y={1052} s={qK} o={clamp01(qK * 2) * bg}><C style={ts(76, COL.gold, 13)}>{ask[1]}</C></At>
      {/* follow pill */}
      {t >= 62 ? (
        <At x={540} y={1180} s={pK} o={bg}>
          <C><div style={{ ...pill(COL.gold), padding: "12px 38px", background: "rgba(12,14,24,0.7)" }}><SepText text={follow} size={42} col={COL.gold} color={COL.gold} sw={6} /></div></C>
        </At>
      ) : null}
      {/* sources */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 1478, textAlign: "center", opacity: 0.6 * srcO * bg, fontFamily: FONT_STACK, fontWeight: 700, fontSize: 26, lineHeight: 1.5, color: "#e9e4d8" }}>
        <div>{sources[0]}</div><div>{sources[1]}</div>
      </div>
      <div style={{ position: "absolute", inset: 0, background: "#000", opacity: black }} />
    </Fill>
  );
};
