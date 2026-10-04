import React from 'react';
import {useCurrentFrame} from 'remotion';
import {ease, prog, useLayout, useTimeline} from '../lib/context';
import {JUNO} from '../brand/identity';
import {color, font} from '../lib/theme';

/** Series badge (a corner mark in landscape; badge + chapter pips in vertical), the scene kicker, and the citation line. */
export const Chrome: React.FC = () => {
	const f = useCurrentFrame();
	const tl = useTimeline();
	const L = useLayout();
	const idx = Math.max(0, tl.scenes.findIndex((s) => f >= s.from && f < s.from + s.duration));
	const scene = tl.scenes[idx];
	const local = f - scene.from;
	const sceneOut = prog(local, scene.duration - 10, 10, ease.in);
	// scenes can keep the frame clean until their first line (e.g. while a title card plays)
	const quiet = scene.props.quietLead ? 1 - prog(local, (scene.lines[0]?.from ?? 0) - 12, 12) : 0;
	// a scene can hand over to a second kicker/cite at one of its lines (props.swap = {line, kicker, cite})
	const swap = scene.props.swap as {line: number; kicker?: string; cite?: string} | undefined;
	const swapAt = swap ? (scene.lines[swap.line]?.from ?? 1e9) - 14 : 1e9;
	const swapped = local >= swapAt;
	const swapFade = swap ? Math.abs(prog(local, swapAt - 10, 20) * 2 - 1) : 1; // dips to 0 at the hand-over
	const kicker = swapped && swap?.kicker ? swap.kicker : scene.kicker;
	const cite = swapped && swap?.cite ? swap.cite : scene.cite;
	const landscape = L.w > L.h;
	const badge = prog(f, 20, 30) * (1 - prog(f, tl.durationInFrames - 150, 20)) * (1 - quiet);

	return (
		<>
			{landscape ? (
				// a quiet corner mark: top-right keeps clear of Douyin's own download watermark (top-left)
				<div
					style={{
						position: 'absolute',
						top: L.seriesY,
						right: 56,
						opacity: 0.55 * badge,
						fontFamily: font.sans,
						fontWeight: 500,
						fontSize: 20,
						letterSpacing: '0.3em',
						color: color.dim,
					}}
				>
					<span style={{color: color.gold}}>◆ </span>
					{JUNO.mark}
				</div>
			) : (
				<>
					<div
						style={{
							position: 'absolute',
							top: L.seriesY,
							width: L.w,
							textAlign: 'center',
							opacity: badge,
							fontFamily: font.sans,
							fontWeight: 500,
							fontSize: 26,
							letterSpacing: '0.42em',
							color: color.dim,
						}}
					>
						<span style={{color: color.gold}}>◆ </span>
						{JUNO.mark}
						<span style={{color: color.faint}}>　|　</span>
						《{tl.title}》
					</div>
					<div style={{position: 'absolute', top: L.seriesY + 48, width: L.w, display: 'flex', justifyContent: 'center', gap: 10, opacity: badge}}>
						{tl.scenes.map((s, i) => (
							<div
								key={s.id}
								style={{
									width: i === idx ? 34 : 8,
									height: 4,
									borderRadius: 2,
									background: i <= idx ? color.gold : color.faint,
									opacity: i === idx ? 1 : i < idx ? 0.55 : 0.4,
								}}
							/>
						))}
					</div>
				</>
			)}
			{kicker ? (
				<div
					style={{
						position: 'absolute',
						top: L.kickerY,
						width: L.w,
						textAlign: 'center',
						fontFamily: font.sans,
						fontSize: 27,
						fontWeight: 500,
						letterSpacing: '0.32em',
						color: color.gold,
						textShadow: '0 2px 14px rgba(0,0,0,0.75)',
						opacity: 0.85 * prog(local, 6, 20) * (1 - sceneOut) * (1 - quiet) * swapFade,
						transform: `translateY(${(1 - prog(local, 6, 24)) * 10}px)`,
					}}
				>
					<span style={{display: 'inline-block', width: 70 * prog(local, 10, 30), height: 1, background: color.goldDeep, verticalAlign: 'middle', marginRight: 22}} />
					{kicker}
					<span style={{display: 'inline-block', width: 70 * prog(local, 10, 30), height: 1, background: color.goldDeep, verticalAlign: 'middle', marginLeft: 14}} />
				</div>
			) : null}
			{cite ? (
				<div
					style={{
						position: 'absolute',
						top: L.citeY,
						width: L.w,
						textAlign: 'center',
						fontFamily: font.sans,
						fontSize: 22,
						letterSpacing: '0.08em',
						color: color.faint,
						opacity: prog(local, (scene.lines[0]?.from ?? 0) + 20, 25) * (1 - sceneOut) * swapFade,
					}}
				>
					{cite}
				</div>
			) : null}
		</>
	);
};
