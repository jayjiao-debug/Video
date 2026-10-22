// Battle simulations for ep38. Deterministic (seeded); every soldier is an agent.
export const FPS = 30;
export const rnd = (seed: number) => { let s = (seed * 9973 + 12345) % 2147483647; for (let i = 0; i < 7; i++) s = (s * 16807) % 2147483647; return () => ((s = (s * 16807) % 2147483647) / 2147483647); };

export type Unit = {x: number; z: number; side: 0 | 1; group: number; death: number; fx: number};
export type Shot = {t: number; from: number; to: number; hit: boolean};
export type Sim = {units: Unit[]; shots: Shot[]; alive: number[][]; t0: number; end: number; kind: 'rifle' | 'melee'};

/** a block of n soldiers: `files` men wide (along z), ranks going back from the front line at x = frontX (blue faces +x, red −x) */
export const block = (R: () => number, n: number, files: number, side: 0 | 1, group: number, frontX: number, z0: number, sp = 1.6): Unit[] => {
	const out: Unit[] = []; const dir = side === 0 ? -1 : 1;
	for (let i = 0; i < n; i++) { const rank = Math.floor(i / files), file = i % files;
		out.push({x: frontX + dir * rank * sp + (R() - 0.5) * 0.45, z: z0 + (file - (files - 1) / 2) * sp + (R() - 0.5) * 0.45, side, group, death: Infinity, fx: R()}); }
	return out;
};

/** aimed fire: each living soldier fires every ~T s at a random living enemy in the engaged groups and hits with p.
 *  `engage(g, t, redAlive)` says whether red group g is in the fight (one blue army can take two red halves in turn). */
export function rifle(units: Unit[], seed: number, t0: number, opts: {T?: number; p?: number; dur?: number; volley?: boolean; engage?: (g: number, t: number, redAlive: number[]) => boolean} = {}): Sim {
	const R = rnd(seed), T = opts.T ?? 3.0, p = opts.p ?? 0.14, dur = opts.dur ?? 60;
	const groups = Math.max(...units.map((u) => u.group)) + 1;
	const engage = opts.engage ?? (() => true);
	const next = units.map(() => t0 + (opts.volley ? R() * 0.35 : R() * T)), shots: Shot[] = [], alive: number[][] = [];
	let live = units.map((_, i) => i);
	const dt = 1 / FPS; let end = Infinity;
	for (let f = 0; f < dur * FPS; f++) {
		const t = f * dt;
		if (t >= t0 && end === Infinity) {
			const redAlive = Array(groups).fill(0); for (const i of live) if (units[i].side === 1) redAlive[units[i].group]++;
			const blues = live.filter((i) => units[i].side === 0), reds = live.filter((i) => units[i].side === 1 && engage(units[i].group, t, redAlive));
			const killed: number[] = [];
			const fire = (shooters: number[], targets: number[]) => { for (const i of shooters) { if (next[i] > t) continue; next[i] = t + T * (0.75 + 0.5 * R()); if (!targets.length) continue;
				const to = targets[Math.floor(R() * targets.length)], hit = R() < p; shots.push({t: t + R() * dt, from: i, to, hit}); if (hit && units[to].death === Infinity) { units[to].death = t + 0.15; killed.push(to); } } };
			if (reds.length) { fire(blues, reds); fire(reds, blues); }
			if (killed.length) { const k = new Set(killed); live = live.filter((i) => !k.has(i)); }
			if (!live.some((i) => units[i].side === 0) || !live.some((i) => units[i].side === 1)) end = t;
		}
		const a = [0, 0]; for (const i of live) a[units[i].side]++; alive.push(a);
	}
	return {units, shots, alive, t0, end, kind: 'rifle'};
}

/** melee: men fight one-on-one along the line of contact; each duel takes 1.6–3 s and one of the two falls (50/50);
 *  the winner goes back into the queue. Only the front is in contact, so losses come off the front, one for one. */
export function melee(units: Unit[], seed: number, t0: number, dur = 60, front = 25): Sim {
	const R = rnd(seed); const dt = 1 / FPS; const alive: number[][] = [];
	const order = (s: 0 | 1) => units.map((u, i) => ({i, u})).filter((o) => o.u.side === s).sort((a, b) => (s === 0 ? b.u.x - a.u.x : a.u.x - b.u.x)).map((o) => o.i);
	const q: number[][] = [order(0), order(1)];
	let duels: {a: number; b: number; ends: number}[] = []; let end = Infinity;
	for (let f = 0; f < dur * FPS; f++) {
		const t = f * dt;
		if (t >= t0 && end === Infinity) {
			for (const d of duels) if (d.ends <= t) { const loser = R() < 0.5 ? d.a : d.b; units[loser].death = t; const w = loser === d.a ? d.b : d.a; q[units[w].side].unshift(w); }
			duels = duels.filter((d) => d.ends > t);
			while (duels.length < front && q[0].length && q[1].length) { const a = q[0].shift()!, b = q[1].shift()!; duels.push({a, b, ends: t + 1.6 + R() * 1.4}); }
			if (!duels.length && (!q[0].length || !q[1].length)) end = t;
		}
		const a = [0, 0]; for (const u of units) if (u.death > t) a[u.side]++; alive.push(a);
	}
	return {units, shots: [], alive, t0, end, kind: 'melee'};
}

export const aliveAt = (s: Sim, t: number) => s.alive[Math.min(s.alive.length - 1, Math.max(0, Math.round(t * FPS)))];
