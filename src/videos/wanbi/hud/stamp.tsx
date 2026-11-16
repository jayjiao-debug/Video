// hud/stamp.tsx: THE SEAL STAMPS (a copy of Hongmen's hud/stamp.tsx, with the English GLOSS under the seal).
//   stamp({ f, id: "wanbi", from: HIT.wanbi, out: 508, x: 860, y: 470 })       「完璧，归赵」 a 2 x 2 seal (220 x 220 px)
//   stamp({ f, id: "nufa", from: HIT.nufa, out: 842, x: 190, y: 420 })         「怒发，冲冠」
//   stamp({ f, id: "liancheng", from: HIT.liancheng, out: 1975, x: 540, y: 270 })  「价值连城」 one row (124 px)
//   stamp({ f, id: "zero", from, x, y, size: 90 })                             the bill's 「0」 (bill() stamps its own)
//   stamp({ f, text: "…", from, x, y, size })                                  any words (a full-width comma starts a row)
// A stamp is a red seal with cream characters, slapped on: it arrives large over 2 frames, LANDS on from + 2 with a
// 5-frame shake and a ring of dashes, holds, and leaves over 5 frames from `out` (default from + 36). The seal is
// CHINESE in both languages (owner's decision); in English a white 44 px gloss with an ink line sits under it,
// level (not turned with the seal), wrapped into balanced rows of at most 16 letters, or one row when it fits under a
// wide seal. Default place: upper third (540, 440). Keep it out of the caption band: stampRect(p) is the box it takes.
import React from "react";
import { L } from "../lang";
import { HC, clamp01, eOut, hash01, lerp, life, layerAt, svg0, svgText, textW, wrapRows, type Rect } from "./base";

/** the three idioms and the bill's 「0」 */
export type StampId = "wanbi" | "nufa" | "liancheng" | "zero";
/** the seal's characters: Chinese in BOTH languages (owner's decision: Chinese seal + English gloss); ， starts a row */
export const STAMP_TEXT: Record<StampId, string> = { wanbi: "完璧，归赵", nufa: "怒发，冲冠", liancheng: "价值连城", zero: "0" };
/** the English gloss under the seal (white, 44 px, wrapped at 16 letters); none in Chinese */
export const STAMP_GLOSS: Record<StampId, string> = {
  wanbi: L("", "return the jade intact"), nufa: L("", "hair lifting his hat"), liancheng: L("", "worth a string of cities"), zero: "",
};
export type StampProps = {
  f: number; from: number; len?: number; out?: number; key?: string;
  id?: StampId; text?: string;
  /** the gloss under the seal (default STAMP_GLOSS[id]); false = none */ gloss?: string | false;
  /** the seal's centre in px */ x?: number; y?: number;
  /** character size in px (default: a 2 x 2 seal 220 x 220 px, one row 124 px) */ size?: number;
  /** resting tilt in degrees (default -5) */ rot?: number;
};
const GLOSS = 44, GLOSS_ROW = 52, RIM = 9;
/** the seal's metrics, the gloss rows and the whole block (seal centre at 0, 0) */
export const stampLayout = (p: Pick<StampProps, "id" | "text" | "size" | "gloss">) => {
  const rows = (p.text ?? STAMP_TEXT[p.id ?? "wanbi"]).split(/[，,]\s*/).filter(Boolean);
  const size = p.size ?? (rows.length > 1 ? 78 : 124), ls = size * 0.1, rh = size * 1.1, pad = size * 0.34;
  const w = Math.max(...rows.map((r) => textW(r, size, ls))) + 2 * pad, h = rows.length * rh + 2 * pad;
  const g = p.gloss === false ? "" : p.gloss ?? (p.id ? STAMP_GLOSS[p.id] : "");
  // the gloss: one row if it fits under the seal, else balanced rows of at most 16 letters
  const gw = textW(g, GLOSS, 1);
  const grows = !g ? [] : gw <= w + 2 * RIM ? [g] : wrapRows(g, 16);
  const gy0 = h / 2 + RIM + 14 + GLOSS * 0.55;                                   // the first gloss row's centre
  const gwMax = Math.max(0, ...grows.map((r) => textW(r, GLOSS, 1))) + 2 * 9;    // its ink line included
  const bw = Math.max(w + 2 * RIM, gwMax), top = -h / 2 - RIM, bottom = grows.length ? gy0 + (grows.length - 1) * GLOSS_ROW + GLOSS * 0.55 + 9 : h / 2 + RIM + 11;
  return { rows, size, ls, rh, pad, w, h, grows, gy0, block: { w: bw, h: bottom - top, top, bottom } };
};
/** the box a stamp takes (seal, rim, shadow and gloss), in px */
export const stampSize = (p: Pick<StampProps, "id" | "text" | "size" | "gloss">): { w: number; h: number } => {
  const S = stampLayout(p);
  return { w: Math.round(S.block.w), h: Math.round(S.block.h) };
};
/** the box a stamp takes on screen, at its place (x, y default 540, 440); the tilt is not counted (a few px) */
export const stampRect = (p: Pick<StampProps, "id" | "text" | "size" | "gloss" | "x" | "y">): Rect => {
  const S = stampLayout(p), x = p.x ?? 540, y = p.y ?? 440;
  return { x0: x - S.block.w / 2, y0: y + S.block.top, x1: x + S.block.w / 2, y1: y + S.block.bottom };
};
/** a rounded block whose edge is a little uneven, as a carved seal's (deterministic) */
const sealPath = (w: number, h: number, seed: number) => {
  const pts: [number, number][] = [], r = Math.min(20, h * 0.12), n = (len: number) => Math.max(2, Math.round(len / 46));
  const edge = (x0: number, y0: number, x1: number, y1: number, k: number) => {
    const m = n(Math.hypot(x1 - x0, y1 - y0));
    for (let i = 0; i <= m; i++) {
      const u = i / m, j = (hash01(i + k * 31, seed) - 0.5) * 5, nx = (y1 - y0) === 0 ? 0 : 1, ny = (y1 - y0) === 0 ? 1 : 0;
      pts.push([lerp(x0, x1, u) + nx * j, lerp(y0, y1, u) + ny * j]);
    }
  };
  edge(-w / 2 + r, -h / 2, w / 2 - r, -h / 2, 1); edge(w / 2, -h / 2 + r, w / 2, h / 2 - r, 2);
  edge(w / 2 - r, h / 2, -w / 2 + r, h / 2, 3); edge(-w / 2, h / 2 - r, -w / 2, -h / 2 + r, 4);
  return "M" + pts.map((q) => `${q[0].toFixed(1)},${q[1].toFixed(1)}`).join(" L") + " Z";
};
/** the seal itself as SVG nodes centred on (0, 0) (also the bill's 「0」) */
export const sealNodes = (S: ReturnType<typeof stampLayout>) => {
  const seed = [...S.rows.join("")].reduce((a, c) => a + (c.codePointAt(0) ?? 0), 0) % 97;
  const kids: React.ReactNode[] = [
    <rect key="sh" x={-S.w / 2 - RIM} y={-S.h / 2 - RIM + 11} width={S.w + 2 * RIM} height={S.h + 2 * RIM} rx={24} fill={HC.shadow} />,
    <rect key="rim" x={-S.w / 2 - RIM} y={-S.h / 2 - RIM} width={S.w + 2 * RIM} height={S.h + 2 * RIM} rx={24} fill={HC.cream} stroke={HC.ink} strokeWidth={5} />,
    <path key="red" d={sealPath(S.w, S.h, seed)} fill={HC.seal} stroke={HC.seal} strokeWidth={4} strokeLinejoin="round" />,
    <rect key="in" x={-S.w / 2 + 11} y={-S.h / 2 + 11} width={S.w - 22} height={S.h - 22} rx={9} fill="none" stroke={HC.cream} strokeWidth={3.5} opacity={0.9} />,
  ];
  S.rows.forEach((row, ri) => kids.push(svgText(`r${ri}`, row, 0, -S.h / 2 + S.pad + S.rh * (ri + 0.5), S.size, HC.cream, { ls: S.ls })));
  return kids;
};
/** a red seal with cream characters, slapped on (lands on from + 2 with a shake), 36-40 frames. */
export const stamp = (p: StampProps): React.ReactNode => {
  const { f, from, x = 540, y = 440, rot = -5 } = p, out = p.out ?? from + (p.len ?? 36), Lf = life(f, from, out);
  if (!Lf) return null;
  const S = stampLayout(p), t = Lf.t, key = p.key ?? `stamp-${p.id ?? p.text}-${from}`;
  // the slap: large and a little turned on `from`, down on from + 2, a squash, then rest
  const sc = t === 0 ? 1.7 : t === 1 ? 1.28 : t === 2 ? 0.95 : t === 3 ? 1.03 : 1;
  const sh = t >= 2 && t < 8 ? [0, 10, -8, 5, -3, 1][t - 2] : 0, rr = rot + (t === 0 ? -7 : t === 1 ? -3 : t >= 2 && t < 7 ? [0, 1.8, -1.3, 0.8, -0.4][t - 2] : 0);
  const op = (t === 0 ? 0.75 : 1) * (1 - Lf.lv), s = sc * (1 + 0.07 * Lf.lv);
  // the ring of dashes on the landing (from + 2 .. from + 9)
  const u = (t - 2) / 8, dash: React.ReactNode[] = [];
  if (u >= 0 && u < 1) {
    const k = 1 - Math.pow(1 - u, 2), len = 40 * (1 - u), n = 14;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + 0.2, c = Math.cos(a), sn = Math.sin(a), rx = S.w / 2 + 34 + 46 * k, ry = S.h / 2 + 34 + 46 * k;
      const d = `M${(c * rx).toFixed(1)},${(sn * ry).toFixed(1)} L${(c * (rx + len)).toFixed(1)},${(sn * (ry + len)).toFixed(1)}`;
      dash.push(<path key={`a${i}`} d={d} stroke={HC.ink} strokeWidth={17} />, <path key={`b${i}`} d={d} stroke={HC.cream} strokeWidth={9} />);
    }
  }
  // the gloss: level, under the seal, in with the landing (a 3-frame rise), out with the stamp
  const gk = eOut((t - 1) / 3);
  const gloss = S.grows.length && gk > 0 ? layerAt(`${key}g`, x, y + 10 * (1 - gk), { op: clamp01(gk * 1.5) * (1 - Lf.lv) },
    svg0("s", ...S.grows.map((r, i) => svgText(`g${i}`, r, 0, S.gy0 + i * GLOSS_ROW, GLOSS, HC.white, { ls: 1, sw: 9 })))) : null;
  return (
    <React.Fragment key={key}>
      {dash.length ? layerAt(`${key}d`, x, y, { rot, op: 1 - u * u }, svg0("s", <g key="g" strokeLinecap="round" fill="none">{dash}</g>)) : null}
      {layerAt(key, x + sh, y, { s, rot: rr, op }, svg0("s", ...sealNodes(S)))}
      {gloss}
    </React.Fragment>
  );
};
