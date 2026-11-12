// The cut's picture entry (Wanbi, WP14): the whole film's 3D picture with the film's post chain (see
// film_cut_core.ts); frames are ABSOLUTE film frames. Rendered in chunks by scripts/kit/cut/make_cut.sh --film wanbi
// (kit.json entries.pic); by hand:
//   bash scripts/kit/queue/still.sh src/videos/wanbi/preview/film_cut.ts /home/user/wanbi_work/<wp>/out.png --size 540x960 --opts '{"f":120}'
// THE INK IMPORT BELOW MUST BE THE ONE Film.tsx USES (same module, as seen from this folder). make_cut.sh compares the
// two; when Film.tsx has moved on and this line has not, it renders through a generated copy of this entry with
// Film.tsx's import (and says so), so the cut never shows another outline pass than the film.
// The segment imports follow kit.json entries.segFile ("shots/seg{SEG}"): the cut stubs the other four out to hash and
// render one segment at a time.
import { InkPass, noInkFallback } from "../../../kit/fx/ink";
import { runCut } from "./film_cut_core";
import { SEG as A } from "../shots/segA";
import { SEG as B } from "../shots/segB";
import { SEG as C } from "../shots/segC";
import { SEG as D } from "../shots/segD";
import { SEG as E } from "../shots/segE";
runCut({ InkPass, noInkFallback }, [A, B, C, D, E]);
