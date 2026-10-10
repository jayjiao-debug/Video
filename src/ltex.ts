/* Canvas textures for 《你买的不是包》. Everything drawn in code; no brand marks anywhere. */
import * as THREE from 'three';
import { canvasTex, hash } from './tex';

const rnd = (() => { let s = 11; return () => { s = (s * 16807) % 2147483647; return s / 2147483647; }; })();

/** pebbled calf leather: colour map and a matching bump map */
export const leatherTex = (base: string) => {
  const draw = (g: CanvasRenderingContext2D, bump: boolean) => {
    g.fillStyle = bump ? '#808080' : base; g.fillRect(0, 0, 1024, 1024);
    for (let i = 0; i < 26000; i++) {
      const x = rnd() * 1024, y = rnd() * 1024, r = 2 + rnd() * 5;
      if (bump) { const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, 'rgba(255,255,255,0.5)'); gr.addColorStop(1, 'rgba(0,0,0,0.25)'); g.fillStyle = gr; }
      else g.fillStyle = rnd() < 0.5 ? `rgba(0,0,0,${rnd() * 0.08})` : `rgba(255,230,210,${rnd() * 0.05})`;
      g.beginPath(); g.arc(x, y, r, 0, 7); g.fill();
    }
  };
  const map = canvasTex(1024, 1024, (g) => draw(g, false)), bump = canvasTex(1024, 1024, (g) => draw(g, true), false);
  for (const t of [map, bump]) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(3, 3); }
  return { map, bump };
};

/** polished stone: dark marble (veins) or warm travertine (bands, pores) */
export const stoneTex = (kind: 'marble' | 'travertine') => {
  const t = canvasTex(2048, 2048, (g) => {
    if (kind === 'marble') {
      g.fillStyle = '#0d0d0f'; g.fillRect(0, 0, 2048, 2048);
      for (let v = 0; v < 26; v++) {
        let x = rnd() * 2048, y = 0; g.strokeStyle = `rgba(220,215,205,${0.05 + rnd() * 0.22})`; g.lineWidth = 0.6 + rnd() * 3; g.beginPath(); g.moveTo(x, y);
        while (y < 2048) { x += (rnd() - 0.5) * 70; y += 20 + rnd() * 40; g.lineTo(x, y); } g.stroke();
      }
    } else {
      g.fillStyle = '#b9a88e'; g.fillRect(0, 0, 2048, 2048);
      for (let y = 0; y < 2048; y += 3) { g.fillStyle = `rgba(${120 + rnd() * 60},${100 + rnd() * 50},${70 + rnd() * 40},${0.06 + 0.08 * Math.sin(y * 0.02 + rnd())})`; g.fillRect(0, y, 2048, 3); }
      for (let i = 0; i < 3000; i++) { g.fillStyle = `rgba(70,55,35,${0.2 + rnd() * 0.3})`; g.fillRect(rnd() * 2048, rnd() * 2048, 2 + rnd() * 10, 1 + rnd() * 2); }
    }
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
};

/** a paper tag / card with text (price, waiting list…) */
export const cardTex = (lines: [string, number, string?][], w = 512, h = 320, bg = '#f1ebdf', ink = '#1d1a16') => canvasTex(w, h, (g) => {
  g.fillStyle = bg; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 1500; i++) { g.fillStyle = `rgba(0,0,0,${rnd() * 0.04})`; g.fillRect(rnd() * w, rnd() * h, 2, 2); }
  g.strokeStyle = 'rgba(0,0,0,0.25)'; g.lineWidth = 2; g.strokeRect(12, 12, w - 24, h - 24);
  g.textAlign = 'center'; g.fillStyle = ink;
  let y = 0; const total = lines.reduce((s, l) => s + l[1] * 1.25, 0); y = (h - total) / 2;
  for (const [txt, size, font] of lines) { y += size; g.font = font ?? `700 ${size}px "Cormorant Garamond", "Noto Serif CJK SC", serif`; g.fillText(txt, w / 2, y); y += size * 0.25; }
});

/** standing people as flat shapes (head, shoulders, long coat), seen through frosted glass; no faces, no limbs moving */
export const silhouetteTex = () => canvasTex(1024, 512, (g) => {
  g.clearRect(0, 0, 1024, 512); g.filter = 'blur(7px)';
  const person = (cx: number, s: number, lean: number) => {
    g.save(); g.translate(cx, 512); g.scale(s, s); g.rotate(lean);
    g.fillStyle = 'rgba(8,8,10,0.92)';
    g.beginPath(); g.ellipse(0, -430, 26, 32, 0, 0, 7); g.fill();                         // head
    g.beginPath(); g.moveTo(-62, -370); g.quadraticCurveTo(0, -395, 62, -370);              // shoulders
    g.lineTo(70, -180); g.lineTo(52, 0); g.lineTo(-52, 0); g.lineTo(-70, -180); g.closePath(); g.fill();
    g.restore();
  };
  [[120, 1.0, 0.0], [260, 0.92, 0.02], [390, 1.05, -0.01], [520, 0.88, 0.0], [640, 0.98, 0.015], [770, 0.9, -0.02], [900, 1.02, 0.0]].forEach(([x, s, l]) => person(x, s, l));
});

/** a rolled steel shutter */
export const shutterTex = () => {
  const t = canvasTex(512, 512, (g) => {
    for (let y = 0; y < 512; y += 16) { const gr = g.createLinearGradient(0, y, 0, y + 16); gr.addColorStop(0, '#5a5c60'); gr.addColorStop(0.5, '#2c2e31'); gr.addColorStop(1, '#141517'); g.fillStyle = gr; g.fillRect(0, y, 512, 16); }
    for (let i = 0; i < 400; i++) { g.fillStyle = `rgba(110,70,40,${rnd() * 0.18})`; g.fillRect(rnd() * 512, rnd() * 512, 4 + rnd() * 30, 2); }
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(4, 4); return t;
};

/** cracked plaster for the workshop wall */
export const plasterTex = () => {
  const t = canvasTex(1024, 1024, (g) => {
    g.fillStyle = '#4b4136'; g.fillRect(0, 0, 1024, 1024);
    for (let i = 0; i < 20000; i++) { g.fillStyle = rnd() < 0.5 ? `rgba(0,0,0,${rnd() * 0.1})` : `rgba(255,235,200,${rnd() * 0.05})`; g.fillRect(rnd() * 1024, rnd() * 1024, 3, 3); }
    g.strokeStyle = 'rgba(20,14,8,0.5)'; g.lineWidth = 1.5;
    for (let c = 0; c < 9; c++) { let x = rnd() * 1024, y = rnd() * 1024; g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 12; k++) { x += (rnd() - 0.5) * 60; y += rnd() * 40; g.lineTo(x, y); } g.stroke(); }
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(2, 1); return t;
};
export { hash };
