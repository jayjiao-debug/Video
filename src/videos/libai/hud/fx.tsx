// hud/fx.tsx: THE 综艺 EFFECTS of the Li Bai film, in its skin (hud/skin.ts: the tavern's wine flag; amber, sky blue,
// night indigo, the cloth). The reporter's edit voice: each one is earned by something already in the picture or the
// line, lands in the gap after a line, never repeats the subtitle, and none plays in the night scene. Pure functions of
// the frame (the picture's clock, story.ts CLOCK).
//   CupCounter  今日 n/300 杯: from 「一日须倾三百杯」 (A08) until he is carried into the palace (C), ticking when he
//               drinks (card 1's swig, B15's cup). It comes back at the night's last cup, the one she shares with him
//               (F43): it rolls up to 300 as it swings in (the whole evening), and his gulp makes it 301, 达标 (Jay, 15 Nov:
//               "it should disappear then come back again when he takes that sip with the interviewer")
//   WaitBar     等皇上叫…… a loading bar after 「所以我在这儿等」 (B15), crawling; the eunuch's 李翰林！ fills it
//   SoberStamp  the bucket of water lands: 醒酒 ✓ (his card's 今日目标, paid off)
//   GrudgeMeter 高力士 glares into the lens: 记仇 +1, a little meter over him
//   MoonOS      记者OS after 「哟，月亮？」: he takes her lens for the moon
//   KnockFx     her knocks on his table: 咚 咚 咚 hopping up off the table top where the invisible hand raps it, a ring
//               on the wood under each (Jay, 15 Nov: "add sound knocking visual effects on the table")
//   <Fx f />    all of them;  fxShown()  the list for the overlay check (src/kit/overlay checkOverlays)
import React from "react";
import { AbsoluteFill } from "remotion";
import { EN } from "../lang";
import { lineId, cap, capWord, seg, FREEZE_AT_WORLD } from "../story";
import { BEAT } from "../beats";
import { life, glyph, roughFilter, gradient, seal, pop, slap, part, easeOut, easeIn, clamp01, burst, ring, barBoxes, odometer, type Shown, type Rect } from "../../../kit/overlay";
import { SKIN, C, TONE, sway, hiccup } from "./skin";

const ID = "libai-fx";

// ---------------------------------------------------------------------------------------------------- the moments
const A = BEAT.A, B = BEAT.B, Cb = BEAT.C, E = BEAT.E;
/** the cup counter: in after A08, gone before the palace (scene C); back for the cup she shares with him (F43's clink)
 *  until just before the end card */
const CUPS_IN = lineId("A08").to + 1, CUPS_OUT = seg("C").from - 2;
const SIP_IN = lineId("F43").to + 18, SIP_OUT = lineId("F44").to + 96;
/** the counter's return at the night's last cup (the overlay check lets it into the quiet scene: Jay asked for it) */
export const LAST_CUP_SPAN = [SIP_IN, SIP_OUT] as const;
/** its ticks: [frame, value]; the roll to 300 as it comes back; his gulp: 301 */
const SPIN = [SIP_IN + 4, SIP_IN + 22] as const, GULP = lineId("F44").to + 10, GOAL_AT = GULP + 1;
const TICKS: [number, number][] = [[CUPS_IN, 2], [A.card[0] + 22, 3], [B.cup + 6, 4], [GULP, 301]];
export const cupsAt = (f: number) => {
  if (f >= SPIN[0] && f < GULP) return Math.round(4 + (300 - 4) * easeOut(clamp01((f - SPIN[0]) / (SPIN[1] - SPIN[0])), 2));
  let v = 0; for (const [at, n] of TICKS) if (f >= at) v = n;
  return v;
};
const lastTick = (f: number) => { let t = -1e9; for (const [at] of TICKS) if (f >= at) t = at; return t; };
/** the wait bar: after B15 until the eunuch's first shout has landed */
const WAIT_FULL = cap("B16", 0).to + 1, WAIT = [lineId("B15").to + 2, WAIT_FULL + 26] as const;
/** the sober stamp: lands with the water */
const SOBER = [B.splash + 3, B.splash + 48] as const;
/** the grudge meter: on 高力士's glare, out as her whisper starts */
const GRUDGE = [Cb.glare + 4, lineId("C22").from + 10] as const;

// ---------------------------------------------------------------------------------------------------- the knocks
/** her three knocks (beats.ts A.knock): each 咚 pops up off the table's near left, where the invisible hand raps the
 *  wood (the still of frame 80: the table top fills x 240..1080, y 1290..1650 there), tipped a little, a flat ring
 *  spreading on the wood under it. Each lives 11 frames; the last is gone before A01's subtitle. */
const KNOCK_AT: [number, number, number][] = [[340, 1392, -10], [480, 1348, 6], [620, 1396, -4]];
const KNOCK_LIFE = 11;
const KnockFx: React.FC<{ f: number }> = ({ f }) => {
  if (f < A.knock[0] || f > A.knock[A.knock.length - 1] + KNOCK_LIFE) return null;
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", left: 0, top: 0 }}>
      {A.knock.map((k, i) => {
        const t = f - k;
        if (t < 0 || t > KNOCK_LIFE || i >= KNOCK_AT.length) return null;
        const [x, y, rot] = KNOCK_AT[i], p = pop(t, 0, 4, 2.4, 0.5), out = clamp01((t - KNOCK_LIFE + 4) / 4), rise = 26 * easeOut(clamp01(t / 6));
        return (
          <g key={i} opacity={(p.o * (1 - out)).toFixed(3)}>
            {/* the ring on the wood, flat (the table is seen from above) */}
            <g transform={`translate(${x},${y + 50}) scale(1,0.38)`}>{ring(`kr${i}`, 0, 0, 16, 80, clamp01((t + 1) / 8), C.paper, 13)}</g>
            <g transform={`translate(${x},${y + 50}) scale(1,0.45)`}>{burst(`kb${i}`, 0, 0, 7, 40, 96, clamp01((t + 1) / 8), { color: C.paper, width: 9, seed: 3 + i })}</g>
            <g transform={`translate(${x},${y - rise}) rotate(${rot}) scale(${p.s.toFixed(3)})`}>
              {glyph(`k${i}`, EN ? "knock" : "咚", 0, 0, EN ? 60 : 100, C.paper, { ink: 12, inkColor: C.ink, drop: 5 })}
            </g>
          </g>
        );
      })}
    </svg>
  );
};

// ---------------------------------------------------------------------------------------------------- the cup counter
const CC = { x0: 746, y0: 345, x1: 970, y1: 447 };   // 9:16: under the REC block, inside x 970
const CupCounter: React.FC<{ f: number }> = ({ f }) => {
  const L = life(f, CUPS_IN, CUPS_OUT, SKIN.motion.arrive, SKIN.motion.leave) ?? life(f, SIP_IN, SIP_OUT, SKIN.motion.arrive, SKIN.motion.leave);
  if (!L) return null;
  const t = L.t, n = cupsAt(f), lt = f - lastTick(f), leave = easeIn(L.leave, 2);
  const swing = sway(t, 0, 24, 20, 9) + (f >= SPIN[0] && f < SPIN[1] ? 6 * Math.sin(f * 1.7) : 0) + 50 * leave;
  const dy = hiccup(lt, 0, 10) + 80 * leave * leave, op = 1 - clamp01((L.leave - 0.5) / 0.5);
  const w = CC.x1 - CC.x0, h = CC.y1 - CC.y0, goal = f >= GOAL_AT, gs = slap(f - GOAL_AT, 0, 1.8);
  const digits = odometer(n, Math.max(1, String(n).length)), dw = digits.length * 30;
  // "/300" only while short of the goal; the number and "/300" shrink to fit the cloth (138 px after the cup)
  const of = n < 300 || n > 300, nk = Math.min(1, 138 / (dw + (of ? 68 : 0)));
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", left: 0, top: 0, opacity: op }}>
      <defs>
        {gradient(`${ID}-cc-cloth`, [C.paper, [TONE.clothLow, 0.85], TONE.clothFold])}
        {gradient(`${ID}-cc-amber`, [TONE.amberTop, [C.lead, 0.5], TONE.amberDeep])}
        {roughFilter(`${ID}-cc-edge`, SKIN.body.rough!, 2)}
      </defs>
      <g transform={`translate(0,${dy.toFixed(2)}) rotate(${swing.toFixed(2)} ${(CC.x0 + CC.x1) / 2} ${CC.y0})`}>
        <g filter={`url(#${ID}-cc-edge)`}>
          <rect x={CC.x0 + 4} y={CC.y0 + 8} width={w} height={h} rx={12} fill={TONE.shadow} />
          <rect x={CC.x0} y={CC.y0} width={w} height={h} rx={12} fill={`url(#${ID}-cc-cloth)`} stroke={C.ink} strokeWidth={5} />
          <rect x={CC.x0} y={CC.y0} width={w} height={14} rx={6} fill={C.accent} stroke={C.ink} strokeWidth={4} />
        </g>
        {/* a little wine cup */}
        <g transform={`translate(${CC.x0 + 40},${CC.y0 + 62})`}>
          <path d="M-22,-16 L22,-16 Q20,14 0,16 Q-20,14 -22,-16 Z" fill={`url(#${ID}-cc-amber)`} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
          <rect x={-8} y={14} width={16} height={8} fill={C.ink} />
        </g>
        {glyph("lbl", EN ? "cups today" : "今日杯数", CC.x0 + 130, CC.y0 + 36, EN ? 20 : 24, C.ink, { ls: 2 })}
        {/* the number rolls like an odometer; /300 after it */}
        <g transform={`translate(${CC.x0 + 74},${CC.y0 + 74}) scale(${nk.toFixed(3)})`}>
          {digits.map((d, i) => (
            <g key={i} transform={`translate(${i * 30},0)`}>
              <clipPath id={`${ID}-cc-d${i}`}><rect x={-2} y={-24} width={30} height={48} /></clipPath>
              <g clipPath={`url(#${ID}-cc-d${i})`}>
                {glyph(`d${i}a`, String(d.d), 14, -46 * d.roll, 44, n >= 300 ? C.lead : C.ink, { ink: n >= 300 ? 4 : 0, inkColor: C.ink })}
                {glyph(`d${i}b`, String(d.next), 14, 46 - 46 * d.roll, 44, n >= 300 ? C.lead : C.ink, { ink: n >= 300 ? 4 : 0, inkColor: C.ink })}
              </g>
            </g>
          ))}
          {of ? glyph("of", "/300", dw + 4, 4, 28, TONE.amberDeep, { anchor: "start" }) : null}
        </g>
        {/* 达标: the goal reached, stamped on the cloth's lower edge, under the number (never over it) */}
        {goal && gs > 0 ? (
          <g transform={`translate(${CC.x0 + 124},${CC.y1 + 24}) rotate(-8) scale(${gs.toFixed(3)})`}>
            {seal("goal", [EN ? "DONE!" : "达标"], EN ? 26 : 34, { fill: C.accent, text: C.paper, carve: 2, seed: 9, drop: TONE.shadow })}
          </g>
        ) : null}
        {goal ? burst("gb", CC.x0 + 124, CC.y1 + 24, 10, 40, 110, clamp01((f - GOAL_AT) / 10), { color: C.lead, width: 6, seed: 4 }) : null}
      </g>
    </svg>
  );
};

// ---------------------------------------------------------------------------------------------------- 记者OS: the moon
/** 记者OS after 「哟，月亮？」 (A02): her thought, what the viewer needs to get the joke: he takes her round lens for the
 *  moon (Jay, 15 Nov: "why you are out in the morning doesn't give me context"). A thought cloud in her own warm paper,
 *  top left, out before the picture freezes for his card. */
const MOON_OS = [capWord("A02", "月亮").from + 8, FREEZE_AT_WORLD - 3] as const;
const MO = { x0: 110, y0: 345, x1: 654, y1: 437 };
const MoonOS: React.FC<{ f: number }> = ({ f }) => {
  const L = life(f, MOON_OS[0], MOON_OS[1], 5, 5);
  if (!L) return null;
  const p = pop(L.t, 0, 7), op = p.o * (1 - L.leave), cy = (MO.y0 + MO.y1) / 2;
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", left: 0, top: 0, opacity: op }}>
      <g transform={`translate(${MO.x0 + 40},${cy}) scale(${p.s.toFixed(3)}) translate(${-MO.x0 - 40},${-cy})`}>
        {/* the cloud: a rounded body with three bumps, and two little puffs trailing down toward the lens */}
        <rect x={MO.x0 + 4} y={MO.y0 + 8} width={MO.x1 - MO.x0} height={MO.y1 - MO.y0} rx={44} fill={TONE.shadow} />
        <rect x={MO.x0} y={MO.y0} width={MO.x1 - MO.x0} height={MO.y1 - MO.y0} rx={44} fill="#fff6e8" stroke={C.ink} strokeWidth={5} />
        <circle cx={MO.x0 + 60} cy={MO.y1 + 22} r={12} fill="#fff6e8" stroke={C.ink} strokeWidth={4} />
        <circle cx={MO.x0 + 40} cy={MO.y1 + 48} r={7} fill="#fff6e8" stroke={C.ink} strokeWidth={4} />
        {/* her tag, in the REC lamp's red */}
        <g transform={`translate(${MO.x0 + 26},${MO.y0 - 2}) rotate(-4)`}>
          <rect x={0} y={-18} width={108} height={36} rx={8} fill="#e2463c" stroke={C.ink} strokeWidth={4} />
          {glyph("os-tag", EN ? "HER" : "记者OS", 54, 0, 22, "#ffffff", { ls: 1 })}
        </g>
        {/* a lens = a moon: the little drawing, then her words */}
        <g transform={`translate(${MO.x0 + 62},${cy + 6})`}>
          <circle r={24} fill="#2a2f45" stroke={C.ink} strokeWidth={4} />
          <circle r={13} fill="#5d6a9c" />
          <circle cx={-6} cy={-7} r={5} fill="#ffffff" opacity={0.85} />
        </g>
        {glyph("os-eq", "=", MO.x0 + 112, cy + 6, 40, C.ink)}
        <g transform={`translate(${MO.x0 + 160},${cy + 6})`}>
          <circle r={24} fill={C.paper} stroke={C.ink} strokeWidth={4} />
          <circle cx={7} cy={6} r={5} fill="rgba(214,189,138,0.8)" /><circle cx={-8} cy={-4} r={3.5} fill="rgba(214,189,138,0.8)" />
        </g>
        {glyph("os-t", EN ? "my lens = his moon?!" : "他把镜头当月亮了", MO.x0 + 204, cy + 6, EN ? 34 : 40, "#3a2a1c", { anchor: "start", ls: 2 })}
      </g>
    </svg>
  );
};

// ---------------------------------------------------------------------------------------------------- the wait bar
const WB = { x: 120, y: 1170, w: 560, h: 30 };
const WaitBar: React.FC<{ f: number }> = ({ f }) => {
  const L = life(f, WAIT[0], WAIT[1], 6, 8);
  if (!L) return null;
  const t = L.t, full = f >= WAIT_FULL, crawl = 0.03 * clamp01(t / 20), k = full ? easeOut(clamp01((f - WAIT_FULL + 1) / 5)) : crawl;
  const bx = barBoxes(WB.w, WB.h, Math.max(crawl, k)), leave = easeIn(L.leave, 2);
  const op = clamp01((t + 1) / 4) * (1 - leave), dy = 20 * (1 - easeOut(clamp01((t + 1) / 6))) + 40 * leave;
  const pct = full ? (k >= 1 ? 100 : Math.round(3 + 97 * k)) : Math.max(1, Math.round(crawl * 100));
  const label = full ? (EN ? "He's calling!" : "叫了！") : (EN ? "Waiting for the emperor…" : "等皇上叫……");
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", left: 0, top: 0, opacity: op }}>
      <g transform={`translate(${WB.x},${WB.y + dy})`}>
        {glyph("wl", label, 0, -36, 36, full ? C.lead : C.paper, { anchor: "start", ink: 8, inkColor: C.ink, ls: 2 })}
        {glyph("wp", `${pct}%`, WB.w, -36, 32, C.paper, { anchor: "end", ink: 7, inkColor: C.ink })}
        <rect x={-5} y={-WB.h / 2 - 5} width={WB.w + 10} height={WB.h + 10} rx={(WB.h + 10) / 2} fill={C.ink} />
        <rect x={0} y={-WB.h / 2} width={WB.w} height={WB.h} rx={WB.h / 2} fill={TONE.clothLow} />
        <rect x={bx.fill.x0} y={bx.fill.y0} width={Math.max(WB.h, bx.fill.x1 - bx.fill.x0)} height={WB.h} rx={WB.h / 2} fill={full ? C.lead : C.accent} />
        {full ? ring("wr", WB.w, 0, 10, 70, clamp01((f - WAIT_FULL) / 9), C.lead, 7) : null}
      </g>
    </svg>
  );
};

// ---------------------------------------------------------------------------------------------------- 醒酒 ✓
const SoberStamp: React.FC<{ f: number }> = ({ f }) => {
  const L = life(f, SOBER[0], SOBER[1], 1, 8);
  if (!L) return null;
  const t = L.t, s = slap(t, 0, 1.9), leave = easeIn(L.leave, 2), op = 1 - leave;
  const x = 340, y = 480;   // 9:16: in from the left edge (the pop and the rays stay right of x 110)
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", left: 0, top: 0, opacity: op }}>
      <defs>{roughFilter(`${ID}-sb-edge`, SKIN.body.rough!, 2)}</defs>
      {burst("sbb", x, y, 12, 70, 190, clamp01(t / 10), { color: C.accent, width: 8, seed: 2 })}
      <g transform={`translate(${x},${y + 30 * leave}) rotate(${(-10 + 40 * leave).toFixed(1)}) scale(${s.toFixed(3)})`} filter={`url(#${ID}-sb-edge)`}>
        <rect x={-150} y={-62} width={300} height={124} rx={18} fill="none" stroke={C.accent} strokeWidth={9} />
        {glyph("sb", EN ? "SOBER ✓" : "醒酒 ✓", 0, 4, EN ? 52 : 64, C.accent, { ink: 7, inkColor: C.ink, ls: 4 })}
        {glyph("sbs", EN ? "today's goal" : "今日目标", 0, -82, 26, C.paper, { ink: 6, inkColor: C.ink, ls: 3 })}
      </g>
    </svg>
  );
};

// ---------------------------------------------------------------------------------------------------- 记仇 +1
const GM = { cx: 470, y: 480, w: 300, h: 26 };
const GrudgeMeter: React.FC<{ f: number }> = ({ f }) => {
  const L = life(f, GRUDGE[0], GRUDGE[1], 5, 7);
  if (!L) return null;
  const t = L.t, k = easeOut(part(t, 4, 10)), plus = pop(t, 12, 7, SKIN.motion.over), leave = easeIn(L.leave, 2);
  const op = clamp01((t + 1) / 3) * (1 - leave), bx = barBoxes(GM.w, GM.h, 0.62 + 0.38 * k, 5);
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", left: 0, top: 0, opacity: op }}>
      <g transform={`translate(${GM.cx - GM.w / 2},${GM.y - 30 * leave})`}>
        {glyph("gl", EN ? "Grudge" : "记仇", -14, 0, 38, C.paper, { anchor: "end", ink: 8, inkColor: C.ink, ls: 2 })}
        <rect x={-5} y={-GM.h / 2 - 5} width={GM.w + 10} height={GM.h + 10} rx={8} fill={C.ink} />
        <rect x={0} y={-GM.h / 2} width={GM.w} height={GM.h} rx={5} fill={TONE.clothLow} />
        <rect x={0} y={-GM.h / 2} width={bx.fill.x1} height={GM.h} rx={5} fill="#8a3fb3" />
        {[1, 2, 3, 4].map((i) => <line key={i} x1={(GM.w * i) / 5} y1={-GM.h / 2} x2={(GM.w * i) / 5} y2={GM.h / 2} stroke={C.ink} strokeWidth={4} />)}
        {plus.o > 0 ? <g opacity={plus.o} transform={`translate(${GM.w + 62},0) scale(${plus.s.toFixed(3)})`}>{glyph("gp", "+1", 0, 0, 52, C.lead, { ink: 9, inkColor: C.ink })}</g> : null}
      </g>
    </svg>
  );
};

/** every effect on frame f (the picture's clock) */
export const Fx: React.FC<{ f: number }> = ({ f }) => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <KnockFx f={f} /><CupCounter f={f} /><MoonOS f={f} /><WaitBar f={f} /><SoberStamp f={f} /><GrudgeMeter f={f} />
  </AbsoluteFill>
);

/** the effects for the overlay check (checkOverlays): their spans and boxes */
export const fxShown = (): Shown[] => [
  { what: "knocks 咚", kind: "effect", from: A.knock[0], to: A.knock[A.knock.length - 1] + KNOCK_LIFE, rect: () => ({ x0: 250, y0: 1262, x1: 712, y1: 1486 }), scene: "A" },
  { what: "cup counter", kind: "effect", from: CUPS_IN, to: CUPS_OUT, rect: () => ({ x0: CC.x0 - 20, y0: CC.y0 - 10, x1: CC.x1 + 4, y1: CC.y1 + 60 }) },
  { what: "cup counter (the last cup)", kind: "effect", from: SIP_IN, to: SIP_OUT, rect: () => ({ x0: CC.x0 - 20, y0: CC.y0 - 10, x1: CC.x1 + 4, y1: CC.y1 + 60 }), scene: "F" },
  { what: "记者OS (the moon)", kind: "effect", from: MOON_OS[0], to: MOON_OS[1], rect: () => ({ x0: MO.x0 - 6, y0: MO.y0 - 24, x1: MO.x1 + 10, y1: MO.y1 + 60 }), scene: "A" },
  { what: "wait bar", kind: "effect", from: WAIT[0], to: WAIT[1], rect: () => ({ x0: WB.x - 6, y0: WB.y - 64, x1: WB.x + WB.w + 6, y1: WB.y + 22 }), scene: "B" },
  { what: "醒酒 stamp", kind: "effect", from: SOBER[0], to: SOBER[1], rect: () => ({ x0: 110, y0: 360, x1: 530, y1: 560 }), scene: "B" },
  { what: "记仇 meter", kind: "effect", from: GRUDGE[0], to: GRUDGE[1], rect: () => ({ x0: GM.cx - GM.w / 2 - 110, y0: GM.y - 40, x1: GM.cx + GM.w / 2 + 100, y1: GM.y + 40 }), scene: "C" },
];
export const FX_RECTS = (f: number): { what: string; r: Rect }[] => fxShown().filter((s) => f >= s.from && f <= s.to).map((s) => ({ what: s.what, r: s.rect(f)! }));
void seg; void E;

/** the effects' sounds (picture frames; scripts/libai/sound/events.mjs dumps them for the mix): [frame, clip, gain dB] */
export const FX_SOUNDS: [number, string, number, string][] = [
  [CUPS_IN, "pop_hat", -17, "the cup counter swings in"],
  ...TICKS.slice(1, -1).map(([at]): [number, string, number, string] => [at, "sfx_shell_pop", -17, "a cup more"]),
  [SIP_IN, "pop_hat", -20, "the cup counter swings back in (the last cup)"],
  [SPIN[0], "sfx_coins", -20, "the counter rolls up to 300 (the whole evening)"],
  [GOAL_AT, "sfx_stamp", -16, "301: 达标"],
  [MOON_OS[0], "sfx_bubble", -21, "记者OS: the lens is his moon"],
  [WAIT[0], "sfx_bubble", -19, "the wait bar"],
  [WAIT_FULL, "card_ding", -15, "the wait bar fills"],
  [SOBER[0], "sfx_stamp", -12, "醒酒 ✓"],
  [GRUDGE[0], "scale_creak", -18, "记仇 meter"],
  [GRUDGE[0] + 12, "sting_oops", -20, "记仇 +1"],
];
