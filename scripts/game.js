(function(){

	var $game_container = $('.game_container');

	var ASSETS_PATH = 'assets/';
	var SOUNDS_PATH = ASSETS_PATH + 'sounds/';

	var config = {
		ASSETS_PATH: ASSETS_PATH,
		PARTICLES_PATH: ASSETS_PATH + 'particles/',
		SOUNDS_PATH: SOUNDS_PATH,
		cells_horizontal: 10,
		cells_vertical: 1,
		cells_height: 15,
		field_width: 900,
		field_height: 900,
		cell_width: 900/20,
		cell_height: 900/20,

		figures: {
			"square": "0,1;1,1;0,0;1,0*",
			"cross": "1,0;0,1;1,1*;2,1;1,2",
			"rectangle": "0,0;1,0*;2,0;3,0",
			"l-left": "1,0;1,1;1,2;0,2*",
			"l-right": "0,0;0,1;0,2*;1,2",
			"stairs-left": "0,0;1,0*;1,1;2,1",
			"stairs-right": "0,1;1,1*;1,0;2,0",
			"t-shape": "0,0;1,0*;2,0;1,1",
		},

		start_screen: 'start-screen',

		logic_step_interval: 500,
		
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
				"camera_left": { 
					keys: [37], 
					enabled: true 
				},
				"camera_right": {
					keys: [39],
				},
				"camera_up": {
					keys: [38],
				},
				"camera_down": {
					keys: [40],
				},
				"pause": {
					keys: [27],
				},
				"fall": {
					keys: [32],
				},
				"rotate_x": {
					keys: [81],
				},
				"rotate_y": {
					keys: [69],
				},
				"rotate_z": {
					keys: [82],
				},
				"acceleration": {
					keys: [90],
				}
			}
		},

		preload_list: [
			SOUNDS_PATH+"interface.mp3",
			SOUNDS_PATH+"over.mp3",
			SOUNDS_PATH+"rotation.wav",
			SOUNDS_PATH+"row.mp3"
		],

		sounds: {
			"interface": SOUNDS_PATH+"interface.mp3",
			"over": SOUNDS_PATH+"over.mp3",
			"rotation": SOUNDS_PATH+"rotation.wav",
			"row": SOUNDS_PATH+"row.mp3",
		}
	}

	let inputController = new InputController( config.input, $game_container[0] );
	let tetris = new Tetris( config, inputController );
	let page_manager = new PageManager( $game_container, tetris, config.start_screen );
	let renderer = new ThreejsRenderer( tetris, config, inputController);

	let particles_manager = new ThreejsParticles(tetris);
	let sounds_manager = new SoundManager( config, tetris );

})();