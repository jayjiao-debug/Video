// 2D sheet (no 3D) of the speaking mouths (RIG_MOUTHS): each one on several characters and under several expressions,
// with the expression's own mouth in the first column for comparison.
//   node scripts/rig3d/render.mjs src/videos/group/preview/rig3d_talk_sheet.ts out.png
import { rigFaceCanvas, RIG_MOUTHS, type RigMouth, type Acc } from "../kit/rig3d";
import type { Expr, Look } from "../kit/toon";
import { YOU, RESEARCHER, classmate } from "../kit/cast";
import { moustache } from "../kit/rigacc/moustache";
import { glasses } from "../kit/rigacc/glasses";

const rows: { L: Look; e: Expr; acc?: Acc[] }[] = [
  { L: YOU, e: "neutral" }, { L: YOU, e: "happy" }, { L: RESEARCHER, e: "stern" }, { L: classmate(42), e: "nervous" },
  { L: classmate(75), e: "smug", acc: [moustache({ kind: "handlebar" })] }, { L: classmate(34), e: "shock", acc: [glasses({ kind: "square" })] },
];
const D = 300, PAD = 26, cols: (RigMouth | undefined)[] = [undefined, ...RIG_MOUTHS];
const cv = document.createElement("canvas");
cv.width = cols.length * (D + PAD) + PAD; cv.height = rows.length * (D + PAD) + PAD;
const g = cv.getContext("2d")!; g.fillStyle = "#faf9f6"; g.fillRect(0, 0, cv.width, cv.height);
rows.forEach((r, j) => cols.forEach((m, i) => {
  const x = PAD + i * (D + PAD), y = PAD / 2 + j * (D + PAD);
  g.beginPath(); g.ellipse(x + D / 2, y + D / 2, D / 2, (D / 2) * 0.93, 0, 0, 7); g.fillStyle = "#f4f2f8"; g.fill();
  g.lineWidth = D * 0.034; g.strokeStyle = "#3a3742"; g.stroke();
  g.drawImage(rigFaceCanvas(r.L, r.e, { acc: r.acc, mouth: m }), x, y, D, D);
}));
document.body.style.margin = "0"; document.body.appendChild(cv);
(window as any).__done = true;
