// 高衙内 (builder C). Traced from the 3/4 and front references (cast/data/gao_*.json, source px 864×1536),
// recoloured to the plum robe #7A3A5A; the near arm of the 3/4 view is code-drawn so he can fling his wide
// sleeve up over his face (S10) and lower it for the reveal (S11).
//   gaoTQ({ x, y, h, flip, raise 0..1, tilt deg, smirk 0..1, id }) — 3/4 view; source faces RIGHT (flip -> faces left).
//     (x, y) = sole point, h = top (flower cap) to sole in px. raise: 1 = sleeve over the face, 0 = arm hanging.
//   gaoFront({ x, y, h, lean deg, id }) — front view, arms open (S09 WS: blocking her path).
//   gaoBack({ x, y, h, step }) — simple back view (S12, soft in the distance).
//   GAO_FACE(o) -> screen rect of his face for the 3/4 view (for framing / data-face).
import { f2, clamp, lerp } from '../lib.mjs';
import { traced, tracedG, tracedMap, recolourPaths } from './c_util.mjs';

const PLUM = '#7A3A5A', PLUM_S = '#5E2A45', PLUM_D = '#43203A', PLUM_L = '#8E4A6C', LN = '#3A1A2A';
export const GAO_COL = { robe: PLUM, shade: PLUM_S };
// trace palette -> plum family
function recol(c, [h, s, l]) {
  if (c === '#a05682' || c === '#a05582') return PLUM;
  if ((h > 290 || h < 20) && s > 0.18 && l < 0.6 && l > 0.15) {
    if (l > 0.38) return PLUM_L; if (l > 0.3) return PLUM_S; return PLUM_D;
  }
  return null;
}

// face region in source px (3/4 view): x 310–418, y 222–340
const FACE_SRC = [306, 214, 420, 342];

function sleeveRaised() {
  // in source px, facing right: the near arm comes up from the shoulder (262,430); the forearm crosses in front of
  // his face at eye level and the wide sleeve hangs below it like a curtain. The flower cap and the ear stay clear.
  let s = '';
  // upper arm (shoulder → elbow in front of the cheek, below the ear)
  s += `<path d="M232,420 C250,380 288,340 326,318 L352,344 C326,370 300,410 290,452 C270,456 244,446 232,420Z" fill="${PLUM}" stroke="${LN}" stroke-width="3" stroke-linejoin="round"/>`;
  // forearm + sleeve fabric over it (top edge just under the cap brim) and the hanging curtain
  s += `<path d="M322,300 C360,262 420,228 470,214 C486,212 496,222 492,236 C494,280 488,350 470,420 C436,440 380,446 336,432 C330,390 330,344 322,300Z" fill="${PLUM}" stroke="${LN}" stroke-width="3" stroke-linejoin="round"/>`;
  s += `<path d="M470,214 C486,212 496,222 492,236 C482,240 470,238 462,230Z" fill="${PLUM_D}"/>`;
  s += `<path d="M360,300 C364,350 366,396 360,436 M410,272 C418,330 420,388 414,442 M456,252 C464,310 464,370 456,428" fill="none" stroke="${PLUM_S}" stroke-width="6" stroke-linecap="round"/>`;
  s += `<path d="M322,300 C360,262 420,228 470,214" fill="none" stroke="${PLUM_L}" stroke-width="6" stroke-linecap="round" opacity="0.7"/>`;
  return s;
}

export function gaoTQ(o = {}) {
  const raise = clamp(o.raise ?? 0), id = o.id || 'gao';
  const name = 'gao_tq';
  const D = traced(name), Dn = traced('gao_tq_noarm');
  const k = (o.h || 600) / (D.sole - D.top), sx = o.flip ? -k : k, cx = D.cx;
  const pal = recolourPaths(D.paths, recol), paln = recolourPaths(Dn.paths, recol);
  const draw = (P) => P.map(([c, d]) => `<path d="${d}" fill="${c}"/>`).join('');
  const neck = [360, 346], tilt = o.tilt || 0;
  const defs = `<clipPath id="${id}hd"><path d="M100,60 L600,60 L600,346 L400,348 L330,352 L250,380 L180,440 L100,440Z"/></clipPath>` +
    `<clipPath id="${id}bd"><path d="M-100,338 L330,340 L400,338 L600,336 L1000,336 L1000,1700 L-100,1700Z M100,60 L180,440 L250,380 L100,380Z" clip-rule="evenodd"/></clipPath>`;
  // arm state: raise 1 -> code sleeve up; 0 -> traced hanging arm. In between, the code sleeve swings down.
  const useTraceArm = raise < 0.15;
  const P = useTraceArm ? pal : paln;
  let inner = `<defs>${defs}</defs>`;
  // split head/body only when the head tilts (the clip seam shows as a hairline otherwise)
  if (tilt) {
    inner += `<g clip-path="url(#${id}bd)">${draw(P)}</g>`;
    inner += `<g clip-path="url(#${id}hd)" transform="rotate(${f2(tilt)} ${neck[0]} ${neck[1]})">${draw(P)}`;
  } else inner += `<g>${draw(P)}`;
  if (o.smirk) {
    // a lifted near mouth corner (source px), the "you dare?" smirk
    const a = clamp(o.smirk);
    inner += `<path d="M366,318 C376,320 386,318 394,${f2(312 - 5 * a)}" fill="none" stroke="#5a2a20" stroke-width="2.6" stroke-linecap="round" opacity="${f2(0.85 * a)}"/>`;
    inner += `<path d="M338,262 C350,258 362,258 372,262 M392,262 C402,258 410,258 416,262" fill="none" stroke="#1a1210" stroke-width="3" stroke-linecap="round" opacity="${f2(0.6 * a)}"/>`;
  }
  inner += '</g>';
  if (!useTraceArm) {
    const ang = (1 - clamp((raise - 0.15) / 0.85)) * 125; // swing the sleeve down and forward
    inner += `<g transform="rotate(${f2(ang)} 262 430)">${sleeveRaised()}</g>`;
  }
  // data-face only when the face is visible (sleeve lowered)
  if (raise < 0.5) inner += `<rect data-face="1" x="${FACE_SRC[0]}" y="${FACE_SRC[1]}" width="${FACE_SRC[2] - FACE_SRC[0]}" height="${FACE_SRC[3] - FACE_SRC[1]}" fill="none"/>`;
  return `<g data-char="gao" transform="translate(${f2(o.x || 0)} ${f2(o.y || 0)}) scale(${f2(sx * 10000) / 10000} ${f2(k * 10000) / 10000}) translate(${f2(-cx)} ${f2(-D.sole)})">${inner}</g>`;
}
/** Screen point of a source point for gaoTQ placement. */
export function gaoPt(o, p) { return tracedMap('gao_tq', o)(p); }
export const GAO_FACE_SRC = FACE_SRC;

export function gaoFront(o = {}) {
  const D = traced('gao_front');
  const extra = `<rect data-face="1" x="330" y="215" width="130" height="125" fill="none"/>`;
  return `<g data-char="gao">${tracedG('gao_front', { ...o, recol, rot: o.lean || 0, rotAt: [D.cx, D.sole], extra })}</g>`;
}

export function gaoBack(o = {}) {
  // back view, simple: plum robe, black cap with the flower, wide sleeves; h = cap top to sole
  const h = o.h || 400, k = h / 100, st = o.step || 0;
  const s = `<g transform="translate(${f2(o.x || 0)} ${f2(o.y || 0)}) scale(${f2(k)})">` +
    `<path d="M-14,${-2 + st} L-9,-18 L-3,-18 L-6,${-1 - st}Z M6,${-1 - st} L4,-18 L10,-18 L13,${-2 + st}Z" fill="#1d1a19"/>` +
    `<path d="M-16,-16 C-17,-40 -15,-62 -12,-74 C-8,-80 8,-80 12,-74 C15,-62 17,-40 16,-16 C8,-12 -8,-12 -16,-16Z" fill="${PLUM}"/>` +
    `<path d="M-12,-74 C-22,-66 -26,-50 -24,-36 C-20,-34 -15,-36 -13,-40Z M12,-74 C22,-66 26,-50 24,-36 C20,-34 15,-36 13,-40Z" fill="${PLUM_S}"/>` +
    `<path d="M-4,-72 L-4,-18 M4,-72 L4,-18" stroke="${PLUM_S}" stroke-width="1.2"/>` +
    `<ellipse cx="0" cy="-84" rx="7.5" ry="8.5" fill="#1d1a19"/><path d="M-6,-90 C-6,-100 6,-100 6,-90Z" fill="#1d1a19"/>` +
    `<path d="M-3,-82 C-8,-72 -10,-62 -9,-54 L-6,-54 C-6,-62 -3,-72 0,-80Z" fill="#1d1a19"/>` +
    `<circle cx="7" cy="-94" r="3.6" fill="#E88AA8"/><circle cx="7" cy="-94" r="1.4" fill="#f6d0dc"/>` +
    `</g>`;
  return `<g data-char="gao-back">${s}</g>`;
}
