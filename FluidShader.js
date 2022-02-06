var defaultVertexShader =
`
	varying vec2 vUv;

	void main() {

		vUv = uv;
		gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);

	}
`

var InitVelocityFieldShader = {
	uniforms: {},
	vertexShader: defaultVertexShader,
	fragmentShader:
	`
	#define PI 3.1415926538
	varying vec2 vUv;

	void main() {
		gl_FragColor = vec4(sin(2.0 * PI * vUv.y + PI/2.), sin(2.0 * PI * vUv.x + PI/2.), 0.0, 1.0);
	}
	`
};

var PaintShader = {
	uniforms: {
		'tDiffuse': { value: null },
		'rgba': { value: new THREE.Vector4(1., 0., 0., 1.) },
		'center': { value: new THREE.Vector2() },
		'radius': { value: .001 }
	},
	vertexShader: defaultVertexShader,
	fragmentShader:
	`
	uniform sampler2D tDiffuse;
	uniform vec4 rgba;
	uniform vec2 center;
	uniform float radius;

	varying vec2 vUv;

	void main() {
		float dx = center.x - vUv.x;
		float dy = center.y - vUv.y;
		gl_FragColor = texture2D(tDiffuse, vUv) + rgba * exp(-(dx * dx + dy * dy) / radius);
	}
	`
};

var FillShader = {
	uniforms: {
		'red': { value: 0.0 },
		'green': { value: 0.0 },
		'blue': { value: 0.0 }
	},
	vertexShader: defaultVertexShader,
	fragmentShader:
	`
	uniform float red;
	uniform float green;
	uniform float blue;
	varying vec2 vUv;

	void main() {
		gl_FragColor = vec4(red, green, blue, 1.0);
	}
	`
};

var AdvectionShader = {
	uniforms: {
		'delta': {value: 0.016},
		'inputTexture': {value: null},
		'velocity': {value: null}
	},
	vertexShader: defaultVertexShader,
	fragmentShader:
	`
	varying vec2 vUv;
	uniform float delta;
	uniform sampler2D inputTexture;
	uniform sampler2D velocity;
	void main() {
	  vec2 u = texture2D(velocity, vUv).xy;
		//fract for repeat
	  vec2 pastCoord = fract(vUv - u * delta);
		//todo: bilerp
	  gl_FragColor = texture2D(inputTexture, pastCoord);
	}
	`
}
