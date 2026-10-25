// ep45 proof scenes: shared core. Every scene is a pure function of film time t → {svg (1920x1080 art), hud (html), meta}.
// The art is the approved key-frame code (style/v4/src: kit.js, hero3.js, v7.js, skin.js, staff45.js …) driven by t:
// a camera (log-zoom, smoothstep) on a "world" group, plus screen-space layers. HUD = the same DOM/CSS as K.hud4 (skin.js).
(() => {
const P = window.P45 = {};
P.BAR0 = 1.4498; P.BEAT = 60 / 106; P.FPS = 30;
P.beat = (k) => P.BAR0 + P.BEAT * k;
P.clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
P.seg = (t, a, b) => P.clamp((t - a) / (b - a));
P.lerp = (a, b, u) => a + (b - a) * u;
P.smooth = (u) => { u = P.clamp(u); return u * u * (3 - 2 * u); };
P.easeOut = (u) => { u = P.clamp(u); return 1 - (1 - u) * (1 - u); };
P.easeOut3 = (u) => { u = P.clamp(u); return 1 - Math.pow(1 - u, 3); };
P.easeIn = (u) => { u = P.clamp(u); return u * u; };
P.rnd = (i) => { const x = Math.sin(i * 127.1 + 7.7) * 43758.5453; return x - Math.floor(x); };
/** value noise in [−1, 1], smooth in t */
P.noise = (t, seed = 0) => { const i = Math.floor(t), f = t - i, a = P.rnd(i * 1.37 + seed * 17.1) * 2 - 1, b = P.rnd((i + 1) * 1.37 + seed * 17.1) * 2 - 1, s = f * f * (3 - 2 * f); return a + (b - a) * s; };
/** damped jolt: amplitude A, n cycles over dur s, starting at t0 */
P.jolt = (t, t0, A, dur, cycles = 2) => { if (t < t0 || t > t0 + dur) return 0; const u = (t - t0) / dur; return A * Math.sin(u * cycles * 2 * Math.PI) * (1 - u) * (1 - u); };
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
P.mixC = (a, b, t) => { const A = hex(a), B = hex(b); t = P.clamp(t); return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join(''); };

/* ---------------- camera ----------------
 * keys: [{t0, t1, to: [x, y, z], ease?: 'smooth' | 'out' | 'linear'}], start: [x, y, z]. Position lerps, zoom lerps in log space,
 * both on the same eased parameter (smoothstep peaks at 1.5x the mean speed). Between keys the camera holds. */
P.cam = (start, keys) => (t) => {
	let c = start;
	for (const k of keys) {
		if (t <= k.t0) break;
		const u = P.clamp((t - k.t0) / (k.t1 - k.t0)), e = k.ease === 'mix' ? P.easeMix(u) : k.ease === 'out' ? P.easeOut(u) : k.ease === 'linear' ? u : k.ease === 'out3' ? P.easeOut3(u) : P.smooth(u);
		c = [P.lerp(c[0], k.to[0], e), P.lerp(c[1], k.to[1], e), Math.exp(P.lerp(Math.log(c[2]), Math.log(k.to[2]), e))];
		if (t < k.t1) break;
	}
	return {x: c[0], y: c[1], z: c[2]};
};
P.camT = (c) => `translate(960,540) scale(${c.z}) translate(${-c.x},${-c.y})`;
P.toScr = (c, p) => [960 + (p[0] - c.x) * c.z, 540 + (p[1] - c.y) * c.z];

/** rename every id in an svg string with a prefix (so two sets can share a frame) */
P.scope = (svg, pre) => {
	const ids = new Set(); svg.replace(/\bid="([^"]+)"/g, (_, id) => { ids.add(id); return ''; });
	return svg.replace(/\bid="([^"]+)"/g, (_, id) => `id="${pre}${id}"`).replace(/url\(#([^)]+)\)/g, (m, id) => ids.has(id) ? `url(#${pre}${id})` : m)
		.replace(/href="#([^"]+)"/g, (m, id) => ids.has(id) ? `href="#${pre}${id}"` : m);
};
/** widen the user-space filter regions of the kit's filters (they are sized for a 1920x1080 world) */
P.wideFilters = (svg) => svg.replaceAll('x="-100" y="-100" width="2120" height="1280"', 'x="-1200" y="-1200" width="4400" height="3600"')
	.replaceAll('x="-200" y="-200" width="2320" height="1480"', 'x="-1200" y="-1200" width="4400" height="3600"');

/* ---------------- HUD (same DOM + CSS as K.hud4 with skin.js) ---------------- */
/** typed subtitle: whole on its first frame if t0 = 0; otherwise characters appear over ≤ 0.4 s (each fades in over 2 frames).
 *  [ ] words sit on the copper tag; the tag fades in with its first character. */
P.subHtml = (text, t, t0, o = {}) => {
	if (!text || t < t0) return '';
	const plain = text.replace(/[\[\]]/g, ''), n = [...plain].length, dur = t0 === 0 ? 0 : Math.min(0.4, 0.05 + 0.025 * n);
	const vis = (i) => dur === 0 ? 1 : P.clamp((t - t0 - dur * i / n) / (2 / 30));
	let i = 0, html = '', inK = false;
	for (const ch of text) {
		if (ch === '[') { inK = true; html += `<span class="k" style="background:rgba(168,74,38,${vis(i)});box-shadow:-.08em 0 0 rgba(168,74,38,${vis(i)}),.08em 0 0 rgba(168,74,38,${vis(i)})">`; continue; }
		if (ch === ']') { inK = false; html += '</span>'; continue; }
		html += `<span style="opacity:${vis(i).toFixed(3)}">${ch}</span>`; i++;
	}
	return `<div class="sub sh" style="--bk:${o.bk ?? 0};opacity:${o.op ?? 1}">${html}</div>`;
};
/** the line on screen at t from a lines list [[t0, t1, text]]; clear = times at which the line is cleared early */
P.lineAt = (lines, t, clearAt = {}) => { let cur = null; for (const l of lines) if (t >= l[0] - 1e-6 && t < l[1] - 1e-6) cur = l; if (cur && clearAt[cur[2]] !== undefined && t >= clearAt[cur[2]]) return null; return cur; };
P.stampHtml = (s1, s2, o = {}) => (s1 ? `<div class="stamp sh" style="--bk:${o.bk ?? 0};opacity:${o.op ?? 1}"><div class="s1">${s1}</div>${s2 ? `<div class="s2">${s2}</div>` : ''}</div>` : '');
/** one counter dot. st: target state; k: 0..1 progress from 'from' (default e) */
P.dot = (st, k = 1, from = 'e') => {
	if (k >= 1 || st === from) return `<span class="o ${st}"></span>`;
	if (k <= 0) return `<span class="o ${from}"></span>`;
	if (st === 'r' || st === 'h') return `<span class="o e" style="background:rgba(255,241,220,${k});border-color:rgba(255,241,220,${0.75 + 0.25 * k})"></span>`;
	if (st === 'y') return `<span class="o e" style="background:rgba(232,137,75,${k});border-color:rgba(255,217,166,${0.75 + 0.25 * k});box-shadow:0 0 ${14 * k}px #FF9A5A"></span>`;
	if (st === 'd') return `<span class="o ${k > 0.5 ? 'd' : from}"></span>`;
	if (st === 'e') return `<span class="o e"></span>`;
	return `<span class="o ${st}"></span>`;
};
/** rows: [{lab, num, dots: html, style}] ; era: chip text or null ; blkStyle: inline style for .blk (punch-in moves) */
P.blockHtml = (rows, era, o = {}) => {
	const r = rows.map((w, i) => `<div class="${i ? 'row2' : ''}" style="${w.style ?? ''}"><span class="lab">${w.lab}</span><span class="num">${w.num}</span>${w.dots}</div>`).join('');
	return `<div class="blk" style="--bk:${o.bk ?? 0};${o.style ?? ''}"><div class="age sh">${era ? `<div class="era" style="opacity:${o.eraOp ?? 1}">${era}</div>` : ''}</div>${r ? `<div class="tally sh" style="opacity:${o.op ?? 1}">${r}</div>` : ''}</div>`;
};
P.sealHtml = (op = 1) => `<div class="seal" style="opacity:${0.9 * op}">${K.seal()}</div>`;
P.hud = (parts) => `<div id="hud">${parts.join('')}</div>`;
/** lay out a HUD fragment once and return the screen rect of sel (for moves between a HUD slot and the frame centre) */
P.measure = (html, sel) => { P.mount(); const w = document.getElementById('hudwrap'); w.innerHTML = html; const r = w.querySelector(sel).getBoundingClientRect(); return {x: r.x, y: r.y, w: r.width, h: r.height}; };
/** odometer digits: v (float) rolling, n digits; each column a strip 0–9 shifted by its rolling position */
P.odo = (v, n = 4) => Array.from({length: n}, (_, k) => { const j = n - 1 - k, p = Math.pow(10, j), base = Math.floor(v / p), lower = v - base * p;
	const pos = j === 0 ? v : base + Math.max(0, lower - (p - 1)), off = ((pos % 10) + 10) % 10;
	return `<span style="display:inline-block;height:1.25em;overflow:hidden;vertical-align:top"><span style="display:block;transform:translateY(${(-off * 1.25).toFixed(4)}em)">${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((d) => `<span style="display:block;height:1.25em">${d}</span>`).join('')}</span></span>`; }).join('');

/* ---------------- page ---------------- */
P.SCENES = {};
let styled = false;
P.mount = () => {
	if (styled) return; styled = true;
	const st = document.createElement('style'); st.textContent = K.CSS + K.CSS4 + `.blk{transition:none}`; document.head.appendChild(st);
	document.body.innerHTML = `<svg id="art" xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080"></svg><div id="hudwrap"></div>`;
};
window.renderAt = (t, scene) => {
	P.mount();
	const S = P.SCENES[scene];
	const r = S.render(t);
	document.getElementById('art').innerHTML = r.svg;
	document.getElementById('hudwrap').innerHTML = r.hud;
	return r.meta ?? {};
};
})();
