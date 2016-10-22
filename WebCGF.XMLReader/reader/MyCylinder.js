/**
 * MyCylinder
 * @constructor
 */
function MyCylinder(scene, base, top, height, slices, stacks) {
    CGFobject.call(this, scene);

    this.base = base;
    this.top = top;
    this.height = height;
    this.slices = slices;
    this.stacks = stacks;

    this.initBuffers();
};

MyCylinder.prototype = Object.create(CGFobject.prototype);
MyCylinder.prototype.constructor = MyCylinder;

MyCylinder.prototype.initBuffers = function () {

    this.vertices = [];

    this.indices = [];

    this.normals = [];

    this.texCoords = [];

    var beta = 2 * Math.PI / this.slices;
    var incRadius = (this.top - this.base) /* <- rays difference */ / this.stacks;
    var incHeight = this.height / this.stacks;
    var decS = 1 / this.slices;
    var decT = 1 / this.stacks;
    for (var j = 0, radius = this.base, height = 0, t = 1; j <= this.stacks; j++, radius += incRadius, height += incHeight, t -= decT)
        for (var i = 0, alfa = 0, s = 1; i <= this.slices; i++, alfa += beta, s -= decS) {
            var cos = Math.cos(alfa);
            var sin = Math.sin(alfa);
            this.vertices.push(radius * cos, radius * sin, height);
            this.normals.push(cos, sin, 0);
            this.texCoords.push(s, t);
        }

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
