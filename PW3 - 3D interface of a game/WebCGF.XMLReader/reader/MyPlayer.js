/**
 * MyPlayer
 * @constructor
 */
function MyPlayer(scene, player_number, logicBoard) {
    CGFobject.call(this, scene);
	
	this.scene = scene;
	this.player_number = player_number;
	
	this.units = [];
	this.unitsPos = [];
	this.node = new MyNodePiece(scene);
	this.nodePos = [];
	
	this.initPieces(logicBoard);
};

MyPlayer.prototype = Object.create(CGFobject.prototype);
MyPlayer.prototype.constructor = MyPlayer;

MyPlayer.prototype.initPieces = function (logicBoard) {
	
	for(var i = 1; i < 9; i++)
		this.units.push(new MyCylinderWithTops(this.scene, 0.02, 0.02, 0.04, 6, 6, 1, 1));
	
	this.updatePieces(logicBoard);
};

MyPlayer.prototype.updatePieces = function (logicBoard) {
    this.unitsPos = [];
    var gz = 0;
    var yLength = logicBoard.length;
    for (var y = 0; y < yLength; y++) {
        var gy = (y + 1) / 10;
        var xLength = logicBoard[y].length;
        for (var x = 0; x < xLength; x++) {
            var gx = (x + 1) / 10;

            if (this.player_number == 1) {
                if (logicBoard[y][x] == 1)
                    this.nodePos = [gx, gy, gz];
                else if (logicBoard[y][x] == 2)
                    this.unitsPos.push([gx, gy, gz]);
            }
            else {  // this.player_number == 2
                if (logicBoard[y][x] == 3)
                    this.nodePos = [gx, gy, gz];
                else if (logicBoard[y][x] == 4)
                    this.unitsPos.push([gx, gy, gz]);
            }
        }
    }
}

MyPlayer.prototype.calculatePickingId = function (pos) {
    return (10 - pos[1] * 10) * 10 + pos[0] * 10;
}

MyPlayer.prototype.display = function () {
	for(var i = 1; i <= this.units.length; i++){
		if(this.scene.game.picking_buffer == this.calculatePickingId(this.unitsPos[i - 1]))
			if(this.player_number == 1)
				this.scene.green.apply();
			else
				this.scene.yellow.apply();
		else
			if(this.player_number == 1)
				this.scene.red.apply();
			else
				this.scene.blue.apply();

		this.scene.pushMatrix();
			this.scene.scale(3,3,1);
			this.scene.registerForPick(this.calculatePickingId(this.unitsPos[i-1]), this.units[i - 1]);
			this.scene.translate(this.unitsPos[i - 1][0], this.unitsPos[i - 1][1], this.unitsPos[i - 1][2]);
			this.units[i - 1].display();
		this.scene.popMatrix();
    }
	
	if (this.scene.game.picking_buffer == this.calculatePickingId(this.nodePos))
	    if (this.player_number == 1)
	        this.scene.green.apply();
	    else
	        this.scene.yellow.apply();
	else
	    if (this.player_number == 1)
	        this.scene.red.apply();
	    else
	        this.scene.blue.apply();
			
	this.scene.pushMatrix();
	    this.scene.registerForPick(this.calculatePickingId(this.nodePos), this.node);
		this.scene.translate(this.nodePos[0] * 3, this.nodePos[1] * 3, this.nodePos[2] * 3);
		this.node.display();
	this.scene.popMatrix();
};