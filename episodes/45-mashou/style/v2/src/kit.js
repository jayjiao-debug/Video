// ep45 gate 2a v2 style-frame kit: copper horse head, profile figures, ep43 v6 caption layer.
// Everything is code-drawn SVG/HTML (the same shapes the three.js engine rasterises into layers).
const K = {};
let _uid = 0; const uid = (p) => `${p}${++_uid}`;
const lerp = (a, b, t) => a + (b - a) * t;
K.lerp = lerp;

// ------------------------------------------------------------------ the hero: 圆明园 red-copper horse head
// Local frame: head faces LEFT; ear tips y≈25, base cut y≈884; placement point = base centre (834, 884).
// opts: {x, y (base centre on screen), h (screen height ear-tip → base), flip, curl 0..1 (near ear folded), rim, glow, mood}
const HEAD = `M470,196 C430,250 330,390 250,500 C222,540 196,572 178,600 C150,636 140,676 152,708
C160,728 182,738 206,736 L248,739 C228,748 212,760 216,774 C224,796 262,806 296,796
C340,782 380,762 420,752 C470,740 560,732 612,692 C664,650 680,560 648,486
C684,560 712,700 714,800 C714,840 702,866 686,884 L984,884 C974,740 944,520 880,380
C830,270 730,190 640,166 C580,150 512,160 470,196 Z`;
const EAR_UP = `M505,188 C490,150 492,90 528,24 C560,70 584,120 588,170 Z`;
const EAR_IN_UP = `M512,176 C502,140 506,96 527,54 C548,92 562,132 566,170 Z`;
const EAR_FOLD = `M505,188 C494,158 494,128 502,104 C486,108 466,120 448,140 C450,114 470,88 500,76 C520,68 540,72 550,86 C568,114 584,142 588,170 Z`;
const EAR_IN_FOLD = `M513,176 C504,150 504,124 512,104 C524,90 536,88 546,96 C558,120 566,146 568,170 Z`;
const crest = (t) => {   // crest curve, poll (t=0) → base (t=1)
	const b = [[640, 166], [730, 190], [830, 270], [880, 380]], c = [[880, 380], [944, 520], [974, 740], [984, 884]];
	const bz = (q, u) => { const m = 1 - u; return [0, 1].map((k) => m * m * m * q[0][k] + 3 * m * m * u * q[1][k] + 3 * m * u * u * q[2][k] + u * u * u * q[3][k]); };
	return t < 0.42 ? bz(b, t / 0.42) : bz(c, (t - 0.42) / 0.58);
};
/** a tapered strand from a centreline (list of [x,y]) with width w(s) */
const strand = (pts, w) => {
	const L = [], R = [];
	pts.forEach((p, i) => { const q = pts[Math.min(i + 1, pts.length - 1)], o = pts[Math.max(i - 1, 0)];
		const dx = q[0] - o[0], dy = q[1] - o[1], d = Math.hypot(dx, dy) || 1, nx = -dy / d, ny = dx / d, ww = w(i / (pts.length - 1));
		L.push([p[0] + nx * ww, p[1] + ny * ww]); R.push([p[0] - nx * ww, p[1] - ny * ww]); });
	const all = L.concat(R.reverse());
	return 'M' + all.map((p) => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' L') + ' Z';
};
const maneLocks = (n = 13) => {
	const out = [];
	for (let i = 0; i < n; i++) {
		const t = 0.02 + (i / (n - 1)) * 0.74;
		const a = crest(t), a2 = crest(Math.min(1, t + 0.02)), dx = a2[0] - a[0], dy = a2[1] - a[1], d = Math.hypot(dx, dy), tx = dx / d, ty = dy / d;
		const nx = ty, ny = -tx;   // outward (away from the neck)
		const len = 170 + 40 * Math.sin(i * 2.1) + (i > n - 4 ? -50 : 0), amp = 16 + 6 * Math.cos(i * 1.3);
		const pts = [];
		for (let k = 0; k <= 24; k++) { const s = k / 24;
			// starts inside the neck, runs down the crest with an S-wave, the end flicks outward past the crest line
			const along = s * len, side = -34 + 30 * s + amp * Math.sin(Math.PI * 1.6 * s) + 60 * Math.pow(s, 3);
			pts.push([a[0] + tx * along + nx * side, a[1] + ty * along + ny * side]); }
		const w = (s) => 30 * Math.pow(Math.sin(Math.PI * s), 0.6) * (1 - 0.3 * s) + 1;
		const ctr = pts.slice(2, 22);
		out.push({d: strand(pts, w), g: 'M' + ctr.map((p) => p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' L'), i});
	}
	return out;
};
const FORELOCK = [`M500,190 C470,214 444,250 436,296 C452,276 466,262 478,256 C470,272 468,290 472,306 C486,276 500,250 524,226 Z`, `M536,186 C516,214 508,250 514,288 C524,262 536,244 554,230 C552,248 556,264 564,278 C566,246 572,222 590,200 Z`];

K.horseHead = (o = {}) => {
	const id = uid('h'), x = o.x ?? 960, y = o.y ?? 900, h = o.h ?? 400, s = h / 860, flip = o.flip ? -1 : 1;
	const curl = o.curl ?? 1, glow = o.glow ?? 0.6, rim = o.rim ?? '#FFC48A', mood = o.mood ?? 'warm';
	const C = {   // red copper
		warm: {hi: '#FFD6A0', lite: '#E58448', mid: '#B0502A', deep: '#6A2814', dark: '#2E1007', spec: '#FFF4E0'},
		cool: {hi: '#F4D0AC', lite: '#D27A4C', mid: '#9C4728', deep: '#5A2415', dark: '#260E08', spec: '#FFF6EA'},
		fire: {hi: '#FFE09C', lite: '#F08A44', mid: '#B85024', deep: '#6A260F', dark: '#2C0E05', spec: '#FFF2C8'},
	}[mood];
	const locks = maneLocks(o.locks ?? 13);
	const U = `filterUnits="userSpaceOnUse" x="-300" y="-300" width="1700" height="1600"`;
	const blur = (r) => `<filter id="${id}b${r}" ${U}><feGaussianBlur stdDeviation="${r}"/></filter>`;
	const b = (r) => `filter="url(#${id}b${r})"`;
	const ear = curl > 0.5 ? EAR_FOLD : EAR_UP, earIn = curl > 0.5 ? EAR_IN_FOLD : EAR_IN_UP;
	const defs = `<defs>
	<clipPath id="${id}c"><path d="${HEAD}"/></clipPath>
	<linearGradient id="${id}base" gradientUnits="userSpaceOnUse" x1="250" y1="250" x2="950" y2="880"><stop offset="0" stop-color="${C.lite}"/><stop offset="0.35" stop-color="${C.mid}"/><stop offset="0.72" stop-color="${C.deep}"/><stop offset="1" stop-color="${C.dark}"/></linearGradient>
	<linearGradient id="${id}lock" gradientUnits="userSpaceOnUse" x1="640" y1="160" x2="1000" y2="880"><stop offset="0" stop-color="${C.lite}"/><stop offset="0.45" stop-color="${C.mid}"/><stop offset="1" stop-color="${C.deep}"/></linearGradient>
	<radialGradient id="${id}glow"><stop offset="0" stop-color="${o.glowCol ?? '#FF9A5A'}" stop-opacity="${0.5 * glow}"/><stop offset="0.45" stop-color="${o.glowCol ?? '#FF8A50'}" stop-opacity="${0.2 * glow}"/><stop offset="1" stop-color="${o.glowCol ?? '#FF8A50'}" stop-opacity="0"/></radialGradient>
	${blur(3)}${blur(8)}${blur(18)}${blur(36)}
	<filter id="${id}pat" ${U}><feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="2" seed="3"/><feColorMatrix type="matrix" values="0 0 0 0 0.1  0 0 0 0 0.04  0 0 0 0 0.02  0 0 0 -2.2 1.25"/></filter>
	</defs>`;
	const body = `
	<ellipse cx="600" cy="480" rx="620" ry="560" fill="url(#${id}glow)"/>
	<path transform="translate(62,-6)" d="${EAR_UP}" fill="${C.deep}"/><path transform="translate(62,-6)" d="${EAR_IN_UP}" fill="${C.dark}" opacity=".5"/>
	<path d="${HEAD}" fill="url(#${id}base)"/>
	<g clip-path="url(#${id}c)">
		<rect x="100" y="100" width="950" height="820" filter="url(#${id}pat)" opacity=".22"/>
		<!-- jowl: a big round cheek, lit crescent on its upper front, core shadow under it -->
		<circle cx="500" cy="580" r="150" fill="${C.lite}" opacity=".45" ${b(36)}/>
		<path d="M380,520 C410,450 500,420 590,450" stroke="${C.hi}" stroke-width="16" fill="none" opacity=".55" ${b(8)}/>
		<path d="M400,742 C500,742 600,710 650,620" stroke="${C.dark}" stroke-width="54" fill="none" opacity=".7" ${b(18)}/>
		<path d="M612,692 C664,650 680,560 648,486" stroke="${C.dark}" stroke-width="16" fill="none" opacity=".6" ${b(8)}/>
		<!-- face plane: highlight band along the nasal bone, dark under it -->
		<path d="M458,214 C410,290 320,412 248,512 C222,550 200,580 186,606" stroke="${C.hi}" stroke-width="40" fill="none" opacity=".45" ${b(18)}/>
		<path d="M466,212 C420,282 336,398 262,500" stroke="${C.spec}" stroke-width="7" fill="none" opacity=".55" ${b(3)}/>
		<path d="M480,330 C430,410 360,500 300,600" stroke="${C.deep}" stroke-width="38" fill="none" opacity=".35" ${b(18)}/>
		<!-- neck: crest shade under the mane, muscle highlight, throat groove -->
		<path d="M680,260 C860,380 940,600 960,880" stroke="${C.dark}" stroke-width="150" fill="none" opacity=".55" ${b(36)}/>
		<path d="M690,420 C750,520 776,660 784,880" stroke="${C.lite}" stroke-width="80" fill="none" opacity=".3" ${b(36)}/>
		<path d="M664,520 C690,610 704,720 704,880" stroke="${C.dark}" stroke-width="30" fill="none" opacity=".55" ${b(18)}/>
		<!-- facial crest (zygomatic ridge) -->
		<path d="M470,360 C462,410 446,456 414,506" stroke="${C.dark}" stroke-width="12" fill="none" opacity=".55" ${b(3)}/>
		<path d="M478,354 C472,404 456,452 424,502" stroke="${C.hi}" stroke-width="6" fill="none" opacity=".7" ${b(3)}/>
		<!-- veins -->
		<path d="M410,430 C372,480 336,540 312,600 C302,626 288,654 268,676" stroke="${C.hi}" stroke-width="5" fill="none" opacity=".45" ${b(3)}/>
		<path d="M410,430 C372,480 336,540 312,600 C302,626 288,654 268,676" stroke="${C.dark}" stroke-width="5" fill="none" opacity=".3" transform="translate(4,4)" ${b(3)}/>
		<!-- eye socket + brow -->
		<ellipse cx="462" cy="322" rx="66" ry="44" fill="${C.dark}" opacity=".55" ${b(8)} transform="rotate(-30 462 322)"/>
		<path d="M404,300 C428,276 476,268 516,288" stroke="${C.hi}" stroke-width="14" fill="none" opacity=".7" ${b(3)}/>
		<!-- muzzle -->
		<ellipse cx="206" cy="664" rx="72" ry="64" fill="${C.lite}" opacity=".5" ${b(18)}/>
		<path d="M252,600 C232,606 206,630 196,656 C190,674 198,690 214,688 C208,676 212,660 224,646 C236,632 250,620 252,600 Z" fill="${C.dark}"/><path d="M256,598 C262,622 252,646 232,668" stroke="${C.hi}" stroke-width="5" fill="none" opacity=".6" stroke-linecap="round"/>
		<path d="M246,592 C222,600 196,622 184,650" stroke="${C.hi}" stroke-width="6" fill="none" opacity=".85" stroke-linecap="round"/><path d="M168,700 C176,690 186,684 198,684" stroke="${C.hi}" stroke-width="5" fill="none" opacity=".5" stroke-linecap="round"/>
		<path d="M154,706 C172,728 196,734 220,734" stroke="${C.dark}" stroke-width="5" fill="none" opacity=".8"/>
		<path d="M206,736 L248,739" stroke="${C.dark}" stroke-width="7" stroke-linecap="round"/>
		<path d="M224,782 C246,792 272,792 294,784" stroke="${C.hi}" stroke-width="5" fill="none" opacity=".5"/>
		<!-- forelock -->
		${FORELOCK.map((d) => `<path d="${d}" fill="${C.dark}" opacity=".5" transform="translate(5,6)"/><path d="${d}" fill="${C.lite}"/><path d="${d}" fill="none" stroke="${C.deep}" stroke-width="3"/>`).join('')}
		<path d="M700,860 L990,860" stroke="${C.dark}" stroke-width="60" opacity=".6" ${b(18)}/>
		<path d="M720,470 C770,560 790,680 796,840" stroke="${C.spec}" stroke-width="6" fill="none" opacity=".35" ${b(3)}/>
		<path d="M372,560 C380,500 430,456 500,446" stroke="${C.spec}" stroke-width="5" fill="none" opacity=".45" ${b(3)}/>
		<!-- rim light along the top/back edge -->
		<path d="${HEAD}" fill="none" stroke="${rim}" stroke-width="18" opacity="${o.rimAmt ?? 0.5}" ${b(8)} transform="translate(-7,6)"/>
	</g>
	<!-- mane: flame locks lying over the crest, ends flicking past it -->
	${locks.map((l) => `<path d="${l.d}" fill="${C.dark}" transform="translate(6,8)" opacity=".55"/><path d="${l.d}" fill="url(#${id}lock)"/><path d="${l.d}" fill="none" stroke="${C.dark}" stroke-width="3" opacity=".75"/><path d="${l.g}" stroke="${C.hi}" stroke-width="4" fill="none" stroke-linecap="round" opacity=".5" transform="translate(-4,-3)"/>`).join('')}
	<!-- near ear on top -->
	<path d="${ear}" fill="${C.mid}"/><path d="${earIn}" fill="${C.dark}" opacity=".72"/>
	${curl > 0.5 ? `<path d="M502,104 C486,108 466,120 448,140 C470,128 490,120 512,116 Z" fill="${C.deep}"/><path d="M500,78 C520,70 540,72 550,86" stroke="${C.hi}" stroke-width="5" fill="none" opacity=".8" stroke-linecap="round"/><path d="M450,136 C462,112 480,92 500,80" stroke="${C.hi}" stroke-width="4" fill="none" opacity=".7"/>` : `<path d="M505,186 C492,150 494,96 526,32" stroke="${C.hi}" stroke-width="4" fill="none" opacity=".6"/>`}
	<!-- the eye -->
	<path d="M426,334 C440,312 470,298 502,304 C490,326 462,340 426,334 Z" fill="#170703"/>
	<path d="M422,336 C438,310 470,294 506,300" stroke="${C.hi}" stroke-width="5" fill="none" opacity=".8" stroke-linecap="round"/>
	<path d="M432,340 C452,346 476,340 494,326" stroke="${C.lite}" stroke-width="3" fill="none" opacity=".6"/>
	<circle cx="484" cy="312" r="5" fill="${C.spec}" opacity=".9"/>
	<!-- base: the bronze ends in a flared lip -->
	<path d="M686,884 C730,870 940,870 984,884 L990,902 C940,914 730,914 680,902 Z" fill="${C.deep}"/>
	<path d="M686,884 C730,872 940,872 984,884" stroke="${C.hi}" stroke-width="4" fill="none" opacity=".5"/>
	<!-- speculars -->
	<path d="M446,232 C424,264 404,294 388,318" stroke="${C.spec}" stroke-width="5" fill="none" opacity=".8" stroke-linecap="round"/>
	<path d="M238,572 C226,588 216,602 208,616" stroke="${C.spec}" stroke-width="5" fill="none" opacity=".7" stroke-linecap="round"/>
	<path d="M420,486 C450,454 492,440 530,440" stroke="${C.spec}" stroke-width="4" fill="none" opacity=".5" stroke-linecap="round"/>`;
	return `<g transform="translate(${x},${y}) scale(${flip * s},${s}) translate(-834,-884)">${defs}${body}</g>`;
};
// handy numbers for placing the head: local mouth point etc. (unflipped, relative to base centre; multiply by s)
K.HEAD_PTS = {mouth: [228 - 834, 740 - 884], eye: [470 - 834, 318 - 884], ear: [470 - 834, 120 - 884], nose: [150 - 834, 680 - 884], height: 860};
K.headPt = (o, name) => { const s = (o.h ?? 400) / 860, f = o.flip ? -1 : 1, p = K.HEAD_PTS[name]; return [o.x + f * p[0] * s, o.y + p[1] * s]; };

// ------------------------------------------------------------------ profile figures (one tone), placed from joints
// fig({x, ground, h, face: 1 right / -1 left, hat, coat, legs: [hipToFootFront, back] angles, arms: targets}) — simple 2-bone limbs.
const two = (s, e, L1, L2, bend) => {   // two-bone IK: shoulder s → target e, returns elbow
	const dx = e[0] - s[0], dy = e[1] - s[1], d = Math.min(Math.hypot(dx, dy), L1 + L2 - 0.01);
	const a = Math.acos((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d)), base = Math.atan2(dy, dx), ang = base + bend * a;
	return [s[0] + Math.cos(ang) * L1, s[1] + Math.sin(ang) * L1];
};
K.two = two;
const limb = (pts, w0, w1, col) => {   // a tapered limb through 3 points as a filled path (round joints)
	const [a, b, c] = pts; const seg = (p, q, w1_, w2_) => { const dx = q[0] - p[0], dy = q[1] - p[1], L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L;
		return `M${p[0] + nx * w1_},${p[1] + ny * w1_} L${q[0] + nx * w2_},${q[1] + ny * w2_} L${q[0] - nx * w2_},${q[1] - ny * w2_} L${p[0] - nx * w1_},${p[1] - ny * w1_} Z`; };
	const wm = (w0 + w1) / 2;
	return `<path d="${seg(a, b, w0, wm)} ${seg(b, c, wm, w1)}" fill="${col}"/><circle cx="${b[0]}" cy="${b[1]}" r="${wm}" fill="${col}"/><circle cx="${a[0]}" cy="${a[1]}" r="${w0}" fill="${col}"/>`;
};
K.limb = limb;
/** A standing/walking profile figure. u = height unit (h/8). f = facing (+1 right). Returns {svg, pts}. */
K.figure = (o) => {
	const h = o.h, u = h / 8, f = o.face ?? 1, col = o.col ?? '#15100C', gx = o.x, gy = o.ground;
	const X = (dx) => gx + f * dx * u, lean = o.lean ?? 0;
	const hip = [X(0), gy - 4.0 * u], neck = [X(0.18 + lean), gy - 6.55 * u], sh = [X(0.05 + lean * 0.8), gy - 6.3 * u];
	const head = [X(0.25 + lean * 1.1), gy - 7.25 * u];
	const legs = (o.stride ?? [0.6, -0.5]).map((sx, i) => {   // foot x offsets
		const foot = [X(sx), gy - 0.12 * u], knee = two(hip, foot, 2.0 * u, 1.95 * u, f > 0 ? -1 : 1);
		return {foot, knee};
	});
	let svg = '';
	const legW = 0.46 * u;
	// back leg first
	[1, 0].forEach((i) => { const L = legs[i]; svg += limb([hip, L.knee, L.foot], legW, legW * 0.72, col);
		svg += `<path d="M${L.foot[0] - f * 0.25 * u},${L.foot[1] - 0.18 * u} L${L.foot[0] + f * 0.62 * u},${L.foot[1] - 0.08 * u} Q${L.foot[0] + f * 0.7 * u},${L.foot[1] + 0.12 * u} ${L.foot[0] + f * 0.5 * u},${L.foot[1] + 0.12 * u} L${L.foot[0] - f * 0.3 * u},${L.foot[1] + 0.12 * u} Z" fill="${col}"/>`; });
	// torso (jacket) as a path from shoulders to hips
	const tw = 0.75 * u, coatLen = o.coat ?? 0.5;
	const tb = [X(-0.7 + lean * 0.7), gy - 6.45 * u], tf = [X(0.62 + lean * 0.9), gy - 6.15 * u];
	const hb = [X(-0.62), gy - (4 - coatLen) * u], hf = [X(0.6), gy - (4 - coatLen) * u];
	svg += `<path d="M${tb[0]},${tb[1]} C${X(-0.92 + lean * 0.5)},${gy - 5.4 * u} ${X(-0.72)},${gy - 4.6 * u} ${hb[0]},${hb[1]} L${hf[0]},${hf[1]} C${X(0.74 + lean * 0.4)},${gy - 4.8 * u} ${X(0.86 + lean * 0.8)},${gy - 5.6 * u} ${tf[0]},${tf[1]} Q${X(0.3 + lean)},${gy - 6.6 * u} ${tb[0]},${tb[1]} Z" fill="${col}"/>`;
	// neck + head (profile: skull, nose bump, jaw)
	const hx = head[0], hy = head[1], r = 0.48 * u;
	svg += `<path d="M${X(0.0 + lean)},${gy - 6.2 * u} L${X(0.35 + lean)},${gy - 6.3 * u} L${X(0.3 + lean * 1.1)},${gy - 6.9 * u} L${X(0.02 + lean)},${gy - 6.9 * u} Z" fill="${col}"/>`;
	svg += `<path d="M${hx - f * r * 0.95},${hy - r * 0.1} C${hx - f * r},${hy - r * 1.15} ${hx + f * r * 0.9},${hy - r * 1.2} ${hx + f * r * 0.95},${hy - r * 0.2}
		L${hx + f * r * 1.22},${hy + r * 0.18} L${hx + f * r * 0.98},${hy + r * 0.32} L${hx + f * r * 0.95},${hy + r * 0.6}
		C${hx + f * r * 0.8},${hy + r * 0.98} ${hx + f * r * 0.2},${hy + r * 1.08} ${hx - f * r * 0.15},${hy + r * 0.9}
		C${hx - f * r * 0.7},${hy + r * 0.8} ${hx - f * r * 1.02},${hy + r * 0.5} ${hx - f * r * 0.95},${hy - r * 0.1} Z" fill="${col}"/>`;
	// hat
	if (o.hat === 'kepi') {   // French 1860 kepi: crown taller at back, tilted forward, short flat visor
		svg += `<path d="M${hx - f * r * 1.0},${hy - r * 0.35} L${hx - f * r * 0.95},${hy - r * 1.32} L${hx + f * r * 0.66},${hy - r * 1.08} L${hx + f * r * 0.86},${hy - r * 0.42} Z" fill="${col}"/>
		<path d="M${hx + f * r * 0.7},${hy - r * 0.46} L${hx + f * r * 1.42},${hy - r * 0.28} L${hx + f * r * 1.38},${hy - r * 0.16} L${hx + f * r * 0.7},${hy - r * 0.26} Z" fill="${col}"/>`;
	} else if (o.hat === 'cap') {   // Qing 瓜皮帽 skullcap with knob
		svg += `<path d="M${hx - f * r * 1.0},${hy - r * 0.3} C${hx - f * r * 1.0},${hy - r * 1.35} ${hx + f * r * 0.95},${hy - r * 1.35} ${hx + f * r * 0.98},${hy - r * 0.3} Z" fill="${col}"/><circle cx="${hx}" cy="${hy - r * 1.22}" r="${r * 0.18}" fill="${col}"/>`;
	} else if (o.hat === 'hair') {
		svg += `<path d="M${hx - f * r * 1.02},${hy + r * 0.2} C${hx - f * r * 1.1},${hy - r * 1.3} ${hx + f * r * 0.9},${hy - r * 1.4} ${hx + f * r * 0.98},${hy - r * 0.35} C${hx + f * r * 0.4},${hy - r * 0.8} ${hx - f * r * 0.3},${hy - r * 0.5} ${hx - f * r * 1.02},${hy + r * 0.2} Z" fill="${col}"/>`;
	}
	if (o.belts) svg += `<path d="M${X(-0.45)},${gy - 6.1 * u} L${X(0.45)},${gy - 4.2 * u}" stroke="${o.beltCol ?? '#2a2018'}" stroke-width="${0.09 * u}" opacity=".6"/>`;
	// arms: targets (hands) given in screen px; shoulder fixed
	const arms = (o.hands ?? []).map((tgt, i) => { const e = two(sh, tgt, 1.45 * u, 1.35 * u, (o.elbow?.[i] ?? 1) * (f > 0 ? 1 : -1)); return {e, tgt}; });
	const armSvg = arms.map(({e, tgt}) => limb([sh, e, tgt], 0.32 * u, 0.22 * u, col) + `<ellipse cx="${tgt[0]}" cy="${tgt[1]}" rx="${0.24 * u}" ry="${0.2 * u}" fill="${col}"/>`);
	return {svg, armBack: armSvg[1] ?? '', armFront: armSvg[0] ?? '', pts: {hip, sh, head, legs, arms}, u};
};

// ------------------------------------------------------------------ ep43 v6 caption layer (capC lay2 bl1 ad + seal C1)
K.CSS = `
#hud{position:absolute;inset:0;pointer-events:none;font-family:'Noto Serif CJK SC',serif;color:#FFF3D8;z-index:10}
.sh{text-shadow:0 0 2px rgba(12,8,5,.9),0 2px 6px rgba(12,8,5,.65),0 3px 24px rgba(12,8,5,.6)}
.sub{position:absolute;left:150px;top:124px;font-weight:900;font-size:64px;line-height:88px;letter-spacing:.03em;white-space:nowrap;z-index:0}
.sub .k{color:#FFF8EC;background:#D8392A;box-shadow:-.08em 0 0 #D8392A,.08em 0 0 #D8392A;text-shadow:none}
.stamp{position:absolute;top:64px;right:72px;text-align:right;padding-right:22px;border-right:5px solid #EE4B3B;transform-origin:top right;scale:.6;z-index:0}
.stamp .s1{font-weight:900;font-size:56px;line-height:1.22;letter-spacing:.02em}
.stamp .s2{font-weight:700;font-size:40px;line-height:1.45;margin-top:2px}
.blk{display:flex;position:absolute;left:140px;bottom:56px;transform-origin:left bottom;scale:.58;z-index:0;flex-direction:row;align-items:flex-end;gap:26px}
.blk::before{content:'';position:absolute;z-index:-1;left:-70px;right:-90px;top:-40px;bottom:-34px;background:radial-gradient(ellipse 60% 64% at 46% 56%,rgba(16,11,7,.6),rgba(16,11,7,.32) 60%,rgba(16,11,7,0) 100%);filter:blur(8px);opacity:var(--bk,0)}
.sub::before,.stamp::before{content:'';position:absolute;z-index:-1;left:-60px;right:-60px;top:-26px;bottom:-26px;background:radial-gradient(ellipse 58% 62% at 50% 50%,rgba(16,11,7,.62),rgba(16,11,7,.36) 58%,rgba(16,11,7,0) 100%);filter:blur(6px);opacity:var(--bk,0)}
.age{display:flex;align-items:flex-end;gap:18px}
.era{background:#EE4B3B;color:#F8EEDC;text-shadow:none;font-weight:900;font-size:30px;line-height:1;padding:10px 10px;border-radius:4px;writing-mode:vertical-rl;letter-spacing:.05em;box-shadow:0 2px 10px rgba(0,0,0,.25);margin-bottom:10px}
.cnt{font-weight:900;line-height:1;white-space:nowrap;display:flex;align-items:flex-end}
.cnt .a{font-size:34px;font-weight:700;margin-bottom:12px}
.cnt .n{font-family:'Cormorant Garamond',serif;font-weight:600;font-size:96px;letter-spacing:.01em;margin:0 8px;height:92px;line-height:92px}
.tally{font-weight:700;font-size:40px;line-height:1.25;border-left:2px solid rgba(255,243,216,.45);padding-left:26px;margin-bottom:4px}
.tally .o{display:inline-block;width:30px;height:30px;border-radius:15px;border:3px solid #FFF3D8;margin:0 4px -3px;box-sizing:border-box}
.tally .o.f{background:#EE4B3B;border-color:#EE4B3B}
.tally .o.y{background:#E8894B;border-color:#FFD9A6;box-shadow:0 0 12px #FF9A5A}
.tally .l{font-size:30px;font-weight:600;opacity:.85}
.seal{position:absolute;right:120px;bottom:54px;line-height:0;filter:drop-shadow(0 1px 2px rgba(12,8,5,.35));opacity:.86}
`;
const SEAL_RED = '#B8322A';
K.seal = () => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" height="54" width="54"><defs><filter id="wC1" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency="0.07" numOctaves="2" seed="5" result="n1"/><feDisplacementMap in="SourceGraphic" in2="n1" scale="3.2" xChannelSelector="R" yChannelSelector="G" result="d"/><feTurbulence type="fractalNoise" baseFrequency="0.28" numOctaves="2" seed="10" result="n2"/><feColorMatrix in="n2" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 -4.2 3.25" result="m"/><feComposite in="d" in2="m" operator="in"/></filter></defs><g filter="url(#wC1)" transform="rotate(-2.5 50 50)"><circle cx="50" cy="50" r="41" fill="none" stroke="${SEAL_RED}" stroke-width="8"/><text x="50" y="72" text-anchor="middle" font-family="Noto Serif CJK SC, serif" font-weight="900" font-size="60" fill="${SEAL_RED}">J</text></g></svg>`;
/** caption layer: {sub: '假如说，你是圆明园的[马首]。', stamp: {s1, s2}, era, age: {a:'你 约', n:267, post:'岁'}, tally: {label, n, tot, you}, bk: {sub, stamp, blk}} */
K.hud = (c) => {
	const sub = c.sub ? c.sub.replace(/\[([^\]]+)\]/g, '<span class="k">$1</span>') : '';
	const bk = c.bk ?? {};
	const dots = c.tally ? Array.from({length: c.tally.tot ?? 12}, (_, i) => `<span class="o${i === c.tally.you ? ' y' : i < c.tally.n ? ' f' : ''}"></span>`).join('') : '';
	return `<div id="hud">
	${sub ? `<div class="sub sh" style="--bk:${bk.sub ?? 0}">${sub}</div>` : ''}
	${c.stamp ? `<div class="stamp sh" style="--bk:${bk.stamp ?? 0}"><div class="s1">${c.stamp.s1}</div>${c.stamp.s2 ? `<div class="s2">${c.stamp.s2}</div>` : ''}</div>` : ''}
	<div class="blk" style="--bk:${bk.blk ?? 0}">
		<div class="age sh">${c.era ? `<div class="era">${c.era}</div>` : ''}${c.age ? `<div class="cnt"><span class="a">${c.age.a}</span><span class="n">${c.age.n}</span><span class="a">${c.age.post ?? ''}</span></div>` : ''}</div>
		${c.tally ? `<div class="tally sh"><div>${c.tally.label} ${dots}</div><div class="l">${c.tally.note ?? ''}</div></div>` : ''}
	</div>
	<div class="seal">${K.seal()}</div></div>`;
};

// ------------------------------------------------------------------ page scaffold
K.page = (svg, hud, extraCss = '') => {
	document.body.innerHTML = `<svg id="art" xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080">${svg}</svg>${hud}`;
	const st = document.createElement('style'); st.textContent = K.CSS + extraCss; document.head.appendChild(st);
};
// soft radial light helper
K.light = (cx, cy, rx, ry, col, a, id = uid('L')) => `<defs><radialGradient id="${id}"><stop offset="0" stop-color="${col}" stop-opacity="${a}"/><stop offset="1" stop-color="${col}" stop-opacity="0"/></radialGradient></defs><ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#${id})"/>`;
K.uid = uid;

// ------------------------------------------------------------------ the eleven brothers: profile heads (box 0..100, facing LEFT, neck base at y=100)
const NECK = `M50,100 C52,84 56,72 62,64 L86,60 C90,76 91,90 89,100 Z`;
K.ZODIAC = {
	鼠: `<ellipse cx="50" cy="58" rx="27" ry="17" transform="rotate(-12 50 58)"/><path d="M28,52 L4,66 L30,72 Z"/><circle cx="62" cy="36" r="13"/>`,
	牛: `<path d="M18,50 C24,40 52,36 72,42 L76,66 C62,76 36,82 22,76 C12,70 12,58 18,50 Z"/><path d="M60,44 C52,22 66,8 86,12 C74,18 70,28 72,44 Z"/><path d="M70,48 L92,46 L90,54 L72,56 Z"/>`,
	虎: `<ellipse cx="54" cy="58" rx="28" ry="23"/><ellipse cx="28" cy="64" rx="14" ry="12"/><circle cx="68" cy="34" r="9"/><circle cx="48" cy="34" r="8"/>`,
	兔: `<ellipse cx="48" cy="64" rx="23" ry="16"/><path d="M54,54 C48,26 52,6 62,2 C72,10 70,34 66,54 Z"/><path d="M64,54 C64,28 72,12 80,10 C86,20 80,40 72,56 Z"/>`,
	龙: `<path d="M4,62 L22,52 C34,44 52,40 70,44 L76,68 C60,74 36,76 22,72 L8,72 Z"/><path d="M58,44 L62,18 L56,26 M62,18 L70,8 M62,18 L74,24" stroke="currentColor" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M68,44 L74,14 L72,26 L84,18" stroke="currentColor" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M10,70 C4,82 12,92 24,90" stroke="currentColor" stroke-width="3" fill="none"/><path d="M74,46 L94,40 L88,52 L96,56 L80,62 Z"/>`,
	蛇: `<ellipse cx="42" cy="62" rx="30" ry="12" transform="rotate(-6 42 62)"/><path d="M56,58 C70,56 78,62 80,70 L68,76 Z"/>`,
	羊: `<path d="M16,70 C20,52 40,40 62,42 L74,62 C62,76 38,86 22,84 C14,82 12,76 16,70 Z"/><circle cx="66" cy="42" r="15" fill="none" stroke="currentColor" stroke-width="8"/><path d="M22,82 C20,92 24,98 30,96 Z"/>`,
	猴: `<circle cx="56" cy="52" r="23"/><ellipse cx="34" cy="62" rx="13" ry="12"/><circle cx="74" cy="54" r="8"/><path d="M34,44 L50,40" stroke="currentColor" stroke-width="5"/>`,
	鸡: `<circle cx="54" cy="58" r="17"/><path d="M38,54 L22,60 L38,64 Z"/><path d="M42,44 L46,30 L52,40 L56,26 L62,40 L68,30 L70,46 Z"/><ellipse cx="42" cy="74" rx="5" ry="9"/>`,
	狗: `<ellipse cx="52" cy="58" rx="26" ry="18"/><path d="M30,52 L10,58 C8,66 12,72 30,70 Z"/><path d="M60,42 C70,38 76,46 74,58 L70,74 C64,70 60,58 60,42 Z"/>`,
	猪: `<ellipse cx="54" cy="60" rx="27" ry="23"/><ellipse cx="26" cy="62" rx="7" ry="12"/><path d="M58,40 C62,30 74,30 78,38 L66,58 C60,52 58,46 58,40 Z"/>`,
};
K.ZEYE = {鼠: [40, 54], 牛: [38, 50], 虎: [40, 52], 兔: [38, 58], 龙: [36, 52], 蛇: [30, 58], 羊: [36, 56], 猴: [44, 48], 鸡: [50, 54], 狗: [40, 52], 猪: [44, 52]};
K.ZMARK = {虎: `<path d="M56,40 L52,50 M66,44 L60,56 M74,52 L66,62" stroke="#24170f" stroke-width="3" fill="none" opacity=".7"/>`,
	猪: `<ellipse cx="26" cy="62" rx="4" ry="9" fill="#2a1c12"/><circle cx="25" cy="58" r="1.6" fill="#120a06"/><circle cx="25" cy="66" r="1.6" fill="#120a06"/>`,
	牛: `<path d="M18,66 C22,72 30,74 36,72" stroke="#24170f" stroke-width="2.5" fill="none" opacity=".8"/><circle cx="20" cy="60" r="2.2" fill="#24170f"/>`,
	狗: `<circle cx="12" cy="60" r="3" fill="#24170f"/><path d="M12,68 L26,68" stroke="#24170f" stroke-width="2" opacity=".7"/>`,
	鼠: `<path d="M8,66 L-6,62 M8,66 L-6,70" stroke="#3a2a1d" stroke-width="1.2"/>`,
	猴: `<path d="M28,66 C32,70 38,70 42,68" stroke="#24170f" stroke-width="2" fill="none"/>`};
/** a zodiac head; x,y = neck base centre; size = box px; face: -1 left, +1 right */
K.zhead = (kind, x, y, size, face, fill, extra = '', line) => `<g transform="translate(${x},${y}) scale(${(-face) * size / 100},${size / 100}) translate(-70,-100)" fill="${fill}" color="${line ?? (fill.startsWith('url') ? '#5A4230' : fill)}" ${extra}><path d="${NECK}"/>${K.ZODIAC[kind]}${K.ZMARK[kind] ?? ''}<circle cx="${K.ZEYE[kind][0]}" cy="${K.ZEYE[kind][1]}" r="3.4" fill="#140b06"/><circle cx="${K.ZEYE[kind][0] - 1}" cy="${K.ZEYE[kind][1] - 1.2}" r="1.1" fill="#f5e6cc"/></g>`;
/** the robed stone body the heads sit on (seated, profile). x,y = seat base front-centre; h = body height; face as above. Returns {svg, top:[x,y]} */
K.stoneBody = (x, y, h, face, fill, extra = '') => {
	const s = h / 140;
	return {svg: `<g transform="translate(${x},${y}) scale(${(-face) * s},${s}) translate(-50,-140)" fill="${fill}" ${extra}>
		<path d="M52,0 C42,10 32,30 32,54 L12,66 C4,70 2,88 8,96 L12,132 L4,140 L96,140 C100,96 98,40 88,0 Z"/></g>`,
		top: [x + (-face) * (70 - 50) * s, y - 140 * s]};
};

/** rim light as a filter: lights the outer edges facing (−dx, −dy) direction of the light; use on a whole silhouette group */
K.rimFilter = (id, dx, dy, col, w = 1, blur = 1.2) => `<filter id="${id}" filterUnits="userSpaceOnUse" x="-100" y="-100" width="2120" height="1280">
	<feOffset in="SourceAlpha" dx="${dx}" dy="${dy}" result="o"/><feComposite in="SourceAlpha" in2="o" operator="out" result="e"/>
	<feGaussianBlur in="e" stdDeviation="${blur}" result="eb"/><feFlood flood-color="${col}" flood-opacity="${w}"/><feComposite in2="eb" operator="in" result="rim"/>
	<feComposite in="rim" in2="SourceAlpha" operator="in" result="rimIn"/>
	<feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="rimIn"/></feMerge></filter>`;
window.K = K;
/** a cropped foreground viewer in profile (bust), facing f (+1 right). (x, y) = centre of the head, hh = head height (crown→chin). */
K.bust = (x, y, hh, f, col, rimCol, rimAmt = 0.9) => {
	const s = hh / 100, X = (dx) => x + f * dx * s, Y = (dy) => y + dy * s;
	const d = `M${X(-44)},${Y(-10)} C${X(-48)},${Y(-52)} ${X(-10)},${Y(-62)} ${X(18)},${Y(-54)} C${X(38)},${Y(-48)} ${X(46)},${Y(-30)} ${X(46)},${Y(-12)}
	L${X(52)},${Y(2)} L${X(47)},${Y(8)} C${X(49)},${Y(14)} ${X(46)},${Y(18)} ${X(42)},${Y(20)} C${X(42)},${Y(30)} ${X(38)},${Y(38)} ${X(26)},${Y(42)}
	C${X(16)},${Y(44)} ${X(8)},${Y(44)} ${X(4)},${Y(48)} L${X(6)},${Y(70)} C${X(30)},${Y(80)} ${X(70)},${Y(96)} ${X(84)},${Y(130)} L${X(96)},${Y(420)} L${X(-150)},${Y(420)}
	C${X(-150)},${Y(200)} ${X(-120)},${Y(110)} ${X(-60)},${Y(84)} C${X(-40)},${Y(74)} ${X(-30)},${Y(60)} ${X(-30)},${Y(44)} C${X(-40)},${Y(30)} ${X(-46)},${Y(12)} ${X(-44)},${Y(-10)} Z`;
	const id = K.uid('bu');
	return `<defs><filter id="${id}" filterUnits="userSpaceOnUse" x="0" y="0" width="1920" height="1080"><feGaussianBlur stdDeviation="2.5"/></filter></defs>
	<path d="${d}" fill="${col}"/><path d="${d}" fill="none" stroke="${rimCol}" stroke-width="4" opacity="${rimAmt}" filter="url(#${id})" transform="translate(${f * 3},0)" clip-path="none"/>
	<path d="${d}" fill="${col}" transform="translate(${-f * 4},2)"/>`;
};
/** bronze relief: paint a height map (grey = height) inside <g filter="url(#id)">. Light rakes from azimuth az. */
K.reliefFilter = (id, o = {}) => { const az = o.az ?? 225, el = o.el ?? 34, sc = o.sc ?? 10, base = o.base ?? '#6A4A2C', lc = o.lc ?? '#FFE0B8';
	return `<filter id="${id}" filterUnits="userSpaceOnUse" x="0" y="0" width="1920" height="1080" color-interpolation-filters="sRGB">
	<feColorMatrix in="SourceGraphic" type="luminanceToAlpha" result="h0"/>
	<feGaussianBlur in="h0" stdDeviation="${o.soft ?? 2.4}" result="hs"/><feGaussianBlur in="h0" stdDeviation="${o.round ?? 9}" result="hr"/>
	<feComposite in="hs" in2="hr" operator="arithmetic" k2="0.55" k3="0.45" result="h"/>
	<feDiffuseLighting in="h" surfaceScale="${sc}" diffuseConstant="1.2" lighting-color="${lc}" result="dif"><feDistantLight azimuth="${az}" elevation="${el}"/></feDiffuseLighting>
	<feSpecularLighting in="h" surfaceScale="${sc}" specularConstant="0.75" specularExponent="24" lighting-color="#FFEBD0" result="spe"><feDistantLight azimuth="${az}" elevation="${el}"/></feSpecularLighting>
	<feFlood flood-color="${base}" result="base"/>
	<feComposite in="dif" in2="base" operator="arithmetic" k1="1.35" k2="0" k3="0" k4="0" result="lit0"/>
	<feColorMatrix in="h" type="matrix" values="0 0 0 1 0  0 0 0 1 0  0 0 0 1 0  0 0 0 0 1" result="hg"/>
	<feComposite in="lit0" in2="hg" operator="arithmetic" k1="1.1" k2="0.42" result="lit"/>
	<feGaussianBlur in="h0" stdDeviation="7" result="hb"/>
	<feComposite in="hb" in2="h0" operator="arithmetic" k2="2.2" k3="-2.2" result="crev"/>
	<feFlood flood-color="${o.verd ?? '#4E9A86'}" result="vf"/><feComposite in="vf" in2="crev" operator="in" result="verd"/>
	<feTurbulence type="fractalNoise" baseFrequency="0.5" numOctaves="2" seed="11" result="nz"/>
	<feColorMatrix in="nz" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.3 0.85" result="grain"/>
	<feComposite in="spe" in2="lit" operator="arithmetic" k2="0.9" k3="1" result="ls"/>
	<feMerge result="m"><feMergeNode in="ls"/><feMergeNode in="verd"/></feMerge>
	<feComposite in="grain" in2="m" operator="atop" result="g2"/>
	<feMerge><feMergeNode in="m"/><feMergeNode in="g2"/></feMerge></filter>`; };
/** a seated profile figure for height maps / silhouettes; (x, floor) = chair front foot; f facing; h standing height */
K.seated = (x, floor, h, f, col, hands) => {
	const u = h / 8, X = (d) => x + f * d * u, seatY = floor - 2.3 * u, hip = [X(-0.4), seatY - 0.2 * u], knee = [X(1.3), seatY - 0.25 * u], foot = [X(1.35), floor - 0.1 * u];
	const sh = [X(-0.15), seatY - 2.6 * u], head = [X(0.05), seatY - 3.45 * u];
	let s = `<path d="M${X(-1.0)},${floor} L${X(-1.0)},${seatY - 2.4 * u} L${X(-0.82)},${seatY - 2.4 * u} L${X(-0.82)},${seatY} L${X(0.5)},${seatY} L${X(0.5)},${floor} L${X(0.4)},${floor} L${X(0.4)},${seatY + 0.18 * u} L${X(-0.9)},${seatY + 0.18 * u} L${X(-0.9)},${floor} Z" fill="${col}" opacity=".8"/>`;
	s += K.limb([hip, knee, foot], 0.46 * u, 0.36 * u, col);
	s += `<path d="M${X(-0.75)},${seatY} C${X(-0.85)},${seatY - 1.4 * u} ${X(-0.6)},${seatY - 2.5 * u} ${X(-0.2)},${seatY - 2.85 * u} L${X(0.35)},${seatY - 2.6 * u} C${X(0.5)},${seatY - 1.8 * u} ${X(0.45)},${seatY - 0.8 * u} ${X(0.35)},${seatY} Z" fill="${col}"/>`;
	s += `<circle cx="${head[0]}" cy="${head[1]}" r="${0.5 * u}" fill="${col}"/><path d="M${X(0.48)},${head[1] - 0.05 * u} L${X(0.66)},${head[1] + 0.12 * u} L${X(0.46)},${head[1] + 0.22 * u} Z" fill="${col}"/><rect x="${Math.min(X(-0.12), X(0.18))}" y="${head[1] + 0.3 * u}" width="${0.3 * u}" height="${0.6 * u}" fill="${col}"/>`;
	(hands ?? [[X(0.95), seatY - 0.55 * u]]).forEach((t) => { const e = K.two(sh, t, 1.45 * u, 1.35 * u, f > 0 ? -1 : 1); s += K.limb([sh, e, t], 0.3 * u, 0.22 * u, col) + `<circle cx="${t[0]}" cy="${t[1]}" r="${0.22 * u}" fill="${col}"/>`; });
	return s;
};
