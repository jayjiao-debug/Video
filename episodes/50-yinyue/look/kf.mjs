// ep50 music series, landscape key frames, look 「黑胶 · 节奏的形状」 (2026-10-26).
// Same teaching concepts as the owner's reference, reimagined: the beat lives on a spinning record (one turn = one bar),
// the playhead is a fixed beam at 12 o'clock, each instrument is one groove ring, and the hits joined up give the rhythm a shape.
// node kf.mjs <outdir>   → K1..K7 png (1920×1080)
import { createRequire } from 'module'; const { chromium } = createRequire(import.meta.url)('playwright');
import fs from 'fs';
import { W, H, INK, F, P, defs, finish, record, caption, chapter, stars } from './lib.mjs';
const OUT = process.argv[2] || '.'; fs.mkdirSync(OUT, { recursive: true });
const frames = {};
// K1 cold open: the first song you ever heard was your mother's heartbeat
frames.K1 = () => {
	let s = `<rect width="${W}" height="${H}" fill="#1a0f22"/><circle cx="1150" cy="560" r="620" fill="#4a1238" opacity=".55" filter="url(#soft)"/>`;
	// ripple rings from the heart, passing through the belly and out (the first record grooves)
	for (let i = 0; i < 7; i++) s += `<circle cx="1200" cy="380" r="${120 + i * 95}" fill="none" stroke="${INK.kick}" stroke-width="${6 - i * .6}" opacity="${.55 - i * .07}"/>`;
	// mother in profile, standing, facing left, a hand under the belly
	s += `<path fill="#0d0814" d="M1262 1080 L1262 900 C1268 820 1286 760 1290 700 C1296 640 1290 590 1272 540
		C1262 505 1262 470 1270 430 C1278 390 1282 350 1272 318 C1262 286 1246 270 1236 252
		C1258 248 1270 232 1274 210 C1280 176 1276 140 1252 118 C1226 94 1186 92 1160 110 C1136 126 1126 156 1130 180
		C1118 192 1110 204 1114 210 C1120 214 1128 212 1132 214 C1130 226 1134 236 1132 244 C1140 250 1150 252 1162 252
		C1166 266 1168 280 1164 296 C1150 320 1136 344 1128 372 C1120 404 1116 432 1112 452
		C1080 476 1050 516 1036 566 C1022 616 1028 668 1056 708 C1080 742 1118 760 1160 766
		C1150 830 1140 920 1136 1080 Z"/>`;
	// hair bun
	s += `<circle cx="1262" cy="128" r="46" fill="#0d0814"/>`;
	// arm: shoulder → elbow → hand cradling the belly
	s += `<path fill="none" stroke="#0d0814" stroke-width="44" stroke-linecap="round" stroke-linejoin="round" d="M1230 330 C1236 420 1226 520 1180 610 C1150 660 1110 690 1070 700"/>`;
	// warm glow inside the belly + the baby curled
	s += `<g><clipPath id="belly"><path d="M1112 452 C1080 476 1050 516 1036 566 C1022 616 1028 668 1056 708 C1080 742 1118 760 1160 766 L1250 760 L1268 470Z"/></clipPath>
		<g clip-path="url(#belly)"><circle cx="1130" cy="610" r="150" fill="${INK.kick}" opacity=".55" filter="url(#glow)"/>
		<path fill="#3a1030" opacity=".8" d="M1110 560 C1140 548 1176 566 1182 604 C1188 646 1160 680 1120 680 C1088 680 1068 656 1074 628 C1080 604 1100 600 1110 612 C1118 622 1112 636 1104 640"/>
		<circle cx="1112" cy="578" r="30" fill="#3a1030" opacity=".8"/></g></g>`;
	// heart: a small bright point in the chest
	s += `<circle cx="1200" cy="380" r="34" fill="${INK.kick}" opacity=".8" filter="url(#glow)"/><circle cx="1200" cy="380" r="12" fill="#fff"/>`;
	// lub-dub marks
	s += `<text x="1340" y="350" ${F} font-size="54" font-weight="900" fill="${INK.kick}" transform="rotate(8 1340 350)">咚</text><text x="1410" y="422" ${F} font-size="40" font-weight="900" fill="${INK.kick}" opacity=".7" transform="rotate(8 1410 422)">咚</text>`;
	s += `<text x="140" y="470" ${F} font-size="46" font-weight="700" fill="#fff" opacity=".75">你听过的第一首歌，</text>`;
	s += `<text x="140" y="580" ${F} font-size="96" font-weight="900" fill="#fff">是<tspan fill="${INK.kick}">妈妈的心跳</tspan></text>`;
	s += `<text x="140" y="660" ${F} font-size="34" font-weight="500" fill="#fff" opacity=".55">只有一个鼓，一直在打</text>`;
	return finish(s);
};
// K2 teach: tempo = how fast the record turns
frames.K2 = () => {
	let s = `<rect width="${W}" height="${H}" fill="${INK.ink}"/>` + chapter('01', '速度');
	s += caption(['一分钟打几下，就叫 ', { k: 'BPM' }]);
	s += record({ cx: 760, cy: 610, R: 360, rot: 0, rings: [{ f: .82, n: 4, hits: [0, 1, 2, 3], col: INK.kick, shape: true, size: .06, lab: { 0: '1', 1: '2', 2: '3', 3: '4' } }], label: { t: '72', sub: 'BPM' } });
	// right: the tempo dial (slow ↔ fast) with three real-world anchors
	const x0 = 1340, x1 = 1760, y = 470, lo = 50, span = 150;
	s += `<text x="${x0}" y="${y - 70}" ${F} font-size="30" font-weight="700" fill="#fff" opacity=".6">转得越快，BPM 越大</text>
		<rect x="${x0}" y="${y - 6}" width="${x1 - x0}" height="12" rx="6" fill="${INK.dim}"/><rect x="${x0}" y="${y - 6}" width="${(72 - lo) / span * (x1 - x0)}" height="12" rx="6" fill="${INK.kick}"/>
		<circle cx="${x0 + (72 - lo) / span * (x1 - x0)}" cy="${y}" r="22" fill="#fff"/>`;
	[[72, '心跳'], [115, '走路'], [170, '跑步']].forEach(([b, n], i) => { const x = x0 + (b - lo) / span * (x1 - x0);
		s += `<line x1="${x}" y1="${y + 24}" x2="${x}" y2="${y + 44}" stroke="#fff" opacity=".4" stroke-width="3"/><text x="${x}" y="${y + 86}" text-anchor="middle" ${F} font-size="30" font-weight="900" fill="${b === 72 ? INK.kick : '#fff'}" opacity="${b === 72 ? 1 : .6}">${b}</text>
		<text x="${x}" y="${y + 124}" text-anchor="middle" ${F} font-size="26" fill="#fff" opacity=".5">${n}</text>`; });
	// clap prompt
	s += `<rect x="1340" y="720" width="420" height="96" rx="48" fill="none" stroke="${INK.kick}" stroke-width="4"/><text x="1550" y="782" text-anchor="middle" ${F} font-size="42" font-weight="900" fill="#fff">跟着拍：<tspan fill="${INK.kick}">1</tspan>  2  3  4</text>`;
	return finish(s);
};
// K3 teach: strong/weak, told with Peking opera's 板 and 眼
frames.K3 = () => {
	let s = `<rect width="${W}" height="${H}" fill="${INK.ink}"/>` + chapter('02', '强与弱');
	s += caption(['京剧把强拍叫 ', { k: '板' }, '，弱拍叫 ', { k: '眼', c: INK.hat }]);
	s += record({ cx: 700, cy: 620, R: 350, rot: 0, rings: [{ f: .8, n: 4, hits: [0, 1, 2, 3], col: INK.kick, big: [0], shape: true, size: .055, lab: { 0: '板', 1: '眼', 2: '眼', 3: '眼' } }], label: { t: '4/4', size: .17 } });
	// the 拍板 (three hardwood boards; two tied together, the third swings in on 板)
	const hx = 1480, hy = 250, bw = 80, bh = 440;
	const board = (dx, a, c) => `<g transform="rotate(${a} ${hx} ${hy})"><rect x="${hx - bw / 2 + dx}" y="${hy - 20}" width="${bw}" height="${bh}" rx="12" fill="${c}"/>
		<rect x="${hx - bw / 2 + dx}" y="${hy - 20}" width="${bw}" height="${bh}" rx="12" fill="url(#htk)" opacity=".1"/>
		<path d="M${hx - 18 + dx} ${hy + 30} L${hx - 14 + dx} ${hy + bh - 60} M${hx + 8 + dx} ${hy + 60} L${hx + 12 + dx} ${hy + bh - 40}" stroke="#000" stroke-opacity=".15" stroke-width="3"/>
		<rect x="${hx - bw / 2 + 8 + dx}" y="${hy - 8}" width="10" height="${bh - 30}" rx="5" fill="#fff" opacity=".16"/><circle cx="${hx + dx}" cy="${hy + 8}" r="9" fill="#0b0a14"/></g>`;
	s += board(-26, 0, '#6e2c14') + board(0, 0, '#8a3b1e') + board(0, 24, '#a5502a');
	s += `<path d="M${hx - 34} ${hy + 8} C${hx - 10} ${hy - 40} ${hx + 30} ${hy - 30} ${hx + 20} ${hy + 8}" fill="none" stroke="${INK.kick}" stroke-width="8"/>
		<path d="M${hx - 30} ${hy + 4} C${hx - 70} ${hy + 40} ${hx - 80} ${hy + 110} ${hx - 60} ${hy + 160}" fill="none" stroke="${INK.kick}" stroke-width="5"/>`;
	// the swing: motion arcs from the open board back to the stack
	for (let i = 0; i < 3; i++) { const rr = bh - 60 - i * 70; const [ax, ay] = P(hx, hy, rr, 180 - 22), [bx, by] = P(hx, hy, rr, 180 - 6);
		s += `<path d="M${ax} ${ay} A${rr} ${rr} 0 0 1 ${bx} ${by}" fill="none" stroke="${INK.snare}" stroke-width="${7 - i * 2}" stroke-linecap="round" opacity="${.9 - i * .25}"/>`; }
	s += `<text x="${hx + 150}" y="${hy + bh - 40}" ${F} font-size="96" font-weight="900" fill="${INK.snare}" transform="rotate(-8 ${hx + 150} ${hy + bh - 40})">啪</text>`;
	s += `<text x="1300" y="880" ${F} font-size="76" font-weight="900" fill="#fff">一板三眼</text><text x="1302" y="950" ${F} font-size="40" font-weight="700" fill="#fff" opacity=".6">= 强 弱 弱 弱 = 4/4</text>`;
	return finish(s);
};
// K4 genre scene: 3/4, reimagined as skaters on a frozen lake under the moon
frames.K4 = () => {
	let s = `<rect width="${W}" height="${H}" fill="#101a3d"/>` + stars(140, 11, 520);
	s += `<circle cx="1420" cy="250" r="190" fill="${INK.snare}"/><circle cx="1420" cy="250" r="190" fill="url(#htk)" opacity=".12"/><circle cx="1420" cy="250" r="260" fill="${INK.snare}" opacity=".1" filter="url(#soft)"/>`;
	// far hills + pines
	s += `<path d="M0 560 C300 500 520 540 760 520 C1000 500 1300 560 1600 520 C1760 500 1860 520 1920 530 L1920 640 L0 640Z" fill="#1b2a5c"/>`;
	let k = 5; const r = () => (k = (k * 9301 + 49297) % 233280) / 233280;
	for (let i = 0; i < 46; i++) { const x = i * 44 + r() * 30, h = 70 + r() * 120, y = 600 + r() * 20;
		s += `<path d="M${x} ${y - h} L${x + h * .22} ${y} L${x - h * .22} ${y}Z" fill="#0b1230"/>`; }
	// the ice
	s += `<ellipse cx="960" cy="860" rx="1200" ry="300" fill="#bcd6ff"/><ellipse cx="960" cy="860" rx="1200" ry="300" fill="url(#ht)" opacity=".25"/>
		<ellipse cx="1420" cy="760" rx="160" ry="34" fill="#fff" opacity=".55"/>`;
	// skate trails: three loops, one big (强) and two small (弱)
	s += `<g fill="none" stroke="${INK.ink}" stroke-width="5" opacity=".55" stroke-linecap="round">
		<path d="M520 900 C420 780 700 740 760 830 C800 890 700 960 640 900"/><path d="M760 830 C820 740 980 770 960 850 C945 905 870 900 880 850"/>
		<path d="M960 850 C1010 770 1150 790 1130 860 C1115 910 1050 905 1060 860"/></g>`;
	[[620, 830, '强', 74, INK.kick], [905, 830, '弱', 52, INK.hat], [1090, 845, '弱', 52, INK.hat]].forEach(([x, y, t, z, c]) => s += `<text x="${x}" y="${y}" text-anchor="middle" ${F} font-size="${z}" font-weight="900" fill="${c}">${t}</text>`);
	// skater in an arabesque glide: standing leg, free leg stretched back, arms open, skirt flared (silhouette)
	const sx = 1220, sy = 790, sk = '#0b1230';
	s += `<g transform="translate(${sx} ${sy})"><ellipse cx="10" cy="6" rx="90" ry="12" fill="#000" opacity=".22"/>
		<path d="M-34 0 L34 0" stroke="#7d8db8" stroke-width="5" stroke-linecap="round"/><path d="M-14 -4 L18 -4 L16 -30 L-10 -30Z" fill="${sk}"/>
		<path fill="none" stroke="${sk}" stroke-width="24" stroke-linecap="round" d="M2 -24 L-2 -110 L-6 -190"/>
		<path fill="none" stroke="${sk}" stroke-width="22" stroke-linecap="round" d="M0 -190 L110 -224 L210 -250"/><path d="M200 -262 L236 -256 L232 -240 L206 -238Z" fill="${sk}"/>
		<path fill="${sk}" d="M-26 -196 C-34 -250 -30 -300 -14 -330 L22 -330 C34 -300 32 -250 24 -196Z"/>
		<path fill="${INK.kick}" d="M-30 -214 L28 -214 L104 -150 C60 -134 -60 -134 -104 -150Z"/>
		<path fill="none" stroke="${sk}" stroke-width="15" stroke-linecap="round" d="M-10 -318 C-60 -322 -120 -340 -176 -372 M14 -318 C70 -314 130 -304 186 -312"/>
		<path fill="${sk}" d="M-6 -330 L-4 -350 L12 -350 L14 -330Z"/><circle cx="4" cy="-378" r="27" fill="${sk}"/><circle cx="-16" cy="-398" r="14" fill="${sk}"/>
		<path fill="none" stroke="${INK.snare}" stroke-width="3" opacity=".75" d="M24 -200 C32 -250 34 -300 22 -330 M30 -372 C34 -390 24 -402 10 -405"/></g>`;
	// spin swirl
	s += `<path d="M1080 600 C1120 520 1330 520 1380 600" fill="none" stroke="#fff" stroke-width="4" opacity=".5" stroke-dasharray="2 14" stroke-linecap="round"/>`;
	// small record bottom-left: 3 beats → a triangle
	s += record({ cx: 300, cy: 860, R: 150, rot: 0, rings: [{ f: .8, n: 3, hits: [0, 1, 2], col: INK.kick, big: [0], shape: true, size: .08 }], label: { t: '3/4', size: .22 } });
	s += `<rect x="120" y="96" width="620" height="110" rx="14" fill="${INK.ink}" opacity=".82"/><text x="150" y="172" ${F} font-size="54" font-weight="900" fill="#fff">华尔兹 · <tspan fill="${INK.kick}">强</tspan> 弱 弱</text>`;
	return finish(s);
};
// K5 genre scene: one beat cut into four, reimagined as a rooftop basketball dribble (hats = dribbles, 808 = the dunk)
frames.K5 = () => {
	let s = `<rect width="${W}" height="${H}" fill="#2a1450"/><circle cx="960" cy="700" r="700" fill="#6a2b8a" opacity=".45" filter="url(#soft)"/>`;
	// skyline
	let k = 21; const r = () => (k = (k * 9301 + 49297) % 233280) / 233280; let x = 0;
	while (x < W) { const w = 60 + r() * 120, h = 160 + r() * 340; s += `<rect x="${x}" y="${640 - h}" width="${w}" height="${h + 10}" fill="#1a0c35"/>`;
		for (let wy = 640 - h + 20; wy < 620; wy += 34) for (let wx = x + 12; wx < x + w - 14; wx += 26) if (r() < .28) s += `<rect x="${wx}" y="${wy}" width="12" height="16" fill="${r() < .5 ? INK.snare : INK.hat}" opacity="${.35 + r() * .5}"/>`;
		x += w + 6; }
	// rooftop court
	s += `<path d="M0 640 L1920 640 L1920 1080 L0 1080Z" fill="#3b1d6e"/><path d="M0 640 L1920 640 L1920 1080 L0 1080Z" fill="url(#ht)" opacity=".06"/>
		<path d="M240 1080 L620 660 L1300 660 L1680 1080" fill="none" stroke="${INK.hat}" stroke-width="6" opacity=".5"/><ellipse cx="960" cy="780" rx="230" ry="60" fill="none" stroke="${INK.hat}" stroke-width="6" opacity=".5"/>`;
	// hoop
	s += `<rect x="1540" y="250" width="14" height="420" fill="#1a0c35"/><rect x="1440" y="230" width="200" height="140" rx="6" fill="#fff" opacity=".9"/><rect x="1500" y="290" width="80" height="60" fill="none" stroke="${INK.kick}" stroke-width="6"/>
		<ellipse cx="1500" cy="372" rx="62" ry="12" fill="none" stroke="${INK.kick}" stroke-width="8"/><path d="M1442 376 L1462 450 L1538 450 L1558 376" fill="none" stroke="#fff" stroke-width="3" opacity=".7"/>`;
	// player dribbling (silhouette), mid-crossover
	const px = 720, py = 960;
	s += `<g transform="translate(${px} ${py})" fill="#120826">
		<path d="M-60 0 L-30 -200 L30 -200 L80 0 L50 0 L10 -150 L-20 -150 L-30 0Z"/>
		<path d="M-50 -200 C-60 -280 -50 -350 -20 -390 L40 -390 C60 -350 60 -280 50 -200Z"/>
		<circle cx="10" cy="-430" r="36"/>
		<path fill="none" stroke="#120826" stroke-width="26" stroke-linecap="round" d="M40 -370 C100 -330 150 -260 190 -170 M-30 -370 C-80 -320 -110 -300 -150 -330"/></g>`;
	// ball + 4 ghost dribbles across one beat (1 e & a)
	const bx = [px + 190, px + 290, px + 390, px + 490];
	bx.forEach((xx, i) => { const last = i === 3, by = last ? py - 60 : py - 10;
		s += `<circle cx="${xx}" cy="${py + 6}" r="${last ? 46 : 30}" fill="${INK.hat}" opacity="${last ? .7 : .35}" filter="url(#glow)"/>`;
		s += `<circle cx="${xx}" cy="${by - 34}" r="34" fill="#ff8a3d" opacity="${last ? 1 : .25 + i * .12}"/>`;
		if (last) s += `<path d="M${xx - 34} ${by - 34} L${xx + 34} ${by - 34} M${xx} ${by - 68} L${xx} ${by}" stroke="#7a3a10" stroke-width="3"/>`;
		s += `<text x="${xx}" y="${py + 90}" text-anchor="middle" ${F} font-size="40" font-weight="900" fill="${INK.hat}" opacity="${last ? 1 : .6}">${['1', 'e', '&', 'a'][i]}</text>`; });
	// record bottom-left: outer kick ring + inner 16-step hat ring
	s += record({ cx: 300, cy: 860, R: 160, rot: -22.5 * 3, rings: [{ f: .86, n: 16, hits: [0, 6, 10], col: INK.kick, size: .065 }, { f: .58, n: 16, hits: [...Array(16).keys()], col: INK.hat, size: .04 }], label: { t: '16', size: .2 }, labelCol: INK.hat });
	s += `<rect x="120" y="96" width="760" height="110" rx="14" fill="${INK.ink}" opacity=".82"/><text x="150" y="172" ${F} font-size="54" font-weight="900" fill="#fff">一拍切四下 · <tspan fill="${INK.hat}">十六分音符</tspan></text>`;
	return finish(s);
};
// K6 teach: every rhythm has its own shape
frames.K6 = () => {
	let s = `<rect width="${W}" height="${H}" fill="${INK.ink}"/>` + chapter('06', '节奏的形状');
	s += caption(['每种节奏，都有自己的 ', { k: '形状' }]);
	const items = [[400, '4/4', '摇滚', 4, [0, 1, 2, 3], INK.kick], [960, '3/4', '华尔兹', 3, [0, 1, 2], INK.snare], [1520, '3+3+2', '雷鬼顿', 8, [0, 3, 6], INK.hat]];
	for (const [cx, lab, name, n, hits, col] of items) {
		s += record({ cx, cy: 600, R: 230, rot: 0, rings: [{ f: .8, n, hits, col, big: [0], shape: true, size: .07 }], label: { t: lab, size: lab.length > 3 ? .13 : .18 }, labelCol: col });
		s += `<text x="${cx}" y="935" text-anchor="middle" ${F} font-size="48" font-weight="900" fill="#fff">${name}</text>`;
	}
	s += `<text x="1520" y="990" text-anchor="middle" ${F} font-size="28" fill="#fff" opacity=".55">八格里只打三下，形状歪了，就“扭”了</text>`;
	return finish(s);
};
// K7 series title / finale: our song, every ring full
frames.K7 = () => {
	let s = `<rect width="${W}" height="${H}" fill="#0f0d22"/><circle cx="960" cy="560" r="600" fill="#3a1650" opacity=".5" filter="url(#soft)"/>`;
	s += record({ cx: 960, cy: 560, R: 400, rot: -10, now: false, rings: [
		{ f: .9, n: 16, hits: [0, 6, 8, 14], col: INK.kick, shape: true, size: .04 },
		{ f: .76, n: 16, hits: [4, 12], col: INK.snare, size: .045 },
		{ f: .63, n: 16, hits: [...Array(16).keys()].filter((i) => i % 2 === 0), col: INK.hat, size: .028 },
		{ f: .48, n: 16, hits: [0, 3, 6, 10, 11], col: INK.bass, shape: true, size: .035 }], label: { t: '从零', sub: '做一首歌', size: .17 } });
	s += `<text x="960" y="1030" text-anchor="middle" ${F} font-size="34" font-weight="700" fill="#fff" opacity=".7" letter-spacing="10">鼓 · 贝斯 · 和弦 · 旋律　一期加一层</text>`;
	[[1530, 300, '底鼓', INK.kick], [1530, 370, '军鼓', INK.snare], [1530, 440, '镲', INK.hat], [1530, 510, '贝斯', INK.bass]].forEach(([x, y, t, c]) =>
		s += `<circle cx="${x}" cy="${y - 14}" r="14" fill="${c}"/><text x="${x + 30}" y="${y}" ${F} font-size="36" font-weight="700" fill="#fff">${t}</text>`);
	return finish(s);
};

const browser = await chromium.launch(); const page = await browser.newPage({ viewport: { width: W, height: H } });
for (const [k, fn] of Object.entries(frames)) {
	await page.setContent(`<html><body style="margin:0;background:#000"><svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${defs}${fn()}</svg></body></html>`);
	await page.waitForTimeout(150); await page.screenshot({ path: `${OUT}/${k}.png` }); console.log(k);
}
await browser.close();
