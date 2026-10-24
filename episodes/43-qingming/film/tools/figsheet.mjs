// node tools/figsheet.mjs   — contact sheet for src/figures.ts: every look × 4 poses on a ground line, plus two-person
// scenes whose hands are aimed with reach() at real prop points. Writes tools/figsheet.png and prints contact errors.
import {build} from 'esbuild'; import {chromium} from 'playwright-core';
import fs from 'fs'; import os from 'os'; import path from 'path'; import {fileURLToPath, pathToFileURL} from 'url';
const here = path.dirname(fileURLToPath(import.meta.url)), root = path.resolve(here, '..');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'figsheet-')), bundle = path.join(tmp, 'figures.mjs');
let worst = 0; const errs = [];
try {
	await build({entryPoints: [path.join(root, 'src/figures.ts')], bundle: true, format: 'esm', platform: 'node', outfile: bundle, logLevel: 'error'});
	const F = await import(pathToFileURL(bundle).href);
	const {LOOKS, POSES, figureSVG, handAt, toBody, toScreen, reach, walkFor, gaitStride, stepFor, armsFrom, underArm, underArmRoll, armfulAt, carryScroll, holdOpen} = F;
	const f = (v) => v.toFixed(1), SIL = '#15100C', SILK = '#F3E6C4', ROLLER = '#3E5F8A', KNOB = '#EFE6D2', TABLE = '#8A7458', RED = '#E0402A';
	let svg = '';
	const dot = (p) => `<circle cx="${f(p[0])}" cy="${f(p[1])}" r="2.6" fill="${RED}"/>`;
	const check = (label, o, side, target) => { const g = handAt(o, side), e = Math.hypot(g[0] - target[0], g[1] - target[1]); errs.push([label, side, e]); worst = Math.max(worst, e); return dot(target); };
	const roller = (x, yc, len, w) => `<rect x="${f(x - w / 2)}" y="${f(yc - len / 2)}" width="${f(w)}" height="${f(len)}" rx="${f(w / 2)}" fill="${ROLLER}"/><ellipse cx="${f(x)}" cy="${f(yc - len / 2)}" rx="${f(w * 0.7)}" ry="${f(w * 0.35)}" fill="${KNOB}"/><ellipse cx="${f(x)}" cy="${f(yc + len / 2)}" rx="${f(w * 0.7)}" ry="${f(w * 0.35)}" fill="${KNOB}"/>`;
	const silk = (x0, x1, yc, len) => `<rect x="${f(Math.min(x0, x1))}" y="${f(yc - len * 0.42)}" width="${f(Math.abs(x1 - x0))}" height="${f(len * 0.84)}" fill="${SILK}"/>`;
	const roll = (a, b, w) => { const ang = Math.atan2(b[1] - a[1], b[0] - a[0]) * 180 / Math.PI, l = Math.hypot(b[0] - a[0], b[1] - a[1]);
		return `<g transform="translate(${f(a[0])},${f(a[1])}) rotate(${f(ang)})"><rect x="0" y="${f(-w / 2)}" width="${f(l)}" height="${f(w)}" rx="${f(w / 2)}" fill="${SILK}" stroke="#9C8A66" stroke-width="0.8"/><rect x="${f(-w * 0.25)}" y="${f(-w * 0.5)}" width="${f(w * 0.5)}" height="${f(w)}" fill="${ROLLER}"/><rect x="${f(l - w * 0.25)}" y="${f(-w * 0.5)}" width="${f(w * 0.5)}" height="${f(w)}" fill="${ROLLER}"/></g>`; };
	const ground = (x0, x1, y) => `<line x1="${f(x0)}" x2="${f(x1)}" y1="${f(y)}" y2="${f(y)}" stroke="#5A4A38" stroke-width="1.6"/>`;
	const text = (x, y, s, size = 13, anchor = 'start') => `<text x="${f(x)}" y="${f(y)}" font-size="${size}" font-family="Noto Sans CJK SC, Noto Sans, sans-serif" fill="#3A2E22" text-anchor="${anchor}">${s}</text>`;

	// ---- A: every look × 4 poses
	const looks = Object.keys(LOOKS), extra = ['bow', 'kneel', 'bendTable', 'carryArmful', 'crouch', 'lookUp', 'holdOpen', 'handOver', 'underArm', 'sit'];
	const CW = 205, RH = 300, h = 220, M = 24, perRow = 2;
	looks.forEach((name, li) => {
		const row = Math.floor(li / perRow), col0 = (li % perRow) * 4, gy = M + 40 + row * RH + 240;
		const look = LOOKS[name], poses = ['stand', 'walk', 'carryScroll', extra[li % extra.length]];
		svg += text(M + col0 * CW + 6, gy - 252, `<tspan font-weight="700">${name}</tspan>  ${look.head} · ${look.dress}${look.sleeves ? ' · ' + look.sleeves : ''}`, 14);
		poses.forEach((pn, k) => {
			const cx = M + (col0 + k) * CW + CW * 0.42, pose = pn === 'walk' ? walkFor(look, (li * 0.137) % 1) : POSES[pn], o = {x: cx, ground: gy, h, pose, look};
			let pre = '', post = '';
			pre += ground(cx - CW * 0.4, cx + CW * 0.52, gy);
			if (pn === 'carryScroll') { const a = handAt(o, 'R'), b = handAt(o, 'L'), L = 0.2 * h; pre += silk(a[0], b[0], (a[1] + b[1]) / 2, L); post += roller(a[0], a[1], L, 0.022 * h) + roller(b[0], b[1], L, 0.022 * h) + check(`${name}/carry`, o, 'R', a) + check(`${name}/carry`, o, 'L', b); }
			if (pn === 'bendTable') { const ty = gy - 0.47 * h; pre += `<rect x="${f(cx + 0.1 * h)}" y="${f(ty)}" width="${f(0.5 * h)}" height="${f(0.03 * h)}" fill="${TABLE}"/><rect x="${f(cx + 0.14 * h)}" y="${f(ty)}" width="${f(0.025 * h)}" height="${f(0.47 * h)}" fill="${TABLE}"/><rect x="${f(cx + 0.55 * h)}" y="${f(ty)}" width="${f(0.025 * h)}" height="${f(0.47 * h)}" fill="${TABLE}"/>`;
				for (const s of ['L', 'R']) { const g = handAt(o, s); post += dot([g[0], ty]); errs.push([`${name}/table-gap`, s, Math.abs(g[1] + 0.017 * h - ty)]); } }
			if (pn === 'carryArmful') { const {c, r} = armfulAt(pose), C = toScreen(o, c), R = r * h; for (const [dx, dy] of [[-0.5, 0.52], [0.18, 0.55], [0.72, 0.4], [-0.2, -0.05], [0.45, -0.12], [0.05, -0.6]]) { const a = [C[0] + dx * R, C[1] + dy * R]; post += `<circle cx="${f(a[0])}" cy="${f(a[1])}" r="${f(R * 0.36)}" fill="${SILK}" stroke="#9C8A66" stroke-width="0.8"/><circle cx="${f(a[0])}" cy="${f(a[1])}" r="${f(R * 0.13)}" fill="${ROLLER}"/>`; } }
			if (pn === 'crouch') { const g = handAt(o, 'R'); post += roll([g[0] - 0.09 * h, gy - 0.016 * h], [g[0] + 0.09 * h, gy - 0.016 * h], 0.032 * h); post += check(`${name}/crouch`, o, 'R', g); }
			if (pn === 'holdOpen') { const g = handAt(o, 'L'), L = 0.2 * h; pre += silk(g[0], g[0] + 0.5 * h, g[1], L); post += roller(g[0], g[1], L, 0.022 * h); }
			if (pn === 'handOver') { const a = handAt(o, 'R'), b = handAt(o, 'L'); post += roll([a[0] - 0.04 * h, a[1]], [b[0] + 0.12 * h, b[1]], 0.032 * h); }
			if (pn === 'underArm') { const [a, b] = underArmRoll(pose); post += roll(toScreen(o, a), toScreen(o, b), 0.03 * h); }
			if (pn === 'sit') pre += `<rect x="${f(cx - 0.12 * h)}" y="${f(gy - 0.33 * h)}" width="${f(0.24 * h)}" height="${f(0.33 * h)}" fill="${TABLE}"/>`;
			svg += pre + figureSVG(o) + post + text(cx, gy + 18, pn, 12, 'middle');
		});
	});
	const rowsA = Math.ceil(looks.length / perRow), yB = M + 40 + rowsA * RH + 30;

	// ---- B: two-person contact scenes (h = 430)
	const H2 = 430, gB = yB + 40 + H2 + 10; let bx = M + 20;
	svg += text(M, yB + 18, '<tspan font-weight="700">Two-person contact (reach() aimed at the rollers; red dots = targets)</tspan>', 15);
	{ // 1. open scroll between the craftsman and the 权贵, four hands on two rollers (scene 16)
		const A = {x: bx + 90, ground: gB, h: H2, flip: false, look: LOOKS.yuanCraftsman}, B = {x: bx + 90 + 0.95 * H2, ground: gB, h: H2, flip: true, look: LOOKS.yuanNoble};
		const yc = gB - 0.68 * H2, L = 0.21 * H2, r1 = [A.x + 0.3 * H2, yc], r2 = [B.x - 0.3 * H2, yc];
		const tA = [[r1[0], yc - 0.045 * H2], [r1[0], yc + 0.05 * H2]], tB = [[r2[0], yc - 0.045 * H2], [r2[0], yc + 0.05 * H2]];
		A.pose = reach(reach(POSES.holdOpen, 'L', toBody(A, tA[0])), 'R', toBody(A, tA[1]));
		B.pose = reach(reach(POSES.holdOpen, 'L', toBody(B, tB[0])), 'R', toBody(B, tB[1]));
		svg += ground(bx, B.x + 120, gB) + silk(r1[0], r2[0], yc, L) + figureSVG(A) + figureSVG(B) + roller(r1[0], yc, L, 0.022 * H2) + roller(r2[0], yc, L, 0.022 * H2);
		svg += check('open/A', A, 'L', tA[0]) + check('open/A', A, 'R', tA[1]) + check('open/B', B, 'L', tB[0]) + check('open/B', B, 'R', tB[1]);
		svg += text((A.x + B.x) / 2, gB + 22, 'open scroll held between two (4 hands, 2 rollers)', 13, 'middle'); bx = B.x + 150;
	}
	{ // 2. closed roll handed over: 陆完 (方巾) → friend; giver's two hands on the left half, receiver's on the right half
		const A = {x: bx + 70, ground: gB, h: H2, look: LOOKS.mingScholar}, B = {x: bx + 70 + 0.78 * H2, ground: gB, h: H2, flip: true, look: {...LOOKS.mingScholar, head: 'futou', beard: 'short'}};
		const y = gB - 0.66 * H2, a0 = [A.x + 0.2 * H2, y], b0 = [B.x - 0.2 * H2, y], tA = [[a0[0] + 0.05 * H2, y], [a0[0] + 0.12 * H2, y]], tB = [[b0[0] - 0.05 * H2, y], [b0[0] - 0.12 * H2, y]];
		A.pose = reach(reach(F.POSES.handOver, 'R', toBody(A, tA[0])), 'L', toBody(A, tA[1])); B.pose = reach(reach(F.POSES.handOver, 'R', toBody(B, tB[0])), 'L', toBody(B, tB[1]));
		svg += ground(bx, B.x + 110, gB) + figureSVG(A) + figureSVG(B) + roll([a0[0] - 0.0 * H2, y], [b0[0], y], 0.034 * H2);
		svg += check('hand/A', A, 'R', tA[0]) + check('hand/A', A, 'L', tA[1]) + check('hand/B', B, 'R', tB[0]) + check('hand/B', B, 'L', tB[1]);
		svg += text((A.x + B.x) / 2, gB + 22, 'closed roll handed over (4 hands on the roll)', 13, 'middle'); bx = B.x + 140;
	}
	{ // 3. painter rolls up → official takes it (both hands on two rollers, carryScroll targets from screen)
		const A = {x: bx + 70, ground: gB, h: H2, look: LOOKS.songPainter}, B = {x: bx + 70 + 0.86 * H2, ground: gB, h: H2, flip: true, look: LOOKS.songOfficial};
		const y = gB - 0.7 * H2, r1 = [A.x + 0.22 * H2, y], r2 = [B.x - 0.27 * H2, y], L = 0.2 * H2;
		A.pose = carryScroll({near: toBody(A, [r1[0] - 0.0 * H2, y + 0.04 * H2]), far: toBody(A, [r1[0], y - 0.05 * H2])});
		B.pose = holdOpen({at: toBody(B, [r2[0], y - 0.04 * H2]), both: true});
		svg += ground(bx, B.x + 160, gB) + silk(r1[0], r2[0], y, L) + figureSVG(A) + figureSVG(B) + roller(r1[0], y, L, 0.022 * H2) + roller(r2[0], y, L, 0.022 * H2);
		svg += check('song/A', A, 'R', [r1[0], y + 0.04 * H2]) + check('song/A', A, 'L', [r1[0], y - 0.05 * H2]) + check('song/B', B, 'L', [r2[0], y - 0.04 * H2]) + check('song/B', B, 'R', [r2[0], y - 0.04 * H2 + 0.075 * H2]);
		svg += text((A.x + B.x) / 2, gB + 22, '宋: one roller in both hands each', 13, 'middle'); bx = B.x + 190;
	}
	{ // 4. eunuch walking (gait) with the roll under his arm; 4 phases with a stride advance
		const h4 = 330;
		for (let i = 0; i < 4; i++) { const u = i * 0.25, o = {x: bx + 40 + i * 0.62 * h4, ground: gB, h: h4, look: LOOKS.mingEunuch, pose: armsFrom(walkFor(LOOKS.mingEunuch, u), underArm(), 'R')};
			const [a, b] = underArmRoll(o.pose); svg += figureSVG(o) + roll(toScreen(o, a), toScreen(o, b), 0.03 * h4); }
		svg += ground(bx, bx + 4 * 0.62 * h4 + 40, gB) + text(bx + 2 * 0.62 * h4, gB + 22, 'eunuch walking, roll under the arm (gait phases 0 .25 .5 .75)', 13, 'middle');
		bx += 4 * 0.62 * h4 + 70;
	}
	const W = Math.max(M * 2 + 8 * CW, bx + 20), Ht = gB + 50;
	const html = `<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;background:#D8CBB2}</style></head><body><svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${Ht}" viewBox="0 0 ${W} ${Ht}"><rect width="100%" height="100%" fill="#D8CBB2"/>${svg}</svg></body></html>`;
	const b = await chromium.launch({executablePath: process.env.CHROME || '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell', args: ['--no-sandbox']});
	const pg = await b.newPage({viewport: {width: Math.ceil(W), height: Math.ceil(Ht)}});
	await pg.setContent(html); await pg.screenshot({path: path.join(here, 'figsheet.png'), fullPage: true}); await b.close();
	const bad = errs.filter((e) => e[2] > 1.0);
	console.log(`contacts checked: ${errs.length}, worst error ${worst.toFixed(2)} px${bad.length ? '' : ' (all ≤ 1 px)'}`);
	for (const e of bad) console.log('  MISS', e[0], e[1], e[2].toFixed(1), 'px');
	console.log('sheet', path.join(here, 'figsheet.png'), `${W}×${Ht}`);
} finally { fs.rmSync(tmp, {recursive: true, force: true}); }
