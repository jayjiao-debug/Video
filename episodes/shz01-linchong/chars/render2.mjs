// node render2.mjs <outdir>: 林冲 signature look (风雪山神庙) sheets
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
import fs from 'fs';
import path from 'path';
import { frontSVG, sideSVG } from './styles.mjs';
import { fullFront, fullSide } from './fullbody.mjs';
import { EXPR, NEUTRAL } from './geom.mjs';

const out = process.argv[2] || '.';
fs.mkdirSync(out, { recursive: true });
const SIGN = { ...NEUTRAL, browIn: -0.35, eye: 0.9, look: [0, 0.15], mouth: -0.15 };
const css = `<style>body{margin:0;background:#1d1c1b;font-family:'Noto Sans CJK SC',sans-serif;color:#eee6d8}
.row{display:flex;gap:16px;padding:10px 22px;align-items:flex-end}.t{font-size:28px;font-weight:700;padding:18px 22px 2px}
.c{display:flex;flex-direction:column;align-items:center}.c svg{display:block;border-radius:6px}.lb{font-size:20px;margin-top:6px;color:#cfc6b6}</style>`;
const cell = (svg, label, w, h) => `<div class="c"><div style="width:${w}px;height:${h}px">${svg.replace('<svg ', `<svg width="${w}" height="${h}" `)}</div><div class="lb">${label}</div></div>`;

async function shot(html, file, w, h) {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: w, height: h } });
  await p.setContent(html, { waitUntil: 'load' });
  await p.screenshot({ path: file, fullPage: true });
  await b.close();
}

const face = (st, E) => frontSVG(st, E, { hat: true, tattoo: true, costume: 'snow', vb: '90 80 620 740' });
const faceSide = (st, E) => sideSVG(st, E, { hat: true, tattoo: true, costume: 'snow', vb: '120 80 620 740' });
for (const st of ['B', 'P']) {
  const name = st === 'B' ? '国潮描边' : '暗夜海报';
  const row1 = cell(face(st, SIGN), '正面特写', 360, 430) + cell(faceSide(st, SIGN), '侧面特写', 360, 430) +
    cell(fullFront(st, SIGN), '全身 · 正面', 300, 600) + cell(fullSide(st, SIGN), '全身 · 侧面', 300, 600) +
    cell(fullFront(st, SIGN, { silhouette: true }), '剪影', 150, 300) + cell(fullSide(st, SIGN, { silhouette: true }), '剪影', 150, 300);
  const row2 = ['平静', '隐忍', '怒', '悲'].map((k) => cell(face(st, k === '平静' ? SIGN : EXPR[k]), k, 250, 300)).join('');
  const html = `<html><head><meta charset="utf-8">${css}</head><body><div class="t">林冲 · 风雪山神庙造型 · ${name}</div><div class="row">${row1}</div>
<div class="t" style="font-size:22px">小幅度表情</div><div class="row">${row2}</div></body></html>`;
  await shot(html, path.join(out, `sign_${st}.png`), 1840, 1100);
}
console.log('ok');
