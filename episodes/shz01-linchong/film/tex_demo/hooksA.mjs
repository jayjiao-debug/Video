// Route A of the background test: procedural detail pushed hard + set dressing + ambient occlusion and cast shadows.
// Builds on tex_demo/hooks.mjs (the subtle pass) and adds props and architecture so the frames are not empty.
//   node render.mjs stills <out> <times> --clean --hooks=tex_demo/hooksA.mjs
// Coordinates are each bake's own (same as the take code). Characters are untouched (they are not baked).
import './hooks.mjs';
import { BAKE_HOOKS, f2, rng, rg, lg } from '../lib.mjs';
import { tex, woodGrain, stains, cracks, edgeWear, straw, dirt } from '../tex.mjs';

const base = { ...BAKE_HOOKS };
const LN = '#2A1C17';
let N = 0;
const id = (p) => `A${p}${N++}`;
const blurDef = (i, sd) => `<filter id="${i}" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="${sd}"/></filter>`;
/** soft ambient-occlusion / cast-shadow blob (multiply) */
const ao = (shape, sd = 18, op = 0.5, col = '#0E0906') => { const i = id('ao'); return `<defs>${blurDef(i, sd)}</defs><g filter="url(#${i})" style="mix-blend-mode:multiply" opacity="${f2(op)}">${shape.replace(/FILL/g, col)}</g>`; };
const insertBefore = (s, marker, add) => { const k = s.lastIndexOf(marker); return k < 0 ? s + add : s.slice(0, k) + add + s.slice(k); };

// ---------------------------------------------------------------- props
function jar(x, y, r, o = {}) { // clay wine jar, base centre (x, y), body radius r; red cloth cap tied with string
  const body = o.body || '#5A2E1E', hi = o.hi || '#8A4A2C';
  return ao(`<ellipse cx="${f2(x + r * 0.35)}" cy="${f2(y - r * 0.7)}" rx="${f2(r * 1.05)}" ry="${f2(r * 1.1)}" fill="FILL"/>`, r * 0.25, 0.45) +
    `<path d="M${f2(x - r * 0.55)},${f2(y)} C${f2(x - r * 1.15)},${f2(y - r * 0.4)} ${f2(x - r * 1.1)},${f2(y - r * 1.5)} ${f2(x - r * 0.45)},${f2(y - r * 1.75)} L${f2(x + r * 0.45)},${f2(y - r * 1.75)} C${f2(x + r * 1.1)},${f2(y - r * 1.5)} ${f2(x + r * 1.15)},${f2(y - r * 0.4)} ${f2(x + r * 0.55)},${f2(y)}Z" fill="${body}" stroke="${LN}" stroke-width="${f2(r * 0.05)}"/>` +
    `<path d="M${f2(x - r * 0.75)},${f2(y - r * 1.3)} C${f2(x - r * 0.95)},${f2(y - r * 0.8)} ${f2(x - r * 0.8)},${f2(y - r * 0.35)} ${f2(x - r * 0.5)},${f2(y - r * 0.15)}" stroke="${hi}" stroke-width="${f2(r * 0.14)}" fill="none" stroke-linecap="round" opacity="0.8"/>` +
    `<path d="M${f2(x - r * 0.6)},${f2(y - r * 1.72)} Q${f2(x)},${f2(y - r * 2.25)} ${f2(x + r * 0.6)},${f2(y - r * 1.72)} L${f2(x + r * 0.7)},${f2(y - r * 1.5)} L${f2(x + r * 0.35)},${f2(y - r * 1.58)} L${f2(x)},${f2(y - r * 1.45)} L${f2(x - r * 0.35)},${f2(y - r * 1.58)} L${f2(x - r * 0.7)},${f2(y - r * 1.5)}Z" fill="${o.cap || '#B8342A'}" stroke="${LN}" stroke-width="${f2(r * 0.04)}"/>` +
    `<path d="M${f2(x - r * 0.5)},${f2(y - r * 1.66)} Q${f2(x)},${f2(y - r * 1.6)} ${f2(x + r * 0.5)},${f2(y - r * 1.66)}" stroke="#E8C88A" stroke-width="${f2(r * 0.05)}" fill="none"/>` +
    `<rect x="${f2(x - r * 0.28)}" y="${f2(y - r * 1.15)}" width="${f2(r * 0.56)}" height="${f2(r * 0.56)}" transform="rotate(45 ${f2(x)} ${f2(y - r * 0.87)})" fill="#C2402F" opacity="0.85"/>`;
}
function bowls(x, y, r, n) { // a stack of n bowls, foot at (x, y)
  let s = ao(`<ellipse cx="${f2(x + r * 0.3)}" cy="${f2(y - 2)}" rx="${f2(r * 1.2)}" ry="${f2(r * 0.25)}" fill="FILL"/>`, 5, 0.5);
  for (let i = 0; i < n; i++) {
    const yy = y - i * r * 0.32;
    s += `<path d="M${f2(x - r)},${f2(yy - r * 0.55)} Q${f2(x - r * 0.9)},${f2(yy)} ${f2(x - r * 0.3)},${f2(yy)} L${f2(x + r * 0.3)},${f2(yy)} Q${f2(x + r * 0.9)},${f2(yy)} ${f2(x + r)},${f2(yy - r * 0.55)}Z" fill="${i % 2 ? '#D9D6C8' : '#E6E2D2'}" stroke="${LN}" stroke-width="2.5"/>` +
      `<path d="M${f2(x - r * 0.95)},${f2(yy - r * 0.45)} L${f2(x + r * 0.95)},${f2(yy - r * 0.45)}" stroke="#5E7A8C" stroke-width="3" opacity="0.7"/>`;
  }
  return s + `<ellipse cx="${f2(x)}" cy="${f2(y - (n - 1) * r * 0.32 - r * 0.55)}" rx="${f2(r)}" ry="${f2(r * 0.18)}" fill="#BDB8A6" stroke="${LN}" stroke-width="2.5"/>`;
}
function oilLamp(x, y, k = 1, glow = true) { // clay dish lamp on a short stand, flame, warm glow
  const i = id('lg');
  return (glow ? `<defs>${rg(i, [[0, '#FFD98A', 0.75], [0.35, '#FFB65A', 0.28], [1, '#FF9A40', 0]])}</defs><circle cx="${f2(x)}" cy="${f2(y - 70 * k)}" r="${f2(260 * k)}" fill="url(#${i})" style="mix-blend-mode:screen"/>` : '') +
    `<path d="M${f2(x - 22 * k)},${f2(y)} L${f2(x + 22 * k)},${f2(y)} L${f2(x + 9 * k)},${f2(y - 34 * k)} L${f2(x - 9 * k)},${f2(y - 34 * k)}Z" fill="#6B4A32" stroke="${LN}" stroke-width="2"/>` +
    `<path d="M${f2(x - 34 * k)},${f2(y - 40 * k)} Q${f2(x)},${f2(y - 22 * k)} ${f2(x + 34 * k)},${f2(y - 40 * k)} Z" fill="#7A5638" stroke="${LN}" stroke-width="2"/>` +
    `<path d="M${f2(x + 18 * k)},${f2(y - 42 * k)} q${f2(-10 * k)},${f2(-14 * k)} ${f2(-2 * k)},${f2(-34 * k)} q${f2(10 * k)},${f2(18 * k)} ${f2(2 * k)},${f2(34 * k)}Z" fill="#FFE29A"/>` +
    `<path d="M${f2(x + 18 * k)},${f2(y - 44 * k)} q${f2(-4 * k)},${f2(-8 * k)} ${f2(-1 * k)},${f2(-18 * k)} q${f2(5 * k)},${f2(9 * k)} ${f2(1 * k)},${f2(18 * k)}Z" fill="#FFFBEA"/>`;
}
function bracket(x, y, k = 1, col = '#3A281C') { // simple wooden corbel bracket under a beam, centred at x, top at y
  return `<path d="M${f2(x - 70 * k)},${f2(y)} L${f2(x + 70 * k)},${f2(y)} L${f2(x + 70 * k)},${f2(y + 16 * k)} Q${f2(x + 40 * k)},${f2(y + 18 * k)} ${f2(x + 30 * k)},${f2(y + 42 * k)} L${f2(x + 18 * k)},${f2(y + 42 * k)} L${f2(x + 18 * k)},${f2(y + 70 * k)} L${f2(x - 18 * k)},${f2(y + 70 * k)} L${f2(x - 18 * k)},${f2(y + 42 * k)} L${f2(x - 30 * k)},${f2(y + 42 * k)} Q${f2(x - 40 * k)},${f2(y + 18 * k)} ${f2(x - 70 * k)},${f2(y + 16 * k)}Z" fill="${col}" stroke="${LN}" stroke-width="3"/>` +
    `<rect x="${f2(x - 26 * k)}" y="${f2(y + 18 * k)}" width="${f2(52 * k)}" height="${f2(22 * k)}" fill="#4E3828" stroke="${LN}" stroke-width="2"/>`;
}
function cobweb(cx, cy, r, a0, a1, seed, col = '#C9C4BA', op = 0.5) { // radial threads from a corner + sagging arcs
  const R = rng(seed), n = 7;
  let s = `<g stroke="${col}" fill="none" opacity="${f2(op)}" stroke-linecap="round">`;
  const ang = [];
  for (let i = 0; i < n; i++) ang.push(a0 + ((a1 - a0) * i) / (n - 1) + (R() - 0.5) * 0.06);
  for (const a of ang) s += `<path d="M${f2(cx)},${f2(cy)} L${f2(cx + Math.cos(a) * r)},${f2(cy + Math.sin(a) * r)}" stroke-width="1.6"/>`;
  for (let ring = 1; ring <= 6; ring++) {
    const rr = (r * ring) / 6.4;
    let d = '';
    for (let i = 0; i < n - 1; i++) {
      const p = [cx + Math.cos(ang[i]) * rr, cy + Math.sin(ang[i]) * rr], q = [cx + Math.cos(ang[i + 1]) * rr, cy + Math.sin(ang[i + 1]) * rr];
      const m = [(p[0] + q[0]) / 2 - (cx - (p[0] + q[0]) / 2) * 0.08, (p[1] + q[1]) / 2 - (cy - (p[1] + q[1]) / 2) * 0.08 + rr * 0.04];
      d += `${i ? '' : `M${f2(p[0])},${f2(p[1])}`} Q${f2(m[0])},${f2(m[1])} ${f2(q[0])},${f2(q[1])}`;
    }
    s += `<path d="${d}" stroke-width="1.1"/>`;
  }
  // a torn strand hanging down
  s += `<path d="M${f2(cx + Math.cos(ang[3]) * r * 0.7)},${f2(cy + Math.sin(ang[3]) * r * 0.7)} q${f2(r * 0.05)},${f2(r * 0.5)} ${f2(-r * 0.04)},${f2(r * 0.9)}" stroke-width="1.3"/>`;
  return s + '</g>';
}
function candle(x, y, h, lit = false) {
  let s = ao(`<ellipse cx="${f2(x + 14)}" cy="${f2(y)}" rx="22" ry="6" fill="FILL"/>`, 4, 0.6) +
    `<path d="M${f2(x - 16)},${f2(y)} L${f2(x + 16)},${f2(y)} L${f2(x + 12)},${f2(y - 10)} L${f2(x - 12)},${f2(y - 10)}Z" fill="#5A4A3A" stroke="${LN}" stroke-width="2"/>` +
    `<rect x="${f2(x - 8)}" y="${f2(y - 10 - h)}" width="16" height="${f2(h)}" fill="#A8322A" stroke="${LN}" stroke-width="2"/>` +
    `<path d="M${f2(x - 8)},${f2(y - 10 - h + 4)} q4,10 0,${f2(h * 0.4)} M${f2(x + 6)},${f2(y - 10 - h + 3)} q3,8 1,${f2(h * 0.25)}" stroke="#D9C8A8" stroke-width="3.5" fill="none" stroke-linecap="round"/>` +
    `<path d="M${f2(x)},${f2(y - 10 - h)} l0,-8" stroke="#1A1210" stroke-width="2"/>`;
  if (lit) s += `<ellipse cx="${f2(x)}" cy="${f2(y - h - 26)}" rx="5" ry="11" fill="#FFE29A"/>`;
  return s;
}
function incensePot(x, y, r) { // bronze pot on 3 feet with an ash mound and burnt stubs
  const R = rng(Math.round(x));
  let s = ao(`<ellipse cx="${f2(x + r * 0.3)}" cy="${f2(y)}" rx="${f2(r * 1.3)}" ry="${f2(r * 0.25)}" fill="FILL"/>`, 6, 0.6);
  s += `<path d="M${f2(x - r * 0.7)},${f2(y)} l${f2(r * 0.1)},${f2(-r * 0.3)} M${f2(x + r * 0.7)},${f2(y)} l${f2(-r * 0.1)},${f2(-r * 0.3)}" stroke="#3A4236" stroke-width="${f2(r * 0.16)}" stroke-linecap="round"/>`;
  s += `<path d="M${f2(x - r)},${f2(y - r * 0.95)} C${f2(x - r * 1.05)},${f2(y - r * 0.4)} ${f2(x - r * 0.6)},${f2(y - r * 0.2)} ${f2(x)},${f2(y - r * 0.2)} C${f2(x + r * 0.6)},${f2(y - r * 0.2)} ${f2(x + r * 1.05)},${f2(y - r * 0.4)} ${f2(x + r)},${f2(y - r * 0.95)}Z" fill="#4E5A48" stroke="${LN}" stroke-width="2.5"/>`;
  s += `<path d="M${f2(x - r * 0.8)},${f2(y - r * 0.7)} q${f2(r * 0.3)},${f2(r * 0.3)} ${f2(r * 0.7)},${f2(r * 0.32)}" stroke="#86896A" stroke-width="${f2(r * 0.08)}" fill="none" opacity="0.7"/>`;
  s += `<ellipse cx="${f2(x)}" cy="${f2(y - r * 0.95)}" rx="${f2(r * 1.05)}" ry="${f2(r * 0.22)}" fill="#3A4236" stroke="${LN}" stroke-width="2.5"/>`;
  s += `<path d="M${f2(x - r * 0.85)},${f2(y - r * 0.98)} Q${f2(x)},${f2(y - r * 1.35)} ${f2(x + r * 0.85)},${f2(y - r * 0.98)}Z" fill="#9A958C"/>`;
  for (let i = 0; i < 7; i++) { const xx = x - r * 0.5 + R() * r, hh = r * (0.2 + R() * 0.5); s += `<path d="M${f2(xx)},${f2(y - r * 1.05)} l${f2((R() - 0.5) * r * 0.2)},${f2(-hh)}" stroke="${R() < 0.6 ? '#8E3B2A' : '#4A2A1E'}" stroke-width="3"/>`; }
  return s;
}
function banner(x, yTop, yFoot, w, h, seed, cols = ['#B8342A', '#E2B33C']) { // pole + long hanging 幡 with border and tails
  const R = rng(seed), sw = (R() - 0.5) * 18;
  const bx = x + 8, by = yTop + 30;
  let s = ao(`<path d="M${f2(x)},${f2(yFoot)} l${f2(h * 0.55)},${f2(h * 0.08)} l6,6 l${f2(-h * 0.55)},${f2(-h * 0.08)}Z" fill="FILL"/>`, 6, 0.4);
  s += `<rect x="${f2(x - 5)}" y="${f2(yTop)}" width="10" height="${f2(yFoot - yTop)}" fill="#5A2A1E" stroke="${LN}" stroke-width="2"/>` +
    `<circle cx="${f2(x)}" cy="${f2(yTop - 6)}" r="9" fill="#D9A23C" stroke="${LN}" stroke-width="2"/>` +
    `<rect x="${f2(x - 4)}" y="${f2(by - 6)}" width="${f2(w + 16)}" height="8" fill="#5A2A1E" stroke="${LN}" stroke-width="1.5"/>`;
  const p = (u, v) => [bx + u * w + Math.sin(v * 3 + seed) * sw * v, by + v * h];
  const edge = (u) => { let d = ''; for (let k = 0; k <= 10; k++) { const [a, b] = p(u, k / 10); d += `${k ? 'L' : 'M'}${f2(a)},${f2(b)} `; } return d; };
  const L0 = edge(0), R1 = edge(1).trim().split(' ').reverse().map((t) => t.replace('M', 'L')).join(' ');
  s += `<path d="${L0} ${R1.replace(/^L/, 'L')} Z" fill="${cols[0]}" stroke="${LN}" stroke-width="2.5"/>`;
  // inner panel + border colour
  const pin = (u, v) => p(0.18 + u * 0.64, 0.06 + v * 0.8);
  let d = ''; for (let k = 0; k <= 8; k++) { const [a, b] = pin(0, k / 8); d += `${k ? 'L' : 'M'}${f2(a)},${f2(b)} `; }
  for (let k = 8; k >= 0; k--) { const [a, b] = pin(1, k / 8); d += `L${f2(a)},${f2(b)} `; }
  s += `<path d="${d}Z" fill="${cols[1]}" opacity="0.9"/>`;
  const [cx, cy] = pin(0.5, 0.3);
  s += `<circle cx="${f2(cx)}" cy="${f2(cy)}" r="${f2(w * 0.18)}" fill="none" stroke="${cols[0]}" stroke-width="4"/>`;
  for (let k = 0; k < 3; k++) { const [a, b] = p(0.17 + k * 0.33, 1); s += `<path d="M${f2(a - w * 0.1)},${f2(b - 2)} l${f2(w * 0.1)},${f2(h * 0.12)} l${f2(w * 0.1)},${f2(-h * 0.12)}Z" fill="${cols[k % 2]}" stroke="${LN}" stroke-width="2"/>`; }
  return s;
}
function chiwen(x, y, k, flip, col = '#3A434A') { // generic curled ridge-end ornament (鸱吻-like silhouette)
  const sx = flip ? -1 : 1;
  return `<g transform="translate(${f2(x)} ${f2(y)}) scale(${f2(sx * k)} ${f2(k)})"><path d="M0,0 L-34,0 C-40,-40 -30,-80 0,-104 C26,-122 56,-110 60,-86 C40,-96 22,-90 16,-72 C34,-74 46,-60 40,-44 C30,-56 16,-54 12,-40 C24,-30 26,-12 18,0Z" fill="${col}" stroke="${LN}" stroke-width="3"/>` +
    `<path d="M-24,-10 C-26,-40 -16,-70 6,-88" stroke="#6A757D" stroke-width="5" fill="none" opacity="0.7"/></g>`;
}

// ================================================================ (a) tavern
BAKE_HOOKS.t01table = (a) => {
  const r = base.t01table(a);
  const R = rng(71);
  let s = '';
  // painted grain strokes, pushed: darker and wider, plus plank-to-plank tone shifts
  for (let i = 0; i < 9; i++) {
    const y = i * 170 - 20;
    s += `<rect x="0" y="${y}" width="2400" height="164" fill="${i % 2 ? '#1A0E08' : '#FFE0B0'}" opacity="${i % 2 ? 0.14 : 0.05}"/>`;
    s += woodGrain(0, y + 6, 2400, 152, { seed: 300 + i, spacing: 6, knots: 1 + (i % 2), dark: '#180D07' });
    s += `<rect x="0" y="${y + 158}" width="2400" height="12" fill="#0E0704" opacity="0.55"/>` + `<rect x="0" y="${y + 1}" width="2400" height="3" fill="#FFDDB0" opacity="0.18"/>`;
  }
  s += tex('wood', { rect: [0, 0, 2400, 1500] }, { op: 0.7, scale: 0.9 });
  // lattice window light falling across the table from the top left (lit cells between dark bars)
  const L = id('lat'), C = id('latc');
  let cells = '';
  for (let a = 0; a < 5; a++) for (let b = 0; b < 4; b++) {
    const u0 = a * 150, v0 = b * 170;
    cells += `<rect x="${u0 + 14}" y="${v0 + 14}" width="122" height="142"/>`;
  }
  s += `<defs><clipPath id="${C}"><ellipse cx="900" cy="560" rx="900" ry="620"/></clipPath>${blurDef(L, 6)}</defs>`;
  s += `<g clip-path="url(#${C})"><g filter="url(#${L})" transform="translate(120 -60) skewX(-28) rotate(8)" fill="#FFE6B4" style="mix-blend-mode:screen" opacity="0.42">${cells}</g></g>`;
  s += ao(`<g transform="translate(120 -60) skewX(-28) rotate(8)">${[0, 1, 2, 3, 4, 5].map((a) => `<rect x="${a * 150 - 6}" y="0" width="20" height="690" fill="FILL"/>`).join('')}${[0, 1, 2, 3, 4].map((b) => `<rect x="0" y="${b * 170 - 6}" width="760" height="20" fill="FILL"/>`).join('')}</g>`, 5, 0.35);
  // props on the empty left of the table: a wine bowl, a jug, chopsticks, spilled wine
  s += ao(`<ellipse cx="560" cy="560" rx="150" ry="120" fill="FILL"/>`, 16, 0.55);
  s += `<ellipse cx="530" cy="520" rx="130" ry="110" fill="#D8D2C0" stroke="${LN}" stroke-width="5"/><ellipse cx="530" cy="520" rx="104" ry="86" fill="#8A3A22"/><ellipse cx="505" cy="495" rx="44" ry="20" fill="#C0643A" opacity="0.7"/>` +
    `<path d="M412,492 A130,110 0 0,1 640,470" stroke="#5E7A8C" stroke-width="7" fill="none" opacity="0.6"/>`;
  s += ao(`<circle cx="430" cy="1150" r="150" fill="FILL"/>`, 18, 0.6);
  s += `<circle cx="400" cy="1120" r="140" fill="#6E4630" stroke="${LN}" stroke-width="5"/><circle cx="400" cy="1120" r="70" fill="#4A2C1C" stroke="${LN}" stroke-width="4"/><circle cx="400" cy="1120" r="44" fill="#B8342A" stroke="${LN}" stroke-width="3"/>` +
    `<path d="M300,1040 A140,140 0 0,1 470,990" stroke="#A8724E" stroke-width="16" fill="none" stroke-linecap="round" opacity="0.7"/>`;
  s += ao(`<path d="M640,860 L940,760 L946,776 L646,876Z M650,890 L955,800 L960,815 L655,905Z" fill="FILL"/>`, 4, 0.5);
  s += `<path d="M630,850 L930,750 L936,764 L636,864Z M640,880 L945,790 L950,804 L645,894Z" fill="#B88A50" stroke="${LN}" stroke-width="2.5"/>`;
  s += `<path d="M700,640 q30,-10 60,8 q20,22 -10,30 q-40,6 -50,-38Z" fill="#5A1E12" opacity="0.55"/>`;
  // crumbs of wear: dents and small chips along the plank seams
  for (let i = 0; i < 140; i++) { const x = R() * 2400, y = Math.floor(R() * 9) * 170 + 150 + R() * 8; s += `<path d="M${f2(x)},${f2(y)} l${f2(6 + R() * 14)},${f2(R() * 4)} l${f2(-4)},${f2(5)}Z" fill="#0E0704" opacity="0.5"/>`; }
  return { inner: r.inner + s, defs: r.defs };
};

BAKE_HOOKS.t01tavern = (a) => {
  const r = base.t01tavern(a);
  let inner = r.inner.replace('stdDeviation="9"', 'stdDeviation="4"');
  let s = '';
  // walls: pushed texture and painted grain
  for (let i = 0; i < 18; i++) s += woodGrain(i * 150, 0, 146, 980, { dir: 'v', seed: 500 + i, spacing: 7, knots: 1, dark: '#140B06' }) + `<rect x="${i * 150 + 144}" y="0" width="6" height="980" fill="#0E0704" opacity="0.6"/>`;
  s += tex('wood', { rect: [0, 0, 2600, 980] }, { op: 0.75, rot: 90, scale: 0.9 });
  // beam with brackets across the top of the frame, posts at the door and the left
  s += ao(`<rect x="0" y="232" width="2600" height="110" fill="FILL"/>`, 18, 0.6);
  s += `<rect x="0" y="236" width="2600" height="64" fill="#3A281C" stroke="${LN}" stroke-width="4"/>` + woodGrain(0, 240, 2600, 56, { seed: 61, spacing: 6, dark: '#120A05' });
  s += edgeWear([[0, 300], [2600, 300]], { seed: 9, lop: 0.3, every: 30 });
  for (const x of [720, 1400, 2040]) s += bracket(x, 300, 1.4);
  s += `<rect x="690" y="300" width="60" height="680" fill="#3A281C" stroke="${LN}" stroke-width="4"/>` + woodGrain(690, 300, 60, 680, { dir: 'v', seed: 62, spacing: 7 });
  // the 酒 sign: a long cloth banner hanging from the beam on its own rod
  s += ao(`<rect x="790" y="330" width="130" height="430" fill="FILL"/>`, 14, 0.55);
  s += `<rect x="760" y="318" width="160" height="12" fill="#2A1C14"/><path d="M776,330 L904,330 L900,700 L870,740 L840,712 L808,740 L780,700Z" fill="#E9DEC4" stroke="${LN}" stroke-width="4"/>` +
    `<path d="M786,342 L894,342 L892,690 L788,690Z" fill="none" stroke="#B8342A" stroke-width="6"/>` +
    `<text x="840" y="560" font-family="'Ma Shan Zheng'" font-size="150" text-anchor="middle" fill="#2A1A14">酒</text>`;
  // shelves with jars, bowls and a lamp on the left wall
  for (const y of [520, 760]) {
    s += ao(`<rect x="960" y="${y}" width="420" height="40" fill="FILL"/>`, 10, 0.6);
    s += `<rect x="950" y="${y - 18}" width="430" height="22" fill="#5A3E2A" stroke="${LN}" stroke-width="3"/>` + edgeWear([[950, y - 18], [1380, y - 18]], { seed: y, lop: 0.4, every: 26 }) +
      `<path d="M980,${y + 4} l0,40 l26,0 Z M1340,${y + 4} l0,40 l-26,0Z" fill="#4A3222" stroke="${LN}" stroke-width="2"/>`;
  }
  s += jar(1020, 502, 46) + jar(1130, 502, 52, { cap: '#9A2C24' }) + jar(1250, 502, 44, { body: '#4E3424' });
  s += bowls(1010, 742, 40, 3) + bowls(1110, 742, 40, 2) + oilLamp(1300, 742, 1.3);
  // big floor jars by the counter, lower left
  s += jar(380, 980, 90, { body: '#4A2A1C' }) + jar(560, 980, 72) + jar(470, 990, 60, { body: '#5E3A26', cap: '#8A3024' });
  // the door: indigo half curtain (门帘) with slits, frame AO
  s += ao(`<rect x="1440" y="120" width="560" height="980" fill="none" stroke="FILL" stroke-width="60"/>`, 20, 0.5);
  for (let k = 0; k < 3; k++) {
    const x0 = 1450 + k * 183;
    s += `<path d="M${x0},130 L${x0 + 178},130 L${x0 + 176},420 Q${x0 + 90},430 ${x0 + 2},420Z" fill="#2E4A7A" stroke="${LN}" stroke-width="4"/>` +
      `<path d="M${x0 + 30},140 Q${x0 + 36},300 ${x0 + 26},410 M${x0 + 120},140 Q${x0 + 128},280 ${x0 + 118},412" stroke="#1C3054" stroke-width="10" fill="none" opacity="0.6"/>` +
      `<rect x="${x0 + 20}" y="118" width="24" height="26" fill="#2E4A7A" stroke="${LN}" stroke-width="2"/><rect x="${x0 + 130}" y="118" width="24" height="26" fill="#2E4A7A" stroke="${LN}" stroke-width="2"/>`;
  }
  // corner + floor AO
  s += ao(`<rect x="0" y="940" width="2600" height="80" fill="FILL"/>`, 22, 0.7) + ao(`<rect x="0" y="0" width="120" height="1500" fill="FILL"/>`, 40, 0.5);
  return { inner: insertBefore(inner, '</g>', s), defs: r.defs };
};

// ================================================================ (b) 山神庙
BAKE_HOOKS.t10_room = (a) => {
  const r = base.t10_room(a);
  const X = (x) => x + 240, Y = (y) => y + 200, FL = 1010;
  const vig = '<rect x="0" y="0" width="2400" height="1500" fill="url(#t10vig)"/>';
  let s = '';
  s += tex('plaster', { rect: [0, 0, 2400, Y(FL)] }, { op: 0.7, scale: 1.1 }) + stains(0, 0, 2400, Y(FL), { seed: 88, n: 10, col: '#120D0A', blur: 30 });
  // AO: wall corners, under the beam, along the floor line
  s += ao(`<rect x="0" y="${Y(10)}" width="2400" height="70" fill="FILL"/>`, 26, 0.75) + ao(`<rect x="0" y="${Y(FL) - 60}" width="2400" height="90" fill="FILL"/>`, 30, 0.8);
  s += ao(`<rect x="${X(-200)}" y="0" width="220" height="1500" fill="FILL"/><rect x="${X(1560)}" y="0" width="160" height="1500" fill="FILL"/>`, 50, 0.6);
  // cracked plaster relief: cloud scrolls on a raised panel, a chunk broken off showing brick
  const rx = X(640), ry = Y(120), rw = 420, rh = 300;
  s += ao(`<rect x="${rx + 16}" y="${ry + 18}" width="${rw}" height="${rh}" rx="20" fill="FILL"/>`, 12, 0.6);
  s += `<rect x="${rx}" y="${ry}" width="${rw}" height="${rh}" rx="20" fill="#5A4E44" stroke="${LN}" stroke-width="4"/>` +
    `<rect x="${rx + 18}" y="${ry + 18}" width="${rw - 36}" height="${rh - 36}" rx="12" fill="#4E433A" stroke="#6E6258" stroke-width="3"/>`;
  for (const [cx, cy, k] of [[rx + 120, ry + 120, 1], [rx + 290, ry + 170, 0.85], [rx + 180, ry + 220, 0.7]]) {
    s += `<g transform="translate(${cx} ${cy}) scale(${k})" fill="none" stroke-linecap="round"><path d="M-80,20 C-90,-20 -50,-40 -30,-20 C-30,-60 20,-70 30,-30 C50,-50 90,-30 80,0 C100,10 90,40 60,36 L-70,36 C-90,36 -96,24 -80,20Z" fill="#62564B" stroke="${LN}" stroke-width="4"/>` +
      `<path d="M-30,-20 q10,14 26,6 M30,-30 q-4,20 14,24 M-56,10 q14,-8 26,4" stroke="#2A221C" stroke-width="4"/><path d="M-70,30 L60,30" stroke="#7A6E62" stroke-width="3"/></g>`;
  }
  s += `<path d="M${rx + 300},${ry} L${rx + rw},${ry} L${rx + rw},${ry + 140} L${rx + 380},${ry + 110} L${rx + 350},${ry + 60}Z" fill="#3A2A22" stroke="${LN}" stroke-width="3"/>`;
  for (let i = 0; i < 4; i++) s += `<rect x="${rx + 330 + (i % 2) * 40}" y="${ry + 8 + i * 28}" width="38" height="24" fill="#6A3A2C" stroke="#2A1A14" stroke-width="2" opacity="0.85"/>`;
  s += `<path d="M${rx + 300},${ry} L${rx + 260},${ry + 90} L${rx + 290},${ry + 150} L${rx + 230},${ry + 300} M${rx + 260},${ry + 90} L${rx + 180},${ry + 120}" stroke="#151010" stroke-width="4" fill="none"/>` +
    `<path d="M${rx + 302},${ry + 4} L${rx + 264},${ry + 92} L${rx + 294},${ry + 152} L${rx + 236},${ry + 298}" stroke="#8A7E72" stroke-width="2" fill="none" opacity="0.6"/>`;
  s += cracks(X(1050), Y(80), 400, 700, { seed: 5, n: 4, len: 260 }) + cracks(X(-150), Y(300), 250, 500, { seed: 6, n: 2, len: 200 });
  // the statue's cast shadow on the wall (cold door light from the right) and the altar's
  s += ao(`<g transform="translate(-110 14)"><path d="M${X(150)},${Y(572)} L${X(490)},${Y(572)} Q${X(480)},${Y(470)} ${X(440)},${Y(440)} Q${X(460)},${Y(380)} ${X(420)},${Y(300)} L${X(360)},${Y(200)} L${X(280)},${Y(200)} L${X(220)},${Y(300)} Q${X(180)},${Y(380)} ${X(200)},${Y(440)} Q${X(160)},${Y(470)} ${X(150)},${Y(572)}Z" fill="FILL"/></g>`, 26, 0.28);
  s += ao(`<rect x="${X(10)}" y="${Y(560)}" width="600" height="460" fill="FILL"/>`, 30, 0.45);
  // offering things on the altar: candles with wax runs, a bronze incense pot with ash, two offering plates
  s += candle(X(110), Y(570), 74) + candle(X(578), Y(570), 58);
  s += incensePot(X(450), Y(570), 46);
  s += `<ellipse cx="${X(180)}" cy="${Y(566)}" rx="40" ry="9" fill="#8A7E6A" stroke="${LN}" stroke-width="2"/><path d="M${X(150)},${Y(560)} q30,-26 60,0Z" fill="#6A4A2A" stroke="${LN}" stroke-width="2"/>`;
  // cobwebs: in the top-left corner under the beam and over the door frame
  s += cobweb(X(-140), Y(12), 380, 0.05, 1.5, 3, '#CFCAC0', 0.55) + cobweb(X(1560), Y(12), 300, Math.PI - 1.45, Math.PI - 0.05, 4, '#CFCAC0', 0.5) + cobweb(X(560), Y(14), 220, 0.15, 2.9, 7, '#BDB8AE', 0.4);
  // a fallen beam leaning against the wall (between the statue and the door), with a broken end
  const B = `M${X(1160)},${Y(380)} L${X(1230)},${Y(366)} L${X(1430)},${Y(1012)} L${X(1350)},${Y(1016)}Z`;
  s += ao(`<path d="${B}" transform="translate(-40 14)" fill="FILL"/>`, 14, 0.6);
  s += `<path d="${B}" fill="#3E3028" stroke="${LN}" stroke-width="4"/>` + `<path d="M${X(1160)},${Y(380)} L${X(1180)},${Y(350)} L${X(1196)},${Y(376)} L${X(1214)},${Y(340)} L${X(1230)},${Y(366)}Z" fill="#7A6250" stroke="${LN}" stroke-width="3"/>`;
  s += `<path d="M${X(1190)},${Y(420)} L${X(1380)},${Y(1000)} M${X(1210)},${Y(450)} L${X(1395)},${Y(990)}" stroke="#1A120E" stroke-width="3" opacity="0.6"/><path d="M${X(1225)},${Y(380)} L${X(1425)},${Y(1006)}" stroke="#7A6250" stroke-width="3" opacity="0.5"/>`;
  // straw heaps along the left wall base, textured
  for (const [x0, w0, h0, sd] of [[X(560), 460, 190, 11], [X(240), 380, 130, 12], [X(960), 260, 110, 13]]) {
    s += ao(`<ellipse cx="${x0 + w0 / 2}" cy="${Y(FL)}" rx="${w0 * 0.55}" ry="30" fill="FILL"/>`, 12, 0.7);
    s += `<path d="M${x0},${Y(FL)} Q${x0 + w0 * 0.2},${Y(FL) - h0 * 0.9} ${x0 + w0 * 0.5},${Y(FL) - h0} Q${x0 + w0 * 0.8},${Y(FL) - h0 * 0.9} ${x0 + w0},${Y(FL)}Z" fill="#6A5838" stroke="${LN}" stroke-width="3"/>`;
    s += straw(x0 + 10, Y(FL) - h0, w0 - 20, h0, { seed: sd, n: Math.round(w0 * 0.8) });
    s += tex('canvas', { d: `M${x0},${Y(FL)} Q${x0 + w0 * 0.2},${Y(FL) - h0 * 0.9} ${x0 + w0 * 0.5},${Y(FL) - h0} Q${x0 + w0 * 0.8},${Y(FL) - h0 * 0.9} ${x0 + w0},${Y(FL)}Z`, bbox: [x0, Y(FL) - h0, w0, h0] }, { op: 0.6, scale: 0.4 });
  }
  // snow drifting in at the door crack: a small drift, frost on the jamb, flakes fanning into the room
  const cx = X(1462), R = rng(91);
  s += `<path d="M${cx - 150},${Y(FL) + 4} Q${cx - 90},${Y(FL) - 36} ${cx - 10},${Y(FL) - 52} L${cx + 6},${Y(FL) + 4}Z" fill="#C8D4E2" stroke="#7E8EA4" stroke-width="3"/><path d="M${cx - 120},${Y(FL) - 6} Q${cx - 70},${Y(FL) - 30} ${cx - 16},${Y(FL) - 40}" stroke="#F2F6FA" stroke-width="5" fill="none"/>`;
  s += `<rect x="${cx - 8}" y="${Y(0)}" width="8" height="${FL}" fill="#AFC0D6" opacity="0.35"/>`;
  for (let i = 0; i < 70; i++) { const t = R(), x = cx - 20 - t * 360 - R() * 60, y = Y(200 + R() * 760) + t * 80; s += `<circle cx="${f2(x)}" cy="${f2(y)}" r="${f2(1.5 + R() * 3.5 * (1 - t))}" fill="#E6EEF8" opacity="${f2(0.75 - t * 0.5)}"/>`; }
  return { inner: insertBefore(r.inner, vig, s), defs: r.defs };
};

// ================================================================ (c) 岳庙 courtyard
BAKE_HOOKS.t05hall = (a) => {
  const r = base.t05hall(a);
  const X = (x) => x + 1000, Y = (y) => y + 700;
  const haze = '<rect x="0" y="0" width="4400" height="1900" fill="#EAD9B6" opacity="0.18"/>';
  let s = '';
  // AO under the eave onto the bracket band and facade, at the column feet, along the platform base
  s += ao(`<rect x="${X(300)}" y="${Y(-40)}" width="2800" height="110" fill="FILL"/>`, 20, 0.55) + ao(`<rect x="${X(260)}" y="${Y(470)}" width="2880" height="26" fill="FILL"/>`, 10, 0.5);
  for (let i = 0; i <= 9; i++) s += ao(`<ellipse cx="${X(402 + i * 300)}" cy="${Y(398)}" rx="40" ry="10" fill="FILL"/>`, 6, 0.6);
  // roof: tile-end row (瓦当) and drip tiles along both eaves, ridge ornaments, ridge band
  let te = '';
  for (let x = 420; x <= 2980; x += 30) te += `<circle cx="${X(x)}" cy="${Y(-58)}" r="10" fill="#5E6A72" stroke="${LN}" stroke-width="2"/><path d="M${X(x + 15) - 8},${Y(-56)} l8,12 l8,-12Z" fill="#46515A"/>`;
  for (let x = 720; x <= 2680; x += 30) te += `<circle cx="${X(x)}" cy="${Y(-370)}" r="9" fill="#5E6A72" stroke="${LN}" stroke-width="2"/>`;
  s += te + tex('tiles', { d: `M${X(560)},${Y(-330)} L${X(2840)},${Y(-330)} L${X(3140)},${Y(-110)} L${X(260)},${Y(-110)}Z`, bbox: [X(260), Y(-330), 2880, 220] }, { op: 0.75, scale: 0.55 });
  for (let i = 0; i < 62; i++) s += `<path d="M${X(570 + i * 37)},${Y(-326)} L${X(430 + i * 42)},${Y(-66)}" stroke="#7A858D" stroke-width="2.5" opacity="0.55"/>`;
  s += `<rect x="${X(520)}" y="${Y(-384)}" width="2360" height="16" fill="#2E363C" stroke="${LN}" stroke-width="2"/>`;
  for (let x = 560; x < 2860; x += 44) s += `<rect x="${X(x)}" y="${Y(-382)}" width="22" height="12" fill="#56616A"/>`;
  s += chiwen(X(560), Y(-372), 1.3, false) + chiwen(X(2840), Y(-372), 1.3, true) + chiwen(X(900), Y(-560), 1.0, false) + chiwen(X(2500), Y(-560), 1.0, true);
  // carved stone balustrade along the platform front, both sides of the stair opening
  const rail = (xa, xb) => {
    let g = ao(`<rect x="${X(xa)}" y="${Y(340)}" width="${xb - xa}" height="56" transform="translate(16 8)" fill="FILL"/>`, 6, 0.35);
    g += `<rect x="${X(xa)}" y="${Y(338)}" width="${xb - xa}" height="12" fill="#E2DCCE" stroke="#7E7464" stroke-width="2.5"/><rect x="${X(xa)}" y="${Y(380)}" width="${xb - xa}" height="12" fill="#D6CFC0" stroke="#7E7464" stroke-width="2.5"/>`;
    for (let x = xa; x < xb - 10; x += 110) {
      g += `<rect x="${X(x + 16)}" y="${Y(352)}" width="80" height="26" fill="#CFC8B8" stroke="#8E8474" stroke-width="2"/><path d="M${X(x + 40)},${Y(356)} q16,-6 32,0 q-6,10 0,18 q-16,6 -32,0 q6,-8 0,-18Z" fill="#9E9484"/>`;
    }
    for (let x = xa; x <= xb; x += 110) g += `<rect x="${X(x) - 8}" y="${Y(324)}" width="16" height="72" fill="#E6E0D2" stroke="#7E7464" stroke-width="2.5"/><path d="M${X(x) - 10},${Y(326)} q10,-22 20,0Z" fill="#E6E0D2" stroke="#7E7464" stroke-width="2"/>`;
    return g;
  };
  s += rail(280, 1220) + rail(2180, 3120);
  // steps: riser shadows, tread highlights, chipped worn edges, a carved centre ramp (御路) with clouds
  for (let i = 0; i < 5; i++) {
    const x = X(1250 - i * 26), y = Y(470 + i * 16), w = 900 + i * 52;
    s += `<rect x="${x}" y="${y + 11}" width="${w}" height="6" fill="#6E6454" opacity="0.6"/><rect x="${x}" y="${y}" width="${w}" height="3" fill="#F2ECE0" opacity="0.8"/>`;
    s += edgeWear([[x, y], [x + w, y]], { seed: 40 + i, lop: 0.5, every: 22 });
  }
  s += `<rect x="${X(1600)}" y="${Y(466)}" width="200" height="86" fill="#D2CABA" stroke="#7E7464" stroke-width="2.5"/><path d="M${X(1620)},${Y(520)} c20,-30 50,-10 40,10 c30,-20 60,10 40,24 c26,-4 40,20 20,30 M${X(1640)},${Y(486)} c30,-10 60,6 50,20 c20,-10 50,0 40,16" stroke="#8E8474" stroke-width="3" fill="none"/>`;
  // banners on poles beside the steps, and two on the side halls
  s += banner(X(1130), Y(-30), Y(552), 74, 360, 1) + banner(X(2250), Y(-30), Y(552), 74, 360, 2, ['#2F6B52', '#E2B33C']);
  s += banner(X(-600), Y(40), Y(470), 56, 260, 3) + banner(X(3700), Y(40), Y(470), 56, 260, 4, ['#2F6B52', '#E2B33C']);
  // pushed stone texture on platform and paving, plaster on the side walls
  s += tex('stone', { rect: [0, Y(470), 4400, 1900 - Y(470)] }, { op: 0.75, scale: 0.55 }) + tex('plaster', { rect: [X(-1000), Y(-80), 1400, 560] }, { op: 0.7 }) + tex('plaster', { rect: [X(3000), Y(-80), 1400, 560] }, { op: 0.7 });
  return { inner: insertBefore(r.inner, haze, s), defs: r.defs };
};

BAKE_HOOKS.t05roofs = (a) => {
  const r = base.t05roofs(a);
  const R = rng(5);
  let s = '';
  for (let i = 0; i < 7; i++) { // same random sequence as farRoofs(): ridge ends + tile lines on each far roof
    const cx = 300 + i * 640 + R() * 120, w = 520 + R() * 260, y = 560 + R() * 120, hgt = 120 + R() * 60;
    const top = y - hgt * 0.55;
    s += `<g opacity="0.5">${chiwen(cx - w / 2 + 40, top, 0.6, false, '#7E7C76')}${chiwen(cx + w / 2 - 40, top, 0.6, true, '#7E7C76')}`;
    for (let x = cx - w / 2 + 40; x < cx + w / 2 - 40; x += 22) s += `<path d="M${f2(x)},${f2(top)} L${f2(x + (x - cx) * 0.12)},${f2(y - 6)}" stroke="#7E7C76" stroke-width="2"/>`;
    s += '</g>';
  }
  return { inner: r.inner + s, defs: r.defs };
};

BAKE_HOOKS.t05floor = (a) => {
  const r = base.t05floor(a);
  const { w, h } = a, x0 = -800, y0 = 700, vp = [1650, -1700];
  const R = rng(77);
  let s = '';
  // slab-by-slab tone variation (reads at phone size), following the floor's own joints
  const rows = [];
  let y = y0 + 20, sp = 46;
  while (y < y0 + h) { rows.push(y); y += sp; sp *= 1.07; }
  const xAt = (xb, yy) => vp[0] + (xb - vp[0]) * ((yy - vp[1]) / (y0 + h - vp[1]));
  for (let j = 0; j < rows.length - 1; j++) {
    const ya = rows[j], yb = rows[j + 1], off = (j % 2) * 75;
    for (let i = -30; i < 30; i++) {
      const v = R();
      if (v > 0.55) continue;
      const xb0 = 1650 + i * 150 + off, xb1 = xb0 + 150;
      const p = [[xAt(xb0, ya), ya], [xAt(xb1, ya), ya], [xAt(xb1, yb), yb], [xAt(xb0, yb), yb]].map(([px, py]) => `${f2(px - x0)},${f2(py - y0)}`).join(' L');
      s += `<path d="M${p}Z" fill="${v < 0.3 ? '#6E6252' : '#F2EADA'}" opacity="${f2(0.1 + R() * 0.16)}"/>`;
    }
  }
  s += tex('stone', { rect: [0, 0, w, h] }, { op: 0.65, scale: 0.6 });
  // ash spilled round the 鼎 (world 1150, 1262) and trodden toward the hall
  const dx = 1150 - x0, dy = 1262 - y0;
  s += ao(`<ellipse cx="${dx}" cy="${dy + 4}" rx="300" ry="80" fill="FILL"/>`, 22, 0.35, '#3A3430');
  for (let i = 0; i < 160; i++) { const a2 = R() * Math.PI * 2, rr = Math.sqrt(R()) * 330; s += `<ellipse cx="${f2(dx + Math.cos(a2) * rr)}" cy="${f2(dy + Math.sin(a2) * rr * 0.3)}" rx="${f2(2 + R() * 6)}" ry="${f2(1 + R() * 2)}" fill="${R() < 0.7 ? '#8E8A84' : '#4A4440'}" opacity="0.6"/>`; }
  for (let i = 0; i < 12; i++) s += `<path d="M${f2(dx - 260 + R() * 520)},${f2(dy - 60 + R() * 120)} l${f2(8 + R() * 10)},${f2((R() - 0.5) * 6)}" stroke="#7A3A2A" stroke-width="2.5"/>`;
  return { inner: r.inner + s, defs: r.defs };
};

BAKE_HOOKS.t05ding = (a) => {
  const r = base.t05ding(a);
  const R = rng(13);
  // ash heap rising above the rim, soot up the inner wall, ash spilling over the lip
  let s = `<g transform="translate(210 380)"><path d="M-170,-262 Q-90,-300 0,-306 Q90,-300 170,-262Z" fill="#8E8A84" stroke="${LN}" stroke-width="3"/>`;
  s += `<path d="M-120,-270 Q-60,-292 0,-296 Q60,-292 120,-270" stroke="#B8B4AC" stroke-width="5" fill="none"/>`;
  for (let i = 0; i < 40; i++) s += `<circle cx="${f2(-150 + R() * 300)}" cy="${f2(-268 - R() * 28)}" r="${f2(1.5 + R() * 3)}" fill="${R() < 0.5 ? '#5A5652' : '#D2CEC6'}"/>`;
  s += `<path d="M-60,-262 q-6,30 4,60 q10,-30 6,-60Z M70,-262 q8,24 -2,44 q-10,-20 -6,-44Z" fill="#9A968E" opacity="0.8"/>`;
  s += `<path d="M-170,-238 L170,-238 L150,-200 L-150,-200Z" fill="#1A1A16" opacity="0.35"/></g>`;
  return { inner: r.inner + s, defs: r.defs };
};
