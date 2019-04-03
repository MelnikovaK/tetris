class ThreejsRenderer {
	constructor( tetris, config ) {

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

		this.shapes = {};

		this.shapes['square'] = {
			color: '#3856F5',
			shape: new THREE.BoxBufferGeometry( 2,2,2 )
		}
		
		this.initScene();
		this.initContainers();
		this.createAssets();
		this.initGameField();

		window.addEventListener( "screens: start game" , function () {
			// scope.resetCameraPosition(scope.camera);
			scope.updateFigure();
			// scope.updateLines();
			scope.startRendering();
		});


		window.addEventListener( "tetris: figure_on-finish" , function () {
			scope.updateFigure();
		});

		window.addEventListener( "tetris: figure_moved" , function () {
			if (scope.figure) scope.updateFigurePosition();
		});

		window.addEventListener( "tetris: game_is_over" , function () {
			window.cancelAnimationFrame(scope.requestAnimationFrame_id);
		});
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

		camera.position.set( 0, 25, 8 );
		camera.lookAt( new THREE.Vector3(0,0,10) );

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

		var controls = this.controls = new THREE.OrbitControls( camera );
		controls.update();
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
		//ground
		var groundMaterial = new THREE.MeshLambertMaterial( { color: '#FFF13D', side: THREE.DoubleSide });
		var ground_plane = new THREE.Mesh( new THREE.PlaneBufferGeometry( this.cells_horizontal, this.cells_vertical ), groundMaterial );;
		ground_plane.rotation.x = -90 / 180 * Math.PI;

		//3 walls
		var wallMaterial = new THREE.MeshLambertMaterial( { color:'#4D56FF', side: THREE.DoubleSide});
		var walls = [];
		for ( var i = 0; i < 2; i++ ) {
			walls.push(new THREE.Mesh( new THREE.PlaneBufferGeometry( this.cells_horizontal, this.cells_in_height ), wallMaterial ));

			walls[i].position.z = 0;
			walls[i].position.y =  this.cells_in_height / 2;
			walls[i].rotation.y = -90 / 180 * Math.PI;
			walls[i].receiveShadow = true;

			this.game_container.add(walls[i]);
		}
		walls[0].position.x =  - this.cells_horizontal / 2;
		walls[1].position.z = - this.cells_vertical / 2;
		walls[1].rotation.y = 0;

		this.game_container.add( ground_plane );
	}

	updateFigure() {
		this.figure = this.tetris.figure;
		var counter = 0;
		this.figure['shape'] = new THREE.Object3D();
		for ( var i =  0; i < 4; i++) {
			this.figure.shape.add(this.AM.pullAsset(this.figure.name))
		}
		this.game_field.add(this.figure.shape);

		for (var i = 0; i < this.figure.dots.length; i++) {
			var dot = this.figure.dots[i];
			this.figure.shape.children[counter].position.x = dot.x;
			this.figure.shape.children[counter].position.z = dot.y;
			this.figure.shape.children[counter].position.y = this.cells_in_height - dot.z - 1;
			counter++;
		}
	}

	updateFigurePosition() {
		var counter = 0;
		for (var i = 0; i < this.figure.dots.length; i++) {
			var dot = this.figure.dots[i];
			this.figure.shape.children[counter].position.x = dot.x;
			this.figure.shape.children[counter].position.z = dot.y;
			this.figure.shape.children[counter].position.y = this.cells_in_height - dot.z - 1;
			counter++;
		}
	}


	startRendering() {
		var scope = this;
		function render() {
      scope.requestAnimationFrame_id = requestAnimationFrame( render );
      scope.controls.update();
      scope.renderer.render( scope.scene, scope.camera );
		}
		render();
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