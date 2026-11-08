// The red 手模 palm print (right hand, pressed face down, fingers pointing up, thumb on the left), baked to PNG.
//   palm(cx, cy, height, rot=0, op=1, o={}) -> <g> with the print centred at (cx, cy); height = wrist to middle fingertip.
//     o.wet 0..1 adds a glossy sheen (fresh paste); o.soak 0..1 softens the edges (soaking into the fibres).
//   palmSVG(o) -> raw SVG content in a 300 x 400 box (for other uses).
import { bake, f2, rng, SEAL } from '../lib.mjs';

function rr(x, y, w, h, r, a = 0, cx = x + w / 2, cy = y + h) {
  return `<rect x="${f2(x)}" y="${f2(y)}" width="${f2(w)}" height="${f2(h)}" rx="${f2(r)}" transform="rotate(${f2(a)} ${f2(cx)} ${f2(cy)})"/>`;
}

export function palmSVG(o = {}) {
  const col = o.col || SEAL;
  // finger: base (bx, by), angle, width, segment lengths (proximal, middle, distal), gaps at the joints
  const fingers = [
    { bx: 112, by: 172, a: -9, w: 34, seg: [56, 36, 36] },  // index
    { bx: 150, by: 166, a: -2, w: 36, seg: [62, 40, 38] },  // middle
    { bx: 187, by: 170, a: 6, w: 34, seg: [58, 38, 35] },   // ring
    { bx: 220, by: 184, a: 15, w: 30, seg: [46, 30, 29] },  // little
  ];
  let ink = '';
  // palm pad
  ink += `<path d="M96,176 C120,160 196,158 236,182 C246,214 246,262 236,300 C226,336 204,362 170,372 C140,378 108,372 92,352 C76,330 70,298 74,262 C70,232 78,196 96,176Z"/>`;
  // thenar bulge (thumb base, left) and hypothenar (right edge)
  ink += `<path d="M74,262 C60,250 52,232 58,214 C64,200 84,196 100,206 C112,236 112,282 104,318 C92,312 80,292 74,262Z"/>`;
  // fingers with joint gaps
  for (const fg of fingers) {
    let y = fg.by;
    const parts = [];
    fg.seg.forEach((L, i) => { const gap = i === 0 ? 0 : 3.5; y -= gap; parts.push([y - L, L]); y -= L; });
    for (const [yy, L] of parts) ink += rr(fg.bx - fg.w / 2, yy, fg.w, L, fg.w * 0.48, fg.a, fg.bx, fg.by);
  }
  // thumb: two pads angled out to the upper left from the thenar
  ink += `<g transform="rotate(-38 82 226)">${rr(66, 132, 38, 62, 18, 0)}${rr(64, 76, 36, 52, 18, 0)}</g>`;
  // creases (paper showing through): heart, head, life lines + finger-base creases
  const cr = `fill="none" stroke="#F1E4C6" stroke-linecap="round"`;
  let creases = '';
  creases += `<path d="M238,214 C210,206 178,210 150,224 C134,232 122,232 112,226" ${cr} stroke-width="4.5"/>`;
  creases += `<path d="M232,250 C196,244 160,252 128,262 C114,266 104,262 98,252" ${cr} stroke-width="4"/>`;
  creases += `<path d="M104,206 C120,240 124,286 132,330 C136,350 146,362 156,370" ${cr} stroke-width="4.5"/>`;
  creases += `<path d="M196,300 C192,320 186,340 178,356" ${cr} stroke-width="2.5" opacity="0.8"/>`;
  // skin ridges: fine wavy lines, low contrast
  const R = rng(17);
  let ridges = '';
  for (let i = 0; i < 46; i++) {
    const y = 120 + i * 6 + R() * 3, x0 = 60 + R() * 30, x1 = 250 - R() * 30, a = 4 + R() * 6;
    ridges += `<path d="M${f2(x0)},${f2(y)} Q${f2((x0 + x1) / 2)},${f2(y + a)} ${f2(x1)},${f2(y + R() * 4 - 2)}" fill="none" stroke="#F1E4C6" stroke-width="1.1" opacity="0.22"/>`;
  }
  for (const fg of fingers) for (let j = 0; j < 9; j++) {
    const yy = fg.by - 20 - j * 13;
    ridges += `<path d="M${f2(fg.bx - fg.w * 0.4)},${f2(yy)} Q${f2(fg.bx)},${f2(yy - 5)} ${f2(fg.bx + fg.w * 0.4)},${f2(yy)}" fill="none" stroke="#F1E4C6" stroke-width="1.0" opacity="0.2" transform="rotate(${fg.a} ${fg.bx} ${fg.by})"/>`;
  }
  const defs = `<filter id="pmrough" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency="0.09" numOctaves="2" seed="3" result="n"/>` +
    `<feDisplacementMap in="SourceGraphic" in2="n" scale="5" result="d"/>` +
    `<feTurbulence type="fractalNoise" baseFrequency="0.55" numOctaves="1" seed="8" result="sp"/>` +
    `<feColorMatrix in="sp" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.4 1.9" result="spm"/>` +
    `<feComposite in="d" in2="spm" operator="in" result="speck"/>` +
    `<feGaussianBlur in="speck" stdDeviation="${f2(0.4 + (o.soak || 0) * 1.2)}"/></filter>`;
  let s = `<defs>${defs}</defs><g filter="url(#pmrough)"><g fill="${col}">${ink}</g>${creases}${ridges}</g>`;
  // darker pooled rim
  s += `<g fill="none" stroke="#7E1C17" stroke-width="2.5" opacity="0.35" filter="url(#pmrough)">${ink.replace(/<path /g, '<path ').replace(/fill="[^"]*"/g, '')}</g>`;
  return s;
}

export function palm(cx, cy, height, rot = 0, op = 1, o = {}) {
  const img = bake(`palm${o.soak ? 's' : ''}`, 600, 800, palmSVG(o), { vb: '0 0 300 400' });
  const k = height / 760; // print height in the box ≈ 380 of 400 units -> 760 of 800 px
  let s = `<g transform="translate(${f2(cx)} ${f2(cy)}) rotate(${f2(rot)}) scale(${f2(k)}) translate(-300 -440)" opacity="${f2(op)}">${img}`;
  if (o.wet) s += `<ellipse cx="330" cy="420" rx="120" ry="160" fill="#fff" opacity="${f2(0.16 * o.wet)}" transform="rotate(-20 330 420)"/>`;
  return s + '</g>';
}
