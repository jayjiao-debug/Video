// Scenes 01–02: the hook take (frame 0 silk → pull back onto the dusk crest → rolled up, carried off right, lanterns die)
// and the title band slamming open on the 9.05 drop over the defocused night crest.
import {Stage, Live, bar, BEAT, clamp01, smooth, easeInOut, easeOut, lerp, mkCanvas, canvasTex, hash} from './core';
import {Crest, deck} from './crest';
import {addScene} from './film';
import {Cast, look, drawRoller, drawRoll, glowBlob, rig, drawCarriedRoll} from './actors';
import {POSES, walkFor, underArm, underArmRoll, toScreen, FigOpts, gaitStride, stepFor, armsFrom} from './figures';
import {paintSection, silkWeave, paintRiverSprites} from './silk';
import {titleInk} from './hud';

const b = bar;
let riverBase: HTMLCanvasElement, riverFrame: HTMLCanvasElement, sprites: ReturnType<typeof paintRiverSprites>, lastSpriteKey = '';
let crest: Crest, nightCrest: Crest, cast: Cast, silk: Live, rollers: Live, rollGlow: Live, river: HTMLCanvasElement, titleSt: Stage, band: Live, bandCv: HTMLCanvasElement, ink: Live, inkCv: HTMLCanvasElement;
// the open silk in world px (CR-A two-shot)
const SX0 = 700, SX1 = 1220, SY = 560, SH = 190;
export const bootOpen = async () => {
	crest = new Crest('open-dusk', {sky: 'dusk', era: 'none', lanterns: true, boat: true, bankCrowd: true});
	nightCrest = new Crest('title-night', {sky: 'night', era: 'none', lanterns: true, boat: false, bankCrowd: false});
	await Promise.all([crest.ready, nightCrest.ready]);
	river = paintSection('river', {width: 4096, height: 1536, mode: 'mono', mast: 0.25, seed: 43});
	riverBase = paintSection('river', {width: 4096, height: 1536, mode: 'mono', seed: 43, sprites: false});
	sprites = paintRiverSprites({width: 4096, height: 1536, mode: 'mono', seed: 43});
	riverFrame = mkCanvas(4096, 1536);
	cast = new Cast(crest.st, 'cast', 1200, 640, 2600, 1100, 20);
	silk = new Live(crest.st, 'silk', (SX0 + SX1) / 2, SY, SX1 - SX0 + 40, SH + 60, 22, {emissive: 0.32}, 5.6);
	rollers = new Live(crest.st, 'rollers', 1200, 640, 2600, 1100, 23, {rim: 0.0}, 1);
	rollGlow = new Live(crest.st, 'rollGlow', 1200, 640, 2600, 1100, 24, {emissive: 1.0}, 0.5);
	// title: a separate transparent stage drawn over the defocused night crest
	titleSt = new Stage('title'); titleSt.clearAlpha = 0;
	band = new Live(titleSt, 'band', 960, 580, 1700, 420, 0, {emissive: 0.2}, 1.4);
	ink = new Live(titleSt, 'ink', 960, 580, 1700, 420, 0, {}, 1.4, 2);          // the title ink on its own non-emissive layer: kept out of the glow pass
	bandCv = mkCanvas(1500, 330); const g = bandCv.getContext('2d')!; g.fillStyle = '#FFF3D8'; g.fillRect(0, 0, 1500, 330);
	g.globalAlpha = 0.12; g.drawImage(river, 0, 0, 4096, 1536, 0, -60, 1500 * 1.0, 1500 / 2.67); g.globalAlpha = 1; silkWeave(bandCv, 1);
	inkCv = mkCanvas(1500, 330); const gi = inkCv.getContext('2d')!;
	gi.fillStyle = '#2A1F17'; gi.textAlign = 'center'; gi.textBaseline = 'alphabetic';
	gi.font = '700 64px "Noto Serif CJK SC"'; (gi as any).letterSpacing = '22px'; gi.fillText('假如你是', 750 + 11, 110);
	gi.font = '900 170px "Noto Serif CJK SC"'; (gi as any).letterSpacing = '10px'; gi.fillText('清明上河图', 750 + 5, 282);
};

/** figures for the hook: A (left) and B (right) hold the silk; B ends up carrying the roll */
const lookA = look('songPainter'), lookB = look('yuanScholar');
const H = 560;
const XC = (SX0 + SX1) / 2 + 40;
const holders = (rollK: number) => {
	// rollK 0 = open, 1 = rolled up: both rollers wind in toward XC; the holders step in
	const k = smooth(rollK), xL = lerp(SX0, XC - 14, k), xR = lerp(SX1, XC + 14, k);
	const ax = xL - 108, bx = xR + 108;
	const A: FigOpts = {x: ax, ground: deck(ax) + 4, h: H, pose: POSES.stand, look: lookA};
	const Bf: FigOpts = {x: bx, ground: deck(bx) + 4, h: H + 10, pose: POSES.stand, look: lookB, flip: true};
	const a = rig(A, [{side: 'R', target: [xL, SY - 40]}, {side: 'L', target: [xL, SY + 42]}], deck, 'hookA');
	const bb = rig(Bf, [{side: 'R', target: [xR, SY - 40]}, {side: 'L', target: [xR, SY + 42]}], deck, 'hookB');
	return {A: a, B: bb, xL, xR};
};
/** walking off right from t0: B in front with the roll under his arm, A behind */
const walkers = (t: number, t0: number) => {
	const u = (t - t0) / (2 * BEAT), strideA = gaitStride('08_04', stepFor(lookA)) * H, strideB = gaitStride('08_04', stepFor(lookB)) * (H + 10);
	const xb = XC + 14 + 108 + 40 + u * strideB, xa = XC - 14 - 108 + 60 + u * strideA;
	let pb = walkFor(lookB, u + 0.5); pb = armsFrom(pb, underArm(pb), 'R');
	const B: FigOpts = rig({x: xb, ground: deck(xb) + 4, h: H + 10, pose: pb, look: lookB}, [], deck, 'walkB');
	const A: FigOpts = rig({x: xa, ground: deck(xa) + 4, h: H, pose: walkFor(lookA, u), look: lookA}, [], deck, 'walkA');
	const [r0, r1] = underArmRoll(B.pose, 'R', 0.29); return {A, B, roll: [toScreen(B, r0), toScreen(B, r1)] as [[number, number], [number, number]]};   // (drawn by drawCarriedRoll)
};

addScene({id: '01', a: 0, z: 8.96, draw: (t) => {
	const st = crest.st;
	// camera: frame 0 inside the silk (zoom 5.6 on the bridge), tracking right→left; pull back b0.75→b1; from b2.5 track right
	const zIn = 5.4, pull = easeInOut(clamp01((t - b(0.75)) / (b(1) - b(0.75))));
	const hold = t < b(0.5) ? t : b(0.5) + (t - b(0.5)) * 0.25;                       // half-beat wind-up hold
	const camInX = 1000 - hold * 9, camInY = SY;
	const tr = t < b(2.5) ? 0 : clamp01((t - b(2.5)) / (8.96 - b(2.5)));
	let camX = lerp(camInX, 960, pull), camY = lerp(camInY, 560, pull); const zoom = Math.exp(lerp(Math.log(zIn), 0, pull));
	if (tr > 0) { const w = walkers(8.96, b(2.5)); const hx = (w.roll[0][0] + w.roll[1][0]) / 2; camX = lerp(960, hx - 750, Math.pow(tr, 1.7)); }
	st.setCam(camX, camY, zoom);
	// the cast
	const rollK = clamp01((t - b(2)) / (BEAT * 1.6));
	const walking = t >= b(2.5);
	let figs: FigOpts[], hero: [number, number], rollPts: [[number, number], [number, number]] | null = null;
	if (!walking) { const h = holders(rollK); figs = [h.A, h.B]; hero = [(h.xL + h.xR) / 2, SY]; silkWin = [h.xL, h.xR]; }
	else { const w = walkers(t, b(2.5)); figs = [w.A, w.B]; rollPts = w.roll; hero = [(w.roll[0][0] + w.roll[1][0]) / 2, (w.roll[0][1] + w.roll[1][1]) / 2]; silkWin = null; }
	cast.draw(`${Math.round(t * 30)}`, figs);
	// the painted sprites (mast lowering, railing onlookers, cart) — already moving on frame 0, quicker from the first note
	const mastK = clamp01(0.08 + t * 0.03 + 0.55 * smooth(clamp01((t - 0.57) / 2.6))), railK = clamp01(0.15 + t * 0.05 + 0.8 * smooth(clamp01((t - 0.57) / 1.2))), cartK = clamp01(0.56 + t * 0.05);   // cart starts clear of the mast tip
	const sk = `${mastK.toFixed(3)}:${railK.toFixed(3)}:${cartK.toFixed(3)}`;
	if (sk !== lastSpriteKey && pull < 0.999) { lastSpriteKey = sk; const g = riverFrame.getContext('2d')!; g.drawImage(riverBase, 0, 0); sprites.cart(g, cartK); sprites.railing(g, railK); sprites.mast(g, mastK); }
	const src = pull < 0.999 ? riverFrame : river;
	silk.L.mat.uniforms.uEmissive.value = 0.32;
	silk.drawW(`${Math.round(t * 30)}`, (g) => { if (!silkWin) return; const [x0, x1] = silkWin; const w = x1 - x0; if (w < 3) return;
		g.save(); g.beginPath(); g.rect(x0, SY - SH / 2, w, SH); g.clip(); g.fillStyle = '#FFF3D8'; g.fillRect(x0, SY - SH / 2, w, SH);
		const srcW = src.width * (w / (SX1 - SX0)), sx = (src.width - srcW) / 2; g.drawImage(src, sx, 0, srcW, src.height, x0, SY - SH / 2, w, SH);
		g.fillStyle = 'rgba(52,80,106,0.9)'; g.fillRect(x0, SY - SH / 2, w, 9); g.fillRect(x0, SY + SH / 2 - 9, w, 9); g.restore(); });
	// carried: body (cast) → roll → near arm (rollers, emissive while you're carried) + your halo (swells 3 % on the breath 8.78 → 8.96)
	rollers.L.mat.uniforms.uEmissive.value = walking ? 0.55 : 0;
	rollers.drawW(`${Math.round(t * 30)}`, (g) => {
		if (silkWin) { drawRoller(g, silkWin[0], SY, SH + 24); drawRoller(g, silkWin[1], SY, SH + 24); }
		else if (rollPts) drawCarriedRoll(g, figs[1], 'carryB', 'R', 0.29, 13, 1);
	});
	const swell = 1 + 0.03 * smooth(clamp01((t - 8.78) / 0.18));
	rollGlow.drawW(`${Math.round(t * 60)}`, (g) => { if (!rollPts) return; glowBlob(g, hero, 95 * swell, 60 * swell, 0.42 * swell); });
	// lanterns: die in pairs from the palace side (left): b2.75, b3.0, 8.78
	const deadAt = [b(2.75), b(3.0), 8.78];
	crest.setLanterns((i, x) => { const rank = x < 500 ? 0 : x < 1000 ? 1 : 2; return t < deadAt[Math.min(2, rank)] ? 1 : 0; });
	crest.setBoat(1660, lerp(0, 70, smooth(clamp01((t - b(1.5)) / (BEAT * 2)))));
	crest.setStreak(hero[0], walking ? 0.5 : 0.8, t);
	st.heroAt(hero[0], hero[1], 22, walking ? 420 : 640);
	// the world dims as the lanterns die (your light, its rims and its streak don't): the sunset fades with them; a breath 8.78 → 8.96
	const dim = (1 - 0.6 * clamp01((t - b(2.75)) / (8.78 - b(2.75)))) * (1 - 0.2 * smooth(clamp01((t - 8.78) / 0.12)));
	const keep = new Set([rollers.L.mat, rollGlow.L.mat, silk.L.mat, crest.streak.L.mat]);
	for (const m of st.mats) if (!keep.has(m)) m.uniforms.uTint.value.setRGB(dim, dim * 0.97, dim * 0.95);
	st.get('sunglow').mat.uniforms.uOpacity.value = 1 - 0.8 * clamp01((t - b(2.75)) / (8.78 - b(2.75)));
	// lamplight on the insert: top band only (no chip / tally in scene 01), ending higher so the crowd and the cart stay lit; the
	// top mount band keeps its own colour (the darkening starts below it)
	const mountY = st.toScreen(st.at(960, SY - SH / 2 + 9, 22)).y;
	return {st, grade: {vig: lerp(0.55, 0.32, pull), exposure: 1, corners: 1 - pull, cornersBand: [Math.max(0, mountY + 1), 255, 445, 0]}, bloom: 1};
}});
let silkWin: [number, number] | null = null;

addScene({id: '02', a: 8.96, z: b(4.5), draw: (t) => {
	const st = nightCrest.st; st.setCam(1100, 560, 1); st.setHero(-9999, 0, 1); nightCrest.setLanterns(() => 0); nightCrest.setStreak(0, 0, t);
	// band: right roller at 1710; left roller flies to 210 by the hit (9.05), overshoot 12 px, damped jolt (2nd bounce b3.5)
	const xr = 1710; let xl: number;
	if (t < 9.05) xl = lerp(1700, 210, easeOut((t - 8.96) / 0.09));
	else { const u = t - 9.05; xl = 210 - 12 * Math.exp(-u * 7) * Math.cos(u * Math.PI / (b(3.5) - 9.05)); }
	let sc = t < 9.05 ? 1.04 : 1 + 0.04 * Math.exp(-(t - 9.05) * 6);
	if (t >= b(3.5)) { const u2 = t - b(3.5), k2 = Math.exp(-u2 / 0.1); xl -= 6 * k2 * Math.cos(u2 * 30); sc *= 1 + 0.015 * k2; }   // the loudest attack (9.37): its own kick
	const glint = clamp01(1 - Math.abs(t - b(4.0) - 0.25) / 0.25);
	band.L.mat.uniforms.uEmissive.value = 0.2;
	band.drawW(`${Math.round(t * 60)}`, (g) => {
		const cx = (xl + xr) / 2, w = (xr - xl) * sc, h = 330 * sc, x0 = cx - w / 2, y0 = 580 - h / 2;
		g.save(); g.beginPath(); g.rect(x0, y0, w, h); g.clip();
		// the band shows the title centred on the full open band (it unrolls over it)
		g.drawImage(bandCv, 960 - 750 * sc, 580 - 165 * sc, 1500 * sc, 330 * sc);
		if (glint > 0) { const gx = lerp(x0, x0 + w, (t - b(4.0)) / 0.5); const gr = g.createLinearGradient(gx - 80, 0, gx + 80, 0); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.5, `rgba(255,250,235,${0.5 * glint})`); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(x0, y0, w, h); }
		g.restore();
		g.fillStyle = 'rgba(52,80,106,0.95)'; g.fillRect(x0, y0, w, 12); g.fillRect(x0, y0 + h - 12, w, 12);
		drawRoller(g, x0, 580, h + 28, 22); drawRoller(g, x0 + w, 580, h + 28, 22);
	});
	ink.drawW(`${Math.round(t * 60)}`, (g) => {
		const cx = (xl + xr) / 2, w = (xr - xl) * sc, h = 330 * sc, x0 = cx - w / 2, y0 = 580 - h / 2;
		g.save(); g.beginPath(); g.rect(x0, y0 + 12, w, h - 24); g.clip(); g.drawImage(inkCv, 960 - 750 * sc, 580 - 165 * sc, 1500 * sc, 330 * sc); g.restore();
	});
	return {st: titleSt, under: st, blurUnder: 3.2, grade: {vig: 0.4, exposure: 1}, bloom: 0.8, hideSubs: false};
}});
