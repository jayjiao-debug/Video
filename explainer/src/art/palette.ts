/**
 * The art bible's colour palette. Every set, character and prop draws from here.
 *
 * Lighting rule: each shot has ONE warm practical key (lamp, candle, searchlight,
 * fire) and a COOL ambient/rim (moon, sky). Warm = attention, cool = space.
 * Gold is reserved for the answer; red for damage and the trap.
 */
export const P = {
	// night sky and shadow, from deepest to the horizon
	night0: '#070a14',
	night1: '#0d1424',
	night2: '#162036',
	night3: '#24304d',
	night4: '#3a4566',
	horizon: '#5b5468',
	dusk: '#8a6a62',
	// cool light
	moon: '#dfe8f5',
	rim: '#9cc0ee',
	steelBlue: '#5f7aa3',
	// warm practicals
	lamp: '#ffb54d',
	candle: '#ffd98f',
	ember: '#ff7a3d',
	fire: '#ff5a2e',
	gold: '#f1c56d',
	brass: '#c8913a',
	brassDark: '#7d5420',
	// materials
	odGreen: '#565b3a', // olive drab (B-17F, 1943)
	odLight: '#6f7650',
	odDark: '#3a3e26',
	neutralGray: '#8d9298', // undersides
	alu: '#c3c8cf',
	aluDark: '#7f858e',
	glass: '#9fc3e6',
	paper: '#efe6d2',
	paperShade: '#cdbf9f',
	ink: '#2a2620',
	wood: '#5a3d27',
	woodDark: '#3a2618',
	brick: '#4a2f2a',
	concrete: '#4a4d55',
	// people
	skin1: '#eccaa6',
	skin2: '#d9a77f',
	skin3: '#a8714d',
	skinShade: 'rgba(120,60,40,0.28)',
	hairBlack: '#231e1c',
	hairBrown: '#5a4130',
	hairGray: '#8f8a86',
	suitCharcoal: '#2e3138',
	suitBrown: '#5b4636',
	shirt: '#e9e4da',
	khaki: '#a49371',
	labCoat: '#e8edf0',
	// signal colours
	red: '#e5484d',
	redDeep: '#9e2a2a',
	star: '#f2f2ee', // USAAF insignia white
	insigniaBlue: '#1f2f6b',
};

export type Swatch = keyof typeof P;
