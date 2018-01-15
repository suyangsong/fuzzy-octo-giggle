"use strict";
var program;
var canvas;
var gl;
var vBuffer
var points = [];

var NumTimesToSubdivide = 0;

window.onload = function init() {
    canvas = document.getElementById("gl-canvas");
    gl = WebGLUtils.setupWebGL(canvas);
    gl = WebGLDebugUtils.makeDebugContext(gl);
    if (!gl) {
        alert("WebGL isn't available");
    }

    //  Configure WebGL
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    //Initialize the points for 3D Sierpenski
    setupVertices();

    //  Load shaders and initialize attribute buffers
    setupBufferShader();

    render();
}


function setupVertices() {
    // First, initialize the corners of our gasket with three points.

    var vertices = [
        vec2(-1, -1),
        vec2(0, 1),
        vec2(1, -1)
    ];

    divideTriangle(vertices[0], vertices[1], vertices[2],
        NumTimesToSubdivide);

}


function setupBufferShader() {
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // Create a buffer object, initialize it, and associate it with the
    //  associated attribute variable in our vertex shader

    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);

    //gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );
    //Note that we are using "size" instead of array buffer
    //void gl.bufferData(target, size, usage);
    gl.bufferData(gl.ARRAY_BUFFER, 50000, gl.STATIC_DRAW);

    //The WebGLRenderingContext.bufferSubData() method of the WebGL API updates a subset of a buffer object's data store.
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(points));

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    document.getElementById("slider").onchange = function (event) {
        NumTimesToSubdivide = parseInt(event.target.value);
        points = [];
        setupVertices();
        gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, flatten(points));
    };

}


function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, points.length);
    //requestAnimFrame shim enables the browser to determine the optimal FPS for our animation
    window.requestAnimFrame(render);

}


function triangle(a, b, c) {
    points.push(a, b, c);
}

function divideTriangle(a, b, c, count) {

    // check for end of recursion

    if (count === 0) {
        triangle(a, b, c);
    }
    else {

        //bisect the sides

        var ab = mix(a, b, 0.5);
        var ac = mix(a, c, 0.5);
        var bc = mix(b, c, 0.5);

        --count;

        // three new triangles

        divideTriangle(a, ab, ac, count);
        divideTriangle(c, ac, bc, count);
        divideTriangle(b, bc, ab, count);
    }
}
