import type {BrandCfg, VideoCfg} from '../../src/brand/Brand';

// the channel package for 《八百人猜牛》: only the words and the motif change per episode
export const BRAND: BrandCfg = {videos: []};
export const EPISODE: VideoCfg = {
	id: 'ox',
	src: '',
	title: '八百人猜牛',
	kicker: 'VOX POPULI · GALTON · MCMVII',
	tagline: '一群人瞎猜，能猜准吗？',
	taglineEn: 'Can a crowd of guesses get it right?',
	motif: 'ticket',
	card: [0, 5],
	hit: 0.267, // 8 frames in: the title flares 16 frames after the card starts, on the track's hit
	extend: 0,
	question: '你刚才猜了多少公斤？评论区留个数',
	sources: '参考 · Galton, Vox Populi, Nature (1907) · Wallis, Statistical Science (2014) · Lorenz et al., PNAS (2011)',
	duration: 0,
};
