// The band, in a bold angular flat style (no outlines, hard flat shadow shapes, exaggerated proportions).
// Each player wears their part's colour, so the colour on screen tells you who plays what.
// Every function: (x, y, s, opts) with the origin at the player's feet; returns SVG.
const BAND = {
	drums: { name: '鼓手 · 大熊', col: '#D9483B', dark: '#9E2E28' },
	bass: { name: '贝斯 · 长脚', col: '#2FA3A6', dark: '#1D6E72' },
	guitar: { name: '吉他 · 炸毛', col: '#F2B632', dark: '#B9821A' },
	keys: { name: '键盘 · 小圆', col: '#8B6AD6', dark: '#5E44A0' },
	vox: { name: '主唱 · 大嗓门', col: '#F27A3A', dark: '#B8501F' },
};
const poly = (pts, fill, extra = '') => `<polygon points="${pts.map((p) => p.join(',')).join(' ')}" fill="${fill}" ${extra}/>`;
const seg = (a, b, w, col, cap = 'butt') => `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="${col}" stroke-width="${w}" stroke-linecap="${cap}"/>`;
const lerp2 = (a, b, u) => [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u];
const SKIN = { a: '#F0C49A', aD: '#C9966C', b: '#9C6544', bD: '#734630', c: '#F6D7BC', cD: '#D4A986', d: '#C98A5E', dD: '#9A6440' };
const INK = '#1C1A2A';

// ---------------------------------------------------------------- drummer: huge chest, tiny head, big beard, bandana
function pDrums(x, y, s, { kick = 0, snare = 0, hat = 0 } = {}) {
	const c = BAND.drums; let g = '';
	// arms behind the kit: left hand (viewer's left) on the hi-hat, right hand crosses to the snare
	const sh = [-122, -385], sh2 = [118, -385];
	const hHat = lerp2([-250, -360], [-262, -332], hat), hSn = lerp2([-150, -400], [-175, -300], snare);
	g += seg(sh, [-238, -300], 62, c.col) + seg([-238, -300], hHat, 44, SKIN.a, 'round');
	g += seg(sh2, [60, -290], 62, c.col) + seg([60, -290], hSn, 44, SKIN.aD, 'round');
	g += seg(hHat, lerp2([-360, -420], [-350, -372], hat), 9, '#E9D9B0', 'round') + seg(hSn, lerp2([-190, -500], [-245, -262], snare), 9, '#E9D9B0', 'round');
	// torso: wide wedge
	g += poly([[-160, -405], [160, -405], [100, -200], [-100, -200]], c.col) + poly([[40, -405], [160, -405], [100, -200], [40, -200]], c.dark);
	// tiny head, bandana, huge beard
	g += poly([[-30, -500], [30, -500], [34, -430], [-34, -430]], SKIN.a) + poly([[8, -500], [30, -500], [34, -430], [8, -430]], SKIN.aD);
	g += poly([[-36, -505], [36, -505], [40, -480], [-40, -480]], c.col) + poly([[36, -500], [70, -520], [62, -488]], c.col) + poly([[36, -494], [74, -486], [56, -472]], c.dark);
	g += poly([[-44, -452], [44, -452], [24, -330], [0, -300], [-24, -330]], '#5A3322') + poly([[8, -452], [44, -452], [24, -330], [0, -300]], '#43251A');
	g += `<rect x="-22" y="-468" width="12" height="5" fill="${INK}"/><rect x="10" y="-468" width="12" height="5" fill="${INK}"/>`;
	g += poly([[-14, -440], [14, -440], [8, -428], [-8, -428]], SKIN.aD);
	// the kit (in front)
	g += poly([[-382, -340], [-282, -340], [-286, -330], [-378, -330]], '#E3B23C', `transform="rotate(${-6 + 6 * hat} -332 -335)"`) + poly([[-380, -322], [-284, -322], [-292, -314], [-372, -314]], '#C8952A');
	g += seg([-332, -312], [-332, 0], 8, '#8A8F9E') + poly([[-372, 0], [-332, -40], [-292, 0]], '#8A8F9E');
	g += `<rect x="-300" y="-292" width="150" height="56" fill="#D7DCE6"/><rect x="-225" y="-292" width="75" height="56" fill="#A9B0C0"/><rect x="-306" y="-300" width="162" height="12" fill="#F2F4F8"/>`;
	g += seg([-262, -236], [-282, 0], 7, '#8A8F9E') + seg([-188, -236], [-168, 0], 7, '#8A8F9E');
	g += `<rect x="50" y="-350" width="110" height="64" fill="#2A3A5C"/><rect x="105" y="-350" width="55" height="64" fill="#1E2A44"/>`;
	g += `<rect x="190" y="-250" width="130" height="190" fill="#2A3A5C"/><rect x="255" y="-250" width="65" height="190" fill="#1E2A44"/>` + seg([200, -60], [196, 0], 8, '#8A8F9E') + seg([310, -60], [314, 0], 8, '#8A8F9E');
	g += seg([350, 0], [330, -470], 7, '#8A8F9E') + poly([[230, -470], [430, -500], [436, -488], [236, -456]], '#E3B23C');
	const kr = 150 * (1 + .025 * kick);
	g += `<circle cx="0" cy="-150" r="${kr}" fill="#2A3A5C"/><path d="M0 ${-150 - kr} A${kr} ${kr} 0 0 1 0 ${-150 + kr}Z" fill="#1E2A44"/><circle cx="0" cy="-150" r="${kr * .8}" fill="#EDE2C8"/>`;
	g += `<circle cx="0" cy="-150" r="${kr * .8}" fill="${c.col}" opacity="${.5 * kick}"/><path d="M-60 -150 L-20 -190 L20 -150 L60 -190" stroke="${c.col}" stroke-width="14" fill="none" stroke-linejoin="miter"/>`;
	return `<g transform="translate(${x} ${y}) scale(${s})">${g}</g>`;
}

// ---------------------------------------------------------------- bassist: very tall and thin, pompadour, shades, leans back
function pBass(x, y, s, { pluck = 0 } = {}) {
	const c = BAND.bass; let g = '';
	g += poly([[-40, -330], [-6, -330], [-46, 0], [-74, 0]], '#1F2A3A') + poly([[6, -330], [40, -330], [56, 0], [28, 0]], '#141C28');
	g += poly([[-96, 0], [-40, 0], [-40, -18], [-80, -14]], INK) + poly([[24, 0], [96, 0], [70, -16], [28, -18]], INK);
	// torso leaning back: long thin wedge
	g += poly([[-46, -330], [46, -330], [70, -560], [-20, -572]], c.col) + poly([[18, -330], [46, -330], [70, -560], [34, -566]], c.dark);
	g += poly([[6, -566], [40, -560], [28, -500]], '#F4F1E8');   // collar
	g += poly([[14, -566], [34, -564], [40, -610], [22, -612]], SKIN.b);   // long neck
	// long head, pompadour, shades
	g += poly([[-2, -612], [62, -616], [66, -700], [6, -706]], SKIN.b) + poly([[40, -614], [62, -616], [66, -700], [44, -702]], SKIN.bD);
	g += poly([[-14, -700], [70, -706], [110, -760], [40, -790], [-20, -748]], INK);
	g += poly([[-4, -668], [76, -672], [74, -650], [-2, -648]], INK) + `<rect x="8" y="-666" width="18" height="6" fill="#5FE0E3"/>`;
	g += seg([18, -630], [44, -634], 5, '#4A2A1A');
	// bass, low on the hip, neck up to the left
	g += `<g transform="rotate(28 0 -330)"><rect x="-330" y="-342" width="300" height="22" fill="#5A3A22"/><rect x="-372" y="-350" width="50" height="38" fill="#3A2416"/>
		${poly([[-60, -380], [70, -400], [110, -330], [60, -270], [-40, -280], [-80, -330]], '#F2EAD8')}${poly([[20, -390], [70, -400], [110, -330], [60, -270], [20, -276]], '#CFC4AE')}
		<rect x="-20" y="-345" width="60" height="14" fill="${INK}"/></g>`;
	// arms: long and thin
	g += seg([-14, -548], [-110, -500], 30, c.col) + seg([-110, -500], [-204, -444], 26, SKIN.b, 'round');
	const ph = lerp2([20, -360], [34, -344], pluck);
	g += seg([56, -548], [90, -440], 30, c.dark) + seg([90, -440], ph, 26, SKIN.bD, 'round');
	return `<g transform="translate(${x} ${y}) scale(${s})">${g}</g>`;
}

// ---------------------------------------------------------------- guitarist: skinny, explosive hair, one knee up
function pGuitar(x, y, s, { strum = 0 } = {}) {
	const c = BAND.guitar; let g = '';
	g += poly([[-30, -300], [0, -300], [-30, 0], [-56, 0]], INK) + poly([[0, -300], [30, -300], [80, -190], [50, -170]], INK) + poly([[80, -190], [50, -170], [30, -40], [56, -40]], '#0E0D16');
	g += poly([[-74, 0], [-20, 0], [-24, -20], [-66, -20]], '#F4F1E8') + poly([[20, -40], [74, -40], [64, -60], [26, -60]], '#F4F1E8');
	g += poly([[-44, -300], [44, -300], [56, -480], [-50, -470]], c.col) + poly([[10, -300], [44, -300], [56, -480], [16, -476]], c.dark);
	g += poly([[-44, -300], [-30, -286], [-16, -300], [0, -284], [14, -300], [30, -286], [44, -300]], c.col);   // torn hem
	g += `<rect x="-12" y="-500" width="24" height="26" fill="${SKIN.c}"/>`;
	g += poly([[-36, -500], [36, -500], [30, -570], [-30, -570]], SKIN.c) + poly([[8, -500], [36, -500], [30, -570], [8, -570]], SKIN.cD);
	g += poly([[-70, -560], [-40, -610], [-60, -650], [-20, -630], [0, -690], [20, -632], [64, -660], [46, -612], [84, -590], [40, -566], [-40, -566]], '#F7F0DA');   // hair
	g += `<rect x="-20" y="-548" width="10" height="10" fill="${INK}"/><rect x="10" y="-548" width="10" height="10" fill="${INK}"/>` + poly([[-12, -522], [12, -522], [0, -510]], '#7A2A2A');
	// guitar: angular body, neck up-left
	g += `<g transform="rotate(34 0 -360)"><rect x="-300" y="-372" width="250" height="18" fill="#4A2E1A"/><rect x="-336" y="-378" width="40" height="30" fill="#2A1A10"/>
		${poly([[-70, -400], [40, -420], [90, -380], [50, -330], [70, -290], [-40, -300], [-80, -350]], '#D9483B')}${poly([[-20, -370], [30, -372], [30, -350], [-20, -348]], INK)}</g>`;
	const hs = lerp2([30, -400], [40, -330], strum);
	g += seg([-40, -460], [-110, -420], 28, c.col) + seg([-110, -420], [-164, -476], 24, SKIN.c, 'round');
	g += seg([46, -460], [84, -390], 28, c.dark) + seg([84, -390], hs, 24, SKIN.cD, 'round');
	if (strum > .3) g += `<path d="M90 -330 L130 -300 M96 -300 L140 -270" stroke="${c.col}" stroke-width="8" opacity="${strum}"/>`;
	return `<g transform="translate(${x} ${y}) scale(${s})">${g}</g>`;
}

// ---------------------------------------------------------------- keyboardist: small, upright, round glasses, bun
function pKeys(x, y, s, { press = 0 } = {}) {
	const c = BAND.keys; let g = '';
	g += poly([[-26, -230], [-4, -230], [-10, 0], [-30, 0]], INK) + poly([[4, -230], [26, -230], [30, 0], [10, 0]], '#0E0D16');
	g += poly([[-44, -230], [44, -230], [36, -400], [-36, -400]], c.col) + poly([[8, -230], [44, -230], [36, -400], [8, -400]], c.dark);
	g += poly([[-36, -400], [36, -400], [0, -370]], '#F4F1E8');
	g += `<circle cx="0" cy="-470" r="62" fill="${SKIN.d}"/><path d="M0 -532 A62 62 0 0 1 0 -408Z" fill="${SKIN.dD}"/>`;
	g += `<path d="M-64 -470 A64 64 0 0 1 64 -470 L50 -500 L-50 -500Z" fill="${INK}"/><circle cx="0" cy="-548" r="30" fill="${INK}"/>`;
	g += `<circle cx="-24" cy="-466" r="18" fill="none" stroke="${INK}" stroke-width="5"/><circle cx="24" cy="-466" r="18" fill="none" stroke="${INK}" stroke-width="5"/><rect x="-6" y="-468" width="12" height="4" fill="${INK}"/>`;
	g += `<rect x="-26" y="-468" width="5" height="5" fill="${INK}"/><rect x="22" y="-468" width="5" height="5" fill="${INK}"/><rect x="-8" y="-434" width="16" height="4" fill="#7A2A2A"/>`;
	// keyboard on an X stand
	g += seg([-120, 0], [100, -250], 8, '#8A8F9E') + seg([120, 0], [-100, -250], 8, '#8A8F9E');
	g += `<rect x="-200" y="-290" width="400" height="44" fill="#22202E"/><rect x="-190" y="-284" width="380" height="18" fill="#F4F1E8"/>`;
	for (let i = 0; i < 19; i++) g += `<rect x="${-186 + i * 20}" y="-284" width="2" height="18" fill="#22202E"/>`;
	for (let i = 0; i < 19; i++) if (i % 7 !== 2 && i % 7 !== 6) g += `<rect x="${-180 + i * 20}" y="-284" width="10" height="10" fill="#22202E"/>`;
	const dy = 8 * press;
	g += seg([-40, -390], [-80, -320], 24, c.col) + seg([-80, -320], [-60, -290 + dy], 20, SKIN.d, 'round');
	g += seg([40, -390], [80, -320], 24, c.dark) + seg([80, -320], [60, -290 + dy], 20, SKIN.dD, 'round');
	if (press > .3) g += `<rect x="-80" y="-290" width="160" height="6" fill="${c.col}" opacity="${press}"/>`;
	return `<g transform="translate(${x} ${y}) scale(${s})">${g}</g>`;
}

// ---------------------------------------------------------------- singer: big triangle dress, head thrown back, arm up
function pVox(x, y, s, { sing = 0 } = {}) {
	const c = BAND.vox; let g = '';
	g += poly([[-24, -470], [24, -470], [150, 0], [-150, 0]], c.col) + poly([[0, -470], [24, -470], [150, 0], [20, 0]], c.dark);
	g += `<rect x="-14" y="-505" width="28" height="40" fill="${SKIN.a}"/>`;
	// hair streaming back (to the right)
	g += poly([[-30, -590], [40, -600], [190, -520], [150, -480], [170, -430], [60, -500], [20, -500]], '#B8302A');
	// head tilted back, mouth open
	g += `<g transform="rotate(-18 0 -540)">${poly([[-40, -500], [34, -500], [38, -590], [-36, -590]], SKIN.a)}${poly([[10, -500], [34, -500], [38, -590], [10, -590]], SKIN.aD)}
		${poly([[-40, -592], [40, -592], [30, -620], [-30, -620]], '#B8302A')}
		<rect x="-24" y="-566" width="14" height="5" fill="${INK}"/><rect x="8" y="-566" width="14" height="5" fill="${INK}"/>
		${poly([[-14, -530], [14, -530], [0, -530 + 22 + 10 * sing]], '#5A1A1A')}</g>`;
	// arm up (free hand), mic hand at the mouth
	g += seg([-18, -460], [-110, -560], 26, c.col) + seg([-110, -560], [-120, -680 - 10 * sing], 22, SKIN.a, 'round');
	g += poly([[-140, -690 - 10 * sing], [-100, -690 - 10 * sing], [-104, -720 - 10 * sing], [-136, -720 - 10 * sing]], SKIN.a);
	g += seg([18, -460], [70, -400], 26, c.dark) + seg([70, -400], [-24, -500], 22, SKIN.aD, 'round');
	g += seg([-24, -500], [-40, -530], 14, '#3A3A48') + `<circle cx="-44" cy="-538" r="14" fill="#8A8F9E"/>`;
	if (sing > .3) g += `<path d="M-90 -560 q-20 -10 -10 -30 M-110 -540 q-30 -10 -16 -40" stroke="${c.col}" stroke-width="6" fill="none" opacity="${sing}"/>`;
	return `<g transform="translate(${x} ${y}) scale(${s})">${g}</g>`;
}
const PLAYER = { drums: pDrums, bass: pBass, guitar: pGuitar, keys: pKeys, vox: pVox };
