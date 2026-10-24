// ep43 timeline (test harness for now): scenes are {a, b, draw(u, t, hud)}.
import {bar, renderStage, composite, smooth, ramp, Live, mkCanvas} from './core';
import {Crest, deck} from './crest';
import {Store, XBL} from './rooms';
import {Cast, look, drawSilk, drawRoller, glowBlob, reach, toBody} from './actors';
import {POSES, FigOpts} from './figures';
import {subtitles, stamp, mark, age, tally, Line} from './hud';

export type Shot = {a: number; b: number; draw: (u: number, t: number, hud: HTMLElement) => void};
export const DURATION = 184.3;
let crestA: Crest, store: Store, xbl: XBL, castA: Cast, silkA: Live, rollA: Live, ph: HTMLCanvasElement;
export const bootTimeline = async () => {
	crestA = new Crest('crestA', {sky: 'night', era: '元', lanterns: true, boat: true, bankCrowd: true}); store = new Store(); xbl = new XBL();
	await Promise.all([crestA.ready, store.ready, xbl.ready]);
	castA = new Cast(crestA.st, 'castA', 960, 640, 1920, 1100, 20);
	silkA = new Live(crestA.st, 'silkA', 960, 640, 1920, 1100, 22, {emissive: 0.9}, 1);
	rollA = new Live(crestA.st, 'rollA', 960, 640, 1920, 1100, 23, {}, 1);
	ph = mkCanvas(1600, 600); const g = ph.getContext('2d')!; g.fillStyle = '#FFF3D8'; g.fillRect(0, 0, 1600, 600); g.strokeStyle = '#2A1F17'; g.lineWidth = 4;
	g.beginPath(); g.moveTo(200, 520); g.quadraticCurveTo(800, 140, 1400, 520); g.stroke(); for (let i = 0; i < 60; i++) { g.fillStyle = '#2A1F17'; g.fillRect(300 + i * 17, 300 + Math.sin(i) * 40 + Math.abs(i - 30) * 6, 4, 10); }
};
const sale = (t: number) => {
	const yc = 600, x0 = 735, x1 = 1185, sh = 170;
	const A: FigOpts = {x: 615, ground: deck(560) + 4, h: 560, pose: POSES.stand, look: look('yuanCraftsman')};
	const B: FigOpts = {x: 1315, ground: deck(1370) + 4, h: 575, pose: POSES.stand, look: look('yuanNoble'), flip: true};
	const grab = (o: FigOpts, xr: number) => { let p = reach(o.pose, 'R', toBody(o, [xr, yc - 38])); p = reach(p, 'L', toBody(o, [xr, yc + 40])); return {...o, pose: p}; };
	return {figs: [grab(A, x0), grab(B, x1)], x0, x1, yc, sh};
};
export const TIMELINE: Shot[] = [
	{a: 0, b: 10, draw: (u, t, hud) => {
		const c = crestA, st = c.st, S = sale(t);
		st.setCam(960, 560, 1); st.setHero((S.x0 + S.x1) / 2, S.yc, 520);
		c.setLanterns(() => 0); c.setBoat(1650, 40); c.setStreak(960, 0.9, t);
		castA.draw('sale', S.figs);
		silkA.L.mat.uniforms.uEmissive.value = 0.4;
		silkA.drawW('sale', (g) => { drawSilk(g, S.x0, S.x1, S.yc, S.sh, ph, 0.25, 0.6); glowBlob(g, [(S.x0 + S.x1) / 2, S.yc], 420, 260, 0.18); });
		rollA.drawW('sale', (g) => { drawRoller(g, S.x0, S.yc, S.sh + 26); drawRoller(g, S.x1, S.yc, S.sh + 26); });
		renderStage(st, 0); composite({mode: 0, k: 0}, {vig: 0.35});
		subtitles(hud, [[0, 99, '真的你，被偷偷卖给了一个[权贵]。']], 2); stamp(hud, {s1: '— 元 · 1351年前', s2: '裱画匠调包（杨准记）', s3: '杨准原话："以似本易去"'}, t, 0); mark(hud);
		age(hud, {era: '元', v: 200, post: '多'});
	}},
	{a: 10, b: 20, draw: (u, t, hud) => {
		const s = store.st; s.setCam(960, 560, 1.02); s.heroAt(980, 760, 0, 700);
		store.lamp.draw('on', (g) => { g.fillStyle = '#FFB868'; g.beginPath(); g.ellipse(1320, 700, 40, 26, 0, 0, Math.PI * 2); g.fill(); });
		store.dust.update(t, [0, 0, 1920, 1080], 20, 6, 0.5);
		renderStage(s, 0); composite({mode: 0, k: 0}, {vig: 0.45}); mark(hud);
	}},
	{a: 20, b: 30, draw: (u, t, hud) => {
		const s = xbl.st; s.setCam(960, 540, 1); s.setHero(-9999, -9999, 1);
		xbl.dust.update(t, [600, 200, 1400, 1000], 10, 4, 0.35);
		renderStage(s, 0); composite({mode: 0, k: 0}, {vig: 0.4}); mark(hud);
	}},
];
