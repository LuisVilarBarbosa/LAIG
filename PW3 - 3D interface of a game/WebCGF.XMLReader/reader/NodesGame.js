/**
 * NodesGame
 * @constructor
 */
function NodesGame() {
    this.mode = "c";
    this.level = "hard";
    this.player = "p1";

    // to see the meaning of each value, consult the 'server.pl' file
    this.board = [
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
};

NodesGame.prototype.setMode = function (mode) {
    if (mode == "c" || mode == "h")
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

NodesGame.prototype.setBoard = function (board) {
    this.board = board;
}

NodesGame.prototype.makeMove = function (mode, from_x, from_y, to_x, to_y) {
    var move;

    if (mode == "h") {
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

    this.sendToProlog(this.mode, this.level, this.player, this.board);
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

NodesGame.prototype.sendToProlog = function (mode /*c or h*/, level /*easy or hard*/, player /*p1 or p2*/, board, move, x, y) {
    var requestString;
    if(mode == "c")
      requestString = "burst_move(" + mode + "," + level + "," + player + "," + JSON.stringify(board) + ")";
    else if(mode == "h")
      requestString = "rule(" + mode + "," + move + "," + player + "," + x + "," + y + "," + JSON.stringify(board) + ")";

    getPrologRequest(requestString, this.receiveFromProlog);
}

NodesGame.prototype.receiveFromProlog = function (data) {
    // this.setBoard(data.target.response); // doesn't recognise 'this', apparently, due to asynchronous access
    console.warn("Game board not updated due to implementation problem not solved.");
    console.log("Received board:" + data.target.response);
}
