/**
 * NodesGame
 * @constructor
 */
function NodesGame(scene) {
	this.scene = scene;

    // to see the meaning of each value, consult the 'server.pl' file
    this.initialLogicBoard = [
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
    this.logicBoard = this.initialLogicBoard;
	
	this.board = new MyNodesBoard(this.scene);
	this.players = [new MyPlayer(this.scene, 1, this.logicBoard), new MyPlayer(this.scene, 2, this.logicBoard)];
	this.active_player = 1;
	this.picking_buffer = 0;
	this.waitingProlog = false;
	this.history = [];  // to undo and movie
	
	this.scenes = [new MySnowScene(this.scene), new MyEgyptScene(this.scene), new MyOuterSpaceScene(this.scene)];

	this.mode = "hh";   // in the "ch" mode, the computer is considered the player 1 and the human is considered the player 2
	this.level = "hard";
	this.timer = 0;
	this.player1Score = 0;
	this.player2Score = 0;
	this.setScorer();
	this.maxMoveTime = 300;  // maximum time to make a move
	this.selectScene = 0;
	this.setMessage();
	this.undo = false;
	this.reset = false;
	this.movie = false;
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
	
	if (this.selectScene != 0)
	    this.scenes[this.selectScene - 1].display();
}

NodesGame.prototype.changePlayer = function () {
    this.active_player = this.active_player /*- 1 + 1*/ % this.players.length + 1;
    this.setMessage();
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

NodesGame.prototype.setScorer = function () {
    this.scorer = this.player1Score + " / " + this.player2Score;
}

NodesGame.prototype.setMessage = function (m) {
    if (m === undefined)
        this.message = "p" + this.active_player;
    else
        this.message = "p" + this.active_player + " : " + m;
}

NodesGame.prototype.tryMove = function (from_x, from_y, to_x, to_y) {
    var requestString, move;

    if (this.mode == "cc" || (this.mode == "ch" && this.active_player == 1))
        requestString = "burst_move(c," + this.level + ",p" + this.active_player + "," + JSON.stringify(this.logicBoard) + ")";
    else if (this.mode == "hh" || (this.mode == "ch" && this.active_player == 2)) {
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
            this.setMessage("Invalid move");
            return;
        }
        requestString = "rule(h," + move + ",p" + this.active_player + "," + from_x + "," + from_y + "," + JSON.stringify(this.logicBoard) + ")";
    }

    // The move can still be not possible, but that will be verified by the Prolog and indicated to 'receiveFromProlog'.
    this.sendToProlog(requestString);
}

NodesGame.prototype.sendToProlog = function (requestString) {
    this.waitingProlog = true;
    var this_t = this;
    getPrologRequest(requestString, function (data) {this_t.receiveFromProlog(data)});
}

NodesGame.prototype.receiveFromProlog = function (data) {
    this.applyMove(data.target.response);
    this.waitingProlog = false;
}

// This function simulates, if necessary, what the Prolog 'burstMove' predicate was doing
NodesGame.prototype.applyMove = function (response) {
    if (response != "Invalid move (wrong piece?)" && response != "Bad Request" && response != "Syntax Error") {
        response = JSON.parse(response);
        var difference = this.detectDifference(this.logicBoard, response);
        // In a computer move he can return no move causing problems with the return of 'detectDifference' (see prolog 'burstMove').
        // This is caused because no better board was generated, so the same was returned.
        if (difference["oldPos"] === undefined || difference["newPos"] === undefined)
            this.changePlayer();
        else {
            this.history.push(difference);
            this.updateBoards(response);
            var changedPiece = this.getPiece(difference["newPos"]);
            if (changedPiece == 1 || changedPiece == 3) // nodes
                this.changePlayer();    // end of player set of moves
        }
        this.setMessage();  // update player
    }
    else {
        this.setMessage(response);
        console.log("Not a board received: " + response);
    }
}

NodesGame.prototype.updateBoards = function (logicBoard) {
    this.logicBoard = logicBoard;
    for (var i = 0; i < this.players.length; i++)
        this.players[i].updatePieces(this.logicBoard);
}

NodesGame.prototype.update = function (currTime) {
    this.firstTime = this.firstTime || currTime;
    var deltaTime = (currTime - this.firstTime) / 1000;
    this.timer = deltaTime;
    this.setScorer(this.player1Score, this.player2Score);

    this.updatePickingMode();

    // limit player game time
    if (deltaTime > this.maxMoveTime && !this.waitingProlog) {
        this.firstTime = currTime;
        this.timer = 0;
        this.changePlayer();
    }

    if (!this.waitingProlog && (this.mode == "cc" || this.mode == "ch" && this.active_player == 1))
        this.tryMove(); // computer move

    if (this.undo) {
        if (this.history.length > 0) {
            var difference = this.history[this.history.length - 1];
            this.history.pop();
            var xy1 = difference["oldPos"];
            var xy2 = difference["newPos"];
            this.movePiece(xy2, xy1);
        }
        this.undo = false;
    }

    if (this.reset) {
        this.firstTime = currTime;
        this.timer = 0;
        while (this.active_player != 1)
            this.changePlayer();
        this.updateBoards(this.initialLogicBoard);
        this.reset = false;
    }

    if (this.movie)
        this.showMovie();
}

NodesGame.prototype.updatePickingMode = function () {
    if (this.movie)
        this.scene.setPickEnabled(false);
    else if (this.mode == "cc")
        this.scene.setPickEnabled(false);
    else if (this.mode == "hh")
        this.scene.setPickEnabled(true);
    else if (this.mode == "ch" && this.active_player == 1)
        this.scene.setPickEnabled(false);
    else if (this.mode == "ch" && this.active_player == 2)
        this.scene.setPickEnabled(true);
}

NodesGame.prototype.showMovie = function () {
    this.moviePoint = this.moviePoint || 0;
    if (this.moviePoint >= this.history.length) {
        this.movie = false;
        this.moviePoint = 0;
    }
    else if (!this.waitingProlog) {
        if (this.moviePoint == 0)
            this.updateBoards(this.initialLogicBoard);
        var xy1 = this.history[this.moviePoint]["oldPos"];
        var xy2 = this.history[this.moviePoint]["newPos"];
        this.movePiece(xy1, xy2);
        this.moviePoint++;
    }
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
                    changes["oldPos"] = [x + 1, y + 1];
                else
                    changes["newPos"] = [x + 1, y + 1];
            }
    }
    return changes;
}

NodesGame.prototype.movePiece = function (from, to) {
    var from_x = from[0] - 1;
    var from_y = from[1] - 1;
    var to_x = to[0] - 1;
    var to_y = to[1] - 1;
    var piece = this.logicBoard[from_y][from_x];
    this.logicBoard[from_y][from_x] = 0;  // empty cell
    this.logicBoard[to_y][to_x] = piece;
    this.updateBoards(this.logicBoard);
}

NodesGame.prototype.getPiece = function (pos) {
    var pos_x = pos - 1;
    var pos_y = pos[1] - 1;
    return this.logicBoard[pos_y][pos_x];
}
