function load_texture(img_path) {
	var tex = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, tex);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
		  new Uint8Array([255, 0, 0, 255])); // red

	var img = new Image();
	img.onload = function() {
		gl.bindTexture(gl.TEXTURE_2D, tex);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	}
	img.src = img_path;
	return tex;
}

function resizeCanvas(in_gl) {
    var change = false;

    var canvas = in_gl.canvas;

    var canvasWidth = canvas.clientWidth;
    var canvasHeight = canvas.clientHeight;

    if ((canvasWidth != canvas.width) ||
        (canvasHeight != canvas.height)) {

        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        change = true;
    }

    if (change) {
        in_gl.viewport(0, 0, canvas.width, canvas.height);
    }
    var aspectRatio = canvas.width / canvas.height;
    return aspectRatio;
}