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
    var factor = (this.top - this.base) / 2.0 /* <- radius difference */ / this.stacks;
    var incS = 1 / this.slices;
    var incT = 1 / this.stacks;
    for (var j = 0, radius = this.base / 2.0, t = 0; j <= this.stacks; j++, radius += factor, t += incT)  // attention to the equal
        for (var i = 0, alfa = 0, s = 0; i <= this.slices; i++, alfa += beta, s += incS) {  // attention to the equal
            this.vertices.push(radius * Math.cos(alfa), radius * Math.sin(alfa), this.height * j / this.stacks);
            this.normals.push(Math.cos(alfa), Math.sin(alfa), 0);
            this.texCoords.push(s, t);
        }

    for (var j = 0; j < this.stacks; j++) {
        for (var i = 0; i < this.slices; i++) {
            this.indices.push(j * this.slices + j + i, j * this.slices + j + 1 + i, (j + 1) * this.slices + j + 1 + i + 1);
            this.indices.push((j + 1) * this.slices + j + 1 + i + 1, (j + 1) * this.slices + j + 1 + i, j * this.slices + j + i);
        }
    }

    this.primitiveType = this.scene.gl.TRIANGLES;
    this.initGLBuffers();
};
