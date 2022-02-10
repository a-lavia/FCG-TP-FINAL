const gui = new dat.GUI();

const parametersFolder = gui.addFolder('Parameters');

parametersFolder.add(parameters, 'gridSize', { '128': 128, '256': 256, '512': 512 }).name('size').onFinishChange(
  () => {
    initFramebuffers();
    resize();
  }
);

parametersFolder.add(parameters, 'stretch').onFinishChange(resize);
parametersFolder.add(parameters, 'velocityDissipation').min(0.1).max(10.).step(0.1);
parametersFolder.add(parameters, 'colorDissipation').min(0.1).max(10.).step(0.1);
