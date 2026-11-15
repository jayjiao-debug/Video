// Segment A alone (see film_core.ts); frames are ABSOLUTE film frames:
//   bash scripts/kit/queue/still.sh src/videos/qin/preview/filmA.ts /home/user/qin_work/<lane>/ --pick <f1>,<f2>,... --size 540x960
import { runFilm } from "./film_core";
import { SEG } from "../shots/segA";
runFilm([SEG]);
