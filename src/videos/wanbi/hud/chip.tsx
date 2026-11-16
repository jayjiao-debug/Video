// hud/chip.tsx: THE TWO HUDs (registered in hud/index.ts; shots do NOT call them; Film.tsx hides them on the frames
// whose Pose says hud: false, shots 1 and 11).
//   chip({ f })        THE JADE CHIP (BIBLE 6.1), top right inside CHIP_RECT: a 66 px jade disc icon and across its
//                      lower edge a small plate with the holder (beats.ts holderAt) in 36 px, in the holder's camp
//                      colour (Qin charcoal / Zhao teal). Nothing before 190; pops (1.25 -> 1, 6 frames, a gold ring
//                      off the disc) on each change of holder; fades out 846-851 and back in 925-931 without a pop
//                      (BEAT.hudOut / hudIn); fades out 2084-2089 (BEAT.chipFade).
//   sourceTag({ f, from, out })   THE SOURCE TAG 《史记》 / "Records of the Grand Historian", top left (TAG_X, y 210),
//                      a red bar and cream type on an ink line; in over 174-181 (slides from the left), strong for
//                      4.5 s, then a little fainter; faded with the chip around the callback and at the end.
import React from "react";
import { TXT, L } from "../lang";
import { BEAT, holderAt, type Holder } from "../beats";
import { CAMP, HC, FULL, CHIP_RECT, SOURCE_SIZE, TAG_X, ZONE, clamp01, eOut, life, svgText, textW, jadeIcon, type Camp } from "./base";

export { CHIP_RECT };
/** the holder's label (English at most 9 characters at 36 px) */
export const CHIP_LABEL: Record<Holder, string> = {
  zhaoWang: L("赵王", "Zhao king"), lin: L("门客", "envoy"), qinWang: L("秦王", "Qin king"), ladies: L("美人", "ladies"),
  servant: L("随从怀里", "servant"), inZhao: L("赵国", "in Zhao"),
};
/** the side the holder is on: the chip's plate colour */
export const CHIP_CAMP: Record<Holder, Camp> = { zhaoWang: "zhao", lin: "zhao", qinWang: "qin", ladies: "qin", servant: "zhao", inZhao: "zhao" };

/** how much of the HUD shows on frame f: 1, faded around the callback (hudOut, hudIn) and at the end (chipFade) */
export const hudK = (f: number) => {
  const [o0, o1] = BEAT.hudOut, [i0, i1] = BEAT.hudIn, [c0, c1] = BEAT.chipFade;
  let k = 1;
  if (f >= o0 && f < i0) k = clamp01((o1 - f) / (o1 - o0 + 1));
  else if (f >= i0 && f <= i1) k = (f - i0 + 1) / (i1 - i0 + 1);
  if (f >= c0) k *= clamp01((c1 - f) / (c1 - c0 + 1));
  return k;
};

// ---------------------------------------------------------------------------------------------------- the chip
const CX = Math.round((CHIP_RECT.x0 + CHIP_RECT.x1) / 2), DISC_R = 33, DISC_Y = CHIP_RECT.y0 + 3 + DISC_R;
const LABEL = 36, PILL_H = 42, PILL_Y = CHIP_RECT.y1 - 3 - PILL_H / 2, PILL_PAD = 10;
/** the chip's label plate width for a label (its ink line included): it never passes CHIP_RECT's width */
export const chipPillW = (label: string) => textW(label, LABEL, [...label].some((c) => (c.codePointAt(0) ?? 0) >= 0x2e80) ? 3 : 0) + 2 * PILL_PAD + 4;
/** the chip as nodes for a holder, at scale s and opacity op, centred on (cx, cy) = the chip's centre (the sheet draws
 *  several) */
export const chipNodes = (key: string, who: Holder, s: number, op: number, ring: number, dx = 0, dy = 0): React.ReactNode => {
  const label = CHIP_LABEL[who], c = CAMP[CHIP_CAMP[who]], wide = [...label].some((ch) => (ch.codePointAt(0) ?? 0) >= 0x2e80);
  const pw = chipPillW(label) - 4, cy = (CHIP_RECT.y0 + CHIP_RECT.y1) / 2;
  const kids: React.ReactNode[] = [];
  if (ring > 0 && ring < 1) kids.push(<circle key="ring" cx={CX} cy={DISC_Y} r={DISC_R + 8 + 40 * eOut(ring)} fill="none" stroke={HC.gold} strokeWidth={7 * (1 - ring)} opacity={1 - ring} />);
  kids.push(<g key="disc" transform={`translate(${CX},${DISC_Y})`}>{jadeIcon("j", DISC_R)}</g>);
  kids.push(
    <g key="pill">
      <rect x={CX - pw / 2} y={PILL_Y - PILL_H / 2 + 5} width={pw} height={PILL_H} rx={PILL_H / 2} fill={HC.shadow} />
      <rect x={CX - pw / 2} y={PILL_Y - PILL_H / 2} width={pw} height={PILL_H} rx={PILL_H / 2} fill={c.fill} stroke={HC.ink} strokeWidth={4} />
      {svgText("t", label, CX, PILL_Y + 1, LABEL, c.text, { ls: wide ? 3 : 0 })}
    </g>,
  );
  return (
    <div key={key} style={{ ...FULL, opacity: op }}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ ...FULL, overflow: "visible", transform: `translate(${dx}px,${dy}px) scale(${s.toFixed(4)})`, transformOrigin: `${CX}px ${cy}px` }}>{kids}</svg>
    </div>
  );
};
/** THE JADE CHIP (a registered HUD): the holder of beats.ts holderAt(f); pops (1.25 -> 1, 6 frames) on each change;
 *  fades out BEAT.hudOut and back in BEAT.hudIn without a pop; fades out BEAT.chipFade; nothing before 190. */
export const chip = (p: { f: number }): React.ReactNode => {
  const { f } = p, h = holderAt(f), k = hudK(f);
  if (!h.who || k <= 0) return null;
  const t = f - h.from, pop = t >= 0 && t < 6 ? 1 + 0.25 * (1 - eOut((t + 1) / 6)) : 1;
  const first = t >= 0 && t < 3 && holderAt(h.from - 1).who === null ? (t + 1) / 3 : 1;
  return chipNodes("hud-chip", h.who, pop, k * first, t >= 0 && t < 10 ? t / 10 : 0);
};

// ---------------------------------------------------------------------------------------------------- the source tag
export type SourceProps = { f: number; from: number; out?: number; x?: number; y?: number; text?: string };
/** THE SOURCE TAG 《史记》 / "Records of the Grand Historian" (a registered HUD): top left, in BEAT.source (174-181),
 *  faded around the callback with the chip (BEAT.hudOut / hudIn), out with the chip at the end (BEAT.chipFade) */
export const sourceTag = (p: SourceProps): React.ReactNode => {
  const { f, from, x = TAG_X, y = ZONE.top, text = TXT.source } = p, Lf = life(f, from, p.out, 6), hk = hudK(f);
  if (!Lf || hk <= 0) return null;
  const k = eOut((Lf.t + 1) / 8), dim = 1 - 0.25 * clamp01((Lf.t - 135) / 15), w = textW(text, SOURCE_SIZE, 1);
  return (
    <div key="hud-source" style={FULL}>
      <div style={{ position: "absolute", left: x - 60 * (1 - k), top: y, width: 0, height: 0, opacity: k * dim * (1 - Lf.lv) * hk }}>
        <svg width={2} height={2} viewBox="0 0 2 2" style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
          <rect x={0} y={-SOURCE_SIZE * 0.55 + 5} width={11} height={SOURCE_SIZE * 1.1} rx={5} fill="rgba(8,8,16,0.4)" />
          <rect x={0} y={-SOURCE_SIZE * 0.55} width={11} height={SOURCE_SIZE * 1.1} rx={5} fill={HC.seal} stroke={HC.ink} strokeWidth={5} style={{ paintOrder: "stroke fill" } as React.CSSProperties} />
          {svgText("t", text, 24 + w / 2, 0, SOURCE_SIZE, HC.cream, { ls: 1, sw: 9 })}
        </svg>
      </div>
    </div>
  );
};
