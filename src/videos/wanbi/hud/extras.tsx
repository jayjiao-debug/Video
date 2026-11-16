// hud/extras.tsx: the small things with words or marks (Hongmen's extras.tsx family, plus this film's new ones).
//   arrow({ f, from, out, a, b, seal: L("秦", "QIN") })   a DOTTED gold arrow that grows from a to b in 13 frames, a
//                                                       red seal slapped on at its head when it arrives (line 4, 16b)
//   label({ f, from, out, x, y, text: EARLIER })        a word with an ink line (default cream 56 px): 此前 / EARLIER
//   mark({ f, from, out, x, y, text: "?" })             a gold 「?」 / 「!」 (150 px) popping from its foot, a wobble
//   ring({ f, from, out, at: w.project(spot) })         a gold circle drawn round a world point in 6 frames (9: 瑕疵)
//   shout({ f, from, x, y })                            a comic burst with 万岁！ (zh, one per call) / "LONG LIVE" /
//                                                       "THE KING!" (en, one call), 14 frames
import React from "react";
import { L } from "../lang";
import { HC, FW, FULL, ZONE, clamp, clamp01, eOut, hash01, life, layerAt, outOf, springAt, svg0, svgText, inkText, textW, PUNCH, type Pt } from "./base";

type LifeP = { f: number; from: number; len?: number; out?: number; key?: string };

// ---------------------------------------------------------------------------------------------------- arrow + seal
/** the box of an arrow's seal at its head (text = 「秦」 or "QIN") */
const sealBox = (text: string) => {
  const wide = [...text].some((c) => (c.codePointAt(0) ?? 0) >= 0x2e80), size = wide ? 46 : 34, pad = wide ? 14 : 13;
  const w = Math.max(size + 2 * pad, textW(text, size, wide ? 0 : 2) + 2 * pad), h = size + 2 * pad;
  return { size, w, h, wide };
};
const quadAt = (a: Pt, c: Pt, b: Pt, t: number): Pt => ({ x: (1 - t) * (1 - t) * a.x + 2 * (1 - t) * t * c.x + t * t * b.x, y: (1 - t) * (1 - t) * a.y + 2 * (1 - t) * t * c.y + t * t * b.y });
/** a dotted gold arrow that grows from a to b (13 frames), with a red seal at its head: 「秦」/"QIN" (line 4),
 *  「赵」/"ZHAO" (16b). The seal keeps TAG_X from the side edges (the arrow ends on it). */
export const arrow = (p: LifeP & { a: Pt; b: Pt; seal?: string; color?: string; bend?: number }): React.ReactNode => {
  const { f, from, a, color = HC.gold, bend = 0.12 } = p, Lf = life(f, from, outOf(p));
  if (!Lf) return null;
  const S = p.seal ? sealBox(p.seal) : null;
  const b = S ? { x: clamp(p.b.x, ZONE.side + S.w / 2 + 6, FW - ZONE.side - S.w / 2 - 6), y: p.b.y } : p.b;
  const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy) || 1, nx = -dy / len, ny = dx / len;
  const c = { x: (a.x + b.x) / 2 + nx * len * bend, y: (a.y + b.y) / 2 + ny * len * bend };
  // arc length table
  const N = 80, pts: Pt[] = [], cum: number[] = [0];
  for (let i = 0; i <= N; i++) { pts.push(quadAt(a, c, b, i / N)); if (i) cum.push(cum[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y)); }
  const total = cum[N], stop = total - (S ? Math.max(S.w, S.h) / 2 + 30 : 0), u = eOut((Lf.t + 1) / 13), reach = stop * u;
  const at = (s: number) => { let i = 1; while (i < N && cum[i] < s) i++; const k = (s - cum[i - 1]) / Math.max(1e-6, cum[i] - cum[i - 1]); return { x: pts[i - 1].x + (pts[i].x - pts[i - 1].x) * k, y: pts[i - 1].y + (pts[i].y - pts[i - 1].y) * k, i }; };
  const dp: Pt[] = [], GAPD = 30, R0 = 8;
  for (let s = 0; s <= reach - 26; s += GAPD) dp.push(at(s));
  const tip = at(Math.max(1, reach)), back = at(Math.max(0, reach - 4)), tl = Math.hypot(tip.x - back.x, tip.y - back.y) || 1;
  const ux = (tip.x - back.x) / tl, uy = (tip.y - back.y) / tl, hs = 24, bx = tip.x - ux * hs * 1.4, by = tip.y - uy * hs * 1.4;
  const head = `M${tip.x.toFixed(1)},${tip.y.toFixed(1)} L${(bx - uy * hs).toFixed(1)},${(by + ux * hs).toFixed(1)} L${(bx + uy * hs).toFixed(1)},${(by - ux * hs).toFixed(1)} Z`;
  const kids: React.ReactNode[] = [
    <g key="ink" fill={HC.ink}>{dp.map((q, i) => <circle key={i} cx={q.x} cy={q.y} r={R0 + 5} />)}</g>,
    <path key="hi" d={head} fill={HC.ink} stroke={HC.ink} strokeWidth={12} strokeLinejoin="round" />,
    <g key="col" fill={color}>{dp.map((q, i) => <circle key={i} cx={q.x} cy={q.y} r={R0} />)}</g>,
    <path key="hc" d={head} fill={color} />,
  ];
  const land = from + 11, sk = S && f >= land ? f - land : -1;
  const seal = S && sk >= 0 ? layerAt("seal", b.x, b.y, { s: sk === 0 ? 1.5 : sk === 1 ? 1.15 : sk === 2 ? 0.95 : 1, rot: -6, op: sk === 0 ? 0.8 : 1 },
    svg0("s",
      <rect key="sh" x={-S.w / 2 - 6} y={-S.h / 2 - 6 + 8} width={S.w + 12} height={S.h + 12} rx={14} fill={HC.shadow} />,
      <rect key="rim" x={-S.w / 2 - 6} y={-S.h / 2 - 6} width={S.w + 12} height={S.h + 12} rx={14} fill={HC.cream} stroke={HC.ink} strokeWidth={5} />,
      <rect key="red" x={-S.w / 2} y={-S.h / 2} width={S.w} height={S.h} rx={9} fill={HC.seal} />,
      <rect key="in" x={-S.w / 2 + 6} y={-S.h / 2 + 6} width={S.w - 12} height={S.h - 12} rx={6} fill="none" stroke={HC.cream} strokeWidth={3} opacity={0.85} />,
      svgText("t", p.seal as string, 0, 0, S.size, HC.cream, { ls: S.wide ? 0 : 2 }))) : null;
  return (
    <div key={p.key ?? `arrow${from}`} style={{ ...FULL, opacity: 1 - Lf.lv }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ ...FULL, overflow: "visible" }}>{kids}</svg>
      {seal}
    </div>
  );
};

// ---------------------------------------------------------------------------------------------------- label
/** a word on the picture: 「此前」/"EARLIER" (cream, 56 px, centre (540, 300), BEAT.earlier) */
export const EARLIER = L("此前", "EARLIER");
/** a word with an ink line that pops in (a spring) and leaves in 5 frames; default cream 56 px */
export const label = (p: LifeP & { x: number; y: number; text: string; size?: number; color?: string; rot?: number }): React.ReactNode => {
  const { f, from, x, y, text, size = 56, color = HC.cream, rot = 0 } = p, Lf = life(f, from, outOf(p));
  if (!Lf) return null;
  const k = springAt(f, from, PUNCH), wide = [...text].some((c) => (c.codePointAt(0) ?? 0) >= 0x2e80);
  return (
    <div key={p.key ?? `label-${text}-${from}`} style={FULL}>
      <div style={{ position: "absolute", left: x, top: y, width: 0, height: 0, opacity: clamp01((Lf.t + 1) / 2) * (1 - Lf.lv) }}>
        <div style={{ position: "absolute", left: 0, top: 0, transform: `translate(-50%,-50%) scale(${((0.4 + 0.6 * k) * (1 - 0.15 * Lf.lv)).toFixed(4)}) rotate(${rot}deg)`, ...inkText(size, color), letterSpacing: wide ? Math.round(size * 0.18) : 3, paddingLeft: wide ? Math.round(size * 0.18) : 3 }}>{text}</div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------------------------------- mark
/** a gold 「?」 (5a) or 「!」 (18b), 150 px, over a head: pops from its foot by a spring and wobbles to rest */
export const mark = (p: LifeP & { x: number; y: number; text?: string; size?: number; color?: string }): React.ReactNode => {
  const { f, from, x, y, text = "?", size = 150, color = HC.gold } = p, Lf = life(f, from, outOf(p), 4);
  if (!Lf) return null;
  const k = springAt(f, from, { damping: 7, stiffness: 190, mass: 0.6 }), t = (Lf.t + 1) / 30;
  const wob = 8 + 9 * Math.exp(-t * 5) * Math.sin(t * 2 * Math.PI * 3.2);
  return (
    <div key={p.key ?? `mark-${text}-${from}`} style={FULL}>
      <div style={{ position: "absolute", left: x, top: y, width: 0, height: 0, opacity: 1 - Lf.lv }}>
        <div style={{ position: "absolute", left: 0, top: 0, transform: `translate(-50%,-50%) scale(${(k * (1 - 0.3 * Lf.lv)).toFixed(4)}) rotate(${(text === "!" ? -wob * 0.6 : wob).toFixed(2)}deg)`, transformOrigin: "50% 85%", ...inkText(size, color, Math.round(size * 0.1)) }}>{text}</div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------------------------------- ring
/** a gold circle drawn round a world point in 6 frames (9: the "flaw" on the jade; `at` = w.project of the spot), a
 *  little like a hand-drawn loop (an ellipse that overshoots its start), a soft pulse while it holds */
export const ring = (p: LifeP & { at: Pt; r?: number }): React.ReactNode => {
  const { f, from, at, r = 46 } = p, Lf = life(f, from, outOf(p), 4);
  if (!Lf) return null;
  const u = eOut((Lf.t + 1) / 6), pulse = Lf.t > 6 ? 1 + 0.05 * Math.sin((Lf.t - 6) * 0.7) : 1;
  // one and a bit turns of a tilted ellipse
  const n = 40, pts: string[] = [];
  for (let i = 0; i <= n; i++) {
    const a = -2.2 + (i / n) * (Math.PI * 2 + 0.6), rr = r * (1 + 0.06 * (i / n));
    const ex = Math.cos(a) * rr * 1.1, ey = Math.sin(a) * rr * 0.86, c = Math.cos(-0.3), s = Math.sin(-0.3);
    pts.push(`${(at.x + ex * c - ey * s).toFixed(1)},${(at.y + ex * s + ey * c).toFixed(1)}`);
  }
  const d = "M" + pts.join(" L");
  return (
    <svg key={p.key ?? `ring${from}`} width={1080} height={1920} viewBox="0 0 1080 1920" style={{ ...FULL, overflow: "visible", opacity: 1 - Lf.lv, transformOrigin: `${at.x}px ${at.y}px`, transform: `scale(${pulse.toFixed(4)})` }}>
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d={d} stroke={HC.ink} strokeWidth={21} pathLength={1} strokeDasharray={`${u} 2`} />
        <path d={d} stroke={HC.gold} strokeWidth={10} pathLength={1} strokeDasharray={`${u} 2`} />
      </g>
    </svg>
  );
};

// ---------------------------------------------------------------------------------------------------- shout
/** 万岁 (8a). zh: a burst 「万岁！」 per call (596, 604); en: ONE burst in two rows "LONG LIVE" / "THE KING!" (600-614).
 *  `text` = the rows (default SHOUT_TEXT) */
export const SHOUT_TEXT: string[] = L(["万岁！"], ["LONG LIVE", "THE KING!"]);
/** the burst's size: rx, ry = the radii of its spikes' base ellipse, sized so the text box (w x h, plus a margin and
 *  the ink line) stays inside the deepest valley between two spikes (0.864 of them); bw x bh = the whole burst's box
 *  (spikes, ink line, the -6 degree tilt) for keeping it clear of heads and the caption band */
export const shoutSize = (text: string[] = SHOUT_TEXT, size?: number) => {
  const sz = size ?? (text.some((r) => [...r].some((c) => (c.codePointAt(0) ?? 0) >= 0x2e80)) ? 60 : 44), rh = sz * 1.12;
  const w = Math.max(...text.map((r) => textW(r, sz, 2))), h = text.length * rh, m = 0.14 * sz + 5;
  const rx = (w / 2 + m) / Math.cos(0.61) / 0.864, ry = (h / 2 + m) / Math.sin(0.61) / 0.864;
  return { size: sz, rh, rx, ry, w, h, bw: 2 * 1.21 * rx + 12, bh: 2 * 1.28 * ry + 12 };
};
/** a comic burst (a spiky gold star with an ink line) with the words in ink; pops with a shake, 14 frames */
export const shout = (p: LifeP & { x: number; y: number; text?: string[]; size?: number; rot?: number }): React.ReactNode => {
  const { f, from, x, y, text = SHOUT_TEXT, rot = -6 } = p, Lf = life(f, from, outOf(p, 14), 4);
  if (!Lf) return null;
  const S = shoutSize(text, p.size), k = springAt(f, from, PUNCH), seed = from % 13;
  const n = 18, pts: string[] = [];
  for (let i = 0; i < 2 * n; i++) {
    const a = (i / (2 * n)) * Math.PI * 2, out = i % 2 === 0, j = out ? 0.92 + 0.16 * hash01(i, seed) : 0.96 + 0.08 * hash01(i, seed);
    const rx = (out ? S.rx * 1.12 : S.rx * 0.9) * j, ry = (out ? S.ry * 1.18 : S.ry * 0.9) * j;
    pts.push(`${(Math.cos(a) * rx).toFixed(1)},${(Math.sin(a) * ry).toFixed(1)}`);
  }
  const d = "M" + pts.join(" L") + " Z", sh = Lf.t < 6 ? [6, -5, 4, -3, 2, -1][Lf.t] : 0;
  return layerAt(p.key ?? `shout${from}`, x + sh, y, { s: (0.3 + 0.7 * k) * (1 - 0.1 * Lf.lv), rot, op: clamp01((Lf.t + 1) / 2) * (1 - Lf.lv) },
    svg0("s",
      <path key="sh" d={d} transform="translate(0,10)" fill={HC.shadow} />,
      <path key="ink" d={d} fill={HC.gold} stroke={HC.ink} strokeWidth={10} strokeLinejoin="round" />,
      <path key="in" d={d} transform="scale(0.8)" fill="none" stroke={HC.goldPale} strokeWidth={4} strokeLinejoin="round" opacity={0.8} />,
      ...text.map((r, i) => svgText(`t${i}`, r, 0, (i - (text.length - 1) / 2) * S.rh, S.size, HC.ink, { ls: 2 }))));
};
