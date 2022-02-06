const gui = new dat.GUI();

const shaderParameters = {
  red: 1.0,
  green: 0.0,
  blue: 0.0,
  radius: 0.001
};

const cursorFolder = gui.addFolder('Cursor');

cursorFolder.add(shaderParameters, 'red').min(0).max(1).step(0.01).onChange((value) => {
  paintShader.uniforms.rgba.value.x = value;
});
cursorFolder.add(shaderParameters, 'green').min(0).max(1).step(0.01).onChange((value) => {
  paintShader.uniforms.rgba.value.y = value;
});
cursorFolder.add(shaderParameters, 'blue').min(0).max(1).step(0.01).onChange((value) => {
  paintShader.uniforms.rgba.value.z = value;
});
cursorFolder.add(shaderParameters, 'radius').min(0).max(0.01).step(0.001).onChange((value) => {
  paintShader.uniforms.radius.value = value;
});
