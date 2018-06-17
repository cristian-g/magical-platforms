'use strict';

var renderer;
var scene;
var camera;

var up = true;
var reference_pos = 0;

Physijs.scripts.worker = 'js/physijs_worker.js';
Physijs.scripts.ammo = 'ammo.js';

var initScene, render,
    ground_material, box_material, block_materials,
    render_stats, physics_stats, ground, light,
    vehicle_body, vehicle, loader;

function createRenderer(){
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    //renderer.setClearColor(0x000000, 1.0);
    //renderer.setClearColor (0xff0000, 1);
    renderer.setClearColor( 0x000000, 0 ); // the default


    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMapSoft = true;
}

function createRenderStats() {
    render_stats = new Stats();
    render_stats.domElement.style.position = 'absolute';
    render_stats.domElement.style.top = '1px';
    render_stats.domElement.style.zIndex = 100;
    document.body.appendChild( render_stats.domElement );
}

function createPhysicsStats() {
    physics_stats = new Stats();
    physics_stats.domElement.style.position = 'absolute';
    physics_stats.domElement.style.top = '50px';
    physics_stats.domElement.style.zIndex = 100;
    document.body.appendChild( physics_stats.domElement );
}

function createCamera(){
    camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        0.1,//near plane
        1000000//far plane
    );
    camera.position.x = 0;
    camera.position.y = 30;
    camera.position.z = -50;

    camera.lookAt(scene.position);

    //cameraControl = new THREE.OrbitControls(camera);
}

function createLight() {
    /*var directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
    directionalLight.position.set(100, 10, -50);
    directionalLight.name = 'directional';
    scene.add(directionalLight);*/
    // Light
    light = new THREE.DirectionalLight( 0xFFFFFF );
    light.position.set( 20, 20, -15 );
    light.target.position.copy( scene.position );
    /*light.castShadow = true;
    light.shadowCameraLeft = -150;
    light.shadowCameraTop = -150;
    light.shadowCameraRight = 150;
    light.shadowCameraBottom = 150;
    light.shadowCameraNear = 20;
    light.shadowCameraFar = 400;
    light.shadowBias = -.0001
    light.shadowMapWidth = light.shadowMapHeight = 2048;
    light.shadowDarkness = .7;*/
    scene.add( light );

    var ambirentLight = new THREE.AmbientLight(0x111111);
    scene.add(ambirentLight);

}

function createBox(){
    var boxGeometry = new THREE.BoxGeometry(6,4,6);
    var boxMaterial = createEarthMaterial();
        //new THREE.MeshLambertMaterial({color: "red"});

    var box = new THREE.Mesh(boxGeometry, boxMaterial);
    box.castShadow = true;
    scene.add(box);

}

function createPlane() {
    var planeGeometry = new THREE.PlaneGeometry(20,20);
    var planeMaterial = new THREE.MeshLambertMaterial(
        {color: 0xcccccc}
    );
    var plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.receiveShadow = true;
    plane.rotation.x = -0.5 * Math.PI;
    plane.position.y = -2;
    scene.add(plane);

}

function createEarth(){
    var sphereGeometry = new THREE.SphereGeometry(15, 30, 30);
    var sphereMaterial = new createEarthMaterial();
    var earthMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
    earthMesh.name = 'earth';

    scene.add(earthMesh);
}

function createClouds(){
    var sphereGeometry = new THREE.SphereGeometry(15.1, 30, 30);
    var sphereMaterial = new createCloudMaterial();
    var cloudMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
    cloudMesh.name = 'cloud';

    scene.add(cloudMesh);
}

function createEnviroment(){
    var envGeometry = new THREE.SphereGeometry(9000,32,32);

    var envMaterial = new THREE.MeshBasicMaterial();
    envMaterial.map = THREE.ImageUtils.loadTexture('assets/galaxy_starfield.png');
    envMaterial.side = THREE.BackSide;

    var envMesh = new THREE.Mesh(envGeometry, envMaterial);

    scene.add(envMesh)
}

function createLee(){
    var material = new createLeeMaterial();

    var loader = new THREE.OBJLoader();

    loader.load('assets/lee/lee.obj', function(object){

        object.traverse(function (child) {

            if (child instanceof THREE.Mesh){
                child.material = material;
                child.receiveShadow = true;
                child.castShadow = true;
            }
        });
        scene.add(object);

    });
}

function createGround(ground_material) {
    var NoiseGen = new SimplexNoise;

    var ground_geometry = new THREE.PlaneGeometry( 300, 300, 100, 100 );
    for ( var i = 0; i < ground_geometry.vertices.length; i++ ) {
        var vertex = ground_geometry.vertices[i];
        //vertex.y = NoiseGen.noise( vertex.x / 30, vertex.z / 30 ) * 1;
    }
    ground_geometry.computeFaceNormals();
    ground_geometry.computeVertexNormals();

    // If your plane is not square as far as face count then the HeightfieldMesh
    // takes two more arguments at the end: # of x faces and # of z faces that were passed to THREE.PlaneMaterial
    ground = new Physijs.HeightfieldMesh(
        ground_geometry,
        ground_material,
        0 // mass
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add( ground );
}

function createBox(box_material, x, y, z) {
    var size = 5.5;
    var box = new Physijs.SphereMesh(
        new THREE.SphereGeometry( size ),
        box_material
    );
    box.castShadow = box.receiveShadow = true;
    box.position.set(
        x,
        y,
        z
    );
    scene.add( box );
}

function createVehicle() {
    var json_loader = new THREE.JSONLoader();

    json_loader.load( "models/mustang.js", function( car, car_materials ) {
        json_loader.load( "models/mustang_wheel.js", function( wheel, wheel_materials ) {
            var mesh = new Physijs.BoxMesh(
                car,
                new THREE.MeshFaceMaterial( car_materials )
            );
            mesh.position.y = 2;
            mesh.position.z = 3;
            mesh.castShadow = mesh.receiveShadow = true;

            vehicle = new Physijs.Vehicle(mesh, new Physijs.VehicleTuning(
                10.88,
                1.83,
                0.28,
                500,
                10.5,
                6000
            ));
            //mesh.add(camera);
            scene.add( vehicle );

            var wheel_material = new THREE.MeshFaceMaterial( wheel_materials );

            var wheel2 = wheel.clone();
            wheel2.rotateZ(180 * Math.PI / 180);
            for ( var i = 0; i < 4; i++ ) {
                vehicle.addWheel(
                    i % 2 === 0 ? wheel : wheel2,
                    wheel_material,
                    new THREE.Vector3(
                        i % 2 === 0 ? -1.6 : 1.6,
                        -1,
                        i < 2 ? 3.3 : -3.2
                    ),
                    new THREE.Vector3( 0, -1, 0 ),
                    new THREE.Vector3( -1, 0, 0 ),
                    0.5,
                    0.7,
                    i < 2 ? false : true
                );
            }

            input = {
                power: null,
                direction: null,
                steering: 0,
                enabled: false
            };
            document.addEventListener('keydown', function( ev ) {
                switch ( ev.keyCode ) {
                    case 37: // left
                        input.direction = 1;
                        break;

                    case 38: // forward
                        input.power = true;
                        break;

                    case 39: // right
                        input.direction = -1;
                        break;

                    case 40: // back
                        input.power = false;
                        break;
                }
            });
            document.addEventListener('keyup', function( ev ) {
                switch ( ev.keyCode ) {
                    case 37: // left
                        input.direction = null;
                        break;

                    case 38: // forward
                        input.power = null;
                        break;

                    case 39: // right
                        input.direction = null;
                        break;

                    case 40: // back
                        input.power = null;
                        break;
                }
            });
        });
    });
}

function createLeeMaterial(){
    var leeTexture = new THREE.Texture();
    var loader = new THREE.ImageLoader();
    loader.load('assets/lee/lee_diffuse.jpg', function(image){
        leeTexture.image = image;
        leeTexture.needsUpdate = true;
    });

    var leeMaterial = new THREE.MeshPhongMaterial();
    leeMaterial.map = leeTexture;

    var normalMap = new THREE.Texture();
    loader.load('assets/lee/lee_normal_tangent.jpg', function(image){
        normalMap.image = image;
        normalMap.needsUpdate = true;
    });

    leeMaterial.normalMap = normalMap;
    leeMaterial.normalScale = new THREE.Vector2(1.0, 1.0);

    var specularMap = new THREE.Texture();
    loader.load('assets/lee/lee_spec.jpg', function(image){
        specularMap.image = image;
        specularMap.needsUpdate = true;
    });

    leeMaterial.specularMap = specularMap;
    leeMaterial.specular = new THREE.Color(0x262626);

    return leeMaterial;
}

function createCloudMaterial(){
    var cloudTexture = new THREE.Texture();
    var loader = new THREE.ImageLoader();
    loader.load('assets/fair_clouds_1k.png', function(image){
        cloudTexture.image = image;
        cloudTexture.needsUpdate = true;
    });

    var cloudMaterial = new THREE.MeshLambertMaterial();
    cloudMaterial.map = cloudTexture;
    cloudMaterial.transparent = true;

    return cloudMaterial;
}

function createEarthMaterial() {
  var earthTexture = new THREE.Texture();
  var loader = new THREE.ImageLoader();
  loader.load('assets/earthmap2k.jpg', function(image){
    earthTexture.image = image;
    earthTexture.needsUpdate = true;
  });

  var earthMaterial = new THREE.MeshPhongMaterial();
  earthMaterial.map = earthTexture;

  var normalMap = new THREE.Texture();
  loader.load('assets/earth_normalmap_flat2k.jpg', function(image){
      normalMap.image = image;
      normalMap.needsUpdate = true;
  });

  earthMaterial.normalMap = normalMap;
  earthMaterial.normalScale = new THREE.Vector2(1.0, 1.0);

  var specularMap = new THREE.Texture();
  loader.load('assets/earthspec2k.jpg', function(image){
      specularMap.image = image;
      specularMap.needsUpdate = true;
  });

  earthMaterial.specularMap = specularMap;
  earthMaterial.specular = new THREE.Color(0x262626);

    return earthMaterial;

}

function createBoxMaterial(loader) {
    box_material = Physijs.createMaterial(
        new THREE.MeshLambertMaterial({ map: loader.load( 'images/plywood.jpg' ) }),
        .4, // low friction
        .6 // high restitution
    );
    box_material.map.wrapS = box_material.map.wrapT = THREE.RepeatWrapping;
    box_material.map.repeat.set( .25, .25 );
    return box_material;
}

function createBlockMaterial(path, loader) {
    var material = Physijs.createMaterial(
        new THREE.MeshLambertMaterial({ map: loader.load( path ) }),
        .4, // low friction
        .6 // high restitution
    );
    material.map.wrapS = material.map.wrapT = THREE.RepeatWrapping;
    material.map.repeat.set( .25, .25 );
    return material;
}

function createBlockMaterials(loader) {
    var materialsArray = [];
    materialsArray.push(createBlockMaterial('images/blocks_blue.jpg', loader));
    materialsArray.push(createBlockMaterial('images/blocks_cyan.jpg', loader));
    materialsArray.push(createBlockMaterial('images/blocks_green.jpg', loader));
    materialsArray.push(createBlockMaterial('images/blocks_pink.jpg', loader));
    materialsArray.push(createBlockMaterial('images/blocks_purple.jpg', loader));
    materialsArray.push(createBlockMaterial('images/blocks_red.jpg', loader));
    materialsArray.push(createBlockMaterial('images/blocks_yellow.jpg', loader));
    return materialsArray;
}

function assignUVs(geometry) {
    // Thanks to: https://stackoverflow.com/questions/20774648/three-js-generate-uv-coordinate

    geometry.faceVertexUvs[0] = [];

    geometry.faces.forEach(function(face) {

        var components = ['x', 'y', 'z'].sort(function(a, b) {
            return Math.abs(face.normal[a]) > Math.abs(face.normal[b]);
        });

        var v1 = geometry.vertices[face.a];
        var v2 = geometry.vertices[face.b];
        var v3 = geometry.vertices[face.c];

        geometry.faceVertexUvs[0].push([
            new THREE.Vector2(v1[components[0]], v1[components[1]]),
            new THREE.Vector2(v2[components[0]], v2[components[1]]),
            new THREE.Vector2(v3[components[0]], v3[components[1]])
        ]);

    });

    geometry.uvsNeedUpdate = true;
}

var blocksArray = [];

var blockSeparation = 10;

var maxBlocks = 20;

var points = 0;

var firstY = -30;
var heightRatio = 0.2;
var blockHeight = 10;
var deathMargin = 200;
var deathDetected = false;

var lastBlockI = 0;

function init() {

    //scene = new THREE.Scene();
    scene = new Physijs.Scene;
    scene.setGravity(new THREE.Vector3( 0, -30, 0 ));
    scene.fog = new THREE.FogExp2( 0xFFFFFF, 0.0055 );

    // Loader
    loader = new THREE.TextureLoader();
    box_material = createBoxMaterial(loader);
    block_materials = createBlockMaterials((loader));

    scene.addEventListener(
        'update',
        function() {

            if ( input && input.enabled && vehicle ) {
                if ( input.direction !== null ) {
                    input.steering += input.direction / 50;
                    if ( input.steering < -.6 ) input.steering = -.6;
                    if ( input.steering > .6 ) input.steering = .6;
                    //camera.position.x += input.steering;
                }
                vehicle.setSteering( input.steering, 0 );
                vehicle.setSteering( input.steering, 1 );

                if ( input.power === true ) {
                    vehicle.applyEngineForce( 300 );
                } else if ( input.power === false ) {
                    vehicle.setBrake( 20, 2 );
                    vehicle.setBrake( 20, 3 );
                } else {
                    vehicle.applyEngineForce( 0 );
                }
            }

            scene.simulate( undefined, 2 );
            physics_stats.update();
        }
    );

    createRenderer();
    createRenderStats();
    createPhysicsStats();

    createCamera();

    for (var i = 0; i < maxBlocks; i ++) {

        var tileSize = Math.floor(Math.random() * 2) + 4;
        var geometry = new THREE.CylinderGeometry( 1, tileSize*3, blockHeight, 4 );

        assignUVs(geometry);

        if (i == 0 || i == 1) {
            var positionX   = 0;
        }
        else {
            var positionX   = Math.random() * (20 - 0) -10;
        }
        var positionZ   = i * blockSeparation;
        var positionY   = firstY - (heightRatio*positionZ);
        var rotationY   = Math.random()*Math.PI*2;
        var rotationX   = Math.PI;

        var material_hidden = new THREE.MeshBasicMaterial();
        material_hidden.visible = false;

        var lowPoly = new Physijs.ConvexMesh( geometry, block_materials[Math.round(Math.random() * 6)], 0 );
        lowPoly.position.x   = positionX;
        lowPoly.position.y   = positionY;
        lowPoly.position.z   = positionZ;
        lowPoly.rotation.x   = rotationX;
        // put a random rotation
        lowPoly.rotation.y   = rotationY;

        scene.add( lowPoly );
        blocksArray.push(lowPoly);

        if (i == 20) {
            createBox(box_material, positionX, positionY+10, positionZ);
        }
    }

    lastBlockI = maxBlocks - 1;

    var texture = new THREE.Texture();
    var loader = new THREE.ImageLoader();
    loader.load('assets/fair_clouds_1k.png', function(image){
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping
        texture.repeat.set(0.5, 1);
        texture.image = image;
        texture.needsUpdate = true;
    });




    //console.log(cityGeometry, new THREE.MeshPhongMaterial());
    //var cube = new THREE.Mesh( geometry );
    //scene.add( final );

    //createGround(ground_material);
    createVehicle();

    createLight();
    /*
    //createBox();
    //createPlane();
    //createEarth();
    //createClouds();
    createLee();
    //createEnviroment();*/

    document.getElementById('blocksScene').appendChild( renderer.domElement );

    //render();
    requestAnimationFrame( render );
    scene.simulate();
}

//var prueba = 0.1;

render = function() {



    //cameraControl.update();

    //scene.getObjectByName('earth').rotation.y += 0.005;
    //scene.getObjectByName('cloud').rotation.y += 0.003;

    //renderer.render(scene, camera);
    //requestAnimationFrame(render);

    requestAnimationFrame( render );
    if ( vehicle ) {

        var movingVelocity = vehicle.mesh.position.z * 0.0002 + 0.005;
        var maxAmplitude = vehicle.mesh.position.z * 0.1 + 10;
        if (maxAmplitude > 60) {
            maxAmplitude = 60;
        }

        if (reference_pos > maxAmplitude){
            up = false;
        }

        if (reference_pos < (-1)*maxAmplitude){
            up = true
        }

        for (var i = 0; i < blocksArray.length; i++) {
            var falling = false;
            if (blocksArray[i].position.z + blockSeparation < vehicle.mesh.position.z) {
                blocksArray[i].position.y -= 0.5;// Falling velocity
                blocksArray[i].__dirtyPosition = true;
                falling = true;
                if (blocksArray[i].position.z + (blockSeparation * 3) < vehicle.mesh.position.z) {
                    lastBlockI++;
                    var positionZ = lastBlockI * blockSeparation;
                    var positionY = firstY - (heightRatio * positionZ);
                    blocksArray[i].position.z = positionZ;
                    blocksArray[i].position.y = positionY;
                }
            }
            if (i == 0 || i == 1) {
                continue;
            }

            if (!falling && i%3 == 0 && up ){
                reference_pos += movingVelocity;
                blocksArray[i].position.y += movingVelocity;
                blocksArray[i].__dirtyPosition = true;
            }

            if (!falling && i%3 == 0 && !up ){
                reference_pos -= movingVelocity;
                blocksArray[i].position.y -= movingVelocity;
                blocksArray[i].__dirtyPosition = true;
            }
        }

        /*if ( input.direction !== null ) {
            if (input.steering < 0) {
                prueba += 0.1;
            }
            else {
                prueba -= 0.1;
            }
        }
        else {
            prueba -= 0.1;
            if (prueba <= 0) {
                prueba = 0;
            }
        }*/
        // sacar front vector: sacar rotacion de la view matrix. luego multiplicas esa rotacion por vector (0, 1, 0), te dará el frontVector
        // buscar en google: extractRotation
        camera.position.copy( vehicle.mesh.position ).add( new THREE.Vector3( 0, 30/*lo colocamos aqui*/, -50 ) );
        camera.lookAt( vehicle.mesh.position );

        //light.target.position.copy( vehicle.mesh.position );
        //light.position.addVectors( light.target.position, new THREE.Vector3( 20, 20, -15 ) );

        var deathY = firstY - (vehicle.mesh.position.z * heightRatio) + blockHeight - deathMargin;
        if (vehicle.mesh.position.y < deathY && !deathDetected) {
            deathDetected = true;
            swal({
                title: "Game over",
                text: 'You earned ' + points + ' points',
                button: "Play again",
                closeOnEsc: false,
                closeOnClickOutside: false
            }).then(function(isConfirm) {
                if (isConfirm) {
                    window.location.reload(false);
                }
            });
        }
        if (!deathDetected) {
            points = Math.round(vehicle.mesh.position.z/10);
            jQuery('#points').html(points + ' points');
        }
    }






    renderer.render( scene, camera );
    render_stats.update();
}

init();