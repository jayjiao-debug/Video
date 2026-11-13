// hud/caption.tsx: THE CAPTION of the Qin film (PLAN.md section 5; WP1's version restyled by WP4).
// Every spoken line, group by group (captions.ts; the generator cuts a group at punctuation, at most 14 characters), in
// the caption band (centre y 70 % = 1344, band 1190-1498), in the SPEAKER'S COLOUR: 小记者 (ji) warm white, 秦始皇 (di)
// pale gold, everyone else white. NOTHING behind it (no box, no plate, no scrim): the words carry a thick ink line drawn
// as a layer of its own UNDER the fills, a hard little drop and a soft dark shadow.
// Size by length: up to 9 characters 72 px, 10-11 68 px, 12 64 px, 13-14 60 px. At most 14 characters a row and two
// rows (a longer group is split at its best mark into two balanced rows). DOUYIN SAFE: a row never reaches past
// x 925 (the app's button rail is right of x 930 below y 900) nor left of x 50: a long row slides left from the centre
// as far as it must, and shrinks only if it still does not fit.
// A small pop-in per group (none on a group that starts on frame 0). Gold 【key words】 (captions.ts captionRuns) punch on
// their first syllable. English: captions_en.ts (its own px; wrapped into two balanced rows when it is too wide).
// Optical centring: full-width marks carry half an em of blank on one side; a row is shifted by half the difference.
import React from "react";
import { AbsoluteFill } from "remotion";
import { COL, useOverlayFont } from "../../group/kit/overlay";
import { CAPTION_Y, clamp01, easeOutBack, type Speaker } from "../story";
import { captionAt, captionRuns, TRAILING_PUNCT } from "../captions";
import { captionAtEN } from "../captions_en";
import { EN } from "../lang";
import { FONT_STACK, HC, SAFE, textW } from "./style";

/** each speaker's caption colour */
export const SPEAKER_COL: Record<Speaker, string> = { ji: HC.warm, di: HC.goldPale, xufu: HC.white, boshi: HC.white, huanguan: HC.white };
const LEAD_PUNCT = "“‘（《「";
const STRONG = "。！？；…", WEAK = "，、：—";
/** the caption's px for a row of n characters */
export const capPx = (n: number) => (n <= 9 ? 72 : n <= 11 ? 68 : n <= 12 ? 64 : 60);
/** most characters in a row */
export const CAP_ROW = 14;
const LS_ZH = 2, LS_EN = 0.5;
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
/** the runs of each row (rows are cut at character positions of the plain text; `skip` characters dropped at each cut,
 *  1 for the space between two English rows); each part keeps the index of the run it came from (its bump) */
type Part = Run & { src: number };
const splitRuns = (runs: Run[], rows: string[], skip: number): Part[][] => {
  const out: Part[][] = rows.map(() => []);
  let r = 0, left = [...rows[0]].length, drop = 0;
  runs.forEach((run, src) => {
    let cs = [...run.text];
    while (cs.length) {
      if (drop > 0) { const d = Math.min(drop, cs.length); cs = cs.slice(d); drop -= d; continue; }
      if (left === 0 && r < rows.length - 1) { r++; left = [...rows[r]].length; drop = skip; continue; }
      const take = r === rows.length - 1 ? cs.length : Math.min(left, cs.length);
      out[r].push({ text: cs.slice(0, take).join(""), gold: run.gold, src });
      cs = cs.slice(take); left -= take;
    }
  });
  return out;
};
/** an English group in two rows split at the space that makes the wider row narrowest */
const enRows = (s: string, px: number): string[] => {
  let best: string[] = [s], bestW = Infinity;
  for (let i = s.indexOf(" "); i > 0; i = s.indexOf(" ", i + 1)) {
    const a = s.slice(0, i), b = s.slice(i + 1), w = Math.max(textW(a, px, LS_EN), textW(b, px, LS_EN));
    if (w < bestW) { bestW = w; best = [a, b]; }
  }
  return best;
};
/** the optical blank of a Chinese row (em): half an em per trailing / leading full-width mark */
const blanks = (row: string) => {
  const cs = [...row];
  let r = 0, l = 0;
  for (let i = cs.length - 1; i >= 0 && TRAILING_PUNCT.includes(cs[i]); i--) r += 0.5;
  for (let i = 0; i < cs.length && LEAD_PUNCT.includes(cs[i]); i++) l += 0.5;
  return { r, l };
};

const CapRow: React.FC<{ runs: Run[]; px: number; bumps: number[]; en: boolean; color: string; dx: number; y: number }> = ({ runs, px, bumps, en, color, dx, y }) => {
  const text: React.CSSProperties = { fontFamily: FONT_STACK, fontWeight: 700, fontSize: px, lineHeight: 1, letterSpacing: en ? LS_EN : LS_ZH, whiteSpace: en ? "pre" : "nowrap" };
  const line = inkW(px);
  const under: React.CSSProperties = { color: HC.ink, WebkitTextStroke: `${line}px ${HC.ink}`, textShadow: `0 ${Math.round(px * 0.06)}px 0 rgba(8,8,16,0.5), 0 ${Math.round(px * 0.08)}px ${Math.round(px * 0.3)}px rgba(8,8,16,0.5)` } as React.CSSProperties;
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

export const Caption: React.FC<{ f: number }> = ({ f }) => {
  useOverlayFont();
  const en = EN ? captionAtEN(f) : null;
  const c = EN ? en : captionAt(f);
  if (!c) return null;
  const k = c.from === 0 ? 1 : clamp01((f - c.from + 1) / 5);
  const s = c.from === 0 ? 1 : 0.86 + 0.14 * easeOutBack(k, 2.2), o = c.from === 0 ? 1 : clamp01((f - c.from + 1) / 2.5);
  const plain = c.text.replace(/[【】]/g, ""), len = [...plain].length;
  const runs = captionRuns(c.text);
  // rows and size
  const room = SAFE.right - SAFE.left;
  let rows: string[], px: number;
  if (en) {
    px = en.px;
    rows = textW(plain, px, LS_EN) + 2 * inkW(px) <= room ? [plain] : enRows(plain, px);
  } else {
    rows = capRows(plain);
    px = capPx(Math.max(...rows.map((r) => [...r].length)));
  }
  const ls = en ? LS_EN : LS_ZH;
  const widest = Math.max(...rows.map((r) => textW(r, px, ls)));
  if (widest + 2 * inkW(px) > room) px = Math.floor((px * (room - 2 * inkW(px))) / widest);
  const rowRuns = rows.length > 1 ? splitRuns(runs, rows, en ? 1 : 0) : [runs.map((r, src) => ({ ...r, src }))];
  // the syllable bumps of the gold words (per run of the whole group; a run split across rows bumps on both halves)
  let pos = 0;
  const bumps = runs.map((r) => {
    const at = c.from + Math.round((pos / Math.max(1, len)) * (c.end - c.from)); pos += [...r.text].length;
    const amp = en ? Math.max(0.05, 0.13 * Math.min(1, 4 / Math.max(1, [...r.text.trim()].length))) : 0.13;
    return r.gold && f >= at && f < at + 5 ? 1 + amp * (1 - (f - at) / 5) : 1;
  });
  const color = SPEAKER_COL[c.who] ?? HC.white;
  const gap = Math.round(px * 1.28);
  const y0 = -((rows.length - 1) * gap) / 2;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: 540, top: CAPTION_Y, width: 0, height: 0, opacity: o, transform: `scale(${s})`, transformOrigin: "0 0" }}>
        {rows.map((row, i) => {
          const w = textW(row, px, ls), half = w / 2 + inkW(px);
          const b = en ? { r: 0, l: 0 } : blanks(row);
          const opt = ((b.r - b.l) / 2) * px;
          // the row's centre: 540 (+ the optical shift), slid left so its right edge stays left of the rail
          const vis = { x0: 540 + opt - half + b.l * px, x1: 540 + opt + half - b.r * px };
          const push = Math.min(0, SAFE.right - vis.x1) + Math.max(0, SAFE.left - (vis.x0 + Math.min(0, SAFE.right - vis.x1)));
          const parts = rowRuns[i] ?? [];
          return <CapRow key={i} runs={parts} bumps={parts.map((p) => bumps[p.src] ?? 1)} px={px} en={!!en} color={color} dx={opt + push} y={y0 + i * gap} />;
        })}
      </div>
    </AbsoluteFill>
  );
};
