// ep45 hero v4 (gate 2b note 1, Route B): the 圆明园 red-copper horse head redrawn as CAST METAL in our flat-vector family.
// Hard-edged tone planes (no airbrush): bone under the skin (nasal ridge plane, cheek plate, brow, jaw), raised veins,
// a flared nostril with its wrinkle fold, the slightly open spout mouth with upper and lower lip, grooved mane locks rooted on
// the crest and lying on the neck (none leave the silhouette), a curled forelock, the near ear folded as one form with the head,
// a cool window-reflection band along the nose ridge and forehead, small hot speculars, a #250B04 core, the cast collar ring.
// Local frame (same as v3 so every placement still holds): faces LEFT; ear tips y≈25; collar bottom y≈950; placement (836, 950), height 925.
// opts: {x, y, h, flip, curl (0 straight / 1 near ear folded), glow, mood: warm|fire|cool, refl (window reflection colour)}
(() => {
const HEAD = `M470,196 C430,250 330,390 250,500 C222,540 196,572 178,600 C150,636 140,676 152,708
C160,728 182,738 206,736 L248,739 C228,748 212,760 216,774 C224,796 262,806 296,796
C350,782 420,772 486,764 C566,754 622,728 652,688 C688,640 700,594 692,552
C702,660 692,800 646,884 L1036,884 C1010,740 962,520 888,380
C836,270 732,190 640,166 C580,150 512,160 470,196 Z`;
const EAR_UP_N = `M502,190 C486,150 490,92 528,24 C562,70 588,122 592,172 Z`;
const EAR_IN_N = `M512,178 C502,140 508,96 528,56 C550,94 564,134 568,172 Z`;
const EAR_FAR = `M572,176 C562,130 578,82 610,34 C632,84 638,132 632,180 Z`;
const EAR_FOLD = `M502,214 C490,170 500,122 518,92 C504,100 488,112 470,132 C462,140 454,136 458,128 C474,98 500,66 528,54 C548,46 568,54 566,76 C576,112 594,152 600,214 Z`;
const EAR_FOLD_IN = `M521,182 C515,146 519,110 529,86 C539,82 549,82 555,86 C559,118 565,150 571,178 Z`;
const EAR_FLAP_UNDER = `M564,70 C566,50 546,44 528,52 C502,62 478,90 461,118 C458,124 464,128 470,122 C490,102 508,88 530,82 C546,78 560,78 564,70 Z`;
const rnd = (i) => { const x = Math.sin(i * 91.7 + 13.3) * 43758.5453; return x - Math.floor(x); };
const P = (p) => p[0].toFixed(1) + ',' + p[1].toFixed(1);
/** the crest (back edge of the neck), poll → collar */
const crest = (t) => { const a = [[640, 166], [732, 190], [836, 270], [888, 380]], b = [[888, 380], [962, 520], [1010, 740], [1036, 884]];
	const bz = (q, u) => { const m = 1 - u; return [0, 1].map((k) => m * m * m * q[0][k] + 3 * m * m * u * q[1][k] + 3 * m * u * u * q[2][k] + u * u * u * q[3][k]); };
	return t < 0.42 ? bz(a, t / 0.42) : bz(b, (t - 0.42) / 0.58); };
/** one mane lock: rooted on the crest at t, falls forward-down across the neck in a heavy S, inside the silhouette */
const lock = (t, len, w, ph, i) => {
	const r = crest(t), r2 = crest(Math.min(1, t + 0.01)); const tang = Math.atan2(r2[1] - r[1], r2[0] - r[0]);
	const inward = tang + Math.PI / 2;                     // pointing into the neck (left of the crest direction)
	const pts = []; let x = r[0] + Math.cos(inward) * 6, y = r[1] + Math.sin(inward) * 6, a = inward - 0.55;
	for (let k = 0; k <= 28; k++) { const s = k / 28; a += 0.035 * Math.sin(6.28 * (s * 0.9 + ph)) + 0.012; x += Math.cos(a) * len / 28; y += Math.sin(a) * len / 28 + 1.2; pts.push([x, y]); }
	const L = [], R = [];
	pts.forEach((p, k) => { const q = pts[Math.min(k + 1, 28)], o = pts[Math.max(k - 1, 0)], dx = q[0] - o[0], dy = q[1] - o[1], d = Math.hypot(dx, dy) || 1;
		const s = k / 28, ww = w * Math.pow(Math.sin(Math.PI * Math.min(1, 0.18 + s * 0.9)), 0.5) * (1 - 0.55 * s) + 1;
		L.push([p[0] - dy / d * ww, p[1] + dx / d * ww]); R.push([p[0] + dy / d * ww, p[1] - dx / d * ww]); });
	const outline = 'M' + L.concat(R.slice().reverse()).map(P).join(' L') + ' Z';
	const grooves = [0.25, 0.5, 0.75].map((f) => 'M' + pts.slice(2, 24).map((p, k) => P([p[0] + (L[k + 2][0] - p[0]) * (1 - 2 * f), p[1] + (L[k + 2][1] - p[1]) * (1 - 2 * f)])).join(' L'));
	return {outline, grooves, top: 'M' + R.slice(1, 22).map(P).join(' L'), bottom: 'M' + L.slice(1, 26).map(P).join(' L')};
};
const LOCKS = [];
for (let layer = 0; layer < 3; layer++) for (let i = 0; i < 9 - layer; i++) {
	const t = 0.1 + (i + 0.45 * layer + 0.25 * rnd(i + layer * 20)) / (9 - layer) * 0.84;
	LOCKS.push({layer, ...lock(t, (layer === 0 ? 250 : layer === 1 ? 210 : 160) * (0.85 + 0.3 * rnd(i * 3 + layer)) * (1 - 0.3 * t), layer === 0 ? 40 : layer === 1 ? 34 : 28, 0.15 + 0.2 * rnd(i * 7 + layer), i)});
}
const FORELOCK = [[556, 186, 2.5, 70, 18], [576, 182, 2.65, 60, 15], [538, 194, 2.4, 56, 13]].map(([x, y, h, L, W]) => {
	const pts = []; let px = x, py = y, a = h;
	for (let k = 0; k <= 20; k++) { const s = k / 20; a += (s > 0.5 ? -0.07 : 0.01); px += Math.cos(a) * L / 20; py += Math.sin(a) * L / 20; pts.push([px, py]); }
	const Lr = [], Rr = []; pts.forEach((p, k) => { const q = pts[Math.min(k + 1, 20)], o = pts[Math.max(k - 1, 0)], dx = q[0] - o[0], dy = q[1] - o[1], d = Math.hypot(dx, dy) || 1, ww = W * (1 - 0.7 * k / 20) + 1;
		Lr.push([p[0] - dy / d * ww, p[1] + dx / d * ww]); Rr.push([p[0] + dy / d * ww, p[1] - dx / d * ww]); });
	return {d: 'M' + Lr.concat(Rr.reverse()).map(P).join(' L') + ' Z', g: 'M' + pts.slice(2, 16).map(P).join(' L')}; });

K.horseHead = (o = {}) => {
	const id = K.uid('h'), x = o.x ?? 960, y = o.y ?? 900, h = o.h ?? 400, s = h / 925, flip = o.flip ? -1 : 1;
	const curl = o.curl ?? 1, glow = o.glow ?? 0.6, mood = o.mood ?? 'warm', refl = o.refl ?? '#BFD0CC';
	const C = {
		warm: {hi: '#FFD9A6', lite: '#E8874A', mid: '#B4532A', deep: '#6A2612', dark: '#250B04', spec: '#FFF6E6'},
		fire: {hi: '#FFE2A0', lite: '#F28C44', mid: '#B85224', deep: '#68240D', dark: '#230A03', spec: '#FFF4CC'},
		cool: {hi: '#F6D3AE', lite: '#D57C4C', mid: '#9E4828', deep: '#5A2415', dark: '#220C06', spec: '#FFF6EA'},
	}[mood];
	const U = `filterUnits="userSpaceOnUse" x="-400" y="-400" width="2000" height="1900"`;
	const lockSvg = (L) => `
		<path d="${L.outline}" fill="${L.layer === 2 ? C.mid : L.layer === 1 ? C.deep : C.dark}"/>
		<path d="${L.top}" stroke="${L.layer === 2 ? C.hi : C.lite}" stroke-width="${L.layer === 2 ? 5 : 4}" fill="none" stroke-linecap="round" opacity="${L.layer === 0 ? 0.55 : 0.9}"/>
		${L.grooves.map((g, k) => `<path d="${g}" stroke="${C.dark}" stroke-width="${k === 1 ? 3.4 : 2.4}" fill="none" stroke-linecap="round" opacity=".9"/><path d="${g}" stroke="${C.lite}" stroke-width="1.6" fill="none" transform="translate(-1.5,-2)" opacity="${L.layer === 2 ? 0.55 : 0.3}"/>`).join('')}
		<path d="${L.bottom}" stroke="${C.dark}" stroke-width="5" fill="none" opacity=".95"/>`;
	const defs = `<defs><clipPath id="${id}c"><path d="${HEAD}"/></clipPath>
	<radialGradient id="${id}glow"><stop offset="0" stop-color="${o.glowCol ?? '#FF9A5A'}" stop-opacity="${0.5 * glow}"/><stop offset=".45" stop-color="${o.glowCol ?? '#FF8A50'}" stop-opacity="${0.2 * glow}"/><stop offset="1" stop-color="${o.glowCol ?? '#FF8A50'}" stop-opacity="0"/></radialGradient>
	<linearGradient id="${id}col" gradientUnits="userSpaceOnUse" x1="0" y1="866" x2="0" y2="956"><stop offset="0" stop-color="${C.deep}"/><stop offset=".2" stop-color="${C.hi}"/><stop offset=".38" stop-color="${C.lite}"/><stop offset=".75" stop-color="${C.mid}"/><stop offset="1" stop-color="${C.dark}"/></linearGradient>
	<filter id="${id}pat" ${U}><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7"/><feColorMatrix type="matrix" values="0 0 0 0 0.12  0 0 0 0 0.04  0 0 0 0 0.01  0 0 0 -2.4 1.3"/></filter>
	</defs>`;
	const ear = curl > 0.5
		? `<path d="${EAR_FOLD}" fill="${C.mid}"/><path d="${EAR_FOLD_IN}" fill="${C.dark}"/>
		   <path d="M548,214 C540,176 546,140 560,112" stroke="${C.hi}" stroke-width="4" fill="none"/>
		   <path d="${EAR_FLAP_UNDER}" fill="${C.deep}"/>
		   <path d="M560,112 C574,108 584,110 588,118" stroke="${C.spec}" stroke-width="6" fill="none" stroke-linecap="round"/>
		   <path d="M560,112 C540,116 516,130 498,152" stroke="${C.hi}" stroke-width="4" fill="none" stroke-linecap="round"/>
		   <path d="M508,160 C530,144 556,130 586,118" stroke="${C.dark}" stroke-width="4" fill="none"/>`
		: `<path d="${EAR_UP_N}" fill="${C.mid}"/><path d="${EAR_IN_N}" fill="${C.dark}"/><path d="M548,214 C536,160 552,96 590,40" stroke="${C.hi}" stroke-width="4" fill="none"/><path d="M590,40 C606,80 614,120 616,160" stroke="${C.deep}" stroke-width="5" fill="none"/>`;
	const body = `
	${glow > 0 ? `<ellipse cx="600" cy="520" rx="680" ry="620" fill="url(#${id}glow)"/>` : ''}
	<path d="${EAR_FAR}" fill="${C.deep}"/><path d="M584,160 C584,116 594,76 610,46" stroke="${C.mid}" stroke-width="5" fill="none"/>
	<path d="${HEAD}" fill="${C.mid}"/>
	<g clip-path="url(#${id}c)">
		<rect x="100" y="100" width="1000" height="860" filter="url(#${id}pat)" opacity=".16"/>
		<!-- shadow side: under the jaw and the throat; the neck's far half; a #250B04 core along the jaw -->
		<path d="M216,774 C300,800 420,772 486,764 C566,754 622,728 652,688 C688,640 700,594 692,552 C700,660 694,780 660,884 L560,884 C590,820 600,790 560,800 C460,820 330,830 220,812 Z" fill="${C.deep}"/>
		<path d="M260,800 C360,796 440,782 500,778 C580,770 640,736 668,680 C676,720 674,760 664,800 C640,780 600,792 540,804 C440,822 340,824 260,812 Z" fill="${C.dark}"/>
		<path d="M760,884 C740,760 720,660 700,600 C790,640 880,740 940,884 Z" fill="${C.deep}" opacity=".7"/>
		<!-- the lit face plane: forehead and the long nasal bone, a hard lower edge -->
		<path d="M640,166 C580,150 512,160 470,196 C430,250 330,390 250,500 C222,540 196,572 178,600 L214,612 C246,566 300,492 352,420 C400,352 446,292 490,250 C530,212 580,188 640,186 Z" fill="${C.lite}"/>
		<path d="M214,612 C246,566 300,492 352,420 C400,352 446,292 490,250" stroke="${C.deep}" stroke-width="9" fill="none"/>
		<!-- the window's cool reflection: a crisp band along the ridge and the forehead -->
		<path d="M612,168 C560,166 512,180 482,206 C444,256 352,384 268,500 C244,534 222,562 202,590 L190,584 C212,554 234,524 258,490 C340,374 432,244 472,196 C506,166 556,154 612,160 Z" fill="${refl}" opacity=".8"/>
		<!-- cheek: a broad flat plate between the facial crest and the jaw, hard-edged, a step lighter; its top edge catches the lamp -->
		<path d="M470,430 C520,440 580,470 630,520 C660,560 664,620 650,672 C600,716 520,740 440,744 C400,720 380,660 392,600 C404,540 430,470 470,430 Z" fill="${C.lite}" opacity=".32"/>
		<path d="M470,430 C520,440 580,470 630,520" stroke="${C.hi}" stroke-width="5" fill="none" stroke-linecap="round" opacity=".9"/>
		<path d="M392,600 C380,660 400,720 440,744" stroke="${C.deep}" stroke-width="8" fill="none" opacity=".8"/>
		<!-- facial crest: from below/behind the eye back to the jowl (no line from the eye corner) -->
		<path d="M500,372 C524,410 540,446 556,462" stroke="${C.hi}" stroke-width="5" fill="none" stroke-linecap="round"/>
		<path d="M504,380 C528,418 544,454 562,470" stroke="${C.dark}" stroke-width="4" fill="none" transform="translate(4,6)"/>
		<!-- raised veins -->
		${['M430,410 C410,450 392,490 380,540 C372,570 360,600 340,628', 'M470,470 C452,510 440,550 436,600', 'M320,560 C306,590 288,616 266,640'].map((d) => `<path d="${d}" stroke="${C.dark}" stroke-width="7" fill="none" transform="translate(3,4)" stroke-linecap="round"/><path d="${d}" stroke="${C.hi}" stroke-width="3.6" fill="none" stroke-linecap="round" opacity=".9"/>`).join('')}
		<!-- muzzle: nose bulb plane, the flared comma nostril with its wrinkle fold, the open spout mouth with both lips -->
		<path d="M152,708 C146,670 160,636 186,618 C214,600 248,606 262,632 C276,660 268,696 246,716 C224,734 186,738 166,728 Z" fill="${C.lite}" opacity=".8"/>
		<path d="M226,628 C204,628 184,646 180,670 C178,684 186,690 196,686 C194,672 200,656 214,646 C226,638 242,638 250,644 C246,634 238,628 226,628 Z" fill="${C.dark}"/>
		<path d="M250,644 C258,662 254,684 240,698" stroke="${C.hi}" stroke-width="5" fill="none" stroke-linecap="round"/>
		<path d="M236,600 C258,592 280,602 290,622" stroke="${C.dark}" stroke-width="4" fill="none"/><path d="M234,594 C256,586 278,596 288,614" stroke="${C.hi}" stroke-width="2.5" fill="none" opacity=".8"/>
		<path d="M152,708 C160,728 182,738 206,736 L248,739 C228,748 212,760 216,774 C226,766 240,758 262,754 C246,746 236,744 232,744 Z" fill="${C.dark}"/>
		<path d="M160,716 C176,730 192,734 210,734" stroke="${C.hi}" stroke-width="3" fill="none" opacity=".8"/>
		<path d="M222,786 C246,796 272,796 296,790" stroke="${C.hi}" stroke-width="4" fill="none" stroke-linecap="round" opacity=".85"/>
		<path d="M218,778 C240,790 270,792 296,786" stroke="${C.dark}" stroke-width="3" fill="none" opacity=".7" transform="translate(0,8)"/>
		<!-- brow ridge + eye socket (hard planes) -->
		<path d="M404,316 C424,270 474,250 528,262 C506,272 474,282 448,304 C430,318 418,326 404,316 Z" fill="${C.hi}"/>
		<path d="M408,326 C432,302 466,288 508,286 C534,290 548,306 550,326 C522,314 484,316 444,336 C426,344 414,340 408,326 Z" fill="${C.dark}"/>
		<!-- the neck: a lit muscle plane, the throat groove -->
		<path d="M720,330 C800,420 852,560 870,760 C874,820 872,860 868,884 L780,884 C784,780 776,680 752,580 C736,510 712,440 690,390 Z" fill="${C.lite}" opacity=".6"/>
		<path d="M700,600 C708,700 704,800 684,884" stroke="${C.dark}" stroke-width="12" fill="none"/>
		<!-- the mane -->
		${LOCKS.filter((L) => L.layer === 0).map(lockSvg).join('')}
		${LOCKS.filter((L) => L.layer === 1).map(lockSvg).join('')}
		${LOCKS.filter((L) => L.layer === 2).map(lockSvg).join('')}
		${FORELOCK.map((f) => `<path d="${f.d}" fill="${C.dark}" transform="translate(3,6)"/><path d="${f.d}" fill="${C.mid}"/><path d="${f.g}" stroke="${C.dark}" stroke-width="3" fill="none"/><path d="${f.g}" stroke="${C.hi}" stroke-width="2" fill="none" transform="translate(-3,-2)" opacity=".7"/>`).join('')}
		<!-- crisp hot speculars -->
		<path d="M462,232 C446,250 434,266 424,282" stroke="${C.spec}" stroke-width="7" fill="none" stroke-linecap="round"/>
		<path d="M330,410 C316,432 302,452 290,472" stroke="${C.spec}" stroke-width="5" fill="none" stroke-linecap="round"/>
		<path d="M200,632 C192,640 186,650 182,660" stroke="${C.spec}" stroke-width="6" fill="none" stroke-linecap="round"/>
		<path d="M470,500 C500,482 536,474 568,478" stroke="${C.spec}" stroke-width="4" fill="none" stroke-linecap="round"/>
	</g>
	<path d="M640,166 C580,150 512,160 470,196 C430,250 330,390 250,500 C222,540 196,572 178,600" stroke="${C.hi}" stroke-width="4" fill="none" opacity=".9"/>
	<path d="M216,774 C224,796 262,806 296,796 C350,782 420,772 486,764 C566,754 622,728 652,688" stroke="${C.dark}" stroke-width="5" fill="none"/>
	${curl > 0.5
		? `<path d="${EAR_FOLD}" fill="${C.mid}"/><path d="${EAR_FOLD_IN}" fill="${C.dark}"/><path d="${EAR_FLAP_UNDER}" fill="${C.deep}"/>
		   <path d="M502,214 C490,170 500,122 518,92" stroke="${C.hi}" stroke-width="4" fill="none"/>
		   <path d="M566,74 C568,54 548,46 528,54 C500,66 476,96 460,124" stroke="${C.spec}" stroke-width="6" fill="none" stroke-linecap="round"/>
		   <path d="M590,180 C578,148 568,110 566,76" stroke="${C.dark}" stroke-width="5" fill="none"/>`
		: `<path d="${EAR_UP_N}" fill="${C.mid}"/><path d="${EAR_IN_N}" fill="${C.dark}"/><path d="M503,186 C490,150 494,96 526,32" stroke="${C.hi}" stroke-width="4" fill="none"/>`}
	<ellipse cx="468" cy="324" rx="39" ry="25" transform="rotate(-22 468 324)" fill="${C.mid}"/>
	<path d="M428,334 C444,302 482,290 512,302" stroke="${C.lite}" stroke-width="8" fill="none" stroke-linecap="round"/>
	<path d="M434,342 C458,352 490,344 506,324" stroke="${C.dark}" stroke-width="6" fill="none" stroke-linecap="round"/>
	<ellipse cx="474" cy="323" rx="14" ry="12" transform="rotate(-22 474 323)" fill="${C.deep}"/>
	<ellipse cx="474" cy="323" rx="14" ry="12" transform="rotate(-22 474 323)" fill="none" stroke="${C.dark}" stroke-width="5"/>
	<path d="M448,316 C454,308 462,304 472,304" stroke="${C.spec}" stroke-width="4" fill="none" stroke-linecap="round"/>
	<path d="M632,878 C624,898 624,922 634,944 C710,960 970,960 1048,944 C1058,922 1058,898 1050,878 C970,866 710,866 632,878 Z" fill="url(#${id}col)"/>
	<path d="M632,878 C710,866 970,866 1050,878" stroke="${C.spec}" stroke-width="3" fill="none"/>
	<path d="M660,906 L730,906" stroke="${refl}" stroke-width="5" opacity=".7"/>`;
	return `<g transform="translate(${x},${y}) scale(${flip * s},${s}) translate(-836,-950)">${defs}${body}</g>`;
};
K.HEAD_PTS = {mouth: [228 - 836, 744 - 950], eye: [470 - 836, 322 - 950], ear: [470 - 836, 120 - 950], nose: [150 - 836, 680 - 950],
	poll: [560 - 836, 180 - 950], collarF: [632 - 836, 900 - 950], collarB: [1050 - 836, 900 - 950], throat: [690 - 836, 700 - 950], height: 925};
K.headPt = (o, name) => { const s = (o.h ?? 400) / 925, f = o.flip ? -1 : 1, p = K.HEAD_PTS[name]; return [o.x + f * p[0] * s, o.y + p[1] * s]; };
})();
