import React from 'react';
import {Composition, registerRoot} from 'remotion';
import * as THREE from 'three';
import {ThreeCanvas} from '@remotion/three';
import {AbsoluteFill} from 'remotion';
/* ep55 · 何尊 3D entry (three.js through @remotion/three). GLTEST = a lit sphere, to prove WebGL works in the headless renderer. */
const GLTest: React.FC = () => <AbsoluteFill style={{background: '#202020'}}>
	<ThreeCanvas width={1920} height={1080} camera={{fov: 30, position: [0, 0, 8]}} gl={{antialias: true}}>
		<ambientLight intensity={0.3} />
		<directionalLight position={[3, 4, 5]} intensity={2.5} />
		<mesh><sphereGeometry args={[1.5, 64, 32]} /><meshStandardMaterial color="#b08850" metalness={0.6} roughness={0.35} /></mesh>
	</ThreeCanvas>
	<div style={{position: 'absolute', left: 30, top: 20, color: '#fff', fontSize: 40}}>{typeof THREE.REVISION === 'string' ? 'three r' + THREE.REVISION : ''}</div>
</AbsoluteFill>;
const Root: React.FC = () => <>
	<Composition id="GLTEST" component={GLTest} width={1920} height={1080} fps={1} durationInFrames={1} />
</>;
registerRoot(Root);
