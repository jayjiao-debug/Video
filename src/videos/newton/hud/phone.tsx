// hud/phone.tsx: THE PHONE MASK for review cuts (bible, "The phone-safe frame": "A phone view check draws this mask over
// every review cut"). Jay's measure on his phone, 14 Nov (layout.ts PHONE): what 抖音 lays over a 9:15 (1080 x 1800)
// film. Drawn by Film.tsx on top of EVERYTHING (the end black too) only when the input prop `mask` is true; never in
// the film itself. The look follows douyin_crop_map_v1.jpg: red hatching = may be trimmed (picture only), blue = under
// the app, green dashes = where words and effects may go.
//   the margins     x 0..54 and 1026..1080, the whole height: picture only (a screen of another shape may trim them)
//   the icons       the back and search icons: the top corners down to y 60
//   the buttons     the button column: x > 940 from y 950 down
//   the post text   the post's own text: the left side from y 1510 down (to x 900)
//   the safe line   words and effects: x 54..1026 from y 60, x 54..930 below y 950; subtitles end above y 1490
// Render it:  bash scripts/kit/queue/remotion_still.sh NewtonFilm <frame> <out.png> --props='{"mask":true}'
// (remotion_still.sh hands any extra flag to `remotion still`; Film.tsx reads the prop from the component's props or
// from the input props, so `--props` works for stills and renders alike).
import React from "react";
import { AbsoluteFill } from "remotion";
import { PHONE } from "../layout";
import { FONT_STACK } from "./style";

const RED = "rgba(232,64,64,0.55)", BLUE = "rgba(70,130,235,0.36)", BLUE_LINE = "rgba(150,190,255,0.9)", GREEN = "rgba(110,230,120,0.95)";
const hatch = `repeating-linear-gradient(135deg, ${RED} 0 9px, rgba(232,64,64,0.12) 9px 18px)`;
const label = (text: string, x: number, y: number, color: string, anchor: "left" | "right" = "left"): React.ReactNode => (
  <div key={text} style={{ position: "absolute", top: y, ...(anchor === "left" ? { left: x } : { right: PHONE.W - x }), padding: "3px 9px", borderRadius: 6, background: "rgba(14,16,26,0.72)", color, fontFamily: FONT_STACK, fontWeight: 700, fontSize: 22, lineHeight: 1.1, whiteSpace: "nowrap" }}>{text}</div>
);

/** the phone's covered areas as translucent overlays (1080 x 1800) */
export const PhoneMask: React.FC = () => {
  const { W, H, margin: m, icons, buttons, post, words } = PHONE;
  const box = (key: string, x0: number, y0: number, x1: number, y1: number, r = 0): React.ReactNode => (
    <div key={key} style={{ position: "absolute", left: x0, top: y0, width: x1 - x0, height: y1 - y0, background: BLUE, border: `2px solid ${BLUE_LINE}`, borderRadius: r, boxSizing: "border-box" }} />
  );
  // the green safe outline: x 54..1026 from y 60 down to 950, then x 54..930 down to 1490
  const safe = `M${m},${words.top} H${words.x1} V${words.yLow} H${words.x1Low} V${words.capBottom} H${m} Z`;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {/* the margins: picture only */}
      <div style={{ position: "absolute", left: 0, top: 0, width: m, height: H, background: hatch }} />
      <div style={{ position: "absolute", left: W - m, top: 0, width: m, height: H, background: hatch }} />
      {/* the app's things */}
      {box("iconL", 0, 0, icons.w, icons.y1, 10)}
      {box("iconR", W - icons.w, 0, W, icons.y1, 10)}
      {box("buttons", buttons.x0, buttons.y0, W, H, 18)}
      {box("post", 0, post.y0, post.x1, H, 18)}
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", left: 0, top: 0 }}>
        <path d={safe} fill="none" stroke={GREEN} strokeWidth={3} strokeDasharray="16 10" />
        <line x1={m} x2={words.x1Low} y1={words.bottom} y2={words.bottom} stroke={BLUE_LINE} strokeWidth={2} strokeDasharray="6 8" />
      </svg>
      {/* the key: inside the post text's box (nothing of the film's may sit there anyway) */}
      {label("icons: top corners to y 60", icons.w + 8, 14, BLUE_LINE)}
      {label("blue: under the app (post text from y 1510, buttons x > 940 from y 950)", m + 14, post.y0 + 16, BLUE_LINE)}
      {label("green: words and effects (x 54-930 below y 950, subtitles end by 1490)", m + 14, post.y0 + 56, GREEN)}
      {label("red: 54 px each side, picture only", m + 14, post.y0 + 96, "rgba(255,160,160,0.98)")}
    </AbsoluteFill>
  );
};
