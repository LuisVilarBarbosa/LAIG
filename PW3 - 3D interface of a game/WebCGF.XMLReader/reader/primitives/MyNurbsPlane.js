/**
 * MyNurbsPlane
 * @constructor
 */
function MyNurbsPlane(scene, dimX, dimY, partsX, partsY) {
    CGFobject.call(this, scene);

    this.scene = scene;
    this.dimX = dimX;
    this.dimY = dimY;
    this.partsX = partsX;
    this.partsY = partsY;

    var orderU = 1;
    var orderV = 1;

    var controlPoints = [
                [-this.dimX / 2, -this.dimY / 2, 0, 1],
                [-this.dimX / 2, this.dimY / 2, 0, 1],
                [this.dimX / 2, -this.dimY / 2, 0, 1],
                [this.dimX / 2, this.dimY / 2, 0, 1]
    ];

    this.nurbsPatch = new MyNurbsPatch(this.scene, orderU, orderV, this.partsX, this.partsY, controlPoints);
};

MyNurbsPlane.prototype = Object.create(CGFobject.prototype);
MyNurbsPlane.prototype.constructor = MyNurbsPlane;

MyNurbsPlane.prototype.display = function () {
    this.nurbsPatch.display();
}

MyNurbsPlane.prototype.setTextureCoordinates = function (lengthS, lengthT) { }
