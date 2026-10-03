// Design tokens shared by every episode: a dark, warm, cinematic palette.

export const color = {
	night: '#06070b',
	ink: '#0d1018',
	panel: '#141824',
	line: 'rgba(236, 226, 205, 0.16)',
	text: '#f3ede2',
	dim: 'rgba(243, 237, 226, 0.58)',
	faint: 'rgba(243, 237, 226, 0.28)',
	gold: '#f1c56d',
	goldDeep: '#c8913a',
	amber: '#ffb347',
	red: '#ff5a4e',
	redDeep: '#b8322b',
	blue: '#7fa7d8',
	steel: '#9aa4b5',
};

export const font = {
	serif: '"EpSerif", "Noto Serif SC", serif',
	sans: '"EpSans", "Noto Sans SC", sans-serif',
	latin: '"EpLatin", "Cormorant Garamond", serif',
	latinItalic: '"EpLatinItalic", "Cormorant Garamond", serif',
};

export type Layout = {
	w: number;
	h: number;
	/** the box scene visuals draw into */
	stage: {x: number; y: number; w: number; h: number};
	seriesY: number;
	kickerY: number;
	subY: number;
	subSize: number;
	subMaxW: number;
	citeY: number;
};

// Vertical keeps the top ~200px and bottom ~380px clear of the Douyin/TikTok
// overlays (search bar, caption, buttons), and the right edge clear of the icons.
export const layouts: Record<'vertical' | 'horizontal', Layout> = {
	vertical: {
		w: 1080, h: 1920,
		stage: {x: 0, y: 360, w: 1080, h: 980},
		seriesY: 214, kickerY: 300,
		subY: 1420, subSize: 56, subMaxW: 860,
		citeY: 1528,
	},
	horizontal: {
		w: 1920, h: 1080,
		stage: {x: 0, y: 150, w: 1920, h: 740},
		seriesY: 44, kickerY: 56,
		subY: 952, subSize: 54, subMaxW: 1500,
		citeY: 1036,
	},
};
