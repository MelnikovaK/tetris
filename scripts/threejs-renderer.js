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
		this.initGameField();
		this.createTetrisFigures();

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
    camera.position.set( 0, 15, 0 );
		camera.lookAt( this.ZERO );

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

		var controls = new THREE.OrbitControls( camera );

		camera.position.set( 0, 5, 5 );
		controls.update();

		
		function render() {
        requestAnimationFrame( render );
        controls.update();
        scope.renderer.render( scene, camera );
		}
		render();
	}

	initContainers() {
		this.game_container = new THREE.Group();
		this.scene.add(this.game_container);

		this.game_field = new THREE.Group();
		this.game_field.position.y = .5;
		this.game_field.position.x = - this.cells_horizontal / 2 + .5;
		this.game_field.position.z = - this.cells_vertical / 2 + .5;
		this.game_container.add(this.game_field);
	}

	initGameField() {
		//ground
		var groundMaterial = new THREE.MeshLambertMaterial( { color: 0xffffff });
		var ground_plane = new THREE.Mesh( new THREE.PlaneBufferGeometry( this.cells_horizontal, this.cells_vertical ), groundMaterial );
		ground_plane.rotation.x = -90 / 180 * Math.PI;

		//3 walls
		var wallMaterial = new THREE.MeshLambertMaterial( { color:'#4D56FF', side: THREE.DoubleSide});
		var walls = [];
		for ( var i = 0; i < 3; i++ ) {
			walls.push(new THREE.Mesh( new THREE.PlaneBufferGeometry( this.cells_horizontal, this.cells_in_height ), wallMaterial ));

			walls[i].position.z = 0;
			walls[i].position.y =  this.cells_in_height / 2;
			walls[i].rotation.y = -90 / 180 * Math.PI;
			walls[i].receiveShadow = true;

			this.game_container.add(walls[i]);
		}
		walls[0].position.x =  - this.cells_horizontal / 2;

		walls[1].position.x = this.cells_horizontal / 2;

		walls[2].position.z = - this.cells_vertical / 2;
		walls[2].rotation.y = 0;

		this.game_container.add( ground_plane );
	}

	createTetrisFigures() {
		var material = new THREE.MeshPhongMaterial({ color: '#3D0101' });
		var shape = new THREE.BoxBufferGeometry( 4, 1, 1 );
		var mesh = new THREE.Mesh(shape, material);
		var tetris_figure = new THREE.Group();
		this.game_container.add(tetris_figure);
		tetris_figure.add(mesh);
	}
}