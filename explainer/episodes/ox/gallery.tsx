import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {CAST} from '../../src/art/cast';
import {Figure, POSES, SPOTS, blinkAt, walkPose, type Expression} from '../../src/art/Figure';
import {Materials} from '../../src/art/materials';
import {BallotBox, Bale, Lantern, OX_DEFS, Ox, Signboard, Ticket, TicketMotif} from '../../src/art/Ox';
import {P} from '../../src/art/palette';
import {Fair1906} from '../../src/art/sets/Fair1906';
import {DESK_Y, OilLamp, Quincunx, Study1906} from '../../src/art/sets/Study1906';
import {lookAt} from '../../src/art/sets/Airfield';
import {loadEpisodeFonts} from '../../src/lib/fonts';
import {font} from '../../src/lib/theme';

/** 《八百人猜牛》 model sheets, one per frame: COMPOSITION=OxGallery node scripts/stills.mjs ox out/gallery-ox 0 1 … */
export const OX_SHEETS = ['ox', 'cast', 'props', 'fair', 'study'] as const;

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
			</svg>
		</AbsoluteFill>
	);
};
