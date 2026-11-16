// hud/phone.tsx: THE PHONE MASK for review cuts (bible, "The phone-safe frame": "A phone view check draws this mask over
// every review cut"). What 抖音 lays over a 9:16 (1080 x 1920) film: the kit's FRAME_9x16 app zones (measured on one
// phone, 14 Nov) with the film's one override (style.ts FRAME: the REC display x 110-970, y 225-330, words from y 340).
// Drawn by Film.tsx on top of EVERYTHING (the end black too) only when the input prop `mask` is true; never in the film
// itself. The look follows douyin_crop_map_v1.jpg: red hatching = cut off by the app (nothing there is seen), blue =
// under the app, green dashes = where words, cards and effects may go, amber = the REC display, white dashes = the
// caption band.
//   the cut sides   x 0..58 and 1024..1080, the whole height: the app fills the screen and cuts them off
//   the icons       the back icon x 58-150 and the search icon x 920-1024, y 143-222
//   the buttons     the button column: x >= 890 from y 1000 down (to 1900)
//   the post text   the post's own text: x 58-805 from y 1505 down (to 1790)
//   the safe line   words, cards and effects: x 110..970 from y 340 down to 1000, x 110..890 below it, down to 1490
//   the REC display x 110-970, y 225-330 (the REC row on y 250, the timestamp row on y 308, the battery to x 970)
//   the captions    the band x 110-890, y 1270-1460
// Faces and anything that matters: inside x 58-1024 and above y 1490, clear of the REC row, the battery, the captions.
// Every number comes from FRAME, so a new measure of the app (in the kit) or of the film's override shows here.
// Render it:  bash scripts/kit/queue/remotion_still.sh NewtonFilm <frame> <out.png> --props='{"mask":true}'
// (remotion_still.sh hands any extra flag to `remotion still`; Film.tsx reads the prop from the component's props or
// from the input props, so `--props` works for stills and renders alike).
import React from "react";
import { AbsoluteFill } from "remotion";
import { FONT_STACK, FRAME, SAFE } from "./style";

const RED = "rgba(232,64,64,0.55)", BLUE = "rgba(70,130,235,0.36)", BLUE_LINE = "rgba(150,190,255,0.9)", GREEN = "rgba(110,230,120,0.95)";
const AMBER = "rgba(255,190,70,0.95)", WHITE = "rgba(255,255,255,0.85)";
const hatch = `repeating-linear-gradient(135deg, ${RED} 0 9px, rgba(232,64,64,0.12) 9px 18px)`;
const label = (text: string, x: number, y: number, color: string): React.ReactNode => (
  <div key={text} style={{ position: "absolute", top: y, left: x, padding: "3px 9px", borderRadius: 6, background: "rgba(14,16,26,0.72)", color, fontFamily: FONT_STACK, fontWeight: 700, fontSize: 22, lineHeight: 1.1, whiteSpace: "nowrap" }}>{text}</div>
);
/** a zone the app cuts off (a tall strip at a side) rather than draws over */
const isCut = (what: string) => /cuts off/.test(what);

/** the phone's covered areas as translucent overlays (1080 x 1920) */
export const PhoneMask: React.FC = () => {
  const { W, H, rec, caption: cap } = FRAME;
  const post = FRAME.app.find((z) => /post/.test(z.what))?.r ?? { x0: 58, y0: 1505, x1: 805, y1: 1790 };
  const box = (key: string, r: { x0: number; y0: number; x1: number; y1: number }, rad = 0): React.ReactNode => (
    <div key={key} style={{ position: "absolute", left: r.x0, top: r.y0, width: r.x1 - r.x0, height: r.y1 - r.y0, background: BLUE, border: `2px solid ${BLUE_LINE}`, borderRadius: rad, boxSizing: "border-box" }} />
  );
  // the green safe outline: x 110..970 from y 340 down to 1000, then x 110..890 down to 1490
  const safe = `M${SAFE.left},${SAFE.top} H${SAFE.rightHigh} V${SAFE.railY} H${SAFE.right} V${SAFE.bottom} H${SAFE.left} Z`;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {/* what the app cuts off (red hatching) and what it draws over (blue) */}
      {FRAME.app.map((z, i) => isCut(z.what)
        ? <div key={`cut${i}`} style={{ position: "absolute", left: z.r.x0, top: z.r.y0, width: z.r.x1 - z.r.x0, height: z.r.y1 - z.r.y0, background: hatch }} />
        : box(`app${i}`, z.r, z.r.y1 - z.r.y0 > 200 ? 18 : 10))}
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", left: 0, top: 0 }}>
        <path d={safe} fill="none" stroke={GREEN} strokeWidth={3} strokeDasharray="16 10" />
        <rect x={rec.x0} y={rec.y0} width={rec.x1 - rec.x0} height={rec.y1 - rec.y0} fill="none" stroke={AMBER} strokeWidth={2.5} strokeDasharray="10 7" rx={6} />
        <line x1={rec.x0} x2={rec.x0 + 40} y1={FRAME.recY} y2={FRAME.recY} stroke={AMBER} strokeWidth={2} />
        <line x1={rec.x0} x2={rec.x0 + 40} y1={FRAME.labelY} y2={FRAME.labelY} stroke={AMBER} strokeWidth={2} />
        <rect x={cap.x0} y={cap.y0} width={cap.x1 - cap.x0} height={cap.y1 - cap.y0} fill="none" stroke={WHITE} strokeWidth={2} strokeDasharray="6 8" />
      </svg>
      {/* the key: inside the post text's box (nothing of the film's may sit there anyway) */}
      {label(`red: cut off by the app (x < ${FRAME.app[0]?.r.x1 ?? 58}, x > ${FRAME.app[1]?.r.x0 ?? 1024})`, post.x0 + 12, post.y0 + 14, "rgba(255,160,160,0.98)")}
      {label(`blue: under the app (buttons x >= ${SAFE.right} from y ${SAFE.railY}, post text from y ${post.y0})`, post.x0 + 12, post.y0 + 52, BLUE_LINE)}
      {label(`green: words, cards, effects (x ${SAFE.left}-${SAFE.rightHigh} above y ${SAFE.railY}, ${SAFE.left}-${SAFE.right} below, y ${SAFE.top}-${SAFE.bottom})`, post.x0 + 12, post.y0 + 90, GREEN)}
      {label(`amber: REC display x ${rec.x0}-${rec.x1}, y ${rec.y0}-${rec.y1} (rows y ${FRAME.recY} / ${FRAME.labelY})`, post.x0 + 12, post.y0 + 128, AMBER)}
      {label(`white: caption band x ${cap.x0}-${cap.x1}, y ${cap.y0}-${cap.y1}`, post.x0 + 12, post.y0 + 166, WHITE)}
    </AbsoluteFill>
  );
};
