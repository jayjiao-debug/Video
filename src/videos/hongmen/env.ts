// The film's input props, read ONCE and guarded. Remotion's getInputProps() throws outside Remotion ("window.
// remotion_inputProps is not set"), which killed every preview entry of the Arthur film at import time. Nothing in
// the hongmen folder calls getInputProps() itself: import IP from here.
//   npx remotion still ... --props='{"lang":"en","nocap":true}'
// Props the engine understands (all optional):
//   lang: "en"        the English version (lang.ts)
//   nocap: true       no captions;  nohud: true = no HUD layer;  noov: true = no shot overlays (P.overlays / P.top)
//   cover: true       = nocap + nohud + noov (a clean still for the covers)
//   zoom, sx, sy      cover framing (world.ts): zoom < 1 shows more around the same frame; sx / sy move the picture
//                     right / down by that fraction of the frame;  ov = the size of screen-px icons (1 = the film)
//   nopost: true      the raw render (no AO, ink, blur, bloom, grade)
//   slate: true       the animatic's label, top left: frame, segment, line, the shot's own Pose.slate
//   hudtest: true     a self-test of the HUD hook (a plain source tag from line 3 on)
//   kick: n           extra advances per frame;  dbg: true = timing logs
//   ovonly: true      only the DOM layers (HUD, overlays, caption, top) on a TRANSPARENT page: the world is posed every
//                     frame (tags follow heads), nothing is drawn in 3D. The cut's overlay pass (scripts/hongmen/cut)
import { getInputProps } from "remotion";

export const IP: Record<string, unknown> = (() => {
  try { return (getInputProps() ?? {}) as Record<string, unknown>; } catch { return {}; }
})();
/** a numeric input prop with a default (NaN / missing / 0 where 0 makes no sense -> the default) */
export const ipNum = (k: string, d: number, zeroOk = true) => { const v = Number(IP[k] ?? d); return Number.isFinite(v) && (zeroOk || v !== 0) ? v : d; };
/** a boolean input prop */
export const ipFlag = (k: string) => IP[k] === true || IP[k] === "true" || IP[k] === 1;
