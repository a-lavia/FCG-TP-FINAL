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
