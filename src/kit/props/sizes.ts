// Sizes the kit's prop builders share with a film's layout (no imports, no side effects: a film's layout.ts may import
// this without pulling the builders in). A film that wants other sizes keeps its own layout values and builds its own
// variant; Hongmen's layout.ts spreads these into its TRAY and CARD.city.
/** the gift table (things.ts tray): w along x, d along z, top at h (m) */
export const TRAY = { w: 0.28, d: 0.44, h: 0.20 };
/** the red flag on its pole (things.ts flag): the pole's length and the cloth's w x h (m) */
export const FLAG = { pole: 1.15, flag: { w: 0.62, h: 0.4 } };
