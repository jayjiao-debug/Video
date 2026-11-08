// The 休书 prop (L8 text, simplified, 57 characters, no 「恐后无凭」 tail), shared by T01 (S01–S03), T08 (S19) and T13 (S32).
// Owner of refinements: the T01 builder. Others import it.
//   xiushu({ w, h, id, ink, sign, print, printOp, bloom, crumple, glow }) -> SVG in local coords (0,0)–(w,h)
//   ink 0..1     text opacity (1 = written; S32 lifts it off)
//   sign 0..1    the 花押 being drawn (stroke reveal)
//   print 0..1   palm print presence (0 none, 1 pressed); printOp overrides opacity
//   bloom 0..1   tear ink-bloom on 「休」 (radius 0 -> 85 px at w = 680)
//   crumple 0..1 crumple lines from the lower corners
//   glow 0..1    paper glowing from within (S32)
// Geometry helpers: XS.anchor(name, w, h) gives the local point of '休' (heading), 'sign', 'print'.
import { ASSET, furl, f2, palmPrint, clamp, rng, INK, SEAL } from '../lib.mjs';

const TEXT = ['东京八十万禁军教头林冲', '为因身犯重罪断配沧州', '去后存亡不保有妻张氏', '年少情愿立此休书任从', '改嫁永无争执委是自行', '情愿即非相逼'];

export const XS = {
  anchor(name, w = 680, h = 760) {
    const k = w / 680;
    if (name === '休') return [w - 92 * k, 120 * k];
    if (name === 'sign') return [150 * k, h - 230 * k];
    if (name === 'print') return [150 * k, h - 170 * k];
    return [w / 2, h / 2];
  },
};

export function xiushu(o = {}) {
  const w = o.w || 680, h = o.h || 760, id = o.id || 'xs', k = w / 680;
  const ink = o.ink ?? 1;
  let s = `<defs><clipPath id="${id}c"><path d="M${f2(4 * k)},${f2(2 * k)} L${f2(w - 3 * k)},0 L${w},${f2(h - 4 * k)} L${f2(3 * k)},${h} Z"/></clipPath>` +
    `<radialGradient id="${id}e" cx="0.5" cy="0.5" r="0.72"><stop offset="0.6" stop-color="#7a5a32" stop-opacity="0"/><stop offset="1" stop-color="#7a5a32" stop-opacity="0.28"/></radialGradient>` +
    `<radialGradient id="${id}b" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#17120E" stop-opacity="0.55"/><stop offset="0.55" stop-color="#2a2018" stop-opacity="0.32"/><stop offset="1" stop-color="#2a2018" stop-opacity="0"/></radialGradient>` +
    `<filter id="${id}r" x="-20%" y="-20%" width="140%" height="140%"><feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="4"/><feDisplacementMap in="SourceGraphic" scale="${f2(18 * k)}"/></filter></defs>`;
  s += `<g clip-path="url(#${id}c)" data-container="1">`;
  s += `<rect data-box="1" x="0" y="0" width="${w}" height="${h}" fill="#F1E4C6"/>`;
  s += `<image href="${furl(ASSET + '/paper.png')}" x="0" y="0" width="${w}" height="${h}" preserveAspectRatio="xMidYMid slice" opacity="0.9"/>`;
  if (o.glow) s += `<rect width="${w}" height="${h}" fill="#FFF3D6" opacity="${f2(o.glow * 0.35)}"/>`;
  s += `<rect width="${w}" height="${h}" fill="url(#${id}e)"/>`;
  // ruled column lines, faint
  const cols = TEXT.length + 1, x0 = w - 92 * k, dx = (w - 250 * k) / cols;
  let g = '';
  for (let i = 0; i <= cols; i++) g += `<line x1="${f2(x0 + 46 * k - i * dx)}" y1="${f2(60 * k)}" x2="${f2(x0 + 46 * k - i * dx)}" y2="${f2(h - 60 * k)}" stroke="#B0473A" stroke-width="${f2(1.2 * k)}" opacity="0.18"/>`;
  s += g;
  // heading 休书 (larger) then the text, right to left
  const fsH = 64 * k, fs = 46 * k;
  let tx = '';
  tx += ['休', '书'].map((ch, i) => `<text data-inbox="1" x="${f2(x0)}" y="${f2(88 * k + i * fsH * 1.12)}" font-family="Ma Shan Zheng" font-size="${f2(fsH)}" fill="${INK}" text-anchor="middle" dominant-baseline="hanging">${ch}</text>`).join('');
  TEXT.forEach((col, c) => {
    const x = x0 - (c + 1) * dx;
    [...col].forEach((ch, i) => { tx += `<text data-inbox="1" x="${f2(x)}" y="${f2(80 * k + i * fs * 1.16)}" font-family="Ma Shan Zheng" font-size="${f2(fs)}" fill="${INK}" text-anchor="middle" dominant-baseline="hanging">${ch}</text>`; });
  });
  s += `<g opacity="${f2(ink)}">${tx}</g>`;
  // tear bloom on 休
  if (o.bloom) {
    const [bx, by] = XS.anchor('休', w, h), r = 85 * k * o.bloom;
    s += `<g filter="url(#${id}r)"><circle cx="${f2(bx)}" cy="${f2(by + 30 * k)}" r="${f2(r)}" fill="url(#${id}b)"/></g>`;
    s += `<circle cx="${f2(bx)}" cy="${f2(by + 30 * k)}" r="${f2(r * 0.35)}" fill="#e9ecef" opacity="${f2(0.25 * o.bloom)}"/>`;
  }
  // 花押 (signature flourish) + date line
  const [sx, sy] = XS.anchor('sign', w, h);
  if (o.sign) {
    const len = 900;
    s += `<path d="M${f2(sx - 60 * k)},${f2(sy - 40 * k)} C${f2(sx - 10 * k)},${f2(sy - 90 * k)} ${f2(sx + 50 * k)},${f2(sy - 40 * k)} ${f2(sx)},${f2(sy - 10 * k)} C${f2(sx - 50 * k)},${f2(sy + 20 * k)} ${f2(sx - 40 * k)},${f2(sy + 40 * k)} ${f2(sx + 30 * k)},${f2(sy + 20 * k)} C${f2(sx + 70 * k)},${f2(sy + 8 * k)} ${f2(sx + 80 * k)},${f2(sy - 30 * k)} ${f2(sx + 60 * k)},${f2(sy - 50 * k)}" fill="none" stroke="${INK}" stroke-width="${f2(7 * k)}" stroke-linecap="round" stroke-dasharray="${len}" stroke-dashoffset="${f2(len * (1 - clamp(o.sign)))}" opacity="${f2(ink)}"/>`;
  }
  // palm print (手模), left third, lower
  if (o.print) {
    const [px, py] = XS.anchor('print', w, h);
    s += palmPrint(px + 60 * k, py + 10 * k, 300 * k, -8, o.printOp ?? clamp(o.print), SEAL);
  }
  // crumple lines from the lower corners
  if (o.crumple) {
    const R = rng(9);
    let cl = '';
    for (const [cx, cy, dir] of [[30 * k, h - 30 * k, 1], [w - 30 * k, h - 30 * k, -1]]) {
      for (let i = 0; i < 3; i++) {
        const a = (-35 - i * 22 - R() * 10) * Math.PI / 180, L = (90 + R() * 80) * k * clamp(o.crumple);
        cl += `<path d="M${f2(cx)},${f2(cy)} l${f2(dir * Math.cos(a) * L)},${f2(Math.sin(a) * L)}" stroke="#8a6a44" stroke-width="${f2(1.6 * k)}" opacity="0.45"/>`;
      }
    }
    s += cl;
  }
  s += '</g>';
  return s;
}
