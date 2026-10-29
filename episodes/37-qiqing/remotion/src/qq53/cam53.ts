/* ep53 · camera helpers for the one take: C1 cubic Hermite channels (monotone Fritsch–Carlson slopes unless a slope is
   given), smoothstep blends between two parametrisations of the same camera (position + velocity stay continuous). */
export type HK = [number, number, number?];   // [t, value, slope?]
export const spline = (K: HK[]) => {
	const n = K.length, d = (i: number) => (K[i + 1][1] - K[i][1]) / (K[i + 1][0] - K[i][0]);
	const m = K.map((k, i) => { if (k[2] !== undefined) return k[2];
		if (n === 1) return 0;
		if (i === 0) return d(0);
		if (i === n - 1) return d(n - 2);
		const a = d(i - 1), b = d(i); if (a * b <= 0) return 0;
		const h0 = K[i][0] - K[i - 1][0], h1 = K[i + 1][0] - K[i][0], w1 = 2 * h1 + h0, w2 = h1 + 2 * h0;
		return (w1 + w2) / (w1 / a + w2 / b); });
	return (t: number) => {
		if (t <= K[0][0]) return K[0][1] + m[0] * (t - K[0][0]);
		if (t >= K[n - 1][0]) return K[n - 1][1] + m[n - 1] * (t - K[n - 1][0]);
		let i = 0; while (K[i + 1][0] < t) i++;
		const t0 = K[i][0], h = K[i + 1][0] - t0, u = (t - t0) / h, u2 = u * u, u3 = u2 * u;
		return (2 * u3 - 3 * u2 + 1) * K[i][1] + (u3 - 2 * u2 + u) * m[i] * h + (-2 * u3 + 3 * u2) * K[i + 1][1] + (u3 - u2) * m[i + 1] * h; };
};
export const sstep = (u: number) => { const x = Math.max(0, Math.min(1, u)); return x * x * (3 - 2 * x); };
/** smootherstep (C2) */
export const sstep5 = (u: number) => { const x = Math.max(0, Math.min(1, u)); return x * x * x * (x * (6 * x - 15) + 10); };
export const DEG = Math.PI / 180;
