import React, {useMemo} from 'react';
import * as THREE from 'three';
import {useThree} from '@react-three/fiber';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import {OUT, INN, Rz, rho, ZT, SQ, FLOOR_Z, PLATES, FL, HORN_SPINE, BELLY_EYE, FLOOR_HALF, Look, Maps, bodyHeight, sampleH, bodyMaps, flangeMaps, tileMaps, floorMaps, fbm, vn, cl, lerp} from './tex55h';
/* ep55 · 何尊 — a real 3D PBR model (three.js through @remotion/three). World: y up, cm, the base centre at the origin;
   the four flanges at θ = 0 (+z, "front"), 90° (+x), 180°, 270°; a point at angle θ is (r·sinθ, y, r·cosθ).
   - body: a lofted superellipse (round mouth → rounded-square belly and foot), 512 × 440 vertices, displaced on the CPU by the
     painted height map (relief up to ≈ 0.85 cm); shading detail from the normal map (雷纹, incisions), cavity AO, PBR maps
   - flanges: extruded, bevelled plates from the photo-traced outlines, with their openwork holes
   - horns: swept tubes (ram's-horn crescents whose ends lift off the surface); eyes: lathed balls
   - inside: the inner wall, and the floor with the 122-character inscription (中 / 或 can glow), a soil crust that clears by alphaTest
   Looks: clean (museum), dirty (1963–65), molten (the casting), reveal (1975, the floor being cleaned). */

const D2R = Math.PI / 180;
type V3 = THREE.Vector3;
/** base (undisplaced) outer surface point and normal */
export const surfP = (th: number, z: number): V3 => { const [r, n] = Rz(z), k = r * rho(th, n); return new THREE.Vector3(k * Math.sin(th), z, k * Math.cos(th)); };
export const surfN = (th: number, z: number): V3 => { const e = 0.003, ez = 0.04;
	const a = surfP(th + e, z).sub(surfP(th - e, z)), b = surfP(th, z + ez).sub(surfP(th, z - ez)); return a.cross(b).normalize(); };
/** half-face s (cm at R_REF) → angle; face = 0 (front) or π (back); side ±1 */
export const sTh = (s: number, face = 0, side = 1) => face + side * (s / SQ) * (Math.PI / 2);
const foldU = (th: number) => { let q = ((th / D2R) % 180 + 180) % 180; return q <= 90 ? q / 90 : (180 - q) / 90; };

/* ============================== profile resampling ============================== */
const resample = (P: [number, number, number][], N: number): [number, number, number][] => {
	const L = [0]; for (let i = 1; i < P.length; i++) L.push(L[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]));
	const T = L[L.length - 1], out: [number, number, number][] = []; let i = 0;
	for (let k = 0; k <= N; k++) { const t = (k / N) * T; while (i < P.length - 2 && L[i + 1] < t) i++;
		const u = (t - L[i]) / (L[i + 1] - L[i] || 1), p0 = P[Math.max(0, i - 1)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(P.length - 1, i + 2)];
		const cr = (a: number, b: number, c: number, d: number) => 0.5 * (2 * b + (-a + c) * u + (2 * a - 5 * b + 4 * c - d) * u * u + (-a + 3 * b - 3 * c + d) * u * u * u);
		out.push([cr(p0[0], p1[0], p2[0], p3[0]), cr(p0[1], p1[1], p2[1], p3[1]), lerp(p1[2], p2[2], u)]); }
	return out; };

/* ============================== geometry ============================== */
type Geo = THREE.BufferGeometry;
const lofted = (prof: [number, number, number][], NT: number, inward: boolean, uvf: (th: number, z: number, k: number) => [number, number], disp?: (u: number, v: number) => number, vcol?: (th: number, z: number) => [number, number, number]): Geo => {
	const NZ = prof.length, pos = new Float32Array(NZ * (NT + 1) * 3), nor = new Float32Array(pos.length), uv = new Float32Array(NZ * (NT + 1) * 2), col = vcol ? new Float32Array(pos.length) : null;
	const P = (i: number, j: number) => { const [r, z, n] = prof[i], th = (j / NT) * 2 * Math.PI, k = r * rho(th, n); return [k * Math.sin(th), z, k * Math.cos(th)]; };
	let arc = 0;
	for (let i = 0; i < NZ; i++) { if (i > 0) arc += Math.hypot(prof[i][0] - prof[i - 1][0], prof[i][1] - prof[i - 1][1]);
		for (let j = 0; j <= NT; j++) { const q = (i * (NT + 1) + j), th = (j / NT) * 2 * Math.PI, p = P(i, j);
			const a = P(i, (j + 1) % NT), b = P(i, (j - 1 + NT) % NT), c = P(Math.min(NZ - 1, i + 1), j), d = P(Math.max(0, i - 1), j);
			const t1 = new THREE.Vector3(a[0] - b[0], a[1] - b[1], a[2] - b[2]), t2 = new THREE.Vector3(c[0] - d[0], c[1] - d[1], c[2] - d[2]);
			const N = t1.cross(t2).normalize(); if (inward) N.negate();
			const [u, v] = uvf(th, prof[i][1], arc); uv[q * 2] = u; uv[q * 2 + 1] = v;
			const h = disp ? disp(u, v) : 0;
			pos[q * 3] = p[0] + N.x * h; pos[q * 3 + 1] = p[1] + N.y * h; pos[q * 3 + 2] = p[2] + N.z * h;
			nor[q * 3] = N.x; nor[q * 3 + 1] = N.y; nor[q * 3 + 2] = N.z;
			if (col && vcol) { const c3 = vcol(th, prof[i][1]); col[q * 3] = c3[0]; col[q * 3 + 1] = c3[1]; col[q * 3 + 2] = c3[2]; } } }
	const idx: number[] = [];
	for (let i = 0; i < NZ - 1; i++) for (let j = 0; j < NT; j++) { const a = i * (NT + 1) + j, b = a + 1, c = a + NT + 1, d = c + 1;
		if (inward) idx.push(a, d, b, a, c, d); else idx.push(a, b, d, a, d, c); }
	const g = new THREE.BufferGeometry();
	g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
	if (col) g.setAttribute('color', new THREE.BufferAttribute(col, 3));
	g.setIndex(idx); return g; };

/** the floor: a superellipse disc (polar grid), uv in the inscription frame (text up = toward az 225°, the KF3 camera at az 45°) */
export const INSCR_AZ = 45 * D2R;
const floorGeo = (y: number, R: number, n: number): Geo => { const NR = 40, NT = 256, pos: number[] = [], uv: number[] = [], nor: number[] = [], idx: number[] = [];
	const Ux = -Math.sin(INSCR_AZ), Uz = -Math.cos(INSCR_AZ), Rx = Math.cos(INSCR_AZ), Rzz = -Math.sin(INSCR_AZ);
	for (let i = 0; i <= NR; i++) for (let j = 0; j <= NT; j++) { const t = i / NR, th = (j / NT) * 2 * Math.PI, k = R * t * rho(th, n), x = k * Math.sin(th), z = k * Math.cos(th);
		pos.push(x, y, z); nor.push(0, 1, 0); const a = x * Rx + z * Rzz, b = -(x * Ux + z * Uz); uv.push(a / (2 * FLOOR_HALF) + 0.5, b / (2 * FLOOR_HALF) + 0.5); }
	for (let i = 0; i < NR; i++) for (let j = 0; j < NT; j++) { const a = i * (NT + 1) + j, b = a + 1, c = a + NT + 1, d = c + 1; idx.push(a, d, b, a, c, d); }
	const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
	g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); return g; };

/** a swept horn along HORN_SPINE on one half-face */
const hornGeo = (face: number, side: number): Geo => {
	const S = HORN_SPINE, M = 90, K = 28, pos: number[] = [], uv: number[] = [], idx: number[] = [], col: number[] = [];
	const at = (t: number) => { const k = t * (S.length - 1), i = Math.min(S.length - 2, Math.floor(k)), u = k - i, g = (j: number) => S[Math.max(0, Math.min(S.length - 1, j))];
		return [0, 1, 2, 3, 4].map((c) => { const a = g(i - 1)[c], b = g(i)[c], cc = g(i + 1)[c], d = g(i + 2)[c]; return 0.5 * (2 * b + (-a + cc) * u + (2 * a - 5 * b + 4 * cc - d) * u * u + (-a + 3 * b - 3 * cc + d) * u * u * u); }); };
	const C: V3[] = [], Ns: V3[] = [], W: number[] = [], T: number[] = [];
	for (let m = 0; m <= M; m++) { const [s, z, lift, w, t] = at(m / M), th = sTh(s, face, side), N = surfN(th, z);
		C.push(surfP(th, z).addScaledVector(N, lift + 0.12)); Ns.push(N); W.push(w); T.push(t); }
	let len = 0;
	for (let m = 0; m <= M; m++) { const tg = C[Math.min(M, m + 1)].clone().sub(C[Math.max(0, m - 1)]).normalize(); if (m > 0) len += C[m].distanceTo(C[m - 1]);
		const sd = new THREE.Vector3().crossVectors(tg, Ns[m]).normalize(), up = new THREE.Vector3().crossVectors(sd, tg).normalize();
		const taper = m === M ? 0.05 : 1;
		for (let k = 0; k <= K; k++) { const ph = -Math.PI / 2 + (k / K) * 2 * Math.PI, c = Math.cos(ph), s = Math.sin(ph);
			const cs = Math.sign(c) * Math.pow(Math.abs(c), 0.6), ss = Math.sign(s) * Math.pow(Math.abs(s), 0.55);
			const groove = 1 - 0.09 * (Math.exp(-(((ph - 1.12) / 0.13) ** 2)) + Math.exp(-(((ph - 2.02) / 0.13) ** 2)));
			const perim = 1.57 * (W[m] + T[m]) * taper;
			const p = C[m].clone().addScaledVector(sd, (W[m] / 2) * cs * groove * taper).addScaledVector(up, (T[m] / 2) * ss * groove * taper);
			pos.push(p.x, p.y, p.z); uv.push(len / 2.5, (k / K) * perim / 2.5);
			/* patina: the underside (toward the body) dark and green, worn light along the top, blotches along the length */
			const top = 0.5 + 0.5 * s, n1 = fbm(len * 0.6 + face, k * 0.3 + side, 91), g = cl(0.75 - top * 1.1 + (n1 - 0.5) * 0.9);
			const br = (0.5 + 0.62 * top) * (0.85 + 0.3 * n1);
			col.push(br * lerp(1, 0.62, g), br * lerp(1, 0.86, g), br * lerp(1, 0.74, g)); } }
	for (let m = 0; m < M; m++) for (let k = 0; k < K; k++) { const a = m * (K + 1) + k, b = a + 1, c = a + K + 1, d = c + 1; idx.push(a, b, d, a, d, c); }
	/* a cap at the root */
	const c0 = pos.length / 3; pos.push(C[0].x, C[0].y, C[0].z); uv.push(0, 0.5); col.push(0.4, 0.42, 0.38); for (let k = 0; k < K; k++) idx.push(c0, k + 1, k);
	const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
	g.setIndex(idx); g.computeVertexNormals(); return g; };

/** a ball eye with a small pupil dimple (lathe, axis +y) */
const eyeGeo = (R: number, h: number): Geo => { const pts: THREE.Vector2[] = [];
	for (let i = 0; i <= 24; i++) { const t = i / 24, a = t * Math.PI / 2, r = R * Math.sin(a); let y = -0.3 + (h + 0.3) * Math.cos(a);
		if (r < 0.26) y -= 0.07 * (1 - (r / 0.26) ** 2) ** 2; pts.push(new THREE.Vector2(Math.max(0.0001, r), y)); }
	pts.push(new THREE.Vector2(R * 0.98, -0.5));
	const g = new THREE.LatheGeometry(pts, 48); g.computeVertexNormals(); return g; };

/* ============================== assets (built once) ============================== */
export type ZunGeo = {outer: Geo; inner: Geo; floor: Geo; soil: Geo; under: Geo; plates: {g: Geo; key: string}[]; horns: Geo[]; eyes: {g: Geo; m: THREE.Matrix4}[]};
let GEO: ZunGeo | null = null;
export const zunGeo = (): ZunGeo => { if (GEO) return GEO; const t0 = performance.now();
	bodyHeight();
	/* outer: base → lip, then across the lip top to the inner edge */
	const prof = resample(OUT, 440);
	const vcol = (th: number, z: number): [number, number, number] => { const s = th * 9.2, b = fbm(s * 0.18, z * 0.18, 77), f = vn(s * 0.9, z * 0.9, 78);
		const g = cl((b - 0.42) * 2.2); return [lerp(1.04, 0.82, g) * (0.93 + 0.12 * f), lerp(1.0, 1.02, g) * (0.93 + 0.12 * f), lerp(0.96, 0.9, g) * (0.93 + 0.12 * f)]; };
	const outer = lofted(prof, 512, false, (th, z) => [foldU(th), (ZT - z) / ZT], (u, v) => sampleH(u, v), vcol);
	const innerProf = resample([[14.12, 38.8, 2], ...INN], 150);
	/* the inner profile runs downward, so the 'outward' construction already faces the axis */
	const inner = lofted(innerProf, 256, false, (th, _z, arc) => [(th / (2 * Math.PI)) * 16, arc / 4]);
	const floor = floorGeo(FLOOR_Z + 0.001, 6.55, 2.75), soil = floorGeo(FLOOR_Z + 0.05, 6.55, 2.75);
	const under = floorGeo(0.02, OUT[0][0], OUT[0][2]); under.rotateX(Math.PI); under.translate(0, 0.04, 0);
	const plates = PLATES.map((pl) => { const sh = new THREE.Shape(pl.out.map(([r, z]) => new THREE.Vector2(r, z)));
		pl.holes.forEach((h) => sh.holes.push(new THREE.Path(h.map(([r, z]) => new THREE.Vector2(r, z)))));
		const g = new THREE.ExtrudeGeometry(sh, {depth: pl.th, bevelEnabled: true, bevelThickness: 0.1, bevelSize: 0.07, bevelSegments: 2, curveSegments: 2, steps: 1});
		g.translate(0, 0, -pl.th / 2); g.computeVertexNormals();
		/* caps keep uv = (r, z) cm; the side walls get (r + depth, z + depth) so their texture coordinates never degenerate */
		const P = g.getAttribute('position'), U = g.getAttribute('uv'), side = g.groups[1];
		for (let i = side.start; i < side.start + side.count; i++) { const vi = g.index ? g.index.getX(i) : i; U.setXY(vi, P.getX(vi) + P.getZ(vi) * 0.8, P.getY(vi) + P.getZ(vi) * 0.6); }
		U.needsUpdate = true; return {g, key: pl.key}; });
	const horns = [0, Math.PI].flatMap((f) => [1, -1].map((sd) => hornGeo(f, sd)));
	const eg = eyeGeo(BELLY_EYE.r, BELLY_EYE.lift);
	const eyes = [0, Math.PI].flatMap((f) => [1, -1].map((sd) => { const th = sTh(BELLY_EYE.s, f, sd), N = surfN(th, BELLY_EYE.z), P = surfP(th, BELLY_EYE.z).addScaledVector(N, 0.3);
		const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), N); return {g: eg, m: new THREE.Matrix4().compose(P, q, new THREE.Vector3(1, 1, 1))}; }));
	GEO = {outer, inner, floor, soil, under, plates, horns, eyes};
	console.log('TIMING geometry', Math.round(performance.now() - t0), 'ms');
	return GEO; };

/* ============================== materials ============================== */
type Mats = {eye: THREE.MeshStandardMaterial; body: THREE.MeshStandardMaterial; flange: THREE.MeshStandardMaterial; flangeSide: THREE.MeshStandardMaterial; horn: THREE.MeshStandardMaterial; inner: THREE.MeshStandardMaterial; floor: THREE.MeshStandardMaterial; soil: THREE.MeshStandardMaterial; under: THREE.MeshStandardMaterial};
const MATS: Partial<Record<Look, Mats>> = {};
const bronze = (m: Maps, look: Look, o: Partial<THREE.MeshStandardMaterialParameters> = {}) => new THREE.MeshStandardMaterial({
	map: m.albedo, normalMap: m.normal, aoMap: m.orm, roughnessMap: m.orm, metalnessMap: m.orm, roughness: 1, metalness: 1, aoMapIntensity: 1,
	envMapIntensity: look === 'clean' ? 1.0 : 0.75,
	...(look === 'molten' ? {emissive: new THREE.Color('#ffffff'), emissiveMap: m.heat, emissiveIntensity: 2.2, metalness: 0.5, roughness: 1.1} : {}), ...o});
export const zunMats = (look: Look): Mats => { if (MATS[look]) return MATS[look]!; const t0 = performance.now();
	const bm = bodyMaps(look), fm = flangeMaps(look), tm = tileMaps(look), im = tileMaps(look, true), fl = floorMaps();
	[fm.albedo, fm.orm, fm.normal, fm.heat].forEach((t) => { t.repeat.set(1 / (FL.r1 - FL.r0), -1 / FL.z1); t.offset.set(-FL.r0 / (FL.r1 - FL.r0), 1); });
	const body = bronze(bm, look, {vertexColors: true});
	const flange = bronze(fm, look), flangeSide = bronze(fm, look, {normalMap: null, roughness: 1.7, envMapIntensity: 0.6});
	const horn = bronze(tm, look, {side: THREE.DoubleSide, normalScale: new THREE.Vector2(0.35, 0.35)});
	/* the ball eyes and the horn tops are handled smooth: lighter, polished metal */
	const eye = bronze(tm, look, {side: THREE.DoubleSide, normalScale: new THREE.Vector2(0.2, 0.2), color: new THREE.Color(look === 'clean' ? '#d8d6c8' : '#b8b4a2'), roughness: 0.75});
	/* the horns: smooth cast bronze like the photos (the tile noise streaks along a long thin sweep) */
	Object.assign(horn, {map: null, normalMap: null, aoMap: null, roughnessMap: null, metalnessMap: null, roughness: look === 'clean' ? 0.5 : 0.66, metalness: look === 'clean' ? 0.84 : 0.55, vertexColors: true});
	horn.color = new THREE.Color(look === 'clean' ? '#5e5c4e' : look === 'molten' ? '#4a3a2a' : '#4f5a4a');
	if (look === 'molten') { horn.emissiveMap = null; horn.emissive = new THREE.Color('#ff7a26'); } horn.shadowSide = THREE.FrontSide; eye.shadowSide = THREE.FrontSide;
	const inner = bronze(im, look === 'molten' ? 'molten' : 'dirty', {envMapIntensity: 0.5, color: new THREE.Color('#7c7d72')});
	const floor = new THREE.MeshStandardMaterial({map: fl.albedo, normalMap: fl.normal, aoMap: fl.orm, roughnessMap: fl.orm, metalnessMap: fl.orm, roughness: 1, metalness: 1, envMapIntensity: 0.6,
		emissive: new THREE.Color('#ffb648'), emissiveMap: fl.glow, emissiveIntensity: 0});
	const soil = new THREE.MeshStandardMaterial({map: fl.soilAlb, alphaMap: fl.soil, alphaTest: 0.5, roughness: 0.95, metalness: 0, envMapIntensity: 0.4});
	const under = new THREE.MeshStandardMaterial({color: '#1d1b16', roughness: 0.8, metalness: 0.5});
	MATS[look] = {eye, body, flange, flangeSide, horn, inner, floor, soil, under}; console.log('TIMING materials', look, Math.round(performance.now() - t0), 'ms');
	return MATS[look]!; };

/* ============================== components ============================== */
export type ZunProps3 = {look: Look; glow?: number; reveal?: number; heat?: number; position?: [number, number, number]; yaw?: number; scale?: number; shadows?: boolean};
/** the 尊 itself */
export const Zun3D: React.FC<ZunProps3> = ({look, glow = 0, reveal = 1, heat = 1, position = [0, 0, 0], yaw = 0, scale = 1, shadows = true}) => {
	const G = useMemo(() => zunGeo(), []), M = useMemo(() => zunMats(look), [look]);
	M.floor.emissiveIntensity = 3.2 * glow;
	M.soil.alphaTest = cl(reveal, 0.001, 0.999); M.soil.visible = reveal < 0.999 && (look === 'reveal' || look === 'dirty');
	if (look === 'molten') [M.body, M.flange, M.flangeSide, M.horn, M.eye, M.inner].forEach((m) => { m.emissiveIntensity = 2.2 * heat; });
	const sh = shadows;
	return <group position={position} rotation={[0, yaw, 0]} scale={scale}>
		<mesh geometry={G.outer} material={M.body} castShadow={sh} receiveShadow={sh} />
		<mesh geometry={G.inner} material={M.inner} castShadow={sh} receiveShadow={sh} />
		<mesh geometry={G.floor} material={M.floor} receiveShadow={sh} />
		<mesh geometry={G.soil} material={M.soil} receiveShadow={sh} />
		<mesh geometry={G.under} material={M.under} />
		{[0, 1, 2, 3].map((k) => <group key={k} rotation={[0, k * Math.PI / 2 - Math.PI / 2, 0]}>
			{G.plates.map((p) => <mesh key={p.key} geometry={p.g} material={[M.flange, M.flangeSide]} castShadow={sh} receiveShadow={sh} />)}</group>)}
		{G.horns.map((g, i) => <mesh key={i} geometry={g} material={M.horn} castShadow={sh} receiveShadow={sh} />)}
		{G.eyes.map((e, i) => <mesh key={i} geometry={e.g} material={M.eye} matrixAutoUpdate={false} matrix={e.m} castShadow={sh} receiveShadow={sh} />)}
	</group>; };

/** RoomEnvironment through PMREM, rotated with the camera so the studio reflections stay put in frame */
export const Env: React.FC<{intensity?: number; rotY?: number}> = ({intensity = 1, rotY = 0}) => {
	const {gl, scene} = useThree();
	const tex = useMemo(() => { const pm = new THREE.PMREMGenerator(gl); const rt = pm.fromScene(new RoomEnvironment(), 0.035); pm.dispose(); return rt.texture; }, [gl]);
	scene.environment = tex; scene.environmentIntensity = intensity; scene.environmentRotation.set(0, rotY, 0);
	return null; };

/** camera on a sphere round a target: az (deg, 0 = the front flange, 90 = +x), el (deg) */
/** shift: move the picture by (dx, dy) px on a 1920 × 1080 frame (a view offset, so the perspective stays centred on the target) */
export const CamRig: React.FC<{az: number; el: number; D: number; target: [number, number, number]; fov: number; shift?: [number, number]}> = ({az, el, D, target, fov, shift}) => {
	const {camera} = useThree(); const a = az * D2R, e = el * D2R;
	camera.position.set(target[0] + D * Math.sin(a) * Math.cos(e), target[1] + D * Math.sin(e), target[2] + D * Math.cos(a) * Math.cos(e));
	(camera as THREE.PerspectiveCamera).fov = fov; camera.near = 1; camera.far = 2000; camera.lookAt(target[0], target[1], target[2]);
	if (shift) (camera as THREE.PerspectiveCamera).setViewOffset(1920, 1080, -shift[0], -shift[1], 1920, 1080); else (camera as THREE.PerspectiveCamera).clearViewOffset();
	camera.updateProjectionMatrix();
	return null; };

const BLOB = (() => { let t: THREE.Texture | null = null; return () => { if (t) return t; const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d')!;
	const g = x.createRadialGradient(128, 128, 0, 128, 128, 128); g.addColorStop(0, 'rgba(0,0,0,0.95)'); g.addColorStop(0.55, 'rgba(0,0,0,0.6)'); g.addColorStop(1, 'rgba(0,0,0,0)');
	x.fillStyle = g; x.fillRect(0, 0, 256, 256); t = new THREE.CanvasTexture(c); return t; }; })();
/** studio: a warm key (casts the shadow), a cool fill, a rim, all placed relative to the camera azimuth; a shadow-catcher floor */
export const Studio: React.FC<{az: number; key?: number; fill?: number; rim?: number; floor?: boolean}> = ({az, key = 3.0, fill = 0.55, rim = 2.0, floor = true}) => {
	const at = (da: number, el: number, D = 150): [number, number, number] => { const a = (az + da) * D2R, e = el * D2R; return [D * Math.sin(a) * Math.cos(e), 19 + D * Math.sin(e), D * Math.cos(a) * Math.cos(e)]; };
	const S = 34;
	return <>
		<directionalLight position={at(38, 42)} intensity={key} color="#FFE3BC" castShadow shadow-mapSize={[2048, 2048]} shadow-bias={-0.0008} shadow-normalBias={0.14}
			shadow-camera-left={-S} shadow-camera-right={S} shadow-camera-top={S} shadow-camera-bottom={-S} shadow-camera-near={60} shadow-camera-far={260} shadow-radius={4} />
		<directionalLight position={at(-70, 18)} intensity={fill} color="#A9C2DC" />
		<directionalLight position={at(160, 35)} intensity={rim} color="#DCE8F6" />
		{floor && <>
			<mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow><planeGeometry args={[600, 600]} /><shadowMaterial opacity={0.5} transparent /></mesh>
			<mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}><planeGeometry args={[30, 30]} /><meshBasicMaterial map={BLOB()} transparent depthWrite={false} opacity={0.75} /></mesh>
		</>}
	</>; };
