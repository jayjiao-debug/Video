/* Sound events for 《没有指挥》, computed from the same models the picture uses, so every clap, tick
   and beat lands exactly where it is seen. Writes out/sfx_events.json for sfx/synth.py.
     npx tsx sfx/events.ts */
import fs from 'fs';
import {b, beatAt, mulberry} from '../src/lib';
import {ANSWER, OPEN} from '../src/scenes/s9';
import {METRO} from '../src/scenes/s56';
import {people, swayMM} from '../src/scenes/s8';

const DT = 0.002;
type Ev = [number, number, number]; // time, gain, pan (−1..1)
const crossings = (ph: (t: number) => number, t0: number, t1: number, offset = 0) => {
  const out: number[] = [];
  let prev = Math.floor((ph(t0) - offset) / (2 * Math.PI));
  for (let t = t0 + DT; t < t1; t += DT) {
    const k = Math.floor((ph(t) - offset) / (2 * Math.PI));
    if (k !== prev) out.push(t);
    prev = k;
  }
  return out;
};

// applause: one clap each time a seat's phase passes 0 (a subset of seats is plenty for the ear)
const claps: Ev[] = [];
for (const [th, t0, t1] of [
  [OPEN, 0.15, b(31) + 0.3],
  [ANSWER, b(241), b(273)],
] as const) {
  const seats = th.seats;
  for (let i = 0; i < seats.length; i += 2) {
    const pan = (seats[i].x - 960) / 960;
    for (const t of crossings((t) => th.phaseOf(i, t), t0, t1)) claps.push([t, 1, pan]);
  }
}
// title hit: the whole hall's clap on b31 is already in; S1 fades its claps out after b31
// metronomes: a tick at each end of the swing (θ = π/2 + kπ)
const met: Ev[] = [];
for (let i = 0; i < METRO.N; i++) {
  const pan = ((i % 8) - 3.5) / 4;
  const ph = (t: number) => 2 * METRO.theta(i, t);
  for (const t of crossings(ph, METRO.T0 + 0.6, b(177.5), Math.PI)) met.push([t, 1, pan]);
}
// Huygens' clocks: escapement tick at each end of each pendulum's swing; the second clock half a cycle
// behind plus the knock (same formula as the picture)
const kick = b(112.5);
const dOf = (T: number) => (T < kick ? 0 : 1.7 * Math.exp(-Math.max(0, T - kick - 0.4) / 1.4));
const clock: Ev[] = [];
for (const [which, pan] of [
  [0, -0.45],
  [1, 0.45],
] as const) {
  const ph = (t: number) => 2 * (Math.PI * beatAt(t) + (which ? Math.PI + dOf(t) : 0));
  for (const t of crossings(ph, b(96.3), b(127.6), Math.PI)) clock.push([t, which ? 0.9 : 1, pan]);
}
// heart: lub (QRS) and dub, every two beats, growing in as the cells lock (b189 → b194)
const heart: Ev[] = [];
for (let k = 0; k < 20; k++) {
  const beat = 185 + 2 * k + 0.44;
  if (beat > 209) break;
  const t = b(beat);
  const s = Math.max(0, Math.min(1, (t - b(189)) / (b(194) - b(189))));
  if (s > 0.05) {
    heart.push([t, s, 0]);
    heart.push([t + 0.16, 0.7 * s, 0]);
  }
}
// the bridge: footsteps, denser with the crowd; a creak level that follows the sway
const steps: Ev[] = [];
const r = mulberry(5);
for (let t = b(209.5); t < b(241); t += 0.01) {
  const rate = Math.min(30, people(t) / 25); // steps per second we let the ear hear
  if (r() < rate * 0.01) steps.push([t, 0.5 + r() * 0.5, r() * 1.6 - 0.8]);
}
const creak: [number, number][] = [];
for (let t = b(209); t < b(241.5); t += 1 / 30) creak.push([t, swayMM(t) / 70]);
// soft whooshes for the two blinks in 1917
const whoosh = [b(49) - 0.12, b(51) - 0.12];
// night ambience windows (crickets + water): the riverbank scenes
const night: [number, number][] = [
  [b(39), b(64)],
  [b(273), b(311) + 0.3],
];
fs.mkdirSync('out', {recursive: true});
fs.writeFileSync('out/sfx_events.json', JSON.stringify({claps, met, clock, heart, steps, creak, whoosh, night}));
console.log({claps: claps.length, met: met.length, clock: clock.length, heart: heart.length, steps: steps.length});
