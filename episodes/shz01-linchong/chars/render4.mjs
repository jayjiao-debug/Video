import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
import fs from 'fs';
import { fullFront } from './fullbody2.mjs';
import { front, side, svg, EX } from './manhua.mjs';
const out = process.argv[2];
fs.mkdirSync(out, { recursive: true });
const css = `<style>body{margin:0;background:#1d1c1b;font-family:'Noto Sans CJK SC',sans-serif;color:#eee6d8}.row{display:flex;gap:16px;padding:10px 22px;align-items:flex-end}
.t{font-size:28px;font-weight:700;padding:18px 22px 2px}.c{display:flex;flex-direction:column;align-items:center}.c svg{display:block;border-radius:6px}.lb{font-size:20px;margin-top:6px;color:#cfc6b6}</style>`;
const cell = (s, label, w, h) => `<div class="c"><div style="width:${w}px;height:${h}px">${s.replace('<svg ', `<svg width="${w}" height="${h}" `)}</div><div class="lb">${label}</div></div>`;
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1500, height: 1000 } });
const html = `<html><head><meta charset="utf-8">${css}</head><body><div class="t">林冲 · 国风漫画 · 全身（约 7.5 头身）</div><div class="row">
${cell(fullFront(EX['平静']), '全身 · 正面', 440, 880)}${cell(svg(front(EX['平静'])), '正面特写', 420, 560)}${cell(svg(side(EX['平静'])), '侧面特写', 420, 560)}</div></body></html>`;
await p.setContent(html, { waitUntil: 'load' });
await p.screenshot({ path: out + '/mh_full.png', fullPage: true });
await b.close();
console.log('ok');
