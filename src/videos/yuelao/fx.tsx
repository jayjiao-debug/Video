// THE FILM'S GRAPHICS ON THE TIMELINE that no single shot owns: the title (in scene A's gap after 「您记，随便记。」),
// the lead's card (over the frozen picture), and the year's target meter that runs from scene B to the fix.
import React from "react";
import { TITLE_BLOCK, seg, line, type Pose } from "./story";
import { ThreadTitle, LeadCard, Meter } from "./hud/skin";
import { CARD, PORTRAIT } from "./freeze";
import { METER } from "./beats";

export const Fx: React.FC<{ f: number; P: Pose }> = ({ f, P }) => (
  <>
    {f >= TITLE_BLOCK.from && f <= TITLE_BLOCK.to && P.cards !== false ? <ThreadTitle f={f} from={TITLE_BLOCK.from} to={TITLE_BLOCK.to} /> : null}
    {f >= CARD.from && f <= CARD.to ? <LeadCard f={f} from={CARD.from} to={CARD.to} cx={PORTRAIT.x} cy={PORTRAIT.y} r={PORTRAIT.moonR} /> : null}
    {METER.spans.map(([a, b], i) => (f >= a && f <= b ? <Meter key={i} f={f} from={a} to={b} bumps={METER.bumps} done={METER.done} /> : null))}
  </>
);
void seg; void line;
