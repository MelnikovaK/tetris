class ThreejsRenderer {
	constructor( tetris, config, inputController ) {

		//events
		this.SHOW_FINISH_SCREEN = "screens: show_finish_modal";
		this.PRELOAD_COMPLETE = "screens:preload_complete";

		this.PARTICLES_PATH = tetris.PARTICLES_PATH;


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
		this.fullscreen = false;

		this.rows = [];
		
		this.preloadTextures();

		this.camera_rotations = { 
			'camera_left' : { parameter: 'x', value: -1 },
			'camera_right': { parameter: 'x', value: 1 },
			'camera_up': { parameter: 'y', value: 1 }, 
			'camera_down': { parameter: 'y', value: -1 }
		}; 
		

		window.addEventListener( "screens: start game" , function () {
			scope.initLines();
			scope.startRendering();
		});

		window.addEventListener( tetris.FIGURE_UPDATED , function () {
			scope.updateGameObjects('next_figure',false, 1, true);
			scope.setPreview();
			scope.updateGameObjects('figure', false, 1, false);
			scope.updateGameObjects('projection', true, 0.2, true);
		});


		window.addEventListener( tetris.FIGURE_ON_FINISH , function () {
			scope.fillLines();
			scope.jumpFigures();
			scope.removeAccessoryFigures('projection');
			scope.removeAccessoryFigures('next_figure');
			
		});

		window.addEventListener( tetris.FIGURE_MOVED , function (e) {
			if ( !scope.figure || !scope.figure.obj.children.length ) return;
			scope.updateFigurePosition(e.detail.projection_coord);
		});

		window.addEventListener( tetris.GAME_IS_OVER , function () {
			scope.removeAccessoryFigures('projection');
			scope.fillLines();
			setTimeout( function() {
				scope.destroyAllFigures();
			}, 800);
			setTimeout( function() {
				scope.removeAllFigures();
				Utils.triggerCustomEvent( window, scope.SHOW_FINISH_SCREEN );
				window.cancelAnimationFrame(scope.requestAnimationFrame_id);
				scope.removeAccessoryFigures('next_figure');
			}, 5000);
		});

		window.addEventListener( tetris.LINE_IS_FULL , function (e) {
			var line_index = e.detail.line_number;
			scope.destroyFigures(line_index, false);
		});

		window.addEventListener(tetris.PAUSE, function(e) {
			if ( e.detail.on_pause ) window.cancelAnimationFrame(scope.requestAnimationFrame_id);
			else scope.startRendering();
		});


		inputController.target.addEventListener( inputController.ACTION_ACTIVATED, function (e) {
			var acttion_name = e.detail.name;
			if ( acttion_name == 'fullscreen' ) scope.setFullScreen();
			if ( scope.camera_rotations[acttion_name] ) {
	 			if ( scope.current_action != acttion_name ) clearInterval(scope.moveCam ); 
				scope.current_action = acttion_name; 
				scope.moveCam = setInterval( scope.moveCamera.bind( scope, scope.camera_rotations[acttion_name].parameter, scope.camera_rotations[acttion_name].value ), 60); 
			}
		});

		inputController.target.addEventListener( inputController.ACTION_DEACTIVATED, function (e) {
			var acttion_name = e.detail.name;
			if ( scope.current_action == acttion_name ) clearInterval(scope.moveCam);
		});
	}

	preloadTextures() {
		var scope = this;

		var manager = new THREE.LoadingManager();

		manager.onLoad = function() {
			scope.initScene();
			scope.initContainers();
			scope.createAssets();
			scope.initGameField();

		 	Utils.triggerCustomEvent( window, scope.PRELOAD_COMPLETE, {scene: scope.scene, camera: scope.camera, 
		 														renderer: scope.renderer, game_container: scope.game_field});
		};

		manager.onProgress = function( item, loaded, total ) {
	    Utils.triggerCustomEvent( window, scope.PRELOAD_PROGRESS, loaded / total * 100 );
		};

		var textureLoader = new THREE.TextureLoader(manager);

		this.ground_texture = textureLoader.load( this.PARTICLES_PATH + "smokeparticle.png");
		this.wall_texture = textureLoader.load( this.PARTICLES_PATH + "sprite-explosion2.png");
	}

	moveCamera( moving_coord, param) {
		this.camera.position[moving_coord] += param;
		localStorage.setItem(moving_coord, this.camera.position[moving_coord])
		this.camera.lookAt( new THREE.Vector3(0,9,3) );
	}

	initScene() {
		var scope = this;

		const VIEW_ANGLE = 90;
		const ASPECT = 1;//window.innerWidth / window.innerHeight;
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

		camera.position.set( localStorage.x ? +localStorage.x : 3, localStorage.y ? +localStorage.y : 13, 15);
		camera.lookAt( new THREE.Vector3(0,9,3) );

		var scene = this.scene = new THREE.Scene();
		this.scene.add(this.camera);
		this.scene.background = new THREE.Color('#000547');

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

		var loader = new THREE.CubeTextureLoader();
		loader.setCrossOrigin( "" );
		loader.setPath( 'https://threejs.org/examples/textures/cube/pisa/' );

		var cubeTexture = this.cubeTexture = loader.load( [
		  'px.png', 'nx.png',
		  'py.png', 'ny.png',
		  'pz.png', 'nz.png'
		] );

		scene.background = cubeTexture;

		// var pointLight = new THREE.PointLight( 0xffffff, 1 );
		// this.scene.add( pointLight );
		// var t = 0;
		// setInterval(function(){
		// 	t+=.01;
		// 	pointLight.position.set( Math.sin(t)*10, Math.cos(t)*10+5, 1 );
		// });

	}
	setFullScreen() {
		this.fullscreen = this.fullscreen == true ? false : true;
		if ( this.fullscreen ) this.renderer.setSize(window.innerWidth, window.innerHeight);
		else this.renderer.setSize(this.field_width, this.field_height);

	}

	initContainers() {
		this.game_container = new THREE.Object3D();
		this.scene.add(this.game_container);

		this.game_field = new THREE.Object3D();
		this.game_field.position.y = .5;
		this.game_field.position.x = - this.cells_horizontal / 2 + .5;
		this.game_field.position.z = - this.cells_vertical / 2 + .5;
		this.game_container.add(this.game_field);

		//
		var pointLight = this.pointLight = new THREE.PointLight( 0xffffff, 1 );
		pointLight.intensity = .1;
		this.game_field.add( pointLight );	
	}

	initGameField() {
		var wallMaterial = new THREE.MeshPhongMaterial( { color:'#4D56FF', side: THREE.BackSide});
		var previewMaterial = new THREE.MeshPhongMaterial( { color:'#FBFF38'});
		var wall = new THREE.Mesh(new THREE.BoxBufferGeometry( this.cells_horizontal, this.cells_in_height - 2, this.cells_vertical ), wallMaterial);
		wall.position.y = this.cells_in_height / 2 - 1;
		this.game_container.add( wall );
		var preview = new THREE.Mesh(new THREE.PlaneBufferGeometry( 6, 6, 1, 1 ), previewMaterial);
		this.game_container.add( preview );

		preview.position.x = -9;
		preview.position.y = 15;
	}

	startRendering() {
		var scope = this;
		function render() {
		  scope.requestAnimationFrame_id = requestAnimationFrame( render );
		  scope.renderer.render( scope.scene, scope.camera );
		}
		render();
	}

	updateGameObjects(name, is_proj, opacity, is_visible) {
		this[name] = {
			shape: is_proj ? this.tetris.figure.shape.slice() : this.tetris[name].shape,
			obj: new THREE.Object3D()
		}
		for ( var i =  0; i < this[name].shape.length; i++) {
			this[name].obj.add(this.AM.pullAsset(is_proj ? this.tetris.figure.name : this.tetris[name].name))
			var child = this[name].obj.children[i];
			child.visible = is_visible;

			// child.geometry.computeVertexNormals();
			child.material.transparent = true;
			child.material.opacity = opacity;
			child.position.x = this[name].shape[i].x;
			child.position.y = is_proj ? 0 : this.cells_in_height - this[name].shape[i].y - 1;
			child.rotation.x = 0;
			child.position.z = 0;
		}
		this.game_field.add(this[name].obj);
	}

	updateFigurePosition(proj_coord) {
		var pivot_i;
		for (var i = 0; i < this.figure.shape.length; i++) {
			var dot = this.figure.shape[i];
			var proj = this.projection.shape[i];
			if ( dot.y >= 2 ) this.figure.obj.children[i].visible = true;
			else this.figure.obj.children[i].visible = false;
			//
			var obj = this.figure.obj.children[i];

			obj.position.x = dot.x;
			obj.position.y = this.cells_in_height - dot.y - 1;
			if ( this.figure.shape[i].pivot ) {
				this.pointLight.position.set( obj.position.x, obj.position.y, 1 );
			}
			//
			this.projection.obj.children[i].position.x = dot.x;
			this.projection.obj.children[i].position.y = obj.position.y - proj_coord;
		}
	}

	setPreview() {
		for ( var i = 0; i < this.next_figure.obj.children.length; i++ ) {
			var child = this.next_figure.obj.children[i];
			child.position.x -= 5;
			child.position.z += 1;
			child.position.y -= 6;
		}
	}

	initLines() {
		for ( var i = 0; i < this.tetris.rows.length; i++ ) this.rows[i] = [];
	}

	fillLines() {
		var objects = this.figure.obj.children;
		for ( var i = 0; i < objects.length; i++ ) {
			var z = Math.round(objects[i].position.y);
			this.rows[this.cells_in_height - z - 1].push(objects[i]);
		}
	}

	moveLines(line_index) {
		var removing_figures = [...this.rows[line_index]];
		for ( var i = line_index; i > 0; i-- ) {
			this.rows[i] = this.rows[i-1].slice();
			for ( var j = 0; j < this.rows[i].length; j++ ) {
				if (this.rows[i][j].position.y > 0) this.rows[i][j].position.y--;
			}
		}
		return removing_figures;
	}

	removeFigures(figures) {
		for ( var i = figures.length - 1; i >= 0; i = figures.length - 1 ) {
			this.AM.putAsset(figures[i]);
			figures[i].parent.remove(figures[i])
			figures.pop();
		}
	}

	removeAllFigures() {
		for ( var i = 0; i < this.rows.length; i++ ) {
			this.removeFigures(this.rows[i]);
		}
	}

	removeAccessoryFigures(figure) {
		for ( var i = this[figure].obj.children.length - 1; i >= 0; i = this[figure].obj.children.length - 1 ) {
			this.AM.putAsset(this[figure].obj.children[i]);
			this[figure].obj.remove(this[figure].obj.children[i]);
		}
	}

	destroyFigures(i, game_is_over) {
		var scope = this;
		var removing_figures;
		for ( var j = 0; j < this.rows[i].length; j++ ) {
		(function(i, j) {
			var counter = 0.1;
			var x_direction_value = Math.sin(Math.random()) * counter * Math.random();
			var z_direction_value = ~~( Math.random() * i) * 0.01;
			var obj = scope.rows[i][j];
			if ( !move ) {
				var move = function() {
					if ( counter == 0.4 && j == scope.rows[i].length - 1 && !game_is_over) removing_figures = scope.moveLines(i);
	        if ( counter < 8 ) setTimeout( move, 30 );
					else {
						if ( j == scope.rows[i].length - 1 && !game_is_over) scope.removeFigures(removing_figures);
						return;
					}
					if ( counter > 1 ) obj.position.y -= (Math.random()) * counter;
					if ( !game_is_over ) obj.position.y -= (Math.random()) * counter;
					else if ( counter > 1 ) obj.position.y -= (Math.random()) * counter;
					obj.position.z += z_direction_value;
					obj.position.x += x_direction_value;
					obj.rotation.x += Math.sin(Math.random()) * counter * 0.01;
					counter += 0.1;
				}				
			}
			move();
 		 })(i,j);
		} 
	}

	destroyAllFigures(i) {
		var i = 0, scope = this;
		var interv = setInterval(function() {
			scope.destroyFigures(i, true);
			i++;
			if ( i == scope.rows.length) clearInterval(interv)
		}, 200)
	}

	jumpFigures() {
		var scope = this;
		for ( var i = 0; i < this.rows.length; i++) {
			if ( !this.rows[i].length ) continue;
			for ( var j = 0; j < this.rows[i].length; j++ ) {
			(function(i, j) {
				var counter = 1;
				var obj = scope.rows[i][j];
				if ( !move ) {
					var interv = 30;
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
			var scope = this;
			let width = 1;
			let height = 1;
			let depth = 1;
			let radius0 = 0.1;
			let smoothness = 4;

		  let shape = new THREE.Shape();
		  let eps = 0.00001;
		  let radius = radius0 - eps;
		  shape.absarc( eps, eps, eps, -Math.PI / 2, -Math.PI, true );
		  shape.absarc( eps, height -  radius * 2, eps, Math.PI, Math.PI / 2, true );
		  shape.absarc( width - radius * 2, height -  radius * 2, eps, Math.PI / 2, 0, true );
		  shape.absarc( width - radius * 2, eps, eps, 0, -Math.PI / 2, true );
		  var geometry = new THREE.ExtrudeBufferGeometry( shape, {
		    amount: depth - radius0 * 2,
		    bevelEnabled: true,
		    bevelSegments: smoothness * 2,
		    steps: 1,
		    bevelSize: radius,
		    bevelThickness: radius0,
		    curveSegments: smoothness
		  });
		  
		  geometry.center();

		var metallness = .5;
		var roughness = .5;

		this.AM.addAsset('rectangle', function() { return createShape(new THREE.MeshStandardMaterial( {
			color: '#86DA10',
			// shininess: 50,
    	metalness: metallness,
    	envMap: scope.cubeTexture,
    	roughness: roughness
    }));} , 15);
		this.AM.addAsset('cross', function() { return createShape(new THREE.MeshStandardMaterial( {
			color: '#FFB3F9',
			// shininess: 50,
    	metalness: metallness,
    	envMap: scope.cubeTexture,
    	roughness: roughness
    }));} , 15);
		this.AM.addAsset('square', function() { return createShape(new THREE.MeshStandardMaterial( {
			color: '#FF1C00',
			// shininess: 50,
    	metalness: metallness,
    	envMap: scope.cubeTexture,
    	roughness: roughness
    }));} , 15);
		this.AM.addAsset('stairs-left', function() { return createShape(new THREE.MeshStandardMaterial( {
			color: '#00ACF5',
			// shininess: 50,
    	metalness: metallness,
    	envMap: scope.cubeTexture,
    	roughness: roughness
    })); }, 15);
		this.AM.addAsset('stairs-right', function() { return createShape(new THREE.MeshStandardMaterial( {
			color: '#B400F5',
			// shininess: 50,
    	metalness: metallness,
    	envMap: scope.cubeTexture,
    	roughness: roughness
    })); }, 15);
		this.AM.addAsset('t-shape', function() { return createShape(new THREE.MeshStandardMaterial( {
			color: '#FF890A',
			// shininess: 50,
    	metalness: metallness,
    	envMap: scope.cubeTexture,
    	roughness: roughness
    }));} , 15);
		this.AM.addAsset('l-left', function() { return createShape(new THREE.MeshStandardMaterial( {
			color: '#ED50D8',
			// shininess: 50,
    	metalness: metallness,
    	envMap: scope.cubeTexture,
    	roughness: roughness
    }));} , 15);
		this.AM.addAsset('l-right', function() {return createShape(new THREE.MeshStandardMaterial( {
			color: '#0FFFC6',
			// shininess: 50,
    	metalness: metallness,
    	envMap: scope.cubeTexture,
    	roughness: roughness
    }));} , 15);		

	
		function createShape(material) {
			// return new THREE.Mesh(new THREE.BoxGeometry( 1, 1, 1, 5, 5, 5 ), material);
			return new THREE.Mesh( geometry.clone(), material);

		}
	}
}