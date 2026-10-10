/* Canvas textures for 《调到那个台》: everything drawn in code. */
import * as THREE from 'three';

export const canvasTex = (w: number, h: number, draw: (g: CanvasRenderingContext2D) => void, srgb = true) => {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d')!);
  const t = new THREE.CanvasTexture(c); if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
};
/** deterministic noise */
export const hash = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
const rnd = (() => { let s = 7; return () => { s = (s * 16807) % 2147483647; return s / 2147483647; }; })();

/** walnut veneer: dark base, long figured grain, a few darker streaks */
export const walnutTex = () => canvasTex(2048, 1024, (g) => {
  const gr = g.createLinearGradient(0, 0, 0, 1024); gr.addColorStop(0, '#4a2a16'); gr.addColorStop(0.5, '#5c3519'); gr.addColorStop(1, '#43240f');
  g.fillStyle = gr; g.fillRect(0, 0, 2048, 1024);
  for (let i = 0; i < 520; i++) {
    const y0 = rnd() * 1024, amp = 6 + rnd() * 26, f = 0.002 + rnd() * 0.004, ph = rnd() * 6.28, dark = rnd() < 0.55;
    g.strokeStyle = dark ? `rgba(28,14,6,${0.08 + rnd() * 0.22})` : `rgba(150,92,48,${0.05 + rnd() * 0.12})`;
    g.lineWidth = 0.6 + rnd() * 2.6; g.beginPath();
    for (let x = 0; x <= 2048; x += 8) { const y = y0 + Math.sin(x * f + ph) * amp + Math.sin(x * f * 3.1 + ph * 2) * amp * 0.25; x ? g.lineTo(x, y) : g.moveTo(x, y); }
    g.stroke();
  }
  // figure: a few cathedral arches in the middle
  for (let k = 0; k < 14; k++) { g.strokeStyle = `rgba(30,15,6,${0.12 + k * 0.01})`; g.lineWidth = 2; g.beginPath(); g.ellipse(1024, 620, 900 - k * 55, 220 - k * 14, 0, Math.PI, 2 * Math.PI); g.stroke(); }
});

/** woven speaker cloth: a twill of warm threads with a fine gold stripe */
export const clothTex = () => {
  const t = canvasTex(512, 512, (g) => {
    g.fillStyle = '#5a4126'; g.fillRect(0, 0, 512, 512);
    for (let y = 0; y < 512; y += 4) for (let x = 0; x < 512; x += 4) {
      const on = ((x / 4 + y / 4) % 4) < 2; const v = on ? 0.16 : -0.1; const n = (hash(x * 3.1 + y * 7.7) - 0.5) * 0.12;
      g.fillStyle = v + n > 0 ? `rgba(214,170,110,${(v + n) * 0.9})` : `rgba(20,12,4,${-(v + n) * 1.2})`; g.fillRect(x, y, 4, 4);
    }
    for (let x = 0; x < 512; x += 64) { g.fillStyle = 'rgba(232,190,110,0.28)'; g.fillRect(x, 0, 3, 512); }
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(2, 2); return t;
};

/** the tuning dial: cream glass printed with two bands, ticks, and the band names; drawn once, lit from behind */
export const DIAL = { w: 2048, h: 1024, x0: 170, x1: 1878 };
export const dialTex = (glow = false) => canvasTex(DIAL.w, DIAL.h, (g) => {
  const W = DIAL.w, H = DIAL.h;
  const gr = g.createRadialGradient(W / 2, H / 2, 50, W / 2, H / 2, W * 0.62); gr.addColorStop(0, '#f6ead0'); gr.addColorStop(1, '#d9c39a');
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
  g.strokeStyle = 'rgba(60,40,20,0.85)'; g.lineWidth = 6; g.strokeRect(40, 40, W - 80, H - 80);
  g.lineWidth = 2; g.strokeRect(62, 62, W - 124, H - 124);
  const band = (y: number, nums: string[], label: string, sub: string) => {
    g.strokeStyle = 'rgba(50,30,14,0.9)'; g.lineWidth = 4; g.beginPath(); g.moveTo(DIAL.x0, y); g.lineTo(DIAL.x1, y); g.stroke();
    for (let i = 0; i <= 80; i++) { const x = DIAL.x0 + (i / 80) * (DIAL.x1 - DIAL.x0), big = i % 10 === 0, mid = i % 5 === 0;
      g.lineWidth = big ? 5 : 2.5; g.beginPath(); g.moveTo(x, y); g.lineTo(x, y - (big ? 70 : mid ? 46 : 26)); g.stroke(); }
    g.fillStyle = 'rgba(45,26,12,0.95)'; g.font = '700 74px "Cormorant Garamond", Georgia, serif'; g.textAlign = 'center';
    nums.forEach((n, i) => g.fillText(n, DIAL.x0 + (i / (nums.length - 1)) * (DIAL.x1 - DIAL.x0), y + 92));
    g.textAlign = 'left'; g.font = '900 54px "Noto Serif CJK SC", serif'; g.fillText(label, 96, y - 92);
    g.font = '600 40px "Cormorant Garamond", Georgia, serif'; g.fillStyle = 'rgba(45,26,12,0.6)'; g.fillText(sub, 96 + 130, y - 94);
  };
  band(380, ['55', '60', '70', '80', '100', '120', '140', '160'], '中波', 'MW · ×10 kHz');
  band(790, ['6', '7', '8', '9', '11', '13', '15', '17'], '短波', 'SW · MHz');
  // a fine hairline between the bands
  g.strokeStyle = 'rgba(160,110,40,0.5)'; g.lineWidth = 2; g.beginPath(); g.moveTo(DIAL.x0, 560); g.lineTo(DIAL.x1, 560); g.stroke();
  g.fillStyle = 'rgba(160,110,40,0.85)'; g.font = '600 38px "Cormorant Garamond", Georgia, serif'; g.textAlign = 'center'; g.fillText('◆', W / 2, 574);
  if (glow) {
    // two pilot lamps behind the glass: the light pools around them and falls off between and toward the edges
    g.globalCompositeOperation = 'multiply';
    const m = g.createLinearGradient(0, 0, W, 0); m.addColorStop(0, '#2a1a0c'); m.addColorStop(0.2, '#ffffff'); m.addColorStop(0.5, '#8a6a4a'); m.addColorStop(0.8, '#ffffff'); m.addColorStop(1, '#2a1a0c');
    g.fillStyle = m; g.fillRect(0, 0, W, H);
    const v = g.createLinearGradient(0, 0, 0, H); v.addColorStop(0, '#6a5038'); v.addColorStop(0.45, '#ffffff'); v.addColorStop(1, '#6a5038');
    g.fillStyle = v; g.fillRect(0, 0, W, H);
    g.globalCompositeOperation = 'source-over';
  } else {
    // dust and a thumb smear on the glass
    for (let i = 0; i < 900; i++) { g.fillStyle = `rgba(90,60,30,${rnd() * 0.12})`; g.beginPath(); g.arc(rnd() * W, rnd() * H, rnd() * 2.2, 0, 7); g.fill(); }
    const sm = g.createRadialGradient(W * 0.3, H * 0.7, 10, W * 0.3, H * 0.7, 260); sm.addColorStop(0, 'rgba(120,90,60,0.12)'); sm.addColorStop(1, 'rgba(120,90,60,0)'); g.fillStyle = sm; g.fillRect(0, 0, W, H);
  }
});

/**
 * The tuning eye (a 6E5C-style "magic eye", 电眼/猫眼): a green phosphor fan with a dark wedge.
 * gap = half-angle of the shadow wedge in radians (wide open ≈ 0.8, locked on ≈ 0.02); glow 0..1.
 */
export const eyeDraw = (g: CanvasRenderingContext2D, gap: number, glow: number) => {
  const S = 256, c = S / 2; g.clearRect(0, 0, S, S);
  g.fillStyle = '#05140c'; g.beginPath(); g.arc(c, c, c, 0, Math.PI * 2); g.fill();
  if (glow > 0.001) {
    const gr = g.createRadialGradient(c, c, c * 0.3, c, c, c * 0.98);
    gr.addColorStop(0, `rgba(160,255,190,${glow})`); gr.addColorStop(0.55, `rgba(70,230,120,${0.95 * glow})`); gr.addColorStop(1, `rgba(20,120,60,${0.6 * glow})`);
    g.fillStyle = gr; g.beginPath();
    const a0 = -Math.PI / 2 + gap, a1 = -Math.PI / 2 - gap + Math.PI * 2; // wedge at the top, the fan everywhere else
    g.moveTo(c, c); g.arc(c, c, c * 0.96, a0, a1); g.closePath(); g.fill();
    // the wedge edges are brighter (the fluorescence piles up at the edge of the shadow)
    g.strokeStyle = `rgba(200,255,215,${0.7 * glow})`; g.lineWidth = 3;
    for (const a of [a0, a1]) { g.beginPath(); g.moveTo(c + Math.cos(a) * c * 0.32, c + Math.sin(a) * c * 0.32); g.lineTo(c + Math.cos(a) * c * 0.95, c + Math.sin(a) * c * 0.95); g.stroke(); }
  }
  // the cap over the cathode
  const cg = g.createRadialGradient(c - 10, c - 10, 2, c, c, c * 0.32); cg.addColorStop(0, '#3b3f3a'); cg.addColorStop(1, '#0b0d0b');
  g.fillStyle = cg; g.beginPath(); g.arc(c, c, c * 0.3, 0, Math.PI * 2); g.fill();
};

/** night beyond the window: deep blue, a lit city far below, a few lit windows */
export const nightTex = () => canvasTex(1024, 1024, (g) => {
  const gr = g.createLinearGradient(0, 0, 0, 1024); gr.addColorStop(0, '#060a18'); gr.addColorStop(0.6, '#0d1730'); gr.addColorStop(1, '#1a2240');
  g.fillStyle = gr; g.fillRect(0, 0, 1024, 1024);
  for (let i = 0; i < 26; i++) { const x = rnd() * 1024, w = 40 + rnd() * 120, h = 200 + rnd() * 500; g.fillStyle = `rgba(4,6,14,${0.85 + rnd() * 0.15})`; g.fillRect(x, 1024 - h, w, h);
    for (let k = 0; k < h / 26; k++) for (let j = 0; j < w / 18; j++) if (rnd() < 0.18) { g.fillStyle = rnd() < 0.7 ? 'rgba(255,196,120,0.85)' : 'rgba(170,200,255,0.7)'; g.fillRect(x + 5 + j * 18, 1024 - h + 10 + k * 26, 8, 12); } }
  for (let i = 0; i < 120; i++) { g.fillStyle = `rgba(255,255,255,${rnd() * 0.5})`; g.fillRect(rnd() * 1024, rnd() * 420, 2, 2); }
});

/** plaster wall: warm grey, a faint damask stripe */
export const wallTex = () => {
  const t = canvasTex(512, 512, (g) => {
    g.fillStyle = '#4a4038'; g.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 9000; i++) { const v = rnd(); g.fillStyle = v < 0.5 ? `rgba(0,0,0,${rnd() * 0.08})` : `rgba(255,240,220,${rnd() * 0.04})`; g.fillRect(rnd() * 512, rnd() * 512, 2, 2); }
    for (let x = 0; x < 512; x += 128) { g.fillStyle = 'rgba(255,235,200,0.035)'; g.fillRect(x, 0, 48, 512); }
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(4, 2); return t;
};

/** desk top: a lighter oak, long grain */
export const oakTex = () => {
  const t = canvasTex(2048, 1024, (g) => {
    g.fillStyle = '#6a4a2c'; g.fillRect(0, 0, 2048, 1024);
    for (let i = 0; i < 700; i++) { const y0 = rnd() * 1024, amp = 3 + rnd() * 10, ph = rnd() * 6; g.strokeStyle = rnd() < 0.6 ? `rgba(40,24,10,${0.06 + rnd() * 0.16})` : `rgba(190,140,90,${0.04 + rnd() * 0.08})`; g.lineWidth = 0.6 + rnd() * 2;
      g.beginPath(); for (let x = 0; x <= 2048; x += 16) { const y = y0 + Math.sin(x * 0.0021 + ph) * amp; x ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); }
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
};

/** soft round sprite */
export const glowTex = (inner: string, outer: string) => canvasTex(256, 256, (g) => {
  const gr = g.createRadialGradient(128, 128, 0, 128, 128, 128); gr.addColorStop(0, inner); gr.addColorStop(1, outer); g.fillStyle = gr; g.fillRect(0, 0, 256, 256);
});

/** the wall clock's face */
export const clockTex = () => canvasTex(512, 512, (g) => {
  g.fillStyle = '#e8dcc2'; g.beginPath(); g.arc(256, 256, 250, 0, Math.PI * 2); g.fill();
  g.strokeStyle = '#2a1e12'; g.lineWidth = 6; g.beginPath(); g.arc(256, 256, 236, 0, Math.PI * 2); g.stroke();
  for (let i = 0; i < 60; i++) { const a = (i / 60) * Math.PI * 2, r0 = i % 5 ? 214 : 196; g.lineWidth = i % 5 ? 3 : 8; g.beginPath(); g.moveTo(256 + Math.sin(a) * r0, 256 - Math.cos(a) * r0); g.lineTo(256 + Math.sin(a) * 226, 256 - Math.cos(a) * 226); g.stroke(); }
  g.fillStyle = '#2a1e12'; g.font = '600 64px "Cormorant Garamond", Georgia, serif'; g.textAlign = 'center';
  [[12, 0], [3, 90], [6, 180], [9, 270]].forEach(([n, d]) => { const a = (d * Math.PI) / 180; g.fillText(String(n), 256 + Math.sin(a) * 158, 256 - Math.cos(a) * 158 + 22); });
});
