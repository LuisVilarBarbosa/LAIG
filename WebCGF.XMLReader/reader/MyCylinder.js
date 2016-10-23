/**
 * MyCylinder
 * @constructor
 */
function MyCylinder(scene, base, top, height, slices, stacks, lengthS, lengthT) {
    CGFobject.call(this, scene);

    this.base = base;
    this.top = top;
    this.height = height;
    this.slices = slices;
    this.stacks = stacks;
    this.lengthS = lengthS || 1;
    this.lengthT = lengthT || 1;

    this.initBuffers();
};

MyCylinder.prototype = Object.create(CGFobject.prototype);
MyCylinder.prototype.constructor = MyCylinder;

MyCylinder.prototype.initBuffers = function () {

    this.vertices = [];

    this.indices = [];

    this.normals = [];

    var beta = 2 * Math.PI / this.slices;
    var incRadius = (this.top - this.base) /* <- rays difference */ / this.stacks;
    var incHeight = this.height / this.stacks;
    for (var j = 0, radius = this.base, height = 0; j <= this.stacks; j++, radius += incRadius, height += incHeight)
        for (var i = 0, alfa = 0; i <= this.slices; i++, alfa += beta) {
            var cos = Math.cos(alfa);
            var sin = Math.sin(alfa);
            this.vertices.push(radius * cos, radius * sin, height);
            this.normals.push(cos, sin, 0);
        }

    this.setTextureCoordinates(this.lengthS, this.lengthT);

    for (var j = 0; j < this.stacks; j++) {
        for (var i = 0; i < this.slices; i++) {
            var a = j * this.slices + j + i;
            var b = j * this.slices + j + 1 + i;
            var c = (j + 1) * this.slices + j + 1 + i + 1;
            var d = (j + 1) * this.slices + j + 1 + i;
            this.indices.push(a, b, c);
            this.indices.push(c, d, a);
        }
    }

    this.primitiveType = this.scene.gl.TRIANGLES;
    this.initGLBuffers();
};

MyCylinder.prototype.setTextureCoordinates = function (lengthS, lengthT) {
    this.lengthS = lengthS || 1;
    this.lengthT = lengthT || 1;

    this.texCoords = [];

    var decS = (1 / this.lengthS) / this.slices;
    var decT = (1 / this.lengthT) / this.stacks;

    for (var j = 0, t = this.lengthT; j <= this.stacks; j++, t -= decT)
        for (var i = 0, s = this.lengthS; i <= this.slices; i++, s -= decS)
            this.texCoords.push(s, t);

    this.updateTexCoordsGLBuffers();
}
