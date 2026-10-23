import React from 'react';
import {AbsoluteFill, Composition, registerRoot, useCurrentFrame} from 'remotion';
import {W, H, SERIF, SANS, LAT, LATS, GOLD, CYAN, VIOLET, RED, rnd, circ, poly, ridge, G, Luoshu, Penta, Taijitu, Girih, Solid, Mandala, Giant, Label, Subs, SANDC, Rosette} from './circle40parts';
import {MANDEL} from './mandel';

/* ep40 《同一个圆》 key frames v2 — the walker is the hero (the 为什么 reference's core principle).
   Each era: one person walks left→right through their own world, big (≈40 % of frame height); the circle is a
   supporting prop in that world (on a turtle's shell, in the stars, on a wall, in a window, in a hand, on a platform). */
import {GR, Walker, Look} from './walker';
type V = [number, number];
const LOOKS: Record<string, Look> = {
	yu: {robe: 'long', head: 'douli', beard: 'short', carry: 'spade'},
	pyth: {robe: 'long', head: 'greek', beard: 'long', carry: 'staff'},
	zhou: {robe: 'long', head: 'songcap', beard: 'long', carry: 'book'},
	isf: {robe: 'long', head: 'turban', beard: 'short', carry: 'tile'},
	vin: {robe: 'knee', head: 'beret', carry: 'book'},
	kep: {robe: 'knee', head: 'kepler', beard: 'point', ruff: true, cape: true, carry: 'model'},
	monk: {robe: 'long', head: 'monk', carry: 'vase'},
	man: {robe: 'jacket', head: 'suit', carry: 'paper'},
};

/* ---------- worlds: flat layered illustration, one per era ---------- */
const grad = (id: string, stops: [number, string][]) => <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">{stops.map(([o, c], i) => <stop key={i} offset={o} stopColor={c} />)}</linearGradient>;
const Stars: React.FC<{n?: number; maxY?: number; op?: number}> = ({n = 120, maxY = 600, op = 1}) => <g opacity={op}>{Array.from({length: n}, (_, i) => <circle key={i} cx={rnd(i, 50) * W} cy={rnd(i, 51) * maxY} r={0.6 + 1.5 * rnd(i, 52)} fill="#eef" opacity={0.15 + 0.5 * rnd(i, 53)} />)}</g>;
const Lamp: React.FC<{x: number; y?: number; h?: number}> = ({x, y = GR, h = 170}) => <g><rect x={x - 3} y={y - h} width={6} height={h} fill="#0b0a12" /><circle cx={x} cy={y - h - 8} r={9} fill="#ffd58a" /><circle cx={x} cy={y - h - 8} r={50} fill="#ffb44a" opacity={0.25} filter="url(#gL)" /></g>;
const Willow: React.FC<{x: number; y: number; s?: number; c?: string}> = ({x, y, s = 1, c = '#070b12'}) => <g transform={`translate(${x},${y}) scale(${s})`}><path d="M-8,0 Q-14,-120 -4,-230 L8,-230 Q4,-120 10,0 Z" fill={c} />
	{Array.from({length: 26}, (_, i) => { const a = -160 + i * 12; return <path key={i} d={`M${a * 0.4},-225 Q${a * 0.9},-200 ${a * 1.05 + 10 * rnd(i, 60)},${-60 - 70 * rnd(i, 61)}`} stroke={c} strokeWidth={3} fill="none" />; })}</g>;

const World: React.FC<{k: string; T?: number}> = ({k, T = 0}) => {
	switch (k) {
		case 'luo': return <g>
			{grad('sLuo', [[0, '#071321'], [0.6, '#173149'], [1, '#2f5068']])}
			<rect width={W} height={H} fill="url(#sLuo)" /><Stars maxY={520} />
			<circle cx={1520} cy={170} r={58} fill="#f3ead2" /><circle cx={1520} cy={170} r={150} fill="#f3ead2" opacity={0.12} filter="url(#gL)" />
			<path d={ridge(2, 700, 120, 28)} fill="#1c3449" /><path d={ridge(7, 740, 60, 22)} fill="#132638" />
			<rect x={0} y={740} width={W} height={GR - 740} fill="#0c1d2c" />
			{Array.from({length: 18}, (_, i) => <line key={i} x1={1520 - 40 - 90 * rnd(i, 70)} x2={1520 + 40 + 90 * rnd(i, 71)} y1={752 + i * 7} y2={752 + i * 7} stroke="#f3ead2" strokeWidth={2} opacity={0.35 - i * 0.015} />)}
			{/* the turtle surfaces; the 洛书 rises off its shell */}
			<g transform="translate(1250,800)"><ellipse rx={150} ry={40} fill="#0c1d2c" /><path d="M-120,0 Q-110,-70 0,-76 Q110,-70 120,0 Z" fill="#06101a" />
				{[-75, -25, 25, 75].map((x2) => <path key={x2} d={`M${x2 - 24},-14 L${x2 - 15},-48 L${x2 + 15},-48 L${x2 + 24},-14 Z`} fill="none" stroke={GOLD} strokeWidth={1.8} opacity={0.75} />)}
				<path d="M120,-10 Q160,-30 175,-14 Q165,0 125,0 Z" fill="#06101a" /><circle cx={162} cy={-18} r={3} fill={GOLD} />
				<path d="M-40,-76 L-140,-380 L140,-380 L40,-76 Z" fill={GOLD} opacity={0.08} />
				<g transform="translate(0,-330)"><Luoshu s={0.36} /></g></g>
			<Willow x={180} y={GR} s={1.3} />
			<rect x={0} y={GR} width={W} height={H - GR} fill="#05080d" />
			{Array.from({length: 30}, (_, i) => <path key={i} d={`M${1700 + i * 7},${GR + 4} Q${1704 + i * 7},${GR - 60} ${1700 + i * 7 + 16 * rnd(i, 72)},${GR - 90 - 50 * rnd(i, 73)}`} stroke="#05080d" strokeWidth={3} fill="none" />)}
		</g>;
		case 'gre': return <g>
			{grad('sGre', [[0, '#2f4f7d'], [0.55, '#c98d6a'], [0.8, '#f1c48c'], [1, '#f6d9a8']])}
			<rect width={W} height={H} fill="url(#sGre)" />
			<circle cx={1560} cy={690} r={70} fill="#fff1cf" /><circle cx={1560} cy={690} r={220} fill="#ffd79a" opacity={0.35} filter="url(#gL)" />
			{/* the pentagram appears in the first stars */}
			<g transform="translate(1340,250)" opacity={0.95}><Penta s={0.42} /></g>
			<rect x={0} y={700} width={W} height={60} fill="#3d6688" />
			{Array.from({length: 22}, (_, i) => <line key={i} x1={1560 - 50 - 140 * rnd(i, 80)} x2={1560 + 50 + 140 * rnd(i, 81)} y1={706 + i * 2.5} y2={706 + i * 2.5} stroke="#fff1cf" strokeWidth={1.6} opacity={0.6 - i * 0.025} />)}
			<path d={`M1050,760 Q1300,640 1600,620 Q1800,615 ${W},640 L${W},${GR} L1050,${GR} Z`} fill="#a88f74" />
			<g transform="translate(1580,622)"><rect x={-150} y={-14} width={300} height={16} fill="#e9dcc3" /><rect x={-140} y={-26} width={280} height={12} fill="#d9c9ad" />
				{Array.from({length: 6}, (_, i) => <rect key={i} x={-122 + i * 46} y={-120} width={16} height={96} fill="#efe3cc" />)}<rect x={-140} y={-140} width={280} height={20} fill="#e9dcc3" /><path d="M-150,-140 L0,-196 L150,-140 Z" fill="#dccdb0" /></g>
			{[[260, 70, 90], [380, 100, 70], [520, 80, 110], [880, 120, 80], [1000, 90, 100]].map(([x, w2, h2], i) => <g key={i}><rect x={x} y={GR - 40 - h2} width={w2} height={h2} fill="#efe6d4" /><rect x={x + w2 * 0.6} y={GR - 40 - h2} width={w2 * 0.4} height={h2} fill="#d2c3a6" /><rect x={x + 14} y={GR - 40 - h2 + 24} width={12} height={18} fill="#4a5f7a" /></g>)}
			{[700, 1180, 1250].map((x, i) => <g key={x}><ellipse cx={x} cy={GR - 120 - i * 8} rx={20} ry={90} fill="#24331f" /></g>)}
			<rect x={0} y={GR - 40} width={W} height={40} fill="#cdb895" />
			<rect x={0} y={GR} width={W} height={H - GR} fill="#2b2118" />
		</g>;
		case 'zhou': return <g>
			{grad('sZhou', [[0, '#3f4c5f'], [0.65, '#a7b0b6'], [1, '#d7d5cc']])}
			<rect width={W} height={H} fill="url(#sZhou)" />
			{/* the moon is the first circle — 无极; the rest of the 太极图 hangs below it */}
			<g transform="translate(1480,360)" opacity={0.9}><Taijitu s={0.5} /></g>
			<path d={ridge(3, 640, 200, 22)} fill="#8995a1" opacity={0.9} filter="url(#gS)" /><path d={ridge(11, 700, 150, 20)} fill="#64707d" />
			<path d={ridge(5, 760, 90, 18)} fill="#3d4652" />
			<rect x={0} y={770} width={W} height={GR - 770} fill="#7d8b95" />
			{Array.from({length: 16}, (_, i) => { const x = 980 + i * 52 + 20 * rnd(i, 90), y = 790 + 70 * rnd(i, 91); return <g key={i}><ellipse cx={x} cy={y} rx={34} ry={9} fill="#2f3e33" />{i % 3 === 0 && <path d={`M${x},${y} L${x + 2},${y - 50} M${x + 2},${y - 50} q-10,-14 0,-30 q10,16 0,30`} stroke="#2f3e33" strokeWidth={2} fill="#e9a3b4" />}</g>; })}
			<g transform="translate(1250,770)" fill="#2a3038"><path d="M-120,4 L-60,-50 L80,-46 L130,4 Z" /><g transform="translate(0,-50)"><rect x={-44} y={-70} width={7} height={70} /><rect x={38} y={-70} width={7} height={70} /><path d="M-95,-66 Q-50,-80 0,-108 Q50,-80 95,-66 Q106,-60 114,-74 L88,-58 L-88,-58 L-114,-74 Q-106,-60 -95,-66 Z" /></g></g>
			<path d={`M0,${GR} L0,800 Q100,780 220,820 L380,${GR} Z`} fill="#2a3038" />
			<rect x={0} y={GR} width={W} height={H - GR} fill="#14181d" />
		</g>;
		case 'isf': return <g>
			{grad('sIsf', [[0, '#0b1d33'], [0.55, '#5b4a6e'], [0.85, '#e08a5a'], [1, '#f2b880']])}
			<rect width={W} height={H} fill="url(#sIsf)" /><Stars maxY={300} op={0.7} />
			
			{/* dome + minarets far right, the portal with the girih panel mid */}
			<g transform={`translate(1650,${GR - 40})`}><rect x={-130} y={-170} width={260} height={170} fill="#2b2633" /><path d="M-150,-170 C-150,-290 -40,-340 0,-410 C40,-340 150,-290 150,-170 Z" fill="#1f7f92" />
				{Array.from({length: 7}, (_, i) => <path key={i} d={`M${-150 + i * 50},-170 Q${-100 + i * 33},-300 0,-410`} stroke="#9fe0e8" strokeWidth={1.4} fill="none" opacity={0.5} />)}</g>
			{[1400, 1900].map((x) => <g key={x}><rect x={x - 14} y={GR - 420} width={28} height={380} fill="#2b2633" /><rect x={x - 20} y={GR - 380} width={40} height={12} fill="#1f7f92" /><path d={`M${x - 16},${GR - 420} L${x},${GR - 470} L${x + 16},${GR - 420} Z`} fill="#1f7f92" /></g>)}
			<g transform={`translate(1100,${GR - 40})`}><rect x={-260} y={-520} width={520} height={520} fill="#3a2f3c" /><g transform="translate(0,-250) scale(0.62)"><Girih s={1} /></g>
				<rect x={-260} y={-540} width={520} height={24} fill="#2b2633" /></g>
			<rect x={0} y={GR - 40} width={W} height={40} fill="#4a3a3a" />
			{[300, 420].map((x, i) => <g key={x} transform={`translate(${x},${GR - 40})`}><path d={`M-5,0 Q${6 - i * 10},-110 ${4 - i * 6},-210 L${12 - i * 6},-210 Q${12 - i * 8},-110 5,0 Z`} fill="#140f16" />
				{[0, 60, 120, 180, 240, 300].map((a) => <path key={a} transform={`translate(${8 - i * 6},-210) rotate(${a})`} d="M0,0 Q36,-16 76,8 Q36,-4 0,0 Z" fill="#140f16" />)}</g>)}
			<rect x={0} y={GR} width={W} height={H - GR} fill="#140f16" />
		</g>;
		case 'vin': return <g>
			{grad('sVin', [[0, '#2a2442'], [0.6, '#b8705a'], [1, '#f2aa62']])}
			<rect width={W} height={H} fill="url(#sVin)" />
			{/* the Duomo far behind */}
			<g transform={`translate(1500,${GR - 40})`} fill="#4a2f3c"><rect x={-300} y={-170} width={600} height={170} /><path d="M-300,-170 L0,-230 L300,-170 Z" />
				{Array.from({length: 17}, (_, i) => { const x = -288 + i * 36, h2 = 70 + (i % 2) * 34 + (i === 8 ? 150 : 0); return <path key={i} d={`M${x - 6},-170 L${x},${-170 - h2} L${x + 6},-170 Z`} />; })}</g>
			{/* the workshop: a lit window with the drawing pinned up */}
			<g transform={`translate(860,${GR - 40})`}><rect x={-240} y={-470} width={480} height={470} fill="#2c1f22" /><path d="M-260,-470 L0,-540 L260,-470 Z" fill="#22171a" />
				<rect x={-170} y={-420} width={340} height={300} fill="#ffcf8a" /><rect x={-170} y={-420} width={340} height={300} fill="#ffb15a" opacity={0.5} filter="url(#gL)" />
				<g transform="translate(0,-270)"><rect x={-110} y={-130} width={220} height={240} fill="#f1e2bf" />
					<g transform="scale(0.36)"><rect x={-280} y={-280} width={560} height={560} fill="none" stroke="#6b4a2a" strokeWidth={4} /><circle cy={-56} r={336} fill="none" stroke="#6b4a2a" strokeWidth={4} />
						<path d="M-280,-180 L280,-180 M-18,280 L-12,10 M18,280 L12,10 M-160,-330 L0,-180 L160,-330 M-150,250 L0,10 L150,250" stroke="#6b4a2a" strokeWidth={8} fill="none" strokeLinecap="round" /><rect x={-30} y={-200} width={60} height={210} rx={22} fill="#6b4a2a" /><circle cy={-240} r={36} fill="#6b4a2a" /></g></g>
				<path d="M-170,-270 L170,-270 M0,-420 L0,-120" stroke="#2c1f22" strokeWidth={10} opacity={0.0} />
				<rect x={-60} y={-110} width={120} height={110} fill="#1b1215" /></g>
			<Lamp x={1180} y={GR - 40} h={200} />
			<rect x={0} y={GR - 40} width={W} height={40} fill="#3a2a26" />
			<rect x={0} y={GR} width={W} height={H - GR} fill="#140d0c" />
		</g>;
		case 'kep': return <g>
			{grad('sKep', [[0, '#03061a'], [0.7, '#141d4a'], [1, '#2c3a72']])}
			<rect width={W} height={H} fill="url(#sKep)" /><Stars n={220} maxY={760} />
			{/* the sky's orbits: circles he believed in, one already pulling into an ellipse */}
			<g transform="translate(1250,330)">{[120, 200, 290].map((r) => <circle key={r} r={r} fill="none" stroke="#cfd8ff" strokeWidth={1.4} opacity={0.25} />)}
				<ellipse cx={30} rx={390} ry={330} fill="none" stroke={RED} strokeWidth={3} strokeDasharray="14 10" opacity={0.85} /><circle r={26} fill="#ffd77a" /><circle r={80} fill="#ffb44a" opacity={0.25} filter="url(#gL)" />
				<circle cx={420} cy={-12} r={9} fill="#9fd0ff" /></g>
			<path d={`M1050,${GR - 40} Q1250,${GR - 220} 1450,${GR - 230} Q1650,${GR - 220} 1850,${GR - 40} Z`} fill="#0a0d22" />
			<g transform={`translate(1450,${GR - 228})`} fill="#0a0d22"><rect x={-30} y={-130} width={60} height={130} /><path d="M-40,-130 L0,-190 L40,-130 Z" /><circle cy={-95} r={18} fill="#ffd77a" opacity={0.9} /></g>
			{Array.from({length: 22}, (_, i) => { const x = 40 + i * 52, h2 = 40 + 50 * rnd(i, 95); return <g key={i}><path d={`M${x - 26},${GR - 40} L${x - 26},${GR - 40 - h2} L${x},${GR - 40 - h2 - 30} L${x + 26},${GR - 40 - h2} L${x + 26},${GR - 40} Z`} fill="#0a0d22" />{rnd(i, 96) > 0.5 && <rect x={x - 6} y={GR - 40 - h2 + 14} width={10} height={14} fill="#ffcf7a" opacity={0.8} />}</g>; })}
			<Lamp x={300} y={GR - 40} h={150} />
			<rect x={0} y={GR - 40} width={W} height={40} fill="#0c1028" />
			<rect x={0} y={GR} width={W} height={H - GR} fill="#05060f" />
		</g>;
		case 'sand': return <g>
			{grad('sSand', [[0, '#26335f'], [0.5, '#b98aa6'], [0.85, '#f3c49a'], [1, '#f7d9b4']])}
			<rect width={W} height={H} fill="url(#sSand)" />
			<path d={`M0,620 L220,330 L360,470 L560,250 L760,500 L900,620 Z`} fill="#8f7fa6" /><path d={`M220,330 L262,390 L232,384 L196,362 Z M560,250 L612,322 L572,312 L528,290 Z`} fill="#fbe7dc" />
			<path d={`M900,640 L1150,360 L1320,500 L1520,300 L1740,520 L${W},430 L${W},660 Z`} fill="#8f7fa6" /><path d={`M1520,300 L1574,374 L1530,364 L1486,340 Z M1150,360 L1190,414 L1160,408 L1126,390 Z`} fill="#fbe7dc" />
			<path d={ridge(13, 700, 70, 26)} fill="#6d5a7e" />
			{/* the monastery: white walls, red band */}
			<g transform={`translate(1450,${GR - 40})`}><path d="M-300,0 L-280,-190 L280,-190 L300,0 Z" fill="#efe4d2" /><rect x={-282} y={-214} width={564} height={26} fill="#8a2a22" />
				<path d="M-180,-214 L-168,-300 L168,-300 L180,-214 Z" fill="#e6dac6" /><rect x={-170} y={-322} width={340} height={22} fill="#8a2a22" /><rect x={-26} y={-372} width={52} height={50} fill="#d9a441" />
				{Array.from({length: 11}, (_, i) => <path key={i} d={`M${-250 + i * 50},-120 l14,0 l3,40 l-20,0 Z`} fill="#2a1d1a" />)}</g>
			{/* the mandala on its platform, being swept */}
			<g transform={`translate(1000,${GR - 30})`}><path d="M-250,0 L-230,-30 L230,-30 L250,0 Z" fill="#5a3a2a" /><g transform="translate(0,-34) scale(1,0.3)"><Mandala s={0.62} swept={0.42} /></g>
				<ellipse cy={-40} rx={240} ry={70} fill="#ffcf8a" opacity={0.18} filter="url(#gL)" /></g>
			{[[200, 560, 700, 600], [1100, 520, 1800, 560]].map(([x1, y1, x2, y2], j) => <g key={j}><path d={`M${x1},${y1} Q${(x1 + x2) / 2},${y2 + 60} ${x2},${y2}`} stroke="#3a2f40" strokeWidth={1.5} fill="none" />
				{Array.from({length: 16}, (_, i) => { const u = (i + 0.5) / 16, x = x1 + (x2 - x1) * u, y = y1 + (y2 - y1) * u + 4 * 60 * u * (1 - u) * 0.5 + 15 * Math.sin(Math.PI * u); return <path key={i} d={`M${x - 9},${y} L${x + 9},${y} L${x},${y + 20} Z`} fill={['#2f5fb3', '#efe6d2', '#c8372d', '#2e9a5e', '#e8b830'][i % 5]} opacity={0.85} />; })}</g>)}
			<rect x={0} y={GR - 40} width={W} height={40} fill="#7a604e" />
			<rect x={0} y={GR} width={W} height={H - GR} fill="#2a1d18" />
		</g>;
		case 'man': return <g>
			{grad('sMan', [[0, '#03061a'], [0.7, '#1a1640'], [1, '#3a2456']])}
			<rect width={W} height={H} fill="url(#sMan)" /><Stars n={140} maxY={600} />
			<g transform="translate(1440,300)"><circle r={260} fill="#ffcf8a" opacity={0.08} filter="url(#gL)" /><image href={MANDEL.full} x={-260} y={-213} width={520} height={426} /></g>
			{/* the coast: a jagged edge measured with ever-shorter rulers */}
			{(() => { const pts = Array.from({length: 61}, (_, i) => [i * 9, 560 + 220 * (i / 60) + 26 * Math.sin(i * 1.7) * rnd(i, 99) + 14 * Math.sin(i * 5.3)] as V); const d = `M0,${H} L` + pts.map((q) => q.join(',')).join(' L') + ` L540,${H} Z`;
				return <g><path d={d} fill="#0b0a18" /><path d={'M' + pts.map((q) => q.join(',')).join(' L')} fill="none" stroke={GOLD} strokeWidth={2} opacity={0.9} /><path d={'M' + pts.filter((_, i) => i % 10 === 0).map((q) => q.join(',')).join(' L')} fill="none" stroke={CYAN} strokeWidth={3} strokeDasharray="1 0" opacity={0.8} />
					{pts.filter((_, i) => i % 10 === 0).map((q, i) => <circle key={i} cx={q[0]} cy={q[1]} r={5} fill={CYAN} />)}</g>; })()}
			{Array.from({length: 24}, (_, i) => { const x = 800 + i * 46, w2 = 34 + 14 * rnd(i, 10), h2 = 80 + 260 * rnd(i, 11) * (1 - Math.abs(i - 12) / 18); return <g key={i}><rect x={x} y={GR - 40 - h2} width={w2} height={h2} fill="#0b0a18" />
				{Array.from({length: Math.floor(h2 / 22)}, (_, r) => Array.from({length: 2}, (_, c) => rnd(i * 31 + r * 3 + c, 12) > 0.55 ? <rect key={`${r}${c}`} x={x + 6 + c * (w2 / 2)} y={GR - 40 - h2 + 10 + r * 22} width={7} height={9} fill="#ffd77a" opacity={0.75} /> : null))}</g>; })}
			<text x={1180} y={GR - 330} style={{fontFamily: LAT, fontWeight: 900, fontSize: 30, letterSpacing: '0.2em'}} fill="#5a7ad0" opacity={0.85}>IBM</text>
			<Lamp x={700} y={GR - 40} h={160} />
			<rect x={0} y={GR - 40} width={W} height={40} fill="#151230" />
			<rect x={0} y={GR} width={W} height={H - GR} fill="#05040c" />
		</g>;
		default: return <g>
			{grad('sOpen', [[0, '#05030c'], [0.7, '#1a1236'], [1, '#2c1d4a']])}
			<rect width={W} height={H} fill="url(#sOpen)" /><Stars n={200} maxY={800} />
			<rect x={0} y={GR} width={W} height={H - GR} fill="#05040a" /><rect x={0} y={GR - 60} width={W} height={60} fill={GOLD} opacity={0.06} filter="url(#gL)" />
		</g>;
	}
};

/** all eight walkers in one line — the bookend */
const Procession: React.FC<{h?: number; x0?: number; gap?: number; p?: number}> = ({h = 300, x0 = 330, gap = 180, p = 0.2}) => <g>
	{['yu', 'pyth', 'zhou', 'isf', 'vin', 'kep', 'monk', 'man'].map((k, i) => <Walker key={k} x={x0 + i * gap} h={h} p={(p + i * 0.37) % 1} look={LOOKS[k]} col="#07060c" far="#16131f" />)}
</g>;

type KF = {world: string; label?: [string, string]; nat?: string; zh?: string; rtl?: boolean; lat?: string; walker?: string; p?: number; wx?: number; extra?: React.ReactNode; over?: React.ReactNode; title: string; blur?: boolean};
const FR: KF[] = [
	{world: 'open', extra: <g><g transform="translate(960,360) scale(0.62)"><Giant T={0.3} /></g><Procession /></g>, zh: '几千年来，人类一直在画同一个圆。', title: '冷开场 0:00'},
	{world: 'kep', walker: 'kep', p: 0.62, wx: 760, label: ['1596', '开普勒 · 格拉茨'], blur: true, title: '倒带 0:05',
		over: <g><rect width={W} height={H} fill="#000" opacity={0.2} />{Array.from({length: 14}, (_, i) => <rect key={i} x={0} y={rnd(i, 30) * H} width={W} height={2 + 6 * rnd(i, 31)} fill="#fff" opacity={0.1 + 0.1 * rnd(i, 32)} />)}
			<text x={W - 120} y={190} textAnchor="end" style={{fontFamily: LAT, fontWeight: 900, fontSize: 150}} fill="#fff">1596</text>
			<text x={W - 120} y={250} textAnchor="end" style={{fontFamily: SANS, fontWeight: 700, fontSize: 40}} fill={GOLD}>◀◀  1980 → 传说</text></g>},
	{world: 'luo', walker: 'yu', p: 0.15, wx: 700, label: ['传说', '大禹 · 洛水'], nat: '二九四，七五三，六一八。', lat: SANS, zh: '横、竖、斜，加起来都是十五。', title: '1 洛书'},
	{world: 'gre', walker: 'pyth', p: 0.55, wx: 700, label: ['约公元前 500 年', '毕达哥拉斯学派'], nat: 'Ἆρα πάντα ἀριθμός;', lat: LATS, zh: '万物，都是数吗？', title: '2 毕达哥拉斯'},
	{world: 'zhou', walker: 'zhou', p: 0.3, wx: 720, label: ['约 1070 年', '周敦颐'], nat: '无极而太极。', lat: SANS, zh: '一个圆，从「无」里转出来。', title: '3 周敦颐'},
	{world: 'isf', walker: 'isf', p: 0.7, wx: 560, label: ['1453 年', '伊斯法罕 · 伊玛目礼拜堂'], nat: 'آیا می‌شود بی‌نهایت را روی دیوار کشید؟', rtl: true, zh: '能把「无限」画在墙上吗？', title: '4 伊斯法罕'},
	{world: 'vin', walker: 'vin', p: 0.2, wx: 300, label: ['约 1490 年', '达·芬奇 · 米兰'], nat: "L'uomo sta nel cerchio, o nel quadrato?", lat: LATS, zh: '人，是在圆里，还是在方里？', title: '5 达·芬奇'},
	{world: 'kep', walker: 'kep', p: 0.62, wx: 760, label: ['1596 年', '开普勒 · 格拉茨'], nat: 'Hat Gott die Welt nach Geometrie gebaut?', lat: LATS, zh: '上帝，是照着几何造的世界吗？', title: '6 开普勒'},
	{world: 'sand', walker: 'monk', p: 0.35, wx: 520, label: ['延续至今', '藏地 · 沙坛城'], zh: '画了几周的阵，几秒钟就扫掉。', title: '7 沙坛城（静音）'},
	{world: 'man', walker: 'man', p: 0.45, wx: 640, label: ['1980 年', '曼德博 · IBM'], nat: 'How long is the coast of Britain?', lat: LATS, zh: '一条海岸线，到底有多长？', title: '8 曼德博'},
	{world: 'open', extra: <g>
		<g transform="translate(960,700)"><rect x={-240} y={-900} width={480} height={900} fill="url(#pillarX)" opacity={0.5} />{[0, 1, 2, 3, 4].map((j) => <g key={j} transform={`translate(0,${-90 - j * 110}) scale(${0.62 - j * 0.07},${(0.62 - j * 0.07) * 0.34}) rotate(${j * 17})`} opacity={1 - j * 0.12}><Giant T={j} /></g>)}</g>
		<Procession p={0.0} /></g>, zh: '几千年来，人类一直在画同一个圆。', title: '叠阵 DROP 1:33'},
	{world: 'open', extra: <g><g transform="translate(960,330) scale(0.5)" opacity={0.5}><Giant T={1} /></g><Procession h={220} x0={560} gap={115} /></g>, title: '结尾 2:03',
		over: <g><text x={960} y={330} textAnchor="middle" style={{fontFamily: SERIF, fontWeight: 900, fontSize: 72}} fill="#fff" stroke="#000" strokeWidth={8} paintOrder="stroke">如果你能画一个阵，</text>
			<text x={960} y={430} textAnchor="middle" style={{fontFamily: SERIF, fontWeight: 900, fontSize: 72}} fill={GOLD} stroke="#000" strokeWidth={8} paintOrder="stroke">你会把什么画进去？</text></g>},
];

export const Circle40Walk: React.FC = () => {
	const f = useCurrentFrame(), k = FR[Math.min(FR.length - 1, f)];
	return <AbsoluteFill style={{background: '#020104'}}>
		<svg width={W} height={H}>
			<defs>
				<filter id="gM" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="7" /></filter>
				<filter id="gL" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="40" /></filter>
				<filter id="gS" x="-5%" y="-20%" width="110%" height="140%"><feGaussianBlur stdDeviation="3" /></filter>
				<filter id="rew" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="10 0" /></filter>
				<radialGradient id="core"><stop offset="0" stopColor="#fff6dc" /><stop offset="0.25" stopColor={GOLD} stopOpacity="0.8" /><stop offset="1" stopColor={GOLD} stopOpacity="0" /></radialGradient>
				<linearGradient id="pillarX" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor={GOLD} stopOpacity="0" /><stop offset="0.5" stopColor="#fff2c8" stopOpacity="0.8" /><stop offset="1" stopColor={GOLD} stopOpacity="0" /></linearGradient>
			</defs>
			<g filter={k.blur ? 'url(#rew)' : undefined}>
				<World k={k.world} />
				{k.extra}
				{k.walker && <Walker x={k.wx ?? 700} h={440} p={k.p ?? 0.2} look={LOOKS[k.walker]} T={0.4} />}
			</g>
			{k.label && <Label year={k.label[0]} name={k.label[1]} />}
			{k.zh && <Subs nat={k.nat} zh={k.zh} rtl={k.rtl} lat={k.lat} />}
			{k.over}
			<text x={W - 40} y={H - 30} textAnchor="end" style={{fontFamily: SANS, fontSize: 22}} fill="#fff" opacity={0.35}>{k.title}</text>
		</svg>
	</AbsoluteFill>;
};
registerRoot(() => <Composition id="KF40W" component={Circle40Walk} durationInFrames={12} fps={30} width={W} height={H} />);
void VIOLET; void poly;
