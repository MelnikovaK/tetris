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
		this.figures = [
			{
				name: 'rectangle',
				lines: [[{ x: 0, y: 0 }, { x: 0, y: 0 }],[{ x: 0, y: 0 }], [{ x: 0, y: 0 }]]
			}, 

			{
				name: 'square',
				lines: [[{ x: 0, y: 0 }, { x: 1, y: 0 }], [{ x: 0, y: 0 }, { x: 1, y: 0 }]]
			}, 
			{
				name:'l-left',
				lines: [[{ x: 1, y: 0 }], [{ x: 1, y: 0 }], [{ x: 0, y: 0 }, { x: 1, y: 0 }] 
			]}, 
			{
				name:'l-right',
				lines: [[{ x: 0, y: 0 }], [{ x: 0, y: 0 }], [{ x: 0, y: 0 }, { x: 1, y: 0 }] 
			]},
			{
				name: 'stairs-left',
				lines: [[{ x: 1, y: 0 }, { x: 2, y: 0 }], [{ x: 1, y: 0 }, { x: 2, y: 0 }] 
			]}, 
			{
				name: 'stairs-right',
				lines: [[{ x: 3, y: 0 }, { x: 2, y: 0 }], [{ x: 1, y: 0 }, { x: 2, y: 0 }] 
			]}, 
			{
				name: 't-shape',
				lines: [[{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }], [{ x: 1, y: 0 }]]
			}
		];

		this.startGame();


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
					this.figure_on_finish = false;
					this.figure = getNewFigureData();
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
		this.figure.lines.forEach(function(x) {
			x++;
			if ( x >= scope.cells_height ) this.figure_on_finish = true;
		});
	}

	getNewFigureData() {
		// return JSON.parse(JSON.stringify(this.figures[~~( Math.random() * 7)]));
		return JSON.parse(JSON.stringify(this.figures[6]));
	}

}