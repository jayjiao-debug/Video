/* Writes scenes.json (scene windows for scripts/finish.py) from the SCENES table. Music only (v2 has no SFX).
     npx tsx sfx/scenes.ts */
import fs from 'fs';
import {SCENES} from '../src/v2/Film2';

fs.writeFileSync('scenes.json', JSON.stringify({title: '心流', music: 'public/bgm.mp3', scenes: SCENES.map(([n, a, z]) => [n, +a.toFixed(3), +z.toFixed(3)])}, null, 1));
console.log(SCENES.length, 'scenes');
