// 采访蒙娜丽莎的一天: the composition. The kit's film shell (src/kit/day/film.tsx) with this film's World, segments and HUD.
import React from "react";
import { makeDayFilm } from "../../kit/day/film";
import { PhoneMask } from "../../kit/day/hud/phone";
import { W, H, TOTAL, SEGMENTS, lineNo, huds } from "./story";
import { World } from "./world";
import { Caption, VlogHud } from "./hud";
import { SEGS } from "./shots/segs";

export const MONA_FRAMES = TOTAL;
export const MonaFilm = makeDayFilm({
  name: "mona", W, H, timeline: SEGMENTS, segments: SEGS,
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
