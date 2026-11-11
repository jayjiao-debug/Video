// 2D sheet (no 3D): every catalogue accessory that draws on the face, on a row of expressions. A quick look at how a
// pair of glasses or a moustache sits with each mouth and eye shape.
//   node scripts/rig3d/render.mjs src/videos/group/preview/rig3d_acc_faces.ts out.png
import { rigFaceCanvas, RIG_EXPRS } from "../kit/rig3d";
import { ACCESSORIES } from "../kit/rigacc/catalog";
import { YOU, classmate } from "../kit/cast";
import type { Expr, Look } from "../kit/toon";

const D = 240, PAD = 18, LAB = 200;
const want = ["neutral", "smile", "grin", "smug", "stern", "shock", "laugh", "pained", "huff"] as Expr[], ex = want.filter((e) => RIG_EXPRS.includes(e));
const rows = Object.entries(ACCESSORIES).filter(([, e]) => e.make().some((a) => a.face || a.faceUnder));
const looks: Look[] = [YOU, classmate(42), classmate(75)];
const cv = document.createElement("canvas");
cv.width = LAB + ex.length * (D + PAD) + PAD; cv.height = rows.length * (D + PAD) + PAD;
const g = cv.getContext("2d")!; g.fillStyle = "#faf9f6"; g.fillRect(0, 0, cv.width, cv.height);
rows.forEach(([name, e], r) => {
  const y = PAD + r * (D + PAD);
  g.fillStyle = "#333"; g.font = "600 20px sans-serif"; g.fillText(name, 10, y + D / 2);
  ex.forEach((x, c) => {
    const x0 = LAB + c * (D + PAD);
    g.beginPath(); g.ellipse(x0 + D / 2, y + D / 2, D / 2, (D / 2) * 0.93, 0, 0, 7); g.fillStyle = "#f4f2f8"; g.fill(); g.lineWidth = D * 0.034; g.strokeStyle = "#3a3742"; g.stroke();
    g.drawImage(rigFaceCanvas(looks[(r + c) % looks.length], x, { acc: e.make() }), x0, y, D, D);
  });
});
document.body.style.margin = "0"; document.body.appendChild(cv);
(window as any).__done = true;
