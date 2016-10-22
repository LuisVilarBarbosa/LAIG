/**
 * MyRectangle
 * @constructor
 */
function MyRectangle(scene, x1, y1, x2, y2, minS, maxS, minT, maxT) {
    CGFobject.call(this, scene);

    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
    this.minS = minS || 0;
    this.maxS = maxS || 1;
    this.minT = minT || 0;
    this.maxT = maxT || 1;

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

    this.setTextureCoordinates(this.minS, this.maxS, this.minT, this.maxT);

    this.initGLBuffers();
};

MyRectangle.prototype.setTextureCoordinates = function (minS, maxS, minT, maxT) {
    this.minS = minS || 0;
    this.maxS = maxS || 1;
    this.minT = minT || 0;
    this.maxT = maxT || 1;

    this.texCoords = [
        this.minS, this.maxT,
        this.maxS, this.maxT,
        this.maxS, this.minT,
        this.minS, this.minT
    ];
    this.updateTexCoordsGLBuffers();
}
