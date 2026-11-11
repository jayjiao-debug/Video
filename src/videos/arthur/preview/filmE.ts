// Segment E alone (see film_core.ts); frames are absolute film frames:
//   node scripts/rig3d/render.mjs src/videos/arthur/preview/filmE.ts outdir --pick <f1>,<f2>,... --size 360x640
import { runFilm } from "./film_core";
import { SEG } from "../shots/segE";
runFilm([SEG]);
