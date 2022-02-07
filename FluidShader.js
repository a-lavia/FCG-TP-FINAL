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
	precision highp float;
	precision highp sampler2D;

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
	precision highp float;
	precision highp sampler2D;

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

var AdvectionShader = {
	uniforms: {
		'delta': {value: 0.016},
		'inputTexture': {value: null},
		'velocity': {value: null}
	},
	vertexShader: defaultVertexShader,
	fragmentShader:
	`
	precision highp float;
	precision highp sampler2D;

	varying vec2 vUv;
	uniform float delta;
	uniform sampler2D inputTexture;
	uniform sampler2D velocity;
	void main() {
	  vec2 u = texture2D(velocity, vUv).xy;
	  //vec2 pastCoord = fract(vUv - u * delta); //fract for repeat
	  vec2 pastCoord = vUv - u * delta;
	  gl_FragColor = texture2D(inputTexture, pastCoord);
	}
	`
}

var DivergenceShader = {
	uniforms: {
		'delta': {value: 0.016},
		'density': {value: 1.},
		'invGridSize': {value: 1./512.},
		'velocity': {value: null}
	},
	vertexShader: defaultVertexShader,
	fragmentShader:
	`
	precision highp float;
	precision highp sampler2D;

	varying vec2 vUv;
	uniform float delta;
	uniform float density;
	uniform float invGridSize;
	uniform sampler2D velocity;

	vec2 u(vec2 coord) {
		return texture2D(velocity, fract(coord)).xy;
	}

	void main() {
		gl_FragColor = vec4((-2.0 * invGridSize * density / delta) * (
			(u(vUv + vec2(invGridSize, 0)).x -
			 u(vUv - vec2(invGridSize, 0)).x)
			+
			(u(vUv + vec2(0, invGridSize)).y -
			 u(vUv - vec2(0, invGridSize)).y)
		), 0.0, 0.0, 1.0);
	}
	`
}

var PressureJacobiShader = {
	uniforms: {
		'invGridSize': {value: 1./512.},
		'divergence': {value: null},
		'pressure': {value: null}
	},
	vertexShader: defaultVertexShader,
	fragmentShader:
	`
	precision highp float;
	precision highp sampler2D;

	varying vec2 vUv;
	uniform float invGridSize;
	uniform sampler2D divergence;
	uniform sampler2D pressure;

	float d(vec2 coord) {
		return texture2D(divergence, fract(coord)).x;
	}

	float p(vec2 coord) {
		return texture2D(pressure, fract(coord)).x;
	}

	void main() {
		gl_FragColor = vec4(0.25 * (
			d(vUv)
			+ p(vUv + vec2(2.0 * invGridSize, 0.0))
			+ p(vUv - vec2(2.0 * invGridSize, 0.0))
			+ p(vUv + vec2(0.0, 2.0 * invGridSize))
			+ p(vUv - vec2(0.0, 2.0 * invGridSize))
		), 0.0, 0.0, 1.0);
	}
	`
}

var SubstractPressureGradient = {
	uniforms: {
		'delta': {value: 0.016},
		'density': {value: 1.},
		'invGridSize': {value: 1./512.},
		'velocity': {value: null},
		'pressure': {value: null}
	},
	vertexShader: defaultVertexShader,
	fragmentShader:
	`
	precision highp float;
	precision highp sampler2D;

	varying vec2 vUv;
	uniform float delta;
	uniform float density;
	uniform float invGridSize;
	uniform sampler2D velocity;
	uniform sampler2D pressure;

	float p(vec2 coord) {
		return texture2D(pressure, fract(coord)).x;
	}

	void main() {
		vec2 u_a = texture2D(velocity, vUv).xy;

		float diff_p_x = (p(vUv + vec2(invGridSize, 0.0)) -
											p(vUv - vec2(invGridSize, 0.0)));
		float u_x = u_a.x - delta/(2.0 * density * invGridSize) * diff_p_x;

		float diff_p_y = (p(vUv + vec2(0.0, invGridSize)) -
											p(vUv - vec2(0.0, invGridSize)));
		float u_y = u_a.y - delta/(2.0 * density * invGridSize) * diff_p_y;

		gl_FragColor = vec4(u_x, u_y, 0.0, 0.0);
	}
	`
}
