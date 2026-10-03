import type {Look} from './Figure';
import {P} from './palette';

/** The recurring cast. Same skeleton, distinct silhouettes: hat, glasses, coat length. */
export const CAST: Record<string, Look> = {
	wald: {skin: P.skin1, hair: 'slick', hairColor: P.hairBlack, outfit: 'suit', top: P.suitCharcoal, bottom: '#26282e', accent: '#6e2a2a', glasses: true},
	friedman: {skin: P.skin1, hair: 'bald', hairColor: P.hairBrown, outfit: 'suit', top: P.suitBrown, bottom: '#3f3128', accent: '#2f3d5c', glasses: true},
	officer: {skin: P.skin2, hair: 'short', hairColor: P.hairBrown, outfit: 'uniform', top: '#4b4a32', bottom: '#b3a184', accent: '#8a7a55', hat: 'officer', hatColor: '#4f4e35', mustache: true},
	mechanic: {skin: P.skin3, hair: 'short', hairColor: P.hairBlack, outfit: 'overalls', top: '#5f6446', bottom: '#5f6446', hat: 'ballcap', accent: '#3d4a3a'},
	pilot: {skin: P.skin1, hair: 'short', hairColor: P.hairBrown, outfit: 'flight', top: '#6b4428', bottom: '#8c7d5c', accent: '#f0ece2', hat: 'officer', hatColor: '#4f4e35'},
	vet: {skin: P.skin2, hair: 'bob', hairColor: P.hairBrown, outfit: 'labcoat', top: P.labCoat, bottom: '#2f3540', accent: '#6b7a8c'},
	economist: {skin: P.skin1, hair: 'short', hairColor: P.hairBrown, outfit: 'suit', top: '#3d4450', bottom: '#2c3038', accent: '#5a6b85', glasses: true},
	analyst: {skin: P.skin2, hair: 'slick', hairColor: P.hairBlack, outfit: 'suit', top: '#4a3f36', bottom: '#2f2a26', accent: '#7a2c2c'},
	soldier: {skin: P.skin2, hair: 'short', hairColor: P.hairBrown, outfit: 'uniform', top: '#5a5c3e', bottom: '#5a5c3e', accent: '#6e6a50', hat: 'helmet', hatColor: '#4a4f36'},
	clerk: {skin: P.skin1, hair: 'bun', hairColor: P.hairBrown, outfit: 'dress', top: '#5a3b4a', bottom: '#5a3b4a'},
};
