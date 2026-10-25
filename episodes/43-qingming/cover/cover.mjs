// ep43 Douyin covers (横版 4:3 1440×1080, 竖版 3:4 1080×1440), in the reference account's cover format:
// small brand line top-left, a small kicker (subject · years), a big two-line serif title (line 2 in the hero's colour),
// a one-line payoff under it, the film's own hero art underneath with a vignette.
// node cover.mjs <artDir> <outDir>   (artDir: clean frames rendered by the film with window.NOHUD, named a<t>.png)
import {createRequire} from 'module'; const {chromium} = createRequire(import.meta.url)('playwright');
import fs from 'fs'; import path from 'path';
const [, , ART, OUT] = process.argv; fs.mkdirSync(OUT, {recursive: true});
const FONT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../film/fonts/cormorant-garamond-latin-600-normal.woff2');
const img = (f) => 'data:image/png;base64,' + fs.readFileSync(path.join(ART, f)).toString('base64');

// the round 朱文 J seal (same drawing as the film's corner seal C1)
const seal = (h) => `<svg viewBox="0 0 100 100" height="${h}" width="${h}"><defs><filter id="w" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency="0.07" numOctaves="2" seed="5" result="n1"/><feDisplacementMap in="SourceGraphic" in2="n1" scale="3.2" xChannelSelector="R" yChannelSelector="G" result="d"/><feTurbulence type="fractalNoise" baseFrequency="0.28" numOctaves="2" seed="10" result="n2"/><feColorMatrix in="n2" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 -4.2 3.25" result="m"/><feComposite in="d" in2="m" operator="in"/></filter></defs><g filter="url(#w)" transform="rotate(-2.5 50 50)"><circle cx="50" cy="50" r="41" fill="none" stroke="#C63A2E" stroke-width="8"/><text x="50" y="72" text-anchor="middle" font-family="Noto Serif CJK SC" font-weight="900" font-size="60" fill="#C63A2E">J</text></g></svg>`;

// concepts: hero art + framing per layout, and the words
const C = {
	A: {art: 'a7.20.png', kicker: '清明上河图 · 约1100 — 今天', l1: '假如你是', l2: '清明上河图', sub: '九百年，四次被带出皇宫',
		sky: '#3F5A62', tall: {scale: 4 / 3, left: -927, top: 230, ty: 82}, wide: {scale: 1.04, left: -20, top: 110, ty: 62}},
	B: {art: 'a23.80.png', kicker: '故宫 · 午门 · 2025', l1: '排队四五个小时', l2: '只看你一两分钟', sub: '假如你是清明上河图', small1: true,
		sky: '#2C3D47', tall: {scale: 4 / 3, left: -520, top: 73, ty: 82}, wide: {scale: 1, left: -180, top: 0, ty: 62}},
};
const page = (k, lay) => {
	const c = C[k], f = c[lay], W = lay === 'tall' ? 1080 : 1440, H = lay === 'tall' ? 1440 : 1080;
	const iw = 1920 * f.scale, ih = 1080 * f.scale, left = f.left, top = f.top;   // the art is placed so the hero sits below the title; above it, the sky continues
	const big = lay === 'tall' ? (c.small1 ? 112 : 150) : (c.small1 ? 104 : 136), l1 = c.small1 ? big : Math.round(big * 0.6);
	return `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:'Cormorant Garamond';src:url('file://${FONT}') format('woff2');font-weight:600}
html,body{margin:0;width:${W}px;height:${H}px;overflow:hidden;background:${c.sky}}
.art{position:absolute;left:${left}px;top:${top}px;width:${iw}px;height:${ih}px;-webkit-mask-image:linear-gradient(to bottom,transparent 0,#000 60px)}
.v{position:absolute;inset:0;background:radial-gradient(ellipse 85% 75% at 55% 62%,rgba(8,6,5,0) 40%,rgba(8,6,5,.55) 100%),linear-gradient(to bottom,rgba(10,8,7,.62) 0%,rgba(10,8,7,.25) ${lay === 'tall' ? 34 : 40}%,rgba(10,8,7,0) 55%)}
.t{position:absolute;left:${lay === 'tall' ? 72 : 80}px;top:${f.ty}px;font-family:'Noto Serif CJK SC',serif;color:#FFF3D8;text-shadow:0 2px 18px rgba(0,0,0,.55)}
.brand{position:absolute;right:${lay === 'tall' ? 64 : 72}px;bottom:${lay === 'tall' ? 64 : 56}px;text-shadow:0 1px 8px rgba(0,0,0,.7);display:flex;align-items:center;gap:12px;font-family:'Noto Serif CJK SC',serif;font-weight:700;font-size:24px;letter-spacing:.32em;color:rgba(255,243,216,.82)}
.k{font-size:26px;font-weight:600;letter-spacing:.42em;color:rgba(255,243,216,.7);margin:22px 0 22px}
.l1{font-size:${l1}px;font-weight:900;line-height:1.12;letter-spacing:.04em;white-space:nowrap}
.l2{font-size:${big}px;font-weight:900;line-height:1.12;letter-spacing:.04em;white-space:nowrap;background:linear-gradient(180deg,#FFF8E2 0%,#FFE19A 42%,#F5BE5E 100%);-webkit-background-clip:text;background-clip:text;color:transparent;text-shadow:none;filter:drop-shadow(0 0 22px rgba(255,196,100,.38)) drop-shadow(0 2px 3px rgba(20,12,6,.55))}   /* no text-shadow here: it would paint over the clipped gold and dull it */
.s{font-size:${lay === 'tall' ? 40 : 38}px;font-weight:700;margin-top:26px;color:rgba(255,243,216,.9);letter-spacing:.06em}
.s::before{content:'';display:inline-block;width:46px;height:3px;background:#C63A2E;vertical-align:middle;margin-right:18px;transform:translateY(-4px)}
</style></head><body><img class="art" src="${img(c.art)}"><div class="v"></div>
<div class="brand">${seal(40)}VIBE知识大赏</div>
<div class="t"><div class="k">${c.kicker}</div>${c.small1 ? `<div class="l2" style="font-size:${big}px">${c.l1}</div><div class="l1">${c.l2}</div>` : `<div class="l1">${c.l1}</div><div class="l2">${c.l2}</div>`}<div class="s">${c.sub}</div></div></body></html>`;
};
// painting covers (owner: show the scroll art itself): the redrawn 虹桥, full bleed, the title in ink on a silk fade
// (bottom on 4:3, top on 3:4 so Douyin's lower UI keeps clear), a red seal; R = a vertical 题签 strip instead
const P = {
	P: {art: 'a127.60.png', silk: '239,227,200', cx: 960, cy: 470, tcx: 700},     // colour (the peak's colour flood)
	Q: {art: 'a3.00.png', silk: '242,232,208', cx: 960, cy: 560, tcx: 820, ts: 1.45, ttop: 0},   // the tall crop hides the blue mount strip at the frame's foot       // ink on silk (the opening)
	R: {art: 'a127.60.png', silk: '239,227,200', cx: 900, cy: 470, tcx: 760, strip: true},
};
const paint = (k, lay) => {
	const c = P[k], tall = lay === 'tall', W = tall ? 1080 : 1440, H = tall ? 1440 : 1080, s = tall ? c.ts ?? 4 / 3 : 1.04;
	const left = W / 2 - (tall ? c.tcx ?? c.cx : c.cx) * s, top = tall && c.ttop !== undefined ? c.ttop : Math.min(0, Math.max(H - 1080 * s, H / 2 - c.cy * s));
	const band = lay === 'tall' ? `linear-gradient(to bottom,rgba(${c.silk},.97) 0,rgba(${c.silk},.9) 300px,rgba(${c.silk},0) 520px)` : `linear-gradient(to top,rgba(${c.silk},.97) 0,rgba(${c.silk},.9) 250px,rgba(${c.silk},0) 470px)`;
	const tb = lay === 'tall' ? 'top:86px' : 'bottom:70px';
	const title = c.strip
		? `<div style="position:absolute;right:${lay === 'tall' ? 96 : 120}px;top:${lay === 'tall' ? 90 : 70}px;width:${lay === 'tall' ? 150 : 140}px;padding:34px 0 30px;background:#F7EEDA;border:3px solid #7d5f3c;box-shadow:0 0 0 8px #3E5A78,0 10px 40px rgba(0,0,0,.35);text-align:center;color:#2A1F17">
			<div style="writing-mode:vertical-rl;margin:0 auto;font-size:36px;font-weight:700;letter-spacing:.3em;color:#6b5236">假如你是</div>
			<div style="writing-mode:vertical-rl;margin:14px auto 0;font-size:${lay === 'tall' ? 112 : 104}px;font-weight:900;letter-spacing:.06em;line-height:1">清明上河图</div>
			<div style="margin-top:18px">${seal(70)}</div></div>`
		: `<div style="position:absolute;left:0;right:0;${tb};text-align:center;color:#2A1F17">
			<div style="font-size:${lay === 'tall' ? 50 : 46}px;font-weight:700;letter-spacing:.6em;margin-right:-.6em;color:#5a4430">假如你是</div>
			<div style="margin-top:6px;font-size:${lay === 'tall' ? 156 : 150}px;font-weight:900;letter-spacing:.1em;margin-right:-.1em;line-height:1.08">清明上河图</div>
			<div style="font-size:${lay === 'tall' ? 38 : 36}px;font-weight:700;letter-spacing:.24em;color:#5a4430;margin-top:14px">—— 九百年，四次被带出皇宫 ——</div></div>`;
	return `<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;width:${W}px;height:${H}px;overflow:hidden;background:rgb(${c.silk});font-family:'Noto Serif CJK SC',serif}
.art{position:absolute;left:${left}px;top:${top}px;width:${1920 * s}px;height:${1080 * s}px}
.brand{position:absolute;right:${lay === 'tall' ? 64 : 72}px;bottom:${lay === 'tall' ? 64 : 34}px;display:flex;align-items:center;gap:10px;font-weight:700;font-size:22px;letter-spacing:.3em;color:#3a2c20;text-shadow:0 0 10px rgba(${c.silk},.95),0 0 3px rgba(${c.silk},.95)}</style></head><body>
<img class="art" src="${img(c.art)}"><div style="position:absolute;inset:0;background:${c.strip ? 'radial-gradient(ellipse 90% 85% at 50% 50%,rgba(0,0,0,0) 60%,rgba(40,28,16,.28) 100%)' : band}"></div>
${title}<div class="brand">${seal(34)}VIBE知识大赏</div></body></html>`;
};
const b = await chromium.launch();
const ONLY = (process.env.ONLY || 'A,B,P,Q,R').split(',');
for (const k of ONLY) for (const lay of ['tall', 'wide']) {
	const W = lay === 'tall' ? 1080 : 1440, H = lay === 'tall' ? 1440 : 1080;
	const p = await b.newPage({viewport: {width: W, height: H}, deviceScaleFactor: +(process.env.DSF || 1)}); await p.setContent(P[k] ? paint(k, lay) : page(k, lay)); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(300);
	const name = `cover_${k}_${lay === 'tall' ? '竖版3x4' : '横版4x3'}.png`; await p.screenshot({path: path.join(OUT, name)}); console.log(name); await p.close();
}
await b.close();
