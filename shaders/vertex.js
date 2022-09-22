export default ` /* GLSL */
#include <fog_pars_vertex>

uniform float uTime;
uniform float size;
uniform float amount;
uniform float rangeY;

attribute float scale;
attribute float velocityX;
attribute float velocityY;
attribute float angle;

bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}

void main() {
  
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

  vec3 newPos = position;

  // Sawtooth Type Wave Function
  float indexRatio = position.y / rangeY;
  float threshold = 0.7 + indexRatio * 0.3;
  float ratio = mod((uTime * -velocityY * 0.01) - indexRatio, threshold);

  newPos.y += mix(rangeY, -rangeY, ratio / threshold);

  // Sine Type Wave Function
  newPos.x += sin(uTime * angle) * cos(uTime * 2.0 * angle) * (velocityX * 10.0);

  gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0);

  gl_PointSize = size;

	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif

  #include <fog_vertex>
}
`;