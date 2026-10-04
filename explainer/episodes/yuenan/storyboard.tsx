import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {GlowDefs} from '../../src/art/glow/kit';
import {Materials} from '../../src/art/materials';
import {loadEpisodeFonts} from '../../src/lib/fonts';
import {font} from '../../src/lib/theme';
import {Grade, Sub, Tag} from '../xuming/look3';
import {Glow, Thin} from '../xuming/kit3';
import {GoldTitle, Monogram} from '../../src/brand/Brand';
import {POSES} from '../../src/art/Figure';
import {Bedroom, Bubble, Bulb, Card, ChatHead, Corridor, DeskLamp, Dust, FlatPack, H, Headphones, HUE, Person, Phone, Pool, SHE, SIT_PHONE, STUDENT59, Typing, W, Wave} from './kit';

/**
 * 《越难越爱》 storyboard: one key frame per shot, drawn with the episode kit.
 * White dashed arrows are the camera move, pink ♪ pills are what lands on the music.
 * Render: COMPOSITION=YuenanBoard node scripts/stills.mjs yuenan <dir> 0 1 2 ...
 */

const Arrow: React.FC<{d: string; label?: string; lx?: number; ly?: number}> = ({d, label, lx = 0, ly = 0}) => (
	<g opacity={0.85}>
		<path d={d} fill="none" stroke="#fff" strokeWidth={3} strokeDasharray="14 10" markerEnd="url(#ah)" />
		{label ? (
			<g>
				<rect x={lx - 10} y={ly - 30} width={label.length * 25 + 22} height={42} rx={21} fill="#000" opacity={0.55} />
				<text x={lx + 2} y={ly} style={{fontFamily: font.sans, fontWeight: 600, fontSize: 24, fill: '#fff'}}>
					{label}
				</text>
			</g>
		) : null}
	</g>
);
const Beat: React.FC<{x: number; y: number; label: string}> = ({x, y, label}) => (
	<g>
		<rect x={x - 10} y={y - 32} width={label.length * 25 + 56} height={44} rx={22} fill="#e8455f" opacity={0.9} />
		<text x={x + 8} y={y} style={{fontFamily: font.sans, fontWeight: 700, fontSize: 24, fill: '#fff'}}>
			♪ {label}
		</text>
	</g>
);

type Panel = {id: string; t: string; art: () => React.ReactNode};

/** seated on the bed edge, hips on the mattress (bed top y=700) */
const SEAT_Y = (bedTop: number, s: number) => bedTop + 216 * s;

const Her: React.FC<{dawn?: boolean; phoneUp?: boolean}> = ({dawn, phoneUp = true}) => {
	const s = 1.3;
	const x = 700;
	const y = SEAT_Y(700, s);
	return (
		<g>
			<Person look={SHE} x={x} y={y} s={s} pose={phoneUp ? SIT_PHONE : {...SIT_PHONE, head: 4, armNear: [14, 30], armFar: [10, 34]}} rim={dawn ? 'warm' : 'cool'} sil={dawn ? '#150d16' : '#0a0a14'} reach={phoneUp ? {near: [104, -262], far: [98, -258]} : undefined} />
			{phoneUp ? (
				<g transform={`translate(${x + 104 * s},${y - 262 * s - 6}) rotate(-20)`}>
					<rect x={-13} y={-22} width={26} height={44} rx={5} fill={HUE.phoneWarm} />
					<circle r={70} fill={HUE.phone} opacity={0.22} filter="url(#b8)" />
				</g>
			) : null}
		</g>
	);
};

/** a seated 1959 student in warm-rimmed silhouette, facing right */
const Student: React.FC<{x: number; seat: number; s?: number; head?: number; reach?: [number, number]}> = ({x, seat, s = 1.3, head = 10, reach}) => (
	<g>
		<path d={`M${x - 70 * s},${seat} L${x + 40 * s},${seat} L${x + 40 * s},${seat + 14} L${x - 70 * s},${seat + 14} Z M${x - 64 * s},${seat} L${x - 80 * s},${seat - 170 * s} L${x - 66 * s},${seat - 170 * s} L${x - 50 * s},${seat} Z M${x - 60 * s},${seat + 14} L${x - 60 * s},${seat + 150} M${x + 32 * s},${seat + 14} L${x + 32 * s},${seat + 150}`} fill="#140e0a" stroke="#140e0a" strokeWidth={6} />
		<Person look={STUDENT59} x={x} y={seat + 216 * s} s={s} pose={{lean: 6, head, armNear: [40, 60], armFar: [34, 66], legNear: [86, 88], legFar: [82, 90], lift: -66}} rim="warm" sil="#120c0a" reach={reach ? {near: reach, far: [reach[0] - 6, reach[1] + 4]} : undefined} />
	</g>
);

const Table: React.FC<{x0: number; x1: number; y: number}> = ({x0, x1, y}) => (
	<g>
		<rect x={x0} y={y} width={x1 - x0} height={16} fill="#2a1d14" />
		<rect x={x0} y={y} width={x1 - x0} height={2} fill={HUE.lamp} opacity={0.5} />
		<rect x={x0 + 30} y={y + 16} width={14} height={H - y} fill="#160f0a" />
		<rect x={x1 - 44} y={y + 16} width={14} height={H - y} fill="#160f0a" />
	</g>
);

/** a thin-line bar with a value label */
const Bar: React.FC<{x: number; base: number; h: number; label: string; v?: string; gold?: boolean; dashed?: boolean; red?: boolean; o?: number}> = ({x, base, h, label, v, gold, dashed, red, o = 1}) => {
	const c = gold ? HUE.gold : red ? '#e5484d' : '#cfc6b6';
	return (
		<g opacity={o}>
			<rect x={x - 70} y={base - h} width={140} height={h} fill={c} opacity={gold ? 0.22 : 0.08} stroke={c} strokeWidth={2} strokeDasharray={dashed ? '10 8' : undefined} filter={gold ? 'url(#g-sm)' : undefined} />
			{v ? (
				<text x={x} y={base - h - 24} textAnchor="middle" style={{fontFamily: font.latin, fontWeight: 600, fontSize: gold ? 76 : 54, fill: c}}>
					{v}
				</text>
			) : null}
			<text x={x} y={base + 50} textAnchor="middle" style={{fontFamily: font.sans, fontSize: 26, letterSpacing: '0.2em', fill: '#d8cfc0'}} opacity={0.8}>
				{label}
			</text>
		</g>
	);
};
const BASE = 760;
const SC = (v: number) => (v - 60) * 13; // visual scale for the ratings (axis starts at 60, labelled)

const Lamp1959: React.FC<{id: string}> = ({id}) => (
	<>
		<rect width={W} height={H} fill="#07060a" />
		<Pool x={1180} y={420} r={820} c={HUE.lamp} id={id} />
	</>
);

const PANELS: Panel[] = [
	// ------------------------------------------------ act 1: 1 a.m.
	{
		id: 'A1',
		t: '0:00',
		art: () => (
			<>
				<Bedroom f={40} />
				<Her />
				<Tag en="1:07 AM" zh="凌晨一点" />
				<Arrow d="M380,300 C520,330 700,380 820,430" label="黑场里只有手机亮，缓推" lx={140} ly={250} />
			</>
		),
	},
	{
		id: 'A2',
		t: '0:04',
		art: () => (
			<>
				<rect width={W} height={H} fill="#05050b" />
				<Pool x={960} y={520} r={800} c={HUE.phone} id="a2" />
				<Phone x={960} y={480} s={1.15}>
					<ChatHead />
					<Bubble y={130} mine text="今天那家店我路过了，想起你说想去" />
					<Bubble y={230} mine text="下周末有空吗？" />
					<Bubble y={290} mine text="没空也没关系哈哈" />
					<Bubble y={370} text="嗯" w={60} />
				</Phone>
				<Dust seed="a2" n={40} c="#d8deff" />
				<Arrow d="M1240,250 L1240,520" label="三条气泡逐条弹出，“嗯”最后落下" lx={1270} ly={390} />
				<Sub text="你发了三条长消息，TA只回了一个“嗯”。" />
			</>
		),
	},
	{
		id: 'A3',
		t: '0:10',
		art: () => (
			<>
				<rect width={W} height={H} fill="#05050b" />
				<Pool x={960} y={520} r={800} c={HUE.phone} id="a3" />
				<Phone x={960} y={480} s={1.15}>
					<ChatHead status="对方正在输入…" />
					<Bubble y={130} mine text="今天那家店我路过了，想起你说想去" o={0.4} />
					<Bubble y={230} mine text="下周末有空吗？" o={0.4} />
					<Bubble y={290} mine text="没空也没关系哈哈" o={0.4} />
					<Bubble y={370} text="嗯" w={60} o={0.6} />
					<Typing x={86} y={480} s={0.62} t={10} />
				</Phone>
				<Arrow d="M700,700 C800,640 860,600 920,580" label="推到三个点：跳、停、消失" lx={330} ly={760} />
				<Beat x={1240} y={640} label="点消失=音乐的停顿" />
				<Sub text="为什么越难追到的人，你越放不下？" hl="越放不下" />
			</>
		),
	},
	{
		id: 'A4',
		t: '0:16',
		art: () => (
			<>
				<rect width={W} height={H} fill="#05050b" />
				<Pool x={960} y={500} r={760} c={HUE.gold} o={0.5} id="a4" />
				<text x={960} y={330} textAnchor="middle" style={{fontFamily: font.latin, fontSize: 26, letterSpacing: '0.42em', fill: '#e0b46e'}}>
					EFFORT JUSTIFICATION · ARONSON & MILLS · MCMLIX
				</text>
				<GoldTitle text="越难越爱" f={200} at={0} size={150} y={530} />
				<Typing x={960} y={650} s={0.9} t={4} gold />
				<text x={960} y={770} textAnchor="middle" style={{fontFamily: font.serif, fontWeight: 600, fontSize: 38, fill: '#f6e7c8'}}>
					为什么越难追到的人，越放不下？
				</text>
				<text x={960} y={820} textAnchor="middle" style={{fontFamily: font.latinItalic, fontSize: 30, fill: '#cdbb98'}}>
					Why do we love what costs us the most?
				</text>
				<text x={960} y={900} textAnchor="middle" style={{fontFamily: font.sans, fontSize: 20, letterSpacing: '0.3em', fill: '#bfa77a'}}>
					— Juno 出品 · VIBE知识大赏 —
				</text>
				<Beat x={1380} y={980} label="16.1秒重拍：三个点变金，片名压出" />
			</>
		),
	},
	// ------------------------------------------------ act 2: 1959
	{
		id: 'B1',
		t: '0:20',
		art: () => (
			<>
				<Corridor f={20} open={0.35} />
				<Tag en="1959 · Stanford University" zh="1959 · 斯坦福大学" />
				<Arrow d="M600,760 C850,680 1100,620 1300,570" label="三个点缩成走廊尽头的门缝光（匹配剪辑）" lx={240} ly={860} />
				<Sub text="1959年，斯坦福的心理学家阿伦森招募女大学生，" />
			</>
		),
	},
	{
		id: 'B2',
		t: '0:25',
		art: () => (
			<>
				<Lamp1959 id="b2" />
				<g transform="translate(960,470) rotate(-3)">
					<rect x={-330} y={-230} width={660} height={430} fill="#e9dcc0" />
					<text x={0} y={-150} textAnchor="middle" style={{fontFamily: font.serif, fontWeight: 900, fontSize: 52, fill: '#2a2018'}}>
						招募 · 讨论小组
					</text>
					<text x={0} y={-90} textAnchor="middle" style={{fontFamily: font.latin, fontSize: 30, letterSpacing: '0.2em', fill: '#4a3a2a'}}>
						THE PSYCHOLOGY OF SEX
					</text>
					{Array.from({length: 7}, (_, i) => (
						<g key={i}>
							<line x1={-260} y1={-30 + i * 30} x2={260} y2={-30 + i * 30} stroke="#8a7a62" strokeWidth={1} />
							<rect x={-250} y={-48 + i * 30} width={90 + ((i * 53) % 120)} height={10} rx={5} fill="#3a2e22" opacity={0.6} filter="url(#b2)" />
						</g>
					))}
				</g>
				<Pool x={960} y={470} r={600} c={HUE.lamp} o={0.5} id="b2b" />
				<Arrow d="M1400,300 L1250,420" label="铅笔落下签名，台灯光扫过" lx={1380} ly={270} />
				<Sub text="加入一个讨论“性心理”的小组。" />
			</>
		),
	},
	{
		id: 'B3',
		t: '0:28',
		art: () => (
			<>
				<Corridor f={40} open={0.06} />
				<g transform="translate(1340,250)">
					<rect x={10} y={150} width={120} height={50} fill="#e9dcc0" transform="skewY(-22)" opacity={0.85} />
					<text x={70} y={210} textAnchor="middle" transform="skewY(-22)" style={{fontFamily: font.serif, fontWeight: 900, fontSize: 24, fill: '#7a1f1f'}}>
						难堪测试
					</text>
				</g>
				<Arrow d="M1500,900 L1450,820" label="门几乎关上，只剩一条缝" lx={1180} ly={980} />
				<Sub text="但入组之前，要先过一场“难堪测试”。" />
			</>
		),
	},
	{
		id: 'C1',
		t: '0:32',
		art: () => (
			<>
				<Lamp1959 id="c1" />
				<Table x0={860} x1={1560} y={700} />
				<DeskLamp x={1220} y={700} s={1.1} />
				<Student x={700} seat={760} reach={[150, -236]} head={18} />
				<Card x={905} y={560} rot={-14} s={0.55} />
				<Person look={{...STUDENT59, hair: 'short', outfit: 'suit'}} x={1660} y={980} s={1.3} pose={{lean: 2, head: -4, armNear: [30, 50], armFar: [24, 56], legNear: [86, 88], legFar: [82, 90], lift: -66}} flip rim="warm" sil="#0e0a08" />
				<rect x={0} y={760} width={W} height={320} fill="#0a0806" opacity={0.6} />
				<Pool x={900} y={560} r={260} c="#e5484d" o={0.35} id="c1r" />
				<Arrow d="M860,380 L860,480" label="她低头念卡片，脸上泛起红光" lx={560} ly={350} />
				<Sub text="一组：当着男实验员，大声念出露骨的词句。" />
			</>
		),
	},
	{
		id: 'C2',
		t: '0:36',
		art: () => (
			<>
				<rect width={W} height={H} fill="#07060a" />
				{[
					{x: 400, o: 1, l: '难堪', red: true},
					{x: 960, o: 0.45, l: '温和'},
					{x: 1520, o: 0.08, l: '免考'},
				].map((b, i) => (
					<g key={i}>
						<Pool x={b.x} y={380} r={360} c={b.red ? '#ff8a6a' : HUE.lamp} o={b.o} id={`c2${i}`} />
						<line x1={b.x} y1={0} x2={b.x} y2={250} stroke="#2a2018" strokeWidth={2} />
						<Glow x={b.x} y={262} r={50 * b.o + 6} o={b.o} />
						<Card x={b.x} y={560} s={0.8} o={0.3 + 0.7 * b.o} />
						<text x={b.x} y={760} textAnchor="middle" style={{fontFamily: font.serif, fontWeight: 700, fontSize: 40, fill: b.red ? '#ff9a80' : HUE.cream}} opacity={0.4 + 0.6 * b.o}>
							{b.l}
						</text>
						<text x={b.x} y={810} textAnchor="middle" style={{fontFamily: font.latin, fontSize: 26, letterSpacing: '0.3em', fill: '#bfa77a'}}>
							21人
						</text>
					</g>
				))}
				<Arrow d="M300,140 L1620,140" label="横移：三张桌，三盏灯，亮度=难度" lx={640} ly={110} />
				<Sub text="一组念温和的词，一组免考。" />
			</>
		),
	},
	{
		id: 'C3',
		t: '0:39',
		art: () => (
			<>
				<Lamp1959 id="c3" />
				<Table x0={860} x1={1560} y={700} />
				<DeskLamp x={1300} y={700} s={1.1} />
				<Student x={700} seat={760} head={4} />
				<Headphones x={713} y={360} s={0.62} />
				<g transform="translate(980,620)">
					<rect x={-40} y={0} width={80} height={80} rx={6} fill="#2a2018" stroke="#6a5038" strokeWidth={2} />
					<circle cx={0} cy={36} r={22} fill="none" stroke="#c9a070" strokeWidth={2} />
				</g>
				<Wave x0={760} x1={1200} y={300} t={40} amp={0.5} />
				<Arrow d="M600,250 L700,320" label="戴上耳机：声波从对讲机里流出" lx={330} ly={220} />
				<Sub text="然后戴上耳机，“旁听”小组讨论。" />
			</>
		),
	},
	{
		id: 'C4',
		t: '0:42',
		art: () => (
			<>
				<rect width={W} height={H} fill="#07060a" />
				<Pool x={960} y={460} r={700} c={HUE.lamp} o={0.6} id="c4" />
				{[700, 1220].map((x, i) => (
					<g key={i} transform={`translate(${x},420)`}>
						<circle r={150} fill="none" stroke="#c9a070" strokeWidth={2} />
						<circle r={40} fill="#2a2018" stroke="#c9a070" strokeWidth={2} />
						{[0, 120, 240].map((a) => (
							<line key={a} x1={0} y1={0} x2={140 * Math.cos(((a + i * 30) * Math.PI) / 180)} y2={140 * Math.sin(((a + i * 30) * Math.PI) / 180)} stroke="#6a5038" strokeWidth={8} />
						))}
					</g>
				))}
				<line x1={700} y1={570} x2={1220} y2={570} stroke="#8a6a48" strokeWidth={3} />
				<Wave x0={560} x1={1360} y={700} t={10} amp={0.08} c="#9a8a72" />
				<text x={960} y={800} textAnchor="middle" style={{fontFamily: font.latin, fontStyle: 'italic', fontSize: 30, fill: '#bfa77a'}} opacity={0.8}>
					“one of the most worthless and uninteresting discussions imaginable”
				</text>
				<Arrow d="M960,180 L960,300" label="其实是录音：磁带转，声波几乎是平的" lx={560} ly={160} />
				<Sub text="那其实是一段录音，故意录得无聊透顶。" />
			</>
		),
	},
	{
		id: 'C5',
		t: '0:46',
		art: () => (
			<>
				<rect width={W} height={H} fill="#07060a" />
				<Pool x={960} y={500} r={700} c={HUE.lamp} o={0.3} id="c5" />
				<Bar x={600} base={BASE} h={300} label="免考" dashed />
				<Bar x={960} base={BASE} h={250} label="温和" dashed />
				<Bar x={1320} base={BASE} h={120} label="难堪" dashed red />
				<text x={960} y={250} textAnchor="middle" style={{fontFamily: font.sans, fontSize: 24, letterSpacing: '0.4em', fill: '#bfa77a'}}>
					我们的猜测（示意）
				</text>
				<Sub text="按常理，吃过苦的人会更讨厌它。" hl="讨厌" />
			</>
		),
	},
	// ------------------------------------------------ the twist (break)
	{
		id: 'D1',
		t: '0:49',
		art: () => (
			<>
				<rect width={W} height={H} fill="#040306" />
				<Bar x={600} base={BASE} h={300} label="免考" dashed o={0.15} />
				<Bar x={960} base={BASE} h={250} label="温和" dashed o={0.15} />
				<Bar x={1320} base={BASE} h={120} label="难堪" dashed red o={0.15} />
				<Thin text="不。" y={560} size={170} />
				<Beat x={1300} y={300} label="音乐停：猜测的虚线柱散掉" />
				<Sub text="不。" />
			</>
		),
	},
	{
		id: 'D2',
		t: '0:56',
		art: () => (
			<>
				<rect width={W} height={H} fill="#07060a" />
				<Pool x={1320} y={420} r={600} c={HUE.gold} o={0.5} id="d2" />
				<line x1={460} y1={BASE} x2={1480} y2={BASE} stroke="#5a4a38" strokeWidth={1.5} />
				<text x={440} y={BASE + 6} textAnchor="end" style={{fontFamily: font.latin, fontSize: 22, fill: '#8a7a62'}}>
					60
				</text>
				<Bar x={600} base={BASE} h={SC(80.2)} label="免考" v="80.2" />
				<Bar x={960} base={BASE} h={SC(81.8)} label="温和" v="81.8" />
				<Bar x={1320} base={BASE} h={SC(97.6)} label="难堪" v="97.6" gold />
				<text x={960} y={200} textAnchor="middle" style={{fontFamily: font.sans, fontSize: 22, letterSpacing: '0.4em', fill: '#bfa77a'}}>
					对同一段无聊讨论的评分 · 评分总和
				</text>
				<Arrow d="M1500,560 L1400,420" label="金色柱冲顶，数字停住不动" lx={1460} ly={620} />
				<Sub text="难堪组打出了97.6分。" hl="97.6" />
			</>
		),
	},
	// ------------------------------------------------ mechanism (build)
	{
		id: 'E1',
		t: '1:05',
		art: () => (
			<>
				<rect width={W} height={H} fill="#07050f" />
				<Pool x={960} y={420} r={900} c={HUE.violet} o={0.6} id="e1" />
				<Bulb x={640} y={460} on={1} label="我为它付出了这么多" s={1.5} />
				<Bulb x={1280} y={460} on={0.9} label="它根本不值得" c={HUE.violet} s={1.5} />
				<Dust seed="e1" n={50} c="#e6dcff" />
				<Arrow d="M860,300 C920,260 1000,260 1060,300" label="两盏灯同时亮：频闪、互相干扰" lx={720} ly={220} />
				<Sub text="“我为它付出了这么多”，和“它根本不值得”。" />
			</>
		),
	},
	{
		id: 'E2',
		t: '1:15',
		art: () => (
			<>
				<rect width={W} height={H} fill="#07050f" />
				<Pool x={640} y={420} r={700} c={HUE.lamp} o={0.6} id="e2" />
				<Bulb x={640} y={460} on={1} label="我为它付出了这么多" s={1.5} />
				<Bulb x={1280} y={460} on={0.5} label="它根本不值得" c={HUE.violet} s={1.5} />
				<path d="M720,150 L720,260" stroke="#c9a070" strokeWidth={3} />
				<path d="M708,272 L732,252 M708,252 L732,272" stroke="#e5484d" strokeWidth={4} />
				<Arrow d="M820,200 L740,250" label="左灯的拉线被剪断：关不掉了" lx={830} ly={180} />
				<Sub text="付出已经收不回了。" />
			</>
		),
	},
	{
		id: 'E3',
		t: '1:18',
		art: () => (
			<>
				<rect width={W} height={H} fill="#07050f" />
				<Pool x={960} y={420} r={900} c={HUE.violet} o={0.5} id="e3" />
				<Bulb x={640} y={460} on={1} label="我为它付出了这么多" s={1.5} />
				<Bulb x={1280} y={460} on={0.35} label="它根本不值得" c={HUE.violet} s={1.5} />
				<path d="M1360,140 L1360,330" stroke="#c9a070" strokeWidth={3} />
				<circle cx={1360} cy={338} r={9} fill="#c9a070" />
				<Arrow d="M1560,520 C1500,440 1420,380 1372,346" label="一只手伸向右灯的拉线（蓄力）" lx={1300} ly={600} />
				<Beat x={180} y={980} label="build 爬升，镜头推近拉线" />
				<Sub text="那就只能，改掉另一个——" />
			</>
		),
	},
	// ------------------------------------------------ reveal (drop)
	{
		id: 'F1',
		t: '1:22',
		art: () => (
			<>
				<rect width={W} height={H} fill="#0a0704" />
				<Pool x={960} y={440} r={900} c={HUE.gold} o={0.9} id="f1" />
				<Bulb x={640} y={460} on={1} s={1.5} />
				<Bulb x={1280} y={460} on={1} c={HUE.gold} s={1.5} />
				<Thin text="它一定很有意思。" y={760} size={64} fill={HUE.gold} />
				<Beat x={1300} y={240} label="DROP：拉线，右灯爆亮成金色" />
				<Sub text="“它一定很有意思。”" />
			</>
		),
	},
	{
		id: 'F2',
		t: '1:26',
		art: () => (
			<>
				<rect width={W} height={H} fill="#060509" />
				{/* a plain closed door; it only looks golden where her lamp shines */}
				<rect x={1080} y={180} width={360} height={700} fill="#17131a" stroke="#2a2430" strokeWidth={3} />
				<circle cx={1400} cy={540} r={10} fill="#3a3040" />
				<Pool x={1200} y={500} r={420} c={HUE.gold} o={0.9} id="f2" />
				<Person look={SHE} x={700} y={900} s={1.35} pose={{...POSES.hold, head: -8}} rim="warm" sil="#0c0a10" reach={{near: [120, -230]}} />
				<g transform="translate(870,585)">
					<path d="M-16,0 L16,0 L22,44 L-22,44 Z" fill="#3a2c20" stroke="#c9a070" strokeWidth={1.5} />
					<Glow x={0} y={24} r={60} />
					<path d="M0,24 L420,-120 L420,330 Z" fill={HUE.gold} opacity={0.07} filter="url(#b8)" />
				</g>
				<Arrow d="M1500,300 C1400,250 1100,260 900,420" label="后拉：门的金光，来自她手里的灯" lx={1060} ly={130} />
				<Sub text="你爱的，有一部分是你自己的付出。" hl="你自己的付出" />
			</>
		),
	},
	{
		id: 'F3',
		t: '1:32',
		art: () => (
			<>
				<rect width={W} height={H} fill="#060509" />
				<Pool x={960} y={500} r={700} c={HUE.gold} o={0.5} id="f3" />
				<Thin text="努力合理化" y={520} size={130} fill="url(#gold-text)" w={900} ls="0.12em" />
				<text x={960} y={610} textAnchor="middle" style={{fontFamily: font.latin, fontSize: 34, letterSpacing: '0.5em', fill: '#e0b46e'}}>
					EFFORT JUSTIFICATION
				</text>
				<Sub text="这叫努力合理化。" hl="努力合理化" />
			</>
		),
	},
	{
		id: 'F4',
		t: '1:35',
		art: () => (
			<>
				<Lamp1959 id="f4" />
				<g transform="translate(760,520)">
					<circle r={170} fill="#1a1410" stroke="#c9a070" strokeWidth={2} />
					{Array.from({length: 11}, (_, i) => {
						const a = (-210 + i * 24) * (Math.PI / 180);
						return <line key={i} x1={150 * Math.cos(a)} y1={150 * Math.sin(a)} x2={130 * Math.cos(a)} y2={130 * Math.sin(a)} stroke="#c9a070" strokeWidth={2} />;
					})}
					<line x1={0} y1={0} x2={120 * Math.cos(-0.5)} y2={120 * Math.sin(-0.5)} stroke="#e5484d" strokeWidth={4} />
					<circle r={14} fill="#c9a070" />
					<text x={0} y={90} textAnchor="middle" style={{fontFamily: font.latin, fontSize: 26, letterSpacing: '0.3em', fill: '#c9a070'}}>
						VOLTS
					</text>
				</g>
				<path d="M960,520 L1010,470 L1040,540 L1090,480 L1120,550" fill="none" stroke="#bfe0ff" strokeWidth={3} filter="url(#g-sm)" />
				<Bar x={1300} base={760} h={140} label="弱电击" />
				<Bar x={1520} base={760} h={260} label="强电击" gold />
				<Tag en="1966 · Gerard & Mathewson" zh="1966 · 重复实验" />
				<Arrow d="M600,300 C650,260 760,280 800,330" label="旋钮拧到底，电火花打在重拍上" lx={260} ly={260} />
				<Sub text="1966年换成电击重做：电得越重，越喜欢。" />
			</>
		),
	},
	// ------------------------------------------------ second layer
	{
		id: 'G1',
		t: '1:43',
		art: () => (
			<>
				<rect width={W} height={H} fill="#07060a" />
				<Pool x={960} y={520} r={700} c={HUE.gold} o={0.5} id="g1" />
				<FlatPack x={760} y={560} s={1.5} k={1} c="#cfc6b6" />
				<FlatPack x={1220} y={560} s={1.5} k={1} />
				<text x={760} y={800} textAnchor="middle" style={{fontFamily: font.sans, fontSize: 26, letterSpacing: '0.2em', fill: '#cfc6b6'}}>
					别人拼好的 · $0.48
				</text>
				<text x={1220} y={800} textAnchor="middle" style={{fontFamily: font.sans, fontSize: 26, letterSpacing: '0.2em', fill: HUE.gold}}>
					自己拼的 · $0.78
				</text>
				<Thin text="+63%" y={300} size={110} fill={HUE.gold} />
				<Tag en="The IKEA effect · Norton 2012" zh="宜家效应" />
				<Arrow d="M1220,380 L1220,470" label="平板件一块块立起，拼成盒子" lx={1250} ly={420} />
				<Sub text="人们愿意多付约63%的钱。" hl="63%" />
			</>
		),
	},
	{
		id: 'G2',
		t: '1:53',
		art: () => (
			<>
				<rect width={W} height={H} fill="#05050b" />
				<Pool x={1380} y={480} r={600} c={HUE.phone} o={0.8} id="g2" />
				{[
					{x: 540, l: '很喜欢你', o: 0.35},
					{x: 960, l: '一般般', o: 0.25},
					{x: 1380, l: '不确定', o: 1},
				].map((c, i) => (
					<g key={i} opacity={0.4 + 0.6 * c.o}>
						<rect x={c.x - 150} y={300} width={300} height={360} rx={18} fill="#14152a" stroke="#4a4f80" strokeWidth={1.5} />
						<circle cx={c.x} cy={410} r={60} fill="#22243e" />
						<path d={`M${c.x - 90},${560} C${c.x - 60},${490} ${c.x + 60},${490} ${c.x + 90},${560}`} fill="#22243e" />
						<text x={c.x} y={720} textAnchor="middle" style={{fontFamily: font.serif, fontWeight: 600, fontSize: 32, fill: HUE.cream}}>
							{c.l}
						</text>
					</g>
				))}
				<Typing x={1380} y={250} s={0.7} t={12} />
				<Tag en="Whitchurch, Wilson & Gilbert · 2011" zh="47 名大学生 · 小型研究" />
				<Arrow d="M1650,620 C1600,560 1560,520 1520,480" label="“不确定”那张卡一直在亮，三个点在它头上跳" lx={980} ly={860} />
				<Sub text="反而想得最多，也被吸引得最多。" />
			</>
		),
	},
	// ------------------------------------------------ takeaways
	{
		id: 'H1',
		t: '2:05',
		art: () => (
			<>
				<Bedroom f={60} phone={0.6} />
				<Her phoneUp={false} />
				<g transform="translate(860,820) rotate(4)">
					<rect x={-40} y={-10} width={80} height={20} rx={5} fill="#0b0b12" stroke="#4a4a5c" />
				</g>
				<text x={1180} y={130} style={{fontFamily: font.serif, fontWeight: 600, fontSize: 34, fill: HUE.cream}}>
					① 如果今天第一次遇见TA，还会选吗？
				</text>
				<text x={1180} y={190} style={{fontFamily: font.serif, fontWeight: 600, fontSize: 34, fill: HUE.cream}} opacity={0.5}>
					② 放不下的是TA，还是你付出的那些？
				</text>
				<text x={1180} y={250} style={{fontFamily: font.serif, fontWeight: 600, fontSize: 34, fill: HUE.gold}} opacity={0.3}>
					③ 付出不是错，把它留给值得的人。
				</text>
				<Arrow d="M760,460 L860,800" label="手机被扣在床上，屏幕光熄" lx={300} ly={420} />
				<Sub text="① 如果今天第一次遇见TA，还会选吗？" />
			</>
		),
	},
	// ------------------------------------------------ callback (coda)
	{
		id: 'I1',
		t: '2:30',
		art: () => (
			<>
				<Bedroom f={80} phone={0.25} dawn={0.85} />
				<Her phoneUp={false} dawn />
				<g transform="translate(860,820) rotate(4)">
					<rect x={-40} y={-10} width={80} height={20} rx={5} fill="#0b0b12" stroke="#4a4a5c" />
					<circle r={50} fill={HUE.phone} opacity={0.25} filter="url(#b8)" />
				</g>
				<Typing x={880} y={740} s={0.5} t={8} />
				<Arrow d="M1500,250 C1300,300 1100,450 900,700" label="窗外天亮接过灯光，床上的手机又亮了一下" lx={900} ly={140} />
				<Sub text="天快亮了，对话框里的三个点又跳了起来。" />
			</>
		),
	},
	{
		id: 'I2',
		t: '2:38',
		art: () => (
			<>
				<Bedroom f={90} phone={0} dawn={1} />
				<Person look={SHE} x={1440} y={1000} s={1.4} back rim="warm" sil="#160d14" />
				<Arrow d="M600,700 C900,640 1200,560 1380,520" label="她走到窗前，背影，晨光" lx={300} ly={800} />
				<Sub text="是那个一直在等的自己。" hl="自己" />
			</>
		),
	},
	{
		id: 'I3',
		t: '2:39',
		art: () => (
			<>
				<rect width={W} height={H} fill="#05050b" />
				<g transform="translate(960,300)">
					<Monogram draw={1} size={1} />
				</g>
				<GoldTitle text="越难越爱" f={200} at={0} size={96} y={520} />
				<Typing x={960} y={600} s={0.6} t={4} gold />
				<text x={960} y={720} textAnchor="middle" style={{fontFamily: font.serif, fontWeight: 600, fontSize: 38, fill: '#f6e7c8'}}>
					你有没有明知不值得、却放不下的人？A 有 / B 没有
				</text>
				<rect x={760} y={770} width={400} height={60} rx={30} fill="none" stroke={HUE.gold} strokeWidth={1.5} />
				<text x={960} y={810} textAnchor="middle" style={{fontFamily: font.sans, fontSize: 22, fill: HUE.gold}}>
					关注 Juno · 每期一个反直觉的知识
				</text>
				<text x={960} y={900} textAnchor="middle" style={{fontFamily: font.sans, fontSize: 16, fill: '#8a7a62'}}>
					Aronson & Mills 1959 · Gerard & Mathewson 1966 · Norton et al. 2012 · Whitchurch et al. 2011
				</text>
				<Beat x={1340} y={980} label="片尾卡（品牌固定样式）" />
			</>
		),
	},
];

export const YUENAN_BOARD_N = PANELS.length;

export const YuenanBoard: React.FC = () => {
	loadEpisodeFonts('yuenan');
	const i = useCurrentFrame();
	const p = PANELS[i] ?? PANELS[0];
	return (
		<AbsoluteFill style={{background: '#06060a'}}>
			<svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
				<GlowDefs />
				<Materials />
				<defs>
					<filter id="b8" x="-50%" y="-50%" width="200%" height="200%">
						<feGaussianBlur stdDeviation="8" />
					</filter>
					<filter id="b2" x="-10%" y="-50%" width="120%" height="200%">
						<feGaussianBlur stdDeviation="2" />
					</filter>
					<radialGradient id="vig3" cx="50%" cy="48%" r="72%">
						<stop offset="0.5" stopColor="#000" stopOpacity="0" />
						<stop offset="1" stopColor="#000" stopOpacity="0.85" />
					</radialGradient>
					<linearGradient id="dawnSky" x1="0" y1="0" x2="0" y2="1">
						<stop offset="0" stopColor="#3a2a4a" />
						<stop offset="0.6" stopColor="#c46a5a" />
						<stop offset="1" stopColor="#ffb07a" />
					</linearGradient>
					<marker id="ah" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
						<path d="M0,0 L10,5 L0,10 z" fill="#fff" />
					</marker>
				</defs>
				{p.art()}
				<text x={1770} y={64} textAnchor="end" style={{fontFamily: font.sans, fontSize: 18, fill: '#efe4d0', letterSpacing: '0.1em'}} opacity={0.45}>
					◆ Juno · VIBE知识大赏
				</text>
				<text x={60} y={64} style={{fontFamily: font.sans, fontWeight: 700, fontSize: 22, fill: '#fff'}} opacity={0.7}>
					{p.id} · {p.t}
				</text>
				<Grade />
			</svg>
		</AbsoluteFill>
	);
};
