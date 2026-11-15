// hud/intro.tsx: THE INTRO CARDS of the Li Bai film, in its skin (hud/skin.ts: the tavern's wine flag). Pure functions
// of the frame.
//   <LeadCard f />   李白's card: the picture FREEZES for FREEZE_N frames on his first close-up (A02, the lens is "the
//                    moon" to him and he peers right into it), story.ts CLOCK. A cloth tag with the sky-blue toothed hem
//                    swings in on its cord under his face: his name in wild amber cursive and 字太白, the seal 谪仙人
//                    (paid off in F37), the year and the place (they are not on the title), three joke stats from the
//                    sources (each says who said it) and the day's target 醒酒, paid off by the bucket of water in B.
//   <SideBanner f />  the side characters' banners on the live shot (no freeze): the messenger (B), 高力士 (C), the
//                     drinking friend (E), 贺知章 in the memory (F, quiet): a strip of the same cloth over their heads.
//   LEAD_CARD_RECT, sideBannerRect(f)   the boxes they take (film px, 1080 x 1920)
import React from "react";
import { AbsoluteFill } from "remotion";
import { EN } from "../lang";
import { CLOCK, FREEZE } from "../story";
import { SIDE_BANNERS } from "../beats";
import { tracked } from "../track";
import { SCREEN } from "../layout";
import { life, glyph, roughFilter, grainFilter, gradient, seal, pop, slap, part, easeOut, easeIn, clamp01, typeOn, tornBox } from "../../../kit/overlay";
import { SKIN, C, TONE, sway, hiccup, idle } from "./skin";
import type { Rect } from "./style";

const ID = "libai-card";
/** the card's box before its swing (film px) and where its cord hangs from */
const BOX = { x0: 110, y0: 980, x1: 800, y1: 1452 };   // 9:16: 40 px further in
const HANG = { x: (BOX.x0 + BOX.x1) / 2, y: BOX.y0 - 40 };
export const LEAD_CARD_RECT: Rect = { x0: BOX.x0 - 30, y0: HANG.y - 10, x1: BOX.x1 + 40, y1: BOX.y1 + 40 };

const STATS: [string, string, string][] = [
  ["酒量", "一日三百杯", "他自己说的"],
  ["写诗", "斗酒诗百篇", "杜甫说的"],
  ["花钱", "一年散金三十万", "他自己说的"],
];
const STATS_EN: [string, string, string][] = [
  ["Wine", "300 cups a day", "his own words"],
  ["Poems", "100 per jug", "says Du Fu"],
  ["Money", "300,000 gone in a year", "his own words"],
];

/** the picture's veil while frozen: only the frame's edges (he is isolated in 3D: isolate.ts, Film.tsx) */
const Veil: React.FC<{ k: number }> = ({ k }) => (
  <div style={{ position: "absolute", inset: 0, opacity: k, background: `radial-gradient(ellipse 85% 65% at 50% 36%, rgba(27,33,72,0) 0%, rgba(27,33,72,0) 60%, rgba(10,12,32,0.45) 100%)` }} />
);
/** how far 李白 is isolated (isolate.ts) on film frame f: in with the freeze, out with the card */
export const leadIsolation = (f: number): number => {
  const z = CLOCK.at(f);
  if (!z || z.i !== FREEZE.lead) return 0;
  const L = life(z.t, 0, z.n, 1, LEAVE_N);
  return L ? clamp01((L.t + 1) / 3) * (1 - easeIn(L.leave, 2)) : 0;
};
/** 0..1 through the hold (Film.tsx: her slow push while the picture is frozen) */
export const leadHold = (f: number): number => { const z = CLOCK.at(f); return z && z.i === FREEZE.lead ? clamp01(z.t / z.n) : 0; };
/** the card leaves over the last LEAVE_N frames of the freeze, carried off by her zoom back in */
const LEAVE_N = 10;
/** where the zoom back in pushes from (his chest in the card's framing) */
const RIDE = { x: 540, y: 960, k: 1.7 };

export const LeadCard: React.FC<{ f: number }> = ({ f }) => {
  const z = CLOCK.at(f);
  if (!z || z.i !== FREEZE.lead) return null;
  const L = life(z.t, 0, z.n, 1, LEAVE_N);
  if (!L) return null;
  const t = L.t, M = SKIN.motion;
  const leave = easeIn(L.leave, 2);
  // in: it swings down with her pull back; out: it rides her zoom back in (scaled about his chest, off the bottom)
  const swing = sway(t, 0, -30, 22, 10) + 8 * leave;
  const dy = hiccup(t, 18, 10) + idle(t, 5, 2) - 120 * (1 - easeOut(clamp01((t + 1) / 6)));
  const ride = 1 + RIDE.k * leave;
  const op = clamp01((t + 1) / 3) * (1 - clamp01((L.leave - 0.5) / 0.5));
  const veil = clamp01((t + 1) / 4) * (1 - L.leave);
  const name = pop(t, 2, 6, M.over), sealK = slap(t, 6, 1.8), target = slap(t, 17, 1.7);
  const W = BOX.x1 - BOX.x0, H = BOX.y1 - BOX.y0;
  const rows = EN ? STATS_EN : STATS;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <Veil k={veil} />
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", left: 0, top: 0, opacity: op, transform: `scale(${ride.toFixed(4)})`, transformOrigin: `${RIDE.x}px ${RIDE.y}px` }}>
        <defs>
          {gradient(`${ID}-amber`, [TONE.amberTop, [C.lead, 0.5], TONE.amberDeep])}
          {gradient(`${ID}-cloth`, [C.paper, [C.paper, 0.4], [TONE.clothLow, 0.85], TONE.clothFold])}
          {roughFilter(`${ID}-brush`, SKIN.display.rough!, 2)}
          {roughFilter(`${ID}-edge`, SKIN.body.rough!, 2)}
          {grainFilter(`${ID}-grain`, { fx: 0.9, fy: 0.35, seed: 8, color: [120, 92, 50], amount: 0.14 })}
        </defs>
        <g transform={`translate(0,${dy.toFixed(2)}) rotate(${swing.toFixed(2)} ${HANG.x} ${HANG.y})`}>
          {/* the cord and the nail it hangs from */}
          <path d={`M${BOX.x0 + 90},${BOX.y0 + 4} L${HANG.x},${HANG.y} L${BOX.x1 - 90},${BOX.y0 + 4}`} fill="none" stroke={C.ink} strokeWidth={6} strokeLinejoin="round" />
          <circle cx={HANG.x} cy={HANG.y} r={11} fill={C.lead} stroke={C.ink} strokeWidth={5} />
          {/* the cloth with its toothed hem along the foot */}
          <g filter={`url(#${ID}-edge)`}>
            <path d={tornBox({ x0: BOX.x0 + 6, y0: BOX.y0 + 12, x1: BOX.x1 + 6, y1: BOX.y1 + 12 }, { jag: 3, step: 40, seed: 2 })} fill={TONE.shadow} />
            <path d={teeth(BOX.x0, BOX.x1, BOX.y1, 22, 9)} fill={C.accent} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
            <path d={tornBox(BOX, { jag: 3, step: 40, seed: 2 })} fill={`url(#${ID}-cloth)`} stroke={C.ink} strokeWidth={5} />
            <path d={tornBox(BOX, { jag: 3, step: 40, seed: 2 })} fill="#fff" filter={`url(#${ID}-grain)`} style={{ mixBlendMode: "multiply" }} opacity={0.85} />
            <rect x={BOX.x0} y={BOX.y0} width={W} height={18} fill={C.accent} stroke={C.ink} strokeWidth={4} />
            <ellipse cx={BOX.x1 - 140} cy={BOX.y0 + H - 90} rx={70} ry={34} fill={TONE.stain} opacity={0.13} />
          </g>
          {/* the year and the place, top left */}
          <g opacity={part(t, 2, 4)}>{glyph("when", EN ? "744 · Chang'an" : "744年 · 长安", BOX.x0 + 40, BOX.y0 + 58, 32, C.ink, { anchor: "start", ls: 2 })}</g>
          {/* the name: wild amber cursive, and 字太白 small after it */}
          <g filter={`url(#${ID}-brush)`} opacity={name.o} transform={`translate(${BOX.x0 + 150},${BOX.y0 + 150}) rotate(${(-5 - 14 * (1 - name.k)).toFixed(2)}) scale(${name.s.toFixed(3)})`}>
            {glyph("name", EN ? "Li Bai" : "李白", 0, 0, 124, `url(#${ID}-amber)`, { ink: SKIN.display.ink * 124, inkColor: C.ink, drop: 6, dropColor: TONE.shadow, ls: 4 })}
          </g>
          <g opacity={part(t, 5, 4)}>{glyph("zi", EN ? "aka Taibai" : "字太白", BOX.x0 + 290, BOX.y0 + 172, 34, C.ink, { anchor: "start", ls: 3 })}</g>
          {/* the seal 谪仙人, slapped beside the name (sky blue, carved) */}
          {sealK > 0 ? (
            <g transform={`translate(${BOX.x1 - 92},${BOX.y0 + 132}) rotate(7) scale(${sealK.toFixed(3)})`} filter={`url(#${ID}-edge)`}>
              {seal("s", EN ? ["BANISHED", "IMMORTAL"] : ["谪", "仙", "人"], EN ? 22 : 40, { fill: C.accent, text: C.paper, carve: 2.5, seed: 4, inner: C.paper, drop: TONE.shadow })}
            </g>
          ) : null}
          {/* three joke stats from the sources, each typed on in turn */}
          {rows.map(([k, v, who], i) => {
            const y = BOX.y0 + 236 + i * 54, ty = typeOn(v, part(t, 7 + 2 * i, 5));
            const on = part(t, 7 + 2 * i, 3);
            return (
              <g key={i} opacity={on}>
                <rect x={BOX.x0 + 36} y={y - 22} width={EN ? 104 : 92} height={44} rx={8} fill={C.ink} />
                {glyph(`k${i}`, k, BOX.x0 + 36 + (EN ? 52 : 46), y, EN ? 24 : 30, C.paper, { ls: 2 })}
                {glyph(`v${i}`, ty.shown, BOX.x0 + (EN ? 156 : 146), y, EN ? 30 : 36, C.ink, { anchor: "start", ls: EN ? 0.5 : 2 })}
                {part(t, 11 + 2 * i, 3) > 0 ? glyph(`w${i}`, EN ? `(${who})` : `（${who}）`, BOX.x1 - 26, y + 4, EN ? 22 : 28, TONE.amberDeep, { anchor: "end", opacity: part(t, 11 + 2 * i, 3) }) : null}
              </g>
            );
          })}
          {/* the day's target: slapped on last, with the whole card's hiccup */}
          {target > 0 ? (
            <g transform={`translate(${BOX.x0 + 36},${BOX.y1 - 46}) scale(${target.toFixed(3)})`} >
              <rect x={0} y={-30} width={EN ? 420 : 330} height={60} rx={12} fill={`url(#${ID}-amber)`} stroke={C.ink} strokeWidth={5} />
              {glyph("goal", EN ? "TODAY'S GOAL: SOBER UP" : "今日目标：醒酒", EN ? 210 : 165, 0, EN ? 28 : 36, C.ink, { ls: 2 })}
            </g>
          ) : null}
        </g>
      </svg>
    </AbsoluteFill>
  );
};

/** a toothed hem along y between x0 and x1: n teeth of depth d hanging below the line */
const teeth = (x0: number, x1: number, y: number, d: number, n: number) => {
  const pts = [`M${x0},${y - 4}`];
  for (let i = 0; i < n; i++) { const a = x0 + ((x1 - x0) * i) / n, b = x0 + ((x1 - x0) * (i + 1)) / n; pts.push(`L${(a + b) / 2},${y + d}`, `L${b},${y - 4}`); }
  return pts.join(" ") + " Z";
};

// ---------------------------------------------------------------------------------------------------- the side banners
/** THE SIDE CHARACTERS' BANNERS (beats.ts SIDE_BANNERS): a strip of the flag's cloth over the person's head, moving
 *  with them as the camera moves (track.ts, written by the segments), their name in ink (never amber: the amber is
 *  李白's) and a short title on a dark tag. 贺知章 in the night's memory gets the quiet version: no swing, no hem. */
const SIDE: Record<string, { zh: string; en: string; tag: string; tagEn: string; rest: { cx: number; bottom: number }; quiet?: boolean }> = {
  huan: { zh: "传旨太监", en: "Messenger", tag: "跑断腿", tagEn: "RUNS", rest: { cx: 420, bottom: 520 } },
  gao: { zh: "高力士", en: "Gao Lishi", tag: "大宦官", tagEn: "EUNUCH", rest: { cx: 760, bottom: 540 } },
  you: { zh: "酒友", en: "Pal", tag: "蹭酒的", tagEn: "FREELOADER", rest: { cx: 420, bottom: 560 } },
  he: { zh: "贺知章", en: "He Zhizhang", tag: "金龟换酒", tagEn: "PAWNED HIS GOLD", rest: { cx: 520, bottom: 520 }, quiet: true },
};
const BH = 110, GB_GAP = 34, GB_Y0 = 352;
const bwOf = (who: string) => { const d = SIDE[who]; return EN ? 490 : Math.max(380, 64 * [...d.zh].length + 34 * [...d.tag].length + 150); };
const gbBox = (who: string, f: number) => {
  // over the head, its right end just past the head's middle (so it keeps left of the cup counter), and never up in
  // the REC row or the counter's band (y0 >= GB_Y0)
  const d = SIDE[who], BW = bwOf(who), tr = tracked(who, f), cx = tr ? tr.x : d.rest.cx, bottom = tr ? tr.top - GB_GAP : d.rest.bottom;
  const x0 = Math.max(SCREEN.side + 10, Math.min(SCREEN.W - SCREEN.side - 40 - BW, cx + 60 - BW)), y1 = Math.max(GB_Y0 + BH, bottom);
  return { x0, y0: y1 - BH, x1: x0 + BW, y1 };
};
const sideOn = (f: number) => SIDE_BANNERS.find((b) => f >= b.span[0] && f <= b.span[1]) ?? null;
/** the box a side banner takes on frame f (film px), or null */
export const sideBannerRect = (f: number): Rect | null => {
  const b = sideOn(f);
  if (!b) return null;
  const GB = gbBox(b.who, f);
  return { x0: GB.x0 - 10, y0: GB.y0 - 20, x1: GB.x1 + 30, y1: GB.y1 + 34 };
};
/** kept for the callers that name 高力士's */
export const gaoBannerRect = (f: number): Rect | null => (sideOn(f)?.who === "gao" ? sideBannerRect(f) : null);
export const SideBanner: React.FC<{ f: number }> = ({ f }) => {
  const b = sideOn(f);
  if (!b) return null;
  const d = SIDE[b.who], quiet = !!d.quiet;
  const L = life(f, b.span[0], b.span[1], quiet ? 10 : 6, quiet ? 10 : 7);
  if (!L) return null;
  const t = L.t, leave = easeIn(L.leave, 2), GB = gbBox(b.who, f);
  const swing = quiet ? 0 : sway(t, 0, -18, 20, 9) - 25 * leave, dy = quiet ? 0 : -260 * (1 - easeOut(clamp01((t + 1) / 6))) - 200 * leave;
  const op = quiet ? Math.min(easeOut(L.arrive), 1 - L.leave) * 0.92 : 1 - clamp01((L.leave - 0.5) / 0.5);
  const tagW = (EN ? 16 : 34) * [...(EN ? d.tagEn : d.tag)].length + 40;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", left: 0, top: 0, opacity: op }}>
        <defs>
          {gradient(`${ID}-gb-cloth`, [C.paper, [TONE.clothLow, 0.85], TONE.clothFold])}
          {roughFilter(`${ID}-gb-edge`, SKIN.body.rough!, 2)}
        </defs>
        <g transform={`translate(0,${dy.toFixed(1)}) rotate(${swing.toFixed(2)} ${(GB.x0 + GB.x1) / 2} ${GB.y0})`} filter={`url(#${ID}-gb-edge)`}>
          {quiet ? null : <path d={teeth(GB.x0, GB.x1, GB.y1, 18, 8)} fill={C.accent} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />}
          <path d={tornBox(GB, { jag: 3, step: 40, seed: 7 })} fill={quiet ? "rgba(27,33,72,0.78)" : `url(#${ID}-gb-cloth)`} stroke={C.ink} strokeWidth={5} />
          {glyph(`g-${b.who}`, EN ? d.en : d.zh, GB.x0 + 34, (GB.y0 + GB.y1) / 2, EN ? 48 : 60, quiet ? C.paper : C.ink, { anchor: "start", ls: 4 })}
          <g transform={`translate(${GB.x1 - 30 - tagW / 2},${(GB.y0 + GB.y1) / 2}) rotate(-4)`}>
            <rect x={-tagW / 2} y={-26} width={tagW} height={52} rx={10} fill={quiet ? C.paper : C.ink} />
            {glyph(`gt-${b.who}`, EN ? d.tagEn : d.tag, 0, 0, EN ? 22 : 30, quiet ? C.ink : C.paper, { ls: 3 })}
          </g>
        </g>
      </svg>
    </AbsoluteFill>
  );
};
/** the old name */
export const GaoBanner = SideBanner;
