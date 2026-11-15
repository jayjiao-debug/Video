// hud/tag.tsx: THE NAME TAGS (a copy of Hongmen's hud/tag.tsx with this film's two camps and the 23b flip).
// A tag is a plate in its camp's colour (QIN charcoal with a gold name, ZHAO teal with a cream name), the role in a
// darker band under it, and a tail whose tip sits just above the person's head. It pops out of the head (the tail's
// tip is the centre of the pop), stays TAG_LEN frames (or to `out`), leaves in 5.
//   tag({ f, who: "qinWang", at: headPx(w, king), from: TAG.qinWang, out: TAG_OUT.qinWang })      one tag
//   tags(f, [{ who: "miao", at: hm, from: TAG.miao }, { who: "lin5", at: hl, from: TAG.lin5 }], { avoid: [hk] })
// WHERE a tag goes is decided by `placeTags` (general, no per-shot numbers): above the head if there is room (at the
// head's scale, else at scale 1); else beside it; never over any head of the list (or of `avoid`), never in the caption
// band, never above the top safe line or under the app's button column, never over another tag, the source tag's
// corner or the jade chip's corner. The tail always ends on the head it names. Give the SAME list on every frame of the
// shot (a tag that has not started or has left still holds its place, so nothing jumps). If a head travels far while
// its tag is up and the plate changes sides, pin it (`side`, and `scale` if needed). To keep a plate off something that
// is not a head (a stamp, the arch of cities), put a circle for it into `avoid` ({ x, y, r }).
// THE FLIP (23b): with `flipAt` the role row reads TAGS[who].role until that frame and then FLIPS (squash, jolt, a gold
// burst) to TAGS[who].flip (宦官的门客 -> 上大夫 / "the eunuch's retainer" -> "senior official"). The plate is placed
// for its larger state, so the flip does not move it.
import React from "react";
import { EN, L } from "../lang";
import { TAG_LEN, type TagKey } from "../beats";
import { CAMP, HC, ZONE, FW, FULL, CHIP_RECT, SOURCE_RECT, plate, plateSize, rectOf, overlap, hitsCircle, springAt, life, layerAt, svg0, clamp, PUNCH,
  type Camp, type Head, type Rect, type PlateSpec } from "./base";

export { TAG_X } from "./base";
/** who a tag names: the keys of beats.ts TAG (one entry per tag of the storyboard's table) */
export type Who = TagKey;
/** the tag strings (BIBLE 5, BUILD_PLAN 5). name row + role row; `flip` = the role after flipAt (23b). The envoy's
 *  first tag (lin0) has no English role row; 5b and 23b carry "the eunuch's retainer". */
export const TAGS: Record<Who, { camp: Camp; name: string; role: string; flip?: string }> = {
  lin0: { camp: "zhao", name: L("蔺相如", "the envoy"), role: L("宦官的门客", "") },
  lin5: { camp: "zhao", name: L("蔺相如", "the envoy"), role: L("宦官的门客", "the eunuch's retainer") },
  lin23: { camp: "zhao", name: L("蔺相如", "the envoy"), role: L("宦官的门客", "the eunuch's retainer"), flip: L("上大夫", "senior official") },
  qinWang: { camp: "qin", name: L("秦王", "King of Qin"), role: "" },
  zhaoWang: { camp: "zhao", name: L("赵王", "King of Zhao"), role: "" },
  zhaoMin: { camp: "zhao", name: L("赵国大臣", "Zhao's ministers"), role: "" },
  miao: { camp: "zhao", name: L("赵国宦官", "the eunuch"), role: "" },
  ladies: { camp: "qin", name: L("美人", "the king's ladies"), role: "" },
  qinMin: { camp: "qin", name: L("秦国大臣", "Qin's ministers"), role: "" },
  servant: { camp: "zhao", name: L("随从", "his servant"), role: "" },
};
/** how far above the head's centre each tail ends, in head radii (headPx().r = 0.24 m on screen, the head's half
 *  WIDTH): the top of each one's headwear plus about 0.2 (BIBLE 5; WP4's line-up). lin0 = LIN_RAGE (the wrap lifted
 *  0.13 m by the rage hair); lin23 = placed for LIN_OFFICIAL's tall cap (the swap lands while the tag is up); the
 *  King of Qin's head is drawn 1.08 x, under the flat crown board; zhaoMin / qinMin name a group: the caps. A shot
 *  that measures better numbers passes `lift`. */
export const TAG_LIFT: Record<Who, number> = {
  lin0: 1.95, lin5: 1.4, lin23: 1.95, qinWang: 1.6, zhaoWang: 1.45, zhaoMin: 1.6, miao: 1.45, ladies: 1.3, qinMin: 1.7, servant: 1.35,
};
const isWho = (w: string): w is Who => w in TAGS;
export const whoOf = (w: string): Who => { if (!isWho(w)) throw new Error(`hud tag: who "${w}" is not one of ${Object.keys(TAGS).join(", ")}`); return w; };

export type Side = "up" | "left" | "right" | "down";
export type TagItem = {
  /** whose tag (TAGS), or free text with `text` (+ `role`, `camp`) */ who?: Who | string;
  /** the head on screen: headPx(w, rig) */ at: Head;
  /** first frame (TAG.x) */ from: number;
  /** frames until the leave starts (default TAG_LEN), or `out` = the leave's first frame (TAG_OUT.x) */ len?: number; out?: number;
  /** the role row flips to TAGS[who].flip on this frame (TAG_FLIP.lin23) */ flipAt?: number;
  /** pin the side instead of letting placeTags choose */ side?: Side;
  /** the tail's end above the head centre, in head radii (default: the person's) */ lift?: number;
  text?: string; role?: string; camp?: Camp;
  /** the plate's size (default: 1 on small heads, up to 1.3 on close-ups) */ scale?: number;
  key?: string;
};
export type TagProps = TagItem & { f: number; avoid?: Head[] };

const NAME = EN ? 46 : 66, ROLE = EN ? 32 : 38, LONG = EN ? 40 : 56;
/** the plate of a tag at frame f (the role flips on flipAt) */
const specOf = (it: TagItem, f: number): PlateSpec => {
  const who = it.who && !it.text ? whoOf(it.who) : undefined;
  const t = who ? TAGS[who] : { camp: it.camp ?? "zhao", name: it.text ?? "", role: it.role ?? "", flip: undefined };
  const role = t.flip !== undefined && it.flipAt !== undefined && f >= it.flipAt ? t.flip : t.role;
  const c = CAMP[it.camp ?? t.camp], n = [...t.name].length;
  const rows = [{ text: t.name, size: n > (EN ? 14 : 3) ? LONG : NAME, color: c.text, ls: EN ? 1 : n > 3 ? 3 : 6 }];
  if (role) rows.push({ text: role, size: ROLE, color: c.sub, ls: EN ? 0.5 : 2 });
  return { rows, fill: c.fill, band: c.band, minW: EN ? 150 : 172 };
};

// ---------------------------------------------------------------------------------------------------- placement
export type Placed = { cx: number; cy: number; tip: { x: number; y: number }; rect: Rect; w: number; h: number; sc: number };
/** a tag grows with the head it names: 1 up to r = 90 px, 1.3 from r = 200 px */
export const tagScale = (r: number) => clamp(1 + (0.3 * (r - 90)) / 110, 1, 1.3);
const GAP = 22, RIM = 11;
const clampX = (cx: number, w: number, y1: number) => clamp(cx, ZONE.side + RIM + w / 2, (y1 > ZONE.railY ? ZONE.railX : FW - ZONE.side) - RIM - w / 2);
const clampY = (cy: number, h: number) => clamp(cy, ZONE.top + h / 2, ZONE.capTop - 18 - h / 2);
/** one candidate place of a w x h plate for the head hd */
const cand = (hd: Head, w: number, h: number, lift: number, side: Side, shift = 0, raise = 0): Placed => {
  let tip: { x: number; y: number }, cx: number, cy: number;
  if (side === "up") {
    tip = { x: hd.x, y: hd.y - lift * hd.r };
    cy = tip.y - GAP - h / 2 - raise; cx = clampX(hd.x + shift, w, cy + h / 2);
  } else if (side === "down") {
    tip = { x: hd.x, y: hd.y + 1.25 * hd.r };
    cy = tip.y + GAP + h / 2 + raise; cx = clampX(hd.x + shift, w, cy + h / 2);
  } else {
    const sg = side === "left" ? -1 : 1;
    tip = { x: hd.x + sg * 1.22 * hd.r, y: hd.y - 0.15 * hd.r };
    cy = clampY(hd.y - 0.35 * hd.r + shift, h); cx = clampX(tip.x + sg * (GAP + w / 2 + raise), w, cy + h / 2);
  }
  return { cx, cy, tip, rect: rectOf(cx, cy, w + 2 * RIM, h + 2 * RIM), w, h, sc: 1 };
};
/** how bad a place is: 0 = clean */
const cost = (p: Placed, hd: Head, taken: Rect[], heads: Head[]) => {
  const r = p.rect; let c = 0;
  for (const t of taken) c += overlap(r, t, 6) * 3;
  for (const hh of heads) c += hitsCircle(r, hh, 1.12) * 4000;
  c += Math.max(0, ZONE.top - r.y0) * 400;                                            // above the top safe line
  // in the caption band or below the bottom line: never, whatever else it costs (Hongmen's 2000 / px lost to a crowd
  // of heads and plates in English: a plate went 129 px into the band on the sheet)
  c += Math.max(0, Math.min(r.y1, ZONE.capBottom) - Math.max(r.y0, ZONE.capTop)) * 60000;
  c += Math.max(0, r.y1 - ZONE.bottom) * 60000;
  if (r.y1 > ZONE.railY) c += Math.max(0, r.x1 - ZONE.railX) * 2000;                   // under the button column
  c += Math.max(0, ZONE.side - r.x0) * 2000 + Math.max(0, r.x1 - (FW - ZONE.side)) * 2000;
  // the tail must reach its head from outside the plate, and a short tail reads best
  const dx = Math.max(r.x0 - p.tip.x, 0, p.tip.x - r.x1), dy = Math.max(r.y0 - p.tip.y, 0, p.tip.y - r.y1), d = Math.hypot(dx, dy);
  if (d < 4) c += 50000;
  c += Math.max(0, d - GAP) * 3 + Math.abs(p.cx - hd.x) * 0.15;
  return c;
};
/** THE LAYOUT: one place per item, in the order of their first frames (an earlier tag never moves for a later one).
 *  `avoid` = more heads (or any circles) that no plate may cover. The source tag's and the chip's corners are taken
 *  from the start. Two tags that start together (5b) take the larger plate first, so the role rows never collide:
 *  the second one moves aside or up (staggered). */
export const placeTags = (items: TagItem[], f: number, avoid: Head[] = []): Placed[] => {
  const size = (it: TagItem) => { const s = plateSize(specOf(it, f)); return s.w * s.h; };
  const order = items.map((_, i) => i).sort((a, b) => items[a].from - items[b].from || size(items[b]) - size(items[a]) || a - b);
  const heads = [...items.map((it) => it.at), ...avoid], taken: Rect[] = [SOURCE_RECT, CHIP_RECT], out: Placed[] = [];
  for (const i of order) {
    const it = items[i], hd = it.at, who = it.who && !it.text ? whoOf(it.who) : undefined;
    // a flipping plate is placed for its LARGER state, so the flip does not move it
    const a = plateSize(specOf(it, f)), b = it.flipAt !== undefined ? plateSize(specOf(it, it.flipAt)) : a, b0 = it.flipAt !== undefined ? plateSize(specOf(it, it.flipAt - 1)) : a;
    const w0 = Math.max(a.w, b.w, b0.w), h0 = Math.max(a.h, b.h, b0.h), lift = it.lift ?? (who ? TAG_LIFT[who] : 1.5);
    let sc = it.scale ?? tagScale(hd.r), best: Placed;
    if (it.side) {
      // a pinned plate above the head shrinks (down to 1) rather than cross the top safe line
      if (it.side === "up" && it.scale === undefined) sc = clamp((hd.y - lift * hd.r - GAP - RIM - ZONE.top) / h0, 1, sc);
      best = cand(hd, w0 * sc, h0 * sc, lift, it.side);
    } else {
      // every candidate place at the head's scale, then (if that scale is above 1) at 1: a smaller plate above the
      // head beats a larger one pushed to the side
      let bc = Infinity; best = cand(hd, w0 * sc, h0 * sc, lift, "up");
      const scs = sc > 1 && it.scale === undefined ? [sc, 1] : [sc];
      scs.forEach((q, qi) => {
        const w = w0 * q, h = h0 * q;
        const cs = [cand(hd, w, h, lift, "up"), cand(hd, w, h, lift, "up", -0.42 * w), cand(hd, w, h, lift, "up", 0.42 * w),
          cand(hd, w, h, lift, "left"), cand(hd, w, h, lift, "right"), cand(hd, w, h, lift, "up", 0, h + 30), cand(hd, w, h, lift, "up", -0.42 * w, h + 30), cand(hd, w, h, lift, "up", 0.42 * w, h + 30),
          cand(hd, w, h, lift, "left", -h * 0.8), cand(hd, w, h, lift, "right", -h * 0.8), cand(hd, w, h, lift, "left", 0, 60), cand(hd, w, h, lift, "right", 0, 60), cand(hd, w, h, lift, "left", h * 0.8), cand(hd, w, h, lift, "right", h * 0.8), cand(hd, w, h, lift, "down")];
        cs.forEach((c, k) => { const v = cost(c, hd, taken, heads) + k * 2 + (k === cs.length - 1 ? 600 : 0) + qi * 40; if (v < bc) { bc = v; best = c; sc = q; } });
      });
    }
    best.sc = sc; out[i] = best; taken.push(best.rect);
  }
  return out;
};

// ---------------------------------------------------------------------------------------------------- drawing
const burstAt = (key: string, cx: number, cy: number, rx: number, ry: number, u: number) => {
  if (u < 0 || u >= 1) return null;
  const k = 0.5 + 0.5 * (1 - Math.pow(1 - u, 2)), len = 34 * (1 - u), kids: React.ReactNode[] = [];
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2 + 0.26, c = Math.cos(a), s = Math.sin(a), x = cx + c * rx * (0.9 + 0.5 * k), y = cy + s * ry * (0.9 + 0.5 * k);
    const d = `M${x.toFixed(1)},${y.toFixed(1)} L${(x + c * len).toFixed(1)},${(y + s * len).toFixed(1)}`;
    kids.push(<path key={`a${i}`} d={d} stroke={HC.ink} strokeWidth={16} />, <path key={`b${i}`} d={d} stroke={HC.gold} strokeWidth={8} />);
  }
  return <svg key={key} width={FW} height={1920} viewBox="0 0 1080 1920" style={{ ...FULL, overflow: "visible" }}><g opacity={1 - u * u} strokeLinecap="round" fill="none">{kids}</g></svg>;
};
/** one placed tag at frame f */
const drawTag = (it: TagItem, p: Placed, f: number, key: string): React.ReactNode => {
  const out = it.out ?? it.from + (it.len ?? TAG_LEN), Lf = life(f, it.from, out);
  if (!Lf) return null;
  const k = springAt(f, it.from, PUNCH), spec = specOf(it, f);
  let sy = 1, jx = 0, zoom = 1; const kids: React.ReactNode[] = [];
  if (it.flipAt !== undefined) {
    const j = f - it.flipAt;
    sy = j === -2 ? 0.6 : j === -1 ? 0.14 : j === 0 ? 0.5 : j === 1 ? 1.1 : j === 2 ? 0.97 : 1;
    jx = j >= 0 && j < 5 ? [11, -9, 6, -3, 1][j] : 0; zoom = j >= 0 && j < 4 ? [1.1, 1.07, 1.03, 1.01][j] : 1;
    const b = burstAt(`${key}b`, p.cx, p.cy, p.w / 2 + 26, p.h / 2 + 26, j / 8);
    if (b) kids.push(b);
  }
  const s = (0.35 + 0.65 * k) * (1 - 0.12 * Lf.lv) * zoom * p.sc, op = clamp((Lf.t + 1) / 2, 0, 1) * (1 - Lf.lv);
  // the layer's origin is the tail's tip: the tag grows out of the head it names
  kids.unshift(layerAt(key, p.tip.x + jx, p.tip.y, { s, op },
    svg0("s", <g key="g" transform={`translate(${((p.cx - p.tip.x) / p.sc).toFixed(2)},${((p.cy - p.tip.y) / p.sc).toFixed(2)})`}>
      <g transform={`scale(1,${sy})`}>{plate("p", spec, sy > 0.9 ? { x: (p.tip.x - p.cx) / p.sc, y: (p.tip.y - p.cy) / p.sc } : undefined)}</g>
    </g>)));
  return <React.Fragment key={key}>{kids}</React.Fragment>;
};
/** SEVERAL TAGS that keep clear of each other, of every head and of the zones. Same list every frame of the shot. */
export const tags = (f: number, items: TagItem[], o: { avoid?: Head[] } = {}): React.ReactNode => {
  if (!items.length) return null;
  const P = placeTags(items, f, o.avoid);
  return <React.Fragment key="hudtags">{items.map((it, i) => drawTag(it, P[i], f, it.key ?? `tag-${it.who ?? it.text}-${it.from}`))}</React.Fragment>;
};
/** ONE TAG: tag({ f, who: "qinWang", at: headPx(w, rig), from: TAG.qinWang, out: TAG_OUT.qinWang }) */
export const tag = ({ f, avoid, ...it }: TagProps): React.ReactNode => tags(f, [it], { avoid });
/** the plate box of each tag (for a builder who wants to keep something clear of them, or a check) */
export const tagRects = (f: number, items: TagItem[], avoid: Head[] = []): Rect[] => placeTags(items, f, avoid).map((p) => p.rect);
