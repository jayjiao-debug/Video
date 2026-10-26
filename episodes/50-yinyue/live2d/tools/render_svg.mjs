import { createRequire } from 'module'; const { chromium } = createRequire('/home/claude/video/episodes/50-yinyue/three/x.js')('playwright');
import fs from 'fs';
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1024, height: 1024 } });
for (const f of process.argv.slice(2)) { const s = fs.readFileSync(f, 'utf8').replace(/<svg([^>]*)>/, '<svg$1 width="1024" height="1024" viewBox="0 0 2048 2048">').replace(/width="2048" height="2048"/, '');
	await p.setContent(`<html><body style="margin:0;background:#fff">${s}</body></html>`); await p.screenshot({ path: f.replace('.svg', '.png') }); }
await b.close();
