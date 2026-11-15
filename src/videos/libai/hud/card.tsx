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
import { FONT_STACK, em, textW, type Rect } from "./style";
import { C as SC, TONE, sway } from "./skin";
const END_LINE = -1;

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
/** THE SOURCES' VOICE, in the film's skin (hud/skin.ts): a strip of the flag's cloth with its sky-blue hem across the
 *  top, the source named in a small ink chip (旧唐书, 新唐书), the words in night-indigo ink, Chinese only (the film is
 *  spoken in Chinese). LOW in the frame (nobody speaks while it shows, so it may take the subtitle band), centred,
 *  left of the app's buttons. It swings in from the top a little drunk and tips out. */
const Z = { x0: 150, x1: 890, bottom: 1478 }, MAXW = Z.x1 - Z.x0;
const PADX = 34, PADY = 26, ZH = 46, LS = 1, ROWH = Math.round(ZH * 1.4), CHIP = 30;
const NIN = 8, NOUT = 8;
/** split 「旧唐书：……」 into the source and the words */
const sourceOf = (zh: string): { src: string | null; text: string } => {
  const m = zh.match(/^(旧唐书|新唐书|[^：]{2,6}书)：(.*)$/);
  return m ? { src: m[1], text: m[2] } : { src: null, text: zh };
};
const layout = (c: Card) => {
  const { src, text } = sourceOf(c.zh);
  const inner = MAXW - 2 * PADX;
  const rows = EN ? [c.en] : factRows(text, inner / (ZH + LS)) ?? [text];
  const w = Math.round(Math.min(MAXW, Math.max(520, ...rows.map((r) => em(r) * (ZH + LS))) + 2 * PADX));
  const h = PADY * 2 + (src ? CHIP + 16 : 0) + rows.length * ROWH - (ROWH - ZH) + 10;
  const x0 = Math.round(Math.min(540 - w / 2, Z.x1 - w)), y0 = Z.bottom - h;
  return { src, rows, w, h, x0, y0 };
};
/** the box the card of frame f takes, or null */
export const factRect = (f: number): Rect | null => {
  const c = factCardAt(f);
  if (!c) return null;
  const L = layout(c);
  return { x0: L.x0 - 6, y0: L.y0 - 30, x1: Math.min(L.x0 + L.w + 8, Z.x1 + 8), y1: Z.bottom + 8 };
};
export const FACT_RECT: Rect = { x0: Z.x0, y0: 1180, x1: Z.x1, y1: Z.bottom };
export const FACT_END_RECT = FACT_RECT;

export const FactCard: React.FC<{ f: number }> = ({ f }) => {
  const c = factCardAt(f);
  if (!c) return null;
  const t = f - c.from, L = layout(c);
  const kin = easeOutBack((t + 1) / NIN, 1.6), u = easeInCubic((f - (c.to - NOUT)) / NOUT);
  const op = clamp01((t + 1) / 3) * (1 - u);
  const rot = sway(t, 0, -7, 22, 10) + 18 * u, dy = -40 * (1 - kin) + 60 * u * u + 2 * Math.sin((2 * Math.PI * t) / 96);
  void isEnd; void easeOutCubic;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: L.x0, top: L.y0, width: L.w, height: L.h, opacity: op, transform: `translateY(${dy.toFixed(2)}px) rotate(${rot.toFixed(2)}deg)`, transformOrigin: "50% 0%" }}>
        <div style={{ position: "absolute", left: 5, top: 9, width: L.w, height: L.h, borderRadius: 10, background: TONE.shadow }} />
        <div style={{ position: "absolute", inset: 0, borderRadius: 10, border: `5px solid ${SC.ink}`, boxSizing: "border-box", overflow: "hidden",
          background: `linear-gradient(180deg, ${SC.paper} 0%, ${SC.paper} 45%, ${TONE.clothLow} 100%)` }}>
          <div style={{ position: "absolute", left: 0, top: 0, right: 0, height: 14, background: SC.accent, borderBottom: `4px solid ${SC.ink}` }} />
          {L.src ? (
            <div style={{ position: "absolute", left: PADX, top: PADY + 4, height: CHIP + 6, padding: "0 14px", borderRadius: 8, background: SC.ink, color: SC.paper, fontFamily: FONT_STACK, fontWeight: 700, fontSize: 24, letterSpacing: 3, lineHeight: `${CHIP + 6}px` }}>{L.src}</div>
          ) : null}
          {L.rows.map((r, i) => (
            <div key={i} style={{ position: "absolute", left: PADX, top: PADY + (L.src ? CHIP + 22 : 6) + i * ROWH, fontFamily: FONT_STACK, fontWeight: 700, fontSize: EN ? 34 : ZH, letterSpacing: LS, lineHeight: 1, color: SC.ink, whiteSpace: "nowrap", marginLeft: OPEN.includes([...r][0]) ? -ZH / 2 : 0 }}>{r}</div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};
