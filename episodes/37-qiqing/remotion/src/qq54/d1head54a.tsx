import React from 'react';
import {P, f1, rnd, strand, qpts} from './cao54b';
/* ep54 · D1 variant A, round 3: 曹操's head TRACED from the owner's second target (owner_target2.png mapped to film space at 101.60:
   film = (target − (−18.5, 14)) / 0.818). Drawn directly in film px. The head tilts with its crown to screen-left and turns 3/4;
   he glances sideways at the lens (both irises in the inner/left corners), the near brow low and knotted toward the nose, the far
   brow arched, the lids narrowed: cool and dangerous (奸雄). Painterly: soft feathered shade layers (filter d1Fe), strand strokes. */
const ACC = '#8FD0DC';
const R1 = [[1281, 264], [1292, 248], [1304, 234], [1318, 221], [1334, 210], [1351, 201], [1369, 195], [1388, 192], [1406, 194]];
const R2 = [[1270, 248], [1279, 230], [1291, 215], [1305, 203], [1322, 193], [1341, 186], [1361, 182], [1381, 181], [1400, 184]];
const R3 = [[1268, 226], [1278, 209], [1292, 196], [1309, 187], [1329, 181], [1350, 178], [1371, 178]];
/* the aventail's scale rows (centres), tilted with the head */
const SCALES: P[] = []; for (let j = 0; j < 12; j++) for (let i = 0; i < 7; i++) { const u = i * 13 + (j % 2) * 6.5 - 6, v = j * 10.5;
	SCALES.push([1272 + u * 0.9 + v * 0.42, 276 + v * 0.92 - u * 0.36]); }
export const HeadT: React.FC<{t: number}> = ({t}) => {
	const p1 = Math.sin(t * 2 * Math.PI * 1.6) * 5, p2 = Math.sin(t * 2 * Math.PI * 2.1 + 1) * 4;
	const AVT = 'M1278,294 C1288,286 1300,282 1310,280 C1318,294 1326,310 1338,330 C1348,346 1360,356 1372,364 C1360,374 1336,378 1312,374 C1298,360 1288,338 1283,316 C1280,306 1278,300 1278,294 Z';
	const FACE = 'M1296,292 C1316,262 1344,234 1378,216 C1400,210 1420,212 1434,222 C1454,244 1474,278 1488,318 C1488,350 1462,372 1430,375 C1394,373 1362,358 1344,334 C1332,318 1318,298 1296,292 Z';
	const BEARD = 'M1342,334 C1360,338 1382,336 1398,326 C1404,316 1405,304 1409,298 L1411,318 C1413,330 1424,335 1437,331 C1447,323 1453,311 1458,303 C1470,300 1482,300 1492,305 C1497,316 1501,330 1501,342 C1496,356 1476,368 1452,374 C1442,378 1432,381 1424,379 C1404,375 1380,368 1360,358 C1349,351 1342,343 1342,334 Z';
	const plume = (a: P, c: P, b: P, w: number) => strand(qpts(a, c, b, 12), (u) => w * (1 - u * 0.85) + 0.6);
	return <g>
		{/* the plume: a red-orange tassel at the back of the crown, curling back to the left, fluttering */}
		<path d={plume([1284, 188], [1258, 168 + p2], [1236 + p1, 206 + p2], 6)} fill="#9A3A26" />
		<path d={plume([1283, 190], [1248 + p1 * 0.5, 186], [1232 + p1, 246 + p2 * 0.6], 4.5)} fill="#B44A2C" />
		<path d={plume([1285, 189], [1262, 196 + p2 * 0.5], [1250 + p1 * 0.8, 272 + p2 * 0.4], 3.2)} fill="#C8603A" />
		{[0, 1, 2, 3].map((i) => <path key={i} d={`M1284,${188 + i} Q${1252 + i * 4 + p1 * 0.4},${180 + i * 6 + p2 * 0.5} ${1236 + i * 6 + p1},${220 + i * 14 + p2 * 0.6}`} fill="none" stroke={i % 2 ? '#F0A060' : '#E07A44'} strokeWidth={1.3} opacity={0.75} />)}
		{/* the far rim / hood edge running down the far side of the face */}
		<path d="M1434,214 C1456,234 1478,264 1490,300 C1494,316 1494,330 1490,344" fill="none" stroke="#3E241A" strokeWidth={18} strokeLinecap="round" />
		<path d="M1428,224 C1450,242 1470,270 1482,302" fill="none" stroke="#24140E" strokeWidth={3} opacity={0.6} />
		<path d="M1442,206 C1466,226 1488,256 1500,294 C1504,310 1504,326 1500,342" fill="none" stroke="#B58A69" strokeWidth={2.6} opacity={0.75} />
		{/* the neck in the jaw's shadow */}
		<path d="M1395,360 C1420,374 1462,376 1500,348 L1514,398 C1482,406 1440,406 1404,398 Z" fill="#5E4237" />
		<path d="M1480,362 C1490,358 1498,352 1504,346 L1514,398 C1506,400 1498,401 1490,401 Z" fill="#8A5E46" opacity={0.8} />
		{/* the face: base, then feathered planes */}
		<path d={FACE} fill="#7E5642" />
		<g clipPath="url(#d1HfC)">
			<g filter="url(#d1Fe)">
				<path d="M1372,222 C1394,214 1420,214 1440,226 C1430,238 1412,244 1392,246 C1380,242 1372,234 1372,222 Z" fill="#946A50" opacity={0.7} />
				<path d="M1426,234 C1444,244 1462,264 1474,292 C1462,300 1448,300 1436,292 C1428,276 1424,256 1426,234 Z" fill="#A47458" opacity={0.85} />
				<path d="M1340,284 C1356,278 1376,280 1396,288 C1398,302 1394,312 1388,318 C1370,320 1354,316 1344,306 Z" fill="#9A6A4E" opacity={0.85} />
				<path d="M1340,314 C1360,322 1380,324 1400,318 L1402,338 C1380,344 1356,342 1342,334 Z" fill="#553A2E" opacity={0.9} />
				<ellipse cx={1360} cy={270} rx={27} ry={15} fill="#4E3226" opacity={0.75} transform="rotate(-25,1360,270)" />
				<path d="M1306,288 C1320,296 1334,312 1344,332 L1360,336 C1352,316 1344,300 1336,286 C1326,280 1314,282 1306,288 Z" fill="#4A3026" opacity={0.85} />
				<ellipse cx={1412} cy={243} rx={16} ry={9} fill="#5E3E30" opacity={0.55} transform="rotate(-22,1412,243)" />
				<path d="M1402,256 C1412,265 1421,274 1430,284 L1444,278 C1432,262 1420,250 1408,246 Z" fill="#4E3228" opacity={0.95} />
				<path d="M1306,286 C1318,300 1332,318 1346,336 L1334,340 C1320,322 1306,304 1296,292 Z" fill="#4A3028" opacity={0.7} />
			</g>
			{/* the forehead creases of the frown */}
			<path d="M1380,238 C1388,236 1396,232 1402,226 M1372,246 C1380,243 1388,240 1394,236" fill="none" stroke="#5A3A2C" strokeWidth={1.6} opacity={0.6} />
		</g>
		{/* the knot between the brows */}
		<path d="M1388,252 C1391,248 1393,244 1394,238 M1393,255 C1397,251 1400,247 1401,242" fill="none" stroke="#3A2218" strokeWidth={2} opacity={0.75} strokeLinecap="round" />
		{/* the near eye: narrowed; the iris in the inner/left corner, white on its right */}
		<path d="M1349,283 C1353,275 1362,269 1374,268 C1372,277 1363,284 1351,287 Z" fill="#DDBE9E" />
		<g clipPath="url(#d1EnC)"><circle cx={1358} cy={277.5} r={5} fill="#3E2A20" /><circle cx={1357.6} cy={278} r={2.7} fill="#0A0605" />
			<path d="M1340,266 L1380,262 L1380,273 C1366,271 1352,275 1340,281 Z" fill="#000" opacity={0.4} /></g>
		<circle cx={1359.8} cy={276} r={1.2} fill="#F4E0C8" />
		<path d="M1346,285 C1352,275 1361,268 1375,267 L1378,266" fill="none" stroke="#1E120C" strokeWidth={3.6} strokeLinecap="round" />
		<path d="M1352,287 C1360,285 1368,280 1373,272" fill="none" stroke="#3A2218" strokeWidth={1.2} opacity={0.6} />
		{/* the far eye */}
		<path d="M1404,250 C1408,244 1415,241 1424,242 C1420,248 1412,252 1405,252 Z" fill="#CFAA8C" />
		<g clipPath="url(#d1EfC)"><circle cx={1411} cy={247.5} r={4.2} fill="#3E2A20" /><circle cx={1410.6} cy={248} r={2.3} fill="#0A0605" />
			<path d="M1400,238 L1428,236 L1428,245 C1416,243 1406,247 1400,251 Z" fill="#000" opacity={0.4} /></g>
		<circle cx={1412.4} cy={246.2} r={1} fill="#F4E0C8" />
		<path d="M1402,252 C1407,244 1415,240 1426,241" fill="none" stroke="#1E120C" strokeWidth={3} strokeLinecap="round" />
		{/* the brows: the near one low and knotted down toward the nose, the far one arched higher */}
		<path d="M1333,272 C1346,264 1364,257 1382,253 C1389,252 1394,256 1396,263 L1391,266 C1388,261 1383,259 1377,260 C1362,263 1348,269 1337,278 Z" fill="#22140E" />
		<path d="M1338,270 C1352,263 1366,258 1380,256" fill="none" stroke="#6A5A4E" strokeWidth={1} opacity={0.5} />
		<path d="M1400,241 C1404,233 1411,227 1420,224 C1424,223 1427,224 1429,227 L1427,231 C1422,229 1416,231 1411,235 C1406,238 1403,242 1402,246 Z" fill="#22140E" />
		{/* the nose: a prominent straight bridge, lit; the shadowed far side and the base */}
		<path d="M1378,256 C1388,266 1398,276 1405,286 L1418,280 C1410,268 1400,256 1392,248 Z" fill="#906448" filter="url(#d1Fe)" />
		<path d="M1390,254 C1398,264 1405,273 1411,281" fill="none" stroke="#C8946C" strokeWidth={1.8} opacity={0.7} />
		<path d="M1404,284 C1408,274 1418,268 1428,272 C1432,280 1428,289 1418,292 C1410,292 1405,289 1404,284 Z" fill="#4A2C22" />
		<ellipse cx={1414} cy={287} rx={4} ry={2} fill="#1E100A" transform="rotate(10,1414,287)" />
		{/* the pressed lips: the lower lip lit, the mouth line with its corner slightly down */}
		<path d="M1407,296 C1420,293 1436,294 1446,298 C1446,306 1442,314 1436,318 C1424,320 1412,318 1406,312 Z" fill="#9A6A50" />
		<path d="M1414,306 C1422,303 1434,303 1442,306" fill="none" stroke="#C08A68" strokeWidth={1.6} opacity={0.6} />
		<path d="M1418,293 C1430,292 1444,294 1456,298 L1460,303" fill="none" stroke="#1A0E0A" strokeWidth={2.6} strokeLinecap="round" />
		{/* the beard: full and trimmed, following the jaw from the aventail to a slightly pointed chin; textured edges, strands */}
		<path d={BEARD} fill="#2C2622" />
		<g clipPath="url(#d1BdC)">
			<g filter="url(#d1Fe)"><path d="M1342,330 C1360,336 1380,338 1400,330 L1400,370 L1340,370 Z" fill="#4A3E36" opacity={0.7} />
				<path d="M1470,300 C1488,304 1500,320 1502,340 L1480,350 C1478,330 1474,314 1470,300 Z" fill="#5A4A3E" opacity={0.6} /></g>
			{Array.from({length: 60}, (_, i) => { const a = rnd(i, 71), b = rnd(i, 72), x = 1346 + a * 152, y = 314 + b * 60, l = 9 + rnd(i, 73) * 10, bend = (a - 0.5) * 8;
				return <path key={i} d={`M${f1(x)},${f1(y)} q${f1(bend)},${f1(l * 0.55)} ${f1(3 + a * 4)},${f1(l)}`} fill="none" stroke={i % 3 === 0 ? '#8A8278' : '#5A524C'} strokeWidth={i % 3 === 0 ? 1.1 : 1.6} opacity={i % 3 === 0 ? 0.55 : 0.6} strokeLinecap="round" />; })}
		</g>
		{[[1350, 346], [1362, 354], [1376, 361], [1390, 366], [1404, 371], [1418, 376], [1430, 380], [1442, 376], [1456, 371], [1470, 365], [1484, 357], [1495, 347]].map(([x, y], i) =>
			<path key={i} d={`M${x - 5},${y - 3} Q${x},${y + 7 + (i % 2) * 2} ${x + 5},${y - 2}`} fill="#29231F" />)}
		<path d="M1460,370 C1476,364 1490,354 1498,342" fill="none" stroke="#C08050" strokeWidth={1.8} opacity={0.5} />
		{/* the moustache: full, merging at the corners into the beard */}
		<path d="M1404,288 C1414,280 1430,277 1446,278 C1462,280 1474,286 1482,296 C1474,298 1464,296 1454,293 C1440,289 1426,290 1416,293 C1410,298 1408,306 1406,318 C1400,312 1399,300 1400,293 Z" fill="#2E241E" />
		<path d="M1410,286 C1424,281 1440,280 1456,283 M1414,292 C1426,287 1442,286 1460,290 M1404,300 C1404,310 1404,318 1406,326" fill="none" stroke="#8A8076" strokeWidth={1.1} opacity={0.65} />
		{/* the aventail: large rounded overlapping scales over the cheek, ear and neck */}
		<path d={AVT} fill="#3A2E2A" />
		<g clipPath="url(#d1AvC)">
			{SCALES.map(([x, y], i) => <g key={i} transform={`rotate(-24,${f1(x)},${f1(y)})`}>
				<path d={`M${f1(x - 6.5)},${f1(y)} C${f1(x - 6.5)},${f1(y + 9)} ${f1(x + 6.5)},${f1(y + 9)} ${f1(x + 6.5)},${f1(y)} Z`} fill={i % 3 ? '#4E403A' : '#564640'} stroke="#231A16" strokeWidth={1.2} />
				<path d={`M${f1(x - 4.5)},${f1(y + 2)} C${f1(x - 3)},${f1(y + 5)} ${f1(x + 2)},${f1(y + 6)} ${f1(x + 4)},${f1(y + 4)}`} fill="none" stroke="#7A6A60" strokeWidth={1} opacity={0.55} /></g>)}
			<path d="M1318,257 C1328,274 1334,296 1342,318 C1348,334 1356,346 1354,358 L1380,358 L1380,250 Z" fill="#000" opacity={0.2} />
		</g>
		<path d="M1280,300 C1284,326 1294,352 1312,374" fill="none" stroke={ACC} strokeWidth={3} opacity={0.75} />
		{/* the helmet: a rounded iron dome with rows of rivets, lit from the fire on the right; the thick rim band with its lighter edge */}
		<path d="M1263,290 C1254,258 1258,224 1276,200 C1296,182 1328,174 1360,175 C1392,177 1418,190 1436,214 C1420,206 1398,199 1376,200 C1350,206 1328,222 1312,242 C1298,260 1288,276 1282,296 Z" fill="url(#d1Dm)" />
		{[R1, R2, R3].map((row, j) => row.map(([x, y], i) => <g key={j * 20 + i}><ellipse cx={x} cy={y - 3} rx={2.3} ry={1.7} fill="#1E1614" /><circle cx={x + 0.8} cy={y - 3.8} r={0.7} fill="#B08A6A" opacity={0.6} /></g>))}
		<path d="M1263,290 C1254,258 1258,224 1276,200 C1296,182 1328,174 1360,175" fill="none" stroke={ACC} strokeWidth={2.2} opacity={0.5} />
		<path d="M1362,175 C1394,177 1420,191 1437,213" fill="none" stroke="#D89A60" strokeWidth={2.6} opacity={0.7} />
		<path d="M1287,296 C1296,276 1308,256 1322,240 C1340,222 1360,210 1382,206 C1400,204 1420,207 1436,216" fill="none" stroke="#45332A" strokeWidth={16} strokeLinecap="round" />
		<path d="M1287,296 C1296,276 1308,256 1322,240 C1340,222 1360,210 1382,206 C1400,204 1420,207 1436,216" fill="none" stroke="#2A1C16" strokeWidth={16} strokeLinecap="round" strokeDasharray="2 5" opacity={0.35} />
		<path d="M1279,292 C1288,270 1300,250 1315,234 C1334,215 1356,203 1380,198 C1400,196 1420,199 1438,208" fill="none" stroke="#7A5C46" strokeWidth={2.2} opacity={0.7} />
		<path d="M1295,300 C1304,282 1316,262 1330,247 C1347,230 1364,219 1384,214 C1402,212 1420,215 1434,223" fill="none" stroke="#1E1410" strokeWidth={1.6} opacity={0.7} />
	</g>; };
export const HeadDefs: React.FC = () => <>
	<clipPath id="d1HfC"><path d="M1296,292 C1316,262 1344,234 1378,216 C1400,210 1420,212 1434,222 C1454,244 1474,278 1488,318 C1488,350 1462,372 1430,375 C1394,373 1362,358 1344,334 C1332,318 1318,298 1296,292 Z" /></clipPath>
	<clipPath id="d1EnC"><path d="M1349,283 C1353,275 1362,269 1374,268 C1372,277 1363,284 1351,287 Z" /></clipPath>
	<clipPath id="d1EfC"><path d="M1404,250 C1408,244 1415,241 1424,242 C1420,248 1412,252 1405,252 Z" /></clipPath>
	<clipPath id="d1BdC"><path d="M1342,334 C1360,338 1382,336 1398,326 C1404,316 1405,304 1409,298 L1411,318 C1413,330 1424,335 1437,331 C1447,323 1453,311 1458,303 C1470,300 1482,300 1492,305 C1497,316 1501,330 1501,342 C1496,356 1476,368 1452,374 C1442,378 1432,381 1424,379 C1404,375 1380,368 1360,358 C1349,351 1342,343 1342,334 Z" /></clipPath>
	<clipPath id="d1AvC"><path d="M1278,294 C1288,286 1300,282 1310,280 C1318,294 1326,310 1338,330 C1348,346 1360,356 1372,364 C1360,374 1336,378 1312,374 C1298,360 1288,338 1283,316 C1280,306 1278,300 1278,294 Z" /></clipPath>
	<linearGradient id="d1Dm" x1={1270} y1={270} x2={1420} y2={180} gradientUnits="userSpaceOnUse"><stop offset="0" stopColor="#2E2826" /><stop offset="0.5" stopColor="#4E4440" /><stop offset="1" stopColor="#7A6050" /></linearGradient>
</>;
