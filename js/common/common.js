var RayTracing = {};
{
    'use strict';

    RayTracing.Common = {};
    let CreateShaderText = function(shaderElementId) {
        let shaderElement = document.getElementById(shaderElementId);
        let allCode = shaderElement.innerHTML;
        let allCodeArray = allCode.split(/\r\n|\r|\n/);
        // 現在のシェーダー記述方法にに合わせて
        // 先頭の半角スペースとタブを（半ば決め打ちで）カットする
        let editorText = '';
        for (let i = allCodeArray[0].length === 0 ? 1 : 0; i < allCodeArray.length - 1; ++i) {
            let temp = allCodeArray[i];
            let spaceSize = 4;
            if (temp[0] === ' ')
                temp = temp.substring(spaceSize * 2, temp.lenght)
            else if (temp[0] === '	')
                temp = temp.substring(1 * 2, temp.lenght)
            editorText += temp + '\r\n';
        }
        return editorText;
    };

    RayTracing.Common.initialize = function() {
        let aceUtil = new RayTracing.AceUtil();
        let text = CreateShaderText('fs');
        aceUtil.presetEditorText('editor', text);
        aceUtil.create('editor');
        Run();
    };

    var Run = function() {
        let glutil = new RayTracing.GLUtil();
        glutil.initalize('canvas', 512, 512);

        let commonVS = glutil.compileShader(0, document.getElementById('common-vs').text);
        let commonFS = glutil.compileShader(1, document.getElementById('common-fs').text);
        let commonProgram = glutil.linkProgram(commonVS, commonFS);

        let gl = glutil.getGL();
        let uniformsCommon = {};
        uniformsCommon.texture = gl.getUniformLocation(commonProgram, 'texture');
        uniformsCommon.position = gl.getAttribLocation(commonProgram, 'position');

        let vs = glutil.compileShader(0, document.getElementById('vs').text)
        let fs = glutil.compileShader(1, document.getElementById('fs').text);
        let program = glutil.linkProgram(vs, fs);
        let uniforms = {};
        uniforms.mouse = gl.getUniformLocation(program, 'mouse');
        uniforms.time = gl.getUniformLocation(program, 'time');
        uniforms.resolution = gl.getUniformLocation(program, 'resolution');
        uniforms.sampler = gl.getUniformLocation(program, 'sampler');
        uniforms.position = gl.getAttribLocation(program, 'position');
        
        let frontBuffer = glutil.createFrameBuffer();
        let backBuffer = glutil.createFrameBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,1,0,-1,-1,0,1,1,0,1,-1,0]), gl.STATIC_DRAW);
        
        gl.activeTexture(gl.TEXTURE0);
        gl.clearColor(0, 0, 0, 1);
        gl.viewport(0, 0, glutil.getCanvasWidth(), glutil.getCanvasHeight());
        let nowTime = new Date().getTime();
        (function() {
            let time = (new Date().getTime() - nowTime) * 0.001;
            gl.useProgram(program);
            gl.bindFramebuffer(gl.FRAMEBUFFER, frontBuffer.frameBuffer);
            gl.bindTexture(gl.TEXTURE_2D, backBuffer.texture);
            gl.enableVertexAttribArray(uniforms.position);
            gl.vertexAttribPointer(uniforms.position, 3, gl.FLOAT, false, 0, 0);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            //gl.uniform2fv(uniforms.mouse, mousePosition);
            gl.uniform1f(uniforms.time, time);
            gl.uniform2fv(uniforms.resolution, [glutil.getCanvasWidth(), glutil.getCanvasHeight()]);
            gl.uniform1i(uniforms.sampler, 0);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
            
            gl.useProgram(commonProgram);
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            gl.bindTexture(gl.TEXTURE_2D, frontBuffer.texture);
            gl.enableVertexAttribArray(uniformsCommon.position);
            gl.vertexAttribPointer(uniformsCommon.position, 3, gl.FLOAT, false, 0, 0);
            gl.uniform1i(uniformsCommon.texture, 0);
            
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
            gl.flush();
            let tempBuffer = frontBuffer;
            frontBuffer = backBuffer;
            backBuffer = tempBuffer;
            requestAnimationFrame(arguments.callee);
        })();
    };
}