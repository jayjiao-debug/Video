// overlay/index.ts: one import for the building blocks (shared kit; src/kit/overlay/README.md).
//   import { life, pop, slap, setRow, glyph, bandPath, roughFilter, slots, fit, clock, defineSkin } from "../../kit/overlay";
// A check that runs in plain Node (a film's smoke test) can import "../../kit/overlay/frame" or ".../freeze" alone.
export * from "./time";
export * from "./freeze";
export * from "./frame";
export * from "./skin";
export * from "./text";
export * from "./marks";
