import React from 'react';
import {AbsoluteFill, Composition, registerRoot, useCurrentFrame} from 'remotion';

/* 《悲伤五阶段》 Greek look test: red-figure pottery. Terracotta figures in profile on black glaze, painted detail in
   black line, a meander border, each myth on the inside (tondo) of a drinking cup. 愤怒 = Achilles, 接受 = Demeter. */

const W = 1920, H = 1080, FPS = 30;
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
const rnd = (i: number, k = 0) => { const v = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return v - Math.floor(v); };
const SERIF = '"Noto Serif CJK SC", serif';
const GOLD = '#e6c47a', INK = '#140a06', TC = '#d8743c', DIL = '#8a3d17', WHITE = '#f6ead8';
const PROFILE = 'M14,-220 C80,-216 120,-182 128,-132 C131,-116 130,-106 136,-96 C142,-84 146,-74 152,-60 C162,-40 172,-28 176,-18 C178,-10 170,-4 158,-4 C152,-4 152,2 158,8 C164,14 160,20 152,22 C158,26 158,34 150,40 C144,44 144,52 148,60 C152,78 140,96 114,100 C90,104 72,112 64,132 C58,170 60,220 70,280 C96,320 170,344 230,372 C270,396 288,470 294,640 L-290,640 C-284,470 -262,396 -206,366 C-146,342 -104,322 -92,280 C-80,220 -78,150 -88,90 C-124,52 -156,-10 -154,-84 C-150,-170 -70,-224 14,-220 Z';

const Defs: React.FC<{glow: string}> = ({glow}) => <defs>
	<filter id="gS" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3" /></filter>
	<filter id="gM" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="10" /></filter>
	<filter id="gL" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="34" /></filter>
	<linearGradient id="goldG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fff2c8" /><stop offset="0.5" stopColor={GOLD} /><stop offset="1" stopColor="#a8823c" /></linearGradient>
	<linearGradient id="tcG" x1="0.2" y1="0" x2="0.8" y2="1"><stop offset="0" stopColor="#ec9258" /><stop offset="0.6" stopColor={TC} /><stop offset="1" stopColor="#b85a28" /></linearGradient>
	<radialGradient id="glaze" cx="0.45" cy="0.35" r="0.7"><stop offset="0" stopColor="#1e1410" /><stop offset="0.7" stopColor="#0c0806" /><stop offset="1" stopColor="#050302" /></radialGradient>
	<radialGradient id="aura" ><stop offset="0" stopColor={glow} stopOpacity="0.35" /><stop offset="1" stopColor={glow} stopOpacity="0" /></radialGradient>
	<clipPath id="tondo"><circle cx={1350} cy={540} r={430} /></clipPath>
</defs>;

/** the cup: black glaze, a meander band, a terracotta rim */
const Cup: React.FC<{cx: number; cy: number}> = ({cx, cy}) => {
	const r1 = 436, r2 = 488, N = 40, da = Math.PI * 2 / N;
	const P_ = (a: number, r: number) => `${(cx + Math.cos(a) * r).toFixed(1)},${(cy + Math.sin(a) * r).toFixed(1)}`;
	const unit = (k: number) => { const a0 = k * da, m = (x: number, y: number) => P_(a0 + x * da, r2 - 8 - y * (r2 - r1 - 16)); return `M${m(0, 1)} L${m(0, 0)} L${m(0.8, 0)} L${m(0.8, 0.72)} L${m(0.32, 0.72)} L${m(0.32, 0.36)} L${m(0.56, 0.36)}`; };
	return <g>
		<circle cx={cx} cy={cy} r={r2 + 34} fill="#0c0806" stroke={TC} strokeWidth={3} />
		<circle cx={cx} cy={cy} r={r2} fill="#0c0806" stroke={TC} strokeWidth={4} />
		<path d={Array.from({length: N}, (_, k) => unit(k)).join(' ')} stroke={TC} strokeWidth={5} fill="none" strokeLinejoin="miter" />
		<circle cx={cx} cy={cy} r={r1} fill="url(#glaze)" stroke={TC} strokeWidth={4} />
	</g>;
};

const NameBlock: React.FC<{n: string; ch: string; en: string; myth: string; say: string}> = ({n, ch, en, myth, say}) => <g>
	<text x={150} y={330} style={{fontFamily: SERIF, fontWeight: 700, fontSize: 38, letterSpacing: '0.16em'}} fill="#f3e6d2">{`悲伤的第${n}个阶段，它叫`}</text>
	<text x={140} y={640} style={{fontFamily: SERIF, fontWeight: 900, fontSize: 250}} fill={GOLD} opacity={0.55} filter="url(#gL)">{ch}</text>
	<text x={140} y={640} style={{fontFamily: SERIF, fontWeight: 900, fontSize: 250}} fill="url(#goldG)">{ch}</text>
	<rect x={652} y={410} width={6} height={230} fill="url(#goldG)" />
	<text x={672} y={470} style={{fontFamily: SERIF, fontWeight: 600, fontSize: 48, fontStyle: 'italic'}} fill="#f3e6d2">{en}</text>
	<text x={672} y={530} style={{fontFamily: SERIF, fontWeight: 600, fontSize: 24, letterSpacing: '0.14em'}} fill={GOLD}>{myth}</text>
	<text x={150} y={770} style={{fontFamily: SERIF, fontWeight: 800, fontSize: 48}} fill="#f3e6d2">{say}</text>
</g>;

/** a red-figure head in profile (facing +x): terracotta reserve, black line detail */
const Head: React.FC<{eye: 'anger' | 'calm'; mouth: 'set' | 'smile'}> = ({eye, mouth}) => <g>
	<path d={PROFILE} fill="url(#tcG)" stroke={INK} strokeWidth={3.5} />
	{/* ear */}
	<path d="M-34,-92 C-58,-96 -62,-56 -44,-40 C-38,-36 -32,-40 -34,-50 M-42,-78 C-50,-70 -48,-58 -40,-56" stroke={INK} strokeWidth={2.4} fill="none" />
	{/* eye: almond with the iris drawn as a dot, the way vase painters drew it */}
	<path d="M86,-98 C98,-110 118,-110 130,-98 C118,-90 98,-90 86,-98 Z" fill={WHITE} stroke={INK} strokeWidth={2.6} />
	<circle cx={114} cy={-99} r={5.5} fill={INK} />
	{eye === 'anger' ? <path d="M78,-130 C100,-128 118,-120 136,-108" stroke={INK} strokeWidth={5} strokeLinecap="round" fill="none" />
		: <path d="M80,-122 C100,-132 120,-130 136,-120" stroke={INK} strokeWidth={3} strokeLinecap="round" fill="none" />}
	{eye === 'calm' && <path d="M88,-98 C100,-90 118,-90 130,-98" stroke={INK} strokeWidth={3.4} fill="none" />}
	<path d="M152,8 C160,12 158,18 150,22" stroke={INK} strokeWidth={2.2} fill="none" />
	{mouth === 'set' ? <path d="M134,28 L156,26" stroke={INK} strokeWidth={3} /> : <path d="M134,26 C142,32 150,30 156,24" stroke={INK} strokeWidth={2.6} fill="none" />}
	<path d="M60,140 C90,150 120,140 140,120" stroke={DIL} strokeWidth={1.6} fill="none" opacity={0.8} />
</g>;

// ---------------------------------------------------------------- 愤怒: Achilles
const Achilles: React.FC = () => {
	const T = useCurrentFrame() / FPS, cx = 1350, cy = 540;
	const crest = (w: number) => `M60,-300 C40,-${400 + w} -120,-${430 + w} -230,-${330 + w * 0.5} C-290,-270 -320,-180 -330,-90 C-300,-170 -250,-250 -180,-${300 + w * 0.3} C-110,-345 -20,-345 30,-292 Z`;
	const w = 10 * Math.sin(T * 2.4);
	return <AbsoluteFill style={{background: '#060403'}}>
		<svg width={W} height={H}>
			<Defs glow="#ff5a1a" />
			<rect width={W} height={H} fill="#060403" />
			<circle cx={cx} cy={cy} r={720} fill="url(#aura)" />
			<Cup cx={cx} cy={cy} />
			<g clipPath="url(#tondo)">
				<g transform={`translate(${cx + 40},${cy + 60}) scale(-1.2,1.2)`}>
					{/* spear and shield behind him */}
					<path d="M-330,520 L330,-560" stroke={INK} strokeWidth={13} /><path d="M-330,520 L330,-560" stroke={TC} strokeWidth={7} />
					<path d="M330,-560 C350,-610 380,-640 400,-660 C384,-626 372,-596 352,-546 Z" fill="url(#tcG)" stroke={INK} strokeWidth={3} />
					<g transform="translate(-270,380)"><circle r={250} fill="url(#tcG)" stroke={INK} strokeWidth={6} /><circle r={214} fill="none" stroke={INK} strokeWidth={3} />
						{Array.from({length: 16}, (_, i) => <path key={i} transform={`rotate(${i * 22.5})`} d="M0,-40 L12,-150 L0,-178 L-12,-150 Z" fill={INK} />)}<circle r={40} fill={INK} /></g>
					<Head eye="anger" mouth="set" />
					{/* cuirass: shoulder flap and the line of the breastplate */}
					<path d="M-80,300 C20,276 150,300 262,366 L240,420 C140,360 30,340 -60,350 Z" fill="url(#tcG)" stroke={INK} strokeWidth={3} />
					{[0, 1, 2].map((k) => <circle key={k} cx={20 + k * 70} cy={318 + k * 14} r={6} fill="none" stroke={INK} strokeWidth={2} />)}
					<path d="M60,420 C120,440 180,480 220,540" stroke={INK} strokeWidth={2.4} fill="none" />
					{[0, 1, 2, 3, 4].map((k) => <path key={'p' + k} d={`M${-40 + k * 50},380 L${-50 + k * 54},640`} stroke={DIL} strokeWidth={1.6} />)}
					{/* curls at the nape, under the helmet */}
					<path d="M-150,-110 C-176,-30 -168,40 -126,92 L-92,92 C-110,40 -112,-30 -96,-104 Z" fill={INK} />
					{Array.from({length: 7}, (_, i) => <circle key={i} cx={-132 + (i % 2) * 14} cy={-70 + i * 22} r={6} fill="none" stroke={DIL} strokeWidth={2} />)}
					{/* crest: horsehair arching from brow to nape, reserved in terracotta with black stripes */}
					<path d={`M110,-236 C90,-${360 + w} -80,-${410 + w} -210,-${330 + w * 0.6} C-270,-290 -300,-220 -310,-140 C-280,-200 -230,-262 -150,-${296 + w * 0.3} C-60,-330 40,-320 70,-250 Z`} fill="url(#tcG)" stroke={INK} strokeWidth={3.5} />
					{Array.from({length: 12}, (_, i) => { const u = i / 11; return <path key={'c' + i} d={`M${lerp(100, 60, u)},${lerp(-240, -250, u)} C${lerp(80, 30, u)},-${lerp(350, 300, u) + w} ${lerp(-80, -100, u)},-${lerp(400, 320, u) + w} ${lerp(-210, -200, u)},-${lerp(326, 290, u) + w * 0.5} C${lerp(-266, -240, u)},${lerp(-288, -250, u)} ${lerp(-296, -260, u)},${lerp(-220, -190, u)} ${lerp(-306, -270, u)},${lerp(-146, -150, u)}`} stroke={INK} strokeWidth={1.4} fill="none" opacity={0.75} />; })}
					{/* Corinthian helmet on the head: bowl, brow ridge, nose guard, cheek piece */}
					<path d="M-166,-40 C-178,-196 -80,-262 22,-258 C112,-254 156,-200 152,-134 L174,-128 L172,-104 L132,-110 C126,-168 88,-206 22,-210 C-62,-212 -126,-160 -134,-40 Z" fill="url(#tcG)" stroke={INK} strokeWidth={3.5} />
					<path d="M-150,-140 C-90,-200 40,-226 150,-160" stroke={INK} strokeWidth={2.4} fill="none" />
					<path d="M-150,-120 C-90,-176 40,-200 140,-140" stroke={INK} strokeWidth={1.4} fill="none" strokeDasharray="5 7" />
					<path d="M-166,-40 C-170,0 -160,40 -140,70 L-118,60 C-132,30 -136,-10 -134,-40 Z" fill="url(#tcG)" stroke={INK} strokeWidth={3} />
					{Array.from({length: 6}, (_, i) => <circle key={'h' + i} cx={-120 + i * 46} cy={-196 - Math.sin(i / 5 * Math.PI) * 30} r={3.6} fill={INK} />)}
				</g>
			</g>
			<NameBlock n="二" ch="愤怒" en="Anger" myth="ACHILLES · 阿喀琉斯" say="生气，是因为还放不下。" />
		</svg>
	</AbsoluteFill>;
};

// ---------------------------------------------------------------- 接受: Demeter
const Demeter: React.FC = () => {
	const T = useCurrentFrame() / FPS, cx = 1350, cy = 540;
	const ear = (x: number, y: number, a: number, s = 1) => <g transform={`translate(${x},${y}) rotate(${a}) scale(${s})`}>{Array.from({length: 6}, (_, i) => [1, -1].map((side) => <ellipse key={i + '' + side} cx={side * 6} cy={-i * 13} rx={6} ry={10} transform={`rotate(${side * 20},${side * 6},${-i * 13})`} fill="url(#tcG)" stroke={INK} strokeWidth={1.6} />))}<line x1={0} y1={0} x2={0} y2={-80} stroke={INK} strokeWidth={1.4} /></g>;
	return <AbsoluteFill style={{background: '#060403'}}>
		<svg width={W} height={H}>
			<Defs glow="#ffd27a" />
			<rect width={W} height={H} fill="#060403" />
			<circle cx={cx} cy={cy} r={720} fill="url(#aura)" />
			<Cup cx={cx} cy={cy} />
			<g clipPath="url(#tondo)">
				{/* spring returns: blossoms along the inside of the rim */}
				{Array.from({length: 22}, (_, i) => { const a = (i / 22) * Math.PI * 2, r = 400 - 20 * rnd(i, 3), x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r; return <g key={i} transform={`translate(${x},${y}) rotate(${T * 10 + i * 30}) scale(${0.8 + 0.3 * rnd(i, 4)})`}>{Array.from({length: 5}, (_, p) => <ellipse key={p} cx={0} cy={-9} rx={6} ry={10} transform={`rotate(${p * 72})`} fill={WHITE} stroke={INK} strokeWidth={1} />)}<circle r={4} fill={TC} /></g>; })}
				<g transform={`translate(${cx + 30},${cy + 70}) scale(-1.2,1.2)`}>
					{/* a sheaf of wheat over her shoulder */}
					{Array.from({length: 7}, (_, i) => { const tx = -330 + i * 38, ty = -300 - 40 * Math.sin(i * 0.9); return <g key={i}><line x1={-150 + i * 10} y1={420} x2={tx} y2={ty} stroke={INK} strokeWidth={5} /><line x1={-150 + i * 10} y1={420} x2={tx} y2={ty} stroke={TC} strokeWidth={2.2} />{ear(tx, ty, -30 + i * 7, 1.5)}</g>; })}
					<Head eye="calm" mouth="smile" />
					{/* hair gathered into a bun, waves over the crown, a curl at the temple */}
					<ellipse cx={-176} cy={-150} rx={74} ry={62} fill={INK} />
					<path d="M-166,-60 C-182,-200 -80,-262 22,-256 C110,-250 152,-196 140,-136 C120,-150 96,-156 70,-150 C40,-186 -20,-196 -70,-180 C-120,-160 -142,-110 -142,-50 Z" fill={INK} />
					{Array.from({length: 6}, (_, i) => <path key={i} d={`M${100 - i * 34},${-226 + i * 6} C${60 - i * 34},${-210 + i * 4} ${20 - i * 34},${-200 + i * 6} ${-20 - i * 34},${-190 + i * 8}`} stroke={DIL} strokeWidth={1.8} fill="none" />)}
					<path d="M128,-140 C140,-120 134,-100 120,-96" stroke={INK} strokeWidth={4} fill="none" />
					{/* a band of wheat ears round her head, a diadem */}
					<path d="M-120,-212 C-40,-250 60,-250 130,-196" stroke={INK} strokeWidth={10} fill="none" /><path d="M-120,-212 C-40,-250 60,-250 130,-196" stroke={GOLD} strokeWidth={4} fill="none" />
					{[-100, -50, 0, 50, 100].map((x, i) => ear(x, -236 + Math.abs(x) * 0.18 + (x > 60 ? 18 : 0), -10 + i * 6, 0.7))}
					<circle cx={-30} cy={-24} r={9} fill={GOLD} stroke={INK} strokeWidth={1.4} /><circle cx={-30} cy={-6} r={6} fill={WHITE} stroke={INK} strokeWidth={1} />
					{/* chiton: fine pleats; himation over the shoulder */}
					{Array.from({length: 18}, (_, i) => <path key={'pl' + i} d={`M${-40 + i * 16},${300 + Math.abs(i - 9) * 2} C${-44 + i * 16},420 ${-40 + i * 17},520 ${-46 + i * 18},640`} stroke={INK} strokeWidth={1.2} opacity={0.75} />)}
					<path d="M-300,380 C-200,320 -40,310 120,380 C190,420 240,500 270,640 L-290,640 Z" fill="url(#tcG)" stroke={INK} strokeWidth={3} />
					{[0, 1, 2, 3].map((k) => <path key={'h' + k} d={`M${-240 + k * 80},${360 + k * 6} C${-180 + k * 80},460 ${-140 + k * 80},560 ${-120 + k * 80},640`} stroke={INK} strokeWidth={2} fill="none" />)}
					<path d="M-300,380 C-200,320 -40,310 120,380" stroke={INK} strokeWidth={9} fill="none" /><path d="M-300,380 C-200,320 -40,310 120,380" stroke={GOLD} strokeWidth={3} fill="none" strokeDasharray="8 8" />
				</g>
			</g>
			<NameBlock n="五" ch="接受" en="Acceptance" myth="DEMETER · 得墨忒耳" say="接受，不是忘记，是带着它往前走。" />
		</svg>
	</AbsoluteFill>;
};

registerRoot(() => <>
	<Composition id="Achilles" component={Achilles} durationInFrames={90} fps={FPS} width={W} height={H} />
	<Composition id="Demeter" component={Demeter} durationInFrames={90} fps={FPS} width={W} height={H} />
</>);
