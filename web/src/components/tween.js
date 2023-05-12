// create a new scene
var scene = new THREE.Scene();

// create a new Three.js object
var cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
var cubeMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
var cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
scene.add(cube);

// create a new TWEEN animation
var tween = new TWEEN.Tween(cube.position)
    .to({ x: 5 }, 1000) // move the cube 5 units to the right over 1 second
    .easing(TWEEN.Easing.Quadratic.Out); // use a quadratic easing function

// start the animation
tween.start();