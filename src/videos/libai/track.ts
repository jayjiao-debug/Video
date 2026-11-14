// track.ts: WHERE A FIGURE IS ON SCREEN this frame, for a HUD that follows it (the 高力士 banner moves with the camera).
// A segment writes it after its w.update() (film px of 1080 x 1800); the HUD reads it in the same render, for the same
// picture frame, and falls back to its own resting place when there is none (the overlay check runs without a world).
export type Tracked = { f: number; x: number; y: number; top: number };
export const TRACK: Record<string, Tracked | undefined> = {};
export const tracked = (who: string, f: number): Tracked | null => { const t = TRACK[who]; return t && t.f === f ? t : null; };
