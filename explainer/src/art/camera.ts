import {lookAt, type Cam} from './sets/Airfield';

/**
 * A velocity-continuous camera path: keys [frame, tx, ty, zoom] on the hero plane,
 * Catmull-Rom through x, y and log-zoom, so moves flow into each other instead of
 * stopping and starting (same maths as episodes/benford's camPath, shared here).
 */
export type CamKey = [number, number, number, number];

export const camPath = (keys: CamKey[], f: number): Cam => {
	const n = keys.length;
	const val = (k: CamKey, c: number) => (c === 3 ? Math.log(k[3]) : k[c]);
	if (f <= keys[0][0]) return lookAt(keys[0][1], keys[0][2], keys[0][3]);
	if (f >= keys[n - 1][0]) return lookAt(keys[n - 1][1], keys[n - 1][2], keys[n - 1][3]);
	let i = 0;
	while (i < n - 2 && f >= keys[i + 1][0]) i++;
	const p0 = keys[Math.max(0, i - 1)];
	const p1 = keys[i];
	const p2 = keys[i + 1];
	const p3 = keys[Math.min(n - 1, i + 2)];
	const dt = p2[0] - p1[0];
	const t = (f - p1[0]) / dt;
	const out = [0, 0, 0, 0];
	for (let c = 1; c <= 3; c++) {
		const m1 = p0 === p1 ? 0 : ((val(p2, c) - val(p0, c)) / (p2[0] - p0[0])) * dt;
		const m2 = p3 === p2 ? 0 : ((val(p3, c) - val(p1, c)) / (p3[0] - p1[0])) * dt;
		const t2 = t * t;
		const t3 = t2 * t;
		out[c] = (2 * t3 - 3 * t2 + 1) * val(p1, c) + (t3 - 2 * t2 + t) * m1 + (-2 * t3 + 3 * t2) * val(p2, c) + (t3 - t2) * m2;
	}
	return lookAt(out[1], out[2], Math.exp(out[3]));
};

/** screen-space speed of the camera (px/frame), for motion blur on whips */
export const camSpeed = (keys: CamKey[], f: number): number => {
	const a = camPath(keys, f - 1);
	const b = camPath(keys, f + 1);
	const z = (a.zoom + b.zoom) / 2;
	const dx = (b.x / b.zoom - a.x / a.zoom) * z * 0.5;
	const dy = (b.y / b.zoom - a.y / a.zoom) * z * 0.5;
	return Math.hypot(dx, dy) + Math.abs(Math.log(b.zoom / a.zoom)) * 120;
};
