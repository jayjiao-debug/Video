// hud/title.tsx: THE BIG WORDS of the Qin film (PLAN.md sections 5 and 7; WP4). Pure functions of the frame.
//   <TitleCard f />    「采访秦始皇的一天」 after line A14 (beats.ts TITLE_SPAN, 1.6 s): a brush title. 「秦始皇」 huge in gold
//                      with a thick ink line on a dry ink brush stroke (飞白 streaks at its tail, a few splashes),
//                      「采访」 above left and 「的一天」 below right in cream, a red 「秦」 seal after it. The brush look
//                      comes from the repo's only CJK font (FrSans, no new font files): each character a little
//                      turned / lifted / scaled by hand, and the edges roughened by an SVG displacement (fixed seed,
//                      the same on every frame). Motion: the brush sweeps in (6 frames), the three big characters pop
//                      in one after another (overshoot), the small words slide in, the seal slaps down on frame 15, the
//                      whole title drifts 3 % larger, and it fades over its last 6 frames. English: 「A DAY WITH」 over
//                      「THE FIRST / EMPEROR」 on the same brush stroke.
//   <NextDayCard f />  「第二天」 during BEAT.D.nextDay (the serious scene): calm, no pop; white with an ink line, the
//                      letters breathe apart slowly, a thin cream rule grows out on each side; 8-frame fades.
//   TITLE_RECT, NEXTDAY_RECT: the boxes they take.
import React from "react";
import { AbsoluteFill } from "remotion";
import { TITLE, clamp01, easeInCubic, easeOutBack, easeOutCubic, hash } from "../story";
import { BEAT, TITLE_SPAN } from "../beats";
import { EN, TXT } from "../lang";
import { sealNodes, stampLayout } from "../../wanbi/hud/stamp";
import { FONT_STACK, HC, em, inked, spanK, textW, wrapRows, type Rect } from "./style";

// ---------------------------------------------------------------------------------------------------- the brush
/** a dry brush stroke from x0 to x1 around y (rising `rise` px to the right), `th` px thick: a pressed round start,
 *  a ragged tapering tail; deterministic (seed) */
const brushPath = (x0: number, x1: number, y: number, th: number, rise: number, seed: number) => {
  const n = 34, top: string[] = [], bot: string[] = [];
  for (let i = 0; i <= n; i++) {
    const u = i / n, x = x0 + (x1 - x0) * u, yc = y - rise * (u - 0.5);
    const env = (0.72 + 0.28 * Math.min(1, u / 0.07)) * (u > 0.72 ? 1 - 0.62 * Math.pow((u - 0.72) / 0.28, 1.4) : 1) * (0.9 + 0.1 * Math.sin(Math.PI * u));
    const jt = (hash(i, seed) - 0.5) * th * (u > 0.8 ? 0.16 : 0.06), jb = (hash(i, seed + 7) - 0.5) * th * (u > 0.8 ? 0.16 : 0.06);
    top.push(`${x.toFixed(1)},${(yc - (th / 2) * env + jt).toFixed(1)}`);
    bot.unshift(`${x.toFixed(1)},${(yc + (th / 2) * env + jb).toFixed(1)}`);
  }
  // the round pressed start: a curve bulging left from the bottom-left point to the top-left point
  const ys = y + rise / 2, h0 = th * 0.36;
  return `M${top.join(" L")} L${bot.join(" L")} Q${(x0 - th * 0.42).toFixed(1)},${(ys + h0 * 0.2).toFixed(1)} ${x0.toFixed(1)},${(ys - h0).toFixed(1)} Z`;
};
/** the 飞白 streaks (dry bristles) on the tail: thin dark gaps in the stroke, longer toward the end */
const streaks = (x0: number, x1: number, y: number, th: number, rise: number, seed: number) => {
  const out: React.ReactNode[] = [];
  for (let k = 0; k < 9; k++) {
    const v = (k + 0.5) / 9 - 0.5, us = 0.48 + 0.32 * hash(k, seed + 3), ue = Math.min(1.02, us + 0.25 + 0.35 * hash(k, seed + 5));
    const xa = x0 + (x1 - x0) * us, xb = x0 + (x1 - x0) * ue;
    const ya = y - rise * (us - 0.5) + v * th * 0.8, yb = y - rise * (ue - 0.5) + v * th * 0.55;
    out.push(<path key={k} d={`M${xa.toFixed(1)},${ya.toFixed(1)} L${xb.toFixed(1)},${yb.toFixed(1)}`} stroke="#000" strokeWidth={(2.5 + 4 * hash(k, seed + 9)).toFixed(1)} strokeLinecap="round" />);
  }
  return out;
};
/** ink splashes round the stroke's ends */
const splashes = (x0: number, x1: number, y: number, th: number, seed: number) => {
  const out: React.ReactNode[] = [];
  for (let k = 0; k < 7; k++) {
    const end = k < 3, a = hash(k, seed + 11) * Math.PI * 2, d = th * (0.52 + 0.3 * hash(k, seed + 13));
    const cx = (end ? x0 + th * 0.05 : x1 - th * 0.15) + Math.cos(a) * d * (end ? 0.7 : 0.55), cy = y + Math.sin(a) * d * 0.7;
    out.push(<circle key={k} cx={cx.toFixed(1)} cy={cy.toFixed(1)} r={(3 + 7 * hash(k, seed + 17)).toFixed(1)} />);
  }
  return out;
};
const Defs: React.FC<{ id: string }> = ({ id }) => (
  <defs>
    <linearGradient id={`${id}gold`} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor={HC.goldTop} />
      <stop offset="0.55" stopColor="#ffd666" />
      <stop offset="1" stopColor="#f2a822" />
    </linearGradient>
    <filter id={`${id}rough`} x="-10%" y="-20%" width="120%" height="140%">
      <feTurbulence type="fractalNoise" baseFrequency="0.005 0.075" numOctaves={3} seed={4} result="n" />
      <feDisplacementMap in="SourceGraphic" in2="n" scale={16} xChannelSelector="R" yChannelSelector="G" />
    </filter>
    <filter id={`${id}edge`} x="-10%" y="-20%" width="120%" height="140%">
      <feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves={2} seed={9} result="n" />
      <feDisplacementMap in="SourceGraphic" in2="n" scale={5} xChannelSelector="R" yChannelSelector="G" />
    </filter>
  </defs>
);
/** one character (or word) drawn at (x, y) centre: drop, ink line under the fill */
const glyph = (key: string, s: string, x: number, y: number, px: number, fill: string, o: { sw: number; ls?: number; anchor?: "start" | "middle" | "end"; drop?: boolean }) => {
  const by = y + px * 0.355, anchor = o.anchor ?? "middle", ls = o.ls ?? 0;
  const common = { x: x + (anchor === "middle" ? ls / 2 : 0), textAnchor: anchor, fontFamily: FONT_STACK, fontWeight: 700, fontSize: px, letterSpacing: ls, strokeLinejoin: "round" as const };
  return (
    <g key={key}>
      {o.drop !== false ? <text {...common} y={by + Math.round(px * 0.06)} fill="#08080f" stroke="#08080f" strokeWidth={o.sw} opacity={0.5}>{s}</text> : null}
      <text {...common} y={by} fill={fill} stroke={HC.ink} strokeWidth={o.sw} style={{ paintOrder: "stroke fill" } as React.CSSProperties}>{s}</text>
    </g>
  );
};
/** the seal's slap: large over 2 frames, a squash, rest (t = frames since it lands - 2) */
const slap = (t: number) => (t < 0 ? 0 : t === 0 ? 1.7 : t === 1 ? 1.28 : t === 2 ? 0.94 : t === 3 ? 1.04 : 1);

// ---------------------------------------------------------------------------------------------------- the title
/** the title's three parts (Chinese); if the film's TITLE ever changes, the card falls back to one row of it */
const ZH_PARTS = { top: "采访", main: "秦始皇", tail: "的一天" };
const ZH_OK = ZH_PARTS.top + ZH_PARTS.main + ZH_PARTS.tail === TITLE;
const SEAL = stampLayout({ text: "秦", size: 44, gloss: false });
const CY = 670;                                                   // the brush stroke's centre y (above his face when he stands mid-frame)
/** the box the title takes (px) */
export const TITLE_RECT: Rect = { x0: 120, y0: CY - 220, x1: 930, y1: CY + 210 };

export const TitleCard: React.FC<{ f: number }> = ({ f }) => {
  const [a, b] = TITLE_SPAN;
  if (f < a || f > b) return null;
  const t = f - a, len = b - a + 1;
  const u = easeInCubic((f - (b - 6)) / 6);                        // the leave
  const drift = 1 + 0.03 * (t / len) + 0.05 * u;
  const sweep = easeOutCubic((t + 1) / 6);
  const id = "qtitle";
  // the parts and their places
  let main: string[] = [], mainPx: number[] = [], mainY: number[] = [], top = "", tail = "", th = 232;
  if (EN) {
    main = wrapRows(TITLE.replace(/^A Day with\s+/i, "").toUpperCase(), 10);
    mainPx = main.map((r) => Math.min(150, (820 - 4 * ([...r].length - 1)) / Math.max(1, textW(r, 1, 0))));
    const tot = mainPx.reduce((s, p) => s + p * 1.02, 0);
    let yy = CY - tot / 2;
    mainY = mainPx.map((p) => { const c = yy + (p * 1.02) / 2; yy += p * 1.02; return c; });
    top = /^A Day with/i.test(TITLE) ? "A DAY WITH" : ""; th = Math.max(232, tot + 80);
  } else if (ZH_OK) {
    top = ZH_PARTS.top; tail = ZH_PARTS.tail;
  }
  const x0 = 150, x1 = 922;
  const nodes: React.ReactNode[] = [];
  // the brush stroke (revealed left to right)
  nodes.push(
    <g key="brush" clipPath={`url(#${id}clip)`}>
      <g filter={`url(#${id}rough)`}>
        <g mask={`url(#${id}mask)`}>
          <path d={brushPath(x0, x1, CY, th, 36, 3)} fill="#120e16" opacity={0.9} />
        </g>
        <g fill="#120e16" opacity={0.85}>{splashes(x0, x1, CY, th, 5)}</g>
      </g>
    </g>,
  );
  // the big words
  if (!EN && ZH_OK) {
    const cs = [...ZH_PARTS.main], px = 200, gap = 216, rot = [-3.5, 1.8, -1.4], dy = [8, -7, 4], sc = [1, 1.07, 0.98];
    cs.forEach((ch, i) => {
      const st = 2 + 2 * i, k = easeOutBack((t - st + 1) / 7, 2.6), o = clamp01((t - st + 1) / 3);
      if (o <= 0) return;
      const x = 540 + (i - (cs.length - 1) / 2) * gap, y = CY + dy[i] - 6, s = (0.35 + 0.65 * k) * sc[i], r = rot[i] - 10 * (1 - clamp01(k));
      nodes.push(<g key={`m${i}`} opacity={o} transform={`translate(${x},${y}) rotate(${r.toFixed(2)}) scale(${s.toFixed(4)})`}>{glyph("g", ch, 0, 0, px, `url(#${id}gold)`, { sw: 18, drop: false })}</g>);
    });
    const kt = easeOutCubic((t - 7) / 7), ot = clamp01((t - 7) / 3);
    if (ot > 0) nodes.push(<g key="top" opacity={ot} transform={`translate(${(214 - 34 * (1 - kt)).toFixed(1)},${CY - 166}) rotate(-5)`}>{glyph("g", top, 0, 0, 88, HC.cream, { sw: 13, ls: 8, anchor: "start" })}</g>);
    const kl = easeOutCubic((t - 10) / 7), ol = clamp01((t - 10) / 3);
    if (ol > 0) nodes.push(<g key="tail" opacity={ol} transform={`translate(${(822 + 34 * (1 - kl)).toFixed(1)},${CY + 150}) rotate(-3)`}>{glyph("g", tail, 0, 0, 88, HC.cream, { sw: 13, ls: 8, anchor: "end" })}</g>);
    const ss = slap(t - 15);
    if (ss > 0) nodes.push(<g key="seal" transform={`translate(880,${CY + 150}) rotate(${(-6 - (t - 15 < 2 ? 6 : 0)).toFixed(1)}) scale(${ss.toFixed(3)})`}>{sealNodes(SEAL)}</g>);
  } else if (EN) {
    main.forEach((r, i) => {
      const st = 2 + 2 * i, k = easeOutBack((t - st + 1) / 7, 2.4), o = clamp01((t - st + 1) / 3);
      if (o <= 0) return;
      nodes.push(<g key={`m${i}`} opacity={o} transform={`translate(540,${mainY[i].toFixed(1)}) rotate(${(i ? 1.2 : -1.6).toFixed(2)}) scale(${(0.4 + 0.6 * k).toFixed(4)})`}>{glyph("g", r, 0, 0, mainPx[i], `url(#${id}gold)`, { sw: Math.round(mainPx[i] * 0.12), ls: 4, drop: false })}</g>);
    });
    const kt = easeOutCubic((t - 7) / 7), ot = clamp01((t - 7) / 3);
    if (top && ot > 0) nodes.push(<g key="top" opacity={ot} transform={`translate(${(540 - 30 * (1 - kt)).toFixed(1)},${(CY - th / 2 - 40).toFixed(1)}) rotate(-2)`}>{glyph("g", top, 0, 0, 62, HC.cream, { sw: 10, ls: 8 })}</g>);
    const ss = slap(t - 15);
    if (ss > 0) nodes.push(<g key="seal" transform={`translate(860,${(CY + th / 2 + 10).toFixed(1)}) rotate(-6) scale(${ss.toFixed(3)})`}>{sealNodes(SEAL)}</g>);
  } else {
    // the fallback: the whole TITLE in one gold row on the stroke
    const px = Math.min(130, 800 / Math.max(1, em(TITLE)));
    const k = easeOutBack((t - 1) / 7, 2.4), o = clamp01((t - 1) / 3);
    nodes.push(<g key="m" opacity={o} transform={`translate(540,${CY}) scale(${(0.4 + 0.6 * k).toFixed(4)})`}>{glyph("g", TITLE, 0, 0, px, `url(#${id}gold)`, { sw: Math.round(px * 0.13), ls: 4, drop: false })}</g>);
  }
  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity: 1 - u }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", left: 0, top: 0, overflow: "visible", transform: `scale(${drift.toFixed(4)})`, transformOrigin: `540px ${CY}px` }}>
        <Defs id={id} />
        <defs>
          <clipPath id={`${id}clip`}><rect x={x0 - 120} y={CY - th} width={((x1 - x0 + 260) * sweep).toFixed(1)} height={th * 2} /></clipPath>
          <mask id={`${id}mask`} maskUnits="userSpaceOnUse" x={0} y={0} width={1080} height={1920}>
            <rect x={0} y={0} width={1080} height={1920} fill="#fff" />
            {streaks(x0, x1, CY, th, 36, 21)}
          </mask>
        </defs>
        <g filter={`url(#${id}edge)`}>{nodes}</g>
      </svg>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------------------------------- 第二天
const ND_Y = 760, ND_PX = EN ? 92 : 120;
/** the box the 第二天 card takes (px) */
export const NEXTDAY_RECT: Rect = { x0: 120, y0: ND_Y - 80, x1: 960, y1: ND_Y + 80 };
export const NextDayCard: React.FC<{ f: number }> = ({ f }) => {
  const [a, b] = BEAT.D.nextDay;
  const o = spanK(f, a, b, 8, 8);
  if (o <= 0) return null;
  const k = clamp01((f - a) / Math.max(1, b - a));
  const ls = (EN ? 4 : 18) + (EN ? 6 : 14) * easeOutCubic(k);
  const w = textW(TXT.nextDay, ND_PX, ls), rule = 30 + 90 * easeOutCubic((f - a + 1) / 14);
  const lineY = ND_Y + 2, gapX = w / 2 + 34;
  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity: o }}>
      <div style={{ position: "absolute", left: 540 - gapX - rule, top: lineY - 3, width: rule, height: 6, borderRadius: 3, background: HC.cream, boxShadow: `0 0 0 3px ${HC.ink}` }} />
      <div style={{ position: "absolute", left: 540 + gapX, top: lineY - 3, width: rule, height: 6, borderRadius: 3, background: HC.cream, boxShadow: `0 0 0 3px ${HC.ink}` }} />
      <div style={{ position: "absolute", left: 540 + ls / 2, top: ND_Y, transform: "translate(-50%, -50%)", ...inked(ND_PX, HC.white, { letterSpacing: ls }) }}>{TXT.nextDay}</div>
    </AbsoluteFill>
  );
};
