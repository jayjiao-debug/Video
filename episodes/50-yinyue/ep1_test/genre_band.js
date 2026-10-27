// The band per genre: same five players (same faces, builds and personalities), different outfits, instruments and stage.
// Needs band.js (BAND, poly, seg, lerp2, SKIN, INK). gX(x, y, s, genre, pose) draws player X; feet at the origin.
const OUTFIT = {
	classical: { top: '#22222C', topD: '#15151C', legs: '#15151C', legsD: '#0C0C12', shirt: '#F4F1E8' },
	jazz: { top: '#5A4636', topD: '#3E3024', legs: '#2A2A36', legsD: '#1C1C26', shirt: '#E8DCC0' },
	rock: { top: '#26242E', topD: '#17161D', legs: '#2E4A6E', legsD: '#20354F', shirt: '#E8E2D6' },
};
const fedora = (x, y, w, col, band) => poly([[x - w * .9, y], [x + w * .9, y], [x + w * .7, y - 12], [x - w * .7, y - 12]], col)
	+ poly([[x - w * .55, y - 10], [x + w * .55, y - 10], [x + w * .45, y - w * .9], [x, y - w * .75], [x - w * .45, y - w * .9]], col) + poly([[x - w * .55, y - 10], [x + w * .55, y - 10], [x + w * .53, y - 26], [x - w * .53, y - 26]], band);
const bowtie = (x, y, col, k = 1) => poly([[x - 26 * k, y - 12 * k], [x, y], [x - 26 * k, y + 12 * k]], col) + poly([[x + 26 * k, y - 12 * k], [x, y], [x + 26 * k, y + 12 * k]], col) + `<rect x="${x - 6 * k}" y="${y - 6 * k}" width="${12 * k}" height="${12 * k}" fill="${col}"/>`;
const studs = (pts) => pts.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4" fill="#D8DCE4"/>`).join('');

// ---------------------------------------------------------------- 大熊 (drums): timpani / brush kit / big rock kit
function gDrums(x, y, s, genre, { hit = 0 } = {}) {
	const c = BAND.drums, o = OUTFIT[genre]; let g = '';
	const top = genre === 'rock' ? c.col : o.top, topD = genre === 'rock' ? c.dark : o.topD;
	if (genre === 'classical') {   // standing behind two timpani, mallets
		g += poly([[-150, -420], [150, -420], [110, -150], [-110, -150]], top) + poly([[30, -420], [150, -420], [110, -150], [30, -150]], topD);
		g += poly([[-36, -420], [36, -420], [0, -330]], o.shirt) + bowtie(0, -404, c.col, 1.1);
		const lh = lerp2([-200, -330], [-180, -260], hit), rh = lerp2([200, -300], [180, -280], 1 - hit);
		g += seg([-120, -400], [-190, -320], 60, top) + seg([-190, -320], lh, 40, SKIN.a, 'round') + seg(lh, lerp2([-240, -420], [-170, -205], hit), 8, '#3A2A1A', 'round') + `<circle cx="${lerp2([-240, -420], [-170, -205], hit)[0]}" cy="${lerp2([-240, -420], [-170, -205], hit)[1]}" r="16" fill="#EDE2C8"/>`;
		g += seg([120, -400], [190, -320], 60, topD) + seg([190, -320], rh, 40, SKIN.aD, 'round') + seg(rh, lerp2([240, -420], [170, -205], 1 - hit), 8, '#3A2A1A', 'round') + `<circle cx="${lerp2([240, -420], [170, -205], 1 - hit)[0]}" cy="${lerp2([240, -420], [170, -205], 1 - hit)[1]}" r="16" fill="#EDE2C8"/>`;
		for (const [cx, r] of [[-170, 140], [170, 130]]) g += `<ellipse cx="${cx}" cy="-200" rx="${r}" ry="22" fill="#EDE2C8"/><path d="M${cx - r} -200 Q${cx - r * .9} -40 ${cx} -30 Q${cx + r * .9} -40 ${cx + r} -200Z" fill="#C8783A"/><path d="M${cx} -200 L${cx + r} -200 Q${cx + r * .9} -40 ${cx} -30Z" fill="#9A5626"/>` + seg([cx - r * .6, -60], [cx - r * .8, 0], 8, '#8A8F9E') + seg([cx + r * .6, -60], [cx + r * .8, 0], 8, '#8A8F9E');
	} else {
		const sh = [-122, -385], sh2 = [118, -385];
		const hHat = lerp2([-250, -360], [-262, -332], 1 - hit), hSn = lerp2([-150, -400], [-175, -300], hit);
		g += seg(sh, [-238, -300], 62, top) + seg([-238, -300], hHat, 44, SKIN.a, 'round') + seg(sh2, [60, -290], 62, topD) + seg([60, -290], hSn, 44, SKIN.aD, 'round');
		const tipA = lerp2([-360, -420], [-350, -372], 1 - hit), tipB = lerp2([-190, -500], [-245, -262], hit);
		if (genre === 'jazz') { g += seg(hHat, tipA, 6, '#C8B890', 'round') + poly([[tipA[0] - 14, tipA[1] - 20], [tipA[0] + 14, tipA[1] - 20], [tipA[0], tipA[1] + 6]], '#C8B890') + seg(hSn, tipB, 6, '#C8B890', 'round') + poly([[tipB[0] - 14, tipB[1] + 20], [tipB[0] + 14, tipB[1] + 20], [tipB[0], tipB[1] - 6]], '#C8B890'); }
		else g += seg(hHat, tipA, 10, '#E9D9B0', 'round') + seg(hSn, tipB, 10, '#E9D9B0', 'round');
		g += poly([[-160, -405], [160, -405], [100, -200], [-100, -200]], top) + poly([[40, -405], [160, -405], [100, -200], [40, -200]], topD);
		if (genre === 'rock') { g += poly([[-160, -405], [-112, -405], [-150, -300]], SKIN.a) + poly([[160, -405], [112, -405], [150, -300]], SKIN.aD) + studs([[-70, -380], [-40, -380], [40, -380], [70, -380]]); }
		if (genre === 'jazz') g += poly([[-30, -405], [30, -405], [0, -330]], o.shirt) + poly([[-6, -400], [6, -400], [10, -330], [0, -320], [-10, -330]], '#8A2A2A');
	}
	// tiny head, beard (+ fedora / bandana / slicked hair)
	g += poly([[-30, -500], [30, -500], [34, -430], [-34, -430]], SKIN.a) + poly([[8, -500], [30, -500], [34, -430], [8, -430]], SKIN.aD);
	if (genre === 'rock') g += poly([[-36, -505], [36, -505], [40, -480], [-40, -480]], '#1C1A2A') + poly([[36, -500], [70, -520], [62, -488]], '#1C1A2A');
	else if (genre === 'jazz') g += fedora(0, -490, 52, '#3A3A46', '#8A2A2A');
	else g += poly([[-34, -500], [34, -500], [30, -520], [-30, -520]], '#2A1A10');
	g += poly([[-44, -452], [44, -452], [24, -330], [0, -300], [-24, -330]], '#5A3322') + poly([[8, -452], [44, -452], [24, -330], [0, -300]], '#43251A');
	g += `<rect x="-22" y="-468" width="12" height="5" fill="${INK}"/><rect x="10" y="-468" width="12" height="5" fill="${INK}"/>`;
	if (genre !== 'classical') {   // the kit in front
		const big = genre === 'rock' ? 1.1 : .9, kr = 150 * big;
		g += poly([[-382, -340], [-282, -340], [-286, -330], [-378, -330]], '#E3B23C') + poly([[-380, -322], [-284, -322], [-292, -314], [-372, -314]], '#C8952A') + seg([-332, -312], [-332, 0], 8, '#8A8F9E');
		g += `<rect x="-300" y="-292" width="150" height="56" fill="#D7DCE6"/><rect x="-225" y="-292" width="75" height="56" fill="#A9B0C0"/>` + seg([-262, -236], [-282, 0], 7, '#8A8F9E') + seg([-188, -236], [-168, 0], 7, '#8A8F9E');
		g += `<rect x="190" y="-250" width="130" height="190" fill="${genre === 'jazz' ? '#7A4A2A' : '#2A2A30'}"/><rect x="255" y="-250" width="65" height="190" fill="${genre === 'jazz' ? '#5A341C' : '#18181E'}"/>`;
		if (genre === 'rock') g += seg([400, 0], [380, -560], 7, '#8A8F9E') + poly([[270, -560], [490, -590], [496, -578], [276, -546]], '#E3B23C') + seg([-420, 0], [-410, -520], 7, '#8A8F9E') + poly([[-520, -520], [-300, -540], [-296, -528], [-516, -508]], '#E3B23C');
		g += `<circle cx="0" cy="${-kr}" r="${kr}" fill="${genre === 'jazz' ? '#7A4A2A' : '#2A2A30'}"/><path d="M0 0 A${kr} ${kr} 0 0 1 0 ${-2 * kr}Z" fill="${genre === 'jazz' ? '#5A341C' : '#18181E'}"/><circle cx="0" cy="${-kr}" r="${kr * .8}" fill="#EDE2C8"/>`;
		g += genre === 'rock' ? `<path d="M-70 ${-kr - 10} L-10 ${-kr - 50} L-30 ${-kr} L40 ${-kr - 40} L-10 ${-kr + 50} L10 ${-kr + 10} Z" fill="${c.col}"/>` : `<text x="0" y="${-kr + 22}" text-anchor="middle" font-family="Noto Serif CJK SC, serif" font-size="64" font-weight="900" fill="#7A4A2A">Jazz</text>`;
	}
	return `<g transform="translate(${x} ${y}) scale(${s})">${g}</g>`;
}

// ---------------------------------------------------------------- 长脚 (bass): upright bass (classical: bow) / electric in leather
function gBass(x, y, s, genre, { pluck = 0 } = {}) {
	const c = BAND.bass, o = OUTFIT[genre]; let g = '';
	const top = o.top, topD = o.topD;
	g += poly([[-40, -330], [-6, -330], [-46, 0], [-74, 0]], o.legs) + poly([[6, -330], [40, -330], [56, 0], [28, 0]], o.legsD);
	g += poly([[-96, 0], [-40, 0], [-40, -18], [-80, -14]], INK) + poly([[24, 0], [96, 0], [70, -16], [28, -18]], INK);
	g += poly([[-46, -330], [46, -330], [70, -560], [-20, -572]], top) + poly([[18, -330], [46, -330], [70, -560], [34, -566]], topD);
	if (genre === 'rock') g += poly([[-46, -330], [-10, -330], [6, -566], [-20, -572]], c.col) + studs([[30, -520], [44, -480], [54, -440]]);   // tee under an open leather jacket
	else g += poly([[6, -566], [40, -560], [20, -470]], o.shirt);
	if (genre === 'classical') g += bowtie(26, -556, c.col, .8); if (genre === 'jazz') g += poly([[16, -560], [30, -560], [32, -470], [22, -462]], c.col);
	g += poly([[14, -566], [34, -564], [40, -610], [22, -612]], SKIN.b);
	g += poly([[-2, -612], [62, -616], [66, -700], [6, -706]], SKIN.b) + poly([[40, -614], [62, -616], [66, -700], [44, -702]], SKIN.bD);
	if (genre === 'jazz') g += fedora(32, -700, 66, '#2A2A36', c.col);
	else if (genre === 'classical') g += poly([[-4, -700], [70, -706], [74, -730], [0, -730]], INK);
	else g += poly([[-14, -700], [70, -706], [110, -760], [40, -790], [-20, -748]], INK);
	g += poly([[-4, -668], [76, -672], [74, -650], [-2, -648]], INK);
	if (genre === 'rock') {   // electric bass, low
		g += `<g transform="rotate(28 0 -330)"><rect x="-330" y="-342" width="300" height="22" fill="#2A2A30"/><rect x="-372" y="-350" width="50" height="38" fill="#1A1A20"/>
			${poly([[-60, -380], [70, -400], [110, -330], [60, -270], [-40, -280], [-80, -330]], c.col)}${poly([[20, -390], [70, -400], [110, -330], [60, -270], [20, -276]], c.dark)}</g>`;
		g += seg([-14, -548], [-110, -500], 30, top) + seg([-110, -500], [-204, -444], 26, SKIN.b, 'round') + seg([56, -548], [90, -440], 30, topD) + seg([90, -440], lerp2([20, -360], [34, -344], pluck), 26, SKIN.bD, 'round');
	} else {   // upright bass standing to his right (viewer's left), neck past his head
		const bx = -150;
		g += seg([bx + 20, -260], [bx + 60, -760], 18, '#2A1A10') + poly([[bx + 50, -790], [bx + 80, -780], [bx + 70, -740], [bx + 48, -748]], '#2A1A10');
		g += `<path d="M${bx - 60} -420 C${bx - 120} -400 ${bx - 120} -330 ${bx - 80} -300 C${bx - 140} -260 ${bx - 130} -60 ${bx + 20} -40 C${bx + 170} -60 ${bx + 180} -260 ${bx + 120} -300 C${bx + 160} -330 ${bx + 150} -410 ${bx + 90} -430 C${bx + 50} -450 ${bx - 20} -450 ${bx - 60} -420Z" fill="#B8642E"/>`;
		g += `<path d="M${bx + 20} -440 C${bx + 50} -450 ${bx + 150} -410 ${bx + 120} -300 C${bx + 180} -260 ${bx + 170} -60 ${bx + 20} -40Z" fill="#8A4420"/><rect x="${bx + 5}" y="-200" width="30" height="16" fill="${INK}"/>`;
		g += seg([bx + 20, -40], [bx + 20, 0], 8, '#8A8F9E');
		g += seg([-14, -548], [-60, -600], 30, top) + seg([-60, -600], [bx + 54, -660], 26, SKIN.b, 'round');
		const ph = genre === 'classical' ? lerp2([bx + 90, -250], [bx + 140, -270], pluck) : lerp2([bx + 50, -300], [bx + 60, -280], pluck);
		g += seg([56, -548], [60, -380], 30, topD) + seg([60, -380], ph, 26, SKIN.bD, 'round');
		if (genre === 'classical') g += seg([ph[0] - 160, ph[1] + 30], [ph[0] + 60, ph[1] - 10], 6, '#E8DCC0');
	}
	return `<g transform="translate(${x} ${y}) scale(${s})">${g}</g>`;
}

// ---------------------------------------------------------------- 炸毛 (guitar): violin / hollow-body / flying V
function gGuitar(x, y, s, genre, { strum = 0 } = {}) {
	const c = BAND.guitar, o = OUTFIT[genre]; let g = '';
	const top = genre === 'rock' ? c.col : o.top, topD = genre === 'rock' ? c.dark : o.topD;
	if (genre === 'rock') g += poly([[-30, -300], [0, -300], [-30, 0], [-56, 0]], o.legs) + poly([[0, -300], [30, -300], [80, -190], [50, -170]], o.legs) + poly([[80, -190], [50, -170], [30, -40], [56, -40]], o.legsD) + poly([[-34, -150], [-20, -150], [-22, -120], [-36, -120]], SKIN.c);
	else g += poly([[-30, -300], [0, -300], [-26, 0], [-52, 0]], o.legs) + poly([[0, -300], [30, -300], [44, 0], [18, 0]], o.legsD);
	g += poly([[-74, 0], [-20, 0], [-24, -20], [-66, -20]], genre === 'rock' ? '#F4F1E8' : INK) + (genre === 'rock' ? poly([[20, -40], [74, -40], [64, -60], [26, -60]], '#F4F1E8') : poly([[14, 0], [70, 0], [62, -20], [18, -20]], INK));
	g += poly([[-44, -300], [44, -300], [56, -480], [-50, -470]], top) + poly([[10, -300], [44, -300], [56, -480], [16, -476]], topD);
	if (genre === 'classical') g += poly([[-14, -478], [14, -478], [0, -420]], o.shirt) + bowtie(0, -470, c.col, .7);
	if (genre === 'jazz') g += poly([[-14, -478], [14, -478], [0, -400]], o.shirt) + poly([[-50, -470], [-14, -478], [-30, -300], [-44, -300]], '#4A3A2C');
	g += `<rect x="-12" y="-500" width="24" height="26" fill="${SKIN.c}"/>` + poly([[-36, -500], [36, -500], [30, -570], [-30, -570]], SKIN.c) + poly([[8, -500], [36, -500], [30, -570], [8, -570]], SKIN.cD);
	const hair = genre === 'rock' ? '#F2B632' : '#F7F0DA';   // same explosive hair; dyed for rock
	g += poly([[-70, -560], [-40, -610], [-60, -650], [-20, -630], [0, -690], [20, -632], [64, -660], [46, -612], [84, -590], [40, -566], [-40, -566]], hair);
	if (genre === 'jazz') g += fedora(0, -600, 50, '#3A2A1E', c.col);
	g += `<rect x="-20" y="-548" width="10" height="10" fill="${INK}"/><rect x="10" y="-548" width="10" height="10" fill="${INK}"/>`;
	if (genre === 'classical') {   // violin under the chin, bow across
		g += `<g transform="rotate(-24 -40 -500)"><path d="M-40 -520 C-70 -530 -80 -505 -70 -495 C-80 -485 -75 -462 -40 -470 C-5 -462 0 -485 -10 -495 C0 -505 -10 -530 -40 -520Z" fill="#B8642E" transform="translate(-40 0)"/><rect x="-200" y="-500" width="120" height="10" fill="#2A1A10"/></g>`;
		g += seg([-40, -460], [-110, -440], 28, top) + seg([-110, -440], [-180, -560], 24, SKIN.c, 'round');
		const bh = lerp2([90, -420], [140, -380], strum);
		g += seg([46, -460], [90, -400], 28, topD) + seg([90, -400], bh, 24, SKIN.cD, 'round') + seg([bh[0] - 200, bh[1] - 140], [bh[0] + 20, bh[1] + 10], 6, '#E8DCC0');
	} else {
		const hs = lerp2([30, -400], [40, -330], strum);
		g += `<g transform="rotate(34 0 -360)"><rect x="-300" y="-372" width="250" height="18" fill="#4A2E1A"/><rect x="-336" y="-378" width="40" height="30" fill="#2A1A10"/>`;
		g += genre === 'rock' ? poly([[-60, -400], [130, -450], [60, -362], [130, -280], [-60, -330]], '#D9483B') + poly([[0, -380], [40, -390], [40, -344], [0, -350]], INK)
			: `<ellipse cx="20" cy="-362" rx="110" ry="80" fill="#C8783A"/><ellipse cx="20" cy="-362" rx="70" ry="50" fill="#E3A85A"/><path d="M-20 -395 q-10 15 0 30 M60 -395 q10 15 0 30" stroke="${INK}" stroke-width="6" fill="none"/>`;
		g += '</g>' + seg([-40, -460], [-110, -420], 28, top) + seg([-110, -420], [-164, -476], 24, SKIN.c, 'round') + seg([46, -460], [84, -390], 28, topD) + seg([84, -390], hs, 24, SKIN.cD, 'round');
	}
	return `<g transform="translate(${x} ${y}) scale(${s})">${g}</g>`;
}

// ---------------------------------------------------------------- 小圆 (keys): grand piano (classical, jazz) / keytar (rock)
function gKeys(x, y, s, genre, { press = 0 } = {}) {
	const c = BAND.keys, o = OUTFIT[genre]; let g = '';
	const top = genre === 'rock' ? '#1C1A2A' : (genre === 'jazz' ? c.col : o.top), topD = genre === 'rock' ? '#121018' : (genre === 'jazz' ? c.dark : o.topD);
	const head = (dy = 0) => `<circle cx="0" cy="${-470 + dy}" r="62" fill="${SKIN.d}"/><path d="M0 ${-532 + dy} A62 62 0 0 1 0 ${-408 + dy}Z" fill="${SKIN.dD}"/>`
		+ (genre === 'rock' ? poly([[-66, -480 + dy], [-40, -540 + dy], [0, -548 + dy], [50, -540 + dy], [80, -500 + dy], [96, -560 + dy], [70, -470 + dy]], c.col)
			: `<path d="M-64 ${-470 + dy} A64 64 0 0 1 64 ${-470 + dy} L50 ${-500 + dy} L-50 ${-500 + dy}Z" fill="${INK}"/><circle cx="0" cy="${-548 + dy}" r="30" fill="${INK}"/>`)
		+ `<circle cx="-24" cy="${-466 + dy}" r="18" fill="none" stroke="${INK}" stroke-width="5"/><circle cx="24" cy="${-466 + dy}" r="18" fill="none" stroke="${INK}" stroke-width="5"/><rect x="-6" y="${-468 + dy}" width="12" height="4" fill="${INK}"/>`;
	if (genre === 'rock') {   // keytar slung, standing
		g += poly([[-26, -230], [-4, -230], [-10, 0], [-30, 0]], '#2E2A3A') + poly([[4, -230], [26, -230], [30, 0], [10, 0]], '#1E1A28') + poly([[-40, 0], [-6, 0], [-6, -40], [-36, -40]], INK) + poly([[6, 0], [40, 0], [36, -40], [6, -40]], INK);
		g += poly([[-44, -230], [44, -230], [36, -400], [-36, -400]], top) + poly([[8, -230], [44, -230], [36, -400], [8, -400]], topD) + studs([[-20, -380], [20, -380]]);
		g += head();
		g += `<g transform="rotate(-18 0 -300)">${poly([[-170, -320], [150, -320], [190, -360], [190, -280], [-170, -280]], c.col)}<rect x="-120" y="-316" width="230" height="22" fill="#F4F1E8"/>${[...Array(12).keys()].map((i) => `<rect x="${-116 + i * 19}" y="-316" width="2" height="22" fill="${INK}"/>`).join('')}</g>`;
		g += seg([-36, -390], [-90, -330], 24, top) + seg([-90, -330], [-60, -330 + 8 * press], 20, SKIN.d, 'round') + seg([36, -390], [100, -360], 24, topD) + seg([100, -360], [150, -360], 20, SKIN.dD, 'round');
	} else {   // seated behind a grand piano, lid up
		g += poly([[-44, -230], [44, -230], [36, -400], [-36, -400]], top) + poly([[8, -230], [44, -230], [36, -400], [8, -400]], topD);
		g += genre === 'classical' ? poly([[-36, -400], [36, -400], [0, -360]], o.shirt) + bowtie(0, -392, c.col, .7) : poly([[-36, -400], [36, -400], [0, -370]], '#F4F1E8');
		g += head();
		g += poly([[-260, -260], [240, -260], [200, -620], [-120, -330]], '#14131A') + poly([[-120, -330], [200, -620], [210, -610], [-108, -326]], '#3A3848');
		g += `<rect x="-280" y="-280" width="520" height="160" fill="#14131A"/><rect x="-280" y="-280" width="520" height="22" fill="#2A2834"/>${[[-260, -120], [200, -120]].map(([lx, ly]) => `<rect x="${lx}" y="${ly}" width="26" height="120" fill="#14131A"/>`).join('')}`;
		g += `<rect x="-250" y="-262" width="460" height="20" fill="#F4F1E8"/>${[...Array(23).keys()].map((i) => `<rect x="${-246 + i * 20}" y="-262" width="2" height="20" fill="${INK}"/>`).join('')}`;
		g += seg([-36, -390], [-80, -300], 24, top) + seg([-80, -300], [-50, -262 + 6 * press], 20, SKIN.d, 'round') + seg([36, -390], [80, -300], 24, topD) + seg([80, -300], [50, -262 + 6 * press], 20, SKIN.dD, 'round');
	}
	return `<g transform="translate(${x} ${y}) scale(${s})">${g}</g>`;
}

// ---------------------------------------------------------------- 大嗓门 (vocals): opera gown / sequin lounge dress + vintage mic / rock
function gVox(x, y, s, genre, { sing = 0 } = {}) {
	const c = BAND.vox; let g = '';
	if (genre === 'classical') g += poly([[-30, -470], [30, -470], [190, 0], [-190, 0]], '#7A1E3A') + poly([[0, -470], [30, -470], [190, 0], [20, 0]], '#56142A') + poly([[-60, -360], [60, -360], [40, -330], [-40, -330]], c.col);
	else if (genre === 'jazz') { g += poly([[-24, -470], [24, -470], [70, 0], [-70, 0]], c.col) + poly([[0, -470], [24, -470], [70, 0], [10, 0]], c.dark);
		for (let i = 0; i < 40; i++) g += `<circle cx="${-50 + ((i * 37) % 100) * (1 - ((i * 53) % 420) / 470) }" cy="${-440 + ((i * 53) % 420)}" r="4" fill="#FFE8B0" opacity=".8"/>`; }
	else { g += poly([[-30, -200], [-6, -200], [-20, 0], [-44, 0]], '#1C1A2A') + poly([[6, -200], [30, -200], [44, 0], [20, 0]], '#121018') + poly([[-60, 0], [-10, 0], [-14, -60], [-50, -60]], INK) + poly([[14, 0], [64, 0], [54, -60], [18, -60]], INK);
		g += poly([[-26, -470], [26, -470], [70, -200], [-70, -200]], '#E8E2D6') + poly([[0, -470], [26, -470], [70, -200], [10, -200]], '#C8C2B6') + poly([[-30, -380], [20, -400], [-10, -330]], c.col) + poly([[-70, -200], [70, -200], [60, -220], [-60, -220]], c.col); }
	g += `<rect x="-14" y="-505" width="28" height="40" fill="${SKIN.a}"/>`;
	const hair = genre === 'rock' ? '#1C1A2A' : '#B8302A';
	g += genre === 'classical' ? `<circle cx="20" cy="-600" r="40" fill="${hair}"/>` : poly([[-30, -590], [40, -600], [190, -520], [150, -480], [170, -430], [60, -500], [20, -500]], hair);
	g += `<g transform="rotate(-18 0 -540)">${poly([[-40, -500], [34, -500], [38, -590], [-36, -590]], SKIN.a)}${poly([[10, -500], [34, -500], [38, -590], [10, -590]], SKIN.aD)}${poly([[-40, -592], [40, -592], [30, -620], [-30, -620]], hair)}
		<rect x="-24" y="-566" width="14" height="5" fill="${INK}"/><rect x="8" y="-566" width="14" height="5" fill="${INK}"/>${poly([[-14, -530], [14, -530], [0, -530 + 22 + 10 * sing]], '#5A1A1A')}</g>`;
	if (genre === 'classical') {   // hands clasped at the chest
		g += seg([-24, -460], [-50, -380], 24, '#7A1E3A') + seg([24, -460], [50, -380], 24, '#56142A') + `<circle cx="0" cy="-380" r="28" fill="${SKIN.a}"/>`;
	} else if (genre === 'jazz') {   // vintage mic on a stand, one hand on it
		g += seg([-90, 0], [-90, -520], 8, '#8A8F9E') + `<rect x="-112" y="-580" width="44" height="64" rx="20" fill="#B8BCC6"/>${[...Array(5).keys()].map((i) => `<rect x="-108" y="${-570 + i * 12}" width="36" height="3" fill="#6A6E78"/>`).join('')}`;
		g += seg([-18, -460], [-70, -480], 24, c.col) + seg([-70, -480], [-90, -520], 20, SKIN.a, 'round') + seg([18, -460], [80, -380], 24, c.dark) + seg([80, -380], [130, -460], 20, SKIN.aD, 'round');
	} else {   // rock: mic stand tilted, arm up
		g += seg([-200, 0], [-40, -540], 8, '#8A8F9E') + `<circle cx="-40" cy="-548" r="16" fill="#3A3A48"/>`;
		g += seg([-18, -460], [-110, -560], 26, '#E8E2D6') + seg([-110, -560], [-120, -690 - 10 * sing], 22, SKIN.a, 'round') + seg([18, -460], [0, -520], 26, '#C8C2B6') + seg([0, -520], [-36, -540], 22, SKIN.aD, 'round');
	}
	return `<g transform="translate(${x} ${y}) scale(${s})">${g}</g>`;
}

// ---------------------------------------------------------------- jazz guests: the horn section
const HORNS = { sax: { name: '萨克斯 · 阿胖', col: '#C9A227', dark: '#8E7016' }, tpt: { name: '小号 · 鼓腮', col: '#3FA36A', dark: '#2A7048' }, tbn: { name: '长号 · 高个', col: '#D9578E', dark: '#A23A66' } };
function hornBody(c, { w = 50, h = 470, head = SKIN.c, headD = SKIN.cD, hat = '' } = {}) {
	return poly([[-26, -h * .6], [-4, -h * .6], [-12, 0], [-34, 0]], '#2A2A36') + poly([[4, -h * .6], [26, -h * .6], [34, 0], [12, 0]], '#1C1C26')
		+ poly([[-50, 0], [-10, 0], [-10, -16], [-44, -16]], INK) + poly([[10, 0], [52, 0], [44, -16], [10, -16]], INK)
		+ poly([[-w, -h * .6], [w, -h * .6], [w * .8, -h], [-w * .8, -h]], c.col) + poly([[w * .2, -h * .6], [w, -h * .6], [w * .8, -h], [w * .2, -h]], c.dark)
		+ `<rect x="-12" y="${-h - 24}" width="24" height="28" fill="${head}"/>` + poly([[-38, -h - 20], [38, -h - 20], [34, -h - 96], [-34, -h - 96]], head) + poly([[8, -h - 20], [38, -h - 20], [34, -h - 96], [8, -h - 96]], headD) + hat;
}
function gSax(x, y, s, { blow = 0 } = {}) {
	const c = HORNS.sax, h = 420; let g = '';
	g += poly([[-80, 0], [80, 0], [90, -250], [-90, -250]], '#2A2A36');   // chubby: wide trousers
	g += hornBody(c, { w: 90, h, head: SKIN.b, headD: SKIN.bD, hat: poly([[-40, -h - 96], [44, -h - 96], [60, -h - 110], [-10, -h - 130], [-50, -h - 110]], '#1C1A2A') });
	g += poly([[-30, -h - 70], [36, -h - 70], [34, -h - 56], [-28, -h - 56]], INK);   // shades
	g += `<g transform="rotate(${-8 - 6 * blow} 0 ${-h})"><path d="M-10 ${-h - 30} L-30 ${-h + 40} L-30 -170 C-30 -100 60 -100 70 -160 L80 -230" stroke="#E3B23C" stroke-width="34" fill="none" stroke-linejoin="round"/>${poly([[60, -240], [110, -260], [100, -210]], '#E3B23C')}</g>`;
	g += seg([-70, -h + 20], [-60, -250], 26, c.col) + `<circle cx="-40" cy="-250" r="18" fill="${SKIN.b}"/>` + seg([70, -h + 20], [40, -330], 26, c.dark) + `<circle cx="-20" cy="-330" r="18" fill="${SKIN.bD}"/>`;
	if (blow > .3) g += `<path d="M120 -280 l30 -20 M124 -250 l36 0" stroke="${c.col}" stroke-width="7" opacity="${blow}"/>`;
	return `<g transform="translate(${x} ${y}) scale(${s})">${g}</g>`;
}
function gTpt(x, y, s, { blow = 0 } = {}) {
	const c = HORNS.tpt, h = 380; let g = '';
	g += hornBody(c, { w: 46, h, head: SKIN.c, headD: SKIN.cD, hat: fedora(0, -h - 92, 44, '#2A2A36', c.col) });
	g += `<circle cx="-30" cy="${-h - 44}" r="${16 + 6 * blow}" fill="#F2A08A"/>`;   // puffed cheek
	g += `<rect x="-200" y="${-h - 52}" width="150" height="14" fill="#E3B23C"/>${poly([[-260, -h - 80], [-196, -h - 54], [-196, -h - 36], [-260, -h - 10]], '#E3B23C')}<rect x="-150" y="${-h - 70}" width="50" height="26" fill="none" stroke="#E3B23C" stroke-width="8"/>`;
	g += seg([-40, -h + 20], [-90, -h - 10], 22, c.col) + seg([-90, -h - 10], [-120, -h - 40], 18, SKIN.c, 'round') + seg([40, -h + 20], [0, -h - 20], 22, c.dark) + seg([0, -h - 20], [-60, -h - 40], 18, SKIN.cD, 'round');
	return `<g transform="translate(${x} ${y}) scale(${s})">${g}</g>`;
}
function gTbn(x, y, s, { slide = 0 } = {}) {
	const c = HORNS.tbn, h = 520; let g = '';
	g += hornBody(c, { w: 40, h, head: SKIN.d, headD: SKIN.dD, hat: poly([[-36, -h - 96], [36, -h - 96], [50, -h - 40], [40, -h + 10], [-30, -h - 40]], '#3A1E14') });
	const ext = 30 + 70 * slide;
	g += `<rect x="${-120 - ext}" y="${-h - 46}" width="${100 + ext}" height="10" fill="#E3B23C"/><rect x="${-120 - ext}" y="${-h - 26}" width="${100 + ext}" height="10" fill="#E3B23C"/><rect x="${-130 - ext}" y="${-h - 46}" width="12" height="30" fill="#E3B23C"/>`;
	g += `<rect x="-40" y="${-h - 84}" width="90" height="12" fill="#E3B23C"/>${poly([[-40, -h - 96], [-150, -h - 130], [-150, -h - 30], [-40, -h - 64]], '#E3B23C')}${poly([[-150, -h - 130], [-160, -h - 128], [-160, -h - 32], [-150, -h - 30]], '#B8862A')}`;
	g += seg([-30, -h + 20], [-90, -h - 10], 20, c.col) + seg([-90, -h - 10], [-100 - ext, -h - 30], 16, SKIN.d, 'round') + seg([30, -h + 20], [20, -h - 30], 20, c.dark) + seg([20, -h - 30], [-20, -h - 40], 16, SKIN.dD, 'round');
	return `<g transform="translate(${x} ${y}) scale(${s})">${g}</g>`;
}
