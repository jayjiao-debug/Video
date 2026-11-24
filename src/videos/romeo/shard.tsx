// THE BROKEN LENS (script v2, H05 and scene I): she throws her camera on 「不要啊！」 (until v5 「不拍了！」), it knocks the bottle out of Romeo's
// hand and shatters; one big shard of the lens survives, and through it we see Juliet wake. Drawn UNDER her camera's UI
// (the cracks are in the glass in front of the lens, the REC display is electronic and stays crisp above them).
//   THROW_AT     the frame she throws (the first word of 不要啊)
//   IMPACT_AT    the camera hits the bottle and the glass breaks, FLIGHT frames later: THE THROW IS IN SLOW MOTION
//   worldF(f)    the world's own frame at film frame f (it runs slow through the flight): what moves in the picture
//                (his hand, the torch flames, the dust) is timed by it, not by f
//   shardAt(f)   { phase: "crack" | "dark" | "shard", k } or null
//   <Shard f s /> the glass: the crack star and the flash at the impact, then the dark, then the one shard
import React from "react";
import { AbsoluteFill } from "remotion";
import { capWord } from "./captions";
import { line, seg } from "./story";
import { clamp01 } from "../group/story";

export const THROW_AT = capWord("H05", "拍不下去").from;
/** THE THROW IN SLOW MOTION (v5, the owner: "then we do a slow scene as the camera is being thrown, screen spinning in
 *  a sense"). The flight takes FLIGHT frames of film (until v4: 11). The world runs at full speed for the throw's first
 *  frames and for the last ones into the hit, and at SLOW_RATE of it between them: RAMP is the world's speed over the
 *  flight's frames. */
export const FLIGHT = 77;
export const IMPACT_AT = THROW_AT + FLIGHT;
const SLOW_RATE = 0.12;
const RAMP: [number, number][] = [[0, 1], [4, 1], [12, SLOW_RATE], [FLIGHT - 10, SLOW_RATE], [FLIGHT - 3, 1], [FLIGHT, 1]];
/** how fast the world runs, u film frames into the flight (1 = as the film) */
export const flightRate = (u: number) => {
  if (u <= 0 || u >= FLIGHT) return 1;
  let i = 0; while (i < RAMP.length - 2 && u > RAMP[i + 1][0]) i++;
  const [u0, r0] = RAMP[i], [u1, r1] = RAMP[i + 1];
  return r0 + ((r1 - r0) * (u - u0)) / (u1 - u0);
};
/** the world's frames gone by, u film frames into the flight (the area under RAMP) */
export const flown = (u: number) => {
  const x = Math.min(FLIGHT, Math.max(0, u));
  let a = 0;
  for (let i = 0; i < RAMP.length - 1; i++) {
    const [u0, r0] = RAMP[i], [u1, r1] = RAMP[i + 1];
    if (x <= u0) break;
    const e = Math.min(x, u1), re = r0 + ((r1 - r0) * (e - u0)) / (u1 - u0);
    a += ((r0 + re) / 2) * (e - u0);
  }
  return a;
};
/** the whole flight in the world's frames (about 22: two thirds of a second for three metres) */
export const FLOWN = flown(FLIGHT);
/** THE WORLD'S FRAME at film frame f: the film's own until the throw, slow through the flight, and FLIGHT - FLOWN
 *  behind from the hit to the end of scene H (scene I opens in the dark on the film's own frames again) */
export const worldF = (f: number) => (f <= THROW_AT ? f : f >= IMPACT_AT ? f - (FLIGHT - FLOWN) : THROW_AT + flown(f - THROW_AT));
/** the camera lies on the floor for this long after the impact before the picture goes dark */
const SETTLE = 26, DARK_IN = 10;
/** scene I: the shard's light comes back over SHARD_IN frames; it flickers on her last line; the power-off ends it */
const SHARD_IN = 22;
/** (v6, the owner on the v5 cut: "The broken camera filter should carry on until the letter and comes up at the end, I
 *  see a split frame where it was back to normal") the shard holds through the power-off (hud.tsx OFF_AT, the REC
 *  display dying over POWER_OFF frames) until the black the end card unfolds on (fx.tsx END_FROM). Until v5 it ended
 *  at OFF_AT and the whole unbroken picture showed for those 14 frames. */
const POWER_OFF = 14;
const OFF = () => line("I04").to + 22 + POWER_OFF;

export type ShardState = { phase: "crack" | "dark" | "shard"; k: number; t: number };
export function shardAt(f: number): ShardState | null {
  const I = seg("I");
  if (f >= IMPACT_AT && f < I.from) {
    const t = f - IMPACT_AT;
    if (t < SETTLE) return { phase: "crack", k: clamp01(t / 4), t };
    return { phase: "dark", k: clamp01((t - SETTLE) / DARK_IN), t };
  }
  if (f >= I.from && f < OFF()) return { phase: "shard", k: clamp01((f - I.from) / SHARD_IN), t: f - I.from };
  return null;
}

// the impact point and the crack star (film px)
const HIT: [number, number] = [612, 868];
const RAYS: [number, number][][] = [
  [[612, 868], [700, 780], [790, 640], [880, 470], [1000, 300]],
  [[612, 868], [760, 900], [930, 960], [1090, 1010]],
  [[612, 868], [690, 1010], [760, 1180], [820, 1420], [870, 1700], [900, 1930]],
  [[612, 868], [540, 1020], [430, 1220], [300, 1450], [180, 1700]],
  [[612, 868], [470, 860], [300, 820], [120, 760], [-10, 740]],
  [[612, 868], [560, 720], [500, 560], [420, 360], [330, 120]],
  [[612, 868], [650, 700], [640, 520], [680, 300], [700, 60]],
];
const RINGS: [number, number][][] = [
  [[660, 820], [700, 860], [690, 930], [640, 960], [580, 930], [560, 870], [590, 820], [660, 820]],
  [[750, 700], [850, 860], [810, 1030], [690, 1120], [560, 1080], [470, 940], [500, 760], [620, 650], [750, 700]],
];
/** the one surviving shard (film px): the picture shows through it */
export const SHARD: [number, number][] = [[118, 452], [604, 372], [946, 420], [1004, 846], [930, 1286], [742, 1532], [312, 1588], [96, 1240], [140, 860]];
const SHARD_CRACKS: [number, number][][] = [
  [[604, 372], [560, 640], [600, 900]],
  [[96, 1240], [360, 1180], [520, 1260]],
  [[930, 1286], [800, 1200], [760, 1050]],
];
const pts = (p: [number, number][]) => p.map(([x, y]) => `${x},${y}`).join(" ");

export const Shard: React.FC<{ f: number; s: ShardState }> = ({ f, s }) => {
  if (s.phase === "crack") {
    const flash = s.t < 3 ? 0.85 * (1 - s.t / 3) : 0;
    const grow = s.k;
    return (
      <AbsoluteFill>
        <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
          {RAYS.map((r, i) => {
            const n = Math.max(2, Math.round(r.length * grow));
            return <polyline key={i} points={pts(r.slice(0, n))} fill="none" stroke="rgba(255,250,240,0.82)" strokeWidth={i % 2 ? 2.4 : 3.4} strokeLinejoin="round" />;
          })}
          {grow > 0.5 ? RINGS.map((r, i) => <polyline key={`r${i}`} points={pts(r)} fill="none" stroke="rgba(255,250,240,0.6)" strokeWidth={2} />) : null}
          <circle cx={HIT[0]} cy={HIT[1]} r={30 + 40 * grow} fill="rgba(255,255,255,0.18)" />
        </svg>
        {flash > 0 ? <AbsoluteFill style={{ background: "#fffaf0", opacity: flash }} /> : null}
      </AbsoluteFill>
    );
  }
  if (s.phase === "dark") {
    return (
      <AbsoluteFill>
        <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
          {RAYS.map((r, i) => <polyline key={i} points={pts(r)} fill="none" stroke="rgba(255,250,240,0.7)" strokeWidth={i % 2 ? 2.4 : 3.4} />)}
        </svg>
        <AbsoluteFill style={{ background: "#140d09", opacity: s.k }} />
      </AbsoluteFill>
    );
  }
  // the shard: the dark everywhere but inside it, its edges catching light, a flicker on her last line
  const I04 = line("I04"), flick = f >= I04.from ? 0.5 + 0.5 * Math.cos((f - I04.from) * 1.9) * (f % 7 === 0 ? 1 : 0.3) : 1;
  // (until v3 the shard went dark for five frames here and Juliet was sitting when it came back; she sits up in view now)
  const open = s.k * (f >= I04.from ? 0.75 + 0.25 * flick : 1);
  const hole = `M0,0 H1080 V1920 H0 Z M${pts(SHARD).replace(/ /g, " L")} Z`;
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0 }}>
        <path d={hole} fill="#140d09" fillRule="evenodd" opacity={0.6 + 0.36 * s.k} />
        <polygon points={pts(SHARD)} fill="#140d09" opacity={1 - open} />
        <polygon points={pts(SHARD)} fill="none" stroke="rgba(255,248,232,0.75)" strokeWidth={3} strokeLinejoin="round" opacity={0.4 + 0.5 * s.k} />
        {SHARD_CRACKS.map((r, i) => <polyline key={i} points={pts(r)} fill="none" stroke="rgba(255,248,232,0.45)" strokeWidth={1.8} opacity={s.k} />)}
        <polyline points={pts([[150, 470], [600, 392], [930, 438]])} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth={6} opacity={0.6 * s.k} />
      </svg>
    </AbsoluteFill>
  );
};
