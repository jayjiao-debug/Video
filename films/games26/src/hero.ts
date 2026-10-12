/* Hero objects for 《是菜还是非？》, drawn like low-key product photography: one hard key light from above,
   blue (skill) and magenta (luck) rim lights, glossy black floor with reflections, haze and bokeh.
   Pure 2D canvas, every object a function of (x, y, scale). */
import { rnd, clamp, lerp } from './kit';

type G = CanvasRenderingContext2D;
export const W = 1920, H = 1080;
export const FLOOR = 720;

/* ---------------------------------------------------------------- stage */
export const stage = (g: G, T: number, opt: { warm?: number } = {}) => {
  const sky = g.createLinearGradient(0, 0, 0, FLOOR);
  sky.addColorStop(0, '#030306'); sky.addColorStop(1, '#0b0a12');
  g.fillStyle = sky; g.fillRect(0, 0, W, FLOOR);
  const fl = g.createLinearGradient(0, FLOOR, 0, H);
  fl.addColorStop(0, '#0d0c14'); fl.addColorStop(1, '#020203');
  g.fillStyle = fl; g.fillRect(0, FLOOR, W, H - FLOOR);
  // horizon haze
  const hz = g.createLinearGradient(0, FLOOR - 120, 0, FLOOR + 40);
  hz.addColorStop(0, 'rgba(120,110,160,0)'); hz.addColorStop(0.75, `rgba(140,120,170,${0.07 + 0.03 * (opt.warm ?? 0)})`); hz.addColorStop(1, 'rgba(120,110,160,0)');
  g.fillStyle = hz; g.fillRect(0, FLOOR - 120, W, 160);
};
export const bokeh = (g: G, T: number, n = 26, a = 1) => {
  g.save(); g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < n; i++) {
    const r = 18 + 60 * rnd(i, 41), x = (rnd(i, 42) * W + T * (6 + 8 * rnd(i, 43))) % (W + 200) - 100, y = 120 + rnd(i, 44) * (FLOOR - 220);
    const col = rnd(i, 45) < 0.5 ? '255,200,130' : rnd(i, 46) < 0.5 ? '120,170,255' : '255,120,210';
    const gr = g.createRadialGradient(x, y, r * 0.6, x, y, r);
    gr.addColorStop(0, `rgba(${col},${0.05 * a})`); gr.addColorStop(0.92, `rgba(${col},${0.08 * a})`); gr.addColorStop(1, `rgba(${col},0)`);
    g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, 6.3); g.fill();
  }
  g.restore();
};
/** a volumetric key light cone from above onto (x, FLOOR) */
export const spot = (g: G, x: number, w: number, a = 1, col = '255,236,205', top = 110) => {
  g.save(); g.globalCompositeOperation = 'lighter';
  const gr = g.createLinearGradient(0, top, 0, FLOOR);
  gr.addColorStop(0, `rgba(${col},${0.0})`); gr.addColorStop(0.25, `rgba(${col},${0.05 * a})`); gr.addColorStop(1, `rgba(${col},${0.12 * a})`);
  g.fillStyle = gr;
  [[1, 0.35], [0.8, 0.35], [0.6, 0.4]].forEach(([k, al]) => { g.globalAlpha = al; g.beginPath(); g.moveTo(x - w * 0.1 * k, top); g.lineTo(x + w * 0.1 * k, top); g.lineTo(x + w / 2 * k, FLOOR); g.lineTo(x - w / 2 * k, FLOOR); g.closePath(); g.fill(); });
  g.globalAlpha = 1;
  const pool = g.createRadialGradient(x, FLOOR + 6, 0, x, FLOOR + 6, w * 0.7);
  pool.addColorStop(0, `rgba(${col},${0.22 * a})`); pool.addColorStop(1, `rgba(${col},0)`);
  g.fillStyle = pool; g.save(); g.translate(x, FLOOR + 6); g.scale(1, 0.16); g.translate(-x, -(FLOOR + 6)); g.beginPath(); g.arc(x, FLOOR + 6, w * 0.7, 0, 6.3); g.fill(); g.restore();
  g.restore();
};
/** draw `fn` and its reflection in the glossy floor */
export const withReflection = (g: G, fn: () => void, strength = 0.28) => {
  fn();
  g.save(); g.globalAlpha = strength; g.translate(0, 2 * FLOOR); g.scale(1, -1); fn(); g.restore();
};
/** fade reflections into the floor (call once after all reflected objects) */
export const floorFade = (g: G) => {
  const gr = g.createLinearGradient(0, FLOOR, 0, FLOOR + 240);
  gr.addColorStop(0, 'rgba(5,5,8,0)'); gr.addColorStop(1, 'rgba(3,3,5,0.96)');
  g.fillStyle = gr; g.fillRect(0, FLOOR, W, H - FLOOR);
};
/** the spectrum as an LED strip set into the floor, blue (skill) → magenta (luck) */
export const strip = (g: G, x0: number, x1: number, y = FLOOR + 40, a = 1, fifty = 0) => {
  g.save(); g.globalCompositeOperation = 'lighter';
  const gr = g.createLinearGradient(x0, 0, x1, 0);
  gr.addColorStop(0, `rgba(110,170,255,${a})`); gr.addColorStop(0.5, `rgba(190,150,240,${a})`); gr.addColorStop(1, `rgba(255,105,200,${a})`);
  [[18, 0.06], [8, 0.16], [3, 0.6], [1.2, 1]].forEach(([w, al]) => { g.strokeStyle = gr; g.globalAlpha = al; g.lineWidth = w; g.beginPath(); g.moveTo(x0, y); g.lineTo(x1, y); g.stroke(); });
  g.globalAlpha = 1;
  if (fifty > 0) { const x = (x0 + x1) / 2; const fg = g.createLinearGradient(0, y - 260, 0, y); fg.addColorStop(0, 'rgba(255,214,140,0)'); fg.addColorStop(1, `rgba(255,214,140,${0.8 * fifty})`); g.fillStyle = fg; g.fillRect(x - 1.5, y - 260, 3, 260); }
  g.restore();
};

/* ---------------------------------------------------------------- lacquered chess king */
const KING_HALF: [number, number][] = [[0, 0], [74, 0], [76, -10], [66, -20], [70, -28], [52, -40], [44, -58], [34, -120], [30, -178], [46, -188], [48, -198], [32, -205], [36, -214], [50, -246], [34, -262], [12, -268], [12, -280], [7, -280], [7, -294], [22, -294], [22, -306], [7, -306], [7, -322], [0, -322]];
export const king = (g: G, x: number, y: number, s: number, rimL = '120,175,255', rimR = '170,150,255', light = 1) => {
  const pts = [...KING_HALF.map(([a, b]) => [x + a * s, y + b * s]), ...[...KING_HALF].reverse().map(([a, b]) => [x - a * s, y + b * s])];
  const path = () => { g.beginPath(); pts.forEach(([a, b], i) => (i ? g.lineTo(a, b) : g.moveTo(a, b))); g.closePath(); };
  const gr = g.createLinearGradient(x - 76 * s, 0, x + 76 * s, 0);
  gr.addColorStop(0, `rgba(${rimL},${0.95 * light})`); gr.addColorStop(0.06, '#2a3550'); gr.addColorStop(0.28, '#161d30'); gr.addColorStop(0.55, '#0a0d16'); gr.addColorStop(0.88, '#222a44'); gr.addColorStop(1, `rgba(${rimR},${0.8 * light})`);
  path(); g.fillStyle = gr; g.fill();
  // top light: a soft specular band down the left third
  g.save(); path(); g.clip();
  const sp = g.createLinearGradient(x - 40 * s, 0, x - 10 * s, 0); sp.addColorStop(0, 'rgba(255,255,255,0)'); sp.addColorStop(0.5, `rgba(220,230,255,${0.26 * light})`); sp.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = sp; g.fillRect(x - 40 * s, y - 330 * s, 30 * s, 330 * s);
  const tl = g.createLinearGradient(0, y - 330 * s, 0, y - 150 * s); tl.addColorStop(0, `rgba(255,236,205,${0.2 * light})`); tl.addColorStop(1, 'rgba(255,236,205,0)');
  g.fillStyle = tl; g.fillRect(x - 80 * s, y - 330 * s, 160 * s, 180 * s);
  g.restore();
  g.strokeStyle = `rgba(${rimL},${0.35 * light})`; g.lineWidth = 1; path(); g.stroke();
};

/* ---------------------------------------------------------------- go stones (lenticular, seen from a low angle) */
export const stone = (g: G, x: number, y: number, r: number, white: boolean) => {
  const ry = r * 0.42;
  g.save(); g.fillStyle = 'rgba(0,0,0,.6)'; g.beginPath(); g.ellipse(x + r * 0.1, y + ry * 0.7, r * 1.02, ry * 0.7, 0, 0, 6.3); g.fill(); g.restore();
  const gr = g.createRadialGradient(x - r * 0.35, y - ry * 0.6, r * 0.05, x, y, r * 1.05);
  if (white) { gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.35, '#efebe2'); gr.addColorStop(0.85, '#b8b1a3'); gr.addColorStop(1, '#8c8679'); }
  else { gr.addColorStop(0, '#8d93a3'); gr.addColorStop(0.18, '#2a2e38'); gr.addColorStop(0.7, '#0b0c10'); gr.addColorStop(1, '#000'); }
  g.fillStyle = gr; g.beginPath(); g.ellipse(x, y, r, ry, 0, 0, 6.3); g.fill();
  g.fillStyle = white ? 'rgba(255,255,255,.7)' : 'rgba(200,215,255,.35)'; g.beginPath(); g.ellipse(x - r * 0.35, y - ry * 0.45, r * 0.25, ry * 0.18, -0.2, 0, 6.3); g.fill();
};

/* ---------------------------------------------------------------- mahjong tile (ivory face, green back), as a block */
export const tile = (g: G, x: number, y: number, s: number, ch: string, chCol: string, faceUp = true, glow = 0) => {
  const w = 56 * s, h = 76 * s, d = 22 * s, sk = 10 * s; // front face w×h, depth d (drawn up-right)
  // top face
  g.beginPath(); g.moveTo(x, y - h); g.lineTo(x + sk, y - h - d * 0.5); g.lineTo(x + w + sk, y - h - d * 0.5); g.lineTo(x + w, y - h); g.closePath();
  g.fillStyle = faceUp ? '#e9e2cf' : '#2f7a55'; g.fill();
  // right side: ivory front layer + green back layer
  g.beginPath(); g.moveTo(x + w, y - h); g.lineTo(x + w + sk, y - h - d * 0.5); g.lineTo(x + w + sk, y - d * 0.5); g.lineTo(x + w, y); g.closePath();
  const sd = g.createLinearGradient(x + w, 0, x + w + sk, 0); sd.addColorStop(0, '#bfb7a2'); sd.addColorStop(0.55, '#a59d88'); sd.addColorStop(0.56, '#1f5a3d'); sd.addColorStop(1, '#143d29');
  g.fillStyle = sd; g.fill();
  // front face
  const fr = g.createLinearGradient(x, y - h, x + w, y);
  if (faceUp) { fr.addColorStop(0, '#fbf7ec'); fr.addColorStop(0.6, '#ece5d2'); fr.addColorStop(1, '#cfc6ae'); }
  else { fr.addColorStop(0, '#3b9a6b'); fr.addColorStop(0.6, '#257050'); fr.addColorStop(1, '#174a33'); }
  g.fillStyle = fr; g.beginPath(); (g as any).roundRect(x, y - h, w, h, 6 * s); g.fill();
  g.strokeStyle = faceUp ? 'rgba(255,255,255,.6)' : 'rgba(150,230,190,.35)'; g.lineWidth = 1; g.beginPath(); g.moveTo(x + 4 * s, y - h + 2); g.lineTo(x + w - 4 * s, y - h + 2); g.stroke();
  if (faceUp) {
    g.font = `900 ${h * 0.6}px "Noto Serif CJK SC"`; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillStyle = 'rgba(0,0,0,.18)'; g.fillText(ch, x + w / 2 + 1.5, y - h / 2 + 3.5);
    g.fillStyle = chCol; g.fillText(ch, x + w / 2, y - h / 2 + 2);
  }
  if (glow > 0) { g.save(); g.globalCompositeOperation = 'lighter'; const gl = g.createRadialGradient(x + w / 2, y - h / 2, 0, x + w / 2, y - h / 2, w * 1.4); gl.addColorStop(0, `rgba(255,214,140,${0.25 * glow})`); gl.addColorStop(1, 'rgba(255,214,140,0)'); g.fillStyle = gl; g.fillRect(x - w, y - h * 1.6, w * 3, h * 2.4); g.restore(); }
};

/* ---------------------------------------------------------------- playing card */
export const card = (g: G, x: number, y: number, s: number, rank: string, suit: string, red: boolean, rot = 0) => {
  const w = 110 * s, h = 154 * s;
  g.save(); g.translate(x, y); g.rotate(rot);
  g.fillStyle = 'rgba(0,0,0,.45)'; g.beginPath(); (g as any).roundRect(-w / 2 + 6, -h + 8, w, h, 9 * s); g.fill();
  const gr = g.createLinearGradient(-w / 2, -h, w / 2, 0); gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.7, '#f1eee8'); gr.addColorStop(1, '#d9d4ca');
  g.fillStyle = gr; g.beginPath(); (g as any).roundRect(-w / 2, -h, w, h, 9 * s); g.fill();
  g.strokeStyle = 'rgba(0,0,0,.15)'; g.lineWidth = 1; g.stroke();
  const col = red ? '#c8102e' : '#16161d';
  g.fillStyle = col; g.textAlign = 'left'; g.textBaseline = 'top';
  g.font = `700 ${30 * s}px "Cormorant Garamond"`; g.fillText(rank, -w / 2 + 10 * s, -h + 8 * s);
  g.font = `${26 * s}px "DejaVu Sans"`; g.fillText(suit, -w / 2 + 10 * s, -h + 38 * s);
  g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = `${72 * s}px "DejaVu Sans"`; g.fillText(suit, 0, -h / 2 + 6 * s);
  g.restore();
};

/* ---------------------------------------------------------------- die (rounded cube, three faces) */
export const die = (g: G, x: number, y: number, s: number, faces: [number, number, number] = [5, 3, 1]) => {
  const a = 70 * s; // edge
  const top = [[x, y - a * 1.15], [x + a * 0.87, y - a * 0.65], [x, y - a * 0.15], [x - a * 0.87, y - a * 0.65]];
  const left = [[x - a * 0.87, y - a * 0.65], [x, y - a * 0.15], [x, y + a * 0.85], [x - a * 0.87, y + a * 0.35]];
  const right = [[x, y - a * 0.15], [x + a * 0.87, y - a * 0.65], [x + a * 0.87, y + a * 0.35], [x, y + a * 0.85]];
  const poly = (p: number[][], fill: string | CanvasGradient) => { g.beginPath(); p.forEach(([u, v], i) => (i ? g.lineTo(u, v) : g.moveTo(u, v))); g.closePath(); g.fillStyle = fill; g.fill(); };
  poly(top, '#fbf8f2'); poly(left, '#d8d2c6'); poly(right, '#ebe6dc');
  g.strokeStyle = 'rgba(255,255,255,.7)'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(top[3][0], top[3][1]); g.lineTo(top[0][0], top[0][1]); g.lineTo(top[1][0], top[1][1]); g.stroke();
  const PIPS: Record<number, [number, number][]> = { 1: [[0, 0]], 2: [[-1, -1], [1, 1]], 3: [[-1, -1], [0, 0], [1, 1]], 4: [[-1, -1], [1, -1], [-1, 1], [1, 1]], 5: [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]], 6: [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]] };
  // face basis vectors (u along one edge, v along the other), centre
  const faceDef: [number[], number[], number[]][] = [
    [[x, y - a * 0.65], [a * 0.435, a * 0.25], [-a * 0.435, a * 0.25]],
    [[x - a * 0.435, y + a * 0.1], [a * 0.435, a * 0.25], [0, a * 0.5]],
    [[x + a * 0.435, y + a * 0.1], [a * 0.435, -a * 0.25], [0, a * 0.5]],
  ];
  faceDef.forEach(([c, u, v], k) => {
    PIPS[faces[k]].forEach(([i, j]) => {
      const px = c[0] + u[0] * i * 0.55 + v[0] * j * 0.55, py = c[1] + u[1] * i * 0.55 + v[1] * j * 0.55;
      g.save(); g.setTransform(u[0] / a * 2, u[1] / a * 2, v[0] / a * 2, v[1] / a * 2, px, py);
      g.fillStyle = faces[k] === 1 ? '#c8102e' : '#1b1b22'; g.beginPath(); g.arc(0, 0, a * 0.1, 0, 6.3); g.fill(); g.restore();
    });
  });
};

/* ---------------------------------------------------------------- coin (metal disc with an edge), spin 0..1 = flat..edge-on */
export const coin = (g: G, x: number, y: number, r: number, tilt = 0.35, gold = true) => {
  const ry = Math.max(1.5, r * tilt), th = r * 0.14;
  const edge = g.createLinearGradient(x - r, 0, x + r, 0);
  if (gold) { edge.addColorStop(0, '#5a3d12'); edge.addColorStop(0.4, '#c9973f'); edge.addColorStop(0.6, '#f3d38a'); edge.addColorStop(1, '#4a3210'); }
  else { edge.addColorStop(0, '#3a3d45'); edge.addColorStop(0.5, '#c7ccd6'); edge.addColorStop(1, '#2a2d33'); }
  g.fillStyle = edge; g.beginPath(); g.ellipse(x, y + th, r, ry, 0, 0, Math.PI); g.lineTo(x - r, y); g.ellipse(x, y, r, ry, 0, Math.PI, 0, true); g.closePath(); g.fill();
  const face = g.createRadialGradient(x - r * 0.3, y - ry * 0.5, r * 0.05, x, y, r * 1.05);
  if (gold) { face.addColorStop(0, '#fff3c4'); face.addColorStop(0.35, '#f0c86e'); face.addColorStop(0.8, '#b8862f'); face.addColorStop(1, '#7a561b'); }
  else { face.addColorStop(0, '#ffffff'); face.addColorStop(0.5, '#c8ccd4'); face.addColorStop(1, '#6d717a'); }
  g.fillStyle = face; g.beginPath(); g.ellipse(x, y, r, ry, 0, 0, 6.3); g.fill();
  g.strokeStyle = gold ? 'rgba(122,86,27,.8)' : 'rgba(80,84,92,.8)'; g.lineWidth = Math.max(1, r * 0.04); g.beginPath(); g.ellipse(x, y, r * 0.8, ry * 0.8, 0, 0, 6.3); g.stroke();
  g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = 'rgba(255,255,255,.35)'; g.beginPath(); g.ellipse(x - r * 0.35, y - ry * 0.35, r * 0.28, ry * 0.12 + 1, -0.3, 0, 6.3); g.fill(); g.restore();
};

/* ---------------------------------------------------------------- hex pedestal (the auto-battler board), a glowing piece on top */
export const hexPedestal = (g: G, x: number, y: number, r: number, col = '190,150,240', lit = 1) => {
  const ry = r * 0.42, hgt = r * 0.32;
  const P = (k: number, yy: number) => [x + Math.cos((k / 6) * 6.283) * r, yy + Math.sin((k / 6) * 6.283) * ry];
  // sides (front three)
  for (let k = 0; k < 3; k++) {
    const a = P(k, y), b = P(k + 1, y);
    const sg = g.createLinearGradient(0, y, 0, y + hgt); sg.addColorStop(0, '#1b1a28'); sg.addColorStop(1, '#09090f');
    g.fillStyle = sg; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.lineTo(b[0], b[1] + hgt); g.lineTo(a[0], a[1] + hgt); g.closePath(); g.fill();
  }
  // top
  g.beginPath(); for (let k = 0; k <= 6; k++) { const [a, b] = P(k, y); if (k) g.lineTo(a, b); else g.moveTo(a, b); }
  const tg = g.createRadialGradient(x, y, 0, x, y, r); tg.addColorStop(0, '#262438'); tg.addColorStop(1, '#13121c');
  g.fillStyle = tg; g.fill();
  g.save(); g.globalCompositeOperation = 'lighter'; g.strokeStyle = `rgba(${col},${0.8 * lit})`; g.lineWidth = 2; g.stroke();
  g.strokeStyle = `rgba(${col},${0.15 * lit})`; g.lineWidth = 10; g.stroke(); g.restore();
};

/* ---------------------------------------------------------------- shards: an object breaking into glowing pieces */
export const shards = (g: G, x: number, y: number, t: number, n = 90, col = '255,120,210') => {
  if (t <= 0) return;
  g.save(); g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < n; i++) {
    const a = rnd(i, 61) * 6.283, sp = 80 + 320 * rnd(i, 62), px = x + Math.cos(a) * sp * t, py = y + Math.sin(a) * sp * t * 0.7 + 260 * t * t - 40 * rnd(i, 63);
    const s = 2 + 7 * rnd(i, 64), al = clamp(1 - t * 0.8);
    g.fillStyle = `rgba(${col},${al})`; g.save(); g.translate(px, py); g.rotate(a + t * 6); g.beginPath(); g.moveTo(0, -s); g.lineTo(s * 0.6, s * 0.4); g.lineTo(-s * 0.5, s * 0.6); g.closePath(); g.fill(); g.restore();
  }
  g.restore();
};
export { lerp };
