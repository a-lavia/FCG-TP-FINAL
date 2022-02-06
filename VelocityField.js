
//TODO: Finalizar visualizador de vectores del velocity field
class VelocityFieldVisualizer {

  shader = {
  	vertexShader:
    `
      attribute vec3 vertex;
    	void main() {
    		gl_Position = projectionMatrix * modelViewMatrix * vec4(vertex, 1.0);

    	}
    `,
  	fragmentShader:
    `
    	void main() {
    		gl_FragColor = vec4(0.0, 1.0, 1.0, 1.0);
    	}
    `
  };

  camera = new THREE.OrthographicCamera(0, 1, 1, 0, 0, 1);


  constructor() {
    let triangle = [
      [0, 0.2],
      [1, 0],
      [0, -0.2]
    ];

    let count = 10;

    let geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0, 1, 0, 0, 1, 1, 0], 3));
    geometry.setAttribute('vertex', new THREE.Float32BufferAttribute([0.2, 0, 0, 1, 0, 0, 1, 1, 0], 3));
    this.mesh = new THREE.Mesh(geometry, new THREE.ShaderMaterial(this.shader));
  }

  render(renderer) {
    renderer.render(this.mesh, this.camera);
  }

}
