// hud/fx.tsx: THE EFFECTS of the Napoleon film in the Empire skin (hud/skin.tsx). Pure functions of the frame.
//   <FactCards f />   the script's fact cards (story.ts CARDS): 真事 = a gold medal struck beside a bulletin sheet;
//                     传说 = the same sheet with a crimson scribbled mark. Above the caption band.
//   <Painting f />    A05: the famous painting (white horse rearing) slapped over the mule, in a gilt frame
//   <Stamp f />       F: 一百天后 · 滑铁卢 slammed over the cheering; a flash hides the change of place
//   <Goal f />        G: the day's target comes back and its counter turns 0/1 -> 1/1 when he says it
//   <Snow f k />      falling snow over the picture (the Alps lightly, Russia thick)
import React from "react";
import { AbsoluteFill } from "remotion";
import { clamp01, easeOut, glyph, hash01, life, part, ring, slap, wrapRows } from "../../../kit/overlay";
import { CARDS, line } from "../story";
import { DIDONE, EM, SkinDefs, march, wheel } from "./skin";
import { STAMP_AT, WATERLOO_AT } from "../shots/segF";
import { SAID_AT } from "../shots/segG";

const Svg: React.FC<{ id: string; children: React.ReactNode }> = ({ id, children }) => (
  <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", left: 0, top: 0 }}><defs><SkinDefs id={id} /></defs>{children}</svg>
);

export const FactCards: React.FC<{ f: number }> = ({ f }) => {
  const c = CARDS.find((x) => f >= x.from && f <= x.to);
  if (!c) return null;
  const l = life(f, c.from, c.to, 5, 5)!, t = l.t, legend = c.zh.startsWith("传说");
  const body = c.zh.replace(/^(真事|传说)[:：]/, ""), rows = wrapRows(body, 15.5), px = 38, rh = 52;
  const h = Math.max(120, rows.length * rh + 44), y0 = 1236 - h, sh = wheel(t, 0, 6, -6), medal = slap(t, 5, 1.8);
  const exit = l.leave > 0 ? 1 - l.leave * l.leave : 1;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <Svg id="nf">
        <g transform={`translate(540,${y0 + h / 2}) scale(${exit.toFixed(3)}) translate(-540,${-(y0 + h / 2)})`}>
          <g transform={`rotate(${(sh.rot - 1.5).toFixed(2)} 150 ${y0 + h}) translate(150,0) scale(${sh.k.toFixed(3)},1) translate(-150,0)`}>
            <rect x={196} y={y0 + 8} width={690} height={h} fill={EM.shadow} />
            <rect x={196} y={y0} width={690} height={h} fill={EM.cream} stroke={EM.ink} strokeWidth={6} />
            <path d={`M214,${y0 + 12} H868 M214,${y0 + h - 12} H868`} stroke={legend ? EM.crimson : EM.goldDeep} strokeWidth={3} />
            {rows.map((r, i) => { const m = march(t, 4 + 3 * i, 5, 40); return m.o > 0 ? <g key={i} transform={`translate(${m.x.toFixed(1)},0)`}>{glyph(`r${i}`, r, 262, y0 + h / 2 - ((rows.length - 1) * rh) / 2 + i * rh, px, EM.ink, { anchor: "start", ls: 1 })}</g> : null; })}
          </g>
          {medal > 0 ? (
            <g>
              {ring("m", 190, y0 + h / 2, 60, 130, (t - 5) / 6, legend ? EM.crimsonLight : EM.goldLight, 8)}
              <g transform={`translate(190,${y0 + h / 2}) rotate(-10) scale(${medal.toFixed(3)})`}>
                <circle r={70} cx={4} cy={7} fill={EM.shadow} />
                <circle r={70} fill={legend ? "url(#nfWax)" : "url(#nfGilt)"} stroke={EM.ink} strokeWidth={6} />
                <circle r={56} fill="none" stroke={legend ? EM.crimsonDeep : EM.goldDeep} strokeWidth={3} strokeDasharray={legend ? "7 6" : undefined} />
                {glyph("mt", legend ? "传说" : "真事", 0, 0, 44, legend ? EM.cream : EM.ink, { ls: 2 })}
              </g>
            </g>
          ) : null}
        </g>
      </Svg>
    </AbsoluteFill>
  );
};

/** the painting everyone knows, drawn small: a white horse rearing on a rock, a red cloak, an arm pointing up */
export const Painting: React.FC<{ f: number }> = ({ f }) => {
  const a = line("A05").from + 14, b = line("A05").to + 62, l = life(f, a, b, 4, 5);
  if (!l) return null;
  const s = slap(l.t, 0, 1.5) * (l.leave > 0 ? 1 - l.leave * l.leave : 1), lab = march(l.t, 8, 5, 50);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <Svg id="np">
        {ring("pr", 730, 610, 180, 330, l.t / 7, EM.goldLight, 10)}
        <g transform={`translate(730,610) rotate(5) scale(${s.toFixed(3)})`}>
          <rect x={-196} y={-236} width={392} height={484} fill={EM.shadow} transform="translate(8,12)" />
          <rect x={-196} y={-236} width={392} height={484} fill="url(#npGilt)" stroke={EM.ink} strokeWidth={7} />
          <rect x={-166} y={-206} width={332} height={424} fill="#8fa3b8" stroke={EM.ink} strokeWidth={5} />
          <path d="M-166,-60 L-90,-150 L-30,-70 L40,-170 L166,-40 V218 H-166 Z" fill="#c9d3de" />
          <path d="M-166,218 V120 L-60,60 L60,110 L166,40 V218 Z" fill="#6f7884" stroke={EM.ink} strokeWidth={4} />
          {/* the cloak */}
          <path d="M-20,-96 C-90,-150 -150,-110 -160,-50 C-110,-80 -70,-60 -30,-40 Z" fill={EM.crimson} stroke={EM.ink} strokeWidth={5} strokeLinejoin="round" />
          {/* the horse, rearing to the right */}
          <path d="M-74,96 L-58,30 C-80,-10 -50,-50 0,-52 C24,-90 52,-118 84,-122 L100,-150 L106,-120 C130,-108 140,-86 138,-66 L112,-64 C96,-74 84,-70 74,-54 C84,-20 70,10 40,22 L60,84 L44,90 L10,34 L-28,40 L-44,104 Z" fill="#f4f1ea" stroke={EM.ink} strokeWidth={5} strokeLinejoin="round" />
          <path d="M40,22 C70,6 104,-4 122,10 L134,-12 M74,-54 C100,-40 120,-30 150,-34 L156,-58" fill="none" stroke={EM.ink} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
          <path d="M-58,30 C-90,40 -100,80 -84,120" fill="none" stroke="#f4f1ea" strokeWidth={12} strokeLinecap="round" /><path d="M-58,30 C-90,40 -100,80 -84,120" fill="none" stroke={EM.ink} strokeWidth={3} strokeLinecap="round" />
          {/* the rider: the coat, the head, the hat, the arm pointing up */}
          <path d="M-34,-44 C-40,-90 -18,-110 6,-104 C22,-90 20,-60 12,-44 Z" fill="#33466e" stroke={EM.ink} strokeWidth={5} strokeLinejoin="round" />
          <circle cx={-10} cy={-128} r={24} fill="#f3d6bd" stroke={EM.ink} strokeWidth={5} />
          <path d="M-54,-142 C-34,-176 14,-176 34,-142 C10,-152 -30,-152 -54,-142 Z" fill="#1e1c22" stroke={EM.ink} strokeWidth={4} strokeLinejoin="round" />
          <path d="M8,-92 L60,-150 L66,-178" fill="none" stroke={EM.ink} strokeWidth={15} strokeLinecap="round" strokeLinejoin="round" /><path d="M8,-92 L60,-150 L66,-178" fill="none" stroke="#33466e" strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" />
        </g>
        {lab.o > 0 && s > 0.5 ? <g transform={`translate(${(596 + lab.x).toFixed(1)},884) rotate(3)`}><path d="M-112,-30 H112 L100,0 L112,30 H-112 L-100,0 Z" fill="url(#npWax)" stroke={EM.ink} strokeWidth={5} strokeLinejoin="round" />{glyph("pl", "画里的他", 0, 0, 40, EM.cream, { ls: 4 })}</g> : null}
      </Svg>
    </AbsoluteFill>
  );
};

export const Stamp: React.FC<{ f: number }> = ({ f }) => {
  const a = STAMP_AT, b = WATERLOO_AT + 44, l = life(f, a, b, 3, 5);
  if (!l) return null;
  const s = slap(l.t, 0, 2.2) * (l.leave > 0 ? 1 - l.leave * l.leave : 1), s2 = slap(l.t, 5, 1.8);
  const d = f - WATERLOO_AT, flash = d >= -2 && d <= 2 ? [0.5, 0.9, 1, 0.6, 0.25][d + 2] : 0;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {flash > 0 ? <AbsoluteFill style={{ background: "#fff", opacity: flash }} /> : null}
      <Svg id="ns">
        {ring("sr", 540, 860, 240, 520, l.t / 8, EM.crimsonLight, 14)}
        <g transform={`translate(540,860) rotate(-7) scale(${s.toFixed(3)})`}>
          <rect x={-330} y={-170} width={660} height={340} rx={22} fill={EM.shadow} transform="translate(8,12)" />
          <rect x={-330} y={-170} width={660} height={340} rx={22} fill="url(#nsWax)" stroke={EM.ink} strokeWidth={9} />
          <rect x={-306} y={-146} width={612} height={292} rx={10} fill="none" stroke={EM.cream} strokeWidth={5} />
          {glyph("s1", "一百天后", 0, -88, 64, EM.goldLight, { ls: 14, ink: 9, inkColor: EM.ink })}
          {s2 > 0 ? <g transform={`translate(0,42) scale(${s2.toFixed(3)})`}>{glyph("s2", "滑铁卢", 0, 0, 168, EM.cream, { ls: 16, ink: 18, inkColor: EM.ink, drop: 7, dropColor: "#2a0810" })}</g> : null}
        </g>
      </Svg>
    </AbsoluteFill>
  );
};

export const Goal: React.FC<{ f: number }> = ({ f }) => {
  const a = line("G36").to + 24, b = SAID_AT + 110, l = life(f, a, b, 5, 5);
  if (!l) return null;
  const w = wheel(l.t, 0, 6, -8), said = f >= SAID_AT, hit = slap(f - SAID_AT, 0, 2.0), exit = l.leave > 0 ? 1 - l.leave * l.leave : 1;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <Svg id="ng">
        <g transform={`translate(540,420) scale(${exit.toFixed(3)}) translate(-540,-420)`}>
          <g opacity={w.o} transform={`rotate(${(w.rot - 2).toFixed(2)} 130 420) translate(130,420) scale(${w.k.toFixed(3)},1) translate(-130,-420)`}>
            <rect x={130} y={386 + 7} width={600} height={68} rx={10} fill={EM.shadow} />
            <rect x={130} y={386} width={600} height={68} rx={10} fill="url(#ngGilt)" stroke={EM.ink} strokeWidth={6} />
            {glyph("g1", "今日目标：", 150, 420, 38, EM.ink, { anchor: "start" })}
            {glyph("g2", "听他说「不可能」", 348, 420, 42, EM.crimsonDeep, { anchor: "start" })}
          </g>
          {said ? ring("gr", 826, 418, 60, 190, (f - SAID_AT) / 9, EM.goldLight, 12) : null}
          <g transform={`rotate(-2 130 420) translate(826,418) scale(${(said ? hit : clamp01((l.t - 5) / 3) * (1 + 0.04 * Math.sin(l.t * 0.6))).toFixed(3)})`}>
            <rect x={-76} y={-36} width={152} height={72} rx={10} fill={said ? EM.green : EM.cream} stroke={EM.ink} strokeWidth={6} />
            <text x={0} y={17} textAnchor="middle" fontFamily={DIDONE} fontWeight={700} fontSize={50} fill={said ? EM.goldLight : EM.crimsonDeep}>{said ? "1/1" : "0/1"}</text>
          </g>
        </g>
      </Svg>
    </AbsoluteFill>
  );
};

/** snow: n flakes falling and drifting; k = how thick (0..1) */
export const Snow: React.FC<{ f: number; k: number }> = ({ f, k }) => {
  if (k <= 0) return null;
  const n = Math.round(40 + 150 * k), out: React.ReactNode[] = [];
  for (let i = 0; i < n; i++) {
    const sp = 5 + 9 * hash01(i, 1) + 6 * k, r = 2.5 + 5 * hash01(i, 2), y = ((hash01(i, 3) * 2100 + f * sp) % 2100) - 90;
    const x = ((hash01(i, 4) * 1300 - f * (1.5 + 7 * k) * (0.5 + hash01(i, 5)) + 26 * Math.sin(f / 19 + i)) % 1300 + 1300) % 1300 - 110;
    out.push(<circle key={i} cx={x.toFixed(1)} cy={y.toFixed(1)} r={r.toFixed(1)} fill="#fff" opacity={(0.5 + 0.45 * hash01(i, 6)).toFixed(2)} />);
  }
  return <AbsoluteFill style={{ pointerEvents: "none" }}><svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", left: 0, top: 0 }}>{out}</svg></AbsoluteFill>;
};
void easeOut; void part;
