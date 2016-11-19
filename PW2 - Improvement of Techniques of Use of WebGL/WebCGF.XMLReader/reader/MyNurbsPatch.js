/**
 * MyNurbsPatch
 * @constructor
 */
function MyNurbsPatch(scene, orderU, orderV, partsU, partsV, controlPoints) {
    CGFobject.call(this, scene);

    if (controlPoints.length != (orderU + 1) * (orderV + 1))
        throw "The number of control points of the patch is not correct.";

    this.scene = scene;
    this.orderU = orderU;
    this.orderV = orderV;
    this.partsU = partsU;
    this.partsV = partsV;
    this.controlPoints = [];

    for (var i = 0, pos = 0; i < this.orderU + 1; i++) {
      var controlPointsU = [];
      for (var j = 0; j < this.orderV + 1; j++, pos++)
        controlPointsU.push(controlPoints[pos]);
      this.controlPoints.push(controlPointsU);
    }

    this.init();
};

MyNurbsPatch.prototype = Object.create(CGFobject.prototype);
MyNurbsPatch.prototype.constructor = MyNurbsPatch;

MyNurbsPatch.prototype.getKnotsVector = function (degree) {
    var v = [];
    for (var i = 0; i <= degree; i++)
        v.push(0);
    for (var i = 0; i <= degree; i++)
        v.push(1);
    return v;
}

MyNurbsPatch.prototype.init = function () {
    var knotsU = this.getKnotsVector(this.orderU);
    var knotsV = this.getKnotsVector(this.orderV);

    var nurbsSurface = new CGFnurbsSurface(this.orderU, this.orderV, knotsU, knotsV, this.controlPoints);

    getSurfacePoint = function (u, v) {
        return nurbsSurface.getPoint(u, v);
    };

    this.nurbsObject = new CGFnurbsObject(this.scene, getSurfacePoint, this.partsU, this.partsV);
}

MyNurbsPatch.prototype.display = function () {
    this.nurbsObject.display();
}

MyNurbsPatch.prototype.setTextureCoordinates = function (lengthS, lengthT) {}
