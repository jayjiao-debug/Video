// overlay_check.ts: the film's overlays through the shared check (src/kit/overlay checkOverlays): the phone-safe frame,
// the REC display, the app's buttons, the subtitles and the whisper bubble, each other, the quiet night scene and the
// effects' budget. Faces are checked by eye on stills (the check has no world). Run: node scripts/libai/overlay_check.mjs
import { checkOverlays, FRAME_9x15, type Shown } from "../../kit/overlay/frame";
import { TITLE_SPAN, GAO_BANNER } from "./beats";
import { seg, CARDS } from "./story";
import { TITLE_RECT } from "./hud/title";
import { gaoBannerRect } from "./hud/intro";
import { fxShown } from "./hud/fx";
import { factRect } from "./hud/card";
import { captionRect } from "./hud/caption";
import { whisperRectAt, whisperCapAt } from "./hud/whisper";
import { poemAt, poemRect } from "./hud/poem";

export const runCheck = () => {
  const items: Shown[] = [
    { what: "title", kind: "title", from: TITLE_SPAN[0], to: TITLE_SPAN[1], rect: () => TITLE_RECT },
    { what: "高力士 banner", kind: "card", from: GAO_BANNER[0], to: GAO_BANNER[1], rect: gaoBannerRect, scene: "C" },
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
    // the night scene takes no intro card and no effect (its two closing fact cards are the sources' voice, the ending)
    quiet: [[seg("F").from, CARDS[CARDS.length - 2].from - 1]],
    budget: { perScene: 2, gap: 45 },
  });
};
