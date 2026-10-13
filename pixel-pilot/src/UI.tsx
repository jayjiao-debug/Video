// Game-style overlay templates, laid out on the same 480x270 grid and shown at 4x.
import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {CHAPTERS, CUES, LINES, NARRATOR_SET, PORTRAIT, Cue, cuesOf, lineAt, lineFrames, windows} from './script';
import {C, FONT12, FONT8, H, W, outline1, popY, px, stepFade} from './pixel';

const Box: React.FC<{x: number; y: number; w: number; h: number; children?: React.ReactNode; style?: React.CSSProperties}> = ({
	x, y, w, h, children, style,
}) => (
	<div
		style={{
			position: 'absolute',
			left: Math.round(x),
			top: Math.round(y),
			width: w,
			height: h,
			background: C.panel,
			border: `1px solid ${C.ink}`,
			boxShadow: `inset 0 0 0 1px ${C.gold2}, inset 0 0 0 2px ${C.panel}, inset 0 0 0 3px ${C.gold}`,
			...style,
		}}
	>
		{children}
	</div>
);

const Text: React.FC<{
	x: number; y: number; size?: 8 | 12 | 24; color?: string; children: React.ReactNode; center?: boolean; w?: number;
}> = ({x, y, size = 12, color = C.cream, children, center, w}) => (
	<div
		style={{
			position: 'absolute',
			left: x,
			top: y,
			width: w,
			textAlign: center ? 'center' : 'left',
			fontFamily: size === 8 ? FONT8 : FONT12,
			fontSize: size,
			lineHeight: `${size}px`,
			color,
			whiteSpace: 'nowrap',
			textShadow: outline1,
		}}
	>
		{children}
	</div>
);

// --------------------------------------------------------------- subtitles
const Subtitle: React.FC<{frame: number}> = ({frame}) => {
	const i = lineAt(frame);
	if (i < 0) return null;
	const {text, key} = LINES[i];
	const k = text.indexOf(key);
	const keyLit = frame >= lineFrames[i].key - 2;
	return (
		<>
			<div style={{position: 'absolute', left: 0, top: 226, width: W, height: 44, background: `linear-gradient(transparent, ${C.ink}cc 40%)`}} />
			<div
				style={{
					position: 'absolute', left: 0, top: 243, width: W, textAlign: 'center',
					fontFamily: FONT12, fontSize: 12, lineHeight: '12px', color: C.white, textShadow: outline1,
				}}
			>
				{text.slice(0, k)}
				<span style={{color: keyLit ? C.gold : C.white}}>{key}</span>
				{text.slice(k + key.length)}
			</div>
		</>
	);
};

// --------------------------------------------------------------- chapter bar
const ChapterBar: React.FC<{frame: number}> = ({frame}) => {
	const i = Math.max(0, lineAt(frame));
	const ch = LINES[i].chapter;
	const segW = Math.floor((W - 16) / CHAPTERS.length);
	return (
		<div style={{position: 'absolute', left: 0, top: 0, width: W, height: 14, background: `${C.ink}d0`}}>
			{CHAPTERS.map((name, k) => (
				<div key={k} style={{position: 'absolute', left: 8 + k * segW, top: 2, width: segW - 4, height: 8}}>
					<div style={{position: 'absolute', left: 0, top: 9, width: segW - 4, height: 1, background: k === ch ? C.gold : C.panel2}} />
					<Text x={0} y={0} size={8} color={k === ch ? C.gold : '#6a5f7a'} center w={segW - 4}>
						{name}
					</Text>
				</div>
			))}
		</div>
	);
};

// --------------------------------------------------------------- stat card
const statValue = (frame: number, win: {in: number; cue: Cue}) => {
	let focus = win.cue.focus as number;
	let distract = win.cue.distract as number;
	let from = {focus, distract};
	let since = Infinity;
	for (const c of CUES) {
		if (c.do !== 'stat_set' || c.frame < win.in || c.frame > frame) continue;
		from = {focus, distract};
		focus = c.focus as number;
		distract = c.distract as number;
		since = frame - c.frame;
	}
	const k = Math.min(1, since / 12);
	return {
		focus: Math.round(from.focus + (focus - from.focus) * k),
		distract: Math.round(from.distract + (distract - from.distract) * k),
		hit: since < 6,
	};
};

const Bar: React.FC<{x: number; y: number; label: string; v: number; color: string}> = ({x, y, label, v, color}) => (
	<>
		<Text x={x} y={y} size={12}>{label}</Text>
		<div style={{position: 'absolute', left: x + 28, top: y + 3, width: 52, height: 7, background: C.ink}} />
		{Array.from({length: 10}, (_, k) => (
			<div key={k} style={{position: 'absolute', left: x + 29 + k * 5, top: y + 4, width: 4, height: 5, background: k < v ? color : C.panel2}} />
		))}
		<Text x={x + 84} y={y} size={12} color={C.cream}>{`${v}/10`}</Text>
	</>
);

const StatCard: React.FC<{frame: number}> = ({frame}) => {
	const win = windows('stat_card', 'stat_card_out').find((w) => frame >= w.in && frame < w.out + 6);
	if (!win) return null;
	const age = frame - win.in;
	const leaving = frame >= win.out;
	const dx = leaving ? (frame - win.out) * 30 : Math.max(0, 30 - age * 6); // slides in from the right
	const v = statValue(frame, win);
	const shake = v.hit ? (frame % 2 ? 1 : -1) : 0;
	return (
		<Box x={334 + dx + shake} y={30} w={138} h={86}>
			<div style={{position: 'absolute', left: 0, top: -1, width: 138, height: 13, background: C.red, borderBottom: `1px solid ${C.ink}`}} />
			<Text x={0} y={2} size={8} center w={138} color={C.white}>角色卡</Text>
			<div style={{position: 'absolute', left: 8, top: 18, width: 26, height: 26, background: C.panel2, border: `1px solid ${C.gold2}`, overflow: 'hidden'}}>
				{PORTRAIT ? (
					<Img src={staticFile(`sprites/${PORTRAIT}.png`)} style={{...px, position: 'absolute', left: 1, top: 2, width: 24}} />
				) : (
					<Img src={staticFile(`sprites/${NARRATOR_SET}_look.png`)} style={{...px, position: 'absolute', left: -9, top: -2}} />
				)}
			</div>
			<Text x={40} y={20} size={12}>你</Text>
			<Text x={40} y={34} size={8} color={C.gold}>Lv 1 · 夜读者</Text>
			<Bar x={9} y={52} label="专注" v={v.focus} color={C.teal} />
			<Bar x={9} y={67} label="分心" v={v.distract} color={C.red} />
		</Box>
	);
};

// --------------------------------------------------------------- title card
const TitleCard: React.FC<{frame: number}> = ({frame}) => {
	const win = windows('title_card', 'title_card_out').find((w) => frame >= w.in && frame < w.out + 4);
	if (!win) return null;
	const age = frame - win.in;
	const out = frame >= win.out;
	const dy = popY(age) ?? 0;
	const o = out ? stepFade(1 - (frame - win.out) / 4) : 1;
	return (
		<AbsoluteFill style={{opacity: o}}>
			<div style={{position: 'absolute', left: 0, top: 0, width: W, height: H, background: `${C.ink}a0`}} />
			<div style={{position: 'absolute', left: 0, top: 96 + dy, width: W, height: 2, background: C.gold}} />
			<div style={{position: 'absolute', left: 0, top: 150 + dy, width: W, height: 2, background: C.gold}} />
			<Text x={0} y={104 + dy} size={24} color={C.gold} center w={W}>{win.cue.label as string}</Text>
			<Text x={0} y={134 + dy} size={12} color={C.cream} center w={W}>{win.cue.sub as string}</Text>
			{[0, 1].map((s) => (
				<div key={s} style={{position: 'absolute', left: s ? 300 : 168, top: 112 + dy, width: 12, height: 12, background: C.gold, transform: 'rotate(45deg) scale(0.6)'}} />
			))}
		</AbsoluteFill>
	);
};

// --------------------------------------------------------------- book reveal
const BookReveal: React.FC<{frame: number}> = ({frame}) => {
	const win = windows('book_reveal', 'book_reveal_out').find((w) => frame >= w.in && frame < w.out + 4);
	if (!win) return null;
	const age = frame - win.in;
	const out = frame >= win.out;
	const o = out ? stepFade(1 - (frame - win.out) / 4) : stepFade(age / 6);
	const bob = Math.floor(age / 15) % 2;
	const rot = Math.floor(age / 3) * 2; // rays turn in 2-degree steps
	const bx = 208;
	const by = 70 + bob + (popY(age) ?? 0);
	return (
		<AbsoluteFill style={{opacity: o}}>
			<div style={{position: 'absolute', left: 0, top: 0, width: W, height: H, background: `${C.ink}c8`}} />
			<svg width={W} height={H} style={{position: 'absolute', left: 0, top: 0}} shapeRendering="crispEdges">
				<g transform={`translate(240 113) rotate(${rot})`}>
					{Array.from({length: 12}, (_, k) => (
						<polygon key={k} points="0,0 -9,-140 9,-140" fill={C.gold} opacity={0.14} transform={`rotate(${k * 30})`} />
					))}
				</g>
			</svg>
			<div style={{position: 'absolute', left: bx - 2, top: by + 3, width: 68, height: 88, background: C.ink, opacity: 0.6}} />
			<div style={{position: 'absolute', left: bx - 4, top: by, width: 68, height: 88, background: '#22665f', border: `1px solid ${C.ink}`, boxShadow: `inset 0 0 0 2px ${C.gold2}, inset 3px 0 0 3px #184a45`}}>
				<div style={{position: 'absolute', left: 8, top: 10, width: 50, height: 1, background: C.gold}} />
				<Text x={0} y={16} size={12} color={C.gold} center w={68}>深度</Text>
				<Text x={0} y={30} size={12} color={C.gold} center w={68}>工作</Text>
				<div style={{position: 'absolute', left: 8, top: 46, width: 50, height: 1, background: C.gold}} />
				<Text x={0} y={52} size={8} color={C.cream} center w={68}>DEEP WORK</Text>
				<div style={{position: 'absolute', left: 30, top: 68, width: 7, height: 7, background: C.gold, transform: 'rotate(45deg)'}} />
			</div>
			<Text x={0} y={by + 94} size={8} color={C.cream} center w={W}>卡尔·纽波特 著</Text>
		</AbsoluteFill>
	);
};

// --------------------------------------------------------------- skill card
const SkillCard: React.FC<{frame: number}> = ({frame}) => {
	const win = windows('skill_card', 'skill_card_out').find((w) => frame >= w.in && frame < w.out + 4);
	if (!win) return null;
	const age = frame - win.in;
	const out = frame >= win.out;
	const o = out ? stepFade(1 - (frame - win.out) / 4) : 1;
	const dy = popY(age) ?? 0;
	const glow = Math.floor(age / 8) % 2 ? C.gold : C.cream;
	return (
		<AbsoluteFill style={{opacity: o}}>
			<Box x={338} y={34 + dy} w={128} h={84}>
				<Text x={0} y={8} size={8} center w={128} color={glow}>★ 新技能 ★</Text>
				<div style={{position: 'absolute', left: 50, top: 22, width: 28, height: 28, background: C.panel2, border: `1px solid ${C.gold2}`}}>
					<Img src={staticFile('sprites/phone.png')} style={{...px, position: 'absolute', left: 5, top: 9}} />
					<div style={{position: 'absolute', left: 3, top: 13, width: 22, height: 2, background: C.red, transform: 'rotate(-35deg)'}} />
				</div>
				<Text x={0} y={56} size={12} center w={128} color={C.gold}>{win.cue.label as string}</Text>
				<Text x={0} y={70} size={8} center w={128}>今晚就能用</Text>
			</Box>
		</AbsoluteFill>
	);
};

// --------------------------------------------------------------- hit text
const Fx: React.FC<{frame: number}> = ({frame}) => {
	return (
		<>
			{cuesOf('fx').map((c, k) => {
				const age = frame - c.frame;
				if (age < 0 || age > 40) return null;
				const y = 92 - Math.min(age, 12) + (popY(age) ?? 0);
				const o = age > 28 ? stepFade(1 - (age - 28) / 12) : 1;
				return (
					<div key={k} style={{opacity: o}}>
						<Text x={0} y={y} size={24} color={C.red} center w={W}>{c.fx as string}</Text>
					</div>
				);
			})}
		</>
	);
};

export const UI: React.FC = () => {
	const frame = useCurrentFrame();
	return (
		<AbsoluteFill>
			<div style={{position: 'absolute', width: W, height: H, transformOrigin: '0 0', transform: 'scale(4)'}}>
				<BookReveal frame={frame} />
				<StatCard frame={frame} />
				<SkillCard frame={frame} />
				<Fx frame={frame} />
				<TitleCard frame={frame} />
				<ChapterBar frame={frame} />
				<Subtitle frame={frame} />
			</div>
		</AbsoluteFill>
	);
};
