import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Audio, continueRender, delayRender, staticFile} from 'remotion';
import {World} from './World';
import {UI} from './UI';

const FONT_CSS = ['fonts/12/Fusion-Pixel-12px-Proportional-Simplified-Chinese.css', 'fonts/8/Fusion-Pixel-8px-Proportional-Simplified-Chinese.css'];

// Load the pixel fonts (split by unicode range) and wait until every glyph we use is ready.
const useFonts = () => {
	const [handle] = useState(() => delayRender('pixel fonts'));
	useEffect(() => {
		for (const href of FONT_CSS) {
			if (document.querySelector(`link[href="${staticFile(href)}"]`)) continue;
			const l = document.createElement('link');
			l.rel = 'stylesheet';
			l.href = staticFile(href);
			document.head.appendChild(l);
		}
		const text = document.body.innerText + '角色卡你夜读者专注分心新技能今晚就能用深度工作卡尔纽波特著第一关切换的代价隔离DEEPWORKMISS★·Lv0123456789/';
		const wait = (fam: string) => document.fonts.load(`12px ${fam}`, text);
		setTimeout(() => {
			Promise.all([
				wait('"Fusion Pixel 12px Proportional Simplified Chinese"'),
				document.fonts.load('8px "Fusion Pixel 8px Proportional Simplified Chinese"', text),
			])
				.then(() => document.fonts.ready)
				.then(() => continueRender(handle));
		}, 300);
	}, [handle]);
};

export const Film: React.FC = () => {
	useFonts();
	return (
		<AbsoluteFill style={{background: '#16111e'}}>
			<World />
			<UI />
			<Audio src={staticFile('audio/mix.wav')} />
		</AbsoluteFill>
	);
};
