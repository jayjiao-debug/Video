import React, { useMemo } from 'react';
import * as THREE from 'three';
import { easeOut, easeIn, prog, lerp } from '../lib';
import { haloTex } from '../t3/Reveal3D';
import { mulberry } from '../v1/data';

/* ---------- a V-1 flying bomb, built from its real proportions (length 8.3 m, span 5.4 m, pulsejet on top) ----------
   Local axes: +z = nose, +y = up. Overall length 1 unit; scale it from outside. */
const lathe = (pts: number[][], seg = 40) => {
  const g = new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), seg);
  g.rotateX(Math.PI / 2); // lathe axis y -> z
  return g;
};
const wingGeo = (root: number, tip: number, span: number, sweep: number, th: number) => {
  const s = new THREE.Shape();
  s.moveTo(0, -root / 2);
  s.lineTo(span, -tip / 2 + sweep);
  s.lineTo(span, tip / 2 + sweep);
  s.lineTo(0, root / 2);
  s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth: th, bevelEnabled: true, bevelThickness: th * 0.4, bevelSize: th * 0.6, bevelSegments: 2 });
  g.translate(0, 0, -th / 2);
  g.rotateX(Math.PI / 2); // shape (x, y) -> (x, z), thickness along y
  return g;
};
export const V1Model: React.FC<{ engine: number; T: number }> = ({ engine, T }) => {
  const parts = useMemo(() => {
    const body = lathe([[0, -0.5], [0.028, -0.49], [0.05, -0.44], [0.062, -0.3], [0.066, -0.05], [0.066, 0.18], [0.06, 0.3], [0.045, 0.4], [0.026, 0.47], [0.008, 0.505], [0, 0.51]]);
    const jet = lathe([[0.022, -0.66], [0.026, -0.6], [0.027, -0.3], [0.03, -0.1], [0.038, -0.05], [0.042, 0.0], [0.036, 0.05], [0.02, 0.07], [0, 0.072]], 28);
    const wingR = wingGeo(0.17, 0.12, 0.33, -0.01, 0.012);
    const wingL = wingR.clone(); wingL.scale(-1, 1, 1);
    const stabR = wingGeo(0.09, 0.06, 0.15, -0.01, 0.008);
    const stabL = stabR.clone(); stabL.scale(-1, 1, 1);
    const fin = wingGeo(0.11, 0.07, 0.13, -0.02, 0.008); fin.rotateZ(Math.PI / 2);
    const skin = new THREE.MeshStandardMaterial({ color: '#6a705f', metalness: 0.55, roughness: 0.42 });
    const dark = new THREE.MeshStandardMaterial({ color: '#3b3d40', metalness: 0.75, roughness: 0.35 });
    const nose = new THREE.MeshStandardMaterial({ color: '#4f5449', metalness: 0.6, roughness: 0.4 });
    const band = new THREE.MeshStandardMaterial({ color: '#2a2c2e', metalness: 0.4, roughness: 0.6 });
    return { body, jet, wingR, wingL, stabR, stabL, fin, skin, dark, nose, band };
  }, []);
  const flick = 0.72 + 0.28 * Math.abs(Math.sin(T * 91) * Math.sin(T * 37 + 1.3));
  const e = engine * flick;
  return (
    <group>
      <mesh geometry={parts.body} material={parts.skin} castShadow />
      {/* seams: two dark bands and the nose cap */}
      {[0.32, -0.12].map((z) => (
        <mesh key={z} position={[0, 0, z]} rotation={[Math.PI / 2, 0, 0]} material={parts.band}>
          <cylinderGeometry args={[0.0675, 0.0675, 0.008, 40, 1, true]} />
        </mesh>
      ))}
      <mesh position={[0, 0, 0.455]} rotation={[Math.PI / 2, 0, 0]} material={parts.nose}>
        <cylinderGeometry args={[0.02, 0.038, 0.06, 32]} />
      </mesh>
      {/* wings at mid-body, tailplane, fin */}
      <mesh geometry={parts.wingR} material={parts.skin} position={[0.05, -0.005, -0.02]} castShadow />
      <mesh geometry={parts.wingL} material={parts.skin} position={[-0.05, -0.005, -0.02]} castShadow />
      <mesh geometry={parts.stabR} material={parts.skin} position={[0.035, 0, -0.43]} />
      <mesh geometry={parts.stabL} material={parts.skin} position={[-0.035, 0, -0.43]} />
      <mesh geometry={parts.fin} material={parts.skin} position={[0, 0.035, -0.42]} />
      {/* pulsejet on its pylon */}
      <mesh geometry={parts.jet} material={parts.dark} position={[0, 0.115, -0.05]} castShadow />
      <mesh position={[0, 0.085, 0.02]} material={parts.dark}>
        <boxGeometry args={[0.012, 0.05, 0.04]} />
      </mesh>
      {/* exhaust */}
      {e > 0.01 && (
        <group position={[0, 0.115, -0.71]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -0.08 * e]}>
            <coneGeometry args={[0.04 * e, 0.18 * e, 16, 1, true]} />
            <meshBasicMaterial color="#ffd9a0" transparent opacity={0.95 * e} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -0.14 * e]}>
            <coneGeometry args={[0.07 * e, 0.3 * e, 16, 1, true]} />
            <meshBasicMaterial color="#ff8a2a" transparent opacity={0.55 * e} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
          </mesh>
          <sprite scale={[0.5 * e, 0.5 * e, 1]}>
            <spriteMaterial map={haloTex()} color="#ffb060" transparent opacity={0.9 * e} blending={THREE.AdditiveBlending} depthWrite={false} />
          </sprite>
          <pointLight color="#ff9a40" intensity={2.5 * e} distance={2.2} decay={2} />
        </group>
      )}
    </group>
  );
};

/* ---------- explosion: flash, fireballs, smoke, shock ring, sparks, light. Pure function of time since impact. ---------- */
const smokeTex = (() => {
  let tx: THREE.CanvasTexture | null = null;
  return () => {
    if (tx) return tx;
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const g = c.getContext('2d')!;
    const r = mulberry(5);
    for (let i = 0; i < 14; i++) {
      const x = 64 + (r() - 0.5) * 40, y = 64 + (r() - 0.5) * 40, rad = 26 + r() * 30;
      const gr = g.createRadialGradient(x, y, 0, x, y, rad);
      gr.addColorStop(0, 'rgba(255,255,255,0.35)');
      gr.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = gr;
      g.fillRect(0, 0, 128, 128);
    }
    tx = new THREE.CanvasTexture(c);
    return tx;
  };
})();
const FIRE = [new THREE.Color('#fff4d6'), new THREE.Color('#ffc46a'), new THREE.Color('#ff7a26'), new THREE.Color('#b8321a'), new THREE.Color('#3a1a12')];
const fireAt = (k: number) => {
  const x = Math.min(0.999, Math.max(0, k)) * (FIRE.length - 1);
  const i = Math.floor(x);
  return FIRE[i].clone().lerp(FIRE[i + 1], x - i);
};
export const Explosion: React.FC<{ pos: number[]; t0: number; T: number; s?: number; seed?: number; smoke?: boolean }> = ({ pos, t0, T, s = 1, seed = 1, smoke = true }) => {
  const a = T - t0;
  const data = useMemo(() => {
    const r = mulberry(seed * 977 + 13);
    const balls = Array.from({ length: 9 }, () => ({ dx: (r() - 0.5) * 0.5, dz: (r() - 0.5) * 0.5, rise: 0.35 + r() * 0.6, size: 0.6 + r() * 0.7, lag: r() * 0.12 }));
    const puffs = Array.from({ length: 7 }, () => ({ dx: (r() - 0.5) * 0.7, dz: (r() - 0.5) * 0.7, rise: 0.5 + r() * 0.7, size: 0.9 + r() * 0.8, lag: 0.15 + r() * 0.3 }));
    const sparks = Array.from({ length: 40 }, () => {
      const th = r() * Math.PI * 2, el = 0.25 + r() * 1.1, sp = 1.4 + r() * 2.2;
      return { v: [Math.cos(th) * Math.cos(el) * sp, Math.sin(el) * sp, Math.sin(th) * Math.cos(el) * sp], life: 0.6 + r() * 0.8 };
    });
    return { balls, puffs, sparks };
  }, [seed]);
  const sparkMesh = useMemo(() => {
    const im = new THREE.InstancedMesh(new THREE.SphereGeometry(0.012, 6, 5),
      new THREE.MeshBasicMaterial({ color: '#ffd08a', transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }), 40);
    return im;
  }, []);
  if (a < 0 || a > 3.6) return null;
  const o = new THREE.Object3D();
  data.sparks.forEach((sp, i) => {
    const t = Math.min(a, sp.life);
    const alive = a < sp.life ? 1 : 0;
    o.position.set(pos[0] + sp.v[0] * t * s * 0.6, pos[1] + (sp.v[1] * t - 2.4 * t * t) * s * 0.6, pos[2] + sp.v[2] * t * s * 0.6);
    o.scale.setScalar(Math.max(0.0001, alive * s * (1 - a / sp.life) * 1.4));
    o.updateMatrix();
    sparkMesh.setMatrixAt(i, o.matrix);
  });
  sparkMesh.instanceMatrix.needsUpdate = true;
  const flash = Math.exp(-a * 7);
  const ring = easeOut(prog(a, 0, 0.7));
  return (
    <group>
      {/* flash core */}
      <sprite position={[pos[0], pos[1] + 0.1 * s, pos[2]]} scale={[s * (0.6 + 3.2 * easeOut(prog(a, 0, 0.12))), s * (0.6 + 3.2 * easeOut(prog(a, 0, 0.12))), 1]}>
        <spriteMaterial map={haloTex()} color="#fff1d0" transparent opacity={Math.min(1, flash * 1.4)} blending={THREE.AdditiveBlending} depthWrite={false} />
      </sprite>
      {/* fireballs */}
      {data.balls.map((b, i) => {
        const t = Math.max(0, a - b.lag);
        const k = prog(t, 0, 1.6);
        if (t <= 0 || k >= 1) return null;
        const size = s * b.size * (0.25 + 1.3 * easeOut(prog(t, 0, 0.7)));
        return (
          <sprite key={i} position={[pos[0] + b.dx * s * easeOut(prog(t, 0, 0.6)), pos[1] + b.rise * s * easeOut(prog(t, 0, 1.4)), pos[2] + b.dz * s * easeOut(prog(t, 0, 0.6))]} scale={[size, size, 1]}>
            <spriteMaterial map={haloTex()} color={fireAt(k)} transparent opacity={(1 - easeIn(k)) * 0.95} blending={THREE.AdditiveBlending} depthWrite={false} />
          </sprite>
        );
      })}
      {/* smoke */}
      {smoke && data.puffs.map((p, i) => {
        const t = Math.max(0, a - p.lag);
        if (t <= 0) return null;
        const size = s * p.size * (0.4 + 1.6 * easeOut(prog(t, 0, 2.6)));
        return (
          <sprite key={`s${i}`} position={[pos[0] + p.dx * s, pos[1] + p.rise * s * easeOut(prog(t, 0, 3)), pos[2] + p.dz * s]} scale={[size, size, 1]}>
            <spriteMaterial map={smokeTex()} color="#2a2522" transparent opacity={0.75 * easeOut(prog(t, 0, 0.4)) * (1 - prog(t, 1.6, 3.3))} depthWrite={false} />
          </sprite>
        );
      })}
      {/* shock ring on the ground */}
      {a < 0.8 && (
        <mesh position={[pos[0], 0.05, pos[2]]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[s * (0.1 + 1.8 * ring), s * (0.16 + 2.0 * ring), 64]} />
          <meshBasicMaterial color="#ffd7a0" transparent opacity={0.8 * (1 - ring)} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
        </mesh>
      )}
      <primitive object={sparkMesh} />
      <pointLight position={[pos[0], pos[1] + 0.4 * s, pos[2]]} color="#ff9a40" intensity={40 * s * Math.exp(-a * 3)} distance={6 * s} decay={2} />
    </group>
  );
};

/* ---------- the "spy": trench coat, fedora, cigarette at the lips. ~0.42 units tall before scaling. ---------- */
const Limb: React.FC<{ a: number[]; b: number[]; r: number; children: React.ReactNode }> = ({ a, b, r, children }) => {
  const d = new THREE.Vector3(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
  const len = d.length();
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
  return (
    <mesh position={[(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2]} quaternion={q} castShadow>
      <cylinderGeometry args={[r, r * 0.9, len, 12]} />
      {children}
    </mesh>
  );
};
export const Spy: React.FC<{ T: number; o: number }> = ({ T, o }) => {
  const geo = useMemo(() => ({
    coat: lathe([[0.058, 0.085], [0.054, 0.13], [0.046, 0.2], [0.041, 0.215], [0.047, 0.26], [0.053, 0.295], [0.06, 0.312], [0.05, 0.326], [0.024, 0.336], [0, 0.338]], 32),
    collar: lathe([[0.016, 0.0], [0.03, 0.012], [0.032, 0.03], [0.026, 0.04]], 20),
  }), []);
  if (o <= 0.001) return null;
  const coat = <meshStandardMaterial color="#7d6a50" roughness={0.8} transparent opacity={o} side={THREE.DoubleSide} />;
  const dark = <meshStandardMaterial color="#1b1a1d" roughness={0.75} transparent opacity={o} />;
  const turn = 0.35 * Math.sin(T * 0.9);
  const puff = 0.6 + 0.4 * Math.max(0, Math.sin(T * 1.7));
  return (
    <group>
      {/* legs and shoes under the hem */}
      {[-0.017, 0.017].map((x) => (
        <React.Fragment key={x}>
          <Limb a={[x, 0.008, 0]} b={[x, 0.11, 0]} r={0.011}>{dark}</Limb>
          <mesh position={[x, 0.006, 0.008]}><boxGeometry args={[0.02, 0.012, 0.036]} />{dark}</mesh>
        </React.Fragment>
      ))}
      <mesh geometry={geo.coat} rotation={[-Math.PI / 2, 0, 0]} castShadow>{coat}</mesh>
      <mesh position={[0, 0.212, 0]}>
        <cylinderGeometry args={[0.043, 0.043, 0.01, 24]} />
        <meshStandardMaterial color="#3b2f22" roughness={0.6} transparent opacity={o} />
      </mesh>
      {/* left arm hangs, hand in pocket; right arm raised to the cigarette */}
      <Limb a={[-0.058, 0.305, 0]} b={[-0.06, 0.2, 0.01]} r={0.014}>{coat}</Limb>
      <Limb a={[0.058, 0.305, 0]} b={[0.07, 0.235, 0.025]} r={0.014}>{coat}</Limb>
      <Limb a={[0.07, 0.235, 0.025]} b={[0.024, 0.335, 0.04]} r={0.012}>{coat}</Limb>
      <mesh geometry={geo.collar} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.322, 0]}>{coat}</mesh>
      <group rotation={[0, turn, 0]} position={[0, 0.362, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.026, 20, 16]} />
          <meshStandardMaterial color="#9a846c" roughness={0.8} transparent opacity={o} />
        </mesh>
        {/* fedora: wide brim tipped forward, pinched crown, band */}
        <group position={[0, 0.02, 0]} rotation={[0.12, 0, 0]}>
          <mesh castShadow><cylinderGeometry args={[0.062, 0.062, 0.005, 36]} />{dark}</mesh>
          <mesh position={[0, 0.018, 0]}><cylinderGeometry args={[0.026, 0.032, 0.034, 28]} />{dark}</mesh>
          <mesh position={[0, 0.006, 0]}>
            <cylinderGeometry args={[0.0325, 0.0325, 0.008, 28]} />
            <meshStandardMaterial color="#5a1a17" roughness={0.6} transparent opacity={o} />
          </mesh>
        </group>
        {/* cigarette and ember */}
        <mesh position={[0.016, -0.014, 0.03]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.0022, 0.0022, 0.024, 6]} />
          <meshBasicMaterial color="#e8e2d4" transparent opacity={o} />
        </mesh>
        <sprite position={[0.029, -0.014, 0.032]} scale={[0.055 * puff, 0.055 * puff, 1]}>
          <spriteMaterial map={haloTex()} color="#ff6a2a" transparent opacity={o * puff} blending={THREE.AdditiveBlending} depthWrite={false} />
        </sprite>
        <pointLight position={[0.029, -0.014, 0.04]} color="#ff7a3a" intensity={0.3 * puff * o} distance={0.4} decay={2} />
      </group>
    </group>
  );
};

export const shake = (a: number, amp = 0.06) => (a < 0 || a > 0.9 ? [0, 0, 0] : [
  amp * Math.exp(-a * 5) * Math.sin(a * 71), amp * Math.exp(-a * 5) * Math.sin(a * 53 + 1), amp * Math.exp(-a * 5) * Math.sin(a * 67 + 2),
]);
export { lerp };
