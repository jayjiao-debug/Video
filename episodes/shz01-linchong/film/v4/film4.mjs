// 《林冲为什么要休妻？》 v4 — the full cut, re-edited from the v2 takes to the v4 narration (vo_timeline_v4.json),
// plus the new v4 shots (film/board/v4new.mjs: scribe, door, the fight in silhouette, the 怒 close-up, the ink slash,
// the letter in lantern light) and the motion-capture stone push (film/board/pushtest.mjs).
//   node render.mjs video <out.mp4> 0 4455 --comp=v4/film4.mjs --hooks=tex_demo/hooksA.mjs
// Music anchors are the v2 ones (same 笛子戏 bed): title 18.657, the drop on the door 93.565, end card 141.862.
// Each EDL segment maps v4 time [a, b) to a source: a v2 take time range (played at the rate that fits), a new shot
// (static composition given camera motion), or the push composition.
import fs from 'fs';
import { W, H, f2, clamp, blurDefs, fibre, jseal, ramp, E, lerp, shake } from '../lib.mjs';
import { loadTakes, frameSVG as v2Frame, stamp } from '../film.mjs';
import { SUB_DEFS, subtitleLine } from '../subs.mjs';
import { KEYS } from '../board/v4new.mjs';
import * as PUSH from '../board/pushtest.mjs';

const TL = JSON.parse(fs.readFileSync(new URL('../../vo_timeline_v4.json', import.meta.url), 'utf8'));
const S = Object.fromEntries(TL.lines.map((l) => [l.id, l]));
const st = (id) => S[id].start;
export const DUR = 148.5;
const takes = await loadTakes();
const takeAt = (s) => takes.find((k) => s >= k.t0 && s < k.t1) || takes[takes.length - 1];

// ---------------------------------------------------------------- the edit
// v2: [a, b, 'v2', s0, s1] · new shot: [a, b, 'key', 'K26', {z0, z1, hit, dx, dy}] · push: [a, b, 'push', p0, p1]
const BRUSH = S.W33.end - 1.35;          // 「已故半载」 in the voice ≈ its last 1.35 s → T11's brush (v2 112.10)
const EDL = [
  [0, 18.657, 'v2', 0, 18.657],                         // W01–W05 the letter, her hands, his face, the farewell
  [18.657, 26.97, 'v2', 18.657, 26.97],                 // title
  [26.97, 29.25, 'v2', 26.97, 29.25],                   // W06 「一身本事」 the drill
  [29.25, st('W07'), 'v2', 31.974, 34.174],             // 「有一个家」 the warm window
  [st('W07'), st('W08'), 'v2', 38.638, 42.39],          // W07 岳庙
  [st('W08'), st('W09'), 'v2', 42.39, 45.712],          // W08 the spin, the fist
  [st('W09'), st('W10'), 'v2', 45.712, 48.634],         // W09 the face
  [st('W10'), st('W11'), 'v2', 48.634, 50.71],          // W10 the fist goes soft
  [st('W11'), st('W12'), 'v2', 53.21, 56.93],           // W11 陆谦
  [st('W12'), st('W13'), 'v2', 56.93, 59.87],           // W12 白虎节堂
  [st('W13'), st('W14'), 'v2', 59.87, 62.42],           // W13 刺面, the cangue
  [st('W14'), st('W15'), 'key', 'K16', { z0: 1.0, z1: 1.07 }],          // W14 the scribe writes the letter
  [st('W15'), st('W16'), 'v2', 64.45, 66.5],            // W15 the road
  [st('W16'), st('W17'), 'v2', 35.306, 38.638],         // W16 home
  [st('W17'), st('W18'), 'v2', 5.341, 9.913],           // W17 her hands, the tear
  [st('W18'), st('W19'), 'v2', 9.913, 12.3],            // W18 his face
  [st('W19'), st('W20'), 'v2', 67.8, 72.4],             // W19 the father's hand, first snow
  [st('W20'), st('W21'), 'v2', 72.4, 74.3],             // W20 into 沧州
  [st('W21'), st('W22'), 'v2', 74.3, 77.748],           // W21 the roof caves in
  [st('W22'), st('W22') + 2.55, 'push', 0.25, 2.8],     // W22 the stone to the door (motion capture)
  [st('W22') + 2.55, st('W23'), 'v2', 81.45, 82.6],     // the fire through the crack
  [st('W23'), 90.0, 'v2', 82.6, 86.75],                 // W23–W24 POV: three silhouettes, the voice
  [90.0, 93.565, 'v2', 87.9, 93.565],                   // W25 his eyes in the slit of fire light; hard cut
  [93.565, st('W27'), 'key', 'K26', { z0: 1.12, z1: 1.0, hit: true }], // W26 the doors fly open on the drop
  [st('W27'), st('W27') + 1.65, 'key', 'K27', { z0: 1.0, z1: 1.08, hit: true, dx: -30 }],  // 一枪戳倒差拨
  [st('W27') + 1.65, st('W28'), 'key', 'K28', { z0: 1.06, z1: 1.0, hit: true, dx: 40 }],   // 再一枪，富安
  [st('W28'), st('W29'), 'key', 'K29', { z0: 1.0, z1: 1.09, hit: true }],                 // 陆谦 in the snow
  [st('W29'), st('W30'), 'key', 'K30', { z0: 1.0, z1: 1.12 }],                           // 杀人可恕，情理难容
  [st('W30'), st('W31'), 'key', 'K31', { z0: 1.0, z1: 1.04, wipe: 0.45 }],               // the cut on the blow: ink
  [st('W31'), st('W32'), 'v2', 97.4, 100.241],          // W31 the lone figure, 梁山
  [st('W32'), st('W33'), 'v2', 100.241, 105.221],       // W32 seasons turn
  [st('W33'), BRUSH, 'v2', 108.0, 112.10],              // W33 the boat, the news
  [BRUSH, st('W34'), 'v2', 112.10, 112.10 + (st('W34') - BRUSH)],   // 「已故半载」 brushed with the voice
  [st('W34'), st('W35'), 'v2', 115.217, 115.217 + (st('W35') - st('W34'))],  // W34 the tear
  [st('W35'), st('W36'), 'key', 'K36', { z0: 1.0, z1: 1.06 }],          // W35 the letter in lantern light
  [st('W36'), st('W37'), 'v2', 128.534, 131.0],         // W36 the letter and the print
  [st('W37'), 132.2, 'v2', 118.0, 120.25],              // W37 the empty window
  [132.2, DUR, 'v2', 132.2, DUR],                       // W38 brushed 依旧夫妻完聚, W39 the print, J seal, end card
];
const segAt = (t) => EDL.find((g) => t >= g[0] && t < g[1]) || EDL[EDL.length - 1];
const srcTime = (g, t) => g[3] + ((t - g[0]) * (g[4] - g[3])) / (g[1] - g[0]);

// ---------------------------------------------------------------- new shots: the static v4 frames given a camera
const KCACHE = {};
function keyShot(g, t) {
  const [a, b, , k, o] = g, u = clamp((t - a) / (b - a));
  const svg = KCACHE[k] || (KCACHE[k] = KEYS[k]());
  const z = lerp(o.z0 ?? 1, o.z1 ?? 1, E.inOut ? E.inOut(u) : u);
  const sk = o.hit ? shake(t, a, 6, 9, 3) : [0, 0];
  const dx = (o.dx || 0) * (u - 0.5), dy = (o.dy || 0) * (u - 0.5);
  let s = `<g transform="translate(${f2(960 + sk[0] + dx)} ${f2(540 + sk[1] + dy)}) scale(${f2(z * 1000) / 1000}) translate(-960 -540)">${svg}</g>`;
  if (o.wipe) {
    // the ink stroke wipes on left to right
    const w = clamp((t - a) / o.wipe) * 2200;
    s = `<defs><clipPath id="v4wipe"><path d="M-200,-100 L${f2(w)},-100 L${f2(w - 260)},1180 L-200,1180Z"/></clipPath></defs><rect width="1920" height="1080" fill="#0d0a08"/><g clip-path="url(#v4wipe)">${s}</g>`;
  }
  if (o.hit && t - a < 0.12) s += `<rect width="1920" height="1080" fill="#FF9A4A" opacity="${f2(0.28 * (1 - (t - a) / 0.12))}" style="mix-blend-mode:screen"/>`;
  return s;
}

// ---------------------------------------------------------------- subtitles (v4 lines)
const OVR = { W01: { a: 0 }, W33: { text: '派去的人回来说：娘子被逼自尽，', end: BRUSH - 0.05 }, W38: { skip: true } };
const GOLD = { W02: ['休书'], W10: ['软了'], W19: ['依旧夫妻完聚'], W25: ['回不去了'], W29: ['杀人可恕，情理难容'], W30: ['没有再忍'], W35: ['休书'] };
const SUBS = TL.lines.filter((l) => !(OVR[l.id] || {}).skip).map((l, i, arr) => {
  const o = OVR[l.id] || {}, next = arr[i + 1];
  const end = o.end ?? Math.min(l.end + 0.4, next ? next.start - 0.12 : l.end + 1.2);
  return { id: l.id, text: o.text || l.text, a: o.a ?? l.start - 0.03, b: end };
});

export function frameSVG(t) {
  const g = segAt(t);
  let body = '', yc = 890, brand = t < 141.8, fib = true, stp = '';
  if (g[2] === 'v2') {
    const s = srcTime(g, t), tk = takeAt(s);
    body = v2Frame(takes, s, { clean: true });
    if (tk.subYc) yc = tk.subYc(s);
    if (tk.noBrand && tk.noBrand(s)) brand = false;
    if (tk.noFibre && tk.noFibre(s)) fib = false;
    stp = stamp(s);
  } else if (g[2] === 'key') body = keyShot(g, t);
  else body = PUSH.frameSVG(g[3] + ((t - g[0]) * (g[4] - g[3])) / (g[1] - g[0]));
  const l = SUBS.find((x) => t >= x.a && t < x.b);
  let over = (fib ? fibre(0.05) : '') + stp + (l ? subtitleLine(l, t, { yc, gold: GOLD[l.id] || [] }) : '');
  if (brand) over += `<g data-layer="brand" data-z="950">${jseal(1920 - 120 - 37, 1080 - 58 - 37, 74)}</g>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><defs>${blurDefs()}${SUB_DEFS}</defs><rect width="1920" height="1080" fill="#000"/>${body}${over}</svg>`;
}
export { EDL, SUBS };
