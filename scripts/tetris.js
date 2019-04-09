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

		//figures
		this.figures = [];
		this.initFigures(config.figures);

		this.directions = {
			'right': {x:1, y:0},
			'left': {x:-1, y:0},
			'down': {x:0, y:1},
			'up': {x:0, y:-1}
		};

		this.check_coordinates = {
			'x': this.cells_horizontal,
			'y': this.cells_vertical,
			'z': this.cells_height
		};
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
			if ( acttion_name == 'rotate_z') scope.rotateBy('x', 'z');
			if ( acttion_name == 'pause') scope.setPause();
			if ( acttion_name == 'fall') scope.dropFigure();
			var direction = scope.directions[acttion_name];
			if ( direction )  {
				if ( scope.current_action != acttion_name ) clearInterval(scope.moveFigureInterval);
				scope.current_action = acttion_name;
				scope.moveFigureInterval = setInterval(function(){scope.moveFigureByDirection(direction)}, 50);
			}
		});

		this.inputController.target.addEventListener( inputController.ACTION_DEACTIVATED, function (e) {
			var name = e.detail.name;
			if ( name == 'acceleration') scope.accelerateMoving(false);
			if ( scope.current_action == name ) clearInterval(scope.moveFigureInterval);
		});
	}

	initFigures(figures) {
		var scope = this;
		for ( var figure in figures ) {
			var shape = [];
			var new_figure = figures[figure].split('|');
			new_figure.forEach( function( el, i ) {
				var new_row_elements = el.split(';');
				new_row_elements.forEach( function ( row_el, j) {
					var pivot = false;
					if (row_el.substr(-1) == '*') pivot = true;
					shape.push({x: +row_el[0], y: +row_el[2], z: i, pivot: pivot})
				})

			});
			this.figures.push({name: figure, shape: shape })
		}
	}

	testMove(dx,dy,dz) {
		var x_array = this.figure.shape.map(function(dot) { return dot.x; });
		var y_array = this.figure.shape.map(function(dot) { return dot.y; });
		row:
		for ( var z = this.lines.length - 1; z >= 0 ; z--) {
			var row = this.lines[z];
			for (var x = 0; x < x_array.length; x++)
				for ( var y = 0; y < y_array.length; y++) {
					if ( row[ x_array[x] + dx ] == undefined || row[ x_array[x] + dx ][ y_array[y] + dy ] == undefined) return false;
					if ( row[ x_array[x] + dx ][ y_array[y] + dy ] ) continue row;
				}
			return z; 
		}
		return false;
	}

	dropFigure() {
		var needed_line = this.testMove(0,0);
		var max_z = Math.max.apply(Math, this.figure.shape.map(function(x) { return x.z; }));
		for ( var i = 0; i < this.figure.shape.length; i++) {
			var dot = this.figure.shape[i];
			dot.z += needed_line - max_z;
		}
		Utils.triggerCustomEvent( window, this.FIGURE_MOVED );
	}

	moveFigureByDirection(direction) {
		if ( this.testMove (direction.x, direction.y)) {
			for ( var i = 0; i < this.figure.shape.length; i++) {
				var dot = this.figure.shape[i];
				dot.x += direction.x;
				dot.y += direction.y;
			}
		}
		Utils.triggerCustomEvent( window, this.FIGURE_MOVED );
	}

	checkCoordinatesArentFill(x,y,z) {
		return this.lines[z][x][y];
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
		for ( var i = 0; i < this.figure.shape.length; i++ ) {
			var dot = this.figure.shape[i];
			pivot:
			for (var j = 0; j < this.figure.shape.length; j++ ) {
				var cur_dot = this.figure.shape[j]
				if ( cur_dot.pivot ) {
					pivot = cur_dot;
					break pivot;
				}
			}
			if ( dot.pivot ) continue;
  
			var diff_first_parameter = pivot[f_rotation_parameter] - dot[f_rotation_parameter];
			var diff_second_parameter = pivot[s_rotation_parameter] - dot[s_rotation_parameter];

			var f_value = dot[s_rotation_parameter] + (diff_second_parameter == 0 ? -diff_first_parameter : diff_second_parameter);
			var s_value = dot[f_rotation_parameter] + (diff_first_parameter == 0 ? diff_second_parameter : diff_first_parameter);
			if ( f_value < 0 || f_value >= this.check_coordinates[s_rotation_parameter] || s_value < 0 || s_value >= this.check_coordinates[f_rotation_parameter] ) return;
			// if (this.checkCoordinatesArentFill(new_x, new_y, dot.z)) return; 
			new_values[i] = { s_rotation_parameter : f_value, f_rotation_parameter: s_value};
		}

		for ( var i = 0; i < this.figure.shape.length; i++ ) {
			var dot = this.figure.shape[i];
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
			this.logic_step_interval -= 15;
			this.points += 5;
			Utils.triggerCustomEvent( window, this.LINE_IS_FULL, {line_number: i} );
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

		for ( var i = this.figure.shape.length - 1; i >= 0; i-- ) {
			var dot = this.figure.shape[i];
			if ( dot.z >= (scope.cells_height - 1) || scope.lines[dot.z + 1][dot.x][dot.y] ) {
				scope.figure_on_finish = true;
				if (dot.z <= 3) {
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
		this.figure.shape.forEach(function(dot,i) {
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
		// return JSON.parse(JSON.stringify(this.figures[4]));
	}
}