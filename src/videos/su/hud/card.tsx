// hud/card.tsx: THE FACT CARDS of the Su film (PLAN.md section 6; WP1). A pure function of the frame.
//   <FactCard f />   the card of story.ts CARDS on frame f (each up only while nobody speaks)
// The look: a cream paper card with a thin ink border, a faint inner rule and a small red seal mark 「注」 in its top
// right corner, MID-LEFT (x 56 .. at most 760, from y 780; it ends by about y 1080). The Chinese text (48 px, two rows
// at most, broken at the best punctuation), the English under it (26 px, light ink, up to three rows). Motion: slides in
// from the left over 8 frames (a little overshoot), floats 2 px, slides back out over its last 8 frames.
// THE LAST CARD (I57's, card 5) is not mid-left: the end names and their pictures own the middle third then, and nobody
// speaks, so it sits LOW in the caption band, centred (FACT_END_RECT).
// English version (lang "en"): the English big (34 px), no Chinese.
//   factCardAt(f)     the card on frame f (or null);  factRows(s, max)  the two-row break;  FACT_RECT / FACT_END_RECT
//   factRect(f)       the box the card of frame f takes (or null)
import React from "react";
import { AbsoluteFill } from "remotion";
import { CARDS, clamp01, easeInCubic, easeOutBack, easeOutCubic, lineNum, type Card } from "../story";
import { SCREEN } from "../layout";
import { EN } from "../lang";
import { FONT_STACK, HC, em, textW, type Rect } from "./style";
import { END_LINE } from "./endnames";

/** the card on frame f (story.ts CARDS), or null */
export const factCardAt = (f: number): Card | null => CARDS.find((c) => f >= c.from && f <= c.to) ?? null;
const isEnd = (c: Card) => lineNum(c.id) === END_LINE;

// ---------------------------------------------------------------------------------------------------- the words
const STRONG = "。！？；", WEAK = "，、：", OPEN = "（《「“‘", NO_START = "，。！？；：、）》」”’…—";
/** the best break of a Chinese text into two rows of at most `max` em: after a sentence mark if it can, else after a
 *  comma, else before an opening bracket; never a row starting with a closing mark. One row when it fits; null when no
 *  two-row break fits (the browser wraps it). */
export const factRows = (s: string, max: number): string[] | null => {
  const cs = [...s];
  if (em(s) <= max) return [s];
  let best: string[] | null = null, bestCost = Infinity;
  for (let i = 1; i < cs.length - 1; i++) {
    const c = cs[i], nx = cs[i + 1];
    if (NO_START.includes(nx) || OPEN.includes(c) || (/[0-9A-Za-z.,%]/.test(c) && /[0-9A-Za-z.,%]/.test(nx))) continue;
    const a = cs.slice(0, i + 1).join(""), b = cs.slice(i + 1).join(""), wa = em(a), wb = em(b);
    if (wa > max || wb > max) continue;
    const cost = Math.max(wa, wb) + (STRONG.includes(c) ? -5 : WEAK.includes(c) ? -1 : OPEN.includes(nx) ? -0.5 : 1.5);
    if (cost < bestCost) { bestCost = cost; best = [a, b]; }
  }
  return best;
};
/** English in at most n balanced rows of at most `room` px */
const wrapEn = (s: string, px: number, room: number, n: number): string[] => {
  const words = s.split(/\s+/).filter(Boolean);
  for (let k = 1; k <= n; k++) {
    const target = textW(s, px, 0) / k;
    const rows: string[] = []; let cur = "";
    for (const w of words) { const t = cur ? `${cur} ${w}` : w; if (cur && textW(t, px, 0) > Math.max(target * 1.08, 1) && rows.length < k - 1) { rows.push(cur); cur = w; } else cur = t; }
    rows.push(cur);
    if (rows.every((r) => textW(r, px, 0) <= room)) return rows;
  }
  return [s];
};

// ---------------------------------------------------------------------------------------------------- the card
const Z = SCREEN.card, MAXW = Z.x1 - Z.x0;
const BORDER = 3, PADX = 36, PADY = 24, ZH = 48, ENPX = EN ? 34 : 26, LS = 1;
const NIN = 8, NOUT = 8;
/** the box a mid-left card takes at its widest (motion and seal included) */
export const FACT_RECT: Rect = { x0: Z.x0 - 4, y0: Z.y0 - 10, x1: Z.x1 + 8, y1: Z.y1 + 6 };
/** the box the last card (I57's) takes, low in the caption band */
export const FACT_END_RECT: Rect = { x0: 110, y0: 1236, x1: 970, y1: 1500 };
/** the box the card of frame f takes, or null */
export const factRect = (f: number): Rect | null => { const c = factCardAt(f); return c ? (isEnd(c) ? FACT_END_RECT : FACT_RECT) : null; };

export const FactCard: React.FC<{ f: number }> = ({ f }) => {
  const c = factCardAt(f);
  if (!c) return null;
  const end = isEnd(c), t = f - c.from;
  const kin = easeOutCubic((t + 1) / NIN), kb = easeOutBack((t + 1) / NIN, 1.5);
  const u = easeInCubic((f - (c.to - NOUT)) / NOUT);                               // the leave: 0 .. 1 on the last frame
  const op = clamp01((t + 1) / 3) * (1 - u);
  const float = 2 * Math.sin((2 * Math.PI * t) / 96);
  const W = end ? FACT_END_RECT.x1 - FACT_END_RECT.x0 : MAXW;
  const inner = W - 2 * BORDER - 2 * PADX;
  const zhRows = EN ? [] : factRows(c.zh, inner / (ZH + LS)) ?? [c.zh];
  const enRows = wrapEn(c.en, ENPX, inner, EN ? 4 : 3);
  // the width: hug the rows (between 480 and the zone's width)
  const need = Math.max(...zhRows.map((r) => em(r) * (ZH + LS)), ...enRows.map((r) => textW(r, ENPX, 0)), 300) + 2 * PADX + 2 * BORDER + 10;
  const width = Math.round(Math.min(W, Math.max(end ? 600 : 480, need)));
  const left = end ? 540 - width / 2 : Z.x0, top = end ? FACT_END_RECT.y0 + 8 : Z.y0;
  const dx = end ? 0 : -60 * (1 - kb) - 40 * u, dy = end ? 26 * (1 - kin) + 16 * u : 0;
  const zhStyle: React.CSSProperties = { fontFamily: FONT_STACK, fontWeight: 700, fontSize: ZH, lineHeight: 1.36, letterSpacing: LS, color: HC.paperInk, whiteSpace: "nowrap" };
  const enStyle: React.CSSProperties = { fontFamily: FONT_STACK, fontWeight: 700, fontSize: ENPX, lineHeight: 1.3, color: EN ? HC.paperInk : "#6a5a48", whiteSpace: "nowrap" };
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ position: "absolute", left, top, width, opacity: op, transform: `translate(${dx.toFixed(2)}px, ${(dy + float).toFixed(2)}px) rotate(-0.8deg)`, transformOrigin: "0% 50%" }}>
        <div style={{ position: "relative", boxSizing: "border-box", width, padding: `${PADY}px ${PADX}px ${PADY - 4}px`, borderRadius: 14, border: `${BORDER}px solid ${HC.ink}`,
          background: `linear-gradient(172deg, ${HC.paper} 0%, #f7efdc 60%, ${HC.paperLow} 100%)`, boxShadow: "0 12px 22px rgba(10,8,6,0.32), 0 3px 0 rgba(10,8,6,0.2)" }}>
          <div style={{ position: "absolute", left: 8, top: 8, right: 8, bottom: 8, borderRadius: 9, border: `1.5px solid ${HC.paperRule}` }} />
          {zhRows.map((r, i) => <div key={i} style={{ ...zhStyle, marginLeft: OPEN.includes([...r][0]) ? -ZH / 2 : 0 }}>{r}</div>)}
          <div style={{ marginTop: zhRows.length ? 8 : 0 }}>{enRows.map((r, i) => <div key={i} style={enStyle}>{r}</div>)}</div>
          {/* the small red seal mark 「注」 */}
          <svg width={46} height={46} viewBox="0 0 46 46" style={{ position: "absolute", right: 12, top: -16, transform: "rotate(6deg)" }}>
            <rect x={2} y={2} width={42} height={42} rx={5} fill={HC.seal} />
            <rect x={6} y={6} width={34} height={34} rx={3} fill="none" stroke="#f6e6d0" strokeWidth={2} />
            <text x={23} y={31} textAnchor="middle" fontFamily={FONT_STACK} fontWeight={700} fontSize={24} fill="#f6e6d0">注</text>
          </svg>
        </div>
      </div>
    </AbsoluteFill>
  );
};
