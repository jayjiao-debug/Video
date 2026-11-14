// hud/caption.tsx: THE CAPTION of the Su film (PLAN.md section 6; WP1). Every spoken line, group by group (captions.ts:
// the generator cuts a group at punctuation, at most 16 characters), BIG CHINESE in the speaker's colour (记者 ji warm
// white, 苏东坡 su pale gold, 苏过 guo and 差役 chai white) and UNDER IT THE LINE'S ENGLISH (voice.ts LINE_EN via
// story.ts lineEn) small, light grey-white with a thin ink line, at most two balanced rows; the English of the whole
// line stays up (steady, no pop) while any of its Chinese groups shows. NOTHING behind the words (no box, no plate, no
// scrim): a thick ink line drawn as a layer of its own UNDER the fills, a hard little drop and a soft dark shadow.
// Chinese size by the row's length: up to 9 characters 72 px, 10-11 68, 12-13 64, 14-15 60, 16 56 (shrunk further only
// if it would cross the rail). One row up to CAP_ROW (16) characters, else two balanced rows. The pair stays inside
// x 50-925 (Douyin rail) and the band y 1190-1520. A small pop-in per Chinese group (none on a group that starts on
// frame 0). Gold 【key words】 (captions.ts captionRuns) punch on their first syllable.
// The ending's line (I57, 黄州，惠州，儋州) is NOT captioned here: hud/endnames.tsx draws the three names (END_LINE).
// English version (input prop lang "en"): the line's English is the caption (bigger, up to three rows), no Chinese;
// once captions_en.ts carries a real English dialogue (QUOTE_RAW_EN), its groups are used instead.
import React from "react";
import { AbsoluteFill } from "remotion";
import { COL, useOverlayFont } from "../../group/kit/overlay";
import { CAPTION_Y, clamp01, easeOutBack, lineEn, capsOf, type Speaker } from "../story";
import { captionAt, captionRuns, TRAILING_PUNCT, type CaptionGroup } from "../captions";
import { captionAtEN, QUOTE_RAW_EN } from "../captions_en";
import { EN } from "../lang";
import { FONT_STACK, HC, SAFE, textW } from "./style";
/** LIBAI: no line is drawn by an end-names layer */
const END_LINE = -1;

/** each speaker's caption colour */
export const SPEAKER_COL: Record<Speaker, string> = { ji: HC.warm, li: HC.goldPale, huan: HC.white, you: HC.white };
const LEAD_PUNCT = "“‘（《「";
const STRONG = "。！？；…", WEAK = "，、：—";
/** the caption's px for a row of n characters */
export const capPx = (n: number) => (n <= 9 ? 72 : n <= 11 ? 68 : n <= 13 ? 64 : n <= 15 ? 60 : 56);
/** most characters in a row */
export const CAP_ROW = 16;
/** the English line under the Chinese: px, row gap, gap under the Chinese, most rows */
export const CAP_EN = { px: 34, gap: 42, top: 22, rows: 2 };
const LS_ZH = 2, LS_EN = 0.4;
const inkW = (px: number) => Math.round(px * 0.19);
type Run = { text: string; gold: boolean };

/** the rows of a Chinese group: one row up to CAP_ROW characters, else the most balanced split at a mark */
export const capRows = (plain: string): string[] => {
  const cs = [...plain];
  if (cs.length <= CAP_ROW) return [plain];
  let best = Math.ceil(cs.length / 2), bestCost = Infinity;
  for (let i = 1; i < cs.length - 1; i++) {
    const a = i + 1, b = cs.length - a;
    if (a > CAP_ROW || b > CAP_ROW) continue;
    const c = cs[i], nx = cs[i + 1];
    if (TRAILING_PUNCT.includes(nx) || "…—".includes(nx)) continue;
    const cost = Math.abs(a - b) + (STRONG.includes(c) ? -4 : WEAK.includes(c) ? -2 : 3);
    if (cost < bestCost) { bestCost = cost; best = a; }
  }
  return [cs.slice(0, best).join(""), cs.slice(best).join("")];
};
/** an English text in at most `max` balanced rows of at most `room` px at `px` (the rows minimise the widest one);
 *  returns the rows and the px (shrunk when even `max` rows do not fit) */
export const enRows = (s: string, px: number, room: number, max = 2): { rows: string[]; px: number } => {
  const words = s.split(/\s+/).filter(Boolean);
  const w = (r: string) => textW(r, px, LS_EN);
  if (w(s) <= room || words.length < 2) return { rows: [s], px: Math.min(px, (px * room) / Math.max(1, w(s))) };
  let best: string[] = [s], bestW = Infinity;
  const tryRows = (n: number) => {
    // all splits into n rows (n <= 3, a line has < 30 words: cheap)
    const rec = (i: number, k: number, acc: string[]) => {
      if (k === 1) { const rows = [...acc, words.slice(i).join(" ")], m = Math.max(...rows.map(w)); if (m < bestW) { bestW = m; best = rows; } return; }
      for (let j = i + 1; j <= words.length - k + 1; j++) rec(j, k - 1, [...acc, words.slice(i, j).join(" ")]);
    };
    rec(0, n, []);
  };
  for (let n = 2; n <= max && bestW > room; n++) tryRows(n);
  return { rows: best, px: bestW > room ? (px * room) / bestW : px };
};
/** the runs of each row (rows are cut at character positions of the plain text); each part keeps its run's index */
type Part = Run & { src: number };
const splitRuns = (runs: Run[], rows: string[]): Part[][] => {
  const out: Part[][] = rows.map(() => []);
  let r = 0, left = [...rows[0]].length;
  runs.forEach((run, src) => {
    let cs = [...run.text];
    while (cs.length) {
      if (left === 0 && r < rows.length - 1) { r++; left = [...rows[r]].length; continue; }
      const take = r === rows.length - 1 ? cs.length : Math.min(left, cs.length);
      out[r].push({ text: cs.slice(0, take).join(""), gold: run.gold, src });
      cs = cs.slice(take); left -= take;
    }
  });
  return out;
};
/** the optical blank of a Chinese row (em): half an em per trailing / leading full-width mark */
const blanks = (row: string) => {
  const cs = [...row];
  let r = 0, l = 0;
  for (let i = cs.length - 1; i >= 0 && TRAILING_PUNCT.includes(cs[i]); i--) r += 0.5;
  for (let i = 0; i < cs.length && LEAD_PUNCT.includes(cs[i]); i++) l += 0.5;
  return { r, l };
};
/** a row's centre x: 540 (+ its optical shift), slid left / right so it stays inside the safe rail */
const rowX = (w: number, line: number, b: { r: number; l: number }, px: number) => {
  const half = w / 2 + line, opt = ((b.r - b.l) / 2) * px;
  const x0 = 540 + opt - half + b.l * px, x1 = 540 + opt + half - b.r * px;
  const push = Math.min(0, SAFE.right - x1) + Math.max(0, SAFE.left - (x0 + Math.min(0, SAFE.right - x1)));
  return opt + push;
};

const CapRow: React.FC<{ runs: Run[]; px: number; bumps: number[]; en: boolean; color: string; dx: number; y: number; line?: number }> = ({ runs, px, bumps, en, color, dx, y, line }) => {
  const text: React.CSSProperties = { fontFamily: FONT_STACK, fontWeight: 700, fontSize: px, lineHeight: 1, letterSpacing: en ? LS_EN : LS_ZH, whiteSpace: en ? "pre" : "nowrap" };
  const lw = line ?? inkW(px);
  const under: React.CSSProperties = { color: HC.ink, WebkitTextStroke: `${lw}px ${HC.ink}`, textShadow: `0 ${Math.round(px * 0.06)}px 0 rgba(8,8,16,0.5), 0 ${Math.round(px * 0.08)}px ${Math.round(px * 0.3)}px rgba(8,8,16,0.5)` } as React.CSSProperties;
  const spans = (fill: boolean) => runs.map((r, i) => (
    <span key={i} style={{ display: "inline-block", transform: `scale(${bumps[i].toFixed(4)})`, transformOrigin: "50% 62%", color: fill ? (r.gold ? COL.gold : color) : undefined }}>{r.text}</span>
  ));
  return (
    <div style={{ position: "absolute", left: dx, top: y, transform: "translate(-50%, -50%)", ...text }}>
      <span style={under}>{spans(false)}</span>
      <span style={{ position: "absolute", left: 0, top: 0 }}>{spans(true)}</span>
    </div>
  );
};

/** the Chinese rows of a group: rows, px */
const zhLayout = (plain: string) => {
  const rows = capRows(plain);
  let px = capPx(Math.max(...rows.map((r) => [...r].length)));
  const room = SAFE.right - SAFE.left, widest = Math.max(...rows.map((r) => textW(r, px, LS_ZH)));
  if (widest + 2 * inkW(px) > room) px = Math.floor((px * (room - 2 * inkW(px))) / widest);
  return { rows, px };
};
/** THE CAPTION'S BOX on frame f (px), or null: a shot can keep a face (or the mic) out of it */
export const captionRect = (f: number): { x0: number; y0: number; x1: number; y1: number } | null => {
  const c = captionAt(f);
  if (!c || c.line === END_LINE) return null;
  return { x0: SAFE.left, y0: 1190, x1: SAFE.right, y1: 1520 };
};

const ENGLISH_DUB = EN && QUOTE_RAW_EN.length > 0;

export const Caption: React.FC<{ f: number }> = ({ f }) => {
  useOverlayFont();
  const c: CaptionGroup | null = ENGLISH_DUB ? captionAtEN(f) : captionAt(f);
  if (!c || c.line === END_LINE) return null;
  const room = SAFE.right - SAFE.left;
  const first = capsOf(c.line)[0] ?? c;
  // the line's English: steady over all of the line's groups (its fade-in on the line's first frame only)
  const en = ENGLISH_DUB ? c.text : lineEn(c.line);
  const ko = first.from === 0 ? 1 : clamp01((f - first.from + 1) / 4);
  if (EN) {
    // the English version: the line's English is the caption itself (bigger), no Chinese
    const L = enRows(en, 50, room - 2 * inkW(50), 3), gap = Math.round(L.px * 1.24), y0 = CAPTION_Y + 20 - ((L.rows.length - 1) * gap) / 2;
    return (
      <AbsoluteFill style={{ pointerEvents: "none" }}>
        <div style={{ position: "absolute", left: 540, top: 0, width: 0, height: 0, opacity: ko }}>
          {L.rows.map((row, i) => <CapRow key={i} runs={[{ text: row, gold: false }]} bumps={[1]} px={L.px} en color={SPEAKER_COL[c.who] ?? HC.white} dx={rowX(textW(row, L.px, LS_EN), inkW(L.px), { r: 0, l: 0 }, L.px)} y={y0 + i * gap} />)}
        </div>
      </AbsoluteFill>
    );
  }
  // the Chinese group: its pop-in, its rows, its gold bumps
  const k = c.from === 0 ? 1 : clamp01((f - c.from + 1) / 5);
  const s = c.from === 0 ? 1 : 0.86 + 0.14 * easeOutBack(k, 2.2), o = c.from === 0 ? 1 : clamp01((f - c.from + 1) / 2.5);
  const plain = c.text.replace(/[【】]/g, ""), len = [...plain].length;
  const runs = captionRuns(c.text);
  const { rows, px } = zhLayout(plain);
  const rowRuns = rows.length > 1 ? splitRuns(runs, rows) : [runs.map((r, src) => ({ ...r, src }))];
  let pos = 0;
  const bumps = runs.map((r) => {
    const at = c.from + Math.round((pos / Math.max(1, len)) * (c.end - c.from)); pos += [...r.text].length;
    return r.gold && f >= at && f < at + 5 ? 1 + 0.13 * (1 - (f - at) / 5) : 1;
  });
  const color = SPEAKER_COL[c.who] ?? HC.white;
  const gap = Math.round(px * 1.28);
  // the block: Chinese rows centred round CAPTION_Y (moved up when the English takes two rows), the English under them
  const E = enRows(en, CAP_EN.px, room - 2 * 4, CAP_EN.rows);
  const enH = (E.rows.length - 1) * CAP_EN.gap + E.px;
  const zhH = (rows.length - 1) * gap + px;
  const top = Math.max(1190 + 4, Math.min(CAPTION_Y - zhH / 2, 1520 - 4 - (zhH + CAP_EN.top + enH)));
  const zy = top + px / 2, ey = top + zhH + CAP_EN.top + E.px / 2;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: 540, top: zy, width: 0, height: 0, opacity: o, transform: `scale(${s})`, transformOrigin: "0 0" }}>
        {rows.map((row, i) => {
          const parts = rowRuns[i] ?? [];
          return <CapRow key={i} runs={parts} bumps={parts.map((p) => bumps[p.src] ?? 1)} px={px} en={false} color={color} dx={rowX(textW(row, px, LS_ZH), inkW(px), blanks(row), px)} y={i * gap} />;
        })}
      </div>
      <div style={{ position: "absolute", left: 540, top: ey, width: 0, height: 0, opacity: ko }}>
        {E.rows.map((row, i) => <CapRow key={i} runs={[{ text: row, gold: false }]} bumps={[1]} px={E.px} en color={HC.enGrey} dx={rowX(textW(row, E.px, LS_EN), 4, { r: 0, l: 0 }, E.px)} y={i * CAP_EN.gap} line={Math.max(4, Math.round(E.px * 0.16))} />)}
      </div>
    </AbsoluteFill>
  );
};
