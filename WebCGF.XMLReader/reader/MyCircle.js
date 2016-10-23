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

    this.beta = 2 * Math.PI / this.slices;
    for (var i = 0, alfa = 0; i < this.slices; i++, alfa += this.beta) {
        var half_cos = 0.5 * Math.cos(alfa);
        var half_sin = 0.5 * Math.sin(alfa);
        this.vertices.push(half_cos, half_sin, 0.0);
        this.normals.push(0, 0, 1);
        this.texCoords.push(half_cos + 0.5, -half_sin + 0.5);   // -half_sin = 0.5 * Math.sin(-alfa)
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

MyCircle.prototype.setTextureCoordinates = function (lengthS, lengthT) { }
