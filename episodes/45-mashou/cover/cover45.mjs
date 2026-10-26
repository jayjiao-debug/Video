// ep45 Douyin covers (横版 4:3 1440×1080, 竖版 3:4 1080×1440), from the film's own art (clean frames rendered without the HUD).
// node cover45.mjs <artPng> <outDir>   art: a 3840×2160 clean frame of the ring at night (film t = 2.4 s, only the horse lit)
// Hook on the cover = the money loop (not the 标题 words, and not the answer): 「6910万港元买下 / 却捐了」.
import {createRequire} from 'module'; const {chromium} = createRequire('/home/claude/video/episodes/43-qingming/film/package.json')('playwright');
import fs from 'fs'; import path from 'path';
const [, , ART, OUT] = process.argv; fs.mkdirSync(OUT, {recursive: true});
const art = 'data:image/png;base64,' + fs.readFileSync(ART).toString('base64');
const seal = 'data:image/png;base64,' + fs.readFileSync('/home/claude/video/docs/history-video-style/jseal.png').toString('base64');
const FONT = '/home/claude/video/episodes/43-qingming/film/fonts/cormorant-garamond-latin-600-normal.woff2';
const L = {   // art placement: the horse sits at about (945, 675) of the 1920×1080 frame; on 3:4 it stays above the lower 18 % (Douyin UI)
	wide: {W: 1440, H: 1080, aw: 1920 * 0.9, left: 720 - 945 * 0.9, top: 160, tx: 0, ty: 70, big: 200, l1: 72, sub: 44},   // l1 ≤ 72 px: the hook stays inside the centre 3:4 that the Douyin profile grid shows
	tall: {W: 1080, H: 1440, aw: 1920 * 1.12, left: 540 - 945 * 1.12, top: 250, tx: 0, ty: 130, big: 220, l1: 80, sub: 44},
};
const page = (lay) => { const c = L[lay], ah = c.aw * 9 / 16; return `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:'Cormorant Garamond';src:url('file://${FONT}') format('woff2');font-weight:600}
html,body{margin:0;width:${c.W}px;height:${c.H}px;overflow:hidden;background:#1d2a30;font-family:'Noto Serif CJK SC',serif}
.art{position:absolute;left:${c.left}px;top:${c.top}px;width:${c.aw}px;height:${ah}px;-webkit-mask-image:linear-gradient(to bottom,transparent 0,#000 140px)}
.v{position:absolute;inset:0;background:radial-gradient(ellipse 70% 60% at 50% ${lay === 'tall' ? 66 : 68}%,rgba(8,6,5,0) 35%,rgba(8,6,5,.55) 100%),linear-gradient(to bottom,rgba(12,16,18,.85) 0%,rgba(12,16,18,.35) ${lay === 'tall' ? 38 : 42}%,rgba(12,16,18,0) 58%)}
.t{position:absolute;left:0;right:0;top:${c.ty}px;text-align:center;color:#FFF3D8}
.k{font-size:30px;font-weight:600;letter-spacing:.42em;margin-right:-.42em;color:rgba(255,243,216,.72)}
.l1{margin-top:22px;font-size:${c.l1}px;font-weight:900;letter-spacing:.04em;line-height:1.1;text-shadow:0 2px 18px rgba(0,0,0,.6)}
.l1 .n{font-family:'Cormorant Garamond',serif;font-weight:600;font-size:1.18em}
.l2{font-size:${c.big}px;font-weight:900;line-height:1.05;letter-spacing:.08em;margin-right:-.08em;background:linear-gradient(180deg,#FFE6C2 0%,#F2B27A 45%,#C8743F 100%);-webkit-background-clip:text;background-clip:text;color:transparent;filter:drop-shadow(0 0 26px rgba(232,140,80,.35)) drop-shadow(0 3px 3px rgba(20,10,4,.6))}
.s{margin-top:18px;font-size:${c.sub}px;font-weight:700;color:rgba(255,243,216,.92);letter-spacing:.06em;text-shadow:0 2px 12px rgba(0,0,0,.7)}
.brand{position:absolute;right:${lay === 'tall' ? 70 : 84}px;bottom:${lay === 'tall' ? 70 : 64}px;display:flex;align-items:center;gap:12px;font-weight:700;font-size:24px;letter-spacing:.3em;color:rgba(255,243,216,.85);text-shadow:0 1px 8px rgba(0,0,0,.7)}
.brand img{width:44px;height:44px;opacity:.9;transform:rotate(-6deg)}
</style></head><body><img class="art" src="${art}"><div class="v"></div>
<div class="t"><div class="k">圆明园 · 十二兽首</div><div class="l1">有人花<span class="n">6910</span>万港元买下</div><div class="l2">却捐了</div><div class="s">十二个，到底回来了几个<span style="margin-right:-.5em">？</span></div></div>
<div class="brand"><img src="${seal}">VIBE知识大赏</div></body></html>`; };
const b = await chromium.launch();
for (const lay of ['wide', 'tall']) {
	const c = L[lay]; const p = await b.newPage({viewport: {width: c.W, height: c.H}});
	await p.setContent(page(lay)); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(300);
	const name = `cover45_${lay === 'tall' ? '竖版3x4' : '横版4x3'}.png`; await p.screenshot({path: path.join(OUT, name)}); console.log(name); await p.close();
}
await b.close();
