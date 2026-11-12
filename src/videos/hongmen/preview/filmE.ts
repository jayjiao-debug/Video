// Segment E alone (see film_core.ts); frames are ABSOLUTE film frames:
//   /home/user/hm_tools/still.sh src/videos/hongmen/preview/filmE.ts outdir --pick <f1>,<f2>,... --size 540x960
import { runFilm } from "./film_core";
import { SEG } from "../shots/segE";
runFilm([SEG]);
