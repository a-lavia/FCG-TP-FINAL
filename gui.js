const gui = new dat.GUI();

const parametersFolder = gui.addFolder('Parameters');

parametersFolder.add(parameters, 'velocityDissipation').min(0.1).max(10.).step(0.1);
parametersFolder.add(parameters, 'colorDissipation').min(0.1).max(10.).step(0.1);
