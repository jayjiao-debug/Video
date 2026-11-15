// THE STARTER FILM's composition: the kit's film shell (src/kit/day/film.tsx) with this film's World, segments and HUD.
import React from "react";
import { makeDayFilm } from "../../kit/day/film";
import { PhoneMask } from "../../kit/day/hud/phone";
import { W, H, TOTAL, SEGMENTS, lineNo, huds } from "./story";
import { World } from "./world";
import { Caption, VlogHud } from "./hud";
import { SEG as SEG_A } from "./shots/segA";
import { SEG as SEG_B } from "./shots/segB";

export const DAY_TEMPLATE_FRAMES = TOTAL;
export const DayTemplateFilm = makeDayFilm({
  name: "day_template", W, H, timeline: SEGMENTS, segments: [SEG_A, SEG_B],
  makeWorld: (gl, cam) => new World(gl, cam), lineNo,
  layers: {
    hud: (c) => <>
      <VlogHud f={c.h} rec={c.P!.rec} cards={c.P!.cards} />
      {huds().map((x) => <React.Fragment key={x.name}>{x.draw(c.h, c.P!)}</React.Fragment>)}
    </>,
    subtitles: (c) => (c.P && c.P.captions !== false && !c.nocap ? <Caption f={c.f} /> : null),
    mask: () => <PhoneMask />,
  },
});
