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
		sky: '#3F5A62', tall: {scale: 4 / 3, left: -927, top: 230, ty: 128}, wide: {scale: 1.04, left: -20, top: 110, ty: 110}},
	B: {art: 'a23.80.png', kicker: '故宫 · 午门 · 2025', l1: '排队四五个小时', l2: '只看你一两分钟', sub: '假如你是清明上河图', small1: true,
		sky: '#2C3D47', tall: {scale: 4 / 3, left: -520, top: 73, ty: 128}, wide: {scale: 1, left: -180, top: 0, ty: 110}},
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
.brand{position:absolute;left:${lay === 'tall' ? 72 : 80}px;top:${lay === 'tall' ? 64 : 56}px;display:flex;align-items:center;gap:12px;font-family:'Noto Serif CJK SC',serif;font-weight:700;font-size:24px;letter-spacing:.32em;color:rgba(255,243,216,.82)}
.k{font-size:26px;font-weight:600;letter-spacing:.42em;color:rgba(255,243,216,.7);margin:22px 0 22px}
.l1{font-size:${l1}px;font-weight:900;line-height:1.12;letter-spacing:.04em;white-space:nowrap}
.l2{font-size:${big}px;font-weight:900;line-height:1.12;letter-spacing:.04em;white-space:nowrap;background:linear-gradient(180deg,#FFF1C9 0%,#F8D483 45%,#E0A951 100%);-webkit-background-clip:text;background-clip:text;color:transparent;filter:drop-shadow(0 3px 14px rgba(0,0,0,.6))}
.s{font-size:${lay === 'tall' ? 40 : 38}px;font-weight:700;margin-top:26px;color:rgba(255,243,216,.9);letter-spacing:.06em}
.s::before{content:'';display:inline-block;width:46px;height:3px;background:#C63A2E;vertical-align:middle;margin-right:18px;transform:translateY(-4px)}
</style></head><body><img class="art" src="${img(c.art)}"><div class="v"></div>
<div class="brand">${seal(40)}VIBE知识大赏</div>
<div class="t"><div class="k">${c.kicker}</div>${c.small1 ? `<div class="l2" style="font-size:${big}px">${c.l1}</div><div class="l1">${c.l2}</div>` : `<div class="l1">${c.l1}</div><div class="l2">${c.l2}</div>`}<div class="s">${c.sub}</div></div></body></html>`;
};
const b = await chromium.launch();
for (const k of Object.keys(C)) for (const lay of ['tall', 'wide']) {
	const W = lay === 'tall' ? 1080 : 1440, H = lay === 'tall' ? 1440 : 1080;
	const p = await b.newPage({viewport: {width: W, height: H}}); await p.setContent(page(k, lay)); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(300);
	const name = `cover_${k}_${lay === 'tall' ? '竖版3x4' : '横版4x3'}.png`; await p.screenshot({path: path.join(OUT, name)}); console.log(name); await p.close();
}
await b.close();
