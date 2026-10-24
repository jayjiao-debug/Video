// Scenes 14–17 (元). 14: the official entry on the 元 day crest (进②), a push toward the White Dagoba. 15: the mounting room
// at dusk (the Dagoba in its round window): the craftsman lays the grey copy where you lay, rolls you up, cups the lamp.
// 16: the secret sale on the night crest (four hands on the rollers, then under the 权贵's arm, 出②). 17: 杨准's study at
// lamplit dusk: the sale shrinks into a slot in his colophon and replays there; pull back to him writing; his newest
// column's ink spreads (bleeds into scene 18's Ming night).
import * as THREE from 'three';
import {Stage, Live, bar, BEAT, W, H, D, clamp01, smooth, easeInOut, easeOut, easeIn, lerp, mkCanvas, canvasTex, gradCanvas, svgDoc, svgToCanvas, renderer, hash} from './core';
import {addScene, Frame} from './film';
import {Crest, deck} from './crest';
import {Desk} from './rooms';
import {SIL, dagoba, skyline} from './draw';
import {Cast, drawRoll, drawRoller, glowBlob, rig, drawCarriedRoll, drawFig, Contact} from './actors';
import {LOOKS, FigOpts, walkFor, gaitStride, gaitPose, stepFor, armsFrom, underArm, fkPose, LookQ, P, POSES} from './figures';
import {paintSection, silkWeave} from './silk';

const b = bar;
export type Cam = [number, number, number];
type Key = [number, number, number, number];   // [t, x, y, zoom]
/** screen px of a frame-px point at depth z under the stage's current camera */
export const scr = (st: Stage, px: number, py: number, z: number) => st.toScreen(st.at(px, py, z));
/** camera path through keys (cubic Hermite with Catmull-Rom tangents on x, y and log zoom; still at both ends) */
export const camPath = (t: number, K: Key[], openEnd = false): Cam => {
	const n = K.length; if (t <= K[0][0]) return [K[0][1], K[0][2], K[0][3]]; if (t >= K[n - 1][0]) return [K[n - 1][1], K[n - 1][2], K[n - 1][3]];
	let i = 0; while (t > K[i + 1][0]) i++;
	const t0 = K[i][0], t1 = K[i + 1][0], h = t1 - t0, u = (t - t0) / h;
	const v = (j: number, c: number) => (c === 3 ? Math.log(K[j][3]) : K[j][c]);
	const m = (j: number, c: number) => (j === 0 || (j === n - 1 && !openEnd) ? 0 : j === n - 1 ? (v(j, c) - v(j - 1, c)) / (K[j][0] - K[j - 1][0]) : (v(j + 1, c) - v(j - 1, c)) / (K[j + 1][0] - K[j - 1][0]));
	const h00 = 2 * u ** 3 - 3 * u * u + 1, h10 = u ** 3 - 2 * u * u + u, h01 = -2 * u ** 3 + 3 * u * u, h11 = u ** 3 - u * u;
	const out = [1, 2, 3].map((c) => h00 * v(i, c) + h10 * h * m(i, c) + h01 * v(i + 1, c) + h11 * h * m(i + 1, c));
	return [out[0], out[1], Math.exp(out[2])];
};
/** the camera (x, y, zoom) that puts a frame-px point (px, py) at depth z on screen (sx, sy) with a size factor k (screen px per frame px) */
export const solveCam = (px: number, py: number, z: number, sx: number, sy: number, k: number): Cam => {
	const s = (D - z) / D, f = k / s, zoom = D / (D / f + z);          // f = D / (D/zoom − z)
	return [960 + (px - 960) * s - (sx - 960) / f, 540 - ((540 - py) * s - (540 - sy) / f), zoom];
};
/** dim every world material of a stage except the kept ones (your light keeps its value) */
const dimWorld = (st: Stage, keep: Set<THREE.ShaderMaterial>, r: number, g = r, bl = r) => { for (const m of st.mats) if (!keep.has(m)) m.uniforms.uTint.value.setRGB(r, g, bl); };
/** a quick illegible brush glyph (stand-in script) */
export const standinGlyph = (g: CanvasRenderingContext2D, cx: number, cy: number, size: number, seed: number, ink = '#2A1F17', w = 0.085) => {
	const r = (k: number) => hash(seed * 7.13 + k * 1.91), s = size / 2;
	g.strokeStyle = ink; g.lineCap = 'round'; g.lineJoin = 'round';
	const st = (x0: number, y0: number, x1: number, y1: number, bend: number, lw: number) => { g.lineWidth = size * w * lw; g.beginPath(); g.moveTo(cx + x0 * s, cy + y0 * s); g.quadraticCurveTo(cx + ((x0 + x1) / 2 + bend) * s, cy + ((y0 + y1) / 2 - bend * 0.6) * s, cx + x1 * s, cy + y1 * s); g.stroke(); };
	const nh = 1 + Math.floor(r(1) * 3);
	for (let i = 0; i < nh; i++) { const y = -0.6 + (1.2 * (i + 0.5)) / nh + (r(2 + i) - 0.5) * 0.2, l = 0.5 + r(5 + i) * 0.45; st(-l, y + 0.04, l, y - 0.05, (r(9 + i) - 0.5) * 0.15, 1); }
	if (r(12) < 0.8) { const x = (r(13) - 0.5) * 0.6; st(x, -0.85, x + 0.03, 0.85, (r(14) - 0.5) * 0.1, 1.1); }
	if (r(15) < 0.6) st(-0.05, -0.1, -0.75, 0.75, -0.15, 0.9);
	if (r(16) < 0.55) st(0.05, -0.05, 0.8, 0.7, 0.1, 0.8);
	if (r(17) < 0.5) { g.fillStyle = ink; g.beginPath(); g.arc(cx + (r(18) - 0.5) * s, cy - 0.75 * s, size * 0.05, 0, Math.PI * 2); g.fill(); }
	if (r(19) < 0.35) { const x0 = -0.8 + r(20) * 0.4; st(x0, -0.6, x0 + 0.05, 0.6, 0.05, 0.8); st(x0, -0.6, x0 + 0.45, -0.58, 0.02, 0.8); }
};
/** one column of stand-in glyphs */
const standinColumn = (g: CanvasRenderingContext2D, x: number, y0: number, n: number, size: number, pitch: number, seed: number, ink = 'rgba(42,31,23,0.9)', w = 0.085) => { for (let i = 0; i < n; i++) standinGlyph(g, x + (hash(seed + i * 3.3) - 0.5) * size * 0.08, y0 + i * pitch, size * (0.9 + hash(seed * 1.7 + i) * 0.16), seed * 31 + i, ink, w); };

/** people carrying you take a shorter, careful step */
export const careful = (u: number) => gaitPose('08_04', u, 0.7);
export const CAREFUL = gaitStride('08_04', 0.7);
/** a rolled scroll: as actors.drawRoll, but its brightest band stays ≤ ~85 % luma (the bloom carries the glow) */
export const softRoll = (g: CanvasRenderingContext2D, p0: P, p1: P, r: number) => {
	const dx = p1[0] - p0[0], dy = p1[1] - p0[1], L = Math.hypot(dx, dy), a = Math.atan2(dy, dx);
	g.save(); g.translate(p0[0], p0[1]); g.rotate(a);
	const gr = g.createLinearGradient(0, -r, 0, r); gr.addColorStop(0, '#DDBB84'); gr.addColorStop(0.45, '#EED8AE'); gr.addColorStop(1, '#BE905A');
	g.fillStyle = gr; g.beginPath(); g.roundRect(0, -r, L, 2 * r, r * 0.4); g.fill();
	g.fillStyle = '#34506A'; g.fillRect(0, -r, L * 0.06, 2 * r); g.fillRect(L * 0.94, -r, L * 0.06, 2 * r);
	g.fillStyle = '#DCCDB0'; for (const x of [-r * 0.25, L + r * 0.25]) { g.beginPath(); g.ellipse(x, 0, r * 0.35, r * 0.7, 0, 0, Math.PI * 2); g.fill(); }
	g.restore();
};
export const SILK_BASE = '#EEDAB2';

// ================================================================================================ shared art
let riverMono: HTMLCanvasElement & {silk: any}, riverGrey: HTMLCanvasElement & {silk: any};
/** draw a window of the river painting (around the 虹桥) into a rect, as an open silk: mount bands, the painting */
const silkPanel = (g: CanvasRenderingContext2D, src: HTMLCanvasElement & {silk: any}, x0: number, y0: number, w: number, h: number, dead = false) => {
	if (w < 2) return; const br = src.silk.bridge, sh = src.height * 0.62, sw = sh * (w / h), cx = br.x + br.w * 0.5, sx = Math.max(0, Math.min(src.width - sw, cx - sw / 2)), sy = Math.max(0, br.y - sh * 0.22);
	g.save(); g.beginPath(); g.rect(x0, y0, w, h); g.clip();
	g.fillStyle = dead ? '#9A968E' : SILK_BASE; g.fillRect(x0, y0, w, h);
	g.globalAlpha = 0.95; g.drawImage(src, sx, sy, sw, sh, x0, y0, w, h); g.globalAlpha = 1;
	g.fillStyle = dead ? 'rgba(90,88,84,0.95)' : 'rgba(52,80,106,0.92)'; g.fillRect(x0, y0, w, Math.max(2, h * 0.06)); g.fillRect(x0, y0 + h - Math.max(2, h * 0.06), w, Math.max(2, h * 0.06));
	g.restore();
};
/** a roller lying on a table top (seen from above): a short bar across the table's depth */
const tableRoller = (g: CanvasRenderingContext2D, x: number, y0: number, y1: number, dead = false) => {
	g.fillStyle = dead ? '#5a5a58' : '#34506A'; g.beginPath(); g.roundRect(x - 6, y0 - 7, 12, y1 - y0 + 14, 5); g.fill();
	g.fillStyle = dead ? '#8a867e' : '#EADCC0'; for (const y of [y0 - 9, y1 + 9]) { g.beginPath(); g.ellipse(x, y, 6.5, 3.5, 0, 0, Math.PI * 2); g.fill(); }
};

// ================================================================================================ 14 · 元 day crest, 进②
let c14: Crest, cast14: Cast, roll14: Live;
const H14 = 560;
const lkCarrier: LookQ = {...LOOKS.yuanNoble, beard: 'short', build: 1.02};
const lkLead: LookQ = {...LOOKS.yuanNoble, beard: 'long', build: 1.0};
const lkRear: LookQ = {...LOOKS.yuanNoble, build: 1.06};
const STR14 = CAREFUL * H14;
const g14 = (x: number) => (x < -740 || x > 2660 ? 1380 : deck(x));
const x14 = (t: number) => 960 - ((t - b(24)) / (2 * BEAT)) * STR14;          // the carrier tops the crest on b24
// side-on wide (raised a little so the far bank sits behind the carry); from b24.5 a slow push left toward the Dagoba
const K14: Key[] = [[b(23), 1010, 318, 0.62], [b(24), 860, 320, 0.62], [b(24.5), 470, 330, 0.63], [b(25), -600, 360, 0.70]];
const walk14 = (t: number) => {
	const u = (t - b(24)) / (2 * BEAT), x1 = x14(t), gr = g14(x1);
	const rc: P = [x1 - 0.11 * H14, gr - 0.64 * H14], hl = 0.11 * H14;          // cradled against the chest
	const e0: P = [rc[0] - hl, rc[1] + 3], e1: P = [rc[0] + hl, rc[1] - 3];
	const car = rig({x: x1, ground: gr, h: H14, pose: careful(u + 0.1), look: lkCarrier, flip: true},
		[{side: 'L', target: [e0[0] + 8, e0[1] + 9], name: 'roll front end'}, {side: 'R', target: [e1[0] - 8, e1[1] + 9], name: 'roll back end'}], g14, 'official-carrier');
	const xa = x1 - 300, xr = x1 + 330, ua = u * H14 / (H14 + 8), ur = u * H14 / (H14 - 6);   // same speed, each with his own stride
	const lead = rig({x: xa, ground: g14(xa), h: H14 + 8, pose: careful(ua + 0.38), look: lkLead, flip: true}, [], g14, 'official-lead');
	const rear = rig({x: xr, ground: g14(xr), h: H14 - 6, pose: careful(ur + 0.72), look: lkRear, flip: true}, [], g14, 'official-rear');
	return {figs: [rear, lead, car], car, e0, e1, rc};
};
export const d14 = (t: number): Frame => {
	const st = c14.st, [cx, cy, zm] = camPath(t, K14); st.setCam(cx, cy, zm);
	const w = walk14(t), fk = `${Math.round(t * 30)}`;
	cast14.draw(fk, w.figs);
	roll14.drawW(fk, (g) => { glowBlob(g, w.rc, 170, 95, 0.4); softRoll(g, w.e0, w.e1, 14); drawFig(g, {...w.car, part: 'L'}); });
	c14.setLanterns(() => 1); c14.setBoat(1760 - (t - b(23)) * 22, 0); c14.setStreak(w.rc[0], 0.25, t);
	st.heroAt(w.rc[0], w.rc[1], 22, 640);
	return {st, grade: {vig: 0.62, vigCol: '#141a1b', exposure: 1}, bloom: 1};
};
/** where the Dagoba sits on screen at the end of 14 (axis x, base y, height): the match into 15's round window */
let DAG_END = {x: 0, y: 0, h: 0};

// ================================================================================================ 15 · ROOM-元 at dusk: the swap
const WIN = {x: 560, y: 440, r: 270};               // the round window (frame px at rest, wall depth −900)
const DAG15 = {x: WIN.x, base: 664, s: 0.9};          // the Dagoba outside, just behind the wall (−960): it stays in the window at any camera
const TOPB = 690, TOPF = 860;                         // table top back / front edge
const BACK = [700, 758] as const, FRONT = [770, 850] as const;   // the two bands on the table (copy behind, you in front)
const G15 = 1215, H15 = 760;                          // the craftsman stands behind the table (feet hidden below the frame)
const LAMP15: P = [1110, 470];
const lkCraft = LOOKS.yuanCraftsman;
let room15: Stage, cast15: Cast, arms15: Cast, you15: Live, copy15: Live, glow15: Live, lamp15: Live;
let CAM15_0: Cam = [960, 540, 1];
const CAM15_1: Cam = [985, 615, 1.34];
const buildRoom15 = async () => {
	const st = new Stage('room15'); room15 = st;
	st.add('osky', canvasTex(gradCanvas([[0, '#2B4552'], [0.36, '#4d6869'], [0.52, '#6E827E'], [0.7, '#C9A877'], [0.8, '#E6B676'], [0.9, '#F3CC8E'], [1, '#E9C08A']])), WIN.x, 470, 3200, 1400, -2600);
	const sun = svgDoc(`<defs><radialGradient id="g"><stop offset="0" stop-color="#FFE3B0" stop-opacity="0.8"/><stop offset="0.4" stop-color="#F2B060" stop-opacity="0.3"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient></defs><circle cx="400" cy="300" r="300" fill="url(#g)"/>`, 800, 600);
	st.add('sun', canvasTex(await svgToCanvas(sun, 800, 600, 0.5)), WIN.x + 120, 640, 800, 600, -2500, {emissive: 0.15});
	const out = svgDoc(`${skyline(WIN.x - 900, WIN.x + 900, DAG15.base + 14, 30, 74, 53, '#3a4544')}${dagoba(DAG15.x, DAG15.base, DAG15.s, '#3c4747')}`, W, H);
	st.add('out', canvasTex(await svgToCanvas(out, W, H, 0.8)), 960, 540, W, H, -960, {fog: ['#BCA07A', 0.2]});
	// the wall: round window, its dark ring, two pillars, hung scrolls (right, low, dim), a ceiling beam
	const wall = svgDoc(`<path fill-rule="evenodd" fill="#3a4b53" d="M-1100,-500 L3020,-500 L3020,1600 L-1100,1600 Z M${WIN.x},${WIN.y} m-${WIN.r},0 a${WIN.r},${WIN.r} 0 1,0 ${2 * WIN.r},0 a${WIN.r},${WIN.r} 0 1,0 -${2 * WIN.r},0 Z"/>
		<circle cx="${WIN.x}" cy="${WIN.y}" r="${WIN.r + 12}" fill="none" stroke="#15100C" stroke-width="26"/>
		<rect x="1440" y="330" width="96" height="330" fill="#2c383e"/><rect x="1434" y="322" width="108" height="12" fill="#15100C"/><rect x="1434" y="656" width="108" height="12" fill="#15100C"/>
		<rect x="1590" y="350" width="84" height="300" fill="#2c383e"/><rect x="1584" y="342" width="96" height="12" fill="#15100C"/><rect x="1584" y="646" width="96" height="12" fill="#15100C"/>
		<rect x="-1100" y="-500" width="4120" height="440" fill="#1b1814"/><rect x="-1100" y="-80" width="4120" height="26" fill="#15100C"/>
		<rect x="40" y="-500" width="40" height="2100" fill="#1f2528"/><rect x="1820" y="-500" width="40" height="2100" fill="#1f2528"/>`, 4120, 2100, '', -1100, -500);
	st.add('wall', canvasTex(await svgToCanvas(wall, 4120, 2100, 0.6)), 960, 550, 4120, 2100, -900, {rim: 0.35});
	lamp15 = new Live(st, 'lamp', 960, 540, W, H, -120, {emissive: 1.25}, 1);
	cast15 = new Cast(st, 'craftsman', 960, 640, W + 400, 1300, -80);
	// table top (behind the hands and silks, in front of his body), the silks, his arms again, your halo, the table front
	const top = mkCanvas(2600, 260), gt = top.getContext('2d')!; const tg = gt.createLinearGradient(0, 0, 0, 260); tg.addColorStop(0, '#2c2219'); tg.addColorStop(1, '#4a3826'); gt.fillStyle = tg; gt.fillRect(0, 0, 2600, 260);
	gt.fillStyle = 'rgba(255,220,170,0.04)'; for (let i = 0; i < 26; i++) gt.fillRect(0, 6 + i * 9.5, 2600, 1.2);
	st.add('top', canvasTex(top), 960, TOPB + (TOPF - TOPB) / 2 + 10, 2600, TOPF - TOPB + 20, -60, {rim: 0.0});
	copy15 = new Live(st, 'copy', 960, 780, W, 260, -56, {}, 1.4);
	you15 = new Live(st, 'you', 960, 780, W, 260, -54, {emissive: 0.34}, 1.4);
	arms15 = new Cast(st, 'arms', 960, 640, W + 400, 1300, -50);
	glow15 = new Live(st, 'glow', 960, 640, W + 400, 1300, -48, {emissive: 1.0}, 0.5);
	const front = svgDoc(`<rect x="-400" y="${TOPF}" width="2720" height="30" fill="#1d1610"/><rect x="-400" y="${TOPF + 28}" width="2720" height="420" fill="#16110d"/>
		<rect x="-400" y="${TOPF + 28}" width="2720" height="8" fill="#0f0b08"/>`, 2720, 460, '', -400, TOPF);
	st.add('front', canvasTex(await svgToCanvas(front, 2720, 460, 0.7)), 960, TOPF + 230, 2720, 460, -40, {rim: 0.5, rimPx: 4});
	st.add('floorshade', canvasTex(gradCanvas([[0, 'rgba(10,8,6,0)'], [1, 'rgba(10,8,6,0.6)']])), 960, 1040, 3200, 200, -38);
};
// the action, beat by beat (x = craftsman's position behind the table; he faces left)
type S15 = {X: number; lean: number; you: [number, number]; youRolled: number; copy: [number, number]; copyY: number; L: P | null; R: P | null; Lflat: boolean; lamp: number; cup: number};
const s15 = (t: number): S15 => {
	const SW = 280, P0 = 760;
	const k1 = smooth(clamp01((t - b(25.15)) / (0.2 * BAR_))), k2 = smooth(clamp01((t - b(25.36)) / (0.18 * BAR_))), k3 = smooth(clamp01((t - b(26.0)) / (0.2 * BAR_)));
	const kup = smooth(clamp01((t - b(26.2)) / (0.12 * BAR_)));
	const youX0 = P0 + 300 * k1, you: [number, number] = [lerp(youX0, youX0 + SW - 14, k3), youX0 + SW];
	const copyX0 = lerp(P0 + 40, P0, k2), copy: [number, number] = [copyX0, copyX0 + SW], copyY = k2;          // 0 back band → 1 front band
	const X = 1190 + 60 * smooth(clamp01((t - b(25.12)) / 0.25)) - 60 * smooth(clamp01((t - b(25.36)) / 0.22)) + 60 * smooth(clamp01((t - b(25.7)) / 0.3));
	const yc = (FRONT[0] + FRONT[1]) / 2, ycb = (BACK[0] + BACK[1]) / 2, ycopy = lerp(ycb, yc, copyY);
	let L: P | null, R: P | null, Lflat = false;
	if (t < b(25.12)) { L = [P0 + 190, yc + 2]; Lflat = true; R = [P0 + 40 + SW, ycb]; }                       // flat on you; near hand on the copy's roller
	else if (t < b(25.36)) { L = [you[0] + 168, yc + 2]; Lflat = true; R = [you[1], yc]; }                    // draws you aside (right)
	else if (t < b(25.75)) { L = [copy[1], ycopy]; R = [you[1], yc]; }                                          // lays the copy where you lay
	else { L = [you[0], yc]; R = [you[1], yc]; }                                                               // both hands on your rollers, rolls you up
	if (kup > 0) R = [lerp(you[1], LAMP15[0] + 26, kup), lerp(yc, LAMP15[1] + 6, kup)];                        // the near hand cups the lamp
	const lamp = 1 - smooth(clamp01((t - b(26.27)) / (b(26.5) - b(26.27) - 0.02)));
	const lean = lerp(52, 16, kup);
	return {X, lean, you, youRolled: k3, copy, copyY, L, R, Lflat, lamp, cup: kup};
};
const BAR_ = 4 * BEAT;
const craftsman15 = (s: S15): FigOpts => {
	const base = fkPose({hip: 0.645, hipX: -0.1, lean: s.lean, neck: -4, lt: 8, lk: 6, rt: 4, rk: 4, la: 30, le: 30, ra: 20, re: 20});
	const c: Contact[] = [];
	if (s.L) c.push({side: 'L', target: s.L, opt: s.Lflat ? {dir: 0} : {}, name: s.Lflat ? 'hand flat on your silk' : 'roller'});
	if (s.R) c.push({side: 'R', target: s.R, name: s.cup > 0.98 ? 'hand round the lamp' : 'roller'});
	return rig({x: s.X, ground: G15, h: H15, pose: base, look: lkCraft, flip: true}, c, () => G15, 'craftsman15');
};
const drawLamp15 = (g: CanvasRenderingContext2D, k: number, cup: number) => {
	const [x, y] = LAMP15; g.strokeStyle = '#15100C'; g.lineWidth = 3; g.beginPath(); g.moveTo(x, -120); g.lineTo(x, y - 34); g.stroke();
	g.fillStyle = '#15100C'; g.fillRect(x - 20, y - 36, 40, 7); g.fillRect(x - 16, y + 30, 32, 6);
	const c = [40 + 205 * k, 32 + 160 * k, 24 + 84 * k].map(Math.round); g.fillStyle = `rgb(${c[0]},${c[1]},${c[2]})`; g.beginPath(); g.ellipse(x, y, 24, 31, 0, 0, Math.PI * 2); g.fill();
	g.strokeStyle = 'rgba(21,16,12,.5)'; g.lineWidth = 2; for (const dx of [-9, 0, 9]) { g.beginPath(); g.moveTo(x + dx, y - 29); g.quadraticCurveTo(x + dx * 1.5, y, x + dx, y + 29); g.stroke(); }
	if (k > 0) glowBlob(g, [x, y], 105 * (1 - 0.4 * cup), 95 * (1 - 0.4 * cup), 0.3 * k, '255,184,104');
};
export const d15 = (t: number): Frame => {
	const st = room15, s = s15(t);
	const mv = easeInOut(clamp01((t - b(25)) / (b(25.6) - b(25))));
	const cam: Cam = [lerp(CAM15_0[0], CAM15_1[0], mv), lerp(CAM15_0[1], CAM15_1[1], mv), Math.exp(lerp(Math.log(CAM15_0[2]), Math.log(CAM15_1[2]), mv))];
	st.setCam(cam[0], cam[1] + Math.sin(t * 0.7) * 2, cam[2] * (1 + 0.008 * clamp01((t - b(25.6)) / 2)));
	const fk = `${Math.round(t * 30)}`, fig = craftsman15(s);
	cast15.draw(fk, [fig]);
	arms15.L.drawW(fk, (g) => { drawFig(g, {...fig, part: 'R'}); drawFig(g, {...fig, part: 'L'}); });
	const yc = (FRONT[0] + FRONT[1]) / 2, fh = FRONT[1] - FRONT[0], bh = BACK[1] - BACK[0];
	copy15.drawW(fk, (g) => {
		const y0 = lerp(BACK[0], FRONT[0], s.copyY), h = lerp(bh, fh, s.copyY);
		silkPanel(g, riverGrey, s.copy[0], y0, s.copy[1] - s.copy[0], h, true); tableRoller(g, s.copy[0], y0, y0 + h, true); tableRoller(g, s.copy[1], y0, y0 + h, true);
	});
	you15.drawW(fk, (g) => {
		const [x0, x1] = s.you; if (x1 - x0 > 18) silkPanel(g, riverMono, x0, FRONT[0], x1 - x0, fh);
		else { g.fillStyle = '#F3D9A6'; g.beginPath(); g.roundRect(x0 - 8, FRONT[0] - 2, x1 - x0 + 16, fh + 4, 9); g.fill(); }
		tableRoller(g, x0, FRONT[0], FRONT[1]); tableRoller(g, x1, FRONT[0], FRONT[1]);
	});
	const youC: P = [(s.you[0] + s.you[1]) / 2, yc];
	glow15.drawW(fk, (g) => glowBlob(g, youC, 200 - 110 * s.youRolled, 90, 0.32));
	lamp15.draw(`${s.lamp.toFixed(3)}:${s.cup.toFixed(2)}`, (g) => drawLamp15(g, s.lamp, s.cup));
	st.heroAt(youC[0], youC[1], -54, 780);
	return {st, grade: {vig: 0.38, vigCol: '#120e0b', exposure: 1}, bloom: 1};
};

// ================================================================================================ 16 · the secret sale, night crest, 出②
let c16: Crest, cast16: Cast, silk16: Live, rollers16: Live, glow16: Live, win16: Live;
const SX0 = 742, SX1 = 1178, SY = 588, SH = 186, HF = 560;
const lkSeller = LOOKS.yuanCraftsman, lkBuyer: LookQ = LOOKS.yuanNoble;
const STR16 = CAREFUL * (HF + 12);
/** rollK 0 open → 1 closed (the left roller winds over to the 权贵's); the craftsman lets go at 1 */
const hold16 = (t: number) => {
	const k = smooth(clamp01((t - b(27.0)) / (0.3 * BAR_))), lean = Math.sin(t * 1.3) * 0.6;
	const xL = lerp(SX0, SX1 - 26, k), xR = SX1;
	const ax = SX0 - 98, bx = SX1 + 96;
	const let_go = xL > SX0 + 50;                           // he follows his roller a hand's width, then lets go
	const A = rig({x: ax, ground: deck(ax) + 4, h: HF, pose: fkPose({hip: 0.655, lean: 7 + lean + 5 * smooth(clamp01((xL - SX0) / 50)), neck: 6, lt: 2, lk: 2, rt: -3, rk: 3, la: -3, le: 10, ra: 4, re: 14}), look: lkSeller},
		let_go ? [] : [{side: 'R', target: [xL, SY - 46], name: 'upper roller'}, {side: 'L', target: [xL, SY + 34], name: 'lower roller'}], deck, 'craftsman16');
	const B = rig({x: bx, ground: deck(bx) + 4, h: HF + 12, pose: fkPose({hip: 0.655, lean: 8 - lean, neck: 6, lt: 2, lk: 2, rt: -3, rk: 3, la: -3, le: 10, ra: 4, re: 14}), look: lkBuyer, flip: true},
		[{side: 'R', target: [xR, SY - 46], name: 'upper roller'}, {side: 'L', target: [xR, SY + 34], name: 'lower roller'}], deck, 'quangui16');
	return {A, B, xL, xR, k};
};
/** from b27.5 the 权贵 walks off right, the roll under his arm */
const walk16 = (t: number) => {
	const t0 = b(27.5), u = (t - t0) / (2 * BEAT), x = SX1 + 96 + 30 + u * STR16;
	let p = careful(u + 0.5); p = armsFrom(p, underArm(p), 'R');
	const B = rig({x, ground: deck(x) + 4, h: HF + 12, pose: p, look: lkBuyer}, [], deck, 'quangui16-walk');
	const ax = SX0 - 98;
	const A = rig({x: ax, ground: deck(ax) + 4, h: HF, pose: fkPose({hip: 0.655, lean: 3, neck: 2, lt: 2, lk: 2, rt: -3, rk: 3, la: -2, le: 8, ra: 3, re: 10}), look: lkSeller}, [], deck, 'craftsman16');
	return {A, B};
};
export const d16 = (t: number): Frame => {
	const st = c16.st; st.setCam(960 + (t - b(26.5)) * 4, 552, 1.0 + (t - b(26.5)) * 0.006);
	const fk = `${Math.round(t * 30)}`, walking = t >= b(27.5);
	let hero: P;
	if (!walking) {
		const h = hold16(t); cast16.draw(fk, [h.A, h.B]);
		silk16.drawW(fk, (g) => { const w = h.xR - h.xL; if (w > 4) silkPanel(g, riverMono, h.xL, SY - SH / 2, w, SH); });
		rollers16.drawW(fk, (g) => { drawRoller(g, h.xL, SY, SH + 24); drawRoller(g, h.xR, SY, SH + 24); });
		hero = [(h.xL + h.xR) / 2, SY];
		glow16.drawW(fk, (g) => { glowBlob(g, hero, lerp(330, 130, h.k), lerp(220, 120, h.k), 0.3); glowBlob(g, hero, 900, 520, 0.07); });
	} else {
		const w = walk16(t); cast16.draw(fk, [w.A, w.B]); silk16.drawW(fk, () => {});
		rollers16.drawW(fk, (g) => { drawCarriedRoll(g, w.B, 'quangui16-carry', 'R', 0.29, 13, 1); });
		hero = carried16(w.B);
		glow16.drawW(fk, (g) => { glowBlob(g, hero, 120, 80, 0.36); glowBlob(g, hero, 760, 440, 0.06); });
	}
	rollers16.L.mat.uniforms.uEmissive.value = walking ? 0.55 : 0;
	// the lanterns die on the cut (lamp-out match), all together within three frames
	c16.setLanterns(() => clamp01(1 - (t - b(26.5)) / 0.1)); c16.setBoat(1640, 72); c16.setStreak(hero[0], 0.75, t);
	st.heroAt(hero[0], hero[1], 22, walking ? 520 : 760);
	return {st, grade: {vig: 0.34, vigCol: '#0e1114', exposure: 1}, bloom: 1};
};
const carried16 = (f: FigOpts): P => { const [r0, r1] = underArmRollScreen(f); return [(r0[0] + r1[0]) / 2, (r0[1] + r1[1]) / 2]; };
import {underArmRoll, toScreen as figToScreen} from './figures';
const underArmRollScreen = (f: FigOpts): [P, P] => { const [a, c] = underArmRoll(f.pose, 'R', 0.29); return [figToScreen(f, a), figToScreen(f, c)]; };

// ================================================================================================ 17 · 杨准's study: the record
let desk17: Desk, cast17: Cast, paper17: any, slot17: any, ink17: Live, roll17: Live, lamp17: Live, glow17: Live, rt17: THREE.WebGLRenderTarget;
const PSRC_W = 2400, PSRC_H = 1536;                     // the paper canvas (src px): 杨准's sheet (left) + an earlier colophon (right)
const PX0 = 720, PW = 1060, PK = PW / PSRC_W, PHF = PSRC_H * PK;   // world x range; scale; full (upright) height
const DTB = 652, DTF = 714, PYB = 658, PYF = 708;       // desk top back / front edge; the paper lying on it (back → front)
const SLOT = {x: 840, y: 640, w: 384, h: 216};          // the replay slot in 杨准's column (src px), 16:9
const NEWX = 286, NEWY0 = 220, NEWP = 68, NEWN = 16;    // the newest column (src px): x, first glyph centre, pitch, glyphs
const BCOL = (c: number) => 1210 - c * 84;              // the colophon painter's small-script columns, moved onto 杨准's sheet
let cells17: HTMLCanvasElement;                         // 16 glyph cells (84 × 72) to ink the newest column with
const H17 = 700, FLOOR17 = 1040, X17 = 640;
const lkYang = LOOKS.yuanScholar;
/** f = 0 the paper faces the camera (upright on the desk's front edge) → 1 lying on the desk (foreshortened) */
const paperY = (f: number) => { const y1 = lerp(PYF + 350, PYF, f), h = lerp(PHF, PYF - PYB, f); return {y0: y1 - h, h}; };
const srcToWorld = (sx: number, sy: number, f: number): P => { const r = paperY(f); return [PX0 + sx * PK, r.y0 + (sy / PSRC_H) * r.h]; };
let CAM17_0: Cam = [1100, 300, 2.35];
const CAM17_1: Cam = [1120, 590, 1.0];
const slotRect = () => { const a = srcToWorld(SLOT.x, SLOT.y, 0), c = srcToWorld(SLOT.x + SLOT.w, SLOT.y + SLOT.h, 0); return {x: a[0], y: a[1], w: c[0] - a[0], h: c[1] - a[1]}; };
/** the screen rect the PIP lands in (scene 17's opening camera, f = 0) */
const SLOT_SCREEN = {cx: 1056, cy: 520, w: 400};
const paperCanvas = () => {
	const c = mkCanvas(PSRC_W, PSRC_H), g = c.getContext('2d')!;
	// the colophon painter's other hands: its small regular script (cols at 2540 − 84c) becomes 杨准's sheet (left), its large
	// running hand an earlier colophon (right). Illegible stand-ins, as the board asks; no invented text.
	const col = paintSection('colophon', {width: 4096, height: 1536, mode: 'mono', seed: 47});
	g.drawImage(col, 1330, 0, 1270, PSRC_H, 0, 0, 1270, PSRC_H);
	g.drawImage(col, 0, 0, PSRC_W - 1270, PSRC_H, 1270, 0, PSRC_W - 1270, PSRC_H);
	const blank = (x: number, y: number) => g.drawImage(col, 1330 + x - 42, 120, 84, 72, x - 42, y - 36, 84, 72);   // paper (with its ruling) from the same column's top margin
	for (const cc of [11, 12, 13]) for (let k = 0; k < 18; k++) blank(BCOL(cc), NEWY0 + k * NEWP);                       // the newest columns: still blank
	for (let cc = 0; cc < 14; cc++) { const x = BCOL(cc); if (x < SLOT.x - 40 || x > SLOT.x + SLOT.w + 40) continue;
		for (let k = 0; k < 18; k++) { const y = NEWY0 + k * NEWP; if (y > SLOT.y - 56 && y < SLOT.y + SLOT.h + 56) blank(x, y); } }
	g.strokeStyle = 'rgba(42,31,23,0.85)'; g.lineWidth = 4; g.strokeRect(SLOT.x - 9, SLOT.y - 9, SLOT.w + 18, SLOT.h + 18); g.lineWidth = 1.4; g.strokeRect(SLOT.x - 16, SLOT.y - 16, SLOT.w + 32, SLOT.h + 32);
	cells17 = mkCanvas(84, 72 * NEWN); const gc = cells17.getContext('2d')!;
	for (let k = 0; k < NEWN; k++) gc.drawImage(col, 2540 - 2 * 84 - 42, NEWY0 + k * NEWP - 36, 84, 72, 0, k * 72, 84, 72);
	return c;
};
/** glyphs of the newest column written by time t (fractional = the stroke in progress) */
const written17 = (t: number) => 9 + clamp01((t - b(27.75)) / (b(29.25) - b(27.75))) * 4.6;
const brushTip17 = (t: number, f: number): P => { const n = written17(t), k = Math.min(NEWN - 1, Math.floor(n)), fr = n - Math.floor(n); return srcToWorld(NEWX + Math.sin(fr * 9) * 12, NEWY0 + k * NEWP - 22 + fr * 44, f); };
const yang17 = (t: number, f: number): FigOpts => {
	const tip = brushTip17(t, f), flat = srcToWorld(150, 900, f);
	const base = fkPose({hip: 0.372, lean: 20, neck: 12, lt: 88, lk: 92, rt: 84, rk: 86, la: 30, le: 50, ra: 30, re: 50});
	return rig({x: X17, ground: FLOOR17, h: H17, pose: base, look: lkYang}, [{side: 'R', target: [tip[0] - 8, tip[1] - 44], name: 'brush'}, {side: 'L', target: [flat[0], flat[1] - 3], opt: {dir: -6}, name: 'hand flat on the paper'}], () => FLOOR17, 'yangzhun17');
};
/** the replay inside the slot: the sale's own frames, re-rendered (craftsman, copy, hand-over) */
const replayAt = (t: number): [(t: number) => Frame, number] => {
	const r0 = b(28) + 0.12, r1 = r0 + 0.72, r2 = b(29);
	if (t < r0) return [d16, t];                                              // the walk-off continues for a moment
	if (t < r1) return [d15, b(25.42) + (t - r0) * 1.25];                     // the copy laid where you lay, you rolled up
	const u = clamp01((Math.min(t, r2) - r1) / (r2 - r1));
	return [d16, lerp(b(26.6), b(27.95), u)];                                 // the sale, the roll closed, the hand-over, the walk-off
};
const renderInto = (st: Stage, target: THREE.WebGLRenderTarget) => {
	if ((window as any).NODRAW) return;
	for (const m of st.mats) { m.uniforms.uHero.value.copy(st.hero); m.uniforms.uHeroR.value = st.heroR; m.uniforms.uGlowPass.value = 0; m.uniforms.uRes.value.set(target.width, target.height); }
	st.scene.background = null; renderer.setRenderTarget(target); renderer.setClearColor(0x000000, 1); renderer.clear(); renderer.render(st.scene, st.cam);
	for (const m of st.mats) m.uniforms.uRes.value.set(W, H);
	renderer.setRenderTarget(null);
};
const placeOnPaper = (L: any, sx0: number, sy0: number, sw: number, sh: number, f: number, z: number) => {
	const a = srcToWorld(sx0, sy0, f), c = srcToWorld(sx0 + sw, sy0 + sh, f), h0 = sh * PK;
	L.mesh.position.copy(desk17.st.at((a[0] + c[0]) / 2, (a[1] + c[1]) / 2, z)); L.mesh.scale.set(1, (c[1] - a[1]) / h0, 1);
};
const pb17 = (t: number) => easeInOut(clamp01((t - b(28.05)) / (b(28.9) - b(28.05))));
const cam17 = (t: number): Cam => {
	const pb = pb17(t), push = easeInOut(clamp01((t - b(29)) / (b(29.25) - b(29)))) * 0.28 + easeIn(clamp01((t - b(29.25)) / (b(29.5) - b(29.25)))) * 0.12;
	let cam: Cam = [lerp(CAM17_0[0], CAM17_1[0], pb), lerp(CAM17_0[1], CAM17_1[1], pb), Math.exp(lerp(Math.log(CAM17_0[2]), Math.log(CAM17_1[2]), pb))];
	if (push > 0) { const tip = brushTip17(Math.min(t, b(29.25)), 1); cam = [lerp(cam[0], tip[0] + 40, push * 1.4), lerp(cam[1], tip[1] - 10, push * 1.4), cam[2] * (1 + push * 2.2)]; }
	return cam;
};
/** scene 18's ink bleed starts where the brush rests (uv, y up); filled at boot */
export const BLEED_PT: [number, number] = [0.5, 0.5];
export const d17 = (t: number): Frame => {
	const st = desk17.st;
	const f = easeInOut(clamp01((t - b(28.05)) / (b(28.62) - b(28.05)))), pb = pb17(t);
	const cam = cam17(t); st.setCam(cam[0], cam[1], cam[2]);
	const fk = `${Math.round(t * 30)}`;
	// the paper and everything on it share one transform
	placeOnPaper(paper17, 0, 0, PSRC_W, PSRC_H, f, 0);
	placeOnPaper(slot17, SLOT.x, SLOT.y, SLOT.w, SLOT.h, f, 0);
	placeOnPaper(ink17.L, NEWX - 90, 0, 180, PSRC_H, f, 0);
	placeOnPaper(roll17.L, PSRC_W - 60, -40, 140, PSRC_H + 80, f, 0);
	// the replay (from b28: the PIP has landed)
	if (t >= b(28) - 0.02) { const [fn, ts] = replayAt(t); const fr = fn(ts); renderInto(fr.st, rt17); }
	slot17.mat.uniforms.uFog.value.set(0.91, 0.84, 0.69, 0.16 * smooth(clamp01((t - b(28.2)) / 0.5)));
	// the newest column, inked live; from b29 its ink spreads where the brush rests
	const n = written17(t), blot = smooth(clamp01((t - b(29.0)) / (b(29.45) - b(29.0))));
	ink17.draw(`${n.toFixed(2)}:${blot.toFixed(3)}`, (g) => {
		g.save(); g.scale(PK, PK); g.translate(-(NEWX - 90), 0);
		const cell = (k: number, frac = 1) => g.drawImage(cells17, 0, k * 72, 84, 72 * frac, NEWX - 42, NEWY0 + k * NEWP - 36, 84, 72 * frac);
		const k = Math.min(NEWN - 1, Math.floor(n)), fr = n - Math.floor(n);
		for (let i = 0; i < k; i++) cell(i); if (fr > 0.05) cell(k, fr);
		if (blot > 0) { const by = NEWY0 + k * NEWP; for (let i = 0; i < 8; i++) { const a = i * 0.8, r = (24 + 120 * blot) * (0.6 + hash(i * 3.7) * 0.6); g.fillStyle = `rgba(24,22,26,${(0.45 + 0.45 * blot).toFixed(2)})`; g.beginPath(); g.ellipse(NEWX + Math.cos(a) * r * 0.35, by + Math.sin(a) * r * 0.5, r * 0.75, r, a, 0, Math.PI * 2); g.fill(); } }
		g.restore();
	});
	const yang = yang17(t, f), tip = brushTip17(t, f);
	cast17.draw(fk, [yang], (g) => { const hand: P = [tip[0] - 8, tip[1] - 44];      // the brush: held in the hand, its tip on the paper
		g.strokeStyle = '#15100C'; g.lineWidth = 5; g.lineCap = 'round'; g.beginPath(); g.moveTo(hand[0] + 3, hand[1] - 30); g.lineTo(tip[0], tip[1] - 6); g.stroke();
		g.fillStyle = '#2a1f17'; g.beginPath(); g.moveTo(tip[0] - 4, tip[1] - 10); g.lineTo(tip[0] + 4, tip[1] - 10); g.lineTo(tip[0], tip[1]); g.closePath(); g.fill(); });
	lamp17.drawW('on', (g) => drawLamp17(g));
	const rc = srcToWorld(PSRC_W + 10, PSRC_H / 2, f);
	glow17.drawW(`${f.toFixed(3)}`, (g) => { glowBlob(g, rc, 160, 120 + 260 * (1 - f), 0.4); glowBlob(g, srcToWorld(PSRC_W * 0.5, PSRC_H * 0.5, f), 600, 140 + 300 * (1 - f), 0.07); });
	st.heroAt(rc[0], rc[1], 0, 900);
	return {st, grade: {vig: 0.36, vigCol: '#140f0b', exposure: 1, corners: 1 - smooth(clamp01((pb - 0.35) / 0.5))}, bloom: 1};
};
const LAMP17: P = [1585, 560];
const drawLamp17 = (g: CanvasRenderingContext2D) => {
	const [x, y] = LAMP17; glowBlob(g, [x, y - 6], 150, 130, 0.34, '255,184,104'); glowBlob(g, [x, y - 4], 26, 34, 0.9, '255,200,130');
	g.fillStyle = '#FFD08A'; g.beginPath(); g.ellipse(x, y - 8, 5, 10, 0, 0, Math.PI * 2); g.fill();
};

// ================================================================================================ boot
export const bootYuan = async () => {
	riverMono = paintSection('river', {width: 2048, height: 768, mode: 'mono', seed: 43});
	riverGrey = paintSection('river', {width: 1024, height: 384, mode: 'grey', seed: 61});
	// 14
	c14 = new Crest('yuan-day', {sky: 'day', era: '元', lanterns: true, boat: true, bankCrowd: true});
	c16 = new Crest('yuan-night', {sky: 'night', era: '元', lanterns: true, boat: true, bankCrowd: false});
	desk17 = new Desk('yuan');
	await Promise.all([c14.ready, c16.ready, desk17.ready, buildRoom15()]);
	{
		const st = c14.st;
		// keep the top of the day sky at or below #5E7A82 (ivory subtitles ≥ 4.5 : 1): a soft shade over the far sky only
		st.add('skyShade', canvasTex(gradCanvas([[0, 'rgba(38,58,68,0.92)'], [0.3, 'rgba(46,68,78,0.72)'], [0.5, 'rgba(60,84,92,0.35)'], [0.66, 'rgba(70,92,98,0)'], [1, 'rgba(70,92,98,0)']])), 960, 420, 12000, 1900, -8900);
		st.get('sunglow').mat.uniforms.uOpacity.value = 0.14;                 // the day sun stays low and soft: you lead
		cast14 = new Cast(st, 'cast14', 900, 900, 5200, 1800, 20);
		roll14 = new Live(st, 'roll14', 900, 900, 5200, 1800, 22, {emissive: 0.55}, 0.6);
		// the match: where the Dagoba lands at the end of 14 → 15 opens with its window's Dagoba in the same place
		const [cx, cy, zm] = camPath(b(25), K14); st.setCam(cx, cy, zm);
		const base = scr(st, -520, 860, -2600), top = scr(st, -520, 860 - 372 * 1.25, -2600);
		DAG_END = {x: base.x, y: base.y, h: base.y - top.y};
		CAM15_0 = solveCam(DAG15.x, DAG15.base, -960, DAG_END.x, DAG_END.y, DAG_END.h / (372 * DAG15.s));
	}
	{
		const st = c16.st;
		st.get('farlights').mesh.visible = false;                         // only a few warm windows, on the 大都 skyline far left
		win16 = new Live(st, 'win16', 960, 820, 2400, 200, -2540, {emissive: 1.3}, 1);
		win16.draw('w', (g) => { for (let i = 0; i < 9; i++) { const x = 60 + i * 52 + hash(i * 4.1) * 30, y = 78 + hash(i * 2.3) * 22; g.fillStyle = `rgba(255,184,104,${0.55 + hash(i) * 0.35})`; g.fillRect(x, y, 5 + (i % 3) * 2, 4 + (i % 2) * 2); } });
		cast16 = new Cast(st, 'cast16', 960, 640, 2600, 1100, 20);
		silk16 = new Live(st, 'silk16', (SX0 + SX1) / 2, SY, SX1 - SX0 + 40, SH + 60, 22, {emissive: 0.34}, 3);
		rollers16 = new Live(st, 'rollers16', 960, 640, 2600, 1100, 23, {rim: 0}, 1);
		glow16 = new Live(st, 'glow16', 960, 640, 2600, 1100, 18, {emissive: 1.0}, 0.5);
	}
	{
		const st = desk17.st;
		st.get('desk').mesh.visible = false; st.get('outside').mesh.visible = false;
		// banana leaves and bamboo in the lattice window, green in the last light
		const leaves = svgDoc(`<path fill="#4f6a3a" d="M1080,640 C1060,430 1170,300 1260,250 C1215,380 1205,500 1236,640 Z"/><path fill="#5d7a44" d="M1290,640 C1320,460 1420,370 1520,340 C1450,440 1405,530 1392,640 Z"/>
			<path fill="#3f5a32" d="M1180,640 C1190,520 1250,450 1330,420 C1290,500 1270,560 1268,640 Z"/>
			${Array.from({length: 6}, (_, i) => `<rect x="${1110 + i * 72}" y="${170 - i * 8}" width="9" height="${480 + i * 8}" fill="#2f4026"/>`).join('')}
			<path fill="none" stroke="#2a3a22" stroke-width="5" d="M1150,300 l60,-30 M1290,250 l-50,-40 M1430,280 l55,-25"/>`, W, H);
		st.add('leaves', canvasTex(await svgToCanvas(leaves, W, H, 0.6)), 960, 540, W, H, -1500, {fog: ['#a7b39a', 0.12]});
		// desk with a visible top, the stool
		const dk = svgDoc(`<path fill="#3b2c1f" d="M${PX0 - 30},${DTB} L${PX0 + PW + 70},${DTB} L${PX0 + PW + 80},${DTF} L${PX0 - 40},${DTF} Z"/>
			<rect x="${PX0 - 40}" y="${DTF}" width="${PW + 120}" height="24" fill="#1d150f"/><rect x="${PX0 - 24}" y="${DTF + 22}" width="22" height="${FLOOR17 - DTF - 22}" fill="#15100C"/>
			<rect x="${PX0 + PW + 40}" y="${DTF + 22}" width="22" height="${FLOOR17 - DTF - 22}" fill="#15100C"/><rect x="${PX0 - 2}" y="${DTF + 22}" width="${PW + 44}" height="12" fill="#15100C"/>
			<rect x="${X17 - 120}" y="${FLOOR17 - 262}" width="190" height="16" fill="#1a130e"/><rect x="${X17 - 108}" y="${FLOOR17 - 248}" width="13" height="248" fill="#15100C"/><rect x="${X17 + 44}" y="${FLOOR17 - 248}" width="13" height="248" fill="#15100C"/>
			<rect x="${LAMP17[0] - 18}" y="${LAMP17[1] + 6}" width="36" height="6" fill="#15100C"/><rect x="${LAMP17[0] - 4}" y="${LAMP17[1] + 10}" width="8" height="${DTB - LAMP17[1] - 2}" fill="#15100C"/><ellipse cx="${LAMP17[0]}" cy="${DTB + 6}" rx="26" ry="6" fill="#15100C"/>
			<rect x="${PX0 + PW - 160}" y="${DTB + 14}" width="70" height="18" rx="5" fill="#1b1612"/>`, W, 1200);
		st.add('mydesk', canvasTex(await svgToCanvas(dk, W, 1200, 0.9)), 960, 600, W, 1200, -2, {rim: 0.9, rimPx: 5});
		paper17 = st.add('paper', canvasTex(paperCanvas()), PX0 + PW / 2, PYF + 350 - PHF / 2, PW, PHF, 0, {emissive: 0.12}, 10);
		rt17 = new THREE.WebGLRenderTarget(768, 432, {type: THREE.HalfFloatType, samples: 4});
		const sr = slotRect();
		slot17 = st.add('slot', rt17.texture as any, sr.x + sr.w / 2, sr.y + sr.h / 2, sr.w, sr.h, 0, {emissive: 0.3, fog: ['#E8D6B0', 0]}, 11);
		ink17 = new Live(st, 'ink17', PX0 + NEWX * PK, PYF + 350 - PHF / 2, 180 * PK, PHF, 0, {}, 3, 12);
		roll17 = new Live(st, 'roll17', PX0 + (PSRC_W + 10) * PK, PYF + 350 - PHF / 2, 140 * PK, (PSRC_H + 80) * PK, 0, {emissive: 0.45}, 2, 13);
		roll17.draw('roll', (g) => { const w = 140 * PK, h = (PSRC_H + 80) * PK; const gr = g.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, '#CFA872'); gr.addColorStop(0.45, '#EED8AE'); gr.addColorStop(1, '#BE905A');
			g.fillStyle = gr; g.beginPath(); g.roundRect(w * 0.15, 18 * PK, w * 0.7, h - 36 * PK, 10); g.fill(); g.fillStyle = '#34506A'; g.fillRect(w * 0.15, 18 * PK, w * 0.7, h * 0.05); g.fillRect(w * 0.15, h - 18 * PK - h * 0.05, w * 0.7, h * 0.05); });
		cast17 = new Cast(st, 'cast17', 960, 640, W + 400, 1200, 4, {}, 1); cast17.L.L.mesh.renderOrder = 20;
		lamp17 = new Live(st, 'lamp17', LAMP17[0], LAMP17[1], 400, 400, -1, {emissive: 1.3}, 1);
		glow17 = new Live(st, 'glow17', 1100, 600, 2400, 1400, 6, {emissive: 1.0}, 0.5, 21);
		// the opening camera: the slot at SLOT_SCREEN, 16:9
		const k = SLOT_SCREEN.w / sr.w; CAM17_0 = solveCam(sr.x + sr.w / 2, sr.y + sr.h / 2, 0, SLOT_SCREEN.cx, SLOT_SCREEN.cy, k);
		const c = cam17(b(29.25)); st.setCam(c[0], c[1], c[2]); const tip = brushTip17(b(29.25), 1), q = scr(st, tip[0], tip[1], 0);
		BLEED_PT[0] = q.x / W; BLEED_PT[1] = 1 - q.y / H;
	}
	(window as any).YDBG = () => ({CAM15_0, DAG_END, CAM17_0, BLEED_PT, room15: {n: room15.layers.length, cam: room15.cam.position.toArray(), layers: room15.layers.map((l) => [l.name, l.z, l.mesh.visible, l.mat.uniforms.uOpacity.value])}});
};

// ================================================================================================ the scenes
addScene({id: '14', a: b(23), z: b(25), in: {mode: 2, a: b(23), z: b(23.5), dir: [1, 0], soft: 0.03}, draw: d14});
addScene({id: '15', a: b(25), z: b(26.5), draw: d15});
addScene({id: '16', a: b(26.5), z: b(27.75), draw: d16});
const PIP_PT: [number, number] = [SLOT_SCREEN.cx / W, 1 - SLOT_SCREEN.cy / H], PIP_HS: [number, number] = [SLOT_SCREEN.w / 2 / W, (SLOT_SCREEN.w * 9 / 16) / 2 / H];
addScene({id: '17', a: b(27.75), z: b(29.25), in: {mode: 11, a: b(27.75), z: b(28), pt: PIP_PT, dir: PIP_HS, ease: easeInOut}, draw: d17});
export {BAR_};
