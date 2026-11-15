import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { GTAOPass } from 'three/examples/jsm/postprocessing/GTAOPass.js';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { ENTRIES } from './data';
import { isLocalNight } from './time';
import type { WeatherState } from './weather';

export interface IslandHud {
	utc: string;
	met: string;
	az: number;
	el: number;
	alt: number;
}

export interface IslandOptions {
	isFound(id: string): boolean;
	onHover(id: string | null, x: number, y: number): void;
	onSelect(id: string | null): void;
	onHud(hud: IslandHud): void;
	onTime(mode: TimeMode): void;
	onTour(active: boolean): void;
	onReady(): void;
	onBack(): void;
}

export type TimeMode = 'day' | 'dusk' | 'night';

export interface IslandController {
	setTime(mode: TimeMode): void;
	setWeather(w: WeatherState | null): void;
	cycleTime(): void;
	startTour(): void;
	stopTour(): void;
	closeCard(): void;
	dispose(): void;
}

type Tick = (dt: number, t: number) => void;
type Mat = THREE.MeshStandardMaterial;
type Kid = [string, THREE.Group, number, number];

interface Item {
	id: string;
	group: THREE.Group;
	gem: THREE.Mesh | null;
	gy: number;
	mats: Mat[];
	h: number;
	ph: number;
	isFind: boolean;
}

const MONO = 'ui-monospace, Menlo, Consolas, monospace';
const SANS = 'system-ui, -apple-system, Segoe UI, sans-serif';
const L = THREE.MathUtils.lerp;

function mulberry32(seed: number) {
	let a = seed;
	return function () {
		a |= 0;
		a = (a + 0x6d2b79f5) | 0;
		let t = Math.imul(a ^ (a >>> 15), 1 | a);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

/** Film finishing: edge chromatic aberration, vignette, split-tone, gentle HDR-safe contrast, grain. */
const GradeShader = {
	uniforms: {
		tDiffuse: { value: null as THREE.Texture | null },
		uVig: { value: 0.4 },
		uTod: { value: 2 },
		uTime: { value: 0 },
		uGrain: { value: 0.026 },
		uCA: { value: 0.0035 }
	},
	vertexShader: /* glsl */ `
		varying vec2 vUv;
		void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
	fragmentShader: /* glsl */ `
		uniform sampler2D tDiffuse; uniform float uVig, uTod, uTime, uGrain, uCA; varying vec2 vUv;
		float rand(vec2 co) { return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453); }
		void main() {
			vec2 dir = vUv - 0.5;
			float ca = uCA * dot(dir, dir) * 4.0;
			vec3 col = vec3(
				texture2D(tDiffuse, vUv + dir * ca).r,
				texture2D(tDiffuse, vUv).g,
				texture2D(tDiffuse, vUv - dir * ca).b);
			float d = length(dir);
			col *= 1.0 - smoothstep(0.32, 0.88, d) * uVig;
			float dusk = 1.0 - abs(uTod - 1.0);
			float night = clamp(uTod - 1.0, 0.0, 1.0);
			vec3 warm = vec3(1.04, 1.0, 0.94), cool = vec3(0.93, 0.98, 1.07);
			col *= mix(warm, cool, night);
			float lum = dot(col, vec3(0.2126, 0.7152, 0.0722));
			col = mix(col, col * vec3(0.9, 1.0, 1.1), (1.0 - smoothstep(0.0, 0.5, lum)) * 0.35);
			col = mix(col, col * vec3(1.12, 1.0, 0.86), smoothstep(0.5, 1.4, lum) * (0.25 + 0.5 * dusk));
			vec3 c1 = clamp(col, 0.0, 1.0);
			col += (c1 * c1 * (3.0 - 2.0 * c1) - c1) * 0.2;
			col += (rand(vUv * (uTime + 1.0)) - 0.5) * uGrain;
			gl_FragColor = vec4(col, 1.0);
		}`
};

/** Tilt-shift blur: sharp focus band, soft top/bottom. Run once horizontally, once vertically. */
const TiltShader = {
	uniforms: {
		tDiffuse: { value: null as THREE.Texture | null },
		uDir: { value: new THREE.Vector2(1, 0) },
		uRes: { value: new THREE.Vector2(1, 1) },
		uFocus: { value: 0.5 },
		uBand: { value: 0.2 },
		uAmount: { value: 3.2 }
	},
	vertexShader: /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
	fragmentShader: /* glsl */ `
		uniform sampler2D tDiffuse; uniform vec2 uDir, uRes; uniform float uFocus, uBand, uAmount; varying vec2 vUv;
		void main() {
			float k = smoothstep(uBand, 0.5, abs(vUv.y - uFocus)) * uAmount;
			vec2 stp = uDir / uRes * k;
			vec4 c = texture2D(tDiffuse, vUv) * 0.2270270270;
			c += (texture2D(tDiffuse, vUv + stp * 1.3846153846) + texture2D(tDiffuse, vUv - stp * 1.3846153846)) * 0.3162162162;
			c += (texture2D(tDiffuse, vUv + stp * 3.2307692308) + texture2D(tDiffuse, vUv - stp * 3.2307692308)) * 0.0702702703;
			gl_FragColor = c;
		}`
};

/** Screen-space light shafts toward the sun/moon (radial march over bright pixels). */
const RaysShader = {
	uniforms: {
		tDiffuse: { value: null as THREE.Texture | null },
		uLight: { value: new THREE.Vector2(0.5, 0.5) },
		uStrength: { value: 0 },
		uTint: { value: new THREE.Color(1, 0.8, 0.6) }
	},
	vertexShader: /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
	fragmentShader: /* glsl */ `
		uniform sampler2D tDiffuse; uniform vec2 uLight; uniform float uStrength; uniform vec3 uTint; varying vec2 vUv;
		void main() {
			vec4 base = texture2D(tDiffuse, vUv);
			if (uStrength <= 0.001) { gl_FragColor = base; return; }
			vec2 delta = (uLight - vUv) / 26.0;
			vec2 uv = vUv;
			float decay = 1.0, acc = 0.0;
			for (int i = 0; i < 26; i++) {
				uv += delta;
				vec3 s = texture2D(tDiffuse, uv).rgb;
				float l = max(dot(s, vec3(0.3333)) - 0.8, 0.0);
				acc += l * decay;
				decay *= 0.94;
			}
			gl_FragColor = vec4(base.rgb + uTint * acc * uStrength * 0.09, base.a);
		}`
};

export async function createIsland(
	container: HTMLElement,
	opts: IslandOptions
): Promise<IslandController> {
	const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
	const low =
		matchMedia('(pointer: coarse)').matches || (navigator.hardwareConcurrency ?? 8) <= 4;
	const rnd = mulberry32(94);
	const mo0 = reduceMotion ? 0 : 1;

	/* ───────── renderer / composer ───────── */
	const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' });
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, low ? 1.5 : 2));
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap;
	renderer.toneMapping = THREE.ACESFilmicToneMapping;
	renderer.domElement.className = 'island-canvas';
	renderer.domElement.setAttribute('role', 'img');
	renderer.domElement.setAttribute(
		'aria-label',
		'Interactive 3D floating island with clickable buildings and hidden finds'
	);
	container.appendChild(renderer.domElement);

	const scene = new THREE.Scene();
	scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;
	scene.fog = new THREE.FogExp2(0x101a45, 0.006);

	// sky is painted into a tiny gradient texture so the post-processing pipeline can bloom against it
	const skyCanvas = document.createElement('canvas');
	skyCanvas.width = 2;
	skyCanvas.height = 256;
	const skyTex = new THREE.CanvasTexture(skyCanvas);
	skyTex.colorSpace = THREE.SRGBColorSpace;
	scene.background = skyTex;

	const camera = new THREE.PerspectiveCamera(32, 1, 0.5, 140);
	const HOME = new THREE.Vector3(17, 13.5, 17);
	camera.position.copy(HOME);

	const controls = new OrbitControls(camera, renderer.domElement);
	controls.target.set(0, 0, 0);
	Object.assign(controls, {
		enableDamping: true,
		dampingFactor: 0.07,
		enablePan: false,
		minDistance: 9,
		maxDistance: 46,
		minPolarAngle: Math.PI / 8,
		maxPolarAngle: Math.PI * 0.93,
		autoRotate: !reduceMotion,
		autoRotateSpeed: 0.5
	});
	let resumeTimer: ReturnType<typeof setTimeout> | undefined;
	let cardOpen = false;
	const glide = { target: null as THREE.Vector3 | null, dist: null as number | null };
	controls.addEventListener('start', () => {
		stopTour();
		controls.autoRotate = false;
		clearTimeout(resumeTimer);
		glide.target = null;
		glide.dist = null;
	});
	controls.addEventListener('end', () => {
		if (!reduceMotion)
			resumeTimer = setTimeout(() => (controls.autoRotate = !cardOpen), 5000);
	});

	const composer = new EffectComposer(
		renderer,
		new THREE.WebGLRenderTarget(2, 2, { type: THREE.HalfFloatType, samples: low ? 0 : 4 })
	);
	composer.addPass(new RenderPass(scene, camera));
	// transparent/additive effects are hidden while AO samples depth, so halos don't darken the scene
	const fx: THREE.Object3D[] = [];
	let gtao: GTAOPass | null = null;
	if (!low) {
		gtao = new GTAOPass(scene, camera, 2, 2);
		gtao.updateGtaoMaterial({ radius: 0.9, distanceExponent: 1.4, thickness: 1.2, scale: 1.1, samples: 12, distanceFallOff: 1, screenSpaceRadius: false });
		gtao.blendIntensity = 0.9;
		const baseRender = gtao.render.bind(gtao);
		gtao.render = (...args: Parameters<GTAOPass['render']>) => {
			const was = fx.map((o) => o.visible);
			fx.forEach((o) => (o.visible = false));
			baseRender(...args);
			fx.forEach((o, i) => (o.visible = was[i]));
		};
		composer.addPass(gtao);
	}
	const bloom = new UnrealBloomPass(new THREE.Vector2(2, 2), 0.3, 0.55, 0.92);
	composer.addPass(bloom);
	const tiltH = new ShaderPass(TiltShader);
	const tiltV = new ShaderPass(TiltShader);
	tiltV.uniforms.uDir.value = new THREE.Vector2(0, 1);
	tiltV.uniforms.uRes.value = new THREE.Vector2(1, 1);
	tiltH.uniforms.uRes.value = new THREE.Vector2(1, 1);
	composer.addPass(tiltH);
	composer.addPass(tiltV);
	const rays = new ShaderPass(RaysShader);
	if (!low) composer.addPass(rays);
	const grade = new ShaderPass(GradeShader);
	composer.addPass(grade);
	composer.addPass(new OutputPass());

	const hemi = new THREE.HemisphereLight(0xffffff, 0x888888, 1);
	const sun = new THREE.DirectionalLight(0xffffff, 2);
	sun.castShadow = true;
	sun.shadow.mapSize.set(low ? 1024 : 2048, low ? 1024 : 2048);
	Object.assign(sun.shadow.camera, { left: -13, right: 13, top: 13, bottom: -13, near: 1, far: 50 });
	sun.shadow.bias = -0.0004;
	sun.shadow.normalBias = 0.03;
	scene.add(hemi, sun);

	const world = new THREE.Group(); // island + everything on it bobs together
	scene.add(world);

	/* ───────── helpers ───────── */
	const glowers: Mat[] = []; // materials whose glow depends on time of day: userData.dn = [day, night]
	const tick: Tick[] = [];
	const state = { nm: 0.5, tod: 1, cloud: 0, wind: 0 };
	const holoMats: { m: THREE.Material & { opacity: number }; o: number }[] = [];
	const nightLights: { light: THREE.PointLight; day: number; night: number }[] = [];
	const nl = (light: THREE.PointLight, day: number, night: number) => {
		nightLights.push({ light, day, night });
		light.intensity = day;
		return light;
	};
	const M = (color: number, o: THREE.MeshStandardMaterialParameters = {}) =>
		new THREE.MeshStandardMaterial({
			color,
			roughness: 0.82,
			metalness: 0,
			flatShading: true,
			envMapIntensity: 0.3,
			...o
		});
	const G = (
		color: number,
		emissive: number,
		dayEI: number,
		nightEI: number,
		o: THREE.MeshStandardMaterialParameters = {}
	) => {
		const m = M(color, { emissive, emissiveIntensity: dayEI, flatShading: false, ...o });
		m.userData.dn = [dayEI, nightEI];
		glowers.push(m);
		return m;
	};
	const add = (
		parent: THREE.Object3D,
		geo: THREE.BufferGeometry,
		mat: THREE.Material,
		x = 0,
		y = 0,
		z = 0
	) => {
		const m = new THREE.Mesh(geo, mat);
		m.position.set(x, y, z);
		m.castShadow = true;
		m.receiveShadow = true;
		parent.add(m);
		return m;
	};
	const bevelCache = new Map<string, THREE.BufferGeometry>();
	function bevel(w: number, h: number, d: number) {
		const key = `${w}|${h}|${d}`;
		let g = bevelCache.get(key);
		if (!g) {
			const r = Math.min(0.045, Math.min(w, h, d) * 0.32);
			g = new RoundedBoxGeometry(w, h, d, low ? 1 : 2, r);
			bevelCache.set(key, g);
		}
		return g;
	}
	const box = (
		p: THREE.Object3D,
		w: number,
		h: number,
		d: number,
		mat: THREE.Material,
		x: number,
		y: number,
		z: number
	) => add(p, bevel(w, h, d), mat, x, y, z);
	const cyl = (
		p: THREE.Object3D,
		rt: number,
		rb: number,
		h: number,
		seg: number,
		mat: THREE.Material,
		x: number,
		y: number,
		z: number
	) => add(p, new THREE.CylinderGeometry(rt, rb, h, seg), mat, x, y, z);
	const ball = (
		p: THREE.Object3D,
		r: number,
		mat: THREE.Material,
		x: number,
		y: number,
		z: number,
		d = 1
	) => add(p, new THREE.IcosahedronGeometry(r, d), mat, x, y, z);
	function canvasTex(w: number, h: number, draw: (c: CanvasRenderingContext2D, w: number, h: number) => void) {
		const c = document.createElement('canvas');
		c.width = w;
		c.height = h;
		draw(c.getContext('2d')!, w, h);
		const t = new THREE.CanvasTexture(c);
		t.colorSpace = THREE.SRGBColorSpace;
		t.anisotropy = 4;
		t.userData.canvas = c;
		return t;
	}
	function glassMat(tex: THREE.Texture, dayEI: number, nightEI: number) {
		const m = new THREE.MeshStandardMaterial({
			map: tex,
			emissiveMap: tex,
			emissive: 0xffffff,
			emissiveIntensity: dayEI,
			roughness: 0.4
		});
		m.userData.dn = [dayEI, nightEI];
		glowers.push(m);
		return m;
	}
	const rr = (g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
		g.beginPath();
		g.moveTo(x + r, y);
		g.arcTo(x + w, y, x + w, y + h, r);
		g.arcTo(x + w, y + h, x, y + h, r);
		g.arcTo(x, y + h, x, y, r);
		g.arcTo(x, y, x + w, y, r);
		g.closePath();
	};
	const noRay = (o: THREE.Object3D) => {
		o.traverse((c) => {
			c.raycast = () => {};
		});
	};
	const PLAZA = { x: 0, z: 0.4 };
	const faceTo = (g: THREE.Object3D) => {
		g.rotation.y = Math.atan2(PLAZA.x - g.position.x, PLAZA.z - g.position.z);
	};

	// soft contact shadows ground every object (cheap ambient occlusion)
	const blobTex = canvasTex(64, 64, (c, w) => {
		const gr = c.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
		gr.addColorStop(0, 'rgba(0,0,0,0.9)');
		gr.addColorStop(0.55, 'rgba(0,0,0,0.35)');
		gr.addColorStop(1, 'rgba(0,0,0,0)');
		c.fillStyle = gr;
		c.fillRect(0, 0, w, w);
	});
	const blobMat = new THREE.MeshBasicMaterial({
		map: blobTex,
		transparent: true,
		opacity: 0.5,
		depthWrite: false,
		toneMapped: false
	});
	function blob(x: number, z: number, rx: number, rz = rx, rot = 0) {
		const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), blobMat);
		m.rotation.x = -Math.PI / 2;
		m.rotation.z = rot;
		m.position.set(x, 0.012, z);
		m.scale.set(rx * 2, rz * 2, 1);
		m.raycast = () => {};
		world.add(m);
	}

	/* ───────── island (15 × 15) ───────── */
	const S = 15;
	const grassTex = canvasTex(480, 480, (g, w) => {
		const n = 15,
			s = w / n,
			cols = ['#7ec86b', '#76be63', '#86cf71', '#7bc468'];
		for (let i = 0; i < n; i++)
			for (let j = 0; j < n; j++) {
				g.fillStyle = cols[Math.floor(rnd() * cols.length)];
				g.fillRect(i * s, j * s, s, s);
			}
	});
	grassTex.magFilter = THREE.NearestFilter;
	box(world, S, 0.5, S, M(0x6fb85e), 0, -0.25, 0);
	const top = new THREE.Mesh(
		new THREE.PlaneGeometry(S, S),
		new THREE.MeshStandardMaterial({ map: grassTex, roughness: 0.9, envMapIntensity: 0.2 })
	);
	top.rotation.x = -Math.PI / 2;
	top.position.y = 0.004;
	top.receiveShadow = true;
	top.raycast = () => {};
	world.add(top);
	box(world, S - 0.3, 0.7, S - 0.3, M(0x8b5e45), 0, -0.85, 0);

	const ROCK_TOP = -1.2,
		ROCK_H = 8.2,
		ROCK_RT = (S - 0.6) / Math.SQRT2,
		ROCK_RB = 1.1;
	cyl(world, ROCK_RT, ROCK_RB, ROCK_H, 4, M(0x7d7399), 0, ROCK_TOP - ROCK_H / 2, 0).rotation.y =
		Math.PI / 4;
	const inR = (y: number) =>
		(ROCK_RT - (ROCK_RT - ROCK_RB) * ((ROCK_TOP - y) / ROCK_H)) / Math.SQRT2;
	(
		[
			[0, -4.2, 1.2],
			[1, -5.4, -1.3],
			[2, -3.6, 1.6],
			[3, -4.9, -1.4],
			[0, -6.6, -0.8],
			[2, -6.2, 0.9]
		] as [number, number, number][]
	).forEach(([face, y, off]) => {
		const c = new THREE.Mesh(
			new THREE.OctahedronGeometry(0.36, 0),
			G(0x62f0e0, 0x2fd6c4, 0.5, 1.6, { roughness: 0.25 })
		);
		c.scale.set(0.7, 1.7, 0.7);
		const r = inR(y) + 0.12,
			tilt = 2.224;
		if (face === 0) {
			c.position.set(r, y, off);
			c.rotation.z = -tilt;
		}
		if (face === 1) {
			c.position.set(-r, y, off);
			c.rotation.z = tilt;
		}
		if (face === 2) {
			c.position.set(off, y, r);
			c.rotation.x = tilt;
		}
		if (face === 3) {
			c.position.set(off, y, -r);
			c.rotation.x = -tilt;
		}
		c.raycast = () => {};
		world.add(c);
	});
	const underGlow = new THREE.PointLight(0x62f0e0, 0, 14, 2);
	underGlow.position.set(0, -5.5, 0);
	world.add(underGlow);

	const islets: { g: THREE.Group; y: number; ph: number }[] = [];
	(
		[
			[-12, -2.5, 5, 0.8],
			[12.5, -5, -4, 0.65],
			[8, -1.2, 12, 0.55],
			[-9, -5.5, -11, 0.7]
		] as [number, number, number, number][]
	).forEach(([x, y, z, s]) => {
		const g = new THREE.Group();
		g.position.set(x, y, z);
		cyl(g, s, 0.15 * s, 1.4 * s, 5, M(0x7d7399), 0, -0.7 * s, 0);
		cyl(g, 1.05 * s, 1.05 * s, 0.22 * s, 5, M(0x72be62), 0, 0.08 * s, 0);
		cyl(g, 0, 0.35 * s, 0.7 * s, 5, M(0x4fae5b), 0.1 * s, 0.55 * s, 0);
		noRay(g);
		world.add(g);
		islets.push({ g, y, ph: rnd() * 6 });
	});

	/* ───────── scenery ───────── */
	const gltfLoader = new GLTFLoader();
	gltfLoader.setMeshoptDecoder(MeshoptDecoder);
	const loadModel = (url: string) => new Promise<THREE.Group>((resolve, reject) => gltfLoader.load(url, (g) => resolve(g.scene), undefined, reject));
	const loadGltf = (url: string) =>
		new Promise<{ scene: THREE.Group; animations: THREE.AnimationClip[] }>((resolve, reject) =>
			gltfLoader.load(url, (g) => resolve({ scene: g.scene, animations: g.animations }), undefined, reject)
		);
	// shared tidy-up for authored models: shadows on, and soften metal so they match the island's matte look
	const finishModel = (m: THREE.Object3D) =>
		m.traverse((o) => {
			const mesh = o as THREE.Mesh;
			if (mesh.isMesh) {
				mesh.castShadow = true;
				mesh.receiveShadow = true;
				const mm = mesh.material as Mat;
				if (mm.metalness > 0.2) mm.metalness = 0.12;
			}
		});
	let krakenPoke: () => void = () => {};
	const obstacles: [number, number, number][] = []; // keeps flowers and grass off buildings and paths
	function tree(x: number, z: number, s = 1, col = 0x4fae5b) {
		const g = new THREE.Group(),
			gm = M(col);
		cyl(g, 0.12 * s, 0.17 * s, 0.6 * s, 6, M(0x7a4e2d), 0, 0.3 * s, 0);
		cyl(g, 0, 0.75 * s, 1.1 * s, 6, gm, 0, 1.15 * s, 0);
		cyl(g, 0, 0.58 * s, 0.95 * s, 6, gm, 0, 1.65 * s, 0);
		cyl(g, 0, 0.4 * s, 0.8 * s, 6, gm, 0, 2.1 * s, 0);
		g.position.set(x, 0, z);
		g.rotation.y = rnd() * 6;
		noRay(g);
		world.add(g);
		blob(x, z, 0.95 * s);
		obstacles.push([x, z, 0.7 * s]);
		const ph = rnd() * 6;
		tick.push((_dt, t) => {
			g.rotation.z = Math.sin(t * 1.2 + ph) * 0.02;
		});
	}
	(
		[
			[-6.5, -6.4, 1.1],
			[6.6, -6.6, 1.2, 0x3f9d57],
			[-6.6, 6.4, 1.2, 0x3f9d57],
			[6.5, 6.5, 1.05],
			[-6.8, -1.9, 0.9, 0x3f9d57],
			[6.9, 2.2, 1],
			[-2.6, 6.6, 0.85],
			[3.3, 6.8, 1],
			[-2.8, -6.9, 0.8],
			[2.9, -7, 0.9, 0x3f9d57],
			[-2.4, 3.2, 0.75],
			[2.6, 2.9, 0.7, 0x3f9d57]
		] as [number, number, number, number?][]
	).forEach(([x, z, s, c]) => tree(x, z, s, c));
	(
		[
			[-1.6, 4.4],
			[-6.9, 2.8],
			[6.9, -2.4],
			[-6.8, -4.9]
		] as [number, number][]
	).forEach(([x, z]) => {
		const b = ball(world, 0.42, M(0x3f9d57), x, 0.3, z, 0);
		b.scale.y = 0.8;
		b.raycast = () => {};
		blob(x, z, 0.6);
		obstacles.push([x, z, 0.5]);
	});
	(
		[
			[-0.8, 5.6],
			[6.7, 4.3],
			[-5.9, -6.3],
			[6.2, 5.6]
		] as [number, number][]
	).forEach(([x, z]) => {
		const r = add(world, new THREE.DodecahedronGeometry(0.34, 0), M(0xa5a1b8), x, 0.2, z);
		r.rotation.set(rnd() * 3, rnd() * 3, 0);
		r.raycast = () => {};
		obstacles.push([x, z, 0.5]);
	});

	// pond, with ripples and a tiny boat
	cyl(world, 1.45, 1.45, 0.06, 18, M(0xa8a4b8), 0.6, 0.01, 5.2);
	const waterU = {
		uTime: { value: 0 },
		uRain: { value: 0 },
		uTop: { value: new THREE.Color(0x6fbdf5) },
		uHor: { value: new THREE.Color(0xffe9c9) },
		uDeep: { value: new THREE.Color(0x0d4a78) },
		uSun: { value: new THREE.Vector3(0, 1, 0) },
		uSunCol: { value: new THREE.Color(0xffffff) }
	};
	const water = cyl(
		world,
		1.3,
		1.3,
		0.08,
		24,
		new THREE.ShaderMaterial({
			uniforms: waterU,
			vertexShader: /* glsl */ `varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position,1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
			fragmentShader: /* glsl */ `
				uniform float uTime, uRain; uniform vec3 uTop, uHor, uDeep, uSun, uSunCol; varying vec3 vW;
				void main() {
					vec2 p = vW.xz * 7.0;
					vec3 n = normalize(vec3(
						sin(p.x * 1.3 + uTime * 1.1) * 0.035 + sin(p.y * 2.1 - uTime * 0.9) * 0.022 + sin((p.x + p.y) * 3.1 + uTime * 1.7) * 0.015,
						1.0,
						cos(p.y * 1.2 - uTime * 1.0) * 0.035 + cos(p.x * 2.3 + uTime * 0.8) * 0.022 + cos((p.x - p.y) * 2.7 - uTime * 1.5) * 0.015));
					n = normalize(vec3(n.x * (1.0 + uRain * 2.5), n.y, n.z * (1.0 + uRain * 2.5)));
					vec3 V = normalize(cameraPosition - vW);
					vec3 R = reflect(-V, n);
					vec3 sky = mix(uHor, uTop, clamp(R.y * 1.4, 0.0, 1.0));
					float f = 0.18 + 0.82 * pow(1.0 - max(dot(n, V), 0.0), 3.0);
					vec3 col = mix(uDeep, sky, f);
					float spec = pow(max(dot(R, normalize(uSun)), 0.0), 140.0);
					col += uSunCol * spec * 1.1;
					float glint = pow(max(sin(p.x * 5.0 + uTime * 2.0) * sin(p.y * 5.0 - uTime * 1.6), 0.0), 40.0);
					col += uSunCol * glint * 0.1;
					gl_FragColor = vec4(col, 1.0);
				}`
		}),
		0.6,
		0.03,
		5.2
	);
	water.castShadow = false;
	water.receiveShadow = false;
	cyl(world, 0.22, 0.22, 0.03, 8, M(0x3f9d57), 1.0, 0.09, 5.0).castShadow = false;
	obstacles.push([0.6, 5.2, 1.8]);
	const ripples = [0, 0.5].map((p0) => {
		const m = new THREE.Mesh(
			new THREE.RingGeometry(0.9, 1, 40),
			new THREE.MeshBasicMaterial({
				color: 0xffffff,
				transparent: true,
				opacity: 0,
				depthWrite: false,
				blending: THREE.AdditiveBlending
			})
		);
		m.rotation.x = -Math.PI / 2;
		m.position.set(0.2 + p0 * 0.6, 0.085, 5.0 + p0 * 0.5);
		m.raycast = () => {};
		world.add(m);
		return { m, p: p0 };
	});
	const boat = new THREE.Group();
	world.add(boat);
	box(boat, 0.5, 0.1, 0.22, M(0x7a4e2d), 0, 0.12, 0);
	box(boat, 0.04, 0.5, 0.04, M(0x5a3a22), 0, 0.4, 0);
	const sail = new THREE.Mesh(
		new THREE.BufferGeometry().setFromPoints([
			new THREE.Vector3(0.02, 0.62, 0),
			new THREE.Vector3(0.02, 0.2, 0),
			new THREE.Vector3(0.3, 0.2, 0)
		]),
		new THREE.MeshBasicMaterial({ color: 0xf6f1e6, side: THREE.DoubleSide })
	);
	sail.geometry.computeVertexNormals();
	boat.add(sail);
	noRay(boat);
	tick.push((_dt, t) => {
		const a = t * 0.25;
		boat.position.set(0.6 + Math.cos(a) * 0.62, 0.02 + Math.sin(t * 2) * 0.02, 5.2 + Math.sin(a) * 0.5);
		boat.rotation.y = -a + Math.PI / 2;
		boat.rotation.z = Math.sin(t * 1.7) * 0.06;
	});

	// plaza + stone path
	cyl(world, 1.45, 1.45, 0.06, 14, M(0xdbc9a5), PLAZA.x, 0.03, PLAZA.z);
	obstacles.push([PLAZA.x, PLAZA.z, 1.6]);
	const stoneMat = M(0xd2c2a0);
	function spoke(bx: number, bz: number, d: number) {
		const dx = PLAZA.x - bx,
			dz = PLAZA.z - bz,
			len = Math.hypot(dx, dz),
			ux = dx / len,
			uz = dz / len;
		const ex = bx + ux * d,
			ez = bz + uz * d,
			n = Math.max(1, Math.round(Math.hypot(ex - PLAZA.x, ez - PLAZA.z) / 0.85));
		for (let k = 0; k <= n; k++) {
			const t = k / n,
				x = PLAZA.x + (ex - PLAZA.x) * t + (rnd() - 0.5) * 0.14,
				z = PLAZA.z + (ez - PLAZA.z) * t + (rnd() - 0.5) * 0.14,
				s = 0.5 + rnd() * 0.2;
			const m = box(world, s, 0.07, s, stoneMat, x, 0.035, z);
			m.rotation.y = rnd() * 1.5;
			m.castShadow = false;
			m.raycast = () => {};
			obstacles.push([x, z, 0.55]);
		}
	}

	/* ───────── interactive registry ───────── */
	const interactives: Item[] = [];
	const byId: Record<string, Item> = {};
	function prep(group: THREE.Group, mats: Mat[], skipHit?: THREE.Object3D) {
		group.traverse((o) => {
			const mesh = o as THREE.Mesh;
			if (!mesh.isMesh || mesh === skipHit) return;
			const m = (mesh.material as Mat).clone();
			mesh.material = m;
			if (m.userData.dn) glowers.push(m);
			else if (m.emissive && m.emissive.getHex() === 0) {
				m.emissive.set(0xff9a3c);
				m.emissiveIntensity = 0;
				m.userData.plain = true;
			} else if (m.emissive) m.userData.baseEI = m.emissiveIntensity;
			mats.push(m);
		});
	}
	function register(id: string, group: THREE.Group, mx: number, my: number, mz: number) {
		const gem = new THREE.Mesh(
			new THREE.OctahedronGeometry(0.18, 0),
			new THREE.MeshStandardMaterial({
				color: 0xffc857,
				emissive: 0xffa726,
				emissiveIntensity: 1.7,
				roughness: 0.3,
				flatShading: true
			})
		);
		gem.position.set(mx, my, mz);
		group.add(gem);
		const mats: Mat[] = [];
		prep(group, mats);
		group.userData.itemId = id;
		const it: Item = { id, group, gem, gy: my, mats, h: 0, ph: rnd() * 6, isFind: false };
		interactives.push(it);
		byId[id] = it;
		return it;
	}
	function registerFind(id: string, group: THREE.Group, hitR = 0.5, hitY = 0.4) {
		const hit = new THREE.Mesh(
			new THREE.SphereGeometry(hitR, 8, 6),
			new THREE.MeshStandardMaterial({ visible: false })
		);
		hit.position.y = hitY;
		group.add(hit);
		const mats: Mat[] = [];
		prep(group, mats);
		group.userData.itemId = id;
		const it: Item = { id, group, gem: null, gy: 0, mats, h: 0, ph: rnd() * 6, isFind: true };
		interactives.push(it);
		byId[id] = it;
		return it;
	}

	/* ═══════════ THE WORKSHOP — GitHub ═══════════ */
	{
		const g = new THREE.Group();
		g.position.set(-4.4, 0, -3.8);
		faceTo(g);
		world.add(g);
		const kids: Kid[] = [];
		blob(-4.4, -3.8, 2.4, 2.1, g.rotation.y);
		box(g, 3.2, 0.2, 2.8, M(0x9a96ab), 0, 0.1, 0);
		box(g, 3.0, 1.9, 2.6, M(0xf3e3c3), 0, 1.15, 0);
		(
			[
				[-1.5, -1.3],
				[1.5, -1.3],
				[-1.5, 1.3],
				[1.5, 1.3]
			] as [number, number][]
		).forEach(([x, z]) => box(g, 0.14, 1.9, 0.14, M(0x7a4e2d), x, 1.15, z));
		box(g, 3.04, 0.12, 2.64, M(0x7a4e2d), 0, 2.08, 0);
		const roofGeo = new THREE.ConeGeometry(1, 1.4, 4, 1);
		roofGeo.rotateY(Math.PI / 4);
		add(g, roofGeo, M(0xd2573c), 0, 2.8, 0).scale.set(2.404, 1, 2.121);
		box(g, 0.78, 1.2, 0.08, M(0x7a4e2d), 0, 0.8, 1.32);
		ball(g, 0.05, M(0xf2c14e, { metalness: 0.6, roughness: 0.3 }), 0.25, 0.8, 1.38, 0);
		const signTex = canvasTex(512, 128, (c, w, h) => {
			c.fillStyle = '#3b2a22';
			c.fillRect(0, 0, w, h);
			c.strokeStyle = '#ffb347';
			c.lineWidth = 6;
			c.strokeRect(8, 8, w - 16, h - 16);
			c.fillStyle = '#ffb347';
			c.font = '700 62px ' + SANS;
			c.textAlign = 'center';
			c.textBaseline = 'middle';
			c.fillText('DADDOO DEV', w / 2, h / 2 + 4);
		});
		add(
			g,
			new THREE.PlaneGeometry(1.7, 0.42),
			new THREE.MeshStandardMaterial({ map: signTex, roughness: 0.7 }),
			0,
			1.72,
			1.345
		).castShadow = false;
		const win = () => G(0xffd27a, 0xffc15a, 0.12, 0.5);
		[-0.95, 0.95].forEach((x) => {
			box(g, 0.7, 0.7, 0.06, M(0x7a4e2d), x, 1.35, 1.31);
			box(g, 0.54, 0.54, 0.08, win(), x, 1.35, 1.33);
		});
		[-0.5, 0.5].forEach((z) => {
			box(g, 0.06, 0.7, 0.7, M(0x7a4e2d), 1.51, 1.35, z);
			box(g, 0.08, 0.54, 0.54, win(), 1.53, 1.35, z);
		});
		box(g, 0.46, 1.5, 0.46, M(0xa5513d), 0.9, 2.7, -0.4);
		box(g, 0.58, 0.1, 0.58, M(0x7a3a2c), 0.9, 3.48, -0.4);
		const smoke: { m: THREE.Mesh; p: number }[] = [];
		for (let i = 0; i < 6; i++) {
			const m = new THREE.Mesh(
				new THREE.IcosahedronGeometry(0.16, 0),
				new THREE.MeshStandardMaterial({
					color: 0xffffff,
					transparent: true,
					opacity: 0.5,
					roughness: 1,
					flatShading: true
				})
			);
			m.raycast = () => {};
			g.add(m);
			smoke.push({ m, p: i / 6 });
		}
		const gear = new THREE.Group();
		gear.position.set(1.62, 0.55, 0);
		g.add(gear);
		const gm = M(0xf2c14e, { metalness: 0.7, roughness: 0.35 });
		cyl(gear, 0.34, 0.34, 0.12, 12, gm, 0, 0, 0).rotation.z = Math.PI / 2;
		for (let k = 0; k < 8; k++) {
			const a = (k / 8) * Math.PI * 2;
			box(gear, 0.12, 0.16, 0.16, gm, 0, Math.cos(a) * 0.42, Math.sin(a) * 0.42).rotation.x = -a;
		}
		const wl = new THREE.PointLight(0xffc46b, 0, 3.5, 2);
		wl.position.set(0, 1.3, 2.4);
		g.add(wl);
		nl(wl, 0, 1.6);
		// katana on its stand
		{
			const ks = new THREE.Group();
			ks.position.set(-2.15, 0, 1.0);
			ks.rotation.y = 0.4;
			g.add(ks);
			const wd = M(0x3b2a22);
			box(ks, 0.9, 0.05, 0.26, wd, 0, 0.025, 0);
			[-0.36, 0.36].forEach((x) => box(ks, 0.05, 0.5, 0.05, wd, x, 0.28, -0.06));
			[-0.3, 0.3].forEach((x) => box(ks, 0.07, 0.05, 0.1, wd, x, 0.31, 0));
			box(ks, 0.66, 0.026, 0.012, M(0xdfe6f5, { metalness: 0.85, roughness: 0.25 }), 0.14, 0.37, 0);
			box(ks, 0.28, 0.04, 0.04, M(0x1d2a4a), -0.34, 0.37, 0);
			cyl(ks, 0.05, 0.05, 0.015, 10, M(0xf2c14e, { metalness: 0.7 }), -0.2, 0.37, 0).rotation.z =
				Math.PI / 2;
			kids.push(['katana', ks, 0.6, 0.3]);
		}
		register('workshop', g, 0, 4.4, 0);
		kids.forEach((k) => registerFind(...k));
		tick.push((dt, t) => {
			gear.rotation.x += dt * 0.8;
			for (const s of smoke) {
				s.p = (s.p + dt * 0.17) % 1;
				const p = s.p;
				s.m.position.set(0.9 + Math.sin(p * 5 + s.m.id) * 0.1 + p * 0.55, 3.6 + p * 1.7, -0.4);
				s.m.scale.setScalar(0.5 + p * 1.6);
				(s.m.material as THREE.MeshStandardMaterial).opacity = 0.5 * (1 - p);
			}
			void t;
		});
		obstacles.push([-4.4, -3.8, 2.4]);
		spoke(-4.4, -3.8, 1.9);
	}

	/* ═══════════ THE CHAPEL — faith & formation apps ═══════════ */
	{
		const g = new THREE.Group();
		g.position.set(5.0, 0, -3.8);
		faceTo(g);
		world.add(g);
		const kids: Kid[] = [];
		blob(5.0, -3.8, 2.4, 3.0, g.rotation.y);
		const stone = M(0xe9e2d0),
			wood = M(0x7a4e2d),
			slate = M(0x59638f);
		box(g, 2.4, 0.2, 5.0, M(0x9a96ab), 0, 0.1, 0.5);
		const platformN = g.children.length;
		box(g, 2.0, 1.7, 3.0, stone, 0, 1.05, -0.5);
		const th = 0.7,
			w = 1.15,
			Ls = w / Math.cos(th);
		(
			[
				[-1, th],
				[1, -th]
			] as [number, number][]
		).forEach(([s, rz]) => {
			box(g, Ls, 0.1, 3.3, slate, (s * w) / 2, 2.4, -0.5).rotation.z = rz;
		});
		const gable = new THREE.Shape();
		gable.moveTo(-1.0, 0);
		gable.lineTo(1.0, 0);
		gable.lineTo(0, 1.0);
		gable.closePath();
		[-2.0, 0.94].forEach((z) => {
			const m = new THREE.Mesh(new THREE.ExtrudeGeometry(gable, { depth: 0.06, bevelEnabled: false }), stone);
			m.position.set(0, 1.9, z);
			m.castShadow = true;
			g.add(m);
		});
		box(g, 1.1, 2.7, 1.1, stone, 0, 1.55, 1.55);
		box(g, 0.5, 0.6, 1.14, M(0x2a2236), 0, 2.45, 1.55);
		box(g, 1.14, 0.6, 0.5, M(0x2a2236), 0, 2.45, 1.55);
		const spireGeo = new THREE.ConeGeometry(0.78, 1.5, 4, 1);
		spireGeo.rotateY(Math.PI / 4);
		add(g, spireGeo, slate, 0, 4.15, 1.55);
		const gold = M(0xf2c14e, { metalness: 0.7, roughness: 0.3 });
		box(g, 0.08, 0.6, 0.08, gold, 0, 5.2, 1.55);
		box(g, 0.34, 0.08, 0.08, gold, 0, 5.3, 1.55);
		box(g, 0.74, 1.2, 0.08, wood, 0, 0.8, 2.12);
		const rose = canvasTex(128, 128, (c) => {
			const cols = ['#d63c4a', '#2f6fdd', '#f2c14e', '#2fa86a', '#9b5de5', '#ff8a3d'];
			for (let i = 0; i < 12; i++) {
				c.fillStyle = cols[i % cols.length];
				c.beginPath();
				c.moveTo(64, 64);
				c.arc(64, 64, 62, (i * Math.PI) / 6, ((i + 1) * Math.PI) / 6);
				c.fill();
			}
			c.strokeStyle = '#1b1530';
			c.lineWidth = 4;
			for (let i = 0; i < 12; i++) {
				c.beginPath();
				c.moveTo(64, 64);
				c.lineTo(64 + 62 * Math.cos((i * Math.PI) / 6), 64 + 62 * Math.sin((i * Math.PI) / 6));
				c.stroke();
			}
			c.beginPath();
			c.arc(64, 64, 62, 0, 7);
			c.stroke();
			c.beginPath();
			c.arc(64, 64, 22, 0, 7);
			c.stroke();
		});
		const roseMesh = new THREE.Mesh(new THREE.CircleGeometry(0.36, 20), glassMat(rose, 0.25, 1.0));
		roseMesh.position.set(0, 1.95, 2.11);
		g.add(roseMesh);
		const lancet = canvasTex(64, 128, (c, ww, hh) => {
			const gr = c.createLinearGradient(0, 0, 0, hh);
			gr.addColorStop(0, '#2f6fdd');
			gr.addColorStop(0.5, '#9b5de5');
			gr.addColorStop(1, '#d63c4a');
			c.fillStyle = gr;
			c.fillRect(0, 0, ww, hh);
			c.strokeStyle = '#1b1530';
			c.lineWidth = 5;
			c.strokeRect(2, 2, ww - 4, hh - 4);
			c.beginPath();
			c.moveTo(ww / 2, 0);
			c.lineTo(ww / 2, hh);
			c.moveTo(0, hh / 2);
			c.lineTo(ww, hh / 2);
			c.stroke();
		});
		[-1, 1].forEach((s) =>
			[-1.5, -0.2].forEach((z) => {
				const m = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.95), glassMat(lancet, 0.5, 1.9));
				m.position.set(s * 1.012, 1.1, z);
				m.rotation.y = (s * Math.PI) / 2;
				g.add(m);
			})
		);
		const shell = g.children.slice(platformN);
		const cl = new THREE.PointLight(0xffb66b, 0, 4, 2);
		cl.position.set(0, 1.3, 3.2);
		g.add(cl);
		nl(cl, 0, 1);

		// a tiny Swiss Guard on duty at the door
		{
			const gd = new THREE.Group();
			gd.position.set(0.95, 0, 2.75);
			gd.rotation.y = -0.3;
			gd.scale.setScalar(0.8);
			g.add(gd);
			const uni = canvasTex(128, 64, (c, ww, hh) => {
				const cols = ['#d62839', '#f2c14e', '#2f6fdd'];
				for (let i = 0; i < 12; i++) {
					c.fillStyle = cols[i % 3];
					c.fillRect((i * ww) / 12, 0, ww / 12 + 1, hh);
				}
			});
			add(
				gd,
				new THREE.CylinderGeometry(0.17, 0.2, 0.5, 12),
				new THREE.MeshStandardMaterial({ map: uni, roughness: 0.8 }),
				0,
				0.62,
				0
			);
			cyl(gd, 0.055, 0.06, 0.38, 6, M(0xd62839), -0.07, 0.19, 0);
			cyl(gd, 0.055, 0.06, 0.38, 6, M(0x2f6fdd), 0.07, 0.19, 0);
			ball(gd, 0.13, M(0xf0c9a0), 0, 1.0, 0, 1);
			const steel = M(0xaab0c4, { metalness: 0.7, roughness: 0.35 });
			add(gd, new THREE.SphereGeometry(0.15, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), steel, 0, 1.03, 0);
			cyl(gd, 0.21, 0.21, 0.02, 10, steel, 0, 1.03, 0);
			box(gd, 0.03, 0.2, 0.12, M(0xd62839), 0, 1.2, 0);
			box(gd, 0.06, 0.3, 0.06, M(0xd62839), 0.2, 0.68, 0).rotation.z = -0.25;
			cyl(gd, 0.016, 0.016, 1.45, 5, M(0x5a3a22), 0.29, 0.72, 0.02);
			box(gd, 0.02, 0.16, 0.12, steel, 0.29, 1.32, 0.02);
			add(gd, new THREE.ConeGeometry(0.03, 0.18, 5), steel, 0.29, 1.52, 0.02);
			kids.push(['swiss', gd, 0.7, 0.8]);
		}
		// Celtic high cross
		{
			const cr = new THREE.Group();
			cr.position.set(-1.7, 0, 2.9);
			cr.rotation.y = 0.25;
			g.add(cr);
			const sm = M(0xa9b0a0);
			box(cr, 0.5, 0.14, 0.5, sm, 0, 0.07, 0);
			box(cr, 0.16, 1.3, 0.12, sm, 0, 0.79, 0);
			box(cr, 0.64, 0.14, 0.12, sm, 0, 0.98, 0);
			const ringC = new THREE.Mesh(new THREE.TorusGeometry(0.27, 0.04, 5, 18), sm);
			ringC.position.y = 0.98;
			ringC.castShadow = true;
			cr.add(ringC);
			kids.push(['cross', cr, 0.7, 0.8]);
		}
		// memento mori: skull, candle and marigolds
		{
			const sk = new THREE.Group();
			sk.position.set(1.75, 0, 0.7);
			g.add(sk);
			box(sk, 0.5, 0.3, 0.5, M(0x8f8a9e), 0, 0.15, 0);
			const bone = M(0xf3ead2);
			ball(sk, 0.15, bone, 0, 0.46, 0, 1);
			box(sk, 0.14, 0.07, 0.1, bone, 0, 0.33, 0.05);
			[-0.055, 0.055].forEach((x) => ball(sk, 0.035, M(0x1b1530), x, 0.48, 0.125, 0));
			cyl(sk, 0.04, 0.04, 0.2, 8, M(0xfff4d0), 0.17, 0.4, 0.1);
			add(sk, new THREE.ConeGeometry(0.035, 0.11, 6), G(0xffd27a, 0xffa726, 1.4, 2.6), 0.17, 0.56, 0.1).castShadow =
				false;
			for (let i = 0; i < 9; i++) {
				const a = (i / 9) * Math.PI * 2;
				ball(sk, 0.065, M(i % 2 ? 0xff9f1c : 0xffb703), Math.cos(a) * 0.4, 0.07, Math.sin(a) * 0.4, 0);
			}
			const cl2 = new THREE.PointLight(0xffa24a, 0, 3, 2);
			cl2.position.set(0.17, 0.7, 0.1);
			sk.add(cl2);
			nl(cl2, 0.2, 2.2);
			kids.push(['skull', sk, 0.5, 0.4]);
		}
		register('chapel', g, 0, 6.2, 1.55);
		// authored church (Poly by Google, CC-BY, via Poly Pizza; meshopt + WebP, ~58 KB); procedural chapel stays if it fails to load
		loadModel('/island/church.glb')
			.then((m) => {
				m.scale.setScalar(0.2); // source is ~13 x 29 x 24 units; tower at +z
				m.position.set(0, 0.2, 0.5);
				m.traverse((o) => {
					const mesh = o as THREE.Mesh;
					if (mesh.isMesh) {
						mesh.castShadow = true;
						mesh.receiveShadow = true;
					}
				});
				shell.forEach((o) => g.remove(o));
				g.add(m);
				prep(m, byId.chapel.mats);
				lastTod = -1;
			})
			.catch(() => {});
		kids.forEach((k) => registerFind(...k));
		obstacles.push([5.0, -3.8, 3.0]);
		spoke(5.0, -3.8, 3.0);
	}

	/* ═══════════ THE TOOLSHED — practical tools I built because I needed them ═══════════ */
	{
		const g = new THREE.Group();
		g.position.set(4.8, 0, 4.2);
		faceTo(g);
		world.add(g);
		blob(4.8, 4.2, 1.7, 1.5, g.rotation.y);
		box(g, 2.3, 0.15, 1.9, M(0x9a96ab), 0, 0.075, 0);
		box(g, 2.0, 1.1, 1.5, M(0x8aa0b0), 0, 0.7, 0);
		[-0.67, 0, 0.67].forEach((x) => box(g, 0.05, 1.1, 1.54, M(0x7a90a2), x, 0.7, 0));
		box(g, 2.5, 0.08, 1.9, M(0x59638f), 0, 1.33, 0).rotation.z = 0.12;
		box(g, 0.62, 0.9, 0.05, M(0x7a4e2d), -0.45, 0.6, 0.77);
		box(g, 0.55, 0.45, 0.05, G(0xffe29a, 0xffc860, 0.25, 1.5), 0.55, 0.78, 0.77);
		box(g, 0.65, 0.08, 0.09, M(0x7a4e2d), 0.55, 0.5, 0.78);
		const steel = M(0xaab0c4, { metalness: 0.7, roughness: 0.35 });
		const wr = new THREE.Group();
		wr.position.set(1.25, 0.55, 0.55);
		wr.rotation.z = -0.25;
		g.add(wr);
		box(wr, 0.09, 0.8, 0.03, steel, 0, 0, 0);
		add(wr, new THREE.TorusGeometry(0.1, 0.035, 5, 10), steel, 0, 0.45, 0);
		register('toolshed', g, 0, 2.7, 0);
		obstacles.push([4.8, 4.2, 1.8]);
		spoke(4.8, 4.2, 1.3);
	}

	/* ═══════════ THE ARCADE — games ═══════════ */
	{
		const g = new THREE.Group();
		g.position.set(-4.8, 0, 3.6);
		faceTo(g);
		world.add(g);
		blob(-4.8, 3.6, 1.2, 1.1, g.rotation.y);
		const A = new THREE.Group();
		A.position.y = 0.25;
		g.add(A);
		box(g, 1.4, 0.25, 1.2, M(0x20203a), 0, 0.125, 0);
		box(A, 1.3, 2.3, 1.1, M(0x5a46d6), 0, 1.15, 0);
		[-0.66, 0.66].forEach((x) => box(A, 0.03, 2.1, 0.55, M(0xffd23f), x, 1.1, -0.1));
		box(A, 1.3, 0.2, 0.7, M(0x3a2f94), 0, 1.0, 0.8).rotation.x = 0.12;
		cyl(A, 0.03, 0.03, 0.3, 6, M(0xcccccc), -0.3, 1.24, 0.85);
		ball(A, 0.1, M(0xff4d6d), -0.3, 1.42, 0.85, 1);
		cyl(A, 0.075, 0.075, 0.05, 10, M(0xffd23f), 0.1, 1.12, 0.85);
		cyl(A, 0.075, 0.075, 0.05, 10, M(0x62f0e0), 0.34, 1.12, 0.8);
		const mt = canvasTex(256, 64, (c, w, h) => {
			c.fillStyle = '#ff4fa3';
			c.fillRect(0, 0, w, h);
			c.fillStyle = '#fff';
			c.font = '700 38px ' + SANS;
			c.textAlign = 'center';
			c.textBaseline = 'middle';
			c.fillText('ARCADE', w / 2, h / 2 + 2);
		});
		box(A, 1.3, 0.34, 1.1, G(0xff4fa3, 0xff4fa3, 0.3, 0.9), 0, 2.47, 0);
		const mq = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.3), glassMat(mt, 0.7, 1.0));
		mq.position.set(0, 2.47, 0.555);
		A.add(mq);
		// live mini-game: bouncing ball + bricks
		const W = 160,
			H = 128,
			sc = document.createElement('canvas');
		sc.width = W;
		sc.height = H;
		const sg = sc.getContext('2d')!;
		const stex = new THREE.CanvasTexture(sc);
		stex.colorSpace = THREE.SRGBColorSpace;
		stex.magFilter = stex.minFilter = THREE.NearestFilter;
		const rowCol = ['#ff4d6d', '#ffb347', '#ffd23f', '#62f0e0'];
		let bricks: { x: number; y: number; c: string; on: boolean }[] = [];
		let bx = 80,
			by = 90,
			bvx = 1.5,
			bvy = -1.7,
			px = 70,
			acc = 0;
		const reset = () => {
			bricks = [];
			for (let r = 0; r < 4; r++)
				for (let c = 0; c < 8; c++) bricks.push({ x: 8 + c * 18, y: 12 + r * 9, c: rowCol[r], on: true });
			bx = 80;
			by = 90;
			bvx = 1.5;
			bvy = -1.7;
			px = 70;
		};
		reset();
		const step = () => {
			bx += bvx;
			by += bvy;
			if (bx < 3 || bx > W - 3) bvx = -bvx;
			if (by < 3) bvy = Math.abs(bvy);
			if (by > H - 14 && by < H - 8 && Math.abs(bx - px - 12) < 16 && bvy > 0) bvy = -Math.abs(bvy);
			if (by > H) {
				bx = 80;
				by = 90;
				bvy = -1.7;
			}
			for (const b of bricks)
				if (b.on && bx > b.x - 2 && bx < b.x + 18 && by > b.y - 2 && by < b.y + 9) {
					b.on = false;
					bvy = -bvy;
					break;
				}
			if (!bricks.some((b) => b.on)) reset();
			px += (bx - 12 - px) * 0.2;
			px = Math.max(2, Math.min(W - 26, px));
			sg.fillStyle = '#0a0a22';
			sg.fillRect(0, 0, W, H);
			for (const b of bricks)
				if (b.on) {
					sg.fillStyle = b.c;
					sg.fillRect(b.x, b.y, 16, 7);
				}
			sg.fillStyle = '#fff';
			sg.fillRect(bx - 2, by - 2, 4, 4);
			sg.fillStyle = '#7c8cff';
			sg.fillRect(px, H - 10, 24, 4);
			stex.needsUpdate = true;
		};
		step();
		const scrM = new THREE.MeshStandardMaterial({
			map: stex,
			emissiveMap: stex,
			emissive: 0xffffff,
			emissiveIntensity: 0.8
		});
		scrM.userData.dn = [0.8, 1.1];
		glowers.push(scrM);
		const screen = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.8), scrM);
		screen.position.set(0, 1.6, 0.558);
		A.add(screen);
		box(A, 1.12, 0.92, 0.04, M(0x14142b), 0, 1.6, 0.545);
		register('arcade', g, 0, 3.45, 0);
		// authored cabinet (J-Toastie, CC-BY, via Poly Pizza; ~19 KB). Its screen mesh gets the live game; procedural cabinet stays if it fails to load.
		loadModel('/island/arcade.glb')
			.then((m) => {
				m.rotation.y = -Math.PI / 2; // model faces +x, the island's cabinet faces +z
				m.position.set(0, 0.25, -0.17);
				finishModel(m);
				m.updateMatrixWorld(true);
				m.traverse((o) => {
					const mesh = o as THREE.Mesh;
					if (mesh.isMesh && mesh.name === 'ArcadeMachine_Cube002-Mesh') {
						// the cabinet is near-black; a faint violet glow keeps it readable and on-palette
						const bm = (mesh.material as Mat).clone();
						bm.emissive.set(0x4a3bb5);
						bm.emissiveIntensity = 0.35;
						mesh.material = bm;
					}
					if (!mesh.isMesh || mesh.name !== 'GameScreen_Plane') return;
					// the plane's UVs point at one palette pixel; lay them across the screen instead
					const pos = mesh.geometry.attributes.position;
					const uv = new Float32Array(pos.count * 2);
					const v = new THREE.Vector3();
					const rel = m.matrixWorld.clone().invert().multiply(mesh.matrixWorld); // mesh space -> model space
					for (let i = 0; i < pos.count; i++) {
						v.fromBufferAttribute(pos, i).applyMatrix4(rel);
						uv[i * 2] = (0.39 - v.z) / 0.78;
						uv[i * 2 + 1] = (v.y - 1.5) / 0.78;
					}
					mesh.geometry = mesh.geometry.clone();
					mesh.geometry.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
					mesh.material = scrM;
					mesh.castShadow = false;
				});
				const mq2 = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.2), glassMat(mt, 0.7, 1.0));
				mq2.position.set(0.3, 2.44, 0);
				mq2.rotation.y = Math.PI / 2;
				m.add(mq2);
				g.remove(A);
				g.add(m);
				prep(m, byId.arcade.mats);
				lastTod = -1;
			})
			.catch(() => {});
		tick.push((dt) => {
			acc += dt;
			if (acc > 0.05) {
				acc = 0;
				step();
			}
		});
		obstacles.push([-4.8, 3.6, 1.5]);
		spoke(-4.8, 3.6, 1.4);
	}

	/* ═══════════ APP STORE gate — floating phone ═══════════ */
	{
		const g = new THREE.Group();
		g.position.set(5.9, 0, 0.2);
		faceTo(g);
		world.add(g);
		blob(5.9, 0.2, 1.0);
		cyl(g, 0.8, 0.9, 0.3, 14, M(0x9a96ab), 0, 0.15, 0);
		const ring = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.03, 6, 28), G(0xffb347, 0xffa726, 0.5, 1.4));
		ring.rotation.x = Math.PI / 2;
		ring.position.y = 0.33;
		g.add(ring);
		const ph = new THREE.Group();
		ph.position.y = 1.7;
		g.add(ph);
		box(ph, 1.32, 2.5, 0.2, M(0x3a3f78, { metalness: 0.6, roughness: 0.35, flatShading: false }), 0, 0, 0);
		const tex = canvasTex(256, 512, (c, w, h) => {
			const gr = c.createLinearGradient(0, 0, 0, h);
			gr.addColorStop(0, '#16205a');
			gr.addColorStop(1, '#ff7a59');
			c.fillStyle = gr;
			c.fillRect(0, 0, w, h);
			c.fillStyle = 'rgba(255,255,255,.92)';
			c.font = '700 22px ' + SANS;
			c.textAlign = 'center';
			c.fillText('9:41', w / 2, 36);
			const pal = ['#ffb347', '#62f0e0', '#ff6b9a', '#7c8cff', '#7ee081', '#ffd23f', '#ff8a5c', '#b48cff'],
				cols = 4,
				pad = 18,
				sz = (w - pad * (cols + 1)) / cols;
			for (let r = 0; r < 5; r++)
				for (let q = 0; q < cols; q++) {
					const x = pad + q * (sz + pad),
						y = 66 + r * (sz + 28);
					c.fillStyle = pal[(r * 3 + q * 5) % pal.length];
					rr(c, x, y, sz, sz, 11);
					c.fill();
					c.fillStyle = 'rgba(255,255,255,.55)';
					c.beginPath();
					c.arc(x + sz / 2, y + sz / 2, sz * (0.16 + ((r + q) % 3) * 0.05), 0, 7);
					c.fill();
				}
			c.fillStyle = 'rgba(255,255,255,.22)';
			rr(c, 14, h - 74, w - 28, 58, 18);
			c.fill();
		});
		const scr = new THREE.Mesh(new THREE.PlaneGeometry(1.16, 2.32), glassMat(tex, 0.6, 1.1));
		scr.position.z = 0.105;
		ph.add(scr);
		register('appstore', g, 0, 3.55, 0);
		tick.push((_dt, t) => {
			ph.position.y = 1.7 + Math.sin(t * 1.6) * 0.09;
			ph.rotation.y = Math.sin(t * 0.8) * 0.18;
			ring.rotation.z = t * 0.6;
		});
		obstacles.push([5.9, 0.2, 1.4]);
		spoke(5.9, 0.2, 1.3);
	}

	/* ═══════════ GOOGLE PLAY gate — play-button sign ═══════════ */
	{
		const g = new THREE.Group();
		g.position.set(-6.0, 0, 0);
		faceTo(g);
		world.add(g);
		blob(-6.0, 0, 1.1);
		[-0.75, 0.75].forEach((x) => cyl(g, 0.08, 0.09, 1.4, 6, M(0x7a4e2d), x, 0.7, 0));
		const sg = new THREE.Group();
		sg.position.y = 2.05;
		g.add(sg);
		box(sg, 2.2, 1.8, 0.14, M(0x2c3a63), 0, 0, 0);
		box(sg, 2.0, 1.6, 0.12, M(0xf6f1e6), 0, 0, 0.04);
		box(sg, 2.0, 1.6, 0.12, M(0xf6f1e6), 0, 0, -0.04);
		const sh = new THREE.Shape();
		sh.moveTo(-0.45, -0.6);
		sh.lineTo(0.72, 0);
		sh.lineTo(-0.45, 0.6);
		sh.closePath();
		const triM = G(0x16c47f, 0x0a8a55, 0.25, 0.9, { flatShading: true });
		const tri = new THREE.Mesh(
			new THREE.ExtrudeGeometry(sh, {
				depth: 0.14,
				bevelEnabled: true,
				bevelSize: 0.05,
				bevelThickness: 0.04,
				bevelSegments: 1
			}),
			triM
		);
		tri.position.set(-0.08, 0, 0.1);
		tri.castShadow = true;
		sg.add(tri);
		const tri2 = tri.clone();
		tri2.rotation.y = Math.PI;
		tri2.position.set(0.08, 0, -0.1);
		sg.add(tri2);
		register('play', g, 0, 3.55, 0);
		tick.push((_dt, t) => {
			sg.rotation.y = Math.sin(t * 0.9) * 0.14;
		});
		obstacles.push([-6.0, 0, 1.5]);
		spoke(-6.0, 0, 1.1);
	}

	/* ═══════════ SIGNPOST ═══════════ */
	{
		const g = new THREE.Group();
		g.position.set(PLAZA.x, 0, PLAZA.z);
		world.add(g);
		box(g, 0.2, 2.3, 0.2, M(0x7a4e2d), 0, 1.15, 0);
		cyl(g, 0.16, 0.16, 0.12, 6, M(0x7a4e2d), 0, 2.36, 0);
		const plank = (id: string, label: string, y: number, rot: number, hex: number, css: string) => {
			const p = new THREE.Group();
			p.position.y = y;
			p.rotation.y = rot;
			g.add(p);
			const wood = M(hex);
			box(p, 1.9, 0.38, 0.07, wood, 1.05, 0, 0);
			box(p, 0.27, 0.27, 0.07, wood, 2.0, 0, 0).rotation.z = Math.PI / 4;
			const tx = canvasTex(512, 96, (c, w, h) => {
				c.fillStyle = css;
				c.fillRect(0, 0, w, h);
				c.fillStyle = '#2b1d14';
				c.font = '700 50px ' + SANS;
				c.textAlign = 'center';
				c.textBaseline = 'middle';
				c.fillText(label, w / 2, h / 2 + 3);
			});
			const mat = new THREE.MeshStandardMaterial({ map: tx, roughness: 0.8 });
			(
				[
					[0.04, 0],
					[-0.04, Math.PI]
				] as [number, number][]
			).forEach(([z, ry]) => {
				const m = new THREE.Mesh(new THREE.PlaneGeometry(1.75, 0.3), mat);
				m.position.set(1.0, 0, z);
				m.rotation.y = ry;
				p.add(m);
			});
			register(id, p, 1.05, 0.5, 0);
		};
		plank('ginny', 'GODSPEED GINNY >', 1.85, -0.55, 0xc08a54, '#c08a54');
		plank('repos', 'ALL REPOS >', 1.3, 0.7, 0xa9744a, '#a9744a');
		plank('back', 'BACK TO NORMAL >', 0.78, 0.1, 0x8f6a45, '#8f6a45');
	}

	/* ═══════════ MISSION CONTROL — status and contact ═══════════ */
	{
		const g = new THREE.Group();
		g.position.set(0, 0, -6.1);
		faceTo(g);
		world.add(g);
		blob(0, -6.1, 2.6, 1.8);
		box(g, 4.0, 0.2, 2.8, M(0x8d93ad), 0, 0.1, 0);
		box(g, 3.6, 1.3, 2.3, M(0xc9cfe2, { metalness: 0.2 }), 0, 0.85, 0);
		box(g, 3.7, 0.12, 2.4, M(0x59638f), 0, 1.56, 0);
		const strip = canvasTex(512, 88, () => {});
		const sx = (strip.userData.canvas as HTMLCanvasElement).getContext('2d')!;
		const draw = (t: number) => {
			sx.fillStyle = '#06142a';
			sx.fillRect(0, 0, 512, 88);
			sx.fillStyle = '#62f0e0';
			sx.textBaseline = 'middle';
			sx.textAlign = 'left';
			sx.font = '700 30px ' + MONO;
			sx.fillText('MISSION CONTROL', 16, 28);
			sx.fillStyle = 'rgba(98,240,224,.65)';
			sx.font = '500 17px ' + MONO;
			sx.fillText('ALL SYSTEMS NOMINAL', 16, 62);
			for (let i = 0; i < 22; i++) {
				const v = 0.3 + 0.6 * Math.abs(Math.sin(t * 1.7 + i * 0.7) * Math.cos(t * 0.9 + i * 0.3)),
					bh = v * 70;
				sx.fillStyle = i % 7 === 3 ? '#ffb347' : '#62f0e0';
				sx.fillRect(296 + i * 10, 82 - bh, 7, bh);
			}
			strip.needsUpdate = true;
		};
		draw(0);
		const sm = new THREE.Mesh(new THREE.PlaneGeometry(3.1, 0.53), glassMat(strip, 0.7, 1.4));
		sm.position.set(0, 1.0, 1.16);
		g.add(sm);
		box(g, 3.2, 0.62, 0.06, M(0x14142b), 0, 1.0, 1.15);
		box(g, 0.7, 0.7, 0.06, M(0x2a2e48), 1.3, 0.55, 1.16);
		// radar dish
		cyl(g, 0.14, 0.18, 0.7, 8, M(0x59638f), -0.9, 1.97, 0);
		const dishPivot = new THREE.Group();
		dishPivot.position.set(-0.9, 2.5, 0);
		g.add(dishPivot);
		const dish = new THREE.Mesh(
			new THREE.SphereGeometry(0.95, 20, 8, 0, Math.PI * 2, 0, 0.95),
			M(0xe8ecf6, { metalness: 0.3, side: THREE.DoubleSide })
		);
		dish.rotation.x = Math.PI - 0.8;
		dish.castShadow = true;
		dishPivot.add(dish);
		ball(dishPivot, 0.09, M(0xff4d6d), 0, 0.55, -0.62, 0);
		// antenna mast with blinking beacon
		cyl(g, 0.04, 0.06, 1.9, 6, M(0x59638f), 1.3, 2.5, -0.5);
		const beaconM = new THREE.MeshStandardMaterial({ color: 0xff3b4f, emissive: 0xff3b4f, emissiveIntensity: 1 });
		const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 6), beaconM);
		beacon.position.set(1.3, 3.5, -0.5);
		g.add(beacon);
		// glass lab tower
		const tw = new THREE.Group();
		tw.position.set(2.5, 0, 0.1);
		g.add(tw);
		cyl(tw, 0.5, 0.55, 2.3, 12, M(0xc9cfe2, { metalness: 0.3 }), 0, 1.3, 0);
		[0.7, 1.3, 1.9].forEach((y) => {
			const r = new THREE.Mesh(new THREE.TorusGeometry(0.53, 0.035, 5, 24), G(0x62f0e0, 0x62f0e0, 0.6, 2.2));
			r.rotation.x = Math.PI / 2;
			r.position.y = y + 0.15;
			tw.add(r);
		});
		const dome = new THREE.Mesh(
			new THREE.SphereGeometry(0.52, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2),
			new THREE.MeshStandardMaterial({ color: 0x62f0e0, transparent: true, opacity: 0.35, roughness: 0.1, metalness: 0.3 })
		);
		dome.position.y = 2.45;
		tw.add(dome);
		const orbMesh = new THREE.Mesh(new THREE.IcosahedronGeometry(0.2, 1), G(0x62f0e0, 0x62f0e0, 0.6, 2.4));
		orbMesh.position.y = 2.7;
		tw.add(orbMesh);
		const mcl = new THREE.PointLight(0x62f0e0, 0, 6, 2);
		mcl.position.set(0, 1.2, 2.2);
		g.add(mcl);
		nl(mcl, 0, 3.5);
		let acc = 0;
		tick.push((dt, t) => {
			dishPivot.rotation.y = t * 0.45;
			beaconM.emissiveIntensity = Math.sin(t * 4) > 0.6 ? 2.4 : 0.15;
			orbMesh.rotation.y = t * 1.2;
			orbMesh.position.y = 2.7 + Math.sin(t * 1.5) * 0.06;
			acc += dt;
			if (acc > 0.12) {
				acc = 0;
				draw(t);
			}
		});
		register('mission', g, 0, 4.1, 0);
		beacon.material = beaconM; // keep the blink: register() clones materials for hover glow
		obstacles.push([0, -6.1, 2.6]);
	}

	/* ───────── research-station extras: holo pad + patrol drone ───────── */
	{
		const g = new THREE.Group();
		g.position.set(-2.1, 0, -3.7);
		world.add(g);
		blob(-2.1, -3.7, 1.0);
		cyl(g, 0.75, 0.85, 0.22, 16, M(0x2a2e48, { metalness: 0.5, roughness: 0.4 }), 0, 0.11, 0);
		const padRing = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.03, 5, 28), G(0x62f0e0, 0x62f0e0, 0.6, 2.2));
		padRing.rotation.x = Math.PI / 2;
		padRing.position.y = 0.24;
		g.add(padRing);
		const add3 = (geo: THREE.BufferGeometry, color: number, o: number, wire = false) => {
			const m = new THREE.MeshBasicMaterial({
				color,
				transparent: true,
				opacity: o,
				wireframe: wire,
				depthWrite: false,
				blending: THREE.AdditiveBlending,
				side: THREE.DoubleSide,
				toneMapped: false
			});
			holoMats.push({ m, o });
			return new THREE.Mesh(geo, m);
		};
		const h = new THREE.Group();
		h.position.y = 1.35;
		g.add(h);
		const globe = add3(new THREE.IcosahedronGeometry(0.5, 1), 0x62f0e0, 0.14, true);
		h.add(globe);
		const ringA = add3(new THREE.TorusGeometry(0.78, 0.012, 4, 56), 0x8ffcf0, 0.18);
		ringA.rotation.x = 1.1;
		h.add(ringA);
		const ringB = add3(new THREE.TorusGeometry(0.66, 0.012, 4, 56), 0xffb347, 0.16);
		ringB.rotation.x = -0.7;
		ringB.rotation.y = 0.5;
		h.add(ringB);
		const beam = add3(new THREE.CylinderGeometry(0.5, 0.62, 1.2, 18, 1, true), 0x62f0e0, 0.025);
		beam.position.y = -0.55;
		h.add(beam);
		const panels = new THREE.Group();
		h.add(panels);
		const panelTex = (title: string, lines: string[]) =>
			canvasTex(256, 160, (c, w, hh) => {
				c.fillStyle = 'rgba(98,240,224,.16)';
				c.fillRect(0, 0, w, hh);
				c.strokeStyle = 'rgba(143,252,240,.95)';
				c.lineWidth = 3;
				c.strokeRect(3, 3, w - 6, hh - 6);
				c.fillStyle = '#8ffcf0';
				c.font = '700 22px ' + MONO;
				c.fillText(title, 14, 34);
				c.font = '500 16px ' + MONO;
				lines.forEach((l, i) => c.fillText(l, 14, 68 + i * 26));
			});
		(
			[
				['SYS CHECK', ['render ..... ok', 'shaders .... ok', 'coffee ..... low']],
				['ORBIT', ['sat-1 ...... ok', 'ping ....... ok', 'cloud ...... fair']],
				['FIELD LOG', ['finds ...... ??', 'wonder ..... max', 'bugs ....... 0?']]
			] as [string, string[]][]
		).forEach(([t, ls], i) => {
			const pm = new THREE.MeshBasicMaterial({
				map: panelTex(t, ls),
				transparent: true,
				opacity: 0.85,
				depthWrite: false,
				blending: THREE.AdditiveBlending,
				side: THREE.DoubleSide,
				toneMapped: false
			});
			holoMats.push({ m: pm, o: 0.85 });
			const pl = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.39), pm);
			const a = (i / 3) * Math.PI * 2;
			pl.position.set(Math.cos(a) * 1.05, 0.15 + (i % 2) * 0.2, Math.sin(a) * 1.05);
			pl.rotation.y = -a + Math.PI / 2;
			panels.add(pl);
		});
		noRay(g);
		const hl = new THREE.PointLight(0x62f0e0, 0, 3.2, 2);
		hl.position.y = 1.3;
		g.add(hl);
		nl(hl, 0, 0.35);
		tick.push((_dt, t) => {
			globe.rotation.y = t * 0.6;
			globe.rotation.x = t * 0.2;
			ringA.rotation.z = t * 0.8;
			ringB.rotation.z = -t * 0.6;
			panels.rotation.y = t * 0.25;
			h.position.y = 1.35 + Math.sin(t * 1.4) * 0.05;
		});
		obstacles.push([-2.1, -3.7, 1.0]);

		// patrol drone around mission control
		const dr = new THREE.Group();
		world.add(dr);
		ball(dr, 0.17, M(0x2a2e48, { metalness: 0.6, roughness: 0.35 }), 0, 0, 0, 1);
		const dring = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.02, 4, 14), G(0x62f0e0, 0x62f0e0, 0.6, 2.4));
		dring.rotation.x = Math.PI / 2;
		dr.add(dring);
		const rotors: THREE.Mesh[] = [];
		(
			[
				[0.3, 0.3],
				[-0.3, 0.3],
				[0.3, -0.3],
				[-0.3, -0.3]
			] as [number, number][]
		).forEach(([x, z]) => {
			cyl(dr, 0.02, 0.02, 0.12, 4, M(0x8d93ad), x * 0.55, 0.02, z * 0.55);
			const r = cyl(dr, 0.13, 0.13, 0.015, 10, M(0xaab0c4, { transparent: true, opacity: 0.55 }), x, 0.1, z);
			r.castShadow = false;
			rotors.push(r);
			box(dr, 0.35, 0.025, 0.025, M(0x8d93ad), x / 2, 0.02, z / 2).rotation.y = Math.atan2(-z, x);
		});
		const led = new THREE.Mesh(
			new THREE.SphereGeometry(0.035, 6, 5),
			new THREE.MeshBasicMaterial({ color: 0xff3b4f, toneMapped: false })
		);
		led.position.set(0, 0.05, 0.17);
		dr.add(led);
		noRay(dr);
		tick.push((_dt, t) => {
			const a = t * 0.5;
			dr.position.set(Math.cos(a) * 3.3, 3.5 + Math.sin(t * 1.3) * 0.18, -6.1 + Math.sin(a) * 2.2);
			dr.rotation.y = -a;
			dr.rotation.z = Math.sin(t * 1.3) * 0.08;
			rotors.forEach((r, i) => {
				r.rotation.y = t * 40 * (i % 2 ? 1 : -1);
			});
		});
	}

	/* ───────── lantern ───────── */
	{
		const g = new THREE.Group();
		g.position.set(1.7, 0, -1.7);
		world.add(g);
		cyl(g, 0.05, 0.07, 1.3, 6, M(0x2c2c44), 0, 0.65, 0);
		box(g, 0.28, 0.34, 0.28, G(0xffd27a, 0xffb347, 0.4, 1.8), 0, 1.45, 0);
		cyl(g, 0, 0.26, 0.2, 4, M(0x2c2c44), 0, 1.72, 0);
		const l = new THREE.PointLight(0xffb347, 0, 7, 2);
		l.position.y = 1.45;
		g.add(l);
		nl(l, 0.5, 7);
		noRay(g);
		obstacles.push([1.7, -1.7, 0.5]);
		tick.push((_dt, t) => {
			l.userData.flick = Math.sin(t * 7) * 0.4 + Math.sin(t * 13) * 0.25;
		});
	}

	/* ───────── hidden finds: creatures and curiosities ───────── */
	// Yeti, lurking near the pines
	const YETI_S = 0.7;
	{
		const g = new THREE.Group();
		g.position.set(-5.9, 0, -5.0);
		g.rotation.y = 0.8;
		world.add(g);
		blob(-5.9, -5.0, 0.8);
		const fur = M(0xeaf2ff, { roughness: 1 }),
			skin = M(0x9fc5e8);
		ball(g, 0.5, fur, 0, 0.72, 0, 1).scale.set(1, 1.15, 0.9);
		const head = new THREE.Group();
		head.position.set(0, 1.4, 0.05);
		g.add(head);
		ball(head, 0.3, fur, 0, 0, 0, 1);
		ball(head, 0.18, skin, 0, -0.02, 0.2, 1).scale.z = 0.6;
		[-0.08, 0.08].forEach((x) => ball(head, 0.035, M(0x16213a), x, 0.05, 0.31, 0));
		[-1, 1].forEach((s) => {
			const arm = ball(g, 0.17, fur, s * 0.52, 0.85, 0.08, 1);
			arm.scale.set(0.7, 1.6, 0.7);
			arm.rotation.z = s * 0.35;
			ball(g, 0.2, fur, s * 0.24, 0.1, 0.12, 1).scale.set(1, 0.6, 1.4);
		});
		tick.push((_dt, t) => {
			head.rotation.z = Math.sin(t * 0.7) * 0.18;
			head.rotation.y = Math.sin(t * 0.4) * 0.4;
		});
		const shell = g.children.slice();
		registerFind('yeti', g, 0.85, 0.85);
		// authored yeti (Quaternius, CC0; rigged, ~47 KB); keeps its idle animation. Procedural yeti stays if it fails to load.
		let mixer: THREE.AnimationMixer | null = null;
		tick.push((dt) => mixer?.update(dt));
		loadGltf('/island/yeti.glb')
			.then(({ scene: m, animations }) => {
				m.scale.setScalar(YETI_S);
				finishModel(m);
				m.traverse((o) => {
					o.frustumCulled = false;
				});
				shell.forEach((o) => g.remove(o));
				g.add(m);
				prep(m, byId.yeti.mats);
				const idle = animations.find((c) => /idle/i.test(c.name)) ?? animations[0];
				if (idle) {
					mixer = new THREE.AnimationMixer(m);
					mixer.clipAction(idle).play();
				}
				lastTod = -1;
			})
			.catch(() => {});
		obstacles.push([-5.9, -5.0, 1.0]);
	}
	// Dragon, asleep on a warm rock
	{
		const g = new THREE.Group();
		g.position.set(6.5, 0, -1.4);
		g.rotation.y = -2.2;
		world.add(g);
		blob(6.5, -1.4, 1.2);
		const proc = new THREE.Group(); // procedural stand-in, replaced by the authored model when it loads
		g.add(proc);
		const mound = add(proc, new THREE.DodecahedronGeometry(0.9, 0), M(0x8b86a0), 0, 0.3, 0);
		mound.scale.set(1.3, 0.6, 1.1);
		const sc = M(0x3fa66a),
			gold = M(0xf2c14e);
		const body = new THREE.Mesh(new THREE.TorusGeometry(0.55, 0.22, 6, 12, Math.PI * 1.6), sc);
		body.rotation.x = Math.PI / 2;
		body.position.y = 0.7;
		body.castShadow = true;
		proc.add(body);
		const dh = new THREE.Group();
		dh.position.set(0.82, 0.72, 0.12);
		proc.add(dh);
		ball(dh, 0.25, sc, 0, 0, 0, 1);
		box(dh, 0.2, 0.14, 0.26, sc, 0.2, -0.04, 0);
		[-0.09, 0.09].forEach((z) => {
			add(dh, new THREE.ConeGeometry(0.04, 0.2, 5), gold, -0.02, 0.24, z).rotation.z = 0.5;
			box(dh, 0.07, 0.015, 0.05, M(0x16213a), 0.1, 0.06, z * 1.3);
			add(dh, new THREE.SphereGeometry(0.025, 5, 4), G(0xff8a3c, 0xff6a00, 0.15, 1.8), 0.32, -0.02, z * 0.55);
		});
		[-1, 1].forEach((s) => {
			const w = box(proc, 0.04, 0.5, 0.4, M(0x2e8a57), -0.12, 1.0, s * 0.28);
			w.rotation.set(s * 0.45, 0, 0.3);
		});
		const tail = ball(proc, 0.14, sc, 0.42, 0.68, -0.44, 1);
		tail.scale.set(1.8, 0.8, 0.8);
		tail.rotation.y = -0.32;
		const zTex = canvasTex(64, 64, (c, w) => {
			c.fillStyle = '#fff';
			c.font = '700 54px ' + SANS;
			c.textAlign = 'center';
			c.textBaseline = 'middle';
			c.fillText('z', w / 2, w / 2 + 3);
		});
		const zs = [0, 0.33, 0.66].map((p) => {
			const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: zTex, transparent: true, depthWrite: false }));
			sp.raycast = () => {};
			g.add(sp);
			return { sp, p };
		});
		const puffs = [0, 0.5].map((p) => {
			const m = new THREE.Mesh(
				new THREE.IcosahedronGeometry(0.07, 0),
				new THREE.MeshStandardMaterial({ color: 0xb8b2c8, transparent: true, opacity: 0.5, roughness: 1 })
			);
			m.raycast = () => {};
			g.add(m);
			return { m, p };
		});
		const dl = new THREE.PointLight(0xff8a3c, 0, 2.6, 2);
		dl.position.set(1.1, 0.8, 0.12);
		g.add(dl);
		nl(dl, 0, 1.3);
		const nose = { x: 1.12, y: 0.66, z: 0.12 };
		const MODEL_S = 1.9;
		let model: THREE.Group | null = null;
		tick.push((dt, t) => {
			if (model) model.scale.y = MODEL_S * (1 + Math.sin(t * 1.2) * 0.015);
			else proc.scale.y = 1 + Math.sin(t * 1.2) * 0.02;
			for (const z of zs) {
				z.p = (z.p + dt * 0.25) % 1;
				z.sp.position.set(nose.x - 0.17 + z.p * 0.3, nose.y + 0.39 + z.p * 0.9, nose.z);
				z.sp.scale.setScalar(0.18 + z.p * 0.25);
				z.sp.material.opacity = 1 - z.p;
			}
			for (const f of puffs) {
				f.p = (f.p + dt * 0.35) % 1;
				f.m.position.set(nose.x + f.p * 0.25, nose.y + f.p * 0.35, nose.z);
				f.m.scale.setScalar(0.6 + f.p * 1.6);
				(f.m.material as THREE.MeshStandardMaterial).opacity = 0.45 * (1 - f.p);
			}
		});
		registerFind('dragon', g, 1.1, 0.7);
		dl.position.set(nose.x - 0.02, nose.y + 0.14, nose.z);
		// authored model (Meshy -> glTF, meshopt + WebP, ~170 KB); procedural dragon stays if it fails to load
		loadModel('/island/dragon.glb')
			.then((m) => {
				m.scale.setScalar(MODEL_S);
				m.position.y = 0.43 * MODEL_S;
				m.rotation.y = Math.PI / 2; // model faces +z, the island's dragon faces +x
				m.traverse((o) => {
					const mesh = o as THREE.Mesh;
					if (mesh.isMesh) {
						mesh.castShadow = true;
						mesh.receiveShadow = true;
						// generated PBR maps are fully metallic; soften so it matches the island's matte look
						const mm = mesh.material as Mat;
						mm.metalness = 0.18;
						mm.roughness = 1;
						mm.side = THREE.FrontSide;
					}
				});
				g.remove(proc);
				g.add(m);
				prep(m, byId.dragon.mats);
				model = m;
				nose.x = 0.86;
				nose.y = 0.58;
				nose.z = 0;
				dl.position.set(nose.x - 0.02, nose.y + 0.14, nose.z);
				lastTod = -1; // re-apply lighting so the new materials pick up this time of day
			})
			.catch(() => {});
		obstacles.push([6.5, -1.4, 1.3]);
	}
	// Okapi, grazing near the pond
	{
		const g = new THREE.Group();
		g.position.set(3.0, 0, 5.5);
		g.rotation.y = -1.7;
		world.add(g);
		blob(3.0, 5.5, 0.9);
		const dark = M(0x4a2d24),
			cream = M(0xf0e4cf),
			tan = M(0x7a4a36);
		box(g, 0.36, 0.42, 0.9, dark, 0, 0.74, 0);
		[-0.1, 0.1].forEach((x) => {
			box(g, 0.05, 0.4, 0.04, cream, x, 0.76, -0.46);
			box(g, 0.05, 0.4, 0.04, cream, x, 0.76, -0.36);
		});
		(
			[
				[-0.13, 0.3],
				[0.13, 0.3],
				[-0.13, -0.3],
				[0.13, -0.3]
			] as [number, number][]
		).forEach(([x, z]) => {
			cyl(g, 0.055, 0.05, 0.32, 5, dark, x, 0.6, z);
			cyl(g, 0.045, 0.04, 0.38, 5, cream, x, 0.2, z);
			box(g, 0.065, 0.03, 0.065, dark, x, 0.015, z + 0.01);
		});
		const neck = new THREE.Group();
		neck.position.set(0, 0.88, 0.42);
		g.add(neck);
		cyl(neck, 0.09, 0.12, 0.6, 6, dark, 0, 0.27, 0.13).rotation.x = 0.45;
		const head = new THREE.Group();
		head.position.set(0, 0.58, 0.34);
		neck.add(head);
		box(head, 0.16, 0.15, 0.3, tan, 0, 0, 0.06);
		box(head, 0.11, 0.1, 0.1, M(0x2c1a14), 0, -0.02, 0.24);
		const ears: THREE.Mesh[] = [];
		[-0.11, 0.11].forEach((x) => {
			const ear = box(head, 0.1, 0.13, 0.03, tan, x, 0.1, -0.06);
			ear.rotation.z = x > 0 ? -0.6 : 0.6;
			ears.push(ear);
			box(head, 0.02, 0.07, 0.02, M(0xd9c29a), x * 0.4, 0.13, 0.0);
			ball(head, 0.022, M(0x111111), x * 0.55, 0.03, 0.14, 0);
		});
		const tailO = box(g, 0.04, 0.3, 0.04, dark, 0, 0.7, -0.5);
		tailO.rotation.x = 0.3;
		tick.push((_dt, t) => {
			neck.rotation.x = Math.max(0, Math.sin(t * 0.6)) * 0.75;
			tailO.rotation.z = Math.sin(t * 3) * 0.3;
			ears[0].rotation.x = Math.max(0, Math.sin(t * 2.3)) * 0.3;
		});
		registerFind('okapi', g, 0.85, 0.65);
		obstacles.push([3.0, 5.5, 1.1]);
	}
	// Giraffe, peeking over the tree line
	const GIRAFFE_S = 0.16,
		GIRAFFE_Z = -0.5;
	{
		const g = new THREE.Group();
		g.position.set(-6.5, 0, 4.7);
		faceTo(g);
		world.add(g);
		blob(-6.5, 4.7, 1.0);
		const spot = canvasTex(128, 128, (c, w, h) => {
			c.fillStyle = '#e9b64f';
			c.fillRect(0, 0, w, h);
			c.fillStyle = '#a8662a';
			for (let i = 0; i < 26; i++) {
				const r = 8 + rnd() * 10;
				rr(c, rnd() * w, rnd() * h, r * 1.4, r, 4);
				c.fill();
			}
		});
		const gm = new THREE.MeshStandardMaterial({ map: spot, roughness: 0.85 }),
			dk = M(0x6b3f22);
		box(g, 0.5, 0.5, 1.0, gm, 0, 1.2, 0);
		(
			[
				[-0.17, 0.4],
				[0.17, 0.4],
				[-0.17, -0.4],
				[0.17, -0.4]
			] as [number, number][]
		).forEach(([x, z]) => cyl(g, 0.05, 0.06, 0.95, 6, gm, x, 0.48, z));
		const neck = new THREE.Group();
		neck.position.set(0, 1.4, 0.42);
		g.add(neck);
		cyl(neck, 0.09, 0.14, 1.9, 6, gm, 0, 0.95, 0.1).rotation.x = 0.12;
		const head = new THREE.Group();
		head.position.set(0, 1.95, 0.4);
		neck.add(head);
		box(head, 0.2, 0.2, 0.36, gm, 0, 0, 0.08);
		box(head, 0.14, 0.12, 0.12, M(0xd9a06b), 0, -0.03, 0.28);
		[-0.06, 0.06].forEach((x) => {
			cyl(head, 0.012, 0.012, 0.14, 4, dk, x, 0.16, 0);
			ball(head, 0.025, dk, x, 0.24, 0, 0);
			ball(head, 0.025, M(0x111111), x * 1.6, 0.04, 0.12, 0);
		});
		[-0.14, 0.14].forEach((x) => box(head, 0.1, 0.06, 0.03, gm, x, 0.07, -0.04));
		cyl(g, 0.015, 0.015, 0.5, 4, dk, 0, 1.1, -0.55).rotation.x = 0.4;
		tick.push((_dt, t) => {
			neck.rotation.z = Math.sin(t * 0.5) * 0.05;
			neck.rotation.x = Math.sin(t * 0.3) * 0.04;
		});
		const shell = g.children.slice();
		registerFind('giraffe', g, 1.1, 2.2);
		// authored giraffe (Poly by Google, CC-BY, via Poly Pizza; ~71 KB); procedural giraffe stays if it fails to load
		loadModel('/island/giraffe.glb')
			.then((m) => {
				m.scale.setScalar(GIRAFFE_S);
				m.position.set(0, 0, GIRAFFE_Z);
				finishModel(m);
				shell.forEach((o) => g.remove(o));
				g.add(m);
				prep(m, byId.giraffe.mats);
				lastTod = -1;
			})
			.catch(() => {});
		obstacles.push([-6.5, 4.7, 1.2]);
	}
	// Golden-age rocket on its pad
	{
		const g = new THREE.Group();
		g.position.set(2.8, 0, -4.6);
		world.add(g);
		blob(2.8, -4.6, 1.0);
		cyl(g, 0.7, 0.8, 0.12, 10, M(0x6c7089), 0, 0.06, 0);
		const steel = M(0xdfe3ee, { metalness: 0.5, roughness: 0.35 }),
			red = M(0xd62839);
		cyl(g, 0.26, 0.3, 1.3, 10, steel, 0, 0.85, 0);
		add(g, new THREE.ConeGeometry(0.26, 0.5, 10), red, 0, 1.75, 0);
		cyl(g, 0.285, 0.285, 0.1, 10, red, 0, 0.8, 0);
		for (let i = 0; i < 3; i++) {
			const a = (i / 3) * Math.PI * 2;
			box(g, 0.04, 0.42, 0.3, red, Math.sin(a) * 0.36, 0.35, Math.cos(a) * 0.36).rotation.y = a;
		}
		ball(g, 0.085, G(0x9fd4ff, 0x62f0e0, 0.5, 1.8), 0, 1.2, 0.26, 1);
		[-0.12, 0.12].forEach((z) => box(g, 0.07, 1.9, 0.07, M(0x59638f), 0.78, 0.95, z));
		[0.4, 0.9, 1.4].forEach((y) => box(g, 0.05, 0.05, 0.3, M(0x59638f), 0.78, y, 0));
		const lm = new THREE.MeshBasicMaterial({ color: 0xff3b4f, toneMapped: false });
		const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 5), lm);
		lamp.position.set(0.78, 1.95, 0);
		g.add(lamp);
		tick.push((_dt, t) => {
			lm.color.setRGB(1, 0.2, 0.3).multiplyScalar(Math.sin(t * 3.4) > 0.3 ? 1 : 0.15);
		});
		registerFind('rocket', g, 0.7, 1.0);
		obstacles.push([2.8, -4.6, 1.2]);
	}
	// sword in the stone
	{
		const g = new THREE.Group();
		g.position.set(-2.7, 0, 5.1);
		g.scale.setScalar(0.8);
		world.add(g);
		blob(-2.7, 5.1, 0.8);
		const st = add(g, new THREE.DodecahedronGeometry(0.55, 0), M(0x9aa0b4), 0, 0.38, 0);
		st.scale.set(1.1, 0.9, 1);
		st.rotation.y = 0.5;
		box(g, 0.09, 1.0, 0.02, G(0xdfe6f5, 0x9fd4ff, 0.05, 0.8, { metalness: 0.8, roughness: 0.25 }), 0, 1.05, 0);
		const gold = M(0xf2c14e, { metalness: 0.7, roughness: 0.3 });
		box(g, 0.5, 0.07, 0.07, gold, 0, 1.55, 0);
		cyl(g, 0.035, 0.035, 0.25, 6, M(0x5a3a22), 0, 1.71, 0);
		ball(g, 0.06, gold, 0, 1.86, 0, 0);
		const l = new THREE.PointLight(0x9fd4ff, 0, 3.5, 2);
		l.position.set(0, 1.5, 0.3);
		g.add(l);
		nl(l, 0, 1.6);
		registerFind('sword', g, 0.9, 1.0);
		obstacles.push([-2.7, 5.1, 0.9]);
	}

	/* ───────── the underside: finds for explorers who orbit below ───────── */
	// Sky whale gliding beneath the island
	{
		const g = new THREE.Group();
		world.add(g);
		const sk = M(0x6f8fd6, { roughness: 0.7 }),
			bel = M(0xe8efff);
		const body = ball(g, 1, sk, 0, 0, 0, 1);
		body.scale.set(2.3, 0.9, 1);
		const belly = ball(g, 0.9, bel, 0, -0.25, 0, 1);
		belly.scale.set(2.0, 0.55, 0.85);
		const tailG = new THREE.Group();
		tailG.position.set(-2.1, 0.05, 0);
		g.add(tailG);
		const stalk = ball(tailG, 0.4, sk, -0.3, 0, 0, 1);
		stalk.scale.set(1.5, 0.6, 0.6);
		const fluke = box(tailG, 0.15, 1.5, 0.35, sk, -0.95, 0.1, 0);
		fluke.rotation.x = Math.PI / 2;
		[-1, 1].forEach((s2) => {
			const fin = box(g, 0.9, 0.08, 0.35, sk, 0.5, -0.45, s2 * 0.9);
			fin.rotation.set(s2 * 0.5, 0.3 * s2, 0.2);
			ball(g, 0.07, M(0x10183a), 1.7, 0.15, s2 * 0.55, 0);
		});
		g.scale.setScalar(0.75);
		const proc = g.children.slice();
		let orca: THREE.Group | null = null;
		tick.push((_dt, t) => {
			if (orca) orca.rotation.y = -Math.PI / 2 + Math.sin(t * 1.4) * 0.08;
			const a = t * 0.09;
			g.position.set(Math.cos(a) * 12.5, -8.5 + Math.sin(t * 0.6) * 0.5, Math.sin(a) * 12.5);
			g.rotation.y = -a - Math.PI / 2 + Math.PI;
			g.rotation.z = Math.sin(t * 0.6) * 0.06;
			tailG.rotation.z = Math.sin(t * 1.4) * 0.35;
		});
		registerFind('whale', g, 2.6, 0);
		// authored orca (Poly by Google, CC-BY, via Poly Pizza; ~15 KB) swims in place of the sky whale; procedural whale stays if it fails to load
		loadModel('/island/orca.glb')
			.then((m) => {
				const k = 0.0086; // source is ~560 units nose to tail
				const w = new THREE.Group();
				m.scale.setScalar(k);
				m.position.set(0, -52 * k, 0);
				w.rotation.y = -Math.PI / 2; // model's nose is +z; flip it so it leads along the circle
				w.add(m);
				finishModel(w);
				proc.forEach((o) => g.remove(o));
				g.add(w);
				prep(w, byId.whale.mats);
				orca = w;
				lastTod = -1;
			})
			.catch(() => {});
	}
	// Dive bell hanging from a chain under the island
	{
		const g = new THREE.Group();
		g.position.set(-3.2, -2.4, 2.8);
		world.add(g);
		cyl(g, 0.02, 0.02, 1.6, 4, M(0x59638f), 0, 1.0, 0);
		const bell = new THREE.Group();
		g.add(bell);
		const brass = M(0xc9a24a, { metalness: 0.7, roughness: 0.35 });
		add(bell, new THREE.SphereGeometry(0.5, 14, 10), brass, 0, 0, 0);
		[0.7, 0, -0.7].forEach((a) => ball(bell, 0.12, G(0xbfe8ff, 0x62f0e0, 0.5, 2.2), Math.sin(a) * 0.46, 0.08, Math.cos(a) * 0.46, 0));
		cyl(bell, 0.5, 0.5, 0.08, 14, brass, 0, -0.36, 0);
		const bl = new THREE.PointLight(0x62f0e0, 0, 4, 2);
		bl.position.y = -0.2;
		bell.add(bl);
		nl(bl, 0, 1.8);
		tick.push((_dt, t) => {
			bell.rotation.z = Math.sin(t * 0.9) * 0.1;
			bell.position.y = Math.sin(t * 1.2) * 0.06;
		});
		registerFind('diver', g, 0.8, 0.0);
	}
	// Geode cave tucked into the rock
	{
		const g = new THREE.Group();
		g.position.set(0, -6.0, 0);
		world.add(g);
		const r = inR(-6.0) + 0.05;
		const cave = add(g, new THREE.DodecahedronGeometry(0.7, 0), M(0x3b3456), r, 0, 0);
		cave.scale.set(0.6, 0.9, 1);
		const cols = [0xb48cff, 0x62f0e0, 0xff6b9a];
		for (let i = 0; i < 5; i++) {
			const c = new THREE.Mesh(new THREE.OctahedronGeometry(0.16, 0), G(cols[i % 3], cols[i % 3], 0.8, 2.6, { roughness: 0.2 }));
			c.scale.set(0.6, 1.6, 0.6);
			c.position.set(r + 0.22, -0.3 + (i % 3) * 0.28, -0.35 + i * 0.18);
			c.rotation.z = -1.2 + i * 0.12;
			g.add(c);
		}
		const gl = new THREE.PointLight(0xb48cff, 0, 4, 2);
		gl.position.set(r + 0.8, 0, 0);
		g.add(gl);
		nl(gl, 0.3, 2.4);
		registerFind('geode', g, 1.0, 0);
	}
	// Pond kraken: small, shy, and very into gardening
	krakenPoke = (() => {
		const PX = 0.6,
			PZ = 5.2,
			WY = 0.07;
		const g = new THREE.Group();
		g.position.set(PX, WY, PZ);
		g.visible = false;
		world.add(g);
		const skin = M(0x9b7bff, { roughness: 0.55, flatShading: false }),
			belly = M(0xd9ccff, { roughness: 0.6, flatShading: false }),
			white = M(0xffffff, { roughness: 0.3, flatShading: false }),
			ink = M(0x14102a, { roughness: 0.3, flatShading: false }),
			blush = M(0xff8fc7, { roughness: 0.7, flatShading: false });
		const body = new THREE.Group();
		g.add(body);
		ball(body, 0.34, skin, 0, 0, 0, 2).scale.set(1, 1.12, 1);
		ball(body, 0.26, belly, 0, -0.06, 0.1, 2).scale.set(0.9, 0.8, 0.7);
		const face = new THREE.Group();
		body.add(face);
		const eyes: THREE.Mesh[] = [];
		[-0.12, 0.12].forEach((x) => {
			const e = ball(face, 0.085, white, x, 0.1, 0.27, 2);
			eyes.push(e);
			ball(face, 0.045, ink, x, 0.1, 0.345, 1);
			ball(face, 0.014, white, x + 0.015, 0.125, 0.385, 0);
			ball(face, 0.045, blush, x * 1.65, -0.0, 0.27, 1).scale.set(1, 0.6, 0.5);
		});
		const smile = new THREE.Mesh(new THREE.TorusGeometry(0.04, 0.009, 4, 10, Math.PI), ink);
		smile.rotation.z = Math.PI;
		smile.position.set(0, 0.03, 0.335);
		face.add(smile);
		// tentacles: chains of blobs laid along a bezier from body to a moving tip
		const N = 8,
			SEG = 12;
		const segGeo = new THREE.IcosahedronGeometry(1, 1);
		const tents = Array.from({ length: N }, (_, i) => {
			const segs = Array.from({ length: SEG }, () => {
				const m = new THREE.Mesh(segGeo, skin);
				m.castShadow = false;
				g.add(m);
				return m;
			});
			const a = (i / N) * Math.PI * 2 + 0.2;
			return { a, segs, tip: new THREE.Vector3(Math.cos(a) * 0.5, 0, Math.sin(a) * 0.5), target: new THREE.Vector3(), ph: rnd() * 6 };
		});
		// tulips planted around the pond rim (grabbable)
		const tulipCols = [0xff6b9a, 0xffd23f, 0xff8a3d, 0xc9a3ff];
		const plants = [60, 130, 215, 285].map((deg, i) => {
			const a = (deg * Math.PI) / 180,
				x = PX + Math.cos(a) * 1.62,
				z = PZ + Math.sin(a) * 1.62;
			const pg = new THREE.Group();
			cyl(pg, 0.018, 0.022, 0.3, 5, M(0x3f9d57), 0, 0.15, 0);
			const leaf = ball(pg, 0.06, M(0x4fae5b), 0.05, 0.1, 0, 0);
			leaf.scale.set(1.6, 0.3, 0.7);
			const head = ball(pg, 0.085, M(tulipCols[i]), 0, 0.33, 0, 1);
			head.scale.set(1, 1.25, 1);
			pg.position.set(x, 0, z);
			noRay(pg);
			world.add(pg);
			obstacles.push([x, z, 0.35]);
			return { g: pg, home: new THREE.Vector3(x, 0, z), a, gone: false, regrow: 0, grow: 1 };
		});
		const ringM = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
		const ring = new THREE.Mesh(new THREE.RingGeometry(0.85, 1, 40), ringM);
		ring.rotation.x = -Math.PI / 2;
		ring.position.y = 0.03;
		g.add(ring);
		let ringT = 1;
		noRay(g);
		registerFind('kraken', g, 0.75, 0.45);
		const hit = g.children[g.children.length - 1] as THREE.Mesh;
		const hitRay = hit.raycast.bind(hit);
		hit.raycast = (rc, it2) => {
			if (g.visible) hitRay(rc, it2);
		};

		type Phase = 'hidden' | 'rise' | 'wave' | 'reach' | 'carry' | 'sink';
		let phase: Phase = 'hidden',
			pt = 0,
			wait = 7,
			by = -0.65,
			plantIdx = -1,
			tentJ = 0;
		const WAVERS = [0, 3, 5];
		const easeBack = (k: number) => 1 + 2.7 * Math.pow(k - 1, 3) + 1.7 * Math.pow(k - 1, 2);
		const B = new THREE.Vector3(),
			Mid = new THREE.Vector3(),
			Pt = new THREE.Vector3();
		const camLocal = new THREE.Vector3();
		let faceY = 0;
		const splash = () => (ringT = 0);

		tick.push((dt, t) => {
			// planted tulips regrow only while the kraken is away
			for (const pl of plants) {
				if (!pl.gone && pl.grow < 1) {
					pl.grow = Math.min(1, pl.grow + dt * 1.2);
					pl.g.scale.setScalar(Math.max(0.01, pl.grow));
				}
				if (pl.gone && phase === 'hidden') {
					pl.regrow -= dt;
					if (pl.regrow <= 0) {
						pl.gone = false;
						pl.grow = 0;
						pl.g.visible = true;
						pl.g.position.copy(pl.home);
						pl.g.rotation.set(0, 0, 0);
					}
				}
			}
			if (ringT < 1) {
				ringT = Math.min(1, ringT + dt * 1.1);
				ring.scale.setScalar(0.4 + ringT * 0.9);
				ringM.opacity = 0.55 * (1 - ringT);
			}
			if (phase === 'hidden') {
				wait -= dt;
				if (wait <= 0) {
					phase = 'rise';
					pt = 0;
					plantIdx = -1;
					g.visible = true;
					splash();
				}
				if (!g.visible) return;
			}

			// state machine
			if (phase === 'rise') {
				pt += dt;
				const k = Math.min(pt / 1.0, 1);
				by = L(-0.65, 0.42, easeBack(k));
				if (k >= 1) {
					phase = 'wave';
					pt = 0;
				}
			} else if (phase === 'wave') {
				by = 0.42 + Math.sin(t * 2.4) * 0.03;
				pt += dt;
				if (pt > 3.2) {
					const avail = plants.map((p, i) => (p.gone ? -1 : i)).filter((i) => i >= 0);
					if (!avail.length) {
						phase = 'sink';
						pt = 0;
						splash();
					} else {
						plantIdx = avail[Math.floor(rnd() * avail.length)];
						const pa = plants[plantIdx].a;
						let best = 1e9;
						tents.forEach((T, i) => {
							const d = Math.abs(Math.atan2(Math.sin(T.a - pa), Math.cos(T.a - pa)));
							if (d < best) {
								best = d;
								tentJ = i;
							}
						});
						phase = 'reach';
						pt = 0;
					}
				}
			} else if (phase === 'reach') {
				by = 0.42 + Math.sin(t * 2.4) * 0.03;
				pt += dt;
				const pl = plants[plantIdx];
				Pt.set(pl.home.x - PX, 0.3, pl.home.z - PZ);
				if (tents[tentJ].tip.distanceTo(Pt) < 0.14 || pt > 1.8) {
					phase = 'carry';
					pt = 0;
				}
			} else if (phase === 'carry') {
				by = 0.42 + Math.sin(t * 2.4) * 0.03;
				pt += dt;
				if (pt > 1.9) {
					phase = 'sink';
					pt = 0;
					splash();
				}
			} else if (phase === 'sink') {
				pt += dt;
				const k = Math.min(pt / 0.9, 1);
				by = L(0.42, -0.7, k * k);
				if (k >= 1) {
					phase = 'hidden';
					g.visible = false;
					wait = 18 + rnd() * 16;
					if (plantIdx >= 0 && plants[plantIdx].g.visible === false) plants[plantIdx].regrow = 9 + rnd() * 5;
				}
			}

			// targets for each tentacle
			tents.forEach((T, i) => {
				const wob = Math.sin(t * 0.9 + T.ph);
				let lift = 0.05;
				if ((phase === 'wave' || phase === 'carry') && WAVERS.includes(i) && !(phase === 'carry' && i === tentJ)) {
					T.target.set(Math.cos(T.a) * 0.3 + Math.sin(t * 3 + T.ph) * 0.4, by + 0.8 + Math.sin(t * 4 + T.ph) * 0.15, Math.sin(T.a) * 0.3 + Math.cos(t * 2.4 + T.ph) * 0.2);
					lift = 0.5;
				} else if (i === tentJ && phase === 'reach') {
					const pl = plants[plantIdx];
					T.target.set(pl.home.x - PX, 0.3, pl.home.z - PZ);
					lift = 0.35;
				} else if (i === tentJ && (phase === 'carry' || phase === 'sink') && plantIdx >= 0) {
					T.target.set(Math.sin(t * 2) * 0.12, by + 0.95, 0.12);
					lift = 0.4;
				} else {
					const r = 0.85 + 0.15 * wob;
					T.target.set(Math.cos(T.a) * r, 0.02, Math.sin(T.a) * r);
				}
				T.tip.lerp(T.target, 1 - Math.exp(-dt * (i === tentJ && phase === 'reach' ? 7 : 5)));
				B.set(Math.cos(T.a) * 0.2, by - 0.12, Math.sin(T.a) * 0.2);
				Mid.copy(B).add(T.tip).multiplyScalar(0.5);
				Mid.y += 0.22 + lift;
				const dx = T.tip.x - B.x,
					dz = T.tip.z - B.z,
					dl = Math.hypot(dx, dz) || 1;
				T.segs.forEach((m, k) => {
					const u = (k + 0.5) / SEG,
						a0 = (1 - u) * (1 - u),
						b0 = 2 * (1 - u) * u,
						c0 = u * u;
					Pt.set(B.x * a0 + Mid.x * b0 + T.tip.x * c0, B.y * a0 + Mid.y * b0 + T.tip.y * c0, B.z * a0 + Mid.z * b0 + T.tip.z * c0);
					const w = Math.sin(t * 2.6 + T.ph + u * 5) * 0.05 * u * (0.5 + lift);
					Pt.x += (-dz / dl) * w;
					Pt.z += (dx / dl) * w;
					m.position.copy(Pt);
					m.scale.setScalar(0.078 * (1 - u) + 0.024);
				});
			});
			// carried tulip follows its tentacle tip
			if ((phase === 'carry' || phase === 'sink') && plantIdx >= 0) {
				const pl = plants[plantIdx],
					tip = tents[tentJ].tip;
				pl.g.position.set(PX + tip.x, WY + tip.y - 0.3, PZ + tip.z);
				pl.g.rotation.z = Math.sin(t * 5) * 0.15;
				pl.gone = true;
				if (phase === 'sink' && by < -0.05) pl.g.visible = false;
			}

			body.position.y = by;
			// face the camera, blink now and then
			camLocal.set(camera.position.x - (PX + 0), 0, camera.position.z - PZ);
			faceY += (Math.atan2(camLocal.x, camLocal.z) - faceY) * Math.min(1, dt * 4);
			face.rotation.y = faceY;
			const blink = t % 4.2 > 4.05 ? 0.15 : 1;
			eyes.forEach((e) => (e.scale.y = blink));
		});
		return () => {
			if (phase === 'hidden' && wait > 0.4) wait = 0.4;
		};
	})();
	// Monorail: a little loop over the rooftops, down past the rim and round the underside
	{
		const pts = (
			[
				[-7.3, 0.9, 2.2],
				[-5.0, 2.2, 1.8],
				[-2.0, 3.2, 2.6],
				[1.5, 3.4, 1.4],
				[4.5, 2.4, 2.0],
				[7.3, 0.9, 1.2],
				[9.3, -0.4, 0.8],
				[9.2, -3.5, 0.4],
				[7.4, -7.2, -0.5],
				[4.0, -10.2, -1.0],
				[0, -11.4, -0.3],
				[-4.0, -10.2, 1.0],
				[-7.4, -7.2, 0.5],
				[-9.2, -3.5, 0.4],
				[-9.3, -0.4, 1.0]
			] as [number, number, number][]
		).map(([x, y, z]) => new THREE.Vector3(x, y, z));
		const curve = new THREE.CatmullRomCurve3(pts, true, 'centripetal');
		curve.arcLengthDivisions = 900;
		const total = curve.getLength();
		const zAxis = new THREE.Vector3(0, 0, 1);
		// carriage rides on the outside of the loop, so it hangs beneath the track under the island
		const frame = (dir: THREE.Vector3) => {
			const u = new THREE.Vector3().crossVectors(zAxis, dir).normalize();
			const r = new THREE.Vector3().crossVectors(u, dir).normalize();
			return { u, r };
		};
		const at = (d: number) => curve.getPointAt((((d / total) % 1) + 1) % 1);
		// sweep a small profile along the curve into a flat-shaded ribbon
		const sweep = (profile: [number, number][], N = 420) => {
			const rings: THREE.Vector3[][] = [];
			for (let i = 0; i < N; i++) {
				const t = i / N;
				const p = curve.getPointAt(t);
				const d = curve.getTangentAt(t);
				const { u, r } = frame(d);
				rings.push(profile.map(([a, b]) => p.clone().addScaledVector(r, a).addScaledVector(u, b)));
			}
			const pos: number[] = [];
			const push = (v: THREE.Vector3) => pos.push(v.x, v.y, v.z);
			for (let i = 0; i < N; i++) {
				const A = rings[i],
					B = rings[(i + 1) % N];
				for (let k = 0; k < profile.length; k++) {
					const k2 = (k + 1) % profile.length;
					push(A[k]);
					push(B[k]);
					push(B[k2]);
					push(A[k]);
					push(B[k2]);
					push(A[k2]);
				}
			}
			const geo = new THREE.BufferGeometry();
			geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
			geo.computeVertexNormals();
			return geo;
		};
		const beam = new THREE.Mesh(
			sweep([
				[-0.19, -0.045],
				[-0.19, 0.045],
				[0.19, 0.045],
				[0.19, -0.045]
			]),
			M(0x59638f, { metalness: 0.3, roughness: 0.55 })
		);
		beam.castShadow = true;
		beam.receiveShadow = true;
		const stripMat = G(0x9fd4ff, 0x62f0e0, 0.125, 0.6);
		const strips = [-1, 1].map((sg) => {
			const m = new THREE.Mesh(
				sweep([
					[sg * 0.165, 0.045],
					[sg * 0.165, 0.062],
					[sg * 0.195, 0.062],
					[sg * 0.195, 0.045]
				]),
				stripMat
			);
			m.castShadow = false;
			return m;
		});
		const rail = new THREE.Group();
		rail.add(beam, ...strips);
		noRay(rail);
		world.add(rail);
		// pylons under the raised stretch
		const pyM = M(0x59638f);
		for (let d = 0; d < total; d += 2.6) {
			const p = at(d);
			if (p.y < 1.4 || Math.abs(p.x) > 6.4) continue;
			const py = box(world, 0.12, p.y - 0.06, 0.12, pyM, p.x, (p.y - 0.06) / 2 + 0.02, p.z);
			py.raycast = () => {};
			box(world, 0.32, 0.05, 0.32, pyM, p.x, 0.045, p.z).raycast = () => {};
		}
		// the train: three small carriages, with stand-ins until the authored model loads
		const train = new THREE.Group();
		world.add(train);
		const CARS = 3,
			CAR_L = 1.7,
			GAP = 0.14;
		const cars: { g: THREE.Group; proc: THREE.Group }[] = [];
		for (let i = 0; i < CARS; i++) {
			const cg = new THREE.Group();
			const proc = new THREE.Group();
			box(proc, 0.28, 0.2, CAR_L - 0.1, M(0xd62839), 0, 0.12, 0);
			box(proc, 0.3, 0.07, CAR_L - 0.3, G(0xffe29a, 0xffc860, 0.3, 1.6), 0, 0.17, 0);
			cg.add(proc);
			train.add(cg);
			cars.push({ g: cg, proc });
		}
		registerFind('monorail', train, 1.7, 0.2);
		loadModel('/island/carriage.glb')
			.then((m) => {
				const k = 0.0028; // source is ~590 units long
				m.scale.setScalar(k);
				m.position.y = 60 * k + 0.002; // origin is the middle; sit the wheels on the rail
				finishModel(m);
				cars.forEach((c) => {
					const inst = m.clone(true);
					c.g.remove(c.proc);
					c.g.add(inst);
					prep(inst as THREE.Group, byId.monorail.mats);
				});
				lastTod = -1;
			})
			.catch(() => {});
		let dist = 6;
		const tmpM = new THREE.Matrix4();
		tick.push((dt) => {
			dist += dt * 1.5;
			const mids: THREE.Vector3[] = [];
			cars.forEach((c, i) => {
				const dc = dist - i * (CAR_L + GAP);
				const f = at(dc + CAR_L * 0.38),
					r = at(dc - CAR_L * 0.38);
				const dir = f.clone().sub(r).normalize();
				const { u, r: rr } = frame(dir);
				const mid = f.clone().add(r).multiplyScalar(0.5).addScaledVector(u, 0.045);
				mids.push(mid);
				// the carriage model faces the opposite way along the rail
				dir.negate();
				rr.negate();
				tmpM.makeBasis(rr, u, dir);
				c.g.quaternion.setFromRotationMatrix(tmpM);
			});
			train.position.copy(mids[1]);
			cars.forEach((c, i) => c.g.position.copy(mids[i]).sub(mids[1]));
		});
	}
	// a distant ringed planet
	let planetIt: Item;
	{
		const g = new THREE.Group();
		g.position.set(-50, 28, -36);
		scene.add(g);
		const tx = canvasTex(256, 128, (c, w, h) => {
			const bands = ['#e8c07a', '#d99a4e', '#f1d9a0', '#c9803f', '#e6b86a'];
			for (let i = 0; i < h; i += 8) {
				c.fillStyle = bands[((i / 8) | 0) % bands.length];
				c.fillRect(0, i, w, 8);
			}
		});
		const pl = new THREE.Mesh(
			new THREE.SphereGeometry(3, 24, 16),
			new THREE.MeshStandardMaterial({ map: tx, roughness: 0.9, transparent: true })
		);
		g.add(pl);
		const rg = new THREE.Mesh(
			new THREE.RingGeometry(4.3, 6.6, 48),
			new THREE.MeshBasicMaterial({ color: 0xd9c08a, transparent: true, opacity: 0.7, side: THREE.DoubleSide, toneMapped: false })
		);
		rg.rotation.x = Math.PI / 2.3;
		g.add(rg);
		g.rotation.z = 0.25;
		tick.push((dt) => {
			pl.rotation.y += dt * 0.05;
		});
		planetIt = registerFind('planet', g, 6, 0);
	}

	/* ───────── flowers, grass, birds, butterflies, sky lanterns ───────── */
	{
		const pal = [0xff6b9a, 0xffd23f, 0xffffff, 0xb48cff, 0xff8a5c];
		let n = 0,
			tries = 0;
		while (n < 46 && tries++ < 900) {
			const x = (rnd() - 0.5) * 14,
				z = (rnd() - 0.5) * 14;
			if (obstacles.some(([ox, oz, r]) => Math.hypot(x - ox, z - oz) < r + 0.15)) continue;
			const stem = cyl(world, 0.018, 0.018, 0.22, 4, M(0x3f9d57), x, 0.11, z);
			const head = ball(world, 0.07, M(pal[n % pal.length]), x, 0.25, z, 0);
			stem.castShadow = head.castShadow = false;
			stem.raycast = head.raycast = () => {};
			n++;
		}
	}
	const grass = (() => {
		const count = low ? 90 : 220;
		const mesh = new THREE.InstancedMesh(new THREE.ConeGeometry(0.05, 0.32, 4), M(0x5fae55), count);
		mesh.castShadow = false;
		mesh.raycast = () => {};
		const base: { x: number; z: number; s: number; ph: number }[] = [];
		let tries = 0;
		while (base.length < count && tries++ < 4000) {
			const x = (rnd() - 0.5) * 14.4,
				z = (rnd() - 0.5) * 14.4;
			if (obstacles.some(([ox, oz, r]) => Math.hypot(x - ox, z - oz) < r)) continue;
			base.push({ x, z, s: 0.7 + rnd() * 0.9, ph: rnd() * 6 });
		}
		mesh.count = base.length;
		world.add(mesh);
		const m4 = new THREE.Matrix4(),
			q = new THREE.Quaternion(),
			e = new THREE.Euler(),
			sc = new THREE.Vector3(),
			p = new THREE.Vector3();
		const update = (t: number) => {
			base.forEach((b, i) => {
				const amp = 0.18 * (1 + state.wind * 1.8);
				e.set(Math.sin(t * 1.4 + b.ph) * amp, 0, Math.cos(t * 1.1 + b.ph * 1.3) * amp);
				q.setFromEuler(e);
				sc.setScalar(b.s);
				p.set(b.x, 0.16 * b.s, b.z);
				mesh.setMatrixAt(i, m4.compose(p, q, sc));
			});
			mesh.instanceMatrix.needsUpdate = true;
		};
		update(0);
		return update;
	})();
	tick.push((_dt, t) => grass(t));

	// birds circling the island
	const birdMat = new THREE.MeshBasicMaterial({ color: 0x20284a, side: THREE.DoubleSide });
	const birds = Array.from({ length: 5 }, (_, i) => {
		const b = new THREE.Group();
		const wl = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.14), birdMat);
		const wr = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.14), birdMat);
		wl.position.x = -0.17;
		wr.position.x = 0.17;
		const pivL = new THREE.Group(),
			pivR = new THREE.Group();
		pivL.add(wl);
		pivR.add(wr);
		b.add(pivL, pivR);
		b.add(new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.22, 4).rotateX(Math.PI / 2), birdMat));
		noRay(b);
		world.add(b);
		return { b, pivL, pivR, ph: i * 1.3, R: 10.5 + (i % 3) * 1.4, h: 5.5 + (i % 2) * 1.6, sp: 0.18 + i * 0.015 };
	});
	tick.push((_dt, t) => {
		for (const k of birds) {
			const a = t * k.sp + k.ph * 2;
			k.b.position.set(Math.cos(a) * k.R, k.h + Math.sin(t * 0.8 + k.ph) * 0.4, Math.sin(a) * k.R);
			k.b.rotation.y = -a;
			const f = Math.sin(t * 9 + k.ph) * 0.65;
			k.pivL.rotation.z = f;
			k.pivR.rotation.z = -f;
		}
	});
	// butterflies over the flowers (daytime only)
	const butterflies = new THREE.Group();
	world.add(butterflies);
	const bfMat = new THREE.MeshBasicMaterial({ color: 0xffb347, side: THREE.DoubleSide });
	const bfs = Array.from({ length: 3 }, (_, i) => {
		const b = new THREE.Group();
		const w1 = new THREE.Mesh(new THREE.PlaneGeometry(0.1, 0.08), bfMat);
		const w2 = new THREE.Mesh(new THREE.PlaneGeometry(0.1, 0.08), bfMat);
		w1.position.x = -0.05;
		w2.position.x = 0.05;
		const p1 = new THREE.Group(),
			p2 = new THREE.Group();
		p1.add(w1);
		p2.add(w2);
		b.add(p1, p2);
		butterflies.add(b);
		return { b, p1, p2, ph: i * 2.1 };
	});
	noRay(butterflies);
	tick.push((_dt, t) => {
		for (const k of bfs) {
			k.b.position.set(
				-1.5 + Math.sin(t * 0.5 + k.ph) * 4 + k.ph,
				0.7 + Math.sin(t * 1.6 + k.ph) * 0.25,
				2.2 + Math.cos(t * 0.37 + k.ph * 1.7) * 3.5
			);
			k.b.rotation.y = t * 0.5 + k.ph;
			const f = Math.sin(t * 16 + k.ph) * 0.9;
			k.p1.rotation.z = f;
			k.p2.rotation.z = -f;
		}
	});
	// sky lanterns drift up at night
	const lanternMat = new THREE.MeshBasicMaterial({ color: 0xffb347, transparent: true, opacity: 0, toneMapped: false });
	const lanterns = Array.from({ length: 7 }, (_, i) => {
		const m = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.24, 0.18), lanternMat);
		m.raycast = () => {};
		world.add(m);
		return { m, p: i / 7, x: (rnd() - 0.5) * 8, z: (rnd() - 0.5) * 8, ph: rnd() * 6 };
	});
	tick.push((dt, t) => {
		for (const l of lanterns) {
			l.p = (l.p + dt * 0.035) % 1;
			l.m.position.set(l.x + Math.sin(t * 0.4 + l.ph) * 0.8, 1 + l.p * 12, l.z + Math.cos(t * 0.3 + l.ph) * 0.8);
			l.m.scale.setScalar(Math.min(1, l.p * 8) * Math.min(1, (1 - l.p) * 5));
		}
	});

	/* ───────── sky: clouds, stars, sun, moon, satellite, radar pings, fireflies ───────── */
	const cloudMat = M(0xffffff, { emissive: 0xffe5ef, emissiveIntensity: 0.35, roughness: 1 });
	const clouds: { pivot: THREE.Group; sp: number }[] = [];
	for (let i = 0; i < 7; i++) {
		const pivot = new THREE.Group();
		pivot.rotation.y = rnd() * 6.28;
		scene.add(pivot);
		const c = new THREE.Group();
		c.position.set(17 + rnd() * 7, -1 + rnd() * 8, 0);
		pivot.add(c);
		(
			[
				[0, 0, 0, 1],
				[0.9, -0.1, 0.2, 0.75],
				[-0.9, -0.15, -0.1, 0.7],
				[0.3, 0.3, -0.3, 0.6]
			] as [number, number, number, number][]
		).forEach(([x, y, z, s]) => {
			const b = ball(c, s * 0.7, cloudMat, x, y, z, 1);
			b.castShadow = false;
			b.receiveShadow = false;
		});
		c.scale.setScalar(0.8 + rnd() * 0.9);
		noRay(pivot);
		clouds.push({ pivot, sp: (0.01 + rnd() * 0.018) * (rnd() < 0.5 ? 1 : -1) });
	}
	const starPos = new Float32Array(900 * 3);
	for (let i = 0; i < 900; i++) {
		let x = 0,
			y = 0,
			z = 0;
		do {
			x = rnd() * 2 - 1;
			y = rnd() * 2 - 1;
			z = rnd() * 2 - 1;
		} while (x * x + y * y + z * z > 1);
		const l = Math.hypot(x, y, z);
		starPos.set([(x / l) * 85, (y / l) * 85, (z / l) * 85], i * 3);
	}
	const starGeo = new THREE.BufferGeometry();
	starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
	const stars = new THREE.Points(
		starGeo,
		new THREE.PointsMaterial({
			color: 0xdfe8ff,
			size: 1.8,
			sizeAttenuation: false,
			transparent: true,
			opacity: 0,
			depthWrite: false,
			fog: false
		})
	);
	stars.frustumCulled = false;
	scene.add(stars);
	const orb = (r: number, col: number, pos: THREE.Vector3) => {
		const m = new THREE.MeshBasicMaterial({ color: col, transparent: true, toneMapped: false, fog: false });
		const mesh = new THREE.Mesh(new THREE.SphereGeometry(r, 18, 14), m);
		mesh.position.copy(pos);
		mesh.raycast = () => {};
		scene.add(mesh);
		const hm = new THREE.MeshBasicMaterial({
			color: col,
			transparent: true,
			blending: THREE.AdditiveBlending,
			depthWrite: false,
			toneMapped: false,
			fog: false
		});
		const halo = new THREE.Mesh(new THREE.SphereGeometry(r * 1.7, 18, 14), hm);
		halo.position.copy(pos);
		halo.raycast = () => {};
		scene.add(halo);
		return { m, hm, mesh, halo };
	};
	const sunO = orb(3.2, 0xfff0b0, new THREE.Vector3(40, 26, 32)),
		moonO = orb(2.8, 0xdfe8ff, new THREE.Vector3(-38, 28, -34));

	// "DADDOO-1" satellite on a tilted orbit
	const orbitTilt = new THREE.Group();
	orbitTilt.rotation.set(0.5, 0, 0.22);
	scene.add(orbitTilt);
	const OR = 15.5;
	const ringPts: THREE.Vector3[] = [];
	for (let i = 0; i <= 96; i++) {
		const a = (i / 96) * Math.PI * 2;
		ringPts.push(new THREE.Vector3(Math.cos(a) * OR, 0, Math.sin(a) * OR));
	}
	const orbitLine = new THREE.Line(
		new THREE.BufferGeometry().setFromPoints(ringPts),
		new THREE.LineBasicMaterial({ color: 0x62f0e0, transparent: true, opacity: 0.2 })
	);
	orbitLine.raycast = () => {};
	orbitTilt.add(orbitLine);
	const orbitSpin = new THREE.Group();
	orbitTilt.add(orbitSpin);
	const sat = new THREE.Group();
	sat.position.set(OR, 0, 0);
	sat.scale.setScalar(0.8);
	orbitSpin.add(sat);
	box(sat, 0.55, 0.4, 0.4, M(0xd8dcea, { metalness: 0.5, roughness: 0.4 }), 0, 0, 0);
	[-1, 1].forEach((s) => box(sat, 1.1, 0.04, 0.5, G(0x2f6fdd, 0x2a5bd0, 0.3, 0.9, { metalness: 0.4 }), s * 0.95, 0, 0));
	cyl(sat, 0.03, 0.03, 0.3, 5, M(0xd8dcea), 0, 0.3, 0);
	const satLightM = new THREE.MeshBasicMaterial({ color: 0xff3b4f, toneMapped: false });
	const satLight = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 5), satLightM);
	satLight.position.set(0, 0.48, 0);
	sat.add(satLight);
	sat.traverse((o) => {
		const m = o as THREE.Mesh;
		if (m.isMesh) m.castShadow = false;
		o.raycast = () => {};
	});

	// expanding radar pings around the island (night only)
	const pings = [0, 0.5].map((p0) => {
		const m = new THREE.Mesh(
			new THREE.RingGeometry(0.97, 1, 64),
			new THREE.MeshBasicMaterial({
				color: 0x62f0e0,
				transparent: true,
				opacity: 0,
				side: THREE.DoubleSide,
				blending: THREE.AdditiveBlending,
				depthWrite: false
			})
		);
		m.rotation.x = -Math.PI / 2;
		m.raycast = () => {};
		world.add(m);
		return { m, p: p0 };
	});

	// fireflies
	const FF = low ? 30 : 54,
		ffPos = new Float32Array(FF * 3),
		ffBase: { x: number; y: number; z: number; ph: number; sp: number }[] = [];
	for (let i = 0; i < FF; i++)
		ffBase.push({ x: (rnd() - 0.5) * 15, y: 0.6 + rnd() * 3.8, z: (rnd() - 0.5) * 15, ph: rnd() * 6, sp: 0.4 + rnd() * 0.6 });
	const ffGeo = new THREE.BufferGeometry();
	ffGeo.setAttribute('position', new THREE.BufferAttribute(ffPos, 3));
	const dot = canvasTex(64, 64, (c, w) => {
		const gr = c.createRadialGradient(32, 32, 0, 32, 32, 32);
		gr.addColorStop(0, 'rgba(255,240,180,1)');
		gr.addColorStop(0.4, 'rgba(255,214,120,.5)');
		gr.addColorStop(1, 'rgba(255,214,120,0)');
		c.fillStyle = gr;
		c.fillRect(0, 0, w, w);
	});
	const fliesM = new THREE.PointsMaterial({
		map: dot,
		size: 0.4,
		transparent: true,
		depthWrite: false,
		blending: THREE.AdditiveBlending,
		color: 0xffe9a8
	});
	const flies = new THREE.Points(ffGeo, fliesM);
	flies.frustumCulled = false;
	world.add(flies);

	/* ───────── weather: rain, snow, fog, lightning, wind (driven by "Match my sky") ───────── */
	type WKeys = 'cloud' | 'rain' | 'snow' | 'fog' | 'storm' | 'wind';
	const W: Record<WKeys, number> = { cloud: 0, rain: 0, snow: 0, fog: 0, storm: 0, wind: 0 };
	const WT: Record<WKeys, number> = { cloud: 0, rain: 0, snow: 0, fog: 0, storm: 0, wind: 0 };
	const W_KEYS: WKeys[] = ['cloud', 'rain', 'snow', 'fog', 'storm', 'wind'];
	const gloom = () => Math.min(1, Math.max(W.cloud * 0.8, W.rain, W.snow * 0.7, W.storm));

	const RAIN_N = low ? 350 : 900;
	const rainPos = new Float32Array(RAIN_N * 6);
	const drops = Array.from({ length: RAIN_N }, () => ({ x: (rnd() - 0.5) * 30, y: rnd() * 24 - 3, z: (rnd() - 0.5) * 30, sp: 20 + rnd() * 10 }));
	const rainGeo = new THREE.BufferGeometry();
	rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPos, 3));
	const rainLines = new THREE.LineSegments(rainGeo, new THREE.LineBasicMaterial({ color: 0xa9bde6, transparent: true, opacity: 0.6, depthWrite: false, fog: false }));
	rainLines.frustumCulled = false;
	rainLines.visible = false;
	rainLines.raycast = () => {};
	scene.add(rainLines);

	const SNOW_N = low ? 300 : 700;
	const snowPos = new Float32Array(SNOW_N * 3);
	const flakes = Array.from({ length: SNOW_N }, () => ({ x: (rnd() - 0.5) * 30, y: rnd() * 24 - 3, z: (rnd() - 0.5) * 30, sp: 1.2 + rnd() * 1.4, ph: rnd() * 6 }));
	const snowGeo = new THREE.BufferGeometry();
	snowGeo.setAttribute('position', new THREE.BufferAttribute(snowPos, 3));
	const snowTex = canvasTex(32, 32, (c, w) => {
		const gr = c.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
		gr.addColorStop(0, 'rgba(255,255,255,1)');
		gr.addColorStop(0.5, 'rgba(255,255,255,0.6)');
		gr.addColorStop(1, 'rgba(255,255,255,0)');
		c.fillStyle = gr;
		c.fillRect(0, 0, w, w);
	});
	const snowPts = new THREE.Points(snowGeo, new THREE.PointsMaterial({ map: snowTex, size: 0.34, transparent: true, depthWrite: false, fog: false, color: 0xffffff }));
	snowPts.frustumCulled = false;
	snowPts.visible = false;
	snowPts.raycast = () => {};
	scene.add(snowPts);

	// lightning: a brief flash of light plus a jagged bolt outside the island
	const boltPts = Array.from({ length: 9 }, () => new THREE.Vector3());
	const boltGeo = new THREE.BufferGeometry().setFromPoints(boltPts);
	const bolt = new THREE.Line(boltGeo, new THREE.LineBasicMaterial({ color: 0xeaf0ff, transparent: true, opacity: 0, toneMapped: false, fog: false }));
	bolt.frustumCulled = false;
	bolt.raycast = () => {};
	scene.add(bolt);
	const lightning = { cd: 4, flash: 0, echo: 0 };
	function strike() {
		const a = rnd() * Math.PI * 2,
			r = 11 + rnd() * 5;
		let x = Math.cos(a) * r,
			z = Math.sin(a) * r;
		for (let i = 0; i < boltPts.length; i++) {
			boltPts[i].set(x, 24 - i * 3.3, z);
			x += (rnd() - 0.5) * 2.2;
			z += (rnd() - 0.5) * 2.2;
		}
		boltGeo.setFromPoints(boltPts);
		lightning.flash = 1;
		lightning.echo = 0.13;
	}
	const snowWhite = new THREE.Color(1, 1, 1);
	function weatherFx(dt: number, t: number) {
		const slant = 0.15 + W.wind * 0.55;
		if (W.rain > 0.02) {
			rainLines.visible = true;
			const n = Math.floor(RAIN_N * W.rain);
			for (let i = 0; i < n; i++) {
				const d = drops[i];
				d.y -= d.sp * dt;
				d.x -= slant * d.sp * dt * 0.5;
				if (d.y < -3) {
					d.y = 21 + rnd() * 3;
					d.x = (rnd() - 0.5) * 30;
					d.z = (rnd() - 0.5) * 30;
				}
				const len = 0.6 + W.rain * 0.4;
				rainPos.set([d.x, d.y, d.z, d.x - slant * len, d.y + len, d.z], i * 6);
			}
			rainGeo.setDrawRange(0, n * 2);
			rainGeo.attributes.position.needsUpdate = true;
		} else rainLines.visible = false;
		if (W.snow > 0.02) {
			snowPts.visible = true;
			const n = Math.floor(SNOW_N * W.snow);
			for (let i = 0; i < n; i++) {
				const f = flakes[i];
				f.y -= f.sp * dt;
				f.x += (Math.sin(t * 0.8 + f.ph) * 0.5 + W.wind * 2.5) * dt;
				if (f.y < -3) {
					f.y = 21 + rnd() * 3;
					f.x = (rnd() - 0.5) * 30;
					f.z = (rnd() - 0.5) * 30;
				}
				if (f.x > 15) f.x -= 30;
				snowPos.set([f.x, f.y, f.z], i * 3);
			}
			snowGeo.setDrawRange(0, n);
			snowGeo.attributes.position.needsUpdate = true;
		} else snowPts.visible = false;
		(top.material as Mat).emissive.copy(snowWhite).multiplyScalar(W.snow * 0.6);
		if (W.storm > 0.3) {
			lightning.cd -= dt;
			if (lightning.cd <= 0) {
				strike();
				lightning.cd = 3 + rnd() * 8;
			}
		}
		if (lightning.echo > 0) {
			lightning.echo -= dt;
			if (lightning.echo <= 0) lightning.flash = Math.max(lightning.flash, 0.7);
		}
		lightning.flash *= Math.exp(-dt * 8);
		if (lightning.flash < 0.01) lightning.flash = 0;
		(bolt.material as THREE.LineBasicMaterial).opacity = Math.min(1, lightning.flash * 1.4);
	}

	/* ───────── atmosphere: light cones, mist, cloud sea, aurora, nebula, shooting stars ───────── */
	const gradTop = gradTexture(true),
		gradBottom = gradTexture(false);
	function gradTexture(apexTop: boolean) {
		return canvasTex(4, 64, (c, w, h) => {
			const gr = c.createLinearGradient(0, 0, 0, h);
			gr.addColorStop(0, apexTop ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0)');
			gr.addColorStop(1, apexTop ? 'rgba(255,255,255,0)' : 'rgba(255,255,255,0.95)');
			c.fillStyle = gr;
			c.fillRect(0, 0, w, h);
		});
	}
	const cones: { m: THREE.Mesh; day: number; night: number }[] = [];
	function beam(
		parent: THREE.Object3D,
		geo: THREE.BufferGeometry,
		color: number,
		day: number,
		night: number,
		apexTop: boolean,
		x: number,
		y: number,
		z: number
	) {
		const mat = new THREE.MeshBasicMaterial({
			color,
			map: apexTop ? gradTop : gradBottom,
			transparent: true,
			opacity: 0,
			depthWrite: false,
			blending: THREE.AdditiveBlending,
			side: THREE.DoubleSide,
			toneMapped: false,
			fog: false
		});
		const m = new THREE.Mesh(geo, mat);
		m.position.set(x, y, z);
		m.raycast = () => {};
		parent.add(m);
		cones.push({ m, day, night });
		return m;
	}
	// lantern pool of light, mission-control tower beam, sweeping searchlight
	beam(world, new THREE.ConeGeometry(1.15, 1.45, 28, 1, true), 0xffb347, 0.03, 0.42, true, 1.7, 0.725, -1.7);
	beam(world, new THREE.CylinderGeometry(0.5, 0.08, 7, 18, 1, true), 0x62f0e0, 0, 0.34, false, 2.5, 6.2, -6.0);
	const searchlight = new THREE.Group();
	searchlight.position.set(-0.9, 3.4, -6.1);
	world.add(searchlight);
	const slGeo = new THREE.CylinderGeometry(0.6, 0.03, 11, 16, 1, true);
	slGeo.translate(0, 5.5, 0);
	slGeo.rotateZ(-(Math.PI / 2 - 0.5));
	beam(searchlight, slGeo, 0x9ff6ff, 0, 0.3, false, 0, 0, 0);
	tick.push((_dt, t) => {
		searchlight.rotation.y = t * 0.6;
		for (const c of cones) (c.m.material as THREE.MeshBasicMaterial).opacity = L(c.day, c.night, state.nm);
	});

	// low ground mist and wisps under the island
	const mistTex = canvasTex(128, 128, (c, w) => {
		const gr = c.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
		gr.addColorStop(0, 'rgba(255,255,255,0.9)');
		gr.addColorStop(0.5, 'rgba(255,255,255,0.35)');
		gr.addColorStop(1, 'rgba(255,255,255,0)');
		c.fillStyle = gr;
		c.fillRect(0, 0, w, w);
	});
	const mistMat = new THREE.MeshBasicMaterial({ map: mistTex, color: 0xffffff, transparent: true, opacity: 0.1, depthWrite: false, fog: false, toneMapped: false });
	const mists = Array.from({ length: low ? 6 : 11 }, (_, i) => {
		const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mistMat);
		m.rotation.x = -Math.PI / 2;
		const sz = i < 6 ? 6 + rnd() * 6 : 9 + rnd() * 5;
		m.scale.set(sz, sz, 1);
		m.raycast = () => {};
		world.add(m);
		return { m, ph: rnd() * 6, x: (rnd() - 0.5) * (i < 6 ? 8 : 6), z: (rnd() - 0.5) * (i < 6 ? 8 : 6), y: i < 6 ? 0.2 + (i % 3) * 0.2 : -2.2 - (i - 6) * 0.9 };
	});
	tick.push((_dt, t) => {
		for (const k of mists) k.m.position.set(k.x + Math.sin(t * 0.07 + k.ph) * 1.6, k.y, k.z + Math.cos(t * 0.06 + k.ph) * 1.6);
	});

	// cloud sea far below, so the island floats above a layer of soft cloud
	const puffTex = canvasTex(128, 128, (c, w) => {
		for (let i = 0; i < 7; i++) {
			const x = w * (0.25 + rnd() * 0.5),
				y = w * (0.35 + rnd() * 0.3),
				r = w * (0.2 + rnd() * 0.18);
			const gr = c.createRadialGradient(x, y, 0, x, y, r);
			gr.addColorStop(0, 'rgba(255,255,255,0.7)');
			gr.addColorStop(1, 'rgba(255,255,255,0)');
			c.fillStyle = gr;
			c.fillRect(0, 0, w, w);
		}
	});
	const seaMat = new THREE.SpriteMaterial({ map: puffTex, color: 0xffffff, transparent: true, opacity: 0.6, depthWrite: false, fog: false });
	const seaPivot = new THREE.Group();
	scene.add(seaPivot);
	for (let i = 0; i < (low ? 14 : 26); i++) {
		const a = rnd() * Math.PI * 2,
			r = 18 + rnd() * 44;
		const sp = new THREE.Sprite(seaMat);
		sp.position.set(Math.cos(a) * r, -12 - rnd() * 10, Math.sin(a) * r);
		const sz = 18 + rnd() * 18;
		sp.scale.set(sz, sz * 0.55, 1);
		sp.raycast = () => {};
		seaPivot.add(sp);
	}
	tick.push((dt) => {
		seaPivot.rotation.y += dt * 0.004;
	});

	// aurora curtain ring (night)
	const auroraMat = new THREE.ShaderMaterial({
		uniforms: { uTime: { value: 0 }, uOpacity: { value: 0 } },
		transparent: true,
		depthWrite: false,
		side: THREE.BackSide,
		blending: THREE.AdditiveBlending,
		vertexShader: /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
		fragmentShader: /* glsl */ `
			uniform float uTime, uOpacity; varying vec2 vUv;
			void main() {
				float a = vUv.x * 6.2831853;
				float sweep = sin(a * 3.0 + uTime * 0.25 + sin(a * 7.0 + uTime * 0.4) * 1.4) * 0.5 + 0.5;
				float clump = smoothstep(0.25, 0.85, sin(a * 2.0 - uTime * 0.08 + 1.0) * 0.5 + 0.5);
				float rays = 0.55 + 0.45 * sin(a * 90.0 + sin(a * 17.0 + uTime * 0.7) * 3.0);
				float v = vUv.y;
				float prof = smoothstep(0.0, 0.3, v) * smoothstep(1.0, 0.5, v);
				vec3 col = mix(vec3(0.15, 1.0, 0.55), vec3(0.55, 0.3, 1.0), smoothstep(0.35, 1.0, v));
				float al = sweep * clump * rays * prof * uOpacity;
				gl_FragColor = vec4(col * al * 1.4, al);
			}`
	});
	const aurora = new THREE.Mesh(new THREE.CylinderGeometry(58, 58, 28, 96, 1, true), auroraMat);
	aurora.position.y = -6;
	aurora.raycast = () => {};
	aurora.frustumCulled = false;
	scene.add(aurora);

	// nebula smudges
	const nebTex = canvasTex(256, 256, (c, w) => {
		const cols = ['rgba(150,90,255,0.35)', 'rgba(70,120,255,0.3)', 'rgba(255,110,190,0.25)', 'rgba(60,220,230,0.2)'];
		for (let i = 0; i < 9; i++) {
			const x = w * (0.25 + rnd() * 0.5),
				y = w * (0.25 + rnd() * 0.5),
				r = w * (0.16 + rnd() * 0.22);
			const gr = c.createRadialGradient(x, y, 0, x, y, r);
			gr.addColorStop(0, cols[i % cols.length]);
			gr.addColorStop(1, 'rgba(0,0,0,0)');
			c.fillStyle = gr;
			c.fillRect(0, 0, w, w);
		}
	});
	const nebMat = new THREE.SpriteMaterial({ map: nebTex, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, fog: false });
	(
		[
			[-52, -2, -30, 80],
			[-20, 2, -62, 90],
			[-60, -8, 6, 70]
		] as [number, number, number, number][]
	).forEach(([x, y, z, sz]) => {
		const sp = new THREE.Sprite(nebMat);
		sp.position.set(x, y, z);
		sp.scale.set(sz, sz, 1);
		sp.raycast = () => {};
		scene.add(sp);
	});

	// shooting stars, spawned in view space so they always cross the frame
	const streakTex = canvasTex(128, 8, (c, w, h) => {
		const gr = c.createLinearGradient(0, 0, w, 0);
		gr.addColorStop(0, 'rgba(255,255,255,0)');
		gr.addColorStop(1, 'rgba(255,255,255,1)');
		c.fillStyle = gr;
		c.fillRect(0, h / 2 - 1.5, w, 3);
	});
	const shooters = Array.from({ length: 3 }, () => {
		const mat = new THREE.SpriteMaterial({ map: streakTex, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, fog: false });
		const sp = new THREE.Sprite(mat);
		sp.scale.set(8, 0.28, 1);
		sp.raycast = () => {};
		scene.add(sp);
		return { sp, mat, life: 0, dur: 1, vel: new THREE.Vector3(), cd: 1 + rnd() * 5 };
	});
	const cR = new THREE.Vector3(),
		cU = new THREE.Vector3(),
		cF = new THREE.Vector3();
	tick.push((dt) => {
		const vis = THREE.MathUtils.clamp((state.tod - 1.25) / 0.6, 0, 1) * (1 - state.cloud * 0.85);
		auroraMat.uniforms.uTime.value += dt;
		auroraMat.uniforms.uOpacity.value = vis * 0.75;
		nebMat.opacity = vis * 0.3;
		camera.updateMatrixWorld();
		cR.setFromMatrixColumn(camera.matrixWorld, 0);
		cU.setFromMatrixColumn(camera.matrixWorld, 1);
		cF.setFromMatrixColumn(camera.matrixWorld, 2).negate();
		for (const sh of shooters) {
			if (sh.life > 0) {
				sh.life -= dt;
				sh.sp.position.addScaledVector(sh.vel, dt);
				const k = 1 - sh.life / sh.dur;
				sh.mat.opacity = Math.sin(Math.PI * k) * vis;
				if (sh.life <= 0) sh.mat.opacity = 0;
			} else if (vis > 0.5 && (sh.cd -= dt) <= 0) {
				const ang = -(0.25 + rnd() * 0.45) + (rnd() < 0.5 ? 0 : Math.PI + 0.5);
				sh.sp.position.copy(camera.position).addScaledVector(cF, 75).addScaledVector(cR, (rnd() - 0.5) * 55).addScaledVector(cU, 2 + rnd() * 16);
				sh.vel.set(0, 0, 0).addScaledVector(cR, Math.cos(ang) * 38).addScaledVector(cU, Math.sin(ang) * 38);
				sh.mat.rotation = ang;
				sh.dur = sh.life = 0.8 + rnd() * 0.7;
				sh.cd = 3 + rnd() * 7;
			}
		}
	});

	/* ───────── time of day: day, golden-hour dusk, night ───────── */
	const C = (h: number) => new THREE.Color(h);
	const DAY = {
		hs: C(0xbfe0ff), hg: C(0xa8946e), sun: C(0xfff1dc),
		sky: [C(0x6fbdf5), C(0xb4e1ff), C(0xffe9c9)], cloud: C(0xffffff), cloudE: C(0xffe5ef), sea: C(0xffffff), mist: C(0xeaf6ff), deep: C(0x0d4a78)
	};
	const DUSK = {
		hs: C(0xffb98f), hg: C(0x5a3a58), sun: C(0xff9a55),
		sky: [C(0x1f2566), C(0xd9627a), C(0xffb15e)], cloud: C(0xffc7a8), cloudE: C(0xd9627a), sea: C(0xffb59a), mist: C(0xffc9a6), deep: C(0x3a2a5e)
	};
	const NIGHT = {
		hs: C(0x6074e0), hg: C(0x1a1038), sun: C(0xa9bcff),
		sky: [C(0x040716), C(0x0c1640), C(0x1d2c6c)], cloud: C(0x5b5f94), cloudE: C(0x2a2f66), sea: C(0x232a5c), mist: C(0x7c8fe0), deep: C(0x06203a)
	};
	const SUN_P = new THREE.Vector3(11, 15, 9),
		DUSK_P = new THREE.Vector3(-15, 6.5, -5),
		MOON_P = new THREE.Vector3(-10, 13, -8);
	const mixC = (out: THREE.Color, d: THREE.Color, u: THREE.Color, n: THREE.Color, t: number) =>
		t <= 1 ? out.lerpColors(d, u, t) : out.lerpColors(u, n, t - 1);
	const mixS = (d: number, u: number, n: number, t: number) => (t <= 1 ? L(d, u, t) : L(u, n, t - 1));
	const tmp = new THREE.Color();
	const skyNow = [new THREE.Color(), new THREE.Color(), new THREE.Color()];
	const MODES: TimeMode[] = ['day', 'dusk', 'night'];
	const startTod = isLocalNight() ? 2 : 0;
	let tod = startTod,
		todTarget = startTod,
		lastTod = -1,
		followClock = true;
	const skyCtx = skyCanvas.getContext('2d')!;
	function paintSky(t: number) {
		const gl = gloom();
		for (let i = 0; i < 3; i++) {
			mixC(skyNow[i], DAY.sky[i], DUSK.sky[i], NIGHT.sky[i], t);
			if (gl > 0) {
				const lum = skyNow[i].r * 0.3 + skyNow[i].g * 0.59 + skyNow[i].b * 0.11;
				const dim = 0.9 - 0.45 * gl;
				skyNow[i].lerp(tmp.setRGB(lum * dim, lum * dim * 1.03, lum * dim * 1.12), gl * 0.8);
			}
		}
		const gr = skyCtx.createLinearGradient(0, 0, 0, 256);
		gr.addColorStop(0, '#' + skyNow[0].getHexString());
		gr.addColorStop(0.55, '#' + skyNow[1].getHexString());
		gr.addColorStop(1, '#' + skyNow[2].getHexString());
		skyCtx.fillStyle = gr;
		skyCtx.fillRect(0, 0, 2, 256);
		skyTex.needsUpdate = true;
		(scene.fog as THREE.FogExp2).color.copy(skyNow[1]);
	}
	const sunDirNow = new THREE.Vector3();
	let hemiBase = 1,
		sunBase = 2.5,
		starBase = 0,
		seaOpBase = 0.6,
		mistBase = 0.1,
		bloomBase = 0.5,
		lastGloom = -1;
	const seaBase = new THREE.Color();
	const GREY = new THREE.Color(0x77808f);
	function applyWeather(force = false) {
		const gl = gloom();
		sun.intensity = sunBase * (1 - 0.7 * W.cloud);
		hemi.intensity = hemiBase * (1 - 0.3 * gl) + lightning.flash * 3.2;
		bloom.strength = bloomBase + lightning.flash * 0.5;
		(stars.material as THREE.PointsMaterial).opacity = starBase * (1 - Math.min(1, W.cloud * 0.9 + W.fog));
		seaMat.color.copy(seaBase).lerp(GREY, W.cloud * 0.5);
		seaMat.opacity = Math.min(0.92, seaOpBase * (1 + W.cloud * 0.35 + W.fog * 0.4));
		mistMat.opacity = Math.min(0.5, mistBase * (1 + W.fog * 4));
		(scene.fog as THREE.FogExp2).density = 0.006 + W.fog * 0.028 + W.rain * 0.004 + W.snow * 0.006;
		butterflies.visible = tod < 1.1 && W.rain < 0.15 && W.snow < 0.1;
		state.cloud = W.cloud;
		state.wind = W.wind;
		waterU.uRain.value = W.rain;
		if (force || Math.abs(gl - lastGloom) > 0.004) {
			lastGloom = gl;
			if (!force) {
				paintSky(tod);
				waterU.uTop.value.copy(skyNow[0]);
				waterU.uHor.value.copy(skyNow[2]);
			}
		}
	}
	function applyTime(t: number) {
		const n = t / 2;
		mixC(hemi.color, DAY.hs, DUSK.hs, NIGHT.hs, t);
		mixC(hemi.groundColor, DAY.hg, DUSK.hg, NIGHT.hg, t);
		hemiBase = mixS(1.1, 0.95, 0.22, t);
		mixC(sun.color, DAY.sun, DUSK.sun, NIGHT.sun, t);
		sunBase = mixS(2.7, 3.0, 0.38, t);
		if (t <= 1) sun.position.lerpVectors(SUN_P, DUSK_P, t);
		else sun.position.lerpVectors(DUSK_P, MOON_P, t - 1);
		renderer.toneMappingExposure = mixS(1.05, 1.12, 0.82, t);
		const env = mixS(0.3, 0.22, 0.05, t);
		scene.traverse((o) => {
			const mat = (o as THREE.Mesh).material as Mat | undefined;
			if (mat && 'envMapIntensity' in mat) mat.envMapIntensity = env;
		});
		mixC(cloudMat.color, DAY.cloud, DUSK.cloud, NIGHT.cloud, t);
		mixC(cloudMat.emissive, DAY.cloudE, DUSK.cloudE, NIGHT.cloudE, t);
		mixC(seaBase, DAY.sea, DUSK.sea, NIGHT.sea, t);
		seaOpBase = mixS(0.55, 0.65, 0.32, t);
		mixC(mistMat.color, DAY.mist, DUSK.mist, NIGHT.mist, t);
		mistBase = mixS(0.09, 0.15, 0.12, t);
		starBase = Math.max(0, (n - 0.3) / 0.7);
		sunDirNow.lerpVectors(SUN_P, DUSK_P, Math.min(t, 1)).normalize().multiplyScalar(62);
		sunO.mesh.position.copy(sunDirNow);
		sunO.halo.position.copy(sunDirNow);
		const sunVis = 1 - THREE.MathUtils.clamp((t - 1) / 0.7, 0, 1),
			moonVis = THREE.MathUtils.clamp((t - 0.8) / 1.2, 0, 1);
		sunO.m.opacity = sunVis;
		sunO.hm.opacity = 0.2 * sunVis;
		moonO.m.opacity = moonVis;
		moonO.hm.opacity = 0.14 * moonVis;
		fliesM.opacity = mixS(0.12, 0.55, 1, t);
		orbitLine.material.opacity = mixS(0.08, 0.16, 0.3, t);
		mixC(tmp, C(0x2a3a6a), C(0x3a2a4a), C(0x0b0f24), t);
		birdMat.color.copy(tmp);
		lanternMat.opacity = Math.max(0, (n - 0.2) / 0.8);
		blobMat.opacity = mixS(0.38, 0.45, 0.55, t);
		bloomBase = mixS(0.22, 0.5, 0.8, t);
		grade.uniforms.uTod.value = t;
		paintSky(t);
		waterU.uTop.value.copy(skyNow[0]);
		waterU.uHor.value.copy(skyNow[2]);
		mixC(waterU.uDeep.value, DAY.deep, DUSK.deep, NIGHT.deep, t);
		mixC(waterU.uSunCol.value, C(0xfff1dc), C(0xff9a55), C(0xa9bcff), t);
		waterU.uSun.value.copy(sun.position);
		applyWeather(true);
	}
	const rayPos = new THREE.Vector3(),
		rayTmp = new THREE.Vector3();
	function updateRays() {
		if (low) return;
		if (tod <= 1) rayPos.copy(sunDirNow);
		else rayPos.lerpVectors(sunDirNow, moonO.mesh.position, tod - 1);
		camera.updateMatrixWorld();
		rayTmp.copy(rayPos).applyMatrix4(camera.matrixWorldInverse);
		const inFront = rayTmp.z < 0;
		rayTmp.copy(rayPos).project(camera);
		rays.uniforms.uLight.value.set(rayTmp.x * 0.5 + 0.5, rayTmp.y * 0.5 + 0.5);
		rays.uniforms.uStrength.value = inFront ? mixS(0.5, 1.0, 0.55, tod) * (1 - W.cloud * 0.6) : 0;
		mixC(rays.uniforms.uTint.value, C(0xfff0cc), C(0xff9a55), C(0x9fb4ff), tod);
	}
	function setTimeMode(m: TimeMode) {
		todTarget = MODES.indexOf(m);
		if (reduceMotion) tod = todTarget;
		opts.onTime(m);
	}
	opts.onTime(MODES[startTod]);
	// everything translucent or additive is hidden from the ambient-occlusion depth pass
	scene.traverse((o) => {
		const m = (o as THREE.Mesh).material as THREE.Material | THREE.Material[] | undefined;
		if (m && (Array.isArray(m) ? m.some((x) => x.transparent) : m.transparent)) fx.push(o);
	});

	/* ───────── interaction ───────── */
	const el = renderer.domElement;
	const ray = new THREE.Raycaster(),
		ndc = new THREE.Vector2();
	function pick(e: PointerEvent): Item | null {
		const r = el.getBoundingClientRect();
		ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
		ray.setFromCamera(ndc, camera);
		for (const h of ray.intersectObjects(
			interactives.map((i) => i.group),
			true
		)) {
			let o: THREE.Object3D | null = h.object;
			while (o && !o.userData.itemId) o = o.parent;
			if (o) return byId[o.userData.itemId as string];
		}
		return null;
	}
	let hovered: Item | null = null,
		selected: Item | null = null,
		down: { x: number; y: number } | null = null;
	const onMove = (e: PointerEvent) => {
		if (e.pointerType !== 'mouse') return;
		const it = e.buttons ? null : pick(e);
		hovered = it;
		el.classList.toggle('is-hover', !!it);
		opts.onHover(it ? it.id : null, e.clientX, e.clientY);
	};
	const onLeave = () => {
		hovered = null;
		opts.onHover(null, 0, 0);
	};
	const onDown = (e: PointerEvent) => {
		down = { x: e.clientX, y: e.clientY };
		skipIntro();
	};
	const wp = new THREE.Vector3();
	function select(it: Item | null) {
		if (it?.id === 'back') {
			opts.onBack();
			return;
		}
		selected = it;
		cardOpen = !!it;
		opts.onSelect(it ? it.id : null);
		if (it) {
			controls.autoRotate = false;
			clearTimeout(resumeTimer);
			if (it.id !== 'planet') {
				it.group.getWorldPosition(wp);
				// aim a little below the object so it sits in the upper half, clear of the card
				glide.target = new THREE.Vector3(wp.x * 0.85, Math.max(0, wp.y * 0.6) - 1.2, wp.z * 0.85);
				const d = camera.position.distanceTo(controls.target);
				glide.dist = THREE.MathUtils.clamp(d * 0.8, 15, 22);
			}
		} else {
			glide.target = new THREE.Vector3(0, 0, 0);
			glide.dist = null;
			if (!reduceMotion) {
				clearTimeout(resumeTimer);
				resumeTimer = setTimeout(() => (controls.autoRotate = true), 3000);
			}
		}
	}
	const onUp = (e: PointerEvent) => {
		if (!down) return;
		const mv = Math.hypot(e.clientX - down.x, e.clientY - down.y);
		down = null;
		if (mv > 6) return;
		const it = pick(e);
		if (!it && ray.intersectObject(water, false).length) krakenPoke();
		select(it);
	};
	el.addEventListener('pointermove', onMove);
	el.addEventListener('pointerleave', onLeave);
	el.addEventListener('pointerdown', onDown);
	el.addEventListener('pointerup', onUp);

	/* ───────── guided tour ───────── */
	const TOUR = ['workshop', 'chapel', 'arcade', 'toolshed', 'appstore', 'play'];
	const tour = { active: false, i: -1, wait: 0 };
	function startTour() {
		if (tour.active) return;
		skipIntro();
		tour.active = true;
		tour.i = -1;
		tour.wait = 0;
		controls.autoRotateSpeed = 1.1;
		opts.onTour(true);
	}
	function stopTour(silent = false) {
		if (!tour.active) return;
		tour.active = false;
		controls.autoRotateSpeed = 0.5;
		if (!silent) {
			opts.onTour(false);
			if (selected) select(null);
		}
	}
	function tourStep(dt: number) {
		tour.wait -= dt;
		if (tour.wait > 0) return;
		tour.i++;
		if (tour.i >= TOUR.length) {
			tour.active = false;
			controls.autoRotateSpeed = 0.5;
			select(null);
			glide.dist = HOME.length();
			opts.onTour(false);
			return;
		}
		select(byId[TOUR[tour.i]]);
		controls.autoRotate = !reduceMotion;
		tour.wait = 5.5;
	}

	/* ───────── sizing ───────── */
	function resize() {
		const w = Math.max(1, container.clientWidth),
			h = Math.max(1, container.clientHeight);
		renderer.setSize(w, h, false);
		composer.setPixelRatio(renderer.getPixelRatio());
		composer.setSize(w, h);
		bloom.resolution.set(w / (low ? 2 : 1), h / (low ? 2 : 1));
		const pr = renderer.getPixelRatio();
		tiltH.uniforms.uRes.value.set(w * pr, h * pr);
		tiltV.uniforms.uRes.value.set(w * pr, h * pr);
		camera.aspect = w / h;
		camera.zoom = w / h < 1 ? 0.5 + 0.5 * (w / h) : 1;
		camera.updateProjectionMatrix();
	}
	const ro = new ResizeObserver(resize);
	ro.observe(container);
	resize();

	/* ───────── intro fly-in ───────── */
	const INTRO = 3.4;
	let introT = reduceMotion ? INTRO : 0;
	const introFrom = new THREE.Vector3(36, 26, 40);
	function skipIntro() {
		if (introT < INTRO) {
			introT = INTRO;
			camera.position.copy(HOME);
			controls.enabled = true;
		}
	}
	if (introT < INTRO) {
		controls.enabled = false;
		camera.position.copy(introFrom);
	}

	/* ───────── loop ───────── */
	const clock = new THREE.Clock();
	let lastFlash = 0;
	let first = true,
		hudT = 0,
		clockT = 0,
		disposed = false;
	const offv = new THREE.Vector3();
	renderer.setAnimationLoop(() => {
		const dt = Math.min(clock.getDelta(), 0.05),
			t = clock.elapsedTime,
			mo = mo0;

		clockT += dt;
		if (followClock && clockT > 1) {
			clockT = 0;
			const next = isLocalNight() ? 2 : 0;
			if (next !== todTarget) {
				todTarget = next;
				if (reduceMotion) tod = todTarget;
			}
		}
		if (Math.abs(tod - todTarget) > 0.001) {
			tod += (todTarget - tod) * Math.min(1, dt * 1.6);
			if (Math.abs(tod - todTarget) < 0.003) tod = todTarget;
		}
		if (tod !== lastTod) {
			applyTime(tod);
			lastTod = tod;
		}
		const nm = THREE.MathUtils.smoothstep(tod / 2, 0, 1);
		state.nm = nm;
		state.tod = tod;
		waterU.uTime.value = t;
		{
			let moving = false;
			const kw = reduceMotion ? 1 : 1 - Math.exp(-dt * 0.8);
			for (const k of W_KEYS) {
				const d = WT[k] - W[k];
				if (Math.abs(d) > 0.001) {
					W[k] += d * kw;
					moving = true;
				} else W[k] = WT[k];
			}
			weatherFx(dt, t);
			if (moving || lightning.flash > 0 || lastFlash > 0) applyWeather();
			lastFlash = lightning.flash;
		}

		if (introT < INTRO) {
			introT += dt;
			const k = THREE.MathUtils.clamp(introT / INTRO, 0, 1),
				e = 1 - Math.pow(1 - k, 3),
				ang = (1 - e) * 1.1;
			offv.copy(introFrom).lerp(HOME, e);
			const c = Math.cos(ang),
				s = Math.sin(ang);
			camera.position.set(offv.x * c - offv.z * s, offv.y, offv.x * s + offv.z * c);
			camera.lookAt(0, 0, 0);
			if (k >= 1) {
				controls.enabled = true;
				camera.position.copy(HOME);
			}
		} else {
			if (glide.target) {
				const k = 1 - Math.exp(-dt * 3);
				controls.target.lerp(glide.target, k);
				if (glide.dist !== null) {
					offv.copy(camera.position).sub(controls.target);
					const d = offv.length(),
						nd = L(d, glide.dist, k);
					camera.position.copy(controls.target).addScaledVector(offv.normalize(), nd);
					if (Math.abs(nd - glide.dist) < 0.05) glide.dist = null;
				}
				if (glide.dist === null && controls.target.distanceTo(glide.target) < 0.02) glide.target = null;
			}
			controls.update();
		}

		world.position.y = Math.sin(t * 0.8) * 0.12 * mo;
		for (const f of tick) f(dt * mo, t * mo);
		for (const c of clouds) c.pivot.rotation.y += c.sp * dt * mo * (1 + W.wind * 3);
		for (const s of islets) s.g.position.y = s.y + Math.sin(t * 0.7 + s.ph) * 0.25 * mo;
		orbitSpin.rotation.y += dt * 0.16 * mo;
		sat.rotation.y += dt * 0.6 * mo;
		satLightM.color.setRGB(1, 0.2, 0.3).multiplyScalar(Math.sin(t * 3) > 0.5 ? 1 : 0.15);
		for (const p of pings) {
			p.p = (p.p + dt * 0.12 * mo) % 1;
			const r = 8.2 + p.p * 7;
			p.m.scale.set(r, r, r);
			p.m.position.y = -1.6;
			(p.m.material as THREE.MeshBasicMaterial).opacity = nm * 0.5 * (1 - p.p);
		}
		for (const rp of ripples) {
			rp.p = (rp.p + dt * 0.28 * mo) % 1;
			rp.m.scale.setScalar(0.15 + rp.p * 0.9);
			(rp.m.material as THREE.MeshBasicMaterial).opacity = 0.45 * (1 - rp.p);
		}
		for (let i = 0; i < FF; i++) {
			const b = ffBase[i];
			ffPos[i * 3] = b.x + Math.sin(t * b.sp + b.ph) * 0.6;
			ffPos[i * 3 + 1] = b.y + Math.sin(t * b.sp * 1.3 + b.ph * 2) * 0.35;
			ffPos[i * 3 + 2] = b.z + Math.cos(t * b.sp + b.ph) * 0.6;
		}
		ffGeo.attributes.position.needsUpdate = true;

		if (planetIt)
			for (const m of planetIt.mats)
				if (m.transparent) m.opacity = ((m as unknown as THREE.Material).type === 'MeshBasicMaterial' ? 0.7 : 1) * L(0.3, 1, nm);
		for (const hm of holoMats) hm.m.opacity = hm.o * L(0.25, 1, nm);
		for (const n of nightLights)
			n.light.intensity = L(n.day, n.night, nm) + ((n.light.userData.flick as number | undefined) ?? 0) * nm;
		underGlow.intensity = 1.5 * nm;
		for (const m of glowers) m.emissiveIntensity = L(m.userData.dn[0], m.userData.dn[1], nm);
		for (const it of interactives) {
			const target = it === hovered || it === selected ? 1 : 0;
			it.h += (target - it.h) * Math.min(1, dt * 10);
			it.group.scale.setScalar(1 + 0.05 * it.h);
			for (const m of it.mats) {
				if (m.userData.plain) m.emissiveIntensity = it.h * 0.35;
				else if (m.userData.dn) m.emissiveIntensity = L(m.userData.dn[0], m.userData.dn[1], nm) + it.h * 0.5;
				else m.emissiveIntensity = (m.userData.baseEI ?? 0) + it.h * 0.5;
			}
			if (it.gem) {
				it.gem.position.y = it.gy + Math.sin(t * 2.2 + it.ph) * 0.09 * mo;
				it.gem.rotation.y = t * 1.5 * mo;
			}
		}

		hudT += dt;
		if (hudT > 0.15) {
			hudT = 0;
			const dist = camera.position.distanceTo(controls.target);
			opts.onHud({
				utc: new Date().toISOString().substring(11, 19),
				met: `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(Math.floor(t) % 60).padStart(2, '0')}`,
				az: Math.round(((Math.atan2(camera.position.x - controls.target.x, camera.position.z - controls.target.z) * 180) / Math.PI + 360) % 360),
				el: Math.round((Math.asin((camera.position.y - controls.target.y) / dist) * 180) / Math.PI),
				alt: world.position.y
			});
		}

		grade.uniforms.uTime.value = t % 100;
		if (tour.active) tourStep(dt);
		updateRays();
		composer.render();
		if (first) {
			first = false;
			opts.onReady();
		}
		void isFoundNoop;
	});
	const isFoundNoop = opts.isFound; // referenced by the page for "? ? ?" labels; kept here so the contract is explicit

	return {
		setTime(mode: TimeMode) {
			followClock = false;
			setTimeMode(mode);
		},
		setWeather(w: WeatherState | null) {
			for (const k of W_KEYS) WT[k] = w ? w[k] : 0;
		},
		cycleTime() {
			followClock = false;
			setTimeMode(MODES[(Math.round(todTarget) + 1) % 3]);
		},
		startTour() {
			startTour();
		},
		stopTour() {
			stopTour();
		},
		closeCard() {
			if (selected) select(null);
		},
		dispose() {
			if (disposed) return;
			disposed = true;
			renderer.setAnimationLoop(null);
			clearTimeout(resumeTimer);
			stopTour(true);
			ro.disconnect();
			el.removeEventListener('pointermove', onMove);
			el.removeEventListener('pointerleave', onLeave);
			el.removeEventListener('pointerdown', onDown);
			el.removeEventListener('pointerup', onUp);
			controls.dispose();
			scene.traverse((o) => {
				const m = o as THREE.Mesh;
				m.geometry?.dispose?.();
				const mat = m.material as THREE.Material | THREE.Material[] | undefined;
				if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
				else mat?.dispose?.();
			});
			composer.dispose();
			renderer.dispose();
			el.remove();
		}
	};
}

// Re-exported so the page can describe an entry without importing data twice.
export { ENTRIES };
