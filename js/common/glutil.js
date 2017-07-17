{
    'use strict';

    /** 
     * WebGL ユーティリティ
     * @constructor 
     */
    let GLUtil = function() {
        this.canvas = null;
        this.gl = null;
    };
 
    /** 
     * 初期化
     * @param {string} canvasId キャンバス要素のId
     * @param {number} width キャンバスの幅
     * @param {number} height キャンバスの高さ
     * @return {boolean} 初期化に成功すれば true
     */
    GLUtil.prototype.initalize = function(canvasId, width, height) {
        this.canvas = document.getElementById(canvasId);
        this.canvas.width = width;
        this.canvas.height = height;
        
        this.gl = this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl');
        if (this.gl === null || typeof this.gl === 'undefined') {
            console.log('WebGL not supported.');
            return false;
        }
        return true;
    };

    /**
     * キャンバスサイズのフレームバッファを作成する
     * @return {object} フレームバッファ他オブジェクト
     */
    GLUtil.prototype.createFrameBuffer = function(width, height){
        let gl = this.gl;
        let frameBuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
        let depthRenderBuffer = gl.createRenderbuffer();
        gl.bindRenderbuffer(gl.RENDERBUFFER, depthRenderBuffer);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, this.canvas.width, this.canvas.height);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthRenderBuffer);
        let fTexture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, fTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.canvas.width, this.canvas.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, fTexture, 0);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.bindRenderbuffer(gl.RENDERBUFFER, null);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        return { frameBuffer: frameBuffer, depthRenderBuffer : depthRenderBuffer, texture : fTexture };
    };

    /** 
     * キャンバスをクリアする
     * @param {number} r クリアする色 R
     * @param {number} g クリアする色 G
     * @param {number} b クリアする色 B
     */
    GLUtil.prototype.clear = function(r, g, b) {
        this.gl.clearColor(r, g, b, 1.0);
        this.gl.clearDepth(1.0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    };

    /** 
     * シェーダーファイルをコンパイルする
     * @param {number} type 0:バーテックスシェーダー, 1:フラグメントシェーダー
     * @param {string} text コンパイルするシェーダー
     * @return {object} シェーダーオブジェクト
     */
    GLUtil.prototype.compileShader = function(type, text) {
        let shader = null;
        switch(type) {
            case 0: // 'x-shader/x-vertex'
                shader = this.gl.createShader(this.gl.VERTEX_SHADER);
                break;
            case 1: // 'x-shader/x-fragment'
                shader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
                break;
            default:
                return null;
        }
        this.gl.shaderSource(shader, text);
        this.gl.compileShader(shader);
        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            console.log('compile error.');
            return null;
        }
        return shader;
    };

    /** 
     * コンパイル済みシェーダーオブジェクトをリンクする
     * @param {object} vs バーテックスシェーダーオブジェクト
     * @param {object} fs フラグメントシェーダーオブジェクト
     * @return {object} プログラムオブジェクト
     */
    GLUtil.prototype.linkProgram = function(vs, fs) {
        let program = this.gl.createProgram();

        this.gl.attachShader(program, vs);
        this.gl.attachShader(program, fs);
        this.gl.linkProgram(program);

        if(!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
            console.log('link error:' + this.gl.getProgramInfoLog(program));
            return null;
        }
        return program;
    };

    /** 
     * 頂点バッファオブジェクトを作成する
     * @param {Array.<number>} data 頂点バッファ配列
     * @return {object} 頂点バッファオブジェクト
     */
    GLUtil.prototype.createVBO = function(data) {
        let vbo = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vbo);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(data), this.gl.STATIC_DRAW);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
        return vbo;
    };

    /** 
     * インデックスバッファオブジェクトを作成する
     * @param {Array.<number>} data インデックスバッファ配列
     * @return {object} インデックスバッファオブジェクト
     */
    GLUtil.prototype.createIBO = function(data) {
        let ibo = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, ibo);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Int16Array(data), this.gl.STATIC_DRAW);
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, null);
        return ibo;
    };

    /** 
     * WebGL オブジェクトを取得する
     * @return {object} WebGL オブジェクト
     */
    GLUtil.prototype.getGL = function() {
        return this.gl;
    };

    /** 
     * キャンバス幅を取得する
     * @return {number} キャンバス幅
     */
    GLUtil.prototype.getCanvasWidth = function() {
        return this.canvas.width;
    };

    /** 
     * キャンバス高さを取得する
     * @return {number} キャンバス高さ
     */
    GLUtil.prototype.getCanvasHeight = function() {
        return this.canvas.height;
    };
    
    RayTracing.GLUtil = GLUtil;
}