/**
 * MyNurbsPatch
 * @constructor
 */
function MyNurbsPatch(scene, orderU, orderV, partsU, partsV, controlPoints) {
    CGFobject.call(this, scene);
	
	var verification = this.verify(controlPoints, orderU, orderV);
	if(!verification){
		throw "Number of control points is not correct";
		console.log("hueheuhuehue");
	}
	
	this.scene = scene;
	this.orderU = orderU;
	this.orderV = orderV;
	this.partsU = partsU;
	this.partsV = partsV;
	this.controlPoints = controlPoints;
	
	this.nurbsObject;

	this.start();
	
	
};

MyNurbsPatch.prototype = Object.create(CGFobject.prototype);
MyNurbsPatch.prototype.constructor = MyNurbsPatch;

MyNurbsPatch.prototype.getKnotsVector = function(degree) { 
	
	var v = new Array();
	for (var i=0; i<=degree; i++) {
		v.push(0);
	}
	for (var i=0; i<=degree; i++) {
		v.push(1);
	}
	return v;
}

MyNurbsPatch.prototype.verify = function(controlP, orderU, orderV){
	var l = controlP.length;
	console.log("l = " + l);
	if(l != (orderU + 1)){
		return false;
	}
	
	for(var i = 0; i < l; i++){
		var subl = controlP[i].length;
		console.log("subl[" + i + "] = " + subl);
		if(subl != (orderV +1)){
			return false;
		}
	}
	return true;
}

MyNurbsPatch.prototype.start = function () {
	var knotsU = this.getKnotsVector(this.orderU);
	var knotsV = this.getKnotsVector(this.orderV);
	
	var nurbsSurface = new CGFnurbsSurface(this.orderU, this.orderV, knotsU, knotsV, this.controlPoints);
	
	getSurfacePoint = function(u, v) {
		return nurbsSurface.getPoint(u, v);
	};
	
	this.nurbsObject = new CGFnurbsObject(this.scene, getSurfacePoint, this.partsU, this.partsV);
}

MyNurbsPatch.prototype.display = function () {
	this.nurbsObject.display();
}


