// 岳庙 onlookers (builder C): small flat figures for wide shots, scaled by the perspective rule.
//   person({ x, y, h, col, hat, turn, back, seed }) -> <g>; (x, y) = feet, h = height px (top of head/hat to sole).
//     turn -1..1 head yaw (-1 faces left, 0 camera, +1 faces right); back = seen from behind.
//   crowd({ t, people:[{x, y, P (m), turnAt, turnTo, back, hat, col}], yh, cam_h, scale }) -> all, sorted by y.
//     Height from the perspective rule: h = (y - yh) * P / cam_h * scale.
import { f2, clamp, rng, E } from '../lib.mjs';
import { mixHex } from './c_util.mjs';

const LN = '#2A1C17';
const ROBES = [['#7E6E60', '#665849'], ['#8A7A5E', '#6E6048'], ['#5E6B6E', '#4A5558'], ['#9A8468', '#7C6950'], ['#6B5A58', '#554645'], ['#A28C6A', '#86714F'], ['#4F5A66', '#3E4752'], ['#857060', '#6A584A']];
const SKIN = ['#E9B48E', '#DDA67F', '#F0BE9A', '#D69C77'];

export function person(o = {}) {
  const R = rng(o.seed || 1);
  let [c, cs] = o.col || ROBES[Math.floor(R() * ROBES.length)];
  if (o.haze) { c = mixHex(c, o.hazeCol || '#EAD9B6', o.haze); cs = mixHex(cs, o.hazeCol || '#EAD9B6', o.haze); }
  const pose = o.pose || ['hang', 'fold', 'hang', 'chest', 'fold', 'hang'][Math.floor(R() * 6)];
  const sk = SKIN[Math.floor(R() * SKIN.length)];
  const k = (o.h || 200) / 100, back = !!o.back;
  const flipQ = o.flip ?? null;
  let turn = clamp(o.turn ?? 0, -1, 1);
  const hat = o.hat || ['bun', 'cap', 'scarf', 'bun', 'cap'][Math.floor(R() * 5)];
  const wide = 1 + (R() - 0.5) * 0.16;
  let s = '';
  // shoes + robe
  s += `<path d="M-9,-1 L-8,-5 L-2,-5 L-2,0Z M2,0 L2,-5 L8,-5 L9,-1Z" fill="#1E1A18"/>`;
  s += `<path d="M${f2(-12 * wide)},-4 C${f2(-13 * wide)},-30 ${f2(-12 * wide)},-58 ${f2(-11 * wide)},-70 C-7,-76 7,-76 ${f2(11 * wide)},-70 C${f2(12 * wide)},-58 ${f2(13 * wide)},-30 ${f2(12 * wide)},-4 C5,-1 -5,-1 ${f2(-12 * wide)},-4Z" fill="${c}" stroke="${LN}" stroke-width="0.9"/>`;
  // sleeves
  if (pose === 'fold') {
    // hands joined in front, sleeves meeting at the waist
    s += `<path d="M${f2(-11 * wide)},-70 C${f2(-15 * wide)},-60 -12,-48 -2,-44 L2,-44 C12,-48 ${f2(15 * wide)},-60 ${f2(11 * wide)},-70 C6,-62 -6,-62 ${f2(-11 * wide)},-70Z" fill="${cs}" stroke="${LN}" stroke-width="0.8"/>`;
  } else if (pose === 'chest') {
    // one hand raised to the chest (alarmed), the other hanging
    s += `<path d="M${f2(-11 * wide)},-70 C${f2(-17 * wide)},-62 ${f2(-19 * wide)},-46 ${f2(-17 * wide)},-34 C-14,-32 -11,-34 -10,-38Z" fill="${cs}" stroke="${LN}" stroke-width="0.8"/>`;
    s += `<path d="M${f2(11 * wide)},-70 C${f2(15 * wide)},-62 8,-56 -2,-58 L-1,-63 C6,-62 ${f2(9 * wide)},-66 ${f2(9 * wide)},-70Z" fill="${cs}" stroke="${LN}" stroke-width="0.8"/>`;
  } else {
    s += `<path d="M${f2(-11 * wide)},-70 C${f2(-17 * wide)},-62 ${f2(-19 * wide)},-46 ${f2(-17 * wide)},-34 C-14,-32 -11,-34 -10,-38Z M${f2(11 * wide)},-70 C${f2(17 * wide)},-62 ${f2(19 * wide)},-46 ${f2(17 * wide)},-34 C14,-32 11,-34 10,-38Z" fill="${cs}" stroke="${LN}" stroke-width="0.8"/>`;
  }
  if (!back) s += `<path d="M-4,-74 L0,-66 L4,-74" fill="none" stroke="#EDE6DA" stroke-width="2"/>`;
  s += `<path d="M-10,-44 C-4,-42 4,-42 10,-44" fill="none" stroke="${cs}" stroke-width="2.2"/>`;
  // neck + head
  s += `<rect x="-3" y="-80" width="6" height="7" fill="${sk}"/>`;
  const hx = turn * 1.4;
  if (back) {
    s += `<ellipse cx="${f2(hx)}" cy="-87" rx="7.2" ry="8.6" fill="#1D1917" stroke="${LN}" stroke-width="0.8"/>`;
  } else {
    s += `<ellipse cx="${f2(hx)}" cy="-87" rx="7" ry="8.4" fill="${sk}" stroke="${LN}" stroke-width="0.8"/>`;
    // hair cap on top, shifted to the back of the head when turned
    s += `<path d="M${f2(hx - 7.2)},-88.5 C${f2(hx - 7.4 - turn * 1.5)},-98 ${f2(hx + 7.4 - turn * 1.5)},-98 ${f2(hx + 7.2)},-88.5 C${f2(hx + 3 - turn * 2)},-91.5 ${f2(hx - 3 - turn * 2)},-91.5 ${f2(hx - 7.2)},-88.5Z" fill="#1D1917"/>`;
    if (Math.abs(turn) > 0.3) {
      const ex = hx - Math.sign(turn) * 5.6;
      s += `<ellipse cx="${f2(ex)}" cy="-86.5" rx="1.6" ry="2.4" fill="${sk}" stroke="${LN}" stroke-width="0.5"/>`;
    }
    const ec = hx + turn * 3.4;
    if (Math.abs(turn) < 0.8) s += `<circle cx="${f2(ec - 2.5)}" cy="-86.5" r="0.85" fill="#1D1917"/>`;
    s += `<circle cx="${f2(ec + (Math.abs(turn) < 0.8 ? 2.5 : 0))}" cy="-86.5" r="0.85" fill="#1D1917"/>`;
  }
  if (hat === 'bun') s += `<circle cx="${f2(hx - turn * 1.5)}" cy="-97" r="3.6" fill="#1D1917"/>`;
  else if (hat === 'cap') s += `<path d="M${f2(hx - 7.6)},-89 C${f2(hx - 8)},-100 ${f2(hx + 8)},-100 ${f2(hx + 7.6)},-89Z" fill="#2B2A2E"/><rect x="${f2(hx - 3)}" y="-102" width="6" height="5" rx="1.5" fill="#2B2A2E"/>`;
  else s += `<path d="M${f2(hx - 7.8)},-88 C${f2(hx - 8)},-99 ${f2(hx + 8)},-99 ${f2(hx + 7.8)},-88 L${f2(hx + 9 * (back ? 0 : -turn))},-84Z" fill="#3E4A5A"/>`;
  const lean = o.lean ?? (R() - 0.5) * 7, fl = o.flip ?? R() < 0.5;
  return `<g transform="translate(${f2(o.x || 0)} ${f2(o.y || 0)}) rotate(${f2(lean)}) scale(${f2(fl ? -k : k)} ${f2(k)})">${s}</g>`;
}

/** Crowd with staggered head turns toward a target over [turnAt, turnAt + 0.3]. */
export function crowd(o = {}) {
  const t = o.t || 0, yh = o.yh ?? -900, camh = o.cam_h ?? 9.6, sc = o.scale ?? 1;
  const ppl = [...(o.people || [])].sort((a, b) => a.y - b.y);
  let s = '';
  for (const p of ppl) {
    const h = ((p.y - yh) * (p.P || 1.68)) / camh * sc;
    const k = p.turnAt != null ? E.inOut(clamp((t - p.turnAt) / 0.3)) : 0;
    const turn = (p.turn0 ?? 0) + ((p.turnTo ?? 0) - (p.turn0 ?? 0)) * k;
    s += `<ellipse cx="${f2(p.x)}" cy="${f2(p.y)}" rx="${f2(h * 0.13)}" ry="${f2(h * 0.03)}" fill="#3A2E24" opacity="0.22"/>`;
    const fl = p.flip ?? rng((p.seed || 1) * 7 + 3)() < 0.5;
    const haze = p.haze ?? clamp(((o.hazeY ?? 1150) - p.y) / 450) * 0.42;
    s += person({ x: p.x, y: p.y, h, turn: fl ? -turn : turn, back: p.back, hat: p.hat, col: p.col, seed: p.seed, flip: fl, haze, pose: p.pose });
  }
  return s;
}
