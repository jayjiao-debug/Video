// ep43 timeline (test harness for now): scenes are {a, b, draw(u, t, hud)}.
import {bar, renderStage, composite, smooth, ramp} from './core';
import {Crest, deck} from './crest';
import {Store, XBL} from './rooms';
import {subtitles, stamp, mark, age, tally, Line} from './hud';

export type Shot = {a: number; b: number; draw: (u: number, t: number, hud: HTMLElement) => void};
export const DURATION = 184.3;
let crestA: Crest, store: Store, xbl: XBL;
export const bootTimeline = async () => {
	crestA = new Crest('crestA', {sky: 'night', era: '元', lanterns: true, boat: true, bankCrowd: true}); store = new Store(); xbl = new XBL();
	await Promise.all([crestA.ready, store.ready, xbl.ready]);
};
export const TIMELINE: Shot[] = [
	{a: 0, b: 10, draw: (u, t, hud) => {
		const c = crestA, st = c.st;
		st.setCam(960, 640, 1); st.heroAt(960, 780, 20, 600);
		c.setLanterns(() => 0); c.setBoat(1500, 40); c.setStreak(980, 0.8, t);
		renderStage(st, 0); composite({mode: 0, k: 0}, {vig: 0.3});
		mark(hud);
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
