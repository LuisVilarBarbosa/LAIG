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
	this.animation = null;
	this.movingPiece = -2;  // unit index or -1 if node
	
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
        var gy = (10 - y - 1) / 10;
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

MyPlayer.prototype.movePiece = function (from, to) {
    var gx1 = from[0] / 10;
    var gx2 = to[0] / 10;
    var gy1 = (10 - from[1]) / 10;
    var gy2 = (10 - to[1]) / 10;
    var gz = 0;

    var length = this.unitsPos.length;
    for (var i = 0; i < length; i++) {
        if (this.unitsPos[i][0] == gx2 && this.unitsPos[i][1] == gy2) {
            this.unitsPos[i][0] == gx2;
            this.unitsPos[i][1] == gy2;
            this.movingPiece = i;
        }
    }

	if((gx2 - gx1) < 0)
		gz = 0.14;
    this.animation = new AnimationByKeyImages(1, [[gx1, gy1, gz], [gx2, gy2, gz]], 0, 0, [1,1,1]);
}

MyPlayer.prototype.update = function (currTime) {
    if(this.animation != null)
        this.animation.calculateGeometricTransformation(currTime);
}

MyPlayer.prototype.calculatePickingId = function (pos) {
    return (10 - pos[1] * 10) * 10 + pos[0] * 10;
}

MyPlayer.prototype.display = function () {
    for (var i = 1; i <= this.units.length; i++) {

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
			this.scene.registerForPick(this.calculatePickingId(this.unitsPos[i - 1]), this.units[i - 1]);
			if (this.movingPiece == i - 1 && this.animation != null && !this.animation.done)
			    this.scene.multMatrix(this.animation.getGeometricTransformation());
            else
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
	    if (this.movingPiece == -1 && this.animation != null && !this.animation.done)
	        this.scene.multMatrix(this.animation.getGeometricTransformation());
	    else
		    this.scene.translate(this.nodePos[0] * 3, this.nodePos[1] * 3, this.nodePos[2] * 3);
		this.node.display();
	this.scene.popMatrix();
};
