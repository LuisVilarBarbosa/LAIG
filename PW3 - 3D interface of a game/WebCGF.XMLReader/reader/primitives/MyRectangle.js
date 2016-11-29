/**
 * MyRectangle
 * @constructor
 */
function MyRectangle(scene, x1, y1, x2, y2, lengthS, lengthT) {
    CGFobject.call(this, scene);

    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
    this.lengthS = lengthS || 1;
    this.lengthT = lengthT || 1;

    this.initBuffers();
};

MyRectangle.prototype = Object.create(CGFobject.prototype);
MyRectangle.prototype.constructor = MyRectangle;

MyRectangle.prototype.initBuffers = function () {

    this.vertices = [
        this.x1, this.y1, 0,
        this.x2, this.y1, 0,
        this.x2, this.y2, 0,
        this.x1, this.y2, 0
    ];

    this.indices = [
        0, 1, 2,
		0, 2, 3
    ];

    this.normals = [
        0, 0, 1,
        0, 0, 1,
        0, 0, 1,
        0, 0, 1
    ];

    this.setTextureCoordinates(this.lengthS, this.lengthT);

    this.initGLBuffers();
};

MyRectangle.prototype.setTextureCoordinates = function (lengthS, lengthT) {
    this.lengthS = lengthS || 1;
    this.lengthT = lengthT || 1;

    this.texCoords = [
        0, 1,
        1 / this.lengthS, 1,
        1 / this.lengthS, 1 - (this.y2 - this.y1) / this.lengthT,
        0, 1 - (this.y2 - this.y1) / this.lengthT
    ];
    this.updateTexCoordsGLBuffers();
}
