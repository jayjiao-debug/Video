/* ep62 (三种神器 · 火影里的神器真的存在) — three look frames for the opening choice, 4:3 1440 × 1080.
   LOOK62A: the legendary-item reveal (no figure): the iris-leaf sword floating in the rain, halo, item plate.
   LOOK62B: an ORIGINAL ninja of our own (no anime character) on a temple roof against the full moon.
   LOOK62C: the myth: Susanoo with the Totsuka sword before the eight-headed serpent and the eight sake vats.
   Flat vector, one-tone silhouettes with rim light, layered depth, glow and particles. */
import React from 'react';
import {AbsoluteFill, Composition, registerRoot} from 'remotion';

const W = 1440, H = 1080;
const F = "'Noto Serif CJK SC','Noto Serif CJK',serif";
const rng = (seed: number) => { let s = seed * 9973 + 7; return () => (s = (s * 16807) % 2147483647) / 2147483647; };

const Rain: React.FC<{n: number; seed: number; ang?: number; len?: [number, number]; op?: [number, number]; c?: string; w?: number}> = ({n, seed, ang = 14, len = [40, 110], op = [0.15, 0.5], c = '#BFD2FF', w = 2}) => {
	const R = rng(seed), dx = Math.tan((ang * Math.PI) / 180);
	return <g stroke={c} strokeWidth={w} strokeLinecap="round">{Array.from({length: n}, (_, i) => { const x = R() * (W + 200) - 100, y = R() * H, l = len[0] + R() * (len[1] - len[0]);
		return <line key={i} x1={x} y1={y} x2={x - dx * l} y2={y + l} opacity={op[0] + R() * (op[1] - op[0])} />; })}</g>;
};
const Sparks: React.FC<{n: number; seed: number; cx: number; cy: number; r: number; c?: string}> = ({n, seed, cx, cy, r, c = '#FFD98A'}) => {
	const R = rng(seed);
	return <g>{Array.from({length: n}, (_, i) => { const a = R() * Math.PI * 2, d = r * Math.sqrt(R()), s = 1.5 + R() * 4;
		return <circle key={i} cx={cx + Math.cos(a) * d} cy={cy + Math.sin(a) * d * 0.9} r={s} fill={c} opacity={0.3 + R() * 0.7} />; })}</g>;
};
const Caption: React.FC<{parts: [string, boolean][]}> = ({parts}) => <div style={{position: 'absolute', left: 0, width: W, bottom: 92, textAlign: 'center', fontFamily: F, fontWeight: 900, fontSize: 60,
	letterSpacing: 2, color: '#F6EEDC', textShadow: '0 3px 0 rgba(0,0,0,0.55), 0 0 22px rgba(0,0,0,0.75)'}}>
	{parts.map(([t, k], i) => <span key={i} style={{color: k ? '#FFCF6A' : undefined}}>{t}</span>)}</div>;
const Grain: React.FC = () => <rect width={W} height={H} filter="url(#grain)" opacity={0.08} />;
const Defs: React.FC = () => <defs>
	<filter id="b4"><feGaussianBlur stdDeviation={4} /></filter><filter id="b10"><feGaussianBlur stdDeviation={10} /></filter>
	<filter id="b24"><feGaussianBlur stdDeviation={24} /></filter><filter id="b60"><feGaussianBlur stdDeviation={60} /></filter>
	<filter id="grain"><feTurbulence type="fractalNoise" baseFrequency={0.9} numOctaves={2} seed={3} /><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.9 0" /></filter>
	<radialGradient id="vig" cx="50%" cy="48%" r="70%"><stop offset="55%" stopColor="#000" stopOpacity={0} /><stop offset="100%" stopColor="#000" stopOpacity={0.7} /></radialGradient>
</defs>;

/* ---------------------------------------------------------------- A: the legendary sword */
const Sword: React.FC<{x: number; y: number; L: number; a: number}> = ({x, y, L, a}) => {
	// iris-leaf (菖蒲) double-edged blade: widest a third of the way up, a ridge down the middle; guard, wrapped grip, gold pommel
	const bw = L * 0.06, tip = -L, wide = -L * 0.38;
	const blade = `M${-bw * 0.62} 0 C${-bw * 0.8} ${wide * 0.5} ${-bw} ${wide} ${-bw * 0.92} ${wide - L * 0.12} C${-bw * 0.7} ${tip * 0.86} ${-bw * 0.25} ${tip * 0.97} 0 ${tip}
		C${bw * 0.25} ${tip * 0.97} ${bw * 0.7} ${tip * 0.86} ${bw * 0.92} ${wide - L * 0.12} C${bw} ${wide} ${bw * 0.8} ${wide * 0.5} ${bw * 0.62} 0Z`;
	return <g transform={`translate(${x},${y}) rotate(${a})`}>
		<path d={blade} fill="#BFE6FF" filter="url(#b24)" opacity={0.9} />
		<path d={blade} fill="url(#steel)" stroke="#0A0E1C" strokeWidth={4} />
		<path d={`M0 -6 L0 ${tip + 26}`} stroke="#FFFFFF" strokeWidth={3} opacity={0.85} />
		<path d={`M${-bw * 0.55} -10 C${-bw * 0.72} ${wide * 0.5} ${-bw * 0.86} ${wide} ${-bw * 0.78} ${wide - L * 0.12}`} stroke="#FFFFFF" strokeWidth={2.5} fill="none" opacity={0.7} />
		<rect x={-bw * 1.9} y={-6} width={bw * 3.8} height={22} rx={8} fill="url(#gold)" stroke="#2A1A06" strokeWidth={3} />
		<rect x={-bw * 0.62} y={16} width={bw * 1.24} height={L * 0.27} rx={6} fill="#1A1420" stroke="#05040A" strokeWidth={3} />
		{Array.from({length: 9}, (_, i) => <path key={i} d={`M${-bw * 0.62} ${24 + i * L * 0.028}l${bw * 1.24} ${L * 0.016}`} stroke="#6B4A2A" strokeWidth={5} />)}
		<ellipse cx={0} cy={16 + L * 0.27 + 12} rx={bw * 0.95} ry={16} fill="url(#gold)" stroke="#2A1A06" strokeWidth={3} />
	</g>;
};
const LookA: React.FC = () => {
	const R = rng(5);
	return <AbsoluteFill style={{background: '#04060E'}}><svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
		<Defs />
		<defs>
			<linearGradient id="skyA" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#05070F" /><stop offset="0.55" stopColor="#0F1634" /><stop offset="1" stopColor="#1E1236" /></linearGradient>
			<linearGradient id="steel" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#F4F8FF" /><stop offset="0.48" stopColor="#D8E2F4" /><stop offset="0.52" stopColor="#8E9BBA" /><stop offset="1" stopColor="#5E6A8A" /></linearGradient>
			<linearGradient id="gold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#FFE9A8" /><stop offset="0.5" stopColor="#D9A441" /><stop offset="1" stopColor="#8A5A14" /></linearGradient>
			<radialGradient id="halo" cx="50%" cy="50%" r="50%"><stop offset="0" stopColor="#FFE2A0" stopOpacity={0.75} /><stop offset="0.35" stopColor="#E8A64A" stopOpacity={0.3} /><stop offset="1" stopColor="#E8A64A" stopOpacity={0} /></radialGradient>
			<linearGradient id="plate" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#0A0D1C" stopOpacity={0} /><stop offset="0.15" stopColor="#0A0D1C" stopOpacity={0.85} /><stop offset="1" stopColor="#0A0D1C" stopOpacity={0.85} /></linearGradient>
		</defs>
		<rect width={W} height={H} fill="url(#skyA)" />
		<ellipse cx={1120} cy={150} rx={420} ry={190} fill="#8C7CFF" opacity={0.28} filter="url(#b60)" />
		<path d="M1180 40 l-40 110 l46 -12 l-62 150" stroke="#E6E0FF" strokeWidth={5} fill="none" opacity={0.7} filter="url(#b4)" />
		{/* layered cedar ridges */}
		{[[0.25, 700, '#1A2146'], [0.5, 790, '#10152F'], [1, 900, '#05070F']].map(([o, y, c], k) => <path key={k} fill={c as string} opacity={o as number}
			d={`M0 ${H}V${(y as number)}` + Array.from({length: 30}, (_, i) => { const x = i * 52, h = 40 + R() * 90; return `L${x + 10} ${(y as number) - h * 0.3}L${x + 26} ${(y as number) - h}L${x + 42} ${(y as number) - h * 0.3}`; }).join('') + `L${W} ${y}V${H}Z`} />)}
		<ellipse cx={720} cy={860} rx={900} ry={120} fill="#3A3F7A" opacity={0.35} filter="url(#b60)" />
		{/* halo, magic ring, rays */}
		<circle cx={720} cy={470} r={420} fill="url(#halo)" />
		<g transform="translate(720 470)" opacity={0.55}>
			{Array.from({length: 24}, (_, i) => <path key={i} d="M-6 -150 L0 -470 L6 -150Z" fill="#FFE2A0" opacity={i % 2 ? 0.25 : 0.5} transform={`rotate(${i * 15})`} />)}
			<circle r={300} fill="none" stroke="#FFD98A" strokeWidth={2} /><circle r={318} fill="none" stroke="#FFD98A" strokeWidth={1} strokeDasharray="4 10" />
			{Array.from({length: 48}, (_, i) => <line key={i} x1={0} y1={-300} x2={0} y2={i % 4 ? -290 : -280} stroke="#FFD98A" strokeWidth={2} transform={`rotate(${i * 7.5})`} />)}
		</g>
		<Sparks n={120} seed={8} cx={720} cy={470} r={420} />
		<Rain n={170} seed={2} op={[0.08, 0.3]} />
		<Sword x={700} y={760} L={600} a={9} />
		<Rain n={70} seed={9} len={[90, 180]} op={[0.25, 0.6]} w={3} />
		{/* item plate */}
		<g transform="translate(905 230)">
			<rect x={0} y={0} width={470} height={150} fill="url(#plate)" /><rect x={70} y={0} width={400} height={3} fill="#D9A441" /><rect x={70} y={147} width={400} height={3} fill="#D9A441" />
			<text x={110} y={78} fontFamily={F} fontWeight={900} fontSize={66} fill="#FFD98A" letterSpacing={6}>草薙剑</text>
			<text x={112} y={124} fontFamily={F} fontWeight={700} fontSize={26} fill="#C9CFE8" letterSpacing={3}>天丛云剑 · 三种神器</text>
			<text x={380} y={124} fontFamily={F} fontSize={24} fill="#FFCF6A">★★★★★</text>
		</g>
		<rect width={W} height={H} fill="url(#vig)" /><Grain />
	</svg>
		<Caption parts={[['火影里，这把剑叫', false], ['草薙剑', true], ['。', false]]} />
	</AbsoluteFill>;
};

/* ---------------------------------------------------------------- B: an original ninja against the moon */
const Ninja: React.FC = () => <g>
	{/* scarf (signature crimson) streaming left from the neck */}
	<path d="M592 528 C540 506 500 540 446 516 C396 494 356 522 296 500 C340 540 392 524 440 548 C492 574 540 552 590 548Z" fill="#B3262E" stroke="#3A0A0E" strokeWidth={3} />
	<path d="M584 540 C548 572 512 580 474 610 C512 606 550 596 590 560Z" fill="#8E1C24" stroke="#3A0A0E" strokeWidth={3} />
	<g fill="#05070E">
		{/* head-cloth tails */}
		<path d="M560 490 C530 474 506 486 478 470 C500 496 530 498 558 502Z" /><path d="M558 500 C534 500 516 516 492 512 C512 526 536 520 560 510Z" />
		{/* back arm */}
		<path d="M556 540 C540 562 534 586 540 616 L554 616 C552 590 560 568 572 552Z" /><circle cx={548} cy={620} r={9} />
		{/* trousers, baggy, bound at the shin; back leg and front leg */}
		<path d="M556 616 C534 652 528 690 528 716 C527 736 522 748 518 760 L542 762 C546 744 552 728 556 708 C564 676 576 650 584 622Z" />
		<path d="M574 618 C606 640 624 676 628 704 C632 728 640 744 646 758 L624 762 C618 744 612 730 606 712 C596 680 580 656 562 630Z" />
		<path d="M520 744 L546 748 M610 744 L638 742" stroke="#05070E" strokeWidth={8} />
		<path d="M506 758 L546 758 L550 774 L502 774Z" /><path d="M620 756 L662 760 L664 774 L616 774Z" />
		{/* torso, chest forward, belt */}
		<path d="M548 534 C566 522 596 522 614 534 L620 562 C616 592 606 610 600 620 L556 620 C548 596 544 566 548 534Z" />
		<rect x={552} y={608} width={52} height={14} rx={4} />
		{/* neck + hooded head */}
		<path d="M570 516 L592 516 L594 530 L568 530Z" /><circle cx={582} cy={498} r={24} /><path d="M558 494 C560 470 600 466 608 492 L606 500 C596 480 570 480 558 494Z" />
		{/* front arm down to the hilt */}
		<path d="M600 540 C618 560 628 584 628 612 L612 616 C612 592 604 572 590 556Z" /><circle cx={622} cy={622} r={10} />
	</g>
	{/* the blade, held low, catching the moon */}
	<path d="M628 632 L756 772" stroke="#DCE6FF" strokeWidth={7} strokeLinecap="round" /><path d="M628 632 L756 772" stroke="#FFFFFF" strokeWidth={2} />
	<path d="M612 616 L636 642" stroke="#05070E" strokeWidth={13} strokeLinecap="round" /><path d="M622 640 l14 -12" stroke="#C8902E" strokeWidth={6} strokeLinecap="round" />
	<path d="M588 494 L604 493" stroke="#F6E7C1" strokeWidth={3} strokeLinecap="round" />
</g>;
const LookB: React.FC = () => {
	const R = rng(11);
	return <AbsoluteFill style={{background: '#070B1E'}}><svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
		<Defs />
		<defs>
			<linearGradient id="skyB" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#070B1E" /><stop offset="0.6" stopColor="#1C2A55" /><stop offset="1" stopColor="#3B3D6C" /></linearGradient>
			<radialGradient id="moon" cx="45%" cy="40%" r="60%"><stop offset="0" stopColor="#FFF6DA" /><stop offset="0.8" stopColor="#F2DDA6" /><stop offset="1" stopColor="#E2C27E" /></radialGradient>
			<linearGradient id="roof" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1A2142" /><stop offset="1" stopColor="#06080F" /></linearGradient>
		</defs>
		<rect width={W} height={H} fill="url(#skyB)" />
		{Array.from({length: 70}, (_, i) => <circle key={i} cx={R() * W} cy={R() * 520} r={0.8 + R() * 1.8} fill="#DDE6FF" opacity={0.3 + R() * 0.6} />)}
		<circle cx={600} cy={440} r={470} fill="#F2DDA6" opacity={0.2} filter="url(#b60)" />
		<circle cx={600} cy={440} r={230} fill="url(#moon)" />
		{[[540, 390, 34], [660, 470, 22], [600, 520, 16], [690, 380, 12]].map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} fill="#D9BE80" opacity={0.35} />)}
		{/* a cloud band crossing the moon */}
		<g opacity={0.85}><ellipse cx={860} cy={560} rx={360} ry={34} fill="#2A3366" filter="url(#b10)" /><ellipse cx={300} cy={300} rx={300} ry={28} fill="#26305E" filter="url(#b10)" /></g>
		{/* far pagoda and hills */}
		<path d="M0 760 C200 700 360 730 520 700 C700 668 900 720 1100 690 C1260 668 1360 700 1440 690 V1080 H0Z" fill="#1E2750" />
		<g fill="#18204A" transform="translate(1160 470)">{[0, 1, 2, 3, 4].map((k) => <g key={k}><path d={`M${-90 + k * 12} ${k * 46 + 40} Q0 ${k * 46 + 10} ${90 - k * 12} ${k * 46 + 40}Z`} /><rect x={-38 + k * 4} y={k * 46 + 38} width={76 - k * 8} height={14} /></g>)}<rect x={-3} y={-30} width={6} height={60} /></g>
		<path d="M0 820 C260 790 520 806 760 790 C1000 774 1240 800 1440 786 V1080 H0Z" fill="#111735" />
		{/* temple roof ridge in the foreground (curved, tiled, moonlit edge) */}
		<path d="M-20 790 C300 770 700 772 1000 770 C1180 768 1300 756 1460 720 L1460 1080 L-20 1080Z" fill="url(#roof)" />
		{Array.from({length: 26}, (_, i) => <path key={i} d={`M${-20 + i * 60} ${790 - i * 0.5} q${-30 + i} 140 ${-90 + i * 2} 300`} stroke="#0B1026" strokeWidth={6} fill="none" opacity={0.9} />)}
		<path d="M-20 790 C300 770 700 772 1000 770 C1180 768 1300 756 1460 720" stroke="#F2DDA6" strokeWidth={3} fill="none" opacity={0.75} />
		<rect x={-20} y={776} width={1480} height={16} fill="#0A0E22" transform="skewY(-0.4)" />
		{/* the ninja (rim-lit silhouette): glow pass, then the figure */}
		<g filter="url(#b4)" opacity={0.9}><g transform="translate(-2 0) scale(1)" style={{mixBlendMode: 'screen'}}><g stroke="#FFF0C8" strokeWidth={8} fill="none"><Ninja /></g></g></g>
		<Ninja />
		{/* drifting sakura petals */}
		{Array.from({length: 40}, (_, i) => { const x = R() * W, y = R() * 900, s = 5 + R() * 6; return <ellipse key={i} cx={x} cy={y} rx={s} ry={s * 0.55} fill="#F4B6C8" opacity={0.5 + R() * 0.5} transform={`rotate(${R() * 180} ${x} ${y})`} />; })}
		<rect width={W} height={H} fill="url(#vig)" /><Grain />
	</svg>
		<Caption parts={[['这把剑的名字，你一定听过。', false]]} />
	</AbsoluteFill>;
};

/* ---------------------------------------------------------------- C: Susanoo and the eight-headed serpent */
const Head: React.FC<{x: number; y: number; a: number; s: number; open?: number}> = ({x, y, a, s, open = 0.5}) => { const flip = Math.cos((a * Math.PI) / 180) < 0 ? -1 : 1;
	return <g transform={`translate(${x},${y}) rotate(${a}) scale(${s},${s * flip})`}>
		<path d="M-20 -6 C30 -10 80 -8 120 -4 L112 12 C70 22 20 22 -24 18Z" fill="#7A120C" />
		<g transform={`rotate(${open * 26} -16 10)`}>
			<path d="M-30 10 L106 4 C114 8 112 18 104 22 C64 32 18 32 -28 28Z" fill="#1C0B07" stroke="#050101" strokeWidth={3} />
			{[40, 62, 84].map((t) => <path key={t} d={`M${t} 6 l5 -12 l5 12Z`} fill="#E8D8C0" />)}</g>
		<path d="M-40 -26 C0 -54 60 -50 98 -30 L132 -14 C132 -4 124 2 112 2 L20 2 C0 4 -20 8 -42 14Z" fill="#1C0B07" stroke="#050101" strokeWidth={3} />
		{[34, 56, 78, 100].map((t) => <path key={t} d={`M${t} 1 l5 12 l5 -12Z`} fill="#E8D8C0" />)}
		<path d="M-30 -30 L-78 -62 L-52 -24Z M-6 -42 L-36 -82 L-10 -40Z M20 -46 L4 -84 L30 -44Z" fill="#120604" />
		<path d="M30 -38 C50 -46 74 -40 90 -28" stroke="#3A1A0E" strokeWidth={4} fill="none" />
		<circle cx={60} cy={-24} r={18} fill="#FF4A1C" filter="url(#b10)" /><ellipse cx={60} cy={-24} rx={9} ry={6} fill="#FFC27A" /><ellipse cx={61} cy={-24} rx={2.5} ry={5} fill="#3A0602" />
	</g>; };
const ctl = (bx: number, by: number, hx: number, hy: number, i: number): [number, number] => [(bx + hx) / 2 + (i % 2 ? 90 : -90), (by + hy) / 2 + 60];
const LookC: React.FC = () => {
	const R = rng(23);
	const heads: [number, number, number, number, number, number, number][] = [ // neck base x, base y, head x, head y, angle, scale, jaw
		[820, 760, 470, 250, 200, 1.1, 0.8], [860, 760, 640, 160, 210, 1.0, 0.4], [900, 760, 860, 120, 195, 1.15, 0.9], [940, 760, 1060, 170, -20, 1.0, 0.5],
		[980, 760, 1250, 260, -10, 1.05, 0.7], [1000, 760, 1330, 440, 8, 0.95, 0.3], [880, 760, 600, 560, 160, 0.9, 0.2], [960, 760, 1120, 600, 30, 0.9, 0.2]];
	return <AbsoluteFill style={{background: '#1A0505'}}><svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
		<Defs />
		<defs>
			<linearGradient id="skyC" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#140404" /><stop offset="0.5" stopColor="#5E120E" /><stop offset="0.8" stopColor="#C2401A" /><stop offset="1" stopColor="#E8752A" /></linearGradient>
			<linearGradient id="neck" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#0E0504" /><stop offset="0.6" stopColor="#241009" /><stop offset="1" stopColor="#3A1A0E" /></linearGradient>
		</defs>
		<rect width={W} height={H} fill="url(#skyC)" />
		{Array.from({length: 9}, (_, i) => <ellipse key={i} cx={R() * W} cy={60 + R() * 260} rx={240 + R() * 260} ry={40 + R() * 40} fill="#1E0606" opacity={0.6} filter="url(#b24)" />)}
		<path d="M1260 0 l-50 140 l60 -16 l-80 190 l50 -12 l-60 140" stroke="#FFE8D0" strokeWidth={8} fill="none" filter="url(#b10)" opacity={0.9} />
		<path d="M1260 0 l-50 140 l60 -16 l-80 190 l50 -12 l-60 140" stroke="#FFFFFF" strokeWidth={3} fill="none" />
		<path d="M0 760 L140 640 L260 700 L420 580 L560 690 L700 620 L860 700 L1040 600 L1200 690 L1340 610 L1440 660 V1080 H0Z" fill="#3A0C0A" opacity={0.9} />
		{/* the serpent's body mass with cedars on its back, then the eight necks and heads */}
		<path d="M640 800 C700 700 820 660 940 662 C1080 664 1180 720 1240 800Z" fill="#1A0806" />
		{Array.from({length: 9}, (_, i) => { const x = 720 + i * 56, y = 690 - Math.sin((i / 8) * Math.PI) * 30; return <path key={i} d={`M${x} ${y} l14 -60 l14 60Z`} fill="#0E0403" />; })}
		{heads.map(([bx, by, hx, hy], i) => { const [mx, my] = ctl(bx, by, hx, hy, i), d = `M${bx} ${by} Q${mx} ${my} ${hx} ${hy}`;
			return <g key={i}><path d={d} stroke="#050101" strokeWidth={80} fill="none" strokeLinecap="round" />
				<path d={d} stroke="url(#neck)" strokeWidth={70} fill="none" strokeLinecap="round" />
				<path d={d} stroke="#5A2A14" strokeWidth={18} fill="none" transform="translate(14 6)" opacity={0.75} />
				<path d={d} stroke="#E8752A" strokeWidth={3} fill="none" opacity={0.5} transform="translate(-24 -10)" /></g>; })}
		{heads.map(([bx, by, hx, hy, , sc, j], i) => { const [mx, my] = ctl(bx, by, hx, hy, i); return <Head key={i} x={hx} y={hy} a={(Math.atan2(hy - my, hx - mx) * 180) / Math.PI} s={sc} open={j} />; })}
		{/* the eight vats behind the gate fence */}
		<path d="M380 860 H1300" stroke="#1A0705" strokeWidth={14} />
		{Array.from({length: 8}, (_, i) => { const x = 440 + i * 112; return <g key={i}><rect x={x - 6} y={760} width={12} height={150} fill="#1A0705" />
			<path d={`M${x + 18} 905 C${x + 12} 860 ${x + 16} 836 ${x + 22} 822 H${x + 86} C${x + 92} 836 ${x + 96} 860 ${x + 90} 905Z`} fill="#3A1A0E" stroke="#0A0302" strokeWidth={4} />
			<path d={`M${x + 18} 850 H${x + 90}M${x + 16} 880 H${x + 92}`} stroke="#0A0302" strokeWidth={4} /><ellipse cx={x + 54} cy={822} rx={32} ry={8} fill="#E8B060" opacity={0.6} /></g>; })}
		<path d="M0 900 C300 880 600 900 900 892 C1100 886 1300 900 1440 896 V1080 H0Z" fill="#120403" />
		{/* Susanoo: rock, rim-lit silhouette, hair in loops (mizura), wind-blown robe, the long Totsuka sword raised */}
		<path d="M60 1080 L120 850 L250 810 L380 860 L430 1080Z" fill="#0A0201" />
		<g>
			<g filter="url(#b4)" opacity={0.85} stroke="#FF9A4A" strokeWidth={9} fill="none"><g>
			<path d="M222 644 C206 630 214 610 228 604 C230 586 246 574 264 576 C282 578 292 592 288 608 L292 612 L284 618 C288 632 284 646 272 652 L262 668 C292 676 304 690 300 712 C296 728 288 736 282 744 C300 760 314 790 336 830 L310 834 C292 806 280 786 262 772 C246 792 226 814 202 834 L180 828 C196 804 212 784 226 762 C216 748 210 730 214 712 C218 690 232 676 246 668Z" />
			<path d="M246 676 C230 690 200 696 168 690 C140 686 118 700 96 690 C120 712 150 704 176 710 C206 716 232 704 250 690Z" />
			<path d="M278 618 C292 600 304 588 318 566 L332 576 C320 598 306 614 290 630Z" /><path d="M266 626 C288 610 306 592 322 572 L332 580 C316 602 296 620 276 638Z" /><circle cx={327} cy={570} r={10} />
			<circle cx={248} cy={614} r={8} /><ellipse cx={248} cy={630} rx={7} ry={11} /><path d="M236 586 C246 570 270 568 282 584 C270 580 250 580 236 586Z" />
		</g></g>
			<g fill="#070101"><g>
			<path d="M222 644 C206 630 214 610 228 604 C230 586 246 574 264 576 C282 578 292 592 288 608 L292 612 L284 618 C288 632 284 646 272 652 L262 668 C292 676 304 690 300 712 C296 728 288 736 282 744 C300 760 314 790 336 830 L310 834 C292 806 280 786 262 772 C246 792 226 814 202 834 L180 828 C196 804 212 784 226 762 C216 748 210 730 214 712 C218 690 232 676 246 668Z" />
			<path d="M246 676 C230 690 200 696 168 690 C140 686 118 700 96 690 C120 712 150 704 176 710 C206 716 232 704 250 690Z" />
			<path d="M278 618 C292 600 304 588 318 566 L332 576 C320 598 306 614 290 630Z" /><path d="M266 626 C288 610 306 592 322 572 L332 580 C316 602 296 620 276 638Z" /><circle cx={327} cy={570} r={10} />
			<circle cx={248} cy={614} r={8} /><ellipse cx={248} cy={630} rx={7} ry={11} /><path d="M236 586 C246 570 270 568 282 584 C270 580 250 580 236 586Z" />
		</g></g>
			<path d="M332 562 L560 262" stroke="#FFE6C2" strokeWidth={9} strokeLinecap="round" /><path d="M332 562 L560 262" stroke="#FFFFFF" strokeWidth={3} />
			<path d="M318 584 L342 552" stroke="#C8902E" strokeWidth={10} strokeLinecap="round" /><path d="M326 560 l22 14" stroke="#C8902E" strokeWidth={6} strokeLinecap="round" />
			<path d="M244 662 q14 8 28 0" stroke="#4ADFA0" strokeWidth={4} fill="none" strokeDasharray="4 6" />
		</g>
		<Sparks n={90} seed={31} cx={720} cy={620} r={700} c="#FFB060" />
		<Rain n={150} seed={41} ang={22} op={[0.12, 0.4]} c="#FFD0B0" />
		<rect width={W} height={H} fill="url(#vig)" /><Grain />
	</svg>
		<Caption parts={[['须佐之男', true], ['，在这里斩杀了', false], ['八岐大蛇', true], ['——', false]]} />
	</AbsoluteFill>;
};

registerRoot(() => <>
	<Composition id="LOOK62A" component={LookA} durationInFrames={1} fps={30} width={W} height={H} />
	<Composition id="LOOK62B" component={LookB} durationInFrames={1} fps={30} width={W} height={H} />
	<Composition id="LOOK62C" component={LookC} durationInFrames={1} fps={30} width={W} height={H} />
</>);
