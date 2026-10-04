// Asset fetcher. Reads request.json, writes everything into out/, plus out/credits.json and out/log.txt.
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const req = JSON.parse(fs.readFileSync('request.json', 'utf8'));
const OUT = 'out';
fs.mkdirSync(OUT, { recursive: true });
const credits = [];
const log = (...a) => { const s = a.join(' '); console.log(s); fs.appendFileSync(path.join(OUT, 'log.txt'), s + '\n'); };
const getJSON = async (url, headers = {}) => {
  const r = await fetch(url, { headers: { 'User-Agent': 'juno-asset-farm', ...headers } });
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  return r.json();
};
const download = async (url, file, headers = {}) => {
  const r = await fetch(url, { headers: { 'User-Agent': 'juno-asset-farm', ...headers } });
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, Buffer.from(await r.arrayBuffer()));
  log('  saved', file, (fs.statSync(file).size / 1e6).toFixed(1), 'MB');
};
const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 48);
const optimize = (file) => {
  // shrink textures, drop unused data; keep geometry uncompressed so three.js needs no extra decoders
  const tmp = file.replace(/\.glb$/, '.opt.glb');
  try {
    execSync(`npx -y @gltf-transform/cli@4 optimize "${file}" "${tmp}" --compress false --texture-compress webp --texture-size 2048`, { stdio: 'inherit' });
    log('  optimized', (fs.statSync(file).size / 1e6).toFixed(1), '->', (fs.statSync(tmp).size / 1e6).toFixed(1), 'MB');
    fs.renameSync(tmp, file);
  } catch (e) { log('  optimize failed, keeping original:', e.message); }
};

for (const it of req.items) {
  try {
    if (it.type === 'polyhaven') {
      log(`polyhaven ${it.id}`);
      const files = await getJSON(`https://api.polyhaven.com/files/${it.id}`);
      const info = await getJSON(`https://api.polyhaven.com/info/${it.id}`);
      const res = it.res || '2k';
      if (files.hdri) {
        const fmt = it.format || 'hdr';
        await download(files.hdri[res][fmt].url, `${OUT}/polyhaven/${it.id}_${res}.${fmt}`);
        if (files.tonemapped) await download(files.tonemapped.url, `${OUT}/polyhaven/${it.id}_preview.jpg`);
      } else if (files.gltf) {
        const g = files.gltf[res].gltf;
        await download(g.url, `${OUT}/polyhaven/${it.id}/${it.id}.gltf`);
        for (const [rel, f] of Object.entries(g.include || {})) await download(f.url, `${OUT}/polyhaven/${it.id}/${rel}`);
      } else {
        for (const map of it.maps || ['Diffuse', 'nor_gl', 'Rough']) if (files[map]) await download(files[map][res].jpg.url, `${OUT}/polyhaven/${it.id}_${map}_${res}.jpg`);
      }
      credits.push({ source: 'Poly Haven', id: it.id, name: info.name, authors: Object.keys(info.authors || {}), license: 'CC0' });
    } else if (it.type === 'sketchfab-search') {
      log(`sketchfab search "${it.q}"`);
      const p = new URLSearchParams({ type: 'models', q: it.q, downloadable: 'true', count: String(it.count || 24), sort_by: it.sort || '-likeCount' });
      if (it.license) p.set('license', it.license);
      if (it.maxFaces) p.set('max_face_count', String(it.maxFaces));
      const r = await getJSON(`https://api.sketchfab.com/v3/search?${p}`);
      const dir = `${OUT}/search/${slug(it.q)}`;
      const rows = [];
      let n = 0;
      for (const m of r.results || []) {
        n++;
        const imgs = (m.thumbnails?.images || []).sort((a, b) => Math.abs(a.width - 480) - Math.abs(b.width - 480));
        const thumb = imgs[0]?.url;
        const file = `${String(n).padStart(2, '0')}_${m.uid}.jpg`;
        if (thumb) await download(thumb, `${dir}/${file}`).catch((e) => log('  thumb failed', e.message));
        rows.push({ n, uid: m.uid, name: m.name, author: m.user?.username, license: m.license?.label || m.license?.slug,
          faces: m.faceCount, vertices: m.vertexCount, likes: m.likeCount, views: m.viewCount, animated: m.animationCount > 0, url: m.viewerUrl, thumb: file });
      }
      fs.writeFileSync(`${dir}/results.json`, JSON.stringify(rows, null, 2));
    } else if (it.type === 'sketchfab') {
      log(`sketchfab model ${it.uid}`);
      if (!process.env.SKETCHFAB_TOKEN) throw new Error('SKETCHFAB_TOKEN secret is not set');
      const meta = await getJSON(`https://api.sketchfab.com/v3/models/${it.uid}`);
      const auth = { Authorization: `Token ${process.env.SKETCHFAB_TOKEN}` };
      const d = await getJSON(`https://api.sketchfab.com/v3/models/${it.uid}/download`, auth);
      const name = it.name || slug(meta.name);
      if (d.glb) {
        await download(d.glb.url, `${OUT}/models/${name}.glb`);
        if (it.optimize !== false) optimize(`${OUT}/models/${name}.glb`);
      } else if (d.gltf) {
        await download(d.gltf.url, `${OUT}/models/${name}.zip`);
      } else throw new Error('no glb/gltf archive offered');
      credits.push({ source: 'Sketchfab', uid: it.uid, name: meta.name, author: meta.user?.displayName || meta.user?.username,
        authorUrl: meta.user?.profileUrl, license: meta.license?.label, url: meta.viewerUrl });
    } else if (it.type === 'url') {
      log(`url ${it.url}`);
      await download(it.url, `${OUT}/files/${it.name || path.basename(new URL(it.url).pathname)}`);
      credits.push({ source: it.url, license: it.license || 'unknown' });
    }
  } catch (e) {
    log(`  FAILED: ${e.message}`);
  }
}
fs.writeFileSync(`${OUT}/credits.json`, JSON.stringify(credits, null, 2));
log('done');
