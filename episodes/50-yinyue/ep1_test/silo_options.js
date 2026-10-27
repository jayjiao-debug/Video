// Silhouette-musician versions of storyboard shot 9 (「咚 · 哒」, beat 2: snare hit). Uses options.js helpers
// (KICK, SNARE, NOW, headline, onoma, gridL1, cellBox) and silhouettes.js (drummer, bassist).
// rim light: only the edges that face the light (the shape minus itself shifted away from the light)
const rimFilter = (id, col, dx = 0, dy = -4) => `<filter id="${id}" x="-10%" y="-10%" width="120%" height="120%">
	<feOffset in="SourceAlpha" dx="${-dx}" dy="${-dy}" result="eo"/>
	<feComposite in="SourceAlpha" in2="eo" operator="out" result="edge"/><feFlood flood-color="${col}"/><feComposite in2="edge" operator="in" result="rim"/>
	<feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="rim"/></feMerge></filter>`;
// the performers for this moment: drummer lit and playing; bassist waiting in the dim behind (joins later)
const band = (tone, { x = 520, y = 860, s = 1, bx = 980, dimTone = null, rim = 'rim' } = {}) =>
	(dimTone ? `<g opacity=".55">${bassist(bx, y - 10, s * .82, { tone: dimTone })}</g>` : '')
	+ `<g filter="url(#${rim})">${drummer(x, y, s, { tone, hit: 1, hat: 0 })}</g>`;
const beam = (x0, x1, x2, op, col = '#FFE2B0') => `<path d="M${x0 - 20} -10 L${x0 + 20} -10 L${x2} 900 L${x1} 900Z" fill="${col}" opacity="${op}"/>`;
function hazeDefs() {
	return `<filter id="haze" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".004 .012" numOctaves="3" seed="4"/>
	<feColorMatrix values="0 0 0 0 1  0 0 0 0 .9  0 0 0 0 .8  0 0 0 .22 0"/></filter>
	<filter id="bl" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="30"/></filter>
	<filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="10" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`;
}

// ---------------------------------------------------------------- styles, all in layout L1 (band left, 16 cells right)
const SILO_STYLES = {
	A_concert_backlight: () => {   // warm backlight behind the band, beams through haze, wet stage floor; cells are light panels
		let s = `<defs>${hazeDefs()}${rimFilter('rim', '#FFC27A', -2, -3)}
		<linearGradient id="bgA" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3A2A5C"/><stop offset=".75" stop-color="#7A3E62"/><stop offset="1" stop-color="#2A1D3E"/></linearGradient>
		<radialGradient id="back" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#FFC27A" stop-opacity=".95"/><stop offset=".45" stop-color="#FF8A5C" stop-opacity=".45"/><stop offset="1" stop-color="#FF8A5C" stop-opacity="0"/></radialGradient></defs>
		<rect width="1920" height="1080" fill="url(#bgA)"/>
		<ellipse cx="520" cy="560" rx="620" ry="460" fill="url(#back)"/>
		${beam(300, 120, 560, .16)}${beam(760, 520, 980, .14)}${beam(1500, 1180, 1700, .08, '#C9A0FF')}
		<rect width="1920" height="1080" filter="url(#haze)"/>
		<rect x="0" y="860" width="1920" height="220" fill="#1E1530"/><ellipse cx="520" cy="880" rx="560" ry="40" fill="#FFC27A" opacity=".35" filter="url(#bl)"/>`;
		s += band('#1B1530', { dimTone: '#2A2042' });
		s += `<g opacity=".3" transform="translate(0 1740) scale(1 -1)">${drummer(520, 860, 1, { tone: '#1B1530', hit: 1, hat: 0 })}</g>`;   // reflection on the wet floor
		s += gridL1((x, y, w, i) => { const on = i === NOW, h = KICK[i] ? '#FF9A4C' : SNARE[i] ? '#FF5D8F' : null;
			return `<rect x="${x}" y="${y}" width="${w}" height="${w}" rx="18" fill="#140E24" fill-opacity=".7" stroke="${on ? '#FFE2B0' : '#5A4A7A'}" stroke-width="${on ? 6 : 2}"/>`
				+ (h ? `<rect x="${x + 22}" y="${y + 22}" width="${w - 44}" height="${w - 44}" rx="10" fill="${h}" opacity="${on ? 1 : .7}" ${on ? 'filter="url(#glow)"' : ''}/>` : ''); });
		s += headline(120, 190, '#FFF4E6', '#FFC27A', 108) + onoma(1150, 1010, 168, '#FFF4E6', '#FFC27A', 44);
		return s;
	},
	B_rooftop_sunset: () => {   // the band plays on a rooftop against a huge setting sun; city below
		let s = `<defs>${hazeDefs()}${rimFilter('rim', '#FFD08A', -4, -2)}
		<linearGradient id="skyB" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3D3A8A"/><stop offset=".5" stop-color="#D9607A"/><stop offset=".85" stop-color="#FFB060"/></linearGradient></defs>
		<rect width="1920" height="1080" fill="url(#skyB)"/><circle cx="600" cy="640" r="380" fill="#FFD58A"/><circle cx="600" cy="640" r="470" fill="#FFD58A" opacity=".25"/>`;
		for (let i = 0; i < 6; i++) s += `<rect x="0" y="${560 + i * 46}" width="1920" height="${10 - i}" fill="#FFB060" opacity=".5"/>`;
		let x = 0; const r = (i) => ((i * 9301 + 49297) % 233280) / 233280;
		for (let i = 0; x < 1920; i++) { const w = 80 + r(i) * 110, h = 60 + r(i + 5) * 200; s += `<rect x="${x}" y="${880 - h}" width="${w}" height="${h}" fill="#6A3A6A" opacity=".85"/>`; x += w + 8; }
		s += `<rect x="0" y="860" width="1920" height="220" fill="#2A1A3A"/><rect x="0" y="852" width="1920" height="12" fill="#3A2448"/>`;
		for (let i = 0; i < 13; i++) s += `<rect x="${i * 160}" y="800" width="8" height="60" fill="#2A1A3A"/>`;
		s += `<rect x="0" y="800" width="1920" height="6" fill="#2A1A3A"/>`;
		s += band('#2A1A3A', { dimTone: '#3A2448' });
		s += gridL1((x, y, w, i) => { const on = i === NOW, h = KICK[i] ? '#FF8A3D' : SNARE[i] ? '#FF4F7E' : null;
			return `<rect x="${x}" y="${y}" width="${w}" height="${w}" rx="20" fill="#FFF3E2" fill-opacity="${on ? .95 : .75}" stroke="${on ? '#2A1A3A' : 'none'}" stroke-width="6"/>`
				+ (h ? `<circle cx="${x + w / 2}" cy="${y + w / 2}" r="${w * .3}" fill="${h}"/>` : ''); });
		s += headline(120, 190, '#FFFFFF', '#FFE07A', 108, 'style="paint-order:stroke" stroke="#3D3A8A" stroke-width="10" stroke-opacity=".35"') + onoma(1150, 1010, 168, '#FFF3E2', '#FFE07A', 44);
		return s;
	},
	C_paper_cut: () => {   // layered paper: the band is cut from dark paper, lit by a paper "spotlight" disc
		let s = `<defs><filter id="ps" x="-10%" y="-10%" width="120%" height="130%"><feDropShadow dx="0" dy="12" stdDeviation="9" flood-color="#3A2A20" flood-opacity=".35"/></filter>
		<filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="1.2" numOctaves="1" seed="9"/><feColorMatrix values="0 0 0 0 .4  0 0 0 0 .3  0 0 0 0 .2  0 0 0 .12 0"/></filter></defs>
		<rect width="1920" height="1080" fill="#EFD9BC"/>
		<circle cx="560" cy="560" r="400" fill="#FFF0D2" filter="url(#ps)"/>
		<path d="M0 760 C400 700 800 740 1200 720 C1500 705 1700 690 1920 700 L1920 1080 L0 1080Z" fill="#D98C6E" filter="url(#ps)"/>
		<path d="M0 870 C500 840 1100 860 1920 845 L1920 1080 L0 1080Z" fill="#8C4A52" filter="url(#ps)"/>`;
		s += `<g filter="url(#ps)">${bassist(980, 850, .82, { tone: '#6A3A46' })}</g><g filter="url(#ps)">${drummer(520, 860, 1, { tone: '#2E1E2A', hit: 1, hat: 0, shine: '#2E1E2A' })}</g>`;
		s += gridL1((x, y, w, i) => { const on = i === NOW, h = KICK[i] ? '#E8732E' : SNARE[i] ? '#C8304A' : null;
			return `<g filter="url(#ps)" transform="rotate(${((i * 37) % 7) - 3} ${x + w / 2} ${y + w / 2})"><rect x="${x}" y="${y - (on ? 14 : 0)}" width="${w}" height="${w}" rx="8" fill="#FFF8EE"/>`
				+ (h ? `<circle cx="${x + w / 2}" cy="${y + w / 2 - (on ? 14 : 0)}" r="${w * .3}" fill="${h}"/>` : '') + '</g>'; });
		s += `<rect width="1920" height="1080" filter="url(#grain)"/>`;
		s += `<g filter="url(#ps)"><rect x="100" y="90" width="1240" height="160" rx="10" fill="#FFF8EE" transform="rotate(-1.2 720 170)"/></g>` + headline(140, 212, '#3A2430', '#C8304A', 100) + onoma(1150, 1010, 168, '#3A2430', '#C8304A', 44);
		return s;
	},
	D_shadow_screen: () => {   // 皮影 style: a warm lit cloth screen, the band as shadows cast on it, lamp glow from behind
		let s = `<defs>${hazeDefs()}
		<radialGradient id="lamp" cx=".33" cy=".55" r=".75"><stop offset="0" stop-color="#FFE9B8"/><stop offset=".55" stop-color="#F2B66A"/><stop offset="1" stop-color="#8A4A2A"/></radialGradient>
		<filter id="soft"><feGaussianBlur stdDeviation="2.2"/></filter>
		<filter id="cloth"><feTurbulence type="turbulence" baseFrequency=".9 .02" numOctaves="1" seed="2"/><feColorMatrix values="0 0 0 0 .5  0 0 0 0 .3  0 0 0 0 .1  0 0 0 .1 0"/></filter></defs>
		<rect width="1920" height="1080" fill="url(#lamp)"/><rect width="1920" height="1080" filter="url(#cloth)"/>
		<rect x="0" y="0" width="1920" height="60" fill="#3A1A10"/><rect x="0" y="1020" width="1920" height="60" fill="#3A1A10"/>
		<path d="M0 60 L1920 60" stroke="#C8902A" stroke-width="6"/><path d="M0 1020 L1920 1020" stroke="#C8902A" stroke-width="6"/>`;
		s += `<g filter="url(#soft)" opacity=".55">${bassist(1000, 900, .82, { tone: '#3A1A10' })}</g><g filter="url(#soft)">${drummer(520, 910, 1, { tone: '#2A120A', hit: 1, hat: 0, shine: '#2A120A' })}</g>`;
		s += gridL1((x, y, w, i) => { const on = i === NOW, h = KICK[i] ? '#B8361E' : SNARE[i] ? '#7A1E3A' : null;
			return `<rect x="${x}" y="${y}" width="${w}" height="${w}" rx="6" fill="none" stroke="#3A1A10" stroke-width="${on ? 8 : 3}" opacity="${on ? 1 : .6}"/>`
				+ (h ? `<circle cx="${x + w / 2}" cy="${y + w / 2}" r="${w * (on ? .36 : .28)}" fill="${h}"/>` : ''); }, 1150, 260);
		s += headline(120, 200, '#2A120A', '#B8361E', 108) + onoma(1150, 975, 168, '#2A120A', '#B8361E', 44);
		return s;
	},
};

// ---------------------------------------------------------------- layouts, all in style A (concert backlight)
function stageA(extra = '') {
	return `<defs>${hazeDefs()}${rimFilter('rim', '#FFC27A', -2, -3)}
	<linearGradient id="bgA" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3A2A5C"/><stop offset=".75" stop-color="#7A3E62"/><stop offset="1" stop-color="#2A1D3E"/></linearGradient>
	<radialGradient id="back" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#FFC27A" stop-opacity=".95"/><stop offset=".45" stop-color="#FF8A5C" stop-opacity=".45"/><stop offset="1" stop-color="#FF8A5C" stop-opacity="0"/></radialGradient></defs>
	<rect width="1920" height="1080" fill="url(#bgA)"/>${extra}<rect width="1920" height="1080" filter="url(#haze)"/>`;
}
const panel = (x, y, w, i, r = 18) => { const on = i === NOW, h = KICK[i] ? '#FF9A4C' : SNARE[i] ? '#FF5D8F' : null;
	return `<rect x="${x}" y="${y}" width="${w}" height="${w}" rx="${r}" fill="#140E24" fill-opacity=".7" stroke="${on ? '#FFE2B0' : '#5A4A7A'}" stroke-width="${on ? 6 : 2}"/>`
		+ (h ? `<rect x="${x + w * .15}" y="${y + w * .15}" width="${w * .7}" height="${w * .7}" rx="${r * .6}" fill="${h}" opacity="${on ? 1 : .7}" ${on ? 'filter="url(#glow)"' : ''}/>` : ''); };
const SILO_LAYOUTS = {
	L1_stage_and_grid: () => SILO_STYLES.A_concert_backlight(),
	L2_clock_ring: () => {   // a ring of 16 lights hung above and around the drummer, like a lighting rig
		const cx = 960, cy = 640, R = 330;
		let s = stageA(`<ellipse cx="${cx}" cy="${cy + 40}" rx="560" ry="440" fill="url(#back)"/>`);
		s += `<rect x="0" y="880" width="1920" height="200" fill="#1E1530"/>`;
		const a = -Math.PI / 2 + NOW / 16 * 2 * Math.PI;
		s += `<line x1="${cx}" y1="${cy}" x2="${cx + (R - 20) * Math.cos(a)}" y2="${cy + (R - 20) * Math.sin(a)}" stroke="#FFE2B0" stroke-width="4" opacity=".5"/>`;
		for (let i = 0; i < 16; i++) { const b = -Math.PI / 2 + i / 16 * 2 * Math.PI; s += panel(cx + R * Math.cos(b) - 48, cy + R * Math.sin(b) - 48, 96, i, 48); }
		s += `<g filter="url(#rim)">${drummer(cx, 880, .95, { tone: '#1B1530', hit: 1, hat: 0 })}</g>`;
		s += headline(120, 150, '#FFF4E6', '#FFC27A', 96);
		return s;
	},
	L3_light_wall: () => {   // the 16 cells are a giant LED wall behind the band, one beat per column
		let s = stageA();
		const x0 = 300, y0 = 230, w = 300, h = 120, g = 16;
		for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) { const i = c * 4 + r, on = i === NOW, hit = KICK[i] ? '#FF9A4C' : SNARE[i] ? '#FF5D8F' : null;
			s += `<rect x="${x0 + c * (w + g)}" y="${y0 + r * (h + g)}" width="${w}" height="${h}" rx="10" fill="${hit || '#2A1E44'}" opacity="${hit ? (on ? 1 : .55) : .8}" stroke="${on ? '#FFE2B0' : 'none'}" stroke-width="6" ${on && hit ? 'filter="url(#glow)"' : ''}/>`; }
		s += `<rect x="0" y="860" width="1920" height="220" fill="#1E1530"/>`;
		s += band('#1B1530', { x: 760, bx: 1260, dimTone: '#2A2042' });
		s += headline(120, 160, '#FFF4E6', '#FFC27A', 96) + onoma(x0, 1010, w + g, '#FFF4E6', '#FFC27A', 44);
		return s;
	},
	L4_light_up_floor: () => {   // the band plays on top of a 4x4 light-up stage floor
		let s = stageA(`<ellipse cx="960" cy="520" rx="620" ry="420" fill="url(#back)"/>`);
		s += `<path d="M0 620 L1920 620 L1920 1080 L0 1080Z" fill="#1E1530"/>`;
		const P = (u, v) => { const y = 640 + 400 * v, half = 430 + 480 * v; return [960 - half + u * 2 * half, y]; };
		for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) { const i = r * 4 + c, gg = .03, on = i === NOW, hit = KICK[i] ? '#FF9A4C' : SNARE[i] ? '#FF5D8F' : null;
			const a = P(c / 4 + gg, r / 4 + gg), b = P((c + 1) / 4 - gg, r / 4 + gg), d = P((c + 1) / 4 - gg, (r + 1) / 4 - gg), e = P(c / 4 + gg, (r + 1) / 4 - gg);
			s += `<path d="M${a} L${b} L${d} L${e}Z" fill="${hit || '#2A1E44'}" opacity="${hit ? (on ? 1 : .55) : 1}" stroke="${on ? '#FFE2B0' : '#4A3A6A'}" stroke-width="${on ? 7 : 2}" ${on && hit ? 'filter="url(#glow)"' : ''}/>`; }
		s += `<g filter="url(#rim)">${drummer(960, 720, .8, { tone: '#1B1530', hit: 1, hat: 0 })}</g>`;
		s += headline(120, 160, '#FFF4E6', '#FFC27A', 96);
		return s;
	},
};
window.OPTIONS = Object.fromEntries([...Object.entries(SILO_LAYOUTS).map(([k, v]) => ['L' + k.slice(1), v]), ...Object.entries(SILO_STYLES).map(([k, v]) => ['S' + k, v])]);
