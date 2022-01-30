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
