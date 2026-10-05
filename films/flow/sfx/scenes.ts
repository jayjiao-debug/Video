/* Writes scenes.json (scene windows for scripts/finish.py) from the SCENES table.
     npx tsx sfx/scenes.ts */
import fs from 'fs';
import {SCENES} from '../src/Film';

fs.writeFileSync('scenes.json', JSON.stringify({title: '心流', music: 'out/mix_sfx.wav', scenes: SCENES.map(([n, a, z]) => [n, +a.toFixed(3), +z.toFixed(3)])}, null, 1));
console.log(SCENES.length, 'scenes');
