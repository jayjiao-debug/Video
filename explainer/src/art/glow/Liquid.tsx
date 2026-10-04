import React, {useLayoutEffect, useRef} from 'react';

/**
 * Liquid light: a domain-warped fbm field drawn with WebGL, coloured as coffee
 * (near-black → roast brown → amber → crema gold) with bright veins where the
 * field folds. This is the "flowing gold" ground of the Amber Night look.
 *
 * Deterministic in `t` (seconds of flow time), so it can be rewound or held.
 * Rendered at `res` × the CSS size (default ½) and upscaled: the look is soft
 * anyway, and SwiftShader renders it 4× faster.
 */
export type LiquidProps = {
	t: number;
	width?: number;
	height?: number;
	res?: number;
	/** zoom of the pattern; larger = finer detail */
	scale?: number;
	/** how hard the field is warped (0.5 calm … 2 turbulent) */
	warp?: number;
	/** overall brightness multiplier */
	gain?: number;
	/** 0..1, how much of the field shows as bright veins */
	veins?: number;
	/** where the light pools (0..1 uv) and how wide */
	light?: [number, number, number];
	seed?: number;
	/** swirl around the centre, radians (for a stirred cup) */
	swirl?: number;
	/** 0 = coffee palette, 1 = cool microscope palette */
	cool?: number;
	/** strength of the soft bloom laid over the field (0 = none) */
	bloom?: number;
	style?: React.CSSProperties;
};

const VERT = `attribute vec2 p; void main(){ gl_Position = vec4(p,0.,1.); }`;

const FRAG = `
precision highp float;
uniform vec2 R; uniform float T, S, W, G, V, SEED, SW, COOL; uniform vec3 L;
float h(vec2 p){ p = fract(p*vec2(123.34,456.21)+SEED); p += dot(p,p+45.32); return fract(p.x*p.y); }
float n(vec2 p){ vec2 i=floor(p), f=fract(p); vec2 u=f*f*(3.-2.*f);
  return mix(mix(h(i),h(i+vec2(1,0)),u.x), mix(h(i+vec2(0,1)),h(i+vec2(1,1)),u.x), u.y); }
float fbm(vec2 p){ float a=.5, s=0.; mat2 m=mat2(1.6,1.2,-1.2,1.6); for(int i=0;i<5;i++){ s+=a*n(p); p=m*p; a*=.5; } return s; }
void main(){
  vec2 uv = gl_FragCoord.xy/R; uv.y = 1.-uv.y;
  vec2 q = (gl_FragCoord.xy - .5*R)/R.y;
  float r = length(q); float a = SW*exp(-r*2.2);
  q = mat2(cos(a),-sin(a),sin(a),cos(a))*q;
  vec2 p = q*S;
  vec2 o = vec2(fbm(p+vec2(0.,T*.11)), fbm(p+vec2(5.2,1.3)-T*.07));
  vec2 w = vec2(fbm(p+W*2.*o+vec2(1.7,9.2)+T*.05), fbm(p+W*2.*o+vec2(8.3,2.8)-T*.06));
  float f = fbm(p+W*2.5*w);
  float d = abs(f-.55+.08*w.x);
  float vein = (smoothstep(.028,.0,d) + .45*smoothstep(.11,.0,d))*V;      // bright folds with a soft shoulder
  float body = smoothstep(.25,.95,f);
  float pool = exp(-pow(length((uv-L.xy)/max(.05,L.z)),2.));
  vec3 c0 = vec3(.035,.022,.014), c1 = vec3(.24,.11,.035), c2 = vec3(.86,.48,.13), c3 = vec3(1.,.86,.55);
  vec3 k0 = vec3(.02,.03,.04), k1 = vec3(.06,.14,.18), k2 = vec3(.35,.75,.8), k3 = vec3(.8,1.,1.);
  c0 = mix(c0,k0,COOL); c1 = mix(c1,k1,COOL); c2 = mix(c2,k2,COOL); c3 = mix(c3,k3,COOL);
  vec3 col = mix(c0, c1, body);
  col = mix(col, c2, smoothstep(.55,.9,f)*(.35+.65*pool));
  col += mix(c2,c3,smoothstep(.3,1.,vein))*vein*(.25+.8*pool);
  col *= G*(.35+.85*pool);
  gl_FragColor = vec4(col,1.);
}`;

export const Liquid: React.FC<LiquidProps> = ({
	t,
	width = 1920,
	height = 1080,
	res = 0.5,
	scale = 2.2,
	warp = 1,
	gain = 1,
	veins = 1,
	light = [0.62, 0.4, 0.55],
	seed = 0.3,
	swirl = 0,
	cool = 0,
	bloom = 0.8,
	style,
}) => {
	const ref = useRef<HTMLCanvasElement>(null);
	const glowRef = useRef<HTMLCanvasElement>(null);
	const glRef = useRef<{gl: WebGLRenderingContext; prog: WebGLProgram} | null>(null);
	const w = Math.round(width * res);
	const hgt = Math.round(height * res);
	useLayoutEffect(() => {
		const cv = ref.current;
		if (!cv) return;
		if (!glRef.current) {
			const gl = cv.getContext('webgl', {preserveDrawingBuffer: true, antialias: false});
			if (!gl) return;
			const sh = (type: number, src: string) => {
				const s = gl.createShader(type)!;
				gl.shaderSource(s, src);
				gl.compileShader(s);
				if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? 'shader');
				return s;
			};
			const prog = gl.createProgram()!;
			gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
			gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
			gl.linkProgram(prog);
			gl.useProgram(prog);
			const buf = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, buf);
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
			const loc = gl.getAttribLocation(prog, 'p');
			gl.enableVertexAttribArray(loc);
			gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
			glRef.current = {gl, prog};
		}
		const {gl, prog} = glRef.current;
		const u = (n: string) => gl.getUniformLocation(prog, n);
		gl.viewport(0, 0, w, hgt);
		gl.uniform2f(u('R'), w, hgt);
		gl.uniform1f(u('T'), t);
		gl.uniform1f(u('S'), scale);
		gl.uniform1f(u('W'), warp);
		gl.uniform1f(u('G'), gain);
		gl.uniform1f(u('V'), veins);
		gl.uniform1f(u('SEED'), seed);
		gl.uniform1f(u('SW'), swirl);
		gl.uniform1f(u('COOL'), cool);
		gl.uniform3f(u('L'), light[0], light[1], light[2]);
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
		const g = glowRef.current?.getContext('2d');
		if (g && glowRef.current) {
			g.clearRect(0, 0, w, hgt);
			g.filter = `blur(${Math.round(10 * res * 2)}px)`;
			g.drawImage(cv, 0, 0);
		}
	});
	const box: React.CSSProperties = {position: 'absolute', left: 0, top: 0, width, height};
	return (
		<div style={{...box, ...style}}>
			<canvas ref={ref} width={w} height={hgt} style={box} />
			{bloom > 0 ? <canvas ref={glowRef} width={w} height={hgt} style={{...box, mixBlendMode: 'screen', opacity: bloom}} /> : null}
		</div>
	);
};
