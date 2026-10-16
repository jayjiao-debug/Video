/* 《倒挂飞车》 world: one test site at dusk, drawn in world pixels (1 m ≈ 160 px), side view.
   The course, left to right in space but driven as one take:
     approach road (→) · the loop ramp (→ up → over) · the ceiling deck (← inverted) · drop, flip, land (←)
     · a row of parked vehicles to jump (←) · the floodlit apron where the car stops.
   Everything here is original: a generic hypercar, generic vehicles, a generic steel test rig. No logos. */
type G = CanvasRenderingContext2D;
const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const rnd = (i: number, k = 0) => { const x = Math.sin(i * 127.1 + k * 311.7 + 0.5) * 43758.5453; return x - Math.floor(x); };

export const M = 160;                 // px per metre
export const R = 1500;                // loop radius (running surface), ≈ 9.4 m
export const DECK_END = -2300;        // where the ceiling deck stops
export const RW = 60, WB = 440;       // wheel radius, wheelbase
export const GOLD = '255,214,140', CYAN = '140,220,255', RED = '255,107,94', WARM = '255,184,110';

/* ---------------------------------------------------------------- the track as one path, by arc length s
   s < 0: the approach road (→); 0..πR: the loop (→ up → over); beyond: the ceiling deck (←). */
export const S_TOP = Math.PI * R, S_END = S_TOP + (0 - DECK_END);
export type TP = { x: number; y: number; tx: number; ty: number; nx: number; ny: number };
export const trackAt = (s: number): TP => {
  if (s <= 0) return { x: s, y: 0, tx: 1, ty: 0, nx: 0, ny: -1 };
  if (s <= S_TOP) { const f = s / R; return { x: R * Math.sin(f), y: -R + R * Math.cos(f), tx: Math.cos(f), ty: -Math.sin(f), nx: -Math.sin(f), ny: -Math.cos(f) }; }
  return { x: -(s - S_TOP), y: -2 * R, tx: -1, ty: 0, nx: 0, ny: 1 };
};
/** the car standing on the track at s: both wheel centres sit exactly one wheel radius off the surface */
export type Pose = { x: number; y: number; a: number; w1: [number, number]; w2: [number, number] };
export const poseOnTrack = (s: number): Pose => {
  const f = trackAt(s + WB / 2), r = trackAt(s - WB / 2);
  const w1: [number, number] = [f.x + f.nx * RW, f.y + f.ny * RW], w2: [number, number] = [r.x + r.nx * RW, r.y + r.ny * RW];
  return { x: (w1[0] + w2[0]) / 2, y: (w1[1] + w2[1]) / 2, a: Math.atan2(w1[1] - w2[1], w1[0] - w2[0]), w1, w2 };
};
/** a free pose (in the air or on the ground): wheel centres follow the body */
export const freePose = (x: number, y: number, a: number): Pose => {
  const c = Math.cos(a), s = Math.sin(a);
  return { x, y, a, w1: [x + c * WB / 2, y + s * WB / 2], w2: [x - c * WB / 2, y - s * WB / 2] };
};

/* ---------------------------------------------------------------- sky and far layers (screen space + parallax) */
export const sky = (g: G, W: number, H: number, cy: number, dusk = 1) => {
  // cy: where the horizon sits on screen
  const s = g.createLinearGradient(0, cy - 1400, 0, cy + 40);
  s.addColorStop(0, '#060a1c'); s.addColorStop(0.45, '#141a3c'); s.addColorStop(0.72, '#3b2c55'); s.addColorStop(0.9, `rgba(${Math.round(lerp(120, 214, dusk))},${Math.round(lerp(70, 118, dusk))},74,1)`); s.addColorStop(1, '#f0a35e');
  g.fillStyle = s; g.fillRect(0, 0, W, H);
  // stars, sparse and faint, only high up
  for (let i = 0; i < 160; i++) {
    const x = rnd(i, 1) * W, y = cy - 300 - rnd(i, 2) * 1400; if (y < -10 || y > H) continue;
    g.fillStyle = `rgba(230,236,255,${0.15 + 0.5 * rnd(i, 3) * clamp((cy - 300 - y) / 600)})`; g.fillRect(x, y, 1.6, 1.6);
  }
  // a long thin cloud band catching the last light
  g.save(); g.globalAlpha = 0.5;
  for (let k = 0; k < 4; k++) {
    const yy = cy - 160 - k * 70, cg = g.createLinearGradient(0, yy - 8, 0, yy + 8);
    cg.addColorStop(0, 'rgba(255,170,120,0)'); cg.addColorStop(0.5, `rgba(255,${150 + k * 10},120,${0.35 - k * 0.07})`); cg.addColorStop(1, 'rgba(255,170,120,0)');
    g.fillStyle = cg; g.beginPath(); g.ellipse(W * (0.3 + 0.2 * k), yy, W * 0.5, 9 - k, 0, 0, 7); g.fill();
  }
  g.restore();
};
/** mesas on the horizon; px = camera x for parallax */
export const mesas = (g: G, W: number, cy: number, px: number) => {
  const off = -px * 0.06;
  g.fillStyle = '#1d1838';
  g.beginPath(); g.moveTo(-50, cy + 10);
  for (let x = -50; x <= W + 50; x += 20) { const u = (x - off) * 0.004; const h = 40 + 30 * Math.sin(u) + 18 * Math.sin(u * 2.7 + 1) + (Math.sin(u * 0.6) > 0.55 ? 34 : 0); g.lineTo(x, cy - h); }
  g.lineTo(W + 50, cy + 10); g.closePath(); g.fill();
  g.fillStyle = '#141130'; g.beginPath(); g.moveTo(-50, cy + 10);
  for (let x = -50; x <= W + 50; x += 16) { const u = (x - off * 1.8) * 0.006; g.lineTo(x, cy - 18 - 12 * Math.sin(u * 1.3) - 8 * Math.sin(u * 3.1)); }
  g.lineTo(W + 50, cy + 10); g.closePath(); g.fill();
};

/* ---------------------------------------------------------------- world-space set pieces */
/** floodlight mast with a warm volumetric beam (world space; call inside the camera transform) */
export const mast = (g: G, x: number, h = 2600, beamTo: [number, number] | null = null, on = 1) => {
  g.fillStyle = '#0d0f17'; g.fillRect(x - 10, -h, 20, h);
  for (let y = -h + 60; y < 0; y += 90) { g.strokeStyle = 'rgba(30,34,48,1)'; g.lineWidth = 3; g.beginPath(); g.moveTo(x - 10, y); g.lineTo(x + 10, y + 90); g.stroke(); }
  g.fillStyle = '#12141c'; g.fillRect(x - 90, -h - 40, 180, 50);
  for (let i = 0; i < 4; i++) { g.save(); g.globalCompositeOperation = 'lighter'; const lx = x - 66 + i * 44; const r = g.createRadialGradient(lx, -h - 15, 0, lx, -h - 15, 60); r.addColorStop(0, `rgba(255,236,200,${on})`); r.addColorStop(1, 'rgba(255,200,140,0)'); g.fillStyle = r; g.fillRect(lx - 60, -h - 75, 120, 120); g.restore(); }
  if (beamTo && on > 0) {
    g.save(); g.globalCompositeOperation = 'lighter';
    const [bx, by] = beamTo, dx = bx - x, dy = by + h, L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L, w0 = 60, w1 = 0.38 * L;
    const bg = g.createLinearGradient(x, -h, bx, by); bg.addColorStop(0, `rgba(255,214,160,${0.16 * on})`); bg.addColorStop(1, 'rgba(255,190,120,0)');
    g.fillStyle = bg; g.beginPath();
    g.moveTo(x - uy * w0, -h + ux * w0); g.lineTo(bx - uy * w1, by + ux * w1); g.lineTo(bx + uy * w1, by - ux * w1); g.lineTo(x + uy * w0, -h - ux * w0); g.closePath(); g.fill();
    g.restore();
  }
};
/** concrete apron with seams, tyre marks and a warm pool under each mast */
export const ground = (g: G, x0: number, x1: number, pools: number[] = []) => {
  const gr = g.createLinearGradient(0, 0, 0, 900); gr.addColorStop(0, '#3a3440'); gr.addColorStop(0.15, '#24202b'); gr.addColorStop(1, '#0d0b12');
  g.fillStyle = gr; g.fillRect(x0, 0, x1 - x0, 1200);
  g.fillStyle = 'rgba(255,220,180,.10)'; g.fillRect(x0, 0, x1 - x0, 3);
  for (let x = Math.floor(x0 / 600) * 600; x < x1; x += 600) { g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(x, 0, 3, 140); }
  g.save(); g.globalAlpha = 0.18; g.strokeStyle = '#0a090d'; g.lineWidth = 16;
  for (let k = 0; k < 2; k++) { g.beginPath(); g.moveTo(x0, 24 + k * 30); for (let x = x0; x < x1; x += 200) g.lineTo(x, 24 + k * 30 + 4 * Math.sin(x * 0.003 + k)); g.stroke(); }
  g.restore();
  for (const px of pools) { g.save(); g.globalCompositeOperation = 'lighter'; g.translate(px, 60); g.scale(1, 0.16); const r = g.createRadialGradient(0, 0, 0, 0, 0, 1300); r.addColorStop(0, 'rgba(255,190,120,.30)'); r.addColorStop(1, 'rgba(255,170,100,0)'); g.fillStyle = r; g.fillRect(-1300, -1300, 2600, 2600); g.restore(); }
};
/** the loop ramp and the ceiling deck: a steel band (the running surface on the inside), radial ribs, an outer truss
    ring, legs to the ground, and cool LED strips along the running edge. */
export const rig = (g: G, T: number) => {
  const C = [0, -R] as const, band = 96, outer = R + 360;
  // legs and bracing behind
  g.strokeStyle = '#151824'; g.lineWidth = 34;
  for (const [x, y] of [[R + 200, -R + 200], [R + 120, -R - 600], [-600, -2 * R - 200], [-1700, -2 * R - 200]] as [number, number][]) { g.beginPath(); g.moveTo(x, y); g.lineTo(x + (x > 0 ? 260 : 0), 0); g.stroke(); }
  // outer truss ring (only the half that exists: bottom → right → top)
  g.strokeStyle = '#1b1f2d'; g.lineWidth = 18;
  g.beginPath(); for (let f = 0; f <= Math.PI + 1e-6; f += Math.PI / 60) { const x = C[0] + outer * Math.sin(f), y = C[1] + outer * Math.cos(f); f ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke();
  // ribs and diagonals
  g.lineWidth = 9;
  for (let i = 0; i <= 24; i++) {
    const f = (i / 24) * Math.PI, f2 = ((i + 1) / 24) * Math.PI;
    const a = [C[0] + (R + band) * Math.sin(f), C[1] + (R + band) * Math.cos(f)], b = [C[0] + outer * Math.sin(f), C[1] + outer * Math.cos(f)];
    g.strokeStyle = '#20263a'; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke();
    if (i < 24) { const c = [C[0] + outer * Math.sin(f2), C[1] + outer * Math.cos(f2)]; g.strokeStyle = '#191d2c'; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(c[0], c[1]); g.stroke(); }
  }
  // the ceiling deck's truss
  g.strokeStyle = '#1b1f2d'; g.lineWidth = 16; g.beginPath(); g.moveTo(0, -2 * R - outer + R); g.lineTo(DECK_END, -2 * R - outer + R); g.stroke();
  g.lineWidth = 9; for (let x = 0; x >= DECK_END; x -= 230) { g.strokeStyle = '#20263a'; g.beginPath(); g.moveTo(x, -2 * R - band); g.lineTo(x, -2 * R - 330); g.stroke(); g.strokeStyle = '#191d2c'; g.beginPath(); g.moveTo(x, -2 * R - band); g.lineTo(x - 230, -2 * R - 330); g.stroke(); }
  // the steel band itself, with a warm top-light gradient
  const steel = (draw: () => void) => {
    g.save(); draw(); g.clip();
    const sg = g.createLinearGradient(0, -2 * R - 200, 0, 0); sg.addColorStop(0, '#5a5f70'); sg.addColorStop(0.5, '#3a3e4c'); sg.addColorStop(1, '#2a2d38');
    g.fillStyle = sg; g.fillRect(-R - 3000, -2 * R - 600, 2 * R + 6000, 2 * R + 800);
    g.restore();
  };
  steel(() => { g.beginPath(); for (let f = 0; f <= Math.PI + 1e-6; f += Math.PI / 120) g.lineTo(C[0] + R * Math.sin(f), C[1] + R * Math.cos(f)); for (let f = Math.PI; f >= -1e-6; f -= Math.PI / 120) g.lineTo(C[0] + (R + band) * Math.sin(f), C[1] + (R + band) * Math.cos(f)); g.closePath(); });
  steel(() => { g.beginPath(); g.rect(DECK_END, -2 * R - band, -DECK_END, band); });
  // panel seams across the band
  g.strokeStyle = 'rgba(10,12,18,.7)'; g.lineWidth = 3;
  for (let i = 1; i < 48; i++) { const f = (i / 48) * Math.PI; g.beginPath(); g.moveTo(C[0] + R * Math.sin(f), C[1] + R * Math.cos(f)); g.lineTo(C[0] + (R + band) * Math.sin(f), C[1] + (R + band) * Math.cos(f)); g.stroke(); }
  for (let x = -100; x > DECK_END; x -= 100) { g.beginPath(); g.moveTo(x, -2 * R); g.lineTo(x, -2 * R - band); g.stroke(); }
  // the running edge: a bright lip and a row of cool LEDs (a soft glow, not dots)
  g.save(); g.globalCompositeOperation = 'lighter';
  const edge = () => { g.beginPath(); g.moveTo(-600, 0); g.lineTo(0, 0); for (let f = 0; f <= Math.PI + 1e-6; f += Math.PI / 120) g.lineTo(C[0] + R * Math.sin(f), C[1] + R * Math.cos(f)); g.lineTo(DECK_END, -2 * R); };
  g.strokeStyle = `rgba(${CYAN},.10)`; g.lineWidth = 26; edge(); g.stroke();
  g.strokeStyle = `rgba(${CYAN},.55)`; g.lineWidth = 3; edge(); g.stroke();
  g.restore();
  // end of the deck: a cut steel edge with a warning stripe
  g.fillStyle = '#2a2d38'; g.fillRect(DECK_END - 6, -2 * R - band - 10, 12, band + 20);
  for (let i = 0; i < 4; i++) { g.fillStyle = i % 2 ? '#1a1a1a' : '#d9a640'; g.fillRect(DECK_END - 6, -2 * R - band + i * (band / 4), 12, band / 4); }
};

/* ---------------------------------------------------------------- the hero car (original design), local frame:
   origin between the wheel centres, +x forward, +y towards the road. Low, long, a set-back bubble canopy, a ducktail. */
const BODY: [number, number][] = [
  [356, 38], [372, 14], [366, -6], [330, -20], [240, -38], [150, -52], [92, -60], [40, -98], [-20, -120], [-80, -122], [-150, -106],
  [-230, -86], [-310, -72], [-372, -70], [-380, -54], [-378, -12], [-352, 30], [-300, 42], [300, 42],
];
const bodyPath = (g: G) => { g.beginPath(); BODY.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); };
const wheel = (g: G, x: number, y: number, spin: number, xray = 0) => {
  g.save(); g.translate(x, y);
  g.fillStyle = xray ? `rgba(10,16,26,${1 - 0.7 * xray})` : '#0b0b0e'; g.beginPath(); g.arc(0, 0, RW, 0, 7); g.fill();
  g.strokeStyle = 'rgba(80,84,96,.6)'; g.lineWidth = 2; g.beginPath(); g.arc(0, 0, 52, 0, 7); g.stroke();
  const rg = g.createRadialGradient(-12, -14, 4, 0, 0, 46); rg.addColorStop(0, '#c9ced8'); rg.addColorStop(0.6, '#6a707d'); rg.addColorStop(1, '#2c2f37');
  g.fillStyle = rg; g.beginPath(); g.arc(0, 0, 46, 0, 7); g.fill();
  g.rotate(spin); g.strokeStyle = '#1b1d24'; g.lineWidth = 7;
  for (let k = 0; k < 5; k++) { g.rotate((Math.PI * 2) / 5); g.beginPath(); g.moveTo(0, 8); g.lineTo(0, 38); g.stroke(); }
  g.rotate(-spin); g.fillStyle = '#d6a64a'; g.fillRect(14, -30, 14, 22);  // caliper
  g.fillStyle = '#26282f'; g.beginPath(); g.arc(0, 0, 9, 0, 7); g.fill();
  if (xray) { g.strokeStyle = `rgba(${CYAN},${0.8 * xray})`; g.lineWidth = 2; g.beginPath(); g.arc(0, 0, RW, 0, 7); g.stroke(); }
  g.restore();
};
export type CarOpts = { spin?: number; xray?: number; rim?: number; fans?: number; tanks?: number; nozzles?: number; T?: number; sy?: number; under?: number };
/** draw the car at a pose (world space). rim: warm rim light amount; xray 0..1 fades the body to a blueprint. */
export const car = (g: G, p: Pose, o: CarOpts = {}) => {
  const xr = o.xray ?? 0, T = o.T ?? 0;
  const sy = o.sy ?? 1;
  g.save(); g.translate(p.x, p.y); g.rotate(p.a); g.scale(1, sy);
  // contact shadow only when on a surface is handled by the caller
  // body
  g.save(); bodyPath(g);
  const bg = g.createLinearGradient(0, -122, 0, 42); bg.addColorStop(0, '#4b5160'); bg.addColorStop(0.35, '#2a2e38'); bg.addColorStop(1, '#101217');
  g.globalAlpha = 1 - 0.82 * xr; g.fillStyle = bg; g.fill();
  g.globalAlpha = 1;
  // side sculpt: a darker lower flank and an air intake behind the door
  g.clip();
  const ink = 1 - xr;
  // the dusk sky reflected in the upper body: purple above the shoulder, a band of horizon orange along it
  const rf = g.createLinearGradient(0, -122, 0, 10); rf.addColorStop(0, `rgba(120,100,170,${0.35 * ink})`); rf.addColorStop(0.45, `rgba(255,150,90,${0.32 * ink})`); rf.addColorStop(0.55, `rgba(255,190,130,${0.12 * ink})`); rf.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = rf; g.fillRect(-400, -130, 800, 140);
  g.fillStyle = `rgba(0,0,0,${0.45 * ink})`; g.beginPath(); g.moveTo(330, 8); g.quadraticCurveTo(0, -4, -360, -6); g.lineTo(-360, 50); g.lineTo(330, 50); g.closePath(); g.fill();
  // a crisp specular streak along the shoulder line
  const spec = g.createLinearGradient(-360, 0, 360, 0); spec.addColorStop(0, 'rgba(255,255,255,0)'); spec.addColorStop(0.35, `rgba(255,240,220,${0.55 * ink})`); spec.addColorStop(0.6, `rgba(255,240,220,${0.15 * ink})`); spec.addColorStop(1, 'rgba(255,255,255,0)');
  g.strokeStyle = spec; g.lineWidth = 3; g.beginPath(); g.moveTo(350, -10); g.quadraticCurveTo(0, -26, -370, -44); g.stroke();
  g.fillStyle = `rgba(6,7,10,${0.9 * ink})`; g.beginPath(); g.moveTo(-60, -40); g.quadraticCurveTo(-120, -48, -170, -30); g.lineTo(-150, 0); g.quadraticCurveTo(-100, -10, -70, -6); g.closePath(); g.fill();
  // panel lines: door cut and the nose vent
  g.strokeStyle = `rgba(0,0,0,${0.6 * ink})`; g.lineWidth = 2; g.beginPath(); g.moveTo(80, -54); g.quadraticCurveTo(70, -10, 84, 34); g.moveTo(-170, -88); g.quadraticCurveTo(-190, -30, -176, 30); g.stroke();
  g.fillStyle = `rgba(4,5,8,${0.8 * ink})`; g.beginPath(); g.moveTo(250, -32); g.lineTo(316, -22); g.lineTo(310, -16); g.lineTo(246, -26); g.closePath(); g.fill();
  // wheel wells: dark arches the tyres sit in
  for (const wx of [220, -220]) { g.fillStyle = `rgba(3,3,5,${ink})`; g.beginPath(); g.arc(wx, 4, 74, Math.PI, 2 * Math.PI); g.lineTo(wx + 74, 60); g.lineTo(wx - 74, 60); g.closePath(); g.fill(); }
  // warm rim from the floodlights along the top
  if ((o.rim ?? 1) > 0) { g.strokeStyle = `rgba(${WARM},${0.7 * (o.rim ?? 1) * ink})`; g.lineWidth = 4; g.beginPath(); for (let i = 2; i < 14; i++) { const [x, y] = BODY[i]; i === 2 ? g.moveTo(x, y + 2) : g.lineTo(x, y + 2); } g.stroke(); }
  g.restore();
  // the suction system's glow under the floor (it is what holds the car up)
  if ((o.under ?? 0) > 0) {
    g.save(); g.globalCompositeOperation = 'lighter';
    const ug = g.createLinearGradient(0, 30, 0, 70); ug.addColorStop(0, `rgba(${CYAN},${0.55 * (o.under ?? 0)})`); ug.addColorStop(1, `rgba(${CYAN},0)`);
    g.fillStyle = ug; g.beginPath(); g.ellipse(-20, 46, 300, 22, 0, 0, 7); g.fill(); g.restore();
  }
  // canopy glass
  g.save(); g.globalAlpha = 1 - 0.6 * xr;
  g.beginPath(); g.moveTo(88, -58); g.quadraticCurveTo(10, -122, -80, -116); g.quadraticCurveTo(-140, -104, -150, -96); g.quadraticCurveTo(-60, -70, 88, -58); g.closePath();
  const gg = g.createLinearGradient(-150, -120, 90, -60); gg.addColorStop(0, '#0a0f1c'); gg.addColorStop(0.55, '#1b2742'); gg.addColorStop(0.62, '#7d8db0'); gg.addColorStop(0.68, '#1b2742'); gg.addColorStop(1, '#0a0f1c');
  g.fillStyle = gg; g.fill(); g.restore();
  // gold pin line along the flank (the Juno thread)
  g.strokeStyle = `rgba(${GOLD},${0.85 * (1 - xr) + 0.2})`; g.lineWidth = 2.5; g.beginPath(); g.moveTo(340, -14); g.quadraticCurveTo(0, -30, -368, -40); g.stroke();
  // lights
  g.save(); g.globalCompositeOperation = 'lighter';
  g.fillStyle = 'rgba(220,240,255,.95)'; g.fillRect(330, -16, 34, 5);
  const hl = g.createRadialGradient(360, -12, 0, 360, -12, 90); hl.addColorStop(0, 'rgba(200,230,255,.45)'); hl.addColorStop(1, 'rgba(200,230,255,0)'); g.fillStyle = hl; g.fillRect(270, -100, 180, 180);
  g.fillStyle = 'rgba(255,70,60,.95)'; g.fillRect(-382, -62, 8, 18);
  const tl = g.createRadialGradient(-380, -54, 0, -380, -54, 70); tl.addColorStop(0, 'rgba(255,60,50,.5)'); tl.addColorStop(1, 'rgba(255,60,50,0)'); g.fillStyle = tl; g.fillRect(-450, -124, 140, 140);
  g.restore();
  // x-ray: blueprint outline + the machinery
  if (xr > 0) xrayInside(g, xr, o, T);
  g.restore();
  // wheels (drawn in world space at their exact centres so they sit on the surface)
  const sp = o.spin ?? 0;
  for (const w of [p.w1, p.w2]) { g.save(); g.translate(w[0], w[1]); g.rotate(p.a); g.scale(1, Math.max(0.12, Math.abs(sy))); g.rotate(-p.a); wheel(g, 0, 0, sp, xr); g.restore(); }
};
/** the machinery the x-ray reveals: two under-floor fans, the tanks that fill every void, the 10 nozzles */
export const NOZZLES: [number, number, number][] = [   // x, y, outward angle (local)
  [300, -34, -Math.PI / 2], [-300, -76, -Math.PI / 2], [300, 44, Math.PI / 2], [-300, 44, Math.PI / 2], [372, 6, 0], [-382, -30, Math.PI],
];
const xrayInside = (g: G, k: number, o: CarOpts, T: number) => {
  g.save(); g.globalAlpha = k;
  // outline
  g.strokeStyle = `rgba(${CYAN},.9)`; g.lineWidth = 2.5; bodyPath(g); g.stroke();
  g.strokeStyle = `rgba(${CYAN},.25)`; g.lineWidth = 8; bodyPath(g); g.stroke();
  // floor and cabin hints
  g.strokeStyle = `rgba(${CYAN},.35)`; g.lineWidth = 1.5; g.beginPath(); g.moveTo(-330, 28); g.lineTo(330, 28); g.stroke();
  g.beginPath(); g.moveTo(40, -40); g.lineTo(-40, -40); g.lineTo(-70, -80); g.stroke();
  // tanks (carbon-wrapped): gold, cross-hatched
  const tank = (x: number, y: number, w: number, h: number) => {
    g.save(); g.beginPath(); (g as any).roundRect(x, y, w, h, h / 2);
    const tg = g.createLinearGradient(0, y, 0, y + h); tg.addColorStop(0, `rgba(${GOLD},.75)`); tg.addColorStop(0.5, `rgba(${GOLD},.35)`); tg.addColorStop(1, `rgba(${GOLD},.6)`);
    g.fillStyle = tg; g.globalAlpha = k * (o.tanks ?? 0); g.fill(); g.clip();
    g.strokeStyle = 'rgba(255,240,200,.35)'; g.lineWidth = 1; for (let i = -h; i < w + h; i += 9) { g.beginPath(); g.moveTo(x + i, y); g.lineTo(x + i - h, y + h); g.stroke(); }
    g.restore();
    g.save(); g.globalAlpha = k * (o.tanks ?? 0); g.strokeStyle = `rgba(${GOLD},.95)`; g.lineWidth = 2; g.beginPath(); (g as any).roundRect(x, y, w, h, h / 2); g.stroke(); g.restore();
  };
  tank(180, -30, 150, 40); tank(-250, -76, 120, 36); tank(-250, -34, 120, 30); tank(-110, -4, 210, 26); tank(150, 4, 120, 22); tank(-330, -10, 60, 34);
  // under-floor fans: seen edge-on, so a flat disc with turning blades and a duct to the rear exhaust
  if ((o.fans ?? 0) > 0) {
    g.globalAlpha = k * (o.fans ?? 0);
    for (const fx of [110, -150]) {
      g.save(); g.translate(fx, 34); g.strokeStyle = `rgba(${CYAN},.95)`; g.lineWidth = 2.5; g.beginPath(); g.ellipse(0, 0, 70, 9, 0, 0, 7); g.stroke();
      for (let b = 0; b < 6; b++) { const ph = T * 14 + b * (Math.PI / 3); const bx = 66 * Math.cos(ph); g.strokeStyle = `rgba(${CYAN},${0.35 + 0.5 * (Math.sin(ph) > 0 ? 1 : 0.3)})`; g.beginPath(); g.moveTo(bx * 0.2, 0); g.lineTo(bx, (Math.sin(ph) * 8)); g.stroke(); }
      g.restore();
    }
    g.strokeStyle = `rgba(${CYAN},.5)`; g.lineWidth = 2; g.setLineDash([8, 6]);
    g.beginPath(); g.moveTo(110, 26); g.quadraticCurveTo(40, 10, -150, 26); g.moveTo(-150, 26); g.quadraticCurveTo(-280, 20, -360, 20); g.stroke(); g.setLineDash([]);
  }
  // nozzles
  if ((o.nozzles ?? 0) > 0) {
    g.globalAlpha = k * (o.nozzles ?? 0);
    for (const [x, y] of NOZZLES) { g.strokeStyle = `rgba(${CYAN},1)`; g.lineWidth = 2.5; g.beginPath(); g.arc(x, y, 11, 0, 7); g.stroke(); g.fillStyle = `rgba(${CYAN},.5)`; g.beginPath(); g.arc(x, y, 4, 0, 7); g.fill(); }
  }
  g.restore();
};

/* ---------------------------------------------------------------- effects */
/** a cold-gas plume: expanding, condensing vapour. from (x, y) along angle a, power 0..1 */
export const plume = (g: G, x: number, y: number, a: number, len: number, power: number, T: number, seed = 0, core = 1) => {
  if (power <= 0) return;
  const ux = Math.cos(a), uy = Math.sin(a), vx = -uy, vy = ux;
  g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = core;
  // core
  const cg = g.createLinearGradient(x, y, x + ux * len * 0.36, y + uy * len * 0.36); cg.addColorStop(0, `rgba(235,248,255,${0.6 * power})`); cg.addColorStop(1, 'rgba(200,235,255,0)');
  g.fillStyle = cg; g.beginPath(); g.moveTo(x + vx * 8, y + vy * 8); g.lineTo(x + ux * len * 0.36 + vx * 54, y + uy * len * 0.36 + vy * 54); g.lineTo(x + ux * len * 0.36 - vx * 54, y + uy * len * 0.36 - vy * 54); g.lineTo(x - vx * 8, y - vy * 8); g.closePath(); g.fill();
  g.restore();
  // billowing vapour puffs (normal blending, so it reads as cold fog, not fire)
  g.save();
  for (let i = 0; i < 26; i++) {
    const q = ((i / 26 + T * 1.7 + rnd(i, seed)) % 1), d = q * len, spread = 14 + q * len * 0.34;
    const px = x + ux * d + vx * (rnd(i, seed + 2) - 0.5) * spread, py = y + uy * d + vy * (rnd(i, seed + 2) - 0.5) * spread;
    const r = 18 + q * len * 0.26, al = power * 0.40 * (1 - q) ** 1.3;
    const pg = g.createRadialGradient(px, py, 0, px, py, r); pg.addColorStop(0, `rgba(226,238,250,${al})`); pg.addColorStop(1, 'rgba(226,238,250,0)');
    g.fillStyle = pg; g.fillRect(px - r, py - r, 2 * r, 2 * r);
  }
  g.restore();
};
/** a bold arrow (world space) */
export const arrow = (g: G, x: number, y: number, a: number, len: number, w: number, col: string, al = 1) => {
  g.save(); g.translate(x, y); g.rotate(a); g.globalAlpha *= al;
  g.fillStyle = col; g.beginPath(); g.moveTo(0, -w / 2); g.lineTo(len - w * 1.6, -w / 2); g.lineTo(len - w * 1.6, -w * 1.25); g.lineTo(len, 0); g.lineTo(len - w * 1.6, w * 1.25); g.lineTo(len - w * 1.6, w / 2); g.lineTo(0, w / 2); g.closePath(); g.fill();
  g.restore();
};
/** air ribbons: smooth streamlines (not dots) following a field; pts generator gives one path per index */
export const ribbon = (g: G, pts: [number, number][], col: string, w: number, a: number, head = 0) => {
  if (pts.length < 2 || a <= 0) return;
  const path = () => { g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); };
  g.save(); g.globalCompositeOperation = 'lighter'; g.lineCap = 'round'; g.lineJoin = 'round';
  g.strokeStyle = `rgba(${col},${0.10 * a})`; g.lineWidth = w * 5; path(); g.stroke();
  g.strokeStyle = `rgba(${col},${0.55 * a})`; g.lineWidth = w; path(); g.stroke();
  if (head > 0) { const [hx, hy] = pts[pts.length - 1]; const r = g.createRadialGradient(hx, hy, 0, hx, hy, w * 8); r.addColorStop(0, `rgba(${col},${0.8 * a * head})`); r.addColorStop(1, `rgba(${col},0)`); g.fillStyle = r; g.fillRect(hx - w * 8, hy - w * 8, w * 16, w * 16); }
  g.restore();
};

/* ---------------------------------------------------------------- generic parked vehicles for the jump (no brands) */
export const vehicle = (g: G, x: number, kind: 'sedan' | 'suv' | 'pickup' | 'van' | 'truck', lit = 1) => {
  const spec = { sedan: [460, 140, 'sedan'], suv: [480, 190, 'suv'], pickup: [540, 180, 'pickup'], van: [520, 230, 'van'], truck: [900, 400, 'truck'] }[kind] as [number, number, string];
  const [w, h] = spec;
  g.save(); g.translate(x, 0);
  const body = g.createLinearGradient(0, -h, 0, 0); body.addColorStop(0, '#3a3f4c'); body.addColorStop(1, '#16181f');
  g.fillStyle = body; g.beginPath();
  if (kind === 'sedan') { g.moveTo(-w / 2, -40); g.lineTo(-w / 2 + 20, -70); g.lineTo(-w / 4, -80); g.lineTo(-w / 8, -h); g.lineTo(w / 6, -h); g.lineTo(w / 3.2, -84); g.lineTo(w / 2 - 10, -72); g.lineTo(w / 2, -40); g.lineTo(w / 2, -24); g.lineTo(-w / 2, -24); }
  else if (kind === 'suv') { g.moveTo(-w / 2, -50); g.lineTo(-w / 2 + 10, -h); g.lineTo(w / 5, -h); g.lineTo(w / 3, -110); g.lineTo(w / 2, -96); g.lineTo(w / 2, -26); g.lineTo(-w / 2, -26); }
  else if (kind === 'pickup') { g.moveTo(-w / 2, -100); g.lineTo(-w / 12, -100); g.lineTo(-w / 12, -h); g.lineTo(w / 6, -h); g.lineTo(w / 3.4, -112); g.lineTo(w / 2, -100); g.lineTo(w / 2, -26); g.lineTo(-w / 2, -26); }
  else if (kind === 'van') { g.moveTo(-w / 2, -h); g.lineTo(w / 4, -h); g.lineTo(w / 2, -120); g.lineTo(w / 2, -26); g.lineTo(-w / 2, -26); }
  else { g.moveTo(-w / 2, -h); g.lineTo(w / 4, -h); g.lineTo(w / 4, -h + 10); g.lineTo(w / 2 - 20, -h + 140); g.lineTo(w / 2, -120); g.lineTo(w / 2, -30); g.lineTo(-w / 2, -30); }
  g.closePath(); g.fill();
  g.strokeStyle = `rgba(${WARM},${0.4 * lit})`; g.lineWidth = 3; g.stroke();
  g.fillStyle = '#0a0b10'; for (const wx of kind === 'truck' ? [-w / 2 + 110, -w / 2 + 240, w / 2 - 120] : [-w / 2 + 90, w / 2 - 90]) { g.beginPath(); g.arc(wx, -34, 34, 0, 7); g.fill(); }
  g.restore();
};

/* ---------------------------------------------------------------- the camera */
export type Cam = { x: number; y: number; s: number; r?: number };
export const withCam = (g: G, cam: Cam, fn: () => void) => {
  g.save(); g.translate(960, 540); g.rotate(cam.r ?? 0); g.scale(cam.s, cam.s); g.translate(-cam.x, -cam.y); fn(); g.restore();
};
/** world → screen for one point (for HTML labels that must sit on the picture) */
export const toScreen = (cam: Cam, x: number, y: number): [number, number] => {
  const dx = (x - cam.x) * cam.s, dy = (y - cam.y) * cam.s, r = cam.r ?? 0;
  return [960 + dx * Math.cos(r) - dy * Math.sin(r), 540 + dx * Math.sin(r) + dy * Math.cos(r)];
};

/** a point given in the car's local frame, in world space (respects roll sy) */
export const carToWorld = (p: Pose, sy: number, lx: number, ly: number): [number, number] => {
  const c = Math.cos(p.a), s = Math.sin(p.a), y2 = ly * sy;
  return [p.x + c * lx - s * y2, p.y + s * lx + c * y2];
};
/** a local direction (angle) in world space */
export const carDir = (p: Pose, sy: number, ang: number) => { const [x0, y0] = carToWorld(p, sy, 0, 0), [x1, y1] = carToWorld(p, sy, Math.cos(ang), Math.sin(ang)); return Math.atan2(y1 - y0, x1 - x0); };
/** a hangar at the far end of the apron, its wall catches projected light */
export const hangar = (g: G, x0: number, x1: number, h: number) => {
  const wg = g.createLinearGradient(0, -h, 0, 0); wg.addColorStop(0, '#1a1c27'); wg.addColorStop(1, '#262433');
  g.fillStyle = wg; g.beginPath(); g.moveTo(x0, 0); g.lineTo(x0, -h * 0.82); g.quadraticCurveTo((x0 + x1) / 2, -h * 1.12, x1, -h * 0.82); g.lineTo(x1, 0); g.closePath(); g.fill();
  g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = 4; for (let x = x0 + 120; x < x1; x += 120) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, -h * 0.82 - 0.3 * h * Math.sin(Math.PI * (x - x0) / (x1 - x0))); g.stroke(); }
  g.fillStyle = '#121219'; g.fillRect(x0 + (x1 - x0) * 0.62, -h * 0.5, (x1 - x0) * 0.3, h * 0.5);
};
