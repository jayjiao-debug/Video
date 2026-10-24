import React from 'react';
/* Voyager — a small 3D model drawn as shaded SVG polygons (owner note 11: "the satellite is too cheap looking").
   Geometry in metres, from the JPL description: 3.66 m high-gain dish over a decagonal bus 1.78 m across and 0.47 m deep;
   Cassegrain subreflector on struts; science boom with the scan platform (two cameras, IRIS, UVS, PPS) on +X;
   RTG boom with three finned RTGs on -X; 13 m magnetometer astromast; two 10 m radio-astronomy whips;
   the Golden Record on the outside of the bus. Dish points +Z (to Earth). Painter's algorithm by depth. */
type V = [number, number, number];
type Prim = {z: number; el: React.ReactElement};
const sub = (a: V, b: V): V => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const crs = (a: V, b: V): V => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const nrm = (a: V): V => { const l = Math.hypot(...a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
const dot = (a: V, b: V) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const hex = (h: string) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const shade = (h: string, k: number, spec = 0) => { const c = hex(h); return `rgb(${c.map((v) => Math.round(Math.min(255, v * k + 255 * spec))).join(',')})`; };

export const Voyager: React.FC<{x: number; y: number; s: number; yaw: number; pitch: number; roll?: number; light?: V; mag?: number; glint?: number; recordGlow?: number}> = ({x, y, s, yaw, pitch, roll = 0, light = [-0.5, 0.45, 0.75], mag = 1, glint = 0, recordGlow = 0}) => {
	const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch), cr = Math.cos(roll), sr = Math.sin(roll);
	const R = (v: V): V => { let [a, b, c] = v; [a, b] = [a * cr - b * sr, a * sr + b * cr]; [a, c] = [a * cy + c * sy, -a * sy + c * cy]; [b, c] = [b * cp - c * sp, b * sp + c * cp]; return [a, b, c]; };
	const L = nrm(light);
	const P = (v: V): [number, number, number] => { const r = R(v); return [x + r[0] * s, y - r[1] * s, r[2]]; };
	const prims: Prim[] = [];
	const poly = (pts: V[], col: string, opt: {spec?: number; amb?: number; stroke?: string; two?: boolean; op?: number} = {}) => {
		const rp = pts.map(R), n = nrm(crs(sub(rp[1], rp[0]), sub(rp[2], rp[0])));
		let nl = dot(n, L); if (n[2] < 0) { if (!opt.two) return; nl = -nl; }
		const k = (opt.amb ?? 0.32) + 0.75 * Math.max(0, nl), sp2 = (opt.spec ?? 0) * Math.max(0, nl) ** 12;
		const sc = pts.map(P), z = sc.reduce((a, p) => a + p[2], 0) / sc.length;
		prims.push({z, el: <path d={'M' + sc.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' L') + ' Z'} fill={shade(col, k, sp2)} stroke={opt.stroke ?? shade(col, k * 0.9, sp2)} strokeWidth={0.6} opacity={opt.op} />});
	};
	const line = (a: V, b: V, w: number, col: string, z0 = 0) => { const A = P(a), B = P(b); prims.push({z: (A[2] + B[2]) / 2 + z0, el: <line x1={A[0]} y1={A[1]} x2={B[0]} y2={B[1]} stroke={col} strokeWidth={Math.max(0.7, w * s)} strokeLinecap="round" />}); };
	const cyl = (a: V, b: V, r: number, col: string, n = 12, fins = 0, spec = 0.2) => {   // a cylinder between a and b
		const ax = nrm(sub(b, a)), up: V = Math.abs(ax[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0], u = nrm(crs(ax, up)), w = crs(ax, u);
		const ring = (c: V, rr: number, i: number): V => { const t = (i / n) * Math.PI * 2; return [c[0] + (u[0] * Math.cos(t) + w[0] * Math.sin(t)) * rr, c[1] + (u[1] * Math.cos(t) + w[1] * Math.sin(t)) * rr, c[2] + (u[2] * Math.cos(t) + w[2] * Math.sin(t)) * rr]; };
		for (let i = 0; i < n; i++) poly([ring(a, r, i), ring(a, r, i + 1), ring(b, r, i + 1), ring(b, r, i)], col, {spec});
		poly(Array.from({length: n}, (_, i) => ring(b, r, i)), col, {spec}); poly(Array.from({length: n}, (_, i) => ring(a, r, n - i)), col, {spec});
		for (let f = 0; f < fins; f++) { const t = (f / fins) * Math.PI * 2, d: V = [u[0] * Math.cos(t) + w[0] * Math.sin(t), u[1] * Math.cos(t) + w[1] * Math.sin(t), u[2] * Math.cos(t) + w[2] * Math.sin(t)];
			const q = (c: V, rr: number): V => [c[0] + d[0] * rr, c[1] + d[1] * rr, c[2] + d[2] * rr]; poly([q(a, r), q(b, r), q(b, r * 1.75), q(a, r * 1.75)], col, {two: true, amb: 0.4}); }
	};
	const box = (c: V, h: V, col: string, spec = 0.1) => { const [X, Y, Z] = c, [a, b, d] = h, v = (i: number, j: number, k: number): V => [X + i * a, Y + j * b, Z + k * d];
		poly([v(-1, -1, 1), v(1, -1, 1), v(1, 1, 1), v(-1, 1, 1)], col, {spec}); poly([v(1, -1, -1), v(-1, -1, -1), v(-1, 1, -1), v(1, 1, -1)], col, {spec});
		poly([v(1, -1, 1), v(1, -1, -1), v(1, 1, -1), v(1, 1, 1)], col, {spec}); poly([v(-1, -1, -1), v(-1, -1, 1), v(-1, 1, 1), v(-1, 1, -1)], col, {spec});
		poly([v(-1, 1, 1), v(1, 1, 1), v(1, 1, -1), v(-1, 1, -1)], col, {spec}); poly([v(-1, -1, -1), v(1, -1, -1), v(1, -1, 1), v(-1, -1, 1)], col, {spec}); };
	const truss = (a: V, b: V, w: number, col: string, seg: number) => {   // a lattice boom: two rails and zigzag
		const ax = sub(b, a), side = nrm(crs(ax, [0, 0, 1])), o: V = [side[0] * w, side[1] * w, side[2] * w];
		const at = (t: number, sgn: number): V => [a[0] + ax[0] * t + o[0] * sgn, a[1] + ax[1] * t + o[1] * sgn, a[2] + ax[2] * t + o[2] * sgn];
		line(at(0, 1), at(1, 1), 0.025, col); line(at(0, -1), at(1, -1), 0.025, col);
		for (let i = 0; i < seg; i++) line(at(i / seg, i % 2 ? 1 : -1), at((i + 1) / seg, i % 2 ? -1 : 1), 0.014, col);
	};
	// --- bus: decagonal prism, alternating gold foil and black blanket bays
	const BR = 0.9, BZ = 0.235, deca = (z: number, i: number): V => { const t = (i / 10) * Math.PI * 2 + Math.PI / 10; return [Math.cos(t) * BR, Math.sin(t) * BR, z]; };
	for (let i = 0; i < 10; i++) poly([deca(-BZ, i), deca(-BZ, i + 1), deca(BZ, i + 1), deca(BZ, i)], i % 3 === 1 ? '#151517' : '#c9a24a', {spec: i % 3 === 1 ? 0.1 : 0.55, amb: 0.36});
	poly(Array.from({length: 10}, (_, i) => deca(-BZ, 9 - i)), '#2a2622', {amb: 0.4});
	// golden record on bay 7 (faces -X,-Y): a disc in the bay's plane
	{ const a0 = deca(0, 7), a1 = deca(0, 8), c: V = [(a0[0] + a1[0]) / 2 * 1.005, (a0[1] + a1[1]) / 2 * 1.005, 0], e = nrm(sub(a1, a0)), zz: V = [0, 0, 1];
		const disc = (r: number): V[] => Array.from({length: 28}, (_, i) => { const t = (i / 28) * Math.PI * 2; return [c[0] + (e[0] * Math.cos(t)) * r, c[1] + (e[1] * Math.cos(t)) * r, c[2] + zz[2] * Math.sin(t) * r]; });
		poly(disc(0.19), '#e8c06a', {spec: 0.9 + glint, amb: 0.55 + recordGlow, two: true});
		const C = P(c); prims.push({z: C[2] + 0.001, el: <circle cx={C[0]} cy={C[1]} r={0.02 * s} fill="#6b4a1a" />});
		if (recordGlow > 0) prims.push({z: C[2] + 0.002, el: <circle cx={C[0]} cy={C[1]} r={0.5 * s} fill="url(#vgRecGlow)" opacity={recordGlow} />}); }
	// --- high-gain dish: paraboloid shell, ribs, subreflector on struts, low-gain horn
	const D0 = 0.3, DR = 1.83, DEP = 0.42, dish = (r: number, t: number): V => [Math.cos(t) * r, Math.sin(t) * r, D0 + DEP * (r / DR) ** 2];
	const NR = 5, NT = 30;
	for (let i = 0; i < NR; i++) for (let j = 0; j < NT; j++) {
		const r0 = (i / NR) * DR, r1 = ((i + 1) / NR) * DR, t0 = (j / NT) * Math.PI * 2, t1 = ((j + 1) / NT) * Math.PI * 2;
		poly([dish(r0, t0), dish(r0, t1), dish(r1, t1), dish(r1, t0)].reverse(), '#e9e6dd', {two: true, amb: 0.42, spec: 0.08});
	}
	for (let j = 0; j < 12; j++) { const t = (j / 12) * Math.PI * 2; for (let i = 0; i < 4; i++) line(dish((i / 4) * DR + 0.05, t), dish(((i + 1) / 4) * DR, t), 0.008, 'rgba(120,120,125,0.55)', 0.002); }
	const rimPts = Array.from({length: 49}, (_, j) => dish(DR, (j / 48) * Math.PI * 2));
	for (let j = 0; j < 48; j++) line(rimPts[j], rimPts[j + 1], 0.03, '#cfcac0', 0.001);
	const F: V = [0, 0, D0 + 1.05];
	for (let k = 0; k < 4; k++) { const t = (k / 4) * Math.PI * 2 + Math.PI / 4; line(dish(1.15, t), F, 0.028, '#d8d4ca'); }
	cyl([0, 0, F[2] - 0.05], [0, 0, F[2] + 0.06], 0.26, '#e4e0d6', 20, 0, 0.3);
	cyl([0, 0, F[2] + 0.06], [0, 0, F[2] + 0.2], 0.06, '#bdb8ad', 10);
	cyl([0, 0, D0 - 0.05], [0, 0, D0 + 0.18], 0.1, '#8d8a84', 10);
	// --- science boom (+X) with plasma instrument and scan platform
	truss([BR * 0.95, 0.05, -0.05], [3.0, 0.25, -0.05], 0.07, '#bfbcb5', 12);
	box([1.6, 0.13, 0.05], [0.16, 0.12, 0.14], '#2b2a2c', 0.2);                   // PLS
	cyl([1.62, 0.15, 0.2], [1.62, 0.15, 0.42], 0.09, '#cfcbc2', 12);
	box([2.25, 0.2, -0.05], [0.12, 0.1, 0.1], '#c79f45', 0.6);                    // CRS / LECP
	box([3.05, 0.25, -0.05], [0.18, 0.22, 0.2], '#1d1c1e', 0.25);                  // scan platform
	cyl([3.0, 0.32, 0.12], [3.0, 0.32, 0.72], 0.085, '#d9d5cc', 14, 0, 0.35);      // narrow-angle camera
	cyl([3.18, 0.32, 0.12], [3.18, 0.32, 0.44], 0.065, '#d9d5cc', 12, 0, 0.35);    // wide-angle camera
	cyl([3.05, 0.05, 0.1], [3.05, 0.05, 0.42], 0.22, '#c9c4b9', 18, 0, 0.3);       // IRIS
	cyl([3.25, 0.02, 0.1], [3.25, 0.02, 0.36], 0.05, '#a8a39a', 8);                // UVS / PPS
	// --- RTG boom (-X, a little down) with three finned RTGs
	truss([-BR * 0.95, -0.1, -0.08], [-2.9, -0.55, -0.08], 0.06, '#bfbcb5', 10);
	for (let k = 0; k < 3; k++) { const t0 = 0.42 + k * 0.2, A: V = [-0.9 - 2.0 * t0, -0.1 - 0.45 * t0, -0.08], B: V = [-0.9 - 2.0 * (t0 + 0.16), -0.1 - 0.45 * (t0 + 0.16), -0.08]; cyl(A, B, 0.15, '#3b3936', 14, 6, 0.15); }
	// --- magnetometer astromast (13 m) and the radio-astronomy whips (10 m)
	{ const a: V = [-0.4, BR * 0.9, -0.1], d = nrm([-0.45, 1, -0.25]); const b: V = [a[0] + d[0] * 13 * mag, a[1] + d[1] * 13 * mag, a[2] + d[2] * 13 * mag];
		truss(a, b, 0.05, '#cfcbc2', 60); const m1: V = [a[0] + d[0] * 6.5 * mag, a[1] + d[1] * 6.5 * mag, a[2] + d[2] * 6.5 * mag]; box(m1, [0.07, 0.07, 0.07], '#d6d2c8'); box(b, [0.08, 0.08, 0.08], '#d6d2c8'); }
	for (const sgn of [1, -1]) { const a: V = [0.3, -BR * 0.95, -0.2], d = nrm([0.55 * sgn + 0.25, -1, -0.15]); line(a, [a[0] + d[0] * 10 * mag, a[1] + d[1] * 10 * mag, a[2] + d[2] * 10 * mag], 0.018, '#d9d5cc'); }
	prims.sort((a, b) => a.z - b.z);
	return <g>
		<defs><radialGradient id="vgRecGlow"><stop offset="0" stopColor="#ffd98a" stopOpacity="0.9" /><stop offset="1" stopColor="#ffd98a" stopOpacity="0" /></radialGradient></defs>
		{prims.map((p, i) => React.cloneElement(p.el, {key: i}))}
	</g>;
};

/** the cover of the Golden Record (NASA, public domain): pulsar map, hydrogen hyperfine diagram, stylus instructions */
export const RecordCover: React.FC<{x: number; y: number; r: number; t?: number; glow?: number}> = ({x, y, r, t = 0, glow = 0}) => {
	const pulsar = [[0.0, 0.62], [0.35, 0.45], [0.8, 0.55], [1.25, 0.3], [1.9, 0.6], [2.4, 0.5], [2.9, 0.4], [3.3, 0.66], [3.8, 0.35], [4.3, 0.58], [4.9, 0.48], [5.4, 0.62], [5.9, 0.38], [6.1, 0.9]];
	const g = '#3b2a0e';
	return <g>
		<defs><radialGradient id="rcG" cx="0.38" cy="0.32"><stop offset="0" stopColor="#fff1c4" /><stop offset="0.35" stopColor="#e2b85e" /><stop offset="0.8" stopColor="#a8792e" /><stop offset="1" stopColor="#6e4c1a" /></radialGradient>
			<radialGradient id="rcGlow"><stop offset="0" stopColor="#ffd98a" stopOpacity="0.55" /><stop offset="1" stopColor="#ffd98a" stopOpacity="0" /></radialGradient></defs>
		{glow > 0 && <circle cx={x} cy={y} r={r * 2.2} fill="url(#rcGlow)" opacity={glow} />}
		<circle cx={x} cy={y} r={r} fill="url(#rcG)" stroke="#5a3d12" strokeWidth={r * 0.012} />
		<circle cx={x} cy={y} r={r * 0.97} fill="none" stroke="#fff3cf" strokeOpacity={0.35} strokeWidth={r * 0.006} />
		{/* pulsar map, lower left */}
		<g transform={`translate(${x - r * 0.36},${y + r * 0.28})`} stroke={g} strokeWidth={r * 0.005}>
			{pulsar.map(([a, l], i) => <line key={i} x1={0} y1={0} x2={Math.cos(a) * l * r * 0.42} y2={Math.sin(a) * l * r * 0.42} />)}
			<line x1={0} y1={0} x2={r * 0.5} y2={0} /><circle r={r * 0.012} fill={g} />
		</g>
		{/* hydrogen atom, bottom right */}
		<g transform={`translate(${x + r * 0.42},${y + r * 0.52})`} fill="none" stroke={g} strokeWidth={r * 0.005}>
			<circle cx={-r * 0.09} r={r * 0.045} /><circle cx={r * 0.09} r={r * 0.045} /><circle cx={-r * 0.09} r={r * 0.01} fill={g} /><circle cx={r * 0.09} r={r * 0.01} fill={g} />
			<line x1={-r * 0.09} y1={-r * 0.07} x2={r * 0.09} y2={-r * 0.07} />
		</g>
		{/* the record seen from above and from the side, with the stylus */}
		<g transform={`translate(${x - r * 0.42},${y - r * 0.4})`} fill="none" stroke={g} strokeWidth={r * 0.005}>
			<circle r={r * 0.2} /><circle r={r * 0.05} /><path d={`M${r * 0.02},${-r * 0.22} L${r * 0.17},${-r * 0.06}`} />
			<path d={`M${-r * 0.2},${r * 0.3} h${r * 0.4} M${-r * 0.2},${r * 0.33} h${r * 0.4}`} />
		</g>
		<g transform={`translate(${x + r * 0.38},${y - r * 0.4})`} fill="none" stroke={g} strokeWidth={r * 0.005}>
			<path d={Array.from({length: 4}, (_, i) => `M${-r * 0.2},${(i - 1.5) * r * 0.07} q${r * 0.05},${-r * 0.05} ${r * 0.1},0 t${r * 0.1},0 t${r * 0.1},0 t${r * 0.1},0`).join(' ')} />
			<rect x={-r * 0.18} y={r * 0.16} width={r * 0.36} height={r * 0.12} />
		</g>
		{/* moving glint */}
		<ellipse cx={x + Math.cos(t * 0.7) * r * 0.45} cy={y - r * 0.35} rx={r * 0.5} ry={r * 0.08} fill="#fff8e0" opacity={0.18} transform={`rotate(${-30 + 12 * Math.sin(t * 0.4)} ${x} ${y})`} />
	</g>;
};
/** screen position (and depth sign) of the Golden Record's centre for a Voyager drawn with these parameters */
export const voyRecordPos = (x: number, y: number, s: number, yaw: number, pitch: number, roll = 0): [number, number, number] => {
	const BR = 0.9, d = (i: number) => { const t = (i / 10) * Math.PI * 2 + Math.PI / 10; return [Math.cos(t) * BR, Math.sin(t) * BR]; };
	const a = d(7), b = d(8); let [px, py, pz] = [(a[0] + b[0]) / 2 * 1.005, (a[1] + b[1]) / 2 * 1.005, 0];
	const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch), cr = Math.cos(roll), sr = Math.sin(roll);
	[px, py] = [px * cr - py * sr, px * sr + py * cr]; [px, pz] = [px * cy + pz * sy, -px * sy + pz * cy]; [py, pz] = [py * cp - pz * sp, py * sp + pz * cp];
	return [x + px * s, y - py * s, pz];
};
