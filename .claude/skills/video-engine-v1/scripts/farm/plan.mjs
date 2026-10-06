// Reads render.json and prints GitHub Actions outputs: a matrix of frame ranges.
import { readFileSync } from 'node:fs';

const job = JSON.parse(readFileSync('render.json', 'utf8'));
const { composition, start = 0, end, chunks, output } = job;
if (!composition || end === undefined || !output) {
  throw new Error('render.json needs composition, end (last frame, inclusive) and output');
}
const total = end - start + 1;
// 20 = free-plan parallel runners. Small jobs (fixes) still split: ~24 frames per chunk minimum.
const auto = Math.max(1, Math.min(20, Math.ceil(total / 24)));
const n = Math.max(1, Math.min(chunks || auto, total, 20));
const size = Math.ceil(total / n);
const list = [];
for (let i = 0; i < n; i++) {
  const a = start + i * size;
  const b = Math.min(end, a + size - 1);
  if (a > end) break;
  list.push({ i: String(i).padStart(3, '0'), a, b, comp: composition });
}
console.log(`matrix=${JSON.stringify(list)}`);
console.log(`name=${output}`);
console.log(`id=${job.id ?? output}`);
