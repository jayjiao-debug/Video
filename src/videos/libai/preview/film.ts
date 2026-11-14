// The whole film's 3D picture (see film_core.ts); frames are absolute film frames:
//   bash scripts/kit/queue/still.sh src/videos/libai/preview/film.ts /home/user/libai_work/<lane>/ --pick 0,15,30 --size 540x960
import { runFilm } from "./film_core";
import { SEG as A } from "../shots/segA";
import { SEG as B } from "../shots/segB";
import { SEG as C } from "../shots/segC";
import { SEG as D } from "../shots/segD";
import { SEG as E } from "../shots/segE";
import { SEG as F } from "../shots/segF";
runFilm([A, B, C, D, E, F]);
