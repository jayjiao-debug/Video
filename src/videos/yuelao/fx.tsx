// THE FILM'S GRAPHICS ON THE TIMELINE that no single shot owns: the title (in scene A's gap after 「您记，随便记。」),
// the lead's card (over the frozen picture), the year's target meter that runs from scene B to the fix, and the two
// FACT CARDS (the sources' voice: each sits in the silence after its line, with its source and its seal).
import React from "react";
import { TITLE_BLOCK, CARDS, seg, type Pose } from "./story";
import { ThreadTitle, LeadCard, Meter, Fact, factSize } from "./hud/skin";
import { CARD, PORTRAIT } from "./freeze";
import { METER } from "./beats";

/** the fact cards by the line they follow: the rows as set, the source, the seal, where the card's top sits. Short on
 *  purpose: each lives only in the silence after its line (2.6 s and 2.4 s), so every word must read in that time */
export const FACTS: Record<string, { rows: string[]; src: string; seal: "真事" | "传说"; y: number }> = {
  B04: { rows: ["2025年 结婚 676.3 万对", "离婚 274.3 万对"], src: "民政部数据", seal: "真事", y: 1034 },
  E03: { rows: ["唐《定婚店》", "赤绳“以系夫妻之足”"], src: "李复言《续玄怪录》", seal: "传说", y: 1034 },
};
/** THE TITLE hangs in the room from the title block's first frame to the cut into scene B: its thread is strung once he has
 *  turned to go (threadAt), and the paper drops onto it when he has trotted out from under it (paperAt): it never covers him */
export const TITLE_ON = { from: TITLE_BLOCK.from, to: seg("A").to, threadAt: 6, paperAt: 15 };
/** the boxes of the timeline's graphics on frame f (for the overlay check) */
export const fxRects = (f: number) => {
  const out: { what: string; kind: "title" | "card" | "effect"; r: { x0: number; y0: number; x1: number; y1: number } }[] = [];
  if (f >= TITLE_ON.from + TITLE_ON.paperAt && f <= TITLE_ON.to) out.push({ what: "片名", kind: "title", r: { x0: 122, y0: 440, x1: 958, y1: 830 } });
  if (f >= CARD.from && f <= CARD.to) out.push({ what: "月老的人物卡", kind: "card", r: { x0: 110, y0: 1010, x1: 890, y1: 1472 } });
  if (METER.spans.some(([a, b]) => f >= a && f <= b)) out.push({ what: "年度指标", kind: "card", r: { x0: 112, y0: 366, x1: 516, y1: 438 } });
  for (const c of CARDS) { const F = FACTS[c.id]; if (F && f >= c.from && f <= c.to) { const { w, h } = factSize(F.rows, F.src); out.push({ what: `事实卡 ${c.id}`, kind: "card", r: { x0: 540 - w / 2, y0: F.y - 24, x1: 540 + w / 2 + 6, y1: F.y + h + 8 } }); } }
  return out;
};

export const Fx: React.FC<{ f: number; P: Pose }> = ({ f, P }) => (
  <>
    {f >= TITLE_ON.from && f <= TITLE_ON.to && P.cards !== false ? <ThreadTitle f={f} from={TITLE_ON.from} to={TITLE_ON.to} threadAt={TITLE_ON.threadAt} paperAt={TITLE_ON.paperAt} cut /> : null}
    {f >= CARD.from && f <= CARD.to ? <LeadCard f={f} from={CARD.from} to={CARD.to} cx={PORTRAIT.x} cy={PORTRAIT.y} r={PORTRAIT.moonR} /> : null}
    {METER.spans.map(([a, b], i) => (f >= a && f <= b ? <Meter key={i} f={f} from={a} to={b} bumps={METER.bumps} done={METER.done} /> : null))}
    {P.cards !== false ? CARDS.map((c) => { const F = FACTS[c.id]; return F && f >= c.from && f <= c.to ? <Fact key={c.id} f={f} from={c.from} to={c.to} y={F.y} rows={F.rows} src={F.src} seal={F.seal} /> : null; }) : null}
  </>
);
