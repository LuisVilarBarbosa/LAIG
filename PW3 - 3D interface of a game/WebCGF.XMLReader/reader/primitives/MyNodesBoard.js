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
	for(var i = 0; i < 81; i++)
		this.planes.push(new MyNurbsPlane(this.scene, 0.2, 0.2, 2, 2));
	
	for(var k = -4; k <= 4; k++)
		for(var j = -4; j <= 4; j++)
			this.planesPos.push([j * 0.2, 0.01, k * 0.2]);
}

MyNodesBoard.prototype.initTiles = function ()
{
	var i = 0, k = 0;
	for(i = 8; i >= 0; i--)
	    for(k = 0; k < 9; k++) {
	        this.tilesPos.push([0.05+0.1*k, 0.05+0.1*i, 0]);
	        this.tiles.push(new MyTile(this.scene, 0, 0, 0.1, 0.1, 0.05+k*0.10, 0.05+i*0.10, 0.05+(k+1)*0.10, 0.05+(i+1)*0.10));
	    }
}

MyNodesBoard.prototype.display = function () {
    this.scene.nova.apply();
    for (var y = 1, i = 0; y <= 9; y++)
        for (var x = 1; x <= 9; x++, i++) {
		var pos = this.tilesPos[i];
		this.scene.pushMatrix();
			this.scene.scale(3,3,1);
			this.scene.translate(pos[0], pos[1], pos[2]);
			this.scene.registerForPick(y * 10 + x, this.tiles[i]);
			this.tiles[i].display();
		this.scene.popMatrix();
	}
};
