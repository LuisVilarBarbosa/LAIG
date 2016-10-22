/**
 * MyCircle
 * @constructor
 */
function MyCircle(scene, slices, minS, maxS, minT, maxT) {
    CGFobject.call(this, scene);

    this.slices = slices;
    this.minS = minS || 0;
    this.maxS = maxS || 1;
    this.minT = minT || 0;
    this.maxT = maxT || 1;

    this.initBuffers();
};

MyCircle.prototype = Object.create(CGFobject.prototype);
MyCircle.prototype.constructor = MyCircle;

MyCircle.prototype.initBuffers = function () {

    this.vertices = [];

    this.indices = [];

    this.normals = [];

    this.beta = 2 * Math.PI / this.slices;
    for (var i = 0, alfa = 0; i < this.slices; i++, alfa += this.beta) {
        this.vertices.push(0.5 * Math.cos(alfa), 0.5 * Math.sin(alfa), 0.0);
        this.normals.push(0, 0, 1);
    }

    this.vertices.push(0, 0, 0);
    this.normals.push(0, 0, 1);

    this.setTextureCoordinates(this.minS, this.maxS, this.minT, this.maxT);

    var originIndex = this.slices /* - 1 + 1 */;
    for (var i = 0; i < this.slices; i++)
        this.indices.push(originIndex, i, (i + 1) % this.slices);

    this.primitiveType = this.scene.gl.TRIANGLES;
    this.initGLBuffers();
};

MyCircle.prototype.setTextureCoordinates = function (minS, maxS, minT, maxT) {
    this.minS = minS || 0;
    this.maxS = maxS || 1;
    this.minT = minT || 0;
    this.maxT = maxT || 1;

    this.texCoords = [];

    for (var i = 0, alfa = 0; i < this.slices; i++, alfa += this.beta)
        this.texCoords.push(Math.cos(alfa) * 0.5 + 0.5, Math.sin(-alfa) * 0.5 + 0.5);
    this.texCoords.push(0.5, 0.5);

    this.updateTexCoordsGLBuffers();
}
