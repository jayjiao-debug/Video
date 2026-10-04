import type {VideoCfg} from '../../src/brand/Brand';

export const EPISODE: VideoCfg = {
	id: 'benford',
	src: '',
	title: '第一位数字',
	kicker: "BENFORD'S LAW · NEWCOMB · MDCCCLXXXI",
	tagline: '为什么1开头的数字最多？',
	taglineEn: 'Why does the world start with 1?',
	motif: 'bars', // nine gold bars (Benford's staircase), shared with the hook and the reveal
	card: [0, 4.1],
	hit: 4.07,
	extend: 0,
	question: '你的手机余额，第一位是几？评论区验一验',
	sources: '参考 · Newcomb, Am. J. Math. (1881) · Benford, Proc. APS (1938) · Nigrini, J. Accountancy (1999) · Rauch et al. (2011)',
	duration: 0,
};
