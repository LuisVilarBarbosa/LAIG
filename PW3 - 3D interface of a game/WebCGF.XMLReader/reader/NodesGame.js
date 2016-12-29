/**
 * NodesGame
 * @constructor
 */
function NodesGame(scene) {
	this.scene = scene;
	
    this.mode = "cc";
    this.level = "hard";

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
	this.players = [new MyPlayer(this.scene, 1, this.logicBoard), new MyPlayer(this.scene, 2, this.logicBoard)];
	this.active_player = 1;

	this.picking_buffer = 0;
	
	this.history = [];  // to undo and movie
	
};

NodesGame.prototype.calculateLogicCoords = function (picking_id) {
    var x = picking_id % 10;
    var y = Math.trunc(picking_id / 10);
	return [x, y];
}

NodesGame.prototype.pickingHandler = function (customId) {
    if (this.picking_buffer != 0) {
        var logicCoords1 = this.calculateLogicCoords(this.picking_buffer);
        var logicCoords2 = this.calculateLogicCoords(customId);
        this.tryMove(logicCoords1[0], logicCoords1[1], logicCoords2[0], logicCoords2[1]);
        this.picking_buffer = 0;
    } else
        this.picking_buffer = customId;
}

NodesGame.prototype.display = function () {
	this.scene.pushMatrix();
		this.scene.translate(0, 0, 3.05);
		this.scene.rotate(-Math.PI/2, 1, 0, 0);
		
		this.board.display();
		for (var i = 0; i < this.players.length; i++)
		    this.players[i].display();
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

NodesGame.prototype.tryMove = function (from_x, from_y, to_x, to_y) {
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

    this.sendToProlog(this.mode, this.level, this.active_player, this.logicBoard, move, from_x, from_y);
    // It would be good if we could wait for the answer and verify that, because the move can be not possible.
    // If the move was not possible, we should indicate that using console.log().

    this.changePlayer();
}

NodesGame.prototype.changePlayer = function () {
    if (this.active_player == 1)
        this.active_player = 2;
    else if (this.active_player == 2)
        this.active_player = 1;
    else
        console.error("Unexpected change to the player happened: " + this.active_player);
}

NodesGame.prototype.sendToProlog = function (mode /*cc, ch or hh*/, level /*easy or hard*/, player /*p1 or p2*/, board, move, x, y) {
    var requestString;
    if (mode == "cc" || (mode == "ch" && player == 1))
      requestString = "burst_move(c," + level + ",p" + player + "," + JSON.stringify(board) + ")";
    else if (mode == "hh" || (mode == "ch" && player == 2))
      requestString = "rule(h," + move + ",p" + player + "," + x + "," + y + "," + JSON.stringify(board) + ")";

    var this_t = this;
    getPrologRequest(requestString, function (data) {this_t.receiveFromProlog(data)});
}

NodesGame.prototype.receiveFromProlog = function (data) {
    var response = data.target.response;
    if (response != "Invalid Move" && response != "Bad Request" && response != "Syntax Error") {
        response = JSON.parse(response);
        var difference = this.detectDifference(this.logicBoard, response);
        this.history.push(difference);
        this.setLogicBoard(response);
        this.players[this.active_player - 1].updatePieces(this.logicBoard);
    }
    else
        console.error("Not a board received: " + response);
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

    this.updatePickingMode();
}

NodesGame.prototype.updatePickingMode = function () {
    if (this.mode == "cc")
        this.scene.setPickEnabled(false);
    else if (this.mode == "hh")
        this.scene.setPickEnabled(true);
    else if (this.mode == "ch" && this.active_player == 1)
        this.scene.setPickEnabled(false);
    else if (this.mode == "ch" && this.active_player == 2)
        this.scene.setPickEnabled(true);
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
