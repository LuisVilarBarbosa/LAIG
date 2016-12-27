/**
 * MyNodesBoard
 * @constructor
 */
function MyNodesBoard(scene) {
    CGFobject.call(this, scene);
	
	this.scene = scene;
	
	this.planes = [];
	this.planesPos = [];
	
	this.tiles = [];
	this.tilesPos = [];
	
	this.initPlanes();
	this.initTiles();
    
};

MyNodesBoard.prototype = Object.create(CGFobject.prototype);
MyNodesBoard.prototype.constructor = MyNodesBoard;

MyNodesBoard.prototype.initPlanes = function ()
{
	for(var i = 0; i < 81; i++){
		this.planes.push(new MyNurbsPlane(this.scene, 0.2, 0.2, 2, 2));
	}
	
	for(var k = -4; k < 5; k++){
		for(var j = -4; j < 5; j++){
			var pos = [];
			pos.push(j*0.2);
			pos.push(0.01);
			pos.push(k*0.2);
			this.planesPos.push(pos);
		}
	}
}

MyNodesBoard.prototype.initTiles = function ()
{
	var i = 0, k = 0;
	for(i = 8; i >= 0; i--){
		for(k = 0; k < 9; k++){
			var temp = [];
			temp[0] = 0.05+0.1*k;
			temp[1] = 0.05+0.1*i;
			temp[2] = 0;
			this.tilesPos.push(temp);
		}
	}
	
	for(i = 8; i >= 0; i--){
		for(k = 0; k < 9; k++){
			this.tiles.push(new MyTile(this.scene, 0, 0, 0.1, 0.1, 0.05+k*0.10, 0.05+i*0.10, 0.05+(k+1)*0.10, 0.05+(i+1)*0.10));
		}
	}
	
}

MyNodesBoard.prototype.display = function () {
	
	
	this.scene.nova.apply();
	for(var i = 0; i < this.tiles.length; i++){
		var pos = this.tilesPos[i];
		this.scene.pushMatrix();
			this.scene.scale(3,3,1);
			this.scene.translate(pos[0], pos[1], pos[2]);
			this.scene.registerForPick(i+1, this.tiles[i]);
			this.tiles[i].display();
		this.scene.popMatrix();
	}
    
};

