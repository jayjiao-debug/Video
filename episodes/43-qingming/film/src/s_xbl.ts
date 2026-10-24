// Scene 26 (V1 → V3, b46 → b50): the 伪满 小白楼 (图书楼). The camera pulls back from your box's slats (the cut from scene 25's
// 清宫 room hides in that close-up): shelf → room → out through the upper window (the pane mask: a real sash frame and a glass
// sheen) → the small two-storey building in its courtyard, its tree cycling the seasons one per beat. Night falls (1945年8月);
// two cars' headlights sweep across and leave right; the doors stand open and a guard steps out with an armful; a push through
// the open doors: guards in profile carry armfuls of scrolls out (right), a few scrolls lie on the floor; the camera searches the
// shelves — where your box was is in shadow behind a passing guard; on the b49 hit the last one leaves; through the silence the
// camera drifts toward a dark heap on the floor in the moonlight from the door (dust in the beam), continuous up to b50.
// NO GLOW anywhere in this scene (C28): you are never seen, never in anyone's arms. No prying tools, no tearing; boxes stay closed.
import {Stage, Live, Layer, Motes, bar, BEAT, W, H, D, clamp01, smooth, easeInOut, easeOut, easeIn, lerp, mkCanvas, canvasTex, gradCanvas, hash} from './core';
import {addScene, In, Frame} from './film';
import {Cast, look, glowBlob, rig, drawFig} from './actors';
import {LOOKS, FigOpts, P, walkFor, gaitStride, stepFor, toScreen, figurePaths, carryArmful, armfulAt} from './figures';
import {SIL} from './draw';
import {Cam, k30, fillD, proj, camLock, camMix, setCam, SLAT, slatFace} from './s_qing';

const b = bar;
// ================================================================================================ timing
const T0 = b(46), P0 = b(46.17), P1 = b(46.8), NIGHT0 = b(47.25), NIGHT1 = b(47.5), DOOR_CUT = b(48.3), END = b(50);
const SEASON = (t: number) => (t < b(46.75) ? 0 : t < b(47) ? 1 : t < b(47.25) ? 2 : t < NIGHT1 ? 3 : 1);   // spring, summer, autumn, winter; 1945年8月 = summer
const nightK = (t: number) => smooth(clamp01((t - NIGHT0) / (NIGHT1 - NIGHT0)));

// ================================================================================================ the interior (rest px at z −60)
const ZW = -60, ZBOX = -54, ZFLOOR = -46, ZFIG = -30;
const BOXF = {x0: 860, y0: 512, w: SLAT.w, h: SLAT.h};                 // your box on the middle shelf of the middle bay
const SHELF_Y = [250, 420, 590, 760], BAYS: [number, number][] = [[120, 640], [700, 1220], [1280, 1800]], FLOORY = 860;
let inSt: Stage, inWall: Layer, inNight: Layer, inDay: Layer, yourBox: Live, inLight: Live, inMoon: Live, inScrolls: Layer, guards: Cast, guardProp: Live, guardArms: Live, dust: Motes;
/** shelf contents: closed slatted boxes and loose rolled scrolls (ends); `taken` empties some cells (1945) */
const shelfCanvas = (taken: boolean) => {
	const c = mkCanvas(W, H), g = c.getContext('2d')!;
	BAYS.forEach(([x0, x1], bi) => { for (let r = 0; r < 3; r++) { const yb = SHELF_Y[r + 1] - 8; let x = x0 + 14; let k = 0;
		while (x < x1 - 70) { const seed = bi * 31 + r * 7 + k++, kind = hash(seed * 1.7), w = 120 + hash(seed * 2.3) * 70, h = 62 + hash(seed * 3.1) * 22;
			const isYours = bi === 1 && r === 1 && x <= BOXF.x0 && x + w + 24 >= BOXF.x0;
			if (isYours) { x = BOXF.x0 + BOXF.w + 12; continue; }                                     // your box: its own layer
			const gone = taken && hash(seed * 5.9) < 0.55;
			if (!gone) { if (kind < 0.7) slatFace(g, x, yb - h, Math.min(w, x1 - 14 - x), h, 0, '#3b3026', '#1a140f');
				else { for (let i = 0; i < 9; i++) { const rr = 9 + hash(seed + i) * 4, cx = x + 14 + (i % 5) * 22, cy = yb - rr - Math.floor(i / 5) * 19; g.fillStyle = '#2a231c'; g.beginPath(); g.arc(cx, cy, rr, 0, Math.PI * 2); g.fill(); g.strokeStyle = '#4a4036'; g.lineWidth = 2; g.beginPath(); g.arc(cx, cy, rr * 0.45, 0, Math.PI * 2); g.stroke(); } } }
			else { g.fillStyle = 'rgba(20,18,16,0.35)'; g.fillRect(x, yb - h, Math.min(w, x1 - 14 - x), h); }       // a pale dust ghost where a box stood
			x += w + 12; } } });
	return c;
};
const wallCanvas = () => {
	const c = mkCanvas(W, H), g = c.getContext('2d')!;
	const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#30363b'); gr.addColorStop(0.5, '#3A4046'); gr.addColorStop(1, '#353a3f'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
	g.fillStyle = '#1c1f22'; g.fillRect(0, 0, W, 70); g.fillStyle = '#25292d'; g.fillRect(0, 70, W, 12);                               // ceiling beam
	for (const [x0, x1] of BAYS) { g.fillStyle = 'rgba(24,20,16,0.55)'; g.fillRect(x0, SHELF_Y[0] - 10, x1 - x0, SHELF_Y[3] - SHELF_Y[0] + 20);
		g.fillStyle = '#231c15'; for (const y of SHELF_Y) g.fillRect(x0 - 8, y - 8, x1 - x0 + 16, 14); g.fillRect(x0 - 10, SHELF_Y[0] - 14, 16, FLOORY - SHELF_Y[0] + 14); g.fillRect(x1 - 6, SHELF_Y[0] - 14, 16, FLOORY - SHELF_Y[0] + 14); }
	g.fillStyle = '#24282c'; g.fillRect(0, FLOORY - 14, W, 14);                                                                                // skirting
	return c;
};
/** a few scrolls dropped on the floor and the dark heap (rolls and a toppled closed box) the camera drifts toward */
const floorScrollsCanvas = () => {
	const c = mkCanvas(2400, 600), g = c.getContext('2d')!, o = (x: number, y: number) => [x + 240, y - 760] as P;
	const roll = (x: number, y: number, L: number, r: number, a: number) => { const [X, Y] = o(x, y); g.save(); g.translate(X, Y); g.rotate(a); g.fillStyle = '#2b241d'; g.beginPath(); g.roundRect(-L / 2, -r, L, 2 * r, r * 0.6); g.fill(); g.fillStyle = '#3e352b'; g.beginPath(); g.ellipse(L / 2, 0, r * 0.4, r, 0, 0, Math.PI * 2); g.fill(); g.restore(); };
	roll(1380, 940, 170, 11, 0.08); roll(1560, 975, 150, 10, -0.25); roll(880, 1000, 190, 12, 0.15);
	// the heap (left of centre on the floor): a toppled closed box and a tangle of rolls, in the cool spill's edge
	const [hx, hy] = o(520, 960); g.save(); g.translate(hx, hy); g.rotate(-0.1); slatFace(g, -110, -64, 190, 64, 0, '#2e261e', '#151110'); g.restore();
	for (let i = 0; i < 14; i++) roll(420 + hash(i * 3.3) * 260, 900 + hash(i * 7.7) * 90 - (i % 4) * 14, 120 + hash(i) * 120, 10 + hash(i * 2) * 4, (hash(i * 5.1) - 0.5) * 0.8);
	return c;
};
const guardLook = LOOKS.guard1945;
const GH = 480, GSTR = gaitStride('08_04', stepFor(guardLook)) * GH, GV = 1.42 * GSTR / (2 * BEAT);   // hurried: 1.42× the natural pace (phase follows x)
const GX0 = [1500, 950, 330], GPH = [0, 0.28, 0.56], GFLOOR = 900;
const gx = (i: number, t: number) => GX0[i] + (t - DOOR_CUT) * GV;
/** an armful of rolled scrolls hugged by a guard (ends toward us, a few long ones) — no glow, these are not you */
const armful = (g: CanvasRenderingContext2D, c: P, r: number, seed: number) => {
	for (let i = 0; i < 3; i++) { const a = (hash(seed + i) - 0.5) * 0.5, L = r * (3.2 + hash(seed * 2 + i)); g.save(); g.translate(c[0], c[1] - r * 0.2 + i * r * 0.35); g.rotate(a); g.fillStyle = '#3a3027'; g.beginPath(); g.roundRect(-L / 2, -r * 0.2, L, r * 0.4, r * 0.15); g.fill(); g.restore(); }
	for (let i = 0; i < 7; i++) { const ang = (i / 7) * Math.PI * 2, cx = c[0] + Math.cos(ang) * r * 0.55, cy = c[1] + Math.sin(ang) * r * 0.5, rr = r * (0.3 + 0.08 * hash(seed + i * 3)); g.fillStyle = '#2c251e'; g.beginPath(); g.arc(cx, cy, rr, 0, Math.PI * 2); g.fill(); g.strokeStyle = '#51463a'; g.lineWidth = 2; g.beginPath(); g.arc(cx, cy, rr * 0.45, 0, Math.PI * 2); g.stroke(); }
};
const guardFig = (i: number, t: number, x: number, h = GH, ground = GFLOOR, who = `1945 guard ${i}`) => {
	const base = carryArmful(walkFor(guardLook, (x - GX0[i]) / GSTR + GPH[i])), a = armfulAt(base), o: FigOpts = {x, ground, h, pose: base, look: guardLook};
	const R = toScreen(o, [a.c[0] + 0.03, a.c[1] - a.r - 0.014]), L = toScreen(o, [a.c[0] + a.r + 0.008, a.c[1] + 0.012]);
	const f = rig(o, [{side: 'R', target: R, name: 'R under armful', opt: {dir: 12}}, {side: 'L', target: L, name: 'L round armful', opt: {dir: -78}}], () => ground, who);
	return {f, c: toScreen(f, a.c), r: a.r * h};
};
const bootIn = async () => {
	inSt = new Stage('xbl-in');
	inSt.add('back', canvasTex(gradCanvas([[0, '#2a2f33'], [1, '#30353a']])), 960, 540, 6000, 3600, -400);
	inWall = inSt.add('wall', canvasTex(wallCanvas()), 960, 540, W, H, ZW, {rim: 0.3});
	inDay = inSt.add('shelvesDay', canvasTex(shelfCanvas(false)), 960, 540, W, H, ZW + 1, {rim: 0.3});
	inNight = inSt.add('shelvesNight', canvasTex(shelfCanvas(true)), 960, 540, W, H, ZW + 1, {rim: 0.3});
	inSt.add('floor', canvasTex(gradCanvas([[0, '#2f3336'], [0.4, '#2a2d30'], [1, '#232628']])), 960, FLOORY + 600, 5200, 1200, ZFLOOR);
	yourBox = new Live(inSt, 'yourBox', BOXF.x0 + BOXF.w / 2, BOXF.y0 + BOXF.h / 2, 240, 110, ZBOX, {rim: 0.2}, 7);
	yourBox.draw('box', (g) => slatFace(g, 20, 16, BOXF.w, BOXF.h, 0));
	inLight = new Live(inSt, 'inLight', 960, 700, 3000, 1400, ZFLOOR + 2, {}, 0.4);     // daylight from the windows behind the camera
	inLight.drawW('d', (g) => { for (const [x, w] of [[420, 360], [1420, 360]] as [number, number][]) { const gr = g.createLinearGradient(0, 860, 0, 1200); gr.addColorStop(0, 'rgba(220,214,196,0.16)'); gr.addColorStop(1, 'rgba(220,214,196,0.04)'); g.fillStyle = gr; g.beginPath(); g.moveTo(x, 860); g.lineTo(x + w, 860); g.lineTo(x + w * 1.6, 1300); g.lineTo(x - w * 0.6, 1300); g.closePath(); g.fill();
		const gw = g.createRadialGradient(x + w / 2, 520, 0, x + w / 2, 520, 420); gw.addColorStop(0, 'rgba(210,206,190,0.12)'); gw.addColorStop(1, 'rgba(210,206,190,0)'); g.fillStyle = gw; g.fillRect(x - 300, 100, w + 600, 800); } });
	inMoon = new Live(inSt, 'inMoon', 960, 900, 3200, 900, ZFLOOR + 3, {}, 0.4);       // the moonlight from the open door behind the camera
	inMoon.drawW('m', (g) => { const gr = g.createLinearGradient(0, 860, 0, 1350); gr.addColorStop(0, 'rgba(160,182,196,0.30)'); gr.addColorStop(1, 'rgba(160,182,196,0.62)'); g.fillStyle = gr;
		g.beginPath(); g.moveTo(560, 860); g.lineTo(1260, 860); g.lineTo(1700, 1350); g.lineTo(200, 1350); g.closePath(); g.fill();
		g.fillStyle = 'rgba(20,24,28,0.5)'; g.beginPath(); g.moveTo(905, 860); g.lineTo(925, 860); g.lineTo(975, 1350); g.lineTo(935, 1350); g.closePath(); g.fill();      // the door leaves' meeting-stile shadow
		const gw = g.createRadialGradient(910, 900, 0, 910, 900, 520); gw.addColorStop(0, 'rgba(150,172,186,0.16)'); gw.addColorStop(1, 'rgba(150,172,186,0)'); g.fillStyle = gw; g.fillRect(300, 380, 1220, 520); });
	inScrolls = inSt.add('floorScrolls', canvasTex(floorScrollsCanvas()), 960, 1060, 2400, 600, -24, {rim: 0.5});
	guards = new Cast(inSt, 'guards', 1200, 640, 3400, 1100, ZFIG, {rim: 0.7});
	guardProp = new Live(inSt, 'guardProp', 1200, 640, 3400, 1100, ZFIG + 1, {rim: 0.5}, 1);
	guardArms = new Live(inSt, 'guardArms', 1200, 640, 3400, 1100, ZFIG + 2, {rim: 0.7, rimPx: 4}, 1);
	dust = new Motes(inSt, 160, 'dust', ZFIG + 20, 6, '#B4C4CE', false);
};

// ================================================================================================ the exterior (rest px at z 0)
const WIN = {x: 1340, y: 535, w: 76, h: 110};                                // the upper window we pull out of
const DOOR = {x: 1160, w: 104, y0: 690, y1: 880};
let exSt: Stage, exSky: Live, exStatic: Layer[] = [], exDoors: Live, exTree: Live, exSnow: Live, exCars: Live, exBeams: Live, exLamps: Live, exGuard: Cast, exGuardProp: Live, exGuardArms: Live;
let treeCvs: HTMLCanvasElement[] = [], doorArt: HTMLCanvasElement;
const SKY = [[[0, '#526E78'], [0.55, '#8EA3A3'], [1, '#CFC8AA']], [[0, '#4E6B78'], [0.55, '#8FA7A6'], [1, '#D9CFAE']], [[0, '#56676E'], [0.55, '#97998C'], [1, '#D8B98E']], [[0, '#5E6E78'], [0.55, '#9AA6AA'], [1, '#C9CDCB']]] as [number, string][][];
const NSKY: [number, string][] = [[0, '#1F2E38'], [0.55, '#2E404B'], [1, '#45565D']];
const facadeCanvas = () => {
	const c = mkCanvas(W, H), g = c.getContext('2d')!;
	// the building: two storeys, a plain western-style block with a low parapet, white render (in shade), dark sashes
	g.fillStyle = '#CCC8BE'; g.fillRect(760, 410, 800, 470);
	g.fillStyle = '#B7B3A9'; g.fillRect(760, 640, 800, 10); g.fillRect(750, 396, 820, 18); g.fillRect(744, 380, 832, 16);     // string course, cornice
	g.fillStyle = '#A9A59B'; g.fillRect(760, 864, 800, 16);                                                                   // plinth
	const win = (x: number, y: number, w: number, h: number) => { g.fillStyle = '#3d3c38'; g.fillRect(x - w / 2 - 7, y - h / 2 - 7, w + 14, h + 14); g.fillStyle = '#A9A59B'; g.fillRect(x - w / 2 - 12, y + h / 2 + 7, w + 24, 8);
		const gr = g.createLinearGradient(x - w / 2, y - h / 2, x + w / 2, y + h / 2); gr.addColorStop(0, '#4c5a62'); gr.addColorStop(0.5, '#2b3238'); gr.addColorStop(1, '#232a2f'); g.fillStyle = gr; g.fillRect(x - w / 2, y - h / 2, w, h);
		g.fillStyle = 'rgba(52,44,36,0.8)'; g.fillRect(x - w * 0.36, y + h * 0.18, w * 0.72, h * 0.06); g.fillRect(x - w * 0.36, y - h * 0.12, w * 0.72, h * 0.05);   // the shelves inside, faint
		g.fillStyle = 'rgba(220,226,228,0.10)'; g.beginPath(); g.moveTo(x - w / 2, y - h / 2); g.lineTo(x - w / 2 + w * 0.5, y - h / 2); g.lineTo(x - w / 2, y + h * 0.2); g.fill(); };
	for (const x of [840, 980, 1160, 1340, 1480]) win(x, WIN.y, WIN.w, WIN.h);
	for (const x of [840, 980, 1340, 1480]) win(x, 755, WIN.w, WIN.h);
	g.fillStyle = '#3a3a37'; g.fillRect(DOOR.x - DOOR.w / 2 - 10, DOOR.y0 - 12, DOOR.w + 20, DOOR.y1 - DOOR.y0 + 12);     // door casing
	g.fillStyle = '#B7B3A9'; g.fillRect(DOOR.x - 80, DOOR.y1 - 6, 160, 12);                                               // step
	return c;
};
const farCanvas = () => {
	const c = mkCanvas(2800, 900), g = c.getContext('2d')!, X = (x: number) => x + 440;
	g.fillStyle = '#6c706c'; g.fillRect(0, 640, 2800, 260);                                                                  // the courtyard's far wall
	g.fillStyle = '#5c605d'; g.fillRect(0, 630, 2800, 14);
	for (let i = 0; i < 26; i++) { const x = X(-400 + i * 120 + hash(i) * 70), r = 34 + hash(i * 3) * 40; g.fillStyle = i % 2 ? '#454d49' : '#4c5450'; g.beginPath(); g.arc(x, 636 - r * 0.6, r, 0, Math.PI * 2); g.fill(); g.beginPath(); g.arc(x + r * 0.6, 636 - r * 0.3, r * 0.7, 0, Math.PI * 2); g.fill(); }   // trees beyond the wall
	g.fillStyle = '#585c5a'; g.beginPath(); g.moveTo(X(1650), 640); g.lineTo(X(1690), 520); g.lineTo(X(2150), 520); g.lineTo(X(2190), 640); g.fill(); g.fillRect(X(1700), 560, 440, 80);                // a roof beyond the wall
	return c;
};
/** the courtyard tree: branches once, foliage per season (real colour), snow in winter */
const treeCanvas = (season: number) => {
	const c = mkCanvas(900, 760), g = c.getContext('2d')!;
	const br = (x: number, y: number, a: number, l: number, w: number, d: number, seed: number, tips: P[]) => {
		const x2 = x + Math.sin(a) * l, y2 = y - Math.cos(a) * l; g.strokeStyle = '#2a241e'; g.lineWidth = w; g.lineCap = 'round'; g.beginPath(); g.moveTo(x, y); g.lineTo(x2, y2); g.stroke();
		if (d === 0) { tips.push([x2, y2]); return; }
		const n = d > 2 ? 2 : 3; for (let i = 0; i < n; i++) br(x2, y2, a + (i - (n - 1) / 2) * 0.55 + (hash(seed + i) - 0.5) * 0.4, l * (0.68 + hash(seed * 3 + i) * 0.1), w * 0.66, d - 1, seed * 7 + i, tips);
	};
	const tips: P[] = []; br(430, 760, 0.02, 165, 30, 4, 11, tips);
	const col = [['#8DB35A', '#A8C86E', '#6E9446'], ['#3F6B34', '#4F7D3E', '#2F5428'], ['#C0873A', '#D4A24A', '#9A5E2C'], ['#E2E8EA', '#F2F4F4', '#C8D0D4']][season];
	const leafy = season !== 3, n = season === 0 ? 0.55 : 1;
	for (let i = 0; i < tips.length; i++) { const [x, y] = tips[i]; for (let k = 0; k < (leafy ? 7 : 2); k++) { const r = (leafy ? 34 + hash(i * 3 + k) * 28 : 9 + hash(i + k) * 6) * n, dx = (hash(i * 7 + k) - 0.5) * 80, dy = (hash(i * 5 + k) - 0.5) * 60;
		g.fillStyle = col[(i + k) % 3]; g.globalAlpha = leafy ? 0.9 : 0.85; g.beginPath(); g.arc(x + dx, y + dy + (leafy ? 0 : -4), r, 0, Math.PI * 2); g.fill(); } }
	g.globalAlpha = 1; return c;
};
const bootEx = async () => {
	exSt = new Stage('xbl-ex');
	exSky = new Live(exSt, 'exSky', 960, 300, 7000, 2600, -3000, {}, 0.05);
	exStatic.push(exSt.add('far', canvasTex(farCanvas()), 960, 540 - 90, 2800, 900, -700, {fog: ['#9aa2a0', 0.2]}));
	exStatic.push(exSt.add('ground', canvasTex(gradCanvas([[0, '#8e8b84'], [1, '#6e6b65']])), 960, 1180, 5000, 620, 0, {}, -6));
	exStatic.push(exSt.add('facade', canvasTex(facadeCanvas()), 960, 540, W, H, 0, {rim: 0.2}, 1));
	treeCvs = [0, 1, 2, 3].map(treeCanvas);
	exTree = new Live(exSt, 'exTree', 520, 524, 900, 760, 0, {rim: 0.3}, 1, 4);
	exSnow = new Live(exSt, 'exSnow', 960, 700, 3000, 800, 0, {}, 0.5, 5);
	exSnow.drawW('s', (g) => { g.fillStyle = '#E6EBEE'; g.fillRect(744, 372, 832, 10); g.fillRect(-600, 878, 3200, 12); for (let i = 0; i < 40; i++) { g.globalAlpha = 0.5; g.fillRect(-500 + i * 80 + hash(i) * 40, 892 + hash(i * 3) * 160, 60 + hash(i * 5) * 60, 6); } g.globalAlpha = 1; });
	exStatic.push(exSt.add('nearWall', canvasTex((() => { const c = mkCanvas(W, 160), g = c.getContext('2d')!; g.fillStyle = '#2c2a27'; g.fillRect(0, 40, W, 120); g.fillStyle = '#3a3733'; g.fillRect(0, 28, W, 16); return c; })()), 960, 1030, 2600, 216, 0, {}, 6));
	exDoors = new Live(exSt, 'exDoors', DOOR.x, (DOOR.y0 + DOOR.y1) / 2, 160, 220, 0, {rim: 0.2}, 2, 2);
	exGuard = new Cast(exSt, 'exGuard', 1300, 700, 900, 500, 0, {rim: 0.4}); exGuard.L.L.mesh.renderOrder = 6;
	exGuardProp = new Live(exSt, 'exGuardProp', 1300, 700, 900, 500, 0, {}, 1, 6.2); exGuardArms = new Live(exSt, 'exGuardArms', 1300, 700, 900, 500, 0, {}, 1, 6.4);
	exBeams = new Live(exSt, 'exBeams', 960, 700, 3200, 1000, 0, {}, 0.4, 7);
	exCars = new Live(exSt, 'exCars', 960, 960, 3200, 300, 0, {rim: 0.3}, 0.8, 8);
	exLamps = new Live(exSt, 'exLamps', 960, 960, 3200, 300, 0, {emissive: 1.2}, 0.5, 9);
	// the doorway's view in (the night interior, painted small from the same art) for the push through the doors
	doorArt = mkCanvas(208, 380); const dg = doorArt.getContext('2d')!; dg.drawImage(wallCanvas(), 560, 120, 800, 1460 * 0.55, 0, 0, 208, 380 * 0.62); dg.drawImage(shelfCanvas(true), 560, 120, 800, 1460 * 0.55, 0, 0, 208, 380 * 0.62);
	dg.fillStyle = '#2a2d30'; dg.fillRect(0, 380 * 0.62, 208, 380 * 0.38); dg.fillStyle = 'rgba(160,182,196,0.35)'; dg.beginPath(); dg.moveTo(60, 236); dg.lineTo(150, 236); dg.lineTo(208, 380); dg.lineTo(0, 380); dg.fill();
	dg.fillStyle = 'rgba(20,22,26,0.35)'; dg.fillRect(0, 0, 208, 380);
};
const lightEx = (t: number) => {
	const s = SEASON(t), n = nightK(t);
	exSky.draw(`${s}:${n.toFixed(2)}`, (g) => { const sky = SKY[s], gr = g.createLinearGradient(0, 1000, 0, 1900); for (let i = 0; i < sky.length; i++) { const [o, c0] = sky[i], c1 = NSKY[i][1], m = (a: string, z: string) => { const A = parseInt(a.slice(1), 16), Z = parseInt(z.slice(1), 16); return [16, 8, 0].map((sh) => Math.round(((A >> sh) & 255) * (1 - n) + ((Z >> sh) & 255) * n)); };
		const [r, gg, bb] = m(c0, c1); gr.addColorStop(o, `rgb(${r},${gg},${bb})`); } g.fillStyle = gr; g.fillRect(0, 0, 7000, 2600); });
	const day = [[1.0, 1.0, 0.98], [1.04, 1.03, 1.0], [1.02, 0.97, 0.9], [0.96, 0.99, 1.04]][s], nt = [0.36, 0.41, 0.48];
	for (const L of [...exStatic]) L.mat.uniforms.uTint.value.setRGB(lerp(day[0], nt[0], n), lerp(day[1], nt[1], n), lerp(day[2], nt[2], n));
	for (const L of [exTree.L, exDoors.L, exSnow.L]) L.mat.uniforms.uTint.value.setRGB(lerp(1, nt[0], n), lerp(1, nt[1], n), lerp(1, nt[2], n));
	exTree.draw(`${s}`, (g) => g.drawImage(treeCvs[s], 0, 0));
	exSnow.L.mesh.visible = s === 3 && n < 1;
	exDoors.drawW(`${t >= NIGHT1 ? 1 : 0}`, (g) => { const {x, w, y0, y1} = DOOR; if (t >= NIGHT1) { g.drawImage(doorArt, x - w / 2, y0, w, y1 - y0);
			g.fillStyle = '#2b2925'; g.fillRect(x - w / 2, y0, 14, y1 - y0); g.fillRect(x + w / 2 - 14, y0, 14, y1 - y0); }                        // the leaves stand open (edge-on against the jambs)
		else { g.fillStyle = '#4a3c2e'; g.fillRect(x - w / 2, y0, w, y1 - y0); g.fillStyle = '#3a2e23'; g.fillRect(x - 1, y0, 2, y1 - y0); for (const dx of [-w / 4, w / 4]) { g.fillStyle = '#56473a'; g.fillRect(x + dx - 16, y0 + 18, 32, 60); g.fillRect(x + dx - 16, y0 + 100, 32, 60); } } });
};
// two cars cross left → right in front of the courtyard (b47.5 → b48): headlamps (practicals) and their beams sweep across
const carX = (i: number, t: number) => -420 + (t - (NIGHT1 + i * 0.22)) * 2500;
const drawCar = (g: CanvasRenderingContext2D, x: number, y: number) => {
	g.fillStyle = '#121212'; g.beginPath(); g.moveTo(x - 150, y); g.lineTo(x - 150, y - 40); g.quadraticCurveTo(x - 120, y - 52, x - 60, y - 54); g.lineTo(x - 35, y - 95); g.lineTo(x + 50, y - 95); g.lineTo(x + 78, y - 56); g.quadraticCurveTo(x + 140, y - 52, x + 152, y - 30); g.lineTo(x + 152, y); g.closePath(); g.fill();
	for (const wx of [x - 95, x + 95]) { g.beginPath(); g.arc(wx, y, 24, 0, Math.PI * 2); g.fill(); }
	g.fillStyle = '#2a2f33'; g.fillRect(x - 28, y - 88, 34, 30); g.fillRect(x + 12, y - 88, 30, 30);
};
const drawCars = (t: number) => {
	const on = t >= NIGHT1 - 0.05 && t < b(48.2), key = on ? k30(t) : 'off';
	exCars.drawW(key, (g) => { if (!on) return; for (let i = 0; i < 2; i++) { const x = carX(i, t); for (let k = 3; k >= 0; k--) { g.globalAlpha = k ? 0.12 : 1; drawCar(g, x - k * 26, 978); } g.globalAlpha = 1; } });
	exLamps.drawW(key, (g) => { if (!on) return; for (let i = 0; i < 2; i++) { const x = carX(i, t) + 146; g.fillStyle = '#FFE0B0'; g.beginPath(); g.ellipse(x, 948, 7, 9, 0, 0, Math.PI * 2); g.fill(); glowBlob(g, [x + 6, 948], 40, 26, 0.6, '255,184,104'); } });
	exBeams.drawW(key, (g) => { if (!on) return; for (let i = 0; i < 2; i++) { const x = carX(i, t) + 150;
		const gr = g.createLinearGradient(x, 0, x + 900, 0); gr.addColorStop(0, 'rgba(255,196,128,0.42)'); gr.addColorStop(1, 'rgba(255,196,128,0)'); g.fillStyle = gr; g.beginPath(); g.moveTo(x, 940); g.lineTo(x + 900, 860); g.lineTo(x + 900, 1040); g.lineTo(x, 958); g.fill();
		const wx = x + 380, gw = g.createRadialGradient(wx, 760, 0, wx, 760, 260); gw.addColorStop(0, 'rgba(255,200,140,0.22)'); gw.addColorStop(1, 'rgba(255,200,140,0)'); g.fillStyle = gw; g.fillRect(wx - 300, 480, 600, 420); } });
};
/** b47.8 → b48.4: a guard steps out of the open doorway with an armful and walks right along the facade */
const exGuardDraw = (t: number) => {
	const on = t >= b(47.8); exGuard.L.L.mesh.visible = exGuardProp.L.mesh.visible = exGuardArms.L.mesh.visible = on; if (!on) return;
	const h = 176, str = gaitStride('08_04', 1) * h, x = DOOR.x - 10 + (t - b(47.8)) * 1.3 * str / (2 * BEAT);
	const base = carryArmful(walkFor(guardLook, (x - DOOR.x) / str + 0.1)), a = armfulAt(base), o: FigOpts = {x, ground: 880, h, pose: base, look: guardLook};
	const R = toScreen(o, [a.c[0] + 0.03, a.c[1] - a.r - 0.014]), L = toScreen(o, [a.c[0] + a.r + 0.008, a.c[1] + 0.012]);
	const f = rig(o, [{side: 'R', target: R, name: 'R under armful', opt: {dir: 12}}, {side: 'L', target: L, name: 'L round armful', opt: {dir: -78}}], () => 880, '1945 guard at the door');
	const key = k30(t); exGuard.draw(key, [f]); exGuardProp.drawW(key, (g) => armful(g, toScreen(f, a.c), a.r * h, 5)); exGuardArms.drawW(key, (g) => fillD(g, [...figurePaths({...f, part: 'R'}), ...figurePaths({...f, part: 'L'})]));
};

// ================================================================================================ cameras
// one pull-back: interior zoom Zi(t) from the slat close-up to the window shrinking to its real size on the facade
const zoomFor = (sw: number, ww: number, z: number) => D / (z + (ww * (D - z)) / sw);
const ZS = zoomFor(2052, SLAT.w, ZBOX);                                   // scene 25's last framing of the slats (2052 px wide)
const K0 = 1.25, WEND = WIN.w;                                             // the room at zoom 1 fills the window ×1.25; the window ends at its real size
const ZI_END = WEND / (W * K0), LTOT = Math.log(ZS / ZI_END);
const pullU = (t: number) => { const u = clamp01((t - T0) / (P1 - T0)); return 1 - Math.pow(1 - u, 2.1); };
const Zi = (t: number) => ZS * Math.exp(-LTOT * pullU(t));
const winW = (t: number) => W * K0 * Zi(t);
const winC = (t: number): P => { const k = smooth(clamp01((t - P0) / (P1 - P0))); return [lerp(960, WIN.x, k), lerp(540, WIN.y, k)]; };
const camIn = (t: number): Cam => {
	if (t < DOOR_CUT) { const k = smooth(clamp01(pullU(t) / 0.55)), F: P = [lerp(BOXF.x0 + BOXF.w / 2, 960, k), lerp(BOXF.y0 + BOXF.h / 2, 520, k)], S = winC(t);
		return camLock(Zi(t), F[0], F[1], ZBOX, S[0], S[1] + (1 - k) * 20); }
	// 1945: inside at the doors' framing → the search pan to your empty slot (b48.5 → b48.8) → on along the shelves → the drift to the heap
	const K: [number, number, number, number][] = [[DOOR_CUT, 1160, 560, 1.12], [b(48.5), 1110, 556, 1.18], [b(48.72), 960, 548, 1.42], [b(49), 650, 590, 1.46], [END, 560, 740, 1.78]];
	let i = 0; while (i < K.length - 2 && t > K[i + 1][0]) i++;
	const [t0, x0, y0, z0] = K[i], [t1, x1, y1, z1] = K[i + 1], u = clamp01((t - t0) / (t1 - t0)), e = i === K.length - 2 ? u : easeInOut(u);
	return camLock(Math.exp(lerp(Math.log(z0), Math.log(z1), e)), lerp(x0, x1, e), lerp(y0, y1, e), ZBOX, 960, 540);
};
const camEx = (t: number): Cam => {
	if (t < P1) { const S = winC(t), Ze = winW(t) / WIN.w; return camLock(Ze, WIN.x, WIN.y, 0, S[0], S[1]); }
	const drift = clamp01((t - P1) / (b(48) - P1)), rest: Cam = [960 + 14 * drift, 540, 1 + 0.035 * drift];
	if (t < b(48)) return rest;
	const k = easeIn(clamp01((t - b(48)) / (DOOR_CUT - b(48))));
	return camMix(rest, camLock(6.2, DOOR.x, (DOOR.y0 + DOOR.y1) / 2 + 6, 0, 960, 560), k);
};

// ================================================================================================ draws
const drawInterior = (t: number): Frame => {
	const st = inSt, cam = camIn(t); setCam(st, cam);
	const night = t >= DOOR_CUT;
	inDay.mesh.visible = !night; inNight.mesh.visible = night; yourBox.L.mesh.visible = !night; inLight.L.mesh.visible = !night; inMoon.L.mesh.visible = night; inScrolls.mesh.visible = night;
	guards.L.L.mesh.visible = guardProp.L.mesh.visible = guardArms.L.mesh.visible = night;
	const tint = night ? [0.78, 0.82, 0.88] : [1.05, 1.03, 1.0];
	for (const L of [inWall, inDay, inNight, st.get('floor'), st.get('back'), inScrolls]) L.mat.uniforms.uTint.value.setRGB(tint[0], tint[1], tint[2]);
	if (night) {
		const figs: ReturnType<typeof guardFig>[] = []; for (let i = 0; i < 3; i++) { const x = gx(i, t); if (x < 3000) figs.push(guardFig(i, t, x)); }
		const key = k30(t); guards.draw(key, figs.map((q) => q.f)); guardProp.drawW(key, (g) => figs.forEach((q, i) => armful(g, q.c, q.r, i * 13 + 3))); guardArms.drawW(key, (g) => { for (const q of figs) fillD(g, [...figurePaths({...q.f, part: 'R'}), ...figurePaths({...q.f, part: 'L'})]); });
		dust.update(t, [300, 300, 1500, 1100], 8, 6, 0.42);
		st.setHero(960, 1300, 900);                                     // no glow: the rims are the moonlight from the door (behind, low)
	} else { dust.update(t, [0, 0, 1, 1], 0, 0, 0); st.setHero(-9999, 0, 1); }
	return {st, grade: {vig: 0.4, vigCol: '#0e1012', exposure: night ? 1.0 : 1.0}, bloom: 0.6};
};
const drawExterior = (t: number): Frame => {
	const st = exSt, cam = camEx(t); setCam(st, cam);
	lightEx(t); drawCars(t); exGuardDraw(t);
	st.setHero(-9999, 0, 1);
	return {st, grade: {vig: 0.36, vigCol: '#101214', exposure: 1}, bloom: 0.8};
};
// the pane (scene 26's own IN between its two halves): outside the rect = the exterior (A), inside = the room (B) — so during the
// move 26a draws the exterior and 26b draws the room; the rect is the window glass, the sash and casing are the facade's own
const PANE: In = {mode: 9, a: P0, z: P1, pt: [0.5, 0.5], dir: [1, 1], ease: (u) => { const w = winW(lerp(P0, P1, u)); return clamp01((w - 110) / 160); }};
const updatePane = (t: number) => { const S = winC(t), w = winW(t), h = w * (WIN.h / WIN.w); PANE.pt = [S[0] / W, 1 - S[1] / H]; PANE.dir = [w / 2 / W, h / 2 / H]; };
/** a thin highlight line crossing the glass as we pull back through it (HUD, under the subtitles) */
const paneGlint = (hud: HTMLElement, t: number) => {
	const S = winC(t), w = winW(t), h = w * (WIN.h / WIN.w), u = clamp01((t - P0) / (P1 - P0)), a = 0.45 * (1 - smooth((u - 0.7) / 0.3)), pos = lerp(105, 20, u);
	hud.insertAdjacentHTML('afterbegin', `<div style="position:absolute;left:${(S[0] - w / 2).toFixed(1)}px;top:${(S[1] - h / 2).toFixed(1)}px;width:${w.toFixed(1)}px;height:${h.toFixed(1)}px;overflow:hidden;pointer-events:none;` +
		`background:linear-gradient(115deg, rgba(235,240,244,0) ${pos - 7}%, rgba(235,240,244,${(a * 0.2).toFixed(3)}) ${pos - 2}%, rgba(240,244,248,${a.toFixed(3)}) ${pos}%, rgba(235,240,244,${(a * 0.2).toFixed(3)}) ${pos + 0.8}%, rgba(235,240,244,0) ${pos + 6}%)"></div>`);
};
addScene({id: '26', a: T0, z: P0, draw: (t) => { if (t >= P0) { updatePane(t); return drawExterior(t); } return drawInterior(t); }});
addScene({id: '26b', a: P0, z: DOOR_CUT, in: PANE, draw: (t) => { if (t < P1) { updatePane(t); return {...drawInterior(t), hud: (hud: HTMLElement) => paneGlint(hud, t)}; } return drawExterior(t); }});
addScene({id: '26c', a: DOOR_CUT, z: END, draw: drawInterior});

export const bootXbl = async () => { await bootIn(); await bootEx(); };
