import React from 'react';
import {AbsoluteFill, Audio, Sequence, getRemotionEnvironment, staticFile, type CalculateMetadataFunction} from 'remotion';
import {Backdrop, Grade} from './components/Backdrop';
import {Chrome} from './components/Chrome';
import {Subtitles} from './components/Subtitles';
import {SceneProvider, TimelineProvider} from './lib/context';
import {loadEpisodeFonts} from './lib/fonts';
import type {Timeline} from './lib/types';
import {registry} from './registry.generated';

export type EpisodeProps = {episode: string; timeline?: Timeline};

export const calculateMetadata: CalculateMetadataFunction<EpisodeProps> = async ({props}) => {
	const res = await fetch(staticFile(`build/${props.episode}/timeline.json`));
	if (!res.ok) throw new Error(`No timeline for "${props.episode}". Run: python make.py ${props.episode} --plan`);
	const timeline = (await res.json()) as Timeline;
	return {
		durationInFrames: timeline.durationInFrames,
		fps: timeline.fps,
		width: timeline.width,
		height: timeline.height,
		props: {...props, timeline},
	};
};

const Missing: React.FC<{name: string}> = () => null;

export const Episode: React.FC<EpisodeProps> = ({episode, timeline}) => {
	loadEpisodeFonts(episode);
	if (!timeline) return null;
	const scenes = registry[episode] ?? {};
	// the final render is muted and the master audio is muxed by make.py; the studio plays the track
	const preview = getRemotionEnvironment().isStudio;
	return (
		<TimelineProvider value={timeline}>
			<AbsoluteFill style={{background: '#000'}}>
				<Backdrop />
				{timeline.scenes.map((scene) => {
					const C = scenes[scene.component] ?? Missing;
					return (
						<Sequence key={scene.id} from={scene.from} durationInFrames={scene.duration} name={`${scene.id} · ${scene.component}`}>
							<SceneProvider value={scene}>
								<C scene={scene} />
							</SceneProvider>
						</Sequence>
					);
				})}
				<Chrome />
				<Subtitles />
				<Grade />
				{preview ? <Audio src={staticFile(timeline.music.src)} /> : null}
			</AbsoluteFill>
		</TimelineProvider>
	);
};
