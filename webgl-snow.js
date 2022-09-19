import WebGL from "/utils/WebGL.js";

// OPTIONS CONFIGURATION //
const options = {
	backgroundColor: 0x0A0E10,
	fog: true,
	particleCount: 1000,
	ratio: 0.05,
	snowSize: 1,
	spriteSize: 6,
	sizeAttenuation: true,
	rangeX: 200,
	rangeY: 200,
	rangeZ: 100,
	velocity: 0.1,
	angle: 0.1,
	angular: 0.05
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
	if (options.fog) scene.fog = new THREE.Fog(options.backgroundColor, options.rangeZ, options.rangeZ*2);
	camera.position.z = options.rangeZ;

	// Create Materials
	const basicMaterial = new THREE.MeshBasicMaterial({color: 0xffffff});

	const sprite = new THREE.TextureLoader().load('/textures/OCTad_Xmas.png');
	const pointsMaterial = new THREE.PointsMaterial({ 	size: options.spriteSize,
														sizeAttenuation: options.sizeAttenuation,
														map: sprite,
														alphaTest: 0.5,
														transparent: true
													});

	var particlesData = []

	// Create Particles
	for (let i = 0; i < options.particleCount; i++) {

		// Create geometry
		const bufferGeometry = new THREE.BufferGeometry();
		const circleGeometry = new THREE.CircleGeometry(options.snowSize, 21);

		// Generate random positions based on range defined
		const x = getRandomArbitrary(-options.rangeX, options.rangeX);
		const y = getRandomArbitrary(-options.rangeY, options.rangeY);
		const z = getRandomArbitrary(-options.rangeZ, options.rangeZ);

		// Generate random velocity based on values defined
		var vertexData = {
			"velocity": getRandomArbitrary(-options.velocity - 0.1, -options.velocity + 0.05),
			"angle": getRandomArbitrary(-options.angle - 0.1, -options.angle + 0.1)
		}
		particlesData.push(vertexData);

		// Create a sprite every n based on the ratio defined
		if (i % (options.particleCount / (options.particleCount * options.ratio)) == 0) {
			const spriteParticle = new THREE.Points(bufferGeometry, pointsMaterial);
			bufferGeometry.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array([0,0,0]), 3));
			spriteParticle.position.set(x, y, z);
			scene.attach(spriteParticle);

		} else { // Otherwise, create a snow particle
			const snowParticle = new THREE.Mesh(circleGeometry, basicMaterial);
			snowParticle.position.set(x, y, z);
			scene.attach(snowParticle);
		}
	}

	const tick = () => // Animation Loop
	{
		const time = Date.now() * 0.001;

		// For each particle, animate falling and waving motion
		for (let i = 0; i < scene.children.length; i ++) {

			const object = scene.children[i];

			// Particle Velocity Calculation
			const vY = particlesData[i].velocity;
			const angle = particlesData[i].angle;
			const vX = Math.sin(time * angle) * Math.cos(time * 2 * angle) * options.angular;
			// const vZ = Math.sin(-time * aV) * Math.cos(time * aV) * 0.1;

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