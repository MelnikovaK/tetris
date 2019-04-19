class ThreejsParticles {
	constructor(game) {

		this.PARTICLES_PATH = game.PARTICLES_PATH;

		this.game = game;

		var scope = this;
		window.addEventListener( game.GAME_IS_OVER , function () {
		});

		window.addEventListener( game.EMIT_PARTICLES , function (e) {
			scope.updateEmitterGroup(scope.accel_group, e.detail.x, e.detail.z, e.detail.y);
		});

		window.addEventListener( game.FIGURE_DROP , function (e) {
			scope.updateEmitterGroup(scope.lights_group, e.detail.x, e.detail.y, e.detail.z);
		});

		window.addEventListener( game.LINE_IS_FULL , function (e) {
			scope.updateEmitterGroup(scope.flash_group, 5, 10, 0);
		});
		window.addEventListener( "screens:preload_complete" , function (e) {
			scope.scene = e.detail.scene;
			scope.camera = e.detail.camera;
			scope.renderer = e.detail.renderer;
			scope.game_field = e.detail.game_field;
			scope.initEmitter();
		});

	}


	initEmitter() {
		var clock = new THREE.Clock();
		var stats = new Stats();

		//GROUPS
		this.accel_group = this.createGroup( this.PARTICLES_PATH + 'sprite-explosion2.png' );
		this.lights_group = this.createGroup( this.PARTICLES_PATH + 'smokeparticle.png' );
		this.flash_group = this.createGroup( this.PARTICLES_PATH + 'smokeparticle.png' );

		this.accel_group.addPool(10, new SPE.Emitter( accel ), false);
		this.lights_group.addPool(10, new SPE.Emitter( light ), false);
		this.flash_group.addPool(10, new SPE.Emitter( flash ), false);

		this.game_field.add( this.accel_group.mesh, this.lights_group.mesh, this.flash_group.mesh );
		
		var scope = this;

		var dt = clock.getDelta();
		function render(dt) {
			scope.accel_group.tick( dt );
			scope.lights_group.tick( dt );
			scope.flash_group.tick( dt );
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
				value: THREE.ImageUtils.loadTexture( texture_name ),
				frames: new THREE.Vector2( 5, 5 ),
				loop: 1
			},
			depthTest: true,
			depthWrite: false,
			blending: THREE.AdditiveBlending,
			scale: 600
		});
	} 

	updateEmitterGroup( emitter_group, x, y, z ) {
    	emitter_group.triggerPoolEmitter( 1, (new THREE.Vector3( x, z == 0 ? this.game.cells_height - y - 1: 0 , y == 0 ? this.game.cells_height - z - 1: 0 )) );
	}
}