// Segment E alone (see film_core.ts); frames are ABSOLUTE film frames:
//   bash scripts/kit/queue/still.sh src/videos/newton/preview/filmE.ts /home/user/newton_work/film/<lane>/ --pick <f1>,<f2>,... --size 540x960
import { runFilm } from "./film_core";
import { SEG } from "../shots/segE";
runFilm([SEG]);
