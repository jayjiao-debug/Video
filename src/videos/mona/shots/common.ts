// THE VERBS of this film's shots: the kit's action library (src/kit/day/verbs.ts) with this film's quotes.
import { makeVerbs } from "../../../kit/day/verbs";
import { FPS, QUOTES } from "../story";
import { EYE, FOV } from "../cam";

export const VERBS = makeVerbs({ fps: FPS, EYE, FOV, quotes: QUOTES });
export const { V, v3, yawTo, speak, accent, ky, saying, eye } = VERBS;
