// The band, drawn flat and angular (Samurai Jack style: hard two-tone shapes, no outlines, extreme builds).
// Light comes from the upper left, so the right side of every shape is the darker tone.
// Every player function is f(x, y, s, look, pose) with the origin between the feet; look is
// 'pop' | 'classical' | 'jazz' | 'rock' | 'mix'. pose values are 0..1 and come from the score.
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x)), lerp = (a, b, u) => a + (b - a) * u;
const ease = (u) => 1 - Math.pow(1 - clamp(u), 3), easeIO = (u) => { u = clamp(u); return u * u * (3 - 2 * u); };
const f1 = (v) => (+v).toFixed(1);
const P = (pts) => pts.map((p) => f1(p[0]) + ',' + f1(p[1])).join(' ');
const poly = (pts, f, x = '') => `<polygon points="${P(pts)}" fill="${f}" ${x}/>`;
const seg = (a, b, w, c, cap = 'round') => `<line x1="${f1(a[0])}" y1="${f1(a[1])}" x2="${f1(b[0])}" y2="${f1(b[1])}" stroke="${c}" stroke-width="${f1(w)}" stroke-linecap="${cap}"/>`;
const circ = (x, y, r, f, e = '') => `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(Math.max(0, r))}" fill="${f}" ${e}/>`;
const ell = (x, y, rx, ry, f, e = '') => `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(Math.max(0, rx))}" ry="${f1(Math.max(0, ry))}" fill="${f}" ${e}/>`;
const rect = (x, y, w, h, f, e = '') => `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" fill="${f}" ${e}/>`;
const grp = (tr, s) => `<g transform="${tr}">${s}</g>`;
const L2 = (a, b, u) => [lerp(a[0], b[0], u), lerp(a[1], b[1], u)];
const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
const F = `font-family="Noto Sans CJK SC, sans-serif"`;
const INK = '#17151F';
const BAND = {
	drums: { name: '大熊', col: '#E0483A', dark: '#A12F27' }, bass: { name: '长脚', col: '#23A9A8', dark: '#16716F' },
	guitar: { name: '炸毛', col: '#F5B829', dark: '#B9831A' }, keys: { name: '小圆', col: '#8E6BE0', dark: '#5F45A6' },
	vox: { name: '大嗓门', col: '#F57A36', dark: '#B9521F' }, flute: { name: '小雀', col: '#7FC8F2', dark: '#4C93BF' },
	sax: { name: '阿胖', col: '#D9A520', dark: '#9A7212' }, tpt: { name: '鼓腮', col: '#3FB36E', dark: '#27784A' },
	tbn: { name: '高个', col: '#E2588F', dark: '#A43A66' }, crowd: { name: '观众', col: '#E8E2D6', dark: '#9A9488' }, fx: { name: '', col: '#E8E2D6', dark: '#9A9488' },
};
const SK = { a: ['#F2C49A', '#C9926A'], b: ['#9C6544', '#6E4430'], c: ['#F7D9BE', '#D2A884'], d: ['#C98A5E', '#996240'], e: ['#E8B48A', '#B9845E'] };
const TAILS = { top: '#1D1C26', topD: '#111018', legs: '#15141C', legsD: '#0B0A10', shirt: '#F6F2E8' };
function ik(s, h, l1, l2, bend) {
	const dx = h[0] - s[0], dy = h[1] - s[1], d = Math.max(1e-3, Math.hypot(dx, dy));
	const a = Math.atan2(dy, dx), c = clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1);
	const ang = a - bend * Math.acos(c); return [s[0] + l1 * Math.cos(ang), s[1] + l1 * Math.sin(ang)];
}
// an arm or a leg: shoulder s, hand target h (pulled in if out of reach). bend +1/-1 picks which way the elbow points
function limb(s, h, l1, l2, bend, w, cU, cL, end = null, endR = 0) {
	const dx = h[0] - s[0], dy = h[1] - s[1], d = Math.hypot(dx, dy), m = l1 + l2 - .5;
	if (d > m) h = [s[0] + dx / d * m, s[1] + dy / d * m];
	const e = ik(s, h, l1, l2, bend);
	return { svg: seg(s, e, w, cU) + seg(e, h, w * .84, cL) + (end ? circ(h[0], h[1], endR || w * .6, end) : ''), e, h };
}
const shoe = (x, dir = 1, c = INK, w = 70) => poly([[x - w * .3 * dir, 0], [x + w * .7 * dir, 0], [x + w * .6 * dir, -18], [x - w * .25 * dir, -24]], c);
const bowtie = (x, y, c, k = 1) => poly([[x - 24 * k, y - 11 * k], [x, y], [x - 24 * k, y + 11 * k]], c) + poly([[x + 24 * k, y - 11 * k], [x, y], [x + 24 * k, y + 11 * k]], c) + rect(x - 6 * k, y - 6 * k, 12 * k, 12 * k, c);
const necktie = (x, y, c, len = 90) => poly([[x - 9, y], [x + 9, y], [x + 13, y + len], [x, y + len + 16], [x - 13, y + len]], c);
const studs = (pts) => pts.map(([x, y]) => circ(x, y, 4.5, '#DDE1EA')).join('');
const fedora = (x, y, w, c, band) => poly([[x - w, y], [x + w, y], [x + w * .78, y - 13], [x - w * .78, y - 13]], c)
	+ poly([[x - w * .56, y - 11], [x + w * .56, y - 11], [x + w * .46, y - w * .82], [x + w * .05, y - w * .66], [x - w * .46, y - w * .82]], c) + poly([[x - w * .56, y - 11], [x + w * .56, y - 11], [x + w * .54, y - 25], [x - w * .54, y - 25]], band);
const tophat = (x, y, w, c) => rect(x - w, y - 10, w * 2, 12, c) + poly([[x - w * .62, y - 8], [x + w * .62, y - 8], [x + w * .7, y - w * 1.5], [x - w * .7, y - w * 1.5]], c) + rect(x - w * .64, y - 26, w * 1.28, 12, '#7A1E2E');
const tails = (x0, x1, y0, y1, c) => poly([[x0, y0], [x0 + 14, y1 + 60], [x0 + 40, y1 + 20], [x0 + 30, y0]], c) + poly([[x1, y0], [x1 - 14, y1 + 60], [x1 - 40, y1 + 20], [x1 - 30, y0]], c);
// ---------------------------------------------------------------- looks: outfit colours and extras per player per genre
const LOOK = {
	drums: { pop: { top: '#E0483A', topD: '#A12F27', hat: 'beanie', hatC: '#2B2A36' }, classical: { ...TAILS, tie: 'bow', hat: 'slick' },
		jazz: { top: '#6B4B35', topD: '#4A3222', shirt: '#E9DDC2', tie: 'tie', tieC: '#8E2C2C', hat: 'cap', hatC: '#3B3A47' },
		rock: { top: '#1C1B22', topD: '#0F0F14', shirt: '#E0483A', hat: 'bandana', hatC: '#E0483A', studs: 1, bare: 1 }, mix: { ...TAILS, tie: 'bow', hat: 'bandana', hatC: '#E0483A' } },
	bass: { pop: { top: '#23A9A8', topD: '#16716F', legs: '#2F3B52', legsD: '#212A3B', hat: 'phones' }, classical: { ...TAILS, tie: 'bow', hat: 'slick' },
		jazz: { top: '#2E3246', topD: '#1F2232', legs: '#2E3246', legsD: '#1F2232', shirt: '#E9DDC2', tie: 'tie', tieC: '#23A9A8', hat: 'fedora', hatC: '#24273A' },
		rock: { top: '#1C1B22', topD: '#0F0F14', legs: '#2C3E5E', legsD: '#1E2B43', shirt: '#23A9A8', studs: 1, hat: 'quiff' }, mix: { top: '#1C1B22', topD: '#0F0F14', legs: '#2C3E5E', legsD: '#1E2B43', shirt: '#23A9A8', hat: 'fedora', hatC: '#24273A', studs: 1 } },
	guitar: { pop: { top: '#F5B829', topD: '#B9831A', legs: '#33415E', legsD: '#232E44', hair: '#FFF2C8' }, classical: { ...TAILS, tie: 'bow', choke: 1, hair: '#FFF2C8' },
		jazz: { top: '#4E3A2E', topD: '#36281E', legs: '#3A3A48', legsD: '#272733', shirt: '#E9DDC2', hat: 'fedora', hatC: '#3A2A1E', hair: '#FFF2C8' },
		rock: { top: '#1C1B22', topD: '#0F0F14', legs: '#2C3E5E', legsD: '#1E2B43', shirt: '#F5B829', studs: 1, hair: '#F5B829' }, mix: { top: '#1C1B22', topD: '#0F0F14', legs: '#15141C', legsD: '#0B0A10', shirt: '#F6F2E8', tie: 'bow', studs: 1, hair: '#F5B829' } },
	keys: { pop: { top: '#8E6BE0', topD: '#5F45A6' }, classical: { ...TAILS, tie: 'bow' }, jazz: { top: '#8E6BE0', topD: '#5F45A6', shirt: '#F6F2E8', tie: 'bow' },
		rock: { top: '#1C1B22', topD: '#0F0F14', shirt: '#8E6BE0', studs: 1, hairC: '#8E6BE0' }, mix: { top: '#8E6BE0', topD: '#5F45A6', shirt: '#1C1B22', studs: 1 } },
	vox: { pop: { dress: 0, top: '#F57A36', topD: '#B9521F', legs: '#2F3B52', legsD: '#212A3B', hair: '#B5302A' }, classical: { dress: 'gown', top: '#7C1E3C', topD: '#54132A', hair: '#B5302A', bun: 1 },
		jazz: { dress: 'sequin', top: '#F57A36', topD: '#B9521F', hair: '#B5302A' }, rock: { dress: 0, top: '#F2EDE2', topD: '#C9C2B4', jacket: '#1C1B22', legs: '#1C1B22', legsD: '#101016', hair: '#17151F' },
		mix: { dress: 'gown', top: '#7C1E3C', topD: '#54132A', jacket: '#1C1B22', hair: '#B5302A' } },
};
const lk = (who, look) => LOOK[who][look] || LOOK[who].pop;
// ---------------------------------------------------------------- 大熊: huge barrel chest, tiny head, big beard
function pDrums(x, y, s, look, p = {}) {
	const o = lk('drums', look), c = BAND.drums, sk = SK.a; let g = '';
	const timp = look === 'classical', jazz = look === 'jazz', rock = look === 'rock' || look === 'mix';
	const lift = timp ? -110 : 0, bob = (p.bob || 0) * 10;
	const top = o.top, topD = o.topD, sh = [[-165, -450 + lift + bob], [165, -450 + lift + bob]];
	// seated legs (behind the kit) or standing legs (timpani)
	if (timp) g += poly([[-90, -320], [-20, -320], [-30, 0], [-96, 0]], o.legs) + poly([[20, -320], [90, -320], [96, 0], [30, 0]], o.legsD) + shoe(-70, -1) + shoe(70, 1);
	else g += poly([[-120, -210], [-40, -210], [-70, 0], [-130, 0]], o.legs || '#2B2A36') + poly([[40, -210], [120, -210], [130, 0], [70, 0]], o.legsD || '#1E1D27') + rect(-60, -205, 120, 30, '#4A4A58') + shoe(-110, -1) + shoe(110, 1);
	// arms behind the torso go first? no: arms in front of the body, drawn after
	const body = [[-118, -210 + lift + bob], [118, -210 + lift + bob], [182, -400 + lift + bob], [150, -470 + lift + bob], [-150, -470 + lift + bob], [-182, -400 + lift + bob]];
	g += poly(body, top) + poly([[18, -210 + lift + bob], [118, -210 + lift + bob], [182, -400 + lift + bob], [150, -470 + lift + bob], [30, -470 + lift + bob]], topD);
	if (o.shirt) g += poly([[-40, -470 + lift + bob], [40, -470 + lift + bob], [0, -370 + lift + bob]], o.shirt);
	if (o.tie === 'bow') g += bowtie(0, -455 + lift + bob, c.col, 1.1);
	if (o.tie === 'tie') g += necktie(0, -462 + lift + bob, o.tieC, 80);
	if (o.top === TAILS.top) g += tails(-150, 150, -230 + lift + bob, -230 + lift + bob, TAILS.topD);
	if (o.studs) g += studs([[-120, -440 + lift + bob], [-90, -446 + lift + bob], [90, -446 + lift + bob], [120, -440 + lift + bob]]);
	if (o.bare) g += poly([[-182, -400 + lift + bob], [-150, -470 + lift + bob], [-120, -470 + lift + bob], [-160, -380 + lift + bob]], c.col) + poly([[182, -400 + lift + bob], [150, -470 + lift + bob], [120, -470 + lift + bob], [160, -380 + lift + bob]], c.dark);
	// head
	const hy = -470 + lift + bob, nod = (p.nod || 0) * 6;
	g += grp(`translate(0 ${f1(hy + nod)})`, (() => { let h = '';
		h += poly([[-36, -20], [36, -20], [40, -108], [-40, -108]], sk[0]) + poly([[8, -20], [36, -20], [40, -108], [8, -108]], sk[1]);
		h += rect(-26, -78, 16, 6, INK) + rect(10, -78, 16, 6, INK) + poly([[-30, -88], [-8, -86], [-8, -92], [-30, -96]], INK) + poly([[30, -88], [8, -86], [8, -92], [30, -96]], INK);
		h += poly([[-50, -58], [50, -58], [44, 40], [0, 92], [-44, 40]], '#5A3322') + poly([[8, -58], [50, -58], [44, 40], [0, 92]], '#43251A') + poly([[-14, -40], [14, -40], [10, -30], [-10, -30]], '#2A160E');
		if (p.yell) h += poly([[-12, -34], [12, -34], [8, -10], [-8, -10]], '#2A0E0E');
		const hat = o.hat;
		if (hat === 'beanie') h += poly([[-44, -100], [44, -100], [36, -144], [0, -156], [-36, -144]], o.hatC) + rect(-46, -112, 92, 16, '#43424F');
		if (hat === 'bandana') h += poly([[-44, -98], [44, -98], [40, -126], [-40, -126]], o.hatC) + poly([[40, -120], [84, -134], [74, -100]], o.hatC);
		if (hat === 'cap') h += poly([[-46, -100], [50, -100], [78, -112], [34, -138], [-40, -132]], o.hatC);
		if (hat === 'slick') h += poly([[-42, -100], [42, -100], [36, -122], [-30, -126]], '#2A1A10');
		return h; })());
	// instruments and arms
	const kit = (() => { let k = '';
		const big = rock ? 1.08 : jazz ? .9 : 1, kr = 140 * big;
		if (timp) {   // two copper kettles
			for (const [cx, r] of [[-175, 135], [175, 125]]) k += ell(cx, -205, r, 22, '#EFE6CF') + `<path d="M${cx - r} -205 Q${cx - r * .92} -50 ${cx} -36 Q${cx + r * .92} -50 ${cx + r} -205Z" fill="#C97A3C"/><path d="M${cx} -205 L${cx + r} -205 Q${cx + r * .92} -50 ${cx} -36Z" fill="#9A5626"/>` + seg([cx - r * .6, -60], [cx - r * .8, 0], 8, '#8A8F9E') + seg([cx + r * .6, -60], [cx + r * .8, 0], 8, '#8A8F9E');
			return k;
		}
		// floor tom (viewer's left), snare, hi-hat or ride (viewer's right), cymbals
		k += rect(-330, -250, 130, 180, rock ? '#2A2A33' : jazz ? '#7A4A2A' : '#C8372C') + rect(-265, -250, 65, 180, rock ? '#18181E' : jazz ? '#5A341C' : '#922820') + ell(-265, -250, 65, 14, '#EFE6CF') + seg([-320, -70], [-330, 0], 7, '#8A8F9E') + seg([-210, -70], [-200, 0], 7, '#8A8F9E');
		k += rect(-240, -320, 150, 46, '#D9DEE8') + rect(-165, -320, 75, 46, '#A9B0C0') + ell(-165, -320, 75, 14, '#F4F1E8') + seg([-200, -274], [-220, 0], 6, '#8A8F9E') + seg([-130, -274], [-110, 0], 6, '#8A8F9E');
		if (jazz) k += seg([300, 0], [300, -430], 6, '#8A8F9E') + poly([[180, -436], [420, -452], [424, -440], [184, -424]], '#D8A93C') + ell(300, -444, 20, 6, '#B8862A');
		else k += seg([240, 0], [240, -360], 6, '#8A8F9E') + poly([[180, -376], [300, -376], [296, -366], [184, -366]], '#E3B23C') + poly([[180, -360], [300, -360], [292, -352], [188, -352]], '#C8952A');
		if (!jazz) k += seg([360, 0], [340, -560], 6, '#8A8F9E') + poly([[240, -560], [440, -590], [446, -578], [246, -546]], '#E3B23C');
		if (rock) k += seg([-380, 0], [-372, -520], 6, '#8A8F9E') + poly([[-480, -510], [-270, -536], [-266, -524], [-476, -498]], '#E3B23C');
		const kp = 1 + .035 * (p.kick || 0);
		k += grp(`translate(0 ${-kr}) scale(${kp})`, circ(0, 0, kr, rock ? '#25242C' : jazz ? '#7A4A2A' : '#C8372C') + `<path d="M0 ${kr} A${kr} ${kr} 0 0 1 0 ${-kr}Z" fill="${rock ? '#16151B' : jazz ? '#5A341C' : '#922820'}"/>` + circ(0, 0, kr * .8, '#EFE6CF')
			+ `<text x="0" y="${kr * .14}" text-anchor="middle" ${F} font-size="${f1(kr * .42)}" font-weight="900" fill="${c.col}">晚风</text>` + circ(0, 0, kr * .8, '#fff', `opacity="${f1(.35 * (p.kick || 0))}"`));
		return k; })();
	const sticks = (sd, tgt, hit, up = 130, len = 150, brush = false) => {
		const tip = L2(add(tgt, [sd * 16, -up * .55]), tgt, hit), hand = add(tip, [sd * 120, -34 - 20 * (1 - hit)]);
		const a = limb(sh[sd < 0 ? 0 : 1], hand, 150, 140, sd < 0 ? 1 : -1, 56, sd < 0 ? top : topD, o.bare ? (sd < 0 ? sk[0] : sk[1]) : (sd < 0 ? top : topD), sd < 0 ? sk[0] : sk[1], 30);
		return a.svg + seg(hand, tip, brush ? 6 : 10, '#E9D6A8') + (brush ? poly([[tip[0] - 16, tip[1] + 4], [tip[0] + 16, tip[1] + 4], [tip[0], tip[1] - 24]], '#E9D6A8') : '');
	};
	let arms = '';
	if (timp) { arms += sticks(-1, [-175, -215], p.timp || 0, 160) + sticks(1, [175, -215], p.timp2 || 0, 160); }
	else {
		const L = p.crashL ? [-370, -520] : p.tom ? [-265, -258] : [-165, -326];
		const R = jazz ? [300, -448] : p.ride ? [-150, -460] : [240, -380];
		arms += sticks(-1, L, Math.max(p.snare || 0, p.tom || 0, p.crashL || 0), 130, 150, jazz) + sticks(1, p.crash ? [340, -572] : R, Math.max(p.hat || 0, p.crash || 0, p.ride || 0), 110, 150, false);
	}
	g = g + (timp ? arms + kit : kit + arms);
	return grp(`translate(${f1(x)} ${f1(y)}) scale(${s})`, g);
}
// ---------------------------------------------------------------- 长脚: very tall and thin, deadpan, nods on every beat
function pBass(x, y, s, look, p = {}) {
	const o = lk('bass', look), c = BAND.bass, sk = SK.b; let g = '';
	const upright = look === 'classical' || look === 'jazz', bob = (p.bob || 0) * 8;
	const legs = o.legs || '#2A2A36', legsD = o.legsD || '#1D1D26';
	g += poly([[-44, -410], [-6, -410], [-40, 0], [-70, 0]], legs) + poly([[6, -410], [44, -410], [62, 0], [32, 0]], legsD) + shoe(-56, -1) + shoe(48, 1);
	const T = -410 + bob, S = -660 + bob;
	g += poly([[-50, T], [50, T], [62, S], [-52, S - 6]], o.top) + poly([[12, T], [50, T], [62, S], [20, S - 4]], o.topD);
	if (o.shirt) g += poly([[-14, S - 2], [22, S], [6, S + 120]], o.shirt);
	if (o.tie === 'bow') g += bowtie(4, S + 14, c.col, .8); if (o.tie === 'tie') g += necktie(4, S + 6, o.tieC, 100);
	if (o.top === TAILS.top) g += tails(-50, 50, T - 20, T, TAILS.topD);
	if (o.studs) g += studs([[-34, S + 30], [-36, S + 70], [44, S + 30], [46, S + 70]]);
	if (o.hat === 'phones') g += `<path d="M-30 ${S - 10} q34 40 68 0" stroke="#17151F" stroke-width="14" fill="none"/>` + circ(-32, S - 6, 16, '#2B2A36') + circ(40, S - 6, 16, '#2B2A36');
	const nod = (p.nod || 0);
	g += rect(-12, S - 50, 26, 54, sk[0]) + grp(`translate(4 ${f1(S - 50)}) rotate(${f1(6 * nod)})`, (() => { let h = '';
		h += poly([[-36, 0], [40, 0], [44, -130], [-32, -134]], sk[0]) + poly([[10, 0], [40, 0], [44, -130], [10, -132]], sk[1]);
		h += rect(-24, -88, 22, 10, INK) + rect(10, -88, 22, 10, INK) + rect(-26, -92, 26, 6, sk[1]) + rect(8, -92, 26, 6, sk[1]) + rect(-12, -40, 30, 5, '#4A2A1E');
		if (o.hat === 'fedora') h += fedora(4, -126, 66, o.hatC, c.col);
		else if (o.hat === 'slick') h += poly([[-36, -126], [44, -130], [46, -150], [-30, -150]], INK);
		else if (o.hat === 'quiff') h += poly([[-40, -126], [46, -130], [96, -184], [30, -214], [-30, -170]], INK);
		else h += poly([[-40, -126], [46, -130], [50, -160], [20, -150], [0, -170], [-20, -150], [-44, -156]], INK);
		return h; })());
	const shL = [-46, S + 20], shR = [52, S + 20];
	if (upright) {
		const bx = -170, pl = p.pluck || 0;
		g += seg([bx + 26, -260], [bx + 64, -800], 18, '#2A1A10') + poly([[bx + 54, -830], [bx + 86, -820], [bx + 76, -782], [bx + 52, -788]], '#2A1A10');
		g += `<path d="M${bx - 62} -430 C${bx - 124} -410 ${bx - 124} -340 ${bx - 84} -310 C${bx - 146} -270 ${bx - 136} -60 ${bx + 20} -40 C${bx + 176} -60 ${bx + 186} -270 ${bx + 124} -310 C${bx + 164} -340 ${bx + 154} -420 ${bx + 92} -440 C${bx + 52} -460 ${bx - 22} -460 ${bx - 62} -430Z" fill="#B8642E"/>`;
		g += `<path d="M${bx + 20} -452 C${bx + 52} -460 ${bx + 154} -420 ${bx + 124} -310 C${bx + 186} -270 ${bx + 176} -60 ${bx + 20} -40Z" fill="#8A4420"/>` + rect(bx + 4, -210, 32, 16, INK) + seg([bx + 20, -40], [bx + 20, 0], 8, '#8A8F9E');
		for (let k = 0; k < 4; k++) g += seg([bx + 12 + k * 6, -230], [bx + 50 + k * 4, -760], 2, '#E8DCC0');
		const fy = lerp(-700, -560, p.pitch || .5);
		g += limb(shL, [bx + 60, fy], 150, 140, 1, 30, o.top, o.top, sk[0], 18).svg;
		if (look === 'classical') { const bh = [lerp(bx + 60, bx + 210, p.bowpos || .5), -300 + 10 * pl]; g += limb(shR, bh, 160, 150, -1, 30, o.topD, o.topD, sk[1], 18).svg + seg(add(bh, [-200, 30]), add(bh, [70, -10]), 6, '#E9DCC0'); }
		else g += limb(shR, [bx + 70 + 30 * pl, -330 + 30 * pl], 160, 150, -1, 30, o.topD, o.topD, sk[1], 18).svg;
	} else {   // electric bass across the hips, neck up to the viewer's left
		const ang = look === 'rock' || look === 'mix' ? 26 : 30;
		g += grp(`rotate(${ang} 20 -380)`, rect(-330, -392, 320, 24, '#2A1A10') + rect(-370, -398, 50, 36, '#1A1110') + [...Array(4).keys()].map((k) => seg([-330, -388 + k * 6], [0, -388 + k * 6], 1.5, '#D8D8D8')).join('')
			+ poly([[-50, -420], [70, -440], [118, -372], [70, -300], [-36, -312], [-76, -366]], look === 'pop' ? c.col : '#1C1B22') + poly([[20, -432], [70, -440], [118, -372], [70, -300], [20, -306]], look === 'pop' ? c.dark : '#0F0F14') + rect(-10, -392, 26, 24, '#DDE1EA'));
		const nk = lerp(.15, .75, p.pitch || .5), r = ang * Math.PI / 180, ax = -330 + 300 * (1 - nk);
		const fret = [20 + (ax - 20) * Math.cos(r) - (-380 + 380) * Math.sin(r), -380 + (ax - 20) * Math.sin(r)];
		g += limb(shL, fret, 150, 140, 1, 30, o.top, o.top, sk[0], 18).svg + limb(shR, [56 - 10 * (p.pluck || 0), -330 + 24 * (p.pluck || 0)], 150, 150, -1, 30, o.topD, o.topD, sk[1], 18).svg;
	}
	return grp(`translate(${f1(x)} ${f1(y)}) scale(${s})`, g);
}
// ---------------------------------------------------------------- 炸毛: spiky hair, big grin, always leaning
function pGuitar(x, y, s, look, p = {}) {
	const o = lk('guitar', look), c = BAND.guitar, sk = SK.c; let g = '';
	const violin = look === 'classical' || look === 'mix', bob = (p.bob || 0) * 10, lean = (p.lean || 0) * 10 + (look === 'rock' ? 6 : 3);
	g += poly([[-34, -330], [0, -330], [-34, 0], [-62, 0]], o.legs || '#33415E') + poly([[0, -330], [34, -330], [66, 0], [38, 0]], o.legsD || '#232E44');
	g += shoe(-50, -1, look === 'rock' ? '#F2EDE2' : INK) + shoe(56, 1, look === 'rock' ? '#F2EDE2' : INK);
	let u = '';
	const T = -330 + bob, S = -540 + bob;
	u += poly([[-48, T], [48, T], [60, S], [-56, S + 6]], o.top) + poly([[10, T], [48, T], [60, S], [16, S + 2]], o.topD);
	if (o.shirt) u += poly([[-16, S + 4], [16, S + 2], [0, S + 90]], o.shirt);
	if (o.tie === 'bow') u += bowtie(0, S + 14 - (o.choke ? 4 : 0), c.col, o.choke ? .95 : .75);
	if (o.top === TAILS.top) u += tails(-48, 48, T - 20, T, TAILS.topD);
	if (o.studs) u += studs([[-40, S + 30], [-44, S + 70], [44, S + 26], [48, S + 66]]);
	u += rect(-12, S - 24, 24, 30, sk[0]) + grp(`translate(0 ${f1(S - 22)}) rotate(${f1(-4 + (p.head || 0) * 8)})`, (() => { let h = '';
		h += poly([[-38, 0], [38, 0], [42, -80], [-40, -84]], sk[0]) + poly([[8, 0], [38, 0], [42, -80], [8, -82]], sk[1]);
		h += poly([[-80, -56], [-50, -110], [-74, -150], [-26, -128], [-6, -196], [18, -130], [70, -168], [50, -112], [96, -92], [44, -70], [-40, -70]], o.hair || '#FFF2C8');
		if (o.hat === 'fedora') h += fedora(0, -100, 52, o.hatC, c.col);
		h += rect(-22, -52, 11, 11, INK) + rect(10, -52, 11, 11, INK) + poly([[-24, -62], [-8, -58], [-8, -64], [-24, -70]], INK) + poly([[24, -62], [8, -58], [8, -64], [24, -70]], INK);
		const m = o.choke ? 0 : 1; h += m ? poly([[-20, -26], [24, -28], [16, -12], [-14, -12]], '#5A1A1A') + rect(-16, -26, 36, 6, '#FFFFFF') : rect(-10, -22, 22, 5, '#5A1A1A');
		if (o.choke) h += `<path d="M-30 -30 q6 -8 12 0" stroke="#D2584A" stroke-width="3" fill="none"/>`;
		return h; })());
	const shL = [-52, S + 22], shR = [54, S + 22], st = p.strum || 0;
	if (violin) {
		u += grp('rotate(-22 -40 -520)', grp(`translate(0 ${f1(bob)})`, `<path d="M-90 -536 C-124 -546 -134 -518 -122 -508 C-134 -498 -128 -470 -90 -478 C-50 -470 -46 -498 -58 -508 C-46 -518 -56 -546 -90 -536Z" fill="#B8642E"/>` + rect(-250, -514, 136, 10, '#2A1A10') + rect(-262, -518, 18, 18, '#2A1A10')));
		u += limb(shL, [-226, -470 + bob], 130, 120, 1, 26, o.top, o.top, sk[0], 16).svg;
		const bh = [lerp(-40, 120, p.bowpos ?? .5), -420 + bob + 20 * st];
		u += limb(shR, bh, 130, 130, -1, 26, o.topD, o.topD, sk[1], 16).svg + seg(add(bh, [-230, -70]), add(bh, [40, 14]), 6, '#E9DCC0');
	} else {
		const solo = p.solo || 0, ang = 30 - 16 * solo;
		u += grp(`rotate(${f1(ang)} 10 -350)`, grp(`translate(0 ${f1(bob)})`, rect(-310, -362, 270, 18, '#4A2E1A') + rect(-346, -368, 40, 30, '#2A1A10') + [...Array(6).keys()].map((k) => seg([-310, -360 + k * 3], [40, -360 + k * 3], 1, '#E8E8E8')).join('')
			+ (look === 'rock' ? poly([[-70, -392], [130, -450], [60, -352], [130, -260], [-70, -324]], '#E0483A') + poly([[30, -406], [130, -450], [60, -352], [130, -260], [30, -300]], '#A12F27') + rect(0, -366, 36, 26, INK)
				: look === 'jazz' ? ell(20, -352, 112, 80, '#C8783A') + `<path d="M20 -432 A112 80 0 0 1 20 -272Z" fill="#9A5626"/>` + `<path d="M-24 -384 q-10 16 0 32 M64 -384 q10 16 0 32" stroke="${INK}" stroke-width="6" fill="none"/>`
					: `<path d="M-70 -396 C-40 -430 30 -400 60 -420 C110 -440 140 -390 120 -350 C140 -300 100 -270 50 -290 C10 -300 -40 -270 -70 -300 C-90 -330 -90 -370 -70 -396Z" fill="#F5B829"/>` + `<path d="M40 -414 C110 -440 140 -390 120 -350 C140 -300 100 -270 40 -290Z" fill="#B9831A"/>` + rect(-20, -376, 60, 40, '#F6F2E8') + rect(46, -366, 14, 26, INK))));
		const r = ang * Math.PI / 180, nx = lerp(-290, -120, p.fret ?? .4);
		const fret = [10 + (nx - 10) * Math.cos(r) - (-354 + 350) * Math.sin(r), -350 + (nx - 10) * Math.sin(r) + bob];
		u += limb(shL, fret, 130, 125, 1, 26, o.top, o.top, sk[0], 16).svg + limb(shR, [36 + 10 * st, -334 + 36 * st + bob], 130, 130, -1, 26, o.topD, o.topD, sk[1], 16).svg;
	}
	g += grp(`rotate(${f1(-lean)} 0 -330)`, u);
	return grp(`translate(${f1(x)} ${f1(y)}) scale(${s})`, g);
}
// ---------------------------------------------------------------- 小圆: small and round, big glasses, the band's brain
function pKeys(x, y, s, look, p = {}) {
	const o = lk('keys', look), c = BAND.keys, sk = SK.d; let g = '';
	const grand = look === 'classical' || look === 'jazz' || look === 'mix', organ = look === 'rock', bob = (p.bob || 0) * 8;
	if (grand) g += poly([[-330, -270], [250, -270], [210, -640], [-150, -350]], '#14131A') + poly([[-150, -350], [210, -640], [222, -628], [-136, -344]], '#3A3848');
	g += rect(-60, -200, 120, 26, '#4A3A30') + seg([-50, -174], [-56, 0], 10, '#3A2C24') + seg([50, -174], [56, 0], 10, '#3A2C24');
	g += poly([[-70, -200], [-20, -200], [-40, 0], [-80, 0]], o.legs || '#2B2A36') + poly([[20, -200], [70, -200], [80, 0], [40, 0]], o.legsD || '#1E1D27') + shoe(-64, -1) + shoe(64, 1);
	g += ell(0, -300 + bob, 100, 118, o.top) + `<path d="M0 ${-418 + bob} A100 118 0 0 1 0 ${-182 + bob}Z" fill="${o.topD}"/>`;
	if (o.shirt) g += poly([[-26, -412 + bob], [26, -412 + bob], [0, -350 + bob]], o.shirt);
	if (o.tie === 'bow') g += bowtie(0, -402 + bob, c.col, .7);
	if (o.studs) g += studs([[-60, -380 + bob], [60, -380 + bob]]);
	const hy = -478 + bob + (p.nod || 0) * 5;
	g += circ(0, hy, 66, sk[0]) + `<path d="M0 ${hy - 66} A66 66 0 0 1 0 ${hy + 66}Z" fill="${sk[1]}"/>`;
	g += (look === 'rock' ? poly([[-70, hy - 10], [-44, hy - 70], [0, hy - 80], [56, hy - 70], [86, hy - 30], [104, hy - 92], [76, hy]], o.hairC) : `<path d="M-68 ${hy} A68 68 0 0 1 68 ${hy} L54 ${hy - 30} L-54 ${hy - 30}Z" fill="${INK}"/>` + circ(0, hy - 82, 30, INK));
	g += circ(-26, hy + 4, 21, 'none', `stroke="${INK}" stroke-width="6"`) + circ(26, hy + 4, 21, 'none', `stroke="${INK}" stroke-width="6"`) + rect(-6, hy + 2, 12, 5, INK) + circ(-26, hy + 4, 6, INK) + circ(26, hy + 4, 6, INK) + circ(-20, hy - 2, 5, '#fff', 'opacity=".7"') + circ(32, hy - 2, 5, '#fff', 'opacity=".7"');
	g += rect(-12, hy + 34, 26, 6, '#5A2A1E');
	const kY = organ ? -300 : -270, pr = p.press || 0, spread = p.spread ?? .5;
	const hl = [lerp(-150, -60, spread), kY + 4 + 10 * pr], hr = [lerp(60, 150, spread), kY + 4 + 10 * (p.press2 ?? pr)];
	let inst = '';
	if (grand) inst += rect(-330, -290, 580, 170, '#14131A') + rect(-330, -290, 580, 24, '#2A2834') + rect(-300, -120, 26, 120, '#14131A') + rect(200, -120, 26, 120, '#14131A') + rect(-290, -272, 520, 22, '#F6F2E8') + [...Array(26).keys()].map((k) => rect(-286 + k * 20, -272, 2, 22, INK)).join('');
	else if (organ) inst += rect(-260, -340, 520, 40, '#7A2A2A') + rect(-250, -330, 500, 16, '#F6F2E8') + rect(-260, -300, 520, 40, '#5A1E1E') + rect(-250, -290, 500, 16, '#F6F2E8') + seg([-200, -260], [-220, 0], 12, '#2A2A30') + seg([200, -260], [220, 0], 12, '#2A2A30') + [...Array(25).keys()].map((k) => rect(-246 + k * 20, -330, 2, 16, INK) + rect(-246 + k * 20, -290, 2, 16, INK)).join('');
	else inst += rect(-270, -290, 540, 34, '#25242C') + rect(-256, -282, 512, 18, '#F6F2E8') + [...Array(25).keys()].map((k) => rect(-252 + k * 20.4, -282, 2, 18, INK)).join('') + seg([-180, -256], [180, 0], 12, '#3A3A44') + seg([180, -256], [-180, 0], 12, '#3A3A44') + rect(-270, -290, 540, 6, c.col);
	g += inst;
	g += limb([-80, -390 + bob], hl, 100, 100, -1, 30, o.top, o.top, sk[0], 18).svg + limb([80, -390 + bob], hr, 100, 100, 1, 30, o.topD, o.topD, sk[1], 18).svg;
	return grp(`translate(${f1(x)} ${f1(y)}) scale(${s})`, g);
}
// ---------------------------------------------------------------- 大嗓门: the diva, big hair, bigger gestures
function pVox(x, y, s, look, p = {}) {
	const o = lk('vox', look), c = BAND.vox, sk = SK.e; let g = '';
	const bob = (p.bob || 0) * 8, open = p.open || 0, arm = p.arm || 0;
	if (o.dress === 'gown') g += poly([[-36, -480 + bob], [36, -480 + bob], [210, 0], [-210, 0]], o.top) + poly([[0, -480 + bob], [36, -480 + bob], [210, 0], [30, 0]], o.topD);
	else if (o.dress === 'sequin') { g += poly([[-30, -480 + bob], [30, -480 + bob], [80, 0], [-80, 0]], o.top) + poly([[0, -480 + bob], [30, -480 + bob], [80, 0], [12, 0]], o.topD);
		for (let i = 0; i < 46; i++) { const yy = -460 + ((i * 53) % 440), w = lerp(30, 76, (yy + 480) / 480); g += circ(-w + ((i * 37) % 100) / 100 * w * 2, yy + bob * (1 + yy / 480), 4, '#FFE8B0', `opacity="${f1(.4 + .5 * (((i * 7 + Math.floor((p.t || 0) * 8)) % 5) / 5))}"`); } }
	else {
		g += poly([[-36, -300], [-6, -300], [-24, 0], [-50, 0]], o.legs || '#2F3B52') + poly([[6, -300], [36, -300], [50, 0], [24, 0]], o.legsD || '#212A3B') + shoe(-44, -1) + shoe(42, 1);
		g += poly([[-40, -300 + bob], [40, -300 + bob], [56, -480 + bob], [-56, -480 + bob]], o.top) + poly([[8, -300 + bob], [40, -300 + bob], [56, -480 + bob], [10, -480 + bob]], o.topD);
	}
	if (o.jacket) g += poly([[-58, -480 + bob], [-20, -480 + bob], [-34, -280 + bob], [-62, -300 + bob]], o.jacket) + poly([[58, -480 + bob], [20, -480 + bob], [34, -280 + bob], [62, -300 + bob]], o.jacket) + studs([[-46, -440 + bob], [46, -440 + bob]]);
	if (o.dress === 'gown') g += poly([[-64, -390 + bob], [64, -390 + bob], [44, -360 + bob], [-44, -360 + bob]], c.col);
	const hy = -510 + bob;
	g += rect(-14, hy - 10, 28, 40, sk[0]);
	g += grp(`translate(0 ${f1(hy)}) rotate(${f1(-10 - 10 * open)})`, (() => { let h = '';
		h += o.bun ? circ(26, -126, 44, o.hair) : poly([[-50, -60], [-30, -120], [40, -132], [150, -80], [196, -20], [150, 0], [176, 50], [70, -30], [30, -20]], o.hair);
		h += poly([[-40, 0], [36, 0], [40, -96], [-36, -100]], sk[0]) + poly([[8, 0], [36, 0], [40, -96], [8, -98]], sk[1]) + poly([[-42, -94], [42, -94], [32, -124], [-32, -124]], o.hair);
		h += rect(-26, -62, 15, 6, INK) + rect(8, -62, 15, 6, INK) + poly([[-30, -66], [-26, -74], [-10, -68]], INK) + poly([[26, -66], [24, -74], [8, -68]], INK);
		h += poly([[-16, -26], [16, -26], [10, -26 + 8 + 30 * open], [-10, -26 + 8 + 30 * open]], '#5A1414') + rect(-16, -30, 32, 6, '#D9433A');
		return h; })());
	const shL = [-48, -470 + bob], shR = [48, -470 + bob];
	let mic = '';
	if (look === 'classical') {
		g += limb(shL, [-30 - 150 * arm, -380 - 170 * arm], 110, 110, 1, 22, o.top, sk[0], sk[0], 14).svg + limb(shR, [10, -380], 110, 110, -1, 22, o.topD, sk[1], sk[1], 14).svg;
	} else if (look === 'jazz') {
		mic = seg([-110, 0], [-110, -540], 8, '#8A8F9E') + `<rect x="-134" y="-604" width="48" height="66" rx="22" fill="#BFC3CC"/>` + [...Array(5).keys()].map((k) => rect(-130, -594 + k * 12, 40, 3, '#6A6E78')).join('');
		g += limb(shL, [-104, -560], 110, 110, 1, 22, o.top, sk[0], sk[0], 14).svg + limb(shR, [70 + 60 * arm, -380 - 140 * arm], 110, 110, -1, 22, o.topD, sk[1], sk[1], 14).svg;
	} else if (look === 'rock' || look === 'mix') {
		const mx = lerp(-60, -40, arm), my = lerp(-540, -660, arm);
		mic = seg([-230, 0], [mx, my], 8, '#8A8F9E') + circ(mx, my - 6, 16, '#3A3A48');
		g += limb(shL, [mx - 10, my + 30], 110, 110, 1, 22, o.jacket || o.top, sk[0], sk[0], 14).svg + limb(shR, [80 + 60 * arm, -520 - 200 * arm], 110, 110, -1, 22, o.jacket || o.topD, sk[1], sk[1], 14).svg;
	} else {
		mic = seg([-90, 0], [-90, -500], 7, '#8A8F9E') + seg([-90, -500], [-40, -540], 7, '#8A8F9E') + rect(-46, -566, 16, 40, '#2B2A36', 'rx="8"');
		g += limb(shL, [-40, -530], 110, 110, 1, 22, o.top, o.top, sk[0], 14).svg + limb(shR, [70 + 60 * arm, -380 - 160 * arm], 110, 110, -1, 22, o.topD, o.topD, sk[1], 14).svg;
	}
	return grp(`translate(${f1(x)} ${f1(y)}) scale(${s})`, mic + g);
}
// ---------------------------------------------------------------- guests: flute, sax, trumpet, trombone
function guestBody(c, h, w, sk, o = {}) {
	let g = poly([[-26, -h * .55], [-4, -h * .55], [-14, 0], [-36, 0]], o.legs || '#2A2A36') + poly([[4, -h * .55], [26, -h * .55], [36, 0], [14, 0]], o.legsD || '#1C1C26') + shoe(-30, -1) + shoe(30, 1);
	g += poly([[-w, -h * .55], [w, -h * .55], [w * .8, -h], [-w * .8, -h]], o.top || c.col) + poly([[w * .2, -h * .55], [w, -h * .55], [w * .8, -h], [w * .2, -h]], o.topD || c.dark);
	g += rect(-12, -h - 24, 24, 28, sk[0]) + poly([[-36, -h - 20], [36, -h - 20], [32, -h - 96], [-32, -h - 96]], sk[0]) + poly([[8, -h - 20], [36, -h - 20], [32, -h - 96], [8, -h - 96]], sk[1]);
	g += rect(-22, -h - 70, 12, 6, INK) + rect(8, -h - 70, 12, 6, INK);
	return g;
}
function pFlute(x, y, s, look, p = {}) {
	const c = BAND.flute, sk = SK.c, h = 330, bob = (p.bob || 0) * 6; let g = '';
	const o = look === 'classical' ? { top: TAILS.top, topD: TAILS.topD } : {};
	g += guestBody(c, h, 40, sk, o) + poly([[30, -h - 96], [-36, -h - 96], [-40, -h - 120], [36, -h - 124]], '#2A1A10') + poly([[-36, -h - 100], [-80, -h - 60], [-70, -h - 110]], '#2A1A10');
	g += poly([[34, -h - 54], [52, -h - 46], [34, -h - 40]], '#E8A070');
	g += seg([10, -h - 40 + bob], [240, -h - 10 + bob], 9, '#D8DDE6') + [...Array(6).keys()].map((k) => circ(80 + k * 26, -h - 31 + k * 3.4 + bob, 3, '#8A8F9E')).join('');
	g += limb([-30, -h + 10], [100, -h - 22 + bob], 80, 80, 1, 18, o.top || c.col, sk[0], sk[0], 11).svg + limb([30, -h + 10], [180, -h - 14 + bob - 4 * (p.blow || 0)], 90, 90, 1, 18, o.topD || c.dark, sk[1], sk[1], 11).svg;
	if (p.blow > .2) g += `<path d="M250 ${-h - 20} q20 -10 40 0" stroke="${c.col}" stroke-width="5" fill="none" opacity="${f1(p.blow)}"/>`;
	return grp(`translate(${f1(x)} ${f1(y + bob)}) scale(${s})`, g);
}
function pSax(x, y, s, look, p = {}) {
	const c = BAND.sax, sk = SK.b, h = 400, bl = p.blow || 0; let g = '';
	g += poly([[-84, 0], [84, 0], [92, -230], [-92, -230]], '#2A2A36') + guestBody(c, h, 96, sk) + poly([[-40, -h - 96], [44, -h - 96], [62, -h - 110], [-10, -h - 132], [-52, -h - 110]], '#1C1A2A');
	g += poly([[-32, -h - 72], [36, -h - 72], [34, -h - 56], [-30, -h - 56]], INK);
	g += grp(`rotate(${f1(-6 - 8 * bl)} 0 ${-h})`, `<path d="M-10 ${-h - 30} L-34 ${-h + 40} L-34 -170 C-34 -96 64 -96 74 -160 L84 -236" stroke="#E3B23C" stroke-width="36" fill="none" stroke-linejoin="round"/>` + poly([[62, -248], [116, -270], [104, -214]], '#E3B23C') + [...Array(5).keys()].map((k) => circ(-34, -h + 60 + k * 36, 6, '#B8862A')).join(''));
	g += limb([-80, -h + 20], [-50, -h + 120], 100, 100, 1, 26, c.col, c.col, sk[0], 18).svg + limb([80, -h + 20], [-26, -250], 120, 120, -1, 26, c.dark, c.dark, sk[1], 18).svg;
	return grp(`translate(${f1(x)} ${f1(y)}) scale(${s})`, g);
}
function pTpt(x, y, s, look, p = {}) {
	const c = BAND.tpt, sk = SK.c, h = 370, bl = p.blow || 0; let g = '';
	g += guestBody(c, h, 48, sk) + fedora(0, -h - 92, 44, '#2A2A36', c.col);
	g += circ(-34, -h - 44, 14 + 14 * bl, '#F2A08A') + circ(30, -h - 44, 10 + 10 * bl, '#E8907A');
	g += grp(`rotate(${f1(-14 - 10 * (p.lift || 0))} -30 ${-h - 46})`, rect(-210, -h - 54, 170, 14, '#E3B23C') + poly([[-276, -h - 84], [-206, -h - 56], [-206, -h - 38], [-276, -h - 8]], '#E3B23C') + rect(-160, -h - 74, 56, 28, 'none', 'stroke="#E3B23C" stroke-width="8"'));
	g += limb([-40, -h + 20], [-150, -h - 40], 90, 90, 1, 22, c.col, c.col, sk[0], 13).svg + limb([40, -h + 20], [-80, -h - 30], 100, 100, 1, 22, c.dark, c.dark, sk[1], 13).svg;
	return grp(`translate(${f1(x)} ${f1(y)}) scale(${s})`, g);
}
function pTbn(x, y, s, look, p = {}) {
	const c = BAND.tbn, sk = SK.d, h = 520, sl = p.slide ?? .3; let g = '';
	g += guestBody(c, h, 40, sk) + poly([[-36, -h - 96], [36, -h - 96], [50, -h - 40], [40, -h + 10], [-30, -h - 40]], '#3A1E14') + rect(-24, -h - 44, 50, 6, '#3A1E14');
	const ext = 30 + 150 * sl;
	g += rect(-120 - ext, -h - 46, 100 + ext, 10, '#E3B23C') + rect(-120 - ext, -h - 26, 100 + ext, 10, '#E3B23C') + rect(-130 - ext, -h - 46, 12, 30, '#E3B23C');
	g += rect(-40, -h - 84, 90, 12, '#E3B23C') + poly([[-40, -h - 96], [-150, -h - 130], [-150, -h - 30], [-40, -h - 64]], '#E3B23C') + poly([[-150, -h - 130], [-162, -h - 128], [-162, -h - 32], [-150, -h - 30]], '#B8862A');
	g += limb([-30, -h + 20], [-100 - ext, -h - 30], 110, 110, 1, 20, c.col, c.col, sk[0], 12).svg + limb([30, -h + 20], [-10, -h - 40], 90, 90, -1, 20, c.dark, c.dark, sk[1], 12).svg;
	return grp(`translate(${f1(x)} ${f1(y)}) scale(${s})`, g);
}
const DRAW = { drums: pDrums, bass: pBass, guitar: pGuitar, keys: pKeys, vox: pVox, flute: pFlute, sax: pSax, tpt: pTpt, tbn: pTbn };
// ---------------------------------------------------------------- silhouettes for the runs between gigs (one tone, walking)
const BUILD = { drums: { h: 560, w: 150, head: 34, leg: 200 }, bass: { h: 820, w: 50, head: 36, leg: 420 }, guitar: { h: 640, w: 50, head: 40, leg: 330, spikes: 1 },
	keys: { h: 470, w: 90, head: 62, leg: 180, round: 1 }, vox: { h: 620, w: 56, head: 40, leg: 300, hair: 1 }, flute: { h: 430, w: 40, head: 36, leg: 190 },
	sax: { h: 500, w: 96, head: 36, leg: 220 }, tpt: { h: 470, w: 48, head: 36, leg: 210 }, tbn: { h: 620, w: 40, head: 36, leg: 290 } };
function walker(who, x, y, s, phase, col, hat = null) {
	const B = BUILD[who], sw = Math.sin(phase * Math.PI * 2), hip = -B.leg, bob = Math.abs(Math.cos(phase * Math.PI * 2)) * 12;
	let g = '';
	const leg = (a) => { const k = [a * 60, hip * .45], f = [a * 120, -8]; return seg([0, hip - bob], add(k, [0, -bob * .5]), B.w * .5 + 14, col) + seg(add(k, [0, -bob * .5]), f, B.w * .4 + 12, col) + poly([[f[0] - 20, 0], [f[0] + 50, 0], [f[0] + 40, -22], [f[0] - 16, -26]], col); };
	g += leg(sw) + leg(-sw);
	const top = hip - (B.h - B.leg - B.head * 2) - bob;
	g += B.round ? ell(0, (hip + top) / 2 - bob, B.w + 10, (hip - top) / 2 + 10, col) : poly([[-B.w * .7, hip - bob], [B.w * .7, hip - bob], [B.w, top], [-B.w, top]], col);
	g += seg([-B.w * .8, top + 20], [-B.w * .8 - sw * 70, top + 170], 26, col) + seg([B.w * .8, top + 20], [B.w * .8 + sw * 70, top + 170], 26, col);
	const hy = top - B.head - 6;
	g += B.round ? circ(0, hy, B.head, col) : poly([[-B.head * .8, hy + B.head], [B.head * .8, hy + B.head], [B.head * .9, hy - B.head], [-B.head * .9, hy - B.head]], col);
	if (B.spikes) g += poly([[-70, hy - 10], [-40, hy - 70], [-6, hy - 120], [20, hy - 60], [70, hy - 90], [56, hy - 20]], col);
	if (B.hair) g += poly([[-30, hy - 40], [40, hy - 50], [150, hy], [120, hy + 40], [30, hy]], col);
	if (who === 'drums') g += poly([[-46, hy + 10], [46, hy + 10], [0, hy + 130]], col);
	if (hat === 'fedora') g += fedora(0, hy - B.head + 10, B.head * 1.6, col, col);
	if (hat === 'tophat') g += tophat(0, hy - B.head + 6, B.head * 1.1, col);
	return grp(`translate(${f1(x)} ${f1(y)}) scale(${s})`, g);
}
