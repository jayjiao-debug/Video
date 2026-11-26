// THE FILM'S GRAPHICS ON THE TIMELINE that no single shot owns: the title (the kit's title block, in scene A's gap).
// Everything else (strips, seals, the tally, the letter, the white words, the end slate) is drawn by its scene.
import React from "react";
import { TITLE_BLOCK, type Pose } from "./story";
import { ExtraTitle } from "./hud/skin";

export const Fx: React.FC<{ f: number; P: Pose }> = ({ f, P }) => (
  <>{f >= TITLE_BLOCK.from && f <= TITLE_BLOCK.to && P.cards !== false ? <ExtraTitle f={f} from={TITLE_BLOCK.from} to={TITLE_BLOCK.to} /> : null}</>
);
