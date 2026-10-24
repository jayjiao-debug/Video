// CREST: the 虹桥 crest handover stage. World px: deck crest top at (960, 900); the arch half-span 1700 px drops to y 1400.
// Camera presets (world px centre + zoom): CR-A medium two-shot, CR-B locked wide, CR-C lateral (deck level), CR-D low from
// the water, CR-E high oblique, CR-F tilt from river, CR-G steep high.
import * as THREE from 'three';
import {Stage, Live, Motes, svgDoc, svgToCanvas, canvasTex, gradCanvas, W, H} from './core';
import {SIL, hongqiao, railing, deckY, lantern, lanternGlow, skyline, willow, crowd, cityGate, dagoba, jiaolou, wumen, boat, hills, gateArch} from './draw';

export const CX = 960, YTOP = 900, HS = 1700, YEND = 1400;
export const deck = (x: number) => deckY(x, CX, YTOP, HS, YEND);
export type Sky = 'dusk' | 'day' | 'night' | 'fire' | 'snow';
export type Era = '宋' | '元' | '明' | '清' | '1923' | '1950' | 'none';
export const SKIES: Record<Sky, [number, string][]> = {
	dusk: [[0, '#2B4552'], [0.3, '#3F5C66'], [0.46, '#6E827E'], [0.58, '#BCA07A'], [0.66, '#E6B676'], [0.72, '#F3CC8E'], [0.8, '#E9C08A'], [1, '#B89670']],
	day: [[0, '#4E6B75'], [0.3, '#5E7A82'], [0.5, '#8FA7A6'], [0.64, '#D9CFAE'], [0.75, '#F1E2BE'], [1, '#D8CBAA']],
	night: [[0, '#16222B'], [0.4, '#22323C'], [0.66, '#34454C'], [0.74, '#4A4A3E'], [1, '#2A2E2C']],
	fire: [[0, '#2A1D1F'], [0.35, '#4A2722'], [0.55, '#6B2E22'], [0.66, '#C2562F'], [0.73, '#E88A45'], [1, '#7A3A22']],
	snow: [[0, '#2E3B47'], [0.4, '#4A5A66'], [0.68, '#6C7A82'], [0.76, '#7E8A90'], [1, '#4A545A']],
};
/** horizon colour per sky (fog target for far layers) */
export const HORIZON: Record<Sky, string> = {dusk: '#C9A47A', day: '#C9C2A6', night: '#3E4744', fire: '#B04E2E', snow: '#6E7B82'};
export const WATER: Record<Sky, [number, string][]> = {
	dusk: [[0, '#8C8573'], [0.25, '#4E5B5A'], [1, '#1A2326']], day: [[0, '#B9B7A0'], [0.3, '#7E8E8C'], [1, '#33403F']],
	night: [[0, '#3A4442'], [0.3, '#232D30'], [1, '#121A1D']], fire: [[0, '#9A4A2C'], [0.3, '#4A2A22'], [1, '#1A1414']], snow: [[0, '#6A767A'], [0.3, '#3E4A50'], [1, '#1E262A']],
};
export type CrestOpts = {sky: Sky; era: Era; lanterns?: boolean; boat?: boolean; bankCrowd?: boolean; snow?: boolean; embers?: boolean; seed?: number};

const palaceSVG = (era: Era, sky: Sky) => {
	// far bank: palace slot on the LEFT (x ≈ -700..300), city skyline elsewhere; base y 860
	const base = 860; let s = '';
	s += hills(-3200, 5200, base - 40, 90, 7, '#000');
	s += skyline(-3200, 5200, base, 40, 110, 11);
	switch (era) {
		case '宋': s += cityGate(-380, base, 1.1); break;
		case '元': s += dagoba(-520, base, 1.25) + cityGate(60, base, 0.7); break;
		case '明': case '清': s += jiaolou(-420, base, 1.3) + cityGate(250, base, 0.75); break;
		case '1923': s += jiaolou(-420, base, 1.3) + cityGate(250, base, 0.75); break;
		case '1950': s += wumen(-300, base, 0.9, SIL, sky === 'day' ? '#9FA89E' : undefined); break;
		default: break;
	}
	s += Array.from({length: 7}, (_, i) => willow(-2600 + i * 1200 + (i % 2) * 300, base + 6, 230 + (i % 3) * 40, 20 + i)).join('');
	return s;
};

export class Crest {
	st: Stage; o: CrestOpts; lanternsLive!: Live; glowLive!: Live; boatLive?: Live; motes?: Motes; posts: [number, number][] = [];
	ready: Promise<void>;
	constructor(name: string, o: CrestOpts) { this.st = new Stage(name); this.o = o; this.ready = this.build(); }
	async build() {
		const st = this.st, o = this.o;
		// sky (far): a vertical gradient covering everything
		st.add('sky', canvasTex(gradCanvas(SKIES[o.sky])), CX, 700, 9000, 3600, -9000);
		// far bank (palace, skyline, willows, bank crowd)
		const farW = 8400, farH = 1400;
		const farSvg = svgDoc(`<g transform="translate(${farW / 2 - CX},${-(860 - farH * 0.55)})">${palaceSVG(o.era, o.sky)}${o.bankCrowd ? crowd(-3000, 5000, 862, 26, 40, 220, 5) : ''}</g>`, farW, farH);
		st.add('far', canvasTex(await svgToCanvas(farSvg, farW, farH, 0.5)), CX, 860 - farH * 0.55 + farH / 2, farW, farH, -2600, {fog: [HORIZON[o.sky], o.sky === 'day' ? 0.45 : 0.32], rim: 0.0});
		// river: from the far bank down past the arch
		const wc = gradCanvas(WATER[o.sky], 64, 1024); st.add('river', canvasTex(wc), CX, 860 + 1400 / 2, 9000, 1400, -1400);
		// near banks where the arch lands (both ends), with shops and crowd
		const bankSvg = svgDoc(`<g transform="translate(${4400 - CX},0)">
			<path fill="${SIL}" d="M-4000,1380 L-760,1380 L-640,1420 L-600,1700 L-4000,1700 Z M2560,1380 L6000,1380 L6000,1700 L2520,1700 L2560,1420 Z"/>
			${skyline(-3600, -820, 1384, 110, 210, 31)}${skyline(2700, 5600, 1384, 110, 210, 37)}
			${o.bankCrowd ? crowd(-2600, -800, 1382, 60, 90, 60, 41) + crowd(2720, 4600, 1382, 60, 90, 60, 43) : ''}</g>`, 8800, 1800);
		st.add('banks', canvasTex(await svgToCanvas(bankSvg, 8800, 1800, 0.5)), CX, 900, 8800, 1800, -60, {rim: 0.6});
		// the arch + deck
		const archSvg = svgDoc(`<g transform="translate(${2400 - CX},${-300})">${hongqiao(CX, YTOP, HS, YEND)}</g>`, 4800, 1600);
		st.add('arch', canvasTex(await svgToCanvas(archSvg, 4800, 1600, 0.75)), CX, 300 + 800, 4800, 1600, 0, {rim: 0.9, rimPx: 6});
		// near railing (in front of the figures), lantern hooks on alternate posts
		const rl = railing(CX, YTOP + 6, HS, YEND, 150, 116);
		this.posts = rl.posts.filter((_, i) => i % 2 === 0);
		const railSvg = svgDoc(`<g transform="translate(${2400 - CX},${-300})">${rl.svg}</g>`, 4800, 1600);
		st.add('rail', canvasTex(await svgToCanvas(railSvg, 4800, 1600, 0.75)), CX, 300 + 800, 4800, 1600, 40, {rim: 0.9, rimPx: 5});
		// lanterns (bodies; lit/dark state redrawn) + glow (emissive)
		this.lanternsLive = new Live(st, 'lanterns', CX, 1100, 4800, 1600, 45, {rim: 0.5}, 0.5);
		this.glowLive = new Live(st, 'lglow', CX, 1100, 4800, 1600, 46, {emissive: 1.6}, 0.5);
		if (o.boat) this.boatLive = new Live(st, 'boat', CX, 1100, 4800, 1600, -700, {fog: [HORIZON[o.sky], 0.15], rim: 0.3}, 0.5);
		if (o.snow) this.motes = new Motes(st, 900, 'snow', 600, 9, '#D9E1E6');
		if (o.embers) this.motes = new Motes(st, 500, 'ember', 400, 10, '#FFB06A', true);
	}
	/** lanterns: lit fraction per post index (0..1) */
	setLanterns(lit: (i: number, x: number) => number) {
		const vals = this.posts.map(([x], i) => Math.round(lit(i, x) * 20) / 20); const key = vals.join(',');
		this.lanternsLive.drawW(key, (g) => { for (let i = 0; i < this.posts.length; i++) { const [x, y] = this.posts[i]; drawLantern(g, x, y - 4, vals[i]); } });
		this.glowLive.drawW(key, (g) => { for (let i = 0; i < this.posts.length; i++) { const [x, y] = this.posts[i]; if (vals[i] > 0) { const gr = g.createRadialGradient(x, y + 46, 0, x, y + 46, 30); gr.addColorStop(0, `rgba(255,190,110,${vals[i]})`); gr.addColorStop(1, 'rgba(255,170,90,0)'); g.fillStyle = gr; g.beginPath(); g.ellipse(x, y + 46, 30, 36, 0, 0, Math.PI * 2); g.fill(); } } });
	}
	/** the river boat at world x, mast angle */
	setBoat(x: number, mast: number) {
		if (!this.boatLive) return; const key = `${x.toFixed(0)}:${mast.toFixed(1)}`;
		this.boatLive.drawW(key, (g) => fillSvg(g, boat(x, 1560, 520, mast)));
	}
}
/** draw one lantern with a lit amount */
const drawLantern = (g: CanvasRenderingContext2D, x: number, y: number, lit: number) => {
	g.fillStyle = SIL; g.fillRect(x - 1.5, y, 3, 22); g.fillRect(x - 14, y + 20, 28, 6); g.fillRect(x - 10, y + 75, 20, 5);
	const c0 = [42, 34, 27], c1 = [242, 184, 102]; const c = c0.map((v, i) => Math.round(v + (c1[i] - v) * lit));
	g.fillStyle = `rgb(${c[0]},${c[1]},${c[2]})`; g.beginPath(); g.ellipse(x, y + 50, 20, 27, 0, 0, Math.PI * 2); g.fill();
	g.strokeStyle = 'rgba(21,16,12,.55)'; g.lineWidth = 2; for (const dx of [-8, 0, 8]) { g.beginPath(); g.moveTo(x + dx, y + 25); g.quadraticCurveTo(x + dx * 1.6, y + 50, x + dx, y + 75); g.stroke(); }
};
/** fill an SVG fragment of <path>/<line>/<rect>/<ellipse>/<circle> onto a canvas (subset renderer for live layers) */
export const fillSvg = (g: CanvasRenderingContext2D, svg: string) => {
	const re = /<(path|line|rect|ellipse|circle)\b([^>]*)\/?>/g; let m: RegExpExecArray | null;
	const at = (s: string, k: string) => { const r = new RegExp(`\\s${k}="([^"]+)"`).exec(s); return r ? r[1] : undefined; };
	while ((m = re.exec(svg))) {
		const [_, tag, a] = m; const fill = at(a, 'fill'), stroke = at(a, 'stroke'), sw = +(at(a, 'stroke-width') ?? 1), fo = +(at(a, 'fill-opacity') ?? 1);
		let p: Path2D;
		if (tag === 'path') p = new Path2D(at(a, 'd')!);
		else if (tag === 'line') { p = new Path2D(); p.moveTo(+at(a, 'x1')!, +at(a, 'y1')!); p.lineTo(+at(a, 'x2')!, +at(a, 'y2')!); }
		else if (tag === 'rect') { p = new Path2D(); p.rect(+at(a, 'x')!, +at(a, 'y')!, +at(a, 'width')!, +at(a, 'height')!); }
		else if (tag === 'ellipse') { p = new Path2D(); p.ellipse(+at(a, 'cx')!, +at(a, 'cy')!, +at(a, 'rx')!, +at(a, 'ry')!, 0, 0, Math.PI * 2); }
		else { p = new Path2D(); p.arc(+at(a, 'cx')!, +at(a, 'cy')!, +at(a, 'r')!, 0, Math.PI * 2); }
		if (fill && fill !== 'none' && tag !== 'line') { g.globalAlpha = fo; g.fillStyle = fill; g.fill(p); g.globalAlpha = 1; }
		if (stroke && stroke !== 'none') { g.strokeStyle = stroke; g.lineWidth = sw; g.lineCap = (at(a, 'stroke-linecap') as CanvasLineCap) ?? 'butt'; g.lineJoin = 'round'; g.stroke(p); }
		else if (tag === 'line') { g.strokeStyle = fill ?? SIL; g.lineWidth = sw; g.stroke(p); }
	}
};
