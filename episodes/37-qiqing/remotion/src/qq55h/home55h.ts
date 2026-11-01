import {lookAt, proj, Cam, V3, Rz, rho, ZunLight} from './zun55h';
/* ep55 · 何尊 — HOME framing (owner: 「size一直inconsistant」). Every key frame shows the 尊 here, at this size, so every cut
   matches on it: base centre at (HOME_X, HOME_Y), silhouette 560 px from the foot's near edge to the top of the lip / beaks,
   seen 5° from above, a 3/4 view. The view is taken at az ∈ {±30°, ±60°} only: with the four flanges at 0/90/180/270°, those
   four views have the same silhouette (mirror images), so the box is identical (width ≈ 470 px with the beaks) while the
   decoration still turns to the camera differently. */
export const HOME_X = 960, HOME_Y = 880, HOME_H = 560, HOME_EL = 5, HOME_D = 300;
/** the flange-top beak outline (r, z cm), as zun55h draws it */
const BEAK: [number, number][] = [[13.35, 34.9], [13.8, 36.0], [14.05, 37.0], [14.2, 38.0], [14.3, 38.6], [15.2, 38.62], [15.6, 38.98], [16.05, 38.64], [17.5, 38.35], [18.45, 37.75], [18.85, 36.6],
	[18.8, 35.3], [18.55, 34.3], [18.2, 33.75], [17.75, 33.95], [17.75, 35.1], [17.45, 35.95], [16.7, 36.3], [15.8, 36.05], [14.9, 35.6], [14.0, 35.0], [13.4, 34.55]];
/** points on the silhouette's extremes: the lip ring, the base ring, the four beaks */
const SAMPLES: V3[] = (() => { const S: V3[] = [];
	for (let j = 0; j < 96; j++) { const t = (j / 96) * 2 * Math.PI;
		for (const z of [38.8, 38.3, 0, 0.3]) { const [r, n] = Rz(z), k = r * rho(t, n); S.push([k * Math.cos(t), k * Math.sin(t), z]); } }
	for (let q = 0; q < 4; q++) { const t = (q * Math.PI) / 2; for (const [r, z] of BEAK) for (const s of [-0.65, 0.65]) S.push([r * Math.cos(t) - s * Math.sin(t), r * Math.sin(t) + s * Math.cos(t), z]); }
	return S; })();
const camAt = (az: number, el: number, f: number, cx: number, cy: number) => { const a = (az * Math.PI) / 180, e = (el * Math.PI) / 180, T: V3 = [0, 0, 19.4];
	return lookAt([T[0] + HOME_D * Math.cos(e) * Math.cos(a), T[1] + HOME_D * Math.cos(e) * Math.sin(a), T[2] + HOME_D * Math.sin(e)], T, f, cx, cy); };
/** the silhouette box of the model under a camera (screen px) */
export const zunBox = (c: Cam) => { const p = SAMPLES.map((s) => proj(c, s)); const xs = p.map((q) => q[0]), ys = p.map((q) => q[1]);
	return {x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys)}; };
const cache = new Map<string, Cam>();
/** the HOME camera at azimuth az: focal length solved so the box is HOME_H tall, then shifted so the base centre is at HOME */
export const homeCam = (az = 30, el = HOME_EL): Cam => { const key = `${az}_${el}`, hit = cache.get(key); if (hit) return hit;
	let f = (HOME_H * HOME_D) / 38.8;
	for (let i = 0; i < 4; i++) { const b = zunBox(camAt(az, el, f, 0, 0)); f *= HOME_H / (b.y1 - b.y0); }
	const b0 = proj(camAt(az, el, f, 0, 0), [0, 0, 0]), c = camAt(az, el, f, HOME_X - b0[0], HOME_Y - b0[1]);
	cache.set(key, c); return c; };
/** the HOME box (the same for az = ±30 / ±60) */
export const HOME_BOX = zunBox(homeCam(30));
/** a light authored for a camera at az = 0 ([toward camera, screen right, up]) turned to follow a camera at az */
export const rotL = (L: ZunLight, az: number): ZunLight => { const a = (az * Math.PI) / 180, r = (d: V3): V3 => [d[0] * Math.cos(a) - d[1] * Math.sin(a), d[0] * Math.sin(a) + d[1] * Math.cos(a), d[2]];
	return {...L, dir: r(L.dir), rim: L.rim ? {...L.rim, dir: r(L.rim.dir)} : undefined}; };
