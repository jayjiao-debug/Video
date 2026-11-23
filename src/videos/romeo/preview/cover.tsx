// THE COVER STILLS of 采访罗密欧与朱丽叶的一天: the film's picture rendered clean AT THE COVER'S OWN SHAPE (the day-in-life
// series cover, scripts/kit/cover/interview/README.md). The same shell, World and nine scenes as Film.tsx, with no
// layers (no REC display, captions, notes or overlays); the World's lens takes the canvas's shape (kit/day/world.ts
// aspect()), so a 3:4 or 4:3 still shows more of the set at the film's vertical field of view, nothing stretched.
// zoom / sx / sy (src/kit/film/env.ts) frame it. Its own entry, so src/Root.tsx stays as it is:
//   node /home/user/romeo_work/cover/stills.mjs RomeoCoverTall|RomeoCoverWide <outdir> '{"cover":true,"zoom":1.3}' f1 f2 ...
import React from "react";
import { Composition, registerRoot } from "remotion";
import { makeDayFilm } from "../../../kit/day/film";
import { TOTAL, SEGMENTS, lineNo } from "../story";
import { World } from "../world";
import { SEGS } from "../Film";

const cover = (W: number, H: number) => makeDayFilm({ name: "romeo", W, H, timeline: SEGMENTS, segments: SEGS, makeWorld: (gl, cam) => new World(gl, cam), lineNo });
const Tall = cover(1080, 1440), Wide = cover(1440, 1080);
const Root: React.FC = () => (
  <>
    <Composition id="RomeoCoverTall" component={Tall} durationInFrames={TOTAL} fps={30} width={1080} height={1440} />
    <Composition id="RomeoCoverWide" component={Wide} durationInFrames={TOTAL} fps={30} width={1440} height={1080} />
  </>
);
registerRoot(Root);
