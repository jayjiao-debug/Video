import React from 'react';
import {AbsoluteFill, Composition, registerRoot, useCurrentFrame} from 'remotion';
import {CAST} from '../art/cast';
import {Figure, POSES, type Look} from '../art/Figure';
import {Materials} from '../art/materials';
import {P} from '../art/palette';
import {Grain, useFonts} from '../looks26/b/kit';

/* ep31 《薄肌说明书》 in the tank-episode look (《只看编号，能算出德国造了多少坦克？》):
   warm near-black stage with one practical key light, flat 2D sets and figures, period paper props with stamps,
   a gold time · place header between rules, serif subtitles with red/gold numbers, ◆ Juno watermark.
   Preview composition: four style frames, 4 s each (A title plaque · B his plan as a training log · C gym set · D 1990 elders). */
const W = 1920, H = 1080, FPS = 30, SEG = 4;
const SERIF = '"Noto Serif CJK SC", serif', NUM = '"Cormorant", "Noto Serif CJK SC", serif', MONO = '"DejaVu Sans Mono", monospace';
const C = {bg: '#0b0b0e', ink: '#efe9dc', dim: 'rgba(239,233,220,0.55)', gold: '#f1c56d', red: '#ff5a4e', paper: '#ece2c8', inkB: '#3a2a1a', stamp: '#c8322b'};
const cl = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const ea = (t: number, a: number, d = 0.6) => 1 - Math.pow(1 - cl((t - a) / d), 3);

// ------------------------------------------------------------------ chrome
const Header: React.FC<{t: string; o?: number}> = ({t, o = 1}) => (
	<div style={{position: 'absolute', top: 60, left: 0, right: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 26, opacity: o,
		color: C.gold, fontFamily: SERIF, fontWeight: 600, fontSize: 27, letterSpacing: '0.42em'}}>
		<span style={{width: 84, height: 1, background: 'rgba(241,197,109,0.6)'}} />
		<span>{t}</span>
		<span style={{width: 84, height: 1, background: 'rgba(241,197,109,0.6)', marginLeft: -12}} />
	</div>
);
const Mark: React.FC = () => (
	<div style={{position: 'absolute', top: 50, right: 64, fontFamily: SERIF, fontSize: 21, letterSpacing: '0.3em', color: 'rgba(239,233,220,0.42)'}}>
		<span style={{color: C.gold}}>◆ </span>Juno · VIBE知识大赏
	</div>
);
/** serif subtitle; [x] = red number (Cormorant old-style figures), {x} = gold keyword */
const Sub: React.FC<{t: string; o?: number}> = ({t, o = 1}) => (
	<>
		<AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(0,0,0,0) 74%, rgba(0,0,0,0.5) 90%, rgba(0,0,0,0.62) 100%)'}} />
		<div style={{position: 'absolute', left: 0, right: 0, top: 922, textAlign: 'center', opacity: o, fontFamily: SERIF, fontWeight: 700, fontSize: 54, color: C.ink, letterSpacing: '0.05em',
			textShadow: '0 2px 12px rgba(0,0,0,0.9)'}}>
			{t.split(/(\[[^\]]+\]|\{[^}]+\})/).filter(Boolean).map((p, i) =>
				p[0] === '[' ? <span key={i} style={{color: C.red, fontFamily: NUM, fontWeight: 700, fontSize: 70}}>{p.slice(1, -1)}</span>
				: p[0] === '{' ? <span key={i} style={{color: C.gold}}>{p.slice(1, -1)}</span>
				: <span key={i}>{p}</span>)}
		</div>
	</>
);
/** warm key light at (x, y) over near-black, vignette, grain */
const Stage: React.FC<{kx?: number; ky?: number; r?: number; k?: number; children?: React.ReactNode}> = ({kx = 960, ky = 460, r = 900, k = 1, children}) => (
	<AbsoluteFill style={{background: C.bg}}>
		<AbsoluteFill style={{background: `radial-gradient(${r}px ${r * 0.75}px at ${kx}px ${ky}px, rgba(150,112,62,${0.38 * k}), rgba(11,11,14,0) 72%)`}} />
		{children}
		<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 46%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.7) 100%)'}} />
		<Grain />
	</AbsoluteFill>
);
/** a red rubber stamp: double border, slightly uneven ink */
const Stamp: React.FC<{x: number; y: number; text: string; rot?: number; s?: number; o?: number; col?: string}> = ({x, y, text, rot = -8, s = 1, o = 1, col = C.stamp}) => (
	<g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`} opacity={o * 0.88}>
		<rect x={-text.length * 34 - 34} y={-52} width={text.length * 68 + 68} height={104} rx={8} fill="none" stroke={col} strokeWidth={7} />
		<rect x={-text.length * 34 - 22} y={-40} width={text.length * 68 + 44} height={80} rx={4} fill="none" stroke={col} strokeWidth={2.5} />
		<text y={22} textAnchor="middle" style={{fontFamily: SERIF, fontWeight: 900, fontSize: 60, letterSpacing: '0.12em'}} fill={col}>{text}</text>
	</g>
);
const Dumbbell: React.FC<{s?: number; col?: string; plate?: string}> = ({s = 1, col = '#8b9098', plate = '#2a2c31'}) => (
	<g transform={`scale(${s})`}>
		<rect x={-34} y={-3.5} width={68} height={7} rx={2} fill={col} />
		{[-1, 1].map((d) => (
			<g key={d}>
				<rect x={d > 0 ? 18 : -30} y={-17} width={12} height={34} rx={3} fill={plate} />
				<rect x={d > 0 ? 30 : -36} y={-12} width={6} height={24} rx={2} fill={plate} />
			</g>
		))}
	</g>
);

// ------------------------------------------------------------------ A · title: a brass plaque on the gym wall, under one lamp
const A: React.FC<{t: number}> = ({t}) => {
	const lit = ea(t, 0.1, 0.8);
	return (
		<Stage kx={960} ky={470} r={1100} k={0.4 + 0.6 * lit}>
			<svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
				<Materials />
				{/* dark painted block wall, mortar lines, a row of bolts */}
				<rect width={W} height={H} fill="#16130f" opacity={0.85} />
				{Array.from({length: 14}, (_, r) => (
					<g key={r} opacity={0.5}>
						<line x1={0} y1={r * 82} x2={W} y2={r * 82} stroke="#0c0a08" strokeWidth={3} />
						{Array.from({length: 9}, (_, c) => <line key={c} x1={(c * 240 + (r % 2) * 120) % (W + 240)} y1={r * 82} x2={(c * 240 + (r % 2) * 120) % (W + 240)} y2={r * 82 + 82} stroke="#0c0a08" strokeWidth={3} />)}
					</g>
				))}
				<g transform="translate(960,470)">
					<rect x={-600} y={-235} width={1200} height={470} rx={20} fill="#000" opacity={0.55} filter="url(#blur-md)" transform="translate(16,22)" />
					<rect x={-600} y={-235} width={1200} height={470} rx={20} fill="url(#brass)" />
					<rect x={-574} y={-209} width={1148} height={418} rx={12} fill="none" stroke="#6e4a1c" strokeWidth={3} opacity={0.7} />
					<rect x={-574} y={-207} width={1148} height={418} rx={12} fill="none" stroke="#ffe7ad" strokeWidth={1.5} opacity={0.45} />
					{[[-560, -195], [560, -195], [-560, 195], [560, 195]].map(([x, y], i) => (
						<g key={i} transform={`translate(${x},${y})`}>
							<circle r={13} fill="#5a3c16" /><circle r={11} fill="url(#brass)" />
							<line x1={-8} y1={-3} x2={8} y2={3} stroke="#4a3010" strokeWidth={2.4} />
						</g>
					))}
					{/* engraving: a dark cut with a light lower lip */}
					{[[2, '#ffe2a0', 0.55], [0, '#3d2708', 1]].map(([d, col, o], i) => (
						<g key={i} transform={`translate(0,${d})`} opacity={o as number}>
							<text y={-112} textAnchor="middle" style={{fontFamily: NUM, fontWeight: 700, fontSize: 40, letterSpacing: '0.34em'}} fill={col as string}>LEAN · MUSCLE · MANUAL</text>
							<text y={62} textAnchor="middle" style={{fontFamily: SERIF, fontWeight: 900, fontSize: 168, letterSpacing: '0.08em'}} fill={col as string}>薄肌说明书</text>
							<text y={160} textAnchor="middle" style={{fontFamily: NUM, fontWeight: 600, fontSize: 40, letterSpacing: '0.3em'}} fill={col as string}>Nº 31 · 五 步 · 逐 条 打 分</text>
						</g>
					))}
				</g>
			</svg>
			<Header t="2026 · 一期播客 · 四个半小时" o={ea(t, 0.6)} />
			<Mark />
		</Stage>
	);
};

// ------------------------------------------------------------------ B · his plan as a training log on the desk, stamped 「待打分」
const B: React.FC<{t: number}> = ({t}) => {
	const rows: [string, string, string][] = [['01', '练', '隔天练，每次加一点'], ['02', '吃', '蛋白质 150 克'], ['03', '减', '每天缺 600 卡'], ['04', '睡', '盯睡眠指标']];
	const st = ea(t, 1.2, 0.25);
	return (
		<Stage kx={760} ky={560} r={1000}>
			<svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
				<Materials />
				<rect width={W} height={720} fill="#1a1d22" opacity={0.9} />
				<rect y={600} width={W} height={160} fill="#1d1712" />
				{/* desk */}
				<rect y={760} width={W} height={60} fill="url(#wood)" />
				<rect y={818} width={W} height={300} fill="#140e09" />
				{/* lamp, left: the warm key */}
				<g transform="translate(330,770)">
					<ellipse cx={120} cy={-20} rx={560} ry={330} fill="url(#glow-lamp)" opacity={0.6} />
					<g transform="scale(0.9)">
						<rect x={-8} y={-190} width={16} height={190} fill="url(#brass)" />
						<ellipse cx={0} cy={-2} rx={78} ry={13} fill="url(#brass)" />
						<path d="M-120,-196 C-120,-244 120,-244 120,-196 L104,-178 L-104,-178 Z" fill="#1f5a3e" />
						<path d="M-104,-178 L104,-178" stroke={P.candle} strokeWidth={4} />
					</g>
				</g>
				{/* the log sheet, lying on the desk, seen from the front */}
				<g transform="translate(1000,500) rotate(-2.2) scale(0.88)">
					<rect x={-430} y={-330} width={860} height={640} fill="#000" opacity={0.5} filter="url(#blur-md)" transform="translate(14,18)" />
					<rect x={-430} y={-330} width={860} height={640} fill={C.paper} />
					<rect x={-430} y={-330} width={860} height={640} fill="url(#grain-paper)" opacity={0.5} />
					<text x={-380} y={-268} style={{fontFamily: MONO, fontSize: 24, letterSpacing: '0.18em'}} fill={C.inkB} opacity={0.8}>TRAINING LOG · Nº 01</text>
					<text x={380} y={-268} textAnchor="end" style={{fontFamily: MONO, fontSize: 24, letterSpacing: '0.1em'}} fill={C.inkB} opacity={0.6}>PODCAST 03:03</text>
					<line x1={-380} y1={-246} x2={380} y2={-246} stroke={C.inkB} strokeWidth={2} opacity={0.5} />
					<text x={-380} y={-170} style={{fontFamily: SERIF, fontWeight: 900, fontSize: 60}} fill="#2a1d10">孙宇晨的薄肌方案</text>
					{rows.map(([n, k, v], i) => (
						<g key={n} transform={`translate(0,${-80 + i * 96})`}>
							<text x={-380} y={0} style={{fontFamily: NUM, fontWeight: 700, fontSize: 44}} fill="#8a5a2a">{n}</text>
							<text x={-310} y={0} style={{fontFamily: SERIF, fontWeight: 900, fontSize: 48}} fill="#2a1d10">{k}</text>
							<text x={-230} y={0} style={{fontFamily: SERIF, fontWeight: 600, fontSize: 40}} fill="#3a2a1a">{v}</text>
							<line x1={-380} y1={30} x2={250} y2={30} stroke={C.inkB} strokeWidth={1.5} strokeDasharray="3 7" opacity={0.45} />
							<rect x={290} y={-42} width={84} height={64} fill="none" stroke={C.inkB} strokeWidth={2} opacity={0.55} />
						</g>
					))}
					<Stamp x={200} y={230} text="待打分" rot={-9} s={1 + 0.5 * (1 - st)} o={st} />
				</g>
				{/* a pen beside the sheet */}
				<g transform="translate(1540,760) rotate(-24)">
					<rect x={-150} y={-9} width={260} height={18} rx={9} fill="#1c1c22" />
					<rect x={60} y={-10} width={30} height={20} fill="url(#brass)" />
					<path d="M110,-8 L150,0 L110,8 Z" fill="#c9b27a" />
				</g>
			</svg>
			<Header t="播客 · 03:03 · 孙宇晨自述" o={ea(t, 0.2)} />
			<Mark />
			<Sub t="孙宇晨刚开始练，播客里讲了他的方案" o={ea(t, 0.3, 0.3)} />
		</Stage>
	);
};

// ------------------------------------------------------------------ C · the gym at night: step 01 练 — a training calendar on the wall
const LIFTER: Look = {skin: P.skin1, hair: 'short', hairColor: P.hairBlack, outfit: 'casual', top: '#6b3b33', bottom: '#22242a', accent: '#6b3b33',
	build: {torso: 0.84, width: 1.2, head: 1, upper: 53, fore: 49, thigh: 79, shin: 77, armW: 1.18, legW: 1.05}};
const Cg: React.FC<{t: number}> = ({t}) => {
	const f = Math.round(t * FPS);
	const curl = 0.5 - 0.5 * Math.cos(t * 2.2);                           // a slow curl, on its own clock
	const pose = {...POSES.hold, armNear: [20 + 30 * curl, 40 + 90 * curl] as [number, number], armFar: [-6, 12] as [number, number]};
	const days = ['一', '二', '三', '四', '五', '六', '日'];
	const mark = (i: number) => (i === 0 || i === 3 ? '5组' : '');
	return (
		<Stage kx={1230} ky={320} r={1000}>
			<svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
				<Materials />
				{/* back wall, wainscot, rubber floor */}
				<rect width={W} height={H} fill="#1a1e24" opacity={0.92} />
				<rect y={600} width={W} height={260} fill="#1c1814" />
				<rect y={594} width={W} height={8} fill="#2a231c" />
				<rect y={860} width={W} height={220} fill="#101012" />
				{Array.from({length: 9}, (_, i) => <line key={i} x1={i * 240} y1={860} x2={i * 240 - 120} y2={1080} stroke="#1a1a1e" strokeWidth={3} />)}
				{/* window onto the city at night */}
				<g transform="translate(1500,130) scale(0.9)">
					<rect width={400} height={380} fill="url(#sky-night)" />
					{[[20, 220, 60], [90, 170, 50], [150, 250, 70], [230, 140, 60], [300, 210, 80]].map(([x, y, w], i) => (
						<g key={i}>
							<rect x={x} y={y} width={w} height={380 - y} fill="#0b0f1a" />
							{Array.from({length: 12}, (_, k) => ((k * 7 + i * 3) % 5 < 2 ? <rect key={k} x={x + 8 + (k % 3) * 16} y={y + 14 + Math.floor(k / 3) * 26} width={7} height={10} fill={P.lamp} opacity={0.6} /> : null))}
						</g>
					))}
					<rect x={195} width={10} height={380} fill="#141a22" /><rect y={185} width={400} height={10} fill="#141a22" />
					<rect x={-14} y={-14} width={428} height={408} fill="none" stroke="#22262e" strokeWidth={14} />
				</g>
				{/* squat rack + barbell, left */}
				<g transform="translate(70,860)">
					{[0, 300].map((x) => <rect key={x} x={x} y={-560} width={26} height={560} fill="#2b2e34" />)}
					<rect x={-10} y={-574} width={346} height={20} fill="#2b2e34" />
					{Array.from({length: 14}, (_, i) => <circle key={i} cx={13} cy={-520 + i * 34} r={4} fill="#17191c" />)}
					<rect x={-60} y={-332} width={446} height={10} rx={4} fill="#9aa0a8" />
					{[-46, 362].map((x) => <g key={x}><rect x={x} y={-400} width={30} height={146} rx={5} fill="#1d1f24" /><rect x={x + (x < 0 ? 30 : -14)} y={-372} width={14} height={90} rx={3} fill="#2a2d33" /></g>)}
				</g>
				{/* plate tree */}
				<g transform="translate(1700,860)">
					<rect x={-8} y={-230} width={16} height={230} fill="#2b2e34" />
					{[[-120, 0.9], [-170, 0.75], [-60, 1]].map(([y, s], i) => <circle key={i} cx={0} cy={y} r={70 * s} fill="#1d1f24" stroke="#2c2f35" strokeWidth={6} />)}
					<rect x={-60} y={-8} width={120} height={8} fill="#2b2e34" />
				</g>
				{/* the training calendar, pinned on the wall */}
				<g transform="translate(470,240) rotate(-1.2)">
					<rect x={-10} y={-10} width={560} height={300} fill="#000" opacity={0.5} filter="url(#blur-md)" transform="translate(10,14)" />
					<rect width={540} height={290} fill={C.paper} />
					<rect width={540} height={290} fill="url(#grain-paper)" opacity={0.5} />
					<circle cx={270} cy={14} r={8} fill={P.red} />
					<text x={30} y={62} style={{fontFamily: SERIF, fontWeight: 900, fontSize: 36}} fill="#2a1d10">本周 · 胸</text>
					<text x={510} y={62} textAnchor="end" style={{fontFamily: MONO, fontSize: 20, letterSpacing: '0.12em'}} fill={C.inkB} opacity={0.7}>WEEK 01</text>
					{days.map((d, i) => (
						<g key={d} transform={`translate(${30 + i * 70},90)`}>
							<rect width={64} height={150} fill="none" stroke={C.inkB} strokeWidth={1.6} opacity={0.5} />
							<text x={32} y={32} textAnchor="middle" style={{fontFamily: SERIF, fontWeight: 700, fontSize: 26}} fill="#3a2a1a">{d}</text>
							{mark(i) ? (
								<g opacity={ea(t, 0.6 + i * 0.25, 0.3)}>
									<circle cx={32} cy={96} r={28} fill="none" stroke={C.stamp} strokeWidth={4} />
									<text x={32} y={106} textAnchor="middle" style={{fontFamily: SERIF, fontWeight: 900, fontSize: 24}} fill={C.stamp}>{mark(i)}</text>
								</g>
							) : <text x={32} y={106} textAnchor="middle" style={{fontFamily: SERIF, fontSize: 24}} fill="#3a2a1a" opacity={0.35}>休</text>}
						</g>
					))}
					<text x={510} y={276} textAnchor="end" style={{fontFamily: NUM, fontWeight: 700, fontSize: 30}} fill={C.stamp} opacity={ea(t, 1.6)}>= 10 组 / 周</text>
				</g>
				{/* hanging lamp over the lifter */}
				<g transform="translate(1230,0)">
					<line x1={0} y1={0} x2={0} y2={150} stroke="#2a2a2e" strokeWidth={3} />
					<path d="M-70,200 L-30,150 L30,150 L70,200 Z" fill="#26292e" />
					<ellipse cx={0} cy={200} rx={70} ry={10} fill={P.candle} />
					<polygon points="-70,200 70,200 340,860 -340,860" fill="url(#beam-warm)" opacity={0.22} />
					<ellipse cx={0} cy={240} rx={300} ry={160} fill="url(#glow-lamp)" opacity={0.5} />
				</g>
				<ellipse cx={1250} cy={866} rx={260} ry={26} fill="#000" opacity={0.5} filter="url(#blur-sm)" />
				<g transform="translate(1250,862) scale(1.45)">
					<Figure look={LIFTER} build={LIFTER.build} pose={pose} facing="side" rim="warm" expression="neutral" holdNear={<Dumbbell s={0.9} col="#b9bec6" plate="#5d636c" />} />
				</g>
			</svg>
			<Header t="2017 · 纽约 · 莱曼学院" o={ea(t, 0.2)} />
			<Mark />
			<Sub t="论文说：每个部位每周[10]组，分两天练更好" o={ea(t, 0.3, 0.3)} />
			{f < 0 ? null : null}
		</Stage>
	);
};

// ------------------------------------------------------------------ D · 1990, Boston: ten nonagenarians, eight weeks, +174 %
const ELDER: Look = {skin: P.skin1, hair: 'bald', hairColor: '#e9e4da', outfit: 'casual', top: '#5a4c40', bottom: '#34312c', accent: '#d9cfb8', glasses: true};
const D: React.FC<{t: number}> = ({t}) => {
	const per = 4, rowH = 21, before = 8, after = Math.round(before * 2.74);   // rows of 4 icons: strength before vs after
	const grow = ea(t, 0.5, 1.6);
	const aRows = Math.round(before + (after - before) * grow);
	const col = (x: number, n: number, colr: string, label: string, val: string, vc: string) => (
		<g transform={`translate(${x},800)`}>
			{Array.from({length: n}, (_, r) => Array.from({length: per}, (_, c) => (
				<g key={`${r}-${c}`} transform={`translate(${c * 34 + 17},${-r * rowH - 12})`}><Dumbbell s={0.42} col={colr} plate={colr} /></g>
			)))}
			<rect x={-8} y={-n * rowH - 8} width={per * 34 + 16} height={n * rowH + 10} fill="none" stroke={colr} strokeWidth={1.5} opacity={0.5} />
			<text x={per * 17} y={-n * rowH - 34} textAnchor="middle" style={{fontFamily: NUM, fontWeight: 700, fontSize: 66}} fill={vc}>{val}</text>
			<text x={per * 17} y={50} textAnchor="middle" style={{fontFamily: SERIF, fontWeight: 700, fontSize: 30}} fill={colr}>{label}</text>
		</g>
	);
	return (
		<Stage kx={520} ky={620} r={800} k={0.8}>
			<svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
				<Materials />
				{/* spotlight cone onto the elder */}
				<polygon points="440,0 600,0 820,880 220,880" fill="url(#beam-warm)" opacity={0.28} />
				<ellipse cx={520} cy={880} rx={300} ry={40} fill={P.candle} opacity={0.12} />
				<ellipse cx={520} cy={884} rx={200} ry={22} fill="#000" opacity={0.6} filter="url(#blur-sm)" />
				<g transform="translate(520,880) scale(1.3)">
					<Figure look={ELDER} pose={{...POSES.hold, armNear: [28, 96] as [number, number], lean: 4}} facing="side" rim="warm" expression="smile" holdNear={<Dumbbell s={0.7} />} />
				</g>
				{col(1060, before, '#cbbf9f', '第 0 周', '100', C.ink)}
				{col(1300, aRows, C.red, '第 8 周', String(Math.round(100 + 174 * grow)), C.red)}
				<g opacity={ea(t, 2.1, 0.3)}>
					<Stamp x={1700} y={430} text="+174%" rot={-10} s={0.9 + 0.3 * (1 - ea(t, 2.1, 0.25))} col={C.red} />
				</g>
				{/* the source slip, like the tank episode's agent reports */}
				<g transform="translate(1700,720) rotate(4)">
					<rect x={-130} y={-70} width={260} height={150} fill="#000" opacity={0.45} filter="url(#blur-sm)" transform="translate(8,10)" />
					<rect x={-130} y={-70} width={260} height={150} fill={C.paper} />
					<text x={-108} y={-30} style={{fontFamily: MONO, fontSize: 18, letterSpacing: '0.1em'}} fill={C.inkB}>JAMA · 1990</text>
					<line x1={-108} y1={-18} x2={108} y2={-18} stroke={C.inkB} opacity={0.4} />
					<text x={-108} y={18} style={{fontFamily: SERIF, fontWeight: 700, fontSize: 24}} fill="#2a1d10">10 人 · 平均 90 岁</text>
					<text x={-108} y={54} style={{fontFamily: SERIF, fontWeight: 700, fontSize: 24}} fill="#2a1d10">练 8 周 · 腿部力量</text>
				</g>
			</svg>
			<Header t="1990 · 波士顿 · 老年康复中心" o={ea(t, 0.2)} />
			<Mark />
			<Sub t="10位约90岁的老人练了8周，力量涨了[174%]" o={ea(t, 0.3, 0.3)} />
		</Stage>
	);
};

const Tank31: React.FC = () => {
	useFonts();
	const t = useCurrentFrame() / FPS;
	const i = Math.min(3, Math.floor(t / SEG)), u = t - i * SEG;
	return [<A t={u} />, <B t={u} />, <Cg t={u} />, <D t={u} />][i];
};
registerRoot(() => <Composition id="TANK31" component={Tank31} durationInFrames={SEG * 4 * FPS} fps={FPS} width={W} height={H} />);
