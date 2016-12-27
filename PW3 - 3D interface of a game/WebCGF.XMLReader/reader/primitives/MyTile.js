/**
 * MyTile
 * @constructor
 */
function MyTile(scene, x1, y1, x2, y2, minS, minT, maxS, maxT) {
    CGFobject.call(this, scene);
	
	this.scene = scene;
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
    this.minS = minS;
    this.minT = minT;
    this.maxS = maxS;
    this.maxT = maxT;
	
	this.controlPoints =[
							[
								[x1, y1, 0, 1],
								[x1, y2, 0, 1]
							],
							[
								[x2, y1, 0, 1],
								[x2, y2, 0, 1]
							]
						];
    this.init();
};

MyTile.prototype = Object.create(CGFobject.prototype);
MyTile.prototype.constructor = MyTile;

/* Based on "NURBS Example" on Moodle */
MyTile.prototype.getKnotsVector = function (degree) {
    var v = [];
    for (var i = 0; i <= degree; i++)
        v.push(0);
    for (var i = 0; i <= degree; i++)
        v.push(1);
    return v;
}

/* Based on "NURBS Example" on Moodle */
MyTile.prototype.init = function () {
	console.log("hello");
    var knotsU = this.getKnotsVector(1);
    var knotsV = this.getKnotsVector(1);

    var nurbsSurface = new CGFnurbsSurface(1, 1, knotsU, knotsV, this.controlPoints);

    getSurfacePoint = function (u, v) {
        return nurbsSurface.getPoint(u, v);
    };

    this.nurbsObject = new CGFnurbsObject(this.scene, getSurfacePoint, 1, 1);
	
	this.setTextureCoordinates();
}

MyTile.prototype.display = function () {
    this.nurbsObject.display();
}


MyTile.prototype.setTextureCoordinates = function () {
    

	this.nurbsObject.texCoords = [
  		this.minS, this.minT,
  		this.maxS, this.minT,
  		this.minS, this.maxT,
  		this.maxS, this.maxT
    ];
    
    this.nurbsObject.updateTexCoordsGLBuffers();
}
