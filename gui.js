const gui = new dat.GUI();

const advectParameter = {
  dissipation: 1.0
};

const advectFolder = gui.addFolder('Advect');

advectFolder.add(advectParameter, 'dissipation').min(0.).max(4.).step(0.01).onChange((value) => {
  advectPass.uniforms.dissipation.value = value;
});
