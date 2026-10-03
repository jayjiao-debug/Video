import React from 'react';
import {useCurrentFrame} from 'remotion';
import {ease, prog, useLayout, useTimeline} from '../lib/context';
import {parseMarkup, toneStyle} from '../lib/Markup';
import {color, font} from '../lib/theme';

/** Burned-in subtitles: characters ripple in, the line settles, then lifts away. */
export const Subtitles: React.FC = () => {
	const f = useCurrentFrame();
	const {subtitles} = useTimeline();
	const L = useLayout();
	const sub = subtitles.find((s) => f >= s.from && f < s.to);
	if (!sub) return null;

	const local = f - sub.from;
	const out = prog(f, sub.to - 8, 8, ease.in);
	const spans = parseMarkup(sub.text);
	const total = spans.reduce((n, s) => n + [...s.text].length, 0);
	const step = Math.min(1.2, 22 / Math.max(1, total));
	let k = 0;

	return (
		<div
			style={{
				position: 'absolute',
				left: (L.w - L.subMaxW) / 2,
				width: L.subMaxW,
				top: L.subY,
				transform: `translateY(-50%) translateY(${-10 * out}px)`,
				opacity: 1 - out,
				textAlign: 'center',
				fontFamily: font.serif,
				fontWeight: 700,
				fontSize: L.subSize,
				lineHeight: 1.45,
				letterSpacing: `${0.06 - 0.03 * prog(local, 0, 30)}em`,
				color: color.text,
				textShadow: '0 2px 14px rgba(0,0,0,0.85), 0 0 2px rgba(0,0,0,0.9)',
				textWrap: 'balance',
			}}
		>
			{spans.map((s, i) => (
				<span key={i} style={toneStyle(s.tone)}>
					{[...s.text].map((ch, j) => {
						const p = prog(local, (k++) * step, 12);
						return (
							<span
								key={j}
								style={{
									display: 'inline-block',
									opacity: p,
									transform: `translateY(${(1 - p) * 18}px)`,
									whiteSpace: 'pre',
								}}
							>
								{ch}
							</span>
						);
					})}
				</span>
			))}
		</div>
	);
};
