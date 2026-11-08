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
import { pushFigure } from '../../chars/rig/push.mjs';
import fs from 'fs';

const revealX = (t) => lerp(-150, 2000, ramp(t, 77.38, 77.748, E.inOut));
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
  // back face at x, top at STONE_TOP with a rounded top-back corner (radius STONE_R) where his palms sit
  const y = FL, w = STONE_W, h = FL - STONE_TOP, r = STONE_R;
  const X = x + sk[0], Y = y + sk[1], tp = Y - h;
  const outline = `M${f2(X + 6)},${f2(Y)} C${f2(X - 8)},${f2(Y - h * 0.4)} ${f2(X - 3)},${f2(tp + r * 1.7)} ${f2(X)},${f2(tp + r)} A${f2(r)},${f2(r)} 0 0 1 ${f2(X + r)},${f2(tp)} Q${f2(X + w * 0.62)},${f2(tp - 12)} ${f2(X + w * 0.86)},${f2(tp + h * 0.12)} Q${f2(X + w + 6)},${f2(tp + h * 0.3)} ${f2(X + w)},${f2(Y - h * 0.3)} L${f2(X + w)},${f2(Y)}Z`;
  let s = `<path d="${outline}" fill="#4E4943" opacity="1"/><clipPath id="t10stc"><path d="${outline}"/></clipPath><g clip-path="url(#t10stc)">`;
  // lit top cap and a darker base, both following the contour (top-lit, no vertical split)
  s += `<path d="M${f2(X - 10)},${f2(tp + h * 0.34)} Q${f2(X + w * 0.3)},${f2(tp + h * 0.26)} ${f2(X + w * 0.62)},${f2(tp + h * 0.3)} Q${f2(X + w * 0.9)},${f2(tp + h * 0.36)} ${f2(X + w + 10)},${f2(tp + h * 0.5)} L${f2(X + w + 10)},${f2(tp - 30)} L${f2(X - 10)},${f2(tp - 30)}Z" fill="#6A645C"/>`;
  s += `<path d="M${f2(X - 10)},${f2(Y - h * 0.3)} Q${f2(X + w * 0.5)},${f2(Y - h * 0.2)} ${f2(X + w + 10)},${f2(Y - h * 0.26)} L${f2(X + w + 10)},${f2(Y + 10)} L${f2(X - 10)},${f2(Y + 10)}Z" fill="#38332E"/>`;
  s += `<path d="M${f2(X + r * 0.5)},${f2(tp + r * 0.4)} Q${f2(X + w * 0.35)},${f2(tp + 4)} ${f2(X + w * 0.6)},${f2(tp + 10)}" stroke="#8A837A" stroke-width="5" fill="none" opacity="0.6"/>`;
  s += `<path d="M${X + 70},${f2(Y - h * 0.46)} l50,14 l36,-10 M${X + 200},${f2(Y - h * 0.38)} l60,8 M${X + 150},${f2(Y - h * 0.7)} l40,10" stroke="#2E2A26" stroke-width="3" fill="none" opacity="0.6"/>`;
  // where the palms rub: a slightly polished patch on the corner
  s += `<ellipse cx="${f2(X + r * 0.45)}" cy="${f2(tp + r * 0.45)}" rx="${f2(r * 0.9)}" ry="${f2(r * 0.5)}" transform="rotate(-45 ${f2(X + r * 0.45)} ${f2(tp + r * 0.45)})" fill="#7A746B" opacity="0.35"/></g>`;
  s += `<path d="${outline}" fill="none" stroke="#2A1C17" stroke-width="3"/>`;
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

// ------------------------------------------------------------------ the push, from real motion capture
// Owner: the push looked too still — one foot forward, back bent, from real human movement. Legs, hips and spine follow
// CMU mocap 82_06 (pushing a heavy object, film/mocap/clips/push_heavy.json), frames 428 -> 508: the front foot stays
// planted while the body drives and the back leg starts its next step. Its real pelvis speed (≈ 16 cm per 0.66 s at our
// scale ≈ 160 px) is the stone's speed here. The capture is mirrored so the front leg is the far one (it shows in the
// cloak's opening); the arms reach the stone (IK) and the 2D hands sit on its rounded top edge.
const PUSH = JSON.parse(fs.readFileSync(new URL('../mocap/clips/push_heavy.json', import.meta.url), 'utf8'));
const PF0 = 428, PF1 = 508, PUSH_A = T0 + 0.18;
const PUSH_EXPR = { ...EX.隐忍, jaw: 1, eye: 0.6, brow: -0.9, mouth: -0.5 };
function pushPoseAt(fr) {
  const F = PUSH.frames, i = Math.max(0, Math.min(F.length - 2, F.findIndex((r) => r.frame > fr) - 1));
  const a = F[i], b = F[i + 1], u = Math.max(0, Math.min(1, (fr - a.frame) / (b.frame - a.frame)));
  const m = (k) => a[k] + (b[k] - a[k]) * u;
  // mirrored: the capture's right (front, planted) leg is the rig's far leg L when he faces right
  return { torso: m('torso'), spine: 0.4, legL: m('thighR'), kneeL: Math.max(0, m('kneeR')), legR: m('thighL'), kneeR: Math.max(0, m('kneeL')), headWorld: 40, cloakFront: 0.1 };
}
const pushRun = (pose, target) => pushFigure({ costume: 'C', HF, height: HF, x: 0, y: 0, flip: true, expr: PUSH_EXPR, pose, tattoo: 1, hat: true, target });
// placement solved once from the last frame: the stone's right side meets the door (x CRACK) at contact
const PUSH_END = (() => {
  const r = pushRun(pushPoseAt(PF1));
  const toe = r.info.legFar.toe[0];
  const plant = CRACK - STONE_W - (r.stone.x - toe);   // world x of the planted front toe
  return { plant, top: FL + r.stone.top, r: r.stone.r, hip: plant - toe + r.info.hip[0], pose: r.pose };
})();
const STONE_TOP = PUSH_END.top, STONE_R = PUSH_END.r;
function pushAt(t) {
  const fr = lerp(PF0, PF1, ramp(t, PUSH_A, CONTACT, E.lin));
  const pose = pushPoseAt(fr);
  const nat = pushRun(pose);                               // natural reach: where the hands go this frame
  const tx = PUSH_END.plant - nat.info.legFar.toe[0];       // planted foot stays put
  const target = [nat.contact[0], nat.contact[1] + (STONE_TOP - FL) - nat.stone.top];
  const r = pushRun(pose, target);                          // arms onto the (fixed-height) stone
  return { svg: r.svg, tx, stoneX: tx + nat.stone.x, pose: r.pose };
}

// ------------------------------------------------------------------ 林冲 blocking, S22–S23 (side view, facing right)
// Timeline after the stone meets the door (第十回): he straightens, turns to the 供桌, takes the 毡笠 off and sets it on
// the altar (it stays there), sits down under the quilt facing the altar; the fire flares behind him, he turns to the
// crack, throws the quilt off and scrambles to the door. Bare-headed from 79.25 to the end of T10.
const STAND_X = Math.round(PUSH_END.hip);             // he stands up over his hips where the push ended
const HAT_ON_ALTAR = [300, 570];                      // brim centre resting on the altar top (world)
const HAT_OFF = 79.25, HAT_DOWN = 79.48;
function blocking(t) {
  let x, dy = 0, lean = 0, sh = 0, el = 0, tilt = 0, expr = { ...EX.隐忍 }, quilt = 0, b_fallen = null;
  let right = true, sx = 1, hat = true, legR = 0, legL = 0, push = null, bodyPose = null;
  let stoneX = CRACK - STONE_W;
  const turnSq = (t0) => { const k = (t - t0) / 0.13; return k > 0 && k < 1 ? Math.max(0.78, Math.abs(Math.cos(k * Math.PI))) : 1; };
  if (t < CONTACT) {
    push = pushAt(t);
    stoneX = push.stoneX; x = push.tx;
  } else if (t < 78.95) {
    // he lets go and stands up out of the lunge, over his hips; the pose eases back to standing
    const k = ramp(t, CONTACT + 0.04, 78.95, E.inOut);
    const P = PUSH_END.pose, z = (v) => (v === undefined ? 0 : v * (1 - k));
    bodyPose = { torso: z(P.torso), spine: 0.4, legL: z(P.legL), kneeL: z(P.kneeL), legR: z(P.legR), kneeR: z(P.kneeR), cloakFront: 0.1,
      armsWorld: true, shoulderR: z(P.shoulderR), elbowR: z(P.elbowR), shoulderL: z(P.shoulderL), elbowL: z(P.elbowL), headWorld: lerp(40, 0, k) };
    x = lerp(PUSH_END.plant - pushRun(pushPoseAt(PF1)).info.legFar.toe[0], STAND_X, k);
    expr = { ...EX.隐忍, eye: 0.75, brow: -0.6 };
  } else if (t < HAT_DOWN + 0.02) {
    // turn to the altar, lift the hat off, set it down
    x = STAND_X;
    right = t < 79.015; sx = turnSq(78.95);
    const up = ramp(t, 79.07, HAT_OFF, E.inOut), down = ramp(t, HAT_OFF, HAT_DOWN, E.inOut);
    sh = lerp(lerp(0, 128, up), 62, down); el = lerp(lerp(0, 58, up), 12, down);
    hat = t < HAT_OFF;
    expr = { ...EX.隐忍, eye: 0.7, brow: -0.5 };
  } else if (t < 80.26) {
    // sits down facing the altar, quilt over the legs; the fire flares behind him, he turns to the crack
    x = STAND_X; hat = false;
    const k = ramp(t, HAT_DOWN, 79.86, E.inOut);
    sh = lerp(62, 0, ramp(t, HAT_DOWN, 79.7, E.inOut)); el = lerp(12, 0, k);
    dy = 0.43 * HF * k; quilt = k;
    tilt = lerp(0, 12, k);
    right = t >= FLARE + 0.08; sx = turnSq(FLARE + 0.015);
    expr = { ...EX.隐忍, eye: lerp(0.7, 0.4, k), brow: -0.4, jaw: 0.3 };
    if (t >= FLARE) {
      const s2 = ramp(t, FLARE, FLARE + 0.2, E.out);
      tilt = lerp(12, -6, s2);
      expr = { ...EX.隐忍, eye: lerp(0.4, 1.2, s2), brow: lerp(-0.4, 0.2, s2), jaw: 0, mouth: -0.2 };
    }
  } else {
    // up and to the crack: a scrambling run, ends kneeling behind the stone with his eye at the crack
    hat = false;
    const k = ramp(t, 80.26, 81.45, E.inOut);
    const x0 = STAND_X, x1 = 1352;
    x = lerp(x0, x1, k);
    dy = 0.43 * HF * (1 - k) + lerp(0, 180, k) * (k > 0.5 ? 1 : k * 2) - (k < 1 ? Math.sin(k * Math.PI) * 120 : 0);
    dy = Math.max(dy, 60);
    b_fallen = { x: x0, k: ramp(t, 80.26, 80.6, E.out) };
    lean = Math.sin(k * Math.PI) * 12;
    tilt = lerp(-6, 6, k);
    const ph = (x - x0) / 300, amp = Math.sin(Math.min(1, k * 1.15) * Math.PI) * 32;
    legR = amp * Math.sin(ph * Math.PI); legL = -legR;
    sh = 18 * Math.sin(ph * Math.PI + Math.PI) * Math.sin(k * Math.PI); el = 30 * Math.sin(k * Math.PI);
    expr = { ...EX.隐忍, eye: 1.1, brow: 0.05, jaw: 0.5, mouth: -0.3, look: [0.4, 0] };
  }
  return { x, dy, lean, sh, el, tilt, expr, quilt, stoneX, fallen: b_fallen, right, sx, hat, legR, legL, push, bodyPose };
}
/** The 毡笠 as a loose prop, side view: brim centre at (x, y). */
function hatProp(x, y, rot = 0) {
  const w = 0.215 * HF, dh = 0.062 * HF, dw = 0.092 * HF;
  return `<g transform="translate(${f2(x)} ${f2(y)}) rotate(${f2(rot)})">` +
    `<path d="M${f2(-dw / 2)},-4 Q${f2(-dw / 2)},${f2(-dh * 1.05)} 0,${f2(-dh * 1.08)} Q${f2(dw / 2)},${f2(-dh * 1.05)} ${f2(dw / 2)},-4Z" fill="#d9d1c3" stroke="#1e1612" stroke-width="2"/>` +
    `<path d="M${f2(dw * 0.12)},${f2(-dh * 1.05)} Q${f2(dw / 2)},${f2(-dh)} ${f2(dw / 2)},-4 L${f2(dw * 0.2)},-4Z" fill="#b3a998"/>` +
    `<rect x="${f2(-dw / 2)}" y="${f2(-dh * 0.32)}" width="${f2(dw)}" height="${f2(dh * 0.22)}" fill="#857a69"/>` +
    `<path d="M${f2(-w / 2)},0 Q0,${f2(-9)} ${f2(w / 2)},0 Q0,${f2(9)} ${f2(-w / 2)},0Z" fill="#d9d1c3" stroke="#1e1612" stroke-width="2"/>` +
    `<path d="M${f2(-dw * 0.3)},6 q-6,40 14,58 q14,-10 10,-56" stroke="#b8322a" stroke-width="2.4" fill="none"/>` +
    `<path d="M${f2(-dw * 0.45)},${f2(-dh * 1.0)} q${f2(dw * 0.3)},-6 ${f2(dw * 0.6)},-3" stroke="#ffffff" stroke-width="3" opacity="0.7" fill="none"/></g>`;
}
function hatLoose(t, b) {
  if (t < HAT_OFF) return '';
  const k = ramp(t, HAT_OFF, HAT_DOWN, E.inOut);
  // from his head (he faces left now) to the altar top
  const head = [STAND_X - 0.05 * HF, FL - 0.975 * HF];
  const p = [lerp(head[0] - 0.06 * HF, HAT_ON_ALTAR[0], k), lerp(head[1] - 0.04 * HF, HAT_ON_ALTAR[1], k) - Math.sin(k * Math.PI) * 40];
  return hatProp(p[0], p[1], lerp(-8, 0, k));
}
function lcSide(t, b) {
  if (b.push) return `<g transform="translate(${f2(b.x)} ${f2(FL)})">${b.push.svg}</g>`;
  if (b.bodyPose) return `<g transform="translate(${f2(b.x)} ${f2(FL)})">${lin({ view: 'side', costume: 'C', expr: b.expr, pose: b.bodyPose, flip: true, height: HF, x: 0, y: 0, tattoo: 1, hat: b.hat })}</g>`;
  const pose = { headTilt: b.tilt, shoulderR: b.sh, elbowR: b.el, shoulderL: b.sh * 0.92, elbowL: b.el, legR: b.legR, legL: b.legL };
  const fig = lin({ view: 'side', costume: 'C', expr: b.expr, pose, flip: b.right, height: HF, x: 0, y: 0, tattoo: 1, hat: b.hat });
  return `<g transform="translate(${f2(b.x)} ${f2(FL + b.dy)}) scale(${f2(b.sx)} 1) rotate(${f2(b.lean)} -40 0)">${fig}</g>`;
}
function quiltSVG(b) {
  if (b.fallen) {
    // the quilt slides off as he jumps up and stays crumpled on the straw
    const x = b.fallen.x, k = b.fallen.k, top = lerp(FL - 0.3 * HF + 30, FL - 70, k);
    return `<path d="M${f2(x - 0.18 * HF)},${FL + 80} Q${f2(x - 0.2 * HF)},${f2(top + 30)} ${f2(x - 0.02 * HF)},${f2(top)} Q${f2(x + 0.18 * HF)},${f2(top + 10)} ${f2(x + 0.3 * HF)},${f2(top + 40)} Q${f2(x + 0.46 * HF)},${f2(FL - 10)} ${f2(x + 0.52 * HF)},${FL + 80}Z" fill="#5B5A5E"/>` +
      `<path d="M${f2(x)},${f2(top + 14)} q40,30 90,24 M${f2(x + 0.2 * HF)},${f2(top + 30)} q10,40 50,50" stroke="#424147" stroke-width="5" fill="none"/>`;
  }
  if (b.quilt <= 0.01) return '';
  const x = b.x, k = b.quilt, top = FL - 0.30 * HF * k + 30;
  return `<g transform="translate(${f2(x)} 0) scale(${b.right ? 1 : -1} 1) translate(${f2(-x)} 0)">` + `<path d="M${f2(x - 0.16 * HF)},${FL + 80} Q${f2(x - 0.2 * HF)},${f2(top + 60)} ${f2(x - 0.06 * HF)},${f2(top + 6)} Q${f2(x + 0.02 * HF)},${f2(top - 8)} ${f2(x + 0.1 * HF)},${f2(top + 4)} Q${f2(x + 0.2 * HF)},${f2(top + 30)} ${f2(x + 0.3 * HF)},${f2(FL - 120)} Q${f2(x + 0.4 * HF)},${f2(FL - 40)} ${f2(x + 0.5 * HF)},${FL + 80}Z" fill="#5B5A5E"/>` +
    `<path d="M${f2(x - 0.05 * HF)},${f2(top + 20)} q40,60 20,160 M${f2(x + 0.18 * HF)},${f2(top + 10)} q-20,80 10,180" stroke="#424147" stroke-width="5" fill="none"/>` +
    `<rect x="${f2(x + 0.05 * HF)}" y="${f2(top + 60)}" width="60" height="44" fill="#6A6460" transform="rotate(8 ${f2(x)} ${f2(top)})"/></g>`;
}
function breath(t, b) {
  if (b.quilt < 0.2 || t > 80.4) return '';
  let s = '';
  const dir = b.right ? 1 : -1;
  for (const t0 of [79.62, 80.15]) {
    const a = (t - t0) / 1.1;
    if (a < 0 || a > 1) continue;
    const mx = b.x + dir * (0.085 * HF + a * 50), my = FL + b.dy - 0.88 * HF - a * 40;
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
  const face = lin({ view: 'front', costume: 'C', expr, height: hgt, x: fx, y: fy, tattoo: 1, hat: false });
  // cold rim on the hair cap and the cheek edges (light from the cracks behind), relative to the eye line
  const X = (dx) => f2(ex + dx), Y = (dy) => f2(ey + dy);
  const rim = `<g fill="none" stroke="#3B4F73" stroke-linecap="round" filter="url(#${blurId(2)})" opacity="0.6">` +
    `<path d="M${X(-176)},${Y(-80)} C${X(-176)},${Y(-170)} ${X(-140)},${Y(-250)} ${X(-50)},${Y(-292)}" stroke-width="4.5"/>` +
    `<path d="M${X(186)},${Y(-80)} C${X(186)},${Y(-170)} ${X(150)},${Y(-250)} ${X(60)},${Y(-292)}" stroke-width="4.5"/></g>`;
  // the hat-band remnants at the temples (rig) hidden under hair
  const temples = `<path d="M${X(-205)},${Y(-26)} L${X(-200)},${Y(-150)} L${X(210)},${Y(-150)} L${X(214)},${Y(-26)} C${X(196)},${Y(-30)} ${X(186)},${Y(-50)} ${X(176)},${Y(-62)} C${X(120)},${Y(-68)} ${X(60)},${Y(-74)} ${X(4)},${Y(-72)} C${X(-54)},${Y(-74)} ${X(-112)},${Y(-68)} ${X(-168)},${Y(-62)} C${X(-178)},${Y(-50)} ${X(-188)},${Y(-30)} ${X(-205)},${Y(-26)}Z" fill="#151312"/>` +
    `<g filter="url(#${blurId(12)})" fill="#07070B" opacity="0.9"><ellipse cx="${X(-160)}" cy="${Y(160)}" rx="40" ry="165"/><ellipse cx="${X(156)}" cy="${Y(160)}" rx="40" ry="165"/></g>`;
  const fk = fireK(t);
  const bandY = ey - 8, bandH = 78;
  let s = `<rect x="-20" y="-20" width="1960" height="1120" fill="#2A221E"/>`;
  s += `<g transform="translate(${ex} ${ey}) scale(${f2(z)}) translate(${-ex} ${-ey})">${face}${temples}`;
  // fire tint across the slit, darkness elsewhere (luma ~25–30), a cold rim on the hat brim
  s += `<rect x="-200" y="${bandY - bandH * 1.2}" width="2400" height="${bandH * 2.4}" fill="#FF8A3D" opacity="${f2(0.32 * fk)}" style="mix-blend-mode:multiply"/>`;
  s += `<rect x="-400" y="-400" width="2800" height="2000" fill="#07070B" opacity="0.76" mask="url(#t10band)"/>`;
  s += `<rect x="-400" y="${bandY - bandH * 0.5}" width="2800" height="${bandH}" fill="#FFB070" opacity="${f2(0.17 * fk)}" style="mix-blend-mode:screen" filter="url(#${blurId(10)})"/>`;
  // faint warm bounce under the slit (cheeks, moustache) and the cold rim over the darkness
  s += `<ellipse cx="${ex}" cy="${ey + 120}" rx="150" ry="90" fill="#C8642E" opacity="${f2(0.22 * fk)}" style="mix-blend-mode:screen" filter="url(#${blurId(30)})"/>`;
  s += rim;
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
  // during the push the frame sits lower so both feet and the floor are in (owner: one foot forward must read), then
  // eases up to the standing framing as he straightens
  if (t < 80.26) return { x: lerp(40, -20, ramp(t, T0 - 0.4, 80.26, E.inOut)), y: lerp(36, -40, ramp(t, CONTACT + 0.15, 79.7, E.inOut)), zoom: lerp(1.1, 1.13, ramp(t, T0 - 0.4, 80.26, E.inOut)) };
  const c0 = { x: -20, y: -40, zoom: 1.13 };
  const cr = [CRACK, eye[1] + 10];
  if (t < 81.5) {
    const k = ramp(t, 80.26, 81.5, E.inOut), z = lerp(1.13, 1.3, k);
    const target = camAt([lerp(960 + c0.x, cr[0] - 120, k), lerp(540 + c0.y, cr[1] + 60, k)], [960, 540], z);
    return target;
  }
  const z = t < 82.34 ? zexp(t, 81.5, 82.34, 1.3, 2.5, E.inOut) : zexp(t, 82.34, 82.74, 2.5, 4.6, E.in);
  const k = ramp(t, 81.5, 82.2, E.inOut);
  return camAt([lerp(cr[0] - 120, cr[0], k), lerp(cr[1] + 60, cr[1], k)], [960, 540], Math.min(z, 4.6));
}

export default {
  enter: {
    a: 77.3, b: 77.748, type: 'mask',
    // the outside leaf covers the frame at 77.53 (T09); as it passes the lens the inside is revealed left → right
    mask: (t) => {
      const x = revealX(t);
      return `<defs><linearGradient id="t10wm" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#000"/></linearGradient></defs><rect x="-60" y="0" width="${f2(Math.max(0, x + 60))}" height="1080" fill="#fff"/><rect x="${f2(x)}" y="0" width="140" height="1080" fill="url(#t10wm)"/>`;
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
      s += L(c, 1, SPEAR_LEAN + door(skD) + crackLight(t, c) + lcSide(t, b) + hatLoose(t, b) + quiltSVG(b) + breath(t, b) + stone(b.stoneX, skC) + dustPuff(t, b), { id: 't10set', bleed: 'all' });
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
    if (t < 77.75) { const x = revealX(t); s += `<defs><linearGradient id="t10le" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#120D0A" stop-opacity="0"/><stop offset="1" stop-color="#120D0A" stop-opacity="0.85"/></linearGradient></defs><rect x="${f2(x - 220)}" y="-10" width="230" height="1100" fill="url(#t10le)"/>`; }
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
