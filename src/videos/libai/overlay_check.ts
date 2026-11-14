// overlay_check.ts: the film's overlays through the shared check (src/kit/overlay checkOverlays): the phone-safe frame,
// the REC display, the app's buttons, the subtitles and the whisper bubble, each other, the quiet night scene and the
// effects' budget. Faces are checked by eye on stills (the check has no world). Run: node scripts/libai/overlay_check.mjs
import { checkOverlays, FRAME_9x15, type Shown } from "../../kit/overlay/frame";
import { TITLE_SPAN, SIDE_BANNERS } from "./beats";
import { seg, CARDS } from "./story";
import { TITLE_RECT } from "./hud/title";
import { sideBannerRect } from "./hud/intro";
import { fxShown, LAST_CUP_SPAN } from "./hud/fx";
import { factRect } from "./hud/card";
import { captionRect } from "./hud/caption";
import { whisperRectAt, whisperCapAt } from "./hud/whisper";
import { poemAt, poemRect } from "./hud/poem";

const HE_SPAN = SIDE_BANNERS.find((b) => b.who === "he")!.span;
/** a quiet span with holes cut out of it */
const quietSpans = (q: readonly [number, number], holes: (readonly [number, number])[]): [number, number][] => {
  let out: [number, number][] = [[q[0], q[1]]];
  for (const [a, b] of holes) out = out.flatMap(([x, y]): [number, number][] => (b < x || a > y ? [[x, y]] : [...(a > x ? [[x, a - 1] as [number, number]] : []), ...(b < y ? [[b + 1, y] as [number, number]] : [])]));
  return out;
};
export const runCheck = () => {
  const items: Shown[] = [
    { what: "title", kind: "title", from: TITLE_SPAN[0], to: TITLE_SPAN[1], rect: () => TITLE_RECT },
    ...SIDE_BANNERS.map((b): Shown => ({ what: `${b.who} banner`, kind: "card", from: b.span[0], to: b.span[1], rect: sideBannerRect, scene: b.scene })),
    ...fxShown(),
    ...CARDS.map((c): Shown => ({ what: `fact card ${c.n}`, kind: "card", from: c.from, to: c.to, rect: factRect })),
  ];
  return checkOverlays(items, {
    spec: FRAME_9x15,
    protect: (f) => {
      const z = [];
      const w = whisperRectAt(f); if (w) z.push({ what: "her whisper", r: w });
      const c = whisperCapAt(f) || poemAt(f) ? null : captionRect(f); if (c) z.push({ what: "the subtitle", r: c });
      const p = poemRect(f); if (p) z.push({ what: "his poem (in place of the subtitle)", r: p });
      return z;
    },
    // the night scene takes no intro card and no effect (its two closing fact cards are the sources' voice, the ending),
    // but for the two things Jay asked for on 15 Nov: 贺知章's quiet banner in the memory and the cup counter's return
    // at the last cup she shares with him
    quiet: quietSpans([seg("F").from, CARDS[CARDS.length - 2].from - 1], [HE_SPAN, LAST_CUP_SPAN]),
    budget: { perScene: 2, gap: 45 },
  });
};
