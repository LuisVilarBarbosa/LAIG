/**
 * MyPyramid
 * @constructor
 */
function MyPyramid(scene) {
    CGFobject.call(this, scene);
	this.scene = scene;

	this.base = new MyRectangle(this.scene, -0.5, -0.5, 0.5, 0.5, 0.25, 0.25);
	this.triangle = new MyTriangle(this.scene, -0.5, 0, 0, 0.5, 0, 0, 0, 1, 0, 0.25, 0.25);
	this.createAppearances();
};

MyPyramid.prototype = Object.create(CGFobject.prototype);
MyPyramid.prototype.constructor = MyPyramid;

MyPyramid.prototype.createAppearances = function () {
	this.light_brown = new CGFappearance(this.scene);
    this.light_brown.setAmbient(0.933, 0.835, 0.717, 1);
    this.light_brown.setDiffuse(0.933, 0.835, 0.717, 1);
    this.light_brown.setSpecular(0.933, 0.835, 0.717, 1);
    this.light_brown.setShininess(10.0);
	this.light_brown.loadTexture("./images/pyramid.jpg");
};


MyPyramid.prototype.display = function () {
	
	this.light_brown.apply();
	this.scene.pushMatrix();
		this.scene.translate(0, 0, 0.5);
		this.scene.rotate(-Math.PI/6, 1, 0, 0);
		this.triangle.display();
	this.scene.popMatrix();
	
	this.scene.pushMatrix();
		this.scene.translate(0.5, 0, 0);
		this.scene.rotate(Math.PI/2, 0, 1, 0);
		this.scene.rotate(-Math.PI/6, 1, 0, 0);
		this.triangle.display();
	this.scene.popMatrix();
	
	this.scene.pushMatrix();
		this.scene.translate(0, 0, -0.5);
		this.scene.rotate(Math.PI, 0, 1, 0);
		this.scene.rotate(-Math.PI/6, 1, 0, 0);
		this.triangle.display();
	this.scene.popMatrix();
	
	this.scene.pushMatrix();
		this.scene.translate(-0.5, 0, 0);
		this.scene.rotate(Math.PI*1.5, 0, 1, 0);
		this.scene.rotate(-Math.PI/6, 1, 0, 0);
		this.triangle.display();
	this.scene.popMatrix();
	
	this.scene.pushMatrix();
		this.scene.rotate(Math.PI/2, 1, 0, 0);
		this.base.display();
	this.scene.popMatrix();
};