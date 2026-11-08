// T10 · S22–S24 · the 山神庙 · 77.748–93.565 (film/timing.md)
// S22 77.748–79.830  inside: the door slams, he shoves the big stone against it from inside (contact 78.588),
//                    straightens, sinks down under the quilt by the straw (breath clouds). Cold crack light.
// S23 79.830–86.912  fire flares through the jamb crack (79.830, first fire of the film); his head snaps up; he
//                    scrambles to the crack; push to the crack (81.5–82.34) and through it (82.34–82.74) into his POV:
//                    three faceless silhouettes against the burning 草料场 (laugh 83.07, point 84.04); POV fades
//                    86.50–86.912 into the reverse close-up of his face.
// S24 86.912–93.565  CU → ECU, front, near darkness (luma ~25–30), one slit of fire light across the eyes, letterbox;
//                    eyes widen 86.912, brows flatten 88.573, eyes narrow 91.070, dead still from 92.05; hard cut.
import { L, E, ramp, zexp, bake, lg, rg, f2, clamp, rng, noise1, lerp, toScreen, shake, flames, embers, blurId, camAt, kf } from '../lib.mjs';
import { lin, EX } from '../../chars/rig/linchong.mjs';

const T0 = 77.748, CONTACT = 78.588, FLARE = 79.83, S24 = 86.912, STILL = 92.05;
const FL = 1010;          // floor line (world)
const HF = 860;           // his height (1.80 m) in S22–S23
const CRACK = 1460;       // jamb crack x (world)
const STONE_W = 400, STONE_H = 360;

// ------------------------------------------------------------------ the room (baked plate, world coords offset -240,-200)
const ROOM = (() => {
  const X = (x) => x + 240, Y = (y) => y + 200;
  const defs = lg('t10wall', [[0, '#3A322C'], [0.5, '#4A3F37'], [1, '#2E2622']], 0, 0, 1, 0) +
    lg('t10floor', [[0, '#2E2723'], [1, '#1E1916']]) + rg('t10vig', [[0.4, '#000', 0], [1, '#000', 0.55]], 0.5, 0.5, 0.7);
  let s = `<rect x="0" y="0" width="2400" height="1500" fill="url(#t10wall)"/>`;
  // plaster patches and plank seams
  const R = rng(14);
  for (let i = 0; i < 18; i++) {
    const x = R() * 2400, y = R() * 1100, w = 80 + R() * 220, h = 40 + R() * 120;
    s += `<path d="M${f2(x)},${f2(y)} q${f2(w * 0.3)},${f2(-h * 0.2)} ${f2(w)},${f2(h * 0.1)} q${f2(-w * 0.1)},${f2(h * 0.6)} ${f2(-w * 0.8)},${f2(h * 0.8)}Z" fill="#564A41" opacity="${f2(0.15 + R() * 0.2)}"/>`;
  }
  for (let i = 0; i < 9; i++) s += `<path d="M${f2(X(-120 + i * 190 + R() * 40))},${Y(-200)} l${f2((R() - 0.5) * 12)},${Y(FL) + 200}" stroke="#241E1A" stroke-width="3" opacity="0.35"/>`;
  // a beam along the top
  s += `<rect x="0" y="${Y(-60)}" width="2400" height="70" fill="#2A221D"/><rect x="0" y="${Y(10)}" width="2400" height="6" fill="#1A1512" opacity="0.7"/>`;
  // floor
  s += `<rect x="0" y="${Y(FL)}" width="2400" height="500" fill="url(#t10floor)"/>`;
  s += `<rect x="0" y="${Y(FL) - 4}" width="2400" height="8" fill="#191411"/>`;
  // altar (0.9 m) with a faded red cloth, at the left
  s += `<rect x="${X(40)}" y="${Y(590)}" width="560" height="${FL - 590}" fill="#2C231E"/><rect x="${X(20)}" y="${Y(570)}" width="600" height="30" fill="#3A2E26"/>`;
  s += `<path d="M${X(70)},${Y(600)} L${X(570)},${Y(600)} L${X(560)},${Y(860)} Q${X(320)},${Y(890)} ${X(80)},${Y(860)}Z" fill="#5A2A24" opacity="0.75"/>`;
  s += `<path d="M${X(70)},${Y(640)} L${X(570)},${Y(640)}" stroke="#7A4A2A" stroke-width="6" opacity="0.5"/>`;
  // the seated 山神 statue: a dim figure, crown, broad sleeves, hands in the lap, no face detail
  s += `<g transform="translate(${X(320)} ${Y(572)}) scale(0.74) translate(${-X(320)} ${-Y(572)})" opacity="0.9">`;
  s += `<path d="M${X(130)},${Y(572)} L${X(510)},${Y(572)} Q${X(500)},${Y(470)} ${X(450)},${Y(440)} Q${X(470)},${Y(380)} ${X(430)},${Y(300)} Q${X(400)},${Y(262)} ${X(360)},${Y(250)} L${X(280)},${Y(250)} Q${X(240)},${Y(262)} ${X(210)},${Y(300)} Q${X(170)},${Y(380)} ${X(190)},${Y(440)} Q${X(140)},${Y(470)} ${X(130)},${Y(572)}Z" fill="#3A302A"/>`;
  s += `<path d="M${X(190)},${Y(440)} Q${X(320)},${Y(480)} ${X(450)},${Y(440)} Q${X(420)},${Y(500)} ${X(320)},${Y(505)} Q${X(220)},${Y(500)} ${X(190)},${Y(440)}Z" fill="#463A33"/>`;
  s += `<rect x="${X(296)}" y="${Y(222)}" width="48" height="34" fill="#3A302A"/><ellipse cx="${X(320)}" cy="${Y(186)}" rx="44" ry="52" fill="#3A302A"/>`;
  s += `<path d="M${X(270)},${Y(150)} L${X(370)},${Y(150)} L${X(362)},${Y(112)} L${X(278)},${Y(112)}Z M${X(262)},${Y(146)} L${X(378)},${Y(146)} L${X(378)},${Y(154)} L${X(262)},${Y(154)}Z" fill="#3A302A"/>`;
  s += `<path d="M${X(362)},${Y(140)} Q${X(372)},${Y(190)} ${X(352)},${Y(230)} M${X(430)},${Y(302)} Q${X(470)},${Y(380)} ${X(452)},${Y(440)} Q${X(500)},${Y(470)} ${X(508)},${Y(568)}" stroke="#5E6E88" stroke-width="3" fill="none" opacity="0.5"/>`;
  s += '</g>';
  // a faded hanging banner behind the statue
  s += `<rect x="${X(250)}" y="${Y(20)}" width="140" height="110" fill="#4A2622" opacity="0.5"/>`;
  // incense burner and candle stubs on the altar
  s += `<path d="M${X(450)},${Y(570)} l10,-40 l50,0 l10,40Z" fill="#3E3530"/><rect x="${X(120)}" y="${Y(540)}" width="14" height="30" fill="#6A5A4A"/>`;
  // straw heap on the floor
  for (let i = 0; i < 70; i++) {
    const x = X(330 + R() * 470), y = Y(FL - 10 - R() * 70), a = -1.2 + R() * 2.4, l = 30 + R() * 50;
    s += `<path d="M${f2(x)},${f2(y)} l${f2(Math.cos(a) * l)},${f2(-Math.abs(Math.sin(a)) * l * 0.5)}" stroke="${R() > 0.5 ? '#6E5D41' : '#857150'}" stroke-width="3" stroke-linecap="round" opacity="0.8"/>`;
  }
  s += `<path d="M${X(320)},${Y(FL)} Q${X(420)},${Y(FL - 70)} ${X(560)},${Y(FL - 80)} Q${X(720)},${Y(FL - 70)} ${X(820)},${Y(FL)}Z" fill="#5E4E36"/>`;
  // the front wall beyond the door (seen at an angle) — darker
  s += `<path d="M${X(1640)},${Y(-200)} L${X(2200)},${Y(-200)} L${X(2200)},${Y(FL + 60)} L${X(1640)},${Y(FL - 10)}Z" fill="#221C18"/>`;
  s += `<rect x="0" y="0" width="2400" height="1500" fill="url(#t10vig)"/>`;
  return bake('t10_room', 2400, 1500, s, { defs, x: -240, y: -200 });
})();

// ------------------------------------------------------------------ props
function door(sk) {
  // door face in 3/4 view between the jamb crack (x CRACK) and x 1650, planks, iron studs
  const x0 = CRACK + 4 + sk[0], x1 = 1650 + sk[0], y = sk[1];
  let s = `<path d="M${x0},${20 + y} L${x1},${70 + y} L${x1},${FL - 18 + y} L${x0},${FL + y}Z" fill="#3A2E26"/>`;
  for (let i = 1; i < 5; i++) { const u = i / 5, x = lerp(x0, x1, u); s += `<path d="M${f2(x)},${f2(20 + 50 * u + y)} L${f2(x)},${f2(FL - 18 * u + y)}" stroke="#211913" stroke-width="3"/>`; }
  for (const yy of [200, 620]) s += `<path d="M${x0},${yy + y} L${x1},${yy + 40 + y}" stroke="#4A3B31" stroke-width="16"/>`;
  s += `<rect x="${CRACK - 30 + sk[0]}" y="${-40 + y}" width="30" height="${FL + 40}" fill="#2A221D"/>`; // jamb post (left of the crack)
  return s;
}
function stone(x, sk = [0, 0]) {
  const y = FL, w = STONE_W, h = STONE_H;
  const X = x + sk[0], Y = y + sk[1];
  let s = `<path d="M${X + 20},${Y} Q${X - 10},${Y - h * 0.5} ${X + 30},${Y - h * 0.86} Q${X + w * 0.3},${Y - h - 14} ${X + w * 0.62},${Y - h + 4} Q${X + w + 6},${Y - h * 0.8} ${X + w},${Y - h * 0.3} L${X + w},${Y}Z" fill="#5C5650"/>`;
  s += `<path d="M${X + w * 0.55},${Y - h + 6} Q${X + w + 6},${Y - h * 0.8} ${X + w},${Y - h * 0.3} L${X + w},${Y} L${X + w * 0.62},${Y} Q${X + w * 0.7},${Y - h * 0.5} ${X + w * 0.55},${Y - h + 6}Z" fill="#3E3934"/>`;
  s += `<path d="M${X + 40},${Y - h * 0.82} Q${X + w * 0.3},${Y - h - 6} ${X + w * 0.58},${Y - h + 8}" stroke="#7A736A" stroke-width="6" fill="none" opacity="0.5"/>`;
  s += `<path d="M${X + 60},${Y - h * 0.45} l40,20 l30,-12 M${X + 160},${Y - h * 0.7} l26,30" stroke="#3A3530" stroke-width="3" fill="none" opacity="0.7"/>`;
  return s;
}
const SPEAR_LEAN = (() => {
  // the spear with tassel and the gourd leaning on the back wall (world), tip near the top of frame
  const bx = 1080, by = FL - 4, ang = (-22 * Math.PI) / 180, Lq = 1080;
  const tx = bx + Math.sin(-ang) * -Lq * -1, ty = by - Math.cos(ang) * Lq;
  const tipx = bx + Math.sin(ang) * Lq, tipy = by - Math.cos(ang) * Lq;
  const ux = Math.sin(ang), uy = -Math.cos(ang);
  let s = `<line x1="${bx}" y1="${by}" x2="${f2(tipx)}" y2="${f2(tipy)}" stroke="#5A3C25" stroke-width="11" stroke-linecap="round"/>`;
  s += `<line x1="${bx}" y1="${by}" x2="${f2(tipx)}" y2="${f2(tipy)}" stroke="#7A5232" stroke-width="4" stroke-linecap="round" transform="translate(-2 0)"/>`;
  const hx = tipx - ux * 70, hy = tipy - uy * 70;
  s += `<path d="M${f2(tipx)},${f2(tipy)} L${f2(tipx + ux * 70 + 8)},${f2(tipy + uy * 70)} L${f2(tipx + ux * 70 - 8)},${f2(tipy + uy * 70)}Z" fill="#9AA2A8"/>`;
  s += `<path d="M${f2(hx - 16)},${f2(hy)} q16,40 34,0 q-6,50 -17,70 q-11,-20 -17,-70Z" fill="#9E2A22"/>`;
  // gourd hanging from a cord below the tassel
  const gx = hx + 18, gy = hy + 70;
  s += `<line x1="${f2(hx)}" y1="${f2(hy + 6)}" x2="${f2(gx)}" y2="${f2(gy)}" stroke="#4A3220" stroke-width="2.5"/>`;
  s += `<circle cx="${f2(gx)}" cy="${f2(gy + 22)}" r="20" fill="#B98A4E"/><circle cx="${f2(gx)}" cy="${f2(gy + 66)}" r="31" fill="#B98A4E"/><path d="M${f2(gx + 6)},${f2(gy + 44)} a31,31 0 0 1 0,52 a31,31 0 0 0 0,-52Z" fill="#8A6434" opacity="0.6"/>`;
  return s;
})();
// 林冲's straw hat would go here if he took it off; he keeps it on (iconic look).

// ------------------------------------------------------------------ 林冲 blocking, S22–S23 (side view, facing right)
function blocking(t) {
  // returns {x, dy, lean, sh, el, tilt, expr, quilt}
  const pushA = T0 + 0.18;
  const stoneX = lerp(900, CRACK - STONE_W, ramp(t, pushA, CONTACT, (u) => u * u * (3 - 2 * u)));
  let x, dy = 0, lean = 0, sh = 0, el = 0, tilt = 0, expr = { ...EX.隐忍 }, quilt = 0;
  const HANDX = 520; // hands reach ≈ 520 px ahead of the feet at lean 34
  if (t < CONTACT + 0.06) {
    lean = lerp(18, 38, ramp(t, T0 - 0.2, pushA, E.out));
    sh = lerp(60, 84, ramp(t, T0 - 0.2, pushA, E.out)); el = 6;
    x = stoneX - HANDX;
    expr = { ...EX.隐忍, jaw: 1, eye: 0.6, brow: -0.9, mouth: -0.5 };
    tilt = -4;
  } else if (t < 79.05) {
    const k = ramp(t, CONTACT + 0.06, 79.05, E.inOut);
    lean = lerp(38, 0, k); sh = lerp(78, 0, k); el = lerp(10, 0, k);
    x = CRACK - STONE_W - HANDX - 30 * k;
    expr = { ...EX.隐忍, eye: 0.75, brow: -0.6 };
  } else if (t < 80.26) {
    // sinks down by the straw, pulls the quilt over his legs
    const k = ramp(t, 79.05, 79.62, E.inOut);
    x = CRACK - STONE_W - HANDX - 30;
    dy = 0.43 * HF * k; quilt = k;
    tilt = lerp(0, 16, ramp(t, 79.2, 79.7, E.inOut));
    expr = { ...EX.隐忍, eye: lerp(0.75, 0.35, k), brow: -0.4, jaw: 0.3 };
    if (t >= FLARE) {
      const s = ramp(t, FLARE, FLARE + 0.2, E.out);
      tilt = lerp(16, -6, s);
      expr = { ...EX.隐忍, eye: lerp(0.35, 1.2, s), brow: lerp(-0.4, 0.2, s), jaw: 0, mouth: -0.2 };
    }
  } else {
    // up and to the crack: crouch-run, ends kneeling behind the stone with his eye at the crack
    const k = ramp(t, 80.26, 81.45, E.inOut);
    const x0 = CRACK - STONE_W - HANDX - 30, x1 = 1352;
    x = lerp(x0, x1, k);
    dy = 0.43 * HF * (1 - k) + Math.sin(k * Math.PI) * -0.25 * HF * 0 + lerp(0, 180, k) * (k > 0.5 ? 1 : k * 2) - (k < 1 ? Math.sin(k * Math.PI) * 120 : 0);
    dy = Math.max(dy, 60);
    quilt = 0;
    lean = Math.sin(k * Math.PI) * 12;
    tilt = lerp(-6, 6, k);
    expr = { ...EX.隐忍, eye: 1.1, brow: 0.05, jaw: 0.5, mouth: -0.3, look: [0.4, 0] };
  }
  return { x, dy, lean, sh, el, tilt, expr, quilt, stoneX };
}
function lcSide(t, b) {
  const pose = { headTilt: b.tilt, shoulderR: b.sh, elbowR: b.el, shoulderL: b.sh * 0.92, elbowL: b.el };
  const fig = lin({ view: 'side', costume: 'C', expr: b.expr, pose, flip: true, height: HF, x: 0, y: 0, tattoo: 1 });
  return `<g transform="translate(${f2(b.x)} ${f2(FL + b.dy)}) rotate(${f2(b.lean)} -40 0)">${fig}</g>`;
}
function quiltSVG(b) {
  if (b.quilt <= 0.01) return '';
  const x = b.x, k = b.quilt, top = FL - 0.30 * HF * k + 30;
  return `<path d="M${f2(x - 0.16 * HF)},${FL + 80} Q${f2(x - 0.2 * HF)},${f2(top + 60)} ${f2(x - 0.06 * HF)},${f2(top + 6)} Q${f2(x + 0.02 * HF)},${f2(top - 8)} ${f2(x + 0.1 * HF)},${f2(top + 4)} Q${f2(x + 0.2 * HF)},${f2(top + 30)} ${f2(x + 0.3 * HF)},${f2(FL - 120)} Q${f2(x + 0.4 * HF)},${f2(FL - 40)} ${f2(x + 0.5 * HF)},${FL + 80}Z" fill="#5B5A5E"/>` +
    `<path d="M${f2(x - 0.05 * HF)},${f2(top + 20)} q40,60 20,160 M${f2(x + 0.18 * HF)},${f2(top + 10)} q-20,80 10,180" stroke="#424147" stroke-width="5" fill="none"/>` +
    `<rect x="${f2(x + 0.05 * HF)}" y="${f2(top + 60)}" width="60" height="44" fill="#6A6460" transform="rotate(8 ${f2(x)} ${f2(top)})"/>`;
}
function breath(t, b) {
  if (b.quilt < 0.6 || t > 80.4) return '';
  let s = '';
  for (const t0 of [79.25, 80.15]) {
    const a = (t - t0) / 1.1;
    if (a < 0 || a > 1) continue;
    const mx = b.x + 0.085 * HF + a * 50, my = FL + b.dy - 0.88 * HF - a * 40;
    s += `<ellipse cx="${f2(mx)}" cy="${f2(my)}" rx="${f2(10 + a * 34)}" ry="${f2(7 + a * 20)}" fill="#D8E2EE" opacity="${f2(0.45 * (1 - a))}"/>`;
  }
  return `<g filter="url(#${blurId(5)})">${s}</g>`;
}

// ------------------------------------------------------------------ light
const fireK = (t) => {
  if (t < FLARE) return 0;
  const up = ramp(t, FLARE, FLARE + 0.12, E.out);
  const amp = t < S24 ? 0.15 : t < STILL ? 0.08 : 0.02;
  const fl = 1 + amp * (0.6 * Math.sin(t * 2 * Math.PI * 9.3) + 0.4 * noise1(t * 11, 3));
  return up * fl;
};
function crackLight(t, c) {
  const fk = fireK(t), cold = 1 - clamp(fk);
  const col = fk > 0 ? '#FF8A3D' : '#6F8DB5';
  const top = 30, bot = FL; // crack runs full height; the stone blocks the lower part after contact
  let s = '';
  // the crack line
  s += `<rect x="${CRACK - 6}" y="${top}" width="12" height="${bot - top}" fill="${fk > 0 ? '#FFD9A0' : '#9FB6D6'}" opacity="${f2(fk > 0 ? Math.min(1, fk) : 0.55)}"/>`;
  // glow and a beam spreading into the room (screen blend)
  const g = fk > 0 ? 0.55 * fk : 0.22;
  s += `<g style="mix-blend-mode:screen" filter="url(#${blurId(18)})"><rect x="${CRACK - 30}" y="${top}" width="60" height="${bot - top}" fill="${col}" opacity="${f2(g)}"/>` +
    `<path d="M${CRACK},${top + 100} L${CRACK - 900},${FL - 40} L${CRACK - 640},${FL + 30} L${CRACK},${FL - 360}Z" fill="${col}" opacity="${f2(g * 0.45)}"/></g>`;
  return s;
}

// ------------------------------------------------------------------ POV through the crack (screen space)
function silhouette(kind, x, base, hgt, t) {
  // faceless figures in heavy winter clothes; kind 0 差拨 (round cap, points), 1 陆谦 (幞头, laughs), 2 富安 (head cloth)
  const u = hgt / 480;
  const laugh = kind === 1 && t > 83.07 && t < 83.95 ? Math.sin((t - 83.07) * 2 * Math.PI * 8) * 3 * (1 - (t - 83.07) / 0.9) : 0;
  const tiltBack = kind === 1 && t > 83.07 && t < 83.95 ? Math.sin(((t - 83.07) / 0.88) * Math.PI) * -6 : 0;
  const by = base, sy = by - 330 * u + laugh;
  let s = `<g transform="translate(${f2(x)} 0)">`;
  // body (robe widening to the ground)
  s += `<path d="M${f2(-62 * u)},${f2(sy + 10 * u)} Q${f2(-80 * u)},${f2(sy + 120 * u)} ${f2(-92 * u)},${by} L${f2(92 * u)},${by} Q${f2(80 * u)},${f2(sy + 120 * u)} ${f2(62 * u)},${f2(sy + 10 * u)} Q0,${f2(sy - 14 * u)} ${f2(-62 * u)},${f2(sy + 10 * u)}Z"/>`;
  // head + headgear
  s += `<g transform="rotate(${f2(tiltBack)} 0 ${f2(sy)})">`;
  s += `<rect x="${f2(-14 * u)}" y="${f2(sy - 26 * u)}" width="${f2(28 * u)}" height="${f2(30 * u)}"/><ellipse cx="0" cy="${f2(sy - 58 * u)}" rx="${f2(30 * u)}" ry="${f2(36 * u)}"/>`;
  if (kind === 0) s += `<path d="M${f2(-40 * u)},${f2(sy - 70 * u)} Q0,${f2(sy - 130 * u)} ${f2(40 * u)},${f2(sy - 70 * u)}Z"/>`;
  if (kind === 1) s += `<path d="M${f2(-26 * u)},${f2(sy - 78 * u)} Q0,${f2(sy - 120 * u)} ${f2(26 * u)},${f2(sy - 78 * u)}Z"/><rect x="${f2(-70 * u)}" y="${f2(sy - 82 * u)}" width="${f2(140 * u)}" height="${f2(7 * u)}"/>`;
  if (kind === 2) s += `<path d="M${f2(-32 * u)},${f2(sy - 66 * u)} Q0,${f2(sy - 112 * u)} ${f2(32 * u)},${f2(sy - 66 * u)}Z"/><path d="M${f2(26 * u)},${f2(sy - 80 * u)} l${f2(22 * u)},${f2(30 * u)} l${f2(-12 * u)},${f2(6 * u)}Z"/>`;
  s += '</g>';
  // arms; kind 0 points at the fire from 84.04
  if (kind === 0) {
    const k = ramp(t, 84.04, 84.24, E.out) * (1 - ramp(t, 85.7, 86.0, E.inOut));
    const a = lerp(8, -112, k); // deg from straight down (negative = up toward camera-left)
    s += `<g transform="rotate(${f2(a)} ${f2(-50 * u)} ${f2(sy + 20 * u)})"><path d="M${f2(-64 * u)},${f2(sy + 16 * u)} L${f2(-36 * u)},${f2(sy + 16 * u)} L${f2(-40 * u)},${f2(sy + 190 * u)} L${f2(-58 * u)},${f2(sy + 190 * u)}Z"/><path d="M${f2(-52 * u)},${f2(sy + 186 * u)} l${f2(4 * u)},${f2(40 * u)} l${f2(-8 * u)},0Z"/></g>`;
  } else {
    s += `<path d="M${f2(-66 * u)},${f2(sy + 20 * u)} Q${f2(-86 * u)},${f2(sy + 120 * u)} ${f2(-70 * u)},${f2(sy + 200 * u)} L${f2(-50 * u)},${f2(sy + 196 * u)} Q${f2(-60 * u)},${f2(sy + 110 * u)} ${f2(-44 * u)},${f2(sy + 30 * u)}Z"/>`;
  }
  s += '</g>';
  return s;
}
function pov(t, open) {
  // open 0..1: slit half-width 30 -> 190
  const hw = lerp(30, 190, open), cx = 960 + (t - 82.74) * 18;
  const R = rng(66);
  // ragged slit edges
  let lp = [], rp = [];
  for (let y = -40; y <= 1120; y += 40) { lp.push([cx - hw + (R() - 0.5) * 14, y]); rp.push([cx + hw + (R() - 0.5) * 14, y]); }
  const slit = `M${lp.map((p) => `${f2(p[0])},${p[1]}`).join(' L')} L${rp.reverse().map((p) => `${f2(p[0])},${p[1]}`).join(' L')}Z`;
  const fk = fireK(t);
  let scene = `<rect x="0" y="0" width="1920" height="1080" fill="url(#t10fsky)"/>`;
  // smoke columns
  for (let i = 0; i < 6; i++) {
    const sx = cx - 260 + i * 110, ph = i * 1.7;
    scene += `<ellipse cx="${f2(sx + noise1(t * 0.6 + ph, 9) * 40)}" cy="${f2(380 - ((t * 60 + i * 70) % 300))}" rx="${f2(120 + i * 10)}" ry="90" fill="#2A1A16" opacity="0.5"/>`;
  }
  // the burning 草厅 (silhouette frame inside flames), far
  scene += flames(t, { x0: cx - 520, x1: cx + 520, y: 700, h: 300, n: 16, seed: 21, cols: ['#B8361A', '#E04A1F', '#FF7A2E', '#FFB15E'] });
  scene += `<path d="M${cx - 300},700 L${cx - 290},500 L${cx - 120},410 L${cx + 60},410 L${cx + 260},500 L${cx + 270},700" stroke="#120C0A" stroke-width="14" fill="none"/><path d="M${cx - 130},410 L${cx - 40},560 M${cx + 40},410 L${cx + 120},580" stroke="#120C0A" stroke-width="10"/>`;
  scene += flames(t, { x0: cx - 420, x1: cx + 420, y: 710, h: 190, n: 12, seed: 33, cols: ['#FF7A2E', '#FFB15E', '#FFE3A3'] });
  scene += `<rect x="0" y="700" width="1920" height="460" fill="url(#t10fground)"/>`;
  scene += embers(t, { seed: 5, n: 70, area: [cx - 300, 60, cx + 300, 720], speed: 150, life: 2.4 });
  // falling snow lit by the fire
  const R2 = rng(8);
  for (let i = 0; i < 50; i++) { const x = cx - 260 + R2() * 520, y = ((R2() * 1080 + t * (90 + R2() * 60)) % 1100) - 10, r = 1.5 + R2() * 3; scene += `<circle cx="${f2(x + Math.sin(t + i) * 10)}" cy="${f2(y)}" r="${f2(r)}" fill="#FFD0A8" opacity="0.7"/>`; }
  // three faceless men in front of the fire, rim-lit
  const men = [[cx - 112, 842, 360, 0], [cx + 6, 850, 390, 1], [cx + 118, 846, 365, 2]];
  let rim = '', blk = '';
  for (const [x, b, hgt, k] of men) { rim += silhouette(k, x, b, hgt, t); blk += silhouette(k, x, b, hgt, t); }
  scene += `<g fill="#FF8A3D" opacity="${f2(0.8 * Math.min(1, fk))}" filter="url(#${blurId(3)})" transform="translate(0 -3)">${rim}</g><g fill="#120C0A">${blk}</g>`;
  // heat haze shimmer (subtle) is skipped; vignette inside the slit
  let s = `<defs>${lg('t10fsky', [[0, '#1E0E0B'], [0.45, '#5A2414'], [0.75, '#B34A1E'], [1, '#E07A3A']])}${lg('t10fground', [[0, '#C86A3A'], [1, '#3A1A10']])}` +
    `<clipPath id="t10slit"><path d="${slit}"/></clipPath></defs>`;
  s += `<rect x="-20" y="-20" width="1960" height="1120" fill="#160F0C"/>`;
  // warm light leaking onto the inner face of the planks around the slit
  s += `<defs>${lg('t10leak', [[0, '#FF7A2E', 0], [0.5, '#FF7A2E', 0.32], [1, '#FF7A2E', 0]], 0, 0, 1, 0)}</defs><rect x="${f2(cx - hw - 320)}" y="-20" width="${f2(2 * hw + 640)}" height="1120" fill="url(#t10leak)" opacity="${f2(Math.min(1, fk))}"/>`;
  // door planks: faint grain, fire-lit slit edges
  for (let i = 0; i < 14; i++) s += `<path d="M${f2(cx - hw - 40 - i * 60)},-20 l${f2((i % 3) - 1)},1120 M${f2(cx + hw + 40 + i * 60)},-20 l${f2((i % 2) * 2 - 1)},1120" stroke="#1A120E" stroke-width="3"/>`;
  s += `<g clip-path="url(#t10slit)">${scene}</g>`;
  s += `<path d="${slit}" fill="none" stroke="#FF9A4A" stroke-width="5" opacity="${f2(0.75 * Math.min(1, fk))}" filter="url(#${blurId(2)})"/>`;
  return s;
}

// ------------------------------------------------------------------ S24: the face in one slit of fire light (screen space)
function s24(t) {
  const tt = Math.min(t, STILL);
  // camera push 1.0 -> 1.4 about the eyes, eased, dead still after 92.05
  const z = 1 + 0.4 * ramp(tt, S24, STILL, E.sine);
  const ex = 1172, ey = 524; // eye midpoint on screen
  const hgt = 3800, fx = ex, fy = ey + 0.93 * hgt;
  // expressions
  let expr = { ...EX.隐忍, eye: 0.95, brow: -0.5, jaw: 0.4, look: [0.08, 0] };
  const wid = ramp(tt, S24, S24 + 0.2, E.out), fl = ramp(tt, 88.573, 88.573 + 0.27, E.inOut), nar = ramp(tt, 91.07, 91.07 + 0.2, E.inOut);
  expr = { ...expr, eye: lerp(0.95, 1.18, wid), brow: lerp(-0.5, 0.15, wid) };
  if (fl > 0) expr = { ...expr, brow: lerp(0.15, -0.85, fl), eye: lerp(1.18, 1.0, fl), mouth: lerp(-0.2, -0.5, fl), jaw: lerp(0.4, 1, fl) };
  if (nar > 0) expr = { ...expr, eye: lerp(1.0, 0.8, nar) };
  const face = lin({ view: 'front', costume: 'C', expr, height: hgt, x: fx, y: fy, tattoo: 1 });
  const fk = fireK(t);
  const bandY = ey - 8, bandH = 78;
  let s = `<rect x="-20" y="-20" width="1960" height="1120" fill="#120E0C"/>`;
  s += `<g transform="translate(${ex} ${ey}) scale(${f2(z)}) translate(${-ex} ${-ey})">${face}`;
  // fire tint across the slit, darkness elsewhere (luma ~25–30), a cold rim on the hat brim
  s += `<rect x="-200" y="${bandY - bandH * 1.2}" width="2400" height="${bandH * 2.4}" fill="#FF8A3D" opacity="${f2(0.32 * fk)}" style="mix-blend-mode:multiply"/>`;
  s += `<rect x="-400" y="-400" width="2800" height="2000" fill="#07070B" opacity="0.86" mask="url(#t10band)"/>`;
  s += `<rect x="-400" y="${bandY - bandH * 0.5}" width="2800" height="${bandH}" fill="#FFB070" opacity="${f2(0.12 * fk)}" style="mix-blend-mode:screen" filter="url(#${blurId(10)})"/>`;
  s += `</g>`;
  const defs = `<defs><linearGradient id="t10bg" x1="0" y1="0" x2="0" y2="1">` +
    `<stop offset="0" stop-color="#fff"/><stop offset="${f2((bandY - bandH * 1.25) / 1080)}" stop-color="#fff"/>` +
    `<stop offset="${f2((bandY - bandH * 0.35) / 1080)}" stop-color="#000"/><stop offset="${f2((bandY + bandH * 0.35) / 1080)}" stop-color="#000"/>` +
    `<stop offset="${f2((bandY + bandH * 1.25) / 1080)}" stop-color="#fff"/><stop offset="1" stop-color="#fff"/></linearGradient>` +
    `<mask id="t10band" maskUnits="userSpaceOnUse" x="-400" y="-400" width="2800" height="2000"><rect x="-400" y="-400" width="2800" height="2000" fill="#fff"/><rect x="-400" y="0" width="2800" height="1080" fill="url(#t10bg)"/></mask></defs>`;
  // hat brim cold rim (thin line just above the band)
  return defs + s;
}

// ------------------------------------------------------------------ camera for S22–S23 (world)
function cam(t) {
  const eye = [1352 + 0.053 * HF, FL + 180 - 0.935 * HF];
  if (t < 80.26) return { x: lerp(40, -20, ramp(t, T0 - 0.4, 80.26, E.inOut)), y: -40, zoom: lerp(1.1, 1.13, ramp(t, T0 - 0.4, 80.26, E.inOut)) };
  const c0 = { x: -20, y: -40, zoom: 1.13 };
  const cr = [CRACK, eye[1] + 10];
  if (t < 81.5) {
    const k = ramp(t, 80.26, 81.5, E.inOut), z = lerp(1.13, 1.3, k);
    const target = camAt([lerp(960 + c0.x, cr[0] - 120, k), lerp(540 + c0.y, cr[1] + 60, k)], [960, 540], z);
    return target;
  }
  const z = t < 82.34 ? zexp(t, 81.5, 82.34, 1.3, 2.5, E.in) : zexp(t, 82.34, 82.74, 2.5, 4.6, E.in);
  const k = ramp(t, 81.5, 82.2, E.inOut);
  return camAt([lerp(cr[0] - 120, cr[0], k), lerp(cr[1] + 60, cr[1], k)], [960, 540], Math.min(z, 4.6));
}

export default {
  enter: {
    a: 77.33, b: 77.748, type: 'mask',
    // after the outside leaf has filled the frame, the inside is revealed by a vertical edge sweeping right → left
    mask: (t) => {
      const p = ramp(t, 77.56, 77.748, E.inOut);
      const x = lerp(1960, -60, p);
      return `<defs><linearGradient id="t10wm" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000"/><stop offset="1" stop-color="#fff"/></linearGradient></defs><rect x="${f2(x - 90)}" y="0" width="90" height="1080" fill="url(#t10wm)"/><rect x="${f2(x)}" y="0" width="${f2(2000)}" height="1080" fill="#fff"/>`;
    },
  },
  subYc: (t) => (t >= 86.35 ? 992 : 890),
  frame(t) {
    let s = '';
    if (t < 82.7) {
      // interior world
      const c = cam(t);
      const b = blocking(t);
      const skC = shake(t, CONTACT, 3, 3.5, 4);
      const skD = t < T0 + 0.15 ? shake(t, T0 - 0.02, 5, 3, 7) : skC;
      s += L(c, 1, ROOM, { id: 't10room', bleed: 'all' });
      s += L(c, 1, SPEAR_LEAN + door(skD) + crackLight(t, c) + lcSide(t, b) + quiltSVG(b) + breath(t, b) + stone(b.stoneX, skC) + dustPuff(t, b), { id: 't10set', bleed: 'all' });
      // the flare lights his face from the front when the fire comes (screen-blended warm wash near the crack)
      const fk = fireK(t);
      if (fk > 0) s += L(c, 1, `<g style="mix-blend-mode:screen" filter="url(#${blurId(40)})"><ellipse cx="${CRACK - 200}" cy="${FL - 560}" rx="420" ry="520" fill="#FF7A2E" opacity="${f2(0.22 * fk)}"/></g>`, { id: 't10warm', bleed: 'all' });
      // cold ambient fill and vignette (screen space)
      s += `<rect width="1920" height="1080" fill="#1B2A44" opacity="0.08" style="mix-blend-mode:screen"/>`;
    }
    if (t >= 82.34 && t < S24 + 0.02) {
      const open = t < 86.5 ? ramp(t, 82.38, 82.74, E.out) : 1 - ramp(t, 86.5, 86.85, E.inOut);
      const op = t < 86.5 ? ramp(t, 82.36, 82.6, E.inOut) : 1 - ramp(t, 86.62, 86.9, E.inOut);
      const sc = t < 86.5 ? lerp(1.18, 1.0, ramp(t, 82.36, 82.74, E.out)) * (1 + 0.025 * ramp(t, 82.74, 86.5, E.lin)) : 1.025 + 0.12 * ramp(t, 86.5, 86.9, E.in);
      s += `<g data-layer="t10pov" data-z="100" data-bleed="all" opacity="${f2(op)}" transform="translate(960 540) scale(${f2(sc)}) translate(-960 -540)">${pov(t, open)}</g>`;
    }
    if (t >= 86.62) {
      const op = ramp(t, 86.62, 86.95, E.inOut);
      s += `<g data-layer="t10s24" data-z="100" data-bleed="all" opacity="${f2(op)}">${s24(t)}</g>`;
    }
    // letterbox 2.39:1 (138 px) slides in 86.60–87.60
    const lb = ramp(t, 86.6, 87.6, E.inOut) * 138;
    if (lb > 0) s += `<g data-layer="bars" data-z="860" data-bleed="all"><rect x="-10" y="-10" width="1940" height="${f2(lb + 10)}" fill="#000"/><rect x="-10" y="${f2(1080 - lb)}" width="1940" height="${f2(lb + 10)}" fill="#000"/></g>`;
    return s;
  },
};

function dustPuff(t, b) {
  const a = (t - CONTACT) / 0.7;
  if (a < 0 || a > 1) return '';
  const R = rng(19);
  let s = '';
  for (let i = 0; i < 14; i++) {
    const x = CRACK - 20 - R() * 120 - a * 80 * R(), y = FL - 10 - R() * 60 - a * 60 * R(), r = 10 + R() * 20 + a * 24;
    s += `<circle cx="${f2(x)}" cy="${f2(y)}" r="${f2(r)}" fill="#8A8076" opacity="${f2(0.4 * (1 - a))}"/>`;
  }
  // snow dust shaken from the door top
  for (let i = 0; i < 10; i++) { const x = CRACK + 20 + R() * 160, y = 40 + a * 300 * (0.6 + R() * 0.6); s += `<circle cx="${f2(x)}" cy="${f2(y)}" r="${f2(3 + R() * 3)}" fill="#C9D6E6" opacity="${f2(0.6 * (1 - a))}"/>`; }
  return `<g filter="url(#${blurId(3)})">${s}</g>`;
}
