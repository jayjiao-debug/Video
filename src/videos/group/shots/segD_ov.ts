// segment D overlays (pure functions of the frame; .ts, so React.createElement via h):
//   Study78    line 12: "78项研究" with 78 page icons; 放在一起看 = a gold frame closes round all of them;
//              结论都一样 = the same big gold ✓ ripples onto every page (they all agree; WHAT they agree on is line 13's card)
//   SlidePlan  lines 13 + 15: the team's slide outline (小组展示, four parts). Name tags drop into each part's empty
//              slot; a thin line in that person's colour runs from the tag to their head (screen points from w.project).
//              Each part fills with its person's colour as they work. Line 15: the lines retract, the tags fly off (the
//              slots are empty again), the fills turn grey at the same level (the work is there, nobody can tell
//              whose), then the card leaves.
//   ChatInsert line 14: a cutaway, not a POV: the room dims and a clean phone slides up showing the group chat of the
//              evening they split the work (date chip 周一晚上 20:15, status bar 20:16). 阿杰 asks how to split it; the
//              keyboard comes up (input bar above the caption band) and YOU type "分工：大家一起做！", send; the keyboard
//              goes down; the replies 收到 / 收到 / 👍 (drawn, no emoji font) pop in; the phone slides away.
import React from "react";
import { COL, FONT_STACK, useOverlayFont, ts } from "../kit/overlay";
import { W, H, h, pop, clamp01, lerp, lin, easeOutCubic, easeInCubic, easeOutBack, easeInOutCubic } from "../story";

export type P2 = { x: number; y: number };
const INK = COL.ink;

/** feathered dark scrim (the kit's look: flat core, long soft edge, no box) centred on (cx, cy) */
const scrim = (cx: number, cy: number, w: number, hh: number, o = 0.5, key?: string) => {
  const c = (a: number) => `rgba(10,12,22,${(o * a).toFixed(3)})`;
  return h("div", { key, style: { position: "absolute", left: cx - w / 2, top: cy - hh / 2, width: w, height: hh,
    background: `radial-gradient(closest-side, ${c(1)} 0%, ${c(1)} 55%, ${c(0.74)} 70%, ${c(0.36)} 85%, ${c(0.1)} 95%, ${c(0)} 100%)` } });
};
const svg = (kids: React.ReactNode[], style: React.CSSProperties = {}, key?: string) =>
  h("svg", { key, width: W, height: H, viewBox: `0 0 ${W} ${H}`, style: { position: "absolute", left: 0, top: 0, overflow: "visible", ...style } }, ...kids);
const abs = (x: number, y: number, kids: React.ReactNode, style: React.CSSProperties = {}, key?: string) =>
  h("div", { key, style: { position: "absolute", left: x, top: y, width: 0, height: 0, ...style } }, kids);
const centred = (kids: React.ReactNode, s = 1, style: React.CSSProperties = {}) =>
  h("div", { style: { position: "absolute", left: 0, top: 0, transform: `translate(-50%,-50%) scale(${s})`, transformOrigin: "50% 50%", whiteSpace: "nowrap", ...style } }, kids);
/** #rrggbb mix */
const mixHex = (a: string, b: string, k: number) => {
  const p = (c: string, i: number) => parseInt(c.slice(1 + 2 * i, 3 + 2 * i), 16);
  return "#" + [0, 1, 2].map((i) => Math.round(lerp(p(a, i), p(b, i), k)).toString(16).padStart(2, "0")).join("");
};
/** 7-frame leave (the kit's outK) */
const leave = (f: number, out: number) => easeInCubic((f - out) / 7);

// =====================================================================================================================
// line 12: 78 studies
// =====================================================================================================================
export type Study78Props = { f: number; at: number; together: number; same: number; out: number; x: number; y: number };
const COLS = 13, ROWS = 6, CW = 44, CH = 54, PW = 34, PHh = 42;
export const Study78: React.FC<Study78Props> = ({ f, at, together, same, out, x, y }) => {
  useOverlayFont();
  if (f < at || f > out + 7) return null;
  const o = leave(f, out), s = pop(f, at, 7, 1.1) * (1 - 0.15 * o);
  const gx0 = x - (COLS * CW) / 2, gy0 = y + 96;
  const pages: React.ReactNode[] = [];
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    const i = r * COLS + c, ap = at + 3 + Math.floor((i * 16) / (COLS * ROWS));
    const k = pop(f, ap, 5, 1.2);
    if (k <= 0) continue;
    const px = gx0 + c * CW + CW / 2, py = gy0 + r * CH + CH / 2;
    const mk = pop(f, same + Math.round(c * 0.8 + r * 0.4), 5, 1.35);
    pages.push(h("g", { key: i, transform: `translate(${px},${py}) scale(${k})` },
      h("path", { d: `M${-PW / 2},${-PHh / 2} H${PW / 2 - 9} L${PW / 2},${-PHh / 2 + 9} V${PHh / 2} H${-PW / 2} Z`, fill: "#fbfaf6", stroke: INK, strokeWidth: 3.4, strokeLinejoin: "round" }),
      ...[-11, -3, 5, 13].map((ly, j) => h("line", { key: j, x1: -10, y1: ly, x2: j === 3 ? 3 : 10, y2: ly, stroke: "#a9aebb", strokeWidth: 2.8, strokeLinecap: "round", opacity: mk > 0 ? 0.3 : 1 })),
      // the same verdict on every page: a big gold check that fills most of the page
      mk > 0 ? h("g", { transform: `translate(0,1) scale(${mk})` },
        h("path", { d: "M-12,0 L-4,9 L13,-11", stroke: INK, strokeWidth: 11, fill: "none", strokeLinecap: "round", strokeLinejoin: "round" }),
        h("path", { d: "M-12,0 L-4,9 L13,-11", stroke: COL.gold, strokeWidth: 6, fill: "none", strokeLinecap: "round", strokeLinejoin: "round" })) : null));
  }
  // 放在一起看: a gold rounded frame draws on round the whole grid
  const fw = COLS * CW + 36, fh = ROWS * CH + 36, per = 2 * (fw + fh);
  const fk = easeInOutCubic(lin(f, together, together + 10));
  const frame = f >= together ? h("rect", { key: "frame", x: gx0 - 18, y: gy0 - 18, width: fw, height: fh, rx: 22, fill: "none", stroke: COL.gold, strokeWidth: 7,
    strokeDasharray: `${per * fk} ${per}`, style: { filter: "drop-shadow(0 0 0 #000)" } }) : null;
  const frameInk = f >= together ? h("rect", { key: "frameInk", x: gx0 - 18, y: gy0 - 18, width: fw, height: fh, rx: 22, fill: "none", stroke: INK, strokeWidth: 13,
    strokeDasharray: `${per * fk} ${per}` }) : null;
  return h("div", { style: { position: "absolute", inset: 0, opacity: 1 - o, transformOrigin: `${x}px ${y + 120}px`, transform: `scale(${1 - 0.12 * o})` } },
    // centred on the grid (not above it): a focus pool on the wall and corkboard, not a cloud over the ceiling light
    scrim(x, y + 230, 880, 560, 0.42 * clamp01((f - at) / 4)),
    svg([frameInk, frame, ...pages]),
    abs(x, y, centred(h("div", { style: { display: "flex", alignItems: "baseline", gap: 10 } },
      h("span", { style: ts(190, COL.gold, 18) }, "78"), h("span", { style: ts(72) }, "项研究")), s)));
};

// =====================================================================================================================
// lines 13 + 15: the slide outline with name tags
// =====================================================================================================================
export type PlanPart = {
  /** part label, person's name and colour */
  label: string; name: string; col: string;
  /** the part's column centre x on the card (fixed: the card does not ride the camera) */
  x: number;
  /** the person's head on screen: centre and radius (px), re-passed every frame */
  head: P2 & { r: number };
  /** the tag lands at tagAt; the line retracts at offAt and the tag flies off right after */
  tagAt: number; offAt: number;
  /** 0..1: how much of this part is done (the box fills with the person's colour; grey once the tag is off) */
  done: number;
};
export type SlidePlanProps = { f: number; at: number; out: number; top: number; parts: PlanPart[] };
const CARD = { x0: 44, x1: W - 44, h: 330, boxW: 212, boxTop: 104, boxH: 196 };
export const SlidePlan: React.FC<SlidePlanProps> = ({ f, at, out, top, parts }) => {
  useOverlayFont();
  if (f < at || f > out + 7) return null;
  const e = easeOutBack(clamp01((f - at) / 12), 1.4), o = leave(f, out);
  const dy = 110 * (1 - e) + 26 * o, op = clamp01((f - at) / 5) * (1 - o), sc = (0.92 + 0.08 * e) * (1 - 0.08 * o);
  const cardW = CARD.x1 - CARD.x0, cx = (CARD.x0 + CARD.x1) / 2;
  const bt = top + CARD.boxTop;
  const lines: React.ReactNode[] = [], boxes: React.ReactNode[] = [], tags: React.ReactNode[] = [];
  parts.forEach((p, i) => {
    const bx = p.x - CARD.boxW / 2;
    // the part box: number badge, label, the tag slot (dashed while empty)
    // the fill: the person's colour while their name is on it; when the tag flies off it turns grey at the same level
    const offK0 = easeInOutCubic(clamp01((f - p.offAt) / 10)), fillPct = Math.round(1000 * clamp01(p.done)) / 10;
    const fc = mixHex(p.col, "#a3a9b6", offK0);
    const fill = fillPct > 0 ? `linear-gradient(90deg, ${fc}70 0%, ${fc}70 ${fillPct}%, #eef0f5 ${fillPct}%, #eef0f5 100%)` : "#eef0f5";
    boxes.push(h("div", { key: `b${i}`, style: { position: "absolute", left: bx, top: bt, width: CARD.boxW, height: CARD.boxH, borderRadius: 22, background: fill, boxShadow: `inset 0 0 0 3px #d5d9e3`, overflow: "hidden" } },
      h("div", { style: { position: "absolute", left: 12, top: 12, width: 40, height: 40, borderRadius: 20, background: INK, color: "#fff", fontFamily: FONT_STACK, fontWeight: 700, fontSize: 26, lineHeight: "40px", textAlign: "center" } }, String(i + 1)),
      h("div", { style: { position: "absolute", left: 0, right: 0, top: 62, textAlign: "center", fontFamily: FONT_STACK, fontWeight: 700, fontSize: 48, lineHeight: 1, color: INK, whiteSpace: "nowrap" } }, p.label),
      h("div", { style: { position: "absolute", left: (CARD.boxW - 150) / 2, top: 124, width: 150, height: 56, borderRadius: 28, boxSizing: "border-box", border: "4px dashed #b7bdca",
        opacity: f >= p.tagAt + 4 && f < p.offAt + 8 ? 0 : 1 } })));
    // the tag: drops from above into the slot (squash on landing), flies off up and away at offAt + 3
    const land = clamp01((f - p.tagAt) / 7), drop = f < p.tagAt ? -1 : land;
    const offK = clamp01((f - p.offAt - 3) / 9), gone = easeInCubic(offK);
    if (drop >= 0 && offK < 1) {
      const fall = drop < 0.55 ? -170 * (1 - easeInCubic(drop / 0.55)) : 0;
      const sq = drop >= 0.55 ? 1 + 0.14 * Math.sin(((drop - 0.55) / 0.45) * Math.PI) * (1 - (drop - 0.55) / 0.45) : 1;
      const ty = bt + 152 + fall - 150 * gone, tx = p.x + (i % 2 ? 1 : -1) * 70 * gone;
      tags.push(abs(tx, ty, centred(h("div", { style: { minWidth: 96, textAlign: "center", padding: "8px 26px", borderRadius: 30, background: p.col, boxShadow: `0 0 0 4px ${INK}, 0 6px 0 rgba(0,0,0,0.25)` } },
        h("span", { style: ts(40, "#fff", 9) }, p.name)), 1), { opacity: (drop < 0.15 ? drop / 0.15 : 1) * (1 - gone), transform: `rotate(${(i % 2 ? 14 : -14) * gone}deg) scale(${1 / sq}, ${sq})` }, `t${i}`));
    }
    // the line: tag bottom -> head top, draws on after the tag lands, retracts at offAt
    const on = easeOutCubic(clamp01((f - p.tagAt - 5) / 6)) * (1 - easeInCubic(clamp01((f - p.offAt) / 4)));
    if (on > 0.01) {
      const ax = p.x, ay = bt + 184 + dy, bx2 = p.head.x, by2 = p.head.y - p.head.r - 6;
      const ex = lerp(ax, bx2, on), ey = lerp(ay, by2, on);
      lines.push(h("g", { key: `l${i}` },
        h("line", { x1: ax, y1: ay, x2: ex, y2: ey, stroke: INK, strokeWidth: 10, strokeLinecap: "round" }),
        h("line", { x1: ax, y1: ay, x2: ex, y2: ey, stroke: p.col, strokeWidth: 5, strokeLinecap: "round" }),
        on > 0.98 ? h("circle", { cx: bx2, cy: by2, r: 9, fill: p.col, stroke: INK, strokeWidth: 4 }) : null));
    }
  });
  return h("div", { style: { position: "absolute", inset: 0, opacity: op } },
    svg(lines),
    h("div", { style: { position: "absolute", inset: 0, transform: `translateY(${dy}px) scale(${sc})`, transformOrigin: `${cx}px ${top + CARD.h / 2}px` } },
      h("div", { style: { position: "absolute", left: CARD.x0, top, width: cardW, height: CARD.h, borderRadius: 30, background: "rgba(255,255,255,0.97)", boxShadow: `0 0 0 5px ${INK}, 0 14px 0 rgba(0,0,0,0.22)` } },
        // title row: a small slide icon and the deck's name
        h("div", { style: { position: "absolute", left: 36, top: 24, width: 58, height: 44, borderRadius: 8, background: COL.gold, boxShadow: `0 0 0 4px ${INK}` } },
          h("div", { style: { position: "absolute", left: 22, top: 11, width: 0, height: 0, borderTop: "11px solid transparent", borderBottom: "11px solid transparent", borderLeft: `17px solid ${INK}` } })),
        h("div", { style: { position: "absolute", left: 116, top: 18, fontFamily: FONT_STACK, fontWeight: 700, fontSize: 56, lineHeight: 1, color: INK, whiteSpace: "nowrap" } }, "小组展示"),
        h("div", { style: { position: "absolute", left: 30, right: 30, top: 88, height: 3, background: "#e1e4ec" } })),
      ...boxes, ...tags));
};


// =====================================================================================================================
// line 14: the group chat (a cutaway to the evening they split the work)
// =====================================================================================================================
/** phone body / screen (frame px at rest): a clean phone, upright, no hands */
const PH = { x: 130, y: 150, w: 820, h: 1640, r: 100 };
const SC = { x: PH.x + 20, y: PH.y + 20, w: PH.w - 40, h: PH.h - 40, r: 82 };
/** screen-local layout (frame y = SC.y + y): header 0-200, date chip, messages from msg0; with 56 px type the last
 *  reply ends at y 964 (frame 1134, above the caption band); the keyboard (kbH, top at frame 1250) pushes the input bar
 *  up to y 950-1080 (frame 1120-1250); its empty candidate strip (cand, frame 1250-1390) is what lies under the caption
 *  band, and the key rows (keyH + keyGap) start below it (frame 1400-1750), so no key caps print through the captions */
const LY = { head: 200, chip: 214, msg0: 266, name: 32, bub: 100, gap: 18, type: 56, av: 72, kbH: 520, ibH: 130, cand: 140, keyH: 80, keyGap: 10 };
const UI = { bg0: "#151a3c", bg1: "#0d1130", card: "#262d60", text: "#f4f1ff", sub: "#9aa2cf", line: "#2a3168", mine: "#d9d4ff", key: "#232a5c", keyHi: "#4a54a0", kb: "#0e1230" };
const HINK = "#241726";
export type ChatMsg = { at: number; who: "worker" | "mate1" | "mate2" | "you"; text?: string; thumb?: boolean };
export type ChatInsertProps = {
  f: number; in0: number; in1: number; out0: number; out1: number;
  msgs: ChatMsg[];
  /** the keyboard comes up kb0 -> kb1 and goes down after send; YOUR draft is typed type0 -> type1, sent at send */
  draft: string; kb0: number; kb1: number; type0: number; type1: number; send: number;
};
const WHO: Record<ChatMsg["who"], { name: string; col: string; hair: string }> = {
  worker: { name: "阿杰", col: "#5d9b5a", hair: "#3a2a20" }, mate1: { name: "大刘", col: "#f08a3c", hair: "#2b2b33" },
  mate2: { name: "小雨", col: "#d9a832", hair: "#4a3020" }, you: { name: "你", col: "#3567b8", hair: "#2a221e" },
};
/** 0..1 how far the phone is up (and the room dimmed) */
export const chatUp = (f: number, in0: number, in1: number, out0: number, out1: number) =>
  f < out0 ? easeOutCubic(lin(f, in0, in1)) : 1 - easeInCubic(lin(f, out0, out1));

/** round avatar: the film's cream head with a hair cap, on the person's colour */
const avatar = (x: number, y: number, d: number, who: ChatMsg["who"], key?: string) => {
  const p = WHO[who];
  return h("svg", { key, width: d, height: d, viewBox: "-50 -50 100 100", style: { position: "absolute", left: x, top: y } },
    h("circle", { r: 48, fill: p.col }),
    h("circle", { cx: 0, cy: 8, r: 30, fill: "#fbf6ee", stroke: HINK, strokeWidth: 4 }),
    h("path", { d: "M-30,4 C-30,-26 30,-26 30,4 C18,-8 -12,-10 -30,4 Z", fill: p.hair, stroke: HINK, strokeWidth: 4, strokeLinejoin: "round" }),
    h("circle", { cx: -10, cy: 12, r: 3.4, fill: HINK }), h("circle", { cx: 10, cy: 12, r: 3.4, fill: HINK }),
    h("path", { d: "M-7,24 Q0,28 7,24", stroke: HINK, strokeWidth: 3, fill: "none", strokeLinecap: "round" }));
};
/** a drawn thumbs-up (no emoji font in the renderer) */
const thumbsUp = (s: number) => h("svg", { width: 64 * s, height: 64 * s, viewBox: "0 0 64 64" },
  h("path", { d: "M8,28 h12 v28 h-12 z", fill: "#ffc53d", stroke: HINK, strokeWidth: 4, strokeLinejoin: "round" }),
  h("path", { d: "M20,30 L31,8 C35,6 39,9 38,15 L36,24 H52 C57,24 60,28 59,33 L55,51 C54,55 51,57 47,57 H20 Z", fill: "#ffd76a", stroke: HINK, strokeWidth: 4, strokeLinejoin: "round" }));
const KEYS = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"];

export const ChatInsert: React.FC<ChatInsertProps> = ({ f, in0, in1, out0, out1, msgs, draft, kb0, kb1, type0, type1, send }) => {
  useOverlayFont();
  const up = chatUp(f, in0, in1, out0, out1);
  if (up <= 0) return null;
  const rise = (1 - up) * (H - PH.y + 40);
  // keyboard: up kb0 -> kb1, down over 8 frames after send
  const kb = f < send ? easeOutCubic(lin(f, kb0, kb1)) : 1 - easeInOutCubic(lin(f, send, send + 8));
  // typing: chars typed so far (one every ~4.5 frames); each keystroke lights one key for 3 frames
  const chars = [...draft], per = (type1 - type0) / chars.length;
  const n = f < type0 || f >= send ? 0 : Math.min(chars.length, Math.floor((f - type0) / per) + 1);
  const typed = chars.slice(0, n).join("");
  const tapI = f >= type0 && f < type1 + per ? Math.floor((f - type0) / per) : -1, tapOn = tapI >= 0 && (f - type0) - tapI * per < 3;
  const sendFlash = f >= send && f < send + 6 ? 1 - (f - send) / 6 : 0;

  const box = (x: number, y: number, w: number, hh: number, style: React.CSSProperties, kids?: React.ReactNode, key?: string) =>
    h("div", { key, style: { position: "absolute", left: x, top: y, width: w, height: hh, ...style } }, kids);
  const text = (x: number, y: number, size: number, col: string, str: React.ReactNode, extra: React.CSSProperties = {}, key?: string) =>
    h("div", { key, style: { position: "absolute", left: x, top: y, fontFamily: FONT_STACK, fontWeight: 700, fontSize: size, lineHeight: 1, color: col, whiteSpace: "nowrap", ...extra } }, str);

  // ---------------- the chat list ----------------
  const rows: React.ReactNode[] = [];
  // the time jump, explicit: the evening they split the work
  const chipW = 330;
  rows.push(box((SC.w - chipW) / 2, LY.chip, chipW, 44, { borderRadius: 22, background: "#2c3470", boxShadow: `inset 0 0 0 2px ${COL.gold}88` },
    text(chipW / 2, 7, 30, "#ffe29a", "周一晚上 20:15", { transform: "translateX(-50%)" }), "date"));
  let y = LY.msg0;
  msgs.forEach((m, i) => {
    const k = pop(f, m.at, 6, 1.1);
    const mine = m.who === "you", AV = LY.av, size = LY.type;
    const bw = m.thumb ? 128 : [...(m.text ?? "")].length * size + 60, bh = LY.bub;
    const rowH = (mine ? 0 : LY.name) + bh + LY.gap;
    if (k > 0) {
      const ax = mine ? SC.w - 22 - AV : 22, bx = mine ? ax - 14 - bw : ax + AV + 14, by = y + (mine ? 0 : LY.name);
      const content = m.thumb ? h("div", { style: { position: "absolute", left: 32, top: 18 } }, thumbsUp(1))
        : text(30, (bh - size) / 2 + 2, size, mine ? HINK : UI.text, (m.text ?? "").includes("大家一起做")
          ? [h("span", { key: 0 }, m.text!.split("大家一起做")[0]), h("span", { key: 1, style: { color: "#8a5a00", background: "rgba(255,197,61,0.62)", borderRadius: 10, padding: "0 4px" } }, "大家一起做"), h("span", { key: 2 }, m.text!.split("大家一起做")[1])]
          : m.text);
      // YOUR sent message gets a short gold pulse round the bubble
      const pulse = mine ? clamp01(1 - (f - m.at - 4) / 12) * (f >= m.at + 4 ? 1 : 0) : 0;
      rows.push(h("div", { key: `m${i}`, style: { position: "absolute", left: 0, top: 0, width: SC.w, height: SC.h, transformOrigin: `${mine ? bx + bw : bx}px ${by + bh / 2}px`, transform: `scale(${k})` } },
        avatar(ax, by + bh - AV, AV, m.who),
        mine ? null : text(bx + 6, y, 26, UI.sub, WHO[m.who].name),
        box(bx, by, bw, bh, { borderRadius: mine ? "34px 10px 34px 34px" : "10px 34px 34px 34px", background: mine ? UI.mine : UI.card,
          boxShadow: mine ? `0 0 0 ${Math.round(16 * pulse)}px rgba(255,197,61,${(0.45 * pulse).toFixed(3)})` : `inset 0 0 0 2px ${UI.line}` }, content)));
    }
    y += rowH;
  });

  // ---------------- keyboard + input bar ----------------
  const kbTop = SC.h - LY.kbH * kb, IB = kbTop - LY.ibH;
  const keyW = (SC.w - 24 - 9 * 10) / 10, keyH = LY.keyH, row0 = LY.cand + 10;
  const keys: React.ReactNode[] = [];
  let ki = 0;
  KEYS.forEach((row, r) => {
    const x0 = (SC.w - (row.length * keyW + (row.length - 1) * 10)) / 2;
    [...row].forEach((ch, c) => {
      const lit = tapOn && (tapI * 7 + 3) % 26 === ki;
      keys.push(box(x0 + c * (keyW + 10), row0 + r * (keyH + LY.keyGap), keyW, keyH, { borderRadius: 14, background: lit ? UI.keyHi : UI.key, boxShadow: "0 3px 0 #070a20" },
        text(keyW / 2, (keyH - 36) / 2 + 2, 36, lit ? UI.text : "#8790c4", ch, { transform: "translateX(-50%)" }), `k${ki}`));
      ki++;
    });
  });
  const bottomY = row0 + 3 * (keyH + LY.keyGap), bt = (keyH - 32) / 2 + 2;
  keys.push(box(12, bottomY, 140, keyH, { borderRadius: 14, background: UI.key }, text(70, bt, 32, "#8790c4", "123", { transform: "translateX(-50%)" }), "k123"));
  keys.push(box(164, bottomY, SC.w - 164 - 176, keyH, { borderRadius: 14, background: UI.key }, text((SC.w - 340) / 2, bt, 32, "#8790c4", "空格", { transform: "translateX(-50%)" }), "kspc"));
  keys.push(box(SC.w - 164, bottomY, 152, keyH, { borderRadius: 14, background: UI.key }, text(76, bt, 32, "#8790c4", "换行", { transform: "translateX(-50%)" }), "kret"));
  const keyboard = kb > 0 ? box(0, kbTop, SC.w, LY.kbH, { background: UI.kb },
    [box(0, 0, SC.w, LY.cand, { borderBottom: `2px solid ${UI.line}` }, null, "cand"), ...keys], "kb") : null;
  const input = box(0, IB, SC.w, LY.ibH, { background: UI.bg0, boxShadow: "0 -6px 16px rgba(5,8,25,0.45)" }, [
    box(26, 24, SC.w - 160, 84, { borderRadius: 42, background: UI.card }, n > 0
      ? text(32, 19, 46, UI.text, [h("span", { key: 0 }, typed), h("span", { key: 1, style: { color: COL.gold, opacity: Math.floor(f / 8) % 2 ? 0.2 : 1 } }, "|")])
      : text(32, 25, 34, "#5d6596", "发消息…"), "field"),
    box(SC.w - 112, 22, 88, 88, { borderRadius: 44, background: n > 0 || sendFlash > 0 ? COL.gold : "#3a4170", boxShadow: sendFlash > 0 ? `0 0 0 ${Math.round(16 * sendFlash)}px rgba(255,197,61,0.35)` : "none" },
      h("svg", { width: 88, height: 88, viewBox: "-44 -44 88 88" }, h("path", { d: "M-15,2 L15,-13 L7,17 L1,5 Z", fill: n > 0 || sendFlash > 0 ? HINK : UI.sub })), "send"),
  ], "input");

  const screen = box(SC.x, SC.y, SC.w, SC.h, { borderRadius: SC.r, overflow: "hidden", background: `linear-gradient(180deg, ${UI.bg0}, ${UI.bg1})` }, [
    ...rows,
    // header: status bar (20:16, the same evening) and the group
    box(0, 0, SC.w, LY.head, { background: UI.bg0, boxShadow: "0 8px 18px rgba(5,8,25,0.5)" }, [
      text(56, 34, 30, UI.text, "20:16", {}, "clock"),
      box(SC.w - 108, 38, 52, 24, { borderRadius: 6, border: `3px solid ${UI.text}`, boxSizing: "border-box" }, box(3, 3, 32, 12, { borderRadius: 2, background: UI.text }), "bat"),
      box(SC.w / 2 - 72, 26, 144, 38, { borderRadius: 19, background: "#05060c" }, null, "isl"),
      text(30, 104, 56, UI.text, "‹", {}, "back"),
      box(82, 98, 68, 68, { borderRadius: 18, background: UI.card, overflow: "hidden" }, [
        avatar(2, 2, 32, "worker", "a0"), avatar(34, 2, 32, "mate2", "a1"), avatar(2, 34, 32, "mate1", "a2"), avatar(34, 34, 32, "you", "a3")], "grp"),
      text(170, 98, 46, UI.text, "小组展示（4）", {}, "title"),
      text(170, 152, 26, UI.sub, "阿杰、小雨、大刘、你", {}, "members"),
    ], "head"),
    input, keyboard,
  ]);
  const body = box(PH.x, PH.y, PH.w, PH.h, { borderRadius: PH.r, background: "linear-gradient(160deg, #2b2e3d, #15161f)", boxShadow: `0 0 0 6px ${HINK}, 0 26px 50px rgba(0,0,0,0.45)` }, null, "body");
  return h("div", { style: { position: "absolute", inset: 0, overflow: "hidden" } },
    // the room dims behind the phone (fully dark once it is up: the 3D is not drawn then)
    h("div", { key: "dim", style: { position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 45%, #2a2f4a 0%, #191b2c 70%, #121320 100%)", opacity: up } }),
    h("div", { key: "ph", style: { position: "absolute", inset: 0, transform: `translateY(${rise}px)` } }, body, screen));
};
