/**
 * MyPlayer
 * @constructor
 */
function MyPlayer(scene, player_number) {
    CGFobject.call(this, scene);
	
	this.scene = scene;
	this.player_number = player_number;
	
	this.units = [];
	this.unitsPos = [];
	this.node = new MyNodePiece(scene);
	this.nodePos = [];
	
	this.initUnits();
    
};

MyPlayer.prototype = Object.create(CGFobject.prototype);
MyPlayer.prototype.constructor = MyPlayer;

MyPlayer.prototype.initUnits = function () {
	
	for(var i = 1; i < 9; i++)
		this.units.push(new MyCylinderWithTops(this.scene, 0.02, 0.02, 0.04, 6, 6, 1, 1));
	
	
	
	if(this.player_number == 1){
		var pos = [0.3, 0.1, 0];
		this.unitsPos.push(pos);
		pos = [0.4, 0.1, 0];
		this.unitsPos.push(pos);
		pos = [0.6, 0.1, 0];
		this.unitsPos.push(pos);
		pos = [0.7, 0.1, 0];
		this.unitsPos.push(pos);
		pos = [0.4, 0.2, 0];
		this.unitsPos.push(pos);
		pos = [0.5, 0.2, 0];
		this.unitsPos.push(pos);
		pos = [0.6, 0.2, 0];
		this.unitsPos.push(pos);
		pos = [0.5, 0.3, 0];
		this.unitsPos.push(pos);
		
		this.nodePos = [0.5, 0.1, 0];
		
	}else{
		var pos = [0.3, 0.9, 0];
		this.unitsPos.push(pos);
		pos = [0.4, 0.9, 0];
		this.unitsPos.push(pos);
		pos = [0.6, 0.9, 0];
		this.unitsPos.push(pos);
		pos = [0.7, 0.9, 0];
		this.unitsPos.push(pos);
		pos = [0.4, 0.8, 0];
		this.unitsPos.push(pos);
		pos = [0.5, 0.8, 0];
		this.unitsPos.push(pos);
		pos = [0.6, 0.8, 0];
		this.unitsPos.push(pos);
		pos = [0.5, 0.7, 0];
		this.unitsPos.push(pos);
		
		this.nodePos = [0.5, 0.9, 0];
	}
	console.log(this.unitsPos);
	console.log(this.units);
};

MyPlayer.prototype.display = function () {
	for(var i = 1; i <= this.units.length; i++){
		if(this.scene.picking_buffer == (100 + this.player_number*10 + i - 1))
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
			this.scene.registerForPick((100 + this.player_number*10 + i - 1), this.units[i - 1]);
			this.scene.translate(this.unitsPos[i - 1][0], this.unitsPos[i - 1][1], this.unitsPos[i - 1][2]);
			this.units[i - 1].display();
		this.scene.popMatrix();
    }
	
	if(this.scene.picking_buffer == 100 + this.player_number*10 + 8)
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
		this.scene.registerForPick((100 + this.player_number*10 + 8), this.node);
		this.scene.translate(this.nodePos[0] * 3, this.nodePos[1] * 3, this.nodePos[2] * 3);
		this.node.display();
	this.scene.popMatrix();
};