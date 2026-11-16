// hud/whisper.tsx: THE WHISPER on screen (whisper.ts has the list, the timing and the camera's lean): her aside in HER
// OWN BUBBLE marked 悄悄说, and the picture's edges darkening while she whispers. A pure function of the frame.
// Mounted ONCE by Film.tsx, right over the 3D picture and UNDER the HUD layer: the vignette darkens the picture only
// (her camera's REC / timestamp / battery stay crisp above it: the vlog UI is the film's identity, never dimmed); the
// bubble sits in the subtitle band, where no HUD box is. Film.tsx hides the normal subtitle on the line's frames
// (whisperCapAt): the bubble REPLACES it, never both. Pose.captions === false (and the nocap input prop) hide the bubble
// as they hide a subtitle; Pose.hud === false does not (a subtitle stays then too). The edges follow `noov`.
//   <Whisper f words edges />   words: draw the bubble; edges: draw the vignette
//   whisperLayout(screen, tune)   the bubble's geometry for one caption screen (px on 1080 x 1920)
//   whisperRectAt(f)              the box the bubble takes on frame f (hud/index.ts hudRectsAt: "whisper"), or null
// THE LOOK, in the vlog UI's skin (hud/vlog.tsx, hud/style.ts HC): one FrSans bold face; her speaker tint (HC.warm, the
// reporter's subtitle colour) is the bubble's paper, edged with the subtitles' warm ink line (HC.ink) and their hard
// little drop + soft shadow; her words in a dark warm brown, 58 px (a size under the 66 px dialogue: it is a whisper);
// the tag 悄悄说 in the REC lamp's red (her camera's colour) with an ink rim, sitting on the bubble's top edge; two small
// ink-rimmed dots trail from its lower left toward the bottom of the frame (toward her, behind the lens). No English
// row under her Chinese (her lines are spoken in Chinese: hud/caption.tsx enShown); a line spoken in English would get
// a small English row inside the bubble.
// THE PHONE-SAFE PLACE (style.ts FRAME, the kit's 9:16 caption band x 110-890, y 1270-1460): centred on x 540, slid
// left so its right edge stays left of x 886 (the app's buttons cover x >= 890 from y 1000); the body's bottom on
// y 1396 so the tail's last dot (and its drop) ends above y 1460 (the post's text covers x 58-805 from y 1505); one
// row: about y 1284-1396, the tag from about y 1263, in the subtitle band the camera plans already keep faces out of. A Chinese screen over 13 characters breaks into two rows
// (hud/caption.tsx capRows), the bubble growing upward. whisper.ts WHISPER_TUNE[id].x / .bottom move it for a framing.
// MOTION: it pops in on her first word (scale 0.82 -> 1 with a slight overshoot, opacity in 3 frames; fully in 5 frames
// later) from its tail; a second screen of the line (E07) fades in while the bubble's width eases to it (4 frames; the words clipped to the body); out
// over 4 frames (opacity, a 6 % shrink), ending 6 frames after her voice. The vignette: 6 frames in, 6 out.
import React from "react";
import { AbsoluteFill } from "remotion";
import { useOverlayFont } from "../../group/kit/overlay";
import { clamp01, easeOutBack, easeInOutCubic, type CaptionGroup } from "../story";
import { whisperBubble, whisperEdgeK, whisperTune, type WhisperBubble, type WhisperTune } from "../whisper";
import { capRows, enShown } from "./caption";
import { FONT_STACK, HC, SAFE, textW, enWrap, type Rect } from "./style";
import { TRAILING_PUNCT } from "../captions";

export { whisperCapAt, whisperAt, whisperLean, whisperLeanK, whisperEdgeK, whisperBubble, WHISPER_LINES, WHISPERS } from "../whisper";

/** the bubble's numbers (px) */
export const BUB = {
  /** her words: size (shrinks to minPx to fit), letter spacing, row step; the English row (English speech only) */
  px: 58, minPx: 48, ls: 2, step: 1.24, enPx: 30, enLs: 0.4,
  /** inside the ink rim, the rim, the corner radius of a two-row bubble (one row: a pill) */
  padX: 36, padY: 22, rim: 5, radius: 44,
  /** the default place: centre x, the body's bottom y (the lowest it may sit: the tail then ends above y 1460) */
  cx: 540, bottom: 1396,
  /** the tag 悄悄说 */
  tag: "悄悄说", tagPx: 26, tagLs: 2, tagPadX: 14, tagPadY: 7, tagRim: 4, tagDx: 28,
  /** the tail's two dots (radius, offset from the body's lower left / from the first dot) */
  dot1: { r: 13, dx: 84, dy: 21, rim: 4 }, dot2: { r: 8, dx: -25, dy: 25, rim: 3.5 },
  /** the drop under the body (hard) and the soft shadow's reach, both counted in the box */
  drop: 5, soft: 10,
} as const;
const INK_TEXT = "#2a1c12";
const RED = "linear-gradient(180deg, #ff6a50 0%, #e8402c 55%, #c8261a 100%)";
const PAPER = `linear-gradient(180deg, #fffaf1 0%, ${HC.warm} 55%, #fbe7c9 100%)`;
const SHADOW = `0 ${BUB.drop}px 0 rgba(10,6,4,0.45), 0 ${BUB.drop + 4}px 18px rgba(10,6,4,0.42)`;
/** THE EDGES: a soft warm-black vignette (HC.black), clear over the middle of the frame, darkest in the corners */
const VIGNETTE = "radial-gradient(ellipse 72% 58% at 50% 45%, rgba(20,13,9,0) 0%, rgba(20,13,9,0) 46%, rgba(20,13,9,0.36) 72%, rgba(20,13,9,0.72) 100%)";

/** the geometry of the bubble for one caption screen */
export type WhisperLayout = {
  rows: string[]; en: string[]; px: number;
  /** the body (outer edge of the ink rim) */
  x0: number; y0: number; w: number; h: number;
  /** the tag's box, the tail's dots (centre, radius), the whole box (rim, tag, tail, drop and shadow) */
  tag: { x0: number; y0: number; w: number; h: number };
  dots: { x: number; y: number; r: number; rim: number }[];
  box: Rect;
};
/** the optical blank of a row (em): half an em for a trailing full-width mark */
const blankR = (row: string) => { const cs = [...row]; return cs.length && TRAILING_PUNCT.includes(cs[cs.length - 1]) ? 0.5 : 0; };
const rowW = (row: string, px: number) => textW(row, px, BUB.ls) - blankR(row) * px;
/** the tag's box and the tail's dots for a body at (x0, y0), w x h */
const TAG_W = Math.ceil(textW(BUB.tag, BUB.tagPx, BUB.tagLs) + 2 * (BUB.tagPadX + BUB.tagRim)), TAG_H = BUB.tagPx + 2 * (BUB.tagPadY + BUB.tagRim);
const parts = (x0: number, y0: number, w: number, h: number) => {
  const d1 = { x: x0 + Math.max(60, Math.min(BUB.dot1.dx, w * 0.26)), y: y0 + h + BUB.dot1.dy, r: BUB.dot1.r, rim: BUB.dot1.rim };
  const d2 = { x: d1.x + BUB.dot2.dx, y: d1.y + BUB.dot2.dy, r: BUB.dot2.r, rim: BUB.dot2.rim };
  return { tag: { x0: x0 + BUB.tagDx, y0: Math.round(y0 + 2 - TAG_H / 2), w: TAG_W, h: TAG_H }, dots: [d1, d2] };
};
/** lay the bubble out for one screen (its Chinese, its English only when spoken in English) */
export const whisperLayout = (screen: Pick<CaptionGroup, "zh" | "en" | "spoken">, tune: WhisperTune = {}): WhisperLayout => {
  const plain = screen.zh.replace(/[【】]/g, "").trim();
  const rows = plain ? capRows(plain) : [];
  const room = SAFE.right - SAFE.left - 8 - 2 * (BUB.padX + BUB.rim);
  let px: number = BUB.px;
  for (const r of rows) {
    const em = textW(r, 1, 0) - blankR(r), ls = textW(r, 0, BUB.ls);           // the glyphs per px, the spacing (fixed)
    px = Math.min(px, Math.max(BUB.minPx, Math.floor((room - ls) / em)));
  }
  const enText = enShown(screen);
  const en = enText ? enWrap(enText, BUB.enPx, room, BUB.enLs) : [];
  const inner = Math.max(1, ...rows.map((r) => rowW(r, px)), ...en.map((r) => textW(r, BUB.enPx, BUB.enLs)));
  const textH = (rows.length ? px + (rows.length - 1) * Math.round(px * BUB.step) : 0) + (en.length ? 12 + en.length * Math.round(BUB.enPx * 1.25) : 0);
  const w = Math.ceil(inner + 2 * (BUB.padX + BUB.rim)), h = Math.ceil(textH + 2 * (BUB.padY + BUB.rim));
  let x0 = Math.round((tune.x ?? BUB.cx) - w / 2);
  if (x0 + w > SAFE.right - 4) x0 = SAFE.right - 4 - w;
  if (x0 < SAFE.left + 4) x0 = SAFE.left + 4;
  const bottom = Math.min(tune.bottom ?? BUB.bottom, BUB.bottom), y0 = bottom - h;
  const { tag, dots } = parts(x0, y0, w, h), d2 = dots[1];
  const pad = 3;
  const box: Rect = {
    x0: Math.floor(Math.min(x0, d2.x - d2.r - 2) - pad), y0: Math.floor(tag.y0 - pad),
    x1: Math.ceil(x0 + w + pad), y1: Math.ceil(Math.max(bottom + BUB.drop + BUB.soft * 0.4, d2.y + d2.r + 3) + pad),
  };
  return { rows, en, px, x0, y0, w, h, tag, dots, box };
};
/** the box the bubble takes on frame f (while it shows), or null */
export const whisperRectAt = (f: number): Rect | null => {
  const b = whisperBubble(f);
  return b ? whisperLayout(b.screen, whisperTune(b.s.id)).box : null;
};

// ---------------------------------------------------------------------------------------------------- drawing
const Bubble: React.FC<{ b: WhisperBubble }> = ({ b }) => {
  const tune = whisperTune(b.s.id), L = whisperLayout(b.screen, tune);
  // a second screen of the line: the body's width eases from the previous screen's (4 frames), the words fade in
  const P = b.prev ? whisperLayout(b.prev, tune) : null, sw = easeInOutCubic(b.swap);
  const x0 = P ? P.x0 + (L.x0 - P.x0) * sw : L.x0, w = P ? P.w + (L.w - P.w) * sw : L.w;
  const y0 = P ? P.y0 + (L.y0 - P.y0) * sw : L.y0, h = P ? P.h + (L.h - P.h) * sw : L.h;
  const { tag, dots } = parts(x0, y0, w, h);
  const op = Math.min(clamp01(b.pop * 1.8), b.fade);
  const sc = (0.82 + 0.18 * easeOutBack(b.pop, 1.4)) * (0.94 + 0.06 * b.fade);
  const d2 = L.dots[1], origin = `${d2.x}px ${d2.y}px`;   // the pop grows from the tail (the settled layout's)
  const text: React.CSSProperties = { position: "absolute", fontFamily: FONT_STACK, fontWeight: 700, lineHeight: 1, whiteSpace: "pre" };
  // the words sit INSIDE the body (positioned from its inner edge, clipped to its rounded shape: while a second screen's
  // body eases wider, its words never spill past the rim)
  const left = BUB.padX, top = BUB.padY, step = Math.round(L.px * BUB.step);
  const enTop = top + (L.rows.length ? L.px + (L.rows.length - 1) * step + 12 : 0);
  const dot = (d: { x: number; y: number; r: number; rim: number }, i: number) => (
    <div key={i} style={{ position: "absolute", left: d.x - d.r, top: d.y - d.r, width: 2 * d.r, height: 2 * d.r, borderRadius: d.r, background: PAPER, border: `${d.rim}px solid ${HC.ink}`, boxSizing: "border-box", boxShadow: `0 3px 0 rgba(10,6,4,0.45), 0 4px 8px rgba(10,6,4,0.35)` }} />
  );
  return (
    <AbsoluteFill style={{ opacity: op, transform: `scale(${sc.toFixed(4)})`, transformOrigin: origin }}>
      {dots.map(dot)}
      <div style={{ position: "absolute", left: x0, top: y0, width: w, height: h, borderRadius: L.rows.length > 1 || L.en.length ? BUB.radius : h / 2, background: PAPER, border: `${BUB.rim}px solid ${HC.ink}`, boxSizing: "border-box", boxShadow: SHADOW, overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 0, top: 0, width: L.w, height: L.h, opacity: P ? clamp01(b.swap * 1.6 - 0.4) : 1 }}>
          {L.rows.map((r, i) => <div key={i} style={{ ...text, left, top: top + i * step, fontSize: L.px, letterSpacing: BUB.ls, color: INK_TEXT }}>{r}</div>)}
          {L.en.map((r, i) => <div key={`en${i}`} style={{ ...text, left, top: enTop + i * Math.round(BUB.enPx * 1.25), fontSize: BUB.enPx, letterSpacing: BUB.enLs, color: "#5a4632" }}>{r}</div>)}
        </div>
      </div>
      {/* the tag on the top edge: her camera's red, an ink rim, the words in her warm white */}
      <div style={{ position: "absolute", left: tag.x0, top: tag.y0, width: tag.w, height: tag.h, borderRadius: tag.h / 2, background: RED, border: `${BUB.tagRim}px solid ${HC.ink}`, boxSizing: "border-box", boxShadow: "0 3px 0 rgba(10,6,4,0.45)" }} />
      <div style={{ ...text, left: tag.x0 + BUB.tagRim + BUB.tagPadX, top: tag.y0 + BUB.tagRim + BUB.tagPadY + 1, fontSize: BUB.tagPx, letterSpacing: BUB.tagLs, color: HC.warm, textShadow: "0 2px 0 rgba(60,10,6,0.55)" }}>{BUB.tag}</div>
    </AbsoluteFill>
  );
};

/** the whisper's layer: the darkened edges (edges) and her bubble (words) on frame f; nothing outside a whisper line */
export const Whisper: React.FC<{ f: number; words?: boolean; edges?: boolean }> = ({ f, words = true, edges = true }) => {
  useOverlayFont();
  const e = edges ? whisperEdgeK(f) : 0;
  const b = words ? whisperBubble(f) : null;
  if (e <= 0 && !b) return null;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {e > 0 ? <AbsoluteFill style={{ background: VIGNETTE, opacity: e }} /> : null}
      {b && b.k > 0 ? <Bubble b={b} /> : null}
    </AbsoluteFill>
  );
};
