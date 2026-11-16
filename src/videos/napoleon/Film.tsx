// 采访拿破仑的一天: the composition. The kit's film shell (src/kit/day/film.tsx) with this film's World, segments, the
// freeze under his intro card (story.ts FREEZE / CLOCK, HOLD) with the cut-out, and the Empire skin's title and card.
import React from "react";
import type { IsolateState } from "../../kit/fx/isolate";
import { makeDayFilm } from "../../kit/day/film";
import { PhoneMask } from "../../kit/day/hud/phone";
import { clamp01 } from "../../kit/overlay";
import { W, H, TOTAL, SEGMENTS, segmentAt, lineNo, huds, CLOCK, FREEZE } from "./story";
import { World } from "./world";
import { Caption, VlogHud } from "./hud";
import { TitleBlock } from "./hud/title";
import { LeadCard, OVAL } from "./hud/intro";
import { EM } from "./hud/skin";
import { FactCards, Goal, Painting, Snow, Stamp } from "./hud/fx";
import { SEG as SEG_A } from "./shots/segA";
import { SEG as SEG_B } from "./shots/segB";
import { SEG as SEG_C } from "./shots/segC";
import { SEG as SEG_D } from "./shots/segD";
import { SEG as SEG_E } from "./shots/segE";
import { SEG as SEG_F } from "./shots/segF";
import { SEG as SEG_G } from "./shots/segG";
import { NP_CONSUL } from "./people";

/** THE CUT-OUT under his card: he and his mule stay in colour, the Alps go to an engraving's green and parchment */
const cut = (w: World, f: number): IsolateState | null => {
  const z = CLOCK.at(f);
  if (!z || z.i !== 0) return null;
  const k = clamp01((z.t + 1) / 4);                              // out on the card's flash, not on a fade
  return {
    k, keep: [w.actor(NP_CONSUL).group, w.prop("mule").group],
    wash: { dark: "#16301f", light: "#f3e8cc", amount: 0.94, dim: 0.94 },
    outline: { color: EM.cream, width: 11 },
    shadow: { x: 8, y: 10, alpha: 0.5 },
    lift: { s: 1 + 0.05 * k, cx: OVAL.cx, cy: OVAL.cy },
  };
};
/** how thick the snow falls on frame f */
const snowAt = (f: number) => { const s = segmentAt(f)?.id; return s === "A" ? 0.25 : s === "E" ? 1 : 0; };

export const NAPOLEON_FRAMES = TOTAL;
export const NapoleonFilm = makeDayFilm({
  name: "napoleon", W, H, timeline: SEGMENTS,
  segments: [SEG_A, SEG_B, SEG_C, SEG_D, SEG_E, SEG_F, SEG_G],
  makeWorld: (gl, cam) => new World(gl, cam), lineNo,
  hold: CLOCK.hold, iso: cut,
  layers: {
    hud: (c) => <>
      <VlogHud f={c.h} rec={c.P!.rec} cards={c.P!.cards} />
      {huds().map((x) => <React.Fragment key={x.name}>{x.draw(c.h, c.P!)}</React.Fragment>)}
    </>,
    under: (c) => (c.noov ? null : <Snow f={c.f} k={snowAt(c.h)} />),
    over: (c) => (c.noov ? null : <><Painting f={c.f} /><FactCards f={c.f} /><Stamp f={c.f} /><Goal f={c.f} /><TitleBlock f={c.f} /><LeadCard t={c.f - FREEZE.at} /></>),
    subtitles: (c) => { const z = CLOCK.at(c.f); return c.P && c.P.captions !== false && !c.nocap && !(z && z.t > 2) ? <Caption f={c.f} /> : null; },
    mask: () => <PhoneMask />,
  },
});
