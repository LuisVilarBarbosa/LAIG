/**
 * MyPineTree
 * @constructor
 */
function MyPineTree(scene, height, base_height, stacks) {
    CGFobject.call(this, scene);
	
	this.scene = scene;
	this.height = height;
	this.base_height = base_height;
	this.stacks = stacks;
	this.y_delta = (this.height - this.base_height) / this.stacks;
	this.createAppearances();
	this.init();
};

MyPineTree.prototype = Object.create(CGFobject.prototype);
MyPineTree.prototype.constructor = MyPineTree;

MyPineTree.prototype.createAppearances = function () {
	this.green = new CGFappearance(this.scene);
    this.green.setAmbient(0.176, 0.286, 0.0666, 1);
    this.green.setDiffuse(0.176, 0.286, 0.0666, 1);
    this.green.setSpecular(0.176, 0.286, 0.0666, 1);
    this.green.setShininess(10.0);
	
	this.brown = new CGFappearance(this.scene);
    this.brown.setAmbient(0.325, 0.207, 0.0392, 1);
    this.brown.setDiffuse(0.325, 0.207, 0.0392, 1);
    this.brown.setSpecular(0.325, 0.207, 0.0392, 1);
    this.brown.setShininess(10.0);
};

MyPineTree.prototype.init = function () {
	this.trunk = new MyCylinderWithTops(this.scene, this.height * 0.04, 0.0, this.height - (this.height - this.base_height)*0.4, 8, 20, 1, 1);
	
	var a = (this.height - this.base_height) / this.stacks;
	var b = 8 * this.height * 0.05;
	this.top = new MyTriangle(this.scene, -b/2, 0, 0, b/2, 0, 0, 0, a, 0);
};

MyPineTree.prototype.display = function () {
	this.brown.apply();
	this.scene.pushMatrix();
		this.scene.rotate(-Math.PI/2, 1, 0, 0);
		this.trunk.display();
	this.scene.popMatrix();
	
	
	this.green.apply();
	var angle = Math.PI * 2 / 8;
	for(var i = 0; i < 8; i++){
		for(var k = 0; k < this.stacks; k++){
			this.scene.pushMatrix();
				this.scene.rotate(angle * i, 0, 1, 0);
				this.scene.translate(0, (this.base_height + this.y_delta * k) - (this.base_height + this.y_delta * k) * 0.4, 0);
				this.scene.scale(1 - k * 0.15, 1, 1);
				this.top.display();
			this.scene.popMatrix();
		}
	}
	
};

