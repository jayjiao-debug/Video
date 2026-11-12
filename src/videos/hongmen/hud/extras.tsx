// hud/extras.tsx: the small things: the SOURCE TAG, the NUMBERS of lines 3 to 4 (count, ratioBar), ×1 ×2 ×3 (times),
// a free LABEL and an ARROW.
//   sourceTag({ f, from: BEAT.source, out: BEAT.sourceOff })    《史记·项羽本纪》, small, top left; strong for the first
//                                                               4.5 s, then it stays faint. hud/index.ts registers it
//                                                               as a HUD: shots do NOT call it.
//   count({ f, from: HIT.n40, x, y, text: TXT.n40, camp: "xiang" })   「40万」 counts up 0 -> 40 over 10 frames and
//                                                               lands with a punch, in its camp's colour, white edge
//   ratioBar({ f, from: HIT.n40, bAt: HIT.n10, x, y })          one bar, 4 parts purple to 1 part red: 40万 against 10万
//   times({ f, hits: HIT.jade, x, y })                          ×1, ×2, ×3: the newest count pops on each hit
//   label({ f, from, out, x, y, text, size, color })            a word with an ink line (a place name, a mark)
//   arrow({ f, from, out, a: {x, y}, b: {x, y} })               a bold arrow from a to b ("this one"), draws on in 5 frames
import React from "react";
import { EN, TAG_X, TXT } from "../lang";
import { CAMP, HC, FULL, ZONE, FW, clamp, clamp01, eOut, life, layerAt, springAt, svg0, svgText, inkText, textW, PUNCH, SNAP, type Camp } from "./base";

// ---------------------------------------------------------------------------------------------------- source tag
export type SourceProps = { f: number; from: number; out?: number; x?: number; y?: number; text?: string; /** frames at full strength (default 135) */ strong?: number };
export const SOURCE_SIZE = 38;
export const sourceTag = (p: SourceProps): React.ReactNode => {
  const { f, from, x = TAG_X, y = ZONE.top, text = TXT.sourceFull, strong = 135 } = p, L = life(f, from, p.out);
  if (!L) return null;
  const k = eOut((L.t + 1) / 6), dim = 1 - 0.38 * clamp01((L.t - strong) / 15), w = textW(text, SOURCE_SIZE, 1);
  return (
    <div key="hud-source" style={FULL}>
      <div style={{ position: "absolute", left: x - 60 * (1 - k), top: y, width: 0, height: 0, opacity: k * dim * (1 - L.lv) }}>
        <svg width={2} height={2} viewBox="0 0 2 2" style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
          <rect x={0} y={-21 + 5} width={11} height={42} rx={5} fill="rgba(8,8,16,0.4)" />
          <rect x={0} y={-21} width={11} height={42} rx={5} fill={HC.seal} stroke={HC.ink} strokeWidth={5} style={{ paintOrder: "stroke fill" } as React.CSSProperties} />
          {svgText("t", text, 24 + w / 2, 0, SOURCE_SIZE, HC.cream, { ls: 1, sw: 9 })}
        </svg>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------------------------------- numbers
const withCommas = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
export type CountProps = {
  f: number; from: number; out?: number;
  /** centre in px */ x: number; y: number;
  /** "40万" / "400,000": the leading number counts up, the rest is the unit */ text: string;
  camp: Camp;
  /** digit size in px (default 150) */ size?: number;
  /** frames of counting (default 10; 0 = no count, just the pop) */ dur?: number;
  key?: string;
};
/** a NUMBER in its camp's colour with a white edge and an ink line round that. The count lands on from + dur. */
export const count = (p: CountProps): React.ReactNode => {
  const { f, from, x, y, text, camp, size = 150, dur = 10 } = p, L = life(f, from, p.out);
  if (!L) return null;
  const m = /^([\d,]+)(.*)$/.exec(text), target = m ? parseInt(m[1].replace(/,/g, ""), 10) : 0, unit = m ? m[2] : text, commas = !!m && m[1].includes(",");
  const u = dur > 0 ? clamp01((L.t + 1) / dur) : 1, v = Math.round(target * (0.15 * eOut(u) + 0.85 * u));
  const num = m ? (commas ? withCommas(v) : String(v)) : "", land = from + dur;
  const k = springAt(f, from, PUNCH), hit = f >= land ? 0.28 * (1 - springAt(f, land, SNAP)) : 0, tick = u < 1 ? 0.04 * ((L.t % 2) ? 1 : -1) : 0;
  const s = (0.45 + 0.55 * k) * (1 + hit + tick) * (1 - 0.15 * L.lv), e = Math.round(size * 0.12), us = Math.round(size * 0.62);
  const fill = CAMP[camp].num;
  const two = (txt: string, sz: number, ed: number, key: string, width?: number) => {
    const base: React.CSSProperties = { fontFamily: inkText(sz, fill).fontFamily, fontWeight: 700, fontSize: sz, lineHeight: 1, whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums", letterSpacing: 2 };
    return (
      <span key={key} style={{ position: "relative", display: "inline-block", width, textAlign: "right" }}>
        <span style={{ ...base, color: HC.ink, WebkitTextStroke: `${ed + 11}px ${HC.ink}`, textShadow: `0 ${Math.round(sz * 0.06)}px 0 rgba(8,8,16,0.38)` } as React.CSSProperties}>{txt}</span>
        <span style={{ ...base, position: "absolute", right: 0, top: 0, color: fill, WebkitTextStroke: `${ed}px #ffffff`, paintOrder: "stroke fill" } as React.CSSProperties}>{txt}</span>
      </span>
    );
  };
  // the digits keep the width of the final number, so the unit does not jitter while it counts
  const numW = m ? textW(commas ? withCommas(target) : String(target), size, 2) + 2 : 0;
  // (English: "400,000" is wider than "40万": the number keeps ZONE.side from the frame's edges, ink line included)
  const tw = numW + (unit ? textW(unit, m ? us : size, 2) : 0) + 2 * (e + 11), cx = EN ? clamp(x, ZONE.side + tw / 2, FW - ZONE.side - tw / 2) : x;
  return (
    <div key={p.key ?? `count-${text}-${from}`} style={FULL}>
      <div style={{ position: "absolute", left: cx, top: y, width: 0, height: 0, opacity: clamp01((L.t + 1) / 2) * (1 - L.lv) }}>
        <div style={{ position: "absolute", left: 0, top: 0, transform: `translate(-50%,-50%) scale(${s.toFixed(4)}) rotate(${(-4 * (1 - Math.min(1, k))).toFixed(2)}deg)`, display: "flex", alignItems: "baseline", whiteSpace: "nowrap" }}>
          {m ? two(num, size, e, "n", numW) : null}
          {unit ? two(unit, m ? us : size, Math.round((m ? us : size) * 0.13), "u") : null}
        </div>
      </div>
    </div>
  );
};
export type RatioProps = {
  f: number; from: number; out?: number;
  /** the frame the second (red) part grows (default from + 12) */ bAt?: number;
  /** centre, total width, height (default 540, y, 760, 46) */ x?: number; y: number; w?: number; h?: number;
  /** the two shares (default 40 : 10) */ a?: number; b?: number;
};
/** ONE BAR for 40万 against 10万: Xiang Yu's share in charcoal purple from the left, Liu Bang's in red at the right end */
export const ratioBar = (p: RatioProps): React.ReactNode => {
  const { f, from, x = 540, y, w = 760, h = 46, a = 40, b = 10 } = p, L = life(f, from, p.out);
  if (!L) return null;
  const bAt = p.bAt ?? from + 12, wa = (w * a) / (a + b), wb = w - wa, ka = eOut((L.t + 1) / 10), kb = eOut((f - bAt + 1) / 8), x0 = -w / 2;
  return layerAt(`ratio${from}`, x, y, { op: clamp01((L.t + 1) / 2) * (1 - L.lv) }, svg0("s",
    <rect key="sh" x={x0 - 6} y={-h / 2 - 6 + 9} width={w + 12} height={h + 12} rx={h / 2 + 6} fill={HC.shadow} />,
    <rect key="rim" x={x0 - 9} y={-h / 2 - 9} width={w + 18} height={h + 18} rx={h / 2 + 9} fill={HC.cream} />,
    <rect key="bg" x={x0} y={-h / 2} width={w} height={h} rx={h / 2} fill="#e9dcc0" stroke={HC.ink} strokeWidth={12} />,
    <rect key="bg2" x={x0} y={-h / 2} width={w} height={h} rx={h / 2} fill="#e9dcc0" />,
    ka > 0 ? <path key="a" d={`M${x0 + h / 2},${-h / 2} L${x0 + Math.max(h / 2, wa * ka)},${-h / 2} L${x0 + Math.max(h / 2, wa * ka)},${h / 2} L${x0 + h / 2},${h / 2} A${h / 2},${h / 2} 0 0 1 ${x0 + h / 2},${-h / 2} Z`} fill={CAMP.xiang.num} /> : null,
    kb > 0 ? <path key="b" d={`M${x0 + w - h / 2},${-h / 2} A${h / 2},${h / 2} 0 0 1 ${x0 + w - h / 2},${h / 2} L${x0 + w - Math.max(h / 2, wb * kb)},${h / 2} L${x0 + w - Math.max(h / 2, wb * kb)},${-h / 2} Z`} fill={CAMP.liu.num} /> : null,
    ka >= 1 && kb >= 1 ? <rect key="cut" x={x0 + wa - 3} y={-h / 2} width={6} height={h} fill={HC.ink} /> : null));
};

// ---------------------------------------------------------------------------------------------------- label, times, arrow
export type LabelProps = { f: number; from: number; out?: number; x: number; y: number; text: string; size?: number; color?: string; rot?: number; key?: string };
/** a word with an ink line that pops in (a spring) and leaves in 5 frames */
export const label = (p: LabelProps): React.ReactNode => {
  const { f, from, x, y, text, size = 72, color = HC.gold, rot = 0 } = p, L = life(f, from, p.out);
  if (!L) return null;
  const k = springAt(f, from, PUNCH);
  return (
    <div key={p.key ?? `label-${text}-${from}`} style={FULL}>
      <div style={{ position: "absolute", left: x, top: y, width: 0, height: 0, opacity: clamp01((L.t + 1) / 2) * (1 - L.lv) }}>
        <div style={{ position: "absolute", left: 0, top: 0, transform: `translate(-50%,-50%) scale(${((0.4 + 0.6 * k) * (1 - 0.15 * L.lv)).toFixed(4)}) rotate(${rot}deg)`, ...inkText(size, color) }}>{text}</div>
      </div>
    </div>
  );
};
/** ×1, ×2, ×3 (line 11): the newest count pops on each of `hits`; one label at (x, y) */
export const times = (p: { f: number; hits: number[]; out?: number; x: number; y: number; size?: number; texts?: string[] }): React.ReactNode => {
  const n = p.hits.filter((hf) => p.f >= hf).length;
  if (!n) return null;
  const texts = p.texts ?? TXT.times;
  return label({ f: p.f, from: p.hits[n - 1], out: p.out, x: p.x, y: p.y, text: texts[Math.min(n, texts.length) - 1], size: p.size ?? 104, color: n >= texts.length ? HC.seal : HC.gold, rot: -6, key: "times" });
};
export type ArrowProps = { f: number; from: number; out?: number; a: { x: number; y: number }; b: { x: number; y: number }; color?: string; bend?: number; key?: string };
/** a bold curved arrow from a to b (its head on b): ink under, colour over; draws on over 5 frames */
export const arrow = (p: ArrowProps): React.ReactNode => {
  const { f, from, a, b, color = HC.gold, bend = 0.18 } = p, L = life(f, from, p.out);
  if (!L) return null;
  const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy) || 1, nx = -dy / len, ny = dx / len;
  const cx = (a.x + b.x) / 2 + nx * len * bend, cy = (a.y + b.y) / 2 + ny * len * bend, u = eOut((L.t + 1) / 5);
  // the head's direction: the curve's tangent at b
  const tx = b.x - cx, ty = b.y - cy, tl = Math.hypot(tx, ty) || 1, ux = tx / tl, uy = ty / tl, hs = 30;
  const tipx = b.x, tipy = b.y, bx = tipx - ux * hs * 1.5, by = tipy - uy * hs * 1.5;
  const head = `M${tipx},${tipy} L${bx - uy * hs},${by + ux * hs} L${bx + uy * hs},${by - ux * hs} Z`, shaft = `M${a.x},${a.y} Q${cx},${cy} ${bx},${by}`;
  return (
    <svg key={p.key ?? `arrow${from}`} width={1080} height={1920} viewBox="0 0 1080 1920" style={{ ...FULL, overflow: "visible", opacity: 1 - L.lv }}>
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d={shaft} stroke={HC.ink} strokeWidth={30} pathLength={1} strokeDasharray={`${u} 2`} />
        {u >= 1 ? <path d={head} fill={HC.ink} stroke={HC.ink} strokeWidth={22} /> : null}
        <path d={shaft} stroke={color} strokeWidth={15} pathLength={1} strokeDasharray={`${u} 2`} />
        {u >= 1 ? <path d={head} fill={color} stroke={color} strokeWidth={7} /> : null}
      </g>
    </svg>
  );
};
