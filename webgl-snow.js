import WebGL from "./utils/WebGL.js";

// OPTIONS CONFIGURATION //
const options = {
	backgroundColor: 0x0A0E10,
	fog: true,
	particleCount: 1000,
	ratio: 0.05,
	snowSize: 3,
	spriteSize: 6,
	sizeAttenuation: true,
	alphaTest: 0.1,
	rangeX: 200,
	rangeY: 200,
	rangeZ: 100,
	velocityX: 0.03,
	velocityY: 0.1,
	angleX: 0.1,
	snowSpritePath: './textures/snow.png',
	spritePath: './textures/OCTad_Xmas.png',
}

// Checks for WebGL support
if (WebGL.isWebGLAvailable()) {

	var windowWidth = window.visualViewport.width;
	var windowHeight = window.visualViewport.height;

	var windowAspectRatio = windowWidth/windowHeight

	var scene = new THREE.Scene();
	var camera = new THREE.PerspectiveCamera(75, windowAspectRatio, 0.1, 1000);
	var renderer = new THREE.WebGLRenderer();

	init();
	render();

} else {

	const warning = WebGL.getWebGLErrorMessage();
	document.getElementById('container').appendChild(warning);

}

// Initialize renderer
function init() {
	renderer.setSize(windowWidth, windowHeight);
	document.body.appendChild(renderer.domElement);
	window.addEventListener('resize', onWindowResize);
	
	console.table(options);
}

// Create and animate mesh/particle geometry and materials
function render() {

	// Environment and Camera Settings
	scene.background = new THREE.Color(options.backgroundColor);
	if (options.fog) {scene.fog = new THREE.Fog(options.backgroundColor, options.rangeZ, options.rangeZ*2)};
	camera.position.z = options.rangeZ;

	// Load Sprites
	const snowSprite = new THREE.TextureLoader().load(options.snowSpritePath);
	const sprite = new THREE.TextureLoader().load(options.spritePath);

	// Create Materials
	const snowMat = newPointsMaterial(options.snowSize, snowSprite);
	const spriteMat = newPointsMaterial(options.spriteSize, sprite);

	var particlesData = []

	// Create Particles
	for (let i = 0; i < options.particleCount; i++) {

		// Create geometry
		const bufferGeometry = new THREE.BufferGeometry();

		// Generate random positions based on range defined
		const x = getRandomArbitrary(-options.rangeX, options.rangeX);
		const y = getRandomArbitrary(-options.rangeY, options.rangeY);
		const z = getRandomArbitrary(-options.rangeZ, options.rangeZ);

		// Generate random velocity based on values defined
		var vertexData = {
			"vX": getRandomArbitrary(-options.velocityX - 0.01, Math.min(-options.velocityX + 0.01, -0.01)),
			"vY": getRandomArbitrary(-options.velocityY - 0.1, Math.min(-options.velocityY + 0.1, -0.1)),
			"a": getRandomArbitrary(-options.angleX - 0.1, Math.min(-options.angleX + 0.1, -0.01))
		}
		particlesData.push(vertexData);

		// Create a sprite every n based on the ratio defined
		var bool = i % (options.particleCount / (options.particleCount * options.ratio)) == 0;

		const material = bool ? spriteMat : snowMat;
		const spriteParticle = new THREE.Points(bufferGeometry, material);
		bufferGeometry.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array([0,0,0]), 3));
		spriteParticle.position.set(x, y, z);
		scene.attach(spriteParticle);
	}

	const tick = () => // Animation Loop
	{
		const time = Date.now() * 0.001;

		// For each particle, animate falling and waving motion
		// TODO: Replace with shader based implementation for greater performance
		for (let i = 0; i < scene.children.length; i ++) {

			const object = scene.children[i];

			// Particle Velocity Calculation
			const vY = particlesData[i].vY;
			const angle = particlesData[i].a;
			const vX = Math.sin(time * angle) * Math.cos(time * 2 * angle) * particlesData[i].vX;
			// const vZ = Math.sin(-time * angle) * Math.cos(time * angle) * 0.1;

			// Translate particles based on calculated velocity values
			object.translateY(vY);
			object.translateX(vX);
			// object.translateZ(vZ);

			// Loop particles to top of range when bottom reached
			if (object.position.y < -options.rangeY) {
				object.position.y = options.rangeY;
			}
		}

		renderer.render(scene, camera);
		requestAnimationFrame(tick);
	}

	tick();
}

// Returns new three.js PointsMaterial
function newPointsMaterial (size, sprite) {
	return new THREE.PointsMaterial({
		size: size,
		sizeAttenuation: options.sizeAttenuation,
		map: sprite,
		alphaTest: options.alphaTest,
		transparent: true
	});
}

// Returns random value between min and max 
function getRandomArbitrary(min, max) {
	return Math.random() * (max - min) + min;
}

// Updates scene render size to always fit window
function onWindowResize() {
	windowWidth = window.visualViewport.width;
	windowHeight = window.visualViewport.height;

	camera.aspect = windowWidth / windowHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( windowWidth, windowHeight );
}