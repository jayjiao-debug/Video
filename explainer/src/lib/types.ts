import type React from 'react';

export type Line = {
	text: string;
	/** frames, relative to the scene start */
	from: number;
	duration: number;
	silent: boolean;
};

export type Scene = {
	id: string;
	component: string;
	props: Record<string, unknown>;
	kicker?: string | null;
	cite?: string | null;
	/** absolute frame */
	from: number;
	duration: number;
	lines: Line[];
};

export type Subtitle = {text: string; from: number; to: number; scene: string};

export type Timeline = {
	id: string;
	series: string;
	title: string;
	subtitle: string;
	format: 'vertical' | 'horizontal';
	width: number;
	height: number;
	fps: number;
	durationInFrames: number;
	music: {
		src: string;
		tempo: number;
		markers: Record<string, number>;
		beats: number[];
		energyHz: number;
		energy: number[];
		/** accented beats (kick/snare): [absolute frame, strength 0..1] */
		hits?: [number, number][];
	};
	scenes: Scene[];
	subtitles: Subtitle[];
};

export type SceneProps = {scene: Scene};
export type SceneMap = Record<string, React.FC<SceneProps>>;
