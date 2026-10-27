// Three layouts that show who plays what: the full band on one groove, frozen on step 5 (beat 2).
const NOW5 = 4;
const PARTS = [   // [part, player, label, pattern, note length in steps]
	['kick', 'drums', '底鼓', [1,0,0,0, 0,0,0,1, 1,0,1,0, 0,0,0,0], 1],
	['snare', 'drums', '军鼓', [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0], 1],
	['hats', 'drums', '镲', [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0], 1],
	['bass', 'bass', '贝斯', [1,0,0,1, 0,0,1,0, 1,0,0,1, 0,0,1,0], 2],
	['guitar', 'guitar', '吉他', [0,0,1,0, 0,0,1,0, 0,0,1,0, 0,0,1,0], 1],
	['keys', 'keys', '键盘', [1,0,0,0, 0,0,0,0, 1,0,0,0, 0,0,0,0], 4],
	['vox', 'vox', '人声', [0,0,0,0, 0,0,1,0, 1,0,1,1, 0,0,0,0], 2],
];
const playing = (player) => PARTS.some(([, p, , pat, len]) => p === player && [...Array(len).keys()].some((d) => pat[NOW5 - d]));
const poseOf = (player) => { const on = (part) => PARTS.find((q) => q[0] === part)[3][NOW5] ? 1 : 0;
	return { drums: { kick: on('kick'), snare: on('snare'), hat: on('hats') }, bass: { pluck: 0 }, guitar: { strum: 0 }, keys: { press: 1 }, vox: { sing: 0 } }[player]; };
const HEAD5 = (x, y, size = 92, ink = '#F4EEDF') => `<text x="${x}" y="${y}" ${F} font-size="${size}" font-weight="900" fill="${ink}">五个人，同一个 <tspan fill="#F2B632">16 格</tspan></text>`;
// angular stage backdrop: big flat shapes, a moon, hard-edged light wedges
function backdrop(floorY = 900) {
	return `<rect width="1920" height="1080" fill="#2C3346"/>
	${poly([[0, 0], [700, 0], [420, floorY], [0, floorY]], '#323A50')}${poly([[1300, 0], [1920, 0], [1920, floorY], [1500, floorY]], '#323A50')}
	<circle cx="1560" cy="250" r="150" fill="#E9DFC6" opacity=".9"/><circle cx="1610" cy="230" r="150" fill="#2C3346" opacity=".9"/>
	${poly([[520, 0], [640, 0], [900, floorY], [360, floorY]], '#F2E3B8', 'opacity=".07"')}${poly([[1180, 0], [1300, 0], [1560, floorY], [1020, floorY]], '#F2E3B8', 'opacity=".07"')}
	<rect y="${floorY}" width="1920" height="${1080 - floorY}" fill="#3D2F3A"/>${poly([[0, floorY], [1920, floorY], [1920, floorY + 14], [0, floorY + 14]], '#5A4250')}`;
}

const BAND_LAYOUTS = {
	BA_split_panels: () => {   // a panel per player (cut on a slant), each with that player's own 16 cells underneath
		const order = ['drums', 'bass', 'guitar', 'keys', 'vox'], W5 = 1920 / 5, top = 150, bot = 700, sl = 40;
		let s = `<rect width="1920" height="1080" fill="#1E2230"/>`;
		order.forEach((p, i) => {
			const x0 = i * W5, on = playing(p), c = BAND[p];
			const pts = [[x0 + sl, top], [x0 + W5 + sl, top], [x0 + W5 - sl, bot], [x0 - sl, bot]];
			s += `<clipPath id="cp${i}"><polygon points="${pts.map((q) => q.join(',')).join(' ')}"/></clipPath>`;
			s += `<g clip-path="url(#cp${i})"><rect x="${x0 - 60}" y="${top}" width="${W5 + 120}" height="${bot - top}" fill="${on ? c.col : c.dark}"/>
				${poly([[x0 - 60, bot - 120], [x0 + W5 + 60, bot - 200], [x0 + W5 + 60, bot], [x0 - 60, bot]], '#000', 'opacity=".18"')}
				<g opacity="${on ? 1 : .55}">${PLAYER[p](x0 + W5 / 2, bot - 30 + (p === 'drums' ? 10 : 0), p === 'drums' ? .62 : .66, poseOf(p))}</g></g>`;
			s += `<text x="${x0 + W5 / 2}" y="${bot + 56}" text-anchor="middle" ${F} font-size="34" font-weight="900" fill="${c.col}">${c.name}</text>`;
			// that player's cells: 16 in a 4x4 block, one row per beat; drummer shows kick/snare/hats as circle/square/dot
			const gx = x0 + W5 / 2 - 128, gy = bot + 84, cw = 56, gap = 8;
			for (let k = 0; k < 16; k++) {
				const cx = gx + (k % 4) * (cw + gap), cy = gy + Math.floor(k / 4) * (cw + gap), cur = k === NOW5;
				s += `<rect x="${cx}" y="${cy}" width="${cw}" height="${cw}" rx="4" fill="${cur ? '#3A4058' : '#2A3042'}" stroke="${cur ? '#F4EEDF' : 'none'}" stroke-width="4"/>`;
				PARTS.filter((q) => q[1] === p).forEach(([part, , , pat, len]) => {
					const hit = pat[k], held = !hit && [...Array(len).keys()].slice(1).some((d) => pat[k - d]);
					if (part === 'kick' && hit) s += `<circle cx="${cx + cw / 2}" cy="${cy + cw / 2}" r="20" fill="${c.col}"/>`;
					else if (part === 'snare' && hit) s += `<rect x="${cx + 10}" y="${cy + 10}" width="${cw - 20}" height="${cw - 20}" fill="#F4EEDF"/>`;
					else if (part === 'hats' && hit) s += `<circle cx="${cx + cw - 12}" cy="${cy + 12}" r="7" fill="#E3B23C"/>`;
					else if (hit || held) s += `<rect x="${cx + (hit ? 8 : 0)}" y="${cy + 14}" width="${cw - (hit ? 8 : 0)}" height="${cw - 28}" fill="${c.col}" opacity="${hit ? 1 : .6}"/>`;
				});
			}
		});
		s += HEAD5(80, 110, 84);
		return s;
	},
	BB_stage_and_tracks: () => {   // the whole band on stage, and under it one track per part, each headed by its player's colour
		let s = backdrop(520);
		const xs = { drums: 250, bass: 600, guitar: 920, keys: 1260, vox: 1620 };
		for (const p of Object.keys(xs)) s += `<g opacity="${playing(p) ? 1 : .6}">${PLAYER[p](xs[p], 520, p === 'drums' ? .55 : .52, poseOf(p))}</g>`;
		const x0 = 300, x1 = 1840, y0 = 560, rh = 66, sw = (x1 - x0) / 16;
		s += `<rect x="0" y="${y0 - 16}" width="1920" height="${1080 - y0 + 16}" fill="#1E2230"/>`;
		PARTS.forEach(([part, p, label, pat, len], r) => {
			const y = y0 + r * rh, c = BAND[p];
			s += `<rect x="40" y="${y + 6}" width="220" height="${rh - 12}" rx="6" fill="${c.col}"/><text x="60" y="${y + rh / 2 + 12}" ${F} font-size="32" font-weight="900" fill="#1E2230">${label}</text>`;
			s += `<text x="248" y="${y + rh / 2 + 10}" text-anchor="end" ${F} font-size="22" font-weight="700" fill="#1E2230" opacity=".75">${c.name.split('·')[1].trim()}</text>`;
			for (let k = 0; k < 16; k++) s += `<rect x="${x0 + k * sw + 3}" y="${y + 8}" width="${sw - 6}" height="${rh - 16}" fill="${k % 4 === 0 ? '#2E3448' : '#262B3C'}"/>`;
			for (let k = 0; k < 16; k++) if (pat[k]) s += `<rect x="${x0 + k * sw + 5}" y="${y + 14}" width="${sw * len - 10}" height="${rh - 28}" rx="4" fill="${c.col}" opacity="${k <= NOW5 && NOW5 < k + len ? 1 : .55}"/>`;
		});
		const px = x0 + (NOW5 + .5) * sw;
		s += `<rect x="${px - 3}" y="${y0}" width="6" height="${PARTS.length * rh}" fill="#F4EEDF"/>${poly([[px - 16, y0 - 14], [px + 16, y0 - 14], [px, y0 + 6]], '#F4EEDF')}`;
		s += HEAD5(80, 120, 84);
		return s;
	},
	BC_lanes_to_the_players: () => {   // each player has a lane; notes rise up the lane and play when they reach the player's feet
		let s = backdrop(640);
		const xs = { drums: 260, bass: 640, guitar: 960, keys: 1290, vox: 1640 }, hitY = 660, stepPx = 46;
		// lanes (drummer has three thin sub-lanes)
		const lanes = []; for (const [part, p, , pat, len] of PARTS) {
			const sub = p === 'drums' ? { kick: -80, snare: 0, hats: 80 }[part] : 0; lanes.push({ part, p, pat, len, x: xs[p] + sub, w: p === 'drums' ? 64 : 120 }); }
		s += `<rect x="0" y="${hitY}" width="1920" height="${1080 - hitY}" fill="#1E2230"/>`;
		for (const L of lanes) {
			const c = BAND[L.p];
			s += `<rect x="${L.x - L.w / 2}" y="${hitY}" width="${L.w}" height="${1080 - hitY}" fill="${c.col}" opacity=".12"/>`;
			for (let k = 0; k < 16; k++) if (L.pat[k]) {
				const yTop = hitY + (k - NOW5) * stepPx, h = L.len * stepPx - 8;
				if (yTop + h < hitY - 4) continue;
				const live = k <= NOW5 && NOW5 < k + L.len;
				s += `<rect x="${L.x - L.w / 2 + 8}" y="${Math.max(hitY, yTop)}" width="${L.w - 16}" height="${Math.min(h, yTop + h - hitY)}" rx="8" fill="${L.part === 'snare' ? '#F4EEDF' : L.part === 'hats' ? '#E3B23C' : c.col}" opacity="${live ? 1 : .85}"/>`;
			}
		}
		for (let k = 0; k <= 8; k += 4) s += `<line x1="0" y1="${hitY + k * stepPx}" x2="1920" y2="${hitY + k * stepPx}" stroke="#F4EEDF" stroke-width="2" opacity=".15"/>`;
		s += `<rect x="0" y="${hitY - 4}" width="1920" height="8" fill="#F4EEDF"/>`;
		for (const p of Object.keys(xs)) s += `<g opacity="${playing(p) ? 1 : .6}">${PLAYER[p](xs[p], 640, p === 'drums' ? .6 : .56, poseOf(p))}</g>`;
		s += `<text x="1880" y="1050" text-anchor="end" ${F} font-size="26" font-weight="700" fill="#F4EEDF" opacity=".6">音符往上走，碰到线就响</text>`;
		s += HEAD5(80, 120, 84);
		return s;
	},
};
window.OPTIONS = { ...BAND_LAYOUTS, band_lineup: () => backdrop(900) + pDrums(330, 900, .8, { snare: 1 }) + pBass(760, 900, .8) + pGuitar(1080, 900, .8, { strum: 1 }) + pKeys(1420, 900, .8, { press: 1 }) + pVox(1750, 900, .8, { sing: 1 })
	+ Object.entries({ drums: 330, bass: 760, guitar: 1080, keys: 1420, vox: 1750 }).map(([p, x]) => `<text x="${x}" y="990" text-anchor="middle" ${F} font-size="34" font-weight="900" fill="${BAND[p].col}">${BAND[p].name}</text>`).join('') };
