//Setup Renderer
var gridSize = 512;
var jacobiIterations = 10;

const renderer = new THREE.WebGLRenderer({antialias: true});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(gridSize, gridSize);
document.body.appendChild(renderer.domElement);

//TODO Debug: velocityFieldVisualizer = new VelocityFieldVisualizer();

var velocity0 = getWebGLRenderTarget();
var velocity1 = getWebGLRenderTarget();

var color0 = getWebGLRenderTarget();
var color1 = getWebGLRenderTarget();

var divergence = getWebGLRenderTarget();
var pressure0 = getWebGLRenderTarget();
var pressure1 = getWebGLRenderTarget();

const initVelocityPass = new THREE.ShaderPass(InitVelocityFieldShader);
const paintShader = new THREE.ShaderPass(PaintShader);
const advectPass = new THREE.ShaderPass(AdvectionShader, 'inputTexture');
const divergencePass = new THREE.ShaderPass(DivergenceShader, 'velocity');
const pressureJacobiPass = new THREE.ShaderPass(PressureJacobiShader, 'pressure');
const substractPressurePass = new THREE.ShaderPass(SubstractPressureGradient, 'velocity');
const copyPass = new THREE.ShaderPass(THREE.CopyShader);

function getWebGLRenderTarget() {
  const renderTargetParameters = {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    format: THREE.RGBAFormat
  };

  return new THREE.WebGLRenderTarget(gridSize, gridSize, renderTargetParameters);
}

function init() {
  initVelocityPass.render(renderer, velocity0, null);
}

function render() {
  requestAnimationFrame(render);

  //Advect velocity
  advectPass.uniforms.velocity.value = velocity0;
  advectPass.render(renderer, velocity1, velocity0); //Read velocity0 -> Advect -> write to velocity1
  [velocity0, velocity1] = [velocity1, velocity0]; //Swap velocity0<->velocity1

  //Divergence
  divergencePass.render(renderer, divergence, velocity0); //Read velocity0 -> Divergence -> write to divergence

  //Jacobi Pressure
  pressureJacobiPass.uniforms.divergence.value = divergence;
  for (var i = 0; i < jacobiIterations; i++) {
    pressureJacobiPass.render(renderer, pressure1, pressure0); //Read pressure0 -> Jacobi pass -> write to pressure1
    [pressure0, pressure1] = [pressure1, pressure0]; //Swap pressure0<->pressure1
  }

  //Substract
  substractPressurePass.uniforms.pressure.value = pressure0;
  substractPressurePass.render(renderer, velocity1, velocity0); //Read velocity0 -> Substract pass -> write to velocity1
  [velocity0, velocity1] = [velocity1, velocity0]; //Swap velocity0<->velocity1

  //Advect color
  advectPass.uniforms.velocity.value = velocity0;
  advectPass.render(renderer, color1, color0); //Read color0 -> Advect -> write to color1
  [color0, color1] = [color1, color0]; //Swap color0<->color1

  //Copy color0 to screen
  copyPass.renderToScreen = true;
  copyPass.render(renderer, null, color0);

  //TODO Debug: velocityFieldVisualizer.render(renderer);
}

var isDragging = false;

function mouseDown(event) {
  switch (event.which) {
    //Left click
    case 1:
    isDragging = true;
    break;
    //Right click
    case 3:
    break;
  }
}

function mouseUp(event) {
  isDragging = false;
}

function mouseMove(event) {
  if (isDragging) {
    paintShader.uniforms.center.value.x = event.clientX / gridSize;
    paintShader.uniforms.center.value.y = 1. - event.clientY / gridSize;
    paintShader.render(renderer, color1, color0);
    [color0, color1] = [color1, color0];
  }
}

window.addEventListener('mousedown', mouseDown, false);
window.addEventListener('mouseup', mouseUp, false);
window.addEventListener('mousemove', mouseMove, false);

init();
render();
