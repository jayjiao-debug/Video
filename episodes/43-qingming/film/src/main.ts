// ep43 film entry: boots the stages, exposes window.renderAt(t), READY, DURATION for the frame grabber.
import {initRenderer, initPost, Stage} from './core';
import {renderFilm, addScene, SCENES} from './film';
import {checkTime} from './actors';
import {bootOpen} from './s_open';
import * as M from './modules';

export const DURATION = 184.3;
const hud = document.getElementById('hud')!;
(async () => {
	initRenderer(document.getElementById('c') as HTMLCanvasElement); initPost();
	await document.fonts.load('900 58px "Noto Serif CJK SC"').catch(() => null);
	await document.fonts.load('700 58px "Noto Serif CJK SC"').catch(() => null);
	await document.fonts.load('600 96px "Cormorant Garamond"').catch(() => null);
	const only = (window as any).ONLY as string[] | undefined;      // optional: boot only some modules (dev speed)
	await bootOpen();
	const failed: string[] = [];   // a module that fails to boot is skipped (logged), so one unfinished module can't stop every render
	for (const [name, boot] of Object.entries(M.BOOTS)) if (!only || only.includes(name)) { try { await boot(); } catch (e: any) { failed.push(name); console.error('BOOT-FAIL', name, e?.message || e); } }
	(window as any).BOOT_FAILED = failed;
	// fill gaps with an empty stage so every t renders
	const empty = new Stage('todo'); const sorted = [...SCENES].sort((p, q) => p.a - q.a); let t0 = 0;
	for (const s of sorted) { if (s.a > t0 + 1e-3) addScene({id: 'gap', a: t0, z: s.a, draw: () => ({st: empty, grade: {vig: 0}})}); t0 = Math.max(t0, s.z); }
	if (t0 < DURATION) addScene({id: 'gap', a: t0, z: DURATION + 1, draw: () => ({st: empty, grade: {vig: 0}})});
	(window as any).renderAt = (t: number) => { checkTime(t); renderFilm(t, hud); };
	(window as any).CHECKT = checkTime; (window as any).DURATION = DURATION; (window as any).READY = true;
})().catch((e) => { console.error('BOOT', e?.message || e, e?.stack); });
