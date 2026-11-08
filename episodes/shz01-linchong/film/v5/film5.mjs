// 《林冲为什么要休妻？》 v5 — the readable cut (owner 2026-11-08: no hands, no side-character faces, no private symbols;
// every shot a literal action a viewer reads at a glance). Same v4 narration, music and subtitles as film4.mjs; the new
// shots are animated in board/shots5.mjs.
//   node render.mjs video <out.mp4> 0 4455 --comp=v5/film5.mjs --hooks=tex_demo/hooksA.mjs
import fs from 'fs';
import { W, H, f2, clamp, blurDefs, fibre, jseal, ramp, E, lerp, shake } from '../lib.mjs';
import { loadTakes, frameSVG as v2Frame, stamp } from '../film.mjs';
import { SUB_DEFS, subtitleLine } from '../subs.mjs';
import { KEYS } from '../board/v4new.mjs';
import * as PUSH from '../board/pushtest.mjs';
import * as S5 from '../board/shots5.mjs';

const TL = JSON.parse(fs.readFileSync(new URL('../../vo_timeline_v4.json', import.meta.url), 'utf8'));
const S = Object.fromEntries(TL.lines.map((l) => [l.id, l]));
const st = (id) => S[id].start;
export const DUR = 148.5;
const takes = await loadTakes();
const takeAt = (s) => takes.find((k) => s >= k.t0 && s < k.t1) || takes[takes.length - 1];

// ---------------------------------------------------------------- the edit
// v2: [a, b, 'v2', s0, s1] · new still with a camera: [a, b, 'key', 'K26', {z0, z1, hit, dx, dy}] · push: [a, b, 'push', p0, p1]
// animated v5 shot: [a, b, 'fn', f(u, t, g)]  (board/shots5.mjs)
const BRUSH = S.W33.end - 1.35;          // 「已故半载」 in the voice ≈ its last 1.35 s → T11's brush (v2 112.10)
const EDL = [
  [0, st('W04'), 'fn', S5.LETTER],                       // W01–W03 the letter, read right to left, then the whole sheet
  [st('W04'), st('W05'), 'v2', 32.6, 35.0],              // W04 two shadows in the lit window
  [st('W05'), 18.657, 'fn', S5.TEARS(1)],                // W05 a tear lands on 休
  [18.657, 26.97, 'v2', 18.657, 26.97],                  // title
  [26.97, 29.25, 'v2', 26.97, 29.25],                    // W06 「一身本事」 the drill (wide)
  [29.25, st('W07'), 'v2', 33.6, 35.0],                  // 「有一个家」 the window again
  [st('W07'), st('W08'), 'fn', S5.W07],                  // W07 岳庙 wall: a man leans in on her
  [st('W08'), st('W09'), 'fn', S5.W08],                  // W08 the fist goes up
  [st('W09'), st('W10'), 'fn', S5.W09],                  // W09 the giant official rises behind him
  [st('W10'), st('W11'), 'fn', S5.W10],                  // W10 the fist comes down
  [st('W11'), st('W12'), 'fn', S5.W11],                  // W11 陆谦 steps in on their side
  [st('W12'), st('W13'), 'fn', S5.W12],                  // W12 白虎节堂: the guards close in
  [st('W13'), st('W14'), 'v2', 61.4, 62.42],             // W13 in the cangue (after the tattooing hand is gone)
  [st('W14'), st('W15'), 'fn', S5.WRITE],                // W14 the letter being written
  [st('W15'), st('W16'), 'fn', S5.W15],                  // W15 led away in the cangue
  [st('W16'), st('W17'), 'fn', S5.W16],                  // W16 her window, the young lord's shadow on the wall
  [st('W17'), st('W18'), 'fn', S5.TEARS(3)],             // W17 her tears on the letter
  [st('W18'), st('W19'), 'fn', S5.LISTEN(false, 9.913, 12.3)],  // W18 his face
  [st('W19'), st('W20'), 'fn', S5.LISTEN(true, 10.6, 12.3)],    // W19 the promise brushed beside him
  [st('W20'), st('W21'), 'fn', S5.W20],                  // W20 into the blizzard
  [st('W21'), st('W22'), 'v2', 74.3, 77.25],             // W21 the roof caves in (ends before T10's transition)
  [st('W22'), st('W22') + 2.55, 'push', 0.25, 2.8],      // W22 the stone to the door (motion capture)
  [st('W22') + 2.55, st('W23'), 'v2', 81.45, 82.6],      // the fire through the crack
  [st('W23'), 90.0, 'v2', 82.6, 86.75],                  // W23–W24 POV: three silhouettes, the voice
  [90.0, 93.565, 'v2', 87.9, 93.565],                    // W25 his eyes in the slit of fire light; hard cut
  [93.565, st('W27'), 'key', 'K26', { z0: 1.0, z1: 1.03 }],                  // W26 the doors open, camera steady
  [st('W27'), st('W27') + 1.65, 'fn', S5.W27],                               // 一枪戳倒差拨
  [st('W27') + 1.65, st('W28'), 'key', 'K28', { z0: 1.04, z1: 1.0, hit: true, dx: 40 }],   // 再一枪，富安
  [st('W28'), st('W29'), 'key', 'K29', { z0: 1.0, z1: 1.08 }],               // 陆谦 down in the snow
  [st('W29'), st('W30'), 'key', 'K30', { z0: 1.0, z1: 1.1 }],                // 杀人可恕，情理难容
  [st('W30'), st('W31'), 'fn', S5.W30],                  // W30 the knife on the burning wall; cut to black on the blow
  [st('W31'), st('W32'), 'v2', 97.4, 100.241],           // W31 the lone figure, 梁山
  [st('W32'), st('W33'), 'v2', 100.241, 105.221],        // W32 seasons turn
  [st('W33'), BRUSH, 'v2', 108.0, 112.10],               // W33 the boat, the news
  [BRUSH, st('W34'), 'v2', 112.10, 112.10 + (st('W34') - BRUSH)],   // 「已故半载」 brushed with the voice
  [st('W34'), st('W36'), 'fn', S5.LANTERN],              // W34–W35 the letter in lantern light, a tear
  [st('W36'), st('W37'), 'v2', 128.534, 131.0],          // W36 the letter and the print
  [st('W37'), 132.2, 'v2', 118.0, 120.25],               // W37 the empty window
  [132.2, DUR, 'v2', 132.2, DUR],                        // W38 brushed 依旧夫妻完聚, W39 the print, J seal, end card
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
  else if (g[2] === 'fn') body = g[3](clamp((t - g[0]) / (g[1] - g[0])), t, g);
  else body = PUSH.frameSVG(g[3] + ((t - g[0]) * (g[4] - g[3])) / (g[1] - g[0]));
  const l = SUBS.find((x) => t >= x.a && t < x.b);
  let over = (fib ? fibre(0.05) : '') + stp + (l ? subtitleLine(l, t, { yc, gold: GOLD[l.id] || [] }) : '');
  if (brand) over += `<g data-layer="brand" data-z="950">${jseal(1920 - 120 - 37, 1080 - 58 - 37, 74)}</g>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><defs>${blurDefs()}${SUB_DEFS}</defs><rect width="1920" height="1080" fill="#000"/>${body}${over}</svg>`;
}
export { EDL, SUBS };
