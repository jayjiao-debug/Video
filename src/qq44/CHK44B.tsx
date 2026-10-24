import React from 'react';
import {AbsoluteFill, Composition, registerRoot, useCurrentFrame} from 'remotion';
import {W, H, Grain44} from './kit44';
import {seg, sm} from './demo44';
import {Story, Punch, Counter, SubRow} from './skin44';
import {RoughB, B_COUNTER} from './rough44b';
import {RoughA} from './rough44a';
/* throwaway check for builder B (film 95.5–160.5); subtitles approximate the master's (stack pairs, typed 0.35 s) */
const L: [number, number, string][] = [[95.0, 98.25, "一位科学家，拿到了你[4小块]。"], [98.25, 101.75, "[找到了]！你的胶质细胞比别人多！"], [101.75, 105.0, "可4块里，[只有1块]不一样。"], [105.0, 108.0, "1997年，[84岁]的哈维带着你，"], [108.0, 111.0, "坐车[横穿美国]，6000多公里，"], [111.0, 114.25, "想把你还给爱因斯坦的[孙女]。"], [114.25, 116.5, "她[没有收]。"], [116.5, 119.75, "你管空间想象的那块，[宽了15%]！"], [119.75, 123.0, "同年就有专家说：[得不出结论]。"], [123.0, 125.25, "2012年：你[多了一道褶]！"], [125.25, 127.75, "作者自己说：[只是假设]。"], [127.75, 131.0, "至少[18个研究者]，拿到过你。"], [131.0, 134.75, "天才在哪？[没有找到]可信的证据。"], [134.75, 138.25, "他没有坟墓，你的切片在[博物馆]。"], [138.25, 141.5, "几十年来，研究你的人都相信："], [141.5, 144.5, "你身上，一定[深藏着什么]。"], [145.0, 148.5, "可他自己说：我没有[特别的天赋]，"], [148.5, 151.75, "我只是有强烈的[好奇心]。"], [152.25, 162.0, "如果是你，愿意把大脑[留给科学]吗？"]];
const LINES = L.map(([a, b, s]) => [a + 0.5, b + 0.5, s] as [number, number, string]);
const STACK: Record<number, number> = {1: 0, 4: 3, 6: 5, 8: 7, 10: 9, 12: 11, 15: 14, 17: 16};
const CUT = new Set([6, 9, 10, 18]);
const C: React.FC = () => {
	const f = useCurrentFrame() + Math.round(94.5 * 30), t = f / 30;
	const i = LINES.findIndex(([a, b]) => t >= a && t < b + (STACK[LINES.findIndex(([a2]) => a2 > a)] !== undefined ? 0.5 : 0));
	let rows: SubRow[] = [], punch: string | null = null;
	if (i >= 0) { const [a, , s] = LINES[i], len = s.replace(/[[\]]/g, '').length, n = CUT.has(i) ? len : Math.ceil(len * seg(t, a, a + 0.35));
		if (i === 18) punch = s; else { if (STACK[i] !== undefined) rows.push({s: LINES[STACK[i]][2]}); rows.push({s, n}); } }
	let v = 99; for (const [a, val, r] of B_COUNTER) if (t >= a) v = t < a + r ? v + (val - v) * sm(seg(t, a, a + r)) : val;
	return <AbsoluteFill style={{background: '#0c1012'}}>
		<svg width={W} height={H} style={{position: 'absolute'}}>{t < 95.62 && <RoughA t={Math.min(t, 95.62)} />}{t >= 95.38 && <g opacity={sm(seg(t, 95.38, 95.62))}><RoughB t={Math.max(95.5, t)} /></g>}<Grain44 seed={3 + (f % 6)} /></svg>{/* end: fade to black story 161.5–162.5 (= film 163.5–164.5) */}
		<Story rows={rows} />
		{punch && <Punch s={punch} o={sm(seg(t, 152.75, 152.9))} />}
		{t >= 152.75 ? null : t < 95.5 ? null : <Counter v={v} o={t > 138.75 ? 0.55 : 1} />}
		<AbsoluteFill style={{background: '#06080a', opacity: sm(seg(t, 161.5, 162.45))}} />
	</AbsoluteFill>;
};
registerRoot(() => <Composition id="CHK44B" component={C} durationInFrames={Math.round(68 * 30)} fps={30} width={W} height={H} />);
