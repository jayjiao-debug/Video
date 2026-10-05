import type {BrandCfg, VideoCfg} from '../../src/brand/Brand';

// the channel package for 《旋转的硬币》: only the words and the motif change per episode
export const BRAND: BrandCfg = {videos: []};
export const EPISODE: VideoCfg = {
	id: 'quantum',
	src: '',
	title: '旋转的硬币',
	kicker: 'QUBITS · SUPERPOSITION · INTERFERENCE',
	tagline: '量子计算机，到底快在哪？',
	taglineEn: 'What makes a quantum computer fast?',
	motif: 'qubit',
	card: [0, 5],
	hit: 0.267,
	extend: 0,
	question: '你觉得量子计算机多少年后能真正用上？评论区说说',
	sources: '参考 · Google Quantum AI, Willow (2024) · Aaronson, NYT (2011) · Gidney, arXiv:2505.15917 (2025)',
	duration: 0,
};
