// Segment B alone (see film_core.ts); frames are ABSOLUTE film frames:
//   /home/user/hm_tools/still.sh src/videos/hongmen/preview/filmB.ts outdir --pick <f1>,<f2>,... --size 540x960
import { runFilm } from "./film_core";
import { SEG } from "../shots/segB";
runFilm([SEG]);
