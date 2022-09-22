/**
 * WebGL Snow Particles Background
 * 
 * A snowfall particle simulation using the three.js(https://threejs.org/) (r144) WebGL library.
 * This was created for use in tadmozeltov's (https://git.tadmozeltov.com/tadmozeltov/secret-santa) 
 * Secret Santa "Meowmas" web application (https://santa.tadmozeltov.com/) by Dan.
 */

import WebGL from "./utils/WebGL.js";
import vertexShader from "./shaders/vertex.js"
import fragmentShader from "./shaders/fragment.js"

// OPTIONS CONFIGURATION //
const options = {
	backgroundColor: 0x0A0E10,
	fog: true,
	fogRange: 80,
	particleCount: 2000,
	ratio: 0.05,
	snowSize: 4,
	spriteSize: 6,
	sizeAttenuation: true,
	alphaTest: 0.85,
	cameraPositionZ: 100,
	rangeX: 400,
	rangeY: 400,
	rangeZ: 100,
	velocityX: 4,
	velocityY: 2,
	angleX: 0,
	snowSpritePath: './textures/snow.png',
	spritePath: './textures/OCTad_Xmas.png',
}

// Checks for WebGL support
if (WebGL.isWebGLAvailable()) {

	var windowWidth = window.visualViewport.width;
	var windowHeight = window.visualViewport.height;

	var windowAspectRatio = windowWidth/windowHeight

	var scale = windowHeight / 2;

	var scene = new THREE.Scene();
	var camera = new THREE.PerspectiveCamera(75, windowAspectRatio, 0.1, 1000);
	var renderer = new THREE.WebGLRenderer({antialias: true});

	init();
	render();

} else {

	const warning = WebGL.getWebGLErrorMessage();
	document.getElementById('container').appendChild(warning);

}

// Initialize renderer
function init() {
	renderer.setSize(windowWidth, windowHeight);
	renderer.setPixelRatio(window.devicePixelRatio);
	document.body.appendChild(renderer.domElement);
	window.addEventListener('resize', onWindowResize);
	
	console.table(options);
}

// Create and animate mesh/particle geometry and materials
function render() {

	// Environment and Camera Settings
	scene.background = new THREE.Color(options.backgroundColor);
	if (options.fog) {scene.fog = new THREE.Fog(options.backgroundColor, options.fogRange, options.fogRange * 2)};
	camera.position.z = options.cameraPositionZ;

	// Load Sprite Textures
	const snowSprite = new THREE.TextureLoader().load(options.snowSpritePath);
	const sprite = new THREE.TextureLoader().load(options.spritePath);
	snowSprite.flipY = false;
	sprite.flipY = false;

	// Create Materials
	const snowMat = newParticleMaterial(options.snowSize, snowSprite);
	const spriteMat = newParticleMaterial(options.spriteSize, sprite);

	// Create Particle Systems
	const snowParticleSystem = newParticleSystem(snowMat, options.particleCount);
	const spriteParticleSystem = newParticleSystem(spriteMat, options.particleCount * options.ratio);
	
	// Add to Render Scene
	scene.add(snowParticleSystem);
	scene.add(spriteParticleSystem);

	const clock = new THREE.Clock();
	const tick = () => // Update Loop
	{

		const time = clock.getElapsedTime()
		snowMat.uniforms.uTime.value = time;
		spriteMat.uniforms.uTime.value = time;

		requestAnimationFrame(tick);
		renderer.render(scene, camera);
	}

	tick();
}

/**
 * Create a new buffer geometry particle system using custom particle shader material.
 *
 * @param {Three.ShaderMaterial} material - shader material to use for the particle system.
 * @param {int} particleCount - number of particles created in the particle system.
 * @returns {THREE.Points}
 */
function newParticleSystem (material, particleCount) {

	const bufferGeometry = new THREE.BufferGeometry();
	const scales = new Float32Array(particleCount).fill(scale);
	const position = [];
	const velocityX = [];
	const velocityY = [];
	const angle = [];
	
	for (let i = 0; i < particleCount; i++) {

		const posOptions = [options.rangeX, options.rangeY, options.rangeZ];

		// Generate random positions based on range defined
		for (let j = 0; j < posOptions.length; j++) {
			position.push(THREE.MathUtils.randFloatSpread(posOptions[j]));
		}

		// Generate random velocities based on range defined
		const vX = THREE.MathUtils.randFloat(-options.velocityX - 0.01, Math.min(-options.velocityX + 0.01, -0.01));
		const vY = THREE.MathUtils.randFloat(-options.velocityY - 0.1, Math.min(-options.velocityY + 0.1, -0.1));
		const a = THREE.MathUtils.randFloat(options.angleX - 0.1, options.angleX + 0.1);

		velocityX.push(vX);
		velocityY.push(vY);
		angle.push(a);
	}

	bufferGeometry.setAttribute('position', new THREE.Float32BufferAttribute(position, 3));
	bufferGeometry.setAttribute('scale', new THREE.Float32BufferAttribute(scales, 1));
	bufferGeometry.setAttribute('velocityX', new THREE.Float32BufferAttribute(velocityX, 1));
	bufferGeometry.setAttribute('velocityY', new THREE.Float32BufferAttribute(velocityY, 1));
	bufferGeometry.setAttribute('angle', new THREE.Float32BufferAttribute(angle, 1));
	bufferGeometry.attributes.position.needsUpdate = true;
	bufferGeometry.attributes.scale.needsUpdate = true;

	return new THREE.Points(bufferGeometry, material);
}

/**
 * Returns custom shader material for particles
 *
 * @param {float} size - particle size.
 * @param {Three.Texture} sprite - particle sprite texture.
 * @returns {THREE.ShaderMaterial}
 */
function newParticleMaterial (size, sprite) {

	return new THREE.ShaderMaterial({
		uniforms: THREE.UniformsUtils.merge(
			[{
				uTime: { value: 0 },
				size: { value: size },
				amount: { value: options.particleCount },
				rangeY: { value: options.rangeY },
				map: { value: sprite },
				alpha: { value: 0.5 },
				alphaTest: { value: options.alphaTest },
			},
			THREE.UniformsLib['fog']]),

		defines: {
			USE_SIZEATTENUATION: options.sizeAttenuation,
		},

		vertexShader: vertexShader,
		fragmentShader: fragmentShader,

		transparent: true,
		fog: options.fog,
	});
}

// Updates scene render size to always fit window
function onWindowResize() {
	windowWidth = window.visualViewport.width;
	windowHeight = window.visualViewport.height;

	camera.aspect = windowWidth / windowHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( windowWidth, windowHeight );
}