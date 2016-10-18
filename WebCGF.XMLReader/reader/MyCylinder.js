/**
 * MyCylinder
 * @constructor
 */
function MyCylinder(scene, slices, stacks) {
    CGFobject.call(this, scene);

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
    var incS = 1 / this.slices;
    var incT = 1 / this.stacks;
    for (var j = 0, t = 0; j <= this.stacks; j++, t += incT)  // attention to the equal
        for (var i = 0, alfa = 0, s = 0; i <= this.slices; i++, alfa += beta, s += incS) {  // attention to the equal
            this.vertices.push(0.5 * Math.cos(alfa), 0.5 * Math.sin(alfa), 1 - j / this.stacks);
            this.normals.push(Math.cos(alfa), Math.sin(alfa), 0);
            this.texCoords.push(s, t);
        }

    for (var j = 0; j < this.stacks; j++) {
        for (var i = 0; i < this.slices; i++) {
            this.indices.push((j + 1) * this.slices + j + 1 + i + 1, j * this.slices + j + 1 + i, j * this.slices + j + i);
            this.indices.push(j * this.slices + j + i, (j + 1) * this.slices + j + 1 + i, (j + 1) * this.slices + j + 1 + i + 1);
        }
    }

    this.primitiveType = this.scene.gl.TRIANGLES;
    this.initGLBuffers();
};
