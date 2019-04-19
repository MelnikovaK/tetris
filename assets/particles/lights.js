var light = {
   maxAge: {
      value: 0.3
      },
  position: {
      value: new THREE.Vector3(10, 0, -50),
      spread: new THREE.Vector3( 3, 0, 0 )
      },

  acceleration: {
      value: new THREE.Vector3(0, -10, 0),
      spread: new THREE.Vector3( 2, 0, 2 )
  },
  velocity: {
    value: new THREE.Vector3(0, 25, 0),
    spread: new THREE.Vector3(1, 50, 1)
      },

      color: {
        value: [ new THREE.Color('white') ]
      },

      size: {
        value: 0.1
      },

  particleCount: 800
}