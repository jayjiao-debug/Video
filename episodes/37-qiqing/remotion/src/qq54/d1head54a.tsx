import React from 'react';
import {P, f1, rnd, strand, qpts} from './cao54b';
/* ep54 · D1 variant A, round 4: 曹操's head redrawn from the owner's notes on the second target (owner_target2.png mapped to film space:
   film = (target − (−18.5, 14)) / 0.818). Everything inside SCR is drawn in SCREEN px of the 101.60 frame (the target's own
   coordinates): SCR undoes the shot's 1.02 shake-scale and the body bob at 101.60, so the shapes land exactly on the onion.
   The head tilts with its crown to screen-left and turns 3/4 to screen right; he glances sideways at the lens (both irises in their
   left corners), the near brow low, thick and knotted toward the nose, the far brow arched high, the mouth pressed under a thick
   drooping moustache (奸雄). Light, warm Han skin lit by the fires on the left (lit #E2AE86, mid #C48D66, shadow #94624A,
   deep #6A4434, highlight #F2C9A2). Flat cel planes with soft feathered shade layers (filters d1Fe / d1Fs). */
const ACC = '#8FD0DC';
const SK = {lit: '#E2AE86', mid: '#C48D66', sh: '#94624A', deep: '#6A4434', hi: '#F2C9A2'};
const HAIR = '#2A1A12', BEARD = '#2C2622', LINE = '#160C08';
/** screen px (101.60) → the hero layer's drawing space: undo the shake div's scale(1.02) about the centre and the lean bob (1.15 px) */
const SCR = 'translate(960,538.85) scale(0.980392) translate(-960,-540)';

/* ---------- curve helpers (Catmull-Rom) ---------- */
const cr = (p: P[], closed = true, k = 1 / 6) => { const n = p.length, g = (i: number) => p[closed ? (i + n) % n : Math.max(0, Math.min(n - 1, i))];
	let d = `M${f1(p[0][0])},${f1(p[0][1])}`;
	for (let i = 0; i < (closed ? n : n - 1); i++) { const a = g(i - 1), b = g(i), c = g(i + 1), e = g(i + 2);
		d += ` C${f1(b[0] + (c[0] - a[0]) * k)},${f1(b[1] + (c[1] - a[1]) * k)} ${f1(c[0] - (e[0] - b[0]) * k)},${f1(c[1] - (e[1] - b[1]) * k)} ${f1(c[0])},${f1(c[1])}`; }
	return closed ? d + ' Z' : d; };
/** the Catmull-Rom curve through p, sampled (n points per span) */
const crs = (p: P[], n = 6): P[] => { const out: P[] = [p[0]], g = (i: number) => p[Math.max(0, Math.min(p.length - 1, i))];
	for (let i = 0; i < p.length - 1; i++) { const a = g(i - 1), b = g(i), c = g(i + 1), d = g(i + 2);
		for (let k = 1; k <= n; k++) { const t = k / n, t2 = t * t, t3 = t2 * t;
			out.push([0, 1].map((j) => 0.5 * (2 * b[j] + (-a[j] + c[j]) * t + (2 * a[j] - 5 * b[j] + 4 * c[j] - d[j]) * t2 + (-a[j] + 3 * b[j] - 3 * c[j] + d[j]) * t3)) as P); } }
	return out; };
/** a point at fraction v along a polyline (by vertex index) */
const pl = (p: P[], v: number): P => { const x = Math.min(p.length - 1 - 1e-6, Math.max(0, v * (p.length - 1))), i = Math.floor(x), u = x - i;
	return [p[i][0] + (p[i + 1][0] - p[i][0]) * u, p[i][1] + (p[i + 1][1] - p[i][1]) * u]; };
/** a tapered ribbon along a Catmull-Rom centreline: half-width a at the ends, b at the belly */
const rib = (p: P[], a: number, b: number, skew = 0.5) => strand(crs(p, 5), (u) => a + (b - a) * Math.pow(Math.sin(Math.PI * Math.pow(u, Math.log(0.5) / Math.log(skew))), 0.8));

/* ---------- geometry (screen px at 101.60) ---------- */
/* the face: generous, so the rim, the aventail, the far band and the beard all overlap its edges (no gaps for the rim filter) */
const FACE = cr([[1294, 302], [1298, 270], [1314, 244], [1334, 222], [1360, 204], [1388, 193], [1414, 192], [1432, 204], [1448, 224], [1464, 248], [1480, 272], [1494, 298], [1498, 330], [1490, 352], [1466, 368], [1434, 376], [1398, 372], [1370, 361], [1350, 350], [1334, 332], [1316, 314]]);
/* the helmet rim band: its lower edge sits on the brow line, its upper edge on the dome */
const RL: P[] = [[1286, 308], [1296, 286], [1307, 271], [1318, 259], [1331, 248], [1350, 231], [1370, 218.5], [1390, 208.5], [1408, 206.5], [1422, 210]];
const RU: P[] = [[1270, 300], [1279, 274], [1290, 257], [1302, 244], [1316, 233], [1332, 223], [1350, 212.5], [1370, 202.5], [1390, 195.5], [1407, 193], [1422, 197]];
const RIM = cr([...RL, ...RU.slice().reverse()]);
const DOME = cr([[1272, 300], [1261, 268], [1263, 240], [1273, 216], [1289, 198], [1311, 185], [1337, 178], [1363, 176.5], [1387, 181], [1405, 189], [1422, 199], [1400, 206], [1360, 214], [1320, 236], [1292, 266]]);
/* rivets: three irregular rows of dark slots parallel to the rim */
const RIV: {x: number; y: number; a: number}[] = [];
[[13, 7], [27, 6], [41, 5]].forEach(([off, n], r) => { for (let i = 0; i < n; i++) { const v = 0.06 + (i + 0.5 * (r % 2)) / (n + 0.2) * 0.9 + (rnd(i + r * 9, 41) - 0.5) * 0.04;
	const a = pl(RU, v), b = pl(RU, Math.min(1, v + 0.02)), dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, nx = dy / l, ny = -dx / l;
	const o = off * (1 - 0.25 * v) + (rnd(i + r * 9, 42) - 0.5) * 3, x = a[0] + nx * o, y = a[1] + ny * o;
	if (x > 1262 && y > 182 && (r < 2 || v < 0.75)) RIV.push({x, y, a: (Math.atan2(dy, dx) * 180) / Math.PI}); } });
/* the near aventail: front edge (against the cheek) and back edge (the cyan rim), from the rim (v = 0) to the shoulder (v = 1) */
const AF: P[] = [[1300, 256], [1309, 280], [1321, 300], [1335, 318], [1349, 334], [1360, 350], [1368, 366], [1374, 384]];
const AB: P[] = [[1262, 266], [1264, 290], [1270, 308], [1280, 322], [1291, 334], [1300, 348], [1308, 362], [1316, 376], [1322, 388]];
const AVT = cr([...AF, ...AB.slice().reverse()]);
/* its scales: larger, slightly irregular, overlapping (upper rows over lower), following the cheek and neck */
const SCL: {x: number; y: number; w: number; h: number; a: number; k: number}[] = [];
{ const NR = 8, NC = 4;
	for (let j = NR - 1; j >= 0; j--) for (let i = -1; i <= NC; i++) { const s = j * 13 + i + 20, v = (j + 0.25 + (rnd(s, 51) - 0.5) * 0.2) / (NR - 0.6);
		const u = (i + 0.5 * (j % 2) + 0.5 + (rnd(s, 52) - 0.5) * 0.22) / NC; if (u < -0.12 || u > 1.12) continue;
		const f = pl(AF, v), b = pl(AB, v), f2 = pl(AF, v + 0.04), b2 = pl(AB, v + 0.04);
		const x = f[0] + (b[0] - f[0]) * u, y = f[1] + (b[1] - f[1]) * u, dx = (f2[0] - f[0]) * (1 - u) + (b2[0] - b[0]) * u, dy = (f2[1] - f[1]) * (1 - u) + (b2[1] - b[1]) * u;
		const wd = Math.hypot(b[0] - f[0], b[1] - f[1]) / NC, w = wd * (1.2 + (rnd(s, 53) - 0.5) * 0.3);
		SCL.push({x, y, w, h: w * (1.2 + rnd(s, 54) * 0.2), a: (Math.atan2(dy, dx) * 180) / Math.PI - 90 + (rnd(s, 55) - 0.5) * 10, k: rnd(s, 56)}); } }
const scaleD = (w: number, h: number) => `M${f1(-w / 2)},${f1(-h / 2)} L${f1(w / 2)},${f1(-h / 2)} L${f1(w / 2)},${f1(h * 0.02)} C${f1(w / 2)},${f1(h * 0.42)} ${f1(w * 0.32)},${f1(h / 2)} 0,${f1(h / 2)} C${f1(-w * 0.32)},${f1(h / 2)} ${f1(-w / 2)},${f1(h * 0.42)} ${f1(-w / 2)},${f1(h * 0.02)} Z`;
const scaleB = (w: number, h: number) => `M${f1(w / 2)},${f1(h * 0.02)} C${f1(w / 2)},${f1(h * 0.42)} ${f1(w * 0.32)},${f1(h / 2)} 0,${f1(h / 2)} C${f1(-w * 0.32)},${f1(h / 2)} ${f1(-w / 2)},${f1(h * 0.42)} ${f1(-w / 2)},${f1(h * 0.02)}`;
/* the far band: the rim running round the far side of the head and down the far jaw, its outer edge lit */
const FB: P[] = [[1404, 201], [1420, 208], [1434, 222], [1448, 241], [1462, 260], [1477, 279], [1491, 294], [1505, 306], [1514, 314]];
const FBL: P[] = [[1410, 194.5], [1426, 201.5], [1441, 216], [1455, 235], [1469, 254], [1484, 273], [1498, 288], [1511, 299], [1519, 306]];
/* the eyes */
const ENU: P[] = [[1347.5, 282.6], [1351, 276], [1357, 271.2], [1364, 268.2], [1371, 267], [1377, 267.8]];
const ENL: P[] = [[1377, 267.8], [1372.5, 272.4], [1366, 277], [1359, 280.8], [1352, 283]];
const EYEN = cr([...ENU, ...ENL], true, 0.14);
const EFU: P[] = [[1398.6, 246.4], [1401.6, 241.8], [1406.6, 238.8], [1412.6, 237.6], [1418, 238.2], [1422.6, 240.2]];
const EFL: P[] = [[1422.6, 240.2], [1418.6, 244.6], [1412.6, 248.6], [1406, 250.4], [1401, 249.6]];
const EYEF = cr([...EFU, ...EFL], true, 0.14);
/* the beard and the moustache. The mouth is drawn in its own frame, square to the face: origin = the mouth centre under the nose tip,
   x along the eye line (−33°, the head's tilt), y down the face (perpendicular, along the brow knot → nose line) */
const MO: P = [1425.5, 300.3], MA = (-33 * Math.PI) / 180, MU: P = [Math.cos(MA), Math.sin(MA)], MV: P = [-Math.sin(MA), Math.cos(MA)];
const ML = (q: P[]): P[] => q.map(([x, y]) => [MO[0] + x * MU[0] + y * MV[0], MO[1] + x * MU[1] + y * MV[1]] as P);
const BD = cr([[1350, 343], [1364, 340.5], [1380, 339.5], [1394, 337], [1400, 326], ...ML([[-30, 9], [-17, 6.6], [-6, 6], [4, 6], [12, 6.8], [19, 9.5], [25, 14], [31, 18.4], [38, 20.4], [46, 23]]), [1488, 305],
	[1496, 318], [1499.5, 334], [1497, 350], [1487, 362], [1468, 370.5], [1446, 375.5], [1424, 377.5], [1402, 374.5], [1384, 367], [1368, 357], [1356, 350]]);
/* the moustache: thick over the upper lip, drooping evenly past both corners into the beard (the far half foreshortened) */
const MOU = cr(ML([[-36, 22], [-35, 13], [-31, 4], [-24.5, -4], [-15, -10], [-5, -12.4], [5, -12.2], [14, -9.8], [22, -4.4], [28, 3], [31.6, 11.6], [33, 21],
	[28.6, 21], [26.4, 12.6], [22, 5], [14, 0.6], [5, -0.9], [-2, -1.2], [-10, -0.6], [-17.4, 1.6], [-24, 6.4], [-29.4, 13], [-31.4, 21.6]]));
/* the moustache's hair: short strokes flowing out from under the nose and down over both corners */
const MH: {a: P; b: P; c: string; w: number; o: number}[] = [];
for (let i = 0; i < 28; i++) { const q = -1 + (2 * (i + 0.2 + rnd(i, 81) * 0.6)) / 28, x = q < 0 ? q * 29 : q * 25, y = -9.6 + 9 * q * q + (rnd(i, 84) - 0.5) * 2.5, lit = q < -0.3 && i % 2 === 0;
	const dx = q * 0.9, n = Math.hypot(dx, 1), l = 5 + rnd(i, 82) * 3; const [a, b] = ML([[x, y], [x + (dx / n) * l, y + l / n]]);
	MH.push({a, b, c: lit ? '#8A7A6C' : '#584C44', w: lit ? 0.9 : 1.2, o: lit ? 0.55 : 0.6}); }
for (let i = 0; i < 4; i++) for (const sd of [-1, 1]) { const x = sd < 0 ? -33 + rnd(i, 86) * 1.5 : 29.4 + rnd(i, 87) * 1.5, y = 5 + i * 4; const [a, b] = ML([[x, y], [x + sd * 0.8, y + 6]]);
	MH.push({a, b, c: '#584C44', w: 1.1, o: 0.6}); }
/* the beard's strands: flowing out and down from the chin */
const BH = Array.from({length: 52}, (_, i) => { const x = 1352 + rnd(i, 71) * 146, y = 314 + rnd(i, 72) * 56, dx = (x - 1430) * 0.01, n = Math.hypot(dx, 1), l = 10 + rnd(i, 73) * 8, b = (rnd(i, 74) - 0.5) * 5;
	return {d: `M${f1(x)},${f1(y)} q${f1((dx / n) * l * 0.5 + b)},${f1(l * 0.5)} ${f1((dx / n) * l)},${f1(l / n)}`, grey: i % 5 === 0}; });
/* the lower lip: a calm, slightly flattened lens centred under the nose tip, shorter on the far side; both corners under the moustache */
const LIP = cr(ML([[-16, -0.4], [-8, -1.6], [0, -1.9], [7, -1.6], [13, -0.4], [8, 3.2], [0, 4.4], [-8, 3.9]]));

export const HeadT: React.FC<{t: number}> = ({t}) => {
	const p1 = Math.sin(t * 2 * Math.PI * 1.6) * 5, p2 = Math.sin(t * 2 * Math.PI * 2.1 + 1) * 4;
	const plume = (a: P, c: P, b: P, w: number) => strand(qpts(a, c, b, 12), (u) => w * (1 - u * 0.85) + 0.6);
	return <g>
		{/* the plume (drawing space): a red-orange tassel at the back of the crown, curling back to the left, fluttering */}
		<path d={plume([1284, 188], [1258, 168 + p2], [1236 + p1, 206 + p2], 6)} fill="#9A3A26" />
		<path d={plume([1283, 190], [1248 + p1 * 0.5, 186], [1232 + p1, 246 + p2 * 0.6], 4.5)} fill="#B44A2C" />
		<path d={plume([1285, 189], [1262, 196 + p2 * 0.5], [1250 + p1 * 0.8, 272 + p2 * 0.4], 3.2)} fill="#C8603A" />
		{[0, 1, 2, 3].map((i) => <path key={i} d={`M1284,${188 + i} Q${1252 + i * 4 + p1 * 0.4},${180 + i * 6 + p2 * 0.5} ${1236 + i * 6 + p1},${220 + i * 14 + p2 * 0.6}`} fill="none" stroke={i % 2 ? '#F0A060' : '#E07A44'} strokeWidth={1.3} opacity={0.75} />)}
		<g transform={SCR}>
			{/* the far aventail behind the jaw, its scale edges lit orange by the fires behind him */}
			<path d={cr([[1462, 268], [1484, 282], [1504, 298], [1514, 320], [1510, 346], [1498, 364], [1486, 354], [1488, 330], [1484, 306], [1472, 290]])} fill="#3A2E28" />
			{[[1487, 296, 1497, 330], [1494, 298, 1505, 324], [1500, 304, 1508, 330]].map(([a, b, c, d], i) => <path key={i} d={`M${a},${b} Q${a + 6},${(b + d) / 2} ${c},${d}`} fill="none" stroke={i === 1 ? '#F09050' : '#D0703A'} strokeWidth={2.2} opacity={0.7} strokeLinecap="round" />)}
			{/* the face: the mid tone, then soft planes (lit, shadow side, deep shadow) */}
			<path d={FACE} fill={SK.mid} />
			<g clipPath="url(#d1HfC)">
				<g filter="url(#d1Fe)">
					{/* lit: the forehead under the rim, the near cheek */}
					<path d={cr([[1340, 240], [1360, 225], [1388, 214], [1414, 211], [1424, 222], [1406, 233], [1386, 240], [1364, 248], [1346, 254]])} fill={SK.lit} />
					<path d={cr([[1350, 289], [1364, 285], [1382, 281], [1398, 281], [1402, 296], [1398, 310], [1384, 316], [1366, 316], [1350, 310], [1343, 300]])} fill={SK.lit} />
					<path d={cr([[1416, 249], [1432, 247], [1446, 258], [1448, 270], [1434, 272], [1420, 264]])} fill={SK.lit} opacity={0.55} />
					{/* shadow side: the temple and cheek against the aventail, the lower jaw plane, the far side beyond the nose */}
					<path d={cr([[1294, 302], [1304, 276], [1320, 256], [1338, 244], [1344, 254], [1334, 270], [1330, 290], [1336, 310], [1348, 328], [1358, 346], [1336, 338], [1316, 318]])} fill={SK.sh} />
					<path d={cr([[1296, 300], [1306, 276], [1320, 260], [1330, 256], [1326, 276], [1324, 296], [1332, 318], [1346, 338], [1326, 330], [1310, 316]])} fill={SK.deep} opacity={0.7} />
					<path d={cr([[1426, 214], [1442, 228], [1458, 250], [1472, 272], [1486, 294], [1490, 316], [1472, 302], [1458, 284], [1450, 266], [1440, 246], [1430, 230]])} fill={SK.sh} />
					{/* deep: along the rim's underside, the eye sockets under the brows, under the cheekbone */}
					<path d={rib(RL, 1.5, 3.5)} fill={SK.deep} opacity={0.6} transform="translate(0,3)" />
					<path d={cr([[1336, 268], [1350, 263], [1366, 259], [1382, 259], [1390, 263], [1384, 268], [1372, 267], [1360, 269.5], [1348, 275], [1340, 281]])} fill={SK.deep} opacity={0.75} />
					<path d={cr([[1396, 243], [1404, 236], [1414, 232.6], [1426, 232.6], [1430, 238], [1420, 238.4], [1408, 239.6], [1400, 246]])} fill={SK.deep} opacity={0.6} />
					<path d={cr([[1346, 314], [1366, 318], [1388, 322], [1398, 318], [1396, 326], [1376, 327], [1354, 322]])} fill={SK.deep} opacity={0.45} />
				</g>
				<g filter="url(#d1Fs)">
					{/* the lower jaw plane under the cheekbone: a cel plane with a clean edge */}
					<path d={cr([[1338, 318], [1356, 316], [1376, 320], [1392, 322], [1401, 318], [1404, 344], [1380, 348], [1352, 346]], true, 0.12)} fill={SK.sh} />
					<path d={cr([[1350, 317], [1372, 320.5], [1392, 323], [1400, 320], [1396, 326], [1372, 325.5], [1352, 321]], true, 0.12)} fill={SK.deep} opacity={0.55} />
					{/* the cheekbone's warm highlight */}
					<ellipse cx={1373} cy={290.5} rx={11} ry={3.6} fill={SK.hi} opacity={0.75} transform="rotate(-22,1373,290.5)" />
					{/* the frown: a soft crease above the knotted near brow, a short vertical crease between the brows */}
					<path d="M1367,242 C1372.4,241 1377.6,241.6 1382.4,243.6" fill="none" stroke={SK.deep} strokeWidth={1.7} opacity={0.8} strokeLinecap="round" />
					<path d="M1387.6,247 C1386.8,244.6 1385.6,242.4 1384.2,240.4" fill="none" stroke={SK.deep} strokeWidth={1.7} opacity={0.9} strokeLinecap="round" />
				</g>
				{/* the nose, a prominent straight Han nose seen 3/4: the near side plane in half-tone, the far side plane in shadow with a clean
				   edge at the ridge, the lit bridge plane from between the brows down to a rounded tip; its cast shadow falls onto the far cheek and the moustache */}
				<path d={cr([[1375, 257], [1384.5, 251.5], [1393, 263], [1401, 273], [1406, 283], [1400, 292], [1392, 283], [1384, 270], [1376, 262]])} fill="#B37C5A" filter="url(#d1Fs)" />
				<path d={cr([[1381, 254.5], [1386, 252.5], [1393.6, 262.6], [1401.4, 272.4], [1404.6, 280], [1399.6, 283], [1393, 274], [1386, 264]], true, 0.12)} fill="#A86F50" opacity={0.85} />
				<path d={cr([[1398, 248], [1410, 254], [1424, 266], [1434, 280], [1440, 292], [1428, 297], [1418, 294], [1414, 284], [1404, 262]])} fill={SK.deep} opacity={0.5} filter="url(#d1Fe)" />
				<path d={cr([[1406, 253], [1416, 260], [1426, 271], [1432, 282], [1436, 292], [1426, 293], [1421, 287], [1413, 272]], true, 0.12)} fill={SK.deep} opacity={0.6} filter="url(#d1Fs)" />
				<path d={cr([[1390.5, 247], [1399, 245.5], [1409, 252.5], [1419, 263], [1426, 274], [1424, 283], [1416, 277], [1406, 266], [1397, 256]], true, 0.12)} fill={SK.sh} />
				<path d={cr([[1407, 261], [1416, 268], [1423.5, 277], [1423, 283], [1416, 277.5], [1409, 268]], true, 0.12)} fill={SK.deep} opacity={0.75} />
				<path d={cr([[1383, 250], [1390.5, 247], [1398, 255.5], [1406, 265], [1414, 275], [1409, 279], [1401, 272.6], [1393, 263.6], [1386, 256]], true, 0.12)} fill={SK.lit} />
				<path d={rib([[1388.4, 250], [1395.4, 257.6], [1403, 266.2], [1410, 274.6]], 0.6, 2)} fill={SK.hi} />
				{/* the tip: defined, slightly rounded, lit on top; the nostril wing and the dark nostril */}
				<path d={cr([[1404, 277], [1410.5, 272.8], [1418, 274.4], [1422.6, 280], [1420.4, 286.2], [1413.6, 289], [1406, 287], [1402.6, 282]])} fill="#D9A47C" />
				<path d="M1422.6,280 C1422.4,284.4 1418.6,288.8 1413.6,289 C1409,289 1405.6,287.6 1403.6,285 C1408.6,286.4 1414.6,285.6 1419,282 Z" fill={SK.sh} opacity={0.9} />
				<ellipse cx={1409.5} cy={277} rx={2.8} ry={1.7} fill={SK.hi} opacity={0.95} transform="rotate(-25,1409.5,277)" />
				<path d={cr([[1396.5, 286], [1401, 281.4], [1407, 283.6], [1408.6, 289.4], [1403, 292.4], [1397.4, 291]])} fill={SK.mid} />
				<path d={cr([[1395.6, 291], [1395.4, 286], [1398.4, 282.2], [1403, 281.6], [1400, 284.6], [1398.6, 289]])} fill={SK.sh} filter="url(#d1Fs)" />
				<path d="M1396.4,290.2 C1396,285 1399.6,281.4 1405,281.8" fill="none" stroke={SK.deep} strokeWidth={1.2} opacity={0.85} strokeLinecap="round" />
				<ellipse cx={1413.2} cy={288.2} rx={3.4} ry={1.5} fill="#2E1810" transform="rotate(-16,1413.2,288.2)" />
			</g>
			{/* the near eye: narrow and hard; the iris pushed into the left corner and cut by the lid; a strong upper-lid line */}
			<path d={EYEN} fill="#DCC4A8" />
			<g clipPath="url(#d1EnC)">
				<path d="M1366,276 L1380,268 L1380,285 L1366,285 Z" fill="#F0E0CA" opacity={0.55} />
				<circle cx={1355.8} cy={277} r={5.7} fill="#3A2418" /><circle cx={1355.5} cy={277.2} r={2.9} fill="#0A0605" />
				<path d={rib(ENU, 1.4, 2.4)} fill="#000" opacity={0.3} transform="translate(0.6,1.2)" />
			</g>
			<circle cx={1357.8} cy={275.2} r={1.15} fill="#FFF0DC" />
			<path d={rib([[1344.5, 285], [1347.6, 281.6], [1351, 275.4], [1357.2, 270.3], [1364, 267.3], [1371, 266.1], [1377.4, 266.9], [1381, 268.6]], 0.6, 1.8, 0.42)} fill={LINE} />
			<path d={cr([[1352.5, 284.4], [1359.5, 282.4], [1366.5, 279]], false)} fill="none" stroke="#5A3426" strokeWidth={1.1} opacity={0.85} strokeLinecap="round" />
			<path d={cr([[1355, 268.2], [1362, 265.4], [1370, 264.3], [1376, 264.8]], false)} fill="none" stroke={SK.deep} strokeWidth={1} opacity={0.6} strokeLinecap="round" />
			{/* the far eye: a clear almond under a high arched brow; the iris at the lens (touching the left corner), white on its right */}
			<path d={EYEF} fill="#D6BEA2" />
			<g clipPath="url(#d1EfC)">
				<path d="M1411,244 L1426,237 L1426,250 L1411,250 Z" fill="#F0E0CA" opacity={0.5} />
				<circle cx={1405.2} cy={245} r={5} fill="#3A2418" /><circle cx={1405} cy={245.2} r={2.5} fill="#0A0605" />
				<path d={rib(EFU, 1.2, 2.2)} fill="#000" opacity={0.3} transform="translate(0.4,1.1)" />
			</g>
			<circle cx={1407} cy={243.2} r={1} fill="#FFF0DC" />
			<path d={rib([[1396.6, 248.6], [1399.4, 244.6], [1403, 240.6], [1408.6, 237.4], [1414.6, 236.4], [1420, 237.2], [1424.6, 239.6], [1426.6, 241.6]], 0.6, 1.6, 0.45)} fill={LINE} />
			<path d={cr([[1403, 251.2], [1410, 251], [1417, 247.8]], false)} fill="none" stroke={SK.deep} strokeWidth={1} opacity={0.65} strokeLinecap="round" />
			{/* the brows: the near one thick and low, knotted down toward the nose; the far one arched high */}
			<path d={cr([[1331, 268], [1340, 261.4], [1351, 256], [1361, 252.2], [1370, 250], [1376.6, 250], [1380.4, 252.6], [1381.6, 256.4], [1380.6, 259.8], [1377.6, 259.4], [1374.6, 257.4], [1368, 258.2], [1360, 260], [1350, 263], [1340, 267.4], [1333, 270.6]], true, 0.15)} fill="#3C281C" />
			<path d={cr([[1352, 260.5], [1362, 256.4], [1372, 253.4], [1378.4, 254], [1380.6, 258.4], [1377.6, 258.6], [1372, 256.6], [1362, 258.6]], true, 0.15)} fill="#1A0E08" opacity={0.85} />
			{Array.from({length: 16}, (_, i) => { const u = (i + rnd(i, 61) * 0.5) / 16, x = 1333 + u * 43, y = 268.5 - u * 16 + rnd(i, 62) * 2.5, l = 4 + rnd(i, 63) * 3;
				return <path key={i} d={`M${f1(x)},${f1(y)} l${f1(l * 0.86)},${f1(-l * 0.5 - 1.2)}`} fill="none" stroke={i % 3 === 0 ? '#6A5444' : '#140A06'} strokeWidth={1} opacity={i % 3 === 0 ? 0.5 : 0.75} strokeLinecap="round" />; })}
			<path d={rib([[1392.4, 248.4], [1395, 242.4], [1400, 235.6], [1406.6, 230], [1414, 226], [1422, 224.2], [1430, 225], [1435, 227.4]], 0.9, 3.1, 0.3)} fill="#2E1E14" />
			{Array.from({length: 8}, (_, i) => { const u = (i + 0.5) / 8, a = pl([[1393, 247], [1400, 235.6], [1414, 226], [1430, 225]], u); return <path key={i} d={`M${f1(a[0] - 1)},${f1(a[1] + 1.6)} l${f1(4 + u * 2)},${f1(-2.4 + u * 2)}`} fill="none" stroke={i % 3 === 0 ? '#6A5444' : '#120A06'} strokeWidth={0.9} opacity={0.6} strokeLinecap="round" />; })}
			{/* the beard: solid over the chin and along the jaw, strand texture, greying flecks; the moustache thick and drooping */}
			<path d={BD} fill={BEARD} />
			<g clipPath="url(#d1BdC)">
				<g filter="url(#d1Fe)">
					<path d={cr([[1346, 338], [1376, 336], [1400, 330], [1404, 356], [1388, 372], [1360, 356]])} fill="#4A3E36" opacity={0.75} />
					<path d={cr([[1414, 372], [1446, 366], [1478, 358], [1494, 362], [1470, 384], [1424, 386]])} fill="#1E1A17" opacity={0.5} />
					<path d={cr([[1476, 304], [1494, 312], [1502, 336], [1490, 344], [1482, 324]])} fill="#5A4A3E" opacity={0.55} />
				</g>
				{BH.map((h, i) => <path key={i} d={h.d} fill="none" stroke={h.grey ? '#8E867C' : i % 2 ? '#463E38' : '#3A332E'} strokeWidth={h.grey ? 0.9 : 2.2} opacity={h.grey ? 0.42 : 0.7} strokeLinecap="round" />)}
				{[0, 1, 2, 3, 4, 5].map((i) => <path key={'l' + i} d={`M${1352 + i * 7},${343 + i * 4.4} q${2 + i * 0.4},7 ${4 + i * 0.6},14`} fill="none" stroke="#6E5E52" strokeWidth={1.2} opacity={0.5} strokeLinecap="round" />)}
			</g>
			{[[1360, 352], [1372, 360], [1385, 367], [1398, 372], [1412, 376], [1426, 378], [1440, 376.5], [1454, 373.5], [1468, 369.5], [1480, 364], [1490, 356]].map(([x, y], i) =>
				<path key={i} d={`M${x - 5.5},${y - 3} Q${x + 1},${y + 6 + (i % 3)} ${x + 5},${y - 2}`} fill={BEARD} />)}
			<path d="M1362,353 C1380,366 1404,375 1428,378" fill="none" stroke="#C08050" strokeWidth={1.4} opacity={0.35} />
			{/* the lower lip: a small lit lens under the moustache; the pressed mouth line square to the face */}
			<path d={cr(ML([[-13, 4.6], [-4, 5.4], [5, 5.2], [11, 3.6]]), false)} fill="none" stroke="#1A1512" strokeWidth={2.2} opacity={0.6} strokeLinecap="round" />
			<path d={LIP} fill="#B47A5A" />
			<path d={cr(ML([[-12, 3.4], [-4, 4.4], [4, 4.2], [10, 2.6]]), false)} fill="none" stroke={SK.deep} strokeWidth={1.2} opacity={0.6} strokeLinecap="round" />
			<path d={rib(ML([[-7, 2], [0, 1.8], [6, 2]]), 0.3, 1)} fill={SK.hi} opacity={0.55} />
			<path d={cr(ML([[-15.5, 1.4], [-8, 0.4], [0, 0.2], [7, 0.4], [12.5, 1.4]]), false)} fill="none" stroke="#2A1410" strokeWidth={1.4} strokeLinecap="round" />
			<path d={MOU} fill="#2A211B" />
			{MH.map((h, i) => <path key={i} d={`M${f1(h.a[0])},${f1(h.a[1])} L${f1(h.b[0])},${f1(h.b[1])}`} fill="none" stroke={h.c} strokeWidth={h.w} opacity={h.o} strokeLinecap="round" />)}
			{/* the near aventail: overlapping scales (upper rows over lower), lit upper edges, shaded lower parts; the cyan rim on its back edge */}
			<path d={AVT} fill="#3A2E28" />
			<g clipPath="url(#d1AvC)">
				{SCL.map((s, i) => <g key={i} transform={`translate(${f1(s.x)},${f1(s.y)}) rotate(${f1(s.a)})`}>
					<path d={scaleD(s.w, s.h)} fill={s.k < 0.33 ? 'url(#d1Sc2)' : 'url(#d1Sc)'} />
					<path d={scaleB(s.w, s.h)} fill="none" stroke="#1C1512" strokeWidth={1.1} opacity={0.85} /></g>)}
				<g filter="url(#d1Fe)">
					<path d={cr([[1300, 252], [1318, 290], [1340, 322], [1362, 348], [1376, 384], [1356, 384], [1330, 340], [1306, 300], [1290, 262]])} fill="#000" opacity={0.25} />
					<path d={rib(RL.slice(0, 4), 3, 6)} fill="#000" opacity={0.35} transform="translate(-2,5)" />
				</g>
			</g>
			<path d={cr(AF.slice(3), false)} fill="none" stroke="#A88A6A" strokeWidth={1.8} opacity={0.7} />
			<path d={cr(AF.slice(0, 4), false)} fill="none" stroke="#1E1612" strokeWidth={1.4} opacity={0.6} />
			<path d={cr(AB.slice(1), false)} fill="none" stroke={ACC} strokeWidth={3} opacity={0.75} />
			{/* the far band: the rim going round the far side of the head and down the far jaw; its outer edge lit */}
			<path d={rib(FB, 5.2, 6.8)} fill="#3E2E26" />
			<path d={rib(FBL, 1, 1.8)} fill="#C49A72" opacity={0.9} />
			<path d={cr(FB.map(([x, y]) => [x - 4.2, y + 4.6] as P), false)} fill="none" stroke="#1A120E" strokeWidth={1.5} opacity={0.7} />
			{/* the helmet: a rounded iron dome (warm dark grey) with rows of rivets, lit on the crown by the fires behind; the thick rim band */}
			<path d={DOME} fill="url(#d1Dm)" />
			<path d={cr([[1300, 192], [1330, 180], [1362, 177.5], [1388, 182], [1408, 192], [1394, 192], [1366, 186], [1334, 188], [1310, 196]])} fill="#A88262" opacity={0.55} filter="url(#d1Fs)" />
			{RIV.map((r, i) => <g key={i} transform={`translate(${f1(r.x)},${f1(r.y)}) rotate(${f1(r.a + (rnd(i, 44) - 0.5) * 30)})`}>
				<ellipse cx={0} cy={0} rx={2.8} ry={1.3} fill="#1E1614" /><ellipse cx={0.6} cy={1.3} rx={1.8} ry={0.6} fill="#9A7C66" opacity={0.45} /></g>)}
			<path d={cr([[1272, 300], [1261, 268], [1263, 240], [1273, 216], [1289, 198], [1311, 185], [1337, 178]], false)} fill="none" stroke={ACC} strokeWidth={2.2} opacity={0.5} />
			<path d={cr([[1337, 178], [1363, 176.5], [1387, 181], [1405, 189], [1422, 199]], false)} fill="none" stroke="#D89A60" strokeWidth={2.4} opacity={0.7} />
			<path d={RIM} fill="#4C3B32" />
			<path d={rib(RU.map(([x, y]) => [x + 1.6, y + 5.5] as P), 1.2, 2.6)} fill="#2E221C" opacity={0.6} />
			<path d={cr(RU.map(([x, y]) => [x + 1, y + 3.4] as P), false)} fill="none" stroke="#7A6050" strokeWidth={1.2} opacity={0.6} />
			<path d={cr(RU, false)} fill="none" stroke="#9A7A5E" strokeWidth={1.8} opacity={0.75} />
			<path d={cr(RL, false)} fill="none" stroke="#22160F" strokeWidth={1.6} opacity={0.8} />
		</g>
	</g>; };
export const HeadDefs: React.FC = () => <>
	<clipPath id="d1HfC"><path d={FACE} /></clipPath>
	<clipPath id="d1EnC"><path d={EYEN} /></clipPath>
	<clipPath id="d1EfC"><path d={EYEF} /></clipPath>
	<clipPath id="d1BdC"><path d={BD} /></clipPath>
	<clipPath id="d1AvC"><path d={AVT} /></clipPath>
	<filter id="d1Fs" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation={1.3} /></filter>
	<linearGradient id="d1Dm" x1={1268} y1={280} x2={1410} y2={180} gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#3A322E" /><stop offset="0.5" stopColor="#5C4E46" /><stop offset="1" stopColor="#806452" /></linearGradient>
	{/* one scale (objectBoundingBox, top → bottom): the part under the row above, a soft lit upper edge, the shaded lower part */}
	<linearGradient id="d1Sc" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#42362F" /><stop offset="0.4" stopColor="#64534A" /><stop offset="0.6" stopColor="#4A3D35" /><stop offset="1" stopColor="#28201B" /></linearGradient>
	<linearGradient id="d1Sc2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#42362F" /><stop offset="0.42" stopColor="#635245" /><stop offset="0.62" stopColor="#4A3D34" /><stop offset="1" stopColor="#261E1A" /></linearGradient>
</>;
