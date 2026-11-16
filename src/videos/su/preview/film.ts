// The whole film's 3D picture (see film_core.ts); frames are absolute film frames:
//   bash scripts/kit/queue/still.sh src/videos/su/preview/film.ts /home/user/su_work/<lane>/ --pick 0,15,30 --size 540x960
import { runFilm } from "./film_core";
import { SEG as A } from "../shots/segA";
import { SEG as B } from "../shots/segB";
import { SEG as C } from "../shots/segC";
import { SEG as D } from "../shots/segD";
import { SEG as E } from "../shots/segE";
import { SEG as F } from "../shots/segF";
import { SEG as G } from "../shots/segG";
import { SEG as H } from "../shots/segH";
import { SEG as I } from "../shots/segI";
runFilm([A, B, C, D, E, F, G, H, I]);
