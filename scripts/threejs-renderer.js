
class ThreejsRenderer {
	constructor( tetris, config, inputController ) {

		//events
		this.SHOW_FINISH_SCREEN = "screens: show_finish_modal";


		var scope = this;
		this.container = document.getElementsByClassName('game-screen__container')[0];

		this.tetris = tetris;

		this.field_width = tetris.field_width;
		this.field_height = tetris.field_height;

		this.cell_width = tetris.cell_width;
		this.cell_height = tetris.cell_height;

		this.cells_horizontal = tetris.cells_horizontal;
		this.cells_vertical = tetris.cells_vertical;
		this.cells_in_height = tetris.cells_height;
		
		this.ZERO = new THREE.Vector3(0,0,0);
		this.CENTER = new THREE.Vector3( this.cells_horizontal / 2, 0, this.cells_vertical / 2 );

		this.AM = new AssetManager(this);

		this.lines = [];
		
		this.initScene();
		this.initContainers();
		this.createAssets();
		this.initGameField();

		window.addEventListener( "screens: start game" , function () {
			scope.removeAllFigures();
			scope.updateFigure();
			scope.initLines();
			scope.startRendering();
		});


		window.addEventListener( tetris.FIGURE_ON_FINISH , function () {
			scope.fillLines();
			scope.jumpFigures();
			scope.updateFigure();
		});

		window.addEventListener( tetris.FIGURE_MOVED , function () {
			if (scope.figure) {
			  if ( scope.figure.obj.children.length) scope.updateFigurePosition();
			} 
		});

		window.addEventListener( tetris.GAME_IS_OVER , function () {
			scope.fillLines();
			scope.destroyFigures();
			window.cancelAnimationFrame(scope.requestAnimationFrame_id);
			setTimeout( function() {
				Utils.triggerCustomEvent( window, scope.SHOW_FINISH_SCREEN );
			}, 1500);
		});

		window.addEventListener( tetris.LINE_IS_FULL , function (e) {
			scope.removeLine(e.detail.line_number);
		});

		inputController.target.addEventListener( inputController.ACTION_ACTIVATED, function (e) {
			var acttion_name = e.detail.name;
			if ( acttion_name == 'camera_left') scope.moveCameraHorizontal(true, true);
			if ( acttion_name == 'camera_right') scope.moveCameraHorizontal(true, false);
			if ( acttion_name == 'camera_up') scope.moveCameraVertical(true, true);
			if ( acttion_name == 'camera_down') scope.moveCameraVertical(true, false);
		});

		inputController.target.addEventListener( inputController.ACTION_DEACTIVATED, function (e) {
			var acttion_name = e.detail.name;
			if ( acttion_name == 'camera_left') scope.moveCameraHorizontal(false);
			if ( acttion_name == 'camera_right') scope.moveCameraHorizontal(false);
			if ( acttion_name == 'camera_up') scope.moveCameraVertical(false);
			if ( acttion_name == 'camera_down') scope.moveCameraVertical(false);
		});
	}

	moveCameraHorizontal(is_start, is_left) {
		var scope = this;
		if ( is_start ) {
			this.hor_interval_id = setInterval( function() {
				scope.camera.position.x += is_left ? -1 : 1;
				scope.camera.lookAt( new THREE.Vector3(0,9,3) );

			}, 60)
		} else clearInterval(this.hor_interval_id);
	}

	moveCameraVertical(is_start, is_up) {
		var scope = this;
		if ( is_start ) {
			this.ver_interval_id = setInterval( function() {
				scope.camera.position.y += is_up ? 1 : -1;
				scope.camera.lookAt( new THREE.Vector3(0,9,3) );
			}, 60)
		} else clearInterval(this.ver_interval_id);
	}


	initScene() {
		var scope = this;

		const VIEW_ANGLE = 90;
		const ASPECT = window.innerWidth / window.innerHeight;
		const NEAR = .01;
		const FAR = 500;

		this.renderer = new THREE.WebGLRenderer( { antialias: true } );
		var camera = this.camera =
		    new THREE.PerspectiveCamera(
		        VIEW_ANGLE,
		        ASPECT,
		        NEAR,
		        FAR
		    );

		camera.position.set( 3, 13, 10);
		camera.lookAt( new THREE.Vector3(0,8,3) );

		var scene = this.scene = new THREE.Scene();
		this.scene.add(this.camera);
		this.scene.background = new THREE.Color( 0xcce0ff );

		this.renderer.setSize(this.field_width, this.field_height);
		this.container.appendChild(this.renderer.domElement);

		var gridHelper = new THREE.GridHelper( 12, 12 );
		gridHelper.position.y = .1;
		scene.add( gridHelper );

		var spotLight = new THREE.SpotLight( 0xffffff, 1, 0, 30 / 180 * Math.PI );
		spotLight.position.set( 10/2, 100/2, 50/2 );
		this.scene.add( spotLight );

		var spotLightHelper = new THREE.SpotLightHelper( spotLight );
		scene.add( spotLightHelper );
	}

	initContainers() {
		this.game_container = new THREE.Object3D();
		this.scene.add(this.game_container);

		this.game_field = new THREE.Object3D();
		this.game_field.position.y = .5;
		this.game_field.position.x = - this.cells_horizontal / 2 + .5;
		this.game_field.position.z = - this.cells_vertical / 2 + .5;
		this.game_container.add(this.game_field);
	}

	initGameField() {
		var wallMaterial = new THREE.MeshLambertMaterial( { color:'#4D56FF', side: THREE.BackSide});
		var wall = new THREE.Mesh(new THREE.BoxBufferGeometry( this.cells_horizontal, this.cells_in_height - 2, this.cells_vertical ), wallMaterial);
		wall.position.y = this.cells_in_height / 2 - 1;
		this.game_container.add( wall );
	}

	updateFigure() {
		this.figure = this.tetris.figure;
		this.figure['obj'] = new THREE.Object3D();
		for ( var i =  0; i < this.figure.shape.length; i++) {
			this.figure.obj.add(this.AM.pullAsset(this.figure.name))
			this.figure.obj.children[i].visible = false;
		}
		this.game_field.add(this.figure.obj);
	}

	updateFigurePosition() {
		for (var i = 0; i < this.figure.shape.length; i++) {
			var dot = this.figure.shape[i];
			if (dot.y >= 2) this.figure.obj.children[i].visible = true;
			var obj = this.figure.obj.children[i];
			obj.position.x = dot.x;
			obj.position.y = this.cells_in_height - dot.y - 1;
		}
	}

	initLines() {
		for ( var i = 0; i < this.tetris.lines.length; i++ ) {
			this.lines[i] = [];
		}
	}

	fillLines() {
		var objects = this.figure.obj.children;
		for ( var i = 0; i < objects.length; i++ ) {
			var z = objects[i].position.y;
			this.lines[this.cells_in_height - z - 1].push(objects[i]);
		}
	}

	moveLines(line_index) {
		for ( var i = line_index; i > 0; i-- ) {
			this.lines[i] = this.lines[i-1];
			for ( var j = 0; j < this.lines[i].length; j++ ) {
				if (this.lines[i][j].position.y > 0) this.lines[i][j].position.y--;
			}
		}

	}

	removeLine(line) {
		for ( var i = this.lines[line].length - 1; i >= 0; i = this.lines[line].length - 1 ) {
			this.AM.putAsset(this.lines[line][i]);
			this.lines[line][i].parent.remove(this.lines[line][i])
			this.lines[line].pop();
		}
		this.moveLines(line);
	}

	removeAllFigures() {
		for ( var i = 0; i < this.lines.length; i++ ) {
			this.removeLine(i);
		}
	}

	startRendering() {
		var scope = this;
		function render() {
		  scope.requestAnimationFrame_id = requestAnimationFrame( render );
		  scope.renderer.render( scope.scene, scope.camera );
		}
		render();
	}

	destroyFigures() {
		// for ( var i = 0; i < this.lines.length; i++) {
		// 	if ( !this.lines[i].length ) continue;
		// 	for ( var j = 0; j < this.lines[i].length; i++ ) {
		// 		var counter = 0;

			// }
		// }
	}

	jumpFigures() {
		var scope = this;
		for ( var i = 0; i < this.lines.length; i++) {
			if ( !this.lines[i].length ) continue;
			for ( var j = 0; j < this.lines[i].length; j++ ) {
			(function(i, j) {
				var counter = 1;
				var obj = scope.lines[i][j];
				if ( !move ) {
					var interv = 40;
					var height = 0.25;
					var move = function() {
						if (counter > 6 ) {
							interv = 20;
							height = 0.05;
						}
		        if ( counter < 12) setTimeout( move, interv );
						else return;
						obj.position.y += Math.sin(counter) * height;
						counter++;
					}				
				}
				move();
   		 })(i,j);
			} 
		};
	}
	

	createAssets() {
		//game field
		var groundMaterial = new THREE.MeshLambertMaterial( { color: '#FFF13D', side: THREE.DoubleSide });
		var wallMaterial = new THREE.MeshLambertMaterial( { color:'#4D56FF', side: THREE.DoubleSide});

		this.AM.addAsset('ground_plane', function() { return new THREE.Mesh( new THREE.PlaneBufferGeometry( this.cells_horizontal, this.cells_vertical ), groundMaterial );} , 3);
		this.AM.addAsset('wall_plane', function() { return new THREE.Mesh( new THREE.PlaneBufferGeometry( this.cells_horizontal, this.cells_in_height ), wallMaterial );} , 4);

		//shapes
		var rect_material = new THREE.MeshLambertMaterial( { color: '#86DA10'});
		this.AM.addAsset('rectangle', function() { return createShape(rect_material);} , 15);

		var square_material = new THREE.MeshLambertMaterial( { color: '#FF1C00'});
		this.AM.addAsset('square', function() { return createShape(square_material);} , 15);
		//stairs-left
		var stl_material = new THREE.MeshLambertMaterial( { color: '#00ACF5'});

		this.AM.addAsset('stairs-left', function() { return createShape(stl_material); }, 15);

		//stairs-right
		var str_material = new THREE.MeshLambertMaterial( { color: '#B400F5'});
		this.AM.addAsset('stairs-right', function() { return createShape(str_material); }, 15);

		//t-shape
		var t_material = new THREE.MeshLambertMaterial( { color: '#FF890A'});
		this.AM.addAsset('t-shape', function() { return createShape(t_material);} , 15);

		//l-left
		var ll_material = new THREE.MeshLambertMaterial( { color: '#ED50D8'});
		this.AM.addAsset('l-left', function() { return createShape(ll_material);} , 15);

		//l-right
		var lr_material = new THREE.MeshLambertMaterial( { color: '#0FFFC6'});
		this.AM.addAsset('l-right', function() {return createShape(lr_material);} , 15);		

		function createShape(material) {
			return new THREE.Mesh(new THREE.BoxBufferGeometry( 1, 1, 1 ), material);
		}
	}

}