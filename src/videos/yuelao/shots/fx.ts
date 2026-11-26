// THE EFFECTS A SHOT LAYS OVER ITS PICTURE, each with the box it takes, so the overlay check (preview/audit.ts) can
// see every one: nothing on a face, a subtitle, the REC display or the app's buttons, nothing outside the phone-safe
// frame, no two on each other, none in the quiet scene. A shot builds a list of these, returns their nodes as its
// overlays and the list itself as `shown`.
// The series rules they follow (day-in-life-film): an effect is earned by the picture, lands in the gap after a line,
// never repeats the subtitle, at most one every 8 seconds; cards belong to the sources' voice (facts, files, seals).
import React from "react";
import { FRAME_9x16, rectOf, slots, fit, type Rect } from "../../../kit/overlay/frame";
import { Hua, FateStamp, OS, CaseFile, Disclaimer, OrderSlip, Snaps, SideCard, SIDE_W, SIDE_H, CASE_W, CASE_H, type CaseKind } from "../hud/skin";

export type Fx = { what: string; kind: "card" | "effect"; from: number; to: number; rect: Rect; node: React.ReactNode };
const h = React.createElement;
/** a line's width in ems: CJK = 1, Latin and digits = 0.6 */
const em = (s: string) => [...s].reduce((a, c) => a + (c.charCodeAt(0) < 0x2e80 ? 0.62 : 1), 0);
/** the box of a w x h piece turned by `rot` degrees round its centre */
const turned = (cx: number, cy: number, w: number, h: number, rot = 0) => { const a = Math.abs((rot * Math.PI) / 180), c = Math.cos(a), s = Math.sin(a); return rectOf(cx, cy, w * c + h * s, w * s + h * c); };

/** 花字: a punch word in foil type, centred on (x, y) */
export const hua = (f: number, o: { from: number; to: number; text: string; x: number; y: number; px?: number; rot?: number; col?: string }): Fx => {
  const px = o.px ?? 96;
  return { what: `花字「${o.text}」`, kind: "effect", from: o.from, to: o.to, rect: turned(o.x, o.y, em(o.text) * (px + 4) + px * 0.3, px * 1.36, o.rot ?? -5), node: h(Hua, { key: `hua${o.from}`, f, ...o }) };
};
/** the running gag's stamp: 缘分未到 (ok: 缘分已到), centred on (x, y) */
export const stamp = (f: number, o: { from: number; to: number; x: number; y: number; ok?: boolean; rot?: number; px?: number }): Fx => {
  const px = o.px ?? 104;
  return { what: o.ok ? "印「缘分已到」" : "印「缘分未到」", kind: "effect", from: o.from, to: o.to, rect: turned(o.x, o.y, px * 4 + 90 + px * 0.1, px * 1.5 + px * 0.1, o.rot ?? -9), node: h(FateStamp, { key: `st${o.from}`, f, ...o }) };
};
/** 记者OS: her unspoken aside, a small tag whose top-left is (x, y) */
export const os = (f: number, o: { from: number; to: number; x: number; y: number; text: string }): Fx =>
  ({ what: `记者OS「${o.text}」`, kind: "effect", from: o.from, to: o.to, rect: { x0: o.x, y0: o.y, x1: o.x + [...o.text].length * 38 + 150 + 5, y1: o.y + 71 }, node: h(OS, { key: `os${o.from}`, f, ...o }) });
/** a case file's card, centred on (x, y), scaled by s */
export const caseFile = (f: number, o: { from: number; to: number; x: number; y: number; kind: CaseKind; stampAt: number; rot?: number; s?: number; seal?: boolean }): Fx => {
  const s = o.s ?? 1;
  return { what: `卷宗 ${o.kind}`, kind: "card", from: o.from, to: o.to, rect: turned(o.x, o.y + 4, (CASE_W + 8) * s, (CASE_H + 10) * s, o.rot ?? -3), node: h(CaseFile, { key: `cf${o.from}`, f, ...o }) };
};
/** the small note under the files: one line of 30 px type centred on x 540 */
export const disclaimer = (f: number, o: { from: number; to: number; y: number; text: string }): Fx =>
  ({ what: "注「纯属演绎」", kind: "card", from: o.from, to: o.to, rect: rectOf(540, o.y, em(o.text) * 30 + 16, 44), node: h(Disclaimer, { key: `dc${o.from}`, f, ...o }) });
/** the temple's order slip, centred on (x, y) */
export const orderSlip = (f: number, o: { from: number; to: number; x: number; y: number }): Fx =>
  ({ what: "加急单", kind: "card", from: o.from, to: o.to, rect: turned(o.x + 3, o.y + 5, 528, 480, 3), node: h(OrderSlip, { key: `ord${o.from}`, f, ...o }) });
/** the snapped-thread counter, centred near (x + 35, y) */
export const snaps = (f: number, o: { from: number; to: number; x: number; y: number; hits: number[] }): Fx =>
  ({ what: "计数「已断 n 根」", kind: "effect", from: o.from, to: o.to, rect: turned(o.x + 35, o.y, 360, 150, -4), node: h(Snaps, { key: `sn${o.from}`, f, ...o }) });
/** A SIDE CHARACTER'S CARD, travelling with the person: placed each frame in a free slot beside the face (`side`
 *  names the slot the shot wants; the next free one is taken when that one is too small). face = the person's head
 *  on screen { x, y, r } (verbs headPx); keep = boxes that must stay visible (another face). */
export const sideCard = (f: number, o: { from: number; to: number; name: string; note: string; face: { x: number; y: number; r: number }; side?: "left" | "right" | "above" | "below"; keep?: Rect[] }): Fx => {
  const F = o.face, box = rectOf(F.x, F.y, F.r * 2.3, F.r * 2.3);
  const all = slots(FRAME_9x16, box, { gap: 28, reach: 260, keep: o.keep, min: 150 });
  const S = all.find((s) => s.name === (o.side ?? "right") && s.clear && s.w >= SIDE_W * 0.7 && s.h >= SIDE_H * 0.7) ?? all.find((s) => s.clear) ?? all[0];
  const B = S ? fit({ w: SIDE_W + 10, h: SIDE_H + 12 }, S.r, { ax: S.name === "left" ? 1 : S.name === "right" ? 0 : 0.5, ay: S.name === "above" ? 1 : S.name === "below" ? 0 : 0.35 }) : { r: rectOf(540, 500, SIDE_W, SIDE_H), s: 1 };
  const r = B.r, s = Math.min(1, B.s);
  return { what: `人物卡 ${o.name}`, kind: "card", from: o.from, to: o.to, rect: r, node: h(SideCard, { key: `side${o.from}`, f, from: o.from, to: o.to, x: r.x0, y: r.y0, s, name: o.name, note: o.note, tx: F.x + (r.x0 > F.x ? F.r * 0.9 : r.x1 < F.x ? -F.r * 0.9 : 0), ty: F.y + (r.y0 > F.y + F.r ? F.r : 0) }) };
};
/** the nodes of the effects that show on frame f, as one fragment */
export const draw = (f: number, list: Fx[]) => h(React.Fragment, null, ...list.filter((x) => f >= x.from && f <= x.to).map((x) => x.node));
