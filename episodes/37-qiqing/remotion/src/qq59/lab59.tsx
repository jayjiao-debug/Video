import React from 'react';
import {Composition, registerRoot, useCurrentFrame} from 'remotion';
import {STAGE, Walker, walkG, PZ, Rim, Look59, CartKind} from './figure59';
import {Earth, Space, routeAt, headingAt} from './globe59';
/* scratch lab (delete before hand-off): the stage looks in a row */
const RIM: Rim[] = [{c: '#ffc58a', o: 0.55, dx: -2.4, dy: -1.4}, {c: '#8094c4', o: 0.25, dx: 2.0, dy: -1.0}];
const Lab: React.FC = () => {
	const f = useCurrentFrame(), t = f / 30;
	const row: [Look59, CartKind | undefined, string][] = [[STAGE.k1998, 'hivis', '1998'], [STAGE.kAmericas, 'box', 'Am'], [STAGE.kJungle, undefined, 'jungle'], [STAGE.kIce, undefined, 'ice'], [STAGE.kRussia, 'orange', 'ru'], [STAGE.k2012, 'orange', '2012'], [STAGE.kSwim, undefined, 'swim'], [STAGE.k2026, undefined, '2026'], [STAGE.mum, undefined, 'mum']];
	if (f >= 70) { const p = [0.1, 0.49, 0.2, 0.3][f - 70], c = routeAt(p), hd = headingAt(p, 0.04);
		return <svg width={1920} height={1080}><Space id="ls" /><Earth id="le" v={{lon: c[0], lat: c[1], alt: [0.8, 0.8, 0.25, 0.8][f - 70], tilt: 32, roll: hd, cx: 960, cy: 760}} route={{p0: 0, p1: p, head: p}} />
			<text x={40} y={60} fill="#fff" fontSize={30}>{`p ${p} hd ${hd.toFixed(1)}`}</text></svg>; }
	if (f >= 30) { const set = f < 60 ? row.slice(0, 5) : row.slice(5);
		return <svg width={1920} height={1080} style={{background: '#4a4e5e'}}>{set.map(([lk, c, n], i) => <Walker key={n} x={240 + i * 380} ground={1440} h={1400} pose={PZ.stand} look={lk} rims={RIM} flip={n === 'mum'} />)}</svg>; }
	return <svg width={1920} height={1080} style={{background: '#4a4e5e'}}>
		<rect x={0} y={700} width={1920} height={380} fill="#2a2a30" />
		{row.slice(0, 5).map(([lk, c, n], i) => { const w = walkG(t + i * 0.3, 0, 0, 300); const x = 140 + i * 230;
			return <g key={n}><Walker x={x} ground={640} h={200} pose={w.pose} look={lk} rims={RIM} cart={c} dist={w.dist} sled={lk === STAGE.kIce ? 0.2 : undefined} poles={lk === STAGE.kIce} machete={lk === STAGE.kJungle} />
				<text x={x} y={690} fill="#fff" fontSize={22}>{n}</text></g>; })}
		{row.slice(5).map(([lk, c, n], i) => { const w = walkG(t + i * 0.3, 0, 0, 300); const x = 200 + i * 260;
			return <g key={n}><Walker x={x} ground={1040} h={220} pose={i >= 2 ? PZ.stand : w.pose} look={lk} rims={RIM} cart={c} dist={w.dist} flip={n === 'mum'} /><text x={x} y={1070} fill="#fff" fontSize={22}>{n}</text></g>; })}
	</svg>;
};
registerRoot(() => <Composition id="LAB59" component={Lab} durationInFrames={90} fps={30} width={1920} height={1080} />);
