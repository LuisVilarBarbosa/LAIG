/**
 * MyNodePiece
 * @constructor
 */
function MyNodePiece(scene) {
    CGFobject.call(this, scene);
	
	this.scene = scene;
	
	this.middle = new MyCylinderWithTops(scene, 0.3, 0.1, 0.9, 6, 6, 1, 1);
	this.head = new MySphere(scene, 0.2, 30, 30, 1, 1);
	this.base = new MyCylinderWithTops(scene, 0.45, 0.4, 0.2, 6, 6, 1, 1);
    
};

MyNodePiece.prototype = Object.create(CGFobject.prototype);
MyNodePiece.prototype.constructor = MyNodePiece;

MyNodePiece.prototype.display = function () {
	this.scene.pushMatrix();
		this.scene.scale(0.2, 0.2, 0.2);
		
		this.scene.pushMatrix();
			this.middle.display();
		this.scene.popMatrix();
		
		this.scene.pushMatrix();
			this.scene.translate(0, 0, 1);
			this.head.display();
		this.scene.popMatrix();
		
		this.scene.pushMatrix();
			this.base.display();
		this.scene.popMatrix();
    this.scene.popMatrix();
};

