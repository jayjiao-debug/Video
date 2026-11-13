// hud/card.tsx: THE FACT CARDS of the Qin film (PLAN.md sections 5 and 7; WP4). A pure function of the frame.
//   <FactCard f />   the card of story.ts CARDS on frame f (from its line's end, for the line's "after" seconds)
// The look: a clean off-white paper card with the film's ink line round it, rounded, tilted -1.2 deg, in the upper
// middle (centred, as wide as its rows need, 640-900 px, from y 316; at most 244 px tall, so it ends by y 560:
// layout.ts SCREEN.card). A red 「史记」 seal is
// stamped over its top right corner (Chinese in both languages, as Wanbi's seals). The text (46 px, English 34 px) is the
// card's words WITHOUT the 「史记：」 lead (the seal says it), in at most two rows broken at the best punctuation; numbers in
// seal red. Under it, small and right-aligned: 「—— 史记·秦始皇本纪」, plus the card's own note when its text ends in one
// (B04's 「据当时方士所说」). Motion: slides down and scales in over 8 frames (a little overshoot), the seal lands on
// frame 5, the card floats 2 px, and it slides up and fades over its last 6 frames.
//   factCardAt(f)     the card on frame f (or null);  factParts(card)  { body, note } as drawn
//   factRows(s, max)  the two-row break (null: let the browser wrap);  FACT_RECT  the box it takes
import React from "react";
import { AbsoluteFill } from "remotion";
import { CARDS, clamp01, easeInCubic, easeOutBack, easeOutCubic, type Card } from "../story";
import { SCREEN } from "../layout";
import { EN, TXT } from "../lang";
import { sealNodes, stampLayout } from "../../wanbi/hud/stamp";
import { FONT_STACK, HC, em, type Rect } from "./style";

/** the card on frame f (story.ts CARDS), or null */
export const factCardAt = (f: number): Card | null => CARDS.find((c) => f >= c.from && f <= c.to) ?? null;

// ---------------------------------------------------------------------------------------------------- the words
/** the card's words as drawn: the 「史记：」 / "Records…:" lead dropped (the seal and the source line say it), a closing
 *  note in brackets moved to the source line */
export const factParts = (c: Pick<Card, "text">): { body: string; note: string } => {
  let body = c.text.trim(), note = "";
  if (EN) {
    body = body.replace(/^Records( of the Grand Historian)?\s*:\s*/i, "");
    const m = body.match(/\s*\(([^()]+)\)(\.?)$/);
    if (m) { note = m[1]; body = body.slice(0, m.index) + m[2]; }
    body = body.charAt(0).toUpperCase() + body.slice(1);
  } else {
    body = body.replace(/^史记\s*[：:]\s*/, "");
    const m = body.match(/[（(]([^（）()]+)[）)]$/);
    if (m) { note = m[1]; body = body.slice(0, m.index); }
  }
  return { body, note };
};
const STRONG = "。！？；", WEAK = "，、：", OPEN = "（《「“‘", NO_START = "，。！？；：、）》」”’…—";
/** the best break of a Chinese text into two rows of at most `max` em: after a sentence mark (。！？) if it can, else
 *  after a comma, else before an opening bracket; never inside a run of digits / letters, never a row starting with a
 *  closing mark. One row when it fits; null when no two-row break fits (the browser wraps it). */
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
/** the numbers in a row, in seal red: 二百七十座 / 约30公斤 / 三千 / 二十天; English 270 / 30 kg / 3,000 / twenty days */
const NUM = EN ? /\d[\d,.]*(?:\s?kg)?|twenty days/gi : /约?(?:\d+|[一二三四五六七八九十百千万两]{2,})(?:公斤|座|天|个|名|人|年)?/g;
const withNumbers = (row: string, key: string): React.ReactNode[] => {
  const out: React.ReactNode[] = [];
  let i = 0, k = 0;
  for (const m of row.matchAll(NUM)) {
    const at = m.index ?? 0;
    if (at > i) out.push(row.slice(i, at));
    out.push(<span key={`${key}n${k++}`} style={{ color: HC.seal }}>{m[0]}</span>);
    i = at + m[0].length;
  }
  if (i < row.length) out.push(row.slice(i));
  return out;
};

// ---------------------------------------------------------------------------------------------------- the card
const Z = SCREEN.card, TOP = Z.y0 + 16, MAXW = Z.x1 - Z.x0, MINW = 640;
const BORDER = 4, PADX = 46, PX = EN ? 34 : 46, LS = EN ? 0 : 1, LH = EN ? 1.34 : 1.42, SUB = EN ? 24 : 28;
const MAX_EM = (MAXW - 2 * BORDER - 2 * PADX) / (PX + LS);
const TILT = -1.2, NIN = 8, NOUT = 6;
/** the box the card takes while it shows (at its widest; its tilt and the seal included) */
export const FACT_RECT: Rect = { x0: Z.x0 - 6, y0: TOP - 40, x1: Z.x1 + 6, y1: Z.y1 + 4 };
const SEAL = stampLayout({ text: "史记", size: 30, gloss: false });
/** the source line under a card's words */
const sourceLine = (note: string) => `—— ${TXT.source}${note ? ` · ${note}` : ""}`;
/** the card's width: it hugs its rows (Chinese) between MINW and the zone's width, centred on the frame */
const cardW = (rows: string[] | null, note: string) => {
  if (!rows) return MAXW;
  const inner = Math.max(...rows.map((r) => em(r) * (PX + LS) - (OPEN.includes([...r][0]) ? PX / 2 : 0)), em(sourceLine(note)) * SUB);
  return Math.round(Math.min(MAXW, Math.max(MINW, inner + 2 * PADX + 2 * BORDER + 12)));
};

export const FactCard: React.FC<{ f: number }> = ({ f }) => {
  const c = factCardAt(f);
  if (!c) return null;
  const t = f - c.from;
  const kin = easeOutCubic((t + 1) / NIN), kb = easeOutBack((t + 1) / NIN, 1.6);
  const u = easeInCubic((f - (c.to - NOUT)) / NOUT);                               // the leave: 0 .. 1 on the last frame
  const op = clamp01((t + 1) / 4) * (1 - u);
  const float = 2 * Math.sin((2 * Math.PI * t) / 96);
  const dy = -34 * (1 - kin) - 22 * u + float, s = (0.9 + 0.1 * kb) * (1 - 0.04 * u), rot = TILT - 2.2 * (1 - kin);
  const { body, note } = factParts(c);
  const rows = EN ? null : factRows(body, MAX_EM);
  const WIDTH = cardW(rows, note), LEFT = 540 - WIDTH / 2;
  // the seal: lands on frame 5 (large over 2 frames, a squash, rest), turned 8 deg
  const st = t - 5, ss = st < 0 ? 0 : st === 0 ? 1.6 : st === 1 ? 1.22 : st === 2 ? 0.94 : st === 3 ? 1.03 : 1;
  const text: React.CSSProperties = { fontFamily: FONT_STACK, fontWeight: 700, fontSize: PX, lineHeight: LH, letterSpacing: LS, color: HC.paperInk };
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: LEFT, top: TOP, width: WIDTH, opacity: op, transform: `translateY(${dy.toFixed(2)}px) rotate(${rot.toFixed(3)}deg) scale(${s.toFixed(4)})`, transformOrigin: "50% 0%" }}>
        <div style={{ position: "relative", boxSizing: "border-box", width: WIDTH, padding: `28px ${PADX}px 22px`, borderRadius: 24, border: `${BORDER}px solid ${HC.ink}`,
          background: `linear-gradient(172deg, ${HC.paper} 0%, #f8f0de 55%, ${HC.paperLow} 100%)`, boxShadow: "0 14px 26px rgba(10,8,6,0.34), 0 4px 0 rgba(10,8,6,0.22)" }}>
          <div style={{ position: "absolute", left: 10, top: 10, right: 10, bottom: 10, borderRadius: 16, border: `2px solid ${HC.paperRule}` }} />
          {rows
            ? rows.map((r, i) => <div key={i} style={{ ...text, whiteSpace: "nowrap", marginLeft: OPEN.includes([...r][0]) ? -PX / 2 : 0 }}>{withNumbers(r, `r${i}`)}</div>)
            : <div style={{ ...text, wordBreak: EN ? "normal" : "break-all", lineBreak: "strict" } as React.CSSProperties}>{withNumbers(body, "b")}</div>}
          <div style={{ marginTop: 8, fontFamily: FONT_STACK, fontWeight: 700, fontSize: SUB, lineHeight: 1.2, color: HC.paperSub, textAlign: "right", whiteSpace: "nowrap" }}>
            {sourceLine(note)}
          </div>
        </div>
        {ss > 0 ? (
          <svg width={2} height={2} viewBox="0 0 2 2" style={{ position: "absolute", left: WIDTH - 64, top: 2, overflow: "visible" }}>
            <g transform={`rotate(8) scale(${ss.toFixed(3)})`}>{sealNodes(SEAL)}</g>
          </svg>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};
