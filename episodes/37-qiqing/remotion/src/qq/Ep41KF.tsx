import React from 'react';
import {AbsoluteFill, Composition, registerRoot, useCurrentFrame} from 'remotion';
import {W, H, SERIF, SANS, LAT, LATS, GOLD, CYAN, RED, rnd, ridge, Label, Subs} from './circle40parts';
import {GR, Walker, Look} from './walker';

/* ep41 《为了跟你说一句话，人类努力了三千年》 key frames. The walker is the hero; each era's "sentence" is the prop
   that travels (carved bone → letter → wire → sound line → wire → wave → screen → email → golden record). */
const LOOKS: Record<string, Look> = {
	shang: {robe: 'long', head: 'bun', beard: 'short', carry: 'bone'},
	du: {robe: 'long', head: 'futou', beard: 'long', carry: 'letter'},
	morse: {robe: 'knee', head: 'tophat', carry: 'tape'},
	scott: {robe: 'knee', head: 'short', beard: 'short', carry: 'none'},
	bell: {robe: 'knee', head: 'short', beard: 'short', carry: 'none'},
	watson: {robe: 'none', head: 'short', carry: 'none'},
	marconi: {robe: 'knee', head: 'cap', carry: 'none'},
	kline: {robe: 'none', head: 'short', carry: 'paper'},
	bj: {robe: 'jacket', head: 'suit', carry: 'disk'},
};
const grad = (id: string, stops: [number, string][]) => <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">{stops.map(([o, c], i) => <stop key={i} offset={o} stopColor={c} />)}</linearGradient>;
const Stars: React.FC<{n?: number; maxY?: number; op?: number}> = ({n = 120, maxY = 600, op = 1}) => <g opacity={op}>{Array.from({length: n}, (_, i) => <circle key={i} cx={rnd(i, 50) * W} cy={rnd(i, 51) * maxY} r={0.6 + 1.5 * rnd(i, 52)} fill="#eef" opacity={0.15 + 0.5 * rnd(i, 53)} />)}</g>;
const Glow: React.FC<{x: number; y: number; r: number; c?: string; o?: number}> = ({x, y, r, c = '#ffb44a', o = 0.3}) => <circle cx={x} cy={y} r={r} fill={c} opacity={o} filter="url(#gL)" />;
const Lamp: React.FC<{x: number; y?: number; h?: number}> = ({x, y = GR - 40, h = 180}) => <g><rect x={x - 3} y={y - h} width={6} height={h} fill="#0b0a12" /><path d={`M${x - 12},${y - h - 2} L${x + 12},${y - h - 2} L${x + 8},${y - h - 26} L${x - 8},${y - h - 26} Z`} fill="#ffd58a" /><Glow x={x} y={y - h - 14} r={60} /></g>;
const Pole: React.FC<{x: number; h?: number; y?: number; c?: string}> = ({x, h = 300, y = GR - 40, c = '#0b0a12'}) => <g fill={c}><rect x={x - 4} y={y - h} width={8} height={h} /><rect x={x - 30} y={y - h + 14} width={60} height={6} /></g>;
const Wire: React.FC<{pts: [number, number][]; pulse?: number; col?: string; sag?: number}> = ({pts, pulse = -1, col = GOLD, sag = 26}) => {
	const d = pts.slice(1).map((q, i) => { const a = pts[i]; return `M${a[0]},${a[1]} Q${(a[0] + q[0]) / 2},${(a[1] + q[1]) / 2 + sag} ${q[0]},${q[1]}`; }).join(' ');
	return <g><path d={d} stroke="#0b0a12" strokeWidth={2} fill="none" />{pulse >= 0 && <path d={d} stroke={col} strokeWidth={3} fill="none" strokeDasharray="10 14 34 14" opacity={0.9} filter="url(#gS)" />}</g>;
};
/** the shared ground: a darker walking strip + the subtitle band */
const Ground: React.FC<{top: string; band: string}> = ({top, band}) => <><rect x={0} y={GR - 40} width={W} height={40} fill={top} /><rect x={0} y={GR} width={W} height={H - GR} fill={band} /></>;

const World: React.FC<{k: string}> = ({k}) => {
	switch (k) {
		case 'shang': return <g>
			{grad('s1', [[0, '#07060f'], [0.6, '#21142a'], [1, '#5a2a1e']])}<rect width={W} height={H} fill="url(#s1)" /><Stars maxY={560} />
			{/* the question carved on a plastron hangs in the sky like a moon */}
			<g transform="translate(1440,290)"><Glow x={0} y={0} r={240} c="#ffcf8a" o={0.18} />
				<path d="M-150,-190 Q-170,0 -120,170 Q0,220 120,170 Q170,0 150,-190 Q0,-230 -150,-190 Z" fill="#e3d2a8" />
				<path d="M0,-210 L0,200 M-150,-60 L150,-60 M-140,60 L140,60" stroke="#b49a6c" strokeWidth={2} />
				<path d="M-60,-150 l0,40 l22,-14 M70,-20 l0,36 l-20,-10 M-80,90 l0,34 l18,-8" stroke="#5a3a20" strokeWidth={3} fill="none" />
				{[['其', 40, -120], ['自', 40, -55], ['東', 40, 10], ['來', -60, -120], ['雨', -60, -55]].map(([c2, x, y]) => <text key={c2 as string} x={x as number} y={y as number} textAnchor="middle" style={{fontFamily: SERIF, fontWeight: 300, fontSize: 54}} fill="#6b3a1a">{c2}</text>)}
				<text x={-120} y={150} style={{fontFamily: SANS, fontSize: 22}} fill="#8a6a44">龟腹甲 · 卜辞</text></g>
			<path d={ridge(4, 700, 80, 30)} fill="#140c18" />
			{/* rammed-earth hall + bronze ding + fire */}
			<g transform={`translate(400,${GR - 40})`} fill="#0d0810"><rect x={-220} y={-40} width={440} height={40} /><rect x={-180} y={-150} width={360} height={110} /><path d="M-230,-150 L0,-250 L230,-150 Z" /></g>
			<g transform={`translate(1150,${GR - 40})`}><Glow x={0} y={-60} r={160} c="#ff7a2a" o={0.45} /><path d="M-40,0 L-20,-60 L0,-20 L18,-90 L38,0 Z" fill="#ffb347" /><path d="M-22,0 L-8,-40 L6,-14 L16,-50 L26,0 Z" fill="#fff0b0" /></g>
			<g transform={`translate(1350,${GR - 40})`} fill="#0d0810"><path d="M-70,-20 L-60,-110 L60,-110 L70,-20 Z" /><rect x={-60} y={-20} width={14} height={20} /><rect x={46} y={-20} width={14} height={20} /><path d="M-50,-110 L-50,-140 L-36,-140 L-36,-110 M36,-110 L36,-140 L50,-140 L50,-110" /></g>
			<Ground top="#1a0f10" band="#0a0608" />
		</g>;
		case 'du': return <g>
			{grad('s2', [[0, '#2a1d3a'], [0.55, '#a4483a'], [1, '#e8935a']])}<rect width={W} height={H} fill="url(#s2)" />
			{/* beacon fires on the ridges — 烽火连三月 */}
			<path d={ridge(9, 640, 160, 26)} fill="#5a2a3a" />
			{[[260, 520], [780, 500], [1300, 480], [1700, 530]].map(([x, y], i) => <g key={i}><Glow x={x} y={y} r={80} c="#ff6a2a" o={0.5} /><path d={`M${x - 12},${y + 20} L${x},${y - 30} L${x + 12},${y + 20} Z`} fill="#ffb347" /><path d={`M${x},${y - 30} Q${x + 30},${y - 140} ${x - 10},${y - 260}`} stroke="#3a2030" strokeWidth={26} fill="none" opacity={0.5} strokeLinecap="round" /></g>)}
			{/* a broken city wall and spring blossoms — 国破山河在，城春草木深 */}
			<g fill="#2a1420"><path d={`M900,${GR - 40} L900,560 ${Array.from({length: 12}, (_, i) => `L${930 + i * 60},560 L${930 + i * 60},540 L${960 + i * 60},540 L${960 + i * 60},560`).join(' ')} L1620,560 L1620,640 L1560,700 L1500,620 L1460,${GR - 40} Z`} /></g>
			{[[1200, 640], [1700, 700], [300, 690]].map(([x, y], i) => <g key={i}><path d={`M${x},${GR - 40} Q${x + 10},${y + 40} ${x - 20},${y}`} stroke="#2a1420" strokeWidth={10} fill="none" />{Array.from({length: 40}, (_, j) => <circle key={j} cx={x - 20 + (rnd(j + i * 50, 3) - 0.5) * 220} cy={y - 10 + (rnd(j + i * 50, 4) - 0.5) * 120} r={6 + 6 * rnd(j, 5)} fill="#f4a6b8" opacity={0.85} />)}</g>)}
			<Ground top="#3a1c22" band="#140a0c" />
		</g>;
		case 'morse': return <g>
			{grad('s3', [[0, '#5a86b8'], [0.7, '#bcd3e6'], [1, '#efe6cf']])}<rect width={W} height={H} fill="url(#s3)" />
			{/* the 1844 Capitol: the low dome, before the iron one */}
			<g transform={`translate(1450,${GR - 40})`} fill="#7f8ea3"><rect x={-330} y={-140} width={660} height={140} /><rect x={-100} y={-200} width={200} height={60} /><path d="M-90,-200 Q0,-280 90,-200 Z" /><rect x={-8} y={-300} width={16} height={30} />
				{Array.from({length: 9}, (_, i) => <rect key={i} x={-90 + i * 20} y={-200} width={6} height={60} fill="#9aa8bb" />)}</g>
			{/* the line to Baltimore, carrying dots and dashes */}
			{[200, 560, 920, 1280, 1640].map((x, i) => <Pole key={x} x={x} h={330 - i * 20} c="#2a2e3a" />)}
			<Wire pts={[[200, GR - 370], [560, GR - 350], [920, GR - 330], [1280, GR - 310], [1640, GR - 290], [1990, GR - 280]]} pulse={1} />
			{['·', '—', '—', '·', '—', '·'].map((c2, i) => <text key={i} x={1000 + i * 46} y={GR - 360} style={{fontFamily: LAT, fontWeight: 900, fontSize: 46}} fill={GOLD} filter="url(#gS)">{c2}</text>)}
			<Ground top="#8a7a62" band="#1c1812" />
		</g>;
		case 'scott': return <g>
			{grad('s4', [[0, '#050818'], [0.7, '#1b2348'], [1, '#33406b']])}<rect width={W} height={H} fill="url(#s4)" /><Stars maxY={600} />
			{/* au clair de la lune: the moon, Notre-Dame, the Seine */}
			<circle cx={1500} cy={200} r={70} fill="#f6efd6" /><Glow x={1500} y={200} r={190} c="#f6efd6" o={0.18} />
			<g transform={`translate(1350,${GR - 120})`} fill="#0d1022"><rect x={-260} y={-300} width={110} height={300} /><rect x={-90} y={-300} width={110} height={300} /><rect x={-150} y={-200} width={60} height={200} /><rect x={20} y={-180} width={340} height={180} /><path d={'M200,-180 L210,-330 L220,-180 Z'} /></g>
			<rect x={0} y={GR - 120} width={W} height={80} fill="#121a36" />
			{Array.from({length: 16}, (_, i) => <line key={i} x1={1500 - 40 - 80 * rnd(i, 70)} x2={1500 + 40 + 80 * rnd(i, 71)} y1={GR - 112 + i * 5} y2={GR - 112 + i * 5} stroke="#f6efd6" strokeWidth={2} opacity={0.4 - i * 0.02} />)}
			{/* the sound, drawn as a line on soot-black paper, floating like a ribbon */}
			<g transform="translate(260,250) rotate(-6)"><rect x={0} y={-50} width={900} height={100} fill="#0a0a0c" stroke="#3a3a46" strokeWidth={2} />
				<path d={'M10,0 ' + Array.from({length: 220}, (_, i) => `L${10 + i * 4},${(Math.sin(i * 0.9) * 18 + Math.sin(i * 0.23) * 10) * (0.6 + 0.4 * Math.sin(i * 0.05))}`).join(' ')} stroke="#f2ead2" strokeWidth={2} fill="none" />
				<text x={0} y={84} style={{fontFamily: SANS, fontSize: 22}} fill="#aab" opacity={0.85}>声波描记 · 1860 年 4 月 9 日</text></g>
			{/* the phonautograph: a horn on a stand and a drum */}
			<g transform={`translate(1050,${GR - 40})`} fill="#0b0a12"><rect x={-6} y={-150} width={12} height={150} /><path d="M0,-170 L-130,-240 L-130,-100 Z" /><rect x={10} y={-200} width={120} height={60} rx={28} /><rect x={-60} y={-14} width={200} height={14} /></g>
			<Lamp x={1700} /><Ground top="#151a30" band="#05060c" />
		</g>;
		case 'bell': return <g>
			{/* a cross-section of the Exeter Place rooms: Bell left, Watson right, the wire through the wall */}
			<rect width={W} height={H} fill="#1b120e" />
			<rect x={60} y={120} width={880} height={GR - 160} fill="#3b2619" /><rect x={980} y={120} width={880} height={GR - 160} fill="#33211a" />
			{Array.from({length: 18}, (_, r) => Array.from({length: 26}, (_, c) => <rect key={`${r}${c}`} x={60 + c * 70 + (r % 2) * 35} y={120 + r * 40} width={66} height={36} fill="#000" opacity={0.06 + 0.04 * rnd(r * 30 + c, 7)} />))}
			<rect x={940} y={120} width={40} height={GR - 160} fill="#140c0a" />
			<rect x={300} y={240} width={180} height={230} fill="#0e1430" /><path d="M390,240 L390,470 M300,355 L480,355" stroke="#3b2619" strokeWidth={8} /><circle cx={440} cy={290} r={20} fill="#f6efd6" />
			<Glow x={720} y={300} r={140} /><Glow x={1600} y={300} r={120} />
			<g transform={`translate(720,${GR - 40})`} fill="#120b08"><rect x={-160} y={-160} width={320} height={14} /><rect x={-150} y={-146} width={12} height={146} /><rect x={138} y={-146} width={12} height={146} />
				<rect x={-10} y={-250} width={20} height={90} /><path d="M10,-250 L70,-282 L70,-218 Z" /><rect x={60} y={-200} width={70} height={40} /></g>
			<g transform={`translate(1500,${GR - 40})`} fill="#120b08"><rect x={-140} y={-160} width={280} height={14} /><rect x={-130} y={-146} width={12} height={146} /><rect x={118} y={-146} width={12} height={146} /><rect x={-50} y={-210} width={36} height={50} rx={6} /></g>
			<Wire pts={[[800, GR - 225], [1000, GR - 300], [1300, GR - 300], [1470, GR - 205]]} pulse={1} sag={10} />
			<rect x={0} y={GR - 40} width={W} height={40} fill="#2a1a12" /><rect x={0} y={GR} width={W} height={H - GR} fill="#0c0806" />
		</g>;
		case 'marconi': return <g>
			{grad('s6', [[0, '#1a2230'], [0.6, '#56677a'], [1, '#8796a2']])}<rect width={W} height={H} fill="url(#s6)" />
			{/* waves coming in over the Atlantic from the east, three dots */}
			<g transform="translate(2100,420)">{[300, 500, 700, 900, 1100].map((r, i) => <path key={r} d={`M${-r * 0.95},${-r * 0.31} A${r},${r} 0 0,0 ${-r * 0.95},${r * 0.31}`} stroke={CYAN} strokeWidth={3} fill="none" opacity={0.65 - i * 0.1} />)}</g>
			{['·', '·', '·'].map((c2, i) => <text key={i} x={1180 + i * 70} y={300} style={{fontFamily: LAT, fontWeight: 900, fontSize: 90}} fill={CYAN} filter="url(#gS)">{c2}</text>)}
			<text x={1240} y={360} style={{fontFamily: LATS, fontSize: 30}} fill="#e8f6ff" opacity={0.9}>“S”</text>
			<rect x={0} y={660} width={W} height={180} fill="#2a3644" />
			{Array.from({length: 30}, (_, i) => <path key={i} d={`M${rnd(i, 2) * W},${680 + rnd(i, 3) * 140} q20,-12 40,0`} stroke="#9fb4c4" strokeWidth={2} fill="none" opacity={0.5} />)}
			{/* Signal Hill: Cabot Tower, and the kite carrying the aerial */}
			<path d={`M0,${GR - 40} L0,610 Q300,560 640,600 L820,${GR - 40} Z`} fill="#141a22" />
			<g transform="translate(330,585)" fill="#141a22"><rect x={-50} y={-150} width={100} height={150} /><rect x={30} y={-200} width={36} height={60} />{[-50, -25, 0, 25].map((x) => <rect key={x} x={x} y={-166} width={14} height={16} />)}</g>
			<path d="M560,640 Q700,350 980,150" stroke="#0b0d12" strokeWidth={2} fill="none" /><path d="M960,120 L1010,150 L985,200 L940,165 Z" fill="#0b0d12" />
			<Ground top="#1e2630" band="#080a0e" />
		</g>;
		case 'arpa': return <g>
			<rect width={W} height={H} fill="#0b0f12" />
			{/* the UCLA computer room, 29 Oct 1969 */}
			{Array.from({length: 7}, (_, i) => <g key={i} transform={`translate(${900 + i * 140},${GR - 40})`}><rect x={0} y={-430} width={120} height={430} fill="#1a2128" stroke="#2a333c" strokeWidth={3} />
				{Array.from({length: 24}, (_, j) => <circle key={j} cx={20 + (j % 4) * 26} cy={-400 + Math.floor(j / 4) * 22} r={4} fill={rnd(i * 24 + j, 9) > 0.5 ? '#ff6a4a' : '#ffd77a'} opacity={0.4 + 0.6 * rnd(i * 24 + j, 8)} />)}
				<circle cx={40} cy={-200} r={30} fill="#0b0f12" stroke="#3a444e" strokeWidth={4} /><circle cx={80} cy={-200} r={30} fill="#0b0f12" stroke="#3a444e" strokeWidth={4} /></g>)}
			<text x={1190} y={110} style={{fontFamily: LAT, fontSize: 26, letterSpacing: '0.2em'}} fill="#6a7a88">IMP · SDS SIGMA 7</text>
			{/* the two letters, then the crash */}
			<g transform="translate(300,420)"><rect x={-40} y={-200} width={560} height={300} fill="#04140a" stroke="#1d3a26" strokeWidth={6} rx={14} />
				<text x={30} y={20} style={{fontFamily: '"DejaVu Sans Mono", monospace', fontWeight: 700, fontSize: 170}} fill="#7dff9a" filter="url(#gS)">LO</text>
				<text x={330} y={20} style={{fontFamily: '"DejaVu Sans Mono", monospace', fontWeight: 700, fontSize: 170}} fill="#7dff9a" opacity={0.18}>GIN</text>
				{Array.from({length: 9}, (_, i) => <rect key={i} x={-40} y={-200 + i * 34 + 10 * rnd(i, 3)} width={560} height={4 + 6 * rnd(i, 4)} fill="#7dff9a" opacity={0.12} />)}
				<text x={0} y={80} style={{fontFamily: '"DejaVu Sans Mono", monospace', fontSize: 30}} fill={RED}>*** SYSTEM CRASH ***</text></g>
			<rect x={0} y={GR - 40} width={W} height={40} fill="#161c22" /><rect x={0} y={GR} width={W} height={H - GR} fill="#05070a" />
		</g>;
		case 'bj': return <g>
			{grad('s8', [[0, '#16213f'], [0.6, '#6e6a8a'], [1, '#e9b48a']])}<rect width={W} height={H} fill="url(#s8)" />
			{/* the Great Wall on the far ridge, the email flying along it */}
			<path d={ridge(21, 560, 120, 26)} fill="#4a4a66" />
			<path d={'M0,520 ' + Array.from({length: 49}, (_, i) => `L${i * 40},${520 - 70 * Math.sin(i * 0.25) - 30 * Math.sin(i * 0.7)}`).join(' ')} stroke="#2e2e48" strokeWidth={14} fill="none" />
			{Array.from({length: 7}, (_, i) => { const x = 140 + i * 280, y = 520 - 70 * Math.sin(x / 40 * 0.25) - 30 * Math.sin(x / 40 * 0.7); return <rect key={i} x={x - 16} y={y - 40} width={32} height={40} fill="#2e2e48" />; })}
			<text x={960} y={330} textAnchor="middle" style={{fontFamily: '"DejaVu Sans Mono", monospace', fontSize: 34}} fill="#fff6dc" filter="url(#gS)">Across the Great Wall we can reach every corner in the world.</text>
			<text x={960} y={380} textAnchor="middle" style={{fontFamily: SANS, fontSize: 30}} fill={GOLD}>越过长城，走向世界</text>
			{/* 1980s Beijing: hutong roofs, an apartment block, bicycles */}
			{Array.from({length: 9}, (_, i) => <path key={i} d={`M${60 + i * 120},${GR - 40} L${60 + i * 120},${GR - 120} L${120 + i * 120},${GR - 160} L${180 + i * 120},${GR - 120} L${180 + i * 120},${GR - 40} Z`} fill="#1c1a26" />)}
			<g transform={`translate(1480,${GR - 40})`}><rect x={-260} y={-330} width={520} height={330} fill="#24222e" />{Array.from({length: 7}, (_, r) => Array.from({length: 9}, (_, c) => <rect key={`${r}${c}`} x={-240 + c * 56} y={-310 + r * 44} width={30} height={22} fill={rnd(r * 9 + c, 13) > 0.5 ? '#ffd78a' : '#3a3846'} />))}</g>
			{[1150, 1220].map((x) => <g key={x} stroke="#0d0c12" strokeWidth={5} fill="none"><circle cx={x} cy={GR - 62} r={22} /><circle cx={x + 64} cy={GR - 62} r={22} /><path d={`M${x},${GR - 62} L${x + 26},${GR - 100} L${x + 64},${GR - 62} M${x + 26},${GR - 100} L${x + 54},${GR - 100}`} /></g>)}
			<Ground top="#2a2430" band="#0c0a10" />
		</g>;
		default: return <g>
			{grad('s0', [[0, '#020208'], [0.7, '#0d0c26'], [1, '#1d1636']])}<rect width={W} height={H} fill="url(#s0)" /><Stars n={260} maxY={GR - 40} />
			<rect x={0} y={GR} width={W} height={H - GR} fill="#040308" />
		</g>;
	}
};

const Voyager: React.FC<{s?: number}> = ({s = 1}) => <g transform={`scale(${s})`}>
	<Glow x={0} y={0} r={220} c={GOLD} o={0.2} />
	<path d="M-120,-20 Q0,-120 120,-20 Z" fill="#c9ccd6" /><rect x={-4} y={-110} width={8} height={90} fill="#c9ccd6" />
	<rect x={-60} y={-20} width={120} height={50} fill="#8a8e9c" /><line x1={60} y1={0} x2={260} y2={-30} stroke="#c9ccd6" strokeWidth={4} /><line x1={-60} y1={10} x2={-240} y2={60} stroke="#c9ccd6" strokeWidth={4} />
	<circle cx={-20} cy={60} r={42} fill={GOLD} /><circle cx={-20} cy={60} r={42} fill="none" stroke="#fff3c4" strokeWidth={2} />{[30, 22, 14].map((r) => <circle key={r} cx={-20} cy={60} r={r} fill="none" stroke="#a8862a" strokeWidth={1.5} />)}<circle cx={-20} cy={60} r={5} fill="#5a4410" />
</g>;
const PROC = ['shang', 'du', 'morse', 'scott', 'bell', 'marconi', 'kline', 'bj'];
const Procession: React.FC<{h?: number; x0?: number; gap?: number}> = ({h = 280, x0 = 300, gap = 190}) => <g>{PROC.map((k, i) => <Walker key={k} x={x0 + i * gap} h={h} p={(0.2 + i * 0.37) % 1} look={LOOKS[k]} col="#07060c" far="#16131f" />)}</g>;

type KF = {world: string; label?: [string, string]; nat?: string; zh?: string; rtl?: boolean; lat?: string; walker?: string; p?: number; wx?: number; extra?: React.ReactNode; over?: React.ReactNode; title: string; blur?: boolean};
const FR: KF[] = [
	{world: 'open', title: '钩子 0:00', extra: <g><Glow x={960} y={420} r={260} c="#ffcf8a" o={0.12} />
		{/* a candlestick telephone, the only thing in the dark */}
		<g transform="translate(960,600)" fill="#e8d6a8" opacity={0.92}>
			<ellipse cx={0} cy={0} rx={90} ry={18} /><path d="M-60,-6 Q0,-40 60,-6 Z" /><rect x={-11} y={-330} width={22} height={300} />
			<path d="M8,-330 L70,-360 L70,-290 L8,-310 Z" /><ellipse cx={72} cy={-325} rx={10} ry={36} />
			<rect x={-60} y={-250} width={50} height={8} /><path d="M-70,-262 L-48,-262 L-44,-160 L-66,-160 Z" /><ellipse cx={-57} cy={-158} rx={20} ry={10} />
			<path d="M-57,-150 Q-120,-60 -40,-10" stroke="#e8d6a8" strokeWidth={4} fill="none" /></g></g>,
		over: <g><text x={960} y={760} textAnchor="middle" style={{fontFamily: SERIF, fontWeight: 900, fontSize: 64}} fill="#fff" stroke="#000" strokeWidth={8} paintOrder="stroke">人类打出的第一通电话，</text>
			<text x={960} y={850} textAnchor="middle" style={{fontFamily: SERIF, fontWeight: 900, fontSize: 64}} fill={GOLD} stroke="#000" strokeWidth={8} paintOrder="stroke">第一句话说的是什么？</text></g>},
	{world: 'morse', walker: 'morse', p: 0.6, wx: 700, label: ['1844', '莫尔斯 · 华盛顿'], blur: true, title: '倒带 0:05',
		over: <g><rect width={W} height={H} fill="#000" opacity={0.2} />{Array.from({length: 14}, (_, i) => <rect key={i} x={0} y={rnd(i, 30) * H} width={W} height={2 + 6 * rnd(i, 31)} fill="#fff" opacity={0.1 + 0.1 * rnd(i, 32)} />)}
			<text x={W - 120} y={190} textAnchor="end" style={{fontFamily: LAT, fontWeight: 900, fontSize: 150}} fill="#fff">1844</text>
			<text x={W - 120} y={250} textAnchor="end" style={{fontFamily: SANS, fontWeight: 700, fontSize: 40}} fill={GOLD}>◀◀  1987 → 公元前 1200</text></g>},
	{world: 'shang', walker: 'shang', p: 0.15, wx: 640, label: ['约公元前 1200 年', '商 · 殷墟'], nat: '其自东来雨？', lat: SANS, zh: '雨，会从东边来吗？', title: '1 甲骨'},
	{world: 'du', walker: 'du', p: 0.55, wx: 620, label: ['757 年', '杜甫 · 长安'], nat: '烽火连三月，家书抵万金。', lat: SANS, zh: '打了三个月的仗，一封家书值万两黄金。', title: '2 杜甫'},
	{world: 'morse', walker: 'morse', p: 0.6, wx: 700, label: ['1844 年', '莫尔斯 · 华盛顿'], nat: 'What hath God wrought?', lat: LATS, zh: '上帝创造了何等奇迹？', title: '3 莫尔斯'},
	{world: 'scott', walker: 'scott', p: 0.3, wx: 640, label: ['1860 年', '斯科特 · 巴黎'], nat: 'Au clair de la lune…', lat: LATS, zh: '他唱的这首歌，148 年后才第一次被人听见。', title: '4 斯科特'},
	{world: 'bell', walker: 'bell', p: 0.85, wx: 560, label: ['1876 年', '贝尔 · 波士顿'], nat: 'Mr. Watson, come here, I want to see you.', lat: LATS, zh: '华生，过来，我想见你。', title: '5 贝尔',
		extra: <g transform="translate(3240,0) scale(-1,1)"><Walker x={1620} h={430} p={0.05} look={LOOKS.watson} /></g>},
	{world: 'marconi', walker: 'marconi', p: 0.4, wx: 760, label: ['1901 年', '马可尼 · 纽芬兰'], nat: 'Can you hear anything, Mr. Kemp?', lat: LATS, zh: '你听到了吗？', title: '6 马可尼'},
	{world: 'arpa', walker: 'kline', p: 0.7, wx: 720, label: ['1969 年', '阿帕网 · 洛杉矶'], nat: 'L… O…', lat: LATS, zh: '想打 LOGIN，打到第二个字母，系统崩了。', title: '7 阿帕网（静音）'},
	{world: 'bj', walker: 'bj', p: 0.25, wx: 640, label: ['1987 年', '中国第一封电子邮件 · 北京'], nat: 'Across the Great Wall…', lat: LATS, zh: '越过长城，走向世界。', title: '8 北京'},
	{world: 'open', title: '金唱片 DROP 1:33', extra: <g><g transform="translate(1180,330) rotate(-12)"><Voyager s={1.1} /></g><circle cx={240} cy={160} r={8} fill="#7ab8ff" /><Glow x={240} y={160} r={30} c="#7ab8ff" o={0.5} />
		<text x={262} y={166} style={{fontFamily: SANS, fontSize: 22}} fill="#9fc8ff">地球</text><Procession /></g>, zh: '为了跟你说一句话，人类努力了三千年。'},
	{world: 'open', title: '结尾 2:03', extra: <g><g transform="translate(960,330)" opacity={0.6}><Voyager s={0.7} /></g><Procession h={200} x0={560} gap={115} /></g>,
		over: <g><text x={960} y={620} textAnchor="middle" style={{fontFamily: SERIF, fontWeight: 900, fontSize: 76}} fill={GOLD} stroke="#000" strokeWidth={8} paintOrder="stroke">你最想对谁说一句话？</text></g>},
];

export const Ep41KF: React.FC = () => {
	const f = useCurrentFrame(), k = FR[Math.min(FR.length - 1, f)];
	return <AbsoluteFill style={{background: '#020104'}}>
		<svg width={W} height={H}>
			<defs>
				<filter id="gM" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="7" /></filter>
				<filter id="gL" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="40" /></filter>
				<filter id="gS" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="2" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
				<filter id="rew" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="10 0" /></filter>
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
registerRoot(() => <Composition id="KF41" component={Ep41KF} durationInFrames={12} fps={30} width={W} height={H} />);
