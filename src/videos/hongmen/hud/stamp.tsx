// hud/stamp.tsx: THE SEAL STAMPS and THE TITLE.
//   stamp({ f, id: "dance", from: HIT.idiomDance })        「项庄舞剑，意在沛公」 (two rows of four)
//   stamp({ f, id: "fish", from: HIT.daozu })              「人为刀俎，我为鱼肉」
//   stamp({ f, id: "qinjia", from: HIT.qinjia, x, y })     「亲家」        stamp({ f, id: "raw", from: HIT.raw, x, y })  「生的」
//   stamp({ f, text: "…", from, x, y, size })              any words (a full-width comma starts a new row)
// A stamp is a red seal with cream characters, slapped on: it arrives large over 2 frames, LANDS on from + 2 with a
// 5-frame shake and a ring of dashes, holds, and is gone `len` frames after `from` (default 36 = 1.2 s). Default
// place: upper third (x 540, y 440), never in the caption band.
//   title({ f, from: HIT.title, ask: HIT.oneDead, out })   《鸿门宴，到底死了谁？》: 鸿门宴 slams in (gold on ink),
//                                                          到底死了谁？ pops under it on `ask` (omit = together)
import React from "react";
import { EN, TXT } from "../lang";
import { HC, FULL, clamp01, eOut, hash01, lerp, life, layerAt, springAt, svg0, svgText, inkText, textW, PUNCH, SNAP } from "./base";

export type StampId = "dance" | "fish" | "qinjia" | "raw";
const STAMP_TEXT: Record<StampId, string> = { dance: TXT.idiomDance, fish: TXT.idiomFish, qinjia: TXT.qinjia, raw: TXT.raw };
/** rows: Chinese breaks at the full-width comma; English wraps at about 16 letters */
const rowsOf = (s: string): string[] => {
  if (!EN) return s.split(/[，,]\s*/).filter(Boolean);
  const out: string[] = []; let cur = "";
  for (const w of s.split(" ")) { if (cur && (cur + " " + w).length > 16) { out.push(cur); cur = w; } else cur = cur ? cur + " " + w : w; }
  if (cur) out.push(cur);
  return out;
};
export type StampProps = {
  f: number; from: number;
  id?: StampId; text?: string;
  /** frames from `from` to the first frame of the leave (default 36); or `out` = that frame */ len?: number; out?: number;
  /** centre in px (default 540, 440) */ x?: number; y?: number;
  /** character size in px (default: 88 for two rows, 124 for one) */ size?: number;
  /** resting tilt in degrees (default -5) */ rot?: number;
  key?: string;
};
/** the size of a stamp's block in px (for a builder who wants to keep something clear of it) */
export const stampSize = (p: Pick<StampProps, "id" | "text" | "size">) => {
  const rows = rowsOf(p.text ?? (p.id ? STAMP_TEXT[p.id] : "")), size = p.size ?? (EN ? 64 : rows.length > 1 ? 88 : 124);
  const cw = size * 1.1, rh = size * 1.2, pad = size * 0.34;
  const w = Math.max(...rows.map((r) => (EN ? textW(r, size, 2) : [...r].length * cw))) + 2 * pad, h = rows.length * rh + 2 * pad;
  return { rows, size, cw, rh, pad, w, h };
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
  return "M" + pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" L") + " Z";
};
export const stamp = (p: StampProps): React.ReactNode => {
  const { f, from, x = 540, y = 440, rot = -5 } = p, out = p.out ?? from + (p.len ?? 36), L = life(f, from, out);
  if (!L) return null;
  const S = stampSize(p), t = L.t, key = p.key ?? `stamp-${p.id ?? p.text}-${from}`;
  // the slap: large and a little turned on `from`, down on from + 2, a squash, then rest
  const sc = t === 0 ? 1.7 : t === 1 ? 1.28 : t === 2 ? 0.95 : t === 3 ? 1.03 : 1;
  const sh = t >= 2 && t < 8 ? [0, 10, -8, 5, -3, 1][t - 2] : 0, rr = rot + (t === 0 ? -7 : t === 1 ? -3 : t >= 2 && t < 7 ? [0, 1.8, -1.3, 0.8, -0.4][t - 2] : 0);
  const op = (t === 0 ? 0.75 : 1) * (1 - L.lv), s = sc * (1 + 0.07 * L.lv);
  const seed = [...S.rows.join("")].reduce((a, c) => a + (c.codePointAt(0) ?? 0), 0) % 97;
  const kids: React.ReactNode[] = [
    <rect key="sh" x={-S.w / 2 - 9} y={-S.h / 2 - 9 + 11} width={S.w + 18} height={S.h + 18} rx={24} fill={HC.shadow} />,
    <rect key="rim" x={-S.w / 2 - 9} y={-S.h / 2 - 9} width={S.w + 18} height={S.h + 18} rx={24} fill={HC.cream} stroke={HC.ink} strokeWidth={5} />,
    <path key="red" d={sealPath(S.w, S.h, seed)} fill={HC.seal} stroke={HC.seal} strokeWidth={4} strokeLinejoin="round" />,
    <rect key="in" x={-S.w / 2 + 11} y={-S.h / 2 + 11} width={S.w - 22} height={S.h - 22} rx={9} fill="none" stroke={HC.cream} strokeWidth={3.5} opacity={0.9} />,
  ];
  S.rows.forEach((row, ri) => {
    const cy = -S.h / 2 + S.pad + S.rh * (ri + 0.5);
    if (EN) kids.push(svgText(`r${ri}`, row, 0, cy, S.size, HC.cream, { ls: 2 }));
    else { const cs = [...row], x0 = -((cs.length - 1) * S.cw) / 2; cs.forEach((c, ci) => kids.push(svgText(`r${ri}c${ci}`, c, x0 + ci * S.cw, cy, S.size, HC.cream))); }
  });
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
  return (
    <React.Fragment key={key}>
      {dash.length ? layerAt(`${key}d`, x, y, { rot, op: 1 - u * u }, svg0("s", <g key="g" strokeLinecap="round" fill="none">{dash}</g>)) : null}
      {layerAt(key, x + sh, y, { s, rot: rr, op }, svg0("s", ...kids))}
    </React.Fragment>
  );
};
export const Stamp: React.FC<StampProps> = (p) => <>{stamp(p)}</>;

// ---------------------------------------------------------------------------------------------------- the title
export type TitleProps = {
  f: number; from: number;
  /** the frame 到底死了谁？ pops in (default: from + 8) */ ask?: number;
  /** first frame of the 4-frame leave */ out?: number;
  /** centre of the big row (default 540, 330) */ x?: number; y?: number;
  /** size of the big row in px (default 178) */ size?: number;
  /** false = only the big row 鸿门宴 */ question?: boolean;
};
/** the widest the English title row may be, px (the frame's 1080 less 120 px a side: tall phones cut the sides) */
const TITLE_EN_W = 840;
/** THE TITLE 《鸿门宴，到底死了谁？》: no plate, type on a thick ink line. The big row slams (large -> rest over 3 frames,
 *  a settle); a short red rule is drawn under it; the question pops in white with 谁？ in gold. */
export const title = (p: TitleProps): React.ReactNode => {
  const { f, from, x = 540, y = 330, question = true } = p, L = life(f, from, p.out, 4);
  if (!L) return null;
  // (English: the size a builder asks for is for the three Chinese characters; the English title is kept to TITLE_EN_W)
  const size0 = p.size ?? (EN ? 96 : 178), size = EN ? Math.min(size0, Math.floor((size0 * TITLE_EN_W) / textW(TXT.title, size0, Math.round(size0 * 0.07)))) : size0, t = L.t, ask = p.ask ?? from + 8;
  const k = clamp01((t + 1) / 3), settle = t > 2 ? 0.05 * Math.exp(-(t - 2) / 2.2) * Math.cos((t - 2) * 1.9) : 0;
  const s = (lerp(2.2, 1, eOut(k)) - settle) * (1 + 0.06 * L.lv), op = clamp01((t + 1) / 2) * (1 - L.lv);
  const main = TXT.title, n = [...main].length, ls = Math.round(size * 0.07), mw = EN ? textW(main, size, 2) : n * size + (n - 1) * ls;
  const rule = eOut((t - 3) / 6), q = TXT.titleAsk, qs = Math.round(size * (EN ? 0.6 : 0.5)), qk = springAt(f, ask, PUNCH), cut = EN ? q.lastIndexOf(" ") + 1 : Math.max(0, [...q].length - 2);
  const qa = [...q].slice(0, cut).join(""), qb = [...q].slice(cut).join("");
  return (
    <div key={`title${from}`} style={FULL}>
      <div style={{ position: "absolute", left: x, top: y, width: 0, height: 0, opacity: op }}>
        <div style={{ position: "absolute", left: 0, top: 0, transform: `translate(-50%,-50%) scale(${s.toFixed(4)}) rotate(${(-3 * (1 - k)).toFixed(2)}deg)`, ...inkText(size, HC.gold, Math.round(size * 0.1)), letterSpacing: ls, paddingLeft: ls }}>{main}</div>
        {rule > 0 ? <div style={{ position: "absolute", left: -mw / 2, top: size * 0.62, width: mw * rule, height: 12, borderRadius: 6, background: HC.seal, boxShadow: `0 0 0 5px ${HC.ink}, 0 9px 0 5px rgba(8,8,16,0.35)` }} /> : null}
        {question && f >= ask ? (
          <div style={{ position: "absolute", left: 0, top: size * 0.62 + 28 + qs * 0.62, transform: `translate(-50%,-50%) scale(${(0.5 + 0.5 * qk).toFixed(4)})`, whiteSpace: "nowrap", opacity: clamp01((f - ask + 1) / 2) }}>
            <span style={{ ...inkText(qs, HC.white), letterSpacing: 3 }}>{qa}</span>
            <span style={{ ...inkText(qs, HC.gold), letterSpacing: 3, display: "inline-block", transform: `scale(${(1 + 0.25 * (1 - springAt(f, ask + 3, SNAP))).toFixed(4)})`, transformOrigin: "50% 70%" }}>{qb}</span>
          </div>
        ) : null}
      </div>
    </div>
  );
};
export const TitleCard: React.FC<TitleProps> = (p) => <>{title(p)}</>;
