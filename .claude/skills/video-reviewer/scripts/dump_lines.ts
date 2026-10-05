// Print an episode's subtitle array as JSON: [[start, end, text], ...]
// usage (from the engine repo root): npx tsx <this file> src/v9/Film9.tsx LINES9 > lines.json
import path from 'path';
const [mod, name] = process.argv.slice(2);
(async () => {
  const m = await import(path.resolve(mod));
  const arr = m[name];
  if (!Array.isArray(arr)) { console.error(`export ${name} not found in ${mod}`); process.exit(1); }
  console.log(JSON.stringify(arr.map((l: any[]) => [Number(l[0].toFixed(3)), Number(l[1].toFixed(3)), String(l[2])])));
})();
