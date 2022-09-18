import WebGL from "/utils/WebGL.js";

if ( WebGL.isWebGLAvailable() ) {

	var windowWidth = window.visualViewport.width;
	var windowHeight = window.visualViewport.height;

	var windowAspectRatio = windowWidth/windowHeight

	var scene = new THREE.Scene();
	var camera = new THREE.PerspectiveCamera( 75, windowAspectRatio, 0.1, 1000 );
	var renderer = new THREE.WebGLRenderer();

	init();
	render();

} else {

	const warning = WebGL.getWebGLErrorMessage();
	document.getElementById( 'container' ).appendChild( warning );

}

function init() {
	renderer.setSize( windowWidth, windowHeight );
	document.body.appendChild( renderer.domElement );
	window.addEventListener( 'resize', onWindowResize );
}

function render() {
	const geometry = new THREE.SphereGeometry( 1, 32, 16 );
	const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
	const sphere = new THREE.Mesh( geometry, material );

	material.wireframe = true;
	scene.add( sphere );

	camera.position.z = 2;

	animate();

	function animate() {
		requestAnimationFrame( animate );
		sphere.rotation.x += 0.01;
		sphere.rotation.y += 0.01;
		sphere.rotation.z += 0.01;
		renderer.render( scene, camera );
	}
}

function onWindowResize() {
	windowWidth = window.visualViewport.width;
	windowHeight = window.visualViewport.height;

	camera.aspect = windowWidth / windowHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( windowWidth, windowHeight );
}