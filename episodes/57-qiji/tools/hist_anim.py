"""ep57 story shots, animated inside the picture (owner 08:42/08:46: keep the old stories, no 你, animation in the scenes instead
of zooming, like our older films). Each history drawing (hist_a/b/c.py SVGs) is inlined as live vector art; a per-shot script moves
its real pieces on the beat (counts, light triangles, the sun, processions, marching soldiers, coins, crowds, flags, camels, the
dome rising, the gaze line) plus a few drawn effects (smoke, dust, sparkle). The camera only drifts.
usage: hist_anim.py [shot ...]  → scratchpad sb57/shots/<shot>/f/0000.jpg ... (150 frames = 3 bars at 30 fps) + sheet.jpg"""
import os, sys, subprocess
S = '/tmp/claude-0/-home-claude/240969aa-174a-5914-92b5-d529595dbe80/scratchpad/sb57'
HIST, OUT = f'{S}/hist', f'{S}/shots'
DUR = 5.016
HERE = os.path.dirname(os.path.abspath(__file__))

ENGINE = r'''
const B = 0.418, DUR = %DUR%;
const svg = document.querySelector('#art svg'), FX = document.getElementById('fx'), kids = [...svg.children];
const BB = kids.map(e => { try { const b = e.getBBox(); return [b.x, b.y, b.width, b.height]; } catch (_) { return null; } });
const T0 = kids.map(e => e.getAttribute('transform') || '');
function R(x0, y0, x1, y1, o = {}) {   // top-level elements fully inside a rect (optionally: tags, max area, index range, stroke/fill test)
  return kids.filter((e, i) => { const b = BB[i]; if (!b) return false;
    if (o.from !== undefined && i < o.from) return false; if (o.to !== undefined && i > o.to) return false;
    if (o.tags && !o.tags.includes(e.tagName)) return false; if (o.maxa && b[2] * b[3] > o.maxa) return false;
    if (o.mina && b[2] * b[3] < o.mina) return false; if (o.test && !o.test(e, b)) return false;
    return b[0] >= x0 && b[1] >= y0 && b[0] + b[2] <= x1 && b[1] + b[3] <= y1; }); }
function I(...ix) { return ix.map(i => kids[i]); }
function span(a, b) { const r = []; for (let i = a; i <= b; i++) r.push(kids[i]); return r; }
function bb(e) { return BB[kids.indexOf(e)]; }
function ctr(e) { const b = bb(e); return [b[0] + b[2] / 2, b[1] + b[3] / 2]; }
function mv(els, tf) { els.forEach(e => e.setAttribute('transform', (tf + ' ' + T0[kids.indexOf(e)]).trim())); }
function op(els, a) { els.forEach(e => e.style.opacity = a); }
const cl = x => Math.min(1, Math.max(0, x)), ease = x => { x = cl(x); return x * x * (3 - 2 * x); }, out3 = x => 1 - Math.pow(1 - cl(x), 3);
const outback = x => { x = cl(x) - 1; return 1 + 2.7 * x * x * x + 1.7 * x * x; };
const bob = (t, a = 4) => -a * Math.abs(Math.sin(Math.PI * t / B));
function fx(html) { FX.innerHTML = html; }
let rnd = (s => () => (s = (s * 16807) % 2147483647) / 2147483647)(7);
const WORLD = document.getElementById('world');
function cam(t, z0 = 1.0, z1 = 1.025, fx_ = 960, fy = 540, dx = 0) {   // no zoom: a slow pan (truck) across the scene at a fixed scale
  const u = t / DUR, z = 1.07, px = (dx >= 0 ? 1 : -1) * 70 * (u - .5), py = 10 * Math.sin(u * Math.PI);
  WORLD.style.transformOrigin = fx_ + 'px ' + fy + 'px'; WORLD.style.transform = `translate(${px}px,${py}px) scale(${z})`; }
'''

SHOTS = {}
# 1 · 奇琴伊察 ① the stone calendar: the four 91s count up in turn, +1 drops, =365 stamps; the 365 ticks light round the dial
SHOTS['chichen_A'] = ('chichen_calendar', r'''
const N91 = I(916, 915, 914, 917), P1 = I(918)[0], EQ = I(919)[0], C = [940, 700];
const TICKS = kids.filter((e, i) => { const b = BB[i]; if (!b || e.tagName !== 'polyline') return false; const s = (e.getAttribute('stroke') || '').toLowerCase();
  if (!s.includes('f2c66e') && !s.includes('e8b04a') && !s.includes('d9a441')) return false; const c = [b[0] + b[2] / 2, b[1] + b[3] / 2]; const r = Math.hypot(c[0] - C[0], c[1] - C[1]); return r > 250 && r < 460 && b[2] * b[3] < 900; });
const ANG = TICKS.map(e => { const c = ctr(e); return (Math.atan2(c[1] - C[1], c[0] - C[0]) * 180 / Math.PI + 450) % 360; });
window.render = t => {
  cam(t, 1.0, 1.03, 1560, 660, -1);
  N91.forEach((e, k) => { const t0 = B * (0.5 + 2 * k), u = (t - t0) / (1.6 * B);
    e.style.opacity = u < 0 ? 0 : 1; e.textContent = String(Math.round(91 * out3(u)));
    const c = ctr(e), s = u < 0 ? 1 : 1 + .35 * (1 - out3((t - t0 - 1.6 * B) / .25)) * (u >= 1 ? 1 : 0); mv([e], `translate(${c[0]},${c[1]}) scale(${s}) translate(${-c[0]},${-c[1]})`); });
  { const t0 = B * 8.5, u = (t - t0) / .3, c = ctr(P1); P1.style.opacity = u < 0 ? 0 : 1; mv([P1], `translate(0,${-120 * (1 - out3(u))})`); }
  { const t0 = B * 9.5, u = (t - t0) / .16, c = ctr(EQ); EQ.style.opacity = u < 0 ? 0 : cl(u * 2);
    const s = u < 0 ? 1.8 : 1.8 - .8 * out3(u) + .04 * Math.sin((t - t0) * 9) * (u >= 1 ? Math.exp(-(t - t0)) : 0);
    mv([EQ], `translate(${c[0]},${c[1]}) scale(${s}) translate(${-c[0]},${-c[1]})`); }
  const ARM = [[940, 520, 0, -1], [1110, 700, 1, 0], [940, 880, 0, 1], [770, 700, -1, 0]]; let g = '';
  ARM.forEach(([x, y, dx, dy], k) => { const t0 = B * (0.5 + 2 * k), u = (t - t0) / (1.6 * B); if (u < 0) return;
    const L = 230, p = Math.min(1, u), a = u < 1 ? .85 : .25 + .2 * Math.sin(t * 5 + k);
    const ex = x + dx * L * p, ey = y + dy * L * p, x0 = x - dx * 60, y0 = y - dy * 60;
    g += `<line x1="${x0}" y1="${y0}" x2="${ex}" y2="${ey}" stroke="#FFE7A8" stroke-width="64" stroke-linecap="round" opacity="${a * .55}" filter="url(#bl)"/>`; });
  const sa = (t / (B * 8.3)) * 2 * Math.PI - Math.PI / 2; if (t < B * 8.6) g += `<circle cx="${940 + 330 * Math.cos(sa)}" cy="${700 + 330 * Math.sin(sa)}" r="70" fill="#FFE7A8" opacity=".55" filter="url(#bl)"/>`;
  const su = (t - B * 9.5) / .6; if (su > 0 && su < 1) g += `<circle cx="1650" cy="655" r="${120 + 380 * out3(su)}" fill="none" stroke="#FFE7A8" stroke-width="${18 * (1 - su)}" opacity="${1 - su}"/>`;
  fx(g);
  const sweep = 360 * ease(t / (B * 8.3));
  TICKS.forEach((e, k) => { const d = sweep - ANG[k]; e.style.opacity = d < 0 ? .12 : .35 + .65 * Math.exp(-d / 40); });
};''')
# 2 · 奇琴伊察 ② the equinox serpent: 7 light triangles appear one per beat down the balustrade; the head lights; the sun sinks
SHOTS['chichen_B'] = ('chichen_serpent', r'''
const TRI = [[409, 410], [412, 413], [415, 416], [418, 419], [421, 422], [424, 425], [427, 428]].map(p => I(...p));
const HEAD = span(496, 509), SUN = I(3), hb = HEAD.map(bb).reduce((a, b) => [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[2], b[0] + b[2]), Math.max(a[3], b[1] + b[3])], [1e9, 1e9, -1e9, -1e9]);
const SKY = kids.slice(0, 3);
window.render = t => {
  cam(t, 1.0, 1.03, 900, 640, -20);
  TRI.forEach((p, k) => { const t0 = B * (0.6 + k), u = (t - t0) / .18; op(p, u < 0 ? 0 : cl(u)); });
  const hu = (t - B * 7.8) / .3, hx = (hb[0] + hb[2]) / 2, hy = (hb[1] + hb[3]) / 2;
  mv(SUN, `translate(0,${70 * ease(t / DUR)})`);
  let g = '';
  if (hu > 0) g += `<circle cx="${hx}" cy="${hy}" r="${60 + 25 * Math.sin(t * 8)}" fill="#FFE7A8" opacity="${.55 * cl(hu)}" filter="url(#bl)"/>`;
  TRI.forEach((p, k) => { const t0 = B * (0.6 + k), u = (t - t0) / .35; if (u > 0 && u < 1) { const c = ctr(p[0]); g += `<circle cx="${c[0]}" cy="${c[1]}" r="${30 + 40 * u}" fill="#FFF3CF" opacity="${.7 * (1 - u)}" filter="url(#bl)"/>`; } });
  fx(g);
};''')
# 3 · 马丘比丘 ① the royal estate: the ruler's group walks the terrace, smoke rises, llamas graze, the altitude marker climbs
SHOTS['machu_A'] = ('machu_palace', r'''
const GROUP = I(208, 209, 210), LL = I(28, 29, 30, 211);
const SMOKE = [[905, 560], [1068, 540]];
window.render = t => {
  cam(t, 1.0, 1.025, 1000, 700, 15);
  GROUP.forEach((e, k) => mv([e], `translate(${-150 + 190 * ease(t / DUR) - 0 * k},${bob(t + k * .13, 5)})`));
  LL.forEach((e, k) => { const c = ctr(e); mv([e], `rotate(${4 * Math.sin(t * 2.6 + k * 1.7)},${c[0]},${c[1] + 30})`); });
  let g = '';
  SMOKE.forEach(([x, y], s) => { for (let i = 0; i < 9; i++) { const ph = ((t * .32 + i / 9 + s * .37) % 1);
    g += `<circle cx="${x + 24 * Math.sin(ph * 5 + i) + 60 * ph}" cy="${y - 260 * ph}" r="${12 + 34 * ph}" fill="#F3EEE4" opacity="${.5 * (1 - ph) * cl(ph * 6)}"/>`; } });
  const ay = 1000 - 360 * out3(t / (B * 7));   // the altitude marker climbs to the level line
  g += `<g transform="translate(1874,${ay})"><path d="M-22,0 L0,-14 L22,0 Z" fill="#F2C66E" stroke="#2A211B" stroke-width="3"/><rect x="-4" y="0" width="8" height="${1000 - ay}" fill="#F2C66E" opacity=".75"/></g>`;
  fx(g);
};''')
# 4 · 马丘比丘 ② hidden: the conquistadors march along the river without looking up; the sea of cloud drifts over the city
SHOTS['machu_B'] = ('machu_hidden', r'''
const MEN = span(689, 699);
const CLOUD = kids.filter((e, i) => { const b = BB[i]; return b && (['h4belly', 'h4mist'].includes(e.id) || (b[1] > 380 && b[1] + b[3] < 800 && b[2] > 260 && b[2] * b[3] > 15000 && i > 20 && i < 689)); });
window.render = t => {
  cam(t, 1.0, 1.02, 960, 600);
  MEN.forEach((e, k) => { const rider = [0, 4, 8].includes(k); mv([e], `translate(${260 - 420 * (t / DUR)},${rider ? bob(t * 1.4 + k * .1, 6) : bob(t + k * .21, 4)})`); });
  CLOUD.forEach((e, k) => mv([e], `translate(${(k % 2 ? -1 : 1) * 46 * Math.sin(t / DUR * 1.6)},0)`));
  let g = ''; for (let i = 0; i < 14; i++) { const x = 900 + 60 * i - 420 * (t / DUR) + 200, y = 905 + 4 * Math.sin(i);
    const ph = ((t * 2.39 + i * .3) % 1); if (x > 760 && x < 1700) g += `<ellipse cx="${x + 30}" cy="${y}" rx="${10 + 16 * ph}" ry="${4 + 5 * ph}" fill="#C8BCA6" opacity="${.45 * (1 - ph)}"/>`; }
  fx(g);
};''')
# 5 · 基督像 ① 1922: people queue and drop coins; the coins fly up the dotted trail to the summit, one per beat; the statue glows
SHOTS['christ_A'] = ('christ_1922', r'''
const DOTS = kids.filter((e, i) => { const b = BB[i]; return b && e.tagName === 'ellipse' && (e.getAttribute('fill') || '').toUpperCase().startsWith('#F1E5CC') && b[2] < 20 && b[1] < 640; })
  .sort((a, b) => ctr(a)[0] - ctr(b)[0]);
const PATH = DOTS.map(ctr), BOX = [560, 640], TOP = [1330, 230];
window.render = t => {
  cam(t, 1.0, 1.03, 900, 520, 10);
  const lit = Math.floor(DOTS.length * ease(t / (DUR * .85)));
  DOTS.forEach((e, k) => { e.style.opacity = k < lit ? 1 : .25; });
  let g = '';
  for (let c = 0; c < 6; c++) { const t0 = B * (.5 + 2 * c), u = (t - t0) / (B * 2.4); if (u <= 0 || u >= 1) continue;
    const p = PATH.length ? PATH[Math.min(PATH.length - 1, Math.floor(u * PATH.length))] : [BOX[0] + (TOP[0] - BOX[0]) * u, BOX[1] + (TOP[1] - BOX[1]) * u];
    g += `<circle cx="${p[0]}" cy="${p[1]}" r="11" fill="#F2C66E" stroke="#2A211B" stroke-width="3"/><circle cx="${p[0]}" cy="${p[1]}" r="26" fill="#FFE7A8" opacity=".35" filter="url(#bl)"/>`; }
  g += `<circle cx="${TOP[0]}" cy="${TOP[1]}" r="${110 + 50 * ease(t / DUR)}" fill="#FFF3CF" opacity="${.18 + .25 * ease(t / DUR) + .06 * Math.sin(t * 6)}" filter="url(#bl)"/>`;
  for (let c = 0; c < 6; c++) { const t0 = B * (.5 + 2 * c), u = (t - t0) / .35; if (u > 0 && u < 1) g += `<circle cx="${BOX[0] + 8}" cy="${BOX[1] - 20 - 30 * u}" r="${9}" fill="#F2C66E" stroke="#2A211B" stroke-width="2.5" opacity="${1 - u}"/>`; }
  fx(g);
};''')
# 6 · 基督像 ② the people's statue: the scaffolding comes down piece by piece and the statue lights up
SHOTS['christ_B'] = ('christ_1922', r'''
const SC = I(158, 159, 160, 171, 172);   // the scaffold and crane only (the statue stays)
const DOTS = kids.filter((e, i) => { const b = BB[i]; return b && e.tagName === 'ellipse' && (e.getAttribute('fill') || '').toUpperCase().startsWith('#F1E5CC') && b[2] < 20 && b[1] < 640; });
const TOP = [1330, 230];
window.render = t => {
  cam(t, 1.04, 1.12, 1330, 330);
  SC.forEach((e, k) => { const t0 = B * (1 + 6 * k / Math.max(1, SC.length)), u = (t - t0) / .35; e.style.opacity = u < 0 ? 1 : 1 - cl(u); mv([e], `translate(0,${60 * ease(u)})`); });
  DOTS.forEach(e => e.style.opacity = 1);
  const g0 = ease((t - B * 6) / (B * 2));
  let g = `<circle cx="${TOP[0]}" cy="${TOP[1]}" r="${150 + 90 * g0}" fill="#FFF3CF" opacity="${.25 + .4 * g0 + .05 * Math.sin(t * 7)}" filter="url(#bl)"/>`;
  for (let i = 0; i < 10; i++) { const a = i / 10 * 6.283 + t * .5, r = 160 + 30 * Math.sin(t * 3 + i); if (g0 > 0) g += `<circle cx="${TOP[0] + r * Math.cos(a)}" cy="${TOP[1] + r * Math.sin(a) * .6}" r="4" fill="#FFF6E6" opacity="${g0 * (.5 + .5 * Math.sin(t * 9 + i))}"/>`; }
  fx(g);
};''')
# 7 · 斗兽场 ① Nero's lake: the water glitters, the gilded boat crosses, birds pass, the sun breathes
SHOTS['colosseum_A'] = ('colosseum_nero_lake', r'''
const BOAT = R(1000, 700, 1250, 830, {maxa: 20000});
const WATER = R(640, 560, 1480, 900, {tags: ['polyline'], maxa: 4000}).filter(e => !BOAT.includes(e));
const WP = WATER.map((e, k) => k * 1.7 % 6.28);
window.render = t => {
  cam(t, 1.0, 1.03, 1000, 560, -15);
  mv(BOAT, `translate(${150 * ease(t / DUR) - 30},${2 * Math.sin(t * 3)})`);
  WATER.forEach((e, k) => { e.style.opacity = .35 + .65 * (.5 + .5 * Math.sin(t * 5 + WP[k])); mv([e], `translate(${6 * Math.sin(t * 2 + WP[k])},0)`); });
  let g = '';
  for (let i = 0; i < 5; i++) { const x = -100 + (t / DUR) * 1500 + i * 70, y = 170 + 25 * i % 60 + 10 * Math.sin(t * 4 + i), w = 9 * Math.sin(t * 14 + i);
    g += `<path d="M${x - 16},${y - w} Q${x - 8},${y - 6} ${x},${y} Q${x + 8},${y - 6} ${x + 16},${y - w}" stroke="#2A211B" stroke-width="3" fill="none"/>`; }
  g += `<circle cx="1030" cy="330" r="${90 + 8 * Math.sin(t * 3)}" fill="#FFE7A8" opacity=".28" filter="url(#bl)"/>`;
  fx(g);
};''')
# 8 · 斗兽场 ② given back to the people: the old lake outline glows and fades, crowds stream into the arches, flags flutter
SHOTS['colosseum_B'] = ('colosseum_return', r'''
const ENT = [1180, 640];
const CROWD = R(0, 600, 1920, 1080, {maxa: 400, from: 700});
const CV = CROWD.map(e => { const c = ctr(e), dx = ENT[0] - c[0], dy = ENT[1] - c[1], d = Math.hypot(dx, dy) || 1; return [dx / d, dy / d, (c[0] * 7 + c[1] * 13) % 1]; });
const FLAGS = R(300, 280, 1700, 420, {tags: ['polygon'], maxa: 1500, from: 600});
const LAKE = kids.filter(e => (e.getAttribute('stroke-dasharray') || '') && (e.getAttribute('stroke') || '').toLowerCase().match(/#[4-9a-c][0-9a-f]{2}[a-f0-9]{3}/) && e.tagName !== 'text');
window.render = t => {
  cam(t, 1.0, 1.03, 1180, 560, 12);
  CROWD.forEach((e, k) => { const [ux, uy] = CV[k], d = 26 * t; mv([e], `translate(${ux * d},${uy * d * .7 + bob(t + k * .07, 1.5)})`); });
  FLAGS.forEach((e, k) => { const b = bb(e); mv([e], `translate(${b[0]},${b[1] + b[3] / 2}) skewY(${12 * Math.sin(t * 7 + k)}) scale(${1 + .12 * Math.sin(t * 5 + k)},1) translate(${-b[0]},${-(b[1] + b[3] / 2)})`); });
  LAKE.forEach(e => { e.style.opacity = t < B * 3 ? .4 + .6 * Math.abs(Math.sin(t * 4)) : 1 - ease((t - B * 3) / (B * 3)); });
  fx('');
};''')
# 9 · 佩特拉 ① the incense caravan walks up the Siq toward the Treasury, dust at every step
SHOTS['petra_A'] = ('petra_caravan', r'''
const CAR = kids.filter((e, i) => { const b = BB[i]; if (!b) return false; if (!((i >= 168 && i <= 229) || (i >= 256 && i <= 417))) return false;
  return b[0] >= 180 && b[1] >= 480 && b[0] + b[2] <= 1320 && b[1] + b[3] <= 1010 && b[2] * b[3] < 130000; });
window.render = t => {
  cam(t, 1.0, 1.03, 1100, 600, -10);
  const u = t / DUR; mv(CAR, `translate(${130 * u},${-22 * u + bob(t, 4)})`);
  let g = ''; const feet = [[330, 960], [560, 945], [790, 930], [1000, 915]];
  feet.forEach(([x, y], k) => { const ph = ((t / B + k * .37) % 1); g += `<ellipse cx="${x + 130 * u - 40 * ph}" cy="${y - 22 * u - 8 * ph}" rx="${14 + 30 * ph}" ry="${6 + 10 * ph}" fill="#E6C29A" opacity="${.55 * (1 - ph)}"/>`; });
  for (let i = 0; i < 18; i++) { const x = (i * 113 + t * 30) % 1920, y = 300 + (i * 211) % 600 + 10 * Math.sin(t + i); g += `<circle cx="${x}" cy="${y}" r="2.5" fill="#FFE7C8" opacity=".5"/>`; }
  fx(g);
};''')
# 10 · 佩特拉 ② the toll: coins drop and the stacks grow one per beat; masons chip at the façade, stone falls
SHOTS['petra_B'] = ('petra_tax', r'''
const COINS = R(880, 500, 1100, 800, {maxa: 30000}).filter(e => e.tagName !== 'path').sort((a, b) => ctr(b)[1] - ctr(a)[1]);
window.render = t => {
  cam(t, 1.0, 1.03, 1000, 600, 10);
  COINS.forEach((e, k) => { const t0 = B * (k * 10 / Math.max(1, COINS.length)), u = (t - t0) / .2; e.style.opacity = u < 0 ? 0 : 1; mv([e], `translate(0,${-40 * (1 - out3(u))})`); });
  let g = '';
  for (let c = 0; c < 11; c++) { const t0 = B * c, u = (t - t0) / B; if (u > 0 && u < 1) g += `<circle cx="${930 + 8 * Math.sin(c)}" cy="${640 + 120 * u * u}" r="9" fill="#F2C66E" stroke="#2A211B" stroke-width="2.5"/>`; }
  for (let i = 0; i < 16; i++) { const t0 = (i * .31) % DUR, u = ((t - t0) % 1.2 + 1.2) % 1.2 / 1.2, x = 1080 + (i * 37) % 170, y = 520 + 240 * u * u;
    g += `<rect x="${x}" y="${y}" width="6" height="6" fill="#B0634A" stroke="#2A211B" stroke-width="1.5" opacity="${1 - u}" transform="rotate(${200 * u + i * 20},${x + 3},${y + 3})"/>`; }
  fx(g);
};''')
# 11 · 泰姬陵 ① building for her: the dome rises inside its scaffold, the years roll 1632 → 1653, elephants haul marble
SHOTS['taj_A'] = ('taj_build', r'''
const DOME = R(1080, 260, 1420, 600, {maxa: 200000, from: 80}).filter(e => kids.indexOf(e) >= 86);
const YR = I(460)[0], ELE = R(900, 760, 1600, 1000, {maxa: 60000, from: 280});
const NS = 'http://www.w3.org/2000/svg', cp = document.createElementNS(NS, 'clipPath'); cp.id = 'rise'; const rr = document.createElementNS(NS, 'rect');
rr.setAttribute('x', 0); rr.setAttribute('width', 1920); rr.setAttribute('height', 2000); cp.appendChild(rr); svg.insertBefore(cp, svg.firstChild);
DOME.forEach(e => e.setAttribute('clip-path', 'url(#rise)'));
window.render = t => {
  cam(t, 1.0, 1.03, 1250, 520, -10);
  rr.setAttribute('y', 600 - 340 * ease(t / (DUR * .8)));
  YR.textContent = String(1632 + Math.round(21 * ease(t / (DUR * .85))));
  mv(ELE, `translate(${-110 * t / DUR},${bob(t, 3)})`);
  let g = ''; for (let i = 0; i < 6; i++) { const ph = (t * .8 + i / 6) % 1; g += `<circle cx="${1080 + 300 * ph}" cy="${960 - 6 * Math.sin(ph * 9)}" r="${8 + 14 * ph}" fill="#E8D8C8" opacity="${.5 * (1 - ph)}"/>`; }
  fx(g);
};''')
# 12 · 泰姬陵 ② the gaze: a gold line draws from the old emperor to the far Taj; the river shimmers; the two cenotaphs fade in
SHOTS['taj_B'] = ('taj_fort', r'''
const INSET = I(59)[0], E = [690, 515], TJ = [1172, 600];
window.render = t => {
  cam(t, 1.0, 1.03, 900, 560, 12);
  const u = ease((t - B * 1) / (B * 3)), x = E[0] + (TJ[0] - E[0]) * u, y = E[1] + (TJ[1] - E[1]) * u;
  let g = `<circle cx="1180" cy="430" r="${330 + 40 * Math.sin(t * 1.6)}" fill="#FFB877" opacity="${.18 + .1 * Math.sin(t * 2.1)}" filter="url(#bl)"/>`;
  for (let i = 0; i < 4; i++) { const bx = 820 + (t / DUR) * 700 + i * 60, by = 330 + 18 * i + 8 * Math.sin(t * 5 + i), w = 7 * Math.sin(t * 13 + i);
    g += `<path d="M${bx - 13},${by - w} Q${bx - 6},${by - 5} ${bx},${by} Q${bx + 6},${by - 5} ${bx + 13},${by - w}" stroke="#2A211B" stroke-width="3" fill="none"/>`; }
  if (u > 0) g += `<path d="M${E[0]},${E[1]} L${x},${y}" stroke="#FFE7A8" stroke-width="22" opacity=".5" filter="url(#bl)"/><path d="M${E[0]},${E[1]} L${x},${y}" stroke="#F2C66E" stroke-width="8" stroke-linecap="round" stroke-dasharray="18 12" stroke-dashoffset="${-t * 60}" fill="none"/>`;
  if (u >= 1) g += `<circle cx="${TJ[0]}" cy="${TJ[1] - 30}" r="${70 + 10 * Math.sin(t * 5)}" fill="#FFF6E6" opacity=".35" filter="url(#bl)"/>`;
  for (let i = 0; i < 12; i++) { const yy = 700 + i * 6, w = 40 + 30 * Math.abs(Math.sin(t * 3 + i)); g += `<rect x="${TJ[0] - w / 2 + 10 * Math.sin(t * 2 + i)}" y="${yy}" width="${w}" height="2.5" fill="#FFF6E6" opacity="${.35 + .3 * Math.sin(t * 6 + i)}"/>`; }
  for (let i = 0; i < 14; i++) { const ph = (t * .15 + i / 14) % 1; g += `<circle cx="${560 + (i * 97) % 700 + 30 * ph}" cy="${300 + (i * 53) % 500 - 60 * ph}" r="2.5" fill="#FFE7C8" opacity="${.6 * Math.sin(Math.PI * ph)}"/>`; }
  fx(g);
  const iu = (t - B * 6.5) / .5; INSET.style.opacity = iu < 0 ? 0 : cl(iu); const c = ctr(INSET);
  mv([INSET], `translate(${260 * (1 - out3(iu))},0) translate(${c[0]},${c[1]}) scale(${.9 + .1 * outback(iu)}) translate(${-c[0]},${-c[1]})`);
};''')

def page(name, js):
    svg = open(f'{HIST}/{name}.svg').read()
    svg = svg[svg.index('<svg'):]
    return (f'<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="file:///home/claude/video/episodes/37-qiqing/remotion/public/fonts/wenkai/wenkai-bold.css">'
            '<style>html,body{margin:0;background:#000}#f{position:relative;width:1920px;height:1080px;overflow:hidden}#world{position:absolute;inset:0}#art svg{width:1920px;height:1080px;display:block}</style></head>'
            f'<body><div id="f"><div id="world"><div id="art">{svg}</div><svg id="fxs" width="1920" height="1080" style="position:absolute;left:0;top:0">'
            '<defs><filter id="bl" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="18"/></filter></defs><g id="fx"></g></svg></div></div>'
            f'<script>window.DUR={DUR};{ENGINE.replace("%DUR%", str(DUR))}{js}</script></body></html>')

if __name__ == '__main__':
    want = sys.argv[1:] or list(SHOTS)
    os.makedirs(f'{OUT}/pages', exist_ok=True)
    for sid in want:
        name, js = SHOTS[sid]; p = f'{OUT}/pages/{sid}.html'; open(p, 'w').write(page(name, js))
        r = subprocess.run(['python3', f'{HERE}/shots/render_shot.py', p, f'{OUT}/{sid}'], capture_output=True, text=True)
        print(sid, (r.stdout.strip().splitlines() or [''])[-1], r.stderr.strip()[-300:])
