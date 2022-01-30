var RGBShader = {
	uniforms: {
		'tDiffuse': { value: null	},
		'red': { value: 0.0 },
		'green': { value: 0.0 },
		'blue': { value: 0.0 }
	},
	vertexShader:
/* glsl */
`

	varying vec2 vUv;

	void main() {

		vUv = uv;
		gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

	}`,
	fragmentShader:
/* glsl */
`

	uniform float red;
	uniform float green;
	uniform float blue;
	varying vec2 vUv;

	void main() {

		gl_FragColor = vec4(red, green, blue, 1.0);

	}`
};


var IntensityShader = {
	uniforms: {
		'tDiffuse': { value: null	},
		'intensity' : { value: 1.0 }
	},
	vertexShader:
/* glsl */
`

	varying vec2 vUv;

	void main() {

		vUv = uv;
		gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

	}`,
	fragmentShader:
/* glsl */
`

	uniform sampler2D tDiffuse;
	uniform float intensity;
	varying vec2 vUv;

	void main() {
		vec4 texel = texture2D(tDiffuse, vUv);
		gl_FragColor = texel * intensity;

	}`
};
