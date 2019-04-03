var $game_container = $('.game_container');

var ASSETS_PATH = 'assets/';

var config = {
	ASSETS_PATH: ASSETS_PATH,
	
	cells_horizontal: 4,
	cells_vertical: 4,
	cells_height: 15,
	field_width: 900,
	field_height: 900,
	cell_width: 900/20,
	cell_height: 900/20,

	start_screen: 'start-screen',

	logic_step_interval: 1000,
	
	input: {
		keyboard_enabled: true,
		mouse_enabled: false,
		touch_enabled: false,

		actions: {
			"left": { // название активности
				keys: [37,65], // список кодов кнопок соответствующих активности
				enabled: true // отключенная активность по умолчанию
			},
			"right": {
				keys: [39,68],
			},
			"up": {
				keys: [38,87],
			},
			"down": {
				keys: [83,40],
			},
			"fall": {
				keys: [32],
			},
			"rotate_x": {
				keys: [81],
			},
			"rotate_z": {
				keys: [69],
			},
			"acceleration": {
				keys: [90],
			}
		}
	},

	preload_list: [
		ASSETS_PATH+"bonus.mp3",
		ASSETS_PATH+"game over.mp3",
		ASSETS_PATH+"music.mp3"
	],

	sounds: {
		"bonus": ASSETS_PATH+"bonus.mp3",
		"game over": ASSETS_PATH+"game over.mp3",
		"music": ASSETS_PATH+"music.mp3",
	}
}

let inputController = new InputController( config.input, $game_container[0] );
let tetris = new Tetris( config, inputController );
let page_manager = new PageManager( $game_container, tetris, config.start_screen );
let renderer = new ThreejsRenderer( tetris, config );
