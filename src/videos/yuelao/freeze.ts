// THE FREEZE of 月老's lead card (the picture's half): on the card's frames the world is posed at CARD.from (the picture
// stops), he is cut out by the kit's IsolatePass and lifted up into a full moon that rises behind him (a prop that is
// kept in colour with him), and everything else drops to a red-gold wash from the film's skin.
import * as THREE from "three";
import type { IsolateState } from "../../kit/fx/isolate";
import { line, FPS, W, type Pose } from "./story";
import type { World } from "./world";
import { YUELAO } from "./people";

/** the card's frames: it starts just after 「一动，三对离婚。」 and holds for 2.9 s inside that line's gap */
export const CARD = (() => { const from = line("A02").to + 5; return { from, to: from + Math.round(2.9 * FPS) }; })();
export const cardAt = (f: number) => f >= CARD.from && f <= CARD.to;
/** the frame the world is posed at */
export const hold = (f: number) => (cardAt(f) ? CARD.from : f);
const smooth = (x: number) => { const t = Math.max(0, Math.min(1, x)); return t * t * (3 - 2 * t); };
/** how far the cut-out is in: up over 7 frames, down over the last 6 */
export const cardK = (f: number) => (cardAt(f) ? Math.min(smooth((f - CARD.from + 1) / 7), 1 - smooth((f - (CARD.to - 6)) / 6)) : 0);
/** where his portrait's head ends up, and the moon behind it (film px) */
export const PORTRAIT = { x: 540, y: 560, s: 0.62, moonR: 300 } as const;

let lead: { hx: number; hy: number } | null = null;
/** after the pose (the real frame f): raise the moon behind him and note where his head is on screen */
export const afterPose = (w: World, f: number, P: Pose): Pose => {
  if (!cardAt(f)) { lead = null; return P; }
  const r = w.actor(YUELAO), head = r.headWorld(), cam = w.camera.position, k = cardK(f);
  const dir = head.clone().sub(cam).normalize(), at = head.clone().addScaledVector(dir, 0.55).add(new THREE.Vector3(0, -0.02, 0));
  const pop = k < 1 && f < CARD.from + 10 ? 0.4 + 0.6 * k + 0.12 * Math.sin(k * Math.PI) : 1;
  w.prop("moon").put(at, { yaw: Math.atan2(cam.x - at.x, cam.z - at.z), scale: 0.78 * pop * (1 + 0.012 * Math.sin((f - CARD.from) * 0.2)), roll: (f - CARD.from) * 0.004 });
  const p = w.project(head); lead = { hx: p.x, hy: p.y };
  return P;
};
/** the cut-out's state for film frame f */
export const iso = (w: World, f: number): IsolateState | null => {
  if (!cardAt(f) || !lead) return null;
  const k = cardK(f), s = 1 + (PORTRAIT.s - 1) * k;
  return {
    k, keep: [w.actor(YUELAO).group, w.prop("moon").group],
    wash: { dark: "#4a0f0c", light: "#f6cf8e", amount: 0.92, dim: 0.62 },
    outline: { color: "#f8efd8", width: 12 },
    shadow: { x: 8, y: 11, alpha: 0.5 },
    lift: { s, x: (PORTRAIT.x - lead.hx) * k, y: (PORTRAIT.y - lead.hy) * k, cx: lead.hx, cy: lead.hy, rot: -2 * k },
    left: { color: "#4a0f0c", alpha: 0.55 },
  };
};
void W;
