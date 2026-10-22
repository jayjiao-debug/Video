// ep38 timeline: script v3 (+ gate notes). Every shot is a pure function of time.
import * as THREE from 'three';
import {block, rifle, melee, rnd, aliveAt, FPS, type Sim, type Unit} from './sim';
import {Army, Puffs, GroundSquares, Tracers, simBodies, simSmoke, simTracers, camKeys, camOrbit, draw, setGrade, setFleet, camera, toScreen, renderer, W, H, type Body, type Key} from './engine';
import {sub, counters, tag, slam, scrim, html, env, clamp01, GOLD, BLUE, RED} from './hud';

export type Ctx = {
	a: any; land: {scene: THREE.Scene; sun: THREE.DirectionalLight}; sea: {scene: THREE.Scene; water: any; combined: THREE.InstancedMesh[]; british: THREE.InstancedMesh[]};
	army: Army; smoke: Puffs; flash: Puffs; squares: GroundSquares; tracers: Tracers; rings: THREE.Mesh[]; text: THREE.Mesh; seaSmoke: Puffs; seaFlash: Puffs; hud: HTMLElement; split: HTMLCanvasElement;
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
const LINE = (t: number, vanAway: number) => Array.from({length: 33}, (_, i) => { const u = i / 32; const van = i >= 25; return {x: 40 * Math.sin(u * 3.0) + u * 70 + (van ? vanAway * 0.25 : 0), z: -1600 + u * 3200 + (van ? vanAway : 0) + t * 1.2, heading: -Math.PI / 2}; });
const COLS = (adv: number) => [
	...Array.from({length: 12}, (_, k) => ({x: -2600 + adv - k * 130, z: 650 + k * 6, heading: 0})),   // Nelson (weather column) → cuts ahead of the centre
	...Array.from({length: 15}, (_, k) => ({x: -2450 + adv - k * 125, z: -420 + k * 5, heading: 0})),  // Collingwood (lee column) → cuts the rear
];
let MARKS: {tracks: THREE.Mesh[]; hot: THREE.Mesh; van: THREE.Mesh} | null = null;
const flat = (scene: THREE.Scene, color: string) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({color, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false})); m.rotation.x = -Math.PI / 2; scene.add(m); return m; };
const seaMarks = (c: Ctx, o: number, adv: number, tracks = true) => {
	if (!MARKS) MARKS = {tracks: [flat(c.sea.scene, '#ffcf6a'), flat(c.sea.scene, '#ffcf6a')], hot: flat(c.sea.scene, '#ffcf6a'), van: flat(c.sea.scene, '#9a9a9a')};
	const set = (m: THREE.Mesh, x0: number, z0: number, x1: number, z1: number, wd: number, a: number) => { m.position.set((x0 + x1) / 2, 0.6, (z0 + z1) / 2); m.scale.set(Math.hypot(x1 - x0, z1 - z0), wd, 1); m.rotation.z = -Math.atan2(z1 - z0, x1 - x0); (m.material as THREE.MeshBasicMaterial).opacity = a; m.visible = a > 0.01; };
	set(MARKS.tracks[0], -2600 + adv, 650, 30, 660, 22, tracks ? o : 0); set(MARKS.tracks[1], -2450 + adv, -420, 20, -420, 22, tracks ? o : 0);
	set(MARKS.hot, 170, -1650, 170, 820, 60, o * 0.85); set(MARKS.van, 250, 880, 250, 1650, 60, o * 0.7);
};
const seaDraw = (c: Ctx, t: number, g: any = {}) => { (c.sea.water.material as any).uniforms.time.value = t * 0.6; setGrade({vig: 0.4, warm: 0.04, bloom: 0.45, exposure: 0.5, ...g}); draw(c.sea.scene); };
const broadsides = (ships: {x: number; z: number; heading: number}[], t: number, rate: number, seed: number) => {
	const R = rnd(seed), sm: number[][] = [], fl: number[][] = [];
	ships.forEach((s, i) => { for (let k = 0; k < 16; k++) { const ph = R() * 4; const age = ((t + ph) % 4) / rate; if (age > 7) continue; const along = (R() - 0.5) * 46, side = R() < 0.5 ? -1 : 1;
		const hx = Math.cos(s.heading), hz = -Math.sin(s.heading); const px = s.x + hx * along + hz * side * 9, pz = s.z + hz * along - hx * side * 9;
		sm.push([px + hz * side * (4 + age * 6) + age * 3, 5 + age * 2.2, pz - hx * side * (4 + age * 6), 10 + age * 10, 0.9, 0.88, 0.84, 0.85 * Math.exp(-age / 3.5) * Math.min(1, age * 8)]);
		if (age < 0.16) fl.push([px + hz * side * 3, 5, pz - hx * side * 3, 18 + (1 - age / 0.16) * 22, 3.2, 2.1, 1.0, 1 - age / 0.16]); } });
	return {sm, fl};
};

// ================================================================ shot table (seconds). Snapped to the music grid by crew (see music.md).
export const bar = (k: number) => 0.045 + 1.875 * k;
export const T = {
	volley: 0, drop: bar(8), rewind: bar(10), swords: bar(11), s1: bar(14), title: bar(16), guns: bar(18), why: bar(28), bullet: bar(32), x4: bar(40), squares: bar(42),
	divide: bar(50), half: bar(55), sunzi: bar(57), sea: bar(59), climax: bar(64), chart: bar(72), quiet: bar(80), limit: bar(84), ending: bar(86), card: bar(88), end: bar(94),
};
/** the thin bar under the blue counter: a tick at the intuitive 500 and a marker at the live count */
const guessBar = (c: Ctx, b: number, o: number) => { if (o <= 0) return; const x0 = 92, w = 520, y = 200, px = x0 + (b / 1000) * w;
	html(c.hud, `<div style="position:absolute;left:${x0}px;top:${y}px;width:${w}px;height:4px;background:rgba(255,255,255,.35);opacity:${o}"></div>
	<div style="position:absolute;left:${x0 + w / 2 - 2}px;top:${y - 12}px;width:4px;height:28px;background:#d8d8d8;opacity:${o}"></div>
	<div class="lbl" style="left:${x0 + w / 2}px;top:${y + 40}px;transform:translateX(-50%);font-size:48px;color:#e8e8e8;opacity:${o}">直觉：500？</div>
	<div style="position:absolute;left:${px - 9}px;top:${y - 7}px;width:18px;height:18px;border-radius:9px;background:#8fb6ff;box-shadow:0 0 12px ${BLUE};opacity:${o}"></div>`); };
/** a hook battle: 0 → 11.23 s of sim in 15 s, slowing for the end */
const V0 = bar(4); const hookST = (u: number) => (u < V0 ? -0.5 : u < 14.0 ? 0.2 + (u - V0) * 1.555 : 0.2 + (14.0 - V0) * 1.555 + (u - 14.0) * 0.32);
/** melee: duellists lunge at the contact line; a little dust where they meet */
const meleeBodies = (st: number, k: number): Body[] => simBodies(SM, st, 'rest', 0, 0, k).map((b, i) => { const u = SM.units[i]; if (b.fall > 0 || Math.abs(u.x) > 4) return b;
	const ph = Math.sin(st * 2.3 + u.fx * 40); return {...b, x: b.x + (u.side ? -1 : 1) * (0.35 + 0.35 * Math.max(0, ph)), lean: 0.22 * Math.max(0, ph)}; });
const meleeDust = (st: number) => { const R = rnd(Math.floor(st * 3) + 7), out: number[][] = []; for (let k = 0; k < 40; k++) out.push([(R() - 0.5) * 3, 0.5 + R() * 0.8, (R() - 0.5) * 40, 1.2 + R() * 1.5, 0.62, 0.55, 0.45, 0.22]); return out; };

export const TIMELINE: Shot[] = [
	// 01 — the hook: two firing lines; the battle runs live from frame 0; red reaches 0 on the bar-8 lift
	{a: T.volley, b: T.drop, draw: (c, u) => {
		clearLand(c); const st = hookST(u);
		camKeys([
			{t: 0, pos: [-52, 1.9, -9], look: [45, 1.5, 4], fov: 40}, {t: 7.5, pos: [-49.5, 2.1, -7], look: [45, 1.5, 2], fov: 36},
			{t: 9.5, pos: [-90, 16, -110], look: [0, 0, 0], fov: 40}, {t: 15.05, pos: [-200, 75, -360], look: [-10, 0, 0], fov: 38},
		], u);
		battle(c, SA, st);
		const [b, r] = aliveAt(SA, Math.max(0, st)); counters(c.hud, b, r); guessBar(c, b, env(u, 3.9, 99));
		sub(c.hud, '你有1000人，对面500人', u, 0.1, 3.4); sub(c.hud, '打光对面，你还剩[几个]？', u, 3.8, 7.2);
		curve(c, SA, Math.max(0, st), env(u, 9.5, 99) * 0.85);
		landDraw(c);
	}},
	// 02 — 866 on the lift; the guess tick fades out
	{a: T.drop, b: T.rewind, draw: (c, u) => {
		clearLand(c); camKeys([{t: 0, pos: [-200, 75, -360], look: [-10, 0, 0], fov: 38}, {t: 3.75, pos: [-170, 40, -230], look: [-60, 0, -40], fov: 34}], u);
		battle(c, SA, SA.end + 0.2 + u * 0.4);
		counters(c.hud, 866, 0, 1 - env(u, 0, 99, 0.2)); guessBar(c, 866, 1 - clamp01(u / 0.6));
		slam(c.hud, W / 2, H / 2 - 30, '866', u, 0.0, 3.6, 260, BLUE);
		tag(c.hud, W / 2, H / 2 + 120, '只倒下 134 人', env(u, 0.9, 3.4), 50, '#fff');
		landDraw(c, {bloom: 0.7});
	}},
	// 03 — rewind: the battle runs backwards; the fallen stand up, the smoke goes back into the muzzles
	{a: T.rewind, b: T.swords, draw: (c, u) => {
		clearLand(c); const d = T.swords - T.rewind, k = ease(u / d); const st = lerp(SA.end + 1.6, -0.6, k);
		camKeys([{t: 0, pos: [-170, 40, -230], look: [-60, 0, -40], fov: 34}, {t: d, pos: [-62, 30, -70], look: [0, 0, 0], fov: 38}], u);
		battle(c, SA, st, {tracers: false}); const [b, r] = aliveAt(SA, Math.max(0, st)); counters(c.hud, b, r, env(u, 0.1, 99));
		html(c.hud, `<div class="lbl" style="left:${W / 2 - 40}px;top:110px;font-size:64px;opacity:${0.8 * env(u, 0, d - 0.1)}">◀◀</div>`);
		landDraw(c, {bloom: 0.5, warm: 0.0, vig: 0.5, fade: clamp01((u - d + 0.35) / 0.35) * 0.7});
	}},
	// 04 — bayonets: deep columns meet; men fight one on one along the contact strip; the back half waits
	{a: T.swords, b: T.s1, draw: (c, u) => {
		clearLand(c); const k = 10, st = 0.2 + u * k; const fadeIn = 0.7 * (1 - clamp01(u / 0.3));
		camKeys([{t: 0, pos: [-62, 30, -70], look: [0, 0, 0], fov: 38}, {t: 3.75, pos: [-40, 40, -78], look: [-10, 0, 0], fov: 38}, {t: 5.63, pos: [-130, 70, -90], look: [-40, 0, 0], fov: 40}], u);
		c.army.set(meleeBodies(st, k), cp()); c.smoke.set(meleeDust(st)); c.flash.set([]); c.tracers.set([]);
		const [b, r] = aliveAt(SM, st); counters(c.hud, b, r);
		sub(c.hud, '拼刺刀，只能[一对一]', u, 0.05, 2.9); sub(c.hud, '多出的人，只能[排队]', u, 3.0, 5.5);
		const q = toScreen([-48, 2, 0]); tag(c.hud, q.x, q.y - 60, '在排队', env(u, 3.2, 99), 48, '#fff', BLUE);
		landDraw(c, {fade: fadeIn});
	}},
	// 05 — ★1: your 500 belongs to the age of cold steel
	{a: T.s1, b: T.title, draw: (c, u) => {
		clearLand(c); const st = Math.min(SM.end + 0.4, 0.2 + (T.s1 - T.swords) * 10 + u * 10);
		camOrbit([-25, 0, 0], 120, 60, -2.25 + u * 0.05, 38, 0);
		c.army.set(meleeBodies(st, 10), cp()); c.smoke.set(st < SM.end ? meleeDust(st) : []); c.flash.set([]); c.tracers.set([]);
		const [b, r] = aliveAt(SM, st); counters(c.hud, b, r); guessBar(c, b, env(u, 0, 3.5));
		if (r === 0) { slam(c.hud, 350, 112, '✓', u, 0.6, 3.6, 90, '#2bd67b', '#7dffb0'); tag(c.hud, W / 2, 232, '拼刺刀：剩 500', env(u, 0.8, 3.5), 56, '#fff', BLUE); }
		sub(c.hud, '你的直觉，属于[冷兵器时代]', u, 0.05, 3.6);
		landDraw(c);
	}},
	// 06 — TITLE on the hardest drop: letters condense out of the battle smoke
	{a: T.title, b: T.guns, draw: (c, u) => {
		clearLand(c); camOrbit([-25, 0, 0], 112, 52, -2.06 + u * 0.06, 38, 0);
		c.army.set(meleeBodies(SM.end + 1, 10), cp()); const R = rnd(4); c.smoke.set(Array.from({length: 260}, () => [(R() - 0.5) * 200, 4 + R() * 26, (R() - 0.5) * 140 - 40, 18 + R() * 22, 0.5, 0.47, 0.44, 0.3 * (1 - clamp01((u - 2.6) / 1.1))])); c.flash.set([]); c.tracers.set([]);
		const kk = clamp01(u / 0.45), blur = (1 - kk) * 18;
		scrim(c.hud, W / 2, H / 2 - 30, 1500, 300, env(u, 0, 3.75, 0.25, 0.5)); html(c.hud, `<div style="position:absolute;left:0;right:0;top:${H / 2 - 100}px;text-align:center;font-weight:900;font-size:124px;letter-spacing:.06em;color:#fff6dd;opacity:${env(u, 0, 3.75, 0.25, 0.5)};filter:blur(${blur}px);transform:scale(${1.12 - 0.12 * kk});text-shadow:0 0 10px ${GOLD},0 0 40px rgba(246,207,120,.6),0 4px 30px rgba(0,0,0,.6)">为什么要<span style="color:${GOLD}">“集中优势兵力<span style="margin-right:-0.56em">”</span></span></div>`);
		landDraw(c, {bloom: 0.65, vig: 0.55, exposure: 0.6 + 0.5 * clamp01((u - 3.35) / 0.4)});
	}},
	// 07 — guns: from the sun flare, the columns fan out into lines; first volley on bar 22; the battle at full speed → 866 again
	{a: T.guns, b: T.why, draw: (c, u) => {
		clearLand(c); const fan = ease((u - 0.4) / 5.8), st = u < 7.5 ? -1 : 0.2 + (u - 7.5);
		const from = simBodies(SM, 0, 'rest'), to = simBodies(SA, Math.max(-1, st));
		const bodies = u < 7.5 ? from.map((f, i) => { const t = to[i]; return {...t, x: lerp(f.x, t.x, fan), z: lerp(f.z, t.z, fan), pose: (fan > 0.02 && fan < 0.98 ? 'march' : fan >= 0.98 ? 'aim' : 'rest') as any}; }) : to;
		camKeys([{t: 0, pos: [-130, 70, -90], look: [-40, 0, 0], fov: 40}, {t: 3.5, pos: [-110, 20, -100], look: [-25, 0, 0], fov: 40}, {t: 6.5, pos: [-120, 14, -120], look: [-20, 0, 0], fov: 40}, {t: 9.5, pos: [-62, 3.2, -40], look: [45, 1.5, 20], fov: 38}, {t: 14, pos: [-160, 50, -200], look: [20, 0, 20], fov: 38}, {t: 18.75, pos: [-200, 75, -360], look: [0, 0, 0], fov: 38}], u);
		c.army.set(bodies, cp());
		if (u >= 7.5) { const {sm, fl} = simSmoke(SA, st); c.smoke.set(sm); c.flash.set(fl); c.tracers.set(simTracers(SA, st)); } else { c.smoke.set([]); c.flash.set([]); c.tracers.set([]); }
		const [b, r] = aliveAt(SA, Math.max(0, st)); counters(c.hud, b, r);
		if (u > 8.2 && r > 0) tag(c.hud, W / 2, 112, `人数比 ${(b / r).toFixed(1)} : 1`, env(u, 8.2, 99), 56, '#fff', GOLD);
		sub(c.hud, '有了枪，[人人]都能开火', u, 0.05, 3.5); sub(c.hud, '人越少，还手[越弱]', u, 11.3, 14.7);
		landDraw(c, {exposure: 0.66 + 0.5 * (1 - clamp01(u / 0.6))});
	}},
	// 08 — why? flash back to the first volley; it erupts in slow motion and stops
	{a: T.why, b: T.bullet, draw: (c, u) => {
		clearLand(c); const d = T.bullet - T.why; const v = clamp01((u - 1.2) / (d - 1.2)); const st = u < 1.2 ? -0.4 : 0.2 + 0.22 * (1 - (1 - v) * (1 - v));
		camKeys([{t: 0, pos: [-96, 2.2, -14], look: [45, 2, 0], fov: 40}, {t: 3.5, pos: [-88, 9, -26], look: [20, 1, 0], fov: 38}, {t: d, pos: [-60, 26, -64], look: [0, 1, 0], fov: 38}], u);
		battle(c, SA, st); counters(c.hud, 1000, 500);
		sub(c.hud, '差距，从[第一枪]就开始了', u, 0.3, 3.4);
		landDraw(c, {bloom: 0.65, exposure: 0.66 + 1.4 * (1 - clamp01(u / 0.35))});
	}},
	// 09 — bullet time on the first volley: count the balls
	{a: T.bullet, b: T.x4, draw: (c, u) => {
		clearLand(c); const d = T.x4 - T.bullet; const R = SA.units[redStar[0]], B = SA.units[blueOne[0]], B2 = SA.units[bluePartner];
		if (u < 5.6) camKeys([{t: 0, pos: [-60, 26, -64], look: [0, 1, 0], fov: 38}, {t: 5.6, pos: [R.x - 14, 3.2, R.z - 9], look: [R.x, 1.4, R.z], fov: 36}], u);
		else if (u < 11.25) camKeys([{t: 5.6, pos: [R.x - 14, 3.2, R.z - 9], look: [R.x, 1.4, R.z], fov: 36}, {t: 11.25, pos: [(B.x + B2.x) / 2 + 8, 2.6, (B.z + B2.z) / 2 - 7], look: [(B.x + B2.x) / 2, 1.2, (B.z + B2.z) / 2], fov: 38}], u);
		else camKeys([{t: 11.25, pos: [(B.x + B2.x) / 2 + 8, 2.6, (B.z + B2.z) / 2 - 7], look: [(B.x + B2.x) / 2, 1.2, (B.z + B2.z) / 2], fov: 38}, {t: d, pos: [-10, 44, -80], look: [0, 0, 0], fov: 40}], u);
		battle(c, SA, FREEZE, {tracers: false});
		const segs: number[][] = []; firstVolley.forEach((s) => { const a = SA.units[s.from], b = SA.units[s.to], dir = a.side ? -1 : 1; let f = clamp01((FREEZE - s.t) / 0.28);
			const focus = (s.to === redStar[0] || s.to === blueOne[0]); if (focus) f = 0.975; if (f <= 0 && !focus) return;
			const x1 = a.x + dir * 1.3, tx = s.hit ? b.x : b.x + dir * 6, tz = s.hit ? b.z : b.z + (a.fx - 0.5) * 3; const p = (q: number) => [x1 + (tx - x1) * q, 1.45 + ((s.hit ? 1.3 : 0.6) - 1.45) * q, a.z + (tz - a.z) * q];
			const k = focus ? 3.0 : 0.16; const col = a.side ? [3.2 * k, 1.6 * k, 1.1 * k] : [1.4 * k, 2.1 * k, 3.4 * k]; segs.push([...p(Math.max(0, f - (focus ? 0.05 : 0.04))), ...p(f), ...col]); });
		c.tracers.set(segs);
		const ring = (m: THREE.Mesh, x: number, z: number, o: number, col: string) => { m.visible = o > 0; m.position.set(x, 0.12, z); (m.material as THREE.MeshBasicMaterial).color.set(col); (m.material as THREE.MeshBasicMaterial).opacity = o; };
		ring(c.rings[0], R.x, R.z, env(u, 3.0, 11.0), '#ff6a5a'); ring(c.rings[1], B.x, B.z, env(u, 8.0, 11.2), '#6aa8ff'); ring(c.rings[2], B2.x, B2.z, env(u, 8.0, 11.2), '#6aa8ff');
		counters(c.hud, 1000, 500, 0.6);
		if (u < 5.6) { // count the two balls at their tips
			firstVolley.filter((s) => s.to === redStar[0]).forEach((s, k) => { const a = SA.units[s.from], dir = a.side ? -1 : 1; const x1 = a.x + dir * 1.3; const p = toScreen([x1 + (R.x - x1) * 0.975, 1.35, a.z + (R.z - a.z) * 0.975]); tag(c.hud, p.x + (k ? 34 : -34), p.y - 40, `${k + 1}`, env(u, 3.2 + k * 0.45, 5.5), 64, '#fff', RED); });
		} else if (u < 11.25) { const p = toScreen([(B.x + B2.x) / 2, 2.3, (B.z + B2.z) / 2]); tag(c.hud, p.x, p.y - 30, '两人才挨 1 枪', env(u, 8.6, 11.1), 56, '#fff', BLUE); }
		else { const pb = {x: 520, y: 420}, pr = {x: 1400, y: 420};
			const m = clamp01((u - 13.4) / 0.6); tag(c.hud, lerp(pb.x, W / 2, m), lerp(pb.y, 520, m), '火力 ×2', env(u, 11.3, 99) * (1 - m), 72, '#fff', BLUE); tag(c.hud, lerp(pr.x, W / 2, m), lerp(pr.y, 520, m), '挨打 ÷2', env(u, 11.8, 99) * (1 - m), 72, '#fff', RED);
			if (u > 13.9) slam(c.hud, W / 2, 520, '战斗力 ×4', u, 13.9, 99, 120, GOLD, '#fff6dd'); }
		sub(c.hud, '你开的枪，是他的[两倍]', u, 0.05, 3.4); sub(c.hud, '他的子弹，要分给[两倍]的人', u, 5.6, 9.0); sub(c.hud, '人多一倍，强了[不止一倍]', u, 11.3, 14.8);
		landDraw(c, {bloom: 0.75, warm: -0.02, vig: 0.48});
	}},
	// 10 — time resumes; the camera climbs to straight down over the two lines
	{a: T.x4, b: T.squares, draw: (c, u) => {
		clearLand(c); const d = T.squares - T.x4; const st = FREEZE + u * 0.9;
		camKeys([{t: 0, pos: [-10, 44, -80], look: [0, 0, 0], fov: 40}, {t: d, pos: [-140, 640, -620], look: [-130, 0, -20], fov: 40}], u);
		battle(c, SA, st); counters(c.hud, ...aliveAt(SA, st) as [number, number]);
		slam(c.hud, W / 2, 520, '战斗力 ×4', u, -1, 1.2, 120, GOLD, '#fff6dd');
		landDraw(c);
	}},
	// 11 — ★3: each firing line is the side of a square; red's square tiles blue's four times; replay: both squares lose the same area every moment; blue's loss = red's whole square; what's left is 866
	{a: T.squares, b: T.divide, draw: (c, u) => {
		clearLand(c); camKeys([{t: 0, pos: [-140, 640, -620], look: [-130, 0, -20], fov: 40}], 0);
		const bs = 1000 * LEN, rs = 500 * LEN, grow = ease(u / 1.4), tile = env(u, 1.6, 3.75, 0.2, 0.25);
		const rp = clamp01((u - 3.75) / 4.1), st = 0.2 + rp * 11.1; const [b, r] = aliveAt(SA, u < 3.75 ? 0 : st);
		const bl = b * LEN, rl = r * LEN; // live sides
		const fold = ease((u - 8.2) / 1.6), tape = clamp01((u - 9.9) / 1.3);
		c.army.set(simBodies(SA, u < 3.75 ? 0.1 : st), cp()); c.smoke.set([]); c.flash.set([]); c.tracers.set(u > 3.75 && u < 8 ? simTracers(SA, st) : []);
		const L: any[] = [];
		// blue: ghost of the full square, live square (anchored on its line, centred on it), lost area shown as a dim L
		L.push({x: -45 - bs * grow, z: -bs / 2, w: bs * grow, d: bs, color: '#4a90ff', a: u < 3.75 ? 1 : 0.22, edge: u < 3.75 ? 1 : 0.35});
		if (u >= 3.75) L.push({x: -45 - bl, z: -bl / 2, w: bl, d: bl, color: '#4a90ff', a: 1});
		// red: ghost + live square
		L.push({x: 47, z: -rs / 2, w: rs * grow, d: rs, color: '#ff5a47', a: u < 3.75 ? 1 : 0.2, edge: 0.6}); if (u >= 3.75 && rl > 0.5) L.push({x: 47, z: -rl / 2, w: rl, d: rl, color: '#ff5a47', a: 1});
		if (tile > 0) [[0, 0], [rs, 0], [0, rs], [rs, rs]].forEach(([ox, oz], k) => L.push({x: -45 - bs + ox, z: -bs / 2 + oz, w: rs, d: rs, color: '#ffb0a4', a: tile * clamp01((u - 1.6 - k * 0.32) / 0.2), edge: 1}));
		// fold: blue's lost area becomes one square, laid beside red's empty ghost — the same size
		if (fold > 0) L.push({x: lerp(-45 - bs, 47, fold), z: lerp(-bs / 2, -rs / 2, fold), w: rs, d: rs, color: '#8fb6ff', a: env(u, 8.2, 99) * 0.9, edge: 1});
		c.squares.set(L);
		const P = (x: number, z: number) => toScreen([x, 0, z]);
		const pb = P(-45 - bs / 2, -bs / 2 - 30), pr = P(47 + rs / 2, -rs / 2 - 30);
		tag(c.hud, pb.x, pb.y + 30, '边长 = 一排人的长度', env(u, 0.4, 3.6), 44, '#fff', BLUE); tag(c.hud, pr.x, pr.y + 30, '500 人', env(u, 0.4, 3.6), 44, '#fff', RED);
		if (tile > 0) { const k = Math.max(1, Math.min(4, 1 + Math.floor((u - 1.6) / 0.32))); const pc = P(-45 - bs / 2, 0); slam(c.hud, pc.x, pc.y, `×${k}`, u, 1.6 + (k - 1) * 0.32, 3.75, 150, GOLD, '#fff6dd'); }
		if (u >= 3.75 && u < 8.2) counters(c.hud, b, r);
		if (fold > 0.95) { const pf = P(47 + rs / 2, 0); tag(c.hud, pf.x, pf.y, '一样大', env(u, 9.6, 11.1), 64, '#fff', GOLD); }
		if (tape > 0) { const fs = 866 * LEN; const pt = P(-45 - fs - 70, 0);
			if (u < 11.25) tag(c.hud, pt.x - 40, pt.y, `${Math.round(866 * tape)}`, env(u, 9.9, 99), 64, '#fff', GOLD); else slam(c.hud, pt.x - 60, pt.y, '866', u, 11.25, 99, 110, BLUE);
			html(c.hud, `<div style="position:absolute;left:0;right:0;top:92px;text-align:center;font-weight:900;font-size:76px;color:#fff;opacity:${env(u, 11.6, 99)};text-shadow:0 0 6px ${GOLD},0 0 26px rgba(246,207,120,.6),0 2px 10px rgba(0,0,0,.65)">1000² − 500² ≈ 866²</div>`);
			tag(c.hud, W / 2, 236, '英国工程师 兰彻斯特 · 1914', env(u, 12.2, 99) * 0.9, 40, '#fff'); }
		sub(c.hud, '战斗力，看人数的[平方]', u, 0.05, 3.4); sub(c.hud, '每一刻，两边掉的面积[一样多]', u, 3.8, 7.3); sub(c.hud, '开头的866，就是[这么来的]', u, 11.3, 14.8);
		landDraw(c, {bloom: 0.6});
	}},
	// 12 — divide: 1000 v 1000 (both bled white); then the same 1000 against two waves of 500 → 866 → 707
	{a: T.divide, b: T.half, draw: (c, u) => {
		clearLand(c);
		if (u < 3.75) { const st = 0.2 + 38 * Math.pow(u / 3.75, 1.5); camKeys([{t: 0, pos: [-140, 640, -620], look: [-130, 0, -20], fov: 40}, {t: 1.4, pos: [-170, 60, -260], look: [0, 0, 0], fov: 40}, {t: 3.75, pos: [-180, 70, -270], look: [0, 0, 0], fov: 40}], u);
			battle(c, SL, st, {}); c.army.set(simBodies(SL, st, 'aim', 0, 0, 30), cp()); const [b, r] = aliveAt(SL, st); counters(c.hud, b, r);
			sub(c.hud, '两边一样多？[两败俱伤]', u, 0.05, 3.4); landDraw(c); return; }
		const v = u - 3.75; const w1 = 2.55, mar = 0.6; // wave 1 (4.4×), march, wave 2 (5×)
		camKeys([{t: 3.75, pos: [-180, 70, -270], look: [0, 0, 0], fov: 40}, {t: 5.0, pos: [-120, 60, -330], look: [120, 0, 0], fov: 42}, {t: 9.4, pos: [-110, 55, -300], look: [90, 0, 0], fov: 42}], u);
		let bodies: Body[], st1 = 0.2 + Math.min(v, w1) * (SA2.end / w1), st2 = (v - w1 - mar) * ((SR2.end + 0.2) / (9.4 - 3.75 - w1 - mar)) + 0.2;
		const wave2At = (m: number) => simBodies(SR2, Math.max(-1, st2), 'aim', 0, 0, 5).map((x, i) => (SR2.units[i].side === 1 ? {...x, x: x.x + (1 - m) * 260, pose: (m < 1 ? 'march' : x.pose) as any} : x));
		const fallen1 = simBodies(SA2, SA2.end + 3).filter((x) => x.side === 1);
		if (v < w1) { bodies = [...simBodies(SA2, st1, 'aim', 0, 0, 4.4), ...wave2At(0).filter((x) => x.side === 1)]; const sm = simSmoke(SA2, st1); c.smoke.set(sm.sm); c.flash.set(sm.fl); c.tracers.set(simTracers(SA2, st1)); }
		else { const m = clamp01((v - w1) / mar); bodies = [...wave2At(m), ...fallen1]; const sm = simSmoke(SR2, st2); c.smoke.set(sm.sm); c.flash.set(sm.fl); c.tracers.set(simTracers(SR2, st2)); }
		c.army.set(bodies, cp());
		const b = v < w1 ? aliveAt(SA2, st1)[0] : aliveAt(SR2, Math.max(0, st2))[0], r = v < w1 ? aliveAt(SA2, st1)[1] + 500 : aliveAt(SR2, Math.max(0, st2))[1];
		counters(c.hud, b, r, 1, ['', '两拨，各 500']);
		sub(c.hud, '要是对面分[两拨]来呢？', u, 3.8, 6.3); tag(c.hud, W / 2, 232, '打团最忌：<span style="color:#ffd27a">一拨一拨上</span>', env(u, 6.4, 9.3), 52, '#fff', GOLD);
		landDraw(c);
	}},
	// 13 — ★4: two half-armies are half the strength (overhead)
	{a: T.half, b: T.sunzi, draw: (c, u) => {
		clearLand(c); const big = 1000 * LEN, hs = 500 * LEN, k = ease((u - 0.9) / 1.2);
		camKeys([{t: 0, pos: [-150, 50, -210], look: [60, 0, 0], fov: 40}, {t: 1.0, pos: [0, 820, -1], look: [0, 0, 0], fov: 40, upZ: true}], u);
		c.army.set(simBodies(SR2, 99), cp()); c.smoke.set([]); c.flash.set([]); c.tracers.set([]);
		c.squares.set([{x: -big / 2, z: -big / 2, w: big, d: big, color: '#ff8a7a', a: env(u, 0.8, 99) * 0.45, edge: 1},
			{x: lerp(-big / 2 - 320, -big / 2, k), z: -big / 2, w: hs, d: hs, color: '#ff5a47', a: env(u, 0.8, 99)},
			{x: lerp(big / 2 + 80, -big / 2 + hs, k), z: -big / 2, w: hs, d: hs, color: '#ff5a47', a: env(u, 0.8, 99)}]);
		tag(c.hud, W / 2, 140, '两块加起来 = <span style="color:#ffd27a">一半</span>', env(u, 2.2, 3.6), 64, '#fff', RED);
		sub(c.hud, '分成两拨，总力量只剩[一半]', u, 0.3, 3.7);
		landDraw(c, {bloom: 0.6});
	}},
	// 14 — 孙子: "以十攻其一" in gold brush strokes across the empty half; then the camera rises into the sky (bridge to the sea)
	{a: T.sunzi, b: T.sea, draw: (c, u) => {
		clearLand(c); const d = T.sea - T.sunzi; const big = 1000 * LEN;
		camKeys([{t: 0, pos: [0, 820, -1], look: [0, 0, 0], fov: 40, upZ: true}, {t: 2.2, pos: [0, 640, -120], look: [0, 0, 120], fov: 40, upZ: true}, {t: d, pos: [0, 520, -300], look: [0, 900, 3000], fov: 42}], u);
		c.army.set(simBodies(SR2, 99), cp()); c.smoke.set([]); c.flash.set([]); c.tracers.set([]);
		c.squares.set([{x: -big / 2, z: -big / 2, w: big, d: big, color: '#ff8a7a', a: 0.45 * (1 - clamp01((u - 2.4) / 0.8)), edge: 1}]);
		c.text.visible = true; c.text.position.set(0, 0.3, big / 4); c.text.userData.reveal(clamp01((u - 0.05) / 1.8));
		tag(c.hud, W / 2, 140, '《孙子·虚实篇》', env(u, 0.3, 2.6), 46, '#fff', GOLD);
		sub(c.hud, '我专为一，敌分为十', u, 0.05, 2.9);
		landDraw(c, {bloom: 0.7, exposure: 0.66 + 0.6 * clamp01((u - d + 0.5) / 0.5)});
	}},
	// 15 — Trafalgar: down from the clouds onto 27 v 33; the plan drawn on the water: both columns into the same stretch, the van left alone
	{a: T.sea, b: T.climax, draw: (c, u) => {
		const d = T.climax - T.sea; const adv = 1500 + u * 95;
		camKeys([{t: 0, pos: [-1500, 1600, -2600], look: [-1200, 2600, 1200], fov: 42}, {t: 1.4, pos: [-1700, 900, -2300], look: [0, 0, 0], fov: 40}, {t: 6.5, pos: [-1500, 260, -1200], look: [0, 10, 0], fov: 38}, {t: d, pos: [adv - 2450 - 20, 7, -472], look: [adv - 2450 + 260, 9, -430], fov: 40}], u);
		setFleet(c.sea.combined, LINE(u, 0), u); setFleet(c.sea.british, COLS(adv), u);
		const {sm, fl} = broadsides(LINE(u, 0).slice(0, 18), u, 1, 3); c.seaSmoke.set(u > 4 ? sm : []); c.seaFlash.set(u > 4 ? fl : []);
		seaMarks(c, env(u, 3.75, d - 1.6, 0.5, 0.6), adv);
		tag(c.hud, W / 2, 80, '1805 · 特拉法加', env(u, 0.5, d - 0.5), 40, '#fff');
		counters(c.hud, 27, 33, env(u, 0.8, d - 0.3), ['英国', '法西联合']);
		if (u > 4.2 && u < d - 1.6) { const pv = toScreen([260, 0, 1450]); if (pv.front) tag(c.hud, Math.min(W - 260, pv.x + 40), pv.y - 50, '前队：先不理它', env(u, 5.0, d - 1.7), 52, '#eee'); }
		sub(c.hud, '英国船少，硬拼[该输]', u, 0.05, 3.4); sub(c.hud, '两列，全压向[同一段]', u, 3.8, 7.2);
		seaDraw(c, u, {exposure: 0.5 + 0.7 * (1 - clamp01(u / 0.8))});
	}},
	// 15b — CLIMAX (15 s): the lead ship cuts the line on the downbeat; slow motion past the stern; the second column breaks through at u = 7.5; crane up on the loudest bar
	{a: T.climax, b: T.chart, draw: (c, u) => {
		const d = T.chart - T.climax; const tm = u < 1.2 ? u : u < 3.0 ? 1.2 + (u - 1.2) * 0.25 : 1.65 + (u - 3.0); // slow motion as the bow passes the stern
		const adv0 = 1500 + 95 * (T.climax - T.sea), adv = adv0 + tm * 55; const lead = {x: adv - 2450, z: -420}, nel = {x: adv - 2600, z: 650};
		if (u < 7.5) camKeys([{t: 0, pos: [lead.x - 20, 7, -472], look: [lead.x + 260, 9, -430], fov: 40}, {t: 3.0, pos: [lead.x - 30, 5.5, -500], look: [lead.x + 70, 10, -420], fov: 42}, {t: 7.5, pos: [lead.x - 120, 26, -560], look: [lead.x + 60, 6, -380], fov: 42}], u);
		else camKeys([{t: 7.5, pos: [nel.x - 90, 14, 590], look: [nel.x + 120, 10, 660], fov: 40}, {t: 9.4, pos: [nel.x - 160, 60, 490], look: [nel.x + 60, 4, 570], fov: 42}, {t: d, pos: [-900, 650, -1500], look: [0, 0, 0], fov: 44}], u);
		const line = LINE(T.climax - T.sea + u, 0); setFleet(c.sea.combined, line, u); setFleet(c.sea.british, COLS(adv), u);
		const near = line.filter((q) => Math.abs(q.z - lead.z) < 420 || (u > 7.0 && Math.abs(q.z - nel.z) < 420));
		const a = broadsides(near, tm, 0.55, 7), b = broadsides(COLS(adv).slice(12, 18), tm, 0.55, 9), e = broadsides(COLS(adv).slice(0, 6).filter(() => u > 7.0), tm + 1.3, 0.6, 11);
		c.seaSmoke.set([...a.sm, ...b.sm, ...e.sm]); c.seaFlash.set([...a.fl, ...b.fl, ...e.fl]);
		seaDraw(c, T.climax - T.sea + u, {bloom: 0.5, vig: 0.48, exposure: 0.4});
	}},
	// 15c — chart: the line in three pieces, the van sails away
	{a: T.chart, b: T.quiet, draw: (c, u) => {
		const d = T.quiet - T.chart; const tt = T.chart - T.sea + u; const adv = 1500 + 95 * (T.climax - T.sea) + 13.65 * 55 + u * 40;
		camKeys([{t: 0, pos: [-900, 650, -1500], look: [0, 0, 0], fov: 44}, {t: 7.5, pos: [-1700, 900, -300], look: [0, 0, 500], fov: 44}, {t: 15, pos: [-1900, 1100, 200], look: [100, 0, 900], fov: 44}], u);
		const van = ease((u - 1.8) / 5) * 900; seaMarks(c, 0, 0, false); setFleet(c.sea.combined, LINE(tt, van), u); setFleet(c.sea.british, COLS(adv), u);
		c.seaSmoke.set([]); c.seaFlash.set([]);
		const sep = clamp01((u - 1.6) / 0.8); const p = (x: number, z: number) => toScreen([x, 0, z]);
		const v = p(150, 1350 + van);
		if (v.front) tag(c.hud, Math.min(W - 160, v.x), Math.max(150, v.y - 60), '前队', env(u, 1.0, 99), 52, '#fff', RED);
		html(c.hud, `<div class="lbl" style="left:0;right:0;top:200px;text-align:center;font-size:52px;opacity:${env(u, 11.0, 99)}"><span style="text-shadow:0 0 8px ${RED},0 0 24px ${RED}">对方 33 艘：一半以上 被俘或被毁</span></div>`);
		sub(c.hud, '敌人的前队，[赶不回来]', u, 0.3, 3.7); tag(c.hud, W / 2, 132, '兰彻斯特用平方律分析过这一仗 · 1916', env(u, 3.9, 7.3) * 0.9, 40, '#fff'); sub(c.hud, '英国，一艘船都[没丢]', u, 7.5, 10.9);
		seaDraw(c, tt, {bloom: 0.4, vig: 0.46, exposure: 0.5});
	}},
	// 16 — quiet: one ship drifting at sunset, no text; a bank of smoke crosses the lens and carries the cut to the field
	{a: T.quiet, b: T.limit, draw: (c, u) => {
		const d = T.limit - T.quiet; setFleet(c.sea.combined, [], u); setFleet(c.sea.british, [{x: 0, z: 0, heading: 0.3}], u); seaMarks(c, 0, 0);
		camKeys([{t: 0, pos: [-260, 6, -180], look: [1000, 40, 900], fov: 38}, {t: d, pos: [-215, 5, -205], look: [1000, 36, 900], fov: 37}], u);
		const bank = clamp01((u - d + 1.6) / 1.6); const sm: number[][] = Array.from({length: 40}, (_, i) => [-200 + i * 12, 20 + (i % 5) * 6, 120 + (i % 7) * 20, 60, 0.85, 0.8, 0.78, 0.18]);
		for (let k = 0; k < 30; k++) sm.push([camera.position.x + 30 + k * 0.8, 5 + (k % 5), camera.position.z + 20 + (k % 7) * 3 - 60 + bank * 80, 26, 0.86, 0.82, 0.8, 0.55 * bank]);
		c.seaSmoke.set(sm); c.seaFlash.set([]);
		seaDraw(c, 30 + u, {exposure: 0.52, warm: 0.08, vig: 0.5});
	}},
	// 17 — limit: the same field at dusk, a messy fight: smoke banks, companies arriving late, men with no target standing idle
	{a: T.limit, b: T.ending, draw: (c, u) => {
		clearLand(c); const d = T.ending - T.limit; camKeys([{t: 0, pos: [-210, 60, -260], look: [0, 0, 0], fov: 40}, {t: d, pos: [-190, 70, -240], look: [0, 0, 0], fov: 39}], u);
		const st = 3 + u; const RR = rnd(31); const bodies = simBodies(SL, st, 'aim').map((b, i) => { const z = SL.units[i].z, j = RR(); const grp = Math.floor((z + 300) / 70); const off = (grp % 3) * 22 * (SL.units[i].side ? 1 : -1) + Math.sin(grp * 1.7) * 12; return {...b, x: b.x + off, z: b.z + (j - 0.5) * 3, pose: (grp % 4 === 1 ? 'rest' : b.pose) as any}; });
		c.army.set(bodies, cp()); const sm = simSmoke(SL, st); 
		c.smoke.set(sm.sm); c.flash.set(sm.fl); c.tracers.set([]);
		sub(c.hud, '真实的仗，没平方这么[夸张]', u, 0.05, 3.6);
		landDraw(c, {exposure: 0.52 + 1.2 * (1 - clamp01(u / 0.5)), warm: 0.1, vig: 0.5});
	}},
	// 18 — ending image: scattered companies gather into one block
	{a: T.ending, b: T.card, draw: (c, u) => {
		clearLand(c); const d = T.card - T.ending; camKeys([{t: 0, pos: [-75, 9, -80], look: [0, 0, 0], fov: 40}, {t: d, pos: [-110, 30, -120], look: [0, 0, 0], fov: 40}], u);
		const R = rnd(5), m = ease((u - 0.1) / 3.4); const bodies: Body[] = [];
		const centres = Array.from({length: 8}, () => [(R() - 0.5) * 300, (R() - 0.5) * 240]);
		for (let i = 0; i < 800; i++) { const g = i % 8, k = Math.floor(i / 8); const cx = centres[g][0] + ((k % 10) - 4.5) * 1.6, cz = centres[g][1] + (Math.floor(k / 10) - 4.5) * 1.6; const fx = (i % 40 - 19.5) * 1.6, fz = (Math.floor(i / 40) - 9.5) * 1.6;
			bodies.push({x: lerp(cx, fx, m), z: lerp(cz, fz, m), ry: -Math.PI / 2, side: 0, pose: m > 0.02 && m < 0.98 ? 'march' : 'rest', fall: 0}); }
		c.army.set(bodies, cp()); c.smoke.set([]); c.flash.set([]); c.tracers.set([]);
		sub(c.hud, '同一时刻、同一地方，[比他多]', u, 0.05, 3.7);
		landDraw(c, {exposure: 0.5 - 0.16 * clamp01(u / d), warm: 0.12, vig: 0.55, fade: clamp01((u - d + 0.8) / 0.8) * 0.85});
	}},
	// 19 — end card
	{a: T.card, b: T.end, draw: (c, u) => {
		clearLand(c); camKeys([{t: 0, pos: [-110, 30, -120], look: [0, 0, 0], fov: 40}], 0); c.army.set([], cp());
		landDraw(c, {exposure: 0.45, warm: 0.12, vig: 0.6, fade: 0.85});
		const o = env(u, 0.2, 99, 0.6);
		html(c.hud, `<div style="position:absolute;inset:0;opacity:${o}">
			<div style="position:absolute;left:50%;top:120px;transform:translateX(-50%);width:96px;height:96px;border-radius:48px;border:3px solid ${GOLD};color:${GOLD};font-weight:900;font-size:58px;line-height:92px;text-align:center;font-family:'Noto Serif CJK SC',serif">J</div>
			<div style="position:absolute;left:0;right:0;top:250px;text-align:center;font-weight:900;font-size:50px;color:${GOLD};letter-spacing:.08em">为什么要“集中优势兵力<span style="margin-right:-0.6em">”</span></div>
			<div style="position:absolute;left:0;right:0;top:350px;text-align:center;font-weight:900;font-size:76px;color:#fff;text-shadow:0 0 10px ${GOLD},0 0 34px rgba(246,207,120,.5)">你还在哪见过<span style="color:${GOLD}">「集中优势兵力」</span><span style="margin-right:-0.54em">？</span></div>
			<div style="position:absolute;left:0;right:0;top:470px;text-align:center;font-weight:700;font-size:40px;color:rgba(255,246,221,.85);letter-spacing:.2em">评论区聊聊<span style="margin-right:-0.2em"></span></div>
			<div style="position:absolute;left:50%;top:590px;transform:translateX(-50%);padding:14px 40px;border:2px solid rgba(246,207,120,.8);border-radius:40px;font-weight:700;font-size:36px;color:#fff6dd">关注 Juno · 一起看懂世界</div>
			<div style="position:absolute;left:0;right:0;bottom:46px;text-align:center;font-size:22px;color:rgba(255,255,255,.55);line-height:1.6">F. W. Lanchester, Aircraft in Warfare (1916) · London Gazette, 6 Nov 1805 · Nelson's memorandum, 9 Oct 1805 · 《孙子·虚实篇》<br>模拟：每名士兵独立装弹、随机瞄准、命中率约14%；866、707 为平方律的值 · 素材：Poly Haven (CC0)，Sketchfab：Andywoodhead、mixmamo.studio (CC BY)<br>音乐：“Rynos Theme” Kevin MacLeod (incompetech.com)，Licensed under Creative Commons: By Attribution 4.0</div>
		</div>`);
	}},
];
