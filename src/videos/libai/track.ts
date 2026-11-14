// track.ts: WHERE A FIGURE IS ON SCREEN this frame, for a HUD that follows it (the 高力士 banner moves with the camera).
// A segment writes it after its w.update() (film px of 1080 x 1800); the HUD reads it in the same render, for the same
// picture frame, and falls back to its own resting place when there is none (the overlay check runs without a world).
import * as THREE from "three";
export type Tracked = { f: number; x: number; y: number; top: number };
export const TRACK: Record<string, Tracked | undefined> = {};
export const tracked = (who: string, f: number): Tracked | null => { const t = TRACK[who]; return t && t.f === f ? t : null; };

/** writes where `rig`'s head is this frame (call after w.update()): its middle and a point `above` m over it */
export const trackHead = (w: { project: (p: THREE.Vector3) => { x: number; y: number } }, who: string, rig: { headWorld: () => THREE.Vector3 }, f: number, above = 0.34) => {
  const hd = rig.headWorld(), c = w.project(hd), tp = w.project(hd.clone().add(new THREE.Vector3(0, above, 0)));
  TRACK[who] = { f, x: c.x, y: c.y, top: tp.y };
};
