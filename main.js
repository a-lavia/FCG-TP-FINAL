//Setup GUI
const gui = new dat.GUI();

const shaderParameters = {
  red: 0.0,
  green: 0.0,
  blue: 0.0,
  intensity: 1.0
};

const rgbShaderFolder = gui.addFolder('RGB Shader');

rgbShaderFolder.add(shaderParameters, 'red').min(0).max(1).step(0.01).onChange((value) => {
  rgbPass.uniforms['red'].value = value;
});
rgbShaderFolder.add(shaderParameters, 'green').min(0).max(1).step(0.01).onChange((value) => {
  rgbPass.uniforms['green'].value = value;
});
rgbShaderFolder.add(shaderParameters, 'blue').min(0).max(1).step(0.01).onChange((value) => {
  rgbPass.uniforms['blue'].value = value;
});

const intensityShaderFolder = gui.addFolder('Intensity Shader');
intensityShaderFolder.add(shaderParameters, 'intensity').min(0).max(1).step(0.01).onChange((value) => {
  intensityPass.uniforms['intensity'].value = value;
});

//Setup Renderer
const renderer = new THREE.WebGLRenderer({antialias: true});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const renderTargetParameters = {
  minFilter: THREE.LinearFilter,
  magFilter: THREE.LinearFilter,
  format: THREE.RGBAFormat
};

const size = renderer.getSize(new THREE.Vector2());

renderTarget1 = new THREE.WebGLRenderTarget(size.width * renderer.getPixelRatio(), size.height * renderer.getPixelRatio(), renderTargetParameters);
renderTarget2 = renderTarget1.clone();

const rgbPass = new THREE.ShaderPass(RGBShader);
const intensityPass = new THREE.ShaderPass(IntensityShader);
intensityPass.renderToScreen = true;

function render() {
  requestAnimationFrame(render);
  rgbPass.render(renderer, renderTarget1, renderTarget2);
  intensityPass.render(renderer, renderTarget2, renderTarget1);
}

function resize() {
  renderer.setSize(window.innerWidth, window.innerHeight);
  //TODO: Update renderTarget size
}

window.addEventListener('resize', resize, false);

render();
