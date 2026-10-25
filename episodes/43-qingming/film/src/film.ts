// Scene framework: scenes are pure functions of film time. A scene may declare an IN transition that overlaps the end of
// the previous scene: both are rendered (prev → slot 0, this → slot 1) and composited with the transition mask.
import {Stage, renderStage, composite, Xf, Grade, clamp01, renderer} from './core';
import {subtitles, Line} from './hud';
import {drawFurniture} from './furniture';
import LINES_JSON from '../../lines_bars.json';

export const LINES = LINES_JSON as unknown as Line[];
export type Frame = {st: Stage; under?: Stage; blurUnder?: number; grade?: Grade; bloom?: number; hud?: (hud: HTMLElement) => void; hideFurniture?: boolean; hideSubs?: boolean};
export type In = {mode: number; a: number; z: number; dir?: [number, number]; pt?: [number, number]; soft?: number; band?: number; ease?: (u: number) => number};
export type Scene = {id: string; a: number; z: number; draw: (t: number) => Frame; in?: In};
export const SCENES: Scene[] = [];
const FALLBACK: {st?: Stage} = {};
export const addScene = (s: Scene) => { SCENES.push(s); SCENES.sort((p, q) => p.a - q.a); };

export const renderFilm = (t: number, hud: HTMLElement) => {
	hud.innerHTML = '';
	let i = SCENES.findIndex((s) => t >= s.a && t < s.z); if (i < 0) i = t < SCENES[0].a ? 0 : SCENES.length - 1;
	const cur = SCENES[i], tr = cur.in && i > 0 && t >= cur.in.a && t < cur.in.z ? cur.in : null;
	const safe = (sc: Scene, tt: number): Frame => { try { return sc.draw(tt); } catch (e: any) { console.error('DRAW-FAIL', sc.id, tt.toFixed(2), e?.message || e); FALLBACK.st ??= new Stage('fallback'); return {st: FALLBACK.st, grade: {vig: 0}}; } };
	const fc = safe(cur, t);
	if (tr) {
		const prev = SCENES[i - 1], fp = safe(prev, t);
		renderStage(fp.st, 0, fp.bloom ?? 1); renderStage(fc.st, 1, fc.bloom ?? 1);
		const k = (tr.ease ?? ((u: number) => u))(clamp01((t - tr.a) / (tr.z - tr.a)));
		const x: Xf = {mode: tr.mode, k, dir: tr.dir, pt: tr.pt, soft: tr.soft, band: tr.band};
		composite(x, fc.grade ?? {}, t, fp.bloom ?? 1, fc.bloom ?? 1, fp.grade ?? {});   // each side keeps its own scene's grade
	} else if (fc.under) { renderStage(fc.under, 0, 1); renderStage(fc.st, 1, fc.bloom ?? 1); composite({mode: 13, k: 1, blurA: fc.blurUnder ?? 0}, fc.grade ?? {}, t, 1, fc.bloom ?? 1); }
	else { renderStage(fc.st, 0, fc.bloom ?? 1); composite({mode: 0, k: 0}, fc.grade ?? {}, t, fc.bloom ?? 1); }
	if (!fc.hideSubs) subtitles(hud, LINES, t);
	drawFurniture(hud, t, {hideAll: fc.hideFurniture});
	fc.hud?.(hud);
	if (document.body.classList.contains('ad')) adaptBacking(hud);
};

/** backing only where it is needed: for each HUD block, measure the rendered picture behind it and set --bk (0 = dark enough,
 *  no backing … 1 = bright, full soft backing). A pure function of the frame, so it follows cuts and camera moves. */
const BACKED = ':scope > .sub, :scope > .subc, :scope > .stamp, :scope > .blk, :scope > .age, :scope > .tally';
let px = new Uint8Array(0);
const adaptBacking = (hud: HTMLElement) => {
	const gl = renderer.getContext(), Hc = gl.drawingBufferHeight, Wc = gl.drawingBufferWidth;
	for (const el of Array.from(hud.querySelectorAll<HTMLElement>(BACKED))) {
		const r = el.getBoundingClientRect(); const x0 = Math.max(0, Math.floor(r.left)), x1 = Math.min(Wc, Math.ceil(r.right)), y0 = Math.max(0, Math.floor(r.top)), y1 = Math.min(Hc, Math.ceil(r.bottom));
		const w = x1 - x0, h = y1 - y0; if (w < 4 || h < 4) continue;
		if (px.length < w * h * 4) px = new Uint8Array(w * h * 4);
		gl.readPixels(x0, Hc - y1, w, h, gl.RGBA, gl.UNSIGNED_BYTE, px);
		let sum = 0, bright = 0, n = 0;
		for (let j = 0; j < h; j += 3) for (let i = 0; i < w; i += 3) { const k = (j * w + i) * 4, L = (0.2126 * px[k] + 0.7152 * px[k + 1] + 0.0722 * px[k + 2]) / 255; sum += L; if (L > 0.62) bright++; n++; }
		const mean = sum / n, frac = bright / n, bk = clamp01(Math.max((mean - 0.4) / 0.22, (frac - 0.12) / 0.3));
		el.style.setProperty('--bk', bk.toFixed(2)); el.dataset.bk = bk.toFixed(2);
	}
};
