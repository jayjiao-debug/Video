// The cut's picture entry: the whole film's 3D picture with the film's post chain (see film_cut_core.ts), frames
// are ABSOLUTE film frames. Rendered in chunks by scripts/hongmen/cut/make_cut.sh; by hand:
//   /home/user/hm_tools/still.sh src/videos/hongmen/preview/film_cut.ts out.png --size 540x960 --opts '{"f":120,"font":"/home/user/jayjiao-debug/video/public/bt/sans700.ttf"}'
//   /home/user/hm_tools/still.sh src/videos/hongmen/preview/film_cut.ts outdir --pick 100,101,102 --size 540x960 --opts '{"f":100,"font":"/home/user/jayjiao-debug/video/public/bt/sans700.ttf"}'
// THE INK IMPORT BELOW MUST BE THE ONE Film.tsx USES (same module, as seen from this folder). make_cut.sh compares the
// two; when Film.tsx has moved on and this line has not, it renders through a generated copy of this entry with
// Film.tsx's import (and says so), so the cut never shows another outline pass than the film.
import { InkPass, noInkFallback } from "../fx/ink";
import { runCut } from "./film_cut_core";
import { SEG as A } from "../shots/segA";
import { SEG as B } from "../shots/segB";
import { SEG as C } from "../shots/segC";
import { SEG as D } from "../shots/segD";
import { SEG as E } from "../shots/segE";
runCut({ InkPass, noInkFallback }, [A, B, C, D, E]);
