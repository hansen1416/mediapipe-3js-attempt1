function fire(x,y,z,color){
    var geometry = new THREE.SphereGeometry( 0.2, 32, 32 );
    var material = new THREE.MeshBasicMaterial( { color: color } );
    var sphere = new THREE.Mesh( geometry, material );
    sphere.position.x = x;
    sphere.position.y = y;
    sphere.position.z = z;
    scene.add( sphere );
    
    var tween = new TWEEN.Tween(sphere.scale)
        .to({x:7,y:7,z:7},1000)
        .easing(TWEEN.Easing.Quadratic.Out)
        .onComplete(function(){
            scene.remove(sphere);
        });
    tween.start();
}


function animate() {
    requestAnimationFrame( animate );
    TWEEN.update();
    fire(Math.random()*10-5,Math.random()*10-5)
}