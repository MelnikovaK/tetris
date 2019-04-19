class Tetris { 

	constructor( config, inputController, ) { 

		this.FIGURE_MOVED = 'tetris: figure_moved'; 
		this.FIGURE_ON_FINISH = 'tetris: figure_on-finish'; 
		this.FIGURE_UPDATED = 'tetris: figure_updated'; 
		this.GAME_IS_OVER = 'tetris: game_is_over'; 
		this.LINE_IS_FULL = 'tetris: line_is_full'; 
		this.GET_POINT = 'tetris:get_point'; 
		this.PAUSE = 'tetris:pause'; 
		this.EMIT_PARTICLES = 'tetris:emit_particles'; 
		this.PLAY_SOUND = "sound-manager:play"; 
		this.PAUSE_SOUND = "sound-manager:pause"; 
		this.SHAKE_SCREEN = "tetris:shake_screen"; 
		this.FIGURE_DROP = 'tetris:figure_drop'

		this.PARTICLES_PATH = config.PARTICLES_PATH; 

		this.inputController = inputController; 
		this.config = config; 

		this.cells_horizontal = config.cells_horizontal; 
		this.cells_vertical = config.cells_vertical; 
		this.cells_height = config.cells_height + 2; 

		this.field_width = config.field_width; 
		this.field_height = config.field_height; 

		this.cell_width = config.cell_width; 
		this.cell_height = config.cell_height; 

		this.logic_step_interval = config.logic_step_interval; 
		inputController.enabled = false; 

		//figures 
		this.figures = []; 
		this.figure_rotations = {}; 
		this.next_figure;

		this.initFigures(config.figures); 
		this.initFiguresRotations(); 


		this.directions = { 
		'right': {x:1, y:0}, 
		'left': {x:-1, y:0} 
		}; 

		this.check_coordinates = { 
		'x': this.cells_horizontal, 
		'y': this.cells_vertical 
		}; 


		// HANDLERS 
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
			if ( acttion_name == 'rotate_x') scope.rotate(); 
			if ( acttion_name == 'pause') scope.setPause(); 
			if ( acttion_name == 'fall') scope.dropFigure(); 
			var direction = scope.directions[acttion_name]; 
			if ( direction ) { 
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
			var new_figure = figures[figure].split(';'); 
			new_figure.forEach( function( el, i ) { 
			var pivot = false; 
			if (el.substr(-1) == '*') pivot = true; 
			shape.push({x: +el[0], y: +el[2], pivot: pivot}) 
		}); 
		this.figures.push({name: figure, shape: shape, rotation_state: 1 }) 
		} 
	}

	getFigurePivot(figure) {
		for ( var i = 0; i < figure.shape.length; i++) {
			var part = figure.shape[i];
			if ( part.pivot ) return part;
		}
	}

	dropFigure() { 
		var counter = this.getDropPosition();
		this.testMove( 0, true, 0, counter );
		Utils.triggerCustomEvent( window, this.FIGURE_MOVED, {projection_coord: this.getDropPosition()} ); 
		var pivot = this.getFigurePivot(this.figure);
		Utils.triggerCustomEvent( window, this.FIGURE_DROP, { x: pivot.x, y: this.lower_part.y, z: 0} ); 
		this.updateCustomsOnFinish();
	} 

	getDropPosition() { 
		var counter = 0; 
		while ( 1 ) { 
			if ( !this.testMove(0, false, 0, counter) ) break; 
			counter++; 
		} 
		return counter - 1; 
	} 

	testMove (rotation_i, replace, dx, dy) {
		var scope = this;
		if ( !checkDotCoordinates(false)) return false;
		if (replace) checkDotCoordinates(replace);
		return true;

		function checkDotCoordinates(replace) {
			var diff_x, diff_y;
			for ( var i = 0; i < scope.figure.shape.length; i++ ) {
				var part = scope.figure.shape[i];
				if ( rotation_i ) {
					var figure_current_phase = scope.figure_rotations[scope.figure.name][rotation_i][i];
					dx = -figure_current_phase.x - figure_current_phase.y; 
					dy = -figure_current_phase.y + figure_current_phase.x; 
				}
				if ( replace ) {
					part.x += dx; 
					part.y += dy; 
				} else {
					var new_x = part.x + dx; 
					var new_y = part.y + dy;
					var glass_row = scope.rows[new_y];
					if ( glass_row == undefined || glass_row[new_x] == undefined || glass_row[new_x]) {
						if (glass_row != undefined && glass_row[new_x] == undefined) Utils.triggerCustomEvent( window, scope.SHAKE_SCREEN, 
							 {side: new_x < 0 ? 'left' : 'right'} ); 
						scope.lower_part = {x: part.x, y: part.y}
						return false;
					}
				}
			}
			return true;
		}
	}

	moveFigureByDirection(direction) { 
		this.testMove (0, true, direction.x, 0)
		Utils.triggerCustomEvent( window, this.FIGURE_MOVED, {projection_coord: this.getDropPosition()} ); 
	} 

	setPause() { 
		this.on_pause = this.on_pause ? false : true; 
		Utils.triggerCustomEvent( window, this.PAUSE, {on_pause: this.on_pause} ); 
	} 

	accelerateMoving(is_accelerate) { 
		if ( is_accelerate ) this.logic_step_interval = 30; 
		else this.logic_step_interval = this.config.logic_step_interval; 
	} 

	initLines() { 
		this.rows = []; 
		for ( var y = 0; y < this.cells_height; y++ ) { 
			this.rows.push([]); 
			for ( var x = 0; x < this.cells_horizontal; x++) this.rows[y][x] = false; 
			if ( !this.empty_line ) this.empty_line = this.rows[y].slice(); 
		} 
	} 

	moveToTheMiddle() { 
		for ( var i = 0; i < this.figure.shape.length; i++ ) { 
			var dot = this.figure.shape[i]; 
			dot.x += this.cells_horizontal / 2.5; 
		} 
	} 

	startGame() { 
		var scope = this; 
		this.updateFigures();
		this.figure_on_finish = false; 
		this.points = 0; 
		this.on_pause = false; 
		this.inputController.enabled = true; 
		this.logic_step_interval = this.config.logic_step_interval; 

		if(!this.gameStep){ 

			this.gameStep = function(){ 
				scope.game_timeout = setTimeout( scope.gameStep, scope.logic_step_interval );
				if ( scope.on_pause ) return; 
				scope.moveFigure();

				if(scope.game_is_over) { 
					Utils.triggerCustomEvent( window, scope.PLAY_SOUND, {sound_id: "over", loop: false} ); 
					scope.game_is_over = false; 
					scope.gameOver(); 
					return; 
				} 

				if ( scope.figure_on_finish ) {
					scope.updateCustomsOnFinish();
				} 

				Utils.triggerCustomEvent( window, scope.FIGURE_MOVED, {projection_coord: scope.getDropPosition()} ); 
			}; 
		} 
		this.gameStep(); 
	} 

	updateFigures() {
		this.figure = this.next_figure || this.getNewFigureData();
		this.next_figure = this.getNewFigureData();
		this.moveToTheMiddle();
		Utils.triggerCustomEvent( window, this.FIGURE_UPDATED );
	}

	updateCustomsOnFinish() {
		this.figure_on_finish = false;
		this.purFigureToGlass();
		Utils.triggerCustomEvent( window, this.FIGURE_ON_FINISH );
		Utils.triggerCustomEvent( window, this.EMIT_PARTICLES, { x: this.lower_part.x, y: this.lower_part.y, z: 0} ); 
		Utils.triggerCustomEvent( window, this.PLAY_SOUND, {sound_id: "interface", loop: false} ); 
		this.removeFullLines();
		this.updateFigures();
	}

	rotate() {
		if ( this.figure.name == 'square' ) return; 

		var new_rotation_state = this.figure.rotation_state == 4 ? 1 : this.figure.rotation_state + 1 ;
		if ( !this.testMove( this.figure.rotation_state, true, 0, 0 ) ) return;
		this.figure.rotation_state = new_rotation_state;

		Utils.triggerCustomEvent( window, this.PLAY_SOUND, {sound_id: "rotation", loop: false} ); 
		Utils.triggerCustomEvent( window, this.FIGURE_MOVED, {projection_coord: this.getDropPosition()} ); 
	} 

	initFiguresRotations() { 
		for ( var i = 1; i < this.figures.length; i++ ) { 
			var figure = JSON.parse(JSON.stringify(this.figures[i])); 
			this.figure_rotations[figure.name] = {}; 
			var pivot = this.getFigurePivot(figure); 
			
			for ( var state = 1; state <= 4; state++ ) { 
				this.figure_rotations[figure.name][state] = []; 
				for ( var part_i = 0; part_i < figure.shape.length; part_i++ ) { 
					var dot = figure.shape[part_i]; 
					var diffX = dot.x - pivot.x; 
					var diffY = dot.y - pivot.y; 
					dot.x = dot.x - diffX - diffY; 
					dot.y = dot.y - diffY + diffX;
					this.figure_rotations[figure.name][state].push({x: diffX, y: diffY}); 
				} 
			}
		} 
	} 

	removeFullLines() { 
		row: 
		for ( var y = 0; y < this.rows.length; y++ ) { 
			var row = this.rows[y]; 
			for ( var x = 0; x < row.length; x++ ) { 
				if ( !row[x] ) continue row; 
			} 
			this.logic_step_interval -= 15; 
			this.points += 5; 
			Utils.triggerCustomEvent( window, this.LINE_IS_FULL, {line_number: y} ); 
			Utils.triggerCustomEvent( window, this.PLAY_SOUND, {sound_id: "row", loop: false} ); 
			Utils.triggerCustomEvent( window, this.GET_POINT ); 
			for ( var i = y; i > 0; i-- ) 
				this.rows[i] = this.rows[i-1].slice();
			this.rows[0] = this.empty_line.slice(); 
		}
	} 

	moveFigure() {
		var possibility_to_move = this.testMove(0, true, 0, 1); 
		if ( !possibility_to_move ) {
			this.figure_on_finish = true; 
			for ( var i = 0; i < this.figure.shape.length; i++ ) {
				if ( this.figure.shape[i].y < 3 ) {
					this.game_is_over = true; 
					break;
				}
			}
		} 
	} 

	purFigureToGlass() { 
		for ( var i = 0; i < this.figure.shape.length; i++ ) { 
			var part = this.figure.shape[i]; 
			this.rows[part.y][part.x] = true; 
		} 
	} 

	gameOver(){ 
		clearTimeout( this.game_timeout ); 
		this.inputController.enabled = false; 
		Utils.triggerCustomEvent( window, this.GAME_IS_OVER ); 
	} 


	getNewFigureData() { 
		return JSON.parse(JSON.stringify(this.figures[~~( Math.random() * this.figures.length)]));
	} 
}
