class Tetris {

	constructor( config, inputController, ) {

		this.FIGURE_MOVED = 'tetris: figure_moved';
		this.FIGURE_ON_FINISH = 'tetris: figure_on-finish';
		this.GAME_IS_OVER = 'tetris: game_is_over';
		this.LINE_IS_FULL = 'tetris: line_is_full';

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
		this.initLines();


		//figures
		this.figures = [
			{name: 'rectangle',
			dots: [{ x: 0, y: 0, z: 0 },{ x: 0, y: 0, z: 1, pivot: true },{ x: 0, y: 0, z: 2 },{ x: 0, y: 0, z: 3 }
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


		//   HANDLERS
		var scope = this;
		window.addEventListener( "screens: start game" , function () {
		  scope.startGame();
		});

		this.inputController.target.addEventListener( inputController.ACTION_ACTIVATED, function (e) {
			if ( e.detail.name == 'acceleration') scope.accelerateMoving(true);
			if ( e.detail.name == 'rotate_x') scope.rotateBy('x', 'y');
			if ( e.detail.name == 'rotate_y') scope.rotateBy('z', 'y');
			if ( e.detail.name == 'rotate_z') scope.rotateBy('z', 'x');
			if ( e.detail.name == 'fall') scope.dropFigure();
			scope.direction = scope.directions[e.detail.name];
		});

		this.inputController.target.addEventListener( inputController.ACTION_DEACTIVATED, function (e) {
			if ( e.detail.name == 'acceleration') scope.accelerateMoving(false);
		});
	}

	accelerateMoving(is_accelerate) {
		if ( is_accelerate ) this.logic_step_interval = 40;
		else this.logic_step_interval = this.config.logic_step_interval;
	}


	dropFigure() {
		for ( var i = 0; i < this.lines.length; i++ ) {
			var line = this.lines[i];
			for ( var j = 0; j < line.length; j++ ) {
				var row = line[j];
				for ( var k = 0; k < row.length; k++ ){
					var cell = row[k]
				}
			}
		}
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
		this.inputController.enabled = true;
		// this.resetGameField();

		if(!this.gameStep){

			this.gameStep = function(){
				// schedule the next game step
				scope.game_timeout = setTimeout( scope.gameStep, scope.logic_step_interval );
				if ( scope.pause ) return;

				scope.moveFigure(scope.direction);
				scope.direction = undefined;

				if ( scope.figure_on_finish ) {
					scope.figure_on_finish = false;
					scope.figure = scope.getNewFigureData();
					scope.removeFullLines();
					Utils.triggerCustomEvent( window, scope.FIGURE_ON_FINISH );
				}

				if(scope.game_is_over) {
					scope.game_is_over = false;
					scope.gameOver();
					return;
				}
				// redraw
				Utils.triggerCustomEvent( window, scope.FIGURE_MOVED );
			};
		}
		this.gameStep();
	}

	rotateBy(f_rotation_parameter, s_rotation_parameter) {
		var pivot;
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
			dot[s_rotation_parameter] += diff_second_parameter == 0 ? -diff_first_parameter : diff_second_parameter;
			dot[f_rotation_parameter] += diff_first_parameter == 0 ? diff_second_parameter : diff_first_parameter;
		}

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
			for ( var j = i; j >= 0; j-- ) {
				if ( j == 0 ) {
					this.lines[j] = this.empty_line;
					break;
				}
				this.lines[j] = this.lines[j-1];
			}
		}
	}

	moveFigure(direction) {
		var scope = this;
		if ( direction ) {
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
		}

		for ( var i = this.figure.dots.length - 1; i >= 0; i-- ) {
			var dot = this.figure.dots[i];
			if ( dot.z >= (scope.cells_height - 1) || scope.lines[dot.z + 1][dot.x][dot.y] ) {
				scope.figure_on_finish = true;
				if (dot.z < 3) {
					scope.game_is_over = true;
				}
				break;
			}
			dot.z++;
		}

		if ( this.figure_on_finish ) {
			this.figure.dots.forEach(function(dot,i) {
				scope.lines[dot.z][dot.x][dot.y] = true;
			});
		}
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