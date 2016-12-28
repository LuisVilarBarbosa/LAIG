/**
 * MySnowman
 * @constructor
 */
function MySnowman(scene) {
    CGFobject.call(this, scene);
	
	this.scene = scene;
	this.sphere = new MySphere(scene, 0.5, 30, 30, 1, 1);
	this.nose = new MyCylinderWithTops(scene, 0.05, 0, 0.5, 10, 10, 1, 1);
	this.createAppearances();
};

MySnowman.prototype = Object.create(CGFobject.prototype);
MySnowman.prototype.constructor = MySnowman;

MySnowman.prototype.createAppearances = function () {
	this.snow = new CGFappearance(this.scene);
    this.snow.setAmbient(0.9, 0.9, 0.9, 1);
    this.snow.setDiffuse(0.9, 0.9, 0.9, 1);
    this.snow.setSpecular(0.9, 0.9, 0.9, 1);
    this.snow.setShininess(10.0);
	
	this.orange = new CGFappearance(this.scene);
    this.orange.setAmbient(0.921, 0.537, 0.129, 1);
    this.orange.setDiffuse(0.921, 0.537, 0.129, 1);
    this.orange.setSpecular(0.921, 0.537, 0.129, 1);
    this.orange.setShininess(10.0);

};


MySnowman.prototype.display = function () {
	this.snow.apply();
	
	this.scene.pushMatrix();
		this.scene.translate(2, 0.5, 0);
		this.scene.scale(1.2, 1, 1.2);
		this.sphere.display();
	this.scene.popMatrix();
	
	this.scene.pushMatrix();
		this.scene.translate(2, 1.2, 0);
		this.scene.scale(0.9, 0.8, 0.9);
		this.sphere.display();
	this.scene.popMatrix();
	
	this.scene.pushMatrix();
		this.scene.translate(2, 1.75, 0);
		this.scene.scale(0.5, 0.5, 0.5);
		this.sphere.display();
	this.scene.popMatrix();
	
	this.orange.apply();
	this.scene.pushMatrix();
		this.scene.translate(2, 1.75, 0.2);
		this.nose.display();
	this.scene.popMatrix();
};

