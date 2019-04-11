class ThreejsParticles {
	constructor($container, renderer, config, game) {

		this.ASSETS_PATH = config.ASSETS_PATH;

		this.game = game;

		this.scene = renderer.scene;
		this.camera = renderer.camera;
		this.renderer = renderer.renderer;
		this.game_container = renderer.game_container;
		this.initEmitter();

		var scope = this;
		window.addEventListener( game.GAME_IS_OVER , function () {
		});

		window.addEventListener( game.FIGURE_ON_FINISH , function () {
			scope.updateEmitterGroup(scope.accel_group);
		});

		window.addEventListener( game.LINE_IS_FULL , function () {
		});

		window.addEventListener( "screens:preload_complete" , function (e) {
			
		});

	}


	initEmitter() {
		var clock = new THREE.Clock();
		var stats = new Stats();

		//GROUPS
		this.accel_group = this.createGroup('particles/eye.png');

		this.accel_group.addPool(10, new SPE.Emitter( accel ), false);

		this.game_container.add( this.accel_group.mesh );
		
		var scope = this;

		var dt = clock.getDelta();
		function render(dt) {
			scope.accel_group.tick( dt );
	    scope.renderer.render( scope.scene, scope.camera );
		}

		function animate() {
	    requestAnimationFrame( animate );
	    render( clock.getDelta() );
	    stats.update();
		}

		animate();
	}

	createGroup( texture_name ) {
		var textureLoader = new THREE.TextureLoader();
		return new SPE.Group({
			texture: {
				value: textureLoader.load( this.ASSETS_PATH + texture_name ),
				frames: new THREE.Vector2( 5, 5 ),
				loop: 1
			},
			blending: THREE.AdditiveBlending,
			scale: 100
		});
	} 

	updateEmitterGroup( emitter_group ) {
		var figure = this.game.figure.shape[1];
    	emitter_group.triggerPoolEmitter( 1, (new THREE.Vector3( figure.x, figure.y, figure.z )) );
	}

}