// hud/ink.tsx: THE CROSS-CUT OVERLAYS of the Su film (PLAN.md sections 5, 6; WP1). Pure functions of their argument.
// Segments put them in Pose.overlays (they are drawn under the caption). Each takes `progress` 0..1 over the whole
// transition, with THE CUT AT 0.5: the frame is fully covered for progress 0.46 .. 0.56, so the frame before the cut and
// the cut frame are both hidden (the next scene's picture must show from INK_CUT on: inkCut(progress)).
//   InkWipe(progress)       the ink-wash wipe (G -> H, H -> I): a soft organic brush edge sweeping left to right,
//                           ink black-grey with paper texture and dry-brush streaks; 18-24 frames
//   InkDissolve(progress)   the flashback's wash OUT (B17 -> B18): paper-cream blots with grey ink rims bloom over the
//                           scroll picture (the painting washes out to paper), then shrink away and the colour picture
//                           bleeds back through them (integrator: was ink-black, read as a black frame)
//   ToneFade(k, color)      a fade through a tone (D -> E gold, E -> F deep blue, F -> G blue-black to dawn): k 0..1
//   transitionAt(f)         the cross-cut overlay of frame f from beats.ts TRANSITIONS (both sides of each cut), or
//                           null: { node, p, cut, kind }; the WP1 stubs put transitionAt(f)?.node in their overlays
//   progressOf(t, f)        the progress of transition t on frame f (piecewise: 0.5 on the frame before the cut)
import React from "react";
import { AbsoluteFill } from "remotion";
import { clamp01, smootherstep, hash } from "../story";
import { TRANSITIONS, type Transition } from "../beats";

/** the progress at which the next scene's picture shows */
export const INK_CUT = 0.5;
/** true when the next scene's picture must show under the overlay */
export const inkCut = (progress: number) => progress >= INK_CUT;
const FULL0 = 0.46, FULL1 = 0.56;
const INKC = "#211f25", INK_LIGHT = "#4a4650", INK_BLEED = "#5d5862";
/** the flashback washes out to PAPER (never a near-black frame): cream blots with grey ink rims */
const PAPER = "#efe6d3";

/** the paper / brush texture inside the ink (horizontal streaks, the brush's direction) */
const Defs: React.FC<{ id: string; seed: number }> = ({ id, seed }) => (
  <defs>
    <filter id={`${id}edge`} x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.012 0.02" numOctaves={3} seed={seed} result="n" />
      <feDisplacementMap in="SourceGraphic" in2="n" scale={90} xChannelSelector="R" yChannelSelector="G" result="d" />
      <feGaussianBlur in="d" stdDeviation={2.2} />
    </filter>
    <filter id={`${id}bleed`} x="-20%" y="-20%" width="140%" height="140%">
      <feTurbulence type="fractalNoise" baseFrequency="0.02 0.03" numOctaves={2} seed={seed + 9} result="n2" />
      <feDisplacementMap in="SourceGraphic" in2="n2" scale={140} xChannelSelector="R" yChannelSelector="G" result="d2" />
      <feGaussianBlur in="d2" stdDeviation={22} />
    </filter>
    <filter id={`${id}tex`} x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.0025 0.045" numOctaves={3} seed={seed + 5} result="t" />
      <feColorMatrix in="t" type="matrix" values="0 0 0 0 0.86  0 0 0 0 0.84  0 0 0 0 0.8  0 0 0 0.9 -0.35" result="c" />
      <feComposite in="c" in2="SourceGraphic" operator="in" />
    </filter>
  </defs>
);

/** the ink-wash wipe; progress 0..1, the cut at 0.5 */
export const InkWipe = (progress: number, seed = 3): React.ReactNode => {
  const p = clamp01(progress);
  if (p <= 0 || p >= 1) return null;
  const id = `inkw${seed}`;
  // the covered part: [-inf, lead] while coming in, [trail, +inf] while going out; the edge leans (the top ahead)
  const lead = p < FULL0 ? -360 + 1800 * smootherstep(p / FULL0) : 99999;
  const trail = p > FULL1 ? -360 + 1800 * smootherstep((p - FULL1) / (1 - FULL1)) : -99999;
  const edge = (x0: number, side: 1 | -1) => {
    const pts: string[] = [];
    for (let y = -120; y <= 2040; y += 60) {
      const x = x0 + 160 * ((960 - y) / 960) * 0.5 + 40 * Math.sin(y * 0.006 + seed) + 30 * (hash(Math.round(y / 60), seed) - 0.5);
      pts.push(`${x.toFixed(1)},${y}`);
    }
    const far = side > 0 ? -2000 : 3200;
    return `M${far},-120 L${pts.join(" L")} L${far},2040 Z`;
  };
  const d = p < FULL0 ? edge(lead, 1) : p > FULL1 ? edge(trail, -1) : "M-2000,-200 L3200,-200 L3200,2200 L-2000,2200 Z";
  // dry-brush streaks along the moving edge
  const ex = p < FULL0 ? lead : p > FULL1 ? trail : -9999;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", left: 0, top: 0 }}>
        <Defs id={id} seed={seed} />
        <g filter={`url(#${id}bleed)`} opacity={0.55}>
          <path d={d} fill={INK_BLEED} />
        </g>
        <g filter={`url(#${id}edge)`}>
          <path d={d} fill={INKC} />
          {ex > -9000 ? Array.from({ length: 14 }, (_, i) => {
            const y = 80 + i * 132 + 40 * hash(i, seed), len = 120 + 220 * hash(i, seed + 1), x = ex + 80 * ((960 - y) / 960) + (p < FULL0 ? -len * 0.2 : -len * 0.8);
            return <rect key={i} x={x} y={y} width={len} height={6 + 10 * hash(i, seed + 2)} rx={4} fill={INKC} opacity={0.75} />;
          }) : null}
        </g>
        <g filter={`url(#${id}edge)`} opacity={0.16}>
          <path d={d} fill={INK_LIGHT} filter={`url(#${id}tex)`} />
        </g>
      </svg>
    </AbsoluteFill>
  );
};

/** the flashback's ink-wash OUT; progress 0..1, the cut at 0.5 (blots bloom over the scroll, then the colour bleeds back) */
export const InkDissolve = (progress: number, seed = 5): React.ReactNode => {
  const p = clamp01(progress);
  if (p <= 0 || p >= 1) return null;
  const id = `inkd${seed}`;
  const grow = p < FULL0 ? p / FULL0 : p > FULL1 ? 1 - (p - FULL1) / (1 - FULL1) : 1;
  const blots: React.ReactNode[] = [];
  for (let i = 0; i < 30; i++) {
    const cx = 1080 * hash(i, seed), cy = 1920 * hash(i, seed + 1), delay = 0.55 * hash(i, seed + 2), R = 260 + 260 * hash(i, seed + 3);
    const k = smootherstep(clamp01((grow - delay) / (1 - delay)));
    if (k > 0) blots.push(<circle key={i} cx={cx} cy={cy} r={R * k} fill={PAPER} />);
  }
  const full = clamp01((grow - 0.82) / 0.18);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", left: 0, top: 0 }}>
        <Defs id={id} seed={seed} />
        <g filter={`url(#${id}bleed)`} opacity={0.45}>
          <g fill={INK_BLEED}>{blots}</g>
        </g>
        <g filter={`url(#${id}edge)`}>
          {blots}
          {full > 0 ? <rect x={-200} y={-200} width={1480} height={2320} fill={PAPER} opacity={full} /> : null}
        </g>
        <g filter={`url(#${id}edge)`} opacity={0.1 * grow}>
          <rect x={-200} y={-200} width={1480} height={2320} fill={INK_LIGHT} filter={`url(#${id}tex)`} />
        </g>
      </svg>
    </AbsoluteFill>
  );
};

/** a fade through a tone: k 0..1 (never a hard black frame: the tones are colours) */
export const ToneFade = (k: number, color: string): React.ReactNode =>
  k > 0 ? <AbsoluteFill style={{ pointerEvents: "none", background: color, opacity: clamp01(k) }} /> : null;

/** the progress of transition t on frame f: 0 at t.from, 0.5 on the frame before the cut, 1 just after t.to */
export const progressOf = (t: Transition, f: number) =>
  f < t.cut ? (0.5 * (f - t.from + 1)) / (t.cut - t.from) : 0.5 + (0.5 * (f - t.cut + 1)) / (t.to - t.cut + 2);
const mixHex = (a: string, b: string, k: number) => {
  const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16), m = (s: number) => Math.round(((pa >> s) & 255) * (1 - k) + ((pb >> s) & 255) * k);
  return `rgb(${m(16)},${m(8)},${m(0)})`;
};
/** THE CROSS-CUT OVERLAY of frame f (beats.ts TRANSITIONS), or null */
export const transitionAt = (f: number): { node: React.ReactNode; p: number; cut: boolean; kind: Transition["kind"]; t: Transition } | null => {
  const t = TRANSITIONS.find((x) => f >= x.from && f <= x.to);
  if (!t) return null;
  const p = progressOf(t, f), cut = f >= t.cut;
  if (t.kind === "ink") return { node: InkWipe(p, t.cut % 7 + 2), p, cut, kind: t.kind, t };
  if (t.kind === "dissolve") return { node: InkDissolve(p), p, cut, kind: t.kind, t };
  const k = smootherstep(clamp01((1 - Math.abs(p - 0.5) / 0.5) * 1.15));
  const col = cut && t.tone2 ? mixHex(t.tone ?? "#000000", t.tone2, clamp01((p - 0.5) / 0.25)) : t.tone ?? "#000000";
  return { node: ToneFade(k, col), p, cut, kind: t.kind, t };
};
