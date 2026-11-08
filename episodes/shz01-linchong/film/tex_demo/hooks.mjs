// Texture/detail proof: decorates three existing v2 sets through lib.BAKE_HOOKS, without editing the take files.
//   node render.mjs stills <dir> <times> --clean --hooks=tex_demo/hooks.mjs
// Each hook receives the bake's own SVG (same coordinates as the take code) and adds detail on top of it.
import { BAKE_HOOKS, f2, rng } from '../lib.mjs';
import { tex, woodGrain, planks, plasterWall, stoneSlabs, tileRows, dirt, stains, cracks, patina, edgeWear, fabricFolds, straw, lightGrad } from '../tex.mjs';

// ---------------------------------------------------------------- (a) tavern: S01 table, S02/S03 back wall
BAKE_HOOKS.t01table = ({ inner, defs }) => {
  let s = inner;
  const R = rng(3);
  for (let i = 0; i < 9; i++) {
    const y = i * 170 - 20;
    s += woodGrain(0, y, 2400, 164, { seed: 40 + i, spacing: 8, knots: R() < 0.6 ? 1 : 0 });
    s += edgeWear([[0, y + 2], [2400, y + 2]], { seed: 50 + i, lop: 0.16, every: 90 });
  }
  s += tex('wood', { rect: [0, 0, 2400, 1500] }, { op: 0.45, scale: 0.9 });
  // use marks: knife scratches, a cup ring, old ink spots near the inkstone corner
  for (let i = 0; i < 26; i++) {
    const x = R() * 2400, y = R() * 1500, a = (R() - 0.5) * 0.5, l = 30 + R() * 120;
    s += `<path d="M${f2(x)},${f2(y)} l${f2(Math.cos(a) * l)},${f2(Math.sin(a) * l)}" stroke="#E8C9A0" stroke-width="1.2" opacity="${f2(0.08 + R() * 0.1)}"/>`;
  }
  s += `<ellipse cx="560" cy="1060" rx="92" ry="70" fill="none" stroke="#24180F" stroke-width="5" opacity="0.18"/><ellipse cx="572" cy="1066" rx="86" ry="64" fill="none" stroke="#24180F" stroke-width="2" opacity="0.12"/>`;
  for (let i = 0; i < 7; i++) s += `<ellipse cx="${f2(1700 + R() * 300)}" cy="${f2(250 + R() * 220)}" rx="${f2(3 + R() * 7)}" ry="${f2(2 + R() * 5)}" fill="#0E0B09" opacity="${f2(0.25 + R() * 0.3)}"/>`;
  s += dirt(0, 0, 2400, 1500, { seed: 5, op: 0.18, from: 0.0, specks: 120 });
  return { inner: s, defs };
};

BAKE_HOOKS.t01tavern = ({ inner, defs }) => {
  // the back wall is inside a blurred group (out of focus): put the detail INSIDE it so it blurs the same way
  let add = '';
  for (let i = 0; i < 18; i++) add += woodGrain(i * 150, 0, 146, 980, { dir: 'v', seed: 70 + i, spacing: 7, knots: i % 3 === 0 ? 1 : 0 });
  add += tex('wood', { rect: [0, 0, 2600, 980] }, { op: 0.55, rot: 90, scale: 0.8 });
  add += planks(0, 980, 2600, 520, 4, { keepBase: true, seed: 90, texOp: 0.5, nails: false });
  add += stains(0, 0, 2600, 980, { seed: 6, n: 10, col: '#24180F', blur: 26 });
  add += dirt(0, 600, 2600, 380, { seed: 8, op: 0.35, specks: 30 });
  // the doorway frame: worn posts and lintel
  add += woodGrain(1400, 80, 40, 1060, { dir: 'v', seed: 3, spacing: 5 }) + woodGrain(2000, 80, 40, 1060, { dir: 'v', seed: 4, spacing: 5 });
  add += edgeWear([[1440, 82], [1440, 1140]], { seed: 9, lop: 0.4 }) + edgeWear([[1400, 130], [2040, 130]], { seed: 10, lop: 0.3 });
  // lattice window: a paper texture in the panes
  add += tex('paper', { rect: [260, 200, 420, 380] }, { op: 0.5, mode: 'multiply', scale: 0.5 });
  const k = inner.lastIndexOf('</g>');
  return { inner: inner.slice(0, k) + add + inner.slice(k), defs };
};

// ---------------------------------------------------------------- (b) 山神庙 interior (T10)
BAKE_HOOKS.t10_room = ({ inner, defs }) => {
  const X = (x) => x + 240, Y = (y) => y + 200, FL = 1010;
  const vig = '<rect x="0" y="0" width="2400" height="1500" fill="url(#t10vig)"/>';
  let add = '';
  // old lime plaster on the walls, water stains, cracks, soot above the altar, grime toward the floor
  add += plasterWall(0, 0, 2400, Y(FL), { keepBase: true, seed: 12, texOp: 0.6, stains: 12, stainCol: '#1E1814', cracks: 0, skirt: 110, skirtCol: '#1A1512', dirtOp: 0.45 });
  add += `<defs><radialGradient id="t10soot"><stop offset="0" stop-color="#0E0B09" stop-opacity="0.32"/><stop offset="0.6" stop-color="#0E0B09" stop-opacity="0.12"/><stop offset="1" stop-color="#0E0B09" stop-opacity="0"/></radialGradient></defs>` +
    `<ellipse cx="${X(320)}" cy="${Y(40)}" rx="300" ry="260" fill="url(#t10soot)" style="mix-blend-mode:multiply"/>`;
  // cracks only on bare wall (the hook paints over the whole bake, so keep them off the altar and the statue)
  add += cracks(X(700), Y(-40), 2400 - X(700), Y(FL) - Y(-40) - 160, { seed: 17, n: 6, len: 220 });
  // the beam
  add += woodGrain(0, Y(-60), 2400, 70, { seed: 4, spacing: 6, knots: 2 }) + edgeWear([[0, Y(-60)], [2400, Y(-60)]], { seed: 2, lop: 0.18 });
  // packed-earth floor with straw and dust
  add += tex('stone', { rect: [0, Y(FL), 2400, 300] }, { op: 0.5, scale: 0.55 });
  add += stains(0, Y(FL), 2400, 300, { seed: 9, n: 10, low: false, col: '#120E0B', blur: 20 });
  add += straw(X(150), Y(FL) + 6, 1300, 230, { seed: 5, n: 150 });
  // altar: worn planks, a chipped top slab, the red cloth with folds
  const cloth = `M${X(70)},${Y(600)} L${X(570)},${Y(600)} L${X(560)},${Y(860)} Q${X(320)},${Y(890)} ${X(80)},${Y(860)}Z`;
  const altarWood = `M${X(40)},${Y(590)} h560 v${FL - 590} h-560Z ${cloth}`; // the altar boards minus the cloth (evenodd)
  add += `<defs><clipPath id="t10xal"><path d="${altarWood}" clip-rule="evenodd"/></clipPath></defs><g clip-path="url(#t10xal)">${woodGrain(X(40), Y(590), 560, FL - 590, { dir: 'v', seed: 7, spacing: 9, knots: 2 })}</g>`;
  add += tex('wood', { d: altarWood, rule: 'evenodd', bbox: [X(40), Y(590), 560, FL - 590] }, { op: 0.5, rot: 90, scale: 0.6 });
  add += edgeWear([[X(20), Y(570)], [X(620), Y(570)]], { seed: 6, lop: 0.3, every: 40 });
  add += fabricFolds(X(70), Y(600), 500, 290, { seed: 3, n: 9, clip: cloth, texOp: 0.22 });
  // the statue: weathered clay (stone texture, soot)
  add += tex('stone', { rect: [X(150), Y(110), 340, 470] }, { op: 0.4, scale: 0.4 });
  add += tex('plaster', { rect: [X(1640), Y(-200), 560, FL + 260] }, { op: 0.45 });
  // the cold door light grazing the wall from the right (motivated by the cracks)
  add += lightGrad(0, 0, 2400, 1500, { key: [X(1480), Y(500)], r: 1100, warm: '#9FB6D8', warmOp: 0.12, cool: '#0A0C12', coolOp: 0.25 });
  return { inner: inner.replace(vig, add + vig), defs };
};

// ---------------------------------------------------------------- (c) 岳庙 courtyard (T05)
BAKE_HOOKS.t05floor = ({ inner, defs, w, h }) => {
  let s = inner;
  s += tex('stone', { rect: [0, 0, w, h] }, { op: 0.45, scale: 0.6 });
  s += stains(0, 0, w, h, { seed: 31, n: 14, low: false, col: '#7A6E5A', blur: 40, op: 0.55 });
  const R = rng(33);
  for (let i = 0; i < 220; i++) { // chips and worn bright patches
    const x = R() * w, y = R() * h, k = 3 + R() * 8 * (0.4 + y / h);
    s += R() < 0.6 ? `<path d="M${f2(x)},${f2(y)} l${f2(k)},${f2(k * 0.4)} l${f2(-k * 0.6)},${f2(k * 0.7)}Z" fill="#857967" opacity="0.5"/>`
      : `<ellipse cx="${f2(x)}" cy="${f2(y)}" rx="${f2(k * 3)}" ry="${f2(k)}" fill="#E6DCC8" opacity="0.18"/>`;
  }
  // moss in a few joints toward the edges
  for (let i = 0; i < 30; i++) { const x = R() < 0.5 ? R() * 900 : w - R() * 900, y = R() * h; s += `<ellipse cx="${f2(x)}" cy="${f2(y)}" rx="${f2(20 + R() * 40)}" ry="3" fill="#7E8A5A" opacity="0.25"/>`; }
  return { inner: s, defs };
};

BAKE_HOOKS.t05hall = ({ inner, defs }) => {
  const ox = 1000, oy = 700, X = (x) => x + ox, Y = (y) => y + oy;
  const haze = '<rect x="0" y="0" width="4400" height="1900" fill="#EAD9B6" opacity="0.18"/>';
  let add = '';
  add += tex('stone', { rect: [0, Y(470), 4400, 1900 - Y(470)] }, { op: 0.45, scale: 0.6 });
  add += plasterWall(X(-1000), Y(-80), 1400, 560, { keepBase: true, seed: 41, texOp: 0.5, stains: 6, stainCol: '#5A2A22', cracks: 3, dirtOp: 0.3 });
  add += plasterWall(X(3000), Y(-80), 1400, 560, { keepBase: true, seed: 42, texOp: 0.5, stains: 6, stainCol: '#5A2A22', cracks: 3, dirtOp: 0.3 });
  add += tex('stone', { rect: [X(260), Y(392), 2880, 86] }, { op: 0.5, scale: 0.5 }) + edgeWear([[X(260), Y(392)], [X(3140), Y(392)]], { seed: 5, lop: 0.35, every: 50 });
  for (let i = 0; i < 5; i++) add += edgeWear([[X(1250 - i * 26), Y(470 + i * 16)], [X(1250 - i * 26) + 900 + i * 52, Y(470 + i * 16)]], { seed: 60 + i, lop: 0.4, every: 45 });
  add += tex('wood', { rect: [X(360), Y(10), 2680, 390] }, { op: 0.4, rot: 90, scale: 0.5 });
  // columns: lacquer with craquelure, worn bases
  const R = rng(44);
  for (let i = 0; i <= 9; i++) {
    const cx = X(380 + i * 300);
    add += tex('canvas', { rect: [cx, Y(0), 44, 400] }, { op: 0.6, scale: 0.4, rot: 90 });
    for (let k = 0; k < 14; k++) add += `<rect x="${f2(cx + 4 + R() * 34)}" y="${f2(Y(0) + R() * 400)}" width="${f2(2 + R() * 6)}" height="${f2(1 + R() * 2)}" fill="#5C1F18" opacity="0.45"/>`;
    add += `<rect x="${cx}" y="${Y(330)}" width="44" height="70" fill="#E8C9A0" opacity="0.12"/>` + edgeWear([[cx + 2, Y(0)], [cx + 2, Y(400)]], { seed: 70 + i, lop: 0.22, every: 70 });
  }
  add += tex('wood', { rect: [X(300), Y(-60), 2800, 70] }, { op: 0.45, scale: 0.4 });
  // roof tiles on both tiers
  const eave = `M${X(0)},${Y(-40)} Q${X(140)},${Y(-60)} ${X(260)},${Y(-110)} L${X(560)},${Y(-330)} L${X(2840)},${Y(-330)} L${X(3140)},${Y(-110)} Q${X(3260)},${Y(-60)} ${X(3400)},${Y(-40)} Q${X(3200)},${Y(-70)} ${X(3000)},${Y(-60)} L${X(400)},${Y(-60)} Q${X(200)},${Y(-70)} ${X(0)},${Y(-40)}Z`;
  add += tex('tiles', { d: eave, bbox: [X(0), Y(-340), 3400, 300] }, { op: 0.5, scale: 0.45 });
  add += tex('tiles', { d: `M${X(700)},${Y(-372)} L${X(900)},${Y(-520)} L${X(2500)},${Y(-520)} L${X(2700)},${Y(-372)}Z`, bbox: [X(700), Y(-520), 2000, 150] }, { op: 0.5, scale: 0.4 });
  add += edgeWear([[X(400), Y(-60)], [X(3000), Y(-60)]], { seed: 8, lop: 0.3, every: 40, light: '#C9D2D8' });
  add += lightGrad(0, 0, 4400, 1900, { key: [X(900), Y(-400)], r: 2600, warm: '#FFF1D2', warmOp: 0.18, cool: '#5A4A3A', coolOp: 0.2 });
  return { inner: inner.replace(haze, add + haze), defs };
};

BAKE_HOOKS.t05roofs = ({ inner, defs, w, h }) => ({ inner: inner + tex('wash', { rect: [0, 0, w, h] }, { op: 0.4, scale: 1.2 }), defs });

BAKE_HOOKS.t05ding = ({ inner, defs }) => {
  const body = 'M-170,-240 L170,-240 C176,-170 150,-80 100,-44 C50,-24 -50,-24 -100,-44 C-150,-80 -176,-170 -170,-240Z';
  const add = `<g transform="translate(210 380)">${patina({ d: body, bbox: [-180, -245, 360, 225] }, { seed: 4, op: 0.55, n: 18, wear: 10 })}` +
    `${patina({ d: 'M-180,-262 L180,-262 L180,-236 L-180,-236Z', bbox: [-180, -262, 360, 26] }, { seed: 5, op: 0.5, n: 4, wear: 4 })}` +
    `${edgeWear([[-176, -262], [176, -262]], { seed: 6, lop: 0.45, light: '#D9C89A', every: 30 })}</g>`;
  return { inner: inner + add, defs };
};
