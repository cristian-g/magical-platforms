var renderer;
var scene;
var camera;

function createRenderer(){
    renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(0x000000, 1.0);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
}

function createCamera(){
    camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        0.1,//near plane
        1000//far plane
    );
    camera.position.x = 90;
    camera.position.y = 32;
    camera.position.z = 32;
    camera.lookAt(scene.position);

    cameraControl = new THREE.OrbitControls(camera);
}

function createLight() {


    var directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
    directionalLight.position.set(100, 10, -50);
    directionalLight.name = 'directional';
    scene.add(directionalLight);

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
    var envGeometry = new THREE.SphereGeometry(90,32,32);

    var envMaterial = new THREE.MeshBasicMaterial();
    envMaterial.map = THREE.ImageUtils.loadTexture('assets/galaxy_starfield.png');
    envMaterial.side = THREE.BackSide;

    var envMesh = new THREE.Mesh(envGeometry, envMaterial);

    scene.add(envMesh)
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

function init() {

    scene = new THREE.Scene();

    createRenderer();
    createCamera();

    createLight();
    createBox();
    createPlane();
    createEarth();
    createClouds();
    createEnviroment();

    document.body.appendChild( renderer.domElement );

    render();
}

function render() {
    cameraControl.update();

    scene.getObjectByName('earth').rotation.y += 0.005;
    scene.getObjectByName('cloud').rotation.y += 0.003;

    renderer.render(scene, camera);
    requestAnimationFrame(render);
}

init();