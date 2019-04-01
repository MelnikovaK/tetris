class Tetris {
	constructor( config, inputController, ) {

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

		//square, t, l-right, l-left, z-right, z-left, rectangle
		this.figures = {};
		this.figures['t'] = {
			
		}
	}

}