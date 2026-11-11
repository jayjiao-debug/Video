// shz02 character faces, front busts (600 x 800 local units, centre x = 300), hand-built paths with small parametric
// expressions. Owner 2026-11-11 22:02: faces are needed and must match the picture people already have of each hero.
//   李逵: very dark skin, round "bronze-bell" eyes, one thick joined brow, a beard that bristles outward like a brush,
//         wild hair under a red headcloth, open jacket, bare hairy chest.
//   娘:   small, grey hair in a bun, a dark 抹额 across the forehead, eyes closed (blind), deep lines.
//   武松: handsome, sword brows, 范阳毡笠 with a red tassel, the red silk rosette of a hero's parade.
// E: { brow: -1 glare .. +1 grief, eye: 0 shut .. 1.2 wide, look: [x, y], mouth: 0 shut .. 1 wide open (wail/roar),
//      tear: 0..1, grit: 0/1 (teeth clenched) }
import { rng } from './ink.mjs';
const f = (n) => (Math.round(n * 10) / 10).toString();
const pt = (p) => `${f(p[0])},${f(p[1])}`;
const M = (p) => [600 - p[0], p[1]];
const LINE = '#1d1410';
const path = (d, fill, o = {}) => `<path d="${d}" fill="${fill}"${o.stroke ? ` stroke="${o.stroke}" stroke-width="${o.sw ?? 4}" stroke-linejoin="round" stroke-linecap="round"` : ''}${o.op !== undefined ? ` opacity="${o.op}"` : ''}/>`;
const line = (d, sw = 4, col = LINE, op = 1) => `<path d="${d}" fill="none" stroke="${col}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"${op < 1 ? ` opacity="${op}"` : ''}/>`;
const lerp = (a, b, k) => a + (b - a) * k;
// pseudo three-quarter view: the features slide across the head toward the side it turns to (turn -1 .. 1) and narrow a little
const turned = (feat, turn, cx = 300) => (turn ? `<g transform="translate(${f(turn * 34 + cx)} 0) scale(${f(1 - 0.16 * Math.abs(turn))} 1) translate(${-cx} 0)">${feat}</g>` : feat);
export const NE = { brow: 0, eye: 1, look: [0, 0], mouth: 0, tear: 0, grit: 0 };

// spiky outline between angles a0..a1 (deg) around c, radius function r(theta), n spikes
function spikes(c, a0, a1, n, r, amp, seed, sx = 1, sy = 1) {
  const R = rng(seed), pts = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n, a = (a0 + (a1 - a0) * t) * Math.PI / 180, base = r(t);
    const tip = base + amp * (0.6 + 0.8 * R()), da = ((a1 - a0) / n) * Math.PI / 180;
    pts.push([c[0] + Math.cos(a) * base * sx, c[1] + Math.sin(a) * base * sy]);
    if (i < n) { const am = a + da * (0.35 + 0.3 * R()); pts.push([c[0] + Math.cos(am) * tip * sx, c[1] + Math.sin(am) * tip * sy]); }
  }
  return pts;
}

// ================================================================ 李逵
export const LK = { skin: '#7d4f33', skinS: '#603823', skinL: '#96643f', hair: '#17141a', hairHi: '#3b3644', red: '#b3302a', redS: '#7e1f1c',
  vest: '#2a2630', vestS: '#1a171f', trim: '#8a6a3a', white: '#f4efe6', iris: '#2a160c', mouth: '#4a1512', tooth: '#efe6d2', sash: '#a02a24' };
export const LKEX = {
  平常: { ...NE, brow: -0.45, eye: 1 },
  大哭: { ...NE, brow: 1, eye: 0.12, mouth: 1, tear: 1 },
  红眼: { ...NE, brow: -1, eye: 1.2, mouth: 0.45, grit: 1 },
  低头: { ...NE, brow: 0.6, eye: 0.55, look: [0, 0.8], mouth: 0 },
  愣住: { ...NE, brow: 0.35, eye: 1.25, mouth: 0.25 },
};
export function likuiBust(E = LKEX.平常, o = {}) {
  const C = LK, e = { ...NE, ...E }, turn = o.turn || 0;
  let s = '';
  if (!o.headOnly) {
  // ---- shoulders, chest, open jacket (the bust ends at y = 800)
  const torso = `M96,800 C92,720 120,668 190,640 C222,628 236,612 238,580 L362,580 C364,612 378,628 410,640 C480,668 508,720 504,800 Z`;
  if (!o.shirtless) {
    s += path(torso, C.skin, { stroke: LINE, sw: 5 });
    s += path(`M238,640 C262,700 280,760 286,800 L314,800 C320,760 338,700 362,640 C330,664 270,664 238,640Z`, C.skinS, { op: 0.55 });
    // chest hair
    const R = rng(5); let h = '';
    for (let i = 0; i < 26; i++) { const x = 262 + R() * 76, y = 690 + R() * 100, l = 10 + R() * 12; h += `M${f(x)},${f(y)} q${f((R() - 0.5) * 8)},${f(l * 0.5)} ${f((R() - 0.5) * 6)},${f(l)} `; }
    s += line(h, 2.6, C.hair, 0.7);
    s += line(`M250,742 Q276,760 300,748 Q324,760 350,742`, 3, LINE, 0.5);
    // jacket: two panels, open wide, a rough trimmed edge
    for (const mir of [0, 1]) {
      const m = (p) => (mir ? M(p) : p);
      const pan = [[96, 800], [92, 720], [120, 668], [190, 640], [226, 626], [248, 690], [262, 800]].map(m);
      s += path('M' + pan.map(pt).join('L') + 'Z', C.vest, { stroke: LINE, sw: 5 });
      s += line('M' + [[226, 628], [247, 690], [261, 800]].map(m).map(pt).join('L'), 9, C.trim) + line('M' + [[226, 628], [247, 690], [261, 800]].map(m).map(pt).join('L'), 2, LINE, 0.5);
      s += line('M' + [[150, 700], [160, 800]].map(m).map(pt).join('L'), 3, C.vestS);
    }
  } else {
    s += path(torso, C.skin, { stroke: LINE, sw: 5 });
    s += line(`M210,742 Q262,772 300,752 Q338,772 390,742`, 3.5, LINE, 0.55) + line(`M300,690 L300,800`, 3, LINE, 0.3);
    const R = rng(5); let h = '';
    for (let i = 0; i < 30; i++) { const x = 250 + R() * 100, y = 680 + R() * 110, l = 10 + R() * 12; h += `M${f(x)},${f(y)} q${f((R() - 0.5) * 8)},${f(l * 0.5)} ${f((R() - 0.5) * 6)},${f(l)} `; }
    s += line(h, 2.6, C.hair, 0.7);
  }
  // neck: thick, with the trapezius
  s += path(`M226,560 C228,600 214,628 180,644 C240,668 360,668 420,644 C386,628 372,600 374,560Z`, C.skin, { stroke: LINE, sw: 5 });
  s += path(`M232,590 C270,622 330,622 368,590 C366,612 376,628 400,640 C340,656 260,656 200,640 C224,628 234,612 232,590Z`, C.skinS, { op: 0.7 });
  }
  // ---- hair behind the head: an iron brush
  const back = spikes([300, 330], 176, 364, 20, (t) => 138 + 16 * Math.sin(t * Math.PI), 22, 11);
  s += path('M' + [[168, 420], ...back, [432, 420]].map(pt).join('L') + 'Z', C.hair, { stroke: LINE, sw: 4 });
  // ---- ears
  for (const mir of [0, 1]) { const m = (p) => (mir ? M(p) : p); s += path(`M${pt(m([182, 372]))} C${pt(m([156, 362]))} ${pt(m([152, 420]))} ${pt(m([184, 428]))}Z`, C.skin, { stroke: LINE, sw: 4 }) + line(`M${pt(m([174, 384]))} Q${pt(m([166, 398]))} ${pt(m([176, 414]))}`, 3, C.skinS); }
  // ---- head: broad, heavy cheeks, square jaw (the jaw itself is under the beard)
  s += path(`M300,196 C380,196 424,246 424,330 C426,372 424,420 408,470 C392,524 350,560 300,560 C250,560 208,524 192,470 C176,420 174,372 176,330 C176,246 220,196 300,196Z`, C.skin, { stroke: LINE, sw: 5 });
  // cheek and brow shading
  s += path(`M182,360 C190,420 204,468 232,500 C214,452 206,410 208,366Z`, C.skinS, { op: 0.6 }) + path(`M418,360 C410,420 396,468 368,500 C386,452 394,410 392,366Z`, C.skinS, { op: 0.6 });
  s += path(`M236,300 C270,288 330,288 364,300 C340,312 260,312 236,300Z`, C.skinL, { op: 0.35 });
  // ---- beard: a bush that bristles outward from under the cheekbones
  const outer = spikes([300, 440], -4, 184, 26, (t) => 150 + 40 * Math.sin(t * Math.PI), 30, 23, 1.0, 1.0);
  const inner = [[452, 428], [426, 402], [404, 416], [380, 436], [348, 446], [322, 444], [300, 452], [278, 444], [252, 446], [220, 436], [196, 416], [174, 402], [148, 428]];
  s += path('M' + [...inner.slice().reverse(), ...outer].map(pt).join('L') + 'Z', C.hair, { stroke: LINE, sw: 4 });
  { // strands of light in the beard
    const R = rng(31); let h = '';
    for (let i = 0; i < 46; i++) { const a = (20 + R() * 140) * Math.PI / 180, r0 = 70 + R() * 50, r1 = r0 + 30 + R() * 50; h += `M${f(300 + Math.cos(a) * r0)},${f(462 + Math.sin(a) * r0 * 1.05)} L${f(300 + Math.cos(a) * r1)},${f(462 + Math.sin(a) * r1 * 1.05)} `; }
    s += line(h, 2.4, C.hairHi, 0.85);
  }
  const FEAT0 = s.length;
  // ---- mouth (inside the beard). wail: corners pulled down, lower lip dropped; grit: both rows of teeth, squared
  const mo = e.mouth, wail = e.tear > 0 && mo > 0.3, mw = 40 + 24 * mo, mh = 6 + (wail ? 74 : 50) * mo, my = 496 + 4 * mo, cd = wail ? 20 : e.grit ? 10 : 0;
  if (mo > 0.08) {
    s += path(`M${f(300 - mw)},${f(my + cd)} Q${f(300 - mw * 0.5)},${f(my - 14)} 300,${f(my - 14)} Q${f(300 + mw * 0.5)},${f(my - 14)} ${f(300 + mw)},${f(my + cd)} Q${f(300 + mw * (wail ? 0.95 : 0.8))},${f(my + mh)} 300,${f(my + mh + 4)} Q${f(300 - mw * (wail ? 0.95 : 0.8))},${f(my + mh)} ${f(300 - mw)},${f(my + cd)}Z`, C.mouth, { stroke: LINE, sw: 4 });
    s += path(`M${f(300 - mw * 0.6)},${f(my - 7)} Q300,${f(my - 13)} ${f(300 + mw * 0.6)},${f(my - 7)} L${f(300 + mw * 0.56)},${f(my + 5)} Q300,${f(my)} ${f(300 - mw * 0.56)},${f(my + 5)}Z`, C.tooth);
    if (e.grit) s += path(`M${f(300 - mw * 0.7)},${f(my + mh * 0.5)} Q300,${f(my + mh * 0.38)} ${f(300 + mw * 0.7)},${f(my + mh * 0.5)} Q300,${f(my + mh + 2)} ${f(300 - mw * 0.7)},${f(my + mh * 0.5)}Z`, C.tooth) + line(`M${f(300 - mw * 0.66)},${f(my + mh * 0.46)} Q300,${f(my + mh * 0.34)} ${f(300 + mw * 0.66)},${f(my + mh * 0.46)}`, 2.5, C.mouth);
    else s += path(`M${f(300 - mw * 0.55)},${f(my + mh * 0.72)} Q300,${f(my + mh * 0.48)} ${f(300 + mw * 0.55)},${f(my + mh * 0.72)} Q300,${f(my + mh + 2)} ${f(300 - mw * 0.55)},${f(my + mh * 0.72)}Z`, '#8a3a34');
  } else {
    s += line(`M${f(300 - mw)},${f(my + 4)} Q300,${f(my - 6)} ${f(300 + mw)},${f(my + 4)}`, 5, '#3a1512');
  }
  // moustache: two heavy wings that hang over the mouth corners and run into the beard (they droop further in a wail)
  for (const mir of [0, 1]) {
    const m = (p) => (mir ? M(p) : p), dr = wail ? 16 : 0;
    const w = [[300, 450], [280, 442], [254, 446], [226, 458], [196, 478 + dr], [210, 492 + dr], [228, 490 + dr], [246, 480 + dr * 0.6], [268, 474], [286, 472], [300, 476]].map(m);
    s += path('M' + w.map(pt).join('L') + 'Z', C.hair);
    s += line('M' + [[292, 458], [262, 460], [232, 474 + dr * 0.5]].map(m).map(pt).join('L'), 2.2, C.hairHi, 0.8);
  }
  // ---- nose: broad
  s += path(`M284,372 C280,404 268,420 262,432 C258,446 272,452 286,446 C294,452 306,452 314,446 C328,452 342,446 338,432 C332,420 320,404 316,372Z`, C.skin);
  s += line(`M285,380 C281,404 268,420 262,432 C258,446 272,452 286,446 M314,446 C328,452 342,446 338,432 C332,420 319,404 315,380`, 4);
  s += path(`M268,438 Q278,430 288,440 Q278,446 268,438Z M332,438 Q322,430 312,440 Q322,446 332,438Z`, '#3a1c12');
  s += path(`M292,392 Q300,388 308,392 L310,424 Q300,430 290,424Z`, C.skinL, { op: 0.45 });
  // ---- eyes: round, lots of white
  const eo = e.eye, lx = e.look[0] * 9, ly = e.look[1] * 7;
  for (const mir of [0, 1]) {
    const cx = mir ? 358 : 242, cy = 362, sgn = mir ? -1 : 1;
    if (eo < 0.25) { // squeezed shut: a heavy curved line, lashes of wrinkle
      s += line(`M${cx - 32},${cy + 4} Q${cx},${cy + 18 - 30 * eo} ${cx + 32},${cy + 4}`, 6);
      s += line(`M${cx - sgn * 34},${cy + 2} l${-sgn * 12},${-7} M${cx - sgn * 34},${cy + 8} l${-sgn * 13},${3}`, 3, LINE, 0.7);
    } else {
      const ry = 22 * Math.min(1.25, eo), rx = 34;
      const lid = e.brow < 0 ? -e.brow * 7 : 0;   // the glare: the upper lid cuts straight across
      s += `<clipPath id="lke${mir}${Math.round(eo * 100)}${Math.round(e.brow * 10)}"><path d="M${cx - rx},${cy} Q${cx},${f(cy - ry * 2 + lid * 1.6)} ${cx + rx},${f(cy - (mir ? -1 : 1) * 0)} Q${cx},${f(cy + ry * 1.9)} ${cx - rx},${cy}Z"/></clipPath>`;
      const cid = `lke${mir}${Math.round(eo * 100)}${Math.round(e.brow * 10)}`;
      s += `<g clip-path="url(#${cid})"><rect x="${cx - 40}" y="${cy - 40}" width="80" height="80" fill="${C.white}"/>` +
        `<circle cx="${f(cx + lx)}" cy="${f(cy + ly - 1)}" r="${f(13.5)}" fill="${C.iris}"/><circle cx="${f(cx + lx)}" cy="${f(cy + ly - 1)}" r="6.5" fill="#000"/>` +
        `<circle cx="${f(cx + lx - 4)}" cy="${f(cy + ly - 6)}" r="3.2" fill="#fff"/>` +
        (e.grit ? `<path d="M${cx - 30},${cy + 4} l14,-3 M${cx + 30},${cy + 5} l-13,-2 M${cx - 26},${cy - 6} l10,3" stroke="#b3302a" stroke-width="1.6" fill="none" opacity="0.9"/>` : '') + `</g>`;
      s += line(`M${cx - rx - 3},${cy + 1} Q${cx},${f(cy - ry * 2 + lid * 1.6)} ${cx + rx + 3},${cy + 1}`, 6.5);
      s += line(`M${cx - rx + 4},${f(cy + ry * 0.55)} Q${cx},${f(cy + ry * 1.5)} ${cx + rx - 4},${f(cy + ry * 0.55)}`, 3, LINE, 0.8);
    }
    // bag under the eye
    s += line(`M${cx - 24},${cy + 34} Q${cx},${cy + 42} ${cx + 24},${cy + 34}`, 2.6, C.skinS, 0.9);
    // brow: one thick bushy bar, nearly joined in the middle
    const bi = e.brow < 0 ? lerp(322, 340, -e.brow) : lerp(322, 304, e.brow), bo = e.brow < 0 ? lerp(318, 300, -e.brow) : lerp(318, 332, e.brow);
    const inX = 300 - sgn * 22, outX = 300 - sgn * 118, midX = 300 - sgn * 70;
    const top = [], bot = [];
    for (let k = 0; k <= 8; k++) { const t = k / 8, x = lerp(inX, outX, t), y = lerp(bi, bo, t) - Math.sin(t * Math.PI) * 6; top.push([x, y - (13 - 5 * t) - (k % 2 ? 5 : 0)]); bot.push([x, y + (11 - 7 * t)]); }
    s += path('M' + [...top, ...bot.reverse()].map(pt).join('L') + 'Z', C.hair, { stroke: LINE, sw: 2.5 });
    void midX;
  }
  // frown between the brows
  if (e.brow < -0.2) s += line(`M291,${f(338 - 4)} l-3,${18} M309,${f(338 - 4)} l3,${18}`, 3, LINE, 0.75);
  if (e.brow > 0.3) s += line(`M262,292 Q300,${f(284 - 6 * e.brow)} 338,292 M270,276 Q300,270 330,276`, 2.6, C.skinS, 0.9);
  // ---- tears: two streams into the beard
  if (e.tear > 0) for (const mir of [0, 1]) {
    const cx = mir ? 358 : 242, sgn = mir ? 1 : -1;
    s += `<path d="M${cx + sgn * 12},${376} C${cx + sgn * 20},${400} ${cx + sgn * 26},${418} ${cx + sgn * 22},${440}" fill="none" stroke="#dff1fb" stroke-width="${f(7 * e.tear)}" stroke-linecap="round" opacity="0.92"/>` +
      `<ellipse cx="${cx + sgn * 22}" cy="446" rx="${f(6 * e.tear)}" ry="${f(8 * e.tear)}" fill="#eaf7ff"/>`;
  }
  s = s.slice(0, FEAT0) + turned(s.slice(FEAT0), turn);
  // ---- red headcloth and the topknot
  s += path(`M172,300 C200,268 250,250 300,250 C350,250 400,268 428,300 C430,280 428,256 418,236 C380,206 220,206 182,236 C172,256 170,280 172,300Z`, C.red, { stroke: LINE, sw: 5 });
  s += line(`M196,262 C240,238 360,238 404,262`, 3, C.redS) + line(`M184,286 C230,256 370,256 416,286`, 3, C.redS, 0.7);
  // knot at his right temple, two tails
  s += path(`M420,262 C444,250 458,262 452,280 C446,296 428,296 420,284Z`, C.red, { stroke: LINE, sw: 4 });
  s += path(`M446,284 C466,300 474,330 468,362 L452,352 C456,330 448,308 434,294Z`, C.red, { stroke: LINE, sw: 4 }) + path(`M436,290 C440,318 432,340 422,356 L412,342 C420,326 424,308 424,290Z`, C.redS, { stroke: LINE, sw: 4 });
  // hair above the cloth: a rough topknot tied with a strip
  const top = spikes([300, 226], 190, 350, 13, (t) => 84 + 16 * Math.sin(t * Math.PI), 18, 41, 1.2, 0.86);
  s += path('M' + [[190, 240], ...top, [410, 240]].map(pt).join('L') + 'Z', C.hair, { stroke: LINE, sw: 4 });
  s += path(`M262,176 C262,140 338,140 338,176 C338,196 262,196 262,176Z`, C.hair, { stroke: LINE, sw: 4 });
  s += path(`M258,182 C280,194 320,194 342,182 L342,196 C320,208 280,208 258,196Z`, C.red, { stroke: LINE, sw: 3.5 });
  const tk = spikes([300, 166], 200, 340, 9, () => 40, 30, 77, 1.1, 1);
  s += path('M' + tk.map(pt).join('L') + 'Z', C.hair, { stroke: LINE, sw: 3 });
  return s;
}

// ================================================================ 娘
export const MO = { skin: '#e8c7a6', skinS: '#c9a07c', skinL: '#f4dcc2', hair: '#b9b6b2', hairS: '#8e8b88', band: '#3a3340', robe: '#55607a', robeS: '#3d465c', inner: '#d9d2c4', lip: '#b07868' };
export function motherBust(E = {}, o = {}) {
  const C = MO, e = { smile: 0, tear: 0, ...E }, turn = o.turn || 0;
  let s = '';
  if (!o.headOnly) {
  // narrow sloping shoulders, cross collar (the bust is drawn 40 units higher than 李逵's: a short thin neck)
  s += `<g transform="translate(0 -62)">` + path(`M150,840 C150,730 176,690 236,668 C258,660 266,640 266,612 L334,612 C334,640 342,660 364,668 C424,690 450,730 450,840Z`, C.robe, { stroke: LINE, sw: 5 });
  s += path(`M262,640 L308,742 L352,646 C330,664 286,664 262,640Z`, C.inner, { stroke: LINE, sw: 4 });
  s += line(`M248,662 L318,840 M360,660 L300,760`, 9, C.robeS) + line(`M248,662 L318,840 M360,660 L300,760`, 2, LINE, 0.5);
  s += path(`M172,760 l26,-10 l10,30 l-28,8Z`, C.robeS, { op: 0.8 }) + `</g>`;
  // thin neck
  s += path(`M272,540 C274,566 270,580 262,590 C284,602 316,602 338,590 C330,580 326,566 328,540Z`, C.skin, { stroke: LINE, sw: 4.5 });
  s += line(`M288,556 L287,586 M312,556 L313,586`, 2.4, C.skinS, 0.9);
  }
  // bun behind, hairpin
  s += path(`M258,214 C262,170 338,170 342,214 C344,240 256,240 258,214Z`, C.hair, { stroke: LINE, sw: 4 });
  s += line(`M236,196 L364,188`, 6, '#7a5a3a') + `<circle cx="238" cy="196" r="6" fill="#7a5a3a" stroke="${LINE}" stroke-width="2"/>`;
  // ears
  for (const mir of [0, 1]) { const m = (p) => (mir ? M(p) : p); s += path(`M${pt(m([208, 392]))} C${pt(m([186, 384]))} ${pt(m([184, 438]))} ${pt(m([212, 446]))}Z`, C.skin, { stroke: LINE, sw: 4 }); }
  // face: small, long, sunken cheeks
  s += path(`M300,236 C360,236 394,280 394,346 C394,400 388,452 366,500 C350,536 328,560 300,560 C272,560 250,536 234,500 C212,452 206,400 206,346 C206,280 240,236 300,236Z`, C.skin, { stroke: LINE, sw: 5 });
  s += path(`M214,410 C222,460 238,500 258,524 C246,484 240,448 242,414Z`, C.skinS, { op: 0.55 }) + path(`M386,410 C378,460 362,500 342,524 C354,484 360,448 358,414Z`, C.skinS, { op: 0.55 });
  // hair: grey, parted in the middle, pulled back
  s += path(`M204,352 C200,270 240,226 300,226 C360,226 400,270 396,352 C386,306 356,276 300,274 C244,276 214,306 204,352Z`, C.hair, { stroke: LINE, sw: 4 });
  s += line(`M300,228 L300,274 M270,232 Q252,254 236,288 M330,232 Q348,254 364,288`, 2.4, C.hairS);
  // 抹额: the dark band across the forehead, a small jade in the middle
  s += path(`M207,330 C240,306 360,306 393,330 L394,304 C360,280 240,280 206,304Z`, C.band, { stroke: LINE, sw: 4 });
  s += `<ellipse cx="300" cy="300" rx="11" ry="8" fill="#7fa89a" stroke="${LINE}" stroke-width="2.5"/>`;
  const FEAT0 = s.length;
  // closed eyes: two down-curved lines, lashes; brows thin and high (the face is turned up, listening)
  for (const mir of [0, 1]) {
    const cx = mir ? 348 : 252, sgn = mir ? -1 : 1;
    s += line(`M${cx - 26},${384} Q${cx},${398 - 6 * e.smile} ${cx + 26},${384}`, 5);
    s += line(`M${cx - 18},${392} l-3,7 M${cx},${395} l0,8 M${cx + 18},${392} l3,7`, 2.4, LINE, 0.7);
    s += line(`M${cx - sgn * 30},${352 - 4 * e.smile} Q${cx},${340 - 6 * e.smile} ${cx + sgn * 28},${350}`, 4, C.hairS);
    s += line(`M${cx - sgn * 30},${386} l${-sgn * 14},${-6} M${cx - sgn * 30},${392} l${-sgn * 15},${2} M${cx - sgn * 28},${398} l${-sgn * 12},${8}`, 2.2, C.skinS);   // crow's feet
    s += line(`M${cx - 24},${410} Q${cx},${420} ${cx + 24},${410}`, 2.4, C.skinS, 0.9);
    if (e.tear) s += `<path d="M${cx + sgn * 6},${398} C${cx + sgn * 10},${430} ${cx + sgn * 6},${456} ${cx + sgn * 10},${480}" fill="none" stroke="#e4f3fb" stroke-width="5" stroke-linecap="round" opacity="0.9"/>`;
  }
  // forehead lines, nose, the long lines beside the mouth
  s += line(`M256,350 Q300,344 344,350`, 2.2, C.skinS, 0.8);
  s += line(`M292,392 C290,426 284,440 280,450 C284,460 294,460 300,456 C306,460 316,460 320,450`, 3.6);
  s += line(`M268,452 C258,472 254,494 260,512 M332,452 C342,472 346,494 340,512`, 2.6, C.skinS);
  // mouth: thin, a little sunken; a smile lifts the corners
  s += line(`M274,${498 - 5 * e.smile} Q300,${504 + 10 * e.smile} 326,${498 - 5 * e.smile}`, 4.5, '#7a4a40');
  s += line(`M286,516 Q300,520 314,516`, 2.4, C.skinS, 0.9);
  s = s.slice(0, FEAT0) + turned(s.slice(FEAT0), turn);
  return s;
}

// ================================================================ 武松 (the hero of 景阳冈, on parade)
export const WS = { skin: '#eec6a2', skinS: '#d49c78', hair: '#1c1a20', hat: '#d9d0bf', hatS: '#aea390', red: '#c4372f', redS: '#8f2520', coat: '#f2ede2', coatS: '#cfc8b8', sash: '#c4372f', iris: '#3a2416' };
export function wusongBust(o = {}) {
  const C = WS, turn = o.turn || 0; let s = '';
  if (!o.headOnly) {
  s += `<g transform="translate(0 -36)">` + path(`M100,836 C100,724 136,676 206,650 C240,638 250,620 250,590 L350,590 C350,620 360,638 394,650 C464,676 500,724 500,836Z`, C.coat, { stroke: LINE, sw: 5 });
  s += path(`M250,640 L304,744 L350,640 C326,662 276,662 250,640Z`, '#3b3a41', { stroke: LINE, sw: 4 });
  s += line(`M236,656 L312,836 M364,656 L318,760`, 10, C.coatS) + line(`M236,656 L312,836 M364,656 L318,760`, 2, LINE, 0.5);
  s += path(`M140,690 C240,720 370,770 490,820 L490,836 L430,836 C330,790 230,748 132,720Z`, C.red, { stroke: LINE, sw: 4 });
  { let r = ''; for (let i = 0; i < 9; i++) { const a = i * 40 * Math.PI / 180; r += `<ellipse cx="${f(200 + Math.cos(a) * 26)}" cy="${f(716 + Math.sin(a) * 26)}" rx="24" ry="15" transform="rotate(${i * 40} ${f(200 + Math.cos(a) * 26)} ${f(716 + Math.sin(a) * 26)})" fill="${i % 2 ? C.red : C.redS}" stroke="${LINE}" stroke-width="2.5"/>`; } s += r + `<circle cx="200" cy="716" r="16" fill="${C.red}" stroke="${LINE}" stroke-width="3"/></g>`; }
  s += path(`M238,536 C240,574 234,590 220,606 C266,628 334,628 380,606 C366,590 360,574 362,536Z`, C.skin, { stroke: LINE, sw: 4.5 });
  }
  for (const mir of [0, 1]) { const m = (p) => (mir ? M(p) : p); s += path(`M${pt(m([190, 384]))} C${pt(m([168, 376]))} ${pt(m([166, 432]))} ${pt(m([194, 440]))}Z`, C.skin, { stroke: LINE, sw: 4 }); }
  // a strong square face
  s += path(`M300,214 C370,214 410,262 410,336 C410,392 406,436 390,478 C372,524 340,552 300,552 C260,552 228,524 210,478 C194,436 190,392 190,336 C190,262 230,214 300,214Z`, C.skin, { stroke: LINE, sw: 5 });
  s += path(`M198,400 C206,452 222,494 246,518 C232,478 226,440 228,404Z`, C.skinS, { op: 0.45 }) + path(`M402,400 C394,452 378,494 354,518 C368,478 374,440 372,404Z`, C.skinS, { op: 0.45 });
  s += path(`M192,300 L196,392 L214,372 L212,300Z M408,300 L404,392 L386,372 L388,300Z`, C.hair);
  const FEAT0 = s.length;
  for (const mir of [0, 1]) {
    const cx = mir ? 352 : 248, sgn = mir ? -1 : 1;
    s += `<clipPath id="wse${mir}"><path d="M${cx - 31},${372} Q${cx},${346} ${cx + 31},${372} Q${cx},${392} ${cx - 31},${372}Z"/></clipPath><g clip-path="url(#wse${mir})"><rect x="${cx - 40}" y="340" width="80" height="60" fill="#fbf7f1"/><circle cx="${cx}" cy="370" r="13" fill="${C.iris}"/><circle cx="${cx}" cy="370" r="6.5" fill="#000"/><circle cx="${cx - 4}" cy="365" r="3.2" fill="#fff"/></g>`;
    s += line(`M${cx - 33},${373} Q${cx},${346} ${cx + 33},${372}`, 6) + line(`M${cx - 24},${384} Q${cx},${392} ${cx + 24},${383}`, 2.6, LINE, 0.7);
    s += path(`M${300 - sgn * 22},${330} Q${300 - sgn * 70},${308} ${300 - sgn * 116},${316} Q${300 - sgn * 70},${322} ${300 - sgn * 24},${346}Z`, C.hair, { stroke: LINE, sw: 2 });   // sword brow
  }
  s += line(`M292,378 C290,414 282,430 278,440 C282,452 294,452 300,448 C306,452 318,452 322,440`, 3.8);
  s += line(`M264,488 Q300,506 336,488`, 5, '#8a4a40') + line(`M258,484 l8,5 M342,484 l-8,5`, 4, '#8a4a40') + line(`M284,514 Q300,518 316,514`, 2.4, C.skinS);
  s = s.slice(0, FEAT0) + turned(s.slice(FEAT0), turn);
  // 范阳毡笠: a wide, nearly flat brim, a low round crown, the red tassel spilling over it
  s += path(`M70,300 C150,246 450,246 530,300 C450,290 150,290 70,300Z`, C.hatS, { stroke: LINE, sw: 5 });
  s += path(`M70,300 C150,262 450,262 530,300 C450,254 150,254 70,300Z`, C.hat, { stroke: LINE, sw: 5 });
  s += path(`M176,268 C190,176 410,176 424,268 C360,250 240,250 176,268Z`, C.hat, { stroke: LINE, sw: 5 });
  { let t = ''; for (let i = -8; i <= 8; i++) t += `M300,184 Q${300 + i * 9},${214} ${300 + i * 14},${254 - Math.abs(i)} `; s += line(t, 5, C.red) + line(t, 1.5, C.redS, 0.6) + `<circle cx="300" cy="182" r="12" fill="${C.redS}" stroke="${LINE}" stroke-width="3"/>`; }
  return s;
}
