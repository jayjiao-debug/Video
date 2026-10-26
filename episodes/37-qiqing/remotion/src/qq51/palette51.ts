import {createContext, useContext} from 'react';
/* ep51 colour looks (round 3, the owner's "too monotone" note). Builder A owns this file; Builder B imports it.
   Three looks, switched by context so one bundle can render all of them side by side:
   - 'cur'  : the approved look as built (dark lacquer, one warm pool).
   - 'warm' : 「暖层次」 the same warm family opened up: lighter, hazier far planes; darker near planes; a soft lit backdrop
              behind every figure (subject area ~20–40 % luma); a stronger, brighter warm rim; props in local colour.
   - 'era'  : 「时代色」 each era its own mid-value colour key; figures stay one-tone with the warm rim.
   Rules for both: the ice stays the brightest, only true cool white; on blue fields it is separated by brightness and a thin
   warm edge (iceEdge), never by darkening the field. Subtitle scrims stay.
   Usage: wrap a render in <LookCtx.Provider value="warm">; inside, usePal('zhou') returns the tokens for that era. */
export type LookId = 'cur' | 'warm' | 'era';
export type EraId = 'zhou' | 'chunqiu' | 'zhanguo' | 'tang' | 'song' | 'qing' | 'qingSummer' | 'qianlong' | 'today';
export type Pal = {
	sky: [string, string, string];   // sky / back-wall gradient top → mid → horizon, painted over the lacquer with skyA
	skyA: number;
	horizon: string; horizonA: number;   // a lit band on the horizon (moonlight, dusk, a lit wall's top), alpha
	far: string;      // far planes (hills, far roofs): lighter + hazier in the opened-up looks
	mid: string;      // walls, screens, mid planes
	panel: string;    // panels / set dressing on the mid plane
	near: string;     // ground and near planes: darker
	field: [string, string];   // the ground field gradient (e.g. the frozen river) top → bottom
	backdrop: string; backdropA: number;   // the soft lit shape behind figures (0 = none)
	rim: string; rimO: number; rimD: number;   // the walker's rim light: colour, opacity, offset px
	line: string;     // gold hairline
	accent: string;   // the era accent (cinnabar, bronze, jade…)
	iceEdge: number;  // 0..1, a thin warm edge on ice (for blue fields)
};
const CUR: Pal = {sky: ['#100806', '#1E100B', '#2E1812'], skyA: 0, horizon: '#F3EEE6', horizonA: 0, far: '#1C0E0A', mid: '#261310', panel: '#1A0D09', near: '#150B08',
	field: ['#1E1614', '#120B09'], backdrop: '#FFB060', backdropA: 0, rim: '#F0B262', rimO: 0.9, rimD: 3, line: 'rgba(232,188,102,0.26)', accent: '#B8432A', iceEdge: 0};
/** the walker's rim props for an era (spread onto Walker51) */
export const rimProps = (p: Pal, on: boolean) => ({rim: on ? p.rim : undefined, rimO: p.rimO, dx: p.rimD, dy: -p.rimD * 0.85});
/** 「暖层次」: one warm family for every era, values opened up (tiny per-era shifts) */
const warm = (k: Partial<Pal> = {}): Pal => ({sky: ['#2A1A14', '#4A3024', '#7A5038'], skyA: 0.9, horizon: '#E8B880', horizonA: 0.22, far: '#5A3E30', mid: '#3E2619', panel: '#4E3020', near: '#100806',
	field: ['#4A3428', '#1A100C'], backdrop: '#E8A868', backdropA: 0.34, rim: '#FFD9A0', rimO: 1, rimD: 4, line: 'rgba(240,200,120,0.42)', accent: '#C8583A', iceEdge: 0, ...k});
export const PAL: Record<LookId, Record<EraId, Pal>> = {
	cur: {zhou: CUR, chunqiu: CUR, zhanguo: CUR, tang: CUR, song: CUR, qing: CUR, qingSummer: CUR, qianlong: CUR, today: CUR},
	warm: {
		zhou: warm({sky: ['#20161A', '#3A2A2C', '#6A4A3C'], far: '#4E3C36', field: ['#4A3A34', '#1A1210'], horizon: '#E8C8A0', horizonA: 0.25}),
		chunqiu: warm({}),
		zhanguo: warm({mid: '#4A2A1C', panel: '#5E3622'}),
		tang: warm({mid: '#4E2A1A', panel: '#6A3A22', accent: '#D06038'}),
		song: warm({sky: ['#5A4030', '#8A6448', '#C8A070'], far: '#8A6A50', mid: '#6A4A32', backdropA: 0.28}),
		qing: warm({mid: '#4A2418', accent: '#C04A30'}),
		qingSummer: warm({sky: ['#5A4434', '#8A6E52', '#B89A76'], mid: '#6A5444'}),
		qianlong: warm({mid: '#5A4020', accent: '#3A5A8A'}),
		today: warm({mid: '#4A3E36', panel: '#5A4C42'}),
	},
	era: {
		zhou: {...CUR, sky: ['#121634', '#262A58', '#4E4E84'], skyA: 1, horizon: '#A8A6D8', horizonA: 0.4, far: '#2A2E56', mid: '#22264A', panel: '#2E3260', near: '#0E1020',
			field: ['#2E3458', '#151830'], backdrop: '#7A78B8', backdropA: 0.32, rim: '#FFC27A', rimO: 1, rimD: 3.5, line: 'rgba(200,190,240,0.35)', accent: '#C8A060', iceEdge: 0.8},
		chunqiu: {...CUR, sky: ['#1E1A2C', '#3A3246', '#6E5E62'], skyA: 1, horizon: '#D8B08A', horizonA: 0.3, far: '#3A3446', mid: '#2E2632', panel: '#3E3440', near: '#120F12',
			field: ['#3A2C28', '#1A1210'], backdrop: '#C8A078', backdropA: 0.3, rim: '#FFC88A', rimO: 1, rimD: 3.5, line: 'rgba(220,190,150,0.4)', accent: '#B89060', iceEdge: 0.5},
		zhanguo: {...CUR, sky: ['#1A0806', '#3A0E0A', '#4A140E'], skyA: 1, horizon: '#E8A050', horizonA: 0.18, far: '#3A100A', mid: '#5A1A12', panel: '#240806', near: '#120504',
			field: ['#2A0C08', '#140605'], backdrop: '#F0A858', backdropA: 0.34, rim: '#FFD08A', rimO: 1, rimD: 3.5, line: 'rgba(232,188,102,0.55)', accent: '#D9A050', iceEdge: 0},
		tang: {...CUR, sky: ['#3A1208', '#6A2014', '#94381E'], skyA: 1, horizon: '#F0B060', horizonA: 0.25, far: '#7A3020', mid: '#6A2216', panel: '#8A3A1C', near: '#180806',
			field: ['#3A160C', '#180806'], backdrop: '#F2B868', backdropA: 0.32, rim: '#FFD8A0', rimO: 1, rimD: 3.5, line: 'rgba(240,200,110,0.5)', accent: '#E0B050', iceEdge: 0},
		song: {...CUR, sky: ['#5E8E8C', '#90B4AC', '#D8CCA4'], skyA: 1, horizon: '#F0E0B0', horizonA: 0.3, far: '#A88A66', mid: '#7E5C3A', panel: '#94704A', near: '#3A2A1C',
			field: ['#8A6A48', '#4A3624'], backdrop: '#F4E0A8', backdropA: 0.26, rim: '#FFE0A8', rimO: 1, rimD: 3, line: 'rgba(90,60,30,0.45)', accent: '#3A6A8A', iceEdge: 0.4},
		qing: {...CUR, sky: ['#141C2A', '#24303E', '#384658'], skyA: 1, horizon: '#C88A60', horizonA: 0.22, far: '#2A3444', mid: '#6A1E14', panel: '#7A2A1A', near: '#101216',
			field: ['#283240', '#121418'], backdrop: '#D08858', backdropA: 0.32, rim: '#FFC88A', rimO: 1, rimD: 3.5, line: 'rgba(232,188,102,0.4)', accent: '#B8382A', iceEdge: 0.7},
		qingSummer: {...CUR, sky: ['#3E5E56', '#6E9282', '#ACB89E'], skyA: 1, horizon: '#E8DCB8', horizonA: 0.25, far: '#86A090', mid: '#6E6C62', panel: '#8A8676', near: '#2A2A26',
			field: ['#7A7666', '#3A3830'], backdrop: '#ECDCB0', backdropA: 0.26, rim: '#FFE0A8', rimO: 1, rimD: 3, line: 'rgba(60,50,30,0.4)', accent: '#4A8A6A', iceEdge: 0.4},
		qianlong: {...CUR, sky: ['#14223E', '#22345E', '#34487A'], skyA: 1, horizon: '#E8C070', horizonA: 0.3, far: '#2A3A66', mid: '#5E4A1E', panel: '#7A6026', near: '#14120C',
			field: ['#3A3018', '#16130C'], backdrop: '#ECC678', backdropA: 0.32, rim: '#FFD898', rimO: 1, rimD: 3.5, line: 'rgba(240,200,110,0.55)', accent: '#2C6494', iceEdge: 0.6},
		today: {...CUR, sky: ['#2E2A28', '#46403C', '#5E5650'], skyA: 1, horizon: '#E8DCC8', horizonA: 0.2, far: '#5E5852', mid: '#48423E', panel: '#5A534E', near: '#1C1A18',
			field: ['#3E3934', '#1E1B18'], backdrop: '#E0D2BC', backdropA: 0.26, rim: '#FFE2B8', rimO: 1, rimD: 3, line: 'rgba(230,210,180,0.35)', accent: '#B8432A', iceEdge: 0.3},
	},
};
export const LookCtx = createContext<LookId>('cur');
export const useLook = () => useContext(LookCtx);
export const usePal = (era: EraId): Pal => PAL[useContext(LookCtx)][era];
export const palOf = (look: LookId, era: EraId): Pal => PAL[look][era];
