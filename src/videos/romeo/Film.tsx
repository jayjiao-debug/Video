// 采访罗密欧与朱丽叶的一天: the composition. The kit's film shell (src/kit/day/film.tsx) with this film's World, its nine
// scenes and its layers. Layer order (skin hud/index.ts): the picture; under = her whisper's darkened edges and the
// broken lens (scenes H-I); the HUD = the REC display, then fx.tsx (title, tally, notes, stamp, cards, the end card);
// the shot's own overlays (name tabs, the split's edge: they need the shot's camera); the subtitles, or her whisper note
// in their place; the phone mask for review stills.
import React from "react";
import { makeDayFilm } from "../../kit/day/film";
import { PhoneMask } from "../../kit/day/hud/phone";
import { W, H, TOTAL, SEGMENTS, lineNo, huds } from "./story";
import { World } from "./world";
import { Caption, VlogHud } from "./hud";
import { Fx, FxUnder, FxSubtitle } from "./fx";
import { SEG as SEG_A } from "./shots/segA";
import { SEG as SEG_B } from "./shots/segB";
import { SEG as SEG_C } from "./shots/segC";
import { SEG as SEG_D } from "./shots/segD";
import { SEG as SEG_E } from "./shots/segE";
import { SEG as SEG_F } from "./shots/segF";
import { SEG as SEG_G } from "./shots/segG";
import { SEG as SEG_H } from "./shots/segH";
import { SEG as SEG_I } from "./shots/segI";

export const ROMEO_FRAMES = TOTAL;
export const SEGS = [SEG_A, SEG_B, SEG_C, SEG_D, SEG_E, SEG_F, SEG_G, SEG_H, SEG_I];
export const RomeoFilm = makeDayFilm({
  name: "romeo", W, H, timeline: SEGMENTS, segments: SEGS,
  makeWorld: (gl, cam) => new World(gl, cam), lineNo,
  layers: {
    under: (c) => <FxUnder f={c.h} />,
    hud: (c) => <>
      <VlogHud f={c.h} rec={c.P!.rec} cards={c.P!.cards} />
      <Fx f={c.h} P={c.P!} />
      {huds().map((x) => <React.Fragment key={x.name}>{x.draw(c.h, c.P!)}</React.Fragment>)}
    </>,
    subtitles: (c) => (c.P && c.P.captions !== false && !c.nocap ? <><Caption f={c.f} /><FxSubtitle f={c.f} /></> : null),
    mask: () => <PhoneMask />,
  },
});
