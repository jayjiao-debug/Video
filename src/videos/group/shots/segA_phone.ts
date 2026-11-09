// segment A: the POV insert of YOUR phone (scene "phone2d"), frames CUT..265 of line 02.
// Our own short-video feed (not WeChat, not Douyin: deep indigo ground like the film's chat app in kit/phone.ts, gold
// accents, no logos). YOU's left hand (a stick arm in the hoodie's arm colour, a ball hand behind the phone's lower-left corner, the
// thumb over the bezel) holds the phone, in the kit phone's pale case, over the desk.
// Beats: the feed is still settling from a flick when we cut in (the post "1974年 拉绳实验" slides up into place),
// then the view zooms into the post's 9:16 thumbnail until it fills the frame edge to edge at `end` (eased in-out).
// The thumbnail is staticFile("group/lab_thumb.jpg") (segment B's first frame, rendered without captions); when it is
// missing a pale green room tone stands in (no crash).
// Everything is a pure function of the frame. The thumbnail is drawn into a full-frame canvas at its exact screen rect
// (no CSS scaling of the bitmap), so at `end` the image is drawn 1:1 at 0,0 .. 1080,1920.
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { continueRender, delayRender, staticFile } from "remotion";
import { COL, FONT_STACK, useOverlayFont } from "../kit/overlay";
import { W, H, h, clamp01, lerp, lin, easeOutCubic, easeInOutCubic } from "../story";

// ---------------------------------------------------------------------------------------------------- layout (POV px)
/** phone body and screen, in the un-zoomed POV frame (1080 x 1920) */
const PH = { x: 150, y: 118, w: 780, h: 1684, r: 96 };
const SC = { x: PH.x + 20, y: PH.y + 20, w: PH.w - 40, h: PH.h - 40, r: 78 };
/** the fixed app header (status bar + title + chips) ends here; the feed scrolls under it */
const HEAD_B = SC.y + 196;
/** the post's thumbnail at scroll 0: exactly 9:16 so the zoom ends edge to edge */
export const THUMB = { x: 190, y: 524, w: 700, h: 700 * (16 / 9), r: 26 };
/** arm colour of YOU's hoodie (toon armColOf: topCol mixed 48 % toward ink) and the ink */
const ARM = "#2d4172", INK = "#241726";
/** the kit's held-phone case colour (kit/toon.ts drawProp phone, face "back") */
const CASE = "#e4dfd6";
const UI = { bg0: "#151a3c", bg1: "#0d1130", card: "#1c2250", text: "#f4f1ff", sub: "#9aa2cf", chip: "#262d60", line: "#2a3168" };

// ---------------------------------------------------------------------------------------------------- the thumbnail
type ThumbState = "loading" | "ok" | "missing";
let thumbState: ThumbState = "loading";
let thumbImg: HTMLImageElement | null = null;
let thumbP: Promise<void> | null = null;
const loadThumb = () => {
  if (!thumbP) thumbP = new Promise<void>((res) => {
    if (typeof Image === "undefined") { thumbState = "missing"; res(); return; }
    const img = new Image();
    img.onload = () => {
      const done = () => { thumbImg = img; thumbState = "ok"; res(); };
      if (typeof img.decode === "function") img.decode().then(done, done); else done();
    };
    img.onerror = () => { thumbState = "missing"; res(); };
    img.src = staticFile("group/lab_thumb.jpg");
  });
  return thumbP;
};
const settled = () => thumbState !== "loading";

const rrect = (g: CanvasRenderingContext2D, x: number, y: number, w: number, hh: number, r: number) => {
  const k = Math.max(0, Math.min(r, w / 2, hh / 2));
  g.beginPath();
  g.moveTo(x + k, y); g.lineTo(x + w - k, y); g.arcTo(x + w, y, x + w, y + k, k); g.lineTo(x + w, y + hh - k);
  g.arcTo(x + w, y + hh, x + w - k, y + hh, k); g.lineTo(x + k, y + hh); g.arcTo(x, y + hh, x, y + hh - k, k);
  g.lineTo(x, y + k); g.arcTo(x, y, x + k, y, k); g.closePath();
};
/** the stand-in when lab_thumb.jpg is missing: a pale green room (wall, skirting, floor) */
const drawPlaceholder = (g: CanvasRenderingContext2D, x: number, y: number, w: number, hh: number) => {
  const wall = g.createLinearGradient(0, y, 0, y + hh * 0.66);
  wall.addColorStop(0, "#dbe6d5"); wall.addColorStop(1, "#c4d5bf");
  g.fillStyle = wall; g.fillRect(x, y, w, hh * 0.66);
  g.fillStyle = "#9fb59a"; g.fillRect(x, y + hh * 0.66 - hh * 0.012, w, hh * 0.012);
  const fl = g.createLinearGradient(0, y + hh * 0.66, 0, y + hh);
  fl.addColorStop(0, "#cdc6b4"); fl.addColorStop(1, "#bdb5a2");
  g.fillStyle = fl; g.fillRect(x, y + hh * 0.66, w, hh * 0.34);
};

// ---------------------------------------------------------------------------------------------------- the component
export type PhonePOVProps = { f: number; cut: number; end: number; zoomAt: number };

/** zoom window (POV px) for zoom progress e: from the whole frame to the THUMB rect, width interpolated
 *  geometrically (constant-feeling zoom), centre moving in step with the width so the target stays put */
const windowAt = (e: number, jx: number, jy: number) => {
  const ww = W * Math.pow(THUMB.w / W, e), q = (W - ww) / (W - THUMB.w);
  const cx = W / 2 + (THUMB.x + THUMB.w / 2 - W / 2) * q + jx * (1 - e);
  const cy = H / 2 + (THUMB.y + THUMB.h / 2 - H / 2) * q + jy * (1 - e);
  const wh = ww * (H / W);
  return { x: cx - ww / 2, y: cy - wh / 2, w: ww, h: wh, s: W / ww };
};

export const PhonePOV: React.FC<PhonePOVProps> = ({ f, cut, end, zoomAt }) => {
  useOverlayFont();
  // thumbnail: load once per page (a still / chunk may start on any frame), hold the frame until it settles
  const [st, setSt] = useState<ThumbState>(thumbState);
  const [handle] = useState(() => (settled() ? null : delayRender("segA lab thumbnail")));
  const released = useRef(false);
  useEffect(() => { if (handle !== null) loadThumb().then(() => setSt(thumbState)); }, [handle]);

  // timing
  const scroll = 330 * (1 - easeOutCubic(lin(f, cut - 1, zoomAt)));      // the feed lands from a flick
  const e = easeInOutCubic(lin(f, zoomAt, end));
  const tt = (f - cut) / 30;
  const jx = 4 * Math.sin(tt * 5.1) + 2 * Math.sin(tt * 8.3 + 1), jy = 5 * Math.sin(tt * 4.3 + 0.7);   // handheld drift (gone at e = 1)
  const win = windowAt(e, jx, jy), s = win.s;
  const X = (x: number) => (x - win.x) * s, Y = (y: number) => (y - win.y) * s;
  const tr = { x: THUMB.x, y: THUMB.y + scroll, w: THUMB.w, h: THUMB.h, r: THUMB.r * (1 - e) };
  const iconO = 1 - clamp01(lin(f, zoomAt + 1, zoomAt + 7));

  // canvas: the thumbnail at its exact screen rect, clipped to the phone screen and its own rounded rect
  const cv = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => {
    const c = cv.current; if (!c) return;
    const g = c.getContext("2d")!;
    g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, W, H);
    g.save();
    rrect(g, X(SC.x), Y(HEAD_B), SC.w * s, (SC.y + SC.h - HEAD_B) * s, 0); g.clip();
    const x = X(tr.x), y = Y(tr.y), w = tr.w * s, hh = tr.h * s;
    rrect(g, x, y, w, hh, tr.r * s); g.clip();
    if (st === "ok" && thumbImg) g.drawImage(thumbImg, x, y, w, hh); else drawPlaceholder(g, x, y, w, hh);
    g.restore();
  });
  useLayoutEffect(() => {
    if (handle !== null && st !== "loading" && !released.current) { released.current = true; continueRender(handle); }
  }, [handle, st]);

  // ---------------- DOM layers (POV px inside a scaled container) ----------------
  const box = (x: number, y: number, w: number, hh: number, style: React.CSSProperties, kids?: React.ReactNode) =>
    h("div", { style: { position: "absolute", left: x, top: y, width: w, height: hh, ...style } }, kids);
  const text = (x: number, y: number, size: number, col: string, str: React.ReactNode, extra: React.CSSProperties = {}, key?: string) =>
    h("div", { key, style: { position: "absolute", left: x, top: y, fontFamily: FONT_STACK, fontWeight: 700, fontSize: size, lineHeight: 1, color: col, whiteSpace: "nowrap", ...extra } }, str);
  const zoomed = (kids: React.ReactNode[]) =>
    h("div", { style: { position: "absolute", left: 0, top: 0, width: W, height: H, transformOrigin: "0 0", transform: `translate(${-win.x * s}px, ${-win.y * s}px) scale(${s})` } }, ...kids);

  // the desk under the phone (seen from above, soft focus) + a vignette
  const desk = h("div", { style: { position: "absolute", inset: 0, background: "radial-gradient(120% 90% at 50% 45%, #d7ad78 0%, #c99a62 45%, #a87a48 100%)" } },
    ...[0.16, 0.31, 0.47, 0.62, 0.8, 0.9].map((yy, i) => h("div", { key: i, style: { position: "absolute", left: -40, right: -40, top: `${yy * 100}%`, height: 10 + (i % 3) * 6,
      background: i % 2 ? "rgba(255,240,215,0.16)" : "rgba(110,70,30,0.12)", filter: "blur(6px)", transform: `rotate(${(i % 2 ? -1 : 1) * 0.8}deg)` } })));

  // phone body
  // a pale plain case (the kit's held phone, kit/toon.ts drawProp) around a dark bezel
  const body = box(PH.x, PH.y, PH.w, PH.h, { borderRadius: PH.r, background: `linear-gradient(160deg, ${CASE}, #cfc8bc)`, boxShadow: `0 0 0 6px ${INK}, 0 26px 50px rgba(40,20,0,0.35)` },
    box(12, 12, PH.w - 24, PH.h - 24, { borderRadius: PH.r - 12, background: "linear-gradient(160deg, #2b2e3d, #15161f)" }));
  // screen: header + feed (clipped)
  const chips = ["全部", "心理学", "实验", "校园"];
  const feed = box(SC.x, SC.y, SC.w, SC.h, { borderRadius: SC.r, overflow: "hidden", background: `linear-gradient(180deg, ${UI.bg0}, ${UI.bg1})` }, [
    // the scrolling feed (local coords: screen top-left = 0,0)
    h("div", { key: "feed", style: { position: "absolute", left: 0, top: scroll, width: SC.w, height: SC.h } },
      // previous post's tail: its thumbnail's bottom and its action row
      box(20, HEAD_B - SC.y - 330, SC.w - 40, 250, { borderRadius: "0 0 26px 26px", background: "linear-gradient(180deg, #5b6f93, #46577a)" }),
      ...[["♡", "1.2万"], ["◯", "864"], ["↗", "分享"]].map(([ic, n], i) =>
        text(40 + i * 200, HEAD_B - SC.y - 60, 30, UI.sub, `${ic} ${n}`, {}, `a${i}`)),
      box(20, HEAD_B - SC.y + 4, SC.w - 40, 3, { background: UI.line }),
      // this post: author row, title, the thumbnail (drawn by the canvas) and its icons
      box(THUMB.x - SC.x, THUMB.y - SC.y - 186, 64, 64, { borderRadius: 32, background: "#fbf6ee", boxShadow: `0 0 0 4px ${INK}, 0 0 0 7px #ffc53d` }, [
        box(18, 26, 7, 9, { borderRadius: 4, background: INK }, null), box(39, 26, 7, 9, { borderRadius: 4, background: INK }, null),
        box(22, 42, 20, 5, { borderRadius: 3, background: INK }, null),
      ]),
      text(THUMB.x - SC.x + 84, THUMB.y - SC.y - 182, 32, UI.text, "老实验放映厅"),
      text(THUMB.x - SC.x + 84, THUMB.y - SC.y - 140, 24, UI.sub, "心理学 · 3天前"),
      text(THUMB.x - SC.x, THUMB.y - SC.y - 96, 66, UI.text, [h("span", { key: 0, style: { color: COL.gold } }, "1974年"), h("span", { key: 1 }, " 拉绳实验")]),
    ),
    // fixed header over the feed
    box(0, 0, SC.w, HEAD_B - SC.y, { background: UI.bg0, boxShadow: "0 8px 18px rgba(5,8,25,0.5)" }, [
      text(54, 34, 28, UI.text, "10:42", {}, "clock"),
      box(SC.w - 104, 38, 50, 22, { borderRadius: 6, border: `3px solid ${UI.text}`, boxSizing: "border-box" }, box(3, 3, 30, 10, { borderRadius: 2, background: UI.text })),
      box(SC.w / 2 - 70, 26, 140, 36, { borderRadius: 18, background: "#05060c" }),
      text(40, 92, 54, UI.text, "发现", {}, "title"),
      ...chips.map((c, i) => box(40 + i * 150, 162 - 8, 132, 46, { borderRadius: 23, background: i === 1 ? COL.gold : UI.chip, display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: FONT_STACK, fontWeight: 700, fontSize: 26, color: i === 1 ? INK : UI.sub }, c)),
    ]),
  ]);
  // icons over the thumbnail (fade before the zoom lands)
  const play = h("div", { style: { position: "absolute", left: 0, top: 0, opacity: iconO } },
    box(THUMB.x + THUMB.w / 2 - 66, THUMB.y + scroll + THUMB.h * 0.34 - 66, 132, 132, { borderRadius: 66, background: "rgba(12,14,30,0.55)", boxShadow: "0 0 0 5px rgba(255,255,255,0.9)" },
      h("div", { style: { position: "absolute", left: 50, top: 36, width: 0, height: 0, borderTop: "30px solid transparent", borderBottom: "30px solid transparent", borderLeft: "48px solid #fff" } })),
    box(THUMB.x + THUMB.w - 128, THUMB.y + scroll + 22, 106, 44, { borderRadius: 22, background: "rgba(12,14,30,0.6)", display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: FONT_STACK, fontWeight: 700, fontSize: 26, color: "#fff" }, "0:48"));
  // YOUR left hand: the arm comes up from the bottom edge, the ball hand sits BEHIND the phone's lower-left corner
  // (drawn under the body) and the thumb (a small ball) rests over the left bezel (drawn over it). Everything stays
  // left of / below the thumbnail (x < THUMB.x), so it is gone from the frame when the zoom lands.
  const svg = (kids: React.ReactNode[]) => h("svg", { width: W, height: H, viewBox: `0 0 ${W} ${H}`, style: { position: "absolute", left: 0, top: 0, overflow: "visible" } }, ...kids);
  const HAND = { x: PH.x + 22, y: PH.y + PH.h - 22 }, THB = { x: PH.x + 6, y: PH.y + PH.h - 130, r: 25 };
  const armD = `M${HAND.x - 150},${H + 160} Q${HAND.x - 120},${HAND.y + 150} ${HAND.x},${HAND.y}`;
  const handUnder = svg([
    h("path", { key: "ai", d: armD, stroke: INK, strokeWidth: 84, fill: "none", strokeLinecap: "round" }),
    h("path", { key: "a", d: armD, stroke: ARM, strokeWidth: 70, fill: "none", strokeLinecap: "round" }),
    h("circle", { key: "h", cx: HAND.x, cy: HAND.y, r: 48, fill: ARM, stroke: INK, strokeWidth: 7 })]);
  const thumb = svg([h("circle", { key: "t", cx: THB.x, cy: THB.y, r: THB.r, fill: ARM, stroke: INK, strokeWidth: 6 })]);

  return h("div", { style: { position: "absolute", inset: 0, overflow: "hidden", background: "#a87a48" } },
    zoomed([h("div", { key: "d", style: { position: "absolute", inset: 0 } }, desk), h("div", { key: "hu" }, handUnder), h("div", { key: "b" }, body), h("div", { key: "s" }, feed)]),
    h("canvas", { ref: cv, width: W, height: H, style: { position: "absolute", left: 0, top: 0, width: W, height: H } }),
    zoomed([h("div", { key: "p" }, play), h("div", { key: "t" }, thumb)]));
};
