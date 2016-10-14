/**
 * MyCircle
 * @constructor
 */
function MyCircle(scene, slices) {
    CGFobject.call(this, scene);

    this.slices = slices;

    this.initBuffers();
};

MyCircle.prototype = Object.create(CGFobject.prototype);
MyCircle.prototype.constructor = MyCircle;

MyCircle.prototype.initBuffers = function () {

    this.vertices = [];

    this.indices = [];

    this.normals = [];

    this.texCoords = [];

    var beta = 2 * Math.PI / this.slices;
    for (var i = 0, alfa = 0; i < this.slices; i++, alfa += beta) {
        this.vertices.push(0.5 * Math.cos(alfa), 0.5 * Math.sin(alfa), 0.0);
        this.normals.push(0, 0, 1);
        this.texCoords.push(Math.cos(alfa) * 0.5 + 0.5, Math.sin(-alfa) * 0.5 + 0.5);
    }

    this.vertices.push(0, 0, 0);
    this.normals.push(0, 0, 1);
    this.texCoords.push(0.5, 0.5);

    var originIndex = this.slices /* - 1 + 1 */;
    for (var i = 0; i < this.slices; i++)
        this.indices.push(originIndex, i, (i + 1) % this.slices);

    this.primitiveType = this.scene.gl.TRIANGLES;
    this.initGLBuffers();
};
