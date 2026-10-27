// Ep1 《一声「咚」，怎么变成一整支乐队》. window.renderAt(t) draws one 1920x1080 frame from window.SCORE (score.json).
// Every motion here is read from the score: a player moves on their own notes, the lanes show exactly those notes.
const SC = window.SCORE, SECS = SC.sections, W = 1920, H = 1080;
// ---------------------------------------------------------------- score lookups
const IDX = {};
for (const e of SC.ev) { const [t, d, who, part] = e; (IDX[who] ||= []).push(e); (IDX[who + '|' + part] ||= []).push(e); }
const lastIdx = (arr, t) => { let lo = 0, hi = arr.length - 1, r = -1; while (lo <= hi) { const m = (lo + hi) >> 1; if (arr[m][0] <= t) { r = m; lo = m + 1; } else hi = m - 1; } return r; };
const evs = (who, parts) => parts ? parts.map((p) => IDX[who + '|' + p] || []) : [IDX[who] || []];
function hit(who, parts, t, tau = .13) {   // 1 on a note, decaying
	let v = 0; for (const a of evs(who, parts)) { const i = lastIdx(a, t); if (i >= 0) { const d = t - a[i][0]; if (d < 1.5) v = Math.max(v, Math.exp(-d / tau) * Math.sqrt(a[i][5] / 127)); } } return v;
}
function held(who, parts, t) { let best = null; for (const a of evs(who, parts)) { let i = lastIdx(a, t); for (let k = i; k >= Math.max(0, i - 6); k--) if (a[k][0] <= t && t < a[k][0] + a[k][1] && (!best || a[k][0] > best[0])) best = a[k]; } return best; }
function lastEv(who, parts, t) { let best = null; for (const a of evs(who, parts)) { const i = lastIdx(a, t); if (i >= 0 && (!best || a[i][0] > best[0])) best = a[i]; } return best; }
function countBefore(who, parts, t) { let n = 0; for (const a of evs(who, parts)) n += lastIdx(a, t) + 1; return n; }
const secIdx = (t) => { let i = 0; while (i + 1 < SECS.length && SECS[i + 1].t0 <= t) i++; return i; };
const SI = Object.fromEntries(SECS.map((s, i) => [s.name, i]));
function beatOf(S, t) { const B = S.beats; if (t <= B[0]) return (t - B[0]) / (B[1] - B[0]); const n = B.length - 1;
	if (t >= B[n]) return n + (t - B[n]) / (B[n] - B[n - 1]); let lo = 0, hi = n; while (hi - lo > 1) { const m = (lo + hi) >> 1; if (B[m] <= t) lo = m; else hi = m; } return lo + (t - B[lo]) / (B[lo + 1] - B[lo]); }
const tOf = (name, b) => { const S = SECS[SI[name]], B = S.beats, i = Math.min(B.length - 2, Math.max(0, Math.floor(b))); return B[i] + (b - i) * (B[i + 1] - B[i]); };
// ---------------------------------------------------------------- shared bits
const DEFS = `<defs>
<filter id="lit" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur in="SourceAlpha" stdDeviation="7" result="b"/>
<feDiffuseLighting in="b" surfaceScale="5" diffuseConstant="1.05" lighting-color="#ffffff" result="l"><feDistantLight azimuth="225" elevation="58"/></feDiffuseLighting>
<feComposite in="SourceGraphic" in2="l" operator="arithmetic" k1="1.12" k2="0" k3="0" k4="0" result="c"/><feComposite in="c" in2="SourceAlpha" operator="in" result="lit"/>
<feOffset in="SourceAlpha" dx="-5" dy="-4" result="o"/><feComposite in="SourceAlpha" in2="o" operator="out" result="edge"/><feFlood flood-color="var(--rim)"/><feComposite in2="edge" operator="in" result="rim"/>
<feMerge><feMergeNode in="lit"/><feMergeNode in="rim"/></feMerge></filter>
<filter id="blur20" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="22"/></filter>
<filter id="blur8" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="8"/></filter>
<filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="10" result="g"/><feMerge><feMergeNode in="g"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
<filter id="tshadow" x="-10%" y="-30%" width="120%" height="160%"><feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#000" flood-opacity=".55"/></filter>
<linearGradient id="cone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFF4D6" stop-opacity=".55"/><stop offset="1" stop-color="#FFF4D6" stop-opacity="0"/></linearGradient>
<radialGradient id="pool"><stop offset="0" stop-color="#FFE6B0" stop-opacity=".55"/><stop offset="1" stop-color="#FFE6B0" stop-opacity="0"/></radialGradient>
<radialGradient id="vig" cx=".5" cy=".46" r=".75"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".55"/></radialGradient>
<pattern id="grain" width="256" height="256" patternUnits="userSpaceOnUse"><image href="${GRAIN}" width="256" height="256"/></pattern>
</defs>`;
const cone = (x, y, w0, w1, h, op = 1, col = null) => `<polygon points="${P([[x - w0, y], [x + w0, y], [x + w1, y + h], [x - w1, y + h]])}" fill="${col || 'url(#cone)'}" opacity="${f1(op)}"/>`;
const pool = (x, y, rx, ry, op = 1) => ell(x, y, rx, ry, 'url(#pool)', `opacity="${f1(op)}"`);
const hash = (i) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
// ---------------------------------------------------------------- worlds: back layers (behind the band) and front layers
const WORLD = {
	room(t, st) {   // rehearsal room at dusk: foam wall, a window, a hanging lamp, a rug
		let b = rect(0, 0, W, H, '#3E2A26');
		b += `<linearGradient id="rw" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2E4A52"/><stop offset="1" stop-color="#1E3238"/></linearGradient>` + rect(0, 0, W, 800, 'url(#rw)');
		for (let i = 0; i < 26; i++) for (let j = 0; j < 9; j++) { const x = i * 80 - 40 + (j % 2) * 40, y = j * 84 - 20; b += poly([[x, y], [x + 76, y], [x + 76, y + 80]], '#2B454D') + poly([[x, y], [x, y + 80], [x + 76, y + 80]], '#22383F'); }
		b += `<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3B2A6A"/><stop offset=".55" stop-color="#C0508A"/><stop offset="1" stop-color="#FFB36E"/></linearGradient>`;
		b += rect(90, 140, 330, 420, '#6B4A36') + rect(108, 158, 294, 384, 'url(#sky)') + circ(330, 470, 46, '#FFE2A8', 'opacity=".9"');
		for (let i = 0; i < 9; i++) { const bx = 108 + i * 33, bh = 60 + hash(i) * 120; b += rect(bx, 542 - bh, 30, bh, '#2A1E3A'); for (let k = 0; k < 4; k++) if (hash(i * 7 + k) > .5) b += rect(bx + 6 + (k % 2) * 12, 542 - bh + 14 + Math.floor(k / 2) * 22, 7, 9, '#FFD27A'); }
		b += rect(250, 158, 10, 384, '#6B4A36') + rect(108, 340, 294, 10, '#6B4A36');
		const posters = st.posters || 0;
		[['#C9A04A', '#7A1E3C', '音乐厅'], ['#2E3A6A', '#FF6FAE', '爵士吧'], ['#17151F', '#45E0FF', '体育馆']].forEach(([bg, fg, tx], i) => {
			const u = ease(posters * 3 - i), x = 1240 + i * 190, y = 180 - (1 - u) * 60;
			if (u > 0) b += grp(`rotate(${f1((i - 1) * 3)} ${x + 75} ${y})`, rect(x, y, 150, 210, bg, `opacity="${f1(u)}"`) + `<text x="${x + 75}" y="${y + 120}" text-anchor="middle" ${F} font-size="34" font-weight="900" fill="${fg}" opacity="${f1(u)}">${tx}</text>` + circ(x + 75, y + 10, 7, '#D33'));
		});
		// clock
		const hh = 19 + (st.clockH || 0), mm = st.clockM || 0;
		b += circ(1440, 270, 56, '#EFE6CF') + circ(1440, 270, 48, '#F8F2E2') + seg([1440, 270], [1440 + 26 * Math.sin(((hh % 12) + mm / 60) / 12 * Math.PI * 2), 270 - 26 * Math.cos(((hh % 12) + mm / 60) / 12 * Math.PI * 2)], 8, INK) + seg([1440, 270], [1440 + 39 * Math.sin(mm / 60 * Math.PI * 2), 270 - 39 * Math.cos(mm / 60 * Math.PI * 2)], 5, INK);
		// door on the right (炸毛 kicks it open)
		const door = st.door || 0;
		b += rect(1720, 300, 170, 500, '#120E10') + grp(`translate(1720 300) scale(${f1(1 - .85 * door)} 1)`, rect(0, 0, 170, 500, '#7A5236') + rect(16, 20, 138, 200, '#86603F') + rect(16, 250, 138, 220, '#86603F') + circ(140, 260, 9, '#E3B23C'));
		b += `<linearGradient id="fl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8A5A3A"/><stop offset="1" stop-color="#5A3622"/></linearGradient>` + rect(0, 780, W, 300, 'url(#fl)');
		for (let i = -12; i < 13; i++) b += seg([960 + i * 60, 780], [960 + i * 190, 1080], 3, '#4A2C1C');
		b += ell(960, 800, 760, 70, '#7A2E2A') + ell(960, 800, 700, 58, '#9A3C34') + ell(960, 800, 560, 42, '#B8833A', 'opacity=".5"');
		b += rect(40, 640, 150, 160, '#25242C') + rect(52, 652, 126, 100, '#3A3842') + rect(1560, 650, 140, 150, '#25242C') + rect(1572, 662, 116, 92, '#3A3842');
		const lamp = .85 + .15 * (st.flash || 0);
		const front = seg([960, 0], [960, 120], 4, '#111') + poly([[900, 120], [1020, 120], [990, 90], [930, 90]], '#C8783A') + cone(960, 120, 60, 520, 700, .55 * lamp) + pool(960, 800, 620, 120, .8 * lamp);
		return { back: b, front, rim: '#FFD9A0' };
	},
	hall(t, st) {   // concert hall: gold arch, velvet curtains, three chandeliers, polished stage
		let b = rect(0, 0, W, H, '#1A0E12');
		b += `<linearGradient id="hw" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3A1C1E"/><stop offset="1" stop-color="#5A2A22"/></linearGradient>` + rect(140, 60, 1640, 740, 'url(#hw)');
		for (let i = 0; i < 15; i++) { const x = 240 + i * 105, h = 250 + 120 * Math.sin(i / 14 * Math.PI); b += rect(x, 420 - h, 40, h, '#8A6A3A') + rect(x + 22, 420 - h, 18, h, '#6A4E28') + ell(x + 20, 420 - h, 20, 8, '#C9A55A'); }
		const ch = st.chord || [0, 0, 0];
		[[560, 0], [960, 1], [1360, 2]].forEach(([x, k]) => { const on = ch[k] || 0;
			b += seg([x, 0], [x, 90], 4, '#8A6A3A') + circ(x, 140, 120, '#FFD98A', `opacity="${f1(.12 + .35 * on)}" filter="url(#blur20)"`);
			for (let r = 0; r < 3; r++) b += poly([[x - 90 + r * 20, 110 + r * 34], [x + 90 - r * 20, 110 + r * 34], [x + 70 - r * 20, 130 + r * 34], [x - 70 + r * 20, 130 + r * 34]], r === 1 ? '#E9C46A' : '#C9A040');
			for (let i = 0; i < 9; i++) b += circ(x - 80 + i * 20, 140 + (i % 2) * 30, 6 + 4 * on, '#FFF4D0', `opacity="${f1(.6 + .4 * on)}"`); });
		b += `<linearGradient id="stg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7A4A2A"/><stop offset="1" stop-color="#3A2014"/></linearGradient>` + rect(0, 780, W, 300, 'url(#stg)');
		for (let i = 0; i < 16; i++) b += rect(i * 130, 780, 4, 300, '#2A160E', 'opacity=".5"');
		const front = (() => { let f = '';
			for (const sd of [-1, 1]) { const x0 = sd < 0 ? 0 : W; for (let i = 0; i < 6; i++) f += rect(sd < 0 ? i * 32 : W - (i + 1) * 32, 0, 32, 1080, i % 2 ? '#7A1424' : '#9A1E30'); f += poly([[x0, 0], [x0 + sd * 330, 0], [x0 + sd * 200, 300], [x0, 360]], '#8A1828'); }
			f += `<path d="M0 0 H1920 V70 Q960 10 0 70Z" fill="#C9A040"/><path d="M0 0 H1920 V44 Q960 -6 0 44Z" fill="#E9C46A"/>`;
			f += cone(st.spotX || 960, 0, 40, 260, 800, .5) + pool(st.spotX || 960, 790, 320, 60, .9);
			for (let i = 0; i < 22; i++) { const x = 30 + i * 90 + (i % 2) * 20, y = 820 + (i % 3) * 8; f += circ(x, y, 34, '#120A0C') + rect(x - 44, y + 20, 88, 80, '#120A0C'); }
			return f; })();
		return { back: b, front, rim: '#FFE2A0' };
	},
	club(t, st) {   // brick jazz bar: neon, haze, candles
		let b = rect(0, 0, W, H, '#1E1418');
		for (let j = 0; j < 22; j++) for (let i = 0; i < 26; i++) { const x = i * 80 - (j % 2) * 40, y = j * 38; b += rect(x, y, 76, 34, hash(i * 31 + j) > .5 ? '#5A2E28' : '#4E2622'); }
		b += rect(0, 0, W, 800, '#160C1A', 'opacity=".35"');
		const nb = .75 + .25 * (st.neon || 0);
		b += `<g filter="url(#glow)" opacity="${f1(nb)}"><text x="960" y="210" text-anchor="middle" ${F} font-size="130" font-weight="900" fill="none" stroke="#FF6FAE" stroke-width="7">晚风</text><text x="960" y="290" text-anchor="middle" font-family="DejaVu Sans" font-size="54" font-weight="700" fill="none" stroke="#5FE3FF" stroke-width="4" letter-spacing="18">JAZZ</text></g>`;
		b += rect(260, 560, 1400, 240, '#2A1830') + rect(240, 780, 1440, 30, '#3A2418');
		b += `<linearGradient id="cf" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2A1A14"/><stop offset="1" stop-color="#140C0A"/></linearGradient>` + rect(0, 800, W, 280, 'url(#cf)');
		const door = st.door || 0;
		b += rect(1700, 380, 160, 420, '#0A0608') + rect(1700, 380, 160, 420, '#FFD27A', `opacity="${f1(.5 * door)}"`) + grp(`translate(1700 380) scale(${f1(1 - .85 * door)} 1)`, rect(0, 0, 160, 420, '#3A2418') + rect(14, 20, 132, 160, '#4A2E1E'));
		const front = (() => { let f = '';
			for (const [x, w] of [[480, 300], [960, 360], [1440, 300]]) f += cone(x, 0, 40, w, 800, .32);
			f += rect(0, 0, W, H, '#6A4A8A', 'opacity=".08"');
			for (const [x, y] of [[150, 900], [520, 930], [1400, 930], [1770, 900]]) {
				f += ell(x, y, 120, 26, '#2A1A14') + rect(x - 8, y, 16, 120, '#1A100C') + circ(x, y - 16, 40, '#FFB050', 'opacity=".35" filter="url(#blur8)"') + rect(x - 7, y - 30, 14, 20, '#EFE6CF') + circ(x, y - 36, 6, '#FFD27A');
				f += circ(x - 90, y - 70, 30, '#0E080A') + rect(x - 126, y - 44, 70, 120, '#0E080A') + circ(x + 96, y - 64, 28, '#0E080A') + rect(x + 62, y - 40, 68, 120, '#0E080A'); }
			return f; })();
		return { back: b, front, rim: '#8FD8FF' };
	},
	arena(t, st) {   // arena: LED wall, truss, beams, lasers, crowd
		let b = rect(0, 0, W, H, '#141026') + `<radialGradient id="ah" cx=".5" cy=".45" r=".7"><stop offset="0" stop-color="#3A2A5C" stop-opacity=".9"/><stop offset="1" stop-color="#141026" stop-opacity="0"/></radialGradient>` + rect(0, 0, W, H, 'url(#ah)');
		const bp = st.beatPhase || 0, beat = st.beatNum || 0, led = st.led || 'bars';
		b += rect(260, 90, 1400, 560, '#1A1630');
		const hot = Math.pow(1 - bp, 3);
		if (led === 'count') {   // 1 2 3 4, with 2 and 4 exploding
			for (let k = 0; k < 4; k++) { const on = beat % 4 === k, big = k % 2 === 1;
				b += `<text x="${440 + k * 340}" y="470" text-anchor="middle" font-family="DejaVu Sans" font-size="${big ? 300 : 220}" font-weight="900" fill="${big ? '#FF3D7F' : '#3A3A5A'}" opacity="${f1(on ? 1 : big ? .5 : .7)}" ${on && big ? 'filter="url(#glow)"' : ''}>${k + 1}</text>`;
				if (on && big) b += circ(440 + k * 340, 380, 140 + 160 * (1 - hot), 'none', `stroke="#FF3D7F" stroke-width="${f1(18 * hot)}" opacity="${f1(hot)}"`); }
		} else if (led === 'title') {
			b += `<text x="960" y="330" text-anchor="middle" ${F} font-size="150" font-weight="900" fill="#FFF3D6" filter="url(#glow)">晚风</text>`;
		} else {
			for (let i = 0; i < 28; i++) { const h = 80 + 380 * Math.abs(Math.sin(i * .7 + t * 2.1)) * (.5 + .5 * hot); b += rect(280 + i * 50, 640 - h, 40, h, i % 2 ? '#FF3D7F' : '#45E0FF', 'opacity=".75"'); }
		}
		for (let i = 0; i < 70; i++) b += rect(260 + i * 20, 90, 1, 560, '#000', 'opacity=".35"');
		for (let j = 0; j < 28; j++) b += rect(260, 90 + j * 20, 1400, 1, '#000', 'opacity=".35"');
		b += rect(0, 0, W, 30, '#2A2A36') + [...Array(12).keys()].map((i) => circ(120 + i * 152, 15, 13, i % 2 ? '#FF3D7F' : '#45E0FF', `opacity="${f1(.5 + .5 * hot)}"`)).join('');
		if (st.lasers) for (let i = 0; i < 10; i++) { const a = -60 + i * 13 + 10 * Math.sin(t * 3 + i); b += seg([960, 700], [960 + 1800 * Math.sin(a * Math.PI / 180), 700 - 1800 * Math.cos(a * Math.PI / 180)], 4, i % 2 ? '#45E0FF' : '#7CFF6B', `opacity="${f1(.6 * st.lasers)}" filter="url(#glow)"`); }
		b += `<linearGradient id="af" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3A3250"/><stop offset="1" stop-color="#120F1E"/></linearGradient>` + rect(0, 780, W, 300, 'url(#af)');
		const front = (() => { let f = '';
			for (let i = 0; i < 6; i++) { const a = Math.sin(t * .9 + i * 1.3) * 26, x = 160 + i * 320; f += grp(`rotate(${f1(a)} ${x} 80)`, cone(x, 80, 18, 170, 900, .22 * (.6 + .4 * hot), i % 2 ? '#FF3D7F' : '#45E0FF')); }
			const lift = st.crowdJump || 0;
			for (let i = 0; i < 34; i++) { const x = i * 58 + (i % 3) * 12, y = 850 + (i % 2) * 22 - lift * 18 * hash(i), up = hash(i + 9) > .45;
				f += circ(x, y, 30, '#05040A') + rect(x - 40, y + 22, 80, 220, '#05040A');
				if (up) f += seg([x + 20, y + 30], [x + 44 + 10 * Math.sin(t * 4 + i), y - 70 - 40 * lift], 18, '#05040A'); }
			return f; })();
		return { back: b, front, rim: '#FF8FC0' };
	},
	roof(t, st) {   // rooftop at dawn
		const sun = st.sun ?? .3;
		let b = `<linearGradient id="dawn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sun > .6 ? '#5A6AB8' : '#3A2A6A'}"/><stop offset=".5" stop-color="#E0709A"/><stop offset=".85" stop-color="#FFB46A"/><stop offset="1" stop-color="#FFE0A0"/></linearGradient>` + rect(0, 0, W, H, 'url(#dawn)');
		const sy = 720 - 330 * sun;
		b += circ(1360, sy, 230, '#FFE7A8', 'opacity=".35" filter="url(#blur20)"') + circ(1360, sy, 120, '#FFF0C0');
		const city = (seed, base, hmax, col) => { let c = ''; for (let i = 0; i < 30; i++) { const w = 50 + hash(seed + i) * 70, x = i * 66 - 20, h = 80 + hash(seed * 3 + i) * hmax; c += rect(x, base - h, w, h + 400, col); } return c; };
		b += city(11, 700, 260, '#B05A8A') + city(23, 760, 200, '#7A3A72') + city(37, 800, 130, '#4A2452');
		b += rect(160, 520, 150, 170, '#2A1A3A') + poly([[150, 520], [320, 520], [235, 470]], '#2A1A3A') + seg([180, 690], [170, 800], 10, '#2A1A3A') + seg([290, 690], [300, 800], 10, '#2A1A3A');
		b += `<path d="M0 300 Q480 380 960 300 T1920 300" stroke="#2A1A3A" stroke-width="3" fill="none"/>` + [...Array(20).keys()].map((i) => { const x = i * 100 + 20, y = 300 + 34 * Math.sin((x / 960) * Math.PI) * (x < 960 ? 1 : 1); return circ(x, y + 8, 9, '#FFE7A0', `opacity="${f1(.6 + .4 * Math.sin(t * 3 + i))}"`); }).join('');
		b += rect(0, 790, W, 290, '#3A2A3E') + rect(0, 790, W, 12, '#5A4250');
		const front = pool(960, 800, 760, 90, .6) + rect(0, 0, W, H, '#FF9A6A', `opacity="${f1(.06 + .06 * sun)}"`);
		return { back: b, front, rim: '#FFD6A0' };
	},
	street(t, st) {   // rainy street at night, neon
		let b = rect(0, 0, W, H, '#0E1426');
		const off = -((t * 180) % 640);
		for (let i = 0; i < 5; i++) { const x = off + i * 640; b += rect(x, 120, 600, 660, '#18203A') + rect(x + 40, 200, 520, 300, '#22305A');
			b += `<text x="${x + 300}" y="${i % 2 ? 380 : 360}" text-anchor="middle" ${F} font-size="90" font-weight="900" fill="none" stroke="${i % 2 ? '#FF6FAE' : '#5FE3FF'}" stroke-width="5" filter="url(#glow)">${['爵士', '酒吧', '晚风', 'BAR', '夜'][i]}</text>`; }
		b += rect(0, 780, W, 300, '#0A0E1C');
		for (let i = 0; i < 5; i++) { const x = off + i * 640; b += rect(x + 40, 800, 520, 120, i % 2 ? '#FF6FAE' : '#5FE3FF', 'opacity=".12" filter="url(#blur8)"'); }
		let front = '';
		for (let i = 0; i < 90; i++) { const x = (hash(i) * 2200 + t * 60) % 2100 - 100, y = (hash(i + 50) * 1200 + t * 1400) % 1200 - 100; front += seg([x, y], [x - 8, y + 40], 2, '#9AB8FF', 'opacity=".45"'); }
		return { back: b, front, rim: '#7FD0FF' };
	},
	dark(t, st) {
		const fl = st.flash || 0;
		let b = `<linearGradient id="dk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1E1838"/><stop offset="1" stop-color="#4A2650"/></linearGradient>` + rect(0, 0, W, H, 'url(#dk)') + rect(0, 0, W, H, '#CFD8FF', `opacity="${f1(.85 * fl)}"`);
		if (fl > .1) b += `<polyline points="${P([[1300, 0], [1240, 180], [1320, 220], [1200, 420], [1280, 450], [1160, 700]])}" stroke="#FFFFFF" stroke-width="10" fill="none" opacity="${f1(fl)}" filter="url(#glow)"/>`;
		b += ell(960, 1080, 1000, 260, '#FF3D7F', 'opacity=".55" filter="url(#blur20)"');
		return { back: b, front: '', rim: '#FFFFFF' };
	},
	stairs(t, st) {
		let b = `<linearGradient id="vio" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2A1E5A"/><stop offset="1" stop-color="#C0609A"/></linearGradient>` + rect(0, 0, W, H, 'url(#vio)');
		for (let i = 0; i < 14; i++) b += rect(i * 150, 900 - i * 70, 150, 70 + i * 70 + 200, '#1A1232');
		return { back: b, front: '', rim: '#FFC0E0' };
	},
};
// ---------------------------------------------------------------- the plan: which world, look, cast, camera and lanes per section
const POP_ROWS = [['drums', ['kick'], '底鼓'], ['drums', ['snare'], '军鼓'], ['drums', ['hat', 'ohat'], '镲'], ['bass', ['bass'], '贝斯'], ['keys', ['piano'], '键盘'], ['guitar', ['gtr'], '吉他'], ['vox', ['vox'], '主唱']];
const ROWS = {
	pop: POP_ROWS,
	classical: [['drums', ['timp'], '定音鼓'], ['bass', ['cbass'], '低音提琴'], ['guitar', ['strings', 'violin'], '小提琴'], ['flute', ['flute'], '长笛'], ['keys', ['piano'], '钢琴'], ['vox', ['vox'], '美声']],
	jazz: [['drums', ['ride', 'bell'], '叮叮镲'], ['drums', ['hatp', 'snare'], '踩镲·刷子'], ['bass', ['walk'], '低音提琴'], ['keys', ['piano'], '钢琴'], ['guitar', ['gtr'], '空心吉他'], ['horns', ['sax', 'tpt', 'tbn'], '铜管'], ['vox', ['vox'], '拟声']],
	rock: [['drums', ['kick'], '底鼓'], ['drums', ['snare'], '军鼓'], ['drums', ['hat', 'ohat', 'ride'], '镲'], ['crowd', ['clap'], '观众拍手'], ['bass', ['bass'], '贝斯'], ['guitar', ['power', 'lead'], '电吉他'], ['keys', ['organ'], '风琴'], ['vox', ['vox'], '主唱']],
	mix: [['drums', ['kick'], '底鼓'], ['drums', ['snare'], '军鼓'], ['bass', ['bass'], '贝斯'], ['guitar', ['strings', 'violin'], '弦乐'], ['keys', ['piano'], '钢琴'], ['horns', ['sax', 'tpt', 'tbn', 'brass'], '铜管'], ['vox', ['vox'], '主唱']],
};
const ROOM_POS = { bass: [330, 790, .6], drums: [700, 800, .62], vox: [1010, 812, .64], keys: [1330, 800, .62], guitar: [1640, 800, .6] };
const PLAN = {
	cold: { world: 'arena', look: 'pop', rows: 'pop', cast: { bass: [480, 790, .58], drums: [960, 760, .56], vox: [1180, 812, .62], keys: [1460, 790, .56], guitar: [760, 800, .58] }, cam: [[0, 960, 540, 1.0], [1, 960, 500, 1.08]], led: 'bars', lasers: 1 },
	pulse: { world: 'room', look: 'pop', rows: 'pop', cam: [[0, 700, 520, 1.75], [1, 700, 530, 1.62]] },
	bpm100: { world: 'room', look: 'pop', rows: 'pop', bpm: 1, cam: [[0, 700, 530, 1.62], [1, 700, 530, 1.58]] },
	bpm70: { world: 'room', look: 'pop', rows: 'pop', bpm: 1, cam: [[0, 700, 530, 1.58], [1, 700, 530, 1.55]] },
	bpm150: { world: 'room', look: 'pop', rows: 'pop', bpm: 1, cam: [[0, 700, 530, 1.55], [1, 700, 530, 1.55]] },
	bar: { world: 'room', look: 'pop', rows: 'pop', bpm: 1, count: 1, cam: [[0, 700, 530, 1.5], [1, 700, 530, 1.45]] },
	strong: { world: 'room', look: 'pop', rows: 'pop', count: 1, strong: 1, cam: [[0, 700, 530, 1.45], [1, 700, 530, 1.42]] },
	backbeat: { world: 'room', look: 'pop', rows: 'pop', cam: [[0, 700, 530, 1.42], [1, 690, 530, 1.36]] },
	hats: { world: 'room', look: 'pop', rows: 'pop', cam: [[0, 690, 530, 1.36], [1, 680, 530, 1.3]] },
	groove: { world: 'room', look: 'pop', rows: 'pop', groove: 1, cam: [[0, 680, 530, 1.3], [1, 660, 530, 1.25]] },
	bass: { world: 'room', look: 'pop', rows: 'pop', cam: [[0, 560, 520, 1.25], [1, 540, 520, 1.2]] },
	chords: { world: 'room', look: 'pop', rows: 'pop', chordNames: 1, cam: [[0, 820, 520, 1.1], [1, 840, 520, 1.06]] },
	guitar: { world: 'room', look: 'pop', rows: 'pop', cam: [[0, 1000, 520, 1.0], [1, 980, 520, .98]] },
	song: { world: 'room', look: 'pop', rows: 'pop', cam: [[0, 960, 520, .98], [.5, 900, 500, 1.04], [1, 1010, 520, 1.0]] },
	bridge: { world: 'room', look: 'pop', rows: 'pop', posters: 1, cam: [[0, 1000, 520, 1.0], [1, 1380, 330, 1.35]] },
	classical: { world: 'hall', look: 'classical', rows: 'classical', bpm: [0, 4], cast: { drums: [1150, 725, .48], bass: [420, 790, .56], guitar: [650, 795, .56], flute: [1370, 795, .6], keys: [1640, 790, .55], vox: [900, 812, .64] }, cam: [[0, 960, 500, 1.12], [.5, 960, 540, 1.0], [1, 960, 560, 1.06]] },
	run2: { world: 'street', look: 'jazz', walkers: ['tbn', 'bass', 'drums', 'guitar', 'keys', 'vox'], hats: { drums: 'fedora', bass: 'fedora', guitar: 'fedora' }, clock: '21:55' },
	jazz: { world: 'club', look: 'jazz', rows: 'jazz', bpm: [0, 4], cast: { drums: [560, 790, .56], bass: [300, 790, .58], guitar: [800, 800, .58], keys: [1110, 790, .55], vox: [1420, 812, .62], sax: [1580, 800, .6], tpt: [1720, 800, .6], tbn: [1850, 800, .6] }, cam: [[0, 560, 520, 1.45], [.2, 560, 520, 1.3], [.35, 800, 520, 1.08], [.5, 1100, 520, 1.0], [1, 980, 520, .98]] },
	run3: { world: 'dark', look: 'rock', walkers: ['drums', 'bass', 'guitar', 'keys', 'vox'], clock: '00:00' },
	rock: { world: 'arena', look: 'rock', rows: 'rock', bpm: [0, 4], cast: { bass: [480, 790, .58], drums: [960, 740, .56], vox: [1180, 812, .62], keys: [1580, 780, .55], guitar: [760, 800, .58] }, cam: [[0, 960, 500, 1.3], [.15, 960, 520, 1.1], [.5, 900, 520, 1.0], [.7, 760, 500, 1.25], [.85, 960, 520, 1.0], [1, 960, 520, 1.05]], lasers: 1 },
	run4: { world: 'stairs', look: 'mix', walkers: ['drums', 'bass', 'guitar', 'keys', 'vox', 'flute', 'sax', 'tpt', 'tbn'], hats: { drums: 'tophat', bass: 'fedora' }, clock: '05:00', climb: 1 },
	finale: { world: 'roof', look: 'mix', rows: 'mix', bpm: [6, 8], cast: { drums: [1030, 735, .48], bass: [470, 790, .56], guitar: [640, 795, .56], keys: [1330, 790, .5], vox: [820, 812, .62], flute: [300, 800, .52], sax: [1545, 800, .54], tpt: [1695, 800, .54], tbn: [1835, 800, .54] }, cam: [[0, 960, 520, 1.1], [.2, 960, 520, 1.0], [.6, 960, 520, .96], [1, 960, 520, 1.02]], knobs: 1 },
	outro: { world: 'roof', look: 'mix', rows: 'pop', cast: { drums: [1030, 735, .48], bass: [470, 790, .56], guitar: [640, 795, .56], keys: [1330, 790, .5], vox: [820, 812, .62], flute: [300, 800, .52], sax: [1545, 800, .54], tpt: [1695, 800, .54], tbn: [1835, 800, .54] }, cam: [[0, 960, 520, 1.02], [1, 900, 480, 1.3]] },
};
// who is on stage in the rehearsal room, and when they walk in
const ROOM_ENTER = { drums: 'pulse', bass: 'bass', keys: 'chords', guitar: 'guitar', vox: 'song' };
const ENTRANCES = [['bass', 'bass', 0, '长脚 · 贝斯'], ['chords', 'keys', 0, '小圆 · 键盘'], ['guitar', 'guitar', 0, '炸毛 · 吉他'], ['song', 'vox', 0, '大嗓门 · 主唱'],
	['classical', 'flute', 2, '小雀 · 长笛'], ['jazz', 'bass', 4, '长脚 · 低音提琴'], ['jazz', 'sax', 8, '阿胖 · 萨克斯'], ['jazz', 'tpt', 8.5, '鼓腮 · 小号'], ['jazz', 'tbn', 9, '高个 · 长号'],
	['rock', 'guitar', 6, '炸毛 · 电吉他'], ['rock', 'guitar', 16, '炸毛 · 独奏']];
// ---------------------------------------------------------------- poses from the score
const HP = { drums: 'drums', bass: 'bass', guitar: 'guitar', keys: 'keys', vox: 'vox', flute: 'flute', sax: 'sax', tpt: 'tpt', tbn: 'tbn' };
function poseOf(who, t, st) {
	const p = { t, bob: st.bob * (st.energy || 1) * (lastEv(who, null, t) && t - lastEv(who, null, t)[0] < 2.5 ? 1 : .25) };
	if (who === 'drums') {
		p.kick = hit('drums', ['kick'], t, .1); p.snare = hit('drums', ['snare'], t, .09); p.hat = hit('drums', ['hat', 'ohat', 'hatp'], t, .08);
		p.ride = hit('drums', ['ride', 'bell'], t, .09); p.crash = hit('drums', ['crash'], t, .15); p.tom = hit('drums', ['tom'], t, .08);
		const tp = lastEv('drums', ['timp'], t); if (tp) { const n = countBefore('drums', ['timp'], t), v = Math.exp(-(t - tp[0]) / .1); if (n % 2) p.timp = v; else p.timp2 = v; }
		p.nod = st.beatHit * .8;
	} else if (who === 'bass') {
		p.pluck = hit('bass', null, t, .12); const e = lastEv('bass', null, t); p.pitch = e ? clamp((e[4] - 28) / 22) : .5; p.nod = st.beatHit;
		const h = held('bass', null, t); p.bowpos = h ? ((countBefore('bass', null, t) % 2) ? (t - h[0]) / h[1] : 1 - (t - h[0]) / h[1]) : .5;
	} else if (who === 'guitar') {
		p.strum = hit('guitar', null, t, .1); const e = lastEv('guitar', ['lead'], t); p.fret = e ? clamp((e[4] - 64) / 28) : .4;
		p.solo = st.solo || 0; p.lean = st.solo ? .8 : .2; p.head = st.beatHit * .5;
		const h = held('guitar', ['violin', 'strings'], t); p.bowpos = h ? ((countBefore('guitar', ['violin', 'strings'], t) % 2) ? (t - h[0]) / h[1] : 1 - (t - h[0]) / h[1]) : .5;
	} else if (who === 'keys') { p.press = hit('keys', null, t, .12); p.press2 = hit('keys', null, t - .05, .12); p.nod = st.beatHit * .6; }
	else if (who === 'vox') { const h = held('vox', null, t); p.open = h ? .45 + .55 * Math.exp(-(t - h[0]) / .25) : 0; p.arm = h && h[1] > 1 ? clamp((t - h[0]) / .6) * .9 : (h ? .25 : 0); }
	else if (who === 'tbn') { const h = held('tbn', null, t); const e = lastEv('tbn', null, t); p.slide = e ? clamp(1 - (e[4] - 46) / 24) : .3; }
	else { const h = held(who, null, t); p.blow = h ? 1 : hit(who, null, t, .2); p.lift = p.blow * .5; }
	return p;
}
// ---------------------------------------------------------------- lanes: one row per part, 16 cells per bar, the light sweeping across
function chordName(ps) { const pcs = [...new Set(ps.map((p) => p % 12))], N = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
	for (const r of pcs) { if (pcs.includes((r + 4) % 12) && pcs.includes((r + 7) % 12)) return N[r]; if (pcs.includes((r + 3) % 12) && pcs.includes((r + 7) % 12)) return N[r] + 'm'; } return ''; }
function lanes(t, S, plan, st, amt) {
	if (amt <= 0.01) return '';
	const rowsAll = ROWS[plan.rows] || [];
	const b = beatOf(S, t), bar = Math.max(0, Math.min(S.bars - 1, Math.floor(b / 4))), bs = S.beats[bar * 4], be = S.beats[Math.min(S.beats.length - 1, bar * 4 + 4)];
	// a row shows once its part has played in this section (and stays)
	const rows = rowsAll.filter(([who, parts]) => { const ws = who === 'horns' ? ['sax', 'tpt', 'tbn', 'horns'] : [who];
		return ws.some((w) => evs(w, who === 'horns' ? null : parts).some((a) => { const i = lastIdx(a, t + .05); return i >= 0 && a[i][0] >= S.t0 - .01; })); });
	if (!rows.length) return '';
	const n = rows.length, rh = clamp(250 / n, 30, 66), x0 = 300, x1 = 1870, cw = (x1 - x0) / 16, y1 = 1058, y0 = y1 - n * rh;
	let s = `<g opacity="${f1(amt)}" transform="translate(0 ${f1((1 - amt) * 60)})">`;
	s += rect(30, y0 - 18, 1860, n * rh + 30, '#0C0B12', 'opacity=".78" rx="16"');
	const X = (tt) => x0 + (tt - bs) / (be - bs) * (x1 - x0);
	// beat columns, counts and strong/weak sizes
	for (let k = 0; k < 16; k++) { const strong = plan.strong ? [1, .45, .8, .45][Math.floor(k / 4)] : 1;
		if (k % 4 === 0) s += rect(x0 + k * cw + 1, y0 - 8, cw * 4 - 2, n * rh + 6, '#FFFFFF', `opacity="${f1(.035 + (plan.strong ? .07 * strong : 0))}" rx="8"`); }
	if (plan.count) for (let k = 0; k < 4; k++) { const on = Math.floor(b) % 4 === k && b >= 0, sz = plan.strong ? [54, 30, 44, 30][k] : 44;
		s += `<text x="${f1(x0 + (k * 4 + 2) * cw)}" y="${f1(y0 - 30)}" text-anchor="middle" font-family="DejaVu Sans" font-weight="900" font-size="${sz}" fill="${on ? '#FFC94A' : '#FFFFFF'}" opacity="${on ? 1 : .55}" filter="url(#tshadow)">${k + 1}</text>`;
		if (plan.strong) s += `<text x="${f1(x0 + (k * 4 + 2) * cw)}" y="${f1(y0 - 86)}" text-anchor="middle" ${F} font-weight="900" font-size="${[40, 26, 34, 26][k]}" fill="#FFFFFF" opacity=".8" filter="url(#tshadow)">${['强', '弱', '次强', '弱'][k]}</text>`; }
	rows.forEach(([who, parts, label], r) => {
		const y = y0 + r * rh, col = who === 'horns' ? '#E3B23C' : BAND[who].col, nm = who === 'horns' ? '客人' : BAND[who].name;
		s += circ(66, y + rh / 2, rh * .32, col) + `<text x="${f1(66)}" y="${f1(y + rh / 2 + rh * .13)}" text-anchor="middle" ${F} font-size="${f1(rh * .34)}" font-weight="900" fill="#17151F">${nm[0]}</text>`;
		s += `<text x="${f1(104)}" y="${f1(y + rh / 2 + rh * .16)}" ${F} font-size="${f1(Math.min(34, rh * .48))}" font-weight="900" fill="${col}">${label}</text>`;
		s += `<text x="${f1(x0 - 16)}" y="${f1(y + rh / 2 + rh * .14)}" text-anchor="end" ${F} font-size="${f1(Math.min(24, rh * .36))}" font-weight="700" fill="#FFFFFF" opacity=".55">${who === 'horns' ? '三位客人' : nm}</text>`;
		for (let k = 0; k < 16; k++) s += rect(x0 + k * cw + 3, y + 4, cw - 6, rh - 8, k % 4 === 0 ? '#2A2836' : '#201E2A', 'rx="6"');
		const ws = who === 'horns' ? ['sax', 'tpt', 'tbn', 'horns'] : [who];
		const drum = who === 'drums' || who === 'crowd';
		let chordDone = {};
		for (const w of ws) for (const a of evs(w, who === 'horns' ? null : parts)) {
			let i = lastIdx(a, bs - .012) + 1;
			for (; i < a.length && a[i][0] < be - .01; i++) {
				const e = a[i], xs = X(e[0]), live = t >= e[0] && t < e[0] + Math.max(e[1], .14);
				const c2 = who === 'horns' ? (BAND[w] || BAND.sax).col : col;
				let wpx = drum ? cw * .62 : Math.max(cw * .5, X(e[0] + e[1]) - xs - 4);
				const fresh = live ? Math.exp(-(t - e[0]) / .18) : 0;
				const hh = drum ? (rh - 14) * (.3 + .7 * Math.pow(Math.min(1, e[5] / 120), 1.5)) : (who === 'keys' || who === 'guitar' && parts.includes('strings')) ? rh - 14 : rh * .5;
				const key = Math.round(e[0] * 50);
				if ((who === 'keys' || parts.includes('strings') || parts.includes('power')) && chordDone[key]) continue; chordDone[key] = 1;
				s += rect(xs + 2, y + (rh - hh) / 2, Math.min(wpx, x1 - xs - 2), hh, c2, `rx="${f1(Math.min(10, hh / 2))}" opacity="${f1(live ? 1 : (t > e[0] ? .7 : .38))}"`);
				if (fresh > .02) s += rect(xs - 4, y + (rh - hh) / 2 - 6, Math.min(wpx, x1 - xs) + 12, hh + 12, c2, `rx="12" opacity="${f1(.5 * fresh)}" filter="url(#blur8)"`);
				if (plan.chordNames && who === 'keys') { const ps = a.filter((q) => Math.abs(q[0] - e[0]) < .03).map((q) => q[4]); const nm2 = chordName(ps);
					if (nm2) s += `<text x="${f1(xs + 18)}" y="${f1(y + rh / 2 + rh * .16)}" font-family="DejaVu Sans" font-weight="900" font-size="${f1(rh * .45)}" fill="#17151F">${nm2}</text>`; }
				if (e[6] && who === 'vox' && plan.rows === 'jazz') s += `<text x="${f1(xs + 6)}" y="${f1(y + rh / 2 + rh * .14)}" font-family="DejaVu Sans" font-weight="900" font-size="${f1(rh * .36)}" fill="#17151F">${e[6]}</text>`;
			}
		}
		if (plan.groove && who === 'drums' && parts[0] === 'kick') {   // the kick that moves from cell 9 to cell 11
			const u = clamp((b - 3) / 1.2); if (b < 6) s += rect(lerp(x0 + 8 * cw, x0 + 10 * cw, ease(u)) - 6, y - 4, cw * .62 + 12, rh, 'none', `stroke="#FFC94A" stroke-width="5" rx="10" opacity="${f1(1 - clamp((b - 5)))}"`)
				+ (b > 2 && b < 6 ? `<text x="${f1(x0 + 9.4 * cw)}" y="${f1(y - 10)}" text-anchor="middle" font-family="DejaVu Sans" font-size="40" font-weight="900" fill="#FFC94A">→</text>` : '');
		}
	});
	const px = X(t);
	if (px >= x0 && px <= x1) s += rect(px - 3, y0 - 12, 6, n * rh + 18, '#FFF3D6', 'rx="3"') + rect(px - 14, y0 - 12, 28, n * rh + 18, '#FFF3D6', 'opacity=".18" rx="10"');
	return s + '</g>';
}
// ---------------------------------------------------------------- headline (the subtitle), BPM counter, title, knobs
function headline(t) {
	const sub = SC.subs.find((s) => t >= s[0] && t < s[1]); if (!sub) return '';
	const tA = SECS[SI.cold].beats[12], tB = SECS[SI.pulse].beats[4]; if (t >= tA && t < tB) return '';
	const [t0, t1, txt] = [Math.max(sub[0], t >= tB && sub[0] < tB ? tB : sub[0]), sub[1], sub[2]], u = ease((t - t0) / .28), out = clamp((t1 - t) / .2);
	const i = txt.indexOf('：'), a = i >= 0 ? txt.slice(0, i + 1) : '', bpart = i >= 0 ? txt.slice(i + 1) : txt;
	const esc = (x) => x.replace(/(\d+)/g, '<tspan fill="#FFC94A">$1</tspan>').replace(/「(.+?)」/g, '「<tspan fill="#FFC94A">$1</tspan>」');
	const len = [...txt].length, fs = len > 15 ? 76 : len > 11 ? 88 : 100;
	return `<g opacity="${f1(u * out)}" transform="translate(0 ${f1((1 - u) * 30)})" filter="url(#tshadow)"><text x="80" y="150" ${F} font-size="${fs}" font-weight="900" fill="#FFF7E8">${a ? `<tspan fill="#FFC94A">${a}</tspan>` : ''}${esc(bpart)}</text></g>`;
}
function bpmCounter(t, S, plan) {
	const b = beatOf(S, t), [b0, b1] = plan.bpm === 1 ? [-1, 1e9] : plan.bpm ? [plan.bpm[0] * 4, plan.bpm[1] * 4] : [0, -1];
	if (b < b0 || b >= b1) return '';
	const prev = SECS[SI[S.name] - 1], from = prev && PLAN[prev.name] && PLAN[prev.name].bpm === 1 ? prev.bpm : S.bpm;
	const v = Math.round(lerp(from, S.bpm, ease(b / 1.5))), u = ease((b - b0) / .6), pulse = Math.pow(1 - (b % 1), 4);
	return `<g opacity="${f1(u)}" filter="url(#tshadow)"><text x="1840" y="190" text-anchor="end" font-family="DejaVu Sans" font-size="${f1(150 + 10 * pulse)}" font-weight="900" fill="#FFC94A">${v}</text>
		<text x="1840" y="236" text-anchor="end" font-family="DejaVu Sans" font-size="40" font-weight="900" fill="#FFF7E8" letter-spacing="6">BPM</text>${circ(1500, 120, 14 + 10 * pulse, '#FF5D6C', `opacity="${f1(.4 + .6 * pulse)}"`)}</g>`;
}
function knobs(t, S) {
	const b = beatOf(S, t); if (b < 16 || b >= 64) return '';
	const u = ease((b - 16) / 1.5) * clamp((64 - b) / 1.5), L = [['速度', 'BPM'], ['鼓点', '哪几格'], ['乐器', '谁来演奏'], ['唱法', '怎么唱']];
	let s = `<g opacity="${f1(u)}">`;
	L.forEach(([a, sub], i) => { const x = 1160 + i * 190, y = 260, on = b >= 24 + i * 8 - (i === 3 ? 8 : 0), turn = on ? ease((b - (24 + i * 8 - (i === 3 ? 8 : 0))) / 2) : 0, ang = -130 + 260 * (.2 + .6 * ((i * 37 + Math.floor(b / 4) * 13) % 10) / 10) * turn;
		s += circ(x, y, 64, '#17151F', 'opacity=".85"') + circ(x, y, 52, on ? '#FFC94A' : '#4A4858') + seg([x, y], [x + 40 * Math.sin(ang * Math.PI / 180), y - 40 * Math.cos(ang * Math.PI / 180)], 9, '#17151F')
			+ `<text x="${x}" y="${y + 104}" text-anchor="middle" ${F} font-size="38" font-weight="900" fill="#FFF7E8" filter="url(#tshadow)">${a}</text>`; });
	return s + '</g>';
}
function title(t) {
	const S = SECS[SI.cold], tt = S.beats[12], u = (t - tt) / .25; if (u < 0 || t > SECS[SI.pulse].beats[4]) return '';
	const out = clamp((SECS[SI.pulse].beats[4] - t) / .4), sc = 1 + .25 * Math.exp(-u * 2.5);
	return `<g opacity="${f1(clamp(u) * out)}" transform="translate(960 470) scale(${f1(sc)})" filter="url(#tshadow)">${rect(-860, -150, 1720, 300, '#17151F', 'opacity=".72" rx="20"')}
		<text x="0" y="-12" text-anchor="middle" ${F} font-size="118" font-weight="900" fill="#FFF7E8">一声「<tspan fill="#FFC94A">咚</tspan>」，</text>
		<text x="0" y="118" text-anchor="middle" ${F} font-size="104" font-weight="900" fill="#FFF7E8">怎么变成一整支乐队？</text></g>`;
}
// ---------------------------------------------------------------- the split-screen entrance panel
function entrance(t, look) {
	for (const [sec, who, bar, tag] of ENTRANCES) {
		const S = SECS[SI[sec]], ta = tOf(sec, bar * 4), tb = tOf(sec, bar * 4 + 4);
		if (t < ta || t > tb) continue;
		const u = ease((t - ta) / .35), v = ease((tb - t) / .35), k = Math.min(u, v), c = BAND[who];
		const x = lerp(W + 200, 1080, k), pts = [[x, 0], [W, 0], [W, H], [x - 260, H]];
		let s = `<clipPath id="ent"><polygon points="${P(pts)}"/></clipPath><g clip-path="url(#ent)">` + rect(0, 0, W, H, c.dark) + poly([[x + 120, 0], [W, 0], [W, H], [x - 80, H]], c.col, 'opacity=".55"');
		for (let i = 0; i < 14; i++) s += seg([x - 300 + i * 90, H], [x + 40 + i * 90, 0], 6, '#FFFFFF', 'opacity=".08"');
		s += `<g filter="url(#lit)" style="--rim:#FFFFFF">${DRAW[who](lerp(1760, 1540, k), 930, .82, look, poseOf(who, t, { bob: 0, beatHit: 0 }))}</g></g>`;
		s += poly(pts.slice(0, 1).concat([[x - 260, H]]), 'none') + seg([x, 0], [x - 260, H], 10, '#FFF7E8');
		s += `<g opacity="${f1(k)}" filter="url(#tshadow)"><text x="${f1(x - 60)}" y="1030" ${F} font-size="76" font-weight="900" fill="#FFF7E8">${tag}</text></g>`;
		return s;
	}
	return '';
}
// ---------------------------------------------------------------- marks: every note leaves a mark in its player's colour
function marks(t, cast, cam) {
	let s = '';
	for (const [who, [x, y, sc]] of Object.entries(cast)) {
		const a = IDX[who]; if (!a) continue; const i = lastIdx(a, t); const c = BAND[who].col;
		for (let k = i; k >= 0 && k > i - 10; k--) { const e = a[k], age = t - e[0]; if (age > .7) break;
			const u = age / .7, ax = x + (who === 'drums' ? (e[3] === 'kick' ? 0 : e[3] === 'snare' ? -160 : 240) * sc : (who === 'vox' ? -40 : 0)), ay = y - (who === 'drums' ? (e[3] === 'kick' ? 150 : 330) : who === 'vox' ? 560 : 400) * sc;
			if (who === 'drums') s += circ(ax, ay, (40 + 160 * u) * sc, 'none', `stroke="${c}" stroke-width="${f1(10 * (1 - u))}" opacity="${f1((1 - u) * .8)}"`);
			else if (who === 'vox') s += `<path d="M${f1(ax)} ${f1(ay)} q${f1(-60 - 200 * u)} ${f1(-40 * Math.sin(u * 9))} ${f1(-120 - 380 * u)} ${f1(-30)}" stroke="${c}" stroke-width="${f1(8 * (1 - u))}" fill="none" opacity="${f1(1 - u)}"/>`;
			else s += rect(ax - 12 + (hash(k) - .5) * 160 * u, ay - 150 * u - 12, 24, 24, c, `opacity="${f1((1 - u) * .85)}" transform="rotate(${f1(45 + 90 * u)} ${f1(ax + (hash(k) - .5) * 160 * u)} ${f1(ay - 150 * u)})"`);
		}
	}
	return s;
}
// ---------------------------------------------------------------- one frame
function camAt(plan, u) { const K = plan.cam || [[0, 960, 540, 1], [1, 960, 540, 1]]; let i = 0; while (i + 1 < K.length && K[i + 1][0] <= u) i++;
	const a = K[i], b = K[Math.min(K.length - 1, i + 1)], v = b[0] > a[0] ? easeIO((u - a[0]) / (b[0] - a[0])) : 0; return [lerp(a[1], b[1], v), lerp(a[2], b[2], v), lerp(a[3], b[3], v)]; }
window.renderAt = (t) => {
	const si = secIdx(t), S = SECS[si], plan = PLAN[S.name], b = beatOf(S, t), u = clamp((t - S.t0) / (S.t1 - S.t0));
	const beatPhase = ((b % 1) + 1) % 1, beatHit = Math.pow(1 - beatPhase, 3);
	const st = { beatPhase, beatNum: Math.floor(b), beatHit, bob: beatHit, energy: S.name === 'rock' ? 1.6 : S.name === 'classical' ? .4 : 1 };
	if (plan.world === 'room') { st.posters = plan.posters ? clamp(b / 4) : (si > SI.bridge ? 1 : 0); st.door = S.name === 'guitar' ? ease(b / .5) : (si > SI.guitar ? 1 : 0); st.clockM = Math.floor((t / 125) * 55) % 60; }
	if (plan.world === 'hall') { const ps = held('guitar', ['strings'], t) ? SC.ev.filter((e) => e[3] === 'strings' && Math.abs(e[0] - held('guitar', ['strings'], t)[0]) < .04).map((e) => e[4]) : []; st.chord = [0, 1, 2].map((k) => ps.length > k ? .4 + .6 * Math.exp(-(t - held('guitar', ['strings'], t)[0]) / .8) : 0); st.spotX = 960; }
	if (plan.world === 'club') { st.neon = beatHit; st.door = ease((b - 32) / 1.2); }
	if (plan.world === 'arena') { st.led = S.name === 'rock' && b < 16 ? 'count' : S.name === 'cold' && b >= 12 ? 'title' : 'bars'; st.lasers = (S.name === 'rock' && b >= 64) || S.name === 'cold' ? 1 : 0; st.crowdJump = beatHit; }
	if (plan.world === 'roof') st.sun = S.name === 'outro' ? 1 : .15 + .85 * u;
	if (plan.world === 'dark') { st.flash = Math.max(...[0, 4, 8, 12, 14].map((k) => (b >= k ? Math.exp(-(b - k) * 3) : 0))); }
	st.solo = S.name === 'rock' && b >= 64 && b < 80 ? 1 : 0;
	const Wd = WORLD[plan.world](t, st);
	const [cx, cy, z] = camAt(plan, u);
	// shake on the hardest hits
	const shakeT = [tOf('cold', 12), tOf('rock', 92)].find((x) => t >= x && t < x + .5); const sh = shakeT ? 14 * Math.exp(-(t - shakeT) * 8) * Math.sin((t - shakeT) * 90) : 0;
	const camT = `translate(${f1(960 + sh)} 540) scale(${f1(z)}) translate(${f1(-cx)} ${f1(-cy + (540 - 540))})`;
	let band = '';
	let cast = plan.cast || {};
	if (plan.world === 'room' && !plan.cast) { cast = {}; for (const [who, sec] of Object.entries(ROOM_ENTER)) if (si >= SI[sec]) cast[who] = ROOM_POS[who]; }
	const order = Object.entries(cast).sort((a, b2) => a[1][1] - b2[1][1]);
	for (const [who, [x, y, sc]] of order) {
		let ent = 1; const es = ROOM_ENTER[who];
		if (plan.world === 'room' && es && SI[es] === si) ent = ease(b / 1.2);
		if (S.name === 'jazz' && ['sax', 'tpt', 'tbn'].includes(who)) ent = ease((b - (who === 'sax' ? 32 : who === 'tpt' ? 34 : 36)) / 1.2);
		if (S.name === 'classical' && who === 'flute') ent = ease((b - 8) / 1.2);
		if (ent <= 0) continue;
		const dx = (1 - ent) * (who === 'guitar' && plan.world === 'room' ? 300 : who === 'bass' ? -300 : 0), dy = (1 - ent) * 60;
		band += `<g opacity="${f1(ent)}">${ell(x + dx, y + 4, 170 * sc / .6, 22, '#000', 'opacity=".35"')}${DRAW[who](x + dx, y + dy, sc, plan.look, poseOf(who, t, st))}</g>`;
	}
	if (plan.walkers) {   // the runs: silhouettes walking (or climbing) across
		const n = plan.walkers.length;
		plan.walkers.forEach((who, i) => { const ph = (t * 1.6 + i * .37) % 1, x = -200 + ((t - S.t0) / (S.t1 - S.t0)) * 900 + i * 190, yb = plan.climb ? 900 - (x / 150) * 70 + 40 : 790;
			band += walker(who, x, Math.min(900, yb), .5, ph, plan.world === 'dark' ? (st.flash > .2 ? '#17151F' : '#0A0810') : '#0A0A14', (plan.hats || {})[who]); });
	}
	const marksSvg = plan.world !== 'dark' && plan.world !== 'street' && plan.world !== 'stairs' ? marks(t, cast) : '';
	let out = DEFS + `<g transform="${camT}">${Wd.back}${marksSvg}<g filter="url(#lit)" style="--rim:${Wd.rim}">${band}</g>${Wd.front}</g>`;
	// overlays (screen space)
	const lanesAmt = plan.rows ? (S.name === 'cold' ? .85 : S.name === 'outro' ? clamp(1 - b / 2) : (S.name === 'rock' && b >= 64 && b < 80) ? .25 : (S.name === 'finale' && b >= 48) ? .35 : 1) : 0;
	out += lanes(t, S, plan, st, lanesAmt);
	if (plan.clock) out += `<g filter="url(#tshadow)"><text x="1840" y="200" text-anchor="end" font-family="DejaVu Sans" font-size="150" font-weight="900" fill="#FFC94A">${plan.clock}</text></g>`;
	out += bpmCounter(t, S, plan) + (plan.knobs ? knobs(t, S) : '') + entrance(t, plan.look) + headline(t) + title(t);
	// cuts between worlds: a white flash on the downbeat
	const prev = SECS[si - 1]; if (prev && PLAN[prev.name].world !== plan.world) { const k = (t - S.t0) / .18; if (k < 1) out += rect(0, 0, W, H, '#FFF7E8', `opacity="${f1(.8 * (1 - k))}"`); }
	if (S.name === 'cold' && b >= 12) out += rect(0, 0, W, H, '#000', `opacity="${f1(clamp((b - 12) * 1.5) * .0)}"`);
	if (S.name === 'outro' && b > 12) out += rect(0, 0, W, H, '#000', `opacity="${f1(clamp((b - 12) / 3.5))}"`);
	out += rect(0, 0, W, H, 'url(#vig)') + `<rect width="${W + 256}" height="${H + 256}" fill="url(#grain)" opacity=".07" transform="translate(${f1(-hash(Math.floor(t * 30)) * 255)} ${f1(-hash(Math.floor(t * 30) + 7) * 255)})"/>`;
	document.getElementById('art').innerHTML = out;
};
window.READY = true;
