var RayTracing = {};
{
    'use strict';

    RayTracing.Common = {};
    
    /**
     * 現在のシェーダー記述方法に合わせて
     * 先頭の半角スペースとタブを（半ば決め打ちで）カット
     *
     */
    let CreateShaderText = function(shaderElementId) {
        let shaderElement = document.getElementById(shaderElementId);
        let allCode = shaderElement.innerHTML;
        let allCodeArray = allCode.split(/\r\n|\r|\n/);
        // 現在のシェーダー記述方法に合わせて
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

    /**
     * 共通部分を初期化する。
     *
     */
    RayTracing.Common.initialize = function() {
        let aceUtil = new RayTracing.AceUtil();
        let text = CreateShaderText('fs');
        aceUtil.presetEditorText('editor', text);
        aceUtil.create('editor');
        Run();
    };

    // 下記に相当するシェーダーソースコードは埋め込む
    // テクスチャを画面全体に配置する
    //<script id="common-vs" type="x-shader/x-vertex">
    //    attribute vec3 position;
    //    varying   vec2 vTexCoord;
    //
    //    void main() {
    //        vTexCoord   = (position + 1.0).xy / 2.0;
    //        gl_Position = vec4(position, 1.0);
    //    }
    //</script>
    //<script id="common-fs" type="x-shader/x-fragment">
    //    precision mediump float;
    //
    //    uniform sampler2D texture;
    //    varying vec2      vTexCoord;
    //
    //    void main() {
    //        gl_FragColor = texture2D(texture, vTexCoord);
    //    }
    //</script>
    // 頂点を割り当てるのみ
    // フラグメントシェーダー側は html 側に記述される
    //<script id="vs" type="x-shader/x-vertex">
    //    attribute vec3 position;
    //
    //    void main() {
    //        gl_Position = vec4(position, 1.0);
    //    }
    //</script>
    
    /**
     * 共通部分の動作を開始する。
     *
     */
    var Run = function() {
        let glutil = new RayTracing.GLUtil();
        glutil.initalize('canvas', 512, 512);
        
        let mousePosition = [0, 0];
        let canvas = glutil.getCanvas();
        canvas.addEventListener('mousemove', 
            function(eve) {
                let i = 1 / canvas.width;
                mousePosition = [
                    (eve.clientX - canvas.offsetLeft) * i * 2.0 - 1.0,
                    1.0 - (eve.clientY - canvas.offsetTop) * i * 2.0
                ];
            }, true);

        let commonVSSource = 'attribute vec3 position; varying vec2 vTexCoord; void main() {vTexCoord = (position + 1.0).xy / 2.0; gl_Position = vec4(position, 1.0); }';
        let commonFSSource = 'precision mediump float; uniform sampler2D texture; varying vec2 vTexCoord; void main() { gl_FragColor = texture2D(texture, vTexCoord); }';
        let commonVS = glutil.compileShader(0, commonVSSource);
        let commonFS = glutil.compileShader(1, commonFSSource);
        let commonProgram = glutil.linkProgram(commonVS, commonFS);

        let gl = glutil.getGL();
        let uniformsCommon = {};
        uniformsCommon.texture = gl.getUniformLocation(commonProgram, 'texture');
        uniformsCommon.position = gl.getAttribLocation(commonProgram, 'position');

        let vsSource = 'attribute vec3 position; void main() { gl_Position = vec4(position, 1.0); }'
        let vs = glutil.compileShader(0, vsSource);
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
        gl.viewport(0, 0, canvas.width, canvas.height);
        let nowTime = new Date().getTime();
        (function() {
            let time = (new Date().getTime() - nowTime) * 0.001;
            gl.useProgram(program);
            gl.bindFramebuffer(gl.FRAMEBUFFER, frontBuffer.frameBuffer);
            gl.bindTexture(gl.TEXTURE_2D, backBuffer.texture);
            gl.enableVertexAttribArray(uniforms.position);
            gl.vertexAttribPointer(uniforms.position, 3, gl.FLOAT, false, 0, 0);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            gl.uniform2fv(uniforms.mouse, mousePosition);
            gl.uniform1f(uniforms.time, time);
            gl.uniform2fv(uniforms.resolution, [canvas.width, canvas.height]);
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