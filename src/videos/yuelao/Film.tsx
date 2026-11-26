// 采访月老的一天: the composition. The kit's film shell (src/kit/day/film.tsx) with this film's World, its ten scenes and
// its layers: the picture (frozen and cut out on the lead card's frames: freeze.ts); the HUD = her camera's REC display,
// the title, the lead card and the meter (fx.tsx); each shot's own overlays (the 喜帖 skin); the subtitles; a shot's top.
import React from "react";
import { makeDayFilm } from "../../kit/day/film";
import { PhoneMask } from "../../kit/day/hud/phone";
import { W, H, TOTAL, SEGMENTS, lineNo, huds } from "./story";
import { World } from "./world";
import { Caption, VlogHud } from "./hud";
import { Fx } from "./fx";
import { hold, iso, afterPose, cardAt } from "./freeze";
import { SEG as SEG_A } from "./shots/segA";
import { SEG as SEG_B } from "./shots/segB";
import { SEG as SEG_C } from "./shots/segC";
import { SEG as SEG_D } from "./shots/segD";
import { SEG as SEG_E } from "./shots/segE";
import { SEG as SEG_F } from "./shots/segF";
import { SEG as SEG_G } from "./shots/segG";
import { SEG as SEG_H } from "./shots/segH";
import { SEG as SEG_I } from "./shots/segI";
import { SEG as SEG_J } from "./shots/segJ";

export const YUELAO_FRAMES = TOTAL;
export const SEGS = [SEG_A, SEG_B, SEG_C, SEG_D, SEG_E, SEG_F, SEG_G, SEG_H, SEG_I, SEG_J];
export const YuelaoFilm = makeDayFilm({
  name: "yuelao", W, H, timeline: SEGMENTS, segments: SEGS,
  makeWorld: (gl, cam) => new World(gl, cam), lineNo, hold, iso, afterPose,
  layers: {
    hud: (c) => <>
      <VlogHud f={c.f} rec={c.P!.rec} cards={c.P!.cards} />
      <Fx f={c.f} P={c.P!} />
      {huds().map((x) => <React.Fragment key={x.name}>{x.draw(c.h, c.P!)}</React.Fragment>)}
    </>,
    subtitles: (c) => (c.P && c.P.captions !== false && !c.nocap && !cardAt(c.f) ? <Caption f={c.f} /> : null),
    mask: () => <PhoneMask />,
  },
});
