// ep43 HUD (HTML over the canvas): top-left subtitle with typed reveal, top-right stamp, old corner mark, era chip +
// odometer counter, the 四出五进 tally, labels, title ink, Juno end card. Rebuilt every frame from t.
import {clamp01, smooth, BEAT} from './core';

export const IVORY = '#FFF3D8', RED = '#EE4B3B', INK = '#2A1F17', GOLD = '#f6cf78';
const PUNCT = '？！。，：；、”';
export const html = (hud: HTMLElement, s: string) => hud.insertAdjacentHTML('beforeend', s);
export const env = (t: number, a: number, b: number, fi = 0.18, fo = 0.18) => clamp01((t - a) / fi) * clamp01((b - t) / fo);

/** lines that stay on screen as line 1 until the next line (their line 2) ends */
const STAYS = ['九百年，人人都想', '1186年，金人', '他在最后写道', '宫里的裱画匠', '几经辗转', '1578年，太监冯保', '一个月内，四卷', '1945年，伪满覆灭', '几年后，沈阳', '标着真迹的两卷', '明朝人把草棚', '藏者宜宝之——', '直到你不再属于', '安全的代价'];
/** lines that appear whole on their cut (no typed reveal) */
const WHOLE = ['你被人偷偷', '被一个太监', '被末代皇帝', '还躺在一堆', '[偷你]', '混乱中，你'];
export type Line = [number, number, string];
const stays = (s: string) => STAYS.some((p) => s.startsWith(p));
const whole = (s: string) => WHOLE.some((p) => s.startsWith(p));
const centred = (s: string) => s.includes('？');

/** markup for a line with [red] words, revealing n characters (fractional = the next char fading in) */
const markup = (s: string, n: number, ctr: boolean, redOn: (group: number) => boolean = () => true) => {
	let out = '', i = 0, red = false, grp = -1, prev = ''; const chars = [...s];
	const lastVis = chars.filter((c) => c !== '[' && c !== ']').length - 1;
	for (const ch of chars) {
		if (ch === '[') { red = true; grp++; continue; } if (ch === ']') { red = false; continue; }
		const o = clamp01(n - i); let pull = ctr && i === lastVis && PUNCT.includes(ch) ? 'margin-right:-0.5em;' : '';
		if ('”’」』）'.includes(prev) && '。，！？；：、'.includes(ch)) pull += 'margin-left:-0.45em;';      // 」。 / ”。: no full-width gap between the two marks
		out += `<span${red && redOn(grp) ? ' class="k"' : ''} style="opacity:${o.toFixed(3)};${pull}">${ch}</span>`; i++; prev = ch;
	}
	return out;
};
/** draw the subtitles for time t from the line list */
const rowOf = (lines: Line[], i: number) => (i > 0 && stays(lines[i - 1][2]) && Math.abs(lines[i - 1][1] - lines[i][0]) < 0.05 ? 1 : 0);
export const subtitles = (hud: HTMLElement, lines: Line[], t: number, yTop = 132) => {
	for (let i = 0; i < lines.length; i++) {
		const [a, b, s] = lines[i];
		if (s.startsWith('要是排')) continue;                     // Q lives only in the end card's slot
		const prevStays = rowOf(lines, i) === 1;
		const end = stays(s) && i + 1 < lines.length && Math.abs(lines[i + 1][0] - b) < 0.05 ? lines[i + 1][1] : b;
		// the outgoing line is gone by the time the next line in the same row starts typing (no text over text)
		let outEnd = end + 0.2;
		// any line is fully gone when the next line (in any row) starts — except the line it stays above (its own line 2)
		for (let k = i + 1; k < lines.length && lines[k][0] < outEnd; k++) { if (lines[k][2].startsWith('要是排') || lines[k][0] < a + 0.1) continue; if (stays(s) && k === i + 1 && Math.abs(lines[k][0] - b) < 0.05) continue; outEnd = Math.max(a + 0.2, lines[k][0]); break; }
		const fade = Math.min(0.2, outEnd - end + 0.12);
		if (t < a - 0.01 || t > outEnd) continue;
		const o = clamp01((outEnd - t) / fade) * clamp01((t - a + 0.06) / 0.06);
		const nVis = [...s].filter((c) => c !== '[' && c !== ']').length;
		const n = whole(s) ? 99 : Math.max(1, (t - a) / Math.min(0.4, 0.035 * nVis) * nVis + (i === 0 ? 4 : 0));
		const ctr = centred(s); const row = prevStays ? 1 : 0;
		const perWord = s.startsWith('[偷你]');                      // E3: each verb turns red on its own beat
		const redOn = perWord ? (g: number) => t >= a + g * BEAT - 0.02 : undefined;
		html(hud, `<div class="${ctr ? 'subc' : 'sub'} sh" style="top:${yTop - 8 + row * 88}px;opacity:${o.toFixed(3)}">${markup(s, n, ctr, redOn)}</div>`);
	}
};

export type Stamp = {s1: string; s2?: string; s3?: string};
/** stamp, arriving with a short drop at time a */
export const stamp = (hud: HTMLElement, st: Stamp | null, t: number, a: number, o = 1) => {
	if (!st || o <= 0) return; const u = clamp01((t - a) / 0.16), y = (1 - smooth(u)) * -10;
	html(hud, `<div class="stamp sh" style="opacity:${(o * smooth(u)).toFixed(3)};transform:translateY(${y.toFixed(1)}px)"><div class="s1">${st.s1}</div>${st.s2 ? `<div class="s2">${st.s2}</div>` : ''}${st.s3 ? `<div class="s3">${st.s3}</div>` : ''}</div>`);
};
/** the old series corner mark */
export const mark = (hud: HTMLElement, o = 1) => { if (o > 0) html(hud, `<div class="mark" style="opacity:${(0.62 * o).toFixed(3)}"><span style="color:#B9B2A6">◆</span> Juno · VIBE知识大赏</div><div class="jl" style="opacity:${(0.42 * o).toFixed(3)}">J</div>`); };

/** odometer digits for a value that may be mid-roll (v real); width = number of digits shown */
const odo = (v: number, width: number) => {
	let out = ''; const iv = Math.floor(v + 1e-6), fr = v - iv;
	for (let k = width - 1; k >= 0; k--) {
		const p = Math.pow(10, k), d = Math.floor(iv / p) % 10;
		// a digit rolls only while every lower digit is at 9 (classic odometer)
		const lower = iv % p, rolling = k === 0 ? fr : lower === p - 1 ? fr : 0;
		if (k > 0 && iv < p && v < p) continue;            // no leading zeros
		const y = -rolling * 92;
		out += `<span class="dg"><span style="top:${y.toFixed(1)}px">${d}</span><span style="top:${(y + 92).toFixed(1)}px">${(d + 1) % 10}</span></span>`;
	}
	return out;
};
export type Age = {era: string; pre?: string; v: number; post?: string; o?: number};
/** era chip + 你 约N 岁 */
export const age = (hud: HTMLElement, a: Age | null) => {
	if (!a || (a.o ?? 1) <= 0) return; const w = String(Math.floor(a.v + 0.999)).length;
	html(hud, `<div class="age sh" style="opacity:${(a.o ?? 1).toFixed(3)}">${a.era ? `<div class="era">${a.era}</div>` : ''}<div class="cnt"><span class="a">你${a.pre ? ' ' + a.pre : ''}</span><span class="n">${odo(a.v, w)}</span><span class="a">${a.post ?? ''}岁</span></div></div>`);
};
/** the 四出五进 tally: out/in fill counts (fractional = filling), flash 0..1 */
export const tally = (hud: HTMLElement, outN: number, inN: number, o = 1, flash = 0, flashOut = 0) => {
	if (o <= 0) return;
	const dots = (n: number, tot: number, fl: number) => Array.from({length: tot}, (_, i) => { const f = clamp01(n - i); const glow = fl > 0 ? `box-shadow:0 0 ${(18 * fl).toFixed(0)}px ${RED};` : '';
		return `<span class="o${f >= 1 ? ' f' : ''}" style="${f > 0 && f < 1 ? `background:rgba(238,75,59,${f.toFixed(2)});border-color:${RED};` : ''}${f >= 1 ? glow : ''}"></span>`; }).join('');
	html(hud, `<div class="tally sh" style="opacity:${o.toFixed(3)}"><div>出 ${dots(outN, 4, Math.max(flash, flashOut))}&nbsp;&nbsp;进 ${dots(inN, 5, flash)}</div><div class="l" style="opacity:${(0.85 + 0.15 * flash).toFixed(2)}">四出五进 —— 故宫博物院</div></div>`);
};
/** a mid-band label with a feathered scrim */
export const label = (hud: HTMLElement, x: number, y: number, text: string, o: number) => {
	if (o <= 0) return;
	html(hud, `<div style="position:absolute;left:${x - 40}px;top:${y - 36}px;width:${text.length * 60 + 80}px;height:84px;background:rgba(14,10,8,.5);filter:blur(22px);opacity:${o}"></div><div class="lbl sh" style="left:${x}px;top:${y - 30}px;opacity:${o};font-size:58px">${text}</div>`);
};
/** the title in ink, centred on the silk band (band drawn in three.js) */
export const titleInk = (hud: HTMLElement, o: number, sink = 0, cy = 540) => {
	if (o <= 0) return; const blur = (sink * 3).toFixed(1);
	html(hud, `<div style="position:absolute;left:0;right:0;top:${cy - 128}px;text-align:center;color:${INK};opacity:${o.toFixed(3)};filter:blur(${blur}px)">
		<div style="font-weight:700;font-size:64px;letter-spacing:.35em;margin-right:-.35em;line-height:1.1">假如你是</div>
		<div style="font-weight:900;font-size:170px;letter-spacing:.06em;margin-right:-.06em;line-height:1.05">清明上河图</div></div>`);
};
/** Juno end card (engine layout) */
export const endCard = (hud: HTMLElement, o: number, q: string, sources: string, qType = 99, oPill = 1, oSrc = 1) => {
	if (o <= 0) return;
	let k = 0; q = [...q].filter((c) => { if (c === '[' || c === ']') return true; k++; return k <= qType; }).join(''); if ((q.match(/\[/g) || []).length > (q.match(/\]/g) || []).length) q += ']';
	const qm = q.replace(/\[([^\]]+)\]/g, `<span style="color:${GOLD}">$1</span>`).replace(/？$/, '<span style="margin-right:-0.54em">？</span>');
	html(hud, `<div style="position:absolute;inset:0;opacity:${o.toFixed(3)};font-family:'Noto Sans CJK SC','Noto Sans SC',sans-serif">
		<div style="position:absolute;left:50%;top:120px;transform:translateX(-50%);width:96px;height:96px;border-radius:48px;border:3px solid ${GOLD};color:${GOLD};font-weight:900;font-size:58px;line-height:92px;text-align:center;font-family:'Noto Serif CJK SC',serif">J</div>
		<div style="position:absolute;left:0;right:0;top:250px;text-align:center;font-weight:900;font-size:50px;color:${GOLD};letter-spacing:.08em;font-family:'Noto Serif CJK SC',serif">假如你是清明上河图</div>
		<div style="position:absolute;left:0;right:0;top:350px;text-align:center;font-weight:900;font-size:72px;color:#fff;text-shadow:0 0 10px ${GOLD},0 0 34px rgba(246,207,120,.5);font-family:'Noto Serif CJK SC',serif">${qm}</div>
		<div style="position:absolute;left:0;right:0;top:470px;text-align:center;font-weight:700;font-size:40px;color:rgba(255,246,221,.85);letter-spacing:.2em">评论区聊聊</div>
		<div style="position:absolute;left:50%;top:590px;transform:translateX(-50%);padding:14px 40px;border:2px solid rgba(246,207,120,.8);border-radius:40px;font-weight:700;font-size:36px;color:#fff6dd;white-space:nowrap;opacity:${oPill}">关注 Juno · 一起看懂世界</div>
		<div style="position:absolute;left:120px;right:120px;bottom:40px;text-align:center;font-size:21px;color:rgba(255,255,255,.55);line-height:1.6;opacity:${oSrc}">${sources}</div></div>`);
};
