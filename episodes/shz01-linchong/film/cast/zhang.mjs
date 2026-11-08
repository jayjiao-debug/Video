// 张教头 (林冲's father-in-law): code-drawn bust, 3/4 front facing screen-left, flat cel style to match the 林冲 rig
// (brown line #2A1C17, two-tone cel shading). 1.66 m, grey hair and long grey beard, crow's feet. Used in T08 S19.
//
//   zhang({ x, y, H, e }) -> SVG <g>. (x, y) = chin point on screen; H = head height in px (skull top to chin).
//   e: { brow 0..1 (inner ends raised = kind), eye 0..1 (lid opening; 0 = closed), smile 0..1, nod 0..1 (head dips),
//        look [x, y] iris offset -1..1 }
//   ZH.anchor(name, {x, y, H}) -> screen point: 'shoulderR' (his right shoulder, screen-left), 'chest', 'eyes'.
// Local design space: H = 300 units, skull top y 100, chin y 400, chin x 236.
import { f2, clamp, lerp } from '../lib.mjs';

const LN = '#2A1C17';
const C = {
  skin: '#E2AC85', skinS: '#C58A66', skinD: '#A9714F', lip: '#B9715C',
  hair: '#BDB8B0', hairS: '#8E8981', hairL: '#E4E0D8',
  cloth: '#3A302C', clothS: '#251E1B',
  robe: '#6B5240', robeS: '#54402F', robeD: '#3F3023', collar: '#E8E0D0', collarS: '#C8BFAE',
  iris: '#3A2418', white: '#F7F2E8',
};
const S = (w = 2.2) => `stroke="${LN}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"`;
const P = (pts) => pts.map((p) => `${f2(p[0])},${f2(p[1])}`).join(' ');

export const ZH = {
  local: { shoulderR: [92, 492], chest: [250, 620], eyes: [255, 264] },
  anchor(name, o) {
    const k = o.H / 300, p = ZH.local[name];
    return [o.x + (p[0] - 236) * k, o.y + (p[1] - 400) * k];
  },
};

function eye(cx, cy, w, open, look, far) {
  // almond with a heavy upper lid line, the rig's language; open 0..1
  const h = w * 0.36 * open, hw = w / 2;
  const up = `M${f2(cx - hw)},${f2(cy)} C${f2(cx - hw * 0.5)},${f2(cy - h * 1.15)} ${f2(cx + hw * 0.45)},${f2(cy - h * 1.2)} ${f2(cx + hw)},${f2(cy - h * 0.15)}`;
  const lo = `C${f2(cx + hw * 0.5)},${f2(cy + h * 0.55)} ${f2(cx - hw * 0.4)},${f2(cy + h * 0.6)} ${f2(cx - hw)},${f2(cy)}Z`;
  let s = '';
  if (open > 0.08) {
    const id = 'zhe' + Math.round(cx * 7 + cy);
    s += `<clipPath id="${id}"><path d="${up} ${lo}"/></clipPath>`;
    s += `<path d="${up} ${lo}" fill="${C.white}"/>`;
    const ir = w * 0.22, ix = cx + look[0] * hw * 0.35 - (far ? w * 0.06 : 0), iy = cy - h * 0.15 + look[1] * h * 0.3;
    s += `<g clip-path="url(#${id})"><circle cx="${f2(ix)}" cy="${f2(iy)}" r="${f2(ir)}" fill="${C.iris}"/><circle cx="${f2(ix + ir * 0.3)}" cy="${f2(iy - ir * 0.35)}" r="${f2(ir * 0.28)}" fill="#fff" opacity="0.9"/>` +
      `<path d="${up} L${f2(cx + hw)},${f2(cy - h * 2)} L${f2(cx - hw)},${f2(cy - h * 2)}Z" fill="${C.skinS}" opacity="0.35"/></g>`;
  }
  // upper lid line (thick), lower lid (thin, a smiling curve)
  s += `<path d="${up}" fill="none" ${S(far ? 3 : 3.6)}/>`;
  s += `<path d="M${f2(cx - hw * 0.7)},${f2(cy + h * 0.45 + 1.5)} C${f2(cx - hw * 0.2)},${f2(cy + h * 0.75 + 3)} ${f2(cx + hw * 0.4)},${f2(cy + h * 0.6 + 3)} ${f2(cx + hw * 0.85)},${f2(cy + 1)}" fill="none" stroke="${LN}" stroke-width="1.3" stroke-linecap="round" opacity="0.6"/>`;
  return s;
}

export function zhang(o = {}) {
  const e = { brow: 0.3, eye: 0.85, smile: 0.15, nod: 0, look: [-0.5, 0.1], ...(o.e || {}) };
  const k = (o.H || 250) / 300;
  const nod = clamp(e.nod);
  let s = '';
  // ---------------- body (robe), runs well below the frame
  s += `<path d="M-40,1300 C-40,900 -10,610 60,520 C90,490 150,478 200,470 L236,462 L300,468 C360,474 430,488 470,520 C540,580 570,800 580,1300Z" fill="${C.robe}" ${S(2.4)}/>`;
  // cel shadow on the far (screen-right) side and under the beard
  s += `<path d="M470,520 C540,580 570,800 580,1300 L470,1300 C470,960 450,700 410,560Z" fill="${C.robeS}"/>`;
  s += `<path d="M120,600 C160,640 200,700 210,800" fill="none" stroke="${C.robeD}" stroke-width="3" opacity="0.6"/>`;
  s += `<path d="M420,620 C440,700 450,800 452,900" fill="none" stroke="${C.robeD}" stroke-width="3" opacity="0.5"/>`;
  // crossed collar (交领): white inner band, brown outer band
  s += `<path d="M262,452 C290,446 330,448 356,456 L360,476 C330,468 292,466 262,472Z" fill="${C.collar}" ${S(2.2)}/>`;
  s += `<path d="M168,474 L262,640 L300,600 L232,468Z" fill="${C.collar}" ${S(2.4)}/>`;
  s += `<path d="M300,470 L250,560 L262,640 L330,520Z" fill="${C.collarS}" ${S(2.4)}/>`;
  s += `<path d="M150,480 L262,680 L282,650 L178,474Z" fill="${C.robeD}" ${S(2.4)}/>`;
  // ---------------- head (nods: rotate about the neck pivot and dip)
  const hp = [300, 420];
  s += `<g transform="translate(${f2(-6 * nod)} ${f2(10 * nod)}) rotate(${f2(-7 * nod)} ${hp[0]} ${hp[1]})">`;
  // neck (mostly hidden by the beard)
  s += `<path d="M280,380 L276,470 L346,470 L352,360Z" fill="${C.skinD}"/>`;
  // head shape: cranium + face contour (front edge on screen-left)
  const head = 'M182,178 C200,120 260,92 318,96 C380,100 432,140 440,200 C446,250 430,300 410,336 C398,362 372,384 340,396 C310,408 270,410 244,402 C214,392 196,370 188,346 C180,320 176,300 178,284 C172,272 170,262 174,250 C168,234 170,206 182,178Z';
  s += `<path d="${head}" fill="${C.skin}" ${S(2.3)}/>`;
  // cel shadow: the far side (screen-right) of the face
  s += `<clipPath id="zhfc"><path d="${head}"/></clipPath><g clip-path="url(#zhfc)">` +
    `<path d="M352,150 C372,220 370,300 352,350 C340,380 322,400 300,410 L460,420 L460,140Z" fill="${C.skinS}"/>` +
    `<path d="M196,300 C214,318 236,322 252,318" fill="none" stroke="${C.skinS}" stroke-width="6" opacity="0.6"/></g>`;
  // ear (3/4: at the back of the face) and a short grey sideburn in front of it
  s += `<path d="M386,250 C404,232 428,242 428,270 C428,298 416,322 394,330 C384,312 380,272 386,250Z" fill="${C.skin}" ${S(1.9)}/>`;
  s += `<path d="M396,264 C408,260 414,274 406,294 C400,304 394,298 398,288" fill="none" stroke="${C.skinD}" stroke-width="2.2" stroke-linecap="round"/>`;
  s += `<path d="M364,200 C376,206 384,220 384,242 C384,260 380,276 376,290 C370,272 366,250 362,232 C360,220 360,208 364,200Z" fill="${C.hair}" ${S(1.8)}/>`;
  // head cloth (soft dark wrap) with a knot at the back-top
  s += `<path d="M174,206 C178,150 230,96 304,90 C372,86 432,124 446,190 C448,206 444,218 436,222 C420,190 392,170 356,166 C300,160 236,170 196,196 C188,202 180,206 174,206Z" fill="${C.cloth}" ${S(2.2)}/>`;
  s += `<path d="M330,96 C352,64 404,62 414,92 C420,112 400,126 376,124 C356,122 336,112 330,96Z" fill="${C.cloth}" ${S(2.2)}/>`;
  s += `<path d="M360,170 C392,174 420,192 436,222 C438,206 436,196 430,186 C404,170 380,166 360,170Z" fill="${C.clothS}"/>`;
  s += `<path d="M206,190 C252,172 304,166 350,170" fill="none" stroke="${C.clothS}" stroke-width="3"/>`;
  // grey hairline under the cloth edge
  s += `<path d="M190,200 C230,180 300,170 356,172 C368,174 380,180 388,188 C340,182 280,186 236,200 C214,206 198,210 190,200Z" fill="${C.hair}"/>`;
  // brows: grey, inner ends raised (kind)
  const br = clamp(e.brow);
  s += `<path d="M184,${f2(236 - 8 * br)} C196,${f2(228 - 6 * br)} 212,228 226,236" fill="none" stroke="${C.hairS}" stroke-width="7" stroke-linecap="round"/>`;
  s += `<path d="M262,${f2(236 - 10 * br)} C286,${f2(224 - 6 * br)} 316,222 340,236" fill="none" stroke="${C.hairS}" stroke-width="8" stroke-linecap="round"/>`;
  s += `<path d="M262,${f2(236 - 10 * br)} C286,${f2(224 - 6 * br)} 316,222 340,236" fill="none" stroke="${C.hairL}" stroke-width="2.5" stroke-linecap="round" opacity="0.6"/>`;
  // eyes (far = screen-left, narrower)
  const op = clamp(e.eye);
  s += eye(208, 266, 34, op, e.look, true);
  s += eye(298, 268, 54, op, e.look, false);
  // crow's feet at the near eye's outer corner + under-eye age line
  s += `<path d="M330,262 l18,-8 M332,270 l20,0 M330,278 l17,8" stroke="${C.skinD}" stroke-width="2" stroke-linecap="round" opacity="0.8"/>`;
  s += `<path d="M276,290 C292,298 312,298 326,288" fill="none" stroke="${C.skinD}" stroke-width="1.8" opacity="0.6"/>`;
  s += `<path d="M196,286 C204,292 214,292 222,288" fill="none" stroke="${C.skinD}" stroke-width="1.6" opacity="0.5"/>`;
  // forehead lines
  s += `<path d="M214,212 C240,206 280,204 314,210 M222,222 C250,217 278,216 304,220" fill="none" stroke="${C.skinD}" stroke-width="1.6" opacity="0.45"/>`;
  // nose (3/4: bridge line on the near side of the far eye, tip and nostril)
  s += `<path d="M238,282 C234,296 226,308 218,316 C222,322 230,323 236,320" fill="none" stroke="${LN}" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/>`;
  s += `<path d="M242,319 C246,321 249,320 250,317" fill="none" stroke="${C.skinD}" stroke-width="1.6" stroke-linecap="round"/>`;
  // nasolabial fold
  s += `<path d="M256,318 C266,330 270,344 268,356" fill="none" stroke="${C.skinD}" stroke-width="2" opacity="0.55"/>`;
  // mouth (small, kind smile) under the moustache
  const sm = clamp(e.smile);
  s += `<path d="M218,${f2(356 - 2 * sm)} C232,${f2(362 + 4 * sm)} 252,${f2(362 + 4 * sm)} 266,${f2(354 - 4 * sm)}" fill="none" stroke="${C.lip}" stroke-width="3" stroke-linecap="round"/>`;
  // long grey beard (behind the moustache), flowing to the chest, pointed
  const beard = 'M190,336 C188,372 204,404 226,426 C226,476 238,534 262,604 C280,560 304,500 314,446 C346,420 368,384 378,334 C380,312 380,298 376,288 C368,320 350,356 322,374 C300,388 276,390 256,384 C232,376 210,360 190,336Z';
  s += `<path d="${beard}" fill="${C.hair}" ${S(1.9)}/>`;
  s += `<path d="M240,420 C246,480 254,530 262,590 M262,404 C268,460 270,520 268,580 M284,402 C288,450 288,500 280,560 M304,440 C300,480 292,520 282,556 M350,350 C340,380 326,404 312,430 M206,372 C214,392 222,404 232,414" fill="none" stroke="${C.hairS}" stroke-width="2" stroke-linecap="round" opacity="0.8"/>`;
  s += `<path d="M300,404 C320,440 318,470 300,500" fill="none" stroke="${C.hairS}" stroke-width="5" opacity="0.35"/>`;
  // moustache: drooping grey, from under the nose
  s += `<path d="M212,336 C226,332 240,334 250,339 C264,334 282,336 296,346 C302,356 300,368 294,378 C288,364 278,354 264,351 C258,350 254,350 250,347 C240,349 228,352 220,360 C212,368 206,378 204,386 C198,370 202,346 212,336Z" fill="#CFCAC2" ${S(1.7)}/>`;
  s += `<path d="M220,346 C214,358 210,368 208,378 M282,350 C290,360 292,368 292,376" fill="none" stroke="${C.hairS}" stroke-width="1.6" opacity="0.8"/>`;
  s += '</g>';
  // face box for the frame checker (local units)
  s += `<rect data-face="1" x="168" y="186" width="${f2(270)}" height="${f2(230)}" fill="none"/>`;
  return `<g data-cast="zhang" transform="translate(${f2(o.x)} ${f2(o.y)}) scale(${f2(k * 1000) / 1000}) translate(-236 -400)">${s}</g>`;
}
