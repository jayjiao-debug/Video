// Scenes 09–13 (group 'song'). 09: the 虹桥 painting draws itself on the painter's table, pull back to the 北宋 studio, he
// rolls you up and hands the roll to a court official. 10: the 宋 crest, dusk → fire: carried left into the palace, then
// your glow back out among refugee carts going right; push into the glow. 11: the painting's bare end (no signature).
// 12: 张著's colophon writes itself, pull back to 张著 at his desk. 13: 翰林张择端 lights up, 藏者宜宝之 one character per
// beat, pull back to the desk, 张著 pushes the roller: the roll-up wipe into scene 14 (ROLLUP_IN below).
// The paper on each table is a real plane (sb_kit Strip): every insert ⇄ room move is one camera move plus one tilt.
import * as THREE from 'three';
import {Stage, Live, Motes, bar, BEAT, W, H, D, clamp01, smooth, easeInOut, easeOut, easeIn, lerp, mkCanvas, canvasTex, gradCanvas, svgDoc, svgToCanvas, hash} from './core';
import {addScene, In} from './film';
import {Desk} from './rooms';
import {Crest, deck, SKIES, WATER} from './crest';
import {look, drawRoll, glowBlob, rig, Contact, drawFig} from './actors';
import {POSES, FigOpts, walkFor, gaitStride, gaitPose, armsFrom, stepFor, bow, handOver, fkPose, mixPose, toScreen, toBody, reach, LookQ} from './figures';
import {paintSection, silkWeave} from './silk';
import {hongqiao, railing, skyline, cityGate, hills, willow} from './draw';
import {Strip, ScreenLayer, texMat, revealMat, glyphMat, GlowData, dataTex, bigTex, blankLike, crop, strokeOrder, glyphOrder, rollerCanvas, woodCanvas,
	proj, onScreen, drawBrush, keyed, lerpP, P2, Mat} from './sb_kit';

const b = bar;
const PREV = 0.35;            // scenes draw a little before their start (incoming transitions)

// ================================================================================================ shared bits
/** the table's front: apron + legs + a low stretcher (frame px, depth 0) */
const tableFront = (x0: number, x1: number, top: number, floor: number, col = '#1b1510') => {
	const c = mkCanvas(W, H), g = c.getContext('2d')!;
	g.fillStyle = '#2a2018'; g.fillRect(x0, top - 2, x1 - x0, 8);
	g.fillStyle = col; g.fillRect(x0, top + 5, x1 - x0, 20);
	g.fillStyle = '#120d0a'; for (const x of [x0 + 60, x1 - 80]) g.fillRect(x, top + 20, 18, floor - 75 - top - 20);   // back legs (people behind the table stand on their line)
	g.fillStyle = col; for (const x of [x0 + 18, x1 - 44]) { g.fillRect(x, top + 20, 26, floor - top - 20); }
	g.fillRect(x0 + 30, floor - 70, x1 - x0 - 60, 10);
	g.fillStyle = 'rgba(255,214,150,0.10)'; g.fillRect(x0, top - 2, x1 - x0, 2);
	return c;
};
/** body clipped outside a screen polygon (the table top in front of it), the arms drawn whole on another layer */
const drawBodies = (g: CanvasRenderingContext2D, figs: FigOpts[], poly: P2[] | null) => {
	g.save();
	if (poly) { g.beginPath(); g.rect(-50, -50, W + 100, H + 100); g.moveTo(poly[0][0], poly[0][1]); for (const p of poly.slice(1)) g.lineTo(p[0], p[1]); g.closePath(); g.clip('evenodd'); }
	for (const f of figs) drawFig(g, f); g.restore();
};
const drawArms = (g: CanvasRenderingContext2D, figs: FigOpts[]) => { for (const f of figs) { drawFig(g, {...f, part: 'L'}); drawFig(g, {...f, part: 'R'}); } };
/** the figure placed in frame px at depth z, rigged in screen px (flat floor) */
const place = (st: Stage, o: FigOpts, z: number, c: Contact[], who: string) => { const s = onScreen(st, o, z); return rig(s, c, () => s.ground, who); };

// ================================================================================================ 09: the painter's table
const SC9 = 640 / 4096;                                       // river canvas px → world px
const S9 = {x0: 420, edge: 748, py0: 24, depth: 330};          // strip origin (front-left of the table top); paper local y 24…264
const T9 = {x0: 380, x1: 1240, floor: 1000};
const WIN9: [number, number] = [600, 3900];                     // the open window of the scroll on the table (canvas px)
const ZF9 = -300, TH_D = 1.36;
const lx9 = (cx: number) => cx * SC9, ly9 = (cy: number) => S9.py0 + (1536 - cy) * SC9;
/** frame px (depth 0) of a canvas point while the strip faces the camera */
const ins9 = (cx: number, cy: number): P2 => [S9.x0 + lx9(cx), S9.edge - ly9(cy)];
const lkPainter = look('songPainter'), lkOfficial = look('songOfficial');
let desk9: Desk, strip9: Strip, paper9: THREE.Mesh, paperMat9: Mat, rollL9: THREE.Mesh, rollR9: THREE.Mesh, top9: THREE.Mesh, trace9: THREE.Mesh, traceMat9: Mat;
let body9: ScreenLayer, props9: ScreenLayer;
/** the hand-over roll (screen px) at b14.5, measured at boot: scene 10 starts its carry there (match on action) */
export let HANDOFF: {c: P2; len: number} = {c: [790, 615], len: 200};

const CAM9_A = [...ins9(2300, 760), 6.4] as number[], CAM9_B = [...ins9(1850, 790), 5.8] as number[], CAM9_D = [960, 596, 1.0];
const cam9 = (t: number): {x: number; y: number; z: number; th: number} => {
	if (t < b(13.25)) return {x: CAM9_A[0], y: CAM9_A[1], z: CAM9_A[2], th: 0};
	if (t < b(14)) { const u = easeInOut((t - b(13.25)) / (b(14) - b(13.25))); return {x: lerp(CAM9_A[0], CAM9_B[0], u), y: lerp(CAM9_A[1], CAM9_B[1], u), z: Math.exp(lerp(Math.log(CAM9_A[2]), Math.log(CAM9_B[2]), u)), th: 0}; }
	const u = clamp01((t - b(14)) / (b(14.25) - b(14))), uz = easeInOut(u), ut = easeOut(Math.min(1, u * 1.2));
	const drift = clamp01((t - b(14.25)) / (b(14.5) - b(14.25)));
	return {x: lerp(CAM9_B[0], CAM9_D[0], uz) - 6 * drift, y: lerp(CAM9_B[1], CAM9_D[1], uz), z: Math.exp(lerp(Math.log(CAM9_B[2]), Math.log(CAM9_D[2]), uz)) * (1 + 0.012 * drift), th: TH_D * ut};
};
/** stroke-landing progress: an ink attack on each beat b13 … b14 */
const progL9 = (t: number) => { const steps = [[b(13.25), 0.32], [b(13.5), 0.52], [b(13.75), 0.74], [b(14), 1.06]]; let v = 0;
	for (const [tb, val] of steps) if (t >= tb) v = lerp(v, val, easeOut((t - tb) / 0.2)); return v; };
const P1 = b(14.25), P2t = b(14.375), P3 = b(14.5);
/** the window edges (local x) and the closed roll's local x */
const win9 = (t: number): [number, number] => { const k = smooth(clamp01((t - P1) / (P2t - P1))), M = lx9(3050); return [lerp(lx9(WIN9[0]), M - 9, k), lerp(lx9(WIN9[1]), M + 9, k)]; };

const build9 = async () => {
	desk9 = new Desk('song'); await desk9.ready; const st = desk9.st;
	st.get('desk').mesh.visible = false;
	const full = paintSection('river', {width: 4096, height: 1536, mode: 'mono', seed: 43});
	const blank = blankLike(full, (c) => silkWeave(c, 1, {mode: 'mono', seed: 43}));
	const order = dataTex(strokeOrder(1024, 384, 11, 0.1, 0.94));
	strip9 = new Strip(st, S9.x0, S9.edge, 0);
	top9 = strip9.plane(texMat(canvasTex(woodCanvas(1024, 256, '#3b2d21', '#22190f'))), T9.x0 - S9.x0, 0, T9.x1 - T9.x0, S9.depth, -2, -30);
	paperMat9 = revealMat(bigTex(full), bigTex(blank), order, 0.22);
	paper9 = strip9.plane(paperMat9, 0, S9.py0, 640, 240, 0, -29);
	const rc = canvasTex(rollerCanvas());
	rollL9 = strip9.plane(texMat(rc, 0.18), 0, S9.py0 - 8, 20, 256, 3, -27);
	rollR9 = strip9.plane(texMat(rc, 0.18), 0, S9.py0 - 8, 18, 256, 3, -27);
	// the traced crest (the stage becoming the painting): ink lines in screen px at the b13 camera, laid on the silk
	traceMat9 = texMat(canvasTex(await traceCanvas()), 0.1);
	const w0 = 1920 / CAM9_A[2], h0 = 1080 / CAM9_A[2];
	trace9 = strip9.plane(traceMat9, CAM9_A[0] - w0 / 2 - S9.x0, S9.edge - (CAM9_A[1] + h0 / 2), w0, h0, 1, -28.5);
	st.add('front9', canvasTex(tableFront(T9.x0, T9.x1, S9.edge, T9.floor)), 960, 540, W, H, 0, {rim: 0.8, rimPx: 5}, -10);
	body9 = new ScreenLayer(st, 'body9', ZF9, {rim: 1.0, rimPx: 6}, -20);
	props9 = new ScreenLayer(st, 'props9', 0, {emissive: 0.55, rim: 0.5, rimPx: 4}, -19);
	// measure the hand-over roll at b14.5 for scene 10's match
	{ const c = cam9(P3 - 1e-3); st.setCam(c.x, c.y, c.z); strip9.tilt(c.th); const r = heldRoll(P3 - 1e-3, win9(P3)); HANDOFF = {c: lerpP(r[0], r[1], 0.5), len: Math.hypot(r[1][0] - r[0][0], r[1][1] - r[0][1])}; }
};

/** the crest as ink on silk (screen px for camera (960,560,1)): arch, deck, railing, lanterns, far-bank roofline */
const traceCanvas = async () => {
	let s = hongqiao(960, 900, 1700, 1400) + railing(960, 906, 1700, 1400, 240, 116).svg;
	for (let x = 960 - 1700 * 1.12, i = 0; x <= 960 + 1700 * 1.12; x += 116, i++) if (i % 2 === 0) { const y = 900 + 500 * Math.min(1.4, ((x - 960) / 1700) ** 2) - 240 + 6; s += `<ellipse cx="${x}" cy="${y + 50}" rx="20" ry="27" fill="#15100C"/>`; }
	s = `<g transform="translate(0,-20)">${s}</g><g transform="translate(0,-8)">${hills(-400, 2400, 820, 90, 7)}${skyline(-300, 2300, 860, 40, 110, 11)}${cityGate(180, 860, 1.1)}${willow(700, 866, 230, 23)}${willow(1500, 866, 250, 25)}</g>`;
	s = s.replace(/fill="#15100C"/g, 'fill="rgba(42,31,23,0.06)" stroke="#2A1F17" stroke-width="2.4" stroke-linejoin="round"').replace(/fill="#1d1611"/g, 'fill="rgba(42,31,23,0.08)" stroke="#2A1F17" stroke-width="2.4"').replace(/stroke="#15100C"/g, 'stroke="#2A1F17"').replace(/fill="#000"/g, 'fill="none" stroke="#2A1F17" stroke-width="1.6" stroke-opacity="0.7"');
	const c = await svgToCanvas(svgDoc(s, W, H), W, H, 1); return c;
};

/** the roll in the painter's hands (screen px): from the closed roll's projected ends on the table → horizontal at chest height */
const heldRoll = (t: number, win: [number, number]): [P2, P2] => {
	const st = desk9.st, lift = clamp01((t - P2t) / (P3 - P2t)), lk = smooth(clamp01(lift / 0.55));
	const M = (win[0] + win[1]) / 2, a = strip9.screen(M, S9.py0 + 14, 9), f = strip9.screen(M, S9.py0 + 226, 9);
	const cx = lerp(860, 800, smooth(clamp01((lift - 0.45) / 0.55))), cc = proj(st, cx, 560, ZF9), half = (proj(st, cx + 100, 560, ZF9)[0] - cc[0]);
	const e0: P2 = [cc[0] - half, cc[1] + 3], e1: P2 = [cc[0] + half, cc[1] - 3];
	return [lerpP(f, e0, lk), lerpP(a, e1, lk)];
};
type S9State = {figs: FigOpts[]; roll: [P2, P2] | null; hero: P2; poly: P2[]; win: [number, number]; rollOnTable: boolean};
/** everything scene 09 needs at time t (camera + tilt already applied by the caller) */
const scene9State = (t: number): S9State => {
	const st = desk9.st, c = cam9(t); st.setCam(c.x, c.y, c.z); strip9.tilt(c.th);
	const win = win9(t), tableOn = c.th > 1.25;
	const poly = [strip9.screen(T9.x0 - S9.x0, 0), strip9.screen(T9.x1 - S9.x0, 0), strip9.screen(T9.x1 - S9.x0, S9.depth), strip9.screen(T9.x0 - S9.x0, S9.depth)];
	const figs: FigOpts[] = []; let roll: [P2, P2] | null = null;
	const near = (lx: number): P2 => strip9.screen(lx, S9.py0 + 14, 9), far = (lx: number): P2 => strip9.screen(lx, S9.py0 + 226, 9);
	const lift = clamp01((t - P2t) / (P3 - P2t)), lk = smooth(clamp01(lift / 0.55));
	// the painter: behind the table at its right part, facing left; bent over the right roller, then upright holding the roll out
	const xp = lerp(1065, 1000, smooth(clamp01((t - P1) / (P2t - P1)))) - 10 * lk;
	const bent = fkPose({hip: 0.63, hipX: -0.1, lean: 52, neck: -4, lt: 8, lk: 6, rt: 4, rk: 5, la: 30, le: 30, ra: 25, re: 25});
	const lean2 = fkPose({hip: 0.62, hipX: -0.12, lean: 62, neck: -6, lt: 10, lk: 8, rt: 5, rk: 6, la: 34, le: 30, ra: 28, re: 25});
	const roll0 = smooth(clamp01((t - P1) / (P2t - P1)));
	let pPose = mixPose(bent, lean2, roll0); if (lift > 0) pPose = mixPose(pPose, handOver(), lk);
	const painter: FigOpts = {x: xp, ground: T9.floor - 75, h: 560, pose: pPose, look: lkPainter, flip: true};
	const held = () => heldRoll(t, win);
	const pc: Contact[] = [];
	if (lift <= 0) { if (tableOn) { pc.push({side: 'R', target: strip9.screen(win[1], S9.py0 + 130, 9), name: 'roller middle'}); pc.push({side: 'L', target: far(win[1]), name: 'roller far end'}); } }
	else { roll = held(); const at = (s: number): P2 => lerpP(roll![0], roll![1], s);
		pc.push({side: 'R', target: at(lerp(0.48, 0.9, lk)), name: 'roll'}); pc.push({side: 'L', target: at(lerp(0.1, 0.62, lk)), name: 'roll'}); }
	figs.push(tableOn ? place(st, painter, ZF9, pc, 'painter09') : onScreen(st, painter, ZF9));
	// the court official: waits at the table's left end with a slight bow, steps in and takes the roll in both hands
	const take = clamp01((lift - 0.35) / 0.4), xo = lerp(540, 590, smooth(take));
	const oPose = take > 0 ? mixPose(bow(14), handOver(), smooth(take)) : bow(14);
	const official: FigOpts = {x: xo, ground: T9.floor - 75, h: 575, pose: oPose, look: lkOfficial};
	const oc: Contact[] = []; if (roll && take >= 1) { const at = (s: number): P2 => lerpP(roll![0], roll![1], s); oc.push({side: 'R', target: at(0.32), name: 'roll'}); oc.push({side: 'L', target: at(0.1), name: 'roll'}); }
	else if (roll && take > 0) { const at = (s: number): P2 => lerpP(roll![0], roll![1], s); const r0 = onScreen(st, official, ZF9); const fr = (side: 'L' | 'R', s: number) => lerpP(toScreen(r0, oPose[`${side}Hand`] as any), at(s), smooth(take));
		official.pose = oPose; figs.push(rigLoose(st, official, [['R', fr('R', 0.32)], ['L', fr('L', 0.1)]])); }
	if (!(roll && take > 0 && take < 1)) figs.push(tableOn ? place(st, official, ZF9, oc, 'official09') : onScreen(st, official, ZF9));
	const hero: P2 = roll ? lerpP(roll[0], roll[1], 0.5) : strip9.screen((win[0] + win[1]) / 2, S9.py0 + 120);
	return {figs, roll, hero, poly, win, rollOnTable: lift <= 0};
};
/** reach without logging (hands travelling between holds) */
const rigLoose = (st: Stage, o: FigOpts, targets: ['L' | 'R', P2][]) => { const s = onScreen(st, o, ZF9); let p = s.pose; for (const [side, tg] of targets) p = reach(p, side, toBody(s, tg)); return {...s, pose: p}; };

const draw9 = (t: number) => {
	const st = desk9.st, S = scene9State(t), c = cam9(t);
	// paper reveal + trace
	const pl = progL9(t), pw = Math.max(0, progL9(t - 0.32) * 0.97);
	paperMat9.uniforms.uProgL.value = pl; paperMat9.uniforms.uProgW.value = pw;
	const u0 = S.win[0] / 640, u1 = S.win[1] / 640; paperMat9.uniforms.uClip.value.set(u0, u1, -1, 2);
	traceMat9.uniforms.uOpacity.value = 1 - smooth(clamp01((t - b(13.25)) / (b(13.6) - b(13.25))));
	trace9.visible = t < b(13.65);
	paper9.visible = S.rollOnTable;
	// rollers: the rolled bulk at both window edges; one roll once closed; lifted off at P2
	strip9.place(rollL9, S.win[0] - 10, S9.py0 - 8, 20, 256, 3); strip9.place(rollR9, S.win[1] - 9, S9.py0 - 8, 18, 256, 3);
	rollL9.visible = rollR9.visible = S.rollOnTable;
	const fk = `${Math.round(t * 60)}`;
	body9.draw(fk, (g) => drawBodies(g, S.figs, S.poly));
	props9.draw(fk, (g) => {
		if (S.roll) { glowBlob(g, lerpP(S.roll[0], S.roll[1], 0.5), 170, 90, 0.32); drawRoll(g, S.roll[0], S.roll[1], 12 * c.z / 1.1, 1); }
		if (c.th > 1.15) drawArms(g, S.figs);
	});
	st.setHero(S.hero[0], S.hero[1], 1100);
	desk9.lamp.draw('off', () => {});
	const ins = 1 - clamp01((c.th - 0.2) / 0.9);
	return {st, grade: {vig: lerp(0.38, 0.6, ins), vigCol: '#1a120b', corners: 0.9 * ins, exposure: 1}, bloom: 1};
};
addScene({id: '09', a: b(13), z: b(14.5), draw: draw9, in: {mode: 2, a: b(13), z: b(13.25), dir: [-1, 0], soft: 0.05}});

// ================================================================================================ 10: the 宋 crest, dusk → fire
const ZC = 20;
let crest10: Crest, body10: ScreenLayer, props10: ScreenLayer, fireSky: any, fireRiver: any, fireGlow: any, fireHaze: any, smoke: any, embers: Motes;
const lkRef = look('refugee');
const build10 = async () => {
	crest10 = new Crest('song-dusk', {sky: 'dusk', era: '宋', lanterns: true, boat: true, bankCrowd: true}); await crest10.ready;
	const st = crest10.st, far = st.get('far'); st.place(far, far.cx + 560, far.cy);        // the 宋 gate at the frame's left edge
	fireSky = st.add('firesky', canvasTex(gradCanvas(SKIES.fire)), 960, 700, 9000, 3600, -8990, {opacity: 0});
	fireRiver = st.add('fireriver', canvasTex(gradCanvas(WATER.fire, 64, 1024)), 960, 860 + 700, 9000, 1400, -1399, {opacity: 0});
	const fg = mkCanvas(512, 256), g = fg.getContext('2d')!, gr = g.createRadialGradient(256, 256, 10, 256, 256, 256); gr.addColorStop(0, 'rgba(255,150,70,0.95)'); gr.addColorStop(0.4, 'rgba(226,96,44,0.55)'); gr.addColorStop(1, 'rgba(120,40,20,0)'); g.fillStyle = gr; g.fillRect(0, 0, 512, 256);
	fireGlow = st.add('fireglow', canvasTex(fg), 220, 800, 2600, 1100, -2700, {opacity: 0});
	fireHaze = st.add('firehaze', canvasTex(fg), 300, 860, 3400, 520, -2450, {opacity: 0, blending: THREE.AdditiveBlending});
	smoke = st.add('smoke', canvasTex(smokeCanvas()), 260, 470, 1800, 900, -2500, {opacity: 0});
	embers = new Motes(st, 160, 'ember', 300, 8, '#FFB06A', false);
	body10 = new ScreenLayer(st, 'body10', ZC, {rim: 1.0, rimPx: 6}, 20);
	props10 = new ScreenLayer(st, 'props10', ZC + 2, {emissive: 0.6, rim: 0.4, rimPx: 4}, 22);
};
const smokeCanvas = () => {
	const c = mkCanvas(900, 450), g = c.getContext('2d')!;
	for (let i = 0; i < 70; i++) { const x = 300 + hash(i * 3.3) * 380 + Math.pow(hash(i * 1.1), 0.5) * 240 * (1 - hash(i * 7.7)), y = 450 - Math.pow(hash(i * 5.1), 0.8) * 430, r = 30 + hash(i * 2.9) * 70 * (1 - y / 600);
		const gg = g.createRadialGradient(x, y, 0, x, y, r); gg.addColorStop(0, 'rgba(46,30,30,0.5)'); gg.addColorStop(1, 'rgba(46,30,30,0)'); g.fillStyle = gg; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); }
	return c;
};
const FIRE0 = b(15.25), FIRE1 = b(15.5);
/** the carrying pair: the front official holds the roll by both ends at chest height; the second walks a step behind */
const CSTEP = 0.7, CSPB = 2.0;                                          // a careful step (they carry you), 1.5 steps per beat
const carryH = () => Math.max(380, Math.min(520, (deck(HANDOFF_FRAME[0]) + 4 - HANDOFF_FRAME[1]) / 0.64));
const carryX = (t: number, h: number) => HANDOFF_FRAME[0] + 0.11 * h - ((t - P3) / (2 * BEAT)) * CSPB * gaitStride('08_04', CSTEP) * h;
let HANDOFF_FRAME: P2 = [790, 635];
/** the refugee column: x of the group's anchor (moving right) */
const REF0 = b(15.25), REFV = 1.3;                                      // appears with the fire (time-lapse), 1.3 steps per beat
const refX = (t: number, h: number) => { const str = gaitStride('08_04', stepFor(lkRef)) * h; return 620 + ((t - b(15.75)) / (2 * BEAT)) * REFV * str; };
const unproj = (st: Stage, sx: number, sy: number, z: number): P2 => {   // screen → frame px at depth z (camera without tilt)
	const c = st.cam, d = c.position.z, Xw = c.position.x + (sx - 960) * (d - z) / D, Yw = c.position.y - (sy - 540) * (d - z) / D;
	return [960 + Xw * D / (D - z), 540 - Yw * D / (D - z)];
};
/** a refugee handcart: wheel on the deck, shafts to the puller's hands; draws far wheel, bed, load, (front board, near wheel later) */
type Cart = {ax: number; ay: number; r: number; ang: number; bed: (s: number, up?: number) => P2; hand: P2};
const cartGeo = (ax: number, groundY: number, hand: P2, h: number): Cart => {
	const r = 0.15 * h, ay = groundY - r + 2, piv: P2 = [ax, ay - r * 0.25], ang = Math.atan2(hand[1] - piv[1], hand[0] - piv[0]);
	const ca = Math.cos(ang), sa = Math.sin(ang);
	const bed = (s: number, up = 0): P2 => [piv[0] + ca * s * h + sa * up * h, piv[1] + sa * s * h - ca * up * h];
	return {ax, ay, r, ang, bed, hand};
};
const wheel = (g: CanvasRenderingContext2D, x: number, y: number, r: number, rot: number, col = '#15100C') => {
	g.strokeStyle = col; g.lineWidth = r * 0.16; g.beginPath(); g.arc(x, y, r * 0.92, 0, Math.PI * 2); g.stroke(); g.lineWidth = r * 0.07;
	for (let i = 0; i < 6; i++) { const a = rot + i * Math.PI / 3; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * r * 0.9, y + Math.sin(a) * r * 0.9); g.stroke(); }
	g.fillStyle = col; g.beginPath(); g.arc(x, y, r * 0.16, 0, Math.PI * 2); g.fill();
};
const poly = (g: CanvasRenderingContext2D, pts: P2[], col: string) => { g.fillStyle = col; g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for (const p of pts.slice(1)) g.lineTo(p[0], p[1]); g.closePath(); g.fill(); };
const cartBack = (g: CanvasRenderingContext2D, c: Cart, h: number, load: 'bundles' | 'you') => {
	wheel(g, c.ax + 0.05 * h, c.ay - 0.012 * h, c.r * 0.96, c.ax / c.r, '#120d0a');
	const B = c.bed; poly(g, [B(-0.3, 0), B(0.36, 0), B(0.36, 0.035), B(-0.3, 0.035)], '#15100C');       // bed
	g.strokeStyle = '#15100C'; g.lineWidth = 0.022 * h; g.lineCap = 'round'; g.beginPath(); g.moveTo(...B(0.3, 0.02)); g.lineTo(c.hand[0], c.hand[1]); g.stroke();   // shafts
	poly(g, [B(-0.3, 0.03), B(-0.27, 0.03), B(-0.27, 0.15), B(-0.3, 0.15)], '#15100C');                     // tail board
	if (load === 'bundles') { for (const [s, rr, up] of [[-0.2, 0.08, 0.1], [0.0, 0.1, 0.12], [0.2, 0.075, 0.1], [-0.08, 0.07, 0.2]] as [number, number, number][]) { const p = B(s, up); g.fillStyle = '#1d1712'; g.beginPath(); g.ellipse(p[0], p[1], rr * h, rr * h * 0.72, c.ang, 0, Math.PI * 2); g.fill(); } }
	else { for (const [s, rr, up] of [[-0.22, 0.075, 0.1], [0.26, 0.07, 0.1]] as [number, number, number][]) { const p = B(s, up); g.fillStyle = '#1d1712'; g.beginPath(); g.ellipse(p[0], p[1], rr * h, rr * h * 0.72, c.ang, 0, Math.PI * 2); g.fill(); } }
};
const cartFront = (g: CanvasRenderingContext2D, c: Cart, h: number) => {
	const B = c.bed; poly(g, [B(-0.3, 0.0), B(0.36, 0.0), B(0.36, 0.1), B(-0.3, 0.1)], '#17110d');           // the near side board
	poly(g, [B(-0.3, 0.09), B(0.36, 0.09), B(0.36, 0.1), B(-0.3, 0.1)], 'rgba(60,40,26,0.9)');
	wheel(g, c.ax, c.ay, c.r, c.ax / c.r);
};
type Grp = {figs: FigOpts[]; carts: {c: Cart; load: 'bundles' | 'you'; puller: FigOpts}[]; you: [P2, P2] | null; hs: number};
/** the refugees (screen px), streaming right: a walker, two pullers with carts (the second carries you), a walker */
const refugees = (t: number, st: Stage): Grp => {
	const h = 440, ax = refX(t, h), u = (t - REF0) / (2 * BEAT) * REFV, out: Grp = {figs: [], carts: [], you: null, hs: h};
	if (t < REF0) return out;
	const gS = (sx: number) => { const p = unproj(st, sx, 0, ZC); return proj(st, p[0], deck(p[0]) + 4, ZC)[1]; };
	const member = (dx: number, du: number, kind: 'walk' | 'pull' | 'pullYou', who: string) => {
		const x = ax + dx; const o: FigOpts = {x, ground: deck(x) + 4, h: h + (hash(dx) - 0.5) * 30, pose: walkFor(lkRef, u + du), look: lkRef};
		const s = onScreen(st, o, ZC);
		if (kind === 'walk') { out.figs.push(rig(s, [], gS, who)); return; }
		// the puller: hands on the shaft ends at his hips, the cart behind him
		const sh = toScreen(s, s.pose.RSh as any), hand: P2 = [sh[0] - 0.07 * s.h, sh[1] + 0.3 * s.h]; const axw = x - 0.92 * o.h; const axS = proj(st, axw, deck(axw) + 4, ZC);   // hands at the hips, well inside arm reach
		const cg = cartGeo(axS[0], axS[1], [hand[0] - 2, hand[1] + 2], s.h);
		const f = rig(s, [{side: 'R', target: [hand[0] - 2, hand[1] + 2], name: 'shaft'}, {side: 'L', target: [hand[0] - 6, hand[1] + 3], name: 'shaft'}], gS, who);
		out.figs.push(f); out.carts.push({c: cg, load: kind === 'pullYou' ? 'you' : 'bundles', puller: f});
		if (kind === 'pullYou') { const B = cg.bed; out.you = [B(-0.22, 0.09), B(0.22, 0.1)]; out.hs = s.h; }
	};
	member(560, 0.35, 'walk', 'ref-lead'); member(300, 0.1, 'pullYou', 'ref-pull1'); member(-230, 0.6, 'pull', 'ref-pull2'); member(-650, 0.85, 'walk', 'ref-tail');
	return out;
};
const cam10 = (t: number, glow: P2 | null, st: Stage): [number, number, number] => {
	const base: [number, number, number] = [960, 560, 1];
	const u = clamp01((t - b(15.75)) / (b(16.15) - b(15.75)));
	if (u <= 0 || !glow) return base;
	const k = easeIn(u), z = Math.exp(lerp(0, Math.log(3.4), k));
	// centre the drifting glow: its frame px at the cast depth
	const g = glow; return [lerp(960, g[0], smooth(Math.min(1, u * 1.6))), lerp(560, g[1], smooth(Math.min(1, u * 1.6))), z];
};
const draw10 = (t: number) => {
	const st = crest10.st;
	// glow position in frame px (needs the group at t, measured at the base camera)
	st.setCam(960, 560, 1);
	const pre = refugees(t, st); let glowF: P2 | null = null;
	if (pre.you) { const m = lerpP(pre.you[0], pre.you[1], 0.5); glowF = unproj(st, m[0], m[1], ZC); }
	const [cx, cy, cz] = cam10(t, glowF, st); st.setCam(cx, cy, cz);
	const grp = refugees(t, st);
	// the carriers (screen px)
	const figs: FigOpts[] = []; let roll: [P2, P2] | null = null, cradle: FigOpts | null = null;
	const out = t < FIRE0 ? 1 : 0;                                           // hard cut on the sky change (b15.25): 1127
	if (out > 0) {
		const h = carryH(), x1 = carryX(t, h), u = (t - P3) / (2 * BEAT) * CSPB, x2 = x1 + 300 * h / 560;
		const gS = (sx: number) => { const p = unproj(st, sx, 0, ZC); return proj(st, p[0], deck(p[0]) + 4, ZC)[1]; };
		const o1: FigOpts = {x: x1, ground: deck(x1) + 4, h, pose: gaitPose('08_04', u, CSTEP), look: lkOfficial, flip: true};
		const o2: FigOpts = {x: x2, ground: deck(x2) + 4, h: h + 8, pose: armsFrom(gaitPose('08_04', u + 0.28, CSTEP), bow(4)), look: lkOfficial, flip: true};   // hands folded in his sleeves
		const s1 = onScreen(st, o1, ZC), s2 = onScreen(st, o2, ZC);
		// the front official cradles you against his chest, hands under both ends; the second walks a step behind
		const rc = toScreen(s1, [0.11, 0.64]), rl = 0.22 * s1.h, k = s1.h / 560;
		roll = [[rc[0] - rl / 2, rc[1] + 3 * k], [rc[0] + rl / 2, rc[1] - 3 * k]];
		figs.push(rig(s2, [], gS, 'official10b'));
		cradle = rig(s1, [{side: 'L', target: [roll[0][0] + 8 * k, roll[0][1] + 9 * k], name: 'roll end'}, {side: 'R', target: [roll[1][0] - 8 * k, roll[1][1] + 9 * k], name: 'roll end'}], gS, 'official10a');
		figs.push(cradle);
	}
	const fk = `${Math.round(t * 60)}`;
	const fade = t >= REF0 ? 1 : 0;
	body10.draw(fk, (g) => { g.globalAlpha = out; for (const f of figs) drawFig(g, f); g.globalAlpha = fade; for (const c of grp.carts) cartBack(g, c.c, c.c.r / 0.15, c.load); for (const f of grp.figs) drawFig(g, f); g.globalAlpha = 1; });
	props10.draw(fk, (g) => {
		const pushK = clamp01((t - b(15.75)) / (b(16.15) - b(15.75)));
		if (roll && cradle) { g.globalAlpha = out; glowBlob(g, lerpP(roll[0], roll[1], 0.5), 130, 70, 0.34); drawRoll(g, roll[0], roll[1], 0.025 * cradle.h, 1); drawFig(g, {...cradle, part: 'L'}); g.globalAlpha = 1; }
		g.globalAlpha = fade;
		if (grp.you) { const m = lerpP(grp.you[0], grp.you[1], 0.5); glowBlob(g, m, 150 + 900 * easeIn(pushK), 80 + 600 * easeIn(pushK), 0.4 + 0.5 * pushK); drawRoll(g, grp.you[0], grp.you[1], 0.032 * grp.hs, 1); }
		for (const c of grp.carts) { cartFront(g, c.c, c.c.r / 0.15);
			// the near shaft runs to the puller's hands, his near arm over it
			const B = c.c.bed; g.strokeStyle = '#15100C'; g.lineWidth = 0.024 * c.c.r / 0.15; g.lineCap = 'round'; g.beginPath(); g.moveTo(...B(0.3, 0.03)); g.lineTo(c.c.hand[0], c.c.hand[1]); g.stroke();
			drawFig(g, {...c.puller, part: 'R'}); }
		g.globalAlpha = 1;
	});
	// sky: dusk → fire
	const fk2 = t < FIRE0 ? 0 : 0.72 + 0.28 * smooth(clamp01((t - FIRE0) / (FIRE1 - FIRE0)));
	fireSky.mat.uniforms.uOpacity.value = fk2; fireRiver.mat.uniforms.uOpacity.value = fk2 * 0.95;
	const flick = 0.85 + 0.15 * Math.sin(t * 9) * Math.sin(t * 5.3);
	fireGlow.mat.uniforms.uOpacity.value = fk2 * flick; fireHaze.mat.uniforms.uOpacity.value = 0.32 * fk2 * flick;
	smoke.mat.uniforms.uOpacity.value = fk2 * 0.9; st.place(smoke, 260 + (t - FIRE0) * 6, 470 - (t - FIRE0) * 22);
	st.get('sunglow').mat.uniforms.uOpacity.value = 1 - fk2;
	const far = st.get('far'); far.mat.uniforms.uFog.value.set(lerp(0.788, 0.42, fk2), lerp(0.643, 0.16, fk2), lerp(0.478, 0.1, fk2), lerp(0.32, 0.16, fk2));
	st.get('haze').mat.uniforms.uTint.value.setRGB(1, lerp(1, 0.55, fk2), lerp(1, 0.4, fk2));
	embers.update(t, [-400, 200, 2000, 1000], 60, 40, 0.75 * fk2);
	crest10.setLanterns(() => (t < FIRE0 ? 1 : 0));
	crest10.setBoat(1660, lerp(0, 35, clamp01((t - b(14.5)) / 2)));
	const hero: P2 = grp.you ? lerpP(grp.you[0], grp.you[1], 0.5) : roll ? lerpP(roll[0], roll[1], 0.5) : [-400, 700];
	st.setHero(hero[0], hero[1], 650);
	crest10.setStreak(unproj(st, hero[0], hero[1], ZC)[0], roll || grp.you ? 0.45 : 0, t);
	const dim = 1 - 0.1 * fk2;
	return {st, grade: {vig: 0.34 + 0.2 * clamp01((t - b(15.75)) / 0.4), exposure: dim}, bloom: 1};
};
addScene({id: '10', a: b(14.5), z: b(16), draw: draw10});

// ================================================================================================ 11–13: 张著's desk (金)
const CW6 = 6144, CH6 = 2304, CROP_X = 3900;                        // 张著's sheet: colophon painted at 6144, cropped at the sheet edge
const SHEET_W = (CW6 - CROP_X) / CH6 * 200, END_W = 4096 / 1536 * 200;  // world px (paper depth 200)
const S12 = {x0: 600, edge: 760, py0: 26, hd: 200, depth: 300};
const T12 = {x0: 560, x1: 1780, floor: 1000};
const ZZ = -130;                                                      // 张著's depth (seated at the table's left end)
const TH_J = 1.36;
const gl = (gx4: number, gy4: number): P2 => [(1.5 * gx4 - CROP_X) / CH6 * 200, S12.py0 + (CH6 - 1.5 * gy4) / CH6 * 200];   // 4096-scale glyph → local
const insJ = (lx: number, ly: number): P2 => [S12.x0 + lx, S12.edge - ly];
let deskJ: Desk, stripJ: Strip, sheetMat: Mat, endMesh: THREE.Mesh, endMat: Mat, rollJ: THREE.Mesh, tailRoll: THREE.Mesh, glowJ = new GlowData(), bodyJ: ScreenLayer, propsJ: ScreenLayer;
let GLY: {i: number; col: number; x: number; y: number; size: number}[] = [];      // glyph boxes in local px (y up)
const lkZhang = look('jinScholar');
const buildJ = async () => {
	deskJ = new Desk('jin'); await deskJ.ready; const st = deskJ.st;
	st.get('desk').mesh.visible = false;
	const full = paintSection('colophon', {width: CW6, height: CH6, mode: 'mono', seed: 43, seals: false});
	const blank = paintSection('colophon', {width: CW6, height: CH6, mode: 'mono', seed: 43, seals: false, colophonReveal: 0});
	const fullC = crop(full, CROP_X, 0, CW6 - CROP_X, CH6), blankC = crop(blank, CROP_X, 0, CW6 - CROP_X, CH6);
	GLY = full.silk.glyphs!.map((g) => { const x = (g.x - CROP_X) / CH6 * 200, y = S12.py0 + (CH6 - g.y) / CH6 * 200; return {i: g.i, col: g.col, x, y, size: g.size / CH6 * 200}; });
	const order = dataTex(glyphOrder(full.silk.glyphs!, CW6 - CROP_X, CH6, 2, CROP_X, 0));
	full.width = full.height = 1; blank.width = blank.height = 1;              // free the big paints (only the crops are kept)
	stripJ = new Strip(st, S12.x0, S12.edge, 0);
	stripJ.plane(texMat(canvasTex(woodCanvas(1024, 256, '#3a2c20', '#20170f', 9))), T12.x0 - S12.x0, 0, T12.x1 - T12.x0, S12.depth, -2, -30);
	sheetMat = glyphMat(bigTex(fullC), bigTex(blankC), order, glowJ.tex, 0.2);
	stripJ.plane(sheetMat, 0, S12.py0, SHEET_W, 200, 0, -29);
	const endC = paintSection('end', {width: 4096, height: 1536, mode: 'mono', seed: 43});
	endMat = texMat(bigTex(endC), 0.22); endMesh = stripJ.plane(endMat, SHEET_W - 0.5, S12.py0, END_W, 200, 0.2, -29);
	const rc = canvasTex(rollerCanvas());
	rollJ = stripJ.plane(texMat(rc, 0.18), SHEET_W + END_W - 8, S12.py0 - 8, 22, 216, 3, -27);        // the rest of the painting, rolled
	tailRoll = stripJ.plane(texMat(canvasTex(rollerCanvas()), 0.12), -6, S12.py0 - 8, 14, 216, 3, -27);
	st.add('frontJ', canvasTex(tableFront(T12.x0, T12.x1, S12.edge, T12.floor)), 960, 540, W, H, 0, {rim: 0.8, rimPx: 5}, -10);
	bodyJ = new ScreenLayer(st, 'bodyJ', ZZ, {rim: 1.0, rimPx: 6}, -20);
	propsJ = new ScreenLayer(st, 'propsJ', 0, {emissive: 0.4, rim: 0.4, rimPx: 4}, -19);
	buildRollup();
};
/** writing progress (glyphs written; fractional = the current glyph) */
const progJ = (t: number) => keyed(t, [[b(17.5) - 0.01, 0], [b(17.75), 12], [b(18.08), 12], [b(18.5), 24], [b(18.62), 24], [b(18.75), 24.8], [b(19), 26], [b(20.6), 70], [b(21), 84]], (u) => u);
/** glyph glow: 翰林张择端 b19 → b19.5, settling; 藏者宜宝之 one per beat b21 … b22 */
const glowOf = (t: number) => (i: number) => {
	if (i <= 4) { const on = b(19) + i * 0.1; return clamp01((t - on) / 0.12) * (1 - 0.6 * clamp01((t - b(20.4)) / 0.5)); }
	if (i >= 65 && i <= 69) { const on = b(21 + 0.25 * (i - 65)); return clamp01((t - on) / 0.1) * (1 + 0.25 * Math.exp(-(t - on) * 8) * (t > on ? 1 : 0)); }
	return 0;
};
type CamJ = {x: number; y: number; z: number; th: number};
/** insert framing: local point (lx, ly) at screen (sx, sy) with zoom z (strip facing the camera) */
const frameAt = (lx: number, ly: number, z: number, sx = 960, sy = 540): CamJ => { const [X, Y] = insJ(lx, ly); return {x: X - (sx - 960) / z, y: Y - (sy - 540) / z, z, th: 0}; };
const DESKJ: CamJ = {x: 960, y: 640, z: 1.18, th: TH_J};
const C0 = (lx = 0) => GLY.find((g) => g.i === lx)!;
const blend = (a: CamJ, c: CamJ, u: number, ut = u): CamJ => ({x: lerp(a.x, c.x, u), y: lerp(a.y, c.y, u), z: Math.exp(lerp(Math.log(a.z), Math.log(c.z), u)), th: lerp(a.th, c.th, ut)});
/** the camera through 11 → 12 → 13 (one continuous path on one stage) */
const camJ = (t: number): CamJ => {
	const endL = SHEET_W;                                      // the painting's left edge (local)
	const F16 = frameAt(endL + 215, S12.py0 + 100, 5.5), FLL = frameAt(endL + 122, S12.py0 + 56, 8.2), FUL = frameAt(endL + 118, S12.py0 + 168, 8.2);
	const g0 = C0(0), g4 = C0(4), mid04 = (g0.y + g4.y) / 2;
	const FPAPER = frameAt(g0.x - 18, S12.py0 + 104, 7.2);
	const F19 = frameAt(g0.x, mid04, 10.2, 1330, 650);
	const g65 = C0(65), g69 = C0(69);
	const F21 = frameAt(g65.x, g65.y, 11.6, 1300, 380), F22 = frameAt(g65.x, (g65.y + g69.y) / 2, 11.6, 1300, 520);
	const FWIDE = frameAt(SHEET_W * 0.9, S12.py0 + 100, 3.3);
	if (t < b(16.25)) return blend(F16, FLL, easeInOut(clamp01((t - b(16)) / (b(16.25) - b(16)))));
	if (t < b(16.5)) return {...FLL, x: FLL.x - 1.2 * (t - b(16.25))};
	const FLL2 = {...FLL, x: FLL.x - 1.2 * (b(16.5) - b(16.25))};
	if (t < b(17)) return blend(FLL2, FUL, easeInOut(clamp01((t - b(16.5)) / (b(16.75) - b(16.5)))));
	if (t < b(17.25)) return {...FUL, z: FUL.z * (1 + 0.012 * clamp01((t - b(17)) / (b(17.25) - b(17))))};
	const FUL2 = {...FUL, z: FUL.z * 1.012};
	if (t < b(17.75)) { const u = easeInOut(clamp01((t - b(17.25)) / (b(17.5) - b(17.25)))); const s = blend(FUL2, FPAPER, u); const push = clamp01((t - b(17.5)) / (b(17.75) - b(17.5))); return {...s, z: s.z * (1 + 0.04 * push)}; }
	const FP2 = {...FPAPER, z: FPAPER.z * 1.04};
	if (t < b(18.25)) { const u = clamp01((t - b(17.75)) / (b(18.25) - b(17.75))); return blend(FP2, DESKJ, easeInOut(u), easeOut(Math.min(1, u * 1.15))); }
	if (t < b(18.75)) return {...DESKJ, x: DESKJ.x - 8 * clamp01((t - b(18.25)) / 1.1), z: DESKJ.z * (1 + 0.02 * clamp01((t - b(18.25)) / 1.1))};
	const D2 = {...DESKJ, x: DESKJ.x - 8, z: DESKJ.z * 1.02};
	if (t < b(19)) { const u = clamp01((t - b(18.75)) / (b(19) - b(18.75))); return blend(D2, F19, easeIn(u) * 0.7 + 0.3 * easeInOut(u), easeInOut(u)); }
	if (t < b(20.5)) { const d = clamp01((t - b(19)) / (b(20.5) - b(19))); return {...F19, y: F19.y + 2.5 * d, z: F19.z * (1 + 0.03 * d)}; }
	const F19e = {...F19, y: F19.y + 2.5, z: F19.z * 1.03};
	if (t < b(21)) return blend(F19e, F21, easeInOut((t - b(20.5)) / (b(21) - b(20.5))));
	if (t < b(22.25)) { const u = clamp01((t - b(21)) / (b(22) - b(21))); return blend(F21, F22, smooth(u)); }
	if (t < b(22.6)) return blend(F22, FWIDE, easeInOut((t - b(22.25)) / (b(22.6) - b(22.25))));
	if (t < b(23)) { const u = clamp01((t - b(22.6)) / (b(22.95) - b(22.6))); return blend(FWIDE, DESKJ, easeInOut(u), easeOut(Math.min(1, u * 1.1))); }
	return rollCam(clamp01((t - b(23)) / (b(23.5) - b(23))));
};
// ---- the roll-up (b23 → b23.5): 张著 pushes the tail roller; the camera dives toward the paper; the roller crosses the frame
const RU = {soft: 0.025};
const rollerX = (u: number) => 34 * smooth(Math.min(1, u / 0.3)) + 420 * Math.pow(Math.max(0, (u - 0.3) / 0.7), 1.35);   // he rolls it a hand's width, then pushes it on
const rollCam = (u: number): CamJ => {
	const zoomIn = easeIn(clamp01(u * 1.15)), th = TH_J * (1 - smooth(clamp01(u * 1.4)));
	const tgt = frameAt(SHEET_W * 0.95 + 60 * u, S12.py0 + 100, 5.4);
	return {x: lerp(DESKJ.x, tgt.x, smooth(clamp01(u * 1.6))), y: lerp(DESKJ.y, tgt.y, smooth(clamp01(u * 1.4))), z: Math.exp(lerp(Math.log(DESKJ.z), Math.log(tgt.z), zoomIn)), th};
};
let ROLL_EDGE: number[] = [];                                   // wipe k per 1/64 of the transition, from the roller's screen x
const buildRollup = () => {
	const st = deskJ.st; ROLL_EDGE = [];
	let started = false;
	for (let i = 0; i <= 64; i++) {
		const u = i / 64, c = rollCam(u); st.setCam(c.x, c.y, c.z); stripJ.tilt(c.th);
		const sx = stripJ.screen(rollerX(u) + 6, S12.py0 + 100, 6)[0], e = sx / 1920 - RU.soft * 0.6;
		const k = (e + RU.soft) / (1 + 2 * RU.soft);
		if (!started && sx < 30) started = true;
		ROLL_EDGE.push(started ? Math.max(0, k) : 0);
	}
	for (let i = 1; i <= 64; i++) ROLL_EDGE[i] = Math.max(ROLL_EDGE[i], ROLL_EDGE[i - 1]);
	ROLL_EDGE[64] = 1;
};
/** scene 14's incoming transition (declared by the yuan builder): the wipe edge rides scene 13's roller */
export const ROLLUP_IN: In = {mode: 2, a: b(23), z: b(23.5), dir: [1, 0], soft: RU.soft, ease: (u: number) => { if (!ROLL_EDGE.length) return u; const x = clamp01(u) * 64, i = Math.min(63, Math.floor(x)); return lerp(ROLL_EDGE[i], ROLL_EDGE[i + 1], x - i); }};

/** brush tip (local) for writing progress p: on the current glyph, moving down it; resting at the last glyph's foot */
const tipAt = (p: number): [number, number] => {
	const n = Math.min(83, Math.floor(p)), f = p - Math.floor(p), g = GLY[n];
	if (p >= 84) { const l = GLY[83]; return [l.x, l.y - l.size * 0.5]; }
	const wig = Math.sin(f * 23 + n) * g.size * 0.18;
	return [g.x + wig, g.y + g.size * 0.45 - f * g.size * 0.9];
};
const drawJ = (t: number) => {
	const st = deskJ.st, c = camJ(t); st.setCam(c.x, c.y, c.z); stripJ.tilt(c.th);
	const p = progJ(t); sheetMat.uniforms.uProg.value = p; glowJ.set(glowOf(t));
	const ru = clamp01((t - b(23)) / (b(23.5) - b(23))), rx = t >= b(23) ? rollerX(ru) : 0;
	// the roll-up: paper left of the roller is wound on it
	sheetMat.uniforms.uClip.value.set(rx / SHEET_W, 2, -1, 2); endMat.uniforms.uClip.value.set((rx - SHEET_W) / END_W, 2, -1, 2);
	const rd = 14 + rx * 0.03; stripJ.place(tailRoll, rx - rd * 0.66, S12.py0 - 8, rd, 216, 3 + rd * 0.3);
	const deskOn = c.th > 1.12;
	// 张著, seated at the table's left end facing right: brush at the newest glyph, left hand flat on the paper's edge
	const zx = 528;
	const o: FigOpts = {x: zx, ground: T12.floor, h: 560, pose: fkPose({hip: 0.37, lean: 14, neck: 6, lt: 88, lk: 92, rt: 84, rk: 86, la: 20, le: 50, ra: 16, re: 56}), look: lkZhang};
	const cs: Contact[] = []; let brush: [P2, P2] | null = null;
	const roll0 = b(22.86), rel = b(23) + 0.3 * (b(23.5) - b(23));
	if (deskOn && t < b(22.25)) {
		const tip = tipAt(p), lift = t > b(18.5) && t < b(18.62) ? Math.sin((t - b(18.5)) / (b(18.62) - b(18.5)) * Math.PI) * 14 : 0;
		const tS = stripJ.screen(tip[0], tip[1], lift), gS = stripJ.screen(tip[0], tip[1], 54 + lift);
		brush = [gS, tS]; cs.push({side: 'R', target: gS, name: 'brush'});
		cs.push({side: 'L', target: stripJ.screen(24, S12.py0 + 22, 1), name: 'paper edge', opt: {dir: -10}});
	} else if (deskOn && t >= roll0 && t < rel) {
		cs.push({side: 'R', target: stripJ.screen(rx - 2, S12.py0 + 10, 7), name: 'roller near end'});
		cs.push({side: 'L', target: stripJ.screen(rx - 2, S12.py0 + 190, 7), name: 'roller far end'});
	}
	const s = onScreen(st, o, ZZ); const zhang = deskOn ? rig(s, cs, () => s.ground, 'zhangzhu') : s;
	// his stool
	const fk = `${Math.round(t * 60)}`;
	const ext = 900 * (1 - smooth(clamp01((c.th / TH_J - 0.72) / 0.26))), lxL = T12.x0 - S12.x0 - ext;      // while the paper stands up it hides him
	const polyJ: P2[] = [stripJ.screen(lxL, -ext * 0.4, -2), stripJ.screen(T12.x1 - S12.x0, 0, -2), stripJ.screen(T12.x1 - S12.x0, S12.depth + ext, -2), stripJ.screen(lxL, S12.depth + ext, -2)];
	bodyJ.draw(fk, (g) => {
		g.save(); g.beginPath(); g.rect(-50, -50, W + 100, H + 100); g.moveTo(polyJ[0][0], polyJ[0][1]); for (const q of polyJ.slice(1)) g.lineTo(q[0], q[1]); g.closePath(); g.clip('evenodd');
		const k = s.h / 560, sx = s.x, sy = s.ground; g.fillStyle = '#15100C';
		g.fillRect(sx - 95 * k, sy - 196 * k, 160 * k, 14 * k); g.fillRect(sx - 85 * k, sy - 184 * k, 11 * k, 184 * k); g.fillRect(sx + 44 * k, sy - 184 * k, 11 * k, 184 * k); g.fillRect(sx - 80 * k, sy - 40 * k, 130 * k, 7 * k);
		drawFig(g, zhang); g.restore();
	});
	propsJ.draw(fk, (g) => { if (brush) drawBrush(g, brush[0], brush[1], 6 * s.h / 560); if (c.th > 1.0) drawArms(g, [zhang]); });
	const hero = stripJ.screen(SHEET_W + 260, S12.py0 + 100); st.setHero(hero[0], hero[1], 1300);
	deskJ.lamp.draw('off', () => {});
	const ins = 1 - clamp01((c.th - 0.2) / 0.9), pool = t < b(17.5) ? 0.55 : 0.55 * (1 - clamp01((t - b(17.5)) / 0.4));
	return {st, grade: {vig: lerp(0.36, 0.62, ins), vigCol: '#1a120b', corners: 0.95 * ins, cornersBand: [0, 330, 560, 1] as [number, number, number, number], exposure: 1, pool: [980, 600, 640, pool * ins] as [number, number, number, number]}, bloom: 1};
};
addScene({id: '11', a: b(16), z: b(17.5), draw: drawJ, in: {mode: 5, a: b(16), z: b(16.15), pt: [0.5, 0.5], soft: 0.08}});
addScene({id: '12', a: b(17.5), z: b(19), draw: drawJ});
addScene({id: '13', a: b(19), z: b(23), draw: drawJ});             // scene 14 starts at b23 with in: ROLLUP_IN (b23 → b23.5)

// ================================================================================================ boot
export const bootSong = async () => {
	await document.fonts.load('500 92px "Noto Serif CJK SC"').catch(() => null);
	await build9(); await build10(); await buildJ();
	// scene 10's carry starts where 09's hand-over roll is (screen → crest frame px at the cast depth, camera (960,560,1))
	crest10.st.setCam(960, 560, 1); HANDOFF_FRAME = unproj(crest10.st, HANDOFF.c[0], HANDOFF.c[1], ZC);
};
