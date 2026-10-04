import React, {useLayoutEffect, useMemo} from 'react';
import {ThreeCanvas} from '@remotion/three';
import {useFrame, useThree} from '@react-three/fiber';
import {useCurrentFrame} from 'remotion';
import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass.js';
import {BokehPass} from 'three/examples/jsm/postprocessing/BokehPass.js';
import {UnrealBloomPass} from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import {OutputPass} from 'three/examples/jsm/postprocessing/OutputPass.js';
import {ShaderPass} from 'three/examples/jsm/postprocessing/ShaderPass.js';
import {FXAAPass} from 'three/examples/jsm/postprocessing/FXAAPass.js';
import * as THREE from 'three';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';

/**
 * The 3D stage for v4: real geometry and light instead of flat SVG.
 * Same craft rules as the 2D look (one warm key, cool rim, dark, bloom, grain),
 * but the light now actually wraps the props, and depth of field is optical.
 */

export const W = 1920;
export const H = 1080;
/** render-cost knobs, read at bundle time (REMOTION_* env vars are inlined by Remotion's bundler) */
export const DPR = Number(process.env.REMOTION_GL_DPR ?? '0.75') || 0.75;
const SAMPLES = Number(process.env.REMOTION_GL_SAMPLES ?? '0');
const NODOF = process.env.REMOTION_GL_NODOF === '1';
const NOBLOOM = process.env.REMOTION_GL_NOBLOOM === '1';
const RW = Math.round(W * DPR);
const RH = Math.round(H * DPR);

export type Cam = {pos: [number, number, number]; target?: [number, number, number]; fov?: number; roll?: number};

/** places the camera every frame; no orbit controls, the shot is fully scripted */
const CamRig: React.FC<Cam> = ({pos, target = [0, 0, 0], fov = 35, roll = 0}) => {
	const {camera} = useThree();
	useLayoutEffect(() => {
		const c = camera as THREE.PerspectiveCamera;
		c.fov = fov;
		c.near = 0.01;
		c.far = 400;
		c.position.set(...pos);
		c.up.set(Math.sin(roll), Math.cos(roll), 0);
		c.lookAt(...target);
		c.updateProjectionMatrix();
	});
	return null;
};

/**
 * Soft studio reflections from a procedural room (no HDR download). Sampling an env map is
 * the single most expensive thing in a software renderer, so it is NOT the scene environment:
 * only hero materials opt in with useEnv() (cup, beans, atoms, leaves), large surfaces don't.
 */
const EnvCtx = React.createContext<{map: THREE.Texture | null; intensity: number}>({map: null, intensity: 0});
export const useEnv = () => React.useContext(EnvCtx);
/** spread onto a standard/physical material: <meshPhysicalMaterial {...envProps(useEnv())} /> */
export const envProps = (e: {map: THREE.Texture | null; intensity: number}, k = 1) => ({envMap: e.map, envMapIntensity: e.intensity * k});

const EnvProvider: React.FC<{intensity: number; children: React.ReactNode}> = ({intensity, children}) => {
	const {gl} = useThree();
	const map = useMemo(() => {
		const pm = new THREE.PMREMGenerator(gl);
		const t = pm.fromScene(new RoomEnvironment(), 0.04).texture;
		pm.dispose();
		return t;
	}, [gl]);
	return <EnvCtx.Provider value={{map: process.env.REMOTION_GL_NOENV === '1' ? null : map, intensity}}>{children}</EnvCtx.Provider>;
};

export type StageProps = {
	cam: Cam;
	bg?: string;
	env?: number;
	fog?: [number, number];
	fx?: boolean;
	children: React.ReactNode;
};

/** grade pass: vignette, warm/cool split, film grain (seeded by frame, so renders are deterministic) */
const GradeShader = {
	uniforms: {tDiffuse: {value: null}, uVig: {value: 0.75}, uGrain: {value: 0.05}, uSeed: {value: 0}, uAspect: {value: W / H}, uBlur: {value: new THREE.Vector2()}, uFade: {value: 0}},
	vertexShader: `varying vec2 vUv; void main(){vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
	fragmentShader: `uniform sampler2D tDiffuse; uniform float uVig, uGrain, uSeed, uAspect, uFade; uniform vec2 uBlur; varying vec2 vUv;
float h(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233))+uSeed)*43758.5453);}
void main(){
  // a touch of lateral chromatic aberration toward the edges
  vec2 d=(vUv-.5); float r2=dot(d*vec2(uAspect,1.),d*vec2(uAspect,1.));
  vec2 o=d*.0025*r2*4.;
  vec3 c=vec3(texture2D(tDiffuse,vUv+o).r,texture2D(tDiffuse,vUv).g,texture2D(tDiffuse,vUv-o).b);
  // directional smear for whip pans / fast pushes (screen-space motion blur)
  if(length(uBlur)>0.0001){ vec3 acc=vec3(0.); for(int i=0;i<24;i++){ float k=float(i)/23.-.5; acc+=texture2D(tDiffuse,vUv+uBlur*k).rgb; } c=acc/24.; }
  float v=smoothstep(1.25,.25,length(d*vec2(uAspect*.85,1.))*1.35);
  c*=mix(1.,v,uVig);
  float g=h(vUv*vec2(1920.,1080.))-.5;
  c+=g*uGrain*(.4+.6*(1.-dot(c,vec3(.33))));
  c*=1.-uFade;
  gl_FragColor=vec4(c,1.);
}`,
};

/**
 * Post chain built synchronously (so the very first advance() already renders through it):
 * render -> optional bokeh DOF -> unreal bloom -> tone map/sRGB -> grade.
 */
const Post: React.FC<{bloom: number; threshold: number; focus?: number; aperture: number; vig: number; grain: number; blur: [number, number]; fade: number}> = ({bloom, threshold, focus, aperture, vig, grain, blur, fade}) => {
	const {gl, scene, camera} = useThree();
	const frame = useCurrentFrame();
	const chain = useMemo(() => {
		const rt = new THREE.WebGLRenderTarget(RW, RH, {type: THREE.HalfFloatType, samples: SAMPLES});
		const composer = new EffectComposer(gl, rt);
		composer.setPixelRatio(1);
		composer.setSize(RW, RH);
		composer.addPass(new RenderPass(scene, camera));
		// safety net: a NaN or overflowed pixel would be smeared over the frame by bloom/bokeh
		composer.addPass(
			new ShaderPass({
				uniforms: {tDiffuse: {value: null}},
				vertexShader: `varying vec2 vUv; void main(){vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
				fragmentShader: `uniform sampler2D tDiffuse; varying vec2 vUv;
void main(){ vec4 c=texture2D(tDiffuse,vUv);
  if(!(c.r==c.r)||!(c.g==c.g)||!(c.b==c.b)||!(c.a==c.a)) c=vec4(0.,0.,0.,1.);
  gl_FragColor=vec4(min(c.rgb,vec3(64.)),c.a); }`,
			}),
		);
		const bokeh = new BokehPass(scene, camera, {focus: 5, aperture: 0.002, maxblur: 0.012});
		composer.addPass(bokeh);
		const bl = new UnrealBloomPass(new THREE.Vector2(RW, RH), 1, 0.6, 0.6);
		composer.addPass(bl);
		composer.addPass(new OutputPass());
		if (SAMPLES === 0) composer.addPass(new FXAAPass());
		const grade = new ShaderPass(GradeShader);
		composer.addPass(grade);
		return {composer, bokeh, bl, grade};
	}, [gl, scene, camera]);
	chain.bokeh.enabled = focus !== undefined && !NODOF;
	chain.bl.enabled = !NOBLOOM;
	if (focus !== undefined) {
		(chain.bokeh.uniforms as any).focus.value = focus;
		(chain.bokeh.uniforms as any).aperture.value = aperture;
	}
	chain.bl.strength = bloom;
	chain.bl.threshold = threshold;
	chain.grade.uniforms.uVig.value = vig;
	chain.grade.uniforms.uGrain.value = grain;
	chain.grade.uniforms.uSeed.value = (frame % 97) * 1.37;
	chain.grade.uniforms.uBlur.value.set(blur[0], blur[1]);
	chain.grade.uniforms.uFade.value = fade;
	useFrame(() => {
		chain.composer.render();
	}, 1);
	return null;
};

export type StageFx = {bloom?: number; threshold?: number; focus?: number; aperture?: number; vig?: number; grain?: number; blur?: [number, number]; fade?: number};

export const Stage3D: React.FC<StageProps & StageFx> = ({cam, bg = '#05060b', env = 0.25, fog, focus, aperture = 0.002, bloom = 0.9, threshold = 0.6, vig = 0.75, grain = 0.05, blur = [0, 0], fade = 0, fx = true, children}) => (
	<ThreeCanvas
		width={W}
		height={H}
		style={{position: 'absolute', inset: 0}}
		gl={{antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.0, preserveDrawingBuffer: true}}
		dpr={DPR}
	>
		<color attach="background" args={[bg]} />
		{fog ? <fog attach="fog" args={[bg, fog[0], fog[1]]} /> : null}
		<CamRig {...cam} />
		<EnvProvider intensity={env}>{children}</EnvProvider>
		{fx ? <Post bloom={bloom} threshold={threshold} focus={focus} aperture={aperture} vig={vig} grain={grain} blur={blur} fade={fade} /> : null}
	</ThreeCanvas>
);

/** the house lighting: one warm key, a cool rim from behind, almost no fill */
export const Lights: React.FC<{keyPos?: [number, number, number]; keyColor?: string; keyI?: number; rim?: [number, number, number]; rimColor?: string; rimI?: number; fill?: number}> = ({
	keyPos: k = [3, 4, 3],
	keyColor = '#ffc98a',
	keyI = 60,
	rim = [-3, 2, -4],
	rimColor = '#7fa6ff',
	rimI = 40,
	fill = 0.04,
}) => (
	<>
		<pointLight position={k} color={keyColor} intensity={keyI} decay={2} />
		<pointLight position={rim} color={rimColor} intensity={rimI} decay={2} />
		<ambientLight intensity={fill} color="#8090b0" />
	</>
);
