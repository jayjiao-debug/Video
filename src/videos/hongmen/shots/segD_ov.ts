// Segment D's own 2D overlays (hook-free: plain functions of the frame that return React nodes, built with h(...)).
// STAND-INS for the film-wide overlay components of src/videos/hongmen/hud/ (name tags, idiom stamps): that folder
// did not exist when segment D was built. Each function takes the frame and px on the 1080 x 1920 frame, so swapping
// a hud component in is one line in segD.ts (its "overlays" lines).
//   tag       a name tag: the name in gold, the role in white under it
//   burst     radial dashes on a hit
//   stampAt   the kit's red rubber stamp (生的)
//   idiom     an idiom plate: small gold characters on one line (人为刀俎，我为鱼肉), the second half lands later
// Nothing here keeps state; nothing is random.
import type React from "react";
import { COL, PUNCH, SNAP, Stamp, springAt, ts } from "../../group/kit/overlay";
import { STAMP_CW } from "../lang";
import { clamp01, h } from "../story";

const FULL: React.CSSProperties = { position: "absolute", left: 0, top: 0, width: 1080, height: 1920, pointerEvents: "none", overflow: "hidden" };
const eIn = (x: number) => Math.pow(clamp01(x), 3);
/** 0 before `out`, 1 seven frames later (the leave of every overlay) */
const leave = (f: number, out?: number) => (out === undefined ? 0 : eIn((f - out) / 7));

/** a name tag centred on (x, y): pops in by a spring on `at`, leaves over 7 frames from `out` */
export const tag = (f: number, o: { at: number; out?: number; x: number; y: number; text: string; sub?: string; size?: number; color?: string }): React.ReactNode => {
  if (f < o.at) return null;
  const lv = leave(f, o.out); if (lv >= 1) return null;
  const size = o.size ?? 84, k = springAt(f, o.at, PUNCH), ks = springAt(f, o.at + 3, SNAP);
  return h("div", { style: FULL, key: `tag${o.at}` },
    h("div", { style: { position: "absolute", left: o.x, top: o.y, width: 0, height: 0, opacity: 1 - lv } },
      h("div", { style: { position: "absolute", left: 0, top: 0, transform: `translate(-50%,-50%) scale(${(0.5 + 0.5 * k) * (1 - 0.3 * lv)})`, display: "flex", flexDirection: "column", alignItems: "center", whiteSpace: "nowrap" } },
        h("span", { style: ts(size, o.color ?? COL.gold) }, o.text),
        o.sub ? h("span", { style: { ...ts(Math.round(size * 0.52), COL.white), marginTop: 8, transform: `scale(${ks})`, display: "inline-block" } }, o.sub) : null)));
};

/** radial dashes for 8 frames from `at` (the shield on the guards) */
export const burst = (f: number, o: { at: number; x: number; y: number; r?: number; n?: number; color?: string }): React.ReactNode => {
  const u = (f - o.at) / 8;
  if (u < 0 || u >= 1) return null;
  const r = o.r ?? 120, n = o.n ?? 10, color = o.color ?? COL.gold;
  const r0 = r * (0.35 + 0.65 * (1 - Math.pow(1 - u, 2))), len = r * 0.42 * (1 - u), op = 1 - u * u;
  return h("svg", { key: `burst${o.at}`, width: 1080, height: 1920, viewBox: "0 0 1080 1920", style: { ...FULL, overflow: "visible" } },
    h("g", { opacity: op, strokeLinecap: "round", fill: "none" },
      ...Array.from({ length: n }, (_, i) => {
        const a = (i / n) * Math.PI * 2 + 0.3, c = Math.cos(a), s = Math.sin(a);
        const d = `M${o.x + c * r0},${o.y + s * r0} L${o.x + c * (r0 + len)},${o.y + s * (r0 + len)}`;
        return h("g", { key: i }, h("path", { d, stroke: COL.ink, strokeWidth: 17 }), h("path", { d, stroke: color, strokeWidth: 9 }));
      })));
};

/** the kit's red rubber stamp: it lands 3 frames after `at` */
export const stampAt = (f: number, at: number, out: number, x: number, y: number, text: string, size = 130, rot = -7): React.ReactNode =>
  h(Stamp, { key: `stamp${at}`, at, out, x, y, text, size, rot, cw: STAMP_CW, frame: f });

/** AN IDIOM PLATE in the upper third: two halves on one line (centred on x, y); the first lands on `at`, the second on
 *  `at2`; both leave from `out`. Gold characters with the ink edge of the tags, a thin gold rule under them. */
export const idiom = (f: number, o: { at: number; at2: number; out: number; x: number; y: number; a: string; b: string; size?: number }): React.ReactNode => {
  if (f < o.at) return null;
  const lv = leave(f, o.out); if (lv >= 1) return null;
  const size = o.size ?? 74, k1 = springAt(f, o.at, PUNCH), k2 = springAt(f, o.at2, PUNCH), on2 = f >= o.at2;
  const half = (txt: string, k: number, show: boolean, key: string) => h("span", { key, style: { ...ts(size, COL.gold), display: "inline-block", transform: `scale(${0.6 + 0.4 * k})`, opacity: show ? 1 : 0 } }, txt);
  return h("div", { style: FULL, key: `idiom${o.at}` },
    h("div", { style: { position: "absolute", left: o.x, top: o.y, width: 0, height: 0, opacity: 1 - lv } },
      h("div", { style: { position: "absolute", left: 0, top: 0, transform: `translate(-50%,-50%) scale(${1 - 0.2 * lv})`, display: "flex", flexDirection: "column", alignItems: "center", whiteSpace: "nowrap" } },
        h("div", { style: { display: "flex", flexDirection: "row", alignItems: "center" } }, half(o.a, k1, true, "a"), half(o.b, k2, on2, "b")),
        h("div", { style: { width: `${Math.round(100 * (on2 ? 0.5 + 0.5 * clamp01(k2) : 0.5 * clamp01(k1)))}%`, height: 6, marginTop: 14, borderRadius: 3, background: COL.gold, boxShadow: `0 0 0 3px ${COL.ink}`, alignSelf: "flex-start" } }))));
};
