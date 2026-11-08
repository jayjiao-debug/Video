// The whole film: takes on one timeline + film-level overlays (subtitles, location stamp, brand seal, fibre).
// A take module (film/takes/tNN.mjs) default-exports:
//   { id, t0, t1, frame(t) -> SVG string (1920x1080 user space), enter?: {a, b, type:'dissolve'|'mask', mask?(t)},
//     subYc?(t) -> subtitle band centre, noBrand?(t) -> bool }
// frame(t) must render sensibly for t in [enter.a, t1 + 0.5] (it can be drawn before its t0 or after its t1 during
// a transition). Cross-take transitions belong to the INCOMING take (enter): during [a, b] the previous take is drawn
// at t underneath and this take on top, faded (dissolve) or through mask(t) (white = this take).
import fs from 'fs';
import { W, H, f2, clamp, blurDefs, fibre, jseal, ramp } from './lib.mjs';
import { subtitle, SUB_DEFS } from './subs.mjs';

const SLOTS = [
  ['T01', 0, 18.657, 'S01–S04 休书 · farewell'],
  ['T02', 18.657, 26.97, 'S05 title'],
  ['T03', 26.97, 31.974, 'S06 training ground'],
  ['T04', 31.974, 38.638, 'S07–S08 home'],
  ['T05', 38.638, 53.21, 'S09–S12 岳庙'],
  ['T06', 53.21, 56.93, 'S13 樊楼'],
  ['T07', 56.93, 59.87, 'S14–S15 eyes · 白虎节堂'],
  ['T08', 59.87, 73.6, 'S16–S19 brand · cangue · road · promise'],
  ['T09', 73.6, 77.748, 'S20–S21 沧州 snow'],
  ['T10', 77.748, 93.565, 'S22–S24 temple'],
  ['T11', 93.565, 115.217, 'S25–S28 door · 梁山 · news'],
  ['T12', 115.217, 125.62, 'S29–S30 tear · window'],
  ['T13', 125.62, 148.5, 'S31–END'],
];

function placeholder(id, t0, t1, label) {
  return {
    id, t0, t1, placeholder: true,
    frame: (t) => `<rect width="1920" height="1080" fill="#1d1a18"/><text x="960" y="470" fill="#8a7f72" font-family="Noto Sans CJK SC" font-size="56" text-anchor="middle">${id} · ${label}</text><text x="960" y="560" fill="#5f574e" font-family="Noto Sans CJK SC" font-size="40" text-anchor="middle">${t0.toFixed(2)}–${t1.toFixed(2)} s · t=${t.toFixed(2)}</text>`,
  };
}

export async function loadTakes() {
  const takes = [];
  for (const [id, t0, t1, label] of SLOTS) {
    const file = new URL(`./takes/${id.toLowerCase()}.mjs`, import.meta.url);
    if (fs.existsSync(file)) {
      try {
        const m = (await import(file.href + `?v=${fs.statSync(file).mtimeMs}`)).default;
        takes.push({ ...m, id, t0, t1 });
      } catch (e) {
        // a take being edited must not break everyone else's renders
        console.error(`[film] ${id} failed to load (placeholder used): ${String(e.message).split('\n')[0]}`);
        takes.push(placeholder(id, t0, t1, label + ' (load error)'));
      }
    } else takes.push(placeholder(id, t0, t1, label));
  }
  return takes;
}

// 沧州 location stamp (replaces the cut lines V20/V21): top-right, two lines, ≥ 120 px from the edge.
export function stamp(t) {
  const a = 73.85, b = 77.2;
  if (t < a - 0.1 || t > b + 0.1) return '';
  const op = Math.min(ramp(t, a, a + 0.45), 1 - ramp(t, b - 0.4, b));
  if (op <= 0) return '';
  const x = 1920 - 150, y = 118;
  return `<g data-layer="text-stamp" data-z="880" opacity="${f2(op)}"><ellipse cx="${x - 170}" cy="${y + 30}" rx="300" ry="110" fill="url(#subshade)"/>` +
    `<text x="${x}" y="${y}" text-anchor="end" font-family="LXGW WenKai" font-weight="700" font-size="50" fill="#F6F0E4" stroke="#1a2230" stroke-opacity="0.45" stroke-width="5" paint-order="stroke" letter-spacing="4">沧州 · 草料场</text>` +
    `<rect x="${x - 330}" y="${y + 26}" width="330" height="3" fill="#C9A45C"/>` +
    `<text x="${x}" y="${y + 82}" text-anchor="end" font-family="LXGW WenKai" font-weight="700" font-size="44" fill="#F2EDE2" stroke="#1a2230" stroke-opacity="0.6" stroke-width="6" paint-order="stroke" letter-spacing="3">那年冬天，大雪</text></g>`;
}

/** Full SVG document for global time t. */
export function frameSVG(takes, t, opts = {}) {
  const i = takes.findIndex((k) => t >= k.t0 && t < k.t1);
  const idx = i < 0 ? takes.length - 1 : i;
  let cur = takes[idx];
  let body = '';
  // a transition window owned by the next take may start before its t0
  const nxt = takes[idx + 1];
  let inc = null, out = null;
  if (nxt && nxt.enter && t >= nxt.enter.a && t < nxt.t0) { out = cur; inc = nxt; }
  else if (cur.enter && t >= cur.enter.a && t < cur.enter.b && idx > 0) { out = takes[idx - 1]; inc = cur; }
  if (inc) {
    const en = inc.enter;
    body += `<g data-take="${out.id}">${out.frame(t)}</g>`;
    if (en.type === 'mask') {
      body += `<defs><mask id="tmask" maskUnits="userSpaceOnUse" x="0" y="0" width="1920" height="1080"><rect width="1920" height="1080" fill="#000"/>${en.mask(t)}</mask></defs>`;
      body += `<g data-take="${inc.id}" mask="url(#tmask)">${inc.frame(t)}</g>`;
    } else {
      const k = (en.ease || ((x) => x))(clamp((t - en.a) / (en.b - en.a)));
      body += `<g data-take="${inc.id}" opacity="${f2(k)}">${inc.frame(t)}</g>`;
    }
    cur = t >= inc.t0 ? inc : out;
  } else body = `<g data-take="${cur.id}">${cur.frame(t)}</g>`;

  let over = '';
  if (!opts.clean) {
    if (!(cur.noFibre && cur.noFibre(t))) over += fibre(0.05);
    over += stamp(t);
    over += subtitle(t, { yc: cur.subYc ? cur.subYc(t) : 890 });
    if (!(cur.noBrand && cur.noBrand(t)) && t < 141.8) over += `<g data-layer="brand" data-z="950">${jseal(1920 - 120 - 37, 1080 - 58 - 37, 74)}</g>`;
  }
  const defs = blurDefs() + SUB_DEFS;
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><defs>${defs}</defs><rect width="1920" height="1080" fill="#000"/>${body}${over}</svg>`;
}
