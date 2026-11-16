// hud/skin.ts: THE SKIN of the Li Bai film (src/kit/overlay/README.md "The order of work"). The themed title, the intro
// cards and every 综艺 effect are drawn in it, so the 后期 looks like one hand.
//
// Where it comes from: the day starts in a tavern, and a tavern in Tang 长安 hangs out a 酒旗 (酒望子), a strip of
// unbleached cloth with a toothed hem on a pole. That cloth is the material. Names go on it in wild drunk cursive (the
// repo's one face, set by hand with a big tipsy turn and lift and a rough brush edge). The colours are his: the amber
// of wine (his own line, 玉碗盛来琥珀光), the sky blue of his robe's band, a night-indigo ink (the moon is the film's
// thread) and the cloth. The stamp is not a seal but the ring a wine cup leaves when it is set down.
// The way it moves: like a man who has had a few. Things swing in and wobble to rest a little late (a slow, damped
// sway round where they hang), with one hiccup hop; they leave by tipping over sideways.
import { defineSkin, clamp01, easeOut, hash01 } from "../../../kit/overlay";

export const SKIN = defineSkin({
  film: "libai",
  from: "李白's tavern wine flag of unbleached cloth with a sky-blue toothed hem, his name in wild drunk cursive, amber wine, night-indigo ink for the moon, a wine-cup ring for a seal",
  colour: { lead: "#f2a63a", accent: "#3f92d8", ink: "#1b2148", paper: "#f3e5c3" },
  display: { ink: 0.11, track: 0.0, tilt: -3, hand: { rot: 9, lift: 18, scale: 0.12 }, rough: { fx: 0.045, fy: 0.085, scale: 7, seed: 13 } },
  body: { ink: 0.15, track: 0.06, tilt: 0, hand: { rot: 2.5, lift: 3, scale: 0.03 }, rough: { fx: 0.04, fy: 0.04, scale: 2.2, seed: 5 } },
  material: "an unbleached cloth wine flag with a sky-blue toothed hem, amber wine stains, a wine-cup ring for a stamp",
  motion: { arrive: 9, over: 1.9, leave: 8, hit: "it swings in like a drunk's step and wobbles to rest late, one hiccup hop, the cup ring is set down; it leaves by tipping over" },
});
export const C = SKIN.colour;
/** the cloth's darker fold and its stain; the deep amber under the lead colour; the ink's shadow */
export const TONE = { clothLow: "#e3cfa2", clothFold: "#d6bd8a", stain: "#c98a2e", amberDeep: "#b86a14", amberTop: "#ffd98a", shadow: "rgba(12,14,34,0.42)", skyDeep: "#2a6fb0" };

// ---------------------------------------------------------------------------------------------------- the tipsy motion
/** THE SWAY: an angle (deg) that swings in from `from` deg at frame `at` and wobbles to rest at 0, damped and a little
 *  slow (a drunk's balance). t = frames into the overlay's life. */
export const sway = (t: number, at: number, from = 34, period = 22, damp = 13) => {
  const d = t - at;
  if (d < 0) return from;
  return from * Math.exp(-d / damp) * Math.cos((2 * Math.PI * d) / period);
};
/** THE HICCUP: a quick hop up (px, negative = up) at frame `at`, 6 frames long */
export const hiccup = (t: number, at: number, amp = 14) => {
  const d = t - at;
  return d < 0 || d > 6 ? 0 : -amp * Math.sin((Math.PI * d) / 6) * (d < 3 ? 1 : 0.8);
};
/** THE TIP OVER (the leave): 0..1 over the last `n` frames, eased in */
export const tipOver = (leave: number) => { const k = clamp01(leave); return k * k; };
/** a slow idle bob while it hangs (px), the same on every render */
export const idle = (t: number, seed = 0, amp = 3) => amp * Math.sin((t + 40 * hash01(seed, 3)) / 14);
/** the reveal 0..1 of a part that starts `at` frames in and takes n frames (eased out) */
export const inK = (t: number, at: number, n: number) => easeOut(clamp01((t - at + 1) / Math.max(1, n)));
