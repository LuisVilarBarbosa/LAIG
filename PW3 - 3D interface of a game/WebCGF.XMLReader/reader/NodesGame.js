/**
 * NodesGame
 * @constructor
 */
function NodesGame() {
    this.mode = "cc";
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

NodesGame.prototype.setBoard = function (board) {
    this.board = board;
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
    var response = data.target.response;
    if (response != "Bad Request" && response != "Syntax Error")
      this.setBoard(response);
    else
      console.error("Not a board received.");
}
