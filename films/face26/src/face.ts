/* A stranger's face, drawn in code (no photos, no generated images), for 《0.1秒》.
   One parametric head lit like a portrait: warm key light from the upper left, cool rim from behind on the right.
   The trust axis follows Oosterhof & Todorov (2008): the "trustworthy" end has a U-shaped mouth and open, slightly
   surprised eyes (inner brows up); the "untrustworthy" end has the mouth corners down and the brows pulled down at the
   centre. Styles built on top: painted, particles, engraving, line. */

type G = CanvasRenderingContext2D;
export type FaceP = {
  trust?: number;   // -1 untrustworthy … +1 trustworthy (drives brows, mouth, eye openness together)
  brow?: number;    // optional overrides
  mouth?: number;
  open?: number;    // eye openness 0..1.3
  gaze?: number;    // -1 … 1, iris shift
  hair?: number;    // 0 short dark, 1 longer
  skin?: number;    // 0 lighter … 1 darker
  key?: number;     // key light strength 0..1.4
  rim?: string;     // rim light colour 'r,g,b'
  seed?: number;    // tiny asymmetries
};
const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const mix = (a: number[], b: number[], k: number) => a.map((v, i) => v + (b[i] - v) * k);
const rgb = (c: number[], a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;

/** the head outline in local units: crown y −285, chin y +262 */
const headPath = (g: G | Path2D) => {
  const p = g as any;
  p.moveTo(0, -290);
  p.bezierCurveTo(118, -290, 190, -222, 196, -122);
  p.bezierCurveTo(202, -50, 204, 10, 192, 70);
  p.bezierCurveTo(182, 130, 160, 176, 120, 214);
  p.bezierCurveTo(86, 246, 54, 256, 0, 258);
  p.bezierCurveTo(-54, 256, -86, 246, -120, 214);
  p.bezierCurveTo(-160, 176, -182, 130, -192, 70);
  p.bezierCurveTo(-204, 10, -202, -50, -196, -122);
  p.bezierCurveTo(-190, -222, -118, -290, 0, -290);
  p.closePath();
};
let NOISE: HTMLCanvasElement | null = null;
const noise = () => {
  if (NOISE) return NOISE;
  NOISE = document.createElement('canvas'); NOISE.width = NOISE.height = 256;
  const g = NOISE.getContext('2d')!, im = g.createImageData(256, 256);
  for (let i = 0; i < im.data.length; i += 4) { const v = 110 + Math.random() * 40; im.data[i] = v; im.data[i + 1] = v * 0.92; im.data[i + 2] = v * 0.85; im.data[i + 3] = 255; }
  g.putImageData(im, 0, 0); return NOISE;
};
const blob = (g: G, x: number, y: number, rx: number, ry: number, col: string, blur: number, rot = 0) => {
  g.save(); g.filter = `blur(${blur}px)`; g.fillStyle = col; g.beginPath(); g.ellipse(x, y, rx, ry, rot, 0, 6.3); g.fill(); g.restore();
};

export const drawFace = (g: G, cx: number, cy: number, s: number, p: FaceP = {}) => {
  const t = p.trust ?? 0;
  const brow = p.brow ?? t, mouth = p.mouth ?? t * 0.9, open = p.open ?? 1 + 0.18 * t, gaze = p.gaze ?? 0;
  const key = p.key ?? 1, rim = p.rim ?? '140,175,255', dk = p.skin ?? 0.35;
  const SKIN_HI = mix([236, 196, 166], [196, 146, 112], dk), SKIN = mix([205, 152, 118], [150, 102, 74], dk), SKIN_LO = mix([96, 60, 44], [62, 38, 28], dk);
  g.save(); g.translate(cx, cy); g.scale(s, s);

  // ---------------------------------------------------------------- neck + shoulders
  g.save();
  const nk = g.createLinearGradient(-80, 0, 80, 0); nk.addColorStop(0, rgb(SKIN)); nk.addColorStop(1, rgb(SKIN_LO));
  g.fillStyle = nk; g.beginPath(); g.moveTo(-96, 150); g.bezierCurveTo(-98, 250, -104, 300, -122, 350); g.lineTo(122, 350); g.bezierCurveTo(104, 300, 98, 250, 96, 150); g.closePath(); g.fill();
  blob(g, 0, 268, 120, 40, 'rgba(20,10,8,.75)', 18);                  // chin shadow on the neck
  const cl = g.createLinearGradient(-400, 330, 400, 520); cl.addColorStop(0, '#22232c'); cl.addColorStop(0.5, '#121219'); cl.addColorStop(1, '#07070a');
  g.fillStyle = cl; g.beginPath(); g.moveTo(-440, 560); g.bezierCurveTo(-420, 390, -280, 330, -120, 318); g.lineTo(-62, 392); g.lineTo(0, 440); g.lineTo(62, 392); g.lineTo(120, 318); g.bezierCurveTo(280, 330, 420, 390, 440, 560); g.closePath(); g.fill();
  g.strokeStyle = 'rgba(255,214,170,.18)'; g.lineWidth = 2; g.beginPath(); g.moveTo(-120, 318); g.lineTo(-62, 392); g.lineTo(0, 440); g.stroke();
  g.restore();

  // ---------------------------------------------------------------- ears (behind)
  [-1, 1].forEach((sd) => {
    const ex = sd * 196, eg = g.createRadialGradient(ex - 10, -30, 4, ex, -20, 50);
    eg.addColorStop(0, rgb(sd < 0 ? SKIN_HI : SKIN)); eg.addColorStop(1, rgb(SKIN_LO));
    g.fillStyle = eg; g.beginPath(); g.ellipse(ex, -22, 28, 54, sd * 0.12, 0, 6.3); g.fill();
    blob(g, ex + sd * 4, -18, 12, 30, 'rgba(60,30,24,.5)', 5, sd * 0.12);
  });

  // ---------------------------------------------------------------- head base, lit from the upper left
  const hp = new Path2D(); headPath(hp);
  const base = g.createRadialGradient(-90, -130, 30, -40, -40, 430);
  base.addColorStop(0, rgb(mix(SKIN_HI, [255, 236, 214], 0.15 * key))); base.addColorStop(0.45, rgb(SKIN)); base.addColorStop(1, rgb(SKIN_LO));
  g.fillStyle = base; g.fill(hp);
  g.save(); g.clip(hp);
  // the shadow side
  const sh = g.createLinearGradient(-20, 0, 170, 0); sh.addColorStop(0, 'rgba(26,12,8,0)'); sh.addColorStop(0.55, 'rgba(26,12,8,.5)'); sh.addColorStop(1, 'rgba(18,8,6,.82)');
  g.fillStyle = sh; g.fillRect(-300, -300, 600, 600);
  blob(g, 78, 22, 34, 26, `rgba(255,214,180,${0.26 * key})`, 14);            // Rembrandt triangle under the far eye
  blob(g, -96, 40, 46, 30, 'rgba(200,90,80,.16)', 22); blob(g, 96, 40, 40, 28, 'rgba(160,70,60,.12)', 22);   // cheek colour
  blob(g, 0, 86, 24, 18, 'rgba(200,90,80,.14)', 10);
  blob(g, -20, 228, 50, 18, `rgba(255,226,200,${0.18 * key})`, 12);            // chin highlight
  // modelling: forehead and cheek highlights, temple / cheek hollows, jaw underside
  blob(g, -50, -175, 90, 55, `rgba(255,235,210,${0.22 * key})`, 30);
  blob(g, -112, 20, 46, 40, `rgba(255,226,200,${0.2 * key})`, 22);
  blob(g, 112, 20, 40, 36, 'rgba(255,220,190,.05)', 22);
  blob(g, -128, 92, 34, 70, 'rgba(70,36,26,.22)', 22); blob(g, 130, 92, 40, 74, 'rgba(40,18,12,.35)', 22);
  blob(g, -170, -120, 30, 80, 'rgba(70,36,26,.25)', 24); blob(g, 172, -120, 30, 80, 'rgba(40,18,12,.35)', 24);
  blob(g, 0, 250, 150, 40, 'rgba(40,18,12,.35)', 20);
  // skin texture
  g.save(); g.globalAlpha = 0.07; g.globalCompositeOperation = 'overlay'; g.fillStyle = g.createPattern(noise(), 'repeat')!; g.fillRect(-300, -300, 600, 600); g.restore();
  // eye sockets
  [-1, 1].forEach((sd) => blob(g, sd * 80, -42, 66, 38, `rgba(60,28,20,${sd < 0 ? 0.32 : 0.45})`, 14));
  // nose: bridge shadow on the far side, tip highlight, wings and nostrils
  g.save(); g.filter = 'blur(7px)'; g.strokeStyle = 'rgba(60,28,20,.5)'; g.lineWidth = 14; g.lineCap = 'round';
  g.beginPath(); g.moveTo(16, -48); g.bezierCurveTo(24, 0, 30, 50, 30, 86); g.stroke(); g.restore();
  g.save(); g.filter = 'blur(5px)'; g.strokeStyle = `rgba(255,236,214,${0.35 * key})`; g.lineWidth = 9; g.lineCap = 'round';
  g.beginPath(); g.moveTo(-6, -50); g.bezierCurveTo(-8, 0, -6, 50, -4, 80); g.stroke(); g.restore();
  blob(g, -2, 88, 22, 16, `rgba(255,232,210,${0.3 * key})`, 8);
  [-1, 1].forEach((sd) => blob(g, sd * 30, 100, 18, 14, `rgba(80,40,30,${sd < 0 ? 0.35 : 0.5})`, 6));
  [-1, 1].forEach((sd) => blob(g, sd * 15, 110, 9, 5, 'rgba(25,10,8,.85)', 2.5));
  blob(g, 0, 114, 20, 6, 'rgba(50,22,16,.45)', 5);
  blob(g, 36, 104, 26, 16, 'rgba(30,12,8,.45)', 8, 0.5);
  // philtrum
  blob(g, 0, 128, 9, 12, 'rgba(70,34,26,.25)', 4);
  // nasolabial folds, deeper when the mouth turns down
  [-1, 1].forEach((sd) => { g.save(); g.filter = 'blur(6px)'; g.strokeStyle = `rgba(70,34,26,${0.18 + 0.12 * clamp(-mouth)})`; g.lineWidth = 8;
    g.beginPath(); g.moveTo(sd * 40, 100); g.quadraticCurveTo(sd * 70, 130, sd * (74 + 6 * clamp(-mouth)), 168 + 8 * clamp(-mouth)); g.stroke(); g.restore(); });
  g.restore();

  // ---------------------------------------------------------------- eyes
  [-1, 1].forEach((sd) => {
    const ix = sd * 38, ox = sd * 124, ey = -40, up = 22 * open, lo = 10 * clamp(open, 0.4, 1.2);
    const inner = [ix, ey + 2], outer = [ox, ey - 2 + 3 * clamp(-brow)];
    const eye = new Path2D();
    eye.moveTo(inner[0], inner[1]);
    eye.bezierCurveTo(ix + sd * 20, ey - up, ox - sd * 26, ey - up * 1.05, outer[0], outer[1]);
    eye.bezierCurveTo(ox - sd * 24, ey + lo, ix + sd * 18, ey + lo, inner[0], inner[1]);
    const sc = g.createLinearGradient(ix, 0, ox, 0); sc.addColorStop(0, '#b9a597'); sc.addColorStop(0.5, '#e9ddd2'); sc.addColorStop(1, sd < 0 ? '#bfae9f' : '#8e7c70');
    g.fillStyle = sc; g.fill(eye);
    g.save(); g.clip(eye);
    const irx = sd * 80 + gaze * 12, iry = ey - 1;
    const ir = g.createRadialGradient(irx, iry, 2, irx, iry, 19); ir.addColorStop(0, '#3a2414'); ir.addColorStop(0.7, '#5b3a22'); ir.addColorStop(1, '#22140c');
    g.fillStyle = ir; g.beginPath(); g.arc(irx, iry, 20, 0, 6.3); g.fill();
    g.fillStyle = '#0b0604'; g.beginPath(); g.arc(irx, iry, 7.5, 0, 6.3); g.fill();
    blob(g, sd * 80, ey - up * 0.7, 46, 12, 'rgba(40,20,14,.55)', 5);   // upper-lid shadow on the eyeball
    g.restore();
    g.fillStyle = 'rgba(255,250,240,.95)'; g.beginPath(); g.arc(irx - 6, iry - 7, 3.6, 0, 6.3); g.fill();
    // lids
    g.strokeStyle = '#140a06'; g.lineWidth = 5; g.lineCap = 'round';
    g.beginPath(); g.moveTo(inner[0], inner[1]); g.bezierCurveTo(ix + sd * 20, ey - up, ox - sd * 26, ey - up * 1.05, outer[0], outer[1]); g.stroke();
    g.strokeStyle = 'rgba(60,30,22,.45)'; g.lineWidth = 1.6;
    g.beginPath(); g.moveTo(inner[0] + sd * 6, inner[1] + 3); g.bezierCurveTo(ix + sd * 22, ey + lo + 2, ox - sd * 24, ey + lo + 2, outer[0] - sd * 4, outer[1] + 2); g.stroke();
    // crease above
    g.save(); g.filter = 'blur(1.5px)'; g.strokeStyle = 'rgba(70,34,26,.5)'; g.lineWidth = 2.4;
    g.beginPath(); g.moveTo(ix + sd * 6, ey - up - 6); g.quadraticCurveTo(sd * 82, ey - up - 16, ox - sd * 6, ey - up * 0.6 - 4); g.stroke(); g.restore();
  });

  // ---------------------------------------------------------------- brows: inner end up (trust) or pulled down (distrust)
  [-1, 1].forEach((sd) => {
    const inY = -86 - 14 * brow, midY = -104 - 4 * brow + 6 * clamp(-brow), outY = -90 + 4 * clamp(-brow);
    g.save(); g.filter = 'blur(1.6px)';
    g.fillStyle = '#24160f';
    g.beginPath();
    g.moveTo(sd * 36, inY + 9);
    g.quadraticCurveTo(sd * 46, inY - 6, sd * 62, midY + 4 - (inY - midY) * 0.15);
    g.quadraticCurveTo(sd * 96, midY - 4, sd * 136, outY);
    g.quadraticCurveTo(sd * 100, midY + 8, sd * 62, midY + 14);
    g.quadraticCurveTo(sd * 46, inY + 12, sd * 36, inY + 9);
    g.fill();
    // hair texture
    g.strokeStyle = 'rgba(20,12,8,.6)'; g.lineWidth = 1.2;
    for (let k = 0; k < 14; k++) { const q = k / 13, x = sd * (40 + 92 * q), y = inY + (outY - inY) * q - 6 * Math.sin(q * Math.PI) + 4; g.beginPath(); g.moveTo(x, y + 4); g.lineTo(x + sd * 9, y - 3); g.stroke(); }
    g.restore();
    if (brow < -0.2) blob(g, 0, -78, 22, 16, `rgba(60,28,20,${0.3 * clamp(-brow)})`, 6);   // knitted brow
  });

  // ---------------------------------------------------------------- mouth: corners up (trust) or down (distrust)
  const my = 152, cw = 60, cy0 = my - 13 * mouth;
  const lip = (x: number) => my + 2 - 13 * mouth * (Math.abs(x) / cw) ** 2 * (mouth > 0 ? 1 : 0.9) + (mouth > 0 ? 0 : 0);
  const line = (x: number) => (mouth >= 0 ? my - 13 * mouth * (x / cw) ** 2 + 4 * mouth : my - 13 * mouth * (x / cw) ** 2);
  // upper lip
  g.save();
  const ul = new Path2D(); ul.moveTo(-cw, line(-cw));
  ul.bezierCurveTo(-40, line(-40) - 13, -18, my - 20, -8, my - 15); ul.quadraticCurveTo(0, my - 11, 8, my - 15); ul.bezierCurveTo(18, my - 20, 40, line(40) - 13, cw, line(cw));
  for (let x = cw; x >= -cw; x -= 4) ul.lineTo(x, line(x));
  ul.closePath();
  const ug = g.createLinearGradient(0, my - 18, 0, my + 2); ug.addColorStop(0, '#80463b'); ug.addColorStop(1, '#5a2a22');
  g.fillStyle = ug; g.fill(ul);
  // lower lip
  const ll = new Path2D(); ll.moveTo(-cw + 4, line(-cw + 4));
  for (let x = -cw + 4; x <= cw - 4; x += 4) ll.lineTo(x, line(x));
  ll.bezierCurveTo(40, line(40) + 20, 16, my + 27, 0, my + 27); ll.bezierCurveTo(-16, my + 27, -40, line(-40) + 20, -cw + 4, line(-cw + 4));
  ll.closePath();
  const lg = g.createLinearGradient(0, my, 0, my + 24); lg.addColorStop(0, '#8a4a3e'); lg.addColorStop(0.45, '#a8604f'); lg.addColorStop(1, '#7a3e33');
  g.fillStyle = lg; g.fill(ll);
  blob(g, -12, my + 10, 14, 4, `rgba(255,220,200,${0.35 * key})`, 3);
  // the line between the lips and the corners
  g.strokeStyle = '#2a120d'; g.lineWidth = 2.6; g.lineCap = 'round';
  g.beginPath(); for (let x = -cw; x <= cw; x += 3) { const y = line(x); x === -cw ? g.moveTo(x, y) : g.lineTo(x, y); } g.stroke();
  [-1, 1].forEach((sd) => blob(g, sd * (cw + 3), line(cw) + (mouth < 0 ? 4 : -2), 6, 6, 'rgba(50,20,14,.55)', 3));
  blob(g, 0, my + 36, 34, 8, 'rgba(60,28,20,.35)', 7);   // under the lower lip
  g.restore();
  void lip; void cy0;

  // ---------------------------------------------------------------- hair
  g.save();
  const hairP = new Path2D();
  hairP.moveTo(-206, -30);
  hairP.bezierCurveTo(-232, -200, -160, -330, 0, -334);
  hairP.bezierCurveTo(160, -330, 232, -200, 206, -30);
  hairP.bezierCurveTo(196, -100, 184, -160, 156, -196);
  hairP.bezierCurveTo(128, -214, 104, -198, 80, -214);
  hairP.bezierCurveTo(52, -230, 30, -204, 2, -218);
  hairP.bezierCurveTo(-30, -232, -58, -206, -92, -216);
  hairP.bezierCurveTo(-130, -222, -160, -196, -176, -150);
  hairP.bezierCurveTo(-190, -110, -200, -70, -206, -30);
  hairP.closePath();
  const hg = g.createLinearGradient(-200, -300, 200, 0); hg.addColorStop(0, '#3a2a20'); hg.addColorStop(0.4, '#17100c'); hg.addColorStop(1, '#080605');
  g.fillStyle = hg; g.fill(hairP);
  g.clip(hairP);
  for (let k = 0; k < 260; k++) {
    const r = Math.sin(k * 12.9898 + (p.seed ?? 0)) * 43758.5453, q = r - Math.floor(r);
    const x0 = -210 + 420 * ((k * 0.618) % 1), y0 = -330 + 90 * q;
    g.strokeStyle = k % 3 ? 'rgba(90,64,48,.28)' : `rgba(255,214,170,${0.12 * key})`; g.lineWidth = 1.2;
    g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo(x0 * 0.95 + 14 * Math.sign(x0 || 1), y0 + 70, x0 * 1.08 + 8, y0 + 130 + 40 * q); g.stroke();
  }
  g.restore();
  // soft hairline shadow on the forehead
  g.save(); g.clip(hp); blob(g, 0, -214, 170, 22, 'rgba(30,14,10,.4)', 12); g.restore();

  // ---------------------------------------------------------------- rim light on the shadow side
  g.save(); g.filter = 'blur(3px)'; g.strokeStyle = `rgba(${rim},.55)`; g.lineWidth = 4;
  g.beginPath(); g.moveTo(170, -210); g.bezierCurveTo(194, -150, 202, -50, 204, 10); g.bezierCurveTo(202, 70, 182, 130, 160, 176); g.bezierCurveTo(140, 200, 122, 214, 110, 222); g.stroke();
  g.strokeStyle = `rgba(${rim},.35)`; g.beginPath(); g.moveTo(130, 320); g.bezierCurveTo(280, 330, 420, 390, 440, 560); g.stroke();
  g.restore();
  g.restore();
};

/** render a face to an offscreen canvas and return a luminance sampler (0..1) for the stylised versions */
const CACHE = new Map<string, { w: number; h: number; d: Uint8ClampedArray }>();
export const faceLum = (p: FaceP, w = 600, h = 760) => {
  const k = JSON.stringify(p) + w + 'x' + h;
  let c = CACHE.get(k);
  if (!c) {
    const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
    const g = cv.getContext('2d')!;
    g.fillStyle = '#000'; g.fillRect(0, 0, w, h);
    drawFace(g, w / 2, h * 0.43, w / 760, p);
    c = { w, h, d: g.getImageData(0, 0, w, h).data };
    if (CACHE.size > 40) CACHE.clear();
    CACHE.set(k, c);
  }
  const cc = c;
  return (x: number, y: number) => {   // x, y in 0..1
    const i = ((Math.min(cc.h - 1, Math.max(0, (y * cc.h) | 0)) * cc.w) + Math.min(cc.w - 1, Math.max(0, (x * cc.w) | 0))) * 4;
    return (0.3 * cc.d[i] + 0.59 * cc.d[i + 1] + 0.11 * cc.d[i + 2]) / 255;
  };
};

/** engraving: horizontal lines whose weight follows the light, like a banknote portrait, in gold on black */
export const engraving = (g: G, x0: number, y0: number, w: number, h: number, p: FaceP, col = '240,200,130', gap = 5, a = 1) => {
  const L = faceLum(p);
  g.save(); g.fillStyle = `rgba(${col},${a})`;
  for (let y = 0; y < h; y += gap) {
    for (let x = 0; x < w; x += 2) {
      const u = x / w, v = y / h;
      const wave = Math.sin(u * 9 + v * 3) * 0.004 - 0.018 * Math.cos((u - 0.5) * Math.PI) * (v < 0.62 ? 1 : 0.3);   // lines swell and bend around the head, like a cut portrait
      const l = L(u, v + wave);
      const t = Math.pow(l, 0.85) * gap * 0.92 * (v > 0.78 ? Math.max(0, 1 - (v - 0.78) / 0.2) : 1);   // shoulders fade into the dark
      if (t > 0.25) g.fillRect(x0 + x, y0 + y - t / 2, 2.2, t);
    }
  }
  g.restore();
};

/** particles: the face as gold dust, brighter where the light falls; `scatter` 0..1 blows it apart */
export const particles = (g: G, x0: number, y0: number, w: number, h: number, p: FaceP, T = 0, scatter = 0, col = '255,214,140', step = 5) => {
  const L = faceLum(p);
  g.save(); g.globalCompositeOperation = 'lighter';
  for (let y = 0; y < h; y += step) for (let x = 0; x < w; x += step) {
    const l = L(x / w, y / h); if (l < 0.06) continue;
    const r = Math.sin((x * 12.99 + y * 78.23)) * 43758.5; const q = r - Math.floor(r);
    if (q > l * 1.6) continue;
    const dx = scatter * (q - 0.5) * 900 + Math.sin(T * 1.3 + q * 20) * 0.8, dy = scatter * ((r * 7) % 1 - 0.5) * 700;
    g.fillStyle = `rgba(${col},${Math.min(1, 0.25 + l) * (1 - scatter * 0.7)})`;
    g.beginPath(); g.arc(x0 + x + dx, y0 + y + dy, 0.6 + 1.9 * l, 0, 6.3); g.fill();
  }
  g.restore();
};

/** line portrait: only the features that carry the judgement (brows, eyes, mouth) in one gold line */
export const lineFace = (g: G, cx: number, cy: number, s: number, p: FaceP = {}, col = '241,197,109') => {
  const t = p.trust ?? 0, brow = p.brow ?? t, mouth = p.mouth ?? t * 0.9, open = p.open ?? 1 + 0.18 * t;
  g.save(); g.translate(cx, cy); g.scale(s, s);
  g.strokeStyle = `rgba(${col},.95)`; g.lineWidth = 3; g.lineCap = 'round'; g.lineJoin = 'round';
  g.save(); g.strokeStyle = `rgba(${col},.35)`; g.lineWidth = 2; g.beginPath(); headPath(g); g.stroke(); g.restore();
  [-1, 1].forEach((sd) => {
    const ey = -40, up = 19 * open, lo = 9;
    g.beginPath(); g.moveTo(sd * 40, ey + 2); g.bezierCurveTo(sd * 60, ey - up, sd * 94, ey - up, sd * 120, ey - 2); g.bezierCurveTo(sd * 96, ey + lo, sd * 58, ey + lo, sd * 40, ey + 2); g.stroke();
    g.fillStyle = `rgba(${col},.95)`; g.beginPath(); g.arc(sd * 80, ey - 1, 9, 0, 6.3); g.fill();
    g.beginPath(); g.moveTo(sd * 38, -86 - 14 * brow); g.quadraticCurveTo(sd * 84, -110 - 4 * brow, sd * 136, -90 + 4 * Math.max(0, -brow)); g.stroke();
  });
  g.beginPath(); g.moveTo(-4, -40); g.quadraticCurveTo(-10, 60, 6, 96); g.quadraticCurveTo(-8, 106, -22, 100); g.stroke();
  g.beginPath(); for (let x = -60; x <= 60; x += 3) { const y = 152 - 13 * mouth * (x / 60) ** 2 + (mouth > 0 ? 4 * mouth : 0); x === -60 ? g.moveTo(x, y) : g.lineTo(x, y); } g.stroke();
  g.restore();
};
