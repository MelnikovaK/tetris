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

	//проверка на выход за пределды поля
	//исчезновение линий
	//повороты
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
			{name: 'rectangle',
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
				},
				{
					number:2,
					dots:[]
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
				},
				{
					number:2,
					dots:[]
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
				},
				{
					number:2,
					dots:[]
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
			if ( e.detail.name == 'rotate_x') scope.rotateByX();
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
					scope.checkLineIsFull();
					Utils.triggerCustomEvent( window, scope.FIGURE_ON_FINISH );
				}
				// redraw
				Utils.triggerCustomEvent( window, scope.FIGURE_MOVED );
			};
		}
		this.gameStep();
	}

	rotateByX() {
		for ( var i = 0; i < this.figure.lines.length; i++) {
			var line = this.figure.lines[i];
			for ( var j = 0; j < line.dots.length; j++ ) {
				var dot = line.dots[j];
				var temp = dot.x;
				dot.x = dot.y;
				dot.y = - temp;
			}
		}
	}

	checkLineIsFull() {
		var full_lines = []
		line:
		for ( var i = 0; i < this.lines.length; i++ ) {
			var line = this.lines[i];
			for ( var j = 0; j < line.length; j++){
				var row = line[j];
				for ( var k = 0; k < row.length; k++) {
					if ( !row[k] ) continue line;
				}
			}
			full_lines.push(i);
			//после того как мы получили заполненные линии нам сдиспачить событие для изменения в рендере и свдинуть все элементы массива
		}
	}

	moveFigure(direction) {
		var scope = this;
		if ( direction ) {
			this.figure.lines.forEach(function(line,i) {
				line.dots.forEach( function(dot, j) {
					var new_x = dot.x + direction.x;
					var new_y = dot.y + direction.y;
					dot.x += direction.x;
					dot.y += direction.y;
				});
			})
		}

		lines:
		for ( var i = this.figure.lines.length - 1; i >= 0; i-- ) {
			var line = this.figure.lines[i];
			for ( var j = 0; j < line.dots.length; j++ ) {
				var dot = line.dots[j];
				if ( line.number >= (scope.cells_height - 1) || scope.lines[line.number + 1][dot.x][dot.y] ) {
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