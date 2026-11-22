// preview/hud_sheet.tsx: THE SKIN'S PROOF SHEET of 采访罗密欧与朱丽叶的一天 (hud/, 「信」 the letter): any of the film's
// on-screen graphics at any moment, over a plain mid-tone ground at phone proportions, one cell each. A still tool,
// never the film. It runs in the three.js still harness (no Remotion composition needed): the page draws the React
// pieces as DOM / SVG over an empty canvas, and the harness's screenshot of that canvas takes them with it.
//   bash scripts/kit/queue/still.sh src/videos/romeo/preview/hud_sheet.tsx <abs out.png> --size <W>x<H> --opts '<json>'
// Options (always pass "font" and w / h matching --size):
//   cells   [[panel, t, label?, [x0, y0]?], ...]  the cells, row by row; panel = a PANELS key, t = the piece's local
//           frame; [x0, y0] = this cell's own crop origin (the crop's size stays the same for every cell)
//   cols    cells per row (default: all in one row);  scale  film px to page px (default 0.5)
//   crop    [x0, y0, x1, y1] the part of the 1080 x 1920 frame each cell shows (default: all of it)
//   gap     px between cells (default 12);  labels  false = no label row;  guides  true = REC row, face, caption band
//   bg      the ground's colour for every cell (default: each panel's own mid-tone)
// The page size it needs: cols * (cropW * scale) + (cols + 1) * gap wide; rows * (cropH * scale + 30) + gap tall + 30.
import React from "react";
// @ts-ignore the repo carries no type declarations for react-dom/server
import { renderToStaticMarkup } from "react-dom/server";
import { PANELS, GROUNDS } from "./hud_panels";

const hash = typeof location !== "undefined" ? decodeURIComponent(location.hash.slice(1)) : "";
const O: Record<string, any> = hash ? JSON.parse(hash) : {};
const W: number = O.w ?? 1080, H: number = O.h ?? 1920, SC: number = O.scale ?? 0.5, GAP: number = O.gap ?? 12;
const CROP: [number, number, number, number] = O.crop ?? [0, 0, 1080, 1920];
const LABELS = O.labels !== false, LH = LABELS ? 30 : 0;
const CELLS: [string, number, string?, [number, number]?][] = O.cells ?? [["proof", 0]];
const COLS: number = O.cols ?? CELLS.length;
const TITLE: string | undefined = O.title, TH = TITLE ? 64 : 0;

/** what the phone and the film already put on the frame (guides only): the REC row, a face, the caption band */
const Guides: React.FC = () => (
  <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", left: 0, top: 0 }}>
    <g fill="none" stroke="#fff" strokeOpacity={0.35} strokeWidth={3} strokeDasharray="14 12">
      <rect x={110} y={225} width={860} height={105} rx={10} />
      <rect x={110} y={1270} width={780} height={190} rx={10} />
      <path d="M110,340 L970,340 L970,1000 L890,1000 L890,1490 L110,1490 Z" strokeOpacity={0.2} />
    </g>
    <g fontFamily="FrSans, sans-serif" fontWeight={700} fontSize={30} fill="#fff" fillOpacity={0.5}>
      <circle cx={128} cy={250} r={12} fill="#e8402c" fillOpacity={0.8} /><text x={152} y={261}>REC</text>
      <text x={500} y={1376} textAnchor="middle">字幕</text>
    </g>
  </svg>
);

const Cell: React.FC<{ i: number; panel: string; t: number; label?: string; at?: [number, number] }> = ({ i, panel, t, label, at }) => {
  const P = PANELS[panel];
  if (!P) throw new Error(`hud_sheet: no panel called ${panel} (${Object.keys(PANELS).join(", ")})`);
  const cw = (CROP[2] - CROP[0]) * SC, ch = (CROP[3] - CROP[1]) * SC, col = i % COLS, row = Math.floor(i / COLS);
  const left = GAP + col * (cw + GAP), top = TH + GAP + row * (ch + LH + GAP);
  return (
    <div style={{ position: "absolute", left, top, width: cw, height: ch + LH }}>
      {LABELS ? <div style={{ height: LH, lineHeight: `${LH - 4}px`, font: "700 17px FrSans, sans-serif", color: "#d8cfc0", whiteSpace: "nowrap", overflow: "hidden" }}>{label ?? `${P.label ?? panel} · t${t}`}</div> : null}
      <div style={{ position: "absolute", left: 0, top: LH, width: cw, height: ch, overflow: "hidden", background: O.bg ?? GROUNDS[P.ground ?? "stone"], borderRadius: 4 }}>
        <div style={{ position: "absolute", left: -(at ?? CROP)[0] * SC, top: -(at ?? CROP)[1] * SC, width: 1080, height: 1920, transform: `scale(${SC})`, transformOrigin: "0 0" }}>
          {P.back ? P.back(t) : null}
          {O.guides || P.guides ? <Guides /> : null}
          {P.node(t, `rj${i}`)}
        </div>
      </div>
    </div>
  );
};

const draw = (stage: HTMLElement) => {
  stage.innerHTML = renderToStaticMarkup(
    <>
      {TITLE ? <div style={{ position: "absolute", left: GAP, top: 14, font: "700 30px FrSans, sans-serif", color: "#f1e2bd", whiteSpace: "nowrap" }}>{TITLE}</div> : null}
      {CELLS.map(([panel, t, label, at], i) => <Cell key={i} i={i} panel={panel} t={t} label={label} at={at} />)}
    </>,
  );
};

(async () => {
  try {
    const ff = new FontFace("FrSans", `url(file://${O.font ?? "/home/user/jayjiao-debug/video/public/bt/sans700.ttf"})`, { weight: "700" });
    await ff.load(); (document.fonts as any).add(ff);
    document.body.style.cssText = "margin:0;background:#211d1b;overflow:hidden";
    const cv = document.createElement("canvas");
    cv.width = W; cv.height = H; cv.style.cssText = `position:absolute;left:0;top:0;width:${W}px;height:${H}px`;
    const stage = document.createElement("div");
    stage.style.cssText = `position:absolute;left:0;top:0;width:${W}px;height:${H}px;overflow:hidden`;
    document.body.append(cv, stage);
    draw(stage);
    await (document.fonts as any).ready;
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    (window as any).__frame = () => undefined;
    (window as any).__ready = true; (window as any).__done = true;
  } catch (e) {
    console.error("hud_sheet: " + (e as Error).message);
    (window as any).__failed = true;
  }
})();
