// hud/caption.tsx: THE SUBTITLES of the Newton film (PLAN.md section 5; WP4). A pure function of the frame.
//   <Caption f />            the caption group of captions.ts on frame f (one SCREEN of the lines file at a time)
//   <Caption f cap={...} />  draw a given { zh, en, who } instead (previews, tests; full opacity)
// The look: the bottom band, NOTHING behind the words (no box, no plate, no scrim). CHINESE LARGE (66 px, bold) on one
// row, centred on y 1318; ENGLISH SMALL (36 px) under it ONLY for lines spoken in English (enShown), one row, or two balanced rows when it is wider than the safe
// area. Both in the SPEAKER'S TINT (记者 ji warm white, Newton nt pale gold, Humphrey hm white) over a dark warm ink
// line drawn as its own layer UNDER the fills (Chinese 5.5 px, English a thinner 3.5 px so it reads lighter), a hard
// little drop and a soft shadow. The block stays inside y 1270-1460 (CAP_BAND 1250-1500): the mic's head stops above
// y 1190 and faces sit in the upper third.
// Width: the safe area is x 50..925 (Douyin's button rail is right of x 930 below y 900), so a row CENTRED on x 540
// may be 770 px wide: up to 11 characters at 66 px. A 12-13 character row shrinks (to 60 px at most) so it stays
// centred over the English; wider than that (up to the lines file's 16) it slides left only as far as it must and
// shrinks to fit on ONE row (16 characters = 53 px). Optical centring: a trailing full-width mark counts half. Two
// trailing marks in a row (「？！」) are set tight: the first is pulled back half an em (its own blank half would show as
// a gap) and only the last one's half em counts as blank.
// More than 16 characters (not in the lines file) falls back to two balanced rows.
// English wider than 800 px breaks into two balanced rows (so it stays centred instead of sliding off the rail).
// Motion: fades in over 3 frames where a run of captions starts and out over 3 frames where it ends; between two
// screens that follow each other frame to frame it switches clean (a fade there would blink). Line 01's screen is
// already up on frame 0 (PLAN 7 A1), whatever frame the timing gives it.
import React from "react";
import { AbsoluteFill } from "remotion";
import { useOverlayFont } from "../../group/kit/overlay";
import type { Speaker } from "../voice";
import { CAPTIONS, captionAt, captionRuns, TRAILING_PUNCT, type CaptionGroup } from "../captions";
import { FONT_STACK, HC, SAFE, textW, enWrap, type Rect } from "./style";

/** each speaker's tint */
export const SPEAKER_COL: Record<Speaker, string> = { ji: HC.warm, nt: HC.goldPale, hm: HC.white };
/** the Chinese row's size (px) and the most characters it takes at that size */
export const ZH_PX = 66, EN_PX = 36;
/** a long Chinese row shrinks (to stay centred) down to this size before it slides left of the centre */
export const ZH_MIN = 60;
/** the most characters in one Chinese row (the lines file's longest allowed screen) */
export const CAP_ROW = 16;
/** the Chinese row's centre y, the English rows' first centre and their step (px) */
export const ZH_Y = 1318, EN_Y0 = ZH_Y + ZH_PX / 2 + 14 + EN_PX / 2, EN_STEP = Math.round(EN_PX * 1.24);
/** the band the subtitles own (layout.ts SCREEN.capTop / capBottom should match: keep faces and the mic out) */
export const CAP_BAND: Rect = { x0: SAFE.left, y0: 1250, x1: SAFE.right, y1: 1500 };
const LS_ZH = 1, LS_EN = 0.4, FADE = 3;
/** the widest English row (px): wider than this and it breaks into two balanced rows (keeps it centred) */
const EN_ROW_W = 800;
const inkZh = (px: number) => Math.round(px * 0.17), inkEn = (px: number) => Math.max(5, Math.round(px * 0.2));
const LEAD_PUNCT = "“‘（《「";
const STRONG = "。！？；…", WEAK = "，、：—";

/** the rows of a Chinese screen: one row up to CAP_ROW characters, else the most balanced split at a mark */
export const capRows = (plain: string): string[] => {
  const cs = [...plain];
  if (cs.length <= CAP_ROW) return [plain];
  let best = Math.ceil(cs.length / 2), bestCost = Infinity;
  for (let i = 1; i < cs.length - 1; i++) {
    const a = i + 1, b = cs.length - a;
    if (a > CAP_ROW || b > CAP_ROW) continue;
    if (TRAILING_PUNCT.includes(cs[i + 1]) || "…—".includes(cs[i + 1])) continue;
    const cost = Math.abs(a - b) + (STRONG.includes(cs[i]) ? -4 : WEAK.includes(cs[i]) ? -2 : 3);
    if (cost < bestCost) { bestCost = cost; best = a; }
  }
  return [cs.slice(0, best).join(""), cs.slice(best).join("")];
};
/** a full-width mark pulled back half an em: a trailing mark followed by another one (「？！」: the ？ keeps only its glyph) */
const PULL = 0.5;
const pulledAt = (cs: string[], i: number) => i + 1 < cs.length && TRAILING_PUNCT.includes(cs[i]) && TRAILING_PUNCT.includes(cs[i + 1]);
const pulls = (row: string) => { const cs = [...row]; return cs.filter((_, i) => pulledAt(cs, i)).length; };
/** a Chinese row's width in px as drawn (the pulled marks half an em narrower) */
const zhW = (row: string, px: number, ls: number) => textW(row, px, ls) - pulls(row) * PULL * px;
/** the optical blank of a Chinese row (em): half an em for its trailing full-width mark(s) (the pulled ones have none),
 *  half an em per leading one */
const blanks = (row: string) => {
  const cs = [...row];
  let l = 0;
  const r = cs.length && TRAILING_PUNCT.includes(cs[cs.length - 1]) ? 0.5 : 0;
  for (let i = 0; i < cs.length && LEAD_PUNCT.includes(cs[i]); i++) l += 0.5;
  return { r, l };
};
/** characters [from, to) of a Chinese row as drawn: each pulled mark half an em narrower (ink layer and fill alike) */
const kern = (row: string, from = 0, to = [...row].length): React.ReactNode => {
  const cs = [...row], out: React.ReactNode[] = [];
  let buf = "";
  for (let i = from; i < to; i++) {
    if (!pulledAt(cs, i)) { buf += cs[i]; continue; }
    if (buf) out.push(buf);
    buf = "";
    out.push(<span key={i} style={{ marginRight: `-${PULL}em` }}>{cs[i]}</span>);
  }
  if (buf) out.push(buf);
  return out.length === 1 && typeof out[0] === "string" ? out[0] : out;
};

/** what a caption looks like on screen: each row (text, px, centre x / y, its visible box) */
export type CapRowLayout = { text: string; zh: boolean; px: number; x: number; y: number; box: Rect };
export type CapLayout = { rows: CapRowLayout[]; box: Rect };
/** lay out a screen: Chinese row(s) at ZH_PX (shrunk to fit), English row(s) under them; every row kept in SAFE */
export const capLayout = (zh: string, en: string): CapLayout => {
  const room = SAFE.right - SAFE.left;
  const plain = zh.replace(/[【】]/g, "").trim();
  const zRows = plain ? capRows(plain) : [];
  // one size for the Chinese rows: ZH_PX, or what makes the widest (visible) row fit the room
  // (a row stays CENTRED: it shrinks to the width that clears the rail from x 540, down to ZH_MIN; only below that does
  // it slide left, and it shrinks further only if it still does not fit the safe area)
  let zpx = ZH_PX;
  for (const r of zRows) {
    const b = blanks(r), w = zhW(r, 1, 0) - b.r - b.l, ink = inkZh(ZH_PX), ls = LS_ZH * ([...r].length - 1);
    const centred = Math.floor((2 * (SAFE.right - 540) - ink - ls) / w), fits = Math.floor((room - ink - ls) / w);
    zpx = Math.min(zpx, Math.max(centred, Math.min(ZH_MIN, fits)));
  }
  const rows: CapRowLayout[] = [];
  const place = (text: string, zhRow: boolean, px: number, y: number) => {
    const ls = zhRow ? LS_ZH : LS_EN, w = zhRow ? zhW(text, px, ls) : textW(text, px, ls), out = (zhRow ? inkZh(px) : inkEn(px)) / 2;
    const b = zhRow ? blanks(text) : { r: 0, l: 0 };
    const opt = ((b.r - b.l) / 2) * px;                                 // optical centring
    let x = 540 + opt;
    const vis = () => ({ x0: x - w / 2 + b.l * px - out, x1: x + w / 2 - b.r * px + out });
    if (vis().x1 > SAFE.right) x -= vis().x1 - SAFE.right;            // slide left of the rail
    if (vis().x0 < SAFE.left) x += SAFE.left - vis().x0;
    const v = vis(), hh = px / 2 + out + 2;
    rows.push({ text, zh: zhRow, px, x, y, box: { x0: Math.floor(v.x0), y0: Math.floor(y - hh), x1: Math.ceil(v.x1), y1: Math.ceil(y + hh + px * 0.08) } });
  };
  const zStep = Math.round(zpx * 1.22);
  const zTop = ZH_Y - ((zRows.length - 1) * zStep) / 2 - (zRows.length > 1 ? zStep / 2 : 0);
  zRows.forEach((r, i) => place(r, true, zpx, Math.round(zRows.length > 1 ? zTop + i * zStep : ZH_Y)));
  // English: one row while it stays (nearly) centred left of the rail, else two balanced rows
  const eRows = en.trim() ? enWrap(en, EN_PX, Math.min(room - inkEn(EN_PX), EN_ROW_W), LS_EN) : [];
  const ey0 = zRows.length ? (zRows.length > 1 ? rows[rows.length - 1].y + zpx / 2 + 14 + EN_PX / 2 : EN_Y0) : ZH_Y;
  eRows.forEach((r, i) => place(r, false, EN_PX, Math.round(ey0 + i * EN_STEP)));
  const box = rows.length
    ? { x0: Math.min(...rows.map((r) => r.box.x0)), y0: Math.min(...rows.map((r) => r.box.y0)), x1: Math.max(...rows.map((r) => r.box.x1)), y1: Math.max(...rows.map((r) => r.box.y1)) }
    : { x0: 540, y0: ZH_Y, x1: 540, y1: ZH_Y };
  return { rows, box };
};

/** the screen shown on frame f (line 01's is already up before its first word: PLAN 7 A1) */
export const capOn = (f: number): CaptionGroup | null => captionAt(f) ?? (CAPTIONS.length && f >= 0 && f < CAPTIONS[0].from ? CAPTIONS[0] : null);
/** the caption's opacity on frame f (0 when none): 3-frame fades where a run of screens starts / ends */
export const capAlpha = (f: number): number => {
  const c = capOn(f);
  if (!c) return 0;
  const i = CAPTIONS.indexOf(c), prev = CAPTIONS[i - 1], next = CAPTIONS[i + 1];
  const joinedIn = i === 0 || (prev && prev.to + 1 >= c.from), joinedOut = next && c.to + 1 >= next.from;
  const kin = joinedIn ? 1 : Math.min(1, (f - c.from + 1) / FADE), kout = joinedOut ? 1 : Math.min(1, (c.to - f + 1) / FADE);
  return Math.max(0, Math.min(kin, kout));
};

const Row: React.FC<{ r: CapRowLayout; color: string; runs: { text: string; gold: boolean }[] }> = ({ r, color, runs }) => {
  const line = r.zh ? inkZh(r.px) : inkEn(r.px);
  const text: React.CSSProperties = { fontFamily: FONT_STACK, fontWeight: 700, fontSize: r.px, lineHeight: 1, letterSpacing: r.zh ? LS_ZH : LS_EN, whiteSpace: "pre" };
  const drop = Math.max(2, Math.round(r.px * 0.05)), soft = Math.round(r.px * 0.28);
  const under: React.CSSProperties = {
    color: HC.ink, WebkitTextStroke: `${line}px ${HC.ink}`,
    textShadow: `0 ${drop}px 0 rgba(10,6,4,0.45), 0 ${drop + 2}px ${soft}px rgba(10,6,4,0.55)`,
  } as React.CSSProperties;
  const fill = color;
  const all = r.zh ? kern(r.text) : r.text;
  let at = 0;
  const part = (s: string) => { const n = [...s].length, node = r.zh ? kern(r.text, at, at + n) : s; at += n; return node; };
  return (
    <div style={{ position: "absolute", left: r.x, top: r.y, transform: "translate(-50%, -50%)", ...text }}>
      <span style={under}>{all}</span>
      <span style={{ position: "absolute", left: 0, top: 0, color: fill, opacity: r.zh ? 1 : 0.96 }}>
        {runs.length > 1 || runs[0]?.gold ? runs.map((u, i) => <span key={i} style={{ color: u.gold ? HC.gold : fill }}>{part(u.text)}</span>) : all}
      </span>
    </div>
  );
};

/** the gold runs of a Chinese row cut out of the screen's runs (rows are character spans of the plain text) */
const rowRuns = (zh: string, rows: string[]): { text: string; gold: boolean }[][] => {
  const runs = captionRuns(zh), out: { text: string; gold: boolean }[][] = rows.map(() => []);
  let r = 0, left = [...(rows[0] ?? "")].length;
  for (const u of runs) {
    let cs = [...u.text];
    while (cs.length && r < rows.length) {
      const take = Math.min(left, cs.length);
      if (take > 0) out[r].push({ text: cs.slice(0, take).join(""), gold: u.gold });
      cs = cs.slice(take); left -= take;
      if (left === 0) { r++; left = [...(rows[r] ?? "")].length; }
    }
  }
  return out;
};

/** the English row is shown ONLY when the line is spoken in a language other than Chinese (Jay, 14 Nov: a foreign-language
 *  subtitle only when the character speaks a different language): Newton and Humphrey (English) get Chinese large +
 *  English small; the reporter's Chinese lines get the Chinese row alone. A given cap (previews) keeps its English. */
export const enShown = (c: { en: string; spoken?: "zh" | "en" }): string => (c.spoken === "zh" ? "" : c.en);

export const Caption: React.FC<{ f: number; cap?: { zh: string; en: string; who: Speaker } }> = ({ f, cap }) => {
  useOverlayFont();
  const c = cap ?? capOn(f);
  if (!c) return null;
  const o = cap ? 1 : capAlpha(f);
  if (o <= 0) return null;
  const L = capLayout(c.zh, enShown(c));
  const zRows = L.rows.filter((r) => r.zh);
  const runs = rowRuns(c.zh.trim(), zRows.map((r) => r.text));
  const color = SPEAKER_COL[c.who] ?? HC.white;
  let zi = 0;
  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity: o }}>
      {L.rows.map((r, i) => <Row key={i} r={r} color={color} runs={r.zh ? runs[zi++] ?? [] : [{ text: r.text, gold: false }]} />)}
    </AbsoluteFill>
  );
};
