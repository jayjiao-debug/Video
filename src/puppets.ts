/* Cardboard stick puppets for 《生命平等吗？》: marker drawings on cut-out cardboard (look D, after the owner's 生姜蛋包饭 reference).
   Each puppet is { body: shapes that are grown into the cardboard silhouette, ink: the marker drawing }. Local coords: the
   puppet stands on y = 0, x centred. Backgrounds are soft-focus scenes. Everything is drawn in code; the film uses them
   as pre-rendered PNG / JPG (scripts/assets.mjs) so the render never runs canvas blur filters. */
export type G = CanvasRenderingContext2D;
export type Pt = [number, number];
export type Shape = { pts: Pt[]; closed: boolean };
export type Puppet = { body: Shape[]; ink: (g: G) => void; stick?: number; m?: number; tint?: string };

let seed = 1;
export const reseed = (s: number) => { seed = s; };
export const rand = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
export const MARK = '#1d1915';

export const ell = (cx: number, cy: number, rx: number, ry: number, a0 = 0, a1 = Math.PI * 2, n = 44): Pt[] =>
  Array.from({ length: n + 1 }, (_, i) => { const a = a0 + (a1 - a0) * i / n; return [cx + rx * Math.cos(a), cy + ry * Math.sin(a)]; });
export const bez = (p0: Pt, p1: Pt, p2: Pt, p3: Pt, n = 22): Pt[] =>
  Array.from({ length: n + 1 }, (_, i) => { const t = i / n, u = 1 - t; return [u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0], u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1]]; });
export const C = (pts: Pt[]): Shape => ({ pts, closed: true });
export const O = (pts: Pt[]): Shape => ({ pts, closed: false });
const path = (g: G, s: Shape) => { g.beginPath(); s.pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); if (s.closed) g.closePath(); };
export const marker = (g: G, s: Shape, w = 7, col = MARK) => {
  for (let p = 0; p < 2; p++) {
    g.beginPath();
    s.pts.forEach(([x, y], i) => { const xx = x + (rand() - 0.5) * 1.6, yy = y + (rand() - 0.5) * 1.6; i ? g.lineTo(xx, yy) : g.moveTo(xx, yy); });
    if (s.closed) g.closePath();
    g.lineWidth = p ? w * 0.55 : w; g.strokeStyle = col; g.globalAlpha = p ? 0.35 : 0.95; g.lineCap = 'round'; g.lineJoin = 'round'; g.stroke();
  }
  g.globalAlpha = 1;
};
const M = (g: G, pts: Pt[], w = 7, closed = false) => marker(g, { pts, closed }, w);
const dot = (g: G, x: number, y: number, r: number) => { g.fillStyle = MARK; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); };
const fillIn = (g: G, pts: Pt[], col: string, a = 1) => { g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.globalAlpha = a; g.fillStyle = col; g.fill(); g.globalAlpha = 1; };

/** draw a puppet as cardboard: shadow, cut edge, textured face, marker, optional stick. (x, y) = where its feet stand. */
export const cutout = (g: G, p: Puppet, x: number, y: number, s = 1, W = 1920, H = 1080) => {
  const m = p.m ?? 16;
  const tf = (gg: G) => { gg.translate(x, y); gg.scale(s, s); };
  const solid = (gg: G, col: string, dx = 0, dy = 0) => {
    gg.save(); gg.translate(dx, dy); gg.fillStyle = col; gg.strokeStyle = col; gg.lineWidth = m * 2; gg.lineJoin = 'round'; gg.lineCap = 'round';
    for (const b of p.body) { path(gg, b); if (b.closed) gg.fill(); gg.stroke(); }
    gg.restore();
  };
  if (p.stick) {
    g.save(); tf(g);
    const sg = g.createLinearGradient(-14, 0, 14, 0); sg.addColorStop(0, '#b98d5c'); sg.addColorStop(0.5, '#e0bd8c'); sg.addColorStop(1, '#a87c4d');
    g.fillStyle = sg; g.fillRect(-12, -60, 24, p.stick + 60);
    g.restore();
  }
  g.save(); g.filter = 'blur(12px)'; g.globalAlpha = 0.42; tf(g); solid(g, 'rgba(10,6,2,1)', 16, 20); g.restore(); g.filter = 'none'; g.globalAlpha = 1;
  g.save(); tf(g); solid(g, '#7d5d3a', 5, 7); solid(g, '#9b7649', 2.5, 3.5); g.restore();
  const L = document.createElement('canvas'); L.width = W; L.height = H; const l = L.getContext('2d')!;
  l.save(); tf(l); solid(l, p.tint ?? '#c9a272'); l.restore();
  l.globalCompositeOperation = 'source-atop';
  for (let i = 0; i < 2200; i++) { l.globalAlpha = rand() * 0.12; l.fillStyle = rand() < 0.5 ? '#6d4f2e' : '#f0d6aa'; l.fillRect(rand() * W, rand() * H, 1 + rand() * 3, 1 + rand() * 2); }
  l.globalAlpha = 0.04; l.strokeStyle = '#5a4026'; l.lineWidth = 2;
  for (let yy = 0; yy < H; yy += 9) { l.beginPath(); l.moveTo(0, yy); l.lineTo(W, yy + 30); l.stroke(); }
  l.globalAlpha = 1;
  const lg = l.createLinearGradient(x - 300 * s, y - 500 * s, x + 300 * s, y); lg.addColorStop(0, 'rgba(255,236,200,.26)'); lg.addColorStop(1, 'rgba(40,20,0,.16)');
  l.fillStyle = lg; l.fillRect(0, 0, W, H);
  l.globalCompositeOperation = 'source-over';
  l.save(); tf(l); p.ink(l); l.restore();
  g.drawImage(L, 0, 0);
};

/* ======================================================================== people */
type Hair = 'topknot' | 'cap' | 'wig' | 'long' | 'short' | 'bushy' | 'side' | 'bald';
type Face = 'smile' | 'calm' | 'skeptic' | 'sad' | 'kind' | 'think';
type Dress = 'robe' | 'coat' | 'shirt';
export const person = (o: { hair: Hair; face: Face; dress: Dress; beard?: 'long' | 'short'; mustache?: boolean; glasses?: boolean; stick?: number }): Puppet => {
  const hy = -350, hr = 78;
  const body: Shape[] = [C([[-120, 0], [-104, -228], [-44, -266], [44, -266], [104, -228], [120, 0]]), C(ell(0, hy, hr, 88))];
  if (o.hair === 'topknot') body.push(C(ell(0, hy - 102, 34, 26)));
  if (o.hair === 'cap') body.push(C([[-70, hy - 70], [-56, hy - 150], [56, hy - 150], [70, hy - 70]]));
  if (o.hair === 'wig') body.push(C(ell(-80, hy - 6, 22, 30)), C(ell(80, hy - 6, 22, 30)), C(ell(0, hy - 40, 84, 64)));
  if (o.hair === 'long') body.push(C([[-92, hy - 30], [-100, hy + 90], [-60, hy + 96], [60, hy + 96], [100, hy + 90], [92, hy - 30]]), C(ell(0, hy - 40, 86, 62)));
  if (o.hair === 'bushy') body.push(C(ell(0, hy - 46, 108, 70)));
  if (o.hair === 'short' || o.hair === 'side') body.push(C(ell(0, hy - 44, 82, 52)));
  if (o.beard === 'long') body.push(C(bez([-40, hy + 50], [-40, hy + 150], [40, hy + 150], [40, hy + 50])));
  const ink = (g: G) => {
    // clothes
    M(g, [[-120, 0], [-104, -228], [-44, -266], [44, -266], [104, -228], [120, 0]], 7, true);
    if (o.dress === 'robe') { M(g, [[-44, -266], [0, -196], [44, -266]]); M(g, [[0, -196], [-60, -40]], 5); M(g, [[-104, -228], [-74, -120], [-30, -110]], 6); M(g, [[104, -228], [74, -120], [30, -110]], 6); }
    if (o.dress === 'coat') { M(g, [[-44, -266], [-20, -150], [0, -190], [20, -150], [44, -266]], 6); M(g, [[-20, -250], [20, -250], [10, -220], [-10, -220]], 5, true); M(g, [[0, -190], [0, -20]], 5); for (const yy of [-150, -110, -70]) dot(g, 12, yy, 5); }
    if (o.dress === 'shirt') { M(g, [[-44, -266], [-26, -226], [0, -250], [26, -226], [44, -266]], 6); M(g, [[0, -250], [0, -30]], 4); dot(g, 0, -200, 4); dot(g, 0, -150, 4); dot(g, 0, -100, 4); }
    // head
    M(g, ell(0, hy, hr, 88), 7, true);
    if (o.hair === 'topknot') { M(g, ell(0, hy - 102, 34, 26), 7, true); M(g, [[-60, hy - 106], [62, hy - 96]], 5); M(g, ell(0, hy, hr, 88, Math.PI * 1.1, Math.PI * 1.9), 5); fillIn(g, [...ell(0, hy, hr, 88, Math.PI * 1.12, Math.PI * 1.88), [44, hy - 50], [-44, hy - 50]], MARK, 0.75); }
    if (o.hair === 'cap') { M(g, [[-70, hy - 70], [-56, hy - 150], [56, hy - 150], [70, hy - 70]], 7, true); M(g, [[-86, hy - 70], [86, hy - 70]]); }
    if (o.hair === 'wig') { M(g, ell(0, hy - 40, 84, 64, Math.PI, Math.PI * 2)); M(g, ell(-80, hy - 6, 22, 30), 6, true); M(g, ell(80, hy - 6, 22, 30), 6, true); for (const xx of [-40, 0, 40]) M(g, bez([xx - 20, hy - 96], [xx - 10, hy - 80], [xx + 10, hy - 80], [xx + 20, hy - 96], 8), 4); }
    if (o.hair === 'long') { M(g, [[-92, hy - 30], [-100, hy + 90], [-60, hy + 96]]); M(g, [[92, hy - 30], [100, hy + 90], [60, hy + 96]]); M(g, ell(0, hy - 40, 86, 62, Math.PI, Math.PI * 2)); M(g, bez([-70, hy - 60], [-30, hy - 90], [20, hy - 60], [60, hy - 70]), 5); }
    if (o.hair === 'bushy') { const pts: Pt[] = []; for (let i = 0; i <= 16; i++) { const a = Math.PI + Math.PI * i / 16, r = i % 2 ? 108 : 92; pts.push([Math.cos(a) * r, hy - 46 + Math.sin(a) * (r * 0.66)]); } M(g, pts, 7); }
    if (o.hair === 'short') { M(g, ell(0, hy - 44, 82, 52, Math.PI * 1.02, Math.PI * 1.98)); M(g, bez([-74, hy - 40], [-30, hy - 64], [30, hy - 70], [74, hy - 46]), 6); }
    if (o.hair === 'side') { M(g, ell(0, hy - 44, 82, 52, Math.PI * 1.02, Math.PI * 1.98)); M(g, bez([-50, hy - 92], [-30, hy - 60], [20, hy - 60], [76, hy - 50]), 6); M(g, [[-76, hy - 20], [-74, hy + 30]], 9); M(g, [[76, hy - 20], [74, hy + 30]], 9); }
    // face
    const ey = hy - 12;
    if (o.face === 'smile') { M(g, bez([-44, ey], [-36, ey - 14], [-20, ey - 14], [-12, ey]), 6); M(g, bez([12, ey], [20, ey - 14], [36, ey - 14], [44, ey]), 6); M(g, bez([-20, hy + 34], [-8, hy + 46], [8, hy + 46], [20, hy + 34]), 5); }
    if (o.face === 'calm') { dot(g, -28, ey, 7); dot(g, 30, ey, 7); M(g, [[-14, hy + 40], [16, hy + 40]], 5); }
    if (o.face === 'kind') { dot(g, -28, ey, 7); dot(g, 30, ey, 7); M(g, bez([-18, hy + 34], [-8, hy + 44], [8, hy + 44], [18, hy + 34]), 5); M(g, [[-44, ey - 26], [-14, ey - 22]], 5); M(g, [[14, ey - 22], [44, ey - 26]], 5); }
    if (o.face === 'skeptic') { M(g, [[-46, ey - 32], [-14, ey - 24]], 6); M(g, [[14, ey - 18], [46, ey - 32]], 6); dot(g, -28, ey, 7); dot(g, 30, ey, 7); M(g, [[-18, hy + 40], [18, hy + 36]], 5); }
    if (o.face === 'think') { dot(g, -24, ey - 4, 7); dot(g, 34, ey - 4, 7); M(g, [[-44, ey - 24], [-12, ey - 30]], 5); M(g, [[14, ey - 30], [46, ey - 24]], 5); M(g, ell(10, hy + 40, 10, 7), 4, true); }
    if (o.face === 'sad') { M(g, bez([-44, ey], [-36, ey + 8], [-20, ey + 8], [-12, ey]), 6); M(g, bez([12, ey], [20, ey + 8], [36, ey + 8], [44, ey]), 6); M(g, bez([-16, hy + 44], [-6, hy + 36], [6, hy + 36], [16, hy + 44]), 5); }
    if (o.glasses) { M(g, ell(-28, ey, 22, 18), 4, true); M(g, ell(30, ey, 22, 18), 4, true); M(g, [[-6, ey], [8, ey]], 4); }
    if (o.mustache) { fillIn(g, [...bez([-46, hy + 26], [-30, hy + 6], [-6, hy + 10], [0, hy + 20]), ...bez([0, hy + 20], [6, hy + 10], [30, hy + 6], [46, hy + 26]), [20, hy + 22], [0, hy + 28], [-20, hy + 22]], MARK, 0.85); }
    if (o.beard === 'long') { M(g, bez([-40, hy + 50], [-40, hy + 150], [40, hy + 150], [40, hy + 50])); for (const xx of [-20, 0, 20]) M(g, [[xx, hy + 56], [xx * 0.8, hy + 118]], 3.5); }
    if (o.beard === 'short') { M(g, bez([-14, hy + 60], [-8, hy + 86], [8, hy + 86], [14, hy + 60]), 5); }
  };
  return { body, ink, stick: o.stick ?? 260 };
};

/* ======================================================================== animals and props */
export const CAT: Puppet = {
  body: [C(ell(0, -95, 82, 95)), C(ell(-6, -215, 68, 60)), C([[-58, -250], [-62, -312], [-20, -268]]), C([[32, -268], [58, -314], [62, -250]]), O(bez([70, -40], [150, -40], [150, -130], [112, -150]))],
  ink: (g) => {
    marker(g, O(ell(0, -95, 82, 95, -0.2, Math.PI * 1.05))); marker(g, O(ell(0, -95, 82, 95, Math.PI * 1.15, Math.PI * 1.85)));
    marker(g, C([[-56, -244], [-60, -306], [-22, -270]])); marker(g, C([[30, -270], [56, -308], [60, -246]]));
    marker(g, O(ell(-6, -215, 68, 60, Math.PI * 0.95, Math.PI * 2.05)));
    marker(g, O(bez([70, -40], [150, -40], [150, -130], [112, -150])));
    marker(g, O(bez([-40, -222], [-34, -212], [-22, -212], [-16, -222])), 6); marker(g, O(bez([6, -222], [12, -212], [24, -212], [30, -222])), 6);
    marker(g, O([[-12, -196], [-2, -190], [6, -196]]), 5);
    for (const [a, b, c, d] of [[-30, -192, -80, -200], [-30, -184, -78, -178], [24, -192, 74, -200], [24, -184, 72, -178]]) marker(g, O([[a, b], [c, d]]), 3.5);
    marker(g, O([[-30, -10], [-20, -60]]), 5); marker(g, O([[20, -10], [14, -60]]), 5);
  }, stick: 300,
};
export const LAMP: Puppet = {
  body: [C([[-14, 0], [-14, -620], [14, -620], [14, 0]]), O(bez([0, -620], [0, -700], [110, -700], [130, -650])), C([[90, -650], [170, -650], [150, -615], [110, -615]])],
  ink: (g) => { M(g, [[-14, 0], [-14, -610]]); M(g, [[14, 0], [14, -610]]); marker(g, O(bez([0, -620], [0, -700], [110, -700], [130, -650]))); M(g, [[90, -650], [170, -650], [150, -615], [110, -615]], 7, true); for (let i = 1; i < 6; i++) M(g, [[-12, -i * 100], [12, -i * 100 - 6]], 4); },
  stick: 300,
};
export const RHINO: Puppet = {
  body: [C(ell(0, -175, 230, 125)), C(ell(-250, -140, 108, 72)), C([[-338, -168], [-384, -282], [-312, -190]]), C([[-284, -198], [-300, -254], [-262, -208]]),
    C([[-150, -80], [-150, 0], [-90, 0], [-90, -80]]), C([[120, -80], [120, 0], [180, 0], [180, -80]]), C(ell(-196, -214, 20, 30))],
  ink: (g) => {
    marker(g, O(ell(0, -175, 230, 125, -Math.PI * 0.84, Math.PI * 0.8))); marker(g, O(ell(-250, -140, 108, 72, Math.PI * 0.42, Math.PI * 1.62)));
    M(g, [[-338, -168], [-384, -282], [-312, -190]], 7, true); M(g, [[-284, -198], [-300, -254], [-262, -208]], 7, true);
    M(g, [[-150, -80], [-150, 0], [-90, 0], [-90, -64]]); M(g, [[120, -70], [120, 0], [180, 0], [180, -80]]); M(g, ell(-196, -214, 20, 30), 7, true);
    marker(g, O(bez([-268, -160], [-262, -150], [-248, -150], [-242, -160])), 6); marker(g, O(bez([-345, -118], [-320, -104], [-300, -104], [-290, -112])), 4);
    marker(g, O(bez([-60, -120], [0, -100], [60, -110], [120, -130])), 4); M(g, [[228, -180], [260, -150]], 5);
  }, stick: 260,
};
export const FLY: Puppet = {
  body: [C(ell(0, -60, 46, 30)), C(ell(-50, -66, 24, 22)), C(ell(10, -110, 44, 26)), C(ell(40, -100, 40, 22))],
  ink: (g) => {
    M(g, ell(0, -60, 46, 30), 6, true); M(g, ell(-50, -66, 24, 22), 6, true); dot(g, -58, -70, 7);
    M(g, ell(10, -110, 44, 26), 4, true); M(g, ell(40, -100, 40, 22), 4, true);
    for (const xx of [-20, 0, 20]) M(g, [[xx, -34], [xx - 10, -6]], 4);
    for (const xx of [-10, 10, 30]) M(g, [[xx, -66], [xx + 6, -48]], 3);
  }, stick: 200, m: 12,
};
export const WINDOW: Puppet = {
  body: [C([[-360, 0], [-360, -620], [360, -620], [360, 0]]), C([[-400, 0], [400, 0], [400, 40], [-400, 40]])],
  ink: (g) => { M(g, [[-360, 0], [-360, -620], [360, -620], [360, 0]], 8, true); M(g, [[0, -620], [0, 0]], 7); M(g, [[-360, -310], [360, -310]], 7); M(g, [[-400, 0], [400, 0], [400, 40], [-400, 40]], 7, true); M(g, [[-300, -560], [-200, -460]], 4); M(g, [[60, -560], [140, -480]], 4); },
  tint: '#d3b083',
};
export const SWATTER: Puppet = {
  body: [C([[-110, -400], [110, -400], [110, -230], [-110, -230]]), C([[-12, -230], [12, -230], [12, 120], [-12, 120]])],
  ink: (g) => { M(g, [[-110, -400], [110, -400], [110, -230], [-110, -230]], 7, true); for (let i = 1; i < 6; i++) { M(g, [[-110 + i * 36, -400], [-110 + i * 36, -230]], 3); } for (let i = 1; i < 5; i++) M(g, [[-110, -400 + i * 34], [110, -400 + i * 34]], 3); M(g, [[0, -230], [0, 120]], 6); },
  m: 12,
};
export const heart = (stick = 0): Puppet => {
  const pts: Pt[] = [...bez([0, 0], [-160, -110], [-120, -260], [0, -190], 18), ...bez([0, -190], [120, -260], [160, -110], [0, 0], 18)];
  return { body: [C(pts)], ink: (g) => { M(g, pts, 8, true); M(g, bez([-70, -170], [-80, -140], [-70, -120], [-56, -110], 8), 5); }, stick, tint: '#d98b6f' };
};
export const CLIPBOARD: Puppet = {
  body: [C([[-170, 0], [-170, -440], [170, -440], [170, 0]])],
  ink: (g) => {
    M(g, [[-170, 0], [-170, -440], [170, -440], [170, 0]], 7, true); M(g, [[-60, -440], [-60, -470], [60, -470], [60, -440]], 7);
    for (let i = 0; i < 5; i++) { const y = -370 + i * 70; M(g, [[-130, y], [-100, y], [-100, y + 30], [-130, y + 30]], 4, true); M(g, [[-80, y + 14], [120, y + 14]], 4); if (i === 1 || i === 3) M(g, [[-128, y + 14], [-116, y + 28], [-96, y - 6]], 5); }
  }, stick: 220, tint: '#e2c99d',
};
export const RULER: Puppet = {
  body: [C([[-760, 0], [-760, -90], [760, -90], [760, 0]])],
  ink: (g) => { M(g, [[-760, 0], [-760, -90], [760, -90], [760, 0]], 7, true); for (let i = 0; i <= 38; i++) { const x = -740 + i * 40; M(g, [[x, -90], [x, i % 5 === 0 ? -40 : -62]], 4); } },
  tint: '#d8bb8c',
};
export const DOG: Puppet = {
  body: [C(ell(0, -150, 140, 70)), C(ell(-150, -220, 62, 54)), C(ell(-196, -200, 40, 26)), C(ell(-118, -200, 26, 50)), C([[-110, -100], [-110, 0], [-70, 0], [-70, -100]]), C([[70, -100], [70, 0], [110, 0], [110, -100]]), O(bez([136, -170], [180, -200], [190, -250], [176, -270]))],
  ink: (g) => {
    marker(g, O(ell(0, -150, 140, 70, -Math.PI * 0.8, Math.PI * 0.85))); M(g, ell(-150, -220, 62, 54, Math.PI * 0.3, Math.PI * 1.9)); M(g, ell(-196, -200, 40, 26, Math.PI * 0.5, Math.PI * 1.5)); dot(g, -232, -206, 9);
    M(g, ell(-118, -200, 26, 50), 6, true); dot(g, -168, -232, 6); M(g, bez([-200, -180], [-190, -170], [-176, -170], [-170, -180]), 4);
    M(g, [[-110, -100], [-110, 0], [-70, 0], [-70, -94]]); M(g, [[70, -94], [70, 0], [110, 0], [110, -100]]); marker(g, O(bez([136, -170], [180, -200], [190, -250], [176, -270])));
  }, stick: 240,
};
export const CHICKEN: Puppet = {
  body: [C(ell(0, -150, 110, 90)), C(ell(-90, -250, 50, 48)), C([[-150, -258], [-188, -246], [-148, -232]]), C(ell(-96, -306, 26, 20)), C([[90, -200], [150, -280], [140, -160]]), C([[-20, -60], [-20, 0], [0, 0], [0, -60]]), C([[30, -60], [30, 0], [50, 0], [50, -60]])],
  ink: (g) => {
    marker(g, O(ell(0, -150, 110, 90, -Math.PI * 0.7, Math.PI * 0.9))); M(g, ell(-90, -250, 50, 48, Math.PI * 0.1, Math.PI * 1.7)); M(g, [[-140, -258], [-188, -246], [-140, -232]], 6);
    fillIn(g, ell(-96, -306, 26, 20), '#c0453a', 0.85); M(g, ell(-96, -306, 26, 20), 5, true); dot(g, -106, -258, 7);
    M(g, [[90, -200], [150, -280], [140, -160]], 6); M(g, bez([-40, -150], [0, -110], [40, -120], [60, -160]), 5);
    M(g, [[-10, -60], [-10, 0], [-30, 6]], 5); M(g, [[40, -60], [40, 0], [20, 6]], 5);
  }, stick: 240,
};
export const BIRD: Puppet = {
  body: [C(ell(0, -80, 70, 52)), C(ell(-60, -130, 36, 34)), C([[-90, -132], [-124, -124], [-90, -116]]), C([[60, -90], [130, -120], [110, -70]])],
  ink: (g) => { marker(g, O(ell(0, -80, 70, 52, -Math.PI * 0.7, Math.PI * 0.9))); M(g, ell(-60, -130, 36, 34, Math.PI * 0.2, Math.PI * 1.8)); M(g, [[-90, -132], [-124, -124], [-90, -116]], 5); dot(g, -66, -136, 6); M(g, [[60, -90], [130, -120], [110, -70]], 5); M(g, bez([-20, -86], [10, -60], [40, -70], [56, -90]), 4); M(g, [[-10, -30], [-14, 0]], 4); M(g, [[14, -30], [12, 0]], 4); },
  stick: 200, m: 12,
};
export const FROG: Puppet = {
  body: [C(ell(0, -70, 100, 66)), C(ell(-50, -134, 30, 28)), C(ell(50, -134, 30, 28))],
  ink: (g) => { marker(g, O(ell(0, -70, 100, 66, Math.PI * 1.25, Math.PI * 1.75 + Math.PI * 2 - Math.PI * 2))); M(g, ell(0, -70, 100, 66, -0.1, Math.PI * 1.1)); M(g, ell(-50, -134, 30, 28), 6, true); M(g, ell(50, -134, 30, 28), 6, true); dot(g, -50, -136, 9); dot(g, 50, -136, 9); M(g, bez([-50, -70], [-20, -50], [20, -50], [50, -70]), 5); M(g, [[-90, -20], [-120, 0]], 5); M(g, [[90, -20], [120, 0]], 5); },
  stick: 200, m: 12, tint: '#b9b27a',
};
export const FISH: Puppet = {
  body: [C([...bez([-100, -60], [-50, -120], [50, -110], [90, -60]), ...bez([90, -60], [50, -10], [-50, 0], [-100, -60])]), C([[-96, -60], [-150, -100], [-146, -20]])],
  ink: (g) => { M(g, [...bez([-100, -60], [-50, -120], [50, -110], [90, -60]), ...bez([90, -60], [50, -10], [-50, 0], [-100, -60])], 6, true); M(g, [[-96, -60], [-150, -100], [-146, -20], [-96, -60]], 6); dot(g, 56, -72, 7); M(g, bez([20, -100], [10, -70], [10, -50], [20, -24]), 4); },
  stick: 200, m: 12, tint: '#d9a777',
};
export const BAT: Puppet = {
  body: [C([[0, -120], [-60, -170], [-120, -150], [-200, -190], [-180, -120], [-120, -110], [-60, -80], [0, -60], [60, -80], [120, -110], [180, -120], [200, -190], [120, -150], [60, -170]]), C(ell(0, -110, 36, 44)), C([[-26, -146], [-20, -180], [-6, -150]]), C([[6, -150], [20, -180], [26, -146]])],
  ink: (g) => {
    M(g, [[-36, -120], [-60, -170], [-120, -150], [-200, -190], [-180, -120], [-120, -110], [-60, -80], [-30, -80]], 6); M(g, [[36, -120], [60, -170], [120, -150], [200, -190], [180, -120], [120, -110], [60, -80], [30, -80]], 6);
    M(g, ell(0, -110, 36, 44), 6, true); M(g, [[-26, -146], [-20, -180], [-6, -150]], 5); M(g, [[6, -150], [20, -180], [26, -146]], 5); dot(g, -12, -116, 5); dot(g, 12, -116, 5); M(g, [[-6, -94], [0, -88], [6, -94]], 3);
  }, stick: 220, tint: '#a98a68',
};
export const HIPPO: Puppet = {
  body: [C(ell(0, -80, 170, 80)), C(ell(-60, -150, 26, 22)), C(ell(60, -150, 26, 22)), C(ell(-120, -150, 18, 16)), C(ell(120, -150, 18, 16))],
  ink: (g) => { M(g, ell(0, -80, 170, 80, Math.PI, Math.PI * 2), 7); M(g, [[-170, -80], [170, -80]], 5); M(g, ell(-60, -150, 26, 22), 6, true); M(g, ell(60, -150, 26, 22), 6, true); dot(g, -60, -148, 8); dot(g, 60, -148, 8); M(g, ell(-120, -150, 18, 16), 5, true); M(g, ell(120, -150, 18, 16), 5, true); dot(g, -30, -96, 5); dot(g, 30, -96, 5); },
  tint: '#a58f7c',
};
export const BOAT: Puppet = {
  body: [C([[-420, -120], [420, -120], [340, 0], [-340, 0]]), C([[-40, -120], [-40, -420], [-10, -420], [-10, -120]]), C([[-10, -400], [240, -160], [-10, -160]])],
  ink: (g) => { M(g, [[-420, -120], [420, -120], [340, 0], [-340, 0]], 8, true); M(g, [[-380, -70], [380, -70]], 4); M(g, [[-25, -120], [-25, -420]], 7); M(g, [[-10, -400], [240, -160], [-10, -160]], 6, true); },
};
export const BRIDGE: Puppet = {
  body: [O(bez([-900, 0], [-400, -120], [400, -120], [900, 0], 30)), C([[-900, 0], [-900, 60], [900, 60], [900, 0]])],
  ink: (g) => { marker(g, O(bez([-900, 0], [-400, -120], [400, -120], [900, 0], 30))); for (let i = -7; i <= 7; i++) { const x = i * 110, y = -120 * (1 - (i / 8.2) ** 2) + 10; M(g, [[x, y], [x, 50]], 5); } },
  m: 14,
};
export const SIGN: Puppet = { body: [C([[-200, -100], [200, -100], [200, 100], [-200, 100]])], ink: () => {}, stick: 300, m: 8, tint: '#e3c696' };
export const TAG: Puppet = { body: [C([[-150, -44], [150, -44], [150, 44], [-150, 44]])], ink: () => {}, m: 6, tint: '#ead2a4' };
export const bubble = (w: number, h: number, side: number): Puppet => {
  const r = 46, pts: Pt[] = [];
  const rr = (cx: number, cy: number, a0: number) => ell(cx, cy, r, r, a0, a0 + Math.PI / 2, 8);
  pts.push(...rr(w / 2 - r, -h + r, -Math.PI / 2), ...rr(w / 2 - r, -r, 0));
  pts.push([side * 30 + 40, 0], [side * 120, 70], [side * 30 - 40, 0]);
  pts.push(...rr(-w / 2 + r, -r, Math.PI / 2), ...rr(-w / 2 + r, -h + r, Math.PI));
  return { body: [C(pts)], ink: (g) => marker(g, C(pts), 6), m: 8, tint: '#ead3a8' };
};

/* ======================================================================== backgrounds (drawn sharp, blurred when rendered) */
const bokeh = (g: G, n: number, cols: string[], y0: number, y1: number, r0: number, r1: number, W: number) => {
  for (let i = 0; i < n; i++) { const x = rand() * W, y = y0 + rand() * (y1 - y0), r = r0 + rand() * (r1 - r0); const gr = g.createRadialGradient(x, y, 0, x, y, r); const c = cols[i % cols.length]; gr.addColorStop(0, `rgba(${c},.55)`); gr.addColorStop(0.7, `rgba(${c},.35)`); gr.addColorStop(1, `rgba(${c},0)`); g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r); }
};
const grad = (g: G, W: number, H: number, stops: [number, string][]) => { const s = g.createLinearGradient(0, 0, 0, H); stops.forEach(([a, c]) => s.addColorStop(a, c)); g.fillStyle = s; g.fillRect(0, 0, W, H); };
export const BACKGROUNDS: Record<string, (g: G, W: number, H: number) => void> = {
  night: (g, W, H) => { grad(g, W, H, [[0, '#141a26'], [0.6, '#2a2c35'], [1, '#3a3430']]); bokeh(g, 26, ['255,190,110', '255,214,150', '140,170,220'], 120, 640, 30, 90, W); g.fillStyle = '#2b2622'; g.fillRect(0, 760, W, H); const p = g.createRadialGradient(1100, 830, 0, 1100, 830, 520); p.addColorStop(0, 'rgba(255,200,120,.5)'); p.addColorStop(1, 'rgba(255,200,120,0)'); g.fillStyle = p; g.fillRect(0, 500, W, 600); },
  savanna: (g, W, H) => { grad(g, W, H, [[0, '#f1b57a'], [0.55, '#e9925f'], [0.62, '#a8754e'], [1, '#6b5038']]); const s = g.createRadialGradient(1450, 560, 0, 1450, 560, 260); s.addColorStop(0, 'rgba(255,240,200,.95)'); s.addColorStop(1, 'rgba(255,200,140,0)'); g.fillStyle = s; g.fillRect(0, 0, W, H); g.fillStyle = 'rgba(60,40,30,.75)'; for (const [x, w2] of [[260, 260], [760, 180], [1700, 300]]) { g.beginPath(); g.ellipse(x, 600, w2, 50, 0, 0, 7); g.fill(); g.fillRect(x - 8, 600, 16, 90); } },
  room: (g, W, H) => { grad(g, W, H, [[0, '#efe3cf'], [1, '#d6c3a4']]); const s = g.createRadialGradient(960, 380, 0, 960, 380, 700); s.addColorStop(0, 'rgba(255,255,240,.9)'); s.addColorStop(1, 'rgba(255,255,240,0)'); g.fillStyle = s; g.fillRect(0, 0, W, H); g.fillStyle = 'rgba(150,175,140,.6)'; for (let i = 0; i < 8; i++) { g.beginPath(); g.ellipse(700 + rand() * 520, 250 + rand() * 260, 90, 70, 0, 0, 7); g.fill(); } g.fillStyle = '#b89c78'; g.fillRect(0, 820, W, H); },
  studio: (g, W, H) => { grad(g, W, H, [[0, '#5b4a3c'], [0.7, '#3d3129'], [1, '#2a221c']]); bokeh(g, 18, ['255,206,140', '255,226,180'], 80, 600, 40, 110, W); g.fillStyle = '#4a3a2c'; g.fillRect(0, 800, W, H); const p = g.createRadialGradient(960, 520, 0, 960, 520, 760); p.addColorStop(0, 'rgba(255,214,150,.35)'); p.addColorStop(1, 'rgba(255,214,150,0)'); g.fillStyle = p; g.fillRect(0, 0, W, H); },
  pond: (g, W, H) => { grad(g, W, H, [[0, '#cfe0d6'], [1, '#9fb9a6']]); for (let i = 0; i < 18; i++) { g.fillStyle = `rgba(${70 + rand() * 40},${110 + rand() * 40},${70 + rand() * 30},.7)`; g.beginPath(); g.ellipse(rand() * W, 200 + rand() * 300, 140 + rand() * 160, 90 + rand() * 90, 0, 0, 7); g.fill(); } g.fillStyle = '#7fa9ad'; g.fillRect(0, 700, W, 380); bokeh(g, 22, ['255,255,235', '230,245,255'], 700, 1000, 14, 40, W); },
  river: (g, W, H) => { grad(g, W, H, [[0, '#f3c58c'], [0.5, '#e8a56c'], [0.56, '#5f7a5a'], [0.62, '#7d8f86'], [1, '#56665f']]); for (let i = 0; i < 14; i++) { g.fillStyle = `rgba(${50 + rand() * 30},${80 + rand() * 30},${50 + rand() * 20},.85)`; g.beginPath(); g.ellipse(rand() * W, 560, 120 + rand() * 140, 60 + rand() * 50, 0, 0, 7); g.fill(); } bokeh(g, 20, ['255,230,180'], 700, 1000, 10, 30, W); },
  dusk: (g, W, H) => { grad(g, W, H, [[0, '#1d2236'], [0.6, '#3b3550'], [1, '#2a2430']]); for (let i = 0; i < 160; i++) { g.fillStyle = `rgba(255,250,235,${0.3 + rand() * 0.6})`; g.beginPath(); g.arc(rand() * W, rand() * 600, 1.5 + rand() * 3, 0, 7); g.fill(); } bokeh(g, 14, ['255,206,140'], 650, 900, 30, 80, W); g.fillStyle = '#2c2630'; g.fillRect(0, 820, W, H); },
};
