class ThreejsParticles {
	constructor(game) {

		this.PARTICLES_PATH = game.PARTICLES_PATH;

		this.game = game;

		var scope = this;
		window.addEventListener( game.GAME_IS_OVER , function () {
		});

		window.addEventListener( game.EMIT_PARTICLES , function () {
			scope.updateEmitterGroup(scope.accel_group);
		});

		window.addEventListener( game.LINE_IS_FULL , function () {
		});

		window.addEventListener( "screens:preload_complete" , function (e) {
			scope.scene = e.detail.scene;
			scope.camera = e.detail.camera;
			scope.renderer = e.detail.renderer;
			scope.game_container = e.detail.game_container;
			scope.initEmitter();
		});

	}


	initEmitter() {
		var clock = new THREE.Clock();
		var stats = new Stats();

		//GROUPS
		this.accel_group = this.createGroup( this.PARTICLES_PATH + 'sprite-explosion2.png' );

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
		return new SPE.Group({
			texture: {
				value: THREE.ImageUtils.loadTexture( this.PARTICLES_PATH + 'sprite-explosion2.png' ),
				frames: new THREE.Vector2( 5, 5 ),
				loop: 1
			},
			depthTest: true,
			depthWrite: false,
			blending: THREE.AdditiveBlending,
			scale: 600
		});
	} 

	updateEmitterGroup( emitter_group ) {
		var figure = this.game.figure.shape[3];
    	emitter_group.triggerPoolEmitter( 1, (new THREE.Vector3( figure.x, 0, this.game.cells_height - figure.y )) );
	}
}