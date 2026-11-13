// hud/title.tsx: THE TITLE BLOCK of the Newton film (PLAN.md sections 5 and 7 A2; WP4). A pure function of the frame.
//   <TitleCard f />            over beats.ts TITLE_SPAN (on the shut door after A02, 3 s; never on frame 0)
//   <TitleCard f at={{ x, y, scale, rot }} />   placed by the caller (any field left out comes from setTitlePlace /
//                              the default); `span={[a, b]}` draws it over another span (previews)
//   setTitlePlace(p)           where the block sits: a TitlePlace, or a function of the frame (to follow the door while
//                              the camera settles). The SEGMENT BUILDER calls it once at module scope (segA.ts), e.g.
//                              setTitlePlace({ x: 540, y: 880, scale: 0.95 }). Default: the frame's centre (540, 960).
// The look: a title page painted on dark oak: 「跟着牛顿过一天」 large (96 px), a thin ivory double rule with a lozenge,
// 「1686年5月 · 剑桥三一学院」 small (40 px) and "A Day with Newton · May 1686, Trinity College, Cambridge" smaller
// (24 px) under it; ivory paint (a soft gradient, a thin dark edge, a hair of roughening so it reads painted, not
// typed) with a warm dark shadow on the wood. English version (lang en): the English title large, the Chinese small.
// Motion: it DROPS IN onto the door (falls 46 px and scales from 1.07 over 10 frames, its shadow tightening from a
// lifted blur to a contact shadow), settles with one 4 px bounce, the rule grows from the lozenge, the small lines fade
// in after it; holds; fades over its last 10 frames.
//   TITLE_HOME, titleRect(place), titleRectAt(f)
import React from "react";
import { AbsoluteFill } from "remotion";
import { useOverlayFont } from "../../group/kit/overlay";
import { clamp01, easeInCubic, easeOutCubic } from "../story";
import { TITLE_SPAN } from "../beats";
import { EN, TXT } from "../lang";
import { FONT_STACK, HC, textW, type Rect } from "./style";

/** where the block sits: its centre (px), scale and turn (deg) */
export type TitlePlace = { x: number; y: number; scale?: number; rot?: number };
/** the default: the frame's centre */
export const TITLE_HOME: Required<TitlePlace> = { x: 540, y: 960, scale: 1, rot: 0 };
let PLACE: TitlePlace | ((f: number) => TitlePlace) = TITLE_HOME;
/** set where the title block sits (once, at module scope: a constant or a function of the frame, nothing stateful) */
export const setTitlePlace = (p: TitlePlace | ((f: number) => TitlePlace)) => { PLACE = p; };
const placeAt = (f: number, at?: Partial<TitlePlace>): Required<TitlePlace> => {
  const p = typeof PLACE === "function" ? PLACE(f) : PLACE;
  return { ...TITLE_HOME, ...p, ...(at ?? {}) } as Required<TitlePlace>;
};

// ---------------------------------------------------------------------------------------------------- the words
const MAIN = EN ? TXT.titleEn : TXT.titleZh;
const SUB = EN ? TXT.subtitleEn : TXT.subtitleZh;
const SMALL = EN ? `${TXT.titleZh} · ${TXT.subtitleZh}` : `${TXT.titleEn} · ${TXT.subtitleEn.replace(" · ", ", ")}`;
const MAIN_LS = EN ? 3 : 8, SUB_LS = EN ? 1 : 4, SMALL_LS = EN ? 2 : 1.5;
const MAIN_PX = Math.min(EN ? 104 : 96, Math.floor((820 - MAIN_LS * ([...MAIN].length - 1)) / textW(MAIN, 1, 0)));
const SUB_PX = Math.min(40, Math.floor(700 / textW(SUB, 1, 0)));
const SMALL_PX = Math.min(24, Math.floor(820 / textW(SMALL, 1, 0)));
/** the rows' centres relative to the block's centre */
const Y_MAIN = -66, Y_RULE = -6, Y_SUB = 40, Y_SMALL = 90;
const BLOCK_W = Math.max(textW(MAIN, MAIN_PX, MAIN_LS), textW(SUB, SUB_PX, SUB_LS), textW(SMALL, SMALL_PX, SMALL_LS));
const RULE_W = Math.round(Math.min(BLOCK_W, 470));

/** the box the block takes at a place (its shadow and the drop's last frames included) */
export const titleRect = (p: TitlePlace): Rect => {
  const s = p.scale ?? 1, hw = (BLOCK_W / 2 + 24) * s, top = (-Y_MAIN + MAIN_PX / 2 + 50) * s, bot = (Y_SMALL + SMALL_PX / 2 + 24) * s;
  const r = Math.abs(((p.rot ?? 0) * Math.PI) / 180), grow = Math.sin(r) * hw;
  return { x0: Math.floor(p.x - hw - grow * 0.2), y0: Math.floor(p.y - top - grow), x1: Math.ceil(p.x + hw + grow * 0.2), y1: Math.ceil(p.y + bot + grow) };
};
/** the box the title block takes on frame f (or null when it does not show) */
export const titleRectAt = (f: number): Rect | null => (f >= TITLE_SPAN[0] && f <= TITLE_SPAN[1] ? titleRect(placeAt(f)) : null);
/** the default box (at TITLE_HOME) */
export const TITLE_RECT: Rect = titleRect(TITLE_HOME);

// ---------------------------------------------------------------------------------------------------- the block
const ID = "nwtt";
/** the rule's lozenge at scale z (about its own centre) */
const lozenge = (z: number) => {
  const cy = Y_RULE - 1.5, w = 9 * z, hgt = 9.5 * z;
  return `M0,${(cy - hgt).toFixed(1)} L${w.toFixed(1)},${cy} L0,${(cy + hgt).toFixed(1)} L${(-w).toFixed(1)},${cy} Z`;
};
/** one painted row centred on (0, y): ivory gradient, thin dark edge */
const paint = (key: string, s: string, y: number, px: number, ls: number, edge: number, fill = `url(#${ID}iv)`, op = 1) => (
  <text key={key} x={ls / 2} y={(y + px * 0.355).toFixed(1)} textAnchor="middle" fontFamily={FONT_STACK} fontWeight={700} fontSize={px} letterSpacing={ls}
    fill={fill} stroke={HC.oakShade} strokeWidth={edge} strokeLinejoin="round" opacity={op} style={{ paintOrder: "stroke fill" } as React.CSSProperties}>{s}</text>
);

export const TitleCard: React.FC<{ f: number; at?: Partial<TitlePlace>; span?: [number, number] }> = ({ f, at, span }) => {
  useOverlayFont();
  const [a, b] = span ?? TITLE_SPAN;
  if (f < a || f > b) return null;
  const t = f - a, left = b - f;
  const p = placeAt(f, at);
  // the drop: falls 46 px and shrinks from 1.07 over 10 frames, then one small bounce
  const k = easeOutCubic(clamp01((t + 1) / 10)), air = 1 - k;
  const bounce = t >= 9 && t < 17 ? 4 * Math.sin((Math.PI * (t - 9)) / 8) * (1 - (t - 9) / 10) : 0;
  const dy = -46 * air + bounce, s = 1 + 0.07 * air;
  const out = easeInCubic(clamp01((10 - left) / 10));
  const op = clamp01((t + 1) / 6) * (1 - out);
  const rule = easeOutCubic(clamp01((t - 6) / 10)), subO = clamp01((t - 8) / 6), smallO = clamp01((t - 12) / 6);
  // the shadow: lifted (far, soft, faint) while it falls; a contact shadow once it lands
  const sh = { dy: 4 + 16 * air, blur: 2.6 + 9 * air, o: 0.62 - 0.3 * air };
  const hw = RULE_W / 2;
  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity: op }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
        <defs>
          <linearGradient id={`${ID}iv`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={HC.ivoryHi} />
            <stop offset="0.55" stopColor={HC.ivory} />
            <stop offset="1" stopColor={HC.ivoryLo} />
          </linearGradient>
          <filter id={`${ID}f`} x="-10%" y="-30%" width="120%" height="170%">
            <feTurbulence type="fractalNoise" baseFrequency="0.55" numOctaves={1} seed={5} result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale={1.4} xChannelSelector="R" yChannelSelector="G" result="d" />
            <feDropShadow in="d" dx={(1 + 2 * air).toFixed(2)} dy={sh.dy.toFixed(2)} stdDeviation={sh.blur.toFixed(2)} floodColor={HC.oakShade} floodOpacity={sh.o.toFixed(3)} />
          </filter>
        </defs>
        <g transform={`translate(${p.x.toFixed(1)},${(p.y + dy * p.scale).toFixed(1)}) rotate(${p.rot.toFixed(2)}) scale(${(p.scale * s).toFixed(4)})`}>
          <g filter={`url(#${ID}f)`}>
            {paint("main", MAIN, Y_MAIN, MAIN_PX, MAIN_LS, Math.max(3, Math.round(MAIN_PX * 0.045)))}
            {rule > 0 ? (
              <g opacity={0.92}>
                <rect x={(-hw * rule).toFixed(1)} y={Y_RULE - 5} width={(2 * hw * rule).toFixed(1)} height={2.4} fill={HC.ivory} />
                <rect x={(-hw * rule * 0.86).toFixed(1)} y={Y_RULE + 3} width={(2 * hw * rule * 0.86).toFixed(1)} height={1.2} fill={HC.ivory} />
                <path d={lozenge(0.4 + 0.6 * rule)} fill={HC.ivory} stroke={HC.oakShade} strokeWidth={1.6} />
              </g>
            ) : null}
            {subO > 0 ? paint("sub", SUB, Y_SUB, SUB_PX, SUB_LS, 2.6, `url(#${ID}iv)`, subO) : null}
            {smallO > 0 ? paint("small", SMALL, Y_SMALL, SMALL_PX, SMALL_LS, 2, HC.ivory, 0.9 * smallO) : null}
          </g>
        </g>
      </svg>
    </AbsoluteFill>
  );
};
