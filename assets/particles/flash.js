var flash = {
    maxAge: {
        value: 0.5
    },
    position: {
        value: new THREE.Vector3(0, 0, -50),
        spread: new THREE.Vector3( 10, 10, 10 )
    },

    acceleration: {
        value: new THREE.Vector3(0, -10, 0),
        spread: new THREE.Vector3( 30, 30, 30 )
    },
    velocity: {
        value: new THREE.Vector3(0, 0, 25),
        spread: new THREE.Vector3(30, 30, 30)
    },

    color: {
        value: [ new THREE.Color('white'), new THREE.Color('skyblue') ]
    },

    size: {
        value: 0.2
    },

    particleCount: 2000
};