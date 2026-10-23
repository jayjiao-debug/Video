import React from 'react';
import {AbsoluteFill, Composition, registerRoot, useCurrentFrame} from 'remotion';
import {W, H, FPS, T, SERIF, SANS, LATS, GOLD, BEAT, rnd, cl, sm, fio, SHANG, DU, MORSE, SCOTT, BELL, MARCONI, ARPA, CRASH, BJ, FIN} from './ep41scenes';

/* ep41 v2 — the cut. Scene order, dissolves, the cold open, the 3-second rewind, the title card,
   labels and the subtitles that follow every voice line (film times). */
type Line = [number, number, string, string?];        // start, end, Chinese, native line (shown above when not Chinese)
export const SUBS: Line[] = [
	[19.45, 22.45, '三千年前，商朝的占卜师，'], [22.45, 26.3, '把一个问题刻在龟甲上，放进火里烤。'],
	[26.25, 28.3, '「雨，会从东边来吗？」', '其自东来雨？'], [28.5, 31.5, '裂开的纹路，就是天的回答。'], [31.5, 35.0, '那一天，真的下雨了。'],
	[35.5, 39.2, '公元757年，长安城被叛军占领。'], [39.2, 43.1, '杜甫困在城里，和家人断了音信。'],
	[43.4, 47.7, '「打了三个月的仗，一封家书抵得上万两黄金。」', '烽火连三月，家书抵万金。'], [48.0, 51.0, '那时候，一封信可能要走好几个月，'], [51.0, 54.4, '也可能，永远到不了。'],
	[55.4, 61.2, '1825年，画家莫尔斯正在外地作画，一封信寄到：他的妻子去世了。', 'In 1825, the painter Samuel Morse was far from home when a letter came: his wife had died.'],
	[61.2, 66.2, '等他赶回家，她已经下葬。', 'By the time he got back, she had already been buried.'],
	[66.4, 71.5, '十九年后，他的第一封电报，一瞬间跨过了六十多公里：', 'Nineteen years later, his first telegraph message crossed forty miles in an instant:'],
	[71.6, 74.1, '「上帝创造了何等奇迹。」', 'What hath God wrought.'],
	[74.3, 78.6, '1860年，巴黎。斯科特录下了一个人的歌声……', 'Paris, 1860. Édouard-Léon Scott enregistre une voix qui chante…'],
	[78.6, 82.5, '可当时，没有任何机器能把它放出来。', '…mais aucune machine ne peut encore la faire entendre.'],
	[82.8, 85.7, '「月光下，我的朋友皮埃罗……」', 'Au clair de la lune, mon ami Pierrot…'],
	[86.0, 90.6, '这首歌，等了148年，才第一次被人听见。', 'Il faudra attendre cent quarante-huit ans… pour l’entendre.'],
	[91.6, 99.0, '1876年3月10日，波士顿。贝尔俯身对着他的新发射器，开口说话。', 'Boston, March 10th, 1876. Alexander Graham Bell leans over his new transmitter, and speaks.'],
	[99.4, 102.3, '「华生先生，过来，我想见你。」', 'Mr. Watson — come here — I want to see you.'],
	[102.8, 105.4, '隔壁房间的华生，听清了每一个字。', 'In the next room, Watson heard every word.'],
	[105.6, 110.0, '这是人类第一通电话里的第一句话。'],
	[111.0, 116.4, '1901年12月，纽芬兰的一座山上，马可尼在暴风里放起风筝。', 'Dicembre 1901. Su una collina di Terranova, Marconi alza un aquilone nella tempesta.'],
	[116.4, 120.2, '风，卷走了其中一只。', 'Il vento ne porta via uno.'],
	[120.3, 122.3, '「你听到什么了吗，肯普先生？」', 'Can you hear anything, Mr. Kemp?'],
	[122.4, 128.5, '三个点，字母 S。它越过了大西洋。', 'Tre punti. La lettera S. Aveva attraversato l’oceano.'],
	[128.7, 134.4, '1969年10月29日，加州大学洛杉矶分校的一名学生，', 'October 29th, 1969. A student at UCLA…'],
	[134.4, 139.8, '想给560公里外的一台电脑，发一个词：login。', '…tries to send one word to a computer 350 miles away: “log in.”'],
	[139.95, 140.85, '「收到 L 了吗？」', 'Did you get the L?'], [140.9, 141.9, '「收到。」', 'Yes.'], [141.95, 142.85, '「收到 O 了吗？」', 'Did you get the O?'], [142.95, 143.85, '「收到。」', 'Yes.'],
	[144.25, 145.65, '然后，系统崩溃了。'],
	[146.0, 149.6, '1987年，北京。中国的第一封电子邮件，'], [149.6, 153.7, '写好后又等了六天，才发出去。'],
	[154.1, 161.7, '「越过长城，走向世界。」', 'Across the Great Wall, we can reach every corner in the world.'],
	[161.9, 168.3, '1977年，安·德鲁扬打电话告诉卡尔·萨根：她为金唱片找到了一首中国古曲。', 'In 1977, Ann Druyan called Carl Sagan to say she had found a Chinese song for the Golden Record.'],
	[168.3, 172.9, '挂电话时，他们已经决定结婚。', 'By the end of that call, they were engaged.'],
	[174.0, 179.0, '各位都好吧？我们都很想念你们。有空，请到这儿来玩。'],
];
const LABELS: [number, number, string, string][] = [
	[T.s1 + 0.5, T.s2, '约公元前 1200 年', '商 · 殷墟'], [T.s2 + 0.5, T.s3, '757 年', '杜甫 · 长安'], [T.s3 + 0.5, T.s4, '1825 / 1844 年', '莫尔斯 · 华盛顿'],
	[T.s4 + 0.5, T.s5, '1860 年', '斯科特 · 巴黎'], [T.s5 + 0.5, T.s6, '1876 年', '贝尔 · 波士顿'], [T.s6 + 0.5, T.s7, '1901 年', '马可尼 · 纽芬兰'],
	[T.s7 + 0.5, T.crash - 0.05, '1969 年', '阿帕网 · 加州大学洛杉矶分校'], [T.s8 + 0.5, T.fin, '1987 年', '中国第一封电子邮件 · 北京'], [T.fin + 0.5, T.outro + 6, '1977 年', '旅行者号 · 金唱片'],
];
const SCENES: [number, React.FC<{tau: number; t: number}>][] = [[T.s1, SHANG], [T.s2, DU], [T.s3, MORSE], [T.s4, SCOTT], [T.s5, BELL], [T.s6, MARCONI], [T.s7, ARPA], [T.s8, BJ], [T.fin, FIN]];
const ORDER = SCENES.map(([s]) => s);
const XF = 1.1;                                        // dissolve length between scenes

const Scene: React.FC<{i: number; t: number}> = ({i, t}) => { const [s, C] = SCENES[i]; return <C tau={t - s} t={t} />; };

/* the cold open: Bell's room at night, the camera creeps toward the transmitter */
const Cold: React.FC<{t: number}> = ({t}) => <AbsoluteFill>
	<BELL tau={t} t={t} hook />
	<svg width={W} height={H} style={{position: 'absolute'}}>
		<rect width={W} height={H} fill="#000" opacity={1 - cl(t / 1.6)} />
		<text x={960} y={830} textAnchor="middle" style={{fontFamily: SERIF, fontWeight: 900, fontSize: 64}} fill="#fff" opacity={fio(t, 1.0, 9.1, 0.5)} stroke="rgba(0,0,0,0.5)" strokeWidth={6} paintOrder="stroke">人类打出的第一通电话，</text>
		<text x={960} y={925} textAnchor="middle" style={{fontFamily: SERIF, fontWeight: 900, fontSize: 64}} fill={GOLD} opacity={fio(t, 4.6, 9.1, 0.5)} stroke="rgba(0,0,0,0.5)" strokeWidth={6} paintOrder="stroke">第一句话，说的是什么？</text>
	</svg></AbsoluteFill>;

/* the rewind: 3.4 s, eight eras flash backwards (the scenes themselves, played in reverse), years ticking down */
const REW: [number, string][] = [[7, '1987'], [6, '1969'], [5, '1901'], [4, '1876'], [3, '1860'], [2, '1844'], [1, '757'], [0, '公元前 1200']];
const Rewind: React.FC<{t: number}> = ({t}) => { const u = (t - T.hit) / (T.title - T.hit), k = Math.min(7, Math.floor(u * 8)), loc = u * 8 - k;
	const [i, year] = REW[k], st = SCENES[i][0], en = (SCENES[i + 1]?.[0] ?? T.outro);
	const tt = en - 1.0 - (loc + k * 0.0) * 2.5 * (en - st) / 10;             // play that scene backwards, fast
	return <AbsoluteFill style={{background: '#000'}}>
		<AbsoluteFill style={{filter: 'blur(1.5px) contrast(1.1)', transform: `scale(${1.06 - 0.04 * loc})`}}><Scene i={i} t={Math.max(st + 0.5, tt)} /></AbsoluteFill>
		<svg width={W} height={H} style={{position: 'absolute'}}><rect width={W} height={H} fill="#000" opacity={0.25 + 0.5 * Math.max(0, 1 - loc / 0.12)} />
			{Array.from({length: 10}, (_, r) => <rect key={r} x={0} y={rnd(r + k * 13, 30) * H} width={W} height={2 + 5 * rnd(r, 31)} fill="#fff" opacity={0.12} />)}
			<text x={960} y={600} textAnchor="middle" style={{fontFamily: year.length > 4 ? SERIF : '"DejaVu Sans", sans-serif', fontWeight: 900, fontSize: year.length > 4 ? 120 : 170}} fill="#fff" opacity={0.95}>{year}</text></svg></AbsoluteFill>; };

/* the title card over a slow drift of stars and one thread of light */
const Title: React.FC<{t: number}> = ({t}) => { const tau = t - T.title, d = T.s1 - T.title;
	return <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 60%, #1a1630 0%, #05040a 70%)'}}><svg width={W} height={H}>
		{Array.from({length: 180}, (_, i) => <circle key={i} cx={(rnd(i, 50) * W + tau * 6 * (0.3 + rnd(i, 9))) % W} cy={rnd(i, 51) * H} r={0.6 + 1.4 * rnd(i, 52)} fill="#eef" opacity={(0.15 + 0.45 * rnd(i, 53)) * cl(tau / 0.6)} />)}
		<path d={`M0,${640} Q${W / 2},${560} ${W},${640}`} stroke={GOLD} strokeWidth={2} fill="none" strokeDasharray={2400} strokeDashoffset={2400 * (1 - sm(tau / 3.5))} opacity={0.8} />
		<text x={960} y={470} textAnchor="middle" style={{fontFamily: SERIF, fontWeight: 900, fontSize: 92, letterSpacing: '0.06em'}} fill="#fff" opacity={fio(tau, 0.4, d - 0.4, 0.7)}>为了跟你说一句话</text>
		<text x={960} y={590} textAnchor="middle" style={{fontFamily: SERIF, fontWeight: 900, fontSize: 92, letterSpacing: '0.06em'}} fill={GOLD} opacity={fio(tau, 1.6, d - 0.4, 0.7)}>人类努力了三千年</text>
	</svg></AbsoluteFill>; };

export const Ep41Film2: React.FC = () => {
	const t = useCurrentFrame() / FPS;
	let body: React.ReactNode;
	if (t < T.hit) body = <Cold t={t} />;
	else if (t < T.title) body = <Rewind t={t} />;
	else if (t < T.s1) body = <><Title t={t} />{t > T.s1 - XF && <AbsoluteFill style={{opacity: sm((t - (T.s1 - XF)) / XF)}}><Scene i={0} t={t} /></AbsoluteFill>}</>;
	else if (t >= T.crash && t < T.s8) body = <CRASH t={t} />;
	else {
		let i = ORDER.length - 1; while (i > 0 && t < ORDER[i]) i--;
		const next = ORDER[i + 1], into = next !== undefined && next !== T.s8 && t > next - XF;
		const fadeIn = i === 7 ? cl((t - T.s8) / 0.5) : 1;
		const endFade = 1 - cl((t - (T.end - 1.6)) / 1.6);
		body = <AbsoluteFill style={{opacity: fadeIn * endFade}}><Scene i={i} t={t} />{into && <AbsoluteFill style={{opacity: sm((t - (next - XF)) / XF)}}><Scene i={i + 1} t={t} /></AbsoluteFill>}</AbsoluteFill>;
	}
	const s = SUBS.filter(([a, b]) => t >= a - 0.05 && t < b + 0.05).pop();
	const lab = LABELS.find(([a, b]) => t >= a && t < b);
	return <AbsoluteFill style={{background: '#000'}}>
		{body}
		<svg width={W} height={H} style={{position: 'absolute'}}>
			<defs><filter id="gS" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="2.5" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
				<filter id="blurF" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="5" /></filter>
				<linearGradient id="subBand" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.55" /></linearGradient>
				<radialGradient id="lblS" cx="0.2" cy="0.3" r="0.8"><stop offset="0" stopColor="#000" stopOpacity="0.45" /><stop offset="1" stopColor="#000" stopOpacity="0" /></radialGradient></defs>
			{t >= T.s1 && <rect x={0} y={880} width={W} height={200} fill="url(#subBand)" />}
			{lab && <g opacity={fio(t, lab[0], lab[1], 0.5)}><ellipse cx={330} cy={130} rx={420} ry={150} fill="url(#lblS)" />
				<rect x={96} y={96} width={40} height={5} fill="#e0453a" /><text x={148} y={106} style={{fontFamily: SANS, fontWeight: 500, fontSize: 28, letterSpacing: '0.06em'}} fill="#fff" opacity={0.9}>{lab[2]}</text>
				<text x={96} y={160} style={{fontFamily: SERIF, fontWeight: 900, fontSize: 44, letterSpacing: '0.04em'}} fill="#fff">{lab[3]}</text></g>}
			{s && <g opacity={fio(t, s[0] - 0.05, s[1] + 0.05, 0.15)}>
				{s[3] && <text x={W / 2} y={960} textAnchor="middle" style={{fontFamily: /[a-zA-Z]/.test(s[3]) ? LATS : SERIF, fontSize: s[3].length > 60 ? 28 : 34, fontStyle: /[a-zA-Z]/.test(s[3]) ? 'italic' : 'normal'}} fill="#fff" opacity={0.88}>{s[3]}</text>}
				<text x={W / 2} y={s[3] ? 1022 : 1004} textAnchor="middle" style={{fontFamily: SANS, fontSize: s[2].length > 30 ? 40 : 46, fontWeight: 700, letterSpacing: '0.03em'}} fill="#ffe6b0" stroke="rgba(0,0,0,0.6)" strokeWidth={6} paintOrder="stroke">{s[2]}</text></g>}
		</svg>
	</AbsoluteFill>;
};
registerRoot(() => <Composition id="EP41V2" component={Ep41Film2} durationInFrames={Math.round(T.end * FPS)} fps={FPS} width={W} height={H} />);
void BEAT;
