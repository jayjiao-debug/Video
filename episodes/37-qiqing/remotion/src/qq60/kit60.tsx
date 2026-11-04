import React from 'react';
import {Composition, useCurrentFrame} from 'remotion';
import {FW, FH} from './frame60';
import {Weighing43, Weighing43Motion, LedIn43} from './scene43';
import {TombSet, EmbalmSet, DuatSet, HallSet, ReedsSet, ScarabSet, AmmitSet, MarketSet, OsirisSet, CastSheet} from './sets60';
const WeighLapis: React.FC<{t: number}> = ({t}) => <Weighing43 t={t} mood="lapis" sub={{text: '左边你的心，右边[真理]之羽。'}} />;
const DuatBlood: React.FC<{t: number}> = ({t}) => <DuatSet t={t} mood="blood" />;

/* ep60 · 4:3 kit compositions (stills: KIT-*; the frame `t` is the still's moment in seconds via the `t` prop). */
const at = (C: React.FC<{t: number}>, t0: number): React.FC => () => { const f = useCurrentFrame(); return <C t={t0 + f / 30} />; };
export const KIT: [string, React.FC<{t: number}>, number][] = [
	['KIT-WEIGH', Weighing43 as React.FC<{t: number}>, 2.6],
	['KIT-WEIGH-LAPIS', WeighLapis, 2.6],
	['KIT-LEDIN', LedIn43, 1.2],
	['KIT-TOMB', TombSet, 3],
	['KIT-EMBALM', EmbalmSet, 1.5],
	['KIT-DUAT', DuatSet, 12],
	['KIT-DUAT-RED', DuatBlood, 26.5],
	['KIT-HALL', HallSet, 0.6],
	['KIT-REEDS', ReedsSet, 3],
	['KIT-SCARAB', ScarabSet, 4.6],
	['KIT-AMMIT', AmmitSet, 1.42],
	['KIT-AMMIT-DUST', AmmitSet, 2.7],
	['KIT-MARKET', MarketSet, 2],
	['KIT-OSIRIS', OsirisSet, 2],
	['KIT-CAST', CastSheet, 1],
];
export const SETS: [string, React.FC<{t: number}>][] = [['SET-TOMB', TombSet], ['SET-EMBALM', EmbalmSet], ['SET-DUAT', DuatSet], ['SET-HALL', HallSet], ['SET-REEDS', ReedsSet],
	['SET-SCARAB', ScarabSet], ['SET-AMMIT', AmmitSet], ['SET-MARKET', MarketSet], ['SET-OSIRIS', OsirisSet], ['SET-LEDIN', LedIn43]];
export const KitCompositions: React.FC = () => <>
	{KIT.map(([id, C, t0]) => <Composition key={id} id={id} component={at(C, t0)} durationInFrames={300} fps={30} width={FW} height={FH} />)}
	<Composition id="KIT-WEIGH-MOTION" component={at(Weighing43Motion, 0)} durationInFrames={150} fps={30} width={FW} height={FH} />
	{/* motion previews of every set from t = 0 (10 s each); render as frames, not video, while disk is short */}
	{SETS.map(([id, C]) => <Composition key={id} id={id} component={at(C, 0)} durationInFrames={300} fps={30} width={FW} height={FH} />)}
</>;
