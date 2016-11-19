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

    this.init();
};

MyNurbsPlane.prototype = Object.create(CGFobject.prototype);
MyNurbsPlane.prototype.constructor = MyNurbsPlane;

MyNurbsPlane.prototype.getKnotsVector = function (degree) {
    var v = [];
    for (var i = 0; i <= degree; i++)
        v.push(0);
    for (var i = 0; i <= degree; i++)
        v.push(1);
    return v;
}

MyNurbsPlane.prototype.init = function () {
    var orderU = 1;
    var orderV = 1;
    var knotsU = this.getKnotsVector(orderU);
    var knotsV = this.getKnotsVector(orderV);

    var controlPoints = [
							[
								[-this.dimX / 2, -this.dimY / 2, 0, 1],
								[-this.dimX / 2, this.dimY / 2, 0, 1]
							],
							[
								[this.dimX / 2, -this.dimY / 2, 0, 1],
								[this.dimX / 2, this.dimY / 2, 0, 1]
							]
    ]

    var nurbsSurface = new CGFnurbsSurface(orderU, orderV, knotsU, knotsV, controlPoints);

    getSurfacePoint = function (u, v) {
        return nurbsSurface.getPoint(u, v);
    };

    this.nurbsObject = new CGFnurbsObject(this.scene, getSurfacePoint, this.partsX, this.partsY);
}

MyNurbsPlane.prototype.display = function () {
    this.nurbsObject.display();
}

MyNurbsPlane.prototype.setTextureCoordinates = function (lengthS, lengthT) {}
