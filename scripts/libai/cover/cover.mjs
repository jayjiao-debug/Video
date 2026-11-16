// scripts/libai/cover/cover.mjs: the Douyin covers of 采访李白的一天 (Jay, 15 Nov: "fun and creative", the title 采访李白的一天
// as the only headline). The picture is his face right up against her lens (A02, he takes the camera for the moon),
// rendered clean AT THE COVER'S OWN SHAPE through the queue; this script only draws the title and the joke on top, in
// the film's own skin (hud/skin.ts): the tavern's wine flag with the sky-blue toothed hem, 李白 in tipsy amber, the cup
// ring, and one bubble with his own line 哟，月亮？. Pictures stay out of the repo.
//   NODE_PATH=/opt/node22/lib/node_modules node scripts/libai/cover/cover.mjs --layout tall|wide --bg <still.png> --out <cover.png> [--front <mask.png>] [--guides]
//   tall = 1080 x 1440 (竖版 3:4), wide = 1440 x 1080 (横版 4:3). --front: a transparent PNG of the picture's parts that
//   stand IN FRONT of the flag (his top-knot), made by front.py. --guides draws the 6 % edge and the lower 18 % zone.
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const { chromium } = createRequire(import.meta.url)("playwright");   // found through NODE_PATH (the machine's own Playwright)
const arg = (k, d) => { const i = process.argv.indexOf("--" + k); return i < 0 ? d : (process.argv[i + 1]?.startsWith("--") || process.argv[i + 1] === undefined ? true : process.argv[i + 1]); };
const layout = arg("layout", "tall"), bg = arg("bg"), out = arg("out"), front = arg("front", ""), guides = !!arg("guides", false);
if (!bg || !out) { console.error("usage: cover.mjs --layout tall|wide --bg still.png --out cover.png [--front mask.png] [--guides]"); process.exit(2); }
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const FONT = path.join(REPO, "public/bt/sans700.ttf");
const [W, H] = layout === "wide" ? [1440, 1080] : [1080, 1440];
const C = { lead: "#f2a63a", accent: "#3f92d8", ink: "#1b2148", paper: "#f3e5c3", clothLow: "#e3cfa2", clothFold: "#d6bd8a", stain: "#c98a2e", amberDeep: "#b86a14", amberTop: "#ffd98a", skyDeep: "#2a6fb0" };
const data = (f) => `data:${f.endsWith(".ttf") ? "font/ttf" : "image/png"};base64,${fs.readFileSync(f).toString("base64")}`;

// ------------------------------------------------------------------------------------------------- the pieces (SVG)
/** a character set by hand: centre x, y; size; fill; ink (outline) width; turn (deg) */
const ch = (c, x, y, size, fill, ink, rot = 0, extra = "") =>
  `<text x="${x}" y="${y}" font-size="${size}" text-anchor="middle" dominant-baseline="central" fill="${fill}" stroke="${C.ink}" stroke-width="${ink}" stroke-linejoin="round" paint-order="stroke" transform="rotate(${rot} ${x} ${y})" ${extra}>${c}</text>`;
/** the toothed hem round three sides of a cloth x0..x1, y0..y1 */
const hem = (x0, y0, x1, y1, t, nv, nh) => {
  const p = [`M${x0},${y0}`];
  for (let i = 0; i < nv; i++) { const a = y0 + ((y1 - y0) * i) / nv, b = y0 + ((y1 - y0) * (i + 1)) / nv; p.push(`L${x0 - t * 0.7},${(a + b) / 2}`, `L${x0},${b}`); }
  for (let i = 0; i < nh; i++) { const a = x0 + ((x1 - x0) * i) / nh, b = x0 + ((x1 - x0) * (i + 1)) / nh; p.push(`L${(a + b) / 2},${y1 + t}`, `L${b},${y1}`); }
  for (let i = nv - 1; i >= 0; i--) { const a = y0 + ((y1 - y0) * (i + 1)) / nv, b = y0 + ((y1 - y0) * i) / nv; p.push(`L${x1 + t * 0.7},${(a + b) / 2}`, `L${x1},${b}`); }
  return p.join(" ") + " Z";
};
/** the ring a wine cup leaves */
const ring = (cx, cy, r) => {
  const arc = (rr, w, seed, op) => {
    const n = 40, pts = [];
    for (let i = 0; i <= n; i++) { const a = (i / n) * Math.PI * 2, j = rr * (1 + 0.035 * Math.sin(a * 3 + seed) + 0.012 * Math.sin(a * 11 + seed)); pts.push(`${i ? "L" : "M"}${(cx + Math.cos(a) * j).toFixed(1)},${(cy + Math.sin(a) * j * 0.96).toFixed(1)}`); }
    return `<path d="${pts.join(" ")}" fill="none" stroke="${C.lead}" stroke-width="${w}" opacity="${op}" stroke-linecap="round"/>`;
  };
  return `<g><circle cx="${cx}" cy="${cy}" r="${r * 0.98}" fill="${C.lead}" opacity="0.14"/>${arc(r, r * 0.2, 1, 0.9)}${arc(r * 0.88, r * 0.08, 4, 0.55)}<circle cx="${cx + r * 1.05}" cy="${cy + r * 0.8}" r="${r * 0.12}" fill="${C.lead}" opacity="0.8"/><circle cx="${cx + r * 0.7}" cy="${cy + r * 1.2}" r="${r * 0.07}" fill="${C.lead}" opacity="0.8"/></g>`;
};
/** THE FLAG: a pole from the left edge at y, a cloth x0..x1 hanging to y1, tilted `tilt` deg about the pole; `inner` = what is on the cloth */
const flag = ({ x0, x1, y, y1, tilt, tooth, nv, nh, poleTo, inner, ringAt }) => {
  const c0 = y + 14, cx = (x0 + x1) / 2;
  const cloth = `M${x0},${c0} L${x1},${c0} L${x1 + 1},${y1} Q${cx},${y1 + 7} ${x0 - 1},${y1} Z`, h = hem(x0, c0, x1, y1, tooth, nv, nh);
  return `
  <g filter="url(#drop)">
    <rect x="-20" y="${y - 10}" width="${poleTo + 20}" height="20" rx="10" fill="url(#pole)" stroke="${C.ink}" stroke-width="6"/>
    <circle cx="${poleTo}" cy="${y}" r="19" fill="${C.lead}" stroke="${C.ink}" stroke-width="6"/>
    <g transform="rotate(${tilt} ${cx} ${y})">
      ${[x0 + 26, x1 - 26].map((x) => `<line x1="${x}" y1="${y - 10}" x2="${x}" y2="${c0 + 8}" stroke="${C.ink}" stroke-width="7"/>`).join("")}
      <g filter="url(#edge)">
        <path d="${h}" fill="${C.accent}" stroke="${C.ink}" stroke-width="7" stroke-linejoin="round"/>
        <path d="${cloth}" fill="url(#cloth)"/>
        <path d="${cloth}" fill="#fff" filter="url(#grain)" opacity="0.9" style="mix-blend-mode:multiply"/>
        <rect x="${x0}" y="${c0}" width="${x1 - x0}" height="26" fill="${C.accent}" stroke="${C.ink}" stroke-width="6"/>
        <ellipse cx="${x0 + (x1 - x0) * 0.2}" cy="${c0 + (y1 - c0) * 0.72}" rx="${(x1 - x0) * 0.09}" ry="${(y1 - c0) * 0.09}" fill="${C.stain}" opacity="0.16"/>
        <path d="${cloth}" fill="none" stroke="${C.ink}" stroke-width="6"/>
      </g>
      ${inner}
      ${ringAt ? ring(...ringAt) : ""}
    </g>
  </g>`;
};
/** his bubble: a paper bubble with an ink line, the tail towards (tx, ty); the words centred (the comma and the question
 *  mark are full-width: the row is set glyph by glyph so its INK is centred, not its boxes) */
const bubble = ({ cx, cy, w, h, rot, tx, ty, size }) => {
  const x0 = cx - w / 2, y0 = cy - h / 2, r = h / 2;
  // the tail leaves the lower edge near the side that faces (tx, ty)
  const bx = cx + Math.sign(tx - cx) * w * 0.22, tail = `M${bx - 26},${y0 + h - 6} L${tx},${ty} L${bx + 30},${y0 + h - 6} Z`;
  const body = `<rect x="${x0}" y="${y0}" width="${w}" height="${h}" rx="${r}"/>`;
  // 哟 ， 月 亮 ？ : advances in em (full-width punctuation set tight)
  const row = [["哟", 1], ["，", 0.5], ["月", 1], ["亮", 1], ["？", 0.56]];
  const total = row.reduce((s, g) => s + g[1], 0) * size;
  let x = cx - total / 2, t = "";
  for (const [g, adv] of row) {
    const punct = g === "，" || g === "？";   // their ink sits in the LEFT of the full-width box: set from the left, tight
    t += `<text x="${(punct ? x + size * (g === "，" ? -0.04 : 0.03) : x + size / 2).toFixed(1)}" y="${cy + size * 0.02}" font-size="${size}" text-anchor="${punct ? "start" : "middle"}" dominant-baseline="central" fill="${g === "月" || g === "亮" ? C.amberDeep : C.ink}">${g}</text>`;
    x += adv * size;
  }
  return `<g transform="rotate(${rot} ${cx} ${cy})" filter="url(#drop)">
    <g fill="${C.ink}" stroke="${C.ink}" stroke-width="16" stroke-linejoin="round">${body}<path d="${tail}"/></g>
    <g fill="#fffaf0">${body}<path d="${tail}"/></g>${t}</g>`;
};
/** her camera: the four corner marks of the finder and the REC dot */
const finder = (m, len, recX, recY) => {
  const L = (x, y, dx, dy) => `<path d="M${x + dx * len},${y} L${x},${y} L${x},${y + dy * len}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  const marks = L(m, m, 1, 1) + L(W - m, m, -1, 1) + L(m, H - m, 1, -1) + L(W - m, H - m, -1, -1);
  return `<g stroke="${C.ink}" stroke-width="15" opacity="0.55">${marks}</g><g stroke="#fff" stroke-width="7">${marks}</g>
    <g><circle cx="${recX}" cy="${recY}" r="15" fill="#ff3b30" stroke="${C.ink}" stroke-width="6"/>
    <text x="${recX + 30}" y="${recY + 1}" font-size="40" dominant-baseline="central" fill="#fff" stroke="${C.ink}" stroke-width="9" paint-order="stroke" stroke-linejoin="round" letter-spacing="3" font-family="cv">REC</text></g>`;
};

// ------------------------------------------------------------------------------------------------- the two layouts
const AMB = "url(#amber)";
let over;
if (layout === "tall") {
  // the flag hangs ACROSS the top over the lattice window: 采访 small down its left, 李白 big, 的一天 small down its right
  const F = { x0: 100, x1: 956, y: 168, y1: 528 }, mid = 360, big = 268;
  const inner =
    [["采", 0], ["访", 1]].map(([c, i]) => ch(c, 188, mid - 56 + i * 112, 100, C.ink, 0)).join("") +
    `<g filter="url(#brush)">` + ch("李", 404, mid - 4, big, AMB, 28, -7, `filter="url(#hard)"`) + ch("白", 678, mid + 6, big * 0.98, AMB, 28, 5, `filter="url(#hard)"`) + `</g>` +
    [["的", 0], ["一", 1], ["天", 2]].map(([c, i]) => ch(c, 878, mid - 92 + i * 92, 84, C.ink, 0)).join("");
  over = flag({ ...F, tilt: -2.2, tooth: 30, nv: 6, nh: 15, poleTo: 986, inner, ringAt: [F.x1 - 4, F.y1 + 18, 38] }) +
    bubble({ cx: 274, cy: 676, w: 404, h: 136, rot: -5, tx: 404, ty: 806, size: 76 }) +
    finder(46, 84, 104, 114);
} else {
  // the film's own title: the flag hangs DOWN the left, 采访 / 李 / 白 / 的一天
  const F = { x0: 124, x1: 470, y: 128, y1: 896 }, cx = (F.x0 + F.x1) / 2, big = 232;
  const inner =
    `<text x="${cx + 7}" y="240" font-size="92" text-anchor="middle" dominant-baseline="central" fill="${C.ink}" letter-spacing="14">采访</text>` +
    `<g filter="url(#brush)">` + ch("李", cx - 8, 420, big, AMB, 26, -7, `filter="url(#hard)"`) + ch("白", cx + 10, 646, big * 0.98, AMB, 26, 5, `filter="url(#hard)"`) + `</g>` +
    `<text x="${cx + 4}" y="826" font-size="84" text-anchor="middle" dominant-baseline="central" fill="${C.ink}" letter-spacing="8">的一天</text>`;
  over = flag({ ...F, tilt: 2.4, tooth: 30, nv: 13, nh: 6, poleTo: 536, inner, ringAt: [F.x1 + 4, F.y1 + 16, 40] }) +
    bubble({ cx: 778, cy: 240, w: 404, h: 138, rot: -4, tx: 1000, ty: 372, size: 78 }) +
    finder(46, 84, W - 210, 94);
}
const g = guides ? `<g fill="none" stroke="#0f0" stroke-width="3" stroke-dasharray="12 8"><rect x="${W * 0.06}" y="${H * 0.06}" width="${W * 0.88}" height="${H * 0.88}"/><line x1="0" y1="${H * 0.82}" x2="${W}" y2="${H * 0.82}" stroke="#f0f"/></g>` : "";

const html = `<!doctype html><html><head><meta charset="utf8"><style>
@font-face{font-family:cv;src:url(${data(FONT)})}
html,body{margin:0;background:#000}svg text{font-family:cv}
#c{position:relative;width:${W}px;height:${H}px;overflow:hidden}
#c>*{position:absolute;left:0;top:0;width:${W}px;height:${H}px}
</style></head><body><div id="c">
<img src="${data(bg)}">
<svg viewBox="0 0 ${W} ${H}"><defs>
  <radialGradient id="vig" cx="50%" cy="56%" r="75%"><stop offset="0.55" stop-color="#1b1030" stop-opacity="0"/><stop offset="1" stop-color="#1b1030" stop-opacity="0.5"/></radialGradient>
</defs><rect width="${W}" height="${H}" fill="url(#vig)"/></svg>
<svg viewBox="0 0 ${W} ${H}"><defs>
  <linearGradient id="amber" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.amberTop}"/><stop offset="0.5" stop-color="${C.lead}"/><stop offset="1" stop-color="${C.amberDeep}"/></linearGradient>
  <linearGradient id="cloth" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${C.paper}"/><stop offset="0.35" stop-color="${C.paper}"/><stop offset="0.8" stop-color="${C.clothLow}"/><stop offset="1" stop-color="${C.clothFold}"/></linearGradient>
  <linearGradient id="pole" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8a5a2e"/><stop offset="0.5" stop-color="#6b4321"/><stop offset="1" stop-color="#4a2c14"/></linearGradient>
  <filter id="brush" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency="0.03 0.055" numOctaves="2" seed="13"/><feDisplacementMap in="SourceGraphic" scale="11" xChannelSelector="R" yChannelSelector="G"/></filter>
  <filter id="edge" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" seed="5"/><feDisplacementMap in="SourceGraphic" scale="3.2" xChannelSelector="R" yChannelSelector="G"/></filter>
  <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.9 0.35" numOctaves="2" seed="3"/><feColorMatrix values="0 0 0 0 0.47  0 0 0 0 0.36  0 0 0 0 0.2  0 0 0 0.16 0"/><feComposite in2="SourceGraphic" operator="in"/><feBlend in2="SourceGraphic" mode="multiply"/></filter>
  <filter id="hard" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="9" stdDeviation="0" flood-color="#0c0e22" flood-opacity="0.42"/></filter>
  <filter id="drop" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="6" dy="12" stdDeviation="9" flood-color="#0c0e22" flood-opacity="0.38"/></filter>
</defs>${over}${g}</svg>
${front ? `<img src="${data(front)}">` : ""}
</div></body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
await page.setContent(html);
await page.evaluate(() => document.fonts.ready);
await page.locator("#c").screenshot({ path: out });
await browser.close();
console.log("wrote", out, `${W}x${H}`);
