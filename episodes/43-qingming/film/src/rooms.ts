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
