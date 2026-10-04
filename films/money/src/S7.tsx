import React, { useMemo } from 'react';
import * as THREE from 'three';
import { AbsoluteFill, Img, staticFile } from 'remotion';
import { b, prog, easeOut, easeIn, rnd, DROP, EN, ZH, GOLD, INK, type Key } from './lib';
import { Subs, SubBand, Chapter, type Line } from './ui';
import { softTex } from './kit';
import { ChainSet, BILL_C, BAR_C } from './S6';

/* S7, the drop (81.38 s → b199): 15 August 1971, Nixon closes the gold window (Federal Reserve History).
   On the drop the chain snaps: the bar falls away into the dark, the note is left floating with nothing behind it.
   Then the note alone; then the people who accept it appear around it as points of light, each tied to it by a thread. */
export const S7_IN = DROP, S7_OUT = b(199) + 0.3;

export const LINES_S7: Line[] = [
  [DROP + 0.02, b(169) - 0.1, '美元，[不再兑换黄金]。', 'The dollar would no longer be exchanged for gold.'],
  [b(169) + 0.06, b(180) - 0.1, '从那天起，钱的背后，什么都没有了。', 'From that day on, there was nothing behind money.'],
  [b(180) + 0.06, b(190) - 0.1, '一张纸能换多少东西，全看大家信不信它。', 'What a slip of paper buys depends only on whether people trust it.'],
  [b(190) + 0.06, b(199) - 0.1, '这就是今天的“法定货币”：靠信用，不靠金子。', "That's today's fiat money: backed by trust, not by gold."],
];

const KEYS: Key[] = [
  [DROP, [0.012, 0.012, 0.16], [0.012, -0.012, 0]],
  [DROP + 0.25, [0.0, 0.02, 0.3], [0.0, -0.02, 0]],
  [b(169), [-0.08, 0.03, 0.36], [-0.12, 0.02, 0]],
  [b(176), [-0.3, 0.05, 0.12], [-0.14, 0.03, 0]],
  [b(180), [-0.3, 0.06, -0.18], [-0.14, 0.03, 0]],
  [b(190), [-0.1, 0.12, 0.6], [-0.14, 0.04, 0]],
  [b(199) + 0.3, [-0.1, 0.18, 1.4], [-0.14, 0.04, 0]],
];

// people as points of light on a loose shell round the note; who accepts it, joins
const NP = 900;
const PTS = Array.from({ length: NP }, (_, i) => {
  const u = rnd(i, 1) * 2 - 1, a = rnd(i, 2) * Math.PI * 2, r = 0.22 + rnd(i, 3) * 0.6;
  const s = Math.sqrt(1 - u * u);
  return [BILL_C[0] + Math.cos(a) * s * r, 0.04 + u * r * 0.6, Math.sin(a) * s * r];
});
const appearAt = (i: number) => b(181) + 4.2 * Math.pow(rnd(i, 4), 1.6);

const Trust: React.FC<{ T: number; billY: number }> = ({ T, billY }) => {
  const { pts, lines } = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(PTS.flat(), 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(new Array(NP * 3).fill(0), 3));
    const lg = new THREE.BufferGeometry();
    lg.setAttribute('position', new THREE.Float32BufferAttribute(new Array(NP * 6).fill(0), 3));
    lg.setAttribute('color', new THREE.Float32BufferAttribute(new Array(NP * 6).fill(0), 3));
    return { pts: g, lines: lg };
  }, []);
  const c = pts.attributes.color as THREE.BufferAttribute, lp = lines.attributes.position as THREE.BufferAttribute, lc = lines.attributes.color as THREE.BufferAttribute;
  const warm = new THREE.Color('#ffd49a');
  for (let i = 0; i < NP; i++) {
    const k = easeOut(prog(T, appearAt(i), appearAt(i) + 0.5));
    c.setXYZ(i, warm.r * k, warm.g * k, warm.b * k);
    const linked = i % 3 === 0;
    const kl = linked ? 0.22 * easeOut(prog(T, appearAt(i) + 0.2, appearAt(i) + 0.9)) : 0;
    lp.setXYZ(i * 2, PTS[i][0], PTS[i][1], PTS[i][2]);
    lp.setXYZ(i * 2 + 1, BILL_C[0], billY, 0);
    lc.setXYZ(i * 2, warm.r * kl, warm.g * kl, warm.b * kl);
    lc.setXYZ(i * 2 + 1, 0, 0, 0);
  }
  c.needsUpdate = true; lp.needsUpdate = true; lc.needsUpdate = true;
  return (
    <>
      <points geometry={pts}>
        <pointsMaterial size={0.012} map={softTex()} vertexColors transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} sizeAttenuation />
      </points>
      <lineSegments geometry={lines}>
        <lineBasicMaterial vertexColors transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </lineSegments>
    </>
  );
};

export const S7: React.FC<{ T: number }> = ({ T }) => {
  if (T < S7_IN || T > S7_OUT) return null;
  const tb = T - DROP;
  const o = 1 - easeIn(prog(T, S7_OUT - 0.4, S7_OUT));
  const k = Math.exp(-tb / 0.18);
  const shake: [number, number] = [0.006 * k * Math.sin(T * 83), 0.006 * k * Math.cos(T * 71)];
  // the bar falls out of frame, turning; the note drifts up a little and turns slowly from then on
  const barPose = tb < 2.5 ? { p: [BAR_C[0] + 0.02 * tb, BAR_C[1] - 0.5 * 0.5 * tb * tb, BAR_C[2] - 0.02 * tb], r: [0.6 * tb, -0.25 + 0.8 * tb, 0.4 * tb] } : undefined;
  const billY = BILL_C[1] + 0.04 * easeOut(prog(T, DROP, DROP + 3));
  const billPose = { p: [BILL_C[0], billY, BILL_C[2]], r: [Math.PI / 2 + 0.05 * Math.sin(T * 0.5), 0.15 * Math.sin(T * 0.3), 0.04 * easeOut(prog(T, DROP, DROP + 2))] };
  const card = easeOut(prog(T, DROP + 1.2, DROP + 1.8)) * (1 - prog(T, b(169) - 0.4, b(169)));
  const fiat = easeOut(prog(T, b(191), b(192))) * (1 - prog(T, b(198), b(199)));
  const flash = Math.exp(-tb / 0.08);
  return (
    <AbsoluteFill style={{ opacity: o, backgroundColor: '#05060b' }}>
      <ChainSet T={T} keys={KEYS} tension={1} broken={DROP} barPose={barPose} billPose={billPose} shake={shake} bloom={0.55}>
        {tb < 1.2 && Array.from({ length: 70 }, (_, i) => {
          const a = rnd(i, 1) * Math.PI * 2, v = 0.05 + rnd(i, 2) * 0.25, s = 0.0012 + rnd(i, 3) * 0.002;
          return (
            <sprite key={i} position={[0.015 + Math.cos(a) * v * tb, -0.012 + Math.sin(a) * v * tb * 0.7 - 0.2 * tb * tb, (rnd(i, 4) - 0.5) * v * tb]} scale={[s, s, s]}>
              <spriteMaterial map={softTex()} color="#ffd38a" transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} opacity={1 - tb / 1.2} />
            </sprite>
          );
        })}
        <Trust T={T} billY={billY} />
      </ChainSet>
      {flash > 0.01 && <AbsoluteFill style={{ background: 'radial-gradient(ellipse 40% 40% at 50% 50%, rgba(255,214,150,0.5), rgba(255,214,150,0) 70%)', opacity: flash }} />}
      {card > 0.01 && (
        <div style={{ position: 'absolute', right: 140, top: 230, width: 330, opacity: card, transform: `translateY(${(1 - card) * 14}px)` }}>
          <div style={{ width: 330, height: 400, overflow: 'hidden', borderRadius: 4, boxShadow: '0 12px 40px rgba(0,0,0,0.7)', border: '1px solid rgba(246,207,120,0.35)' }}>
            <Img src={staticFile('tex/nixon1971.jpg')} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 8%', filter: 'grayscale(0.5) sepia(0.25) contrast(1.05) brightness(0.92)' }} />
          </div>
          <div style={{ fontFamily: ZH, fontWeight: 700, fontSize: 34, color: INK, marginTop: 16 }}>理查德·尼克松</div>
          <div style={{ fontFamily: ZH, fontSize: 22, color: 'rgba(243,237,226,0.65)', marginTop: 4 }}>美国总统 · 1971年8月15日宣布</div>
        </div>
      )}
      {fiat > 0.01 && (
        <div style={{ position: 'absolute', left: 0, right: 0, top: 150, textAlign: 'center', opacity: fiat }}>
          <div style={{ fontFamily: ZH, fontWeight: 900, fontSize: 72, color: GOLD, letterSpacing: '0.2em', textShadow: '0 0 24px rgba(246,207,120,0.35)' }}>法定货币</div>
          <div style={{ fontFamily: EN, fontSize: 30, letterSpacing: '0.4em', color: 'rgba(243,237,226,0.6)', marginTop: 4 }}>FIAT MONEY</div>
        </div>
      )}
      <Chapter T={T} at={DROP + 0.4} out={b(180)} text="1971年8月15日" />
      <SubBand o={0.85} />
      <Subs T={T} lines={LINES_S7} />
    </AbsoluteFill>
  );
};
