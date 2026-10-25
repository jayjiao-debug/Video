// ep45 v3 hero: the 圆明园 red-copper horse head, rebuilt for gate 2a v3 (director notes S1–S4).
//  S1 cast eye (copper dome, incised pupil ring, brow ridge; no white, no catch-light dot)
//  S2 no tear: the facial crest starts below/behind the eye and runs back to the jowl; no line from the eye corner
//  S3 three layers of wavy grooved locks of unequal length + curled forelock; a neck as deep as the jaw ending in a cast
//     collar ring; darker core shadow, narrow crisp speculars
//  S4 folded near ear: full cup at the root, top third bent forward and down, lit edge on the bend
// Local frame: head faces LEFT; ear tips y≈25; collar bottom y≈950; placement point = collar-bottom centre (836, 950).
(() => {
const HEAD = `M470,196 C430,250 330,390 250,500 C222,540 196,572 178,600 C150,636 140,676 152,708
C160,728 182,738 206,736 L248,739 C228,748 212,760 216,774 C224,796 262,806 296,796
C350,782 420,772 486,764 C566,754 622,728 652,688 C688,640 700,594 692,552
C700,660 670,800 610,884 L1036,884 C1010,740 962,520 888,380
C836,270 732,190 640,166 C580,150 512,160 470,196 Z`;
const EAR_UP = `M502,190 C486,150 490,92 528,24 C562,70 588,122 592,172 Z`;
const EAR_IN_UP = `M512,178 C502,140 508,96 528,56 C550,94 564,134 568,172 Z`;
// folded ear: the cup stands from the root to the bend (y≈96); above it the top third hangs forward and down
// one closed outline: front root → up the cup → the rounded fold → the tip hanging forward-down → back under the flap → back root
const EAR_FOLD = `M496,194 C484,160 484,130 494,110 C500,92 520,72 552,70 C578,70 594,88 594,112 C596,140 600,160 602,176 Z`;
const EAR_CUP_IN = `M512,182 C504,156 504,134 510,120 C530,118 552,120 572,126 C578,146 582,162 584,176 Z`;
const EAR_FLAP = `M594,112 C594,88 578,70 552,70 C520,72 496,90 476,112 C462,128 448,146 432,170 C430,178 438,180 444,174 C462,154 482,138 504,128 C530,118 562,116 594,112 Z`;
const crest = (t) => {   // crest curve, poll (t=0) → base (t=1)
	const b = [[640, 166], [732, 190], [836, 270], [888, 380]], c = [[888, 380], [962, 520], [1010, 740], [1036, 884]];
	const bz = (q, u) => { const m = 1 - u; return [0, 1].map((k) => m * m * m * q[0][k] + 3 * m * m * u * q[1][k] + 3 * m * u * u * q[2][k] + u * u * u * q[3][k]); };
	return t < 0.42 ? bz(b, t / 0.42) : bz(c, (t - 0.42) / 0.58);
};
const rnd = (i) => { const x = Math.sin(i * 91.7 + 13.3) * 43758.5453; return x - Math.floor(x); };
const P = (p) => p[0].toFixed(1) + ',' + p[1].toFixed(1);
/** turtle centreline: start p, heading h (rad), length L, curvature k(s) per px */
const turtle = (p, h, L, k, n = 40) => { const pts = [p.slice()]; let x = p[0], y = p[1], a = h; const ds = L / n;
	for (let i = 1; i <= n; i++) { const s = i / n; a += k(s) * ds; x += Math.cos(a) * ds; y += Math.sin(a) * ds; pts.push([x, y]); } return pts; };
const ribbon = (pts, w) => { const L = [], R = [];
	pts.forEach((p, i) => { const q = pts[Math.min(i + 1, pts.length - 1)], o = pts[Math.max(i - 1, 0)];
		const dx = q[0] - o[0], dy = q[1] - o[1], d = Math.hypot(dx, dy) || 1, nx = -dy / d, ny = dx / d, ww = w(i / (pts.length - 1));
		L.push([p[0] + nx * ww, p[1] + ny * ww]); R.push([p[0] - nx * ww, p[1] - ny * ww]); });
	return {d: 'M' + L.concat(R.reverse()).map(P).join(' L') + ' Z', L, R: R.reverse()}; };
const line = (pts) => 'M' + pts.map(P).join(' L');
/** one layer of mane locks lying down the crest. */
const maneLayer = (o) => { const out = [];
	for (let i = 0; i < o.n; i++) { const r = rnd(i * 7 + o.seed), r2 = rnd(i * 13 + o.seed + 5), r3 = rnd(i * 3 + o.seed + 9);
		const t = o.t0 + (i + 0.5 * r) / o.n * (o.t1 - o.t0);
		const a = crest(t), a2 = crest(Math.min(1, t + 0.01)); const tang = Math.atan2(a2[1] - a[1], a2[0] - a[0]);
		const nx = Math.sin(tang), ny = -Math.cos(tang);   // outward (away from the neck)
		const start = [a[0] + nx * o.off, a[1] + ny * o.off];
		const L = o.len[0] + (o.len[1] - o.len[0]) * r * (1 - 0.35 * t), W = o.w[0] + (o.w[1] - o.w[0]) * r2;
		const ph = r3 * 6.28, wav = (0.010 + 0.006 * r2) * (o.wave ?? 1);
		// heading: down the crest, tipped outward; the wave rolls through, the end curls outward (a hook)
		const pts = turtle(start, tang - 0.35 - 0.25 * r3, L, (s) => wav * Math.sin(6.28 * 1.4 * s + ph) - (s > 0.62 ? 0.03 * (s - 0.62) / 0.38 : 0) * (o.curl ?? 1));
		const rb = ribbon(pts, (s) => W * Math.pow(Math.sin(Math.PI * Math.min(1, 0.12 + s * 0.95)), 0.55) * (1 - 0.6 * s) + 0.8);
		const g1 = line(pts.slice(3, -6).map((p, k) => { const L0 = rb.L[k + 3]; return [lerp(p[0], L0[0], 0.35), lerp(p[1], L0[1], 0.35)]; }));
		const g2 = line(pts.slice(4, -8).map((p, k) => { const R0 = rb.R[k + 4]; return [lerp(p[0], R0[0], 0.4), lerp(p[1], R0[1], 0.4)]; }));
		const lit = line(rb.L.slice(2, -4));
		out.push({d: rb.d, g1, g2, lit, wide: W > (o.w[0] + o.w[1]) / 2});
	}
	return out; };
const lerp = (a, b, t) => a + (b - a) * t;
/** forelock: curls from the poll falling forward over the brow */
const FORELOCK = [[536, 188, 2.2, 112, 18], [560, 186, 2.35, 96, 16], [516, 194, 2.0, 86, 14]].map(([x, y, h, L, W], i) => {
	const pts = turtle([x, y], h, L, (s) => (s > 0.45 ? -0.05 * (s - 0.45) / 0.55 : 0.004));
	const rb = ribbon(pts, (s) => W * Math.pow(Math.sin(Math.PI * Math.min(1, 0.15 + s)), 0.5) * (1 - 0.65 * s) + 0.6);
	return {d: rb.d, lit: line(rb.L.slice(2, -4)), g: line(pts.slice(3, -5))}; });

K.horseHead = (o = {}) => {
	const id = K.uid('h'), x = o.x ?? 960, y = o.y ?? 900, h = o.h ?? 400, s = h / 925, flip = o.flip ? -1 : 1;
	const curl = o.curl ?? 1, glow = o.glow ?? 0.6, rim = o.rim ?? '#FFC48A', mood = o.mood ?? 'warm';
	const C = {   // red copper
		warm: {hi: '#FFD9A6', lite: '#E8874A', mid: '#B4532A', deep: '#6A2612', dark: '#250B04', spec: '#FFF6E6'},
		fire: {hi: '#FFE2A0', lite: '#F28C44', mid: '#B85224', deep: '#68240D', dark: '#230A03', spec: '#FFF4CC'},
		cool: {hi: '#F6D3AE', lite: '#D57C4C', mid: '#9E4828', deep: '#5A2415', dark: '#220C06', spec: '#FFF6EA'},
	}[mood];
	const U = `filterUnits="userSpaceOnUse" x="-300" y="-300" width="1800" height="1700"`;
	const blur = (r) => `<filter id="${id}b${r}" ${U}><feGaussianBlur stdDeviation="${r}"/></filter>`;
	const b = (r) => `filter="url(#${id}b${r})"`;
	const back = maneLayer({n: 14, t0: 0.02, t1: 0.88, off: 24, len: [170, 270], w: [16, 24], seed: 1, curl: 1.2});
	const midL = maneLayer({n: 15, t0: 0.0, t1: 0.82, off: 6, len: [140, 230], w: [15, 22], seed: 2});
	const front = maneLayer({n: 11, t0: 0.05, t1: 0.74, off: -18, len: [90, 160], w: [12, 18], seed: 3, wave: 1.3});
	const lockSvg = (L, grad, edge, litOp) => L.map((l) => `<path d="${l.d}" fill="${C.dark}" opacity=".7" transform="translate(5,8)" ${b(4)}/>`).join('') +
		L.map((l) => `<path d="${l.d}" fill="url(#${grad})"/><path d="${l.d}" fill="none" stroke="${edge}" stroke-width="1.6" opacity=".6"/>
		<path d="${l.g1}" stroke="${C.dark}" stroke-width="2.6" fill="none" opacity=".75"/>${l.wide ? `<path d="${l.g2}" stroke="${C.dark}" stroke-width="2" fill="none" opacity=".55"/>` : ''}
		<path d="${l.lit}" stroke="${C.hi}" stroke-width="2.6" fill="none" opacity="${litOp}" stroke-linecap="round"/>`).join('');
	const defs = `<defs>
	<clipPath id="${id}c"><path d="${HEAD}"/></clipPath>
	<linearGradient id="${id}base" gradientUnits="userSpaceOnUse" x1="260" y1="230" x2="960" y2="900"><stop offset="0" stop-color="${C.lite}"/><stop offset="0.3" stop-color="${C.mid}"/><stop offset="0.62" stop-color="${C.deep}"/><stop offset="1" stop-color="${C.dark}"/></linearGradient>
	<linearGradient id="${id}lb" gradientUnits="userSpaceOnUse" x1="640" y1="160" x2="1060" y2="900"><stop offset="0" stop-color="${C.mid}"/><stop offset="0.5" stop-color="${C.deep}"/><stop offset="1" stop-color="${C.dark}"/></linearGradient>
	<linearGradient id="${id}lm" gradientUnits="userSpaceOnUse" x1="640" y1="160" x2="1040" y2="900"><stop offset="0" stop-color="${C.lite}"/><stop offset="0.45" stop-color="${C.mid}"/><stop offset="1" stop-color="${C.deep}"/></linearGradient>
	<linearGradient id="${id}lf" gradientUnits="userSpaceOnUse" x1="620" y1="160" x2="980" y2="860"><stop offset="0" stop-color="${C.lite}"/><stop offset="0.4" stop-color="${C.mid}"/><stop offset="1" stop-color="${C.deep}"/></linearGradient>
	<linearGradient id="${id}col" gradientUnits="userSpaceOnUse" x1="0" y1="866" x2="0" y2="956"><stop offset="0" stop-color="${C.deep}"/><stop offset="0.16" stop-color="${C.hi}"/><stop offset="0.32" stop-color="${C.lite}"/><stop offset="0.7" stop-color="${C.deep}"/><stop offset="1" stop-color="${C.dark}"/></linearGradient>
	<linearGradient id="${id}flap" gradientUnits="userSpaceOnUse" x1="570" y1="70" x2="440" y2="170"><stop offset="0" stop-color="${C.hi}"/><stop offset="0.3" stop-color="${C.lite}"/><stop offset="1" stop-color="${C.mid}"/></linearGradient>
	<radialGradient id="${id}ball" cx="456" cy="312" r="46" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${C.hi}"/><stop offset="0.35" stop-color="${C.lite}"/><stop offset="0.75" stop-color="${C.mid}"/><stop offset="1" stop-color="${C.deep}"/></radialGradient>
	<radialGradient id="${id}glow"><stop offset="0" stop-color="${o.glowCol ?? '#FF9A5A'}" stop-opacity="${0.5 * glow}"/><stop offset="0.45" stop-color="${o.glowCol ?? '#FF8A50'}" stop-opacity="${0.2 * glow}"/><stop offset="1" stop-color="${o.glowCol ?? '#FF8A50'}" stop-opacity="0"/></radialGradient>
	${blur(1.2)}${blur(3)}${blur(4)}${blur(8)}${blur(18)}${blur(36)}
	<filter id="${id}pat" ${U}><feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="2" seed="3"/><feColorMatrix type="matrix" values="0 0 0 0 0.1  0 0 0 0 0.04  0 0 0 0 0.02  0 0 0 -2.2 1.25"/></filter>
	</defs>`;
	const body = `
	${glow > 0 ? `<ellipse cx="610" cy="500" rx="640" ry="580" fill="url(#${id}glow)"/>` : ''}
	<path transform="translate(70,-4)" d="${EAR_UP}" fill="${C.deep}"/><path transform="translate(70,-4)" d="${EAR_IN_UP}" fill="${C.dark}" opacity=".6"/>
	<path transform="translate(70,-4)" d="M528,26 C560,70 586,120 590,170" stroke="${C.lite}" stroke-width="3" fill="none" opacity=".6"/>
	<path d="${HEAD}" fill="url(#${id}base)"/>
	<g clip-path="url(#${id}c)">
		<rect x="100" y="100" width="1000" height="860" filter="url(#${id}pat)" opacity=".2"/>
		<!-- jowl: round cheek, lit crescent upper-front, a deep core shadow under the jaw -->
		<circle cx="540" cy="600" r="150" fill="${C.lite}" opacity=".42" ${b(36)}/>
		<path d="M418,566 C436,494 506,452 592,462" stroke="${C.hi}" stroke-width="18" fill="none" opacity=".55" ${b(8)}/>
		<path d="M420,766 C540,756 640,722 676,630" stroke="${C.dark}" stroke-width="70" fill="none" opacity=".9" ${b(18)}/>
		<path d="M640,470 C690,540 692,640 654,700" stroke="${C.dark}" stroke-width="16" fill="none" opacity=".7" ${b(4)}/>
		<!-- face plane: lit band on the nasal bone; a dark reflected band below it (polished metal) -->
		<path d="M458,214 C410,290 320,412 248,512 C222,550 200,580 186,606" stroke="${C.hi}" stroke-width="42" fill="none" opacity=".5" ${b(18)}/>
		<path d="M330,470 C300,520 270,580 246,640" stroke="${C.dark}" stroke-width="40" fill="none" opacity=".28" ${b(18)}/>
		<!-- facial crest: starts BELOW and BEHIND the eye, runs back along the cheek to the jowl (no line from the eye corner) -->
		<path d="M520,392 C548,428 566,470 576,512" stroke="${C.hi}" stroke-width="16" fill="none" opacity=".4" ${b(8)}/>
		<path d="M506,406 C532,442 548,482 556,522" stroke="${C.dark}" stroke-width="16" fill="none" opacity=".35" ${b(8)}/>
		<!-- neck: shade under the mane, muscle highlight, throat groove -->
		<path d="M690,250 C866,380 944,600 966,900" stroke="${C.dark}" stroke-width="170" fill="none" opacity=".6" ${b(36)}/>
		<path d="M720,430 C774,530 800,670 806,900" stroke="${C.lite}" stroke-width="90" fill="none" opacity=".32" ${b(36)}/>
		<path d="M696,560 C708,680 700,790 682,900" stroke="${C.dark}" stroke-width="34" fill="none" opacity=".6" ${b(8)}/>
		<path d="M730,860 L1000,860" stroke="${C.dark}" stroke-width="50" opacity=".5" ${b(18)}/>
		<!-- eye socket + brow ridge -->
		<ellipse cx="464" cy="330" rx="76" ry="52" fill="${C.dark}" opacity=".55" ${b(8)} transform="rotate(-30 464 330)"/>
		<path d="M398,298 C426,262 482,252 532,276" stroke="${C.hi}" stroke-width="16" fill="none" opacity=".75" ${b(3)}/>
		<path d="M404,306 C432,284 480,276 522,292" stroke="${C.dark}" stroke-width="10" fill="none" opacity=".6" ${b(3)}/>
		<!-- muzzle -->
		<ellipse cx="206" cy="664" rx="72" ry="64" fill="${C.lite}" opacity=".5" ${b(18)}/>
		<path d="M252,600 C232,606 206,630 196,656 C190,674 198,690 214,688 C208,676 212,660 224,646 C236,632 250,620 252,600 Z" fill="${C.dark}"/>
		<path d="M256,598 C262,622 252,646 232,668" stroke="${C.hi}" stroke-width="5" fill="none" opacity=".7" stroke-linecap="round"/>
		<path d="M154,706 C172,728 196,734 220,734" stroke="${C.dark}" stroke-width="5" fill="none" opacity=".85"/>
		<path d="M206,736 L248,739" stroke="${C.dark}" stroke-width="7" stroke-linecap="round"/>
		<path d="M224,782 C246,792 272,792 294,784" stroke="${C.hi}" stroke-width="4" fill="none" opacity=".6"/>
		<!-- rim light along the top/back edge -->
		<path d="${HEAD}" fill="none" stroke="${rim}" stroke-width="16" opacity="${o.rimAmt ?? 0.5}" ${b(8)} transform="translate(-7,6)"/>
		<!-- mane layers (shadows fall on the neck, clipped to it) -->
		${back.map((l) => `<path d="${l.d}" fill="${C.dark}" opacity=".75" transform="translate(6,10)" ${b(4)}/>`).join('')}
		${midL.map((l) => `<path d="${l.d}" fill="${C.dark}" opacity=".7" transform="translate(5,9)" ${b(4)}/>`).join('')}
		${front.map((l) => `<path d="${l.d}" fill="${C.dark}" opacity=".7" transform="translate(5,8)" ${b(4)}/>`).join('')}
	</g>
	<!-- mane: back layer (darker, longest, past the crest), middle, front (lit, short, on the neck) -->
	${lockSvg(back, id + 'lb', C.dark, 0.35)}
	${lockSvg(midL, id + 'lm', C.dark, 0.55)}
	${lockSvg(front, id + 'lf', C.deep, 0.8)}
	<!-- forelock curls -->
	${FORELOCK.map((f) => `<path d="${f.d}" fill="${C.dark}" opacity=".6" transform="translate(4,7)" ${b(3)}/><path d="${f.d}" fill="url(#${id}lm)"/><path d="${f.d}" fill="none" stroke="${C.dark}" stroke-width="2.4" opacity=".8"/><path d="${f.g}" stroke="${C.dark}" stroke-width="2.2" fill="none" opacity=".75"/><path d="${f.lit}" stroke="${C.hi}" stroke-width="2.4" fill="none" opacity=".8"/>`).join('')}
	<!-- near ear -->
	${curl > 0.5 ? `
	<path d="${EAR_FOLD}" fill="${C.mid}"/><path d="${EAR_CUP_IN}" fill="${C.dark}" opacity=".85"/>
	<path d="M500,190 C490,160 490,134 498,116" stroke="${C.lite}" stroke-width="4" fill="none" opacity=".7"/>
	<path d="M506,128 C532,120 562,118 592,116 L590,134 C560,134 532,136 508,142 Z" fill="${C.dark}" opacity=".75" ${b(3)}/>
	<path d="${EAR_FLAP}" fill="url(#${id}flap)"/><path d="${EAR_FLAP}" fill="none" stroke="${C.deep}" stroke-width="3"/>
	<path d="M590,100 C584,80 566,72 548,72 C522,74 500,90 480,112" stroke="${C.spec}" stroke-width="6" fill="none" opacity=".95" stroke-linecap="round"/>
	<path d="M588,116 C556,120 520,126 490,144" stroke="${C.deep}" stroke-width="3" fill="none" opacity=".8"/>`
	: `<path d="${EAR_UP}" fill="${C.mid}"/><path d="${EAR_IN_UP}" fill="${C.dark}" opacity=".78"/><path d="M503,186 C490,150 494,96 526,32" stroke="${C.hi}" stroke-width="4" fill="none" opacity=".75"/>`}
	<!-- the cast eye: a copper dome under a lid fold, an incised pupil ring; no white, no catch-light dot -->
	<ellipse cx="468" cy="324" rx="39" ry="25" transform="rotate(-22 468 324)" fill="url(#${id}ball)"/>
	<path d="M428,334 C444,302 482,290 512,302" stroke="${C.deep}" stroke-width="10" fill="none" stroke-linecap="round"/>
	<path d="M426,328 C442,296 482,282 514,294" stroke="${C.hi}" stroke-width="4" fill="none" opacity=".85" stroke-linecap="round"/>
	<path d="M434,342 C458,352 490,344 506,324" stroke="${C.dark}" stroke-width="4.5" fill="none" stroke-linecap="round"/>
	<path d="M438,350 C462,360 494,350 510,330" stroke="${C.hi}" stroke-width="2.5" fill="none" opacity=".5" stroke-linecap="round"/>
	<ellipse cx="474" cy="323" rx="14" ry="12" transform="rotate(-22 474 323)" fill="${C.deep}" opacity=".45"/>
	<ellipse cx="474" cy="323" rx="14" ry="12" transform="rotate(-22 474 323)" fill="none" stroke="${C.dark}" stroke-width="4.5"/>
	<path d="M484,326 C482,332 476,335 470,334" stroke="${C.hi}" stroke-width="2.5" fill="none" opacity=".9" stroke-linecap="round"/>
	<path d="M444,318 C450,309 460,305 470,304" stroke="${C.spec}" stroke-width="3.5" fill="none" opacity=".95" stroke-linecap="round"/>
	<!-- collar ring: the cast neck ends in a rounded ring -->
	<path d="M598,878 C590,898 590,922 600,944 C680,960 970,960 1048,944 C1058,922 1058,898 1050,878 C970,866 680,866 598,878 Z" fill="url(#${id}col)"/>
	<path d="M598,878 C680,866 970,866 1050,878" stroke="${C.spec}" stroke-width="3" fill="none" opacity=".85"/>
	<path d="M594,912 C680,926 970,926 1054,912" stroke="${C.dark}" stroke-width="3" fill="none" opacity=".6"/>
	<!-- crisp speculars (narrow, unblurred) -->
	<path d="M448,230 C426,262 406,292 390,316" stroke="${C.spec}" stroke-width="4" fill="none" opacity=".95" stroke-linecap="round"/>
	<path d="M372,346 C350,378 326,412 306,440" stroke="${C.spec}" stroke-width="3" fill="none" opacity=".8" stroke-linecap="round"/>
	<path d="M240,570 C228,588 218,602 210,616" stroke="${C.spec}" stroke-width="4" fill="none" opacity=".85" stroke-linecap="round"/>
	<path d="M430,520 C456,486 500,470 548,468" stroke="${C.spec}" stroke-width="3.5" fill="none" opacity=".75" stroke-linecap="round"/>
	<path d="M752,500 C788,590 806,700 812,840" stroke="${C.spec}" stroke-width="3" fill="none" opacity=".45" stroke-linecap="round"/>`;
	const ty = 950;
	return `<g transform="translate(${x},${y}) scale(${flip * s},${s}) translate(-836,-${ty})">${defs}${body}</g>`;
};
K.HEAD_PTS = {mouth: [228 - 836, 740 - 950], eye: [470 - 836, 322 - 950], ear: [470 - 836, 120 - 950], nose: [150 - 836, 680 - 950],
	poll: [560 - 836, 180 - 950], collarF: [598 - 836, 900 - 950], collarB: [1050 - 836, 900 - 950], throat: [690 - 836, 700 - 950], height: 925};
K.headPt = (o, name) => { const s = (o.h ?? 400) / 925, f = o.flip ? -1 : 1, p = K.HEAD_PTS[name]; return [o.x + f * p[0] * s, o.y + p[1] * s]; };
})();
