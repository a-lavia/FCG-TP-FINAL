//Setup Renderer
const renderer = new THREE.WebGLRenderer({antialias: true});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

//TODO Debug: velocityFieldVisualizer = new VelocityFieldVisualizer();

velocity0 = getWebGLRenderTarget();
color0 = getWebGLRenderTarget();
color1 = getWebGLRenderTarget();

const initVelocityPass = new THREE.ShaderPass(InitVelocityFieldShader);
const paintShader = new THREE.ShaderPass(PaintShader);
const advectPass = new THREE.ShaderPass(AdvectionShader, 'inputTexture');
const copyPass = new THREE.ShaderPass(THREE.CopyShader);

function getWebGLRenderTarget() {
  const renderTargetParameters = {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    format: THREE.RGBAFormat
  };
  //TODO: Fixed size?
  const size = renderer.getSize(new THREE.Vector2());

  return new THREE.WebGLRenderTarget(size.width * renderer.getPixelRatio(), size.height * renderer.getPixelRatio(), renderTargetParameters);
}

function init() {
  initVelocityPass.render(renderer, velocity0, null);

  //TODO: Por algún motivo el setTexture imposibilita modificar la textura en el FBO
  //let texture = new THREE.TextureLoader().load('texture.jpg');
  //textureFBO.setTexture(texture);
}

function render() {
  requestAnimationFrame(render);

  //advectPass.uniforms.inputTexture.value = color0;
  advectPass.uniforms.velocity.value = velocity0;

  //Read color0 -> advect -> Write to color1
  advectPass.render(renderer, color1, color0);

  //Swap color0 <-> color1
  [color0, color1] = [color1, color0];

  //Copy color0 to screen
  copyPass.renderToScreen = true;
  copyPass.render(renderer, null, color0);

  //TODO Debug: velocityFieldVisualizer.render(renderer);
}

function resize() {
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function mouseDown(event) {
  event.preventDefault();

  switch (event.which) {
    case 1: //Left click
      paintShader.uniforms.center.value.x = event.clientX / window.innerWidth;
      paintShader.uniforms.center.value.y = 1. - event.clientY / window.innerHeight;
      paintShader.render(renderer, color1, color0);
      [color0, color1] = [color1, color0];
      break;

    case 3: //Right click
      break;
  }

}

window.addEventListener('resize', resize, false);
window.addEventListener('mousedown', mouseDown, false);

init();
render();
