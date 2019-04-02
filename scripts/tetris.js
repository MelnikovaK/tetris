class Tetris {
	/*
		линия - поле 10х10
		каждая ячейка линии содержит информацию о своей заполненности, если все ячейки линии заполнены, то она удаляется и происходит сдвиг. 
		фигуры нужны только до того как они упадут, после этого просто высчитыввается в какой линии какие ячейки заняты
	*/

	/*
		информация о фигуре:
			имя
			массив занятых линий:
				массив точек на линии:
					х
					у

	*/
	constructor( config, inputController, ) {

		this.FIGURE_MOVED = 'tetris: figure_moved';
		this.FIGURE_ON_FINISH = 'tetris: figure_on-finish';

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
		this.figures = [{name: 'rectangle',
										lines: [
											{
												number: 0,
												dots :[{ x: 0, y: 0 }] 
											},
											{
												number: 1,
												dots :[{ x: 0, y: 0 }] 
											},
											{
												number: 2,
												dots :[{ x: 0, y: 0 }] 
											},
											{
												number: 3,
												dots :[{ x: 0, y: 0 }] 
											}
										]}, 
										{name: 'square',
										lines: [
											{
												number: 0,
												dots :[{ x: 0, y: 0 },{ x: 1,  y: 0 }] 
											},
											{
												number: 1,
												dots :[{ x: 0, y: 0 }, { x: 1, y: 0 }] 
											}
										]}, 
										{name:'l-left',
										lines: [
											{
												number: 0,
												dots :[{ x: 1, y: 0 }] 
											},
											{
												number: 1,
												dots :[{ x: 1, y: 0 }] 
											},
											{
												number: 2,
												dots :[{ x: 0, y: 0 }, { x: 1, y: 0 }] 
											}
										]}, 
										{name:'l-right',
										lines: [
											{
												number: 0,
												dots :[{ x: 0, y: 0 }] 
											},
											{
												number: 1,
												dots :[{ x: 0, y: 0 }] 
											},
											{
												number: 2,
												dots :[{ x: 0, y: 0 }, { x: 1, y: 0 }] 
											}
										]},
										{name: 'stairs-left',
										lines: [
											{
												number: 0,
												dots :[{ x: 0, y: 0 }, { x: 1, y: 0 }]  
											},
											{
												number: 1,
												dots :[{ x: 1, y: 0 }, { x: 2, y: 0 }] 
											}
										]}, 
										{name: 'stairs-right',
										lines: [
											{
												number: 0,
												dots :[{ x: 1, y: 0 }, { x: 2, y: 0 }] 
											},
											{
												number: 1,
												dots :[{ x: 1, y: 0 }, { x: 0, y: 0 }] 
											}
										]}, 
										{name: 't-shape',
										lines: [
											{
												number: 0,
												dots :[{ x: 0, y: 0 }] 
											},
											{
												number: 1,
												dots :[{ x: 0, y: 0 }, { x: 1, y: 0 }] 
											},
											{
												number: 2,
												dots :[{ x: 0, y: 0 }]
											}
										]
		}];
		//handlers
		var scope = this;
		window.addEventListener( "screens: start game" , function () {
		  scope.startGame();
		});
		
	}

	initLines() {
		this.lines = [];
		for ( var k = 0; k < this.cells_height; k++ ){
			var line = [];
			for ( var i = 0; i < this.cells_horizontal; i++){
				line.push([])
				for ( var j = 0; j < this.cells_horizontal; j++) {
					//информация о заполненности ячейки
					line[i][j] = false;
				}
			}
				this.lines.push(line);
		}
	}

	changeLinesArray() {
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

				scope.moveFigure();

				if ( scope.figure_on_finish ) {
					scope.figure_on_finish = false;
					scope.figure = scope.getNewFigureData();
					// this.checkLineIsFull();
					Utils.triggerCustomEvent( window, scope.FIGURE_ON_FINISH );
				}

				// redraw
				Utils.triggerCustomEvent( window, scope.FIGURE_MOVED );
			};
		}
		this.gameStep();
	}

	moveFigure() {
		var scope = this;
		lines:
		for ( var i = this.figure.lines.length - 1; i >= 0; i-- ) {
			var line = this.figure.lines[i];
			for ( var j = 0; j < line.dots.length; j++ ) {
				var dot = line.dots[j];
				if ( line.number >= (scope.cells_height - 1) || scope.lines[line.number][dot.x][dot.y] ) {
					scope.figure_on_finish = true;
					break lines;
				}
			}
			line.number++;
		}

		if ( this.figure_on_finish ) {
			this.figure.lines.forEach(function(line,i) {
				line.dots.forEach( function(dot, j) {
					scope.lines[line.number][dot.x][dot.y] = true;
				});
			})
		}
	}

	getNewFigureData() {
		return JSON.parse(JSON.stringify(this.figures[~~( Math.random() * 7)]));
	}

}