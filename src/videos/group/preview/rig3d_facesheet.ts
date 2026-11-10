// 2D sheet of the rig's face drawings (no 3D): every expression, old (toon.ts faceFront) beside new (rig3d drawFace).
import { rigFaceCanvas, RIG_EXPRS } from "../kit/rig3d";
import { faceFront, Pen, type Look } from "../kit/toon";
import { YOU, RESEARCHER, classmate } from "../kit/cast";

const q = new URLSearchParams(location.hash.slice(1));
const mode = (window as any).__sheetMode ?? "pairs";
const looks: Look[] = [YOU, RESEARCHER, classmate(42), classmate(75), classmate(34), classmate(48)];
const D = 300, PAD = 26, LAB = 34;
const head = (g: CanvasRenderingContext2D, x: number, y: number, d: number) => {
  g.beginPath(); g.ellipse(x + d / 2, y + d / 2, d / 2, d / 2 * 0.93, 0, 0, 7); g.fillStyle = "#f4f2f8"; g.fill();
  g.lineWidth = d * 0.034; g.strokeStyle = "#3a3742"; g.stroke();
};
const oldFace = (L: Look, expr: any, lid = 0) => {
  const c = document.createElement("canvas"); c.width = c.height = 1024;
  const p = new Pen(c.getContext("2d")!);
  faceFront(p, 512, 512 + 0.02 * 1024, 1024, expr, 0, 0, lid, false, L.skin);
  return c;
};
const cv = document.createElement("canvas");
const E = RIG_EXPRS;
if (mode === "pairs") {
  const cols = 4, rows = Math.ceil(E.length / cols), cw = 2 * D + PAD * 3, ch = D + LAB + PAD;
  cv.width = cols * cw; cv.height = rows * ch + 10;
  const g = cv.getContext("2d")!; g.fillStyle = "#faf9f6"; g.fillRect(0, 0, cv.width, cv.height);
  E.forEach((e, i) => {
    const x = (i % cols) * cw + PAD, y = Math.floor(i / cols) * ch + PAD / 2;
    head(g, x, y, D); g.drawImage(oldFace(YOU, e), x, y, D, D);
    head(g, x + D + PAD, y, D); g.drawImage(rigFaceCanvas(YOU, e), x + D + PAD, y, D, D);
    g.fillStyle = "#333"; g.font = "600 24px sans-serif"; g.fillText(e, x + 4, y + D + 26);
  });
} else {
  // characters: the same five expressions on six looks, plus the blink steps and the gaze steps
  const ex = ["neutral", "smile", "grin", "shock", "smug", "stern"] as any[], cols = ex.length + 5, cw = D + PAD, ch = D + PAD;
  cv.width = cols * cw + PAD; cv.height = looks.length * ch + PAD;
  const g = cv.getContext("2d")!; g.fillStyle = "#faf9f6"; g.fillRect(0, 0, cv.width, cv.height);
  looks.forEach((L, r) => {
    ex.forEach((e, c) => { const x = PAD + c * cw, y = PAD / 2 + r * ch; head(g, x, y, D); g.drawImage(rigFaceCanvas(L, e), x, y, D, D); });
    [[0.5, 0], [1, 0]].forEach(([lid], k) => { const x = PAD + (ex.length + k) * cw, y = PAD / 2 + r * ch; head(g, x, y, D); g.drawImage(rigFaceCanvas(L, r % 2 ? "smile" : "neutral", { lid }), x, y, D, D); });
    [-1, 1].forEach((gz, k) => { const x = PAD + (ex.length + 2 + k) * cw, y = PAD / 2 + r * ch; head(g, x, y, D); g.drawImage(rigFaceCanvas(L, r % 2 ? "shock" : "neutral", { gaze: gz }), x, y, D, D); });
    { const x = PAD + (ex.length + 4) * cw, y = PAD / 2 + r * ch; head(g, x, y, D); g.drawImage(rigFaceCanvas(L, "smile", { brim: true }), x, y, D, D); }
  });
}
document.body.style.margin = "0"; document.body.appendChild(cv);
void q;
(window as any).__done = true;
