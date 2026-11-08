// 林冲 in a 国风漫画 (Chinese manhua) style, hand-built paths (not the old geometric rig).
// Front close-up and a true profile, both 600x800, with small parametric expressions:
//   brow: -1 knit/lowered .. +1 inner raised (grief); eye: lid opening 0.6..1.2; look: [x,y]
//   mouth: -1 down .. +1 up; open: 0..1; tear: 0/1
const f = (n) => (Math.round(n * 10) / 10).toString();
const pt = (p) => `${f(p[0])},${f(p[1])}`;
export const NE = { brow: 0, eye: 1, look: [0, 0], mouth: 0, open: 0, tear: 0, jaw: 0 };
export const EX = {
  平静: { ...NE, brow: -0.15 },
  隐忍: { ...NE, brow: -0.7, eye: 0.82, look: [0.1, 0.45], mouth: -0.35, jaw: 1 },
  怒: { ...NE, brow: -1, eye: 1.12, look: [0, -0.1], mouth: -0.5, open: 0.55 },
  悲: { ...NE, brow: 0.9, eye: 0.72, look: [-0.15, 0.55], mouth: -0.55, tear: 1 },
};
export const COL = {
  line: '#2a1c17', skin: '#f3d3b8', skinS: '#dfa98a', skinS2: '#c98a6c', blush: '#ee9a86',
  hair: '#1c1a20', hairHi: '#3e3a48', hat: '#ddd6ca', hatS: '#b3aa9c', hatIn: '#8f8577', snow: '#ffffff',
  coat: '#2b3346', coatS: '#1c2231', shirt: '#f2efe8', shirtS: '#cfcbc2', scarf: '#3b3a41', scarfS: '#26252b',
  cloak: '#8d6b4f', cloakS: '#6b4f39', red: '#c4372f', redS: '#8f2520', iris: '#5b3826', irisD: '#2a160c', white: '#fbf7f1',
};
const MX = (p) => [600 - p[0], p[1]];
// short beard hairs along a jaw line (燕颔虎须), drawn as strands instead of a solid band
function stubble(line, col, dens = 1) {
  let s = 7, out = '';
  const r = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  for (let i = 0; i < line.length - 1; i++) {
    const a = line[i], b = line[i + 1];
    const n = Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]) / 4 * dens);
    for (let j = 0; j < n; j++) {
      const t = j / n, x = a[0] + (b[0] - a[0]) * t, y = a[1] + (b[1] - a[1]) * t;
      const len = 8 + r() * 9, ang = Math.PI / 2 + (x - 300) / 600 + (r() - 0.5) * 0.5;
      out += `M${f(x + (r() - 0.5) * 5)},${f(y - 4 + r() * 4)} l${f(Math.cos(ang) * len)},${f(Math.sin(ang) * len)} `;
    }
  }
  return `<path d="${out}" stroke="${col}" stroke-width="2.2" stroke-linecap="round" opacity="0.85"/>`;
}
const mirrorD = (d) => d.replace(/(-?\d+(\.\d+)?),(-?\d+(\.\d+)?)/g, (_, x, __, y) => `${f(600 - parseFloat(x))},${y}`);

// ------------------------------------------------------------------ front
export function front(E = NE, o = {}) {
  const C = { ...COL, ...(o.col || {}) };
  const L = (w = 3.4) => `stroke="${C.line}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"`;
  let d = '', defs = '';
  const add = (s) => (d += s + '\n');
  const id = 'm' + Math.random().toString(36).slice(2, 8);

  // --- neck first (behind the clothes): ≥0.6 face width, flaring into the shoulders; no bottom edge
  const neckD = 'M240,540 C244,574 236,612 210,652 L390,652 C364,612 356,574 360,540Z';
  add(`<path d="${neckD}" fill="${C.skin}"/><path d="M240,540 C244,574 236,612 210,652 M360,540 C356,574 364,612 390,652" fill="none" ${L()}/>`);
  add(`<path d="M240,548 C280,590 320,590 360,548 L362,598 C320,616 280,616 238,598Z" fill="${C.skinS}"/>`);
  // --- body: cloak over the shoulders, coat, white collar (runs to y 1160 so busts always reach the frame edge)
  if (!o.headOnly) {
    add(`<path d="M-90,1160 C-90,880 -40,742 70,702 C140,678 190,654 212,652 L300,672 L388,652 C410,654 460,678 530,702 C640,742 690,880 690,1160Z" fill="${C.cloak}" ${L()}/>`);
    add(`<path d="M530,702 C640,742 690,880 690,1160 L590,1160 C590,950 570,810 500,740Z" fill="${C.cloakS}"/>`);
    add(`<path d="M80,1160 C92,940 150,780 214,682 L300,714 L386,682 C450,780 508,940 520,1160Z" fill="${C.coat}" ${L()}/>`);
    add(`<path d="M300,714 L386,682 C450,780 508,940 520,1160 L430,1160 C420,970 380,830 320,740Z" fill="${C.coatS}" opacity="0.6"/>`);
    add(`<path d="M220,654 L300,772 L380,654 L398,674 L300,822 L202,674Z" fill="${C.shirt}" ${L(2.6)}/>`);
    add(`<path d="M300,772 L380,654 L398,674 L300,822Z" fill="${C.shirtS}"/>`);
  }
  // wrapped scarf around the neck base
  const scarfF = 'M206,596 C230,572 268,582 300,588 C332,582 370,572 394,596 C414,628 402,668 368,680 C332,672 314,694 300,706 C286,694 268,672 232,680 C198,668 186,628 206,596Z';
  if (!o.noScarf) add(`<path d="${scarfF}" fill="${C.scarf}" ${L()}/>`);
  if (!o.noScarf) add(`<path d="M224,632 C256,644 282,650 300,666 M300,666 C318,650 344,644 376,632 M216,604 C250,612 280,616 300,622 C320,616 350,612 384,604" fill="none" stroke="${C.scarfS}" stroke-width="5" stroke-linecap="round"/>`);
  if (o.cangue) {
    // 七斤半团头铁叶护身枷: a long board with rounded ends, iron straps, a paper seal (第八回)
    add(`<path d="M-30,612 L630,612 C668,612 680,660 650,676 L-50,676 C-80,660 -68,612 -30,612Z" fill="#9a7048" ${L()}/>`);
    add(`<path d="M-50,676 L650,676 C660,694 650,712 630,714 L-30,714 C-50,712 -60,694 -50,676Z" fill="#6f4d2e" ${L()}/>`);
    add(`<path d="M70,614 L96,614 L92,714 L66,714Z M504,614 L530,614 L534,714 L508,714Z" fill="#4a4a50" ${L(2)}/><path d="M-20,632 L620,632" stroke="#4a4a50" stroke-width="6" opacity="0.6"/>`);
    add(`<path d="M392,620 L446,620 L448,670 L394,670Z" fill="#efe9dc" ${L(2)}/><rect x="404" y="630" width="30" height="30" fill="none" stroke="${C.red}" stroke-width="3"/>`);
  }
  // --- hair behind (side locks fall in front later)
  // hat cords run behind the face and tie under the chin
  if (o.hat !== false) add(`<path d="M214,248 C200,330 196,420 222,500 C246,556 276,584 300,594 C324,584 354,556 378,500 C404,420 400,330 386,248" fill="none" stroke="${C.red}" stroke-width="4.5" stroke-linecap="round"/><path d="M300,594 l-10,22 M300,594 l12,20" stroke="${C.red}" stroke-width="4" stroke-linecap="round"/>`);
  // --- ears
  const ear = `M204,366 C186,352 172,368 176,394 C180,420 192,436 208,432`;
  add(`<path d="${ear}" fill="${C.skin}" ${L()}/><path d="M196,378 C188,384 190,404 200,414" fill="none" ${L(2)}/>`);
  add(`<path d="${mirrorD(ear)}" fill="${C.skinS}" ${L()}/><path d="${mirrorD('M196,378 C188,384 190,404 200,414')}" fill="none" ${L(2)}/>`);
  // --- face
  const face = `M300,206 C362,206 402,246 404,322 C406,394 398,440 384,486 C366,532 334,564 300,572 C266,564 234,532 216,486 C202,440 194,394 196,322 C198,246 238,206 300,206Z`;
  add(`<path d="${face}" fill="${C.skin}"/>`);
  add(`<clipPath id="${id}fc"><path d="${face}"/></clipPath>`);
  // cel shadow (light from the left): far cheek, under cheekbone, under the hat brim
  add(`<g clip-path="url(#${id}fc)">
<path d="M352,210 C392,240 404,300 402,340 C398,400 392,450 376,500 C356,550 330,578 300,590 L420,600 L420,200Z" fill="${C.skinS}"/>
<path d="M190,200 L410,200 L410,262 C360,276 330,268 300,272 C270,268 240,276 190,262Z" fill="${C.skinS}"/>
<path d="M300,452 C310,454 318,456 322,460 C316,466 306,464 300,462Z" fill="${C.skinS}"/>
<path d="M284,508 C292,514 308,514 316,508 C312,520 288,520 284,508Z" fill="${C.skinS}"/>
</g>`);
  add(`<path d="${face}" fill="none" ${L()}/>`);
  // jaw clench
  if (E.jaw > 0.2) add(`<path d="M226,470 C230,486 236,496 242,504 M374,470 C370,486 364,496 358,504" fill="none" ${L(2)} opacity="${f(E.jaw * 0.8)}"/>`);
  // blush
  add(`<ellipse cx="240" cy="438" rx="22" ry="9" fill="${C.blush}" opacity="0.28"/><ellipse cx="360" cy="438" rx="22" ry="9" fill="${C.blush}" opacity="0.2"/>`);
  // --- jaw beard (燕颔虎须: thin line along the jaw) + goatee + moustache
  const mo = 6 * E.mouth;
  if (o.beard !== false) {
  add(stubble([[208, 436], [214, 480], [230, 520], [256, 552], [284, 568], [300, 572], [316, 568], [344, 552], [370, 520], [386, 480], [392, 436]], C.hair, 1));
  add(`<path d="M287,514 C289,540 293,572 300,610 C307,572 311,540 313,514 C306,520 294,520 287,514Z" fill="${C.hair}" ${L(2)}/>`);
  add(`<path d="M298,470 C284,470 270,478 262,${f(498 - mo * 0.5)} C274,486 286,480 298,478Z" fill="${C.hair}"/>`);
  add(`<path d="${mirrorD(`M298,470 C284,470 270,478 262,${f(498 - mo * 0.5)} C274,486 286,480 298,478Z`)}" fill="${C.hair}"/>`);
  } else if (o.thinMoustache) {
    add(`<path d="M298,472 C286,472 276,478 270,488 C280,482 290,478 298,478Z" fill="${C.hair}"/>`);
    add(`<path d="${mirrorD('M298,472 C286,472 276,478 270,488 C280,482 290,478 298,478Z')}" fill="${C.hair}"/>`);
  }
  // --- mouth
  const mY = 494, cl = [282, mY - mo], cr = [318, mY - mo];
  if (E.open > 0.05) {
    const lo = mY + 6 + 16 * E.open;
    add(`<path d="M${pt(cl)} C290,${mY - 4} 310,${mY - 4} ${pt(cr)} C314,${f(lo)} 286,${f(lo)} ${pt(cl)}Z" fill="#5a2a22" ${L(2.4)}/>`);
    add(`<path d="M${f(cl[0] + 5)},${f(cl[1] + 1)} C292,${mY + 2} 308,${mY + 2} ${f(cr[0] - 5)},${f(cr[1] + 1)} L${f(cr[0] - 7)},${f(cr[1] + 5)} C306,${mY + 6} 294,${mY + 6} ${f(cl[0] + 7)},${f(cl[1] + 5)}Z" fill="#fbf7f1"/>`);
  } else {
    add(`<path d="M${pt(cl)} C292,${f(mY + 2 + mo * 0.4)} 308,${f(mY + 2 + mo * 0.4)} ${pt(cr)}" fill="none" ${L(2.8)}/>`);
    add(`<path d="M294,505 C298,507 302,507 306,505" fill="none" stroke="${C.skinS2}" stroke-width="2.4" stroke-linecap="round"/>`);
  }
  // --- nose: one stroke on the shadow side and the nostril
  add(`<path d="M310,404 C314,420 318,436 316,452" fill="none" stroke="${C.skinS2}" stroke-width="2.6" stroke-linecap="round"/>`);
  add(`<path d="M290,458 C296,462 304,462 312,458" fill="none" ${L(2.4)}/>`);
  // --- eyes (almond, a touch round: 环眼), double-lid crease, lashes
  const eye = (s) => {
    const X = (x) => (s < 0 ? x : 600 - x);
    const cx = X(250), cy = 372;
    const op = E.eye;
    const up = (x, y) => [X(x), cy - (cy - y) * op];
    const ci = [X(283), cy + 3], co = [X(213), cy - 6];
    const u1 = up(274, 352), u2 = up(234, 346);
    const lo1 = [X(232), cy + 15], lo2 = [X(270), cy + 16];
    const shape = `M${pt(ci)} C${pt(u1)} ${pt(u2)} ${pt(co)} C${pt(lo1)} ${pt(lo2)} ${pt(ci)}Z`;
    const cid = `${id}e${s}`;
    let g = `<clipPath id="${cid}"><path d="${shape}"/></clipPath><path d="${shape}" fill="${C.white}"/>`;
    const ix = cx + (s < 0 ? 1 : -1) * 0 + E.look[0] * 9, iy = cy + 1 + E.look[1] * 6;
    g += `<g clip-path="url(#${cid})"><circle cx="${f(ix)}" cy="${f(iy)}" r="15.5" fill="${C.iris}"/><circle cx="${f(ix)}" cy="${f(iy + 2)}" r="8.5" fill="${C.irisD}"/>` +
      `<path d="${shape}" fill="none" stroke="${C.skinS2}" stroke-width="7" opacity="0.35" transform="translate(0,-4)"/></g>`;
    g += `<circle cx="${f(ix - 5)}" cy="${f(iy - 5)}" r="4" fill="#fff"/><circle cx="${f(ix + 5)}" cy="${f(iy + 5)}" r="1.8" fill="#fff" opacity="0.8"/>`;
    // upper lid line, heavy, with a lash flick at the outer corner
    g += `<path d="M${pt(ci)} C${pt(u1)} ${pt(u2)} ${pt(co)} L${pt([co[0] + (s < 0 ? -8 : 8), co[1] - 3])}" fill="none" ${L(4.6)}/>`;
    g += `<path d="M${pt([co[0] + (s < 0 ? 2 : -2), co[1] + 4])} C${pt(lo1)} ${pt([X(258), cy + 15])} ${pt([X(268), cy + 13])}" fill="none" ${L(1.6)} opacity="0.75"/>`;
    // crease
    g += `<path d="M${pt([X(270), cy - 22 * op])} C${pt([X(256), cy - 30 * op])} ${pt([X(236), cy - 28 * op])} ${pt([X(224), cy - 16 * op])}" fill="none" ${L(1.6)} opacity="0.6"/>`;
    if (E.tear) g += `<path d="M${pt([X(264), cy + 16])} C${pt([X(266), cy + 26])} ${pt([X(262), cy + 34])} ${pt([X(264), cy + 44])}" stroke="#bfe2f4" stroke-width="4" fill="none" stroke-linecap="round" opacity="0.9"/>`;
    return g;
  };
  add(eye(-1));
  add(eye(1));
  // --- brows (剑眉): long, tapering outward; knit lowers + slants the inner end
  const brow = (s) => {
    const X = (x) => (s < 0 ? x : 600 - x);
    const k = E.brow;
    const iy = 336 - 10 * k + (k < 0 ? 0 : 0), ix = X(284 - (k < 0 ? 5 * k : 0) * -1);
    const oy = 318 + (k > 0 ? 6 * k : -3 * k);
    const mid = [X(246), (iy + oy) / 2 - 7 + (k > 0 ? 4 : 0)];
    return `<path d="M${f(ix)},${f(iy - 5)} C${pt([mid[0], mid[1] - 6])} ${pt([X(230), oy - 6])} ${pt([X(206), oy])} C${pt([X(232), oy + 3])} ${pt([mid[0], mid[1] + 6])} ${f(ix)},${f(iy + 5)}Z" fill="${C.hair}" ${L(1.4)}/>` +
      (k < -0.3 ? `<path d="M${f(X(292))},${f(iy - 2)} L${f(X(294))},${f(iy + 9)}" ${L(1.6)} opacity="0.6"/>` : '');
  };
  add(brow(-1));
  add(brow(1));
  // --- side locks in front (鬓发), hairline under the hat
  const lock = 'M208,262 C200,312 196,370 204,440 C206,420 208,404 212,392 C210,360 212,320 220,290Z';
  add(`<path d="${lock}" fill="${C.hair}" ${L(1.4)}/>`);
  add(`<path d="${mirrorD(lock)}" fill="${C.hair}" ${L(1.4)}/>`);
  add(`<path d="M214,262 C250,250 280,246 300,250 C320,246 350,250 386,262 L392,236 L208,236Z" fill="${C.hair}"/>`);
  // --- hat (毡笠): wide pale felt, rounded crown, a red cord under the chin
  if (o.hat !== false) {
    add(`<path d="M20,236 C60,214 180,200 300,200 C420,200 540,214 580,236 C548,262 430,276 300,276 C170,276 52,262 20,236Z" fill="${C.hat}" ${L()}/>`);
    add(`<path d="M24,240 C70,262 180,276 300,276 C420,276 530,262 576,240 C540,252 430,262 300,262 C170,262 60,252 24,240Z" fill="${C.hatS}"/>`);
    add(`<path d="M190,230 C192,172 236,136 300,136 C364,136 408,172 410,230 C360,244 240,244 190,230Z" fill="${C.hat}" ${L()}/>`);
    add(`<path d="M352,146 C388,164 406,196 410,230 C394,236 378,238 362,240 C366,204 362,170 352,146Z" fill="${C.hatS}"/>`);
    add(`<path d="M226,176 C250,156 280,148 304,150 C330,152 300,160 270,170 C254,176 240,186 232,196Z" fill="${C.snow}"/>`);
    add(`<path d="M192,222 C240,236 360,236 408,222 L410,230 C360,244 240,244 190,230Z" fill="${C.hatIn}"/>`);
    add(`<path d="M70,228 C110,220 150,214 190,212 M440,212 C480,214 520,220 548,226" fill="none" stroke="${C.snow}" stroke-width="6" stroke-linecap="round" stroke-dasharray="30 14"/>`);
    add(`<path d="M196,226 C240,238 360,238 404,226" fill="none" stroke="${C.hatIn}" stroke-width="5" stroke-linecap="round"/>`);
  }
  if (o.tattoo) add(`<path d="M348,428 h12v12h-12z M348,434 h12 M354,428 v12 M348,448 h12 M350,453 h8 M347,458 h14 M354,446 v14 M366,428 l10,10 M376,428 l-10,10 M365,433 h12 M366,448 h11v11h-11z M368,453 h7" fill="none" stroke="#2a3a55" stroke-width="2.2" stroke-linecap="round" opacity="0.8"/>`);
  if (o.hat === false && o.headscarf === 'tokyo') {
    add(`<path d="M206,250 L150,206 L162,198 L222,232Z M394,250 L450,206 L438,198 L378,232Z" fill="#20252d" ${L(2.4)}/>`);
    add(`<path d="M194,266 C192,196 238,150 300,150 C362,150 408,196 406,266 C360,252 240,252 194,266Z" fill="#22272f" ${L()}/>`);
    add(`<path d="M232,186 C254,164 280,156 304,156" fill="none" stroke="#3c4452" stroke-width="7" stroke-linecap="round"/>`);
    add(`<path d="M196,262 C240,250 360,250 404,262" fill="none" stroke="#0f1216" stroke-width="5"/>`);
    add(`<circle cx="190" cy="282" r="12" fill="none" stroke="${C.line}" stroke-width="9"/><circle cx="190" cy="282" r="12" fill="none" stroke="#f4f1e8" stroke-width="5"/>`);
    add(`<circle cx="410" cy="282" r="12" fill="none" stroke="${C.line}" stroke-width="9"/><circle cx="410" cy="282" r="12" fill="none" stroke="#f4f1e8" stroke-width="5"/>`);
  }
  if (o.hat === false && o.headscarf === 'futou') {
    add(`<path d="M206,268 C186,330 182,420 192,500 L206,500 C200,420 204,330 218,272Z M394,268 C414,330 418,420 408,500 L394,500 C400,420 396,330 382,272Z" fill="#141519"/>`);
    add(`<path d="M196,268 C194,200 240,160 300,158 C360,160 406,200 404,268 C360,256 240,256 196,268Z" fill="#141519" ${L()}/>`);
    add(`<path d="M250,170 C266,124 334,124 350,170Z" fill="#141519" ${L()}/>`);
  }
  if (o.shade === 'half') add(`<path clip-path="url(#${id}fc)" d="M304,100 L620,100 L620,820 L304,820Z" fill="#0b0d14" opacity="0.55"/>`);
  if (o.light) add(`<rect x="0" y="0" width="600" height="800" fill="${o.light}" opacity="0.28" style="mix-blend-mode:multiply"/><rect x="0" y="0" width="600" height="800" fill="${o.light}" opacity="0.12" style="mix-blend-mode:screen"/>`);
  return { defs, body: d };
}

// ------------------------------------------------------------------ side (facing right)
export function side(E = NE, o = {}) {
  const C = { ...COL, ...(o.col || {}) };
  const L = (w = 3.4) => `stroke="${C.line}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"`;
  let d = '';
  const add = (s) => (d += s + '\n');
  const id = 'p' + Math.random().toString(36).slice(2, 8);
  // neck first: deep, tilted forward, back line from the occiput into the trapezius
  add(`<path d="M228,500 C222,526 204,578 176,620 L386,622 C366,574 352,534 344,532Z" fill="${C.skin}"/><path d="M228,500 C222,526 204,578 176,620 M344,532 C352,534 366,574 386,622" fill="none" ${L()}/>`);
  add(`<path d="M234,520 C280,556 320,556 344,540 L350,556 C300,570 260,566 226,552Z" fill="${C.skinS}"/>`);
  // body: cloak, coat, collar (to y 1160)
  add(`<path d="M-60,1160 C-60,846 0,708 120,660 C160,636 190,624 210,622 L372,624 C432,634 500,688 540,786 C570,886 580,1006 580,1160Z" fill="${C.cloak}" ${L()}/>`);
  add(`<path d="M-60,1160 C-60,846 0,708 120,660 L150,716 C80,786 40,936 40,1160Z" fill="${C.cloakS}"/>`);
  add(`<path d="M300,1160 C300,926 320,766 386,656 C446,696 486,826 500,1160Z" fill="${C.coat}" ${L()}/>`);
  add(`<path d="M356,622 L394,658 L364,806 L332,680Z" fill="${C.shirt}" ${L(2.6)}/>`);
  add(`<path d="M190,606 C236,578 330,582 388,606 C408,630 400,672 366,682 C310,690 246,686 206,668 C180,650 172,622 190,606Z" fill="${C.scarf}" ${L()}/>`);
  add(`<path d="M206,642 C250,656 320,658 380,644" fill="none" stroke="${C.scarfS}" stroke-width="5" stroke-linecap="round"/>`);
  if (o.hat !== false) add(`<path d="M268,246 C258,330 262,420 296,494 C320,528 352,540 372,532" fill="none" stroke="${C.red}" stroke-width="4.5" stroke-linecap="round"/>`);
  // head: true profile. Brow ridge, small straight nose, lips, chin, jaw to the ear
  const head = `M300,210 C344,212 368,248 374,292 C377,310 378,322 384,334 C386,342 383,350 386,360 C392,382 404,400 410,416 C412,422 406,426 398,428 C392,430 392,436 394,442 C396,448 392,452 390,456 C394,462 394,468 388,474 C392,486 390,500 380,508 C366,520 340,530 318,532 C300,534 284,528 270,520 L240,508 C196,494 148,446 136,372 C126,292 194,212 300,210Z`;
  add(`<path d="${head}" fill="${C.skin}"/>`);
  add(`<clipPath id="${id}hc"><path d="${head}"/></clipPath>`);
  add(`<g clip-path="url(#${id}hc)">
<path d="M110,200 L300,200 C276,260 266,330 276,400 C286,450 300,490 330,540 L110,540Z" fill="${C.skinS}"/>
<path d="M110,200 L420,200 L420,262 C360,274 320,268 280,270 L110,272Z" fill="${C.skinS}"/>
<path d="M386,430 C380,440 382,450 388,456 L380,460 C374,450 374,438 380,430Z" fill="${C.skinS}"/>
</g>`);
  add(`<path d="${head}" fill="none" ${L()}/>`);
  add(`<ellipse cx="352" cy="420" rx="20" ry="9" fill="${C.blush}" opacity="0.28"/>`);
  // ear
  add(`<path d="M262,356 C246,348 236,364 240,388 C244,410 254,422 268,420" fill="${C.skin}" ${L()}/><path d="M254,370 C248,378 250,396 258,404" fill="none" ${L(2)}/>`);
  // jaw beard, goatee, moustache
  if (o.beard !== false) add(stubble([[266, 420], [274, 456], [292, 488], [318, 508], [346, 516], [372, 510], [386, 500]], C.hair, 1));
  if (o.beard !== false) add(`<path d="M376,500 C384,520 392,548 398,578 C384,556 370,534 362,512Z" fill="${C.hair}" ${L(2)}/>`);
  if (o.beard !== false) add(`<path d="M392,434 C384,438 376,446 370,${f(458 - 4 * E.mouth)} C380,452 388,446 396,442Z" fill="${C.hair}"/>`);
  // mouth corner
  add(`<path d="M392,${f(452 + (E.open > 0.05 ? 2 : 0))} L378,${f(454 - 4 * E.mouth)}" fill="none" ${L(2.4)}/>`);
  if (E.open > 0.05) add(`<path d="M392,454 C388,${f(462 + 10 * E.open)} 382,${f(462 + 10 * E.open)} 378,456Z" fill="#5a2a22" ${L(2)}/>`);
  // nostril
  add(`<path d="M392,420 C386,418 382,420 382,424" fill="none" ${L(2)}/>`);
  // eye in profile: a wedge opening forward, iris at the front edge
  const op = E.eye;
  const cy = 352;
  const ci = [318, cy - 2], co = [362, cy + 2];
  const up = `M${pt(ci)} C330,${f(cy - 14 * op)} 352,${f(cy - 14 * op)} ${pt(co)}`;
  const lo = `C352,${f(cy + 10)} 334,${f(cy + 10)} ${pt(ci)}Z`;
  add(`<clipPath id="${id}ec"><path d="${up} ${lo}"/></clipPath><path d="${up} ${lo}" fill="${C.white}"/>`);
  const ix = 350 + 3 * E.look[0], iy = cy + 1 + 4 * E.look[1];
  add(`<g clip-path="url(#${id}ec)"><ellipse cx="${f(ix)}" cy="${f(iy)}" rx="8" ry="11" fill="${C.iris}"/><ellipse cx="${f(ix + 1)}" cy="${f(iy + 1)}" rx="4.5" ry="7" fill="${C.irisD}"/></g>`);
  add(`<circle cx="${f(ix - 1)}" cy="${f(iy - 4)}" r="2.6" fill="#fff"/>`);
  add(`<path d="${up} L${pt([co[0] - 2, co[1] - 8])}" fill="none" ${L(4.4)}/>`);
  add(`<path d="M${pt([326, cy + 7])} C338,${f(cy + 10)} 352,${f(cy + 9)} ${pt([360, cy + 5])}" fill="none" ${L(1.5)} opacity="0.7"/>`);
  add(`<path d="M322,${f(cy - 18 * op)} C336,${f(cy - 25 * op)} 352,${f(cy - 23 * op)} 360,${f(cy - 14 * op)}" fill="none" ${L(1.5)} opacity="0.6"/>`);
  if (E.tear) add(`<path d="M352,366 C354,378 350,386 352,396" stroke="#bfe2f4" stroke-width="4" fill="none" stroke-linecap="round"/>`);
  // brow
  const k = E.brow;
  const iy2 = 326 - 9 * k, oy2 = 318 + (k > 0 ? 6 * k : -2 * k);
  add(`<path d="M312,${f(oy2 + 2)} C330,${f(oy2 - 6)} 352,${f(iy2 - 8)} 376,${f(iy2 - 2)} C352,${f(iy2 + 2)} 330,${f(oy2 + 4)} 312,${f(oy2 + 8)}Z" fill="${C.hair}" ${L(1.4)}/>`);
  // hair: side lock in front of the ear, back hair to the nape, hairline under the hat
  add(`<path d="M276,262 C262,320 262,380 274,436 C282,390 284,330 294,280Z" fill="${C.hair}" ${L(1.6)}/>`);
  add(`<path d="M240,248 C176,262 132,320 136,396 C140,448 168,488 214,506 C204,466 206,420 216,372 C228,322 252,284 290,262Z" fill="${C.hair}" ${L(1.6)}/>`);
  add(`<path d="M170,310 C160,350 160,400 170,440" fill="none" stroke="${C.hairHi}" stroke-width="4" stroke-linecap="round"/>`);
  add(`<path d="M250,262 C290,250 330,246 372,262 L376,236 L246,236Z" fill="${C.hair}"/>`);
  // hat in profile: long brim tilted forward, rounded crown, red cord to under the chin
  if (o.hat !== false) {
    add(`<path d="M60,252 C120,228 300,214 520,214 C540,216 548,226 530,234 C420,250 200,268 70,266 C52,264 48,258 60,252Z" fill="${C.hat}" ${L()}/>`);
    add(`<path d="M70,266 C200,268 420,250 530,234 C440,256 220,276 80,276Z" fill="${C.hatS}" ${L(2)}/>`);
    add(`<path d="M188,240 C188,182 232,142 292,140 C352,140 394,176 398,226 C330,236 250,240 188,240Z" fill="${C.hat}" ${L()}/>`);
    add(`<path d="M188,240 C188,182 232,142 292,140 C254,160 232,200 234,238Z" fill="${C.hatS}"/>`);
    add(`<path d="M280,146 C312,142 344,152 366,172 C342,162 314,156 290,158Z" fill="${C.snow}"/>`);
    add(`<path d="M300,224 C380,220 460,218 512,218" fill="none" stroke="${C.snow}" stroke-width="5" stroke-linecap="round"/>`);
  }
  if (o.hat === false && o.headscarf === 'tokyo') {
    add(`<path d="M176,206 L104,166 L114,152 L190,186Z" fill="#20252d" ${L(2.4)}/>`);
    add(`<path d="M374,264 C378,202 342,152 282,150 C200,150 138,198 130,262 C126,318 140,368 172,412 L208,416 C190,366 198,314 224,286 C264,266 330,258 374,264Z" fill="#22272f" ${L()}/>`);
    add(`<path d="M250,176 C270,162 296,158 318,162" fill="none" stroke="#3c4452" stroke-width="7" stroke-linecap="round"/>`);
    add(`<circle cx="196" cy="310" r="12" fill="none" stroke="${C.line}" stroke-width="9"/><circle cx="196" cy="310" r="12" fill="none" stroke="#f4f1e8" stroke-width="5"/>`);
  }
  if (o.hat === false && o.cap === 'gao') {
    add(`<path d="M136,284 C124,196 208,142 300,146 C356,146 386,190 384,262 C320,250 224,256 136,284Z" fill="#1a1a20" ${L()}/>`);
    add(`<path d="M250,150 C254,110 330,104 344,150Z" fill="#1a1a20" ${L()}/>`);
    add(`<circle cx="168" cy="206" r="20" fill="#e88aa8" ${L(2.4)}/><circle cx="168" cy="206" r="8" fill="#f6d36b"/><circle cx="186" cy="186" r="12" fill="#f0a6bf" ${L(2)}/>`);
  }
  return { defs: '', body: d };
}

export function svg(part, bg = '#ece6db', vb = '0 0 600 800') {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}"><defs>${part.defs}</defs><rect x="-200" y="-200" width="1000" height="1200" fill="${bg}"/>${part.body}</svg>`;
}
