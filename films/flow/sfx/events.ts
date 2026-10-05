/* Sound events for the flow film, from the same timings the picture uses. Writes out/sfx_events.json.
     npx tsx sfx/events.ts */
import fs from 'fs';
import {b} from '../src/lib';
import {minuteS1, minuteS10} from '../src/scenes/clock';
import {BEEPS} from '../src/scenes/s56';
import {NOTES} from '../src/scenes/s7';
import {RALLY} from '../src/scenes/s9';

type Ev = [number, number, number];
// clock ticks: each time the minute hand passes one of the 60 minute marks, capped so it stays a texture
const ticks: Ev[] = [];
const scan = (f: (t: number) => number, t0: number, t1: number, T0: number, gain: number) => {
  let prev = Math.floor((f(0) / (Math.PI * 2)) * 60);
  let last = -1;
  for (let t = 0; t < t1 - t0; t += 0.002) {
    const k = Math.floor((f(t) / (Math.PI * 2)) * 60);
    if (k !== prev && T0 + t - last > 0.07) {
      ticks.push([T0 + t, gain, -0.3]);
      last = T0 + t;
    }
    prev = k;
  }
};
scan(minuteS1, 0.3, b(30.8), 0.3, 1);
scan(minuteS10, b(273.5), b(305), b(273.5), 0.9);
// pager beeps: one per flying point (a sample of beeps, as on screen)
const beeps: Ev[] = BEEPS.map((e) => [e.t, 1, ((e.who % 13) - 6) / 8]);
// piano notes: the improvised keys
const notes: [number, number][] = NOTES.filter((n) => n.t > b(186) && n.t < b(208.5)).map((n) => [n.t, n.k]);
// tennis: a hit at each end of the rally
const hits: Ev[] = RALLY.filter((t) => t < b(256.5)).map((t, k) => [t, 1, k % 2 ? 0.5 : -0.5]);
// chess: a soft click each time the knight lands
const clicks: Ev[] = Array.from({length: 15}, (_, k) => [b(259) + ((k + 1) * (b(271) - b(259))) / 15, 1, 0]);
fs.mkdirSync('out', {recursive: true});
fs.writeFileSync('out/sfx_events.json', JSON.stringify({ticks, beeps, notes, hits, clicks}));
console.log({ticks: ticks.length, beeps: beeps.length, notes: notes.length, hits: hits.length, clicks: clicks.length});
