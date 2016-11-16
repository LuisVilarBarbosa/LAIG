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
	
	this.nurbsObject;

	this.start();
};

MyNurbsPlane.prototype = Object.create(CGFobject.prototype);
MyNurbsPlane.prototype.constructor = MyNurbsPlane;

MyNurbsPlane.prototype.getKnotsVector = function(degree) { 
	
	var v = new Array();
	for (var i=0; i<=degree; i++) {
		v.push(0);
	}
	for (var i=0; i<=degree; i++) {
		v.push(1);
	}
	return v;
}

MyNurbsPlane.prototype.start = function () {
	var knots1 = this.getKnotsVector(1);
	var knots2 = this.getKnotsVector(1);
	
	var controlPoints = [
							[
								[-this.dimX/2, -this.dimY/2, 0, 1],
								[-this.dimX/2, this.dimY/2, 0, 1]
							],
							[
								[this.dimX/2, -this.dimY/2, 0, 1],
								[this.dimX/2, this.dimY/2, 0, 1]
							]
						]
	console.log(controlPoints);
	
	var nurbsSurface = new CGFnurbsSurface(1, 1, knots1, knots2, controlPoints);
	
	getSurfacePoint = function(u, v) {
		return nurbsSurface.getPoint(u, v);
	};
	
	this.nurbsObject = new CGFnurbsObject(this.scene, getSurfacePoint, this.partsX, this.partsY);
}

MyNurbsPlane.prototype.display = function () {
	this.nurbsObject.display();
}


