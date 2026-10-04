import type {BrandCfg, VideoCfg} from '../../src/brand/Brand';

// the channel package for 《夸完就翻车》: only the words and the motif change per episode
export const BRAND: BrandCfg = {videos: []};
export const EPISODE: VideoCfg = {
	id: 'regress',
	src: '',
	title: '夸完就翻车',
	kicker: 'REGRESSION TO THE MEAN · KAHNEMAN · GALTON',
	tagline: '夸一句就变差，骂一顿就变好？',
	taglineEn: 'Does praise really make them worse?',
	motif: 'coin',
	card: [0, 5],
	hit: 0.267,
	extend: 0,
	question: '你有没有夸完就“翻车”的经历？评论区聊聊',
	sources: '参考 · Kahneman, Thinking, Fast and Slow (2011) · Kahneman, Nobel autobiography (2002) · Galton, J. Anthropol. Inst. (1886)',
	duration: 0,
};
