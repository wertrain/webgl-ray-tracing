{
    'use strict';
    
    let glutil = new RayTracing.GLUtil();
    glutil.initalize('canvas', 640, 480);

    let vs = glutil.compileShader(0, document.getElementById('vs').text);
    let fs = glutil.compileShader(1, document.getElementById('fs').text);
    let program = glutil.linkProgram(vs, fs);

    let gl = glutil.getGL();
    gl.useProgram(program);
    let vertexPosition = [
         0.0,  0.5, 0.0,
         0.5, -0.5, 0.0,
        -0.5, -0.5, 0.0
    ];
    let vbo = glutil.createVBO(vertexPosition);
    let positionLocation = gl.getAttribLocation(program, 'position');
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.flush();
}