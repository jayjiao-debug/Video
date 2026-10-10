/* The hero object: a generic structured top-handle bag (our own design: a soft trapezoid body, a curved flap,
   one arched handle, a plain bar clasp). No brand's shape, quilting, lock or monogram. Bottom centre at the origin. */
import React, { useMemo } from 'react';
import * as THREE from 'three';
import { leatherTex } from './ltex';

export const BAG = { w: 0.32, top: 0.25, h: 0.22, d: 0.12 };
const GOLD = { color: '#d8b06a', metalness: 1, roughness: 0.22 };

const roundedTrapezoid = (wb: number, wt: number, h: number, r: number) => {
  const s = new THREE.Shape(), b = wb / 2, t = wt / 2;
  s.moveTo(-b + r, 0); s.lineTo(b - r, 0); s.quadraticCurveTo(b, 0, b - 0.002, r);
  s.lineTo(t, h - r); s.quadraticCurveTo(t, h, t - r, h); s.lineTo(-t + r, h); s.quadraticCurveTo(-t, h, -t, h - r);
  s.lineTo(-b + 0.002, r); s.quadraticCurveTo(-b, 0, -b + r, 0); return s;
};
const flapShape = (wt: number, depth: number) => {
  const s = new THREE.Shape(), t = wt / 2 + 0.004;
  s.moveTo(-t, 0); s.lineTo(t, 0); s.lineTo(t, -depth * 0.55); s.quadraticCurveTo(t * 0.95, -depth, 0, -depth); s.quadraticCurveTo(-t * 0.95, -depth, -t, -depth * 0.55); s.closePath(); return s;
};

export type BagProps = {
  color?: string;
  /** 0..1: parts fly apart for the price breakdown */
  explode?: number;
  /** under UV light: stitches fluoresce (a fake's optical-brightener thread) */
  uv?: number;
  sheen?: number;
};

export const Bag: React.FC<BagProps & JSX.IntrinsicElements['group']> = ({ color = '#5a1a1c', explode = 0, uv = 0, sheen = 1, ...g }) => {
  const tx = useMemo(() => leatherTex(color), [color]);
  const geo = useMemo(() => {
    const body = new THREE.ExtrudeGeometry(roundedTrapezoid(BAG.w, BAG.top, BAG.h, 0.03), { depth: BAG.d, bevelEnabled: true, bevelThickness: 0.012, bevelSize: 0.01, bevelSegments: 6, curveSegments: 24 });
    body.translate(0, 0, -BAG.d / 2);
    const flap = new THREE.ExtrudeGeometry(flapShape(BAG.top, 0.13), { depth: 0.004, bevelEnabled: true, bevelThickness: 0.002, bevelSize: 0.002, bevelSegments: 3, curveSegments: 24 });
    const arch = new THREE.CatmullRomCurve3([new THREE.Vector3(-0.075, 0, 0), new THREE.Vector3(-0.06, 0.07, 0), new THREE.Vector3(0, 0.105, 0), new THREE.Vector3(0.06, 0.07, 0), new THREE.Vector3(0.075, 0, 0)]);
    const handle = new THREE.TubeGeometry(arch, 64, 0.008, 16, false);
    // stitches along the flap edge: short dashes following the curve
    const curve = new THREE.QuadraticBezierCurve3(new THREE.Vector3(BAG.top / 2 - 0.006, -0.068, 0), new THREE.Vector3(0, -0.13, 0), new THREE.Vector3(-BAG.top / 2 + 0.006, -0.068, 0));
    const pts = curve.getSpacedPoints(46);
    return { body, flap, handle, pts };
  }, []);
  const leather = <meshPhysicalMaterial map={tx.map} bumpMap={tx.bump} bumpScale={0.6} roughness={0.42} clearcoat={0.35 * sheen} clearcoatRoughness={0.35} sheen={0.4} sheenColor={new THREE.Color('#ffd9c0')} />;
  const e = explode, up = (k: number) => k * e;
  const stitchCol = new THREE.Color(uv > 0 ? '#d8e4ff' : '#c9b9a0');
  return (
    <group {...g}>
      {/* body */}
      <mesh geometry={geo.body} castShadow receiveShadow position={[0, 0.012, 0]}>{leather}</mesh>
      {/* flap over the front, hinged at the top */}
      <group position={[0, BAG.h + 0.012 + up(0.03), BAG.d / 2 + 0.012 + up(0.16)]} rotation={[-0.06 - up(0.08), 0, 0]}>
        <mesh geometry={geo.flap} castShadow>{leather}</mesh>
        {geo.pts.map((p, i) => i % 1 === 0 && (
          <mesh key={i} position={[p.x, p.y, 0.0075]} rotation={[0, 0, Math.atan2(geo.pts[Math.min(i + 1, geo.pts.length - 1)].y - p.y, geo.pts[Math.min(i + 1, geo.pts.length - 1)].x - p.x)]}>
            <boxGeometry args={[0.0032, 0.0009, 0.0009]} />
            <meshStandardMaterial color={stitchCol} emissive={stitchCol} emissiveIntensity={uv * 3.2} roughness={0.8} />
          </mesh>))}
        {/* bar clasp */}
        <group position={[0, -0.112, 0.008 + up(0.08)]}>
          <mesh castShadow><boxGeometry args={[0.05, 0.016, 0.006]} /><meshStandardMaterial {...GOLD} /></mesh>
          <mesh position={[0, 0, 0.004]}><boxGeometry args={[0.042, 0.006, 0.004]} /><meshStandardMaterial {...GOLD} roughness={0.12} /></mesh>
        </group>
      </group>
      {/* handle and its gold rings */}
      <group position={[0, BAG.h + 0.022 + up(0.14), 0]}>
        <mesh geometry={geo.handle} castShadow>{leather}</mesh>
        {[-0.075, 0.075].map((x) => <mesh key={x} position={[x, -0.004, 0]} rotation={[0, Math.PI / 2, 0]}><torusGeometry args={[0.011, 0.0028, 12, 32]} /><meshStandardMaterial {...GOLD} /></mesh>)}
      </group>
      {/* feet */}
      {[[-0.12, -0.04], [0.12, -0.04], [-0.12, 0.04], [0.12, 0.04]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.004 - up(0.1), z]}><cylinderGeometry args={[0.007, 0.007, 0.008, 16]} /><meshStandardMaterial {...GOLD} /></mesh>))}
    </group>
  );
};
