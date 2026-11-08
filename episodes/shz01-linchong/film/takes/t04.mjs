// T04 · home · 31.974–38.638 (S07 window shadow play → push through the paper → S08 two tea bowls)
// Enters from T03 by a colour/shape match dissolve (red flag → red lantern at (520, 260), noon → dusk), 31.56–31.974.
import { L, kf, ramp, zexp, E, bake, f2, clamp, lerp, rng, noise1, motes, camAt, smooth } from '../lib.mjs';
import { latticeWindow, winGlow } from '../cast/window.mjs';

const T_PUSH = 35.306;
const WX = 980, WY = 236, WW = 480, WH = 576; // window on the wall (world, d 1)
const WC = [WX + WW / 2, WY + WH / 2];

// ------------------------------------------------------------------ S07 set (baked)
function farLane() {
  // dusk sky + far roofs, seen in the lane at the left of the house (d 0.25)
  let s = `<defs><linearGradient id="t04sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6B5A7E"/><stop offset="0.55" stop-color="#B8857E"/><stop offset="1" stop-color="#E9B07A"/></linearGradient></defs>`;
  s += `<rect x="-300" y="-300" width="1100" height="1700" fill="url(#t04sky)"/>`;
  // far roofs (layered silhouettes with upturned eaves)
  const roof = (x, y, w, h, col) => `<path d="M${x},${y + h} L${x},${y + h * 0.45} Q${x - w * 0.08},${y + h * 0.3} ${x - w * 0.12},${y + h * 0.18} Q${x + w * 0.1},${y + h * 0.28} ${x + w * 0.2},${y} L${x + w * 0.8},${y} Q${x + w * 0.9},${y + h * 0.28} ${x + w * 1.12},${y + h * 0.18} Q${x + w * 1.08},${y + h * 0.3} ${x + w},${y + h * 0.45} L${x + w},${y + h}Z" fill="${col}"/>`;
  s += roof(-260, 470, 420, 260, '#5A4660') + roof(120, 520, 360, 240, '#4E3D57') + roof(-120, 600, 380, 300, '#3F3149');
  // warm windows in the far houses
  for (const [x, y] of [[-40, 760], [210, 700], [330, 780], [40, 840]]) s += `<rect x="${x}" y="${y}" width="34" height="40" fill="#F2B05A" opacity="0.75"/>`;
  // a willow silhouette
  let wl = '';
  const R = rng(4);
  for (let i = 0; i < 26; i++) {
    const x0 = 360 + R() * 220, y0 = 330 + R() * 90, len = 260 + R() * 260;
    wl += `<path d="M${f2(x0)},${f2(y0)} q${f2(-20 + R() * 40)},${f2(len * 0.5)} ${f2(-10 + R() * 30)},${f2(len)}" stroke="#2F2A33" stroke-width="${f2(3 + R() * 3)}" fill="none" opacity="0.8"/>`;
  }
  s += `<path d="M470,330 C455,520 465,760 450,1100 L500,1100 C495,760 488,520 490,330Z" fill="#2B2530"/>${wl}`;
  return s;
}

function houseWall() {
  // the house front: plaster wall, timber posts, the door at the left (d 1.0). World coords; covers x 300..2300.
  let s = `<defs><linearGradient id="t04wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3E3036"/><stop offset="0.6" stop-color="#4A3A3E"/><stop offset="1" stop-color="#3A2C2E"/></linearGradient>` +
    `<linearGradient id="t04post" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#2A1C17"/><stop offset="0.4" stop-color="#4A3226"/><stop offset="1" stop-color="#241812"/></linearGradient></defs>`;
  s += `<rect x="300" y="-200" width="2100" height="1600" fill="url(#t04wall)"/>`;
  // plaster mottling
  const R = rng(12);
  for (let i = 0; i < 60; i++) s += `<ellipse cx="${f2(320 + R() * 2000)}" cy="${f2(R() * 1100)}" rx="${f2(30 + R() * 90)}" ry="${f2(14 + R() * 40)}" fill="#5A4848" opacity="${f2(0.08 + R() * 0.1)}"/>`;
  // skirting and plinth
  s += `<rect x="300" y="930" width="2100" height="40" fill="#2E211C"/><rect x="300" y="970" width="2100" height="400" fill="#3A302C"/>`;
  for (let x = 300; x < 2400; x += 140) s += `<rect x="${x}" y="970" width="2" height="400" fill="#2A221E"/>`;
  // posts
  for (const x of [300, 880, 1620]) s += `<rect x="${x}" y="-200" width="56" height="1170" fill="url(#t04post)"/>`;
  s += `<rect x="300" y="150" width="2100" height="34" fill="#33231B"/>`; // lintel beam
  // the door (dark, double leaf with a lattice upper panel), x 380..820
  const dx = 380, dw = 440, dy = 250;
  s += `<rect x="${dx - 20}" y="${dy - 24}" width="${dw + 40}" height="${970 - dy + 24}" fill="#2A1C17"/>`;
  s += `<rect x="${dx}" y="${dy}" width="${dw}" height="${720}" fill="#2E2226"/>`;
  for (const lx of [dx, dx + dw / 2]) {
    s += `<rect x="${lx + 14}" y="${dy + 16}" width="${dw / 2 - 28}" height="250" fill="#251A1C" stroke="#3E2D2A" stroke-width="4"/>`;
    for (let i = 1; i < 4; i++) s += `<rect x="${lx + 14 + ((dw / 2 - 28) * i) / 4 - 2}" y="${dy + 16}" width="4" height="250" fill="#3E2D2A"/>`;
    for (let j = 1; j < 5; j++) s += `<rect x="${lx + 14}" y="${dy + 16 + (250 * j) / 5 - 2}" width="${dw / 2 - 28}" height="4" fill="#3E2D2A"/>`;
    s += `<rect x="${lx + 14}" y="${dy + 290}" width="${dw / 2 - 28}" height="400" fill="#2A1F21" stroke="#3E2D2A" stroke-width="4"/>`;
  }
  s += `<rect x="${dx + dw / 2 - 2}" y="${dy}" width="4" height="720" fill="#1A1112"/>`;
  s += `<circle cx="${dx + dw / 2 - 18}" cy="${dy + 400}" r="9" fill="#8A6A3A"/><circle cx="${dx + dw / 2 + 18}" cy="${dy + 400}" r="9" fill="#8A6A3A"/>`;
  // steps
  s += `<rect x="${dx - 40}" y="970" width="${dw + 80}" height="30" fill="#4E423C"/><rect x="${dx - 70}" y="1000" width="${dw + 140}" height="40" fill="#5A4E46"/>`;
  return s;
}

function eave() {
  // the roof eave across the top (d 1.15): tile edge with round end-tiles, rafters underneath
  let s = `<path d="M-300,-300 H2400 V96 Q1900,118 1400,112 Q800,104 200,120 Q-80,128 -300,150Z" fill="#26201F"/>`;
  s += `<path d="M-300,150 Q-80,128 200,120 Q800,104 1400,112 Q1900,118 2400,96 V128 Q1900,148 1400,142 Q800,136 200,150 Q-80,158 -300,180Z" fill="#3B3230"/>`;
  for (let x = -280; x < 2400; x += 46) {
    const y = 140 - (x > 1400 ? (x - 1400) * 0.02 : 0) + (x < 200 ? (200 - x) * 0.04 : 0);
    s += `<circle cx="${x}" cy="${f2(y)}" r="19" fill="#4F5A63"/><circle cx="${x}" cy="${f2(y)}" r="12" fill="#3F4950"/>`;
  }
  // rafters
  for (let x = -260; x < 2400; x += 92) s += `<rect x="${x}" y="150" width="30" height="${x < 300 ? 60 : 34}" rx="10" fill="#4A3226"/>`;
  return s;
}

// the S07 set is light enough to draw live (no bakes)
const SET_FAR = farLane(), SET_WALL = houseWall(), SET_EAVE = eave();

// ------------------------------------------------------------------ shadow play (window-local coords)
function shadows(t) {
  // her: seated, seen from behind (bun + hairpin), sewing; needle hand rises on 32.39, 33.23, 34.06, 34.89
  const beats = [32.39, 33.23, 34.06, 34.89];
  let up = 0;
  for (const b of beats) up = Math.max(up, Math.max(0, 1 - Math.abs(t - b) / 0.36));
  up = E.sine(up);
  const lean = ramp(t, 34.472, 34.9, E.out); // she leans her head against his hand
  const hx = 170, hy = 300; // her head centre
  const tilt = lean * 13;
  let her = `<g transform="rotate(${f2(tilt)} ${hx} ${hy + 60})">` +
    `<ellipse cx="${hx}" cy="${hy}" rx="44" ry="52"/>` +
    `<ellipse cx="${hx + 4}" cy="${hy - 58}" rx="34" ry="28"/>` + // 高髻 bun
    `<ellipse cx="${hx - 2}" cy="${hy - 80}" rx="20" ry="16"/>` +
    `<path d="M${hx + 22},${hy - 70} L${hx + 78},${hy - 96}" stroke="#5A2E14" stroke-width="6" stroke-linecap="round"/>` + // hairpin
    `<circle cx="${hx + 80}" cy="${hy - 97}" r="7"/></g>`;
  her += `<path d="M${hx - 26},${hy + 40} C${hx - 30},${hy + 70} ${hx - 110},${hy + 80} ${hx - 130},${hy + 140} L${hx - 150},600 L${hx + 160},600 L${hx + 130},${hy + 140} C${hx + 110},${hy + 82} ${hx + 30},${hy + 70} ${hx + 26},${hy + 40}Z"/>`;
  // sewing arm: from her right shoulder to the needle hand
  const sh = [hx + 100, hy + 120];
  const hand = [lerp(hx + 150, hx + 186, up), lerp(hy + 230, hy + 120, up)];
  const elbow = [lerp(hx + 170, hx + 200, up), lerp(hy + 220, hy + 200, up)];
  her += `<path d="M${sh[0]},${sh[1]} Q${f2(elbow[0] + 20)},${f2(elbow[1])} ${f2(hand[0])},${f2(hand[1])}" stroke="#5A2E14" stroke-width="30" stroke-linecap="round" fill="none"/>`;
  her += `<circle cx="${f2(hand[0])}" cy="${f2(hand[1])}" r="17"/>`;
  // the thread drawn up from the cloth in her lap
  her += `<path d="M${f2(hand[0])},${f2(hand[1])} L${f2(hx + 120)},${hy + 250}" stroke="#5A2E14" stroke-width="2" opacity="${f2(0.4 + up * 0.5)}"/>`;
  // him: enters from the right at 32.81, standing behind her (headscarf with two hanging tails)
  const enter = ramp(t, 32.81, 33.5, E.out);
  const gx = lerp(620, 330, enter), gy = 150;
  const reach = ramp(t, 33.30, 33.646, E.inOut); // hand lands on her shoulder at 33.646
  let him = `<g transform="translate(${f2(gx)} 0)">` +
    `<ellipse cx="0" cy="${gy}" rx="50" ry="58"/>` +
    `<path d="M-46,${gy - 20} C-48,${gy - 80} 48,${gy - 86} 48,${gy - 24}Z"/>` + // headscarf crown
    `<path d="M26,${gy - 40} C64,${gy - 30} 82,${gy + 10} 92,${gy + 70} L80,${gy + 74} C70,${gy + 26} 56,${gy - 6} 22,${gy - 18}Z"/>` + // tail 1
    `<path d="M30,${gy - 26} C78,${gy - 4} 100,${gy + 40} 112,${gy + 98} L98,${gy + 100} C88,${gy + 52} 70,${gy + 18} 26,${gy - 8}Z"/>` + // tail 2
    `<path d="M-28,${gy + 50} C-34,${gy + 80} -120,${gy + 96} -140,${gy + 170} L-160,600 L160,600 L140,${gy + 170} C120,${gy + 96} 34,${gy + 80} 28,${gy + 50}Z"/></g>`;
  // his arm to her shoulder
  const hs = [gx - 110, gy + 150];
  const target = [hx + 70 + lean * 6, hy + 92];
  const hand2 = [lerp(gx - 120, target[0], reach), lerp(gy + 300, target[1], reach)];
  const el2 = [lerp(gx - 150, (hs[0] + hand2[0]) / 2 - 10, reach), lerp(gy + 260, (hs[1] + hand2[1]) / 2 + 40, reach)];
  if (enter > 0.05) {
    him += `<path d="M${f2(hs[0])},${f2(hs[1])} Q${f2(el2[0])},${f2(el2[1])} ${f2(hand2[0])},${f2(hand2[1])}" stroke="#5A2E14" stroke-width="34" stroke-linecap="round" fill="none"/>`;
    him += `<ellipse cx="${f2(hand2[0])}" cy="${f2(hand2[1] + 4)}" rx="26" ry="16" transform="rotate(-12 ${f2(hand2[0])} ${f2(hand2[1])})"/>`;
  }
  return her + him;
}

function lantern(t, x, y) {
  // red lantern hanging from the eave at (x, y_top), swinging 2° at 0.5 Hz (d 1.1)
  const a = Math.sin(t * Math.PI) * 2;
  const top = 132, cy = y;
  return `<g transform="rotate(${f2(a)} ${x} ${top})">` +
    `<line x1="${x}" y1="${top}" x2="${x}" y2="${cy - 64}" stroke="#2A1C17" stroke-width="3"/>` +
    `<rect x="${x - 26}" y="${cy - 70}" width="52" height="14" rx="3" fill="#2A1C17"/>` +
    `<ellipse cx="${x}" cy="${cy}" rx="58" ry="66" fill="url(#t04lan)"/>` +
    [-38, -18, 0, 18, 38].map((dx) => `<path d="M${x + dx * 0.3},${cy - 62} Q${x + dx * 1.6},${cy} ${x + dx * 0.3},${cy + 62}" stroke="#8E2A20" stroke-width="2" fill="none" opacity="0.6"/>`).join('') +
    `<rect x="${x - 26}" y="${cy + 56}" width="52" height="14" rx="3" fill="#2A1C17"/>` +
    `<path d="M${x - 6},${cy + 70} L${x - 10},${cy + 128} M${x},${cy + 70} L${x},${cy + 134} M${x + 6},${cy + 70} L${x + 10},${cy + 128}" stroke="#C8372D" stroke-width="3"/></g>`;
}

function s07(t) {
  // camera: push 1.00 → 1.18 toward the window (ease in), then accelerate through the paper 35.0 → 35.306
  const k = ramp(t, 31.974, 35.0, E.in);
  let z = lerp(1.0, 1.18, k);
  if (t > 35.0) z = zexp(t, 35.0, T_PUSH + 0.02, 1.18, 5.0, E.in);
  const scr = [lerp(WC[0], 1000, k + ramp(t, 35.0, T_PUSH, E.in) * 0.3), lerp(WC[1], 520, k)];
  const c = camAt([WC[0] - 40, WC[1] - 20], scr, z);
  let s = `<defs>${'<radialGradient id="t04lan" cx="0.45" cy="0.42" r="0.6"><stop offset="0" stop-color="#FFD9A0"/><stop offset="0.45" stop-color="#E8573A"/><stop offset="1" stop-color="#A3261C"/></radialGradient>'}</defs>`;
  s += L(c, 0.25, SET_FAR, { id: 't04far', bleed: 'all' });
  s += L(c, 1, SET_WALL +
    winGlow(WC[0], WC[1], 520, 0.55, '#FFC56E', 't04wg') + winGlow(520, 260, 260, 0.35, '#E8573A', 't04lg') +
    `<g transform="translate(${WX} ${WY})">${latticeWindow({ id: 't04w', glow: 1, shadows: shadows(t), shadowBlur: 3.5 })}</g>`, { id: 't04wall', bleed: 'all' });
  s += L(c, 1.1, lantern(t, 520, 262), { id: 't04lantern' });
  s += L(c, 1.15, SET_EAVE, { id: 't04eave', bleed: 'lrt' });
  return s;
}

// ------------------------------------------------------------------ S08 two tea bowls
function bowl(cx, cy, id, fill = 0.8) {
  // 建盏, Ø 264 px, rim centre (cx, cy), seen from ~15° above
  const rx = 132, ry = 34;
  let s = `<ellipse cx="${cx + 14}" cy="${cy + 180}" rx="150" ry="30" fill="#140C08" opacity="0.55"/>`; // table shadow
  s += `<path d="M${cx - rx},${cy} C${cx - rx + 6},${cy + 70} ${cx - 70},${cy + 140} ${cx - 44},${cy + 152} L${cx - 46},${cy + 174} L${cx + 46},${cy + 174} L${cx + 44},${cy + 152} C${cx + 70},${cy + 140} ${cx + rx - 6},${cy + 70} ${cx + rx},${cy}Z" fill="url(#${id}g)" stroke="#0A0705" stroke-width="2"/>`;
  // unglazed foot
  s += `<path d="M${cx - 46},${cy + 156} L${cx - 46},${cy + 174} L${cx + 46},${cy + 174} L${cx + 46},${cy + 156} Q${cx},${cy + 166} ${cx - 46},${cy + 156}Z" fill="#7A5A3C"/>`;
  // glaze drip edge
  s += `<path d="M${cx - 60},${cy + 140} Q${cx - 30},${cy + 160} ${cx},${cy + 150} Q${cx + 30},${cy + 162} ${cx + 62},${cy + 138}" stroke="#2A1608" stroke-width="5" fill="none"/>`;
  // hare's-fur streaks near the rim
  let hf = '';
  for (let i = 0; i < 26; i++) {
    const a = -0.95 + (i / 25) * 1.9, x0 = cx + Math.sin(a) * (rx - 6), y0 = cy + 6 + Math.cos(a) * 4;
    hf += `<path d="M${f2(x0)},${f2(y0)} l${f2(-Math.sin(a) * 14)},${f2(40 + (i % 3) * 14)}" stroke="#7B4A22" stroke-width="2" opacity="0.55"/>`;
  }
  s += hf;
  // highlight
  s += `<path d="M${cx - 96},${cy + 26} C${cx - 92},${cy + 70} ${cx - 70},${cy + 110} ${cx - 54},${cy + 124}" stroke="#E8D8C0" stroke-width="7" fill="none" opacity="0.28" stroke-linecap="round"/>`;
  // opening: inner wall + tea
  s += `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#0E0A07" stroke="#6B3A1E" stroke-width="5"/>`;
  if (fill > 0) {
    const fr = 0.86 * (0.7 + 0.3 * fill);
    s += `<ellipse cx="${cx}" cy="${cy + 6}" rx="${f2(rx * fr)}" ry="${f2(ry * fr)}" fill="#A07A3A"/>` +
      `<ellipse cx="${cx - 20}" cy="${cy + 2}" rx="${f2(rx * fr * 0.55)}" ry="${f2(ry * fr * 0.35)}" fill="#E8C88A" opacity="0.35"/>`;
  }
  s += `<path d="M${cx - rx + 4},${cy - 2} Q${cx},${cy - ry - 6} ${cx + rx - 4},${cy - 2}" stroke="#C08A55" stroke-width="2.5" fill="none" opacity="0.6"/>`;
  return s;
}
const BOWL_DEFS = (id) => `<linearGradient id="${id}g" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#3A2618"/><stop offset="0.35" stop-color="#17100B"/><stop offset="0.8" stop-color="#0B0705"/><stop offset="1" stop-color="#2A1A10"/></linearGradient>`;

function steamRibbon(t, x0, y0, seed, twineK, cx, dir) {
  // one steam ribbon rising from (x0, y0); after the twine it leans to the centre column cx and braids
  let d = '';
  const pts = [];
  for (let i = 0; i <= 26; i++) {
    const h = i * 22, y = y0 - h;
    const wob = noise1(h / 90 - t * 0.9, seed) * 18 * (0.3 + h / 300) + Math.sin(h / 60 - t * 2.2 + seed) * 8;
    const lean = twineK * clamp(h / 260) * (cx - x0);
    const braid = twineK * clamp((h - 200) / 200) * Math.sin(h / 55 - t * 2.6 + (dir > 0 ? 0 : Math.PI)) * 34;
    pts.push([x0 + wob * (1 - twineK * 0.6) + lean + braid, y]);
  }
  d = smooth(pts, false);
  return d;
}

function herHand(x, y, rot = 0) {
  // her right hand holding the ewer handle, pink sleeve from the upper right; (x, y) = grip centre
  const sk = '#F4D2BC', skS = '#E0B49A', ln = '#2A1C17';
  return `<g transform="translate(${f2(x)} ${f2(y)}) rotate(${f2(rot)})">` +
    `<path d="M40,-70 C90,-110 220,-150 330,-200 L420,-60 C300,-20 160,10 70,10Z" fill="#E7C4C9" stroke="${ln}" stroke-width="2.5"/>` + // sleeve
    `<path d="M60,-40 C120,-60 230,-100 380,-130" stroke="#C99AA2" stroke-width="3" fill="none" opacity="0.8"/>` +
    `<path d="M44,-66 C30,-50 34,0 52,12 L84,4 C70,-18 70,-48 78,-72Z" fill="#FBF4EC" stroke="${ln}" stroke-width="2"/>` + // inner white cuff
    `<path d="M-8,-48 C-30,-50 -52,-36 -54,-14 C-56,10 -40,30 -16,34 C10,38 34,28 46,10 C56,-8 54,-36 40,-50 C26,-62 6,-58 -8,-48Z" fill="${sk}" stroke="${ln}" stroke-width="2.2"/>` + // back of hand
    `<path d="M-50,-10 C-62,-4 -66,14 -56,24 C-48,32 -34,30 -28,20" fill="${sk}" stroke="${ln}" stroke-width="2"/>` + // curled index
    `<path d="M-44,14 C-54,24 -52,40 -40,44 C-30,48 -20,40 -18,30" fill="${sk}" stroke="${ln}" stroke-width="2"/>` +
    `<path d="M-30,30 C-36,42 -30,54 -18,54 C-8,54 -2,46 -4,36" fill="${sk}" stroke="${ln}" stroke-width="2"/>` +
    `<path d="M-34,-44 C-54,-60 -78,-58 -84,-46 C-88,-36 -76,-30 -58,-30 C-48,-30 -40,-34 -34,-40" fill="${sk}" stroke="${ln}" stroke-width="2"/>` + // thumb on top
    `<path d="M-20,-30 C-6,-24 14,-26 30,-36" stroke="${skS}" stroke-width="3" fill="none" opacity="0.7"/></g>`;
}

function ewer(x, y, tilt) {
  // Song 注子 (qingbai porcelain): body centre (x, y), tilted by `tilt` degrees (spout to the left)
  return `<g transform="translate(${f2(x)} ${f2(y)}) rotate(${f2(tilt)})">` +
    `<path d="M-30,-150 C-34,-130 -40,-118 -36,-104 C-80,-90 -96,-30 -92,20 C-88,80 -50,118 0,120 C50,118 88,80 92,20 C96,-30 80,-90 36,-104 C40,-118 34,-130 30,-150Z" fill="url(#t04ew)" stroke="#2A1C17" stroke-width="2.5"/>` +
    `<ellipse cx="0" cy="-152" rx="34" ry="9" fill="#BFD3CB" stroke="#2A1C17" stroke-width="2"/><ellipse cx="0" cy="-166" rx="20" ry="12" fill="#CFE0D8" stroke="#2A1C17" stroke-width="2"/>` +
    `<path d="M-78,-30 C-130,-60 -170,-110 -196,-170 L-182,-176 C-160,-124 -122,-80 -70,-52Z" fill="#CFE0D8" stroke="#2A1C17" stroke-width="2.5"/>` + // spout
    `<path d="M80,-80 C150,-90 160,10 86,40" fill="none" stroke="#2A1C17" stroke-width="20" stroke-linecap="round"/><path d="M80,-80 C150,-90 160,10 86,40" fill="none" stroke="#CFE0D8" stroke-width="14" stroke-linecap="round"/>` + // handle
    `<path d="M-60,-40 C-66,10 -50,60 -20,90" stroke="#fff" stroke-width="8" opacity="0.4" fill="none" stroke-linecap="round"/>` +
    [-50, -20, 10, 40].map((dx) => `<path d="M${dx},-96 C${dx - 6},-20 ${dx - 2},60 ${dx + 4},112" stroke="#9FB8AE" stroke-width="2" fill="none" opacity="0.5"/>`).join('') +
    `</g>`;
}
// spout tip and handle grip in ewer-local coords
const SPOUT = [-189, -173], HANDLE = [140, -20];
const rotp = (p, deg, x, y) => { const r = (deg * Math.PI) / 180; return [x + p[0] * Math.cos(r) - p[1] * Math.sin(r), y + p[0] * Math.sin(r) + p[1] * Math.cos(r)]; };

function hisHand(cx, cy, stroke) {
  // his right hand cupping the left bowl from the left side; green sleeve from the left edge; thumb over the rim
  const sk = '#EFB58E', skS = '#D29A76', ln = '#2A1C17';
  const th = stroke * 26;
  return `<g transform="translate(${cx} ${cy})">` +
    `<path d="M-700,40 C-520,10 -330,-10 -210,10 L-190,150 C-330,170 -520,190 -700,220Z" fill="#2F6B52" stroke="${ln}" stroke-width="2.5"/>` +
    `<path d="M-640,70 C-480,50 -360,40 -240,46" stroke="#22513E" stroke-width="4" fill="none"/>` +
    `<path d="M-214,8 C-226,40 -226,120 -200,152 L-176,146 C-196,110 -196,46 -186,14Z" fill="#E9E2D2" stroke="${ln}" stroke-width="2"/>` + // inner cuff
    // palm / back of hand wrapping the bowl's left flank
    `<path d="M-190,30 C-170,6 -138,0 -116,14 C-98,26 -96,60 -100,96 C-104,126 -120,150 -150,156 C-176,160 -192,140 -194,110Z" fill="${sk}" stroke="${ln}" stroke-width="2.4"/>` +
    // fingers curling round the bowl body (front)
    `<path d="M-112,40 C-90,44 -70,56 -62,74 C-58,86 -66,92 -76,88 C-86,72 -100,64 -114,62Z" fill="${sk}" stroke="${ln}" stroke-width="2"/>` +
    `<path d="M-110,70 C-86,78 -66,92 -60,110 C-58,122 -68,126 -78,120 C-88,104 -102,98 -114,96Z" fill="${sk}" stroke="${ln}" stroke-width="2"/>` +
    `<path d="M-112,100 C-92,110 -76,124 -72,140 C-70,150 -80,152 -88,146 C-96,134 -106,128 -118,126Z" fill="${sk}" stroke="${ln}" stroke-width="2"/>` +
    // thumb over the rim (strokes along it at 37.40)
    `<path d="M-150,22 C-138,-6 ${f2(-112 + th)},-24 ${f2(-86 + th)},-28 C${f2(-74 + th)},-30 ${f2(-70 + th)},-20 ${f2(-80 + th)},-12 C${f2(-100 + th)},-2 -122,10 -134,34Z" fill="${sk}" stroke="${ln}" stroke-width="2.2"/>` +
    `<path d="M-180,60 C-168,80 -150,92 -130,96" stroke="${skS}" stroke-width="3" fill="none" opacity="0.7"/></g>`;
}

function s08(t) {
  // camera: truck left 4 px/frame, then tilt up with the steam from 37.40
  const tx = (t - T_PUSH) * 120;
  const ty = -260 * ramp(t, 37.4, 38.75, E.inOut);
  const z = lerp(1.0, 1.04, ramp(t, T_PUSH, 38.64, E.sine));
  const c = { x: -tx + 200, y: ty, zoom: z };
  const B1 = [840, 640], B2 = [1180, 640];
  let defs = BOWL_DEFS('t04b1') + BOWL_DEFS('t04b2') +
    `<linearGradient id="t04ew" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#A9C2B8"/><stop offset="0.4" stop-color="#DCEBE4"/><stop offset="1" stop-color="#8FA89E"/></linearGradient>` +
    `<radialGradient id="t04lamp" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#FFD58A" stop-opacity="0.9"/><stop offset="0.4" stop-color="#F2B05A" stop-opacity="0.45"/><stop offset="1" stop-color="#F2B05A" stop-opacity="0"/></radialGradient>` +
    `<linearGradient id="t04tab" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4A3020"/><stop offset="0.4" stop-color="#6B4A30"/><stop offset="1" stop-color="#3A2618"/></linearGradient>` +
    `<radialGradient id="t04key" cx="0.72" cy="0.2" r="0.8"><stop offset="0" stop-color="#F2B05A" stop-opacity="0.28"/><stop offset="1" stop-color="#F2B05A" stop-opacity="0"/></radialGradient>`;
  let s = `<defs>${defs}</defs>`;
  // room (d 0.2): dark warm, a hint of a screen and the lamp glow
  s += L(c, 0.2, `<rect x="-400" y="-900" width="2900" height="2400" fill="#2A1A12"/><rect x="200" y="-500" width="560" height="880" fill="#33221A"/><rect x="1300" y="-600" width="700" height="980" fill="#2F1F17"/>` +
    `<ellipse cx="1500" cy="40" rx="700" ry="520" fill="url(#t04key)"/>`, { id: 't04room', bleed: 'all' });
  // table top (d 0.9)
  s += L(c, 0.9, `<path d="M-600,560 L2600,560 L2600,1500 L-600,1500Z" fill="url(#t04tab)"/>` +
    Array.from({ length: 14 }, (_, i) => `<path d="M-600,${590 + i * 34 + i * i * 3} Q900,${584 + i * 34 + i * i * 3} 2600,${596 + i * 34 + i * i * 3}" stroke="#3A2618" stroke-width="2" fill="none" opacity="0.5"/>`).join('') +
    `<path d="M-600,560 L2600,560" stroke="#8A6040" stroke-width="3" opacity="0.6"/>`, { id: 't04table', bleed: 'all' });
  // steam (behind the ewer, in front of the room), d 1.0
  const tw = ramp(t, 36.6, 37.5, E.inOut);
  const sA = steamRibbon(t, B1[0] - 10, B1[1] - 14, 3, tw, 1010, 1), sB = steamRibbon(t, B2[0] + 6, B2[1] - 14, 9, tw, 1010, -1);
  const sop = 0.32 + 0.1 * ramp(t, 35.8, 36.6);
  const steam = [sA, sB].map((d) => `<path d="${d}" stroke="#FFF3DD" stroke-width="26" fill="none" stroke-linecap="round" opacity="${f2(sop * 0.5)}"/><path d="${d}" stroke="#FFF3DD" stroke-width="9" fill="none" stroke-linecap="round" opacity="${f2(sop)}"/>`).join('');
  s += L(c, 1.0, `<g filter="url(#t04stb)">${steam}</g><defs><filter id="t04stb" x="-50%" y="-20%" width="200%" height="140%"><feGaussianBlur stdDeviation="6"/></filter></defs>`, { id: 't04steam', bleed: 'all' });
  // bowls (his left, hers right)
  const fill1 = 0.55 + 0.45 * ramp(t, 35.72, 36.56, E.lin);
  s += L(c, 1.0, bowl(B1[0], B1[1], 't04b1', fill1) + bowl(B2[0], B2[1], 't04b2', 1), { id: 't04bowls' });
  // ewer + her hand: in 35.31–35.72, tilt 35.72–36.56 pour, lift away 36.6–37.2
  const into = ramp(t, T_PUSH, 35.72, E.out), lift = ramp(t, 36.56, 37.3, E.inOut);
  const ex = lerp(1280, 1010, into) + lift * 300, ey = lerp(240, 330, into) - lift * 260;
  const tilt = lerp(-6, -38, ramp(t, 35.6, 35.85, E.inOut)) * (1 - ramp(t, 36.5, 36.8, E.inOut)) - 6;
  const sp = rotp(SPOUT, tilt, ex, ey), hd = rotp(HANDLE, tilt, ex, ey);
  let pour = '';
  const pouring = t > 35.72 && t < 36.62;
  if (pouring) {
    const k0 = ramp(t, 35.72, 35.84), k1 = ramp(t, 36.5, 36.62);
    const yTop = lerp(sp[1], B1[1] + 4, k1), yBot = lerp(sp[1], B1[1] + 4, k0);
    const xT = lerp(sp[0], B1[0] + 10, k1 * 0.6), xB = lerp(sp[0] - 4, B1[0] + 10, k0);
    pour = `<path d="M${f2(xT)},${f2(yTop)} Q${f2(xT - 30)},${f2((yTop + yBot) / 2)} ${f2(xB)},${f2(yBot)}" stroke="#D9B26A" stroke-width="7" fill="none" stroke-linecap="round" opacity="0.85"/>` +
      `<path d="M${f2(xT)},${f2(yTop)} Q${f2(xT - 30)},${f2((yTop + yBot) / 2)} ${f2(xB)},${f2(yBot)}" stroke="#FFF1CC" stroke-width="2" fill="none" opacity="0.8"/>`;
    if (k0 >= 1) pour += `<ellipse cx="${B1[0] + 10}" cy="${B1[1] + 6}" rx="${f2(16 + 4 * Math.sin(t * 40))}" ry="5" fill="#FFF1CC" opacity="0.5"/>`;
  }
  s += L(c, 1.05, pour + ewer(ex, ey, tilt) + herHand(hd[0] + 8, hd[1] - 6, tilt * 0.6), { id: 't04ewer', bleed: 'tr' });
  // his hand on his bowl (left), thumb strokes the rim at 37.40
  const strokeK = Math.sin(ramp(t, 37.4, 38.2, E.inOut) * Math.PI);
  s += L(c, 1.0, hisHand(B1[0], B1[1], strokeK), { id: 't04hishand', bleed: 'l' });
  // lamp edge at the right, blurred foreground (d 1.5)
  s += L(c, 1.5, `<ellipse cx="2050" cy="170" rx="300" ry="300" fill="url(#t04lamp)"/>`, { id: 't04lampfg', bleed: 'all' });
  return s;
}

export default {
  enter: { a: 31.56, b: 31.974, type: 'dissolve', ease: E.inOut },
  frame(t) {
    if (t < T_PUSH) {
      let s = s07(t);
      // warm bloom as the camera goes through the paper
      const b = ramp(t, 34.95, T_PUSH, E.in);
      if (b > 0) s += `<rect width="1920" height="1080" fill="#FFE2A8" opacity="${f2(b)}"/>`;
      return s;
    }
    let s = s08(t);
    const b = 1 - ramp(t, T_PUSH, T_PUSH + 0.27, E.out);
    if (b > 0) s += `<rect width="1920" height="1080" fill="#FFE2A8" opacity="${f2(b)}"/>`;
    return s;
  },
};
