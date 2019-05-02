/////////////////////
///   VARIABLES   ///
/////////////////////

// Global
var gl;
var canvas;
var program;

// Perspective parameters
var fov = 45.0
var nearPlane = 0.1;
var farPlane = 100;

// Definition of buffers and attributes
var positionBuffer, aPositionLoc;
var tangentBuffer, aTangentLoc;
var bitangentBuffer, aBitangentLoc;
var UVBuffer, aUVLoc;

// Index 
var index_buffer;
var num_indices;

// Textures
var tNormal;
var tDiffuse;

var name_normal;
var normal_normal;

///////////////////////
///  MAIN PROGRAM   ///
///////////////////////

window.onload = function () {
	// Traditional initialization, nothing new to see here...
	canvas = document.getElementById("gl_canvas");

    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert("WebGL isn't available"); }

    gl.clearColor(0.95, 0.95, 0.95, 1.0);

    gl.enable(gl.DEPTH_TEST);

	program = initShaders(gl, "vertex-shader", "fragment-shader");
	gl.useProgram(program);

	// Start linking the attribute locations and make all the buffers (32 bit floats)
	// For all the array definitions used here, see cube_data.js
	// Position
	aPositionLoc = gl.getAttribLocation(program, "aPosition");
	gl.enableVertexAttribArray(aPositionLoc);
	positionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(verticies), gl.STATIC_DRAW);
	// Tangent
	aTangentLoc = gl.getAttribLocation(program, "aTangent");
	gl.enableVertexAttribArray(aTangentLoc);
	tangentBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, tangentBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(tangents), gl.STATIC_DRAW);
	// Bitangent
	aBitangentLoc = gl.getAttribLocation(program, "aBitangent");
	gl.enableVertexAttribArray(aBitangentLoc);
	bitangentBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, bitangentBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(bitangents), gl.STATIC_DRAW);
	// UV
	aUVLoc = gl.getAttribLocation(program, "aUV");
	gl.enableVertexAttribArray(aUVLoc);
	UVBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, UVBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(uvs), gl.STATIC_DRAW);
	// Index
	// Note we use a 16 bit integer array because we don't need floats for an array of index
	// values for an array
	index_buffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_buffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

	num_indices = indices.length;

	// Load the textures using the load texture method in utils.js and store them to a variable.
	// Normals 
	name_normal = load_texture("HippoNormalNames.png", tNormal);
	normal_normal = load_texture("HippoNormalNoNames.png", tNormal)
	// Diffuse Texture
	tDiffuse = load_texture("Hippo.png", tDiffuse);

	// Start the render
	render(window.performance.now());
}
///////////////////////////
///   RENDER FUNCTION   ///
///////////////////////////

var render = function (currentTime) {
	// Scale the time to how we want it
	var time = currentTime*2.5;

	var aspectRatio = resizeCanvas(gl);

	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	// Create matricies for perspective and rotation 
	var projectionMatrix = perspective(fov, aspectRatio, nearPlane, farPlane);
	var translationMatrix = translate(0,0,-5.5);  // Push the cube back
	var rotateMatrix = rotateX(30);               // Rotate down
	var rotationMatrix = rotateY(time * 0.0075);  // Animated rotation

	// Multiply them altogether to get the model
	var model = mult(mult(translationMatrix, rotateMatrix), rotationMatrix);

	// Set the matrices 
	var modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
	gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(model));

	var normalMatrixLoc = gl.getUniformLocation(program, "normalMatrix");
	gl.uniformMatrix4fv(normalMatrixLoc, false, flatten(transpose(inverse4(model))));

	var projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");
	gl.uniformMatrix4fv(
		projectionMatrixLoc, false, flatten(mult(projectionMatrix, model))
	);
	
	// If we have the "Show names" checkbox checked, then change the normal used
	if(document.getElementById('showNames').checked){
		tNormal = name_normal;
	} else {
		tNormal = normal_normal;
	}
	var showBump = document.getElementById('showBump').checked;
	var showBumpLoc = gl.getUniformLocation(program, "showBump");
	gl.uniform1i(showBumpLoc, showBump);

	var showTexture = document.getElementById('showTexture').checked;
	var showTextureLoc = gl.getUniformLocation(program, "showTexture");
	gl.uniform1i(showTextureLoc, showTexture);

	// Load and link the textures and their attribute locations
	// Normals
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, tNormal);
	var tNormalLoc = gl.getUniformLocation(program, "tNormal");
	gl.uniform1i(tNormalLoc, 0);
	// Diffuse
	gl.activeTexture(gl.TEXTURE1);
	gl.bindTexture(gl.TEXTURE_2D, tDiffuse);
	var tDiffuselLoc = gl.getUniformLocation(program, "tDiffuse");
	gl.uniform1i(tDiffuselLoc, 1);

	// Bind buffers and start to pass data for each render pass
	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
	gl.vertexAttribPointer(aPositionLoc, 3, gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, tangentBuffer);
	gl.vertexAttribPointer(aTangentLoc, 3, gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, bitangentBuffer);
	gl.vertexAttribPointer(aBitangentLoc, 3, gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ARRAY_BUFFER, UVBuffer);
	gl.vertexAttribPointer(aUVLoc, 2, gl.FLOAT, false, 0, 0);

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_buffer);

	// Draw our triangles
	gl.drawElements(gl.TRIANGLES, num_indices, gl.UNSIGNED_SHORT, 0);

	// Animate
	requestAnimFrame(render);
}