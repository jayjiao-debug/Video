// ep38 timeline: script v3 (+ gate notes). Every shot is a pure function of time.
import * as THREE from 'three';
import {block, rifle, melee, rnd, aliveAt, FPS, type Sim, type Unit} from './sim';
import {Army, Puffs, GroundSquares, Tracers, simBodies, simSmoke, simTracers, camKeys, camOrbit, draw, setGrade, setFleet, camera, toScreen, renderer, W, H, type Body, type Key} from './engine';
import {sub, counters, tag, slam, scrim, html, env, clamp01, GOLD, BLUE, RED} from './hud';
import {hpBar, type Arena, type City, type HeroPose} from './arena';

export type Ctx = {
	a: any; land: {scene: THREE.Scene; sun: THREE.DirectionalLight}; sea: {scene: THREE.Scene; water: any; combined: THREE.InstancedMesh[]; british: THREE.InstancedMesh[]};
	army: Army; arena: Arena; city: City; cityPts: Puffs; smoke: Puffs; flash: Puffs; squares: GroundSquares; tracers: Tracers; rings: THREE.Mesh[]; text: THREE.Mesh; seaSmoke: Puffs; seaFlash: Puffs; hud: HTMLElement; split: HTMLCanvasElement;
};
export type Shot = {a: number; b: number; draw: (c: Ctx, u: number, t: number) => void};

// ---------------------------------------------------------------- the simulations (seeds chosen so the numbers land exactly; see crew_log.md)
// guns fight in 3-rank lines (files = n/3), swords in deep columns. Same RNG sequence either way, so the seeds hold.
const line = (R: () => number, n: number, side: 0 | 1, g: number, front: number, z0 = 0) => block(R, n, Math.ceil(n / 3), side, g, front, z0);
const mkA = () => { const R = rnd(18); return rifle([...line(R, 1000, 0, 0, -45), ...line(R, 500, 1, 0, 45)], 18, 0.2, {volley: true, dur: 30}); };
export const SA = mkA();                                     // 1000 v 500 → 866
const SM = (() => { const R = rnd(84); return melee([...block(R, 1000, 25, 0, 0, -0.9, 0), ...block(R, 500, 25, 1, 0, 0.9, 0)], 84, 0.2, 70, 50); })(); // swords → 500
const SL = (() => { const R = rnd(123); return rifle([...line(R, 1000, 0, 0, -45), ...line(R, 1000, 1, 0, 45)], 123, 0.2, {volley: true, dur: 125}); })(); // 1000 v 1000
const SA2 = mkA();                                            // first wave of the divided enemy
const SR2 = (() => { const surv = SA2.units.filter((u) => u.side === 0 && u.death === Infinity).map((u) => ({...u, death: Infinity})); const R = rnd(91);
	return rifle([...surv, ...line(R, 500, 1, 0, 45)], 91, 0.2, {volley: true, dur: 40}); })(); // 866 v the second 500 → 707
const LEN = 1.6 / 3; // metres of firing line per man (3 ranks, 1.6 m files)

// ---------------------------------------------------------------- helpers
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
const ease = (u: number) => { const v = clamp01(u); return v * v * (3 - 2 * v); };
const cp = () => camera.position;
const battle = (c: Ctx, s: Sim, st: number, o: {pose?: any; dx?: number; dz?: number; tracers?: boolean; smoke?: boolean} = {}) => {
	c.army.set(simBodies(s, st, o.pose ?? 'aim', o.dx, o.dz), cp());
	if (o.smoke !== false) { const {sm, fl} = simSmoke(s, st, o.dx, o.dz); c.smoke.set(sm); c.flash.set(fl); } else { c.smoke.set([]); c.flash.set([]); }
	c.tracers.set(o.tracers === false ? [] : simTracers(s, st, {dx: o.dx, dz: o.dz}));
};
const clearLand = (c: Ctx) => { c.squares.set([]); c.rings.forEach((r) => (r.visible = false)); c.text.visible = false; };
const landDraw = (c: Ctx, g: any = {}) => { setGrade({vig: 0.36, warm: 0.03, bloom: 0.55, ...g}); draw(c.land.scene); };
const ratioTag = (c: Ctx, b: number, r: number, o: number) => { if (r > 0) tag(c.hud, W / 2, 112, `${(b / r).toFixed(1)} 倍`, o, 64, '#fff', GOLD); };
const curve = (c: Ctx, s: Sim, st: number, o: number) => {
	if (o <= 0) return; const x0 = 560, y0 = 1000, w = 800, h = 120, tMax = 12; const pts = (k: number) => { const out: string[] = []; for (let f = 0; f <= Math.min(st, tMax) * FPS; f += 3) { const a = s.alive[f]; out.push(`${x0 + (f / FPS / tMax) * w},${y0 - (a[k] / 1000) * h}`); } return out.join(' '); };
	html(c.hud, `<svg width="${W}" height="${H}" style="position:absolute;inset:0;opacity:${o}"><polyline points="${pts(0)}" fill="none" stroke="#8fb6ff" stroke-width="5" style="filter:drop-shadow(0 0 6px ${BLUE})"/><polyline points="${pts(1)}" fill="none" stroke="#ff8a7a" stroke-width="5" style="filter:drop-shadow(0 0 6px ${RED})"/></svg>`);
};
/** time remap with a slow-motion tail: real-time until `from`, then `k`× */
const slowTail = (u: number, from: number, k: number) => (u < from ? u : from + (u - from) * k);

// ---------------------------------------------------------------- bullet time: pick a red man hit twice in the first volley and two blue men who share one ball
const firstVolley = SA.shots.filter((s) => s.t < 0.6);
const inc = new Map<number, number[]>(); firstVolley.forEach((s, i) => inc.set(s.to, [...(inc.get(s.to) ?? []), i]));
const redStar = [...inc.entries()].filter(([u, l]) => SA.units[u].side === 1 && l.length === 2).sort((p, q) => Math.abs(SA.units[p[0]].z) - Math.abs(SA.units[q[0]].z) + (SA.units[p[0]].x - SA.units[q[0]].x) * 0.2)[0];
const blueOne = [...inc.entries()].filter(([u, l]) => SA.units[u].side === 0 && l.length === 1 && SA.units[u].x > -60 && Math.abs(SA.units[u].z) < 10)[0];
const bluePartner = (() => { const b = SA.units[blueOne[0]]; let best = -1, bd = 1e9; SA.units.forEach((u, i) => { if (u.side !== 0 || i === blueOne[0] || inc.has(i)) return; const d = (u.x - b.x) ** 2 + (u.z - b.z) ** 2; if (d < bd) { bd = d; best = i; } }); return best; })();
const FREEZE = 0.42;

// ---------------------------------------------------------------- squares on the field (overhead): side = headcount × 0.4 m
const SQ = 0.4; const BX = -470, BZ = -230; // blue square corner
const lineBodies = (n: number, x0: number, z0: number, side: 0 | 1, sp = SQ): Body[] => Array.from({length: n}, (_, i) => ({x: x0 + i * sp + sp / 2, z: z0 - 1.2, ry: 0, side, pose: 'rest', fall: 0}));

// ---------------------------------------------------------------- the sea: the Combined line (33, van to the north) and two British columns
const LINE = (t: number, vanAway: number) => Array.from({length: 33}, (_, i) => { const u = i / 32; const van = i >= 25; return {x: 40 * Math.sin(u * 3.0) + u * 70 + (van ? vanAway * 0.25 : 0), z: -1600 + u * 3200 + (i <= 11 ? -50 : i <= 22 ? 15 : 50) + (van ? vanAway : 0) + t * 1.2, heading: -Math.PI / 2}; }); // wider gaps where the two columns break through (no spar passes through a hull)
const COLS = (adv: number) => [
	...Array.from({length: 12}, (_, k) => ({x: -2529 + adv - k * 130, z: 705 + k * 6, heading: 0})),   // Nelson (weather column) → cuts ahead of the centre
	...Array.from({length: 15}, (_, k) => ({x: -2450 + adv - k * 125, z: -440 + k * 5, heading: 0})),  // Collingwood (lee column) → cuts the rear
];
let MARKS: {tracks: THREE.Mesh[]; hot: THREE.Mesh; van: THREE.Mesh} | null = null;
const flat = (scene: THREE.Scene, color: string) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({color, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false})); m.rotation.x = -Math.PI / 2; scene.add(m); return m; };
const seaMarks = (c: Ctx, o: number, adv: number, tracks = true) => {
	if (!MARKS) MARKS = {tracks: [flat(c.sea.scene, '#ffcf6a'), flat(c.sea.scene, '#ffcf6a')], hot: flat(c.sea.scene, '#ffcf6a'), van: flat(c.sea.scene, '#9a9a9a')};
	const set = (m: THREE.Mesh, x0: number, z0: number, x1: number, z1: number, wd: number, a: number) => { m.position.set((x0 + x1) / 2, 0.6, (z0 + z1) / 2); m.scale.set(Math.hypot(x1 - x0, z1 - z0), wd, 1); m.rotation.z = -Math.atan2(z1 - z0, x1 - x0); (m.material as THREE.MeshBasicMaterial).opacity = a; m.visible = a > 0.01; };
	set(MARKS.tracks[0], -2529 + adv, 705, 30, 715, 22, tracks ? o : 0); set(MARKS.tracks[1], -2450 + adv, -440, 20, -440, 22, tracks ? o : 0);
	set(MARKS.hot, 170, -1650, 170, 820, 60, o * 0.85); set(MARKS.van, 250, 880, 250, 1650, 60, o * 0.7);
};
/** a bank of powder smoke wiping across the lens (2D, soft): k = 0 clear → 1 covered; `drift` moves the billows sideways */
const fogBank = (c: Ctx, k: number, drift: number) => { if (k <= 0.001) return; const b = (x: number, y: number, w: number, h: number, col: string, a: number) => `radial-gradient(ellipse ${w}% ${h}% at ${x}% ${y}%, rgba(${col},${a}) 0%, rgba(${col},${a * 0.6}) 35%, rgba(${col},0) 72%)`;
	const L = [b(30 + drift * 0.6, 35, 45, 55, '214,206,196', 0.95), b(70 + drift * 0.9, 65, 50, 60, '196,188,178', 0.9), b(50 + drift * 1.2, 20, 55, 40, '226,219,209', 0.85), b(15 + drift * 0.8, 80, 40, 45, '205,197,187', 0.9), b(88 + drift, 30, 40, 50, '218,210,200', 0.9)];
	html(c.hud, `<div style="position:absolute;inset:-12%;opacity:${Math.min(1, k * 1.25)};background:${L.join(',')},rgba(208,200,190,${clamp01(k * 1.4 - 0.35) * 0.97});filter:blur(28px)"></div>`); };
/** the British advance (m) at sea-shot time t: Collingwood's lead reaches the gap between two enemy hulls on the climax downbeat */
const ADV = (t: number) => 1500 + t * 99.5;
const ADV0 = 1500 + 99.5 * 9.375; // = ADV(sea time at the drop): Collingwood's lead crosses the enemy line in the slow motion (tm ≈ 1.4)
/** raking broadside of a ship breaking the line: every gun on both sides fires bow to stern, 0.05 s apart, starting at t0 */
const rake = (s: {x: number; z: number}, tm: number, t0: number, towardCam = -1) => { const sm: number[][] = [], fl: number[][] = [];
	for (let k = 0; k < 28; k++) for (const side of [-1, 1]) { const age = tm - (t0 + k * 0.035 + (side > 0 ? 0.017 : 0)); if (age < 0 || age > 14) continue; const px = s.x + 25 - k * 1.85, pz = s.z + side * 8.5;
		if (age < 0.4) { const k2 = 1 - age / 0.4; for (let j = 0; j < 5; j++) fl.push([px, 4.5 + j * 0.15, pz + side * (2 + j * 3.2), (6 - j * 1.0) * (0.6 + 0.6 * k2), 4.2, 1.9 - j * 0.3, 0.5, k2]); } // a flame jet out of the port
		const drift = side === towardCam ? 7.5 : 4; for (let q = 0; q < 5; q++) { const h1 = Math.sin(k * 12.9 + q * 78.2) * 0.5 + 0.5, h2 = Math.sin(k * 39.3 + q * 11.7) * 0.5 + 0.5; // many small billows, not one big disc
			sm.push([px + age * (1.2 + h1 * 2.5) + (h2 - 0.5) * 4, 4 + age * (1.2 + h2 * 2.2), pz + side * (3 + age * drift * (0.5 + h1 * 0.8)), 3.5 + age * (2.5 + h2 * 2.5), 0.6 + h1 * 0.08, 0.56 + h1 * 0.06, 0.5 + h1 * 0.05, 0.42 * Math.exp(-age / 2.2) * Math.min(1, age * 10)]); } }
	return {sm, fl}; };
const seaDraw = (c: Ctx, t: number, g: any = {}) => { (c.sea.water.material as any).uniforms.time.value = t * 0.6; setGrade({vig: 0.4, warm: 0.04, bloom: 0.45, exposure: 0.5, ...g}); draw(c.sea.scene); };
const broadsides = (ships: {x: number; z: number; heading: number}[], t: number, rate: number, seed: number) => {
	const R = rnd(seed), sm: number[][] = [], fl: number[][] = [];
	ships.forEach((s, i) => { for (let k = 0; k < 16; k++) { const ph = R() * 4; const age = ((t + ph) % 4) / rate; if (age > 7) continue; const along = (R() - 0.5) * 46, side = R() < 0.5 ? -1 : 1;
		const hx = Math.cos(s.heading), hz = -Math.sin(s.heading); const px = s.x + hx * along + hz * side * 9, pz = s.z + hz * along - hx * side * 9;
		for (let q = 0; q < 3; q++) { const h1 = Math.sin(i * 7.1 + k * 12.9 + q * 78.2) * 0.5 + 0.5, h2 = Math.sin(i * 3.3 + k * 39.3 + q * 11.7) * 0.5 + 0.5; const out = 4 + age * (3 + h1 * 5);
			sm.push([px + hz * side * out + age * (1.5 + h2 * 2) + (h1 - 0.5) * 5, 4 + age * (1.2 + h2 * 1.6), pz - hx * side * out + (h2 - 0.5) * 5, 4 + age * (3 + h2 * 3), 0.6 + h1 * 0.08, 0.56 + h1 * 0.06, 0.5 + h1 * 0.05, 0.36 * Math.exp(-age / 3.5) * Math.min(1, age * 8)]); }
		if (age < 0.3) { const k2 = 1 - age / 0.3; for (let j = 0; j < 3; j++) fl.push([px + hz * side * (2 + j * 2.4), 5, pz - hx * side * (2 + j * 2.4), (3.6 - j) * (0.6 + 0.6 * k2), 3.6, 1.7 - j * 0.3, 0.5, k2]); } } });
	return {sm, fl};
};

// ================================================================ shot table v5 (script v5, owner's track cut to 1:55.8; bar n = 0.400 + 2.025·n)
export const bar = (k: number) => 0.4 + 2.025 * k;
export const T = {
	hook: 0, s866: bar(6), title: bar(8), melee: bar(9), guns: bar(13), squares: bar(18), game: bar(24), biz: bar(31), traf: bar(37), drop: bar(40), chart: bar(44),
	rts: bar(46), sc: bar(50), cb: bar(52), conv: bar(54), stop: bar(56), mend: 115.825, end: 119.825,
};
/** the viewer's guess under the blue counter: 你猜：剩 500 in gold; `strike` (0→1) draws a line through it */
const guessBar = (c: Ctx, o: number, strike = 0) => { if (o <= 0) return; const x = 92, y = 196;
	html(c.hud, `<div class="lbl" style="left:${x}px;top:${y}px;font-size:58px;color:#ffd98a;opacity:${o};text-shadow:0 0 6px rgba(8,6,10,.9),0 0 22px rgba(246,207,120,.45)">你猜：剩 500<div style="position:absolute;left:-6px;top:50%;height:6px;width:${strike * 104}%;background:#ff6a5a;box-shadow:0 0 10px #ff6a5a;border-radius:3px"></div></div>
	<div style="position:absolute;left:${x}px;top:${y + 78}px;width:330px;border-top:4px dashed rgba(246,207,120,.85);opacity:${o}"></div>`); };
/** the hook battle: both lines hold aim through line ①, fire at 2.0 s; red reaches 0 at 12.4 */
const hookST = (u: number) => 0.2 + (u - 2.0) * ((SA.end - 0.2) / 10.4);
/** melee: duellists lunge at the contact line; a little dust where they meet */
const meleeBodies = (st: number, k: number): Body[] => simBodies(SM, st, 'rest', 0, 0, k).map((b, i) => { const u = SM.units[i]; if (b.fall > 0 || Math.abs(u.x) > 4) return b;
	const ph = Math.sin(st * 2.3 + u.fx * 40); return {...b, pose: 'charge', x: b.x + (u.side ? -1 : 1) * (0.35 + 0.35 * Math.max(0, ph)), lean: 0.22 * Math.max(0, ph)}; });
const meleeDust = (st: number) => { const R = rnd(Math.floor(st * 3) + 7), out: number[][] = []; for (let k = 0; k < 40; k++) out.push([(R() - 0.5) * 3, 0.5 + R() * 0.8, (R() - 0.5) * 40, 1.2 + R() * 1.5, 0.62, 0.55, 0.45, 0.22]); return out; };
const rewindSign = (c: Ctx, o: number) => html(c.hud, `<div class="lbl" style="left:${W / 2 - 40}px;top:110px;font-size:64px;opacity:${0.8 * o}">◀◀</div>`);
const titleCard = (c: Ctx, u: number, o: number) => { if (o <= 0) return; const sc = u < 0.12 ? 1.25 - 0.25 * (u / 0.12) : 1 + 0.03 * Math.exp(-(u - 0.12) * 9) * Math.sin((u - 0.12) * 40);
	html(c.hud, `<div style="position:absolute;left:0;right:0;top:${H / 2 - 330}px;height:520px;background:radial-gradient(ellipse 52% 46% at 50% 50%, rgba(12,9,12,.72) 0%, rgba(12,9,12,.45) 45%, rgba(12,9,12,0) 100%);opacity:${o}"></div>`);
	html(c.hud, `<div style="position:absolute;left:0;right:0;top:${H / 2 - 100}px;text-align:center;font-weight:900;font-size:124px;letter-spacing:.06em;color:#fff6dd;opacity:${o};transform:scale(${sc});text-shadow:0 0 10px ${GOLD},0 0 40px rgba(246,207,120,.6),0 4px 30px rgba(0,0,0,.6)">为什么要<span style="color:${GOLD}">“集中优势兵力<span style="margin-right:-0.56em">”</span></span></div>`); };
const corner = (c: Ctx, text: string, o: number) => { if (o > 0) html(c.hud, `<div class="lbl" style="right:56px;bottom:170px;font-size:30px;color:rgba(255,255,255,.75);opacity:${o}">${text}</div>`); };
const header = (c: Ctx, text: string, o: number) => tag(c.hud, W / 2, 80, text, o, 40, '#fff');

// ---------------------------------------------------------------- the game: 5 v 3 (illustration of the square law)
const HB: {c: number; x: number; z: number; clip: string}[] = [{c: 0, x: -1.3, z: -1.3, clip: '1H_Melee_Attack_Chop'}, {c: 1, x: -1.4, z: 1.1, clip: '2H_Melee_Attack_Slice'}, {c: 2, x: -5.2, z: -0.6, clip: 'Spellcast_Shoot'}, {c: 3, x: -4.8, z: 2.2, clip: '1H_Ranged_Shoot'}, {c: 4, x: -2.0, z: 3.0, clip: 'Dualwield_Melee_Attack_Stab'}];
const HR: {c: number; x: number; z: number; clip: string}[] = [{c: 0, x: 1.3, z: -0.9, clip: '1H_Melee_Attack_Chop'}, {c: 1, x: 1.4, z: 1.3, clip: '2H_Melee_Attack_Slice'}, {c: 2, x: 4.6, z: 0.2, clip: 'Spellcast_Shoot'}];
/** all together: red die at 1.3 / 2.2 / 3.1, blue's front knight at 2.6; the other four end damaged (25 − 9 = 16 → 4 left) */
const togetherAt = (v: number): HeroPose[] => {
	const rd = [1.3, 2.2, 3.1], bEnd = [0, 0.72, 0.85, 0.8, 0.68];
	return [
		...HB.map((h, i) => { const dies = i === 0 ? 2.6 : Infinity; return {char: h.c, side: 0 as const, x: h.x, z: h.z, ry: Math.PI / 2, clip: v > 3.3 ? 'Idle' : h.clip, time: v * (0.9 + i * 0.07), hp: i === 0 ? 1 - clamp01(v / 2.6) : lerp(1, bEnd[i], clamp01(v / 3.1)), dead: v > dies ? v - dies : undefined}; }),
		...HR.map((h, i) => ({char: h.c, side: 1 as const, x: h.x, z: h.z, ry: -Math.PI / 2, clip: h.clip, time: v * (0.95 + i * 0.05), hp: 1 - clamp01(v / rd[i]), dead: v > rd[i] ? v - rd[i] : undefined})),
	];
};
/** one at a time: each blue hero runs in, fights ~0.55 s, falls; red's front knight goes down after the third; two red stand at the end */
const oneByOneAt = (v: number): HeroPose[] => {
	const out: HeroPose[] = [];
	HB.forEach((h, i) => { const s0 = i * 1.0, arrive = s0 + 0.45, dies = s0 + 1.0; if (v < s0) return; const k = clamp01((v - s0) / 0.45);
		out.push({char: h.c, side: 0, x: lerp(-12, -1.3, k), z: 0.1 + i * 0.12, ry: Math.PI / 2, clip: v < arrive ? 'Running_A' : HB[i].clip, time: v - s0, hp: v < arrive ? 1 : 1 - clamp01((v - arrive) / 0.55), dead: v > dies ? v - dies : undefined}); });
	HR.forEach((h, i) => { const dies = i === 0 ? 3.0 : Infinity; out.push({char: h.c, side: 1, x: h.x, z: h.z, ry: -Math.PI / 2, clip: h.clip, time: v * (0.95 + i * 0.05), hp: i === 0 ? 1 - clamp01(v / 3.0) : 1 - 0.12 * i - 0.04 * clamp01(v / 5), dead: v > dies ? v - dies : undefined}); });
	return out;
};
const drawHeroes = (c: Ctx, heroes: HeroPose[], u: number, bolts = true) => {
	c.arena.set(heroes); c.arena.clearBolts();
	if (bolts) heroes.forEach((h) => { if (h.dead !== undefined || h.clip.indexOf('Spell') < 0 && h.clip.indexOf('Ranged') < 0) return; const foes = heroes.filter((q) => q.side !== h.side && q.dead === undefined); if (!foes.length) return;
		const f = foes[Math.floor(u * 1.6) % foes.length]; c.arena.bolt([h.x, 1.3, h.z], [f.x, 1.2, f.z], (u * 1.6) % 1, h.side ? '#ff7a5a' : '#6ab0ff'); });
	heroes.forEach((h) => { if (h.dead === undefined || h.dead < 0.3) hpBar(c.hud, c.arena.heroTop(h), h.hp, h.side, h.dead === undefined ? 1 : 1 - h.dead / 0.3); });
};
const gameDraw = (c: Ctx, g: any = {}) => { setGrade({vig: 0.42, warm: 0.04, bloom: 0.6, exposure: 0.8, ...g}); draw(c.arena.scene); };

// ---------------------------------------------------------------- the city (business): red points everywhere, blue pulls into one district
const CITY = (() => { const R = rnd(77), red: number[][] = [], blue: number[][] = []; const D = {x: -120, z: 60, r: 110};
	for (let i = 0; i < 70; i++) { const a = R() * 6.283, d = 60 + R() * 480; red.push([Math.cos(a) * d, Math.sin(a) * d]); }
	for (let i = 0; i < 12; i++) { const a = R() * 6.283, d = 120 + R() * 420; const ta = R() * 6.283, td = Math.sqrt(R()) * D.r * 0.8; blue.push([Math.cos(a) * d, Math.sin(a) * d, D.x + Math.cos(ta) * td, D.z + Math.sin(ta) * td]); }
	return {red, blue, D}; })();
const cityState = (c: Ctx, k: number, t: number) => { // k: 0 scattered → 1 gathered
	const {red, blue, D} = CITY; const pts: number[][] = [];
	red.forEach(([x, z], i) => { const inside = Math.hypot(x - D.x, z - D.z) < D.r; const o = inside ? 1 - clamp01(k * 1.6 - 0.3) : 1; const tw = 0.75 + 0.25 * Math.sin(t * 3 + i); if (o > 0.01) pts.push([x, 60, z, 20, 2.4, 0.7, 0.45, 0.8 * o * tw]); });
	blue.forEach(([x0, z0, x1, z1], i) => { const m = ease(k * 1.15 - i * 0.012); pts.push([lerp(x0, x1, m), 64, lerp(z0, z1, m), 30, 0.8, 1.8, 4.0, 0.95]); });
	c.cityPts.set(pts); c.city.setGlow([{x: D.x, z: D.z, r: D.r, color: '#3a8bff', k: 1.6 * clamp01(k * 1.3 - 0.25)}]);
};
const cityDraw = (c: Ctx, g: any = {}) => { setGrade({vig: 0.6, warm: 0.12, bloom: 0.7, exposure: 0.62, ...g}); draw(c.city.scene); };

// ---------------------------------------------------------------- the sea (Trafalgar, compressed): approach 6.075 s, breakthrough 8.1 s
const NB = 2529; // Nelson's weather column trails; its lead reaches the line on bar 42
const tmOf = (u: number) => (u < 1.0 ? u : u < 2.6 ? 1.0 + (u - 1.0) * 0.25 : 1.4 + (u - 2.6)); // slow motion as Collingwood's lead passes between the hulls
const TN = tmOf(bar(42) - bar(40));
const approachS = 9.375 / (bar(40) - bar(37)); // the approach plays the built 9.4-s move in 6.1 s

// ---------------------------------------------------------------- RTS (Age of Empires II knight) and the StarCraft pull-back, in the arena
const knightRound = (v: number, n: number, r0: number): HeroPose[] => { // one knight v n swordsmen; kills at times, dies (n = 5) at 2.0 s after they arrive
	const out: HeroPose[] = []; const kills = n === 4 ? [0.8, 1.45, 2.1, 2.75] : [0.9, 1.5]; const kDies = n === 5 ? 2.0 : Infinity;
	out.push({char: 0, side: 0, x: 0, z: 0, ry: Math.PI / 2 + v * 1.6, clip: v > 0.3 ? '1H_Melee_Attack_Slice_Horizontal' : 'Idle', time: v, hp: n === 4 ? 1 - 0.8 * clamp01(v / 2.8) : 1 - clamp01(v / kDies), dead: v > kDies ? v - kDies : undefined});
	for (let i = 0; i < n; i++) { const a = r0 + (i / n) * Math.PI * 2, k = clamp01(v / 0.6), d = lerp(6, 1.25, k); const dies = kills[i] ?? Infinity;
		out.push({char: [3, 4, 1, 3, 4][i], side: 1, x: Math.cos(a) * d, z: Math.sin(a) * d, ry: Math.atan2(Math.cos(a), Math.sin(a)) + Math.PI, clip: v < 0.6 ? 'Running_A' : '1H_Melee_Attack_Chop', time: v + i * 0.2, hp: dies < Infinity ? 1 - clamp01((v - 0.3) / (dies - 0.3)) : 1 - 0.15 * clamp01(v / 2), dead: v > dies ? v - dies : undefined}); }
	return out;
};
const SKIRM = Array.from({length: 10}, (_, i) => ({x: -14 + (i % 5) * 7, z: i < 5 ? -4 : 4, t: 0.9 + ((i * 7) % 10) * 0.26, ok: i !== 6})); // 9 predictions right, 1 wrong
const skirmAt = (v: number): HeroPose[] => SKIRM.flatMap((s, i) => { const done = v > s.t; const blueWins = i % 3 !== 0;
	return [{char: i % 5, side: 0 as const, x: s.x - 0.9, z: s.z, ry: Math.PI / 2, clip: '1H_Melee_Attack_Chop', time: v + i * 0.13, hp: done && !blueWins ? 0 : 0.6, dead: done && !blueWins ? v - s.t : undefined},
		{char: (i + 2) % 5, side: 1 as const, x: s.x + 0.9, z: s.z, ry: -Math.PI / 2, clip: '1H_Melee_Attack_Chop', time: v + i * 0.17, hp: done && blueWins ? 0 : 0.5, dead: done && blueWins ? v - s.t : undefined}]; });

/** the last line, typed in, its last three characters slamming on the stop */
const typedLine = (c: Ctx, t: number) => { const head = '同一时刻、同一地方，', tail = '比他多'; if (t < 112.3) return;
	const n = Math.min(head.length, Math.floor((t - 112.3) / 0.11)); const s = t < T.stop ? 1 : 1 + 0.18 * Math.exp(-(t - T.stop) * 7) * Math.cos((t - T.stop) * 30);
	html(c.hud, `<div class="sub" style="opacity:1">${head.slice(0, n)}<span style="display:inline-block;color:${GOLD};opacity:${t < T.stop ? 0 : 1};transform:scale(${s});text-shadow:0 0 3px rgba(8,6,10,.95),0 0 22px rgba(246,207,120,.7)">${tail}</span></div>`); };
const convergeAt = (c: Ctx, m: number) => { const R = rnd(5), bodies: Body[] = []; const centres = Array.from({length: 8}, () => [(R() - 0.5) * 300, (R() - 0.5) * 240]);
	for (let i = 0; i < 800; i++) { const g = i % 8, k = Math.floor(i / 8); const cx = centres[g][0] + ((k % 10) - 4.5) * 1.6, cz = centres[g][1] + (Math.floor(k / 10) - 4.5) * 1.6; const fx = (i % 40 - 19.5) * 1.6, fz = (Math.floor(i / 40) - 9.5) * 1.6;
		bodies.push({x: lerp(cx, fx, m), z: lerp(cz, fz, m), ry: -Math.PI / 2, side: 0, pose: m > 0.02 && m < 0.98 ? 'march' : 'aim', fall: 0}); }
	for (let i = 0; i < 100; i++) bodies.push({x: -62 - Math.floor(i / 20) * 1.6, z: ((i % 20) - 9.5) * 1.6, ry: Math.PI / 2, side: 1, pose: 'rest', fall: 0});
	c.army.set(bodies, cp()); c.smoke.set([]); c.flash.set([]); c.tracers.set([]); };

export const TIMELINE: Shot[] = [
	// 01 — hook: both lines aim; volley at 2.0; red melts; blue's count hidden
	{a: T.hook, b: T.s866, draw: (c, u) => {
		clearLand(c); const st = hookST(u);
		camKeys([{t: 0, pos: [-52, 1.9, -9], look: [45, 1.5, 4], fov: 40}, {t: 4.5, pos: [-49.5, 2.1, -7], look: [45, 1.5, 2], fov: 36}, {t: 8.0, pos: [-8, 11, -34], look: [46, 0.5, 4], fov: 40}, {t: T.s866, pos: [6, 19, -46], look: [46, 0, 10], fov: 42}], u);
		battle(c, SA, st);
		const [, r] = aliveAt(SA, Math.max(0, st)); counters(c.hud, '???' as any, r); guessBar(c, env(u, 5.5, 99));
		sub(c.hud, '你有1000人，对面500人', u, 0.05, 2.35); sub(c.hud, '打光对面，你还剩[几个]？', u, 2.55, 5.45);
		landDraw(c);
	}},
	// 02 — 866 slams on bar 6; bar 7 holds still while the smoke and the dark bank roll in
	{a: T.s866, b: T.title, draw: (c, u) => {
		clearLand(c); camKeys([{t: 0, pos: [6, 19, -46], look: [46, 0, 10], fov: 42}, {t: 2.025, pos: [-30, 30, -110], look: [10, 0, 0], fov: 40}], u);
		battle(c, SA, SA.end + 0.2 + Math.min(u, 2.025) * 0.4);
		counters(c.hud, 866, 0, 1 - env(u, 0, 99, 0.2)); guessBar(c, 1 - clamp01((u - 1.3) / 0.5), clamp01((u - 0.15) / 0.35));
		slam(c.hud, W / 2, H / 2 - 30, '866', u, 0.0, 3.7, 260, BLUE);
		tag(c.hud, W / 2, H / 2 + 160, '只倒下 134 人', env(u, 0.8, 3.7), 50, '#fff');
		landDraw(c, {bloom: 0.7}); fogBank(c, 0.55 * ease((u - 2.6) / 1.4), (1 - clamp01((u - 2.6) / 1.4)) * 60);
	}},
	// 03 — TITLE on drop 1
	{a: T.title, b: T.melee, draw: (c, u) => {
		clearLand(c); camKeys([{t: 0, pos: [-30, 30, -110], look: [10, 0, 0], fov: 40}], 0); battle(c, SA, SA.end + 1.2, {tracers: false});
		landDraw(c, {bloom: 0.65, vig: 0.55}); fogBank(c, 0.55, 0); titleCard(c, u, env(u, 0, 99, 0.02));
	}},
	// 04 — ★1: ◀◀ the battle back into columns; bayonets one on one → 500 ✓
	{a: T.melee, b: T.guns, draw: (c, u) => {
		clearLand(c); const R0 = 1.02;
		if (u < R0) { const k = ease(u / (R0 * 0.62)), fold = ease((u - R0 * 0.55) / (R0 * 0.45)); const st = lerp(SA.end + 1.2, -0.6, k);
			camKeys([{t: 0, pos: [-30, 30, -110], look: [10, 0, 0], fov: 40}, {t: R0, pos: [-62, 30, -70], look: [0, 0, 0], fov: 38}], u);
			battle(c, SA, st, {tracers: false}); const [b, r] = aliveAt(SA, Math.max(0, st)); counters(c.hud, b, r);
			if (fold > 0) { const from = simBodies(SA, -0.6), to = simBodies(SM, 0, 'rest'); c.army.set(from.map((f, i) => ({...f, x: lerp(f.x, to[i].x, fold), z: lerp(f.z, to[i].z, fold), pose: (fold < 0.98 ? 'march' : 'rest') as any})), cp()); }
			rewindSign(c, env(u, 0, R0, 0.05, 0.1)); landDraw(c, {bloom: 0.5, warm: 0.0, vig: 0.5}); fogBank(c, 0.55 * (1 - clamp01(u / 0.5)), u * 60); titleCard(c, 3, 1 - clamp01(u / 0.6)); return; }
		const v = u - R0, k = (SM.end - 0.2) / 3.03, st = Math.min(SM.end + 0.4, 0.2 + v * k);
		if (v < 3.03) camKeys([{t: 0, pos: [-62, 30, -70], look: [0, 0, 0], fov: 38}, {t: 1.6, pos: [-40, 40, -78], look: [-10, 0, 0], fov: 38}, {t: 3.03, pos: [-110, 62, -80], look: [-35, 0, 0], fov: 40}], v);
		else camOrbit([-25, 0, 0], 120, 60, -2.25 + (v - 3.03) * 0.05, 38, 0);
		c.army.set(meleeBodies(st, k), cp()); c.smoke.set(st < SM.end ? meleeDust(st) : []); c.flash.set([]); c.tracers.set([]);
		const [b, r] = aliveAt(SM, st); counters(c.hud, b, r); guessBar(c, env(v, 3.0, 99));
		const q = toScreen([-48, 2, 0]); if (v < 3.0) tag(c.hud, q.x, q.y - 60, '在排队', env(u, 20.9 - T.melee, 22.6 - T.melee), 48, '#fff', BLUE);
		if (r === 0) { slam(c.hud, 350, 112, '✓', v, 3.05, 99, 90, '#2bd67b', '#7dffb0'); tag(c.hud, W / 2, 232, '拼刺刀：剩 500', env(v, 3.2, 99), 56, '#fff', BLUE); }
		sub(c.hud, '拼刺刀，只能[一对一]', u, 19.7 - T.melee, 22.45 - T.melee); sub(c.hud, '你的直觉，属于[冷兵器时代]', u, 22.75 - T.melee, 25.8 - T.melee);
		landDraw(c);
	}},
	// 05 — ★2: ½-bar ◀◀; the columns fan into lines; the first volley erupts on bar 14 and freezes; count the balls; ×2 ÷2
	{a: T.guns, b: T.squares, draw: (c, u) => {
		clearLand(c); const d = T.squares - T.guns; const V = 2.025; // volley
		const Rb = SA.units[redStar[0]], B = SA.units[blueOne[0]], B2 = SA.units[bluePartner];
		if (u < V) { // ◀◀ the melee back to its start, then fan out into lines
			const rw = clamp01(u / 0.9), fan = ease((u - 0.9) / (V - 0.9));
			camKeys([{t: 0, pos: [-110, 62, -80], look: [-35, 0, 0], fov: 40}, {t: 0.9, pos: [-75, 18, -62], look: [-25, 1, -10], fov: 42}, {t: V, pos: [-70, 3.4, -52], look: [45, 1.5, 10], fov: 40}], u);
			if (u < 0.9) { c.army.set(meleeBodies(lerp(SM.end + 0.4, 0.2, ease(rw)), 18), cp()); rewindSign(c, env(u, 0, 0.9, 0.05, 0.1)); counters(c.hud, ...aliveAt(SM, lerp(SM.end + 0.4, 0.2, ease(rw))) as [number, number]); }
			else { const from = simBodies(SM, 0, 'rest'), to = simBodies(SA, -0.5); c.army.set(from.map((f, i) => ({...to[i], x: lerp(f.x, to[i].x, fan), z: lerp(f.z, to[i].z, fan), pose: (fan < 0.98 ? 'march' : 'aim') as any})), cp()); counters(c.hud, 1000, 500); }
			c.smoke.set([]); c.flash.set([]); c.tracers.set([]);
		} else {
			const v = u - V; const st = v < 0.55 ? lerp(-0.2, FREEZE, v / 0.55) : FREEZE; // erupts, freezes
			if (v < 3.05) camKeys([{t: 0, pos: [-70, 3.4, -52], look: [45, 1.5, 10], fov: 40}, {t: 0.7, pos: [-60, 26, -64], look: [0, 1, 0], fov: 38}, {t: 2.4, pos: [Rb.x - 14, 3.2, Rb.z - 9], look: [Rb.x, 1.4, Rb.z], fov: 36}, {t: 3.05, pos: [Rb.x - 14, 3.2, Rb.z - 9], look: [Rb.x, 1.4, Rb.z], fov: 36}], v);
			else if (v < 6.05) camKeys([{t: 3.05, pos: [Rb.x - 14, 3.2, Rb.z - 9], look: [Rb.x, 1.4, Rb.z], fov: 36}, {t: 3.8, pos: [(B.x + B2.x) / 2 - 8.6, 2.9, (B.z + B2.z) / 2 - 7.2], look: [(B.x + B2.x) / 2, 1.3, (B.z + B2.z) / 2], fov: 38}, {t: 6.05, pos: [(B.x + B2.x) / 2 - 8, 2.8, (B.z + B2.z) / 2 - 6.6], look: [(B.x + B2.x) / 2, 1.2, (B.z + B2.z) / 2], fov: 38}], v);
			else camKeys([{t: 6.05, pos: [(B.x + B2.x) / 2 - 8, 2.8, (B.z + B2.z) / 2 - 6.6], look: [(B.x + B2.x) / 2, 1.2, (B.z + B2.z) / 2], fov: 38}, {t: d - V, pos: [-10, 44, -80], look: [0, 0, 0], fov: 40}], v);
			battle(c, SA, st, {tracers: v < 0.55});
			if (v >= 0.55) { const segs: number[][] = [], balls: number[][] = []; firstVolley.forEach((s) => { if (s.to !== redStar[0] && s.to !== blueOne[0]) return; const a = SA.units[s.from], b = SA.units[s.to], dir = a.side ? -1 : 1, f = 0.99;
				const x1 = a.x + dir * 1.3, tx = s.hit ? b.x : b.x + dir * 6, tz = s.hit ? b.z : b.z + (a.fx - 0.5) * 3; const p = (q: number) => [x1 + (tx - x1) * q, 1.45 + ((s.hit ? 1.3 : 0.6) - 1.45) * q, a.z + (tz - a.z) * q];
				const col = a.side ? [9.6, 4.8, 3.3] : [4.2, 6.3, 10.2]; segs.push([...p(f - 0.05), ...p(f), ...col]); const qq = p(f); balls.push([qq[0], qq[1], qq[2], 0.55, a.side ? 3.4 : 1.4, a.side ? 1.5 : 2.2, a.side ? 1.0 : 3.6, 0.95]); });
				c.tracers.set(segs); c.flash.set([...simSmoke(SA, FREEZE).fl, ...balls]); }
			const ring = (m: THREE.Mesh, x: number, z: number, o: number, col: string) => { m.visible = o > 0; m.position.set(x, 0.12, z); (m.material as THREE.MeshBasicMaterial).color.set(col); (m.material as THREE.MeshBasicMaterial).opacity = o; };
			ring(c.rings[0], Rb.x, Rb.z, env(v, 1.6, 3.1), '#ff6a5a'); ring(c.rings[1], B.x, B.z, env(v, 3.6, 6.0), '#6aa8ff'); ring(c.rings[2], B2.x, B2.z, env(v, 3.6, 6.0), '#6aa8ff');
			counters(c.hud, 1000, 500, 0.6);
			if (v < 3.05) firstVolley.filter((s) => s.to === redStar[0]).forEach((s, k) => { const a = SA.units[s.from], dir = a.side ? -1 : 1; const x1 = a.x + dir * 1.3; const p = toScreen([x1 + (Rb.x - x1) * 0.99, 1.35, a.z + (Rb.z - a.z) * 0.99]); tag(c.hud, p.x + (k ? 34 : -34), p.y - 40, `${k + 1}`, env(u, 30.3 - T.guns + k * 0.45, 31.8 - T.guns), 64, '#fff', RED); });
			else if (v < 6.05) { const p = toScreen([(B.x + B2.x) / 2, 2.3, (B.z + B2.z) / 2]); tag(c.hud, p.x, p.y - 30, '两人才挨 1 枪', env(u, 32.0 - T.guns, 34.7 - T.guns), 56, '#fff', BLUE); }
			else { const pb = {x: 520, y: 420}, pr = {x: 1400, y: 420}; const m = clamp01((u - (36.25 - T.guns)) / 0.55);
				tag(c.hud, lerp(pb.x, W / 2, m), lerp(pb.y, 520, m), '火力 ×2', env(u, 34.85 - T.guns, 99) * (1 - m), 72, '#fff', BLUE); tag(c.hud, lerp(pr.x, W / 2, m), lerp(pr.y, 520, m), '挨打 ÷2', env(u, 35.3 - T.guns, 99) * (1 - m), 72, '#fff', RED); }
		}
		sub(c.hud, '有了枪，[人人]都能开火', u, 26.8 - T.guns, 29.45 - T.guns); sub(c.hud, '你开的枪[多一倍]，挨的枪[少一半]', u, 29.75 - T.guns, 33.05 - T.guns);
		landDraw(c, {bloom: 0.72, warm: -0.01, vig: 0.46});
	}},
	// 06 — ★3: 战斗力 ×4 slams on bar 18; the camera climbs; squares grow and tile (×1→×4); one replay; the lost areas peel into two equal bars; tape → 866; equation
	{a: T.squares, b: T.game, draw: (c, u) => {
		clearLand(c); const G = 2.025, RP = 4.05, PL = 5.15, TP = 8.1;
		camKeys([{t: 0, pos: [-10, 44, -80], look: [0, 0, 0], fov: 40}, {t: G, pos: [-140, 640, -620], look: [-130, 0, -20], fov: 40}], u);
		slam(c.hud, W / 2, 520, '战斗力 ×4', u, 0, 1.75, 120, GOLD, '#fff6dd');
		const bs = 1000 * LEN, rs = 500 * LEN, grow = ease((u - G) / 1.0), tile = env(u, G + 0.9, RP, 0.2, 0.25);
		const st = u < RP ? 0.1 : lerp(0.2, SA.end + 0.1, clamp01((u - RP) / (PL - RP))); const [b, r] = aliveAt(SA, u < RP ? 0 : st);
		const bl = b * LEN, rl = r * LEN, pk = clamp01((u - PL) / 1.25), fold = ease((u - 7.2) / 0.9), tape = clamp01((u - TP) / 1.0);
		c.army.set([], cp()); c.smoke.set([]); c.flash.set([]); c.tracers.set([]); // the diagram stands alone (no men or balls showing through the slabs)
		if (u < G) { battle(c, SA, FREEZE + u * 0.9); counters(c.hud, ...aliveAt(SA, FREEZE + u * 0.9) as [number, number]); landDraw(c); return; }
		const L: any[] = [];
		L.push({x: -45 - bs * grow, z: -bs / 2, w: bs * grow, d: bs, color: '#4a90ff', a: u < RP ? 1 : 0.22, edge: u < RP ? 1 : 0.35, wall: u < RP ? 1 : 0.3});
		if (u >= RP) L.push({x: -45 - bl, z: -bl / 2, w: bl, d: bl, color: '#4a90ff', a: 1});
		L.push({x: 47, z: -rs / 2, w: rs * grow, d: rs, color: '#ff5a47', a: u < RP ? 1 : fold > 0 ? 0.5 : 0.2, edge: fold > 0 ? 1 : 0.6, edgeColor: fold > 0 ? GOLD : undefined}); if (u >= RP && rl > 0.5) L.push({x: 47, z: -rl / 2, w: rl, d: rl, color: '#ff5a47', a: 1});
		if (tile > 0) [[0, 0], [rs, 0], [0, rs], [rs, rs]].forEach(([ox, oz], k) => L.push({x: -45 - bs + ox, z: -bs / 2 + oz, w: rs, d: rs, color: '#ffb0a4', a: tile * clamp01((u - G - 0.9 - k * 0.22) / 0.2), edge: 1}));
		if (pk > 0 && u < 7.4) { const B1 = bs, B2 = 866 * LEN, R1 = rs, Wt = 38, SC = 0.18; const lit = clamp01(pk / 0.25), m = ease((pk - 0.28) / 0.6), o = 1 - clamp01((u - 7.0) / 0.4);
			const morph = (rects: number[][], x0: number) => { const tot = rects.reduce((q, R) => q + R[2] * R[3], 0); let z = -tot * SC / Wt / 2; rects.forEach(([x, zz, w, dd0]) => { const dd = (w * dd0) * SC / Wt;
				L.push({x: lerp(x, x0, m), z: lerp(zz, z, m), w: lerp(w, Wt, m), d: lerp(dd0, dd, m), color: '#ffd27a', a: o * (0.6 + 0.4 * lit), edge: lit, edgeColor: GOLD, wall: 0.6}); z += dd; }); return tot * SC / Wt; };
			const hb = morph([[-45 - B1, -B1 / 2, B1 - B2, B1], [-45 - B2, B2 / 2, B2, (B1 - B2) / 2], [-45 - B2, -B1 / 2, B2, (B1 - B2) / 2]], -4 - Wt);
			const hr = morph([[47, -R1 / 2, R1, R1]], 4);
			if (m > 0.9) { const qb = toScreen([-4 - Wt / 2, 0, hb / 2 + 30]), qr = toScreen([4 + Wt / 2, 0, hr / 2 + 30]), ko = o * clamp01((m - 0.9) / 0.1);
				tag(c.hud, qb.x + 70, qb.y - 26, '蓝方掉的', ko, 48, '#fff', BLUE); tag(c.hud, qr.x - 70, qr.y - 26, '红方掉的', ko, 48, '#fff', RED); const qe = toScreen([0, 0, 0]); tag(c.hud, qe.x, qe.y, '=', ko, 96, '#fff6dd', GOLD); } }
		if (fold > 0) L.push({x: lerp(-45 - bs, 47, fold), z: lerp(-bs / 2, -rs / 2, fold), w: rs, d: rs, color: '#8fb6ff', a: env(u, 7.2, 99) * 0.9, edge: 1, edgeColor: GOLD});
		c.squares.set(L);
		const P = (x: number, z: number) => toScreen([x, 0, z]); const pb = P(-45 - bs / 2, bs / 2 + 40), pr = P(47 + rs / 2, rs / 2 + 40);
		tag(c.hud, pb.x, pb.y - 84, '1000 人', env(u, 38.9 - T.squares, 40.9 - T.squares), 52, '#fff', BLUE); tag(c.hud, pb.x, pb.y - 30, '边长 = 一排人的长度', env(u, 38.9 - T.squares, 40.9 - T.squares), 40, '#fff', BLUE); tag(c.hud, pr.x, pr.y - 84, '500 人', env(u, 38.9 - T.squares, 40.9 - T.squares), 52, '#fff', RED);
		if (tile > 0) { const k = Math.max(1, Math.min(4, 1 + Math.floor((u - G - 0.9) / 0.22))); const pc = P(-45 - bs / 2, 0); slam(c.hud, pc.x, pc.y, `×${k}`, u, G + 0.9 + (k - 1) * 0.22, RP, 150, GOLD, '#fff6dd'); }
		if (u >= RP && u < PL + 0.3) counters(c.hud, b, r);
		if (tape > 0) { const fs = 866 * LEN; const pt = P(-45 - fs - 70, 0);
			if (u < 45.96 - T.squares) tag(c.hud, pt.x - 40, pt.y, `${Math.round(866 * tape)}`, 1, 64, '#fff', GOLD); else slam(c.hud, pt.x - 60, pt.y, '866', u, 45.96 - T.squares, 99, 110, BLUE);
			html(c.hud, `<div style="position:absolute;left:0;right:0;top:92px;text-align:center;font-weight:900;font-size:76px;color:#fff;opacity:${env(u, 46.98 - T.squares, 99)};text-shadow:0 0 6px ${GOLD},0 0 26px rgba(246,207,120,.6),0 2px 10px rgba(0,0,0,.65)">1000² − 500² ≈ 866²</div>`);
			tag(c.hud, W / 2, 236, '兰彻斯特 · 1914', env(u, 47.3 - T.squares, 99) * 0.9, 40, '#fff'); }
		sub(c.hud, '战斗力，看人数的[平方]', u, 37.0 - T.squares, 39.75 - T.squares); sub(c.hud, '开头的866，就是[这么来的]', u, 46.05 - T.squares, 48.9 - T.squares);
		landDraw(c, {bloom: 0.6});
	}},
	// 07 — game 5 v 3 (illustration): all together → 4 left; ◀◀; one at a time → all five fall, two of theirs stand
	{a: T.game, b: T.biz, draw: (c, u) => {
		const A1 = 4.05, RW = 6.075, B0 = 6.6;
		camKeys([{t: 0, pos: [-0.5, 6.4, 11.8], look: [-0.5, 0.9, -0.2], fov: 40}, {t: 6.0, pos: [1.0, 7.0, 11.0], look: [-0.8, 0.9, 0], fov: 40}, {t: 14.2, pos: [-1.0, 7.6, 11.4], look: [-1.5, 0.9, 0], fov: 40}], u);
		if (u < RW) drawHeroes(c, togetherAt(u), u, u < 3.3);
		else if (u < B0) { const v = lerp(4.0, 0, ease((u - RW) / (B0 - RW))); drawHeroes(c, togetherAt(v), u, false); rewindSign(c, env(u, RW, B0, 0.05, 0.08)); }
		else drawHeroes(c, oneByOneAt((u - B0) * 1.0), u);
		corner(c, '示意 · 按平方律算', 1);
		if (u > A1 && u < RW) { slam(c.hud, W / 2, 150, '5² − 3² = 16 = 4²', u, A1, RW - 0.1, 84, GOLD, '#fff6dd'); togetherAt(u).filter((h) => h.side === 0 && h.dead === undefined).forEach((h) => { const q = toScreen([h.x, 2.9, h.z]); }); tag(c.hud, W / 2, 250, '剩 4 个', env(u, A1 + 0.5, RW - 0.1), 56, '#fff', BLUE); }
		if (u > 60.64 - T.game) tag(c.hud, W / 2, 160, '全灭 · 对面还剩 <span style="color:#ff8a7a">2</span> 个', env(u, 60.64 - T.game, 99), 64, '#fff', RED);
		sub(c.hud, '打团5打3，[一起上]', u, 49.3 - T.game, 52.2 - T.game); sub(c.hud, '一拨一拨上？那叫[送]', u, 57.2 - T.game, 60.1 - T.game);
		gameDraw(c);
	}},
	// 08 — 商战: the camera leaves the arena for a city at dusk; red everywhere and thin; blue pulls into one district; 41.7 %
	{a: T.biz, b: T.traf, draw: (c, u) => {
		camKeys([{t: 0, pos: [-560, 900, -640], look: [-80, 0, 30], fov: 36}, {t: 6.0, pos: [-480, 760, -560], look: [-100, 0, 40], fov: 34}, {t: 12.15, pos: [-420, 620, -480], look: [-110, 0, 50], fov: 33}], u);
		cityState(c, ease((u - 4.05) / 2.2), u);
		header(c, '日本 · 兰彻斯特战略 · 田冈信夫，1970年代起', env(u, 0.4, 11.9)); corner(c, '示意', 1);
		const D = toScreen([CITY.D.x, 60, CITY.D.z]);
		if (u < 4.1) { const pr = toScreen([CITY.red[3][0], 40, CITY.red[3][1]]), pbq = toScreen([CITY.blue[2][0], 40, CITY.blue[2][1]]); tag(c.hud, pr.x, pr.y - 40, '老大', env(u, 64.5 - T.biz, 67.2 - T.biz), 48, '#fff', RED); tag(c.hud, pbq.x, pbq.y - 40, '你', env(u, 64.5 - T.biz, 67.2 - T.biz), 48, '#fff', BLUE); }
		tag(c.hud, D.x, D.y - 120, '局地战', env(u, 67.4 - T.biz, 71.2 - T.biz), 56, '#fff', BLUE);
		const sh = clamp01((u - 6.0) / 2.05); if (u > 6.0) { html(c.hud, `<div style="position:absolute;right:120px;top:300px;width:46px;height:420px;border:3px solid rgba(255,255,255,.7);border-radius:6px;opacity:${env(u, 6.0, 99)}"><div style="position:absolute;left:0;right:0;bottom:0;height:${sh * 41.7}%;background:${BLUE};box-shadow:0 0 18px ${BLUE}"></div></div><div class="lbl" style="right:96px;top:740px;font-size:32px;opacity:${env(u, 6.0, 99)}">这一片的份额</div>`); }
		if (u > 8.1) { slam(c.hud, W / 2 + 330, 420, '41.7%', u, 8.1, 99, 130, BLUE); tag(c.hud, W / 2 + 330, 540, '第一才算坐稳 · 日本兰彻斯特协会的经验值', env(u, 8.4, 99), 34, '#fff'); }
		sub(c.hud, '日本人把这套算术，用进了[商战]', u, 63.3 - T.biz, 66.45 - T.biz); sub(c.hud, '不是老大？缩小战场，[集中一点]', u, 67.35 - T.biz, 70.55 - T.biz);
		cityDraw(c);
	}},
	// 09 — Trafalgar: the plan on the water; bar 39 holds
	{a: T.traf, b: T.drop, draw: (c, u) => {
		const d = T.drop - T.traf, su = u * approachS; const adv = ADV(su);
		camKeys([{t: 0, pos: [-1700, 900, -2300], look: [0, 0, 0], fov: 40}, {t: 2.4, pos: [-1500, 260, -1200], look: [0, 10, 0], fov: 38}, {t: 4.05, pos: [adv - 2450 - 120, 26, -463], look: [adv - 2450 + 60, 8, -440], fov: 44}, {t: d, pos: [adv - 2450 - 110, 24, -463], look: [adv - 2450 + 60, 8, -440], fov: 44}], u);
		setFleet(c.sea.combined, LINE(su, 0), su); setFleet(c.sea.british, COLS(adv), su);
		const {sm, fl} = broadsides(LINE(su, 0).slice(0, 18), su, 1, 3); c.seaSmoke.set(su > 4 ? sm : []); c.seaFlash.set(su > 4 ? fl : []);
		seaMarks(c, env(u, 0.3, 3.9, 0.4, 0.4), adv);
		header(c, '1805 · 特拉法加', env(u, 0.2, 99)); counters(c.hud, 27, 33, env(u, 0.3, d - 0.1), ['英国', '法西联合']);
		const pv = toScreen([260, 0, 1450]); if (pv.front) tag(c.hud, Math.min(W - 260, pv.x + 40), pv.y - 50, '前队：先不理它', env(u, 76.4 - T.traf, 79.3 - T.traf), 52, '#eee');
		sub(c.hud, '船少的英国，全压向[同一段]', u, 75.45 - T.traf, 78.6 - T.traf);
		seaDraw(c, su);
	}},
	// 10 — DROP 2: Collingwood's lead between two hulls, raking both, slow motion; Nelson on bar 42; crane on bar 43; every ship fires
	{a: T.drop, b: T.chart, draw: (c, u) => {
		const d = T.chart - T.drop, tm = tmOf(u), ST = T.drop - T.traf; const sea0 = ST * approachS; // sea time continues
		const adv = ADV0 + tm * 55; const lead = {x: adv - 2450, z: -440}, nel = {x: adv - NB, z: 705};
		if (u < 4.05) camKeys([{t: 0, pos: [lead.x - 110, 24, -463], look: [lead.x + 60, 8, -440], fov: 44}, {t: 1.0, pos: [lead.x - 60, 12, -463], look: [lead.x + 40, 8, -440], fov: 52}, {t: 2.6, pos: [31.5, 10, -463], look: [lead.x + 30, 7, -440], fov: 54}, {t: 4.05, pos: [-30, 70, -463], look: [lead.x + 40, 6, -420], fov: 46}], u);
		else camKeys([{t: 4.05, pos: [nel.x - 105, 22, 731], look: [nel.x + 50, 8, 705], fov: 50}, {t: 5.0, pos: [nel.x - 150, 50, 555], look: [nel.x + 60, 4, 655], fov: 42}, {t: 6.6, pos: [-700, 480, -1200], look: [0, 0, 0], fov: 44}, {t: d, pos: [-900, 650, -1500], look: [0, 0, 0], fov: 44}], u);
		const heel = (q: any, k: number) => ({...q, roll: -0.075 * k});
		const line = LINE(sea0 + u, 0).map((q) => Math.abs(q.z - lead.z) < 75 ? heel(q, clamp01((tm - 0.3) / 0.9)) : Math.abs(q.z - nel.z) < 75 ? heel(q, clamp01((tm - TN - 0.3) / 0.9)) : q);
		setFleet(c.sea.combined, line, u); setFleet(c.sea.british, COLS(adv), u);
		const near = line.filter((q) => Math.abs(q.z - lead.z) < 420 || (u > 3.6 && Math.abs(q.z - nel.z) < 420));
		const a = broadsides(near, tm, 0.5, 7), b = broadsides(COLS(adv).slice(13, 18), tm, 0.5, 9), e = broadsides(COLS(adv).slice(1, 6).filter(() => u > 3.6), tm + 1.3, 0.55, 11);
		const r1 = rake(lead, tm, 0.04), r2 = rake(nel, tm, TN, -1);
		const all = u > 6.0 ? broadsides([...line, ...COLS(adv)], tm - 4.3, 0.5, 21) : {sm: [], fl: []};
		const volley: number[][] = []; if (u > 6.075) { const age = u - 6.075; [...line, ...COLS(adv)].forEach((q, i) => { if (age < 0.5) for (const sd of [-1, 1]) volley.push([q.x, 5, q.z + sd * 11, 30 * (1 - age / 0.5) + 10, 4.0, 2.0, 0.6, (1 - age / 0.5) * (0.6 + 0.4 * ((i * 7) % 3) / 2)]); volley.push([q.x + age * 3, 6 + age * 2, q.z + ((i % 2) * 2 - 1) * (14 + age * 5), 26 + age * 14, 0.6, 0.56, 0.5, 0.7 * Math.min(1, age * 4) * Math.exp(-age / 5)]); }); }
		c.seaSmoke.set([...a.sm, ...b.sm, ...e.sm, ...r1.sm, ...r2.sm, ...all.sm, ...volley.filter((q) => q[4] < 1)]); c.seaFlash.set([...a.fl, ...b.fl, ...e.fl, ...r1.fl, ...r2.fl, ...all.fl, ...volley.filter((q) => q[4] > 1)]);
		header(c, '1805 · 特拉法加', 1);
		seaDraw(c, sea0 + u, {bloom: 0.5, vig: 0.5, exposure: 0.36});
	}},
	// 11 — chart: the line in pieces, the van sails off; the tally
	{a: T.chart, b: T.rts, draw: (c, u) => {
		const ST = T.drop - T.traf, tt = ST * approachS + (T.chart - T.drop) + u, tmE = tmOf(T.chart - T.drop), adv = ADV0 + tmE * 55 + u * 40;
		camKeys([{t: 0, pos: [-900, 650, -1500], look: [0, 0, 0], fov: 44}, {t: 4.05, pos: [-300, 1900, -200], look: [-120, 0, 260], fov: 44}], u);
		const van = ease(u / 3.5) * 700; seaMarks(c, 0, 0, false); setFleet(c.sea.combined, LINE(tt, van), u); setFleet(c.sea.british, COLS(adv), u);
		{ const ko = 1 - clamp01(u / 1.6); const age = (T.chart - T.drop) - 6.075 + u; const vs = [...LINE(tt, van), ...COLS(adv)].map((q, i) => [q.x + age * 3, 6 + age * 2, q.z + ((i % 2) * 2 - 1) * (14 + age * 5), 26 + age * 14, 0.6, 0.56, 0.5, 0.7 * Math.exp(-age / 5) * ko]); c.seaSmoke.set(ko > 0 ? vs : []); c.seaFlash.set([]); }
		const v = toScreen([150, 0, 1350 + van]); if (v.front) tag(c.hud, Math.min(W - 160, v.x), Math.max(300, v.y - 60), '前队', env(u, 0.3, 99), 52, '#fff', RED);
		html(c.hud, `<div class="lbl" style="left:0;right:0;top:136px;text-align:center;font-size:50px;opacity:${env(u, 0.6, 99)}"><span style="text-shadow:0 0 8px ${BLUE},0 0 24px ${BLUE}">英国 损失 0 艘</span> · <span style="text-shadow:0 0 8px ${RED},0 0 24px ${RED}">对方 损失一半以上</span></div>`);
		header(c, '1805 · 特拉法加', 1);
		sub(c.hud, '结果，英国一艘船都[没丢]', u, 89.6 - T.chart, 92.55 - T.chart);
		seaDraw(c, tt, {bloom: 0.4, vig: 0.5, exposure: 0.5, sepia: 0.45});
	}},
	// 12 — Age of Empires II: one knight beats four swordsmen, loses to five
	{a: T.rts, b: T.sc, draw: (c, u) => {
		const R2 = 4.05; const v = u < R2 ? u : u - R2;
		camKeys([{t: 0, pos: [0, 15, 8], look: [0, 0, 0], fov: 38}, {t: 8.1, pos: [1.5, 12.5, 7.0], look: [0, 0, 0], fov: 38}], u);
		drawHeroes(c, knightRound(v, u < R2 ? 4 : 5, u < R2 ? 0.3 : 0.9), u, false);
		header(c, '《帝国时代2》里的实验', env(u, 93.8 - T.rts, 100.6 - T.rts));
		if (u > 96.59 - T.rts && u < R2) slam(c.hud, W / 2, 200, '1 v 4 <span style="color:#7dffb0">✓</span>', u, 96.59 - T.rts, R2 - 0.05, 96, BLUE);
		if (u > 99.6 - T.rts) slam(c.hud, W / 2, 200, '1 v 5 <span style="color:#ff8a7a">✗</span>', u, 99.6 - T.rts, 99, 96, RED);
		sub(c.hud, '骑士能1打4，[1打5必输]', u, 97.7 - T.rts, 100.7 - T.rts);
		gameDraw(c, {exposure: 0.78});
	}},
	// 13 — StarCraft: pull back over ten skirmishes; the predictions resolve, nine right, one wrong
	{a: T.sc, b: T.cb, draw: (c, u) => {
		camKeys([{t: 0, pos: [0, 16, 10], look: [0, 0, 0], fov: 40}, {t: 1.2, pos: [0, 32, 20], look: [0, 0, -1], fov: 42}, {t: 4.05, pos: [0, 34, 22], look: [0, 0, -1], fov: 42}], u);
		drawHeroes(c, skirmAt(u), u, false);
		SKIRM.forEach((s) => { const q = toScreen([s.x, 3.4, s.z]); const done = u > s.t; html(c.hud, `<div class="lbl" style="left:${q.x}px;top:${q.y}px;transform:translate(-50%,-50%);font-size:44px;color:${done ? (s.ok ? '#7dffb0' : '#ff8a7a') : '#fff'}">${done ? (s.ok ? '✓' : '✗') : '?'}</div>`); });
		if (u > 2.8) { slam(c.hud, W / 2, 170, '约九成猜中', u, 2.8, 99, 96, GOLD, '#fff6dd'); tag(c.hud, W / 2, 260, '2015 · 阿尔伯塔大学', env(u, 3.0, 99), 34, '#fff'); }
		header(c, '《星际争霸》AI', env(u, 0.1, 2.7));
		sub(c.hud, '星际争霸AI，按这套算法[猜胜负]', u, 101.75 - T.sc, 104.9 - T.sc);
		gameDraw(c, {exposure: 0.8});
	}},
	// 14 — callbacks: the bigger side losing (a lone hero walks into three; the line breaking; the district going blue)
	{a: T.cb, b: T.conv, draw: (c, u) => {
		const k = Math.floor(u / 1.35), v = u - k * 1.35;
		if (k === 0) { camKeys([{t: 0, pos: [-0.5, 5.6, 9.8], look: [-0.5, 0.9, 0], fov: 38}], 0); drawHeroes(c, oneByOneAt(v * 0.75).slice(0, 1).concat(oneByOneAt(v * 0.75).filter((h) => h.side === 1)), u); gameDraw(c); }
		else if (k === 1) { const tt = 30 + v, adv = ADV0 + 6.9 * 55; camKeys([{t: 0, pos: [-700, 480, -1200], look: [0, 0, 0], fov: 44}], 0); setFleet(c.sea.combined, LINE(tt, 300 + v * 80), tt); setFleet(c.sea.british, COLS(adv), tt); c.seaSmoke.set([]); c.seaFlash.set([]); seaMarks(c, 0, 0, false); seaDraw(c, tt, {exposure: 0.45}); }
		else { camKeys([{t: 0, pos: [-480, 760, -560], look: [-100, 0, 40], fov: 34}], 0); cityState(c, clamp01(0.3 + v / 1.2), 70 + v); cityDraw(c); }
		sub(c.hud, '人多，不一定[赢]', u, 105.8 - T.cb, 108.4 - T.cb);
	}},
	// 15 — converge: scattered blue companies march into one block in front of one red company; the block locks on the stop; freeze and dim
	{a: T.conv, b: T.mend, draw: (c, u, t) => {
		clearLand(c); const S = T.stop - T.conv, uu = Math.min(u, S); const m = ease(uu / S);
		camKeys([{t: 0, pos: [-150, 45, -190], look: [-20, 0, 0], fov: 40}, {t: S, pos: [-100, 30, -70], look: [-40, 1, 0], fov: 40}], uu);
		convergeAt(c, m); typedLine(c, t);
		landDraw(c, {exposure: 0.5, warm: 0.12, vig: 0.55, fade: clamp01((u - S) / (T.mend - T.stop)) * 0.55});
	}},
	// 16 — end card (silence)
	{a: T.mend, b: T.end, draw: (c, u) => {
		clearLand(c); const S = T.stop - T.conv; camKeys([{t: 0, pos: [-100, 30, -70], look: [-40, 1, 0], fov: 40}], 0); convergeAt(c, 1);
		landDraw(c, {exposure: 0.5, warm: 0.12, vig: 0.6, fade: 0.55 + 0.3 * clamp01(u / 0.6)});
		const o = env(u, 0.1, 99, 0.5);
		html(c.hud, `<div style="position:absolute;inset:0;opacity:${o}">
			<div style="position:absolute;left:50%;top:120px;transform:translateX(-50%);width:96px;height:96px;border-radius:48px;border:3px solid ${GOLD};color:${GOLD};font-weight:900;font-size:58px;line-height:92px;text-align:center;font-family:'Noto Serif CJK SC',serif">J</div>
			<div style="position:absolute;left:0;right:0;top:250px;text-align:center;font-weight:900;font-size:50px;color:${GOLD};letter-spacing:.08em">为什么要“集中优势兵力<span style="margin-right:-0.6em">”</span></div>
			<div style="position:absolute;left:0;right:0;top:350px;text-align:center;font-weight:900;font-size:76px;color:#fff;text-shadow:0 0 10px ${GOLD},0 0 34px rgba(246,207,120,.5)">你还在哪见过<span style="color:${GOLD}">「集中优势兵力」</span><span style="margin-right:-0.54em">？</span></div>
			<div style="position:absolute;left:0;right:0;top:470px;text-align:center;font-weight:700;font-size:40px;color:rgba(255,246,221,.85);letter-spacing:.2em">评论区聊聊<span style="margin-right:-0.2em"></span></div>
			<div style="position:absolute;left:50%;top:590px;transform:translateX(-50%);padding:14px 40px;border:2px solid rgba(246,207,120,.8);border-radius:40px;font-weight:700;font-size:36px;color:#fff6dd">关注 Juno · 一起看懂世界</div>
			<div style="position:absolute;left:0;right:0;bottom:40px;text-align:center;font-size:21px;color:rgba(255,255,255,.55);line-height:1.6">F. W. Lanchester 1914/1916 · London Gazette, 6 Nov 1805 · ランチェスター協会 · Lymbery et al., PNAS 2023 · Stanescu et al., AIIDE 2015 · 5 打 3 为按平方律示意<br>模拟：每名士兵独立装弹、随机瞄准、命中率约14% · 素材：Poly Haven (CC0)，KayKit (CC0)，Sketchfab：Andywoodhead、mixmamo.studio、matousekfoto (CC BY)</div>
		</div>`);
	}},
];
