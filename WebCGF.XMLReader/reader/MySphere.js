/**
 * MySphere
 * @constructor
 */
function MySphere(scene, radius, slices, stacks, lengthS, lengthT) {
    CGFobject.call(this, scene);

    this.radius = radius;
    this.slices = slices;
    this.stacks = stacks;
    this.lengthS = lengthS || 1;
    this.lengthT = lengthT || 1;

    this.initBuffers();
};

MySphere.prototype = Object.create(CGFobject.prototype);
MySphere.prototype.constructor = MySphere;

MySphere.prototype.initBuffers = function () {

    this.vertices = [];

    this.indices = [];

    this.normals = [];

    this.widthAngle = 2 * Math.PI / this.slices;     // xOy
    this.heightAngle = 2 * Math.PI / this.stacks;    // xOz

    for (var j = 0, beta = 0; j <= this.stacks; j++, beta += this.heightAngle) {  // beta = j * heightAngle --> xOz
        for (var i = 0, alfa = 0; i <= this.slices; i++, alfa += this.widthAngle) {  // alfa = i * widthAngle --> xOy
            var sin_beta_x_cos_alfa = Math.sin(beta) * Math.cos(alfa);
            var sin_beta_x_sin_alfa = Math.sin(beta) * Math.sin(alfa);
            var cos_beta = Math.cos(beta);
            this.vertices.push(this.radius * sin_beta_x_cos_alfa, this.radius * sin_beta_x_sin_alfa, this.radius * cos_beta);
            this.normals.push(sin_beta_x_cos_alfa, sin_beta_x_sin_alfa, cos_beta);
        }
    }

    this.setTextureCoordinates(this.lengthS, this.lengthT);

    for (var j = 0; j < this.stacks; j++) {
        for (var i = 0; i < this.slices; i++) {
            var a = j * this.slices + j + i;
            var b = (j + 1) * this.slices + j + 1 + i + 1;
            var c = (j + 1) * this.slices + j + 1 + i;
            var d = j * this.slices + j + i + 1;
            this.indices.push(a, b, c);
            this.indices.push(a, d, b);
        }
    }

    this.primitiveType = this.scene.gl.TRIANGLES;
    this.initGLBuffers();
};

MySphere.prototype.setTextureCoordinates = function (lengthS, lengthT) {
    this.lengthS = lengthS || 1;
    this.lengthT = lengthT || 1;

    this.texCoords = [];

    for (var j = 0, beta = 0; j <= this.stacks; j++, beta += this.heightAngle)
        for (var i = 0, alfa = 0; i <= this.slices; i++, alfa += this.widthAngle)
            this.texCoords.push(1 - (alfa / Math.PI + 0.5) / this.lengthS, 1 - (beta / Math.PI + 0.5) / this.lengthT);

    this.updateTexCoordsGLBuffers();
}
