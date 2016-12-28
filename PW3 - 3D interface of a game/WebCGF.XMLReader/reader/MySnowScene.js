/**
 * MySnowScene
 * @constructor
 */
function MySnowScene(scene) {
    CGFobject.call(this, scene);
	this.scene = scene;
	
	this.floor = new MyRectangle(scene, -1, -1, 1, 1, 1, 1);
	this.pine = new MyPineTree(scene, 2, 0.5, 4);
	this.snowman = new MySnowman(scene);
	this.createAppearances();
};

MySnowScene.prototype = Object.create(CGFobject.prototype);
MySnowScene.prototype.constructor = MySnowScene;

MySnowScene.prototype.createAppearances = function () {
	this.green = new CGFappearance(this.scene);
    this.green.setAmbient(0.176, 0.286, 0.0666, 1);
    this.green.setDiffuse(0.176, 0.286, 0.0666, 1);
    this.green.setSpecular(0.176, 0.286, 0.0666, 1);
    this.green.setShininess(10.0);
	
	this.white_snow = new CGFappearance(this.scene);
    this.white_snow.setAmbient(0.9, 0.9, 0.9, 1);
    this.white_snow.setDiffuse(0.9, 0.9, 0.9, 1);
    this.white_snow.setSpecular(0.9, 0.9, 0.9, 1);
    this.white_snow.setShininess(10.0);
	this.white_snow.loadTexture("./images/snow.jpg");
	
	
};


MySnowScene.prototype.display = function () {
	
	this.white_snow.apply();
	this.scene.pushMatrix();
		this.scene.translate(1.5, -0.01, 1.5);
		this.scene.scale(3, 1, 3);
		this.scene.rotate(-Math.PI/2, 1, 0, 0);
		this.floor.display();
	this.scene.popMatrix();
	
	for(var i = 0; i < 10; i++){
		this.scene.pushMatrix();
			this.scene.translate(-0.7 + 0.5 * i, 0, -0.7);
			this.scene.scale(0.6, 0.6, 0.6);
			this.pine.display();
		this.scene.popMatrix();
	}
	
	for(var i = 0; i < 9; i++){
		this.scene.pushMatrix();
			this.scene.translate(-0.45 + 0.5 * i, 0, -1.2);
			this.scene.scale(0.6, 0.6, 0.6);
			this.pine.display();
		this.scene.popMatrix();
	}
	
	for(var i = 0; i < 10; i++){
		this.scene.pushMatrix();
			this.scene.translate(-0.7 + 0.5 * i, 0, 3.7);
			this.scene.scale(0.6, 0.6, 0.6);
			this.pine.display();
		this.scene.popMatrix();
	}
	
	for(var i = 0; i < 9; i++){
		this.scene.pushMatrix();
			this.scene.translate(-0.45 + 0.5 * i, 0, 4.2);
			this.scene.scale(0.6, 0.6, 0.6);
			this.pine.display();
		this.scene.popMatrix();
	}
	
	this.scene.pushMatrix();
		this.scene.translate(-1, 0, 1.7);
		this.scene.scale(0.4, 0.4, 0.4);
		this.scene.rotate(Math.PI/2, 0, 1, 0);
		this.snowman.display();
	this.scene.popMatrix();
	
	this.scene.pushMatrix();
		this.scene.translate(4, 0, 1.7);
		this.scene.scale(0.4, 0.4, 0.4);
		this.scene.rotate(-Math.PI/2, 0, 1, 0);
		this.snowman.display();
	this.scene.popMatrix();
};