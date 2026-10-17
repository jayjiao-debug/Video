// ep30 《同一段旋律，8种曲风》 — the whole soundtrack, synthesized. One original theme (A minor, 2 bars), re-dressed in
// 8 genres following script.md's music plan (round 2). Writes out/music.wav (float, 48 kHz) and out/events.json:
// every drum hit / signature hit / melody note with its time, so the picture's beat grid lights exactly on the sound.
// usage: node song30.js
const fs = require('fs');
const { SR, Bus, OnePole, SVF, rng, reverb } = require('./engine/audio/dsp');
const I = require('./engine/audio/instruments');
const MIX = require('./engine/audio/mix');

const LEN = 147.53;
const N = Math.ceil(LEN * SR) + SR;
const B = { drums: new Bus(N), bass: new Bus(N), keys: new Bus(N), lead: new Bus(N), pad: new Bus(N), fx: new Bus(N), verb: new Bus(N) };
const EV = [];                                           // {t, seg, row, step, bar, v}
const MEL = [];                                          // {t, d, midi, seg}
const NOTE = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const m = (s) => 12 * (parseInt(s.slice(-1)) + 1) + NOTE[s[0]] + (s[1] === '#' ? 1 : s[1] === 'b' ? -1 : 0);

// ---------------------------------------------------------------- the theme (never changes pitch)
const THEME = [['A4', 0, 1], ['C5', 1, 0.5], ['E5', 1.5, 0.5], ['D5', 2, 1], ['C5', 3, 1], ['C5', 4, 1], ['A4', 5, 1], ['B4', 6, 1], ['G4', 7, 1]];
const CHORDS = [['A', 0, 4, 'm'], ['F', 4, 2, ''], ['G', 6, 2, '']];   // root, beat, beats, quality (per 2-bar phrase)
const ROOT = { A: 45, F: 41, G: 43 };                                  // bass octave (A2, F2, G2)

// ---------------------------------------------------------------- small DSP helpers
const dist = (b, drive = 6) => { const o = new Float32Array(b.length), k = Math.tanh(drive); for (let i = 0; i < b.length; i++) o[i] = Math.tanh(b[i] * drive) / k; return o; };
const lpBuf = (b, hz, passes = 2) => { let x = b; for (let p = 0; p < passes; p++) { const f = new OnePole(), o = new Float32Array(x.length); for (let i = 0; i < x.length; i++) o[i] = f.lp(x[i], hz); x = o; } return x; };
const hpBuf = (b, hz) => { const f = new OnePole(), o = new Float32Array(b.length); for (let i = 0; i < b.length; i++) o[i] = f.hp(b[i], hz); return o; };
const sumBufs = (list) => { const n = Math.max(...list.map((b) => b.length)), o = new Float32Array(n); for (const b of list) for (let i = 0; i < b.length; i++) o[i] += b[i]; return o; };
const gainBuf = (b, g) => b.map((x) => x * g);
function ride(seed = 1, decay = 0.9) {                     // metallic FM/ring-mod "叮": inharmonic partials, long decay
	const o = new Float32Array(Math.ceil(decay * 4 * SR)), w = rng(seed), hp = new OnePole();
	const fs_ = [3120, 4410, 5230, 6650, 7980];
	for (let i = 0; i < o.length; i++) {
		const t = i / SR; let s = 0;
		fs_.forEach((f, k) => { s += Math.sin(2 * Math.PI * f * t + 2.2 * Math.sin(2 * Math.PI * f * 1.414 * t)) * (1 / (k + 1)); });
		s = s * 0.45 + hp.hp(w(), 6000) * 0.5 * Math.exp(-t / 0.03);
		o[i] = s * Math.min(1, t / 0.0015) * Math.exp(-t / decay) * 0.5;
	}
	return o;
}
function flute(midi, dur) {                                // soft breathy flute-like tone for bossa
	const f = 440 * Math.pow(2, (midi - 69) / 12), o = new Float32Array(Math.ceil((dur + 0.25) * SR)), w = rng(midi), bp = new SVF();
	for (let i = 0; i < o.length; i++) {
		const t = i / SR, vib = 1 + 0.004 * Math.sin(2 * Math.PI * 5.2 * t) * Math.min(1, t / 0.4);
		const env = Math.min(1, t / 0.07) * (t > dur ? Math.max(0, 1 - (t - dur) / 0.2) : 1);
		const tone = Math.sin(2 * Math.PI * f * vib * t) + 0.18 * Math.sin(4 * Math.PI * f * vib * t) + 0.06 * Math.sin(6 * Math.PI * f * vib * t);
		o[i] = (tone * 0.8 + bp.bp(w(), f * 2, 2) * 0.35) * env * 0.45;
	}
	return o;
}
function melodica(midi, dur) {                             // reedy pulse-ish tone for reggae
	const f = 440 * Math.pow(2, (midi - 69) / 12), o = new Float32Array(Math.ceil((dur + 0.15) * SR)), lp = new OnePole();
	let ph = 0;
	for (let i = 0; i < o.length; i++) {
		const t = i / SR; ph = (ph + f / SR) % 1;
		const sq = (ph < 0.3 ? 1 : -1) * 0.6 + (2 * ph - 1) * 0.4;
		const env = Math.min(1, t / 0.02) * (t > dur ? Math.max(0, 1 - (t - dur) / 0.1) : 1);
		o[i] = lp.lp(sq, 2600) * env * 0.35;
	}
	return o;
}
const roll = (bus, t0, t1, n, g0, g1, seg, row = 'S', fn = () => I.snare({ decay: 0.08 })) => { for (let k = 0; k < n; k++) { const t = t0 + (t1 - t0) * k / n; bus.addMono(fn(), t, g0 + (g1 - g0) * k / n); EV.push({ t, seg, row, v: 0.6 }); } };

// ---------------------------------------------------------------- grid player: one bar of a 16-step pattern
const KICK = I.kick({ punch: 1.1, tail: 0.3 }), KICK_SOFT = I.kick({ punch: 0.6, tail: 0.22 }), SNARE = I.snare(), CLAP = I.clap({ spread: 0.012 });
const HAT = I.hat(false, 5), OHAT = I.hat(true, 9), RIM = I.rim(1, 3), CRASH = I.crash(6), TICK = I.woodTick(1);
function bar16(seg, t0, barLen, pat, { swing = 0.5, gains = {}, sounds = {}, lazy = 0, barIdx = 0, rows = {} } = {}) {
	// pat: {row: 'x...x...' 16 chars}; 'X' accent, 'x' hit, 'o' ghost
	const step = barLen / 16;
	for (const row of Object.keys(pat)) {
		const p = pat[row];
		for (let s = 0; s < 16; s++) {
			const c = p[s]; if (!c || c === '.') continue;
			const v = c === 'X' ? 1 : c === 'x' ? 0.75 : 0.4;
			let t = t0 + s * step;
			if (s % 4 === 2) t += (swing - 0.5) * 2 * (step * 2);           // swung 8ths: the off-8th moves late
			if (lazy) t += (rng(Math.round(t * 1000))() * 2 - 1) * lazy;        // lo-fi looseness (small, random)
			const snd = sounds[row] || { K: KICK, S: SNARE, H: HAT, O: OHAT, R: RIM, C: CLAP, T: TICK, X: CRASH }[row];
			B.drums.addMono(snd, t, (gains[row] ?? 0.6) * v, row === 'H' || row === 'O' ? 0.18 : row === 'R' ? -0.12 : 0);
			EV.push({ t, seg, row: rows[row] || row, step: s, bar: barIdx, v });
		}
	}
}
// ---------------------------------------------------------------- theme + chords helpers
function themeAt(seg, t0, beat, play, { swing = 0.5, part = [0, 2], gain = 0.5, pan = 0, bus = B.lead, ahead = 0 } = {}) {
	for (const [n, b, d] of THEME) {
		if (b < part[0] * 4 || b >= part[1] * 4) continue;
		let bb = b; if (Math.abs((b % 1) - 0.5) < 1e-6) bb += (swing - 0.5) * 2 * 0.5;      // swing the off-8th
		if (ahead && b % 1 === 0 && Math.round(b) % 2 === 1) bb -= ahead;                   // bossa: a little anticipation
		const t = t0 + (bb - part[0] * 4) * beat, dur = d * beat * 0.92;
		const out = play(m(n), dur);
		if (out.L) bus.addStereo(out.L, out.R, t, gain); else bus.addMono(out, t, gain, pan);
		MEL.push({ t, d: dur, midi: m(n), seg });
	}
}
const chordNotes = (root, q, ext = []) => { const r = ROOT[root] + 12; const third = q === 'm' ? 3 : 4; return [r, r + third, r + 7, ...ext.map((e) => r + e)]; };

// ================================================================ the arrangement (times from script.md)
const SEG = {};
const seg = (name, t0, bpm, bars) => { const beat = 60 / bpm, bar = beat * 4; SEG[name] = { t0, bpm, bars, beat, bar, t1: t0 + bars * bar }; return SEG[name]; };

// 1 · hook bed 4–16 (120): a building pulse
{ const s = seg('bed', 4.0, 120, 6);
	for (let b = 0; b < 6; b++) {
		const t0 = s.t0 + b * s.bar;
		bar16('bed', t0, s.bar, { T: 'x...x...x...x...', K: 'x.......x.......', ...(b >= 4 ? { H: 'x.x.x.x.x.x.x.x.' } : {}) }, { gains: { T: 0.18, K: 0.35, H: 0.12 }, sounds: { K: KICK_SOFT }, barIdx: b });
		if (b >= 2) { const ph = b % 2; const notes = ph === 0 ? [['A', 0, 4]] : [['F', 0, 2], ['G', 2, 2]]; for (const [r, bb, d] of notes) B.bass.addMono(I.bass(ROOT[r], d * s.beat * 0.95, { bright: 0.4 }), t0 + bb * s.beat, 0.42); }
		if (b === 5) { for (const n of chordNotes('A', 'm')) { const p = I.padNote(n, s.bar, { cutoff: 900, attack: 0.5 }); B.pad.addStereo(p.L, p.R, t0, 0.09); } roll(B.drums, t0 + 2 * s.beat, t0 + s.bar, 8, 0.15, 0.5, 'bed'); }
	}
}
// 2 · theme 16–20 (120): FM e-piano over bass + sub pulse; reverse swell into the drop
{ const s = seg('theme', 16.0, 120, 2);
	for (let b = 0; b < 2; b++) { const t0 = s.t0 + b * s.bar; bar16('theme', t0, s.bar, { T: 'x...x...x...x...', K: 'x.......x.......' }, { gains: { T: 0.12, K: 0.22 }, sounds: { K: KICK_SOFT }, barIdx: b }); }
	themeAt('theme', s.t0, s.beat, (n, d) => I.epiano(n, d, { index: 1.8 }), { gain: 0.38, bus: B.keys });
	B.bass.addMono(I.bass(ROOT.A, s.bar * 0.95, { bright: 0.4 }), s.t0, 0.26); B.bass.addMono(I.bass(ROOT.F, s.beat * 1.9, { bright: 0.4 }), s.t0 + s.bar, 0.26); B.bass.addMono(I.bass(ROOT.G, s.beat * 1.9, { bright: 0.4 }), s.t0 + s.bar + 2 * s.beat, 0.26);
	B.fx.addMono(I.noiseSweep(1.0, 400, 9000, { shape: (x) => x * x }), s.t1 - 1.0, 0.35);
}
// 3 · rock 20–32 (120), 6 bars. b1 full · b2–3 drums alone · b4–5 + bass · b6 full
const ROCK = { K: 'X.......X.......', S: '....X.......X...', H: 'x.x.x.x.x.x.x.x.' };
function rockBand(segName, t0, s, bIdx, { guitar = true, lead = true, bassOn = true, part = null } = {}) {
	if (bassOn) for (let k = 0; k < 8; k++) { const beatPos = k * 0.5, r = (bIdx % 2 === 0) ? 'A' : beatPos < 2 ? 'F' : 'G'; B.bass.addMono(I.bass(ROOT[r], s.beat * 0.45, { bright: 0.8 }), t0 + beatPos * s.beat, 0.4); }
	if (guitar) { const chs = bIdx % 2 === 0 ? [['A', 'm', 0, 4]] : [['F', '', 0, 2], ['G', '', 2, 2]];
		for (const [r, q, bb, d] of chs) for (let k = 0; k < d * 2; k++) { const st = t0 + (bb + k * 0.5) * s.beat; const g = dist(sumBufs(chordNotes(r, q).map((n, j) => gainBuf(I.guitar(n, s.beat * 0.45, { bright: 0.6, seed: j + 1 }), 0.4))), 3); B.keys.addMono(lpBuf(g, 4200), st, 0.16, (k % 2 ? 0.35 : -0.35)); }
		EV.push({ t: t0, seg: segName, row: 'G', step: 0, bar: bIdx, v: 1 }); }
	if (lead) themeAt(segName, t0 - (bIdx % 2) * s.bar, s.beat, (n, d) => lpBuf(dist(I.guitar(n, d, { bright: 0.7, sustain: 0.9985 }), 4), 4800), { part: [bIdx % 2, bIdx % 2 + 1], gain: 0.34 });
}
{ const s = seg('rock', 20.0, 120, 6);
	for (let b = 0; b < 6; b++) {
		const t0 = s.t0 + b * s.bar;
		bar16('rock', t0, s.bar, b === 0 || b === 5 ? { ...ROCK, X: 'X...............' } : ROCK, { gains: { K: 0.95, S: 0.72, H: 0.18, X: 0.36 }, barIdx: b });
		if (b === 0 || b === 5) rockBand('rock', t0, s, b);
		if (b === 3 || b === 4) rockBand('rock', t0, s, b, { guitar: false, lead: false });
		if (b === 5) roll(B.drums, t0 + 3 * s.beat, s.t1, 4, 0.35, 0.6, 'rock');
	}
	B.fx.addMono(I.subBoom(1.6, 58, 30), s.t0, 0.5);
}
// 4 · house 32–41.68 (124), 5 bars. b1 动 + off-beat 次 alone · b2 + clap + bass · b3–5 + pluck theme, pad pumping
{ const s = seg('house', 32.0, 124, 5); const kicks = [];
	for (let b = 0; b < 5; b++) {
		const t0 = s.t0 + b * s.bar;
		const pat = { K: 'X...X...X...X...', O: '..x...x...x...x.', ...(b >= 1 ? { C: '....x.......x...' } : {}), ...(b >= 2 ? { H: 'x.x.x.x.x.x.x.x.' } : {}) };
		bar16('house', t0, s.bar, pat, { gains: { K: 0.9, O: 0.2, C: 0.5, H: 0.09 }, rows: { O: 'H', C: 'S' }, barIdx: b });
		for (let k = 0; k < 4; k++) kicks.push(t0 + k * s.beat);
		if (b >= 1) for (let k = 0; k < 4; k++) { const r = b % 2 === 1 ? 'A' : k < 2 ? 'F' : 'G'; B.bass.addMono(I.bass(ROOT[r], s.beat * 0.4, { bright: 0.9 }), t0 + (k + 0.5) * s.beat, 0.45); }
		if (b >= 2) { const chs = b % 2 === 0 ? [['A', 'm', 0, 4]] : [['F', '', 0, 2], ['G', '', 2, 2]]; for (const [r, q, bb, d] of chs) for (const n of chordNotes(r, q, [12])) { const p = I.padNote(n + 12, d * s.beat, { cutoff: 2200, attack: 0.05, release: 0.3 }); B.pad.addStereo(p.L, p.R, t0 + bb * s.beat, 0.06); } }
	}
	themeAt('house', s.t0 + 2 * s.bar, s.beat, (n, d) => I.pluck(n, { decay: 0.22, cutoff: 3600 }), { part: [0, 2], gain: 0.42 });
	themeAt('house', s.t0 + 4 * s.bar - s.bar, s.beat, (n, d) => I.pluck(n, { decay: 0.22, cutoff: 3600 }), { part: [1, 2], gain: 0.42 });
	SEG.house.kicks = kicks;
	roll(B.drums, s.t1 - s.beat, s.t1, 4, 0.3, 0.5, 'house');
}
// 5 · jazz 41.68–51.68 (120, swing 2:1), 5 bars. b1 ride + hat foot alone · b2 + walking bass · b3–5 + swung e-piano theme
{ const s = seg('jazz', 41.68, 120, 5); const RIDE = ride(1, 0.9), RIDE2 = ride(2, 0.6);
	for (let b = 0; b < 5; b++) {
		const t0 = s.t0 + b * s.bar;
		bar16('jazz', t0, s.bar, { R: 'x...x.x.x...x.x.', F: '....x.......x...' }, { swing: 0.667, gains: { R: 0.55, F: 0.25 }, sounds: { R: RIDE, F: I.hat(false, 12) }, rows: { R: 'X', F: 'H' }, barIdx: b });
		if (b >= 1) { const walk = b % 2 === 1 ? [45, 48, 52, 53] : [41, 45, 43, 47]; walk.forEach((n, k) => { B.bass.addMono(I.bass(n, s.beat * 0.85, { bright: 0.35, sub: 0.8 }), t0 + k * s.beat, 0.5); EV.push({ t: t0 + k * s.beat, seg: 'jazz', row: 'B', step: k * 4, bar: b, v: 0.7 }); }); }
		if (b >= 2) { const chs = b % 2 === 0 ? [['A', 'm', 0, [10, 14]]] : [['F', '', 0, [11]], ['G', '', 2, [10]]]; for (const [r, q, bb, ext] of chs) for (const n of chordNotes(r, q, ext)) B.keys.addMono(I.epiano(n, s.beat * 0.4, { index: 1.0 }), t0 + (bb + 1.667) * s.beat, 0.12); }
	}
	themeAt('jazz', s.t0 + 2 * s.bar, s.beat, (n, d) => I.epiano(n, d, { index: 1.8 }), { swing: 0.667, gain: 0.55, bus: B.keys });
	themeAt('jazz', s.t0 + 4 * s.bar, s.beat, (n, d) => I.epiano(n, d, { index: 1.8 }), { swing: 0.667, part: [0, 1], gain: 0.55, bus: B.keys });
	roll(B.drums, s.t1 - s.beat, s.t1, 3, 0.25, 0.4, 'jazz');
}
// 6 · lo-fi 51.68–63.99 (78), 4 bars. crackle; loose drums; Rhodes 7/9 chords; muffled theme
const lofiBus = new Bus(N);
{ const s = seg('lofi', 51.68, 78, 4);
	for (let b = 0; b < 4; b++) {
		const t0 = s.t0 + b * s.bar;
		bar16('lofi', t0, s.bar, { K: 'X......x..x.....', S: '....X.......X...', H: 'x.x.x.x.x.x.x.x.' }, { swing: 0.6, lazy: 0.012, gains: { K: 0.7, S: 0.4, H: 0.07 }, sounds: { K: I.kick({ punch: 0.5, tail: 0.22 }), S: I.snare({ tone: 0.5, snap: 0.4, decay: 0.14 }) }, barIdx: b });
		const chs = b % 2 === 0 ? [['A', 'm', 0, 4, [10, 14]]] : [['F', '', 0, 2, [11, 14]], ['G', '', 2, 2, [9]]];
		for (const [r, q, bb, d, ext] of chs) for (const n of chordNotes(r, q, ext)) lofiBus.addMono(I.epiano(n, d * s.beat * 0.9, { index: 0.9, decay: 1.6 }), t0 + bb * s.beat, 0.11);
		B.bass.addMono(I.bass(b % 2 === 0 ? ROOT.A : ROOT.F, s.beat * 1.8, { bright: 0.25, sub: 0.9 }), t0, 0.42);
	}
	themeAt('lofi', s.t0 + s.bar, s.beat, (n, d) => I.epiano(n, d, { index: 1.2 }), { swing: 0.6, gain: 0.5, bus: lofiBus });
	themeAt('lofi', s.t0 + 3 * s.bar, s.beat, (n, d) => I.epiano(n, d, { index: 1.2 }), { swing: 0.6, part: [0, 1], gain: 0.5, bus: lofiBus });
	MIX.lofi(lofiBus, { wow: 1, flutter: 0.8, lowpass: 5000 }); lofiBus.mixInto(B.keys, 1.0);
	const vin = I.vinyl(s.t1 - s.t0 + 0.4, { crackle: 1.3, hiss: 0.9 }); B.fx.addMono(vin, s.t0, 0.55);
	for (let k = 0; k < 40; k++) EV.push({ t: s.t0 + k * (s.t1 - s.t0) / 40, seg: 'lofi', row: 'V', v: 0.5 });
}
// 7 · reggae one drop 63.99–76.29 (78), 4 bars. b1–2 drums alone + tick on all 4 beats · b3 + bass + skank + melodica · b4
function skank(segName, t0, s, bIdx, gain = 0.2) {
	const chs = bIdx % 2 === 0 ? [['A', 'm'], ['A', 'm']] : [['F', ''], ['G', '']];
	[1, 3].forEach((beat, k) => { const [r, q] = chs[k]; const t = t0 + beat * s.beat; const g = sumBufs(chordNotes(r, q, [12]).map((n, j) => gainBuf(I.guitar(n + 12, 0.07, { bright: 0.8, sustain: 0.99, seed: j + 3 }), 0.35))); B.keys.addMono(hpBuf(g, 500), t, gain, 0.3);
		for (const n of chordNotes(r, q)) { const o = I.padNote(n + 12, 0.12, { cutoff: 2600, attack: 0.005, release: 0.06 }); B.pad.addStereo(o.L, o.R, t, 0.05); }
		EV.push({ t, seg: segName, row: 'G', step: beat * 4, bar: bIdx, v: 1 }); });
}
{ const s = seg('reggae', 63.99, 78, 4);
	for (let b = 0; b < 4; b++) {
		const t0 = s.t0 + b * s.bar;
		bar16('reggae', t0, s.bar, { K: '........X.......', R: '........x.......', H: '..x.x.x.x.x.x.x.', ...(b < 2 ? { T: 'x...x...x...x...' } : {}) }, { swing: 0.62, gains: { K: 0.9, R: 0.45, H: 0.1, T: 0.2 }, rows: { R: 'S' }, barIdx: b });
		if (b >= 2) { skank('reggae', t0, s, b); B.bass.addMono(I.bass(b % 2 === 0 ? ROOT.A : ROOT.F, s.beat * 1.4, { bright: 0.3, sub: 1 }), t0 + 0.5 * s.beat, 0.5); B.bass.addMono(I.bass(b % 2 === 0 ? ROOT.A + 7 : ROOT.G, s.beat * 1.2, { bright: 0.3, sub: 1 }), t0 + 2.5 * s.beat, 0.45); }
	}
	themeAt('reggae', s.t0 + 2 * s.bar, s.beat, (n, d) => melodica(n, d), { gain: 0.5 });
	roll(B.drums, s.t1 - s.beat, s.t1, 3, 0.25, 0.4, 'reggae', 'S', () => I.tom(160, 0.2));
}
// 8 · quiz: reggae "steppers" 76.29–91.29 (80), 5 bars. kick on every beat (the lure); countdown ticks; reveal at b3
{ const s = seg('quiz', 76.29, 80, 5);
	for (let b = 0; b < 5; b++) {
		const t0 = s.t0 + b * s.bar;
		bar16('quiz', t0, s.bar, { K: 'X...X...X...X...', R: '........x.......', H: 'x.x.x.x.x.x.x.x.' }, { swing: 0.62, gains: { K: b < 2 ? 0.95 : 0.8, R: 0.45, H: 0.1 }, rows: { R: 'S' }, barIdx: b });
		skank('quiz', t0, s, b, b < 2 ? 0.13 : 0.3);
		B.bass.addMono(I.bass(b % 2 === 0 ? ROOT.A : ROOT.F, s.beat * 1.4, { bright: 0.3, sub: 1 }), t0 + 0.5 * s.beat, 0.45);
	}
	themeAt('quiz', s.t0, s.beat, (n, d) => { const o = I.padNote(n, d, { cutoff: 2400, attack: 0.02, release: 0.1 }); return o; }, { gain: 0.16, bus: B.pad });
	themeAt('quiz', s.t0 + 2 * s.bar, s.beat, (n, d) => melodica(n, d), { gain: 0.5 });
	[[80.04, 1.0], [80.79, 1.0], [81.54, 1.0]].forEach(([t, g], k) => { B.fx.addMono(I.woodTick(1.4 + k * 0.15), t, 0.5 * g); EV.push({ t, seg: 'quiz', row: 'COUNT', v: 3 - k }); });
	B.fx.addMono(CRASH, 82.29, 0.25);
	roll(B.drums, s.t1 - s.beat, s.t1, 4, 0.2, 0.4, 'quiz');
}
// 9 · bossa 91.29–100.52 (130), 5 bars. no kit: nylon guitar thumb bass + syncopated finger chords; breathy flute theme
{ const s = seg('bossa', 91.29, 130, 5);
	for (let b = 0; b < 5; b++) {
		const t0 = s.t0 + b * s.bar, step = s.bar / 16;
		const chs = b % 2 === 0 ? [['A', 'm', [10]], ['A', 'm', [10]]] : [['F', '', [11]], ['G', '', [10]]];
		[0, 8].forEach((st, k) => { const r = chs[k][0]; B.bass.addMono(I.guitar(ROOT[r], s.beat * 1.6, { bright: 0.3, sustain: 0.998 }), t0 + st * step, 0.85); EV.push({ t: t0 + st * step, seg: 'bossa', row: 'K', step: st, bar: b, v: 0.8 }); });
		[0, 3, 6, 10, 13].forEach((st) => { const [r, q, ext] = chs[st < 8 ? 0 : 1]; const g = sumBufs(chordNotes(r, q, ext).slice(1).map((n, j) => gainBuf(I.guitar(n + 12, 0.25, { bright: 0.35, sustain: 0.996, seed: j + 5 }), 0.3))); B.keys.addMono(g, t0 + st * step, 0.45, 0.15); EV.push({ t: t0 + st * step, seg: 'bossa', row: 'G', step: st, bar: b, v: 0.7 }); });
	}
	themeAt('bossa', s.t0 + s.bar, s.beat, (n, d) => flute(n, d), { gain: 0.5, ahead: 0.5 });
	themeAt('bossa', s.t0 + 3 * s.bar, s.beat, (n, d) => flute(n, d), { gain: 0.5, ahead: 0.5 });
}
// 10 · trap 100.52–110.81 (140, felt 70), 6 bars. 808, 打 on 9 only, 次 with rolls; bell theme
function trapBar(segName, t0, s, b, rollDense) {
	bar16(segName, t0, s.bar, { K: 'X......x..x.....', S: '........X.......' }, { gains: { K: 0.55, S: 0.6 }, sounds: { S: CLAP }, barIdx: b });
	const step = s.bar / 16;
	for (let st = 0; st < 16; st += 2) { const roll32 = rollDense && (st === 6 || st === 14); const n = roll32 ? 4 : (rollDense && st === 12 ? 3 : 1); for (let k = 0; k < n; k++) { const t = t0 + (st + k * 2 / n) * step; B.drums.addMono(HAT, t, 0.14 * (0.7 + 0.3 * k / n), 0.2); EV.push({ t, seg: segName, row: 'H', step: st, bar: b, v: 0.6 }); } }
	const r = b % 2 === 0 ? ROOT.A : ROOT.F; B.bass.addMono(I.bass808(r - 12 + 12, s.beat * 1.7, { drive: 1.3, glide: 0 }), t0, 0.55); B.bass.addMono(I.bass808(r, s.beat * 1.0, { drive: 1.3, glide: b % 2 ? 5 : 0 }), t0 + 7 * step, 0.45);
}
{ const s = seg('trap', 100.52, 140, 6);
	for (let b = 0; b < 6; b++) trapBar('trap', s.t0 + b * s.bar, s, b, b >= 2);
	themeAt('trap', s.t0 + 3 * s.bar, s.beat, (n, d) => I.bell(440 * Math.pow(2, (n - 69) / 12), 0.35, 1.6, 2), { gain: 0.42 });
	themeAt('trap', s.t0 + 5 * s.bar, s.beat, (n, d) => I.bell(440 * Math.pow(2, (n - 69) / 12), 0.35, 1.6, 2), { part: [0, 1], gain: 0.42 });
}
// 11 · metal 110.81–122.81 (160), 8 bars. normal (b1–4) · muddy chords (b5–6) · clean power chords (b7–8)
{ const s = seg('metal', 110.81, 160, 8);
	const pm = (root, dur) => lpBuf(dist(sumBufs([I.guitar(root, dur, { bright: 0.7, sustain: 0.99 }), I.guitar(root + 7, dur, { bright: 0.7, sustain: 0.99, seed: 2 })]), 9), 5000);
	for (let b = 0; b < 8; b++) {
		const t0 = s.t0 + b * s.bar, step = s.bar / 16;
		bar16('metal', t0, s.bar, { K: 'xxxxxxxxxxxxxxxx', S: '....X.......X...', ...(b % 2 === 0 ? { X: 'X...............' } : {}) }, { gains: { K: 0.36, S: 0.58, X: 0.26 }, sounds: { K: I.kick({ punch: 1.4, tail: 0.12 }) }, barIdx: b });
		const r = (b % 2 === 0 ? ROOT.A : ROOT.F) - 12 + 12, r2 = b % 2 === 0 ? ROOT.A : ROOT.G;
		if (b < 4) { for (let st = 0; st < 16; st += 2) B.keys.addMono(pm(st < 8 ? r : r2, step * 1.6), t0 + st * step, 0.22, st % 4 ? 0.3 : -0.3); }
		else { const chs = b < 6 ? (b % 2 === 0 ? [chordNotes('A', 'm', [10, 14])] : [chordNotes('F', '', [11, 14]), chordNotes('G', '', [10, 13])]) : (b % 2 === 0 ? [[45, 52, 57]] : [[41, 48, 53], [43, 50, 55]]);
			chs.forEach((ns, k) => { const dur = s.bar / chs.length; const g = lpBuf(dist(sumBufs(ns.map((n, j) => gainBuf(I.guitar(n, dur, { bright: 0.7, sustain: 0.998, seed: j + 9 }), 0.4))), 9), 5000); B.keys.addMono(g, t0 + k * dur, 0.3, -0.25); B.keys.addMono(g, t0 + k * dur + 0.012, 0.3, 0.25); EV.push({ t: t0 + k * dur, seg: 'metal', row: b < 6 ? 'MUD' : 'CLEAN', step: k * 8, bar: b, v: 1 }); }); }
	}
	for (let p = 0; p < 4; p++) themeAt('metal', s.t0 + p * 2 * s.bar, s.beat, (n, d) => lpBuf(dist(I.guitar(n, d, { bright: 0.75, sustain: 0.9985 }), 6), 5200), { gain: 0.3, pan: 0 });
	B.drums.addMono(CRASH, s.t1 - s.beat, 0.3);
}
// 12 · theme 2 122.81–128.81 (120), 3 bars: the same e-piano as 16.0 over the same pulse
{ const s = seg('theme2', 122.81, 120, 3);
	for (let b = 0; b < 3; b++) { const t0 = s.t0 + b * s.bar; bar16('theme2', t0, s.bar, { T: 'x...x...x...x...', K: 'x.......x.......' }, { gains: { T: 0.16, K: 0.34 }, sounds: { K: KICK_SOFT }, barIdx: b }); }
	themeAt('theme2', s.t0, s.beat, (n, d) => I.epiano(n, d, { index: 1.8 }), { gain: 0.62, bus: B.keys });
	B.bass.addMono(I.bass(ROOT.A, s.bar * 0.95, { bright: 0.4 }), s.t0, 0.42); B.bass.addMono(I.bass(ROOT.F, s.beat * 1.9, { bright: 0.4 }), s.t0 + s.bar, 0.42); B.bass.addMono(I.bass(ROOT.G, s.beat * 1.9, { bright: 0.4 }), s.t0 + s.bar + 2 * s.beat, 0.42);
	for (const n of chordNotes('A', 'm', [12])) { const p = I.padNote(n, 2 * 2, { cutoff: 1400, attack: 0.4 }); B.pad.addStereo(p.L, p.R, s.t0 + 2 * s.bar, 0.07); }
	roll(B.drums, s.t1 - s.beat, s.t1, 4, 0.25, 0.45, 'theme2');
}
// 13 · recap callbacks 128.81–138.96: one bar each of rock, jazz, lo-fi, reggae
{ seg('recap', 128.81, 120, 4);
	const rk = SEG.rock, jz = SEG.jazz;
	bar16('recap', 128.81, 2.0, ROCK, { gains: { K: 0.85, S: 0.62, H: 0.16 }, barIdx: 0 });
	B.bass.addMono(I.bass(ROOT.A, 1.9, { bright: 0.6 }), 128.81, 0.35);
	bar16('recap', 130.81, 2.0, { R: 'x...x.x.x...x.x.', F: '....x.......x...' }, { swing: 0.667, gains: { R: 0.55, F: 0.25 }, sounds: { R: ride(1, 0.9), F: I.hat(false, 12) }, rows: { R: 'X', F: 'H' }, barIdx: 1 });
	[45, 48, 52, 53].forEach((n, k) => B.bass.addMono(I.bass(n, 0.42, { bright: 0.35, sub: 0.8 }), 130.81 + k * 0.5, 0.5));
	const lb = 60 / 78 * 4;
	bar16('recap', 132.81, lb, { K: 'X......x..x.....', S: '....X.......X...', H: 'x.x.x.x.x.x.x.x.' }, { swing: 0.6, lazy: 0.012, gains: { K: 0.7, S: 0.4, H: 0.07 }, sounds: { K: I.kick({ punch: 0.5, tail: 0.22 }) }, barIdx: 2 });
	B.fx.addMono(I.vinyl(lb + 0.2, { crackle: 1.3 }), 132.81, 0.55); for (const n of chordNotes('A', 'm', [10, 14])) B.keys.addMono(I.epiano(n, lb * 0.9, { index: 0.9, decay: 1.6 }), 132.81, 0.1);
	bar16('recap', 135.89, lb, { K: '........X.......', R: '........x.......', H: '..x.x.x.x.x.x.x.' }, { swing: 0.62, gains: { K: 0.9, R: 0.45, H: 0.1 }, rows: { R: 'S' }, barIdx: 3 });
	skank('recap', 135.89, { beat: 60 / 78 }, 3, 0.25);
	B.bass.addMono(I.bass(ROOT.A, 1.0, { bright: 0.3, sub: 1 }), 135.89 + 0.38, 0.45);
	roll(B.drums, 138.96 - 60 / 78, 138.96, 4, 0.25, 0.45, 'recap');
}
// 14 · end card: trap in disguise 138.96–147.53 (140), 5 bars; soft e-piano theme + warm 7ths (the lure)
{ const s = seg('bonus', 138.96, 140, 5);
	for (let b = 0; b < 5; b++) {
		const t0 = s.t0 + b * s.bar; trapBar('bonus', t0, s, b, b >= 1);
		const chs = b % 2 === 0 ? [['A', 'm', [10]]] : [['F', '', [11]]]; for (const [r, q, ext] of chs) for (const n of chordNotes(r, q, ext)) B.keys.addMono(I.epiano(n + 12, s.bar * 0.9, { index: 0.8, decay: 1.8 }), t0, 0.08);
	}
	themeAt('bonus', s.t0 + s.bar, s.beat, (n, d) => I.epiano(n, d, { index: 1.2 }), { gain: 0.5, bus: B.keys });
	themeAt('bonus', s.t0 + 3 * s.bar, s.beat, (n, d) => I.epiano(n, d, { index: 1.2 }), { gain: 0.5, bus: B.keys });
}

// ---------------------------------------------------------------- room tone: a dark pad wherever the arrangement is sparse
function bedPad(t0, dur, chord = chordNotes('A', 'm'), cutoff = 700, g = 0.055) { for (const n of chord) { const p = I.padNote(n, dur, { cutoff, attack: 0.6, release: 0.8 }); B.pad.addStereo(p.L, p.R, t0, g); } }
bedPad(3.7, 10.3, chordNotes('A', 'm'), 750, 0.22);
bedPad(SEG.reggae.t0, 2 * SEG.reggae.bar, chordNotes('A', 'm'), 900, 0.18);
bedPad(135.89, 60 / 78 * 4, chordNotes('A', 'm'), 900, 0.18);

// ---------------------------------------------------------------- mix
// house pad pumps on every kick
{ const h = SEG.house; const padH = new Bus(N); for (let i = Math.round(h.t0 * SR); i < Math.round(h.t1 * SR); i++) { padH.L[i] = B.pad.L[i]; padH.R[i] = B.pad.R[i]; B.pad.L[i] = 0; B.pad.R[i] = 0; } MIX.sidechain([padH], h.kicks, { depth: 0.7, release: 0.18 }); padH.mixInto(B.pad); }
// reverb send (keys, lead, pad)
for (const [bus, g] of [[B.keys, 0.18], [B.lead, 0.22], [B.pad, 0.25]]) bus.mixInto(B.verb, g);
reverb(B.verb, { room: 0.82, damp: 0.3 });
const mixBus = new Bus(N);
const G = { drums: 1.0, bass: 0.9, keys: 1.0, lead: 1.0, pad: 1.0, fx: 0.8, verb: 0.6 };
for (const k of Object.keys(B)) B[k].mixInto(mixBus, G[k]);

// ---------------------------------------------------------------- hook scan 0–4 s: 8 slices of 0.25 s from the finished genres, one per beat
const SCAN = [['rock', 20.0], ['jazz', 45.68], ['house', 37.81], ['reggae', 70.14], ['trap', 105.66], ['metal', 113.81], ['lofi', 57.84], ['bossa', 94.98]];
SCAN.forEach(([g, src], k) => {
	const t = k * 0.5, a = Math.round(src * SR), len = Math.round(0.25 * SR), d = Math.round(t * SR);
	for (let i = 0; i < len; i++) { const env = Math.min(1, i / 120, (len - i) / 240); mixBus.L[d + i] += mixBus.L[a + i] * env; mixBus.R[d + i] += mixBus.R[a + i] * env; }
	EV.push({ t, seg: 'scan', row: 'SCAN', genre: g, v: 1 });
	const tk = I.woodTick(1); mixBus.addMono(tk, t + 0.25, 0.12);
});
// hook bed fades in a little under the last scan beats (no silence)
MIX.highpass(mixBus, 22);
MIX.fadeOut(mixBus, LEN - SEG.bonus.bar, LEN);
const out = { L: mixBus.L.subarray(0, Math.round(LEN * SR)), R: mixBus.R.subarray(0, Math.round(LEN * SR)), n: Math.round(LEN * SR) };
MIX.master(out, 0.9, 0.84, { truePeak: true, lufs: -14 });
fs.mkdirSync('out', { recursive: true });
MIX.writeWav('out/music.wav', out);
EV.sort((a, b) => a.t - b.t); MEL.sort((a, b) => a.t - b.t);
fs.writeFileSync('out/events.json', JSON.stringify({ segs: SEG, ev: EV.map((e) => ({ ...e, t: +e.t.toFixed(4) })), mel: MEL.map((e) => ({ ...e, t: +e.t.toFixed(4), d: +e.d.toFixed(3) })) }));
console.log('LUFS', MIX.lufs(out).toFixed(2), 'events', EV.length, 'notes', MEL.length);
