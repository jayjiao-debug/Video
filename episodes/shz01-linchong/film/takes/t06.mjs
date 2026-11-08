// T06 · 樊楼 · 53.210–56.930 (S13: OTS on 陆谦, the friend's smile half swallowed by a shadow; the pour; push into
// the wine). Builder C. Entry: a lacquered 樊楼 pillar crosses the lens (foreground wipe) while T05 trucks right.
import { L, ramp, E, camAt, bake, f2, clamp, lerp, rng, lg, rg, blurId, motes, noise1 } from '../lib.mjs';
import { luqian, luPt, LU_COL } from '../cast/luqian.mjs';
import { silMask } from '../cast/c_util.mjs';

const LN = '#2A1C17';
const LU = { x: 1240, y: 490, k: 2.35 };
const TABLE_Y = 812;
const CUP_L = [720, TABLE_Y - 6]; // 林冲's cup on the near edge
const EWER0 = [990, TABLE_Y - 4];

function room() {
  // 樊楼 interior behind 陆谦 (bake 2600×1500, layer offset -340,-210)
  const ox = 340, oy = 210, X = (x) => x + ox, Y = (y) => y + oy;
  let s = `<rect width="2600" height="1500" fill="#2E2026"/>`;
  // two glowing lattice windows behind him
  for (const [x0, w] of [[640, 520], [1300, 560]]) {
    s += `<rect x="${X(x0)}" y="${Y(60)}" width="${w}" height="560" fill="#E8A55A"/>`;
    s += `<rect x="${X(x0)}" y="${Y(60)}" width="${w}" height="560" fill="url(#t06win)"/>`;
    for (let i = 1; i < 8; i++) s += `<rect x="${X(x0 + (i * w) / 8 - 4)}" y="${Y(60)}" width="8" height="560" fill="#5A3022"/>`;
    for (let i = 1; i < 9; i++) s += `<rect x="${X(x0)}" y="${Y(60 + i * 62 - 4)}" width="${w}" height="8" fill="#5A3022"/>`;
    s += `<rect x="${X(x0 - 20)}" y="${Y(40)}" width="${w + 40}" height="600" fill="none" stroke="#3A1E18" stroke-width="40"/>`;
  }
  // pillars and beam
  s += `<rect x="${X(440)}" y="${Y(-210)}" width="120" height="1500" fill="#5A2620"/><rect x="${X(452)}" y="${Y(-210)}" width="24" height="1500" fill="#7A3A2E"/>`;
  s += `<rect x="${X(1960)}" y="${Y(-210)}" width="130" height="1500" fill="#5A2620"/>`;
  s += `<rect x="${X(-340)}" y="${Y(-40)}" width="2600" height="70" fill="#3A1E18"/>`;
  // a hanging red lantern (upper right), with its glow
  s += `<circle cx="${X(1700)}" cy="${Y(170)}" r="260" fill="url(#t06lg)"/>`;
  s += `<line x1="${X(1700)}" y1="${Y(-210)}" x2="${X(1700)}" y2="${Y(80)}" stroke="#1a1010" stroke-width="5"/>`;
  s += `<ellipse cx="${X(1700)}" cy="${Y(170)}" rx="82" ry="100" fill="#D8432F"/><ellipse cx="${X(1700)}" cy="${Y(170)}" rx="50" ry="100" fill="#F06A45" opacity="0.6"/>`;
  s += `<rect x="${X(1660)}" y="${Y(62)}" width="80" height="20" fill="#C9A45C"/><rect x="${X(1660)}" y="${Y(258)}" width="80" height="20" fill="#C9A45C"/>`;
  s += `<path d="M${X(1690)},${Y(278)} l-6,70 M${X(1700)},${Y(278)} l0,76 M${X(1710)},${Y(278)} l6,70" stroke="#C8322A" stroke-width="5"/>`;
  // dark lower wall / screen behind the table
  s += `<rect x="0" y="${Y(640)}" width="2600" height="${1500 - Y(640)}" fill="#241A1F"/>`;
  return s;
}
const ROOM_DEFS = lg('t06win', [[0, '#FFD08A', 0.5], [1, '#C0702E', 0.4]]) + rg('t06lg', [[0, '#FFB060', 0.55], [1, '#FFB060', 0]]);

function table() {
  // dark lacquer table top across the frame (d 1.0), with a dish
  let s = `<path d="M-300,${TABLE_Y - 30} L2220,${TABLE_Y - 30} L2220,1400 L-300,1400Z" fill="#3A2218"/>`;
  s += `<path d="M-300,${TABLE_Y - 30} L2220,${TABLE_Y - 30} L2220,${TABLE_Y + 6} L-300,${TABLE_Y + 6}Z" fill="#5A3624"/>`;
  s += `<rect x="-300" y="${TABLE_Y - 30}" width="2520" height="5" fill="#8A5A3A" opacity="0.7"/>`;
  s += `<ellipse cx="1260" cy="${TABLE_Y - 10}" rx="120" ry="20" fill="#E9E4D6"/><ellipse cx="1260" cy="${TABLE_Y - 14}" rx="95" ry="13" fill="#C9C2B0"/>`;
  return s;
}

function cup(x, y, s = 1, fill = 0, dark = 0) {
  // 酒盏 on a foot: (x, y) = foot bottom; fill 0..1 wine level
  const w = 52 * s, h = 34 * s;
  const wine = dark > 0 ? `#${[0xB8, 0x74, 0x2A].map((v, i) => Math.round(lerp(v, [0x0F, 0x0D, 0x10][i], dark)).toString(16).padStart(2, '0')).join('')}` : '#B8742A';
  let g = `<path d="M${f2(x - 12 * s)},${f2(y)} L${f2(x - 8 * s)},${f2(y - 12 * s)} L${f2(x + 8 * s)},${f2(y - 12 * s)} L${f2(x + 12 * s)},${f2(y)}Z" fill="#CFC9B8" stroke="${LN}" stroke-width="${f2(2 * s)}"/>`;
  g += `<path d="M${f2(x - w)},${f2(y - 12 * s - h)} C${f2(x - w * 0.9)},${f2(y - 14 * s)} ${f2(x + w * 0.9)},${f2(y - 14 * s)} ${f2(x + w)},${f2(y - 12 * s - h)}Z" fill="#EDE8DA" stroke="${LN}" stroke-width="${f2(2.2 * s)}"/>`;
  g += `<ellipse cx="${f2(x)}" cy="${f2(y - 12 * s - h)}" rx="${f2(w)}" ry="${f2(9 * s)}" fill="#D9D2C0" stroke="${LN}" stroke-width="${f2(2 * s)}"/>`;
  if (fill > 0) g += `<ellipse cx="${f2(x)}" cy="${f2(y - 12 * s - h + 2 * s)}" rx="${f2(w * 0.86 * Math.sqrt(fill))}" ry="${f2(7 * s * Math.sqrt(fill))}" fill="${wine}"/>`;
  return g;
}

function ewer(rot, x, y) {
  // 注子 (qingbai glaze), (x, y) = base centre; spout to the LEFT, handle on the right; rot about the base
  const C = '#DCE4DD', CS = '#AFC0B6';
  let g = `<g transform="translate(${f2(x)} ${f2(y)}) rotate(${f2(rot)})">`;
  g += `<path d="M-60,0 C-90,-60 -96,-140 -60,-190 C-40,-214 -30,-232 -30,-262 L30,-262 C30,-232 40,-214 60,-190 C96,-140 90,-60 60,0Z" fill="${C}" stroke="${LN}" stroke-width="3.5"/>`;
  g += `<path d="M-30,-60 C-70,-90 -70,-150 -44,-182 M0,-30 L0,-190 M30,-60 C70,-90 70,-150 44,-182" fill="none" stroke="${CS}" stroke-width="5"/>`;
  g += `<path d="M-74,-120 C-120,-140 -150,-170 -170,-214 L-156,-222 C-134,-184 -104,-162 -66,-150Z" fill="${C}" stroke="${LN}" stroke-width="3.5"/>`;
  g += `<path d="M62,-200 C118,-210 120,-110 72,-90" fill="none" stroke="${LN}" stroke-width="20" stroke-linecap="round"/><path d="M62,-200 C118,-210 120,-110 72,-90" fill="none" stroke="${C}" stroke-width="13" stroke-linecap="round"/>`;
  g += `<rect x="-38" y="-282" width="76" height="22" rx="6" fill="${CS}" stroke="${LN}" stroke-width="3"/><circle cx="0" cy="-292" r="12" fill="${CS}" stroke="${LN}" stroke-width="3"/>`;
  g += `</g>`;
  return g;
}
const rotPt = (p, a, o) => { const r = (a * Math.PI) / 180; return [o[0] + p[0] * Math.cos(r) - p[1] * Math.sin(r), o[1] + p[0] * Math.sin(r) + p[1] * Math.cos(r)]; };

function sleeveArm(sh, el, wr, w, col, colS) {
  // a wide sleeve from shoulder to wrist with a hanging fold, in 陆谦's robe
  const tube = (a, b, w1, w2) => {
    const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy), nx = -dy / l, ny = dx / l;
    return `M${f2(a[0] + nx * w1)},${f2(a[1] + ny * w1)} L${f2(b[0] + nx * w2)},${f2(b[1] + ny * w2)} L${f2(b[0] - nx * w2)},${f2(b[1] - ny * w2)} L${f2(a[0] - nx * w1)},${f2(a[1] - ny * w1)}Z`;
  };
  let s = `<path d="${tube(sh, el, w * 0.62, w * 0.55)}" fill="${col}" stroke="${LN}" stroke-width="3" stroke-linejoin="round"/>`;
  s += `<circle cx="${f2(el[0])}" cy="${f2(el[1])}" r="${f2(w * 0.55)}" fill="${col}" stroke="${LN}" stroke-width="3"/>`;
  s += `<path d="${tube(el, wr, w * 0.55, w * 0.62)}" fill="${col}" stroke="${LN}" stroke-width="3" stroke-linejoin="round"/>`;
  s += `<circle cx="${f2(el[0])}" cy="${f2(el[1])}" r="${f2(w * 0.5)}" fill="${col}"/>`;
  s += `<path d="M${f2(el[0] - w * 0.3)},${f2(el[1])} L${f2(wr[0] - w * 0.2)},${f2(wr[1])}" stroke="${colS}" stroke-width="6" stroke-linecap="round"/>`;
  return s;
}

function hand(x, y, s, rot, cupping = true) {
  // a simple hand holding something (back of the hand, fingers curled), skin of 陆谦
  return `<g transform="translate(${f2(x)} ${f2(y)}) rotate(${f2(rot)}) scale(${f2(s)})"><path d="M-30,-10 C-30,-30 -6,-38 16,-34 C34,-30 40,-14 38,4 C36,20 22,30 4,30 C-16,30 -32,16 -30,-10Z" fill="${LU_COL.skin}" stroke="${LN}" stroke-width="3"/>` +
    (cupping ? `<path d="M-6,-30 C-8,-14 -6,4 0,16 M10,-32 C10,-14 12,4 16,14 M24,-26 C26,-10 28,4 30,10" fill="none" stroke="${LU_COL.skinS}" stroke-width="3" stroke-linecap="round"/>` : '') + '</g>';
}

function cam(t) {
  // push toward 陆谦 keeping his face at (1240, 400); the entry truck from T05 settles; then the dive into the cup
  const z = lerp(1.0, 1.08, ramp(t, 53.21, 56.2, E.sine));
  let c = camAt([1240, 490], [1240, 490], z);
  c.x += -60 * (1 - ramp(t, 52.8, 54.2, E.out));
  const dv = ramp(t, 56.4, 56.93, E.in);
  if (dv > 0) {
    const tgt = camAt([760, 557], [960, 540], z * Math.pow(11 / z, dv));
    c = { x: lerp(c.x, tgt.x, ramp(t, 56.4, 56.7, E.inOut)), y: lerp(c.y, tgt.y, ramp(t, 56.4, 56.7, E.inOut)), zoom: tgt.zoom };
  }
  return c;
}

function cupHand(x, y, s, k) {
  // 林冲's hand around his cup: fingers wrap under the bowl from the left, thumb over the near rim (green sleeve)
  return `<g transform="translate(${f2(x)} ${f2(y)}) scale(${f2(s)})" opacity="${f2(k)}">` +
    `<path d="M-150,150 C-120,90 -90,40 -64,10 L-30,40 C-50,80 -70,120 -90,170Z" fill="#22513E" stroke="${LN}" stroke-width="3"/>` +
    `<path d="M-66,6 C-60,-14 -40,-24 -20,-20 L-4,-12 C0,0 -2,14 -10,22 L-36,40 C-50,36 -64,24 -66,6Z" fill="#E5AD86" stroke="${LN}" stroke-width="3" stroke-linejoin="round"/>` +
    `<path d="M-24,-20 C-14,-34 4,-40 18,-36 C26,-33 26,-26 18,-22 L-8,-12Z" fill="#E5AD86" stroke="${LN}" stroke-width="3" stroke-linejoin="round"/>` +
    `<path d="M-30,30 C-12,28 4,22 14,14 M-34,18 C-16,16 0,10 10,2" fill="none" stroke="#B9785A" stroke-width="3" stroke-linecap="round"/></g>`;
}

function frame(t) {
  const c = cam(t);
  let s = `<rect x="-10" y="-10" width="1940" height="1100" fill="#2E2026"/>`;
  s += L(c, 0.4, bake('t06room', 2600, 1500, room(), { x: -340, y: -210, defs: ROOM_DEFS }), { id: 't06room', bleed: 'all', blur: 4 });
  // 陆谦 + his arms (d 1.0)
  const smile = 0.6 + 0.4 * ramp(t, 53.3, 53.8, E.out);
  const luSvg = luqian({ ...LU, smile });
  // left hand (screen right) lifts his cup toward you at 53.4, lowers 54.9
  const lift = ramp(t, 53.35, 53.85, E.out) - ramp(t, 54.85, 55.3, E.inOut);
  const lhand = [lerp(1560, 1520, lift), lerp(TABLE_Y - 40, 600, lift)];
  const lsh = luPt(LU, [560, 500]), lel = [1700, TABLE_Y - 20];
  let arms = sleeveArm(lsh, lel, [lhand[0] + 20, lhand[1] + 40], 120, LU_COL.robe, LU_COL.robeS);
  arms += cup(lhand[0] - 6, lhand[1] + 10, 1.25 + 0.1 * lift, 0.9);
  arms += hand(lhand[0] + 18, lhand[1] + 4, 1.25, -10);
  // right hand (screen left) holds the ewer by its handle; pours at 55.30–55.70
  const pour = ramp(t, 55.1, 55.4, E.inOut) - ramp(t, 55.9, 56.25, E.inOut);
  const lift2 = ramp(t, 54.9, 55.2, E.inOut) - ramp(t, 56.0, 56.3, E.inOut);
  const eBase = [EWER0[0] - 60 * lift2, EWER0[1] - 60 * lift2];
  const eRot = -42 * pour;
  const handle = rotPt([96, -150], eRot, eBase);
  const rsh = luPt(LU, [355, 500]);
  arms = sleeveArm(rsh, [1080, TABLE_Y - 10], [handle[0] + 40, handle[1] + 30], 130, LU_COL.robe, LU_COL.robeS) + arms;
  let props = ewer(eRot, eBase[0], eBase[1]) + hand(handle[0] + 14, handle[1] + 6, 1.2, 70);
  // the stream from the spout into 林冲's cup
  const spout = rotPt([-166, -220], eRot, eBase);
  const flow = ramp(t, 55.3, 55.4, E.lin) * (1 - ramp(t, 55.8, 55.95, E.lin));
  if (flow > 0) {
    const tgt = [CUP_L[0], CUP_L[1] - 40];
    const mid = [lerp(spout[0], tgt[0], 0.35), Math.min(spout[1], tgt[1]) - 10];
    props += `<path d="M${f2(spout[0])},${f2(spout[1])} Q${f2(mid[0])},${f2(mid[1])} ${f2(tgt[0] + noise1(t * 30) * 2)},${f2(tgt[1])}" fill="none" stroke="#C88434" stroke-width="${f2(7 * flow)}" stroke-linecap="round" opacity="0.9"/>`;
  }
  const fillL = ramp(t, 55.35, 55.95, E.out);
  // 林冲's hand takes his cup and lifts it toward the lens (56.2), d 1.15
  const lc = ramp(t, 56.05, 56.55, E.inOut);
  const cupPos = [lerp(CUP_L[0], 760, lc), lerp(CUP_L[1], 640, lc)];
  const dark = ramp(t, 56.55, 56.93, E.in);
  let near = cup(cupPos[0], cupPos[1], 1.25 * (1 + 0.5 * lc), fillL, dark);
  if (t > 55.85) near += cupHand(cupPos[0], cupPos[1] - 30 * (1 + 0.5 * lc), 1.25 * (1 + 0.5 * lc), ramp(t, 55.85, 56.05, E.out));
  // form shadow across the far half of his face at 53.626 (16 frames), clipped to his silhouette
  const sh = ramp(t, 53.626, 53.626 + 16 / 30, E.inOut);
  const face = luPt(LU, [457, 378]);
  const shadow = `<rect x="${f2(face[0] - 900)}" y="${f2(face[1] - 400)}" width="${f2(900 - 230 + 230 * sh)}" height="900" fill="#2B2236" opacity="0.65" filter="url(#${blurId(22)})"/>`;
  const lu = `<g${t > 56.4 ? ' data-allowcut="1"' : ''}><defs>${silMask('t06lum', luSvg)}</defs>${luSvg}<g mask="url(#t06lum)">${shadow}</g></g>`;
  // lantern key (from his upper left = screen right)
  const key = `<rect x="0" y="0" width="2400" height="1300" fill="url(#t06key)" style="mix-blend-mode:soft-light"/><defs>${rg('t06key', [[0, '#FFC27A', 0.7], [1, '#FFC27A', 0]], 0.78, 0.15, 0.7)}</defs>`;
  s += L(c, 1.0, lu + arms + table() + props + key, { id: 't06lu' });
  s += L(c, 1.0, near, { id: 't06cup', bleed: 'all' });
  // 林冲 over the shoulder (back of head: dark headscarf, two jade rings, the tails; green robe), d 1.45
  const fgOTS = `<path d="M-120,1200 C-100,860 100,700 360,680 C560,670 720,760 800,980 L840,1200Z" fill="#2F6B52"/>` +
    `<path d="M120,760 C200,720 300,700 400,700" stroke="#22513E" stroke-width="30" fill="none"/>` +
    `<path d="M250,690 C230,600 236,560 250,520 L400,520 C410,560 410,620 390,690Z" fill="#E5AD86"/>` +
    `<ellipse cx="320" cy="430" rx="190" ry="210" fill="#22272F"/><path d="M200,330 C230,250 410,250 440,330 L430,300 C400,220 240,220 210,300Z" fill="#2B313A"/>` +
    `<path d="M270,500 C300,488 340,488 370,500 L360,530 C334,520 306,520 280,530Z" fill="#14181E"/>` +
    `<path d="M260,560 C250,660 240,760 220,860 L250,860 C270,760 284,660 290,560Z M370,560 C380,660 392,760 412,860 L440,860 C420,760 400,660 396,560Z" fill="#22272F"/>`;
  s += L(c, 1.45, bake('t06ots', 1200, 1500, `<g transform="translate(200 120)">${fgOTS}</g>`, { x: -200, y: -120 }), { id: 't06ots', bleed: 'all', blur: 14 });
  s += motes(t, { seed: 8, n: 18, area: [900, 0, 1920, 700], color: '#FFD9A0', op: 0.35 });
  // the dive: wine fills the frame and turns to ink
  const dv = ramp(t, 56.5, 56.93, E.in);
  if (dv > 0) s += `<rect width="1920" height="1080" fill="#0F0D10" opacity="${f2(dv * 0.95)}"/>`;
  // entry: the lacquered pillar crossing the lens (drawn on top during the wipe)
  s += pillar(t);
  return s;
}

const PIL = { a: 52.72, b: 53.5, w: 760 };
const pilX = (t) => lerp(2000, -PIL.w - 120, ramp(t, PIL.a, PIL.b, E.inOut));
function pillar(t) {
  if (t < PIL.a || t > PIL.b) return '';
  const x = pilX(t);
  return `<g data-layer="fx-pillar" data-z="800" data-bleed="all" filter="url(#${blurId(18)})"><rect x="${f2(x)}" y="-60" width="${PIL.w}" height="1200" fill="#5A2620"/><rect x="${f2(x + 90)}" y="-60" width="120" height="1200" fill="#7A3A2E"/><rect x="${f2(x + PIL.w - 120)}" y="-60" width="120" height="1200" fill="#3E1814"/></g>`;
}

export default {
  enter: { a: PIL.a, b: PIL.b, type: 'mask', mask: (t) => `<rect x="${f2(pilX(t) + PIL.w * 0.5)}" y="-100" width="3000" height="1300" fill="#fff"/>` },
  frame,
};
