import React from 'react';
import {POSES, ikArm, jointsAt, type Look, type Pose} from '../art/Figure';
import {CAST} from '../art/cast';
import {P} from '../art/palette';
import {Person} from '../art/poseCheck';
import {GOLD, H, INK, Pill, SANS, W, YOU, hash, type KF} from './common';
import lines from './data/ep26.json';

/* ep26 《一句话，值多少钱？》 gate 2a: three looks × two frames (hook 2.6 s · key visual 61 s). */
export const LINES26 = lines;
type V2 = [number, number];

const DRAGHI: Look = {...CAST.economist, hair: 'short', hairColor: '#8d8a86', top: '#2b3140', bottom: '#23262e', accent: '#7a2c2c', glasses: true};
const LENDER1: Look = {skin: P.skin1, hair: 'slick', hairColor: P.hairBrown, outfit: 'suit', top: '#4a3f36', bottom: '#2f2a26', accent: '#2f3d5c'};
const LENDER2: Look = {skin: P.skin2, hair: 'short', hairColor: P.hairBlack, outfit: 'suit', top: '#3b4a3f', bottom: '#2a2f2a', accent: '#6e2a2a'};
const SPAIN: Look = {skin: P.skin2, hair: 'short', hairColor: P.hairBlack, outfit: 'casual', top: '#8a3b2e', bottom: '#2f3442', accent: '#e9c46a'};

/* ---------- shared props ---------- */
const sansT = (size: number, weight = 900) => ({fontFamily: SANS, fontSize: size, fontWeight: weight, fontVariantNumeric: 'lining-nums' as const});

/** the young viewer holding a phone at chest height (hands on the phone, pose-checked) */
const YouPhone: React.FC<{at: V2; s: number; id: string; look?: Look; sil?: string; rim?: 'cool' | 'warm' | 'none'; glow?: boolean}> = ({at, s, id, look = YOU, sil, rim = 'warm', glow}) => {
	const base: Pose = {...POSES.stand, head: 8};
	const J = jointsAt(base);
	const phone: V2 = [J.neck[0] + 46, J.neck[1] + 34];
	const pose: Pose = {...base, armNear: ikArm(base, true, phone), armFar: ikArm(base, false, [phone[0] - 6, phone[1] + 8])};
	const w = (p: V2): V2 => [at[0] + p[0] * s, at[1] + p[1] * s];
	return (
		<g>
			<Person id={id} at={at} s={s} intent="stand" env={{ground: at[1], contacts: [{hand: 'near', at: w(phone), what: 'holding the phone'}, {hand: 'far', at: w([phone[0] - 6, phone[1] + 8]), what: 'holding the phone', tol: 14}]}} look={look} pose={pose} expression="smile" rim={rim} shadow={false} silhouette={sil} hands={{near: 'grip', far: 'grip'}} />
			{glow ? <ellipse cx={w(phone)[0] + 4} cy={w(phone)[1] - 14} rx={70} ry={50} fill="#9fe3ff" opacity={0.35} /> : null}
			<rect x={w(phone)[0] - 6} y={w(phone)[1] - 40} width={16} height={58} rx={4} fill={glow ? '#bff0ff' : '#15151a'} />
		</g>
	);
};

/** Draghi (generic figure, no portrait) behind the table, near hand placing the card on the tabletop */
const Placer: React.FC<{at: V2; s: number; look: Look; sil?: string; rim?: 'cool' | 'warm' | 'none'; card: V2}> = ({at, s, look, sil, rim = 'warm', card}) => {
	const base: Pose = {...POSES.stand, lean: 16, head: 16};
	const pose: Pose = {...base, armNear: ikArm(base, true, card), armFar: [-6, 14]};
	const w = (p: V2): V2 => [at[0] + p[0] * s, at[1] + p[1] * s];
	return <Person id="draghi" at={at} s={s} intent="stand" env={{ground: at[1], contacts: [{hand: 'near', at: w(card), what: 'placing the promise card on the table'}]}} look={look} pose={pose} expression="neutral" rim={rim} shadow={false} silhouette={sil} hands={{near: 'open'}} />;
};

const Card: React.FC<{x: number; y: number; s?: number; tone?: 'paper' | 'gold'}> = ({x, y, s = 1, tone = 'paper'}) => (
	<g transform={`translate(${x} ${y}) scale(${s})`}>
		<rect x={-110} y={-16} width={220} height={26} rx={4} fill="#000" opacity={0.25} />
		<path d="M-112,0 L112,0 L96,-30 L-96,-30 Z" fill={tone === 'gold' ? '#f3d27a' : '#f4ecd8'} stroke="#a8916a" strokeWidth={2} />
		<text x={0} y={-9} textAnchor="middle" style={sansT(22)} fill="#7a2c2c">承诺</text>
	</g>
);

/** big floating card version of the promise (front view, readable) */
const BigCard: React.FC<{x: number; y: number; w?: number; tone?: string; ink?: string}> = ({x, y, w = 360, tone = '#f4ecd8', ink = '#7a2c2c'}) => (
	<g transform={`translate(${x} ${y})`}>
		<rect x={-w / 2 + 8} y={-w * 0.3 + 10} width={w} height={w * 0.6} rx={14} fill="#000" opacity={0.3} />
		<rect x={-w / 2} y={-w * 0.3} width={w} height={w * 0.6} rx={14} fill={tone} stroke="#b59c6c" strokeWidth={3} />
		<text x={0} y={w * 0.06} textAnchor="middle" style={sansT(w * 0.26)} fill={ink}>承诺</text>
		<circle cx={w * 0.34} cy={w * 0.17} r={w * 0.07} fill="none" stroke="#b33a2c" strokeWidth={4} />
	</g>
);

const Bubble: React.FC<{x: number; y: number; r?: number; text: string; fill?: string; ink?: string; o?: number; tail?: V2}> = ({x, y, r = 70, text, fill = '#fff6dc', ink = '#3a2a10', o = 0.95, tail}) => (
	<g opacity={o}>
		{tail ? <path d={`M${x - 14},${y + r * 0.6} L${tail[0]},${tail[1]} L${x + 14},${y + r * 0.6} Z`} fill={fill} /> : null}
		<ellipse cx={x} cy={y} rx={r * 1.25} ry={r * 0.85} fill={fill} />
		<text x={x} y={y + r * 0.22} textAnchor="middle" style={sansT(r * 0.62)} fill={ink}>{text}</text>
	</g>
);

const PhoneCard: React.FC<{x: number; y: number; s?: number; dark?: boolean}> = ({x, y, s = 1, dark = true}) => (
	<g transform={`translate(${x} ${y}) scale(${s})`}>
		<rect x={-8} y={-6} width={336} height={560} rx={44} fill="#000" opacity={0.35} />
		<rect x={-16} y={-16} width={336} height={560} rx={44} fill={dark ? '#14161d' : '#2a2620'} />
		<rect x={0} y={0} width={304} height={528} rx={32} fill="#f6f1e6" />
		{/* notification */}
		<rect x={16} y={24} width={272} height={96} rx={18} fill="#ffffff" stroke="#e2dccd" />
		<text x={36} y={60} style={sansT(20, 700)} fill="#6b6457">老板</text>
		<text x={36} y={98} style={sansT(28, 900)} fill="#2a2620">明年给你涨工资</text>
		{/* order */}
		<text x={24} y={170} style={sansT(22, 700)} fill="#6b6457">今晚的外卖</text>
		<rect x={16} y={186} width={272} height={92} rx={16} fill="#ece6d8" />
		<text x={36} y={242} style={sansT(26, 500)} fill="#8f887a" textDecoration="line-through">普通套餐</text>
		<rect x={16} y={292} width={272} height={110} rx={16} fill="#fff1d2" stroke={GOLD} strokeWidth={3} />
		<text x={36} y={346} style={sansT(30, 900)} fill="#3a2a10">升级套餐</text>
		<text x={36} y={384} style={sansT(22, 700)} fill="#b8862a">多花了一点</text>
		<rect x={16} y={424} width={272} height={76} rx={38} fill="#e07a3c" />
		<text x={152} y={474} textAnchor="middle" style={sansT(30, 900)} fill="#fff">下单</text>
	</g>
);

/* ---------- Look A 夜城借条: the Tank/pond flat illustration, warm night city (mid-tone, not black) ---------- */
const CityNight: React.FC<{warm?: number}> = ({warm = 0.5}) => (
	<g>
		<defs>
			<linearGradient id="a-sky" x1="0" y1="0" x2="0" y2="1">
				<stop offset="0" stopColor="#1f2c4a" />
				<stop offset="0.7" stopColor="#3c4d74" />
				<stop offset="1" stopColor="#6b5a6e" />
			</linearGradient>
			<radialGradient id="a-lamp" cx="50%" cy="50%" r="50%">
				<stop offset="0" stopColor="#ffd98a" stopOpacity={0.55 * warm + 0.2} />
				<stop offset="1" stopColor="#ffd98a" stopOpacity="0" />
			</radialGradient>
		</defs>
		<rect width={W} height={H} fill="url(#a-sky)" />
		{Array.from({length: 22}, (_, i) => {
			const x = i * 92 - 20, h = 180 + hash(i, 3) * 260, w = 70 + hash(i, 4) * 40;
			return (
				<g key={i}>
					<rect x={x} y={640 - h} width={w} height={h} fill={i % 2 ? '#2a3657' : '#25304d'} />
					{Array.from({length: Math.floor(h / 46)}, (_, k) => (
						<rect key={k} x={x + 12 + (k % 2) * 28} y={660 - h + k * 44} width={14} height={18} fill="#ffcf7a" opacity={hash(i * 9 + k, 5) > 0.45 ? 0.85 : 0.12} />
					))}
				</g>
			);
		})}
		<rect y={640} width={W} height={H - 640} fill="#33405f" />
		<rect y={640} width={W} height={10} fill="#4a5a80" />
	</g>
);

const A1 = () => (
	<g>
		<defs>
			<linearGradient id="a-room" x1="0" y1="0" x2="0" y2="1">
				<stop offset="0" stopColor="#2e3b5c" />
				<stop offset="1" stopColor="#46557a" />
			</linearGradient>
			<radialGradient id="a-bub" cx="50%" cy="50%" r="50%">
				<stop offset="0" stopColor="#ffe6a8" stopOpacity="0.9" />
				<stop offset="1" stopColor="#ffe6a8" stopOpacity="0" />
			</radialGradient>
		</defs>
		<rect width={W} height={H} fill="url(#a-room)" />
		{/* window onto the city */}
		<g>
			<rect x={140} y={120} width={760} height={560} rx={8} fill="#1d2945" />
			<svg x={140} y={120} width={760} height={560} viewBox="0 120 1920 900" preserveAspectRatio="xMidYMid slice">
				<CityNight />
			</svg>
			<rect x={140} y={120} width={760} height={560} rx={8} fill="none" stroke="#c9b48a" strokeWidth={14} />
			<line x1={520} y1={120} x2={520} y2={680} stroke="#c9b48a" strokeWidth={10} />
		</g>
		<rect y={860} width={W} height={220} fill="#5a4a46" />
		<rect x={0} y={855} width={W} height={10} fill="#6e5c56" />
		{/* warm lamp */}
		<ellipse cx={1180} cy={420} rx={420} ry={360} fill="url(#a-bub)" opacity={0.35} />
		<YouPhone at={[1080, 880]} s={1.75} id="you-a" glow />
		{/* the expectation bubble */}
		<ellipse cx={1150} cy={250} rx={200} ry={140} fill="url(#a-bub)" />
		<Bubble x={1150} y={250} r={78} text="以后" fill="#fff3d0" tail={[1120, 340]} />
		<path d="M1150,170 l26,30 h-16 v34 h-20 v-34 h-16 z" fill="#e0a63a" />
		<PhoneCard x={1460} y={170} s={1.05} />
		<Pill x={1612} y={800} text="钱还没到账" />
	</g>
);

const A2 = () => {
	const ground = 900, s = 1.55;
	const tableY = ground - 150 * s - 2;
	const at: V2 = [880, ground];
	const card: V2 = [60, -150];
	const cw: V2 = [at[0] + card[0] * s, at[1] + card[1] * s];
	return (
		<g>
			<CityNight warm={1} />
			<ellipse cx={960} cy={560} rx={700} ry={420} fill="url(#a-lamp)" />
			{/* the quote over the plaza */}
			<text x={960} y={200} textAnchor="middle" style={sansT(96)} fill={GOLD} stroke="#141a2c" strokeOpacity={0.55} strokeWidth={12} paintOrder="stroke">“不惜一切代价”</text>
			{/* borrower (left), Draghi behind the table, lenders (right) */}
			<Person id="spain" at={[330, ground]} s={s} intent="stand" env={{ground}} look={SPAIN} pose={{...POSES.stand, head: 6}} expression="worried" rim="warm" shadow={false} />
			<Placer at={at} s={s} look={DRAGHI} card={card} />
			<Person id="lender1" at={[1430, ground]} s={s} intent="stand" env={{ground}} look={LENDER1} pose={{...POSES.stand, head: -4}} expression="surprise" rim="warm" shadow={false} flip />
			<Person id="lender2" at={[1640, ground]} s={s * 0.96} intent="stand" env={{ground}} look={LENDER2} pose={{...POSES.stand, head: 2}} expression="neutral" rim="warm" shadow={false} flip />
			{/* table in front of Draghi */}
			<rect x={560} y={tableY} width={820} height={26} rx={6} fill="#a06a42" />
			<rect x={580} y={tableY + 26} width={780} height={150} fill="#7e5134" />
			<Card x={cw[0]} y={tableY + 4} s={1.3} />
			<Pill x={330} y={330} text="借钱的：西班牙" />
			<Pill x={880} y={380} text="德拉吉 · 欧洲央行行长" />
			<Bubble x={1450} y={300} r={50} text="怕" o={0.8} fill="#dfe6f2" tail={[1440, 380]} />
			<Bubble x={1660} y={330} r={44} text="怕" o={0.8} fill="#dfe6f2" tail={[1650, 400]} />
			
		</g>
	);
};

/* ---------- Look B 纸片剧场: a paper-cut puppet theatre, warm spotlight, curtains ---------- */
const PaperStage: React.FC<{spot: number}> = ({spot}) => (
	<g>
		<defs>
			<filter id="b-paper" x="-10%" y="-10%" width="120%" height="120%">
				<feDropShadow dx={8} dy={10} stdDeviation={3} floodColor="#2a1610" floodOpacity={0.45} />
			</filter>
			<radialGradient id="b-spot" cx="50%" cy="100%" r="80%">
				<stop offset="0" stopColor="#fff1c8" stopOpacity="0.85" />
				<stop offset="1" stopColor="#fff1c8" stopOpacity="0" />
			</radialGradient>
		</defs>
		<rect width={W} height={H} fill="#e8dcc0" />
		{/* layered paper skyline */}
		{[['#d6c49e', 560, 0], ['#c4ad84', 620, 3], ['#ae9468', 690, 7]].map(([c, y, sd], k) => (
			<path key={k} filter="url(#b-paper)" fill={c as string} d={`M0,${y} ${Array.from({length: 16}, (_, i) => { const x = i * 128, h = 60 + hash(i, (sd as number) + 1) * 140; return `L${x},${(y as number) - h} L${x + 90},${(y as number) - h} L${x + 90},${(y as number) - h * 0.6} L${x + 128},${(y as number) - h * 0.6}`; }).join(' ')} L1920,${y} L1920,1080 L0,1080 Z`} />
		))}
		{/* stage floor */}
		<rect y={860} width={W} height={220} fill="#b0784a" filter="url(#b-paper)" />
		{Array.from({length: 12}, (_, i) => <line key={i} x1={i * 170} y1={860} x2={i * 170 - 60} y2={1080} stroke="#93623a" strokeWidth={3} />)}
		<ellipse cx={W / 2 + spot} cy={880} rx={520} ry={680} fill="url(#b-spot)" />
		{/* curtains + pelmet */}
		<path d="M0,0 L250,0 C220,300 260,700 200,1080 L0,1080 Z" fill="#8c2a2a" filter="url(#b-paper)" />
		<path d="M1920,0 L1670,0 C1700,300 1660,700 1720,1080 L1920,1080 Z" fill="#8c2a2a" filter="url(#b-paper)" />
		<path d="M0,0 L1920,0 L1920,90 C1700,130 1500,80 1300,120 C1100,80 900,130 700,100 C500,130 300,80 0,110 Z" fill="#a33434" filter="url(#b-paper)" />
	</g>
);

const B1 = () => (
	<g>
		<PaperStage spot={-120} />
		<g filter="url(#b-paper)">
			<YouPhone at={[860, 880]} s={1.75} id="you-b" rim="none" />
		</g>
		{/* a paper speech bubble lowered on strings */}
		<line x1={1240} y1={90} x2={1240} y2={250} stroke="#5a4030" strokeWidth={3} />
		<line x1={1520} y1={90} x2={1520} y2={250} stroke="#5a4030" strokeWidth={3} />
		<g filter="url(#b-paper)">
			<rect x={1160} y={250} width={440} height={150} rx={24} fill="#fffaf0" />
			<path d="M1240,400 L1200,470 L1290,400 Z" fill="#fffaf0" />
			<text x={1380} y={312} textAnchor="middle" style={sansT(30, 700)} fill="#8a7a62">老板：</text>
			<text x={1380} y={368} textAnchor="middle" style={sansT(44)} fill="#3a2a10">明年给你涨工资</text>
		</g>
		{/* paper takeaway bag rising + a gold paper star over his head */}
		<g filter="url(#b-paper)">
			<path d="M1150,640 L1290,640 L1275,820 L1165,820 Z" fill="#e9b25b" />
			<path d="M1180,640 C1180,590 1260,590 1260,640" fill="none" stroke="#7a4a20" strokeWidth={8} />
			<text x={1220} y={745} textAnchor="middle" style={sansT(34)} fill="#5a3412">加料</text>
			<path d="M960,250 l22,46 50,6 -37,34 10,50 -45,-25 -45,25 10,-50 -37,-34 50,-6 z" fill={GOLD} />
		</g>
		<Pill x={960} y={180} text="预期" dark={false} />
	</g>
);

const B2 = () => {
	const ground = 900, s = 1.55;
	const tableY = ground - 150 * s - 2;
	const at: V2 = [900, ground];
	const card: V2 = [60, -150];
	const cw: V2 = [at[0] + card[0] * s, at[1] + card[1] * s];
	return (
		<g>
			<PaperStage spot={0} />
			<g filter="url(#b-paper)">
				<Person id="spain-b" at={[420, ground]} s={s} intent="stand" env={{ground}} look={SPAIN} pose={{...POSES.stand, head: 6}} expression="worried" rim="none" shadow={false} />
				<Placer at={at} s={s} look={DRAGHI} card={card} rim="none" />
				<Person id="lender1-b" at={[1420, ground]} s={s} intent="stand" env={{ground}} look={LENDER1} pose={{...POSES.stand, head: -4}} expression="surprise" rim="none" shadow={false} flip />
				<rect x={580} y={tableY} width={780} height={24} fill="#8a5a34" />
				<rect x={600} y={tableY + 24} width={740} height={150} fill="#6e4426" />
				<Card x={cw[0]} y={tableY + 4} s={1.3} />
			</g>
			{/* the promise card hangs from the fly bar like a stage sign */}
			<line x1={830} y1={90} x2={830} y2={190} stroke="#5a4030" strokeWidth={3} />
			<line x1={1090} y1={90} x2={1090} y2={190} stroke="#5a4030" strokeWidth={3} />
			<g filter="url(#b-paper)">
				<rect x={700} y={190} width={520} height={130} rx={10} fill="#fffaf0" />
				<text x={960} y={276} textAnchor="middle" style={sansT(72)} fill="#8c2a2a">不惜一切代价</text>
			</g>
			<Pill x={420} y={340} text="借钱的：西班牙" dark={false} />
			<Pill x={900} y={400} text="德拉吉 · 欧洲央行行长" dark={false} />
			<Bubble x={1440} y={330} r={50} text="怕" o={0.9} fill="#fffaf0" tail={[1430, 400]} />
		</g>
	);
};

/* ---------- Look C 气泡城 (bold): everyone carries a glowing expectation bubble; dusk, silhouettes ---------- */
const Dusk: React.FC = () => (
	<g>
		<defs>
			<linearGradient id="c-sky" x1="0" y1="0" x2="0" y2="1">
				<stop offset="0" stopColor="#2c2752" />
				<stop offset="0.55" stopColor="#6e3f6a" />
				<stop offset="0.85" stopColor="#d9805a" />
				<stop offset="1" stopColor="#f2b56b" />
			</linearGradient>
			<radialGradient id="c-glow" cx="50%" cy="50%" r="50%">
				<stop offset="0" stopColor="#ffe3a0" stopOpacity="0.95" />
				<stop offset="0.6" stopColor="#ffc96b" stopOpacity="0.35" />
				<stop offset="1" stopColor="#ffc96b" stopOpacity="0" />
			</radialGradient>
			<radialGradient id="c-cold" cx="50%" cy="50%" r="50%">
				<stop offset="0" stopColor="#b9c8ff" stopOpacity="0.55" />
				<stop offset="1" stopColor="#b9c8ff" stopOpacity="0" />
			</radialGradient>
		</defs>
		<rect width={W} height={H} fill="url(#c-sky)" />
		{Array.from({length: 26}, (_, i) => {
			const x = i * 76, h = 120 + hash(i, 8) * 200;
			return <rect key={i} x={x} y={760 - h} width={70} height={h + 10} fill="#3a2848" opacity={0.75} />;
		})}
		<rect y={760} width={W} height={H - 760} fill="#2a1f38" />
	</g>
);
const SIL = '#1c1428';
const Crowd: React.FC<{lit: (i: number) => boolean; skip?: number[]; y?: number}> = ({lit, skip = [], y = 960}) => (
	<g>
		{Array.from({length: 14}, (_, i) => {
			if (skip.includes(i)) return null;
			const x = 70 + i * 135 + (hash(i, 2) - 0.5) * 40, s = 0.95 + hash(i, 3) * 0.25;
			return (
				<g key={i}>
					<Person id={`c${i}`} at={[x, y]} s={s} intent="stand" env={{ground: y}} look={YOU} pose={{...POSES.stand, head: (hash(i, 4) - 0.5) * 10}} silhouette={SIL} rim="none" shadow={false} flip={i % 3 === 0} />
					<circle cx={x + 6} cy={y - 380 * s} r={34} fill={lit(i) ? 'url(#c-glow)' : 'url(#c-cold)'} />
					<circle cx={x + 6} cy={y - 380 * s} r={16} fill={lit(i) ? '#ffe6a8' : '#cdd6ff'} opacity={lit(i) ? 0.95 : 0.5} />
				</g>
			);
		})}
	</g>
);

const C1 = () => (
	<g>
		<Dusk />
		<Crowd lit={() => false} skip={[6, 7]} />
		<YouPhone at={[1000, 980]} s={1.6} id="you-c" sil={SIL} rim="none" glow />
		<circle cx={1010} cy={330} r={230} fill="url(#c-glow)" />
		<circle cx={1010} cy={330} r={110} fill="#ffe6a8" opacity={0.9} />
		<text x={1010} y={318} textAnchor="middle" style={sansT(54)} fill="#5a3a10">明年</text>
		<text x={1010} y={378} textAnchor="middle" style={sansT(54)} fill="#5a3a10">涨工资</text>
		<Pill x={1010} y={140} text="预期：亮的那颗" dark />
	</g>
);

const C2 = () => (
	<g>
		<Dusk />
		{/* one giant bubble over the whole city: the sentence */}
		<circle cx={960} cy={300} r={420} fill="url(#c-glow)" />
		<ellipse cx={960} cy={300} rx={560} ry={170} fill="#fff1c8" opacity={0.95} />
		<path d="M920,460 L960,560 L1000,460 Z" fill="#fff1c8" opacity={0.95} />
		<text x={960} y={330} textAnchor="middle" style={sansT(104)} fill="#5a2a10">“不惜一切代价”</text>
		<Crowd lit={(i) => i % 4 !== 1} skip={[6, 7]} />
		<Placer at={[930, 980]} s={1.25} look={DRAGHI} card={[60, -150]} sil={SIL} rim="none" />
		<rect x={760} y={980 - 150 * 1.25 - 2} width={420} height={22} fill="#120c1c" />
		<Card x={930 + 60 * 1.25} y={980 - 150 * 1.25 + 2} s={1.1} tone="gold" />
		<Pill x={960} y={640} text="德拉吉 · 欧洲央行行长" />
		<Pill x={1620} y={640} text="怕的人，一下子少了" />
	</g>
);

export const FRAMES26: KF[] = [
	{sc: 'Look A 夜城借条 · 开场', t: 2.6, note: '扁平插画（坦克/鱼塘那套）：夜里的城市窗景，暖灯；头顶“以后”气泡，手机里外卖升级', draw: A1},
	{sc: 'Look A 夜城借条 · 关键帧', t: 61.0, note: '借钱桌在城市广场上：左边借钱的，中间德拉吉放下“承诺”卡（手里没钱），右边出借人头顶“怕”', draw: A2},
	{sc: 'Look B 纸片剧场 · 开场', t: 2.6, note: '纸片木偶剧：红幕、聚光灯，老板的话像台词牌从上面吊下来，外卖袋“加料”', draw: B1},
	{sc: 'Look B 纸片剧场 · 关键帧', t: 61.0, note: '同一张借钱桌搬上舞台；“不惜一切代价”是吊下来的标语牌；纸片有投影', draw: B2},
	{sc: 'Look C 气泡城（大胆版） · 开场', t: 2.6, note: '黄昏剪影人群，每人头顶一颗“预期”光球；只有你那颗亮了', draw: C1},
	{sc: 'Look C 气泡城（大胆版） · 关键帧', t: 61.0, note: '一句话变成笼罩全城的大气泡，人群的光球一颗颗变暖；人物全是剪影', draw: C2},
];
