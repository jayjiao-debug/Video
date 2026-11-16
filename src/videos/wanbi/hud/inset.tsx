// hud/inset.tsx: THE BUBBLE (Hongmen's hud/inset.tsx bubble, grown into a container: a thought cloud or a speech
// bubble that can hold other overlays).
//   bubble({ f, from, out, x: 330, y: 330, r: 190, to: headTop, thought: true,
//            content: frag(cities({ f, from: from + 3, mode: "bubble", x: 330, y: 340 }), mark({ ... })) })     8b
//   bubble({ f, from, x, y, text: "…", to: mouth })            a speech bubble with words
// THOUGHT: a white cloud of bumps on an ink line with three small puffs that lead from `to` (his head) to it; the
// puffs come one per frame from the head, the cloud pops on from + 2 (a spring about its centre). SPEECH: a white oval
// with a pointed tail to `to`. `content` (overlays drawn in film px, centred on the bubble) scales and fades with the
// cloud; `text` is drawn in its middle. Leaves over 5 frames from `out`.
import React from "react";
import { HC, FULL, clamp01, eOut, life, outOf, springAt, svgText, textW, PUNCH, type Pt } from "./base";

export type BubbleProps = {
  f: number; from: number; len?: number; out?: number; key?: string;
  /** the bubble's centre and radius */ x: number; y: number; r?: number;
  /** where its tail ends (his head) */ to?: Pt;
  /** true = a thought bubble (a cloud and dots, 8b); false = a speech bubble */ thought?: boolean;
  /** words inside (default none) */ text?: string; size?: number; color?: string;
  /** what sits inside (cities({ mode: "bubble" }), mark({ text: "?" })) */ content?: React.ReactNode;
};
/** the cloud's bumps: n circles round an ellipse (rx = 1.08 r, ry = 0.9 r) */
const bumps = (r: number) => {
  const n = 11, out: { x: number; y: number; r: number }[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2, k = i % 2 ? 0.34 : 0.4;
    out.push({ x: Math.cos(a) * r * 0.86, y: Math.sin(a) * r * 0.7, r: r * k });
  }
  out.push({ x: 0, y: 0, r: r * 0.78 });
  return out;
};
/** a bubble: 8b's thought bubble from his head to the upper left, centre (330, 330), r 190 */
export const bubble = (p: BubbleProps): React.ReactNode => {
  const { f, from, x, y, r = 190, to, thought = true } = p, Lf = life(f, from, outOf(p));
  if (!Lf) return null;
  const k = springAt(f, from + (thought ? 2 : 0), PUNCH), s = (0.3 + 0.7 * k) * (1 - 0.1 * Lf.lv), op = (1 - Lf.lv);
  const cop = clamp01((f - from - (thought ? 2 : 0) + 1) / 2) * op;
  const INK = 12, back: React.ReactNode[] = [], front: React.ReactNode[] = [], shade: React.ReactNode[] = [];
  // the puffs (thought) / the tail (speech), in film px
  if (to && thought) {
    const dx = x - to.x, dy = y - to.y, d = Math.hypot(dx, dy) || 1, ux = dx / d, uy = dy / d;
    const edge = d - r * 0.92, rs = [0.07, 0.1, 0.14].map((q) => q * r);
    rs.forEach((rr, i) => {
      if (f < from + i) return;
      const t = (0.18 + 0.27 * i) * edge, cx = to.x + ux * t, cy = to.y + uy * t, pk = eOut((f - from - i + 1) / 3);
      shade.push(<circle key={`ps${i}`} cx={cx} cy={cy + 6} r={rr * pk} fill={HC.shadow} />);
      back.push(<circle key={`pi${i}`} cx={cx} cy={cy} r={rr * pk + INK / 2} fill={HC.ink} />);
      front.push(<circle key={`pf${i}`} cx={cx} cy={cy} r={rr * pk} fill={HC.white} />);
    });
  }
  const cloud: React.ReactNode[] = [];
  if (thought) {
    const B = bumps(r);
    cloud.push(<g key="sh" transform="translate(0,10)" fill={HC.shadow}>{B.map((b, i) => <circle key={i} cx={b.x} cy={b.y} r={b.r + INK / 2} />)}</g>);
    cloud.push(<g key="ink" fill={HC.ink}>{B.map((b, i) => <circle key={i} cx={b.x} cy={b.y} r={b.r + INK / 2} />)}</g>);
    cloud.push(<g key="fill" fill={HC.white}>{B.map((b, i) => <circle key={i} cx={b.x} cy={b.y} r={b.r - INK / 2} />)}</g>);
  } else {
    let tail: string | null = null;
    if (to) {
      const tx = to.x - x, ty = to.y - y, d = Math.hypot(tx, ty) || 1, nx = -ty / d, ny = tx / d, bw = r * 0.22;
      tail = `M${(nx * bw).toFixed(1)},${(ny * bw).toFixed(1)} L${tx.toFixed(1)},${ty.toFixed(1)} L${(-nx * bw).toFixed(1)},${(-ny * bw).toFixed(1)} Z`;
    }
    const ov = (key: string, extra: React.SVGProps<SVGElement>) => [<ellipse key={`${key}e`} rx={r * 1.15} ry={r * 0.82} {...(extra as React.SVGProps<SVGEllipseElement>)} />, tail ? <path key={`${key}t`} d={tail} {...(extra as React.SVGProps<SVGPathElement>)} /> : null];
    cloud.push(<g key="sh" transform="translate(0,10)">{ov("s", { fill: HC.shadow, stroke: HC.shadow, strokeWidth: INK })}</g>);
    cloud.push(<g key="ink">{ov("i", { fill: HC.ink, stroke: HC.ink, strokeWidth: INK, strokeLinejoin: "round" })}</g>);
    cloud.push(<g key="fill">{ov("f", { fill: HC.white })}</g>);
  }
  if (p.text) {
    const size = p.size ?? 56, fit = Math.min(size, Math.floor((size * r * 1.7) / Math.max(1, textW(p.text, size, 2))));
    cloud.push(svgText("t", p.text, 0, 0, fit, p.color ?? HC.ink, { ls: 2 }));
  }
  const tf: React.CSSProperties = { transformOrigin: `${x}px ${y}px`, transform: `scale(${s.toFixed(4)})` };
  return (
    <div key={p.key ?? `bubble${from}`} style={{ ...FULL, opacity: op }}>
      {shade.length ? <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ ...FULL, overflow: "visible" }}>{shade}{back}{front}</svg> : null}
      <div style={{ ...FULL, overflow: "visible", opacity: cop, ...tf }}>
        <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ ...FULL, overflow: "visible" }}><g transform={`translate(${x},${y})`}>{cloud}</g></svg>
        {p.content ? <div style={{ ...FULL, overflow: "visible" }}>{p.content}</div> : null}
      </div>
    </div>
  );
};
