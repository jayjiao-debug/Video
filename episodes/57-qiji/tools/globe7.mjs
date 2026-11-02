// borderless globe paths for the ep57 key frames (land only, world-atlas 110m)
import {geoOrthographic, geoPath, geoGraticule} from '/home/claude/video/episodes/37-qiqing/remotion/node_modules/d3-geo/src/index.js';
import {feature} from '/home/claude/video/episodes/37-qiqing/remotion/node_modules/topojson-client/src/index.js';
import {createRequire} from 'node:module';
import fs from 'node:fs';
const require = createRequire('/home/claude/video/episodes/37-qiqing/remotion/node_modules/../package.json');
const land = feature(require('world-atlas/land-110m.json'), require('world-atlas/land-110m.json').objects.land);
const P = {gw: [116.02, 40.36], ci: [-88.568, 20.684], mp: [-72.545, -13.163], cr: [-43.211, -22.952], co: [12.492, 41.89], pe: [35.444, 30.329], tj: [78.042, 27.175], gz: [31.134, 29.979]};
const route = ['gw', 'ci', 'mp', 'cr', 'co', 'pe', 'tj', 'gw'];
const out = {};
function view(name, rot, r, cx, cy, legs) {
	const pr = geoOrthographic().rotate(rot).scale(r).translate([cx, cy]).clipAngle(90).precision(0.2);
	const prAll = geoOrthographic().rotate(rot).scale(r).translate([cx, cy]).clipAngle(null).precision(0.2);
	const path = geoPath(pr), pathAll = geoPath(prAll);
	const o = {land: path(land), grat: path(geoGraticule().step([30, 30])()), r, cx, cy, pts: {}};
	for (const [k, ll] of Object.entries(P)) { const p = pr(ll); const vis = !!p && path({type: 'Point', coordinates: ll}) !== null; o.pts[k] = {xy: prAll(ll), vis}; }
	const line = (ks) => ({type: 'LineString', coordinates: ks.map((k) => P[k])});
	o.legs = legs.map(([a, b]) => ({front: path(line([a, b])), all: pathAll(line([a, b]))}));
	o.loopFront = path(line(route)); o.loopAll = pathAll(line(route));
	o.eqFront = path({type: 'LineString', coordinates: Array.from({length: 361}, (_, i) => [i - 180, 0])});
	o.eqAll = pathAll({type: 'LineString', coordinates: Array.from({length: 361}, (_, i) => [i - 180, 0])});
	out[name] = o;
}
view('pacific', [165, -10, 0], 430, 960, 600, [['gw', 'ci']]);
view('atlantic', [30, -8, 0], 430, 1010, 600, [['cr', 'co']]);
view('asia', [-98, -30, 0], 430, 1010, 600, [['tj', 'gw']]);
view('egypt', [-25, -28, 0], 430, 960, 600, [['co', 'pe']]);
view('reveal', [40, -20, 0], 380, 960, 610, []);
fs.writeFileSync(process.argv[2], JSON.stringify(out));
console.log('ok', Object.keys(out));
