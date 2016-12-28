/**
 * NodesGame
 * @constructor
 */
function NodesGame(scene) {
	this.scene = scene;
	
    this.mode = "cc";
    this.level = "hard";
    this.player = "p1";

    // to see the meaning of each value, consult the 'server.pl' file
    this.logicBoard = [
      [5,5,2,2,1,2,2,5,5],
      [5,0,0,2,2,2,0,0,5],
      [0,0,0,0,2,0,0,0,0],
      [0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0],
      [0,0,0,0,0,0,0,0,0],
      [0,0,0,0,4,0,0,0,0],
      [5,0,0,4,4,4,0,0,5],
      [5,5,4,4,3,4,4,5,5]
    ];

    this.setTimer(0);
    this.setScorer(0, 0);
    this.setMaxMoveTime(300);
	
	this.board = new MyNodesBoard(this.scene);
	this.player1 = new MyPlayer(this.scene, 1);
	this.player2 = new MyPlayer(this.scene, 2);
	this.active_player = 1;
	
	this.history = [];  // to undo and movie
	
};

NodesGame.prototype.pickingMove = function (picking_id, player, xf, yf) {
	var xi = 0;
	var yi = 0;
	if(picking_id % 10 == 8){
		if(player == 1){
			xi = Math.round(this.player1.nodePos[0] * 10);
			yi = 10 - Math.round(this.player1.nodePos[1] * 10);
			this.logicBoard[yf-1][xf-1] = 3;
		}else{
			xi = Math.round(this.player2.nodePos[0] * 10);
			yi = 10 - Math.round(this.player2.nodePos[1] * 10);
			this.logicBoard[yf-1][xf-1] = 1;
		}
	}else{
		if(player == 1){
			xi = Math.round(this.player1.unitsPos[picking_id-(100 + player*10)][0] * 10);
			yi = 10 - Math.round(this.player1.unitsPos[picking_id-(100 + player*10)][1] * 10);
		}else{
			xi = Math.round(this.player2.unitsPos[picking_id-(100 + player*10)][0] * 10);
			yi = 10 - Math.round(this.player2.unitsPos[picking_id-(100 + player*10)][1] * 10);
		}
	}
	
	console.log("Coordenada X inicial: " + xi);
	console.log("Coordenada Y inicial: " + yi);
	console.log("Coordenada X final: " + xf);
	console.log("Coordenada X final: " + yf);
	
}

NodesGame.prototype.movePieceInLogicBoard = function (picking_id, player, xf, yf) {
	var xi = 0;
	var yi = 0;
	if(picking_id % 10 == 8){
		if(player == 1){
			xi = Math.round(this.player1.nodePos[0] * 10) - 1;
			yi = 9 - Math.round(this.player1.nodePos[1] * 10);
			this.logicBoard[yf-1][xf-1] = 3;
		}else{
			xi = Math.round(this.player2.nodePos[0] * 10) - 1;
			yi = 9 - Math.round(this.player2.nodePos[1] * 10);
			this.logicBoard[yf-1][xf-1] = 1;
		}
		this.logicBoard[yi][xi] = 0;
		return;
	}
	
	if(player == 1){
		xi = Math.round(this.player1.unitsPos[picking_id-(100 + player*10)][0] * 10) - 1;
		yi = 9 - Math.round(this.player1.unitsPos[picking_id-(100 + player*10)][1] * 10);
		this.logicBoard[yf-1][xf-1] = 4;
	}else{
		xi = Math.round(this.player2.unitsPos[picking_id-(100 + player*10)][0] * 10) - 1;
		yi = 9 - Math.round(this.player2.unitsPos[picking_id-(100 + player*10)][1] * 10);
		this.logicBoard[yf-1][xf-1] = 2;
	}
	this.logicBoard[yi][xi] = 0;
}

NodesGame.prototype.movePieceInGraphicBoard = function (player, hor, ver, picking_buffer) {
	if(player == 1){
		if(picking_buffer % 10 == 8){
			this.player1.nodePos [0] = hor * 0.1;
			this.player1.nodePos [1] = 1 - ver * 0.1;
			this.active_player = 2;
		}else{
			this.player1.unitsPos[picking_buffer-(100 + player*10)][0] = hor * 0.1;
			this.player1.unitsPos[picking_buffer-(100 + player*10)][1] = 1 - ver * 0.1;
		}
	}else{
		if(picking_buffer % 10 == 8){
			this.player2.nodePos [0] = hor * 0.1;
			this.player2.nodePos [1] = 1 - ver * 0.1;
			this.active_player = 1;
		}else{
			this.player2.unitsPos[picking_buffer-(100 + player*10)][0] = hor * 0.1;
			this.player2.unitsPos[picking_buffer-(100 + player*10)][1] = 1 - ver * 0.1;
		}
	}
}

NodesGame.prototype.pickingHandler = function (customId) {
    if(customId < 100 && this.scene.picking_buffer != 0){
		console.log("Tile: " + customId);
		console.log("Ver:" + (Math.ceil(customId / 9) % 10) + "  " + "Hor:" + (((customId - 1) % 9)+1));
		var hor = ((customId - 1) % 9)+1;
		var ver = Math.ceil(customId / 9) % 10;
		if(this.active_player == 1){
			this.movePieceInLogicBoard(this.scene.picking_buffer, 1, hor, ver);
			this.pickingMove(this.scene.picking_buffer, 1, hor, ver);
			if(this.scene.picking_buffer % 10 == 8){
				this.player1.nodePos [0] = hor * 0.1;
				this.player1.nodePos [1] = 1 - ver * 0.1;
				this.active_player = 2;
			}else{
				this.player1.unitsPos[this.scene.picking_buffer-(100 + this.active_player*10)][0] = hor * 0.1;
				this.player1.unitsPos[this.scene.picking_buffer-(100 + this.active_player*10)][1] = 1 - ver * 0.1;
			}
		}else{
			this.movePieceInLogicBoard(this.scene.picking_buffer, 2, hor, ver);
			this.pickingMove(this.scene.picking_buffer, 2, hor, ver);
			if(this.scene.picking_buffer % 10 == 8){
				this.player2.nodePos [0] = hor * 0.1;
				this.player2.nodePos [1] = 1 - ver * 0.1;
				this.active_player = 1;
			}else{
				this.player2.unitsPos[this.scene.picking_buffer-(100 + this.active_player*10)][0] = hor * 0.1;
				this.player2.unitsPos[this.scene.picking_buffer-(100 + this.active_player*10)][1] = 1 - ver * 0.1;
			}
		}
		this.scene.picking_buffer = 0;
	}else if(customId >=100){
		var player = Math.floor(customId / 10) % 10;
		if(player == this.active_player){
			this.scene.picking_buffer = customId;
			console.log("Piece: " + customId);
		}
	}
}

NodesGame.prototype.display = function () {
	this.scene.pushMatrix();
		this.scene.translate(0, 0, 3.05);
		this.scene.rotate(-Math.PI/2, 1, 0, 0);
		
		this.board.display();
		this.player1.display();
		this.player2.display();
	this.scene.popMatrix();
}

NodesGame.prototype.setMode = function (mode) {
    if (mode == "cc" || mode == "ch" || mode == "hh")
      this.mode = mode;
    else
      console.error("Invalid game mode indicated. Not set.");
}

NodesGame.prototype.setLevel = function (level) {
  if (level == "easy" || level == "hard")
    this.level = level;
  else
    console.error("Invalid game level indicated. Not set.");
}

NodesGame.prototype.setLogicBoard = function (logicBoard) {
    this.logicBoard = logicBoard;
}

NodesGame.prototype.makeMove = function (from_x, from_y, to_x, to_y) {
    var move;

    if (this.mode == "hh" || (this.mode == "ch" && this.player == "p2")) {
      if (from_x == to_x && from_y - 1 == to_y)
        move = "move_up";
      else if (from_x == to_x && from_y + 1 == to_y)
        move = "move_down";
      else if (from_x - 1 == to_x && from_y == to_y)
        move = "move_left";
      else if (from_x + 1 == to_x && from_y == to_y)
        move = "move_right";
      else if (from_x == to_x && from_y - 2 == to_y)
        move = "jump_up_enemy_unit";
      else if (from_x == to_x && from_y + 2 == to_y)
        move = "jump_down_enemy_unit";
      else if (from_x - 2 == to_x && from_y == to_y)
        move = "jump_left_enemy_unit";
      else if (from_x + 2 == to_x && from_y == to_y)
        move = "jump_right_enemy_unit";
      else {
        console.error("Invalid move.");
        return;
      }
    }

    this.sendToProlog(this.mode, this.level, this.player, this.logicBoard);
    // It would be good if we could wait for the answer and verify that, because the move can be not possible.
    // If the move was not possible, we should indicate that using console.log().

    this.changePlayer();
}

NodesGame.prototype.changePlayer = function () {
    if (this.player == "p1")
      this.player = "p2";
    else if (this.player == "p2")
      this.player = "p1";
    else
      console.error("Unexpected change to the player happened: " + this.player);
}

NodesGame.prototype.sendToProlog = function (mode /*cc, ch or hh*/, level /*easy or hard*/, player /*p1 or p2*/, board, move, x, y) {
    var requestString;
    if(mode == "cc" || (mode == "ch" && this.player == "p1"))
      requestString = "burst_move(c," + level + "," + player + "," + JSON.stringify(board) + ")";
    else if(mode == "hh" || (mode == "ch" && this.player == "p2"))
      requestString = "rule(h," + move + "," + player + "," + x + "," + y + "," + JSON.stringify(board) + ")";

    var this_t = this;
    getPrologRequest(requestString, function (data) {this_t.receiveFromProlog(data)});
}

NodesGame.prototype.receiveFromProlog = function (data) {
    var response = JSON.parse(data.target.response);
    if (response != "Bad Request" && response != "Syntax Error") {
        this.history.push(this.detectDifference(this.logicBoard, response));
        this.setLogicBoard(response);
    }
    else
        console.error("Not a board received.");
}

NodesGame.prototype.setTimer = function (time) {
    this.timer = time;
}

NodesGame.prototype.setScorer = function (p1Score, p2Score) {
    this.scorer = p1Score + " / " + p2Score;
}

NodesGame.prototype.setMaxMoveTime = function (time) {  // maximum time to make a move
    this.maxMoveTime = time;
}

NodesGame.prototype.update = function (currTime) {
    this.firstTime = this.firstTime || currTime;
    var deltaTime = (currTime - this.firstTime) / 1000;
    this.setTimer(deltaTime);
    this.setScorer(0, this.timer);  // should receive the score of each player
    this.makeMove();    // to be removed
}

NodesGame.prototype.detectDifference = function (oldBoard, newBoard) {
    var changes = [];
    var yLength = oldBoard.length;
    if (yLength != newBoard.length)
        console.warn(this.constructor.name + ": Expected boards with the same size in y.");

    for (var y = 0; y < yLength; y++) {
        var xLength = oldBoard[y].length;
        if (xLength != newBoard[y].length)
            console.warn(this.constructor.name + ": Expected boards with the same size in x.");

        for (var x = 0; x < xLength; x++)
            if (oldBoard[y][x] != newBoard[y][x]) {
                if (newBoard[y][x] == 0 /* empty cell */)
                    changes["oldPos"] = [x, y];
                else
                    changes["newPos"] = [x, y];
            }
    }

    return changes;
}
