var accel = {
			particleCount: 600,
			type: SPE.distributions.DISC,
			position: {
				radius: .4,
				value: new THREE.Vector3( 0,0,0 ),
				spread: new THREE.Vector3( 2, 2, 2 ),
			},
			maxAge: {
				value: 1.3,
				spread: 0
			},
			activeMultiplier: 100,
			velocity: {
				spread : new THREE.Vector3( 4 )
			},
			size: { value: 4 },
			color: {
				value: [
					new THREE.Color( 0.4, 0.2, 0.1 ),
					new THREE.Color( 0.2, 0.2, 0.2 )
				]
			},
			opacity: { value: [0.5, 0.2, 0] }
		}