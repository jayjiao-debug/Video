// Scene framework: scenes are pure functions of film time. A scene may declare an IN transition that overlaps the end of
// the previous scene: both are rendered (prev → slot 0, this → slot 1) and composited with the transition mask.
import {Stage, renderStage, composite, Xf, Grade, clamp01} from './core';
import {subtitles, Line} from './hud';
import {drawFurniture} from './furniture';
import LINES_JSON from '../../lines_bars.json';

export const LINES = LINES_JSON as unknown as Line[];
export type Frame = {st: Stage; grade?: Grade; bloom?: number; hud?: (hud: HTMLElement) => void; hideFurniture?: boolean; hideSubs?: boolean};
export type In = {mode: number; a: number; z: number; dir?: [number, number]; pt?: [number, number]; soft?: number; band?: number; ease?: (u: number) => number};
export type Scene = {id: string; a: number; z: number; draw: (t: number) => Frame; in?: In};
export const SCENES: Scene[] = [];
export const addScene = (s: Scene) => { SCENES.push(s); SCENES.sort((p, q) => p.a - q.a); };

export const renderFilm = (t: number, hud: HTMLElement) => {
	hud.innerHTML = '';
	let i = SCENES.findIndex((s) => t >= s.a && t < s.z); if (i < 0) i = t < SCENES[0].a ? 0 : SCENES.length - 1;
	const cur = SCENES[i], tr = cur.in && i > 0 && t >= cur.in.a && t < cur.in.z ? cur.in : null;
	const fc = cur.draw(t);
	if (tr) {
		const prev = SCENES[i - 1], fp = prev.draw(t);
		renderStage(fp.st, 0, fp.bloom ?? 1); renderStage(fc.st, 1, fc.bloom ?? 1);
		const k = (tr.ease ?? ((u: number) => u))(clamp01((t - tr.a) / (tr.z - tr.a)));
		const x: Xf = {mode: tr.mode, k, dir: tr.dir, pt: tr.pt, soft: tr.soft, band: tr.band};
		composite(x, fc.grade ?? {}, t, fp.bloom ?? 1, fc.bloom ?? 1);
	} else { renderStage(fc.st, 0, fc.bloom ?? 1); composite({mode: 0, k: 0}, fc.grade ?? {}, t, fc.bloom ?? 1); }
	if (!fc.hideSubs) subtitles(hud, LINES, t);
	drawFurniture(hud, t, {hideAll: fc.hideFurniture});
	fc.hud?.(hud);
};
