//Setup Renderer

const parameters = {
  gridSize: 512,
  jacobiIterations: 10,
  velocityDissipation: 1.0,
  colorDissipation: 1.0
};

const renderer = new THREE.WebGLRenderer({antialias: true});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(parameters.gridSize, parameters.gridSize);
document.body.appendChild(renderer.domElement);

var velocity0 = getWebGLRenderTarget();
var velocity1 = getWebGLRenderTarget();

var color0 = getWebGLRenderTarget();
var color1 = getWebGLRenderTarget();

var divergence0 = getWebGLRenderTarget();

var pressure0 = getWebGLRenderTarget();
var pressure1 = getWebGLRenderTarget();

const paintShader = new THREE.ShaderPass(PaintShader);
const advectPass = new THREE.ShaderPass(AdvectShader, 'advectedField');
const divergencePass = new THREE.ShaderPass(DivergenceShader, 'velocityField');
const pressureJacobiPass = new THREE.ShaderPass(PressureJacobiShader, 'pressureField');
const substractPressurePass = new THREE.ShaderPass(SubstractPressureGradient, 'velocityField');
const copyPass = new THREE.ShaderPass(THREE.CopyShader);

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

var isDragging = false;
var cursorColor = new THREE.Vector3();

function mouseDown(event) {
  switch (event.which) {
    //Left click
    case 1:
    isDragging = true;
    cursorColor.random();
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
    let len = event.movementX * event.movementX + event.movementY * event.movementY;
    paintShader.uniforms.radius.value = len/100000.;
    //Velocity field
    paintShader.uniforms.rgb.value.x = event.movementX / parameters.gridSize * 10.;
    paintShader.uniforms.rgb.value.y = -event.movementY / parameters.gridSize * 10.;
    paintShader.uniforms.rgb.value.z = 0.;
    paintShader.uniforms.center.value.x = event.x / parameters.gridSize;
    paintShader.uniforms.center.value.y = 1. - event.y / parameters.gridSize;

    paintShader.render(renderer, velocity1, velocity0);
    [velocity0, velocity1] = [velocity1, velocity0];

    //Color field
    paintShader.uniforms.rgb.value.set(cursorColor.x, cursorColor.y, cursorColor.z);
    paintShader.render(renderer, color1, color0);
    [color0, color1] = [color1, color0];
  }
}

window.addEventListener('mousedown', mouseDown, false);
window.addEventListener('mouseup', mouseUp, false);
window.addEventListener('mousemove', mouseMove, false);

render();
