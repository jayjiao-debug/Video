import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {CAST} from '../../src/art/cast';
import {Figure, POSES, handAt, type Expression} from '../../src/art/Figure';
import {Materials} from '../../src/art/materials';
import {OX_DEFS} from '../../src/art/Ox';
import {P} from '../../src/art/palette';
import {lookAt} from '../../src/art/sets/Airfield';
import {Apartment, BED, StorageBox, seatY} from '../../src/art/sets/Apartment';
import {AllenKey, Balance, FlatPack, Headphones59, Intercom, LAB_DESK_Y, Lab1959, Quad1959, ShockBox, TapeRecorder} from '../../src/art/sets/Stanford1959';
import {loadEpisodeFonts} from '../../src/lib/fonts';
import {font} from '../../src/lib/theme';
import {COED_POSE, Chalk, Clipboard, EXP_POSE, HandCard, HandPhone, Person, SHE_POSE, SheOnBed} from './acting';

/** 《越难越爱》 model sheets, one per frame: COMPOSITION=YuenanGallery node scripts/stills.mjs yuenan out/gallery 0 1 … */
export const YUENAN_SHEETS = ['cast', 'room', 'dawn', 'quad', 'lab', 'props', 'acting'] as const;

const Title: React.FC<{children: React.ReactNode; sub?: string}> = ({children, sub}) => (
	<g>
		<rect x={60} y={44} width={1240} height={110} rx={12} fill="rgba(6,8,14,0.62)" />
		<text x={84} y={98} style={{fontFamily: font.serif, fontWeight: 900, fontSize: 46, fill: P.gold}}>
			{children}
		</text>
		{sub ? (
			<text x={86} y={136} style={{fontFamily: font.sans, fontSize: 21, fill: '#efe6d6', letterSpacing: '0.08em'}}>
				{sub}
			</text>
		) : null}
	</g>
);
const Label: React.FC<{x: number; y: number; children: React.ReactNode}> = ({x, y, children}) => (
	<text x={x} y={y} textAnchor="middle" style={{fontFamily: font.sans, fontSize: 22, fill: '#e9dfcc', letterSpacing: '0.06em'}}>
		{children}
	</text>
);
const Backdrop: React.FC = () => (
	<>
		<rect width={1920} height={1080} fill="#151a26" />
		<ellipse cx={1100} cy={300} rx={1000} ry={560} fill="url(#lantern-glow)" opacity={0.28} />
		<rect y={880} width={1920} height={200} fill="#0f121a" />
	</>
);

/** chalk bars on the board (board space 640×340); `k` grows them */
export const ChalkBars: React.FC<{vals: number[]; labels: string[]; gold?: number; dashed?: boolean; k?: number}> = ({vals, labels, gold = -1, dashed, k = 1}) => (
	<g>
		<line x1={70} y1={290} x2={590} y2={290} stroke="#e8e6dc" strokeWidth={3} opacity={0.75} />
		{vals.map((v, i) => {
			const h = (v - 60) * 4.6 * k;
			const x = 130 + i * 190;
			const g = i === gold;
			return (
				<g key={i}>
					<rect x={x - 40} y={290 - h} width={80} height={h} fill={g ? '#f1c56d' : '#e8e6dc'} opacity={g ? 0.35 : 0.12} />
					<rect x={x - 40} y={290 - h} width={80} height={h} fill="none" stroke={g ? '#f1c56d' : '#e8e6dc'} strokeWidth={3} strokeDasharray={dashed ? '10 8' : undefined} opacity={0.85} />
					<text x={x} y={318} textAnchor="middle" style={{fontFamily: font.sans, fontSize: 20, fill: '#e8e6dc', opacity: 0.8}}>
						{labels[i]}
					</text>
					{!dashed && k >= 1 ? (
						<text x={x} y={280 - h} textAnchor="middle" style={{fontFamily: font.latin, fontWeight: 600, fontSize: g ? 40 : 30, fill: g ? '#f1c56d' : '#e8e6dc', fontVariantNumeric: 'lining-nums'}}>
							{v}
						</text>
					) : null}
				</g>
			);
		})}
	</g>
);

const CastSheet: React.FC<{f: number}> = ({f}) => {
	const list: [keyof typeof CAST, string][] = [
		['she', '她 · 2026'],
		['coed59', '女大学生 · 1959'],
		['experimenter59', '男实验员 · 1959'],
		['aronson59', '阿伦森 · 27岁'],
		['student11', '受试者 · 2011'],
	];
	const ex: Expression[] = ['neutral', 'worried', 'thinking', 'smile', 'surprise', 'stern'];
	return (
		<>
			<Backdrop />
			<Title sub="同一套骨架和比例 · 全彩上色 · 暖光主灯，冷色轮廓光">演员表 · 越难越爱</Title>
			{list.map(([k, label], i) => (
				<g key={k}>
					<g transform={`translate(${260 + i * 340},600) scale(1.0)`}>
						<Figure look={CAST[k]} pose={POSES.stand} rim="warm" blink={1} expression={i === 0 ? 'worried' : 'neutral'} />
					</g>
					<Label x={260 + i * 340} y={650}>
						{label}
					</Label>
				</g>
			))}
			{ex.map((e, i) => (
				<g key={e}>
					<g transform={`translate(${300 + i * 260},1330) scale(1.6)`}>
						<Figure look={CAST.she} pose={POSES.stand} rim="warm" blink={1} expression={e} />
					</g>
					<Label x={300 + i * 260} y={1000}>
						{['平静', '担心', '想事', '微笑', '惊讶', '冷淡'][i]}
					</Label>
				</g>
			))}
			<g>
				{ex.map((e, i) => (
					<g key={e} transform={`translate(${300 + i * 260},0)`}>
						<rect x={-80} y={890} width={160} height={180} fill="none" />
					</g>
				))}
			</g>

		</>
	);
};

const RoomSheet: React.FC<{f: number}> = ({f}) => {
	const s = 1.15;
	const y = seatY(s);
	const x = 640;
	const hand = handAt(SHE_POSE.phone);
	return (
		<>
			<Apartment frame={f} lamp={1} phone={{x: x + hand[0] * s, y: y + hand[1] * s, o: 0.8}} bed={<SheOnBed f={f} x={x} y={y} s={s} />} />
			<Title sub="凌晨一点 · 床头灯是暖主光 · 手机是冷补光 · 窗外城市还亮着 · 自己拼的收纳盒在窗下">场景 · 她的房间（夜）</Title>
		</>
	);
};

const DawnSheet: React.FC<{f: number}> = ({f}) => (
	<>
		<Apartment
			frame={f}
			dawn={1}
			lamp={0.2}
			bed={
				<g transform={`translate(${BED.x0 + 560},${BED.top + 6}) rotate(4)`}>
					<rect x={-40} y={-10} width={80} height={20} rx={5} fill="#15161f" />
				</g>
			}
			children={<Person who="she" f={f} x={1420} y={1010} s={1.2} pose={POSES.stand} back rim="warm" />}
		/>
		<Title sub="结尾 · 天亮了 · 手机扣在床上 · 她站到窗前（背影）">场景 · 她的房间（清晨）</Title>
	</>
);

const QuadSheet: React.FC<{f: number}> = ({f}) => (
	<>
		<Quad1959
			frame={f}
			door={0.5}
			children={
				<>
					<Person who="aronson59" f={f} x={1180} y={940} s={1.05} pose={{...POSES.present, armFar: [10, 40]}} hand="open" flip rim="warm" />
					<Person who="coed59" f={f} x={860} y={950} s={1.0} pose={POSES.stand} rim="warm" />
				</>
			}
		/>
		<Title sub="主四方院的砂岩拱廊 · 红瓦屋顶 · 棕榈 · 铁灯 · 第六个拱门里是实验室的门">场景 · 斯坦福 1959（夜）</Title>
	</>
);

const LabSheet: React.FC<{f: number}> = ({f}) => {
	const cam = lookAt(960, 540, 1);
	return (
		<>
			<Lab1959
				frame={f}
				cam={cam}
				reels={1}
				board={<ChalkBars vals={[80.2, 81.8, 97.6]} labels={['免考', '温和', '难堪']} gold={2} />}
				behind={
					<>
						<Person who="coed59" f={f} x={600} y={LAB_DESK_Y - 50 + 216 * 1.1} s={1.1} pose={COED_POSE.read} hand="pinch" hold={<HandCard />} expression="worried" />
						<Person who="experimenter59" f={f} x={1340} y={LAB_DESK_Y - 50 + 216 * 1.05} s={1.05} pose={EXP_POSE.sit} hand="grip" hold={<Clipboard />} flip rim="warm" />
					</>
				}
			/>
			<Title sub="墙板 · 百叶窗外是夜 · 绿罩台灯是主光 · 黑板（之后画评分柱） · 对讲机 · 盘式录音机">场景 · 1959 心理学实验室</Title>
		</>
	);
};

const PropsSheet: React.FC<{f: number}> = ({f}) => (
	<>
		<Backdrop />
		<Title sub="材质渐变 · 与场景同一套光 · 平板件分四步拼起">道具</Title>
		<g transform="translate(300,520)">
			<TapeRecorder t={f} />
		</g>
		<Label x={300} y={570}>
			盘式录音机
		</Label>
		<g transform="translate(640,430)">
			<Headphones59 />
		</g>
		<g transform="translate(640,560)">
			<Intercom talk={1} />
		</g>
		<Label x={640} y={600}>
			耳机 · 对讲机
		</Label>
		<g transform="translate(960,520)">
			<ShockBox k={0.85} spark={1} />
		</g>
		<Label x={960} y={570}>
			电击器（1966）
		</Label>
		<g transform="translate(1520,560) scale(0.85)">
			<Balance
				tilt={14}
				left={
					<g>
						{[0, 1, 2, 3].map((i) => (
							<rect key={i} x={-60 + (i % 2) * 10} y={-24 - i * 22} width={110 - i * 12} height={20} rx={10} fill="#f1c56d" opacity={0.9} />
						))}
					</g>
				}
				right={<rect x={-22} y={-22} width={44} height={20} rx={10} fill="#9a96b4" />}
			/>
		</g>
		<Label x={1520} y={620}>
			天平：她的付出 vs TA 的“嗯”
		</Label>
		{[0, 0.35, 0.7, 1].map((k, i) => (
			<g key={i}>
				<g transform={`translate(${260 + i * 300},920) scale(0.75)`}>
					<FlatPack k={k} />
				</g>
			</g>
		))}
		<g transform="translate(1500,930) scale(1.6)">
			<AllenKey />
		</g>
		<g transform="translate(1680,930) scale(0.6)">
			<StorageBox />
		</g>
		<Label x={720} y={970}>
			平板件 → 收纳盒（宜家效应）
		</Label>
	</>
);

const ActingSheet: React.FC<{f: number}> = ({f}) => {
	const strip: [string, React.ReactNode][] = [
		['看手机', <SheOnBed key="a" f={f} x={0} y={0} s={0.9} keys={[[0, SHE_POSE.phone]]} />],
		['打字', <SheOnBed key="b" f={f} x={0} y={0} s={0.9} keys={[[0, SHE_POSE.type]]} />],
		['放到腿上', <SheOnBed key="c" f={f} x={0} y={0} s={0.9} keys={[[0, SHE_POSE.lap]]} lit={0.4} />],
		['叹气抬头', <SheOnBed key="d" f={f} x={0} y={0} s={0.9} keys={[[0, SHE_POSE.sigh]]} phone="none" expression="thinking" />],
		['扣下手机', <SheOnBed key="e" f={f} x={0} y={0} s={0.9} keys={[[0, SHE_POSE.place]]} phone="down" />],
		['捧着光', <SheOnBed key="g" f={f} x={0} y={0} s={0.9} keys={[[0, SHE_POSE.cup]]} phone="none" hand="open" expression="smile" />],
	];
	const strip2: [string, React.ReactNode][] = [
		['念卡片', <Person key="1" who="coed59" f={f} x={0} y={0} s={0.9} pose={COED_POSE.read} hand="pinch" hold={<HandCard />} />],
		['脸红低头', <Person key="2" who="coed59" f={f} x={0} y={0} s={0.9} pose={COED_POSE.flush} hand="pinch" hold={<HandCard />} expression="worried" />],
		['戴耳机听', <Person key="3" who="coed59" f={f} x={0} y={0} s={0.9} pose={COED_POSE.listen} expression="thinking" />],
		['打分', <Person key="4" who="coed59" f={f} x={0} y={0} s={0.9} pose={COED_POSE.rate} expression="smile" />],
		['黑板写字', <Person key="5" who="experimenter59" f={f} x={0} y={0} s={0.9} pose={EXP_POSE.write} hand="pinch" hold={<Chalk />} />],
		['退后看', <Person key="6" who="experimenter59" f={f} x={0} y={0} s={0.9} pose={EXP_POSE.look} />],
	];
	return (
		<>
			<Backdrop />
			<Title sub="手按动作摆：握手机 / 捏卡片 / 捏粉笔；关节在人体范围内；坐姿有床沿/椅面">动作条 · 关键姿势</Title>
			{strip.map(([l, node], i) => (
				<g key={i}>
					<rect x={150 + i * 290} y={460} width={170} height={10} fill="#3a3040" />
					<g transform={`translate(${200 + i * 290},${460 + 216 * 0.9})`}>{node}</g>
					<Label x={200 + i * 290} y={520}>
						{l}
					</Label>
				</g>
			))}
			{strip2.map(([l, node], i) => (
				<g key={i}>
					{i < 4 ? <rect x={150 + i * 290} y={880} width={170} height={10} fill="#3a3040" /> : null}
					<g transform={`translate(${200 + i * 290},${i < 4 ? 880 + 216 * 0.9 : 1010})`}>{node}</g>
					<Label x={200 + i * 290} y={1050}>
						{l}
					</Label>
				</g>
			))}
		</>
	);
};

export const YuenanGallery: React.FC = () => {
	loadEpisodeFonts('yuenan');
	const f = useCurrentFrame();
	const sheet = YUENAN_SHEETS[f % YUENAN_SHEETS.length];
	const t = 40;
	return (
		<AbsoluteFill style={{background: '#000'}}>
			<svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{fontVariantNumeric: 'lining-nums'}}>
				<Materials />
				<OX_DEFS />
				{sheet === 'cast' ? <CastSheet f={t} /> : null}
				{sheet === 'room' ? <RoomSheet f={t} /> : null}
				{sheet === 'dawn' ? <DawnSheet f={t} /> : null}
				{sheet === 'quad' ? <QuadSheet f={t} /> : null}
				{sheet === 'lab' ? <LabSheet f={t} /> : null}
				{sheet === 'props' ? <PropsSheet f={t} /> : null}
				{sheet === 'acting' ? <ActingSheet f={t} /> : null}
			</svg>
		</AbsoluteFill>
	);
};
