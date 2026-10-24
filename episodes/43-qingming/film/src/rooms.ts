// Interior sets: STORE (沈阳临时库房, 1950), XBL (伪满图书楼, 1945), ROOM-元 (mounting room). Frame px at rest; 2.5D layers.
import {Stage, Live, Motes, svgDoc, svgToCanvas, canvasTex, gradCanvas, hash, W, H} from './core';
import {SIL, roof, willow} from './draw';

const f = (v: number) => v.toFixed(1);
const rn = (i: number) => hash(i * 2.17 + 0.3);
/** a heap of rolled scrolls (ends toward the camera as ellipses, bodies as rounded bars), lit edge colour */
export const scrollHeap = (cx: number, base: number, w: number, h: number, n: number, seed: number, body = '#1b1612', end = '#2a231c', ring = '#3a3027') => {
	let o = '';
	const rows = Math.max(2, Math.round(h / 40));
	for (let r = 0; r < rows; r++) {
		const y = base - r * (h / rows) * 0.9, rw = w * (1 - r / rows * 0.75), cnt = Math.max(1, Math.round(n * (1 - r / rows * 0.7) / rows));
		for (let i = 0; i < cnt; i++) {
			const x = cx - rw / 2 + (i + 0.5) * rw / cnt + (rn(seed + r * 31 + i) - 0.5) * 22, len = 120 + rn(seed + i * 7 + r) * 160, dia = 22 + rn(seed + i + r * 9) * 16, ang = (rn(seed + i * 3 + r * 5) - 0.5) * 0.5;
			const dx = Math.cos(ang) * len / 2, dy = Math.sin(ang) * len / 2;
			o += `<path fill="${body}" stroke="${SIL}" stroke-width="2" d="M${f(x - dx)},${f(y - dy - dia / 2)} L${f(x + dx)},${f(y + dy - dia / 2)} L${f(x + dx)},${f(y + dy + dia / 2)} L${f(x - dx)},${f(y - dy + dia / 2)} Z"/>`;
			o += `<ellipse fill="${end}" stroke="${ring}" stroke-width="2" cx="${f(x + dx)}" cy="${f(y + dy)}" rx="${f(dia * 0.32)}" ry="${f(dia / 2)}"/>`;
		}
	}
	return o;
};
/** shelving unit with rolled scrolls (ends visible) */
const shelves = (x0: number, x1: number, y0: number, y1: number, rows: number, seed: number, wood = '#1c1713', ends = '#2b241d') => {
	let o = `<rect fill="${wood}" x="${f(x0)}" y="${f(y0)}" width="${f(x1 - x0)}" height="${f(y1 - y0)}" fill-opacity="0.55"/>`;
	const rh = (y1 - y0) / rows;
	for (let r = 0; r <= rows; r++) o += `<rect fill="${wood}" x="${f(x0)}" y="${f(y0 + r * rh - 6)}" width="${f(x1 - x0)}" height="12"/>`;
	for (let x = x0; x <= x1 + 1; x += (x1 - x0) / 3) o += `<rect fill="${wood}" x="${f(x - 7)}" y="${f(y0)}" width="14" height="${f(y1 - y0)}"/>`;
	for (let r = 0; r < rows; r++) for (let i = 0; i < 40; i++) {
		if (rn(seed + r * 100 + i) < 0.18) continue; const x = x0 + 20 + i * (x1 - x0 - 40) / 40, y = y0 + r * rh + rh - 6 - 14 - (rn(seed + i * 3 + r) * 0.3) * rh * 0.4;
		o += `<circle fill="${ends}" stroke="${SIL}" stroke-width="2" cx="${f(x)}" cy="${f(y)}" r="${f(11 + rn(seed + i + r * 7) * 5)}"/>`;
	}
	return o;
};
/** slatted wooden boxes on shelves (XBL) */
const boxShelves = (x0: number, x1: number, y0: number, y1: number, rows: number, seed: number, wood = '#1e1914', slat = '#2c251e') => {
	let o = ''; const rh = (y1 - y0) / rows;
	for (let r = 0; r <= rows; r++) o += `<rect fill="${wood}" x="${f(x0)}" y="${f(y0 + r * rh - 6)}" width="${f(x1 - x0)}" height="12"/>`;
	for (let x = x0; x <= x1 + 1; x += (x1 - x0) / 4) o += `<rect fill="${wood}" x="${f(x - 7)}" y="${f(y0)}" width="14" height="${f(y1 - y0)}"/>`;
	for (let r = 0; r < rows; r++) { let x = x0 + 16; while (x < x1 - 90) { const bw = 70 + rn(seed + x + r) * 50, bh = rh * (0.55 + rn(seed + x * 3 + r) * 0.25), by = y0 + (r + 1) * rh - 6 - bh;
		o += `<rect fill="${slat}" stroke="${SIL}" stroke-width="3" x="${f(x)}" y="${f(by)}" width="${f(bw)}" height="${f(bh)}"/>`;
		for (let k = 1; k < 4; k++) o += `<line stroke="${SIL}" stroke-width="2" x1="${f(x)}" y1="${f(by + (k * bh) / 4)}" x2="${f(x + bw)}" y2="${f(by + (k * bh) / 4)}"/>`;
		x += bw + 10; } }
	return o;
};

export class Store {
	st = new Stage('store'); ready: Promise<void>; lamp!: Live; dust!: Motes;
	constructor() { this.ready = this.build(); }
	async build() {
		const st = this.st;
		st.add('wall', canvasTex(gradCanvas([[0, '#2a2622'], [0.35, '#3a3530'], [0.7, '#433d36'], [1, '#33302b']])), 960, 540, 4200, 2400, -1800);
		const back = svgDoc(`${shelves(-600, 900, 120, 760, 4, 11)}${shelves(1020, 2520, 120, 760, 4, 23)}<rect fill="#141110" x="-900" y="760" width="3800" height="600"/>`, 3600, 1500, '', -900, -100);
		st.add('shelves', canvasTex(await svgToCanvas(back, 3600, 1500, 0.6)), 900, 650, 3600, 1500, -900, {fog: ['#4a4239', 0.22], rim: 0.6});
		const heaps = svgDoc(`${scrollHeap(-80, 980, 900, 260, 60, 3)}${scrollHeap(1950, 1000, 1000, 300, 70, 7)}${scrollHeap(560, 1040, 520, 120, 26, 13)}`, 3600, 1500, '', -900, -100);
		st.add('heaps', canvasTex(await svgToCanvas(heaps, 3600, 1500, 0.6)), 900, 650, 3600, 1500, -300, {rim: 1.0, rimPx: 6});
		const table = svgDoc(`<rect fill="#1a1410" x="380" y="760" width="1200" height="34" rx="4"/><rect fill="${SIL}" x="420" y="790" width="26" height="250"/><rect fill="${SIL}" x="1514" y="790" width="26" height="250"/><rect fill="${SIL}" x="600" y="790" width="760" height="18"/>`, W, H);
		st.add('table', canvasTex(await svgToCanvas(table, W, H, 1)), 960, 540, W, H, 0, {rim: 1.0, rimPx: 5});
		st.add('floor', canvasTex(gradCanvas([[0, '#3d362e'], [1, '#221e1a']])), 960, 1260, 4400, 1000, -950);
		this.lamp = new Live(st, 'lamp', 960, 540, W, H, 10, {emissive: 1.3}, 1);
		this.dust = new Motes(st, 260, 'dust', 300, 7, '#E8C890', true);
	}
}

export class XBL {
	st = new Stage('xbl'); ready: Promise<void>; dust!: Motes;
	constructor() { this.ready = this.build(); }
	async build() {
		const st = this.st;
		// night courtyard seen through open double doors (centre), moonlight
		st.add('night', canvasTex(gradCanvas([[0, '#2b3a45'], [0.6, '#3d4e58'], [1, '#4f5c62']])), 960, 400, 3000, 1600, -2400);
		const yard = svgDoc(`${willow(1250, 760, 520, 4, '#10151a')}<rect fill="#141a1e" x="0" y="740" width="1920" height="400"/><path fill="#10151a" d="M0,740 L600,700 L1400,700 L1920,740 Z"/>`, W, H);
		st.add('yard', canvasTex(await svgToCanvas(yard, W, H, 0.7)), 960, 540, W, H, -1500, {fog: ['#3b474b', 0.2]});
		// the room: wall with door opening (cut out), shelves of slatted boxes left and right
		const room = svgDoc(`<path fill-rule="evenodd" fill="#33383d" d="M-900,-200 L2820,-200 L2820,1300 L-900,1300 Z M800,260 L1120,260 L1120,830 L800,830 Z"/>
			<rect fill="#15100C" x="786" y="246" width="348" height="18"/><rect fill="#15100C" x="786" y="246" width="16" height="590"/><rect fill="#15100C" x="1118" y="246" width="16" height="590"/>
			<path fill="#15100C" d="M800,262 L700,300 L700,860 L800,830 Z M1120,262 L1220,300 L1220,860 L1120,830 Z"/>
			${boxShelves(-700, 640, 120, 820, 4, 5)}${boxShelves(1280, 2620, 120, 820, 4, 9)}`, 3720, 1500, '', -900, -200);
		st.add('room', canvasTex(await svgToCanvas(room, 3720, 1500, 0.6)), 960, 550, 3720, 1500, -500, {rim: 0.0});
		st.add('floor', canvasTex(gradCanvas([[0, '#3e4144'], [0.5, '#2f3134'], [1, '#232427']])), 960, 1180, 4200, 800, -60);
		// moonlight spill through the doors onto the floor (soft, emissive-ish)
		const spill = svgDoc(`<defs><linearGradient id="m" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9fb2bd" stop-opacity="0.32"/><stop offset="1" stop-color="#9fb2bd" stop-opacity="0"/></linearGradient></defs><path fill="url(#m)" d="M800,830 L1120,830 L1500,1080 L420,1080 Z"/>`, W, H);
		st.add('spill', canvasTex(await svgToCanvas(spill, W, H, 0.5)), 960, 540, W, H, -40, {});
		this.dust = new Motes(st, 220, 'dust', 200, 6, '#AFC0C8', false);
	}
}

/** ROOM-元: the Yuan palace mounting room — round moon window (Dagoba outside), hanging lamp, long table, hung scrolls */
import {dagoba as dagobaSvg, skyline as skylineSvg} from './draw';
export class RoomYuan {
	st = new Stage('roomYuan'); ready: Promise<void>; lamp!: Live;
	constructor(public sky: 'dusk' | 'night' = 'night') { this.ready = this.build(); }
	async build() {
		const st = this.st, night = this.sky === 'night';
		// outside the window: sky + Dagoba + roofs
		st.add('osky', canvasTex(gradCanvas(night ? [[0, '#22323C'], [0.6, '#3a4a52'], [1, '#56605c']] : [[0, '#2B4552'], [0.5, '#6E827E'], [0.8, '#E6B676'], [1, '#F3CC8E']])), 1200, 420, 1400, 900, -2600);
		const out = svgDoc(`${dagobaSvg(1240, 640, 0.95, night ? '#1a2128' : '#3e4a4c')}${skylineSvg(700, 1800, 660, 30, 80, 51, night ? '#141a1f' : '#2e3a3e')}`, W, H);
		st.add('outside', canvasTex(await svgToCanvas(out, W, H, 0.6)), 960, 540, W, H, -1800, {fog: [night ? '#3a4a52' : '#BCA07A', 0.25]});
		// wall with a round moon window cut out; hung scrolls; lattice
		const wall = svgDoc(`<path fill-rule="evenodd" fill="${night ? '#3a4a54' : '#41525a'}" d="M-600,-300 L2520,-300 L2520,1400 L-600,1400 Z M1240,420 m-280,0 a280,280 0 1,0 560,0 a280,280 0 1,0 -560,0 Z"/>
			<circle cx="1240" cy="420" r="292" fill="none" stroke="#15100C" stroke-width="26"/>
			<rect x="180" y="120" width="120" height="430" fill="#2a3036"/><rect x="176" y="112" width="128" height="14" fill="#15100C"/><rect x="176" y="546" width="128" height="14" fill="#15100C"/>
			<rect x="360" y="150" width="100" height="380" fill="#2a3036"/><rect x="356" y="142" width="108" height="14" fill="#15100C"/><rect x="356" y="526" width="108" height="14" fill="#15100C"/>
			<rect x="-600" y="-300" width="3120" height="70" fill="#15100C"/><rect x="560" y="-300" width="36" height="1700" fill="#1c2024"/><rect x="1700" y="-300" width="36" height="1700" fill="#1c2024"/>`, 3120, 1700, '', -600, -300);
		st.add('wall', canvasTex(await svgToCanvas(wall, 3120, 1700, 0.6)), 960, 550, 3120, 1700, -900, {rim: 0.4});
		// table (long, low) in front
		const table = svgDoc(`<rect fill="#2a2018" x="-200" y="720" width="2320" height="40" rx="4"/><rect fill="#15100C" x="-200" y="756" width="2320" height="16"/><rect fill="#15100C" x="40" y="770" width="34" height="320"/><rect fill="#15100C" x="1840" y="770" width="34" height="320"/>`, 2600, 1200, '', -340, 0);
		st.add('table', canvasTex(await svgToCanvas(table, 2600, 1200, 0.7)), 960, 600, 2600, 1200, -40, {rim: 0.9, rimPx: 5});
		st.add('floor', canvasTex(gradCanvas([[0, '#2c3236'], [1, '#1a1e21']])), 960, 1250, 4000, 700, -700);
		// hanging lamp (body + glow, live so it can be cupped / die)
		this.lamp = new Live(st, 'lamp', 960, 540, W, H, -100, {emissive: 1.4}, 1);
	}
	/** lamp brightness 0..1 at (x,y) */
	setLamp(x: number, y: number, k: number) {
		this.lamp.draw(`${k.toFixed(2)}`, (g) => { g.strokeStyle = '#15100C'; g.lineWidth = 3; g.beginPath(); g.moveTo(x, -10); g.lineTo(x, y - 30); g.stroke();
			g.fillStyle = '#15100C'; g.fillRect(x - 22, y - 34, 44, 8);
			const c = Math.round(40 + 200 * k), c2 = Math.round(32 + 150 * k); g.fillStyle = `rgb(${c},${c2},${Math.round(25 + 80 * k)})`; g.beginPath(); g.ellipse(x, y, 26, 32, 0, 0, Math.PI * 2); g.fill();
			if (k > 0) { const gr = g.createRadialGradient(x, y, 0, x, y, 120); gr.addColorStop(0, `rgba(255,184,104,${0.5 * k})`); gr.addColorStop(1, 'rgba(255,184,104,0)'); g.fillStyle = gr; g.beginPath(); g.arc(x, y, 120, 0, Math.PI * 2); g.fill(); } });
	}
}

/** WUMEN: 午门 exterior at night with the 马道 ramp (queue), and the exhibition hall with the glass case */
import {wumen as wumenSvg, tinyFig} from './draw';
export class Wumen {
	ext = new Stage('wumenExt'); hall = new Stage('wumenHall'); ready: Promise<void>; caseLight!: Live; queue!: Live; hallCrowd!: Live; card!: Live;
	constructor() { this.ready = this.build(); }
	async build() {
		const e = this.ext;
		e.add('sky', canvasTex(gradCanvas([[0, '#1b2731'], [0.5, '#2a3a44'], [0.8, '#3f4c50'], [1, '#4c534f']])), 960, 300, 5000, 2200, -6000);
		const gate = svgDoc(`${wumenSvg(960, 760, 1.3, '#141619', '#E0A060')}`, 3200, 1400, '', -640, -300);
		e.add('gate', canvasTex(await svgToCanvas(gate, 3200, 1400, 0.6)), 960, 400, 3200, 1400, -1600, {rim: 0.25});
		// plaza + ramp (马道) rising toward the gate from the lower right
		const plaza = svgDoc(`<rect x="-900" y="760" width="3700" height="900" fill="#26292b"/><path d="M-900,1300 L1800,760 L2050,760 L-400,1400 Z" fill="#30332f"/><path d="M-900,1300 L1800,760" stroke="#15100C" stroke-width="10"/>`, 3700, 1500, '', -900, 0);
		e.add('plaza', canvasTex(await svgToCanvas(plaza, 3700, 1500, 0.5)), 950, 750, 3700, 1500, -400, {});
		this.queue = new Live(e, 'queue', 960, 640, 3200, 1400, -300, {rim: 0.8, rimPx: 4}, 0.6);
		this.caseLight = new Live(e, 'caseLight', 960, 400, 3200, 1400, -1590, {emissive: 1.6}, 0.6);
		// hall: dark walls, the glass case in the centre, crowd of profiles
		const h = this.hall;
		h.add('wall', canvasTex(gradCanvas([[0, '#22262a'], [0.5, '#30353a'], [1, '#262a2e']])), 960, 540, 3600, 2000, -1600);
		const hallSvg = svgDoc(`<rect x="-600" y="840" width="3200" height="500" fill="#1e2124"/><rect x="560" y="540" width="800" height="300" fill="#2b3036" stroke="#15100C" stroke-width="10"/>
			<rect x="600" y="560" width="720" height="40" fill="#15100C"/><rect x="620" y="836" width="40" height="300" fill="#15100C"/><rect x="1260" y="836" width="40" height="300" fill="#15100C"/>`, 3200, 1500, '', -640, 0);
		h.add('case', canvasTex(await svgToCanvas(hallSvg, 3200, 1500, 0.6)), 960, 750, 3200, 1500, -500, {rim: 0.7, rimPx: 5});
		this.hallCrowd = new Live(h, 'hallCrowd', 960, 540, 2400, 1200, -200, {rim: 1.0, rimPx: 5}, 0.8);
		this.card = new Live(h, 'card', 960, 540, W, H, -480, {}, 1);
	}
	/** queue figures along the ramp, stepping forward on beats (phase in steps) */
	setQueue(step: number, n = 70) {
		const key = `${Math.round(step * 8)}`;
		this.queue.drawW(key, (g) => { g.fillStyle = '#15100C'; for (let i = 0; i < n; i++) { const u = ((i / n) + step * 0.012) % 1, x = -700 + u * 2450, y = 1300 - u * 540;
			const svg = tinyFig(x, y, 60 - u * 28, 900 + i); for (const m of svg.matchAll(/d="([^"]+)"/g)) g.fill(new Path2D(m[1]));
			for (const m of svg.matchAll(/<circle[^>]*cx="([^"]+)" cy="([^"]+)" r="([^"]+)"/g)) { g.beginPath(); g.arc(+m[1], +m[2], +m[3], 0, Math.PI * 2); g.fill(); }
			for (const m of svg.matchAll(/<ellipse[^>]*cx="([^"]+)" cy="([^"]+)" rx="([^"]+)" ry="([^"]+)"/g)) { g.beginPath(); g.ellipse(+m[1], +m[2], +m[3], +m[4], 0, 0, Math.PI * 2); g.fill(); } } });
	}
	/** the one warm point at the top of the ramp (case light seen from outside) */
	setCaseLight(k: number) { this.caseLight.drawW(`${k.toFixed(2)}`, (g) => { if (k <= 0) return; const x = 960, y = 700; const gr = g.createRadialGradient(x, y, 0, x, y, 70); gr.addColorStop(0, `rgba(255,214,150,${k})`); gr.addColorStop(1, 'rgba(255,190,110,0)'); g.fillStyle = gr; g.beginPath(); g.arc(x, y, 70, 0, Math.PI * 2); g.fill(); }); }
}

/** DESK: one writing-desk set with four dressings (北宋 studio, 金 张著, 元 杨准 study, 清宫 night room) */
export type DeskKind = 'song' | 'jin' | 'yuan' | 'qing';
export class Desk {
	st: Stage; ready: Promise<void>; lamp!: Live;
	constructor(public kind: DeskKind) { this.st = new Stage('desk-' + kind); this.ready = this.build(); }
	async build() {
		const st = this.st, k = this.kind;
		const wallCol = {song: '#4a3f33', jin: '#45403a', yuan: '#3f4a40', qing: '#3a3330'}[k];
		const outSky = {song: [[0, '#5c6c70'], [1, '#c9a47a']], jin: [[0, '#3a4a52'], [1, '#8a8a7a']], yuan: [[0, '#4a5e58'], [1, '#a7b39a']], qing: [[0, '#1d2a33'], [1, '#3a4850']]}[k] as [number, string][];
		st.add('osky', canvasTex(gradCanvas(outSky)), 1300, 420, 1200, 900, -2400);
		let win = '', outside = '';
		if (k === 'yuan') { win = `M1050,200 L1550,200 L1550,600 L1050,600 Z`; outside = `<path fill="#22301f" d="M1100,620 C1080,420 1180,300 1250,260 C1210,380 1200,500 1230,620 Z M1300,620 C1330,450 1420,360 1500,330 C1440,430 1400,520 1390,620 Z"/>` + Array.from({length: 7}, (_, i) => `<rect x="${1120 + i * 60}" y="${180 - i * 8}" width="10" height="${460 + i * 8}" fill="#1f2a1e"/>`).join(''); }
		else if (k === 'qing') win = `M1100,230 L1500,230 L1500,560 L1100,560 Z`;
		else win = `M1300,400 m-200,0 a200,200 0 1,0 400,0 a200,200 0 1,0 -400,0 Z`;
		if (outside) st.add('outside', canvasTex(await svgToCanvas(svgDoc(outside, W, H), W, H, 0.6)), 960, 540, W, H, -1500, {fog: ['#a7b39a', 0.2]});
		const lattice = k === 'yuan' || k === 'qing' ? Array.from({length: 8}, (_, i) => `<rect x="${(k === 'yuan' ? 1050 : 1100) + i * (k === 'yuan' ? 62 : 50)}" y="${k === 'yuan' ? 200 : 230}" width="6" height="${k === 'yuan' ? 400 : 330}" fill="#15100C"/>`).join('') : '';
		const wall = svgDoc(`<path fill-rule="evenodd" fill="${wallCol}" d="M-600,-300 L2520,-300 L2520,1400 L-600,1400 Z ${win}"/>${lattice}<rect x="-600" y="-300" width="3120" height="80" fill="#15100C"/>`, 3120, 1700, '', -600, -300);
		st.add('wall', canvasTex(await svgToCanvas(wall, 3120, 1700, 0.6)), 960, 550, 3120, 1700, -900, {rim: 0.4});
		const desk = svgDoc(`<rect fill="#2a2018" x="300" y="760" width="1400" height="30" rx="3"/><rect fill="#15100C" x="300" y="788" width="1400" height="14"/><rect fill="#15100C" x="360" y="800" width="26" height="300"/><rect fill="#15100C" x="1620" y="800" width="26" height="300"/>
			${k !== 'qing' ? '<rect fill="#1b1612" x="1450" y="740" width="70" height="22" rx="6"/><rect fill="#15100C" x="1530" y="700" width="6" height="62"/><rect fill="#15100C" x="1546" y="706" width="6" height="56"/>' : '<rect fill="#1b1612" x="1450" y="742" width="80" height="20"/>'}`, W, 1200);
		st.add('desk', canvasTex(await svgToCanvas(desk, W, 1200, 0.8)), 960, 600, W, 1200, -40, {rim: 0.9, rimPx: 5});
		st.add('floor', canvasTex(gradCanvas([[0, '#3a3229'], [1, '#221d18']])), 960, 1250, 4000, 700, -700);
		this.lamp = new Live(st, 'lamp', 960, 540, W, H, -60, {emissive: 1.3}, 1);
	}
}
