//import { Zombie } from "js/Zombie.js";
/*
Zombie = function(){
    var geometry = new THREE.BoxGeometry( 1, 5, 1);
    var material = new THREE.MeshBasicMaterial({color: 0x4aa02c});
    var parallelepiped = new THREE.Mesh( geometry, material);

    //scene.add(parallelepiped);
    return parallelepiped
}*/
//document.write('<script type"text/javascript" src="js/physi.js"></script>');

//Physijs.scripts.worker = 'js/physijs_worker.js';
//Physijs.scripts.ammo = 'js/ammo.js';

var scene, camera, renderer, mesh, clock, controls;

var body_Id = 0;
//var neck_Id = 1;
var head_Id = 1;
var left_leg_Id = 2;
var right_leg_Id = 3;
var left_arm_Id = 4;
var right_arm_Id = 5;
//var left_eye_Id = 6;
//var right_eye_Id = 7;
//var nose_Id = 8;
var numNodes = 6;
var zombie_1 = [];

var bullets = [];
var canShoot = 0;
var keyboard = {};
var pun = 0;
var tempo = 10;
var MOVESPEED = 30;
var LOOKSPEED = 1;
var BULLETMOVESPEED = MOVESPEED * 5;
var DURATIONTIME = 150000; //in millisec
var NZOMBIE = 10;
var zombie = [];

var width = window.innerWidth;
var height = window.innerHeight;

var mouse = new THREE.Vector2(0,0);
var loadingScreen = {
    scene: new THREE.Scene(),
    camera: new THREE.PerspectiveCamera(45, width / height, 0.3, 100),
    box: new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), new THREE.MeshBasicMaterial({
        color: 0x4444ff
    }))
};
var player = {
    height: 1.8,
    speed: 0.2,
    turnSpeed: Math.PI * 0.02
};
var meshes = {};
var loadingManager = null;
var RESOURCES_LOADED = false;

var models = {
    uzi: {
        obj: "models/uziGold.obj",
        mtl: "models/uziGold.mtl",
        mesh: null,
        castShadow: false
    }
    /*
        city: {
          //obj:"models/city1/Street environment_V01.obj",
          //mtl:"models/city1/Street environment_V01.mtl",
          obj:"models/city5/sehir.obj",
          mtl:"models/city5/sehir.mtl",
          mesh: null,
          castShadow: false
        }*/
};

window.onload = init();

function init() {
    //____________________________SCENE & CAMERA_______________________________________
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, width / height, 0.3, 1000);
    
    var texture_scene = new THREE.TextureLoader().load('resources/cielo_rosso.jpg', function(texture) {scene.background = texture;});
    scene.fog = new THREE.FogExp2(0xd0e0f0, 0.0025);
    
    
    

    loadingScreen.box.position.set(0, 0, 5);
    loadingScreen.camera.lookAt(loadingScreen.box.position);
    loadingScreen.scene.add(loadingScreen.box);
    loadingManager = new THREE.LoadingManager();
    loadingManager.onLoad = function() {
        RESOURCES_LOADED = true;
        onResourcesLoaded();
    };

    //___________________________PROCEDURAL CITY_______________________________________
    //Basically we have 2 cities: createSquareCity() and createMrDoobCity();
    var proceduralCity = new THREEx.ProceduralCity().createSquareCity();
    scene.add(proceduralCity);

    //_____________________________________LIGHT________________________________________
    var light = new THREE.HemisphereLight(0xfffff0, 0x101020, 1.25);
    light.position.set(1, 1, 0.25);
    scene.add(light);

    for (var _key in models) {
        (function(key) {

            var mtlLoader = new THREE.MTLLoader(loadingManager);
            mtlLoader.load(models[key].mtl, function(materials) {
                materials.preload();

                var objLoader = new THREE.OBJLoader(loadingManager);

                objLoader.setMaterials(materials);
                objLoader.load(models[key].obj, function(mesh) {

                    mesh.traverse(function(node) {
                        if (node instanceof THREE.Mesh) {
                            if ('castShadow' in models[key])
                                node.castShadow = models[key].castShadow;
                            else
                                node.castShadow = true;

                            if ('receiveShadow' in models[key])
                                node.receiveShadow = models[key].receiveShadow;
                            else
                                node.receiveShadow = true;
                        }
                    });
                    models[key].mesh = mesh;

                });
            });

        })(_key);
    }

    camera.position.set(0, player.height, -5);
    camera.lookAt(new THREE.Vector3(0, player.height, 0));

    renderer = new THREE.WebGLRenderer({antialiasing: true});
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.BasicShadowMap;
    document.body.appendChild(renderer.domElement);

    
    
    //for ( var i = 0; i < NZOMBIE; i++){
        var loader = new THREE.TextureLoader();
        //load('resources/zombie.png', function(texture) {body.background = texture;});
        
        var body_geometry      = new THREE.BoxGeometry( 0.4, 0.55, 0.25);
        //var neck_geometry      = new THREE.BoxGeometry( 0.1, 0.05, 0.085);
        var head_geometry      = new THREE.BoxGeometry( 0.4, 0.25, 0.35);
        var left_leg_geometry  = new THREE.BoxGeometry( 0.2, 0.6, 0.25);
        var right_leg_geometry = new THREE.BoxGeometry( 0.2, 0.6, 0.25);
        var left_arm_geometry  = new THREE.BoxGeometry( 0.19, 0.65, 0.25);
        var right_arm_geometry = new THREE.BoxGeometry( 0.19, 0.65, 0.25);
        //var left_eye_geometry  = new THREE.BoxGeometry( 0.1, 0.03, 0.1);
        //var right_eye_geometry = new THREE.BoxGeometry( 0.1, 0.03, 0.1);
        //var nose_geometry      = new THREE.BoxGeometry( 0.09, 0.045, 0.1)

        //var body_material      = new THREE.MeshLambertMaterial({color: 0x00ff00});
        var body_material      = new THREE.MeshLambertMaterial({map: loader.load('resources/zombie_arancione.png')});
        var head_material      = new THREE.MeshLambertMaterial({map: loader.load('resources/zombie_arancione.png'), function(texture){
                                                                                                                        texture.offset(new THREE.Vector2(15,15));
                                                                                                                    } 
                                                                                                        });
        //var neck_material      = new THREE.MeshLambertMaterial({color: 0x000000});
        //var head_material      = new THREE.MeshLambertMaterial({color: 0xe107a9});
        var left_leg_material  = new THREE.MeshLambertMaterial({color: 0x2a4acd});
        var right_leg_material = new THREE.MeshLambertMaterial({color: 0x2a4acd});
        var left_arm_material  = new THREE.MeshLambertMaterial({color: 0xfeff11});
        var right_arm_material = new THREE.MeshLambertMaterial({color: 0xfeff11});
        //var left_eye_material  = new THREE.MeshLambertMaterial({color: 0x000000});
        //var right_eye_material = new THREE.MeshLambertMaterial({color: 0x000000});
        //var nose_material = new THREE.MeshLambertMaterial({color: 0x000000});
        
        var body      = new THREE.Mesh( body_geometry, body_material);
        //var neck      = new THREE.Mesh( neck_geometry, neck_material);
        var head      = new THREE.Mesh( head_geometry, head_material);
        var left_leg  = new THREE.Mesh( left_leg_geometry, left_leg_material);
        var right_leg = new THREE.Mesh( right_leg_geometry, right_leg_material);
        var left_arm  = new THREE.Mesh( left_arm_geometry, left_arm_material);
        var right_arm = new THREE.Mesh( right_arm_geometry, right_arm_material);
        //var left_eye  = new THREE.Mesh(left_eye_geometry, left_eye_material);
        //var right_eye = new THREE.Mesh(right_eye_geometry, right_eye_material);
        //var nose      = new THREE.Mesh(nose_geometry, nose_material); 

        zombie_1[body_Id]      = body;
        //zombie_1[neck_Id]      = neck;
        zombie_1[head_Id]      = head;
        zombie_1[left_leg_Id]  = left_leg;
        zombie_1[right_leg_Id] = right_leg;
        zombie_1[left_arm_Id]  = left_arm;
        zombie_1[right_arm_Id] = right_arm;
        //zombie_1[left_eye_Id]  = left_eye;
        //zombie_1[right_eye_Id] = right_eye;
        //zombie_1[nose_Id]      = nose;
        /*
        scene.add(body);
        scene.add(neck);
        scene.add(head);
        scene.add(left_leg);
        scene.add(right_leg);
        scene.add(left_arm);
        scene.add(right_arm);
        */
        for ( var i = 0; i < numNodes; i++)
            scene.add(zombie_1[i]);
        
        //___________________HIERACHICAL OBJECT_________________
        //Parent.attach(son): method that joints parent and son
        //Parent.detach(son): method that disjoints parent and son

        //body.attach(neck);
        body.attach(head);
        body.attach(left_leg);
        body.attach(right_leg);
        body.attach(left_arm);
        body.attach(right_arm);
        //head.attach(left_eye);
        //head.attach(right_eye);
        //head.attach(nose);
        
        body.position.set(0, 1.5, 0);
        //neck.position.set(0, 0.3, 0);
        head.position.set(0, 0.4, 0);
        left_leg.position.set(-0.3, -0.02, 0);
        right_leg.position.set(0.3, -0.02, 0);
        left_arm.position.set(-0.1, -0.6, 0);
        right_arm.position.set(0.1, -0.6, 0);
        //left_eye.position.set(-0.1, 0, -0.15);
        //right_eye.position.set(0.1, 0, -0.15);
        //nose.position.set(0, -0.04, -0.15)


        //body.updateMatrixWorld();
        
        
        

        
    //}
    
    var distance = 1;
    clock = new THREE.Clock();
    controls = new THREE.FirstPersonControls(camera);
    document.addEventListener('click', function() {
        if (distance > 0) {
            controls.lock();
        }
        overlay_off();
    }, false);
    document.addEventListener('pointerlockchange', function() {
        //controls.unlock();
        if (document.pointerLockElement == null && distance > 0) {
            overlay_on();
        }
    }, false);
    controls.movementSpeed = MOVESPEED;
    controls.lookSpeed = LOOKSPEED;
    controls.lookVertical = false; // Temporary solution; play on flat surfaces only
    controls.noFly = true;

    // Track mouse position so we know where to shoot
    document.addEventListener('mousemove', onDocumentMouseMove, false);

    // Set the date we're counting down to
    var date = new Date().getTime();
    var countDownDate = date + DURATIONTIME;

    // Update the count down every 1 second
    var x = setInterval(function() {
        tempo -= 1;
        // Get the "now" date
        var now1 = new Date().getTime();

        if (overlayIsOn) {
            countDownDate += 1000;
        }

        // Find the distance between now an the count down date
        distance = countDownDate - now1;

        var sec = Math.floor(distance / 1000);
        document.getElementById("time").innerHTML = "<span style='font-family: Impact; font-size: 15px; color:#00FF00'>  Remaining time: " + sec + " sec" + "&nbsp&nbsp&nbsp Score: " + pun + "</span>";

        // If the count down is finished, write some text
        if (distance < 0) {
            overlay_off();
            document.exitPointerLock();
            document.removeEventListener('click', function() {
                controls.lock();
            }, false);
            clearInterval(x);
            document.getElementById("time").innerHTML = "<br /><span style='font-family: Impact; font-size: 60px; color:#00FF00'>&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp <h1>TIME OUT!</h1></span>";
            document.getElementById("ris").innerHTML = "<span style='font-family: Impact; font-size: 60px; color:#00FF00'><h1> Score:  " + pun + "</span>" + "<br /><span style='font-family: Impact; font-size: 60px; color:#00FF00'>" + "<a href='index.html'> Restart</a>" + "</h1></span>";
            $(renderer.domElement).fadeOut();
        }
    }, 1000);

    animate();
}


function onResourcesLoaded() {
    //_________________________________CITY SETTINGS____________________________
    //meshes["city"] = models.city.mesh.clone();
    ///meshes["city"].position.set(-5, 10, 4);
    //scene.add(meshes["city"]);
    //_________________________________WEAPON SETTINGS_________________________
    meshes["playerweapon"] = models.uzi.mesh.clone();
    meshes["playerweapon"].position.set(0, 2, 0);
    meshes["playerweapon"].scale.set(10, 10, 10);
    scene.add(meshes["playerweapon"]);
    overlay_on();
}

function animate() {

    window.addEventListener('resize', onWindowResize, false);

    var time = Date.now() * 0.0005;
    var delta = clock.getDelta(),
        speed = delta * BULLETMOVESPEED;
    var aispeed = delta * MOVESPEED * 0.1;

    // Play the loading screen until resources are loaded.
    if (RESOURCES_LOADED == false) {
        requestAnimationFrame(animate);

        loadingScreen.box.position.x -= 0.05;
        if (loadingScreen.box.position.x < -10) loadingScreen.box.position.x = 10;
        loadingScreen.box.position.y = Math.sin(loadingScreen.box.position.x);

        renderer.render(loadingScreen.scene, loadingScreen.camera);
        return;
    }

    requestAnimationFrame(animate);

    castRays();

    // SHOOT BULLET
    for (var index = 0; index < bullets.length; index += 1) {
        if (bullets[index] === undefined) continue;
        if (bullets[index].alive == false) {
            bullets.splice(index, 1);
            continue;
        }

        bullets[index].position.add(bullets[index].velocity);
    }

    //________________________________WEAPON ZOOM___________________________
    var handGunRightPos = Math.PI / 6;
    var bulletRightPos = 0.5;
    if (meshes["playerweapon"] != undefined) {
        if (controls.zoom) {
            handGunRightPos = 0;
            meshes["playerweapon"].scale.set(11.5, 11.5, 11.5);
            bulletRightPos = 0;
        } else {
            handGunRightPos = Math.PI / 6;
            meshes["playerweapon"].scale.set(10, 10, 10);
            bulletRightPos = 0.5;
        }
    }

    var camerarotation_y;
    if (camera.rotation.z == 0)
        camerarotation_y = Math.PI - camera.rotation.y;
    else
        camerarotation_y = camera.rotation.y;

    //__________________________________________BULLET CREATION_____________________________________________
    if (controls.shoot && canShoot <= 0 && !overlayIsOn) {
        // creates a bullet as a Mesh object
        var bullet = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), new THREE.MeshBasicMaterial({
            color: 0xAF9B60
        }));
        // must change to weapon position later
        bullet.position.set(meshes["playerweapon"].position.x /*- bulletRightPos*/, meshes["playerweapon"].position.y + 0.15, meshes["playerweapon"].position.z);
        // set the velocity of the bullet
        bullet.velocity = new THREE.Vector3(-Math.sin(camerarotation_y), 0, Math.cos(camerarotation_y)).normalize();
        bullet.alive = true;
        setTimeout(function() {
            bullet.alive = false;
            scene.remove(bullet);
        }, 1000);
        // add to scene, array, and set the delay to 10 frames
        bullets.push(bullet);
        scene.add(bullet);
        canShoot = 10;
    }
    if (canShoot > 0) canShoot -= 1;

    if (!overlayIsOn)
        controls.update(clock.getDelta()); // only if control is FirstPersonControls

    // Set gun in front of camera
    meshes["playerweapon"].position.set(
        camera.position.x - Math.sin(camerarotation_y + handGunRightPos) * 0.75,
        camera.position.y - 0.3 + Math.sin(time * 4 + camera.position.x + camera.position.z) * 0.01,
        camera.position.z + Math.cos(camerarotation_y + handGunRightPos) * 0.75);
    meshes["playerweapon"].rotation.set(camera.rotation.x, camera.rotation.y - Math.PI, camera.rotation.z);
    renderer.render(scene, camera);

    //console.log(body.position.z);
    /*
    if ( zombie_1[body_Id].position.z < 50){
        if ( zombie_1[left_leg_Id].rotation.z < 0.5){
            zombie_1[right_leg_Id].rotation.z += 0.02;   
            zombie_1[left_leg_Id].rotation.z += 0.02;
        }else{
            zombie_1[right_leg_Id].rotation.z -= 0.02;   
            zombie_1[left_leg_Id].rotation.z -= 0.02;
        }
        zombie_1[body_Id].position.z += 0.03;
    }*/
    
}

/*
function castRays() {
    var direction = new THREE.Vector3(1000, 5500, 1000);
    var startPoint = camera.position.clone();
    var directionVector = direction.sub(startPoint);
    var ray = new THREE.Raycaster(startPoint, directionVector.clone().normalize());
    scene.updateMatrixWorld(); // required, since you haven't rendered yet
    var rayIntersects = ray.intersectObjects(scene.children, true);
    if (rayIntersects.length > 0) {
        camera.position.z = camera.position.z - 0.2;
        camera.position.x = camera.position.x - 0.2;
    }
}*/
/*
function castRays(){
    //var starting_position = camera.position.clone(); 
    var raycaster = new THREE.Raycaster();
    
    window.addEventListener('onDocumentMouseMove', onDocumentMouseMove, false);
    
    raycaster.setFromCamera( mouse, camera );

    var intersects = raycaster.intersectObjects(scene.children, true);
    if ( intersects.length > 0 ){
        //console.log(intersects[0].object.position.distanceTo(camera.position));
        if ( intersects[0].object.position.distanceTo(camera.position) < 3.5 ){

            //intersects[0].object.material.color.set(0xff0000);
            camera.position.z = camera.position.z - 0.2;
            camera.position.x = camera.position.x - 0.2;    
        }
    }
}*/

function castRays(){
    window.addEventListener('onDocumentMouseMove', onDocumentMouseMove, false);
    
    var direction = new THREE.Vector3(1000, 5000, 1000);
    var starting_position = camera.position.clone();
    var directionVector = direction.sub(starting_position);

    var raycaster = new THREE.Raycaster( starting_position, directionVector.clone().normalize() );
    //raycaster.setFromCamera(mouse, camera);
    scene.updateMatrixWorld();

    var intersects = raycaster.intersectObjects(scene.children, true);
    if ( intersects.length > 0 ){
        //console.log(intersects[0].object.position.distanceTo(camera.position));{

            //intersects[0].object.material.color.set(0xff0000);
            camera.position.z = camera.position.z - 0.2;
            camera.position.x = camera.position.x - 0.2;    
    }
    
}

function onDocumentMouseMove(event) {
    event.preventDefault();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
}

function keyDown(event) {
    keyboard[event.keyCode] = true;
}

function keyUp(event) {
    keyboard[event.keyCode] = false;
}

window.addEventListener('keydown', keyDown);
window.addEventListener('keyup', keyUp);
