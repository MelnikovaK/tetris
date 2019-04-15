var accel = {
	particleCount: 90,
    type: SPE.distributions.DISC,
    position: {
      radius: 2,
      spread: new THREE.Vector3( 0.5 )
    },
    activeMultiplier: 200,

    velocity: {
      value: new THREE.Vector3( 1 )
    },
    rotation: {
      axis: new THREE.Vector3( 1, 0, 0 ),
      angle: Math.PI * 0.5,
      static: true
    },
    size: { value: 1 },
    color: {
      value: [
        new THREE.Color('grey'), new THREE.Color('skyblue')
      ]
    },
    opacity: { value: [0.1, 0.2, 0] }
}