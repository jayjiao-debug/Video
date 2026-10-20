// Reads render.json and prints GitHub Actions outputs: a matrix of frame ranges.
import { readFileSync } from 'node:fs';

const job = JSON.parse(readFileSync('render.json', 'utf8'));
const { composition, start = 0, end, chunks = 12, output } = job;
if (!composition || end === undefined || !output) {
  throw new Error('render.json needs composition, end (last frame, inclusive) and output');
}
const total = end - start + 1;
const n = Math.max(1, Math.min(chunks, total));
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
