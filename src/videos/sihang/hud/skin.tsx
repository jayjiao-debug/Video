// THE SKIN of 采访八百壮士的一天: A 1937 SHANGHAI EXTRA (号外). Everything the film lays over the picture is a piece of
// newsprint: torn clippings (paper cream, letterpress black, one red: the 号外 block and the rubber stamps), slapped on
// at a slight angle. The only other graphics are her letter paper and the plain white words of scene D and the end.
// Rules kept: pure functions of the frame; DOM / SVG in film px (1080 wide); the one face FrSans; nothing over a face
// (the shots place the strips); no effect in scene D or in the letter scene beyond the letter itself.
import React from "react";
import { life, part, pop, slap, easeOut, easeIn, hash01, clamp01 } from "../../../kit/overlay/time";
import { tornBox, roughFilter, seal } from "../../../kit/overlay/marks";
import { textW } from "../../../kit/overlay/text";

export const SK = { paper: "#efe6d0", paperLo: "#d6c9ac", ink: "#1d1b19", inkSoft: "#4a453e", red: "#b32a22", white: "#f4f0e6" } as const;
const FF = 'FrSans, "Noto Sans SC", "Noto Sans CJK SC", sans-serif';
const Svg = (p: { children: React.ReactNode; style?: React.CSSProperties }) => (
  <svg viewBox="0 0 1080 1920" width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, overflow: "visible", ...p.style }}>{p.children}</svg>
);
const T = (p: { x: number; y: number; px: number; fill?: string; anchor?: "start" | "middle" | "end"; ls?: number; children: React.ReactNode; opacity?: number }) => (
  <text x={p.x} y={p.y} fontFamily={FF} fontWeight={700} fontSize={p.px} fill={p.fill ?? SK.ink} textAnchor={p.anchor ?? "start"} letterSpacing={p.ls ?? 0} opacity={p.opacity ?? 1} dominantBaseline="central">{p.children}</text>
);
/** a torn piece of newsprint w x h with its top-left at (0, 0): the paper, a soft shadow, faint print-through lines */
const Paper = (p: { id: string; w: number; h: number; seed: number; lines?: boolean }) => (
  <g>
    <path d={tornBox({ x0: 6, y0: 8, x1: p.w + 6, y1: p.h + 8 }, { jag: 5, step: 26, seed: p.seed })} fill="rgba(0,0,0,0.32)" />
    <path d={tornBox({ x0: 0, y0: 0, x1: p.w, y1: p.h }, { jag: 5, step: 26, seed: p.seed })} fill={SK.paper} />
    {p.lines !== false && Array.from({ length: Math.floor(p.h / 34) }, (_, i) => <rect key={i} x={14} y={18 + i * 34} width={p.w - 28} height={2} fill={SK.paperLo} opacity={0.28 + 0.2 * hash01(i, p.seed)} />)}
  </g>
);
/** a rubber stamp: a red box with rounded corners, its word cut out of... printed in red, a little uneven */
const Stamp = (p: { id: string; text: string; px: number; rot?: number; fill?: boolean }) => {
  const w = textW(p.text, p.px, 4) + p.px * 0.7, hgt = p.px * 1.45;
  return (
    <g transform={`rotate(${p.rot ?? -6})`} filter={`url(#${p.id}-rough)`}>
      <rect x={-w / 2} y={-hgt / 2} width={w} height={hgt} rx={8} fill={p.fill ? SK.red : "none"} stroke={SK.red} strokeWidth={p.px * 0.11} />
      <T x={0} y={2} px={p.px} fill={p.fill ? SK.paper : SK.red} anchor="middle" ls={4}>{p.text}</T>
    </g>
  );
};
const Rough = (p: { id: string; seed?: number }) => <defs>{roughFilter(`${p.id}-rough`, { fx: 0.04, fy: 0.04, scale: 3.2, seed: p.seed ?? 3 }, 2)}</defs>;
/** in: slapped on (large, then squashed to rest); out: slides off and fades */
const land = (f: number, from: number, to: number) => {
  const L = life(f, from, to, 4, 7); if (!L) return null;
  const s = L.t < 4 ? [1.22, 1.07, 0.97, 1.02][L.t] : 1, out = easeIn(L.leave, 2);
  return { L, s, o: (L.t < 1 ? 0.7 : 1) * (1 - out), dy: -40 * out };
};

// ------------------------------------------------------------------------------------------------------- the title
/** THE TITLE: the front page of an extra slapped across the frame: the red 号外 block, the headline set big */
export const ExtraTitle: React.FC<{ f: number; from: number; to: number }> = ({ f, from, to }) => {
  const A = land(f, from, to); if (!A) return null;
  const t = A.L.t, W = 880, H = 600, X = 100, Y = 560;
  const chars = [..."八百壮士"];
  return (
    <Svg>
      <Rough id="sh-title" seed={5} />
      <g opacity={A.o} transform={`translate(${X + W / 2},${Y + H / 2 + A.dy}) rotate(-3.2) scale(${A.s}) translate(${-W / 2},${-H / 2})`}>
        <Paper id="sh-title" w={W} h={H} seed={11} />
        <g filter="url(#sh-title-rough)">
          <rect x={36} y={34} width={210} height={112} fill={SK.red} />
          <T x={141} y={92} px={84} fill={SK.paper} anchor="middle" ls={6}>号外</T>
          <T x={270} y={66} px={30} fill={SK.inkSoft}>民国二十六年十月 · 上海闸北</T>
          <rect x={270} y={104} width={W - 306} height={5} fill={SK.ink} /><rect x={270} y={116} width={W - 306} height={2} fill={SK.ink} />
          <T x={48} y={222} px={70} ls={10} opacity={part(t, 3, 4)}>采访</T>
          {chars.map((c, i) => { const p = pop(t, 5 + 2 * i, 6, 2.2, 0.5); return <g key={i} opacity={p.o} transform={`translate(${130 + i * 205},${372}) scale(${p.s}) rotate(${[-2, 1.5, -1, 2][i]})`}><T x={0} y={0} px={196} anchor="middle">{c}</T></g>; })}
          <T x={W - 44} y={512} px={78} anchor="end" ls={10} opacity={part(t, 13, 4)}>的一天</T>
          <rect x={48} y={476} width={W - 400} height={4} fill={SK.ink} opacity={part(t, 13, 4)} />
          <T x={48} y={524} px={30} fill={SK.inkSoft} opacity={part(t, 13, 4)}>四行仓库 · 四天四夜</T>
        </g>
      </g>
    </Svg>
  );
};

// ------------------------------------------------------------------------------------------------------- the unit's clipping
/** THE UNIT CARD: a clipping pasted on while the men go on hauling sacks. Rows set one after another. */
export const UnitCard: React.FC<{ f: number; from: number; to: number }> = ({ f, from, to }) => {
  const A = land(f, from, to); if (!A) return null;
  const t = A.L.t, W = 780, H = 590, X = 150, Y = 420, rows = ["对外：八百人", "实有：约四百二十人", "多数二十岁上下"];
  return (
    <Svg>
      <Rough id="sh-unit" seed={8} />
      <g opacity={A.o} transform={`translate(${X + W / 2},${Y + H / 2 + A.dy}) rotate(2.4) scale(${A.s}) translate(${-W / 2},${-H / 2})`}>
        <Paper id="sh-unit" w={W} h={H} seed={23} />
        <g filter="url(#sh-unit-rough)">
          <rect x={34} y={30} width={104} height={56} fill={SK.red} /><T x={86} y={59} px={40} fill={SK.paper} anchor="middle">号外</T>
          <T x={156} y={59} px={30} fill={SK.inkSoft}>国民革命军 第88师524团第1营</T>
          <T x={34} y={158} px={116} ls={8}>八百壮士</T>
          <rect x={34} y={226} width={W - 68} height={4} fill={SK.ink} />
          {rows.map((r, i) => { const k = part(t, 8 + 9 * i, 5); return <g key={i} opacity={k} transform={`translate(${-18 * (1 - easeOut(k))},0)`}>
            <circle cx={62} cy={282 + i * 74} r={24} fill="none" stroke={SK.ink} strokeWidth={4} /><T x={62} y={284 + i * 74} px={32} anchor="middle">{String(i + 1)}</T>
            <T x={106} y={284 + i * 74} px={50}>{r}</T></g>; })}
          <g opacity={part(t, 38, 5)}>
            <rect x={34} y={478} width={W - 68} height={2} fill={SK.ink} />
            <T x={34} y={528} px={40}>目标：守住这栋楼</T>
            {[0, 1, 2, 3].map((i) => <rect key={i} x={430 + i * 56} y={506} width={44} height={44} fill="none" stroke={SK.ink} strokeWidth={4} />)}
            <T x={W - 36} y={528} px={34} fill={SK.red} anchor="end">0/4天</T>
          </g>
        </g>
      </g>
    </Svg>
  );
};

// ------------------------------------------------------------------------------------------------------- strips
/** A NAME STRIP (横条小卡): the name big, what he is in small, and for the two invented soldiers the label 演绎人物.
 *  (x, y) = the strip's centre in px; the shot puts it beside the man, never on his face. */
export const NameStrip: React.FC<{ f: number; from: number; to: number; x: number; y: number; name: string; sub: string; invented?: boolean; rot?: number }> = ({ f, from, to, x, y, name, sub, invented, rot }) => {
  const A = land(f, from, to); if (!A) return null;
  const nw = textW(name, 66, 4), sw = textW(sub, 30), tag = invented ? "演绎人物" : "", tw = tag ? textW(tag, 26, 2) + 30 : 0;
  const W = Math.max(nw + 60, sw + tw + 70), H = 150, id = `sh-name-${name}`;
  return (
    <Svg>
      <Rough id={id} seed={name.length + 2} />
      <g opacity={A.o} transform={`translate(${x},${y + A.dy}) rotate(${rot ?? -2.5}) scale(${A.s}) translate(${-W / 2},${-H / 2})`}>
        <Paper id={id} w={W} h={H} seed={name.charCodeAt(0) % 40} lines={false} />
        <g filter={`url(#${id}-rough)`}>
          <rect x={0} y={0} width={14} height={H} fill={SK.red} />
          <T x={34} y={52} px={66} ls={4}>{name}</T>
          <T x={34} y={112} px={30} fill={SK.inkSoft}>{sub}</T>
          {tag && <g transform={`translate(${34 + sw + 20 + tw / 2},${112})`}><rect x={-tw / 2} y={-21} width={tw} height={42} rx={6} fill="none" stroke={SK.inkSoft} strokeWidth={3} strokeDasharray="7 4" /><T x={0} y={1} px={26} fill={SK.inkSoft} anchor="middle" ls={2}>{tag}</T></g>}
        </g>
      </g>
    </Svg>
  );
};
/** A FACT: one or two rows of print on a strip, with a red stamp: 真事 (a seal on something we just saw) or 号外 (a fact
 *  card). y = the strip's centre; it sits centred across the frame. */
export const Fact: React.FC<{ f: number; from: number; to: number; y: number; rows: string[]; stamp?: "真事" | "号外"; rot?: number }> = ({ f, from, to, y, rows, stamp = "真事", rot }) => {
  const A = land(f, from, to); if (!A) return null;
  const px = 42, tw = Math.max(...rows.map((r) => textW(r, px))), W = tw + 190, H = 44 + rows.length * 58, id = `sh-fact-${from}`;
  return (
    <Svg>
      <Rough id={id} seed={7} />
      <g opacity={A.o} transform={`translate(540,${y + A.dy}) rotate(${rot ?? 1.6}) scale(${A.s}) translate(${-W / 2},${-H / 2})`}>
        <Paper id={id} w={W} h={H} seed={(from % 37) + 3} lines={false} />
        <g filter={`url(#${id}-rough)`}>{rows.map((r, i) => <T key={i} x={150} y={22 + 29 + i * 58} px={px}>{r}</T>)}</g>
        <g transform={`translate(78,${H / 2}) scale(${slap(A.L.t, 5, 1.6) || 0.001})`}><Stamp id={id} text={stamp} px={38} fill={stamp === "号外"} rot={-9} /></g>
      </g>
    </Svg>
  );
};
/** 原话: the red stamp that says these are his own words, with where they come from in small print under it */
export const QuoteSeal: React.FC<{ f: number; from: number; to: number; x: number; y: number; src: string }> = ({ f, from, to, x, y, src }) => {
  const L = life(f, from, to, 1, 7); if (!L) return null;
  const s = slap(L.t, 0, 1.8), o = 1 - easeIn(L.leave, 2), id = `sh-quote-${from}`, sw = textW(src, 28) + 36;
  return (
    <Svg>
      <Rough id={id} seed={9} />
      <g opacity={o} transform={`translate(${x},${y})`}>
        <g transform={`scale(${s})`}><Stamp id={id} text="原话" px={62} rot={-7} /></g>
        <g opacity={part(L.t, 5, 4)} transform="translate(0,84) rotate(-2)"><rect x={-sw / 2} y={-24} width={sw} height={48} fill={SK.paper} /><T x={0} y={1} px={28} anchor="middle" fill={SK.inkSoft}>{src}</T></g>
      </g>
    </Svg>
  );
};
/** THE TALLY in the corner under the REC row: what they say, and what is there. `real` = the second number; `mark` 0..1
 *  underlines 800 in red (her last word). */
export const Tally: React.FC<{ f: number; from: number; to: number; real: number; mark?: number }> = ({ f, from, to, real, mark = 0 }) => {
  const A = land(f, from, to); if (!A) return null;
  const W = 286, H = 132;
  return (
    <Svg>
      <Rough id="sh-tally" seed={4} />
      <g opacity={A.o} transform={`translate(${112 + W / 2},${352 + H / 2 + A.dy}) rotate(-2) scale(${A.s}) translate(${-W / 2},${-H / 2})`}>
        <Paper id="sh-tally" w={W} h={H} seed={31} lines={false} />
        <g filter="url(#sh-tally-rough)">
          <T x={22} y={38} px={34} fill={SK.inkSoft}>对外</T><T x={W - 22} y={38} px={50} anchor="end">800</T>
          <rect x={18} y={66} width={W - 36} height={2} fill={SK.ink} opacity={0.5} />
          <T x={22} y={98} px={34} fill={SK.inkSoft}>实有</T><T x={W - 22} y={98} px={50} anchor="end">{String(real)}</T>
          {mark > 0 && <rect x={W - 22 - 96} y={58} width={96 * clamp01(mark)} height={7} fill={SK.red} />}
        </g>
      </g>
    </Svg>
  );
};
/** her count as she pans the room: small white figures ticking up over the picture (scene A) */
export const Count: React.FC<{ f: number; from: number; to: number; n0: number; n1: number; x?: number; y?: number }> = ({ f, from, to, n0, n1, x = 540, y = 470 }) => {
  const L = life(f, from, to, 3, 5); if (!L) return null;
  const n = Math.round(n0 + (n1 - n0) * easeOut(L.t / Math.max(1, L.len - 8), 2));
  return <Svg><g opacity={L.k}><T x={x} y={y} px={92} fill={SK.white} anchor="middle" ls={4}>{String(n)}</T><T x={x} y={y + 76} px={30} fill={SK.white} anchor="middle" opacity={0.8}>她在数人头</T></g></Svg>;
};

// ------------------------------------------------------------------------------------------------------- the letter
export type LetterCol = { text: string; from: number; to: number };
/** HER PAPER: the letter she writes for him, in columns from the right, each character as she writes it. k = how far
 *  the sheet is up (0 = below the frame, 1 = in place). Pencil grey on ruled paper. */
export const Letter: React.FC<{ f: number; k: number; cols: LetterCol[]; x?: number; y?: number; rot?: number; scale?: number }> = ({ f, k, cols, x = 96, y = 560, rot = -3.5, scale = 1 }) => {
  if (k <= 0.001) return null;
  const W = 640, H = 640, CW = 64, CH = 52, x0 = W - 58;
  return (
    <Svg>
      <Rough id="sh-letter" seed={12} />
      <g transform={`translate(${x + W / 2},${y + H / 2 + (1 - easeOut(k)) * 900}) rotate(${rot}) scale(${scale}) translate(${-W / 2},${-H / 2})`}>
        <rect x={8} y={10} width={W} height={H} fill="rgba(0,0,0,0.3)" />
        <rect x={0} y={0} width={W} height={H} fill="#f3ecd8" />
        {Array.from({ length: 10 }, (_, i) => <rect key={i} x={x0 + CW / 2 - i * CW} y={26} width={2} height={H - 52} fill="#c9a9a0" opacity={0.7} />)}
        <g filter="url(#sh-letter-rough)">
          {cols.map((c, i) => {
            const cs = [...c.text], n = Math.round(clamp01((f - c.from) / Math.max(1, c.to - c.from)) * cs.length);
            return cs.slice(0, n).map((ch, j) => <g key={`${i}-${j}`} transform={`translate(${x0 - i * CW + 2 * (hash01(i * 31 + j, 3) - 0.5) * 3},${58 + j * CH}) rotate(${(hash01(i * 17 + j, 7) - 0.5) * 7})`}><T x={0} y={0} px={44} fill="#2c2f3a" anchor="middle">{ch}</T></g>);
          })}
        </g>
      </g>
    </Svg>
  );
};

// ------------------------------------------------------------------------------------------------------- the paper's headline
/** the newspaper 老班长 reads from (scene F): its headline, set down the page as the papers did */
export const Headline: React.FC<{ f: number; from: number; to: number }> = ({ f, from, to }) => {
  const A = land(f, from, to); if (!A) return null;
  const W = 420, H = 640, cols = ["八百孤军", "死守四行"];
  return (
    <Svg>
      <Rough id="sh-head" seed={6} />
      <g opacity={A.o} transform={`translate(${330},${760 + A.dy}) rotate(-4) scale(${A.s}) translate(${-W / 2},${-H / 2})`}>
        <Paper id="sh-head" w={W} h={H} seed={17} />
        <g filter="url(#sh-head-rough)">
          <rect x={30} y={28} width={W - 60} height={6} fill={SK.ink} /><rect x={30} y={40} width={W - 60} height={2} fill={SK.ink} />
          {cols.map((c, i) => [...c].map((ch, j) => <T key={`${i}${j}`} x={W - 110 - i * 170} y={130 + j * 132} px={124} anchor="middle">{ch}</T>))}
          <T x={W / 2} y={H - 40} px={26} anchor="middle" fill={SK.inkSoft}>十月二十八日 · 上海各报</T>
        </g>
      </g>
    </Svg>
  );
};

// ------------------------------------------------------------------------------------------------------- black, white words
export const Black: React.FC<{ k: number; col?: string }> = ({ k, col = "#000000" }) => (k <= 0.001 ? null : <div style={{ position: "absolute", inset: 0, background: col, opacity: clamp01(k) }} />);
/** plain white words on black (scene D; never an effect): rows centred, each fading in */
export const WhiteWords: React.FC<{ f: number; rows: { text: string; from: number; px?: number }[]; to: number; y?: number }> = ({ f, rows, to, y = 880 }) => (
  <Svg>
    {rows.map((r, i) => { const k = clamp01((f - r.from) / 10) * (1 - clamp01((f - (to - 10)) / 10)); return k <= 0 ? null : <T key={i} x={540} y={y + i * 96} px={r.px ?? 56} fill={SK.white} anchor="middle" ls={3} opacity={k}>{r.text}</T>; })}
  </Svg>
);
/** THE END SLATE: white on black, a block at a time; the small print in the corner comes last */
export const EndSlate: React.FC<{ f: number; from: number; blocks: { rows: string[]; at: number }[]; note: string[]; noteAt: number }> = ({ f, from, blocks, note, noteAt }) => {
  if (f < from) return null;
  let y = 400;
  return (
    <Svg>
      {blocks.map((b, i) => {
        const k = clamp01((f - b.at) / 12), y0 = y; y += b.rows.length * 62 + 46;
        return k <= 0 ? null : <g key={i} opacity={k}>{b.rows.map((r, j) => <T key={j} x={130} y={y0 + j * 62} px={i === blocks.length - 1 ? 52 : 42} fill={SK.white}>{r}</T>)}</g>;
      })}
      {f >= noteAt && <g opacity={0.62 * clamp01((f - noteAt) / 12)}>{note.map((r, j) => <T key={j} x={130} y={1440 + j * 40} px={26} fill={SK.white}>{r}</T>)}</g>}
    </Svg>
  );
};
/** a flat wash over the picture (a blast's white, dust on the lens) */
export const Wash: React.FC<{ k: number; col: string }> = ({ k, col }) => (k <= 0.001 ? null : <div style={{ position: "absolute", inset: 0, background: col, opacity: clamp01(k) }} />);
void seal; void part;
