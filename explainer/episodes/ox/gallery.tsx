import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {CAST} from '../../src/art/cast';
import {Figure, POSES, SPOTS, blinkAt, walkPose, type Expression, type HandShape, type Pose} from '../../src/art/Figure';
import {Materials} from '../../src/art/materials';
import {BallotBox, Bale, Lantern, OX_DEFS, Ox, Signboard, Ticket, TicketMotif} from '../../src/art/Ox';
import {P} from '../../src/art/palette';
import {Fair1906} from '../../src/art/sets/Fair1906';
import {DESK_Y, OilLamp, Quincunx, Study1906} from '../../src/art/sets/Study1906';
import {lookAt} from '../../src/art/sets/Airfield';
import {BUTCHER, ButcherPosting, DROVER, DroverWithRope, GALTON} from './acting';
import {loadEpisodeFonts} from '../../src/lib/fonts';
import {font} from '../../src/lib/theme';

/** 《八百人猜牛》 model sheets, one per frame: COMPOSITION=OxGallery node scripts/stills.mjs ox out/gallery-ox 0 1 … */
export const OX_SHEETS = ['ox', 'cast', 'props', 'fair', 'study', 'hands', 'acting'] as const;

const Title: React.FC<{children: React.ReactNode; sub?: string}> = ({children, sub}) => (
	<g>
		<rect x={60} y={44} width={1120} height={110} rx={12} fill="rgba(6,8,14,0.6)" />
		<text x={84} y={98} style={{fontFamily: font.serif, fontWeight: 900, fontSize: 48, fill: P.gold}}>
			{children}
		</text>
		{sub ? (
			<text x={86} y={136} style={{fontFamily: font.sans, fontSize: 22, fill: '#efe6d6', letterSpacing: '0.1em'}}>
				{sub}
			</text>
		) : null}
	</g>
);

const Label: React.FC<{x: number; y: number; children: React.ReactNode}> = ({x, y, children}) => (
	<text x={x} y={y} textAnchor="middle" style={{fontFamily: font.sans, fontSize: 22, fill: '#e9dfcc', letterSpacing: '0.08em'}}>
		{children}
	</text>
);

const Backdrop: React.FC = () => (
	<>
		<rect width={1920} height={1080} fill="#151a26" />
		<ellipse cx={1200} cy={260} rx={1000} ry={560} fill="url(#lantern-glow)" opacity={0.3} />
		<rect y={900} width={1920} height={180} fill="#0f121a" />
	</>
);

const OxSheet: React.FC<{f: number}> = ({f}) => (
	<>
		<Backdrop />
		<Title sub="红德文牛（普利茅斯本地品种）· 肩高约为人的 0.85 · 暖光从右上来">那头牛 · 定稿</Title>
		{/* hero, with a person for scale */}
		<g transform="translate(760,640) scale(1.15)">
			<Ox pose={{head: 0, tail: 0.2, breath: 0.5}} blink={blinkAt(f, 'ox')} lit={0.8} />
		</g>
		<g transform="translate(1180,640) scale(1.15)">
			<Figure look={CAST.drover} pose={POSES.hold} reach={{near: [-60, -230]}} flip rim="warm" blink={1} />
		</g>
		<Label x={760} y={720}>主视角 · 套着笼头</Label>
		{/* head and tail range, walk, silhouette */}
		{[
			[{head: -12, tail: -0.8, breath: 0}, '抬头'],
			[{head: 18, tail: 0.8, breath: 1}, '低头 · 甩尾'],
			[{head: 0, tail: 0, breath: 0, walk: 1.2}, '走动'],
		].map(([pose, label], i) => (
			<g key={i}>
				<g transform={`translate(${220 + i * 420},990) scale(0.5)`}>
					<Ox pose={pose as never} blink={i === 1 ? 0.15 : 1} />
				</g>
				<Label x={220 + i * 420} y={1050}>
					{label as string}
				</Label>
			</g>
		))}
		<g transform="translate(1600,990) scale(0.5)">
			<Ox silhouette="#0b0d14" rim="none" />
		</g>
		<Label x={1600} y={1050}>剪影（逆光镜头）</Label>
	</>
);

const CastSheet: React.FC<{f: number}> = ({f}) => {
	const list: [keyof typeof CAST, string][] = [
		['galton', '高尔顿 · 84岁'],
		['butcher', '屠夫'],
		['drover', '赶牛人'],
		['gent', '城里绅士'],
		['shopgirl', '店员姑娘'],
		['clerk06', '小职员'],
		['farmwife', '农妇'],
		['lad', '少年'],
	];
	const ex: [Expression, string][] = [
		['neutral', '平静'],
		['stern', '不以为然'],
		['thinking', '琢磨'],
		['surprise', '吃惊'],
		['smile', '会心'],
	];
	return (
		<>
			<Backdrop />
			<Title sub="同一套骨骼 · 1906 年的帽子：圆顶礼帽、平帽、硬草帽、女式软帽">集市众人 · 定稿</Title>
			{list.map(([k, label], i) => (
				<g key={k}>
					<g transform={`translate(${150 + i * 225},590) scale(1.0)`}>
						<Figure look={CAST[k]} pose={i === 0 ? POSES.think : i === 1 ? POSES.write : POSES.stand} reach={i === 0 ? {far: SPOTS.chin} : undefined} blink={blinkAt(f, k)} rim="warm" expression={i === 0 ? 'stern' : 'neutral'} flip={i % 2 === 1} />
					</g>
					<Label x={150 + i * 225} y={636}>
						{label}
					</Label>
				</g>
			))}
			{ex.map(([e, label], i) => (
				<g key={e}>
					<g transform={`translate(${520 + i * 220},1560) scale(2.2)`}>
						<Figure look={CAST.galton} expression={e} rim="warm" shadow={false} />
					</g>
					<rect x={420 + i * 220} y={1008} width={200} height={72} fill="#151a26" />
					<Label x={520 + i * 220} y={1036}>
						{label}
					</Label>
				</g>
			))}
		</>
	);
};

const PropsSheet: React.FC<{f: number}> = ({f}) => (
	<>
		<Backdrop />
		<Title sub="票根：编号 · 姓名 · 估重（磅）· 六便士印章 · 远景简化为线条和色块">票根与道具 · 定稿</Title>
		<g transform="translate(300,330) scale(1.6)">
			<Ticket no={394} name="W. Pengelly" guess={1207} />
		</g>
		<Label x={300} y={470}>特写（可读）</Label>
		<g transform="translate(300,620) scale(1.6) rotate(-4)">
			<Ticket no={394} name="W. Pengelly" guess={1207} glow={1} />
		</g>
		<Label x={300} y={760}>答案票：手写数字发金光</Label>
		<g transform="translate(680,330)">
			<Ticket lod="mid" />
		</g>
		<g transform="translate(680,470) scale(0.4)">
			{Array.from({length: 9}, (_, i) => (
				<g key={i} transform={`translate(${(i - 4) * 70},0)`}>
					<Ticket lod="tiny" />
				</g>
			))}
		</g>
		<Label x={680} y={540}>中景 / 远景细节</Label>
		<g transform="translate(680,700)">
			<rect x={-160} y={-110} width={320} height={220} rx={10} fill="#05060b" />
			<TicketMotif p={1} />
		</g>
		<Label x={680} y={850}>母题（片头 / 片尾卡）</Label>
		<g transform="translate(1000,880)">
			<BallotBox />
		</g>
		<Label x={1000} y={930}>票箱</Label>
		<g transform="translate(1200,300)">
			<Lantern f={f} glow={0.6} />
		</g>
		<Label x={1200} y={430}>马灯（主光）</Label>
		<g transform="translate(1250,880)">
			<Bale />
		</g>
		<g transform="translate(1500,880)">
			<Signboard />
		</g>
		<Label x={1500} y={930}>告示牌</Label>
		<g transform="translate(1780,520)">
			<Quincunx />
		</g>
		<Label x={1780} y={560}>高尔顿板</Label>
		<g transform="translate(1780,880)">
			<OilLamp f={f} />
		</g>
		<Label x={1780} y={930}>书房油灯</Label>
	</>
);

const FairSheet: React.FC<{f: number}> = ({f}) => (
	<>
		<Fair1906
			frame={f + 60}
			cam={lookAt(960, 560, 1)}
			front={
				<g>
					{[
						[120, 'gent'],
						[330, 'shopgirl'],
						[1640, 'butcher'],
						[1840, 'drover'],
					].map(([x, who], i) => (
						<g key={i} transform={`translate(${x},1240) scale(1.25)`}>
							<Figure look={CAST[who as string]} facing="back" silhouette="#07080d" rim="none" shadow={false} />
						</g>
					))}
				</g>
			}
		>
			<g transform="translate(1050,880) scale(0.95)">
				<Ox pose={{head: 6, tail: 0.3, breath: 0.4}} blink={blinkAt(f, 'ox')} lit={0.9} />
			</g>
			<g transform="translate(1390,885) scale(0.95)">
				<Figure look={CAST.drover} pose={POSES.hold} reach={{near: [-70, -210]}} flip rim="warm" />
			</g>
			<g transform="translate(440,890)">
				<Signboard />
			</g>
			<g transform="translate(640,892) scale(0.95)">
				<Figure look={CAST.butcher} pose={POSES.write} rim="warm" holdNear={<g transform="scale(0.12)"><Ticket lod="mid" /></g>} />
			</g>
			<g transform="translate(745,896) scale(0.9)">
				<BallotBox />
			</g>
		</Fair1906>
		<Title sub="1906 普利茅斯家畜展 · 蓝调时刻 · 主光：吊在牛上方的大马灯 · 冷光：月亮">场景 · 集市</Title>
	</>
);

const StudySheet: React.FC<{f: number}> = ({f}) => (
	<>
		<Study1906
			frame={f}
			cam={lookAt(960, 560, 1)}
			desk={
				<g>
					{Array.from({length: 26}, (_, i) => (
						<g key={i} transform={`translate(${380 + i * 34},${DESK_Y + 8}) scale(0.3) rotate(${(i % 3) - 1})`}>
							<Ticket lod="mid" />
						</g>
					))}
					<g transform={`translate(860,${DESK_Y - 4}) scale(0.5) rotate(-6)`}>
						<Ticket guess={1180} name="J. Hext" no={127} />
					</g>
				</g>
			}
		>
			<g transform={`translate(1060,${DESK_Y + 300}) scale(1.6)`}>
				<Figure look={CAST.galton} pose={POSES.write} expression="thinking" blink={blinkAt(f, 'g')} rim="warm" shadow={false} holdNear={<g transform="scale(0.1)"><Ticket lod="mid" /></g>} />
			</g>
		</Study1906>
		<Title sub="伦敦 拉特兰门42号 · 夜 · 主光：书桌油灯 · 冷光：窗外月色与雾">场景 · 高尔顿的书房</Title>
	</>
);


const HandsSheet: React.FC = () => {
	const list: [string, Pose, HandShape, keyof typeof CAST, React.ReactNode?][] = [
		['自然垂手', POSES.stand, 'relaxed', 'gent'],
		['握绳', {...DROVER, armNear: [20, 50]}, 'grip', 'drover', <path key="r" d="M0,-40 C4,-10 -4,20 2,60" stroke="#b08a52" strokeWidth={4} fill="none" />],
		['摊手', {...POSES.present, armNear: [30, 88]}, 'open', 'clerk06'],
		['指', {...POSES.point, armNear: [80, 14]}, 'point', 'shopgirl'],
		['捏票', BUTCHER.read, 'pinch', 'butcher', <g key="t" transform="rotate(-70) scale(0.13)"><Ticket lod="mid" /></g>],
	];
	return (
		<>
			<Backdrop />
			{list.map(([label, pose, shape, who, item], i) => (
				<g key={label}>
					<g transform={`translate(${150 + i * 390},1000) scale(2.3)`}>
						<Figure look={CAST[who]} pose={pose} hands={{near: shape}} holdNear={item} rim="warm" shadow={false} />
					</g>
					<rect x={20 + i * 390} y={1000} width={300} height={80} fill="#0f121a" />
					<Label x={170 + i * 390} y={1040}>
						{label}
					</Label>
				</g>
			))}
			<Title sub="共享骨骼重画：拇指 + 手指，五种手型；手约为身高的 9%（原来像连指手套）">手 · 返工</Title>
		</>
	);
};

const ActingSheet: React.FC<{f: number}> = ({f}) => {
	const beats: [number, string][] = [
		[0, '看票'],
		[8, '预备：抬手后仰'],
		[15, '投进去'],
		[19, '多推一下'],
		[25, '松手'],
		[44, '直起身看牛'],
	];
	const oxPose = {head: 0, tail: 0.2, breath: 0.4};
	return (
		<>
			<Backdrop />
			{beats.map(([k, label], i) => (
				<g key={k}>
					<g transform={`translate(${30 + i * 310},0)`}>
						<ButcherPosting f={100 + k} t0={100} x={100} y={560} s={1.05} />
					</g>
					<Label x={180 + i * 310} y={610}>
						{`${i + 1} · ${label}`}
					</Label>
				</g>
			))}
			{/* the drover holding the ox by its halter rope */}
			<g transform="translate(-180,0)">
				<g transform="translate(700,1010) scale(0.95)">
					<Ox pose={oxPose} blink={1} lit={0.8} />
				</g>
				<DroverWithRope f={f} x={1180} y={1012} s={0.95} ox={{x: 700, y: 1010, s: 0.95, pose: oxPose}} />
			</g>
			<Label x={760} y={1060}>赶牛人：手握缰绳，绳子接在笼头环上</Label>
			<g transform="translate(1500,1010) scale(0.95)">
				<Figure look={CAST.galton} pose={GALTON.chin} hands={{far: 'relaxed'}} expression="stern" rim="warm" />
			</g>
			<Label x={1500} y={1060}>高尔顿：捻胡须，不以为然</Label>
			<Title sub="手按解算的角度落在票箱口、缰绳、下巴上 · 每个动作：预备 → 动作 → 过冲 → 回稳">表演 · 返工</Title>
		</>
	);
};

export const OxGallery: React.FC = () => {
	loadEpisodeFonts('ox');
	const f = useCurrentFrame();
	const sheet = OX_SHEETS[f % OX_SHEETS.length];
	return (
		<AbsoluteFill style={{background: '#000'}}>
			<svg width={1920} height={1080} viewBox="0 0 1920 1080">
				<Materials />
				<OX_DEFS />
				<defs>
					<radialGradient id="brand-glow">
						<stop offset="0" stopColor="#ffe7b0" stopOpacity="0.9" />
						<stop offset="0.35" stopColor="#f1c56d" stopOpacity="0.35" />
						<stop offset="1" stopColor="#f1c56d" stopOpacity="0" />
					</radialGradient>
				</defs>
				{sheet === 'ox' ? <OxSheet f={f + 40} /> : null}
				{sheet === 'cast' ? <CastSheet f={f + 40} /> : null}
				{sheet === 'props' ? <PropsSheet f={f + 40} /> : null}
				{sheet === 'fair' ? <FairSheet f={f + 40} /> : null}
				{sheet === 'study' ? <StudySheet f={f + 40} /> : null}
				{sheet === 'hands' ? <HandsSheet /> : null}
				{sheet === 'acting' ? <ActingSheet f={f + 40} /> : null}
			</svg>
		</AbsoluteFill>
	);
};
