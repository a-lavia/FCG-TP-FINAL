var defaultVertexShader =
`
	varying vec2 vUv;

	void main() {

		vUv = uv;
		gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);

	}
`

var PaintShader = {
	uniforms: {
		'rgb': { value: new THREE.Vector3(1., 0., 0.) },
		'center': { value: new THREE.Vector2() },
		'radius': { value: 0.001 },
		'tDiffuse': { value: null }
	},
	vertexShader: defaultVertexShader,
	fragmentShader:
	`
	precision mediump float;
	precision mediump sampler2D;

	varying vec2 vUv;

	uniform vec3 rgb;
	uniform vec2 center;
	uniform float radius;
	uniform sampler2D tDiffuse;

	void main() {
		float dx = center.x - vUv.x;
		float dy = center.y - vUv.y;
		gl_FragColor = texture2D(tDiffuse, vUv) + vec4(rgb, 1.) * exp(-(dx * dx + dy * dy) / radius);
	}
	`
};

var AdvectShader = {
	uniforms: {
		'delta': { value: 0.016 },
		'dissipation': { value: 1. },
		'texelSize': { value: 1./512. },
		'advectedField': { value: null },
		'velocityField': { value: null }
	},
	vertexShader: defaultVertexShader,
	fragmentShader:
	`
	precision mediump float;
	precision mediump sampler2D;

	varying vec2 vUv;

	uniform float delta;
	uniform float dissipation;
	uniform float texelSize;
	uniform sampler2D advectedField;
	uniform sampler2D velocityField;

	vec4 bilerp (sampler2D sam, vec2 uv) {
			vec2 st = uv / texelSize - 0.5;
			vec2 iuv = floor(st);
			vec2 fuv = fract(st);
			vec4 a = texture2D(sam, (iuv + vec2(0.5, 0.5)) * texelSize);
			vec4 b = texture2D(sam, (iuv + vec2(1.5, 0.5)) * texelSize);
			vec4 c = texture2D(sam, (iuv + vec2(0.5, 1.5)) * texelSize);
			vec4 d = texture2D(sam, (iuv + vec2(1.5, 1.5)) * texelSize);
			return mix(mix(a, b, fuv.x), mix(c, d, fuv.x), fuv.y);
	}

	void main() {
	  vec2 pastCoord = vUv - texture2D(velocityField, vUv).xy * delta;
		float decay = 1. + dissipation * delta;
	  //gl_FragColor = texture2D(advectedField, pastCoord) / decay;
		gl_FragColor = bilerp(advectedField, pastCoord) / decay;
	}
	`
}

var DivergenceShader = {
	uniforms: {
		'delta': { value: 0.016 },
		'density': { value: 1. },
		'texelSize': { value: 1./512. },
		'velocityField': { value: null }
	},
	vertexShader: defaultVertexShader,
	fragmentShader:
	`
	precision mediump float;
	precision mediump sampler2D;

	varying vec2 vUv;

	uniform float delta;
	uniform float density;
	uniform float texelSize;
	uniform sampler2D velocityField;

	void main() {
		float R = texture2D(velocityField, vUv + vec2(texelSize, 0.)).x;
		float L = texture2D(velocityField, vUv - vec2(texelSize, 0.)).x;
		float T = texture2D(velocityField, vUv + vec2(0., texelSize)).y;
		float B = texture2D(velocityField, vUv - vec2(0., texelSize)).y;

		float div = (-2. * texelSize * density / delta) * ((R - L) + (T - B));
		gl_FragColor = vec4(div, 0., 0., 1.);
	}
	`
}

var PressureJacobiShader = {
	uniforms: {
		'texelSize': { value: 1./512. },
		'divergenceField': { value: null },
		'pressureField': { value: null }
	},
	vertexShader: defaultVertexShader,
	fragmentShader:
	`
	precision mediump float;
	precision mediump sampler2D;

	varying vec2 vUv;

	uniform float texelSize;
	uniform sampler2D divergenceField;
	uniform sampler2D pressureField;

	void main () {
		float R = texture2D(pressureField, vUv + vec2(texelSize*2., 0.)).x;
		float L = texture2D(pressureField, vUv - vec2(texelSize*2., 0.)).x;
		float T = texture2D(pressureField, vUv + vec2(0., texelSize*2.)).x;
		float B = texture2D(pressureField, vUv - vec2(0., texelSize*2.)).x;

		float d = texture2D(divergenceField, vUv).x;

		gl_FragColor = vec4(0.25 * (d + L + R + B + T), 0., 0., 1.);
	}
	`
}

var SubstractPressureGradient = {
	uniforms: {
		'delta': { value: 0.016 },
		'density': { value: 1. },
		'texelSize': { value: 1./512. },
		'velocityField': { value: null },
		'pressureField': { value: null }
	},
	vertexShader: defaultVertexShader,
	fragmentShader:
	`
	precision mediump float;
	precision mediump sampler2D;

	varying vec2 vUv;

	uniform float delta;
	uniform float density;
	uniform float texelSize;
	uniform sampler2D velocityField;
	uniform sampler2D pressureField;

	void main() {
		float R = texture2D(pressureField, vUv + vec2(texelSize, 0.)).x;
		float L = texture2D(pressureField, vUv - vec2(texelSize, 0.)).x;
		float T = texture2D(pressureField, vUv + vec2(0., texelSize)).x;
		float B = texture2D(pressureField, vUv - vec2(0., texelSize)).x;

	  vec2 vel = texture2D(velocityField, vUv).xy - delta / (2. * texelSize * density) * vec2(R - L, T - B);

		gl_FragColor = vec4(vel, 0., 1.);
	}
	`
}
