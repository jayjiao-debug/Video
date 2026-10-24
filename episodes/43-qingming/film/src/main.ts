// ep43 film entry: boots the stages, exposes window.renderAt(t), READY, DURATION for the frame grabber.
import {initRenderer, initPost, Stage, bar} from './core';
import {renderFilm, addScene, SCENES} from './film';
import {checkTime} from './actors';
import {bootOpen} from './s_open';

export const DURATION = 184.3;
const hud = document.getElementById('hud')!;
(async () => {
	initRenderer(document.getElementById('c') as HTMLCanvasElement); initPost();
	await document.fonts.load('900 58px "Noto Serif CJK SC"').catch(() => null);
	await document.fonts.load('700 58px "Noto Serif CJK SC"').catch(() => null);
	await document.fonts.load('600 96px "Cormorant Garamond"').catch(() => null);
	await bootOpen();
	// placeholder for scenes not built yet
	const empty = new Stage('todo'); const last = SCENES[SCENES.length - 1];
	addScene({id: 'todo', a: last.z, z: DURATION + 1, draw: () => ({st: empty, grade: {vig: 0}})});
	(window as any).renderAt = (t: number) => { checkTime(t); renderFilm(t, hud); };
	(window as any).CHECKT = checkTime; (window as any).DURATION = DURATION; (window as any).READY = true;
})().catch((e) => { console.error('BOOT', e?.message || e, e?.stack); });
