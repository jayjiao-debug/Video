import React from 'react';
import {color} from './theme';

export type Span = {text: string; tone: 'plain' | 'gold' | 'red'};

/** "[gold] and {red}" markup used in episode scripts. */
export const parseMarkup = (src: string): Span[] => {
	const out: Span[] = [];
	const re = /\[([^\]]*)\]|\{([^}]*)\}|([^[{]+)/g;
	let m: RegExpExecArray | null;
	while ((m = re.exec(src))) {
		if (m[1] !== undefined) out.push({text: m[1], tone: 'gold'});
		else if (m[2] !== undefined) out.push({text: m[2], tone: 'red'});
		else out.push({text: m[3], tone: 'plain'});
	}
	return out;
};

export const toneStyle = (tone: Span['tone']): React.CSSProperties =>
	tone === 'gold'
		? {color: color.gold, textShadow: `0 0 28px rgba(241,197,109,0.55), 0 2px 10px rgba(0,0,0,0.8)`}
		: tone === 'red'
			? {color: color.red, textShadow: `0 0 26px rgba(255,90,78,0.5), 0 2px 10px rgba(0,0,0,0.8)`}
			: {};

/** Static rendering of markup (for labels, cards). */
export const Markup: React.FC<{text: string}> = ({text}) => (
	<>
		{parseMarkup(text).map((s, i) => (
			<span key={i} style={toneStyle(s.tone)}>
				{s.text}
			</span>
		))}
	</>
);
