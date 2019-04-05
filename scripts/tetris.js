//вращение z фигуры
class Tetris {

	constructor( config, inputController, ) {

		this.FIGURE_MOVED = 'tetris: figure_moved';
		this.FIGURE_ON_FINISH = 'tetris: figure_on-finish';
		this.GAME_IS_OVER = 'tetris: game_is_over';
		this.LINE_IS_FULL = 'tetris: line_is_full';
		this.GET_POINT = 'tetris:get_point';
		this.PAUSE = 'tetris:pause';

		this.inputController = inputController;
		this.config = config;

		this.cells_horizontal = config.cells_horizontal;
		this.cells_vertical = config.cells_vertical;
		this.cells_height = config.cells_height;

		this.field_width = config.field_width;
		this.field_height = config.field_height;

		this.cell_width = config.cell_width;
		this.cell_height = config.cell_height;

		this.logic_step_interval = config.logic_step_interval;
		inputController.enabled = false;

		//lines


		//figures
		this.figures = [
			{name: 'rectangle',
			dots: [{ x: 0, y: 0, z: 0 },{ x: 1, y: 0, z: 0, pivot: true },{ x: 2, y: 0, z: 0 },{ x: 3, y: 0, z: 0 }
			]}, 
			{name: 'square',
			dots: [{ x: 0, y: 0, z: 0 },{ x: 1,  y: 0, z: 0 , pivot: true }, { x: 0, y: 0, z: 1 }, { x: 1, y: 0, z: 1 }
			]}, 
			{name:'l-left',
			dots: [{ x: 1, y: 0, z: 0 }, { x: 1, y: 0, z: 1 }, { x: 0, y: 0, z: 2 }, { x: 1, y: 0 , z: 2, pivot: true}
			]}, 
			{name:'l-right',
			dots: [{ x: 0, y: 0, z: 0 }, { x: 0, y: 0 , z: 1}, { x: 0, y: 0, z: 2, pivot: true }, { x: 1, y: 0, z: 2 }
			]},
			{name: 'stairs-left',
			dots: [{ x: 0, y: 0, z: 0 }, { x: 1, y: 0, z: 0, pivot: true },{ x: 1, y: 0 , z: 1}, { x: 2, y: 0, z: 1 }
			]}, 
			{name: 'stairs-right',
			dots: [{ x: 1, y: 0, z: 0 }, { x: 2, y: 0, z: 0, pivot: true },{ x: 1, y: 0, z: 1 }, { x: 0, y: 0, z: 1 }
			]}, 
			{name: 't-shape',
			dots: [{ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 1, pivot: true }, { x: 1, y: 0, z: 1 },{ x: 0, y: 0, z: 2 }
			]}
		];

		this.directions = {};
		this.directions['right']  = {x:1, y:0};
		this.directions['left'] = {x:-1, y:0};
		this.directions['down'] = {x:0, y:1};
		this.directions['up'] = {x:0, y:-1};

		this.check_coordinates = {};
		this.check_coordinates['x'] = this.cells_horizontal;
		this.check_coordinates['y'] = this.cells_vertical;
		this.check_coordinates['z'] = this.cells_height;


		//   HANDLERS
		var scope = this;
		window.addEventListener( "screens: start game" , function () {
			scope.initLines();
		  scope.startGame();
		});

		window.addEventListener( "screens: game paused" , function () {
		  scope.setPause();
		});

		this.inputController.target.addEventListener( inputController.ACTION_ACTIVATED, function (e) {
			var acttion_name = e.detail.name;
			if ( acttion_name == 'acceleration') scope.accelerateMoving(true);
			if ( acttion_name == 'rotate_x') scope.rotateBy('x', 'y');
			if ( acttion_name == 'rotate_y') scope.rotateBy('z', 'y');
			if ( acttion_name == 'rotate_z') scope.rotateBy('z', 'x');
			if ( acttion_name == 'pause') scope.setPause();
			if ( acttion_name == 'fall') scope.dropFigure();
			var direction = scope.directions[acttion_name];
			if ( direction ) scope.moveFigureByDirection(direction)
		});

		this.inputController.target.addEventListener( inputController.ACTION_DEACTIVATED, function (e) {
			if ( e.detail.name == 'acceleration') scope.accelerateMoving(false);
		});
	}

	dropFigure() {
		/*
			определеяем какие x y заняты фигурой
			проходимся по всем линиям где х и у совпадаю
		*/

		// var scope = this;
		// var needed_line;

		// var max_z = Math.max.apply(Math, this.figure.dots.map(function(x) { return x.z; }));

		// line:
		// for ( var i = this.lines.length - 1; i >= 0; i--) {
		// 	var line = this.lines[i];
		// 	row:
		// 	for ( var j = 0; j < line.length; j++ ) {
		// 		var row = line[j];
		// 		for ( var k = 0; k < row.length; k++ ){
		// 			var cell = row[k];
		// 			for ( var c = 0; c < this.figure.dots.length; c++) {
		// 				var elem = this.figure.dots[c];
		// 				if ( elem.x != j || elem.y != k) continue row;
		// 				if ( cell ) continue line;
		// 			}
		// 		}
		// 	}
		// 	needed_line = i;
		// 	break;
		// }
		// for ( var i = 0; i < this.figure.dots.length; i++) {
		// 	var dot = this.figure.dots[i];
		// 	dot.z += needed_line - max_z;
		// }
		// this.fillLine();
		// Utils.triggerCustomEvent( window, scope.FIGURE_MOVED );
	}

	moveFigureByDirection(direction) {
		var correct_action = true;
		for ( var i = 0; i < this.figure.dots.length; i++) {
			var dot = this.figure.dots[i];
			var new_x = dot.x + direction.x;
			var new_y = dot.y + direction.y;
			if ( new_x < 0 || new_x >= this.cells_horizontal || new_y < 0 || new_y >= this.cells_vertical) correct_action = false;
		}
		if ( correct_action) {
			for ( var i = 0; i < this.figure.dots.length; i++) {
				var dot = this.figure.dots[i];
				dot.x += direction.x;
				dot.y += direction.y;
			}
		}
		Utils.triggerCustomEvent( window, this.FIGURE_MOVED );
	}

	setPause() {
		this.on_pause = this.on_pause ? false : true;
		Utils.triggerCustomEvent( window, this.PAUSE, {on_pause: this.on_pause} );
	}

	accelerateMoving(is_accelerate) {
		if ( is_accelerate ) this.logic_step_interval = 40;
		else this.logic_step_interval = this.config.logic_step_interval;
	}

	initLines() {
		this.lines = [];
		for ( var k = 0; k < this.cells_height; k++ ){
			var line = [];
			for ( var i = 0; i < this.cells_horizontal; i++){
				line.push([])
				for ( var j = 0; j < this.cells_vertical; j++) {
					//информация о заполненности ячейки
					line[i][j] = false;
				}
			}
			if ( !this.empty_line ) this.empty_line = line;
			this.lines.push(line);
		}
	}

	startGame() {
		var scope = this;
		this.figure = this.getNewFigureData();
		this.figure_on_finish = false;
		this.points = 0;
		this.on_pause = false;
		this.inputController.enabled = true;
		this.logic_step_interval = this.config.logic_step_interval;

		if(!this.gameStep){

			this.gameStep = function(){
				// schedule the next game step
				scope.game_timeout = setTimeout( scope.gameStep, scope.logic_step_interval );

				if ( scope.on_pause ) return;

				scope.moveFigure(scope.direction);
				scope.direction = undefined;
				
				if(scope.game_is_over) {
					scope.game_is_over = false;
					scope.gameOver();
					return;
				}

				if ( scope.figure_on_finish ) {
					scope.figure_on_finish = false;
					scope.figure = scope.getNewFigureData();
					Utils.triggerCustomEvent( window, scope.FIGURE_ON_FINISH );
					scope.removeFullLines();
				}

				// redraw
				Utils.triggerCustomEvent( window, scope.FIGURE_MOVED );
			};
		}
		this.gameStep();
	}

	rotateBy(f_rotation_parameter, s_rotation_parameter) {
		var pivot;
		var new_values = []
		for ( var i = 0; i < this.figure.dots.length; i++ ) {
			var dot = this.figure.dots[i];
			pivot:
			for (var j = 0; j < this.figure.dots.length; j++ ) {
				var cur_dot = this.figure.dots[j]
				if ( cur_dot.pivot ) {
					pivot = cur_dot;
					break pivot;
				}
			}
			if ( pivot == undefined ) return;
			if ( dot.pivot ) continue;

			var diff_first_parameter = pivot[f_rotation_parameter] - dot[f_rotation_parameter];
			var diff_second_parameter = pivot[s_rotation_parameter] - dot[s_rotation_parameter];
			var f_value = dot[s_rotation_parameter] + (diff_second_parameter == 0 ? -diff_first_parameter : diff_second_parameter);
			var s_value = dot[f_rotation_parameter] + (diff_first_parameter == 0 ? diff_second_parameter : diff_first_parameter);
			if ( f_value < 0 || f_value >= this.check_coordinates[s_rotation_parameter] || s_value < 0 || s_value >= this.check_coordinates[f_rotation_parameter] ) return;
			new_values[i] = { s_rotation_parameter : f_value, f_rotation_parameter: s_value};
		}

		for ( var i = 0; i < this.figure.dots.length; i++ ) {
			var dot = this.figure.dots[i];
			if ( dot.pivot ) continue;
		  dot[s_rotation_parameter] = new_values[i].s_rotation_parameter;
      dot[f_rotation_parameter] = new_values[i].f_rotation_parameter;
		}
		Utils.triggerCustomEvent( window, this.FIGURE_MOVED );
	}

	removeFullLines() {
		line:
		for ( var i = 0; i < this.lines.length; i++ ) {
			var line = this.lines[i];
			for ( var j = 0; j < line.length; j++){
				var row = line[j];
				for ( var k = 0; k < row.length; k++) {
					if ( !row[k] ) continue line;
				}
			}
			Utils.triggerCustomEvent( window, this.LINE_IS_FULL, {line_number: i} );
			this.points += 5;
			Utils.triggerCustomEvent( window, this.GET_POINT );

			for ( var j = i; j >= 0; j-- ) {
				if ( j == 0 ) {
					this.lines[j] = this.empty_line;
					break;
				}
				this.lines[j] = this.lines[j-1];
			}
		}
	}

	moveFigure() {
		var scope = this;

		for ( var i = this.figure.dots.length - 1; i >= 0; i-- ) {
			var dot = this.figure.dots[i];
			if ( dot.z >= (scope.cells_height - 1) || scope.lines[dot.z + 1][dot.x][dot.y] ) {
				scope.figure_on_finish = true;
				if (dot.z <= 2) {
					scope.game_is_over = true;
				}
				break;
			}
			dot.z++;
		}

		if ( this.figure_on_finish ) {
			this.fillLine();
		}
	}

	fillLine() {
		var scope = this;
		this.figure.dots.forEach(function(dot,i) {
			scope.lines[dot.z][dot.x][dot.y] = true;
		});
	}


	gameOver(){
		clearTimeout( this.game_timeout );
		this.inputController.enabled = false;

		Utils.triggerCustomEvent( window, this.GAME_IS_OVER );
	}

	getNewFigureData() {
		return JSON.parse(JSON.stringify(this.figures[~~( Math.random() * 7)]));
		// return JSON.parse(JSON.stringify(this.figures[1]));
	}
}