:- use_module(library(lists)).
:- use_module(library(random)).
:- use_module(server).

/*
Game legend:
- -> road
| -> road
X -> conduits
O -> space -> sp
A -> player 1 node -> n1
B -> player 1 unit -> u1
S -> player 2 node -> n2
T -> player 2 unit -> u2
*/

/* Players */
player(p1).
player(p2).

/* Checks if the Mode is valid, c or h */
check_game_mode(Mode) :-
	(
		(Mode = c; Mode = h);
		(write('Wrong game mode. Please check if you typed correctly the Mode of the Game.\nIt can be: c or h.\n'), fail)
	),
	!.

/* Checks if the Level is valid, easy or hard */
check_game_level(Level) :-
	(
		(Level = easy; Level = hard);
		(write('Wrong game level. Please check if you typed correctly the Level of the Game.\nIt can be: easy or hard.\n'), fail)
	),
	!.

/* Verify if all Rows have the same length */
verify_board_dimensions([Row | Other_rows]) :-
	length(Row, Length),
	verify_board_dimensions_aux(Other_rows, Length).

/* Verify if the all the rows have the same dimension of the first row */
verify_board_dimensions_aux([Row | Other_rows], Length) :-
	length(Row, Length),
	verify_board_dimensions_aux(Other_rows, Length).
verify_board_dimensions_aux([], _Length).

/* Signal functions */

/* Check if the Piece is receiving the signal from a node */
check_signal(Board, Player, Piece_x, Piece_y) :-
	/* Node 1 */
	(
		(
			get_piece(Board, Node1_x, Node1_y, n1),		/* Find the position of the node */
			(
				check_signal_vertical(Piece_x, Piece_y, Node1_x, Node1_y, Signal_direction1);
				check_signal_horizontal(Piece_x, Piece_y, Node1_x, Node1_y, Signal_direction1);
				check_signal_diagonal(Piece_x, Piece_y, Node1_x, Node1_y, Signal_direction1)
			),
			\+ check_enemies_interrupting_signal(Board, Player, Piece_x, Piece_y, Node1_x, Node1_y, Signal_direction1)
		);
	/* Node 2 */
		(
			get_piece(Board, Node2_x, Node2_y, n2),		/* Find the position of the node */
			(
				check_signal_vertical(Piece_x, Piece_y, Node2_x, Node2_y, Signal_direction2);
				check_signal_horizontal(Piece_x, Piece_y, Node2_x, Node2_y, Signal_direction2);
				check_signal_diagonal(Piece_x, Piece_y, Node2_x, Node2_y, Signal_direction2)
			),
			\+ check_enemies_interrupting_signal(Board, Player, Piece_x, Piece_y, Node2_x, Node2_y, Signal_direction2)
		)
	).

/* Check if the Piece is receiving the signal from a Node that is on the same row */
check_signal_horizontal(Piece_x, Piece_y, Node_x, Node_y, Signal_direction) :-
	Node_y = Piece_y,
	Distance is Node_x - Piece_x,
	(
		(Distance > 0, Signal_direction = right);
		(Distance < 0, Signal_direction = left)
	).

/* Check if the Piece is receiving the signal from a Node that is on the same column */
check_signal_vertical(Piece_x, Piece_y, Node_x, Node_y, Signal_direction) :-
	Node_x = Piece_x,
	Distance is Node_y - Piece_y,
	(
		(Distance > 0, Signal_direction = down);
		(Distance < 0, Signal_direction = up)
	).

/* Check if the Piece is receiving the signal from a Node through a conduit */
check_signal_diagonal(Piece_x, Piece_y, Node_x, Node_y, Signal_direction) :-
	X_diference is Node_x - Piece_x,
	Y_diference is Node_y - Piece_y,
	Abs_X_diference is abs(X_diference),
	Abs_Y_diference is abs(Y_diference),
	Abs_X_diference = Abs_Y_diference,
	(
		(X_diference > 0, Y_diference > 0, Signal_direction = diagonal_down_right);
		(X_diference < 0, Y_diference > 0, Signal_direction = diagonal_down_left);
		(X_diference > 0, Y_diference < 0, Signal_direction = diagonal_up_right);
		(X_diference < 0, Y_diference < 0, Signal_direction = diagonal_up_left)
	).

/* Check if the signal from a Node is being blocked by an enemy unit */
check_enemies_interrupting_signal(Board, Player, Piece_x, Piece_y, Node_x, Node_y, Signal_direction) :-
	(
		(
			(Signal_direction = up; Signal_direction = down),
			check_enemies_interrupting_signal_vertical(Board, Player, Piece_x, Piece_y, Node_x, Node_y, Signal_direction)
		);
		(
			(Signal_direction = left; Signal_direction = right),
			check_enemies_interrupting_signal_horizontal(Board, Player, Piece_x, Piece_y, Node_x, Node_y, Signal_direction)
		);
		(
			(Signal_direction = diagonal_down_left; Signal_direction = diagonal_down_right; Signal_direction = diagonal_up_left; Signal_direction = diagonal_up_right),
			check_enemies_interrupting_signal_diagonal(Board, Player, Piece_x, Piece_y, Node_x, Node_y, Signal_direction)
		)
	).

/* Check if the signal from a Node is being blocked by an enemy unit on the same row */
check_enemies_interrupting_signal_horizontal(Board, Player, Piece_x, Piece_y, Other_piece_x, Other_piece_y, Signal_direction) :-
	Piece_x =\= Other_piece_x,
	verify_enemy_unit_player(Board, Player, Other_piece_x, Other_piece_y),
	(
		(
			(Signal_direction = left, Other_piece_x2 is Other_piece_x - 1);
			(Signal_direction = right, Other_piece_x2 is Other_piece_x + 1)
		),
		check_enemies_interrupting_signal_horizontal(Board, Player, Piece_x, Piece_y, Other_piece_x2, Other_piece_y, Signal_direction)
	).

/* Check if the signal from a Node is being blocked by an enemy unit on the same column */
check_enemies_interrupting_signal_vertical(Board, Player, Piece_x, Piece_y, Other_piece_x, Other_piece_y, Signal_direction) :-
	Piece_y =\= Other_piece_y,
	verify_enemy_unit_player(Board, Player, Other_piece_x, Other_piece_y),
	(
		(Signal_direction = up, Other_piece_y2 is Other_piece_y - 1);
		(Signal_direction = down, Other_piece_y2 is Other_piece_y + 1)
	),
	check_enemies_interrupting_signal_vertical(Board, Player, Piece_x, Piece_y, Other_piece_x, Other_piece_y2, Signal_direction).

/* Check if the signal from a Node is being blocked by an enemy unit through a conduit */
check_enemies_interrupting_signal_diagonal(Board, Player, Piece_x, Piece_y, Other_piece_x, Other_piece_y, Signal_direction) :-
	Piece_x =\= Other_piece_x,
	Piece_y =\= Other_piece_y,
	verify_enemy_unit_player(Board, Player, Other_piece_x, Other_piece_y),
	(
		(Signal_direction = diagonal_down_left, Other_piece_y2 is Other_piece_y + 1, Other_piece_x2 is Other_piece_x - 1);
		(Signal_direction = diagonal_down_right, Other_piece_y2 is Other_piece_x + 1, Other_piece_x2 is Other_piece_x + 1);
		(Signal_direction = diagonal_up_left, Other_piece_y2 is Other_piece_y - 1, Other_piece_x2 is Other_piece_x - 1);
		(Signal_direction = diagonal_up_right, Other_piece_y2 is Other_piece_y - 1, Other_piece_x2 is Other_piece_x + 1)
	),
	check_enemies_interrupting_signal_diagonal(Board, Player, Piece_x, Piece_y, Other_piece_x2, Other_piece_y2, Signal_direction).

/* Movement functions */

/* Move up */
rule(move_up, Player, Piece_orig_x, Piece_orig_y, Board, New_board) :-
	Piece_new_y is Piece_orig_y - 1,
	rule_aux(Player, Piece_orig_x, Piece_orig_y, Piece_orig_x, Piece_new_y, Board, New_board).

/* Move down */
rule(move_down, Player, Piece_orig_x, Piece_orig_y, Board, New_board) :-
	Piece_new_y is Piece_orig_y + 1,
	rule_aux(Player, Piece_orig_x, Piece_orig_y, Piece_orig_x, Piece_new_y, Board, New_board).

/* Move left */
rule(move_left, Player, Piece_orig_x, Piece_orig_y, Board, New_board) :-
	Piece_new_x is Piece_orig_x - 1,
	rule_aux(Player, Piece_orig_x, Piece_orig_y, Piece_new_x, Piece_orig_y, Board, New_board).

/* Move right */
rule(move_right, Player, Piece_orig_x, Piece_orig_y, Board, New_board) :-
	Piece_new_x is Piece_orig_x + 1,
	rule_aux(Player, Piece_orig_x, Piece_orig_y, Piece_new_x, Piece_orig_y, Board, New_board).

/* Jump up */
rule(jump_up_enemy_unit, Player, Piece_orig_x, Piece_orig_y, Board, New_board) :-
	Enemy_y is Piece_orig_y - 1,
	Piece_new_y is Piece_orig_y - 2,
	rule_jump_aux(Player, Piece_orig_x, Piece_orig_y, Piece_orig_x, Piece_new_y, Piece_orig_x, Enemy_y, Board, New_board).

/* Jump down */
rule(jump_down_enemy_unit, Player, Piece_orig_x, Piece_orig_y, Board, New_board) :-
	Enemy_y is Piece_orig_y + 1,
	Piece_new_y is Piece_orig_y + 2,
	rule_jump_aux(Player, Piece_orig_x, Piece_orig_y, Piece_orig_x, Piece_new_y, Piece_orig_x, Enemy_y, Board, New_board).

/* Jump left */
rule(jump_left_enemy_unit, Player, Piece_orig_x, Piece_orig_y, Board, New_board) :-
	Enemy_x is Piece_orig_x - 1,
	Piece_new_x is Piece_orig_x - 2,
	rule_jump_aux(Player, Piece_orig_x, Piece_orig_y, Piece_new_x, Piece_orig_y, Enemy_x, Piece_orig_y, Board, New_board).

/* Jump right */
rule(jump_right_enemy_unit, Player, Piece_orig_x, Piece_orig_y, Board, New_board) :-
	Enemy_x is Piece_orig_x + 1,
	Piece_new_x is Piece_orig_x + 2,
	rule_jump_aux(Player, Piece_orig_x, Piece_orig_y, Piece_new_x, Piece_orig_y, Enemy_x, Piece_orig_y, Board, New_board).

/* Auxiliar function to the move functions */
rule_aux(Player, Piece_orig_x, Piece_orig_y, Piece_new_x, Piece_new_y, Board, New_board) :-
	/* Applicability pre-conditions verifications */
	verify_inside_borders(Board, Piece_orig_x, Piece_orig_y),
	verify_inside_borders(Board, Piece_new_x, Piece_new_y),
	verify_piece_player(Board, Player, Piece_orig_x, Piece_orig_y, Piece),
	get_piece(Board, Piece_new_x, Piece_new_y, sp),
	check_signal(Board, Player, Piece_orig_x, Piece_orig_y),
	/* action / movement */
	set_piece(Board, Piece_orig_x, Piece_orig_y, sp, New_board2),
	set_piece(New_board2, Piece_new_x, Piece_new_y, Piece, New_board).

/* Auxiliar function to the jump functions */
rule_jump_aux(Player, Piece_orig_x, Piece_orig_y, Piece_new_x, Piece_new_y, Enemy_x, Enemy_y, Board, New_board) :-
	/* Applicability pre-conditions verifications */
	verify_inside_borders(Board, Piece_orig_x, Piece_orig_y),
	verify_inside_borders(Board, Enemy_x, Enemy_y),
	verify_inside_borders(Board, Piece_new_x, Piece_new_y),
	verify_piece_player(Board, Player, Piece_orig_x, Piece_orig_y, Piece),
	verify_enemy_unit_player(Board, Player, Enemy_x, Enemy_y),
	get_piece(Board, Piece_new_x, Piece_new_y, sp),
	check_signal(Board, Player, Piece_orig_x, Piece_orig_y),
	/* action / movement */
	set_piece(Board, Piece_orig_x, Piece_orig_y, sp, New_board2),
	set_piece(New_board2, Piece_new_x, Piece_new_y, Piece, New_board).

/* Get the symbol on the position [X,Y] of the Board */
get_piece(Board, X, Y, Piece) :-
	nth1(Y, Board, Row),
	nth1(X, Row, Piece).

/* Check if the position [X,Y] is valid / is inside the borders of the Board */
verify_inside_borders(Board, X, Y) :-
	X >= 1,
	Y >= 1,
	length(Board, Length_y),
	Y =< Length_y,
	nth1(1, Board, Row),
	length(Row, Length_x),
	X =< Length_x.

/* Check if the Piece belongs to the Player (Unit or Node) */
verify_piece_player(Board, Player, Piece_x, Piece_y, Piece) :-
	get_piece(Board, Piece_x, Piece_y, Piece),
	((Player = p1, (Piece = u1; Piece = n1)); (Player = p2, (Piece = u2; Piece = n2))).

/* Check if the Piece is an Enemy of the Player (only Unit) */
verify_enemy_unit_player(Board, Player, Enemy_x, Enemy_y) :-
	get_piece(Board, Enemy_x, Enemy_y, Piece),
	((Player = p1, Piece = u2); (Player = p2, Piece = u1)).

/* Calculate a set of possible moves (greedy at each move) */
burst_move(Player, Level, Board, Best) :-
	findall(Aux_coords, find_player_moveable_pieces(Board, Player, Aux_coords), Possible_coords),
	(
		random_member([X, Y], Possible_coords),
		get_piece(Board, X, Y, Piece_to_move),
		best_move(Player, Level, Board, X, Y, New_board),
		(
			(New_board = [], Best = Board);	/* it is not possible to create a better Board */
%			(
%				(Piece_to_move = n1; Piece_to_move = n2),
%				Best = New_board
%			);
%			burst_move(Player, Level, New_board, Best)
			Best = New_board
		)
	),
	!.

/* Find the position of the Player pieces (Units and Nodes) */
find_player_moveable_pieces(Board, Player, [X, Y]) :-
	verify_piece_player(Board, Player, X, Y, Piece),
	verify_not_blocked(Board, X, Y),
	((Piece = n1; Piece = n2); check_signal(Board, Player, X, Y)).	/* 'check_signal' does not check the signal for nodes */

/* Verify if the piece in [X, Y] is blocked by 'sp', i.e., it is not blocked */
verify_not_blocked(Board, X, Y) :-
	(verify_not_blocked_left(Board, X, Y);
	verify_not_blocked_right(Board, X, Y);
	verify_not_blocked_up(Board, X, Y);
	verify_not_blocked_down(Board, X, Y)).

/* Verify if one side of the [X,Y] piece is not blocked by anything (if blocked by 'sp' is free to move) */
/* If 'X2' or 'Y2' out of borders 'no' will be returned, as desired (different from verify_blocked_*) */
verify_not_blocked_left(Board, X, Y) :- X2 is X - 1, get_piece(Board, X2, Y, sp).
verify_not_blocked_right(Board, X, Y) :- X2 is X + 1, get_piece(Board, X2, Y, sp).
verify_not_blocked_up(Board, X, Y) :- Y2 is Y - 1, get_piece(Board, X, Y2, sp).
verify_not_blocked_down(Board, X, Y) :- Y2 is Y + 1, get_piece(Board, X, Y2, sp).

/* Calculate the best move to apply to a specific piece */
best_move(Player, Level, Board, Piece_x, Piece_y, Best) :-
	findall(Aux_board, (rule(_Move, Player, Piece_x, Piece_y, Board, Aux_board)), Possible_boards),
	(
		(
			Level = easy,
			(
				select_best(Player, Possible_boards, Real_best),	/* 'select_best' makes Real_best = [], if Possible_boards = [] */
				(Possible_boards = [], Best = Real_best);	/* Real_best = [] */
				(
					Possible_boards \= [],	/* Real_best \= [] */
					append(La, [Real_best|Lb], Possible_boards),
					append(La, Lb, New_possible_boards),
					select_best(Player, New_possible_boards, Second_best),
					((Second_best = [], Best = Real_best); random_member(Best, [Real_best, Second_best]))
				)
			)
		);
		(Level = hard, select_best(Player, Possible_boards, Best))
	).

/* Select the best board of those presented */
select_best(Player, Possible_boards, Best) :-
	select_best_aux(Player, Possible_boards, [], 100000000000000, Best, _Best_value).	/* dangerous value (upper bound) */

/* Verify if the passed board is better or not than others */
select_best_aux(Player, [Board | Other_boards], Temp_best_board, Temp_best_value, Best_board, Best_value) :-
	quality(Board, Player, Value),
	(
		(Value =< Temp_best_value,
		Temp_best_value2 is Value,
		Temp_best_board2 = Board);
		(Value > Temp_best_value,
		Temp_best_value2 is Temp_best_value,
		Temp_best_board2 = Temp_best_board)
	),
	select_best_aux(Player, Other_boards, Temp_best_board2, Temp_best_value2, Best_board, Best_value).
select_best_aux(_, [], Best_board, _, Best_board, _).


/* Calculate the sum of the distances of all the Units of the Player regarding the enemy Node */
quality(Board, Player, Value) :-
	global_check_signal(Board, Player, Num_signal),	/* number of Player Units with signal */
	length(Board, Length_y),
	((Player = p1, Enemy_node = n2, My_unit = u1); (Player = p2, Enemy_node = n1, My_unit = u2)),
	get_piece(Board, Node_x, Node_y, Enemy_node),
	quality_aux_1(Board, My_unit, Length_y, Node_x, Node_y, 0, Sum_distances),
	Value is Sum_distances / Num_signal.

/* Calculate the distances desired by 'quality' row by row */
quality_aux_1(Board, Piece, Y, Node_x, Node_y, Temp_distance, Sum_distances) :-
	Y >= 1,
	nth1(Y, Board, Row),
	length(Row, Length_x),
	quality_aux_2(Row, Piece, Length_x, Y, Node_x, Node_y, 0, Temp_distance2),
	Y2 is Y - 1,
	Temp_distance3 is Temp_distance + Temp_distance2,
	quality_aux_1(Board, Piece, Y2,  Node_x, Node_y, Temp_distance3, Sum_distances).
quality_aux_1(_Board, _Piece, 0, _Node_x, _Node_y, Sum_distances, Sum_distances).

/* Calculate the distances desired by 'quality_aux_1' piece by piece */
quality_aux_2(Row, Piece, X, Y, Node_x, Node_y, Temp_distance, Sum_distances) :-
	X >= 1,
	(
		(
			nth1(X, Row, Piece),
			X_distance is Node_x - X,
			Y_distance is Node_y - Y,
			Abs_X_distance is abs(X_distance),
			Abs_Y_distance is abs(Y_distance),
			Temp_distance2 is Abs_X_distance + Abs_Y_distance
		);
		(
			\+ nth1(X, Row, Piece),
			Temp_distance2 = 0
		)
	),
	X2 is X - 1,
	Temp_distance3 is Temp_distance + Temp_distance2,
	quality_aux_2(Row, Piece, X2, Y, Node_x, Node_y, Temp_distance3, Sum_distances).
quality_aux_2(_Row, _Piece, 0, _Y, _Node_x, _Node_y, Sum_distances, Sum_distances).

/* Calculate the number of units of the Player with signal */
global_check_signal(Board, Player, Quantity) :-
	length(Board, Length_y),
	global_check_signal_aux_1(Board, Player, Length_y, 0, Quantity),
	!.

/* Calculate the number of units of the Player with signal (row by row) */
global_check_signal_aux_1(Board, Player, Y, Temp_quantity, Quantity) :-
	Y >= 1,
	nth1(Y, Board, Row),
	length(Row, Length_x),
	global_check_signal_aux_2(Board, Player, Length_x, Y, 0, Temp_quantity2),
	Temp_quantity3 is Temp_quantity + Temp_quantity2,
	Y2 is Y - 1,
	global_check_signal_aux_1(Board, Player, Y2, Temp_quantity3, Quantity).
global_check_signal_aux_1(_, _, 0, Quantity, Quantity).

/* Calculate the number of units of the Player with signal (cell by cell) */
global_check_signal_aux_2(Board, Player, X, Y, Temp_quantity, Quantity) :-
	X >= 1,
	((check_signal(Board, Player, X, Y), Temp_quantity2 is Temp_quantity + 1); (Temp_quantity2 is Temp_quantity)),
	X2 is X - 1,
	global_check_signal_aux_2(Board, Player, X2, Y, Temp_quantity2, Quantity).
global_check_signal_aux_2(_, _, 0, _, Quantity, Quantity).

/* Verify if the Board inside 'state' is completly played */
verify_game_over(Board) :-
	get_piece(Board, X, Y, Node),
	verify_blocked(Board, Node, X, Y).

/* Verify if a Node is surround by enemy pieces */
verify_blocked(Board, Node, X, Y) :-
	((Node = n1, Enemy_unit = u2, Enemy_node = n2); (Node = n2, Enemy_unit = u1, Enemy_node = n1)),
	(verify_blocked_left(Board, Enemy_unit, X, Y); verify_blocked_left(Board, Enemy_node, X, Y)),
	(verify_blocked_right(Board, Enemy_unit, X, Y); verify_blocked_right(Board, Enemy_node, X, Y)),
	(verify_blocked_up(Board, Enemy_unit, X, Y); verify_blocked_up(Board, Enemy_node, X, Y)),
	(verify_blocked_down(Board, Enemy_unit, X, Y); verify_blocked_down(Board, Enemy_node, X, Y)).

/* Verify if one side of the [X,Y] piece is blocked by an Enemy_piece */
/* If 'X2' or 'Y2' out of borders 'yes' will be returned, as desired (different from verify_not_blocked_*) */
verify_blocked_left(Board, Enemy_piece, X, Y) :- X2 is X - 1, (X2 < 1; (nth1(Y, Board, Row), nth1(X2, Row, Enemy_piece))).
verify_blocked_right(Board, Enemy_piece, X, Y) :- X2 is X + 1, (nth1(Y, Board, Row), length(Row, Length_x), (X2 > Length_x; nth1(X2, Row, Enemy_piece))).
verify_blocked_up(Board, Enemy_piece, X, Y) :- Y2 is Y - 1, (Y2 < 1; (nth1(Y2, Board, Row), nth1(X, Row, Enemy_piece))).
verify_blocked_down(Board, Enemy_piece, X, Y) :- Y2 is Y + 1, length(Board, Length_y), (Y2 > Length_y; (nth1(Y2, Board, Row), nth1(X, Row, Enemy_piece))).

/* Change a piece of the Board, remaking it row by row */
/* If 'Y' is invalid, the same list will be returned */
set_piece([Row | Other_rows], X, Y, New_piece, [Row | Other_new_rows]) :-
	Y =\= 1,
	Next_Y is Y - 1,
	set_piece(Other_rows, X, Next_Y, New_piece, Other_new_rows).
set_piece([Row | Other_rows], X, 1, New_piece, [New_row | Other_new_rows]) :-
	set_cell(X, New_piece, Row, New_row),
	set_piece(Other_rows, X, 0, New_piece, Other_new_rows).
set_piece([], _X, _Y, _New_piece, []).

/* Change a piece of the Row, remaking it cell by cell */
/* If 'X' is invalid, the same list will be returned */
set_cell(X, New_piece, [Piece | Rest_row], [Piece | Rest_new_row]) :-
	X =\= 1,
	Next_X is X - 1,
	set_cell(Next_X, New_piece, Rest_row, Rest_new_row).
set_cell(1, New_piece, [_Piece | Rest_row], [New_piece | Rest_new_row]) :-
	set_cell(0, New_piece, Rest_row, Rest_new_row).
set_cell(_X, _New_piece, [], []).
