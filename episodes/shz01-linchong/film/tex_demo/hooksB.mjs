// Route B of the background test: traced painted plates (tex_demo/trace_plates.py) replace the sets' baked layers.
//   python3 tex_demo/trace_plates.py && node render.mjs stills <out> <times> --clean --hooks=tex_demo/hooksB.mjs
// Each plate is pinned to the screen at a reference time of its shot (plate px -> screen: off + k * p), then mapped back
// through that shot's camera into the bake's own coordinates, so it composes as planned at t_ref and moves with the
// layer's depth around it. The courtyard uses all three depths (far -> t05roofs d .25, mid -> t05hall d .35,
// near -> t05floor d 1.0), so the split layers really slide (parallax); the other sets have one baked layer.
import fs from 'fs';
import { BAKE_HOOKS, f2, ramp, lerp, E, rg } from '../lib.mjs';
import { __cam as camT05 } from '../takes/t05.mjs';

const DIR = '/dev/shm/shz01/film/bgtrace';
const cache = {};
const plate = (n) => (cache[n] ||= JSON.parse(fs.readFileSync(`${DIR}/${n}.json`, 'utf8')));
const layerSVG = (Lr) => Lr.fills.map(([c, d]) => `<path d="${d}" fill="${c}"/>`).join('') +
  Lr.ink.map(([c, w, d]) => `<path d="${d}" stroke="${c}" stroke-width="${w}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`).join('');
const layers = (n, ks = ['far', 'mid', 'near']) => ks.map((k) => (plate(n).layers[k] ? layerSVG(plate(n).layers[k]) : '')).join('');

/** transform plate px -> bake px: screen q = off + k p at camera c, layer depth d; `pre` = bake origin in layer coords */
function place(c, d, pre, k, off) {
  const s = 1 + ((c.zoom || 1) - 1) * d;
  const bx = (off[0] - 960) / s + 960 + (c.x || 0) * d - pre[0], by = (off[1] - 540) / s + 540 + (c.y || 0) * d - pre[1];
  return `translate(${f2(bx)} ${f2(by)}) scale(${(k / s).toFixed(5)})`;
}

// ---- tavern back wall (S03, t_ref 12.0); the 酒 and an oil dish lamp are drawn on the traced plate in code
BAKE_HOOKS.t01tavern = ({ w, h }) => {
  const push = ramp(12, 10.6, 14.498, E.inOut);
  const c = { x: 40 * push, y: 0, zoom: 1 + 0.05 * push };
  const extra = `<text x="770" y="530" font-family="'Ma Shan Zheng'" font-size="150" text-anchor="middle" fill="#3A2416">酒</text>` +
    `<defs>${rg('Blamp', [[0, '#FFD98A', 0.7], [0.4, '#FFB65A', 0.25], [1, '#FF9A40', 0]])}</defs><circle cx="250" cy="480" r="230" fill="url(#Blamp)" style="mix-blend-mode:screen"/>` +
    `<path d="M228,548 L272,548 L262,512 L238,512Z M210,508 Q250,530 290,508Z" fill="#6B4A32" stroke="#2A1C17" stroke-width="2.5"/><path d="M270,506 q-10,-14 -2,-36 q10,18 2,36Z" fill="#FFE29A"/>`;
  const inner = `<defs><filter id="Btb" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="4"/></filter></defs>` +
    `<rect width="${w}" height="${h}" fill="#4A3424"/><g filter="url(#Btb)"><g transform="${place(c, 0.4, [-330, -230], 1.2, [-42, -10])}">${layers('bg_tavern')}${extra}</g></g>`;
  return { inner, defs: '' };
};

// ---- the table top (S01, t_ref 2.0)
BAKE_HOOKS.t01table = ({ w, h }) => {
  const r = ramp(2, 0, 4.5, E.sine);
  const c = { x: -40 * r, y: 30 * r, zoom: 1 + 0.1 * r };
  return { inner: `<rect width="${w}" height="${h}" fill="#4A3324"/><g transform="${place(c, 1, [-240, -200], 1.372, [-150, -43])}">${layers('bg_table')}</g>`, defs: '' };
};

// ---- 山神庙 (S22, t_ref 78.3): plate altar top on the take's altar line (the hat rests there in S23)
BAKE_HOOKS.t10_room = ({ w, h }) => {
  const k = ramp(78.3, 77.748 - 0.4, 80.26, E.inOut);
  const c = { x: lerp(40, -20, k), y: -40, zoom: lerp(1.1, 1.13, k) };
  return { inner: `<rect width="${w}" height="${h}" fill="#3A332E"/><g transform="${place(c, 1, [-240, -200], 1.5, [-529, -517])}">${layers('bg_temple')}</g>`, defs: '' };
};

// ---- 岳庙 courtyard (S09, t_ref 40.6): three depths
const C05 = () => camT05(40.6);
const K05 = 1.0, OFF05 = [-64, -336];
BAKE_HOOKS.t05roofs = () => ({ inner: `<g transform="${place(C05(), 0.25, [-1000, -500], K05, OFF05)}">${layers('bg_courtyard', ['far'])}</g>`, defs: '' });
BAKE_HOOKS.t05hall = () => ({ inner: `<g transform="${place(C05(), 0.35, [-1000, -700], K05, OFF05)}">${layers('bg_courtyard', ['mid'])}</g>`, defs: '' });
BAKE_HOOKS.t05floor = () => ({ inner: `<g transform="${place(C05(), 1.0, [-800, 700], K05, OFF05)}">${layers('bg_courtyard', ['near'])}</g>`, defs: '' });
