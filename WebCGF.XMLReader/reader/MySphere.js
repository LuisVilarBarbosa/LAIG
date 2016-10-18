/**
 * MySphere
 * @constructor
 */
function MySphere(scene, radius, slices, stacks) {
    CGFobject.call(this, scene);

    this.radius = radius;
    this.slices = slices;
    this.stacks = stacks;

    this.initBuffers();
};

MySphere.prototype = Object.create(CGFobject.prototype);
MySphere.prototype.constructor = MySphere;

MySphere.prototype.initBuffers = function () {

    this.vertices = [];

    this.indices = [];

    this.normals = [];

    this.texCoords = [];

    var widthAngle = 2 * Math.PI / this.slices;     // xOy
    var heightAngle = Math.PI / this.stacks;    // xOz
    var incS = 1 / this.slices;
    var incT = 1 / this.stacks;

    // spherical surface
    for (var j = 0, beta = 0, t = 0; j <= this.stacks; j++, beta += heightAngle, t += incT) {  // beta = j * heightAngle --> xOz
        for (var i = 0, alfa = 0, s = 0; i <= this.slices; i++, alfa += widthAngle, s += incS) {  // alfa = i * widthAngle --> xOy
            this.vertices.push(this.radius * Math.sin(beta) * Math.cos(alfa), this.radius * Math.sin(beta) * Math.sin(alfa), this.radius * Math.cos(beta));
            this.normals.push(Math.sin(beta) * Math.cos(alfa), Math.sin(beta) * Math.sin(alfa), Math.cos(beta));
            this.texCoords.push(s, t);
        }
    }

    for (var j = 0; j <= this.stacks; j++) {
        for (var i = 0; i < this.slices; i++) {
            var a = j * this.slices + i;
            var b = (j + 1) * this.slices + i;
            var c = (j + 1) * this.slices + i + 1;
            var d = j * this.slices + i + 1;
            this.indices.push(a, b, c);
            this.indices.push(a, c, d);
        }
    }

    this.primitiveType = this.scene.gl.TRIANGLES;
    this.initGLBuffers();
};
