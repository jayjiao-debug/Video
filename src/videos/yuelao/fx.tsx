// THE FILM'S GRAPHICS ON THE TIMELINE that no single shot owns: the title (in scene A's gap after 「您记，随便记。」),
// his name token (v6: no freeze), the year's quota meter that runs from scene B to the fix, and the two
// FACT CARDS (the sources' voice: each sits in the silence after its line, with its source and its seal).
import React from "react";
import { TITLE_BLOCK, CARDS, seg, type Pose } from "./story";
import { ThreadTitle, NameToken, TOKEN_BOX, Meter, Fact, factSize } from "./hud/skin";
import { line } from "./story";
import { METER } from "./beats";

/** the fact cards by the line they follow: the rows as set, the source, the seal, where the card's top sits. Short on
 *  purpose: each lives only in the silence after its line (2.6 s and 2.4 s), so every word must read in that time */
export const FACTS: Record<string, { rows: string[]; src: string; seal: "真事" | "传说"; y: number }> = {
  B04: { rows: ["2025年 结婚【676.3万】对", "离婚【274.3万】对"], src: "民政部 · 2025年全年登记数", seal: "真事", y: 1010 },
  E03: { rows: ["唐《定婚店》：", "赤绳“以系【夫妻之足】”"], src: "李复言《续玄怪录》", seal: "传说", y: 1010 },
};
/** THE TITLE hangs in the room from the title block's first frame to the cut into scene B (v6: no trot to the desk; he
 *  stands low on the left presenting his bureau while she steps back, so the plaque comes down over the room and never
 *  over him): its cords first (threadAt), then the plaque (paperAt) */
export const TITLE_ON = { from: TITLE_BLOCK.from, to: seg("A").to, threadAt: 6, paperAt: 15 };
/** HIS NAME TOKEN (v6, in place of the freeze card): it comes down beside him after 「一动，三对离婚。」 while he turns,
 *  and is pulled up again before 「等等……」; x / y = where its cord leaves the top of the frame (the shot keeps his face
 *  clear of TOKEN_BOX) */
export const TOKEN = (() => { const from = line("A02").to + 4; return { from, to: from + 84, x: 850, y: 300, side: "left" as const }; })();
/** the boxes of the timeline's graphics on frame f (for the overlay check) */
export const fxRects = (f: number) => {
  const out: { what: string; kind: "title" | "card" | "effect"; r: { x0: number; y0: number; x1: number; y1: number } }[] = [];
  if (f >= TITLE_ON.from + TITLE_ON.paperAt && f <= TITLE_ON.to) out.push({ what: "片名", kind: "title", r: { x0: 122, y0: 440, x1: 958, y1: 830 } });
  if (f >= TOKEN.from && f <= TOKEN.to) out.push({ what: "月老的腰牌", kind: "card", r: TOKEN_BOX(TOKEN.x, TOKEN.y, TOKEN.side) });
  if (METER.spans.some(([a, b]) => f >= a && f <= b)) out.push({ what: "年度指标", kind: "card", r: { x0: 112, y0: 366, x1: 516, y1: 438 } });
  for (const c of CARDS) { const F = FACTS[c.id]; if (F && f >= c.from && f <= c.to) { const { w, h } = factSize(F.rows, F.src); out.push({ what: `事实卡 ${c.id}`, kind: "card", r: { x0: 540 - w / 2, y0: F.y - 24, x1: 540 + w / 2 + 6, y1: F.y + h + 8 } }); } }
  return out;
};

export const Fx: React.FC<{ f: number; P: Pose }> = ({ f, P }) => (
  <>
    {f >= TITLE_ON.from && f <= TITLE_ON.to && P.cards !== false ? <ThreadTitle f={f} from={TITLE_ON.from} to={TITLE_ON.to} threadAt={TITLE_ON.threadAt} paperAt={TITLE_ON.paperAt} cut /> : null}
    {f >= TOKEN.from && f <= TOKEN.to && P.cards !== false ? <NameToken f={f} from={TOKEN.from} to={TOKEN.to} x={TOKEN.x} y={TOKEN.y} side={TOKEN.side} /> : null}
    {METER.spans.map(([a, b], i) => (f >= a && f <= b ? <Meter key={i} f={f} from={a} to={b} bumps={METER.bumps} done={METER.done} start={METER.spans[0][0]} /> : null))}
    {P.cards !== false ? CARDS.map((c) => { const F = FACTS[c.id]; return F && f >= c.from && f <= c.to ? <Fact key={c.id} f={f} from={c.from} to={c.to} y={F.y} rows={F.rows} src={F.src} seal={F.seal} /> : null; }) : null}
  </>
);
