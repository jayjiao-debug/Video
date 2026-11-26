// THE SKIN of 采访月老的一天: A WEDDING INVITATION (喜帖). Everything the film lays over the picture is cut from red
// 洒金 paper with gold foil and cream inner sheets, written in ink, and TIED WITH RED THREAD: things arrive pulled
// taut on a thread (a quick tug, one overshoot) and leave by slackening. Four colours: 朱红 (his robe), foil gold,
// paper cream, ink. Two ways of treating the one face (FrSans): FOIL (heavy, gold with an ink line and a cream edge:
// names, 花字) and INK (plain ink on cream: facts, labels).
// Rules kept: pure functions of the frame; DOM / SVG in film px (1080 wide); nothing over a face (the shots place
// things); no effect in the quiet scene (H); words stay inside x 110..970 (110..890 below y 1000), above y 1490.
import React from "react";
import { life, part, pop, slap, easeOut, easeIn, easeOutBack, hash01, clamp01 } from "../../../kit/overlay/time";

export const SK = { red: "#c8281e", redDeep: "#8f1a14", redHi: "#e2463a", gold: "#f2c758", goldLo: "#c9952e", cream: "#f8efd8", creamLo: "#e4d5b0", ink: "#231c18", inkSoft: "#5a4a40" } as const;
const FF = 'FrSans, "Noto Sans SC", "Noto Sans CJK SC", sans-serif';
const Svg = (p: { children: React.ReactNode; style?: React.CSSProperties }) => (
  <svg viewBox="0 0 1080 1920" width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, overflow: "visible", ...p.style }}>{p.children}</svg>
);
type TP = { x: number; y: number; px: number; fill?: string; anchor?: "start" | "middle" | "end"; ls?: number; children: React.ReactNode; opacity?: number; stroke?: string; sw?: number; weight?: number };
const T = (p: TP) => (
  <text x={p.x} y={p.y} fontFamily={FF} fontWeight={p.weight ?? 700} fontSize={p.px} fill={p.fill ?? SK.ink} textAnchor={p.anchor ?? "start"} letterSpacing={p.ls ?? 0} opacity={p.opacity ?? 1}
    dominantBaseline="central" stroke={p.stroke} strokeWidth={p.sw} strokeLinejoin="round" paintOrder="stroke">{p.children}</text>
);
/** FOIL type: a cream edge, an ink line, gold fill with a lighter top */
const Foil = (p: { x: number; y: number; px: number; children: string; anchor?: "start" | "middle" | "end"; ls?: number; fill?: string; edge?: string }) => (
  <g>
    <T x={p.x} y={p.y + p.px * 0.05} px={p.px} anchor={p.anchor} ls={p.ls} fill={SK.ink} stroke={p.edge ?? SK.cream} sw={p.px * 0.26}>{p.children}</T>
    <T x={p.x} y={p.y} px={p.px} anchor={p.anchor} ls={p.ls} fill={p.fill ?? SK.gold} stroke={SK.ink} sw={p.px * 0.13}>{p.children}</T>
  </g>
);
/** gold flecks scattered on red paper (洒金), inside a w x h box */
const Flecks = (p: { w: number; h: number; n: number; seed: number }) => (
  <g>{Array.from({ length: p.n }, (_, i) => {
    const x = hash01(i, p.seed) * p.w, y = hash01(i, p.seed + 1) * p.h, r = 1.5 + 3.5 * hash01(i, p.seed + 2);
    return <rect key={i} x={x} y={y} width={r * 1.6} height={r} fill={SK.gold} opacity={0.35 + 0.5 * hash01(i, p.seed + 3)} transform={`rotate(${hash01(i, p.seed + 4) * 180} ${x} ${y})`} />;
  })}</g>
);
/** a sheet of red 洒金 paper with a gold inner rule, top-left at (0, 0) */
const RedPaper = (p: { w: number; h: number; seed: number; r?: number }) => (
  <g>
    <rect x={7} y={10} width={p.w} height={p.h} rx={p.r ?? 14} fill="rgba(20,6,4,0.4)" />
    <rect width={p.w} height={p.h} rx={p.r ?? 14} fill={SK.red} />
    <rect x={3} y={3} width={p.w - 6} height={p.h * 0.45} rx={p.r ?? 14} fill={SK.redHi} opacity={0.25} />
    <Flecks w={p.w} h={p.h} n={Math.round((p.w * p.h) / 5200)} seed={p.seed} />
    <rect x={12} y={12} width={p.w - 24} height={p.h - 24} rx={(p.r ?? 14) - 6} fill="none" stroke={SK.gold} strokeWidth={3} />
  </g>
);
/** a cream inner sheet with a thin red rule */
const Cream = (p: { w: number; h: number; r?: number }) => (
  <g>
    <rect x={6} y={8} width={p.w} height={p.h} rx={p.r ?? 10} fill="rgba(20,6,4,0.35)" />
    <rect width={p.w} height={p.h} rx={p.r ?? 10} fill={SK.cream} />
    <rect x={9} y={9} width={p.w - 18} height={p.h - 18} rx={(p.r ?? 10) - 4} fill="none" stroke={SK.red} strokeWidth={2.5} opacity={0.8} />
  </g>
);
/** a square seal: red field, cream characters (two columns when four characters) */
export const SealMark = (p: { text: string; size: number; col?: string; fg?: string }) => {
  const ch = [...p.text], n = ch.length, s = p.size, col = p.col ?? SK.red, fg = p.fg ?? SK.cream;
  const cols = n <= 2 ? 1 : 2, rows = Math.ceil(n / cols), cw = s / cols, rh = s / rows, px = Math.min(cw, rh) * 0.78;
  return (
    <g>
      <rect x={-s / 2} y={-s / 2} width={s} height={s} rx={s * 0.1} fill={col} />
      <rect x={-s / 2 + s * 0.06} y={-s / 2 + s * 0.06} width={s * 0.88} height={s * 0.88} rx={s * 0.06} fill="none" stroke={fg} strokeWidth={s * 0.025} />
      {ch.map((c, i) => { const cI = cols === 1 ? 0 : 1 - Math.floor(i / rows), rI = cols === 1 ? i : i % rows; return <T key={i} x={-s / 2 + cw * (cI + 0.5)} y={-s / 2 + rh * (rI + 0.5) + 1} px={px} fill={fg} anchor="middle">{c}</T>; })}
    </g>
  );
};
/** a red thread drawn as a path: `d` with `k` 0..1 of its length shown (a tug draws it on) */
const Thread = (p: { d: string; len: number; k: number; w?: number }) => (
  <g>
    <path d={p.d} fill="none" stroke={SK.redDeep} strokeWidth={(p.w ?? 9) + 4} strokeLinecap="round" strokeDasharray={`${p.len * p.k} ${p.len}`} />
    <path d={p.d} fill="none" stroke={SK.redHi} strokeWidth={p.w ?? 9} strokeLinecap="round" strokeDasharray={`${p.len * p.k} ${p.len}`} />
  </g>
);
/** a small bow knot of red thread at (0, 0) */
const Knot = (p: { s?: number }) => {
  const s = p.s ?? 1, d = `M0 0 C${-46 * s} ${-44 * s} ${-78 * s} ${6 * s} 0 0 C${46 * s} ${-44 * s} ${78 * s} ${6 * s} 0 0 M0 0 L${-22 * s} ${48 * s} M0 0 L${20 * s} ${52 * s}`;
  return <g><path d={d} fill="none" stroke={SK.redDeep} strokeWidth={13 * s} strokeLinecap="round" /><path d={d} fill="none" stroke={SK.redHi} strokeWidth={8 * s} strokeLinecap="round" /><circle r={9 * s} fill={SK.redHi} stroke={SK.redDeep} strokeWidth={3 * s} /></g>;
};
/** TUG: how a thing arrives (pulled taut: fast, one overshoot) and leaves (slackens: drops a little and fades) */
const tug = (f: number, from: number, to: number, nin = 7, nout = 6) => {
  const L = life(f, from, to, nin, nout); if (!L) return null;
  const a = easeOutBack(L.arrive, 2.2), out = easeIn(L.leave, 2);
  return { L, s: 0.6 + 0.4 * a, o: Math.min(1, L.arrive * 2) * (1 - out), dy: 26 * out, a };
};

// ------------------------------------------------------------------------------------------------------- the title
/** THE TITLE: a red thread is pulled across the frame and ties a sheet of red wedding paper to it; 月老 in foil gold,
 *  采访 / 的一天 small in cream beside it, the seal 缘 pressed on last. */
export const ThreadTitle: React.FC<{ f: number; from: number; to: number }> = ({ f, from, to }) => {
  const L = life(f, from, to, 4, 8); if (!L) return null;
  const t = L.t, out = easeIn(L.leave, 2), W = 820, H = 330, X = 130, Y = 470;
  const pull = easeOut(part(t, 0, 7), 3), paper = tug(f, from + 4, to, 7, 8), seal = slap(t, 22, 1.8);
  const sway = 6 * Math.sin(t * 0.22) * Math.exp(-t * 0.03);
  const thread = `M-40 ${Y - 60} C200 ${Y - 20 + sway} 380 ${Y - 4 - sway} 540 ${Y - 6} C700 ${Y - 4 + sway} 880 ${Y - 30 - sway} 1120 ${Y - 80}`;
  return (
    <Svg style={{ opacity: 1 - out }}>
      <g transform={`translate(0 ${-30 * out})`}>
        <Thread d={thread} len={1240} k={pull} w={10} />
        {paper && (
          <g opacity={paper.o} transform={`translate(${X + W / 2} ${Y}) rotate(${-2 + sway * 0.15}) scale(${paper.s}) translate(${-W / 2} 0)`}>
            <line x1={W * 0.2} y1={-8} x2={W * 0.2} y2={20} stroke={SK.redHi} strokeWidth={8} /><line x1={W * 0.8} y1={-10} x2={W * 0.8} y2={20} stroke={SK.redHi} strokeWidth={8} />
            <g transform="translate(0 18)">
              <RedPaper w={W} h={H} seed={7} r={18} />
              <T x={126} y={104} px={60} fill={SK.cream} anchor="middle" ls={4}>采访</T>
              <rect x={74} y={148} width={104} height={4} fill={SK.gold} />
              <Foil x={W / 2 + 6} y={H / 2 + 6} px={184} anchor="middle" ls={10} edge={SK.redDeep}>月老</Foil>
              <T x={W - 112} y={H - 84} px={54} fill={SK.cream} anchor="middle" ls={2}>的一天</T>
              {seal > 0 && <g transform={`translate(${W - 96} 92) rotate(8) scale(${seal})`}><SealMark text="缘" size={96} col={SK.gold} fg={SK.redDeep} /></g>}
            </g>
            <g transform={`translate(${W * 0.5} 6)`}><Knot s={0.9} /></g>
          </g>
        )}
      </g>
    </Svg>
  );
};

// ------------------------------------------------------------------------------------------------------- the lead card
export const CARD_STATS = ["首单记录：唐《续玄怪录》", "红线原本绑的是脚", "首位客户想刺杀未婚妻"];
/** THE LEAD'S CARD (over the frozen, washed picture; he is cut out and lifted into the moon by the picture's pass).
 *  It builds piece by piece: the moon disc and its thread ring, the seal, the name, the dateline, three stats, the
 *  day's target; things keep moving after they land. `cx, cy, r` = the moon behind his lifted portrait. */
export const LeadCard: React.FC<{ f: number; from: number; to: number; cx: number; cy: number; r: number }> = ({ f, from, to, cx, cy, r }) => {
  const L = life(f, from, to, 3, 6); if (!L) return null;
  const t = L.t, out = easeIn(L.leave, 2), o = 1 - out;
  const moon = easeOutBack(part(t, 0, 8), 1.8), ring = easeOut(part(t, 3, 14), 2), seal = slap(t, 10, 1.9);
  const panel = easeOutBack(part(t, 14, 8), 1.6), name = pop(t, 20, 7), date = part(t, 27, 5);
  const PX = 110, PY = 1010, PW = 780, PH = 462, C = 2 * Math.PI * (r + 26);
  const spin = t * 0.6;
  return (
    <>
      <Svg style={{ opacity: o }}>
        {seal > 0 && <g transform={`translate(880 480) rotate(${7 + 1.5 * Math.sin(t * 0.3)}) scale(${seal})`}><SealMark text="姻缘司长" size={150} /></g>}
        <g opacity={clamp01(panel * 1.5)} transform={`translate(${PX} ${PY + (1 - panel) * 120})`}>
          <Cream w={PW} h={PH} r={16} />
          <g transform={`translate(${PW - 70} 0)`}><Knot s={0.55} /></g>
          <g opacity={name.o} transform={`translate(150 96) scale(${name.s})`}><Foil x={0} y={0} px={124} anchor="middle" ls={6} fill={SK.red} edge={SK.cream}>月老</Foil></g>
          <g opacity={date}>
            <T x={300} y={74} px={34} fill={SK.inkSoft}>天庭 · 姻缘司</T>
            <T x={300} y={122} px={34} fill={SK.inkSoft}>工龄：约 1200 年</T>
          </g>
          <rect x={36} y={172} width={(PW - 72) * easeOut(part(t, 30, 8))} height={3} fill={SK.red} opacity={0.7} />
          {CARD_STATS.map((s, i) => {
            const at = 34 + i * 11, k = pop(t, at, 6, 2.2, 0.5), y = 218 + i * 62, wig = 2 * Math.sin((t - at) * 0.35 + i);
            return k.o > 0 ? (
              <g key={i} opacity={k.o} transform={`translate(${40 + (1 - k.k) * -40} ${y})`}>
                <g transform={`rotate(${wig})`}><circle cx={22} cy={0} r={21} fill={SK.red} /><T x={22} y={1} px={28} fill={SK.cream} anchor="middle">{String(i + 1)}</T></g>
                <T x={62} y={1} px={40} fill={SK.ink}>{s}</T>
              </g>
            ) : null;
          })}
          {(() => {
            const k = pop(t, 68, 6, 2.4, 0.5), tick = 0.5 + 0.5 * Math.sin((t - 68) * 0.5);
            return k.o > 0 ? (
              <g opacity={k.o} transform={`translate(${PW / 2} 414) scale(${k.s})`}>
                <rect x={-340} y={-30} width={680} height={60} rx={30} fill={SK.red} />
                <T x={-300} y={1} px={36} fill={SK.cream}>今日目标：绑成 1 对</T>
                <g transform={`translate(262 0) scale(${1 + 0.08 * tick})`}><T x={0} y={1} px={40} fill={SK.gold} anchor="middle">0 / 1</T></g>
              </g>
            ) : null;
          })()}
        </g>
      </Svg>
    </>
  );
};

// ------------------------------------------------------------------------------------------------------- the meter
/** THE YEAR'S TARGET: a small red tag under her REC row that runs through the film. left = couples still missing
 *  (1, then 0); `bump` = a frame on which it shakes (each failure); done = the frame it turns to 达标. */
export const Meter: React.FC<{ f: number; from: number; to: number; bumps: number[]; done?: number }> = ({ f, from, to, bumps, done }) => {
  const A = tug(f, from, to, 8, 8); if (!A) return null;
  const isDone = done !== undefined && f >= done, d = isDone ? f - done! : -1;
  let sh = 0; for (const b of bumps) if (f >= b && f < b + 12) sh = Math.sin((f - b) * 2.4) * 9 * (1 - (f - b) / 12);
  const s = isDone && d < 5 ? [1.5, 1.25, 0.95, 1.05, 1][d] : 1;
  return (
    <Svg>
      <g opacity={A.o} transform={`translate(${312 + sh} ${396 - (1 - A.a) * 30 + A.dy}) scale(${s})`}>
        <line x1={-150} y1={-56} x2={-150} y2={-30} stroke={SK.redHi} strokeWidth={6} />
        <rect x={-196} y={-26} width={400} height={66} rx={12} fill="rgba(20,6,4,0.35)" transform="translate(4 6)" />
        <rect x={-200} y={-30} width={400} height={66} rx={12} fill={isDone ? SK.gold : SK.red} stroke={isDone ? SK.redDeep : SK.gold} strokeWidth={3} />
        <T x={-178} y={4} px={32} fill={isDone ? SK.redDeep : SK.cream}>年度指标</T>
        {isDone ? <T x={188} y={4} px={38} fill={SK.redDeep} anchor="end">达标！</T>
          : <><T x={84} y={4} px={32} fill={SK.cream} anchor="end">还差</T><T x={112} y={4} px={46} fill={SK.gold} anchor="middle">1</T><T x={188} y={4} px={32} fill={SK.cream} anchor="end">对</T></>}
      </g>
    </Svg>
  );
};

// ------------------------------------------------------------------------------------------------------- effects
/** 花字: a punch word in foil type, tugged on at (x, y) (its centre), tilted a little */
export const Hua: React.FC<{ f: number; from: number; to: number; text: string; x: number; y: number; px?: number; rot?: number; col?: string }> = ({ f, from, to, text, x, y, px = 96, rot = -5, col }) => {
  const A = tug(f, from, to, 6, 5); if (!A) return null;
  const wob = 1.5 * Math.sin((f - from) * 0.4);
  return <Svg><g opacity={A.o} transform={`translate(${x} ${y + A.dy}) rotate(${rot + wob}) scale(${A.s})`}><Foil x={0} y={0} px={px} anchor="middle" ls={4} fill={col}>{text}</Foil></g></Svg>;
};
/** THE STAMP of the running gag: 缘分未到 slammed on in red like a clerk's rubber stamp (ok = 缘分已到, in gold on red) */
export const FateStamp: React.FC<{ f: number; from: number; to: number; x: number; y: number; ok?: boolean; rot?: number; px?: number }> = ({ f, from, to, x, y, ok, rot = -9, px = 104 }) => {
  const L = life(f, from, to, 1, 6); if (!L) return null;
  const s = slap(L.t, 0, 2.1), text = ok ? "缘分已到" : "缘分未到", w = px * 4 + 90, h = px * 1.5, out = easeIn(L.leave, 2);
  const jit = L.t < 5 ? (hash01(L.t, 3) - 0.5) * 10 * (1 - L.t / 5) : 0;
  return (
    <Svg>
      <g opacity={(L.t < 1 ? 0.8 : 0.94) * (1 - out)} transform={`translate(${x + jit} ${y}) rotate(${rot}) scale(${s})`}>
        <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={14} fill={ok ? SK.red : "rgba(248,239,216,0.9)"} stroke={ok ? SK.gold : SK.red} strokeWidth={px * 0.1} />
        <rect x={-w / 2 + 14} y={-h / 2 + 14} width={w - 28} height={h - 28} rx={8} fill="none" stroke={ok ? SK.gold : SK.red} strokeWidth={3} />
        <T x={0} y={3} px={px} fill={ok ? SK.gold : SK.red} anchor="middle" ls={8}>{text}</T>
      </g>
    </Svg>
  );
};
/** a truth seal (真事 / 传说 / 演绎): a small round red seal pressed on at (x, y) */
export const Truth: React.FC<{ f: number; from: number; to: number; x: number; y: number; kind: "真事" | "传说" | "演绎" }> = ({ f, from, to, x, y, kind }) => {
  const L = life(f, from, to, 1, 5); if (!L) return null;
  const s = slap(L.t, 0, 1.8);
  return (
    <Svg><g opacity={0.95 * (1 - easeIn(L.leave, 2))} transform={`translate(${x} ${y}) rotate(-12) scale(${s})`}>
      <circle r={58} fill={SK.cream} opacity={0.92} /><circle r={58} fill="none" stroke={SK.red} strokeWidth={7} /><circle r={46} fill="none" stroke={SK.red} strokeWidth={2.5} />
      <T x={0} y={2} px={44} fill={SK.red} anchor="middle" ls={2}>{kind}</T>
    </g></Svg>
  );
};
/** A FACT CARD: a cream slip tied on with thread, rows of ink type, an optional source line; centred on x 540 */
export const factSize = (rows: string[], src?: string, px = 40) => ({ w: Math.min(780, Math.max(...rows.map((r) => [...r].length)) * px * 1.02 + 90), h: rows.length * (px + 16) + (src ? 44 : 0) + 34 });
export const Fact: React.FC<{ f: number; from: number; to: number; y: number; rows: string[]; src?: string; px?: number; seal?: "真事" | "传说" | "演绎" }> = ({ f, from, to, y, rows, src, px = 40, seal }) => {
  const A = tug(f, from, to, 7, 6); if (!A) return null;
  const { w, h } = factSize(rows, src, px), st = seal ? slap(f - from, 9, 1.8) : 0;
  return (
    <Svg>
      <g opacity={A.o} transform={`translate(${540 - w / 2} ${y + A.dy + (1 - A.a) * -24})`}>
        <Cream w={w} h={h} />
        <g transform={`translate(${w - 44} 0)`}><Knot s={0.42} /></g>
        {rows.map((r, i) => <T key={i} x={w / 2} y={36 + i * (px + 16)} px={px} anchor="middle">{r}</T>)}
        {src && <T x={w / 2} y={h - 30} px={26} fill={SK.inkSoft} anchor="middle">{src}</T>}
        {seal && st > 0 && (
          <g transform={`translate(26 ${h - 22}) rotate(-12) scale(${st * 0.62})`} opacity={0.95}>
            <circle r={58} fill={SK.cream} /><circle r={58} fill="none" stroke={SK.red} strokeWidth={7} /><circle r={46} fill="none" stroke={SK.red} strokeWidth={2.5} />
            <T x={0} y={2} px={44} fill={SK.red} anchor="middle" ls={2}>{seal}</T>
          </g>
        )}
      </g>
    </Svg>
  );
};
/** A SIDE CHARACTER'S CARD: a small tag that travels with the person for a few seconds: a red tab with the name in
 *  cream, a cream slip with one line about them, tied on with a short thread toward the person (tx, ty = the point on
 *  the person the thread runs to). Top-left at (x, y); SIDE_W x SIDE_H; s = its scale. */
export const SIDE_W = 430, SIDE_H = 150;
export const SideCard: React.FC<{ f: number; from: number; to: number; x: number; y: number; s?: number; name: string; note: string; tx: number; ty: number }> = ({ f, from, to, x, y, s = 1, name, note, tx, ty }) => {
  const A = tug(f, from, to, 6, 6); if (!A) return null;
  const t = f - from, row = part(t, 7, 6), cx = x + (SIDE_W * s) / 2, cy = y + (SIDE_H * s) / 2;
  const ax = Math.max(x, Math.min(x + SIDE_W * s, tx)), ay = Math.max(y, Math.min(y + SIDE_H * s, ty)), k = easeOut(part(t, 3, 7), 2);
  // the note always fits its row: a long one is set smaller (never under 26 px)
  const noteEm = [...note].reduce((a, c) => a + (c.charCodeAt(0) < 0x2e80 ? (c === " " ? 0.3 : 0.58) : 1), 0), notePx = Math.max(26, Math.min(32, Math.floor((SIDE_W - 60) / noteEm)));
  return (
    <Svg>
      <g opacity={A.o}>
        <path d={`M${ax} ${ay} Q${(ax + tx) / 2} ${(ay + ty) / 2 + 26} ${ax + (tx - ax) * k} ${ay + (ty - ay) * k}`} fill="none" stroke={SK.redDeep} strokeWidth={9} strokeLinecap="round" />
        <path d={`M${ax} ${ay} Q${(ax + tx) / 2} ${(ay + ty) / 2 + 26} ${ax + (tx - ax) * k} ${ay + (ty - ay) * k}`} fill="none" stroke={SK.redHi} strokeWidth={5} strokeLinecap="round" />
        <g transform={`translate(${cx} ${cy + A.dy}) scale(${A.s * s}) translate(${-SIDE_W / 2} ${-SIDE_H / 2})`}>
          <Cream w={SIDE_W} h={SIDE_H} r={14} />
          <rect x={10} y={10} width={SIDE_W - 20} height={74} rx={10} fill={SK.red} />
          <T x={30} y={48} px={56} fill={SK.cream} ls={6}>{name}</T>
          <g transform={`translate(${SIDE_W - 64} 47) rotate(8)`}><SealMark text="凡人" size={58} col={SK.gold} fg={SK.redDeep} /></g>
          <T x={30} y={116} px={notePx} fill={SK.ink} opacity={row}>{note}</T>
        </g>
      </g>
    </Svg>
  );
};
/** 记者OS: what she thinks and does not say: a small cream tag with a red tab, top-left at (x, y) */
export const OS: React.FC<{ f: number; from: number; to: number; x: number; y: number; text: string }> = ({ f, from, to, x, y, text }) => {
  const A = tug(f, from, to, 6, 5); if (!A) return null;
  const w = [...text].length * 38 + 150;
  return (
    <Svg>
      <g opacity={A.o} transform={`translate(${x} ${y + A.dy}) scale(${A.s})`}>
        <rect x={5} y={7} width={w} height={64} rx={32} fill="rgba(20,6,4,0.35)" /><rect width={w} height={64} rx={32} fill={SK.cream} stroke={SK.red} strokeWidth={3} />
        <rect x={8} y={8} width={104} height={48} rx={24} fill={SK.red} /><T x={60} y={33} px={26} fill={SK.cream} anchor="middle">记者OS</T>
        <T x={126} y={33} px={36}>{text}</T>
      </g>
    </Svg>
  );
};

// ------------------------------------------------------------------------------------------------------- the case files
export type CaseKind = "niulang" | "liangzhu" | "baishe" | "baodai" | "qixian";
const CASES: Record<CaseKind, { name: string; no: string; verdict: string; note: string }> = {
  niulang: { name: "牛郎 × 织女", no: "卷宗 · 天字第一号", verdict: "异地", note: "每年七夕见一面" },
  liangzhu: { name: "梁山伯 × 祝英台", no: "卷宗 · 东晋", verdict: "化蝶", note: "双双变了蝴蝶" },
  baishe: { name: "许仙 × 白娘子", no: "卷宗 · 西湖", verdict: "跨物种", note: "审批：一千年" },
  baodai: { name: "贾宝玉 × 林黛玉", no: "卷宗 · 大观园", verdict: "绑错", note: "实际绑成：薛宝钗" },
  qixian: { name: "董永 × 七仙女", no: "卷宗 · 天庭", verdict: "领导闺女", note: "扣仙丹：三百年" },
};
/** the little picture on each file, in a 200 x 150 box centred on (0, 0) */
const CasePic = ({ kind, t }: { kind: CaseKind; t: number }) => {
  const b = Math.sin(t * 0.25);
  if (kind === "niulang") return (
    <g>
      <path d="M-100 40 C-50 -40 50 -40 100 40" fill="none" stroke={SK.ink} strokeWidth={6} />
      {[-70, -35, 0, 35, 70].map((x, i) => <g key={i} transform={`translate(${x} ${-0.008 * x * x + 2 + 2 * Math.sin(t * 0.3 + i)})`}><path d="M-12 0 L0 -7 L12 0 L0 4 Z" fill={SK.ink} /></g>)}
      {[[-78, -52], [60, -58], [-20, -66], [88, -30], [-96, -24]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={4 + (i % 2)} fill={SK.gold} stroke={SK.goldLo} strokeWidth={1.5} opacity={0.7 + 0.3 * Math.sin(t * 0.4 + i)} />)}
      <circle cx={-92} cy={34} r={11} fill={SK.cream} stroke={SK.ink} strokeWidth={4} /><circle cx={92} cy={34} r={11} fill={SK.cream} stroke={SK.ink} strokeWidth={4} />
    </g>
  );
  if (kind === "liangzhu") return (
    <g>{[[-42, 0, -14, SK.redHi], [42, -8, 14, SK.gold]].map(([x, y, r, c], i) => (
      <g key={i} transform={`translate(${x} ${(y as number) + 5 * Math.sin(t * 0.3 + i * 2)}) rotate(${r})`}>
        <g transform={`scale(${0.75 + 0.25 * Math.abs(Math.sin(t * 0.5 + i))} 1)`}>
          <path d="M0 0 C-50 -56 -74 -6 0 6 C-56 16 -40 60 0 10" fill={c as string} stroke={SK.ink} strokeWidth={5} strokeLinejoin="round" />
          <path d="M0 0 C50 -56 74 -6 0 6 C56 16 40 60 0 10" fill={c as string} stroke={SK.ink} strokeWidth={5} strokeLinejoin="round" />
        </g>
        <path d="M0 -8 L0 26" stroke={SK.ink} strokeWidth={7} strokeLinecap="round" />
      </g>
    ))}</g>
  );
  if (kind === "baishe") return (
    <g>
      <path d={`M-90 40 C-60 ${-10 + 6 * b} -40 ${60 - 6 * b} -10 20 C10 ${-10 + 6 * b} 30 ${30 - 6 * b} 46 -8 C54 -30 40 -46 26 -40`} fill="none" stroke={SK.ink} strokeWidth={22} strokeLinecap="round" />
      <path d={`M-90 40 C-60 ${-10 + 6 * b} -40 ${60 - 6 * b} -10 20 C10 ${-10 + 6 * b} 30 ${30 - 6 * b} 46 -8 C54 -30 40 -46 26 -40`} fill="none" stroke="#fdfaf2" strokeWidth={13} strokeLinecap="round" />
      <circle cx={30} cy={-42} r={3.5} fill={SK.ink} /><path d="M14 -40 L0 -46 M14 -40 L2 -34" stroke={SK.red} strokeWidth={3} />
      <g transform="translate(78 -4) rotate(14)"><path d="M-44 0 C-30 -44 30 -44 44 0 Z" fill={SK.redHi} stroke={SK.ink} strokeWidth={5} strokeLinejoin="round" /><path d="M0 0 L0 54 C0 64 -12 64 -12 54" fill="none" stroke={SK.ink} strokeWidth={5} strokeLinecap="round" /></g>
    </g>
  );
  if (kind === "baodai") return (
    <g>
      <g transform="translate(-58 6)"><ellipse rx={36} ry={44} fill="#9fd0b4" stroke={SK.ink} strokeWidth={5} /><T x={0} y={2} px={38} anchor="middle">玉</T><path d="M0 -44 C0 -64 14 -64 14 -74" fill="none" stroke={SK.red} strokeWidth={5} /></g>
      <g transform={`translate(52 4) rotate(${4 * b})`}>{[0, 72, 144, 216, 288].map((a) => <ellipse key={a} rx={15} ry={27} cy={-26} fill="#f6b8c2" stroke={SK.ink} strokeWidth={4} transform={`rotate(${a})`} />)}<circle r={11} fill={SK.gold} stroke={SK.ink} strokeWidth={4} /></g>
      <path d="M-18 6 L8 6" stroke={SK.red} strokeWidth={6} strokeDasharray="7 7" />
    </g>
  );
  return (
    <g>
      {[[-58, 30, 1], [10, 44, 1.2], [70, 26, 0.9]].map(([x, y, s], i) => <g key={i} transform={`translate(${(x as number) + 4 * Math.sin(t * 0.2 + i)} ${y}) scale(${s})`}><path d="M-40 10 C-50 -10 -20 -22 -10 -8 C0 -30 34 -22 30 -2 C52 -2 50 22 30 20 L-30 20 C-46 22 -50 12 -40 10 Z" fill="#fdfaf2" stroke={SK.ink} strokeWidth={5} strokeLinejoin="round" /></g>)}
      <g transform={`translate(4 ${-30 + 4 * b})`}><path d="M-34 6 L-22 -26 L-8 -6 L0 -32 L8 -6 L22 -26 L34 6 Z" fill={SK.gold} stroke={SK.ink} strokeWidth={5} strokeLinejoin="round" /><circle cx={0} cy={-34} r={5} fill={SK.red} /></g>
    </g>
  );
};
/** A CASE FILE pulled from the cabinet: a cream folder tied with red thread: its number, the couple's names, a little
 *  picture, a note typed on, and the verdict stamped across it `stampAt` frames in. Centre at (x, y), about 560 x 420. */
export const CASE_W = 580, CASE_H = 400;
export const CaseFile: React.FC<{ f: number; from: number; to: number; x: number; y: number; kind: CaseKind; stampAt: number; rot?: number; s?: number; seal?: boolean }> = ({ f, from, to, x, y, kind, stampAt, rot = -3, s = 1, seal }) => {
  const A0 = tug(f, from, to, 6, 5); if (!A0) return null;
  const A = { ...A0, s: A0.s * s };
  const c = CASES[kind], t = f - from, W = 580, H = 400, st = slap(t, stampAt, 2.0), note = part(t, 8, 6);
  return (
    <Svg>
      <g opacity={A.o} transform={`translate(${x} ${y + A.dy + (1 - A.a) * 60}) rotate(${rot}) scale(${A.s}) translate(${-W / 2} ${-H / 2})`}>
        <path d={`M0 30 L0 ${H} L${W} ${H} L${W} 30 L${W * 0.44} 30 L${W * 0.4} 0 L20 0 Z`} fill="rgba(20,6,4,0.35)" transform="translate(7 9)" />
        <path d={`M0 30 L0 ${H} L${W} ${H} L${W} 30 L${W * 0.44} 30 L${W * 0.4} 0 L20 0 Z`} fill={SK.creamLo} stroke={SK.ink} strokeWidth={4} strokeLinejoin="round" />
        <rect x={18} y={50} width={W - 36} height={H - 70} fill={SK.cream} />
        <T x={30} y={17} px={24} fill={SK.inkSoft}>{c.no}</T>
        <T x={W / 2} y={104} px={[...c.name].length > 8 ? 54 : 62} anchor="middle" ls={2}>{c.name}</T>
        <rect x={60} y={146} width={W - 120} height={3} fill={SK.red} opacity={0.7} />
        <g transform={`translate(${W / 2} 246)`}><CasePic kind={kind} t={t} /></g>
        <T x={W / 2} y={H - 42} px={36} fill={SK.inkSoft} anchor="middle" opacity={note}>{c.note}</T>
        <path d={`M0 ${H * 0.56} L${W} ${H * 0.56}`} stroke={SK.redHi} strokeWidth={5} opacity={0.0} />
        {st > 0 && (
          <g transform={`translate(${W - 150} 196) rotate(-16) scale(${st})`} opacity={0.93}>
            <rect x={-[...c.verdict].length * 37 - 22} y={-52} width={[...c.verdict].length * 74 + 44} height={104} rx={12} fill="rgba(248,239,216,0.85)" stroke={SK.red} strokeWidth={9} />
            <T x={0} y={3} px={70} fill={SK.red} anchor="middle" ls={4}>{c.verdict}</T>
          </g>
        )}
        <g transform={`translate(${W * 0.2} 0)`}><Knot s={0.45} /></g>
        {seal && slap(t, 12, 1.8) > 0 && (
          <g transform={`translate(${W - 58} ${H - 52}) rotate(-12) scale(${slap(t, 12, 1.8) * 0.66})`} opacity={0.95}>
            <circle r={58} fill={SK.cream} /><circle r={58} fill="none" stroke={SK.red} strokeWidth={7} /><circle r={46} fill="none" stroke={SK.red} strokeWidth={2.5} />
            <T x={0} y={2} px={44} fill={SK.red} anchor="middle" ls={2}>传说</T>
          </g>
        )}
      </g>
    </Svg>
  );
};
/** the note under the case files: all five are this film's invention */
export const Disclaimer: React.FC<{ f: number; from: number; to: number; y: number; text: string; x?: number }> = ({ f, from, to, y, text, x = 540 }) => {
  const L = life(f, from, to, 6, 6); if (!L) return null;
  return <Svg><g opacity={L.k}><T x={x} y={y} px={30} fill={SK.cream} anchor="middle" stroke="rgba(20,6,4,0.75)" sw={8}>{text}</T></g></Svg>;
};
/** THE ORDER SLIP (scene D): the prayer arrives as a red order slip: 加急 · the temple, her name, the mother's demands ticking in */
export const OrderSlip: React.FC<{ f: number; from: number; to: number; x: number; y: number; s?: number }> = ({ f, from, to, x, y, s = 1 }) => {
  const A = tug(f, from, to, 7, 6); if (!A) return null;
  const t = f - from, W = 520, H = 470, rows = ["姓名：林小满（女，30）", "职业：程序员（天天加班）", "要求：有房、有车、一米八", "备注：今年必须成！！"];
  return (
    <Svg>
      <g opacity={A.o} transform={`translate(${x} ${y + A.dy}) rotate(3) scale(${A.s * s}) translate(${-W / 2} ${-H / 2})`}>
        <RedPaper w={W} h={H} seed={21} />
        <T x={40} y={62} px={46} fill={SK.gold} ls={3}>月老庙 · 求姻缘</T>
        <g transform={`translate(${W - 78} 62) rotate(14) scale(${slap(t, 9, 1.9) || 0.001})`}><SealMark text="加急" size={84} col={SK.gold} fg={SK.redDeep} /></g>
        <rect x={34} y={104} width={W - 68} height={H - 138} rx={8} fill={SK.cream} />
        {rows.map((r, i) => { const k = part(t, 12 + i * 9, 5); return <T key={i} x={56} y={154 + i * 76} px={i === 3 ? 40 : 34} fill={i === 3 ? SK.red : SK.ink} opacity={k}>{r}</T>; })}
      </g>
    </Svg>
  );
};
/** a snapped-thread counter (scene E): 已断 n 根, the number popping at each snap frame */
export const Snaps: React.FC<{ f: number; from: number; to: number; x: number; y: number; hits: number[] }> = ({ f, from, to, x, y, hits }) => {
  const A = tug(f, from, to, 6, 5); if (!A) return null;
  const n = hits.filter((h) => f >= h).length, last = Math.max(...hits.filter((h) => f >= h), -99), s = f - last < 5 ? [1.6, 1.3, 0.95, 1.05, 1][f - last] : 1;
  return (
    <Svg><g opacity={A.o} transform={`translate(${x} ${y + A.dy}) rotate(-4) scale(${A.s})`}>
      <Foil x={-70} y={0} px={64} anchor="middle" fill={SK.cream}>已断</Foil>
      <g transform={`translate(50 0) scale(${s})`}><Foil x={0} y={0} px={108} anchor="middle" fill={SK.redHi}>{String(n)}</Foil></g>
      <Foil x={140} y={0} px={64} anchor="middle" fill={SK.cream}>根</Foil>
    </g></Svg>
  );
};
/** the last card after her camera is off: a line of cream type on black */
export const EndLine: React.FC<{ f: number; from: number; to: number; rows: string[] }> = ({ f, from, to, rows }) => {
  const L = life(f, from, to, 10, 1); if (!L) return null;
  return <Svg><g opacity={L.arrive}>{rows.map((r, i) => <T key={i} x={540} y={900 + i * 64} px={i === 0 ? 40 : 30} fill={i === 0 ? SK.cream : "#b9ad98"} anchor="middle">{r}</T>)}</g></Svg>;
};

/** THE SPOOL OVER THE LENS (the join of scenes D and E): he pushes the spool of red thread right into her lens: the
 *  wound thread fills the frame (k 0..1), turn by turn, then the dark of its core. Drawn over the picture. */
export const SpoolLens: React.FC<{ k: number }> = ({ k }) => {
  if (k <= 0.001) return null;
  const e = Math.min(1, k), R = 180 + 1900 * e * e, cx = 540, cy = 1000, n = 26;
  return (
    <Svg>
      <g opacity={Math.min(1, e * 2.5)}>
        <circle cx={cx} cy={cy} r={R} fill="#b3261c" />
        {Array.from({ length: n }, (_, i) => <circle key={i} cx={cx} cy={cy} r={R * (0.14 + (0.86 * i) / n)} fill="none" stroke={i % 2 ? "#8f1a12" : "#d8362a"} strokeWidth={Math.max(3, R * 0.012)} opacity={0.75} />)}
        <circle cx={cx} cy={cy} r={R * 0.13} fill="#2a1410" />
        <circle cx={cx} cy={cy} r={R} fill="none" stroke="#c9a063" strokeWidth={Math.max(10, R * 0.05)} />
      </g>
      {e > 0.9 ? <rect x={0} y={0} width={1080} height={1920} fill="#8f1a12" opacity={(e - 0.9) * 10} /> : null}
    </Svg>
  );
};
