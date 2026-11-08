// node render3.mjs <outdir> [test]: 国风漫画 face sheets
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
import fs from 'fs';
import path from 'path';
import { front, side, svg, EX } from './manhua.mjs';

const out = process.argv[2] || '.';
const mode = process.argv[3] || 'sheet';
fs.mkdirSync(out, { recursive: true });
const css = `<style>body{margin:0;background:#1d1c1b;font-family:'Noto Sans CJK SC',sans-serif;color:#eee6d8}
.row{display:flex;gap:16px;padding:10px 22px;align-items:flex-end}.t{font-size:28px;font-weight:700;padding:18px 22px 2px}
.c{display:flex;flex-direction:column;align-items:center}.c svg{display:block;border-radius:6px}.lb{font-size:20px;margin-top:6px;color:#cfc6b6}</style>`;
const cell = (s, label, w, h) => `<div class="c"><div style="width:${w}px;height:${h}px">${s.replace('<svg ', `<svg width="${w}" height="${h}" `)}</div><div class="lb">${label}</div></div>`;
async function shot(html, file, w, h) {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: w, height: h } });
  await p.setContent(html, { waitUntil: 'load' });
  await p.screenshot({ path: file, fullPage: true });
  await b.close();
}
if (mode === 'test') {
  const html = `<html><head><meta charset="utf-8">${css}</head><body><div class="row">${cell(svg(front(EX['平静'])), '正面', 600, 800)}${cell(svg(side(EX['平静'])), '侧面', 600, 800)}</div></body></html>`;
  await shot(html, path.join(out, 'mh_test.png'), 1260, 860);
} else {
  const row1 = cell(svg(front(EX['平静'])), '正面特写', 480, 640) + cell(svg(side(EX['平静'])), '侧面特写', 480, 640);
  const row2 = ['平静', '隐忍', '怒', '悲'].map((k) => cell(svg(front(EX[k]), '#ece6db', '120 180 360 480'), k, 240, 320)).join('') +
    ['隐忍', '怒'].map((k) => cell(svg(side(EX[k]), '#ece6db', '180 180 360 480'), '侧 · ' + k, 240, 320)).join('');
  const html = `<html><head><meta charset="utf-8">${css}</head><body><div class="t">林冲 · 国风漫画脸（新画法）</div><div class="row">${row1}</div>
<div class="t" style="font-size:22px">小幅度表情</div><div class="row">${row2}</div></body></html>`;
  await shot(html, path.join(out, 'mh_sheet.png'), 1560, 1100);
}
console.log('ok');
