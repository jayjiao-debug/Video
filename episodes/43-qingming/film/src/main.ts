// ep43 film entry: boots the stages, exposes window.renderAt(t), READY, DURATION for the frame grabber.
import {initRenderer, initPost, renderStage, composite, W, H} from './core';
import {TIMELINE, bootTimeline, DURATION} from './timeline';
import {checkTime} from './actors';

const hud = document.getElementById('hud')!;
(async () => {
	initRenderer(document.getElementById('c') as HTMLCanvasElement); initPost();
	await document.fonts.load('900 58px "Noto Serif CJK SC"').catch(() => null);
	await document.fonts.load('600 96px "Cormorant Garamond"').catch(() => null);
	await bootTimeline();
	(window as any).renderAt = (t: number) => {
		hud.innerHTML = '';
		const i = TIMELINE.findIndex((s) => t >= s.a && t < s.b); const shot = TIMELINE[i < 0 ? TIMELINE.length - 1 : i];
		shot.draw(t - shot.a, t, hud);
	};
	(window as any).CHECKT = checkTime; (window as any).DURATION = DURATION; (window as any).READY = true;
})().catch((e) => { console.error('BOOT', e?.message || e, e?.stack); });
export {renderStage, composite, W, H};
