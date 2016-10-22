/**
 * MySphere
 * @constructor
 */
function MySphere(scene, radius, slices, stacks, minS, maxS, minT, maxT) {
    CGFobject.call(this, scene);

    this.radius = radius;
    this.slices = slices;
    this.stacks = stacks;
    this.minS = minS || 0;
    this.maxS = maxS || 1;
    this.minT = minT || 0;
    this.maxT = maxT || 1;

    this.initBuffers();
};

MySphere.prototype = Object.create(CGFobject.prototype);
MySphere.prototype.constructor = MySphere;

MySphere.prototype.initBuffers = function () {

    this.vertices = [];

    this.indices = [];

    this.normals = [];

    var widthAngle = 2 * Math.PI / this.slices;     // xOy
    var heightAngle = Math.PI / this.stacks;    // xOz

    for (var j = 0, beta = 0; j <= this.stacks; j++, beta += heightAngle) {  // beta = j * heightAngle --> xOz
        for (var i = 0, alfa = 0; i <= this.slices; i++, alfa += widthAngle) {  // alfa = i * widthAngle --> xOy
            this.vertices.push(this.radius * Math.sin(beta) * Math.cos(alfa), this.radius * Math.sin(beta) * Math.sin(alfa), this.radius * Math.cos(beta));
            this.normals.push(Math.sin(beta) * Math.cos(alfa), Math.sin(beta) * Math.sin(alfa), Math.cos(beta));
        }
    }

    this.setTextureCoordinates(this.minS, this.maxS, this.minT, this.maxT);

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

MySphere.prototype.setTextureCoordinates = function (minS, maxS, minT, maxT) {
    this.minS = minS || 0;
    this.maxS = maxS || 1;
    this.minT = minT || 0;
    this.maxT = maxT || 1;

    this.texCoords = [];

    var decS = (this.maxS - this.minS) / this.slices;
    var decT = (this.maxT - this.minT) / this.stacks;

    for (var j = 0, t = this.maxT; j <= this.stacks; j++, t -= decT)
        for (var i = 0, s = this.maxS; i <= this.slices; i++, s -= decS)
            this.texCoords.push(s, t);

    this.updateTexCoordsGLBuffers();
}
