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
	precision mediump float;
	precision mediump sampler2D;

	#define PI 3.1415926538
	varying vec2 vUv;

	void main() {
		//gl_FragColor = vec4(sin(2.0 * PI * vUv.y + PI/2.), sin(2.0 * PI * vUv.x + PI/2.), 0.0, 1.0);
		gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
	}
	`
};

var PaintShader = {
	uniforms: {
		'tDiffuse': { value: null },
		'rgb': { value: new THREE.Vector3(1., 0., 0.) },
		'center': { value: new THREE.Vector2() },
		'radius': { value: .001 }
	},
	vertexShader: defaultVertexShader,
	fragmentShader:
	`
	precision mediump float;
	precision mediump sampler2D;

	uniform sampler2D tDiffuse;
	uniform vec3 rgb;
	uniform vec2 center;
	uniform float radius;

	varying vec2 vUv;

	void main() {
		float dx = center.x - vUv.x;
		float dy = center.y - vUv.y;
		gl_FragColor = texture2D(tDiffuse, vUv) + vec4(rgb, 1.) * exp(-(dx * dx + dy * dy) / radius);
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
	precision mediump float;
	precision mediump sampler2D;

	varying vec2 vUv;

	uniform float delta;
	uniform sampler2D inputTexture;
	uniform sampler2D velocity;

	void main() {
	  //vec2 pastCoord = fract(vUv - u * delta); //fract for repeat
	  vec2 pastCoord = vUv - texture2D(velocity, vUv).xy * delta;
		float decay = 1.0 + delta;
	  gl_FragColor = texture2D(inputTexture, pastCoord) / decay;
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
	precision mediump float;
	precision mediump sampler2D;

	varying vec2 vUv;

	uniform float delta;
	uniform float density;
	uniform float invGridSize;
	uniform sampler2D velocity;

	void main() {
		vec4 R = texture2D(velocity, vUv + vec2(invGridSize, 0));
		vec4 L = texture2D(velocity, vUv - vec2(invGridSize, 0));
		vec4 T = texture2D(velocity, vUv + vec2(0, invGridSize));
		vec4 B = texture2D(velocity, vUv - vec2(0, invGridSize));

		float div = (-2.0 * invGridSize * density / delta) * ((R.x - L.x) + (T.y - B.y));
		gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
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
	precision mediump float;
	precision mediump sampler2D;

	varying vec2 vUv;

	uniform float invGridSize;
	uniform sampler2D divergence;
	uniform sampler2D pressure;

	void main () {
		float R = texture2D(pressure, vUv + vec2(invGridSize*2.0, 0)).x;
		float L = texture2D(pressure, vUv - vec2(invGridSize*2.0, 0)).x;
		float T = texture2D(pressure, vUv + vec2(0, invGridSize*2.0)).x;
		float B = texture2D(pressure, vUv - vec2(0, invGridSize*2.0)).x;

		float d = texture2D(divergence, vUv).x;

		gl_FragColor = vec4(0.25 * (d + L + R + B + T), 0.0, 0.0, 1.0);
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
	precision mediump float;
	precision mediump sampler2D;

	varying vec2 vUv;
	uniform float delta;
	uniform float density;
	uniform float invGridSize;
	uniform sampler2D velocity;
	uniform sampler2D pressure;

	void main() {
		float R = texture2D(pressure, vUv + vec2(invGridSize, 0)).x;
		float L = texture2D(pressure, vUv - vec2(invGridSize, 0)).x;
		float T = texture2D(pressure, vUv + vec2(0, invGridSize)).x;
		float B = texture2D(pressure, vUv - vec2(0, invGridSize)).x;

	  vec2 vel = texture2D(velocity, vUv).xy - delta / (2.0 * invGridSize * density) * vec2(R - L, T - B);

		gl_FragColor = vec4(vel, 0.0, 1.0);
	}
	`
}
