// node render.mjs <outdir> [mode]   mode: sheet (default) | test <style>
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
import { frontSVG, sideSVG } from './styles.mjs';
import { EXPR } from './geom.mjs';
import fs from 'fs';
import path from 'path';

const out = process.argv[2] || '.';
const mode = process.argv[3] || 'sheet';
fs.mkdirSync(out, { recursive: true });

const NAMES = { A: 'A · 扁平几何', B: 'B · 国潮描边', C: 'C · 半写实', D: 'D · Q版' };
const cell = (svg, label, w = 300) => `<div class="c"><div class="im" style="width:${w}px;height:${Math.round(w * 760 / 560)}px">${svg}</div><div class="lb">${label}</div></div>`;

async function shot(html, file, width, height) {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
  await page.setContent(html, { waitUntil: 'load' });
  await page.screenshot({ path: file, fullPage: true });
  await browser.close();
}

const css = `<style>body{margin:0;background:#1d1c1b;font-family:'Noto Sans CJK SC',sans-serif;color:#eee6d8}
.row{display:flex;gap:16px;padding:14px 22px;align-items:flex-start}.title{font-size:30px;font-weight:700;padding:18px 22px 0}
.c{display:flex;flex-direction:column;align-items:center}.im svg{width:100%;height:100%;display:block;border-radius:6px}
.lb{font-size:20px;margin-top:6px;color:#cfc6b6}.sub{font-size:20px;color:#a8a090;padding:4px 22px 0}</style>`;

if (mode === 'test') {
  const st = process.argv[4] || 'B';
  const html = `<html><head><meta charset="utf-8">${css}</head><body><div class="row">${cell(frontSVG(st, EXPR['平静']), '正面', 560)}${cell(sideSVG(st, EXPR['平静']), '侧面', 560)}</div></body></html>`;
  await shot(html, path.join(out, `test_${st}.png`), 1200, 900);
} else if (mode === 'style') {
  // one sheet per style: big front, three expressions, big side
  for (const st of ['A', 'B', 'C', 'D']) {
    const big = cell(frontSVG(st, EXPR['平静']), '正面特写 · 平静', 520);
    const ex = ['隐忍', '怒', '悲'].map((k) => cell(frontSVG(st, EXPR[k]), k, 250)).join('');
    const sd = cell(sideSVG(st, EXPR['平静']), '侧面', 520);
    const html = `<html><head><meta charset="utf-8">${css}</head><body><div class="title">林冲 · ${NAMES[st]}</div>
<div class="row">${big}<div style="display:flex;flex-direction:column;gap:10px">${ex}</div>${sd}</div></body></html>`;
    await shot(html, path.join(out, `style_${st}.png`), 1420, 900);
  }
} else {
  let rows = '';
  for (const st of ['A', 'B', 'C', 'D']) {
    const cells = ['平静', '隐忍', '怒', '悲'].map((k) => cell(frontSVG(st, EXPR[k]), k, 260)).join('') + cell(sideSVG(st, EXPR['平静']), '侧面', 260);
    rows += `<div class="title" style="font-size:26px">${NAMES[st]}</div><div class="row">${cells}</div>`;
  }
  await shot(`<html><head><meta charset="utf-8">${css}</head><body>${rows}</body></html>`, path.join(out, 'sheet_all.png'), 1440, 1860);
}
console.log('ok');
