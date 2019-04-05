var accel = {
			maxAge: {
                        value: 1
                    },
                    position: {
                        value: new THREE.Vector3(-50 + (2 * 25), -40, 0),
                        radius: 5,
                        spread: new THREE.Vector3( 3, 3, 3 )
                    },

                    velocity: {
                        value: new THREE.Vector3( 3, 3, 3 ),
                        distribution: SPE.distributions.BOX
                    },

                    color: {
                        value: [ new THREE.Color('white'), new THREE.Color('red') ]
                    },

                    size: {
                        value: 1
                    },

                    particleCount: 250
		}