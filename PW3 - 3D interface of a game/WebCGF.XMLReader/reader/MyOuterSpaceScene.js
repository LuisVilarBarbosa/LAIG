/**
 * MyOuterSpaceScene
 * @constructor
 */
function MyOuterSpaceScene(scene) {
    CGFobject.call(this, scene);
	this.scene = scene;
	
	this.wall = new MyTile(scene, -35, -35, 35, 35, 0, 0, 1, 1);
	this.createAppearances();
};

MyOuterSpaceScene.prototype = Object.create(CGFobject.prototype);
MyOuterSpaceScene.prototype.constructor = MyOuterSpaceScene;

MyOuterSpaceScene.prototype.createAppearances = function () {
	this.appe = new CGFappearance(this.scene);
    this.appe.setAmbient(0.9, 0.9, 0.9, 1);
    this.appe.setDiffuse(0.9, 0.9, 0.9, 1);
    this.appe.setSpecular(0.9, 0.9, 0.9, 1);
	this.appe.setEmission(0.5, 0.5, 0.5, 1);
    this.appe.setShininess(10.0);
	this.appe.loadTexture("./images/outer-space-stars.jpg");
};


MyOuterSpaceScene.prototype.display = function () {
	this.appe.apply();
	this.scene.pushMatrix();
		this.scene.translate(0, 0, -35);
		this.wall.display();
	this.scene.popMatrix();
	
	this.scene.pushMatrix();
		this.scene.rotate(Math.PI/2, 1, 0, 0);
		this.scene.translate(0, 0, -35);
		this.wall.display();
	this.scene.popMatrix();
	
	this.scene.pushMatrix();
		this.scene.rotate(Math.PI, 1, 0, 0);
		this.scene.translate(0, 0, -35);
		this.wall.display();
	this.scene.popMatrix();
	
	this.scene.pushMatrix();
		this.scene.rotate(Math.PI*1.5, 1, 0, 0);
		this.scene.translate(0, 0, -35);
		this.wall.display();
	this.scene.popMatrix();
	
	this.scene.pushMatrix();
		this.scene.rotate(Math.PI/2, 0, 1, 0);
		this.scene.translate(0, 0, -35);
		this.wall.display();
	this.scene.popMatrix();
	
	this.scene.pushMatrix();
		this.scene.rotate(-Math.PI/2, 0, 1, 0);
		this.scene.translate(0, 0, -35);
		this.wall.display();
	this.scene.popMatrix();
};