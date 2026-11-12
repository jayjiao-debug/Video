// hud/inset.tsx: THE INFORMER'S INSET (a round picture-in-picture) and the SPEECH BUBBLE.
//   inset({ f, from: HIT.inset, flipAt: HIT.name })            line 9: the window pops in with the plate 刘邦的军官;
//                                                              on flipAt it jolts and the plate flips to 曹无伤 / 告密的
//   inset({ f, from: TAG.informerAgain, out })                 lines 20, 21: named from the start
//   inset({ ..., x, y, d, img })                               centre and diameter in px; img = a square picture of
//                                                              the real figure (a data URI) laid over the drawing
// The window lives in the UPPER RIGHT (layout.ts: the informer's corner), default centre (816, 394), diameter 344;
// its plate hangs from the lower rim (the face stays clear). Ring in his camp's red, the 密 seal on the rim: the same mark as on his tag.
//   bubble({ f, from, out, x, y, text, to: { x, y } })         a white speech bubble with a tail to the speaker
//                                                              (line 21: 「曹无伤」 out of Xiang Yu's mouth)
// The portrait is drawn here in code after the film's own figure (people.ts CAO_WUSHANG): the black pitched cap on
// its red band, the cream round head, half-shut eyes slid to the side, the thin drooping moustache, the red neck
// cloth over dark red armour.
import React from "react";
import { Img } from "remotion";
import { EN, TXT } from "../lang";
import { CAMP, HC, FW, ZONE, clamp, clamp01, life, layerAt, plate, plateSize, sealMark, springAt, svg0, svgText, textW, PUNCH, type PlateSpec } from "./base";

/** the informer's bust, viewBox 0 0 400 400 */
export const informerPortrait = (): React.ReactNode[] => {
  const I = HC.ink, st = { stroke: I, strokeWidth: 10, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
  return [
    <rect key="bg" x={0} y={0} width={400} height={400} fill="#3a3157" />,
    <circle key="glow" cx={200} cy={215} r={185} fill="#51457a" />,
    <circle key="glow2" cx={200} cy={215} r={135} fill="#63568f" />,
    // shoulders: dark red armour, black edge band, the red neck cloth
    <path key="body" d="M70,420 C74,336 128,306 200,306 C272,306 326,336 330,420 Z" fill="#8f2229" {...st} />,
    <path key="edge" d="M104,420 C110,356 146,334 200,334 C254,334 290,356 296,420" fill="none" stroke={I} strokeWidth={8} />,
    <path key="neck" d="M146,312 C168,294 232,294 254,312 L228,350 L200,332 L172,350 Z" fill="#d6372f" {...st} />,
    // the head
    <ellipse key="head" cx={200} cy={212} rx={112} ry={106} fill={HC.skin} {...st} />,
    // hair under the cap
    <path key="hair" d="M90,198 C92,144 136,108 200,106 C264,108 308,144 310,198 C290,158 252,140 200,140 C148,140 110,158 90,198 Z" fill="#1f1b26" stroke={I} strokeWidth={6} strokeLinejoin="round" />,
    // the cap: the red band, the black pitched roof with its eaves
    <path key="band" d="M126,132 L274,132 L268,92 L132,92 Z" fill="#d2352d" {...st} />,
    <path key="roof" d="M84,98 L200,22 L316,98 L296,108 L104,108 Z" fill="#2b2733" {...st} />,
    <path key="ridge" d="M200,30 L200,102" stroke="#4d4660" strokeWidth={6} fill="none" strokeLinecap="round" />,
    // brows (one cocked), half-shut eyes with the pupils slid to one side, the drooping moustache, the small mouth
    <path key="brL" d="M128,180 C144,168 164,170 180,182" fill="none" stroke={I} strokeWidth={9} strokeLinecap="round" />,
    <path key="brR" d="M222,178 C238,164 258,166 272,180" fill="none" stroke={I} strokeWidth={9} strokeLinecap="round" />,
    <path key="eyL" d="M134,206 L178,206" stroke={I} strokeWidth={9} strokeLinecap="round" fill="none" />,
    <path key="eyR" d="M224,206 L268,206" stroke={I} strokeWidth={9} strokeLinecap="round" fill="none" />,
    <circle key="puL" cx={144} cy={217} r={10} fill={I} />,
    <circle key="puR" cx={234} cy={217} r={10} fill={I} />,
    <path key="moL" d="M197,250 C180,243 158,252 146,284" fill="none" stroke={I} strokeWidth={10} strokeLinecap="round" />,
    <path key="moR" d="M203,250 C220,243 242,252 254,284" fill="none" stroke={I} strokeWidth={10} strokeLinecap="round" />,
    <path key="mouth" d="M186,276 C194,284 206,284 216,274" fill="none" stroke={I} strokeWidth={8} strokeLinecap="round" />,
  ];
};

const NAME = EN ? 46 : 66, ROLE = EN ? 32 : 38, LONG = EN ? 40 : 50;
const plateOf = (named: boolean): PlateSpec => {
  const c = CAMP.liu;
  if (!named) return { rows: [{ text: TXT.officer, size: LONG, color: c.text, ls: 3 }], fill: c.band, minW: 200 };
  const [a, b] = TXT.informer.split(/\s*·\s*/);
  return { rows: [{ text: a, size: NAME, color: c.text, ls: EN ? 1 : 6 }, { text: b ?? "", size: ROLE, color: c.sub, ls: 1 }], fill: c.fill, band: c.band, minW: 200 };
};
export type InsetProps = {
  f: number; from: number;
  /** first frame of the 5-frame leave (omit = it stays to the end of the shot) */ out?: number;
  /** the plate reads 刘邦的军官 until this frame, then flips to the name; omit = named from the start */ flipAt?: number;
  /** false = no plate at all (the picture only) */ plate?: boolean;
  /** centre and diameter of the round window in px (default 816, 394, 344) */ x?: number; y?: number; d?: number;
  /** a square picture of the real figure, laid over the drawn portrait */ img?: string;
  key?: string;
};
/** the box the inset takes on screen (window + plate), for keeping other things clear */
export const insetRect = (p: Pick<InsetProps, "x" | "y" | "d">) => { const x = p.x ?? 816, y = p.y ?? 394, d = p.d ?? 344; return { x0: x - d / 2 - 20, y0: y - d / 2 - 20, x1: x + d / 2 + 20, y1: y + d / 2 + 150 }; };
export const inset = (p: InsetProps): React.ReactNode => {
  const { f, from, x = 816, y = 394, d = 344 } = p, L = life(f, from, p.out);
  if (!L) return null;
  const r = d / 2, k = springAt(f, from, PUNCH), named = p.flipAt === undefined || f >= p.flipAt, j = p.flipAt === undefined ? 99 : f - p.flipAt;
  const jolt = j >= 0 && j < 5 ? [13, -10, 7, -3, 1][j] : 0, zoom = j >= 0 && j < 4 ? [1.08, 1.05, 1.02, 1.01][j] : 1;
  const sy = j === -2 ? 0.6 : j === -1 ? 0.14 : j === 0 ? 0.5 : j === 1 ? 1.1 : j === 2 ? 0.97 : 1;
  const s = (0.3 + 0.7 * k) * zoom * (1 - 0.12 * L.lv), op = clamp01((L.t + 1) / 2) * (1 - L.lv);
  const spec = plateOf(named), ps = plateSize(spec), py = r + ps.h / 2 - 22;   // the plate hangs from the lower rim (it covers the rim, never the face)
  const pic = d - 28;                                                  // the picture inside the ring
  // the burst on the name
  const u = j / 8, rays: React.ReactNode[] = [];
  if (u >= 0 && u < 1) {
    const kk = 1 - Math.pow(1 - u, 2), len = 44 * (1 - u);
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2 + 0.22, c = Math.cos(a), sn = Math.sin(a), rr = r + 30 + 50 * kk;
      const dd = `M${(c * rr).toFixed(1)},${(sn * rr).toFixed(1)} L${(c * (rr + len)).toFixed(1)},${(sn * (rr + len)).toFixed(1)}`;
      rays.push(<path key={`a${i}`} d={dd} stroke={HC.ink} strokeWidth={17} />, <path key={`b${i}`} d={dd} stroke={HC.gold} strokeWidth={9} />);
    }
  }
  return (
    <React.Fragment key={p.key ?? `inset${from}`}>
      {rays.length ? layerAt("rays", x, y, { op: 1 - u * u }, svg0("s", <g key="g" strokeLinecap="round" fill="none">{rays}</g>)) : null}
      {layerAt("win", x + jolt, y, { s, op },
        svg0("ring",
          <circle key="sh" cx={0} cy={12} r={r + 7} fill={HC.shadow} />,
          <circle key="rim" r={r + 4} fill={HC.cream} />,
          <circle key="ink" r={r} fill={CAMP.liu.fill} stroke={HC.ink} strokeWidth={7} />,
          <circle key="in" r={pic / 2 + 3} fill={HC.ink} />),
        <div key="pic" style={{ position: "absolute", left: -pic / 2, top: -pic / 2, width: pic, height: pic, borderRadius: "50%", overflow: "hidden", background: "#3a3157" }}>
          <svg width={pic} height={pic} viewBox="0 0 400 400" style={{ display: "block" }}>{informerPortrait()}</svg>
          {p.img ? <Img src={p.img} style={{ position: "absolute", left: 0, top: 0, width: pic, height: pic, display: "block" }} /> : null}
        </div>,
        svg0("over",
          sealMark("mark", -r * 0.74, -r * 0.7, Math.max(34, r * 0.27), TXT.informerMark),
          p.plate === false ? null : <g key="pl" transform={`translate(0,${py}) scale(1,${sy})`}>{plate("p", spec)}</g>))}
    </React.Fragment>
  );
};
export const Inset: React.FC<InsetProps> = (p) => <>{inset(p)}</>;

// ---------------------------------------------------------------------------------------------------- speech bubble
export type BubbleProps = {
  f: number; from: number; out?: number;
  /** the bubble's centre */ x: number; y: number;
  text: string;
  /** where its tail ends (the speaker's mouth, a little off it) */ to?: { x: number; y: number };
  /** character size (default 64) */ size?: number;
  /** text colour (default ink); gold: true = the informer's name as an accusation: red text */ color?: string;
  key?: string;
};
/** a white speech bubble with an ink line; pops out of the tail's end */
export const bubble = (p: BubbleProps): React.ReactNode => {
  const { f, from, text, to } = p, L = life(f, from, p.out);
  if (!L) return null;
  const size = p.size ?? (EN ? 44 : 64), w = textW(text, size, 4) + 64, hgt = Math.round(size * 1.5);
  const x = clamp(p.x, ZONE.side + w / 2 + 12, FW - ZONE.side - w / 2 - 12), y = p.y;
  const k = springAt(f, from, PUNCH), ox = to?.x ?? x, oy = to?.y ?? y, s = (0.35 + 0.65 * k) * (1 - 0.12 * L.lv);
  const x0 = -w / 2, x1 = w / 2, y0 = -hgt / 2, y1 = hgt / 2, R = hgt / 2;
  // the body: a stadium; the tail: a triangle from the nearest part of the lower / upper edge to `to`
  const body = `M${x0 + R},${y0} L${x1 - R},${y0} A${R},${R} 0 0 1 ${x1 - R},${y1} L${x0 + R},${y1} A${R},${R} 0 0 1 ${x0 + R},${y0} Z`;
  let tail: string | null = null;
  if (to) {
    const tx = to.x - x, ty = to.y - y, below = ty > 0, ey = below ? y1 - 3 : y0 + 3, c = clamp(tx * 0.5, x0 + R + 6, x1 - R - 6);
    if (Math.abs(ty) > hgt / 2 + 8) tail = `M${c - 17},${ey} L${tx},${ty} L${c + 17},${ey} Z`;
  }
  const shape = (extra: React.SVGProps<SVGPathElement>, key: string) => [<path key={`${key}b`} d={body} {...extra} />, tail ? <path key={`${key}t`} d={tail} {...extra} /> : null];
  return layerAt(p.key ?? `bubble${from}`, ox, oy, { s, op: clamp01((L.t + 1) / 2) * (1 - L.lv) },
    svg0("s", <g key="g" transform={`translate(${(x - ox).toFixed(2)},${(y - oy).toFixed(2)})`}>
      <g transform="translate(0,9)">{shape({ fill: HC.shadow, stroke: HC.shadow, strokeWidth: 13, strokeLinejoin: "round" }, "sh")}</g>
      {shape({ fill: HC.ink, stroke: HC.ink, strokeWidth: 13, strokeLinejoin: "round" }, "ink")}
      {shape({ fill: HC.white }, "fill")}
      {svgText("t", text, 0, 0, size, p.color ?? HC.ink, { ls: 4 })}
    </g>));
};
export const Bubble: React.FC<BubbleProps> = (p) => <>{bubble(p)}</>;
