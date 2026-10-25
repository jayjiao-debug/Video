// Scenes 30–31 (group 'resto'). 30: the painted gate → the straw shed: two posts rise from a torn spot, a dashed donkey-ear
// outline draws itself, the Ming mounter's donkey paints itself in on a greyer patch; all of it seen in the 1973 magnifier lens:
// pull out to the restoration room (fluorescent tubes, two restorers, the lens on its arm), push back in, the patch is peeled
// (C33), pull out, the restorer swings the lens aside. 31: crane up over the long table to ~2 m of the tail, drop onto
// 张著's 藏者宜宝之. The scroll on the table is a tilted Strip (sb_kit); the lens is a disc whose content window we animate.
import * as THREE from 'three';
import {Stage, bar, BEAT, W, H, D, clamp01, smooth, easeInOut, easeOut, easeIn, lerp, mkCanvas, canvasTex, gradCanvas, svgDoc, svgToCanvas, hash} from './core';
import {addScene} from './film';
import {look, rig, Contact, drawFig} from './actors';
import {FigOpts, fkPose, POSES, mixPose, reach, toBody} from './figures';
import {paintSection, paintSeal, stampSeals, silkWeave} from './silk';
import {Strip, ScreenLayer, texMat, glyphMat, GlowData, dataTex, bigTex, crop, glyphOrder, rollerCanvas, woodCanvas, onScreen, proj, keyed, lerpP, P2, Mat} from './sb_kit';

const b = bar;
const SC = 82 / 1536;                                   // section px (4096-wide sections) → world px: the scroll is 82 px deep (25 cm)
const S = {x0: -131, edge: 760, py0: 14, depth: 300};    // strip origin (front-left of the table top)
const TB = {x0: -500, x1: 2400, floor: 1010};
const ZR = -110, ZS = 70, TH_R = 1.36;                   // ZS: the seated restorer, in front of the table                           // restorers' depth; table tilt in the room view
// the strip: tail sheets (two other colophon stand-ins, cropped), 张著's colophon section, the painting's end, gate, river, shed
const PARTS = {colB: 0, colA: 2600 * SC, col: 5200 * SC, end: 5200 * SC + 4096 * SC, gate: 5200 * SC + 2 * 4096 * SC, river: 5200 * SC + 3 * 4096 * SC, shed: 5200 * SC + 4 * 4096 * SC};
const PATCH4 = {x: 1853, y: 1308};                      // the patch centre in the shed section (4096 px)
const lxPatch = PARTS.shed + PATCH4.x * SC, lyPatch = S.py0 + (1536 - PATCH4.y) * SC;
// the lens: a disc at depth 0; its content is a window (collage px) into the hi-res collage (gate + shed at 8192 px)
const LENS = {r: 34, x: 1112, y: 712, asp: 0.6};          // a hand-sized magnifier just above the patch, tilted (an ellipse)
const POST: P2 = [1236, 612];                           // the lamp's post top (screen px in the room view; world px at depth 0)
let st: Stage, strip: Strip, shedMesh: THREE.Mesh, shedDonkey: Mat, shedPeeled: Mat, lens: THREE.Mesh, lensMat: THREE.ShaderMaterial, ring: THREE.Mesh;
let body: ScreenLayer, lampL: ScreenLayer, arms: ScreenLayer, front: ScreenLayer, sheetMat: Mat, glowR = new GlowData();
let collage: HTMLCanvasElement, CW = 0, CH = 0, patchCv: HTMLCanvasElement, patchTex: THREE.CanvasTexture, patchKey = '';
let P_BARE: HTMLCanvasElement, P_NOPOST: HTMLCanvasElement, P_DONKEY: HTMLCanvasElement, P_DLINES: HTMLCanvasElement, P_PEELED: HTMLCanvasElement, P_PIECE: HTMLCanvasElement;
let GL31: {i: number; x: number; y: number; size: number}[] = [];
// collage layout (8192-scale px): the shed crop, then the gate crop overlapping its right part
const SHED_CROP = {x: 2500, y: 1600, w: 1800, h: 1472}, GATE_CROP = {x: 2900, y: 1000, w: 2200, h: 1472}, GATE_AT = 1400;
const PATCH_CROP = {x: 3400, y: 2250, w: 900, h: 600};   // the animated patch region (8192 px)
const ROOM_SPAN = 1100;                                 // collage px across the lens diameter in the room (×4 magnification)
const PATCH_C: P2 = [PATCH4.x * 2 - SHED_CROP.x, PATCH4.y * 2 - SHED_CROP.y];   // patch centre in collage px
const ARCH_C: P2 = [GATE_AT + (1900 * 2 - GATE_CROP.x), 900 * 2 - GATE_CROP.y];  // the gate's arch in collage px
// the two posts (patch-canvas px), from silk.ts' donkey-ear geometry
const POSTS = {B1: [409, 192] as P2, T1: [390, 82] as P2, B2: [428, 192] as P2, T2: [413, 86] as P2};

// ------------------------------------------------------------------------------------------------ boot
export const bootResto = async () => {
	await document.fonts.load('500 92px "Noto Serif CJK SC"').catch(() => null);
	st = new Stage('resto');
	// the room: cool 1973 wall, cabinets, a tall window (daylight), fluorescent tubes, floor
	st.add('wall', canvasTex(gradCanvas([[0, '#5f6764'], [0.45, '#6F7774'], [1, '#666e6b']])), 960, 540, 6000, 3000, -1600);
	const room = svgDoc(`
		<rect x="1340" y="300" width="330" height="430" fill="#B4BEB9"/><rect x="1330" y="290" width="350" height="12" fill="#3d4543"/><rect x="1330" y="728" width="350" height="16" fill="#3d4543"/>
		<rect x="1500" y="300" width="10" height="430" fill="#3d4543"/><rect x="1340" y="510" width="330" height="8" fill="#3d4543"/>
		<rect x="-300" y="250" width="420" height="560" fill="#4c5553"/><rect x="-290" y="262" width="190" height="300" fill="#56605d"/><rect x="-80" y="262" width="190" height="300" fill="#56605d"/>
		<rect x="140" y="420" width="560" height="14" fill="#3d4543"/><rect x="140" y="560" width="560" height="14" fill="#3d4543"/>
		${Array.from({length: 9}, (_, i) => `<ellipse cx="${175 + i * 58}" cy="${404 - (i % 3) * 3}" rx="16" ry="16" fill="#5a625f" stroke="#3d4543" stroke-width="4"/>`).join('')}
		${Array.from({length: 6}, (_, i) => `<rect x="${170 + i * 86}" y="${470 + (i % 2) * 8}" width="${60 + (i % 3) * 12}" height="${90 - (i % 2) * 8}" fill="#4d5653"/>`).join('')}
		<rect x="1880" y="240" width="460" height="600" fill="#4c5553"/>`, 2700, 1300, '', -400, 0);
	st.add('room', canvasTex(await svgToCanvas(room, 2700, 1300, 0.6)), 950, 650, 2700, 1300, -1100, {fog: ['#6F7774', 0.12]});
	const tubes = mkCanvas(1400, 120), tg = tubes.getContext('2d')!;
	for (const [x0, x1] of [[60, 620], [720, 1240]]) { tg.fillStyle = '#2f3533'; tg.fillRect(x0, 40, x1 - x0, 26); tg.fillRect(x0 + 40, 0, 4, 40); tg.fillRect(x1 - 44, 0, 4, 40); tg.fillStyle = '#EEF4F1'; tg.fillRect(x0 + 14, 66, x1 - x0 - 28, 9); tg.fillRect(x0 + 14, 54, x1 - x0 - 28, 2); }
	st.add('tubes', canvasTex(tubes), 640, 46, 1400, 120, -500, {emissive: 0.9});
	st.add('floor', canvasTex(gradCanvas([[0, '#5b605c'], [1, '#3f4442']])), 960, 1300, 6000, 700, -700);
	// ---- the art
	// the table strip is ~240 px tall on screen at most: paint it at half size (2048 × 768); only the lens and the drop go hi-res
	const sec = (name: 'end' | 'gate' | 'river' | 'shed', o: any = {}) => paintSection(name, {width: 2048, height: 768, mode: 'mono', seed: 43, ...o});
	const colMain = paintSection('colophon', {width: 2048, height: 768, mode: 'mono', seed: 43});
	const colA = crop(paintSection('colophon', {width: 2048, height: 768, mode: 'mono', seed: 45}), 0, 0, 1300, 768);
	const colB = crop(paintSection('colophon', {width: 2048, height: 768, mode: 'mono', seed: 47}), 0, 0, 1300, 768);
	// collectors' seals on the joins and margins (older ones fainter)
	const seals = (cv: HTMLCanvasElement, xs: number[], seed: number, k = 0.5) => stampSeals(cv, xs.flatMap((x, i) => [
		{x: (x + (i % 2 ? 8 : -6)) * k, y: (300 + (i * 97) % 260) * k, size: Math.round((120 + (i * 37) % 50) * k), seed: seed + i, style: i % 3 ? 'bai' : 'zhu', fade: 0.15 + ((i * 53) % 60) / 100, alpha: 0.9} as any,
		{x: (x + (i % 2 ? -10 : 12)) * k, y: (1050 + (i * 71) % 280) * k, size: Math.round((100 + (i * 29) % 60) * k), seed: seed + 50 + i, style: i % 2 ? 'zhu' : 'bai', fade: 0.25 + ((i * 31) % 50) / 100, alpha: 0.88} as any]));
	seals(colA, [1330, 2540, 600], 400); seals(colB, [1330, 2540, 900, 120], 500); seals(colMain, [1330, 400, 1900], 600);
	strip = new Strip(st, S.x0, S.edge, 0);
	strip.plane(texMat(canvasTex(woodCanvas(1024, 256, '#5a3a2a', '#3a2418', 21))), TB.x0 - S.x0, 0, TB.x1 - TB.x0, S.depth, -2, -30);
	const add = (cv: HTMLCanvasElement, lx: number, w: number, em = 0.18) => strip.plane(texMat(bigTex(cv), em), lx, S.py0, w, 82, 0, -29);
	add(colB, PARTS.colB, 2600 * SC); add(colA, PARTS.colA, 2600 * SC); add(colMain, PARTS.col, 4096 * SC);
	add(sec('end'), PARTS.end, 4096 * SC); add(sec('gate'), PARTS.gate, 4096 * SC); add(sec('river'), PARTS.river, 4096 * SC);
	shedDonkey = texMat(bigTex(sec('shed', {patch: 'donkey'})), 0.18); shedPeeled = texMat(bigTex(sec('shed', {patch: 'peeled'})), 0.18);
	shedMesh = strip.plane(shedDonkey, PARTS.shed, S.py0, 4096 * SC, 82, 0, -29); st.mats.push(shedPeeled);
	strip.plane(texMat(canvasTex(rollerCanvas()), 0.12), PARTS.shed + 4096 * SC - 2, S.py0 - 4, 6, 90, 2, -27);      // the start roller
	strip.plane(texMat(canvasTex(rollerCanvas(['#3a2c22', '#8a6a4a', '#2a2018'])), 0), -5, S.py0 - 4, 5, 90, 2, -27);  // the end stick
	// 张著's sheet at 6144 (for the drop onto 藏者宜宝之), with the join seals, laid exactly over his part of the colophon
	const hi = paintSection('colophon', {width: 6144, height: 2304, mode: 'mono', seed: 43});
	seals(hi, [], 0);
	const hiC = crop(hi, 3900, 0, 6144 - 3900, 2304); const hiGlyphs = hi.silk.glyphs!;
	stampSeals(hiC, [{x: 5745 - 3900 + 10, y: 480, size: 190, seed: 611, style: 'bai', fade: 0.3, alpha: 0.9} as any, {x: 5745 - 3900 - 12, y: 1720, size: 160, seed: 612, style: 'zhu', fade: 0.45, alpha: 0.88} as any]);
	const order = dataTex(glyphOrder(hiGlyphs, 6144 - 3900, 2304, 2, 3900, 0)); hi.width = hi.height = 1;
	const hiT = bigTex(hiC); sheetMat = glyphMat(hiT, hiT, order, glowR.tex, 0.18);
	strip.plane(sheetMat, PARTS.col + 2600 * SC, S.py0, (4096 - 2600) * SC, 82, 0.15, -28.8);
	GL31 = hiGlyphs.map((g) => ({i: g.i, x: PARTS.col + g.x / 1.5 * SC, y: S.py0 + (1536 - g.y / 1.5) * SC, size: g.size / 1.5 * SC}));
	// the table's front
	st.add('front', canvasTex(frontCanvas()), 960, 540, W, H, 0, {rim: 0.6, rimPx: 4}, -10);
	// ---- the lens content: a collage of the shed (8192) and the gate (8192), plus the animated patch region
	// painted without the weave (no 100 MB weave overlay cached at this size); the crops get their own weave
	const shed8 = (patch: 'bare' | 'donkey' | 'peeled') => paintSection('shed', {width: 8192, height: 3072, mode: 'mono', seed: 43, patch, weave: 0});
	const wv = (c: HTMLCanvasElement) => { silkWeave(c, 1, {mode: 'mono', seed: 43}); return c; };
	const sb = shed8('bare');
	collage = mkCanvas(GATE_AT + GATE_CROP.w, SHED_CROP.h); CW = collage.width; CH = collage.height;
	const cg = collage.getContext('2d')!; cg.drawImage(sb, SHED_CROP.x, SHED_CROP.y, SHED_CROP.w, SHED_CROP.h, 0, 0, SHED_CROP.w, SHED_CROP.h);
	P_BARE = crop(sb, PATCH_CROP.x, PATCH_CROP.y, PATCH_CROP.w, PATCH_CROP.h);
	sb.width = sb.height = 1;
	const free = (c: HTMLCanvasElement) => { const o = crop(c, PATCH_CROP.x, PATCH_CROP.y, PATCH_CROP.w, PATCH_CROP.h); c.width = c.height = 1; return o; };
	P_DONKEY = wv(free(shed8('donkey'))); P_PEELED = wv(free(shed8('peeled'))); wv(P_BARE);
	const gate6 = paintSection('gate', {width: 6144, height: 2304, mode: 'mono', seed: 43, weave: 0}), k6 = 6144 / 8192;   // the gate is seen only in passing: 6144 is enough
	const gc = crop(gate6, GATE_CROP.x * k6, GATE_CROP.y * k6, GATE_CROP.w * k6, GATE_CROP.h * k6, GATE_CROP.w, GATE_CROP.h), gcg = gc.getContext('2d')!; gate6.width = gate6.height = 1;
	const fade = gcg.createLinearGradient(0, 0, 420, 0); fade.addColorStop(0, 'rgba(0,0,0,0)'); fade.addColorStop(1, 'rgba(0,0,0,1)'); gcg.globalCompositeOperation = 'destination-in'; gcg.fillStyle = fade; gcg.fillRect(0, 0, GATE_CROP.w, GATE_CROP.h);   // one fill: destination-in clears outside the shape
	cg.drawImage(gc, GATE_AT, 0); wv(collage);
	P_NOPOST = inpaintPosts(P_BARE); P_DLINES = inkOnly(P_DONKEY); P_PIECE = pieceOf(P_DONKEY, P_PEELED);
	patchCv = mkCanvas(PATCH_CROP.w, PATCH_CROP.h); patchTex = canvasTex(patchCv); patchTex.generateMipmaps = false; patchTex.minFilter = THREE.LinearFilter;
	lensMat = lensMaterial(bigTex(collage), patchTex);
	lens = new THREE.Mesh(new THREE.PlaneGeometry(2 * LENS.r, 2 * LENS.r), lensMat); lens.scale.y = LENS.asp; lens.renderOrder = -15; st.scene.add(lens); st.mats.push(lensMat);
	ring = new THREE.Mesh(new THREE.PlaneGeometry(2 * LENS.r * 1.3, 2 * LENS.r * 1.3), texMat(canvasTex(ringCanvas()), 0)); ring.scale.y = LENS.asp; ring.renderOrder = -14; st.scene.add(ring); st.mats.push(ring.material as Mat);
	body = new ScreenLayer(st, 'rbody', ZR, {rim: 0.9, rimPx: 6}, -20);
	lampL = new ScreenLayer(st, 'rlamp', -60, {rim: 0.5, rimPx: 4}, -19);
	arms = new ScreenLayer(st, 'rarms', 0, {rim: 0.6, rimPx: 4}, -18);
	front = new ScreenLayer(st, 'rfront', ZS, {rim: 0.9, rimPx: 6}, -9);
};
const frontCanvas = () => {
	const c = mkCanvas(W, H), g = c.getContext('2d')!, top = S.edge;
	g.fillStyle = '#4a2c20'; g.fillRect(0, top - 2, W, 8); g.fillStyle = '#2e1c14'; g.fillRect(0, top + 5, W, 24);
	g.fillStyle = '#21140e'; for (const x of [230, 1620]) g.fillRect(x, top + 26, 20, TB.floor - 40 - top - 26);   // back legs
	g.fillStyle = '#2e1c14'; for (const x of [150, 1700]) g.fillRect(x, top + 26, 30, TB.floor - top - 26);
	g.fillRect(180, TB.floor - 90, 1520, 12); g.fillStyle = 'rgba(255,230,190,0.12)'; g.fillRect(0, top - 2, W, 2);
	return c;
};
const ringCanvas = () => {
	const n = 512, c = mkCanvas(n, n), g = c.getContext('2d')!, r0 = n / 2 / 1.3;
	g.strokeStyle = '#2a302e'; g.lineWidth = r0 * 0.16; g.beginPath(); g.arc(n / 2, n / 2, r0 * 1.06, 0, Math.PI * 2); g.stroke();
	g.strokeStyle = 'rgba(220,235,232,0.55)'; g.lineWidth = r0 * 0.025; g.beginPath(); g.arc(n / 2, n / 2, r0 * 0.99, Math.PI * 1.05, Math.PI * 1.7); g.stroke();
	g.fillStyle = '#2a302e'; g.beginPath(); g.roundRect(n / 2 - r0 * 0.18, n / 2 - r0 * 1.32, r0 * 0.36, r0 * 0.22, 6); g.fill();
	return c;
};
/** the lens: a disc showing a window of the collage (+ the patch canvas on top), soft fall-off at the rim */
const lensMaterial = (map: THREE.Texture, patch: THREE.Texture) => new THREE.ShaderMaterial({
	uniforms: {map: {value: map}, patchT: {value: patch}, uWin: {value: new THREE.Vector4(0.5, 0.5, 0.2, 0.2)}, uPatch: {value: new THREE.Vector4(0, 0, 1, 1)},
		uOpacity: {value: 1}, uGlowPass: {value: 0}, uEmissive: {value: 0.2}, uHero: {value: new THREE.Vector2()}, uHeroR: {value: 900}, uDefocus: {value: 0}},
	vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
	fragmentShader: `uniform sampler2D map, patchT; uniform vec4 uWin, uPatch; uniform float uOpacity, uGlowPass, uEmissive, uHeroR, uDefocus; uniform vec2 uHero; varying vec2 vUv;
	void main(){ vec2 d = vUv - 0.5; float r = length(d); if (r > 0.5) discard;
		vec2 c = uWin.xy + vec2(d.x, d.y * 0.6) * 2.0 * uWin.zw; vec3 col = texture2D(map, c).rgb;
		vec2 pu = (c - uPatch.xy) / (uPatch.zw - uPatch.xy);
		if (pu.x >= 0.0 && pu.x <= 1.0 && pu.y >= 0.0 && pu.y <= 1.0) { vec4 p = texture2D(patchT, pu); col = mix(col, p.rgb, p.a); }
		col = mix(col, vec3(0.80, 0.71, 0.52), uDefocus * 0.85); col *= 1.0 - 0.22 * smoothstep(0.40, 0.5, r); float a = uOpacity;
		if (uGlowPass > 0.5) gl_FragColor = vec4(col * uEmissive, a); else gl_FragColor = vec4(col, a);
		#include <colorspace_fragment>
	}`, transparent: true, depthWrite: false, depthTest: true});
/** the bare torn spot without the two posts (each row of the posts' box interpolated from its edges) */
const inpaintPosts = (src: HTMLCanvasElement) => {
	const c = mkCanvas(src.width, src.height), g = c.getContext('2d')!; g.drawImage(src, 0, 0);
	const x0 = 372, x1 = 448, y0 = 66, y1 = 206, id = g.getImageData(0, 0, c.width, c.height), d = id.data, w = c.width;
	for (let y = y0; y <= y1; y++) { const a = (y * w + x0) * 4, z = (y * w + x1) * 4;
		for (let x = x0 + 1; x < x1; x++) { const u = (x - x0) / (x1 - x0), k = (y * w + x) * 4; for (let ch = 0; ch < 3; ch++) d[k + ch] = d[a + ch] * (1 - u) + d[z + ch] * u; } }
	g.putImageData(id, 0, 0); return c;
};
/** the ink lines of a canvas as alpha (for lines-first painting) */
const inkOnly = (src: HTMLCanvasElement) => {
	const c = mkCanvas(src.width, src.height), g = c.getContext('2d')!; g.drawImage(src, 0, 0);
	const id = g.getImageData(0, 0, c.width, c.height), d = id.data;
	for (let i = 0; i < d.length; i += 4) { const l = 0.3 * d[i] + 0.59 * d[i + 1] + 0.11 * d[i + 2]; d[i + 3] = Math.max(0, Math.min(255, (190 - l) * 3)); }
	g.putImageData(id, 0, 0); return c;
};
/** the patch piece: the donkey state where it differs from the peeled state (soft-edged) */
const pieceOf = (dk: HTMLCanvasElement, pe: HTMLCanvasElement) => {
	const c = mkCanvas(dk.width, dk.height), g = c.getContext('2d')!, a = dk.getContext('2d')!.getImageData(0, 0, c.width, c.height), p = pe.getContext('2d')!.getImageData(0, 0, c.width, c.height);
	const m = mkCanvas(c.width, c.height), mg = m.getContext('2d')!, mi = mg.createImageData(c.width, c.height);
	for (let i = 0; i < a.data.length; i += 4) { const df = Math.abs(a.data[i] - p.data[i]) + Math.abs(a.data[i + 1] - p.data[i + 1]) + Math.abs(a.data[i + 2] - p.data[i + 2]); mi.data[i + 3] = df > 6 ? 255 : 0; }
	mg.putImageData(mi, 0, 0);
	const m2 = mkCanvas(c.width, c.height), m2g = m2.getContext('2d')!; m2g.filter = 'blur(5px)'; m2g.drawImage(m, 0, 0); m2g.filter = 'none'; m2g.drawImage(m2, 0, 0); m2g.drawImage(m, 0, 0);
	g.drawImage(dk, 0, 0); g.globalCompositeOperation = 'destination-in'; g.drawImage(m2, 0, 0);
	g.beginPath(); g.rect(0, 0, c.width, c.height); g.roundRect(80, 168, 452, 400, 40); g.fillStyle = '#000'; g.globalCompositeOperation = 'destination-out'; g.fill('evenodd'); return c;
};

// ------------------------------------------------------------------------------------------------ the patch, beat by beat
const T_POST = b(58.75), T_EARS = b(59), T_DONK = b(59.5), T_PEEL = b(61), T_PEEL1 = b(61.5);
const earPath = (B: P2, T: P2): P2[] => { const w = 16, m: P2 = [(B[0] + T[0]) / 2, (B[1] + T[1]) / 2]; return [[B[0] - w * 0.7, B[1] + 6], [m[0] - w, m[1]], [T[0], T[1] - 14], [m[0] + w, m[1]], [B[0] + w * 0.7, B[1] + 6]]; };
const partial = (g: CanvasRenderingContext2D, pts: P2[], k: number) => {   // stroke a polyline up to fraction k of its length
	let L = 0; for (let i = 1; i < pts.length; i++) L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
	let left = L * k; g.beginPath(); g.moveTo(pts[0][0], pts[0][1]);
	for (let i = 1; i < pts.length && left > 0; i++) { const s = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]), u = Math.min(1, left / s); g.lineTo(lerp(pts[i - 1][0], pts[i][0], u), lerp(pts[i - 1][1], pts[i][1], u)); left -= s; }
	g.stroke();
};
/** tweezers tip on the patch's right edge (patch px) and the piece's lift transform */
const TW_TIP: P2 = [522, 352];
const drawPatch = (t: number) => {
	const kPost = clamp01((t - T_POST) / 0.4), kEars = clamp01((t - T_EARS) / 0.5), kDonk = clamp01((t - T_DONK) / 0.5), kPeel = clamp01((t - T_PEEL) / (T_PEEL1 - T_PEEL));
	const key = `${kPost.toFixed(3)}:${kEars.toFixed(3)}:${kDonk.toFixed(3)}:${kPeel.toFixed(3)}:${t >= T_PEEL - 0.3 ? 1 : 0}`;
	if (key === patchKey) return; patchKey = key;
	const g = patchCv.getContext('2d')!; g.clearRect(0, 0, patchCv.width, patchCv.height);
	if (kPeel > 0) {
		g.drawImage(P_PEELED, 0, 0);
		// the old patch lifts at its right edge (the tweezers), rises toward the lens and slides off
		const lift = smooth(kPeel), ang = -0.5 * lift, dx = 150 * easeIn(kPeel) + 30 * lift, dy = -130 * easeIn(kPeel) - 20 * lift, sc = 1 + 0.12 * lift;
		g.save(); g.globalAlpha = 0.35 * lift * (1 - easeIn(kPeel)); g.filter = 'blur(10px)'; g.translate(TW_TIP[0] - 20 * lift, TW_TIP[1] + 26 * lift); g.rotate(ang * 0.6); g.translate(-TW_TIP[0], -TW_TIP[1]); g.drawImage(pieceShadow(), 0, 0); g.restore(); g.filter = 'none';
		g.save(); g.globalAlpha = 1 - 0.55 * clamp01((kPeel - 0.7) / 0.3); g.translate(TW_TIP[0] + dx, TW_TIP[1] + dy); g.rotate(ang); g.scale(sc, sc); g.translate(-TW_TIP[0], -TW_TIP[1]); g.drawImage(P_PIECE, 0, 0); g.restore();
		tweezers(g, [TW_TIP[0] + dx, TW_TIP[1] + dy], 1);
	} else if (kDonk > 0) {
		g.drawImage(P_BARE, 0, 0); dashes(g, 1, 1 - kDonk);
		const c = mkCanvas(patchCv.width, patchCv.height), cg = c.getContext('2d')!;
		const reveal = (src: HTMLCanvasElement, r: number) => { cg.clearRect(0, 0, c.width, c.height); cg.drawImage(src, 0, 0); cg.globalCompositeOperation = 'destination-in';
			const gr = cg.createRadialGradient(306, 366, Math.max(0, r - 60), 306, 366, r + 1); gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); cg.fillStyle = gr; cg.fillRect(0, 0, c.width, c.height); cg.globalCompositeOperation = 'source-over'; g.drawImage(c, 0, 0); };
		reveal(P_DLINES, 40 + 300 * easeOut(Math.min(1, kDonk * 1.4))); reveal(P_DONKEY, 300 * easeInOut(clamp01((kDonk - 0.25) / 0.75)));
	} else if (kEars > 0) { g.drawImage(P_BARE, 0, 0); dashes(g, kEars, 1); }
	else if (kPost > 0) { g.drawImage(P_NOPOST, 0, 0); const yr = lerp(206, 66, easeOut(kPost)); g.save(); g.beginPath(); g.rect(360, yr, 100, 210 - yr); g.clip(); g.drawImage(P_BARE, 0, 0); g.restore(); }
	else g.drawImage(P_NOPOST, 0, 0);
	if (t >= T_PEEL - 0.3 && kPeel <= 0) tweezers(g, TW_TIP, clamp01((t - (T_PEEL - 0.3)) / 0.3));
	g.globalCompositeOperation = 'destination-in'; g.drawImage(featherMask(), 0, 0); g.globalCompositeOperation = 'source-over';
	patchTex.needsUpdate = true;
};
let FEATHER: HTMLCanvasElement | null = null;
/** the patch canvas fades out over its outer 70 px, so its own silk weave never shows a seam against the collage */
const featherMask = () => { if (FEATHER) return FEATHER; const w = PATCH_CROP.w, h = PATCH_CROP.h, c = mkCanvas(w, h), g = c.getContext('2d')!, id = g.createImageData(w, h), f = 70;
	for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const d = Math.min(x, y, w - 1 - x, h - 1 - y); id.data[(y * w + x) * 4 + 3] = Math.round(255 * smooth(Math.min(1, d / f))); }
	g.putImageData(id, 0, 0); FEATHER = c; return c; };
let SHADOW: HTMLCanvasElement | null = null;
const pieceShadow = () => { if (SHADOW) return SHADOW; SHADOW = mkCanvas(P_PIECE.width, P_PIECE.height); const g = SHADOW.getContext('2d')!; g.drawImage(P_PIECE, 0, 0); g.globalCompositeOperation = 'source-in'; g.fillStyle = '#2A1F17'; g.fillRect(0, 0, SHADOW.width, SHADOW.height); return SHADOW; };
const dashes = (g: CanvasRenderingContext2D, k: number, alpha: number) => {
	if (alpha <= 0) return; g.save(); g.globalAlpha = alpha; g.strokeStyle = '#2A1F17'; g.lineWidth = 4.6; g.setLineDash([14, 10]); g.lineCap = 'round';
	partial(g, earPath(POSTS.B1, POSTS.T1), clamp01(k * 2)); partial(g, earPath(POSTS.B2, POSTS.T2), clamp01(k * 2 - 1)); g.restore();
};
/** the tweezers' magnified tips at the patch's right edge, the shank running off toward the restorer (upper right) */
const tweezers = (g: CanvasRenderingContext2D, tip: P2, a: number) => {
	if (a <= 0) return; g.save(); g.globalAlpha = a; g.fillStyle = '#1d211f';
	g.beginPath(); g.moveTo(tip[0], tip[1]); g.lineTo(tip[0] + 6, tip[1] - 4); g.lineTo(tip[0] + 300, tip[1] - 190); g.lineTo(tip[0] + 284, tip[1] - 210); g.closePath(); g.fill();
	g.beginPath(); g.moveTo(tip[0] - 2, tip[1] + 6); g.lineTo(tip[0] + 6, tip[1] + 6); g.lineTo(tip[0] + 316, tip[1] - 168); g.lineTo(tip[0] + 304, tip[1] - 186); g.closePath(); g.fill();
	g.restore();
};

// ------------------------------------------------------------------------------------------------ camera, lens, figures
type Cam = {x: number; y: number; z: number; th: number};
/** inside the lens: camera on the lens centre, zoom so the disc covers the frame */
const LENS_IN = 42;
const lensCam = (lc: P2, z = LENS_IN): Cam => ({x: lc[0], y: lc[1], z, th: TH_R});
const ROOM: Cam = {x: 960, y: 590, z: 1.0, th: TH_R};
const blend = (a: Cam, c: Cam, u: number, ut = u): Cam => ({x: lerp(a.x, c.x, u), y: lerp(a.y, c.y, u), z: Math.exp(lerp(Math.log(a.z), Math.log(c.z), u)), th: lerp(a.th, c.th, ut)});
/** the lens centre (world px, depth 0): swung aside about the post top from b61.6 */
const swingK = (t: number) => smooth(clamp01((t - b(61.62)) / (b(61.9) - b(61.62))));
const lensAt = (t: number): P2 => { const a0 = Math.atan2(LENS.y - POST[1], LENS.x - POST[0]), R = Math.hypot(LENS.x - POST[0], LENS.y - POST[1]), a = a0 + 1.05 * swingK(t); return [POST[0] + Math.cos(a) * R, POST[1] + Math.sin(a) * R]; };
/** the content window (collage px centre + span across the lens diameter) */
const lensWin = (t: number): {c: P2; span: number} => {
	const room = {c: PATCH_C, span: ROOM_SPAN};
	const ROOMW = {c: [PATCH_C[0], PATCH_C[1] - 110] as P2, span: ROOM_SPAN};
	if (t >= b(60.25)) return ROOMW;
	if (t >= b(58.75)) { const d = clamp01((t - b(58.75)) / (b(60.25) - b(58.75))), z = smooth(clamp01((t - b(60)) / (b(60.25) - b(60)))); return {c: lerpP([PATCH_C[0] - 90 - 30 * d, PATCH_C[1] - 30], ROOMW.c, z), span: lerp(1500, ROOM_SPAN, z)}; }
	// b58.5: out through the painted gate (the arch, tight → wider), then a fast eased slide left to the shed
	const u0 = clamp01((t - b(58.5) + 0.25) / 0.45), u1 = easeInOut(clamp01((t - b(58.5) - 0.1) / (b(58.75) - b(58.5) - 0.1)));
	const span = lerp(lerp(900, 1400, easeOut(u0)), 1500, u1);
	return {c: lerpP([ARCH_C[0] + 40, ARCH_C[1] - 40 + 30 * u0], [PATCH_C[0] - 90, PATCH_C[1] - 30], u1), span};
	void room;
};
const camR = (t: number): Cam => {
	const lc = lensAt(Math.min(t, b(61.5)));
	if (t < b(60.35)) return lensCam(lc);
	if (t < b(61)) { const u = clamp01((t - b(60.35)) / (b(60.75) - b(60.35))); const drift = clamp01((t - b(60.75)) / (b(61) - b(60.75))); const c = blend(lensCam(lc), ROOM, easeInOut(u)); return {...c, z: c.z * (1 + 0.01 * drift)}; }
	if (t < b(61.5)) { const u = clamp01((t - b(61)) / (b(61.25) - b(61))); return blend({...ROOM, z: 1.01}, lensCam(lc), easeInOut(u)); }
	const R2: Cam = {x: 1060, y: 610, z: 1.55, th: TH_R};
	if (t < b(62)) return {...R2, z: R2.z * (1 + 0.012 * clamp01((t - b(61.5)) / (b(62) - b(61.5))))};     // a cut on b61.5 (no third whip); the magnifier swings aside in this wide
	// 31: crane up over the long table to the tail (top-down), drop onto 藏者宜宝之
	const TAIL: Cam = frameAt(360, S.py0 + 41, 2.75), g65 = GL31.find((g) => g.i === 65)!, g69 = GL31.find((g) => g.i === 69)!;
	const DROP: Cam = frameAt(g65.x, (g65.y + g69.y) / 2, 28.5, 1300, 640);
	if (t < b(62.55)) { const u = clamp01((t - b(62)) / (b(62.4) - b(62))); const c = blend({...R2, z: R2.z * 1.012}, TAIL, easeInOut(u), easeInOut(clamp01(u * 1.15))); const dr = clamp01((t - b(62.4)) / (b(62.55) - b(62.4))); return {...c, x: c.x - 6 * dr, z: c.z * (1 + 0.02 * dr)}; }
	const T2: Cam = {...TAIL, x: TAIL.x - 6, z: TAIL.z * 1.02};
	if (t < b(63)) return blend(T2, DROP, easeInOut(clamp01((t - b(62.55)) / (b(63) - b(62.55)))));
	const h = clamp01((t - b(63)) / (b(64) - b(63))); return {...DROP, y: DROP.y + 0.6 * h, z: DROP.z * (1 + 0.035 * h)};
};
const frameAt = (lx: number, ly: number, z: number, sx = 960, sy = 540): Cam => ({x: S.x0 + lx - (sx - 960) / z, y: S.edge - ly - (sy - 540) / z, z, th: 0});

const lk73 = look('restorer1973');
/** the restorers (screen px): one seated behind the table bent over the lens (tweezers at the patch's edge, other hand flat on
 *  the silk; from b61.65 that hand pushes the lamp arm); one standing, both hands flat on the scroll's near margin */
const restorers = (t: number, on: boolean) => {
	const out: {figs: FigOpts[]; tw: [P2, P2] | null} = {figs: [], tw: null};
	const pe = (lx: number, ly: number, lz = 0.5): P2 => strip.screen(lx, ly, lz);
	// seated, facing left
	const seat: FigOpts = {x: 1262, ground: TB.floor, h: 560, pose: fkPose({hip: 0.3, lean: 30, neck: 18, lt: 84, lk: 80, rt: 78, rk: 74, la: 30, le: 40, ra: 26, re: 44}), look: lk73, flip: true};
	const s1 = onScreen(st, seat, ZS), c1: Contact[] = [];
	const tip = pe(lxPatch + 5.5, lyPatch + 1.5, 0.6), grip = pe(lxPatch + 5.5 + 9, lyPatch + 1.5, 26);
	out.tw = [grip, tip];
	c1.push({side: 'R', target: grip, name: 'tweezers'});
	const sw = swingK(t), arm = lensArmPoint(t);
	const silkPt = pe(lxPatch + 24, lyPatch + 30, 0.6);
	if (t < b(61.55)) c1.push({side: 'L', target: silkPt, name: 'flat on silk', opt: {dir: 180}});
	else if (t >= b(61.65) && t < b(62)) c1.push({side: 'L', target: arm, name: 'lamp arm'});
	else if (t >= b(62)) s1.pose = reach(s1.pose, 'L', toBody(s1, arm));            // the crane leaves him; the hand stays on the arm
	else { const k = smooth((t - b(61.55)) / (b(61.65) - b(61.55))); s1.pose = reach(s1.pose, 'L', toBody(s1, lerpP(silkPt, arm, k))); }
	out.figs.push(on ? rig(s1, c1, () => s1.ground, 'restorer-seated') : unlogged(s1, c1)); void sw;
	// standing, facing right, holding the scroll flat by its near margin
	const stand: FigOpts = {x: 905, ground: TB.floor - 40, h: 540, pose: fkPose({hip: 0.62, hipX: -0.12, lean: 62, neck: -6, lt: 10, lk: 8, rt: 5, rk: 6, la: 34, le: 30, ra: 28, re: 25}), look: lk73};
	const s2 = onScreen(st, stand, ZR);
	// his hands go to the near margin where it lies within reach: the margin point about a third of his height in front of the shoulder
	const shS = proj(st, 0, 0, 0) && [s2.x + (s2.pose.RSh[0]) * s2.h, s2.ground - s2.pose.RSh[1] * s2.h] as P2;
	let best = lxPatch - 120, bd = 1e9; for (let lx = lxPatch - 260; lx < lxPatch - 20; lx += 2) { const q = pe(lx, S.py0 + 78, 0.5), d = Math.abs(Math.hypot(q[0] - shS[0], q[1] - shS[1]) - 0.31 * s2.h) + Math.max(0, shS[0] - q[0]) * 5; if (d < bd) { bd = d; best = lx; } }
	const c2: Contact[] = [{side: 'R', target: pe(best, S.py0 + 78, 0.5), name: 'margin', opt: {dir: -6}}, {side: 'L', target: pe(best + 26, S.py0 + 77, 0.5), name: 'margin', opt: {dir: -6}}];
	out.figs.push(!on ? unlogged(s2, c2) : rig(s2, c2, () => s2.ground, 'restorer-standing'));
	return out;
};
/** a point on the lamp's arm (screen px) where the hand pushes it */
const armEnd = (lc: P2): P2 => [lc[0] + LENS.r * 0.4, lc[1] - LENS.r * LENS.asp * 1.25];
/** reach without logging (while the camera cranes off them) */
const unlogged = (f: FigOpts, cs: Contact[]) => { let p = f.pose; for (const c of cs) p = reach(p, c.side, toBody(f, c.target), c.opt ?? {}); return {...f, pose: p}; };
const lensArmPoint = (t: number): P2 => { const m = lerpP(POST, armEnd(lensAt(t)), 0.3); return proj(st, m[0], m[1], 0); };
const drawLamp = (g: CanvasRenderingContext2D, t: number, lc: P2) => {
	const P = (x: number, y: number) => proj(st, x, y, 0), base = P(POST[0], S.edge - 18), top = P(POST[0], POST[1]), lcs = P(lc[0], lc[1]), k = proj(st, 100, 0, 0)[0] - proj(st, 0, 0, 0)[0];
	g.strokeStyle = '#262c2a'; g.lineCap = 'round'; g.lineWidth = 0.09 * k;
	g.beginPath(); g.moveTo(base[0], base[1]); g.lineTo(top[0], top[1]); g.stroke();
	const ae = armEnd(lc), aes = P(ae[0], ae[1]); void lcs;
	g.lineWidth = 0.07 * k; g.beginPath(); g.moveTo(top[0], top[1]); g.lineTo(aes[0], aes[1]); g.stroke();
	g.fillStyle = '#262c2a'; g.beginPath(); g.arc(top[0], top[1], 0.07 * k, 0, Math.PI * 2); g.fill();
	g.fillStyle = '#262c2a'; g.fillRect(base[0] - 0.22 * k, base[1] - 0.05 * k, 0.44 * k, 0.16 * k);
};

// ------------------------------------------------------------------------------------------------ draw
const drawR = (t: number) => {
	const c = camR(t); st.setCam(c.x, c.y, c.z); strip.tilt(c.th);
	drawPatch(t);
	// lens disc + ring follow the (swung) lens; its window: the collage px → uv
	const lc = lensAt(t), win = lensWin(t), u = lensMat.uniforms;
	lens.position.set(lc[0] - W / 2, H / 2 - lc[1], 0); ring.position.set(lc[0] - W / 2, H / 2 - lc[1], 0.5);
	const lo = c.z < 60 ? 1 : 0; lens.visible = ring.visible = lo > 0; lensMat.uniforms.uOpacity.value = lo; (ring.material as Mat).uniforms.uOpacity.value = lo;
	u.uWin.value.set(win.c[0] / CW, 1 - win.c[1] / CH, win.span / 2 / CW, win.span / 2 / CH); u.uDefocus.value = swingK(t);
	u.uPatch.value.set((PATCH_C[0] - 306) / CW, 1 - (PATCH_C[1] - 366 + PATCH_CROP.h) / CH, (PATCH_C[0] - 306 + PATCH_CROP.w) / CW, 1 - (PATCH_C[1] - 366) / CH);
	shedMesh.material = t >= b(61.25) ? shedPeeled : shedDonkey;
	// the tail's glow: 藏者宜宝之 from b63
	glowR.set((i) => (i >= 65 && i <= 69 ? clamp01((t - b(63) - (i - 65) * 0.07) / 0.12) : 0));
	// figures: behind the table, hidden by the table top while the paper stands up
	const fk = `${Math.round(t * 60)}`;
	const poly: P2[] = [strip.screen(TB.x0 - S.x0, 0, -2), strip.screen(TB.x1 - S.x0, 0, -2), strip.screen(TB.x1 - S.x0, S.depth, -2), strip.screen(TB.x0 - S.x0, S.depth, -2)];
	const vis = c.z < 40, R = restorers(t, c.z < 4 && c.th > 1.25)   // drawn all through the dolly (they sweep out of frame); contacts logged in the room, sit = R.figs[0], standF = R.figs[1];
	body.draw(fk, (g) => { if (!vis) return; g.save(); if (c.th > 1.0) { g.beginPath(); g.rect(-50, -50, W + 100, H + 100); g.moveTo(poly[0][0], poly[0][1]); for (const q of poly.slice(1)) g.lineTo(q[0], q[1]); g.closePath(); g.clip('evenodd'); }
		drawFig(g, standF); g.restore(); });
	lampL.draw(fk, (g) => { if (vis) drawLamp(g, t, lc); });
	arms.draw(fk, (g) => { if (!vis) return; drawFig(g, {...standF, part: 'L'}); drawFig(g, {...standF, part: 'R'}); });
	front.draw(fk, (g) => { if (!vis) return; const k = sit.h / 560; g.fillStyle = '#15100C';                       // his low stool, in front of the table
		g.fillRect(sit.x - 80 * k, sit.ground - 160 * k, 150 * k, 13 * k); g.fillRect(sit.x - 70 * k, sit.ground - 150 * k, 11 * k, 150 * k); g.fillRect(sit.x + 48 * k, sit.ground - 150 * k, 11 * k, 150 * k);
		drawFig(g, sit); if (R.tw) { g.strokeStyle = '#1d211f'; g.lineWidth = 3; g.beginPath(); g.moveTo(R.tw[0][0], R.tw[0][1]); g.lineTo(R.tw[1][0], R.tw[1][1]); g.stroke(); } });
	const hero = strip.screen(lxPatch, lyPatch); st.setHero(lc[0] < 2000 && c.th > 1 ? proj(st, lc[0], lc[1], 0)[0] : hero[0], c.th > 1 ? proj(st, lc[0], lc[1], 0)[1] : hero[1], 1100);
	const inLens = c.z > 6 ? 1 : 0, top = c.th < 0.3 ? 1 : 0;
	return {st, grade: {vig: inLens ? 0.62 : top ? 0.5 : 0.3, vigCol: '#1a120b', corners: inLens || top ? 0.95 : 0.25, exposure: 1}, bloom: 1};
};
addScene({id: '30', a: b(58.5), z: b(62), draw: drawR});
addScene({id: '31', a: b(62), z: b(64), draw: drawR});
