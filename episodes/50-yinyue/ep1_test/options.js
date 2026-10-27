// Layout and style options for one moment: storyboard shot 9, beat 2 of 「咚 · 哒」 (snare cat hits, drummer rests).
// Runs in the page after page.js (uses cat, kickDrum, snareDrum, hatStand, bassGtr, C, F, clamp, lerp).
const KICK = [1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0], SNARE = [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0], NOW = 4;
const HEAD = '第 2、4 拍，加一声「哒」', KW = '哒';
const headline = (x, y, ink, accent, size = 110, extra = '') => {
	const [a, b] = HEAD.split(KW);
	return `<text x="${x}" y="${y}" ${F} font-size="${size}" font-weight="900" fill="${ink}" ${extra}>${a}<tspan fill="${accent}">${KW}</tspan>${b}</text>`;
};
const onoma = (x, y, w, ink, accent, size = 46) => ['咚', '哒', '咚', '哒'].map((s, i) =>
	`<text x="${x + i * w + w / 2}" y="${y}" text-anchor="middle" ${F} font-size="${size}" font-weight="900" fill="${i === 1 ? accent : ink}" opacity="${i === 1 ? 1 : .55}">${s}</text>`).join('');
const band2 = (dx = 0, dy = 0, s = 1, furs = ['#F2A65A', '#F4F0EA']) =>
	cat({ x: 420 + dx, y: 560 + dy, s: .6 * s, fur: furs[0], belly: '#FFE6C8', ear: '#F7B7A6', hit: 0 }) + kickDrum(420 + dx, 770 + dy, .62 * s, 0, false)
	+ cat({ x: 800 + dx, y: 560 + dy, s: .6 * s, fur: furs[1], belly: '#FFFFFF', ear: '#F3A39A', hit: 1 }) + snareDrum(800 + dx, 760 + dy, .7 * s, 1);

// ---------------------------------------------------------------- layouts (same simple dusk palette, so only the layout differs)
const DUSK = `<defs><linearGradient id="dusk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3B3F8C"/><stop offset=".7" stop-color="#7A5AA8"/><stop offset="1" stop-color="#D98AA0"/></linearGradient></defs>
<rect width="1920" height="1080" fill="url(#dusk)"/><path d="M0 880 Q960 830 1920 880 L1920 1080 L0 1080Z" fill="#2A2350"/>`;
function cellBox(x, y, w, i, { fill = '#2A2E66', line = '#5A5FA8', hot = '#FFC25C', r = 22 } = {}) {
	const on = i === NOW, hits = [KICK[i] && C.k, SNARE[i] && C.s].filter(Boolean);
	let s = `<rect x="${x}" y="${y}" width="${w}" height="${w}" rx="${r}" fill="${on ? '#3B4190' : fill}" stroke="${on ? hot : line}" stroke-width="${on ? 7 : 3}"/>`;
	hits.forEach((c) => { s += `<circle cx="${x + w / 2}" cy="${y + w / 2}" r="${w * .28 * (on ? 1.25 : 1)}" fill="${c}"/>`; if (on) s += `<circle cx="${x + w / 2}" cy="${y + w / 2}" r="${w * .45}" fill="none" stroke="${c}" stroke-width="5" opacity=".6"/>`; });
	return s;
}
const LAYOUTS = {
	L1_stage_and_grid: () => {   // band left, 4x4 cells right (one row = one beat)
		let s = DUSK + band2(-120);
		for (let i = 0; i < 16; i++) s += cellBox(1150 + (i % 4) * 168, 300 + Math.floor(i / 4) * 168, 150, i);
		s += onoma(1150, 1010, 168, '#F4EEE2', C.s, 44) + headline(120, 190, '#F4EEE2', '#FFC25C');
		return s;
	},
	L2_clock_ring: () => {   // 16 cells on a ring around the band; a hand sweeps round like a clock
		let s = DUSK;
		const cx = 1240, cy = 670, R = 320;
		s += `<circle cx="${cx}" cy="${cy}" r="${R}" fill="#2A2E66" fill-opacity=".35" stroke="#5A5FA8" stroke-width="3" stroke-dasharray="4 14"/>`;
		const a = -Math.PI / 2 + NOW / 16 * 2 * Math.PI;
		s += `<path d="M${cx} ${cy} L${cx} ${cy - R} A${R} ${R} 0 0 1 ${cx + R * Math.cos(a)} ${cy + R * Math.sin(a)}Z" fill="#FFC25C" opacity=".12"/>`;
		for (let i = 0; i < 16; i++) { const b = -Math.PI / 2 + i / 16 * 2 * Math.PI, x = cx + R * Math.cos(b), y = cy + R * Math.sin(b);
			s += `<g transform="translate(${x - 50} ${y - 50})">${cellBox(0, 0, 100, i, { r: 50 })}</g>`;
			if (i % 4 === 0) s += `<text x="${cx + (R + 100) * Math.cos(b)}" y="${cy + (R + 100) * Math.sin(b) + 16}" text-anchor="middle" ${F} font-size="44" font-weight="900" fill="#F4EEE2" opacity=".75">${['咚', '哒', '咚', '哒'][i / 4]}</text>`; }
		s += `<g transform="translate(${cx} ${cy + 20}) scale(.58) translate(-610 -620)">${band2()}</g>`;
		s += headline(120, 170, '#F4EEE2', '#FFC25C', 96);
		return s;
	},
	L3_band_house: () => {   // a house cut open: one floor per instrument, 16 windows per floor that light on hits
		let s = DUSK;
		const X0 = 120, X1 = 1800, floors = [['b', '贝斯'], ['h', '镲'], ['s', '军鼓'], ['k', '底鼓']], FH = 170, Y0 = 300;
		s += `<path d="M${X0 - 30} ${Y0} L960 ${Y0 - 120} L${X1 + 30} ${Y0}Z" fill="#2A2350"/>`;
		floors.forEach(([k, n], f) => {
			const y = Y0 + f * FH, active = k === 'k' || k === 's';
			s += `<rect x="${X0}" y="${y}" width="${X1 - X0}" height="${FH}" fill="${active ? '#3A3570' : '#2A2656'}" stroke="#1A1433" stroke-width="6"/>`;
			s += `<text x="${X0 + 20}" y="${y + 44}" ${F} font-size="30" font-weight="900" fill="${C[k]}">${n}</text>`;
			const pat = k === 'k' ? KICK : k === 's' ? SNARE : Array(16).fill(0);
			for (let i = 0; i < 16; i++) { const wx = X0 + 330 + i * 84 + Math.floor(i / 4) * 16, on = pat[i], cur = i === NOW;
				s += `<rect x="${wx}" y="${y + 40}" width="64" height="96" rx="8" fill="${on ? C[k] : '#1C1A40'}" opacity="${on ? (cur ? 1 : .75) : 1}" stroke="${cur ? '#FFC25C' : '#4A4690'}" stroke-width="${cur ? 6 : 2}"/>`;
				if (on && cur) s += `<rect x="${wx - 10}" y="${y + 30}" width="84" height="116" rx="12" fill="${C[k]}" opacity=".25"/>`; }
		});
		// cats in their rooms (left end of each floor)
		s += `<g transform="translate(250 ${Y0 + 3 * FH + 110}) scale(.28) translate(-420 -600)">${cat({ x: 420, y: 560, s: 1, fur: '#F2A65A', belly: '#FFE6C8', ear: '#F7B7A6', hit: 0 })}${kickDrum(420, 770, 1, 0, false)}</g>`;
		s += `<g transform="translate(250 ${Y0 + 2 * FH + 110}) scale(.28) translate(-800 -600)">${cat({ x: 800, y: 560, s: 1, fur: '#F4F0EA', belly: '#FFFFFF', ear: '#F3A39A', hit: 1 })}${snareDrum(800, 760, 1.1, 1)}</g>`;
		s += headline(120, 150, '#F4EEE2', '#FFC25C', 96) + onoma(X0 + 330, 1040, 352, '#F4EEE2', C.s, 40);
		return s;
	},
	L4_light_up_floor: () => {   // the band stands on a 4x4 dance floor in perspective; tiles light as the beat walks across
		let s = DUSK + `<path d="M0 640 L1920 640 L1920 1080 L0 1080Z" fill="#2A2350"/>`;
		const P = (u, v) => { const y = 690 + 360 * v, half = 430 + 470 * v; return [1060 - half + u * 2 * half, y]; };
		for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) { const i = r * 4 + c, g = .04;
			const a = P(c / 4 + g, r / 4 + g), b = P((c + 1) / 4 - g, r / 4 + g), d = P((c + 1) / 4 - g, (r + 1) / 4 - g), e = P(c / 4 + g, (r + 1) / 4 - g);
			const on = i === NOW, hit = KICK[i] ? C.k : SNARE[i] ? C.s : null;
			s += `<path d="M${a} L${b} L${d} L${e}Z" fill="${hit ? hit : '#2A2E66'}" opacity="${hit ? (on ? 1 : .55) : 1}" stroke="${on ? '#FFC25C' : '#5A5FA8'}" stroke-width="${on ? 8 : 3}"/>`; }
		for (let r = 0; r < 4; r++) { const [x, y] = P(-0.03, r / 4 + .14); s += `<text x="${x}" y="${y + 16}" text-anchor="end" ${F} font-size="44" font-weight="900" fill="#F4EEE2" opacity=".7">${r + 1}</text>`; }
		s += `<g transform="translate(1060 700) scale(.62) translate(-610 -800)">${band2()}</g>`;
		s += headline(120, 170, '#F4EEE2', '#FFC25C', 96);
		return s;
	},
};

// ---------------------------------------------------------------- styles (all in layout L1, so only the look differs)
function gridL1(cell, x0 = 1150, y0 = 300, w = 150, g = 18) { let s = ''; for (let i = 0; i < 16; i++) s += cell(x0 + (i % 4) * (w + g), y0 + Math.floor(i / 4) * (w + g), w, i); return s; }
const STYLES = {
	S1_puppet_theatre: () => {   // warm wooden puppet theatre: velvet curtains, footlights, felt cats, wooden blocks
		let s = `<defs><linearGradient id="wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5A1F24"/><stop offset="1" stop-color="#8E3A34"/></linearGradient>
		<linearGradient id="wood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#C98A4B"/><stop offset="1" stop-color="#7A4A26"/></linearGradient>
		<radialGradient id="foot" cx=".5" cy="1" r=".8"><stop offset="0" stop-color="#FFD58A" stop-opacity=".75"/><stop offset="1" stop-color="#FFD58A" stop-opacity="0"/></radialGradient>
		<filter id="felt" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="1.8" numOctaves="2" seed="3" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="7" result="d"/><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="3" seed="8" result="n2"/><feColorMatrix in="n2" type="matrix" values="0 0 0 0 .78  0 0 0 0 .74  0 0 0 0 .7  1.4 0 0 0 0" result="g"/><feComposite in="g" in2="d" operator="in" result="gi"/><feBlend in="d" in2="gi" mode="multiply" result="m"/><feGaussianBlur in="m" stdDeviation=".6" result="mb"/><feDropShadow in="mb" dx="0" dy="8" stdDeviation="8" flood-color="#2A0E0E" flood-opacity=".5"/></filter>
		<filter id="soft"><feDropShadow dx="0" dy="10" stdDeviation="10" flood-color="#2A0E0E" flood-opacity=".5"/></filter></defs>
		<rect width="1920" height="1080" fill="url(#wall)"/>`;
		for (let i = 0; i < 24; i++) s += `<rect x="${i * 80}" y="0" width="40" height="1080" fill="#000" opacity=".06"/>`;
		s += `<ellipse cx="620" cy="900" rx="900" ry="420" fill="url(#foot)"/>`;
		s += `<rect x="0" y="880" width="1920" height="200" fill="url(#wood)"/>` + [...Array(12).keys()].map((i) => `<line x1="0" y1="${900 + i * 15}" x2="1920" y2="${904 + i * 15}" stroke="#5A3418" stroke-width="2" opacity=".35"/>`).join('');
		for (let i = 0; i < 9; i++) s += `<ellipse cx="${80 + i * 220}" cy="890" rx="40" ry="12" fill="#FFE7A8"/><ellipse cx="${80 + i * 220}" cy="880" rx="90" ry="40" fill="#FFE7A8" opacity=".25"/>`;
		const curtain = (x, flip) => `<g transform="translate(${x} 0) scale(${flip} 1)"><path d="M0 0 L300 0 C260 300 220 600 140 1080 L0 1080Z" fill="#A3232B"/>${[40, 100, 170, 230].map((cx) => `<path d="M${cx} 0 C${cx - 20} 400 ${cx - 40} 700 ${cx - 70} 1080" stroke="#6E1219" stroke-width="16" fill="none" opacity=".6"/>`).join('')}</g>`;
		s += curtain(0, 1) + curtain(1920, -1) + `<path d="M0 0 L1920 0 L1920 90 C1600 150 1280 90 960 140 C640 90 320 150 0 90Z" fill="#8A1A22"/><path d="M0 90 C320 150 640 90 960 140 C1280 90 1600 150 1920 90" stroke="#E8B04A" stroke-width="8" fill="none"/>`;
		s += `<g filter="url(#felt)">${band2(-60, 10)}</g>`;
		s += `<g filter="url(#soft)">${gridL1((x, y, w, i) => { const on = i === NOW, h = KICK[i] ? C.k : SNARE[i] ? C.s : null;
			return `<rect x="${x}" y="${y}" width="${w}" height="${w}" rx="14" fill="${on ? '#E8B97A' : '#C98A4B'}" stroke="${on ? '#FFE7A8' : '#6E4220'}" stroke-width="${on ? 8 : 4}"/><rect x="${x + 10}" y="${y + 10}" width="${w - 20}" height="${w - 20}" rx="10" fill="none" stroke="#6E4220" stroke-width="2" opacity=".5"/>`
				+ (h ? `<circle cx="${x + w / 2}" cy="${y + w / 2}" r="${w * .3}" fill="${h}" stroke="#4A2A12" stroke-width="5"/>` : ''); }, 1180, 260)}</g>`;
		s += headline(340, 230, '#FFF1DA', '#FFC25C', 100, 'filter="url(#soft)"') + onoma(1180, 980, 168, '#FFF1DA', '#FFC25C', 44);
		return s;
	},
	S2_neon_rooftop: () => {   // rooftop at dusk, city behind, cells as neon tubes, cats rim-lit
		let s = `<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2B2D7A"/><stop offset=".55" stop-color="#C2508F"/><stop offset="1" stop-color="#FF9A5C"/></linearGradient>
		<filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="9" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
		<filter id="rim"><feDropShadow dx="-6" dy="-4" stdDeviation="6" flood-color="#FF7AD9" flood-opacity=".8"/></filter></defs>
		<rect width="1920" height="1080" fill="url(#sky)"/><circle cx="1500" cy="640" r="150" fill="#FFD08A" opacity=".85"/>`;
		let x = 0; const r = (i) => ((i * 9301 + 49297) % 233280) / 233280;
		for (let i = 0; x < 1920; i++) { const w = 70 + r(i) * 120, h = 140 + r(i + 7) * 330; s += `<rect x="${x}" y="${860 - h}" width="${w}" height="${h}" fill="#2A1E52"/>`;
			for (let k = 0; k < 10; k++) if (r(i * 13 + k) > .55) s += `<rect x="${x + 12 + (k % 3) * 22}" y="${860 - h + 24 + Math.floor(k / 3) * 40}" width="12" height="18" fill="#FFD08A" opacity=".8"/>`; x += w + 6; }
		s += `<rect x="0" y="860" width="1920" height="220" fill="#1C1538"/><line x1="0" y1="860" x2="1920" y2="860" stroke="#FF7AD9" stroke-width="3" opacity=".6"/>`;
		for (let i = 0; i < 20; i++) s += `<circle cx="${60 + i * 98}" cy="${200 + Math.sin(i) * 30}" r="7" fill="#FFE7A8" filter="url(#glow)"/>`;
		s += `<path d="M0 ${200} ${[...Array(20).keys()].map((i) => `L${60 + i * 98} ${200 + Math.sin(i) * 30}`).join(' ')} L1920 210" stroke="#1C1538" stroke-width="2" fill="none"/>`;
		s += `<g filter="url(#rim)">${band2(-60)}</g>`;
		s += `<g filter="url(#glow)">${gridL1((x, y, w, i) => { const on = i === NOW, h = KICK[i] ? C.k : SNARE[i] ? C.s : null;
			return `<rect x="${x}" y="${y}" width="${w}" height="${w}" rx="28" fill="#1C1538" fill-opacity=".55" stroke="${on ? '#FFF1A8' : '#45D6E8'}" stroke-width="${on ? 7 : 4}" stroke-opacity="${on ? 1 : .6}"/>`
				+ (h ? `<circle cx="${x + w / 2}" cy="${y + w / 2}" r="${w * .26}" fill="none" stroke="${h}" stroke-width="${on ? 12 : 8}"/>` : ''); })}</g>`;
		s += headline(120, 190, '#FFF4F8', '#FFE45C', 104, 'filter="url(#rim)"') + onoma(1150, 1010, 168, '#FFF4F8', '#FFE45C', 44);
		return s;
	},
	S3_paper_diorama: () => {   // layered paper cut-outs with soft shadows, daylight pastels, paper grain
		let s = `<defs><filter id="cut" x="-10%" y="-10%" width="120%" height="130%"><feMorphology in="SourceAlpha" operator="dilate" radius="9" result="dil"/><feFlood flood-color="#FFFDF7"/><feComposite in2="dil" operator="in" result="border"/><feMerge result="mm"><feMergeNode in="border"/><feMergeNode in="SourceGraphic"/></feMerge><feDropShadow dx="0" dy="14" stdDeviation="10" flood-color="#5A4030" flood-opacity=".35"/></filter>
		<filter id="ps" x="-10%" y="-10%" width="120%" height="130%"><feDropShadow dx="0" dy="12" stdDeviation="9" flood-color="#5A4030" flood-opacity=".28"/></filter>
		<filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="1" seed="9"/><feColorMatrix values="0 0 0 0 .4  0 0 0 0 .3  0 0 0 0 .2  0 0 0 .1 0"/><feComposite in2="SourceGraphic" operator="in"/><feBlend in2="SourceGraphic" mode="multiply"/></filter></defs>
		<rect width="1920" height="1080" fill="#F7E6CF"/>`;
		const layer = (d, c) => `<path d="${d}" fill="${c}" filter="url(#ps)"/>`;
		s += `<g filter="url(#grain)"><rect width="1920" height="1080" fill="#F7E6CF"/>
		<circle cx="1620" cy="200" r="110" fill="#FFC26B" filter="url(#ps)"/>
		${layer('M0 560 C300 460 620 520 900 500 C1200 480 1500 420 1920 480 L1920 1080 L0 1080Z', '#F3B8A5')}
		${layer('M0 700 C400 620 800 680 1200 650 C1500 630 1700 600 1920 640 L1920 1080 L0 1080Z', '#E8907E')}
		${layer('M0 860 C500 820 1000 850 1920 830 L1920 1080 L0 1080Z', '#7FB7A6')}
		${[[260, 220], [520, 160], [1060, 240]].map(([x, y]) => `<g filter="url(#ps)"><ellipse cx="${x}" cy="${y}" rx="110" ry="40" fill="#FFF8EE"/><ellipse cx="${x + 60}" cy="${y - 25}" rx="70" ry="45" fill="#FFF8EE"/></g>`).join('')}</g>`;
		s += `<g filter="url(#cut)">${band2(-60)}</g>`;
		s += gridL1((x, y, w, i) => { const on = i === NOW, h = KICK[i] ? C.k : SNARE[i] ? C.s : null;
			return `<g filter="url(#ps)" transform="rotate(${((i * 37) % 7) - 3} ${x + w / 2} ${y + w / 2})"><rect x="${x}" y="${y - (on ? 14 : 0)}" width="${w}" height="${w}" rx="10" fill="${on ? '#FFFFFF' : '#FFF8EE'}"/>`
				+ (h ? `<circle cx="${x + w / 2}" cy="${y + w / 2 - (on ? 14 : 0)}" r="${w * .3}" fill="${h}"/>` : '') + '</g>'; });
		s += `<g filter="url(#ps)"><rect x="100" y="90" width="1280" height="160" rx="12" fill="#FFF8EE" transform="rotate(-1.5 740 170)"/></g>` + headline(140, 210, '#4A3428', '#E8503A', 100) + onoma(1150, 1010, 168, '#4A3428', '#E8503A', 44);
		return s;
	},
	S4_glass_and_chrome: () => {   // bold: glossy glass cells with refraction and bloom over a deep violet-to-teal gradient
		let s = `<defs><linearGradient id="g4" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3A1F7A"/><stop offset=".5" stop-color="#5B3FB0"/><stop offset="1" stop-color="#1F8FA8"/></linearGradient>
		<radialGradient id="orb1" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#FF5D8F" stop-opacity=".7"/><stop offset="1" stop-color="#FF5D8F" stop-opacity="0"/></radialGradient>
		<radialGradient id="orb2" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#45D6E8" stop-opacity=".6"/><stop offset="1" stop-color="#45D6E8" stop-opacity="0"/></radialGradient>
		<linearGradient id="glass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFFFFF" stop-opacity=".45"/><stop offset=".45" stop-color="#FFFFFF" stop-opacity=".08"/><stop offset="1" stop-color="#FFFFFF" stop-opacity=".22"/></linearGradient>
		<filter id="bloom" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="14" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
		<filter id="gloss" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur in="SourceAlpha" stdDeviation="14" result="bl"/><feSpecularLighting in="bl" surfaceScale="6" specularConstant=".9" specularExponent="22" lighting-color="#FFFFFF" result="sp"><fePointLight x="500" y="150" z="420"/></feSpecularLighting><feComposite in="sp" in2="SourceAlpha" operator="in" result="spi"/><feComposite in="SourceGraphic" in2="spi" operator="arithmetic" k2="1" k3=".75"/></filter></defs>
		<rect width="1920" height="1080" fill="url(#g4)"/><circle cx="800" cy="500" r="520" fill="url(#orb1)"/><circle cx="1500" cy="800" r="560" fill="url(#orb2)"/>
		<path d="M0 880 Q960 840 1920 880 L1920 1080 L0 1080Z" fill="#FFFFFF" opacity=".1"/>`;
		s += `<g opacity=".35" transform="translate(0 1760) scale(1 -1)">${band2(-60)}</g>` + `<g filter="url(#gloss)">${band2(-60)}</g>`;
		s += gridL1((x, y, w, i) => { const on = i === NOW, h = KICK[i] ? C.k : SNARE[i] ? C.s : null;
			return (h ? `<circle cx="${x + w / 2}" cy="${y + w / 2}" r="${w * (on ? .36 : .28)}" fill="${h}" filter="url(#bloom)"/>` : '')
				+ `<rect x="${x}" y="${y}" width="${w}" height="${w}" rx="34" fill="url(#glass)" stroke="#FFFFFF" stroke-opacity="${on ? .95 : .45}" stroke-width="${on ? 5 : 2}"/>`
				+ `<path d="M${x + 18} ${y + 40} Q${x + 20} ${y + 18} ${x + 44} ${y + 16}" stroke="#FFFFFF" stroke-width="6" stroke-linecap="round" fill="none" opacity=".8"/>`; });
		s += headline(120, 190, '#FFFFFF', '#FFE45C', 106, 'filter="url(#bloom)"') + onoma(1150, 1010, 168, '#FFFFFF', '#FFE45C', 44);
		return s;
	},
};
window.OPTIONS = { ...LAYOUTS, ...STYLES };
