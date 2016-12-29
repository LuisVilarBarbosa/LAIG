/**
 * MyPalmTree
 * @constructor
 */
function MyPalmTree(scene) {
    CGFobject.call(this, scene);
	this.scene = scene;
	
	this.init();
	this.createAppearances();
};

MyPalmTree.prototype = Object.create(CGFobject.prototype);
MyPalmTree.prototype.constructor = MyPalmTree;

MyPalmTree.prototype.createAppearances = function () {
	this.brown = new CGFappearance(this.scene);
    this.brown.setAmbient(0.615, 0.505, 0.388, 1);
    this.brown.setDiffuse(0.615, 0.505, 0.388, 1);
    this.brown.setSpecular(0.615, 0.505, 0.388, 1);
    this.brown.setShininess(10.0);
	this.brown.loadTexture("./images/palm_tree_trunk.jpg");
	
	this.green = new CGFappearance(this.scene);
    this.green.setAmbient(0, 0.49, 0, 1);
    this.green.setDiffuse(0, 0.49, 0, 1);
    this.green.setSpecular(0, 0.49, 0, 1);
    this.green.setShininess(10.0);
};

MyPalmTree.prototype.init = function () {
	this.controlPoints =[
							[0, 0.15, 0, 1],
							[0, 0.3, 0, 1],
						
							[0.15, 0.3, 0, 1],
							[0.15, 0.4, 0, 1],
						
							[0.3, 0.1, 0, 1],
							[0.3, 0.3, 0, 1],
						
							[0.45, -0.1, 0, 1],
							[0.45, -0.1, 0, 1]
						];
	this.controlPoints2 =[
							[0.45, -0.1, 0, 1],
							[0.45, -0.1, 0, 1],
							
						
							[0.3, 0.1, 0, 1],
							[0.3, 0.3, 0, 1],
							
							[0.15, 0.3, 0, 1],
							[0.15, 0.4, 0, 1],
						
							[0, 0.15, 0, 1],
							[0, 0.3, 0, 1]
						
							
						];
						
	this.leaf = new MyNurbsPatch(this.scene, 3, 1, 10, 10, this.controlPoints);
	this.leaf2 = new MyNurbsPatch(this.scene, 3, 1, 10, 10, this.controlPoints2);
	this.trunk = new MyCylinderWithTops(this.scene, 0.07, 0.05, 0.15, 8, 8, 3, 3);
	
};

MyPalmTree.prototype.display = function () {
	this.green.apply();
	
	angle = Math.PI * 2 / 12;
	for(var i = 0; i < 12; i++){
		this.scene.pushMatrix();
			this.scene.translate(0, 0.4, 0);
			this.scene.rotate(angle * i, 0, 1, 0);
			this.leaf.display();
			this.leaf2.display();
		this.scene.popMatrix();
	}
	
	var angle = Math.PI * 2 / 12;
	for(var i = 0; i < 12; i++){
		this.scene.pushMatrix();
			this.scene.translate(0, 0.4, 0);
			this.scene.translate(0, 0.2, 0);
			this.scene.rotate(angle * i + Math.PI * 2 / 24, 0, 1, 0);
			this.scene.translate(0.13, -0.2, 0);
			this.scene.rotate(Math.PI / 6, 0, 0, 1);
			this.leaf.display();
			this.leaf2.display();
		this.scene.popMatrix();
	}
	
	this.brown.apply();
	for(var i = 0; i < 4; i++){
		this.scene.pushMatrix();
			this.scene.translate(0, i * 0.15, 0);
			this.scene.rotate(Math.PI/2, 1, 0, 0);
			this.scene.translate(0, 0, -0.15);
			this.trunk.display();
		this.scene.popMatrix();
	}
};