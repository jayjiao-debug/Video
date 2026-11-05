/* ep60 《死后的心脏》 · Douyin covers (owner 11-05 19:51: "thumbnails ... leave people in awe and epicness, you can create new assets").
   New art for the cover, not film frames: the colossal frontal Anubis (black jackal head, gold-and-lapis lappets, broad collar, glowing
   eyes) looming over a monumental gold balance in a pillared hall, god rays from above; the v1 jar heart (the film's heart) on the left
   pan, Ma'at's feather on the right, the beam already dipping toward the heart; Ammit's eyes and teeth in the dark under the heart pan.
   variant 'A' = the weighing (Anubis + balance), 'B' = the devourer (Ammit's jaws open wide under the heart, Anubis's eyes above).
   layout 'wide' 1440 × 1080 (4:3) | 'tall' 1080 × 1440 (3:4). Hook: two lines (cream / gold), the series line and the title under it. */
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Heart60} from './heart60';
import {featherD} from './props60';
import {F_SERIF} from './frame60';
import {Ammit2} from './act60b_kit';
import {God, POSES} from './rig60';
import {ANI} from './cast60';

const INK = '#0A0806', GOLD = '#E8B44A', LAPIS = '#1E2F7A', TURQ = '#2FA3A0', RED = '#B8341E';
const rng = (seed: number) => { let s = seed; return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; };

/** the colossal frontal Anubis: (0, 0) = the tip of the nose; k = scale (1 ≈ 520 px between ear tips' outer edges) */
const Anubis: React.FC<{k: number; eye?: number}> = ({k, eye = 1}) => <g transform={`scale(${k})`}>
	{/* the sun-disk halo behind the head */}
	<circle cx={0} cy={-260} r={520} fill="url(#cv-warm)" opacity={0.75} style={{mixBlendMode: 'screen'}} />
	<circle cx={0} cy={-260} r={430} fill="none" stroke="#FFD98A" strokeWidth={5} opacity={0.5} />
	<circle cx={0} cy={-260} r={455} fill="none" stroke="#FFD98A" strokeWidth={2} opacity={0.35} strokeDasharray="6 14" />
	{/* shoulders + body in shadow */}
	<path d="M-520 620Q-470 330 -250 280L250 280Q470 330 520 620Z" fill="#06070F" />
	{/* the lappets of the striped wig, behind the head, falling to the chest */}
	{[-1, 1].map((sg) => <g key={sg}>
		<path d={`M${sg * 120} -300L${sg * 250} -260L${sg * 268} 300L${sg * 140} 330Z`} fill={LAPIS} stroke={INK} strokeWidth={6} />
		{Array.from({length: 13}, (_, i) => { const y = -250 + i * 44, x0 = sg * (122 + i * 1.5), x1 = sg * (252 + i * 1.3);
			return <path key={i} d={`M${x0} ${y}L${x1} ${y + 6}`} stroke={GOLD} strokeWidth={14} opacity={0.95} />; })}
		<path d={`M${sg * 250} -260L${sg * 268} 300`} stroke="#FFE3A0" strokeWidth={4} opacity={0.7} />
	</g>)}
	{/* the broad collar (wesekh): rows of gold, turquoise, red, lapis */}
	{[[300, GOLD, 34], [272, TURQ, 26], [248, RED, 22], [226, LAPIS, 22], [204, GOLD, 18]].map(([r, c, w], i) =>
		<path key={i} d={`M${-Number(r)} 250A${r} ${Number(r) * 0.5} 0 0 0 ${r} 250`} fill="none" stroke={String(c)} strokeWidth={Number(w)} />)}
	{Array.from({length: 23}, (_, i) => { const a = Math.PI * (0.06 + 0.88 * i / 22), r = 316; return <path key={i} d={`M${-Math.cos(a) * r} ${250 + Math.sin(a) * r * 0.5}l${-Math.cos(a) * 26} ${Math.sin(a) * 13}`} stroke={GOLD} strokeWidth={10} strokeLinecap="round" />; })}
	{/* the ears: tall, upright, a gold edge and a dark inner ear */}
	{[-1, 1].map((sg) => <g key={sg}>
		<path d={`M${sg * 70} -300L${sg * 205} -330L${sg * 190} -640Z`} fill="#0B0D18" stroke={INK} strokeWidth={6} />
		<path d={`M${sg * 98} -318L${sg * 180} -336L${sg * 178} -560Z`} fill="#1A1430" />
		<path d={`M${sg * 205} -330L${sg * 190} -640`} stroke="#FFD27A" strokeWidth={5} opacity={0.85} />
	</g>)}
	{/* the head: skull narrowing into the long muzzle */}
	<path d="M-165 -300Q-190 -230 -150 -160Q-100 -95 -56 -40Q-36 10 -30 70L30 70Q36 10 56 -40Q100 -95 150 -160Q190 -230 165 -300Q85 -348 0 -350Q-85 -348 -165 -300Z" fill="#0B0D18" stroke={INK} strokeWidth={6} />
	{/* sheen on the black stone: the brow and the bridge of the muzzle */}
	<path d="M-40 -300Q0 -320 40 -300L20 40Q0 50 -20 40Z" fill="#232A4E" opacity={0.75} />
	<path d="M-48 -60Q-60 20 -34 64M48 -60Q60 20 34 64" fill="none" stroke="#FFD27A" strokeWidth={4} opacity={0.45} />
	<path d="M-175 -300Q-200 -230 -165 -150" fill="none" stroke="#FFD27A" strokeWidth={5} opacity={0.6} />
	<path d="M175 -300Q200 -230 165 -150" fill="none" stroke="#FFD27A" strokeWidth={5} opacity={0.6} />
	{/* the nose */}
	<path d="M-36 56Q0 40 36 56Q32 84 0 88Q-32 84 -36 56Z" fill="#000" stroke="#3A3A5A" strokeWidth={3} />
	{/* the eyes: almond, slanting up and out, gold glow, kohl lines */}
	{[-1, 1].map((sg) => <g key={sg}>
		<ellipse cx={sg * 92} cy={-196} rx={74} ry={44} fill="url(#cv-eyeglow)" opacity={0.85 * eye} />
		<path d={`M${sg * 40} -190Q${sg * 85} -232 ${sg * 140} -214Q${sg * 112} -172 ${sg * 40} -190Z`} fill="#FFC93A" stroke={INK} strokeWidth={5} opacity={eye} />
		<ellipse cx={sg * 92} cy={-200} rx={9} ry={17} fill={INK} />
		<path d={`M${sg * 138} -214L${sg * 196} -236`} stroke={INK} strokeWidth={8} strokeLinecap="round" />
		<path d={`M${sg * 48} -222Q${sg * 96} -262 ${sg * 150} -244`} fill="none" stroke={GOLD} strokeWidth={6} opacity={0.8} />
	</g>)}
</g>;

/** the monumental balance: (0, 0) = the foot of the post on the floor; H = height to the beam; tilt in degrees (+ = left pan down) */
const BalanceBig: React.FC<{H: number; half: number; tilt: number; drop: number; heartH: number; featherH: number}> = ({H, half, tilt, drop, heartH, featherH}) => {
	const a = tilt * Math.PI / 180, L: [number, number] = [-half * Math.cos(a), -H + half * Math.sin(a)], R: [number, number] = [half * Math.cos(a), -H - half * Math.sin(a)];
	const pan = (p: [number, number], side: number) => { const py = p[1] + drop, w = half * 0.42;
		return <g key={side}>
			{[-1, 1].map((sg) => <path key={sg} d={`M${p[0]} ${p[1] + 10}L${p[0] + sg * w * 0.92} ${py}`} stroke="#C99A3A" strokeWidth={4} />)}
			<path d={`M${p[0] - w} ${py}L${p[0] + w} ${py}Q${p[0] + w * 0.8} ${py + w * 0.32} ${p[0]} ${py + w * 0.36}Q${p[0] - w * 0.8} ${py + w * 0.32} ${p[0] - w} ${py}Z`} fill="url(#cv-goldv)" stroke={INK} strokeWidth={4} />
			<path d={`M${p[0] - w} ${py}L${p[0] + w} ${py}`} stroke="#FFF0B8" strokeWidth={3} />
			{side < 0 ? <g>
				<ellipse cx={p[0]} cy={py - heartH * 0.5} rx={heartH * 1.5} ry={heartH * 1.3} fill="url(#cv-ember)" style={{mixBlendMode: 'screen'}} />
				<Heart60 x={p[0]} y={py - heartH * 0.5} h={heartH} glow={0.9} id="cvh" />
			</g> : <g>
				<ellipse cx={p[0]} cy={py - featherH * 0.5} rx={featherH * 0.9} ry={featherH * 0.85} fill="url(#cv-white)" style={{mixBlendMode: 'screen'}} />
				<g transform={`translate(${p[0]},${py}) scale(${featherH / 3.2})`}><path d={featherD(3.2)} fill="#FFF6DE" stroke={INK} strokeWidth={0.05} />
					<path d="M0.02 -0.1C0.06 -1.4 0.0 -2.5 -0.25 -2.95" fill="none" stroke="#C9B48A" strokeWidth={0.035} />
					<path d="M-0.2 -0.05L0.28 -0.05L0.3 -0.45L-0.18 -0.45Z" fill={LAPIS} /></g>
			</g>}
		</g>; };
	return <g>
		{/* the post, gold with lapis bands, on a stepped base */}
		<path d={`M-70 0L70 0L60 -36L-60 -36Z`} fill="url(#cv-goldv)" stroke={INK} strokeWidth={4} />
		<path d={`M-16 -36L16 -36L11 ${-H + 30}L-11 ${-H + 30}Z`} fill="url(#cv-goldh)" stroke={INK} strokeWidth={4} />
		{[0.25, 0.5, 0.75].map((u) => <rect key={u} x={-15} y={-36 - (H - 66) * u - 7} width={30} height={14} fill={LAPIS} stroke={INK} strokeWidth={2.5} />)}
		{/* the beam (tilted) and its lotus-bud ends */}
		<g transform={`translate(0,${-H}) rotate(${-tilt})`}>
			<rect x={-half - 8} y={-9} width={2 * half + 16} height={18} rx={9} fill="url(#cv-goldh)" stroke={INK} strokeWidth={4} />
			{[-1, 1].map((sg) => <path key={sg} d={`M${sg * (half + 4)} -12Q${sg * (half + 40)} -16 ${sg * (half + 46)} 0Q${sg * (half + 40)} 16 ${sg * (half + 4)} 12Z`} fill="url(#cv-goldv)" stroke={INK} strokeWidth={3} />)}
		</g>
		{/* the plumb + the feather finial on top */}
		<path d={`M0 ${-H}L0 ${-H + 70}`} stroke="#C99A3A" strokeWidth={3} />
		<path d={`M-9 ${-H + 70}L9 ${-H + 70}L0 ${-H + 92}Z`} fill={GOLD} stroke={INK} strokeWidth={2.5} />
		<circle cx={0} cy={-H} r={16} fill="url(#cv-goldv)" stroke={INK} strokeWidth={4} />
		<g transform={`translate(0,${-H - 14}) scale(18)`}><path d={featherD(3.2)} fill={GOLD} stroke={INK} strokeWidth={0.14} /></g>
		{pan(L, -1)}{pan(R, 1)}
	</g>;
};

/** Ammit in the dark: crocodile snout with the jaws a little open, teeth and a glowing slit eye; (0,0) = the snout tip, facing -x (left) when f = -1 */
const AmmitDark: React.FC<{k: number; f?: 1 | -1; open?: number}> = ({k, f = 1, open = 0.25}) => { const ja = 6 + 30 * open;
	const teeth = (y0: number, dir: number) => Array.from({length: 11}, (_, i) => { const x = 30 + i * 34; return <path key={i} d={`M${x} ${y0}L${x + 13} ${y0 + dir * (18 + (i % 3) * 6)}L${x + 26} ${y0}Z`} fill="#F4EBD6" stroke={INK} strokeWidth={3} />; });
	return <g transform={`scale(${f * k},${k})`}>
		<ellipse cx={330} cy={-40} rx={360} ry={160} fill="url(#cv-redrim)" opacity={0.55} style={{mixBlendMode: 'screen'}} />
		{/* the lower jaw */}
		<g transform={`rotate(${ja} 430 0)`}><path d="M0 4Q120 12 430 18L520 40L520 90Q300 70 40 40Q6 30 0 4Z" fill="#141A10" stroke={INK} strokeWidth={5} />{teeth(10, -1)}</g>
		<path d="M10 0Q140 6 420 8" fill="none" stroke="#3A0806" strokeWidth={10} />
		{/* the upper jaw and skull */}
		<path d="M0 0Q-10 -26 30 -40Q200 -70 400 -96Q470 -150 560 -140L620 -60L600 40L430 8Q140 4 0 0Z" fill="#1A2214" stroke={INK} strokeWidth={5} />
		{teeth(0, 1)}
		{Array.from({length: 7}, (_, i) => <path key={i} d={`M${120 + i * 50} ${-52 - i * 6}l18 -10l18 10`} fill="none" stroke="#2C3A22" strokeWidth={5} />)}
		<path d="M0 0Q-10 -26 30 -40Q200 -70 400 -96" fill="none" stroke="#FF5A2E" strokeWidth={5} opacity={0.75} />
		{/* the eye */}
		<ellipse cx={468} cy={-112} rx={46} ry={34} fill="url(#cv-eyeglow)" />
		<ellipse cx={470} cy={-112} rx={26} ry={18} fill="#FFC21A" stroke={INK} strokeWidth={4} />
		<ellipse cx={472} cy={-112} rx={5} ry={16} fill={INK} />
		<path d="M430 -134Q470 -150 512 -132" fill="none" stroke={INK} strokeWidth={8} />
		{/* the mane begins behind the head */}
		{Array.from({length: 9}, (_, i) => { const a = -1.2 + i * 0.28; return <path key={i} d={`M${600 + Math.cos(a) * 60} ${-60 + Math.sin(a) * 90}Q${660 + Math.cos(a) * 140} ${-60 + Math.sin(a) * 150} ${640 + Math.cos(a) * 200} ${-40 + Math.sin(a) * 210}`} fill="none" stroke={i % 2 ? '#7A4A1A' : '#5A3410'} strokeWidth={34} strokeLinecap="round" />; })}
	</g>; };

/** the hall: perspective rows of colossal columns into haze, a hieroglyph frieze, the reflective floor, god rays */
const Hall: React.FC<{W: number; H: number; cx: number; hz: number}> = ({W, H, cx, hz}) => { const R = rng(60);
	const cols: React.ReactNode[] = [];
	for (let i = 5; i >= 0; i--) { const d = 0.35 + i * 0.42, k = 1 / d; [-1, 1].forEach((sg) => {
		const x = cx + sg * (300 + 260 * k), w = 120 * k, top = hz - 900 * k, bot = hz + 320 * k, fog = Math.min(0.85, i * 0.15);
		cols.push(<g key={`${i}${sg}`}>
			<rect x={x - w / 2} y={top} width={w} height={bot - top} fill="#121A3C" stroke={INK} strokeWidth={3} />
			<rect x={x - w / 2} y={top} width={w * 0.22} height={bot - top} fill="#1F2B5E" opacity={0.6} />
			{Array.from({length: 5}, (_, j) => <rect key={j} x={x - w * 0.32} y={top + (bot - top) * (0.12 + j * 0.16)} width={w * 0.64} height={w * 0.14} fill={GOLD} opacity={0.32 + 0.1 * (j % 2)} />)}
			<rect x={x - w * 0.7} y={top - w * 0.2} width={w * 1.4} height={w * 0.24} fill="#1A2450" stroke={INK} strokeWidth={2} />
			<rect x={x - w / 2 - 6} y={top} width={w + 12} height={bot - top} fill="#0A1030" opacity={fog} />
		</g>); }); }
	return <g>
		<rect x={0} y={0} width={W} height={H} fill="url(#cv-sky)" />
		{/* the far wall with the frieze and the glow behind the god */}
		<rect x={0} y={hz - 520} width={W} height={60} fill="#162048" opacity={0.7} />
		{Array.from({length: Math.ceil(W / 46)}, (_, i) => <rect key={i} x={i * 46 + 10} y={hz - 508} width={22} height={34} fill={GOLD} opacity={0.18 + 0.15 * R()} />)}
		<ellipse cx={cx} cy={hz - 280} rx={W * 0.55} ry={520} fill="url(#cv-warm)" opacity={0.55} style={{mixBlendMode: 'screen'}} />
		{cols}
		{/* the floor: dark stone with the reflection of the light */}
		<path d={`M0 ${hz}L${W} ${hz}L${W} ${H}L0 ${H}Z`} fill="url(#cv-floor)" />
		{Array.from({length: 9}, (_, i) => { const y = hz + 20 + Math.pow(i, 1.7) * 14; return <path key={i} d={`M0 ${y}L${W} ${y}`} stroke="#2A2F5A" strokeWidth={2} opacity={0.5} />; })}
		{Array.from({length: 13}, (_, i) => { const u = (i - 6) / 6; return <path key={i} d={`M${cx + u * 60} ${hz}L${cx + u * W * 1.2} ${H}`} stroke="#2A2F5A" strokeWidth={2} opacity={0.4} />; })}
		<ellipse cx={cx} cy={hz + 120} rx={W * 0.36} ry={70} fill="url(#cv-warm)" opacity={0.45} style={{mixBlendMode: 'screen'}} />
	</g>; };

const Rays: React.FC<{cx: number; W: number; H: number; o?: number}> = ({cx, W, H, o = 1}) => <g style={{mixBlendMode: 'screen'}} opacity={o}>
	{[[-0.5, 70, 0.22], [-0.3, 50, 0.3], [-0.12, 90, 0.34], [0.05, 60, 0.38], [0.2, 80, 0.3], [0.38, 50, 0.24], [0.55, 70, 0.18]].map(([u, w, op], i) =>
		<path key={i} d={`M${cx + u * 120 - w / 2} -40L${cx + u * 120 + w / 2} -40L${cx + u * W * 0.9 + w * 2.2} ${H * 0.95}L${cx + u * W * 0.9 - w * 2.2} ${H * 0.95}Z`} fill="url(#cv-ray)" opacity={op} />)}
</g>;

const Motes: React.FC<{W: number; H: number; n?: number; seed?: number}> = ({W, H, n = 140, seed = 7}) => { const R = rng(seed);
	return <g style={{mixBlendMode: 'screen'}}>{Array.from({length: n}, (_, i) => { const x = R() * W, y = R() * H, r = 0.8 + R() * 2.6, o = 0.25 + R() * 0.6;
		return <circle key={i} cx={x} cy={y} r={r} fill={i % 5 ? '#FFE2A0' : '#FFFFFF'} opacity={o} />; })}</g>; };

const Defs: React.FC = () => <defs>
	<linearGradient id="cv-sky" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#04050E" /><stop offset="0.55" stopColor="#0E1638" /><stop offset="1" stopColor="#1A1E44" /></linearGradient>
	<linearGradient id="cv-floor" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#141A3A" /><stop offset="1" stopColor="#05060E" /></linearGradient>
	<linearGradient id="cv-goldv" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#FFE9A8" /><stop offset="0.45" stopColor="#E3A93E" /><stop offset="1" stopColor="#8A5A18" /></linearGradient>
	<linearGradient id="cv-goldh" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stopColor="#8A5A18" /><stop offset="0.4" stopColor="#FFE3A0" /><stop offset="0.6" stopColor="#E3A93E" /><stop offset="1" stopColor="#7A4E14" /></linearGradient>
	<linearGradient id="cv-ray" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#FFF2CC" stopOpacity={0.9} /><stop offset="1" stopColor="#FFD98A" stopOpacity={0} /></linearGradient>
	{([['warm', '#FFB45A'], ['ember', '#FF5A2A'], ['white', '#FFF6DE'], ['eyeglow', '#FFD24A'], ['redrim', '#FF3A1E']] as const).map(([k, c]) =>
		<radialGradient key={k} id={`cv-${k}`}><stop offset="0" stopColor={c} stopOpacity={1} /><stop offset="0.4" stopColor={c} stopOpacity={0.45} /><stop offset="1" stopColor={c} stopOpacity={0} /></radialGradient>)}
	<radialGradient id="cv-vig" cx="0.5" cy="0.45" r="0.75"><stop offset="0.55" stopColor="#000" stopOpacity={0} /><stop offset="1" stopColor="#000" stopOpacity={0.78} /></radialGradient>
</defs>;

/** the hook text (HTML, so the gold gradient + shadow render crisply) */
const Hook: React.FC<{l1: string; l2: string; size: number; x: number; y: number; w: number; align: 'left' | 'center'}> = ({l1, l2, size, x, y, w, align}) => {
	const line = (t: string, gold: boolean, fs: number) => <div style={{fontFamily: F_SERIF, fontWeight: 900, fontSize: fs, lineHeight: 1.12, whiteSpace: 'nowrap', letterSpacing: '0.04em',
		...(gold ? {background: 'linear-gradient(180deg, #FFF3C4 0%, #F6D27A 40%, #C8902E 60%, #F7D27A 82%, #FFE9A8 100%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
			filter: 'drop-shadow(0 5px 0 #3A2206) drop-shadow(0 0 22px rgba(255,190,90,0.45))'} : {color: '#FFF4DC', textShadow: '0 5px 0 rgba(10,8,20,0.9), 0 0 26px rgba(5,6,20,0.9)'})}}>{t}</div>;
	return <div style={{position: 'absolute', left: x, top: y, width: w, display: 'flex', flexDirection: 'column', alignItems: align === 'left' ? 'flex-start' : 'center'}}>
		{line(l1, false, size)}{line(l2, true, size * 1.08)}
		<div style={{marginTop: size * 0.32, display: 'flex', alignItems: 'center', gap: size * 0.2, fontFamily: F_SERIF, color: '#F2DFAE', whiteSpace: 'nowrap'}}>
			<span style={{fontSize: size * 0.26, fontWeight: 700, letterSpacing: '0.22em', opacity: 0.9}}>VIBE知识大赏</span>
			<span style={{fontSize: size * 0.4, fontWeight: 900, letterSpacing: '0.06em', color: '#FFE3A0', textShadow: '0 3px 0 rgba(10,8,20,0.9)'}}>《死后的心脏》</span>
		</div>
	</div>;
};

export const Cover60: React.FC<{layout?: 'wide' | 'tall'; variant?: 'A' | 'B'}> = ({layout = 'wide', variant = 'A'}) => {
	const wide = layout === 'wide', W = wide ? 1440 : 1080, H = wide ? 1080 : 1440;
	const cx = wide ? 1000 : 540, hz = wide ? 780 : 1020;
	const k = wide ? 0.84 : 0.88, headY = wide ? 540 : 720;
	const balY = wide ? 1010 : 1230, balH = wide ? 370 : 410, half = wide ? 270 : 290, drop = wide ? 190 : 200, tilt = variant === 'A' ? 7 : 4;
	const a = tilt * Math.PI / 180, heartPan = [cx - half * Math.cos(a), balY - balH + half * Math.sin(a) + drop];
	const hook = variant === 'A' ? ['心比羽毛重', '就会被吃掉'] : ['3000年前', '死后要先称心'];
	return <AbsoluteFill style={{background: '#04050E'}}>
		<svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', left: 0, top: 0}}>
			<Defs />
			<Hall W={W} H={H} cx={cx} hz={hz} />
			<Rays cx={cx} W={W} H={H} o={0.9} />
			<g transform={`translate(${cx},${headY})`}><Anubis k={k} eye={1} /></g>
			<g transform={`translate(${cx},${balY})`}><BalanceBig H={balH} half={half} tilt={tilt} drop={drop} heartH={wide ? 118 : 120} featherH={wide ? 160 : 165} /></g>
			{variant === 'B' && <>
				{/* you, tiny at the foot of the balance (in front of it, left of the post), looking up at the god */}
				<ellipse cx={cx - (wide ? 120 : 100)} cy={balY - 4} rx={60} ry={9} fill="#000" opacity={0.6} />
				<God id="cvani" cast={ANI} pose={{...POSES.rest, head: -14, neck: -6, lean: -2, fs: 10, fe: 12, bs: -6, be: 8}} x={cx - (wide ? 120 : 100)} y={balY - 4} s={wide ? 11 : 10} />
			</>}
			{variant === 'A' && <>
				{/* Ammit rears out of the dark under the heart pan, jaws wide */}
				<ellipse cx={heartPan[0] - 60} cy={heartPan[1] + 300} rx={420} ry={260} fill="url(#cv-redrim)" opacity={0.35} style={{mixBlendMode: 'screen'}} />
				<Ammit2 pose={{lean: 14, neck: 26, jaw: 44, tail: 10, breathe: 0.6}} x={heartPan[0] - (wide ? 500 : 330)} y={heartPan[1] + (wide ? 470 : 380)} s={wide ? 58 : 48} face={1} t={0.3} rim={1} look={0.9} mr={1} roar={1} id="cvam" />
			</>}
			<Motes W={W} H={H} />
			<rect x={0} y={0} width={W} height={H} fill="url(#cv-vig)" />
			{/* a dark wash behind the hook so it reads on a phone */}
			{wide ? <rect x={0} y={0} width={760} height={H} fill="url(#cv-left)" /> : <rect x={0} y={0} width={W} height={560} fill="url(#cv-top)" />}
			<defs>
				<linearGradient id="cv-left" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stopColor="#03040C" stopOpacity={0.82} /><stop offset="0.7" stopColor="#03040C" stopOpacity={0.35} /><stop offset="1" stopColor="#03040C" stopOpacity={0} /></linearGradient>
				<linearGradient id="cv-top" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#03040C" stopOpacity={0.8} /><stop offset="0.75" stopColor="#03040C" stopOpacity={0.35} /><stop offset="1" stopColor="#03040C" stopOpacity={0} /></linearGradient>
			</defs>
		</svg>
		{wide ? <Hook l1={hook[0]} l2={hook[1]} size={variant === 'A' ? 120 : 104} x={70} y={120} w={720} align="left" />
			: <Hook l1={hook[0]} l2={hook[1]} size={120} x={0} y={96} w={W} align="center" />}
	</AbsoluteFill>;
};
