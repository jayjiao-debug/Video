import React from 'react';
import {AbsoluteFill, Composition, continueRender, delayRender, registerRoot, staticFile} from 'remotion';

/* ep26 · restyle test: three premium directions, each shown on two beats
   (line 2 "钱还没到，你今晚就多花了一点" with a clearer money story, and line 21 the debt spiral). */
const W = 1920, H = 1080;
const CJK_SANS = '"Noto Sans CJK SC", sans-serif';
const CJK_SERIF = '"Noto Serif CJK SC", serif';
const GARA = '"Cormorant", "Noto Serif CJK SC", serif';
const INTER = '"InterX", "Noto Sans CJK SC", sans-serif';

let fontsLoaded = false;
const useFonts = () => {
	if (fontsLoaded || typeof document === 'undefined') return;
	fontsLoaded = true;
	const h = delayRender('fonts');
	const faces: [string, string, string, string][] = [
		['Cormorant', 'cormorant-garamond-latin-500-normal', '500', 'normal'],
		['Cormorant', 'cormorant-garamond-latin-600-normal', '600', 'normal'],
		['Cormorant', 'cormorant-garamond-latin-700-normal', '700', 'normal'],
		['Cormorant', 'cormorant-garamond-latin-500-italic', '500', 'italic'],
		['InterX', 'inter-latin-300-normal', '300', 'normal'],
		['InterX', 'inter-latin-400-normal', '400', 'normal'],
		['InterX', 'inter-latin-500-normal', '500', 'normal'],
		['InterX', 'inter-latin-600-normal', '600', 'normal'],
	];
	Promise.all(faces.map(([fam, file, weight, style]) => new FontFace(fam, `url(${staticFile(`fonts/${file}.woff2`)}) format('woff2')`, {weight, style}).load().then((f) => document.fonts.add(f))))
		.then(() => continueRender(h))
		.catch(() => continueRender(h));
};
const Noise: React.FC<{o?: number; blend?: string}> = ({o = 0.5, blend = 'multiply'}) => (
	<svg width={W} height={H} style={{position: 'absolute', inset: 0, mixBlendMode: blend as any, opacity: o}}>
		<filter id="nz"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" seed="3" /><feColorMatrix values="0 0 0 0 0.5  0 0 0 0 0.45  0 0 0 0 0.4  0 0 0 0.35 0" /></filter>
		<rect width={W} height={H} filter="url(#nz)" />
	</svg>
);

/* ======================= A · 编辑排版 (light editorial) ======================= */
const A = {paper: '#ece6da', ink: '#1d1a16', mute: '#7d756a', red: '#b8432b', rule: 'rgba(29,26,22,0.28)'};
const ASub: React.FC<{children: React.ReactNode}> = ({children}) => (
	<div style={{position: 'absolute', left: 0, right: 0, bottom: 64, textAlign: 'center', fontFamily: CJK_SANS, fontWeight: 600, fontSize: 56, color: A.ink, letterSpacing: '0.04em'}}>{children}</div>
);
const AFrame: React.FC<{children: React.ReactNode; folio: string}> = ({children, folio}) => (
	<AbsoluteFill style={{background: `radial-gradient(1400px 900px at 50% 40%, #f3eee4 0%, ${A.paper} 60%, #ddd5c6 100%)`}}>
		<Noise o={0.6} />
		<div style={{position: 'absolute', left: 96, right: 96, top: 64, display: 'flex', justifyContent: 'space-between', fontFamily: INTER, fontSize: 17, letterSpacing: '0.28em', color: A.mute, textTransform: 'uppercase'}}>
			<span>Juno · VIBE知识大赏 · No.26</span>
			<span>{folio}</span>
		</div>
		<div style={{position: 'absolute', left: 96, right: 96, top: 98, height: 1, background: A.rule}} />
		{children}
	</AbsoluteFill>
);
const Receipt: React.FC<{x: number; y: number; rot?: number}> = ({x, y, rot = -3}) => (
	<div style={{position: 'absolute', left: x, top: y, width: 420, transform: `rotate(${rot}deg)`, filter: 'drop-shadow(0 30px 40px rgba(60,40,20,0.25))'}}>
		<div style={{background: '#fbf8f1', padding: '44px 40px 36px', fontFamily: CJK_SANS, color: A.ink, clipPath: 'polygon(0 0,100% 0,100% 96%,95% 100%,90% 96%,85% 100%,80% 96%,75% 100%,70% 96%,65% 100%,60% 96%,55% 100%,50% 96%,45% 100%,40% 96%,35% 100%,30% 96%,25% 100%,20% 96%,15% 100%,10% 96%,5% 100%,0 96%)'}}>
			<div style={{textAlign: 'center', fontSize: 22, letterSpacing: '0.4em', color: A.mute}}>外卖订单</div>
			<div style={{textAlign: 'center', fontFamily: INTER, fontSize: 16, letterSpacing: '0.2em', color: A.mute, marginTop: 6}}>21:04 · MON</div>
			<div style={{borderTop: `1px dashed ${A.rule}`, margin: '26px 0 22px'}} />
			<div style={{display: 'flex', justifyContent: 'space-between', fontSize: 28, color: A.mute, textDecoration: 'line-through'}}><span>番茄牛腩饭（平时）</span><span style={{fontFamily: GARA, fontSize: 34}}>¥26</span></div>
			<div style={{display: 'flex', justifyContent: 'space-between', fontSize: 30, fontWeight: 700, marginTop: 18}}><span>牛排套餐</span><span style={{fontFamily: GARA, fontSize: 40, fontWeight: 700}}>¥58</span></div>
			<div style={{borderTop: `1px dashed ${A.rule}`, margin: '26px 0 18px'}} />
			<div style={{display: 'flex', justifyContent: 'space-between', fontSize: 24, color: A.mute}}><span>比平时多</span><span style={{fontFamily: GARA, fontSize: 36, color: A.red, fontWeight: 700}}>+¥32</span></div>
		</div>
	</div>
);
const A1 = () => (
	<AFrame folio="21:04 · 周一晚">
		<Receipt x={250} y={250} />
		{/* the ledger */}
		<div style={{position: 'absolute', left: 900, top: 230, width: 820, color: A.ink}}>
			<div style={{fontFamily: INTER, fontSize: 18, letterSpacing: '0.3em', color: A.mute}}>今晚的账</div>
			<div style={{height: 1, background: A.ink, marginTop: 18}} />
			<div style={{display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '26px 0 18px', borderBottom: `1px solid ${A.rule}`}}>
				<div>
					<div style={{fontFamily: CJK_SERIF, fontSize: 44, fontWeight: 700}}>涨的工资</div>
					<div style={{fontFamily: CJK_SANS, fontSize: 24, color: A.mute, marginTop: 8}}>明年才发 · 现在到账</div>
				</div>
				<div style={{fontFamily: GARA, fontSize: 168, fontWeight: 600, lineHeight: 0.9}}>¥0</div>
			</div>
			<div style={{display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '26px 0 0'}}>
				<div>
					<div style={{fontFamily: CJK_SERIF, fontSize: 44, fontWeight: 700}}>今晚的饭</div>
					<div style={{fontFamily: CJK_SANS, fontSize: 24, color: A.mute, marginTop: 8}}>比平时多花了</div>
				</div>
				<div style={{fontFamily: GARA, fontSize: 168, fontWeight: 600, lineHeight: 0.9, color: A.red}}>+¥32</div>
			</div>
		</div>
		<ASub>钱还没到，你今晚就多花了一点</ASub>
	</AFrame>
);
const loopNodes = ['旧债到期', '得借新钱来还', '大家怕，不敢借', '更还不上'];
const A2 = () => {
	const cx = 960, cy = 470, r = 300;
	return (
		<AFrame folio="2012 · 欧洲">
			<svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
				<circle cx={cx} cy={cy} r={r} fill="none" stroke={A.ink} strokeWidth={1.5} />
				<circle cx={cx} cy={cy} r={r + 14} fill="none" stroke={A.red} strokeWidth={1} strokeDasharray="2 10" />
				{[0, 1, 2, 3].map((k) => {
					const a = -Math.PI / 2 + (k * Math.PI) / 2 + 0.55;
					const x = cx + r * Math.cos(a), y = cy + r * Math.sin(a);
					return <polygon key={k} points="-9,-7 9,0 -9,7" fill={A.red} transform={`translate(${x} ${y}) rotate(${(a * 180) / Math.PI + 90})`} />;
				})}
				{/* engraved IOU in the middle, line drawing */}
				<rect x={cx - 170} y={cy - 95} width={340} height={190} fill="#f8f3e8" stroke={A.ink} strokeWidth={1.5} />
				<rect x={cx - 158} y={cy - 83} width={316} height={166} fill="none" stroke={A.ink} strokeWidth={0.8} />
				<text x={cx} y={cy - 30} textAnchor="middle" style={{fontFamily: INTER, fontSize: 15, letterSpacing: '0.5em'}} fill={A.mute}>I O U · 借条</text>
				<text x={cx} y={cy + 34} textAnchor="middle" style={{fontFamily: CJK_SERIF, fontSize: 64, fontWeight: 900}} fill={A.ink}>西班牙</text>
			</svg>
			{loopNodes.map((txt, k) => {
				const a = -Math.PI / 2 + (k * Math.PI) / 2;
				const x = cx + (r + 120) * Math.cos(a) * 1.35, y = cy + (r + 40) * Math.sin(a);
				return (
					<div key={k} style={{position: 'absolute', left: x - 200, top: y - 40, width: 400, textAlign: 'center', color: k === 2 ? A.red : A.ink}}>
						<div style={{fontFamily: GARA, fontStyle: 'italic', fontSize: 30, color: A.mute}}>{['i', 'ii', 'iii', 'iv'][k]}.</div>
						<div style={{fontFamily: CJK_SERIF, fontSize: 40, fontWeight: 700}}>{txt}</div>
					</div>
				);
			})}
			<ASub>越借不到，就越<span style={{color: A.red}}>真</span>还不上</ASub>
		</AFrame>
	);
};

/* ======================= B · 暗场电影 (refined dark cinema) ======================= */
const B = {bg: '#0a0a0b', ink: '#f2eee6', mute: 'rgba(242,238,230,0.55)', gold: '#d9bb7c', red: '#c0503d'};
const BSub: React.FC<{children: React.ReactNode}> = ({children}) => (
	<div style={{position: 'absolute', left: 0, right: 0, bottom: 70, textAlign: 'center', fontFamily: CJK_SANS, fontWeight: 500, fontSize: 54, color: B.ink, letterSpacing: '0.06em', textShadow: '0 2px 18px rgba(0,0,0,0.9)'}}>{children}</div>
);
const BFrame: React.FC<{children: React.ReactNode; kx?: number; ky?: number}> = ({children, kx = 520, ky = 600}) => (
	<AbsoluteFill style={{background: B.bg}}>
		<AbsoluteFill style={{background: `radial-gradient(900px 700px at ${kx}px ${ky}px, rgba(120,92,58,0.38), rgba(10,10,11,0) 70%)`}} />
		{children}
		<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.7) 100%)'}} />
		<Noise o={0.35} blend="screen" />
		<div style={{position: 'absolute', top: 54, right: 72, fontFamily: INTER, fontSize: 15, letterSpacing: '0.4em', color: B.mute}}>JUNO · VIBE知识大赏</div>
	</AbsoluteFill>
);
const B1 = () => (
	<BFrame kx={480} ky={640}>
		{/* the phone, out of focus: a light source, not a UI */}
		<div style={{position: 'absolute', left: 300, top: 300, width: 330, height: 640, borderRadius: 54, background: 'linear-gradient(170deg,#ffb48a,#e8653f 30%,#f3ece2 32%,#f3ece2)', filter: 'blur(18px)', opacity: 0.55, transform: 'rotate(-8deg)'}} />
		{[[200, 260, 60], [760, 820, 90], [130, 760, 40], [690, 240, 30]].map(([x, y, r], i) => <div key={i} style={{position: 'absolute', left: x, top: y, width: r, height: r, borderRadius: '50%', background: 'rgba(255,200,140,0.25)', filter: 'blur(6px)'}} />)}
		<div style={{position: 'absolute', left: 940, top: 250, color: B.ink}}>
			<div style={{fontFamily: INTER, fontSize: 16, letterSpacing: '0.45em', color: B.mute}}>RAISE · 涨的工资</div>
			<div style={{display: 'flex', alignItems: 'baseline', gap: 36, marginTop: 6}}>
				<div style={{fontFamily: GARA, fontWeight: 500, fontSize: 190, lineHeight: 1}}>¥0</div>
				<div style={{fontFamily: CJK_SERIF, fontSize: 36, color: B.mute}}>到账</div>
			</div>
			<div style={{width: 640, height: 1, background: 'linear-gradient(90deg, rgba(217,187,124,0.8), rgba(217,187,124,0))', margin: '26px 0 34px'}} />
			<div style={{fontFamily: INTER, fontSize: 16, letterSpacing: '0.45em', color: B.mute}}>TONIGHT · 今晚</div>
			<div style={{display: 'flex', alignItems: 'baseline', gap: 36, marginTop: 6}}>
				<div style={{fontFamily: GARA, fontWeight: 500, fontSize: 190, lineHeight: 1, color: B.gold}}>+¥32</div>
				<div style={{fontFamily: CJK_SERIF, fontSize: 36, color: B.mute}}>已经多花</div>
			</div>
		</div>
		<BSub>钱还没到，你今晚就多花了一点</BSub>
	</BFrame>
);
const B2 = () => {
	const cx = 960, cy = 470, rx = 430, ry = 270;
	return (
		<BFrame kx={960} ky={470}>
			<svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
				<defs>
					<linearGradient id="ring" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={B.red} stopOpacity={0.9} /><stop offset="1" stopColor={B.gold} stopOpacity={0.5} /></linearGradient>
				</defs>
				<ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke="url(#ring)" strokeWidth={2} />
				<ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke={B.red} strokeWidth={10} strokeOpacity={0.12} />
				{[0, 1, 2, 3].map((k) => {
					const a = -Math.PI / 2 + (k * Math.PI) / 2 + 0.7;
					return <circle key={k} cx={cx + rx * Math.cos(a)} cy={cy + ry * Math.sin(a)} r={6} fill={B.red} />;
				})}
				<rect x={cx - 150} y={cy - 85} width={300} height={170} fill="none" stroke={B.gold} strokeOpacity={0.8} strokeWidth={1.2} />
				<text x={cx} y={cy - 32} textAnchor="middle" style={{fontFamily: INTER, fontSize: 14, letterSpacing: '0.6em'}} fill={B.mute}>IOU · 借条</text>
				<text x={cx} y={cy + 32} textAnchor="middle" style={{fontFamily: CJK_SERIF, fontSize: 60, fontWeight: 700}} fill={B.ink}>西班牙</text>
			</svg>
			{loopNodes.map((txt, k) => {
				const a = -Math.PI / 2 + (k * Math.PI) / 2;
				const x = cx + (rx + 70) * Math.cos(a) * 1.15, y = cy + (ry + 60) * Math.sin(a);
				return (
					<div key={k} style={{position: 'absolute', left: x - 200, top: y - 30, width: 400, textAlign: 'center'}}>
						<div style={{fontFamily: CJK_SERIF, fontSize: 38, fontWeight: 600, color: k === 2 ? '#e6735c' : B.ink}}>{txt}</div>
					</div>
				);
			})}
			<BSub>越借不到，就越<span style={{color: '#e6735c'}}>真</span>还不上</BSub>
		</BFrame>
	);
};

/* ======================= C · 极简发布会 (keynote minimal) ======================= */
const C = {bg: '#000', ink: '#fff', mute: '#8a8a8a', acc: '#ff5a1f'};
const CSub: React.FC<{children: React.ReactNode}> = ({children}) => (
	<div style={{position: 'absolute', left: 0, right: 0, bottom: 72, textAlign: 'center', fontFamily: CJK_SANS, fontWeight: 700, fontSize: 54, color: C.ink}}>{children}</div>
);
const C1 = () => (
	<AbsoluteFill style={{background: C.bg}}>
		<div style={{position: 'absolute', left: 0, right: 0, top: 210, textAlign: 'center', fontFamily: CJK_SANS, fontSize: 34, fontWeight: 500, color: C.mute}}>今晚，你多花了</div>
		<div style={{position: 'absolute', left: 0, right: 0, top: 270, textAlign: 'center', fontFamily: INTER, fontWeight: 600, fontSize: 300, letterSpacing: '-0.04em', color: C.ink, lineHeight: 1}}>
			<span style={{color: C.acc}}>+</span>¥32
		</div>
		{/* two bars: arrived vs spent */}
		<div style={{position: 'absolute', left: 560, top: 640, width: 800, fontFamily: CJK_SANS}}>
			{[['涨的工资 · 已到账', 0, '¥0', C.mute], ['今晚 · 已多花', 1, '¥32', C.acc]].map(([l, v, n, c]) => (
				<div key={l as string} style={{display: 'flex', alignItems: 'center', gap: 24, marginBottom: 22}}>
					<div style={{width: 250, fontSize: 26, color: C.mute, textAlign: 'right'}}>{l}</div>
					<div style={{flex: 1, height: 14, borderRadius: 7, background: '#1d1d1d', overflow: 'hidden'}}><div style={{width: `${(v as number) * 100}%`, height: '100%', background: c as string}} /></div>
					<div style={{width: 90, fontFamily: INTER, fontSize: 30, fontWeight: 600, color: c as string}}>{n}</div>
				</div>
			))}
		</div>
		<CSub>钱还没到，你今晚就多花了一点</CSub>
	</AbsoluteFill>
);
const C2 = () => {
	const cx = 960, cy = 450, r = 280;
	return (
		<AbsoluteFill style={{background: C.bg}}>
			<svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
				<circle cx={cx} cy={cy} r={r} fill="none" stroke="#222" strokeWidth={26} />
				<circle cx={cx} cy={cy} r={r} fill="none" stroke={C.acc} strokeWidth={26} strokeDasharray={`${2 * Math.PI * r * 0.7} 9999`} transform={`rotate(-90 ${cx} ${cy})`} strokeLinecap="round" />
				<text x={cx} y={cy - 10} textAnchor="middle" style={{fontFamily: CJK_SANS, fontSize: 76, fontWeight: 900}} fill={C.ink}>西班牙</text>
				<text x={cx} y={cy + 50} textAnchor="middle" style={{fontFamily: CJK_SANS, fontSize: 28}} fill={C.mute}>越转越快的债</text>
			</svg>
			{loopNodes.map((txt, k) => {
				const a = -Math.PI / 2 + (k * Math.PI) / 2;
				const x = cx + (r + 230) * Math.cos(a), y = cy + (r + 50) * Math.sin(a);
				return (
					<div key={k} style={{position: 'absolute', left: x - 200, top: y - 24, width: 400, textAlign: 'center', fontFamily: CJK_SANS, fontSize: 34, fontWeight: 700, color: k === 2 ? C.acc : C.ink}}>
						<span style={{fontFamily: INTER, color: C.mute, marginRight: 10}}>0{k + 1}</span>{txt}
					</div>
				);
			})}
			<CSub>越借不到，就越<span style={{color: C.acc}}>真</span>还不上</CSub>
		</AbsoluteFill>
	);
};

const FR = [A1, A2, B1, B2, C1, C2];
const Frame: React.FC<{i: number}> = ({i}) => {
	useFonts();
	const F = FR[i];
	return <F />;
};
const Root: React.FC = () => <Composition id="L27" component={Frame} durationInFrames={1} fps={30} width={W} height={H} defaultProps={{i: 0}} />;
registerRoot(Root);
