//Parameters
const parameters = {
  gridSize: 512,
  jacobiIterations: 10,
  velocityDissipation: 1.0,
  colorDissipation: 1.0,
  stretch: true
};

//Setup Renderer
const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setPixelRatio(window.devicePixelRatio);
resize();
document.body.appendChild(renderer.domElement);

//Frame buffers
var velocity0;
var velocity1;
var color0;
var color1;
var divergence0;
var pressure0;
var pressure1;

//Shader passes
const paintShader = new THREE.ShaderPass(PaintShader);
const advectPass = new THREE.ShaderPass(AdvectShader, 'advectedField');
const divergencePass = new THREE.ShaderPass(DivergenceShader, 'velocityField');
const pressureJacobiPass = new THREE.ShaderPass(PressureJacobiShader, 'pressureField');
const substractPressurePass = new THREE.ShaderPass(SubstractPressureGradient, 'velocityField');
const copyPass = new THREE.ShaderPass(THREE.CopyShader);

initFramebuffers();

function initFramebuffers() {
  velocity0 = getWebGLRenderTarget();
  velocity1 = getWebGLRenderTarget();
  color0 = getWebGLRenderTarget();
  color1 = getWebGLRenderTarget();
  divergence0 = getWebGLRenderTarget();
  pressure0 = getWebGLRenderTarget();
  pressure1 = getWebGLRenderTarget();

  divergencePass.uniforms.texelSize.value = 1. / parameters.gridSize;
  pressureJacobiPass.uniforms.texelSize.value = 1. / parameters.gridSize;
  substractPressurePass.uniforms.texelSize.value = 1. / parameters.gridSize;
}

function getWebGLRenderTarget() {
  const renderTargetParameters = {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    format: THREE.RGBAFormat,
    type: THREE.FloatType
  };

  return new THREE.WebGLRenderTarget(parameters.gridSize, parameters.gridSize, renderTargetParameters);
}

function render() {
  requestAnimationFrame(render);

  //Advect velocity
  advectPass.uniforms.velocityField.value = velocity0.texture;
  advectPass.uniforms.dissipation.value = parameters.velocityDissipation;
  advectPass.render(renderer, velocity1, velocity0); //Read velocity0 -> Advect -> write to velocity1
  [velocity0, velocity1] = [velocity1, velocity0]; //Swap velocity0 <-> velocity1

  //Calc divergence
  divergencePass.render(renderer, divergence0, velocity0); //Read velocity0 -> Divergence -> write to divergence0

  //Jacobi Pressure
  pressureJacobiPass.uniforms.divergenceField.value = divergence0.texture;
  for (var i = 0; i < parameters.jacobiIterations; i++) {
    pressureJacobiPass.render(renderer, pressure1, pressure0); //Read pressure0 -> Jacobi Iteration -> write to pressure1
    [pressure0, pressure1] = [pressure1, pressure0]; //Swap pressure0 <-> pressure1
  }

  //Substract gradient
  substractPressurePass.uniforms.pressureField.value = pressure0.texture;
  substractPressurePass.render(renderer, velocity1, velocity0); //Read velocity0 -> Substract pass -> write to velocity1
  [velocity0, velocity1] = [velocity1, velocity0]; //Swap velocity0 <-> velocity1

  //Advect color
  advectPass.uniforms.velocityField.value = velocity0.texture;
  advectPass.uniforms.dissipation.value = parameters.colorDissipation;
  advectPass.render(renderer, color1, color0); //Read color0 -> Advect -> write to color1
  [color0, color1] = [color1, color0]; //Swap color0 <-> color1

  //Copy color0 to screen
  copyPass.renderToScreen = true;
  copyPass.render(renderer, null, color0);

}

function resize() {
  if (parameters.stretch) {
    var size = Math.min(window.innerWidth, window.innerHeight);
    renderer.setSize(size, size);
  } else {
    renderer.setSize(parameters.gridSize, parameters.gridSize);
  }
}

window.addEventListener('resize', resize, false);

render();
