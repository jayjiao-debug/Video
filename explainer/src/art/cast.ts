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
	// 《续命》 (coffee)
	commuter: {skin: P.skin1, hair: 'pony', hairColor: P.hairBlack, outfit: 'casual', top: '#b9a58a', bottom: '#2f3442', accent: '#f1ece2'},
	coworker: {skin: P.skin2, hair: 'short', hairColor: P.hairBlack, outfit: 'casual', top: '#3d4a63', bottom: '#2a2c33', accent: '#d9d4c8', glasses: true},
	officegirl: {skin: P.skin1, hair: 'long', hairColor: '#3a2a22', outfit: 'casual', top: '#7a4a3a', bottom: '#d8cbb4', accent: '#efe6d6'},
	melitta: {skin: P.skin1, hair: 'bun', hairColor: '#5a4130', outfit: 'dress', top: '#2f3a52', bottom: '#2f3a52', apron: '#ece4d2'},
	liesgen: {skin: P.skin1, hair: 'long', hairColor: '#8a5a32', outfit: 'dress', top: '#9a4a52', bottom: '#9a4a52', apron: '#f2ead8'},
	schlendrian: {skin: P.skin2, hair: 'wig', hairColor: '#e6e0d4', outfit: 'frock', top: '#4a3a2c', bottom: '#2e2620', accent: '#7a5a2e'},
	gentleman: {skin: P.skin1, hair: 'wig', hairColor: '#d8d0c0', outfit: 'frock', top: '#2f4a3c', bottom: '#2a2620', accent: '#8a6a3a', hat: 'tricorn'},
	merchant: {skin: P.skin2, hair: 'short', hairColor: P.hairBrown, outfit: 'frock', top: '#5a4632', bottom: '#2a2620', accent: '#a07a46', mustache: true},
	farmer: {skin: P.skin3, hair: 'long', hairColor: P.hairBlack, outfit: 'casual', top: '#2f4f7a', bottom: '#2a2d36', accent: '#c94c3c', hat: 'headwrap', hatColor: '#1f5f6a'},
	bach: {skin: P.skin2, hair: 'wig', hairColor: '#ece6da', outfit: 'frock', top: '#2a2a30', bottom: '#1e1e22', accent: '#5a4a3a'},
	pasqua: {skin: P.skin3, hair: 'short', hairColor: P.hairBlack, outfit: 'frock', top: '#4a3a2c', bottom: '#2a2620', accent: '#7a5a2e', apron: '#e6dcc6', mustache: true},
	farmerOld: {skin: P.skin3, hair: 'short', hairColor: '#3a3632', outfit: 'casual', top: '#4a5a3a', bottom: '#2a2d36', accent: '#d9cfb8', hat: 'straw'},
	// 《八百人猜牛》 (Plymouth, 1906)
	galton: {skin: P.skin1, hair: 'bald', hairColor: '#e9e4da', outfit: 'suit', top: '#2a2a30', bottom: '#2a2a30', accent: '#3a3a44', whiskers: true},
	butcher: {skin: P.skin2, hair: 'short', hairColor: P.hairBrown, outfit: 'suit', top: '#3a4458', bottom: '#2c3038', accent: '#6e2a2a', apron: '#ece6da', hat: 'boater', hatColor: '#d9bf7f', mustache: true},
	drover: {skin: P.skin3, hair: 'short', hairColor: '#3a3632', outfit: 'casual', top: '#5a5040', bottom: '#3a362e', accent: '#d9cfb8', hat: 'flatcap', hatColor: '#4f4a3e'},
	gent: {skin: P.skin1, hair: 'short', hairColor: P.hairBlack, outfit: 'suit', top: '#2e3138', bottom: '#3a3530', accent: '#7a2c2c', hat: 'bowler', mustache: true},
	shopgirl: {skin: P.skin1, hair: 'bun', hairColor: '#6a4a32', outfit: 'dress', top: '#4a5a6a', bottom: '#4a5a6a', hat: 'bonnet', hatColor: '#3a3448', accent: '#c9a35e'},
	clerk06: {skin: P.skin2, hair: 'slick', hairColor: P.hairBrown, outfit: 'suit', top: '#4a4038', bottom: '#2f2a26', accent: '#2f3d5c', hat: 'boater', hatColor: '#cdb27a', glasses: true},
	farmwife: {skin: P.skin2, hair: 'bun', hairColor: P.hairBlack, outfit: 'dress', top: '#5a3b3a', bottom: '#5a3b3a', apron: '#e6dcc6'},
	lad: {skin: P.skin1, hair: 'short', hairColor: '#8a5a32', outfit: 'casual', top: '#3d4a63', bottom: '#4a4236', accent: '#d9d4c8', hat: 'flatcap', hatColor: '#6a5a42'},
};
