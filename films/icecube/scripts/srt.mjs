// Write the subtitle file for post-production from SUBS in src/lib.ts: node scripts/srt.mjs out/筛子.srt
import fs from 'fs';
const src = fs.readFileSync(new URL('../src/lib.ts', import.meta.url), 'utf8');
const block = src.slice(src.indexOf('export const SUBS'), src.indexOf('];', src.indexOf('export const SUBS')));
const rows = [...block.matchAll(/\[([\d.]+),\s*([\d.]+),\s*'([^']*)'\]/g)].map((m) => [Number(m[1]), Number(m[2]), m[3]]);
const ts = (t) => { const ms = Math.round(t * 1000), h = Math.floor(ms / 3600000), m = Math.floor(ms / 60000) % 60, s = Math.floor(ms / 1000) % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')},${String(ms % 1000).padStart(3, '0')}`; };
const out = rows.map(([a, z, t], i) => `${i + 1}\n${ts(a)} --> ${ts(z)}\n${t}\n`).join('\n');
fs.writeFileSync(process.argv[2], out, 'utf8');
console.log(rows.length, 'subtitles →', process.argv[2]);
