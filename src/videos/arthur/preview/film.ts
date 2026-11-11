// The whole film's 3D picture (see film_core.ts):
//   node scripts/rig3d/render.mjs src/videos/arthur/preview/film.ts out.png --size 540x960 --opts '{"f":120}'
//   node scripts/rig3d/render.mjs src/videos/arthur/preview/film.ts outdir --pick 0,15,30 --size 540x960
import { runFilm } from "./film_core";
import { SEG as A } from "../shots/segA";
import { SEG as B } from "../shots/segB";
import { SEG as C } from "../shots/segC";
import { SEG as D } from "../shots/segD";
import { SEG as E } from "../shots/segE";
runFilm([A, B, C, D, E]);
