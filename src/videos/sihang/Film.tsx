// 采访八百壮士的一天: the composition. The kit's film shell (src/kit/day/film.tsx) with this film's World, its eight
// scenes and its layers: the picture; the HUD = her camera's REC display and the title; each shot's own overlays (the
// 号外 skin: strips, seals, the tally, her letter); the subtitles; a shot's top layer (black, the end slate).
import React from "react";
import { makeDayFilm } from "../../kit/day/film";
import { PhoneMask } from "../../kit/day/hud/phone";
import { W, H, TOTAL, SEGMENTS, lineNo, huds } from "./story";
import { World } from "./world";
import { Caption, VlogHud } from "./hud";
import { Fx } from "./fx";
import { SEG as SEG_A } from "./shots/segA";
import { SEG as SEG_B } from "./shots/segB";
import { SEG as SEG_C } from "./shots/segC";
import { SEG as SEG_D } from "./shots/segD";
import { SEG as SEG_E } from "./shots/segE";
import { SEG as SEG_F } from "./shots/segF";
import { SEG as SEG_G } from "./shots/segG";
import { SEG as SEG_H } from "./shots/segH";

export const SIHANG_FRAMES = TOTAL;
export const SEGS = [SEG_A, SEG_B, SEG_C, SEG_D, SEG_E, SEG_F, SEG_G, SEG_H];
export const SihangFilm = makeDayFilm({
  name: "sihang", W, H, timeline: SEGMENTS, segments: SEGS,
  makeWorld: (gl, cam) => new World(gl, cam), lineNo,
  layers: {
    hud: (c) => <>
      <VlogHud f={c.h} rec={c.P!.rec} cards={c.P!.cards} />
      <Fx f={c.h} P={c.P!} />
      {huds().map((x) => <React.Fragment key={x.name}>{x.draw(c.h, c.P!)}</React.Fragment>)}
    </>,
    subtitles: (c) => (c.P && c.P.captions !== false && !c.nocap ? <Caption f={c.f} /> : null),
    mask: () => <PhoneMask />,
  },
});
