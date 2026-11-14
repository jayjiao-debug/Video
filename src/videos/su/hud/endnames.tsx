// hud/endnames.tsx: THE ENDING of the Su film (PLAN.md section 6, 8I; WP1). A pure function of the frame.
//   <EndNames f />  from I57 on: the three names 黄州 / 惠州 / 儋州 big (110 px, warm white, thick ink line) across the
//                   middle third, each appearing on its own syllable (BEAT.I.names = capWord("I57", "黄州").from ...),
//                   the English small under each ("Huangzhou" "Huizhou" "Danzhou"); from I57's end (BEAT.I.pictures)
//                   under each name a small round PAINTED PICTURE fades up (240 px, flat SVG in the toon palette): the
//                   pot of red pork, the pile of lychee shells, an oyster open on the fire. Meanwhile the 3D picture
//                   darkens under them (BEAT.I.dim, to 60 %). All held through card 5; then EVERYTHING fades to black
//                   by the last frame (BEAT.I.black: <EndBlack f /> over everything, the last frames pure film-black
//                   #0b0a0e). I57's normal
//                   caption is hidden (hud/caption.tsx skips END_LINE): the names ARE the caption.
//   END_LINE        the line number of I57;  NAMES_RECT  the box the names and pictures take;  endDim(f), endBlack(f)
import React from "react";
import { AbsoluteFill } from "remotion";
import { clamp01, easeOutBack, easeOutCubic, smootherstep, lineNum } from "../story";
import { BEAT } from "../beats";
import { EN, TXT } from "../lang";
import { FONT_STACK, HC, type Rect } from "./style";

/** the line whose caption the end names replace */
export const END_LINE = lineNum("I57");
const XS = [205, 490, 775], Y_NAME = 760, Y_EN = 852, Y_PIC = 1010, R_PIC = 120, PX = 110;
/** the box the names and their pictures take (px) */
export const NAMES_RECT: Rect = { x0: 60, y0: 690, x1: 920, y1: 1140 };
/** how dark the 3D picture is under the names (0 .. 0.6), then the final fade to black (to 1 on the last frame) */
export const endDim = (f: number) => 0.6 * smootherstep(clamp01((f - BEAT.I.dim[0]) / Math.max(1, BEAT.I.dim[1] - BEAT.I.dim[0])));
export const endBlack = (f: number) => clamp01((f - BEAT.I.black[0] + 1) / Math.max(1, BEAT.I.black[1] - BEAT.I.black[0] - 4));

// ---------------------------------------------------------------------------------------------------- the pictures
const INK = HC.ink, SW = 5;
/** the pot of red pork (东坡肉): a brown clay pot, glossy red cubes heaped on top, steam */
const Pork: React.FC = () => (
  <g>
    <path d="M-70,-6 Q-74,58 -40,72 L40,72 Q74,58 70,-6 Z" fill="#8a5a3c" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
    <path d="M-62,20 Q0,30 62,20" fill="none" stroke="#6a4230" strokeWidth={4} />
    <ellipse cx={0} cy={-6} rx={76} ry={18} fill="#6a4230" stroke={INK} strokeWidth={SW} />
    {[[-38, -18], [-6, -24], [26, -18], [-22, -36], [10, -40], [44, -30], [-48, -30]].map(([x, y], i) => (
      <g key={i} transform={`translate(${x} ${y}) rotate(${(i * 23) % 40 - 20})`}>
        <rect x={-14} y={-12} width={28} height={24} rx={6} fill="#c8322a" stroke={INK} strokeWidth={3.5} />
        <rect x={-14} y={-12} width={28} height={7} rx={3} fill="#f2d6a8" />
        <circle cx={-5} cy={2} r={3} fill="#ff8a70" />
      </g>
    ))}
    {[-30, 0, 30].map((x, i) => <path key={i} d={`M${x},-52 q-8,-10 0,-20 q8,-10 0,-20`} fill="none" stroke="#f4efe6" strokeWidth={5} strokeLinecap="round" opacity={0.9} />)}
  </g>
);
/** the pile of lychee shells: red bumpy halves heaped, a peeled white fruit on top */
const Shells: React.FC = () => {
  const halves = [[-56, 44], [-20, 52], [18, 50], [54, 42], [-40, 18], [0, 22], [38, 16], [-18, -6], [20, -8], [0, -30]];
  return (
    <g>
      <ellipse cx={0} cy={68} rx={84} ry={12} fill="#00000022" />
      {halves.map(([x, y], i) => (
        <g key={i} transform={`translate(${x} ${y}) rotate(${(i * 37) % 60 - 30})`}>
          <path d="M-22,0 A22,20 0 0 1 22,0 Z" fill="#d23a34" stroke={INK} strokeWidth={3.5} strokeLinejoin="round" />
          <path d="M-14,-2 A14,10 0 0 1 14,-2" fill="#f7f0e4" />
          {[-10, 0, 10].map((d, k) => <circle key={k} cx={d} cy={-12 + Math.abs(d) * 0.4} r={2.4} fill="#9e2420" />)}
        </g>
      ))}
      <ellipse cx={4} cy={-52} rx={18} ry={22} fill="#f6f2ea" stroke={INK} strokeWidth={3.5} />
      <ellipse cx={-2} cy={-60} rx={5} ry={7} fill="#ffffff" />
    </g>
  );
};
/** an oyster open on the fire: a grey rough shell, its pearly inside, flames and embers under it */
const Oyster: React.FC = () => (
  <g>
    {[[-46, 58, 1], [0, 62, 0], [46, 58, -1]].map(([x, y, s], i) => <rect key={i} x={-46} y={-8} width={92} height={16} rx={8} transform={`translate(${x} ${y}) rotate(${s * 18})`} fill="#6a4a34" stroke={INK} strokeWidth={3.5} />)}
    {[-36, -12, 12, 36].map((x, i) => <path key={i} d={`M${x - 14},52 Q${x},${-2 - (i % 2) * 14} ${x + 14},52 Z`} fill={i % 2 ? "#ffb040" : "#ff7a2a"} stroke={INK} strokeWidth={3} strokeLinejoin="round" />)}
    {[-24, 0, 24].map((x, i) => <path key={i} d={`M${x - 7},50 Q${x},${22 - i * 4} ${x + 7},50 Z`} fill="#fff0a0" />)}
    <path d="M-74,10 Q-60,-30 0,-30 Q60,-30 74,10 Q40,30 0,28 Q-40,30 -74,10 Z" fill="#9a968e" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
    <path d="M-56,6 Q-40,-16 0,-16 Q40,-16 56,6 Q30,18 0,16 Q-30,18 -56,6 Z" fill="#f2ece2" />
    <ellipse cx={4} cy={0} rx={26} ry={12} fill="#e4d6c0" stroke="#b8a890" strokeWidth={2} />
    <path d="M-70,-4 Q-40,-62 6,-60 Q50,-58 70,-14" fill="#8a867e" stroke={INK} strokeWidth={SW} strokeLinejoin="round" />
  </g>
);
const PICS = [Pork, Shells, Oyster];

export const EndNames: React.FC<{ f: number }> = ({ f }) => {
  const n0 = BEAT.I.names[0];
  if (f < n0) return null;
  const dim = endDim(f);
  const pk = (k: number) => smootherstep(clamp01((f - BEAT.I.pictures - k * 8) / 24));
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {/* the 3D picture darkens under the names */}
      {dim > 0 ? <div style={{ position: "absolute", inset: 0, background: HC.black, opacity: dim }} /> : null}
      {TXT.names.map((nm, k) => {
        const t = f - BEAT.I.names[k];
        if (t < 0) return null;
        const kin = easeOutCubic(clamp01((t + 1) / 6)), s = 0.82 + 0.18 * easeOutBack(clamp01((t + 1) / 6), 2.0);
        const main = EN ? nm.en : nm.zh, px = EN ? 50 : PX;
        return (
          <div key={k} style={{ position: "absolute", left: XS[k], top: Y_NAME, width: 0, height: 0, opacity: kin, transform: `scale(${s.toFixed(4)})` }}>
            <div style={{ position: "absolute", left: 0, top: 0, transform: "translate(-50%, -50%)", fontFamily: FONT_STACK, fontWeight: 700, fontSize: px, lineHeight: 1, letterSpacing: EN ? 0 : 4, whiteSpace: "nowrap",
              color: HC.warm, WebkitTextStroke: `${Math.round(px * 0.18)}px ${HC.ink}`, paintOrder: "stroke fill", textShadow: `0 ${Math.round(px * 0.06)}px 0 rgba(8,8,16,0.55), 0 ${Math.round(px * 0.1)}px ${Math.round(px * 0.3)}px rgba(8,8,16,0.5)` } as React.CSSProperties}>{main}</div>
            {!EN ? <div style={{ position: "absolute", left: 0, top: Y_EN - Y_NAME, transform: "translate(-50%, -50%)", fontFamily: FONT_STACK, fontWeight: 700, fontSize: 32, lineHeight: 1, whiteSpace: "nowrap",
              color: HC.enGrey, WebkitTextStroke: `6px ${HC.ink}`, paintOrder: "stroke fill" } as React.CSSProperties}>{nm.en}</div> : null}
          </div>
        );
      })}
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", left: 0, top: 0 }}>
        {PICS.map((Pic, k) => {
          const a = pk(k);
          if (a <= 0) return null;
          return (
            <g key={k} opacity={a} transform={`translate(${XS[k]} ${Y_PIC + 14 * (1 - a)})`}>
              <circle r={R_PIC} fill="#f3ead6" stroke={INK} strokeWidth={7} />
              <circle r={R_PIC - 12} fill="none" stroke="rgba(150,118,70,0.35)" strokeWidth={3} />
              <g transform="scale(1.08)"><Pic /></g>
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};
/** THE END'S BLACK over everything (Film.tsx draws it last, above the captions and P.top): 0 until BEAT.I.black, then
 *  up to 1 (pure film-black) a few frames before the last frame */
export const EndBlack: React.FC<{ f: number }> = ({ f }) => {
  const k = endBlack(f);
  return k > 0 ? <AbsoluteFill style={{ pointerEvents: "none", background: HC.black, opacity: k }} /> : null;
};
