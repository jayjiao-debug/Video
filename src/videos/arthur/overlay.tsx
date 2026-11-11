// 2D overlays of the Arthur film (1080 x 1920). Same look as group/kit/overlay.tsx (Noto Sans SC Bold, white and gold
// type with a thick ink stroke and a hard drop shadow; punchy springs; pure functions of the frame). Captions are the
// engine's (Film.tsx), never drawn here.
//
//   <PullCounter n at out? x? y? frame />     "第 N 次": the count of pulls (N as a digit: 一 / 二 / 三 read as bars at
//        this weight). The numeral slams in on `at` (the frame
//        the sword comes free), with one small gold sword per pull so far under it. Default place: top centre
//        (540, 300). Give out (7-frame leave) before the cut that ends the beat. n = 1..6.
//   <Mark kind="!" | "?" | "!?" at out? x y size? color? frame />   a comic mark that pops beside / above a head:
//        x, y = its centre in px (project the head's world point and go up ~150 px). Tilts a little, bounces in.
//   <Burst at x y r? n? frame />               short radial ink dashes round a point for 8 frames (a hit, a pop, the
//        sword coming free).
//   <Crown at out? x y size? frame />           a gold crown icon that pops in (the "is he king or not" question, the end)
//   <NameTag at out? x y text sub? frame />     a name over a head: text (big, gold) with an optional small white line
//        under it (e.g. text "凯" sub "亚瑟的哥哥"). x, y = the centre of the name: put it about 170 px above the head.
//   <Flush x y r a? frame? />                   a red flush over a straining face ("脸都憋红了"): x, y = the head's centre
//        on screen (w.project(rig.headWorld())), r = the head's radius on screen in px (project a point 0.2 m beside the
//        head and take the distance), a = strength 0..1 (animate it up as the strain builds). Multiplies, so the drawn
//        face stays readable. Give it only while the head is in close or medium shot.
// Also usable from the group kit (import from "../group/kit/overlay"): <CornerTag at out text icon="none" tone="white"
// corner="tl" /> for time tags (新年 / 几天后 / 二月 / 春天 / 初夏) and <Stamp at x y text rot /> (a red rubber stamp,
// e.g. 改天再拔 / 又拖 / 还拖).
// Keep everything out of the caption band (y 1190-1500) and below y 1610; and x > 930 for y > 900 (the app's rail).
import React from "react";
import { AbsoluteFill, useCurrentFrame, spring } from "remotion";
import { COL, PUNCH, SNAP, ts, useOverlayFont } from "../group/kit/overlay";

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const eIn = (x: number) => Math.pow(clamp01(x), 3);
const springAt = (f: number, at: number, cfg = PUNCH) => (f < at ? 0 : spring({ frame: f - at, fps: 30, config: cfg }));
const outK = (f: number, out?: number) => (out === undefined ? 0 : eIn((f - out) / 7));

/** a small sword glyph, point down, centred on 0,0; h = its height in px. The ink is drawn UNDER the fills
 *  (paint-order) and stays thin: at this size a full-width outline swallowed the blade and the glyph read as a black
 *  dagger mark. */
const SwordGlyph: React.FC<{ h: number; col?: string }> = ({ h, col = COL.gold }) => {
  const w = h * 0.44;
  return (
    <svg width={w} height={h} viewBox="-22 -50 44 100" style={{ position: "absolute", left: -w / 2, top: -h / 2, overflow: "visible" }}>
      <g stroke={COL.ink} strokeWidth={7} strokeLinejoin="round" strokeLinecap="round" style={{ paintOrder: "stroke" }}>
        <path d="M-7.5,-20 L7.5,-20 L7.5,30 L0,47 L-7.5,30 Z" fill="#f4f7fb" />
        <rect x={-20} y={-27} width={40} height={10} rx={4} fill={col} />
        <rect x={-4.5} y={-41} width={9} height={15} fill="#8a5a2e" />
        <circle cx={0} cy={-44} r={7} fill={col} />
      </g>
    </svg>
  );
};

export type PullCounterProps = { n: number; at: number; out?: number; x?: number; y?: number; scale?: number; frame?: number };
export const PullCounter: React.FC<PullCounterProps> = ({ n, at, out, x = 540, y = 300, scale = 1, frame }) => {
  useOverlayFont();
  const cur = useCurrentFrame(); const f = frame ?? cur;
  if (f < at) return null;
  const leave = outK(f, out); if (leave >= 1) return null;
  const k = springAt(f, at, PUNCH), kn = springAt(f, at + 1, { damping: 8, stiffness: 260, mass: 0.6 });
  const s = scale * (1 - leave), o = 1 - leave;
  const gap = 66, w0 = (n - 1) * gap;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: x, top: y, width: 0, height: 0, transform: `scale(${s})`, opacity: o }}>
        <div style={{ position: "absolute", left: -330, top: -150, width: 660, height: 330, background: "radial-gradient(closest-side, rgba(10,12,22,0.5) 0%, rgba(10,12,22,0.46) 50%, rgba(10,12,22,0.2) 80%, rgba(10,12,22,0) 100%)", opacity: clamp01(k) }} />
        <div style={{ position: "absolute", left: 0, top: 0, transform: `translate(-50%,-50%) scale(${0.6 + 0.4 * k})`, display: "flex", alignItems: "center", gap: 14, whiteSpace: "nowrap" }}>
          <span style={ts(96, COL.white)}>第</span>
          <span style={{ ...ts(230, COL.gold), display: "inline-block", transform: `scale(${0.3 + 0.7 * kn}) rotate(${(1 - Math.min(1, kn)) * -14}deg)` }}>{String(n)}</span>
          <span style={ts(96, COL.white)}>次</span>
        </div>
        {Array.from({ length: n }, (_, i) => {
          const ki = i === n - 1 ? springAt(f, at + 4, SNAP) : 1;
          return (
            <div key={i} style={{ position: "absolute", left: -w0 / 2 + i * gap, top: 150, width: 0, height: 0, transform: `scale(${ki})`, opacity: clamp01(k) }}>
              <SwordGlyph h={104} />
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export type MarkProps = { kind: "!" | "?" | "!?"; at: number; out?: number; x: number; y: number; size?: number; color?: string; frame?: number };
export const Mark: React.FC<MarkProps> = ({ kind, at, out, x, y, size = 150, color, frame }) => {
  useOverlayFont();
  const cur = useCurrentFrame(); const f = frame ?? cur;
  if (f < at) return null;
  const leave = outK(f, out); if (leave >= 1) return null;
  const k = springAt(f, at, { damping: 7, stiffness: 300, mass: 0.5 });
  const col = color ?? (kind === "?" ? COL.white : COL.gold);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: x, top: y, width: 0, height: 0 }}>
        <div style={{ position: "absolute", left: 0, top: 0, transform: `translate(-50%,-50%) scale(${k * (1 - leave)}) rotate(${kind === "?" ? 10 : -8}deg)`, transformOrigin: "50% 80%", opacity: 1 - leave, ...ts(size, col) }}>{kind}</div>
      </div>
    </AbsoluteFill>
  );
};

export type BurstProps = { at: number; x: number; y: number; r?: number; n?: number; color?: string; frame?: number };
export const Burst: React.FC<BurstProps> = ({ at, x, y, r = 120, n = 10, color = COL.gold, frame }) => {
  const cur = useCurrentFrame(); const f = frame ?? cur;
  const u = (f - at) / 8;
  if (u < 0 || u >= 1) return null;
  const r0 = r * (0.35 + 0.65 * (1 - Math.pow(1 - u, 2))), len = r * 0.42 * (1 - u), o = 1 - u * u;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        <g opacity={o} strokeLinecap="round" fill="none">
          {Array.from({ length: n }, (_, i) => {
            const a = (i / n) * Math.PI * 2 + 0.3, c = Math.cos(a), s = Math.sin(a);
            const d = `M${x + c * r0},${y + s * r0} L${x + c * (r0 + len)},${y + s * (r0 + len)}`;
            return <g key={i}><path d={d} stroke={COL.ink} strokeWidth={17} /><path d={d} stroke={color} strokeWidth={9} /></g>;
          })}
        </g>
      </svg>
    </AbsoluteFill>
  );
};

export type CrownProps = { at: number; out?: number; x: number; y: number; size?: number; rot?: number; frame?: number };
export const Crown: React.FC<CrownProps> = ({ at, out, x, y, size = 170, rot = -6, frame }) => {
  const cur = useCurrentFrame(); const f = frame ?? cur;
  if (f < at) return null;
  const leave = outK(f, out); if (leave >= 1) return null;
  const k = springAt(f, at, { damping: 7, stiffness: 300, mass: 0.5 }), w = size, hgt = size * 0.72;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: x, top: y, width: 0, height: 0, transform: `scale(${k * (1 - leave)}) rotate(${rot}deg)`, opacity: 1 - leave }}>
        <svg width={w} height={hgt} viewBox="-52 -40 104 76" style={{ position: "absolute", left: -w / 2, top: -hgt / 2, overflow: "visible", filter: "drop-shadow(0px 7px 0px rgba(16,18,30,0.55))" }}>
          <g stroke={COL.ink} strokeWidth={7} strokeLinejoin="round" strokeLinecap="round">
            <path d="M-44,26 L-48,-18 L-24,2 L0,-34 L24,2 L48,-18 L44,26 Z" fill={COL.gold} />
            <rect x={-46} y={14} width={92} height={16} rx={5} fill="#f4b62a" />
            <circle cx={0} cy={22} r={5.5} fill="#e5484d" />
            <circle cx={-26} cy={22} r={4.5} fill="#3aa0ff" />
            <circle cx={26} cy={22} r={4.5} fill="#3aa0ff" />
            <circle cx={-48} cy={-19} r={5} fill="#fff3c4" />
            <circle cx={0} cy={-35} r={5.5} fill="#fff3c4" />
            <circle cx={48} cy={-19} r={5} fill="#fff3c4" />
          </g>
        </svg>
      </div>
    </AbsoluteFill>
  );
};

export type NameTagProps = { at: number; out?: number; x: number; y: number; text: string; sub?: string; size?: number; color?: string; frame?: number };
export const NameTag: React.FC<NameTagProps> = ({ at, out, x, y, text, sub, size = 84, color = COL.gold, frame }) => {
  useOverlayFont();
  const cur = useCurrentFrame(); const f = frame ?? cur;
  if (f < at) return null;
  const leave = outK(f, out); if (leave >= 1) return null;
  const k = springAt(f, at, PUNCH), ks = springAt(f, at + 3, SNAP);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: x, top: y, width: 0, height: 0, opacity: 1 - leave }}>
        <div style={{ position: "absolute", left: 0, top: 0, transform: `translate(-50%,-50%) scale(${(0.5 + 0.5 * k) * (1 - leave)})`, display: "flex", flexDirection: "column", alignItems: "center", whiteSpace: "nowrap" }}>
          <span style={ts(size, color)}>{text}</span>
          {sub ? <span style={{ ...ts(Math.round(size * 0.5), COL.white), marginTop: -6, transform: `scale(${ks})`, display: "inline-block" }}>{sub}</span> : null}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export type FlushProps = { x: number; y: number; r: number; a?: number };
export const Flush: React.FC<FlushProps> = ({ x, y, r, a = 1 }) => {
  if (a <= 0.01 || r < 6) return null;
  const k = clamp01(a);
  return (
    <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "multiply" }}>
      <div style={{ position: "absolute", left: x - r, top: y - r, width: 2 * r, height: 2 * r, borderRadius: "50%",
        background: `radial-gradient(closest-side, rgba(255,${Math.round(255 - 150 * k)},${Math.round(255 - 165 * k)},1) 0%, rgba(255,${Math.round(255 - 135 * k)},${Math.round(255 - 150 * k)},1) 62%, rgba(255,${Math.round(255 - 70 * k)},${Math.round(255 - 80 * k)},1) 84%, rgba(255,255,255,1) 100%)` }} />
    </AbsoluteFill>
  );
};
