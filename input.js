var isDragging = false;
var cursorColor = new THREE.Vector3();

function mouseDown(event) {
  switch (event.which) {
    //Left click
    case 1:
    isDragging = true;
    cursorColor.random();
    break;
  }
}

function mouseUp(event) {
  isDragging = false;
}

function mouseMove(event) {
  if (isDragging) {
    let width = renderer.domElement.width;
    let height = renderer.domElement.height;

    console.log(width);

    let len = event.movementX * event.movementX + event.movementY * event.movementY;
    paintShader.uniforms.radius.value = len/500000. * parameters.gridSize / width;
    //Velocity field
    paintShader.uniforms.rgb.value.x = event.movementX / width * 10.;
    paintShader.uniforms.rgb.value.y = -event.movementY / height * 10.;
    paintShader.uniforms.rgb.value.z = 0.;
    paintShader.uniforms.center.value.x = event.x / width;
    paintShader.uniforms.center.value.y = 1. - event.y / height;

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
