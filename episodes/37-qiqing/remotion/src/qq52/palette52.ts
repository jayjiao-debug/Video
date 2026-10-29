import {Pal, rimProps, palOf, PAL} from '../qq51/palette51';
/* ep52 《从一支箭，到火箭云》 「时代色」 (ep51's approved look, extended). Builder A owns this file; Builder B imports it.
   STABLE EXPORTS (add, don't change):
   - EraId52, PAL52[era] → Pal (the ep51 token shape: sky, horizon, far, mid, panel, near, field, backdrop, rim, line, accent)
   - EXTRA52[era] → era-only tokens (sun light, lamp, water, sand, reed, limb…)
   - pal52(era), rim52(era) (spread onto Walker51), FLAME, CLOUD, METAL, WOOD
   - re-exports Pal, rimProps, palOf, PAL from palette51 (the older eras: song/zhanguo/… are there too).
   Rule for every era: the rocket's light (flame, exhaust, the glowing cloud) is the brightest thing in the frame, warm
   white-gold against a MID-value colour field. Figures are one-tone silhouettes (B.lac) with the era's warm rim. */
export type {Pal};
export {rimProps, palOf, PAL};
export type EraId52 = 'dusk' | 'song' | 'ming' | 'mingWater' | 'sh1960' | 'space' | 'moon' | 'taiyuan';

const base: Pal = {sky: ['#100806', '#1E100B', '#2E1812'], skyA: 1, horizon: '#F3EEE6', horizonA: 0.2, far: '#1C0E0A', mid: '#261310', panel: '#1A0D09', near: '#150B08',
	field: ['#1E1614', '#120B09'], backdrop: '#FFB060', backdropA: 0.28, rim: '#FFD8A0', rimO: 1, rimD: 3.5, line: 'rgba(232,188,102,0.4)', accent: '#B8432A', iceEdge: 0};
const mk = (k: Partial<Pal>): Pal => ({...base, ...k});

export const PAL52: Record<EraId52, Pal> = {
	/** today, dusk after sunset (frame 0, L1–P2): deep blue-violet sky down to a thin ember band; a dark slate town and ridge */
	dusk: mk({sky: ['#0A0B22', '#1C1B4A', '#3B3068'], horizon: '#F08A4E', horizonA: 0.55, far: '#232552', mid: '#151633', panel: '#1E2044', near: '#08081A',
		field: ['#14152E', '#07071A'], backdrop: '#8A7AC8', backdropA: 0.22, rim: '#FFE2B0', rimD: 3, line: 'rgba(220,206,255,0.32)', accent: '#FFD27A'}),
	/** 北宋 (dusk): ochre + pale teal (ep51's Song key, pulled down a stop so the fire stays the brightest thing) */
	song: mk({sky: ['#355E66', '#6A8C88', '#C2A574'], horizon: '#F2D7A0', horizonA: 0.35, far: '#8C7052', mid: '#6A4A30', panel: '#80603E', near: '#2E2016',
		field: ['#7A5C3C', '#3A2A1C'], backdrop: '#F0D49A', backdropA: 0.26, rim: '#FFE0A8', rimD: 3, line: 'rgba(60,36,16,0.5)', accent: '#2E5E7A'}),
	/** 明 by night (一窝蜂): slate-green night, vermilion accents */
	ming: mk({sky: ['#132326', '#24403E', '#43625A'], horizon: '#D89A5A', horizonA: 0.22, far: '#2C4644', mid: '#203434', panel: '#2E4440', near: '#0E1818',
		field: ['#26383A', '#101A1A'], backdrop: '#9AB8A4', backdropA: 0.18, rim: '#FFD098', rimD: 3.5, line: 'rgba(220,200,150,0.36)', accent: '#C8402A'}),
	/** 明 on the water (火龙出水): slate-green water at dawn, vermilion accents */
	mingWater: mk({sky: ['#1E3A3E', '#45686A', '#93A48E'], horizon: '#F0D4A0', horizonA: 0.4, far: '#3E5C5A', mid: '#2C4646', panel: '#3A5452', near: '#122020',
		field: ['#3A5A58', '#142424'], backdrop: '#D8E0C0', backdropA: 0.2, rim: '#FFDCA4', rimD: 3, line: 'rgba(230,214,170,0.4)', accent: '#C8402A'}),
	/** 1956–1960 上海 beach: grey-blue sea dawn, sand, reed-straw yellow */
	sh1960: mk({sky: ['#34445A', '#66788A', '#B4B09C'], horizon: '#F2DEB0', horizonA: 0.4, far: '#56687A', mid: '#6E6450', panel: '#8A7A58', near: '#3A3426',
		field: ['#A8946C', '#665A40'], backdrop: '#E8DCB8', backdropA: 0.24, rim: '#FFE4B0', rimD: 3, line: 'rgba(60,50,30,0.42)', accent: '#C8A250'}),
	/** 1970 / space: near-black with the Earth's blue limb */
	space: mk({sky: ['#020309', '#04060E', '#08101E'], horizon: '#5AA8F0', horizonA: 0.6, far: '#0A1A30', mid: '#0E2440', panel: '#16304E', near: '#02040A',
		field: ['#0C2A50', '#03060E'], backdrop: '#4A8AD0', backdropA: 0.16, rim: '#FFE2B8', rimD: 3, line: 'rgba(170,200,240,0.36)', accent: '#7FC4FF'}),
	/** 月背: cool grey regolith, black sky */
	moon: mk({sky: ['#020203', '#050507', '#0A0A0E'], horizon: '#C8CCD2', horizonA: 0.12, far: '#5E6064', mid: '#7A7C80', panel: '#8E9094', near: '#2C2D30',
		field: ['#8A8C90', '#3A3B3E'], backdrop: '#C8CCD2', backdropA: 0.12, rim: '#FFE8C8', rimD: 3, line: 'rgba(220,224,232,0.35)', accent: '#E8C890'}),
	/** 太原 2026 launch: night with floodlights */
	taiyuan: mk({sky: ['#05070E', '#0D1222', '#1A2238'], horizon: '#8A96B8', horizonA: 0.2, far: '#141A2C', mid: '#1C2234', panel: '#262E44', near: '#06080E',
		field: ['#1A1F2C', '#07090E'], backdrop: '#D8DCE8', backdropA: 0.16, rim: '#FFE4B8', rimD: 3, line: 'rgba(214,220,240,0.34)', accent: '#F4F0E0'}),
};
/** era-only tokens */
export const EXTRA52 = {
	dusk: {sun: '#FFD9A0', band: '#F08A4E', bandHi: '#FFC48A', violet: '#5A4890', town: '#0E0F26', townLit: '#FFC873', ridge: '#06061A', star: '#E8E4FF'},
	song: {sun: '#FFE6B0', wood: '#5A3A20', woodL: '#8A6038', tile: '#2A2A2E', wall: '#C8B48A', paper: '#E8D8B0', lamp: '#FFC870'},
	ming: {lamp: '#FFC060', wood: '#6A4024', woodL: '#9A6A3A', vermilion: '#C8402A'},
	mingWater: {water: '#2E4E4E', waterHi: '#9AB8A8', foam: '#E8F0E0', vermilion: '#C8402A', wood: '#5A3A22'},
	sh1960: {sea: '#5A6E80', seaHi: '#C8D0D0', sand: '#B8A47A', reed: '#C8A858', reedD: '#8A7238', hut: '#6A5A3A'},
	space: {limb: '#5AB0FF', limbHi: '#BFE6FF', earth: '#0E2A52', sun: '#FFF2D8'},
	moon: {regolith: '#7A7C80', regolithD: '#3A3B3E', regolithL: '#B4B6BA', earth: '#4A9AE0'},
	taiyuan: {flood: '#F4F0E0', floodBeam: '#DDE4F4', tower: '#2A3248', steel: '#3A4460'},
} as const;
export const pal52 = (era: EraId52): Pal => PAL52[era];
/** the walker's rim for an era (spread onto Walker51) */
export const rim52 = (era: EraId52) => rimProps(PAL52[era], true);

/** the launch light: one family for every flame, spark and exhaust in the film (core → fringe) */
export const FLAME = {core: '#FFFFFF', white: '#FFF8E8', hot: '#FFEFB8', gold: '#FFD27A', amber: '#FFA84A', orange: '#F07A30', red: '#C8442A', smoke: '#B8B0A8'};
/** the 火箭云: lit side gold-white, shade side cyan, the veil violet */
export const CLOUD = {core: '#FFFDF6', bright: '#FFF4D8', gold: '#FFDFA0', peach: '#F8B888', cyan: '#A8E8FF', cyanD: '#5AA8D8', violet: '#7A70C0'};
/** rocket skin (generic, no logos, no flags): white-grey body, dark bands */
export const METAL = {hi: '#FFFFFF', body: '#E4E6E8', mid: '#B8BCC2', shade: '#7E848C', dark: '#3A3E44', band: '#2A2D32', nozzle: '#4A4E54', gold: '#E8BC66'};
/** wood, bamboo, paper (fire arrows, bows, the 一窝蜂 barrel, the 火龙 body) */
export const WOOD = {shaft: '#C8A06A', shaftD: '#7A5A34', bow: '#6A3A1E', bowL: '#A86A3A', horn: '#2A1A12', string: '#F2E6CC', paper: '#E8D8B0', paperD: '#A89468', cord: '#7A2A1A', iron: '#5E6266', ironL: '#A8AEB2', feather: '#E8E0D0', barrel: '#6A4024', barrelL: '#9A6A3A', hoop: '#2A2420', lacquer: '#A8321E', lacquerL: '#D8583A'};
void palOf;
