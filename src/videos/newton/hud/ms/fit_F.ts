// hud/ms/fit_F.ts: SCENE F's FITS of skin A's items (hud/ms/fit.ts says what a fit may set). Owned by the scene F
// builder (with shots/segF.ts and shots/segF_parts.ts); hud/ms/when.ts lays it over the items at import.
// Scene F's items: none. THE v5 REBUILD (15 Nov), refitted to the one take (shots/segF.ts): still empty, on purpose.
//   - F01..F06 (f3052-3606) carry no skin item in the effects plan: the only overlay there is card 3 (F02, f3189-3299,
//     the fact card's own layer, not skin A), laid over the snap down to his drafts on the bench (PAGES), which keeps
//     the card's box (x 54-676, y 758-1161) on the bench top under the pages.
//   - From F07 (f3607, the turn) to G02 the film is in its quiet span (when.ts quiet 3607-5018): no effect, no card.
//   - The whip in (⑧, f3020-3025), the match (⑨, f3052) and the clock race (⑩, f4581-4602, no cut) are joins, not items.
// Empty = the effects build's boxes as they stand (check.sh: 0 findings, 0 faults on 15 Nov).
import type { MsFit } from "./fit";

export const FIT_F: MsFit = {};
