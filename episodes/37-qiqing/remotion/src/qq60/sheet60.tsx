import React from 'react';
import {AbsoluteFill} from 'remotion';
import {God, CAST, POSES, Ammit, Cast, Pose, reach, wristTo, solve} from './rig60';
import {Balance, balanceGeo, Throne} from './props60';
import {TombWall, WallGrain, CartoucheSub, Seal60, W, H, KAI, SERIF, useFonts60} from './wall60';
import {thothPose, osirisPose, mummyHands, STILL} from './scene60';
import {PAL, ap, V} from './geo60';

/* ep60 rig sheet in look A paint: the same skeleton dressed as five gods + the deceased (rest pose), one god pulled apart with
   every pivot marked, the same god assembled with its bone chain, and the pose variants (Anubis kneeling at the plumb, Thoth
   writing, Isis spreading her wings, Osiris enthroned) + Ammit's own small rig. */
const Label: React.FC<{x: number; y: number; zh: string; en?: string; size?: number}> = ({x, y, zh, en, size = 27}) => <div style={{position: 'absolute', left: x - 200, top: y, width: 400, textAlign: 'center', color: PAL.ink}}>
	<div style={{fontFamily: KAI, fontWeight: 700, fontSize: size, letterSpacing: '0.06em'}}>{zh}</div>
	{en && <div style={{fontFamily: SERIF, fontSize: 17, opacity: 0.7, marginTop: 1, letterSpacing: '0.04em'}}>{en}</div>}
</div>;
const ISIS_REST: Pose = {...POSES.rest, bs: 22, be: 10, fs: 34, fe: 8, bw: -10, fw: -10, rt: -6, at: 8};
export const RigSheet: React.FC = () => {
	useFonts60('一套骨架五位神阿努比斯托特荷鲁斯奥西里斯伊西斯阿尼亡者拆开的部件与枢轴组装同一骨架跪姿扶秤书写展翼王座米特独立小骨架红点关节蓝点二级动作挂点假发垂片发带牛尾腰带连枷羽毛下颌尾巴重心·、：（）');
	const GA = 588, GB = 1000, s = 13.5, sb = 12.4;
	const rest: [Cast, number, string, string, Pose?][] = [[CAST.anubis, 200, '阿努比斯', 'Anubis'], [CAST.thoth, 375, '托特', 'Thoth'], [CAST.horus, 550, '荷鲁斯', 'Horus'],
		[CAST.osiris, 725, '奥西里斯', 'Osiris', mummyHands({...POSES.mummy})], [CAST.isis, 915, '伊西斯', 'Isis', ISIS_REST], [CAST.ani, 1095, '阿尼（亡者）', 'Ani, the deceased']];
	// Anubis kneeling at a small balance (plumb steadied by IK)
	const postX = 390, bal = balanceGeo({tilt: 2, plumb: -0.5}), bob: V = [postX + bal.bob[0] * sb, GB + bal.bob[1] * sb], ax = postX - 5.8 * sb;
	let kn: Pose = {...POSES.kneel, rt: -12, rk: 98, rf: 38, at: 122, ak: 122, lean: 5, head: -3, neck: 3};
	kn = wristTo(reach(kn, 'f', [(bob[0] - ax) / sb - 1.05, (bob[1] - GB) / sb + 0.75]), 'f', 128);
	const knee = ap(solve(kn).aS, [0, 0]); kn = wristTo(reach(kn, 'b', [knee[0] - 0.7, knee[1] - 0.95]), 'b', 96);
	const th = thothPose({...STILL, thoth: {...STILL.thoth, head: 4}});
	return <AbsoluteFill style={{background: PAL.plaster}}>
		<svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0}}>
			<TombWall gy={H} ground={false} />
			{/* row A: rest pose, one skeleton, head/regalia swaps */}
			<line x1={130} x2={1200} y1={GA + 2} y2={GA + 2} stroke={PAL.ink} strokeWidth={3} />
			{rest.map(([cst, x, , , p], i) => <God key={i} id={`r${i}`} cast={cst} pose={p ?? POSES.rest} x={x} y={GA} s={s} />)}
			{/* exploded + assembled skeleton */}
			<rect x={1238} y={140} width={634} height={560} rx={10} fill="#F3E6C6" stroke={PAL.ink} strokeWidth={2} opacity={0.85} />
			<God id="ex" cast={CAST.horus} pose={POSES.rest} x={1440} y={532} s={s * 0.9} explode={0.34} pivots hide={{props: true}} />
			<God id="as" cast={CAST.horus} pose={POSES.rest} x={1735} y={532} s={s * 0.9} pivots hide={{props: true}} />
			<line x1={130} x2={1800} y1={GB + 2} y2={GB + 2} stroke={PAL.ink} strokeWidth={3} />
			{/* row B: pose variants */}
			<Balance p={{tilt: 2, plumb: -0.5}} x={postX} y={GB} s={sb} />
			<God id="kn" cast={{...CAST.anubis, bHand: 'open', fHand: 'open'}} pose={kn} x={ax} y={GB} s={sb} pivots hide={{props: true}} />
			<God id="wr" cast={CAST.thoth} pose={th.p} x={640} y={GB} s={s} bProp="palette" fProp="pen" paletteA={th.paletteA} pivots />
			<God id="pr" cast={CAST.isis} pose={POSES.protect} x={890} y={GB} s={s} pivots />
			<Throne x={1110} y={GB} s={s} />
			<God id="os" cast={CAST.osiris} pose={osirisPose(STILL)} x={1110 + 3.4 * s} y={GB} s={s} face={-1} />
			<Ammit pose={{lean: 3, neck: 4, jaw: 22, tail: 8, breathe: 1}} x={1560} y={GB} s={s * 1.05} face={-1} pivots />
			<WallGrain />
		</svg>
		<CartoucheSub text="一套骨架，[五位神]" />
		{rest.map(([, x, zh, en], i) => <Label key={i} x={x + (i === 3 ? -5 : 0)} y={GA + 8} zh={zh} en={en} size={24} />)}
		<Label x={1440} y={150} zh="拆开的部件与枢轴" en="exploded parts · pivots" size={24} />
		<Label x={1735} y={150} zh="组装 · 同一骨架" en="assembled · bone chain" size={24} />
		<div style={{position: 'absolute', left: 1262, top: 590, width: 600, color: PAL.ink, fontFamily: KAI, fontWeight: 700, fontSize: 21, lineHeight: 1.5}}>
			<span style={{color: PAL.red}}>●</span> 红点：关节枢轴（髋、颈、头、肩、肘、腕、膝、踝）<br />
			<span style={{color: PAL.blue}}>●</span> 蓝点：二级动作挂点（假发垂片、发带）<br />
			<span style={{opacity: 0.8}}>二级动作：假发垂片、发带、牛尾、腰带、连枷、羽毛</span>
		</div>
		<Label x={330} y={GB + 12} zh="阿努比斯 · 跪姿扶秤" en="kneeling, IK hand on the plumb" size={22} />
		<Label x={640} y={GB + 12} zh="托特 · 书写" en="pen tip IK on the palette" size={22} />
		<Label x={890} y={GB + 12} zh="伊西斯 · 展翼" en="wings hang from the arms" size={22} />
		<Label x={1180} y={GB + 12} zh="奥西里斯 · 王座" en="enthroned, crook & flail" size={22} />
		<Label x={1520} y={GB + 12} zh="阿米特 · 独立小骨架" en="hip · neck · jaw · tail · paws" size={22} />
		<Seal60 />
	</AbsoluteFill>;
};
