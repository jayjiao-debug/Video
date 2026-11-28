// THE SKIN of 采访月老的一天 (v6, 28 Nov 2026, after the owner's notes 5, 6, 12, 13 on v5: no freeze card, every pop-up
// from the story's own world, professional spacing and type). WHERE IT COMES FROM: 月老 thinks the reporter is heaven's
// inspector writing his year-end review, so everything laid over the picture is HIS OWN PAPERWORK AND TEMPLE THINGS:
// the title is a temple plaque (匾额), names hang on jade tokens (腰牌) and paper case slips, facts are small hanging
// scrolls from his ledger, the quota is an incense meter (the burning stick is also the clock to 子时), the running gag
// is a vermilion seal (缘分未到 / 缘分已到), asides are red-ink 朱批, the mother's prayer is a wooden wish plaque.
// FOUR COLOURS: 朱红 (his robe and every thread), old gold leaf, xuan-paper cream, ink; the plaque's ground is black-green
// lacquer and his token is pale jade. MATERIAL: paper with fibres and a torn (deckled) edge, carved lacquer, jade, seal
// ink that does not take everywhere. TYPE: a brush face (YL Brush) for titles, names, stamps and red ink; a Song face
// (YL Song) for anything read as text; both fall back to FrSans until hud/fonts.ts finds them. Sizes on one grid:
// titles 48 and up, reading text 34 to 40, sources 26; 32 to 40 px of paper round every block.
// ONE WAY OF MOVING: things HANG. They come down on a red cord and swing to rest (a damped pendulum), and leave pulled up
// on it; scrolls unroll from their rod; seals are slammed; red ink is written on.
// Rules kept: pure functions of the frame; DOM / SVG in film px (1080 wide); ids start yl6-; nothing over a face (the
// shots place things); no effect in the quiet scene (H); words inside x 110..970 (110..890 below y 1000), above y 1490.
import React from "react";
import { life, part, pop, slap, easeOut, easeIn, easeOutBack, hash01, clamp01 } from "../../../kit/overlay/time";

export const SK = {
  red: "#c8332b", redDeep: "#8e2320", redHi: "#e0584a", redInk: "#b8281f",
  gold: "#d9a640", goldHi: "#f2d488", goldLo: "#9c7024",
  paper: "#f1e6cc", paperLo: "#e0d0ad", cream: "#f8efd8", creamLo: "#e4d5b0",
  ink: "#2a211c", inkSoft: "#5e4f44",
  lacquer: "#1c2a2b", lacquerHi: "#2d4342",
  jade: "#c4e3cf", jadeLo: "#8fc2a5", jadeDeep: "#3f7a5f", carve: "#7a2418",
  wood: "#dcb27c", woodLo: "#b58450", woodDeep: "#6e4a26",
} as const;
export const BRUSH = '"YL Brush", FrSans, "Noto Sans SC", "Noto Sans CJK SC", sans-serif';
export const SONG = '"YL Song", FrSans, "Noto Serif SC", "Noto Sans SC", serif';

const Svg = (p: { children: React.ReactNode; style?: React.CSSProperties }) => (
  <svg viewBox="0 0 1080 1920" width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, overflow: "visible", ...p.style }}>{p.children}</svg>
);
type TP = { x: number; y: number; px: number; fill?: string; anchor?: "start" | "middle" | "end"; ls?: number; children: React.ReactNode; opacity?: number; stroke?: string; sw?: number; weight?: number; ff?: string };
const T = (p: TP) => (
  <text x={p.x} y={p.y} fontFamily={p.ff ?? SONG} fontWeight={p.weight ?? 700} fontSize={p.px} fill={p.fill ?? SK.ink} textAnchor={p.anchor ?? "start"} letterSpacing={p.ls ?? 0} opacity={p.opacity ?? 1}
    dominantBaseline="central" stroke={p.stroke} strokeWidth={p.sw} strokeLinejoin="round" paintOrder="stroke">{p.children}</text>
);
/** a column of characters (vertical writing), the first centred on (x, y) */
const Col = (p: { x: number; y: number; px: number; text: string; fill?: string; ff?: string; gap?: number; stroke?: string; sw?: number }) => (
  <g>{[...p.text].map((c, i) => <T key={i} x={p.x} y={p.y + i * p.px * (p.gap ?? 1.08)} px={p.px} anchor="middle" fill={p.fill} ff={p.ff ?? BRUSH} weight={400} stroke={p.stroke} sw={p.sw}>{c}</T>)}</g>
);
/** RICH TEXT: 【…】 is set in red and a little bigger (the number that matters on a card) */
const Rich = (p: { x: number; y: number; px: number; text: string; anchor?: "start" | "middle" | "end"; fill?: string; hi?: string }) => {
  const parts = p.text.split(/(【[^】]*】)/).filter(Boolean);
  return (
    <text x={p.x} y={p.y} fontFamily={SONG} fontWeight={700} fontSize={p.px} fill={p.fill ?? SK.ink} textAnchor={p.anchor ?? "start"} dominantBaseline="central">
      {parts.map((s, i) => s.startsWith("【") ? <tspan key={i} fill={p.hi ?? SK.redInk} fontSize={p.px * 1.12}>{s.slice(1, -1)}</tspan> : <tspan key={i}>{s}</tspan>)}
    </text>
  );
};
/** a line's width in em: CJK 1, Latin / digits / spaces about 0.56, 【】 marks none (their text 1.12) */
const emOf = (s: string) => { let w = 0, hi = false; for (const c of s) { if (c === "【") { hi = true; continue; } if (c === "】") { hi = false; continue; } w += (c.charCodeAt(0) < 0x2e80 ? (c === " " ? 0.3 : 0.56) : 1) * (hi ? 1.12 : 1); } return w; };

// ------------------------------------------------------------------------------------------------- materials
/** a torn paper edge round a w x h sheet: points every ~22 px pushed in or out by up to `amp` px */
const deckle = (w: number, h: number, seed: number, amp = 2.4, step = 22) => {
  const pts: string[] = [];
  const edge = (x0: number, y0: number, x1: number, y1: number, k: number) => {
    const L = Math.hypot(x1 - x0, y1 - y0), n = Math.max(2, Math.round(L / step)), nx = (y1 - y0) / L, ny = -(x1 - x0) / L;
    for (let i = 0; i < n; i++) { const u = i / n, d = (hash01(i + k * 131, seed) - 0.5) * 2 * amp * (i === 0 ? 0.3 : 1); pts.push(`${(x0 + (x1 - x0) * u + nx * d).toFixed(1)} ${(y0 + (y1 - y0) * u + ny * d).toFixed(1)}`); }
  };
  edge(0, 0, w, 0, 1); edge(w, 0, w, h, 2); edge(w, h, 0, h, 3); edge(0, h, 0, 0, 4);
  return `M${pts.join(" L")} Z`;
};
/** the shared filters and patterns of one overlay, ids made unique with `id` */
const Defs = ({ id, seed = 1 }: { id: string; seed?: number }) => (
  <defs>
    <filter id={`yl6-soft-${id}`} x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="5" /></filter>
    <pattern id={`yl6-fibre-${id}`} width={180} height={180} patternUnits="userSpaceOnUse">
      {Array.from({ length: 30 }, (_, i) => {
        const x = hash01(i, seed) * 180, y = hash01(i, seed + 1) * 180, a = hash01(i, seed + 2) * Math.PI, l = 8 + 26 * hash01(i, seed + 3), c = Math.cos(a) * l, s = Math.sin(a) * l;
        return <path key={i} d={`M${x.toFixed(1)} ${y.toFixed(1)} q${(c * 0.5 + 4).toFixed(1)} ${(s * 0.5 - 3).toFixed(1)} ${c.toFixed(1)} ${s.toFixed(1)}`} stroke={SK.inkSoft} strokeWidth={0.9} fill="none" opacity={0.08 + 0.08 * hash01(i, seed + 4)} />;
      })}
      {Array.from({ length: 14 }, (_, i) => <circle key={`d${i}`} cx={hash01(i, seed + 7) * 180} cy={hash01(i, seed + 8) * 180} r={0.6 + 1.2 * hash01(i, seed + 9)} fill={SK.goldLo} opacity={0.12} />)}
    </pattern>
    <linearGradient id={`yl6-lac-${id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={SK.lacquerHi} /><stop offset="0.55" stopColor={SK.lacquer} /><stop offset="1" stopColor="#121b1c" /></linearGradient>
    <linearGradient id={`yl6-goldf-${id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={SK.goldHi} /><stop offset="0.5" stopColor={SK.gold} /><stop offset="1" stopColor={SK.goldLo} /></linearGradient>
    <linearGradient id={`yl6-jade-${id}`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#e3f3e8" /><stop offset="0.45" stopColor={SK.jade} /><stop offset="1" stopColor={SK.jadeLo} /></linearGradient>
    <linearGradient id={`yl6-wood-${id}`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor={SK.woodLo} /><stop offset="0.2" stopColor={SK.wood} /><stop offset="0.8" stopColor={SK.wood} /><stop offset="1" stopColor={SK.woodLo} /></linearGradient>
  </defs>
);
/** A SHEET OF XUAN PAPER, top-left at (0, 0): a soft shadow, a torn edge, cream with fibres and gold flecks */
const Paper = ({ id, w, h, seed = 3, tone = SK.paper }: { id: string; w: number; h: number; seed?: number; tone?: string }) => {
  const d = deckle(w, h, seed);
  return (
    <g>
      <path d={d} fill="rgba(34,16,8,0.32)" transform="translate(5 9)" filter={`url(#yl6-soft-${id})`} />
      <path d={d} fill={tone} />
      <path d={d} fill={`url(#yl6-fibre-${id})`} />
      <path d={d} fill="none" stroke={SK.paperLo} strokeWidth={1.4} />
    </g>
  );
};
/** A RED CORD (the film's thread as a drawn thing): an ink outline, the red, and a lighter twist every few px */
export const Cord = ({ d, w = 8, opacity = 1 }: { d: string; w?: number; opacity?: number }) => (
  <g opacity={opacity}>
    <path d={d} fill="none" stroke={SK.ink} strokeWidth={w + 3.5} strokeLinecap="round" strokeLinejoin="round" />
    <path d={d} fill="none" stroke={SK.red} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />
    <path d={d} fill="none" stroke={SK.redHi} strokeWidth={w * 0.42} strokeLinecap="butt" strokeDasharray={`${(w * 0.55).toFixed(1)} ${(w * 0.75).toFixed(1)}`} />
  </g>
);
/** a red tassel (流苏) hanging from (0, 0): a knot, a gold band, a fringe that swings with `sw` degrees */
const Tassel = ({ s = 1, sw = 0 }: { s?: number; sw?: number }) => (
  <g transform={`scale(${s}) rotate(${sw})`}>
    <Cord d="M0 0 L0 18" w={6} />
    <circle cy={24} r={10} fill={SK.red} stroke={SK.ink} strokeWidth={2.5} />
    <rect x={-10} y={34} width={20} height={9} rx={2} fill={SK.gold} stroke={SK.ink} strokeWidth={2} />
    <path d="M-11 43 L-15 112 L15 112 L11 43 Z" fill={SK.red} stroke={SK.ink} strokeWidth={2.5} strokeLinejoin="round" />
    {[-9, -4.5, 0, 4.5, 9].map((x, i) => <path key={i} d={`M${x * 0.9} 48 L${x * 1.25} 108`} stroke={SK.redDeep} strokeWidth={1.6} />)}
  </g>
);
/** A SEAL IMPRESSION, centred on (0, 0), `size` px: 白文 (cream characters cut out of red, `kind` "white") or 朱文 (red
 *  characters and a red border on the paper, "red"). Seal ink never takes everywhere: small specks of paper show. Four
 *  characters are set in two rows read left to right (缘分 / 未到), so anyone reads them at a glance. */
export const SealMark = ({ text, size, kind = "white", seed = 5, round = false }: { text: string; size: number; kind?: "white" | "red"; seed?: number; round?: boolean }) => {
  const ch = [...text], n = ch.length, s = size;
  const rows = n <= 2 ? 1 : 2, cols = Math.ceil(n / rows), cw = (s * 0.84) / cols, rh = (s * 0.84) / rows, px = Math.min(cw, rh) * (n === 1 ? 0.86 : 0.92);
  const edge = round ? null : deckle(s, s, seed, s * 0.012, s * 0.08);
  const fg = kind === "white" ? SK.cream : SK.redInk, bg = kind === "white" ? SK.redInk : "none";
  return (
    <g>
      {round ? <circle r={s / 2} fill={kind === "white" ? SK.redInk : "rgba(248,239,216,0.86)"} stroke={SK.redInk} strokeWidth={s * 0.07} />
        : <path d={edge!} transform={`translate(${-s / 2} ${-s / 2})`} fill={kind === "white" ? bg : "rgba(248,239,216,0.86)"} stroke={SK.redInk} strokeWidth={kind === "white" ? 0 : s * 0.075} />}
      {!round && kind === "red" && <rect x={-s / 2 + s * 0.1} y={-s / 2 + s * 0.1} width={s * 0.8} height={s * 0.8} fill="none" stroke={SK.redInk} strokeWidth={s * 0.018} />}
      {ch.map((c, i) => {
        const r = rows === 1 ? 0 : Math.floor(i / cols), k = rows === 1 ? i : i % cols;
        const x = -((cols - 1) * cw) / 2 + k * cw, y = rows === 1 ? 0 : -rh / 2 + r * rh;
        return <T key={i} x={x} y={y + px * 0.04} px={px} fill={fg} anchor="middle" ff={BRUSH} weight={400}>{c}</T>;
      })}
      {Array.from({ length: Math.round(s / 6) }, (_, i) => {
        const a = hash01(i, seed + 11) * 2 * Math.PI, rr = (round ? 0.5 : 0.62) * s * Math.sqrt(hash01(i, seed + 12));
        return <circle key={i} cx={Math.cos(a) * rr * (round ? 1 : 0.8)} cy={Math.sin(a) * rr * (round ? 1 : 0.8)} r={0.5 + s * 0.008 * hash01(i, seed + 13)} fill={kind === "white" ? SK.paper : "rgba(248,239,216,0.9)"} opacity={0.55} />;
      })}
    </g>
  );
};

// ------------------------------------------------------------------------------------------------- motion
/** HANG: how a thing comes and goes. It drops on its cord (y from -drop, one soft overshoot) and swings to rest about
 *  the cord's top (amp degrees, dying away); it leaves pulled up. Returns null when it is not up. */
const hang = (f: number, from: number, to: number, o: { nin?: number; nout?: number; drop?: number; amp?: number; period?: number; lag?: number } = {}) => {
  const nin = o.nin ?? 9, nout = o.nout ?? 7, L = life(f, from, to, nin, nout); if (!L) return null;
  const t = L.t - (o.lag ?? 0), drop = o.drop ?? 520;
  const down = easeOutBack(clamp01(t / nin), 1.25), up = easeIn(L.leave, 2.2);
  const ang = (o.amp ?? 5) * Math.exp(-Math.max(0, t) / 16) * Math.sin((Math.max(0, t) * 2 * Math.PI) / (o.period ?? 28)) + up * 2;
  return { L, t, y: -(1 - down) * drop - up * drop, ang, o: t < 0 ? 0 : 1 };
};
/** UNROLL: a scroll opening from its rod (0..1) and rolling up again */
const unroll = (f: number, from: number, to: number, nin = 8, nout = 6) => {
  const L = life(f, from, to, nin, nout); if (!L) return null;
  return { L, k: easeOut(L.arrive, 2.6) * (1 - easeIn(L.leave, 2)), o: Math.min(1, L.arrive * 3) * (1 - easeIn(L.leave, 3)) };
};

// ------------------------------------------------------------------------------------------------- the title
/** THE TITLE: the plaque of his temple (匾额) comes down on two red cords and swings to rest: 月老 carved in gold on black-
 *  green lacquer in a gold frame with cloud corners; 采访 and 的一天 on two red paper tags hanging from its lower corners
 *  (read left to right: 采访 · 月老 · 的一天); his crescent seal pressed on its corner. It hangs at y 470..900. */
export const ThreadTitle: React.FC<{ f: number; from: number; to: number; threadAt?: number; paperAt?: number; cut?: boolean }> = ({ f, from, to, threadAt = 0, cut = false }) => {
  const H0 = hang(f, from + threadAt, to, { nin: 10, nout: cut ? 0 : 8, drop: 640, amp: 3.2, period: 30 }); if (!H0) return null;
  const tagL = hang(f, from + threadAt, to, { nin: 10, nout: cut ? 0 : 8, drop: 640, amp: 9, period: 24, lag: 3 });
  const tagR = hang(f, from + threadAt, to, { nin: 10, nout: cut ? 0 : 8, drop: 640, amp: -8, period: 26, lag: 5 });
  const seal = slap(H0.t, 15, 1.9);
  const W = 760, H = 246, X = 540, Y = 478, id = `title${from}`;
  const corner = (sx: number, sy: number) => (
    <g transform={`translate(${(sx * (W / 2 - 34)).toFixed(1)} ${(H / 2 + sy * (H / 2 - 34)).toFixed(1)}) scale(${sx} ${sy})`}>
      <path d="M-14 -14 C-14 -2 -2 6 8 0 C14 -4 12 -14 4 -14 C-2 -14 -4 -8 0 -6" fill="none" stroke={SK.gold} strokeWidth={4} strokeLinecap="round" />
      <path d="M-14 -14 L22 -14 M-14 -14 L-14 22" stroke={SK.gold} strokeWidth={3} strokeLinecap="round" />
    </g>
  );
  const tag = (x: number, text: string, A: NonNullable<ReturnType<typeof hang>>, len: number) => (
    <g transform={`translate(${x} ${H - 6}) rotate(${A.ang.toFixed(2)})`}>
      <Cord d="M0 0 L0 30" w={6} />
      <g transform="translate(-46 28)">
        <path d={deckle(92, len, 17 + text.length, 1.6)} fill="rgba(34,16,8,0.3)" transform="translate(4 7)" filter={`url(#yl6-soft-${id})`} />
        <path d={deckle(92, len, 17 + text.length, 1.6)} fill={SK.red} stroke={SK.redDeep} strokeWidth={2} />
        <rect x={9} y={9} width={74} height={len - 18} fill="none" stroke={SK.gold} strokeWidth={2} opacity={0.85} />
        <Col x={46} y={52} px={58} text={text} fill={SK.cream} gap={1.06} />
      </g>
      <g transform={`translate(0 ${28 + len})`}><Tassel s={0.7} sw={-A.ang * 0.6} /></g>
    </g>
  );
  return (
    <Svg>
      <Defs id={id} seed={21} />
      <g transform={`translate(${X} ${(Y + H0.y).toFixed(1)})`}>
        {/* the two cords go up out of the frame; the plaque swings about their tops */}
        <g transform={`translate(0 -560) rotate(${H0.ang.toFixed(2)}) translate(0 560)`}>
          <Cord d={`M${-W * 0.3} 0 L${-W * 0.3 - 60} -560`} w={8} />
          <Cord d={`M${W * 0.3} 0 L${W * 0.3 + 60} -560`} w={8} />
          {[-1, 1].map((sx) => <circle key={sx} cx={sx * W * 0.3} cy={-2} r={11} fill="none" stroke={SK.gold} strokeWidth={5} />)}
          {tag(-W / 2 + 74, "采访", tagL!, 172)}
          {tag(W / 2 - 74, "的一天", tagR!, 236)}
          <g transform={`translate(${-W / 2} 0)`}>
            <rect x={6} y={12} width={W} height={H} rx={12} fill="rgba(20,10,6,0.4)" filter={`url(#yl6-soft-${id})`} />
            <rect width={W} height={H} rx={12} fill={`url(#yl6-goldf-${id})`} stroke={SK.ink} strokeWidth={4} />
            <rect x={16} y={16} width={W - 32} height={H - 32} rx={6} fill={`url(#yl6-lac-${id})`} stroke={SK.goldLo} strokeWidth={3} />
            <rect x={26} y={26} width={W - 52} height={H - 52} rx={4} fill="none" stroke={SK.gold} strokeWidth={1.6} opacity={0.75} />
            {/* lacquer sheen: one soft band across the top */}
            <rect x={20} y={20} width={W - 40} height={(H - 40) * 0.32} rx={4} fill="#ffffff" opacity={0.05} />
          </g>
          {corner(-1, -1)}{corner(1, -1)}{corner(-1, 1)}{corner(1, 1)}
          {/* 月老 carved in gold: a dark bed, the gold, a light upper edge */}
          <T x={0} y={H / 2 + 8} px={180} anchor="middle" ls={34} ff={BRUSH} weight={400} fill="#0d1414" opacity={0.75}>月老</T>
          <T x={0} y={H / 2 + 4} px={180} anchor="middle" ls={34} ff={BRUSH} weight={400} fill={`url(#yl6-goldf-${id})`} stroke="#3b2a12" sw={3}>月老</T>
          {seal > 0 && (
            <g transform={`translate(${W / 2 - 18} 16) rotate(10) scale(${seal.toFixed(3)})`}>
              <circle r={40} fill={SK.redInk} stroke={SK.ink} strokeWidth={2} />
              <path d="M8 -26 A27 27 0 1 0 8 26 A21 21 0 1 1 8 -26 Z" fill={SK.cream} />
            </g>
          )}
        </g>
      </g>
    </Svg>
  );
};

// ------------------------------------------------------------------------------------------------- name tokens
/** HIS NAME TOKEN (腰牌): it replaces v5's freeze card (owner's note 5: the picture never stops). A pale jade tablet
 *  comes down on a red cord beside him and swings to rest while he carries on: 月老 carved and filled with red, 姻缘司
 *  small under it, a crescent cut at the top, a tassel below; a paper slip slides out from behind it with one line of
 *  who he is and one that pays off in scene H (工龄 一千二百年). (x, y) = where its cord leaves the top of the frame;
 *  side = the side the slip comes out on. Box: TOKEN_BOX(x, y, side). */
export const TOKEN_W = 156, TOKEN_H = 396, SLIP_W = 356, SLIP_H = 132;
export const TOKEN_BOX = (x: number, y: number, side: "left" | "right" = "left", cord = 120) => {
  const x0 = side === "left" ? x - TOKEN_W / 2 - SLIP_W + 26 : x - TOKEN_W / 2, x1 = side === "left" ? x + TOKEN_W / 2 + 10 : x + TOKEN_W / 2 + SLIP_W - 16;
  return { x0, y0: y, x1, y1: y + cord + TOKEN_H + 96 };
};
export const NameToken: React.FC<{ f: number; from: number; to: number; x: number; y: number; side?: "left" | "right"; cord?: number; rows?: [string, string] }> = ({ f, from, to, x, y, side = "left", cord = 120, rows = ["天庭 · 姻缘司主管", "工龄【一千二百年】"] }) => {
  const A = hang(f, from, to, { nin: 10, nout: 7, drop: cord + TOKEN_H + 120, amp: 7, period: 26 }); if (!A) return null;
  const slip = easeOut(part(A.t, 11, 8), 2.4) * (1 - easeIn(A.L.leave, 2)), id = `token${from}`, W = TOKEN_W, H = TOKEN_H;
  const body = `M0 ${W / 2} A${W / 2} ${W / 2} 0 0 1 ${W} ${W / 2} L${W} ${H - 14} Q${W} ${H} ${W - 14} ${H} L14 ${H} Q0 ${H} 0 ${H - 14} Z`;
  return (
    <Svg>
      <Defs id={id} seed={33} />
      <g transform={`translate(${x} ${(y + A.y).toFixed(1)}) rotate(${A.ang.toFixed(2)})`}>
        <Cord d={`M0 0 L0 ${cord + 24}`} w={7} />
        {/* the slip slides out from behind the token (clipped to its own side of the token's middle) */}
        <defs><clipPath id={`yl6-slip-${id}`}><rect x={side === "left" ? -2000 : 0} y={-100} width={2000} height={cord + H + 400} /></clipPath></defs>
        <g clipPath={`url(#yl6-slip-${id})`}>
          <g transform={`translate(${side === "left" ? -W / 2 + 30 - SLIP_W * slip : W / 2 - 30 - SLIP_W + SLIP_W * slip} ${cord + 132})`} opacity={clamp01(slip * 3)}>
            <Paper id={id} w={SLIP_W} h={SLIP_H} seed={41} />
            <T x={side === "left" ? 28 : 46} y={42} px={34} fill={SK.inkSoft}>{rows[0]}</T>
            <Rich x={side === "left" ? 28 : 46} y={92} px={34} text={rows[1]} />
          </g>
        </g>
        <g transform={`translate(${-W / 2} ${cord})`}>
          <path d={body} fill="rgba(20,30,24,0.35)" transform="translate(6 10)" filter={`url(#yl6-soft-${id})`} />
          <path d={body} fill={`url(#yl6-jade-${id})`} stroke={SK.jadeDeep} strokeWidth={4} />
          <path d={body} fill="none" stroke="#ffffff" strokeWidth={2} opacity={0.45} transform={`translate(${W * 0.06} ${W * 0.06}) scale(0.88)`} />
          <circle cx={W / 2} cy={30} r={12} fill={SK.lacquer} stroke={SK.jadeDeep} strokeWidth={3} />
          <path d={`M${W / 2 + 6} 52 A20 20 0 1 0 ${W / 2 + 6} 92 A15 15 0 1 1 ${W / 2 + 6} 52 Z`} fill={SK.jadeDeep} opacity={0.8} />
          <Col x={W / 2} y={150} px={96} text="月老" fill={SK.carve} gap={1.04} />
          <Col x={W / 2} y={300} px={30} text="姻缘司" fill={SK.jadeDeep} gap={1.1} />
          {/* a soft gloss down the left side: jade, not plastic */}
          <path d={`M14 ${W / 2} L14 ${H - 30}`} stroke="#ffffff" strokeWidth={6} strokeLinecap="round" opacity={0.28} />
        </g>
        <g transform={`translate(0 ${cord + H})`}><Tassel s={0.95} sw={-A.ang * 0.8} /></g>
      </g>
    </Svg>
  );
};
/** A SIDE CHARACTER'S CARD: a paper case slip from his files tied to the person with a red cord (tx, ty = the point on
 *  the rim of their head the cord runs to): the name in brush, the note in Song (rows split on "\n", 36 px: v6, Jay's
 *  note that the v5 card was too small to read), a small 凡人 seal. Top-left (x, y); sideSize(name, note); s = its scale. */
export const SIDE_W = 430, SIDE_H = 150;
export const SIDE_NOTE_PX = 36;
export const sideSize = (name: string, note: string) => {
  const rows = note.split("\n"), nameW = 46 + emOf(name) * 62 + 24 + 76, rowW = 46 + Math.max(...rows.map(emOf)) * SIDE_NOTE_PX + 36;
  return { w: Math.max(300, Math.ceil(Math.max(nameW, rowW))), h: 106 + rows.length * 46 };
};
export const SideCard: React.FC<{ f: number; from: number; to: number; x: number; y: number; s?: number; name: string; note: string; tx: number; ty: number }> = ({ f, from, to, x, y, s = 1, name, note, tx, ty }) => {
  const L = life(f, from, to, 7, 6); if (!L) return null;
  const { w: W, h: H } = sideSize(name, note), rows = note.split("\n");
  const t = L.t, k = easeOut(part(t, 0, 8), 2.4), drop = easeOutBack(clamp01(t / 8), 1.4), up = easeIn(L.leave, 2), id = `side${from}`;
  const cx = x + (W * s) / 2, ax = Math.max(x + 24, Math.min(x + W * s - 24, tx)), ay = Math.max(y, Math.min(y + H * s, ty));
  const ex = ax + (tx - ax) * k, ey = ay + (ty - ay) * k, sag = 26 + 0.06 * Math.hypot(tx - ax, ty - ay);
  const sw = 2.2 * Math.exp(-t / 14) * Math.sin(t * 0.3);
  return (
    <Svg>
      <Defs id={id} seed={51} />
      <g opacity={(1 - up).toFixed(3)} transform={`translate(0 ${(-(1 - drop) * 60 - up * 40).toFixed(1)})`}>
        <Cord d={`M${ax.toFixed(1)} ${ay.toFixed(1)} Q${((ax + ex) / 2).toFixed(1)} ${((ay + ey) / 2 + sag).toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}`} w={6} />
        <g transform={`translate(${cx} ${y}) rotate(${sw.toFixed(2)}) scale(${s}) translate(${-W / 2} 0)`}>
          <Paper id={id} w={W} h={H} seed={57} />
          <rect x={14} y={14} width={10} height={H - 28} fill={SK.red} />
          <T x={46} y={56} px={58} ff={BRUSH} weight={400} ls={4}>{name}</T>
          <g transform={`translate(${W - 56} 52) rotate(8)`}><SealMark text="凡人" size={60} seed={58} /></g>
          {rows.map((r, i) => <T key={i} x={46} y={112 + i * 46} px={SIDE_NOTE_PX} fill={SK.inkSoft} opacity={part(t, 7 + 3 * i, 6)}>{r}</T>)}
        </g>
      </g>
    </Svg>
  );
};

// ------------------------------------------------------------------------------------------------- fact cards
/** A FACT CARD: a small hanging scroll from his ledger, unrolled from a lacquer rod: rows in Song (【…】 in red), a gold
 *  rule, the source small, and a round truth seal on its top right corner. Centred on x 540, its rod's top at y.
 *  Spacing on one grid: 40 px of paper at the sides, 30 above and below, rows 1.42 high, the source 26 px. */
const FACT_PAD = 40;
export const factSize = (rows: string[], src?: string, px = 38) => {
  const w = Math.min(800, Math.max(...rows.map(emOf), src ? emOf(src) * (26 / px) : 0) * px + 2 * FACT_PAD + 30);
  return { w, h: 24 + 30 + rows.length * px * 1.42 + (src ? 18 + 2 + 14 + 34 : 0) + 30 };
};
export const Fact: React.FC<{ f: number; from: number; to: number; y: number; rows: string[]; src?: string; px?: number; seal?: "真事" | "传说" | "演绎" }> = ({ f, from, to, y, rows, src, px = 38, seal }) => {
  const U = unroll(f, from, to); if (!U) return null;
  const { w, h } = factSize(rows, src, px), id = `fact${from}`, ph = (h - 24) * U.k, st = seal ? slap(U.L.t, 10, 1.8) : 0;
  const rowY = (i: number) => 24 + 30 + px * 0.71 + i * px * 1.42;
  return (
    <Svg>
      <Defs id={id} seed={61} />
      <defs><clipPath id={`yl6-unroll-${id}`}><rect x={-20} y={14} width={w + 40} height={ph + 16} /></clipPath></defs>
      <g opacity={U.o.toFixed(3)} transform={`translate(${540 - w / 2} ${y})`}>
        <g clipPath={`url(#yl6-unroll-${id})`}>
          <g transform="translate(0 20)"><Paper id={id} w={w} h={h - 24} seed={63} /></g>
          {/* faint vermilion column rules of a ledger page behind the text */}
          {Array.from({ length: Math.floor((w - 2 * FACT_PAD) / 52) }, (_, i) => <line key={i} x1={FACT_PAD + 26 + i * 52} y1={40} x2={FACT_PAD + 26 + i * 52} y2={h - 22} stroke={SK.red} strokeWidth={1.2} opacity={0.1} />)}
          {rows.map((r, i) => <Rich key={i} x={w / 2} y={rowY(i)} px={px} text={r} anchor="middle" />)}
          {src && (
            <g>
              <line x1={w / 2 - Math.min(170, w * 0.3)} y1={rowY(rows.length - 1) + px * 0.71 + 18} x2={w / 2 + Math.min(170, w * 0.3)} y2={rowY(rows.length - 1) + px * 0.71 + 18} stroke={SK.gold} strokeWidth={2} />
              <T x={w / 2} y={rowY(rows.length - 1) + px * 0.71 + 18 + 14 + 17} px={26} fill={SK.inkSoft} anchor="middle" weight={600}>{src}</T>
            </g>
          )}
        </g>
        {/* the rods: one at the top, one riding the unrolling edge */}
        {[14, 14 + ph + 6].map((ry, i) => (
          <g key={i} transform={`translate(0 ${ry.toFixed(1)})`}>
            <rect x={-14} y={-8} width={w + 28} height={16} rx={8} fill={i === 0 ? SK.lacquer : SK.redDeep} stroke={SK.ink} strokeWidth={2.5} />
            <rect x={-22} y={-10} width={14} height={20} rx={4} fill={SK.gold} stroke={SK.ink} strokeWidth={2} />
            <rect x={w + 8} y={-10} width={14} height={20} rx={4} fill={SK.gold} stroke={SK.ink} strokeWidth={2} />
          </g>
        ))}
        {seal && st > 0 && U.k > 0.8 && <g transform={`translate(${w - 14} 52) rotate(-10) scale(${st.toFixed(3)})`}><SealMark text={seal} size={92} kind="red" round seed={65} /></g>}
      </g>
    </Svg>
  );
};

// ------------------------------------------------------------------------------------------------- the quota meter
/** THE YEAR'S QUOTA and HIS CLOCK: a small wooden tablet under her REC row. On its left a bronze censer with one stick of
 *  incense burning down: its length is the time left until 子时 (it is shortest at `done`); a curl of smoke. On the
 *  right: 年度指标 · 还差 1 对. It shakes at each failure (`bumps`); at `done` it turns to 已达标 and a gold 成 seal lands. */
export const Meter: React.FC<{ f: number; from: number; to: number; bumps: number[]; done?: number; start?: number }> = ({ f, from, to, bumps, done, start }) => {
  const L = life(f, from, to, 8, 7); if (!L) return null;
  const arrive = easeOutBack(L.arrive, 1.6), up = easeIn(L.leave, 2), id = `meter${from}`;
  const isDone = done !== undefined && f >= done, d = isDone ? f - done! : -1;
  let sh = 0; for (const b of bumps) if (f >= b && f < b + 12) sh = Math.sin((f - b) * 2.4) * 9 * (1 - (f - b) / 12);
  const s0 = start ?? from, burn = done ? clamp01((f - s0) / Math.max(1, done - s0)) : 0, stick = 46 * (1 - 0.85 * burn);
  const W = 404, H = 84, sm = (f % 90) / 90;
  return (
    <Svg>
      <Defs id={id} seed={71} />
      <g opacity={(Math.min(1, L.arrive * 3) * (1 - up)).toFixed(3)} transform={`translate(${112 + sh} ${(364 - (1 - arrive) * 40 - up * 30).toFixed(1)})`}>
        <rect x={5} y={8} width={W} height={H} rx={10} fill="rgba(30,14,6,0.35)" filter={`url(#yl6-soft-${id})`} />
        <rect width={W} height={H} rx={10} fill={`url(#yl6-wood-${id})`} stroke={SK.ink} strokeWidth={3} />
        {[0.28, 0.52, 0.74].map((v, i) => <path key={i} d={`M8 ${(H * v).toFixed(1)} C${W * 0.3} ${(H * v - 4).toFixed(1)} ${W * 0.6} ${(H * v + 5).toFixed(1)} ${W - 8} ${(H * v - 2).toFixed(1)}`} stroke={SK.woodDeep} strokeWidth={1.3} fill="none" opacity={0.28} />)}
        {/* the censer and its stick */}
        <g transform="translate(46 0)">
          {!isDone && <path d={`M0 ${(H - 22 - stick).toFixed(1)} c${(6 * Math.sin(sm * 6.28)).toFixed(1)} -10 ${(-8 * Math.sin(sm * 6.28 + 1)).toFixed(1)} -18 ${(3 * Math.sin(sm * 6.28 + 2)).toFixed(1)} -30`} stroke="#ffffff" strokeWidth={3} fill="none" opacity={0.55} strokeLinecap="round" />}
          <line x1={0} y1={H - 24} x2={0} y2={(H - 24 - stick).toFixed(1)} stroke={SK.woodDeep} strokeWidth={4} strokeLinecap="round" />
          {!isDone && <circle cx={0} cy={(H - 24 - stick).toFixed(1)} r={4} fill="#ff6a3a" stroke={SK.redDeep} strokeWidth={1.5} />}
          <path d={`M-22 ${H - 26} L22 ${H - 26} L18 ${H - 12} Q0 ${H - 6} -18 ${H - 12} Z`} fill="#8a6a3a" stroke={SK.ink} strokeWidth={2.5} strokeLinejoin="round" />
          <rect x={-24} y={H - 29} width={48} height={6} rx={3} fill={SK.gold} stroke={SK.ink} strokeWidth={2} />
        </g>
        <line x1={92} y1={12} x2={92} y2={H - 12} stroke={SK.woodDeep} strokeWidth={2} opacity={0.5} />
        <T x={108} y={H / 2 + 1} px={30} fill={SK.woodDeep} weight={700}>年度指标</T>
        {isDone ? <T x={W - 22} y={H / 2 + 1} px={38} fill={SK.redInk} anchor="end" ff={BRUSH} weight={400}>已达标</T>
          : <><T x={302} y={H / 2 + 1} px={34} fill={SK.ink} anchor="end">还差</T><T x={334} y={H / 2 - 2} px={58} fill={SK.redInk} anchor="middle" ff={BRUSH} weight={400}>1</T><T x={W - 20} y={H / 2 + 1} px={34} fill={SK.ink} anchor="end">对</T></>}
        {isDone && d >= 0 && <g transform={`translate(${W + 34} ${H / 2}) rotate(12) scale(${slap(d, 2, 2).toFixed(3)})`}><SealMark text="成" size={62} seed={73} /></g>}
      </g>
    </Svg>
  );
};

// ------------------------------------------------------------------------------------------------- effects
/** 花字: a punch word in brush, cream with a heavy ink line and a red shadow pressed under it, like a cut-paper word */
export const Hua: React.FC<{ f: number; from: number; to: number; text: string; x: number; y: number; px?: number; rot?: number; col?: string }> = ({ f, from, to, text, x, y, px = 96, rot = -5, col }) => {
  const L = life(f, from, to, 6, 5); if (!L) return null;
  const s = easeOutBack(L.arrive, 2.4), out = easeIn(L.leave, 2), wob = 1.2 * Math.sin((f - from) * 0.4);
  return (
    <Svg><g opacity={(1 - out).toFixed(3)} transform={`translate(${x} ${(y + out * 24).toFixed(1)}) rotate(${(rot + wob).toFixed(2)}) scale(${(0.5 + 0.5 * s).toFixed(3)})`}>
      <T x={7} y={9} px={px} anchor="middle" ls={4} ff={BRUSH} weight={400} fill={SK.redInk} stroke={SK.redInk} sw={px * 0.2}>{text}</T>
      <T x={0} y={0} px={px} anchor="middle" ls={4} ff={BRUSH} weight={400} fill={col ?? SK.cream} stroke={SK.ink} sw={px * 0.14}>{text}</T>
    </g></Svg>
  );
};
/** THE STAMP of the running gag: a square seal slammed on: 缘分未到 cut white out of red (白文); ok = 缘分已到 in red
 *  characters with a double red border (朱文). Centred on (x, y); STAMP_SIZE(px) square. */
export const STAMP_SIZE = (px = 104) => px * 2.5;
export const FateStamp: React.FC<{ f: number; from: number; to: number; x: number; y: number; ok?: boolean; rot?: number; px?: number }> = ({ f, from, to, x, y, ok, rot = -9, px = 104 }) => {
  const L = life(f, from, to, 1, 6); if (!L) return null;
  const s = slap(L.t, 0, 2.1), out = easeIn(L.leave, 2), jit = L.t < 4 ? (hash01(L.t, 3) - 0.5) * 8 * (1 - L.t / 4) : 0;
  return (
    <Svg><g opacity={((L.t < 1 ? 0.85 : 0.96) * (1 - out)).toFixed(3)} transform={`translate(${(x + jit).toFixed(1)} ${y}) rotate(${rot}) scale(${s.toFixed(3)})`}>
      <SealMark text={ok ? "缘分已到" : "缘分未到"} size={STAMP_SIZE(px)} kind={ok ? "red" : "white"} seed={ok ? 81 : 83} />
      {/* ink that splashed past the seal's edge on the slam */}
      {L.t < 8 && Array.from({ length: 7 }, (_, i) => { const a = hash01(i, 85) * 6.28, r = STAMP_SIZE(px) * (0.58 + 0.12 * hash01(i, 86)); return <circle key={i} cx={Math.cos(a) * r} cy={Math.sin(a) * r} r={2 + 4 * hash01(i, 87)} fill={SK.redInk} opacity={0.7 * (1 - L.t / 8)} />; })}
    </g></Svg>
  );
};
/** a truth seal (真事 / 传说 / 演绎): a small round 朱文 seal pressed on at (x, y) */
export const Truth: React.FC<{ f: number; from: number; to: number; x: number; y: number; kind: "真事" | "传说" | "演绎" }> = ({ f, from, to, x, y, kind }) => {
  const L = life(f, from, to, 1, 5); if (!L) return null;
  return <Svg><g opacity={(0.96 * (1 - easeIn(L.leave, 2))).toFixed(3)} transform={`translate(${x} ${y}) rotate(-12) scale(${slap(L.t, 0, 1.8).toFixed(3)})`}><SealMark text={kind} size={112} kind="red" round seed={89} /></g></Svg>;
};
/** 朱批: red ink written on in his brush (a note, a circle, a cross or an underline drawn after it). Top-left (x, y). */
export const Zhupi: React.FC<{ f: number; from: number; to: number; x: number; y: number; text: string; px?: number; rot?: number; mark?: "circle" | "cross" | "underline"; mw?: number; mh?: number; mx?: number; my?: number }> = ({ f, from, to, x, y, text, px = 64, rot = -6, mark, mw = 300, mh = 140, mx = 0, my = 0 }) => {
  const L = life(f, from, to, 1, 6); if (!L) return null;
  const n = [...text].length, wk = clamp01(L.t / (n * 2.2 + 2)), out = easeIn(L.leave, 2), id = `zhupi${from}`, mk = clamp01((L.t - n * 2.2 - 2) / 7);
  const md = mark === "circle" ? `M${mx + mw * 0.1} ${my + mh * 0.2} C${mx + mw * 0.4} ${my - mh * 0.15} ${mx + mw * 1.05} ${my} ${mx + mw} ${my + mh * 0.5} C${mx + mw * 0.95} ${my + mh * 1.05} ${mx + mw * 0.1} ${my + mh * 1.1} ${mx} ${my + mh * 0.5} C${mx - mw * 0.02} ${my + mh * 0.25} ${mx + mw * 0.2} ${my + mh * 0.05} ${mx + mw * 0.35} ${my}`
    : mark === "cross" ? `M${mx} ${my} L${mx + mw} ${my + mh} M${mx + mw} ${my} L${mx} ${my + mh}` : mark === "underline" ? `M${mx} ${my} C${mx + mw * 0.3} ${my + 8} ${mx + mw * 0.7} ${my - 6} ${mx + mw} ${my + 4}` : "";
  return (
    <Svg>
      <defs><clipPath id={`yl6-write-${id}`}><rect x={-20} y={-px} width={(n * px * 1.04 + 40) * wk} height={px * 2} /></clipPath></defs>
      <g opacity={(1 - out).toFixed(3)} transform={`translate(${x} ${y}) rotate(${rot})`}>
        <g clipPath={`url(#yl6-write-${id})`}><T x={0} y={0} px={px} ff={BRUSH} weight={400} fill={SK.redInk} stroke={SK.cream} sw={px * 0.1}>{text}</T></g>
        {mark && mk > 0 && <path d={md} fill="none" stroke={SK.redInk} strokeWidth={px * 0.13} strokeLinecap="round" pathLength={1} strokeDasharray={`${mk} 1`} />}
      </g>
    </Svg>
  );
};
/** 记者OS: what she thinks and does not say: a torn paper strip, a small red OS seal, a line of Song. Top-left (x, y) */
export const OS: React.FC<{ f: number; from: number; to: number; x: number; y: number; text: string }> = ({ f, from, to, x, y, text }) => {
  const L = life(f, from, to, 6, 5); if (!L) return null;
  const w = [...text].length * 38 + 150, s = easeOutBack(L.arrive, 1.8), out = easeIn(L.leave, 2), id = `os${from}`;
  return (
    <Svg>
      <Defs id={id} seed={91} />
      <g opacity={(Math.min(1, L.arrive * 3) * (1 - out)).toFixed(3)} transform={`translate(${x} ${(y + out * 20).toFixed(1)}) rotate(-1.5) scale(${(0.85 + 0.15 * s).toFixed(3)})`}>
        <Paper id={id} w={w} h={66} seed={93} />
        <g transform="translate(62 33)"><rect x={-44} y={-22} width={88} height={44} rx={8} fill={SK.redInk} /><T x={0} y={1} px={26} fill={SK.cream} anchor="middle">记者OS</T></g>
        <T x={126} y={34} px={36}>{text}</T>
      </g>
    </Svg>
  );
};
/** 囍 TORN IN TWO (v6, in place of v5's 「离婚 +3」 花字: owner's note 6, pop-ups from the story's own world): the sign on
 *  every wedding door, cut from red paper, slapped on one after another, and each one torn down the middle into its two
 *  喜, which fall apart: 「三对离婚」 said in his world's own sign, with no words on the screen. at = the centres of the
 *  signs; px = one sign's size; gap = frames between the signs; tear = frames from a sign's slap to its tear. The torn
 *  halves fall out of the bottom of their box (they are gone 15 frames after the tear). Box: shots/fx.ts tornXi. */
export const XI_W = 1.1, XI_H = 1.16;
export const TornXi: React.FC<{ f: number; from: number; to: number; at: [number, number][]; px?: number; gap?: number; tear?: number }> = ({ f, from, to, at, px = 120, gap = 4, tear = 9 }) => {
  if (f < from || f > to) return null;
  const id = `xi${from}`, W = px * XI_W, H = px * XI_H;
  // the tear: a ragged line down the middle of the sign, between its two 喜, a little different on each sign
  const rag = (seed: number) => Array.from({ length: 10 }, (_, i) => [(hash01(i, seed) - 0.5) * px * 0.08, -H / 2 - 6 + ((H + 12) * i) / 9] as [number, number]);
  // cut from red paper: an ink line round it, a rim of the paper's pale core inside that, the red on top; a soft shadow
  const sign = (shadow: boolean) => shadow
    ? <T x={px * 0.04} y={px * 0.1} px={px} anchor="middle" ff={BRUSH} weight={700} fill="rgba(34,16,8,0.32)" stroke="rgba(34,16,8,0.32)" sw={px * 0.16}>囍</T>
    : <g>
        <T x={0} y={px * 0.04} px={px} anchor="middle" ff={BRUSH} weight={700} fill={SK.ink} stroke={SK.ink} sw={px * 0.16}>囍</T>
        <T x={0} y={px * 0.04} px={px} anchor="middle" ff={BRUSH} weight={700} fill={SK.cream} stroke={SK.cream} sw={px * 0.085}>囍</T>
        <T x={0} y={px * 0.04} px={px} anchor="middle" ff={BRUSH} weight={700} fill={SK.red} stroke={SK.redDeep} sw={px * 0.012}>囍</T>
      </g>;
  return (
    <Svg>
      <defs>{at.map((_, i) => {
        const r = rag(40 + 7 * i), line = r.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(" L");
        return (
          <g key={i}>
            <clipPath id={`yl6-xiL-${id}-${i}`}><path d={`M${-W} ${-H} L${line} L${-W} ${H} Z`} /></clipPath>
            <clipPath id={`yl6-xiR-${id}-${i}`}><path d={`M${W} ${-H} L${line} L${W} ${H} Z`} /></clipPath>
          </g>
        );
      })}</defs>
      {at.map(([x, y], i) => {
        const t = f - from - i * gap; if (t < 0) return null;
        const s = slap(t, 0, 1.45), d = t - tear, torn = d >= 0;
        // before it goes the paper strains for two frames; then the halves part, turn away from each other and fall
        const strain = d === -2 ? 1.5 : d === -1 ? -1.5 : 0;
        const sep = torn ? 5 * d + 0.12 * d * d : 0, fall = torn ? 0.55 * d * d : 0, rot = torn ? 2.6 * d + 0.05 * d * d : 0;
        const o = torn ? 1 - clamp01((d - 8) / 7) : 1;
        if (o <= 0) return null;
        const half = (side: -1 | 1) => (
          <g transform={`translate(${(side * sep + strain * side).toFixed(1)} ${(fall * (side < 0 ? 1 : 1.12)).toFixed(1)}) rotate(${(side * rot).toFixed(2)} ${(side * W) / 4} 0)`}>
            <g clipPath={`url(#yl6-xi${side < 0 ? "L" : "R"}-${id}-${i})`}>{sign(true)}{sign(false)}</g>
          </g>
        );
        return <g key={i} opacity={o.toFixed(3)} transform={`translate(${x} ${y}) rotate(${(-6 + 5 * i) % 9}) scale(${s.toFixed(3)})`}>{half(-1)}{half(1)}</g>;
      })}
    </Svg>
  );
};

// ------------------------------------------------------------------------------------------------- the case files
export type CaseKind = "niulang" | "liangzhu" | "baishe" | "baodai" | "qixian";
export const CASES: Record<CaseKind, { title: string; name: string; era: string; verdict: string; note: string }> = {
  niulang: { title: "牛郎织女", name: "牛郎 × 织女", era: "天字第一号", verdict: "异地", note: "每年七夕见一面" },
  liangzhu: { title: "梁祝", name: "梁山伯 × 祝英台", era: "东晋", verdict: "化蝶", note: "双双变了蝴蝶" },
  baishe: { title: "白蛇传", name: "许仙 × 白娘子", era: "南宋 · 西湖", verdict: "跨物种", note: "审批：一千年" },
  baodai: { title: "红楼梦", name: "贾宝玉 × 林黛玉", era: "清 · 大观园", verdict: "绑错", note: "实际绑成：薛宝钗" },
  qixian: { title: "天仙配", name: "董永 × 七仙女", era: "汉", verdict: "领导闺女", note: "扣仙丹：三百年" },
};
/** A CASE FROM HIS LEDGER (姻缘簿): a thread-bound book (线装书): indigo cover, its title on a paper label 《牛郎织女》,
 *  four stitches of red thread down the spine; open beside it, the page: the couple, the dynasty, the note (typed on
 *  when it is said) and the verdict stamped. Centre (x, y), CASE_W x CASE_H. (Scene C's pop-up books in the room are
 *  the main picture of these cases; this card is their record.) */
export const CASE_W = 580, CASE_H = 400;
export const CaseFile: React.FC<{ f: number; from: number; to: number; x: number; y: number; kind: CaseKind; stampAt: number; noteAt?: number; rot?: number; s?: number; seal?: boolean }> = ({ f, from, to, x, y, kind, stampAt, noteAt = 8, rot = -3, s = 1, seal }) => {
  const L = life(f, from, to, 7, 5); if (!L) return null;
  const c = CASES[kind], t = L.t, W = CASE_W, H = CASE_H, id = `case${from}`, a = easeOutBack(L.arrive, 1.6), out = easeIn(L.leave, 2);
  const st = slap(t, stampAt, 2.0), chars = [...c.note], typed = Math.max(0, Math.min(chars.length, Math.floor((t - noteAt) / 1.5) + 1));
  const BW = 190;
  return (
    <Svg>
      <Defs id={id} seed={101} />
      <g opacity={(Math.min(1, L.arrive * 3) * (1 - out)).toFixed(3)} transform={`translate(${x} ${(y + (1 - a) * 60 + out * 20).toFixed(1)}) rotate(${rot}) scale(${s}) translate(${-W / 2} ${-H / 2})`}>
        {/* the page */}
        <g transform={`translate(${BW - 10} 18)`}>
          <Paper id={id} w={W - BW + 10} h={H - 30} seed={103} />
          {Array.from({ length: 6 }, (_, i) => <line key={i} x1={30 + i * 58} y1={20} x2={30 + i * 58} y2={H - 50} stroke={SK.red} strokeWidth={1.2} opacity={0.12} />)}
          <T x={(W - BW + 10) / 2} y={62} px={[...c.name].length > 8 ? 44 : 50} anchor="middle" ff={BRUSH} weight={400}>{c.name}</T>
          <T x={(W - BW + 10) / 2} y={116} px={26} anchor="middle" fill={SK.inkSoft}>{c.era}</T>
          <line x1={40} y1={146} x2={W - BW - 30} y2={146} stroke={SK.gold} strokeWidth={2} />
          {t >= noteAt ? <T x={(W - BW + 10) / 2} y={200} px={34} anchor="middle" fill={SK.ink}>{chars.slice(0, typed).join("")}</T>
            : <line x1={90} y1={214} x2={W - BW - 80} y2={214} stroke={SK.inkSoft} strokeWidth={2} strokeDasharray="5 7" opacity={0.4} />}
          {st > 0 && <g transform={`translate(${(W - BW + 10) / 2} 290) rotate(-10) scale(${st.toFixed(3)})`}><SealMark text={c.verdict} size={[...c.verdict].length > 2 ? 120 : 100} kind="red" seed={105} /></g>}
        </g>
        {/* the book: indigo cover, label, stitches */}
        <g>
          <rect x={6} y={10} width={BW} height={H} rx={6} fill="rgba(20,10,6,0.35)" filter={`url(#yl6-soft-${id})`} />
          <rect width={BW} height={H} rx={6} fill="#2c3f5e" stroke={SK.ink} strokeWidth={3.5} />
          <rect width={BW} height={H} rx={6} fill={`url(#yl6-fibre-${id})`} opacity={0.6} />
          <g transform={`translate(${BW - 72} 30)`}>
            <rect width={52} height={210} fill={SK.paper} stroke={SK.inkSoft} strokeWidth={2} />
            <Col x={26} y={30} px={[...c.title].length > 3 ? 38 : 42} text={`${c.title}`} fill={SK.ink} gap={1.04} />
          </g>
          {[0.14, 0.38, 0.62, 0.86].map((v, i) => <g key={i}><line x1={0} y1={H * v} x2={22} y2={H * v} stroke={SK.red} strokeWidth={4} /><circle cx={22} cy={H * v} r={4} fill={SK.ink} /></g>)}
          <line x1={22} y1={8} x2={22} y2={H - 8} stroke={SK.red} strokeWidth={3} />
        </g>
        {seal && slap(t, 12, 1.8) > 0 && <g transform={`translate(${W - 50} ${H - 40}) rotate(-12) scale(${(slap(t, 12, 1.8) * 0.66).toFixed(3)})`}><SealMark text="传说" size={110} kind="red" round seed={107} /></g>}
      </g>
    </Svg>
  );
};
/** the note under the case files: a small 演绎 seal and one line of Song with a dark edge */
export const Disclaimer: React.FC<{ f: number; from: number; to: number; y: number; text: string; x?: number }> = ({ f, from, to, y, text, x = 540 }) => {
  const L = life(f, from, to, 6, 6); if (!L) return null;
  return <Svg><g opacity={L.k.toFixed(3)}><T x={x + 20} y={y} px={28} fill={SK.cream} anchor="middle" stroke="rgba(20,6,4,0.8)" sw={7}>{text}</T><g transform={`translate(${x - emOf(text) * 14 - 16} ${y}) rotate(-8)`}><SealMark text="演" size={36} seed={109} /></g></g></Svg>;
};
/** THE MOTHER'S PRAYER (scene D) arrives as a WOODEN WISH PLAQUE (许愿牌) on a red ribbon: 求姻缘 in brush, her
 *  demands in Song ticking in row by row, the temple's 加急 seal slammed on. Centre (x, y), 520 x 470 at s 1. */
export const OrderSlip: React.FC<{ f: number; from: number; to: number; x: number; y: number; s?: number }> = ({ f, from, to, x, y, s = 1 }) => {
  // (v6b: narrower, 2-degree swing, 40 px rows: it hangs left of his head without touching it, and reads at phone size)
  const A = hang(f, from, to, { nin: 9, nout: 6, drop: 700, amp: 2, period: 26 }); if (!A) return null;
  const t = A.t, W = 460, H = 500, id = `wish${from}`;
  const rows = ["林小满 · 女 · 三十", "天天加班 · 不找对象", "今年【必须成】！"];
  const shape = `M0 70 L${W / 2} 0 L${W} 70 L${W} ${H} L0 ${H} Z`;
  return (
    <Svg>
      <Defs id={id} seed={111} />
      <g transform={`translate(${x} ${(y - H / 2 * s + A.y).toFixed(1)}) rotate(${A.ang.toFixed(2)}) scale(${s}) translate(${-W / 2} 0)`}>
        <Cord d={`M${W / 2} 46 L${W / 2 - 30} -300`} w={8} />
        <path d={shape} fill="rgba(30,14,6,0.35)" transform="translate(7 11)" filter={`url(#yl6-soft-${id})`} />
        <path d={shape} fill={`url(#yl6-wood-${id})`} stroke={SK.ink} strokeWidth={4} strokeLinejoin="round" />
        {[0.24, 0.41, 0.58, 0.76, 0.9].map((v, i) => <path key={i} d={`M14 ${(H * v).toFixed(1)} C${W * 0.35} ${(H * v - 6).toFixed(1)} ${W * 0.65} ${(H * v + 7).toFixed(1)} ${W - 14} ${(H * v - 3).toFixed(1)}`} stroke={SK.woodDeep} strokeWidth={1.4} fill="none" opacity={0.25} />)}
        <path d={`M24 82 L${W / 2} 26 L${W - 24} 82 L${W - 24} ${H - 22} L24 ${H - 22} Z`} fill="none" stroke={SK.woodDeep} strokeWidth={2} opacity={0.5} />
        <circle cx={W / 2} cy={46} r={10} fill={SK.woodDeep} stroke={SK.ink} strokeWidth={2} />
        {/* a red bow tied through the hole, its two short tails above the writing */}
        <path d={`M${W / 2} 46 C${W / 2 - 50} 14 ${W / 2 - 64} 62 ${W / 2} 46 C${W / 2 + 50} 14 ${W / 2 + 64} 62 ${W / 2} 46`} fill={SK.red} stroke={SK.ink} strokeWidth={3} strokeLinejoin="round" />
        <path d={`M${W / 2 - 4} 50 L${W / 2 - 24 + 3 * Math.sin(t * 0.3)} 92`} stroke={SK.red} strokeWidth={10} strokeLinecap="round" />
        <path d={`M${W / 2 + 4} 50 L${W / 2 + 22 + 3 * Math.sin(t * 0.27)} 94`} stroke={SK.red} strokeWidth={10} strokeLinecap="round" />
        <circle cx={W / 2} cy={46} r={8} fill={SK.red} stroke={SK.ink} strokeWidth={2.5} />
        <T x={W / 2} y={146} px={86} anchor="middle" ff={BRUSH} weight={400} fill={SK.carve} ls={8}>求姻缘</T>
        {rows.map((r, i) => { const k = part(t, 12 + i * 9, 5); return <g key={i} opacity={k}><Rich x={W / 2} y={228 + i * 62} px={i === 2 ? 46 : 40} text={r} anchor="middle" fill={SK.woodDeep} /></g>; })}
        <g transform={`translate(${W - 92} ${H - 64}) rotate(12) scale(${(slap(t, 9, 1.9) || 0.001).toFixed(3)})`}><SealMark text="加急" size={86} seed={113} /></g>
        <g transform={`translate(84 ${H - 62}) rotate(-6)`}><SealMark text="月老庙" size={74} kind="red" seed={115} /></g>
      </g>
    </Svg>
  );
};
/** A SNAPPED-THREAD COUNT (scene E): a paper strip, 已断 n 根 in brush, the red numeral popping on each snap */
export const Snaps: React.FC<{ f: number; from: number; to: number; x: number; y: number; hits: number[] }> = ({ f, from, to, x, y, hits }) => {
  const L = life(f, from, to, 6, 5); if (!L) return null;
  const n = hits.filter((h) => f >= h).length, out = easeIn(L.leave, 2), id = `snaps${from}`, s = easeOutBack(L.arrive, 1.8);
  const last = Math.max(-99, ...hits.filter((h) => f >= h)), k = f - last < 5 ? [1.6, 1.3, 0.95, 1.05, 1][f - last] : 1;
  return (
    <Svg>
      <Defs id={id} seed={121} />
      <g opacity={(Math.min(1, L.arrive * 3) * (1 - out)).toFixed(3)} transform={`translate(${x - 140} ${y - 66}) rotate(-4) scale(${(0.85 + 0.15 * s).toFixed(3)})`}>
        <Paper id={id} w={360} h={132} seed={123} />
        <T x={34} y={68} px={60} ff={BRUSH} weight={400}>已断</T>
        <g transform={`translate(222 64) scale(${k})`}><T x={0} y={0} px={104} ff={BRUSH} weight={400} anchor="middle" fill={SK.redInk} stroke={SK.cream} sw={6}>{String(n)}</T></g>
        <T x={300} y={68} px={60} ff={BRUSH} weight={400}>根</T>
      </g>
    </Svg>
  );
};
/** the last card after her camera is off: a line of cream Song on black */
export const EndLine: React.FC<{ f: number; from: number; to: number; rows: string[] }> = ({ f, from, to, rows }) => {
  const L = life(f, from, to, 10, 1); if (!L) return null;
  return <Svg><g opacity={L.arrive.toFixed(3)}>{rows.map((r, i) => <T key={i} x={540} y={900 + i * 64} px={i === 0 ? 40 : 30} fill={i === 0 ? SK.cream : "#b9ad98"} anchor="middle">{r}</T>)}</g></Svg>;
};

// ------------------------------------------------------------------------------------------------- the lens effects
/** RED THREAD WOUND ROUND HER LENS (scene G): out-of-focus strands of the braided cord across the picture. on[i] 1 = on
 *  the lens .. 0 = pulled off along its `out`; pulls[i] = the frame his hand pulls strand i (seen at the lens, big and
 *  soft: a round hand, no fingers drawn). */
export const LensThreads: React.FC<{ on: number[]; f: number; pulls?: number[] }> = ({ on, f, pulls }) => {
  const S: { d: number[]; w: number; out: [number, number]; grab: [number, number]; from: [number, number] }[] = [
    { d: [-90, 455, 520, 600, 1170, 500], w: 44, out: [1, 0.35], grab: [960, 522], from: [1, 0.08] },
    { d: [-90, 1030, 500, 1230, 1170, 1150], w: 54, out: [-1, 0.4], grab: [110, 1086], from: [-1, 0.1] },
    { d: [730, -70, 770, 700, 1000, 1990], w: 58, out: [0.35, 1], grab: [852, 1085], from: [1, 0.2] },
    { d: [470, -70, 360, 380, 300, 700], w: 36, out: [-0.45, 1], grab: [272, 716], from: [-1, 0.2] },
  ];
  const mitt = (i: number): { x: number; y: number; s: number } | null => {
    const p = pulls?.[i]; if (p === undefined) return null;
    const t = f - p, q = S[i], k = on[i] ?? 0;
    if (t < -9 || k <= 0.001) return null;
    if (t < 0) { const u = Math.min(1, (t + 9) / 7), e = 1 - (1 - u) * (1 - u), far = 720 * (1 - e); return { x: q.grab[0] + q.from[0] * far, y: q.grab[1] + q.from[1] * far, s: t >= -2 ? 0.93 : 1 }; }
    const off = (1 - k) * (1 - k) * 1700;
    return { x: q.grab[0] + q.out[0] * off, y: q.grab[1] + q.out[1] * off, s: 0.93 };
  };
  if (!on.some((k) => k > 0.001)) return null;
  return (
    <Svg>
      <defs>
        <filter id="yl6-lensThreadBlur" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="11" /></filter>
        <filter id="yl6-lensMittBlur" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="9" /></filter>
      </defs>
      {S.map((q, i) => {
        const k = on[i] ?? 0; if (k <= 0.001) return null;
        const off = (1 - k) * (1 - k) * 1700, wob = 5 * Math.sin(f * 0.17 + i * 2.1), d = `M${q.d[0]} ${q.d[1]} Q${q.d[2]} ${q.d[3]} ${q.d[4]} ${q.d[5]}`;
        return (
          <g key={i} transform={`translate(${(q.out[0] * off + wob * 0.4).toFixed(1)} ${(q.out[1] * off + wob).toFixed(1)})`} opacity={(0.92 * Math.min(1, k * 4)).toFixed(3)} filter="url(#yl6-lensThreadBlur)">
            <path d={d} fill="none" stroke={SK.ink} strokeWidth={q.w + 14} strokeLinecap="round" opacity={0.55} />
            <path d={d} fill="none" stroke={SK.red} strokeWidth={q.w} strokeLinecap="round" />
            <path d={d} fill="none" stroke={SK.redHi} strokeWidth={q.w * 0.42} strokeDasharray={`${q.w * 0.55} ${q.w * 0.75}`} />
          </g>
        );
      })}
      {S.map((q, i) => {
        const m = mitt(i); if (!m) return null;
        const ax = m.x + q.from[0] * 1500, ay = m.y + q.from[1] * 1500, R = 138 * m.s;
        return (
          <g key={`m${i}`} filter="url(#yl6-lensMittBlur)">
            <line x1={m.x + q.from[0] * 90} y1={m.y + q.from[1] * 90} x2={ax} y2={ay} stroke={SK.ink} strokeWidth={224} strokeLinecap="round" />
            <line x1={m.x + q.from[0] * 90} y1={m.y + q.from[1] * 90} x2={ax} y2={ay} stroke={SK.red} strokeWidth={196} strokeLinecap="round" />
            <circle cx={m.x} cy={m.y} r={R + 9} fill={SK.ink} />
            <circle cx={m.x} cy={m.y} r={R} fill="#f0b993" />
            <circle cx={m.x - q.from[0] * R * 0.3} cy={m.y - R * 0.3} r={R * 0.42} fill="#f9d6b8" opacity={0.6} />
          </g>
        );
      })}
    </Svg>
  );
};
/** HIS HAND OVER HER LENS (the join of scenes F and G; k 0..1): his round skin hand comes up from the lower right, soft
 *  with nearness; at 1 the frame is its dark warm palm (never pure black). */
export const MittenCover: React.FC<{ k: number }> = ({ k }) => {
  if (k <= 0.001) return null;
  const e = Math.min(1, k), r = 260 + 2140 * e, cx = 1180 - 560 * e, cy = 2050 - 950 * e, dark = Math.min(100, Math.round(100 * (0.08 + 1.25 * e)));
  return (
    <Svg>
      <defs>
        <radialGradient id="yl6-mittCoverFill" cx="45%" cy="45%" r="52%">
          <stop offset="0%" stopColor="#2a1d19" /><stop offset={`${Math.max(0, dark - 30)}%`} stopColor="#3b2a22" /><stop offset={`${dark}%`} stopColor="#f0b993" /><stop offset="100%" stopColor="#f9d6b8" />
        </radialGradient>
        <filter id="yl6-mittCoverBlur" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation={6 + 6 * e} /></filter>
      </defs>
      <g filter="url(#yl6-mittCoverBlur)">
        <ellipse cx={cx} cy={cy} rx={r + 16} ry={r * 1.15 + 16} fill={SK.ink} />
        <ellipse cx={cx} cy={cy} rx={r} ry={r * 1.15} fill="url(#yl6-mittCoverFill)" />
      </g>
    </Svg>
  );
};
/** THE SPOOL OVER THE LENS (the join of scenes D and E): the end of his spool fills the frame (k 0..1): turns of the
 *  braided cord round a lacquer core, a gold rim; in scene E it falls out of the bottom (drop px). */
export const SpoolLens: React.FC<{ k: number; drop?: number }> = ({ k, drop = 0 }) => {
  if (k <= 0.001) return null;
  const e = Math.min(1, k), R = 180 + 1900 * e * e, cx = 540, cy = 1000 + drop, n = 22;
  return (
    <Svg>
      <g opacity={drop > 0 ? 1 : Math.min(1, e * 2.5)}>
        <circle cx={cx} cy={cy} r={R} fill={SK.red} />
        {Array.from({ length: n }, (_, i) => { const rr = R * (0.16 + (0.84 * i) / n); return (
          <g key={i}>
            <circle cx={cx} cy={cy} r={rr} fill="none" stroke={SK.redDeep} strokeWidth={Math.max(2, R * 0.006)} opacity={0.8} />
            <circle cx={cx} cy={cy} r={rr + R * 0.018} fill="none" stroke={SK.redHi} strokeWidth={Math.max(2, R * 0.012)} strokeDasharray={`${Math.max(4, R * 0.02)} ${Math.max(5, R * 0.026)}`} opacity={0.7} />
          </g>
        ); })}
        <circle cx={cx} cy={cy} r={R * 0.15} fill={SK.lacquer} stroke={SK.ink} strokeWidth={Math.max(3, R * 0.01)} />
        <circle cx={cx} cy={cy} r={R} fill="none" stroke={SK.gold} strokeWidth={Math.max(10, R * 0.05)} />
        <circle cx={cx} cy={cy} r={R + Math.max(5, R * 0.025)} fill="none" stroke={SK.ink} strokeWidth={Math.max(3, R * 0.008)} />
      </g>
    </Svg>
  );
};
